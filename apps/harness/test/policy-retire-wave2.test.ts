/**
 * The retire list reader on a wave 2 core cell (RETIRE-READER-WAVE2-1; docs/G0-lot-retire-reader-wave2-1.md): the current attempt of
 * an entry is read at the date of its list, 2 only for a list dated on or after the day the cell's child becomes current, and an entry
 * carried unchanged from the previous list keeps attempt 1 (recherches kata/registry/FORMAT-wave2.md, the quarter counts; MONARK's
 * final check of that format, M-2). On the seeded synthetic registry of block B1 and children built here, never on a real registry
 * or list. Each test names its killer above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { canonicalJson, type PolicyRow } from "@monark/contracts";
import { projectCell, readRegistry, type ProjectionInputs } from "../src/policy-projection.ts";
import { readRetireList, type ChildCells, type RetireEntry, type RetireList, type RetirePin } from "../src/policy-retire.ts";
import { syntheticRegistry } from "./helpers/synthetic-registry.ts";

const SYN = syntheticRegistry();
const INPUTS: ProjectionInputs = {
  registryFile: "synthetic.json", registrySha256: SYN.sha256, generator: "synthetic-generator",
  attestation: () => ({ verifier: "verifier-b", report_sha256: "cd".repeat(32) }), text: (rule) => `text of ${rule}`,
};
const ROWS = readRegistry(SYN.bytes).map((c) => projectCell(c, INPUTS)).filter((r) => r !== null);
const find = (f: (r: PolicyRow) => boolean): PolicyRow => ROWS.find(f) ?? assert.fail("no such row");
const BAND = find((r) => r.side === null && r.status === "region");
const DIR = find((r) => r.side !== null && r.status === "region" && r.task_class !== BAND.task_class);
/** The day the child of BAND becomes current in these tests. */
const DAY = "2027-01-05";
const sha = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");
/** An entry on row r at attempt a: live:1 with k_test = n_test = 100, a veto that fires (u_test 1). */
const entryOf = (r: PolicyRow, a = 1): RetireEntry => ({ calib_attempt: a, cause: "live:1", cell_key: r.cell_key, evidence_sha256: (a === 1 ? "ef" : "ab").repeat(32), k_test: 100, n_test: 100, task_class: r.task_class, u_test: "1" });
const ONE = entryOf(BAND);
const TWO = entryOf(BAND, 2);
/** The children: the attempt 2 of r's cell, with its registry status and the day its row becomes current. */
const kids = (status = "region", current = DAY, r: PolicyRow = BAND): ChildCells => new Map([[`${r.task_class} ${r.cell_key}`, { status, current }]]);
const listOf = (entries: readonly RetireEntry[], day: string): RetirePin => {
  const bytes = new TextEncoder().encode(canonicalJson({ entries, format: "kata-retire-v1" }));
  return { file: `retire-${day}.json`, sha256: sha(bytes), bytes };
};
const read = (entries: readonly RetireEntry[], day: string, previous?: RetireList, children: ChildCells = kids()): RetireList => readRetireList(listOf(entries, day), SYN.bytes, previous, children);
/** f() is admitted: a refusal fails the test by assertion (ERR_ASSERTION, the kill of scripts/red-proof.mjs and scripts/mutants/run.mjs). */
const admit = <T>(f: () => T): T => {
  try {
    return f();
  } catch (e) {
    return assert.fail(`refused: ${e instanceof Error ? e.message : String(e)}`);
  }
};

// killer: apps/harness/src/policy-retire.ts:99 CONST "child !== undefined && child.current <= date ? 2 : 1" -> "1"
test("retire_list_attempt_2_on_a_wave2_cell", () => {
  // A list naming attempt 2 of a wave 2 region cell is admitted, on the day its child becomes current; a new entry on attempt 1 of
  // that cell is refused there.
  assert.deepEqual(admit(() => read([TWO], DAY)), { date: DAY, entries: [TWO] });
  assert.throws(() => read([ONE], DAY), /retires attempt 1, not the current attempt 2 of its cell on 2027-01-05/);
  // The parent retired first: L1, dated before the child is current, retires attempt 1; L2, dated after, cumulative, carries that
  // entry unchanged and adds attempt 2. Admitted with both registries (wave 1 and the children) given.
  const l1 = admit(() => read([ONE], "2027-01-04"));
  assert.deepEqual(admit(() => read([ONE, TWO], "2027-01-06", l1)).entries, [ONE, TWO]);
  // Without the children (the guard's reading today), every cell is at attempt 1: attempt 2 is refused.
  assert.throws(() => readRetireList(listOf([ONE, TWO], "2027-01-06"), SYN.bytes, l1), /retires attempt 2, not the current attempt 1 of its cell/);
});

// killer: apps/harness/src/policy-retire.ts:99 ROR "child.current <= date" -> "child.current < date"
test("retire_list_attempt_2_from_the_day_its_child_is_current", () => {
  // 2 only for a list dated on or after the day; 1 the day before.
  for (const [day, now] of [["2027-01-04", 1], [DAY, 2], ["2027-01-06", 2]] as const) {
    const [ok, off] = now === 2 ? [TWO, ONE] : [ONE, TWO];
    admit(() => read([ok], day));
    assert.throws(() => read([off], day), new RegExp(`not the current attempt ${String(now)} of its cell on ${day}`));
  }
  // The child of another cell leaves this one at attempt 1.
  admit(() => read([ONE], "2027-01-06", undefined, kids("region", DAY, DIR)));
  assert.throws(() => read([TWO], "2027-01-06", undefined, kids("region", DAY, DIR)), /not the current attempt 1 of its cell/);
});

// killer: apps/harness/src/policy-retire.ts:75 CONST " || (e.calib_attempt === 1 && carried(previous, e))" -> ""
test("retire_list_carried_attempt_1_entry_kept_after_its_child", () => {
  // An entry carried unchanged from the previous list keeps attempt 1 after the child is current, alone or beside attempt 2, along
  // the chain; changed, it is a new entry, and a new entry names the current attempt.
  const l1 = admit(() => read([ONE], "2027-01-04"));
  admit(() => read([ONE], "2027-01-06", l1));
  const l2 = admit(() => read([ONE, TWO], "2027-01-06", l1));
  const third = [ONE, TWO, entryOf(DIR)].sort((a, b) => (a.task_class < b.task_class ? -1 : a.task_class > b.task_class ? 1 : a.calib_attempt - b.calib_attempt));
  assert.deepEqual(admit(() => read(third, "2027-01-07", l2)).entries, third);
  const changed: RetireEntry = { ...ONE, evidence_sha256: "aa".repeat(32) };
  assert.throws(() => read([changed, TWO], "2027-01-06", l1), /retires attempt 1, not the current attempt 2 of its cell on 2027-01-06/);
  assert.throws(() => read([ONE, TWO], "2027-01-06"), /retires attempt 1, not the current attempt 2/); // no previous list: a new entry
});

// killer: apps/harness/src/policy-retire.ts:69 CONST "(p.cell_key > e.cell_key || (p.cell_key === e.cell_key && p.calib_attempt >= e.calib_attempt))" -> "p.cell_key >= e.cell_key"
test("retire_list_entries_of_one_cell_by_attempt", () => {
  // The list key is (task_class, cell_key, calib_attempt): one entry per attempt of a cell, in attempt order.
  const l1 = admit(() => read([ONE], "2027-01-04"));
  admit(() => read([ONE, TWO], "2027-01-06", l1));
  for (const off of [[TWO, ONE], [TWO, TWO], [ONE, ONE]]) assert.throws(() => read(off, "2027-01-06", l1), /not sorted by \(task_class, cell_key, calib_attempt\), or a repeated key, at .* \(one entry per attempt of a cell, in attempt order\)/);
});

// killer: apps/harness/src/policy-retire.ts:76 CONST "e.calib_attempt === 1 ? c.status : (child?.status ?? \"\")" -> "c.status"
test("retire_list_attempt_2_reads_the_status_of_its_child", () => {
  // The status test reads the status of the attempt named: the child's for attempt 2, the wave 1 cell's for attempt 1, also when an
  // attempt 1 entry is carried after the child is current.
  const vetoed = find((r) => r.status === "vetoed");
  const child = kids("region", DAY, vetoed);
  admit(() => read([entryOf(vetoed, 2)], DAY, undefined, child)); // a child that serves a region, its parent vetoed
  assert.throws(() => read([entryOf(vetoed)], "2027-01-04", undefined, child), /serves no region \(registry status vetoed\)/);
  for (const st of ["vetoed", "silence", "under_calib"]) assert.throws(() => read([TWO], DAY, undefined, kids(st)), new RegExp(`serves no region \\(registry status ${st}\\)`));
  // The parent retired first, then a child that serves no region: the carried attempt 1 entry reads its parent's status, region.
  // killer: apps/harness/src/policy-retire.ts:76 CONST "e.calib_attempt === 1 ? c.status" -> "now === 1 ? c.status"
  for (const st of ["vetoed", "silence", "under_calib"]) {
    const l1 = admit(() => read([ONE], "2027-01-04", undefined, kids(st)));
    assert.deepEqual(admit(() => read([ONE], "2027-01-06", l1, kids(st))).entries, [ONE]);
  }
});

// killer: apps/harness/src/policy-retire.ts:110 CONST "t >= 0 && new Date(t).toISOString().startsWith(d)" -> "true"
test("retire_list_child_current_day_is_a_real_day", () => {
  // The day a child becomes current is a real day written YYYY-MM-DD, refused by name otherwise when an entry of its cell is read.
  // A year or a month alone parses as its first day: the form YYYY-MM-DD refuses it.
  // killer: apps/harness/src/policy-retire.ts:110 CONST "/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(d) && " -> ""
  for (const day of ["2027-02-30", "2027-13-01", "2027-1-05", "", "2027-01-05T00:00:00Z", "2027-01", "2027"]) {
    assert.throws(() => read([ONE], "2027-01-06", undefined, kids("region", day)), new RegExp(`has a child whose current day '${day}' is not a real day YYYY-MM-DD`));
  }
  admit(() => read([ONE], "2027-01-06", undefined, kids("region", "2027-02-28")));
});
