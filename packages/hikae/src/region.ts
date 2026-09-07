/**
 * HIKAE — region constructors (ADR-M002 D9 / C4; owner settled: Lot H).
 *
 * The M5 invariant (`lo <= hi`) and the "bounded or abstention" rule (never ±inf on the
 * wire, mirroring Hikae's refusal of `+inf`) live HERE, in a single constructor — NOT
 * in `@monark/contracts` (frozen, D2), NOT duplicated in `ukemi` (D13). At Phase 2
 * integration, HIKAE will conform UKEMI's numeric `Prediction` into an `interval` region via
 * `buildIntervalRegion`.
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

/** The two direction-beachhead labels (stable order for serialization). */
export const BTC_DIR_LABELS = ["up", "down"] as const;
export type BtcDirLabel = (typeof BTC_DIR_LABELS)[number];

/**
 * Result of `buildIntervalRegion` (D9): a valid bounded region, OR an abstention
 * (a non-finite bound CANNOT be carried on the wire — we never emit ±inf).
 * `under_calib` is the chosen frozen literal (mirroring Hikae's refusal of `+inf`, D9).
 */
export type IntervalRegionResult =
  | { abstain: false; region: IntervalRegion }
  | { abstain: true; reason: "under_calib" };

/**
 * The SOLE constructor of an `interval` region (D9 / C4, M5 invariant).
 *
 * Intended order (declared): **finiteness is tested first** — a non-finite bound
 * (`±Infinity`/`NaN`) ⇒ abstention `under_calib` (we never emit ±inf); then, finite
 * bounds with `lo > hi` ⇒ explicit throw (M5 invariant violation). This ordering
 * choice treats `(+Infinity, 5)` as "unbounded ⇒ abstention", not as `lo > hi`.
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
