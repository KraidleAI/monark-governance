/**
 * The retire path of a served kata row, lot R-a of ENGINE-ROW-RETIRE-PATH-1 (docs/G0-lot-retire-path-ra.md; draft G0 sections
 * 4.1, 4.2 and 5, R-T1 to R-T6; ADR 0006 addendum 9, T-E7): the closed reader of a kata-retire-v1 list, the five-column overlay
 * of the projection under a pinned list, the served reading of a retired row, the cumulative list, the chain of dated lists read
 * by the guard and LIVE_N_MAX. On the seeded synthetic registry of block B1, never on wave1.json. Each test names its killer above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { canonicalJson, sha256Canonical, type CanonicalValue, type ClassEntry, type PolicyRow, type PolicyTable, type Prediction } from "@monark/contracts";
import { missUpperBound } from "@monark/hikae";
import { kataVerdictFields } from "../src/kata-path.ts";
import { KATA_BASE_DELTA, kataClassEntries } from "../src/policy-classes.ts";
import { guardKataRow, guardKataTable, type GuardPins } from "../src/policy-guard.ts";
import { projectCell, readRegistry, retireOverlay } from "../src/policy-projection.ts";
import { readRetireList, type RetireEntry, type RetireList, type RetirePin } from "../src/policy-retire.ts";
import { buildPolicyTable } from "../src/policy-table-file.ts";
import { guardCalibChain, LIVE_N_MAX } from "../src/policy-wave2.ts";
import { syntheticRegistry } from "./helpers/synthetic-registry.ts";

const SYN = syntheticRegistry();
const PINS: GuardPins = {
  registryFile: "synthetic.json", registrySha256: SYN.sha256, generator: "synthetic-generator", verifiers: ["verifier-b"],
  attestation: () => ({ verifier: "verifier-b", report_sha256: "cd".repeat(32) }), text: (rule) => `text of ${rule}`,
};
const entry = (name: string): ClassEntry => kataClassEntries((c) => `class text of ${c}`).find((e) => e.task_class === name) ?? assert.fail(name);
const ROWS = readRegistry(SYN.bytes).map((c) => projectCell(c, PINS)).filter((r) => r !== null);
const find = (f: (r: PolicyRow) => boolean): PolicyRow => ROWS.find(f) ?? assert.fail("no such row");
const DIR = find((r) => r.side !== null && r.status === "region" && (r.misses ?? 0) > 0);
const BAND = find((r) => r.side === null && r.status === "region");
const DATE = "retire-2027-01-05.json";
const ADR = "adr:decisions/0007-retire.md";
const sha = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");
/** An entry on row r: live:<k> with k_test = n_test (the veto fires, u_test 1), or adr: without counts. */
const entryOf = (r: PolicyRow, cause = "live:1", n = 100): RetireEntry => {
  const live = cause.startsWith("live:");
  return { calib_attempt: r.calib_attempt, cause, cell_key: r.cell_key, evidence_sha256: "ef".repeat(32), k_test: live ? n : null, n_test: live ? n : null, task_class: r.task_class, u_test: live ? "1" : null };
};
/** The pin of a value in its canonical writing, under a file name that carries the list's date. */
const pinOf = (value: unknown, file = DATE): RetirePin => {
  const bytes = new TextEncoder().encode(canonicalJson(value as CanonicalValue));
  return { file, sha256: sha(bytes), bytes };
};
const listOf = (entries: readonly unknown[], file = DATE): RetirePin => pinOf({ entries, format: "kata-retire-v1" }, file);
const read = (entries: readonly unknown[], file = DATE, previous?: RetireList): RetireList => readRetireList(listOf(entries, file), SYN.bytes, previous);
/** The table of r's class with r's row replaced by `row`. */
const tableWith = (r: PolicyRow, row: PolicyRow): PolicyTable => buildPolicyTable(entry(r.task_class), ROWS.filter((x) => x.task_class === r.task_class).map((x) => (x.cell_key === r.cell_key ? row : x)));
/** guardKataTable on the table t, its class entry and the chain of retire lists, oldest to newest (none: no row retired). */
const guard = (t: PolicyTable, ...retireLists: RetirePin[]): void => guardKataTable(t, SYN.bytes, { ...PINS, retireLists }, entry(t.class.task_class));
/** f() is admitted: a refusal fails the test by assertion (ERR_ASSERTION, the kill of scripts/red-proof.mjs and scripts/mutants/run.mjs). */
const admit = <T>(f: () => T): T => {
  try {
    return f();
  } catch (e) {
    return assert.fail(`refused: ${e instanceof Error ? e.message : String(e)}`);
  }
};

// killer: apps/harness/src/policy-retire.ts:65 CONST "v === \"kata-retire-v1\"" -> "true"
test("retire_list_reader_closed", () => {
  const ok = [entryOf(DIR), entryOf(BAND, ADR)];
  assert.deepEqual(admit(() => read(ok)), { date: "2027-01-05", entries: ok });
  const e = ok[0] as RetireEntry;
  const top = (over: Record<string, unknown>): Record<string, unknown> => ({ entries: [e], format: "kata-retire-v1", ...over });
  const cases: [unknown, RegExp][] = [
    [top({ format: "kata-retire-v2" }), /\.format is off the format kata-retire-v1/], [top({ extra: 1 }), /has an unknown key 'extra'/],
    [{ format: "kata-retire-v1" }, /misses the key 'entries'/], [top({ entries: [{ ...e, extra: 1 }] }), /entries\[0\] has an unknown key 'extra'/],
    [top({ entries: [Object.fromEntries(Object.entries(e).filter(([k]) => k !== "evidence_sha256"))] }), /entries\[0\] misses the key 'evidence_sha256'/],
    [top({ entries: [{ ...e, n_test: -1 }] }), /entries\[0\]\.n_test is off the format/], [top({ entries: [{ ...e, cell_key: `${e.cell_key}x` }] }), /names no cell of the registry/],
    [top({ entries: [{ ...e, task_class: "btc-dir-4h" }] }), /names no cell of the registry/], [top({ entries: [{ ...e, calib_attempt: 2 }] }), /not the current attempt 1 of its cell/],
    [top({ entries: [entryOf(find((r) => r.status === "vetoed"))] }), /serves no region \(registry status vetoed\)/],
    [top({ entries: [e, e] }), /not sorted by \(task_class, cell_key\), or a repeated cell/], [top({ entries: [...ok].reverse() }), /not sorted/],
    [top({ entries: [{ ...entryOf(DIR, ADR), cause: "epoch:EE-1/x" }] }), /cause outside live:<k> and adr:/], [top({ entries: [{ ...e, cause: ADR }] }), /counts off its cause/],
    [top({ entries: [{ ...e, k_test: 0, n_test: 0 }] }), /counts off its cause/], [top({ entries: [{ ...e, k_test: 101 }] }), /counts off its cause/],
  ];
  for (const [v, re] of cases) assert.throws(() => readRetireList(pinOf(v), SYN.bytes), re);
  const p = listOf(ok);
  assert.throws(() => readRetireList({ ...p, sha256: "00".repeat(32) }, SYN.bytes), /the bytes do not have the pinned sha256/);
  for (const bytes of [Buffer.concat([p.bytes, Buffer.from("\n")]), Buffer.from(JSON.stringify({ format: "kata-retire-v1", entries: ok })), Buffer.from("{")]) {
    assert.throws(() => readRetireList({ ...p, bytes, sha256: sha(bytes) }, SYN.bytes), /not one canonical JSON line/);
  }
  for (const file of ["retire.json", "retire-2027-02-30.json", "retire-2027-1-05.json", "x-retire-2027-01-05.json", "apps/harness/data/kata/retire/retire-2027-01-05.json"]) {
    assert.throws(() => readRetireList({ ...p, file }, SYN.bytes), /not named retire-<YYYY-MM-DD>\.json \(no directory\) on a real day/);
  }
});

// killer: apps/harness/src/policy-table-file.ts:52 CONST "retireOverlay(row, retired.find((e) => e.task_class === cls && e.cell_key === row.cell_key))" -> "row"
test("retired_row_matches_projection_under_pinned_list", () => {
  const e = entryOf(DIR);
  const t = tableWith(DIR, retireOverlay(DIR, e));
  admit(() => guard(t, listOf([e])));
  assert.throws(() => guard(t), /column bound_on differs from the projection/); // no list: the projection is the B1 row
  assert.throws(() => guard(t, listOf([entryOf(DIR, ADR)])), /column status_reason differs from the projection/); // another list
  assert.throws(() => guard(t, listOf([entryOf(BAND)])), /column bound_on differs from the projection/); // a list of another cell
  assert.throws(() => guard(tableWith(DIR, DIR), listOf([e])), /column bound_on differs from the projection/); // the listed row left in region
  admit(() => guard(tableWith(BAND, BAND), listOf([e]))); // the table of another class is unchanged by the list
  // The guard reads the list through the reader (M-1 of the verification): a pin that is not the digest of the bytes (a fixed
  // digest, or the bytes of another list under this list's pin) is refused, and so is live:1 on a list dated before E_1.
  const p = listOf([e]);
  for (const off of [{ ...p, sha256: "00".repeat(32) }, { ...p, bytes: listOf([entryOf(DIR, ADR)]).bytes }]) assert.throws(() => guard(t, off), /the bytes do not have the pinned sha256/);
  assert.throws(() => guard(t, listOf([e], "retire-2026-12-31.json")), /ends after the list's date/);
  // G-2 holds the counts of the overlaid row (draft 4.2): live:1, n_test 100, k_test 0 and its exact u_test, a veto that does not fire.
  const quiet: RetireEntry = { ...e, k_test: 0, u_test: missUpperBound(100, 0, KATA_BASE_DELTA) };
  assert.throws(() => guard(tableWith(DIR, retireOverlay(DIR, quiet)), listOf([quiet])), /binomial rule does not fire/);
});

// killer: apps/harness/src/policy-projection.ts:135 CONST "miss_bound: null, bound_on: null" -> "miss_bound: null"
test("retire_overlay_touches_five_columns_only", () => {
  for (const r of [DIR, BAND]) {
    const e = entryOf(r);
    const hand: PolicyRow = { ...r, status: "retired", status_reason: "retired: live:1", retire: { cause: "live:1", k_test: 100, n_test: 100, u_test: "1" }, miss_bound: null, bound_on: null };
    assert.equal(canonicalJson(retireOverlay(r, e)), canonicalJson(hand));
    assert.deepEqual(Object.keys(r).filter((k) => canonicalJson(r[k as keyof PolicyRow]) !== canonicalJson(hand[k as keyof PolicyRow])), ["bound_on", "miss_bound", "status", "status_reason", "retire"]);
    admit(() => guard(tableWith(r, hand), listOf([e])));
    const other: [string, unknown][] = [["qhat", (r.qhat ?? 0) + 1], ["text", "retired text"], ["scores_sha256", "00".repeat(32)], ["current", false]];
    for (const [k, v] of other) assert.throws(() => guard(tableWith(r, { ...hand, [k]: v }), listOf([e])), new RegExp(`column ${k} differs from the projection`));
  }
});

// killer: apps/harness/src/kata-path.ts:94 CONST "{ ...at, reason: calib }" -> "{ ...at, qhat: row.qhat, reason: calib }"
test("retired_row_keeps_calibration_qhat_audit_only", () => {
  for (const r of [DIR, BAND]) {
    const t = tableWith(r, retireOverlay(r, entryOf(r)));
    admit(() => guard(t, listOf([entryOf(r)])));
    const row = t.rows.find((x) => x.cell_key === r.cell_key) ?? assert.fail("no row");
    assert.equal(row.qhat, r.qhat); // the column keeps the calibration value, an audit record only (Q-E6): 0 on this dir row, served 1
    const dir = r.side !== null;
    const yhat = dir ? Number(r.thresholds?.t1) / 2 : ((r.calib_support?.min ?? NaN) + (r.calib_support?.max ?? NaN)) / 2;
    const p: Prediction = { schema_version: "1.0.0", task_class: r.task_class, yhat, predictor_id: r.cell_key.slice(0, r.cell_key.lastIndexOf("/")), produced_at: "2027-01-05T04:00:00Z", features_digest: "ab".repeat(32) };
    const v = kataVerdictFields(t, p, 1);
    assert.deepEqual([v.cell_key, v.region, v.qhat, v.abstain, v.reason, v.policy_row_sha256], [r.cell_key, dir ? { kind: "set", labels: ["up", "down"], label_schema: "up|down" } : null, dir ? 1 : null, true, "calib_retired", sha256Canonical(row)]);
  }
});

// killer: apps/harness/src/policy-retire.ts:83 CONST "previous.entries.every((e) => kept.has(canonicalJson(e)))" -> "true"
test("retired_row_stays_current_and_is_never_revived", () => {
  const [d, b] = [entryOf(DIR), entryOf(BAND, ADR)];
  const first = admit(() => read([d]));
  assert.deepEqual(admit(() => read([d, b], "retire-2027-01-06.json", first)).entries, [d, b]); // a dated list carries the earlier retires
  for (const next of [[b], [{ ...d, evidence_sha256: "aa".repeat(32) }, b]]) assert.throws(() => read(next, "retire-2027-01-06.json", first), /drops or changes an entry of the list of 2027-01-05/);
  assert.throws(() => read([d, b], DATE, first), /or is not dated after it/);
  // CONTRACT l.447: a row retired without a successor stays current, with status retired.
  const t = tableWith(DIR, retireOverlay(DIR, d));
  admit(() => guard(t, listOf([d])));
  assert.deepEqual(t.rows.filter((x) => x.status === "retired").map((x) => [x.cell_key, x.current]), [[DIR.cell_key, true]]);
  assert.throws(() => guard(tableWith(DIR, { ...retireOverlay(DIR, d), current: false }), listOf([d])), /column current differs from the projection/);
});

// killer: apps/harness/src/policy-guard.ts:118 CONST "readRetireList(pin, registryBytes, prev)" -> "readRetireList(pin, registryBytes)"
test("retire_lists_chain_through_the_guard", () => {
  // M-2 of the verification (draft 4.1, R-T5 in the guard): GuardPins.retireLists, oldest to newest, each read against its
  // predecessor; the newest overlays the projection. A later list that drops an earlier retire is refused, whatever the row's
  // status in the table (retired, or back in region): a retire never leaves the chain.
  const [d, b] = [entryOf(DIR), entryOf(BAND, ADR)];
  const t = tableWith(DIR, retireOverlay(DIR, d));
  const later = (entries: readonly unknown[]): RetirePin => listOf(entries, "retire-2027-01-06.json");
  admit(() => guard(t, listOf([d]), later([d, b])));
  for (const table of [t, tableWith(DIR, DIR)]) assert.throws(() => guard(table, listOf([d]), later([])), /drops or changes an entry of the list of 2027-01-05/);
  assert.throws(() => guard(t, later([d]), listOf([d])), /or is not dated after it/); // dates strictly increase along the chain
  // m-2: the registry pin is checked before any list reads the registry bytes (here not JSON): its named refusal, not a SyntaxError.
  const refusal = new RegExp(`^Error: MONARK policy table: ${t.class.task_class}: the registry bytes do not have the pinned sha256\\.$`);
  assert.throws(() => guardKataTable(t, new TextEncoder().encode("{"), { ...PINS, retireLists: [listOf([d])] }, entry(t.class.task_class)), refusal);
});

// killer: apps/harness/src/policy-wave2.ts:60 CONST "sha256Canonical(p)" -> "sha256Canonical({ ...p, current: true })"
test("retired_parent_digest_is_written_form", () => {
  // CONTRACT l.444, a declared pin of guardCalibChain (unchanged) on a parent built by the overlay: a future child (attempt 2, a
  // wave 2 band row) names the digest of the retired row written with current false; the form served while current is refused.
  const served = retireOverlay(BAND, entryOf(BAND));
  const parent: PolicyRow = { ...served, current: false };
  const child: PolicyRow = { ...BAND, source: { ...BAND.source, wave: 2 }, calib_attempt: 2, calib_cause: "outcome", calib_parent: sha256Canonical(parent) };
  admit(() => guardCalibChain([parent, child]));
  assert.throws(() => guardCalibChain([parent, { ...child, calib_parent: sha256Canonical(served) }]), /breaks the calib_parent chain at attempt 2/);
});

// killer: apps/harness/src/policy-guard.ts:94 ROR "(c.n_test ?? 0) <= (LIVE_N_MAX" -> "(c.n_test ?? 0) < (LIVE_N_MAX"
test("retire_live_n_test_bounded", () => {
  for (const [h, max] of [["1h", 2208], ["4h", 552]] as const) {
    const r = find((x) => x.status === "region" && x.horizon === h);
    const row = (n: number, k: number): PolicyRow => retireOverlay(r, { ...entryOf(r, "live:1", n), k_test: k });
    admit(() => guardKataRow(row(max, max), entry(r.task_class), PINS)); // at the bound, a k_test that fires is admitted
    for (const k of [max + 1, 0]) assert.throws(() => guardKataRow(row(max + 1, k), entry(r.task_class), PINS), /has a live:<k> n_test above LIVE_N_MAX \(2208 at 1h, 552 at 4h/); // the bound, before the veto
    admit(() => read([entryOf(r, "live:1", max)]));
    assert.throws(() => read([entryOf(r, "live:1", max + 1)]), new RegExp(`has an n_test above LIVE_N_MAX at ${h}`));
  }
  admit(() => guardKataRow(retireOverlay(DIR, entryOf(DIR, ADR)), entry(DIR.task_class), PINS)); // adr: causes unchanged
  assert.throws(() => guardKataRow(retireOverlay(DIR, { ...entryOf(DIR, ADR), k_test: 100, n_test: 100, u_test: "1" }), entry(DIR.task_class), PINS), /retire counts off its cause/);
  const silence = find((x) => x.status === "silence"); // m-1 of the verification: G-2 retires a region row only
  assert.throws(() => guardKataRow(retireOverlay(silence, entryOf(silence)), entry(silence.task_class), PINS), /retires a row that serves no region/);
});

// killer: apps/harness/src/policy-wave2.ts:16 CONST "\"1h\": 2208" -> "\"1h\": 2209"
test("live_n_max_is_longest_quarter", () => {
  // Addendum 9 point 1: Q_k = [S_k, E_k), S_k = 2026-10-01T00:00Z plus 3(k - 1) calendar months; point 5: 92 days at most.
  const days = Array.from({ length: 8 }, (_, i) => (Date.UTC(2026, 12 + 3 * i, 1) - Date.UTC(2026, 9 + 3 * i, 1)) / 86_400_000);
  assert.deepEqual(days, [92, 90, 91, 92, 92, 91, 91, 92]);
  const max = Math.max(...days);
  assert.deepEqual([max, LIVE_N_MAX], [92, { "1h": max * 24, "4h": max * 6 }]);
});

// killer: apps/harness/src/policy-retire.ts:80 ROR "1) <= day" -> "1) < day"
test("retire_live_entry_waits_for_its_quarter_end", () => {
  // Addendum 9 point 6, checked in the list (MONARK's review, section 4 point 5): E_k at or before 00:00Z of the list's date.
  for (const [cause, end] of [["live:1", "2027-01-01"], ["live:2", "2027-04-01"], ["live:5", "2028-01-01"]] as const) {
    admit(() => read([{ ...entryOf(DIR), cause }], `retire-${end}.json`));
    const eve = new Date(Date.parse(`${end}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
    assert.throws(() => read([{ ...entryOf(DIR), cause }], `retire-${eve}.json`), new RegExp(`names ${cause}, a quarter that ends after the list's date ${eve}`));
  }
  assert.throws(() => read([{ ...entryOf(DIR), cause: `live:${"9".repeat(20)}` }]), /a quarter that ends after the list's date/);
  admit(() => read([entryOf(DIR, ADR)], "retire-2026-10-06.json")); // an adr: retire has no quarter
});
