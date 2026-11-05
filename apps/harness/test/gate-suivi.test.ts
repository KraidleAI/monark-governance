/**
 * Step 6 of ROADMAP.md: the online tracking of HIKAE in the gate. The caller carries the cell's evidence in `params.suivi` (its closed
 * policy, its reference evaluations from the start, their arrived outcomes and the starting state of its segment); runGate replays it
 * (suiviReplay of @monark/hikae) and reads B_t = min(params.remainingBudget, the replayed budget). The tracking only lowers the caller's
 * budget: it moves a decision toward abstain, never toward commit. A segment with no licence or closed gives -1, so `budget_exhausted`.
 * Expected values by hand (packages/hikae/test/suivi-replay.test.ts): under the USDe fixture K licenses at the 45th zero and the budget
 * at the opening is 0.99; under PW (the same cell, W = 2^(2k - t), closed at 64) five misses leave 0.5 and six close the segment.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { BetsText, Outcome, RefEvaluation, SuiviPolicy } from "@monark/hikae";
import { runGate, toolErrorCode } from "../src/tools/gate.ts";
import type { HarnessParams } from "../src/tools/gate.ts";
import { PARAMS_SCHEMA, JUDGE_INPUT_SCHEMA } from "../src/schema-projection.ts";

const USDE_KEY = "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3";
/** The committed USDe key (the H5 trace's committed decision: commit / covered at intent 0.0001). */
const USDE = { schema_version: "1.1.0", task_class: "stable-run-velocity-24h", yhat: 0.0001, predictor_id: USDE_KEY,
  produced_at: "2026-09-04T00:00:00Z" } as const;
const BASE: HarnessParams = { remainingBudget: 1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0.0001,
  tool: "perps_order_preview", clockOpen: true };
const W4 = ["1/4", "1/4", "1/4", "1/4"];
/** The sealed settings of the USDe cell (the fixture of packages/hikae/test/suivi-o4.test.ts), keyring empty. */
const FIX: SuiviPolicy = { schema: "hikae-suivi-policy-v1", task_class: "stable-run-velocity-24h", cell_key: USDE_KEY,
  population: "usde-consecutive-calm-pairs-v1", policy_version: 1, a: "1/5", delta_adm: "1/20", delta_exh: "1/100", alpha_arl: "1/100",
  m: "1/5", eta_m1: "1/20", sr_reading_threshold: "10000", restart_weights: "1/(j(j+1))",
  bets_k: { lambdas: ["1/16", "1/8", "1/4", "1/2"], weights: W4 }, bets_w: { lambdas: ["1/4", "1/2", "1", "2"], weights: W4 },
  bets_sr: { lambdas: ["1/10", "1/5", "2/5", "4/5"], weights: W4 }, grace_steps: 1, grid_ms: 86400000, l_ms: 37800000, thin_window: 90,
  thin_min: 30, keyring: [] };
const oneBet = (l: string): BetsText => ({ lambdas: [l], weights: ["1"] });
const PW: SuiviPolicy = { ...FIX, a: "1/3", m: "1/3", bets_w: oneBet("3/2"), bets_k: oneBet("1/2"), bets_sr: oneBet("1/2"), delta_exh: "1/64" };
/** The USDe cell with one bet on K (factors 11/10, 3/5) and one on W, lambda 1/97 (factors 484/485, 489/485): L = 9 bits, so the
 *  work bound n L <= 3600 admits 400 evaluations and refuses 401 (suiviDenBits, packages/hikae/test/suivi-replay.test.ts). */
const P97: SuiviPolicy = { ...FIX, bets_k: oneBet("1/2"), bets_w: oneBet("1/97") };

const T0 = 1_790_000_000_000;
const evals = (n: number): RefEvaluation[] => Array.from({ length: n }, (_, i) => ({ seq: i, t_step_ms: T0 + i * FIX.grid_ms,
  yhat_ref: "0.0001", produced_at_ref: "2026-11-01T00:00:00Z", pre_member: true }));
const outs = (E: readonly (0 | 1)[]): Outcome[] => E.map((miss, seq) => ({ seq, resolved: true, member: true, miss }));
const fill = (n: number, v: 0 | 1): (0 | 1)[] => new Array<0 | 1>(n).fill(v);
const suivi = (policy: SuiviPolicy, E: readonly (0 | 1)[], open: boolean) => ({ policy, evaluations: evals(E.length), outcomes: outs(E), open });
const gateWith = (params: Partial<HarnessParams>) => runGate(USDE, { ...BASE, ...params });
/** A BYO request on the class, under the caller's own key: 100 scores from 0.001 to 0.1, so a region of about yhat +- 0.09. */
const BYO_KEY = "byo:demo";
const BYO_SCORES = Array.from({ length: 100 }, (_, i) => (i + 1) / 1000);
const byoWith = (params: Partial<HarnessParams>) =>
  runGate({ ...USDE, predictor_id: BYO_KEY }, { ...BASE, calibration: { scores: BYO_SCORES, mode: "interval" }, ...params });

/** The code of the tool error that fn throws, and its message. */
function refusal(fn: () => unknown): { code: string | undefined; message: string } {
  try {
    fn();
  } catch (e) {
    return { code: toolErrorCode(e), message: e instanceof Error ? e.message : String(e) };
  }
  return assert.fail("no refusal");
}

test("gate_without_suivi_keeps_the_callers_budget", () => {
  const d = gateWith({});
  assert.deepEqual([d.action, d.reason, d.remaining_budget], ["commit", "covered", 1]);
});

test("gate_suivi_before_the_licence_abstains", () => {
  const d = gateWith({ suivi: suivi(FIX, fill(44, 0), false) });
  assert.deepEqual([d.action, d.allow, d.reason, d.remaining_budget], ["abstain", false, "budget_exhausted", -1], "44 zeros: no licence");
});

test("gate_suivi_licensed_commits_with_the_replayed_budget", () => {
  const d = gateWith({ suivi: suivi(FIX, fill(45, 0), false) });
  assert.deepEqual([d.action, d.allow, d.reason, d.remaining_budget], ["commit", true, "covered", 0.99], "K licenses at the 45th zero");
});

test("gate_suivi_changes_the_decision_and_never_raises_the_budget", () => {
  // Five misses leave 0.5 in PW's open segment: under bFloor 0.6 the same request commits without the evidence and abstains with it.
  assert.equal(gateWith({ bFloor: 0.6 }).action, "commit");
  const lowered = gateWith({ bFloor: 0.6, suivi: suivi(PW, fill(5, 1), true) });
  assert.deepEqual([lowered.action, lowered.reason, lowered.remaining_budget], ["abstain", "budget_exhausted", 0.5]);
  // The caller's smaller budget stays: min(0.3, 0.99).
  const kept = gateWith({ remainingBudget: 0.3, suivi: suivi(FIX, fill(45, 0), false) });
  assert.deepEqual([kept.action, kept.remaining_budget], ["commit", 0.3]);
  const under = gateWith({ remainingBudget: 0.3, bFloor: 0.5, suivi: suivi(FIX, fill(45, 0), false) });
  assert.deepEqual([under.action, under.reason, under.remaining_budget], ["abstain", "budget_exhausted", 0.3], "an open segment does not lift the floor");
});

test("gate_suivi_closed_segment_abstains", () => {
  const d = gateWith({ suivi: suivi(PW, fill(6, 1), true) });
  assert.deepEqual([d.action, d.reason, d.remaining_budget], ["abstain", "budget_exhausted", -1], "six misses: W = 64 closes the segment");
  const later = gateWith({ suivi: suivi(PW, [...fill(6, 1), ...fill(40, 0)], true) });
  assert.deepEqual([later.action, later.remaining_budget], ["abstain", -1], "a closed segment is absorbing");
});

test("gate_suivi_refusals_are_param_invalid", () => {
  const ok = suivi(PW, [0, 1], true);
  const cases: readonly [string, Partial<HarnessParams>, string][] = [
    ["another class", { suivi: { ...ok, policy: { ...PW, task_class: "liquidation-eligible-coverage" } } }, "task_class"],
    ["another cell", { suivi: { ...ok, policy: { ...PW, cell_key: "kata:other" } } }, `the policy's cell_key is not the verdict's '${USDE_KEY}'`],
    ["a malformed policy", { suivi: { ...ok, policy: { ...PW, a: "2" } } }, "a outside (0, 1)"],
    ["an evaluation off the grid", { suivi: { ...ok, evaluations: evals(2).map((e, i) => (i === 1 ? { ...e, t_step_ms: e.t_step_ms + 1 } : e)) } }, "grid_ms"],
    ["an outcome of no evaluation", { suivi: { ...ok, outcomes: [...outs([0, 1]), { seq: 9, resolved: true, member: true, miss: 0 }] } }, "no pending evaluation"],
    ["open not a boolean", { suivi: { ...ok, open: "yes" as unknown as boolean } }, "open is not a boolean"],
    ["too many evaluations", { suivi: { ...ok, evaluations: evals(501) } }, "500"],
    ["too many outcomes", { suivi: { ...ok, outcomes: outs(fill(501, 0)) } }, "500"],
    ["a rational text too long", { suivi: { ...ok, policy: { ...PW, delta_exh: `1/${"9".repeat(19)}` } } }, "20 characters"],
    ["a mixture's weights too many", { suivi: { ...ok, policy: { ...PW, bets_sr: { lambdas: ["1/2"], weights: fill(9, 0).map(() => "1/9") } } } }, "8 bets"],
    ["the replay's work", { suivi: { policy: P97, evaluations: evals(401), outcomes: outs([0, 0]), open: false } }, "401 evaluations by 9 bits"],
  ];
  for (const [what, params, needle] of cases) {
    const r = refusal(() => gateWith(params));
    assert.equal(r.code, "param_invalid", what);
    assert.ok(r.message.startsWith("invalid param 'suivi': "), `${what}: ${r.message}`);
    assert.ok(r.message.includes(needle), `${what} names ${needle}: ${r.message}`);
  }
  // On the BYO path the cell is the request's class and key: a policy that names another key, or another class, is refused.
  const otherKey = refusal(() => byoWith({ suivi: { ...ok, policy: { ...PW, cell_key: "byo:other" } } }));
  assert.deepEqual([otherKey.code, otherKey.message], ["param_invalid",
    `invalid param 'suivi': the policy's cell_key is not the request's predictor_id '${BYO_KEY}' (a BYO cell is its class and key)`]);
  const otherClass = refusal(() => byoWith({ suivi: { ...ok, policy: { ...PW, task_class: "byo-other-1h", cell_key: BYO_KEY } } }));
  assert.deepEqual([otherClass.code, otherClass.message], ["param_invalid",
    `invalid param 'suivi': the policy's task_class is not the request's '${USDE.task_class}'`]);
});

test("gate_suivi_on_byo_binds_to_the_class_and_the_callers_key", () => {
  // A BYO verdict names no cell: the policy names the request's class and key (decision of the founder, 2026-11-05). The
  // tracking only lowers the caller's budget, as on a committed cell.
  const without = byoWith({});
  assert.deepEqual([without.action, without.reason, without.remaining_budget], ["commit", "covered", 1], "without the evidence");
  const licensed = byoWith({ suivi: suivi({ ...FIX, cell_key: BYO_KEY }, fill(45, 0), false) });
  assert.deepEqual([licensed.action, licensed.reason, licensed.remaining_budget], ["commit", "covered", 0.99], "K licenses at the 45th zero");
  assert.equal(licensed.verdict.cell_key, null, "the BYO verdict still names no cell");
  const lowered = byoWith({ bFloor: 0.6, suivi: suivi({ ...PW, cell_key: BYO_KEY }, fill(5, 1), true) });
  assert.deepEqual([lowered.action, lowered.reason, lowered.remaining_budget], ["abstain", "budget_exhausted", 0.5], "five misses leave 0.5");
  const closed = byoWith({ suivi: suivi({ ...PW, cell_key: BYO_KEY }, fill(6, 1), true) });
  assert.deepEqual([closed.action, closed.reason, closed.remaining_budget], ["abstain", "budget_exhausted", -1], "six misses close the segment");
});

test("gate_suivi_work_bound_admits_up_to_its_limit", () => {
  // 400 evaluations by 9 bits is 3600, the bound itself: replayed (two zeros, no licence yet). The USDe cell (L = 7) carries 500.
  const at = gateWith({ suivi: { policy: P97, evaluations: evals(400), outcomes: outs([0, 0]), open: false } });
  assert.deepEqual([at.action, at.reason, at.remaining_budget], ["abstain", "budget_exhausted", -1]);
  const usde = gateWith({ suivi: { policy: FIX, evaluations: evals(500), outcomes: outs([0, 0]), open: true } });
  assert.deepEqual([usde.action, usde.reason], ["commit", "covered"], "500 evaluations by 7 bits is 3500");
});

test("gate_suivi_is_declared_in_the_params_schema_and_reaches_judge", () => {
  const props = PARAMS_SCHEMA["properties"] as Record<string, Record<string, unknown>>;
  const s = props["suivi"];
  assert.ok(s !== undefined, "params.suivi is declared");
  assert.deepEqual(s["required"], ["policy", "evaluations", "outcomes", "open"]);
  assert.ok(!(PARAMS_SCHEMA["required"] as string[]).includes("suivi"), "optional: a call without it stays valid");
  const judgeParams = (JUDGE_INPUT_SCHEMA["properties"] as Record<string, unknown>)["params"];
  assert.equal(judgeParams, PARAMS_SCHEMA, "judge reads the gate's params, suivi included");
});
