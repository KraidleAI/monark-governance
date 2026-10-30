// apps/genkan/scripts/records.mjs: writes the axiom records of the Genkan kernel, the `#print axioms` output of main and of
// each theorem, read from the built kernel. Node 24, built-ins only. It asks this dir's audit.mjs for the roots (`--roots`, one
// line `<module> <name>` each), writes their modules' imports, then one `#print axioms <name>` line per root, on the standard
// input of `lake.mjs env lean --stdin` (this dir's wrapper of the pinned lake), and writes what Lean prints to --out, byte for
// byte, only when Lean exits 0. Lean loads the built kernel's modules: run it after the source audit (audit.mjs --source-only)
// and the build, as CI does; audit.mjs --axioms-from <file> judges the records.
// --replay asks audit.mjs for the modules (`--modules`) and refuses, before any Lean runs, a line that is not a module a root
// may name (so leanchecker never runs without a module); then it runs `lake.mjs env leanchecker <module>` once per module, in
// order, relays what each prints to stderr, and stops at the first that does not exit 0; it writes no file. leanchecker
// replays each declaration of a module in Lean's kernel against the environment its imports give, a check against environment
// hacking; it is not an external verifier.
//
//   ELAN_HOME=<toolchain home> node apps/genkan/scripts/records.mjs --out <file> | --replay
//
// Exit 0 with one stdout line `records: <R> roots, written to <file>`, or `records: <N> modules replayed by leanchecker`; 1
// when the roots, the modules, Lean or a leanchecker fail, or a root or module line is refused before Lean runs (what they
// printed goes to stderr, and nothing is written); 2 on a usage error or an --out on drive C (judged as lake.mjs judges its
// temp dir). It never deletes anything.
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const AUDIT = path.join(HERE, "audit.mjs");
const LAKE = path.join(HERE, "lake.mjs");
const IS_WIN = process.platform === "win32";
const ON_C = /^[cC]:/;
// A root line: two fields and one space between them. Its module: Main, or Genkan and its plain modules (the imports the audit
// admits). Its name: plain dotted components, so no name written on Lean's input holds Lean syntax (a guillemet name may hold
// a line break, a # or a space).
const ROOT_LINE = /^(\S+) (\S+)$/;
const MODULE = /^(?:Main|Genkan(?:\.[A-Z][A-Za-z0-9]*)*)$/;
const NAME = /^[A-Za-z_][A-Za-z0-9_']*(?:\.[A-Za-z_][A-Za-z0-9_']*)*$/;
const TIMEOUT_MS = 600_000;
const MAX_BUFFER = 64 * 1024 * 1024;
const USAGE = "records: usage: ELAN_HOME=<toolchain home> node apps/genkan/scripts/records.mjs --out <file> | --replay";

process.exitCode = main();

function main() {
  const argv = process.argv.slice(2);
  let out;
  let replay = false;
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === "--replay") {
      if (replay) return usage("--replay given twice");
      replay = true;
      continue;
    }
    if (argv[k] !== "--out") return usage(`unknown argument ${argv[k]}`);
    if (out !== undefined) return usage("--out given twice");
    const value = argv[++k];
    if (value === undefined || value.trim() === "") return usage("--out needs a value");
    out = value;
  }
  if (out !== undefined && replay) return usage("--out and --replay exclude each other");
  if (replay) return replayModules();
  if (out === undefined) return usage("one of --out <file> and --replay is required");
  if (onDriveC(out)) return usage(`--out is on C: (${out}); refused`);
  const outAbs = path.resolve(out);

  // The roots, as the audit names them.
  const roots = spawnSync(process.execPath, [AUDIT, "--roots"], { stdio: ["ignore", "pipe", "pipe"], timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER });
  if (roots.error !== undefined || roots.status !== 0) {
    relay(roots.stderr);
    return fail(`records: audit.mjs --roots exited ${exitOf(roots)}`);
  }
  const lines = roots.stdout.toString("utf8").split("\n");
  if (lines.at(-1) === "") lines.pop();
  const parsed = [];
  for (const line of lines) {
    const m = ROOT_LINE.exec(line);
    if (m === null || !MODULE.test(m[1]) || !NAME.test(m[2])) return fail(`records: refused root line ${JSON.stringify(line)}`);
    parsed.push({ module: m[1], name: m[2] });
  }
  if (parsed.length === 0) return fail("records: audit.mjs --roots named no root");

  // The Lean source: each module once, in order of first appearance, then one record per root.
  const modules = [...new Set(parsed.map((r) => r.module))];
  const source = [...modules.map((m) => `import ${m}`), ...parsed.map((r) => `#print axioms ${r.name}`)].map((l) => `${l}\n`).join("");
  const lean = spawnSync(process.execPath, [LAKE, "env", "lean", "--stdin"], {
    input: source,
    stdio: ["pipe", "pipe", "pipe"],
    timeout: TIMEOUT_MS,
    maxBuffer: MAX_BUFFER,
  });
  if (lean.error !== undefined || lean.status !== 0) {
    relay(lean.stdout);
    relay(lean.stderr);
    return fail(`records: lake.mjs env lean --stdin exited ${exitOf(lean)}; no records written`);
  }
  try {
    writeFileSync(outAbs, lean.stdout);
  } catch (e) {
    return fail(`records: ${outAbs} unwritable (${String(e.code ?? e.message)})`);
  }
  process.stdout.write(`records: ${String(parsed.length)} roots, written to ${outAbs}\n`);
  return 0;
}

/** --replay: each module the audit names, every line judged first, then replayed by leanchecker until the first refusal. */
function replayModules() {
  const listed = spawnSync(process.execPath, [AUDIT, "--modules"], { stdio: ["ignore", "pipe", "pipe"], timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER });
  if (listed.error !== undefined || listed.status !== 0) {
    relay(listed.stderr);
    return fail(`records: audit.mjs --modules exited ${exitOf(listed)}`);
  }
  const modules = listed.stdout.toString("utf8").split("\n");
  if (modules.at(-1) === "") modules.pop();
  for (const m of modules) if (!MODULE.test(m)) return fail(`records: refused module line ${JSON.stringify(m)}`);
  if (modules.length === 0) return fail("records: audit.mjs --modules named no module");
  for (const m of modules) {
    const r = spawnSync(process.execPath, [LAKE, "env", "leanchecker", m], { stdio: ["ignore", "pipe", "pipe"], timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER });
    relay(r.stdout);
    relay(r.stderr);
    if (r.error !== undefined || r.status !== 0) return fail(`records: lake.mjs env leanchecker ${m} exited ${exitOf(r)}`);
  }
  process.stdout.write(`records: ${String(modules.length)} modules replayed by leanchecker\n`);
  return 0;
}

/** A usage error: its line and the usage line on stderr, exit 2. */
function usage(msg) {
  process.stderr.write(`records: ${msg}\n${USAGE}\n`);
  return 2;
}

/** A failure: its line on stderr, exit 1. */
function fail(line) {
  process.stderr.write(`${line}\n`);
  return 1;
}

/** A child's output on stderr, as it came, ended by a line break. */
function relay(bytes) {
  if (bytes === null || bytes === undefined || bytes.length === 0) return;
  process.stderr.write(bytes);
  if (bytes[bytes.length - 1] !== 10) process.stderr.write("\n");
}

/** A child's exit code, or what stopped it. */
function exitOf(r) {
  return String(r.status ?? r.signal ?? r.error?.code ?? "without a code");
}

/** Whether a path value is on drive C: as written, or (win32) once resolved against the cwd. */
function onDriveC(value) {
  if (ON_C.test(value) || ON_C.test(value.trim())) return true;
  return IS_WIN && ON_C.test(path.win32.resolve(value));
}
