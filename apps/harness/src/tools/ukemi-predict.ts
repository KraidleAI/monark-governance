/**
 * Harness — the `ukemi-predict` tool (Ukemi liquidation-eligible-coverage PRODUCER; decisions 51/123/132;
 * G0 §3; checkpoint-1 C-1/C-3/C-8).
 *
 * A PURE (K-8) wrapper over the real producer `fromRealizedBook` (`@monark/monark`, NEVER re-implemented
 * here): it takes a caller-carried mono-account ATTESTED BOOK SLICE + the decoded oracle path, recomputes the
 * per-account liquidable amount yhat by the FROZEN close-factor rule (Aave v3.5.0), and emits the K-1 envelope
 * `{prediction, provenance, label}`. `prediction` alone is the frozen `Prediction` contract; `provenance` and
 * `label` ride OUTSIDE it (motif attest.run / adapter-narabi). The `gate` tool consumes the `prediction`
 * downstream (producer -> gate -> region); at HEAD the liq registry is empty, so the gate abstains under_calib.
 *
 * NOT REGISTERED in U-5a (decisions 51/123: the endpoint keeps 4 tools). `ukemi-predict` replaces `cascade` in
 * U-5b (registration + route + 4->4 set + skill/MCP/README, same fusion). U-5a delivers the complete module +
 * schemas + oracles so -5b is a wiring change. The module is exercised by DIRECT calls (`runUkemiPredict`),
 * proven equal to `fromRealizedBook` on the same bytes (A-10) and gate-consumable.
 *
 * NO side effects (K-8): like everything under `src/tools/`, it imports no `node:fs`/`node:net`/
 * `node:child_process`, calls no `fetch`, writes no `process.env`, reads no clock, and does NO crypto — the
 * `book_digest` is an ECHO of the caller-carried digest (a mono-account slice cannot recompute the whole-book
 * digest, and K-8 forbids it), never recomputed and not re-verified here. `produced_at` is INJECTED via the input.
 */
import { fromRealizedBook, isRealizedError } from "@monark/monark";
import type { RealizedBookSlice, RealizedOracleParams, RealizedReserve, RealizedAccount, RealizedOracleUpdate } from "@monark/monark";
import { assertClosedPrediction, assertNoForbiddenKey } from "@monark/contracts";
import type { Prediction } from "@monark/contracts";
import { strateOf } from "../ukemi-strata.ts";
import { UKEMI_LIQ_PREDICTOR_BASE } from "../calibration.ts";
import { TASK_LIQ_ELIGIBLE } from "./gate.ts";

export const UKEMI_PREDICT_TOOL_NAME = "ukemi-predict";

/** The frozen contract version (ADR-M001) — a constant, never carried by the producer. */
const SCHEMA_VERSION = "1.0.0";

/** The ONLY close-factor protocol version this producer models (Aave v3.5.0). Any other value fails closed. */
export const UKEMI_PREDICT_CLOSE_FACTOR_VERSION = "3.5.0";

/** The frozen book / oracle schema tags the slice must carry (fail-closed on any other). */
export const UKEMI_BOOK_SCHEMA = "ukemi-book/1";
export const UKEMI_ORACLE_SCHEMA = "ukemi-u4b-oracle/1";

/**
 * Resource caps (deploy-hardening, motif CASCADE_MAX_NODES): the harness is a public compute surface, so the
 * caller-carried arrays are bounded. Real e2: 39 reserves, 140 updates, a handful of balances per account.
 * Single source here; `schema-projection.ts` reads these for the SDK-boundary `maxItems` (wired at -5b) and
 * `runUkemiPredict` re-checks below (belt-and-suspenders, the only enforcement while unregistered).
 */
export const UKEMI_PREDICT_MAX_RESERVES = 64;
export const UKEMI_PREDICT_MAX_UPDATES = 512;
export const UKEMI_PREDICT_MAX_BALANCES = 128;

/**
 * The K-1 honesty label (checkpoint-1 C-8): English ASCII (lang:gate / export:check), carrying the SAME five
 * elements the G0 §2.5 clause requires — (1) the frozen close-factor rule v3.5.0, (2) the first crossing,
 * (3) non-WETH legs held at p0, (4) no coverage on any other event, (5) inputs caller-carried and
 * NOT re-verified — plus the stale-snapshot note and the closing honesty (no guarantee, no score). Lives on the
 * envelope, NEVER inside the frozen `Prediction` (K-1). Removing any one element reddens
 * `u5_label_serves_the_five_elements`. The honest "no guarantee" span is the vocab-exempt form (ADR-M007 B-3).
 */
export const UKEMI_PREDICT_LABEL =
  "yhat is a deterministic recompute of the caller-carried inputs by the frozen close-factor rule (Aave v3.5.0), " +
  "at the per-account first crossing, mono-collateral WETH, non-WETH legs held at p0; " +
  "no coverage is claimed here and none is claimed on any other event; " +
  "the book slice, its digest and the oracle path are carried by the caller and are NOT re-verified here (no verifier runs, K-8); " +
  "the book is a snapshot at the block and is stale; never a probability; no guarantee, no score.";

/** A tool-level error (K-4a analog): surfaced by the MCP/HTTP seam as a 400 tool error, never a silent output
 *  and never a 500. Registered in `TOOL_ERROR_NAMES` (http.ts) so a refusal is a client error. */
export class UkemiPredictToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UkemiPredictToolError";
  }
}

/** RFC3339 date-time (matches the frozen Prediction.produced_at `format: date-time`; motif cascade.ts:119). */
const RFC3339 = /^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2})$/;
const HEX64 = /^[0-9a-f]{64}$/;

/** The non-frozen tool input (declared in schema-projection.ts, never in schemas/). */
export interface UkemiPredictInput {
  readonly book: {
    readonly schema: string;
    // The u4b book carries `block` (and `chain_id`) as a DECIMAL STRING; accept both forms (A-8) and convert
    // to an integer for the provenance.
    readonly block: string | number;
    readonly book_digest: string;
    readonly reserves: readonly RealizedReserve[];
    readonly accounts: readonly RealizedAccount[];
  };
  readonly oracle: {
    readonly schema: string;
    readonly event_id: string;
    readonly anchor_price: string;
    readonly updates: readonly RealizedOracleUpdate[];
    readonly emode_params: Readonly<Record<string, { readonly lt: string; readonly bonus: string }>>;
  };
  readonly close_factor_version: string;
  readonly produced_at: string;
}

/** The K-1 envelope (motif attest AdapterOutput): only `prediction` is a frozen contract. */
export interface UkemiPredictProvenance {
  readonly book_digest: string;
  readonly block: number;
  readonly event_id: string;
  readonly pstar: string | null;
  readonly strate: number;
  readonly m_bps: string | null;
  readonly close_factor_version: string;
}
export interface UkemiPredictOutput {
  readonly prediction: Prediction;
  readonly provenance: UkemiPredictProvenance;
  readonly label: string;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Fail-closed shape + protocol validation (K-4a): a bad envelope is a NAMED 400, never a silent output. */
function validate(input: unknown): UkemiPredictInput {
  if (!isObject(input)) throw new UkemiPredictToolError("invalid input: expected an object");
  const { book, oracle, close_factor_version, produced_at } = input;

  if (typeof close_factor_version !== "string" || close_factor_version !== UKEMI_PREDICT_CLOSE_FACTOR_VERSION) {
    throw new UkemiPredictToolError(`invalid 'close_factor_version': only '${UKEMI_PREDICT_CLOSE_FACTOR_VERSION}' is modelled (fail-closed on any other protocol version), got ${String(close_factor_version)}`);
  }
  if (typeof produced_at !== "string" || !RFC3339.test(produced_at)) {
    throw new UkemiPredictToolError("invalid 'produced_at': expected an RFC3339 date-time string (caller-carried; the tool reads no clock)");
  }
  if (!isObject(book)) throw new UkemiPredictToolError("invalid 'book': expected an object");
  if (book["schema"] !== UKEMI_BOOK_SCHEMA) throw new UkemiPredictToolError(`invalid 'book.schema': expected '${UKEMI_BOOK_SCHEMA}', got ${String(book["schema"])}`);
  const rawBlock = book["block"];
  const blockOk = (typeof rawBlock === "string" && /^[0-9]+$/.test(rawBlock)) || (typeof rawBlock === "number" && Number.isInteger(rawBlock) && rawBlock >= 0);
  if (!blockOk) throw new UkemiPredictToolError("invalid 'book.block': expected a non-negative integer (a number or a decimal string, as the u4b book carries it)");
  if (typeof book["book_digest"] !== "string" || !HEX64.test(book["book_digest"])) {
    throw new UkemiPredictToolError("invalid 'book.book_digest': expected a 64-hex sha256 (echoed into features_digest, never recomputed)");
  }
  if (!Array.isArray(book["reserves"]) || book["reserves"].length === 0) throw new UkemiPredictToolError("invalid 'book.reserves': expected a non-empty array (all reserves; pruning is refused, Q-U5-6)");
  if (book["reserves"].length > UKEMI_PREDICT_MAX_RESERVES) throw new UkemiPredictToolError(`invalid 'book.reserves': ${String(book["reserves"].length)} exceeds the cap of ${String(UKEMI_PREDICT_MAX_RESERVES)} (resource guard)`);
  const accounts = book["accounts"];
  if (!Array.isArray(accounts) || accounts.length !== 1) {
    throw new UkemiPredictToolError("invalid 'book.accounts': expected EXACTLY one account (the producer emits one Prediction per mono-account slice)");
  }
  const account: unknown = (accounts as unknown[])[0];
  if (!isObject(account) || !Array.isArray(account["balances"])) throw new UkemiPredictToolError("invalid 'book.accounts[0]': expected an account object with a balances array");
  if (account["balances"].length > UKEMI_PREDICT_MAX_BALANCES) throw new UkemiPredictToolError(`invalid 'book.accounts[0].balances': exceeds the cap of ${String(UKEMI_PREDICT_MAX_BALANCES)} (resource guard)`);

  if (!isObject(oracle)) throw new UkemiPredictToolError("invalid 'oracle': expected an object");
  if (oracle["schema"] !== UKEMI_ORACLE_SCHEMA) throw new UkemiPredictToolError(`invalid 'oracle.schema': expected '${UKEMI_ORACLE_SCHEMA}', got ${String(oracle["schema"])}`);
  if (typeof oracle["event_id"] !== "string" || oracle["event_id"].length === 0) throw new UkemiPredictToolError("invalid 'oracle.event_id': expected a non-empty string");
  if (typeof oracle["anchor_price"] !== "string") throw new UkemiPredictToolError("invalid 'oracle.anchor_price': expected a decimal string (base 8-dec)");
  if (!Array.isArray(oracle["updates"])) throw new UkemiPredictToolError("invalid 'oracle.updates': expected an array");
  if (oracle["updates"].length > UKEMI_PREDICT_MAX_UPDATES) throw new UkemiPredictToolError(`invalid 'oracle.updates': exceeds the cap of ${String(UKEMI_PREDICT_MAX_UPDATES)} (resource guard)`);
  if (!isObject(oracle["emode_params"])) throw new UkemiPredictToolError("invalid 'oracle.emode_params': expected an object of decoded {lt,bonus} by category");

  return input as unknown as UkemiPredictInput;
}

/**
 * Recompute yhat by the frozen close-factor rule and build the K-1 envelope. Throws `UkemiPredictToolError`
 * (400, never a silent output) on any refusal: a bad envelope, a producer refusal (non-mono-WETH, e-mode out
 * of range, WETH absent, pruned reserves, ...), or a yhat outside the safe-integer range. The stratum is
 * derived HERE via `strateOf` (harness ukemi-strata; no third copy). yhat=0 (a crossed or non-crossing
 * evaluable account) is a LEGITIMATE prediction (Q-U5-7), never a refusal.
 */
export function runUkemiPredict(rawInput: unknown): UkemiPredictOutput {
  const input = validate(rawInput);

  const book: RealizedBookSlice = { reserves: input.book.reserves, account: input.book.accounts[0] as RealizedAccount };
  const params: RealizedOracleParams = { anchor_price: input.oracle.anchor_price, updates: input.oracle.updates, emode_params: input.oracle.emode_params };

  let result;
  try {
    result = fromRealizedBook(book, params);
  } catch (e) {
    // A malformed deep numeric field (a non-decimal string) throws in the pure producer — fail closed, named.
    throw new UkemiPredictToolError(`invalid book/oracle field: ${(e as Error).message}`);
  }
  if (isRealizedError(result)) {
    throw new UkemiPredictToolError(`account is not a servable prediction (${result.reason}): ${result.message}`);
  }

  // yhat -> a safe JSON number (base 8-dec integer). Fail closed BEFORE emission: the gate refuses a
  // non-safe-integer yhat, and strateOf over a lossy float would mis-stratify. Number(bigint) ROUNDS a value
  // above 2^53 to a non-safe integer, caught here (checkpoint-2 C-4: mutant removing this guard reddens
  // `u5_tool_refuses_yhat_over_safe_integer`).
  const yhat = Number(result.yhat);
  if (!Number.isSafeInteger(yhat) || yhat < 0) {
    throw new UkemiPredictToolError(`yhat ${result.yhat.toString()} is not a non-negative safe integer (base 8-dec); refuse rather than serve a lossy region (C-9)`);
  }

  const strate = strateOf(yhat);
  const prediction: Prediction = {
    schema_version: SCHEMA_VERSION,
    task_class: TASK_LIQ_ELIGIBLE,
    yhat,
    // Provenance only: the gate re-derives `${UKEMI_LIQ_PREDICTOR_BASE}/s${strateOf(yhat)}` SERVER-side and
    // IGNORES the client predictor_id for this class (checkpoint-1 C-10). The base literal is honest — it says
    // "uncommitted-until-u4b-2b" (the served region is committed at -2b).
    predictor_id: `${UKEMI_LIQ_PREDICTOR_BASE}/s${String(strate)}`,
    produced_at: input.produced_at,
    // ECHO of the caller-carried digest (never recomputed, not re-verified; K-8) — a trace, not an attestation.
    features_digest: input.book.book_digest,
  };
  const provenance: UkemiPredictProvenance = {
    book_digest: input.book.book_digest,
    block: Number(input.book.block), // the u4b book carries block as a decimal string; provenance is an integer.
    event_id: input.oracle.event_id,
    pstar: result.pstar,
    strate,
    m_bps: result.m_bps,
    close_factor_version: UKEMI_PREDICT_CLOSE_FACTOR_VERSION,
  };

  // Honesty gates (K-1): `prediction` is the frozen, closed contract; the envelope carries no forbidden key.
  assertClosedPrediction(prediction);
  assertNoForbiddenKey({ prediction, provenance, label: UKEMI_PREDICT_LABEL });
  return { prediction, provenance, label: UKEMI_PREDICT_LABEL };
}

/** The honesty text carried in the MCP tool result content (never inside the frozen Prediction, K-1). Reuses
 *  the envelope label (B-2: one honesty constant, no paraphrase). */
export function ukemiPredictHonestyText(): string {
  return UKEMI_PREDICT_LABEL;
}

/** Tool description (D4/D9/K-1), declared for registration at -5b — carries no probability/score claim. */
export const UKEMI_PREDICT_TOOL_DESCRIPTION =
  "Deterministic liquidable-amount producer: recomputes yhat (base 8-dec) for one caller-carried mono-collateral " +
  "WETH account from an attested book slice + decoded oracle path, by the frozen close-factor rule (Aave v3.5.0) " +
  "at the per-account first crossing. Non-WETH legs are held at p0. Emits a closed Prediction plus a K-1 " +
  "provenance/label envelope; the gate conformalizes it downstream. " +
  UKEMI_PREDICT_LABEL;
