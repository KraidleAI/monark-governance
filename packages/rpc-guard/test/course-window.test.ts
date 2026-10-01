// RECONCILE-WINDOW-1 (ADR-RPC-GUARD-RECONCILE-1 D-1 and D-5, lot 1a): the reconcile window of ONE course. Every course is
// PRODUCED by the real openGuardedClient + calls (only globalThis.fetch stubbed) and ENDED by the served `runCli unlock`, whose
// rendered sha is the --course-end value (cp-1 C-V-3): no boundary line is appended by hand. The assertions go through the SERVED
// path (runCli, the bin); runReconcile called directly stays outside the "no reconcile line inside a course" invariant (cp-1
// O-1). No network: a socket or a name resolution throws (traps armed at import).
import { test } from "node:test";
import assert from "node:assert/strict";
import dns from "node:dns";
import net from "node:net";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { BudgetExceededError, openGuardedClient, runCli, verifyCycleLedger, type RunLimits, type Snapshot } from "@monark/rpc-guard";
import { acquireLock, releaseLock, LockHeldError } from "../src/lock.ts";
import { LEDGER_GENESIS, type CycleLedgerEntry } from "../src/ledger.ts";
import { FAKE_HELIUS_ENV, HELIUS, childEnv, okFetch, realWriter, tmp } from "./harness.ts";

net.Socket.prototype.connect = function trap(): never { throw new Error("course-window: a socket was opened"); };
dns.lookup = ((): never => { throw new Error("course-window: a name was resolved"); }) as never;

const GTFA = "getTransactionsForAddress", GT = "getTransaction";
const LIMITS: RunLimits = { maxCalls: 20, runCaps: { helius: 10_000 }, methodCaps: { [GTFA]: 20, [GT]: 20 }, cycleFloor: { helius: 0 } };
const sha = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");
const entriesOf = (dir: string, cycle: string): CycleLedgerEntry[] => readFileSync(join(dir, cycle, "helius.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as CycleLedgerEntry);
/** Every file of the cycle dir with its sha: an argument refusal must leave this EXACTLY as it was. */
const files = (cd: string): string[] => readdirSync(cd).sort().map((f) => `${f}:${sha(readFileSync(join(cd, f)))}`);
const pm = (cycle: string, g: number, t: number): Snapshot => ({ cycle, byMethod: { [GTFA]: g, [GT]: t } });
/** RG-SNAPSHOT-NONNEG-INT-1 (Q-3): a snapshot value that is not a safe integer >= 0 answers this, with its line and no table. */
const INVALID = { exitCode: 1, verdict: "NO-GO", reason: "snapshot_invalid" };
/** The served reconcile of <dir>/<cycle>/helius.jsonl; `before` and `after` are what readSnapshot hands back. */
const rec = (dir: string, cycle: string, before: Snapshot, after: Snapshot, ...extra: string[]): ReturnType<typeof runCli> =>
  runCli(["reconcile", "--cycle", cycle, "--op", "helius", "--before", "b", "--after", "a", ...extra], { ledgerDir: dir, floor: 0, readSnapshot: (p) => (p === "b" ? before : after) });
/** ONE course: openGuardedClient -> g gTFA pages ({limit: 100}: 10 credits under the current tariff and under lot 1b) and t
 *  getTransaction (1 credit) -> the SERVED unlock. Returns the sha runCli unlock renders: the course id. `refuse` (post-G2, G-9): the
 *  gTFA cap is g and ONE more gTFA call is refused between the two loops - a `refused` line inside the course. */
async function course(dir: string, cycle: string, g: number, t: number, refuse = false): Promise<string> {
  const realFetch = globalThis.fetch;
  globalThis.fetch = okFetch;
  try {
    const c = openGuardedClient(FAKE_HELIUS_ENV, refuse ? { ...LIMITS, methodCaps: { [GTFA]: g, [GT]: 20 } } : LIMITS, dir, { helius: cycle });
    for (let i = 0; i < g; i++) await c.call(HELIUS, GTFA, ["addr", { limit: 100 }]);
    if (refuse) await assert.rejects(c.call(HELIUS, GTFA, ["addr", { limit: 100 }]), BudgetExceededError);
    for (let i = 0; i < t; i++) await c.call(HELIUS, GT, [String(i)]);
  } finally { globalThis.fetch = realFetch; }
  const r = runCli(["unlock", "--cycle", cycle, "--op", "helius", "--reason", "course end"], { ledgerDir: dir, floor: 0, readSnapshot: () => pm(cycle, 0, 0) });
  assert.equal(r.exitCode, 0); assert.ok(r.unlocked !== undefined);
  return r.unlocked;
}

// killer: packages/rpc-guard/src/reconcile.ts:166 CONST "Number.isSafeInteger(v)" -> "Number.isFinite(v)"
test("reconcile_course_window_isolates_one_course", async () => {
  // Three courses on ONE ledger: A (6 gTFA = 60 credits, never reconciled), B (2 gTFA + 3 getTransaction = 23), C (60). A and C
  // each exceed the soft band's 50 and carry gTFA: a window leaking over A (M-R1) or over C (M-R2) can never answer like B's.
  const { dir, cleanup } = tmp();
  try {
    const A = await course(dir, "c", 6, 0), B = await course(dir, "c", 2, 3), C = await course(dir, "c", 6, 0);
    const last = (): CycleLedgerEntry => entriesOf(dir, "c").at(-1)!;
    const row = (count: number, delta: number): { count: number; delta: number; verdict: string } => ({ count, delta, verdict: delta > count ? "NO-GO" : "GO" });
    const table = (g: number, verdict: string, t = 3): unknown => ({ methods: { [GTFA]: row(20, g), [GT]: row(3, t) }, total: { count: 23, delta: g + t, verdict } });
    // per-method: GO at snapshots equal to B's count, NO-GO hard at +1; the line names the course {from: A, to: B}.
    assert.deepEqual(rec(dir, "c", pm("c", 500, 9), pm("c", 520, 12), "--course-end", B), { exitCode: 0, verdict: "GO", perMethod: table(20, "GO") });
    assert.deepEqual([last().outcome, last().course, last().by_op_method, last().credits_derived, last().reason], ["course_reconciled", { from: A, to: B }, { "reconcile|GO": 1 }, 0, undefined]);
    assert.deepEqual(rec(dir, "c", pm("c", 500, 9), pm("c", 521, 12), "--course-end", B), { exitCode: 1, verdict: "NO-GO", reason: `hard:${GTFA}`, perMethod: table(21, "NO-GO") });
    assert.deepEqual([last().course, last().reason], [{ from: A, to: B }, `hard:${GTFA}`]);
    // aggregate mode: the same course; the hard bound on the total, the table carries the total only.
    const ru = (n: number): Snapshot => ({ cycle: "c", total_ru: n });
    assert.deepEqual(rec(dir, "c", ru(100), ru(123), "--mode", "aggregate", "--course-end", B), { exitCode: 0, verdict: "GO", perMethod: { methods: {}, total: { count: 23, delta: 23, verdict: "GO" } } });
    assert.deepEqual(rec(dir, "c", ru(100), ru(124), "--mode", "aggregate", "--course-end", B), { exitCode: 1, verdict: "NO-GO", reason: "hard:total", perMethod: { methods: {}, total: { count: 23, delta: 24, verdict: "NO-GO" } } });
    // every course is its own window, whatever was appended after it: A from the genesis, C from B.
    assert.equal(rec(dir, "c", pm("c", 0, 0), pm("c", 60, 0), "--course-end", A).verdict, "GO");
    assert.deepEqual(last().course, { from: LEDGER_GENESIS, to: A });
    assert.equal(rec(dir, "c", pm("c", 0, 0), pm("c", 60, 0), "--course-end", C).verdict, "GO");
    assert.deepEqual(last().course, { from: B, to: C });
    // the since-last-reconciled mode on the SAME ledger (probe 3): its window spans A + B + C => NO-GO soft for B's delta; its
    // result keeps the pre-D-1 shape (no table) and its line is a plain `reconciled` one.
    assert.deepEqual(rec(dir, "c", pm("c", 500, 9), pm("c", 520, 12)), { exitCode: 1, verdict: "NO-GO", reason: "soft" });
    assert.deepEqual([last().outcome, "course" in last()], ["reconciled", false]);
    // Post-G2 (C-G2-5, Q-G2-1): a course soft NO-GO's total carries the reconcile verdict (G-4); two methods over their bound name the
    // FIRST in Set order (G-5); an aggregate negative_delta keeps its table (G-6); a per-method delta below 0 is a NO-GO, after hard.
    assert.deepEqual(rec(dir, "c", pm("c", 0, 0), pm("c", 5, 0), "--course-end", A).perMethod?.total, { count: 60, delta: 5, verdict: "NO-GO" });
    assert.deepEqual(rec(dir, "c", pm("c", 500, 9), pm("c", 521, 13), "--course-end", B), { exitCode: 1, verdict: "NO-GO", reason: `hard:${GTFA}`, perMethod: table(21, "NO-GO", 4) });
    assert.deepEqual(rec(dir, "c", ru(124), ru(100), "--mode", "aggregate", "--course-end", B), { exitCode: 1, verdict: "NO-GO", reason: "negative_delta", perMethod: { methods: {}, total: { count: 23, delta: -24, verdict: "NO-GO" } } });
    assert.deepEqual(rec(dir, "c", pm("c", 520, 9), pm("c", 500, 12), "--course-end", B), { exitCode: 1, verdict: "NO-GO", reason: `negative_delta:${GTFA}`, perMethod: table(-20, "NO-GO") });
    assert.deepEqual([rec(dir, "c", pm("c", 500, 12), pm("c", 521, 9), "--course-end", B).reason, rec(dir, "c", pm("c", 520, 12), pm("c", 500, 9))], [`hard:${GTFA}`, { exitCode: 1, verdict: "NO-GO", reason: `negative_delta:${GTFA}` }]);
    // RG-PRECEDENCE-TEST-1: on course C (60 credits, no getTransaction) a getTransaction delta of -1 is negative_delta, decided BEFORE
    // the soft band (60 - (-1) = 61 > 50 would answer soft: the mutant V-3).
    assert.equal(rec(dir, "c", pm("c", 500, 10), pm("c", 500, 9), "--course-end", C).reason, `negative_delta:${GT}`);
    // C-G2-1 and RG-SNAPSHOT-NONNEG-INT-1 (Q-3): a snapshot value that is not a safe integer >= 0 (not a JSON number, negative,
    // fractional, above 2^53 - 1) is a NO-GO line in both modes and both windows, never coerced, no table.
    const values = ["1,234,567", "abc", null, "12", NaN, Infinity, -1, 1.5, 2 ** 53] as unknown as number[];
    for (const v of values) for (const extra of [["--course-end", B], []]) {
      const cases: [Snapshot, Snapshot, string[]][] = [[pm("c", 0, 0), pm("c", v, 3), []], [pm("c", v, 0), pm("c", 20, 3), []], [ru(0), ru(v), ["--mode", "aggregate"]], [ru(v), ru(23), ["--mode", "aggregate"]]];
      for (const [b, a, mode] of cases) assert.deepEqual(rec(dir, "c", b, a, ...mode, ...extra), INVALID, `${JSON.stringify([b, a])} ${extra.join(" ")}`);
    }
    assert.deepEqual([last().outcome, last().reason], ["reconciled", "snapshot_invalid"]);
    // the case measured at the cp-2 of lot 1a (probe A3): before -10, after -5 answered a course GO; it is a NO-GO now.
    assert.deepEqual(rec(dir, "c", pm("c", -10, 0), pm("c", -5, 3), "--course-end", B), INVALID);
    // G-9: a `refused` line INSIDE a course is no boundary: D = gTFA attempted, gTFA refused (its cap is 1), getTransaction attempted.
    const D = await course(dir, "c", 1, 1, true);
    assert.deepEqual([entriesOf(dir, "c").slice(-4).map((e) => e.outcome), rec(dir, "c", pm("c", 0, 0), pm("c", 10, 1), "--course-end", D).perMethod?.total], [["attempted", "refused", "attempted", "unlocked"], { count: 11, delta: 11, verdict: "GO" }]);
    verifyCycleLedger(entriesOf(dir, "c"));
  } finally { cleanup(); }
});

test("reconcile_course_end_must_be_an_unlocked_line", async () => {
  const { dir, cleanup } = tmp();
  try {
    const A = await course(dir, "c", 1, 1), otherCycle = await course(dir, "c2", 1, 1);
    const deps = { ledgerDir: dir, floor: 0, readSnapshot: (): Snapshot => pm("c", 0, 0) };
    const otherOp = runCli(["unlock", "--cycle", "c", "--op", "chainstack", "--reason", "another operator"], deps).unlocked ?? "";
    const cd = join(dir, "c"), attempted = entriesOf(dir, "c")[0]!.entry_sha256;
    const reconcileWith = (...extra: string[]): ReturnType<typeof runCli> => runCli(["reconcile", "--cycle", "c", "--op", "helius", "--before", "b", "--after", "a", ...extra], deps);
    const reconcileTo = (...end: string[]): ReturnType<typeof runCli> => reconcileWith("--course-end", ...end);
    // A LIVE course holds the lock: every refusal below is decided BEFORE any lock (never a LockHeldError) and writes nothing.
    acquireLock(cd, "helius");
    const before = files(cd);
    const refusals = [["f".repeat(64), "course_end_unknown"], [LEDGER_GENESIS, "course_end_unknown"], [otherCycle, "course_end_unknown"], [otherOp, "course_end_unknown"], [attempted, "course_end_not_unlocked"]] as const;
    for (const [end, reason] of refusals) {
      assert.deepEqual(reconcileTo(end), { exitCode: 1, verdict: "NO-GO", reason }, end);
      assert.deepEqual(files(cd), before, `${reason}: no line, no byte`);
    }
    for (const bad of [A.toUpperCase(), A.slice(1), `${A}0`, "", "--op"]) assert.throws(() => reconcileTo(bad), /--course-end must be a lowercase 64-hex sha256/, bad);
    assert.throws(() => reconcileTo(), /--course-end required/, "a flag without a value never falls back to the since-last-reconciled mode");
    // Post-G2 (C-G2-2): the closed set of spellings, checked FIRST (no directory, no lock, no byte), never echoing a token: another
    // spelling of the flag, a repeated flag or a flag of another subcommand is refused, never read as the since-last-reconciled mode.
    const unknown = (e: unknown): boolean => e instanceof Error && e.message.startsWith("rpc-guard: unknown option") && !e.message.includes(A);
    for (const bad of [["--course_end", A], ["--courseEnd", A], ["--Course-End", A], ["--course-en", A], ["--course-end", A, "--course-end", A], [`--course-end=${A}`, "--course-end", A], ["--floor", "5"], [A]]) assert.throws(() => reconcileWith(...bad), unknown, bad[0]);
    assert.throws(() => runCli(["reconcile", "--cycle", "unseen", "--op", "helius", "--Course-End", A], deps), unknown); assert.equal(existsSync(join(dir, "unseen")), false);
    assert.deepEqual(files(cd), before, "usage errors: no line, no byte");
    assert.throws(() => reconcileTo(A), LockHeldError, "a VALID course end still takes the lock for its append");
    assert.throws(() => reconcileWith(`--course-end=${A}`), LockHeldError, "C-G2-2: --course-end=<sha> is the same flag, it reaches the lock");
    releaseLock(cd, "helius");
    // a rollover in course mode is a verdict, not an argument refusal: checked first, its course_reconciled line is written.
    const r = runCli(["reconcile", "--cycle", "c", "--op", "helius", "--before", "b", "--after", "a", "--course-end", A], { ...deps, readSnapshot: (p) => pm(p === "b" ? "c0" : "c", 0, 0) });
    assert.deepEqual(r, { exitCode: 1, verdict: "NO-GO", reason: "rollover" });
    const l = entriesOf(dir, "c").at(-1)!;
    assert.deepEqual([l.outcome, l.course, l.reason], ["course_reconciled", { from: LEDGER_GENESIS, to: A }, "rollover"]);
    runCli(["unlock", "--cycle", "c", "--op", "helius", "--reason", `--course-end=${A}`], deps); // C-G2-2: the '=' split is reconcile's alone
    assert.equal(entriesOf(dir, "c").at(-1)!.reason, `--course-end=${A}`, "an unlock reason shaped like the flag is recorded verbatim");
  } finally { cleanup(); }
});

test("reconcile_course_line_is_not_a_legacy_boundary", async () => {
  // Twin ledger dirs X and Y: the SAME courses A then B (byte-identical lines); X ALSO carries the course reconcile of A. The
  // since-last-reconciled verdict and its line are identical: a `course_reconciled` line never bounds that mode (with M-R5, X
  // would window B alone and answer NO-GO hard).
  const { dir, cleanup } = tmp();
  try {
    const X = join(dir, "X"), Y = join(dir, "Y");
    mkdirSync(X); mkdirSync(Y);
    const ax = await course(X, "c", 3, 2), ay = await course(Y, "c", 3, 2);
    assert.equal(ax, ay, "twins: identical lines, identical shas");
    assert.equal(rec(X, "c", pm("c", 0, 0), pm("c", 30, 2), "--course-end", ax).verdict, "GO");
    const lastX = (): CycleLedgerEntry => entriesOf(X, "c").at(-1)!, cr = lastX().entry_sha256, bx = await course(X, "c", 1, 1); await course(Y, "c", 1, 1);
    // Post-G2 (G-1): X's second course starts after the course_reconciled line - a boundary of the course mode, never of the other.
    assert.deepEqual([rec(X, "c", pm("c", 0, 0), pm("c", 10, 1), "--course-end", bx).verdict, lastX().course], ["GO", { from: cr, to: bx }]);
    assert.deepEqual([rec(X, "c", pm("c", 0, 0), pm("c", 40, 3)), rec(Y, "c", pm("c", 0, 0), pm("c", 40, 3))], [{ exitCode: 0, verdict: "GO" }, { exitCode: 0, verdict: "GO" }]);
    const core = (e: CycleLedgerEntry): string => JSON.stringify({ ...e, prev_entry_sha256: "", entry_sha256: "" });
    assert.equal(core(entriesOf(X, "c").at(-1)!), core(entriesOf(Y, "c").at(-1)!), "the since-last-reconciled line is byte-identical but for its chain links");
    // G-2: a course after the since-last-reconciled line starts after THAT line.
    const r = lastX().entry_sha256, cx = await course(X, "c", 1, 0);
    assert.deepEqual([rec(X, "c", pm("c", 0, 0), pm("c", 10, 0), "--course-end", cx).verdict, lastX().course], ["GO", { from: r, to: cx }]);
    assert.deepEqual(entriesOf(X, "c").map((e) => e.outcome).filter((o) => o.endsWith("reconciled")), ["course_reconciled", "course_reconciled", "reconciled", "course_reconciled"]);
  } finally { cleanup(); }
});

test("reconcile_course_repair_bound_is_the_course", async () => {
  const { dir, cleanup } = tmp();
  try {
    const A = await course(dir, "c", 1, 0), B = await course(dir, "c", 1, 2);
    const es = entriesOf(dir, "c"), start = es.findIndex((e) => e.entry_sha256 === A) + 1, end = es.findIndex((e) => e.entry_sha256 === B);
    assert.deepEqual([start, end], [2, 5], "A = lines 0-1, B = lines 2-4, B's `to` = line 5");
    const journal = join(dir, "c", "helius.repair.jsonl");
    const verdictWith = (record: string, beforeCycle = "c"): string => {
      writeFileSync(journal, `${record}\n`);
      const r = rec(dir, "c", pm(beforeCycle, 0, 0), pm("c", 10, 2), "--course-end", B);
      return `${r.verdict ?? ""} ${r.reason ?? ""}`.trim();
    };
    const L = (n: number | string): string => JSON.stringify({ lines_after: n });
    // L below [start, end] (the truncation preceded the course), at both edges (`to` written after it: the course lost its tail),
    // above (it followed the course): M-R7 reds the first, M-R6 the last.
    assert.deepEqual([start - 1, start, end, end + 1].map((n) => verdictWith(L(n))), ["GO", "NO-GO repaired_in_window", "NO-GO repaired_in_window", "GO"]);
    assert.equal(verdictWith(L(String(end + 1))), "NO-GO repaired_in_window", "a non-numeric lines_after flags every window");
    assert.equal(verdictWith("{not json"), "NO-GO repaired_in_window", "an unreadable record too");
    assert.equal(verdictWith(L(end), "c0"), "NO-GO rollover", "the rollover is checked before the repair journal");
    // The real pipeline: a writer dies inside course D (NUL tail), the served repair-tail strips it, the served unlock writes `to`
    // AFTER the truncation (L == end): the course is flagged.
    assert.equal(realWriter(dir, "r", 2).status, 0);
    appendFileSync(join(dir, "r", "helius.jsonl"), Buffer.alloc(64));
    const deps = { ledgerDir: dir, floor: 0, readSnapshot: (p: string): Snapshot => ({ cycle: "r", byMethod: { [GT]: p === "b" ? 0 : 2 } }) };
    assert.equal(runCli(["repair-tail", "--cycle", "r", "--op", "helius", "--reason", "cut"], deps).verdict, "REPAIRED");
    const D = runCli(["unlock", "--cycle", "r", "--op", "helius", "--reason", "after repair-tail"], deps).unlocked ?? "";
    assert.deepEqual(runCli(["reconcile", "--cycle", "r", "--op", "helius", "--before", "b", "--after", "a", "--course-end", D], deps), { exitCode: 1, verdict: "NO-GO", reason: "repaired_in_window" });
  } finally { cleanup(); }
});

// killer: packages/rpc-guard/src/reconcile.ts:146 CONST "snapshot_invalid" -> "snapshot_not_finite"
test("cli_unlock_returns_the_unlocked_sha", async (t) => {
  const { dir, cleanup } = tmp();
  try {
    // runCli: the rendered sha = the head sidecar = the entry_sha256 of the appended `unlocked` line (never the head before it).
    const A = await course(dir, "c", 1, 1);
    const es = entriesOf(dir, "c");
    assert.deepEqual([es.length, es.at(-1)?.outcome, es.at(-1)?.entry_sha256, readFileSync(join(dir, "c", "helius.head"), "utf8")], [3, "unlocked", A, A]);
    const bin = fileURLToPath(new URL("../bin/rpc-guard.mjs", import.meta.url));
    if (!existsSync(bin)) { t.skip("bin/ is not in the public export (PACKAGE_SUBPATHS); the served bin runs in the repo"); return; }
    // The bin: a second course ends with the SERVED bin's unlock, which prints `unlocked <sha>` - the sha and nothing else (no key,
    // no URL: the Ukemi leak discipline); that printed sha, passed back as --course-end, reconciles THAT course.
    const run = (...a: string[]): [number | null, string] => { const r = spawnSync(process.execPath, [bin, "--ledger-dir", dir, ...a], { env: childEnv(), encoding: "utf8" }); return [r.status, r.stdout]; };
    const realFetch = globalThis.fetch;
    globalThis.fetch = okFetch;
    try { const c = openGuardedClient(FAKE_HELIUS_ENV, LIMITS, dir, { helius: "c" }); await c.call(HELIUS, GT, ["x"]); await c.call(HELIUS, GT, ["y"]); } finally { globalThis.fetch = realFetch; }
    const [status, out] = run("unlock", "--cycle", "c", "--op", "helius", "--reason", "course end (bin)");
    const B = readFileSync(join(dir, "c", "helius.head"), "utf8");
    assert.deepEqual([status, out], [0, `unlocked ${B}\n`]);
    assert.match(out, /^unlocked [0-9a-f]{64}\n$/, "a sha alone");
    const [bf, af] = [pm("c", 7, 0), pm("c", 7, 2)].map((s, i) => { const p = join(dir, `snap-${String(i)}.json`); writeFileSync(p, JSON.stringify(s)); return p; });
    const reconcileTo = (end: string): [number | null, string] => run("reconcile", "--cycle", "c", "--op", "helius", "--before", bf!, "--after", af!, "--course-end", end);
    const [rs, ro] = reconcileTo(B), lines = ro.split("\n");
    assert.deepEqual([rs, lines[0], JSON.parse(lines[1] ?? "") as unknown, lines.slice(2)], [0, "GO", { methods: { [GT]: { count: 2, delta: 2, verdict: "GO" }, [GTFA]: { count: 0, delta: 0, verdict: "GO" } }, total: { count: 2, delta: 2, verdict: "GO" } }, [""]]);
    assert.deepEqual(reconcileTo(LEDGER_GENESIS), [1, "NO-GO course_end_unknown\n"], "the genesis is no line: an argument refusal, no table");
    const inf = join(dir, "snap-inf.json"); writeFileSync(inf, `{"cycle":"c","byMethod":{"${GT}":1e999}}`); // JSON.parse reads 1e999 as Infinity
    const [is, io] = run("reconcile", "--cycle", "c", "--op", "helius", "--before", bf!, "--after", inf, "--course-end", B);
    assert.deepEqual([is, io.split(String.fromCharCode(10))], [1, ["NO-GO snapshot_invalid", ""]], "C-G2-1 through the bin: no table");
  } finally { cleanup(); }
});
