/**
 * Harness — transport safety (ADR-M005 D7, K-8/K-9). Origin allowlist + localhost bind.
 * No `any` (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { request as httpRequest, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { assertClosedPrediction } from "@monark/contracts";
import { HOST, PORT, originGuard, startServer, MAX_REQUEST_BODY_BYTES } from "../src/server.ts";
import { HARNESS_VERSION } from "../src/version.ts";
import { buildOpenApi } from "../src/openapi.ts";
import { HARNESS_TOOLS } from "../src/tools/registry.ts";
import { startLoopback } from "./helpers/loopback.ts";

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

/** The non-allowlisted Origin of the wired (a2) case. */
const EVIL = "https://evil.example.com";
/** The errors by which a client loses a response the server did send: a reset of the connection (EXPORT-HARNESS-413-LOAD-1). */
const RESET = new Set(["ECONNRESET", "EPIPE", "ECONNABORTED"]);

function guard(origin: string | null): Response | undefined {
  const headers: Record<string, string> = {};
  if (origin !== null) headers["origin"] = origin;
  return originGuard(new Request(`http://${HOST}:${String(PORT)}/mcp`, { headers }));
}

// Test — a present, non-allowlisted (or malformed) Origin is rejected with 403 (K-9/C-1), BOTH as a
// unit and ON THE WIRED HTTP PATH (C-2). Mutants: `isHarnessOriginAllowed` returns `true` ⇒ red (unit);
// drop the `originGuard(request)` call in `handleNodeRequest` (before dispatch) ⇒ red (wired).
// killer: apps/harness/src/server.ts:188 CONST "(port, host)" -> "(0, host)"
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
  const server = await startLoopback((port) => startServer(port));
  try {
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
    server.closeAllConnections(); // C-G2D-1: server-socket hygiene (destroy before close). Does NOT fix the libuv async.c flake (nodejs/node#56645)
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

// Test — body cap: an oversized request body is rejected with 413 BEFORE dispatch (fail-closed,
// streaming — never buffered past the cap), a body EXACTLY at the cap is NOT capped, and a legitimate MCP
// `tools/call` over the SAME wired reader still succeeds (the reader feeds the SSE seam the same bytes).
// Mutants: (a) drop the bounded read (buffer the whole body) ⇒ the oversized POST is no longer 413 ⇒ red;
// (b) `>=` instead of `>` ⇒ the exactly-at-cap control becomes 413 ⇒ red; (c) truncate/alter the body in
// the reader ⇒ the mirror yhat===100 assertion (c1) AND the MCP SSE result assertion (c2) both red.
// killer: apps/harness/src/server.ts:188 CONST "(port, host)" -> "(0, host)"
test("oversized_body_413_and_normal_tools_call_unaffected", async () => {
  const server = await startLoopback((port) => startServer(port));
  try {
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
    // The verdict rests on what the SERVER sent, seen on its own `request` event (EXPORT-HARNESS-413-LOAD-1): the 403, with the
    // body not read in full (`req.complete` false proves only that: the guard answered before the whole body was consumed; a
    // reader that buffers the whole body first reds here). The client must see that 403, or a reset: the server closes a socket that still holds
    // unread body bytes, so the OS answers the rest with RST, and win32 drops a received but unread 403 when the RST lands
    // first (Linux keeps it): the red of the exported CI on win32 under load (65 ms). Any other status or error stays red.
    // A server that drops the socket without finishing a response must red on a named assertion, not hang to the runner timeout
    // (G2 C-1): `close` gives the fast verdict, and the wait for `sent` is capped once the client has its outcome.
    const sent = new Promise<{ status: number; complete: boolean } | string>((resolve) => {
      const onRequest = (req: IncomingMessage, res: ServerResponse): void => {
        if (req.headers.origin !== EVIL) return;
        server.off("request", onRequest);
        res.once("finish", () => { resolve({ status: res.statusCode, complete: req.complete }); });
        res.once("close", () => { resolve("closed the response without finishing it"); });
      };
      server.on("request", onRequest);
    });
    const seen = await new Promise<number | string>((resolve) => {
      const body = "a".repeat(MAX_REQUEST_BODY_BYTES + 1);
      let done = false;
      const finish = (outcome: number | string): void => { if (!done) { done = true; resolve(outcome); } };
      const req = httpRequest(
        { hostname: "127.0.0.1", port, path: "/", method: "POST",
          headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body), origin: EVIL, host: "mcp.monarkgate.tech" } },
        (res) => { res.resume(); finish(res.statusCode ?? 0); },
      );
      req.on("error", (e: NodeJS.ErrnoException) => { finish(e.code ?? e.message); });
      req.write(body);
      req.end();
    });
    let cap: NodeJS.Timeout | undefined;
    const served = await Promise.race([sent, new Promise<string>((resolve) => {
      cap = setTimeout(() => { resolve("finished no response within 10 s"); }, 10_000);
    })]);
    clearTimeout(cap);
    if (typeof served === "string") assert.fail(`bad-Origin + oversized body: the server ${served} (it must finish its 403)`);
    assert.deepEqual(served, { status: 403, complete: false }, "bad-Origin + oversized body ⇒ the server sent 403 before reading the body (guard runs header-first), NOT 413");
    if (typeof seen === "number") assert.equal(seen, 403, "bad-Origin + oversized body ⇒ 403 (guard runs header-first, before the body is read), NOT 413");
    else assert.ok(RESET.has(seen), `the client may lose the 403 only to a reset of the unread body (win32), not to ${seen}`);

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
    server.closeAllConnections(); // C-G2D-1: server-socket hygiene (destroy before close). Does NOT fix the libuv async.c flake (nodejs/node#56645)
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
});

// Test — the server binds 127.0.0.1 ONLY (K-8/C-10). Mutant: HOST = "0.0.0.0" ⇒ red.
// killer: apps/harness/src/server.ts:188 CONST "(port, host)" -> "(0, host)"
test("harness_binds_localhost_only", async () => {
  assert.equal(HOST, "127.0.0.1", "the bind host constant is localhost");
  const server = await startLoopback((port) => startServer(port)); // drawn port, DEFAULT host = the security property under test
  try {
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    assert.equal(addr.address, "127.0.0.1", "must bind localhost only, never 0.0.0.0");
  } finally {
    server.closeAllConnections(); // C-G2D-1: server-socket hygiene (destroy before close). Does NOT fix the libuv async.c flake (nodejs/node#56645)
    await new Promise<void>((resolve) => {
      server.close(() => { resolve(); });
    });
  }
});

// Test — M012-f: the MCP serverInfo.version (and the OpenAPI info.version) advertise the SINGLE-SOURCE
// HARNESS_VERSION, never a hardcoded "1.0.0". The live `initialize` probe (2026-09-18) returned
// serverInfo.version "1.0.0", contradicting the public tag v0.4.0 / MCP registry 0.4.0 and the
// "1.0.0 is a human decision" doctrine (ADR-M010 section 2.3). Mutants:
//   (a) server.ts `version: HARNESS_VERSION` -> `"1.0.0"` ⇒ the wired serverInfo assertion reds;
//   (b) version.ts HARNESS_VERSION -> "1.0.0" ⇒ the equality passes (both "1.0.0") but the
//       startsWith("1.") doctrinal guard reds — the guard's non-vacuity proof.
// killer: apps/harness/src/server.ts:188 CONST "(port, host)" -> "(0, host)"
test("serverInfo_version_is_single_source_and_never_one", async () => {
  // Doctrinal guard: the advertised version is a 0.MINOR.PATCH release aligned on the git tag, never a
  // 1.x — "1.0.0 is a human decision, never an agent's; the interface contracts do not thaw"
  // (ADR-M010 section 2.3 / CONTRIBUTING Releases).
  assert.ok(!HARNESS_VERSION.startsWith("1."), `HARNESS_VERSION must not be a 1.x — 1.0.0 is a human decision, never an agent's (ADR-M010 section 2.3); got "${HARNESS_VERSION}"`);
  assert.match(HARNESS_VERSION, /^0\.\d+\.\d+$/, `HARNESS_VERSION must be a 0.MINOR.PATCH release aligned on the git tag (ADR-M010 section 2.4); got "${HARNESS_VERSION}"`);

  // The OpenAPI info.version is DERIVED from the SAME single source (no second version literal).
  const info = buildOpenApi()["info"];
  assert.ok(info !== null && typeof info === "object" && !Array.isArray(info), "the OpenAPI document must carry an info object");
  assert.equal(info["version"], HARNESS_VERSION, "the OpenAPI info.version must equal HARNESS_VERSION (single source)");

  // ADR-M010 section 2.4: the advertised version is DELIBERATELY decoupled from package.json, which stays
  // "0.0.0"/private (never npm-published; the version source of truth is the git tag). Read the HARNESS
  // package.json only (this file imports nothing outside the harness workspace).
  const pkg = JSON.parse(readFileSync(join(import.meta.dirname, "..", "package.json"), "utf8")) as { version: string; private: boolean };
  assert.equal(pkg.version, "0.0.0", "apps/harness/package.json stays 0.0.0 by doctrine (ADR-M010 section 2.4 — version source of truth is the git tag)");
  assert.equal(pkg.private, true, "apps/harness is private:true (never npm-published — ADR-M010 section 2.4)");
  assert.notEqual(HARNESS_VERSION, pkg.version, "the advertised HARNESS_VERSION is decoupled from package.json.version (ADR-M010 section 2.4)");

  // WIRED — reproduce the `initialize` probe that measured the defect (2026-09-18) on the `mcp.` surface:
  // the live serverInfo.version must equal HARNESS_VERSION. Stateless: no prior session is needed.
  const server = await startLoopback((port) => startServer(port));
  try {
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    const initialize = JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "m012f-probe", version: "0" } },
    });
    const res = await wiredPost(addr.port, "mcp.monarkgate.tech", "/", initialize, "application/json, text/event-stream");
    assert.equal(res.status, 200, "initialize must return 200 on the mcp. surface");
    // The streamable-HTTP transport may answer as SSE (a `data: <json>` line) or plain JSON — read either.
    const sse = /^data: (.*)$/m.exec(res.raw);
    const payload = JSON.parse(sse?.[1] ?? res.raw) as { result?: { serverInfo?: { name?: string; version?: string } } };
    const serverInfo = payload.result?.serverInfo;
    assert.ok(serverInfo, "the initialize result must carry serverInfo");
    assert.equal(serverInfo.version, HARNESS_VERSION, `serverInfo.version must equal HARNESS_VERSION (single source); got "${String(serverInfo.version)}"`);
  } finally {
    server.closeAllConnections(); // C-G2D-1: server-socket hygiene (destroy before close). Does NOT fix the libuv async.c flake (nodejs/node#56645)
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
});

// Test — C-G2D-1 drain hygiene: after closeAllConnections()+close(), the SERVER handle (TCPServerWrap) clears.
// This asserts the drain is well-formed socket hygiene — it does NOT prove the CI flake is fixed. MEASURED (see
// the D4 finding / RENDU): the residual ~4% flake is a libuv Windows assertion (`src\win\async.c:76`, a uv_async_t
// at process.exit() under --test-force-exit — nodejs/node#56645, Windows-only, repro fetch()+process.exit()), NOT
// a socket leak; the drain reduces socket handles but does NOT close it. The ×100 matrix therefore does NOT reach
// 0 (~4% residual, matrix-clean-82/) => D4 "0-flake" escalated to config-CI (orchestrator). No deterministic MUTANT
// reddens here. Test 18 (universe) is already drained; test 22 is spawnSync (no server handle) — untouched.
// killer: apps/harness/src/server.ts:188 CONST "(port, host)" -> "(0, host)"
test("harness_server_drain_leaves_no_server_handle", async () => {
  const server = await startLoopback((port) => startServer(port));
  try {
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    // Open a real connection so closeAllConnections() has a live socket to destroy.
    const cascade = JSON.stringify({ L: [[0, 100], [50, 0]], e: [40, 20], shock: 0, producedAt: "2026-09-04T00:00:00Z" });
    await wiredPost(addr.port, "api.monarkgate.tech", "/cascade", cascade, "application/json");
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
  // libuv releases the handle one loop iteration AFTER the close() callback, so poll a bounded number of
  // macrotasks: a DRAINED server clears within a few ticks; a genuine leak never clears (the assertion fails).
  // We assert the SERVER handle (TCPServerWrap) only. The residual libuv async.c:76 flake (nodejs/node#56645) is
  // NOT a socket handle and is NOT ruled out by this belt nor by the drain — it is escalated as a config-CI item.
  let kinds = process.getActiveResourcesInfo();
  for (let i = 0; i < 50 && kinds.includes("TCPServerWrap"); i++) {
    await new Promise<void>((resolve) => { setImmediate(resolve); });
    kinds = process.getActiveResourcesInfo();
  }
  assert.equal(kinds.includes("TCPServerWrap"), false, `the server handle must clear after closeAllConnections()+close() (a leak never does); saw [${kinds.join(",")}]`);
});

// TRANSPORT-500-SCHEMA-1 (N-4 of the G2 of C' 3c-4a): every 500 the server can send validates the 500 schema that /openapi.json
// publishes (the same for the four operations, compiled by Ajv 2020 in strict mode), over the wire: the two 500 of an operation
// (output outside its schema, the tool threw) and the transport-level 500 of server.ts, thrown around the mirror (POST /calibrate)
// or before routing (an unparseable Host), whose body is exactly {"error":"internal_error"}. The schema stays closed.
// killer: apps/harness/src/schema-projection.ts:200 CONST "[internal, transport]" -> "[internal]"
test("every_500_of_the_server_validates_the_published_500_schema", async () => {
  type Rec = Record<string, unknown>;
  const at = (node: unknown, ...keys: string[]): unknown => keys.reduce<unknown>((n, k) => (n as Rec | undefined)?.[k], node);
  const spec = buildOpenApi(), ops = Object.keys(at(spec, "paths") as Rec);
  const schemas = ops.map((p) => at(spec, "paths", p, "post", "responses", "500", "content", "application/json", "schema"));
  assert.ok(ops.length === 4 && schemas.every((x) => JSON.stringify(x) === JSON.stringify(schemas[0])), "one 500 schema for the four operations");
  const Ajv = (createRequire(import.meta.url)("ajv/dist/2020.js") as { default: new (o: object) => { compile: (s: unknown) => (v: unknown) => boolean } }).default;
  const valid = new Ajv({ strict: true }).compile(schemas[0]);
  assert.deepEqual([{ error: "internal_error", operation: "" }, { error: "internal_error", x: 1 }, { error: "tool_error" }].map(valid), [false, false, false], "the 500 schema stays closed");
  const tool = HARNESS_TOOLS.find((t) => t.name === "calibrate");
  assert.ok(tool !== undefined, "the calibrate tool is registered");
  const mutable = tool as { run: typeof tool.run }, original = tool.run;
  const server = await startLoopback((port) => startServer(port));
  try {
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    const body = JSON.stringify({ scores: [0.1, 0.2, 0.3], alpha: 0.5, nMin: 3 });
    const cases: [string, typeof tool.run, string, string | null][] = [
      ["output_invalid", () => ({ text: "x", structured: { rogue: true } }), "api.monarkgate.tech", "calibrate"],
      ["the tool threw", () => { throw new Error("boom"); }, "api.monarkgate.tech", "calibrate"],
      ["transport, around the mirror", () => ({ text: "x", get structured(): never { throw new Error("transport"); } }), "api.monarkgate.tech", null],
      ["transport, before routing", original, "bad host", null],
    ];
    for (const [name, run, host, operation] of cases) {
      mutable.run = run;
      const res = await wiredPost(addr.port, host, "/calibrate", body, "application/json");
      const json = JSON.parse(res.raw) as Rec;
      assert.equal(res.status, 500, `${name}: a 500`);
      assert.equal(json["operation"] ?? null, operation, `${name}: the operation named, or none (transport)`);
      if (operation === null) assert.equal(res.raw, JSON.stringify({ error: "internal_error" }), `${name}: the transport-level body`);
      assert.ok(valid(json), `${name}: the 500 body validates the published 500 schema: ${res.raw}`);
    }
  } finally {
    mutable.run = original;
    server.closeAllConnections();
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
});

// TRANSPORT-500-SCHEMA-1, fold of its review (R-1): every status the server can answer on a described operation is listed by
// /openapi.json, and nothing else: 200, 400 (not JSON), 403 (an Origin outside monarkgate.tech), 413 (a body one byte over the
// cap, read in full so no reset races the answer) and 500 (the tool threw). The 404 and 405 of undescribed paths and methods
// are out of scope. The same list for the four operations.
// killer: apps/harness/src/openapi.ts:91 SDL "\"413\": {" -> ""
test("every_status_of_a_described_operation_is_listed_by_openapi", async () => {
  const spec = buildOpenApi() as { paths: Record<string, { post: { responses: Record<string, unknown> } }> };
  const listed = Object.values(spec.paths).map((p) => Object.keys(p.post.responses).sort().join(","));
  assert.ok(listed.length === 4 && listed.every((l) => l === listed[0]), `one status list for the four operations: ${listed.join(" | ")}`);
  const tool = HARNESS_TOOLS.find((t) => t.name === "calibrate");
  assert.ok(tool !== undefined, "the calibrate tool is registered");
  const mutable = tool as { run: typeof tool.run }, original = tool.run;
  const server = await startLoopback((port) => startServer(port));
  try {
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    const send = (body: string, headers: Record<string, string> = {}): Promise<number> => new Promise((resolve, reject) => {
      const req = httpRequest({ hostname: "127.0.0.1", port: addr.port, path: "/calibrate", method: "POST", headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body), host: "api.monarkgate.tech", ...headers } }, (res) => {
        res.resume();
        res.on("end", () => { resolve(res.statusCode ?? 0); });
      });
      req.on("error", reject);
      req.end(body);
    });
    const ok = JSON.stringify({ scores: [0.1, 0.2, 0.3], alpha: 0.5, nMin: 3 });
    const sent = [await send(ok), await send("{"), await send(ok, { origin: EVIL }), await send("a".repeat(MAX_REQUEST_BODY_BYTES + 1))];
    mutable.run = () => { throw new Error("boom"); };
    sent.push(await send(ok));
    assert.deepEqual(sent, [200, 400, 403, 413, 500], "each status is reached on the wire");
    assert.deepEqual(sent.map(String).sort().join(","), listed[0], "/openapi.json lists exactly the statuses the server answers on a described operation");
  } finally {
    mutable.run = original;
    server.closeAllConnections();
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
});
