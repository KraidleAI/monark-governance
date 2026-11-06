/**
 * HIKAE ACI: the online level of a class, replayed from the outcomes the caller carries.
 *
 * The update is the one of Gibbs and Candes 2021 (arXiv:2106.00170, read 2026-11-05), with no clamp:
 *   A_1 = alpha,  A_{t+1} = A_t + gamma (alpha - err_t),
 * and the region is the split quantile of the last `window` arrived scores at the rank of the level: p = ceil((n + 1)(1 - A)). So the
 * step is in units of the level, no score scale is declared, and the window carries the shape of the scores as their scale moves.
 *
 * Outcomes arrive late and out of order, so the replay reads them in arrival order, each with `decided_after[i]`, the number of scores
 * that had arrived when its signal was decided (0 <= d_i <= i). Each err_i is judged on the region that signal got: err_i = 1{s_i > q(d_i)},
 * where q(d) comes from the window and the level after d arrivals. The level moves when the outcome arrives, not when the signal is
 * decided. Hallberg Szabadvary 2024 (PMLR v230, read 2026-11-06) and El Halabi and Brandt 2026 (arXiv:2609.07251, read 2026-11-06) treat
 * delays of a fixed length; here a delay has any length and is read from the evidence.
 *
 * The level has no bound of its own, so its region has three edge cases, each the natural limit of the rank:
 *   - A below 1/(n + 1): p > n, the whole line, no finite region, err = 0;
 *   - A at 1 or above: p < 1, the empty region, err = 1;
 *   - warm-up: while the window has no region at alpha itself (n < nMin, or p(n, alpha) > n), a signal moves nothing and its score only
 *     calibrates. So the first region is the one of L1, exactly.
 *
 * The bound, with no assumption on the scores (the form with D is ours; at D = 0 it implies the bound of Gibbs and Candes). T counts the
 * steps that moved the level, k their misses, D = max (i - d_i) over them.
 *   Band: err_i = 1 implies A at d_i > 0 (else the whole line, err = 0), and err_i = 0 implies A at d_i < 1 (else the empty region, err = 1).
 *   Between d_i and i at most D steps moved the level, each by at most gamma (1 - alpha) down and gamma alpha up, so
 *   -(D + 1) gamma (1 - alpha) < A_t < 1 + (D + 1) gamma alpha.
 *   Telescoping: A_{T+1} = alpha + gamma (T alpha - k), so k/T - alpha = (alpha - A_{T+1}) / (gamma T), hence
 *   |k/T - alpha| < max{alpha + (D + 1) gamma (1 - alpha), 1 - alpha + (D + 1) gamma alpha} / (gamma T).
 * The bound covers all the replayed signals, taken or not; a step that got the whole line counts as covered and one that got the empty
 * region as a miss (`noRegion` says how many of both); it says nothing of one window, nor of the signals taken alone. MONARK cannot check
 * that the evidence holds every outcome. The split coverage of L1 under exchangeability does not carry over to this region. Never a
 * probability of being right.
 *
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import { scoreAtRank, shortestRatio, splitRankRational } from "./l1-split.ts";
import { q, type Q } from "./pari/rational.ts";

/** What the caller carries beside its scores: the step, the window, and for each arrived score how many had arrived at its decision. */
export interface AciEvidence {
  readonly gamma: number;
  readonly window: number;
  readonly decided_after: readonly number[];
}

/** The region at the current level: none yet, no finite one, an empty one, or the quantile at its rank. */
export type AciRegion =
  | { readonly kind: "warmup" }
  | { readonly kind: "whole" }
  | { readonly kind: "empty" }
  | { readonly kind: "quantile"; readonly qhat: number; readonly rank: number };

/** The state after a replay. `bound` is null before the first step. */
export interface AciState {
  /** The step and the window of the evidence. */
  readonly gamma: number;
  readonly windowSize: number;
  /** The current level, exact. */
  readonly level: Q;
  /** T: the outcomes that moved the level. */
  readonly steps: number;
  /** k: those judged outside the region their signal got. */
  readonly misses: number;
  /** Those whose signal got no finite region: the whole line or the empty region. */
  readonly noRegion: number;
  /** D: the largest number of scores that arrived between a signal's decision and its outcome, over those steps. */
  readonly maxDelay: number;
  readonly bound: Q | null;
  /** The last `window` arrived scores, in arrival order. */
  readonly window: readonly number[];
  readonly region: AciRegion;
}

function exactRational(x: number, what: string): Q {
  const { num, den } = shortestRatio(x, what);
  return q(num, den);
}

/** A_{T+1} = alpha + gamma (T alpha - k), the closed form of the update. */
export function aciLevel(steps: number, misses: number, alpha: Q, gamma: Q): Q {
  return q(alpha.n * gamma.d + gamma.n * (BigInt(steps) * alpha.n - BigInt(misses) * alpha.d), alpha.d * gamma.d);
}

/** max{alpha + (D + 1) gamma (1 - alpha), 1 - alpha + (D + 1) gamma alpha} / (gamma T), the bound on |k/T - alpha| derived above. */
export function aciBound(steps: number, maxDelay: number, alpha: Q, gamma: Q): Q {
  if (!Number.isSafeInteger(steps) || steps < 1) throw new RangeError(`aciBound: T ${String(steps)} is not a safe integer >= 1`);
  if (!Number.isSafeInteger(maxDelay) || maxDelay < 0) throw new RangeError(`aciBound: D ${String(maxDelay)} is not a safe integer >= 0`);
  const stepsOfDelay = BigInt(maxDelay + 1) * gamma.n;
  const low = alpha.n * gamma.d + stepsOfDelay * (alpha.d - alpha.n); // over alpha.d gamma.d
  const high = (alpha.d - alpha.n) * gamma.d + stepsOfDelay * alpha.n; // over alpha.d gamma.d
  return q(low > high ? low : high, alpha.d * gamma.n * BigInt(steps));
}

/** A scaled integer written with `places` decimals, its sign kept. */
function written(scaled: bigint, places: number): string {
  const digits = (scaled < 0n ? -scaled : scaled).toString().padStart(places + 1, "0");
  const cut = digits.length - places;
  return `${scaled < 0n ? "-" : ""}${digits.slice(0, cut)}${places > 0 ? `.${digits.slice(cut)}` : ""}`;
}

/** A level as its exact decimal: the denominator of a level divides a power of ten. The fewest places, so no trailing zero. A RangeError otherwise. */
export function aciLevelText(level: Q): string {
  let rest = level.d;
  while (rest % 2n === 0n) rest /= 2n;
  while (rest % 5n === 0n) rest /= 5n;
  if (rest !== 1n) throw new RangeError("aciLevelText: no finite decimal");
  let places = 0, scale = 1n;
  while (scale % level.d !== 0n) {
    places++;
    scale *= 10n;
  }
  return written((level.n * scale) / level.d, places);
}

/** A bound rounded up at four decimals: it may pass 1, where it says nothing. */
export function aciBoundText(bound: Q): string {
  if (bound.n < 0n) throw new RangeError("aciBoundText: a negative bound");
  return written((bound.n * 10000n + bound.d - 1n) / bound.d, 4);
}

function check(scores: readonly number[], alpha: number, nMin: number, e: AciEvidence): void {
  if (!Number.isFinite(alpha) || alpha <= 0 || alpha >= 1) throw new RangeError(`aci: alpha ${String(alpha)} is not a finite number of (0, 1)`);
  if (!Number.isSafeInteger(nMin) || nMin < 1) throw new RangeError(`aci: nMin ${String(nMin)} is not an integer >= 1`);
  if (!Number.isFinite(e.gamma) || e.gamma <= 0 || e.gamma >= 1) throw new RangeError(`aci: gamma ${String(e.gamma)} is not a finite number of (0, 1)`);
  if (!Number.isSafeInteger(e.window) || e.window < 1) throw new RangeError(`aci: window ${String(e.window)} is not an integer >= 1`);
  if (e.decided_after.length !== scores.length) throw new RangeError(`aci: ${String(e.decided_after.length)} decision counts for ${String(scores.length)} scores`);
  for (let i = 0; i < scores.length; i++) {
    const s = scores[i], d = e.decided_after[i];
    if (s === undefined || !Number.isFinite(s)) throw new RangeError(`aci: score ${String(i)} is not finite`);
    if (d === undefined || !Number.isSafeInteger(d) || d < 0 || d > i) throw new RangeError(`aci: decided_after[${String(i)}] = ${String(d)} is not an integer of [0, ${String(i)}]`);
  }
}

/** The window kept sorted, one score in and one out at each arrival, by a binary search and a move. */
class SortedWindow {
  readonly #sorted: Float64Array;
  #n = 0;
  constructor(capacity: number) {
    this.#sorted = new Float64Array(capacity);
  }
  /** The first position whose score is at or after x (`after` false), or after it (`after` true). */
  #position(x: number, after: boolean): number {
    let lo = 0, hi = this.#n;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1, v = this.#sorted[mid] as number;
      if (v < x || (after && v === x)) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }
  add(x: number): void {
    const at = this.#position(x, true);
    this.#sorted.copyWithin(at + 1, at, this.#n);
    this.#sorted[at] = x;
    this.#n++;
  }
  remove(x: number): void {
    const at = this.#position(x, false);
    this.#sorted.copyWithin(at, at + 1, this.#n);
    this.#n--;
  }
  at(rank: number): number {
    return this.#sorted[rank - 1] as number;
  }
}

/**
 * Replays the level from the scores in arrival order, then gives the region now, for the next signal. A threshold is computed once, only
 * at the arrival counts a decision read: NaN for no region yet, +infinity for the whole line, -infinity for the empty region, so that
 * `s > threshold` is err on all but the first, which moves nothing.
 */
export function aciReplay(scores: readonly number[], alpha: number, nMin: number, evidence: AciEvidence): AciState {
  check(scores, alpha, nMin, evidence);
  const A = exactRational(alpha, "alpha"), G = exactRational(evidence.gamma, "gamma"), W = evidence.window, total = scores.length;
  // The numerator of aciLevel over A.d G.d, without its reduction: the rank needs no gcd, and it runs at each decision.
  const den = A.d * G.d, fromAlpha = A.n * G.d, perStep = G.n * A.n, perMiss = G.n * A.d;
  const numerator = (steps: number, misses: number): bigint => fromAlpha + perStep * BigInt(steps) - perMiss * BigInt(misses);

  const read = new Uint8Array(total + 1);
  read[total] = 1;
  for (const d of evidence.decided_after) read[d] = 1;
  const threshold = new Float64Array(total + 1);
  const sorted = new SortedWindow(Math.min(W, total));

  let steps = 0, misses = 0, noRegion = 0, maxDelay = 0;
  for (let i = 0; i <= total; i++) {
    if (read[i] === 1) {
      const n = Math.min(i, W);
      if (n < nMin || BigInt(n + 1) * A.n < A.d) threshold[i] = Number.NaN; // alpha (n + 1) < 1 is p(n, alpha) > n
      else {
        const p = splitRankRational(n, numerator(steps, misses), den);
        threshold[i] = p > n ? Number.POSITIVE_INFINITY : p < 1 ? Number.NEGATIVE_INFINITY : sorted.at(p);
      }
    }
    if (i === total) break;
    const s = scores[i] as number, d = evidence.decided_after[i] as number, t = threshold[d] as number;
    if (!Number.isNaN(t)) {
      steps++;
      if (s > t) misses++;
      if (!Number.isFinite(t)) noRegion++;
      if (i - d > maxDelay) maxDelay = i - d;
    }
    if (i >= W) sorted.remove(scores[i - W] as number);
    sorted.add(s);
  }

  const window = scores.slice(Math.max(0, total - W));
  const level = aciLevel(steps, misses, A, G);
  const bound = steps === 0 ? null : aciBound(steps, maxDelay, A, G);
  const now = threshold[total] as number;
  const core = { gamma: evidence.gamma, windowSize: W, level, steps, misses, noRegion, maxDelay, bound, window };
  if (Number.isNaN(now)) return { ...core, region: { kind: "warmup" } };
  if (now === Number.POSITIVE_INFINITY) return { ...core, region: { kind: "whole" } };
  if (now === Number.NEGATIVE_INFINITY) return { ...core, region: { kind: "empty" } };
  const rank = splitRankRational(window.length, level.n, level.d);
  return { ...core, region: { kind: "quantile", qhat: scoreAtRank(window, rank) as number, rank } }; // sorted three-way, as L1: the same double, -0 included
}
