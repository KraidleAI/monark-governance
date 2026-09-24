import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BudgetExceededError } from "@monark/rpc-guard";
import { verifyCycleLedger } from "../src/ledger.ts";
import { HELIUS, OK, tmp, heliusLedger, heliusCfg, heliusClient } from "./harness.ts";
import type { Transport } from "../src/client.ts";

const diskLines = (path: string): number => readFileSync(path, "utf8").trim().split("\n").filter(Boolean).length;

test("budget_counts_http_attempts", async () => {
  const { dir, cleanup } = tmp();
  try {
    const ledger = heliusLedger(dir);
    let n = 0; const lenAtCall: number[] = [];
    const spy: Transport = () => { lenAtCall.push(diskLines(ledger.path)); if (++n <= 2) return Promise.reject(new Error("HTTP 503")); return Promise.resolve({ ok: 1 }); };
    const client = heliusClient(heliusCfg(), ledger, spy);
    const withRetry = async (): Promise<unknown> => {
      let last: unknown;
      for (let i = 0; i < 4; i++) { try { return await client.call(HELIUS, "getTransaction", [1]); } catch (e) { if (e instanceof BudgetExceededError) throw e; last = e; } }
      throw last;
    };
    await withRetry();
    assert.equal(ledger.entries().filter((e) => e.outcome === "attempted").length, 3, "2 caller retries => 3 attempted lines (mutant retry-nested)");
    assert.equal(lenAtCall.length, 3, "one transport invocation per attempt");
    // WRITE-AHEAD on DISK: the i-th line is on disk BEFORE the i-th transport (mutant append-after-fetch => [0,0,0]).
    assert.deepEqual(lenAtCall, [1, 2, 3]);
    verifyCycleLedger(ledger.entries());
  } finally { cleanup(); }
});

test("run_cap_stops_and_ledger_carries_attempt", async () => {
  const { dir, cleanup } = tmp();
  try {
    const ledger = heliusLedger(dir);
    let calls = 0; const spy: Transport = () => { calls++; return Promise.resolve({ ok: 1 }); };
    const client = heliusClient(heliusCfg({ maxCalls: 2 }), ledger, spy);
    await client.call(HELIUS, "getTransaction", [1]);
    await client.call(HELIUS, "getTransaction", [2]);
    await assert.rejects(client.call(HELIUS, "getTransaction", [3]), (e: unknown) => e instanceof BudgetExceededError);
    assert.equal(calls, 2, "C-G2-5: 0 fetch on the refused call");
    const last = ledger.entries().at(-1)!;
    assert.equal(last.outcome, "refused"); assert.equal(last.reason, "run_calls");
    verifyCycleLedger(ledger.entries());
  } finally { cleanup(); }
});

test("run_credits_cap_stops", async () => {
  const { dir, cleanup } = tmp();
  try {
    const ledger = heliusLedger(dir);
    let calls = 0; const spy: Transport = () => { calls++; return Promise.resolve({ ok: 1 }); };
    const client = heliusClient(heliusCfg({ runCaps: { helius: 15 }, methodCaps: { getTransactionsForAddress: 100 } }), ledger, spy); // gTfA = 10 cr
    await client.call(HELIUS, "getTransactionsForAddress", ["m"]);                                                          // 0 + 10 = 10 <= 15
    await assert.rejects(client.call(HELIUS, "getTransactionsForAddress", ["m"]), (e: unknown) => e instanceof BudgetExceededError); // 10 + 10 = 20 > 15
    assert.equal(calls, 1, "C-G2-5: 0 fetch on the refused call");
    const last = ledger.entries().at(-1)!;
    assert.equal(last.outcome, "refused"); assert.equal(last.reason, "run_credits"); // C-G2-2 (mutant runCredits+cost>maxCredits -> false reds)
    verifyCycleLedger(ledger.entries());
  } finally { cleanup(); }
});

test("method_cap_stops", async () => {
  const { dir, cleanup } = tmp();
  try {
    const ledger = heliusLedger(dir);
    const client = heliusClient(heliusCfg({ methodCaps: { getTransactionsForAddress: 1 } }), ledger, OK);
    await client.call(HELIUS, "getTransactionsForAddress", ["m"]);
    await assert.rejects(client.call(HELIUS, "getTransactionsForAddress", ["m"]), (e: unknown) => e instanceof BudgetExceededError);
    const last = ledger.entries().at(-1)!;
    assert.equal(last.outcome, "refused"); assert.equal(last.reason, "method_cap");
  } finally { cleanup(); }
});

test("cycle_cap_stops", async () => {
  const { dir, cleanup } = tmp();
  try {
    const ledger = heliusLedger(dir, "cycle-8", 15); // floor 15 (P3-floor scenario)
    let calls = 0; const spy: Transport = () => { calls++; return Promise.resolve({ ok: 1 }); };
    const client = heliusClient(heliusCfg({ cycleFloor: { helius: 15 }, methodCaps: { getTransactionsForAddress: 100 } }, 25), ledger, spy); // cap 25; gTfA=10
    await client.call(HELIUS, "getTransactionsForAddress", ["m"]);                                    // prior 15 + 0 + 10 = 25, not > 25 => passes
    await assert.rejects(client.call(HELIUS, "getTransactionsForAddress", ["m"]), (e: unknown) => e instanceof BudgetExceededError); // 15 + 10 + 10 = 35 > 25 => refused
    assert.equal(calls, 1, "P3-floor: exactly ONE transport (the 2nd gTfA is refused BEFORE the transport)");
    const last = ledger.entries().at(-1)!;
    assert.equal(last.outcome, "refused"); assert.equal(last.reason, "cycle_cap");
    verifyCycleLedger(ledger.entries());
  } finally { cleanup(); }
});

test("cycle_cap_floor_probe", async () => {
  // C-G2-1: floor 100 / cap 115 / gTfA 10 => ONE success (100+0+10=110 <= 115), second refused (100+10+10=120 > 115).
  const { dir, cleanup } = tmp();
  try {
    const ledger = heliusLedger(dir, "c-g2-1", 100);
    let calls = 0; const spy: Transport = () => { calls++; return Promise.resolve({ ok: 1 }); };
    const client = heliusClient(heliusCfg({ cycleFloor: { helius: 100 }, methodCaps: { getTransactionsForAddress: 100 } }, 115), ledger, spy);
    await client.call(HELIUS, "getTransactionsForAddress", ["m"]);
    await assert.rejects(client.call(HELIUS, "getTransactionsForAddress", ["m"]), (e: unknown) => e instanceof BudgetExceededError);
    assert.equal(calls, 1, "exactly ONE transport (a floor near the cap must not permit ~floor of extra spend)");
  } finally { cleanup(); }
});

test("unknown_method_is_ledgered_not_a_bare_error", async () => {
  const { dir, cleanup } = tmp();
  try {
    const ledger = heliusLedger(dir);
    let calls = 0; const spy: Transport = () => { calls++; return Promise.resolve({ ok: 1 }); };
    const client = heliusClient(heliusCfg(), ledger, spy);
    await assert.rejects(client.call(HELIUS, "getBogusUndocumented", []), (e: unknown) => e instanceof BudgetExceededError);
    assert.equal(calls, 0, "0 transport for an unknown method");
    const last = ledger.entries().at(-1)!;
    assert.equal(last.outcome, "refused"); assert.equal(last.reason, "unknown_method"); // C-V-6
  } finally { cleanup(); }
});
