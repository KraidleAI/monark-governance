/**
 * Harness - literature oracle tests on the two committed calibration fixtures (worksite 1 of the
 * conformal alignment). The switch points are computed by hand from the fixture counts and the split rank
 * p = ceil((n+1)(1-alpha)) [TB Alg. 3.6]. Since CM-2b (ADR-CM B-5, B-2) btc-dir-15m is retired and the USDe key's
 * alpha is imposed (0.1), so the switch points are observed on the SAME engine primitives the served path composes
 * (splitQuantile, conformalSet, buildIntervalRegion), and the served runGate is asserted to refuse the former probes.
 * Each test has one named killer. Pure: the fixtures are the committed source arrays.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Prediction } from "@monark/contracts";
import { splitQuantile, conformalSet, indicatorScores, buildIntervalRegion, BTC_DIR_LABELS } from "@monark/hikae";
import { runGate, HarnessToolError, type HarnessParams } from "../src/tools/gate.ts";
import { SCHEMA_VERSION } from "../src/tools/gate.ts";
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
  schema_version: SCHEMA_VERSION,
  task_class: "btc-dir-15m",
  yhat: "up",
  predictor_id: "internal:momentum-4c",
  produced_at: "2026-09-04T00:00:00Z",
};

/** The code of the named 400 runGate throws (fails when it decides). */
function refusalCode(fn: () => unknown): unknown {
  try {
    fn();
  } catch (e) {
    assert.ok(e instanceof HarnessToolError, `a HarnessToolError, got ${String(e)}`);
    return (e as { code?: unknown }).code;
  }
  assert.fail("expected a named refusal, the gate decided");
}

/** The engine's set for the committed btc-dir fixture at alpha (nMin 50), or "under_calib". */
function btcSet(alpha: number): { qhat: number; labels: string[] } | "under_calib" {
  const split = splitQuantile(BTC_DIR_CALIB, alpha, 50);
  if ("reason" in split) return "under_calib";
  return { qhat: split.qhat, labels: conformalSet(indicatorScores("up", BTC_DIR_LABELS), split.qhat) };
}

// btc-dir fixture (M-2): n = 150 with 6 ones, so qhat = 0 iff ceil(151(1-alpha)) <= 144 iff alpha >= 7/151
// (0.046357...), and under_calib iff alpha < 1/151 (0.006622...). qhat = 0 gives the singleton {up}, qhat = 1 gives
// {up, down}. CM-2b: the class is retired, so the served runGate refuses it (400 task_class_retired).
// killer: packages/hikae/src/l1-split.ts:39 CONST "(n + 1)" -> "(n + 2)"
test("oracle_btc_dir_fixture_commit_switch_at_alpha_7_over_151", () => {
  assert.equal(BTC_DIR_CALIB.length, 150, "n = 150");
  assert.equal(BTC_DIR_CALIB.filter((s) => s === 1).length, 6, "6 ones");
  assert.equal(BTC_DIR_CALIB.filter((s) => s === 0).length, 144, "144 zeros");
  assert.ok(0.0463 < 7 / 151 && 7 / 151 < 0.0464 && 0.0066 < 1 / 151 && 1 / 151 < 0.0067, "probes bracket the switches");

  assert.deepEqual(btcSet(0.0464), { qhat: 0, labels: ["up"] }, "alpha = 0.0464: rank 144, qhat 0, singleton");
  assert.deepEqual(btcSet(0.0463), { qhat: 1, labels: ["up", "down"] }, "alpha = 0.0463: rank 145, qhat 1");
  assert.equal(btcSet(0.0066), "under_calib", "alpha = 0.0066: rank 151 > 150");
  assert.deepEqual(btcSet(0.0067), { qhat: 1, labels: ["up", "down"] }, "alpha = 0.0067: rank 150, qhat = largest score = 1");

  for (const alpha of [0.0464, 0.0463, 0.0066, 0.0067]) {
    assert.equal(refusalCode(() => runGate(BTC_PRED, { ...PARAMS, alpha })), "task_class_retired", `alpha ${String(alpha)}: btc-dir is retired`);
  }
});

// USDe fixture (M-3; SOA 2.2: atom at 0 and ties, only the lower coverage bound holds [LEI]): n = 613,
// 129 zeros, 458 distinct values. qhat = 0 iff ceil(614(1-alpha)) <= 129 iff alpha >= 485/614 (0.78990...),
// then NDG-1 (zero width) abstains; under_calib by rank iff alpha < 1/614 (0.0016286...). CM-2b: the served key
// imposes alpha = 0.1 (F-7), so the switches are read on the engine and the served runGate refuses those alphas.
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
  const band = (alpha: number): { qhat: number; abstain: boolean } | "under_calib" => {
    const split = splitQuantile(calib, alpha, 50);
    if ("reason" in split) return "under_calib";
    return { qhat: split.qhat, abstain: buildIntervalRegion(yhat - split.qhat, yhat + split.qhat).abstain };
  };
  assert.deepEqual(band(0.79), { qhat: 0, abstain: true }, "alpha = 0.79: rank 129, qhat 0, zero width => NDG-1 abstains");
  assert.deepEqual(band(0.789), { qhat: smallestPositive, abstain: false }, "alpha = 0.789: rank 130, qhat = smallest positive score");
  assert.equal(band(0.0016), "under_calib", "alpha = 0.0016: rank 614 > 613");
  assert.deepEqual(band(0.0017), { qhat: largest, abstain: false }, "alpha = 0.0017: rank 613, qhat = largest score");

  const pred: Prediction = {
    schema_version: SCHEMA_VERSION,
    task_class: "stable-run-velocity-24h",
    yhat,
    predictor_id: USDE_STABLE_RUN_PREDICTOR_ID,
    produced_at: "2026-09-04T00:00:00Z",
  };
  const usde = { ...PARAMS, intent: yhat };
  for (const alpha of [0.79, 0.789, 0.0016, 0.0017]) {
    assert.equal(refusalCode(() => runGate(pred, { ...usde, alpha })), "policy_alpha_mismatch", `alpha ${String(alpha)}: imposed 0.1`);
  }
  const served = runGate(pred, usde);
  const split = splitQuantile(calib, 0.1, 50);
  assert.ok(!("reason" in split), "alpha 0.1 calibrates");
  assert.equal(served.verdict.qhat, split.qhat, "served at the imposed alpha 0.1: the engine qhat");
  assert.ok(yhat - split.qhat === -0.00008959228083333333, "fl(yhat - qhat)");
  assert.deepEqual(served.verdict.region, { kind: "interval", lo: -0.00008959228083333335, hi: yhat + split.qhat }, "B-13: lo of the score test, one ulp below fl(yhat - qhat)");
});
