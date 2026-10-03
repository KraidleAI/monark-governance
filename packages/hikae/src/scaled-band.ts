/**
 * HIKAE scaled band [0, h*] for the kata path (ADR-CM chantier moteur, lot CM-3b; audit P3 S-4 / E-1, engine side).
 * Scores are one binary64 division s = fl(|r| / sigmaHat) (path cells: fl(D / sigmaHat)); a decision is covered iff
 * s <= qhat. The served band is the closed [0, h*], h* the largest double with fl(h* / sigmaHat) <= qhat (conformal
 * advisor opinion, RECHERCHES decisions/0005-AVIS-advisor-conformal-P2a-band-edge.md): since correctly rounded division
 * is monotone in the numerator for a fixed sigmaHat > 0, x <= h* holds iff fl(x / sigmaHat) <= qhat, double for double,
 * for every x >= 0. qhat comes from riskControlRow (lot CM-3a) on the "band" domain. The served additive bands
 * (conformInterval, USDe, liq) are unchanged.
 */
import { riskControlRow } from "./l1-split.ts";
import { buildIntervalRegion } from "./region.ts";
import type { IntervalRegion } from "./region.ts";

const view = new DataView(new ArrayBuffer(8));

/** The next double above x >= 0 (x finite). */
function nextUp(x: number): number {
  if (x === 0) return Number.MIN_VALUE;
  view.setFloat64(0, x);
  view.setBigUint64(0, view.getBigUint64(0) + 1n);
  return view.getFloat64(0);
}

/** The next double below x > 0. */
function nextDown(x: number): number {
  view.setFloat64(0, x);
  view.setBigUint64(0, view.getBigUint64(0) - 1n);
  return view.getFloat64(0);
}

const MAX_STEPS = 64; // the product is within a few ulps of h*; more steps would mean a broken arithmetic

/**
 * h*: the largest double h >= 0 with fl(h / sigmaHat) <= qhat, for finite qhat >= 0 and finite sigmaHat > 0. Starts from
 * fl(qhat x sigmaHat) and moves by one ulp. Returns null when the product is not finite (no band); throws a RangeError
 * on a refused input.
 */
export function bandEdge(qhat: number, sigmaHat: number): number | null {
  if (!Number.isFinite(qhat) || qhat < 0 || !Number.isFinite(sigmaHat) || sigmaHat <= 0) throw new RangeError(`bandEdge: qhat ${String(qhat)}, sigmaHat ${String(sigmaHat)}`);
  let h = qhat * sigmaHat;
  if (!Number.isFinite(h)) return null;
  for (let i = 0; i < MAX_STEPS; i++) {
    if (h / sigmaHat > qhat) h = nextDown(h);
    else if (Number.isFinite(nextUp(h)) && nextUp(h) / sigmaHat <= qhat) h = nextUp(h);
    else return h;
  }
  throw new RangeError(`bandEdge: no edge within ${String(MAX_STEPS)} ulps of qhat x sigmaHat`);
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
 * S-4 / E-1 engine side: riskControlRow on the "band" domain (scores in time order, none negative nor non-finite), then
 * the closed band [0, h*] built by buildIntervalRegion. FAIL-CLOSED `under_calib`: every refusal of riskControlRow, a
 * sigmaHat that is not finite and > 0, a non-finite product qhat x sigmaHat, and qhat = 0 or h* = 0 (NDG-1: a zero-width
 * band never serves, audit P3 E-14).
 */
export function conformScaledBand(scores: readonly number[], sigmaHat: number, alphaDec: string, baseDeltaDec: string, nMin: number, options: ScaledBandOptions = {}): ScaledBand {
  const under: ScaledBand = { reason: "under_calib" };
  if (!Number.isFinite(sigmaHat) || sigmaHat <= 0) return under;
  const row = riskControlRow(scores, alphaDec, baseDeltaDec, nMin, { domain: "band", ...options });
  if ("reason" in row || row.silence || row.qhat === 0) return under;
  const hStar = bandEdge(row.qhat, sigmaHat);
  if (hStar === null) return under;
  const built = buildIntervalRegion(0, hStar);
  if (built.abstain) return under;
  const { qhat, rank, kStar, kObs, calibMisses, attempt, spendIndex, testDelta, missBound } = row;
  return { qhat, rank, kStar, kObs, calibMisses, attempt, spendIndex, testDelta, missBound, hStar, region: built.region };
}
