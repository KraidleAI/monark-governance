// UKEMI (ADR-U1 D4/D6 + hardening 2026-09-19) — LIVE recorder CLI (off-tool, NOT run in CI; a run-guarded main).
// Builds the quorum-2 pool over the measured keyless providers, gates B <= finalized (D7: the finalized tag only,
// never the mutable head), records the full book, and writes the live G1 artifact (book + digest + provenance)
// OUTSIDE the repo. The committed fixture is the reduced subset; the full book at B is this live artifact
// (ADR-U1 D9). Provenance (endpoints, timing, calls, ukemi_sha, per-provider rpc errors) is OUTSIDE the digest.
// Hardening (this lot, replacing the uncommitted G1 §5b wrapper): a BOUNDED transient retry on HTTP 429/5xx and
// network/timeout faults (never infinite), a structured secret-free per-provider error log, and an enumeration
// floor / politeness / retry budget all exposed on the CLI. Usage:
//   node apps/sentinel/src/ukemi/record.ts --cluster susde-usde --block <B> --from-block <F> \
//        --min-interval-ms 350 --retries 3 --backoff-ms 500 --out F:/tmp/u1a-hard/book.json
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { providerOf, type RpcCall } from "../rpc.ts";
import { makeUkemiPool, ETH_CALL_PROVIDERS, GET_LOGS_PROVIDERS, RpcError } from "./rpc2.ts";
import { recordBook } from "./book.ts";
import { clusterById } from "./clusters.ts";

/** A structured, secret-free record of one provider's JSON-RPC / transport error (hardening, ADR-U1 D3/D9).
 *  `provider` is the REGISTRABLE DOMAIN (never the full URL, which could carry a key); `code`/`data` are present
 *  only for a typed JSON-RPC error, `http` only for a non-2xx response. Collected into the run artifact (D9,
 *  never committed) so a run's real per-provider error shapes are auditable against isRpcRevert. */
export interface RpcErrorRecord { provider: string; method: string; http?: number; code?: number; message: string; data?: string; }

export interface DefaultCallOpts {
  retries?: number | undefined;   // bounded transient retries (HTTP 429/5xx, network/timeout). Total attempts = retries+1. NEVER infinite.
  backoffMs?: number | undefined; // base backoff; wait = min(backoffMs * 2**attempt, backoffCapMs) (pass 0 in tests).
  backoffCapMs?: number | undefined; // upper bound on ONE backoff wait (default 8000ms) so 2**attempt cannot explode.
  timeoutMs?: number | undefined; // per-attempt abort (default 30s).
  onRpcError?: ((rec: RpcErrorRecord) => void) | undefined; // structured per-provider error sink.
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Exponential backoff for one retry attempt, upper-bounded so a large attempt count cannot produce an unbounded
 *  wait: min(backoffMs * 2**attempt, capMs). Pure and exported so the ceiling is asserted directly (V-1(c)). */
export function backoffDelay(attempt: number, backoffMs: number, capMs: number): number {
  return Math.min(backoffMs * 2 ** attempt, capMs);
}

/** Build a JSON-RPC round-trip (fetch) with BOUNDED transient retry and a structured error sink. Classification
 *  is unchanged from the raw path: a JSON-RPC `{error:{code,message,data}}` becomes a typed RpcError (the quorum
 *  then tells an EVM revert from a transport fault); a non-2xx / network / timeout is a transport Error. A typed
 *  RpcError is the node's deterministic answer and is NEVER retried; a HTTP 429/5xx or a network/timeout fault is
 *  transient and retried up to `retries` times with exponential backoff, then thrown (the quorum benches it). A
 *  non-2xx body is surfaced in the thrown message so getLogsVia can split a range-too-large HTTP 400. */
export function makeDefaultCall(opts: DefaultCallOpts = {}): RpcCall {
  const maxRetries = Math.max(0, opts.retries ?? 0);
  const backoffMs = opts.backoffMs ?? 500;
  const backoffCapMs = opts.backoffCapMs ?? 8000;
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const onErr = opts.onRpcError;
  return async (url, method, params) => {
    const prov = providerOf(url);
    for (let attempt = 0; ; attempt++) {
      const ctl = new AbortController();
      const to = setTimeout(() => { ctl.abort(); }, timeoutMs);
      let res: Response;
      try {
        res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: ctl.signal });
      } catch (e) {
        clearTimeout(to);
        const message = e instanceof Error ? e.message : String(e);
        if (onErr) onErr({ provider: prov, method, message }); // network / timeout — transport, retryable
        if (attempt < maxRetries) { await sleep(backoffDelay(attempt, backoffMs, backoffCapMs)); continue; }
        throw e instanceof Error ? e : new Error(message);
      }
      clearTimeout(to);
      if (!res.ok) {
        const body = (await res.text().catch(() => "")).replace(/\s+/g, " ").trim().slice(0, 160);
        if (onErr) onErr({ provider: prov, method, http: res.status, message: body });
        if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) { await sleep(backoffDelay(attempt, backoffMs, backoffCapMs)); continue; }
        // Body surfaced so getLogsVia can split a range-too-large HTTP 400; a 4xx other than 429 is not retried.
        throw new Error(`HTTP ${String(res.status)} ${prov}${body ? `: ${body}` : ""}`);
      }
      type JsonRpcResponse = { result?: unknown; error?: { code?: number; message?: string; data?: unknown } };
      const bodyText = await res.text();
      let json: JsonRpcResponse;
      try {
        json = JSON.parse(bodyText) as JsonRpcResponse;
      } catch {
        const snippet = bodyText.replace(/\s+/g, " ").trim().slice(0, 160);
        if (onErr) onErr({ provider: prov, method, http: 200, message: `non-JSON body: ${snippet}` });
        // A non-JSON body from a JSON-RPC endpoint is a mis-route (wrong host / HTML error page), not a transient:
        // retrying the same URL returns the same body, so throw (the quorum benches it). The body stays in the
        // journal entry ONLY — keeping it out of the thrown message so it cannot trip isResultLimit downstream (V-1(d)).
        throw new Error(`HTTP 200 non-JSON ${prov}`);
      }
      if (json.error) {
        const data = typeof json.error.data === "string" ? json.error.data : undefined;
        if (onErr) onErr({ provider: prov, method, code: json.error.code ?? 0, message: json.error.message ?? "rpc error", ...(data !== undefined ? { data } : {}) });
        // A typed JSON-RPC error (EVM revert / method / server error) is deterministic ⇒ classified by the quorum, NOT retried.
        throw new RpcError(json.error.message ?? "rpc error", json.error.code ?? 0, data);
      }
      return json.result;
    }
  };
}

/** The raw default round-trip (no retry): the fetch → RpcError | transport-Error classification path only. Tests
 *  drive THIS instance directly; the live recorder builds a HARDENED instance via makeDefaultCall({retries,...}). */
export const defaultCall: RpcCall = makeDefaultCall();

/** sha256 over the recorder sources ukemi/**.ts (the build witness, ADR-U1 D2/C-6). OUTSIDE the digest. */
export function ukemiSha(dir: string): string {
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts")).sort();
  const h = createHash("sha256");
  for (const f of files) h.update(f + "\0").update(readFileSync(join(dir, f)));
  return h.digest("hex");
}

/** The recorder CLI shape. `block`/`fromBlock` optional; enumeration floor, politeness and the bounded retry
 *  budget are all exposed (ADR-U1 D4 hardening — this is the committed successor to the G1 §5b wrapper). */
export interface UkemiArgs {
  cluster: string;
  block: number | undefined;
  fromBlock: number | undefined;
  minIntervalMs: number;
  retries: number;
  backoffMs: number;
  backoffCapMs: number;
  out: string | undefined;
}

/** Parse the recorder CLI. Non-negative integers only for the numeric flags (fail-closed on a bad value). */
export function parseUkemiArgs(argv: readonly string[]): UkemiArgs {
  const arg = (k: string): string | undefined => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const optInt = (k: string): number | undefined => {
    const v = arg(k); if (v === undefined) return undefined;
    const n = Number(v); if (!Number.isInteger(n) || n < 0) throw new Error(`ukemi/record: ${k} must be a non-negative integer, got '${v}'`);
    return n;
  };
  const reqInt = (k: string, d: number): number => optInt(k) ?? d;
  return {
    cluster: arg("--cluster") ?? "weth",
    block: optInt("--block"),
    fromBlock: optInt("--from-block"),
    minIntervalMs: reqInt("--min-interval-ms", 200),
    retries: reqInt("--retries", 2),
    backoffMs: reqInt("--backoff-ms", 500),
    backoffCapMs: reqInt("--backoff-cap-ms", 8000),
    out: arg("--out"),
  };
}

/** Is THIS module the process entry point (record.ts run directly, not imported)? Compares the canonical file URL
 *  of argv1 to import.meta.url. pathToFileURL percent-encodes and emits the three-slash file:/// form on ALL
 *  platforms; the pre-e8bcfe4 string form (`"file://" + argv1.replace(/\\/g,"/")`) produced a two-slash URL on
 *  Windows (silent CLI no-op, measured 2026-09-19) AND never percent-encodes a path with a space on POSIX, so it
 *  was cross-platform wrong (V-1(a), probes/o1-crossplatform.mjs). Undefined argv1 (no script arg) ⇒ false. */
export function isMainModule(argv1: string | undefined, metaUrl: string): boolean {
  return argv1 !== undefined && pathToFileURL(argv1).href === metaUrl;
}

async function main(): Promise<void> {
  const args = parseUkemiArgs(process.argv.slice(2));
  const cluster = clusterById(args.cluster);
  const here = dirname(fileURLToPath(import.meta.url));

  const rpcErrors: RpcErrorRecord[] = [];
  const hardened = makeDefaultCall({ retries: args.retries, backoffMs: args.backoffMs, backoffCapMs: args.backoffCapMs, onRpcError: (r) => { rpcErrors.push(r); } });
  let calls = 0;
  const call: RpcCall = (u, m, p) => { calls++; return hardened(u, m, p); };
  const pool = makeUkemiPool({ call, ethCallProviders: ETH_CALL_PROVIDERS, getLogsProviders: GET_LOGS_PROVIDERS, minIntervalMs: args.minIntervalMs });

  const fin = await pool.finalized();
  const block = args.block ?? fin.block;
  if (block > fin.block) throw new Error(`ukemi/record: B=${String(block)} > finalized ${String(fin.block)} (look-ahead forbidden, ADR-U1 D7)`);

  const t0 = Date.now();
  const res = await recordBook(cluster, block, pool, "GENESIS", { fromBlock: args.fromBlock });
  const seconds = (Date.now() - t0) / 1000;

  const provenance = {
    model: "claude-opus-4-8[1m]", recorded_at_utc: new Date().toISOString(),
    endpoints: { eth_call: ETH_CALL_PROVIDERS, eth_getLogs: GET_LOGS_PROVIDERS }, quorum: 2,
    params: { cluster: cluster.id, block, from_block: args.fromBlock ?? null, min_interval_ms: args.minIntervalMs, retries: args.retries, backoff_ms: args.backoffMs, backoff_cap_ms: args.backoffCapMs },
    calls, seconds, finalized_block: fin.block, ukemi_sha: ukemiSha(here),
    counts: res.counts, holders_digest: res.holders_digest, book_digest: res.book_digest,
    hf_findings: res.hf_findings, timeline: res.timeline,
    rpc_error_count: rpcErrors.length, rpc_errors: rpcErrors,
  };
  const out = args.out ?? join(tmpdir(), `ukemi-book-${cluster.id}-${String(block)}.json`);
  writeFileSync(out, JSON.stringify({ provenance, book: res.book }, null, 2));
  process.stdout.write(`ukemi/record cluster=${cluster.id} B=${String(block)} book_digest=${res.book_digest}\n` +
    `  holders=${String(res.counts.holders)} at_risk=${String(res.counts.at_risk)} eligible=${String(res.counts.eligible)} ` +
    `excluded={coll_off:${String(res.counts.excluded_collateral_off)},no_debt:${String(res.counts.excluded_no_debt)},zero_bal:${String(res.counts.excluded_zero_balance)}}\n` +
    `  calls=${String(calls)} rpc_errors=${String(rpcErrors.length)} seconds=${seconds.toFixed(1)} ukemi_sha=${provenance.ukemi_sha}\n  out=${out}\n`);
}

// Run-guard: run main() only when record.ts is the process entry point (see isMainModule — cross-platform, the
// pre-e8bcfe4 string form was a silent no-op on Windows and mis-encoded spaced paths on POSIX).
if (isMainModule(process.argv[1], import.meta.url)) {
  main().catch((e: unknown) => { process.stderr.write(`FATAL ${e instanceof Error ? e.message : String(e)}\n`); process.exit(1); });
}
