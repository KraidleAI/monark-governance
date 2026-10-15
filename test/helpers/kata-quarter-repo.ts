// test/helpers/kata-quarter-repo.ts -- CM-5, the quarter counts tool (docs/G0-lot-cm5-c1a.md): one temporary git repository per test
// file, under os.tmpdir(), holding a copy of tools/kata-recalc/ and tools/kata-quarter/ taken from the working tree (regular files only:
// no link, no __pycache__), committed once. Every launch of the tool in a test runs from it, under the FORM of io_guard.py (read as text,
// as scripts/verifier-tool-ci.mjs reads it), and none of the caller's GIT_* variables in git nor in the tool (TEST-GIT-ENV-ISOLATION-1).
// The interpreter: the path in KATA_QUARTER_PYTHON, which the driver of the job g3-verifier-tool sets to the pinned CPython it probed;
// unset (a run by hand), the `python` of PATH, else `python3`. The tool holds both folders to the blobs of that commit in the run itself
// (docs/G0-lot-cm5-c1d.md): a stand-in of a module is committed in a repository of its own (`change`, applied before the commit). The
// repository is the place the tool runs from, never the repository under test. Removed at exit. The tool's stdout and stderr are
// read by lines and joined with LF (linesOf: Python writes CR LF on Windows), so a test matches one text on every platform.
import { spawnSync } from "node:child_process";
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as driver from "../../scripts/verifier-tool-ci.mjs";

/** The lines of a text, CR LF or LF: linesOf of the driver (its declarations, scripts/verifier-tool-ci.d.mts, do not name it yet). */
export const { linesOf } = driver as unknown as { linesOf: (text: string) => string[] };
const { formOf } = driver;

/** The two trees of io_guard's closed list, the frozen tool first. */
export const TREES = ["tools/kata-recalc", "tools/kata-quarter"] as const;
export const ENTRY = "quarter_counts.py";
const BARE: NodeJS.ProcessEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_")));
export type Run = { status: number | null; stdout: string; stderr: string };
export type ToolRepo = {
  dir: string; python: string; form: string[];
  /** python <FORM> <script> <args>, from the repository, the caller's GIT_* variables stripped; o.form, o.env: another launch. */
  launch: (script: string, args: string[], o?: { form?: string[]; env?: NodeJS.ProcessEnv }) => Run;
  /** The entry script of the copy, tools/kata-quarter/quarter_counts.py, with args. */
  run: (args: string[]) => Run;
};

/** git in dir, the caller's GIT_* variables stripped, a test identity; a failure throws. */
export function git(dir: string, args: string[]): void {
  const r = spawnSync("git", ["-C", dir, "-c", "user.name=kata-quarter test", "-c", "user.email=test@localhost", ...args], { env: BARE, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed (fail-closed): ${String(r.error ?? r.stderr)}`);
}

/** The temporary repository: the two trees copied from `root` (the repository under test), `change` applied to the copy, one commit. */
export function toolRepo(root: string, change: (dir: string) => void = () => undefined): ToolRepo {
  const dir = mkdtempSync(join(tmpdir(), "kata-quarter-repo-"));
  process.on("exit", () => { try { rmSync(dir, { recursive: true, force: true, maxRetries: 3 }); } catch { /* a folder left in tmp */ } });
  for (const tree of TREES) {
    const src = join(root, tree), dst = join(dir, tree);
    mkdirSync(dst, { recursive: true });
    for (const n of readdirSync(src)) if (lstatSync(join(src, n)).isFile()) copyFileSync(join(src, n), join(dst, n));
  }
  change(dir);
  git(dir, ["init", "-q"]);
  git(dir, ["add", "--", "tools"]);
  git(dir, ["commit", "-q", "-m", "the two trees of the tool under test"]);
  const form = formOf(readFileSync(join(dir, TREES[0], "io_guard.py"), "utf8"));
  const python = process.env.KATA_QUARTER_PYTHON || (["python", "python3"].find((p) => spawnSync(p, ["-c", "0"], { env: BARE }).status === 0) ?? "python");
  const launch = (script: string, args: string[], o: { form?: string[]; env?: NodeJS.ProcessEnv } = {}): Run => {
    const r = spawnSync(python, [...(o.form ?? form), script, ...args], { cwd: dir, env: { ...BARE, ...o.env }, encoding: "utf8", maxBuffer: 1 << 26, timeout: 120_000 });
    return { status: r.status, stdout: linesOf(r.stdout ?? "").join("\n"), stderr: linesOf(r.stderr ?? String(r.error ?? "")).join("\n") };
  };
  return { dir, python, form, launch, run: (args) => launch(join(dir, TREES[1], ENTRY), args) };
}
