// apps/bell/scripts/bell-validate.d.mts -- type surface of bell-validate.mjs (TS7016 sidecar, precedent bell-publish.d.mts), the
// validation of a run and of a bundle that bell-publish.mjs re-exports. Runtime = bell-validate.mjs.
import type { Dirent } from "node:fs";

export type RefusalCode = "inbox_not_exactly_one_bundle" | "too_many_runs" | "input_too_large" | "schema_mismatch" | "unknown_field"
  | "bell_sha_mismatch" | "close_like_field" | "session_not_yet_publishable" | "run_timeline_broken" | "provenance_binding_mismatch"
  | "url_or_key_shaped_string" | "duplicate_run" | "public_state_too_large" | "line_too_large" | "existing_timeline_corrupt"
  | "signing_key_missing" | "signing_key_not_in_keyring" | "no_timeline" | "key_already_in_keyring" | "revocation_invalid" | "key_file_exists"
  | "handoff_start_missing" | "start_mark_exists" | "start_mark_not_after_bundles" | "window_overlaps_published" | "lock_held" | "clock_unsynced" | "manifest_mismatch"
  | "rotation_line_mismatch";
export const REFUSAL_CODES: readonly RefusalCode[];
export class BellPublishError extends Error {
  readonly code: RefusalCode;
  readonly detail: string;
  constructor(code: RefusalCode, detail: string);
}
export interface Bounds {
  MAX_RUNS: number;
  MAX_INPUT_FILE_BYTES: number;
  MAX_PUBLIC_STATE_BYTES: number;
  MAX_LINE_BYTES: number;
}
export const BOUNDS: Readonly<Bounds>;
/** "scalar" | "scalar[]" | "<object name>" | ["<object name>"] */
export type Shape = string | readonly [string];
export const WHITELIST: Readonly<Record<string, Readonly<Record<string, Shape>>>>;
export const NOT_SERVED: Readonly<Record<string, Readonly<Record<string, Shape>>>>;
export const KEY_SHAPES: readonly RegExp[];
/** One validated run: its bell_sha, its state as written, the served projection of its provenance, its timeline records. */
export interface ValidatedRun {
  bellSha: string;
  state: Record<string, unknown>;
  projection: Record<string, unknown>;
  records: Record<string, unknown>[];
}
/** C-in-1..8 for one run directory `dir` (entry `ent` of its bundle), `at` the JSON path of the run, `t` the clock of C-in-5. */
export function validateRun(ent: Dirent, dir: string, at: string, B: Readonly<Bounds>, t: number): ValidatedRun;
/** C-in-1 and C-in-10 for one bundle directory (B the full bounds); the runs sorted by bell_sha, or a BellPublishError. */
export function validateBundle(bundleDir: string, B: Readonly<Bounds>, t: number): ValidatedRun[];
/** The closed grammar of a bundle name: unit-<D> or unit-<D>-r<n>, n from 1 to 99. */
export const UNIT_NAME: RegExp;
/** One manifest line: the sha256 of a file and its path relative to the bundle directory. */
export interface ManifestEntry {
  sha256: string;
  path: string;
}
/** The manifest text of a bundle directory: `<sha256>  <path>` + LF per file, paths in byte order. */
export function manifestOf(dir: string): string;
/** The entries of a manifest text, or null when it is not exactly the form manifestOf writes. */
export function readManifest(text: string): ManifestEntry[] | null;
