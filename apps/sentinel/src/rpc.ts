// SENTINEL — off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// Public RPC pool (no key, read-only) with per-endpoint cooldown and a QUORUM OF 2 on the value-bearing
// reads (burns/mints via eth_getLogs, supply via totalSupply): two distinct endpoints must return the
// SAME bytes or the window fails closed (ADR-M012 D1, test `sentinel_quorum_disagreement_fails_closed`).
// The quorum read FALLS BACK round-robin over the pool, benching any endpoint that throws (same cooldown as
// `one()`) and needing >= 2 successes, so one persistently-failing endpoint never FATALs a run (M012-d fixes
// G2 M012-b O2); disagreement between the two successes still fails closed.
// The chain head is read at the `finalized` tag (never `latest` — mutant M4); `finalized` is min() across
// two endpoints because nodes drift by a few blocks, and run.ts gates a day by ts(finalized) >= its close
// midnight so a window is never sliced short. The low-level `call` is INJECTED, so CI drives stubs offline.
import { createHash } from "node:crypto";

export const USDE_TOKEN = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3";
export const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ZERO40 = "0".repeat(40);
const TOTAL_SUPPLY_SELECTOR = "0x18160ddd";

export const PUBLIC_ENDPOINTS: readonly string[] = [
  "https://ethereum-rpc.publicnode.com", "https://eth.llamarpc.com", "https://eth.drpc.org",
  "https://rpc.mevblocker.io", "https://eth-mainnet.public.blastapi.io", "https://1rpc.io/eth",
  "https://ethereum.publicnode.com", "https://eth.rpc.blxrbdn.com",
];

/** One JSON-RPC round-trip to a NAMED endpoint. Injected in tests; the default hits the public pool. */
export type RpcCall = (url: string, method: string, params: readonly unknown[]) => Promise<unknown>;

/** A quorum read disagreed across two endpoints — fail-closed, the window is not written. */
export class QuorumDisagreementError extends Error {}

const toHexBlock = (n: number): string => "0x" + BigInt(n).toString(16);
const isResultLimit = (m: string): boolean => /more than|result|range is too|10000|query returned|limit exceeded|block range|too large|response size/i.test(m);

interface RawLog { readonly topics: readonly string[]; readonly data: string; }
function asLogs(x: unknown): RawLog[] {
  if (!Array.isArray(x)) throw new Error("eth_getLogs: result is not an array");
  const items: unknown[] = x;
  return items.map((l): RawLog => {
    const o = l as { topics?: unknown; data?: unknown };
    if (!Array.isArray(o.topics) || typeof o.data !== "string") throw new Error("eth_getLogs: malformed log");
    const topics: unknown[] = o.topics;
    return { topics: topics.map((t) => String(t)), data: o.data };
  });
}
function asBlock(x: unknown): { number: number; ts: number } {
  const o = x as { number?: unknown; timestamp?: unknown } | null;
  if (!o || typeof o.number !== "string" || typeof o.timestamp !== "string") throw new Error("eth_getBlockByNumber: malformed block");
  return { number: parseInt(o.number, 16), ts: parseInt(o.timestamp, 16) };
}
function asBigHex(x: unknown): bigint {
  if (typeof x !== "string" || !/^0x[0-9a-fA-F]+$/.test(x)) throw new Error("eth_call: result is not a hex quantity");
  return BigInt(x);
}
function sumFlow(logs: readonly RawLog[]): { burns: bigint; mints: bigint } {
  let burns = 0n, mints = 0n;
  for (const l of logs) {
    const from = (l.topics[1] ?? "").slice(-40), to = (l.topics[2] ?? "").slice(-40), v = BigInt(l.data);
    if (to === ZERO40) burns += v;
    if (from === ZERO40) mints += v;
  }
  return { burns, mints };
}
const flowKey = (f: { burns: bigint; mints: bigint }): string =>
  createHash("sha256").update(`${f.burns.toString()}|${f.mints.toString()}`).digest("hex");

async function defaultCall(url: string, method: string, params: readonly unknown[]): Promise<unknown> {
  const ctl = new AbortController();
  const to = setTimeout(() => { ctl.abort(); }, 20_000);
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${String(res.status)} ${url}`);
    const json = (await res.json()) as { result?: unknown; error?: { message?: string } };
    if (json.error) throw new Error(json.error.message ?? "rpc error");
    return json.result;
  } finally {
    clearTimeout(to);
  }
}

export interface RpcPool {
  finalized(): Promise<{ block: number; ts: number }>;
  blockTs(block: number): Promise<number>;
  windowFlow(fromBlock: number, toBlock: number): Promise<{ burns: bigint; mints: bigint }>;
  supplyAt(block: number): Promise<bigint>;
}

/** Build a pool over `endpoints` using `call`. `cooldownMs` benches an endpoint after it throws. */
export function makeRpcPool(opts: { endpoints?: readonly string[]; call?: RpcCall; cooldownMs?: number } = {}): RpcPool {
  const endpoints = opts.endpoints ?? PUBLIC_ENDPOINTS;
  const call = opts.call ?? defaultCall;
  const cooldownMs = opts.cooldownMs ?? 25_000;
  const cooldownUntil = new Map<string, number>();
  let rr = 0;

  const live = (): string[] => {
    const up = endpoints.filter((u) => (cooldownUntil.get(u) ?? 0) <= Date.now());
    return up.length > 0 ? up : [...endpoints];
  };
  // Round-robin single call, benching an endpoint that throws until a live one answers.
  async function one<T>(method: string, params: readonly unknown[], map: (x: unknown) => T): Promise<T> {
    const list = live();
    for (let i = 0; i < list.length; i++) {
      const url = list[(rr + i) % list.length];
      if (url === undefined) continue;
      try {
        const out = map(await call(url, method, params));
        rr = (rr + i + 1) % list.length;
        return out;
      } catch (e) {
        cooldownUntil.set(url, Date.now() + cooldownMs);
        if (i === list.length - 1) throw e;
      }
    }
    throw new Error(`${method}: no endpoint answered`);
  }
  // Two DISTINCT live endpoints that SUCCEED (quorum read with fallback, M012-d / G2 M012-b O2): iterate the
  // live endpoints round-robin from `rr`, benching any that throws into the same `cooldownUntil` map as
  // `one()`, until two answer; advance `rr` past those consumed. Throw only when fewer than two succeed, so a
  // single persistently-failing endpoint (e.g. a 525 host) never FATALs the daily run. No randomness.
  async function quorumTwo<T>(label: string, fetchOne: (url: string) => Promise<T>): Promise<[T, T]> {
    const list = live();
    const got: T[] = [];
    let lastErr: Error | undefined;
    let i = 0;
    for (; i < list.length && got.length < 2; i++) {
      const url = list[(rr + i) % list.length];
      if (url === undefined) continue;
      try {
        got.push(await fetchOne(url));
      } catch (e) {
        lastErr = e instanceof Error ? e : new Error(String(e));
        cooldownUntil.set(url, Date.now() + cooldownMs);
      }
    }
    const [a, b] = got;
    if (a === undefined || b === undefined) {
      throw new Error(`${label}: quorum needs >= 2 live endpoints${lastErr ? ` (last: ${lastErr.message})` : ""}`);
    }
    rr = (rr + i) % list.length;
    return [a, b];
  }
  // eth_getLogs on ONE named endpoint, splitting the range on a result-limit error (recursively).
  async function getLogsVia(url: string, from: number, to: number, depth = 0): Promise<RawLog[]> {
    const params = [{ address: USDE_TOKEN, fromBlock: toHexBlock(from), toBlock: toHexBlock(to), topics: [TRANSFER_TOPIC] }];
    try {
      return asLogs(await call(url, "eth_getLogs", params));
    } catch (e) {
      if (to > from && depth < 16 && isResultLimit(String((e as Error).message))) {
        const mid = from + Math.floor((to - from) / 2);
        const [x, y] = await Promise.all([getLogsVia(url, from, mid, depth + 1), getLogsVia(url, mid + 1, to, depth + 1)]);
        return [...x, ...y];
      }
      throw e;
    }
  }

  return {
    async finalized() {
      const [a, b] = await quorumTwo("finalized", (url) => call(url, "eth_getBlockByNumber", ["finalized", false]).then(asBlock));
      const block = Math.min(a.number, b.number);
      return { block, ts: block === a.number ? a.ts : b.ts };
    },
    blockTs(block) {
      return one("eth_getBlockByNumber", [toHexBlock(block), false], (x) => asBlock(x).ts);
    },
    async windowFlow(fromBlock, toBlock) {
      const [logsA, logsB] = await quorumTwo("windowFlow", (url) => getLogsVia(url, fromBlock, toBlock));
      const fa = sumFlow(logsA);
      if (flowKey(fa) !== flowKey(sumFlow(logsB))) throw new QuorumDisagreementError("windowFlow: endpoints disagree on burns/mints");
      return fa;
    },
    async supplyAt(block) {
      const params = [{ to: USDE_TOKEN, data: TOTAL_SUPPLY_SELECTOR }, toHexBlock(block)];
      const [a, b] = await quorumTwo("supplyAt", (url) => call(url, "eth_call", params).then(asBigHex));
      if (a !== b) throw new QuorumDisagreementError(`supplyAt(${String(block)}): endpoints disagree (${String(a)} vs ${String(b)})`);
      return a;
    },
  };
}
