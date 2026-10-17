/**
 * Wave 2b kata rows at the import guard (docs/G0-lot-w2b-guard-admission-1.md): the mark of a wave 2b row (its source.registry_file, the
 * pinned wave3.json) and the six refusals of the wave 2b registry format, section « Admission at the guard ». Wave 2b rows are built on a
 * band region row of the seeded synthetic registry of block B1, projected under pins whose registry file is wave3.json: attempt 1, the
 * base test_delta of the horizon, a us-profile scale_table and a fit digest. This file imports only what the trunk exports, so that each
 * test is red at the trunk by an assertion (the trunk refuses every wave 2b row, under other names). Each test names its killer.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { sha256Canonical, type PolicyRow } from "@monark/contracts";
import { adjacencyTailFromCounts, ceilDecimal4, missUpperBound, riskControlMaxExceedances, zeroErrorFloor } from "@monark/hikae";
import { kataClassEntries } from "../src/policy-classes.ts";
import { guardKataRow, type GuardPins } from "../src/policy-guard.ts";
import { projectCell, readRegistry } from "../src/policy-projection.ts";
import { guardCalibChain } from "../src/policy-wave2.ts";
import { syntheticRegistry } from "./helpers/synthetic-registry.ts";

const SYN = syntheticRegistry();
const PINS: GuardPins = {
  registryFile: "wave3.json", registrySha256: SYN.sha256, generator: "synthetic-generator", verifiers: ["verifier-b"],
  attestation: () => ({ verifier: "verifier-b", report_sha256: "cd".repeat(32) }), text: (rule) => `text of ${rule}`,
};
const ENTRIES = kataClassEntries((c) => `class text of ${c}`);
const P1 = readRegistry(SYN.bytes).map((c) => projectCell(c, PINS)).find((r) => r?.task_class === "eth-mae-down-1h" && r.status === "region") ?? assert.fail("no row");
const digest = (s: string): string => createHash("sha256").update(s).digest("hex");
const block = (k: number, n: number): { k_test: number; n_test: number; u_test: string } => ({ k_test: k, n_test: n, u_test: k === n ? "1" : missUpperBound(n, k, "0.05") });
const strings = (m: number, a: number): [string | null, string | null] => { const x = adjacencyTailFromCounts(P1.n, m, a, "0.05"); return x.empty ? [null, null] : [x.num, x.den]; };
type H = "1h" | "4h";
/** The profile of a horizon as the projection writes it: profile.values then profile.weekend, 24 + 2 at 1h, 12 + 2 at 4h. */
const profile = (h: H, n = h === "1h" ? 26 : 14): number[] => Array.from({ length: n }, (_, i) => 0.75 + i / 64);
const table = (values: (number | null)[]): PolicyRow["scale_table"] => ({ kind: "us-profile", values, sha256: sha256Canonical(values) });
/** A wave 2b region row on P1 (n 740; k* 2 at 0.025, 1h; n0 368 at 1h, 299 at 4h): estimator `kata`, window `w`, its trial id with W2-CALIB. */
const w2b = (h: H = "1h", kata = "har-rv15-sp-v1", w = h === "1h" ? 168 : 42): PolicyRow => {
  const d = h === "1h" ? "0.025" : "0.05", ks = riskControlMaxExceedances(P1.n, P1.alpha, d), p = P1.n - ks, m = Math.min(P1.misses ?? 0, 37);
  const [tn, td] = strings(37, 1), [mn, md] = strings(m, 0), task_class = `eth-mae-down-${h}`;
  return {
    ...P1, task_class, horizon: h, kata_id: kata, w, cell_key: `kata:${kata}@${String(P1.venue)}/${String(P1.symbol)}/${h}/b0`, scale_table: table(profile(h)), fit_sha256: digest(`fit of ${kata}`),
    source: { ...P1.source, wave: 2, trial_id: [task_class, kata, P1.venue, P1.symbol, h, "W2-CALIB"].join("|") }, calib_attempt: 1, calib_cause: "initial", calib_parent: "none", test_delta: d,
    n_min: zeroErrorFloor(P1.alpha, d), k_star: ks, p_served: p, marginal_alpha: ceilDecimal4({ num: BigInt(P1.n + 1 - p), den: BigInt(P1.n + 1) }), misses: m, k_obs: m,
    miss_bound: missUpperBound(P1.n, ks, d), bound_on: "region", runs_miss: null, runs_aux: null, tail_frac: h === "1h" ? "0.95" : "0.90", tail_m: 37, tail_a: 1,
    tail_tail_num: tn, tail_tail_den: td, miss_adj_a: 0, miss_adj_tail_num: mn, miss_adj_tail_den: md, test: block(5, 700), bridge: block(5, 740), fwd: block(4, 700),
    vetoes: { test: false, bridge: false, fwd: false }, status: "region", status_reason: "",
  };
};
/** The status and reason of a row the guard admits, else its refusal (by the guard or by the closed row check it runs first); any other error is thrown again, so a crash fails the test and is never read as a verdict. */
const verdict = (r: PolicyRow): [string, string] | string => {
  try { guardKataRow(r, ENTRIES.find((e) => e.task_class === r.task_class) ?? assert.fail("no entry"), PINS); return [r.status, r.status_reason]; } catch (e) { if (e instanceof Error && /^MONARK (import guard|policy check): /.test(e.message)) return e.message; throw e; }
};
/** "admitted" for a chain the guard admits, else its refusal; any other error is thrown again. */
const chainVerdict = (rows: PolicyRow[]): string => { try { guardCalibChain(rows); return "admitted"; } catch (e) { if (e instanceof Error && e.message.startsWith("MONARK import guard: ")) return e.message; throw e; } };
/** The whole refusal of a row or a cell, `what` read as plain text between its key (task class and cell key) and the closing period. */
const whole = (what: string): RegExp => new RegExp(["^MONARK import guard: \\S+ \\S+ ", what.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "\\.$"].join(""));
const refused = (r: PolicyRow, re: RegExp): void => { const v = verdict(r); assert.ok(typeof v === "string", `admitted, not refused: ${String(re)}`); assert.match(v, re); };
const MARK = "is a wave 2 row whose columns disagree with its mark: a row of the pinned wave3.json (wave 2b) has scale_table kind us-profile and a fit_sha256; without that mark the guard admits wave 2 core band rows only, with neither";
const ATTEMPT = "is a wave 2b row off attempt 1 (calib_attempt 1, calib_cause initial, calib_parent none) or off the base test_delta of its horizon (0.025 at 1h, 0.05 at 4h): a later attempt of a wave 2b cell needs its own format";
const KATA = "is a wave 2b row whose kata_id is not one of the three wave 2b estimators or whose w is off its estimator (101; 168 at 1h and 42 at 4h; 1 to 720 at 1h and 1 to 180 at 4h)";
const PROFILE = "is a wave 2b row whose scale_table does not have 26 values at 1h or 14 at 4h, each a number above 0";
const CELL = "is a wave 2b cell with more than one attempt, or whose attempt 1 is not current while it is the only one (a later attempt of a wave 2b cell needs its own format)";

// killer: apps/harness/src/policy-guard.ts:57 CONST "is(w2b || (at" -> "is((at"
test("w2b_guard_admits_a_wave2b_row", () => {
  for (const h of ["1h", "4h"] as const) {
    for (const [kata, w] of [["har-rv15-sp-v1", h === "1h" ? 168 : 42], ["garch11-sf-sp-v1", 1], ["garch11-sf-sp-v1", h === "1h" ? 720 : 180], ["ewma-vol-sp-v1", 101]] as const) assert.deepEqual(verdict(w2b(h, kata, w)), ["region", ""], `${h} ${kata} ${String(w)}`);
    assert.equal(chainVerdict([w2b(h)]), "admitted", h);
  }
  assert.ok(w2b("1h").miss_bound !== w2b("4h").miss_bound && w2b("1h").n_min === 368 && w2b("4h").n_min === 299, "the two bases give two rules");
  const ks = riskControlMaxExceedances(300, P1.alpha, "0.025");
  const nulls = { p_served: null, k_obs: null, misses: null, qhat: null, miss_bound: null, marginal_alpha: null, bound_on: null, recompute: null, tail_m: null, tail_a: null, tail_tail_num: null, tail_tail_den: null, miss_adj_a: null, miss_adj_tail_num: null, miss_adj_tail_den: null };
  assert.deepEqual(verdict({ ...w2b(), ...nulls, n: 300, k_star: ks < 0 ? null : ks, status: "under_calib", status_reason: "n 300 below n0 368" }), ["under_calib", "n 300 below n0 368"]);
});

// killer: apps/harness/src/policy-wave2.ts:84 CONST "b === (r.fit_sha256 !== null)" -> "true"
test("w2b_guard_refuses_columns_off_the_mark", () => {
  const hours = P1.scale_table ?? assert.fail("no table");
  refused({ ...w2b(), fit_sha256: null }, whole(MARK));
  refused({ ...w2b(), scale_table: hours }, whole(MARK));
  refused({ ...w2b(), scale_table: null }, whole(MARK));
  const core = (r: PolicyRow): PolicyRow => ({ ...r, source: { ...r.source, registry_file: "wave2.json" } });
  refused(core(w2b()), whole(MARK));
  refused(core({ ...w2b(), scale_table: hours }), whole(MARK));
  refused(core({ ...w2b(), fit_sha256: null }), whole(MARK));
  refused({ ...w2b(), source: { ...w2b().source, registry_file: "kata/registry/wave3.json" } }, whole(MARK)); // the mark is the name the format writes
  refused({ ...w2b(), source: { ...w2b().source, wave: 1 } }, /carries a wave 2 column on a wave 1 row/); // the mark is read on wave 2 rows only
});

// killer: apps/harness/src/policy-wave2.ts:86 CONST "r.test_delta === w2bDelta(r.horizon)" -> "true"
test("w2b_guard_refuses_off_attempt_1_or_the_base_delta", () => {
  const parent = { ...w2b(), current: false };
  refused({ ...w2b(), calib_attempt: 2 }, whole(ATTEMPT));
  refused({ ...w2b(), calib_cause: "outcome", calib_parent: sha256Canonical(parent) }, whole(ATTEMPT));
  refused({ ...w2b(), calib_cause: "outcome" }, whole(ATTEMPT));
  refused({ ...w2b(), calib_parent: "00".repeat(32) }, whole(ATTEMPT));
  refused({ ...w2b(), calib_attempt: 2, calib_cause: "outcome", calib_parent: sha256Canonical(parent), test_delta: "0.0125" }, whole(ATTEMPT));
  refused({ ...w2b("1h"), test_delta: "0.05" }, whole(ATTEMPT));
  refused({ ...w2b("4h"), test_delta: "0.025" }, whole(ATTEMPT));
  refused({ ...w2b("4h"), test_delta: null }, whole(ATTEMPT));
  // n_min, k_star and miss_bound at that test_delta, each named by the clause that holds it on every row
  refused({ ...w2b("1h"), n_min: 299 }, /has n_min 299, not n0 368/);
  refused({ ...w2b("4h"), n_min: 368 }, /has n_min 368, not n0 299/);
  refused({ ...w2b("4h"), k_star: (w2b("4h").k_star ?? 0) + 1 }, /has a k_star the exact rule does not give/);
  refused({ ...w2b("1h"), miss_bound: w2b("4h").miss_bound }, /has a miss_bound or bound_on off the region rule/);
  refused({ ...w2b("4h"), miss_bound: w2b("1h").miss_bound }, /has a miss_bound or bound_on off the region rule/);
});

// killer: apps/harness/src/policy-wave2.ts:74 CONST "w <= (h === \"1h\" ? 720 : 180)" -> "w <= 720"
test("w2b_guard_refuses_a_kata_id_or_w_off_its_estimator", () => {
  const off: [H, string, number][] = [["1h", "ewma-vol-hw-v1", 101], ["1h", "constructor", 101], ["1h", "har-rv15-sp-v2", 168], ["1h", "har-rv15-sp-v1", 167], ["1h", "har-rv15-sp-v1", 169],
    ["1h", "har-rv15-sp-v1", 42], ["4h", "har-rv15-sp-v1", 168], ["1h", "garch11-sf-sp-v1", 721], ["4h", "garch11-sf-sp-v1", 181], ["1h", "ewma-vol-sp-v1", 100], ["4h", "ewma-vol-sp-v1", 102]];
  for (const [h, kata, w] of off) refused(w2b(h, kata, w), whole(KATA));
});

// killer: apps/harness/src/policy-wave2.ts:89 CONST "x !== null && x > 0" -> "true"
test("w2b_guard_refuses_a_profile_off_26_or_14_values", () => {
  for (const [h, n] of [["1h", 14], ["1h", 24], ["1h", 27], ["4h", 26], ["4h", 12], ["4h", 0]] as const) refused({ ...w2b(h), scale_table: table(profile(h, n)) }, whole(PROFILE));
  refused({ ...w2b("1h"), scale_table: table([...profile("1h", 25), null]) }, whole(PROFILE));
  refused({ ...w2b("4h"), scale_table: table([null, ...profile("4h", 13)]) }, whole(PROFILE));
  refused({ ...w2b("1h"), scale_table: table([...profile("1h", 25), 0]) }, /^MONARK policy check: /); // 0 and below: the closed row check, first
});

// killer: apps/harness/src/policy-wave2.ts:95 CONST "chain.length !== 1 || " -> ""
test("w2b_chain_one_current_attempt_per_cell", () => {
  const one = w2b(), parent = { ...one, current: false };
  const child: PolicyRow = { ...one, calib_attempt: 2, calib_cause: "outcome", calib_parent: sha256Canonical(parent), test_delta: "0.0125" };
  assert.equal(chainVerdict([one]), "admitted");
  assert.match(chainVerdict([parent]), whole(CELL));
  assert.match(chainVerdict([parent, child]), whole(CELL));
  assert.match(chainVerdict([child, parent]), whole(CELL));
  assert.match(chainVerdict([one, { ...child, current: false }]), whole(CELL)); // attempt 1 current, a second attempt after it
  assert.match(chainVerdict([parent, { ...child, source: { ...child.source, registry_file: "wave2.json" } }]), whole(CELL)); // a core row cannot follow a wave 2b row
  assert.match(chainVerdict([{ ...parent, source: { ...parent.source, registry_file: "wave2.json" } }, { ...child, calib_attempt: 1 }]), whole(CELL));
});
