// apps/bell/scripts/bell-report.d.mts — type surface for the pure aggregation/render functions that
// bell-report.mjs exports (behind a run-guard). Lets the type-checked oracle (report.test.ts) import them
// WITHOUT executing the CLI, staying free of the ratcheted no-unsafe rules. Runtime = bell-report.mjs.
export const REGIMES: readonly string[];

export interface RegimeAgg {
  sessions: number;
  withGt: number;
  exceed1: number;
  exceed5: number;
  abstain: number;
}
export interface ReportAggregate {
  byRegime: Record<string, RegimeAgg>;
  residuals: Record<string, number>;
}
export interface CongRef {
  frac1: string | number;
  frac5: string | number;
}
export interface ReportMeta {
  scriptSha: string;
  d9?: string;
  month?: string;
  cong?: Record<string, CongRef> | null;
}

/** Recursively find every `state.json` under a D9 directory (per-pool subdirs). Sorted. */
export function findStateFiles(dir: string): string[];

/** Aggregate the Cong Table 4 statistic by regime across a list of digests (state.json bodies or digests). */
export function aggregate(states: readonly unknown[]): ReportAggregate;

/** Render the Markdown report (a CONSTAT). `cong` values are procured (T-3), never fabricated. */
export function renderMarkdown(agg: ReportAggregate, meta: ReportMeta): string;
