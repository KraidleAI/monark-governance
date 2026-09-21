import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  makeClient, openCycleLedger, verifyCycleLedger, BudgetExceededError,
  type OperatorLabel, type Transport, type ClientConfig, type CycleLedger,
} from "../src/index.ts";

const HELIUS = "helius" as OperatorLabel;
const heliusCredits = (m: string): number => (m === "getTransactionsForAddress" ? 10 : 1);

function mkLedger(floor = 0, cycle = "cycle-1"): { ledger: CycleLedger; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "rpcg-")); // OUTSIDE the repo (os tmp)
  return { ledger: openCycleLedger(dir, cycle, floor), cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
function cfg(over: Partial<ClientConfig["limits"]> = {}, cap = 8_000_000): ClientConfig {
  return {
    operators: { helius: { unit: "credits", credits: heliusCredits, cycleCap: cap } },
    limits: { maxCalls: 100, maxCredits: 1_000_000, methodCaps: {}, cycleFloor: 0, ...over },
  };
}

test("budget_counts_http_attempts", async () => {
  const { ledger, cleanup } = mkLedger();
  try {
    let n = 0; const lenAtCall: number[] = [];
    const spy: Transport = () => { lenAtCall.push(ledger.entries().length); if (++n <= 2) return Promise.reject(new Error("HTTP 503")); return Promise.resolve({ ok: 1 }); };
    const client = makeClient(cfg(), ledger, { transport: spy });
    const withRetry = async (): Promise<unknown> => {
      let last: unknown;
      for (let i = 0; i < 4; i++) { try { return await client.call(HELIUS, "getTransaction", [1]); } catch (e) { if (e instanceof BudgetExceededError) throw e; last = e; } }
      throw last;
    };
    await withRetry();
    const attempted = ledger.entries().filter((e) => e.outcome === "attempted");
    assert.equal(attempted.length, 3, "2 caller retries => 3 attempted ledger lines (mutant retry-nested breaks this)");
    assert.equal(lenAtCall.length, 3, "exactly one transport invocation per attempt");
    // WRITE-AHEAD: the i-th line is on disk BEFORE the i-th transport call (mutant append-after-fetch => [0,0,0]).
    assert.deepEqual(lenAtCall, [1, 2, 3]);
    verifyCycleLedger(ledger.entries());
  } finally { cleanup(); }
});

test("run_cap_stops_and_ledger_carries_attempt", async () => {
  const { ledger, cleanup } = mkLedger();
  try {
    const spy: Transport = () => Promise.resolve({ ok: 1 });
    const client = makeClient(cfg({ maxCalls: 2 }), ledger, { transport: spy });
    await client.call(HELIUS, "getTransaction", [1]);
    await client.call(HELIUS, "getTransaction", [2]);
    await assert.rejects(client.call(HELIUS, "getTransaction", [3]), (e: unknown) => e instanceof BudgetExceededError);
    const last = ledger.entries().at(-1)!;
    assert.equal(last.outcome, "refused", "the refused attempt carries its own write-ahead line");
    assert.equal(last.reason, "run_calls");
    verifyCycleLedger(ledger.entries());
  } finally { cleanup(); }
});

test("method_cap_stops", async () => {
  const { ledger, cleanup } = mkLedger();
  try {
    const spy: Transport = () => Promise.resolve({ ok: 1 });
    const client = makeClient(cfg({ methodCaps: { getTransactionsForAddress: 1 } }), ledger, { transport: spy });
    await client.call(HELIUS, "getTransactionsForAddress", ["m"]);
    await assert.rejects(client.call(HELIUS, "getTransactionsForAddress", ["m"]), (e: unknown) => e instanceof BudgetExceededError);
    const last = ledger.entries().at(-1)!;
    assert.equal(last.outcome, "refused");
    assert.equal(last.reason, "method_cap");
  } finally { cleanup(); }
});

test("cycle_cap_stops", async () => {
  const { ledger, cleanup } = mkLedger(0, "cycle-8");
  try {
    const spy: Transport = () => Promise.resolve({ ok: 1 });
    const client = makeClient(cfg({}, 25), ledger, { transport: spy }); // cap 25 cr; gTfA = 10 each
    await client.call(HELIUS, "getTransactionsForAddress", ["m"]); // sum=10
    await client.call(HELIUS, "getTransactionsForAddress", ["m"]); // sum=20
    await assert.rejects(client.call(HELIUS, "getTransactionsForAddress", ["m"]), (e: unknown) => e instanceof BudgetExceededError); // 20+10>25
    const last = ledger.entries().at(-1)!;
    assert.equal(last.outcome, "refused");
    assert.equal(last.reason, "cycle_cap");
    verifyCycleLedger(ledger.entries());
  } finally { cleanup(); }
});
