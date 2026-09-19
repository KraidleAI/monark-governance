// MONARK Bell — fact (iii): pool volume vs consolidated ADV (ADR-B0 D2 iii, ADR-T1aii C-6/C-7). The
// numerator is FIRST-HAND: the token volume recomputed from the pool fills, DEDUPED by signature upstream
// (rpc.ts swapsForPool; Jupiter is an aggregator, so its hops appear once per pool). The denominator is the
// consolidated average daily SHARE volume of the prior month from Polygon range/1/day -- [2nd] (Polygon
// redistributes the consolidated tape), unit = shares.
//
// C-6 (conservative ESC-1 c): only the RATIO `vol_ratio` is published; the ADV is NEVER carried verbatim
// (the digest close-guard reddens `adv|share_volume|volume_ref`). The claim is never "the TSV is under the
// cap": Bell emits the ratio as a fact. Unit honesty (C-7): a token equals a share only modulo the scaled-UI
// multiplier; a multiplier != 1 raises the residue `multiplier_unit`. Killer (bell ratio killer): a changed
// ADV changes the ratio; a multiplier != 1 flips multiplier_unit.
import type { SwapFill } from "./rpc.ts";
import { GAP_PRECISION } from "./gap.ts";

const abs = (x: bigint): bigint => (x < 0n ? -x : x);

/** Token volume of a session in base units = sum of |baseDelta| over the deduped fills. Exact (bigint). */
export function poolVolumeBase(fills: readonly SwapFill[]): bigint {
  let v = 0n;
  for (const f of fills) v += abs(f.baseDelta);
  return v;
}

/** Consolidated ADV (average daily share volume) over the prior-month daily volumes. [2nd] (Polygon). Unit =
 *  shares/day. Returns 0 for an empty input (the caller then omits the ratio -- no fabricated denominator). */
export function consolidatedAdv(dailyShareVolumes: readonly number[]): number {
  if (dailyShareVolumes.length === 0) return 0;
  let s = 0;
  for (const v of dailyShareVolumes) s += v;
  return s / dailyShareVolumes.length;
}

/** The published ratio object: only `vol_ratio` (a first-hand-over-[2nd] ratio) and the unit residue flag. */
export interface VolumeRatio {
  readonly vol_ratio: string; // pool token volume (in shares) / consolidated ADV -- fixed-precision decimal
  readonly multiplier_unit: boolean; // true when the scaled-UI multiplier != 1 (token unit != share unit)
}

/** Ratio of the pool token volume (converted to shares via the multiplier) to the consolidated ADV. `adv`
 *  MUST be > 0 (a real prior-month denominator; a 0 denominator is a data gap the caller handles, never a
 *  fabricated ratio). A multiplier != 1 sets multiplier_unit (residue). Deterministic (bit-identical replay). */
export function volumeToAdvRatio(volumeBaseUnits: bigint, baseDec: number, adv: number, multiplier: string,
  precision = GAP_PRECISION): VolumeRatio {
  if (adv <= 0) throw new Error("bell volumeToAdvRatio: adv must be > 0 (prior-month consolidated denominator)");
  const multiplierNum = Number(multiplier);
  const tokens = Number(volumeBaseUnits) / Math.pow(10, baseDec);
  const shares = tokens * multiplierNum;
  return { vol_ratio: (shares / adv).toFixed(precision), multiplier_unit: multiplierNum !== 1 };
}
