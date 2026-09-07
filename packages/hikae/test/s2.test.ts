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
 * Test 14 — `fixtures_hash_stable`. The MECHANISM set (3 COMMIT / 2 DEFER / 3 ABSTAIN /
 * 1 under_calib) produced by the real `gate()` (verdicts with declared scores + mutants) is stable:
 * exact distribution + sha256 of the canonical serialization == committed manifest. A
 * drift without ADR = fixture bug. HIKAE-side set, distinct from the root `fixtures/` (D1:
 * two sets, two roles, two hashes).
 */
test("fixtures_hash_stable", () => {
  const states = demoStates();
  const counts = { commit: 0, defer: 0, abstain: 0, under_calib: 0 };
  for (const s of states) {
    if (s.decision.reason === "under_calib") counts.under_calib++;
    else counts[s.decision.action]++;
  }
  assert.deepEqual(counts, { commit: 3, defer: 2, abstain: 3, under_calib: 1 }, "distribution 3/2/3/1");

  const h = createHash("sha256");
  for (const s of states) h.update(s.id + "\n" + serializeGateDecision(s.decision) + "\n");
  const digest = h.digest("hex");

  const manifestPath = join(import.meta.dirname, "fixtures.manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { digest: string; ids: string[] };
  assert.deepEqual(
    states.map((s) => s.id),
    manifest.ids,
    "state identifiers are stable",
  );
  assert.equal(digest, manifest.digest, "sha256 of the mechanism set == manifest (drift without ADR = bug)");
});

// S2 guard: the split campaign produces coherent and deterministic figures.
test("s2_campaign_deterministic_and_coherent", () => {
  const points = generateLabeledSeries({ seed: 123, n: 200, accuracy: 0.96, nonEvaluableRate: 0.02 });
  const a = runSplitCampaign({ label: "S2b", points, alpha: 0.1, nMin: 50, tau: 1, nCalib: 60 });
  const b = runSplitCampaign({ label: "S2b", points, alpha: 0.1, nMin: 50, tau: 1, nCalib: 60 });
  assert.deepEqual(a, b, "deterministic (same seed ⇒ same result)");
  if (a.coverageAll !== null) assert.ok(a.coverageAll >= 0 && a.coverageAll <= 1);
  // Ex-ante strata well bounded.
  assert.equal(strataOf(3), "asia");
  assert.equal(strataOf(15), "americas");
  assert.equal(strataOf(10), "mid");
});

// G2 corr. 4 guard — the committed report is REPRODUCED byte-for-byte by the runner, and the committed
// raw journal carries the sha256 announced in the report. A figure that drifts without regeneration = red.
test("s2_report_reproducible", () => {
  const out = runS2();
  const docs = join(import.meta.dirname, "..", "docs");
  const committedReport = readFileSync(join(docs, "S2-RAPPORT-fixtures-synth.md"), "utf8").replace(/\r\n/g, "\n");
  const committedJournal = readFileSync(join(docs, "S2-journal-fixtures-synth.tsv"), "utf8").replace(/\r\n/g, "\n");
  assert.equal(committedReport, out.report, "committed report ≠ regenerated report (rerun scripts/s2-report.mjs)");
  assert.equal(
    createHash("sha256").update(committedJournal, "utf8").digest("hex"),
    out.journalDigest,
    "committed journal ≠ regenerated digest",
  );
  assert.ok(out.report.includes(out.journalDigest), "the report cites the journal sha256 (D10 line)");
  assert.ok(out.journalLines > 400, "per-point journal non-empty");
});

// G2 corr. 1 guard — the D7 predictors are ACTUALLY run and enter through a frozen `Prediction`.
test("s2_predictors_wired", () => {
  const candles = generateCandleSeries({ seed: 5, n: 60, startCloseTime: 900 * 1000, startPrice: 100, stepPct: 0.01 });
  const mom = labeledFromPredictor(candles, "momentum-4c");
  const ora = labeledFromPredictor(candles, "oracle-didactique");
  assert.equal(mom.nWarmup, 4, "4 warmup windows (5 closes ≤ t required)");
  assert.ok(mom.predictions.every((p) => p.predictor_id === MOMENTUM_4C_ID));
  assert.ok(ora.predictions.every((p) => p.predictor_id === ORACLE_DIDACTIQUE_ID));
  assert.ok(ora.points.every((p) => p.yhat === p.y), "didactic oracle: ŷ=y by construction");
  assert.ok(mom.points.some((p) => p.yhat !== p.y), "momentum on a random walk: not an oracle");
  // momentum ŷ = sign of close[t] − close[t−60] recomputed by hand on the first point.
  const first = mom.points[0]!;
  const byClose = new Map(candles.map((c) => [c.close_time, c]));
  const c0 = byClose.get(first.closeTime)!.close;
  const c4 = byClose.get(first.closeTime - 3600)!.close;
  assert.equal(first.yhat, c0 > c4 ? "up" : "down");
});
