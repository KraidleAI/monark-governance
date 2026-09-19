// MONARK Bell — Solana JSON-RPC + first-hand swap extraction (ADR-B0 D2 i/iii). Calque of the sentinel
// motif (apps/sentinel/src/rpc.ts): the low-level `call` is INJECTED, so CI runs offline against fixtures
// (no network in this module) and the SAME code path runs live or against an archival provider.
//
// ENDPOINTS ARE ENV-DRIVEN (`BELL_SOLANA_RPC`, comma-separated). The founding jul-oct 2025 measurement
// (D7 T-1a) needs archival depth the public pool cannot serve (spike §0: public bodies pruned to ~1-2 d,
// or enumeration rate-limited ~1.4M sigs/pool). Once `HELIUS_API_KEY` exists, the founding run is ONE
// command: `BELL_SOLANA_RPC=<helius-url> node ... ` — same digest, same code. No public key is logged:
// callers pass Helius as an env URL; this module never prints a URL that could carry `?api-key=`.
import { readFileSync } from "node:fs";
import type { PoolRef } from "./pools.ts";

/** One JSON-RPC round-trip to a NAMED endpoint. Injected in tests; the default hits the public pool. */
export type JsonRpcCall = (url: string, method: string, params: readonly unknown[]) => Promise<unknown>;

/** Public read-only Solana endpoints (spike §0). mainnet-beta is the SOLE default (publicnode retired: it
 *  prunes old bodies) — so a read with no 2nd provider via BELL_SOLANA_RPC is no_quorum, fail-closed (C-1a). */
export const PUBLIC_SOLANA: readonly string[] = [
  "https://api.mainnet-beta.solana.com",
];
export function solanaEndpoints(env: NodeJS.ProcessEnv = process.env): readonly string[] {
  const raw = (env.BELL_SOLANA_RPC ?? "").trim();
  return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : PUBLIC_SOLANA;
}

/** A first-hand fill: the SIGNED delta of a declared pool's two vaults in one transaction. `baseDelta`
 *  is the tokenized security (smallest units), `quoteDelta` the numeraire. Price = |quote|/|base| with
 *  the decimal adjustment. Dedup key = `signature` (Jupiter routes appear once per pool it touches). */
export interface SwapFill {
  readonly signature: string;
  readonly blockTimeUtcMs: number;
  readonly baseDelta: bigint;
  readonly quoteDelta: bigint;
}

const asObj = (x: unknown): Record<string, unknown> => (x && typeof x === "object" ? (x as Record<string, unknown>) : {});
const asArr = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);

/** default network call (fetch). Bearer/api-key never appear here: the URL is opaque to this module. */
export const fetchCall: JsonRpcCall = async (url, method, params) => {
  const ctl = new AbortController();
  const to = setTimeout(() => { ctl.abort(); }, 30_000);
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${String(res.status)}`);
    const json = asObj(await res.json());
    if (json.error) throw new Error(asObj(json.error).message ? String(asObj(json.error).message) : "rpc error");
    return json.result;
  } finally { clearTimeout(to); }
};

// Solana introduced versioned transactions beyond v0 (measured 2026-09-19: mainnet-beta AND publicnode
// return `version: 1` for current pool swaps, and reject a request with maxSupportedTransactionVersion 0).
// This must track the network's highest deployed version; bump = an ADR line.
export const MAX_TX_VERSION = 2;

export interface SigInfo { readonly signature: string; readonly blockTime: number | null; readonly err: unknown }
/** Paginate getSignaturesForAddress backward (newest→oldest) until `untilBlockTime` (Unix s) or empty.
 *  Serial by construction (`before` chains). Returns signatures with err/blockTime for downstream filtering. */
export async function signaturesUntil(call: JsonRpcCall, url: string, address: string, untilBlockTime: number,
  opts: { readonly maxPages?: number } = {}): Promise<SigInfo[]> {
  const out: SigInfo[] = [];
  let before: string | undefined;
  const maxPages = opts.maxPages ?? 5000;
  for (let page = 0; page < maxPages; page++) {
    const params: readonly unknown[] = [address, before ? { limit: 1000, before } : { limit: 1000 }];
    const arr = asArr(await call(url, "getSignaturesForAddress", params));
    if (arr.length === 0) break;
    for (const r of arr) {
      const o = asObj(r);
      out.push({ signature: String(o.signature), blockTime: typeof o.blockTime === "number" ? o.blockTime : null, err: o.err });
    }
    const last = asObj(arr[arr.length - 1]);
    before = String(last.signature);
    const bt = typeof last.blockTime === "number" ? last.blockTime : 0;
    if (bt && bt < untilBlockTime) break;
    if (arr.length < 1000) break;
  }
  return out;
}

/** Full ordered account list of a (possibly v0) transaction: static keys ++ loaded writable ++ readonly,
 *  so a token-balance `accountIndex` resolves to a pubkey. jsonParsed static keys are {pubkey}. */
function accountKeysOf(tx: Record<string, unknown>): string[] {
  const msg = asObj(asObj(tx.transaction).message);
  const stat = asArr(msg.accountKeys).map((k) => (typeof k === "string" ? k : String(asObj(k).pubkey)));
  const loaded = asObj(asObj(tx.meta).loadedAddresses);
  return [...stat, ...asArr(loaded.writable).map(String), ...asArr(loaded.readonly).map(String)];
}
/** Extract THIS pool's swap contribution from a transaction: the signed (post−pre) balance change of the
 *  exact declared vault accounts. Generic across AMM families (no program decoding); Jupiter multi-hop is
 *  excluded because only OUR vaults are summed. Returns null if the tx failed or does not touch the pool. */
export function extractPoolSwap(sig: string, blockTimeSec: number, tx: unknown, pool: PoolRef): SwapFill | null {
  const t = asObj(tx);
  const meta = asObj(t.meta);
  if (meta.err != null) return null;
  const keys = accountKeysOf(t);
  const wantBase = pool.vaultBase, wantQuote = pool.vaultQuote;
  if (!wantBase || !wantQuote) return null;
  const bal = (side: "pre" | "post"): Map<string, bigint> => {
    const m = new Map<string, bigint>();
    for (const b of asArr(meta[`${side}TokenBalances`])) {
      const o = asObj(b);
      const acct = keys[Number(o.accountIndex)];
      if (acct === undefined) continue;
      const amt = asObj(o.uiTokenAmount).amount;
      if (acct === wantBase || acct === wantQuote) m.set(acct, BigInt(typeof amt === "string" ? amt : "0"));
    }
    return m;
  };
  const pre = bal("pre"), post = bal("post");
  const delta = (acct: string): bigint => (post.get(acct) ?? 0n) - (pre.get(acct) ?? 0n);
  const baseDelta = delta(wantBase), quoteDelta = delta(wantQuote);
  if (baseDelta === 0n || quoteDelta === 0n) return null; // not a swap through this pool
  return { signature: sig, blockTimeUtcMs: blockTimeSec * 1000, baseDelta, quoteDelta };
}

/** Fetch + extract swaps for a pool over the given signatures, DEDUPED by signature (a signature is
 *  counted once even if listed by several address indexes — mutant `bell_volume_dedup_by_signature`). */
export async function swapsForPool(call: JsonRpcCall, url: string, sigs: readonly SigInfo[], pool: PoolRef): Promise<SwapFill[]> {
  const seen = new Set<string>();
  const out: SwapFill[] = [];
  for (const s of sigs) {
    if (s.err != null || s.blockTime == null || seen.has(s.signature)) continue;
    seen.add(s.signature);
    const tx = await call(url, "getTransaction", [s.signature, { maxSupportedTransactionVersion: MAX_TX_VERSION, encoding: "jsonParsed" }]);
    const fill = extractPoolSwap(s.signature, s.blockTime, tx, pool);
    if (fill) out.push(fill);
  }
  return out;
}

/** Load a recorded-transaction fixture (offline oracle): a map signature → getTransaction result. */
export function loadTxFixture(path: string): Record<string, unknown> {
  return asObj(JSON.parse(readFileSync(path, "utf8")));
}
