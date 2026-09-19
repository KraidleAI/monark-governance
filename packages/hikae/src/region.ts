/**
 * HIKAE — region constructors (ADR-M002 D9 / C4; owner settled).
 *
 * TWO disjoint bound invariants live HERE, in a single constructor — NOT in `@monark/contracts`
 * (frozen, D2), NOT duplicated in `ukemi` (D13):
 *   - M5 (hard): `lo > hi` ⇒ throw (bypass = bug).
 *   - NDG-1 (non-degeneracy, ADR-M011): a VALID `interval` region requires `lo < hi` STRICT;
 *     `lo === hi` (zero width: q̂=0, or float absorption `ŷ±q̂===ŷ`) ⇒ abstention `under_calib`,
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
 * Label schema carried by a NUMERIC (interval) class in the EMPTY `set` region of an
 * `under_calib` abstention (the ADR-M018 D4 lot, E9). The frozen contract requires a `set`
 * region's `label_schema` to be non-empty (`minLength: 1`, coverage-verdict.schema.json), so a
 * numeric class cannot OMIT it; it names the numeric nature instead of the directional `up|down`.
 * `underCalibVerdict`'s default stays `BTC_DIR_LABEL_SCHEMA`; every numeric (interval) caller
 * passes THIS constant — see `apps/harness/test/gate.test.ts`
 * `numeric_under_calib_region_is_not_directional` (7 chars, same width as `up|down`).
 */
export const NUMERIC_LABEL_SCHEMA = "numeric";

/** The two direction-beachhead labels (stable order for serialization). */
export const BTC_DIR_LABELS = ["up", "down"] as const;
export type BtcDirLabel = (typeof BTC_DIR_LABELS)[number];

/**
 * Result of `buildIntervalRegion` (D9): a valid bounded region (`lo < hi` strict, NDG-1), OR an
 * abstention — a non-finite bound (never carried on the wire, ±inf) OR a zero-width `lo === hi`
 * region (degenerate, ADR-M011). `under_calib` is the chosen frozen literal (mirroring Hikae's
 * refusal of `+inf`, D9).
 */
export type IntervalRegionResult =
  | { abstain: false; region: IntervalRegion }
  | { abstain: true; reason: "under_calib" };

/**
 * The SOLE constructor of an `interval` region (D9 / C4, M5 + NDG-1 invariants).
 *
 * Intended order (declared): **finiteness is tested first** — a non-finite bound
 * (`±Infinity`/`NaN`) ⇒ abstention `under_calib` (we never emit ±inf); then, finite
 * bounds with `lo > hi` ⇒ explicit throw (M5 invariant violation); then `lo === hi`
 * (zero width) ⇒ abstention `under_calib` (NDG-1, ADR-M011). A VALID region therefore has
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
    // a width-0 `covered` verdict would fabricate precision. Fail-closed abstention, same frozen
    // literal as the non-finite case. A valid `interval` region is `lo < hi` STRICT.
    return { abstain: true, reason: "under_calib" };
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
