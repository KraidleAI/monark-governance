/**
 * TEST-COUNT-FLOOR-1, the gate (docs/G0-lot-test-count-floor-1b.md). test:main writes, per test file, the tests its process reported and
 * whether it sent a summary of its own; `node scripts/test-count-floor.mjs write` turns that run into the committed record
 * test/test-counts.json. scripts/test-count-check.mjs holds each run to the record (P2) and each drop from the base's record to exactly one
 * line added to test/test-count-removals.json (P4). T4 holds P2 and P4 on objects, T5 the command line and its base on a git fixture,
 * T6 the job g3-test-count of .github/workflows/ci.yml.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REMOVALS, dropProblems, recordProblems } from "../scripts/test-count-check.mjs";
import { RECORD, RUN, recordText, type Run } from "../scripts/test-count-floor.mjs";

const ROOT = join(import.meta.dirname, "..");
const wants = (f: string, from: number, to: number): string => `${f}: ${from} test(s) at the base, ${to} here: wants one line ${JSON.stringify({ file: f, from, to, reason: "..." })} in ${REMOVALS}`;
// killer: scripts/test-count-check.mjs:18 CONST "record[f] !== c.tests" -> "record[f] > c.tests"
test("test_count_check_holds_the_run_to_the_record_and_each_drop_to_its_line", () => {
  const run = (o: Record<string, number>): Run => Object.fromEntries(Object.entries(o).map(([f, n]) => [f, { tests: n, summary: true }]));
  assert.deepEqual(recordProblems(run({ a: 2, b: 3 }), { a: 2, b: 3 }), [], "the run equals the record");
  // killer: scripts/test-count-check.mjs:19 CONST ".filter((f) => run[f] === undefined)" -> ".filter(() => false)"
  // killer: scripts/test-count-check.mjs:18 CONST "f !== \"\" && " -> ""
  assert.deepEqual(recordProblems({ ...run({ a: 3, c: 1 }), "": { tests: 1, summary: false } }, { a: 2, b: 3 }), [`a: 3 test(s) run, 2 in ${RECORD}`, `c: 1 test(s) run, not in ${RECORD}`,
    `b: in ${RECORD} (3), not in the run`], "a rise, a file outside the record, a file outside the run; the tests run without a file are P1's");
  const base = { a: 3, b: 2, gone: 4 }, line = (file: string, from: number, to: number, reason = "removed on purpose"): Record<string, unknown> => ({ file, from, to, reason });
  // killer: scripts/test-count-check.mjs:34 ROR "to < from" -> "to <= from"
  assert.deepEqual(dropProblems(base, { a: 3, b: 5, gone: 4, new: 1 }, [], []), [], "no drop: equal or higher counts, a new file");
  assert.deepEqual(dropProblems(base, { a: 2, b: 2 }, [], []), [wants("a", 3, 2), wants("gone", 4, 0)], "a drop, and a file gone (0): each wants its line");
  assert.deepEqual(dropProblems(base, { a: 2, b: 2 }, [], [line("a", 3, 2), line("gone", 4, 0)]), [], "each drop with its line");
  // killer: scripts/test-count-check.mjs:34 CONST " && mine[0].to === to" -> ""
  // killer: scripts/test-count-check.mjs:34 CONST "mine[0].from === from && " -> ""
  assert.deepEqual(dropProblems(base, { a: 2, b: 1, gone: 4 }, [], [line("a", 3, 1), line("b", 9, 1)]), [wants("a", 3, 2), wants("b", 2, 1)], "a line at other numbers");
  // killer: scripts/test-count-check.mjs:34 CONST "mine.length === 1 && " -> ""
  assert.deepEqual(dropProblems(base, { a: 2, b: 2, gone: 4 }, [], [line("a", 3, 2), line("a", 3, 2, "twice")]), [wants("a", 3, 2)], "two lines for one drop");
  // killer: scripts/test-count-check.mjs:29 CONST "if (i >= 0) left.splice(i, 1); else " -> ""
  assert.deepEqual(dropProblems({ a: 3 }, { a: 2 }, [line("a", 5, 3)], [line("a", 5, 3)]), [wants("a", 3, 2)], "a line of the base declares no new drop");
  // killer: scripts/test-count-check.mjs:36 CONST "!((baseRecord[r.file] ?? 0) > (record[r.file] ?? 0))" -> "false"
  assert.deepEqual(dropProblems(base, { a: 3, b: 4, gone: 4 }, [], [line("b", 2, 1)]), [`${REMOVALS}: ${JSON.stringify(line("b", 2, 1))} names no drop since the base`], "a line for a file that grew");
  // killer: scripts/test-count-check.mjs:30 CONST "if (left.length > 0)" -> "if (false)"
  assert.deepEqual(dropProblems(base, base, [line("x", 2, 1)], []), [`${REMOVALS}: 1 line(s) of the base changed or removed; the list only grows`], "a line of the base removed");
  // killer: scripts/test-count-check.mjs:23 CONST " && r.reason.trim() !== \"\"" -> ""
  // killer: scripts/test-count-check.mjs:23 CONST " && r.to < r.from" -> ""
  // killer: scripts/test-count-check.mjs:23 CONST " && r.to >= 0" -> ""
  const bad = [line("a", 3, 2, " "), line("a", 2, 3), line("a", 3, -1), { file: "a", from: 3, to: 2 }];
  assert.deepEqual(dropProblems(base, base, [], bad), bad.map((r) => `${REMOVALS}: ${JSON.stringify(r)} is not a line {file, from, to, reason} with from > to >= 0 and a reason`), "an empty reason, to above from, to below 0, no reason");
});

// killer: scripts/test-count-check.mjs:45 CONST ": process.env.ORACLE_BASE)" -> ": undefined)"
test("test_count_check_names_its_base_or_refuses", () => {
  const dir = mkdtempSync(join(tmpdir(), "tcc-")), check = join(ROOT, "scripts", "test-count-check.mjs");
  const git = (...a: string[]): string => execFileSync("git", ["-c", "core.autocrlf=false", "-c", "user.name=fx", "-c", "user.email=fx@localhost", ...a], { cwd: dir, encoding: "utf8" }).trim();
  const gate = (args: string[], vars: Record<string, string> = {}): [number | null, string] => { // each child: no base of the parent's, then the one variable of its case
    const r = spawnSync(process.execPath, [check, ...args], { cwd: dir, encoding: "utf8", env: { ...process.env, GITHUB_BASE_REF: undefined, ORACLE_BASE: undefined, ...vars } });
    return [r.status, r.stderr.trim()];
  };
  const counts = (o: Record<string, number>, extra = {}): string => JSON.stringify({ ...Object.fromEntries(Object.entries(o).map(([f, n]) => [f, { tests: n, summary: true }])), ...extra });
  try {
    git("init", "-q", "-b", "main");
    git("commit", "-q", "--allow-empty", "-m", "a base without a record");
    const none = git("rev-parse", "HEAD"), head = { "a.test.ts": 2, "b.test.ts": 2 };
    mkdirSync(join(dir, "test"));
    writeFileSync(join(dir, RECORD), recordText({ "a.test.ts": 2, "b.test.ts": 3 }));
    git("add", RECORD);
    git("commit", "-q", "-m", "a base with a record and no removal list");
    git("update-ref", "refs/remotes/origin/trunk", "HEAD");
    const rec = git("rev-parse", "HEAD");
    writeFileSync(join(dir, RUN), counts(head));
    writeFileSync(join(dir, RECORD), recordText(head));
    writeFileSync(join(dir, REMOVALS), "[]\n");
    // killer: scripts/test-count-check.mjs:46 CONST "if (!named) stop(3," -> "if (false) stop(3,"
    const [code, err] = gate([]);
    assert.deepEqual([code, err.startsWith("::error::no base:")], [3, true], err);
    assert.deepEqual(gate([], { ORACLE_BASE: rec }), [1, `::error::${wants("b.test.ts", 3, 2)}`], "the drop since the record of ORACLE_BASE");
    // killer: scripts/test-count-check.mjs:44 CONST "stop(2, \"usage" -> "stop(0, \"usage"
    assert.equal(gate(["--base"])[0], 2, "--base without a value: the usage");
    // killer: scripts/test-count-check.mjs:51 CONST "=== \"\" ? none :" -> "=== \"x\" ? none :"
    assert.deepEqual(gate(["--base", none]), [0, ""], "a base without a record counts as {}: no drop");
    writeFileSync(join(dir, REMOVALS), `[\n ${JSON.stringify({ file: "b.test.ts", from: 3, to: 2, reason: "fx" })}\n]\n`);
    // killer: scripts/test-count-check.mjs:45 CONST "process.env.GITHUB_BASE_REF ? " -> "false ? "
    assert.equal(gate([], { GITHUB_BASE_REF: "trunk", ORACLE_BASE: none })[0], 0, "GITHUB_BASE_REF before ORACLE_BASE: the drop has its line");
    // killer: scripts/test-count-check.mjs:45 CONST "argv[1] ?? " -> ""
    assert.equal(gate(["--base", none], { GITHUB_BASE_REF: "trunk" })[0], 1, "--base before GITHUB_BASE_REF: against a base without a record, the line names no drop");
    // killer: scripts/test-count-check.mjs:55 CONST "text === recordText(record)" -> "true"
    writeFileSync(join(dir, RECORD), JSON.stringify(head));
    assert.deepEqual(gate([], { ORACLE_BASE: rec }), [1, `::error::${RECORD}: not in its written form (npm run test:main && node scripts/test-count-floor.mjs write)`], "a record outside its written form");
    // killer: scripts/test-count-check.mjs:56 CONST "...runProblems(run), " -> ""
    writeFileSync(join(dir, RECORD), recordText(head));
    writeFileSync(join(dir, RUN), counts(head, { "": { tests: 1, summary: false } }));
    assert.deepEqual(gate([], { ORACLE_BASE: rec }), [1, "::error::1 test(s) reported without a file"], "P1 in the gate");
    // killer: scripts/test-count-check.mjs:48 CONST "return stop(4," -> "return stop(0,"
    rmSync(join(dir, RUN));
    assert.equal(gate([], { ORACLE_BASE: rec })[0], 4, "without a run file: exit 4");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// killer: .github/workflows/ci.yml:328 CONST "node scripts/test-count-check.mjs" -> "node scripts/test-count-floor.mjs write"
test("test_count_job_runs_test_main_then_the_check", () => {
  const ci = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8").split(/\r?\n/), at = ci.indexOf("  g3-test-count:"), end = ci.findIndex((l, i) => i > at && /^ {0,2}\S/.test(l));
  const job = at < 0 ? [] : ci.slice(at + 1, end < 0 ? ci.length : end).map((l) => l.replace(/\s*#.*$/, ""));
  assert.deepEqual(job.flatMap((l) => /^\s+run: (.+)$/.exec(l)?.[1] ?? []), ["npm ci", "npm run test:main", "node scripts/test-count-check.mjs"], "the job installs, runs the main suite, then the gate");
  // killer: .github/workflows/ci.yml:318 CONST "fetch-depth: 0" -> "fetch-depth: 1"
  assert.ok(job.some((l) => /^\s+fetch-depth: 0$/.test(l)), "the whole history: the base's record and list are read at the merge base");
  const minutes = Number(/^ {4}timeout-minutes: (\d+)$/.exec(job.find((l) => l.startsWith("    timeout-minutes:")) ?? "")?.[1] ?? 0);
  assert.ok(minutes > 0 && minutes <= 20, `a bound above 0 and at most 20 minutes (${minutes})`);
  assert.deepEqual(job.filter((l) => /^\s*(?:-\s+)?(?:if|continue-on-error)\s*:/.test(l)), [], "no condition: the job blocks");
});
