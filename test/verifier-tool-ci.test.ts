/**
 * VERIFIER-TOOL-CI-1 (docs/G0-lot-verifier-tool-ci-1.md): the job g3-verifier-tool of .github/workflows/ci.yml holds the frozen verifier
 * tool, tools/kata-recalc/, by its own Python checks, run by scripts/verifier-tool-ci.mjs under one pinned CPython. These tests read the
 * workflow and the stand-in as text and judge the driver's rules on fixtures; no Python runs here (the job runs it). The red of the
 * job itself is shown in the G0 by the same command run against a mutated copy of the tool. VERIFIER-TOOL-CI-VECTORS-1
 * (docs/G0-lot-verifier-tool-ci-vectors-1.md) adds vectors_check.py, run on the spec vectors that the job checks out at a pinned commit.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { derivePublicWorkflow } from "../scripts/export-public.mjs";
import { NOT_RUN, TOOL, WINDOWS_ONLY, accountProblems, formOf, interpreterProblems, outputProblems, steps, treesOf } from "../scripts/verifier-tool-ci.mjs";
import * as ci from "../scripts/verifier-tool-ci.mjs"; // the names of VERIFIER-TOOL-CI-VECTORS-1, read so that this file loads before them

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
  // killer: .github/workflows/ci.yml:298 CONST "ref: ffb5ea33fcdcde2bd497cb25fba184ae2c4bbfa8" -> "ref: main"
  const spec = body.findIndex((l, i) => i > co && /^- uses: actions\/checkout@/.test(l)), v = ci.VECTORS;
  assert.ok(py < spec && spec < run && body[spec] === body[co], `the spec vectors checked out by the same pinned action, after setup-python, before the driver: ${spec}`);
  assert.deepEqual(body.slice(spec + 1, spec + 6), ["with:", `repository: ${v?.repository}`, `ref: ${v?.commit}`, `path: ${v?.path.split("/")[0]}`, "persist-credentials: false"],
    "the public spec repository at the commit that the driver pins, into the folder it reads; no token kept");
  assert.ok(!body.some((l) => /(?:^|[-{,]\s*)["']?(?:if|continue-on-error)["']?\s*:/.test(l)), "no if: and no continue-on-error in the job");
  const all = code(LINES);
  assert.deepEqual(all.filter((l) => l.includes("setup-python")), [`- uses: ${SETUP_PYTHON}`], "one Python setup in the workflow, this one");
  assert.deepEqual(all.filter((l) => /\bpython\b/i.test(l)).filter((l) => !body.includes(l)), [], "no other job sets up or runs a Python");
  const derived = derivePublicWorkflow(LINES.join("\n"));
  assert.ok(!/^ {2}g3-verifier-tool\s*:/m.test(derived) && !derived.includes("verifier-tool-ci"), "the public workflow drops the job: the tool is never exported");
});

// killer: scripts/verifier-tool-ci.mjs:91 CONST "present[t] !== (t === TOOL)" -> "t === TOOL && !present[t]"
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
  assert.deepEqual(Object.keys(NOT_RUN), [], "every check of the tool is run, vectors_check.py on the pinned spec vectors");
  assert.deepEqual([false, true].map((win) => steps("r", "w", win).map((s) => `${s[0]} ${s[1]}`)[1]), ["report_check.py scripts/verifier-tool-ci-report-check.py", `report_check.py ${TOOL}/report_check.py`], "off Windows, report_check through its stand-in");
  const at = (implementation: string, version: string, releaselevel = "final") => ({ implementation, version, releaselevel });
  assert.deepEqual([interpreterProblems(at("cpython", "3.14.8"), "3.14.8"), interpreterProblems(at("cpython", "3.14.5"), undefined)], [[], []]);
  for (const [info, pin] of [[at("cpython", "3.14.5"), "3.14.8"], [at("cpython", "3.13.9"), undefined], [at("pypy", "3.14.8"), undefined], [at("cpython", "3.14.0", "candidate"), undefined]] as const) {
    assert.equal(interpreterProblems(info, pin).length, 1, `refused: ${JSON.stringify(info)} pinned ${String(pin)}`);
  }
});

// killer: scripts/verifier-tool-ci.mjs:53 SDL "join(w, \"hikae.txt\")" -> ""
test("verifier_tool_driver_owes_each_run_of_each_check - each check of the tool runs once in each of its modes, with its count of VERDICT: GREEN lines; a run dropped, doubled or judged on another count is refused, so neither run of binom_check.py can go unseen", () => {
  type Run = ReturnType<typeof steps>[number];
  const trees = [TOOL, "tools/kata-quarter"], today = { [TOOL]: true, "tools/kata-quarter": false }, runs = steps("r", "w", false);
  const owe = (rs: Run[]): string[] => accountProblems(trees, today, ["binom_check.py", "compare_check.py", "guard_check.py", "report_check.py", "vectors_check.py"], rs);
  const owed = (run: string, times: number): string => `${run}: a run that this job owes once, run ${times} time(s)`;
  assert.deepEqual(owe(runs.filter((s) => s[3] !== 2)), [owed("binom_check.py (2 VERDICT: GREEN)", 0)], "D-2 (ii) and (iii) dropped: binom_check.py is still run, by --registry");
  assert.deepEqual(owe(runs.filter((s) => s[2][0] !== "--registry")), [owed("binom_check.py --registry (1 VERDICT: GREEN)", 0)], "the registry run dropped");
  // killer: scripts/verifier-tool-ci.mjs:93 CONST "times(o) !== 1" -> "times(o) === 0"
  assert.deepEqual(owe([...runs, ...runs.slice(0, 1)]), [owed("guard_check.py (1 VERDICT: GREEN)", 2)], "a run doubled");
  // killer: scripts/verifier-tool-ci.mjs:94 SDL "a run that this job does not owe" -> ""
  assert.deepEqual(owe(runs.map((s): Run => [s[0], s[1], s[2], s[3] === 2 ? 1 : s[3]])),
    [owed("binom_check.py (2 VERDICT: GREEN)", 0), "binom_check.py (1 VERDICT: GREEN): a run that this job does not owe"], "D-2 judged on one VERDICT: GREEN line, not two");
  assert.deepEqual([false, true].map((win) => owe(steps("r", "w", win))), [[], []], "today, on both systems: each owed run once, and no other");
  assert.deepEqual([false, true].map((win) => steps("r", "w", win).map(([check, script, args, want]) => [check, script, args.filter((a) => a.startsWith("--")), want])),
    [false, true].map((win) => [["guard_check.py", `${TOOL}/guard_check.py`, [], 1], ["report_check.py", win ? `${TOOL}/report_check.py` : "scripts/verifier-tool-ci-report-check.py", [], 1],
      ["compare_check.py", `${TOOL}/compare_check.py`, [], 1], ["binom_check.py", `${TOOL}/binom_check.py`, ["--registry"], 1], ["binom_check.py", `${TOOL}/binom_check.py`, [], 2],
      ["vectors_check.py", `${TOOL}/vectors_check.py`, [], 0]]),
    "the six runs of steps(), in order, on both systems");
  // killer: scripts/verifier-tool-ci.mjs:54 SDL "join(w, \"vectors.txt\")" -> ""
  assert.deepEqual(runs[5]?.[2], [join("r", ci.VECTORS?.path ?? "?"), join("w", "vectors.txt")], "vectors_check.py reads the pinned spec vectors, its output in the work folder");
});

const GUARD_OUT = ["OK   import-listed: exit 0 (want 0): IMPORTED; NATIVE IS THE MEASURED LIST", "SKIP ntfs-stream: no subject here (none of the modules that the case names, or the working directory on another drive)",
  "cases 43 and the homonyms, skipped 1, failures 0", "VERDICT: GREEN"].join("\n");
// killer: scripts/verifier-tool-ci.mjs:110 CONST "[...skipped].sort().join() !== [...expected].sort().join()" -> "skipped.some((c) => !WINDOWS_ONLY.includes(c))"
test("verifier_tool_driver_names_each_skip_and_refuses_any_other - off Windows guard_check skips exactly WINDOWS_ONLY, each named; on Windows none; an exit, a missing VERDICT: GREEN, a FAIL or RED line: refused", () => {
  assert.deepEqual(WINDOWS_ONLY, ["ntfs-stream"]);
  assert.deepEqual(outputProblems("guard_check.py", GUARD_OUT, 0, 1, false), { problems: [], skipped: ["ntfs-stream"] }, "off Windows: the Windows case skipped and named");
  assert.deepEqual(outputProblems("guard_check.py", GUARD_OUT, 0, 1, true).problems, ["guard_check.py: skipped [ntfs-stream], [] wanted"], "on Windows nothing is skipped");
  const other = GUARD_OUT.replace("SKIP ntfs", "SKIP import-extension-outside-list: no subject here\nSKIP ntfs");
  assert.deepEqual(outputProblems("guard_check.py", other, 0, 1, false).problems, ["guard_check.py: skipped [import-extension-outside-list, ntfs-stream], [ntfs-stream] wanted"]);
  assert.deepEqual(outputProblems("guard_check.py", GUARD_OUT.replace(/^SKIP .*$/m, ""), 0, 1, false).problems, ["guard_check.py: skipped [], [ntfs-stream] wanted"]);
  const noEnd = ["/^failures 0$/", "/^input libm ucrtbase\\.dll sha256 [0-9a-f]{64} bytes \\d+$/"].map((re) => `report_check.py: no line ${re}, which the check's own main writes after its checks`);
  assert.deepEqual(outputProblems("report_check.py", "SKIP x: y\nVERDICT: GREEN", 0, 1, false).problems, ["report_check.py: skipped [x], [] wanted", ...noEnd], "a skip in another check, beside the end of report_check.main that this output lacks");
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

const REPORT_OUT = ["OK   platform: Windows-standin-0.0.0-SP0, standin", "failures 0", "input libm ucrtbase.dll sha256 349a0de7e0e1bf8eecfd1c73916bf171d38927e2e543c106e15df1882612f67a bytes 48",
  "VERDICT: GREEN"].join("\n");
// killer: scripts/verifier-tool-ci.mjs:111 CONST "check === \"report_check.py\" ? REPORT_END : []" -> "[]"
test("verifier_tool_driver_wants_the_end_of_report_check_main - the run of report_check.py must show the lines that only report_check.main writes after its checks, its count of failures and the C library of log that its section 3 read, wanted by the check's name alone; a stand-in that prints VERDICT: GREEN and exits before that main is refused", () => {
  const end = (re: string): string => `report_check.py: no line ${re}, which the check's own main writes after its checks`;
  const FAILURES = end("/^failures 0$/"), LIBM = end("/^input libm ucrtbase\\.dll sha256 [0-9a-f]{64} bytes \\d+$/");
  const report = (out: string, win = false): string[] => outputProblems("report_check.py", out, 0, 1, win).problems; // the arguments main() passes, no more
  // killer: scripts/verifier-tool-ci.mjs:112 CONST "!lines.some(" -> "lines.some("
  assert.deepEqual(report("VERDICT: GREEN"), [FAILURES, LIBM], "a verdict printed before report_check.main ran: refused, by the check's name");
  assert.deepEqual(report(REPORT_OUT), [], "the end of report_check.main, as the job's log shows it");
  // killer: scripts/verifier-tool-ci.mjs:45 CONST "/^failures 0$/, " -> ""
  assert.deepEqual(report(REPORT_OUT.replace("failures 0", "failures 1")), [FAILURES], "a count of failures other than 0");
  assert.deepEqual(report(REPORT_OUT.replace(/ sha256 \w+ /, " sha256 349a0de7 ")), [LIBM], "an input line without a full digest");
  assert.deepEqual([report("VERDICT: GREEN", true), report(REPORT_OUT, true)], [[FAILURES, LIBM], []], "on Windows report_check.py runs as written and ends with the same two lines");
  assert.deepEqual(["guard_check.py", "compare_check.py", "binom_check.py"].map((c) => outputProblems(c, "VERDICT: GREEN", 0, 1, true).problems), [[], [], []],
    "nothing more from the four runs of the tool's own files, whose tree its tree tests pin");
});

// killer: scripts/verifier-tool-ci.mjs:103 CONST "check === \"vectors_check.py\" ? VECTORS : " -> "false ? VECTORS : "
test("verifier_tool_driver_runs_vectors_check_on_the_pinned_spec_vectors - vectors_check.py runs on vectors.json of the public spec repository at one pinned commit, and no check runs unless those bytes are the pinned ones; until R1 is published there, the run on its version of 2026-10-02 must end exactly on the tool's own refusal of the count: another exit, FAIL or VERDICT line, or input is refused", () => {
  const v = ci.VECTORS, bytesOf = ci.vectorsProblems;
  assert.ok(v !== undefined && typeof bytesOf === "function", "the driver pins the spec vectors and checks their bytes");
  assert.deepEqual([v.repository, /^[0-9a-f]{40}$/.test(v.commit), /^[0-9a-f]{64}$/.test(v.sha256)], ["KraidleAI/monark-kata-spec", true, true], "one public repository, one commit, one digest");
  const count = "FAIL [count] 333 conformance checks KATA-SPEC section 6 counts 363", conf = "conformance checks on vectors.json: 333 (KATA-SPEC section 6 counts 363), failures 0";
  const input = `input spec-vectors vectors.json sha256 ${v.sha256} bytes ${v.bytes}`, red = "VERDICT: RED (1 failure(s) over all sections)";
  assert.deepEqual([v.exit, v.end], [1, [count, conf, input, red]], "the version of 2026-10-02: its 333 checks pass, the tool refuses the count, the pinned bytes are read");
  // The run's whole output on the version of 2026-10-02 (counts only, no vector value), as the job's log shows it.
  const OUT = ["claude-opus-5-5", "# vectors_check.py - oracle D-2 (i) - conformance contract KATA-SPEC l.71, version 2026-10-02",
    "info EWMA normalizer 16.632418753824588 (P1 l.107 writes 16.632418753824588): equal", "info kata values bit-identical 86, not bit-identical 0, worst relative gap 0.000e+00", "info ewma_association: the two orders give different doubles on 2 of 2 windows",
    "info factors: 168 slots, 9 without factor, 159 non-null slots bit-identical", "info factors_4h: 42 slots, 0 without factor, 42 non-null slots bit-identical", count,
    "section js_number (extra): 2020 ok, 0 fail", "section js_json (extra): 2 ok, 0 fail", "section kata (vector): 94 ok, 0 fail", "section digest-example (extra): 1 ok, 0 fail", "section digest (vector): 3 ok, 0 fail", "section ewma_association (vector): 4 ok, 0 fail",
    "section bucket-frozen (vector): 7 ok, 0 fail", "section bucket-probe (vector): 13 ok, 0 fail", "section factors-slot-count (vector): 1 ok, 0 fail", "section factors (vector): 168 ok, 0 fail", "section factors_4h-slot-count (vector): 1 ok, 0 fail", "section factors_4h (vector): 42 ok, 0 fail",
    "section lookahead (extra): 14 ok, 0 fail", "section slot (extra): 6 ok, 0 fail", "section grid (extra): 1 ok, 0 fail", "section sections (extra): 1 ok, 0 fail", "section count (extra): 0 ok, 1 fail", conf, input, red, ""].join("\n");
  const sha = (o: string): string => createHash("sha256").update(o).digest("hex"), bytesNot = (o: string): string => `vectors_check.py: output sha256 ${sha(o)}, not the pinned ${v.stdout}: the whole run on the pinned spec vectors`;
  assert.equal(sha(OUT), v.stdout, "the fixture is the run's whole output, whose sha256 the driver pins");
  const judge = (out: string, status: number): string[] => outputProblems("vectors_check.py", out, status, 0, false).problems;
  const once = (l: string, n: number): string => `vectors_check.py: the line "${l}" ${n} time(s), once wanted: the end of the run on the pinned spec vectors`;
  assert.deepEqual(judge(OUT, 1), [], "the end of the run on the pinned vectors, as the job's log shows it");
  assert.deepEqual(judge(OUT, 0), ["vectors_check.py: exit 0, not 1"], "a run that no longer refuses the count");
  const off = "FAIL [factors] slot 3 got 1.0 want 1.5";
  const withOff = OUT.replace(count, `${off}\n${count}`), noCount = OUT.replace(`${count}\n`, ""), twice = `${OUT}${count}\n`;
  assert.deepEqual(judge(withOff, 1), [`vectors_check.py: ${off}`, bytesNot(withOff)], "any other FAIL line");
  assert.deepEqual(judge(noCount, 1), [once(count, 0), bytesNot(noCount)], "the count refused no more");
  // killer: scripts/verifier-tool-ci.mjs:114 CONST "times(e) !== 1" -> "times(e) === 0"
  assert.deepEqual(judge(twice, 1), [once(count, 2), bytesNot(twice)], "a line of the end twice");
  const zero = OUT.replace(v.sha256, "0".repeat(64)), green = OUT.replace(red, "VERDICT: GREEN (0 failure(s) over all sections)");
  assert.deepEqual(judge(zero, 1), [once(input, 0), bytesNot(zero)], "other bytes read");
  assert.deepEqual(judge(green, 1), [once(red, 0), bytesNot(green)], "another verdict");
  // killer: scripts/verifier-tool-ci.mjs:116 CONST "digest !== v.stdout" -> "false"
  const fewer = OUT.replace("section js_number (extra): 2020 ok, 0 fail", "section js_number (extra): 20 ok, 0 fail");
  assert.deepEqual(judge(fewer, 1), [bytesNot(fewer)], "checks of the tool dropped, outside the end: the round trips of js_number");
  assert.deepEqual(bytesOf(null), [`${v.path}: absent; the job checks out ${v.repository} at ${v.commit} there`], "no spec vectors: no check runs");
  // killer: scripts/verifier-tool-ci.mjs:82 CONST "sha256 === VECTORS.sha256 ? [] : " -> "true ? [] : "
  const other = Buffer.from("{}\n"), digest = createHash("sha256").update(other).digest("hex");
  assert.deepEqual(bytesOf(other), [`${v.path}: sha256 ${digest} bytes 3, not the pinned ${v.sha256} bytes ${v.bytes}`], "other bytes: no check runs");
  assert.deepEqual(["guard_check.py", "compare_check.py", "binom_check.py"].map((c) => outputProblems(c, OUT, 1, 1, true).problems.length), [4, 4, 4],
    "the end of vectors_check.py is admitted in no other check: its exit, the missing VERDICT: GREEN, its FAIL line and its verdict refused");
});
