// GENKAN - the axiom records under the real pinned toolchain (Lean 4.32.1). Each case builds a temporary tree under os.tmpdir()
// with copies of the three real scripts and a kernel dir: lake.mjs builds the kernel, records.mjs writes the `#print axioms`
// output of main and each theorem, and audit.mjs reads it with --axioms-from. A main that reaches decide's native axiom is
// refused by its record (the word refuses it too); the real kernel passes. It runs in test:genkan only (the file name ends
// .kernel.test.ts, which test and test:main leave out). With ELAN_HOME unset or blank and CI unset or false, every test is
// skipped; with CI set, a missing ELAN_HOME or a home without the pinned lake fails. The temp dir of the wrapper is GENKAN_TMP,
// a dir of the tree, so nothing is written outside it.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";

const SCRIPTS_DIR = fileURLToPath(new URL("../scripts", import.meta.url));
const KERNEL_DIR = fileURLToPath(new URL("../kernel", import.meta.url));
const SCRIPTS = ["records.mjs", "lake.mjs", "audit.mjs"];
const TOOLCHAIN = "leanprover--lean4---v4.32.1";
const LAKE_EXE = process.platform === "win32" ? "lake.exe" : "lake";

/** A non-blank environment value, or undefined. */
const envValue = (name: string): string | undefined => {
  const v = process.env[name];
  return v === undefined || v.trim() === "" ? undefined : v;
};
const ELAN_HOME = envValue("ELAN_HOME");
const CI_VALUE = envValue("CI");
const ON_CI = CI_VALUE !== undefined && CI_VALUE.trim().toLowerCase() !== "false";
const SKIP: string | false =
  ELAN_HOME === undefined && !ON_CI ? "ELAN_HOME is unset and CI is not set: these tests need the pinned Lean 4.32.1 toolchain under ELAN_HOME" : false;
const OPTIONS = { skip: SKIP, timeout: 280_000 };

const TMP = mkdtempSync(join(tmpdir(), "genkan-records-kernel-test-"));
after(() => {
  rmSync(TMP, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
});

const linesOf = (s: string | null): string[] => String(s ?? "").split(/\r?\n/).filter((l) => l.trim() !== "");
const show = (r: SpawnSyncReturns<string>): string =>
  `status=${String(r.status)} signal=${String(r.signal)} error=${r.error?.message ?? "none"}\nstdout:\n${String(r.stdout)}\nstderr:\n${String(r.stderr)}`;

/** The toolchain home, held to the pinned lake: a failure names ELAN_HOME. */
function pinnedHome(): string {
  assert.ok(ELAN_HOME !== undefined, `CI is set (CI=${String(CI_VALUE)}) and ELAN_HOME is not: the kernel tests need ELAN_HOME, the home of the pinned toolchain`);
  const lake = join(ELAN_HOME, "toolchains", TOOLCHAIN, "bin", LAKE_EXE);
  assert.ok(existsSync(lake), `ELAN_HOME=${ELAN_HOME} holds no pinned lake at ${lake}`);
  return ELAN_HOME;
}

/** Copies the files of `from` into `to`, the build dir .lake at its root left out. */
function copyKernel(from: string, to: string, rel = ""): void {
  for (const d of readdirSync(join(from, rel), { withFileTypes: true })) {
    if (rel === "" && d.name === ".lake") continue;
    const r = rel === "" ? d.name : join(rel, d.name);
    if (d.isDirectory()) {
      mkdirSync(join(to, r), { recursive: true });
      copyKernel(from, to, r);
    } else copyFileSync(join(from, r), join(to, r));
  }
}

interface Tree { root: string; scripts: string; kernel: string; tmp: string; out: string }

/** A tree <root>/apps/genkan/{scripts,kernel} with copies of the three real scripts, and a temp dir for the wrapper. */
let trees = 0;
function makeTree(): Tree {
  for (const s of SCRIPTS) assert.ok(existsSync(join(SCRIPTS_DIR, s)), `the script must exist: apps/genkan/scripts/${s}`);
  const root = join(TMP, `tree-${String(++trees)}`);
  const scripts = join(root, "apps", "genkan", "scripts");
  const kernel = join(root, "apps", "genkan", "kernel");
  const tmp = join(root, "tmp");
  for (const d of [scripts, kernel, tmp]) mkdirSync(d, { recursive: true });
  for (const s of SCRIPTS) copyFileSync(join(SCRIPTS_DIR, s), join(scripts, s));
  return { root, scripts, kernel, tmp, out: join(root, "axioms.txt") };
}

/** Builds the tree's kernel, writes its records, audits it with them. Generous bounds, all three well under 300 s. */
function buildRecordAudit(t: Tree, home: string): { records: string; audit: SpawnSyncReturns<string> } {
  const env: NodeJS.ProcessEnv = { ...process.env, ELAN_HOME: home, GENKAN_TMP: t.tmp };
  const node = (script: string, args: string[], timeout: number): SpawnSyncReturns<string> =>
    spawnSync(process.execPath, [join(t.scripts, script), ...args], { env, encoding: "utf8", stdio: "pipe", timeout });
  const b = node("lake.mjs", ["build"], 120_000);
  assert.equal(b.status, 0, `the kernel builds with the pinned lake\n${show(b)}`);
  const r = node("records.mjs", ["--out", t.out], 120_000);
  assert.equal(r.status, 0, `records.mjs writes the records\n${show(r)}`);
  assert.deepEqual(linesOf(r.stdout), [`records: 1 roots, written to ${resolve(t.out)}`], `the success line\n${show(r)}`);
  const records = readFileSync(t.out, "utf8").replace(/\r\n/g, "\n");
  return { records, audit: node("audit.mjs", ["--axioms-from", t.out], 30_000) };
}

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/scripts/audit.mjs:482 SDL "  for (const [name, axioms] of records) for (const a of axioms) if (!ADMITTED_AXIOMS.has(a)) out.push(`${name}: foreign axiom ${a}`);" -> ""
test("records_kernel_refuses_the_planted_native_axiom", OPTIONS, () => {
  const home = pinnedHome();
  const t = makeTree();
  try {
    for (const f of ["lakefile.lean", "lean-toolchain", "lake-manifest.json"]) copyFileSync(join(KERNEL_DIR, f), join(t.kernel, f));
    // The comment keeps `decide +native` on line 2: the audit refuses the word there, and the record the axiom it adds.
    const planted = [
      "-- Planted: main reaches decide's native axiom through a subtype whose proof is decided natively.",
      "def big : { n : Nat // n * n = 100 } := ⟨10, by decide +native⟩",
      "",
      "def main : IO UInt32 := pure (UInt32.ofNat big.val)",
      "",
    ].join("\n");
    writeFileSync(join(t.kernel, "Main.lean"), planted);
    const { records, audit } = buildRecordAudit(t, home);
    assert.equal(records, "'main' depends on axioms: [big._native.decide.ax_1]\n", "main's record names the axiom of decide's native mode");
    assert.equal(audit.status, 1, `the audit refuses the planted kernel\n${show(audit)}`);
    assert.deepEqual(
      linesOf(audit.stderr),
      ["audit: Main.lean:2: banned native", "audit: main: foreign axiom big._native.decide.ax_1"],
      `the word and the record, each refused, and nothing else\n${show(audit)}`,
    );
  } finally {
    rmSync(t.root, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
  }
});

// killer: apps/genkan/scripts/records.mjs:80 CONST "writeFileSync(outAbs, lean.stdout)" -> "writeFileSync(outAbs, lean.stdout.toString(\"utf8\").trim())"
test("records_kernel_passes_the_real_kernel", OPTIONS, () => {
  const home = pinnedHome();
  const t = makeTree();
  try {
    copyKernel(KERNEL_DIR, t.kernel);
    for (const f of ["Main.lean", "lakefile.lean", "lean-toolchain", "lake-manifest.json"]) {
      assert.ok(existsSync(join(t.kernel, f)), `the copy of the real kernel holds ${f}`);
    }
    const { records, audit } = buildRecordAudit(t, home);
    assert.equal(records, "'main' does not depend on any axioms\n", "the real main depends on no axiom");
    assert.equal(audit.status, 0, `the audit passes the real kernel with its records\n${show(audit)}`);
    assert.deepEqual(linesOf(audit.stdout), ["audit: 2 Lean files, 0 theorems, no finding"], `the success line\n${show(audit)}`);
    assert.deepEqual(linesOf(audit.stderr), [], `nothing on stderr\n${show(audit)}`);
  } finally {
    rmSync(t.root, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
  }
});
