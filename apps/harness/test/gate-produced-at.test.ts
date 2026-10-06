/**
 * Harness - `produced_at` of the gate (chantier moteur, lot CM-2a, audit P3 point S-10 and report P5(b)).
 * Oracle: docs/adr/ADR-CM-chantier-moteur-audit-P3.md section 5 B-4 (as specified by the amendment "nuit, 2");
 * plan docs/G0-lot-cm-2a.md. `runGate` refuses a `produced_at` that is not a strict RFC 3339 date-time (code
 * produced_at_invalid), on a direct call too; the HTTP and MCP entry points also refuse an instant more than 300 s
 * after the server clock (code produced_at_future), the clock being injected from src/ (K-8). A direct call without
 * `nowMs` runs the RFC 3339 check only (declared). Each test names its killer on the line above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Prediction } from "@monark/contracts";
import { runGate, HarnessToolError, type HarnessParams } from "../src/tools/gate.ts";
import { SCHEMA_VERSION } from "../src/tools/gate.ts";
import { USDE_STABLE_RUN_PREDICTOR_ID } from "../src/calibration.ts";
import { handleJsonMirror } from "../src/http.ts";
import { createHarnessHandler } from "../src/server.ts";

const PARAMS: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: "up", tool: "perps_order_preview", clockOpen: true };

function btcDir(producedAt: string): Prediction {
  return { schema_version: SCHEMA_VERSION, task_class: "btc-dir-15m", yhat: "up", predictor_id: "internal:momentum-4c", produced_at: producedAt };
}

/** The committed USDe key (PARAMS carries its F-7 alpha 0.1 and nMin 50): the served vehicle since btc-dir is retired. */
function usde(producedAt: string): Prediction {
  return { schema_version: SCHEMA_VERSION, task_class: "stable-run-velocity-24h", yhat: 0.0001, predictor_id: USDE_STABLE_RUN_PREDICTOR_ID, produced_at: producedAt };
}

/** btc-dir-15m (a valid produced_at) is retired: 400 task_class_retired (ADR-CM B-5). */
function assertBtcDirRetired(): void {
  refusedWith(() => runGate(btcDir("2026-09-04T00:00:00Z"), PARAMS), "task_class_retired", "btc-dir-15m");
}

/** One prediction and params per served path other than btc-dir (retired in CM-2b): BYO interval, USDe, liq. */
const OTHER_PATHS: { label: string; prediction: (producedAt: string) => Prediction; params: HarnessParams }[] = [
  {
    label: "byo interval",
    prediction: (at) => ({ schema_version: SCHEMA_VERSION, task_class: "byo-demo", yhat: 0, predictor_id: "caller:model", produced_at: at }),
    params: { ...PARAMS, nMin: 5, intent: 0, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], mode: "interval" } },
  },
  {
    label: "usde",
    prediction: (at) => ({ schema_version: SCHEMA_VERSION, task_class: "stable-run-velocity-24h", yhat: 0.0001, predictor_id: USDE_STABLE_RUN_PREDICTOR_ID, produced_at: at }),
    params: { ...PARAMS, intent: 0 },
  },
  {
    label: "liq",
    prediction: (at) => ({ schema_version: SCHEMA_VERSION, task_class: "liquidation-eligible-coverage", yhat: 5000, predictor_id: "ukemi:any", produced_at: at }),
    params: { ...PARAMS, alpha: 0.01, nMin: 100, intent: 1 },
  },
];

function refusedWith(fn: () => unknown, code: string, at: string): string {
  try {
    fn();
  } catch (e) {
    assert.ok(e instanceof HarnessToolError, `${at}: a HarnessToolError, got ${String(e)}`);
    assert.equal((e as { code?: unknown }).code, code, `${at}: code ${code}`);
    return e.message;
  }
  assert.fail(`${at}: expected a named refusal (${code}), the gate decided`);
}

// Test P-1 (F2P): a direct runGate refuses every non RFC 3339 produced_at (P5(b)), and accepts the RFC 3339 edge
// forms (leap years, leap second, offset 23:59 and -00:00, lower-case t and z, a long fraction).
// killer: apps/harness/src/tools/gate.ts:856 CONST "sec > 60" -> "sec > 61"
test("run_gate_refuses_a_non_rfc3339_produced_at", () => {
  const refused = [
    "yesterday", "", "2026-09-04", "2026-09-04T00:00:00", "2026-09-04T00:00Z", "2026-09-04 00:00:00Z",
    "2026-09-04T00:00:00+0100", "2026-09-04T00:00:00+01", "2026-09-04T00:00:00.Z", "2026-9-4T00:00:00Z",
    "+2026-09-04T00:00:00Z", "2026-09-04T00:00:00Z ", " 2026-09-04T00:00:00Z",
    "2026-02-29T00:00:00Z", "1900-02-29T00:00:00Z", "2026-04-31T00:00:00Z", "2026-13-01T00:00:00Z",
    "2026-00-10T00:00:00Z", "2026-09-00T00:00:00Z", "2026-09-04T24:00:00Z", "2026-09-04T23:60:00Z",
    "2026-09-04T00:00:61Z", "2026-09-04T00:00:00+24:00", "2026-09-04T00:00:00+23:60",
    "2026-09-04T00:00:60Z", "2026-09-04T23:59:60+01:00", "2026-09-04T23:59:60-01:00", "2026-09-04T22:59:60Z",
  ];
  for (const s of refused) {
    const message = refusedWith(() => runGate(usde(s), PARAMS), "produced_at_invalid", JSON.stringify(s));
    assert.ok(message.includes(JSON.stringify(s)), `${JSON.stringify(s)}: the message names the value`);
  }
  const accepted = [
    "2026-09-04T00:00:00Z", "2024-02-29T00:00:00Z", "2000-02-29T12:30:45Z", "2026-09-04t00:00:00z",
    "2026-09-04T23:59:60Z", "2026-09-04T00:00:00.123456789Z", "2026-09-04T00:00:00+23:59", "2026-09-04T00:00:00-00:00",
    "2026-12-31T23:59:59-05:00", "0001-01-01T00:00:00Z", "2026-09-05T01:59:60+02:00", "2026-09-04T18:59:60-05:00",
  ];
  for (const s of accepted) {
    try {
      assert.equal(runGate(usde(s), PARAMS).verdict.produced_at, s, `${s}: decided, produced_at echoed`);
    } catch (e) {
      assert.fail(`${s}: an RFC 3339 date-time must decide, got ${String(e)}`);
    }
  }
  // btc-dir, the former vehicle of this test, is retired (CM-2b); the strict check runs before the dispatch.
  assertBtcDirRetired();
  refusedWith(() => runGate(btcDir("2026-09-04 00:00:00Z"), PARAMS), "produced_at_invalid", "btc-dir with a bad produced_at");
  // The other served paths run the same check (a BYO, USDe or liq path that skipped it would decide here).
  for (const p of OTHER_PATHS) {
    for (const s of ["2026-09-04 00:00:00Z", "2026-02-29T00:00:00Z", "2026-09-04T00:00:60Z"]) {
      refusedWith(() => runGate(p.prediction(s), p.params), "produced_at_invalid", `${p.label} ${s}`);
    }
    assert.equal(runGate(p.prediction("2026-09-04T23:59:60Z"), p.params).verdict.produced_at, "2026-09-04T23:59:60Z", `${p.label}: decides`);
  }
});

type Obj = Record<string, unknown>;
async function mcpGate(producedAt: string, nowMs: number): Promise<Obj> {
  const res = await createHarnessHandler(() => nowMs).fetch(
    new Request("http://mcp.monarkgate.tech/", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "gate", arguments: { prediction: usde(producedAt), params: PARAMS } } }),
    }),
  );
  const raw = await res.text();
  const data = raw.split(/\r?\n/).find((l) => l.startsWith("data:"));
  const reply = JSON.parse(data === undefined ? raw : data.slice("data:".length).trim()) as { result?: Obj };
  assert.ok(reply.result !== undefined, "a tools/call result");
  return reply.result;
}

// Test P-2 (F2P): at the HTTP and MCP entry points a produced_at more than 300 s after the injected clock is a 400
// produced_at_future (offsets honoured); 300 s exactly is accepted; a direct runGate without nowMs only checks RFC 3339.
// killer: apps/harness/src/tools/gate.ts:212 CONST "300_000" -> "301_000"
test("produced_at_in_the_future_is_refused_at_http_and_mcp", async () => {
  const NOW = Date.parse("2026-10-03T12:00:00Z");
  const http = async (producedAt: string): Promise<{ status: number; body: Obj }> => {
    const res = await handleJsonMirror(
      new Request("http://api.monarkgate.tech/gate", { method: "POST", body: JSON.stringify({ prediction: usde(producedAt), params: PARAMS }) }),
      () => NOW,
    );
    return { status: res.status, body: (await res.json()) as Obj };
  };
  for (const s of ["2026-10-03T12:05:00Z", "2026-10-03T14:05:00+02:00", "2026-10-03T07:05:00-05:00", "2026-10-03T11:00:00Z", "2026-10-03T12:05:00.000Z", "2026-10-03T12:05:00.0009Z"]) {
    assert.equal((await http(s)).status, 200, `${s}: at most 300 s ahead, served`);
  }
  for (const s of ["2026-10-03T12:05:01Z", "2026-10-03T14:05:01+02:00", "2026-10-03T07:05:01-05:00", "2099-01-01T00:00:00Z", "2026-10-03T12:05:00.001Z"]) {
    const r = await http(s);
    assert.equal(r.status, 400, `${s}: in the future, 400`);
    assert.equal(r.body["code"], "produced_at_future", `${s}: code produced_at_future`);
    assert.equal(r.body["message"], `prediction.produced_at '${s}' is in the future: more than 300 s after the server clock (ADR-CM B-4)`, `${s}: message`);
  }
  // The other served paths over HTTP: 2099 refused, +300 s served.
  for (const p of OTHER_PATHS) {
    const send = async (at: string): Promise<{ status: number; body: Obj }> => {
      const res = await handleJsonMirror(
        new Request("http://api.monarkgate.tech/gate", { method: "POST", body: JSON.stringify({ prediction: p.prediction(at), params: p.params }) }),
        () => NOW,
      );
      return { status: res.status, body: (await res.json()) as Obj };
    };
    const far = await send("2099-01-01T00:00:00Z");
    assert.equal(far.status, 400, `${p.label}: 2099 is a 400`);
    assert.equal(far.body["code"], "produced_at_future", `${p.label}: code produced_at_future`);
    assert.equal((await send("2026-10-03T12:05:00Z")).status, 200, `${p.label}: +300 s served`);
  }
  // MCP: the same refusal through the served handler, with the code in _meta.
  const late = await mcpGate("2026-10-03T12:05:01Z", NOW);
  assert.equal(late["isError"], true, "MCP: +301 s is a tool error");
  assert.deepEqual(late["_meta"], { "monarkgate.tech/error_code": "produced_at_future" }, "MCP: code in _meta");
  assert.notEqual((await mcpGate("2026-10-03T12:05:00Z", NOW))["isError"], true, "MCP: +300 s is served");
  // The real clock of the served handler (default) refuses 2099 too.
  const res = await createHarnessHandler().fetch(
    new Request("http://mcp.monarkgate.tech/", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "gate", arguments: { prediction: usde("2099-01-01T00:00:00Z"), params: PARAMS } } }),
    }),
  );
  assert.match(await res.text(), /"monarkgate\.tech\/error_code":"produced_at_future"/, "MCP default clock: 2099 refused");
  // Direct call without nowMs: RFC 3339 only (declared in the G0); with nowMs: refused.
  assert.equal(runGate(usde("2099-01-01T00:00:00Z"), PARAMS).verdict.produced_at, "2099-01-01T00:00:00Z", "direct call without nowMs decides");
  refusedWith(() => runGate(usde("2099-01-01T00:00:00Z"), PARAMS, undefined, { nowMs: NOW }), "produced_at_future", "direct call with nowMs");
  assertBtcDirRetired();
});
