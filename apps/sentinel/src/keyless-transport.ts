// SENTINEL — off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// NARABI-OPS-1d (route alpha, checkpoint-1 C-9): the KEYLESS raw-fetch transport for the daily job's public ETH
// pool. The PAID leg (the single metered operator) is ledgered/capped through @monark/rpc-guard — run.ts
// dispatches the pool's calls by endpoint (the paid label -> the guarded client; a public URL -> keylessCall
// here). The public URLs carry NO secret, so this module reads NO endpoint key and never prints a URL past its
// redacted ORIGIN (C-1 calque of rpc.ts:redactEndpoint). It is the SECOND allowlisted fetch site of the sentinel
// (the fetch_only_inside_client grep allowlists it, retraction trigger = "the keyless pool moves under the guard",
// route beta). It is a TOP-LEVEL module so sentinelSha (run.ts:readdirSync of the top-level *.ts) witnesses it (M-11);
// a sub-folder module would be missed by that non-recursive provenance sha.
import { redactEndpoint } from "./rpc.ts";
import type { RpcCall } from "./rpc.ts";

/** Per-attempt timeout for a keyless public endpoint. Pinned to 20 s = the frozen rpc.ts:defaultCall deadline
 *  (M-10): the daily-run timeout arithmetic of ADR-NARABI-OPS-1c ("N endpoints x 20 s") is preserved verbatim,
 *  and the guarded paid leg is opened with the SAME timeoutMs (run.ts) so no endpoint changes its deadline. */
export const KEYLESS_TIMEOUT_MS = 20_000;

/** One JSON-RPC round-trip to a NAMED keyless public endpoint. A byte-for-byte behavioural calque of the frozen
 *  rpc.ts:defaultCall (its dead twin, deleted from rpc.ts at the -1d rebase once the U-4b freeze lifts): same
 *  request shape, same result/error unwrap, same host-only error string, so makeRpcPool's map fns are unchanged.
 *  The pool INJECTS this as its `call` for public URLs; the paid label is routed away BEFORE it reaches here. */
export const keylessCall: RpcCall = async (url, method, params) => {
  const ctl = new AbortController();
  const to = setTimeout(() => { ctl.abort(); }, KEYLESS_TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${String(res.status)} ${redactEndpoint(url)}`); // C-1: host only, never a key-bearing path
    const json = (await res.json()) as { result?: unknown; error?: { message?: string } };
    if (json.error) throw new Error(json.error.message ?? "rpc error");
    return json.result;
  } finally {
    clearTimeout(to);
  }
};
