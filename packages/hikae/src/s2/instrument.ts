/**
 * HIKAE — instrument S2 (ADR-M002 D10 ; conception ADOPTÉE de Grok doc 11 §2/§5.1/§7/§8,
 * input jamais lifté, réécrite pour nos contrats). Harnais JETABLE (R-22 : ne se promeut pas).
 *
 * S2a plomberie (classe binaire synthétique déclarée) : « le quantile et le gate sont-ils
 * câblés ? ». S2b beachhead `btc-dir-15m` (fixtures synthétiques ici — la sonde J0 sur
 * Coinbase, décidée par l'investisseur (a), est ultérieure ; PAS de fetch réseau ici).
 *
 * Déterminisme : PRNG `mulberry32` SEEDÉ (aucun `Math.random`, aucune horloge lue — stabilité
 * des hashes, D7). Split COMMITTÉ (graine + règle « first-n chronologique »). Strates EX ANTE.
 *
 * `harness_version = "fixtures-synth"`. Résultat négatif = résultat : un S2b à ~100 %
 * d'abstention s'écrit avec n, m, q̂ (D10), jamais adouci.
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
const T0 = "2026-09-04T00:00:00Z"; // horodatage injecté (jamais lu) — stabilité des hashes.

/** PRNG déterministe seedé (mulberry32) — reproductible, indépendant de l'horloge. */
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

/** Strates EX ANTE (D10) : `asia` 00-08 UTC, `americas` 13-21 UTC, reste `mid` (hors inférence par strate). */
export function strataOf(hourUtc: number): Stratum {
  if (hourUtc >= 0 && hourUtc < 8) return "asia";
  if (hourUtc >= 13 && hourUtc < 21) return "americas";
  return "mid";
}

export interface LabeledPoint {
  readonly index: number;
  /** Instant de décision `t` (secondes UTC) quand le point vient d'une série de bougies ; 0 pour S2a synthétique. */
  readonly closeTime: number;
  /** Prédicteur ayant produit `yhat` (`internal:*`) ; `"synthetic"` pour le tirage S2a. */
  readonly predictorId: string;
  readonly hourUtc: number;
  readonly stratum: Stratum;
  readonly yhat: "up" | "down";
  /** Label réalisé ; `non_evaluable` est exclu de la calibration et du hold-out, compté à part. */
  readonly y: "up" | "down" | "non_evaluable";
}

export interface GenParams {
  readonly seed: number;
  readonly n: number;
  /** Probabilité que `y === yhat` (précision du prédicteur). ~0.5 = pièce (momentum sur BTC 15 min). */
  readonly accuracy: number;
  /** Fraction de points `non_evaluable` (égalité close==open). */
  readonly nonEvaluableRate?: number;
}

/** Série labellisée déterministe (S2a plomberie ou S2b beachhead selon `accuracy`). */
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
// Série de BOUGIES synthétique + câblage RÉEL des prédicteurs D7 (G2 Lot H corr. 1) :
// la chaîne gelée est entrée à l'étape 1 — `predictor → Prediction → conformer`.
// ---------------------------------------------------------------------------

export interface CandleGenParams {
  readonly seed: number;
  readonly n: number;
  /** `close_time` de la première bougie (secondes UTC, aligné 15 min). Donnée injectée. */
  readonly startCloseTime: number;
  readonly startPrice: number;
  /** Amplitude max d'un pas (fraction) : marche aléatoire symétrique ⇒ momentum ≈ pièce. */
  readonly stepPct: number;
  /** Fraction de bougies `close == open` (⇒ `non_evaluable`). */
  readonly flatRate?: number;
}

/** Marche aléatoire seedée sur grille 15 min : `open = close précédent`. Aucun réseau, aucune horloge. */
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
  /** Les `Prediction` émises (contrat gelé, fermées — `serializePrediction` appliqué à chacune). */
  readonly predictions: Prediction[];
  /** Fenêtres sans 5 features terminées (début de série). */
  readonly nWarmup: number;
  /** Fenêtres où le PRÉDICTEUR n'a pas de direction (`close[t] == close[t-60]`) — exclues, comptées. */
  readonly nPredictorNonEvaluable: number;
}

/**
 * Applique un prédicteur D7 à une série de bougies : à chaque décision `t = close_time` de la
 * dernière bougie terminée, features = 5 closes ≤ t (`extractMomentumFeatures`, garde anti
 * look-ahead), `ŷ = momentum4c(features)` ou `ŷ = oracleDidactique(bougie [t,t+15))` (ŷ=y par
 * construction — mutant didactique, PAS un produit), `y = labelOf(bougie [t,t+15))`.
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
      produced_at: new Date(t * 1000).toISOString(), // formatage d'un instant PORTÉ, pas une horloge lue
    };
    serializePrediction(pred); // closed-check du contrat gelé : lève sur clé étrangère
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
  readonly label: string; // "S2a" | "S2b" | strate
  readonly points: readonly LabeledPoint[];
  readonly alpha: number;
  readonly nMin: number;
  readonly tau: number;
  readonly nCalib: number;
}

/** Une ligne du JOURNAL BRUT par point (D10 : tout chiffre se recalcule sans croire HIKAE). */
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
  /** Couverture empirique INCLUANT les abstentions (la garantie CP, D10 étape 4). */
  readonly coverageAll: number | null;
  /** Couverture CONDITIONNELLE à l'action (|C|<=tau) — chiffre de desk, « pas la garantie CP ». */
  readonly coverageConditional: number | null;
  readonly abstentionRate: number | null;
  readonly commitRate: number | null;
}

/**
 * Une passe split-CP (S2a, S2b, ou une strate). Split COMMITTÉ : les `nCalib` premiers points
 * ÉVALUABLES (ordre chronologique = ordre de la série) forment la calibration, le reste le
 * hold-out (pas de data-snooping ; règle + graine committées en amont). Couverture calculée
 * abstentions incluses ; couverture conditionnelle à l'action publiée à part, étiquetée.
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
    const isCovered = set.includes(p.y as string);
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
      score: indicatorScore(p.yhat, p.y as string),
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
// Les 9 états de MÉCANISME (bloc « démo de mécanisme » de (e) ; oracle du test 14).
// 3 COMMIT / 2 DEFER / 3 ABSTAIN / 1 under_calib, tous produits par le VRAI `gate()`.
// Verdicts construits à scores DÉCLARÉS (pas ŷ=y — G2 Lot H corr. 1) : les COMMIT d'une
// calibration 47/50 (3 erreurs ⇒ q̂=0 ⇒ singleton) ; les DEFER d'une calibration à moitié
// fausse (25/50 ⇒ q̂=1 ⇒ {up,down}) ; les ABSTAIN des mutants (timeout, intent hors région,
// budget épuisé) ; under_calib de n<n_min. L'oracle didactique RÉEL est exécuté dans `run.ts`
// (bloc 6b du rapport), sans toucher ce jeu (digest figé, test 14).
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
    tauInterval: 1, // inerte ici : ces états de démo sont tous `set` (M003 D6.1 chemin interval non exercé)
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

/** Les 9 GateDecisions de mécanisme, dans un ordre stable (oracle test 14 + bloc démo). */
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
 * Contrôles négatifs semés (D10 étape 7) — un instrument qui n'a jamais rejeté n'a rien
 * montré. M5 (`p_correct` en sérialisation ⇒ lève) est vérifié dans le test dédié
 * (`no_p_correct_field`) car il exerce le contrat gelé ; ici on porte M1-M4 mécaniques.
 */
/** Paramètres DÉCLARÉS du mutant M2 (bloc 1 du rapport) — recalculables. */
export const M2_PARAMS = { seed: 42, n: 120, accuracy: 0.95, nCalib: 60 } as const;

/** Les deux campagnes de M2 (propre / labels inversés), exposées pour le journal brut (G2 delta 5.2). */
export function m2Campaigns(): { clean: CampaignResult; broken: CampaignResult } {
  const base = generateLabeledSeries({ seed: M2_PARAMS.seed, n: M2_PARAMS.n, accuracy: M2_PARAMS.accuracy });
  const clean = runSplitCampaign({ label: "M2-clean", points: base, alpha: 0.1, nMin: 50, tau: 1, nCalib: M2_PARAMS.nCalib });
  const flipped = base.map((p) =>
    p.index >= M2_PARAMS.nCalib && p.y !== "non_evaluable"
      ? { ...p, y: (p.y === "up" ? "down" : "up") as "up" | "down" }
      : p,
  );
  const broken = runSplitCampaign({ label: "M2-flip", points: flipped, alpha: 0.1, nMin: 50, tau: 1, nCalib: M2_PARAMS.nCalib });
  return { clean, broken };
}

export function runMutants(): MutantOutcome[] {
  const out: MutantOutcome[] = [];

  // M1 — under_calib : n=10 < 50 ⇒ pas de q̂.
  const m1 = splitQuantile(TEN_SCORES, 0.1, 50);
  out.push({
    id: "M1",
    name: "under_calib (n=10<50 ⇒ pas de q̂)",
    pass: "reason" in m1 && m1.reason === "under_calib",
    detail: JSON.stringify(m1),
  });

  // M2 — labels inversés post-gel de q̂ ⇒ la couverture casse nettement sous 1-α.
  const { clean, broken } = m2Campaigns();
  const cleanCov = clean.coverageAll ?? 0;
  const brokenCov = broken.coverageAll ?? 1;
  out.push({
    id: "M2",
    name: "labels inversés (hold-out) ⇒ couverture casse",
    pass: brokenCov < cleanCov - 0.2,
    detail: `coverage clean=${cleanCov.toFixed(3)} → flipped=${brokenCov.toFixed(3)}`,
  });

  // M3 — timeout UsePod ⇒ deny / upstream_timeout, jamais un set.
  const m3 = gate(baseInput({ verdict: commitVerdict(), intent: "up", timedOut: true }));
  out.push({
    id: "M3",
    name: "timeout ⇒ ABSTAIN upstream_timeout",
    pass: m3.action === "abstain" && m3.reason === "upstream_timeout" && m3.allow === false,
    detail: `${m3.action}/${m3.reason}`,
  });

  // M4 — parse `MAYBE` ⇒ non_evaluable, pas un label inventé.
  const m4 = gate(baseInput({ verdict: commitVerdict(), intent: "up", evaluable: false }));
  out.push({
    id: "M4",
    name: "parse non-évaluable ⇒ ABSTAIN non_evaluable",
    pass: m4.action === "abstain" && m4.reason === "non_evaluable",
    detail: `${m4.action}/${m4.reason}`,
  });

  // M5 — p_correct injecté ⇒ sérialisation lève : porté par le test `no_p_correct_field`.
  out.push({
    id: "M5",
    name: "p_correct injecté ⇒ serializeVerdict lève (voir test no_p_correct_field)",
    pass: true,
    detail: "exercé sur le contrat gelé dans le test dédié",
  });

  return out;
}
