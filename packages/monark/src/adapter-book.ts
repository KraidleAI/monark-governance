// packages/monark/src/adapter-book.ts — the Ukemi AttestedBook adapter (ADR-U1b D5), a PAIR:
//   - CONSUMER `fromAttestedBook(json)`: a PURE, fail-closed decoder of a serialized AttestedBook. It NEVER
//     repairs its input; a non-conforming envelope is a NAMED refusal (`BookError`), never a partial book.
//     It returns the closed book plus a K-1 envelope (`provenance`, `label`) that lives OUTSIDE the frozen
//     contract (motif adapter-narabi.ts:103-108). NO forecast object: none of the 17 AttestedBook keys carries
//     a per-position forecast; that mapping is U-4 (ADR-U1b D5, C-2).
//   - PRODUCER `toAttestedBook(result, ctx)`: a PURE builder of the frozen contract from the Ukemi recorder's
//     RecordResult plus the keyless-quorum envelope context (ADR-U1b D7 line 1, C-3). It reads the recorder
//     output STRUCTURALLY, so it imports NOTHING from apps/* (apps/sentinel already depends on @monark/monark;
//     importing back would be a cycle — ADR-U1b C-1). The serialized output is closed by `serializeAttestedBook`.
//
// K-8: this module lives in packages/monark/src (NOT apps/harness/src/tools). It reads NO network / fs / env /
// clock: both functions are pure transformations of their arguments.
import { createHash } from "node:crypto";
import {
  assertClosedAttestedBook,
  assertNoForbiddenKey,
  serializeAttestedBook,
  ATTESTED_BOOK_RESIDUALS,
  ATTESTED_BOOK_ABSTAIN_REASONS,
} from "@monark/contracts";
import type { AttestedBook, AttestedBookResidual, AttestedBookAbstainReason, CoverageReason } from "@monark/contracts";
import type { Canon } from "./book-canonical.ts";

/** The frozen contract version (ADR-M001) — a constant, never carried by the recorder output. */
const SCHEMA_VERSION = "1.0.0";

/** The K-1 honesty label (ADR-U1b D3). Lives on the envelope, NEVER inside the frozen contract. No probative token. */
export const BOOK_LABEL =
  "self-declared liquidation-book reading under keyless RPC quorum; no external attestor; a book is read under quorum, never scored";

/**
 * Reasons the adapter can refuse — a NON-attestation COMPUTATION fault ⇒ frozen COVERAGE_REASONS literals ONLY
 * (motif adapter-narabi.ts:91, ADR-U1b C-5). `binding_broken` = the envelope is not a conforming AttestedBook;
 * `non_evaluable` = the envelope is well-formed but the read did not reach a definitive book (D4 quorum invariant).
 */
export type BookAdapterErrorReason = Extract<CoverageReason, "binding_broken" | "non_evaluable">;

/** Provenance of one decoded book (K-1) — recomputable from the carried envelope. */
export interface BookProvenance {
  readonly source_book_sha256: string;
  readonly book_digest: string;
  readonly holders_digest: string;
  readonly block: number;
}

/** The K-1 envelope: only `book` is a frozen contract; `provenance`/`label` live OUTSIDE it. */
export interface BookOutput {
  readonly book: AttestedBook;
  readonly provenance: BookProvenance;
  readonly label: string;
}

/** A named, fail-closed refusal. Never a default, never a partial `AttestedBook`. */
export interface BookError {
  readonly error: true;
  readonly reason: BookAdapterErrorReason;
  readonly message: string;
}

/** True iff a `fromAttestedBook` result is the refusal branch. */
export function isBookError(x: unknown): x is BookError {
  return typeof x === "object" && x !== null && (x as { error?: unknown }).error === true;
}

function fail(reason: BookAdapterErrorReason, message: string): BookError {
  return { error: true, reason, message };
}

const DECIMAL = /^[0-9]+$/;
const ASCII_PRINTABLE = /^[ -~]+$/;

function sha256HexUtf8(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Decodes a serialized AttestedBook into the closed book plus a K-1 envelope. PURE, fail-closed. Order:
 * JSON.parse → assertClosedAttestedBook (unknown key ⇒ refuse, subsumes any smuggled forecast key, C-2) →
 * assertNoForbiddenKey → VALUE guards the closed-check cannot express. Guards that a mutated input must not
 * slip past are a CLOSED table by key (ADR-U1b C-4); alterations without an adapter guard are borne by the
 * schema (ajv, contracts tests), never claimed here.
 */
export function fromAttestedBook(json: string): BookOutput | BookError {
  // (1) Parse.
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return fail("binding_broken", `input is not valid JSON: ${(e as Error).message}`);
  }

  // (2) Closed contract + fleet forbidden-key guard (an unknown key — incl. any smuggled forecast key — refuses).
  try {
    assertClosedAttestedBook(parsed);
    assertNoForbiddenKey(parsed);
  } catch (e) {
    return fail("binding_broken", `input is not a closed AttestedBook: ${(e as Error).message}`);
  }
  const b = parsed as Record<string, unknown>;

  // (3) residual ⊂ closed enum AND carries no_third_party_verifier (ADR-U1b D2ter, C-4).
  const residual = b["residual"];
  if (!Array.isArray(residual)) return fail("binding_broken", "residual must be an array");
  for (const r of residual) {
    if (typeof r !== "string" || !(ATTESTED_BOOK_RESIDUALS as readonly string[]).includes(r)) {
      return fail("binding_broken", `residual '${String(r)}' is outside the closed enum (ADR-U1b D2ter)`);
    }
  }
  if (!residual.includes("no_third_party_verifier")) {
    return fail("binding_broken", "residual must carry 'no_third_party_verifier' (ADR-U1b D2ter, self-declared reading)");
  }

  // (4) eligible: n_positions integer >= 0 (O-1); debt_base/collateral_base decimal-string base amounts.
  const eligible = b["eligible"];
  if (!isObject(eligible)) return fail("binding_broken", "eligible must be an object");
  const nPositions = eligible["n_positions"];
  if (!Number.isInteger(nPositions) || (nPositions as number) < 0) {
    return fail("binding_broken", `eligible.n_positions must be an integer >= 0 (O-1), got ${String(nPositions)}`);
  }
  if (typeof eligible["debt_base"] !== "string" || !DECIMAL.test(eligible["debt_base"]) ||
      typeof eligible["collateral_base"] !== "string" || !DECIMAL.test(eligible["collateral_base"])) {
    return fail("binding_broken", "eligible.debt_base/collateral_base must be decimal-string base amounts");
  }

  // (5) abstain: reason in the closed enum (incl. null) AND the coupling value ⇔ reason≠null (ADR-U1b D4, C-1).
  const abstain = b["abstain"];
  if (!isObject(abstain) || typeof abstain["value"] !== "boolean") return fail("binding_broken", "abstain must be an object with a boolean value");
  const reason = abstain["reason"];
  if (!(ATTESTED_BOOK_ABSTAIN_REASONS as readonly (string | null)[]).includes(reason as string | null)) {
    return fail("binding_broken", `abstain.reason is outside the closed enum (ADR-U1b D4): ${String(reason)}`);
  }
  if ((abstain["value"] === true) !== (reason !== null)) {
    return fail("binding_broken", `abstain coupling broken: value=${String(abstain["value"])} with reason=${String(reason)} (ADR-U1b D4, C-1)`);
  }

  // (6) providers non-empty with non-empty names; quorum-by-method sanity: required <= distinct provider names,
  //     and (not abstained) ⇒ achieved >= required — else the read did not reach a book (ADR-U1b D4).
  const providers = b["providers"];
  if (!Array.isArray(providers) || providers.length === 0) return fail("binding_broken", "providers must be a non-empty array");
  const names = new Set<string>();
  for (const p of providers) {
    if (!isObject(p)) return fail("binding_broken", "each provider must be an object");
    if (typeof p["name"] !== "string" || p["name"].length === 0) return fail("binding_broken", "provider name must be a non-empty string");
    names.add(p["name"]);
  }
  const quorum = b["quorum"];
  if (!isObject(quorum)) return fail("binding_broken", "quorum must be an object");
  const required = quorum["required"];
  const achieved = quorum["achieved"];
  if (!Number.isInteger(required) || !Number.isInteger(achieved)) return fail("binding_broken", "quorum.required/achieved must be integers");
  if ((required as number) > names.size) {
    return fail("binding_broken", `quorum.required (${String(required)}) exceeds the ${String(names.size)} distinct provider(s) (ADR-U1b D4, quorum-by-method)`);
  }
  if (abstain["value"] === false && (achieved as number) < (required as number)) {
    return fail("non_evaluable", `not abstained yet quorum.achieved (${String(achieved)}) < required (${String(required)}) — the read did not reach quorum (ADR-U1b D4)`);
  }

  // (7) observed_at.clock is ASCII-printable (lineage, ADR-U1b D2bis).
  const observedAt = b["observed_at"];
  if (!isObject(observedAt) || typeof observedAt["clock"] !== "string" || !ASCII_PRINTABLE.test(observedAt["clock"])) {
    return fail("binding_broken", "observed_at.clock must be an ASCII-printable string (ADR-U1b D2bis)");
  }

  // (8) Fields the adapter itself dereferences below must exist and be typed — a NAMED refusal, never an
  //     uncaught throw (their FORMAT is schema-borne; here only presence/type for the envelope build).
  const block = b["block"];
  if (!isObject(block) || !Number.isInteger(block["number"])) return fail("binding_broken", "block.number must be an integer");
  if (typeof b["book_digest"] !== "string" || typeof b["holders_digest"] !== "string") {
    return fail("binding_broken", "book_digest and holders_digest must be strings");
  }

  // (9) The K-1 envelope: only `book` is the frozen contract; provenance recomputes its content digest.
  const book = parsed as AttestedBook;
  return {
    book,
    provenance: {
      source_book_sha256: sha256HexUtf8(serializeAttestedBook(book)),
      book_digest: book.book_digest,
      holders_digest: book.holders_digest,
      block: book.block.number,
    },
    label: BOOK_LABEL,
  };
}

/** The keyless-quorum envelope context the recorder supplies alongside its book (ADR-U1b D2/D8; NOT in RecordResult). */
export interface AttestedBookContext {
  readonly subject: string;
  readonly chain: string;
  readonly protocol: string;
  readonly attestor: AttestedBook["attestor"];
  readonly recorder_revision: string;
  readonly observed_at: AttestedBook["observed_at"];
  readonly quorum: AttestedBook["quorum"];
  readonly providers: AttestedBook["providers"];
  readonly residual: AttestedBookResidual[];
  readonly abstain: { value: boolean; reason: AttestedBookAbstainReason };
}

/** The subset of the Ukemi recorder's RecordResult the producer reads — STRUCTURAL, so no import from apps/* (no cycle). */
export interface RecordedBook {
  readonly book: Canon;
  readonly book_digest: string;
  readonly holders_digest: string;
  readonly counts: { readonly eligible: number };
  readonly timeline: { readonly cluster: string; readonly block: string; readonly block_hash: string };
}

function bookField(book: Canon, key: string): Canon {
  if (typeof book !== "object" || Array.isArray(book) || !(key in book)) {
    throw new Error(`toAttestedBook: recorder book is missing '${key}'`);
  }
  return book[key] as Canon;
}
function bookString(v: Canon, where: string): string {
  if (typeof v !== "string") throw new Error(`toAttestedBook: expected a string at ${where}`);
  return v;
}

/**
 * Builds the frozen AttestedBook from the Ukemi recorder's RecordResult + the keyless-quorum envelope context
 * (ADR-U1b C-3). PURE. The digests (`book_digest`, `holders_digest`) and the on-chain-derived fields
 * (block, oracle_sources, eligible) are copied VERBATIM from the recorder; `subject/chain/protocol/attestor/
 * recorder_revision/observed_at/quorum/providers/residual/abstain` ride in `ctx` (they are not in RecordResult).
 * The output is closed by `serializeAttestedBook` at the boundary (fleet motif).
 */
export function toAttestedBook(result: RecordedBook, ctx: AttestedBookContext): AttestedBook {
  const agg = bookField(result.book, "eligible_aggregate");
  const reservesRaw = bookField(result.book, "reserves");
  if (!Array.isArray(reservesRaw)) throw new Error("toAttestedBook: recorder book.reserves is not an array");
  const oracle_sources = reservesRaw.map((r) => ({
    asset: bookString(bookField(r, "asset"), "reserves[].asset"),
    source: bookString(bookField(r, "oracle_source"), "reserves[].oracle_source"),
    description: bookString(bookField(r, "oracle_description"), "reserves[].oracle_description"),
  }));
  return {
    schema_version: SCHEMA_VERSION,
    subject: ctx.subject,
    chain: ctx.chain,
    protocol: ctx.protocol,
    cluster: result.timeline.cluster,
    block: { number: Number(result.timeline.block), hash: result.timeline.block_hash },
    book_digest: result.book_digest,
    holders_digest: result.holders_digest,
    oracle_sources,
    eligible: {
      n_positions: result.counts.eligible,
      debt_base: bookString(bookField(agg, "total_debt_base"), "eligible_aggregate.total_debt_base"),
      collateral_base: bookString(bookField(agg, "total_collateral_base"), "eligible_aggregate.total_collateral_base"),
    },
    providers: ctx.providers,
    quorum: ctx.quorum,
    abstain: ctx.abstain,
    residual: ctx.residual,
    attestor: ctx.attestor,
    recorder_revision: ctx.recorder_revision,
    observed_at: ctx.observed_at,
  };
}
