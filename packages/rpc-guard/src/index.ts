// MONARK @monark/rpc-guard - PUBLIC API (the sole `exports` entry: package.json exports["."] = ./src/index.ts).
// A deep import (`@monark/rpc-guard/src/client`) is refused by Node with ERR_PACKAGE_PATH_NOT_EXPORTED (T3). No
// symbol here returns or accepts an endpoint URL: the surface is LABELS, credits, ledgers and caps only (T2).
export { BudgetExceededError } from "./errors.ts";
export { makeClient, InMemorySink } from "./client.ts";
export type {
  OperatorLabel, Transport, OperatorClass, AttemptRecord, Outcome,
  RunLimits, ClientConfig, LedgerSink, BudgetedClient,
} from "./client.ts";
export { heliusCredits, HELIUS_TARIFF_VERSION } from "./tariff.ts";
export {
  resolveOperators, resolveConfig, operatorLabels,
  HELIUS_CYCLE_CAP_CREDITS, CHAINSTACK_CYCLE_CAP_RU,
} from "./transport.ts";
export type { Resolved } from "./transport.ts";
// 1a-ii: durable cycle ledger, exclusive lock, served reconcile/unlock CLI.
export { openCycleLedger, verifyCycleLedger, chainCycleEntry, ledgerHeadSha, sha256Hex, LEDGER_GENESIS } from "./ledger.ts";
export type { CycleLedger, CycleLedgerEntry } from "./ledger.ts";
export { acquireLock, runUnlock, LockHeldError } from "./lock.ts";
export { runReconcile } from "./reconcile.ts";
export type { Snapshot, Verdict, ReconcileResult } from "./reconcile.ts";
export { runCli } from "./cli.ts";
export type { CliDeps, CliResult } from "./cli.ts";
