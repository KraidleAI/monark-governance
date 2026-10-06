/**
 * Harness - empty conformal set on the BYO set path (worksite 4, lot L4-1, P3).
 * Oracle: ADR-M005 D5 K-4(d) amendment 2026-09-30, D8 (RECHERCHES ADR v3, KraidleAI/recherches 32aff95);
 * ADR-M009 item 8. An empty set C holds no intent: the verdict abstains with intent_not_in_region, the
 * region stays empty and qhat stays a number (unlike under_calib, whose qhat is null); never covered.
 * Plan: docs/G0-lot-w4-empty-set-reason.md. Each test names its killer on the line above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertClosedGateDecision } from "@monark/contracts";
import type { CoverageVerdict, Prediction } from "@monark/contracts";
import { gate, buildVerdict, buildSetRegion } from "@monark/hikae";
import type { GateInput } from "@monark/hikae";
import { runGate, type HarnessParams } from "../src/tools/gate.ts";
import { SCHEMA_VERSION } from "../src/tools/gate.ts";

const PARAMS: HarnessParams = {
  remainingBudget: 0.1,
  bFloor: 0,
  tau: 1,
  tauInterval: 1,
  alpha: 0.1,
  nMin: 5,
  intent: "A",
  tool: "perps_order_preview",
  clockOpen: true,
};

const BYO_SET_PRED: Prediction = {
  schema_version: SCHEMA_VERSION,
  task_class: "byo-set-demo",
  yhat: "A",
  predictor_id: "caller:model",
  produced_at: "2026-09-04T00:00:00Z",
};

// n = 10, alpha = 0.1, nMin = 5: p = ceil(11 x 0.9) = 10, so qhat = the 10th smallest score = 1.0 (by hand).
const SCORES = [0.5, 0.1, 0.9, 0.3, 1.0, 0.7, 0.2, 0.8, 0.4, 0.6];

// Test E-1 (F2P): candidates A 1.5 and B 2.0 both score above qhat = 1.0, so C is empty. The verdict abstains
// with intent_not_in_region, qhat stays the number 1, the region is the empty set; the gate decision is
// ABSTAIN intent_not_in_region for tau 0 and 1.
// killer: apps/harness/src/tools/gate.ts:550 ROR "labels.length === 0" -> "labels.length < 0"
test("byo_set_empty_region_abstains_intent_not_in_region", () => {
  for (const tau of [0, 1]) {
    const d = runGate(BYO_SET_PRED, {
      ...PARAMS,
      tau,
      calibration: { scores: SCORES, mode: "set", candidates: [{ label: "A", score: 1.5 }, { label: "B", score: 2.0 }] },
    });
    assertClosedGateDecision(d);
    assert.deepEqual(d.verdict.region, { kind: "set", labels: [], label_schema: "A|B" }, `tau ${String(tau)}: C is empty`);
    assert.equal(d.verdict.qhat, 1, `tau ${String(tau)}: qhat is the number 1, not null`);
    assert.equal(d.verdict.abstain, true, `tau ${String(tau)}: an empty set abstains`);
    assert.equal(d.verdict.reason, "intent_not_in_region", `tau ${String(tau)}: verdict reason on an empty set`);
    assert.equal(d.action, "abstain", `tau ${String(tau)}: gate action`);
    assert.equal(d.reason, "intent_not_in_region", `tau ${String(tau)}: gate reason`);
    assert.equal(d.allow, false, `tau ${String(tau)}: no allow`);
  }
});

// Test E-3 (pin): a non-empty set keeps abstain = 1{size of C > tau}. Four candidates, the first k score 0.5
// (inside qhat = 1.0) and the others 1.5, so the size of C is k in {1, 2, 3}; tau in {0..3} (the L4-5 cap:
// four candidates minus 1), including size = tau. Reasons covered / set_too_large; the intent A is always in C, so the gate COMMITs or DEFERs.
// killer: apps/harness/src/tools/gate.ts:551 ROR "labels.length > params.tau" -> "labels.length >= params.tau"
test("nonempty_set_verdict_semantics_unchanged", () => {
  const names = ["A", "B", "C", "D"];
  for (const k of [1, 2, 3]) {
    const candidates = names.map((label, i) => ({ label, score: i < k ? 0.5 : 1.5 }));
    for (const tau of [0, 1, 2, 3]) {
      const d = runGate(BYO_SET_PRED, { ...PARAMS, tau, calibration: { scores: SCORES, mode: "set", candidates } });
      assertClosedGateDecision(d);
      const at = `size ${String(k)}, tau ${String(tau)}`;
      const over = k > tau;
      assert.deepEqual(d.verdict.region, { kind: "set", labels: names.slice(0, k), label_schema: "A|B|C|D" }, at);
      assert.equal(d.verdict.qhat, 1, at);
      assert.equal(d.verdict.abstain, over, `${at}: abstain = 1{size > tau}`);
      assert.equal(d.verdict.reason, over ? "set_too_large" : "covered", `${at}: verdict reason`);
      assert.equal(d.action, over ? "defer" : "commit", `${at}: gate action`);
      assert.equal(d.reason, over ? "set_too_large" : "covered", `${at}: gate reason`);
    }
  }
});

// Test E-4 (pin): the L3 order called directly. An empty set region never COMMITs, whatever tau (0, 1, 100),
// with a large budget and an open clock, and whatever the verdict fields (the D8 verdict or the pre-D8 one):
// the intent is not in the empty region, so L3 answers ABSTAIN intent_not_in_region (l3-gate.ts l.97-98).
// killer: packages/hikae/src/l3-gate.ts:101 CONST "!intentInRegion(input.intent, region)" -> "false"
test("empty_set_never_commits_at_l3", () => {
  const verdictOf = (abstain: boolean, reason: "intent_not_in_region" | "covered"): CoverageVerdict =>
    buildVerdict({
      taskClass: "byo-set-demo",
      method: "split",
      alpha: 0.1,
      scores: SCORES,
      region: buildSetRegion([], "A|B"),
      qhat: 1,
      abstain,
      reason,
      residual: [],
      producedAt: "2026-09-04T00:00:00Z",
      schemaVersion: SCHEMA_VERSION, cell: { qhatUnit: "score", scale: null, cellKey: null, policyRowSha256: null, policyTableSha256: null },
    });
  for (const verdict of [verdictOf(true, "intent_not_in_region"), verdictOf(false, "covered")]) {
    for (const tau of [0, 1, 100]) {
      const input: GateInput = {
        intent: "A",
        verdict,
        remainingBudget: 1e9,
        bFloor: 0,
        tau,
        tauInterval: 1,
        nCalib: SCORES.length,
        nMin: 5,
        clockOpen: true,
        timedOut: false,
        evaluable: true,
        tool: "perps_order_preview",
        schemaVersion: SCHEMA_VERSION, requestSha256: "0".repeat(64),
      };
      const d = gate(input);
      const at = `verdict ${verdict.reason}, tau ${String(tau)}`;
      assert.notEqual(d.action, "commit", `${at}: never COMMIT on an empty set`);
      assert.equal(d.action, "abstain", `${at}: gate action`);
      assert.equal(d.reason, "intent_not_in_region", `${at}: gate reason`);
      assert.equal(d.allow, false, `${at}: no allow`);
    }
  }
});
