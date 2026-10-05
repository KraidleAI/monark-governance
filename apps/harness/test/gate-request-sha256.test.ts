/**
 * Harness: the served /gate body in contract 1.1.0 (block C, lot CM-3c-3b1). Every decision served over the HTTP mirror
 * and over MCP tools/call validates the frozen gate-decision schema (ajv, with the coverage-verdict schema it references),
 * and its request_sha256 is the digest of the envelope AS RECEIVED: sha256 of canonicalJson(JSON.parse(body)), whatever
 * the key order and the blanks of the body (GateInput.requestSha256, gap 1 of lot 3c-3a; Q-C2 condition 3). The closed
 * check of the contracts package checks unknown keys only, so a decision that dropped request_sha256 would pass it: the
 * schema is the net here (minor m-5 of the G2 of lot 3c-3a). Paths: BYO set, BYO interval, USDe, liq, cascade.
 * No network: the HTTP mirror is called in process, MCP on a loopback server.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { canonicalJson, requestSha256, type CanonicalValue } from "@monark/contracts";
import type { Ajv2020 as Ajv2020Instance, Options, ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";
import { handleJsonMirror } from "../src/http.ts";
import { startServer } from "../src/server.ts";
import { SCHEMA_VERSION } from "../src/tools/gate.ts";
import { startLoopback } from "./helpers/loopback.ts";

type Ajv2020Ctor = new (opts?: Options) => Ajv2020Instance;
const require = createRequire(import.meta.url);
const ajvExport = require("ajv/dist/2020") as { default?: Ajv2020Ctor };
const Ajv2020: Ajv2020Ctor = ajvExport.default ?? (ajvExport as unknown as Ajv2020Ctor);
const addFormatsExport = require("ajv-formats") as { default?: FormatsPlugin };
const addFormats: FormatsPlugin = addFormatsExport.default ?? (addFormatsExport as unknown as FormatsPlugin);

const schema = (name: string): Record<string, unknown> => JSON.parse(readFileSync(new URL(`../../../schemas/${name}`, import.meta.url), "utf8")) as Record<string, unknown>;
function decisionValidator(): ValidateFunction {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  ajv.addSchema(schema("coverage-verdict.schema.json"), "coverage-verdict.schema.json");
  return ajv.compile(schema("gate-decision.schema.json"));
}

const AT = "2026-09-04T00:00:00Z";
const PARAMS = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0, tool: "perps_order_preview", clockOpen: true };
const SCORES = [0.3, 0.05, 0.2, 0.1, 0.25, 0.15, 0.08, 0.12, 0.18, 0.22];
/** One envelope per served path of /gate. */
const ENVELOPES: Readonly<Record<string, { prediction: Record<string, unknown>; params: Record<string, unknown> }>> = {
  "byo-set": {
    prediction: { schema_version: SCHEMA_VERSION, task_class: "byo-demo", yhat: "A", predictor_id: "caller:model", produced_at: AT },
    params: { ...PARAMS, nMin: 5, intent: "A", calibration: { scores: SCORES, mode: "set", candidates: [{ label: "A", score: 0.2 }, { label: "B", score: 0.9 }] } },
  },
  "byo-interval": {
    prediction: { schema_version: SCHEMA_VERSION, task_class: "byo-demo", yhat: 0, predictor_id: "caller:model", produced_at: AT },
    params: { ...PARAMS, nMin: 5, tauInterval: 2, calibration: { scores: SCORES, mode: "interval" } },
  },
  usde: {
    prediction: { schema_version: SCHEMA_VERSION, task_class: "stable-run-velocity-24h", yhat: 0.0001, predictor_id: "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3", produced_at: AT },
    params: PARAMS,
  },
  liq: {
    prediction: { schema_version: SCHEMA_VERSION, task_class: "liquidation-eligible-coverage", yhat: 1, predictor_id: "ukemi:client-supplied-key/whatever", produced_at: AT },
    params: { ...PARAMS, alpha: 0.01, nMin: 100, intent: 1 },
  },
  cascade: {
    prediction: { schema_version: SCHEMA_VERSION, task_class: "cascade-liquidable-24h", yhat: 12345, predictor_id: "internal:ukemi", produced_at: AT },
    params: PARAMS,
  },
};

/** The same object written with every key order reversed and blanks: a body that is not the canonical writing. */
function reversed(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(reversed);
  if (v !== null && typeof v === "object") return Object.fromEntries(Object.entries(v).reverse().map(([k, x]) => [k, reversed(x)]));
  return v;
}
const bodyOf = (envelope: unknown): string => JSON.stringify(reversed(envelope), null, 2);
const digestOf = (body: string): string => createHash("sha256").update(canonicalJson(JSON.parse(body) as CanonicalValue), "utf8").digest("hex");

function wiredPost(port: number, body: string): Promise<{ status: number; raw: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      { hostname: "127.0.0.1", port, path: "/", method: "POST", headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body), accept: "application/json, text/event-stream", host: "mcp.monarkgate.tech" } },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (c: string) => { raw += c; });
        res.on("end", () => { resolve({ status: res.statusCode ?? 0, raw }); });
      },
    );
    req.on("error", reject);
    req.end(body);
  });
}

/** The structuredContent of the JSON-RPC result carried by an SSE (or plain JSON) MCP answer. */
function mcpStructured(raw: string): Record<string, unknown> {
  const line = raw.split(/\r?\n/).find((l) => l.startsWith("data: ")) ?? raw;
  const msg = JSON.parse(line.replace(/^data: /, "")) as { result?: { structuredContent?: Record<string, unknown>; isError?: boolean } };
  assert.notEqual(msg.result?.isError, true, `the MCP call is not a tool error: ${raw.slice(0, 300)}`);
  const sc = msg.result?.structuredContent;
  assert.ok(sc !== undefined, "the MCP result carries structuredContent");
  return sc;
}

// killer: apps/harness/src/tools/gate.ts:979 SDL "    requestSha256: envelopeSha256(prediction, params, attested), // contract 1.1.0: the envelope as received" -> ""
test("served_gate_body_validates_the_frozen_decision_schema", async () => {
  const validate = decisionValidator();
  const check = (where: string, sc: Record<string, unknown>, body: string): void => {
    assert.ok(validate(sc), `${where}: the served decision validates gate-decision.schema.json: ${JSON.stringify(validate.errors)}`);
    assert.equal(sc["request_sha256"], digestOf(body), `${where}: request_sha256 = sha256(canonicalJson(JSON.parse(body)))`);
  };
  for (const [name, envelope] of Object.entries(ENVELOPES)) {
    const body = bodyOf(envelope);
    const res = await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", { method: "POST", body }));
    assert.equal(res.status, 200, `HTTP ${name}: served (200)`);
    check(`HTTP ${name}`, ((await res.json()) as { structuredContent: Record<string, unknown> }).structuredContent, body);
  }
  const server = await startLoopback((port) => startServer(port));
  try {
    const a = server.address(), port = typeof a === "object" && a !== null ? a.port : 0;
    for (const [name, envelope] of Object.entries(ENVELOPES)) {
      const args = bodyOf(envelope);
      const rpc = `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"gate","arguments":${args}}}`;
      const res = await wiredPost(port, rpc);
      assert.equal(res.status, 200, `MCP ${name}: served (200)`);
      check(`MCP ${name}`, mcpStructured(res.raw), args);
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
});

// The digest is over the received envelope, not over a fixed part of it: two bodies equal up to key order and blanks
// give one digest; a body that differs in one params field (intent) or in one prediction field (yhat) gives another.
// killer: apps/harness/src/tools/gate.ts:1012 CONST "requestSha256({ prediction, params, " -> "requestSha256({ prediction, params: {}, "
test("request_sha256_is_the_digest_of_the_received_envelope", async () => {
  const post = async (envelope: unknown, pretty: boolean): Promise<string> => {
    const body = pretty ? bodyOf(envelope) : JSON.stringify(envelope);
    const res = await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", { method: "POST", body }));
    assert.equal(res.status, 200, "served (200)");
    const d = ((await res.json()) as { structuredContent: { request_sha256: string } }).structuredContent.request_sha256;
    assert.equal(d, requestSha256(JSON.parse(body) as { prediction: object; params: object }), "the digest is requestSha256 of the parsed body");
    return d;
  };
  const usde = ENVELOPES["usde"];
  assert.ok(usde !== undefined);
  const same = await post(usde, false);
  assert.equal(await post(usde, true), same, "key order and blanks do not move the digest");
  assert.notEqual(await post({ ...usde, params: { ...usde.params, intent: 1 } }, false), same, "another intent, another digest");
  assert.notEqual(await post({ ...usde, prediction: { ...usde.prediction, yhat: 0.0002 } }, false), same, "another yhat, another digest");
});
