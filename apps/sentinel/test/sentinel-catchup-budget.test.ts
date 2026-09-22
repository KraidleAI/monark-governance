// SENTINEL — off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// Lot NARABI-OPS-1c (C1..C6): the BOUNDED catch-up. `runDue` stops entering a NEW due day once a per-run TIME
// budget is spent, writes the days already produced, exits 1, and the next slot resumes at prevDay+1. Offline,
// no network. Two seams, one arithmetic (advance the injected clock the FIRST time a day's getLogs from_block
// is seen): SUBPROCESS drives the real `main` with a `fetch` stub reading a PLAN file (motif of
// sentinel-retry.test.ts); DIRECT calls `runDue` with a pool over an injected `call` (motif of sentinel.test.ts).
// The plan is a linear block<->ts chain with a constant flow and a rolling supply that holds the C1 identity
// (supply_close = supply_open + mints - burns) and chains across days (from_block(D+1)-1 = to_block(D)).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { trackerReplay } from "@monark/hikae";
import { makeRpcPool } from "../src/rpc.ts";
import type { RpcCall } from "../src/rpc.ts";
import { initState, committedQ1, lineHashOf, TRACKER_PARAMS } from "../src/timeline.ts";
import type { TimelineLine } from "../src/timeline.ts";
import { runDue, budgetMsFromEnv, BUDGET_DEFAULT_S, BUDGET_MAX_S, MARGIN_MIN_S } from "../src/run.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(HERE, "..", "..", "..");
const RUN_TS = join(HERE, "..", "src", "run.ts");
const SERVICE = join(REPO, "deploy", "monark-sentinel.service");
const FIXTURE = join(HERE, "fixtures", "narabi-timeline-2026-09-19.jsonl");
const PROV = { endpoints: ["stub://a", "stub://b"], node_version: "test", sentinel_sha: "0".repeat(64) };

// The synthetic chain: 7200 blocks per UTC day (12 s/block), a constant daily flow (fixture-scale so the
// adapter reads it as evaluable), a supply that grows by (mints - burns) each day. STEP_MS is the injected
// clock's per-day advance; CLOCK_BASE_MS cancels in elapsed = end - t0.
const P = 7200;
const B0 = 26_000_000;
const DAY0 = "2026-09-01";
const BURNS = 12_326_941_926_000_000_000_000_000n;
const MINTS = 48_805_731_455_313_400_000_000_000n;
const S0 = 4_807_659_943_929_545_133_523_503_861n;
const STEP_MS = 30_000;
const CLOCK_BASE_MS = 1_000_000;

const midnight = (d: string): number => Math.floor(Date.parse(d + "T00:00:00Z") / 1000);
const addDays = (d: string, n: number): string => new Date(Date.parse(d + "T00:00:00Z") + n * 86_400_000).toISOString().slice(0, 10);

interface DayPlan { day: string; from_block: number; to_block: number; burns: string; mints: string; supply_open: string; supply_close: string; }
interface Plan { days: DayPlan[]; fin_block: number; fin_ts: number; clock_base_ms: number; clock_step_ms: number; }

function synthDay(k: number): DayPlan {
  const open = S0 + BigInt(k) * (MINTS - BURNS);
  return {
    day: addDays(DAY0, k), from_block: B0 + k * P, to_block: B0 + (k + 1) * P - 1,
    burns: BURNS.toString(), mints: MINTS.toString(),
    supply_open: open.toString(), supply_close: (open + MINTS - BURNS).toString(), // C1: close = open + mints - burns
  };
}
function synthPlan(dueCount: number): Plan {
  return {
    days: Array.from({ length: dueCount }, (_, k) => synthDay(k)),
    fin_block: B0 + dueCount * P + 5,                    // a few blocks past the last due day's close
    fin_ts: midnight(addDays(DAY0, dueCount)) + 3600,    // exactly `dueCount` days are finalized-complete
    clock_base_ms: CLOCK_BASE_MS, clock_step_ms: STEP_MS,
  };
}

// The fetch stub for the SUBPROCESS runs (written to a temp file, imported before run.ts). It reads the PLAN
// from STUB_PLAN, answers the four JSON-RPC methods off the linear chain, and advances `performance.now` once
// per served day (first-sight of a day's getLogs from_block). No `${}` interpolation: the plan carries all data.
const STUB_SRC = `
import { readFileSync } from "node:fs";
const plan = JSON.parse(readFileSync(process.env.STUB_PLAN, "utf8"));
const days = plan.days;
const midnight = (d) => Math.floor(new Date(d + "T00:00:00Z").getTime() / 1000);
const anchors = days.map((w) => [w.from_block, midnight(w.day)]);
const last = days[days.length - 1];
anchors.push([last.to_block + 1, midnight(last.day) + 86400]);
function tsOf(b) {
  if (b <= anchors[0][0]) { const [b0, t0] = anchors[0], [b1, t1] = anchors[1]; return Math.round(t0 + (b - b0) * (t1 - t0) / (b1 - b0)); }
  for (let i = 0; i < anchors.length - 1; i++) { const [b0, t0] = anchors[i], [b1, t1] = anchors[i + 1]; if (b <= b1) return Math.round(t0 + (b - b0) * (t1 - t0) / (b1 - b0)); }
  const n = anchors.length, [b0, t0] = anchors[n - 2], [b1, t1] = anchors[n - 1]; return Math.round(t1 + (b - b1) * (t1 - t0) / (b1 - b0));
}
const byFrom = new Map(days.map((w) => [w.from_block, w]));
const supply = new Map();
for (const w of days) { supply.set(w.to_block, BigInt(w.supply_close)); supply.set(w.from_block - 1, BigInt(w.supply_open)); }
const hex = (n) => "0x" + BigInt(n).toString(16);
const ZERO = "0x" + "0".repeat(64), ONE = "0x" + "1".repeat(64);
let clock = plan.clock_base_ms;
const seen = new Set();
performance.now = () => clock;
globalThis.fetch = (url, init) => {
  const { method, params } = JSON.parse(init.body);
  const ok = (result) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ jsonrpc: "2.0", id: 1, result }) });
  const fail = (status) => Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) });
  if (method === "eth_getBlockByNumber") {
    const tag = params[0];
    if (tag === "finalized") return ok({ number: hex(plan.fin_block), timestamp: hex(plan.fin_ts) });
    const b = parseInt(tag, 16); return ok({ number: hex(b), timestamp: hex(tsOf(b)) });
  }
  if (method === "eth_getLogs") {
    const from = parseInt(params[0].fromBlock, 16); const w = byFrom.get(from); if (!w) return ok([]);
    if (!seen.has(from)) { seen.add(from); clock += plan.clock_step_ms; }
    return ok([{ topics: [ZERO, ONE, ZERO], data: hex(BigInt(w.burns)) }, { topics: [ZERO, ZERO, ONE], data: hex(BigInt(w.mints)) }]);
  }
  if (method === "eth_call") { const block = parseInt(params[1], 16); const s = supply.get(block); if (s === undefined) return fail(500); return ok(hex(s)); }
  return fail(400);
};
`;

let scratch: string | null = null;
function scratchDir(): string { scratch ??= mkdtempSync(join(tmpdir(), "narabi-catchup-")); return scratch; }
function stubUrl(): string { const p = join(scratchDir(), "stub-fetch.mjs"); writeFileSync(p, STUB_SRC); return pathToFileURL(p).href; }
function writePlan(name: string, plan: Plan): string { const p = join(scratchDir(), name); writeFileSync(p, JSON.stringify(plan)); return p; }
function freshStateDir(): string { return mkdtempSync(join(scratchDir(), "state-")); }

// L-4 lesson (sentinel-retry.test.ts:106-112): clean the mkdtemp scratch; the non-vacuity assert keeps the
// cleanup from being a silent no-op.
after(() => {
  assert.notEqual(scratch, null, "the suite allocated a scratch dir (non-vacuous cleanup)");
  if (scratch !== null) { rmSync(scratch, { recursive: true, force: true }); assert.equal(existsSync(scratch), false, "the scratch dir is removed after the suite (no mkdtemp leak)"); }
});

interface EndJson {
  startDay: string; j0Source: string; processedDays: string[]; lag: number; stopped: string | null;
  finalized: number; T: number; chainstack: boolean; chainstack_guard: string; exit_code: number; dryRun: boolean;
  elapsed_ms: number; max_day_ms: number;
}
interface RunResult { status: number; stdout: string; stderr: string; end: EndJson | null; }

// Drive the REAL run.ts as a subprocess with the fetch stub. The child env is built from process.env with
// CHAINSTACK_ETH_URL and every MONARK_SENTINEL_* deleted (L-4:123 hygiene), then STUB_PLAN + `vars` are set,
// so a key or a budget in the orchestrator shell never leaks in. `end` is null when no run summary is printed.
function runMain(stateDir: string, planPath: string, vars: Record<string, string>, extraArgs: readonly string[] = []): RunResult {
  const env: NodeJS.ProcessEnv = { ...process.env };
  // NARABI-OPS-1d hygiene: drop the paid key AND the non-secret guard cycle keys, so a shell carrying a cycle id
  // cannot flip chainstack_guard from "unconfigured" to "ledger_error" in these keyless-only runs (mirror runSentinel).
  for (const k of ["CHAINSTACK_ETH_URL", "CHAINSTACK_CYCLE_ID", "CHAINSTACK_ETH_ORIGIN", "CHAINSTACK_CYCLE_FLOOR"]) delete env[k];
  for (const k of Object.keys(env)) if (k.startsWith("MONARK_SENTINEL_")) delete env[k];
  Object.assign(env, { STUB_PLAN: planPath }, vars);
  const r = spawnSync(process.execPath, ["--import", stubUrl(), RUN_TS, "--state", stateDir, ...extraArgs], { cwd: REPO, env, encoding: "utf8", timeout: 90_000 });
  const stdout = r.stdout ?? "";
  const close = stdout.indexOf("\n}");
  const end = close >= 0 ? (JSON.parse(stdout.slice(0, close + 2)) as EndJson) : null;
  return { status: r.status ?? -1, stdout, stderr: r.stderr ?? "", end };
}

function readLines(dir: string): TimelineLine[] {
  return readFileSync(join(dir, "timeline.jsonl"), "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim()).map((l) => JSON.parse(l) as TimelineLine);
}

// The DIRECT injected `call`: the same offline chain + first-sight clock advance, in-process, for a runDue
// unit test. `clock.t` is read by `now: () => clock.t`; identical arithmetic to the subprocess seam.
interface Clock { t: number; }
function directCall(clock: Clock, days: DayPlan[], finBlock: number, finTs: number): RpcCall {
  const seen = new Set<number>();
  const byFrom = new Map(days.map((w) => [w.from_block, w]));
  const supply = new Map<number, bigint>();
  for (const w of days) { supply.set(w.to_block, BigInt(w.supply_close)); supply.set(w.from_block - 1, BigInt(w.supply_open)); }
  const anchors: [number, number][] = days.map((w) => [w.from_block, midnight(w.day)]);
  const last = days[days.length - 1]!;
  anchors.push([last.to_block + 1, midnight(last.day) + 86_400]);
  const tsOf = (b: number): number => {
    const seg = (i: number): number => { const [b0, t0] = anchors[i]!, [b1, t1] = anchors[i + 1]!; return Math.round(t0 + (b - b0) * (t1 - t0) / (b1 - b0)); };
    if (b <= anchors[0]![0]) return seg(0);
    for (let i = 0; i < anchors.length - 1; i++) if (b <= anchors[i + 1]![0]) return seg(i);
    return seg(anchors.length - 2);
  };
  const hex = (n: bigint | number): string => "0x" + BigInt(n).toString(16);
  const ZERO = "0x" + "0".repeat(64), ONE = "0x" + "1".repeat(64);
  return (_url: string, method: string, params: readonly unknown[]): Promise<unknown> => {
    if (method === "eth_getBlockByNumber") {
      const tag = params[0] as string;
      if (tag === "finalized") return Promise.resolve({ number: hex(finBlock), timestamp: hex(finTs) });
      return Promise.resolve({ number: tag, timestamp: hex(tsOf(parseInt(tag, 16))) });
    }
    if (method === "eth_getLogs") {
      const from = parseInt((params[0] as { fromBlock: string }).fromBlock, 16);
      const w = byFrom.get(from);
      if (w === undefined) return Promise.resolve([]);
      if (!seen.has(from)) { seen.add(from); clock.t += STEP_MS; }
      return Promise.resolve([{ topics: [ZERO, ONE, ZERO], data: hex(BigInt(w.burns)) }, { topics: [ZERO, ZERO, ONE], data: hex(BigInt(w.mints)) }]);
    }
    if (method === "eth_call") {
      const s = supply.get(parseInt(params[1] as string, 16));
      return s === undefined ? Promise.reject(new Error("no supply at block")) : Promise.resolve(hex(s));
    }
    return Promise.reject(new Error(`unexpected method ${method}`));
  };
}

test("sentinel_catchup_budget_stops_cleanly_between_days — 20-day backlog, +30 s/day, budget 180 s: 7 days written, stopped catchup_budget, lag 13, exit 1; the timeline is 7 chained lines ending in a newline and the public state.json digest equals the 7th line's digest_T (C1/C5; ADR-NARABI-OPS-1c)", () => {
  const planPath = writePlan("plan20a.json", synthPlan(20));
  const dir = freshStateDir();
  const r = runMain(dir, planPath, { MONARK_SENTINEL_J0: DAY0, MONARK_SENTINEL_BUDGET_S: "180" });
  assert.equal(r.status, 1, "a budget stop exits 1 (L-1: stopped != null => exit 1)");
  const end = r.end;
  assert.ok(end !== null, `run printed a summary. stdout=${JSON.stringify(r.stdout)} stderr=${JSON.stringify(r.stderr)}`);
  assert.equal(end.stopped, "catchup_budget", "the stop names the budget");
  assert.deepEqual(end.processedDays, Array.from({ length: 7 }, (_, k) => addDays(DAY0, k)), "the first 7 contiguous days, in order");
  assert.equal(end.lag, 13, "13 days remain (20 - 7)");
  assert.equal(end.exit_code, 1);
  assert.equal(end.elapsed_ms, 7 * STEP_MS, "elapsed = 7 served days x 30 s (pins the injected-clock seam)");
  assert.equal(end.max_day_ms, STEP_MS, "the widest single day is 30 s");
  const tlRaw = readFileSync(join(dir, "timeline.jsonl"), "utf8");
  assert.ok(tlRaw.endsWith("\n"), "the timeline ends in a newline (one append of k lines)");
  const lines = readLines(dir);
  assert.equal(lines.length, 7, "exactly 7 lines were written");
  for (let i = 1; i < lines.length; i++) assert.equal(lines[i]!.prev_line_hash, lines[i - 1]!.line_hash, `line ${String(i)} chains onto its predecessor`);
  for (const l of lines) assert.equal(lineHashOf(l), l.line_hash, "each line_hash recomputes from its own hashed fields");
  const pubState = JSON.parse(readFileSync(join(dir, "public", "state.json"), "utf8")) as { digest: string };
  assert.equal(pubState.digest, lines[lines.length - 1]!.digest_T, "the public state.json digest equals the 7th line's digest_T (the probe's fact-5 invariant)");
});

test("sentinel_budget_env_value_reaches_rundue — a NON-default MONARK_SENTINEL_BUDGET_S actually governs the catch-up: main passes the VALIDATED value to runDue, not the constant default. Budget 30 s on the 20-day backlog (+30 s/day) processes exactly 2 days (C1 checkpoint-2; kills the mutant where main validates the env but passes 180000; ADR-NARABI-OPS-1c)", () => {
  const dir = freshStateDir();
  const r = runMain(dir, writePlan("plan30s.json", synthPlan(20)), { MONARK_SENTINEL_J0: DAY0, MONARK_SENTINEL_BUDGET_S: "30" });
  assert.equal(r.status, 1, "a budget stop exits 1");
  const end = r.end;
  assert.ok(end !== null, `end JSON present. stderr=${JSON.stringify(r.stderr)}`);
  assert.equal(end.stopped, "catchup_budget");
  assert.deepEqual(end.processedDays, [addDays(DAY0, 0), addDays(DAY0, 1)], "a 30 s budget (+30 s/day) processes exactly 2 due days, NOT the default-180 seven");
  assert.equal(end.processedDays.length, 2);
  assert.equal(end.lag, 18, "18 remain (20 - 2)");
  assert.equal(end.elapsed_ms, 2 * STEP_MS, "elapsed = 2 served days x 30 s (the injected clock advanced twice before the stop)");
});

test("sentinel_catchup_resumes_next_slot_without_gap — the next slot resumes exactly at prevDay+1, no day duplicated and no gap, and the whole chain replays through trackerReplay (C1; ADR-NARABI-OPS-1c)", () => {
  const planPath = writePlan("plan20b.json", synthPlan(20));
  const dir = freshStateDir();
  const r1 = runMain(dir, planPath, { MONARK_SENTINEL_J0: DAY0, MONARK_SENTINEL_BUDGET_S: "180" });
  assert.equal(r1.status, 1);
  assert.equal(readLines(dir).length, 7, "run 1 wrote the first 7 days");
  const r2 = runMain(dir, planPath, { MONARK_SENTINEL_J0: DAY0, MONARK_SENTINEL_BUDGET_S: "180" });
  assert.equal(r2.status, 1, "still catching up => exit 1");
  const end2 = r2.end;
  assert.ok(end2 !== null);
  assert.equal(end2.processedDays[0], addDays(DAY0, 7), "run 2 resumes exactly at prevDay+1 (day index 7)");
  assert.equal(end2.processedDays.length, 7, "run 2 makes the same 7-day progress");
  const all = readLines(dir);
  const daysSeen = all.map((l) => l.day);
  assert.deepEqual(daysSeen, Array.from({ length: 14 }, (_, k) => addDays(DAY0, k)), "contiguous days 0..13, no gap at the run boundary");
  assert.equal(new Set(daysSeen).size, 14, "no day was reprocessed across the two runs");
  for (let i = 1; i < all.length; i++) assert.equal(all[i]!.prev_line_hash, all[i - 1]!.line_hash, "the hash chain is continuous across the resume boundary");
  const sPairs = all.map((l) => l.s).filter((x): x is number => x !== null);
  const replay = trackerReplay(committedQ1(), TRACKER_PARAMS, sPairs);
  const pubState = JSON.parse(readFileSync(join(dir, "public", "state.json"), "utf8")) as { replay_q: number };
  assert.equal(replay.q, pubState.replay_q, "trackerReplay over the written chain equals the published replay_q");
});

test("sentinel_first_due_day_always_attempted — with the budget already spent (budgetMs -1) the FIRST due day is processed; only the later days become lag (ADR-NARABI-OPS-1c)", async () => {
  const days = Array.from({ length: 3 }, (_, k) => synthDay(k));
  const hi = B0 + 3 * P + 5;
  const clock: Clock = { t: CLOCK_BASE_MS };
  const pool = makeRpcPool({ endpoints: ["stub://a", "stub://b"], call: directCall(clock, days, hi, midnight(addDays(DAY0, 3)) + 3600) });
  const report = await runDue(initState(), pool, days.map((d) => d.day), hi, PROV, { now: () => clock.t, budgetMs: -1 });
  assert.deepEqual(report.processedDays, [addDays(DAY0, 0)], "the first due day is attempted despite the spent budget");
  assert.equal(report.stopped, "catchup_budget", "the stop fires before the second day");
  assert.equal(report.lag, 2, "the two later days remain as lag");
});

test("sentinel_budget_boundary_is_strict — elapsed exactly equal to the budget does NOT stop (the comparison is strict >); the >= mutant stops one day early (C6; ADR-NARABI-OPS-1c)", async () => {
  const days = Array.from({ length: 2 }, (_, k) => synthDay(k));
  const hi = B0 + 2 * P + 5;
  const clock: Clock = { t: CLOCK_BASE_MS };
  const pool = makeRpcPool({ endpoints: ["stub://a", "stub://b"], call: directCall(clock, days, hi, midnight(addDays(DAY0, 2)) + 3600) });
  const report = await runDue(initState(), pool, days.map((d) => d.day), hi, PROV, { now: () => clock.t, budgetMs: STEP_MS });
  assert.deepEqual(report.processedDays, [addDays(DAY0, 0), addDays(DAY0, 1)], "both days are processed: elapsed == budget is NOT over budget");
  assert.equal(report.stopped, null, "no stop at the exact boundary");
  assert.equal(report.lag, 0);
});

test("sentinel_max_day_ms_covers_the_slowest_faulting_day — the FAULTING day is the SLOWEST (2xSTEP): max_day_ms measures it in the per-day finally even though it breaks before the step, so a 'measure on success only' mutant (which reports STEP, the earlier healthy day) reds (C-G2-2 hardened; ADR-NARABI-OPS-1c)", async () => {
  const days = Array.from({ length: 2 }, (_, k) => synthDay(k));
  const hi = B0 + 2 * P + 5;
  const clock: Clock = { t: CLOCK_BASE_MS };
  const base = directCall(clock, days, hi, midnight(addDays(DAY0, 2)) + 3600);
  // Day 0 (healthy) advances STEP on its getLogs (base's first-sight); day 1 (faulting) advances ONE EXTRA STEP,
  // guarded to fire exactly ONCE (getLogs is called per quorum provider), so the faulting day is deterministically
  // 2xSTEP — strictly the widest — BEFORE supplyAt rejects. maxDayMs is taken in runDue's per-day `finally` (runs
  // on break), so it MUST report 2xSTEP; a mutant that measures only PROCESSED days reports STEP (day 0) and reds.
  let extraCharged = false;
  const faulty: RpcCall = (u, m, p) => {
    if (m === "eth_getLogs" && parseInt((p[0] as { fromBlock: string }).fromBlock, 16) === days[1]!.from_block && !extraCharged) { extraCharged = true; clock.t += STEP_MS; }
    if (m === "eth_call" && parseInt(p[1] as string, 16) === days[1]!.to_block) return Promise.reject(new Error("HTTP 500"));
    return base(u, m, p);
  };
  const report = await runDue(initState(), makeRpcPool({ endpoints: ["stub://a", "stub://b"], call: faulty }), days.map((d) => d.day), hi, PROV, { now: () => clock.t, budgetMs: 10 * STEP_MS });
  assert.deepEqual(report.processedDays, [addDays(DAY0, 0)], "the reachable healthy day (STEP) was processed");
  assert.match(report.stopped ?? "", /^fetch_error:/, "the second day stops on the injected fault");
  assert.equal(report.maxDayMs, 2 * STEP_MS, "the FAULTING day (2xSTEP) is the widest and IS measured (finally runs on break); a 'success-only' mutant reports STEP and reds");
});

test("sentinel_budget_env_is_validated — MONARK_SENTINEL_BUDGET_S is a plain integer in 30..180 or the run throws at start-up (fail-closed); boundaries and a real subprocess (C2; ADR-NARABI-OPS-1c)", () => {
  assert.equal(budgetMsFromEnv({ MONARK_SENTINEL_BUDGET_S: "30" }), 30_000, "30 is the low bound");
  assert.equal(budgetMsFromEnv({ MONARK_SENTINEL_BUDGET_S: "180" }), 180_000, "180 is the high bound");
  // C-G2-1: leading zeros are REFUSED ("0180"/"030" — a mutant reverting the regex to /^\d+$/ makes these parse to
  // 180/30 (in range) => NO throw => this reds). Also the prior set (out-of-range, non-integer, signed, spaced).
  for (const bad of ["29", "181", "0", "0180", "030", "180.0", "abc", "", "-30", " 60", "60 "]) {
    assert.throws(() => budgetMsFromEnv({ MONARK_SENTINEL_BUDGET_S: bad }), /MONARK_SENTINEL_BUDGET_S/, `${JSON.stringify(bad)} is rejected`);
  }
  const dir = freshStateDir();
  const r = runMain(dir, writePlan("plan-env.json", synthPlan(3)), { MONARK_SENTINEL_J0: DAY0, MONARK_SENTINEL_BUDGET_S: "181" });
  assert.equal(r.status, 1, "a mis-set budget fails the run closed (exit 1) — the CALL is wired into main");
  assert.equal(r.end, null, "no run summary was printed (the throw precedes the summary)");
  assert.match(r.stderr, /MONARK_SENTINEL_BUDGET_S/, "the fatal names the offending key");
});

test("sentinel_budget_env_absent_defaults_180 — with no MONARK_SENTINEL_BUDGET_S the budget is the 180 s default (the production unit does not set the key) (C6; ADR-NARABI-OPS-1c)", () => {
  assert.equal(budgetMsFromEnv({}), BUDGET_DEFAULT_S * 1000, "absent => the default");
  assert.equal(budgetMsFromEnv({}), 180_000, "the default is 180000 ms");
  assert.equal(BUDGET_DEFAULT_S, 180);
});

function timeoutStartSecOf(serviceText: string): number {
  const m = /^TimeoutStartSec\s*=\s*(\d+)\s*$/m.exec(serviceText);
  assert.ok(m !== null, "the unit declares a numeric TimeoutStartSec (seconds)");
  return Number(m[1]);
}
// test-only override; a mutant points it at a 200 copy. run.ts never reads it. SKIP this test IFF the deploy/
// DIRECTORY is absent (the public export omits it, C3). A present deploy/ with the .service renamed/missing must
// FAIL, never skip silently — the invariant is pinned where deploy/ lives (source repo, private G7).
const DEPLOY_DIR = join(REPO, "deploy");
const SERVICE_FILE = process.env.NARABI_SENTINEL_SERVICE_FILE ?? SERVICE;
test("sentinel_budget_below_unit_timeout — BUDGET_MAX_S + MARGIN_MIN_S <= TimeoutStartSec read from deploy/monark-sentinel.service; a TimeoutStartSec=200 copy would red, a renamed .service (deploy/ present) reds (C2/C3; ADR-NARABI-OPS-1c)", { skip: existsSync(DEPLOY_DIR) ? false : "the deploy/ directory is omitted from the public export" }, () => {
  assert.ok(existsSync(SERVICE_FILE), `deploy/ is present but ${SERVICE_FILE} is missing (renamed?) — a regression, not an export skip`);
  const ts = timeoutStartSecOf(readFileSync(SERVICE_FILE, "utf8"));
  assert.ok(BUDGET_MAX_S + MARGIN_MIN_S <= ts, `budget ${String(BUDGET_MAX_S)} + margin ${String(MARGIN_MIN_S)} = ${String(BUDGET_MAX_S + MARGIN_MIN_S)} must fit under TimeoutStartSec ${String(ts)}`);
  assert.equal(BUDGET_MAX_S + MARGIN_MIN_S, 300, "the pinned sum is 300 s (a larger TimeoutStartSec stays green: the invariant is <=, not ==)");
});

interface FixLine { day: string; from_block: number; to_block: number; burns: string; mints: string; supply_close: string; s_open: string; line_hash: string; digest_T: string; T: number; }
function fixtureLines(): FixLine[] {
  return readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim()).map((l) => JSON.parse(l) as FixLine);
}
function fixDay(l: FixLine): DayPlan {
  return { day: l.day, from_block: l.from_block, to_block: l.to_block, burns: l.burns, mints: l.mints, supply_open: l.s_open, supply_close: l.supply_close };
}
function seedFromFixture(nLines: number): string {
  const dir = freshStateDir();
  const raw = readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim());
  writeFileSync(join(dir, "timeline.jsonl"), raw.slice(0, nLines).join("\n") + "\n");
  return dir;
}
test("sentinel_normal_day_unchanged — one due day (the incident morning) reproduces the published line_hash with exit 0, stopped null, and an end JSON that is exactly the prior superset plus elapsed_ms/max_day_ms (C6; ADR-NARABI-OPS-1c)", () => {
  const fl = fixtureLines();
  const l3 = fl[2]!;
  const plan: Plan = { days: [fixDay(fl[1]!), fixDay(l3)], fin_block: l3.to_block + 5, fin_ts: midnight("2026-09-20") + 3600, clock_base_ms: CLOCK_BASE_MS, clock_step_ms: STEP_MS };
  const dir = seedFromFixture(2); // state resumes from 2026-09-18
  const r = runMain(dir, writePlan("plan-normal.json", plan), {}); // no J0 (resume), no budget (default 180 s)
  assert.equal(r.status, 0, "a normal single-day catch-up exits 0");
  const end = r.end;
  assert.ok(end !== null, `end JSON present. stderr=${JSON.stringify(r.stderr)}`);
  assert.deepEqual(Object.keys(end).sort(), ["T", "chainstack", "chainstack_guard", "dryRun", "elapsed_ms", "exit_code", "finalized", "j0Source", "lag", "max_day_ms", "processedDays", "startDay", "stopped"], "the end JSON is the prior keys + chainstack_guard (NARABI-OPS-1d D-degrade; D-4 annotated addition)");
  assert.deepEqual(end.processedDays, ["2026-09-19"], "the missing day is picked up");
  assert.equal(end.lag, 0);
  assert.equal(end.stopped, null, "nothing stopped it");
  assert.equal(end.finalized, l3.to_block + 5);
  assert.equal(end.T, 2, "T advances to 2");
  assert.equal(end.chainstack, false);
  assert.equal(end.chainstack_guard, "unconfigured", "no Chainstack cycle keys in this run's env => the guarded leg is unconfigured (D-degrade), 7 keyless endpoints, served output unchanged");
  assert.equal(end.exit_code, 0);
  assert.equal(end.dryRun, false);
  assert.equal(end.startDay, "2026-09-19");
  assert.equal(end.j0Source, "state");
  const written = readLines(dir).pop()!;
  assert.equal(written.day, "2026-09-19");
  assert.equal(written.line_hash, l3.line_hash, "the written line_hash equals the published one (f73c7006...) — the write path is unchanged");
  assert.equal(lineHashOf(written), l3.line_hash, "and it recomputes from its own hashed fields");
  assert.ok(end.elapsed_ms >= 0 && end.max_day_ms >= 0, "elapsed_ms/max_day_ms are present numbers");
});

test("sentinel_dry_run_honours_budget_same_exit — --dry-run walks the same catch-up, stops on the budget with the SAME exit code as a plain run, and writes nothing (C6; ADR-NARABI-OPS-1c)", () => {
  const planPath = writePlan("plan-dry.json", synthPlan(20));
  const rp = runMain(freshStateDir(), planPath, { MONARK_SENTINEL_J0: DAY0, MONARK_SENTINEL_BUDGET_S: "180" });
  const dirDry = freshStateDir();
  const rd = runMain(dirDry, planPath, { MONARK_SENTINEL_J0: DAY0, MONARK_SENTINEL_BUDGET_S: "180" }, ["--dry-run"]);
  assert.equal(rd.status, rp.status, "--dry-run carries the same process exit as the plain run");
  assert.equal(rd.status, 1, "the budget stop exits 1 under --dry-run too");
  const end = rd.end;
  assert.ok(end !== null);
  assert.equal(end.stopped, "catchup_budget", "the budget stop is honoured under --dry-run");
  assert.equal(end.lag, 13);
  assert.equal(end.dryRun, true);
  assert.equal(existsSync(join(dirDry, "timeline.jsonl")), false, "--dry-run wrote no timeline");
  assert.equal(existsSync(join(dirDry, "state.json")), false, "--dry-run wrote no state.json");
});

test("sentinel_no_clock_env_is_read — run.ts reads only the six declared env keys (no clock env), and runDue references neither Date.now nor performance.now (C4; NARABI-OPS-1d adds the 3 non-secret Chainstack cycle keys)", () => {
  const src = readFileSync(RUN_TS, "utf8");
  const keys = new Set<string>();
  const re = /(?:process\.env|\benv)\.([A-Za-z_][A-Za-z0-9_]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) keys.add(m[1]!);
  // D-4 (annotated update): NARABI-OPS-1d added CHAINSTACK_CYCLE_ID/CHAINSTACK_ETH_ORIGIN/CHAINSTACK_CYCLE_FLOOR
  // (all NON-secret; decision 121 option 1). The SECRET endpoint URL (CHAINSTACK_ETH_URL) is read by
  // @monark/rpc-guard's transport, NEVER by run.ts (fetch_only_inside_client proves run.ts carries no key read).
  assert.deepEqual([...keys].sort(), ["CHAINSTACK_CYCLE_FLOOR", "CHAINSTACK_CYCLE_ID", "CHAINSTACK_ETH_ORIGIN", "MONARK_SENTINEL_BUDGET_S", "MONARK_SENTINEL_DIR", "MONARK_SENTINEL_J0"], "exactly the six declared env keys are read");
  for (const k of keys) assert.ok(!/CLOCK|TICK|WALL/i.test(k), `no clock env key (${k})`);
  const body = src.slice(src.indexOf("export async function runDue"), src.indexOf("function sentinelSha"));
  assert.ok(body.length > 0, "runDue is locatable in the source");
  assert.ok(!body.includes("Date.now"), "runDue does not call Date.now");
  assert.ok(!body.includes("performance.now"), "runDue does not call performance.now");
});
