// GENKAN - the records writer, driven as a subprocess. records.mjs asks the audit for the roots (`audit.mjs --roots`), writes
// one Lean source on lake's standard input (an import per module, then a `#print axioms` per root) and keeps lake's stdout, byte
// for byte, as the records file; it refuses bad arguments, an output on drive C and a bad root line before lake runs, and writes
// nothing when a child fails. With --replay it asks the audit for the modules (`audit.mjs --modules`), refuses a module line
// that is not plain before any Lean runs, then runs `lake.mjs env leanchecker <module>` once per module, in order, relaying
// what each prints to stderr and stopping at the first that does not exit 0; it writes no file. Every case runs in its own
// tree under os.tmpdir(): a copy of the real records.mjs, the real audit.mjs or a fake one, and a fake lake.mjs, each fake
// recording its argv, its standard input and ELAN_HOME beside itself, the last call alone and every call in order, and
// answering with a canned stdout, stderr and exit code, which may depend on the last word of its argv. No Lean runs here
// (records.kernel.test.ts runs the real one).
// Drive prefixes are joined at run time, so this source carries no literal drive path (the public export refuses one).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
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
/** Answers that depend on the call: the answer of the last word of its argv when the map has one, else `otherwise`. */
interface Answers { byLastWord: Record<string, Answer>; otherwise: Answer }
const isAnswers = (a: Answer | Answers): a is Answers => "byLastWord" in a;

/**
 * The source of a fake child named `name` (lake or audit): it writes its argv (<name>-argv.json, its script path first, the
 * marker that it ran), for lake its whole standard input (lake-stdin.bin), and its ELAN_HOME (<name>-env.json) beside itself,
 * appends the call (argv after the script path, standard input, ELAN_HOME) as one JSON line to <name>-calls.jsonl, then
 * answers. It sets its exit code and ends naturally, which drains a piped stdout (an exit right after a write may cut it).
 */
function fake(name: string, answer: Answer | Answers): string {
  const at = (suffix: string): string => `join(here, ${JSON.stringify(`${name}-${suffix}`)})`;
  const answers: Answers = isAnswers(answer) ? answer : { byLastWord: {}, otherwise: answer };
  return [
    'import { appendFileSync, readFileSync, writeFileSync } from "node:fs";',
    'import { dirname, join } from "node:path";',
    'import { fileURLToPath } from "node:url";',
    "const here = dirname(fileURLToPath(import.meta.url));",
    `const answers = ${JSON.stringify(answers)};`,
    "const last = process.argv.at(-1);",
    "const answer = Object.hasOwn(answers.byLastWord, last) ? answers.byLastWord[last] : answers.otherwise;",
    `writeFileSync(${at("argv.json")}, JSON.stringify(process.argv.slice(1)));`,
    // Only lake is given a standard input: the audit fake never waits on one.
    "let input = null;",
    ...(name === "lake"
      ? [
          'try { input = readFileSync(0); } catch (e) { input = Buffer.from("<stdin unreadable: " + String(e.code) + ">"); }',
          `writeFileSync(${at("stdin.bin")}, input);`,
        ]
      : []),
    `writeFileSync(${at("env.json")}, JSON.stringify({ ELAN_HOME: process.env.ELAN_HOME ?? null }));`,
    `appendFileSync(${at("calls.jsonl")}, JSON.stringify({ argv: process.argv.slice(2), stdin: input === null ? null : input.toString("utf8"), ELAN_HOME: process.env.ELAN_HOME ?? null }) + "\\n");`,
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
function makeTree(files: Record<string, string>, lake: Answer | Answers, audit?: Answer | Answers): Tree {
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
/** Every call of a fake child, in order (none when it never ran). */
interface Call { argv: string[]; stdin: string | null; ELAN_HOME: string | null }
function callsOf(t: Tree, name: "lake" | "audit"): Call[] {
  const f = join(t.scripts, `${name}-calls.jsonl`);
  if (!existsSync(f)) return [];
  return readFileSync(f, "utf8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as Call);
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

// killer: apps/genkan/scripts/records.mjs:70 SDL "if (lines.at(-1) === \"\") lines.pop();" -> ""
// killer: apps/genkan/scripts/records.mjs:80 CONST "[...new Set(parsed.map((r) => r.module))]" -> "parsed.map((r) => r.module)"
// killer: apps/genkan/scripts/records.mjs:81 CONST ".map((l) => `${l}\\n`).join(\"\")" -> ".join(\"\\n\")"
// killer: apps/genkan/scripts/records.mjs:82 CONST "[LAKE, \"env\", \"lean\", \"--stdin\"]" -> "[LAKE, \"env\", \"lean\"]"
// killer: apps/genkan/scripts/records.mjs:94 CONST "writeFileSync(outAbs, lean.stdout)" -> "writeFileSync(outAbs, lean.stdout.toString(\"utf8\").trim())"
// killer: apps/genkan/scripts/records.mjs:98 CONST "`records: ${String(parsed.length)} roots, written to ${outAbs}\\n`" -> "`records: ${String(modules.length)} roots, written to ${outAbs}\\n`"
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

// killer: apps/genkan/scripts/records.mjs:88 COR "lean.error !== undefined || lean.status !== 0" -> "lean.error !== undefined"
// killer: apps/genkan/scripts/records.mjs:89 SDL "    relay(lean.stdout);" -> ""
// killer: apps/genkan/scripts/records.mjs:90 SDL "    relay(lean.stderr);" -> ""
// killer: apps/genkan/scripts/records.mjs:139 SDL "  if (bytes[bytes.length - 1] !== 10) process.stderr.write(\"\\n\");" -> ""
// killer: apps/genkan/scripts/records.mjs:96 CONST "return fail(`records: ${outAbs} unwritable (${String(e.code ?? e.message)})`);" -> "throw e;"
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

// killer: apps/genkan/scripts/records.mjs:52 SDL "if (out !== undefined) return usage(\"--out given twice\");" -> ""
// killer: apps/genkan/scripts/records.mjs:54 COR "value === undefined || value.trim() === \"\"" -> "value === undefined"
// killer: apps/genkan/scripts/records.mjs:59 SDL "if (out === undefined) return usage(\"one of --out <file> and --replay is required\");" -> ""
// killer: apps/genkan/scripts/records.mjs:60 SDL "if (onDriveC(out)) return usage(`--out is on C: (${out}); refused`);" -> ""
// killer: apps/genkan/scripts/records.mjs:64 CONST "[AUDIT, \"--roots\"]" -> "[AUDIT]"
// killer: apps/genkan/scripts/records.mjs:65 COR "roots.error !== undefined || roots.status !== 0" -> "roots.error !== undefined"
// killer: apps/genkan/scripts/records.mjs:32 CONST "const ROOT_LINE = /^(\\S+) (\\S+)$/;" -> "const ROOT_LINE = /^(\\S+) (\\S+)/;"
// killer: apps/genkan/scripts/records.mjs:33 CONST "const MODULE = /^(?:Main|Genkan(?:\\.[A-Z][A-Za-z0-9]*)*)$/;" -> "const MODULE = /^\\S+$/;"
// killer: apps/genkan/scripts/records.mjs:77 SDL "if (parsed.length === 0) return fail(\"records: audit.mjs --roots named no root\");" -> ""
// killer: apps/genkan/scripts/records.mjs:144 CONST "return String(r.status ?? r.signal" -> "return String(1 ?? r.signal"
// killer: apps/genkan/scripts/records.mjs:66 SDL "    relay(roots.stderr);" -> ""
// killer: apps/genkan/scripts/records.mjs:74 COR " || !NAME.test(m[2])" -> ""
// killer: apps/genkan/scripts/records.mjs:34 CONST "const NAME = /^[A-Za-z_][A-Za-z0-9_']*(?:\\.[A-Za-z_][A-Za-z0-9_']*)*$/;" -> "const NAME = /^[^\\s#]+$/;"
// killer: apps/genkan/scripts/records.mjs:34 CONST "(?:\\.[A-Za-z_][A-Za-z0-9_']*)*$/;" -> "(?:\\.[A-Za-z0-9_']*)*$/;"
// killer: apps/genkan/scripts/records.mjs:51 SDL "if (argv[k] !== \"--out\") return usage(`unknown argument ${argv[k]}`);" -> ""
// killer: apps/genkan/scripts/records.mjs:149 CONST "ON_C.test(value) || ON_C.test(value.trim())" -> "ON_C.test(value)"
// killer: apps/genkan/scripts/records.mjs:150 CONST "return IS_WIN && ON_C.test(path.win32.resolve(value));" -> "return false;"
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

// ---------------------------------------------------------------------------------------------------------------------

const REPLAY_USAGE = "records: usage: ELAN_HOME=<toolchain home> node apps/genkan/scripts/records.mjs --out <file> | --replay";
const LAKE_OK: Answer = { stdout: "", code: 0 };
const leanchecker = (m: string): string[] => ["env", "leanchecker", m];

// killer: apps/genkan/scripts/records.mjs:115 SDL "relay(r.stdout);" -> ""
test("records_replays_each_module_with_leanchecker", () => {
  // (1) Three modules, through a fake audit: one leanchecker per module, in order, each with the parent's ELAN_HOME and an
  // empty standard input; what a child prints is relayed to stderr, its stdout then its stderr; one success line; no file.
  const lake: Answers = { byLastWord: { "Genkan.Format": { stdout: "a note\n", stderr: "a warning\n", code: 0 } }, otherwise: LAKE_OK };
  const t = makeTree({}, lake, { stdout: "Genkan.Bytes\nGenkan.Format\nMain\n" });
  const r = records(t, ["--replay"]);
  assert.equal(r.status, 0, `records.mjs --replay succeeds\n${show(r)}`);
  assert.equal(String(r.stdout), "records: 3 modules replayed by leanchecker\n", `the success line, exactly\n${show(r)}`);
  assert.deepEqual(linesOf(r.stderr), ["a note", "a warning"], `the child's stdout then its stderr, relayed to stderr\n${show(r)}`);
  assertCalled(t, "audit", ["--modules"], "the modules of the replay", r);
  assert.deepEqual(callsOf(t, "audit").map((c) => c.argv), [["--modules"]], `the audit ran once\n${show(r)}`);
  const calls = callsOf(t, "lake");
  assert.deepEqual(calls.map((c) => c.argv), [leanchecker("Genkan.Bytes"), leanchecker("Genkan.Format"), leanchecker("Main")], `one leanchecker per module, in order\n${show(r)}`);
  for (const c of calls) {
    assert.equal(c.ELAN_HOME, t.elan, `${c.argv.join(" ")}: ELAN_HOME passes through to lake`);
    assert.equal(c.stdin, "", `${c.argv.join(" ")}: an empty standard input`);
  }
  assertCalled(t, "lake", leanchecker("Main"), "the last module", r); // the lake.mjs beside records.mjs
  assert.ok(!existsSync(t.out), `no records file is written\n${show(r)}`);
  assert.deepEqual(readdirSync(join(t.root, "out")), [], `nothing is written in the out dir\n${show(r)}`);

  // (2) One module: the count as --out writes its roots, with no plural rule.
  const one = makeTree({}, LAKE_OK, { stdout: "Main\n" });
  const r1 = records(one, ["--replay"]);
  assert.equal(r1.status, 0, `records.mjs --replay succeeds on one module\n${show(r1)}`);
  assert.equal(String(r1.stdout), "records: 1 modules replayed by leanchecker\n", `the success line of one module\n${show(r1)}`);
  assert.deepEqual(callsOf(one, "lake").map((c) => c.argv), [leanchecker("Main")], `one leanchecker\n${show(r1)}`);
});

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/scripts/records.mjs:117 SDL "if (r.error !== undefined || r.status !== 0) return fail(" -> ""
test("records_replay_stops_at_the_first_refusal", () => {
  const MODULES = "Genkan.Bytes\nGenkan.Hack\nMain\n";
  // (1) leanchecker refuses the second module: its stderr, then the exit, on stderr; exit 1; the third never runs.
  const refusal = "leanchecker found a problem in Genkan.Hack";
  const lake: Answers = { byLastWord: { "Genkan.Hack": { stdout: "", stderr: `${refusal}\n`, code: 1 } }, otherwise: LAKE_OK };
  const t = makeTree({}, lake, { stdout: MODULES });
  const r = records(t, ["--replay"]);
  assert.equal(r.status, 1, `a refused module fails records.mjs\n${show(r)}`);
  assert.equal(String(r.stdout), "", `nothing on stdout\n${show(r)}`);
  assert.deepEqual(linesOf(r.stderr), [refusal, "records: lake.mjs env leanchecker Genkan.Hack exited 1"], `the refusal, then the exit\n${show(r)}`);
  assert.deepEqual(callsOf(t, "lake").map((c) => c.argv), [leanchecker("Genkan.Bytes"), leanchecker("Genkan.Hack")], `lake ran twice, Main never\n${show(r)}`);

  // (2) lake killed on the first module (win32: the self-kill ends it with code 1): exit 1, the last line names the module
  // and what stopped it; lake ran once.
  const k = makeTree({}, { byLastWord: { "Genkan.Bytes": { stdout: "a line before the kill\n", kill: true } }, otherwise: LAKE_OK }, { stdout: MODULES });
  const rk = records(k, ["--replay"]);
  assert.equal(rk.status, 1, `a killed lake fails records.mjs\n${show(rk)}`);
  assert.match(linesOf(rk.stderr).at(-1) ?? "", /^records: lake\.mjs env leanchecker Genkan\.Bytes exited \S+$/, `the last line names the module and its exit\n${show(rk)}`);
  assert.equal(callsOf(k, "lake").length, 1, `lake ran once\n${show(rk)}`);

  // (3) The audit exits 3: its stderr, then its exit; lake never runs.
  const a = makeTree({}, LAKE_OK, { stdout: "", stderr: "audit: boom\n", code: 3 });
  const ra = records(a, ["--replay"]);
  assert.equal(ra.status, 1, `the audit exits 3: records.mjs fails\n${show(ra)}`);
  assertCalled(a, "audit", ["--modules"], "the audit that exits 3", ra);
  assert.deepEqual(linesOf(ra.stderr), ["audit: boom", "records: audit.mjs --modules exited 3"], `the audit's stderr, then its exit\n${show(ra)}`);
  assert.deepEqual(callsOf(a, "lake"), [], `the audit failed: lake never ran\n${show(ra)}`);
});

// ---------------------------------------------------------------------------------------------------------------------

// killer: apps/genkan/scripts/records.mjs:111 SDL "for (const m of modules) if (!MODULE.test(m)) return fail(" -> ""
test("records_replay_refuses_bad_arguments_and_bad_modules", () => {
  // (1) Usage errors: exit 2, every stderr line `records: ...`, the last one the usage line; neither child runs (the fake
  // audit would fail, exit 3, if it ran).
  const t = makeTree({}, LAKE_OK, { stdout: "", stderr: "audit: the fake audit ran\n", code: 3 });
  const usage: [string, string[], string | null][] = [
    ["no argument", [], "records: one of --out <file> and --replay is required"],
    ["a word after --replay", ["--replay", "x"], "records: unknown argument x"],
    ["--replay twice", ["--replay", "--replay"], "records: --replay given twice"],
    ["--out then --replay", ["--out", t.out, "--replay"], "records: --out and --replay exclude each other"],
    ["--replay then --out", ["--replay", "--out", t.out], "records: --out and --replay exclude each other"],
    ["a word glued to --replay", ["--replayx"], null],
    ["a word before --replay", ["x", "--replay"], null],
  ];
  for (const [what, args, first] of usage) {
    const r = records(t, args);
    assert.equal(r.status, 2, `${what}: a usage error\n${show(r)}`);
    const err = linesOf(r.stderr);
    assert.ok(err.length >= 2 && err.every((l) => l.startsWith("records: ")), `${what}: stderr lines starting "records: "\n${show(r)}`);
    if (first !== null) assert.equal(err[0], first, `${what}: the message\n${show(r)}`);
    assert.equal(err.at(-1), REPLAY_USAGE, `${what}: the usage line, last\n${show(r)}`);
    assert.deepEqual(callsOf(t, "audit"), [], `${what}: the audit never ran\n${show(r)}`);
    assert.deepEqual(callsOf(t, "lake"), [], `${what}: lake never ran\n${show(r)}`);
    assert.ok(!existsSync(t.out), `${what}: nothing written\n${show(r)}`);
  }

  // (2) Bad module lines (the audit exits 0): exit 1, one stderr line, and lake never runs, not even for a good line before
  // the bad one: every line is judged before any Lean runs.
  const refused = (line: string): string => `records: refused module line ${JSON.stringify(line)}`;
  const bad: [string, string, string][] = [
    ["no module", "", "records: audit.mjs --modules named no module"],
    ["a lower-case component", "Genkan.bytes\n", refused("Genkan.bytes")],
    ["a flag of leanchecker", "-v\n", refused("-v")],
    ["a long flag", "--help\n", refused("--help")],
    ["two words", "Main x\n", refused("Main x")],
    ["an empty component", "Genkan..lake.Nested\n", refused("Genkan..lake.Nested")],
    ["a foreign module", "Lean\n", refused("Lean")],
    ["a carriage return", "Main\r\n", refused("Main\r")],
    ["an empty line in the middle", "Main\n\nGenkan.Bytes\n", refused("")],
    ["a bad line after a good one", "Main\nGenkan.Bytes x\n", refused("Genkan.Bytes x")],
  ];
  for (const [what, modules, line] of bad) {
    const b = makeTree({}, LAKE_OK, { stdout: modules });
    const rb = records(b, ["--replay"]);
    assert.equal(rb.status, 1, `${what}: a bad module line fails records.mjs\n${show(rb)}`);
    assertCalled(b, "audit", ["--modules"], what, rb);
    assert.equal(String(rb.stdout), "", `${what}: nothing on stdout\n${show(rb)}`);
    assert.equal(String(rb.stderr), `${line}\n`, `${what}: exactly one stderr line\n${show(rb)}`);
    assert.deepEqual(callsOf(b, "lake"), [], `${what}: lake never ran\n${show(rb)}`);
  }
});
