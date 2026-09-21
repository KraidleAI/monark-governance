// UKEMI (ADR-U1 D3) — quorum-2 RPC layer for the recorder, REUSING apps/sentinel/src/rpc.ts primitives
// (providerOf, QuorumDisagreementError, RpcCall) WITHOUT modifying them (Narabi is LIVE, its anchor pinned).
//
// Quorum depends on the method (measured, M-1 §5 / census A §2 + L-5 2026-09-21): eth_call@B by {drpc, mevblocker,
// pocket} ({nodies.app, pocket.network} = ONE operator, C-2); eth_getLogs by {drpc, mevblocker, tenderly, pocket}
// (Pocket archive getLogs byte-identical to MEV Blocker, L-5). A value read needs TWO DISTINCT operators (by
// operatorOf) with CONCORDANT outcomes: byte-identical value, or the same EVM revert (a real
// on-chain fact — ConcordantRevertError, tolerated only for description()). Disagreement ⇒ QuorumDisagreementError;
// fewer than two ⇒ NoQuorumError. Either way the caller abstains the whole book (no partial book presented complete).
// LOOK-AHEAD FORBIDDEN (ADR-U1 D7): every read carries an explicit block number; the `finalized` tag is read
// only to gate B ≤ finalized; the mutable head tag is never requested (grep + test ukemi_no_latest_literal).
import { createHash } from "node:crypto";
import { providerOf, QuorumDisagreementError, type RpcCall } from "../rpc.ts";

/** The INDEPENDENT operator behind an endpoint URL, for quorum-2 distinctness (C-2, ADR-POOL-RPC-1): like
 *  providerOf but collapsing the two Pocket-backed gateways — the keyless `eth-pokt.nodies.app` and the public
 *  `eth.api.pocket.network` both front the SAME Pocket Network (POKT) decentralised RPC, so counting them as two
 *  would fake a quorum. Every OTHER domain is its own operator. providerOf stays the LOGGING form (a bare host,
 *  never a key); operatorOf is the distinctness key for quorum2 / finalized / record.ts's fail-closed guard. */
export function operatorOf(url: string): string {
  const d = providerOf(url);
  return d === "nodies.app" || d === "pocket.network" ? "pocket" : d;
}

/** No two distinct providers agreed on a read — the whole (cluster, B) book abstains, naming the read. */
export class NoQuorumError extends Error {}

/** The `--max-calls` RPC budget was reached (U-4a A-1, C-5 fail-closed; calque Bell quorum.ts:24). It is NOT a
 *  transport fault and NOT a revert: quorum2, getLogsVia and finalized re-throw it FIRST in their catch so it can
 *  never be benched into a NoQuorumError, split as a range-cap (its message must carry NO isResultLimit token
 *  either — belt), or swallowed by finalized's bare catch. The run stops (exit 1), never presenting a
 *  budget-truncated book as complete. Defined here so record.ts's makeBudgetedCall and the three pool guards
 *  share one type (no cycle; record.ts already imports rpc2.ts). */
export class BudgetExceededError extends Error {}

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
export const isResultLimit = (m: string): boolean => /more than|result|range is too|10000|query returned|limit exceeded|block range|too large|response size|maximum allowed|ranges? over|narrow your filter/i.test(m);
// A drpc free-plan 400 body reads "ranges over 10000 blocks are not supported on free plan" — which isResultLimit
// matches via "10000"/"ranges over" — yet the chunk was already 9990 blocks (< 10000) and drpc still returned it
// 31 times on each live run (D9 weth/susde-live.json): the block is the PLAN, not the range, so splitting only
// re-hits the same 400 down to the floor. Detect it and let the caller bench the provider once (V-1(e)).
export const isPlanLimited = (m: string): boolean => /free plan/i.test(m);

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

/** Drop exact (blockNumber, logIndex, transactionHash) duplicates, keyed like logsKey (parsed ints + lower-cased
 *  hash) so a provider's hex-format drift cannot hide a duplicate; first occurrence is kept. Chunks and splits are
 *  half-open and disjoint by construction, so with honest providers this is a no-op. It defends the [from,to]
 *  coverage against a provider whose toBlock is inclusive off-by-one and returns a cut-boundary log on BOTH
 *  adjacent chunks (V-1(f)). Holder enumeration downstream is a Set, so a no-op never moves a pinned digest. */
export function dedupLogs(logs: readonly LogEntry[]): LogEntry[] {
  const seen = new Set<string>();
  const out: LogEntry[] = [];
  for (const l of logs) {
    const k = parseInt(l.blockNumber, 16) + "|" + parseInt(l.logIndex, 16) + "|" + l.transactionHash.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(l);
  }
  return out;
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
  slowOperators?: readonly string[]; // U-4a D-4: providerOf domains throttled to slowIntervalMs (the rest use minIntervalMs)
  slowIntervalMs?: number;           // interval for slowOperators (default 200) — used to raise a single misbehaving operator
  onQuorum?: ((label: string, opA: string, opB: string, concordant: boolean) => void) | undefined; // L-4 concordance sink (operatorOf labels only, never a URL); undefined ⇒ NO-OP ⇒ book_digest byte-identical
}

/** The politeness interval for a provider domain: `slowIntervalMs` iff it is a slow operator, else `minIntervalMs`
 *  (U-4a D-4). Pure/exported so the per-operator throttle is asserted directly (a global-only regression reds). */
export function resolveInterval(domain: string, minIntervalMs: number, slowOperators: readonly string[], slowIntervalMs: number): number {
  return slowOperators.includes(domain) ? slowIntervalMs : minIntervalMs;
}

export function makeUkemiPool(opts: UkemiReaderOpts): UkemiReader {
  const { call, ethCallProviders, getLogsProviders } = opts;
  const minIntervalMs = opts.minIntervalMs ?? 0;
  const slowOperators = opts.slowOperators ?? [];
  const slowIntervalMs = opts.slowIntervalMs ?? 200;
  const chunk = opts.chunk ?? 9990;
  const cooldownUntil = new Map<string, number>();
  // Politeness is PER PROVIDER (U-4a C-5), not one global gate: a single `last` throttled the whole pool to
  // 1000/minIntervalMs calls/s across ALL operators (5 operators under 200ms ⇒ 5 calls/s ⇒ ~16.7h for 300k),
  // whereas each endpoint tolerates ≤ 300/min on its own. Key `last` by providerOf(url) so distinct operators
  // proceed in parallel; the fixture tests pass minIntervalMs 0 and this stays a no-op for them.
  const politeLast = new Map<string, number>();

  const polite = async (url: string): Promise<void> => {
    const dom = providerOf(url);
    const interval = resolveInterval(dom, minIntervalMs, slowOperators, slowIntervalMs); // D-4: a slow operator waits longer
    if (interval <= 0) return;
    const prev = politeLast.get(dom) ?? 0;
    const wait = prev + interval - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    politeLast.set(dom, Date.now());
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
      if (url === undefined || seen.has(operatorOf(url))) continue; // C-2: distinctness by OPERATOR ({nodies,pocket}=1)
      try {
        await polite(url);
        const val = await fetchOne(url);
        got.push({ prov: operatorOf(url), kind: "ok", key: "ok:" + keyOf(val), val });
        seen.add(operatorOf(url));
      } catch (e) {
        if (e instanceof BudgetExceededError) throw e; // C-5: budget stop is fatal FIRST — never benched into no_quorum
        if (isRpcRevert(e)) { got.push({ prov: operatorOf(url), kind: "revert", key: "revert:" + revertKey(e) }); seen.add(operatorOf(url)); }
        else { lastErr = e instanceof Error ? e : new Error(String(e)); cooldownUntil.set(url, Date.now() + 25_000); }
      }
    }
    const [a, b] = got;
    if (a === undefined || b === undefined) throw new NoQuorumError(`${label}: quorum needs 2 providers${lastErr ? ` (last: ${lastErr.message})` : ""}`);
    // L-4 concordance hook (ADR-POOL-RPC-1): record whether the two DISTINCT operators agreed, BEFORE the
    // disagreement throw, so a QuorumDisagreementError still leaves an observation. Operator labels only, never a URL.
    opts.onQuorum?.(label, a.prov, b.prov, a.key === b.key);
    if (a.key !== b.key) throw new QuorumDisagreementError(`${label}: providers ${a.prov}/${b.prov} disagree`);
    if (a.kind === "revert") throw new ConcordantRevertError(`${label}: concordant revert across ${a.prov}/${b.prov}`);
    return a.val as T;
  }

  /** eth_getLogs on ONE endpoint, splitting the range on a result/range-cap error (recursively). */
  async function getLogsVia(url: string, address: string, topics: ReadonlyArray<string | null>, from: number, to: number, depth = 0): Promise<LogEntry[]> {
    await polite(url);
    const params = [{ address, fromBlock: toHexBlock(from), toBlock: toHexBlock(to), topics }];
    try {
      return asLogs(await call(url, "eth_getLogs", params));
    } catch (e) {
      if (e instanceof BudgetExceededError) throw e; // C-5: FIRST — else its message could trip isResultLimit ⇒ endless split
      const msg = String((e as Error).message);
      // A plan-limited 400 (drpc free plan) is not a range cap: splitting cannot satisfy it, so rethrow and let
      // the quorum bench this provider once, instead of re-hitting the same 400 on every sub-range (V-1(e)).
      if (isPlanLimited(msg)) throw e;
      if (to > from && depth < 20 && isResultLimit(msg)) {
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
      return dedupLogs(out);
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
        if (url === undefined || seen.has(operatorOf(url))) continue; // C-2: distinctness by OPERATOR
        try { await polite(url); const b = asBlock(await call(url, "eth_getBlockByNumber", ["finalized", false])); got.push({ block: b.number, ts: b.ts }); seen.add(operatorOf(url)); }
        catch (e) { if (e instanceof BudgetExceededError) throw e; cooldownUntil.set(url, Date.now() + 25_000); } // C-5: FIRST — else the bare catch swallows the budget stop
      }
      const [a, b] = got;
      if (a === undefined || b === undefined) throw new NoQuorumError("finalized: quorum needs 2 providers");
      return a.block <= b.block ? a : b;
    },
  };
}

/** Alias kept explicit for the options type name used above. */
export type UkemiReaderOpts = UkemiPoolOpts;

/** Measured provider sets (M-1 §5 / census A §2 + L-5 2026-09-21, ADR-POOL-RPC-1, decision 106): −Blast −Llama,
 *  +Pocket. eth_call: 4 URLs / 3 OPERATORS ({nodies.app, pocket.network} = one operator `pocket`, C-2/operatorOf).
 *  getLogs: Tenderly KEPT (decision 102) + Pocket added (L-5 archive getLogs byte-identical to MEV Blocker) = 4
 *  distinct operators. ORDER is load-bearing (quorum2 has no round-robin): the proven providers lead, Pocket trails. */
export const ETH_CALL_PROVIDERS: readonly string[] = ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://eth-pokt.nodies.app", "https://eth.api.pocket.network"];
export const GET_LOGS_PROVIDERS: readonly string[] = ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://mainnet.gateway.tenderly.co", "https://eth.api.pocket.network"];
