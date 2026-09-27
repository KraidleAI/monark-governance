// scripts/dojo-deploy.mjs -- deployment constants of MONARK Dojo, collect side (ADR-DOJO-PR-3 D-1 table l.64, D-2, D-3 variant A, D-5):
// the single source read by the committed units, the RUNBOOK and the root tests (test/dojo-collect-deploy.test.ts). No I/O, no code.
// The publication side (DOJO_PUBLISH_TREE_PATHS, the publish unit) is not written here: the publisher does not exist yet (G1 journal).
/** The dedicated tree of the collect host (act A-3: git archive at the G7 SHA, root-owned, read-only to the unit). */
export const DOJO_COLLECT_TREE_ROOT = "/opt/monark-dojo-collect";
/** The programs the tree runs, each with its consumer (ADR-DOJO-PR-3 dated line 15:00Z): collect.ts (the unit's ExecStart),
 *  dojo-seed.mjs (act A-4), dojo-eve.mjs (act A-11-rep), the guard's served CLI (unlock, RUNBOOK section 9). */
export const DOJO_COLLECT_TREE_PROGRAMS = Object.freeze(["apps/dojo/src/collect.ts", "apps/dojo/scripts/dojo-seed.mjs", "apps/dojo/scripts/dojo-eve.mjs",
  "packages/rpc-guard/bin/rpc-guard.mjs"]);
/** The tree: the static import closure of those programs, the package.json Node reads for them (the `type` scope of each .ts file,
 *  the `exports` of @monark/rpc-guard), and out/mint.txt (--mint-file, TU-3). Byte order. Pinned by dojo_collect_tree_is_the_import_closure
 *  and run by dojo_collect_unit_runs_the_real_tick. */
export const DOJO_COLLECT_TREE_PATHS = Object.freeze(["apps/bell/scripts/bell-chain.mjs", "apps/dojo/package.json", "apps/dojo/scripts/dojo-core.mjs",
  "apps/dojo/scripts/dojo-eve.mjs", "apps/dojo/scripts/dojo-seed.mjs", "apps/dojo/src/bundle.ts", "apps/dojo/src/collect.ts", "apps/dojo/src/dojo-methods.ts",
  "apps/dojo/src/layout.ts", "apps/dojo/src/reading.ts", "out/mint.txt", "packages/rpc-guard/bin/rpc-guard.mjs", "packages/rpc-guard/package.json",
  "packages/rpc-guard/src/bell-methods.ts", "packages/rpc-guard/src/classify.ts", "packages/rpc-guard/src/cli.ts", "packages/rpc-guard/src/client.ts",
  "packages/rpc-guard/src/errors.ts", "packages/rpc-guard/src/guarded.ts", "packages/rpc-guard/src/index.ts", "packages/rpc-guard/src/ledger.ts",
  "packages/rpc-guard/src/lock.ts", "packages/rpc-guard/src/reconcile.ts", "packages/rpc-guard/src/repair.ts", "packages/rpc-guard/src/tariff.ts",
  "packages/rpc-guard/src/transport.ts"]);
/** How the tree resolves @monark/rpc-guard without npm (D-3 variant A): [link inside the tree, its relative target]. */
export const DOJO_COLLECT_TREE_LINK = Object.freeze(["node_modules/@monark/rpc-guard", "../../packages/rpc-guard"]);
/** The committed units of the collect side (repository paths). */
export const DOJO_COLLECT_UNIT = "deploy/monark-dojo-collect.service";
export const DOJO_COLLECT_TIMER = "deploy/monark-dojo-collect.timer";
/** The only writable path of the collect unit: bundles/ (D-7 layout) and ledger/ (the guard). */
export const DOJO_COLLECT_STATE = "/var/lib/monark-dojo-collect";
/** The EnvironmentFile (mandatory: no leading "-") and its closed key set: the guard's transport reads the first two
 *  (packages/rpc-guard/src/transport.ts), the collector the cycle keys (apps/dojo/src/dojo-methods.ts ENV_CYCLE_ID, ENV_CYCLE_FLOOR). */
export const DOJO_COLLECT_ENV_FILE = "/etc/monark/dojo-collect.env";
export const DOJO_COLLECT_ENV_KEYS = Object.freeze(["BELL_SOLANA_RPC", "HELIUS_API_KEY", "HELIUS_CYCLE_ID", "HELIUS_CYCLE_FLOOR"]);
/** The two credentials of the collect unit and their root:root 0600 sources (LoadCredential, read under $CREDENTIALS_DIRECTORY): the
 *  seed, and the anchor line in force (--anchor-file, DOJO-TICK-ARGV-1), which the unit reads and cannot replace (dated line 14:13Z, Q-2 (a)). */
export const DOJO_SEED_CREDENTIAL = "dojo-seed";
export const DOJO_SEED_SOURCE = "/etc/monark/dojo-collect/seed";
export const DOJO_ANCHOR_CREDENTIAL = "dojo-anchor";
export const DOJO_ANCHOR_SOURCE = "/etc/monark/dojo-collect/anchor.json";
/** The publisher's signing key, which the collect side never names in a directive (D-5; mere T-10). */
export const DOJO_SIGNING_CREDENTIAL = "dojo-signing-key";
/** The publication side the collect unit must never write or read (D-5): its key directory (masked, InaccessiblePaths) and its state. */
export const DOJO_SIGNING_KEY_DIR = "/etc/monark/dojo";
export const DOJO_PUBLISH_STATE = "/var/lib/monark-dojo";
