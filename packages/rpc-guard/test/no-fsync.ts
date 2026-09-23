// GARDE-FSYNC-1 pli-1 (orchestrator ruling I-10, 2026-09-22) - TEST SUPPORT ONLY. Exported WITH its importer (option
// Y, ruling 2026-09-23: a file under test/ is not a production path; the e2e proof of the guarded recorder stays in the
// public CI) and never referenced by a production source (asserted by durable.test.ts, mutants P2/P3). Imported ONLY
// by FUNCTIONAL test files that drive thousands of ledger appends and do not test
// durability (apps/sentinel/test/ukemi-guard-record.test.ts: 26 725 fsync measured). Importing it turns the platter
// flush of THIS test process into a counting no-op through the package's own seam (DURABLE_FS). No API option, no
// environment variable, no parameter. Durability keeps its REAL fsync in durable.test.ts and repair-tail.test.ts, and
// durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch loads the package by its production
// specifier in a fresh process and counts node:fs fsyncSync itself.
import { DURABLE_FS } from "../src/ledger.ts";

let skipped = 0;
DURABLE_FS.fsyncSync = () => { skipped++; };
/** The platter flushes this process skipped; the importing file asserts > 0 (the seam really engaged). */
export const flushesSkipped = (): number => skipped;
