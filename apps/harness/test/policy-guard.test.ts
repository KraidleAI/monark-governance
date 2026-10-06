/**
 * Import guard of kata rows, wave 1, and the 32 kata class entries (lot CM-4a-ii-a, block B2; docs/G0-lot-cm-4a-ii.md;
 * A-2 section 2.2 and its killers, section 5), on the seeded synthetic registry of block B1, never on wave1.json. Each
 * test names its killer above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertClosedClassEntry, sha256Canonical, type ClassEntry, type PolicyRow, type PolicyTable } from "@monark/contracts";
import { missUpperBound } from "@monark/hikae";
import { kataClassEntries } from "../src/policy-classes.ts";
import { guardKataRow, guardKataTable, type GuardPins } from "../src/policy-guard.ts";
import { projectCell, readRegistry } from "../src/policy-projection.ts";
import { buildPolicyTable } from "../src/policy-table-file.ts";
import { syntheticRegistry } from "./helpers/synthetic-registry.ts";

const SYN = syntheticRegistry();
const PINS: GuardPins = {
  registryFile: "synthetic.json", registrySha256: SYN.sha256, generator: "synthetic-generator", verifiers: ["verifier-b", "synthetic-generator"],
  attestation: () => ({ verifier: "verifier-b", report_sha256: "cd".repeat(32) }), text: (rule) => `text of ${rule}`,
};
const ENTRIES = kataClassEntries((c) => `class text of ${c}`);
const entry = (name: string): ClassEntry => ENTRIES.find((e) => e.task_class === name) ?? assert.fail(`no entry ${name}`);
const tableFrom = (name: string, bytes: Uint8Array, pins: GuardPins): PolicyTable =>
  buildPolicyTable(entry(name), readRegistry(bytes).filter((c) => c.taskClass === name).map((c) => projectCell(c, pins)).filter((r) => r !== null));
const CLASSES = ENTRIES.map((e) => e.task_class);
const ROWS = CLASSES.flatMap((name) => tableFrom(name, SYN.bytes, PINS).rows);
const find = (f: (r: PolicyRow) => boolean): PolicyRow => ROWS.find(f) ?? assert.fail("no such row");
const check = (r: PolicyRow, pins = PINS): void => guardKataRow(r, entry(r.task_class), pins);
const refuse = (r: PolicyRow, re: RegExp, pins = PINS): void => assert.throws(() => check(r, pins), re);
const dirRegion = find((r) => r.side !== null && r.status === "region" && (r.misses ?? 0) > 0);
const bandRegion = find((r) => r.side === null && r.status === "region");
const dirMisses = find((r) => r.side !== null && r.status === "silence" && r.qhat === 1);
const vetoed = find((r) => r.status === "vetoed");
const under = find((r) => r.status === "under_calib");
const retired = (cause: string, k: number | null, n: number | null, u: string | null, r = dirRegion): PolicyRow =>
  ({ ...r, status: "retired", status_reason: `retired: ${cause}`, retire: { cause, k_test: k, n_test: n, u_test: u }, bound_on: null, miss_bound: null });
const regionLike = (r: PolicyRow): PolicyRow => ({ ...r, status: "region", status_reason: "", bound_on: r.side === null ? "region" : "commit", miss_bound: missUpperBound(r.n, r.k_star ?? 0, "0.05") });

// killer: apps/harness/src/policy-classes.ts:19 CONST "\"0.45\"" -> "\"0.46\""
test("kata_class_entries_match_spec_section_9", () => {
  assert.equal(new Set(CLASSES).size, 32);
  for (const e of ENTRIES) {
    assertClosedClassEntry(e);
    assert.match(e.task_class, /^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$/);
    const dir = e.task_class.includes("-dir-");
    const want = dir ? ["set", "sign-set", "score", "0.45", 6, "up|down"] : ["interval", "scaled-band", "scale", "0.01", 299, null];
    assert.deepEqual([e.region_kind, e.region_rule, e.qhat_unit, e.alpha, e.n_min, e.label_schema], want, e.task_class);
    assert.deepEqual([e.statement, e.method, e.test_delta, e.h_ms, e.grid, e.cell_key_rule, e.cell_key_base, e.strata_cuts, e.text],
      ["per-calibration", "risk-control", "0.05", e.task_class.endsWith("-1h") ? 3_600_000 : 14_400_000, true, "kata-bucket", null, null, `class text of ${e.task_class}`]);
  }
});

type Cell = Record<string, unknown> & { test: Record<string, unknown>; calib: Record<string, unknown> };
const reforged = (edit: (rows: Cell[]) => void): { bytes: Uint8Array; pins: GuardPins } => {
  const reg = structuredClone(SYN.registry) as { rows: Cell[] };
  edit(reg.rows);
  const bytes = new TextEncoder().encode(JSON.stringify(reg));
  return { bytes, pins: { ...PINS, registrySha256: createHash("sha256").update(bytes).digest("hex") } };
};

// killer: apps/harness/src/policy-guard.ts:118 SDL "want(Object.keys(cell.test.months)" -> ""
test("guard_admits_every_synthetic_table", () => {
  for (const name of CLASSES) guardKataTable(tableFrom(name, SYN.bytes, PINS), SYN.bytes, PINS, entry(name));
  assert.deepEqual(new Set(ROWS.map((r) => r.status)), new Set(["region", "silence", "vetoed", "under_calib"]));
  const cls = dirRegion.task_class;
  const months = reforged((rows) => {
    const c = rows.find((x) => x.key === dirRegion.cell_key && x.taskClass === cls) ?? assert.fail("no cell");
    c.test = { ...c.test, months: { "2026-13": { n: 1, k: 0 } } };
  });
  assert.throws(() => guardKataTable(tableFrom(cls, months.bytes, months.pins), months.bytes, months.pins, entry(cls)), /test\.months key outside YYYY-MM/);
  const status = reforged((rows) => {
    const c = rows.find((x) => x.key === dirRegion.cell_key && x.taskClass === cls) ?? assert.fail("no cell");
    c.calib = { ...c.calib, status: "silence" };
  });
  assert.throws(() => guardKataTable(tableFrom(cls, status.bytes, status.pins), status.bytes, status.pins, entry(cls)), /calib\.status off the recomputed/);
});

// killer: apps/harness/src/policy-guard.ts:64 CONST "r.k_star === (ks < 0 ? null : ks)" -> "true"
test("guard_refuses_arithmetic_off_the_counts", () => {
  check(dirRegion);
  const r = dirRegion;
  refuse({ ...r, k_star: (r.k_star ?? 0) + 1 }, /k_star/);
  refuse({ ...r, miss_bound: "0.9999999" }, /miss_bound or bound_on off the region rule/);
  refuse({ ...r, marginal_alpha: "0.9999" }, /marginal_alpha/);
  refuse({ ...r, p_served: (r.p_served ?? 0) - 1 }, /p_served/);
  refuse({ ...r, n_min: 7 }, /n_min 7, not n0 6/);
});

// killer: apps/harness/src/policy-guard.ts:74 CONST "r.misses ?? -1" -> "r.k_obs ?? -1"
test("guard_direction_qhat_and_misses", () => {
  check(dirMisses);
  assert.equal(dirMisses.k_obs, 0);
  refuse({ ...regionLike(dirMisses), qhat: 0 }, /qhat or k_obs/);
  refuse({ ...dirRegion, qhat: 1, k_obs: 0 }, /qhat or k_obs/);
  refuse({ ...dirRegion, k_obs: (dirRegion.k_obs ?? 0) + 1 }, /qhat or k_obs/);
});

// killer: apps/harness/src/policy-guard.ts:89 SDL "is(r.status === st && r.status_reason === why" -> ""
test("guard_status_and_reason_recomputed", () => {
  for (const r of [dirMisses, vetoed, find((x) => x.status === "silence" && x.side === null)]) refuse(regionLike(r), /status/);
  refuse({ ...dirMisses, miss_bound: "0.5000000", bound_on: "commit" }, /miss_bound and bound_on not both set on a region row/); // declared redundancy: block A refuses first (G2 m-5); the guard clause itself: guard_refuses_arithmetic_off_the_counts
  refuse({ ...dirMisses, status_reason: "dependence check rejects" }, /reason/);
  refuse({ ...under, status_reason: "empty bucket" }, /off under_calib/);
  for (const r of ROWS.filter((x) => x.status === "under_calib")) check(r);
});

// killer: apps/harness/src/policy-guard.ts:84 CONST "calib === \"region\"" -> "calib === \"silence\""
test("guard_test_veto_conditional", () => {
  check(vetoed);
  refuse({ ...vetoed, status: "region", status_reason: "" }, /status 'region'/);
  refuse({ ...vetoed, vetoes: { test: false, bridge: null, fwd: null } }, /vetoes\.test/);
  const n = dirMisses.test?.n_test ?? 0;
  check({ ...dirMisses, test: { k_test: n, n_test: n, u_test: "1" } });
  refuse({ ...dirRegion, test: { k_test: n, n_test: n, u_test: "1" } }, /vetoes\.test/);
  refuse({ ...dirRegion, test: { ...(dirRegion.test ?? assert.fail("no test")), u_test: "0.9999999" } }, /u_test/);
});

// killer: apps/harness/src/policy-guard.ts:24 CONST "c.toLowerCase()" -> "c.toUpperCase()"
test("guard_recompute_and_verifiers", () => {
  const rc = dirRegion.recompute ?? assert.fail("no recompute");
  refuse({ ...dirRegion, recompute: null }, /without a recompute/);
  refuse({ ...dirRegion, recompute: { ...rc, scores_sha256: "00".repeat(32) } }, /without a recompute bound/);
  refuse({ ...dirRegion, recompute: { ...rc, verifier: "verifier-z" } }, /outside the pinned list/);
  for (const v of ["Synthetic-Generator", "synthetic-generator@other-revision"]) refuse({ ...dirRegion, recompute: { ...rc, verifier: v } }, /equal to the generator/);
  check({ ...dirRegion, recompute: { ...rc, verifier: "Verifier-B@rev2" } });
  refuse({ ...under, recompute: rc }, /under_calib with a calibrated column/);
});

// killer: apps/harness/src/policy-guard.ts:108 ROR "?? 0) > 0" -> "?? 0) >= 0"
test("guard_band_edges_and_support", () => {
  check(bandRegion);
  const b = (qhat: number, min: number, max: number): PolicyRow => ({ ...bandRegion, qhat, calib_support: { min, max } });
  refuse(b(1e-300, 1e-30, 1e-29), /band edge/);
  refuse(b(2 ** -1022, 1e-20, 1e-19), /band edge/);
  refuse(b(2 ** -1074, 1e-3, 1e-2), /normal double/);
  refuse(b(1e300, 1, 1e10), /band edge/);
  refuse(b(2, 0.02, 0.01), /min above max/);
  refuse({ ...dirRegion, qhat: -0 }, /qhat -0/);
});

// killer: apps/harness/src/policy-guard.ts:43 SDL "is(r.source.wave === 1" -> ""
test("guard_wave_couplings_and_grammars", () => {
  const r = dirRegion;
  refuse({ ...r, source: { ...r.source, wave: 2 } }, /wave 2 guard/);
  refuse({ ...r, bridge: { k_test: 0, n_test: 1, u_test: null }, vetoes: { test: false, bridge: false, fwd: null } }, /wave 2 column/);
  refuse({ ...r, tail_frac: "0.95" }, /wave 2 column/);
  const values = [1, 2, 3, 4, 5, 6, 7];
  refuse({ ...bandRegion, scale_table: { kind: "hour-of-week", values, sha256: sha256Canonical(values) } }, /scale_table/);
  refuse({ ...bandRegion, scale_table: { ...(bandRegion.scale_table ?? assert.fail("no table")), kind: "us-profile" } }, /scale_table/);
  refuse({ ...r, epoch: 2 }, /epoch/);
  refuse({ ...r, calib_cause: "epoch:EE-1/x" }, /pinned constants/);
  refuse({ ...r, source: { ...r.source, trial_id: `${String(r.source.trial_id)}x` } }, /trial_id/);
  refuse({ ...r, source: { ...r.source, generator: "other" } }, /source off the pins/);
  refuse({ ...r, horizon: r.horizon === "1h" ? "4h" : "1h" }, /horizon/);
  refuse({ ...r, symbol: "XRPUSDT", cell_key: r.cell_key.replace(String(r.symbol), "XRPUSDT") }, /symbol/);
  check(retired("live:1", 100, 100, "1"));
  check(retired("adr:decisions/0007-retire.md", null, null, null));
  refuse(retired("epoch:EE-1/x", null, null, null), /retire cause/);
  refuse(retired("live:1", 0, 100, missUpperBound(100, 0, "0.05")), /retire counts/);
  refuse(retired("adr:decisions/0007-retire.md", 100, 100, "1"), /retire counts/);
  refuse({ ...retired("live:1", 100, 100, "1"), status_reason: "retired: live:2" }, /reason/);
});

// killer: apps/harness/src/server.ts:31 CONST "./http.ts" -> "./policy-guard.ts"
test("guard_modules_are_not_served", () => {
  const src = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
  const seen = new Set<string>();
  const walk = (file: string): void => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const m of readFileSync(file, "utf8").matchAll(/(?:from|import)\s*\(?\s*"(\.{1,2}\/[^"]+)"/g)) walk(join(dirname(file), m[1] as string));
  };
  for (const f of ["server.ts", "http.ts", "openapi.ts", "schema-projection.ts", ...readdirSync(join(src, "tools")).map((t) => `tools/${t}`)]) walk(join(src, f));
  assert.ok(seen.size > 6 && seen.has(join(src, "http.ts")));
  // Block D (lot D-2): policy-classes.ts is served with the kata path; the import guard stays outside the served graph.
  for (const f of ["policy-guard.ts"]) assert.ok(!seen.has(join(src, f)), f);
});

// killer: apps/harness/src/policy-guard.ts:54 CONST "r.order === \"time\" && (w2 || r.current) && " -> "true && "
test("guard_pins_order_time_and_current", () => {
  for (const r of [{ ...dirRegion, order: "ascending" as const }, { ...dirRegion, current: false }, { ...bandRegion, order: "ascending" as const }]) refuse(r, /pinned constants of a wave 1 row \(order time, current/);
});

// killer: apps/harness/src/policy-guard.ts:67 SDL "is([t, r.bridge ?? t, r.fwd ?? t, r.retire ?? t].every(" -> ""
test("guard_names_k_test_above_n_test", () => {
  const n = dirRegion.test?.n_test ?? 0;
  refuse({ ...dirRegion, test: { k_test: n + 1, n_test: n, u_test: "1" } }, /k_test above its n_test/);
  refuse(retired("live:1", 101, 100, "1"), /k_test above its n_test/);
});

// killer: apps/harness/src/policy-guard.ts:75 SDL "is(m >= 0 && m <= r.n" -> ""
test("guard_names_misses_above_n", () => {
  const s = find((x) => x.side === null && x.status === "silence" && x.runs_miss !== "empty");
  refuse({ ...s, misses: s.n + 3, k_obs: s.n + 3 }, /misses outside 0\.\.n/);
});

// killer: apps/harness/src/policy-guard.ts:101 SDL "is(pins.verifiers.every(" -> ""
test("guard_requires_verifier_pins_as_identities", () => {
  for (const v of ["Verifier-B", "verifier-b@rev"]) refuse(dirRegion, /not an identity/, { ...PINS, verifiers: [v] });
});

// killer: apps/harness/src/policy-guard.ts:93 CONST "adr:decisions\\/[0-9A-Za-z]" -> "adr:[\\w./-]"
test("guard_adr_cause_under_decisions_only", () => {
  check(retired("adr:decisions/0007-retire.md", null, null, null));
  for (const c of ["adr:/x.md", "adr:../../etc.md", "adr:..md", "adr:decisions/../x.md", "adr:other/x.md"]) refuse(retired(c, null, null, null), /retire cause/);
});
