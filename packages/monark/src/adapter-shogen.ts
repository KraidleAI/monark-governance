// packages/monark/src/adapter-shogen.ts — the Shogen -> AttestedPrice adapter (ADR-M003 D10 "Lot I",
// ADR-M001 Decision 3, ADR-M005 D3). Composes THREE existing Shogen artifacts into the frozen
// `AttestedPrice` contract, then wraps it in the K-1 envelope (label + provenance live OUTSIDE the
// frozen, additionalProperties:false contract). Pure, our own code, no npm dependency.
//
//   (1) Temoignage  <- the canonical CBOR batch, decoded by ./cbor-canonique.ts (Lot I-a).
//   (2) Verdict     <- reconstructed from the Shogen verifier's stdout (the committed
//                      fixtures/s3-binance.verdict.txt), parsed line-by-line, fail-closed.
//   (3) Constat     <- the companion JSON (fixtures/s3-binance.constat.json), read for the
//                      emitted-meaning digest.
//
// The frozen mapping (ADR-M001 Decision 3 C2/C3, ADR-M003 D3):
//   subject/attestor/transport/utterance/observed_at <- Temoignage (the CBOR witness);
//   residual            <- Verdict.residus (emitted order, then the delegation residual; never aggregated);
//   octets_recalcules   <- Verdict.octets_recalcules;
//   verifier_revision   <- Verdict.revision_amont_deleguee;
//   sens_emis_digest    <- Constat.empreinte_du_sens_emis, which the Shogen verifier reads from the
//                          constat key `empreinte_sent_revele_sha256` (shogen-verifier/src/constat.rs:608);
//   schema_version      <- "1.0.0" (the contract constant, ADR-M001).
//
// PARSER discipline: the verifier output is French prose (a verbatim third-party artifact). This module
// keys on the verifier's French tokens (`valide`, `liaison`, `empreinte recalcul`, `octets non`), which
// are DIACRITIC-FREE ASCII and lang-exempt so lang-gate stays green, and REFUSES with a named,
// frozen COVERAGE_REASONS literal on any mismatch:
//   no VERDICT line            -> attestation_absent
//   VERDICT present, no accept  -> attestation_refused
//   malformed / missing field   -> binding_broken
//
// DEMONSTRATIVE (ADR-M005 D3 K-1): the only real witness is Binance BTCUSDT, self-notarized by Shogen,
// so every output carries the label "real, notary Shogen, demonstrative, not probative" on the envelope.
import { createHash } from "node:crypto";
import { decodeTemoignageCbor, CborError } from "./cbor-canonique.ts";
import type { Temoignage } from "./cbor-canonique.ts";
import { assertClosedAttestedPrice, assertNoForbiddenKey } from "@monark/contracts";
import type { AttestedPrice, CoverageReason } from "@monark/contracts";

/** The frozen contract version (ADR-M001) — a constant, never carried by the inputs. */
const SCHEMA_VERSION = "1.0.0";

/** The K-1 honesty label (ADR-M005 D3). Lives on the envelope, NEVER inside the frozen contract. */
export const DEMONSTRATIVE_LABEL = "real, notary Shōgen, demonstrative, not probative";

/**
 * The Shogen source HEAD the committed `s3-binance.*` fixtures were extracted from
 * (fixtures/PROVENANCE-s3-binance.md l.23). The two content digests below bind the ACTUAL inputs;
 * this names the demonstrative fixtures' origin revision.
 */
export const SHOGEN_HEAD_SHA = "5b6469ae9999212a0db5d2fea0a169ff5d183a95";

/** The constat key carrying the emitted-meaning digest (shogen-verifier/src/constat.rs:608). */
const CONSTAT_SENS_EMIS_KEY = "empreinte_sent_revele_sha256";

/** Reasons the adapter can refuse — the frozen COVERAGE_REASONS literals ONLY (ADR-M003 D3). */
export type AdapterErrorReason = Extract<
  CoverageReason,
  "attestation_absent" | "attestation_refused" | "binding_broken"
>;

/** Provenance of one adapted output (K-1) — the two content digests are recomputed from the inputs. */
export interface AdapterProvenance {
  readonly source_lot_sha256: string;
  readonly source_verdict_sha256: string;
  readonly shogen_head_sha: string;
}

/** The K-1 envelope: only `price` is a frozen contract; `provenance`/`label` live OUTSIDE it. */
export interface AdapterOutput {
  readonly price: AttestedPrice;
  readonly provenance: AdapterProvenance;
  readonly label: string;
}

/** A named, fail-closed refusal. Never a default, never a partial `AttestedPrice`. */
export interface AdapterError {
  readonly error: true;
  readonly reason: AdapterErrorReason;
  readonly message: string;
}

/** True iff a `fromShogen` result (or any intermediate) is the refusal branch. */
export function isAdapterError(x: unknown): x is AdapterError {
  return typeof x === "object" && x !== null && (x as { error?: unknown }).error === true;
}

function fail(reason: AdapterErrorReason, message: string): AdapterError {
  return { error: true, reason, message };
}

// ---------------------------------------------------------------------------- digests / hex

function sha256HexBytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}
function sha256HexUtf8(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}
function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

// ---------------------------------------------------------------------------- verdict parser

/** The fields of the Shogen `Verdict` reconstructed from the verifier stdout (ADR-M003 D3). */
interface ParsedVerdict {
  readonly octets_recalcules: boolean;
  readonly residus: readonly string[];
  readonly revision_amont_deleguee: string;
}

/** A 40-hex git object id, bounded by non-hex — the sole such token the verifier prints (the revision). */
const GIT_OID = /(?<![0-9a-f])[0-9a-f]{40}(?![0-9a-f])/g;

/**
 * Reconstructs the `Verdict` from the verifier stdout, fail-closed, keying only on ASCII anchors:
 *   - the accept line carries the accept marker "valide" then a connective word then the residuals
 *     (a refusal line carries no "valide"); the line's ABSENCE = the verdict is absent;
 *   - `octets_recalcules` is read off the utterance-binding line ("empreinte recalcul..." = recomputed
 *     over carried bytes, ADR-0005 rule 1; "octets non..." = bytes not carried, rule 2);
 *   - `revision_amont_deleguee` is the unique 40-hex object id the verifier prints for the delegated
 *     upstream check.
 */
function parseVerdict(verdictText: string): ParsedVerdict | AdapterError {
  const lines = verdictText.split(/\r?\n/);

  // (1) The VERDICT line: absent -> attestation_absent; present-without-accept -> attestation_refused.
  const verdictLine = lines.find((l) => l.trimStart().startsWith("VERDICT"));
  if (verdictLine === undefined) {
    return fail("attestation_absent", "no VERDICT line in the verifier output");
  }
  // ACCEPT marker anchored as the FIRST token after "VERDICT :" with a word boundary (R2, G2 I-b):
  // a substring test would fail-OPEN on the NEGATION — "VERDICT : invalide"/"non valide" contain
  // "valide" — and emit a price. `\bvalide\b` right after the colon rejects both.
  const ACCEPT = /^\s*VERDICT\s*:\s*valide\b/;
  if (!ACCEPT.test(verdictLine)) {
    return fail("attestation_refused", "the verifier did not accept the batch (no 'valide' verdict)");
  }

  // residus: the assumption ids after the single connective word following the "valide" marker,
  // comma-separated, in emitted order, never aggregated into one level (D3).
  const afterAccept = verdictLine.slice(verdictLine.indexOf("valide") + "valide".length);
  const residus = afterAccept
    .replace(/^\s*\S+\s+/, "") // drop the lone connective word between the accept marker and the list
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (residus.length === 0) {
    return fail("binding_broken", "the valid verdict names no residual assumption");
  }
  if (new Set(residus).size !== residus.length) {
    return fail("binding_broken", "the verdict names a duplicate residual assumption");
  }

  // (2) octets_recalcules: the utterance-binding line.
  const bindingLine = lines.find((l) => l.includes("liaison") && l.includes("utterance"));
  if (bindingLine === undefined) {
    return fail("binding_broken", "no utterance-binding line in the verifier output");
  }
  let octets_recalcules: boolean;
  if (bindingLine.includes("empreinte recalcul")) {
    octets_recalcules = true;
  } else if (bindingLine.includes("octets non")) {
    octets_recalcules = false;
  } else {
    return fail("binding_broken", "unrecognized utterance-binding line");
  }

  // (3) revision_amont_deleguee: the unique 40-hex object id across the output.
  const oids = new Set<string>();
  for (const l of lines) {
    GIT_OID.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = GIT_OID.exec(l)) !== null) {
      const hit = m[0];
      if (hit !== undefined) oids.add(hit);
    }
  }
  if (oids.size !== 1) {
    return fail("binding_broken", `expected exactly one 40-hex upstream revision, found ${String(oids.size)}`);
  }
  const revision_amont_deleguee = [...oids][0];
  if (revision_amont_deleguee === undefined) {
    return fail("binding_broken", "no upstream revision in the verifier output");
  }

  return { octets_recalcules, residus, revision_amont_deleguee };
}

// ---------------------------------------------------------------------------- constat

/** Reads the emitted-meaning digest from the Constat. Absent -> omit (the field is optional). */
function readSensEmisDigest(constat: unknown): { value?: string } | AdapterError {
  if (constat === null || typeof constat !== "object" || Array.isArray(constat)) {
    return fail("binding_broken", "constat is not a JSON object");
  }
  const raw = (constat as Record<string, unknown>)[CONSTAT_SENS_EMIS_KEY];
  if (raw === undefined) return {}; // optional field (schema): omit sens_emis_digest
  if (typeof raw !== "string" || !/^[0-9a-f]{64}$/.test(raw)) {
    return fail("binding_broken", `constat.${CONSTAT_SENS_EMIS_KEY} is not a 64-hex digest`);
  }
  return { value: raw };
}

// ---------------------------------------------------------------------------- adapter

/**
 * Projects a VERIFIED Shogen testimony `(Temoignage, Verdict, Constat)` into the frozen `AttestedPrice`,
 * wrapped in the K-1 envelope. Pure. Returns a named `AdapterError` on any non-conforming input.
 */
export function fromShogen(lot: Uint8Array, verdictText: string, constat: unknown): AdapterOutput | AdapterError {
  // (1) Decode the CBOR witness — any structural deviation is a named CborError -> binding_broken.
  let t: Temoignage;
  try {
    t = decodeTemoignageCbor(lot);
  } catch (e) {
    if (e instanceof CborError) return fail("binding_broken", `lot decode failed: ${e.message}`);
    throw e; // never swallow an unexpected fault
  }

  // (2) Reconstruct the Verdict from the verifier stdout.
  const verdict = parseVerdict(verdictText);
  if (isAdapterError(verdict)) return verdict;

  // (3) The Constat's emitted-meaning digest (optional).
  const sens = readSensEmisDigest(constat);
  if (isAdapterError(sens)) return sens;

  // (4) observed_at.instant is a u64 on the wire; guard the JS-number narrowing (fail-closed).
  if (t.observed_at.instant > BigInt(Number.MAX_SAFE_INTEGER)) {
    return fail("binding_broken", "observed_at.instant exceeds the safe integer range");
  }
  const instant = Number(t.observed_at.instant);

  // (5) The frozen mapping (ADR-M001 Decision 3 / ADR-M003 D3).
  const price: AttestedPrice = {
    schema_version: SCHEMA_VERSION,
    subject: t.subject,
    attestor: t.attestor.map((a) => ({ identity: a.identity, key: toHex(a.key) })),
    residual: [...verdict.residus],
    transport: t.transport,
    utterance:
      t.utterance.bytes === undefined
        ? { hash: toHex(t.utterance.hash) }
        : { hash: toHex(t.utterance.hash), bytes: toHex(t.utterance.bytes) },
    observed_at: { clock: t.observed_at.clock, instant },
    octets_recalcules: verdict.octets_recalcules,
    verifier_revision: verdict.revision_amont_deleguee,
    ...(sens.value !== undefined ? { sens_emis_digest: sens.value } : {}),
  };

  // (6) Fail-closed on the frozen contract: ONLY `price` must pass (label/provenance are outside it, K-1).
  try {
    assertClosedAttestedPrice(price);
    assertNoForbiddenKey(price);
  } catch (e) {
    return fail("binding_broken", `mapped price is not a closed AttestedPrice: ${(e as Error).message}`);
  }

  // (7) The K-1 envelope: content digests bound to the inputs, the source revision named, the label.
  return {
    price,
    provenance: {
      source_lot_sha256: sha256HexBytes(lot),
      source_verdict_sha256: sha256HexUtf8(verdictText),
      shogen_head_sha: SHOGEN_HEAD_SHA,
    },
    label: DEMONSTRATIVE_LABEL,
  };
}
