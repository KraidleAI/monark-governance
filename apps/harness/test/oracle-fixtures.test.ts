/**
 * Harness - literature oracle tests on the two committed calibration fixtures (worksite 1 of the
 * conformal alignment). The switch points are computed by hand from the fixture counts and the split rank
 * p = ceil((n+1)(1-alpha)) [TB Alg. 3.6], then observed through the served runGate. All tests are pins
 * (green at base), each with one named killer. Pure: the fixtures are the committed source arrays.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Prediction } from "@monark/contracts";
import { runGate, type HarnessParams } from "../src/tools/gate.ts";
import { BTC_DIR_CALIB, USDE_STABLE_RUN_CALIB, USDE_STABLE_RUN_PREDICTOR_ID } from "../src/calibration.ts";

const PARAMS: HarnessParams = {
  remainingBudget: 0.1,
  bFloor: 0,
  tau: 1,
  tauInterval: 1,
  alpha: 0.1,
  nMin: 50,
  intent: "up",
  tool: "perps_order_preview",
  clockOpen: true,
};

const BTC_PRED: Prediction = {
  schema_version: "1.0.0",
  task_class: "btc-dir-15m",
  yhat: "up",
  predictor_id: "internal:momentum-4c",
  produced_at: "2026-09-04T00:00:00Z",
};

// btc-dir fixture (M-2): n = 150 with 6 ones, so qhat = 0 iff ceil(151(1-alpha)) <= 144 iff alpha >= 7/151
// (0.046357...), and under_calib iff alpha < 1/151 (0.006622...). With tau = 1: qhat = 0 gives the
// singleton {up} (covered, commit), qhat = 1 gives {up, down} (set_too_large, defer).
// killer: apps/harness/src/tools/gate.ts:488 ROR "labels.length > params.tau" -> "labels.length >= params.tau"
test("oracle_btc_dir_fixture_commit_switch_at_alpha_7_over_151", () => {
  assert.equal(BTC_DIR_CALIB.length, 150, "n = 150");
  assert.equal(BTC_DIR_CALIB.filter((s) => s === 1).length, 6, "6 ones");
  assert.equal(BTC_DIR_CALIB.filter((s) => s === 0).length, 144, "144 zeros");
  assert.ok(0.0463 < 7 / 151 && 7 / 151 < 0.0464 && 0.0066 < 1 / 151 && 1 / 151 < 0.0067, "probes bracket the switches");

  const commit = runGate(BTC_PRED, { ...PARAMS, alpha: 0.0464 });
  assert.equal(commit.verdict.reason, "covered", "alpha = 0.0464: rank 144, qhat 0");
  assert.equal(commit.verdict.qhat, 0);
  assert.equal(commit.verdict.abstain, false);
  assert.deepEqual(commit.verdict.region, { kind: "set", labels: ["up"], label_schema: "up|down" });
  assert.equal(commit.action, "commit");
  assert.equal(commit.reason, "covered");
  assert.equal(commit.allow, true);

  const defer = runGate(BTC_PRED, { ...PARAMS, alpha: 0.0463 });
  assert.equal(defer.verdict.reason, "set_too_large", "alpha = 0.0463: rank 145, qhat 1");
  assert.equal(defer.verdict.qhat, 1);
  assert.equal(defer.verdict.abstain, true);
  assert.equal(defer.action, "defer");
  assert.equal(defer.reason, "set_too_large");

  const low = runGate(BTC_PRED, { ...PARAMS, alpha: 0.0066 });
  assert.equal(low.verdict.reason, "under_calib", "alpha = 0.0066: rank 151 > 150");
  assert.equal(low.verdict.qhat, null);
  assert.equal(low.action, "abstain");
  assert.equal(low.reason, "under_calib");

  const top = runGate(BTC_PRED, { ...PARAMS, alpha: 0.0067 });
  assert.equal(top.verdict.qhat, 1, "alpha = 0.0067: rank 150, qhat = largest score = 1");
  assert.equal(top.verdict.reason, "set_too_large");
  assert.equal(top.action, "defer");
});

// USDe fixture (M-3; SOA 2.2: atom at 0 and ties, only the lower coverage bound holds [LEI]): n = 613,
// 129 zeros, 458 distinct values. qhat = 0 iff ceil(614(1-alpha)) <= 129 iff alpha >= 485/614 (0.78990...),
// then NDG-1 (zero width) abstains under_calib; under_calib by rank iff alpha < 1/614 (0.0016286...).
// killer: packages/hikae/src/region.ts:71 ROR "lo === hi" -> "lo > hi"
test("oracle_usde_fixture_zero_atom_ties", () => {
  const calib = USDE_STABLE_RUN_CALIB;
  assert.equal(calib.length, 613, "n = 613");
  assert.equal(calib.filter((s) => s === 0).length, 129, "129 zeros");
  assert.equal(new Set(calib).size, 458, "458 distinct values");
  assert.ok(0.789 < 485 / 614 && 485 / 614 < 0.79 && 0.0016 < 1 / 614 && 1 / 614 < 0.0017, "probes bracket the switches");
  const smallestPositive = Math.min(...calib.filter((s) => s > 0));
  const largest = Math.max(...calib);
  assert.equal(smallestPositive, 5.362499999917738e-11);
  assert.equal(largest, 4.1253532387499996e-4);

  const yhat = 0.0000416;
  const pred: Prediction = {
    schema_version: "1.0.0",
    task_class: "stable-run-velocity-24h",
    yhat,
    predictor_id: USDE_STABLE_RUN_PREDICTOR_ID,
    produced_at: "2026-09-04T00:00:00Z",
  };
  const usde = { ...PARAMS, intent: yhat };

  const atom = runGate(pred, { ...usde, alpha: 0.79 });
  assert.equal(atom.verdict.reason, "under_calib", "alpha = 0.79: rank 129, qhat 0, zero width");
  assert.equal(atom.verdict.qhat, null);
  assert.deepEqual(atom.verdict.region, { kind: "set", labels: [], label_schema: "numeric" });
  assert.equal(atom.action, "abstain");
  assert.equal(atom.reason, "under_calib");

  const first = runGate(pred, { ...usde, alpha: 0.789 });
  assert.equal(first.verdict.reason, "covered", "alpha = 0.789: rank 130, qhat = smallest positive score");
  assert.equal(first.verdict.qhat, smallestPositive);
  assert.deepEqual(first.verdict.region, { kind: "interval", lo: yhat - smallestPositive, hi: yhat + smallestPositive });
  assert.equal(first.action, "commit");

  const low = runGate(pred, { ...usde, alpha: 0.0016 });
  assert.equal(low.verdict.reason, "under_calib", "alpha = 0.0016: rank 614 > 613");
  assert.equal(low.verdict.qhat, null);
  assert.equal(low.action, "abstain");

  const top = runGate(pred, { ...usde, alpha: 0.0017 });
  assert.equal(top.verdict.reason, "covered", "alpha = 0.0017: rank 613, qhat = largest score");
  assert.equal(top.verdict.qhat, largest);
  assert.equal(top.action, "commit");
});
