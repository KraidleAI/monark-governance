/**
 * TEST-COUNT-FLOOR-1, the record (docs/G0-lot-test-count-floor-1.md). A test file whose process ends before it reports (an exit or an
 * exec, at load or inside a test) sends no summary of its own: the runner reports it under its name as one passing test, so a module that
 * exits at load erased 406 tests of test:main without one red (the note, §1.3). test:main loads scripts/test-counts-reporter.mjs beside
 * spec; it writes, per file, the tests reported and whether the file sent a summary of its own. `node scripts/test-count-floor.mjs write`
 * turns that run into the committed record test/test-counts.json and refuses a run where a file sent none (P1). TEST-COUNT-NAMES-1
 * (docs/G0-lot-test-count-names-1.md): the run also names each test, after the tests and suites that hold it, and `write` writes those
 * names to test/test-names.json, one name per line. T1 holds the reporter on events, T2 a real nested run and the command, T3 the script
 * line and the export of the reporter (ADR-M004 D7 terdecies), T8 a test file reached through a directory link (REPORTER-REALPATH-1),
 * T9 a test file that another test file imports: its tests run in both processes, and P1 refuses it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import testCounts from "../scripts/test-counts-reporter.mjs";
import { RECORD, RUN, readRun, recordText, runProblems, type Run } from "../scripts/test-count-floor.mjs";
import { collectFiles } from "../scripts/export-public.mjs";

const ROOT = join(import.meta.dirname, ".."), OPTIONS = `--test-reporter=spec --test-reporter-destination=stdout --test-reporter=./scripts/test-counts-reporter.mjs --test-reporter-destination=${RUN}`;
// killer: scripts/test-counts-reporter.mjs:15 CONST "data.details?.type === \"test\"" -> "true"
test("test_counts_reporter_counts_each_test_of_each_file", async () => {
  const at = (f: string): string => join(process.cwd(), f), t = { type: "test" }, x = at("x.test.ts"), y = at("apps/y/test/y.test.ts");
  const start = (file: string, name: string, nesting: number) => ({ type: "test:start", data: { file, name, nesting } }); // in the order the tests are defined
  const events = [start(x, "z parent", 0), start(x, "child", 1), { type: "test:pass", data: { file: x, name: "child", nesting: 1, details: t } }, // a subtest
    { type: "test:pass", data: { file: x, name: "z parent", nesting: 0, details: t } }, start(x, "a describe", 0), start(x, "in it", 1), // a describe holds a test
    { type: "test:fail", data: { file: x, name: "in it", nesting: 1, details: t } }, { type: "test:pass", data: { file: x, name: "a describe", nesting: 0, details: { type: "suite" } } },
    start(x, "z parent", 0), { type: "test:pass", data: { file: x, name: "z parent", nesting: 0, details: t, skip: true } }, // a failure is a test, a describe not; a name twice
    { type: "test:summary", data: { file: x, counts: { tests: 4 } } }, start(y, "todo", 0), { type: "test:pass", data: { file: y, name: "todo", nesting: 0, details: t, todo: true } },
    { type: "test:pass", data: { name: "loose", nesting: 0, details: t } }, { type: "test:diagnostic", data: { file: y } }, { type: "test:summary", data: { counts: { tests: 6 } } }]; // x's own summary; y sends none
  let out = "";
  for await (const chunk of testCounts(events)) out += chunk;
  // killer: scripts/test-counts-reporter.mjs:16 CONST "of(data.file).summary = true" -> "of(data.file).summary = false"
  // killer: scripts/test-counts-reporter.mjs:16 CONST "data.file !== undefined" -> "true"
  // killer: scripts/test-counts-reporter.mjs:15 CONST ".slice(0, data.nesting), data.name].join(\" > \")" -> ".slice(0, 0), data.name].join(\" > \")"
  // killer: scripts/test-counts-reporter.mjs:17 CONST "else if (type === \"test:start\")" -> "else if (false)"
  // killer: scripts/test-counts-reporter.mjs:19 CONST "names: c.names.sort()" -> "names: c.names"
  assert.deepEqual(Object.entries(JSON.parse(out) as Run), [["", { tests: 1, summary: false, names: ["loose"] }], ["apps/y/test/y.test.ts", { tests: 1, summary: false, names: ["todo"] }],
    ["x.test.ts", { tests: 4, summary: true, names: ["a describe > in it", "z parent", "z parent", "z parent > child"] }]],
  "each test at any depth, a failure, a skip and a todo included and a describe not, under its file relative to the cwd, sorted; a test without a file under \"\"; the own summary noted, the run's summary ignored; each test named after the tests and suites that hold it, a name twice kept twice, the names sorted");
  assert.deepEqual(Object.entries(readRun(out)).map(([f, c]) => [f, c.tests]), [["", 1], ["apps/y/test/y.test.ts", 1], ["x.test.ts", 4]], "readRun reads the reporter's output");
  // killer: scripts/test-count-floor.mjs:14 CONST "Number.isInteger(c?.tests) && " -> ""
  // killer: scripts/test-count-floor.mjs:15 CONST " && c.names.length === c.tests" -> ""
  for (const bad of ["[]", "null", "3", '{"a":2}', '{"a":null}', '{"a":{"tests":1.5,"summary":true,"names":["x"]}}', '{"a":{"tests":-1,"summary":true,"names":[]}}', '{"a":{"tests":1,"summary":1,"names":["x"]}}',
    '{"a":{"tests":1,"summary":true}}', '{"a":{"tests":2,"summary":true,"names":["x"]}}', '{"a":{"tests":1,"summary":true,"names":[1]}}', '{"a":{"tests":1,"summary":true,"names":"x"}}']) assert.throws(() => readRun(bad), /^Error: not a run of the reporter/, bad);
  assert.throws(() => readRun("{"), SyntaxError, "a cut run file is unreadable");
});

// killer: scripts/test-count-floor.mjs:23 CONST "if (!c.summary) return" -> "if (false) return"
test("test_count_floor_refuses_a_file_whose_process_ended_before_it_reported", () => {
  const dir = mkdtempSync(join(tmpdir(), "tcf-")), floor = join(ROOT, "scripts", "test-count-floor.mjs");
  const node = (args: string[]) => spawnSync(process.execPath, args, { cwd: dir, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  const own = (f: string, n: number): string => `${f}: no report of its own (${n} test(s) under its name): its process ended before it reported, it declares no test, or it is a module that declared tests for a test file (declare each test in its *.test.ts)`;
  try {
    const t = 'import { test } from "node:test";\n', files: Record<string, string> = { "a.test.mjs": `${t}test("one", () => {});\ntest("two", async (s) => { await s.test("in two", () => {}); });\n`,
      "exit.mjs": "process.exit(0);\n", "b.test.mjs": `${t}import "./exit.mjs";\ntest("one", () => {});\ntest("two", () => {});\ntest("three", () => {});\n`,
      "c.test.mjs": `${t}import "./exit.mjs";\ntest("one", () => {});\n`, "d.test.mjs": `${t}if (process.argv.length < 0) test("never", () => {});\n`,
      "declare.mjs": `${t}test("declared by a module", () => {});\n`, "e.test.mjs": `${t}import "./declare.mjs";\ntest("one", () => {});\n` };
    for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
    mkdirSync(join(dir, "test"));
    const reporter = pathToFileURL(join(ROOT, "scripts", "test-counts-reporter.mjs")).href, tests = Object.keys(files).filter((f) => f.endsWith(".test.mjs"));
    const nested = node(["--test", `--test-reporter=${reporter}`, `--test-reporter-destination=${RUN}`, ...tests]), ran = existsSync(join(dir, RUN)) ? JSON.parse(readFileSync(join(dir, RUN), "utf8")) as Run : null;
    // killer: scripts/test-counts-reporter.mjs:19 CONST "c.summary && c.foreign > 0 ?" -> "c.foreign > 0 ?"
    assert.deepEqual([nested.status, ran], [0, { "a.test.mjs": { tests: 3, summary: true, names: ["one", "two", "two > in two"] }, "b.test.mjs": { tests: 1, summary: false, names: ["b.test.mjs"] },
      "c.test.mjs": { tests: 1, summary: false, names: ["c.test.mjs"] }, "d.test.mjs": { tests: 1, summary: false, names: ["d.test.mjs"] },
      "declare.mjs": { tests: 1, summary: false, names: ["declared by a module"] }, "e.test.mjs": { tests: 1, summary: true, names: ["one"] } }],
    `the nested run exits with 0, as each of its processes (${nested.stderr}); b and c exit at load (3 tests declared, and 1), d declares none, e has one declared by a module: each but a and e is one test under its name, with no summary; a subtest is named after its parent`);
    const run = readRun(readFileSync(join(dir, RUN), "utf8"));
    assert.deepEqual(runProblems(run), ["b.test.mjs", "c.test.mjs", "d.test.mjs", "declare.mjs"].map((f) => own(f, 1)), "P1 names each file without a report of its own, the module included");
    // killer: scripts/test-count-floor.mjs:22 CONST "if (f === \"\") return" -> "if (false) return"
    assert.deepEqual(runProblems({ "": { tests: 2, summary: false, names: ["one", "two"] } }), ["2 test(s) reported without a file"], "P1 names the tests reported without a file");
    // killer: scripts/test-count-floor.mjs:37 CONST "if (problems.length > 0) stop(1," -> "if (false) stop(1,"
    const refused = node([floor, "write"]);
    assert.deepEqual([refused.status, refused.stderr.split("\n")[0], existsSync(join(dir, RECORD))], [1, `::error::${own("b.test.mjs", 1)}`, false], "write refuses that run: exit 1, nothing written");
    // killer: scripts/test-count-floor.mjs:29 CONST "null, 1)" -> "null, 2)"
    // killer: scripts/test-count-floor.mjs:39 CONST "writeFileSync(NAMES, " -> "void ("
    // killer: scripts/test-count-floor.mjs:48 CONST ".replace(/[\\u2028\\u2029]/g," -> ".replace(/(?!)/g,"
    writeFileSync(join(dir, RUN), '{"b.test.ts": {"tests": 3, "summary": true, "names": ["two", "one", "three"]}, "a.test.ts": {"tests": 2, "summary": true, "names": ["z", "a\u2028b"]}}');
    const written = node([floor, "write"]), names = join(dir, "test", "test-names.json"), wrote = existsSync(names);
    assert.deepEqual([written.status, readFileSync(join(dir, RECORD), "utf8"), wrote, wrote ? readFileSync(names, "utf8") : null],
      [0, '{\n "a.test.ts": 2,\n "b.test.ts": 3\n}\n', true, '{\n "a.test.ts": [\n  "a\\u2028b",\n  "z"\n ],\n "b.test.ts": [\n  "one",\n  "three",\n  "two"\n ]\n}\n'],
      "on a sound run, write writes the record and the names record in their written forms: one name per line, sorted, U+2028 escaped");
    // killer: scripts/test-count-floor.mjs:35 CONST "stop(4," -> "stop(0,"
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

// killer: scripts/test-counts-reporter.mjs:10 CONST "relative(real(process.cwd()), real(file))" -> "relative(process.cwd(), file)"
test("test_counts_reporter_keys_a_linked_file_by_its_real_path", () => {
  const dir = mkdtempSync(join(tmpdir(), "tcr-")), reporter = pathToFileURL(join(ROOT, "scripts", "test-counts-reporter.mjs")).href;
  try {
    mkdirSync(join(dir, "real"));
    writeFileSync(join(dir, "real", "a.test.mjs"), 'import { test } from "node:test";\ntest("one", () => {});\ntest("two", () => {});\n');
    symlinkSync(join(dir, "real"), join(dir, "lnk"), "junction"); // a junction under Windows (no privilege), a symbolic link elsewhere
    const r = spawnSync(process.execPath, ["--test", `--test-reporter=${reporter}`, `--test-reporter-destination=${RUN}`, join("lnk", "a.test.mjs")], { cwd: dir, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
    const ran = existsSync(join(dir, RUN)) ? JSON.parse(readFileSync(join(dir, RUN), "utf8")) as unknown : null;
    assert.deepEqual([r.status, ran], [0, { "real/a.test.mjs": { tests: 2, summary: true, names: ["one", "two"] } }],
      `a test file launched through a directory link is one key, its real path, with its tests, its summary and its names (${r.stderr})`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// killer: scripts/test-counts-reporter.mjs:16 CONST "if (c !== of(data.file) || c.summary) c.foreign++" -> "if (false) c.foreign++"
// killer: scripts/test-counts-reporter.mjs:15 CONST " ran.push(c);" -> ""
// killer: scripts/test-counts-reporter.mjs:19 CONST "{ foreign: c.foreign }" -> "{}"
// killer: scripts/test-count-floor.mjs:24 CONST "c.foreign > 0 ?" -> "false ?"
test("test_count_floor_refuses_a_file_whose_tests_another_test_file_ran", async () => {
  const at = (f: string): string => join(process.cwd(), f), t = { type: "test" }, b = at("b.test.ts"), c = at("c.test.ts");
  const pass = (file: string, name: string) => ({ type: "test:pass", data: { file, name, nesting: 0, details: t } }), summary = (file: string) => ({ type: "test:summary", data: { file, counts: {} } });
  let out = ""; // c's process runs b's test (c imports b), then b's own process runs it again
  for await (const chunk of testCounts([pass(b, "one"), pass(c, "own"), summary(c), pass(b, "one"), summary(b)])) out += chunk;
  assert.deepEqual(JSON.parse(out), { "b.test.ts": { tests: 2, summary: true, names: ["one", "one"], foreign: 1 }, "c.test.ts": { tests: 1, summary: true, names: ["own"] } },
    "a test is credited to the file that declares it; one reported in another file's process counts as foreign on its own file, written when above 0");
  // killer: scripts/test-counts-reporter.mjs:16 CONST " || c.summary) c.foreign++" -> ") c.foreign++"
  out = ""; // one file run twice (a link to it is the same real path): its second process repeats its tests
  for await (const chunk of testCounts([pass(b, "one"), summary(b), pass(b, "one"), summary(b)])) out += chunk;
  assert.deepEqual(JSON.parse(out), { "b.test.ts": { tests: 2, summary: true, names: ["one", "one"], foreign: 1 } }, "a file summed up twice: the tests of its second process count as foreign");
  const dir = mkdtempSync(join(tmpdir(), "tci-")), floor = join(ROOT, "scripts", "test-count-floor.mjs"), reporter = pathToFileURL(join(ROOT, "scripts", "test-counts-reporter.mjs")).href;
  const node = (args: string[]) => spawnSync(process.execPath, args, { cwd: dir, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  try {
    const h = 'import { test } from "node:test";\n', files: Record<string, string> = { "a.test.mjs": `${h}test("one", () => {});\n`,
      "b.test.mjs": `${h}export const helper = 1;\ntest("rejects", () => {});\ntest("formats", () => {});\n`,
      "c.test.mjs": `${h}import { helper } from "./b.test.mjs";\ntest("uses the helper", () => { if (helper !== 1) throw new Error("no helper"); });\n` };
    for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
    mkdirSync(join(dir, "test"));
    const nested = node(["--test", `--test-reporter=${reporter}`, `--test-reporter-destination=${RUN}`, ...Object.keys(files)]), ran = existsSync(join(dir, RUN)) ? JSON.parse(readFileSync(join(dir, RUN), "utf8")) as unknown : null;
    assert.deepEqual([nested.status, ran], [0, { "a.test.mjs": { tests: 1, summary: true, names: ["one"] }, "b.test.mjs": { tests: 4, summary: true, names: ["formats", "formats", "rejects", "rejects"], foreign: 2 },
      "c.test.mjs": { tests: 1, summary: true, names: ["uses the helper"] } }], `c imports a helper of b: b's two tests run in c's process as well, and count as foreign on b (${nested.stderr})`);
    const twice = "b.test.mjs: 2 of its test(s) also ran in another process: a test file imports it (move what they share to a module that declares no test), or it runs twice";
    assert.deepEqual(runProblems(readRun(readFileSync(join(dir, RUN), "utf8"))), [twice], "P1 names the imported file");
    const refused = node([floor, "write"]);
    assert.deepEqual([refused.status, refused.stderr.split("\n")[0], existsSync(join(dir, RECORD))], [1, `::error::${twice}`, false], "write refuses that run: exit 1, nothing written");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
