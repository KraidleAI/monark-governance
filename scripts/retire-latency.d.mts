// scripts/retire-latency.d.mts -- type surface of scripts/retire-latency.mjs (lot R-b of ENGINE-ROW-RETIRE-PATH-1) for what the root test
// imports (spec-publish.d.mts precedent). Node ignores this file.
export interface Report {
  format: "retire-latency-report-v1"; cycle: "rehearsal" | "real" | "publication"; instants: { name: string; at: string; definition: string }[];
  steps_ms: { from: string; to: string; ms: number }[]; total_ms: number; ceiling: { days: number; exceeded: boolean; mention: string | null } | { days: number; applies: false; reason: string; mention: string | null };
  objective: { business_days: number; business_ms: number; met: boolean };
}
export const INSTANTS: readonly (readonly [string, string])[];
export const CEILING_DAYS: number;
export const OBJECTIVE_BUSINESS_DAYS: number;
export const NO_CEILING: string;
export class LatencyError extends Error { code: string; constructor(code: string, detail: string) }
export function businessMs(a: number, b: number): number;
export function report(input: unknown): Report;
export function main(argv: string[]): number;
