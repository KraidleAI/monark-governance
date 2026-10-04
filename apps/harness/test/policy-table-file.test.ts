/**
 * Class table files class-policy-v2 (lot CM-4a-i, block B1; docs/G0-lot-cm-4a-i.md; spec sections 9 and 10): class
 * entries, table file, byte for byte comparison, synthetic registry, served import graph. Each test names its killer.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertClosedClassEntry, sha256Canonical, type ClassEntry, type PolicyRow, type PolicyTable } from "@monark/contracts";
import { missUpperBound, riskControlMaxExceedances } from "@monark/hikae";
import { projectCell, readRegistry, type ProjectionInputs } from "../src/policy-projection.ts";
import { assertPolicyTableFile, assertTableMatchesRegistry, buildPolicyTable, kataClassEntries, policyTableSha256 } from "../src/policy-table-file.ts";
import { syntheticRegistry, testVetoFires } from "./helpers/synthetic-registry.ts";

const SYN = syntheticRegistry();
const CELLS = readRegistry(SYN.bytes);
const INP: ProjectionInputs = {
  registryFile: "synthetic.json", registrySha256: SYN.sha256, generator: "synthetic-generator",
  attestation: () => ({ verifier: "verifier-b", report_sha256: "cd".repeat(32) }), text: (rule) => `text of ${rule}`,
};
const CLASSES = new Map(kataClassEntries((c) => `class text of ${c}`).map((e) => [e.task_class, e]));
const cls = (name: string): ClassEntry => CLASSES.get(name) ?? assert.fail(`no class ${name}`);
const rowsOf = (name: string): PolicyRow[] => CELLS.filter((c) => c.taskClass === name).map((c) => projectCell(c, INP)).filter((r) => r !== null);
const tableOf = (name: string): PolicyTable => buildPolicyTable(cls(name), rowsOf(name));
const raw = (name: string, rows: PolicyRow[]): PolicyTable => ({ row_format: "class-policy-v2", class: cls(name), rows });

// killer: apps/harness/src/policy-table-file.ts:19 CONST "\"0.45\"" -> "\"0.46\""
test("kata_class_entries_match_spec_section_9", () => {
  assert.equal(CLASSES.size, 32);
  for (const e of CLASSES.values()) {
    assertClosedClassEntry(e);
    assert.match(e.task_class, /^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$/);
    const dir = e.task_class.includes("-dir-");
    const want = dir ? ["set", "sign-set", "score", "0.45", 6, "up|down"] : ["interval", "scaled-band", "scale", "0.01", 299, null];
    assert.deepEqual([e.region_kind, e.region_rule, e.qhat_unit, e.alpha, e.n_min, e.label_schema], want);
    assert.deepEqual([e.statement, e.method, e.test_delta, e.grid, e.cell_key_rule, e.cell_key_base, e.strata_cuts], ["per-calibration", "risk-control", "0.05", true, "kata-bucket", null, null]);
    assert.deepEqual([e.h_ms, e.text], [e.task_class.endsWith("-1h") ? 3_600_000 : 14_400_000, `class text of ${e.task_class}`]);
  }
});

// killer: apps/harness/src/policy-table-file.ts:39 ROR ">= 0" -> "> 0"
test("table_file_sorted_and_keyed", () => {
  const rows = rowsOf("btc-dir-1h");
  const t = buildPolicyTable(cls("btc-dir-1h"), [...rows].reverse());
  assert.deepEqual(t.rows.map((r) => r.cell_key), rows.map((r) => r.cell_key).sort());
  assert.equal(policyTableSha256(t), sha256Canonical(t));
  assert.throws(() => assertPolicyTableFile(raw("btc-dir-1h", [...t.rows].reverse())), /not sorted/);
  const first = t.rows[0] as PolicyRow;
  assert.throws(() => buildPolicyTable(cls("btc-dir-1h"), [...rows, { ...first, current: false }]), /repeated key/);
  assert.throws(() => buildPolicyTable(cls("btc-dir-1h"), [...rows, ...rowsOf("btc-dir-4h")]), /a row of btc-dir-4h in the file of btc-dir-1h/);
  const other = policyTableSha256(tableOf("eth-range-1h"));
  assert.notEqual(policyTableSha256(buildPolicyTable(cls("btc-dir-1h"), rows.slice(1))), policyTableSha256(t));
  assert.equal(policyTableSha256(tableOf("eth-range-1h")), other);
});

// killer: apps/harness/src/policy-table-file.ts:42 SDL "if (new Set(current).size" -> ""
test("table_file_one_current_per_cell", () => {
  const first = rowsOf("btc-dir-1h")[0] as PolicyRow;
  const twice = [first, { ...first, calib_attempt: 2 }];
  assert.throws(() => buildPolicyTable(cls("btc-dir-1h"), twice), /two current rows/);
  assert.equal(buildPolicyTable(cls("btc-dir-1h"), [{ ...first, current: false }, twice[1] as PolicyRow]).rows.length, 2);
});

// killer: apps/harness/src/policy-table-file.ts:63 SDL "if (createHash(\"sha256\")" -> ""
test("table_matches_registry_byte_for_byte", () => {
  for (const name of CLASSES.keys()) assertTableMatchesRegistry(tableOf(name), SYN.bytes, INP);
  const spaced = new TextEncoder().encode(`${new TextDecoder().decode(SYN.bytes)}\n`);
  assert.throws(() => assertTableMatchesRegistry(tableOf("btc-dir-1h"), spaced, INP), /pinned sha256/);
  assert.throws(() => assertTableMatchesRegistry(tableOf("btc-dir-1h"), SYN.bytes, { ...INP, registrySha256: "00".repeat(32) }), /pinned sha256/);
});

// killer: apps/harness/src/policy-table-file.ts:74 SDL "for (const key of want.keys())" -> ""
test("table_refuses_rows_off_the_projection", () => {
  const dir = tableOf("eth-dir-1h");
  const band = tableOf("btc-range-1h");
  const r0 = dir.rows[0] as PolicyRow;
  const b0 = band.rows[0] as PolicyRow;
  const altered: [PolicyTable, string][] = [
    [raw("eth-dir-1h", [{ ...r0, test: { k_test: (r0.test?.k_test ?? 0) + 1, n_test: r0.test?.n_test ?? 0, u_test: r0.test?.u_test ?? null } }, ...dir.rows.slice(1)]), "column test"],
    [raw("eth-dir-1h", [{ ...r0, thresholds: { t1: "0.5", t2: "0.75" } }, ...dir.rows.slice(1)]), "column thresholds"],
    [raw("eth-dir-1h", [{ ...r0, n: r0.n + 1 }, ...dir.rows.slice(1)]), "column n"],
    [raw("eth-dir-1h", [{ ...r0, alpha: "0.46" }, ...dir.rows.slice(1)]), "column alpha"],
    [raw("btc-range-1h", [{ ...b0, calib_support: { min: 0.5, max: 1 } }]), "column calib_support"],
    [buildPolicyTable(cls("eth-dir-1h"), [...dir.rows, { ...r0, cell_key: `${r0.cell_key}x` }]), "a row without a registry cell"],
    [raw("eth-dir-1h", dir.rows.slice(1)), "a projectable cell without its row"],
  ];
  for (const [t, what] of altered) assert.throws(() => assertTableMatchesRegistry(t, SYN.bytes, INP), (e: Error) => e.message.includes(what));
});

// killer: apps/harness/test/helpers/synthetic-registry.ts:75 CONST "n - kStar" -> "n - kStar + 1"
test("synthetic_registry_is_seeded_and_shaped", () => {
  assert.equal(syntheticRegistry(37).sha256, SYN.sha256);
  assert.notEqual(syntheticRegistry(38).sha256, SYN.sha256);
  assert.deepEqual([new Set(CELLS.map((c) => c.taskClass)).size, new Set(CELLS.map((c) => c.kataId)).size], [32, 8]);
  assert.deepEqual(new Set(CELLS.map((c) => c.hourOfWeekFactors?.length ?? 0)), new Set([0, 168, 42]));
  const reasons = new Set(CELLS.map((c) => `${c.status}|${c.calib.reason.replace(/\d+/g, "#")}`));
  for (const r of ["region|", "silence|misses # above k* #", "silence|dependence check rejects", "vetoed|", "under_calib|n # below n# #", "under_calib|empty bucket (no thresholds on this side)"]) assert.ok(reasons.has(r), r);
  for (const c of CELLS.filter((x) => x.calib.kStar !== null)) {
    assert.equal(c.calib.kStar, riskControlMaxExceedances(c.calib.n, c.alpha, c.testDelta));
    assert.deepEqual([c.calib.rank, c.calib.U], [c.calib.n - (c.calib.kStar ?? 0), missUpperBound(c.calib.n, c.calib.kStar ?? 0, c.testDelta)]);
    const fires = c.calib.status === "region" && c.test.kTest !== null && testVetoFires(c.test.nTest, c.test.kTest, c.alpha);
    assert.deepEqual([c.test.vetoed, c.status === "vetoed"], [fires, fires]);
  }
});

// killer: apps/harness/test/helpers/synthetic-registry.ts:58 CONST "? 1 : 0" -> "? 0 : 1"
test("synthetic_registry_counts_follow_a2", () => {
  for (const { side, calib: c, key } of CELLS.filter((x) => x.calib.kStar !== null)) {
    const [m, k] = [c.misses ?? NaN, c.kStar ?? NaN];
    assert.deepEqual([c.qhat, c.kObs], side === null ? [c.qhat, m] : m > k ? [1, 0] : [0, m], key);
    if (c.status === "region") assert.equal(c.check1 === "empty", m === 0, key);
    else assert.ok(m > k || [c.check1, c.check2].includes("reject"), key);
  }
});

// killer: apps/harness/src/server.ts:32 CONST "./version.ts" -> "./policy-table-file.ts"
test("policy_modules_are_not_served", () => {
  const src = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
  const seen = new Set<string>();
  const walk = (file: string): void => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const m of readFileSync(file, "utf8").matchAll(/(?:from|import)\s*\(?\s*"(\.{1,2}\/[^"]+)"/g)) walk(join(dirname(file), m[1] as string));
  };
  for (const f of ["server.ts", "http.ts", "openapi.ts", "schema-projection.ts", ...readdirSync(join(src, "tools")).map((t) => `tools/${t}`)]) walk(join(src, f));
  assert.ok(seen.size > 6 && seen.has(join(src, "class-policy.ts")));
  for (const f of ["policy-projection.ts", "policy-table-file.ts"]) assert.ok(!seen.has(join(src, f)), f);
});
