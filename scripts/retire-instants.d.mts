// scripts/retire-instants.d.mts -- type surface of scripts/retire-instants.mjs (lot RH-1, RETIRE-INSTANTS-1) for what the root test imports
// (retire-latency.d.mts precedent). Node ignores this file.
export interface Io { git?: (repo: string, sha: string) => string; read?: (file: string) => unknown }
export const KINDS: Readonly<Record<string, readonly string[]>>;
export function committerDate(repo: string, sha: string): string;
export function instant(name: string, source: unknown, io?: Io): string;
export function entry(evidence: unknown, io?: Io): { format: "retire-latency-v1"; cycle: string; instants: Record<string, string>; mention: string | null };
export function main(argv: string[], io?: Io): number;
