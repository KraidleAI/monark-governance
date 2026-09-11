/**
 * Harness — HTTP/JSON mirror tests (ADR-M005 D7/D8; extended to 4 tools by ADR-M007 C1). The JSON
 * mirror MUST expose exactly the four MCP tools, with the SAME frozen schemas and the SAME boundary validation, and must sit behind
 * the SAME Host routing + Origin guard. Each test is killed by >= 1 named mutant (proven red, then
 * restored byte-exact via sha256 — see the passe report). No `any`, no unsafe (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { request as httpRequest } from "node:http";
import { assertClosedGateDecision, assertClosedPrediction, assertClosedAttestedPrice, calibDigest } from "@monark/contracts";
import { handleJsonMirror, MIRROR_OPERATIONS } from "../src/http.ts";
import { HARNESS_TOOLS, REGISTERED_TOOL_NAMES } from "../src/tools/registry.ts";
import { CALIBRATE_MAX_N } from "../src/tools/calibrate.ts";
import { startServer } from "../src/server.ts";

const API_HOST = "api.monarkgate.tech";

const GATE_BODY = {
  prediction: { schema_version: "1.0.0", task_class: "btc-dir-15m", yhat: "up", predictor_id: "internal:momentum-4c", produced_at: "2026-09-04T00:00:00Z" },
  params: { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: "up", tool: "perps_order_preview", clockOpen: true },
} as const;
const CASCADE_BODY = { L: [[0, 100], [50, 0]], e: [40, 20], shock: 0, producedAt: "2026-09-04T00:00:00Z" } as const;
/** A valid calibrate body: n=10 >= nMin, p=⌈11·0.9⌉=10 <= n ⇒ q̂ is a number (a covered, not under_calib, result). */
const CALIBRATE_BODY = { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], alpha: 0.1, nMin: 5 } as const;
/** A valid body per operation (attest takes none). */
const BODIES: Readonly<Record<string, unknown>> = { gate: GATE_BODY, cascade: CASCADE_BODY, attest: {}, calibrate: CALIBRATE_BODY };

interface MirrorResult { structuredContent: unknown; content: unknown; error?: string }

async function call(host: string, method: string, path: string, body?: unknown): Promise<{ status: number; body: MirrorResult }> {
  const init: RequestInit = { method };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await handleJsonMirror(new Request(`http://${host}${path}`, init));
  return { status: res.status, body: (await res.json()) as MirrorResult };
}

// Test — the mirror exposes EXACTLY the four MCP tools, returns the SAME frozen structuredContent, and
// enforces the SAME frozen input schema as the MCP boundary. Mutants: (a) hardcode the route table (drop
// cascade/attest, or add a 4th route) instead of deriving from HARNESS_TOOLS ⇒ the served set ≠ registry
// ⇒ red; (b) skip `~standard.validate` in http.ts ⇒ an extra key slips through ⇒ 200 ⇒ red; (c) alter the
// returned structuredContent ⇒ the parity deep-equal reds; (d) drop/empty the `content` honesty `text`
// (http.ts:85) ⇒ the content-parity deep-equal reds (K-1: the mirror text must equal the MCP text byte-for-byte).
test("http_mirror_matches_mcp_surface", async () => {
  // (a) the mirror's operation set IS the registry — the terminal set {attest,gate,cascade,calibrate}, no drift.
  assert.deepEqual([...MIRROR_OPERATIONS].sort(), ["attest", "calibrate", "cascade", "gate"], "mirror ops == terminal MCP set");
  assert.deepEqual([...MIRROR_OPERATIONS].sort(), [...REGISTERED_TOOL_NAMES].sort(), "mirror ops == REGISTERED_TOOL_NAMES");

  // every registered tool has a live route (200); a non-registered operation is 404.
  for (const name of REGISTERED_TOOL_NAMES) {
    const r = await call(API_HOST, "POST", "/" + name, BODIES[name]);
    assert.equal(r.status, 200, `POST /${name} must be served (200), got ${String(r.status)}`);
  }
  const unknown = await call(API_HOST, "POST", "/trade", {});
  assert.equal(unknown.status, 404, "a non-registered operation must be 404");
  assert.equal(unknown.body.error, "unknown_operation");

  // a GET to a KNOWN operation path is a wrong method, not a missing route: 405 + Allow: POST + a POST hint,
  // so a caller that GETs self-corrects instead of reading a bare 404 as "endpoint not deployed". Mutant:
  // fall through to the 404 (the old behavior) ⇒ these red. An unknown GET path stays 404 (not every GET is 405).
  for (const name of REGISTERED_TOOL_NAMES) {
    const g = await handleJsonMirror(new Request(`http://${API_HOST}/${name}`, { method: "GET" }));
    assert.equal(g.status, 405, `GET /${name} is a wrong method ⇒ 405, not 404`);
    assert.equal(g.headers.get("allow"), "POST", `405 for GET /${name} carries Allow: POST`);
    const gb = (await g.json()) as { error?: string; message?: string };
    assert.equal(gb.error, "method_not_allowed", `GET /${name} surfaces method_not_allowed`);
    assert.ok(gb.message?.includes(`POST /${name}`), `the 405 hint names POST /${name}`);
  }
  const unknownGet = await handleJsonMirror(new Request(`http://${API_HOST}/not-a-tool`, { method: "GET" }));
  assert.equal(unknownGet.status, 404, "an unknown GET path stays 404 (not every GET becomes 405)");

  // (b) same FROZEN INPUT schema as the MCP boundary: an extra key (additionalProperties:false) is 400.
  const extra = await call(API_HOST, "POST", "/gate", { ...GATE_BODY, rogue: true });
  assert.equal(extra.status, 400, "an extra key must be rejected (mirror validates like the MCP boundary)");
  assert.equal(extra.body.error, "invalid_input");
  // a missing required field is likewise rejected at the schema boundary (never a silent gate).
  const missing = await call(API_HOST, "POST", "/gate", { prediction: GATE_BODY.prediction });
  assert.equal(missing.status, 400, "a missing required field must be rejected");

  // (c) same FROZEN OUTPUT as the MCP tool: structuredContent deep-equals the registry run() output and
  // is a closed frozen contract. Drive both off the SAME HARNESS_TOOLS descriptor (no re-implementation).
  const gateTool = HARNESS_TOOLS.find((t) => t.name === "gate");
  const cascadeTool = HARNESS_TOOLS.find((t) => t.name === "cascade");
  const attestTool = HARNESS_TOOLS.find((t) => t.name === "attest");
  const calibrateTool = HARNESS_TOOLS.find((t) => t.name === "calibrate");
  assert.ok(gateTool && cascadeTool && attestTool && calibrateTool, "the four tools are registered");

  const gateRes = await call(API_HOST, "POST", "/gate", GATE_BODY);
  assert.deepEqual(gateRes.body.structuredContent, gateTool.run(GATE_BODY).structured, "gate mirror == MCP structured output");
  assertClosedGateDecision(gateRes.body.structuredContent);
  // honesty parity (K-1): the mirror's `content` text is byte-for-byte the tool's MCP honesty envelope.
  assert.deepEqual(gateRes.body.content, [{ type: "text", text: gateTool.run(GATE_BODY).text }], "gate mirror content == MCP honesty text");

  const cascadeRes = await call(API_HOST, "POST", "/cascade", CASCADE_BODY);
  assert.deepEqual(cascadeRes.body.structuredContent, cascadeTool.run(CASCADE_BODY).structured, "cascade mirror == MCP structured output");
  assertClosedPrediction(cascadeRes.body.structuredContent);
  assert.deepEqual(cascadeRes.body.content, [{ type: "text", text: cascadeTool.run(CASCADE_BODY).text }], "cascade mirror content == MCP honesty text");

  const attestRes = await call(API_HOST, "POST", "/attest", {});
  const attestStructured = attestRes.body.structuredContent;
  assert.ok(attestStructured !== null && typeof attestStructured === "object", "attest returns the K-1 envelope");
  // the frozen `price` alone is the closed contract; label/provenance ride the envelope (K-1).
  assertClosedAttestedPrice((attestStructured as { price: unknown }).price);
  assert.deepEqual(attestRes.body.content, [{ type: "text", text: attestTool.run({}).text }], "attest mirror content == MCP honesty text");

  // calibrate: the mirror returns the SAME structuredContent + honesty content as the MCP tool.
  const calibrateRes = await call(API_HOST, "POST", "/calibrate", CALIBRATE_BODY);
  assert.deepEqual(calibrateRes.body.structuredContent, calibrateTool.run(CALIBRATE_BODY).structured, "calibrate mirror == MCP structured output");
  assert.deepEqual(calibrateRes.body.content, [{ type: "text", text: calibrateTool.run(CALIBRATE_BODY).text }], "calibrate mirror content == MCP honesty text");
});

/** Wired POST via node:http so the `Host` header can be set explicitly (fetch forbids setting Host). */
function wiredPost(
  port: number,
  host: string,
  path: string,
  body: unknown,
  origin?: string,
): Promise<{ status: number; json: unknown }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers: Record<string, string | number> = {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(data),
      host,
    };
    if (origin !== undefined) headers["origin"] = origin;
    const req = httpRequest({ hostname: "127.0.0.1", port, path, method: "POST", headers }, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (c: string) => { raw += c; });
      res.on("end", () => { resolve({ status: res.statusCode ?? 0, json: raw.length ? (JSON.parse(raw) as unknown) : null }); });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// Test — WIRED: on the one 127.0.0.1 listener, a request whose Host is `api.` is routed to the JSON
// mirror, and the Origin guard runs on that surface too. Mutants: (a) `isJsonMirrorHost` always false ⇒
// the `api.` POST hits the MCP handler and is NOT a mirror 200 GateDecision ⇒ red; (b) drop the
// originGuard before dispatch ⇒ the evil-Origin request is not 403 ⇒ red.
test("http_mirror_routes_by_host_and_guards_origin", async () => {
  const server = startServer(0);
  try {
    await once(server, "listening");
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    const port = addr.port;

    // (a) Host `api.` -> JSON mirror: a valid /gate POST returns a closed GateDecision.
    const ok = await wiredPost(port, API_HOST, "/gate", GATE_BODY);
    assert.equal(ok.status, 200, "api. host routes to the JSON mirror (200)");
    const okObj = ok.json;
    assert.ok(okObj !== null && typeof okObj === "object", "mirror body is an object");
    assertClosedGateDecision((okObj as { structuredContent: unknown }).structuredContent);

    // (b) Origin guard runs on the api. surface too: a present, non-allowlisted Origin is 403.
    const evil = await wiredPost(port, API_HOST, "/gate", GATE_BODY, "https://evil.example.com");
    assert.equal(evil.status, 403, "the api. surface 403s a present-and-invalid Origin (guard before dispatch)");
    assert.equal((evil.json as { error?: string } | null)?.error, "invalid_origin");
  } finally {
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
});

// Test — B-1 (ADR-M007): a calibrate refusal is a client error (400), NEVER a leaked 500. This is the
// non-vacuity proof that `CalibrateToolError` ∈ `TOOL_ERROR_NAMES` (http.ts): drop it from that set and
// the α∉(0,1) case below throws past the tool-error branch into the generic handler ⇒ 500 ⇒ this reds.
// Two error paths, distinct on purpose:
//   (a) α=1.5 PASSES the input schema (`alpha` is bare {type:number}, no range) and reaches runCalibrate,
//       which throws CalibrateToolError ⇒ 400 `tool_error` — the load-bearing B-1 discriminator.
//   (b) n>cap is caught EARLIER, at the SDK boundary by `maxItems` ⇒ 400 `invalid_input` (never reaches
//       the tool). Both are 400, never 500 — that is the invariant the ADR §3 requires.
test("http_calibrate_errors_are_400_never_500", async () => {
  // (a) α out of (0,1) ⇒ CalibrateToolError surfaced as 400 tool_error (B-1).
  const badAlpha = await call(API_HOST, "POST", "/calibrate", { scores: [0.1, 0.2, 0.3, 0.4, 0.5], alpha: 1.5, nMin: 3 });
  assert.equal(badAlpha.status, 400, "α∉(0,1) must be a 400 tool error, never a 500");
  assert.equal(badAlpha.body.error, "tool_error", "α∉(0,1) surfaces as tool_error (proves CalibrateToolError ∈ TOOL_ERROR_NAMES, B-1)");

  // (b) n > CALIBRATE_MAX_N ⇒ rejected at the schema boundary (maxItems) as invalid_input, still 400.
  const over = new Array<number>(CALIBRATE_MAX_N + 1).fill(0);
  const overCap = await call(API_HOST, "POST", "/calibrate", { scores: over, alpha: 0.1, nMin: 3 });
  assert.equal(overCap.status, 400, "n > cap must be a 400 (maxItems at the boundary), never a 500");
  assert.equal(overCap.body.error, "invalid_input", "n > cap is rejected by the projected schema's maxItems (invalid_input)");
});

/** A BYO gate body: a caller-owned task_class + params.calibration (interval mode, scores ≥ 0). */
const GATE_BYO_BODY = {
  prediction: { schema_version: "1.0.0", task_class: "byo-demo", yhat: 0, predictor_id: "caller:model", produced_at: "2026-09-04T00:00:00Z" },
  params: { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 2, alpha: 0.1, nMin: 5, intent: 0, tool: "perps_order_preview", clockOpen: true, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], mode: "interval" } },
} as const;

// Test — C2 BYO over the HTTP mirror: a /gate body carrying params.calibration returns 200 + a closed
// GateDecision whose verdict.calib_digest == calibDigest(scores) (the audit tie), and the content text is
// the BYO exchangeability carrier (not the cascade sentence). BYO refusals are 400 (HarnessToolError ∈
// TOOL_ERROR_NAMES), never 500. Mutants: skip the yhat type check ⇒ interval on a string yhat 500s; drop
// the negative-score guard ⇒ an all-negative interval 500s ⇒ these reds. Also anti-override ⇒ 400.
test("http_gate_byo_calibration", async () => {
  // 200 + closed GateDecision + audit digest.
  const ok = await call(API_HOST, "POST", "/gate", GATE_BYO_BODY);
  assert.equal(ok.status, 200, "a BYO /gate body is served (200)");
  assertClosedGateDecision(ok.body.structuredContent);
  const sc = ok.body.structuredContent as { verdict: { calib_digest: string }; action: string };
  assert.equal(sc.verdict.calib_digest, calibDigest(GATE_BYO_BODY.params.calibration.scores), "verdict.calib_digest == calibDigest(caller scores) — the C1↔C2 audit tie");
  assert.equal(sc.action, "commit", "width 2 <= tauInterval 2, intent 0 ∈ [−1,1] ⇒ COMMIT");
  // content parity with the MCP tool (K-1): the BYO honesty carrier, not the cascade sentence.
  const gateTool = HARNESS_TOOLS.find((t) => t.name === "gate");
  assert.ok(gateTool, "the gate tool is registered");
  assert.deepEqual(ok.body.content, [{ type: "text", text: gateTool.run(GATE_BYO_BODY).text }], "BYO mirror content == MCP honesty text");
  // RES-1 (G2 C2): an ABSOLUTE oracle so the HTTP layer itself kills a B-1 regression (the deepEqual above is
  // an identity and would stay green under a mutant that renders the cascade sentence on BOTH sides).
  const byoPart = (ok.body.content as ReadonlyArray<{ text: string }>)[0];
  assert.ok(byoPart, "BYO mirror returns a content text part");
  assert.ok(byoPart.text.includes("exchangeable"), "BYO content carries the exchangeability honesty carrier");
  assert.ok(!byoPart.text.includes("no cascade calibration is committed"), "BYO content must NOT carry the cascade under_calib sentence (B-1 wiring, independent of run())");
  // The verdict summary reaches the wire (delivery aid for text-only MCP clients): the decision action and
  // the truncated calib_digest are in the content text, so a client that drops structuredContent still sees
  // the decision. Absolute oracle: a mutant that omits the summary or hardcodes a stale digest reds here.
  assert.ok(byoPart.text.includes("action=commit"), "BYO content carries the verdict summary action (=commit)");
  assert.ok(byoPart.text.includes(`calib_digest=${calibDigest(GATE_BYO_BODY.params.calibration.scores).slice(0, 8)}`), "BYO content carries the (truncated) calib_digest in the verdict summary");

  // BYO refusals ⇒ 400 tool_error, never 500.
  const negScores = { ...GATE_BYO_BODY, params: { ...GATE_BYO_BODY.params, calibration: { scores: [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10], mode: "interval" } } };
  const neg = await call(API_HOST, "POST", "/gate", negScores);
  assert.equal(neg.status, 400, "an all-negative interval BYO ⇒ 400, never 500 (B-6)");
  assert.equal(neg.body.error, "tool_error", "a BYO refusal surfaces as tool_error (HarnessToolError ∈ TOOL_ERROR_NAMES)");

  const override = { ...GATE_BYO_BODY, prediction: { ...GATE_BYO_BODY.prediction, task_class: "btc-dir-15m", yhat: "up" } };
  const ov = await call(API_HOST, "POST", "/gate", override);
  assert.equal(ov.status, 400, "calibration + a committed class ⇒ 400 (anti-override)");
  assert.equal(ov.body.error, "tool_error", "anti-override surfaces as tool_error");
});
