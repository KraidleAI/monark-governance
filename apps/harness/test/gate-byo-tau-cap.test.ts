/**
 * Harness - BYO set-mode tau cap (worksite 4 of the RECHERCHES alignment, lot L4-5; ADR-M005 D5 K-4(d)
 * amendment 2026-09-30, class policy v1, D3 and D5). In set mode tau must be at most the number of
 * candidates minus 1: a larger tau would let a COMMIT stand on the whole candidate list. The refusal is a
 * named tool error (400) naming the required value; the cap runs after the B-3 label checks; interval mode
 * is not capped. Categories: B-1 F2P, B-2 and B-3 pins, each with one named killer.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertClosedGateDecision } from "@monark/contracts";
import type { GateDecision, Prediction } from "@monark/contracts";
import { runGate, HarnessToolError, type HarnessParams } from "../src/tools/gate.ts";
import { SCHEMA_VERSION } from "../src/tools/gate.ts";

const PARAMS: HarnessParams = {
  remainingBudget: 0.1,
  bFloor: 0,
  tau: 1,
  tauInterval: 2,
  alpha: 0.1,
  nMin: 5,
  intent: "A",
  tool: "caller_downstream_tool",
  clockOpen: true,
};

// n = 10, alpha = 0.1, nMin = 5: p = ceil(11 x 0.9) = 10, so qhat = the largest score = 1.0.
const SCORES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

const SET_PRED: Prediction = {
  schema_version: SCHEMA_VERSION,
  task_class: "byo-set-demo",
  yhat: "A",
  predictor_id: "caller:model",
  produced_at: "2026-09-04T00:00:00Z",
};

const INTERVAL_PRED: Prediction = {
  schema_version: SCHEMA_VERSION,
  task_class: "byo-interval-demo",
  yhat: 0,
  predictor_id: "caller:model",
  produced_at: "2026-09-04T00:00:00Z",
};

type Candidate = { label: string; score: number };

const capText = (k: number, tau: number): string =>
  `byo 'set' mode requires params.tau = ${String(k - 1)} or smaller (the number of candidates minus 1, so a COMMIT is never on the whole candidate list), got ${String(tau)}`;

const runSet = (candidates: Candidate[], tau: number) =>
  runGate(SET_PRED, { ...PARAMS, tau, calibration: { scores: SCORES, mode: "set", candidates } });

const assertCapRefusal = (candidates: Candidate[], tau: number): void => {
  assert.throws(
    () => runSet(candidates, tau),
    (e: unknown) => e instanceof HarnessToolError && e.message === capText(candidates.length, tau),
    `set mode, ${String(candidates.length)} candidates, tau ${String(tau)}: the named cap refusal`,
  );
};

// B-1 (F2P). Three candidates A 0.2, B 0.5, C 1.5 with qhat 1.0: the set is {A, B}. tau 2 = 3 - 1 is served
// (a COMMIT on 2 of 3 labels); tau 3, 7 and 2.5 are refused with the exact text. One candidate: tau 0 is
// served (the set {A} is larger than 0, a DEFER), tau 1 is refused.
// killer: apps/harness/src/tools/gate.ts:457 ROR "params.tau > candidates.length - 1" -> "params.tau > candidates.length"
test("byo_set_tau_cap_names_required_value", () => {
  const three: Candidate[] = [{ label: "A", score: 0.2 }, { label: "B", score: 0.5 }, { label: "C", score: 1.5 }];
  const atCap = runSet(three, 2);
  assertClosedGateDecision(atCap);
  assert.deepEqual(atCap.verdict.region, { kind: "set", labels: ["A", "B"], label_schema: "A|B|C" }, "C(x) = {A, B} at qhat 1.0");
  assert.equal(atCap.action, "commit", "tau 2 = 3 - 1: |C| = 2 <= tau and intent A in C, a COMMIT");
  assertCapRefusal(three, 3);
  assertCapRefusal(three, 7);
  assertCapRefusal(three, 2.5);

  const one: Candidate[] = [{ label: "A", score: 0.2 }];
  const zero = runSet(one, 0);
  assertClosedGateDecision(zero);
  assert.equal(zero.action, "defer", "tau 0 is a legal appetite: |C| = 1 > 0, a DEFER");
  assert.equal(zero.reason, "set_too_large");
  assertCapRefusal(one, 1);
});

// B-2 (pin, check order). A label containing a pipe with tau 5 (above the cap of 1 for two candidates): the
// B-3 label refusal comes first, never the tau text.
// killer: apps/harness/src/tools/gate.ts:436 SDL "must not contain" -> ""
test("byo_set_tau_cap_after_label_validation", () => {
  assert.throws(
    () => runSet([{ label: "A", score: 0.2 }, { label: "B|C", score: 0.5 }], 5),
    (e: unknown) => e instanceof HarnessToolError && e.message.includes("must not contain '|'") && !e.message.includes("requires params.tau"),
    "the B-3 pipe refusal fires before the tau cap",
  );
});

// B-3 (pin). Interval mode is not capped (ADR D5): tau 9 with scores 0.1 .. 1.0 gives the region [-1, 1],
// width 2 <= tauInterval 2, intent 0 inside, a COMMIT. A tool error here is an assertion failure (assert.fail),
// so the killer is killed in the closed format (ERR_ASSERTION), not merely red.
// killer: apps/harness/src/tools/gate.ts:455 SDL "cal.mode !==" -> ""
test("byo_interval_mode_ignores_tau", () => {
  let d: GateDecision;
  try {
    d = runGate(INTERVAL_PRED, { ...PARAMS, tau: 9, intent: 0, calibration: { scores: SCORES, mode: "interval" } });
  } catch (e) {
    assert.fail(`interval mode, tau 9: no tool error expected, got ${String(e)}`);
  }
  assertClosedGateDecision(d);
  assert.equal(d.action, "commit", "interval mode, tau 9: a decision, no tau refusal");
  assert.equal(d.reason, "covered");
});
