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

// ============================================================================================
// U-5a — PURE yhat producer `fromRealizedBook` (Ukemi liquidation-eligible-coverage, decision 123/132; G0
// §2/§3; checkpoint-1 C-1). A no-I/O RE-IMPLEMENTATION of the PER-ACCOUNT close-factor yhat rule frozen in
// `scripts/census/u4b/u4b-scores.mjs` (sha 2f9a31f6…, one of the 9 untouchable). It is NOT imported (that
// module reads node:fs + apps/sentinel — a K-8 break here) but RE-DECLARED by value and proven EQUAL to the
// frozen module by the equality oracles (Oracle A on the 565 committed `score_a` rows; Oracle B on the frozen
// module LIVE over all 16 096 accounts — apps/sentinel/test, export-excluded).
//
// It emits `{yhat, m_bps, pstar}` ONLY (C-1): the stratum is derived DOWNSTREAM by the harness `ukemi-strata`
// (no third copy of `strateOf`/STRATA_CUTS here), and the K-1 envelope (Prediction + provenance + label) is
// built by the `ukemi-predict` tool. `yhat` is an EXACT bigint (base 8-dec); the tool converts it to a safe
// JSON number fail-closed. NO `node:crypto`: the `book_digest` is an ECHO carried by the caller (a mono-account
// slice cannot recompute the whole-book digest, and K-8 forbids it anyway), never recomputed here.
// ============================================================================================

/** One reserve of the realized book slice (all string base amounts, exactly as the u4b book carries them). */
export interface RealizedReserve {
  readonly asset: string;
  readonly atoken: string;
  readonly variable_debt_token: string;
  readonly decimals: string;
  readonly liquidation_threshold_bps: string;
  readonly liquidation_bonus_bps: string;
  readonly reserve_emode_category: string;
  readonly price_base_8dec: string;
}

/** One (token, amount) balance of the account (aWETH collateral + every variable-debt token, u4b book form). */
export interface RealizedBalance {
  readonly token: string;
  readonly amount: string;
}

/** The single account of a mono-account slice (exactly one per prediction; the tool enforces length === 1). */
export interface RealizedAccount {
  readonly address: string;
  readonly emode: string;
  readonly balances: readonly RealizedBalance[];
  readonly total_collateral_base: string;
  readonly total_debt_base: string;
  readonly current_liquidation_threshold_bps: string;
  readonly hf_onchain: string;
}

/** The computation input: ALL reserves (never pruned — Q-U5-6) + exactly one account. */
export interface RealizedBookSlice {
  readonly reserves: readonly RealizedReserve[];
  readonly account: RealizedAccount;
}

/** One oracle-path update (block, log_index for the canonical order, price base 8-dec). */
export interface RealizedOracleUpdate {
  readonly block: number;
  readonly log_index?: number;
  readonly price: string;
}

/** The oracle path + decoded e-mode params — the SAME data the frozen runner passes as `oracle` (u4b-scores
 *  runner: anchor.price -> anchor_price, meta.emode_params -> emode_params, update lines -> updates). */
export interface RealizedOracleParams {
  readonly anchor_price: string;
  readonly updates: readonly RealizedOracleUpdate[];
  readonly emode_params: Readonly<Record<string, { readonly lt: string; readonly bonus: string }>>;
}

/**
 * Named, fail-closed refusals — the PER-ACCOUNT non-evaluable branches of the frozen scorer, surfaced (never a
 * silent estimate). `weth_reserve_absent`/`anchor_not_positive` mirror the frozen fail-closed THROWS (a slice
 * missing WETH or with a non-positive anchor); `no_collateral`/`non_mono_weth`/`emode_out_of_range`/
 * `emode_params_missing` mirror the per-account `ne` classifications; `unknown_balance_token` is the Q-U5-6
 * guard the FROZEN scorer does NOT have (it silently `continue`s an unknown token — correct only because the
 * full book carries every reserve): a non-zero balance token that is neither aWETH nor a CARRIED variable-debt
 * token means the caller pruned `reserves[]`, which would SILENTLY under-count yhat, so it fails closed.
 */
export type RealizedRefusalReason =
  | "weth_reserve_absent"
  | "anchor_not_positive"
  | "no_collateral"
  | "non_mono_weth"
  | "emode_out_of_range"
  | "emode_params_missing"
  | "unknown_balance_token";

/** An evaluable yhat point. `yhat` is an EXACT bigint (base 8-dec); m_bps/pstar are null only for no crossing. */
export interface RealizedYhatOk {
  readonly ok: true;
  readonly yhat: bigint;
  readonly m_bps: string | null;
  readonly pstar: string | null;
}
/** A named, fail-closed refusal (no yhat emitted). */
export interface RealizedYhatError {
  readonly ok: false;
  readonly reason: RealizedRefusalReason;
  readonly message: string;
}
/** The yhat result: an evaluable point or a named refusal (discriminated on `ok`). */
export type RealizedYhat = RealizedYhatOk | RealizedYhatError;

/** True iff a `fromRealizedBook` result is the refusal branch (narrows the union). */
export function isRealizedError(r: RealizedYhat): r is RealizedYhatError {
  return r.ok === false;
}

// ── Frozen v3.5.0 constants (u4b-scores.mjs:39-48, RE-DECLARED by value; pinned by the equality oracles). ──
const R_WAD = 10n ** 18n;
const R_MAXU = 2n ** 256n - 1n;
const R_WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const R_T = 2000n * 10n ** 8n; // MIN_BASE_MAX_CLOSE_FACTOR_THRESHOLD = 2000e8
const R_HF95 = 95n * 10n ** 16n; // CLOSE_FACTOR_HF_THRESHOLD = 0.95e18
const R_CF_BPS = 5000n; // DEFAULT_LIQUIDATION_CLOSE_FACTOR = 0.5e4
const rlc = (s: string): string => s.toLowerCase();

/** PercentageMath.percentMul — half-up: (value·bps + 5000) / 1e4 (wadray.ts:21-23, re-declared, K-8). */
function rPercentMul(value: bigint, bps: bigint): bigint {
  return (value * bps + 5000n) / 10000n;
}

function refuse(reason: RealizedRefusalReason, message: string): RealizedYhat {
  return { ok: false, reason, message };
}

/**
 * The PER-ACCOUNT close-factor yhat (base 8-dec), at the per-account FIRST CROSSING p*, by the frozen v3.5.0
 * rule (u4b-scores.mjs:88-225). PURE: a deterministic function of its typed arguments, no I/O, no clock, no
 * crypto. Emits `{yhat, m_bps, pstar}` (C-1) — the stratum and the K-1 envelope are built by the caller. yhat =
 * max over the account's debt reserves of min(CF_base, C_weth/m); WETH legs repriced at p*, non-WETH legs held
 * at p0; e-mode fail-closed to {0, WETH-category}. A crossed account with every D_r floored to 0 yields yhat=0
 * WITH p-star and m set (a legitimate prediction, Q-U5-7); no crossing yields yhat=0 with pstar/m_bps null.
 */
export function fromRealizedBook(book: RealizedBookSlice, params: RealizedOracleParams): RealizedYhat {
  const wr = book.reserves.find((r) => rlc(r.asset) === R_WETH);
  if (wr === undefined) return refuse("weth_reserve_absent", "WETH reserve absent from the book slice (fail-closed, u4b-scores.mjs:89)");
  const anchorPrice = BigInt(params.anchor_price);
  if (anchorPrice <= 0n) return refuse("anchor_not_positive", "oracle anchor_price must be > 0 (a zero/negative anchor degenerates the first-crossing traversal, C-G2-2)");

  const p0 = BigInt(wr.price_base_8dec);
  const aWeth = rlc(wr.atoken);
  const vWeth = rlc(wr.variable_debt_token);
  const wethBaseLT = BigInt(wr.liquidation_threshold_bps);
  const wethBaseBonus = BigInt(wr.liquidation_bonus_bps);
  const wethEmCat = BigInt(wr.reserve_emode_category);

  // Reserve map by variable-debt token over ALL carried reserves (Q-U5-6: never pruned).
  const resByV = new Map<string, { asset: string; price: bigint; dec: bigint }>();
  for (const r of book.reserves) {
    resByV.set(rlc(r.variable_debt_token), { asset: rlc(r.asset), price: BigInt(r.price_base_8dec), dec: BigInt(r.decimals) });
  }

  // Price path: pre-B0 anchor first, then the updates in (block, log_index) order.
  const upd = params.updates.slice().sort((a, b) => a.block - b.block || (a.log_index ?? 0) - (b.log_index ?? 0));
  const path: bigint[] = [anchorPrice, ...upd.map((u) => BigInt(u.price))];

  const a = book.account;
  const emode = BigInt(a.emode);
  const totalColl0 = BigInt(a.total_collateral_base);
  const totalDebt0 = BigInt(a.total_debt_base);
  const avgLT = BigInt(a.current_liquidation_threshold_bps);
  const hf0 = BigInt(a.hf_onchain);
  const balOf = (tok: string): bigint => {
    const x = a.balances.find((z) => rlc(z.token) === tok);
    return x !== undefined ? BigInt(x.amount) : 0n;
  };
  const aWethBal = balOf(aWeth);
  const vWethBal = balOf(vWeth);
  const wethColl0 = (aWethBal * p0) / R_WAD;
  const wethDebt0 = (vWethBal * p0) / R_WAD;

  // Mono-collateral WETH, X = 0 EXACT (u4b-scores.mjs:145-150).
  if (aWethBal === 0n) return refuse("no_collateral", "account holds no aWETH collateral (no_aweth, u4b-scores.mjs:148)");
  const residual = totalColl0 - wethColl0;
  if (residual !== 0n) return refuse("non_mono_weth", "account is not mono-collateral WETH (total_collateral_base != aWETH*p0/1e18, u4b-scores.mjs:150)");

  // e-mode fail-closed to {0, WETH-category} (u4b-scores.mjs:155-161).
  let ltWeth: bigint;
  let bonusWeth: bigint;
  if (emode === 0n) {
    ltWeth = wethBaseLT;
    bonusWeth = wethBaseBonus;
  } else if (emode === wethEmCat) {
    const e = params.emode_params[a.emode];
    if (e === undefined) return refuse("emode_params_missing", `WETH e-mode category ${a.emode} params missing from emode_params (fail-closed, u4b-scores.mjs:159)`);
    ltWeth = BigInt(e.lt);
    bonusWeth = BigInt(e.bonus);
  } else {
    return refuse("emode_out_of_range", `e-mode ${a.emode} is outside {0, WETH-category ${wr.reserve_emode_category}} (non_evaluable_emode, u4b-scores.mjs:161)`);
  }

  // Q-U5-6 guard the frozen scorer LACKS: a non-zero balance token that is neither aWETH nor a carried
  // variable-debt token means `reserves[]` was pruned ⇒ the frozen `continue` would SILENTLY under-count yhat.
  // Fail closed. On the FULL book this never fires (the book carries every reserve) — proven by the oracles.
  for (const bal of a.balances) {
    if (BigInt(bal.amount) === 0n) continue;
    const t = rlc(bal.token);
    if (t !== aWeth && !resByV.has(t)) {
      return refuse("unknown_balance_token", `balance token ${t} (amount > 0) is neither aWETH nor a carried variable-debt token — reserves[] is pruned; refuse rather than under-count yhat (Q-U5-6)`);
    }
  }

  const riskAdj0 = rPercentMul(totalColl0, avgLT);
  const hfAt = (p: bigint): bigint => {
    const wc = (aWethBal * p) / R_WAD;
    const wd = (vWethBal * p) / R_WAD;
    const ra = riskAdj0 - rPercentMul(wethColl0, ltWeth) + rPercentMul(wc, ltWeth);
    const td = totalDebt0 - wethDebt0 + wd;
    if (td <= 0n) return R_MAXU;
    if (riskAdj0 <= 0n) return 0n;
    return (hf0 * (ra < 0n ? 0n : ra) * totalDebt0) / (riskAdj0 * td);
  };

  // First crossing along the path (anchor first).
  let pStar: bigint | null = null;
  let hfStar = 0n;
  for (const p of path) {
    const hf = hfAt(p);
    if (hf < R_WAD) {
      pStar = p;
      hfStar = hf;
      break;
    }
  }
  if (pStar === null) return { ok: true, yhat: 0n, m_bps: null, pstar: null };

  const C_weth = (aWethBal * pStar) / R_WAD;
  const CA = (C_weth * 10000n) / bonusWeth; // collateral-availability cap C_weth / m, m = bonus/1e4
  const wethDebtStar = (vWethBal * pStar) / R_WAD;
  const D_tot = totalDebt0 - wethDebt0 + wethDebtStar;
  const halfDtot = rPercentMul(D_tot, R_CF_BPS);

  // yhat = max over debt reserves of min(CF_base, C_weth/m). One call liquidates ONE pair (MAX, never sum).
  let yhat = 0n;
  for (const bal of a.balances) {
    const r = resByV.get(rlc(bal.token));
    if (r === undefined) continue; // aWETH (collateral): not a debt leg.
    const amt = BigInt(bal.amount);
    if (amt === 0n) continue;
    const isWeth = r.asset === R_WETH;
    const priceR = isWeth ? pStar : r.price; // non-WETH legs held at p0; WETH leg repriced at p*.
    const D_r = (amt * priceR) / 10n ** r.dec;
    if (D_r === 0n) continue;
    const gate = C_weth >= R_T && D_r >= R_T && hfStar > R_HF95;
    const CF = gate ? (D_r < halfDtot ? D_r : halfDtot) : D_r;
    const yb = CF < CA ? CF : CA;
    if (yb > yhat) yhat = yb;
  }

  return { ok: true, yhat, m_bps: bonusWeth.toString(), pstar: pStar.toString() };
}
