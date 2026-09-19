// UKEMI (ADR-U1 D3) — quorum-2 RPC layer for the recorder, REUSING apps/sentinel/src/rpc.ts primitives
// (providerOf, QuorumDisagreementError, RpcCall) WITHOUT modifying them (Narabi is LIVE, its anchor pinned).
//
// Quorum depends on the method (measured, M-1 §5 / census A §2): eth_call@B is served by {drpc, mevblocker,
// blastapi, nodies}; eth_getLogs (wide) only by {drpc, mevblocker, tenderly}. A value read needs TWO DISTINCT
// providers (by providerOf) with CONCORDANT outcomes: byte-identical value, or the same EVM revert (a real
// on-chain fact — ConcordantRevertError, tolerated only for description()). Disagreement ⇒ QuorumDisagreementError;
// fewer than two ⇒ NoQuorumError. Either way the caller abstains the whole book (no partial book presented complete).
// LOOK-AHEAD FORBIDDEN (ADR-U1 D7): every read carries an explicit block number; the `finalized` tag is read
// only to gate B ≤ finalized; the mutable head tag is never requested (grep + test ukemi_no_latest_literal).
import { createHash } from "node:crypto";
import { providerOf, QuorumDisagreementError, type RpcCall } from "../rpc.ts";

/** No two distinct providers agreed on a read — the whole (cluster, B) book abstains, naming the read. */
export class NoQuorumError extends Error {}

/** A JSON-RPC error response (the node returned `{error:{code,message,data}}`), NOT a transport failure. Carries
 *  the numeric code and optional revert data so the quorum can tell an EVM revert from a transport/rate fault. */
export class RpcError extends Error {
  readonly code: number;
  readonly data: string | undefined;
  constructor(message: string, code: number, data: string | undefined = undefined) { super(message); this.name = "RpcError"; this.code = code; this.data = data; }
}

/** >= 2 distinct providers returned the SAME revert for one read — a deterministic on-chain fact (e.g. an oracle
 *  source with no `description()`), NOT a no-quorum. The caller tolerates it ONLY where an absent field is a real
 *  datum (book.ts, `description()` ⇒ ""); everywhere else it abstains the whole book (ADR-U1 D3, V-1). */
export class ConcordantRevertError extends Error {}

/** Is this rejection an EVM execution revert (deterministic, identical across honest providers) rather than a
 *  transport/rate fault? Explicit, testable criterion (ADR-U1 D3 amendment 2026-09-19): a typed RpcError whose
 *  code is 3 (EIP-1474 "execution error") or -32000 (common node "server error" used for reverts) AND whose
 *  message names a revert. A revert counts toward the quorum and does NOT bench; anything else benches. */
export function isRpcRevert(e: unknown): e is RpcError {
  return e instanceof RpcError && (e.code === 3 || e.code === -32000) && /execution reverted|revert/i.test(e.message);
}

/** Identity of a revert for the quorum comparison: the revert DATA if present (custom-error selector / reason),
 *  else the message normalized (lower-cased, whitespace-collapsed). Two providers concord iff these match. */
function revertKey(e: RpcError): string {
  return e.data !== undefined && e.data !== "0x" ? e.data.toLowerCase() : e.message.trim().toLowerCase().replace(/\s+/g, " ");
}

/** A log as returned by eth_getLogs (the fields the recorder pins for the quorum digest + enumeration). */
export interface LogEntry { readonly blockNumber: string; readonly logIndex: string; readonly transactionHash: string; readonly topics: readonly string[]; readonly data: string; }

const toHexBlock = (n: number): string => "0x" + BigInt(n).toString(16);
const isResultLimit = (m: string): boolean => /more than|result|range is too|10000|query returned|limit exceeded|block range|too large|response size|maximum allowed|ranges? over/i.test(m);

function asLogs(x: unknown): LogEntry[] {
  if (!Array.isArray(x)) throw new Error("eth_getLogs: result is not an array");
  return (x as unknown[]).map((l): LogEntry => {
    const o = l as { blockNumber?: unknown; logIndex?: unknown; transactionHash?: unknown; topics?: unknown; data?: unknown };
    if (typeof o.blockNumber !== "string" || typeof o.logIndex !== "string" || typeof o.transactionHash !== "string" || !Array.isArray(o.topics) || typeof o.data !== "string") throw new Error("eth_getLogs: malformed log");
    return { blockNumber: o.blockNumber, logIndex: o.logIndex, transactionHash: o.transactionHash, topics: (o.topics as unknown[]).map(String), data: o.data };
  });
}
function asBlock(x: unknown): { hash: string; number: number; ts: number } {
  const o = x as { hash?: unknown; number?: unknown; timestamp?: unknown } | null;
  if (!o || typeof o.hash !== "string" || typeof o.number !== "string" || typeof o.timestamp !== "string") throw new Error("eth_getBlockByNumber: malformed block");
  return { hash: o.hash, number: parseInt(o.number, 16), ts: parseInt(o.timestamp, 16) };
}
function asHex(x: unknown): string {
  if (typeof x !== "string" || !/^0x[0-9a-fA-F]*$/.test(x)) throw new Error("eth_call: result is not a hex string");
  // An EMPTY result ("0x") is an archive miss / revert-to-empty, never a book value. Reject it so the quorum
  // benches the returning provider instead of decoding it (e.g. a zero source address, then a reverting
  // description()). Every book read (reserve data, source, price, balances, account data) returns >= 1 word.
  if (x === "0x") throw new Error("eth_call: empty result (archive miss / revert-to-empty)");
  return x;
}
/** Canonical key of a log set for the quorum comparison: sha256 of the sorted (block,logIndex,topics,data). */
export function logsKey(logs: readonly LogEntry[]): string {
  const rows = logs.map((l) => [parseInt(l.blockNumber, 16), parseInt(l.logIndex, 16), l.topics, l.data] as const)
    .sort((a, z) => a[0] - z[0] || a[1] - z[1]);
  return createHash("sha256").update(JSON.stringify(rows)).digest("hex");
}

/** What the book builder consumes. Every method carries an explicit block number; no mutable head tag. */
export interface UkemiReader {
  ethCall(to: string, data: string, block: number): Promise<string>;
  getLogsRange(address: string, topics: ReadonlyArray<string | null>, fromBlock: number, toBlock: number): Promise<LogEntry[]>;
  blockAt(block: number): Promise<{ hash: string; ts: number }>;
  finalized(): Promise<{ block: number; ts: number }>;
}

export interface UkemiPoolOpts {
  call: RpcCall;
  ethCallProviders: readonly string[];
  getLogsProviders: readonly string[];
  minIntervalMs?: number; // politeness (ADR-U1 D3, ≤ 300/min ⇒ ~200ms). 0 in tests (injected call).
  chunk?: number;         // getLogs range chunk (census: 9990 ≤ common cap)
}

export function makeUkemiPool(opts: UkemiReaderOpts): UkemiReader {
  const { call, ethCallProviders, getLogsProviders } = opts;
  const minIntervalMs = opts.minIntervalMs ?? 0;
  const chunk = opts.chunk ?? 9990;
  const cooldownUntil = new Map<string, number>();
  let last = 0;

  const polite = async (): Promise<void> => {
    if (minIntervalMs <= 0) return;
    const wait = last + minIntervalMs - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    last = Date.now();
  };
  const live = (providers: readonly string[]): string[] => {
    const up = providers.filter((u) => (cooldownUntil.get(u) ?? 0) <= Date.now());
    return up.length > 0 ? up : [...providers];
  };

  /** Two DISTINCT providers (by providerOf) whose OUTCOMES concord. An outcome is a success (kind "ok", keyed by
   *  `keyOf`) or an EVM revert (kind "revert", keyed by `revertKey`). A revert does NOT bench — it is on-chain
   *  data, not a fault (ADR-U1 D3 V-1). Two ok concord ⇒ value; two reverts concord ⇒ ConcordantRevertError;
   *  differing keys (value vs revert, or two different values/reverts) ⇒ QuorumDisagreementError; fewer than two
   *  outcomes (transport faults are benched) ⇒ NoQuorumError. */
  async function quorum2<T>(label: string, providers: readonly string[], fetchOne: (url: string) => Promise<T>, keyOf: (v: T) => string): Promise<T> {
    const list = live(providers);
    const got: Array<{ prov: string; kind: "ok" | "revert"; key: string; val?: T }> = [];
    const seen = new Set<string>();
    let lastErr: Error | undefined;
    for (let i = 0; i < list.length && got.length < 2; i++) {
      const url = list[i];
      if (url === undefined || seen.has(providerOf(url))) continue;
      try {
        await polite();
        const val = await fetchOne(url);
        got.push({ prov: providerOf(url), kind: "ok", key: "ok:" + keyOf(val), val });
        seen.add(providerOf(url));
      } catch (e) {
        if (isRpcRevert(e)) { got.push({ prov: providerOf(url), kind: "revert", key: "revert:" + revertKey(e) }); seen.add(providerOf(url)); }
        else { lastErr = e instanceof Error ? e : new Error(String(e)); cooldownUntil.set(url, Date.now() + 25_000); }
      }
    }
    const [a, b] = got;
    if (a === undefined || b === undefined) throw new NoQuorumError(`${label}: quorum needs 2 providers${lastErr ? ` (last: ${lastErr.message})` : ""}`);
    if (a.key !== b.key) throw new QuorumDisagreementError(`${label}: providers ${a.prov}/${b.prov} disagree`);
    if (a.kind === "revert") throw new ConcordantRevertError(`${label}: concordant revert across ${a.prov}/${b.prov}`);
    return a.val as T;
  }

  /** eth_getLogs on ONE endpoint, splitting the range on a result/range-cap error (recursively). */
  async function getLogsVia(url: string, address: string, topics: ReadonlyArray<string | null>, from: number, to: number, depth = 0): Promise<LogEntry[]> {
    await polite();
    const params = [{ address, fromBlock: toHexBlock(from), toBlock: toHexBlock(to), topics }];
    try {
      return asLogs(await call(url, "eth_getLogs", params));
    } catch (e) {
      if (to > from && depth < 20 && isResultLimit(String((e as Error).message))) {
        const mid = from + Math.floor((to - from) / 2);
        const [x, y] = await Promise.all([getLogsVia(url, address, topics, from, mid, depth + 1), getLogsVia(url, address, topics, mid + 1, to, depth + 1)]);
        return [...x, ...y];
      }
      throw e;
    }
  }

  return {
    async ethCall(to, data, block) {
      return quorum2("eth_call", ethCallProviders, (url) => call(url, "eth_call", [{ to, data }, toHexBlock(block)]).then(asHex), (v) => v);
    },
    async getLogsRange(address, topics, fromBlock, toBlock) {
      const out: LogEntry[] = [];
      for (let from = fromBlock; from <= toBlock; from += chunk) {
        const to = Math.min(from + chunk - 1, toBlock);
        const logs = await quorum2(`eth_getLogs[${from},${to}]`, getLogsProviders, (url) => getLogsVia(url, address, topics, from, to), logsKey);
        out.push(...logs);
      }
      return out;
    },
    async blockAt(block) {
      const b = await quorum2("eth_getBlockByNumber", ethCallProviders, (url) => call(url, "eth_getBlockByNumber", [toHexBlock(block), false]).then(asBlock), (v) => v.hash);
      return { hash: b.hash, ts: b.ts };
    },
    async finalized() {
      // finalized tag only (never the mutable head): 2 successes, min block (nodes drift). Liveness gate for B ≤ finalized.
      const list = live(ethCallProviders);
      const got: Array<{ block: number; ts: number }> = [];
      const seen = new Set<string>();
      for (let i = 0; i < list.length && got.length < 2; i++) {
        const url = list[i];
        if (url === undefined || seen.has(providerOf(url))) continue;
        try { await polite(); const b = asBlock(await call(url, "eth_getBlockByNumber", ["finalized", false])); got.push({ block: b.number, ts: b.ts }); seen.add(providerOf(url)); }
        catch { cooldownUntil.set(url, Date.now() + 25_000); }
      }
      const [a, b] = got;
      if (a === undefined || b === undefined) throw new NoQuorumError("finalized: quorum needs 2 providers");
      return a.block <= b.block ? a : b;
    },
  };
}

/** Alias kept explicit for the options type name used above. */
export type UkemiReaderOpts = UkemiPoolOpts;

/** Measured provider sets (M-1 §5 / census A §2). Domains match rpc.ts providerOf (registrable domain). */
export const ETH_CALL_PROVIDERS: readonly string[] = ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://eth-mainnet.public.blastapi.io", "https://eth-pokt.nodies.app"];
export const GET_LOGS_PROVIDERS: readonly string[] = ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://mainnet.gateway.tenderly.co"];
