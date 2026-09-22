/**
 * Harness -- liquidation-eligible-coverage served class, EMPTY-registry behaviour (U-4b-2a; ADR-U4b D1/D3;
 * decisions 108/126; checkpoint-1 C-1/C-5/C-7/C-8/C-10 + delta D-1..D-4). Literal-only (no committed fixture):
 * this file survives the public export. The real-artifact branchement proof (u4b_gate_serves_region_from_real_artifact)
 * lives in gate-liq-artifact.test.ts (export-excluded, it reads the upcoming sentinel fixture). Each test is
 * killed by >= 1 named mutant, run by the -2a mutant harness (transient mutation, restore byte-exact by
 * sha256; see the passe report).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertClosedGateDecision } from "@monark/contracts";
import type { Prediction, AttestedPrice } from "@monark/contracts";
import {
  runGate,
  honestyText,
  HarnessToolError,
  GATE_TOOL_DESCRIPTION,
  TASK_LIQ_ELIGIBLE,
  LIQ_ALPHA,
  LIQ_NMIN,
  LIQ_UPPER_BOUND_SENTENCE,
  LIQ_COMMITTED_SENTENCE,
  LIQ_EMPTY_REGISTRY_SENTENCE,
  type HarnessParams,
} from "../src/tools/gate.ts";
import { hasCommittedCalibrationForClass } from "../src/calibration.ts";
import { HARNESS_TOOLS, type GateEnvelope } from "../src/tools/registry.ts";
import { handleJsonMirror } from "../src/http.ts";

/** The class-B name (decision 108: NEVER served). Assembled from parts so THIS test file naming it does not
 *  itself trip the src-scan below if the scan root ever widened; the scan is scoped to apps/harness/src only. */
const CLASS_B = ["liquidation", "realized", "given", "liquidated"].join("-");

const LIQ_PARAMS: HarnessParams = {
  remainingBudget: 0.1,
  bFloor: 0,
  tau: 1,
  tauInterval: 1,
  alpha: LIQ_ALPHA, // 0.01, server-imposed
  nMin: LIQ_NMIN, // 100, server-imposed
  intent: 1,
  tool: "perps_order_preview",
  clockOpen: true,
};

function liqPred(yhat: number, predictorId = "ukemi:client-supplied-key/whatever"): Prediction {
  return {
    schema_version: "1.0.0",
    task_class: TASK_LIQ_ELIGIBLE,
    yhat,
    predictor_id: predictorId,
    produced_at: "2026-09-04T00:00:00Z",
  };
}

/** A minimal, structurally-valid AttestedPrice with a caller-chosen subject (motif gate.test.ts:675). */
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

const GATE_TOOL = HARNESS_TOOLS.find((t) => t.name === "gate");
if (GATE_TOOL === undefined) throw new Error("gate tool missing from HARNESS_TOOLS");

interface MirrorBody {
  structuredContent?: Record<string, unknown>;
  error?: string;
  message?: string;
}
async function postGate(env: GateEnvelope): Promise<{ status: number; body: MirrorBody }> {
  const res = await handleJsonMirror(
    new Request("http://api.monarkgate.tech/gate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(env),
    }),
  );
  return { status: res.status, body: (await res.json()) as MirrorBody };
}

// 2a-2 -- on the EMPTY -2a registry EVERY yhat (across all four strata) abstains under_calib: no served
// coverage is claimed. Mutant: return a covered region on the empty registry ⇒ these redden.
test("u4b_gate_liq_class_abstains_on_empty_registry", () => {
  for (const yhat of [0, 5000, 500000000000, 50000000000000, 500000000000000]) {
    const d = runGate(liqPred(yhat), LIQ_PARAMS);
    assertClosedGateDecision(d);
    assert.equal(d.action, "abstain", `yhat=${String(yhat)} abstains on the empty registry`);
    assert.equal(d.reason, "under_calib", `yhat=${String(yhat)} reason under_calib`);
    assert.equal(d.verdict.reason, "under_calib", "verdict reason under_calib");
    assert.equal(d.verdict.n_calib, 0, "n_calib 0 on the empty registry");
    assert.equal(d.verdict.qhat, null, "qhat null on the empty registry");
    assert.equal(d.verdict.region.kind, "set", "under_calib carries the empty SET region (never a covered interval)");
  }
});

// 2a-2 (Q-4 / C-10 / delta D-6) -- alpha/nMin are SERVER-imposed; a divergent value is a NAMED 400.
// Mutant (a): drop the alpha/nMin checks ⇒ these stop throwing ⇒ red.
test("u4b_committed_class_alpha_nmin_server_400", () => {
  assert.throws(
    () => runGate(liqPred(5000), { ...LIQ_PARAMS, alpha: 0.05 }),
    (e: unknown) => e instanceof HarnessToolError && e.message.includes("requires params.alpha = 0.01"),
    "alpha != 0.01 ⇒ named 400",
  );
  assert.throws(
    () => runGate(liqPred(5000), { ...LIQ_PARAMS, nMin: 50 }),
    (e: unknown) => e instanceof HarnessToolError && e.message.includes("requires params.nMin = 100"),
    "nMin != 100 ⇒ named 400",
  );
  // The correct server params do NOT throw (positive control: the abstention is a decision, not an error).
  assert.doesNotThrow(() => runGate(liqPred(5000), LIQ_PARAMS), "alpha=0.01/nMin=100 ⇒ a decision, not a 400");
});

// 2a-2 (class-lock) -- a BYO `calibration` may NEVER override the committed liq class, even on the empty -2a
// registry where lookupCommittedCalibration returns undefined. Mutant (c): drop TASK_LIQ_ELIGIBLE from the
// class-lock disjunction ⇒ the BYO path is taken instead of a 400 ⇒ red.
test("u4b_byo_cannot_override_committed_liq_class", () => {
  assert.throws(
    () => runGate(liqPred(5000), { ...LIQ_PARAMS, calibration: { scores: [1, 2, 3], mode: "interval" } }),
    (e: unknown) => e instanceof HarnessToolError && e.message.includes("must not override the committed"),
    "BYO on the liq class ⇒ 400 (class-lock), never a caller-owned override",
  );
});

// 2a-2 (C-7) -- yhat must be a NON-NEGATIVE SAFE INTEGER; otherwise a NAMED 400 (never strateOf over a lossy
// float, never a silent gate). Mutant (i): drop the isSafeInteger/`yhat<0` check ⇒ these stop throwing ⇒ red.
test("u4b_liq_yhat_negative_or_unsafe_400", () => {
  for (const bad of [-1, -1000000, 1.5, Number.MAX_SAFE_INTEGER + 1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => runGate(liqPred(bad), LIQ_PARAMS),
      (e: unknown) => e instanceof HarnessToolError && e.message.includes("non-negative safe integer"),
      `yhat=${String(bad)} ⇒ named 400`,
    );
  }
  // 0 and 2^53 (the safe-integer ceiling) are ACCEPTED (a decision, not a 400).
  assert.doesNotThrow(() => runGate(liqPred(0), LIQ_PARAMS), "yhat=0 is accepted");
  assert.doesNotThrow(() => runGate(liqPred(Number.MAX_SAFE_INTEGER), LIQ_PARAMS), "yhat=2^53-1 is accepted");
});

// 2a-3 -- the served liq text makes NO probability/score claim (honesty rides in the description + content
// text, never in the frozen decision). Mutant (h) variant: add a probability word to the liq text ⇒ red.
test("u4b_liq_description_makes_no_probability_claim", () => {
  const banned = /probability|probable|likelihood|confidence|p_correct|accuracy/i;
  for (const s of [LIQ_UPPER_BOUND_SENTENCE, LIQ_COMMITTED_SENTENCE, LIQ_EMPTY_REGISTRY_SENTENCE]) {
    assert.ok(!banned.test(s), `no probability/score claim in the served liq text: "${s}"`);
  }
  // Non-vacuous positive anchors (the assertion cannot pass on empty strings).
  assert.ok(LIQ_COMMITTED_SENTENCE.includes("liquidable amount"), "the served text names the liquidable amount");
  assert.ok(LIQ_COMMITTED_SENTENCE.includes("no coverage is claimed on any other event"), "carries the no-other-event clause (mutant (h))");
  assert.ok(LIQ_COMMITTED_SENTENCE.includes("close-factor rule"), "carries the conditional-coverage clause (mutant (h))");
});

// 2a-3 (delta D-3) -- the honesty text is keyed on REGISTRY presence; on the empty -2a registry it is the
// honest empty-registry sentence, NEVER the committed upper-bound sentence. Mutant (h)/(m): return the
// committed sentence (or a probability) for the empty registry ⇒ red.
test("u4b_liq_empty_registry_text_is_honest", () => {
  assert.equal(hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE), false, "the -2a registry is empty of the liq class");
  const text = honestyText(TASK_LIQ_ELIGIBLE, "ukemi:client-supplied-key/s0", false);
  assert.equal(text, `${LIQ_EMPTY_REGISTRY_SENTENCE}; B_t is caller-carried.`, "empty-registry text is exact + registry-keyed (not client-key)");
  assert.ok(!text.includes("upper bound"), "the empty-registry text does NOT surclaim the committed upper bound");
  assert.ok(text.includes("under_calib"), "the empty-registry text declares the abstention");
});

// 2a-3 (delta D-1, mutant (o) SCOPED) -- the liq CLASS text says "upper bound" and NEVER "interval" (the wire
// kind stays "interval", but the served text of THIS class must not). Asserted on the named constant, not the
// whole description (which carries "interval" in the BYO clause). Mutant (o): "upper bound" -> "interval" ⇒ red.
test("u4b_liq_class_text_says_upper_bound_never_interval", () => {
  assert.ok(LIQ_UPPER_BOUND_SENTENCE.includes("upper bound"), "the class text says 'upper bound'");
  assert.ok(!LIQ_COMMITTED_SENTENCE.includes("interval"), "the class text never says 'interval' (delta D-1, mutant (o))");
  // checkpoint-2 C-2: the ONLY liq sentence actually served in -2a (empty registry) and the honesty text must not say
  // 'interval' either -- an injection there survived the full suite before this assertion.
  assert.ok(!LIQ_EMPTY_REGISTRY_SENTENCE.includes("interval"), "the empty-registry sentence never says 'interval' (C-2)");
  assert.ok(!honestyText(TASK_LIQ_ELIGIBLE, "x", false).includes("interval"), "the served honesty text never says 'interval' (C-2)");
  assert.ok(GATE_TOOL_DESCRIPTION.includes(LIQ_UPPER_BOUND_SENTENCE), "the served tools/list description carries the class clause");
});

// 2a-2 (delta D-4) -- an unknown class (the class-B name, decision 108) ⇒ a HarnessToolError (⇒ 400 via the
// HTTP mirror), NEVER under_calib; the `known:` list carries no class-B name but DOES carry the liq class.
// Mutant (g): map the unknown branch to under_calib ⇒ the throw stops ⇒ red.
test("u4b_class_b_is_unknown_task_class_400", async () => {
  const bPred: Prediction = { schema_version: "1.0.0", task_class: CLASS_B, yhat: 12345, predictor_id: "x", produced_at: "2026-09-04T00:00:00Z" };
  let known = "";
  assert.throws(
    () => runGate(bPred, LIQ_PARAMS),
    (e: unknown) => {
      if (!(e instanceof HarnessToolError)) return false;
      const parts = e.message.split("known:");
      known = parts[1] ?? "";
      return e.message.includes(`unknown task_class '${CLASS_B}'`);
    },
    "class B ⇒ HarnessToolError (never under_calib)",
  );
  assert.ok(!known.includes(CLASS_B), "the class-B name is NOT in the known: list (delta D-2(a) grep=0)");
  assert.ok(known.includes(TASK_LIQ_ELIGIBLE), "the liq class IS in the known: list (added in -2a)");
  // The HTTP mirror surfaces it as a 400, never a 500 nor under_calib.
  const { status, body } = await postGate({ prediction: bPred, params: LIQ_PARAMS });
  assert.equal(status, 400, "class B ⇒ 400 via POST /gate");
  assert.equal(body.error, "tool_error", "a tool-level refusal, not a 500");
});

// 2a-2 (delta D-2(a)) -- the class-B name appears NOWHERE in apps/harness/src (grep=0). Mutant: reintroduce a
// class-B branch/literal in src ⇒ red.
test("u4b_no_class_b_symbol_in_harness_src", () => {
  const SRC = fileURLToPath(new URL("../src", import.meta.url));
  const walk = (dir: string): string[] => {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
      const abs = join(dir, name);
      if (statSync(abs).isDirectory()) out.push(...walk(abs));
      else if (name.endsWith(".ts")) out.push(abs);
    }
    return out;
  };
  const files = walk(SRC);
  assert.ok(files.length >= 5, "the src scan is non-vacuous (found the harness sources)");
  const hits = files.filter((f) => readFileSync(f, "utf8").includes(CLASS_B));
  assert.deepEqual(hits, [], `the class-B name must not appear in apps/harness/src (decision 108); hits: ${JSON.stringify(hits)}`);
});

// 2a-4 (D-5) -- `attested` is not accepted for the liq class: it is PRESENT in the binding table with [], so
// any subject fails closed with the "not consistent" text (NOT the "not accepted for BYO" text). Mutant (j):
// drop the binding line ⇒ the class becomes absent ⇒ "not accepted for BYO" text ⇒ this reds on the text.
test("u4b_attested_not_accepted_for_liq_class", () => {
  const subject = "https://example.test/book-not-a-price-feed";
  assert.throws(
    () => runGate(liqPred(5000), LIQ_PARAMS, attestedWith(subject)),
    (e: unknown) =>
      e instanceof HarnessToolError &&
      e.message.includes("not consistent") &&
      e.message.includes(subject) &&
      e.message.includes(TASK_LIQ_ELIGIBLE),
    "attested on the liq class ⇒ 'not consistent' (the class is present with [], mutant (j))",
  );
});
