/**
 * Harness - the calm support of the committed USDe stable-run calibration. The recorder kept only the calm 24h windows
 * whose burns stay under 1% of the opening stock (scripts/record-usde-calib.mjs, THETA_STRESS and its stress rule), so
 * the calibration holds no point for a velocity forecast at or beyond 0.01/24 per hour, nor below 0. On the committed key
 * the gate abstains under_calib there (empty scores, n_calib 0, no region), after its existing abstentions, and says so
 * in its description. Literal-only (no export-excluded fixture): every expected value is written by hand or by a closed
 * formula (the edge is the expression 0.01 / 24), never by the function under test. The new exports are read through
 * the module namespaces as records, so the base loads this file and every test reddens by an assertion.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { AttestedFlow, Prediction } from "@monark/contracts";
import { fromAttestedFlow, isNarabiError } from "@monark/monark";
import * as calibration from "../src/calibration.ts";
import { assertCommittedScores, lookupCommittedCalibration, USDE_STABLE_RUN_PREDICTOR_ID, USDE_STABLE_RUN_CALIB_PROVENANCE, type CommittedCalibration } from "../src/calibration.ts";
import * as gateModule from "../src/tools/gate.ts";
import { describeGate, runGate, toolErrorCode, STABLE_RUN_REQUIREMENTS_SENTENCE, SCHEMA_VERSION, type HarnessParams } from "../src/tools/gate.ts";
import { handleJsonMirror } from "../src/http.ts";
import { createHarnessHandler } from "../src/server.ts";

type Obj = Record<string, unknown>;
const CAL = calibration as unknown as Obj;
const GATE = gateModule as unknown as Obj;
const TASK = "stable-run-velocity-24h";
/** The upper edge of the calm support, per hour: the recorder's stress ratio over its 24h window (a closed formula). */
const EDGE = 0.01 / 24;
/** The new description clause, written by hand. */
const CALM_SENTENCE = "on that key a velocity forecast outside [0, 0.01/24) per hour, the calm support of its calibration, abstains under_calib";
/** The server-imposed params of the committed USDe key (alpha 0.1, nMin 50), written by hand. */
const P: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0, tool: "perps_order_preview", clockOpen: true };
const PRODUCED_AT = "2026-09-04T00:00:00Z";
const NOW = Date.parse("2026-09-04T00:01:00Z");
const sha = (s: string): string => createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");
/** scores_sha256 of the empty score list (contract 1.1.0: sha256 of the canonical JSON "[]"). */
const EMPTY_SCORES_SHA256 = sha("[]");

/** A prediction on the committed USDe key. */
function usde(yhat: number): Prediction {
  return { schema_version: SCHEMA_VERSION, task_class: TASK, yhat, predictor_id: USDE_STABLE_RUN_PREDICTOR_ID, produced_at: PRODUCED_AT };
}

/** A 24h attested flow of the committed population (chain and token of scripts/record-usde-calib.mjs), mints 0. */
function usdeFlow(burns: bigint, supplyClose: bigint): AttestedFlow {
  return {
    schema_version: "1.0.0",
    subject: "erc20:0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
    attestor: [{ identity: "ethena-por", key: "deadbeef" }],
    source: { chain: "eip155:1", issuer: "0xe3490297a08d6fc8da46edb7b6142e4f461b62d3" },
    window: "24h",
    flow: { burns: String(burns), mints: "0", supply: String(supplyClose), from_block: 20_000_000, to_block: 20_007_200 },
    residual: ["ap_capacity_unknown"],
    transport: "rpc+eth_getLogs",
    utterance: { hash: "b".repeat(64) },
    observed_at: { clock: "utc-midnight", instant: 1_756_000_000 },
    octets_recalcules: true,
    verifier_revision: "narabi-adapter@test",
  };
}

/** The abstention outside the calm support: under_calib on the committed cell, no region, no q-hat, empty scores. */
function assertOutOfSupport(yhat: number, d: ReturnType<typeof runGate>, where: string): void {
  assert.equal(d.verdict.reason, "under_calib", `${where} yhat=${String(yhat)}: verdict reason under_calib`);
  assert.equal(d.reason, "under_calib", `${where} yhat=${String(yhat)}: decision reason under_calib`);
  assert.equal(d.action, "abstain", `${where} yhat=${String(yhat)}: action abstain`);
  assert.equal(d.verdict.region, null, `${where} yhat=${String(yhat)}: no region`);
  assert.equal(d.verdict.qhat, null, `${where} yhat=${String(yhat)}: no q-hat`);
  assert.equal(d.verdict.n_calib, 0, `${where} yhat=${String(yhat)}: n_calib 0 (empty scores, not the 613 committed)`);
  assert.equal(d.verdict.scores_sha256, EMPTY_SCORES_SHA256, `${where} yhat=${String(yhat)}: the digest of the empty scores`);
  assert.equal(d.verdict.cell_key, USDE_STABLE_RUN_PREDICTOR_ID, `${where} yhat=${String(yhat)}: on the cell of the committed key`);
}

/** POST /gate through the JSON mirror, in process, with a fixed clock. */
async function http(prediction: Prediction): Promise<{ status: number; body: Obj }> {
  const res = await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prediction, params: P }) }), () => NOW);
  return { status: res.status, body: JSON.parse(await res.text()) as Obj };
}

/** tools/call gate through the stateless MCP handler, in process, with a fixed clock. */
async function mcp(prediction: Prediction): Promise<Obj> {
  const res = await createHarnessHandler(() => NOW).fetch(new Request("http://mcp.monarkgate.tech/", {
    method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "gate", arguments: { prediction, params: P } } }),
  }));
  const raw = await res.text();
  const data = raw.split(/\r?\n/).find((l) => l.startsWith("data:"));
  return (JSON.parse(data === undefined ? raw : data.slice("data:".length).trim()) as { result?: Obj }).result ?? {};
}

/** The first content text of a served answer. */
function textOf(result: Obj): string {
  const content = result["content"];
  const first = Array.isArray(content) ? (content as unknown[])[0] : undefined;
  const text = typeof first === "object" && first !== null ? (first as Obj)["text"] : undefined;
  assert.ok(typeof text === "string", "the served answer carries a content text");
  return text;
}

/** Split a served gate text into the row text and the verdict summary (the summary opens with "verdict action="). */
function splitText(text: string): { row: string; summary: string } {
  const at = text.indexOf(" verdict action=");
  assert.ok(at > 0, `the served text carries a verdict summary: ${text}`);
  return { row: text.slice(0, at), summary: text.slice(at + 1) };
}

// killer: apps/harness/src/tools/gate.ts:652 COR "0 <= yhat && " -> ""
test("gate_usde_support_guard_edges", () => {
  assert.equal(EDGE.toExponential(4), "4.1667e-4", "rounding control: 0.01 / 24 is 4.1667e-4 per hour");
  assert.doesNotThrow(() => runGate(usde(EDGE), P), "the gate answers at the edge: its abstention passes the closed check of the verdict");
  const v = runGate(usde(EDGE), P).verdict;
  assert.deepEqual([v.task_class, v.method, v.alpha, v.residual, v.produced_at, v.schema_version], [TASK, "split", 0.1, [], PRODUCED_AT, "1.1.0"], "the abstention's task class, method, alpha, residual, time and schema version");
  for (const yhat of [EDGE, 0.0004167, -1e-9]) assertOutOfSupport(yhat, runGate(usde(yhat), P), "runGate");
  for (const yhat of [0, 0.0004166]) {
    const d = runGate(usde(yhat), P);
    assert.equal(d.verdict.reason, "covered", `yhat=${String(yhat)}: inside the calm support, covered`);
    assert.equal(d.verdict.n_calib, 613, `yhat=${String(yhat)}: the 613 committed scores`);
  }
  // Precedence: the guard comes after the existing abstentions. 1e300 stays region_degenerate on the committed scores,
  // and a non-finite yhat stays the param_invalid refusal of the request writer.
  const huge = runGate(usde(1e300), P);
  assert.deepEqual([huge.verdict.reason, huge.verdict.n_calib, huge.verdict.region], ["region_degenerate", 613, null], "1e300 keeps region_degenerate");
  for (const yhat of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.throws(() => runGate(usde(yhat), P), (e: unknown) => toolErrorCode(e) === "param_invalid", `yhat=${String(yhat)}: param_invalid`);
  }
});

// killer: apps/harness/src/tools/gate.ts:652 ROR "yhat < calmSupport" -> "yhat <= calmSupport"
test("gate_usde_support_matches_adapter_stress_edge", () => {
  const E24 = 10n ** 24n;
  const E26 = 10n ** 26n;
  // Opening stock in the adapter's sense: S_open = supply + burns - mints = 1e26 in both flows.
  const atEdge = fromAttestedFlow(usdeFlow(E24, E26 - E24));
  assert.ok(!isNarabiError(atEdge), "the adapter maps the stress-edge flow");
  assert.equal(atEdge.prediction.predictor_id, USDE_STABLE_RUN_PREDICTOR_ID, "the flow of the committed population yields the committed key");
  assert.equal(atEdge.provenance.velocity_per_hour, 0.01 / 24, "burns/S_open = 0.01 over 24h: the velocity is exactly 0.01 / 24");
  assert.equal(atEdge.prediction.yhat, 0.01 / 24, "the forecast is the velocity (persistence)");
  assertOutOfSupport(0.01 / 24, runGate(atEdge.prediction, P), "adapter edge");
  const below = fromAttestedFlow(usdeFlow(E24 - 1n, E26 - E24 + 1n));
  assert.ok(!isNarabiError(below), "the adapter maps the flow one wei under the edge");
  assert.equal(below.prediction.predictor_id, USDE_STABLE_RUN_PREDICTOR_ID, "same committed key one wei under the edge");
  assert.ok(below.provenance.velocity_per_hour < 0.01 / 24, "one wei of burns less: strictly under the edge");
  const d = runGate(below.prediction, P);
  assert.equal(d.verdict.reason, "covered", "one wei of burns less, same opening stock: covered on the committed key");
  assert.equal(d.verdict.cell_key, USDE_STABLE_RUN_PREDICTOR_ID, "on the committed cell");
});

// killer: apps/harness/src/calibration.ts:75 CONST "0.01" -> "0.02"
test("calibration_calm_support_matches_recorder_and_provenance", () => {
  assert.equal(CAL["USDE_STABLE_RUN_THETA_STRESS"], 0.01, "the stress ratio constant is 0.01");
  assert.equal(CAL["USDE_STABLE_RUN_WINDOW_HOURS"], 24, "the window constant is 24 hours");
  const entry = lookupCommittedCalibration(TASK, USDE_STABLE_RUN_PREDICTOR_ID);
  assert.ok(entry !== undefined, "the USDe key is committed");
  assert.deepEqual((entry as unknown as Obj)["calmSupport"], { thetaStress: 0.01, windowHours: 24 }, "the USDe entry carries its calm support");
  const recorder = readFileSync(fileURLToPath(new URL("../../../scripts/record-usde-calib.mjs", import.meta.url)), "utf8");
  assert.ok(recorder.includes("THETA_STRESS = 0.01"), "the recorder excludes the stress windows at 0.01");
  assert.ok(recorder.includes('window: "24h"'), "the recorder builds 24h windows");
  assert.ok(USDE_STABLE_RUN_CALIB_PROVENANCE.includes("Calm 24h UTC windows"), "the provenance names the calm 24h windows");
  assert.ok(USDE_STABLE_RUN_CALIB_PROVENANCE.includes("stress rule burns/S_open >= 0.01 excludes 28"), "the provenance names the stress rule");
  assert.equal(sha(USDE_STABLE_RUN_CALIB_PROVENANCE), "071a3710d11c4f7f20c4b955729495c13897c1422bbc847277c7fff468440b1a", "the provenance bytes are unchanged (sha256 measured at the base)");
});

// killer: apps/harness/src/calibration.ts:273 SDL "if (c.taskClass === USDE_STABLE_RUN_TASK_CLASS && c.calmSupport === undefined) throw new Error(`calibration: the stable-run entry ${c.predictorId} declares no calm support (thetaStress, windowHours); a key without one fails closed.`);" -> ""
test("committed_stable_run_entry_declares_calm_support", () => {
  const entry = lookupCommittedCalibration(TASK, USDE_STABLE_RUN_PREDICTOR_ID);
  assert.ok(entry !== undefined, "the USDe key is committed");
  assert.doesNotThrow(() => assertCommittedScores(entry), "the committed entry passes the import assertion");
  const bare = Object.fromEntries(Object.entries(entry).filter(([k]) => k !== "calmSupport")) as unknown as CommittedCalibration;
  assert.equal(bare.scores, entry.scores, "the stripped entry keeps its committed scores");
  assert.throws(
    () => assertCommittedScores(bare),
    (e: unknown) => e instanceof Error && e.message.includes("calm support") && e.message.includes(USDE_STABLE_RUN_PREDICTOR_ID),
    "a stable-run entry without its calm support fails the import assertion, naming the support and the key",
  );
});

// killer: apps/harness/src/tools/gate.ts:652 CONST "scores: []" -> "scores"
test("gate_usde_out_of_support_served_path", async () => {
  const outHttp = await http(usde(5e-4));
  assert.equal(outHttp.status, 200, "POST /gate answers 200 outside the support");
  const dHttp = outHttp.body["structuredContent"] as Obj;
  assert.deepEqual([dHttp["action"], dHttp["reason"]], ["abstain", "under_calib"], "HTTP: abstain under_calib");
  const vHttp = dHttp["verdict"] as Obj;
  assert.deepEqual([vHttp["reason"], vHttp["n_calib"], vHttp["region"]], ["under_calib", 0, null], "HTTP verdict: under_calib, n_calib 0, no region");
  const inHttp = await http(usde(1e-4));
  assert.equal(((inHttp.body["structuredContent"] as Obj)["verdict"] as Obj)["reason"], "covered", "HTTP: 1e-4 is covered");
  const outH = splitText(textOf(outHttp.body));
  assert.equal(outH.row, splitText(textOf(inHttp.body)).row, "HTTP: the row text of the cell is the one of a covered call");
  assert.ok(outH.summary.includes("reason=under_calib") && outH.summary.includes("n_calib=0"), `HTTP summary: ${outH.summary}`);
  const outMcp = await mcp(usde(5e-4));
  const dMcp = outMcp["structuredContent"] as Obj;
  assert.deepEqual([dMcp["action"], dMcp["reason"]], ["abstain", "under_calib"], "MCP: abstain under_calib");
  const vMcp = dMcp["verdict"] as Obj;
  assert.deepEqual([vMcp["reason"], vMcp["n_calib"], vMcp["region"]], ["under_calib", 0, null], "MCP verdict: under_calib, n_calib 0, no region");
  const inMcp = await mcp(usde(1e-4));
  assert.equal(((inMcp["structuredContent"] as Obj)["verdict"] as Obj)["reason"], "covered", "MCP: 1e-4 is covered");
  const outM = splitText(textOf(outMcp));
  assert.equal(outM.row, splitText(textOf(inMcp)).row, "MCP: the row text of the cell is the one of a covered call");
  assert.ok(outM.summary.includes("reason=under_calib") && outM.summary.includes("n_calib=0"), `MCP summary: ${outM.summary}`);
  assert.equal(outM.row, outH.row, "the same row text over HTTP and MCP");
});

// killer: apps/harness/src/tools/gate.ts:251 CONST "${STABLE_RUN_CALM_SUPPORT_SENTENCE}; " -> ""
test("gate_description_states_calm_support", () => {
  assert.equal(GATE["STABLE_RUN_CALM_SUPPORT_SENTENCE"], CALM_SENTENCE, "the calm support sentence, byte for byte");
  const clause = `${STABLE_RUN_REQUIREMENTS_SENTENCE}; ${CALM_SENTENCE}; for any other population`;
  assert.ok(describeGate(true).includes(clause), "the committed-registry description states the calm support after the requirements");
  assert.ok(describeGate(false).includes(clause), "the empty-registry description states the calm support after the requirements");
});
