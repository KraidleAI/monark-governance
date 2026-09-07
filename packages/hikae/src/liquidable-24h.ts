/**
 * HIKAE — `ukemi-liquidable-24h` class: generator of seeded SYNTHETIC pairs for the
 * calibration of the `interval` conformer (ADR-M003 D6.2). n=300, α=0.01.
 *
 * PRNG: `mulberry32` REUSED from the S2 instrument (`./s2/instrument.ts`) — no `Math.random`,
 * no clock read (determinism, hash stability). The calibration/test split derives from the
 * SAME seeded stream (exchangeability: calibration and test drawn from the same law).
 *
 * DECLARED, UNFOUNDED MODEL (ADR-M003 pre-verif 3, D6.2): `ŷ_i` = predicted liquidatable amount of
 * a noised reference; `y_i = ŷ_i + ε_i`, `ε_i` a declared SYMMETRIC residual. NO source of realized
 * 24 h liquidated-debt label exists in the corpus ⇒ the coverage guarantee holds only
 * on these synthetic pairs; "real data" is NOT claimed. The real 24 h label remains
 * a formed pending item (ADR-M003 §4: "real 24h label = no source").
 *
 * IMPOSED (D6.2, item 6): every output (report/journal/panel) of this class carries the D10 line
 * with `harness_version = fixtures-synth` and the word "synthetic" next to the identifier —
 * see `liquidable24hProvenanceLine`.
 */
import { mulberry32 } from "./s2/instrument.ts";
import type { CalibPair } from "./interval-conformer.ts";

/** Class identifier (names the UKEMI upstream predictor; conformed by HIKAE). */
export const LIQUIDABLE_24H_CLASS = "ukemi-liquidable-24h";
/** Harness version imposed on every output of the class (D6.2). */
export const LIQUIDABLE_24H_HARNESS = "fixtures-synth";
export const LIQUIDABLE_24H_ALPHA = 0.01;
export const LIQUIDABLE_24H_N = 300;
/**
 * Minimal n to produce a `q̂` at α=0.01: `⌈(n+1)(1−α)⌉ ≤ n` ⟺ n ≥ 99
 * (at n=98: `⌈99·0.99⌉ = 99 > 98` ⇒ under-calibration; at n=99: `⌈100·0.99⌉ = 99 = n`).
 */
export const LIQUIDABLE_24H_NMIN = 99;

// DECLARED fixture parameters, unfounded (no product default fixes a value for them).
const BASE = 1000; // predicted liquidatable amount of reference (declared units)
const SPREAD = 200; // dispersion of ŷ around BASE
const NOISE = 50; // amplitude of the symmetric residual ε ⇒ |y − ŷ| ∈ [0, NOISE], continuous (no ties)

/**
 * `n` deterministic synthetic pairs `(ŷ_i, y_i)` for `seed`. The stream being seeded, calling with
 * `n = nCalib + mTest` then slicing gives an exchangeable calibration and hold-out (test 34).
 */
export function generateLiquidable24hPairs(seed: number, n: number = LIQUIDABLE_24H_N): CalibPair[] {
  const rnd = mulberry32(seed);
  const out: CalibPair[] = [];
  for (let i = 0; i < n; i++) {
    const yhat = BASE + (rnd() - 0.5) * 2 * SPREAD; // prediction (center of the region)
    const noise = (rnd() - 0.5) * 2 * NOISE; // declared symmetric residual
    out.push({ yhat, y: yhat + noise });
  }
  return out;
}

/**
 * D10 provenance line (D6.2) — `harness_version=fixtures-synth`, "synthetic" next to the
 * identifier. `generatedOn` is INJECTED (never a clock read), for output stability.
 */
export function liquidable24hProvenanceLine(
  seed: number,
  n: number = LIQUIDABLE_24H_N,
  generatedOn: string,
): string {
  return (
    `D10: class = \`${LIQUIDABLE_24H_CLASS}\` (synthetic) · n = ${n} · α = ${LIQUIDABLE_24H_ALPHA} · ` +
    `seed = ${seed} · harness_version = \`${LIQUIDABLE_24H_HARNESS}\` · date (injected) = ${generatedOn}`
  );
}
