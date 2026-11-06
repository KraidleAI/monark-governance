/**
 * The online level of a class, served by the gate on the BYO path: `params.calibration.aci` carries the step, the window and for each
 * score how many had arrived when its signal was decided; the gate replays them (aciReplay of @monark/hikae) and keeps nothing. Without
 * `aci` the path stays the split one. Expected values by hand: see packages/hikae/test/aci.test.ts.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoresSha256 } from "@monark/contracts";
import type { Prediction } from "@monark/contracts";
import type { AciEvidence, BetsText, Outcome, RefEvaluation, SuiviPolicy } from "@monark/hikae";
import { handleJsonMirror } from "../src/http.ts";
import { ACI_LABEL, CALIBRATE_LABEL } from "../src/tools/calibrate.ts";
import { GATE_TOOL_DESCRIPTION, runGate, SCHEMA_VERSION, toolErrorCode } from "../src/tools/gate.ts";
import type { ByoCalibration, HarnessParams } from "../src/tools/gate.ts";
import { JUDGE_LABEL, runJudge, type JudgeInput, type JudgeOrder, type KernelRunner } from "../src/tools/judge.ts";
import { HARNESS_TOOLS } from "../src/tools/registry.ts";
import { JUDGE_INPUT_SCHEMA, PARAMS_SCHEMA } from "../src/schema-projection.ts";

const PRED: Prediction = { schema_version: SCHEMA_VERSION, task_class: "demo-swing-4h", yhat: 100, predictor_id: "caller:demo", produced_at: "2026-09-04T00:00:00Z" };
const BASE: HarnessParams = { remainingBudget: 1, bFloor: 0, tau: 1, tauInterval: 1000, alpha: 0.1, nMin: 50, intent: 100, tool: "perps_order_preview", clockOpen: true };
const ramp = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);
const zeros = (n: number): number[] => new Array<number>(n).fill(0);

/** 100 calibration scores of the warm-up (decided_after 0), then `tail`, each decided when the one before it had arrived. */
function calibration(tail: readonly number[], gamma = 0.05, window = 100): ByoCalibration {
  return { scores: [...ramp(100), ...tail], mode: "interval", aci: { gamma, window, decided_after: [...zeros(100), ...tail.map((_, i) => 100 + i)] } };
}
const gateOn = (cal: ByoCalibration, params: Partial<HarnessParams> = {}) => runGate(PRED, { ...BASE, calibration: cal, ...params });

function refusal(fn: () => unknown): { code: string | undefined; message: string } {
  try {
    fn();
  } catch (e) {
    return { code: toolErrorCode(e), message: e instanceof Error ? e.message : String(e) };
  }
  return assert.fail("no refusal");
}

test("gate_without_aci_stays_on_the_split_path", () => {
  const d = gateOn({ scores: ramp(100), mode: "interval" });
  assert.deepEqual([d.action, d.reason, d.verdict.method, d.verdict.qhat, d.verdict.n_calib], ["commit", "covered", "split", 91, 100]);
});

test("gate_aci_before_any_step_serves_the_region_of_the_split_path", () => {
  const plain = gateOn({ scores: ramp(100), mode: "interval" });
  const d = gateOn(calibration([]));
  assert.equal(d.verdict.method, "hac-cp");
  assert.deepEqual(d.verdict.region, plain.verdict.region);
  assert.deepEqual([d.verdict.qhat, d.verdict.n_calib, d.verdict.scores_sha256, d.action, d.reason], [91, 100, plain.verdict.scores_sha256, "commit", "covered"]);
  assert.notEqual(d.request_sha256, plain.request_sha256);
});

test("gate_aci_n_calib_and_the_digest_describe_the_window", () => {
  const scores = [...ramp(100), 7, 7, 7];
  const d = gateOn(calibration([7, 7, 7]));
  assert.equal(d.verdict.n_calib, 100);
  assert.equal(d.verdict.scores_sha256, scoresSha256(scores.slice(3)));
  // Below nMin the guard of L3 reads the window, not the whole history.
  const narrow = gateOn(calibration([], 0.05, 49));
  assert.deepEqual([narrow.action, narrow.reason, narrow.verdict.n_calib, narrow.verdict.region], ["abstain", "under_calib", 49, null]);
});

test("gate_aci_a_miss_can_turn_a_commit_into_a_defer", () => {
  // tauInterval 190: the region of width 182 at q = 91 commits; after one miss q = 97, width 194.
  assert.equal(gateOn(calibration([]), { tauInterval: 190 }).action, "commit");
  const d = gateOn(calibration([1000]), { tauInterval: 190 });
  assert.deepEqual([d.action, d.reason, d.verdict.qhat], ["defer", "interval_too_wide", 97]);
});

test("gate_aci_a_calm_stretch_can_turn_a_defer_into_a_commit", () => {
  // Forty covers at score 1: the level is 0.3, rank ceil(101 x 0.7) = 71, q = 71, width 142 <= 150; the split rank on the same window gives 91, width 182.
  const tail = new Array<number>(40).fill(1);
  const d = gateOn(calibration(tail), { tauInterval: 150 });
  assert.deepEqual([d.action, d.reason, d.verdict.qhat], ["commit", "covered", 71]);
  const splitOnWindow = gateOn({ scores: [...ramp(100), ...tail].slice(40), mode: "interval" }, { tauInterval: 150 });
  assert.deepEqual([splitOnWindow.action, splitOnWindow.reason, splitOnWindow.verdict.qhat], ["defer", "interval_too_wide", 91]);
});

test("gate_aci_three_misses_abstain_and_nine_covers_reopen", () => {
  const three = [1e6, 2e6, 3e6];
  const shut = gateOn(calibration(three));
  assert.deepEqual([shut.action, shut.reason, shut.verdict.method, shut.verdict.region, shut.verdict.qhat, shut.verdict.n_calib], ["abstain", "under_calib", "hac-cp", null, null, 100]);
  const stillShut = gateOn(calibration([...three, ...zeros(8)]));
  assert.deepEqual([stillShut.action, stillShut.reason], ["abstain", "under_calib"]);
  const open = gateOn(calibration([...three, ...zeros(9)]), { tauInterval: 1e7 });
  assert.deepEqual([open.action, open.reason, open.verdict.qhat], ["commit", "covered", 3e6]);
});

test("gate_aci_the_empty_region_and_a_zero_width_abstain_region_degenerate", () => {
  const empty: ByoCalibration = { scores: zeros(12), mode: "interval", aci: { gamma: 0.9, window: 10, decided_after: [...zeros(10), 10, 11] } };
  const d = gateOn(empty, { alpha: 0.5, nMin: 10 });
  assert.deepEqual([d.action, d.reason, d.verdict.method, d.verdict.region, d.verdict.qhat], ["abstain", "region_degenerate", "hac-cp", null, null]);
  const zeroWidth = gateOn({ scores: zeros(10), mode: "interval", aci: { gamma: 0.05, window: 10, decided_after: zeros(10) } }, { alpha: 0.5, nMin: 10 });
  assert.deepEqual([zeroWidth.action, zeroWidth.reason, zeroWidth.verdict.method], ["abstain", "region_degenerate", "hac-cp"]);
});

test("gate_aci_delayed_outcomes_are_judged_on_the_region_their_signal_got", () => {
  // Three signals decided after the same 100 scores, all at 95 > 91: three misses, so the level is -0.035 and the gate abstains.
  const scores = [...ramp(100), 95, 95, 95];
  const late = gateOn({ scores, mode: "interval", aci: { gamma: 0.05, window: 100, decided_after: [...zeros(100), 100, 100, 100] } });
  assert.deepEqual([late.action, late.reason], ["abstain", "under_calib"]);
  // The same scores, each decided after the one before: one miss, then two covers, so the level is 0.065 and a region is served.
  const inTurn = gateOn({ scores, mode: "interval", aci: { gamma: 0.05, window: 100, decided_after: [...zeros(100), 100, 101, 102] } });
  assert.deepEqual([inTurn.action, inTurn.reason], ["commit", "covered"]);
});

test("gate_aci_set_mode", () => {
  // 95 zeros then 5 ones: q = 0 at rank 91, so the singleton; one miss gives rank 96 of a window with 6 ones, so q = 1 and both labels.
  const scores = [...zeros(95), 1, 1, 1, 1, 1];
  const candidates = [{ label: "up", score: 0 }, { label: "down", score: 1 }];
  const params: Partial<HarnessParams> = { intent: "up" };
  const pred: Prediction = { ...PRED, yhat: "up" };
  const first = runGate(pred, { ...BASE, ...params, calibration: { scores, mode: "set", candidates, aci: { gamma: 0.05, window: 100, decided_after: zeros(100) } } });
  assert.deepEqual([first.action, first.reason, first.verdict.method, first.verdict.qhat, first.verdict.qhat_unit], ["commit", "covered", "hac-cp", 0, "score"]);
  const miss = runGate(pred, { ...BASE, ...params, calibration: { scores: [...scores, 1], mode: "set", candidates, aci: { gamma: 0.05, window: 100, decided_after: [...zeros(100), 100] } } });
  assert.deepEqual([miss.action, miss.reason, miss.verdict.qhat], ["defer", "set_too_large", 1]);
  // Both labels cover a score of 1, so nothing more is missed at this step. A larger step reaches the whole line at once: 0.1 - 0.3 x 0.9 < 0.
  const shut = runGate(pred, { ...BASE, ...params, calibration: { scores: [...scores, 1], mode: "set", candidates, aci: { gamma: 0.3, window: 100, decided_after: [...zeros(100), 100] } } });
  assert.deepEqual([shut.action, shut.reason, shut.verdict.region], ["abstain", "under_calib", null]);
});

test("gate_aci_refusals_are_named", () => {
  const ok = calibration([1]);
  const aci = ok.aci;
  assert.ok(aci !== undefined);
  const cases: readonly [string, unknown, string][] = [
    ["a list too short", { ...aci, decided_after: aci.decided_after.slice(1) }, "decision counts"],
    ["a list too long", { ...aci, decided_after: [...aci.decided_after, 0] }, "decision counts"],
    ["a decision after its outcome", { ...aci, decided_after: [1, ...aci.decided_after.slice(1)] }, "decided_after[0]"],
    ["a negative count", { ...aci, decided_after: [-1, ...aci.decided_after.slice(1)] }, "decided_after[0]"],
    ["a count that is no integer", { ...aci, decided_after: [0.5, ...aci.decided_after.slice(1)] }, "decided_after[0]"],
    ["gamma 0", { ...aci, gamma: 0 }, "gamma"],
    ["gamma 1", { ...aci, gamma: 1 }, "gamma"],
    ["gamma a text", { ...aci, gamma: "0.05" }, "gamma"],
    ["window 0", { ...aci, window: 0 }, "window"],
    ["window 1.5", { ...aci, window: 1.5 }, "window"],
    ["not an object", 3, "expected an object"],
    ["no list", { gamma: 0.05, window: 100 }, "expected a list"],
  ];
  for (const [what, value, needle] of cases) {
    const r = refusal(() => gateOn({ ...ok, aci: value as AciEvidence }));
    assert.equal(r.code, "byo_calibration_invalid", what);
    assert.ok(r.message.includes(needle), `${what}: ${r.message}`);
  }
  // The checks of the BYO path keep their order: a wrong yhat type and a negative score are refused first, with their own code.
  assert.equal(refusal(() => runGate({ ...PRED, yhat: "up" }, { ...BASE, calibration: ok })).code, "byo_yhat_type");
  const negative: ByoCalibration = { ...ok, scores: [-1, ...ok.scores.slice(1)] };
  assert.equal(refusal(() => gateOn(negative)).code, "byo_calibration_invalid");
  assert.ok(refusal(() => gateOn(negative)).message.includes("non-negative"));
});

test("gate_aci_a_value_that_cannot_be_written_is_refused_by_name_on_every_path", async () => {
  const ok = calibration([1]);
  const aci = ok.aci;
  assert.ok(aci !== undefined);
  const hostile = JSON.parse('{"toString":1,"valueOf":1}') as number;
  const cases: readonly AciEvidence[] = [{ ...aci, gamma: hostile }, { ...aci, window: hostile }, { ...aci, decided_after: [hostile, ...aci.decided_after.slice(1)] }];
  const order: JudgeOrder = { kind: "EXIT", target: "venue:a", asset: "btc", amount: "100" };
  const limits = { venues: ["venue:a"], assets: [{ asset: "btc", cap: "100" }] };
  const kernel: KernelRunner = () => Promise.resolve({ status: 0, stdout: new TextEncoder().encode("allow\n") });
  for (const value of cases) {
    const cal = { ...ok, aci: value };
    assert.equal(refusal(() => gateOn(cal)).code, "byo_calibration_invalid");
    // An EXIT goes on, with the gate's refusal named: it does not throw.
    const exit = await runJudge({ prediction: PRED, params: { ...BASE, calibration: cal }, order, limits }, { kernel });
    assert.deepEqual([exit.decision, exit.gate_error?.code, exit.kernel_verdict, exit.reduce_only], [null, "byo_calibration_invalid", "allow", true]);
  }
});

test("gate_aci_a_min_count_out_of_reach_answers_as_the_split_path", () => {
  for (const nMin of [2 ** 53, 1e300]) {
    const split = gateOn({ scores: ramp(100), mode: "interval" }, { nMin });
    const level = gateOn(calibration([]), { nMin });
    assert.deepEqual([level.action, level.reason], [split.action, split.reason], String(nMin));
    assert.deepEqual([split.action, split.reason], ["abstain", "under_calib"], String(nMin));
  }
});

test("gate_aci_each_refusal_comes_with_the_code_the_readme_gives", async () => {
  const ok = calibration([1]);
  const aci = ok.aci;
  assert.ok(aci !== undefined);
  const codeOf = async (value: unknown): Promise<string | undefined> => {
    const res = await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", { method: "POST", body: JSON.stringify({ prediction: PRED, params: { ...BASE, calibration: { ...ok, aci: value } } }) }));
    assert.equal(res.status, 400);
    return ((await res.json()) as { code?: string }).code;
  };
  // At the input boundary.
  for (const value of [{ ...aci, gamma: 0 }, { ...aci, gamma: 1 }, { ...aci, window: 0 }, { ...aci, extra: 1 }, { ...aci, decided_after: [-1, ...aci.decided_after.slice(1)] }]) {
    assert.equal(await codeOf(value), "input_invalid", JSON.stringify(value).slice(0, 60));
  }
  // In the code.
  for (const value of [{ ...aci, decided_after: aci.decided_after.slice(1) }, { ...aci, decided_after: [1, ...aci.decided_after.slice(1)] }, { ...aci, window: 1e300 }]) {
    assert.equal(await codeOf(value), "byo_calibration_invalid", JSON.stringify(value).slice(0, 60));
  }
});

test("gate_aci_the_label_says_what_each_reason_covered_says", () => {
  // The verdict reads `covered` as soon as the level gives a region, before L3 reads the intent, the width or the budget.
  const outside = gateOn(calibration([]), { intent: 1e6 });
  assert.deepEqual([outside.reason, outside.verdict.reason], ["intent_not_in_region", "covered"]);
  const wide = gateOn(calibration([]), { tauInterval: 1 });
  assert.deepEqual([wide.reason, wide.verdict.reason], ["interval_too_wide", "covered"]);
  const poor = gateOn(calibration([]), { remainingBudget: 0, bFloor: 1 });
  assert.deepEqual([poor.reason, poor.verdict.reason], ["budget_exhausted", "covered"]);
  assert.ok(ACI_LABEL.includes("as the decision's reason, `covered` says only that the intent lies in the region, within the width and the budget; as the verdict's, only that the level gave a region"));
});

test("gate_aci_an_unknown_key_only_the_schema_refuses_and_the_digest_binds_it", () => {
  const cal = calibration([1]);
  const direct = gateOn({ ...cal, aci: { ...cal.aci, extra: 1 } as AciEvidence });
  const plain = gateOn(cal);
  assert.deepEqual(direct.verdict, plain.verdict, "the replay reads its three fields");
  assert.notEqual(direct.request_sha256, plain.request_sha256);
});

test("gate_aci_composes_with_the_callers_budget_and_the_digest_binds_the_evidence", () => {
  const d = gateOn(calibration([]), { remainingBudget: 0.1, bFloor: 0.2 });
  assert.deepEqual([d.action, d.reason, d.verdict.qhat], ["abstain", "budget_exhausted", 91]);
  const a = gateOn(calibration([95, 95]));
  const moved = calibration([95, 95]);
  const b = gateOn({ ...moved, aci: { gamma: 0.05, window: 100, decided_after: [...zeros(100), 100, 100] } });
  assert.notEqual(a.request_sha256, b.request_sha256);
});

test("gate_aci_composes_with_the_tracking_which_only_lowers_the_budget", () => {
  // The tracking of the class (step 6) reads its own evidence: one level, one budget, and the verdict is the same with or without it.
  const W4 = ["1/4", "1/4", "1/4", "1/4"];
  const oneBet = (l: string): BetsText => ({ lambdas: [l], weights: ["1"] });
  const FIX: SuiviPolicy = { schema: "hikae-suivi-policy-v1", task_class: PRED.task_class, cell_key: PRED.predictor_id,
    population: "demo-swing-4h-v1", policy_version: 1, a: "1/5", delta_adm: "1/20", delta_exh: "1/100", alpha_arl: "1/100",
    m: "1/5", eta_m1: "1/20", sr_reading_threshold: "10000", restart_weights: "1/(j(j+1))",
    bets_k: { lambdas: ["1/16", "1/8", "1/4", "1/2"], weights: W4 }, bets_w: { lambdas: ["1/4", "1/2", "1", "2"], weights: W4 },
    bets_sr: { lambdas: ["1/10", "1/5", "2/5", "4/5"], weights: W4 }, grace_steps: 1, grid_ms: 86400000, l_ms: 37800000, thin_window: 90,
    thin_min: 30, keyring: [] };
  const PW: SuiviPolicy = { ...FIX, a: "1/3", m: "1/3", bets_w: oneBet("3/2"), bets_k: oneBet("1/2"), bets_sr: oneBet("1/2"), delta_exh: "1/64" };
  const suivi = (policy: SuiviPolicy, misses: readonly (0 | 1)[], open: boolean) => ({
    policy, open,
    evaluations: misses.map((_, i): RefEvaluation => ({ seq: i, t_step_ms: 1_790_000_000_000 + i * FIX.grid_ms, yhat_ref: "100", produced_at_ref: "2026-11-01T00:00:00Z", pre_member: true })),
    outcomes: misses.map((miss, seq): Outcome => ({ seq, resolved: true, member: true, miss })),
  });
  const fill = (n: number, v: 0 | 1): (0 | 1)[] => new Array<0 | 1>(n).fill(v);
  const cal = calibration([1000]); // one miss: q = 97
  const alone = gateOn(cal);
  assert.deepEqual([alone.action, alone.reason, alone.remaining_budget, alone.verdict.qhat], ["commit", "covered", 1, 97]);
  const licensed = gateOn(cal, { suivi: suivi(FIX, fill(45, 0), false) });
  assert.deepEqual([licensed.action, licensed.reason, licensed.remaining_budget], ["commit", "covered", 0.99], "K licenses at the 45th zero");
  assert.deepEqual(licensed.verdict, alone.verdict, "the tracking leaves the verdict of the level as it is");
  const lowered = gateOn(cal, { bFloor: 0.6, suivi: suivi(PW, fill(5, 1), true) });
  assert.deepEqual([lowered.action, lowered.reason, lowered.remaining_budget, lowered.verdict.method, lowered.verdict.qhat], ["abstain", "budget_exhausted", 0.5, "hac-cp", 97], "five misses leave 0.5");
  const closed = gateOn(cal, { suivi: suivi(PW, fill(6, 1), true) });
  assert.deepEqual([closed.action, closed.reason, closed.remaining_budget], ["abstain", "budget_exhausted", -1], "six misses close the segment");
  // With the level shut, the tracking opens nothing.
  const shut = gateOn(calibration([1e6, 2e6, 3e6]), { suivi: suivi(FIX, fill(45, 0), false) });
  assert.deepEqual([shut.action, shut.reason, shut.remaining_budget], ["abstain", "under_calib", 0.99]);
});

test("gate_aci_judge_reads_the_same_params_and_hands_the_kernel_the_action_of_the_level", async () => {
  assert.equal((JUDGE_INPUT_SCHEMA["properties"] as Record<string, unknown>)["params"], PARAMS_SCHEMA, "judge reads the gate's params, aci included");
  const requests: Uint8Array[] = [];
  const kernel: KernelRunner = (r) => {
    requests.push(r);
    return Promise.resolve({ status: 0, stdout: new TextEncoder().encode("deny not-commit\n") });
  };
  const order: JudgeOrder = { kind: "OPEN", target: "venue:a", asset: "btc", amount: "100" };
  const limits = { venues: ["venue:a"], assets: [{ asset: "btc", cap: "100" }] };
  const run = (cal: ByoCalibration) => runJudge({ prediction: PRED, params: { ...BASE, calibration: cal }, order, limits }, { kernel });
  const open = await run(calibration([]));
  assert.deepEqual([open.decision?.action, open.decision?.verdict.method], ["commit", "hac-cp"]);
  const shut = await run(calibration([1e6, 2e6, 3e6]));
  assert.deepEqual([shut.decision?.action, shut.decision?.reason], ["abstain", "under_calib"]);
  assert.deepEqual(requests.map((r) => r[13]), [1, 3], "the context's action byte: commit, then abstain");
});

test("gate_aci_text_says_what_the_level_did", async () => {
  const tool = HARNESS_TOOLS.find((t) => t.name === "gate");
  assert.ok(tool !== undefined);
  const run = async (cal: ByoCalibration) => tool.run({ prediction: PRED, params: { ...BASE, calibration: cal } });
  const shut = await run(calibration([1e6, 2e6, 3e6]));
  assert.ok(shut.text.startsWith(`${ACI_LABEL} B_t is caller-carried. `), shut.text);
  assert.ok(shut.text.includes("aci level=-0.035 gamma=0.05 window=100 T=3 misses=3 no_region=0 max_delay=0 bound=6.0334 region=whole"), shut.text);
  assert.ok(shut.text.includes("verdict action=abstain reason=under_calib"), shut.text);
  const fresh = await run(calibration([]));
  assert.ok(fresh.text.includes("aci level=0.1 gamma=0.05 window=100 T=0 misses=0 no_region=0 max_delay=0 bound=none region=quantile"), fresh.text);
  // Without aci, the text of the BYO path, byte for byte.
  const plain = await run({ scores: ramp(100), mode: "interval" });
  assert.ok(plain.text.startsWith(`${CALIBRATE_LABEL} B_t is caller-carried. verdict action=commit`), plain.text);
  assert.ok(!plain.text.includes("aci level"));
  assert.ok(GATE_TOOL_DESCRIPTION.includes(ACI_LABEL), "the tool description carries the label");
  assert.ok(ACI_LABEL.includes("Never a probability of being right."));
  assert.ok(ACI_LABEL.includes("and none decided before (decided_after 0 is always before)"), "what the bound leaves out");
});

test("gate_aci_the_judge_text_says_what_the_level_did_too", async () => {
  const tool = HARNESS_TOOLS.find((t) => t.name === "judge");
  assert.ok(tool !== undefined);
  const kernel: KernelRunner = () => Promise.resolve({ status: 0, stdout: new TextEncoder().encode("deny not-commit\n") });
  const envelope = { prediction: PRED, order: { kind: "OPEN", target: "venue:a", asset: "btc", amount: "100" }, limits: { venues: ["venue:a"], assets: [{ asset: "btc", cap: "100" }] } };
  const run = async (cal: ByoCalibration) => tool.run({ ...envelope, params: { ...BASE, calibration: cal } }, { kernel });
  const shut = await run(calibration([1e6, 2e6, 3e6]));
  assert.ok(shut.text.startsWith(`${JUDGE_LABEL} ${ACI_LABEL} `), shut.text);
  assert.ok(shut.text.includes("aci level=-0.035 gamma=0.05 window=100 T=3 misses=3 no_region=0 max_delay=0 bound=6.0334 region=whole verdict kernel=deny reason=not-commit"), shut.text);
  // A warm-up and a level shut both read abstain / under_calib: the text tells them apart.
  const warm = await run(calibration([], 0.05, 49));
  assert.ok(warm.text.includes("region=warmup"), warm.text);
  // Without aci, the text of the BYO path, byte for byte.
  const plain = await run({ scores: ramp(100), mode: "interval" });
  assert.ok(plain.text.startsWith(`${JUDGE_LABEL} verdict kernel=deny`), plain.text);
  // The structured answer has not moved: the same closed output as runJudge's.
  const direct = await runJudge({ ...envelope, params: { ...BASE, calibration: calibration([]) } } as JudgeInput, { kernel });
  const served = await run(calibration([]));
  assert.deepEqual(served.structured, direct);
});

test("gate_aci_schema_is_closed_optional_and_served", async () => {
  const props = PARAMS_SCHEMA["properties"] as Record<string, Record<string, unknown>>;
  const cal = props["calibration"] as { required: string[]; properties: Record<string, { required: string[]; additionalProperties: boolean }> };
  assert.deepEqual(cal.required, ["scores", "mode"], "optional: a BYO call without it stays valid");
  assert.equal(cal.properties["aci"]?.additionalProperties, false);
  assert.deepEqual(cal.properties["aci"]?.required, ["gamma", "window", "decided_after"]);
  const call = async (body: unknown) => {
    const res = await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", { method: "POST", body: JSON.stringify(body) }));
    return { status: res.status, body: (await res.json()) as { structuredContent?: { verdict: { method: string } }; content?: { text: string }[] } };
  };
  const good = await call({ prediction: PRED, params: { ...BASE, calibration: calibration([]) } });
  assert.equal(good.status, 200);
  assert.equal(good.body.structuredContent?.verdict.method, "hac-cp");
  assert.ok(good.body.content?.[0]?.text.includes("aci level=0.1"));
  const cal0 = calibration([]);
  const extra = await call({ prediction: PRED, params: { ...BASE, calibration: { ...cal0, aci: { ...cal0.aci, extra: 1 } } } });
  assert.equal(extra.status, 400);
  const badGamma = await call({ prediction: PRED, params: { ...BASE, calibration: { ...cal0, aci: { ...cal0.aci, gamma: 1 } } } });
  assert.equal(badGamma.status, 400);
});
