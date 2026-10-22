// scripts/bell-deploy.mjs -- deployment constants of MONARK Bell, collect side and probe side (scripts/probe-bell.mjs reads them too): the single source that the collection tick
// (apps/bell/src/tick.ts) and its tests read. No I/O, no code. Pinned by test/bell-deploy-constants.test.ts; the run and method caps
// copy the mode W3 line (one trading-day window) of the operator's launcher apps/bell/ops/launch-q6.sh, re-measured in rehearsal.
/** The EnvironmentFile's closed key set: the RPC endpoints and keys, the cash-leg keys, the cycle anchors (an ISO instant with its
 *  offset), the fixed share of each operator's cycle and the halts file, never absent (an empty file is an act). Shape only, no value printed, no floor key. */
export const BELL_COLLECT_ENV_KEYS = Object.freeze(["BELL_SOLANA_RPC", "HELIUS_API_KEY", "CHAINSTACK_SOLANA_URL", "DATABENTO_API_KEY", "POLYGON_API_KEY",
  "HELIUS_CYCLE_ANCHOR_UTC", "CHAINSTACK_CYCLE_ANCHOR_UTC", "HELIUS_CYCLE_SHARE", "CHAINSTACK_CYCLE_SHARE", "BELL_HALTS_CSV"]);
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
/** The age past which the tick produces the rebase trajectory again, in hours (launch-q6.sh TRAJ_MAX_AGE_H), re-measured in rehearsal (DC-4). */
export const TRAJ_MAX_AGE_H = 12;
/** The sha256 of the reference trajectory (launch-q6.sh REF_TRAJ_SHA256). The file is never in the repo: an act poses it in the tick's
 *  state/trajectory/, and each trajectory the tick uses must start with its events, mint by mint. */
export const REF_TRAJ_SHA256 = "dd165fbfd50f9658619355b77f44a018d955df1c16105de2ccf0882602af0195";
/** The ceiling of the cash close leg per tick, in USD, read by the free Databento cost query before any paid call (launch-q6.sh COST_CAP_USD). */
export const CASH_COST_CAP_USD = 1;
/** The shared multiplier authority of the universe's mints, base58, read on chain for TSLAx and AAPLx: the account --rebase-produce enumerates. */
export const BELL_AUTHORITY = "S7vYFFWH6BjJyEsdrPQpqpYTqLTrPRK6KW3VwsJuRaS";
/** The trajectory production's own caps. maxCalls is the cap of the course's two productions (they made 200 and 201 calls); the others
 *  never bind before it (2000 gTfA reservations of 100 credits, 2000 calls of 2 RU, one page per call), declared until the rehearsal measures them (N-3). */
export const BELL_PRODUCE_CAPS = Object.freeze({ maxCalls: 2000, maxCredits: 200000, maxRu: 4000, maxPages: 2000 });
/** The caps per RPC method of the trajectory production: each method may take every call of BELL_PRODUCE_CAPS. */
export const BELL_PRODUCE_METHOD_CAPS = Object.freeze({ getSignaturesForAddress: 2000, getTransaction: 2000, getAccountInfo: 2000, getTransactionsForAddress: 2000 });
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
// Part 3, lot 3b-ii (G0 DC-3, DC-4; PLAN-P3 C3-1 to C3-3): the handoff's two thresholds (BELL-STATUS-CONSTANTS-DEPLOY-1: DC-4 keeps caps and
// margins here; apps/bell/src/handoff-status.ts imports them), the committed units, the secrets directory, the collection's tree (which
// holds this file: Bell's key directory is never named here, bell_collect_unit_never_loads_the_signing_key).
/** The backlog threshold (DC-4, PLAN-P3 C3-2): above BACKLOG_MAX units awaiting publication, the tick refuses handoff_backlog. */
export const BACKLOG_MAX = 8;
/** The purge delay (DC-4, PLAN-P3 C3-2): seven days after the fact that allows the removal. */
export const PRUNE_AFTER_MS = 7 * 86_400_000;
/** The committed units (repository paths): the collection and its four-slot timer, and the publisher, which the collection starts at each
 *  end of a tick (OnSuccess= and OnFailure=, C3-1) and which has no timer of its own. Pinned by test/bell-collect-deploy.test.ts. */
export const BELL_COLLECT_UNIT = "deploy/monark-bell-collect.service";
export const BELL_COLLECT_TIMER = "deploy/monark-bell-collect.timer";
export const BELL_PUBLISH_UNIT = "deploy/monark-bell-publish.service";
/** The collection's secrets directory, masked from the publisher by this one name (DC-3 l.211, m-11), and the EnvironmentFile inside it
 *  (BELL_COLLECT_ENV_KEYS; root:bell-collect 0640, never committed, never printed). */
export const BELL_COLLECT_SECRETS_DIR = "/etc/monark/bell-collect";
export const BELL_COLLECT_ENV_FILE = "/etc/monark/bell-collect/collect.env";
/** The collection's dedicated tree (calque of the Dojo's: git archive at the G7 SHA, root-owned, read-only to the unit). */
export const BELL_COLLECT_TREE_ROOT = "/opt/monark-bell-collect";
/** The tree: the static import closure of its two programs, the tick (the unit's ExecStart) and the guard's served CLI (the RUNBOOK's unlock act,
 *  lot 3c), the package.json Node reads for them (the `type` scope, the `exports` of @monark/rpc-guard); never bell-publish.mjs (G0 N-4). Byte
 *  order. Pinned by bell_collect_tree_is_the_import_closure and run by bell_collect_unit_runs_the_real_tick. */
export const BELL_COLLECT_TREE_PATHS = Object.freeze(["apps/bell/package.json", "apps/bell/scripts/bell-chain.mjs", "apps/bell/scripts/bell-validate.mjs",
  "apps/bell/src/checks.ts", "apps/bell/src/close.ts", "apps/bell/src/collect.ts", "apps/bell/src/corporate-actions.ts", "apps/bell/src/digest.ts", "apps/bell/src/discover.ts",
  "apps/bell/src/ethereum.ts", "apps/bell/src/gap.ts", "apps/bell/src/halts.ts", "apps/bell/src/handoff-status.ts", "apps/bell/src/operators.ts",
  "apps/bell/src/plan.ts", "apps/bell/src/pools.ts", "apps/bell/src/quorum.ts", "apps/bell/src/reason-canon.ts", "apps/bell/src/rebase-crosscheck.ts",
  "apps/bell/src/rebase-produce.ts", "apps/bell/src/rebase-scan.ts", "apps/bell/src/rebase-trajectory.ts", "apps/bell/src/residuals.ts",
  "apps/bell/src/rpc.ts", "apps/bell/src/sessions.ts", "apps/bell/src/supply.ts", "apps/bell/src/tick.ts", "apps/bell/src/trajectory-check.ts",
  "apps/bell/src/volume.ts", "apps/sentinel/package.json", "apps/sentinel/src/rpc.ts", "apps/sentinel/src/ukemi/rpc2.ts", "packages/rpc-guard/bin/rpc-guard.mjs", "packages/rpc-guard/package.json",
  "packages/rpc-guard/src/bell-methods.ts", "packages/rpc-guard/src/classify.ts", "packages/rpc-guard/src/cli.ts", "packages/rpc-guard/src/client.ts",
  "packages/rpc-guard/src/cycle.ts", "packages/rpc-guard/src/errors.ts", "packages/rpc-guard/src/guarded.ts", "packages/rpc-guard/src/index.ts",
  "packages/rpc-guard/src/ledger.ts", "packages/rpc-guard/src/lock.ts", "packages/rpc-guard/src/reconcile.ts", "packages/rpc-guard/src/repair.ts",
  "packages/rpc-guard/src/tariff.ts", "packages/rpc-guard/src/transport.ts", "scripts/bell-deploy.mjs"]);
/** How the tree resolves @monark/rpc-guard without npm: [link inside the tree, its relative target] (the Dojo's DOJO_COLLECT_TREE_LINK). */
export const BELL_COLLECT_TREE_LINK = Object.freeze(["node_modules/@monark/rpc-guard", "../../packages/rpc-guard"]);
// Part 4, lot 4a (G0 DC-9, DC-15; PLAN-P4 C4-3, C4-5): the probe's two origins, the collection's slots and the publisher's start bound.
/** The origin Bell is served at (DC-15), read by the probe (lot 4a) and the CA (lot 5b): the former value, held until the three findings of
 *  DC-15 (domain bought, DNS records posed and resolved, certificate read), then https://offhoursbell.com by a dated line. */
export const BELL_PUBLIC_ORIGIN = "https://bell.monarkgate.tech";
/** The former origin, served byte for byte with the public one for life (Q-15). Equal to it until the switch: the probe compares nothing then, and says so. */
export const BELL_LEGACY_ORIGIN = "https://bell.monarkgate.tech";
/** The four UTC slots of the collection timer, in the order of its OnCalendar lines (BELL_COLLECT_TIMER l.13-16); pinned by the probe's freshness test. */
export const BELL_COLLECT_SLOTS_UTC = Object.freeze(["20:15", "21:15", "08:45", "09:45"]);
/** The publisher unit's TimeoutStartSec (BELL_PUBLISH_UNIT l.34): a publication started at the end of a tick ends within it. */
export const BELL_PUBLISH_TIMEOUT_START_SEC = 120;
