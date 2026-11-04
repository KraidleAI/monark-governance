/**
 * HIKAE tracking (packages/hikae/src/suivi/replay.ts) - the replay of a cell's evidence into the budget the gate reads.
 * What the module computes: the labels entered in order from the evaluations and their arrived outcomes, then, label by label, the
 * O4 step, the detector step and the closure of an open segment by the sticky alarm; the budget is budgetNano read as a number.
 * How the expected values are computed. Never by the module: by hand, on exact rationals. Under PW the closure bet has the factors
 * 2 (miss) and 1/2 (no miss), so W = 2^(2k - t) and W reaches 64 = 1/delta_exh after six misses; the budget of an open segment is
 * floor(10^9 (1 - W/64)). The detector bet of PW, g = 1 + lambda (x/m - 1), has the factors 2 (miss) and 1/2 at m = 1/3, and
 * S <- (S + 1/(t (t + 1))) g gives, over consecutive misses, S = 1, 7/3, 29/6, 293/30, 98/5, 4121/105 (about 1, 2.33, 4.83, 9.77,
 * 19.6, 39.25): with alpha_arl = 1/8 the alarm rings at the fourth miss, with alpha_arl = 1/25 at the sixth, the label at which W closes.
 * The licence bet of PK has the factors 7/6 (no miss) and 2/3 (miss), and K licenses at K >= 49/36.
 * The comparison with the old calculation: the O4 rules stepped by this file, each crossing decided as the library did before
 * capitalCrosses, crosses(capitalOfCounts(...), delta) on the reduced capital, the budget computed as before capitalBudget, on reduced
 * fractions, and the detector stepped by the library; label by label against o4Step, and at the end against suiviReplay, on varied
 * policies, adversarial ones included.
 * Category: new-module (red at base by the load of ../src/suivi/replay.ts, which this change adds).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { capitalOfCounts, crosses, floorScaled, mul, q, qParse, qString, sub } from "../src/pari/index.ts";
import { mixtureOf } from "../src/suivi/policy.ts";
import type { BetsText, SuiviPolicy } from "../src/suivi/policy.ts";
import type { Outcome, RefEvaluation } from "../src/suivi/label.ts";
import { alarm, detInit, detStep } from "../src/suivi/detector.ts";
import { o4CloseOnAlarm, o4Init, o4Step, type O4State } from "../src/suivi/o4.ts";
import { suiviDenBits, suiviReplay, type SuiviReplay } from "../src/suivi/replay.ts";
import * as hikae from "../src/index.ts";

const s = String;
const W4 = ["1/4", "1/4", "1/4", "1/4"];
/** The sealed settings of the USDe cell, keyring empty (the fixture of suivi-o4.test.ts). */
const FIX: SuiviPolicy = { schema: "hikae-suivi-policy-v1", task_class: "stable-run-velocity-24h",
  cell_key: "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3", population: "usde-consecutive-calm-pairs-v1",
  policy_version: 1, a: "1/5", delta_adm: "1/20", delta_exh: "1/100", alpha_arl: "1/100", m: "1/5", eta_m1: "1/20", sr_reading_threshold: "10000",
  restart_weights: "1/(j(j+1))", bets_k: { lambdas: ["1/16", "1/8", "1/4", "1/2"], weights: W4 },
  bets_w: { lambdas: ["1/4", "1/2", "1", "2"], weights: W4 }, bets_sr: { lambdas: ["1/10", "1/5", "2/5", "4/5"], weights: W4 }, grace_steps: 1,
  grid_ms: 86400000, l_ms: 37800000, thin_window: 90, thin_min: 30, keyring: [] };
const oneBet = (l: string): BetsText => ({ lambdas: [l], weights: ["1"] });
/** W = 2^(2k - t), closed at W = 64; K factors 7/6 and 2/3; detector factors 2 and 1/2; alpha_arl 1/100 (alarm at S >= 100). */
const PW: SuiviPolicy = { ...FIX, a: "1/3", m: "1/3", bets_w: oneBet("3/2"), bets_k: oneBet("1/2"), bets_sr: oneBet("1/2"), delta_exh: "1/64" };
/** PW whose alarm rings at the fourth consecutive miss (S = 293/30 >= 8 > 29/6), before W closes (W = 16). */
const PA: SuiviPolicy = { ...PW, alpha_arl: "1/8" };
/** PW whose alarm rings at the sixth consecutive miss (S = 4121/105 >= 25 > 98/5), the label at which W reaches 64. */
const PT: SuiviPolicy = { ...PW, alpha_arl: "1/25" };
/** PW that licenses at K >= 49/36, with the alarm of PA. */
const PKA: SuiviPolicy = { ...PA, delta_adm: "36/49" };

const T0 = 1_790_000_000_000;
/** n reference evaluations on the grid of the policy, seqs 0 to n - 1, all in the population. */
function evals(n: number, p: SuiviPolicy = FIX): RefEvaluation[] {
  return Array.from({ length: n }, (_, i) => ({ seq: i, t_step_ms: T0 + i * p.grid_ms, yhat_ref: "0.0001",
    produced_at_ref: "2026-11-01T00:00:00Z", pre_member: true }));
}
/** The resolved outcomes of seqs 0 to E.length - 1, each a member, miss E[i]. */
const outs = (E: readonly (0 | 1)[]): Outcome[] => E.map((miss, seq) => ({ seq, resolved: true, member: true, miss }));
const ones = (n: number): (0 | 1)[] => new Array<0 | 1>(n).fill(1);
const zeros = (n: number): (0 | 1)[] => new Array<0 | 1>(n).fill(0);
const replayOf = (policy: SuiviPolicy, E: readonly (0 | 1)[], open: boolean) =>
  suiviReplay({ policy, evaluations: evals(E.length, policy), outcomes: outs(E), open });

test("replay_without_labels_is_the_starting_state", () => {
  const closedStart = suiviReplay({ policy: FIX, evaluations: [], outcomes: [], open: false });
  assert.deepEqual(closedStart, { labels: 0, outcomes_through_seq: null, segment: "no_license", closed_by: null, alarm: false,
    budget_nano: -1n, budget: -1 }, "no licence: -1, never 0");
  const openStart = suiviReplay({ policy: PW, evaluations: [], outcomes: [], open: true });
  assert.equal(openStart.segment, "open");
  assert.equal(openStart.budget_nano, 984375000n, "floor(10^9 (1 - 1/64)) at W = 1");
  assert.equal(openStart.budget, 0.984375);
});

test("replay_licenses_at_the_45th_zero_of_the_usde_fixture", () => {
  const before = replayOf(FIX, zeros(44), false);
  assert.equal(before.segment, "no_license");
  assert.equal(before.budget, -1, "no licence after 44 zeros");
  assert.equal(before.labels, 44);
  const at = replayOf(FIX, zeros(45), false);
  assert.equal(at.segment, "open", "K licenses at the 45th zero");
  assert.equal(at.budget_nano, 990000000n, "floor(10^9 (1 - 1/100)): the licensing label does not enter W");
  assert.equal(at.budget, 0.99);
  assert.equal(at.outcomes_through_seq, 44);
});

test("replay_budget_falls_with_w_and_closes_at_six_misses", () => {
  assert.equal(replayOf(PW, ones(3), true).budget_nano, 875000000n, "W = 8: floor(10^9 (1 - 8/64))");
  assert.equal(replayOf(PW, ones(5), true).budget_nano, 500000000n, "W = 32");
  const closed = replayOf(PW, ones(6), true);
  assert.deepEqual([closed.segment, closed.closed_by, closed.alarm, closed.budget], ["closed", "w_exhausted", false, -1], "W = 64");
  const after = replayOf(PW, [...ones(6), ...zeros(30)], true);
  assert.deepEqual([after.segment, after.budget], ["closed", -1], "a closed segment is absorbing");
});

test("replay_closes_an_open_segment_on_the_alarm", () => {
  const three = replayOf(PA, ones(3), true);
  assert.deepEqual([three.segment, three.alarm, three.budget_nano], ["open", false, 875000000n], "S = 29/6 < 8: no alarm yet");
  const four = replayOf(PA, ones(4), true);
  assert.deepEqual([four.segment, four.closed_by, four.alarm, four.budget], ["closed", "alarm", true, -1], "S = 293/30 >= 8, W = 16");
});

test("replay_on_a_tie_w_closes_first", () => {
  // o4.ts refuses a closure by the alarm with W at 1/delta_exh: on the label that does both, the closure is W's.
  const five = replayOf(PT, ones(5), true);
  assert.deepEqual([five.segment, five.alarm], ["open", false], "S = 98/5 < 25, W = 32");
  const six = replayOf(PT, ones(6), true);
  assert.deepEqual([six.segment, six.closed_by, six.alarm, six.budget], ["closed", "w_exhausted", true, -1]);
});

test("replay_an_alarm_before_the_licence_closes_the_segment_at_its_opening", () => {
  // Four misses ring the sticky alarm with no licence (K = 16/81); then K needs 13 zeros: (16/81) (7/6)^13 >= 49/36 > (16/81) (7/6)^12.
  const twelve = replayOf(PKA, [...ones(4), ...zeros(12)], false);
  assert.deepEqual([twelve.segment, twelve.alarm, twelve.budget], ["no_license", true, -1]);
  const thirteen = replayOf(PKA, [...ones(4), ...zeros(13)], false);
  assert.deepEqual([thirteen.segment, thirteen.closed_by, thirteen.budget], ["closed", "alarm", -1], "opened and closed on one label");
});

test("replay_enters_members_only_and_stops_at_the_first_missing_outcome", () => {
  const ev = evals(6, PW);
  const arrived: Outcome[] = [
    { seq: 0, resolved: true, member: true, miss: 1 },
    { seq: 1, resolved: true, member: false, miss: 0 },
    { seq: 2, resolved: false, member: true, miss: 0 },
    // seq 3 has not arrived: 4 and 5 stay held.
    { seq: 4, resolved: true, member: true, miss: 1 },
    { seq: 5, resolved: true, member: true, miss: 1 },
  ];
  const r = suiviReplay({ policy: PW, evaluations: ev, outcomes: arrived, open: true });
  assert.equal(r.outcomes_through_seq, 2, "consumed through seq 2");
  assert.equal(r.labels, 2, "seq 1 is out of the population");
  // Seq 0 a miss, seq 2 an unresolved member window (E = 1): W = 2^(4 - 2) = 4.
  assert.equal(r.budget_nano, 937500000n, "floor(10^9 (1 - 4/64))");
});

test("replay_refuses_what_the_library_refuses", () => {
  const ok = { policy: PW, evaluations: evals(2, PW), outcomes: outs([0, 1]), open: true };
  assert.throws(() => suiviReplay({ ...ok, policy: { ...PW, a: "2" } }), RangeError, "a outside (0, 1)");
  assert.throws(() => suiviReplay({ ...ok, open: "yes" as unknown as boolean }), RangeError, "open not a boolean");
  assert.throws(() => suiviReplay({ ...ok, evaluations: "none" as unknown as RefEvaluation[] }), RangeError, "evaluations not a list");
  assert.throws(() => suiviReplay({ ...ok, outcomes: null as unknown as Outcome[] }), RangeError, "outcomes not a list");
  const offGrid = evals(2, PW).map((e, i) => (i === 1 ? { ...e, t_step_ms: e.t_step_ms + 1 } : e));
  assert.throws(() => suiviReplay({ ...ok, evaluations: offGrid }), RangeError, "an evaluation off the grid");
  assert.throws(() => suiviReplay({ ...ok, outcomes: [...outs([0, 1]), { seq: 7, resolved: true, member: true, miss: 0 }] }), RangeError,
    "an outcome of no pending evaluation");
});

test("den_bits_is_the_lcm_of_the_k_and_w_factor_denominators", () => {
  // By hand, at a = 1/5: K (below) has the factors 1 + lambda/5 and 1 - 4 lambda/5, W (above) 1 - lambda/5 and 1 + 4 lambda/5.
  // FIX: K 81/80, 19/20, 41/40, 9/10, 21/20, 4/5, 11/10, 3/5, lcm 80 (7 bits); W 19/20, 6/5, 9/10, 7/5, 4/5, 9/5, 3/5, 13/5, lcm 20.
  assert.equal(suiviDenBits(FIX), 7);
  // PW (a = 1/3): K 7/6 and 2/3 (lcm 6, 3 bits); W 1/2 and 2 (lcm 2).
  assert.equal(suiviDenBits(PW), 3);
  // lambda 1/7 and 1/17 on K: 36/35, 31/35, 86/85, 81/85, lcm 595 (10 bits; the larger denominator alone, 85, has 7); W 9/10, 7/5.
  assert.equal(suiviDenBits({ ...FIX, bets_k: { lambdas: ["1/7", "1/17"], weights: ["1/2", "1/2"] }, bets_w: oneBet("1/2") }), 10);
  // W counts as much as K: lambda 1/97 on W gives 484/485 and 489/485 (9 bits), K's 1/2 gives 11/10 and 3/5.
  assert.equal(suiviDenBits({ ...FIX, bets_k: oneBet("1/2"), bets_w: oneBet("1/97") }), 9);
  assert.throws(() => suiviDenBits({ ...FIX, a: "2" }), RangeError, "the policy is checked first");
});

/** The state after a label, as the old calculation and o4Step both give it. */
interface Snapshot {
  readonly licensed_at: number | null;
  readonly segment: SuiviReplay["segment"];
  readonly closed_at: number | null;
  readonly closed_by: SuiviReplay["closed_by"];
  readonly w_t: number;
  readonly w_k: number;
}
const snapshotOf = (o: O4State): Snapshot => ({ licensed_at: o.licensed_at, segment: o.segment.kind,
  closed_at: o.segment.kind === "closed" ? o.segment.closed_at : null, closed_by: o.segment.kind === "closed" ? o.segment.closed_by : null,
  w_t: o.w_t, w_k: o.w_k });

/** The old calculation: the O4 rules stepped here, each crossing decided on the reduced capital, crosses(capitalOfCounts(...), delta),
 *  and the budget on reduced fractions, floorScaled(sub(q(1n), mul(delta_exh, W)), 10^9), as o4.ts did before capitalCrosses and
 *  capitalBudget; the detector stepped by the library. */
function oldReplay(policy: SuiviPolicy, E: readonly (0 | 1)[], open: boolean): { readonly steps: Snapshot[];
  readonly end: Pick<SuiviReplay, "segment" | "closed_by" | "alarm" | "budget_nano"> } {
  const a = qParse(policy.a), mixK = mixtureOf(policy.bets_k), mixW = mixtureOf(policy.bets_w);
  const deltaAdm = qParse(policy.delta_adm), deltaExh = qParse(policy.delta_exh);
  let k_t = 0, k_k = 0, w_t = 0, w_k = 0, licensed_at: number | null = null, closed_at: number | null = null, det = detInit(policy);
  let segment: SuiviReplay["segment"] = open ? "open" : "no_license", closed_by: SuiviReplay["closed_by"] = null;
  const steps = E.map((x, seq): Snapshot => {
    k_t += 1;
    k_k += x;
    const licenses = licensed_at === null && crosses(capitalOfCounts(mixK, "below", a, k_t, k_k), deltaAdm);
    if (licenses) licensed_at = k_t;
    if (segment === "no_license") {
      if (licenses) segment = "open";
    } else if (segment === "open") {
      w_t += 1;
      w_k += x;
      if (crosses(capitalOfCounts(mixW, "above", a, w_t, w_k), deltaExh)) [segment, closed_by, closed_at] = ["closed", "w_exhausted", k_t];
    }
    det = detStep(det, { seq, E: x }, policy);
    if (segment === "open" && det.alarm_at !== null) [segment, closed_by, closed_at] = ["closed", "alarm", k_t];
    return { licensed_at, segment, closed_at, closed_by, w_t, w_k };
  });
  const budget_nano = segment !== "open" ? -1n
    : floorScaled(sub(q(1n), mul(deltaExh, capitalOfCounts(mixW, "above", a, w_t, w_k))), 10n ** 9n);
  return { steps, end: { segment, closed_by, alarm: det.alarm_at !== null, budget_nano } };
}

/** The same labels through the library, in the order of suiviReplay: o4Step, detStep, then the closure of an open segment on the alarm. */
function newSteps(policy: SuiviPolicy, E: readonly (0 | 1)[], open: boolean): Snapshot[] {
  let o4 = o4Init(policy, open), det = detInit(policy);
  return E.map((x, seq) => {
    o4 = o4Step(o4, { seq, E: x }, policy);
    det = detStep(det, { seq, E: x }, policy);
    if (o4.segment.kind === "open" && alarm(det, policy)) o4 = o4CloseOnAlarm(o4, policy);
    return snapshotOf(o4);
  });
}

/** Nine-digit rationals over P9, the largest nine-digit prime: eight lambdas j top / 9 (j = 1..8) under the bound top / P9 of their
 *  side, and the weights floor(P9 / 8) / P9 seven times and their rest. */
const P9 = 999999937n;
const over = (x: bigint): string => qString(q(x, P9));
const nineBets = (top: bigint): BetsText => ({ lambdas: [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n].map((j) => over((top * j) / 9n)),
  weights: [...new Array<string>(7).fill(over(P9 / 8n)), over(P9 - 7n * (P9 / 8n))] });
const A9 = over(P9 / 5n);
const NINE9: SuiviPolicy = { ...FIX, a: A9, m: A9, delta_adm: over(P9 / 20n), delta_exh: over(P9 / 100n), alpha_arl: over(P9 / 100n),
  eta_m1: over(P9 / 20n), sr_reading_threshold: "999999999", bets_k: nineBets(P9 + P9 / 4n), bets_w: nineBets(5n * P9), bets_sr: nineBets(P9) };
/** Eight lambdas (j + 1)/p on distinct primes p, weights 117/941 seven times and 122/941, on K, W and the detector (L = 82). */
const PRIMES = [997, 991, 983, 977, 971, 967, 953, 947];
const ADV: BetsText = { lambdas: PRIMES.map((p, j) => `${s(j + 1)}/${s(p)}`), weights: PRIMES.map((_, j) => (j < 7 ? "117/941" : "122/941")) };
const ADV82: SuiviPolicy = { ...FIX, bets_k: ADV, bets_w: ADV, bets_sr: ADV };
/** Bets near both ends of their open intervals at a = 1/2: lambdas 1999/1000 and 1/1000 under 2 on K and W, 999/1000 and 1/1000 on the
 *  detector. */
const EDGE: SuiviPolicy = { ...FIX, a: "1/2", m: "1/2", bets_k: { lambdas: ["1999/1000", "1/1000"], weights: ["1/2", "1/2"] },
  bets_w: { lambdas: ["1999/1000", "1/1000"], weights: ["1/2", "1/2"] }, bets_sr: { lambdas: ["999/1000", "1/1000"], weights: ["1/2", "1/2"] } };
/** Thresholds met with equality deep in a run: K delta_adm = 1 at the 30th zero, W delta_exh = 1 at the 12th one (alarm out of reach). */
const inverseText = (c: { readonly n: bigint; readonly d: bigint }): string => qString(q(c.d, c.n));
const EQK: SuiviPolicy = { ...FIX, delta_adm: inverseText(capitalOfCounts(mixtureOf(FIX.bets_k), "below", qParse(FIX.a), 30, 0)) };
const EQW: SuiviPolicy = { ...FIX, alpha_arl: "1/1000000000000",
  delta_exh: inverseText(capitalOfCounts(mixtureOf(FIX.bets_w), "above", qParse(FIX.a), 12, 12)) };

test("replay_takes_the_decisions_of_the_old_calculation", () => {
  const N = 36, bits = (text: string): (0 | 1)[] => [...text].map((c) => (c === "1" ? 1 : 0));
  const paths: readonly [string, (0 | 1)[]][] = [["fifth", Array.from({ length: N }, (_, i) => (i % 5 === 4 ? 1 : 0))], ["ones", ones(N)],
    ["zeros", zeros(N)], ["burst", Array.from({ length: N }, (_, i) => (i % 5 === 4 || (i >= 12 && i < 20) ? 1 : 0))],
    ["mixed", bits("000100100000010000100010000001000000")]];
  const policies: readonly [string, SuiviPolicy][] = [["USDe", FIX], ["PW", PW], ["PA", PA], ["PT", PT], ["PKA", PKA], ["nine digits", NINE9],
    ["L 82", ADV82], ["near the bounds", EDGE], ["K equality", EQK], ["W equality", EQW]];
  const seen = new Set<string>();
  for (const [name, policy] of policies) {
    for (const [path, E] of paths) {
      for (const open of [true, false]) {
        const what = `${name}, ${path}, open ${s(open)}`, old = oldReplay(policy, E, open), r = replayOf(policy, E, open);
        assert.deepEqual(newSteps(policy, E, open), old.steps, `${what}: label by label`);
        const end = { segment: r.segment, closed_by: r.closed_by, alarm: r.alarm, budget_nano: r.budget_nano };
        assert.deepEqual(end, old.end, `${what}: the replay`);
        const last = old.steps.at(-1);
        if (last !== undefined && last.licensed_at !== null && !open) seen.add("licence");
        if (last !== undefined && last.closed_by !== null) seen.add(last.closed_by);
        if (old.end.budget_nano >= 0n) seen.add("open budget");
      }
    }
  }
  assert.deepEqual([...seen].sort(), ["alarm", "licence", "open budget", "w_exhausted"], "every decision is met");
  // The equalities: at the 30th zero K delta_adm = 1 licenses, at the 12th one W delta_exh = 1 closes.
  assert.equal(oldReplay(EQK, zeros(N), false).steps.at(-1)?.licensed_at, 30, "K equality licenses at 30");
  assert.deepEqual(oldReplay(EQW, ones(N), true).steps.at(-1)?.closed_at, 12, "W equality closes at 12");
  assert.equal(oldReplay(EQW, ones(N), true).steps.at(-1)?.closed_by, "w_exhausted");
});

test("replay_is_exported_by_the_package", () => {
  // Only what the harness reads; the package's labelOf stays the predictor's.
  for (const name of ["suiviReplay", "suiviDenBits", "assertSuiviPolicy", "suiviPolicySha256"]) {
    assert.equal(typeof (hikae as Record<string, unknown>)[name], "function", `${s(name)} leaves @monark/hikae`);
  }
  assert.equal(hikae.suiviReplay, suiviReplay);
});
