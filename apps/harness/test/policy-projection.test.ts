/**
 * Registry cell -> class-policy-v2 row (lot CM-4a-i, block B1; docs/G0-lot-cm-4a-i.md; A-2 section 2.2 point 1), on the
 * seeded synthetic registry (plan r3 section 5.3 point 8), never on wave1.json. Each test names its killer above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertClosedPolicyRow, canonicalJson, sha256Canonical, type PolicyRow } from "@monark/contracts";
import { NO_THRESHOLDS, projectCell, readRegistry, readRegistryCell, type ProjectionInputs, type RegistryCell } from "../src/policy-projection.ts";
import { syntheticRegistry } from "./helpers/synthetic-registry.ts";

const SYN = syntheticRegistry();
const CELLS = readRegistry(SYN.bytes);
const REPORT = "cd".repeat(32);
const INP: ProjectionInputs = {
  registryFile: "synthetic.json", registrySha256: SYN.sha256, generator: "synthetic-generator",
  attestation: () => ({ verifier: "verifier-b", report_sha256: REPORT }), text: (rule) => `text of ${rule}`,
};
const find = (f: (c: RegistryCell) => boolean): RegistryCell => CELLS.find(f) ?? assert.fail("no such cell");
const project = (c: RegistryCell, inp = INP): PolicyRow => projectCell(c, inp) ?? assert.fail(`no row for ${c.key}`);
const ceil4 = (n: number, rank: number): string => {
  const m = (BigInt(n + 1 - rank) * 10000n + BigInt(n)) / BigInt(n + 1);
  return `${String(m / 10000n)}.${String(m % 10000n).padStart(4, "0")}`;
};

// killer: apps/harness/src/policy-projection.ts:106 CONST "\"commit\"" -> "\"region\""
test("projection_direction_region_row", () => {
  const c = find((x) => x.side !== null && x.status === "region" && (x.calib.misses ?? 0) > 0);
  const r = project(c);
  assert.equal(r.region_rule, "sign-set");
  assert.equal(r.tau_cap, 1);
  assert.equal(r.bound_on, "commit");
  assert.equal(r.miss_bound, c.calib.U);
  assert.deepEqual([r.status, r.status_reason, r.qhat, r.k_obs, r.misses], ["region", "", 0, c.calib.misses, c.calib.misses]);
  assert.deepEqual(r.vetoes, { test: false, bridge: null, fwd: null });
  assert.deepEqual([r.n_min, r.n, r.k_star, r.p_served], [6, c.calib.n, c.calib.kStar, c.calib.n - (c.calib.kStar ?? NaN)]);
  assert.equal(r.marginal_alpha, ceil4(c.calib.n, c.calib.rank ?? NaN));
  assert.deepEqual([r.thresholds, r.scale_table, r.calib_support, r.fit_sha256], [c.thresholds, null, null, null]);
  assert.deepEqual([r.calib_cause, r.calib_parent, r.epoch, r.statement, r.alpha, r.test_delta], ["initial", "none", 1, "per-calibration", "0.45", "0.05"]);
  assert.deepEqual(r.test, { k_test: c.test.kTest, n_test: c.test.nTest, u_test: c.test.UTest });
  assert.equal(r.cell_key, c.key);
});

// killer: apps/harness/src/policy-projection.ts:102 CONST "\"hour-of-week\"" -> "\"us-profile\""
test("projection_band_region_row", () => {
  for (const h of ["1h", "4h"]) {
    const c = find((x) => x.side === null && x.status === "region" && x.horizon === h);
    const r = project(c);
    assert.equal(r.scale_table?.kind, "hour-of-week");
    assert.equal(r.scale_table.values.length, h === "1h" ? 168 : 42);
    assert.equal(r.scale_table.sha256, c.factorTableSha256);
    assert.equal(r.scale_table.sha256, sha256Canonical(r.scale_table.values));
    assert.deepEqual([r.region_rule, r.bound_on, r.tau_cap, r.n_min, r.side, r.bucket, r.thresholds], ["scaled-band", "region", null, 299, null, "b0", null]);
    assert.deepEqual(r.calib_support, c.calibSupport);
    assert.deepEqual([r.qhat, r.k_obs, r.miss_bound], [c.calib.qhat, c.calib.misses, c.calib.U]);
  }
});

// killer: apps/harness/src/policy-projection.ts:115 CONST "\"vetoed: test\"" -> "\"vetoed: bridge\""
test("projection_silence_and_vetoed_rows", () => {
  for (const reason of [/^misses \d+ above k\* \d+$/, /^dependence check rejects$/]) {
    const c = find((x) => x.status === "silence" && reason.test(x.calib.reason));
    const r = project(c);
    assert.deepEqual([r.status, r.status_reason, r.miss_bound, r.bound_on], ["silence", c.calib.reason, null, null]);
  }
  const v = find((x) => x.status === "vetoed");
  assert.deepEqual([v.calib.status, v.calib.reason, v.test.vetoed], ["region", "", true]);
  const r = project(v);
  assert.deepEqual([r.status, r.status_reason, r.miss_bound, r.bound_on], ["vetoed", "vetoed: test", null, null]);
  assert.deepEqual(r.vetoes, { test: true, bridge: null, fwd: null });
});

// killer: apps/harness/src/policy-projection.ts:109 CONST "c.misses" -> "c.kObs"
test("projection_misses_never_from_k_obs", () => {
  const c = find((x) => x.side !== null && x.status === "silence" && x.calib.qhat === 1);
  const r = project({ ...c, calib: { ...c.calib, kObs: 0, misses: 324 } });
  assert.deepEqual([r.k_obs, r.misses, r.qhat], [0, 324, 1]);
});

// killer: apps/harness/src/policy-projection.ts:83 CONST "\"n/a\"" -> "\"n/b\""
test("projection_under_calib_row", () => {
  for (const dir of [true, false]) {
    const c = find((x) => (x.side !== null) === dir && x.status === "under_calib" && (x.thresholds !== null) === dir);
    const r = projectCell(c, { ...INP, attestation: () => undefined }) ?? assert.fail("no row");
    assert.match(r.status_reason, /^n \d+ below n0 (6|299)$/);
    assert.deepEqual([r.runs_miss, r.runs_aux, r.recompute, r.k_star, r.p_served, r.marginal_alpha, r.qhat], [null, null, null, null, null, null, null]);
    assert.deepEqual([r.miss_bound, r.bound_on, r.runs_level, r.status], [null, null, "0.05", "under_calib"]);
  }
});

// killer: apps/harness/src/policy-projection.ts:91 SDL "if (cell.status !== \"under_calib\" || c.reason !== NO_THRESHOLDS)" -> ""
test("projection_side_without_thresholds_has_no_row", () => {
  const sides = CELLS.filter((x) => x.side !== null && x.thresholds === null);
  assert.equal(sides.length, 3);
  for (const c of sides) assert.equal(projectCell(c, INP), null);
  const c = sides[0] as RegistryCell;
  assert.equal(c.calib.reason, NO_THRESHOLDS);
  assert.throws(() => projectCell({ ...c, status: "silence" }, INP), /L-1/);
  assert.throws(() => projectCell({ ...c, calib: { ...c.calib, reason: "empty bucket" } }, INP), /L-1/);
});

// killer: apps/harness/src/policy-projection.ts:118 CONST "scores_sha256: c.scoresSha256" -> "scores_sha256: c.auxSha256"
test("projection_inputs_outside_the_registry", () => {
  const c = find((x) => x.status === "silence" && x.calib.auxSha256 !== x.calib.scoresSha256);
  const r = project(c);
  assert.deepEqual(r.recompute, { verifier: "verifier-b", scores_sha256: c.calib.scoresSha256, report_sha256: REPORT });
  assert.deepEqual(r.source, { registry_file: "synthetic.json", registry_sha256: SYN.sha256, trial_id: c.trialId, wave: 1, generator: "synthetic-generator" });
  assert.deepEqual([r.text, r.aux_sha256, r.series_sha256], ["text of sign-set", c.calib.auxSha256, c.seriesSha256]);
  assert.throws(() => projectCell(c, { ...INP, attestation: () => undefined }), /without a recompute attestation/);
});

// killer: apps/harness/src/policy-projection.ts:58 SDL "if (c.key !==" -> ""
test("registry_cell_closed_reader", () => {
  const raw = SYN.registry.rows.find((x) => x.side === null) ?? assert.fail("no scale cell");
  const calib = raw.calib as Record<string, unknown>;
  assert.equal(readRegistryCell(raw).key, raw.key);
  const bad: [Record<string, unknown>, RegExp][] = [
    [{ ...raw, extra: 1 }, /unknown key 'extra'/], [{ ...raw, calib: { ...calib, U: 0.5 } }, /calib.U is not a string/],
    [Object.fromEntries(Object.entries(raw).filter(([k]) => k !== "drops")), /misses the key 'drops'/],
    [{ ...raw, calib: { ...calib, check1: "maybe" } }, /check1 is not one of/], [{ ...raw, live1: {} }, /live1 is not one of/],
    [{ ...raw, key: String(raw.key).replace("/b0", "/up-b1") }, /key is not recomposed/],
    [{ ...raw, factorTableSha256: "00".repeat(32) }, /not the digest of the factors/], [{ ...raw, hourOfWeekFactors: null }, /mixes direction and scale/],
    [{ ...raw, thresholds: { t1: "0.1", t2: "0.5" } }, /mixes direction and scale/], [{ ...raw, calibAttempt: 2 }, /calibAttempt is not one of 1/],
    [{ ...raw, taskClass: String(raw.taskClass).replace(/-[a-z-]+-/, "-dir-") }, /taskClass does not match/], [{ ...raw, hourOfWeekFactors: [1], factorTableSha256: sha256Canonical([1]) }, /is not 168 values/],
  ];
  for (const [v, re] of bad) assert.throws(() => readRegistryCell(v), re);
  const top = JSON.parse(new TextDecoder().decode(SYN.bytes)) as Record<string, unknown>;
  assert.throws(() => readRegistry(new TextEncoder().encode(JSON.stringify({ ...top, extra: 1 }))), /registry has an unknown key/);
  assert.throws(() => readRegistry(new TextEncoder().encode(JSON.stringify({ ...top, rows: [...(top.rows as unknown[]), raw] }))), /repeats a \(taskClass, key\) pair/);
});

// killer: apps/harness/src/policy-projection.ts:94 SDL "if (c.rank !==" -> ""
test("projection_rank_is_n_minus_k_star", () => {
  for (const c of CELLS.filter((x) => x.calib.rank !== null)) assert.throws(() => projectCell({ ...c, calib: { ...c.calib, rank: (c.calib.rank ?? 0) + 1 } }, INP), /rank is not n - kStar/);
});

// killer: apps/harness/src/policy-projection.ts:112 CONST "\"0.05\"" -> "\"0.5\""
test("projected_rows_pass_the_closed_check", () => {
  const rows = CELLS.map((c) => projectCell(c, INP)).filter((r) => r !== null);
  assert.equal(rows.length, CELLS.length - 3);
  assert.deepEqual(new Set(rows.map((r) => r.status)), new Set(["region", "silence", "vetoed", "under_calib"]));
  for (const r of rows) {
    assertClosedPolicyRow(r);
    assert.deepEqual([r.runs_level, r.source.wave, r.current, r.order, r.tail_frac, r.bridge, r.retire], ["0.05", 1, true, "time", null, null, null]);
  }
  assert.equal(canonicalJson(rows), canonicalJson(readRegistry(SYN.bytes).map((c) => projectCell(c, INP)).filter((r) => r !== null)));
});
