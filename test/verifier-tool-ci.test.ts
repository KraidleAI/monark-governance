/**
 * VERIFIER-TOOL-CI-1 (docs/G0-lot-verifier-tool-ci-1.md): the job g3-verifier-tool of .github/workflows/ci.yml holds the frozen verifier
 * tool, tools/kata-recalc/, by its own Python checks, run by scripts/verifier-tool-ci.mjs under one pinned CPython. These tests read the
 * workflow and the stand-in as text and judge the driver's rules on fixtures; no Python runs here (the job runs it). The red of the
 * job itself is shown in the G0 by the same command run against a mutated copy of the tool.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { derivePublicWorkflow } from "../scripts/export-public.mjs";
import { NOT_RUN, TOOL, WINDOWS_ONLY, accountProblems, formOf, interpreterProblems, outputProblems, steps, treesOf } from "../scripts/verifier-tool-ci.mjs";

const ROOT = join(import.meta.dirname, "..");
const read = (p: string): string => readFileSync(join(ROOT, p), "utf8");
const LINES = read(".github/workflows/ci.yml").split(/\r?\n/);
const code = (ls: string[]): string[] => ls.filter((l) => !/^\s*#/.test(l) && l.trim() !== "").map((l) => l.replace(/\s+#.*$/, "").trim());
const job = (name: string): string[] => {
  const at = LINES.findIndex((l) => l === `  ${name}:`), block: string[] = [];
  for (let i = at + 1; at !== -1 && i < LINES.length && !/^ {0,2}\S/.test(LINES[i] ?? ""); i++) block.push(LINES[i] ?? "");
  return code(block);
};
const SETUP_PYTHON = "actions/setup-python@5fda3b95a4ea91299a34e894583c3862153e4b97"; // v7.0.0: git ls-remote of refs/tags/v7.0.0, a commit

// killer: .github/workflows/ci.yml:292 CONST "python-version: \"3.14.8\"" -> "python-version: \"3.14\""
test("verifier_tool_job_runs_the_driver_under_one_pinned_cpython - g3-verifier-tool: a fixed image, full history, the pinned setup-python at an exact version that the step names again, then the driver; no if:, no continue-on-error; dropped from the public workflow", () => {
  const body = job("g3-verifier-tool");
  assert.ok(body.length > 0, "job 'g3-verifier-tool' missing from the workflow");
  assert.ok(body.includes("runs-on: ubuntu-24.04"), "the job names its image: setup-python installs that image's build of the pinned version");
  const at = (re: RegExp): number => body.findIndex((l) => re.test(l));
  const co = at(/^- uses: actions\/checkout@/), node = at(/^- uses: actions\/setup-node@/), py = at(/^- uses: actions\/setup-python@/), run = body.indexOf("run: node scripts/verifier-tool-ci.mjs");
  assert.ok(co !== -1 && co < node && node < py && py < run, `checkout, setup-node, setup-python, then the driver, in order: ${co} ${node} ${py} ${run}`);
  assert.deepEqual(body.slice(co + 1, co + 4), ["with:", "fetch-depth: 0", "persist-credentials: false"], "full history (git show 207f021f, the tree at the commit of lot 1d, a clone of the repository); no token kept");
  assert.equal(body[node + 2], 'node-version: "24"');
  assert.equal(body[py], `- uses: ${SETUP_PYTHON}`, "setup-python pinned by the commit of its tag v7.0.0");
  const version = /^python-version: "(\d+\.\d+\.\d+)"$/.exec(body[py + 2] ?? "")?.[1];
  assert.ok(body[py + 1] === "with:" && version?.startsWith("3.14."), `python-version is one exact CPython 3.14 release, no range: ${body[py + 2]}`);
  assert.deepEqual(body.slice(run - 2, run), ["env:", `VERIFIER_TOOL_PYTHON: "${version ?? ""}"`], "the run step names the same version, which the driver requires");
  assert.equal(run, body.length - 1, "the driver is the last step of the job");
  assert.ok(!body.some((l) => /(?:^|[-{,]\s*)["']?(?:if|continue-on-error)["']?\s*:/.test(l)), "no if: and no continue-on-error in the job");
  const all = code(LINES);
  assert.deepEqual(all.filter((l) => l.includes("setup-python")), [`- uses: ${SETUP_PYTHON}`], "one Python setup in the workflow, this one");
  assert.deepEqual(all.filter((l) => /\bpython\b/i.test(l)).filter((l) => !body.includes(l)), [], "no other job sets up or runs a Python");
  const derived = derivePublicWorkflow(LINES.join("\n"));
  assert.ok(!/^ {2}g3-verifier-tool\s*:/m.test(derived) && !derived.includes("verifier-tool-ci"), "the public workflow drops the job: the tool is never exported");
});

// killer: scripts/verifier-tool-ci.mjs:56 CONST "present[t] !== (t === TOOL)" -> "t === TOOL && !present[t]"
test("verifier_tool_driver_follows_io_guard_and_refuses_what_it_does_not_hold - FORM and TREES read from io_guard.py; a second tree on disk, an unnamed *_check.py, another interpreter: each refused", () => {
  const guard = read(`${TOOL}/io_guard.py`);
  assert.deepEqual(formOf(guard).slice(0, 4), ["-E", "-S", "-s", "-B"], "the launch form of the tool, read from its FORM line");
  assert.deepEqual(formOf('FORM = ("-E", "-S", "-s", "-B", "-P")\n'), ["-E", "-S", "-s", "-B", "-P"], "a form that gains an option is followed");
  for (const bad of ["", 'FORM = ("-E", "-B")\nFORM = ("-E",)\n', 'FORM = ("-E", "-B")\nFORM = ("-S", "-B")\n', 'FORM = ("-X", "presite")\n', 'FORM = ["-E", "-B"]\n']) assert.throws(() => formOf(bad), `refused: ${JSON.stringify(bad)}`);
  const trees = treesOf(guard), checks = ["binom_check.py", "compare_check.py", "guard_check.py", "report_check.py", "vectors_check.py"];
  assert.deepEqual(trees, [TOOL, "tools/kata-quarter"], "MONARK's closed list of two trees");
  assert.deepEqual(accountProblems(trees, { [TOOL]: true, "tools/kata-quarter": false }, checks), [], "today: one tree, every check run or named");
  assert.deepEqual(accountProblems(trees, { [TOOL]: true, "tools/kata-quarter": true }, checks), ["tools/kata-quarter: a tree of the tool that this job does not run"]);
  assert.deepEqual(accountProblems(trees, { [TOOL]: false, "tools/kata-quarter": false }, checks), [`${TOOL}: the tool's tree is absent`]);
  assert.deepEqual(accountProblems(trees, { [TOOL]: true, "tools/kata-quarter": false }, [...checks, "new_check.py"]), [`${TOOL}/new_check.py: a check that this job neither runs nor names`]);
  assert.deepEqual(Object.keys(NOT_RUN), ["vectors_check.py"], "one check named as not run, with its reason");
  assert.deepEqual([false, true].map((win) => steps("r", "w", win).map((s) => `${s[0]} ${s[1]}`)[1]), ["report_check.py scripts/verifier-tool-ci-report-check.py", `report_check.py ${TOOL}/report_check.py`], "off Windows, report_check through its stand-in");
  const at = (implementation: string, version: string, releaselevel = "final") => ({ implementation, version, releaselevel });
  assert.deepEqual([interpreterProblems(at("cpython", "3.14.8"), "3.14.8"), interpreterProblems(at("cpython", "3.14.5"), undefined)], [[], []]);
  for (const [info, pin] of [[at("cpython", "3.14.5"), "3.14.8"], [at("cpython", "3.13.9"), undefined], [at("pypy", "3.14.8"), undefined], [at("cpython", "3.14.0", "candidate"), undefined]] as const) {
    assert.equal(interpreterProblems(info, pin).length, 1, `refused: ${JSON.stringify(info)} pinned ${String(pin)}`);
  }
});

const GUARD_OUT = ["OK   import-listed: exit 0 (want 0): IMPORTED; NATIVE IS THE MEASURED LIST", "SKIP ntfs-stream: no subject here (none of the modules that the case names, or the working directory on another drive)",
  "cases 43 and the homonyms, skipped 1, failures 0", "VERDICT: GREEN"].join("\n");
// killer: scripts/verifier-tool-ci.mjs:70 CONST "[...skipped].sort().join() !== [...expected].sort().join()" -> "skipped.some((c) => !WINDOWS_ONLY.includes(c))"
test("verifier_tool_driver_names_each_skip_and_refuses_any_other - off Windows guard_check skips exactly WINDOWS_ONLY, each named; on Windows none; an exit, a missing VERDICT: GREEN, a FAIL or RED line: refused", () => {
  assert.deepEqual(WINDOWS_ONLY, ["ntfs-stream"]);
  assert.deepEqual(outputProblems("guard_check.py", GUARD_OUT, 0, 1, false), { problems: [], skipped: ["ntfs-stream"] }, "off Windows: the Windows case skipped and named");
  assert.deepEqual(outputProblems("guard_check.py", GUARD_OUT, 0, 1, true).problems, ["guard_check.py: skipped [ntfs-stream], [] wanted"], "on Windows nothing is skipped");
  const other = GUARD_OUT.replace("SKIP ntfs", "SKIP import-extension-outside-list: no subject here\nSKIP ntfs");
  assert.deepEqual(outputProblems("guard_check.py", other, 0, 1, false).problems, ["guard_check.py: skipped [import-extension-outside-list, ntfs-stream], [ntfs-stream] wanted"]);
  assert.deepEqual(outputProblems("guard_check.py", GUARD_OUT.replace(/^SKIP .*$/m, ""), 0, 1, false).problems, ["guard_check.py: skipped [], [ntfs-stream] wanted"]);
  assert.deepEqual(outputProblems("report_check.py", "SKIP x: y\nVERDICT: GREEN", 0, 1, false).problems, ["report_check.py: skipped [x], [] wanted"]);
  assert.deepEqual(outputProblems("binom_check.py", "checks 1, failures 0\nVERDICT: GREEN", 0, 2, false).problems, ["binom_check.py: 1 VERDICT: GREEN line(s), 2 wanted"]);
  assert.deepEqual(outputProblems("compare_check.py", "FAIL case 3: exit 0\nVERDICT: RED", 1, 1, false).problems,
    ["compare_check.py: exit 1, not 0", "compare_check.py: 0 VERDICT: GREEN line(s), 1 wanted", "compare_check.py: FAIL case 3: exit 0", "compare_check.py: VERDICT: RED"]);
  assert.deepEqual(outputProblems("compare_check.py", "VERDICT: GREEN", "SIGTERM", 1, false).problems, ["compare_check.py: exit SIGTERM, not 0"], "a killed or timed-out run is refused");
});

// killer: scripts/verifier-tool-ci-report-check.py:45 CONST "report.platform_fields = platform_fields" -> "report.platform_fields = report.tree_digest = platform_fields"
test("verifier_tool_stand_in_replaces_section_3_only - the Linux stand-in sets report.platform_fields and report.LIBMS, nothing else of the tool, loads io_guard by its path first, and runs report_check.main as written", () => {
  const py = code(read("scripts/verifier-tool-ci-report-check.py").split(/\r?\n/));
  const set = py.filter((l) => /^(?:report|report_check|fdlibm_log|_g|io_guard|kata_lib|recalc_p2|compare_p2)\.[\w.]+\s*=/.test(l) || /^setattr\(/.test(l));
  assert.deepEqual(set.map((l) => l.replace(/^(report\.LIBMS = \{\*\*report\.LIBMS, ).*$/, "$1...")), ["report.LIBMS = {**report.LIBMS, ...", "report.platform_fields = platform_fields"], "two names of report.py stand in, and nothing else of the tool");
  const exec = py.findIndex((l) => l.startsWith("exec(compile(open(_g.__file__")), imports = py.findIndex((l) => /^import (?!os, sys)/.test(l));
  assert.ok(exec !== -1 && exec < imports, "io_guard.py runs by its path before any other import");
  assert.deepEqual(py.filter((l) => l.includes("report_check.main")), ["sys.exit(report_check.main(*(os.path.abspath(a) for a in sys.argv[1:4])))"], "report_check.main runs once, as written, on the three arguments of report_check.py");
});
