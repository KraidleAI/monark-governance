// Test harness for @monark/rpc-guard (NOT a *.test.ts, so it is never run as a test - only imported). Internals are
// reached by RELATIVE import (they are no longer public, C-V-2). Every operator gets a durable per-operator ledger.
// GARDE-HELIUS-2: RunLimits is PER OPERATOR (runCaps / cycleFloor are Record<label, number>); makeClient no longer
// locks (the sole public path openGuardedClient locks before opening the ledgers).
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureCycleDir, openOperatorLedger, type CycleLedger } from "../src/ledger.ts";
import { makeClient, type BudgetedClient, type ClientConfig, type Transport, type OperatorLabel } from "../src/client.ts";
import { heliusCredits } from "../src/tariff.ts";

export const HELIUS = "helius" as OperatorLabel;
export const OK: Transport = () => Promise.resolve({ ok: 1 });

export function tmp(): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "rpcg-")); // OUTSIDE the repo (os tmp)
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
export function heliusLedger(dir: string, cycle = "c1", floor = 0): CycleLedger {
  return openOperatorLedger(ensureCycleDir(dir, cycle), "helius", floor);
}
export function heliusCfg(over: Partial<ClientConfig["limits"]> = {}, cap = 8_000_000): ClientConfig {
  return {
    operators: { helius: { unit: "credits", credits: heliusCredits, cycleCap: cap } },
    limits: { maxCalls: 100, runCaps: { helius: 1_000_000 }, methodCaps: { getTransaction: 100, getSignaturesForAddress: 100, getTransactionsForAddress: 100 }, cycleFloor: { helius: 0 }, ...over },
  };
}
export function heliusClient(cfg: ClientConfig, ledger: CycleLedger, transport: Transport): BudgetedClient {
  return makeClient(cfg, new Map([["helius", ledger]]), { transport });
}
