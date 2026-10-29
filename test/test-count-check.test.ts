/**
 * TEST-COUNT-FLOOR-1, the gate (docs/G0-lot-test-count-floor-1b.md). test:main writes, per test file, the tests its process reported and
 * whether it sent a summary of its own; `node scripts/test-count-floor.mjs write` turns that run into the committed record
 * test/test-counts.json. scripts/test-count-check.mjs holds each run to the record (P2) and each drop from the base's record to exactly one
 * line added to test/test-count-removals.json (P4). TEST-COUNT-NAMES-1 (docs/G0-lot-test-count-names-1.md): the run and the record
 * test/test-names.json also hold each test's name, and once the base carries that record, each name gone from a file takes its line,
 * whose reason reads "#<pull request>: " then three words or more. T4 holds P2 and P4 on objects and the reason, T5 the command line and
 * its base on a git fixture, T6 the job g3-test-count of .github/workflows/ci.yml, T7 P2 and P4 by names on objects.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REMOVALS, dropProblems, recordProblems } from "../scripts/test-count-check.mjs";
import { RECORD, RUN, recordText, type Run } from "../scripts/test-count-floor.mjs";

const ROOT = join(import.meta.dirname, ".."), NAMES = "test/test-names.json";
const wants = (f: string, from: number, to: number): string => `${f}: ${from} test(s) at the base, ${to} here: wants one line ${JSON.stringify({ file: f, from, to, reason: "..." })} in ${REMOVALS}`;
const notLine = (r: unknown, byNames = false, pr?: string): string => `${REMOVALS}: ${JSON.stringify(r)} is not a line {file, from, to, reason} with from > to >= 0${byNames ? " (to 0: a file gone), {file, removed, reason} or {file, renamed, to, reason}" : ""}, and a reason "#<pull request>: <why, in three words or more>"${pr === undefined ? "" : ` naming #${pr}`}`;
// killer: scripts/test-count-check.mjs:18 CONST "record[f] !== c.tests" -> "record[f] > c.tests"
test("test_count_check_holds_the_run_to_the_record_and_each_drop_to_its_line", () => {
  const run = (o: Record<string, number>): Run => Object.fromEntries(Object.entries(o).map(([f, n]) => [f, { tests: n, summary: true, names: Array.from({ length: n }, (_, i) => `t${i}`) }]));
  const base = { a: 3, b: 2, gone: 4 }, line = (file: string, from: number, to: number, reason = "#12: removed on purpose"): Record<string, unknown> => ({ file, from, to, reason });
  // First of the drops: without "mine.length === 1", a drop with no line reads mine[0] and throws; here it fails by its assertion.
  // killer: scripts/test-count-check.mjs:34 CONST "mine.length === 1 && " -> ""
  assert.deepEqual(dropProblems(base, { a: 2, b: 2, gone: 4 }, [], [line("a", 3, 2), line("a", 3, 2, "#12: the same drop twice")]), [wants("a", 3, 2)], "two lines for one drop");
  // killer: scripts/test-count-check.mjs:70 CONST ".trim().split(/\\s+/).length >= 3" -> ".trim().split(/\\s+/).length >= 1"
  const reasons = ["removed on purpose", "#<pull request>: ...", "#12: removed", "#12:removed on purpose", "#0: removed on purpose", " "];
  assert.deepEqual(dropProblems(base, { a: 2, b: 2, gone: 4 }, [], reasons.map((r) => line("a", 3, 2, r))), [...reasons.map((r) => notLine(line("a", 3, 2, r))), wants("a", 3, 2)],
    "a reason reads #<pull request>: then why, in three words or more: refused without a number, the hint's placeholder, one word, no blank after the colon, #0, a blank");
  // killer: scripts/test-count-check.mjs:70 CONST "pr ?? \"[1-9]\\\\d*\"" -> "\"[1-9]\\\\d*\""
  assert.deepEqual([dropProblems(base, { a: 2, b: 2, gone: 4 }, [], [line("a", 3, 2, "#13: removed on purpose")], { pr: "12" }), dropProblems(base, { a: 2, b: 2, gone: 4 }, [], [line("a", 3, 2)], { pr: "12" })],
    [[notLine(line("a", 3, 2, "#13: removed on purpose"), false, "12"), wants("a", 3, 2)], []], "in CI (pull request 12) the reason names this pull request: #13 refused, #12 kept");
  assert.deepEqual(recordProblems(run({ a: 2, b: 3 }), { a: 2, b: 3 }), [], "the run equals the record");
  // killer: scripts/test-count-check.mjs:19 CONST ".filter((f) => run[f] === undefined)" -> ".filter(() => false)"
  // killer: scripts/test-count-check.mjs:18 CONST "f !== \"\" && " -> ""
  assert.deepEqual(recordProblems({ ...run({ a: 3, c: 1 }), "": { tests: 1, summary: false, names: ["loose"] } }, { a: 2, b: 3 }), [`a: 3 test(s) run, 2 in ${RECORD}`, `c: 1 test(s) run, not in ${RECORD}`,
    `b: in ${RECORD} (3), not in the run`], "a rise, a file outside the record, a file outside the run; the tests run without a file are P1's");
  // killer: scripts/test-count-check.mjs:34 ROR "to < from" -> "to <= from"
  assert.deepEqual(dropProblems(base, { a: 3, b: 5, gone: 4, new: 1 }, [], []), [], "no drop: equal or higher counts, a new file");
  assert.deepEqual(dropProblems(base, { a: 2, b: 2 }, [], []), [wants("a", 3, 2), wants("gone", 4, 0)], "a drop, and a file gone (0): each wants its line");
  assert.deepEqual(dropProblems(base, { a: 2, b: 2 }, [], [line("a", 3, 2), line("gone", 4, 0)]), [], "each drop with its line");
  // killer: scripts/test-count-check.mjs:34 CONST " && mine[0].to === to" -> ""
  // killer: scripts/test-count-check.mjs:34 CONST "mine[0].from === from && " -> ""
  assert.deepEqual(dropProblems(base, { a: 2, b: 1, gone: 4 }, [], [line("a", 3, 1), line("b", 9, 1)]), [wants("a", 3, 2), wants("b", 2, 1)], "a line at other numbers");
  // killer: scripts/test-count-check.mjs:29 CONST "if (i >= 0) left.splice(i, 1); else " -> ""
  assert.deepEqual(dropProblems({ a: 3 }, { a: 2 }, [line("a", 5, 3)], [line("a", 5, 3)]), [wants("a", 3, 2)], "a line of the base declares no new drop");
  // killer: scripts/test-count-check.mjs:36 CONST "!((baseRecord[r.file] ?? 0) > (record[r.file] ?? 0))" -> "false"
  assert.deepEqual(dropProblems(base, { a: 3, b: 4, gone: 4 }, [], [line("b", 2, 1)]), [`${REMOVALS}: ${JSON.stringify(line("b", 2, 1))} names no drop since the base`], "a line for a file that grew");
  // killer: scripts/test-count-check.mjs:30 CONST "if (left.length > 0)" -> "if (false)"
  assert.deepEqual(dropProblems(base, base, [line("x", 2, 1)], []), [`${REMOVALS}: 1 line(s) of the base changed or removed; the list only grows`], "a line of the base removed");
  // killer: scripts/test-count-check.mjs:23 CONST " && r.to < r.from" -> ""
  // killer: scripts/test-count-check.mjs:23 CONST " && r.to >= 0" -> ""
  // killer: scripts/test-count-check.mjs:22 CONST "Object.keys(r).sort().join() === \"file,from,reason,to\" && " -> ""
  const bad = [line("a", 3, 2, " "), line("a", 2, 3), line("a", 3, -1), { file: "a", from: 3, to: 2 }, { ...line("a", 3, 2), pr: 1 }];
  assert.deepEqual(dropProblems(base, base, [], bad), bad.map((r) => notLine(r)), "an empty reason, to above from, to below 0, no reason, a fifth key");
});

// killer: scripts/test-count-check.mjs:45 CONST ": process.env.ORACLE_BASE)" -> ": undefined)"
test("test_count_check_names_its_base_or_refuses", () => {
  const dir = mkdtempSync(join(tmpdir(), "tcc-")), check = join(ROOT, "scripts", "test-count-check.mjs");
  const git = (...a: string[]): string => execFileSync("git", ["-c", "core.autocrlf=false", "-c", "user.name=fx", "-c", "user.email=fx@localhost", ...a], { cwd: dir, encoding: "utf8" }).trim();
  const gate = (args: string[], vars: Record<string, string> = {}): [number | null, string] => { // each child: no base and no pull request of the parent's, then the variables of its case
    const r = spawnSync(process.execPath, [check, ...args], { cwd: dir, encoding: "utf8", env: { ...process.env, GITHUB_BASE_REF: undefined, ORACLE_BASE: undefined, GITHUB_REF: undefined, ...vars } });
    return [r.status, r.stderr.trim()];
  };
  const counts = (o: Record<string, string[]>, extra = {}): string => JSON.stringify({ ...Object.fromEntries(Object.entries(o).map(([f, n]) => [f, { tests: n.length, summary: true, names: n }])), ...extra });
  const tally = (o: Record<string, string[]>): Record<string, number> => Object.fromEntries(Object.entries(o).map(([f, n]) => [f, n.length]));
  const named = (o: Record<string, string[]>): string => `${JSON.stringify(Object.fromEntries(Object.keys(o).sort().map((f) => [f, [...(o[f] ?? [])].sort()])), null, 1)}\n`; // the written form of NAMES
  try {
    git("init", "-q", "-b", "main");
    git("commit", "-q", "--allow-empty", "-m", "a base without a record");
    const none = git("rev-parse", "HEAD"), head = { "a.test.ts": ["one", "two"], "b.test.ts": ["one", "two"] };
    mkdirSync(join(dir, "test"));
    writeFileSync(join(dir, RECORD), recordText({ "a.test.ts": 2, "b.test.ts": 3 }));
    git("add", RECORD);
    git("commit", "-q", "-m", "a base with a record and no removal list");
    git("update-ref", "refs/remotes/origin/trunk", "HEAD");
    const rec = git("rev-parse", "HEAD");
    writeFileSync(join(dir, RUN), counts(head));
    writeFileSync(join(dir, RECORD), recordText(tally(head)));
    writeFileSync(join(dir, REMOVALS), "[]\n");
    git("add", RECORD, REMOVALS); git("commit", "-q", "-m", "the change, above the base as the CI's merge commit");
    const [lacks, why] = gate([], { ORACLE_BASE: rec });
    assert.deepEqual([lacks, why.split(": ")[0]], [4, `::error::${NAMES} not readable`], `the head without ${NAMES}: exit 4 (${why})`);
    writeFileSync(join(dir, NAMES), named(head));
    // killer: scripts/test-count-check.mjs:46 CONST "if (!named) stop(3," -> "if (false) stop(3,"
    const [code, err] = gate([]);
    assert.deepEqual([code, err.startsWith("::error::no base:")], [3, true], err);
    // killer: scripts/test-count-check.mjs:51 CONST "`${base}:${path}`" -> "`HEAD:${path}`"
    assert.deepEqual(gate([], { ORACLE_BASE: rec }), [1, `::error::${wants("b.test.ts", 3, 2)}`], "the drop since the record of ORACLE_BASE, a base without names: judged by counts");
    // killer: scripts/test-count-check.mjs:44 CONST "stop(2, \"usage" -> "stop(0, \"usage"
    assert.equal(gate(["--base"])[0], 2, "--base without a value: the usage");
    // killer: scripts/test-count-check.mjs:51 CONST "=== \"\" ? none :" -> "=== \"x\" ? none :"
    assert.deepEqual(gate(["--base", none]), [0, ""], "a base without a record counts as {}: no drop");
    const dropped = { file: "b.test.ts", from: 3, to: 2, reason: "#7: the third test went away" };
    writeFileSync(join(dir, REMOVALS), `[\n ${JSON.stringify(dropped)}\n]\n`);
    // killer: scripts/test-count-check.mjs:45 CONST "process.env.GITHUB_BASE_REF ? " -> "false ? "
    assert.equal(gate([], { GITHUB_BASE_REF: "trunk", ORACLE_BASE: none })[0], 0, "GITHUB_BASE_REF before ORACLE_BASE: the drop has its line");
    // killer: scripts/test-count-check.mjs:45 CONST "argv[1] ?? " -> ""
    assert.equal(gate(["--base", none], { GITHUB_BASE_REF: "trunk" })[0], 1, "--base before GITHUB_BASE_REF: against a base without a record, the line names no drop");
    // killer: scripts/test-count-check.mjs:52 CONST "baseList = atBase(REMOVALS, [], Array.isArray, \"a list [ ... ]\")" -> "baseList = []"
    git("add", REMOVALS, NAMES); git("commit", "-q", "-m", "the line and the names committed: a base that carries both records and the list");
    assert.deepEqual(gate(["--base", "HEAD"]), [0, ""], "a base with both records and the list (iii): its line stays, once, and names no new drop");
    const both = git("rev-parse", "HEAD"), renamed = { ...head, "a.test.ts": ["one", "two, renamed"] };
    writeFileSync(join(dir, RUN), counts(renamed));
    writeFileSync(join(dir, NAMES), named(renamed));
    const hint = (pr: string): string => `::error::a.test.ts: the test "two" is gone since the base: wants one line ${JSON.stringify({ file: "a.test.ts", renamed: "two", to: "two, renamed", reason: `#${pr}: ...` })} in ${REMOVALS}; tests a.test.ts gained: ["two, renamed"]`;
    // killer: scripts/test-count-check.mjs:53 CONST "baseNames = atBase(" -> "baseNames = null && atBase("
    assert.deepEqual(gate(["--base", both]), [1, hint("<pull request>")], "a test renamed above a base with names: exit 1 and the exact line to add");
    // killer: scripts/test-count-check.mjs:50 CONST "process.env.GITHUB_REF ?? \"\"" -> "\"\""
    assert.deepEqual(gate(["--base", both], { GITHUB_REF: "refs/pull/7/merge" }), [1, hint("7")], "in CI the hint names the pull request");
    writeFileSync(join(dir, REMOVALS), `[\n ${JSON.stringify(dropped)},\n ${JSON.stringify({ file: "a.test.ts", renamed: "two", to: "two, renamed", reason: "#7: the title says more" })}\n]\n`);
    assert.deepEqual([gate(["--base", both], { GITHUB_REF: "refs/pull/7/merge" }), gate(["--base", both], { GITHUB_REF: "refs/pull/8/merge" })[0]], [[0, ""], 1], "with its line, 0; in another pull request, the line is refused");
    // killer: scripts/test-count-check.mjs:56 CONST "ntext === namesText(names)" -> "true"
    writeFileSync(join(dir, NAMES), JSON.stringify(renamed));
    assert.deepEqual(gate(["--base", both]), [1, `::error::${NAMES}: not in its written form (npm run test:main && node scripts/test-count-floor.mjs write)`], "the names record outside its written form");
    writeFileSync(join(dir, NAMES), named(renamed));
    // killer: scripts/test-count-check.mjs:56 CONST "...recordProblems(run, record, names), " -> ""
    writeFileSync(join(dir, RUN), counts({ ...renamed, "b.test.ts": ["one"] }));
    assert.deepEqual(gate(["--base", both]), [1, `::error::b.test.ts: 1 test(s) run, 2 in ${RECORD}\n::error::b.test.ts: run and ${NAMES} differ: run only [], recorded only ["two"]`], "P2 in the gate, by count and by names");
    writeFileSync(join(dir, RUN), counts(renamed));
    // killer: scripts/test-count-check.mjs:55 CONST "text === recordText(record)" -> "true"
    writeFileSync(join(dir, RECORD), JSON.stringify(tally(renamed)));
    assert.deepEqual(gate(["--base", both]), [1, `::error::${RECORD}: not in its written form (npm run test:main && node scripts/test-count-floor.mjs write)`], "a record outside its written form");
    // killer: scripts/test-count-check.mjs:56 CONST "...runProblems(run), " -> ""
    writeFileSync(join(dir, RECORD), recordText(tally(renamed)));
    writeFileSync(join(dir, RUN), counts(renamed, { "": { tests: 1, summary: false, names: ["loose"] } }));
    assert.deepEqual(gate(["--base", both]), [1, "::error::1 test(s) reported without a file"], "P1 in the gate");
    const imported = renamed["b.test.ts"] ?? [];
    writeFileSync(join(dir, RUN), counts(renamed, { "b.test.ts": { tests: imported.length, summary: true, names: imported, foreign: imported.length } }));
    assert.deepEqual(gate(["--base", both]), [1, `::error::b.test.ts: ${imported.length} of its test(s) also ran in another process: a test file imports it (move what they share to a module that declares no test), or it runs twice`],
      "P1 in the gate: a file whose tests another test file's process ran too, its record unchanged");
    const first = imported.map(() => imported[0] ?? ""); // b imports itself with a query string: its first test twice, in its own process
    writeFileSync(join(dir, RUN), counts(renamed, { "b.test.ts": { tests: first.length, summary: true, names: first } }));
    assert.deepEqual(gate(["--base", both]), [1, `::error::b.test.ts: ${first.length - 1} of its test(s) repeat a full name of the file: two of its tests share a name (name each apart), or the file runs twice in its own process (it imports itself, e.g. with a query string)\n::error::b.test.ts: run and ${NAMES} differ: run only ${JSON.stringify(first.slice(1))}, recorded only ${JSON.stringify(imported.slice(1))}`],
      "P1 in the gate: a file that names a test twice, nothing foreign, its count unchanged; P2 names the names that differ");
    writeFileSync(join(dir, RUN), counts(renamed));
    // killer: scripts/test-count-check.mjs:54 CONST "shaped(JSON.parse(ntext), lists," -> "shaped(JSON.parse(ntext), () => true,"
    writeFileSync(join(dir, NAMES), `{\n "a.test.ts": null,\n "b.test.ts": ${JSON.stringify(head["b.test.ts"])}\n}\n`);
    assert.deepEqual(gate(["--base", both]), [4, `::error::${NAMES} not readable: not a names record { "<file>": [names] }`], "the head's names record with a null entry: exit 4");
    writeFileSync(join(dir, NAMES), named(renamed));
    const listed = JSON.parse(readFileSync(join(dir, REMOVALS), "utf8")) as unknown[], proto = { file: "constructor", removed: "two", reason: "#7: no such test file" };
    writeFileSync(join(dir, REMOVALS), `${JSON.stringify([...listed, proto], null, 1)}\n`);
    assert.deepEqual(gate(["--base", both]), [1, `::error::${REMOVALS}: ${JSON.stringify(proto)} names no test gone from constructor since the base`], "a line for the file constructor: the records are read by their own keys");
    writeFileSync(join(dir, REMOVALS), `${JSON.stringify(listed, null, 1)}\n`);
    // killer: scripts/test-count-floor.mjs:16 CONST "Object.assign(Object.create(null), run)" -> "run"
    const inherited = ["__proto__", "constructor", "toString"];
    writeFileSync(join(dir, RECORD), recordText(Object.fromEntries([...Object.entries(tally(renamed)), ...inherited.map((k): [string, number] => [k, 3])])));
    assert.deepEqual(gate(["--base", both]), [1, inherited.map((k) => `::error::${k}: in ${RECORD} (3), not in the run`).join("\n")], "a record holding keys the run lacks, named as inherited keys: the run is read by its own keys too (P2)");
    writeFileSync(join(dir, RECORD), recordText(tally(renamed)));
    const baseWith = (names: string, record: Record<string, number>): string => { // a base above the fixture, its list the change's; the change's files written again
      writeFileSync(join(dir, NAMES), names); writeFileSync(join(dir, RECORD), recordText(record));
      git("add", NAMES, RECORD, REMOVALS); git("commit", "-q", "-m", "a base whose names record is malformed or disagrees with its record");
      writeFileSync(join(dir, NAMES), named(renamed)); writeFileSync(join(dir, RECORD), recordText(tally(renamed)));
      return git("rev-parse", "HEAD");
    };
    // killer: scripts/test-count-check.mjs:53 CONST "atBase(NAMES, null, lists," -> "atBase(NAMES, null, () => true,"
    const nulled = baseWith(`{\n "a.test.ts": null,\n "b.test.ts": ${JSON.stringify(head["b.test.ts"])}\n}\n`, tally(renamed));
    assert.deepEqual(gate(["--base", nulled]), [4, `::error::${NAMES} at the base ${nulled} not readable: not a names record { "<file>": [names] }`], "the base's names record with a null entry: exit 4");
    // killer: scripts/test-count-check.mjs:53 CONST "if (baseNames !== null) read(" -> "if (false) read("
    const lacksB = baseWith(named({ "a.test.ts": renamed["a.test.ts"] }), tally(renamed)), onlyA = { "a.test.ts": renamed["a.test.ts"] };
    writeFileSync(join(dir, RUN), counts(onlyA)); writeFileSync(join(dir, RECORD), recordText(tally(onlyA))); writeFileSync(join(dir, NAMES), named(onlyA));
    assert.deepEqual(gate(["--base", lacksB]), [4, `::error::${NAMES} at the base ${lacksB} not readable: it disagrees with ${RECORD} there: b.test.ts: in ${RECORD} (2), not in ${NAMES}`],
      "a base whose names record lacks a file of its record (b.test.ts removed, no line): exit 4, not judged by the names alone");
    const lacksName = baseWith(named({ ...renamed, "a.test.ts": ["one"] }), tally(renamed)), lessA = { ...renamed, "a.test.ts": ["one"] };
    writeFileSync(join(dir, RUN), counts(lessA)); writeFileSync(join(dir, RECORD), recordText(tally(lessA))); writeFileSync(join(dir, NAMES), named(lessA));
    assert.deepEqual(gate(["--base", lacksName]), [4, `::error::${NAMES} at the base ${lacksName} not readable: it disagrees with ${RECORD} there: a.test.ts: 1 name(s) in ${NAMES}, 2 test(s) in ${RECORD}`],
      "a base whose names record holds fewer names than its count (a test deleted, no line): exit 4");
    // killer: scripts/test-count-check.mjs:48 CONST "return stop(4," -> "return stop(0,"
    rmSync(join(dir, RUN));
    assert.equal(gate(["--base", both])[0], 4, "without a run file: exit 4");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// killer: .github/workflows/ci.yml:378 CONST "node scripts/test-count-check.mjs" -> "node scripts/test-count-floor.mjs write"
test("test_count_job_runs_test_main_then_the_check", () => {
  const ci = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8").split(/\r?\n/), at = ci.indexOf("  g3-test-count:"), end = ci.findIndex((l, i) => i > at && /^ {0,2}\S/.test(l));
  const job = at < 0 ? [] : ci.slice(at + 1, end < 0 ? ci.length : end).map((l) => l.replace(/\s*#.*$/, ""));
  assert.deepEqual(job.flatMap((l) => /^\s+run: (.+)$/.exec(l)?.[1] ?? []), ["npm ci", "npm run test:main", "node scripts/test-count-check.mjs"], "the job installs, runs the main suite, then the gate");
  // killer: .github/workflows/ci.yml:368 CONST "fetch-depth: 0" -> "fetch-depth: 1"
  assert.ok(job.some((l) => /^\s+fetch-depth: 0$/.test(l)), "the whole history: the base's record and list are read at the merge base");
  const minutes = Number(/^ {4}timeout-minutes: (\d+)$/.exec(job.find((l) => l.startsWith("    timeout-minutes:")) ?? "")?.[1] ?? 0);
  assert.ok(minutes > 0 && minutes <= 20, `a bound above 0 and at most 20 minutes (${minutes})`);
  assert.deepEqual(job.filter((l) => /^\s*(?:-\s+)?(?:if|continue-on-error)\s*:/.test(l)), [], "no condition: the job blocks");
});

// killer: scripts/test-count-check.mjs:20 CONST "names === undefined ? [] :" -> "true ? [] :"
test("test_count_check_holds_each_name_gone_to_its_line", () => {
  const run = (o: Record<string, string[]>): Run => Object.fromEntries(Object.entries(o).map(([f, n]) => [f, { tests: n.length, summary: true, names: n }]));
  assert.deepEqual(recordProblems(run({ a: ["one", "two", "two"], b: ["x"] }), { a: 3, b: 1 }, { a: ["one", "one", "two"], b: ["x"], c: ["y"] }),
    [`a: run and ${NAMES} differ: run only ["two"], recorded only ["one"]`, `c: run and ${NAMES} differ: run only [], recorded only ["y"]`], "P2 on names, as multisets: the exact names on each side, a file the run lacks");
  // killer: scripts/test-count-check.mjs:83 CONST "...Object.keys(names)])].sort()" -> "...Object.keys(names)])].filter(Boolean).sort()"
  assert.deepEqual(recordProblems(run({ a: ["one"] }), { a: 1 }, { "": ["two"], a: ["one"] }), [`: run and ${NAMES} differ: run only [], recorded only ["two"]`],
    "a names-record key \"\" is held to the run too: no file of the run carries it (the run's tests without a file are P1's), so its names never count as gained");
  // killer: scripts/test-count-check.mjs:85 CONST "alone === null ? [] : [`${f}: ${alone}`]" -> "[]"
  assert.deepEqual([recordProblems(run({ a: ["one"] }), { a: 1 }, { a: ["one"], ghost: [] }), recordProblems(run({ a: ["one"], z: [] }), { a: 1, z: 0 }, { a: ["one"] })], [[`ghost: in ${NAMES}, not in the run`], [`z: in the run, not in ${NAMES}`]],
    "a key without names is held too, on either side: else the records merged disagree and the next change's gate stops (exit 4)");
  const tally = (o: Record<string, string[]>): Record<string, number> => Object.fromEntries(Object.entries(o).map(([f, n]) => [f, n.length]));
  const by = (base: Record<string, string[]>, head: Record<string, string[]>, list: unknown[], pr?: string): string[] => dropProblems(tally(base), tally(head), [], list, { base, head, ...(pr === undefined ? {} : { pr }) });
  const r = (o: Record<string, unknown>): Record<string, unknown> => ({ ...o, reason: "#12: declared in this change" });
  const gone = (f: string, n: string, line: Record<string, unknown>, gained: string[] = [], pr = "<pull request>"): string =>
    `${f}: the test ${JSON.stringify(n)} is gone since the base: wants one line ${JSON.stringify({ ...line, reason: `#${pr}: ...` })} in ${REMOVALS}${gained.length > 0 ? `; tests ${f} gained: ${JSON.stringify(gained)}` : ""}`;
  const at = { a: ["keeps the order", "p > c", "refuses a negative amount"], b: ["one"] }, minusP = { ...at, a: ["keeps the order", "refuses a negative amount"] };
  const renamed = { ...at, a: ["keeps the order", "p > c", "refuses an amount below zero"] }, rename = { file: "a", renamed: "refuses a negative amount", to: "refuses an amount below zero" };
  assert.deepEqual([by(at, at, []), by(at, { ...at, c: ["new"] }, [])], [[], []], "no name gone: nothing wanted, a new file included");
  assert.deepEqual(by(at, renamed, []), [gone("a", "refuses a negative amount", rename, ["refuses an amount below zero"])], "a test renamed: its exact line, as a rename");
  assert.deepEqual([by(at, renamed, [r(rename)]), by(at, renamed, [], "7")], [[], [gone("a", "refuses a negative amount", rename, ["refuses an amount below zero"], "7")]], "with its line; in CI, the hint names the pull request");
  assert.deepEqual(by(at, { ...at, a: ["keeps the order", "p > d", "refuses a negative amount"] }, []), [gone("a", "p > c", { file: "a", renamed: "p > c", to: "p > d" }, ["p > d"])], "a subtest renamed");
  assert.deepEqual(by(at, { ...at, a: ["keeps the order, kept", "new", "p > c", "refuses a negative amount"] }, []), [gone("a", "keeps the order", { file: "a", removed: "keeps the order" }, ["keeps the order, kept", "new"])],
    "a test deleted and two added (one empty, under a near name): a removal is wanted, and the names gained are listed");
  assert.deepEqual(by(at, minusP, [r({ file: "a", removed: "p > c" })]), [], "a removal line");
  // killer: scripts/test-count-check.mjs:103 CONST "gone.splice(i, 1); " -> ""
  assert.deepEqual(by(at, minusP, [r({ file: "a", removed: "p > c" }), r({ file: "a", removed: "p > c" })]), [`${REMOVALS}: ${JSON.stringify(r({ file: "a", removed: "p > c" }))} names no test gone from a since the base`], "two lines for one name");
  const counted = r({ file: "a", from: 3, to: 2 });
  assert.deepEqual(by(at, minusP, [counted]), [notLine(counted, true), gone("a", "p > c", { file: "a", removed: "p > c" })], "a count line, once the base has names, is refused but for a file gone");
  // killer: scripts/test-count-check.mjs:102 CONST "r.renamed !== undefined && j < 0" -> "false"
  const nowhere = r({ ...rename, to: "refuses nothing" });
  assert.deepEqual(by(at, renamed, [nowhere]), [`${REMOVALS}: ${JSON.stringify(nowhere)}: "refuses nothing" is no test that a gained since the base`, gone("a", "refuses a negative amount", rename, ["refuses an amount below zero"])],
    "a rename to a name the file did not gain");
  const whole = `a: 3 test(s) at the base, 0 here: wants one line ${JSON.stringify({ file: "a", from: 3, to: 0, reason: "#<pull request>: ..." })} in ${REMOVALS}`;
  const each = at.a.map((n) => gone("a", n, { file: "a", removed: n }));
  assert.deepEqual([by(at, { b: ["one"] }, []), by(at, { b: ["one"] }, [r({ file: "a", from: 3, to: 0 })]), by(at, { b: ["one"] }, at.a.map((n) => r({ file: "a", removed: n })))], [each, each, []],
    "a file gone, none of its names anywhere in the head: one removal line per name is wanted and accepted; its file-gone line covers none of them");
  // killer: scripts/test-count-check.mjs:100 CONST "head[f] === undefined && " -> ""
  const notGone = r({ file: "b", from: 1, to: 0 });
  assert.deepEqual([by(at, { b: ["one"] }, [r({ file: "a", from: 2, to: 0 })]), by(at, { ...at, b: ["uno"] }, [notGone])],
    [[`${REMOVALS}: ${JSON.stringify(r({ file: "a", from: 2, to: 0 }))} names no file gone since the base, at its count`, ...each],
      [`${REMOVALS}: ${JSON.stringify(notGone)} names no file gone since the base, at its count`, gone("b", "one", { file: "b", renamed: "one", to: "uno" }, ["uno"])]],
    "a file-gone line at another count; one for a file still there, its one test renamed");
  // killer: scripts/test-count-check.mjs:65 CONST "left.splice(i, 1); return false;" -> "return false;"
  const twice = { a: ["same", "same"] };
  assert.deepEqual([by(twice, { a: ["same"] }, []), by(twice, { a: ["same"] }, [r({ file: "a", removed: "same" })])], [[gone("a", "same", { file: "a", removed: "same" })], []], "one of two equal names gone: one line");
  assert.deepEqual(by(at, at, [r({ file: "b", removed: "one" })]), [`${REMOVALS}: ${JSON.stringify(r({ file: "b", removed: "one" }))} names no test gone from b since the base`], "a line for a file with nothing gone");
  const shapes = [{ file: "a", removed: "", reason: "#12: declared in this change" }, r({ file: "a", renamed: "x", to: "x" }), r({ file: "a", removed: "x", to: "y" }), { file: "a", removed: "p > c", reason: "#12: removed" }];
  assert.deepEqual(by(at, minusP, shapes, "12").slice(0, 4), shapes.map((s) => notLine(s, true, "12")), "an empty name, a rename to itself, a fifth key, a short reason: not lines");
  // killer: scripts/test-count-check.mjs:96 CONST ", ...lines.map((r) => r.file)" -> ""
  const elsewhere = r({ file: "c", removed: "one" });
  assert.deepEqual(by(at, at, [elsewhere]), [`${REMOVALS}: ${JSON.stringify(elsewhere)} names no test gone from c since the base`], "a line for a file in neither names record");
  const part = r({ file: "a", removed: "p > c" }), left = [gone("a", "keeps the order", { file: "a", removed: "keeps the order" }), gone("a", "refuses a negative amount", { file: "a", removed: "refuses a negative amount" })];
  // killer: scripts/test-count-check.mjs:100 CONST " && base[f]?.length === r.from" -> ""
  const rest = r({ file: "a", from: 2, to: 0 });
  assert.deepEqual(by(at, { b: ["one"] }, [part, rest]), [`${REMOVALS}: ${JSON.stringify(rest)} names no file gone since the base, at its count`, ...left],
    "a file gone: a file-gone line at the count left once another line took a name is refused; it counts at the base's count only");
  // killer: scripts/test-count-check.mjs:111 CONST "if (back.length > 0" -> "if (all.length > 0"
  assert.deepEqual(by(at, { b: ["one"] }, [part]), left, "a file gone, one of its names declared: the hint wants each name left by its name, not the whole file");
  // killer: scripts/test-count-check.mjs:95 CONST "base = own(baseNames), head = own(headNames)" -> "base = baseNames, head = headNames"
  const thrown = (f: () => string[]): string[] => { try { return f(); } catch (e) { return [`threw ${String(e)}`]; } };
  const ctor = r({ file: "constructor", removed: "one" }), proto = r({ file: "__proto__", removed: "one" });
  assert.deepEqual(thrown(() => by(at, at, [ctor, proto])), ([[proto, "__proto__"], [ctor, "constructor"]] as const).map(([l, f]) => `${REMOVALS}: ${JSON.stringify(l)} names no test gone from ${f} since the base`),
    "a line for the file constructor or __proto__: the names records are read by their own keys, the gate's own refusal and no throw");
  // A file gone whose tests moved (a file renamed): its file-gone line covers a name only where it reappears, a name some file of the head gained
  //   since the base and no rename line took, each such name once; a name that reappears nowhere takes its own line.
  // killer: scripts/test-count-check.mjs:110 CONST ", gone = minus(all, back)" -> ", gone = moved ? [] : minus(all, back)"
  // killer: scripts/test-count-check.mjs:107 CONST "at.flatMap((x) => x.gained)" -> "at.flatMap((x) => head[x.f] ?? [])"
  // killer: scripts/test-count-check.mjs:107 CONST "at.flatMap((x) => x.gained)" -> "at.filter((x) => base[x.f] === undefined).flatMap((x) => x.gained)"
  // killer: scripts/test-count-check.mjs:110 CONST "if (k >= 0) pool.splice(k, 1); " -> ""
  // killer: scripts/test-count-check.mjs:110 CONST "head[f] === undefined ? all.filter" -> "true ? all.filter"
  // killer: scripts/test-count-check.mjs:100 CONST " && !moved" -> ""
  // killer: scripts/test-count-check.mjs:111 CONST " && !moved" -> ""
  // killer: scripts/test-count-check.mjs:111 CONST "from: base[f].length, to: 0" -> "from: all.length, to: 0"
  const moved = { b: ["one"], c: ["keeps the order", "p > c"] }, wholeA = r({ file: "a", from: 3, to: 0 }), lost = r({ file: "a", removed: "refuses a negative amount" });
  const lostHint = gone("a", "refuses a negative amount", { file: "a", removed: "refuses a negative amount" }), m = (n: string): string => gone("a", n, { file: "a", removed: n });
  const cases: [string, string[], string[]][] = [
    ["a file renamed whole, with its file-gone line", by(at, { b: ["one"], c: at.a }, [wholeA]), []],
    ["a file renamed, one test dropped, the file-gone line only: the dropped name wants its line", by(at, moved, [wholeA]), [lostHint]],
    ["a file renamed, one test dropped and declared, no file-gone line: the file-gone line at the base count", by(at, moved, [lost]), [whole]],
    ["the same with the dropped name's line after the file-gone line", by(at, moved, [wholeA, lost]), []],
    ["the same with the dropped name's line first", by(at, moved, [lost, wholeA]), []],
    ["the same without a line: the file-gone line, and the dropped name's", by(at, moved, []), [whole, lostHint]],
    ["a name that reappears only in a file that held it at the base covers no moved test", by({ a: ["m"], b: ["m"] }, { b: ["m"] }, [r({ file: "a", from: 1, to: 0 })]), [m("m")]],
    ["a name a rename line took covers no moved test", by({ a: ["m"], b: ["x"] }, { b: ["m"] }, [r({ file: "b", renamed: "x", to: "m" }), r({ file: "a", from: 1, to: 0 })]), [m("m")]],
    ["one name gained covers one moved test: two equal names gone, one back", by({ a: ["m", "m"] }, { c: ["m"] }, [r({ file: "a", from: 2, to: 0 })]), [m("m")]],
    ["a test moved between two files still there: its line, as before", by({ a: ["x", "y"] }, { a: ["y"], c: ["x"] }, []), [gone("a", "x", { file: "a", removed: "x" })]],
    ["a file merged whole into a file still there, with its file-gone line", by(at, { b: ["one", ...at.a] }, [wholeA]), []],
    ["a second file-gone line",by(at, { b: ["one"], c: at.a }, [wholeA, { ...wholeA, reason: "#12: declared in this change again" }]), [`${REMOVALS}: ${JSON.stringify({ ...wholeA, reason: "#12: declared in this change again" })} names no file gone since the base, at its count`]],
  ];
  assert.deepEqual(cases.filter(([, got, want]) => JSON.stringify(got) !== JSON.stringify(want)).map(([n, got]) => `${n}: ${JSON.stringify(got)}`), [],
    "a file gone: each of its names reappears in a file that gained it, or takes its own line; listed: the cases judged otherwise");
});
