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
/** The cycle floor the tick passes per operator (A-6): zero. Bell's declared share (<OP>_CYCLE_SHARE, DC-6) is its only bound in a cycle;
 *  the account total is held by the scripted check of the sum of the shares. */
export const BELL_FLOORS = Object.freeze({ helius: 0, chainstack: 0 });
/** The bound of one tick's run, in seconds (the unit's TimeoutStartSec): a tick that may still run when an operator's next cycle starts is
 *  refused cycle_boundary_straddle. A declared upper bound until the rehearsal measures the worst tick (G0 N-3); then 1.25 times it. */
export const TICK_TIMEOUT_START_SEC = 7200;
// The handoff layout of G0 DC-3: four top-level directories, none nested in another, each made by an act before any unit. The collection
// stages a packet INSIDE the handoff directory under the staging prefix, then renames it; the setgid bit of that directory gives the
// packet the handoff group, through which the publisher reads it. Proved with real users and groups by test/bell-handoff-perms.test.ts.
/** The collection's user, the publisher's user (unchanged) and the group through which each reads the other's side of the handoff. */
export const BELL_COLLECT_USER = "bell-collect";
export const BELL_PUBLISH_USER = "bell";
export const BELL_HANDOFF_GROUP = "bell-handoff";
/** A packet is written as <prefix>unit-<D>, then renamed unit-<D>; the publisher ignores every name with this prefix. */
export const BELL_STAGING_PREFIX = ".tmp-";
/** Each directory's path, owner, group and mode: the collection's private side, the handoff (setgid), the publisher's status (setgid), the
 *  publisher's state (0755, unchanged; hidden from the collection by its unit, not by this mode). */
export const BELL_LAYOUT = Object.freeze({
  collect: Object.freeze({ path: "/var/lib/monark-bell-collect", owner: BELL_COLLECT_USER, group: BELL_COLLECT_USER, mode: 0o700 }),
  handoff: Object.freeze({ path: "/var/lib/monark-bell-handoff", owner: BELL_COLLECT_USER, group: BELL_HANDOFF_GROUP, mode: 0o2750 }),
  status: Object.freeze({ path: "/var/lib/monark-bell-status", owner: BELL_PUBLISH_USER, group: BELL_HANDOFF_GROUP, mode: 0o2750 }),
  state: Object.freeze({ path: "/var/lib/monark-bell", owner: BELL_PUBLISH_USER, group: BELL_PUBLISH_USER, mode: 0o755 }),
});
