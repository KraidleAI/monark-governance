// scripts/detect-ee7-history.d.mts -- type surface of scripts/detect-ee7-history.mjs for the type-checked root test
// (test/detect-ee7-history.test.ts), which imports the detector without running it (run-guard) and feeds it synthetic month folders
// only. Runtime implementation = detect-ee7-history.mjs; Node ignores this file. Neither file is in the export whitelist
// (scripts/export-public.mjs): the detector reads a series that is not redistributable and stays out of the public tree.
export const PRODUCT: string;
export const SCHEMA: string;
export const CSV_NAME: string;
export const CSV_HEADER: string;
export const SEALED: readonly string[];
export const STEP_MS: number;
export const OPEN_RUN: number;
export const OPEN_BAND: string;
export const CALM_BAND: string;
export const CALM_SPAN_MS: number;
export const CALM_MIN_PRESENT: number;
export const KINDS: readonly EpisodeKind[];
export const STOPS: readonly string[];

/** An exact decimal: the fraction n / s, s a power of ten. */
export interface Decimal {
  n: bigint;
  s: bigint;
}

/** What main takes from its caller instead of the process: the test seam, never a command-line flag nor a variable. */
export interface DetectorIo {
  print?: (line: string, toStderr: boolean) => void;
}

/** The parsed command line: the root resolved, the window as instants in ms since the epoch (--to excluded). */
export interface DetectorArgs {
  root: string;
  from: number;
  to: number;
}

/** The kind of an episode, closed list (addendum 7; D-2 of lot EE7-ADD7-1): open-at-end (W4, still open at --to), lead-in (W3, an S
 *  that calm_certified_from does not certify: S before it, or no such instant) or episode. */
export type EpisodeKind = "episode" | "lead-in" | "open-at-end";

/** One episode: its kind; S and F as ISO 8601 UTC instants, F = --to for an episode still open at the end of the window (W4); its
 *  exclusion interval [exclude_from, F), exclude_from = S when calm_certified_from certifies S, --from otherwise (W3); the present reads
 *  of [S, F) and, C4 of addendum 5, the window's present reads of [F - 24 h, F), F = --to for an episode open at --to (D-5). */
export interface Episode {
  kind: EpisodeKind;
  S: string;
  F: string;
  exclude_from: string;
  present_reads_in_episode: number;
  present_reads_last_24h: number;
}

/** The closed report: instants, counts and sha256 digests, never a value. `edge` (information only): the present reads that depart
 *  in a row at the start and at the end of the window, absent reads skipped. `calm_certified_from` (F-1): the first instant f of the
 *  window whose day [f - 24 h, f) lies in the window and holds at least 48 present reads, all calm; null if none. An episode whose S
 *  is at or after it is that of a run over the whole recording; before it, an episode in progress at --from may be invisible or show a late S. */
export interface Ee7Report {
  source: {
    venue: string;
    product: string;
    granularity_s: number;
    months: { month: string; sha256sums: string }[];
    detector_sha256: string;
  };
  window: { from: string; to_exclusive: string };
  reads: { present: number; absent: number };
  edge: { start: number; end: number };
  calm_certified_from: string | null;
  episodes: Episode[];
  open_episode_at_end: string | null;
}

/** A named refusal: `code` is one of STOPS. */
export class DetectorStop extends Error {
  readonly code: string;
  readonly detail: Record<string, unknown>;
  constructor(code: string, detail?: Record<string, unknown>);
}

export function isoOf(ms: number): string;
export function parseTime(text: string): number;
export function parseArgs(argv: readonly string[]): DetectorArgs;
export function parseDecimal(text: string): Decimal | null;
export function deviationVersus(x: Decimal, band: Decimal): -1 | 0 | 1;
export function run(argv: readonly string[]): Ee7Report;
export function main(argv: readonly string[], io?: DetectorIo): number;
