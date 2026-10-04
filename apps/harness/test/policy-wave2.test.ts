/**
 * Wave 2 kata rows (lot CM-4a-ii-b, block B2; docs/G0-lot-cm-4a-ii-b.md): the W2-E tests of the counts entry of tail.ts
 * (zone exception of Q-F3; vectors of the piece tail-ts-entree-comptes), the tails recomputed from counts (addendum 8
 * section 1), the bridge and FWD-2 vetoes, the A-1 spend and calib_parent chain. Wave 2 rows are built on a band region row
 * of the seeded synthetic registry of block B1 (attempt 2, cause outcome, the wave 1 row as parent). Each test names its killer.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256Canonical, type PolicyRow } from "@monark/contracts";
import { adjacencyTailFromCounts, adjacencyUpperTail, ceilDecimal4, missUpperBound, riskControlMaxExceedances, tailRank, TailCountsError, zeroErrorFloor } from "@monark/hikae";
import { kataClassEntries } from "../src/policy-classes.ts";
import { guardKataRow, type GuardPins } from "../src/policy-guard.ts";
import { projectCell, readRegistry } from "../src/policy-projection.ts";
import { guardCalibChain } from "../src/policy-wave2.ts";
import { syntheticRegistry } from "./helpers/synthetic-registry.ts";

const SYN = syntheticRegistry();
const PINS: GuardPins = {
  registryFile: "synthetic.json", registrySha256: SYN.sha256, generator: "synthetic-generator", verifiers: ["verifier-b"],
  attestation: () => ({ verifier: "verifier-b", report_sha256: "cd".repeat(32) }), text: (rule) => `text of ${rule}`,
};
const CLS = kataClassEntries((c) => `class text of ${c}`).find((e) => e.task_class === "eth-mae-down-1h") ?? assert.fail("no entry");
const P1 = readRegistry(SYN.bytes).map((c) => projectCell(c, PINS)).find((r) => r?.task_class === CLS.task_class && r.status === "region") ?? assert.fail("no row");
const PARENT: PolicyRow = { ...P1, current: false };
const D2 = "0.025";
const KS = riskControlMaxExceedances(P1.n, P1.alpha, D2);
const check = (r: PolicyRow): void => guardKataRow(r, CLS, PINS);
const refuse = (r: PolicyRow, re: RegExp): void => assert.throws(() => check(r), re);
const block = (k: number, n: number): { k_test: number; n_test: number; u_test: string } => ({ k_test: k, n_test: n, u_test: k === n ? "1" : missUpperBound(n, k, "0.05") });
const strings = (m: number, a: number): [string | null, string | null] => {
  try {
    const x = adjacencyTailFromCounts(P1.n, m, a, "0.05");
    return x.empty ? [null, null] : [x.num, x.den];
  } catch {
    return [null, null];
  }
};
type Counts = { tail_m: number; tail_a: number; misses: number; miss_adj_a: number; bridge: [number, number]; fwd: [number, number] };
/** A wave 2 row on P1 (n 740 at 1h: r 703, n - r 37; n0 368 and k* 2 at test_delta 0.025), status and reason as given. */
const w2 = (c: Partial<Counts> = {}, st: [PolicyRow["status"], string] = ["region", ""]): PolicyRow => {
  const k: Counts = { tail_m: 37, tail_a: 1, misses: P1.misses ?? 0, miss_adj_a: 0, bridge: [5, 740], fwd: [4, 700], ...c };
  const [tn, td] = strings(k.tail_m, k.tail_a);
  const [mn, md] = strings(k.misses, k.miss_adj_a);
  const p = P1.n - KS;
  const region = st[0] === "region";
  return {
    ...P1, source: { ...P1.source, wave: 2, trial_id: String(P1.source.trial_id).replace(/CALIB$/, "W2-CALIB") }, calib_attempt: 2, test_delta: D2, calib_cause: "outcome",
    calib_parent: sha256Canonical(PARENT), n_min: zeroErrorFloor(P1.alpha, D2), k_star: KS, p_served: p, marginal_alpha: ceilDecimal4({ num: BigInt(P1.n + 1 - p), den: BigInt(P1.n + 1) }),
    misses: k.misses, k_obs: k.misses, miss_bound: region ? missUpperBound(P1.n, KS, D2) : null, bound_on: region ? "region" : null, runs_miss: null, runs_aux: null,
    tail_frac: "0.95", tail_m: k.tail_m, tail_a: k.tail_a, tail_tail_num: tn, tail_tail_den: td, miss_adj_a: k.miss_adj_a, miss_adj_tail_num: mn, miss_adj_tail_den: md,
    bridge: block(...k.bridge), fwd: block(...k.fwd), vetoes: { test: false, bridge: false, fwd: false }, status: st[0], status_reason: st[1],
  };
};
const code = (f: () => unknown, c: string): void => assert.throws(f, (e: unknown) => e instanceof TailCountsError && e.code === c);
const digest = (s: string): string => createHash("sha256").update(s).digest("hex");

// killer: packages/hikae/src/tail.ts:136 ROR "num * level.den <= level.num * den" -> "num * level.den < level.num * den"
test("w2e_tail_vectors", () => {
  const small: [number, number, number, string, string, boolean][] = [[7, 1, 0, "7", "7", false], [5, 5, 4, "1", "1", false], [20, 5, 4, "16", "15504", true],
    [40, 2, 1, "39", "780", true], [10, 3, 1, "64", "120", false], [2190, 12, 1, "1449144773947866051536726374635", "24653643824824107470565035095755", false]];
  for (const [n, m, a, num, den, reject] of small) assert.deepEqual(adjacencyTailFromCounts(n, m, a, "0.05"), { empty: false, num, den, reject }, `${String(n)} ${String(m)} ${String(a)}`);
  const d2 = adjacencyTailFromCounts(2190, 219, 30, "0.05");
  assert.ok(!d2.empty && d2.reject);
  assert.deepEqual([d2.num.length, digest(d2.num), d2.den.length, digest(d2.den)], [307, "b430a683e12f492f0023dc48e0d331ee15a443e25255a782e1d2f4d2b8de0532", 308, "c22f085b8cce36cfd40b6623d76bdf9344f42431b7303d38b6c983a0c449748d"]);
  assert.deepEqual(adjacencyTailFromCounts(10, 0, 0, "0.05"), { empty: true });
  code(() => adjacencyTailFromCounts(10, 3, 3, "0.05"), "a-outside-support");
  code(() => adjacencyTailFromCounts(10, 8, 4, "0.05"), "a-outside-support");
});

// killer: packages/hikae/src/tail.ts:117 SDL "if (n === 0) throw new TailCountsError(\"n-zero\", \"n = 0\");" -> ""
test("w2e_tail_edges_of_the_counts_entry", () => {
  code(() => adjacencyUpperTail([], "0.05"), "n-zero"); // G2 of #135, m-1: kata/w2c/test/tail-double.ts returns empty here
  code(() => adjacencyUpperTail([0, 0, 0], "1.5"), "level-not-unit-decimal"); // idem: the level is checked before empty
  assert.deepEqual([tailRank(8760, "0.95"), tailRank(2190, "0.90"), tailRank(8760, "0.90")], [8322, 1971, 7884]);
  code(() => tailRank(0, "0.95"), "n-zero");
  code(() => tailRank(10, "0.950x"), "tail-frac-not-unit-decimal");
  code(() => adjacencyTailFromCounts(0, 0, 0, "0.05"), "n-zero");
  code(() => adjacencyTailFromCounts(5, 6, 0, "0.05"), "m-above-n");
  code(() => adjacencyTailFromCounts(5, 1.5, 0, "0.05"), "count-not-integer");
});

// killer: apps/harness/src/policy-guard.ts:47 SDL "is(!w2 || (r.bridge !== null" -> ""
test("w2_guard_admits_a_wave2_row", () => {
  check(w2());
  guardCalibChain([PARENT, w2()]);
  const ks = riskControlMaxExceedances(300, P1.alpha, D2);
  const nulls = { p_served: null, k_obs: null, misses: null, qhat: null, miss_bound: null, marginal_alpha: null, bound_on: null, recompute: null, tail_m: null, tail_a: null, tail_tail_num: null, tail_tail_den: null, miss_adj_a: null, miss_adj_tail_num: null, miss_adj_tail_den: null };
  check({ ...w2(), ...nulls, n: 300, k_star: ks < 0 ? null : ks, status: "under_calib", status_reason: "n 300 below n0 368" });
  refuse({ ...w2(), tail_frac: "0.90" }, /tail_frac off 0\.95 at 1h/);
  refuse({ ...w2(), bridge: null, vetoes: { test: false, bridge: null, fwd: false } }, /without its bridge and fwd blocks/);
  refuse({ ...w2(), runs_miss: "pass", runs_aux: "pass" }, /wave 1 check outcomes/);
  refuse({ ...w2(), source: { ...w2().source, trial_id: P1.source.trial_id } }, /trial_id/);
  refuse({ ...w2(), source: { ...w2().source, wave: 3 } }, /wave 2 core band rows only/);
  refuse({ ...w2(), fit_sha256: "ab".repeat(32) }, /wave 2 core band rows only/);
});

// killer: apps/harness/src/policy-wave2.ts:39 CONST "canonicalJson([...strings(t), ...strings(c)])" -> "canonicalJson([r.tail_tail_num, r.tail_tail_den, r.miss_adj_tail_num, r.miss_adj_tail_den])"
test("w2_guard_refuses_a_reduced_tail", () => {
  const r = w2();
  const [num, den] = [BigInt(r.tail_tail_num ?? 0), BigInt(r.tail_tail_den ?? 1)];
  const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcd(b, a % b));
  const g = gcd(num, den);
  assert.ok(g > 1n);
  refuse({ ...r, tail_tail_num: String(num / g), tail_tail_den: String(den / g) }, /tail strings off the unreduced exact tails/);
  assert.deepEqual([r.miss_adj_tail_num, r.miss_adj_tail_den], ["740", "740"]);
  refuse({ ...r, miss_adj_tail_num: "1", miss_adj_tail_den: "1" }, /tail strings off the unreduced/);
  const empty = w2({ tail_m: 0, tail_a: 0 }, ["silence", "tail sequence constant (fails closed)"]);
  check(empty);
  refuse({ ...empty, tail_tail_num: "0", tail_tail_den: "1" }, /a null pair/);
});

// killer: apps/harness/src/policy-guard.ts:83 CONST "\"tail sequence constant (fails closed)\"" -> "\"auxiliary sequence constant (fails closed)\""
test("w2_guard_refuses_region_with_empty_or_low_tail", () => {
  const cases: [Partial<Counts>, string][] = [[{ tail_m: 0, tail_a: 0 }, "tail sequence constant (fails closed)"], [{ tail_a: 10 }, "dependence check rejects"], [{ misses: 2, miss_adj_a: 1 }, "dependence check rejects"]];
  for (const [c, why] of cases) {
    refuse(w2(c), /status 'region' and reason '', not 'silence'/);
    check(w2(c, ["silence", why]));
  }
  check(w2({ misses: 0, miss_adj_a: 0 })); // an empty check 1 is not a refusal (D2)
});

// killer: apps/harness/src/policy-wave2.ts:34 ROR "<= r.n - rank" -> "< r.n - rank"
test("w2_guard_tail_m_and_support", () => {
  check(w2({ tail_m: 37 }));
  refuse(w2({ tail_m: 38, tail_a: 1 }), /tail_m above n - r \(r 703\)/);
  refuse(w2({ tail_a: 37 }), /exact null of D2 refuses \(a-outside-support\)/);
  refuse(w2({ miss_adj_a: 1 }), /exact null of D2 refuses \(a-outside-support\)/);
  refuse({ ...w2(), tail_a: null }, /exact null of D2 refuses \(count-not-integer\)/);
});

// killer: apps/harness/src/policy-guard.ts:46 SDL "is(!w2 || r.n <= (W2_CALIB_N_MAX" -> ""
test("w2_guard_bounds_n_before_the_tails", () => {
  for (const n of [8761, 60_000, 2 ** 52]) refuse({ ...w2(), n }, /n above the CALIB-2 block/);
  refuse({ ...w2(), horizon: "4h", n: 2191 }, /n above the CALIB-2 block/);
});

// killer: apps/harness/src/policy-guard.ts:85 CONST "[\"bridge\", \"test\", \"fwd\"]" -> "[\"test\", \"bridge\", \"fwd\"]"
test("w2_guard_bridge_and_fwd_vetoes", () => {
  const vetoed = (c: Partial<Counts>, why: string, v: { test: boolean; bridge: boolean; fwd: boolean }, over: Partial<PolicyRow> = {}): PolicyRow => ({ ...w2(c, ["vetoed", why]), vetoes: v, ...over });
  check(vetoed({ bridge: [20, 740] }, "vetoed: bridge", { test: false, bridge: true, fwd: false }));
  check(vetoed({ fwd: [20, 700] }, "vetoed: fwd", { test: false, bridge: false, fwd: true }));
  check(vetoed({ bridge: [20, 740] }, "vetoed: bridge", { test: true, bridge: true, fwd: false }, { test: block(30, 740) }));
  refuse(w2({ bridge: [20, 740] }), /vetoes\.bridge/);
  refuse(vetoed({ fwd: [20, 700] }, "vetoed: fwd", { test: false, bridge: false, fwd: false }), /vetoes\.fwd/);
  const silent = w2({ tail_a: 10, bridge: [20, 740] }, ["silence", "dependence check rejects"]);
  check(silent);
  refuse({ ...silent, vetoes: { test: false, bridge: true, fwd: false } }, /off the conditional/);
  refuse({ ...w2(), bridge: { k_test: 5, n_test: 740, u_test: "0.9999999" } }, /u_test/);
  refuse({ ...w2(), fwd: { k_test: 701, n_test: 700, u_test: "1" } }, /k_test above its n_test/);
});

// killer: apps/harness/src/policy-guard.ts:56 CONST "spendDelta(KATA_BASE_DELTA, at)" -> "spendDelta(KATA_BASE_DELTA, 1)"
test("w2_guard_spend_and_causes", () => {
  check(w2());
  refuse({ ...w2(), test_delta: "0.05" }, /A-1 spend/);
  for (const cause of ["initial", "epoch:EE-1/x", "refresh:s@decisions/x.md"]) refuse({ ...w2(), calib_cause: cause }, /A-1 spend/);
  refuse({ ...w2(), calib_parent: "none" }, /A-1 spend/);
  refuse({ ...P1, calib_attempt: 2, test_delta: D2, calib_cause: "outcome", calib_parent: sha256Canonical(PARENT) }, /A-1 spend/);
  refuse({ ...w2(), calib_attempt: 1, test_delta: "0.05", calib_cause: "initial", calib_parent: "none" }, /A-1 spend/);
  refuse({ ...w2(), calib_attempt: 5 }, /calib_attempt/);
});

// killer: apps/harness/src/policy-wave2.ts:58 CONST "r.calib_parent === sha256Canonical(p)" -> "true"
test("w2_guard_calib_parent_chain", () => {
  guardCalibChain([w2(), PARENT]);
  const chain = (rows: PolicyRow[]): void => assert.throws(() => guardCalibChain(rows), /breaks the calib_parent chain/);
  chain([PARENT, { ...w2(), calib_parent: "00".repeat(32) }]);
  chain([P1, w2()]);
  chain([w2()]);
  chain([PARENT, { ...w2(), current: false }]);
  const values = [...(P1.scale_table?.values ?? [])].reverse();
  chain([PARENT, { ...w2(), scale_table: { kind: "hour-of-week", values, sha256: sha256Canonical(values) } }]);
  chain([PARENT, { ...w2(), calib_attempt: 3, test_delta: "0.0125" }]);
});

// killer: apps/harness/src/server.ts:31 CONST "./http.ts" -> "./policy-wave2.ts"
test("w2_module_is_not_served", () => {
  const src = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
  const seen = new Set<string>();
  const walk = (file: string): void => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const m of readFileSync(file, "utf8").matchAll(/(?:from|import)\s*\(?\s*"(\.{1,2}\/[^"]+)"/g)) walk(join(dirname(file), m[1] as string));
  };
  for (const f of ["server.ts", "http.ts", "openapi.ts", "schema-projection.ts", ...readdirSync(join(src, "tools")).map((t) => `tools/${t}`)]) walk(join(src, f));
  assert.ok(seen.size > 6 && seen.has(join(src, "http.ts")) && !seen.has(join(src, "policy-wave2.ts")));
});

/** G2 of lot b, B-1: a wave 2 row at attempt `at`, spend and counts recomputed at its test_delta (admitted before the fold). */
const atAttempt = (at: number, d: string): PolicyRow => {
  const ks = riskControlMaxExceedances(P1.n, P1.alpha, d);
  const p = P1.n - ks;
  return { ...w2(), calib_attempt: at, test_delta: d, n_min: zeroErrorFloor(P1.alpha, d), k_star: ks, p_served: p, marginal_alpha: ceilDecimal4({ num: BigInt(P1.n + 1 - p), den: BigInt(P1.n + 1) }), miss_bound: missUpperBound(P1.n, ks, d) };
};

// killer: apps/harness/src/policy-guard.ts:57 CONST "(w2 ? 2 : 1)" -> "(w2 ? Math.max(at, 2) : 1)"
test("w2_guard_attempt_2_only_on_wave_2", () => {
  check(w2());
  refuse(atAttempt(3, "0.0125"), /A-1 spend \(attempt 1 on wave 1, 2 on wave 2/);
  refuse(atAttempt(4, "0.00625"), /A-1 spend \(attempt 1 on wave 1, 2 on wave 2/);
});

// killer: apps/harness/src/policy-wave2.ts:58 CONST "(r.source.wave === 2 ? 2 : 1)" -> "r.calib_attempt"
test("w2_chain_attempt_2_only_on_wave_2", () => {
  const two = { ...w2(), current: false };
  guardCalibChain([PARENT, w2()]);
  assert.throws(() => guardCalibChain([PARENT, two, { ...atAttempt(3, "0.0125"), calib_parent: sha256Canonical(two) }]), /breaks the calib_parent chain at attempt 3/);
  // m-1, declared reading: the parent digest is of the replaced form (current false); the served form (current true) is refused
  assert.throws(() => guardCalibChain([PARENT, { ...w2(), calib_parent: sha256Canonical(P1) }]), /breaks the calib_parent chain at attempt 2/);
});

// killer: apps/harness/src/policy-guard.ts:66 SDL "is(!w2 || ([\"bridge\", \"test\", \"fwd\"] as const).every(" -> ""
test("w2_guard_bounds_n_test_of_each_block", () => {
  check(w2({ bridge: [5, 8760], fwd: [4, 4392] }));
  check({ ...w2(), test: block(11, 4392) });
  refuse(w2({ bridge: [5, 8761] }), /n_test above its block/);
  refuse(w2({ fwd: [4, 4393] }), /n_test above its block/);
  refuse({ ...w2(), test: block(11, 4393) }, /n_test above its block/);
});

const KS300 = riskControlMaxExceedances(300, P1.alpha, D2);
/** An under_calib wave 2 row (n 300 below n0 368): calibrated and tail columns null, every veto false. */
const UNDER: PolicyRow = {
  ...w2(), n: 300, k_star: KS300 < 0 ? null : KS300, status: "under_calib", status_reason: "n 300 below n0 368", p_served: null, k_obs: null, misses: null, qhat: null, miss_bound: null, marginal_alpha: null,
  bound_on: null, recompute: null, tail_m: null, tail_a: null, tail_tail_num: null, tail_tail_den: null, miss_adj_a: null, miss_adj_tail_num: null, miss_adj_tail_den: null,
};

// killer: apps/harness/src/policy-guard.ts:70 CONST "r.retire, ...tails]" -> "r.retire]"
test("w2_guard_under_calib_tail_columns_null", () => {
  check(UNDER);
  for (const c of [{ tail_m: 5 }, { tail_a: 1 }, { miss_adj_a: 0 }]) refuse({ ...UNDER, ...c }, /under_calib with a calibrated column set/);
});

// killer: apps/harness/src/policy-guard.ts:71 CONST "[r.vetoes?.test, ...(w2 ? [r.vetoes?.bridge, r.vetoes?.fwd] : [])]" -> "[r.vetoes?.test]"
test("w2_guard_under_calib_bridge_and_fwd_vetoes_false", () => {
  for (const v of [{ test: false, bridge: true, fwd: false }, { test: false, bridge: false, fwd: true }]) refuse({ ...UNDER, vetoes: v }, /veto off under_calib/);
});

// killer: apps/harness/src/policy-guard.ts:85 CONST "[\"bridge\", \"test\", \"fwd\"]" -> "[\"bridge\", \"fwd\", \"test\"]"
test("w2_guard_veto_order_test_before_fwd", () => {
  const both: PolicyRow = { ...w2({ fwd: [20, 700] }, ["vetoed", "vetoed: test"]), test: block(30, 740), vetoes: { test: true, bridge: false, fwd: true } };
  check(both);
  refuse({ ...both, status_reason: "vetoed: fwd" }, /not 'vetoed' and 'vetoed: test'/);
});
