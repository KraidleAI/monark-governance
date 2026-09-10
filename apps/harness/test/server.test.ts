/**
 * Harness Lot H1 — transport safety (ADR-M005 D7, K-8/K-9). Origin allowlist + localhost bind.
 * No `any` (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { HOST, PORT, originGuard, startServer } from "../src/server.ts";

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
