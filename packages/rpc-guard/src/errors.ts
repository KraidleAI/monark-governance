// MONARK rpc-guard - the CANONICAL budget-stop error. A single class, EXPORTED from this package and shared by
// every consumer, so `instanceof BudgetExceededError` stays true across the package boundary (C-13). A NEW class
// per consumer would let a stop be caught as a transport fault (fail-open, typecheck-green); the guard is only
// load-bearing if there is exactly ONE class. Calque of apps/bell/src/quorum.ts:24 (byte-identical shape).
//
// It is NOT a transport fault: quorum2 / withRetry / withUniverseRetry re-throw it immediately (never benched as
// a {provider,status}) so the run STOPS (exit != 0), never presenting a budget-truncated pool as complete.
export class BudgetExceededError extends Error {}
