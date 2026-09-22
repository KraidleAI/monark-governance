// IT-4 (GARDE-HELIUS-1b-iii tuyau) — the Bell Ethereum leg is BUDGETED and KEYLESS. liveEthSwaps runs over a REAL
// openGuardedClient with ONLY globalThis.fetch stubbed (C-5 / CA-11 durci: no fake client, no fake transport): every
// eth_getLogs / eth_getBlockByNumber is a write-ahead ledger line under <ledgerDir>/<cycle>/<label>.jsonl BEFORE the
// fetch, at cost 0 RU (keyless labels). This is the non-LLM composition proof: makeGuardedEthCall(openGuardedClient) ->
// liveEthSwaps -> ledger on disk -> a served TSLAon fill. The raw-fetch bellEthCall default is GONE (its removal is
// what makes "spends only through the guard" true for the ETH leg); liveEthSwaps now THROWS without a budgeted call.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { liveEthSwaps, makeGuardedEthCall, UNISWAP_V3_SWAP_TOPIC } from "../src/ethereum.ts";
import { POOLS } from "../src/pools.ts";
import { openGuardedClient, GET_LOGS_KEYLESS_LABELS, BudgetExceededError, TransportError, type RunLimits } from "@monark/rpc-guard";

const POOL = POOLS.find((p) => p.chain === "ethereum")!; // TSLAon/USDC (Uniswap v3), the leg 1b-iii budgets
const word = (n: bigint): string => n.toString(16).padStart(64, "0");
const SWAP = { blockNumber: "0x1", logIndex: "0x0", transactionHash: "0x" + "cc".repeat(32), topics: [UNISWAP_V3_SWAP_TOPIC], data: "0x" + word(1_000_000n) + word(2_000_000n) };
const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });

/** Sum, across every <op>.jsonl under the cycle dir, the attempted/refused line counts and the attempted RU. */
function ledgerTotals(cd: string): { attempted: number; refused: number; ru: number } {
  let attempted = 0, refused = 0, ru = 0;
  if (!existsSync(cd)) return { attempted, refused, ru };
  for (const f of readdirSync(cd)) {
    if (!f.endsWith(".jsonl")) continue;
    for (const l of readFileSync(join(cd, f), "utf8").split(/\r?\n/).filter((x) => x.trim() !== "")) {
      const e = JSON.parse(l) as { outcome: string; credits_derived: number };
      if (e.outcome === "attempted") { attempted += 1; ru += e.credits_derived; }
      else if (e.outcome === "refused") refused += 1;
    }
  }
  return { attempted, refused, ru };
}

test("eth_leg_budgeted_and_keyless", async () => {
  const dir = mkdtempSync(join(tmpdir(), "eth-leg-"));         // OUTSIDE the repo; ensureCycleDir needs the parent to pre-exist
  const cycle = "eth-cyc";
  const cd = join(dir, cycle);
  const cycles = Object.fromEntries(GET_LOGS_KEYLESS_LABELS.map((l) => [l, cycle])); // one cycle for every keyless label
  const limits: RunLimits = { maxCalls: 100_000, runCaps: {}, methodCaps: { eth_getLogs: 100_000, eth_getBlockByNumber: 100_000 }, cycleFloor: {} };
  let fetches = 0, writeAheadOk = true;
  const real = globalThis.fetch;
  // The write-ahead invariant is checked with a FLAG (not an in-spy assert, which the transport try/catch would swallow):
  // at the instant a fetch fires, the attempted ledger line count must already have caught up to the fetch count.
  globalThis.fetch = ((_i: string | URL, init?: RequestInit): Promise<Response> => {
    fetches += 1;
    if (ledgerTotals(cd).attempted < fetches) writeAheadOk = false;
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string };
    if (req.method === "eth_getLogs") return Promise.resolve(jrpc([SWAP]));
    if (req.method === "eth_getBlockByNumber") return Promise.resolve(jrpc({ hash: "0x" + "11".repeat(32), number: "0x1", timestamp: "0x66000000" }));
    return Promise.resolve(jrpc(null));
  }) as typeof globalThis.fetch;
  const client = openGuardedClient({}, limits, dir, cycles, {}); // keyless-only: no env key, no paid operator
  try {
    const fills = await liveEthSwaps(POOL, 1, 100, { call: makeGuardedEthCall(client) });
    assert.equal(fills.length, 1, "the ETH leg served the TSLAon swap as one fill THROUGH the guard");
    assert.equal(fills[0]!.signature, SWAP.transactionHash, "the served fill carries the swap tx hash");
    assert.ok(fetches > 0, "the leg actually fetched (the quorum + block read ran)");
    assert.ok(writeAheadOk, "every fetch is preceded by its write-ahead ledger line on disk (a raw-fetch default would fetch with NO ledger line)");
    const totals = ledgerTotals(cd);
    assert.equal(totals.attempted, fetches, `attempted ledger lines (${String(totals.attempted)}) == fetches (${String(fetches)}) — one write-ahead line per round-trip`);
    assert.equal(totals.ru, 0, "the ETH leg is KEYLESS: 0 RU across every ledger line (cost 0, counted)");
    for (const [op, v] of Object.entries(client.spent().byOperator)) assert.equal(v, 0, `spent() is 0 for keyless operator ${op}`);
  } finally {
    globalThis.fetch = real;
    rmSync(dir, { recursive: true, force: true }); // removes the per-op .lock files the client held (fd closed on open)
  }
});

// liveEthSwaps with NO budgeted call fails CLOSED (no raw-fetch default any more): the unbudgeted leg cannot rejoin the
// HELIUS-1 class silently. A "raw fetch default restored" mutant (opts.call ?? bellEthCall) would NOT throw => reds.
test("eth_leg_requires_a_budgeted_call_no_raw_fetch_default", async () => {
  await assert.rejects(() => liveEthSwaps(POOL, 1, 100), /requires a budgeted opts\.call/, "liveEthSwaps must fail-closed without a budgeted call");
});

// C-2 — a BUDGET REFUSAL is NEVER retried by makeGuardedEthCall (BudgetExceededError re-thrown FIRST). maxCalls 1: the 1st
// call succeeds, the 2nd is refused write-ahead (0 fetch), EXACTLY one refused ledger line. A "retry the budget refusal"
// mutant appends several refused lines => reds.
test("eth_leg_budget_refusal_is_not_retried", async () => {
  const dir = mkdtempSync(join(tmpdir(), "eth-budget-"));
  const cycle = "eth-cyc", cd = join(dir, cycle);
  const cycles = Object.fromEntries(GET_LOGS_KEYLESS_LABELS.map((l) => [l, cycle]));
  const limits: RunLimits = { maxCalls: 1, runCaps: {}, methodCaps: { eth_getLogs: 100 }, cycleFloor: {} };
  let fetches = 0;
  const real = globalThis.fetch;
  globalThis.fetch = () => { fetches += 1; return Promise.resolve(jrpc([])); };
  const client = openGuardedClient({}, limits, dir, cycles, {});
  const call = makeGuardedEthCall(client, { backoffMs: 0 });
  try {
    await call("drpc.org", "eth_getLogs", [{}, "0x1"]);                     // 1st succeeds (maxCalls 1)
    await assert.rejects(() => call("mevblocker.io", "eth_getLogs", [{}, "0x1"]), BudgetExceededError, "the 2nd call is a canonical budget refusal");
    assert.equal(ledgerTotals(cd).refused, 1, `EXACTLY one refused ledger line (a retried refusal would append several); got ${String(ledgerTotals(cd).refused)}`);
    assert.equal(fetches, 1, `the refused call does 0 fetch (write-ahead fail-closed); got ${String(fetches)}`);
  } finally { globalThis.fetch = real; rmSync(dir, { recursive: true, force: true }); }
});

// C-3 — the caller retry is SCOPED: a transient transport fault (503) is retried (each attempt its own ledger line), but a
// 403 is a HARD fault NEVER retried. A "retry any 4xx" mutant (code >= 400) retries the 403 => reds.
test("eth_leg_retries_transient_but_not_403", async () => {
  const dir = mkdtempSync(join(tmpdir(), "eth-sem-"));
  const cycle = "eth-cyc", cd = join(dir, cycle);
  const cycles = Object.fromEntries(GET_LOGS_KEYLESS_LABELS.map((l) => [l, cycle]));
  const limits: RunLimits = { maxCalls: 100, runCaps: {}, methodCaps: { eth_getLogs: 100 }, cycleFloor: {} };
  const real = globalThis.fetch;
  const client = openGuardedClient({}, limits, dir, cycles, {});
  const call = makeGuardedEthCall(client, { backoffMs: 0 });
  try {
    // (a) 503 once then OK => retried, 2 attempts (R retries => R+1 ledger lines), served result.
    let n = 0, fetchesA = 0;
    globalThis.fetch = () => { fetchesA += 1; return Promise.resolve(n++ === 0 ? new Response("busy", { status: 503 }) : jrpc([])); };
    const r = await call("drpc.org", "eth_getLogs", [{}, "0x1"]);
    assert.deepEqual(r, [], "a transient 503 is retried, then serves the result");
    assert.equal(fetchesA, 2, `the 503 was retried once (2 fetches); got ${String(fetchesA)}`);
    assert.equal(ledgerTotals(cd).attempted, 2, "each attempt is its own write-ahead ledger line (R retries => R+1)");
    // (b) 403 => NOT retried (hard fault), exactly ONE new attempt.
    const before = ledgerTotals(cd).attempted;
    let f403 = 0;
    globalThis.fetch = () => { f403 += 1; return Promise.resolve(new Response("forbidden", { status: 403 })); };
    await assert.rejects(() => call("tenderly.co", "eth_getLogs", [{}, "0x1"]), TransportError, "a 403 is a hard transport fault");
    assert.equal(f403, 1, `the 403 did exactly ONE fetch (never retried); got ${String(f403)}`);
    assert.equal(ledgerTotals(cd).attempted - before, 1, "the 403 left exactly ONE new attempted ledger line (not retried)");
  } finally { globalThis.fetch = real; rmSync(dir, { recursive: true, force: true }); }
});
