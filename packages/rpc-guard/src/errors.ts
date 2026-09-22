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
//
// GARDE-HELIUS-2b (D6 / C-1 / C-3): three more fields, all set at the transport (never guessed downstream):
//   - `detail`: the hint ALONE (no preamble/code), for the recorder's on-disk rpc_errors journal (C-3). For a PAID
//     operator this is the CLOSED-vocabulary hint (never a raw body byte); for keyless it is the redacted body.
//   - `unit`: the operator's metering unit ("credits" | "ru" | "keyless"), so `isRpcRevert` can source paid-ness
//     WITHOUT guessing (C-1(c): a PAID revert with no `.data` is benched, never concorded on a closed hint).
//   - `data`: the JSON-RPC revert data, VALIDATED hex (`/^0x[0-9a-fA-F]*$/`, bounded, never the key's hex) or
//     undefined (C-1(c)). Present on the RpcError path only.
export class TransportError extends Error {
  readonly op: string;
  readonly code: number | undefined;
  readonly detail: string;
  readonly unit: string;
  readonly data: string | undefined;
  // GARDE-HELIUS-1b-0 (D-9 / C-3b): the parsed Retry-After (ms) a rate-limited (429) or busy (503) response asked
  // for, so the CALLER'S retry (never the transport, which makes ONE attempt) can honor the server's backoff. It is
  // set at the transport from the header (parseRetryAfterMs) and is `undefined` for a status that carries no header
  // AND, STRUCTURALLY, for a fatal 403 (the transport's explicit `res.status === 403` guard forces `undefined` even
  // when a 403 body DOES carry a Retry-After header - C-2 fold). The caller keys retry on `.code` + `.retryAfterMs`; a
  // followed redirect / retried 403 is impossible because a 3xx surfaces as name "RedirectBlocked" and a 403's
  // retryAfterMs is undefined BY CONSTRUCTION, not by luck of a missing header.
  readonly retryAfterMs: number | undefined;
  constructor(op: string, message: string, name: string, code: number | undefined, detail = "", unit = "keyless", data: string | undefined = undefined, retryAfterMs: number | undefined = undefined) {
    super(message);
    this.name = name; // "AbortError" | "TypeError" | "HttpError" | "RedirectBlocked" | "NonJsonBody" | "RpcError" | ...
    this.op = op;
    this.code = code;
    this.detail = detail;
    this.unit = unit;
    this.data = data;
    this.retryAfterMs = retryAfterMs;
  }
}

// The CANONICAL JSON-RPC error, GARDE-HELIUS-2b C-1(a). It EXTENDS TransportError (so it is one of the four typed
// transport faults, benched or retried by the same `instanceof TransportError` classifier), but it is ALSO the ONE
// class the recorder's quorum tests with `instanceof RpcError` to tell an EVM revert from a rate/transport fault. A
// SEPARATE class per boundary (rpc2.ts had its own) makes `instanceof` fail across the package edge, so every revert
// benches and ConcordantRevertError never forms; the guard is only load-bearing with exactly ONE class - rpc2.ts
// RE-EXPORTS this one (calque of BudgetExceededError, D5). It carries the numeric JSON-RPC `code` and the VALIDATED
// revert `.data` (hex or undefined) the quorum compares first.
export class RpcError extends TransportError {
  constructor(op: string, message: string, code: number, detail = "", unit = "keyless", data: string | undefined = undefined) {
    super(op, message, "RpcError", code, detail, unit, data);
    this.name = "RpcError";
  }
}
