// scripts/verifier-tool-ci.mjs -- VERIFIER-TOOL-CI-1 (docs/G0-lot-verifier-tool-ci-1.md): the frozen verifier tool, tools/kata-recalc/
// (listed as monark-kata-recalc in apps/harness/data/verifiers.json), held by its own Python checks on every pull request, job
// g3-verifier-tool of .github/workflows/ci.yml; the local oracle replays the same line. Node 24, zero dependencies; reads no series.
//   node scripts/verifier-tool-ci.mjs
// Each check runs as `python <FORM> <script> ...`, FORM read from io_guard.py as text (never imported), so the launch follows the tool's
// own form. Green only if: the interpreter is a final CPython 3.14, and the exact version VERIFIER_TOOL_PYTHON names when the job names
// one; every tree of TREES present on disk is one this job runs (a second tree reds until its checks join the job); every *_check.py of
// the tool is run or named in NOT_RUN; each check exits 0 with its VERDICT: GREEN lines, no FAIL and no RED line; and the cases that
// guard_check.py skips are exactly WINDOWS_ONLY off Windows, none on Windows, each named. Off Windows, report_check.py runs through
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
export const NOT_RUN = { "vectors_check.py": "its input, the spec vectors of the frozen revision (R1), is in no repository this job reads" };
/** The runs, in order: the check of the tool it holds, the script run, its arguments, the VERDICT: GREEN lines wanted. */
export const steps = (repo, w, win) => [
  ["guard_check.py", `${TOOL}/guard_check.py`, [repo, join(w, "guard"), join(w, "guard.txt")], 1],
  ["report_check.py", win ? `${TOOL}/report_check.py` : "scripts/verifier-tool-ci-report-check.py", [repo, join(w, "report"), join(w, "report.txt"), ...(win ? [] : [join(w, "libm")])], 1],
  ["compare_check.py", `${TOOL}/compare_check.py`, [join(repo, REGISTRY), join(w, "compare"), join(w, "compare.txt")], 1],
  ["binom_check.py", `${TOOL}/binom_check.py`, ["--registry", join(repo, REGISTRY), join(w, "registry.txt")], 1],
  ["binom_check.py", `${TOOL}/binom_check.py`, [repo, join(w, "binom.txt"), join(w, "hikae.txt")], 2],
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

/** The refusals of the trees (each of TREES with its presence on disk) and of the checks (the *_check.py names of the tool's tree). */
export const accountProblems = (trees, present, checks) => [
  ...trees.filter((t) => present[t] !== (t === TOOL)).map((t) => (t === TOOL ? `${t}: the tool's tree is absent` : `${t}: a tree of the tool that this job does not run`)),
  ...checks.filter((n) => !steps("", "", false).some((s) => s[0] === n) && !(n in NOT_RUN)).map((n) => `${TOOL}/${n}: a check that this job neither runs nor names`),
];

/** The refusals of one run's output: its exit, its VERDICT: GREEN lines, any FAIL or RED line, and its SKIP lines (guard_check.py
 *  only, and only the cases of WINDOWS_ONLY off Windows). */
export const outputProblems = (check, out, status, want, win) => {
  const problems = [], lines = out.split(/\r?\n/);
  if (status !== 0) problems.push(`exit ${status}, not 0`);
  const green = lines.filter((l) => l === "VERDICT: GREEN").length;
  if (green !== want) problems.push(`${green} VERDICT: GREEN line(s), ${want} wanted`);
  problems.push(...lines.filter((l) => l.startsWith("FAIL") || l.startsWith("VERDICT: RED")));
  const skipped = lines.flatMap((l) => /^SKIP ([^:]+):/.exec(l)?.[1] ?? []);
  const expected = check === "guard_check.py" && !win ? WINDOWS_ONLY : [];
  if ([...skipped].sort().join() !== [...expected].sort().join()) problems.push(`skipped [${skipped.join(", ")}], [${expected.join(", ")}] wanted`);
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
    problems.push(...accountProblems(trees, Object.fromEntries(trees.map((t) => [t, existsSync(join(repo, t))])), readdirSync(join(repo, TOOL)).filter((n) => n.endsWith("_check.py"))));
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
  named.push(...Object.entries(NOT_RUN).map(([n, why]) => `not run: ${n}, ${why}`));
  for (const n of named) console.log(`::notice::${n}`);
  try { rmSync(work, { recursive: true, force: true, maxRetries: 3 }); } catch (e) { console.log(`work directory ${work} kept: ${e.message}`); }
  for (const p of problems) console.log(`::error::${p}`);
  console.log(`verifier tool checks under python ${form.join(" ")}: ${problems.length ? `RED, ${problems.length} problem(s)` : "GREEN"}`);
  process.exit(problems.length ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
