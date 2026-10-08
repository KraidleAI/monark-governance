// scripts/verifier-tool-ci.mjs -- VERIFIER-TOOL-CI-1 (docs/G0-lot-verifier-tool-ci-1.md): the frozen verifier tool, tools/kata-recalc/
// (listed as monark-kata-recalc in apps/harness/data/verifiers.json), held by its own Python checks on every pull request, job
// g3-verifier-tool of .github/workflows/ci.yml, CI only (MONARK replays the Windows checks by hand). Node 24, no dependency; no series.
//   node scripts/verifier-tool-ci.mjs
// Each check runs as `python <FORM> <script> ...`, FORM read from io_guard.py as text (never imported), so the launch follows the tool's
// own form. Green only if: the interpreter is a final CPython 3.14, and the exact version VERIFIER_TOOL_PYTHON names when the job names
// one; every tree of TREES present on disk is one this job runs (a second tree reds until its checks join the job); every *_check.py of
// the tool is run or named in NOT_RUN, and each run of OWED (a check in one of its modes) is in steps() once; the spec vectors on disk
// are the bytes VECTORS pins; each check exits 0 with its VERDICT: GREEN lines, no FAIL and no RED line, but vectors_check.py, whose run
// ends exactly as VECTORS writes; the run of report_check.py shows the lines that only its main writes after its checks; and the cases
// that guard_check.py skips are exactly WINDOWS_ONLY off Windows, none on Windows, each named. Off Windows, report_check.py runs through
// scripts/verifier-tool-ci-report-check.py, its section 3 stood in and named. Tests: test/verifier-tool-ci.test.ts.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const TOOL = "tools/kata-recalc";
export const REGISTRY = "apps/harness/data/kata/registry/wave1.json";
/** The cases of guard_check.py that only Windows can run: skipped, and named, everywhere else. */
export const WINDOWS_ONLY = ["ntfs-stream"];
/** The checks of the tool that this job does not run, each with its reason. */
export const NOT_RUN = {};
/** The spec vectors that vectors_check.py reads (VERIFIER-TOOL-CI-VECTORS-1, docs/G0-lot-verifier-tool-ci-vectors-1.md): vectors.json of
 *  the public spec repository at one pinned commit, which the job checks out at `path`; no check runs unless its bytes are these. Until
 *  R1 is published there, it is the version of 2026-10-02: 333 of the 363 checks of R1, no reason_order section, so the tool refuses the
 *  count; `exit`, `end` and `stdout` hold that end exactly: each FAIL and VERDICT line of the run, its count, the input that the tool
 *  read, and the sha256 of the whole output, so that no check of the tool, conformance or not, can leave the run unseen. */
export const VECTORS = {
  repository: "KraidleAI/monark-kata-spec", commit: "ffb5ea33fcdcde2bd497cb25fba184ae2c4bbfa8", path: "kata-spec-vectors/vectors.json",
  sha256: "06ecf06909e39d67d0703f48a71b4975d536dd2dcf6903396e1a10648fbda9fb", bytes: 127681, exit: 1,
  end: ["FAIL [count] 333 conformance checks KATA-SPEC section 6 counts 363", "conformance checks on vectors.json: 333 (KATA-SPEC section 6 counts 363), failures 0",
    "input spec-vectors vectors.json sha256 06ecf06909e39d67d0703f48a71b4975d536dd2dcf6903396e1a10648fbda9fb bytes 127681", "VERDICT: RED (1 failure(s) over all sections)"],
  stdout: "c05f8cc19bcbd3e3b632214ca9c03e0aa6a39e6129d066c11170f1fc9911d66a",
  notice: "vectors_check.py on the public spec vectors of 2026-10-02, 333 of the 363 checks of R1 (no reason_order section): its refusal of the count wanted",
};
/** The runs that this job owes, a closed list: each check of the tool in each of its modes (the options it is given), with the VERDICT:
 *  GREEN lines of that run. steps() must hold each once and no other run, so a check run in two modes cannot lose one unseen. */
const OWED = [["guard_check.py", 1], ["report_check.py", 1], ["compare_check.py", 1], ["binom_check.py --registry", 1], ["binom_check.py", 2], ["vectors_check.py", 0]];
/** The lines that report_check.main alone writes, after its checks: its count of failures, then the input line of the C library of log
 *  that its section 3 read through io_guard (the system's on Windows, the stand-in's off Windows). Off Windows that run passes through a
 *  file outside the tool's tree: a stand-in that prints a verdict and exits before that main is refused for lacking them. */
const REPORT_END = [/^failures 0$/, /^input libm ucrtbase\.dll sha256 [0-9a-f]{64} bytes \d+$/];
/** The runs, in order: the check of the tool it holds, the name by which outputProblems judges its output (its skips, the end of its
 *  main), then the script run, its arguments and the VERDICT: GREEN lines wanted. */
export const steps = (repo, w, win) => [
  ["guard_check.py", `${TOOL}/guard_check.py`, [repo, join(w, "guard"), join(w, "guard.txt")], 1],
  ["report_check.py", win ? `${TOOL}/report_check.py` : "scripts/verifier-tool-ci-report-check.py", [repo, join(w, "report"), join(w, "report.txt"), ...(win ? [] : [join(w, "libm")])], 1],
  ["compare_check.py", `${TOOL}/compare_check.py`, [join(repo, REGISTRY), join(w, "compare"), join(w, "compare.txt")], 1],
  ["binom_check.py", `${TOOL}/binom_check.py`, ["--registry", join(repo, REGISTRY), join(w, "registry.txt")], 1],
  ["binom_check.py", `${TOOL}/binom_check.py`, [repo, join(w, "binom.txt"), join(w, "hikae.txt")], 2],
  ["vectors_check.py", `${TOOL}/vectors_check.py`, [join(repo, VECTORS.path), join(w, "vectors.txt")], 0],
];

const tuple = (text, name) => {
  const lines = text.split(/\r?\n/).filter((l) => new RegExp(`^${name}\\s*=`).test(l));
  const m = lines.length === 1 ? new RegExp(`^${name} = \\(((?:"[^"]+", )*"[^"]+")\\)(?:\\s+#.*)?$`).exec(lines[0]) : null;
  if (m === null) throw new Error(`io_guard.py: ${lines.length} line(s) "${name} = ...", one tuple of strings wanted`);
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
};
/** The launch form of io_guard.py, FORM = ("-E", ...): one-letter options only. */
export const formOf = (text) => {
  const form = tuple(text, "FORM");
  if (!form.every((o) => /^-[A-Za-z]$/.test(o))) throw new Error(`io_guard.py: FORM holds another token than an option: ${form.join(" ")}`);
  return form;
};
/** The closed list of trees of io_guard.py, TREES = ("tools/kata-recalc", ...). */
export const treesOf = (text) => tuple(text, "TREES");

/** The refusals of the interpreter, info = { implementation, version, releaselevel }; pin: the exact version the job names, if any. */
export const interpreterProblems = (info, pin) => [
  ...(info.implementation === "cpython" && info.version.startsWith("3.14.") && info.releaselevel === "final" ? [] : [`not a final CPython 3.14: ${info.implementation} ${info.version} ${info.releaselevel}`]),
  ...(pin === undefined || info.version === pin ? [] : [`CPython ${info.version}, not the pinned ${pin}`]),
];

/** The refusals of the spec vectors on disk, data their bytes (null: absent): unless they are the bytes of VECTORS, no check runs. */
export const vectorsProblems = (data) => {
  if (data === null) return [`${VECTORS.path}: absent; the job checks out ${VECTORS.repository} at ${VECTORS.commit} there`];
  const sha256 = createHash("sha256").update(data).digest("hex");
  return sha256 === VECTORS.sha256 ? [] : [`${VECTORS.path}: sha256 ${sha256} bytes ${data.length}, not the pinned ${VECTORS.sha256} bytes ${VECTORS.bytes}`];
};

/** The refusals of the trees (each of TREES with its presence on disk), of the checks (the *_check.py names of the tool's tree) and of
 *  the runs (those of steps() by default): each run of OWED once, with its count of VERDICT: GREEN lines, and no other run. */
export const accountProblems = (trees, present, checks, runs = steps("", "", false)) => {
  const name = (run, want) => `${run} (${want} VERDICT: GREEN)`, owed = OWED.map(([run, want]) => name(run, want));
  const ran = runs.map(([check, , args, want]) => name([check, ...args.filter((a) => a.startsWith("--"))].join(" "), want)), times = (o) => ran.filter((r) => r === o).length;
  return [
    ...trees.filter((t) => present[t] !== (t === TOOL)).map((t) => (t === TOOL ? `${t}: the tool's tree is absent` : `${t}: a tree of the tool that this job does not run`)),
    ...checks.filter((n) => !runs.some((s) => s[0] === n) && !(n in NOT_RUN)).map((n) => `${TOOL}/${n}: a check that this job neither runs nor names`),
    ...owed.filter((o) => times(o) !== 1).map((o) => `${o}: a run that this job owes once, run ${times(o)} time(s)`),
    ...ran.filter((r) => !owed.includes(r)).map((r) => `${r}: a run that this job does not owe`),
  ];
};

/** The refusals of one run's output: its exit, its VERDICT: GREEN lines, any FAIL or RED line, its SKIP lines (guard_check.py only,
 *  WINDOWS_ONLY off Windows), each line of REPORT_END that none matches (report_check.py only), and for vectors_check.py alone its exit
 *  and FAIL or RED lines as VECTORS writes them, each line of VECTORS.end once and the sha256 of the whole output: all by the check's
 *  name alone. */
export const outputProblems = (check, out, status, want, win) => {
  const problems = [], lines = out.split(/\r?\n/), v = check === "vectors_check.py" ? VECTORS : { exit: 0, end: [] };
  if (status !== v.exit) problems.push(`exit ${status}, not ${v.exit}`);
  const green = lines.filter((l) => l === "VERDICT: GREEN").length;
  if (green !== want) problems.push(`${green} VERDICT: GREEN line(s), ${want} wanted`);
  problems.push(...lines.filter((l) => (l.startsWith("FAIL") || l.startsWith("VERDICT: RED")) && !v.end.includes(l)));
  const skipped = lines.flatMap((l) => /^SKIP ([^:]+):/.exec(l)?.[1] ?? []);
  const expected = check === "guard_check.py" && !win ? WINDOWS_ONLY : [];
  if ([...skipped].sort().join() !== [...expected].sort().join()) problems.push(`skipped [${skipped.join(", ")}], [${expected.join(", ")}] wanted`);
  const ends = check === "report_check.py" ? REPORT_END : [];
  problems.push(...ends.filter((re) => !lines.some((l) => re.test(l))).map((re) => `no line ${re}, which the check's own main writes after its checks`));
  const times = (e) => lines.filter((l) => l === e).length;
  problems.push(...v.end.filter((e) => times(e) !== 1).map((e) => `the line "${e}" ${times(e)} time(s), once wanted: the end of the run on the pinned spec vectors`));
  const digest = v.stdout === undefined ? null : createHash("sha256").update(out).digest("hex");
  if (digest !== null && digest !== v.stdout) problems.push(`output sha256 ${digest}, not the pinned ${v.stdout}: the whole run on the pinned spec vectors`);
  return { problems: problems.map((p) => `${check}: ${p}`), skipped };
};

function main() {
  const repo = resolve(import.meta.dirname, ".."), win = process.platform === "win32", pin = process.env.VERIFIER_TOOL_PYTHON, problems = [];
  if (!win && process.platform !== "linux") problems.push(`a platform this job does not name: ${process.platform}`);
  const py = spawnSync("python", ["-I", "-c", "import sys; print(sys.implementation.name, sys.version.split()[0], sys.version_info.releaselevel); print(sys.version, 'at', sys.executable)"], { encoding: "utf8" });
  const [head = "", full = py.error?.message] = (py.stdout ?? "").split("\n"), [implementation = "", version = "", releaselevel = ""] = head.split(" ");
  console.log(`python: ${full}; pinned by the job: ${pin ?? "none named here"}`);
  problems.push(...interpreterProblems({ implementation, version, releaselevel }, pin));
  let form = [];
  try {
    const guard = readFileSync(join(repo, TOOL, "io_guard.py"), "utf8"), trees = treesOf(guard);
    form = formOf(guard);
    problems.push(...accountProblems(trees, Object.fromEntries(trees.map((t) => [t, existsSync(join(repo, t))])), readdirSync(join(repo, TOOL)).filter((n) => n.endsWith("_check.py")), steps(repo, "", win)));
    problems.push(...vectorsProblems(existsSync(join(repo, VECTORS.path)) ? readFileSync(join(repo, VECTORS.path)) : null));
  } catch (e) {
    problems.push(e.message);
  }
  const work = mkdtempSync(join(tmpdir(), "verifier-tool-ci-")), named = [];
  for (const [check, script, args, want] of problems.length ? [] : steps(repo, work, win)) {
    const t = Date.now(), r = spawnSync("python", [...form, join(repo, script), ...args], { cwd: repo, encoding: "utf8", maxBuffer: 64 << 20, timeout: 300_000 });
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`, judged = outputProblems(check, out, r.status ?? r.signal ?? r.error?.code, want, win);
    console.log(`${out.trimEnd()}\n== ${check}: exit ${r.status}, ${Math.round((Date.now() - t) / 1000)} s (python ${form.join(" ")} ${script})`);
    for (const f of args.filter((a) => a.endsWith(".txt") && existsSync(a))) console.log(`   ${createHash("sha256").update(readFileSync(f)).digest("hex")}  ${f.slice(work.length + 1)}`);
    problems.push(...judged.problems);
    named.push(...judged.skipped.map((c) => `skipped: the case ${c} of guard_check.py (Windows only)`));
  }
  if (!win) named.push("stood in: section 3 of report_check.py, the platform and its C library of log (Windows only)");
  named.push(`spec vectors: ${VECTORS.repository} at ${VECTORS.commit}, ${VECTORS.notice}`);
  named.push(...Object.entries(NOT_RUN).map(([n, why]) => `not run: ${n}, ${why}`));
  for (const n of named) console.log(`::notice::${n}`);
  try { rmSync(work, { recursive: true, force: true, maxRetries: 3 }); } catch (e) { console.log(`work directory ${work} kept: ${e.message}`); }
  for (const p of problems) console.log(`::error::${p}`);
  console.log(`verifier tool checks under python ${form.join(" ")}: ${problems.length ? `RED, ${problems.length} problem(s)` : "GREEN"}`);
  process.exit(problems.length ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
