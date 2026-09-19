// MONARK Bell — Ethereum leg (ADR-B0 D2 i, ADR-T1aii D1 lot -a): Uniswap v3 TSLAon/USDC swaps. The fills
// are read FIRST-HAND from the pool's `Swap` events through `makeUkemiPool.getLogsRange` imported AS-IS from
// the sentinel (C-2: the quorum-2 getLogs of U-1a-hard, reused not copied). Each Swap carries the SIGNED
// int256 amount0/amount1; VWAP is Σ|amount0(quote)| / Σ|amount1(base)| adjusted for decimals (the same
// gap.ts vwapDecimal path once mapped to a SwapFill), so a buy and a sell both add their magnitude.
//
// GROUNDED FIRST-HAND (2026-09-19, public rpc.mevblocker.io, no key):
//  · Uniswap v3 `Swap` topic0 = 0xc42079f9...cca67 (2079 occurrences read in the USDC/WETH 0.05% pool; the
//    event ABI is identical across every v3 pool).
//  · The TSLAon/USDC pool 0x31227b50... token0()=USDC (0xa0b869..eb48, 6 dec) = QUOTE, token1()=TSLAon
//    (0xf6b111..103f, 18 dec) = BASE. A real swap decoded to amount0=-11300145 (USDC out), amount1=
//    +27878301563019328 (TSLAon in) => ~405.34 USDC/TSLAon (a plausible TSLA price).
//
// KEY HYGIENE (C-10): the Ethereum call throws `HTTP <status>` with NO url (record.ts:22 appends the url and
// rpc2.ts:136 folds the message — since this call carries no url, the folded message stays key-free).
import { makeUkemiPool, GET_LOGS_PROVIDERS, RpcError, type LogEntry } from "../../sentinel/src/ukemi/rpc2.ts";
import type { RpcCall } from "../../sentinel/src/rpc.ts";
import type { PoolRef } from "./pools.ts";
import { vwapDecimal, type SessionGap } from "./gap.ts";
import { sessionGap } from "./gap.ts";
import type { SwapFill } from "./rpc.ts";

/** Uniswap v3 `Swap(address,address,int256,int256,uint160,uint128,int24)` topic0 — grounded first-hand. */
export const UNISWAP_V3_SWAP_TOPIC = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";

const TWO_255 = 1n << 255n;
const TWO_256 = 1n << 256n;
/** Decode a 32-byte word as a signed two's-complement int256. */
function i256(word: string): bigint {
  const v = BigInt("0x" + word);
  return v >= TWO_255 ? v - TWO_256 : v;
}

/** Decode a v3 Swap log's data into the signed (amount0, amount1). data = 5 words; only the first two carry
 *  the token amounts (amount0, amount1); sqrtPriceX96/liquidity/tick follow and are not needed for VWAP. */
export function decodeV3Swap(dataHex: string): { readonly amount0: bigint; readonly amount1: bigint } {
  const d = dataHex.startsWith("0x") ? dataHex.slice(2) : dataHex;
  if (d.length < 128) throw new Error("bell/ethereum: Swap data shorter than two words");
  return { amount0: i256(d.slice(0, 64)), amount1: i256(d.slice(64, 128)) };
}

/** Map a v3 Swap log to a first-hand SwapFill for the TSLAon/USDC pool: base = token1 (TSLAon), quote =
 *  token0 (USDC). The tx hash is the dedup key (a swap is one log; a route touching the pool once = one fill). */
export function ethSwapToFill(log: LogEntry, blockTimeUtcMs: number): SwapFill {
  const { amount0, amount1 } = decodeV3Swap(log.data);
  return { signature: log.transactionHash, blockTimeUtcMs, baseDelta: amount1, quoteDelta: amount0 };
}

/** Signed VWAP of v3 swaps (quote per base). TSLAon has 18 decimals, USDC 6 (declared). Reuses gap.ts. */
export function ethVwap(fills: readonly SwapFill[]): string {
  return vwapDecimal(fills, 18, 6);
}
/** Session gap for the Ethereum leg (18/6 decimals), reusing the pure sessionGap (close read, never stored). */
export function ethSessionGap(fills: readonly SwapFill[], closeRef: number): SessionGap {
  return sessionGap(fills, closeRef, 18, 6);
}

/** Default Ethereum JSON-RPC call for the quorum pool: throws `HTTP <status>` (NO url, unlike record.ts:22)
 *  on a transport fault and a typed RpcError on a node error, so no ?api-key can leak (C-10). */
export const bellEthCall: RpcCall = async (url, method, params) => {
  const ctl = new AbortController();
  const to = setTimeout(() => { ctl.abort(); }, 30_000);
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${String(res.status)}`);
    const json = (await res.json()) as { result?: unknown; error?: { code?: number; message?: string; data?: unknown } };
    if (json.error) throw new RpcError(json.error.message ?? "rpc error", json.error.code ?? 0, typeof json.error.data === "string" ? json.error.data : undefined);
    return json.result;
  } finally { clearTimeout(to); }
};

/** Live TSLAon/USDC swaps over a block range with quorum-2 getLogs (makeUkemiPool, as-is). Network only
 *  (run-guarded main); returns SwapFills with per-block timestamps for session classification. */
export async function liveEthSwaps(pool: PoolRef, fromBlock: number, toBlock: number,
  opts: { call?: RpcCall; getLogsProviders?: readonly string[] } = {}): Promise<SwapFill[]> {
  const p = makeUkemiPool({ call: opts.call ?? bellEthCall, ethCallProviders: opts.getLogsProviders ?? GET_LOGS_PROVIDERS,
    getLogsProviders: opts.getLogsProviders ?? GET_LOGS_PROVIDERS, minIntervalMs: 200 });
  const logs = await p.getLogsRange(pool.poolId, [UNISWAP_V3_SWAP_TOPIC], fromBlock, toBlock);
  const tsCache = new Map<number, number>();
  const fills: SwapFill[] = [];
  const seen = new Set<string>();
  for (const log of logs) {
    if (seen.has(log.transactionHash)) continue;
    seen.add(log.transactionHash);
    const bn = parseInt(log.blockNumber, 16);
    let ts = tsCache.get(bn);
    if (ts === undefined) { ts = (await p.blockAt(bn)).ts; tsCache.set(bn, ts); }
    fills.push(ethSwapToFill(log, ts * 1000));
  }
  return fills;
}
