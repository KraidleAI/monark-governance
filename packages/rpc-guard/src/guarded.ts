// MONARK rpc-guard - the SOLE PUBLIC path to a paid call (C-V-2). openGuardedClient wires the env -> per-operator
// durable ledgers -> makeClient (which locks each paid operator and freezes its prior BEFORE any transport). There is
// NO public symbol that returns a raw transport or an in-memory sink, so - proven functionally by the P6 probe (T2) -
// no path from the public API reaches `fetch` without first writing a write-ahead ledger line.
import { resolveOperators } from "./transport.ts";
import { ensureCycleDir, openOperatorLedger, type CycleLedger } from "./ledger.ts";
import { makeClient, type BudgetedClient, type RunLimits } from "./client.ts";

export function openGuardedClient(env: Record<string, string | undefined>, limits: RunLimits, ledgerDir: string, cycleId: string): BudgetedClient {
  const { classes, transport } = resolveOperators(env);
  const cycleDir = ensureCycleDir(ledgerDir, cycleId); // HELIUS_LEDGER_DIR must pre-exist (C-8)
  const ledgers = new Map<string, CycleLedger>();
  for (const label of Object.keys(classes)) ledgers.set(label, openOperatorLedger(cycleDir, label, limits.cycleFloor));
  return makeClient({ operators: classes, limits }, ledgers, { transport });
}
