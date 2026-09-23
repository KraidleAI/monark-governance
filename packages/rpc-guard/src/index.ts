// MONARK @monark/rpc-guard - PUBLIC API (the sole `exports` entry: package.json exports["."] = ./src/index.ts).
// A deep import (`@monark/rpc-guard/src/client`) is refused by Node with ERR_PACKAGE_PATH_NOT_EXPORTED (T3). The
// SURFACE IS DELIBERATELY MINIMAL (C-V-2): the ONLY path to a paid call is `openGuardedClient` (meter + commit +
// durable per-operator ledger + lock). `makeClient`, `resolveOperators`, `resolveConfig`, `InMemorySink`,
// `openOperatorLedger`, `acquireLock`, `runUnlock` are NOT exported - tests reach them by relative import. The closed
// export set is asserted by exports.test.ts (T2). No symbol returns/accepts an endpoint URL.
export { openGuardedClient } from "./guarded.ts";
export { BudgetExceededError, TransportError, RpcError } from "./errors.ts";
// GARDE-HELIUS-2b C-4: the SINGLE-SOURCE error vocabulary. apps/sentinel/src/ukemi/rpc2.ts IMPORTS these (the
// apps -> packages direction is licit) and keeps NO second regex; the closed-vocabulary hint (D6) is built from the
// SAME tokens, so `predicate(hint) === predicate(body)` holds and the recorder's range-split can never drift.
export { isResultLimit, isPlanLimited, isRevertText, isRpcRevert, closedHint, ERROR_HINT_TOKENS } from "./classify.ts";
// UKEMI-REVERT-1: the ADDITIVE bare-revert class (isRpcRevert unchanged); rpc2.ts quorum2 pairs a PAID bare revert with a
// KEYLESS bare witness. A classifier only - NOT a paid path (no symbol returns/accepts an endpoint URL).
export { isBareRevert } from "./classify.ts";
export { runReconcile } from "./reconcile.ts";
export { runCli } from "./cli.ts";
export { verifyCycleLedger } from "./ledger.ts";
export { heliusCredits, HELIUS_TARIFF_VERSION, chainstackRu, CHAINSTACK_TARIFF_VERSION } from "./tariff.ts";
export { HELIUS_CYCLE_CAP_CREDITS, CHAINSTACK_CYCLE_CAP_RU, ETH_CALL_KEYLESS_LABELS, GET_LOGS_KEYLESS_LABELS } from "./transport.ts";
// GARDE-HELIUS-1b-0 (D-8 / C-3c): the closed Bell-Solana method table + a construction-time --method-caps coverage
// check the Bell client calls before a course opens (apps -> packages direction is licit; migrated at 1b-ii).
export { BELL_SOLANA_METHODS, assertMethodCapsCover } from "./bell-methods.ts";
// Types only (erased at runtime; absent from the closed VALUE export set).
export type { OperatorLabel, Transport, OperatorClass, AttemptRecord, Outcome, RunLimits, ClientConfig, BudgetedClient } from "./client.ts";
export type { TransportOpts, NetworkLabel } from "./transport.ts";
export type { CycleLedger, CycleLedgerEntry } from "./ledger.ts";
export type { Snapshot, Verdict, ReconcileResult, ReconcileMode } from "./reconcile.ts";
export type { CliDeps, CliResult } from "./cli.ts";
