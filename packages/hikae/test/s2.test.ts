import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { serializeGateDecision } from "@monark/contracts";
import {
  demoStates,
  generateLabeledSeries,
  generateCandleSeries,
  labeledFromPredictor,
  runSplitCampaign,
  runS2,
  strataOf,
  MOMENTUM_4C_ID,
  ORACLE_DIDACTIQUE_ID,
} from "../src/index.ts";

/**
 * Test 14 — `fixtures_hash_stable`. Le jeu de MÉCANISME (3 COMMIT / 2 DEFER / 3 ABSTAIN /
 * 1 under_calib) produit par le vrai `gate()` (verdicts à scores déclarés + mutants) est stable :
 * répartition exacte + sha256 de la sérialisation canonique == manifeste committé. Une
 * dérive sans ADR = bug de fixture. Jeu HIKAE-side, distinct du `fixtures/` racine (D1 :
 * deux jeux, deux rôles, deux hashes).
 */
test("fixtures_hash_stable", () => {
  const states = demoStates();
  const counts = { commit: 0, defer: 0, abstain: 0, under_calib: 0 };
  for (const s of states) {
    if (s.decision.reason === "under_calib") counts.under_calib++;
    else counts[s.decision.action]++;
  }
  assert.deepEqual(counts, { commit: 3, defer: 2, abstain: 3, under_calib: 1 }, "répartition 3/2/3/1");

  const h = createHash("sha256");
  for (const s of states) h.update(s.id + "\n" + serializeGateDecision(s.decision) + "\n");
  const digest = h.digest("hex");

  const manifestPath = join(import.meta.dirname, "fixtures.manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { digest: string; ids: string[] };
  assert.deepEqual(
    states.map((s) => s.id),
    manifest.ids,
    "les identifiants d'états sont stables",
  );
  assert.equal(digest, manifest.digest, "sha256 du jeu de mécanisme == manifeste (dérive sans ADR = bug)");
});

// Garde S2 : la campagne split produit des chiffres cohérents et déterministes.
test("s2_campaign_deterministic_and_coherent", () => {
  const points = generateLabeledSeries({ seed: 123, n: 200, accuracy: 0.96, nonEvaluableRate: 0.02 });
  const a = runSplitCampaign({ label: "S2b", points, alpha: 0.1, nMin: 50, tau: 1, nCalib: 60 });
  const b = runSplitCampaign({ label: "S2b", points, alpha: 0.1, nMin: 50, tau: 1, nCalib: 60 });
  assert.deepEqual(a, b, "déterministe (même graine ⇒ même résultat)");
  if (a.coverageAll !== null) assert.ok(a.coverageAll >= 0 && a.coverageAll <= 1);
  // Strates ex ante bien bornées.
  assert.equal(strataOf(3), "asia");
  assert.equal(strataOf(15), "americas");
  assert.equal(strataOf(10), "mid");
});

// Garde G2 corr. 4 — le rapport committé est REPRODUIT octet à octet par le runner, et le journal brut
// committé porte le sha256 annoncé dans le rapport. Un chiffre qui dérive sans régénération = rouge.
test("s2_report_reproducible", () => {
  const out = runS2();
  const docs = join(import.meta.dirname, "..", "docs");
  const committedReport = readFileSync(join(docs, "S2-RAPPORT-fixtures-synth.md"), "utf8").replace(/\r\n/g, "\n");
  const committedJournal = readFileSync(join(docs, "S2-journal-fixtures-synth.tsv"), "utf8").replace(/\r\n/g, "\n");
  assert.equal(committedReport, out.report, "rapport committé ≠ rapport régénéré (relancer scripts/s2-report.mjs)");
  assert.equal(
    createHash("sha256").update(committedJournal, "utf8").digest("hex"),
    out.journalDigest,
    "journal committé ≠ digest régénéré",
  );
  assert.ok(out.report.includes(out.journalDigest), "le rapport cite le sha256 du journal (ligne D10)");
  assert.ok(out.journalLines > 400, "journal par point non vide");
});

// Garde G2 corr. 1 — les prédicteurs D7 sont RÉELLEMENT exécutés et entrent par une `Prediction` gelée.
test("s2_predictors_wired", () => {
  const candles = generateCandleSeries({ seed: 5, n: 60, startCloseTime: 900 * 1000, startPrice: 100, stepPct: 0.01 });
  const mom = labeledFromPredictor(candles, "momentum-4c");
  const ora = labeledFromPredictor(candles, "oracle-didactique");
  assert.equal(mom.nWarmup, 4, "4 fenêtres de chauffe (5 closes ≤ t requises)");
  assert.ok(mom.predictions.every((p) => p.predictor_id === MOMENTUM_4C_ID));
  assert.ok(ora.predictions.every((p) => p.predictor_id === ORACLE_DIDACTIQUE_ID));
  assert.ok(ora.points.every((p) => p.yhat === p.y), "oracle didactique : ŷ=y par construction");
  assert.ok(mom.points.some((p) => p.yhat !== p.y), "momentum sur marche aléatoire : n'est pas un oracle");
  // ŷ momentum = signe de close[t] − close[t−60] recalculé à la main sur le premier point.
  const first = mom.points[0]!;
  const byClose = new Map(candles.map((c) => [c.close_time, c]));
  const c0 = byClose.get(first.closeTime)!.close;
  const c4 = byClose.get(first.closeTime - 3600)!.close;
  assert.equal(first.yhat, c0 > c4 ? "up" : "down");
});
