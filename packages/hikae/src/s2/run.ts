/**
 * HIKAE — exécution complète de l'instrument S2 (ADR-M002 D10 ; G2 Lot H corr. 1 et 4).
 *
 * Une seule fonction pure `runS2(params)` produit le RAPPORT et le JOURNAL BRUT par point.
 * Elle est appelée (i) par `scripts/s2-report.mjs`, qui écrit les deux fichiers dans `docs/`,
 * et (ii) par le test `s2_report_reproducible`, qui régénère le rapport en mémoire et exige
 * l'égalité octet à octet avec le fichier committé (chiffres non recalculables = bug).
 *
 * Provenance RÉELLE (corr. 1) : §4/§6a = `internal:momentum-4c` exécuté sur une série de bougies
 * seedée via `extractMomentumFeatures → momentum4c`, label par `labelOf` ; §6b = `internal:
 * oracle-didactique` exécuté sur la MÊME série. Chaque point passe par une `Prediction` du
 * contrat gelé. Aucune horloge lue : `generatedOn` est injecté.
 */
import { createHash } from "node:crypto";
import {
  HARNESS_VERSION,
  demoStates,
  generateCandleSeries,
  generateLabeledSeries,
  labeledFromPredictor,
  runMutants,
  runSplitCampaign,
  m2Campaigns,
  M2_PARAMS,
} from "./instrument.ts";
import type { CampaignResult, PointTrace } from "./instrument.ts";
import { renderS2Report } from "./report.ts";

export interface S2Params {
  readonly alpha: number;
  readonly nMin: number;
  readonly tau: number;
  /** S2a — tirage synthétique (ŷ,y) déclaré (plomberie). */
  readonly s2a: { readonly seed: number; readonly n: number; readonly accuracy: number; readonly nCalib: number };
  /** S2b — bougies synthétiques + prédicteurs RÉELS. */
  readonly s2b: {
    readonly seed: number;
    readonly nCandles: number;
    readonly startCloseTime: number;
    readonly startPrice: number;
    readonly stepPct: number;
    readonly flatRate: number;
    readonly nCalibPerStratum: number;
    readonly nCalibPooled: number;
  };
  /** Date de génération, INJECTÉE (ligne D10), jamais lue. */
  readonly generatedOn: string;
}

/** Paramètres v0 (déclarés, non fondés — ils changent par ADR). */
export const S2_DEFAULT: S2Params = {
  alpha: 0.1,
  nMin: 50,
  tau: 1,
  s2a: { seed: 101, n: 300, accuracy: 0.96, nCalib: 150 },
  s2b: {
    seed: 202,
    nCandles: 700,
    startCloseTime: 1_756_944_000, // 2025-09-04T00:00:00Z, grille 15 min — donnée injectée
    startPrice: 100_000,
    stepPct: 0.004,
    flatRate: 0.01,
    nCalibPerStratum: 60,
    nCalibPooled: 300,
  },
  generatedOn: "2026-09-04",
};

export interface S2Output {
  readonly report: string;
  /** Journal brut TSV (une ligne par point et par campagne), en-tête inclus. */
  readonly journal: string;
  readonly journalDigest: string;
  readonly journalLines: number;
}

const JOURNAL_HEADER = [
  "campaign",
  "index",
  "close_time",
  "hour_utc",
  "stratum",
  "predictor_id",
  "yhat",
  "y",
  "role",
  "score",
  "set",
  "covered",
  "action",
].join("\t");

function journalRows(c: CampaignResult): string[] {
  return c.rows.map((r: PointTrace) =>
    [
      c.label,
      r.index,
      r.closeTime,
      r.hourUtc,
      r.stratum,
      r.predictorId,
      r.yhat,
      r.y,
      r.role,
      r.score === null ? "" : r.score,
      r.set,
      r.covered === null ? "" : r.covered ? 1 : 0,
      r.action,
    ].join("\t"),
  );
}

export function runS2(p: S2Params = S2_DEFAULT): S2Output {
  // S2a — plomberie sur tirage déclaré.
  const s2aPoints = generateLabeledSeries({ seed: p.s2a.seed, n: p.s2a.n, accuracy: p.s2a.accuracy });
  const s2a = runSplitCampaign({
    label: "S2a",
    points: s2aPoints,
    alpha: p.alpha,
    nMin: p.nMin,
    tau: p.tau,
    nCalib: p.s2a.nCalib,
  });

  // S2b — bougies + prédicteurs RÉELS.
  const candles = generateCandleSeries({
    seed: p.s2b.seed,
    n: p.s2b.nCandles,
    startCloseTime: p.s2b.startCloseTime,
    startPrice: p.s2b.startPrice,
    stepPct: p.s2b.stepPct,
    flatRate: p.s2b.flatRate,
  });
  const momentum = labeledFromPredictor(candles, "momentum-4c");
  const oracle = labeledFromPredictor(candles, "oracle-didactique");

  const byStratum = (["asia", "americas"] as const).map((st) =>
    runSplitCampaign({
      label: `S2b-${st}`,
      points: momentum.points.filter((q) => q.stratum === st),
      alpha: p.alpha,
      nMin: p.nMin,
      tau: p.tau,
      nCalib: p.s2b.nCalibPerStratum,
    }),
  );
  const pooled = runSplitCampaign({
    label: "S2b-pooled",
    points: momentum.points,
    alpha: p.alpha,
    nMin: p.nMin,
    tau: p.tau,
    nCalib: p.s2b.nCalibPooled,
  });
  const oracleReal = runSplitCampaign({
    label: "S2b-oracle",
    points: oracle.points,
    alpha: p.alpha,
    nMin: p.nMin,
    tau: p.tau,
    nCalib: p.s2b.nCalibPooled,
  });

  const m2 = m2Campaigns();
  const campaigns = [s2a, ...byStratum, pooled, oracleReal, m2.clean, m2.broken];
  const journal = [JOURNAL_HEADER, ...campaigns.flatMap(journalRows)].join("\n") + "\n";
  const journalDigest = createHash("sha256").update(journal, "utf8").digest("hex");
  const journalLines = campaigns.reduce((a, c) => a + c.rows.length, 0);

  const report = renderS2Report({
    harnessVersion: HARNESS_VERSION,
    params: p,
    s2a,
    s2bPooled: pooled,
    s2bByStratum: byStratum,
    predictorRuns: {
      momentum: { nWarmup: momentum.nWarmup, nPredictorNonEvaluable: momentum.nPredictorNonEvaluable, nPredictions: momentum.predictions.length },
      oracle: { nWarmup: oracle.nWarmup, nPredictorNonEvaluable: oracle.nPredictorNonEvaluable, nPredictions: oracle.predictions.length },
    },
    mutants: runMutants(),
    m2Params: M2_PARAMS,
    m2N: m2.clean.nEvaluable,
    silenceReal: pooled,
    oracleReal,
    demo: demoStates(),
    journal: { path: "docs/S2-journal-fixtures-synth.tsv", digest: journalDigest, lines: journalLines },
  });
  return { report, journal, journalDigest, journalLines };
}
