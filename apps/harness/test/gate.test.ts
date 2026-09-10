/**
 * Harness Lot H1 — gate-logic tests (ADR-M005 D5/D8/D9, K-4).
 * Each test is killed by >= 1 named mutant (proven red, then restored byte-exact via sha256 —
 * see the passe report). No `any`, no unsafe: the file stays off the lint ratchet.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertClosedGateDecision, assertNoForbiddenKey } from "@monark/contracts";
import type { Prediction } from "@monark/contracts";
import {
  runGate,
  validateHarnessParams,
  HarnessToolError,
  GATE_TOOL_DESCRIPTION,
  CASCADE_UNCALIBRATED_SENTENCE,
  type HarnessParams,
} from "../src/tools/gate.ts";
import { BTC_DIR_CALIB_PROVENANCE, BTC_DIR_CALIB_DIGEST, CALIB_DIGEST_PINNED } from "../src/calibration.ts";

const GOOD_PARAMS: HarnessParams = {
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

const CASCADE_PRED: Prediction = {
  schema_version: "1.0.0",
  task_class: "cascade-liquidable-24h",
  yhat: 12345,
  predictor_id: "internal:ukemi",
  produced_at: "2026-09-04T00:00:00Z",
};

// Test — the tool EMITS the frozen, closed GateDecision; a key outside the contract throws.
// Mutant: `return { ...decision, p_correct: 0 }` in gate.ts runGate ⇒ red.
test("gate_tool_emits_frozen_gate_decision", () => {
  const d = runGate(BTC_PRED, GOOD_PARAMS);
  assertClosedGateDecision(d);
  assertNoForbiddenKey(d);
  assert.equal(d.schema_version, "1.0.0");
  assert.equal(d.tool, "perps_order_preview");
  const tampered = { ...d, p_correct: 0.9 };
  assert.throws(() => { assertClosedGateDecision(tampered); }, /unknown key/i);
});

// Test — the gate NEVER calls `params.tool` (invariant D0): it only echoes it.
// Mutant: invoke `globalThis[input.tool]()` in gate.ts ⇒ red.
test("gate_tool_never_calls_tool", () => {
  const g = globalThis as Record<string, unknown>;
  let called = false;
  g["__monark_sentinel_h1"] = () => { called = true; };
  try {
    const d = runGate(BTC_PRED, { ...GOOD_PARAMS, tool: "__monark_sentinel_h1" });
    assert.equal(called, false, "the gate must NEVER invoke the named tool (D0)");
    assert.equal(d.tool, "__monark_sentinel_h1", "the tool is echoed into the decision");
  } finally {
    delete g["__monark_sentinel_h1"];
  }
});

// Test — dispatch is on task_class; cascade has no committed calibration ⇒ abstain/under_calib (K-4b).
// Mutant: hard-code the `set` (btc-dir) path for every class ⇒ red.
test("gate_dispatches_on_task_class", () => {
  const d = runGate(CASCADE_PRED, { ...GOOD_PARAMS, intent: 12345 });
  assert.equal(d.action, "abstain");
  assert.equal(d.reason, "under_calib");
  assert.equal(d.verdict.reason, "under_calib");
  // btc-dir stays a real, non-abstain-by-calibration decision (the classes truly diverge).
  const b = runGate(BTC_PRED, GOOD_PARAMS);
  assert.notEqual(b.verdict.reason, "under_calib");
});

// Test — the description carries the cascade honesty sentence (K-4e).
// Mutant: remove/alter the sentence in GATE_TOOL_DESCRIPTION ⇒ red.
test("gate_description_declares_cascade_uncalibrated", () => {
  assert.ok(GATE_TOOL_DESCRIPTION.includes(CASCADE_UNCALIBRATED_SENTENCE));
  assert.ok(CASCADE_UNCALIBRATED_SENTENCE.includes("no cascade calibration is committed"));
  assert.ok(CASCADE_UNCALIBRATED_SENTENCE.includes("under_calib"));
});

// Test — invalid params ⇒ a tool error, never a silent gate (K-4a).
// Mutant: drop a bound check in validateHarnessParams ⇒ red.
test("gate_rejects_invalid_params", () => {
  assert.throws(() => { validateHarnessParams({ ...GOOD_PARAMS, alpha: 1.5 }); }, HarnessToolError);
  assert.throws(() => { validateHarnessParams({ ...GOOD_PARAMS, alpha: 0 }); }, HarnessToolError);
  assert.throws(() => { validateHarnessParams({ ...GOOD_PARAMS, nMin: 0 }); }, HarnessToolError);
  assert.throws(() => { validateHarnessParams({ ...GOOD_PARAMS, tau: -1 }); }, HarnessToolError);
  assert.throws(() => { validateHarnessParams({ ...GOOD_PARAMS, tauInterval: -1 }); }, HarnessToolError);
  assert.throws(() => { validateHarnessParams({ ...GOOD_PARAMS, bFloor: -1 }); }, HarnessToolError);
  assert.throws(() => { runGate(BTC_PRED, { ...GOOD_PARAMS, alpha: 2 }); }, HarnessToolError);
  assert.doesNotThrow(() => { validateHarnessParams(GOOD_PARAMS); });
});

// Test — the committed calibration is DECLARED synthetic and digest-pinned (C-8).
// Mutant: remove the word `synthetic` from BTC_DIR_CALIB_PROVENANCE ⇒ red.
test("calibration_declared_synthetic", () => {
  assert.ok(BTC_DIR_CALIB_PROVENANCE.includes("synthetic"), "provenance must declare synthetic");
  assert.ok(GATE_TOOL_DESCRIPTION.includes("synthetic"), "the tool description declares synthetic");
  assert.equal(BTC_DIR_CALIB_DIGEST, CALIB_DIGEST_PINNED, "calibration digest is pinned (committed)");
});
