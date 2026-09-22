/**
 * Harness — gate-logic tests (ADR-M005 D5/D8/D9, K-4).
 * Each test is killed by >= 1 named mutant (proven red, then restored byte-exact via sha256 —
 * see the passe report). No `any`, no unsafe: the file stays off the lint ratchet.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertClosedGateDecision, assertNoForbiddenKey, calibDigest } from "@monark/contracts";
import type { Prediction, AttestedFlow, AttestedPrice, GateDecision } from "@monark/contracts";
import {
  runGate,
  validateHarnessParams,
  HarnessToolError,
  GATE_TOOL_DESCRIPTION,
  describeGate,
  GATE_NON_REVERIFICATION_SENTENCE,
  CASCADE_UNCALIBRATED_SENTENCE,
  STABLE_RUN_UNCALIBRATED_SENTENCE,
  STABLE_RUN_COMMITTED_SENTENCE,
  TASK_STABLE_RUN,
  type HarnessParams,
} from "../src/tools/gate.ts";
import { HARNESS_TOOLS, type GateEnvelope } from "../src/tools/registry.ts";
import { runAttest } from "../src/tools/attest.ts"; // ADR-M017 D4(3) / M018 D1(b): the REAL served attest -> gate tuyau
import { BINANCE_BTCUSDT_TICKER_URL } from "../src/attestation-binding.ts";
import { runCalibrate, CALIBRATE_LABEL } from "../src/tools/calibrate.ts";
import {
  BTC_DIR_CALIB_PROVENANCE,
  BTC_DIR_CALIB_DIGEST,
  CALIB_DIGEST_PINNED,
  USDE_STABLE_RUN_CALIB,
  USDE_STABLE_RUN_PREDICTOR_ID,
  USDE_STABLE_RUN_TASK_CLASS,
  USDE_STABLE_RUN_CALIB_DIGEST_PINNED,
} from "../src/calibration.ts";
import { splitQuantile, buildIntervalRegion, NUMERIC_LABEL_SCHEMA, BTC_DIR_LABEL_SCHEMA } from "@monark/hikae"; // ADR-M011: anti-circularity — L1 q̂ + NDG-1 region before runGate; E9: label_schema constants
import { fromAttestedFlow, isNarabiError } from "@monark/monark"; // A7: real flows via the adapter

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

// A Narabi velocity-forecast Prediction (ADR-M008 D4) — the caller-carried output of the Narabi adapter.
const STABLE_RUN_PRED: Prediction = {
  schema_version: "1.0.0",
  task_class: "stable-run-velocity-24h",
  yhat: 0.0000416, // a per-hour velocity forecast (fraction of supply / hour)
  predictor_id: "narabi:persistence-v1",
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
  // The honesty carrier LEADS the content text (byte-identical prefix, B-2); the verdict summary (a
  // delivery aid for text-only clients) follows it — so the prefix equality is now a startsWith.
  assert.ok(text.startsWith(`${CALIBRATE_LABEL} B_t is caller-carried.`), "BYO content leads with the CALIBRATE_LABEL honesty carrier (B-2)");
  assert.ok(text.includes("exchangeable"), "the BYO content declares the exchangeability hypothesis");
  assert.ok(!text.includes(CASCADE_UNCALIBRATED_SENTENCE), "the BYO content must NOT carry the CASCADE sentence (B-1)");
  // The verdict summary is DERIVED from the same decision (single source): action + a truncated calib_digest
  // appear in the content text, so a text-only client sees the decision. Mutant that hardcodes it ⇒ reds.
  const byoDecision = runGate(byoBody.prediction, byoBody.params);
  assert.ok(text.includes(`action=${byoDecision.action}`), "the verdict summary carries the decision action");
  assert.ok(text.includes(`calib_digest=${byoDecision.verdict.calib_digest.slice(0, 8)}`), "the verdict summary carries the (truncated) calib_digest");
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

// Test (E9, the ADR-M018 D4 lot) — a NUMERIC (interval) class under `under_calib` carries an EMPTY `set`
// region whose label_schema names the numeric nature (NUMERIC_LABEL_SCHEMA), NEVER the directional
// `up|down` (an inert but dishonest octet on the served wire). The frozen coverage-verdict contract
// requires a set region's label_schema to be non-empty (minLength 1), so a numeric class cannot OMIT it —
// hence a class-honest schema rather than an empty one. Every reachable served numeric under_calib path is
// enumerated; a btc-dir positive control shows the directional default is intact (E9 changed only the
// numeric callers, not underCalibVerdict's default). Mutant: delete `labelSchema: NUMERIC_LABEL_SCHEMA`
// in interval-conformer.ts `underCalib` (the `labelSchema: NUMERIC_LABEL_SCHEMA` line) — `npm run typecheck` stays GREEN (the default masks it,
// exactly as workspace hoisting masked m1), and the cascade case below reds.
test("numeric_under_calib_region_is_not_directional", () => {
  const numericUnderCalib: { name: string; d: GateDecision }[] = [
    // committed cascade: cascadeVerdict -> conformInterval({calib:[]}) -> interval-conformer underCalib helper
    { name: "cascade committed (no calibration)", d: runGate(CASCADE_PRED, { ...GOOD_PARAMS, intent: 12345 }) },
    // stable-run, NON-committed key: stableRunVerdict committed===undefined -> conformInterval -> underCalib helper
    { name: "stable-run non-committed key", d: runGate(STABLE_RUN_PRED, { ...GOOD_PARAMS, intent: 0 }) },
    // stable-run, USDe committed key but nMin > committed score count: split fails -> stableRunVerdict direct under_calib
    {
      name: "stable-run USDe key, nMin > n_committed",
      d: runGate({ ...STABLE_RUN_PRED, predictor_id: USDE_STABLE_RUN_PREDICTOR_ID }, { ...GOOD_PARAMS, intent: 0, nMin: 10000 }),
    },
    // BYO interval, p>n split failure: byoVerdict split under_calib, labelSchema=NUMERIC from the interval-mode ternary
    {
      name: "byo interval p>n",
      d: runGate(BYO_INTERVAL_PRED, { ...GOOD_PARAMS, intent: 0, nMin: 1, alpha: 0.05, calibration: { scores: [0.2, 0.4, 0.6, 0.8, 1.0], mode: "interval" } }),
    },
    // BYO interval, successful split but q-hat=0 zero-width NDG-1 abstention: byoVerdict interval NDG branch
    {
      name: "byo interval NDG zero-width",
      d: runGate(BYO_INTERVAL_PRED, { ...GOOD_PARAMS, intent: 0, nMin: 10, calibration: { scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], mode: "interval" } }),
    },
    // committed USDe key, yhat absorbed to +Inf: stableRunVerdict zero-width NDG branch (G2 review of the cheap-gaps lot, C2:
    // the served path a mutant on gate.ts:481 left green before this case was enumerated)
    {
      name: "stable-run committed key NDG zero-width",
      d: runGate({ ...STABLE_RUN_PRED, predictor_id: USDE_STABLE_RUN_PREDICTOR_ID, yhat: 1e300 }, GOOD_PARAMS),
    },
  ];
  for (const { name, d } of numericUnderCalib) {
    assert.equal(d.verdict.reason, "under_calib", `${name}: expected an under_calib verdict`);
    // Whole-region deepEqual (exact keys): empty set region, class-honest numeric label_schema.
    assert.deepEqual(
      d.verdict.region,
      { kind: "set", labels: [], label_schema: NUMERIC_LABEL_SCHEMA },
      `${name}: numeric under_calib region must be the empty set with a numeric label_schema`,
    );
  }

  // Positive control — the directional default is INTACT: btc-dir under_calib (nMin above the committed
  // synthetic n) still carries `up|down` (btcDirVerdict :390, underCalibVerdict default, unchanged by E9).
  // If this reds, the fix wrongly retargeted the shared default instead of only the numeric callers.
  const btc = runGate(BTC_PRED, { ...GOOD_PARAMS, nMin: 100000 });
  assert.equal(btc.verdict.reason, "under_calib", "btc-dir with nMin above n ⇒ under_calib");
  assert.deepEqual(
    btc.verdict.region,
    { kind: "set", labels: [], label_schema: BTC_DIR_LABEL_SCHEMA },
    "btc-dir under_calib stays directional up|down (default intact)",
  );
});

// ── Narabi / stable-run-velocity-24h — isolation of POPULATION on the wire (ADR-M008 D4/D5 + Amend. bis, C-10) ──

const EMPTY_CALIB_DIGEST = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // calibDigest([])
const USDE_TOKEN = "erc20:0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"; // A4 canonical token (mixed case; canonicalized in the key)
const MSUSD_TOKEN = "erc20:0x4ba01f22827018b4772CD326C7627FB4956A7C00"; // Main Street msUSD v2 — a DIFFERENT population

/** Build a valid AttestedFlow for a (chain, subject) population — the A7 fixtures drive REAL adapter output. */
function narabiFlow(chain: string, subject: string, over: Partial<AttestedFlow["flow"]> = {}): AttestedFlow {
  return {
    schema_version: "1.0.0",
    subject,
    attestor: [{ identity: "issuer-por", key: "deadbeef" }],
    source: { chain, issuer: "0xe3490297a08d6fc8da46edb7b6142e4f461b62d3" }, // EthenaMinting V2 (A4)
    window: "24h",
    // calm window: burns 1_000, close 1e9, mints 0 ⇒ S_open ≈ 1e9 (≫ floor) ⇒ v ≈ 4.17e-8/h.
    flow: { burns: "1000000000000000000000", mints: "0", supply: "1000000000000000000000000000", from_block: 23_000_000, to_block: 23_007_200, ...over },
    residual: ["ap_capacity_unknown"],
    transport: "rpc+eth_getLogs",
    utterance: { hash: "b".repeat(64) },
    observed_at: { clock: "utc", instant: 1_756_000_000 },
    octets_recalcules: true,
    verifier_revision: "narabi-adapter@f2b",
  };
}
/** Adapter → Prediction (fail the test if the adapter refused — A7 needs a real emitted Prediction). */
function adaptToPrediction(f: AttestedFlow): Prediction {
  const out = fromAttestedFlow(f);
  assert.ok(!isNarabiError(out), `adapter unexpectedly refused: ${JSON.stringify(out)}`);
  return out.prediction;
}

// Test — a NON-committed population (STABLE_RUN_PRED carries the naked-ish key `narabi:persistence-v1`)
// abstains under_calib HONESTLY. Mutant: route a non-committed key to the USDe region ⇒ a dishonest commit ⇒ red.
test("gate_stable_run_noncommitted_key_abstains_under_calib", () => {
  const d = runGate(STABLE_RUN_PRED, { ...GOOD_PARAMS, intent: 0 });
  assert.equal(d.action, "abstain", "a non-committed (task_class, predictor_id) ⇒ abstain");
  assert.equal(d.reason, "under_calib");
  assert.equal(d.verdict.reason, "under_calib");
  assert.equal(d.verdict.qhat, null, "no committed calibration for this key ⇒ q̂ null (never clamped)");
  assert.equal(d.verdict.task_class, "stable-run-velocity-24h", "the verdict carries the velocity class");
  assert.equal(d.verdict.calib_digest, EMPTY_CALIB_DIGEST, "non-committed key ⇒ calib_digest == calibDigest([])");
  assert.doesNotThrow(() => { assertClosedGateDecision(d); assertNoForbiddenKey(d); }, "the emitted decision is closed + forbidden-key-free");
});

// Test — a string yhat for the numeric velocity class ⇒ tool error BEFORE any region (C-1 mirror).
test("gate_stable_run_rejects_a_non_numeric_yhat", () => {
  assert.throws(
    () => runGate({ ...STABLE_RUN_PRED, yhat: "run" }, { ...GOOD_PARAMS, intent: 0 }),
    HarnessToolError,
    "a string yhat on stable-run-velocity-24h ⇒ HarnessToolError",
  );
});

// Test — the committed task_class string in the registry equals gate.ts TASK_STABLE_RUN (no cyclic import,
// so a drift would silently unwire the class). Mutant: change either literal ⇒ red.
test("gate_stable_run_task_class_matches_registry", () => {
  assert.equal(USDE_STABLE_RUN_TASK_CLASS, TASK_STABLE_RUN, "the committed registry task_class must equal the gate's TASK_STABLE_RUN");
});

// Test — A7(b): a REAL USDe mainnet flow → adapter → gate reaches the COMMITTED region (covered), keyed on
// (task_class, predictor_id). Anti-circularity: q̂ is proven via splitQuantile BEFORE runGate; the pinned
// digest is the wire calib_digest. Mutant: unwire the USDe key ⇒ under_calib ⇒ every assertion below reds.
test("gate_stable_run_usde_committed_region_A7b", () => {
  const pred = adaptToPrediction(narabiFlow("eip155:1", USDE_TOKEN));
  assert.equal(pred.predictor_id, USDE_STABLE_RUN_PREDICTOR_ID, "the USDe flow emits the committed key");
  const sq = splitQuantile(USDE_STABLE_RUN_CALIB, GOOD_PARAMS.alpha, GOOD_PARAMS.nMin);
  assert.ok("qhat" in sq, "the committed USDe calibration is not under-calibrated at α=0.10, nMin=50");
  // COMMIT: intent = the forecast, width 2·q̂ ≪ tauInterval=1, budget ≥ floor.
  const d = runGate(pred, { ...GOOD_PARAMS, intent: pred.yhat, tauInterval: 1 });
  assert.equal(d.verdict.reason, "covered", "the committed USDe region is produced (not under_calib)");
  assert.equal(d.verdict.region.kind, "interval", "a regression region");
  assert.equal(d.verdict.qhat, sq.qhat, "the wire q̂ equals the independent splitQuantile of the committed scores");
  assert.equal(d.verdict.n_calib, USDE_STABLE_RUN_CALIB.length, "n_calib = 613 committed scores");
  assert.equal(d.verdict.n_calib, 613);
  assert.equal(d.verdict.calib_digest, USDE_STABLE_RUN_CALIB_DIGEST_PINNED, "the wire calib_digest is the pinned USDe digest");
  assert.equal(d.action, "commit", "intent ∈ region, width ≤ τ_interval, B_t ≥ floor ⇒ commit/covered");
  assert.doesNotThrow(() => { assertClosedGateDecision(d); assertNoForbiddenKey(d); });
});

// Test — A7(a,c,d,e): family isolation is fail-closed. A DIFFERENT population NEVER reaches the USDe region:
//   (a) a real msUSD flow (different token) ⇒ under_calib;
//   (c) the USDe token on an L2 chain (different chain) ⇒ under_calib;
//   (d) the USDe key altered by ONE character ⇒ under_calib;
//   (e) the naked formula `narabi:persistence-v2` ⇒ under_calib.
// Mutant: key on task_class alone (drop predictor_id) ⇒ msUSD/L2/altered/naked would pool into USDe ⇒ red.
test("gate_stable_run_family_isolation_fail_closed_A7acde", () => {
  const usdeKey = USDE_STABLE_RUN_PREDICTOR_ID;
  const cases: { name: string; pred: Prediction }[] = [
    { name: "a: real msUSD flow (other token)", pred: adaptToPrediction(narabiFlow("eip155:1", MSUSD_TOKEN)) },
    { name: "c: USDe token on an L2 chain (other chain)", pred: adaptToPrediction(narabiFlow("eip155:8453", USDE_TOKEN)) },
    { name: "d: USDe key altered by one char", pred: { ...adaptToPrediction(narabiFlow("eip155:1", USDE_TOKEN)), predictor_id: usdeKey.slice(0, -1) + (usdeKey.endsWith("3") ? "4" : "3") } },
    { name: "e: naked formula (no population)", pred: { ...adaptToPrediction(narabiFlow("eip155:1", USDE_TOKEN)), predictor_id: "narabi:persistence-v2" } },
  ];
  for (const { name, pred } of cases) {
    assert.notEqual(pred.predictor_id, usdeKey, `${name}: precondition — the key differs from the committed USDe key`);
    const d = runGate(pred, { ...GOOD_PARAMS, intent: pred.yhat, tauInterval: 1 });
    assert.equal(d.action, "abstain", `${name} ⇒ abstain (never the USDe region)`);
    assert.equal(d.reason, "under_calib", `${name} ⇒ under_calib`);
    assert.equal(d.verdict.reason, "under_calib", `${name} ⇒ verdict under_calib`);
    assert.equal(d.verdict.qhat, null, `${name} ⇒ q̂ null (never the committed q̂)`);
    assert.equal(d.verdict.calib_digest, EMPTY_CALIB_DIGEST, `${name} ⇒ calib_digest == calibDigest([]), NEVER the USDe digest`);
    assert.notEqual(d.verdict.calib_digest, USDE_STABLE_RUN_CALIB_DIGEST_PINNED, `${name} ⇒ never the USDe committed digest`);
  }
});

// Test — B-1 + A2 (honesty wiring keyed on the KEY): the committed USDe key carries the COMMITTED sentence;
// every other population carries the UNCOMMITTED sentence; NEVER the cascade sentence. A7(f) surclaim mutant:
// return the committed sentence for a non-committed (msUSD) key ⇒ this reds. Driven through the REAL registry run().
test("gate_stable_run_honesty_text_is_keyed_A2_A7f", () => {
  // The tool description declares BOTH the committed USDe population AND the uncommitted-population sentence.
  assert.ok(GATE_TOOL_DESCRIPTION.includes(STABLE_RUN_UNCALIBRATED_SENTENCE), "the description declares the uncommitted-population sentence");
  assert.ok(GATE_TOOL_DESCRIPTION.includes("synthetic-dollar-whitelisted-redeem"), "the description names the committed USDe population");
  // ADR-M012 item (i) dedup: the "every other ... abstains (under_calib)" queue is rendered ONCE (by the
  // uncommitted clause), never twice — the description interpolates STABLE_RUN_COMMITTED_CORE (no queue).
  // A mutant re-interpolating the full STABLE_RUN_COMMITTED_SENTENCE re-introduces "every other" ⇒ reds.
  assert.equal((GATE_TOOL_DESCRIPTION.match(/every other/g) ?? []).length, 0, "M012(i): the committed sentence's 'every other' queue is deduped out of the description");
  assert.ok(STABLE_RUN_UNCALIBRATED_SENTENCE.includes("no stable-run velocity calibration is committed"));
  assert.ok(STABLE_RUN_UNCALIBRATED_SENTENCE.includes("under_calib"));
  assert.ok(STABLE_RUN_COMMITTED_SENTENCE.includes("committed"));
  // no marketing "calibrated" adjective, no "V1", no probability on either sentence.
  for (const s of [STABLE_RUN_COMMITTED_SENTENCE, STABLE_RUN_UNCALIBRATED_SENTENCE]) {
    assert.doesNotMatch(s, /\bcalibrated\b|\bV1\b|probability|early warning/i, "no overclaim vocabulary");
  }

  const gateTool = HARNESS_TOOLS.find((t) => t.name === "gate");
  assert.ok(gateTool, "the gate tool is registered");
  // committed USDe key ⇒ the committed sentence, never the uncommitted/cascade sentence.
  const usdePred = adaptToPrediction(narabiFlow("eip155:1", USDE_TOKEN));
  const usdeText = gateTool.run({ prediction: usdePred, params: { ...GOOD_PARAMS, intent: usdePred.yhat as number, tauInterval: 1 } }).text;
  assert.ok(usdeText.includes(STABLE_RUN_COMMITTED_SENTENCE), "committed key ⇒ committed sentence");
  assert.ok(!usdeText.includes(CASCADE_UNCALIBRATED_SENTENCE), "committed key ⇒ NOT the cascade sentence");
  // A7(f): a msUSD (non-committed) key ⇒ the uncommitted sentence, NEVER the committed one (surclaim).
  const msusdPred = adaptToPrediction(narabiFlow("eip155:1", MSUSD_TOKEN));
  const msusdText = gateTool.run({ prediction: msusdPred, params: { ...GOOD_PARAMS, intent: 0 } }).text;
  assert.ok(msusdText.includes(STABLE_RUN_UNCALIBRATED_SENTENCE), "non-committed key ⇒ uncommitted sentence");
  assert.ok(!msusdText.includes(STABLE_RUN_COMMITTED_SENTENCE), "A7(f): a non-committed key must NEVER carry the committed 'committed' sentence (surclaim)");
  assert.ok(!msusdText.includes(CASCADE_UNCALIBRATED_SENTENCE), "non-committed key ⇒ NOT the cascade sentence (B-1)");
});

// Test — ADR-M012 D7: the committed sentence's exchangeability clause is replaced by the split-conformal
// (Barber, Candes, Ramdas, Tibshirani 2023, Thm 2, unit weights) coverage framing. It now cites "Barber"
// and NO LONGER declares exchangeability (the measured-non-stationary honesty correction, ADR-M012 §0/D7).
test("gate_sentence_barber", () => {
  assert.ok(STABLE_RUN_COMMITTED_SENTENCE.includes("Barber"), "ADR-M012 D7: the committed sentence must cite Barber (Thm 2)");
  assert.ok(
    !STABLE_RUN_COMMITTED_SENTENCE.includes("exchangeability is declared"),
    "ADR-M012 D7: the committed sentence must no longer declare exchangeability",
  );
});

// Test — livrable (d): NDG-1 (ADR-M011) is REUSED on the USDe stable-run path, not re-added. The path's
// conformalization is splitQuantile → buildIntervalRegion. An ALL-ZERO score vector (degenerate calibration)
// routes to under_calib through THAT chain; the REAL committed USDe scores are non-degenerate (q̂>0, a real
// region). Mutant (region.ts, ADR-M011): drop the lo===hi guard ⇒ the all-zero case yields a covered width-0
// region ⇒ the first assertion reds. No second guard is added anywhere in this lot.
test("gate_stable_run_ndg1_zero_width_is_under_calib_reused", () => {
  const zeros = Array.from({ length: USDE_STABLE_RUN_CALIB.length }, () => 0);
  const sqZero = splitQuantile(zeros, GOOD_PARAMS.alpha, GOOD_PARAMS.nMin);
  assert.ok("qhat" in sqZero && sqZero.qhat === 0, "all-zero scores ⇒ q̂ = 0 (calibrated, degenerate)");
  const irZero = buildIntervalRegion(0.00005 - 0, 0.00005 + 0); // yhat ± 0 ⇒ lo === hi
  assert.ok(irZero.abstain && irZero.reason === "under_calib", "NDG-1: a zero-width region ⇒ under_calib (reused)");
  // The REAL committed USDe scores are non-degenerate ⇒ a real region.
  const sqReal = splitQuantile(USDE_STABLE_RUN_CALIB, GOOD_PARAMS.alpha, GOOD_PARAMS.nMin);
  assert.ok("qhat" in sqReal && sqReal.qhat > 0, "the committed USDe q̂ is strictly positive (non-degenerate)");
  const irReal = buildIntervalRegion(0.00005 - sqReal.qhat, 0.00005 + sqReal.qhat);
  assert.ok(!irReal.abstain, "the committed USDe scores produce a non-degenerate interval region");
});

// Test — A6 (ADR-M008 Amendement bis): the BYO anti-override guard is KEY-AWARE. A BYO calibration must NOT
// overwrite the COMMITTED USDe key, but a DIFFERENT population on the same class MAY bring its own scores.
//   (i)  USDe committed key + calibration ⇒ HarnessToolError (the committed key is locked);
//   (ii) msUSD (non-committed) key + calibration ⇒ NO throw; the CALLER's scores are used (n_calib=10,
//        calib_digest = calibDigest(callerScores)), NEVER the USDe 613.
// Mutants: (a) revert the guard to class-only (`taskClass === TASK_STABLE_RUN`) ⇒ (ii) throws ⇒ red;
// (b) drop the committed-key lookup term ⇒ (i) no longer throws (a caller silently overrides the committed
// USDe calibration) ⇒ red. The n_calib===10 assertion proves the BYO path actually RAN (not merely no throw).
test("gate_stable_run_byo_anti_override_is_key_aware_A6", () => {
  const callerScores = [0.5, 0.1, 0.9, 0.3, 0.7, 0.2, 0.8, 0.4, 0.6, 1.0]; // n=10, the caller's OWN scores
  // (i) the committed USDe key is LOCKED — a BYO must not overwrite it.
  const usdePred = adaptToPrediction(narabiFlow("eip155:1", USDE_TOKEN));
  assert.equal(usdePred.predictor_id, USDE_STABLE_RUN_PREDICTOR_ID);
  assert.throws(
    () => runGate(usdePred, { ...GOOD_PARAMS, intent: 0, calibration: { scores: callerScores, mode: "interval" } }),
    HarnessToolError,
    "BYO on the committed USDe key ⇒ HarnessToolError (locked)",
  );
  // (ii) a DIFFERENT population (msUSD) on the same class MAY BYO its own scores (BYO by κ by family).
  const msusdPred = adaptToPrediction(narabiFlow("eip155:1", MSUSD_TOKEN));
  assert.notEqual(msusdPred.predictor_id, USDE_STABLE_RUN_PREDICTOR_ID);
  const d = runGate(msusdPred, { ...GOOD_PARAMS, intent: msusdPred.yhat, nMin: 5, tauInterval: 2, calibration: { scores: callerScores, mode: "interval" } });
  assert.equal(d.verdict.reason, "covered", "the msUSD BYO path RUNS (not locked)");
  assert.equal(d.verdict.n_calib, callerScores.length, "the CALLER's scores are used (n=10), never the USDe 613");
  assert.equal(d.verdict.calib_digest, calibDigest(callerScores), "calib_digest is over the CALLER's scores, never the USDe digest");
  assert.notEqual(d.verdict.calib_digest, USDE_STABLE_RUN_CALIB_DIGEST_PINNED, "never the USDe committed digest");
});

// ── ADR-M011 — interval non-degeneracy (NDG-1), BYO path (the REAL F2 msUSD repro path) ───────────────

// The msUSD F2-A degenerate STRUCTURE (ADR-M011 §1): n=191 = 190 zero scores + 1 positive dust
// (ratio ≈ 1.2e-8). Provenance sha d95cc0a34507ff9593ed52d55463c2daeca826a9cd2117e5776c19cabdff5e58 names
// the source episode (198 windows, OUT-OF-REPO, REFUSED / negative closure — authority: ADR-M011 §1; see also PLAN-m008-f2b-usde.md §0);
// this vector reproduces the structure, it is NOT that fixture.
const MSUSD_LIKE_SCORES: number[] = [...Array.from({ length: 190 }, () => 0), 1.2e-8]; // n=191

// Test — §3.6 (C-1 BLOQUANTE): a BYO `interval` calibration whose region has ZERO WIDTH (q̂=0 at the
// pinned α=0.10) ⇒ under_calib, never a fabricated width-0 commit. This is the ONLY test that traverses the
// real repro path (harness byoVerdict). Mutant M1 (region.ts guard removed) ⇒ verdict `covered`/q̂=0 ⇒ red.
test("gate_byo_interval_degenerate_calibration_is_under_calib_M011", () => {
  assert.equal(GOOD_PARAMS.alpha, 0.1, "GOOD_PARAMS.alpha is 0.10 (the degenerate-at-α=0.10 case)");
  assert.equal(MSUSD_LIKE_SCORES.length, 191, "n=191 (<= CALIBRATE_MAX_N=10000 ⇒ passes the cap)");
  // ANTI-CIRCULARITY: L1 gives q̂=0 (NOT under_calib) at α=0.10 ⇒ the under_calib comes from NDG-1, not L1.
  assert.deepEqual(splitQuantile(MSUSD_LIKE_SCORES, 0.1, 5), { qhat: 0 }, "L1 q̂=0 at α=0.10 (not under_calib)");
  // PIN alpha:0.10 explicitly — the trap: at α=0.01, p=n=191 ⇒ q̂ = the dust > 0 ⇒ NON-degenerate.
  const d = runGate(BYO_INTERVAL_PRED, {
    ...GOOD_PARAMS,
    intent: 0,
    nMin: 5,
    alpha: 0.1,
    calibration: { scores: MSUSD_LIKE_SCORES, mode: "interval" },
  });
  // Verdict-level (kills M1: with the region.ts guard removed the verdict is `covered`, q̂ 0):
  assert.equal(d.verdict.reason, "under_calib", "degenerate calibration ⇒ verdict under_calib (NDG-1)");
  assert.equal(d.verdict.qhat, null, "q̂ null on the honest abstention (never a width-0 covered)");
  assert.equal(d.verdict.abstain, true);
  // Gate-level (D3(b) + D6(b)):
  assert.equal(d.action, "abstain");
  assert.equal(d.allow, false);
  assert.equal(d.reason, "under_calib", "gate reason under_calib (D6(b) — kills M4 ⇒ intent_not_in_region)");
});

// Test — §3.3 D1 discriminator (structural lo===hi, NOT `q̂>0`): float absorption at q̂>0. The ONLY path
// where q̂>0 AND lo===hi coexist is BYO fed scores (in the conformer, residuals absorb to 0 BEFORE
// splitQuantile ⇒ q̂=0, indiscernable). scores=[1e-12 × n], ŷ=1e6 ⇒ q̂=1e-12>0 but 1e6 ± 1e-12 === 1e6.
// Mutant M3 (replace lo===hi by q̂>0 in the producer) ⇒ verdict `covered` here ⇒ red.
test("gate_byo_interval_float_absorption_is_under_calib_M011", () => {
  const scores: number[] = Array.from({ length: 10 }, () => 1e-12); // n=10 >= nMin 5
  // In-code absorption proof + L1 gives q̂ = 1e-12 > 0 (NOT under_calib, NOT q̂=0): a naive `q̂>0` guard
  // would MISS this — only the STRUCTURAL lo===hi catches it (D1).
  assert.deepEqual(splitQuantile(scores, 0.1, 5), { qhat: 1e-12 }, "L1 q̂ = 1e-12 > 0");
  assert.equal(1e6 + 1e-12, 1e6, "float absorption: 1e6 + 1e-12 === 1e6");
  assert.equal(1e6 - 1e-12, 1e6, "float absorption: 1e6 - 1e-12 === 1e6");
  const d = runGate(
    { ...BYO_INTERVAL_PRED, yhat: 1e6 },
    { ...GOOD_PARAMS, intent: 1e6, nMin: 5, alpha: 0.1, calibration: { scores, mode: "interval" } },
  );
  assert.equal(d.verdict.reason, "under_calib", "lo===hi at q̂>0 ⇒ under_calib (structural NDG-1, not q̂>0)");
  assert.equal(d.verdict.qhat, null);
  assert.equal(d.verdict.abstain, true);
  assert.equal(d.action, "abstain");
  assert.equal(d.reason, "under_calib");
});

// ---------------------------------------------------------------------------- ADR-M017 (attested in the gate)

/** A minimal, schema-valid AttestedPrice carrying a chosen `subject` (only `subject` is read by the guard). */
function attestedWith(subject: string): AttestedPrice {
  return {
    schema_version: "1.0.0",
    subject,
    attestor: [{ identity: "shogen:test-attestor", key: "6b6579" }],
    residual: ["A(notary-neutrality)"],
    transport: "https-demo",
    utterance: { hash: "0".repeat(64) },
    observed_at: { clock: "test-clock", instant: 0 },
    octets_recalcules: true,
    verifier_revision: "test-rev",
  };
}

// Test (ADR-M017 D4(2)) — a caller-carried `attested` whose subject is NOT declared-consistent with the
// served task_class is a fail-closed TOOL ERROR (HarnessToolError => 400, http.ts TOOL_ERROR_NAMES), never a
// silent verdict. THREE cases; the MESSAGE TEXT is asserted (not the mere throw), so the mutant
// "attestation-binding table returns [] by default" (which would answer 'not consistent' for a BYO class
// instead of 'not accepted') reddens on case (1)'s text. The verifier is NOT run here (K-8): a declared
// consistency check, never a verification.
test("gate_attested_discordant_is_tool_error", () => {
  // (1) a free / BYO class carrying `attested` (here also with a BYO calibration) => not accepted in P1.
  const freePred: Prediction = { ...BTC_PRED, task_class: "caller-free-class-42", yhat: 0.5 };
  assert.throws(
    () =>
      runGate(
        freePred,
        { ...GOOD_PARAMS, intent: 0, nMin: 5, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], mode: "interval" } },
        attestedWith("https://example.test/whatever"),
      ),
    (e: unknown) =>
      e instanceof HarnessToolError &&
      e.message.includes("not accepted for BYO classes") &&
      e.message.includes("caller-free-class-42"),
    "a free/BYO class with attested is a 400 naming 'not accepted for BYO classes' + the class",
  );

  // (2) btc-dir-15m with a DISCORDANT subject (a URL not in the committed list) => not consistent.
  const discordant = "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT";
  assert.throws(
    () => runGate(BTC_PRED, GOOD_PARAMS, attestedWith(discordant)),
    (e: unknown) =>
      e instanceof HarnessToolError &&
      e.message.includes("not consistent") &&
      e.message.includes(discordant) &&
      e.message.includes("btc-dir-15m"),
    "btc-dir-15m with a discordant subject is a 400 naming 'not consistent' + the subject + the class",
  );

  // (3) stable-run-velocity-24h binds to `[]` (Narabi attests flows, not prices) => ANY attested is 400 —
  // even the exact Binance URL that is valid for btc-dir-15m is 'not consistent' for this class.
  assert.throws(
    () =>
      runGate(
        STABLE_RUN_PRED,
        { ...GOOD_PARAMS, intent: 0 },
        attestedWith("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"),
      ),
    (e: unknown) =>
      e instanceof HarnessToolError &&
      e.message.includes("not consistent") &&
      e.message.includes("stable-run-velocity-24h"),
    "stable-run-velocity-24h with any attested is a 400 naming 'not consistent' + the class",
  );
});

// Test (ADR-M017 D4(4)) — the description carries the non-re-verification sentence VERBATIM (phrase (iv),
// C-8) plus the "no temporal binding in P1" clause. Mutant: remove/blank the sentence in the description =>
// red (motif gate.test.ts:112). Non-vacuous (motif gate.test.ts:113-117): the constant's OWN load-bearing
// substrings are asserted too, so blanking the constant (not just the interpolation) also reddens.
test("gate_description_declares_non_reverification", () => {
  assert.ok(GATE_TOOL_DESCRIPTION.includes(GATE_NON_REVERIFICATION_SENTENCE), "the description carries phrase (iv) verbatim");
  assert.ok(GATE_TOOL_DESCRIPTION.includes("no temporal binding in P1"), "the description declares 'no temporal binding in P1'");
  assert.ok(GATE_NON_REVERIFICATION_SENTENCE.includes("not re-verified at call time"), "the sentence states it is not re-verified at call time");
  assert.ok(GATE_NON_REVERIFICATION_SENTENCE.includes("the verifier is not executed here"), "the sentence states the verifier is not executed here");
});

// ─────────────────────────────────────────────────────── ADR-M017 P1-b2 (residual seam + guard order + K2-1)

// Test (ADR-M017 D2(iii) / D4(3)) — the SERVED attest -> gate tuyau (ADR-M018 D1(b)). A caller-carried
// `attested` whose subject IS the committed btc-dir-15m URL is DECLARED-consistent, so the gate does NOT
// error and FILES `attested.residual` into `verdict.residual` (the traceability field the contract inherits
// from AttestedPrice.residual). Driven THROUGH THE REGISTRY `run()` (not runGate directly) so a mutant
// "registry calls runGate WITHOUT env.attested" reds (that would leave the tuyau unwired). The producer is
// the REAL `runAttest()` witness — the SAME AttestedPrice the h5 trace's attest step carries (the probe
// `probe_harness_records_real_decision` proves live == committed byte-for-byte).
test("gate_attested_concordant_files_residual", () => {
  const gateTool = HARNESS_TOOLS.find((t) => t.name === "gate");
  assert.ok(gateTool, "the gate tool is registered");

  const price = runAttest().price; // the committed Binance BTCUSDT witness (the real attest output)
  assert.equal(price.subject, BINANCE_BTCUSDT_TICKER_URL, "the committed witness subject IS the Binance BTCUSDT URL (concordant with btc-dir-15m)");
  // Pinned to the fixture's attest step (fixtures/h5-e2e-trace.json) — non-empty ⇒ the seam is non-vacuous.
  assert.deepEqual(
    price.residual,
    ["A(notary-neutrality)", "A(self-attestation)", "A(transport-check-delegated)"],
    "the committed witness residual == the fixture's attest step (non-empty ⇒ non-vacuous seam)",
  );

  const withAttested = gateTool.run({ prediction: BTC_PRED, params: GOOD_PARAMS, attested: price }).structured as unknown as GateDecision;
  const without = gateTool.run({ prediction: BTC_PRED, params: GOOD_PARAMS }).structured as unknown as GateDecision;

  // (a) D2(iii)/D4(3): attested.residual is FILED into verdict.residual (kills "residual:[] reintroduced"
  //     and "attestation-binding table emptied", and "registry drops env.attested").
  assert.deepEqual(withAttested.verdict.residual, price.residual, "attested.residual is filed into verdict.residual");
  // (b) absent attested ⇒ verdict.residual stays [] (byte-identical at the function level, D4(5)).
  assert.deepEqual(without.verdict.residual, [], "absent attested ⇒ verdict.residual stays []");
  // (c) the seam is SURGICAL (residual is NOT an honesty carrier, M-2): masking residual, the two decisions
  //     are byte-identical — action/reason/allow/region/qhat/... unchanged by the seam.
  assert.deepEqual(
    { ...withAttested, verdict: { ...withAttested.verdict, residual: [] } },
    without,
    "the seam touches ONLY verdict.residual — the decision is otherwise identical",
  );
});

// Test — G2 F1: the GUARD ORDER (ADR-M017 D2(ii)): validateHarnessParams -> anti-override BYO -> attested
// consistency -> dispatch. A prediction on a COMMITTED class (btc-dir-15m) carrying BOTH a BYO `calibration`
// AND a DISCORDANT `attested` trips BOTH guards; the EARLIER one (anti-override BYO) must win. Asserted on
// the message TEXT (a bare 400 would not discriminate the order): it names the committed-override and NOT the
// attested "not consistent" text. Mutant m5 (swap the two guard blocks): the attested-consistency guard fires
// first ⇒ the message becomes "not consistent" ⇒ this reds.
test("gate_guard_order_byo_override_before_attested_F1", () => {
  assert.throws(
    () =>
      runGate(
        BTC_PRED,
        { ...GOOD_PARAMS, calibration: { scores: [0.1, 0.2, 0.3], mode: "interval" } },
        attestedWith("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"),
      ),
    (e: unknown) =>
      e instanceof HarnessToolError &&
      e.message.includes("must not override the committed") &&
      !e.message.includes("not consistent"),
    "anti-override BYO fires BEFORE attested-consistency (order D2(ii)); m5 (swap) reds on the message text",
  );
});

// Test — K2-1 (checkpoint-2 b1): `gate:vocab` (scripts/grep-forbidden.mjs / vocab-banned.json) polices the
// overclaim VERBS negation-aware (ADR-M007 B-3); it does NOT ban live/verified/probative. So, like attest's
// N-4 guard, the gate description is policed HERE at the test level with the SAME PROBATIVE regex as
// attest.test.ts:109 (byte-for-byte), AFTER masking the two LICIT negated phrases the mission names. NOTE
// (auditable): the verb "verify" and the noun "verifier" do NOT match `\bverified\b` — the offline Shogen
// verifier is NAMED, never claimed at call time — so they are NOT masked; the "does not ... verify" mask is
// defensive (it removes no PROBATIVE hit today). Mutant: add a bare "verified"/"live" claim to the description
// ⇒ it survives the scope-locked mask ⇒ red.
test("gate_description_makes_no_probative_claim", () => {
  const PROBATIVE = /\blive\b|\bverified\b|\bprobative\b|\bp_correct\b|\bconfidence\b/i; // attest.test.ts:109, byte-for-byte
  const NOT_REVERIFIED = /not re-verified at call time/gi; // the gate DECLARES it does not re-verify ("re-verified" ⊃ "verified")
  const DOES_NOT_VERIFY = /does not see, store, or verify/gi; // CALIBRATE_LABEL: "does not ... verify" (negated, defensive)
  const scrub = (s: string): string =>
    s.replace(NOT_REVERIFIED, (m) => " ".repeat(m.length)).replace(DOES_NOT_VERIFY, (m) => " ".repeat(m.length));

  // non-vacuous: the two masked phrases are actually present in the description (the masks are not vacuous).
  assert.match(GATE_TOOL_DESCRIPTION, /not re-verified at call time/, "mask 1 (not re-verified) is non-vacuous");
  assert.match(GATE_TOOL_DESCRIPTION, /does not see, store, or verify/, "mask 2 (does not verify) is non-vacuous");
  // after masking exactly those licit negations, NO probative token survives in the gate description: the SERVED
  // text AND the U-4b-2b text describeGate(true) (HARNESS-DESC-1: no longer served before -2b, still policed; D-4).
  for (const d of [GATE_TOOL_DESCRIPTION, describeGate(true)]) {
    assert.ok(!PROBATIVE.test(scrub(d)), `the gate description makes no bare probative claim (scrubbed: "${scrub(d)}")`);
  }
  // scope-lock (non-vacuous): a bare probative token injected OUTSIDE the licit phrases IS caught.
  assert.ok(
    PROBATIVE.test(scrub("the price is verified and live now, confidence high " + GATE_TOOL_DESCRIPTION)),
    "a bare probative claim outside the licit phrases must be caught",
  );
});
