/**
 * Harness Lot H1 — transport safety (ADR-M005 D7, K-8/K-9). Origin allowlist + localhost bind.
 * No `any` (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { request as httpRequest } from "node:http";
import { assertClosedPrediction } from "@monark/contracts";
import { HOST, PORT, originGuard, startServer, MAX_REQUEST_BODY_BYTES } from "../src/server.ts";

/**
 * Minimal wired POST over node:http (self-contained — no import outside the harness workspace, so the
 * EXPORTED CI type-checks). Sets an explicit `Host` (fetch forbids it) so a request can be routed to the
 * `api.` mirror or the `mcp.` MCP surface on the one loopback listener, and returns the raw body so an SSE
 * (`text/event-stream`) response is readable as text. Mirrors http.test.ts's `wiredPost`.
 */
function wiredPost(port: number, host: string, path: string, body: string, accept: string): Promise<{ status: number; raw: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      { hostname: "127.0.0.1", port, path, method: "POST", headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body), accept, host } },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (c: string) => { raw += c; });
        res.on("end", () => { resolve({ status: res.statusCode ?? 0, raw }); });
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function guard(origin: string | null): Response | undefined {
  const headers: Record<string, string> = {};
  if (origin !== null) headers["origin"] = origin;
  return originGuard(new Request(`http://${HOST}:${String(PORT)}/mcp`, { headers }));
}

// Test — a present, non-allowlisted (or malformed) Origin is rejected with 403 (K-9/C-1), BOTH as a
// unit and ON THE WIRED HTTP PATH (C-2). Mutants: `isHarnessOriginAllowed` returns `true` ⇒ red (unit);
// drop the `originGuard(request)` call in `handleNodeRequest` (before dispatch) ⇒ red (wired).
test("origin_invalid_returns_403", async () => {
  // (a) unit — the guard function itself.
  const evil = guard("https://evil.example.com");
  assert.ok(evil, "a present, non-allowlisted Origin must be rejected");
  assert.equal(evil.status, 403);
  const malformed = guard("not-a-valid-origin");
  assert.equal(malformed?.status, 403, "a malformed Origin is denied (never passed through)");
  // Positive controls (so the gate is not simply rejecting everything): apex + sub-domains accepted.
  assert.equal(guard("https://monarkgate.tech"), undefined, "apex accepted");
  assert.equal(guard("https://mcp.monarkgate.tech"), undefined, "sub-domain accepted");
  assert.equal(guard("https://api.monarkgate.tech"), undefined, "sub-domain accepted");

  // (b) WIRED — the guard must actually run on the HTTP request path, before dispatch. A real request
  // with a non-allowlisted Origin gets 403; an apex Origin is NOT 403 (it passes the guard).
  const server = startServer(0);
  try {
    await once(server, "listening");
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    const url = `http://127.0.0.1:${String(addr.port)}/mcp`;
    const post = (origin: string): Promise<Response> =>
      fetch(url, {
        method: "POST",
        headers: { origin, "content-type": "application/json", accept: "application/json, text/event-stream" },
        body: "{}",
      });
    const evilWired = await post("https://evil.example.com");
    assert.equal(evilWired.status, 403, "the wired path must 403 a non-allowlisted Origin (guard runs before dispatch)");
    const evilBody = (await evilWired.json()) as { error?: string };
    assert.equal(evilBody.error, "invalid_origin", "the 403 must come from originGuard, not an incidental SDK rejection");
    const apexWired = await post("https://monarkgate.tech");
    await apexWired.body?.cancel();
    assert.notEqual(apexWired.status, 403, "an apex Origin passes the guard on the wired path");
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => { resolve(); });
    });
  }
});

// Test — an ABSENT Origin is accepted (non-browser MCP clients send none) (K-9/C-1).
// Mutant: reject when the Origin header is absent ⇒ red.
test("origin_absent_is_accepted", () => {
  assert.equal(guard(null), undefined, "an absent Origin is accepted");
});

// Test — Lot H6 body cap: an oversized request body is rejected with 413 BEFORE dispatch (fail-closed,
// streaming — never buffered past the cap), a body EXACTLY at the cap is NOT capped, and a legitimate MCP
// `tools/call` over the SAME wired reader still succeeds (the reader feeds the SSE seam the same bytes).
// Mutants: (a) drop the bounded read (buffer the whole body) ⇒ the oversized POST is no longer 413 ⇒ red;
// (b) `>=` instead of `>` ⇒ the exactly-at-cap control becomes 413 ⇒ red; (c) truncate/alter the body in
// the reader ⇒ the mirror yhat===100 assertion (c1) AND the MCP SSE result assertion (c2) both red.
test("oversized_body_413_and_normal_tools_call_unaffected", async () => {
  const server = startServer(0);
  try {
    await once(server, "listening");
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    const port = addr.port;
    const base = `http://127.0.0.1:${String(port)}/`;

    // (a) oversized: exactly cap+1 bytes ⇒ 413. The extra byte trips the streaming cap on the final chunk,
    // so the whole body is consumed and the connection closes cleanly ⇒ a deterministic 413 (no RST race).
    const oversized = await fetch(base, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "a".repeat(MAX_REQUEST_BODY_BYTES + 1),
    });
    await oversized.body?.cancel();
    assert.equal(oversized.status, 413, "a body over the cap must be rejected with 413");

    // (a2) SECURITY INVARIANT — the origin guard runs FIRST (header-only) BEFORE the body is read: a
    // bad-Origin request carrying an OVERSIZED body gets 403 (the guard fired on the header), NOT 413
    // (which would mean the bounded reader ran first, buffering a body from a rejected origin). Killing
    // mutant: move `originGuard` below `readBodyBounded` in `handleNodeRequest` ⇒ this flips 403→413 ⇒ red.
    const badOriginOversized = await new Promise<number>((resolve) => {
      const body = "a".repeat(MAX_REQUEST_BODY_BYTES + 1);
      let done = false;
      const finish = (code: number): void => { if (!done) { done = true; resolve(code); } };
      const req = httpRequest(
        { hostname: "127.0.0.1", port, path: "/", method: "POST",
          headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body), origin: "https://evil.example.com", host: "mcp.monarkgate.tech" } },
        (res) => { res.resume(); finish(res.statusCode ?? 0); },
      );
      req.on("error", () => { finish(0); });
      req.write(body);
      req.end();
    });
    assert.equal(badOriginOversized, 403, "bad-Origin + oversized body ⇒ 403 (guard runs header-first, before the body is read), NOT 413");

    // (b) positive control — a body EXACTLY at the cap is NOT capped (kills a `>=`-for-`>` mutant). The MCP
    // handler rejects this garbage payload some OTHER way, but never with 413.
    const atCap = await fetch(base, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "a".repeat(MAX_REQUEST_BODY_BYTES),
    });
    await atCap.body?.cancel();
    assert.notEqual(atCap.status, 413, "a body exactly at the cap is NOT capped (the cap is an inclusive upper bound)");

    // (c) NORMAL requests still flow through the bounded reader on BOTH surfaces — the reader hands the same
    // bytes to the same downstream handlers as before. The demo cascade (L=[[0,100],[50,0]], e=[40,20],
    // shock 0) computes yhat=100 either way.
    const cascadeBody = JSON.stringify({ L: [[0, 100], [50, 0]], e: [40, 20], shock: 0, producedAt: "2026-09-04T00:00:00Z" });
    // (c1) HTTP/JSON mirror (`api.` host): a valid cascade POST returns 200 + the frozen closed Prediction.
    const mirror = await wiredPost(port, "api.monarkgate.tech", "/cascade", cascadeBody, "application/json");
    assert.equal(mirror.status, 200, "the api. mirror serves a normal cascade POST through the bounded reader");
    const mirrorBody = JSON.parse(mirror.raw) as { structuredContent: Record<string, unknown> };
    assertClosedPrediction(mirrorBody.structuredContent);
    assert.equal(mirrorBody.structuredContent["yhat"], 100, "the mirror cascade still computes yhat=100 through the reader");
    // (c2) MCP `tools/call` (SSE, `mcp.` host): the streamable-HTTP path is UNAFFECTED — a real cascade call
    // returns 200 and the SSE body carries the computed result (yhat). Stateless: no `initialize` needed
    // (the probe drives the same seam). This is what proves the reorder+reader did not break the SSE path.
    const rpc = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "cascade", arguments: JSON.parse(cascadeBody) as unknown } });
    const mcp = await wiredPost(port, "mcp.monarkgate.tech", "/", rpc, "application/json, text/event-stream");
    assert.equal(mcp.status, 200, "the MCP tools/call (SSE) path still returns 200 through the bounded reader");
    assert.ok(mcp.raw.includes("\"yhat\""), "the MCP tools/call SSE body carries the computed cascade result (yhat)");
  } finally {
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
});

// Test — the server binds 127.0.0.1 ONLY (K-8/C-10). Mutant: HOST = "0.0.0.0" ⇒ red.
test("harness_binds_localhost_only", async () => {
  assert.equal(HOST, "127.0.0.1", "the bind host constant is localhost");
  const server = startServer(0); // ephemeral port, DEFAULT host = the security property under test
  try {
    await once(server, "listening");
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    assert.equal(addr.address, "127.0.0.1", "must bind localhost only, never 0.0.0.0");
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => { resolve(); });
    });
  }
});
