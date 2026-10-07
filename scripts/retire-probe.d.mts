// scripts/retire-probe.d.mts -- type surface of scripts/retire-probe.mjs (lot RH-1, RETIRE-PROBE-1) for what the root test imports
// (retire-latency.d.mts precedent). Node ignores this file.
export interface ProbeRecord {
  format: "retire-probe-v1"; task_class: string; cell_key: string; table: string | null; api: string | null; api_host: string | null; produced_at: string; received_at: string;
  received_at_ms: string; status: number; served_cell_key: string | null; reason: string | null; policy_table_sha256: string | null; policy_row_sha256: string | null;
  expected_sha256: string; equal: boolean; ok: boolean; problem: string | null;
}
export type Transport = (url: string, body: string, hostHeader: string) => Promise<{ status: number; text: string } | { error: string }>;
export interface Asked { body: { prediction: Record<string, unknown> & { yhat: number; produced_at: string }; params: Record<string, unknown> }; cell: string; expected: string; row: object | null; hMs: number }
export const FORMAT: string;
export const MARGIN_MS: number;
export const MAX_WAIT_MS: number;
export class ProbeError extends Error { code: string; constructor(code: string, detail: string) }
export function plan(nowMs: number, hMs: number): { producedAtMs: number; waitMs: number };
export function call(tableBytes: Uint8Array, cell: string, producedAtMs: number): Asked;
export function judge(res: { status: number; text: string }, asked: Asked, receivedMs: number, where?: { table?: string | null; api?: string | null; apiHost?: string | null }): { record: ProbeRecord; problem: [string, string] | null };
export function wired(url: string, body: string, hostHeader: string, timeoutMs?: number): ReturnType<Transport>;
export function probe(o: { tableBytes: Uint8Array; cell: string; api: string; apiHost?: string; table?: string | null; maxWaitMs?: number; clock?: () => number; monotonic?: () => number; sleep?: (ms: number) => Promise<void>; transport?: Transport }): Promise<{ record: ProbeRecord; problem: [string, string] | null }>;
export function parseArgs(argv: string[]): Record<string, string>;
export function main(argv: string[], io?: { clock?: () => number; monotonic?: () => number; sleep?: (ms: number) => Promise<void>; transport?: Transport }): Promise<number>;
