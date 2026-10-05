// scripts/record-binance-l2.d.mts -- type surface of scripts/record-binance-l2.mjs for the type-checked root test test/l2-record.test.ts
// (lot P1-c4 of ADR-L2-CAPTURE-1). Runtime implementation = record-binance-l2.mjs; Node ignores this file. Not in the export whitelist
// (scripts/export-public.mjs): the L2 recorder and its data stay out of the public tree.
export const STOPS: readonly string[];
export const ADMITTED_ENV: Readonly<Record<string, readonly string[]>>;
export const OUT_ENTRIES: readonly string[];
export const ALARM_PCT: number;
export const STOP_PCT: number;
export const QUOTA_MAX: number;
export const WALK_DEPTH: number;

/** A named stop: `code` is one of STOPS, `detail` what was seen (names, counts, paths; never a value of the environment). */
export class RecorderStop extends Error {
  readonly code: string;
  readonly detail: Record<string, unknown>;
  constructor(code: string, detail?: Record<string, unknown>);
}

/** The arguments of a recording (--out, --quota-bytes) or of a replay (--from-raw, --symbol, --day, --out); paths resolved. */
export type Args = { mode: "record"; out: string; quota: number }
  | { mode: "replay"; fromRaw: string; symbol: string; day: string; out: string };

/** What a run takes from its caller (the test seam, point 22 of the plan): never from the command line nor the environment. */
export interface RecorderIo {
  env?: Record<string, string | undefined>;
  execArgv?: readonly string[];
  wallUs?: () => number;
  monoNs?: () => bigint;
  freeBytes?: (out: string) => number;
  print?: (line: string, toStderr: boolean) => void;
}

/** The quota check: the bytes counted under `at` (--out by default), the alarm journaled unless `journal` is false, `pin` run right before
 *  its append (P1-c5, m-2 and n-4 of its G2). */
export type QuotaCheck = (opts?: { at?: string; journal?: boolean; pin?: () => void }) => number;

/** The plan of a run once its guards pass: resume = --out is an L2 output to resume; for a recording, the bytes of --out, the free bytes
 *  and the quota check (counts the bytes, journals quota_alarm once, stops at STOP_PCT %). */
export type Plan = (Args & { mode: "replay"; resume: boolean })
  | (Args & { mode: "record"; resume: boolean; used: number; free: number; check: QuotaCheck });

export function parseArgs(argv: readonly string[]): Args;
export function guardEnv(env: Record<string, string | undefined>, execArgv: readonly string[], platform?: string): void;
export function guardOut(out: string, fs?: { exists?: (path: string) => boolean; real?: (path: string) => string }): boolean;
export function bytesUnder(dir: string, depth?: number): number;
export function createQuota(spec: { out: string; quota: number }, io: { wallUs: () => number; monoNs: () => bigint }): QuotaCheck;
/** The free bytes (statfs bavail x bsize) of the file system that holds `path`, at its nearest existing ancestor. */
export function freeBytes(path: string): number;
export function prepare(argv: readonly string[], io?: RecorderIo): Plan;
export function run(argv: readonly string[], io?: RecorderIo): Promise<never>;
export function main(argv: readonly string[], io?: RecorderIo): Promise<number>;

/** The recorder that the start line of its journal names (P1-c5, n-5 of the G2 of c4). */
export const RECORDER: string;
/** One JSON line appended to a file of --out by one write: no link followed, one link alone (nlink 1), else out_not_l2, nothing written. */
export function appendLine(path: string, line: Record<string, unknown>, entry?: string): void;
/** A recording takes --out after prepare (P1-c5): guards again; a resumed output must be this recorder's; --out made, its real path and
 *  directory pinned (Linux: written through /proc/self/fd), guards again, the start line journaled, a first check. check(): the pin, guards
 *  of --out again, journal.jsonl and requests.jsonl of one link each, then the quota; a path changed on the way: out_not_l2. */
export function adopt(plan: Extract<Plan, { mode: "record" }>, io: { wallUs: () => number; monoNs: () => bigint }): { real: string; at: string; check: () => number };
/** At a start (Q-C1-4, P1-c5-bis-a): the tails of the last segments of the last run's connections, each journaled once (tail_marked). */
export function markTails(at: string, io: { wallUs: () => number; monoNs: () => bigint }): import("./l2/segments.mjs").Tail[];
