// scripts/bell-deploy.d.mts -- type surface of bell-deploy.mjs (TS7016 sidecar, precedent dojo-deploy.d.mts). Runtime = bell-deploy.mjs.
export const BELL_COLLECT_ENV_KEYS: readonly string[];
export const BELL_UNIVERSE: readonly string[];
export const BELL_OPERATORS: readonly string[];
export const UNIT_DUE_MARGIN_MIN: number;
export const UNITS_PER_TICK: number;
export const ATTEMPT_BUDGET: number;
export const BELL_RUN_CAPS: Readonly<{ maxCredits: number; maxRu: number; maxCalls: number; maxPages: number }>;
export const BELL_METHOD_CAPS: Readonly<{ getSignaturesForAddress: number; getTransaction: number; getAccountInfo: number; getTransactionsForAddress: number }>;
