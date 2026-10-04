/**
 * HIKAE scaled band [0, h*] for the kata path (ADR-CM chantier moteur, lot CM-3b; audit P3 S-4 / E-1, engine side).
 * Scores are one binary64 division s = fl(|r| / sigmaHat) (path cells: fl(label / sigmaHat), the label positive, RECHERCHES
 * kata/registry/FORMAT.md); a decision is covered iff s <= qhat. The served band is the closed [0, h*], in units of |r|
 * (or of the positive label): the transposition of the [-h*, h*] of the conformal advisor opinion (RECHERCHES
 * decisions/0005-AVIS-advisor-conformal-P2a-band-edge.md; ADR-CM R-4), h* the largest double with fl(h* / sigmaHat) <=
 * qhat. Correctly rounded division is monotone in the numerator for a fixed sigmaHat > 0, so x <= h* holds iff
 * fl(x / sigmaHat) <= qhat, double for double, for every x >= 0. The caller (CM-4) tests membership on |r| or on the
 * label, and computes the scores by that single division. qhat comes from riskControlRow (lot CM-3a) on the "band" domain. The served additive bands
 * (conformInterval, USDe, liq) are unchanged.
 */
import { riskControlRow } from "./l1-split.ts";
import { buildIntervalRegion } from "./region.ts";
import type { IntervalRegion } from "./region.ts";

const view = new DataView(new ArrayBuffer(8));

/** The double whose IEEE-754 bit pattern is b (0 <= b <= bits of MAX_VALUE: the non-negative finite doubles, in order). */
function ofBits(b: bigint): number {
  view.setBigUint64(0, b);
  return view.getFloat64(0);
}

const MAX_BITS = 0x7fefffffffffffffn; // Number.MAX_VALUE

/**
 * h*: the largest double h >= 0 with fl(h / sigmaHat) <= qhat, for finite qhat >= 0 and finite sigmaHat > 0. The
 * non-negative doubles are ordered as their bit patterns and the predicate fl(h / sigmaHat) <= qhat is monotone in h, so
 * a bisection on the bit patterns between 0 (true: 0 / sigmaHat = 0) and MAX_VALUE is exact, in 63 steps, for subnormal
 * and zero qhat too (G2 of CM-3b: a walk by ulps from fl(qhat x sigmaHat) may not end). Returns null when MAX_VALUE
 * itself passes (no finite edge: no band); throws a RangeError on a refused input.
 */
export function bandEdge(qhat: number, sigmaHat: number): number | null {
  if (!Number.isFinite(qhat) || qhat < 0 || !Number.isFinite(sigmaHat) || sigmaHat <= 0) throw new RangeError(`bandEdge: qhat ${String(qhat)}, sigmaHat ${String(sigmaHat)}`);
  const ok = (b: bigint): boolean => ofBits(b) / sigmaHat <= qhat;
  if (ok(MAX_BITS)) return null;
  let lo = 0n; // ok
  let hi = MAX_BITS; // not ok
  while (hi - lo > 1n) {
    const mid = (lo + hi) / 2n;
    if (ok(mid)) lo = mid;
    else hi = mid;
  }
  return ofBits(lo);
}

/** Options of conformScaledBand: the calib_attempt and spendIndex of riskControlRow (E-12, amendment A-1). */
export interface ScaledBandOptions {
  readonly attempt?: number;
  readonly spendIndex?: number;
}

/** conformScaledBand result: the row of riskControlRow with its half-width h* and the region [0, h*], or under_calib. */
export type ScaledBand =
  | {
      readonly qhat: number;
      readonly rank: number;
      readonly kStar: number;
      readonly kObs: number;
      readonly calibMisses: number;
      readonly attempt: number;
      readonly spendIndex: number;
      readonly testDelta: string;
      readonly missBound: string;
      readonly hStar: number;
      readonly region: IntervalRegion;
    }
  | { readonly reason: "under_calib" };

/**
 * S-4 / E-1 engine side: riskControlRow on the "band" domain (scores in time order, none negative nor non-finite; a caller
 * options bag never overrides it), then the closed band [0, h*] of buildIntervalRegion. FAIL-CLOSED `under_calib`: every
 * refusal of riskControlRow, a sigmaHat that is not finite and > 0, no finite edge (bandEdge null: MAX_VALUE itself passes),
 * and qhat = 0 or h* = 0 (NDG-1: a zero-width band never serves, audit P3 E-14).
 */
export function conformScaledBand(scores: readonly number[], sigmaHat: number, alphaDec: string, baseDeltaDec: string, nMin: number, options: ScaledBandOptions = {}): ScaledBand {
  const under: ScaledBand = { reason: "under_calib" };
  if (!Number.isFinite(sigmaHat) || sigmaHat <= 0) return under;
  const row = riskControlRow(scores, alphaDec, baseDeltaDec, nMin, { ...options, domain: "band" });
  if ("reason" in row || row.silence || row.qhat === 0) return under;
  const hStar = bandEdge(row.qhat, sigmaHat);
  if (hStar === null) return under;
  const built = buildIntervalRegion(0, hStar);
  if (built.abstain) return under;
  const { qhat, rank, kStar, kObs, calibMisses, attempt, spendIndex, testDelta, missBound } = row;
  return { qhat, rank, kStar, kObs, calibMisses, attempt, spendIndex, testDelta, missBound, hStar, region: built.region };
}
