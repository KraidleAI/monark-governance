/**
 * Harness — gate-logic tests (ADR-M005 D5/D8/D9, K-4).
 * Each test is killed by >= 1 named mutant (proven red, then restored byte-exact via sha256 —
 * see the passe report). No `any`, no unsafe: the file stays off the lint ratchet.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertClosedGateDecision, assertNoForbiddenKey, calibDigest } from "@monark/contracts";
import type { Prediction } from "@monark/contracts";
import {
  runGate,
  validateHarnessParams,
  HarnessToolError,
  GATE_TOOL_DESCRIPTION,
  CASCADE_UNCALIBRATED_SENTENCE,
  type HarnessParams,
} from "../src/tools/gate.ts";
import { HARNESS_TOOLS, type GateEnvelope } from "../src/tools/registry.ts";
import { runCalibrate, CALIBRATE_LABEL } from "../src/tools/calibrate.ts";
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

// ---------------------------------------------------------------------------- C2 — BYO conformal loop (ADR-M007 D7)

/** A caller-owned (free-string) task_class ⇒ the BYO path (not the committed btc-dir/cascade classes). */
const BYO_INTERVAL_PRED: Prediction = {
  schema_version: "1.0.0",
  task_class: "byo-interval-demo",
  yhat: 0,
  predictor_id: "caller:model",
  produced_at: "2026-09-04T00:00:00Z",
};
const BYO_SET_PRED: Prediction = {
  schema_version: "1.0.0",
  task_class: "byo-set-demo",
  yhat: "A",
  predictor_id: "caller:model",
  produced_at: "2026-09-04T00:00:00Z",
};

// Test — HAND-ROLLED interval oracle (D-C2.7). scores 0.1..1.0 SHUFFLED, α=0.1, nMin=5:
//   p = ⌈(n+1)(1−α)⌉ = ⌈11·0.9⌉ = ⌈9.9⌉ = 10 ≤ n=10 ⇒ q̂ = 10th smallest = 1.0 (WRITTEN IN BY HAND).
// ŷ=0 ⇒ region [ŷ−q̂, ŷ+q̂] = [−1, 1], width 2. tauInterval=2 + intent 0 ⇒ COMMIT/covered;
// tauInterval=1 (width 2 > 1) ⇒ DEFER/interval_too_wide. Mutant in splitQuantile/region wiring diverges.
test("gate_byo_interval_hand_rolled_oracle", () => {
  const scores = [0.5, 0.1, 0.9, 0.3, 0.7, 0.2, 0.8, 0.4, 0.6, 1.0]; // n=10, shuffled on purpose
  // COMMIT: width 2 <= tauInterval 2, intent 0 ∈ [−1,1]. nMin=5 <= n=10 (a calibrated, non-under_calib run).
  const commit = runGate(BYO_INTERVAL_PRED, {
    ...GOOD_PARAMS, intent: 0, nMin: 5, tauInterval: 2, calibration: { scores, mode: "interval" },
  });
  assertClosedGateDecision(commit);
  assertNoForbiddenKey(commit);
  assert.equal(commit.verdict.qhat, 1.0, "q̂ = 10th smallest score = 1.0 (hand-computed)");
  assert.equal(commit.verdict.region.kind, "interval", "interval mode ⇒ interval region");
  assert.deepEqual(commit.verdict.region, { kind: "interval", lo: -1, hi: 1 }, "region [ŷ−q̂, ŷ+q̂] = [−1,1]");
  assert.equal(commit.verdict.abstain, false, "a covered interval verdict does not abstain");
  assert.equal(commit.verdict.reason, "covered", "the verdict reason is covered (L3 decides width)");
  assert.equal(commit.action, "commit", "width 2 <= tauInterval 2, intent 0 ∈ [−1,1] ⇒ COMMIT");
  assert.equal(commit.reason, "covered");
  // DEFER: same region, but tauInterval 1 < width 2.
  const defer = runGate(BYO_INTERVAL_PRED, {
    ...GOOD_PARAMS, intent: 0, nMin: 5, tauInterval: 1, calibration: { scores, mode: "interval" },
  });
  assert.equal(defer.action, "defer", "width 2 > tauInterval 1 ⇒ DEFER");
  assert.equal(defer.reason, "interval_too_wide", "the DEFER reason is interval_too_wide");
});

// Test — HAND-ROLLED set oracle (D-C2.7). scores all ≤ 0.3, max 0.3, n=10, α=0.1, nMin=5 ⇒ p=10 ⇒
//   q̂ = 10th smallest = 0.3 (BY HAND). candidates A:0.2, B:0.9, C:0.5 ⇒ C(x)={A} (only 0.2 ≤ 0.3).
// tau=1, yhat/intent "A" ⇒ COMMIT/covered; label_schema derived = "A|B|C". Variant |C|=3 ⇒ DEFER.
test("gate_byo_set_hand_rolled_oracle", () => {
  const scores = [0.30, 0.05, 0.20, 0.10, 0.25, 0.15, 0.08, 0.12, 0.18, 0.22]; // n=10, max 0.30, shuffled
  const commit = runGate(BYO_SET_PRED, {
    ...GOOD_PARAMS, intent: "A", tau: 1, nMin: 5,
    calibration: { scores, mode: "set", candidates: [{ label: "A", score: 0.2 }, { label: "B", score: 0.9 }, { label: "C", score: 0.5 }] },
  });
  assertClosedGateDecision(commit);
  assert.equal(commit.verdict.qhat, 0.3, "q̂ = 10th smallest score = 0.3 (hand-computed)");
  assert.equal(commit.verdict.region.kind, "set", "set mode ⇒ set region");
  assert.deepEqual(commit.verdict.region, { kind: "set", labels: ["A"], label_schema: "A|B|C" }, "C(x)={A}, label_schema derived from candidates (B-3)");
  assert.equal(commit.verdict.abstain, false, "|C|=1 <= tau=1 ⇒ no abstain");
  assert.equal(commit.action, "commit", "intent A ∈ {A}, |C|=1 <= tau=1 ⇒ COMMIT");
  assert.equal(commit.reason, "covered");

  // Variant: candidates all ≤ q̂ ⇒ |C|=3 > tau=1 ⇒ DEFER/set_too_large.
  const defer = runGate(BYO_SET_PRED, {
    ...GOOD_PARAMS, intent: "A", tau: 1, nMin: 5,
    calibration: { scores, mode: "set", candidates: [{ label: "A", score: 0.2 }, { label: "B", score: 0.1 }, { label: "C", score: 0.3 }] },
  });
  assert.deepEqual(defer.verdict.region, { kind: "set", labels: ["A", "B", "C"], label_schema: "A|B|C" }, "all three candidates ≤ q̂=0.3");
  assert.equal(defer.verdict.abstain, true, "|C|=3 > tau=1 ⇒ verdict abstains");
  assert.equal(defer.verdict.reason, "set_too_large", "verdict reason set_too_large (mirror gate.ts:144)");
  assert.equal(defer.action, "defer", "|C|=3 > tau=1, clock open ⇒ DEFER");
  assert.equal(defer.reason, "set_too_large");
});

// Test — B-4 (B-6 load-bearing): interval mode requires non-negative scores; a negative one ⇒
// HarnessToolError BEFORE splitQuantile. The all-negative vector (>= p negatives, p=10 in hand) is the
// DISCRIMINATING mutant vector: with the guard removed, q̂ = 10th smallest = the max negative < 0 ⇒
// buildIntervalRegion(0−q̂, 0+q̂) has lo > hi ⇒ throws the bare M5 Error (a 500). WITH the guard both
// throw HarnessToolError. Mutant: delete the `interval mode requires non-negative` guard in gate.ts ⇒
// the all-negative case throws the M5 Error (not HarnessToolError) ⇒ this assertion reds.
test("gate_byo_interval_rejects_negative_scores", () => {
  // (a) DISCRIMINATING (asserted FIRST so the mutant's own output surfaces the M5 500): ALL 10 negative
  // with nMin=5 (n=10 >= nMin, p=⌈11·0.9⌉=10 <= n) — so splitQuantile SUCCEEDS and q̂ = 10th smallest =
  // -0.1 < 0. Under the mutant (guard removed) this reaches buildIntervalRegion(0.1, -0.1) ⇒ lo > hi ⇒ the
  // bare M5 Error (a 500, NOT ∈ TOOL_ERROR_NAMES); assert.throws then re-throws that non-HarnessToolError
  // so the runner prints the M5 message. With the guard it is a HarnessToolError (400) BEFORE splitQuantile.
  const allNeg = [-0.5, -0.1, -0.9, -0.3, -0.7, -0.2, -0.8, -0.4, -0.6, -1.0]; // n=10, all < 0
  assert.throws(
    () => runGate(BYO_INTERVAL_PRED, { ...GOOD_PARAMS, intent: 0, nMin: 5, calibration: { scores: allNeg, mode: "interval" } }),
    HarnessToolError,
    "an all-negative interval vector ⇒ HarnessToolError, never the bare M5 throw (B-4/B-6)",
  );
  // (b) a single negative score ⇒ tool error (raised in validateCalibration before any computation).
  assert.throws(
    () => runGate(BYO_INTERVAL_PRED, { ...GOOD_PARAMS, intent: 0, nMin: 5, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, -0.1], mode: "interval" } }),
    HarnessToolError,
    "one negative score in interval mode ⇒ HarnessToolError",
  );
});

// Test — B-1 (honesty wiring, trou type H6): the BYO content text carries the exchangeability label and
// NEVER the CASCADE sentence. Driven through the REGISTRY run() (the real wiring registry.ts:68), so a
// mutant that keys honestyText on task_class alone (`honestyText(env.prediction.task_class, false)`)
// returns the CASCADE sentence next to a BYO COMMIT ⇒ this reds.
test("gate_byo_honesty_text_is_wired_on_calibration_presence", () => {
  const gateTool = HARNESS_TOOLS.find((t) => t.name === "gate");
  assert.ok(gateTool, "the gate tool is registered");
  const byoBody: GateEnvelope = {
    prediction: BYO_INTERVAL_PRED,
    params: { ...GOOD_PARAMS, intent: 0, tauInterval: 2, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], mode: "interval" } },
  };
  const text = gateTool.run(byoBody).text;
  assert.equal(text, `${CALIBRATE_LABEL} B_t is caller-carried.`, "BYO content == the CALIBRATE_LABEL honesty carrier (B-2)");
  assert.ok(text.includes("exchangeable"), "the BYO content declares the exchangeability hypothesis");
  assert.ok(!text.includes(CASCADE_UNCALIBRATED_SENTENCE), "the BYO content must NOT carry the CASCADE sentence (B-1)");
  // Non-regression: a committed-class gate still carries its own honesty text (not the BYO label).
  const cascadeText = gateTool.run({ prediction: CASCADE_PRED, params: { ...GOOD_PARAMS, intent: 12345 } }).text;
  assert.ok(cascadeText.includes(CASCADE_UNCALIBRATED_SENTENCE), "a cascade gate still carries the CASCADE sentence");
});

// Test — audit (D-C2.5): the BYO decision's verdict.calib_digest === calibDigest(scores) ===
// calibrate.runCalibrate(scores).set_digest. This CLOSES the C1↔C2 loop: a caller that calibrated
// (calibrate → set_digest) and then gated on the SAME scores gets a decision provably built on ITS
// calibration. Mutant: build the verdict on a different score array ⇒ the triple equality reds.
test("gate_byo_audit_calib_digest_closes_the_loop", () => {
  const scores = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const decision = runGate(BYO_INTERVAL_PRED, { ...GOOD_PARAMS, intent: 0, nMin: 5, tauInterval: 2, calibration: { scores, mode: "interval" } });
  const calibrate = runCalibrate({ scores, alpha: GOOD_PARAMS.alpha, nMin: 5 });
  assert.equal(decision.verdict.calib_digest, calibDigest(scores), "verdict.calib_digest === calibDigest(scores)");
  assert.equal(decision.verdict.calib_digest, calibrate.set_digest, "verdict.calib_digest === calibrate.set_digest (C1↔C2 audit)");
  assert.equal(decision.verdict.n_calib, scores.length, "n_calib == the caller's score count");
});

// Test — anti-override guard (D-C2.1): a calibration alongside a COMMITTED class is a tool error, never a
// silent overwrite of the synthetic committed decision. Mutant: drop the guard ⇒ the committed class is
// silently re-conformalized ⇒ no throw ⇒ red.
test("gate_byo_anti_override_guard", () => {
  const scores = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  assert.throws(
    () => runGate({ ...BTC_PRED }, { ...GOOD_PARAMS, calibration: { scores, mode: "set", candidates: [{ label: "up", score: 0.1 }, { label: "down", score: 0.9 }] } }),
    HarnessToolError,
    "calibration + task_class btc-dir-15m ⇒ HarnessToolError",
  );
  assert.throws(
    () => runGate({ ...CASCADE_PRED }, { ...GOOD_PARAMS, intent: 12345, calibration: { scores, mode: "interval" } }),
    HarnessToolError,
    "calibration + task_class cascade-liquidable-24h ⇒ HarnessToolError",
  );
});

// Test — B-3: a malformed candidate label (non-ASCII / duplicate / containing `|`) ⇒ HarnessToolError,
// never a GateDecision carrying a forged label_schema in the frozen contract. Mutant: drop the label
// validation ⇒ a `|`-bearing or duplicate label reaches buildSetRegion ⇒ no throw ⇒ red.
test("gate_byo_set_label_validation", () => {
  const scores = [0.30, 0.05, 0.20, 0.10, 0.25, 0.15, 0.08, 0.12, 0.18, 0.22];
  const run = (candidates: { label: string; score: number }[]): void => {
    runGate(BYO_SET_PRED, { ...GOOD_PARAMS, intent: "A", tau: 1, calibration: { scores, mode: "set", candidates } });
  };
  assert.throws(() => run([{ label: "A", score: 0.2 }, { label: "B|C", score: 0.5 }]), HarnessToolError, "a `|` in a label ⇒ tool error (B-3)");
  assert.throws(() => run([{ label: "A", score: 0.2 }, { label: "A", score: 0.5 }]), HarnessToolError, "a duplicate label ⇒ tool error");
  assert.throws(() => run([{ label: "A", score: 0.2 }, { label: String.fromCharCode(233), score: 0.5 }]), HarnessToolError, "a non-ASCII label (U+00E9) reddens the printable-ASCII guard");
  assert.throws(() => run([{ label: "", score: 0.2 }]), HarnessToolError, "an empty label ⇒ tool error");
  assert.throws(() => run([]), HarnessToolError, "an empty candidate list ⇒ tool error");
});

// Test — fail-closed (D-C2.7): p>n and n<nMin ⇒ under_calib (qhat null); a wrong-typed yhat for the mode
// ⇒ HarnessToolError BEFORE the region (C-1). Mutant: clamp instead of null, or skip the yhat type check ⇒ red.
test("gate_byo_fail_closed", () => {
  // p > n: n=5, α=0.05, nMin=1 ⇒ p=⌈6·0.95⌉=6 > 5 ⇒ under_calib. The VERDICT is fail-closed (qhat null,
  // reason under_calib, empty region); the gate abstains (the empty region carries no coverage).
  const pOverN = runGate(BYO_INTERVAL_PRED, { ...GOOD_PARAMS, intent: 0, nMin: 1, alpha: 0.05, calibration: { scores: [0.2, 0.4, 0.6, 0.8, 1.0], mode: "interval" } });
  assert.equal(pOverN.verdict.qhat, null, "p>n ⇒ q̂ null (never clamped)");
  assert.equal(pOverN.verdict.reason, "under_calib", "p>n ⇒ verdict under_calib");
  assert.equal(pOverN.action, "abstain", "under_calib verdict ⇒ the gate abstains");
  assert.equal(pOverN.allow, false, "an under_calib decision never allows the tool");
  // n < nMin (nMin=50 default): nCalib < nMin ⇒ ABSTAIN under_calib at the gate level too.
  const underMin = runGate(BYO_INTERVAL_PRED, { ...GOOD_PARAMS, intent: 0, calibration: { scores: [0.1, 0.2, 0.3], mode: "interval" } });
  assert.equal(underMin.verdict.qhat, null, "n<nMin ⇒ q̂ null");
  assert.equal(underMin.action, "abstain", "n<nMin ⇒ ABSTAIN");
  assert.equal(underMin.reason, "under_calib", "nCalib < nMin ⇒ gate reason under_calib");
  // wrong-typed yhat for the mode ⇒ tool error BEFORE the region (C-1).
  assert.throws(
    () => runGate({ ...BYO_INTERVAL_PRED, yhat: "up" }, { ...GOOD_PARAMS, intent: 0, tauInterval: 2, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], mode: "interval" } }),
    HarnessToolError,
    "a string yhat in interval mode ⇒ HarnessToolError",
  );
  assert.throws(
    () => runGate({ ...BYO_SET_PRED, yhat: 3 }, { ...GOOD_PARAMS, intent: "A", tau: 1, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], mode: "set", candidates: [{ label: "A", score: 0.1 }] } }),
    HarnessToolError,
    "a number yhat in set mode ⇒ HarnessToolError",
  );
});

// Test — NON-REGRESSION (M-1): with NO calibration, the committed btc-dir and cascade decisions are
// byte-identical to their pre-C2 behaviour (verdicts + digests). These digests are the SAME anchors the
// H5 trace pins, so a drift here would also move the trace. Mutant: any change to the committed paths ⇒ red.
test("gate_committed_classes_unchanged_without_calibration", () => {
  const btc = runGate(BTC_PRED, GOOD_PARAMS);
  assert.equal(btc.action, "commit", "btc-dir stays a covered commit");
  assert.equal(btc.reason, "covered");
  assert.equal(btc.verdict.calib_digest, CALIB_DIGEST_PINNED, "btc-dir calib_digest is the pinned synthetic digest");
  assert.equal(btc.verdict.reason, "covered");

  const cascade = runGate(CASCADE_PRED, { ...GOOD_PARAMS, intent: 12345 });
  assert.equal(cascade.action, "abstain", "cascade stays an under_calib abstain");
  assert.equal(cascade.reason, "under_calib");
  // cascade has NO committed calibration ⇒ calibDigest([]) — the empty-input sha256, written in by hand.
  assert.equal(cascade.verdict.calib_digest, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "cascade calib_digest == calibDigest([])");
  assert.equal(cascade.verdict.reason, "under_calib");
});
