/**
 * TEST-COUNT-FLOOR-1, the record (docs/G0-lot-test-count-floor-1.md). A test file whose process ends before it reports (an exit or an
 * exec, at load or inside a test) sends no summary of its own: the runner reports it under its name as one passing test, so a module that
 * exits at load erased 406 tests of test:main without one red (the note, §1.3). test:main loads scripts/test-counts-reporter.mjs beside
 * spec; it writes, per file, the tests reported and whether the file sent a summary of its own. `node scripts/test-count-floor.mjs write`
 * turns that run into the committed record test/test-counts.json and refuses a run where a file sent none (P1). T1 holds the reporter on
 * events, T2 a real nested run and the command, T3 the script line and the export of the reporter (ADR-M004 D7 terdecies).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import testCounts from "../scripts/test-counts-reporter.mjs";
import { RECORD, RUN, readRun, recordText, runProblems } from "../scripts/test-count-floor.mjs";
import { collectFiles } from "../scripts/export-public.mjs";

const ROOT = join(import.meta.dirname, ".."), OPTIONS = `--test-reporter=spec --test-reporter-destination=stdout --test-reporter=./scripts/test-counts-reporter.mjs --test-reporter-destination=${RUN}`;
// killer: scripts/test-counts-reporter.mjs:15 CONST "data.details?.type === \"test\"" -> "true"
test("test_counts_reporter_counts_each_test_of_each_file", async () => {
  const at = (f: string): string => join(process.cwd(), f), t = { type: "test" }, x = at("x.test.ts"), y = at("apps/y/test/y.test.ts");
  const events = [{ type: "test:pass", data: { file: x, details: t } }, { type: "test:fail", data: { file: x, details: t } }, // a failure is a test
    { type: "test:pass", data: { file: x, details: t, nesting: 1 } }, { type: "test:pass", data: { file: x, details: { type: "suite" } } }, // a subtest; a describe
    { type: "test:summary", data: { file: x, counts: { tests: 3 } } }, { type: "test:pass", data: { file: y, details: t } }, // x's own summary; y sends none
    { type: "test:pass", data: { details: t } }, { type: "test:diagnostic", data: { file: y } }, { type: "test:summary", data: { counts: { tests: 5 } } }];
  let out = "";
  for await (const chunk of testCounts(events)) out += chunk;
  // killer: scripts/test-counts-reporter.mjs:16 CONST "of(data.file).summary = true" -> "of(data.file).summary = false"
  // killer: scripts/test-counts-reporter.mjs:16 CONST "data.file !== undefined" -> "true"
  assert.deepEqual(Object.entries(readRun(out)), [["", { tests: 1, summary: false }], ["apps/y/test/y.test.ts", { tests: 1, summary: false }], ["x.test.ts", { tests: 3, summary: true }]],
    "each test at any depth, a failure included and a describe not, under its file relative to the cwd, sorted; a test without a file under \"\"; the own summary noted, the run's summary ignored");
  // killer: scripts/test-count-floor.mjs:14 CONST "Number.isInteger(c?.tests) && " -> ""
  for (const bad of ["[]", "null", "3", '{"a":2}', '{"a":null}', '{"a":{"tests":1.5,"summary":true}}', '{"a":{"tests":-1,"summary":true}}', '{"a":{"tests":1,"summary":1}}']) assert.throws(() => readRun(bad), /^Error: not a run of the reporter/, bad);
  assert.throws(() => readRun("{"), SyntaxError, "a cut run file is unreadable");
});

// killer: scripts/test-count-floor.mjs:22 CONST "c.summary ? [] :" -> "true ? [] :"
test("test_count_floor_refuses_a_file_whose_process_ended_before_it_reported", () => {
  const dir = mkdtempSync(join(tmpdir(), "tcf-")), floor = join(ROOT, "scripts", "test-count-floor.mjs");
  const node = (args: string[]) => spawnSync(process.execPath, args, { cwd: dir, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  const own = (f: string, n: number): string => `${f}: no report of its own (${n} test(s) under its name): its process ended before it reported, it declares no test, or it is a module that declared tests for a test file (declare each test in its *.test.ts)`;
  try {
    const t = 'import { test } from "node:test";\n', files: Record<string, string> = { "a.test.mjs": `${t}test("one", () => {});\ntest("two", () => {});\n`,
      "exit.mjs": "process.exit(0);\n", "b.test.mjs": `${t}import "./exit.mjs";\ntest("one", () => {});\ntest("two", () => {});\ntest("three", () => {});\n`,
      "c.test.mjs": `${t}import "./exit.mjs";\ntest("one", () => {});\n`, "d.test.mjs": `${t}if (process.argv.length < 0) test("never", () => {});\n`,
      "declare.mjs": `${t}test("declared by a module", () => {});\n`, "e.test.mjs": `${t}import "./declare.mjs";\ntest("one", () => {});\n` };
    for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
    mkdirSync(join(dir, "test"));
    const reporter = pathToFileURL(join(ROOT, "scripts", "test-counts-reporter.mjs")).href, tests = Object.keys(files).filter((f) => f.endsWith(".test.mjs"));
    const nested = node(["--test", `--test-reporter=${reporter}`, `--test-reporter-destination=${RUN}`, ...tests]);
    assert.equal(nested.status, 0, `the nested run exits with 0, as each of its processes (${nested.stderr})`);
    const run = readRun(readFileSync(join(dir, RUN), "utf8"));
    assert.deepEqual(run, { "a.test.mjs": { tests: 2, summary: true }, "b.test.mjs": { tests: 1, summary: false }, "c.test.mjs": { tests: 1, summary: false },
      "d.test.mjs": { tests: 1, summary: false }, "declare.mjs": { tests: 1, summary: false }, "e.test.mjs": { tests: 1, summary: true } },
    "b and c exit at load (3 tests declared, and 1), d declares none, e has one declared by a module: each but a and e is one test under its name, with no summary");
    assert.deepEqual(runProblems(run), ["b.test.mjs", "c.test.mjs", "d.test.mjs", "declare.mjs"].map((f) => own(f, 1)), "P1 names each file without a report of its own, the module included");
    // killer: scripts/test-count-floor.mjs:21 CONST "if (f === \"\") return" -> "if (false) return"
    assert.deepEqual(runProblems({ "": { tests: 2, summary: false } }), ["2 test(s) reported without a file"], "P1 names the tests reported without a file");
    // killer: scripts/test-count-floor.mjs:35 CONST "if (problems.length > 0) stop(1," -> "if (false) stop(1,"
    const refused = node([floor, "write"]);
    assert.deepEqual([refused.status, refused.stderr.split("\n")[0], existsSync(join(dir, RECORD))], [1, `::error::${own("b.test.mjs", 1)}`, false], "write refuses that run: exit 1, nothing written");
    // killer: scripts/test-count-floor.mjs:27 CONST "null, 1)" -> "null, 2)"
    writeFileSync(join(dir, RUN), '{"b.test.ts": {"tests": 3, "summary": true}, "a.test.ts": {"tests": 2, "summary": true}}');
    const written = node([floor, "write"]);
    assert.deepEqual([written.status, readFileSync(join(dir, RECORD), "utf8")], [0, '{\n "a.test.ts": 2,\n "b.test.ts": 3\n}\n'], "on a sound run, write writes the record in its written form");
    // killer: scripts/test-count-floor.mjs:33 CONST "stop(4," -> "stop(0,"
    rmSync(join(dir, RUN));
    assert.deepEqual([node([floor, "write"]).status, node([floor]).status], [4, 2], "without a run file, exit 4; without the command, exit 2");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const text = readFileSync(join(ROOT, RECORD), "utf8"), record = JSON.parse(text) as Record<string, number>;
  assert.ok(Object.values(record).every((n) => Number.isInteger(n) && n >= 0), `${RECORD}: each count is an integer >= 0`);
  assert.equal(text, recordText(record), `${RECORD}: not in its written form (npm run test:main && node scripts/test-count-floor.mjs write)`);
});

// killer: scripts/export-public.mjs:77 CONST ", \"scripts/test-counts-reporter.mjs\"" -> ""
test("test_main_loads_the_counts_reporter_and_the_export_ships_it", () => {
  const main = (JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> }).scripts["test:main"] ?? "";
  // killer: package.json:17 CONST " --test-reporter=./scripts/test-counts-reporter.mjs --test-reporter-destination=test-counts.out.json" -> ""
  assert.ok(main.includes(` ${OPTIONS} "test/*.test.ts" `), `test:main carries, right before its globs: ${OPTIONS}`);
  const loaded = [...main.matchAll(/--test-reporter=\.\/(\S+)/g)].map((m) => m[1]!), kept = new Set(collectFiles(ROOT).kept.map((f) => f.rel));
  assert.deepEqual(loaded, ["scripts/test-counts-reporter.mjs"], "test:main loads the counts reporter of the repository, by its path");
  assert.deepEqual(loaded.filter((f) => !kept.has(f)), [], "each reporter that test:main loads is in collectFiles(ROOT).kept: the mirror's CI launches test:main");
  assert.ok(readFileSync(join(ROOT, ".gitignore"), "utf8").split(/\r?\n/).includes(`/${RUN}`), `.gitignore names the run file, /${RUN}`);
});
