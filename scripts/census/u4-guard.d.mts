// Type declarations for scripts/census/u4-guard.mjs (GARDE-HELIUS-2b-iii shared wiring for the U-4b course scripts).
// Governance surface for the type-checked tests that import canon/sha256Hex (guard-scripts-u4, u4b-oracle-path,
// u4b-select-episode). Runtime = the .mjs; Node ignores this file (skipLibCheck: true).

export function lfSha256(text: string): string;
/** Canonical JSON (keys sorted recursively) — BYTE-IDENTICAL to liquidation-logs.canon (pinned by a parity test). */
export function canon(obj: unknown): string;
export function sha256Hex(s: string): string;

export const CHAINSTACK_LABEL: string;

export function buildLabelLists(args: { withChainstack: boolean; excluded?: readonly string[] }): { ethCallLabels: string[]; getLogsLabels: string[] };
export function distinctLabels(labels: readonly string[]): string[];
export function parseBudgetArgs(arg: (k: string) => string | undefined, argv: readonly string[]): { ledgerDir: string; cycle: string; floor: number; maxRu: number; methodCaps: Record<string, number>; withChainstack: boolean };
export function assertLedgerDir(ledgerDir: string, root: string): string;

export interface GuardedClient {
  call(label: string, method: string, params: unknown): Promise<unknown>;
  operators(): string[];
}
export function openU4GuardedClient(args: {
  env: Record<string, string | undefined>;
  ledgerDir: string; cycle: string; floor: number; maxRu: number;
  methodCaps: Record<string, number>; maxCalls: number;
  ethCallLabels: readonly string[]; getLogsLabels: readonly string[];
  onTransportError?: (op: string, name?: string, code?: number) => void;
}): { client: GuardedClient; requested: string[] };
export function makeGuardedPoolCall(client: GuardedClient, opts?: { retries?: number; backoffMs?: number; backoffCapMs?: number }): {
  call: (label: string, method: string, params: unknown) => Promise<unknown>;
  total: () => number; byOperator: () => Record<string, number>; byMethod: () => Record<string, number>;
};
export function unlockAll(client: GuardedClient, args: { ledgerDir: string; cycle: string; floor: number; reason: string }): string[];
