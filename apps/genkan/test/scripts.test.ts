// GENKAN - the lake wrapper, driven as a subprocess. It refuses a toolchain home that is empty, on drive C or without the
// pinned lake, and a temp dir that is on drive C or missing, before it spawns anything; otherwise it runs that lake, never
// elan and never a PATH lookup, in the kernel dir with TMP, TEMP and TMPDIR set, and exits with lake's code. A stand-in
// lake (a copy of this node binary) proves the run without any Lean toolchain. Every case runs under os.tmpdir().
// Drive prefixes are joined at run time, so this source carries no literal drive path (the public export refuses one).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, copyFileSync, existsSync, mkdtempSync, mkdirSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, win32 } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";

const LAKE_MJS = fileURLToPath(new URL("../scripts/lake.mjs", import.meta.url));
const KERNEL_DIR = fileURLToPath(new URL("../kernel", import.meta.url));
const TOOLCHAIN = "leanprover--lean4---v4.32.1";
const IS_WIN = process.platform === "win32";
const LAKE_EXE = IS_WIN ? "lake.exe" : "lake";
const UPPER_C = "C" + ":";
const LOWER_C = "c" + ":";
const C_ROOT = UPPER_C + "\\";

const TMP = mkdtempSync(join(tmpdir(), "genkan-scripts-test-"));
after(() => {
  rmSync(TMP, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
});

const toPosix = (p: string): string => p.replace(/\\/g, "/");
const linesOf = (s: string | null): string[] => String(s ?? "").split(/\r?\n/).filter((l) => l.trim() !== "");
const show = (r: SpawnSyncReturns<string>): string =>
  `status=${String(r.status)} signal=${String(r.signal)} error=${r.error?.message ?? "none"}\nstdout:\n${String(r.stdout)}\nstderr:\n${String(r.stderr)}`;

/** A copy of the parent environment without `names`, in any letter case (win32 keys are case-insensitive). */
function envWithout(...names: string[]): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  const drop = new Set(names.map((n) => n.toUpperCase()));
  for (const k of Object.keys(env)) if (drop.has(k.toUpperCase())) delete env[k];
  return env;
}

function run(script: string, args: string[], env: NodeJS.ProcessEnv, cwd?: string): SpawnSyncReturns<string> {
  return spawnSync(process.execPath, [script, ...args], { env, encoding: "utf8", stdio: "pipe", timeout: 30_000, ...(cwd === undefined ? {} : { cwd }) });
}

// ---- lake wrapper helpers -------------------------------------------------------------------------------------------

/** The wrapper's environment: ELAN_HOME (or none) and GENKAN_TMP, whatever the parent carries. */
function lakeEnv(elanHome: string | undefined, genkanTmp: string): NodeJS.ProcessEnv {
  const env = envWithout("ELAN_HOME", "GENKAN_TMP");
  env["GENKAN_TMP"] = genkanTmp;
  if (elanHome !== undefined) env["ELAN_HOME"] = elanHome;
  return env;
}

/** A toolchain home under TMP whose pinned lake is an empty file, or a copy of this node binary. */
let homes = 0;
function fakeHome(kind: "empty" | "node"): { home: string; lake: string } {
  const home = join(TMP, `elan-${String(++homes)}`);
  const bin = join(home, "toolchains", TOOLCHAIN, "bin");
  mkdirSync(bin, { recursive: true });
  const lake = join(bin, LAKE_EXE);
  if (kind === "empty") writeFileSync(lake, "");
  else {
    copyFileSync(process.execPath, lake);
    if (!IS_WIN) chmodSync(lake, 0o755);
  }
  return { home, lake };
}

/** A refusal: exit 2, nothing on stdout, exactly one `lake.mjs: ` line on stderr, returned. */
function refusal(r: SpawnSyncReturns<string>, what: string): string {
  assert.equal(r.status, 2, `${what}: the wrapper must refuse with exit 2\n${show(r)}`);
  assert.equal(String(r.stdout), "", `${what}: nothing on stdout\n${show(r)}`);
  const own = linesOf(r.stderr).filter((l) => l.startsWith("lake.mjs: "));
  assert.equal(own.length, 1, `${what}: exactly one refusal line on stderr\n${show(r)}`);
  return own[0]!;
}

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/scripts/lake.mjs:22 CONST "/^[cC]:/" -> "/^[C]:/"
test("lake_wrapper_refuses_elan_home_on_c", () => {
  const okTmp = join(TMP, "lake-tmp");
  mkdirSync(okTmp, { recursive: true });
  const lake = (env: NodeJS.ProcessEnv, what: string, cwd?: string): string => refusal(run(LAKE_MJS, ["--version"], env, cwd), what);

  // (1) ELAN_HOME on drive C: both letter cases, both separators, and drive-relative; refused before any lake is looked for.
  for (const value of [`${UPPER_C}\\Users\\nobody\\.elan`, `${LOWER_C}/elan`, `${UPPER_C}/elan`, `${UPPER_C}elan`]) {
    const line = lake(lakeEnv(value, okTmp), `ELAN_HOME=${value}`);
    assert.equal(line, `lake.mjs: ELAN_HOME is on C: (${value}); refused`, `ELAN_HOME=${value}: the refusal names the value`);
  }
  // A relative ELAN_HOME resolves against the cwd: from the root of drive C it is on C. The child only reads there.
  if (IS_WIN) {
    const rel = "genkan-relative-elan";
    assert.equal(lake(lakeEnv(rel, okTmp), "relative ELAN_HOME from the C root", C_ROOT), `lake.mjs: ELAN_HOME is on C: (${rel}); refused`);
  }

  // (2) ELAN_HOME empty, blank and absent. On win32 an empty value may reach the child as unset; both refuse alike.
  for (const [what, value] of [["ELAN_HOME empty", ""], ["ELAN_HOME blank", "   "], ["ELAN_HOME unset", undefined]] as const) {
    assert.equal(lake(lakeEnv(value, okTmp), what), "lake.mjs: ELAN_HOME is empty; refused", what);
  }

  // (3) ELAN_HOME an existing directory off drive C that holds no toolchain: refused, naming the exact binary it looked for.
  const emptyHome = mkdtempSync(join(TMP, "elan-empty-"));
  const expected = toPosix(join(emptyHome, "toolchains", TOOLCHAIN, "bin", LAKE_EXE));
  assert.equal(toPosix(lake(lakeEnv(emptyHome, okTmp), "ELAN_HOME without a toolchain")), `lake.mjs: no lake at ${expected}; refused`);

  // From here the home holds a lake file (empty: it cannot run), so the temp dir decides.
  const { home } = fakeHome("empty");

  // (4) The temp dir on drive C, absolute or relative to a C cwd: refused, and nothing is created there.
  const cTmp = `${UPPER_C}\\genkan-never`;
  assert.equal(lake(lakeEnv(home, cTmp), "GENKAN_TMP on C"), `lake.mjs: temp dir is on C: (${cTmp}); refused`);
  assert.ok(!existsSync(cTmp), "the wrapper creates no temp dir on C");
  if (IS_WIN) {
    const relTmp = "genkan-relative-tmp";
    assert.equal(lake(lakeEnv(home, relTmp), "relative GENKAN_TMP from the C root", C_ROOT), `lake.mjs: temp dir is on C: (${relTmp}); refused`);
    assert.ok(!existsSync(join(C_ROOT, relTmp)), "the wrapper creates no relative temp dir on C");
  }

  // (5) The temp dir missing, or a file: refused; the wrapper creates, writes and deletes nothing.
  const missing = join(TMP, "lake-tmp-missing");
  assert.equal(toPosix(lake(lakeEnv(home, missing), "GENKAN_TMP missing")), `lake.mjs: temp dir missing (${toPosix(missing)}); refused`);
  assert.ok(!existsSync(missing), "the wrapper does not create the missing temp dir");
  const file = join(TMP, "lake-tmp-file");
  writeFileSync(file, "not a dir\n");
  assert.equal(toPosix(lake(lakeEnv(home, file), "GENKAN_TMP a file")), `lake.mjs: temp dir missing (${toPosix(file)}); refused`);
  assert.ok(statSync(file).isFile(), "the file named by GENKAN_TMP is left as it was");

  // (6) Every check passes but the lake file cannot run: refused with the spawn error, never a silent exit.
  const line = lake(lakeEnv(home, okTmp), "an empty lake file");
  assert.match(line, /^lake\.mjs: lake did not run \(.+\); refused$/, "the refusal names why lake did not run");
});

// killer: apps/genkan/scripts/lake.mjs:73 SDL "cwd: KERNEL_DIR, " -> ""
test("lake_wrapper_runs_pinned_lake", () => {
  const { home, lake } = fakeHome("node");
  const runTmp = join(TMP, "lake-run-tmp");
  mkdirSync(runTmp, { recursive: true });
  try {
    // No PATH at all: the wrapper must spawn the pinned binary by its path. SystemRoot stays (win32 needs it).
    const env = lakeEnv(home, runTmp);
    for (const k of Object.keys(env)) if (k.toUpperCase() === "PATH") delete env[k];
    const js = "console.log(JSON.stringify({ cwd: process.cwd(), TMP: process.env['TMP'], TEMP: process.env['TEMP'], TMPDIR: process.env['TMPDIR'], argv: process.argv.slice(1) })); process.exit(7);";
    const r = run(LAKE_MJS, ["-e", js, "argA", "argB"], env);
    assert.equal(r.status, 7, `the wrapper exits with lake's code\n${show(r)}`);
    const out = linesOf(r.stdout);
    assert.equal(out.length, 1, `lake's one stdout line reaches the caller\n${show(r)}`);
    const seen = JSON.parse(out[0]!) as { cwd: string; TMP?: string; TEMP?: string; TMPDIR?: string; argv: string[] };
    const norm = (p: string): string => {
      const q = toPosix(realpathSync(p));
      return IS_WIN ? q.toLowerCase() : q;
    };
    assert.equal(norm(seen.cwd), norm(KERNEL_DIR), "lake runs in apps/genkan/kernel, resolved from the script's location");
    assert.deepEqual([seen.TMP, seen.TEMP, seen.TMPDIR], [runTmp, runTmp, runTmp], "TMP, TEMP and TMPDIR are the temp dir");
    assert.deepEqual(seen.argv, ["argA", "argB"], "the arguments reach lake unchanged");

    // Without GENKAN_TMP the temp dir is the default: the F-drive tmp\genkan on win32, else <RUNNER_TEMP or the OS temp
    // dir>/genkan. It must exist (the wrapper never creates it): made here if missing, and removed at the end if so.
    const rt = process.env["RUNNER_TEMP"];
    const dflt = resolve(IS_WIN ? win32.join("F" + ":", "tmp", "genkan") : join(rt !== undefined && rt.trim() !== "" ? rt : tmpdir(), "genkan"));
    const made = !existsSync(dflt);
    if (made) mkdirSync(dflt, { recursive: true });
    try {
      const env2 = envWithout("ELAN_HOME", "GENKAN_TMP", "PATH");
      env2["ELAN_HOME"] = home;
      const d = run(LAKE_MJS, ["-e", js], env2);
      assert.equal(d.status, 7, `the wrapper runs with the default temp dir\n${show(d)}`);
      const seen2 = JSON.parse(linesOf(d.stdout)[0] ?? "{}") as { TMP?: string };
      assert.equal(seen2.TMP, dflt, "without GENKAN_TMP, TMP is the default temp dir");
    } finally {
      if (made) rmSync(dflt, { recursive: true, force: true });
    }

    // A lake that ends on a signal has no exit code: refused, naming the signal.
    if (!IS_WIN) {
      const k = run(LAKE_MJS, ["-e", "process.kill(process.pid, 'SIGKILL')"], env);
      assert.equal(refusal(k, "a lake killed by SIGKILL"), "lake.mjs: lake did not run (SIGKILL); refused");
    }
  } finally {
    rmSync(lake, { force: true, maxRetries: 10, retryDelay: 500 });
  }
});
