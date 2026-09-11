/**
 * Harness — the `calibrate` tool (ADR-M007 D0/D2/D3/D4/D5/D8, the 4th pure primitive).
 *
 * A PURE exposure of the REAL HIKAE split-conformal quantile (`splitQuantile`, imported from
 * `@monark/hikae`, NEVER re-implemented) over nonconformity scores APPORTED BY THE CALLER (BYO —
 * Bring Your Own predictor, ADR-M007 D2): the agent owns its nonconformity function and hands MONARK
 * the score array + the target miscoverage `alpha`; MONARK returns the conformal quantile q̂ that a
 * covered decision would use. `set_digest` = `calibDigest(scores)` (imported from `@monark/contracts`,
 * NEVER re-implemented — B-7), so the audit `calibrate` ↔ `verdict.calib_digest` closes.
 *
 * NO side effects (K-8): this file — like everything under `src/tools/` — imports no
 * `node:fs`/`node:net`/`node:child_process`, calls no `fetch`, writes no `process.env`, and reads no
 * clock. MONARK stores NOTHING (D6): the caller carries q̂ downstream exactly as it carries B_t.
 *
 * HONESTY (K-1, three carriers — H3 OBS-2 / B-5): the exchangeability hypothesis is DECLARED, carried
 * identically in (1) the tool DESCRIPTION, (2) the MCP text `content` (`calibrateHonestyText()`), and
 * (3) the output `label`. Unlike `attest` (which replays a committed witness and is "demonstrative"),
 * `calibrate` COMPUTES a real quantile — but only UNDER an external hypothesis the caller alone owns,
 * so the label says exactly that and never claims a probability of being right.
 *
 * FAIL-CLOSED (D4, inherited from `splitQuantile` and re-declared): `alpha ∉ (0,1)`, a non-finite
 * score, a bad `nMin`, or `n > CALIBRATE_MAX_N` ⇒ a `CalibrateToolError` (surfaced by the MCP/HTTP
 * seam as a tool error, never a silent output); `n < nMin` OR `⌈(n+1)(1−alpha)⌉ > n` ⇒ the honest
 * `{ qhat: null, reason: "under_calib" }` (NEVER a silently clamped q̂). No success is invented.
 */
import { splitQuantile } from "@monark/hikae";
import { calibDigest } from "@monark/contracts";

export const CALIBRATE_TOOL_NAME = "calibrate";

/**
 * Resource cap (motif `CASCADE_MAX_NODES`): the maximum number of caller-supplied scores the
 * tool accepts. The harness is a public, unauthenticated compute surface co-located with the vitrine on
 * one VPS, so `n` must be bounded even though `splitQuantile` (an O(n log n) sort) and `calibDigest` (an
 * O(n) hash) are cheap. 10000 is generously above realistic split-conformal calibration sizes (hundreds
 * to low thousands) yet keeps a crafted body bounded; the Caddy 256 KB body cap is the OUTER bound and
 * this constant is the INNER fail-closed guard. Enforced TWICE, fail-closed: the tool-input projection
 * sets `maxItems` at the SDK boundary (`schema-projection.ts`, which imports THIS constant) AND
 * `runCalibrate` rejects `n > CALIBRATE_MAX_N` below — belt-and-suspenders behind the schema, so a
 * direct in-process tool call (the HTTP mirror or a test) is capped too. This file stays pure/no-I/O
 * (K-8), so `schema-projection.ts` -> `calibrate.ts` has no cycle back here.
 */
export const CALIBRATE_MAX_N = 10000;

/**
 * The K-1 honesty label (ADR-M007 D5), VERBATIM — the declared exchangeability hypothesis. Carried
 * identically by all three carriers (description + MCP `content` + output `label`). Contains no banned
 * vocabulary: it names no probability/score of being right, only the marginal coverage that holds UNDER
 * exchangeability. The harness vocab gate polices the overclaim verbs negation-aware (ADR-M007 B-3);
 * this text carries none.
 */
export const CALIBRATE_LABEL =
  "split-conformal quantile at miscoverage α over caller-supplied nonconformity scores. " +
  "MONARK does not see, store, or verify the caller's data or model, and does not validate that the " +
  "supplied numbers are nonconformity scores of any model. Marginal 1−α coverage holds ONLY for future " +
  "points exchangeable with the supplied scores; non-exchangeable data (e.g. distribution-shifted or " +
  "time-ordered) voids it. Never a probability of being right.";

/**
 * Tool description (D5/K-1, carrier 1/3): the SAME honesty text as the output `label`. The
 * exchangeability hypothesis rides here, on the tool surface, never inside a silent numeric output.
 */
export const CALIBRATE_TOOL_DESCRIPTION = CALIBRATE_LABEL;

/** The honesty text carried in the MCP tool result `content` (carrier 2/3), identical to the label (K-1). */
export function calibrateHonestyText(): string {
  return CALIBRATE_LABEL;
}

/** A tool-level error (K-4a analog): surfaced by the MCP/HTTP seam as a tool error, never a silent output. */
export class CalibrateToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalibrateToolError";
  }
}

/** Non-frozen tool input (ADR-M007 D2), declared field by field — NEVER in schemas/. BYO at the SCORE level. */
export interface CalibrateInput {
  /** Caller-supplied nonconformity scores (the caller owns the score function; MONARK stays agnostic). */
  readonly scores: readonly number[];
  /** Target miscoverage in the open interval (0,1). */
  readonly alpha: number;
  /** Minimum calibration count (>= 1); `n < nMin` ⇒ fail-closed `under_calib`. */
  readonly nMin: number;
}

/** The `calibrate` result (ADR-M007 D3, non-frozen envelope). `qhat`/`reason` are the fail-closed pair. */
export interface CalibrateResult {
  /** The conformal quantile q̂, or `null` when the calibration is insufficient (fail-closed). */
  readonly qhat: number | null;
  /** The number of supplied scores (echoed). */
  readonly n: number;
  /** The target miscoverage (echoed). */
  readonly alpha: number;
  /** The conformal method — always `"split"` (the only quantile the repo implements). */
  readonly method: "split";
  /** `calibDigest(scores)` — recalculable by reference (B-7), the audit tie to `verdict.calib_digest` (C2). */
  readonly set_digest: string;
  /** The K-1 honesty label (carrier 3/3), declaring the exchangeability hypothesis. */
  readonly label: string;
  /** `"under_calib"` when q̂ is null, else `null` on success. IN the schema (M-5) so the closed output validates. */
  readonly reason: string | null;
}

/**
 * Compose the real primitive into the `calibrate` result (D3/D4). Fail-closed order (D4): validate
 * `alpha`, `nMin`, and the cap FIRST; validate finiteness of every score BEFORE `calibDigest` (so a
 * non-finite score is a `CalibrateToolError` with a tool message, not `calibDigest`'s bare `Error`);
 * then compute `set_digest` and the split quantile. `n < nMin` or `p > n` ⇒ `{ qhat: null,
 * reason: "under_calib" }` (never a clamped q̂); success ⇒ `{ qhat, reason: null }`.
 */
export function runCalibrate(input: CalibrateInput): CalibrateResult {
  const { scores, alpha, nMin } = input;

  if (typeof alpha !== "number" || !Number.isFinite(alpha) || !(alpha > 0 && alpha < 1)) {
    throw new CalibrateToolError("invalid 'alpha': expected a finite number in the open interval (0,1)");
  }
  // nMin validation is the cascade belt-and-suspenders motif (gate.ts:90 precedent): the schema enforces
  // `integer` at the SDK boundary, this backstops a direct in-process call — beyond D4's literal list,
  // strictly MORE fail-closed, never a silent output.
  if (typeof nMin !== "number" || !Number.isInteger(nMin) || nMin < 1) {
    throw new CalibrateToolError("invalid 'nMin': expected an integer >= 1");
  }
  const n = scores.length;
  // Resource cap (motif CASCADE_MAX_NODES): bound `n` BEFORE the O(n) finiteness scan and the sort/hash,
  // so a crafted huge array cannot exhaust the shared VPS on a direct tool call (schema `maxItems` is the
  // first line at the SDK boundary; this is the fail-closed backstop).
  if (n > CALIBRATE_MAX_N) {
    throw new CalibrateToolError(
      `invalid 'scores': ${String(n)} scores exceeds the cap of ${String(CALIBRATE_MAX_N)} (resource guard, ADR-M007 D2)`,
    );
  }
  // Finiteness BEFORE calibDigest (D4): a non-finite score is a tool error with a message, not the bare
  // Error `calibDigest` throws — so the seam surfaces a 400, never a 500.
  for (let i = 0; i < n; i++) {
    const s = scores[i];
    if (s === undefined || !Number.isFinite(s)) {
      throw new CalibrateToolError(`invalid 'scores[${String(i)}]': expected a finite number`);
    }
  }

  // B-7: the digest is calibDigest, imported from @monark/contracts, NEVER re-implemented.
  const set_digest = calibDigest(scores);
  // The quantile is splitQuantile, imported from @monark/hikae, NEVER re-implemented.
  const split = splitQuantile(scores, alpha, nMin);

  if ("reason" in split) {
    // Fail-closed: n < nMin OR p > n ⇒ honest under-calibration, NEVER a clamped q̂ (D4).
    return { qhat: null, n, alpha, method: "split", set_digest, label: CALIBRATE_LABEL, reason: "under_calib" };
  }
  return { qhat: split.qhat, n, alpha, method: "split", set_digest, label: CALIBRATE_LABEL, reason: null };
}
