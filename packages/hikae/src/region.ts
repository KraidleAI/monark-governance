/**
 * HIKAE — region constructors (ADR-M002 D9 / C4; owner settled).
 *
 * TWO disjoint bound invariants live HERE, in a single constructor — NOT in `@monark/contracts`
 * (frozen, D2), NOT duplicated in `ukemi` (D13):
 *   - M5 (hard): `lo > hi` ⇒ throw (bypass = bug).
 *   - NDG-1 (non-degeneracy, ADR-M011): a VALID `interval` region requires `lo < hi` STRICT;
 *     `lo === hi` (zero width: q̂=0, or float absorption `ŷ±q̂===ŷ`) ⇒ abstention `region_degenerate` (B-16),
 *     never a `covered` region (a width-0 hit would be fabricated precision).
 * Plus the "bounded or abstention" rule (never ±inf on the wire, mirroring Hikae's refusal of
 * `+inf`). At Phase 2 integration, HIKAE will conform UKEMI's numeric `Prediction` into an
 * `interval` region via `buildIntervalRegion`.
 */
import type { PredictionRegion } from "@monark/contracts";

/** `set` variant of the frozen region (classification: btc-dir, pm-yesno). */
export type SetRegion = Extract<PredictionRegion, { kind: "set" }>;
/** `interval` variant of the frozen region (regression: UKEMI cascade-VaR, Phase 2). */
export type IntervalRegion = Extract<PredictionRegion, { kind: "interval" }>;

/**
 * Label schema of the `btc-dir-15m` beachhead (D8: `{up, down}`; the equality
 * `close == open` is `non_evaluable`, never a 3rd label `flat`).
 */
export const BTC_DIR_LABEL_SCHEMA = "up|down";

/**
 * Label schema that a NUMERIC (interval) class carried in the EMPTY `set` region of an
 * `under_calib` abstention in contract 1.0.0 (the ADR-M018 D4 lot, E9). Since 1.1.0 an
 * abstention without region carries `region: null` (ADR-CM B-11 amended): no empty set and no
 * `label_schema` reach the wire, and `underCalibVerdict` takes no label schema. Kept exported
 * for the readers of 1.0.0 records; `apps/harness/test/gate.test.ts`
 * `numeric_under_calib_region_is_not_directional` pins that no served verdict carries it.
 * (7 chars, same width as `up|down`.)
 */
export const NUMERIC_LABEL_SCHEMA = "numeric";

/** The two direction-beachhead labels (stable order for serialization). */
export const BTC_DIR_LABELS = ["up", "down"] as const;
export type BtcDirLabel = (typeof BTC_DIR_LABELS)[number];

/**
 * Result of `buildIntervalRegion` (D9): a valid bounded region (`lo < hi` strict, NDG-1), OR an
 * abstention — a non-finite bound (never carried on the wire, ±inf) OR a zero-width `lo === hi`
 * region (degenerate, ADR-M011). `under_calib` for the first (mirroring Hikae's refusal of `+inf`,
 * D9), `region_degenerate` for the second (ADR-CM B-16).
 */
export type IntervalRegionResult =
  | { abstain: false; region: IntervalRegion }
  | { abstain: true; reason: "under_calib" | "region_degenerate" };

/**
 * The SOLE constructor of an `interval` region (D9 / C4, M5 + NDG-1 invariants).
 *
 * Intended order (declared): **finiteness is tested first** — a non-finite bound
 * (`±Infinity`/`NaN`) ⇒ abstention `under_calib` (we never emit ±inf); then, finite
 * bounds with `lo > hi` ⇒ explicit throw (M5 invariant violation); then `lo === hi`
 * (zero width) ⇒ abstention `region_degenerate` (NDG-1, ADR-M011, B-16). A VALID region therefore has
 * `lo < hi` STRICT. This ordering choice treats `(+Infinity, 5)` as "unbounded ⇒ abstention",
 * not as `lo > hi`.
 */
export function buildIntervalRegion(lo: number, hi: number): IntervalRegionResult {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return { abstain: true, reason: "under_calib" };
  }
  if (lo > hi) {
    throw new Error(
      `buildIntervalRegion: lo (${lo}) > hi (${hi}) — M5 invariant (lo <= hi) violated (ADR-M002 D9/C4).`,
    );
  }
  if (lo === hi) {
    // NDG-1 (ADR-M011): a zero-width region (q̂=0, or float absorption `ŷ±q̂===ŷ`) is degenerate —
    // a width-0 `covered` verdict would fabricate precision. Fail-closed abstention with its own reason
    // (ADR-CM B-16). A valid `interval` region is `lo < hi` STRICT.
    return { abstain: true, reason: "region_degenerate" };
  }
  return { abstain: false, region: { kind: "interval", lo, hi } };
}

/**
 * Constructor of a `set` region (classification), with the carried label schema.
 * Defensive copy of `labels` (the frozen contract expects a clean `string[]`).
 */
export function buildSetRegion(
  labels: readonly string[],
  labelSchema: string = BTC_DIR_LABEL_SCHEMA,
): SetRegion {
  return { kind: "set", labels: [...labels], label_schema: labelSchema };
}

const bits = new DataView(new ArrayBuffer(8));
/** The order key of a double: its bit pattern, negated for a negative double (-0 and 0 share the key 0). */
function keyOf(x: number): bigint {
  bits.setFloat64(0, x);
  const b = bits.getBigUint64(0);
  return b >> 63n === 1n ? -(b & 0x7fffffffffffffffn) : b;
}
function ofKey(k: bigint): number {
  bits.setBigUint64(0, k < 0n ? -k | (1n << 63n) : k);
  return bits.getFloat64(0);
}

/** The largest double x >= c with fl(x - c) <= q (q >= 0), by bisection on the bit patterns (spec section 8). */
function upperEdge(c: number, q: number): number {
  if (Number.MAX_VALUE - c <= q) return Number.MAX_VALUE;
  let [a, b] = [keyOf(c), keyOf(Number.MAX_VALUE)];
  while (b - a > 1n) {
    const m = (a + b) / 2n;
    if (ofKey(m) - c <= q) a = m;
    else b = m;
  }
  return ofKey(a);
}

/**
 * B-13 (ADR-CM, spec section 8): the additive band of yhat and qhat with its edges taken from the score test: hi is the
 * largest double x with fl(x - yhat) <= qhat, lo the smallest with fl(yhat - x) <= qhat (round to nearest is symmetric in
 * sign, so lo = -(the hi of -yhat)); then buildIntervalRegion. A negative or NaN qhat, or an additive edge yhat - qhat or
 * yhat + qhat that is not finite, goes to buildIntervalRegion(yhat - qhat, yhat + qhat) as before (throw or under_calib).
 */
export function scoreTestBand(yhat: number, qhat: number): IntervalRegionResult {
  if (!(qhat >= 0) || !Number.isFinite(yhat - qhat) || !Number.isFinite(yhat + qhat)) return buildIntervalRegion(yhat - qhat, yhat + qhat);
  return buildIntervalRegion(0 - upperEdge(-yhat, qhat), upperEdge(yhat, qhat));
}
