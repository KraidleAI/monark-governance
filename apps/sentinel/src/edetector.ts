// EDETECTOR — Shin, Ramdas & Rinaldo (2022) e-detector of drift, pre-registered (ADR-M014). PURE: no I/O,
// no `node:` builtin, no import of the timeline/flow/run engine. A DESIGN artefact folded on the committed
// calm-pair misses; cited as evidence, NEVER a trigger (ADR-M014 D2); NEVER carried into state.json
// (ADR-M012 D6). It reads the conditional calm miss rate, nothing else.
//
// Base increment (SRR eq. (65) p. 24): L_n^(lambda) = exp{ lambda*(X_n - p0) - B(lambda) }, with the
// CENTRED Bernoulli cumulant B(lambda) = log(1 - p0 + p0*e^lambda) - lambda*p0 (SRR l. 1558; C-1). Centring
// makes E_{p0}[L^(lambda)] = 1 exactly, so each L is a valid baseline increment (SRR Def. 2.8, ineq. (11)).
// At lambda* = log(q(1-p0)/(p0(1-q))) the increment equals the Bernoulli likelihood ratio (SRR p. 25), so a
// single-component e-CUSUM max equals the Page CUSUM max (bridgeMonoLambda identity). The mixture over K
// geometric lambda with uniform weights is a fixed e-detector (SRR Prop. 2.3), whose average run length is
// at least 1/alpha_arl calm pairs against the WORST member of the class (SRR Thm 2.4). Nothing here is a
// delay bound or a rate; the class p0 = 0.30 carries a bound, the disqualified p0 = 0.125 does not.
import type { Miscover } from "@monark/hikae";

/** Pre-registered e-detector constants (ADR-M014 D1). Recomputed/read by the test, never pasted elsewhere. */
export const EDET = { p0: 0.30, qL: 0.40, qU: 0.90, alphaArl: 1e-3, K: 12, startAfterDay: "2025-10-15" } as const;

/** The disqualified class of ADR-M014 D6/C-2: p0 = 0.125 crosses in-sample (it excludes the calm reference). */
export const DISQUALIFIED_P0 = 0.125;

/** log(exp a + exp b), overflow-safe. */
function logSumExp(a: number, b: number): number {
  if (a === -Infinity) return b;
  if (b === -Infinity) return a;
  const m = Math.max(a, b);
  return m + Math.log(Math.exp(a - m) + Math.exp(b - m));
}

/** lambda*(q, p0) = log( q(1-p0) / (p0(1-q)) ): the tilt whose baseline increment is the Bernoulli LR. */
export function lambdaStar(q: number, p0: number): number {
  return Math.log((q * (1 - p0)) / (p0 * (1 - q)));
}

/** Centred Bernoulli cumulant B(lambda) = log(1 - p0 + p0*e^lambda) - lambda*p0 (SRR l. 1558; C-1). The
 *  `- lambda*p0` term is what makes E_{p0}[L] = 1; dropping it is a measured mutant (reddens tests 1, 3, 4a). */
export function cumulant(lambda: number, p0: number): number {
  return logSumExp(Math.log(1 - p0), Math.log(p0) + lambda) - lambda * p0;
}

/** log of the base increment L_n^(lambda) = exp{ lambda(x - p0) - B(lambda) } (SRR eq. (65)). */
export function logBaseIncrement(x: Miscover, lambda: number, p0: number): number {
  return lambda * (x - p0) - cumulant(lambda, p0);
}

/** A fixed mixture grid: K lambda values with their weights. Every lambda MUST be > 0 (a non-positive tilt
 *  is not a valid post-change direction; SRR mixes over (qL, qU) with qL, qU > p0), and the weights sum to 1. */
export interface Grid {
  readonly lambdas: readonly number[];
  readonly weights: readonly number[];
}

/** K lambda geometrically spaced in [lo, hi], uniform weights 1/K. Throws unless 0 < lo < hi (the lambda>0
 *  guard; removing it is a measured mutant). SRR Alg. 3 spaces the KL, not lambda — the lambda spacing and
 *  K = 12 are declared tuning choices (ADR-M014 D1, C-9); validity is independent of them (Prop. 2.3). */
export function makeGrid(lo: number, hi: number, K: number): Grid {
  if (!Number.isInteger(K) || K < 1) throw new Error(`makeGrid: K must be a positive integer (got ${String(K)})`);
  if (!(lo > 0)) throw new Error(`makeGrid: lambda must be > 0 (lo = ${String(lo)})`);
  if (K === 1) return { lambdas: [lo], weights: [1] };
  if (!(hi > lo)) throw new Error(`makeGrid: need hi > lo > 0 (lo = ${String(lo)}, hi = ${String(hi)})`);
  const ratio = Math.pow(hi / lo, 1 / (K - 1));
  const lambdas: number[] = [];
  for (let i = 0; i < K; i++) lambdas.push(lo * Math.pow(ratio, i));
  const weights = new Array<number>(K).fill(1 / K);
  return { lambdas, weights };
}

/** The D1 grid for a p0: K = 12 geometric lambda in [lambda*(qL), lambda*(qU)], uniform weights. */
export function gridFor(p0: number): Grid {
  return makeGrid(lambdaStar(EDET.qL, p0), lambdaStar(EDET.qU, p0), EDET.K);
}

/** First index n with logM_n >= threshold — the SRR Thm 2.4 stopping rule M_n >= 1/alpha_arl. The `>=`
 *  (not `>`) is load-bearing: `>` misses a value landing exactly on the threshold (measured mutant). */
export function firstCrossing(logM: readonly number[], threshold: number): number | null {
  for (let n = 0; n < logM.length; n++) if (logM[n]! >= threshold) return n;
  return null;
}

/** Outcome of a mixture run (PLAN §1.1). The per-step log-mixture arrays stay INSIDE the run — buildEDetector
 *  extracts only scalars for the published section, so they never reach the JSON surface. */
export interface EDetectorRun {
  readonly n: number;
  readonly misses: number;
  readonly logM_sr: readonly number[];
  readonly logM_cu: readonly number[];
  readonly max_logM_sr: number;
  readonly max_logM_cu: number;
  readonly threshold: number;
  readonly crossed_sr: number | null;
  readonly crossed_cu: number | null;
}

/**
 * Run the mixture e-SR and e-CUSUM over a calm-pair miss sequence, in the log domain (log-sum-exp), so the
 * high-lambda components never overflow. Per component:
 *   e-SR:    M_n = L_n * (M_{n-1} + 1)     (SRR Def. 2.12 p. 10)
 *   e-CUSUM: M_n = L_n * max(M_{n-1}, 1)   (SRR Def. 2.11 eq. (14) p. 9)
 * with M_0 = 0 (log M_0 = -inf). The mixture is sum_j weight_j * M_n^(j) (SRR Prop. 2.3). Returns the running
 * maxima and the first index each mixture crosses log(1/alpha_arl); the crossing is `>=` (firstCrossing).
 */
export function runEDetector(sequence: readonly Miscover[], p0: number, grid: Grid, alphaArl: number = EDET.alphaArl): EDetectorRun {
  const K = grid.lambdas.length;
  const threshold = Math.log(1 / alphaArl);
  const logW = grid.weights.map((w) => Math.log(w));
  const sr = new Array<number>(K).fill(-Infinity); // log M^SR per component
  const cu = new Array<number>(K).fill(-Infinity); // log M^CU per component
  const logM_sr: number[] = [], logM_cu: number[] = [];
  let max_logM_sr = -Infinity, max_logM_cu = -Infinity;
  let misses = 0;
  for (let n = 0; n < sequence.length; n++) {
    const x = sequence[n]!;
    misses += x;
    let mix_sr = -Infinity, mix_cu = -Infinity;
    for (let j = 0; j < K; j++) {
      const li = logBaseIncrement(x, grid.lambdas[j]!, p0);
      sr[j] = li + logSumExp(sr[j]!, 0);  // M_n = L_n * (M_{n-1} + 1)
      cu[j] = li + Math.max(cu[j]!, 0);    // M_n = L_n * max(M_{n-1}, 1)
      mix_sr = logSumExp(mix_sr, logW[j]! + sr[j]!);
      mix_cu = logSumExp(mix_cu, logW[j]! + cu[j]!);
    }
    logM_sr.push(mix_sr); logM_cu.push(mix_cu);
    if (mix_sr > max_logM_sr) max_logM_sr = mix_sr;
    if (mix_cu > max_logM_cu) max_logM_cu = mix_cu;
  }
  // ONE crossing predicate (firstCrossing, `>=`): the Thm 2.4 stopping rule lives in exactly one place.
  return {
    n: sequence.length, misses, logM_sr, logM_cu, max_logM_sr, max_logM_cu, threshold,
    crossed_sr: firstCrossing(logM_sr, threshold),
    crossed_cu: firstCrossing(logM_cu, threshold),
  };
}

/** Single-component e-CUSUM at lambda*(p1, p0): its max_logM_cu equals pageCusumMax (identity test 1). */
export function bridgeMonoLambda(sequence: readonly Miscover[], p0: number, p1: number): EDetectorRun {
  const grid: Grid = { lambdas: [lambdaStar(p1, p0)], weights: [1] };
  return runEDetector(sequence, p0, grid);
}
