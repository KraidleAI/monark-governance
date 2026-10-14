// scripts/bell-deploy.mjs -- deployment constants of MONARK Bell, collect side: the single source that the collection tick
// (apps/bell/src/tick.ts) and its tests read. No I/O, no code. Pinned by test/bell-deploy-constants.test.ts; the run and method caps
// copy the mode W3 line (one trading-day window) of the operator's launcher apps/bell/ops/launch-q6.sh, re-measured in rehearsal.
/** The EnvironmentFile's closed key set: the RPC endpoints and keys, the cash-leg keys, the cycle anchors (an ISO instant with its
 *  offset) and the fixed share of each operator's cycle. The tick checks presence and shape only, never prints a value. No floor key. */
export const BELL_COLLECT_ENV_KEYS = Object.freeze(["BELL_SOLANA_RPC", "HELIUS_API_KEY", "CHAINSTACK_SOLANA_URL", "DATABENTO_API_KEY", "POLYGON_API_KEY",
  "HELIUS_CYCLE_ANCHOR_UTC", "CHAINSTACK_CYCLE_ANCHOR_UTC", "HELIUS_CYCLE_SHARE", "CHAINSTACK_CYCLE_SHARE"]);
/** The mints of a unit, one run each (never one mint alone); an extension is a dated line and the test that pins the list. */
export const BELL_UNIVERSE = Object.freeze(["TSLAx", "AAPLx"]);
/** The RPC operators of a run. */
export const BELL_OPERATORS = Object.freeze(["helius", "chainstack"]);
/** A unit is due once its end plus this indexing margin has passed (and every gate of its sessions). */
export const UNIT_DUE_MARGIN_MIN = 30;
/** At most one unit per tick (the planner's UNITS_PER_TICK, the same value). */
export const UNITS_PER_TICK = 1;
/** Attempts per unit, keyed on its start day D whatever the slot or the cause: the 8th is tried, the 9th exits stalled_unit. */
export const ATTEMPT_BUDGET = 8;
/** The caps of one run (launch-q6.sh, mode W3). */
export const BELL_RUN_CAPS = Object.freeze({ maxCredits: 150000, maxRu: 110000, maxCalls: 400000, maxPages: 20000 });
/** The caps per RPC method of one run (launch-q6.sh, mode W3). */
export const BELL_METHOD_CAPS = Object.freeze({ getSignaturesForAddress: 20000, getTransaction: 150000, getAccountInfo: 20, getTransactionsForAddress: 1 });
