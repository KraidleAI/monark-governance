// UKEMI (ADR-U1 D6 C-5, U-4a A-1) — the `--resume` reader/cache for the liquidation-book recorder.
//
// A run of the WETH book at B₀ makes ~2N + N_at-risk·~16 quorum reads; an interruption must not re-pay them and
// must not re-pay the ~1412 enumeration getLogs either. `--resume <file>` is a JSONL request→result cache that
// WRAPS the quorum pool: a HIT returns the recorded bytes WITHOUT calling the base reader (so no RPC, no budget
// spend — the budget only ever counts real network calls); a MISS delegates to the base and APPENDS the
// round-trip. The same file is `U4-inputs.jsonl` (A-3), so replaying it offline reproduces the book bit-identically
// (`u4_book_replays_bit_identical`) with ZERO network — `recordBook` is already pure over `UkemiReader`, so this is
// a pure reader too and does not touch book.ts (the pinned digest 034fbff9… is unchanged).
//
// CORRUPTION / TAMPER (mutant "cache corrupted ⇒ abstention", C-5): the enumeration is stored as ONE getLogs entry
// whose result is the REDUCED recipient set (one synthetic Transfer log per distinct holder — see
// `reducedRecipientLogs`), and a `holders` line carries the digest of that set. On resume, `recordBook` recomputes
// the holders_digest from the cached logs; `assertResumeHoldersMatch` compares it to the `holders` line — any
// altered / dropped / added recipient shifts the digest ⇒ ABSTENTION, never a silently different book.
//
// K-8: no network / fs / env / clock here. The file IO (append / read) is done by the caller (record.ts / the
// probe / the course), which passes an `append` sink and pre-parsed lines; this module is pure and testable.
import { createHash } from "node:crypto";
import { TRANSFER_TOPIC0, topicAddr } from "./abi.ts";
import type { UkemiReader, LogEntry } from "./rpc2.ts";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";
const ZERO_WORD = "0x" + "0".repeat(64);
const sha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");

/** A corrupted / malformed / tampered resume cache ⇒ the run abstains (never a partial or altered book). */
export class ResumeCacheError extends Error {}

/** One cached RPC round-trip. `kind` selects the UkemiReader method it answers; `meta`/`holders` are book-keeping.
 *  `getLogs.result` is the REDUCED recipient set (synthetic logs), not the raw Transfer stream (size O(N)). */
export type CacheLine =
  | ({ kind: "meta" } & Record<string, unknown>)
  | { kind: "ethCall"; to: string; data: string; block: number; result: string }
  | { kind: "getLogs"; address: string; topics: (string | null)[]; from: number; to: number; result: LogEntry[] }
  | { kind: "blockAt"; block: number; result: { hash: string; ts: number } }
  | { kind: "finalized"; result: { block: number; ts: number } }
  | { kind: "holders"; n: number; holders_digest: string };

const lc = (s: string): string => s.toLowerCase();
const ethCallKey = (to: string, data: string, block: number): string => `ethCall|${lc(to)}|${lc(data)}|${String(block)}`;
const getLogsKey = (address: string, topics: ReadonlyArray<string | null>, from: number, to: number): string =>
  `getLogs|${lc(address)}|${topics.map((t) => (t === null ? "null" : lc(t))).join(",")}|${String(from)}|${String(to)}`;
const blockAtKey = (block: number): string => `blockAt|${String(block)}`;

/** The distinct recipients of a set of aToken Transfer logs, reduced to ONE synthetic Transfer log each (topic2 =
 *  the holder, from = 0x0). `recordBook` reads getLogs only through `transferRecipients`, which keys on topic2, so
 *  this reduced set yields the SAME holder set — hence the same holders_digest — while the cache stays O(N), never
 *  the O(all-transfers) raw stream. Deterministic order (the caller passes a sorted recipient list). */
export function reducedRecipientLogs(recipients: readonly string[]): LogEntry[] {
  return recipients.map((r, i) => ({
    blockNumber: "0x0",
    logIndex: "0x" + i.toString(16),
    transactionHash: ZERO_WORD,
    topics: [TRANSFER_TOPIC0, ZERO_WORD, topicAddr(r)],
    data: "0x",
  }));
}

/** The holders_digest of a recipient list, computed EXACTLY as book.ts does (drop the zero address, sort, join
 *  with "\n", sha256) so the probe's `holders` line and `recordBook`'s recompute agree to the byte. */
export function holdersDigestOf(recipients: Iterable<string>): { holders: string[]; holders_digest: string } {
  const set = new Set<string>();
  for (const r of recipients) set.add(lc(r));
  set.delete(ZERO_ADDR);
  const holders = [...set].sort();
  return { holders, holders_digest: sha256(holders.join("\n")) };
}

/** A resume reader also exposes the cached enumeration digest for the post-record guard. */
export interface ResumeReader extends UkemiReader {
  cachedHoldersDigest(): string | undefined;
}

/** Wrap `base` with a request→result cache built from `lines`; append every MISS via `append`. Pure over the base
 *  reader: a hit is answered from the map (no base call, no budget), a miss delegates and records. Fail-closed: an
 *  unknown line kind is a ResumeCacheError at load (never a silent skip that would let a tampered file through). */
export function makeResumeReader(base: UkemiReader, lines: readonly CacheLine[], append: (line: CacheLine) => void): ResumeReader {
  const ethCallCache = new Map<string, string>();
  const getLogsCache = new Map<string, LogEntry[]>();
  const blockAtCache = new Map<string, { hash: string; ts: number }>();
  let finalizedCache: { block: number; ts: number } | undefined;
  let holdersDigest: string | undefined;
  // UKEMI-CONC-1: SINGLE-FLIGHT per ethCall key. Under the bounded window (--concurrency n > 1) two concurrent MISSes of
  // one key would each call the base (2 network reads) and append 2 lines; the second now JOINS the first (one base
  // read, ONE appended line). A sequential caller (n=1) never overlaps => unchanged. A rejected read is not cached and
  // leaves the map at settle (the next caller retries the base, as before). Appends stay synchronous (the caller's
  // appendFileSync): one complete line per call, serialized by the single JS thread - never an interleaved line.
  const inflight = new Map<string, Promise<string>>();
  for (const l of lines) {
    switch (l.kind) {
      case "meta": break;
      case "ethCall": ethCallCache.set(ethCallKey(l.to, l.data, l.block), l.result); break;
      case "getLogs": getLogsCache.set(getLogsKey(l.address, l.topics, l.from, l.to), l.result); break;
      case "blockAt": blockAtCache.set(blockAtKey(l.block), l.result); break;
      case "finalized": finalizedCache = l.result; break;
      case "holders": holdersDigest = l.holders_digest; break;
      default: throw new ResumeCacheError(`ukemi/resume: unknown cache line kind ${JSON.stringify((l as { kind: unknown }).kind)}`);
    }
  }
  return {
    async ethCall(to, data, block) {
      const k = ethCallKey(to, data, block);
      const hit = ethCallCache.get(k);
      if (hit !== undefined) return hit;
      const flying = inflight.get(k);
      if (flying !== undefined) return flying;
      const p = base.ethCall(to, data, block).then((v) => { ethCallCache.set(k, v); append({ kind: "ethCall", to, data, block, result: v }); return v; }).finally(() => { inflight.delete(k); });
      inflight.set(k, p);
      return await p;
    },
    async getLogsRange(address, topics, fromBlock, toBlock) {
      const k = getLogsKey(address, topics, fromBlock, toBlock);
      const hit = getLogsCache.get(k);
      if (hit !== undefined) return hit;
      const v = await base.getLogsRange(address, topics, fromBlock, toBlock);
      getLogsCache.set(k, v); append({ kind: "getLogs", address, topics: [...topics], from: fromBlock, to: toBlock, result: v });
      return v;
    },
    async blockAt(block) {
      const k = blockAtKey(block);
      const hit = blockAtCache.get(k);
      if (hit !== undefined) return hit;
      const v = await base.blockAt(block);
      blockAtCache.set(k, v); append({ kind: "blockAt", block, result: v });
      return v;
    },
    async finalized() {
      if (finalizedCache !== undefined) return finalizedCache;
      const v = await base.finalized();
      finalizedCache = v; append({ kind: "finalized", result: v });
      return v;
    },
    cachedHoldersDigest() { return holdersDigest; },
  };
}

/** Post-record guard (C-5): if resuming (a `holders` line was present) and the recomputed digest differs, the
 *  cache is corrupted / tampered ⇒ ABSTENTION. No `holders` line (a fresh run) ⇒ no-op. */
export function assertResumeHoldersMatch(recomputed: string, reader: ResumeReader): void {
  const cached = reader.cachedHoldersDigest();
  if (cached !== undefined && cached !== recomputed) {
    throw new ResumeCacheError(
      `ukemi/resume: holders_digest mismatch — cache ${cached} != recomputed ${recomputed} ` +
        `(corrupted/tampered --resume cache; abstaining, ADR-U1 D6 C-5)`,
    );
  }
}

/** Parse a JSONL resume/inputs file into cache lines. Fail-closed: a non-JSON or kind-less line throws. */
export function parseResumeLines(text: string): CacheLine[] {
  const out: CacheLine[] = [];
  const raw = text.split(/\r?\n/);
  for (let i = 0; i < raw.length; i++) {
    const line = raw[i];
    if (line === undefined || line.trim() === "") continue;
    let parsed: unknown;
    try { parsed = JSON.parse(line); } catch (e) { throw new ResumeCacheError(`ukemi/resume: line ${String(i + 1)} is not JSON: ${(e as Error).message}`); }
    if (typeof parsed !== "object" || parsed === null || typeof (parsed as { kind?: unknown }).kind !== "string") {
      throw new ResumeCacheError(`ukemi/resume: line ${String(i + 1)} has no string 'kind'`);
    }
    out.push(parsed as CacheLine);
  }
  return out;
}
