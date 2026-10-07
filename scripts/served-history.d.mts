// scripts/served-history.d.mts -- type surface of scripts/served-history.mjs for what the root test imports (retire-latency.d.mts
// precedent). Node ignores this file.
export interface HistoryLine {
  format: "kata-served-history-v1"; release_dir: string; task_class: string; policy_table_sha256: string; probe_record_sha256: string;
  merge_commit: string; t_e: string; t_f: string; ca_record_sha256: string;
}
export const FORMAT: string;
export const HISTORY_REL: string;
export const FIELDS: readonly string[];
export class HistoryError extends Error { code: string; constructor(code: string, detail: string) }
export function checkLine(l: unknown): HistoryLine;
export function compose(o: { root: string; releaseDir: string; mergeCommit: string; tE: string; caBytes: Uint8Array; probes: { name: string; bytes: Uint8Array }[] }): HistoryLine[];
export function render(existing: Uint8Array | null, lines: HistoryLine[]): string;
export function mergeInstant(root: string, commit: string): string;
export function main(argv: string[]): number;
