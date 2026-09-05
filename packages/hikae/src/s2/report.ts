/**
 * HIKAE — rendu du rapport S2 (ADR-M002 D10, CA-H2). Six blocs recalculables + les DEUX
 * blocs étiquetés de la décision (e) : « silence réel » (momentum RÉELLEMENT exécuté) / « démo de
 * mécanisme » (9 états à scores déclarés + oracle didactique RÉELLEMENT exécuté, marqué « pas un
 * produit »). Tête soumise au gate vocabulaire.
 *
 * Ligne D10 sous chaque chiffre : n, étiquette de provenance, date (injectée), hash du journal
 * brut. Discipline 09 : aucune tournure interdite. Jamais « X % de fills corrects » ; on écrit
 * n, m, q̂, couverture empirique, taux d'abstention. Résultat négatif = résultat.
 */
import type { CampaignResult, MutantOutcome } from "./instrument.ts";
import type { S2Params } from "./run.ts";
import { MOMENTUM_4C_ID, ORACLE_DIDACTIQUE_ID } from "../predictor.ts";
import type { GateDecision } from "@monark/contracts";

function pct(x: number | null): string {
  return x === null ? "—" : `${(x * 100).toFixed(1)} %`;
}
function qh(r: CampaignResult): string {
  return "reason" in r.split ? `— (${r.split.reason})` : String(r.split.qhat);
}

export interface PredictorRunSummary {
  readonly nWarmup: number;
  readonly nPredictorNonEvaluable: number;
  readonly nPredictions: number;
}

export interface ReportInput {
  readonly harnessVersion: string;
  readonly params: S2Params;
  readonly s2a: CampaignResult;
  readonly s2bPooled: CampaignResult;
  readonly s2bByStratum: readonly CampaignResult[];
  readonly predictorRuns: { readonly momentum: PredictorRunSummary; readonly oracle: PredictorRunSummary };
  readonly mutants: readonly MutantOutcome[];
  /** Paramètres déclarés de M2 + n évaluable (journalisé sous `M2-clean` / `M2-flip`). */
  readonly m2Params: { readonly seed: number; readonly n: number; readonly accuracy: number; readonly nCalib: number };
  readonly m2N: number;
  /** (e) « silence réel » — `internal:momentum-4c` exécuté (== S2b poolé). */
  readonly silenceReal: CampaignResult;
  /** (e) `internal:oracle-didactique` exécuté sur la même série (pas un produit). */
  readonly oracleReal: CampaignResult;
  readonly demo: readonly { readonly id: string; readonly decision: GateDecision }[];
  readonly journal: { readonly path: string; readonly digest: string; readonly lines: number };
}

export function renderS2Report(inp: ReportInput): string {
  const L: string[] = [];
  const p = inp.params;
  const d10 = (n: number, label: string) =>
    `_D10 : n = ${n} · étiquette = \`${inp.harnessVersion}/${label}\` · date = ${p.generatedOn} · journal sha256 = \`${inp.journal.digest.slice(0, 16)}…\`_`;

  L.push(`# Rapport S2 — HIKAE (\`${inp.harnessVersion}\`)`);
  L.push("");
  L.push(
    "> Harnais **jetable** (R-22). Fixtures **synthétiques par graine** (déclaré) — la sonde J0 sur " +
      "Coinbase (décision investisseur (a)) est ultérieure. **Résultat négatif = résultat.** Aucun chiffre " +
      "n'est présenté comme une probabilité de vérité (09). Généré par `scripts/s2-report.mjs` ; " +
      "le test `s2_report_reproducible` exige l'égalité octet à octet avec ce fichier.",
  );
  L.push("");

  // Bloc 1 — Paramètres (par campagne).
  L.push("## 1. Paramètres");
  L.push(
    `Communs : α = ${p.alpha} · n_min = ${p.nMin} · τ = ${p.tau} · route = fixtures synthétiques (aucun réseau) · ` +
      `harness_version = \`${inp.harnessVersion}\` · date de génération (injectée) = ${p.generatedOn}.`,
  );
  L.push(
    `S2a : graine = ${p.s2a.seed} · n = ${p.s2a.n} · accuracy déclarée du tirage = ${p.s2a.accuracy} · n_calib = ${p.s2a.nCalib}.`,
  );
  L.push(
    `S2b : bougies seedées (graine = ${p.s2b.seed}, n = ${p.s2b.nCandles}, close_time₀ = ${p.s2b.startCloseTime}, ` +
      `prix₀ = ${p.s2b.startPrice}, pas max = ${p.s2b.stepPct}, taux plat = ${p.s2b.flatRate}) · ` +
      `n_calib par strate = ${p.s2b.nCalibPerStratum} · n_calib poolé = ${p.s2b.nCalibPooled}. ` +
      `Prédicteurs RÉELLEMENT exécutés : \`${MOMENTUM_4C_ID}\` (${inp.predictorRuns.momentum.nPredictions} \`Prediction\` émises, ` +
      `${inp.predictorRuns.momentum.nWarmup} fenêtres de chauffe, ${inp.predictorRuns.momentum.nPredictorNonEvaluable} sans direction) ; ` +
      `\`${ORACLE_DIDACTIQUE_ID}\` (${inp.predictorRuns.oracle.nPredictions} émises, ${inp.predictorRuns.oracle.nPredictorNonEvaluable} sans direction).`,
  );
  L.push(
    `M2 (mutant labels inversés) : graine = ${inp.m2Params.seed} · n = ${inp.m2Params.n} · accuracy déclarée = ${inp.m2Params.accuracy} · ` +
      `n_calib = ${inp.m2Params.nCalib} · campagnes journalisées \`M2-clean\` / \`M2-flip\`.`,
  );
  L.push("");

  // Bloc 2 — Journal brut.
  L.push("## 2. Journal brut");
  L.push(
    `Une ligne par point et par campagne (colonnes : campaign, index, close_time, hour_utc, stratum, predictor_id, ` +
      `yhat, y, role ∈ {calib, holdout, excluded}, score, set, covered, action) : [\`${inp.journal.path}\`](${inp.journal.path
        .replace(/^docs\//, "")}) — **${inp.journal.lines} lignes**, sha256 = \`${inp.journal.digest}\`. ` +
      "Tout chiffre ci-dessous se recalcule depuis ce journal sans croire HIKAE (D10).",
  );
  L.push("");

  // Bloc 3 — S2a.
  L.push("## 3. S2a — plomberie (classe binaire synthétique déclarée)");
  L.push(
    `n_calib = ${inp.s2a.nCalib} · m = ${inp.s2a.mHoldout} · q̂ = ${qh(inp.s2a)} · ` +
      `couverture empirique (abstentions incluses) = ${pct(inp.s2a.coverageAll)} · ` +
      `abstention (τ=${p.tau}) = ${pct(inp.s2a.abstentionRate)} · non_evaluable = ${inp.s2a.nNonEvaluable}.`,
  );
  L.push(d10(inp.s2a.nEvaluable, "S2a"));
  L.push("");

  // Bloc 4 — S2b par strate et poolé (momentum réel).
  L.push(`## 4. S2b — beachhead \`btc-dir-15m\` (bougies synthétiques, \`${MOMENTUM_4C_ID}\` exécuté)`);
  L.push("| strate | n_calib | m | q̂ | couverture (abst. incl.) | abstention | couv. cond. à l'action* |");
  L.push("|---|---|---|---|---|---|---|");
  for (const s of inp.s2bByStratum) {
    L.push(
      `| ${s.label.replace(/^S2b-/, "")} | ${s.nCalib} | ${s.mHoldout} | ${qh(s)} | ${pct(s.coverageAll)} | ${pct(
        s.abstentionRate,
      )} | ${pct(s.coverageConditional)} |`,
    );
  }
  L.push(
    `| **poolé** | ${inp.s2bPooled.nCalib} | ${inp.s2bPooled.mHoldout} | ${qh(inp.s2bPooled)} | ${pct(
      inp.s2bPooled.coverageAll,
    )} | ${pct(inp.s2bPooled.abstentionRate)} | ${pct(inp.s2bPooled.coverageConditional)} |`,
  );
  L.push("");
  L.push("*\\* couverture conditionnelle à l'action = chiffre de desk, **PAS la garantie CP** (H2.3).*");
  L.push(d10(inp.s2bPooled.nEvaluable, "S2b-pooled"));
  L.push("");

  // Bloc 5 — Mutants.
  L.push("## 5. Mutants (contrôles négatifs semés)");
  L.push("| id | mutant | verdict |");
  L.push("|---|---|---|");
  for (const m of inp.mutants) L.push(`| ${m.id} | ${m.name} | ${m.pass ? "PASS" : "FAIL"} (${m.detail}) |`);
  L.push("");
  L.push(d10(inp.m2N, "M2-clean+M2-flip"));
  L.push("");

  // Décision (e) — deux blocs étiquetés.
  L.push("## 6. Décision (e) — deux blocs étiquetés");
  L.push(`### 6a. Silence réel (\`${MOMENTUM_4C_ID}\`, exécuté)`);
  L.push(
    `Prédicteur momentum sur marche aléatoire ≈ pièce : n_calib = ${inp.silenceReal.nCalib} · m = ${inp.silenceReal.mHoldout} · ` +
      `q̂ = ${qh(inp.silenceReal)} · couverture = ${pct(inp.silenceReal.coverageAll)} · ` +
      `abstention = ${pct(inp.silenceReal.abstentionRate)} · commit = ${pct(inp.silenceReal.commitRate)}. ` +
      `Attendu : **silence calibré quasi total** (au score 0/1, q̂=0 exige ≤ n − ⌈(n+1)(1−α)⌉ erreurs de calibration : ` +
      `n=${inp.silenceReal.nCalib}, α=${p.alpha} ⇒ ≤ ${inp.silenceReal.nCalib - Math.ceil((inp.silenceReal.nCalib + 1) * (1 - p.alpha))}). ` +
      "La démo ne montre pas de position — c'est le produit (le droit de n'avoir aucun avis).",
  );
  L.push(d10(inp.silenceReal.nEvaluable, "S2b-pooled"));
  L.push("");
  L.push(`### 6b. Démo de mécanisme (\`${ORACLE_DIDACTIQUE_ID}\` — **pas un produit**)`);
  L.push(
    `Oracle didactique (ŷ=y par construction) **exécuté sur la même série** : n_calib = ${inp.oracleReal.nCalib} · ` +
      `m = ${inp.oracleReal.mHoldout} · q̂ = ${qh(inp.oracleReal)} · couverture = ${pct(inp.oracleReal.coverageAll)} · ` +
      `abstention = ${pct(inp.oracleReal.abstentionRate)} · commit = ${pct(inp.oracleReal.commitRate)}. ` +
      "Il rend le chemin COMMIT visible ; il ne dit rien du marché.",
  );
  L.push(d10(inp.oracleReal.nEvaluable, "S2b-oracle"));
  L.push("");
  L.push(
    "Les 9 états de mécanisme ci-dessous sont produits par le vrai `gate()` sur des verdicts à **scores déclarés** " +
      "(COMMIT : calibration 47/50 ⇒ q̂=0 ; DEFER : 25/50 ⇒ q̂=1) — **pas** par l'oracle (digest figé, test 14) :",
  );
  L.push("| état | action | raison | budget restant |");
  L.push("|---|---|---|---|");
  for (const s of inp.demo) {
    L.push(`| ${s.id} | ${s.decision.action} | ${s.decision.reason} | ${s.decision.remaining_budget} |`);
  }
  L.push("");
  L.push(
    `**Tête** (sur m = ${inp.silenceReal.mHoldout} hold-out, \`${MOMENTUM_4C_ID}\`) : couverture empirique = ${pct(
      inp.silenceReal.coverageAll,
    )} vs 1−α = ${pct(1 - p.alpha)} · abstention (τ=${p.tau}) = ${pct(inp.silenceReal.abstentionRate)} — trois chiffres, jamais fusionnés.`,
  );
  L.push("");
  return L.join("\n");
}
