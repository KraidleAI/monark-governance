/**
 * Harness — the paper executor (step 8 of ROADMAP.md, src/paper.ts) with a scripted kernel runner: the executor's own rules, which
 * hold whatever the kernel answers. The gate runs for real, through the served HTTP mirror in process; only the kernel's answers
 * are scripted here (an allow where the real kernel would deny is how the executor's stops are reached). The real kernel runs in
 * paper.kernel.test.ts. The signal is the committed USDe key of stable-run-velocity-24h (commit / covered at intent 0.0001, as the
 * H5 trace); the totals are a trial value.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { canonicalJson, type CanonicalValue, type Prediction } from "@monark/contracts";
import { PaperExecutor, PaperHalt, PaperInputError, PaperReplayError, readPaperConfig, replayPaperJournal, type PaperConfig, type PaperSubmission } from "../src/paper.ts";
import { judgeRequest, type JudgeOrder, type KernelRunner } from "../src/tools/judge.ts";
import { SCHEMA_VERSION, type HarnessParams } from "../src/tools/gate.ts";

const USDE_KEY = "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3";
const PREDICTION: Prediction = { schema_version: SCHEMA_VERSION, task_class: "stable-run-velocity-24h", yhat: 0.0001, predictor_id: USDE_KEY, produced_at: "2026-09-04T00:00:00Z" };
const FUTURE: Prediction = { ...PREDICTION, produced_at: "2999-01-01T00:00:00Z" };
const COMMIT: HarnessParams = { remainingBudget: 1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0.0001, tool: "perps_order_preview", clockOpen: true };
/** A width bound of 0: the USDe region is wider, so the gate defers. */
const DEFER: HarnessParams = { ...COMMIT, tauInterval: 0 };
/** A trial value, declared as such: the totals of real orders are the founder's decision. */
const TRIAL: PaperConfig = { venues: ["paper"], totals: [{ asset: "usde", total: "1000" }] };

const T0 = Date.parse("2026-09-04T00:00:00Z");
const open = (amount: string): JudgeOrder => ({ kind: "OPEN", target: "paper", asset: "usde", amount });
const exit = (amount: string): JudgeOrder => ({ kind: "EXIT", target: "paper", asset: "usde", amount });
const sub = (id: string, minute: number, order: JudgeOrder, params: HarnessParams = COMMIT, prediction: Prediction = PREDICTION): PaperSubmission =>
  ({ id, at_ms: T0 + minute * 60_000, prediction, params, order });
const sha = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");

/** A kernel runner that answers its lines in turn (the last one repeated) and keeps the requests it was handed. */
function kernelSaying(...lines: string[]): { readonly runner: KernelRunner; readonly requests: Uint8Array[] } {
  const requests: Uint8Array[] = [];
  const runner: KernelRunner = (request) => {
    requests.push(request);
    return { status: 0, stdout: new TextEncoder().encode(lines[Math.min(requests.length, lines.length) - 1] ?? "") };
  };
  return { runner, requests };
}

test("paper_open_fills_its_amount_and_hands_the_kernel_the_rest_of_the_total", async () => {
  const k = kernelSaying("allow\n");
  const ex = new PaperExecutor(TRIAL, k.runner);
  const first = await ex.submit(sub("o-1", 0, open("600")));
  assert.deepEqual(first.limits, { venues: ["paper"], assets: [{ asset: "usde", cap: "1000" }] }, "the first cap is the whole total");
  assert.deepEqual([first.judge?.decision?.action, first.judge?.kernel_verdict, first.refusal], ["commit", "allow", null]);
  assert.deepEqual(first.fill, { kind: "OPEN", venue: "paper", asset: "usde", requested: "600", filled: "600" });
  assert.deepEqual(first.state, { positions: [{ venue: "paper", asset: "usde", size: "600" }], engaged: [{ asset: "usde", amount: "600" }] });
  const second = await ex.submit(sub("o-2", 1, open("300")));
  const limits = { venues: ["paper"], assets: [{ asset: "usde", cap: "400" }] };
  assert.deepEqual(second.limits, limits, "the cap handed is the rest of the total: 1000 less the 600 engaged");
  const request = judgeRequest("commit", open("300"), limits);
  assert.deepEqual(Buffer.from(k.requests[1] ?? new Uint8Array()), Buffer.from(request), "the kernel was handed that request");
  assert.equal(second.judge?.kernel_request_sha256, sha(request), "and judge says so");
  assert.deepEqual(second.state, { positions: [{ venue: "paper", asset: "usde", size: "900" }], engaged: [{ asset: "usde", amount: "900" }] });
});

test("paper_exit_fills_at_most_the_size_open_on_its_venue_and_asset", async () => {
  const ex = new PaperExecutor({ venues: ["paper", "other"], totals: TRIAL.totals }, kernelSaying("allow\n").runner);
  await ex.submit(sub("o-1", 0, open("600")));
  const elsewhere = await ex.submit(sub("x-0", 1, { ...exit("50"), target: "other" }));
  assert.deepEqual([elsewhere.judge?.reduce_only, elsewhere.fill?.filled], [true, "0"], "nothing is open on the other venue");
  assert.deepEqual(elsewhere.state.positions, [{ venue: "paper", asset: "usde", size: "600" }], "the position on paper is untouched");
  const x = await ex.submit(sub("x-1", 2, exit("1000")));
  assert.deepEqual([x.judge?.reduce_only, x.fill], [true, { kind: "EXIT", venue: "paper", asset: "usde", requested: "1000", filled: "600" }], "reduce-only: never more than the 600 open");
  assert.deepEqual(x.state, { positions: [], engaged: [{ asset: "usde", amount: "600" }] }, "the position is closed; what was engaged stays engaged");
  const again = await ex.submit(sub("x-2", 3, exit("5")));
  assert.deepEqual([again.judge?.kernel_verdict, again.fill?.filled], ["allow", "0"], "nothing open, nothing filled");
});

test("paper_refuses_a_replayed_id_a_time_going_back_and_a_kind_off_paper_before_the_gate", async () => {
  const k = kernelSaying("allow\n");
  const ex = new PaperExecutor(TRIAL, k.runner);
  await ex.submit(sub("o-1", 5, open("100")));
  const swap: JudgeOrder = { kind: "SWAP", target: "paper", asset: "usde", amount: "1", assetOut: "usdc", minOut: "1" };
  const cases: readonly [PaperSubmission, string][] = [
    [sub("o-1", 6, open("100")), "duplicate_id"],
    [sub("o-2", 4, open("100")), "time_backwards"],
    [sub("s-1", 7, swap), "kind_not_paper"],
    [sub("t-1", 7, { kind: "TRANSFER", target: "paper", asset: "usde", amount: "1" }), "kind_not_paper"],
    [sub("o-2", 8, open("100")), "duplicate_id"],
  ];
  for (const [s, code] of cases) {
    const e = await ex.submit(s);
    assert.deepEqual([e.refusal?.by, e.refusal?.code, e.limits, e.judge, e.fill], ["executor", code, null, null, null], `${s.id}: ${code}`);
    assert.deepEqual(e.state, { positions: [{ venue: "paper", asset: "usde", size: "100" }], engaged: [{ asset: "usde", amount: "100" }] }, `${s.id}: the state is unchanged`);
  }
  assert.equal(k.requests.length, 1, "no kernel ran for a step refused by the executor");
});

test("paper_journals_the_refusals_of_the_engine_and_judges_an_exit_the_gate_refuses", async () => {
  const ex = new PaperExecutor(TRIAL, kernelSaying("allow\n").runner);
  await ex.submit(sub("o-1", 0, open("100")));
  const future = await ex.submit(sub("o-2", 1, open("1"), COMMIT, FUTURE));
  assert.deepEqual([future.refusal?.by, future.refusal?.code, future.judge, future.fill], ["engine", "produced_at_future", null, null], "the gate's tool error");
  assert.deepEqual(future.limits, { venues: ["paper"], assets: [{ asset: "usde", cap: "900" }] }, "judge ran under those limits");
  const malformed = await ex.submit(sub("o-3", 2, open("01")));
  assert.deepEqual([malformed.refusal?.by, malformed.refusal?.code], ["engine", "input_invalid"], "the served input schema refuses a leading 0");
  const x = await ex.submit(sub("x-1", 3, exit("40"), COMMIT, FUTURE));
  assert.deepEqual([x.refusal, x.judge?.decision, x.judge?.gate_error?.code, x.judge?.reduce_only, x.fill?.filled], [null, null, "produced_at_future", true, "40"], "an EXIT is judged under abstain");
  assert.deepEqual(x.state.positions, [{ venue: "paper", asset: "usde", size: "60" }]);
});

test("paper_stops_on_an_allow_that_breaks_the_kernels_rules", async () => {
  const over = new PaperExecutor(TRIAL, kernelSaying("allow\n").runner);
  await assert.rejects(over.submit(sub("o-1", 0, open("1001"))), (e: unknown) => e instanceof PaperHalt && /above the rest of the total/.test(e.message));
  assert.equal(over.journal().split("\n").length, 2, "only the header is journaled");
  await assert.rejects(over.submit(sub("o-2", 1, open("1"))), (e: unknown) => e instanceof PaperHalt && /has stopped/.test(e.message), "it takes no other order");
  const deferred = new PaperExecutor(TRIAL, kernelSaying("allow\n").runner);
  await assert.rejects(deferred.submit(sub("o-1", 0, open("1"), DEFER)), (e: unknown) => e instanceof PaperHalt && /without a commit of the gate/.test(e.message));
  // An answer of the kernel that is not a verdict is a deny (readVerdict, fail-closed), not a stop: nothing fills.
  const unreadable = new PaperExecutor(TRIAL, kernelSaying("maybe\n").runner);
  const e = await unreadable.submit(sub("o-1", 0, open("1")));
  assert.deepEqual([e.judge?.kernel_verdict, e.judge?.kernel_reason, e.fill], ["deny", "unreadable", null]);
});

test("paper_takes_submissions_one_at_a_time_in_call_order", async () => {
  const ex = new PaperExecutor(TRIAL, kernelSaying("allow\n", "deny over-cap\n").runner);
  const [a, b] = await Promise.all([ex.submit(sub("o-1", 0, open("600"))), ex.submit(sub("o-2", 0, open("600")))]);
  assert.deepEqual([a.seq, a.fill?.filled], [1, "600"]);
  assert.deepEqual([b.seq, b.limits?.assets, b.fill], [2, [{ asset: "usde", cap: "400" }], null], "the second ran once the first was journaled");
});

test("paper_refuses_a_submission_that_is_not_one_and_journals_nothing", async () => {
  const ex = new PaperExecutor(TRIAL, kernelSaying("allow\n").runner);
  const good = sub("o-1", 0, open("1"));
  const bad: readonly PaperSubmission[] = [
    { ...good, id: "O-1" },
    { ...good, id: "" },
    { ...good, at_ms: -1 },
    { ...good, at_ms: 1.5 },
    { ...good, extra: true } as unknown as PaperSubmission,
  ];
  for (const s of bad) await assert.rejects(ex.submit(s), PaperInputError, JSON.stringify(s.id));
  assert.equal(ex.journal().split("\n").length, 2, "nothing journaled");
  const ok = await ex.submit(good);
  assert.deepEqual([ok.seq, ok.fill?.filled], [1, "1"], "the executor did not stop, and no id was taken");
});

test("paper_config_is_read_strictly", () => {
  const bad: readonly unknown[] = [
    null,
    { venues: ["paper"], totals: [], extra: 1 },
    { venues: ["Paper"], totals: [] },
    { venues: ["paper", "paper"], totals: [] },
    { venues: ["paper"], totals: [{ asset: "usde", total: "01" }] },
    { venues: ["paper"], totals: [{ asset: "usde", total: "-1" }] },
    { venues: ["paper"], totals: [{ asset: "usde" }] },
    { venues: ["paper"], totals: [{ asset: "usde", total: "1" }, { asset: "usde", total: "2" }] },
  ];
  for (const c of bad) assert.throws(() => readPaperConfig(c), RangeError, JSON.stringify(c));
  assert.throws(() => new PaperExecutor({ venues: ["paper"], totals: [{ asset: "usde", total: "1e3" }] }, kernelSaying("allow\n").runner), RangeError);
  assert.deepEqual(readPaperConfig(TRIAL), TRIAL);
});

test("paper_journal_replays_byte_for_byte_and_refuses_its_first_altered_line", async () => {
  const ex = new PaperExecutor(TRIAL, kernelSaying("allow\n").runner);
  for (const s of [sub("o-1", 0, open("600")), sub("x-1", 1, exit("1000")), sub("o-1", 2, open("1"))]) await ex.submit(s);
  const text = ex.journal();
  assert.deepEqual(await replayPaperJournal(text, kernelSaying("allow\n").runner), { steps: 3, head: ex.head(), state: ex.state() });
  const lines = text.split("\n");
  /** The journal with line n (1-based) rewritten canonically after an edit of its object. */
  const altered = (n: number, edit: (o: Record<string, unknown>) => void): string => {
    const o = JSON.parse(lines[n - 1] ?? "") as Record<string, unknown>;
    edit(o);
    return lines.map((l, i) => (i === n - 1 ? canonicalJson(o as CanonicalValue) : l)).join("\n");
  };
  const refusal = async (journal: string, line: number, field: string): Promise<void> => {
    await assert.rejects(replayPaperJournal(journal, kernelSaying("allow\n").runner), (e: unknown) => e instanceof PaperReplayError && e.line === line && e.field === field, `line ${String(line)}, ${field}`);
  };
  await refusal(altered(3, (o) => { (o["fill"] as Record<string, unknown>)["filled"] = "1000"; }), 3, "fill");
  await refusal(altered(2, (o) => { (o["state"] as { engaged: { amount: string }[] }).engaged[0] = { amount: "0" }; }), 2, "state");
  await refusal(altered(1, (o) => { o["journal"] = "other"; }), 1, "journal");
  await refusal(altered(1, (o) => { (o["config"] as { totals: { total: string }[] }).totals[0] = { total: "2000" }; }), 1, "config");
  await refusal(altered(1, (o) => { (o["config"] as { venues: string[] }).venues.push("vault"); }), 2, "prev");
  await refusal(lines.map((l, i) => (i === 1 ? ` ${l}` : l)).join("\n"), 2, "line");
  await refusal(text.slice(0, -1), 4, "line");
  await refusal([lines[0], lines[2], lines[3], ""].join("\n"), 2, "seq");
});

test("paper_replay_alone_holds_no_journal_cut_at_a_line_or_rewritten_whole_the_kept_head_does", async () => {
  // The limit that src/paper.ts declares: the replay holds each line to the engine and to the line before it, not to an end. A
  // journal cut after a line, or rewritten whole and consistently, replays; only the head kept apart tells it from the journal.
  const steps = [sub("o-1", 0, open("600")), sub("x-1", 1, exit("1000")), sub("o-2", 2, open("1"))];
  const ex = new PaperExecutor(TRIAL, kernelSaying("allow\n").runner);
  for (const s of steps) await ex.submit(s);
  const kept = ex.head();
  const cut = ex.journal().split("\n").slice(0, 3).join("\n") + "\n";
  const shorter = await replayPaperJournal(cut, kernelSaying("allow\n").runner);
  assert.equal(shorter.steps, 2, "the cut journal replays, one step short");
  assert.notEqual(shorter.head, kept, "and its head is not the head kept");
  const forger = new PaperExecutor({ venues: ["paper"], totals: [{ asset: "usde", total: "5000" }] }, kernelSaying("allow\n").runner);
  for (const s of steps) await forger.submit(s);
  const rewritten = await replayPaperJournal(forger.journal(), kernelSaying("allow\n").runner);
  assert.equal(rewritten.steps, 3, "a journal rewritten whole under another total replays");
  assert.notEqual(rewritten.head, kept, "and its head is not the head kept");
});

test("paper_replay_refuses_a_step_that_stops_the_executor_on_the_kernel_it_runs", async () => {
  // Recorded on a kernel that denies the second OPEN, over the rest of the total.
  const ex = new PaperExecutor(TRIAL, kernelSaying("allow\n", "deny over-cap\n").runner);
  await ex.submit(sub("o-1", 0, open("600")));
  const denied = await ex.submit(sub("o-2", 1, open("600")));
  assert.deepEqual([denied.limits?.assets, denied.judge?.kernel_reason, denied.fill], [[{ asset: "usde", cap: "400" }], "over-cap", null]);
  const text = ex.journal();
  const atStep = (e: unknown, line: number): e is PaperReplayError => e instanceof PaperReplayError && e.line === line && e.field === "step";
  // Replayed on a kernel that allows it: the executor stops on that step (an OPEN above the rest), so the replay refuses its line.
  await assert.rejects(replayPaperJournal(text, kernelSaying("allow\n").runner), (e: unknown) => atStep(e, 3) && /above the rest of the total/.test(e.message));
  // A kernel runner that throws: the mirror answers 500, neither a verdict nor a refusal, and the executor stops at the first step.
  const throwing: KernelRunner = () => {
    throw new Error("no kernel");
  };
  await assert.rejects(replayPaperJournal(text, throwing), (e: unknown) => atStep(e, 2) && /neither a verdict nor a refusal/.test(e.message));
  const live = new PaperExecutor(TRIAL, throwing);
  await assert.rejects(live.submit(sub("o-1", 0, open("1"))), (e: unknown) => e instanceof PaperHalt && /answered 500/.test(e.message));
  assert.equal(live.journal().split("\n").length, 2, "only the header is journaled");
  await assert.rejects(live.submit(sub("o-2", 1, open("1"))), (e: unknown) => e instanceof PaperHalt && /has stopped/.test(e.message), "it takes no other order");
});
