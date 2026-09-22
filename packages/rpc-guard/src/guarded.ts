// MONARK rpc-guard - the SOLE PUBLIC path to a paid call (C-V-2). openGuardedClient wires the env -> the REQUESTED
// operator subset -> per-operator locks -> per-operator durable ledgers (opened UNDER the lock) -> makeClient. There is
// NO public symbol that returns a raw transport or an in-memory sink, so - proven functionally by the P6 probe (T2) -
// no path from the public API reaches `fetch` without first writing a write-ahead ledger line.
//
// C-2 (GARDE-HELIUS-2), the multi-operator core:
//   - SUBSET: the requested operators = Object.keys(cycles); ONLY these are opened and locked. A Ukemi course that
//     names {chainstack, drpc.org, ...} never opens or locks `helius`. An operator not resolved from env => fail-closed.
//   - ATOMIC LOCK + ROLLBACK: the per-operator locks are acquired in sorted order; if the k-th throws (LockHeldError),
//     the k-1 already held are RELEASED (releaseLock = unlink, never an appended `unlocked` line) and 0 transport runs.
//   - PRIOR FROZEN AFTER THE LOCK: the ledgers are opened AFTER the locks, so each frozen prior reflects every prior
//     writer (they released before we could acquire). A held lock => LockHeldError BEFORE any ledger is read.
//   - Config is VALIDATED before any lock (assertLimits), so a bad config never leaves a stale lock.
import { resolveOperators, type TransportOpts } from "./transport.ts";
import { ensureCycleDir, openOperatorLedger, type CycleLedger } from "./ledger.ts";
import { acquireLock, releaseLock } from "./lock.ts";
import { makeClient, assertLimits, type BudgetedClient, type RunLimits, type OperatorClass } from "./client.ts";

export function openGuardedClient(
  env: Record<string, string | undefined>,
  limits: RunLimits,
  ledgerDir: string,
  cycles: Readonly<Record<string, string>>,
  opts: TransportOpts = {},
): BudgetedClient {
  const { classes, transport } = resolveOperators(env, opts);
  const requested = Object.keys(cycles);
  if (requested.length === 0) throw new Error("rpc-guard: no operators requested (cycles is empty, fail-closed)");
  // SUBSET: only the requested operators, each of which MUST be resolved from env (fail-closed).
  const selected: Record<string, OperatorClass> = {};
  for (const label of requested) {
    const cls = classes[label];
    if (cls === undefined) throw new Error(`rpc-guard: requested operator '${label}' is not resolved from env (fail-closed)`);
    selected[label] = cls;
  }
  // VALIDATE the config BEFORE any lock (a bad config must never leave a stale lock).
  assertLimits(selected, limits);
  // ACQUIRE the per-operator locks ATOMICALLY (sorted order for determinism), rolling back on any failure.
  const acquired: Array<{ dir: string; op: string }> = [];
  try {
    for (const label of Object.keys(selected).sort()) {
      const dir = ensureCycleDir(ledgerDir, cycles[label]!);
      acquireLock(dir, label);
      acquired.push({ dir, op: label });
    }
    // OPEN the ledgers UNDER the lock (prior frozen after the lock). Keyless operators are ledgered too (counted, 0 cost).
    const ledgers = new Map<string, CycleLedger>();
    for (const label of Object.keys(selected)) {
      const dir = ensureCycleDir(ledgerDir, cycles[label]!); // HELIUS_LEDGER_DIR must pre-exist (C-8)
      // 121 (C-5): the multi-network operator `chainstack` stamps `network` on its lines when the course declares one;
      // every other operator (and a pre-121 chainstack course without opts.network) stamps none (legacy, byte-identical).
      const network = label === "chainstack" ? opts.network : undefined;
      ledgers.set(label, openOperatorLedger(dir, label, limits.cycleFloor[label] ?? 0, network));
    }
    return makeClient({ operators: selected, limits }, ledgers, { transport });
  } catch (e) {
    for (const a of acquired) releaseLock(a.dir, a.op); // ROLLBACK: release with unlink, never an appended `unlocked` line
    throw e;
  }
}
