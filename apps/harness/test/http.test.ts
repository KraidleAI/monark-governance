/**
 * Harness Lot H4 — HTTP/JSON mirror tests (ADR-M005 D7/D8). The JSON mirror MUST expose exactly the
 * three MCP tools, with the SAME frozen schemas and the SAME boundary validation, and must sit behind
 * the SAME Host routing + Origin guard. Each test is killed by >= 1 named mutant (proven red, then
 * restored byte-exact via sha256 — see the passe report). No `any`, no unsafe (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { request as httpRequest } from "node:http";
import { assertClosedGateDecision, assertClosedPrediction, assertClosedAttestedPrice } from "@monark/contracts";
import { handleJsonMirror, MIRROR_OPERATIONS } from "../src/http.ts";
import { HARNESS_TOOLS, REGISTERED_TOOL_NAMES } from "../src/tools/registry.ts";
import { startServer } from "../src/server.ts";

const API_HOST = "api.monarkgate.tech";

const GATE_BODY = {
  prediction: { schema_version: "1.0.0", task_class: "btc-dir-15m", yhat: "up", predictor_id: "internal:momentum-4c", produced_at: "2026-09-04T00:00:00Z" },
  params: { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: "up", tool: "perps_order_preview", clockOpen: true },
} as const;
const CASCADE_BODY = { L: [[0, 100], [50, 0]], e: [40, 20], shock: 0, producedAt: "2026-09-04T00:00:00Z" } as const;
/** A valid body per operation (attest takes none). */
const BODIES: Readonly<Record<string, unknown>> = { gate: GATE_BODY, cascade: CASCADE_BODY, attest: {} };

interface MirrorResult { structuredContent: unknown; content: unknown; error?: string }

async function call(host: string, method: string, path: string, body?: unknown): Promise<{ status: number; body: MirrorResult }> {
  const init: RequestInit = { method };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await handleJsonMirror(new Request(`http://${host}${path}`, init));
  return { status: res.status, body: (await res.json()) as MirrorResult };
}

// Test — the mirror exposes EXACTLY the three MCP tools, returns the SAME frozen structuredContent, and
// enforces the SAME frozen input schema as the MCP boundary. Mutants: (a) hardcode the route table (drop
// cascade/attest, or add a 4th route) instead of deriving from HARNESS_TOOLS ⇒ the served set ≠ registry
// ⇒ red; (b) skip `~standard.validate` in http.ts ⇒ an extra key slips through ⇒ 200 ⇒ red; (c) alter the
// returned structuredContent ⇒ the parity deep-equal reds; (d) drop/empty the `content` honesty `text`
// (http.ts:85) ⇒ the content-parity deep-equal reds (K-1: the mirror text must equal the MCP text byte-for-byte).
test("http_mirror_matches_mcp_surface", async () => {
  // (a) the mirror's operation set IS the registry — the terminal set {attest,gate,cascade}, no drift.
  assert.deepEqual([...MIRROR_OPERATIONS].sort(), ["attest", "cascade", "gate"], "mirror ops == terminal MCP set");
  assert.deepEqual([...MIRROR_OPERATIONS].sort(), [...REGISTERED_TOOL_NAMES].sort(), "mirror ops == REGISTERED_TOOL_NAMES");

  // every registered tool has a live route (200); a non-registered operation is 404.
  for (const name of REGISTERED_TOOL_NAMES) {
    const r = await call(API_HOST, "POST", "/" + name, BODIES[name]);
    assert.equal(r.status, 200, `POST /${name} must be served (200), got ${String(r.status)}`);
  }
  const unknown = await call(API_HOST, "POST", "/trade", {});
  assert.equal(unknown.status, 404, "a non-registered operation must be 404");
  assert.equal(unknown.body.error, "unknown_operation");

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
  assert.ok(gateTool && cascadeTool && attestTool, "the three tools are registered");

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
