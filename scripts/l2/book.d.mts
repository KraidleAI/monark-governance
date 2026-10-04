// scripts/l2/book.d.mts -- type surface of scripts/l2/book.mjs for the type-checked test test/l2-book.test.ts (lot P1-b2 of
// ADR-L2-CAPTURE-1). Runtime implementation = book.mjs; Node ignores this file. Not in the export whitelist (scripts/export-public.mjs):
// the L2 recorder stays out of the public tree.
import type { RestClient } from "./rest.mjs";

export const STREAM_SUFFIX: string;
export const SNAPSHOTS_PER_RESYNC: number;
export const PAUSE_MS: number;
export const SUSPEND_MS: number;
export const BUFFER_MAX: number;
export const EVENTS: readonly string[];

/** What a book takes from its caller: the test seam, never a flag nor a variable. */
export interface BookIo {
  symbol: string;
  /** The REST client of P1-b1: depth snapshots, its suspension and its stop. */
  rest: Pick<RestClient, "request" | "stopped" | "suspendedUntilUs">;
  /** The host clocks of P1-a3 (LinkIo): wall in microseconds, an integer; monotonic in nanoseconds. */
  wallUs: () => number;
  monoNs: () => bigint;
  sleep: (ms: number) => Promise<void>;
  out: string;
}

/** A price level: price and quantity, decimal strings as received. */
export type Level = [string, string];

/** One line of journal.jsonl written by a book: the head of a P1-a3 line (host_us, mono_ns, symbol, cid, event), then the fields; each
 *  string that P1-a3's PLAIN refuses is written null. */
export interface ChainEntry {
  host_us: number;
  mono_ns: string;
  symbol: string;
  /** The <cid> of the connection the book follows (P1-a3), null before its first diff. */
  cid: string | null;
  event: "chain_synced" | "sync_try_vain" | "sync_suspended" | "chain_gap" | "chain_switched" | "chain_stopped" | "buffer_trimmed";
  [field: string]: unknown;
}

export interface Book {
  /** The stream this book reads: <symbol in lower case>@depth@100ms. */
  readonly stream: string;
  /** One text message of connection `cid` (its P1-a3 <cid>); false when it is not this book's diff or its connection is retired. */
  feed(text: string, cid: string): boolean;
  /** Switch to connection `cid` (plan section 4.3); false, nothing changed, for the connection followed, a string that is not a <cid>,
   *  or a stopped or closed book. */
  switchTo(cid: string): boolean;
  /** Settles when no sync runs. */
  idle(): Promise<void>;
  close(): void;
  readonly id: number | null;
  readonly state: "syncing" | "synced" | "stopped";
  readonly counts: { applied: number; ignored: number; dropped: number; trimmed: number };
  /** Bids from the highest price, asks from the lowest; null while no book is set. */
  levels(): { lastUpdateId: number; bids: Level[]; asks: Level[] } | null;
}

export function createBook(io: BookIo): Book;
