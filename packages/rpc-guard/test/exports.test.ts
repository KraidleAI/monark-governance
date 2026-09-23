import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
// The SOLE public paid path (C-V-2). resolveOperators / makeClient / InMemorySink are NOT here (proven below).
import { openGuardedClient, BudgetExceededError } from "@monark/rpc-guard";
import { HELIUS, tmp } from "./harness.ts";
import type { RunLimits } from "../src/client.ts";

const PROBE_ENV = { BELL_SOLANA_RPC: "https://example.invalid/HELIUS", HELIUS_API_KEY: "FAKEKEY-9z9z9z" };
// GARDE-HELIUS-2: RunLimits is PER OPERATOR (runCaps / cycleFloor keyed by label), and openGuardedClient takes a
// per-operator `cycles` map whose keys are the REQUESTED subset (here: helius only).
const PROBE_LIMITS: RunLimits = { maxCalls: 10, runCaps: { helius: 1000 }, methodCaps: { getTransaction: 5 }, cycleFloor: { helius: 0 } };

test("public_api_never_reaches_fetch_without_a_ledger_line", async () => {
  // P6 functional probe: patch globalThis.fetch (isolated per test process); at fetch time the write-ahead ledger
  // line must already be on disk. No exported symbol lets a paid call bypass meter + commit.
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  const linesAtFetch: number[] = [];
  globalThis.fetch = () => {
    const p = join(dir, "cycle-probe", "helius.jsonl");
    linesAtFetch.push(existsSync(p) ? readFileSync(p, "utf8").trim().split("\n").filter(Boolean).length : 0);
    return Promise.resolve(new Response(JSON.stringify({ result: 1 }), { status: 200, headers: { "content-type": "application/json" } }));
  };
  try {
    const client = openGuardedClient(PROBE_ENV, PROBE_LIMITS, dir, { helius: "cycle-probe" });
    await client.call(HELIUS, "getTransaction", [1]);
    assert.deepEqual(linesAtFetch, [1], "every fetch is preceded by exactly its write-ahead ledger line (P6)");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

test("public_api_freezes_the_prior_p3_floor", async () => {
  // P3-floor THROUGH the public path (not just makeClient): the cycle cap is the decision-112 constant (8 M, fixed in
  // transport.ts), so a floor of 7_999_990 trips the SECOND gTfA (10 cr): 7999990+0+10=8000000 passes, +10+10 refused.
  // Proves openGuardedClient FREEZES the prior (C-V-1 on the public surface, per C-V-2).
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = () => { calls++; return Promise.resolve(new Response(JSON.stringify({ result: 1 }), { status: 200, headers: { "content-type": "application/json" } })); };
  try {
    const client = openGuardedClient(PROBE_ENV, { maxCalls: 10, runCaps: { helius: 100_000_000 }, methodCaps: { getTransactionsForAddress: 100 }, cycleFloor: { helius: 7_999_990 } }, dir, { helius: "cycle-p3" });
    await client.call(HELIUS, "getTransactionsForAddress", ["m"]);
    await assert.rejects(client.call(HELIUS, "getTransactionsForAddress", ["m"]), (e: unknown) => e instanceof BudgetExceededError);
    assert.equal(calls, 1, "the frozen prior (max(floor, 0)) is enforced through the PUBLIC API, not just makeClient");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

test("public_export_set_is_closed", async () => {
  const pub = await import("@monark/rpc-guard");
  assert.deepEqual(Object.keys(pub).sort(), [
    "BudgetExceededError", "TransportError", "RpcError", "CHAINSTACK_CYCLE_CAP_RU", "CHAINSTACK_TARIFF_VERSION", "ETH_CALL_KEYLESS_LABELS",
    "GET_LOGS_KEYLESS_LABELS", "HELIUS_CYCLE_CAP_CREDITS", "HELIUS_TARIFF_VERSION", "chainstackRu",
    "heliusCredits", "openGuardedClient", "runCli", "runReconcile", "verifyCycleLedger",
    // GARDE-HELIUS-2b C-4: the single-source error vocabulary (rpc2.ts imports these; NOT a paid path).
    "isResultLimit", "isPlanLimited", "isRevertText", "isRpcRevert", "closedHint", "ERROR_HINT_TOKENS",
    // UKEMI-REVERT-1: the ADDITIVE bare-revert classifier (rpc2.ts quorum2 pairs a paid bare revert with a keyless bare
    // witness; NOT a paid path - it takes an error, never an endpoint URL).
    "isBareRevert",
    // GARDE-HELIUS-1b-0 (C-3c): the closed Bell-Solana method table + its construction-time --method-caps coverage
    // check (Bell imports these at 1b-ii; NOT a paid path - no symbol returns/accepts an endpoint URL).
    "BELL_SOLANA_METHODS", "assertMethodCapsCover",
  ].sort(), "the public VALUE-export set drifted (no new paid path may be exported)");
  for (const forbidden of ["makeClient", "resolveOperators", "resolveConfig", "InMemorySink", "openOperatorLedger", "acquireLock", "runUnlock"]) {
    assert.ok(!(forbidden in pub), `${forbidden} must NOT be public (C-V-2)`);
  }
});

test("exports_map_forbids_deep_import", async () => {
  const deep: string = "@monark/rpc-guard/src/client.ts"; // non-literal so tsc leaves it unresolved
  await assert.rejects(() => import(deep), (e: unknown) => (e as { code?: string }).code === "ERR_PACKAGE_PATH_NOT_EXPORTED");
});

test("transport_error_never_carries_url_or_key", async () => {
  // An unparseable endpoint => fetch throws a TypeError whose message + `.input` carry the url+key; the client
  // rethrows a FRESH error with only label + error name (C-V-3). Offline: the parse fails before any dispatch.
  const { dir, cleanup } = tmp();
  try {
    const client = openGuardedClient({ BELL_SOLANA_RPC: "not-a-url-scheme", HELIUS_API_KEY: "FAKEKEY-9z9z9z" }, PROBE_LIMITS, dir, { helius: "cycle-scrub" });
    await assert.rejects(client.call(HELIUS, "getTransaction", [1]), (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      assert.doesNotMatch(msg, /not-a-url-scheme|FAKEKEY|api-key/i, `error message leaks the endpoint: ${msg}`);
      assert.equal((e as { input?: unknown }).input, undefined, "the rethrown error must not carry `.input`");
      return e instanceof Error;
    });
  } finally { cleanup(); }
});
