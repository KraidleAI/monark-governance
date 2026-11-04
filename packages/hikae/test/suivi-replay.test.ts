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
 * Category: new-module (red at base by the load of ../src/suivi/replay.ts, which this change adds).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { BetsText, SuiviPolicy } from "../src/suivi/policy.ts";
import type { Outcome, RefEvaluation } from "../src/suivi/label.ts";
import { suiviReplay } from "../src/suivi/replay.ts";
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

test("replay_is_exported_by_the_package", () => {
  // Only what the harness reads; the package's labelOf stays the predictor's.
  for (const name of ["suiviReplay", "assertSuiviPolicy", "suiviPolicySha256"]) {
    assert.equal(typeof (hikae as Record<string, unknown>)[name], "function", `${s(name)} leaves @monark/hikae`);
  }
  assert.equal(hikae.suiviReplay, suiviReplay);
});
