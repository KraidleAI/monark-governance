/**
 * Harness - the texts the harness serves or raises say what the code does, and name no archived decision. Each text that no
 * other test pinned is pinned here byte for byte: the schema and OpenAPI descriptions, the refusals of the BYO calibration,
 * of produced_at, of attested on a BYO class, of a kata request, of the calibrate cap, the provenance of the retired
 * btc-dir calibration, the exchangeability sentence of the liq class, and the error classes the HTTP mirror answers 400.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { AttestedPrice, Prediction } from "@monark/contracts";
import { HARNESS_VERSION } from "@monark/hikae";
import { runGate, toolErrorCode, SCHEMA_VERSION, LIQ_H3_SENTENCE, type HarnessParams } from "../src/tools/gate.ts";
import { runCalibrate } from "../src/tools/calibrate.ts";
import { BTC_DIR_CALIB_PROVENANCE, CALIB_DIGEST_PINNED } from "../src/calibration.ts";
import { PARAMS_SCHEMA, CALIBRATE_OUTPUT_SCHEMA, type Json } from "../src/schema-projection.ts";
import { buildOpenApi } from "../src/openapi.ts";
import { TOOL_ERROR_NAMES } from "../src/http.ts";

const P: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 5, intent: 0, tool: "perps_order_preview", clockOpen: true };
const pr = (taskClass: string, yhat: string | number, over: Partial<Prediction> = {}): Prediction => ({ schema_version: SCHEMA_VERSION, task_class: taskClass, yhat, predictor_id: "caller:model", produced_at: "2026-09-04T00:00:00Z", ...over });
const SC = [0.5, 0.1, 0.9, 0.3, 1.0, 0.7, 0.2, 0.8, 0.4, 0.6];

/** The code and the whole message of a refusal (a decision fails the assertion). */
function refusal(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    return `${String(toolErrorCode(e))} :: ${e instanceof Error ? e.message : String(e)}`;
  }
  return assert.fail("expected a refusal, the call decided");
}

/** The `description` at a path of objects. */
function description(node: Json, path: readonly string[]): unknown {
  let at: Json = node;
  for (const k of path) at = at !== null && typeof at === "object" && !Array.isArray(at) ? (at[k] ?? null) : null;
  return at !== null && typeof at === "object" && !Array.isArray(at) ? at["description"] : undefined;
}

test("the_schema_and_openapi_descriptions_are_the_committed_texts", () => {
  assert.equal(description(PARAMS_SCHEMA, ["properties", "remainingBudget"]), "B_t — remaining authorization capacity (caller-owned: the server keeps no state).");
  assert.equal(description(PARAMS_SCHEMA, ["properties", "tool"]), "The NAMED gated tool (echoed, never invoked).");
  assert.equal(
    description(PARAMS_SCHEMA, ["properties", "calibration"]),
    "OPTIONAL BYO calibration: caller-supplied nonconformity scores + region mode. Present ⇒ the gate conformalizes on the caller's model, not a committed class.",
  );
  assert.equal(description(CALIBRATE_OUTPUT_SCHEMA, ["properties", "scores_sha256"]), "scoresSha256(scores) in the caller's order: the audit tie to verdict.scores_sha256.");
  assert.equal(description(CALIBRATE_OUTPUT_SCHEMA, ["properties", "label"]), "Honesty label: the marginal coverage holds only under exchangeability with the supplied scores.");
  const spec = buildOpenApi();
  for (const op of ["gate", "calibrate"]) {
    assert.equal(description(spec, ["paths", `/${op}`, "post", "responses", "200"]), "The frozen structuredContent plus the honesty content text.", `${op} 200`);
    assert.equal(description(spec, ["paths", `/${op}`, "post", "responses", "403"]), "Origin present and not a monarkgate.tech origin.", `${op} 403`);
  }
});

test("the_refusals_of_the_gate_are_the_committed_texts", () => {
  const sites: [string, () => unknown, string][] = [
    ["negative interval score", () => runGate(pr("byo-x", 1), { ...P, calibration: { scores: [0.1, -0.2, 0.3, 0.4, 0.5], mode: "interval" } }),
      "byo_calibration_invalid :: invalid calibration.scores[1]: interval mode requires non-negative nonconformity scores"],
    ["label pipe", () => runGate(pr("byo-x", "A"), { ...P, intent: "A", calibration: { scores: SC, mode: "set", candidates: [{ label: "A|B", score: 0.5 }] } }),
      "byo_calibration_invalid :: invalid calibration.candidates[0].label: must not contain '|' (label_schema separator)"],
    ["produced_at invalid", () => runGate(pr("cascade-liquidable-24h", 1, { produced_at: "2026-09-04 00:00:00Z" }), P),
      "produced_at_invalid :: invalid prediction.produced_at \"2026-09-04 00:00:00Z\": expected an RFC 3339 date-time"],
    ["edge blank", () => runGate(pr(" byo-x", 1), { ...P, calibration: { scores: SC, mode: "interval" } }),
      "byo_edge_blank :: byo task_class and predictor_id must not start or end with a blank: \" byo-x\" / \"caller:model\""],
    ["kata yhat domain", () => runGate(pr("btc-dir-1h", 1.5, { predictor_id: "kata:vote4@venue/BTCUSDT/1h", produced_at: "2026-10-04T04:00:00Z", features_digest: "ab".repeat(32) }), { ...P, alpha: 0.45, nMin: 6 }),
      "kata_yhat_domain :: yhat 1.5 is outside the domain of 'btc-dir-1h' (a lean in [-1, 1]) (contract 1.1.0 kata request rules)"],
  ];
  for (const [site, fn, want] of sites) assert.equal(refusal(fn), want, site);
  const attested: AttestedPrice = {
    schema_version: "1.0.0", subject: "https://example.test/x", attestor: [{ identity: "shogen:test-attestor", key: "6b6579" }], residual: ["A(notary-neutrality)"],
    transport: "https-demo", utterance: { hash: "0".repeat(64) }, observed_at: { clock: "test-clock", instant: 0 },
  } as unknown as AttestedPrice;
  assert.equal(
    refusal(() => runGate(pr("byo-x", 1), { ...P, calibration: { scores: SC, mode: "interval" } }, attested)),
    "attested_inconsistent :: attested is not accepted for BYO classes: task_class 'byo-x' has no committed attestation subject (subject 'https://example.test/x')",
  );
});

test("the_calibrate_cap_and_the_retired_provenance_are_the_committed_texts", () => {
  assert.throws(() => runCalibrate({ scores: new Array<number>(10001).fill(0.5), alpha: 0.1, nMin: 3 }), {
    name: "CalibrateToolError",
    message: "invalid 'scores': 10001 scores exceeds the cap of 10000 (resource guard)",
  });
  assert.equal(
    BTC_DIR_CALIB_PROVENANCE,
    `synthetic — HIKAE S2a instrument draw (harness_version=${HARNESS_VERSION}, seed=101, n=300, nCalib=150); 0/1 indicator scores; scores_sha256=${CALIB_DIGEST_PINNED}; declared synthetic, a plumbing fixture, not a measured predictor.`,
  );
  assert.equal(LIQ_H3_SENTENCE, "calibrated on one recorded episode; no coverage is claimed on any other event; the exchangeability check is a report, a YES licenses nothing more");
});

test("the_mirror_answers_400_for_the_error_classes_of_the_served_tools_only", () => {
  assert.deepEqual([...TOOL_ERROR_NAMES].sort(), ["CalibrateToolError", "HarnessToolError"]);
});
