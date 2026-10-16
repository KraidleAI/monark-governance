// scripts/sentinel-witness.d.mts -- type surface of scripts/sentinel-witness.mjs (TS7016 sidecar, precedent sync-dojo-served.d.mts),
// so the type-checked root test test/sentinel-witness-cli.test.ts runs both commands in process, its GET injected. Runtime =
// sentinel-witness.mjs; Node ignores this file. Governance-only: neither file is whitelisted for the public export.
import type { TreeReader } from "../apps/sentinel/src/witness.ts";
export const ENTRY: string;
export const SERVED_TIMELINE: string;
/** The flags each command takes, as the argument parser reads them. */
export const COMMANDS: Readonly<Record<"print" | "compare", Readonly<{ required: readonly string[]; optional: readonly string[] }>>>;
export type Overlay = { readonly prefix: string; readonly sha: string };
/** A reader of a git tree, the files under the overlay's prefix read at its sha; git runs with no inherited GIT_* variable. */
export function gitTreeReader(repo: string, tree: string, overlay?: string | null): { reader: TreeReader; tree: string; overlay: Overlay | null };
/** The print command: the closure witness of apps/sentinel/src/run.ts on the composed tree. */
export function runPrint(o: { repo?: string; tree: string; overlay?: string | null }): { witness: string; files: string[]; tree: string; overlay: Overlay | null };
export type ServedLine = { readonly day: string; readonly sentinel_sha: string };
export function servedLines(text: string): ServedLine[];
export function httpsGet(url: string, fetchImpl?: typeof fetch): Promise<string>;
export type CompareResult = { status: "confirmed" | "mismatch" | "waiting"; exit: 0 | 1 | 2; day: string | null; served: string | null; expected: string };
/** The compare command: the first served line whose day follows afterDay, against the expected witness. */
export function runCompare(o: { expected: string; afterDay: string; get?: (url: string) => Promise<string>; url?: string }): Promise<CompareResult>;
export function parseArgs(argv: readonly string[]): { command: "print" | "compare"; flags: Record<string, string> };
