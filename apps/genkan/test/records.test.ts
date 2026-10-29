// GENKAN - the records writer, driven as a subprocess. records.mjs asks the audit for the roots (`audit.mjs --roots`), writes
// one Lean source on lake's standard input (an import per module, then a `#print axioms` per root) and keeps lake's stdout, byte
// for byte, as the records file; it refuses bad arguments, an output on drive C and a bad root line before lake runs, and writes
// nothing when a child fails. Every case runs in its own tree under os.tmpdir(): a copy of the real records.mjs, the real
// audit.mjs or a fake one, and a fake lake.mjs, each fake recording its argv, its standard input and ELAN_HOME beside itself
// and answering with a canned stdout, stderr and exit code. No Lean runs here (records.kernel.test.ts runs the real one).
// Drive prefixes are joined at run time, so this source carries no literal drive path (the public export refuses one).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { randomBytes } from "node:crypto";

const RECORDS_MJS = fileURLToPath(new URL("../scripts/records.mjs", import.meta.url));
const AUDIT_MJS = fileURLToPath(new URL("../scripts/audit.mjs", import.meta.url));
const IS_WIN = process.platform === "win32";
const UPPER_C = "C" + ":";
const LOWER_C = "c" + ":";

const TMP = mkdtempSync(join(tmpdir(), "genkan-records-test-"));
after(() => {
  rmSync(TMP, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
});

const linesOf = (s: string | null): string[] => String(s ?? "").split(/\r?\n/).filter((l) => l.trim() !== "");
const show = (r: SpawnSyncReturns<string>): string =>
  `status=${String(r.status)} signal=${String(r.signal)} error=${r.error?.message ?? "none"}\nstdout:\n${String(r.stdout)}\nstderr:\n${String(r.stderr)}`;
/** A path as the file system names it, for comparison (win32 ignores case). */
const norm = (p: string): string => {
  const q = realpathSync(p).replace(/\\/g, "/");
  return IS_WIN ? q.toLowerCase() : q;
};

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

/** What a fake child answers: its stdout, its stderr, its exit code; `kill`: it kills itself once its stdout is written. */
interface Answer { stdout: string; stderr?: string; code?: number; kill?: boolean }

/**
 * The source of a fake child named `name` (lake or audit): it writes its argv (<name>-argv.json, its script path first, the
 * marker that it ran), for lake its whole standard input (lake-stdin.bin), and its ELAN_HOME (<name>-env.json) beside itself,
 * then answers. It sets its exit code and ends naturally, which drains a piped stdout (an exit right after a write may cut it).
 */
function fake(name: string, answer: Answer): string {
  const at = (suffix: string): string => `join(here, ${JSON.stringify(`${name}-${suffix}`)})`;
  return [
    'import { readFileSync, writeFileSync } from "node:fs";',
    'import { dirname, join } from "node:path";',
    'import { fileURLToPath } from "node:url";',
    "const here = dirname(fileURLToPath(import.meta.url));",
    `const answer = ${JSON.stringify(answer)};`,
    `writeFileSync(${at("argv.json")}, JSON.stringify(process.argv.slice(1)));`,
    // Only lake is given a standard input: the audit fake never waits on one.
    ...(name === "lake"
      ? [
          "let input;",
          'try { input = readFileSync(0); } catch (e) { input = Buffer.from("<stdin unreadable: " + String(e.code) + ">"); }',
          `writeFileSync(${at("stdin.bin")}, input);`,
        ]
      : []),
    `writeFileSync(${at("env.json")}, JSON.stringify({ ELAN_HOME: process.env.ELAN_HOME ?? null }));`,
    "process.exitCode = answer.code ?? 0;",
    'process.stderr.write(answer.stderr ?? "");',
    'process.stdout.write(Buffer.from(answer.stdout, "utf8"), () => {',
    '  if (answer.kill === true) process.kill(process.pid, "SIGKILL");',
    "});",
    "",
  ].join("\n");
}

interface Tree { root: string; scripts: string; out: string; elan: string }

/**
 * A tree <root>/apps/genkan/{scripts,kernel}: the real records.mjs, the real audit.mjs (or a fake answering `audit`), a fake
 * lake.mjs answering `lake`, and the kernel `files`. `out` is a path in an existing dir of the tree, not yet written; `elan`
 * the ELAN_HOME the runs pass (lake is a fake: nothing is read there).
 */
let trees = 0;
function makeTree(files: Record<string, string>, lake: Answer, audit?: Answer): Tree {
  assert.ok(existsSync(RECORDS_MJS), `the script under test must exist: apps/genkan/scripts/records.mjs (${RECORDS_MJS})`);
  const root = join(TMP, `tree-${String(++trees)}`);
  const scripts = join(root, "apps", "genkan", "scripts");
  const kernel = join(root, "apps", "genkan", "kernel");
  mkdirSync(scripts, { recursive: true });
  mkdirSync(kernel, { recursive: true });
  mkdirSync(join(root, "out"));
  copyFileSync(RECORDS_MJS, join(scripts, "records.mjs"));
  if (audit === undefined) copyFileSync(AUDIT_MJS, join(scripts, "audit.mjs"));
  else writeFileSync(join(scripts, "audit.mjs"), fake("audit", audit));
  writeFileSync(join(scripts, "lake.mjs"), fake("lake", lake));
  for (const [rel, body] of Object.entries(files)) {
    const abs = join(kernel, ...rel.split("/"));
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body);
  }
  return { root, scripts, out: join(root, "out", "axioms.txt"), elan: join(root, "elan-home") };
}

/** records.mjs of the tree, with its ELAN_HOME and no GENKAN_TMP of the parent. */
function records(t: Tree, args: string[], cwd?: string): SpawnSyncReturns<string> {
  const env = envWithout("ELAN_HOME", "GENKAN_TMP");
  env["ELAN_HOME"] = t.elan;
  return run(join(t.scripts, "records.mjs"), args, env, cwd);
}

/** The argv a fake child recorded (its script path first), or null when it never ran. */
function argvOf(t: Tree, name: "lake" | "audit"): string[] | null {
  const f = join(t.scripts, `${name}-argv.json`);
  return existsSync(f) ? (JSON.parse(readFileSync(f, "utf8")) as string[]) : null;
}
const stdinOf = (t: Tree): string => readFileSync(join(t.scripts, "lake-stdin.bin"), "utf8");
const elanOf = (t: Tree): string | null => (JSON.parse(readFileSync(join(t.scripts, "lake-env.json"), "utf8")) as { ELAN_HOME: string | null }).ELAN_HOME;

/** The fake child ran with exactly `args` after the script path, and that path is the tree's own script. */
function assertCalled(t: Tree, name: "lake" | "audit", args: string[], what: string, r: SpawnSyncReturns<string>): void {
  const argv = argvOf(t, name);
  assert.ok(argv !== null, `${what}: ${name}.mjs ran\n${show(r)}`);
  assert.equal(norm(argv[0]!), norm(join(t.scripts, `${name}.mjs`)), `${what}: the ${name}.mjs beside records.mjs ran\n${show(r)}`);
  assert.deepEqual(argv.slice(1), args, `${what}: ${name}.mjs got exactly ${args.join(" ")}\n${show(r)}`);
}

const MAIN = "def main : IO UInt32 := pure 3\n";
const THEOREMS = ["namespace Genkan", "theorem a : True := trivial", "theorem b : True := trivial", "end Genkan", ""].join("\n");
const VECTORS = ["namespace Genkan", "theorem v : True := trivial", "end Genkan", ""].join("\n");
// Two records, one of them wrapped over two lines as Lean wraps a long list, with a CRLF and a LF: kept byte for byte.
const CANNED = "'main' does not depend on any axioms\r\n'Genkan.a' depends on axioms: [propext,\n  Classical.choice]\n";
const OK: Answer = { stdout: CANNED, stderr: "lake: a line on stderr, never in the records\n", code: 0 };
const UNKNOWN = "<stdin>:2:14: error(lean.unknownIdentifier): Unknown constant";

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/scripts/records.mjs:56 SDL "if (lines.at(-1) === \"\") lines.pop();" -> ""
// killer: apps/genkan/scripts/records.mjs:66 CONST "[...new Set(parsed.map((r) => r.module))]" -> "parsed.map((r) => r.module)"
// killer: apps/genkan/scripts/records.mjs:67 CONST ".map((l) => `${l}\\n`).join(\"\")" -> ".join(\"\\n\")"
// killer: apps/genkan/scripts/records.mjs:68 CONST "[LAKE, \"env\", \"lean\", \"--stdin\"]" -> "[LAKE, \"env\", \"lean\"]"
// killer: apps/genkan/scripts/records.mjs:80 CONST "writeFileSync(outAbs, lean.stdout)" -> "writeFileSync(outAbs, lean.stdout.toString(\"utf8\").trim())"
// killer: apps/genkan/scripts/records.mjs:84 CONST "`records: ${String(parsed.length)} roots, written to ${outAbs}\\n`" -> "`records: ${String(modules.length)} roots, written to ${outAbs}\\n`"
test("records_writes_the_records_of_main_and_each_theorem", () => {
  // (1) Main, Theorems (a, b) and Vectors (v), through the real audit's roots: one import per module, a `#print axioms` per
  // root, on lake's standard input; lake runs as `env lean --stdin` with the parent's ELAN_HOME; its stdout is the file.
  const t = makeTree({ "Main.lean": MAIN, "Genkan/Theorems.lean": THEOREMS, "Genkan/Vectors.lean": VECTORS }, OK);
  const r = records(t, ["--out", t.out]);
  assert.equal(r.status, 0, `records.mjs succeeds\n${show(r)}`);
  assertCalled(t, "lake", ["env", "lean", "--stdin"], "the records of Main, Theorems and Vectors", r);
  assert.equal(
    stdinOf(t),
    "import Main\nimport Genkan.Theorems\nimport Genkan.Vectors\n#print axioms main\n#print axioms Genkan.a\n#print axioms Genkan.b\n#print axioms Genkan.v\n",
    `the Lean source on lake's standard input, exactly\n${show(r)}`,
  );
  assert.equal(elanOf(t), t.elan, "ELAN_HOME passes through to lake");
  assert.ok(readFileSync(t.out).equals(Buffer.from(CANNED, "utf8")), `the records file is lake's stdout, byte for byte\n${show(r)}`);
  assert.deepEqual(linesOf(r.stdout), [`records: 4 roots, written to ${resolve(t.out)}`], `the success line, and only it\n${show(r)}`);

  // (2) A kernel with no theorem file: main alone.
  const m = makeTree({ "Main.lean": MAIN, "Genkan/Judge.lean": "def j : Nat := 0\n" }, OK);
  const rm = records(m, ["--out", m.out]);
  assert.equal(rm.status, 0, `records.mjs succeeds on main alone\n${show(rm)}`);
  assert.equal(stdinOf(m), "import Main\n#print axioms main\n", `main alone on lake's standard input\n${show(rm)}`);
  assert.ok(readFileSync(m.out).equals(Buffer.from(CANNED, "utf8")), `the records file is lake's stdout, byte for byte\n${show(rm)}`);
  assert.deepEqual(linesOf(rm.stdout), [`records: 1 roots, written to ${resolve(m.out)}`], `the success line\n${show(rm)}`);

  // (3) Roots whose modules interleave (a fake audit): each module imported once, in order of first appearance, the bare
  // module Genkan included; the roots in their order.
  const roots = "Main main\nGenkan.Vectors Genkan.v\nGenkan Genkan.top\nGenkan.Theorems Genkan.a\nGenkan.Vectors Genkan.w\n";
  const i = makeTree({}, OK, { stdout: roots });
  const ri = records(i, ["--out", i.out]);
  assert.equal(ri.status, 0, `records.mjs succeeds on interleaved modules\n${show(ri)}`);
  assert.equal(
    stdinOf(i),
    "import Main\nimport Genkan.Vectors\nimport Genkan\nimport Genkan.Theorems\n" +
      "#print axioms main\n#print axioms Genkan.v\n#print axioms Genkan.top\n#print axioms Genkan.a\n#print axioms Genkan.w\n",
    `distinct modules in order of first appearance, then the roots in order\n${show(ri)}`,
  );
  assert.deepEqual(linesOf(ri.stdout), [`records: 5 roots, written to ${resolve(i.out)}`], `the success line counts the roots\n${show(ri)}`);

  // (4) A relative --out resolves against the cwd, and the success line names the absolute path.
  const rel = makeTree({ "Main.lean": MAIN }, OK);
  const rr = records(rel, ["--out", "relative-axioms.txt"], rel.root);
  assert.equal(rr.status, 0, `records.mjs succeeds on a relative --out\n${show(rr)}`);
  const written = join(rel.root, "relative-axioms.txt");
  assert.ok(existsSync(written) && readFileSync(written).equals(Buffer.from(CANNED, "utf8")), `the file is written against the cwd\n${show(rr)}`);
  const line = linesOf(rr.stdout);
  const named = /^records: 1 roots, written to (.+)$/.exec(line[0] ?? "")?.[1];
  assert.ok(line.length === 1 && named !== undefined && norm(named) === norm(written), `the success line names the absolute path\n${show(rr)}`);
});

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/scripts/records.mjs:74 COR "lean.error !== undefined || lean.status !== 0" -> "lean.error !== undefined"
// killer: apps/genkan/scripts/records.mjs:75 SDL "    relay(lean.stdout);" -> ""
// killer: apps/genkan/scripts/records.mjs:76 SDL "    relay(lean.stderr);" -> ""
// killer: apps/genkan/scripts/records.mjs:104 SDL "  if (bytes[bytes.length - 1] !== 10) process.stderr.write(\"\\n\");" -> ""
// killer: apps/genkan/scripts/records.mjs:82 CONST "return fail(`records: ${outAbs} unwritable (${String(e.code ?? e.message)})`);" -> "throw e;"
test("records_writes_nothing_when_lean_fails", () => {
  const LAST = (n: string): string => `records: lake.mjs env lean --stdin exited ${n}; no records written`;
  // The failing child's stdout ends without a line break: records.mjs's stderr must still hold it, the child's stderr and its
  // own last line as three separate lines.
  const cases: [string, Answer, string][] = [
    ["lean exits 1 on an unknown constant", { stdout: UNKNOWN, stderr: "lake: a line on stderr of the failed run\n", code: 1 }, "1"],
    ["lake exits 2", { stdout: "", stderr: "lake.mjs: ELAN_HOME is empty; refused\n", code: 2 }, "2"],
  ];
  for (const [what, answer, n] of cases) {
    const t = makeTree({ "Main.lean": MAIN, "Genkan/Theorems.lean": THEOREMS }, answer);
    const r = records(t, ["--out", t.out]);
    assert.equal(r.status, 1, `${what}: records.mjs fails\n${show(r)}`);
    assertCalled(t, "lake", ["env", "lean", "--stdin"], what, r); // non-vacuity: lake did run
    assert.ok(!existsSync(t.out), `${what}: --out is not created\n${show(r)}`);
    const err = linesOf(r.stderr);
    assert.equal(err.at(-1), LAST(n), `${what}: the last stderr line says lake's exit and that no records are written\n${show(r)}`);
    for (const l of [...linesOf(answer.stdout), ...linesOf(answer.stderr ?? "")]) {
      const k = err.indexOf(l);
      assert.ok(k !== -1 && k < err.length - 1, `${what}: the child's output line "${l}" is a stderr line of its own, before the last line\n${show(r)}`);
    }
    assert.ok(!linesOf(r.stdout).some((l) => l.includes("written to")), `${what}: no success line\n${show(r)}`);
  }

  // A lake killed by a signal (win32: the self-kill ends it with code 1): no exit code, or a code that is not 0; nothing
  // written. The contract does not say what <n> reads for a signal.
  const k = makeTree({ "Main.lean": MAIN }, { stdout: `${UNKNOWN}\n`, kill: true });
  const rk = records(k, ["--out", k.out]);
  assert.equal(rk.status, 1, `a killed lake: records.mjs fails\n${show(rk)}`);
  assert.ok(argvOf(k, "lake") !== null, `a killed lake: lake did run\n${show(rk)}`);
  assert.ok(!existsSync(k.out), `a killed lake: --out is not created\n${show(rk)}`);
  assert.match(linesOf(rk.stderr).at(-1) ?? "", /^records: lake\.mjs env lean --stdin exited \S+; no records written$/, `a killed lake: the last line\n${show(rk)}`);

  // Lean succeeds but --out cannot be written (its dir is missing, on this drive): exit 1 with a records: line naming it,
  // never a crash; nothing created.
  const w = makeTree({ "Main.lean": MAIN }, OK);
  const missingOut = join(w.root, "no-such-dir", "axioms.txt");
  const rw = records(w, ["--out", missingOut]);
  assert.equal(rw.status, 1, `an unwritable --out: records.mjs fails\n${show(rw)}`);
  assert.ok(argvOf(w, "lake") !== null, `an unwritable --out: lake did run\n${show(rw)}`);
  assert.equal(linesOf(rw.stderr).at(-1), `records: ${resolve(missingOut)} unwritable (ENOENT)`, `an unwritable --out: the last line names it\n${show(rw)}`);
  assert.ok(!existsSync(dirname(missingOut)), `an unwritable --out: nothing created\n${show(rw)}`);
  assert.ok(!linesOf(rw.stdout).some((l) => l.includes("written to")), `an unwritable --out: no success line\n${show(rw)}`);
});

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/scripts/records.mjs:40 SDL "if (out !== undefined) return usage(\"--out given twice\");" -> ""
// killer: apps/genkan/scripts/records.mjs:42 COR "value === undefined || value.trim() === \"\"" -> "value === undefined"
// killer: apps/genkan/scripts/records.mjs:45 SDL "if (out === undefined) return usage(\"--out <file> is required\");" -> ""
// killer: apps/genkan/scripts/records.mjs:46 SDL "if (onDriveC(out)) return usage(`--out is on C: (${out}); refused`);" -> ""
// killer: apps/genkan/scripts/records.mjs:50 CONST "[AUDIT, \"--roots\"]" -> "[AUDIT]"
// killer: apps/genkan/scripts/records.mjs:51 COR "roots.error !== undefined || roots.status !== 0" -> "roots.error !== undefined"
// killer: apps/genkan/scripts/records.mjs:26 CONST "const ROOT_LINE = /^(\\S+) (\\S+)$/;" -> "const ROOT_LINE = /^(\\S+) (\\S+)/;"
// killer: apps/genkan/scripts/records.mjs:27 CONST "const MODULE = /^(?:Main|Genkan(?:\\.[A-Z][A-Za-z0-9]*)*)$/;" -> "const MODULE = /^\\S+$/;"
// killer: apps/genkan/scripts/records.mjs:63 SDL "if (parsed.length === 0) return fail(\"records: audit.mjs --roots named no root\");" -> ""
// killer: apps/genkan/scripts/records.mjs:109 CONST "return String(r.status ?? r.signal" -> "return String(1 ?? r.signal"
// killer: apps/genkan/scripts/records.mjs:52 SDL "    relay(roots.stderr);" -> ""
// killer: apps/genkan/scripts/records.mjs:60 COR " || !NAME.test(m[2])" -> ""
// killer: apps/genkan/scripts/records.mjs:28 CONST "const NAME = /^[A-Za-z_][A-Za-z0-9_']*(?:\\.[A-Za-z_][A-Za-z0-9_']*)*$/;" -> "const NAME = /^[^\\s#]+$/;"
// killer: apps/genkan/scripts/records.mjs:28 CONST "(?:\\.[A-Za-z_][A-Za-z0-9_']*)*$/;" -> "(?:\\.[A-Za-z0-9_']*)*$/;"
// killer: apps/genkan/scripts/records.mjs:39 SDL "if (argv[k] !== \"--out\") return usage(`unknown argument ${argv[k]}`);" -> ""
// killer: apps/genkan/scripts/records.mjs:114 CONST "ON_C.test(value) || ON_C.test(value.trim())" -> "ON_C.test(value)"
// killer: apps/genkan/scripts/records.mjs:115 CONST "return IS_WIN && ON_C.test(path.win32.resolve(value));" -> "return false;"
test("records_refuses_bad_arguments_and_bad_roots", () => {
  // (1) Usage errors: exit 2, every stderr line `records: ...`, nothing written, no child run. The fake audit would fail (exit
  // 3) if it ran, so a missed refusal never writes. On drive C only paths whose parent dir does not exist: a records.mjs that
  // dropped the refusal still could not write there (a write into a missing dir fails). One case alone runs with its cwd on C
  // (the root of the drive, read only), on win32 only, below.
  const t = makeTree({ "Main.lean": MAIN }, OK, { stdout: "", stderr: "audit: the fake audit ran\n", code: 3 });
  const never = `genkan-no-such-dir-${randomBytes(6).toString("hex")}`;
  const usage: [string, string[], string?][] = [
    ["no argument", []],
    ["--out without a value", ["--out"]],
    ["--out empty", ["--out", ""]],
    ["--out twice", ["--out", t.out, "--out", t.out]],
    ["an unknown argument after --out", ["--out", t.out, "--bogus"]],
    ["a word before --out", ["x", "--out", t.out]],
    ["--out on C, backslashes", ["--out", `${UPPER_C}\\${never}\\axioms.txt`]],
    ["--out on C, forward slashes", ["--out", `${UPPER_C}/${never}/axioms.txt`]],
    ["--out on c, lower case", ["--out", `${LOWER_C}/${never}/axioms.txt`]],
    // An unknown flag followed by a value: refused as unknown, never read as --out.
    ["an unknown flag with a value", ["--bogus", t.out]],
    // Judged once trimmed: a leading space does not hide drive C.
    ["--out on C after a leading space", ["--out", ` ${UPPER_C}/${never}/axioms.txt`]],
  ];
  // A relative --out resolves against the cwd: from the root of drive C it is on C. Only win32 has drive letters (IS_WIN), so
  // the case runs there alone. The cwd is only read: the --out names a dir that does not exist, and the fake audit exits 3.
  if (IS_WIN) usage.push(["a relative --out from the root of drive C", ["--out", `${never}/axioms.txt`], `${UPPER_C}\\`]);
  for (const [what, args, cwd] of usage) {
    const r = records(t, args, cwd);
    assert.equal(r.status, 2, `${what}: a usage error\n${show(r)}`);
    const err = linesOf(r.stderr);
    assert.ok(err.length > 0 && err.every((l) => l.startsWith("records: ")), `${what}: stderr lines starting "records: "\n${show(r)}`);
    assert.equal(argvOf(t, "audit"), null, `${what}: the audit never ran\n${show(r)}`);
    assert.equal(argvOf(t, "lake"), null, `${what}: lake never ran\n${show(r)}`);
    assert.ok(!existsSync(t.out), `${what}: nothing written\n${show(r)}`);
  }
  assert.ok(!existsSync(`${UPPER_C}/${never}`), "nothing is created on drive C");

  // (2) The audit exits 2: its stderr and the exit on records.mjs's stderr, exit 1, lake never run, nothing written.
  const a = makeTree({}, OK, { stdout: "", stderr: "audit: kernel dir unreadable (planted)\n", code: 2 });
  const ra = records(a, ["--out", a.out]);
  assert.equal(ra.status, 1, `the audit exits 2: records.mjs fails\n${show(ra)}`);
  assertCalled(a, "audit", ["--roots"], "the audit that exits 2", ra);
  const errA = linesOf(ra.stderr);
  assert.ok(errA.includes("audit: kernel dir unreadable (planted)"), `the audit's stderr is carried\n${show(ra)}`);
  assert.ok(errA.includes("records: audit.mjs --roots exited 2"), `the audit's exit is named\n${show(ra)}`);
  assert.equal(argvOf(a, "lake"), null, `the audit failed: lake never ran\n${show(ra)}`);
  assert.ok(!existsSync(a.out), `the audit failed: nothing written\n${show(ra)}`);

  // (3) Bad root lines (the audit exits 0): exit 1, a `records: ` line on stderr, lake never run, nothing written.
  const bad: [string, string][] = [
    ["three fields", "Main main\nGenkan.Theorems Genkan.a extra\n"],
    ["one field", "Main\n"],
    ["a foreign module", "Main main\nLean.Elab x\n"],
    ["a module with a lower-case component", "Main main\nGenkan.theorems Genkan.a\n"],
    ["a guillemet module", "Main main\nGenkan.«Judge» Genkan.j\n"],
    ["a tab", "Main\tmain\n"],
    ["two spaces", "Main  main\n"],
    ["a leading space", " Main main\n"],
    ["a trailing space", "Main main \n"],
    ["a carriage return", "Main main\r\n"],
    ["an empty output", ""],
    // A root's name must be plain (dotted components, each [A-Za-z_][A-Za-z0-9_']*): a guillemet name may hold a line break,
    // and nothing else judges what reaches Lean.
    ["a guillemet component in the name", "Main Genkan.«a»\n"],
    ["a # in the name", "Main x#eval(IO.println(1))\n"],
    ["a non-ASCII letter in the name", "Main Genkan.α\n"],
    ["an empty component in the name", "Main Genkan..a\n"],
    ["a trailing dot in the name", "Main Genkan.\n"],
    ["a leading digit in the name", "Main 1a\n"],
  ];
  for (const [what, roots] of bad) {
    const b = makeTree({ "Main.lean": MAIN }, OK, { stdout: roots });
    const rb = records(b, ["--out", b.out]);
    assert.equal(rb.status, 1, `${what}: a bad root line fails records.mjs\n${show(rb)}`);
    assertCalled(b, "audit", ["--roots"], what, rb);
    assert.ok(linesOf(rb.stderr).some((l) => l.startsWith("records: ")), `${what}: a records: line on stderr\n${show(rb)}`);
    assert.equal(argvOf(b, "lake"), null, `${what}: lake never ran\n${show(rb)}`);
    assert.ok(!existsSync(b.out), `${what}: nothing written\n${show(rb)}`);
  }

  // (4) The audit is the one beside records.mjs, called with exactly `--roots` (no --kernel: both default to ../kernel).
  // Its argv is seen through a fake that records it and prints a valid root.
  const g = makeTree({ "Main.lean": MAIN }, OK, { stdout: "Main main\n" });
  const rg = records(g, ["--out", g.out]);
  assert.equal(rg.status, 0, `records.mjs succeeds on a valid root\n${show(rg)}`);
  assertCalled(g, "audit", ["--roots"], "the audit", rg);
  assert.equal(stdinOf(g), "import Main\n#print axioms main\n", `main's record asked for\n${show(rg)}`);

  // (5) A prime and an underscore are plain: the name passes, and reaches lake's input as it is.
  const p = makeTree({ "Main.lean": MAIN }, OK, { stdout: "Main main\nGenkan.Theorems Genkan.a_b'\n" });
  const rp = records(p, ["--out", p.out]);
  assert.equal(rp.status, 0, `records.mjs succeeds on a plain name with a prime and an underscore\n${show(rp)}`);
  assert.equal(stdinOf(p), "import Main\nimport Genkan.Theorems\n#print axioms main\n#print axioms Genkan.a_b'\n", `the name on lake's input\n${show(rp)}`);
});
