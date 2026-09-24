// GARDE-HELIUS-2b-ii (seam 2b-ii-a) - the recorder's error vocabulary and JSON-RPC class are now the SINGLE SOURCE
// in @monark/rpc-guard: apps/sentinel/src/ukemi/rpc2.ts IMPORTS + re-exports them and keeps NO second class or regex.
// These oracles run THROUGH the real transport (openGuardedClient + a stubbed globalThis.fetch, C-5): no hand-built
// RpcError, no fake client. They prove (1) the three classifiers rpc2.ts exposes ARE the package's (function
// identity + hint-equals-body conformance on measured bodies), (2) `instanceof RpcError` holds across the package
// boundary so a concordant revert still forms a ConcordantRevertError, and (3) R-A: a PAID revert with empty "0x"
// data is never concorded against a value (D-"0x"; held, not benched, since UKEMI-REVERT-1 - its pairing with a keyless
// bare witness is proven in ukemi-revert.test.ts). Named mutants (replayed from the transport): "local class + local isRpcRevert restored"
// (the pre-migration rpc2.ts) => identity broken => NoQuorumError; ""0x" treated present for a paid revert" => the
// paid revert enters the quorum => QuorumDisagreementError.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openGuardedClient, closedHint, isRevertText as guardIsRevertText, isResultLimit as guardIsResultLimit, isPlanLimited as guardIsPlanLimited, type RunLimits, type OperatorLabel } from "@monark/rpc-guard";
import { makeUkemiPool, NoQuorumError, ConcordantRevertError, isResultLimit, isPlanLimited, type UkemiReader } from "../src/ukemi/rpc2.ts";
import type { RpcCall } from "../src/rpc.ts";

// A fake CHAINSTACK_ETH_URL (never fetched for real - globalThis.fetch is stubbed). The keyless ETH operators
// resolve to public hosts inside the transport; here only the URL substring is used by the stub to pick a response.
const CS_HOST = "cs-node.example.invalid";
const ENV = { CHAINSTACK_ETH_URL: `https://${CS_HOST}/FAKEKEY-9z9z9z9z` };
const LIMITS: RunLimits = { maxCalls: 1000, runCaps: { chainstack: 1_000_000 }, methodCaps: { eth_call: 1000, eth_getLogs: 1000, eth_getBlockByNumber: 1000 }, cycleFloor: { chainstack: 0 } };

function tmp(): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "u2bii-cls-")); // OUTSIDE the repo (os tmp)
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

/** Build the exact composition the migrated recorder uses: openGuardedClient (real) -> a `call` shim that routes a
 *  LABEL to client.call -> makeUkemiPool over that shim. Only globalThis.fetch is stubbed (C-5). `labels` are the
 *  pool providers (bare labels; providerOf/operatorOf are idempotent on them). Returns the pool + a cleanup. */
function poolThroughGuard(labels: string[], fetchStub: (input: string | URL, init?: RequestInit) => Promise<Response>): { reader: UkemiReader; cleanup: () => void } {
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = fetchStub as typeof globalThis.fetch;
  const cycles = Object.fromEntries(labels.map((l) => [l, "cyc"]));
  const client = openGuardedClient(ENV, LIMITS, dir, cycles);
  const call: RpcCall = (label, method, params) => client.call(label as OperatorLabel, method, params);
  const reader = makeUkemiPool({ call, ethCallProviders: labels, getLogsProviders: labels, minIntervalMs: 0 });
  return { reader, cleanup: () => { globalThis.fetch = realFetch; cleanup(); } };
}

const rpcErrorResp = (code: number, message: string, data?: string): Response =>
  new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code, message, ...(data !== undefined ? { data } : {}) } }), { status: 200, headers: { "content-type": "application/json" } });
const okResp = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });

// -- D-4 - the three classifiers rpc2.ts exposes ARE @monark/rpc-guard's (single source), and predicate(closedHint(body))
// === predicate(body) for the measured bodies (hint-equals-body). Mutant "local regex restored in rpc2.ts" => the
// function identity assertion reds (rpc2.isResultLimit !== guard.isResultLimit). --
test("ukemi_recorder_classifiers_are_single_source_conformant", () => {
  // (1) function IDENTITY: rpc2.ts re-exports the SAME binding (a copy/regex would be a different function object).
  assert.equal(isResultLimit, guardIsResultLimit, "rpc2.isResultLimit IS @monark/rpc-guard's (no local copy)");
  assert.equal(isPlanLimited, guardIsPlanLimited, "rpc2.isPlanLimited IS @monark/rpc-guard's (no local copy)");
  // (2) hint-equals-body conformance on the measured recorder bodies (pool-rpc-1a M-7 + HTML + a bare "Reverted").
  const BODIES = [
    "query block range exceeds server limit, narrow your filter: 5000", // POCKET_5000 - result cap
    "query exceeds max block range 10000",                              // POCKET_10000 - result cap
    "ranges over 10000 blocks are not supported on free plan",          // DRPC_FREE - result cap AND plan cap
    "<html><head></head><body>502 Bad Gateway result</body></html>",    // an HTML page that happens to carry "result"
    "Reverted: insufficient balance",                                   // a bare "Reverted" without "execution"
  ];
  for (const body of BODIES) {
    const hint = closedHint(body);
    assert.equal(guardIsResultLimit(hint), guardIsResultLimit(body), `isResultLimit(hint)===isResultLimit(body) for: ${body}`);
    assert.equal(guardIsPlanLimited(hint), guardIsPlanLimited(body), `isPlanLimited(hint)===isPlanLimited(body) for: ${body}`);
    assert.equal(guardIsRevertText(hint), guardIsRevertText(body), `isRevertText(hint)===isRevertText(body) for: ${body}`);
  }
  // Precedence: DRPC free-plan matches BOTH isResultLimit and isPlanLimited (getLogsVia benches on isPlanLimited FIRST).
  assert.ok(isResultLimit("ranges over 10000 blocks are not supported on free plan") && isPlanLimited("ranges over 10000 blocks are not supported on free plan"), "free-plan cap matches both predicates (bench precedence)");
});

// -- C-1(a) identity across the package boundary, replayed FROM the transport (C-5): two DISTINCT keyless operators
// each return the SAME code-3 revert with data; makeUkemiPool's isRpcRevert (imported) must recognise the canonical
// RpcError the transport raised => ConcordantRevertError. Mutant "rpc2.ts restores a LOCAL RpcError class AND a local
// isRpcRevert checking `instanceof <local class>`" => the transport's canonical RpcError is NOT the local class =>
// isRpcRevert false => both benched => NoQuorumError (identity broken). --
test("ukemi_recorder_rpc_error_identity_holds_through_transport", async () => {
  const { reader, cleanup } = poolThroughGuard(["drpc.org", "mevblocker.io"], () => Promise.resolve(rpcErrorResp(3, "execution reverted", "0xdeadbeef")));
  try {
    await assert.rejects(() => reader.ethCall("0xabc", "0xdef", 100), ConcordantRevertError,
      "a concordant code-3 revert with data across two distinct operators forms a ConcordantRevertError (instanceof RpcError holds across the boundary)");
  } finally { cleanup(); }
});

// -- R-A / D-"0x" - a PAID (chainstack, unit "ru") revert whose data is empty "0x" is never concorded against a VALUE.
// Pool [drpc.org(value), chainstack(revert "0x")]: drpc answers a value; chainstack's "0x" revert (UKEMI-REVERT-1: HELD,
// no longer benched, and admitted ONLY against a keyless bare-revert witness - there is none here) is not admitted =>
// only one operator answered => NoQuorumError (the test name keeps the pre-R-A-bis wording). Mutant ""0x" treated present
// for a paid revert" (revert isRpcRevert=true) => the paid revert enters the quorum keyed on its preamble message, which
// never equals the keyless value key => QuorumDisagreementError. Replayed FROM the transport (C-5): the stub serves
// {code:3,...,data:"0x"} on chainstack. --
test("paid_revert_with_empty_0x_data_is_benched", async () => {
  const stub = (input: string | URL): Promise<Response> => {
    const url = String(input);
    if (url.includes(CS_HOST)) return Promise.resolve(rpcErrorResp(3, "execution reverted", "0x")); // paid bare revert
    return Promise.resolve(okResp("0x64")); // keyless value
  };
  const { reader, cleanup } = poolThroughGuard(["drpc.org", "chainstack"], stub);
  try {
    await assert.rejects(() => reader.ethCall("0xabc", "0xdef", 100), NoQuorumError,
      "R-A: the paid chainstack revert with empty \"0x\" data is benched => only drpc answered => no quorum (mutant: the paid revert enters => QuorumDisagreementError)");
  } finally { cleanup(); }
});

// Belt: a paid revert WITH real data still concords with a second paid-shaped revert would be a different test; here
// the keyless GHO V-4 mixed case (data "0x" vs absent, BOTH keyless) stays concordant - proven in ukemi.test.ts
// (ukemi_revert_key_uses_data). R-A touches ONLY the paid branch (unit !== "keyless"); this file's paid test above
// and that keyless test together pin the boundary.
