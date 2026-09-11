/**
 * HIKAE — S2 instrument (ADR-M002 D10; design ADOPTED from Grok doc 11 §2/§5.1/§7/§8,
 * input never lifted, rewritten for our contracts). DISPOSABLE harness (does not promote itself).
 *
 * S2a plumbing (declared synthetic binary class): "are the quantile and the gate
 * wired?". S2b beachhead `btc-dir-15m` (synthetic fixtures here — the J0 probe on
 * Coinbase, decided by a product decision (a), comes later; NO network fetch here).
 *
 * Determinism: SEEDED `mulberry32` PRNG (no `Math.random`, no clock read — hash
 * stability, D7). COMMITTED split (seed + "chronological first-n" rule). EX ANTE strata.
 *
 * `harness_version = "fixtures-synth"`. A negative result = a result: an S2b at ~100 %
 * abstention is written with n, m, q̂ (D10), never softened.
 */
import { indicatorScore, indicatorScores, conformalSet, splitQuantile } from "../l1-split.ts";
import type { SplitResult } from "../l1-split.ts";
import { gate } from "../l3-gate.ts";
import type { GateInput } from "../l3-gate.ts";
import { buildSetRegion, buildVerdict, underCalibVerdict, BTC_DIR_LABELS } from "../index.ts";
import {
  extractMomentumFeatures,
  momentum4c,
  oracleDidactique,
  labelOf,
  MOMENTUM_4C_ID,
  ORACLE_DIDACTIQUE_ID,
} from "../predictor.ts";
import type { Candle } from "../predictor.ts";
import type { GateDecision, Prediction } from "@monark/contracts";
import { serializePrediction } from "@monark/contracts";

export const HARNESS_VERSION = "fixtures-synth";
const SCHEMA_VERSION = "1.0.0";
const T0 = "2026-09-04T00:00:00Z"; // injected timestamp (never read) — hash stability.

/** Deterministic seeded PRNG (mulberry32) — reproducible, clock-independent. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Stratum = "asia" | "americas" | "mid";

/** EX ANTE strata (D10): `asia` 00-08 UTC, `americas` 13-21 UTC, rest `mid` (outside per-stratum inference). */
export function strataOf(hourUtc: number): Stratum {
  if (hourUtc >= 0 && hourUtc < 8) return "asia";
  if (hourUtc >= 13 && hourUtc < 21) return "americas";
  return "mid";
}

export interface LabeledPoint {
  readonly index: number;
  /** Decision instant `t` (UTC seconds) when the point comes from a candle series; 0 for synthetic S2a. */
  readonly closeTime: number;
  /** Predictor that produced `yhat` (`internal:*`); `"synthetic"` for the S2a draw. */
  readonly predictorId: string;
  readonly hourUtc: number;
  readonly stratum: Stratum;
  readonly yhat: "up" | "down";
  /** Realized label; `non_evaluable` is excluded from calibration and hold-out, counted separately. */
  readonly y: "up" | "down" | "non_evaluable";
}

export interface GenParams {
  readonly seed: number;
  readonly n: number;
  /** Probability that `y === yhat` (predictor accuracy). ~0.5 = coin (momentum on BTC 15 min). */
  readonly accuracy: number;
  /** Fraction of `non_evaluable` points (close==open equality). */
  readonly nonEvaluableRate?: number;
}

/** Deterministic labelled series (S2a plumbing or S2b beachhead depending on `accuracy`). */
export function generateLabeledSeries(params: GenParams): LabeledPoint[] {
  const rnd = mulberry32(params.seed);
  const neRate = params.nonEvaluableRate ?? 0;
  const out: LabeledPoint[] = [];
  for (let i = 0; i < params.n; i++) {
    const hourUtc = Math.floor(rnd() * 24);
    const yhat: "up" | "down" = rnd() < 0.5 ? "up" : "down";
    let y: "up" | "down" | "non_evaluable";
    if (rnd() < neRate) {
      y = "non_evaluable";
    } else {
      const correct = rnd() < params.accuracy;
      y = correct ? yhat : yhat === "up" ? "down" : "up";
    }
    out.push({ index: i, closeTime: 0, predictorId: "synthetic", hourUtc, stratum: strataOf(hourUtc), yhat, y });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Synthetic CANDLE series + REAL wiring of the D7 predictors (review corr. 1):
// the frozen chain is entered at step 1 — `predictor → Prediction → conformer`.
// ---------------------------------------------------------------------------

export interface CandleGenParams {
  readonly seed: number;
  readonly n: number;
  /** `close_time` of the first candle (UTC seconds, 15-min aligned). Injected datum. */
  readonly startCloseTime: number;
  readonly startPrice: number;
  /** Max amplitude of a step (fraction): symmetric random walk ⇒ momentum ≈ coin. */
  readonly stepPct: number;
  /** Fraction of `close == open` candles (⇒ `non_evaluable`). */
  readonly flatRate?: number;
}

/** Seeded random walk on a 15-min grid: `open = previous close`. No network, no clock. */
export function generateCandleSeries(p: CandleGenParams): Candle[] {
  const rnd = mulberry32(p.seed);
  const flat = p.flatRate ?? 0;
  const out: Candle[] = [];
  let prev = p.startPrice;
  for (let i = 0; i < p.n; i++) {
    const open = prev;
    const close = rnd() < flat ? open : open * (1 + (rnd() - 0.5) * 2 * p.stepPct);
    out.push({ close_time: p.startCloseTime + i * 900, open, close });
    prev = close;
  }
  return out;
}

export type PredictorKind = "momentum-4c" | "oracle-didactique";

export interface PredictorRun {
  readonly predictorId: string;
  readonly points: LabeledPoint[];
  /** The emitted `Prediction`s (frozen contract, closed — `serializePrediction` applied to each). */
  readonly predictions: Prediction[];
  /** Windows without 5 completed features (start of series). */
  readonly nWarmup: number;
  /** Windows where the PREDICTOR has no direction (`close[t] == close[t-60]`) — excluded, counted. */
  readonly nPredictorNonEvaluable: number;
}

/**
 * Applies a D7 predictor to a candle series: at each decision `t = close_time` of the
 * last completed candle, features = 5 closes ≤ t (`extractMomentumFeatures`, anti-look-ahead
 * guard), `ŷ = momentum4c(features)` or `ŷ = oracleDidactique(candle [t,t+15))` (ŷ=y by
 * construction — didactic mutant, NOT a product), `y = labelOf(candle [t,t+15))`.
 */
export function labeledFromPredictor(candles: readonly Candle[], kind: PredictorKind): PredictorRun {
  const byClose = new Map<number, Candle>(candles.map((c) => [c.close_time, c]));
  const predictorId = kind === "momentum-4c" ? MOMENTUM_4C_ID : ORACLE_DIDACTIQUE_ID;
  const points: LabeledPoint[] = [];
  const predictions: Prediction[] = [];
  let nWarmup = 0;
  let nPredictorNonEvaluable = 0;
  for (let i = 1; i < candles.length; i++) {
    const prevCandle = candles[i - 1]!;
    const target = candles[i]!;
    const t = prevCandle.close_time;
    if (i < 5) {
      nWarmup++;
      continue;
    }
    const yhatDir =
      kind === "momentum-4c" ? momentum4c(extractMomentumFeatures(byClose, t)) : oracleDidactique(target);
    if (yhatDir === "non_evaluable") {
      nPredictorNonEvaluable++;
      continue;
    }
    const pred: Prediction = {
      schema_version: SCHEMA_VERSION,
      task_class: "btc-dir-15m",
      yhat: yhatDir,
      predictor_id: predictorId,
      produced_at: new Date(t * 1000).toISOString(), // formatting of a CARRIED instant, not a clock read
    };
    serializePrediction(pred); // frozen-contract closed-check: throws on a foreign key
    predictions.push(pred);
    const y = labelOf(target);
    const hourUtc = Math.floor((t % 86400) / 3600);
    points.push({
      index: i,
      closeTime: t,
      predictorId,
      hourUtc,
      stratum: strataOf(hourUtc),
      yhat: pred.yhat as "up" | "down",
      y,
    });
  }
  return { predictorId, points, predictions, nWarmup, nPredictorNonEvaluable };
}

export interface CampaignParams {
  readonly label: string; // "S2a" | "S2b" | stratum
  readonly points: readonly LabeledPoint[];
  readonly alpha: number;
  readonly nMin: number;
  readonly tau: number;
  readonly nCalib: number;
}

/** One RAW JOURNAL line per point (D10: every figure recomputes without trusting HIKAE). */
export interface PointTrace {
  readonly index: number;
  readonly closeTime: number;
  readonly hourUtc: number;
  readonly stratum: Stratum;
  readonly predictorId: string;
  readonly yhat: string;
  readonly y: string;
  readonly role: "calib" | "holdout" | "excluded";
  readonly score: number | null;
  readonly set: string;
  readonly covered: boolean | null;
  readonly action: "commit" | "abstain" | "—";
}

export interface CampaignResult {
  readonly label: string;
  readonly params: { readonly alpha: number; readonly nMin: number; readonly tau: number; readonly nCalib: number };
  readonly rows: readonly PointTrace[];
  readonly nEvaluable: number;
  readonly nNonEvaluable: number;
  readonly nCalib: number;
  readonly mHoldout: number;
  readonly split: SplitResult;
  /** Empirical coverage INCLUDING abstentions (the CP guarantee, D10 step 4). */
  readonly coverageAll: number | null;
  /** Action-CONDITIONAL coverage (|C|<=tau) — desk figure, "not the CP guarantee". */
  readonly coverageConditional: number | null;
  readonly abstentionRate: number | null;
  readonly commitRate: number | null;
}

/**
 * One split-CP pass (S2a, S2b, or a stratum). COMMITTED split: the first `nCalib` EVALUABLE
 * points (chronological order = series order) form the calibration, the rest the
 * hold-out (no data-snooping; rule + seed committed upstream). Coverage computed
 * with abstentions included; action-conditional coverage published separately, labelled.
 */
export function runSplitCampaign(params: CampaignParams): CampaignResult {
  const evaluable = params.points.filter((p) => p.y !== "non_evaluable");
  const nNonEvaluable = params.points.length - evaluable.length;
  const calib = evaluable.slice(0, params.nCalib);
  const holdout = evaluable.slice(params.nCalib);
  const calibSet = new Set(calib.map((p) => p.index));
  const cparams = { alpha: params.alpha, nMin: params.nMin, tau: params.tau, nCalib: params.nCalib };

  const calibScores = calib.map((p) => indicatorScore(p.yhat, p.y as string));
  const split = splitQuantile(calibScores, params.alpha, params.nMin);

  const rows: PointTrace[] = [];
  const base = (p: LabeledPoint) => ({
    index: p.index,
    closeTime: p.closeTime,
    hourUtc: p.hourUtc,
    stratum: p.stratum,
    predictorId: p.predictorId,
    yhat: p.yhat,
    y: p.y,
  });
  for (const p of params.points) {
    if (p.y === "non_evaluable") {
      rows.push({ ...base(p), role: "excluded", score: null, set: "", covered: null, action: "—" });
    } else if (calibSet.has(p.index)) {
      rows.push({ ...base(p), role: "calib", score: indicatorScore(p.yhat, p.y), set: "", covered: null, action: "—" });
    }
  }

  if ("reason" in split) {
    for (const p of holdout) rows.push({ ...base(p), role: "holdout", score: null, set: "", covered: null, action: "—" });
    rows.sort((a, b) => a.index - b.index);
    return {
      label: params.label,
      params: cparams,
      rows,
      nEvaluable: evaluable.length,
      nNonEvaluable,
      nCalib: calib.length,
      mHoldout: holdout.length,
      split,
      coverageAll: null,
      coverageConditional: null,
      abstentionRate: null,
      commitRate: null,
    };
  }

  const qhat = split.qhat;
  let covered = 0;
  let abstained = 0;
  let committed = 0;
  let condCovered = 0;
  for (const p of holdout) {
    const scores = indicatorScores(p.yhat, BTC_DIR_LABELS);
    const set = conformalSet(scores, qhat);
    const isCovered = set.includes(p.y);
    if (isCovered) covered++;
    const abstain = set.length > params.tau;
    if (abstain) {
      abstained++;
    } else {
      committed++;
      if (isCovered) condCovered++;
    }
    rows.push({
      ...base(p),
      role: "holdout",
      score: indicatorScore(p.yhat, p.y),
      set: `{${set.join(",")}}`,
      covered: isCovered,
      action: abstain ? "abstain" : "commit",
    });
  }
  rows.sort((a, b) => a.index - b.index);
  const m = holdout.length;
  return {
    label: params.label,
    params: cparams,
    rows,
    nEvaluable: evaluable.length,
    nNonEvaluable,
    nCalib: calib.length,
    mHoldout: m,
    split,
    coverageAll: m > 0 ? covered / m : null,
    coverageConditional: committed > 0 ? condCovered / committed : null,
    abstentionRate: m > 0 ? abstained / m : null,
    commitRate: m > 0 ? committed / m : null,
  };
}

// ---------------------------------------------------------------------------
// The 9 MECHANISM states (block "mechanism demo" of (e); oracle of test 14).
// 3 COMMIT / 2 DEFER / 3 ABSTAIN / 1 under_calib, all produced by the REAL `gate()`.
// Verdicts built with DECLARED scores (not ŷ=y — review corr. 1): the COMMIT from a
// 47/50 calibration (3 errors ⇒ q̂=0 ⇒ singleton); the DEFER from a half-wrong
// calibration (25/50 ⇒ q̂=1 ⇒ {up,down}); the ABSTAIN from the mutants (timeout, intent outside region,
// budget exhausted); under_calib from n<n_min. The REAL didactic oracle is run in `run.ts`
// (block 6b of the report), without touching this set (frozen digest, test 14).
// ---------------------------------------------------------------------------

const GOOD_SCORES: readonly number[] = Array.from({ length: 50 }, (_, i) => (i < 47 ? 0 : 1)); // 3/50 → q̂=0
const BAD_SCORES: readonly number[] = Array.from({ length: 50 }, (_, i) => (i % 2 === 0 ? 1 : 0)); // 25/50 → q̂=1
const TEN_SCORES: readonly number[] = [0, 0, 1, 0, 0, 1, 0, 0, 0, 1];

function commitVerdict() {
  return buildVerdict({
    taskClass: "btc-dir-15m",
    method: "hac-cp",
    alpha: 0.1,
    scores: GOOD_SCORES,
    region: buildSetRegion(["up"]),
    qhat: 0,
    abstain: false,
    reason: "covered",
    residual: ["assume:tls-notary", "assume:delegation"],
    producedAt: T0,
    schemaVersion: SCHEMA_VERSION,
  });
}
function deferVerdict() {
  return buildVerdict({
    taskClass: "btc-dir-15m",
    method: "hac-cp",
    alpha: 0.1,
    scores: BAD_SCORES,
    region: buildSetRegion(["up", "down"]),
    qhat: 1,
    abstain: true,
    reason: "set_too_large",
    residual: ["assume:tls-notary"],
    producedAt: T0,
    schemaVersion: SCHEMA_VERSION,
  });
}

function baseInput(over: Partial<GateInput> & { verdict: GateInput["verdict"]; intent: GateInput["intent"] }): GateInput {
  return {
    remainingBudget: 0.1,
    bFloor: 0,
    tau: 1,
    tauInterval: 1, // inert here: these demo states are all `set` (M003 D6.1 interval path not exercised)
    nCalib: 50,
    nMin: 50,
    clockOpen: true,
    timedOut: false,
    evaluable: true,
    tool: "perps_order_preview",
    schemaVersion: SCHEMA_VERSION,
    ...over,
  };
}

/** The 9 mechanism GateDecisions, in a stable order (test 14 oracle + demo block). */
export function demoStates(): { readonly id: string; readonly decision: GateDecision }[] {
  const commit = commitVerdict();
  const defer = deferVerdict();
  return [
    { id: "01-commit-up", decision: gate(baseInput({ verdict: commit, intent: "up", remainingBudget: 0.1 })) },
    { id: "02-commit-up-b", decision: gate(baseInput({ verdict: commit, intent: "up", remainingBudget: 0.08 })) },
    { id: "03-commit-up-lowbudget", decision: gate(baseInput({ verdict: commit, intent: "up", remainingBudget: 0.02 })) },
    { id: "04-defer", decision: gate(baseInput({ verdict: defer, intent: "up" })) },
    { id: "05-defer-b", decision: gate(baseInput({ verdict: defer, intent: "down", remainingBudget: 0.06 })) },
    { id: "06-abstain-intent", decision: gate(baseInput({ verdict: commit, intent: "down" })) },
    { id: "07-abstain-timeout", decision: gate(baseInput({ verdict: commit, intent: "up", timedOut: true })) },
    { id: "08-abstain-budget", decision: gate(baseInput({ verdict: commit, intent: "up", remainingBudget: -0.02, bFloor: 0 })) },
    {
      id: "09-under-calib",
      decision: gate(
        baseInput({
          verdict: underCalibVerdict({
            taskClass: "btc-dir-15m",
            method: "hac-cp",
            alpha: 0.1,
            scores: TEN_SCORES,
            residual: [],
            producedAt: T0,
            schemaVersion: SCHEMA_VERSION,
          }),
          intent: "up",
          nCalib: 10,
        }),
      ),
    },
  ];
}

export interface MutantOutcome {
  readonly id: "M1" | "M2" | "M3" | "M4" | "M5";
  readonly name: string;
  readonly pass: boolean;
  readonly detail: string;
}

/**
 * Seeded negative controls (D10 step 7) — an instrument that never rejected has shown
 * nothing. M5 (`p_correct` in serialization ⇒ throws) is verified in the dedicated test
 * (`no_p_correct_field`) since it exercises the frozen contract; here we carry the mechanical M1-M4.
 */
/** DECLARED parameters of the M2 mutant (block 1 of the report) — recalculable. */
export const M2_PARAMS = { seed: 42, n: 120, accuracy: 0.95, nCalib: 60 } as const;

/** The two M2 campaigns (clean / flipped labels), exposed for the raw journal (G2 delta 5.2). */
export function m2Campaigns(): { clean: CampaignResult; broken: CampaignResult } {
  const base = generateLabeledSeries({ seed: M2_PARAMS.seed, n: M2_PARAMS.n, accuracy: M2_PARAMS.accuracy });
  const clean = runSplitCampaign({ label: "M2-clean", points: base, alpha: 0.1, nMin: 50, tau: 1, nCalib: M2_PARAMS.nCalib });
  const flipped = base.map((p): LabeledPoint =>
    p.index >= M2_PARAMS.nCalib && p.y !== "non_evaluable"
      ? { ...p, y: p.y === "up" ? "down" : "up" }
      : p,
  );
  const broken = runSplitCampaign({ label: "M2-flip", points: flipped, alpha: 0.1, nMin: 50, tau: 1, nCalib: M2_PARAMS.nCalib });
  return { clean, broken };
}

export function runMutants(): MutantOutcome[] {
  const out: MutantOutcome[] = [];

  // M1 — under_calib: n=10 < 50 ⇒ no q̂.
  const m1 = splitQuantile(TEN_SCORES, 0.1, 50);
  out.push({
    id: "M1",
    name: "under_calib (n=10<50 ⇒ no q̂)",
    pass: "reason" in m1 && m1.reason === "under_calib",
    detail: JSON.stringify(m1),
  });

  // M2 — labels flipped after q̂ is frozen ⇒ coverage breaks clearly below 1-α.
  const { clean, broken } = m2Campaigns();
  const cleanCov = clean.coverageAll ?? 0;
  const brokenCov = broken.coverageAll ?? 1;
  out.push({
    id: "M2",
    name: "flipped labels (hold-out) ⇒ coverage breaks",
    pass: brokenCov < cleanCov - 0.2,
    detail: `coverage clean=${cleanCov.toFixed(3)} → flipped=${brokenCov.toFixed(3)}`,
  });

  // M3 — UsePod timeout ⇒ deny / upstream_timeout, never a set.
  const m3 = gate(baseInput({ verdict: commitVerdict(), intent: "up", timedOut: true }));
  out.push({
    id: "M3",
    name: "timeout ⇒ ABSTAIN upstream_timeout",
    pass: m3.action === "abstain" && m3.reason === "upstream_timeout" && m3.allow === false,
    detail: `${m3.action}/${m3.reason}`,
  });

  // M4 — `MAYBE` parse ⇒ non_evaluable, not an invented label.
  const m4 = gate(baseInput({ verdict: commitVerdict(), intent: "up", evaluable: false }));
  out.push({
    id: "M4",
    name: "non-evaluable parse ⇒ ABSTAIN non_evaluable",
    pass: m4.action === "abstain" && m4.reason === "non_evaluable",
    detail: `${m4.action}/${m4.reason}`,
  });

  // M5 — p_correct injected ⇒ serialization throws: carried by the `no_p_correct_field` test.
  out.push({
    id: "M5",
    name: "p_correct injected ⇒ serializeVerdict throws (see test no_p_correct_field)",
    pass: true,
    detail: "exercised on the frozen contract in the dedicated test",
  });

  return out;
}
