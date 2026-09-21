// MONARK @monark/rpc-guard - PUBLIC API (the sole `exports` entry: package.json exports["."] = ./src/index.ts).
// A deep import (`@monark/rpc-guard/src/client`) is refused by Node with ERR_PACKAGE_PATH_NOT_EXPORTED (T3). The
// SURFACE IS DELIBERATELY MINIMAL (C-V-2): the ONLY path to a paid call is `openGuardedClient` (meter + commit +
// durable per-operator ledger + lock). `makeClient`, `resolveOperators`, `resolveConfig`, `InMemorySink`,
// `openOperatorLedger`, `acquireLock`, `runUnlock` are NOT exported - tests reach them by relative import. The closed
// export set is asserted by exports.test.ts (T2). No symbol returns/accepts an endpoint URL.
export { openGuardedClient } from "./guarded.ts";
export { BudgetExceededError } from "./errors.ts";
export { runReconcile } from "./reconcile.ts";
export { runCli } from "./cli.ts";
export { verifyCycleLedger } from "./ledger.ts";
export { heliusCredits, HELIUS_TARIFF_VERSION } from "./tariff.ts";
export { HELIUS_CYCLE_CAP_CREDITS, CHAINSTACK_CYCLE_CAP_RU } from "./transport.ts";
// Types only (erased at runtime; absent from the closed VALUE export set).
export type { OperatorLabel, Transport, OperatorClass, AttemptRecord, Outcome, RunLimits, ClientConfig, BudgetedClient } from "./client.ts";
export type { CycleLedger, CycleLedgerEntry } from "./ledger.ts";
export type { Snapshot, Verdict, ReconcileResult } from "./reconcile.ts";
export type { CliDeps, CliResult } from "./cli.ts";
