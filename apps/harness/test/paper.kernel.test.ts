/**
 * Harness — the paper executor on Genkan's real kernel (step 8 of ROADMAP.md): the chain end to end, on paper. A signal of a
 * served class (the committed USDe key of stable-run-velocity-24h, commit / covered at intent 0.0001 as in the H5 trace) goes
 * through `judge` as the HTTP mirror serves it (HIKAE's gate, then the kernel built from apps/genkan/kernel) and out as an order
 * filled on paper (src/paper.ts); each step goes into the journal, the journal replays on the same kernel, and a journal altered
 * at one line is refused at that line. Each step's outcome is written by hand from the rules of apps/genkan/kernel/Genkan/Judge.lean
 * and of the executor. The kernel is built in a temp copy of apps/genkan/kernel, as apps/genkan/test/formats.kernel.test.ts does:
 * judge.kernel.test.ts builds the tree's own in place, and node --test runs the files at once. It runs in test:genkan only (the
 * file name ends .kernel.test.ts, which `npm test` leaves out). With ELAN_HOME unset or blank and CI unset or false, every test is
 * skipped; with CI set, a missing ELAN_HOME or a home without the pinned lake fails. The total of 1000 is a trial value: the
 * amounts of real orders are the founder's decision.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { canonicalJson, type CanonicalValue, type Prediction } from "@monark/contracts";
import type { BetsText, SuiviPolicy } from "@monark/hikae";
import { PaperExecutor, PaperReplayError, replayPaperJournal, type PaperConfig, type PaperEntry, type PaperSubmission } from "../src/paper.ts";
import { kernelRunner } from "../src/kernel.ts";
import { judgeRequest, type JudgeOrder, type KernelRunner } from "../src/tools/judge.ts";
import { SCHEMA_VERSION, type HarnessParams } from "../src/tools/gate.ts";

const SCRIPTS_DIR = fileURLToPath(new URL("../../genkan/scripts", import.meta.url));
const KERNEL_DIR = fileURLToPath(new URL("../../genkan/kernel", import.meta.url));
const TOOLCHAIN = "leanprover--lean4---v4.32.1";
const LAKE_EXE = process.platform === "win32" ? "lake.exe" : "lake";
const BINARY = process.platform === "win32" ? "genkan-kernel.exe" : "genkan-kernel";

/** A non-blank environment value, or undefined. */
const envValue = (name: string): string | undefined => {
  const v = process.env[name];
  return v === undefined || v.trim() === "" ? undefined : v;
};
const ELAN_HOME = envValue("ELAN_HOME");
const CI_VALUE = envValue("CI");
const ON_CI = CI_VALUE !== undefined && CI_VALUE.trim().toLowerCase() !== "false";
const SKIP: string | false =
  ELAN_HOME === undefined && !ON_CI ? "ELAN_HOME is unset and CI is not set: these tests need the pinned Lean 4.32.1 toolchain under ELAN_HOME" : false;
const OPTIONS = { skip: SKIP, timeout: 280_000 };

const TMP = mkdtempSync(join(tmpdir(), "harness-paper-kernel-test-"));
after(() => {
  rmSync(TMP, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
});

const show = (r: SpawnSyncReturns<string>): string =>
  `status=${String(r.status)} signal=${String(r.signal)} error=${r.error?.message ?? "none"}\nstdout:\n${String(r.stdout)}\nstderr:\n${String(r.stderr)}`;

/** Copies the files of `from` into `to`, the build dir .lake at its root left out. */
function copyKernel(from: string, to: string, rel = ""): void {
  for (const d of readdirSync(join(from, rel), { withFileTypes: true })) {
    if (rel === "" && d.name === ".lake") continue;
    const r = rel === "" ? d.name : join(rel, d.name);
    if (d.isDirectory()) {
      mkdirSync(join(to, r), { recursive: true });
      copyKernel(from, to, r);
    } else copyFileSync(join(from, r), join(to, r));
  }
}

/** The runner of the kernel of the file: copied into a tree with lake.mjs and built once, by the first test that needs it. */
let built: KernelRunner | undefined;
function builtKernel(): KernelRunner {
  if (built !== undefined) return built;
  assert.ok(ELAN_HOME !== undefined, `CI is set (CI=${String(CI_VALUE)}) and ELAN_HOME is not: the kernel tests need ELAN_HOME, the home of the pinned toolchain`);
  const lake = join(ELAN_HOME, "toolchains", TOOLCHAIN, "bin", LAKE_EXE);
  assert.ok(existsSync(lake), `ELAN_HOME=${ELAN_HOME} holds no pinned lake at ${lake}`);
  const root = join(TMP, "tree");
  const scripts = join(root, "apps", "genkan", "scripts");
  const kernel = join(root, "apps", "genkan", "kernel");
  const tmp = join(root, "tmp");
  for (const d of [scripts, kernel, tmp]) mkdirSync(d, { recursive: true });
  copyFileSync(join(SCRIPTS_DIR, "lake.mjs"), join(scripts, "lake.mjs"));
  copyKernel(KERNEL_DIR, kernel);
  const env: NodeJS.ProcessEnv = { ...process.env, ELAN_HOME, GENKAN_TMP: tmp };
  const b = spawnSync(process.execPath, [join(scripts, "lake.mjs"), "build", "genkan-kernel"], { env, encoding: "utf8", stdio: "pipe", timeout: 240_000 });
  assert.equal(b.status, 0, `the kernel builds with the pinned lake\n${show(b)}`);
  const binary = join(kernel, ".lake", "build", "bin", BINARY);
  assert.ok(existsSync(binary), `the build writes the binary ${binary}\n${show(b)}`);
  built = kernelRunner(binary);
  return built;
}

const USDE_KEY = "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3";
const PREDICTION: Prediction = { schema_version: SCHEMA_VERSION, task_class: "stable-run-velocity-24h", yhat: 0.0001, predictor_id: USDE_KEY, produced_at: "2026-09-04T00:00:00Z" };
const FUTURE: Prediction = { ...PREDICTION, produced_at: "2999-01-01T00:00:00Z" };
const COMMIT: HarnessParams = { remainingBudget: 1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0.0001, tool: "perps_order_preview", clockOpen: true };
/** A width bound of 0: the USDe region is wider, so the gate defers. */
const DEFER: HarnessParams = { ...COMMIT, tauInterval: 0 };

const oneBet = (l: string): BetsText => ({ lambdas: [l], weights: ["1"] });
/** The sealed settings of the USDe cell, with PW's bets (apps/harness/test/gate-suivi.test.ts): six misses close the segment. */
const PW: SuiviPolicy = { schema: "hikae-suivi-policy-v1", task_class: "stable-run-velocity-24h", cell_key: USDE_KEY,
  population: "usde-consecutive-calm-pairs-v1", policy_version: 1, a: "1/3", delta_adm: "1/20", delta_exh: "1/64", alpha_arl: "1/100",
  m: "1/3", eta_m1: "1/20", sr_reading_threshold: "10000", restart_weights: "1/(j(j+1))",
  bets_k: oneBet("1/2"), bets_w: oneBet("3/2"), bets_sr: oneBet("1/2"), grace_steps: 1, grid_ms: 86400000, l_ms: 37800000, thin_window: 90,
  thin_min: 30, keyring: [] };
const T_REF = 1_790_000_000_000;
/** The cell's tracking after six misses in a row: the segment is closed, the replayed budget is -1, so the gate abstains. */
const CLOSED: HarnessParams = { ...COMMIT, suivi: { policy: PW, open: true,
  evaluations: Array.from({ length: 6 }, (_, i) => ({ seq: i, t_step_ms: T_REF + i * PW.grid_ms, yhat_ref: "0.0001", produced_at_ref: "2026-11-01T00:00:00Z", pre_member: true })),
  outcomes: Array.from({ length: 6 }, (_, seq) => ({ seq, resolved: true, member: true, miss: 1 as const })) } };

/** A trial value, declared as such: the totals of real orders are the founder's decision. */
const TRIAL: PaperConfig = { venues: ["paper"], totals: [{ asset: "usde", total: "1000" }] };
const T0 = Date.parse("2026-09-04T00:00:00Z");
const open = (amount: string): JudgeOrder => ({ kind: "OPEN", target: "paper", asset: "usde", amount });
const exit = (amount: string): JudgeOrder => ({ kind: "EXIT", target: "paper", asset: "usde", amount });
const SWAP: JudgeOrder = { kind: "SWAP", target: "paper", asset: "usde", amount: "1", assetOut: "usdc", minOut: "1" };
const sub = (id: string, minute: number, order: JudgeOrder, params: HarnessParams = COMMIT, prediction: Prediction = PREDICTION): PaperSubmission =>
  ({ id, at_ms: T0 + minute * 60_000, prediction, params, order });

/** What a step must journal: the cap handed to judge (null when judge did not run), the refusal's code, the gate's action and
 *  reason or its error's code, the kernel's line, reduce_only, the size filled, then the size open on paper and what is engaged. */
interface Expected {
  readonly cap: string | null;
  readonly refusal: string | null;
  readonly gate: string | null;
  readonly kernel: string | null;
  readonly reduceOnly: boolean | null;
  readonly filled: string | null;
  readonly open: string | null;
  readonly engaged: string;
}
const judged = (cap: string, gate: string, kernel: string, reduceOnly: boolean, filled: string | null, open: string | null, engaged: string): Expected =>
  ({ cap, refusal: null, gate, kernel, reduceOnly, filled, open, engaged });
const refused = (cap: string | null, refusal: string, open: string | null, engaged: string): Expected =>
  ({ cap, refusal, gate: null, kernel: null, reduceOnly: null, filled: null, open, engaged });

/** The scenario, its outcomes by hand. The kernel holds a cap to one order; the executor hands it the rest of the total. */
const STEPS: readonly (readonly [PaperSubmission, Expected])[] = [
  [sub("open-1", 1, open("600")), judged("1000", "commit covered", "allow", false, "600", "600", "600")],
  [sub("open-2", 2, open("600")), judged("400", "commit covered", "deny over-cap", false, null, "600", "600")],
  [sub("open-3", 3, open("400")), judged("400", "commit covered", "allow", false, "400", "1000", "1000")],
  [sub("open-4", 4, open("1"), DEFER), judged("0", "defer interval_too_wide", "deny not-commit", false, null, "1000", "1000")],
  [sub("open-5", 5, open("1"), CLOSED), judged("0", "abstain budget_exhausted", "deny not-commit", false, null, "1000", "1000")],
  // The segment is closed and nothing more opens; an EXIT still goes out, reduce-only.
  [sub("exit-1", 6, exit("300"), CLOSED), judged("0", "abstain budget_exhausted", "allow", true, "300", "700", "1000")],
  // The gate refuses the envelope: the EXIT is judged under abstain, and fills the 700 open, not the 5000 asked.
  [sub("exit-2", 7, exit("5000"), COMMIT, FUTURE), judged("0", "produced_at_future", "allow", true, "700", null, "1000")],
  [sub("exit-3", 8, exit("10")), judged("0", "commit covered", "allow", true, "0", null, "1000")],
  // What was engaged stays engaged: the total is spent, though nothing is open.
  [sub("open-6", 9, open("1")), judged("0", "commit covered", "deny over-cap", false, null, null, "1000")],
  [sub("open-1", 10, open("1")), refused(null, "duplicate_id", null, "1000")],
  [sub("open-7", 11, open("1"), COMMIT, FUTURE), refused("0", "produced_at_future", null, "1000")],
  [sub("swap-1", 12, SWAP), refused(null, "kind_not_paper", null, "1000")],
  [sub("open-8", 13, open("01")), refused("0", "input_invalid", null, "1000")],
  [sub("open-9", 12, open("1")), refused(null, "time_backwards", null, "1000")],
];

const sha = (b: Uint8Array | string): string => createHash("sha256").update(b).digest("hex");

/** What an entry journals, in the terms of Expected. */
function outcome(e: PaperEntry): Expected {
  const j = e.judge;
  return {
    cap: e.limits === null ? null : e.limits.assets.map((a) => a.cap).join(","),
    refusal: e.refusal?.code ?? null,
    gate: j === null ? null : j.decision !== null ? `${j.decision.action} ${j.decision.reason}` : (j.gate_error?.code ?? "none"),
    kernel: j === null ? null : j.kernel_verdict === "allow" ? "allow" : `deny ${String(j.kernel_reason)}`,
    reduceOnly: j === null ? null : j.reduce_only,
    filled: e.fill?.filled ?? null,
    open: e.state.positions.find((p) => p.venue === "paper" && p.asset === "usde")?.size ?? null,
    engaged: e.state.engaged.map((a) => a.amount).join(","),
  };
}

/** The scenario on an executor of its own: the executor, and its entries. */
async function scenario(kernel: KernelRunner): Promise<{ readonly ex: PaperExecutor; readonly entries: readonly PaperEntry[] }> {
  const ex = new PaperExecutor(TRIAL, kernel);
  const entries: PaperEntry[] = [];
  for (const [s] of STEPS) entries.push(await ex.submit(s));
  return { ex, entries };
}

test("paper_chain_end_to_end_on_the_built_kernel", OPTIONS, async () => {
  const kernel = builtKernel();
  const { ex, entries } = await scenario(kernel);
  STEPS.forEach(([s, want], i) => {
    const e = entries[i];
    assert.ok(e !== undefined, `step ${String(i + 1)} is journaled`);
    assert.deepEqual(outcome(e), want, `step ${String(i + 1)} (${s.id})`);
    assert.equal(e.seq, i + 1);
    assert.deepEqual(e.submission, s, `step ${String(i + 1)} journals its submission as it was made`);
    if (e.judge !== null && e.limits !== null) {
      const request = judgeRequest(e.judge.decision?.action ?? "abstain", s.order, e.limits);
      assert.equal(e.judge.kernel_request_sha256, sha(request), `step ${String(i + 1)}: the kernel judged the request of this action, order and rest of the total`);
    }
  });
  // The journal: a header, then one line a step, each the canonical writing of its entry, each chained to the line before it.
  const lines = ex.journal().split("\n");
  assert.deepEqual([lines.length, lines.at(-1)], [STEPS.length + 2, ""], "a header, a line a step, a newline after each");
  assert.equal(lines[0], canonicalJson({ journal: "monark-paper-journal-v1", config: TRIAL as unknown as CanonicalValue }));
  entries.forEach((e, i) => {
    assert.equal(lines[i + 1], canonicalJson(e as unknown as CanonicalValue), `line ${String(i + 2)} is the canonical writing of step ${String(i + 1)}`);
    assert.equal(e.prev, sha(lines[i] ?? ""), `step ${String(i + 1)} carries the sha256 of the line before it`);
  });
  assert.equal(ex.head(), sha(lines.at(-2) ?? ""), "the head is the sha256 of the last line");
  assert.deepEqual(ex.state(), { positions: [], engaged: [{ asset: "usde", amount: "1000" }] });
  // No clock is read: the same submissions journal the same bytes.
  const again = await scenario(kernel);
  assert.equal(again.ex.journal(), ex.journal(), "a second executor journals the same bytes");
});

test("paper_journal_replays_on_the_built_kernel_and_refuses_its_first_altered_line", OPTIONS, async () => {
  const kernel = builtKernel();
  const { ex } = await scenario(kernel);
  const text = ex.journal();
  assert.deepEqual(await replayPaperJournal(text, kernel), { steps: STEPS.length, head: ex.head(), state: ex.state() }, "the journal replays");
  const lines = text.split("\n");
  /** The journal with line n (1-based) rewritten canonically after an edit of its object. */
  const altered = (n: number, edit: (o: Record<string, unknown>) => void): string => {
    const o = JSON.parse(lines[n - 1] ?? "") as Record<string, unknown>;
    edit(o);
    return lines.map((l, i) => (i === n - 1 ? canonicalJson(o as CanonicalValue) : l)).join("\n");
  };
  const field = (o: Record<string, unknown>, ...path: string[]): Record<string, unknown> =>
    path.reduce<Record<string, unknown>>((at, k) => at[k] as Record<string, unknown>, o);
  const cases: readonly [string, string, number, string][] = [
    // An EXIT that would fill more than the size open: the 5000 asked instead of the 700 open.
    ["an EXIT filled past the open size", altered(8, (o) => { field(o, "fill")["filled"] = "5000"; }), 8, "fill"],
    ["a deny turned into an allow", altered(3, (o) => { Object.assign(field(o, "judge"), { kernel_verdict: "allow", kernel_reason: null }); }), 3, "judge"],
    ["a position grown", altered(4, (o) => { field(o, "state")["positions"] = [{ venue: "paper", asset: "usde", size: "2000" }]; }), 4, "state"],
    ["another kernel request", altered(2, (o) => { field(o, "judge")["kernel_request_sha256"] = "0".repeat(64); }), 2, "judge"],
    // The evidence that made the gate abstain taken out: the gate now commits, and the kernel denies over-cap, not not-commit.
    ["the tracking taken out of a submission", altered(6, (o) => { delete field(o, "submission", "params")["suivi"]; }), 6, "judge"],
    ["a line taken out", lines.filter((_, i) => i !== 2).join("\n"), 3, "seq"],
    ["a chain link changed", altered(5, (o) => { o["prev"] = "0".repeat(64); }), 5, "prev"],
    ["the total raised in the header", altered(1, (o) => { Object.assign(field(o, "config"), { totals: [{ asset: "usde", total: "2000" }] }); }), 2, "prev"],
  ];
  for (const [what, journal, line, name] of cases) {
    assert.notEqual(journal, text, what);
    await assert.rejects(replayPaperJournal(journal, kernel), (e: unknown) => e instanceof PaperReplayError && e.line === line && e.field === name, `${what}: refused at line ${String(line)}, ${name}`);
  }
});
