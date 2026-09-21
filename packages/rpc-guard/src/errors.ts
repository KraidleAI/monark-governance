// MONARK rpc-guard - the CANONICAL budget-stop error. A single class, EXPORTED from this package and shared by
// every consumer, so `instanceof BudgetExceededError` stays true across the package boundary (C-13). A NEW class
// per consumer would let a stop be caught as a transport fault (fail-open, typecheck-green); the guard is only
// load-bearing if there is exactly ONE class. Calque of apps/bell/src/quorum.ts:24 (byte-identical shape).
//
// It is NOT a transport fault: quorum2 / withRetry / withUniverseRetry re-throw it immediately (never benched as
// a {provider,status}) so the run STOPS (exit != 0), never presenting a budget-truncated pool as complete.
export class BudgetExceededError extends Error {}

// The CANONICAL, TYPED transport fault (GARDE-HELIUS-2 C-V-2). Every one of the four failure paths of a paid call -
// network/timeout/abort, HTTP non-ok, non-JSON body, and a JSON-RPC error at HTTP 200 - throws THIS (never resolves
// `undefined`, which two errored providers would read as a concordant value). It carries the CODE (HTTP status OR
// JSON-RPC error code) so a downstream quorum can tell a rate-limit / server fault from an on-chain revert, and its
// `.name` names the path; the message is SCRUBBED of every URL/key (the endpoint carries the paid key). Distinct from
// BudgetExceededError: a transport fault is benched by the caller's quorum, a budget stop is fatal.
export class TransportError extends Error {
  readonly op: string;
  readonly code: number | undefined;
  constructor(op: string, message: string, name: string, code: number | undefined) {
    super(message);
    this.name = name; // "AbortError" | "TypeError" | "HttpError" | "NonJsonBody" | "RpcError" | ...
    this.op = op;
    this.code = code;
  }
}
