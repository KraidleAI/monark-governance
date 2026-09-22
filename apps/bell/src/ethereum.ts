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
// GARDE-HELIUS-1b-iii: the Ethereum leg is BUDGETED and KEYLESS. Every eth_getLogs / eth_getBlockByNumber goes through
// @monark/rpc-guard (openGuardedClient) via makeGuardedEthCall — one write-ahead ledger line per attempt, cost 0
// (keyless labels, counted). The raw-fetch bellEthCall is REMOVED (its fetch migrates INTO the client). KEY HYGIENE
// (C-10) + R-D (2b-ii) are CONSERVED structurally: the transport builds the canonical RpcError with op = the bare
// keyless label and no key, so no ?api-key can leak and apps/bell constructs no RpcError any more.
import { makeUkemiPool, type LogEntry } from "../../sentinel/src/ukemi/rpc2.ts";
import { type RpcCall } from "../../sentinel/src/rpc.ts";
import { GET_LOGS_KEYLESS_LABELS, BudgetExceededError, TransportError, type BudgetedClient, type OperatorLabel } from "@monark/rpc-guard";
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

/** Build a BUDGETED, keyless eth-leg `RpcCall` from an open guarded client (GARDE-HELIUS-1b-iii, replaces the raw
 *  bellEthCall). Every read routes label -> client.call(LABEL, method, params): a write-ahead ledger line THEN one
 *  transport attempt, cost 0 (keyless). Retry is at the CALLER ONLY (mirror of the recorder, record.ts): a transient
 *  TRANSPORT fault (Abort/network/429/>=500) is retried with capped backoff; an RpcError, another 4xx, and the budget
 *  stop are NEVER retried (BudgetExceededError re-thrown FIRST). No ?api-key can leak: the transport raises the
 *  canonical RpcError with op = the bare label, and this module never holds a url or a key (C-10 / R-D conserved). */
export function makeGuardedEthCall(client: BudgetedClient,
  opts: { retries?: number; backoffMs?: number; backoffCapMs?: number } = {}): RpcCall {
  const retries = opts.retries ?? 2, backoffMs = opts.backoffMs ?? 500, backoffCapMs = opts.backoffCapMs ?? 8_000;
  return async (label, method, params) => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await client.call(label as OperatorLabel, method, params);
      } catch (e) {
        if (e instanceof BudgetExceededError) throw e; // fatal FIRST — never retried
        const transient = e instanceof TransportError && (e.name === "AbortError" || e.name === "TypeError" || e.name === "NetworkError" || (e.name === "HttpError" && e.code !== undefined && (e.code === 429 || e.code >= 500)));
        if (transient && attempt < retries) { await new Promise((r) => setTimeout(r, Math.min(backoffMs * 2 ** attempt, backoffCapMs))); continue; }
        throw e;
      }
    }
  };
}

/** Live TSLAon/USDC swaps over a block range with quorum-2 getLogs (makeUkemiPool, as-is). Network only
 *  (run-guarded main); returns SwapFills with per-block timestamps for session classification. GARDE-HELIUS-1b-iii:
 *  `opts.call` is the BUDGETED guarded call (makeGuardedEthCall) and is REQUIRED — there is NO raw-fetch default any
 *  more (fail-closed: an unbudgeted leg would rejoin the HELIUS-1 class). The default provider set is the KEYLESS
 *  LABELS (the transport resolves label -> url); the collect.ts call site passes the client's call (item 1b-ii). */
export async function liveEthSwaps(pool: PoolRef, fromBlock: number, toBlock: number,
  opts: { call?: RpcCall; getLogsProviders?: readonly string[] } = {}): Promise<SwapFill[]> {
  const call = opts.call;
  if (call === undefined) throw new Error("bell/ethereum: liveEthSwaps requires a budgeted opts.call (makeGuardedEthCall over openGuardedClient); no unbudgeted fetch default (GARDE-HELIUS-1b-iii)");
  const providers = opts.getLogsProviders ?? GET_LOGS_KEYLESS_LABELS;
  const p = makeUkemiPool({ call, ethCallProviders: providers, getLogsProviders: providers, minIntervalMs: 200 });
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
