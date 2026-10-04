// scripts/l2/segments.d.mts -- type surface of scripts/l2/segments.mjs for the type-checked root test (test/l2-segments.test.ts), which
// writes and reads segments under the OS temp directory with injected clocks. Runtime implementation = segments.mjs; Node ignores this
// file. Neither file is in the export whitelist (scripts/export-public.mjs): the recorder and its data stay out of the public tree.
export const PERIOD_US: number;
export const QUEUE_BOUND: number;
export const INDEX_KEYS: readonly ["rank", "offset", "length", "recv_us", "mono_ns"];
export const STOPS: readonly string[];

/** One line of <seg>.index.jsonl, keys in this order (plan section 3, point 18): recv_us is the host's wall clock at reception in
 *  microseconds, a safe integer, never a time of the place; mono_ns the host's monotonic clock in nanoseconds, a decimal string. */
export interface IndexEntry {
  rank: number;
  offset: number;
  length: number;
  recv_us: number;
  mono_ns: string;
}

/** A frame as the reader yields it: its index entry and its bytes, LF excluded. */
export interface Frame extends IndexEntry {
  bytes: Buffer;
}

/** A tail as checkTail finds it, the mark of a resume: the consistent run (ranks, bytes kept in each file), the sizes, the causes. */
export interface Tail {
  cid: string;
  seg: string;
  ranks: number;
  frames_kept: number;
  frames_size: number;
  index_kept: number;
  index_size: number;
  causes: ("truncated_line" | "line_beyond_file" | "frame_without_line")[];
}

/** What the writer needs of an open file; a FileHandle of node:fs/promises is one. */
export interface SegmentFile {
  appendFile(data: string | Uint8Array): Promise<void>;
  close(): Promise<void>;
}

/** What a writer takes from its caller (the test seam): both clocks; the file opener (default: flag ax) and onStop, called once with
 *  the first stop (it must not throw). */
export interface WriterIo {
  wallUs: () => number;
  monoNs: () => bigint;
  open?: (path: string) => Promise<SegmentFile>;
  onStop?: (stop: SegmentStop) => void;
}

/** One connection's writer: push() false = refused (see stopped); queued and peak in bytes of frames; closed = segments closed whole. */
export interface Writer {
  push(text: string): boolean;
  cut(): void;
  idle(): Promise<void>;
  close(): Promise<void>;
  readonly queued: number;
  readonly peak: number;
  readonly closed: readonly string[];
  readonly stopped: SegmentStop | null;
}

/** A named stop: `code` is one of STOPS. */
export class SegmentStop extends Error {
  readonly code: string;
  readonly detail: Record<string, unknown>;
  constructor(code: string, detail?: Record<string, unknown>);
}

export function segmentOf(us: number): string;
export function cidOf(kind: "spot" | "market", symbol: string, openUs: number): string;
export function openWriter(out: string, cid: string, io: WriterIo): Writer;
export function checkTail(out: string, cid: string, seg: string): Tail | null;
export function readSegment(out: string, cid: string, seg: string, mark?: Tail | null): Generator<Frame, void, undefined>;
