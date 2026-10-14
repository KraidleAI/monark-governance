// scripts/bell-deploy.d.mts -- type surface of bell-deploy.mjs (TS7016 sidecar, precedent dojo-deploy.d.mts). Runtime = bell-deploy.mjs.
export const BELL_COLLECT_ENV_KEYS: readonly string[];
export const BELL_UNIVERSE: readonly string[];
export const BELL_OPERATORS: readonly string[];
export const UNIT_DUE_MARGIN_MIN: number;
export const UNITS_PER_TICK: number;
export const ATTEMPT_BUDGET: number;
export const BELL_RUN_CAPS: Readonly<{ maxCredits: number; maxRu: number; maxCalls: number; maxPages: number }>;
export const BELL_METHOD_CAPS: Readonly<{ getSignaturesForAddress: number; getTransaction: number; getAccountInfo: number; getTransactionsForAddress: number }>;
export const BELL_FLOORS: Readonly<{ helius: number; chainstack: number }>;
export const TICK_TIMEOUT_START_SEC: number;
export const TRAJ_MAX_AGE_H: number;
export const REF_TRAJ_SHA256: string;
export const CASH_COST_CAP_USD: number;
export const BELL_AUTHORITY: string;
export const BELL_PRODUCE_CAPS: Readonly<{ maxCalls: number; maxCredits: number; maxRu: number; maxPages: number }>;
export const BELL_PRODUCE_METHOD_CAPS: Readonly<{ getSignaturesForAddress: number; getTransaction: number; getAccountInfo: number; getTransactionsForAddress: number }>;
