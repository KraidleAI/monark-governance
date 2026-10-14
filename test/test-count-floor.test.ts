/**
 * TEST-COUNT-FLOOR-1, the record (docs/G0-lot-test-count-floor-1.md). A test file whose process ends before it reports (an exit or an
 * exec, at load or inside a test) sends no summary of its own: the runner reports it under its name as one passing test, so a module that
 * exits at load erased 406 tests of test:main without one red (the note, §1.3). test:main loads scripts/test-counts-reporter.mjs beside
 * spec; it writes, per file, the tests reported and whether the file sent a summary of its own. `node scripts/test-count-floor.mjs write`
 * turns that run into the committed record test/test-counts.json and refuses a run where a file sent none (P1). TEST-COUNT-NAMES-1
 * (docs/G0-lot-test-count-names-1.md): the run also names each test, after the tests and suites that hold it, and `write` writes those
 * names to test/test-names.json, one name per line. T1 holds the reporter on events, T2 a real nested run and the command, T3 the script
 * line and the export of the reporter (ADR-M004 D7 terdecies), T8 a test file reached through a directory link (REPORTER-REALPATH-1),
 * T9 a test file that another test file imports: its tests run in both processes, and P1 refuses it. T10 the process of each event
 * (data.entryFile): a nested node:test run (a worker, or a child that writes to the file's output) neither ends the outer file's report nor
 * makes one for its module, and T11 P1 refuses that module and a file that runs twice in its own process (two tests of one full name).
 * T12 the sites (per test, its declaration site, the depth it was reported at and its own name) on events, and P1's rule on them: one site
 * reported at two depths under one name; T13 a real run of a file that imports itself from a test body or a suite body: its second instance
 * declares the same sites one depth down, under full names that repeat none, and P1 refuses it.
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
// killer: scripts/test-counts-reporter.mjs:21 CONST "data.details?.type === \"test\"" -> "true"
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
  // killer: scripts/test-counts-reporter.mjs:22 CONST "c.summary = true" -> "c.summary = false"
  // killer: scripts/test-counts-reporter.mjs:22 CONST "data.file !== undefined" -> "true"
  // killer: scripts/test-counts-reporter.mjs:22 CONST "by === undefined || " -> ""
  // killer: scripts/test-counts-reporter.mjs:21 CONST ".slice(0, data.nesting), data.name].join(\" > \")" -> ".slice(0, 0), data.name].join(\" > \")"
  // killer: scripts/test-counts-reporter.mjs:23 CONST "else if (type === \"test:start\")" -> "else if (false)"
  // killer: scripts/test-counts-reporter.mjs:25 CONST "names: c.names.sort()" -> "names: c.names"
  assert.deepEqual(Object.entries(JSON.parse(out) as Run), [["", { tests: 1, summary: false, names: ["loose"], sites: [[null, 0, "loose"]] }], ["apps/y/test/y.test.ts", { tests: 1, summary: false, names: ["todo"], sites: [[null, 0, "todo"]] }],
    ["x.test.ts", { tests: 4, summary: true, names: ["a describe > in it", "z parent", "z parent", "z parent > child"], sites: [[null, 1, "child"], [null, 0, "z parent"], [null, 1, "in it"], [null, 0, "z parent"]] }]],
  "each test at any depth, a failure, a skip and a todo included and a describe not, under its file relative to the cwd, sorted; a test without a file under \"\"; the own summary noted, the run's summary ignored; each test named after the tests and suites that hold it, a name twice kept twice, the names sorted; its site (null: these events name none), its depth and its own name, in the order reported");
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
  const own = (f: string, n: number): string => `${f}: no report of its own (${n} test(s) under its name): its process ended before it reported, it declares no test, or it is a module whose tests ran in a test file's process: that file imports it, or runs it in a worker or in a child that writes to its output (declare each test in its *.test.ts, and give a nested test run an output of its own)`;
  try {
    const t = 'import { test } from "node:test";\n', files: Record<string, string> = { "a.test.mjs": `${t}test("one", () => {});\ntest("two", async (s) => { await s.test("in two", () => {}); });\n`,
      "exit.mjs": "process.exit(0);\n", "b.test.mjs": `${t}import "./exit.mjs";\ntest("one", () => {});\ntest("two", () => {});\ntest("three", () => {});\n`,
      "c.test.mjs": `${t}import "./exit.mjs";\ntest("one", () => {});\n`, "d.test.mjs": `${t}if (process.argv.length < 0) test("never", () => {});\n`,
      "declare.mjs": `${t}test("declared by a module", () => {});\n`, "e.test.mjs": `${t}import "./declare.mjs";\ntest("one", () => {});\n` };
    for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
    mkdirSync(join(dir, "test"));
    const reporter = pathToFileURL(join(ROOT, "scripts", "test-counts-reporter.mjs")).href, tests = Object.keys(files).filter((f) => f.endsWith(".test.mjs"));
    const nested = node(["--test", `--test-reporter=${reporter}`, `--test-reporter-destination=${RUN}`, ...tests]), ran = existsSync(join(dir, RUN)) ? JSON.parse(readFileSync(join(dir, RUN), "utf8")) as Run : null;
    // killer: scripts/test-counts-reporter.mjs:25 CONST "c.summary && c.foreign > 0 ?" -> "c.foreign > 0 ?"
    assert.deepEqual([nested.status, ran], [0, { "a.test.mjs": { tests: 3, summary: true, names: ["one", "two", "two > in two"], sites: [["2:1", 0, "one"], ["3:36", 1, "in two"], ["3:1", 0, "two"]] }, "b.test.mjs": { tests: 1, summary: false, names: ["b.test.mjs"], sites: [["1:1", 0, "b.test.mjs"]] },
      "c.test.mjs": { tests: 1, summary: false, names: ["c.test.mjs"], sites: [["1:1", 0, "c.test.mjs"]] }, "d.test.mjs": { tests: 1, summary: false, names: ["d.test.mjs"], sites: [["1:1", 0, "d.test.mjs"]] },
      "declare.mjs": { tests: 1, summary: false, names: ["declared by a module"], sites: [["2:1", 0, "declared by a module"]] }, "e.test.mjs": { tests: 1, summary: true, names: ["one"], sites: [["3:1", 0, "one"]] } }],
    `the nested run exits with 0, as each of its processes (${nested.stderr}); b and c exit at load (3 tests declared, and 1), d declares none, e has one declared by a module: each but a and e is one test under its name, with no summary, at the site 1:1; a subtest is named after its parent, its site the column of its call`);
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

// killer: scripts/test-counts-reporter.mjs:13 CONST "relative(real(process.cwd()), real(file))" -> "relative(process.cwd(), file)"
test("test_counts_reporter_keys_a_linked_file_by_its_real_path", () => {
  const dir = mkdtempSync(join(tmpdir(), "tcr-")), reporter = pathToFileURL(join(ROOT, "scripts", "test-counts-reporter.mjs")).href;
  try {
    mkdirSync(join(dir, "real"));
    writeFileSync(join(dir, "real", "a.test.mjs"), 'import { test } from "node:test";\ntest("one", () => {});\ntest("two", () => {});\n');
    symlinkSync(join(dir, "real"), join(dir, "lnk"), "junction"); // a junction under Windows (no privilege), a symbolic link elsewhere
    const r = spawnSync(process.execPath, ["--test", `--test-reporter=${reporter}`, `--test-reporter-destination=${RUN}`, join("lnk", "a.test.mjs")], { cwd: dir, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
    const ran = existsSync(join(dir, RUN)) ? JSON.parse(readFileSync(join(dir, RUN), "utf8")) as unknown : null;
    assert.deepEqual([r.status, ran], [0, { "real/a.test.mjs": { tests: 2, summary: true, names: ["one", "two"], sites: [["2:1", 0, "one"], ["3:1", 0, "two"]] } }],
      `a test file launched through a directory link is one key, its real path, with its tests, its summary, its names and its sites (${r.stderr})`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// killer: scripts/test-counts-reporter.mjs:22 CONST "if (r !== c || r.summary) r.foreign++" -> "if (false) r.foreign++"
// killer: scripts/test-counts-reporter.mjs:21 CONST "ran.push(c); else" -> "void 0; else"
// killer: scripts/test-counts-reporter.mjs:25 CONST "{ foreign: c.foreign }" -> "{}"
// killer: scripts/test-count-floor.mjs:24 CONST "c.foreign > 0 ?" -> "false ?"
test("test_count_floor_refuses_a_file_whose_tests_another_test_file_ran", async () => {
  const at = (f: string): string => join(process.cwd(), f), t = { type: "test" }, b = at("b.test.ts"), c = at("c.test.ts");
  const pass = (file: string, name: string) => ({ type: "test:pass", data: { file, name, nesting: 0, details: t } }), summary = (file: string) => ({ type: "test:summary", data: { file, counts: {} } });
  let out = ""; // c's process runs b's test (c imports b), then b's own process runs it again
  for await (const chunk of testCounts([pass(b, "one"), pass(c, "own"), summary(c), pass(b, "one"), summary(b)])) out += chunk;
  assert.deepEqual(JSON.parse(out), { "b.test.ts": { tests: 2, summary: true, names: ["one", "one"], foreign: 1, sites: [[null, 0, "one"], [null, 0, "one"]] }, "c.test.ts": { tests: 1, summary: true, names: ["own"], sites: [[null, 0, "own"]] } },
    "a test is credited to the file that declares it; one reported in another file's process counts as foreign on its own file, written when above 0");
  // killer: scripts/test-counts-reporter.mjs:22 CONST " || r.summary) r.foreign++" -> ") r.foreign++"
  out = ""; // one file run twice (a link to it is the same real path): its second process repeats its tests
  for await (const chunk of testCounts([pass(b, "one"), summary(b), pass(b, "one"), summary(b)])) out += chunk;
  assert.deepEqual(JSON.parse(out), { "b.test.ts": { tests: 2, summary: true, names: ["one", "one"], foreign: 1, sites: [[null, 0, "one"], [null, 0, "one"]] } }, "a file summed up twice: the tests of its second process count as foreign");
  const dir = mkdtempSync(join(tmpdir(), "tci-")), floor = join(ROOT, "scripts", "test-count-floor.mjs"), reporter = pathToFileURL(join(ROOT, "scripts", "test-counts-reporter.mjs")).href;
  const node = (args: string[]) => spawnSync(process.execPath, args, { cwd: dir, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  try {
    const h = 'import { test } from "node:test";\n', files: Record<string, string> = { "a.test.mjs": `${h}test("one", () => {});\n`,
      "b.test.mjs": `${h}export const helper = 1;\ntest("rejects", () => {});\ntest("formats", () => {});\n`,
      "c.test.mjs": `${h}import { helper } from "./b.test.mjs";\ntest("uses the helper", () => { if (helper !== 1) throw new Error("no helper"); });\n` };
    for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
    mkdirSync(join(dir, "test"));
    const nested = node(["--test", `--test-reporter=${reporter}`, `--test-reporter-destination=${RUN}`, ...Object.keys(files)]), ran = existsSync(join(dir, RUN)) ? JSON.parse(readFileSync(join(dir, RUN), "utf8")) as unknown : null;
    assert.deepEqual([nested.status, ran], [0, { "a.test.mjs": { tests: 1, summary: true, names: ["one"], sites: [["2:1", 0, "one"]] }, "b.test.mjs": { tests: 4, summary: true, names: ["formats", "formats", "rejects", "rejects"], foreign: 2, sites: [["3:1", 0, "rejects"], ["4:1", 0, "formats"], ["3:1", 0, "rejects"], ["4:1", 0, "formats"]] },
      "c.test.mjs": { tests: 1, summary: true, names: ["uses the helper"], sites: [["3:1", 0, "uses the helper"]] } }], `c imports a helper of b: b's two tests run in c's process as well, and count as foreign on b, at the same sites and depth (${nested.stderr})`);
    const twice = "b.test.mjs: 2 of its test(s) also ran in another process: a test file imports it (move what they share to a module that declares no test), or it runs twice";
    assert.deepEqual(runProblems(readRun(readFileSync(join(dir, RUN), "utf8"))), [twice], "P1 names the imported file");
    const refused = node([floor, "write"]);
    assert.deepEqual([refused.status, refused.stderr.split("\n")[0], existsSync(join(dir, RECORD))], [1, `::error::${twice}`, false], "write refuses that run: exit 1, nothing written");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// killer: scripts/test-counts-reporter.mjs:20 CONST "data?.entryFile === undefined ? undefined : key(data.entryFile)" -> "undefined"
// killer: scripts/test-counts-reporter.mjs:21 CONST "else if (by !== key(data.file) || c.summary) c.foreign++" -> "else if (false) c.foreign++"
// killer: scripts/test-counts-reporter.mjs:21 CONST "by !== key(data.file) || " -> ""
// killer: scripts/test-counts-reporter.mjs:21 CONST " || c.summary) c.foreign++" -> ") c.foreign++"
// killer: scripts/test-counts-reporter.mjs:22 CONST "by === undefined || by === key(data.file)" -> "true"
test("test_counts_reporter_keys_each_event_by_the_process_that_sent_it", async () => {
  const at = (f: string): string => join(process.cwd(), f), t = { type: "test" }, b = at("b.test.ts"), c = at("c.test.ts"), w = at("test/fixtures/w.mjs");
  const pass = (file: string, name: string, entryFile: string) => ({ type: "test:pass", data: { file, name, nesting: 0, details: t, entryFile } });
  const summary = (file: string, entryFile: string) => ({ type: "test:summary", data: { file, counts: {}, entryFile } }); // entryFile: the test file whose process sent the event
  const run = async (events: { type: string; data: unknown }[]): Promise<unknown> => { let out = ""; for await (const chunk of testCounts(events)) out += chunk; return JSON.parse(out); };
  assert.deepEqual(await run([pass(c, "first", c), pass(w, "fixture", c), summary(w, c), pass(c, "runs the fixture", c), summary(c, c)]),
    { "c.test.ts": { tests: 2, summary: true, names: ["first", "runs the fixture"], sites: [[null, 0, "first"], [null, 0, "runs the fixture"]] }, "test/fixtures/w.mjs": { tests: 1, summary: false, names: ["fixture"], sites: [[null, 0, "fixture"]] } },
    "c runs a module's node:test root in a worker, or in a child that writes to c's output: that root's summary, sent through c's process, neither ends c's report nor is the module's own");
  for (const events of [[pass(b, "one", c), pass(c, "own", c), summary(c, c), pass(b, "one", b), summary(b, b)], [pass(b, "one", b), summary(b, b), pass(b, "one", c), pass(c, "own", c), summary(c, c)]])
    assert.deepEqual(await run(events), { "b.test.ts": { tests: 2, summary: true, names: ["one", "one"], foreign: 1, sites: [[null, 0, "one"], [null, 0, "one"]] }, "c.test.ts": { tests: 1, summary: true, names: ["own"], sites: [[null, 0, "own"]] } },
      "c imports b: b's test sent through c's process counts as foreign on b, whichever process reports first");
  assert.deepEqual(await run([pass(b, "one", b), summary(b, b), pass(b, "one", b), summary(b, b)]), { "b.test.ts": { tests: 2, summary: true, names: ["one", "one"], foreign: 1, sites: [[null, 0, "one"], [null, 0, "one"]] } },
    "b run twice, each time by its own process: the tests after its first summary count as foreign");
});

// killer: scripts/test-count-floor.mjs:24 CONST "twice(c.names) > 0 ?" -> "false ?"
// killer: scripts/test-count-floor.mjs:54 CONST "names.length - new Set(names).size" -> "0"
test("test_count_floor_refuses_a_nested_test_run_and_a_file_that_runs_twice_in_its_own_process", () => {
  const dir = mkdtempSync(join(tmpdir(), "tcn-")), floor = join(ROOT, "scripts", "test-count-floor.mjs"), reporter = pathToFileURL(join(ROOT, "scripts", "test-counts-reporter.mjs")).href;
  const node = (args: string[]) => spawnSync(process.execPath, args, { cwd: dir, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  const own = (f: string): string => `${f}: no report of its own (1 test(s) under its name): its process ended before it reported, it declares no test, or it is a module whose tests ran in a test file's process: that file imports it, or runs it in a worker or in a child that writes to its output (declare each test in its *.test.ts, and give a nested test run an output of its own)`;
  const twice = (f: string, n: number): string => `${f}: ${n} of its test(s) repeat a full name of the file: two of its tests share a name (name each apart), or the file runs twice in its own process (it imports itself, e.g. with a query string)`;
  try {
    const h = 'import { test } from "node:test";\n', files: Record<string, string> = { "a.test.mjs": `${h}test("one", () => {});\n`,
      "b.test.mjs": `${h}if (!import.meta.url.includes("?")) await import("./b.test.mjs?again");\ntest("rejects", () => {});\ntest("formats", () => {});\n`,
      "c.test.mjs": `${h}import { Worker } from "node:worker_threads";\ntest("first", () => {});\ntest("runs the fixture in a worker", async () => { await new Promise((res, rej) => { const w = new Worker(new URL("./w.mjs", import.meta.url)); w.on("error", rej); w.on("exit", res); }); });\n`,
      "w.mjs": `${h}test("fixture", () => {});\n` };
    for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
    mkdirSync(join(dir, "test"));
    const nested = node(["--test", `--test-reporter=${reporter}`, `--test-reporter-destination=${RUN}`, "a.test.mjs", "b.test.mjs", "c.test.mjs"]), ran = existsSync(join(dir, RUN)) ? JSON.parse(readFileSync(join(dir, RUN), "utf8")) as unknown : null;
    assert.deepEqual([nested.status, ran], [0, { "a.test.mjs": { tests: 1, summary: true, names: ["one"], sites: [["2:1", 0, "one"]] }, "b.test.mjs": { tests: 4, summary: true, names: ["formats", "formats", "rejects", "rejects"], sites: [["3:1", 0, "rejects"], ["4:1", 0, "formats"], ["3:1", 0, "rejects"], ["4:1", 0, "formats"]] },
      "c.test.mjs": { tests: 2, summary: true, names: ["first", "runs the fixture in a worker"], sites: [["3:1", 0, "first"], ["4:1", 0, "runs the fixture in a worker"]] }, "w.mjs": { tests: 1, summary: false, names: ["fixture"], sites: [["2:1", 0, "fixture"]] } }],
    `b imports itself with a query at top level: its tests run twice in its own process, at the same sites and depth, nothing foreign; c runs w's node:test root in a worker: c keeps its two tests, w has no report of its own (${nested.stderr})`);
    assert.deepEqual(runProblems(readRun(readFileSync(join(dir, RUN), "utf8"))), [twice("b.test.mjs", 2), own("w.mjs")], "P1 names the file that ran twice and the nested module, not c");
    const refused = node([floor, "write"]);
    assert.deepEqual([refused.status, refused.stderr.trim(), existsSync(join(dir, RECORD))], [1, `::error::${twice("b.test.mjs", 2)}\n::error::${own("w.mjs")}`, false], "write refuses that run: exit 1, nothing written");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  assert.deepEqual([runProblems({ "x.test.ts": { tests: 3, summary: true, names: ["a", "b", "a"] } }), runProblems({ "x.test.ts": { tests: 2, summary: true, names: ["a", "a"], foreign: 1 } })],
    [[twice("x.test.ts", 1)], ["x.test.ts: 1 of its test(s) also ran in another process: a test file imports it (move what they share to a module that declares no test), or it runs twice"]],
    "two tests of one full name: P1 names the file; a file whose tests another process ran too is named for that first");
});

const DEPTHS = (f: string, n: number): string => `${f}: ${n} of its declaration site(s) reported at more than one nesting depth under one name: the file runs twice in its own process, the second time inside a test or a suite (it imports itself, e.g. with a query string, from a test body), or one helper of it declares the same tests at the top level and inside a suite (declare each once)`;
// killer: scripts/test-counts-reporter.mjs:24 CONST "of(data.file).sites.push(site(data))" -> "void 0"
// killer: scripts/test-counts-reporter.mjs:16 CONST "data.nesting, data.name" -> "0, data.name"
// killer: scripts/test-counts-reporter.mjs:26 CONST "c.sites = files.get(f).sites" -> "void 0"
// killer: scripts/test-count-floor.mjs:20 CONST "p.length > 0 ? p : depths(e)" -> "p"
// killer: scripts/test-count-floor.mjs:64 CONST "c.sites === undefined" -> "true"
// killer: scripts/test-count-floor.mjs:65 CONST "c.sites.every(entry)" -> "true"
// killer: scripts/test-count-floor.mjs:65 CONST "c.sites.length === c.tests && " -> ""
// killer: scripts/test-count-floor.mjs:67 CONST "if (site !== null) " -> ""
// killer: scripts/test-count-floor.mjs:67 CONST "seen.get(k) ?? new Set()" -> "new Set()"
// killer: scripts/test-count-floor.mjs:68 CONST "d.size > 1" -> "d.size > 0"
test("test_counts_reporter_keeps_each_test_site_and_depth_and_the_floor_refuses_one_site_at_two_depths", async () => {
  const at = (f: string): string => join(process.cwd(), f), t = { type: "test" }, x = at("x.test.ts"), y = at("y.test.ts");
  const start = (file: string, name: string, nesting: number) => ({ type: "test:start", data: { file, name, nesting } });
  const pass = (file: string, name: string, nesting: number, line?: number, column?: number) => ({ type: "test:pass", data: { file, name, nesting, line, column, details: t } });
  const summary = (file: string) => ({ type: "test:summary", data: { file, counts: {} } });
  // x: a second instance of the file, loaded inside holder, declares n at the same site one depth down; y: a subtest named as its parent, at another column, and a test m at two depths that the runner gives no site
  const events = [start(x, "n", 0), pass(x, "n", 0, 3, 1), start(x, "holder", 0), start(x, "n", 1), pass(x, "n", 1, 3, 1), pass(x, "holder", 0, 5, 1), summary(x),
    start(y, "x", 0), start(y, "x", 1), pass(y, "x", 1, 4, 34), pass(y, "x", 0, 4, 1), start(y, "m", 0), pass(y, "m", 0), start(y, "k", 0), start(y, "m", 1), pass(y, "m", 1), pass(y, "k", 0, 7, 1), summary(y)];
  let out = "";
  for await (const chunk of testCounts(events)) out += chunk;
  assert.deepEqual(JSON.parse(out), { "x.test.ts": { tests: 3, summary: true, names: ["holder", "holder > n", "n"], sites: [["3:1", 0, "n"], ["3:1", 1, "n"], ["5:1", 0, "holder"]] },
    "y.test.ts": { tests: 5, summary: true, names: ["k", "k > m", "m", "x", "x > x"], sites: [["4:34", 1, "x"], ["4:1", 0, "x"], [null, 0, "m"], [null, 1, "m"], ["7:1", 0, "k"]] } },
  "sites: per test, its declaration site as line:column (null when the runner gives none), the depth it was reported at and its own name, in the order reported");
  assert.deepEqual(runProblems(readRun(out)), [DEPTHS("x.test.ts", 1)], "P1 names the file whose site 3:1 is reported under n at the depths 0 and 1; not y: its x > x sits at another site than x, and m has no site");
  const z = (sites: unknown): Run => ({ "z.test.ts": { tests: 2, summary: true, names: ["a", "b"], sites: sites as [string | null, number, string][] } });
  const shape = `z.test.ts: its sites are not one [ "<line>:<column>", depth, name ] per test: not a run of the reporter (npm run test:main writes it)`;
  assert.deepEqual([[["1:1", 0, "a"]], [["1:1", 0], ["1:1", 0, "b"]], [["1:1", 0, "a"], [1, 0, "b"]], [["1:1", -1, "a"], ["1:1", 0, "b"]], [["1:1", 0, "a"], ["1:1", 0, 2]], "x"].map((s) => runProblems(z(s))),
    Array.from({ length: 6 }, () => [shape]), "sites of another shape than one [site, depth, name] per test: P1 names the file");
  assert.deepEqual([runProblems(z(undefined)), runProblems(z([["1:1", 0, "a"], [null, 1, "a"]]))], [[], []], "a run without sites (an older reporter's) has none to read; a test without a site is at no depth");
  const both = { tests: 2, summary: true, names: ["a", "a"], sites: [["1:1", 0, "a"], ["1:1", 1, "a"]] } as Run[string];
  assert.deepEqual([runProblems({ "z.test.ts": { ...both, foreign: 1 } }), runProblems({ "z.test.ts": both })],
    [["z.test.ts: 1 of its test(s) also ran in another process: a test file imports it (move what they share to a module that declares no test), or it runs twice"], ["z.test.ts: 1 of its test(s) repeat a full name of the file: two of its tests share a name (name each apart), or the file runs twice in its own process (it imports itself, e.g. with a query string)"]],
    "one problem per file, the first that applies: foreign, then a repeated full name, then a site at two depths");
});

// killer: scripts/test-counts-reporter.mjs:16 CONST "${data.line}:${data.column}" -> "${data.line}"
// killer: scripts/test-counts-reporter.mjs:14 CONST ", sites: []" -> ", sites: [[null, 0, \"\"]]"
// killer: scripts/test-count-floor.mjs:69 CONST "n > 0 ?" -> "false ?"
test("test_count_floor_refuses_a_file_that_imports_itself_from_a_test_body", () => {
  const dir = mkdtempSync(join(tmpdir(), "tcs-")), floor = join(ROOT, "scripts", "test-count-floor.mjs"), reporter = pathToFileURL(join(ROOT, "scripts", "test-counts-reporter.mjs")).href;
  const node = (args: string[]) => spawnSync(process.execPath, args, { cwd: dir, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  try {
    const h = 'import { test } from "node:test";\n', files: Record<string, string> = {
      "b.test.mjs": `${h}test("rejects", () => {});\ntest("formats", () => {});\ntest("x", async () => { if (!import.meta.url.includes("?")) await import("./b.test.mjs?again"); });\n`,
      "d.test.mjs": `import { test, describe } from "node:test";\ntest("one", () => {});\ndescribe("y", async () => { if (!import.meta.url.includes("?")) await import("./d.test.mjs?again"); });\n`,
      "e.test.mjs": `${h}test("two", async (s) => { await s.test("in two", () => {}); });\ntest("x", async (t) => { await t.test("x", () => {}); });\n` };
    for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
    mkdirSync(join(dir, "test"));
    const run = node(["--test", `--test-reporter=${reporter}`, `--test-reporter-destination=${RUN}`, ...Object.keys(files)]), ran = existsSync(join(dir, RUN)) ? JSON.parse(readFileSync(join(dir, RUN), "utf8")) as unknown : null;
    assert.deepEqual([run.status, ran], [0, { "b.test.mjs": { tests: 6, summary: true, names: ["formats", "rejects", "x", "x > formats", "x > rejects", "x > x"], sites: [["2:1", 0, "rejects"], ["3:1", 0, "formats"], ["2:1", 1, "rejects"], ["3:1", 1, "formats"], ["4:1", 1, "x"], ["4:1", 0, "x"]] },
      "d.test.mjs": { tests: 2, summary: true, names: ["one", "y > one"], sites: [["2:1", 0, "one"], ["2:1", 1, "one"]] },
      "e.test.mjs": { tests: 4, summary: true, names: ["two", "two > in two", "x", "x > x"], sites: [["2:36", 1, "in two"], ["2:1", 0, "two"], ["3:34", 1, "x"], ["3:1", 0, "x"]] } }],
    `b imports itself with a query from the body of its test x, d from the body of its suite y: the second instance's tests nest there, at the same sites one depth down, under full names that repeat none, nothing foreign; e's subtest x sits at another column than its parent x (${run.stderr})`);
    assert.deepEqual(runProblems(readRun(readFileSync(join(dir, RUN), "utf8"))), [DEPTHS("b.test.mjs", 3), DEPTHS("d.test.mjs", 1)], "P1 names b (rejects, formats and x, each at the depths 0 and 1) and d (one), not e");
    const refused = node([floor, "write"]);
    assert.deepEqual([refused.status, refused.stderr.trim(), existsSync(join(dir, RECORD))], [1, `::error::${DEPTHS("b.test.mjs", 3)}\n::error::${DEPTHS("d.test.mjs", 1)}`, false], "write refuses that run: exit 1, nothing written");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
