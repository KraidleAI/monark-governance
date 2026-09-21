// MONARK Bell — Solana quorum-2 (ADR-T1aii C-1/C-2, C-9, ADR-U1 D3 reused). A value-bearing read is trusted
// only when TWO DISTINCT OPERATORS (by operatorOf, C-9 — NOT providerOf: Chainstack serves the same account
// on chainstack.com AND p2pify.com, which providerOf would miscount as two) concord on the KEY of the read.
// providerOf stays the LOGGING form (a bare host, never a key). The archival set is measured
// (C-1): Helius + `api.mainnet-beta.solana.com` (publicnode retired — it serves no old bodies, "first
// available block 447832277"). This is a DECLARED CALQUE of the sentinel quorum2
// (apps/sentinel/src/ukemi/rpc2.ts): it imports ONLY providerOf (C-2 (b), the closure quorum2 is not
// exported and belongs to another lot), and re-expresses the ok / revert / transport handling here rather
// than copying a file owned by that lot.
//
// KEY HYGIENE (C-10, MAST secret-leak): a Helius endpoint URL carries `?api-key=<uuid>`. A transport fault
// therefore records ONLY {provider, status} (providerOf + a sanitized status token) and NEVER the error
// message. rpc2.ts:136 folds `lastErr.message` into NoQuorumError and rpc.ts:84 appends the url to the HTTP
// error -- NEITHER motif is reproduced here. NoQuorumError / QuorumDisagreementError name providerOf only.
import { providerOf } from "../../sentinel/src/rpc.ts";
import { operatorOf } from "./operators.ts";
import { createHash } from "node:crypto";

export type JsonRpcCall = (url: string, method: string, params: readonly unknown[]) => Promise<unknown>;

/** The `--max-calls` RPC budget was reached (C-11 fail-closed). It is NOT a transport fault: quorum2 and the
 *  collector re-throw it immediately so it can never be swallowed as a `{provider,status}` fault and the run
 *  stops (exit 1), never presenting a budget-truncated pool as complete. */
export class BudgetExceededError extends Error {}
/** Fewer than two distinct providers answered a read — the caller names it `no_quorum` and abstains. */
export class NoQuorumError extends Error {}
/** Two distinct providers answered but DISAGREED on the read key — fail-closed (a real divergence). */
export class QuorumDisagreementError extends Error {}
/** >= 2 distinct providers returned the SAME deterministic node error (e.g. account not found) — an on-chain
 *  fact, not a fault. The caller tolerates it only where an absent datum is meaningful; else it abstains. */
export class ConcordantRevertError extends Error {}

/** A typed JSON-RPC error (node returned {error:{code,message}}). The code lets the quorum tell a
 *  deterministic node error (identical across honest providers) from a transport/rate fault. The message is
 *  used for classification ONLY and is never surfaced by the quorum (key hygiene, C-10). */
export class SolRpcError extends Error {
  readonly code: number;
  constructor(message: string, code: number) { super(message); this.name = "SolRpcError"; this.code = code; }
}

/** Is this a deterministic node error (concordant across honest providers), not a transport/rate fault?
 *  -32005 (node is behind / rate), -32004 (block/slot not available yet) and -32603 (internal) are transport-
 *  like and bench; other codes (invalid params, method not found, account-specific) are deterministic and
 *  count toward the quorum. Explicit, testable criterion (ADR-U1 D3 amendment, Solana flavour). */
export function isSolRevert(e: unknown): e is SolRpcError {
  return e instanceof SolRpcError && e.code !== -32005 && e.code !== -32004 && e.code !== -32603;
}

/** A SANITIZED status token for the journal: an HTTP code, "timeout", an rpc code, or "transport" — NEVER
 *  the raw message. Even if an injected call throws `HTTP 429 https://x/?api-key=<uuid>`, only "HTTP 429" is
 *  extracted; a url-only message yields "transport". This is the load-bearing scrub of C-10. */
export function statusOf(e: unknown): string {
  if (e instanceof SolRpcError) return "rpc " + String(e.code);
  const m = e instanceof Error ? e.message : String(e);
  const http = /\bHTTP\s+(\d{3})\b/.exec(m);
  if (http) return "HTTP " + String(http[1]);
  if (/abort|timeout/i.test(m)) return "timeout";
  return "transport";
}

/** A transport fault for the journal — providerOf + a sanitized status token. Never a url, never a message. */
export interface TransportFault { readonly provider: string; readonly status: string }

interface Outcome<T> { readonly prov: string; readonly kind: "ok" | "revert"; readonly key: string; readonly val?: T }

/** Two DISTINCT providers (by providerOf) whose OUTCOMES concord. An outcome is a success ("ok", keyed by
 *  keyOf) or a deterministic node error ("revert", keyed by its code). Transport faults are pushed to
 *  `faults` ({provider,status}) and benched. Two concordant ok ⇒ the value; two concordant reverts ⇒
 *  ConcordantRevertError; different keys ⇒ QuorumDisagreementError; fewer than two outcomes ⇒ NoQuorumError.
 *  Deterministic: iterates providers in order, no randomness (so replay is bit-identical). */
export async function quorum2<T>(
  label: string,
  providers: readonly string[],
  call: JsonRpcCall,
  fetchOne: (call: JsonRpcCall, url: string) => Promise<T>,
  keyOf: (v: T) => string,
  faults: TransportFault[] = [],
): Promise<T> {
  const got: Array<Outcome<T>> = [];
  const seen = new Set<string>();
  for (let i = 0; i < providers.length && got.length < 2; i++) {
    const url = providers[i];
    // distinctness is by OPERATOR (C-9): two Chainstack hosts (chainstack.com / p2pify.com) count as ONE.
    if (url === undefined || seen.has(operatorOf(url))) continue;
    try {
      const val = await fetchOne(call, url);
      got.push({ prov: providerOf(url), kind: "ok", key: "ok:" + keyOf(val), val });
      seen.add(operatorOf(url));
    } catch (e) {
      if (e instanceof BudgetExceededError) throw e; // C-11: never swallowed as a fault
      if (isSolRevert(e)) {
        got.push({ prov: providerOf(url), kind: "revert", key: "revert:" + String(e.code) });
        seen.add(operatorOf(url));
      } else {
        faults.push({ provider: providerOf(url), status: statusOf(e) });
      }
    }
  }
  const [a, b] = got;
  if (a === undefined || b === undefined) throw new NoQuorumError(`${label}: quorum needs 2 distinct providers`);
  if (a.key !== b.key) throw new QuorumDisagreementError(`${label}: providers ${a.prov}/${b.prov} disagree`);
  if (a.kind === "revert") throw new ConcordantRevertError(`${label}: concordant node error across ${a.prov}/${b.prov}`);
  return a.val as T;
}

const retrySleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Bounded retry on a transient transport signal (HTTP 5xx / 429 / timeout, OR the `transport` catch-all — a
 *  connection reset / `fetch failed` that statusOf cannot code, exactly the transient network fault a retry exists
 *  for), deterministic backoff 400·(i+1) ms. A BudgetExceededError is NEVER retried (re-thrown at once); a
 *  deterministic node error or an HTTP 4xx≠429 is re-thrown immediately. (A thrown code bug also classifies as
 *  `transport`, so it backs off `tries` times then propagates — the plan's declared conservative direction; a real
 *  process kill never throws, so it is out of scope.) `onRetry` fires once per retry actually taken (so a caller can
 *  meter retries_by_method); the backoff `sleep` is injectable (offline tests pass a no-op). Lives here (not in
 *  collect) so the crosscheck CLI can share it without a collect↔rebase-crosscheck import cycle (fact 10). */
export async function withRetry<T>(fn: () => Promise<T>, opts: { tries?: number; onRetry?: () => void; sleep?: (ms: number) => Promise<void> } = {}): Promise<T> {
  const tries = opts.tries ?? 4, slp = opts.sleep ?? retrySleep;
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) {
      if (e instanceof BudgetExceededError) throw e;
      last = e;
      if (!/HTTP 5|HTTP 429|timeout|transport/.test(statusOf(e))) throw e;
      if (i < tries - 1) { opts.onRetry?.(); await slp(400 * (i + 1)); } // fact 9: skip the wasted sleep after the final attempt
    }
  }
  throw last instanceof Error ? last : new Error("retry exhausted");
}

/** Canonical key of a SIGNATURE SET for the archival concordance (C-1, motif logsKey): sha256 of the sorted
 *  UNIQUE signatures. Two providers concord on the full enumeration iff these match — order-independent. */
export function signaturesSetKey(signatures: readonly string[]): string {
  const sorted = [...new Set(signatures)].sort();
  return createHash("sha256").update(sorted.join("\n")).digest("hex");
}
