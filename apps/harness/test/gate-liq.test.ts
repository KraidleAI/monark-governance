/**
 * Harness -- liquidation-eligible-coverage served class (U-4b-2a code, ADR-U4b D1/D3; decisions 108/126; checkpoint-1
 * C-1/C-5/C-7/C-8/C-10 + delta D-1..D-4), on the COMMITTED registry of U-4b-2b (ADR-U4b-2b D1/D2: stratum s0 of the
 * fresh episode committed, s1..s3 not). Literal-only (no committed fixture): q-hat and the committed scores are READ
 * from the registry (apps/harness/src/calibration.ts, exported), never typed, so this file survives the public export.
 * The real-artifact branchement proof (u4b_gate_serves_region_from_real_artifact) lives in gate-liq-artifact.test.ts
 * (export-excluded, it reads the fresh sentinel series). Each test is killed by >= 1 named mutant, replayed with a
 * transient mutation restored byte-exact by sha256 (see the lot's G1 journal).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertClosedGateDecision } from "@monark/contracts";
import type { Prediction, AttestedPrice } from "@monark/contracts";
import { splitQuantile } from "@monark/hikae";
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
  LIQ_REQUIREMENTS_SENTENCE,
  LIQ_H3_SENTENCE,
  LIQ_CONDITIONAL_SENTENCE,
  describeGate,
  type HarnessParams,
  SCHEMA_VERSION,
} from "../src/tools/gate.ts";
import { hasCommittedCalibrationForClass, lookupCommittedCalibration, UKEMI_LIQ_PREDICTOR_BASE, UKEMI_LIQ_SCORES_SHA256_PINNED } from "../src/calibration.ts";
import { strateOf, STRATA_CUTS_SERVED } from "../src/ukemi-strata.ts";
import { HARNESS_TOOLS, type GateEnvelope } from "../src/tools/registry.ts";
import { handleJsonMirror } from "../src/http.ts";
import { createHarnessHandler } from "../src/server.ts";
import { compilePatterns, scanText } from "../../../scripts/grep-forbidden.mjs";

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
    schema_version: SCHEMA_VERSION,
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

// 2b-4 (in process, literal-only; re-scoped from u4b_gate_liq_class_abstains_on_empty_registry, which reddened by
// construction at the registry commit) -- on the COMMITTED registry a yhat of the committed stratum s0 gets the conformal
// UPPER BOUND [0, yhat + qhat_0] (qhat_0 read from the registry by the served quantile, never typed), with the committed
// n_calib and digest; a yhat of an uncommitted stratum (s1..s3) abstains under_calib with n_calib 0. Under this file's
// L3 params (tauInterval 1, clock open) the covered bound is wider than tau, so the top-level decision is defer /
// interval_too_wide: verdict.reason, not the top-level reason, carries the coverage. Mutants: symmetric region (n'),
// empty registry, a stratum served that is not committed => red.
test("u4b_gate_liq_serves_committed_stratum_and_abstains_elsewhere", () => {
  const s0 = lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, `${UKEMI_LIQ_PREDICTOR_BASE}/s0`);
  assert.ok(s0 !== undefined, "stratum s0 of the fresh episode is committed");
  const q = splitQuantile(s0.scores, LIQ_ALPHA, LIQ_NMIN);
  assert.ok("qhat" in q && q.qhat > 0, "the committed s0 has a positive conformal q-hat (read, not typed)");
  for (const yhat of [0, 5000]) {
    assert.equal(strateOf(yhat), 0, `yhat=${String(yhat)} lies in the committed stratum s0`);
    const d = runGate(liqPred(yhat), LIQ_PARAMS);
    assertClosedGateDecision(d);
    assert.equal(d.verdict.reason, "covered", `yhat=${String(yhat)}: the committed stratum is covered`);
    assert.equal(d.verdict.region?.kind, "interval", "the wire kind stays interval (frozen contract, delta D-1)");
    if (d.verdict.region?.kind !== "interval") continue;
    assert.equal(d.verdict.region.lo, 0, "the lower edge is 0 by construction (upper bound, never symmetric)");
    assert.equal(d.verdict.region.hi, yhat + q.qhat, "the upper edge is yhat + q-hat of the committed stratum");
    assert.equal(d.verdict.qhat, q.qhat, "the verdict carries the committed q-hat");
    assert.equal(d.verdict.n_calib, s0.scores.length, "n_calib is the committed stratum size");
    assert.equal(d.verdict.scores_sha256, UKEMI_LIQ_SCORES_SHA256_PINNED[`${UKEMI_LIQ_PREDICTOR_BASE}/s0`], "the verdict carries the pinned stratum digest");
    assert.equal(d.action, "defer", "L3: a covered bound wider than tauInterval defers (clock open)");
    assert.equal(d.reason, "interval_too_wide", "L3 top-level reason (not the coverage reason)");
  }
  for (const yhat of [STRATA_CUTS_SERVED[0] ?? 0, 500000000000, 50000000000000, 500000000000000]) {
    assert.ok(strateOf(yhat) > 0, `yhat=${String(yhat)} lies in an uncommitted stratum`);
    const d = runGate(liqPred(yhat), LIQ_PARAMS);
    assertClosedGateDecision(d);
    assert.equal(d.action, "abstain", `yhat=${String(yhat)} abstains on an uncommitted stratum`);
    assert.equal(d.reason, "under_calib", `yhat=${String(yhat)} reason under_calib`);
    assert.equal(d.verdict.reason, "under_calib", "verdict reason under_calib");
    assert.equal(d.verdict.n_calib, 0, "n_calib 0: no committed scores for this stratum");
    assert.equal(d.verdict.qhat, null, "qhat null on an uncommitted stratum");
    assert.equal(d.verdict.region, null, "under_calib carries no region (never a covered bound)");
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

// S-8 (ADR-CM B-8, lot CM-3c-4b; inverts u4b_liq_committed_text_is_honest of 2a-3): the honesty text follows the RESOLVED
// cell, the stratum key the server derives from yhat (the client key stays ignored): the calibrated sentence on s0 only;
// s1 to s3 (under_calib) and a key that names no stratum read the class text of the served table.
// killer: apps/harness/src/tools/gate.ts:745 CONST "r.current && r.cell_key === cellKey" -> "r.current && hasCommittedCalibrationForClass(taskClass)"
test("liq_honesty_text_follows_the_resolved_cell", () => {
  assert.equal(hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE), true, "the registry holds the liq class (s0)");
  const keys = ["ukemi:client-supplied-key/whatever", ...[0, 1, 2, 3].map((k) => `${UKEMI_LIQ_PREDICTOR_BASE}/s${String(k)}`)];
  for (const key of keys) {
    const want = key.endsWith("/s0") ? LIQ_COMMITTED_SENTENCE : LIQ_EMPTY_REGISTRY_SENTENCE;
    assert.equal(honestyText(TASK_LIQ_ELIGIBLE, key, false), `${want}; B_t is caller-carried.`, key);
  }
  for (const [yhat, want] of [[5000, LIQ_COMMITTED_SENTENCE], [5e14, LIQ_EMPTY_REGISTRY_SENTENCE]] as const) {
    const run = GATE_TOOL.run({ prediction: { schema_version: SCHEMA_VERSION, task_class: TASK_LIQ_ELIGIBLE, yhat, predictor_id: `${UKEMI_LIQ_PREDICTOR_BASE}/s0`, produced_at: "2026-09-04T00:00:00Z" }, params: LIQ_PARAMS });
    assert.ok(run.text.startsWith(`${want}; B_t is caller-carried. verdict `), `served content at yhat ${String(yhat)}`);
  }
  // The committed text carries its conditions (upper bound, one episode, no other event, H-3 a report, conditional rule).
  for (const s of [LIQ_UPPER_BOUND_SENTENCE, LIQ_H3_SENTENCE, LIQ_CONDITIONAL_SENTENCE]) assert.ok(LIQ_COMMITTED_SENTENCE.includes(s), `committed text carries: "${s}"`);
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
  // HARNESS-DESC-1 (checkpoint-1 C-3, D-4 re-scoped, not weakened): this line pinned the upper-bound clause in the SERVED
  // description while the registry was empty (the CARTO-T1C-2 over-claim). The clause belongs to the COMMITTED state
  // only: asserted on describeGate(true) here; since U-4b-2b the served text IS that state, asserted exactly by
  // hdesc_served_gate_description_is_the_committed_clause below.
  assert.ok(describeGate(true).includes(LIQ_UPPER_BOUND_SENTENCE), "the committed-state (U-4b-2b) description carries the upper-bound class clause");
});

// 2a-2 (delta D-4) -- an unknown class (the class-B name, decision 108) ⇒ a HarnessToolError (⇒ 400 via the
// HTTP mirror), NEVER under_calib; the `known:` list carries no class-B name but DOES carry the liq class.
// Mutant (g): map the unknown branch to under_calib ⇒ the throw stops ⇒ red.
test("u4b_class_b_is_unknown_task_class_400", async () => {
  const bPred: Prediction = { schema_version: SCHEMA_VERSION, task_class: CLASS_B, yhat: 12345, predictor_id: "x", produced_at: "2026-09-04T00:00:00Z" };
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

// ---------------------------------------------------------------------------- HARNESS-DESC-1 (CARTO-T1C-2)
// The SERVED gate description is a PURE function of the liq REGISTRY state (describeGate, gate.ts). EMPTY registry
// => the empty-registry sentence + the server-imposed params + the conditional rule, NEVER the upper-bound nor the
// H-3 sentence (checkpoint-1 U-4b-2 C-1/C-7; checkpoint-1 HARNESS-DESC-1 C-1/C-2 + the orchestrator ruling on the
// conditional rule). Negations are asserted on the liq SLICE (the whole description legitimately carries
// "coverage"/"interval" in the USDe and BYO clauses), plus exact-sentence absences on the whole served text.

const LIQ_LEAD = `For '${TASK_LIQ_ELIGIBLE}' (Ukemi: a per-account liquidable-amount class, class A only) `;
/** Built HERE from the named constants (independent of describeGate): the two admissible liq clauses. */
const EXPECTED_EMPTY_CLAUSE = `${LIQ_LEAD}${LIQ_EMPTY_REGISTRY_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}. `;
const EXPECTED_COMMITTED_CLAUSE =
  `${LIQ_LEAD}the served region is ${LIQ_UPPER_BOUND_SENTENCE}; ${LIQ_REQUIREMENTS_SENTENCE}; ${LIQ_H3_SENTENCE}; ${LIQ_CONDITIONAL_SENTENCE}. `;
/** Closed list: committed-only words, none of which may appear in the liq clause of an EMPTY-registry description. */
const COMMITTED_ONLY_WORDS = ["upper bound", "calibrated", "H-3", "no coverage is claimed", "the served region", "lower edge"];

/** The liq clause of a gate description: from the class lead to the BYO clause (both anchors asserted, in order). */
function liqSlice(description: string): string {
  const i = description.indexOf(LIQ_LEAD);
  // Block D (lot D-2): the kata clause follows the liq clause, before the BYO sentence.
  const j = description.indexOf("The 32 kata classes");
  assert.ok(i > -1 && j > i, "the liq clause is delimited in the description (non-vacuous slice)");
  return description.slice(i, j);
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
/** Every string leaf of a served JSON value (descriptions of tools AND of their schemas). */
function stringLeaves(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return (v as unknown[]).flatMap((x) => stringLeaves(x));
  if (isObj(v)) return Object.values(v).flatMap((x) => stringLeaves(x));
  return [];
}

/** The REAL tools/list result, IN-PROCESS through the stateless MCP handler (server.ts): no socket, no network. */
async function servedToolsList(): Promise<Obj> {
  const res = await createHarnessHandler().fetch(
    new Request("http://mcp.monarkgate.tech/", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    }),
  );
  assert.equal(res.status, 200, "tools/list answers 200");
  const raw = await res.text();
  const data = raw.split(/\r?\n/).find((l) => l.startsWith("data:")); // SSE frame, or plain JSON
  const reply = JSON.parse(data === undefined ? raw : data.slice("data:".length).trim()) as { result?: unknown };
  assert.ok(isObj(reply.result), "tools/list returns a result object");
  return reply.result;
}

// (i) REAL served path (checkpoint-1 HARNESS-DESC-1 C-2 (i); A-10 liage; re-scoped at the U-4b-2b registry commit from
// hdesc_served_gate_description_is_the_empty_registry_clause, ADR-U4b-2b D2): the HARNESS_TOOLS descriptor, the REAL
// tools/list and the served GET /openapi.json carry ONE and the same text, bound to its registry source, and on the
// COMMITTED registry that text is describeGate(true) BYTE FOR BYTE (the pre-HARNESS-DESC-1 text, sha256 pinned below):
// its liq clause is EXACTLY the committed clause (UPPER + REQ + H-3 + COND) and the empty-registry sentence rides on NO
// served string leaf (tool AND schema descriptions, checkpoint-1 C-9). Mutants: describeGate(false) hard-coded at the
// served call site (R-HD-1, a whole class now killable); the committed branch dropping a sentence; the served descriptor
// altered in registry.ts; the openapi description altered => red.
// CM-2b (ADR-CM B-5, B-2, B-7): the served description moves (btc-dir retired, USDe alpha/nMin declared, the USDe band
// edge stated); the sha256 pin moves 55744504... -> cb4029d2... (recorded in docs/G0-lot-cm-2b.md). The liq clause is unchanged.
// CM-2a-suite (C-2 of MONARK's diff check of CM-2b): the sentence that no served class takes `attested`; cb4029d2... -> 4279a54d...
// Block D, lot D-2 (Z-3 line of block D): the kata clause after the liq clause; bfb474f3... -> dd728779... (3 971 bytes).
// killer: apps/harness/src/tools/gate.ts:249 CONST "refusal. For" -> "refusal; for"
test("hdesc_served_gate_description_is_the_committed_clause", async () => {
  assert.equal(hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE), true, "the delivered registry holds the liq class");
  const list = await servedToolsList();
  const tools = Array.isArray(list["tools"]) ? (list["tools"] as unknown[]).filter(isObj) : [];
  const listed = tools.find((t) => t["name"] === "gate")?.["description"];
  assert.ok(typeof listed === "string", "tools/list serves a gate description");
  const oaRes = await handleJsonMirror(new Request("http://api.monarkgate.tech/openapi.json"));
  assert.equal(oaRes.status, 200, "GET /openapi.json answers 200");
  const spec: unknown = await oaRes.json();
  const paths = isObj(spec) && isObj(spec["paths"]) ? spec["paths"] : {};
  const gatePath = isObj(paths["/gate"]) && isObj(paths["/gate"]["post"]) ? paths["/gate"]["post"] : {};
  // liage (A-10): descriptor === tools/list === openapi === the text of the registry source.
  assert.equal(GATE_TOOL.description, GATE_TOOL_DESCRIPTION, "the gate descriptor carries GATE_TOOL_DESCRIPTION");
  assert.equal(listed, GATE_TOOL.description, "tools/list serves the descriptor's description");
  assert.equal(gatePath["description"], listed, "/openapi.json serves the same gate description as tools/list");
  assert.equal(listed, describeGate(hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE)), "the served text is bound to the registry state");
  assert.equal(listed, describeGate(true), "the served text is the committed-state description (describeGate(false) hard-coded reds here)");
  assert.equal(
    createHash("sha256").update(listed, "utf8").digest("hex"),
    "dd7287793b229a3e083286ac1a7333f646d3cc3a323071d129bff702c4551ef3",
    "the served description is byte for byte the committed text (ADR-CM B-5, B-2, C-2 of CM-2b, B-7 withdrawn by B-13, the kata clause of block D; was bfb474f3..., 4279a54d..., cb4029d2...)",
  );
  const slice = liqSlice(listed);
  assert.equal(slice, EXPECTED_COMMITTED_CLAUSE, "the served liq clause is EXACTLY the committed clause");
  for (const s of [LIQ_UPPER_BOUND_SENTENCE, LIQ_REQUIREMENTS_SENTENCE, LIQ_H3_SENTENCE, LIQ_CONDITIONAL_SENTENCE]) {
    assert.ok(slice.includes(s), `the served liq clause carries: "${s}"`);
  }
  for (const w of COMMITTED_ONLY_WORDS) assert.ok(slice.includes(w), `the served committed clause says "${w}" (non-vacuous closed list)`);
  const leaves = [...stringLeaves(list), ...stringLeaves(spec)];
  assert.ok(leaves.length >= 50, `the served leaves are scanned (non-vacuous), saw ${String(leaves.length)}`);
  assert.deepEqual(leaves.filter((l) => l.includes(LIQ_EMPTY_REGISTRY_SENTENCE)), [], "no served tools/list or openapi leaf says the registry is empty");
});

// (ii) the PURE function in BOTH states (checkpoint-1 HARNESS-DESC-1 C-2 (ii)). NOT the CA-11 proof of U-4b-2b: one
// registry state is observable per process (COMMITTED_CALIBRATIONS is a module constant); the -2b proof on the served
// path is the item on G0 2b-7 (C-4). describeGate(true) is the pre-HARNESS-DESC-1 served text, byte-identical
// (measured in the G1 report). Mutants: 'false' hard-coded in describeGate; H-3 or REQ dropped from a branch; the
// branches inverted => red.
test("hdesc_describe_gate_two_states", () => {
  const full = describeGate(true);
  const empty = describeGate(false);
  assert.equal(liqSlice(full), EXPECTED_COMMITTED_CLAUSE, "registry non-empty: the committed clause (UPPER; REQ; H-3; COND)");
  assert.equal(liqSlice(empty), EXPECTED_EMPTY_CLAUSE, "registry empty: the empty clause (EMPTY; REQ; COND)");
  for (const s of [LIQ_UPPER_BOUND_SENTENCE, LIQ_REQUIREMENTS_SENTENCE, LIQ_H3_SENTENCE, LIQ_CONDITIONAL_SENTENCE]) {
    assert.ok(full.includes(s), `describeGate(true) carries: "${s}"`);
  }
  assert.ok(!full.includes(LIQ_EMPTY_REGISTRY_SENTENCE), "describeGate(true) does not say the registry is empty");
  for (const s of [LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_REQUIREMENTS_SENTENCE, LIQ_CONDITIONAL_SENTENCE]) {
    assert.ok(empty.includes(s), `describeGate(false) carries: "${s}"`);
  }
  for (const s of [LIQ_UPPER_BOUND_SENTENCE, LIQ_H3_SENTENCE]) assert.ok(!empty.includes(s), `describeGate(false) never carries: "${s}"`);
  // Only the liq clause depends on the registry: every other served clause is identical in both states.
  assert.equal(full.split(EXPECTED_COMMITTED_CLAUSE).join(EXPECTED_EMPTY_CLAUSE), empty, "the two states differ ONLY by the liq clause");
});

// (iii) "interval" is absent from the liq clause in BOTH states (checkpoint-2 U-4b-2a C-2 lesson: an "interval" in the
// description clause survived every semantic test and died only on the h5 byte pin). Mutant: "interval" injected into
// the empty branch => red.
test("hdesc_liq_clause_never_says_interval_in_both_states", () => {
  for (const state of [false, true]) {
    assert.ok(!/interval/i.test(liqSlice(describeGate(state))), `the liq clause never says "interval" (registryHasLiq=${String(state)})`);
  }
  // non-vacuous: the WHOLE description does carry "interval" (BYO clause), so it is the liq slice that is policed.
  assert.ok(describeGate(false).includes("interval"), "the BYO clause keeps its wire word (the slice scope is load-bearing)");
});

// Both description states pass the repo vocabulary (GLOBAL + harness scope of vocab-banned.json): the served state AND
// the U-4b-2b state, which is no longer served before -2b and would otherwise be policed by nothing (D-4: no check
// dropped when the committed clause left the served text). Mutant: a banned word in the committed branch => red.
test("hdesc_both_description_states_pass_vocab", () => {
  const vocab = JSON.parse(readFileSync(fileURLToPath(new URL("../../../vocab-banned.json", import.meta.url)), "utf8")) as {
    banned: { re: string; why: string }[];
    scan: { harness: { banned: { re: string; why: string }[] } };
  };
  const patterns = [...compilePatterns(vocab.banned), ...compilePatterns(vocab.scan.harness.banned)];
  assert.ok(scanText("confidence", patterns).length >= 1, "the harness scope bans 'confidence' (non-vacuous)");
  for (const state of [false, true]) {
    assert.deepEqual(scanText(describeGate(state), patterns), [], `describeGate(${String(state)}) is vocab-clean`);
  }
});
