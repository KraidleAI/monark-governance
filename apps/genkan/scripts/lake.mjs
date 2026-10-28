// apps/genkan/scripts/lake.mjs — runs the pinned Lake of the Genkan kernel, and nothing else.
// Node 24, built-ins only. It spawns <ELAN_HOME>/toolchains/leanprover--lean4---v4.32.1/bin/lake (lake.exe on win32) by its
// path, never elan and never a PATH lookup, in apps/genkan/kernel (resolved from this file), with TMP, TEMP and TMPDIR set
// to the temp dir, and exits with lake's code. Before it spawns anything it refuses, each time with one stderr line
// `lake.mjs: ...; refused` and exit 2: an empty ELAN_HOME; an ELAN_HOME on drive C; no pinned lake; a temp dir on drive C;
// a temp dir that is missing or not a directory. The temp dir is GENKAN_TMP when set; else, on win32, the folder tmp\genkan
// of drive F; else <RUNNER_TEMP, or the OS temp dir>/genkan. It never creates, writes or deletes anything.
//
//   ELAN_HOME=<toolchain home> node apps/genkan/scripts/lake.mjs [lake args...]
//
// The drive of the win32 default is joined at run time, so this source carries no literal drive path (the public export
// refuses one).
import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOLCHAIN = "leanprover--lean4---v4.32.1";
const IS_WIN = process.platform === "win32";
const KERNEL_DIR = fileURLToPath(new URL("../kernel", import.meta.url));
const ON_C = /^[cC]:/;

/** One refusal line on stderr, nothing on stdout, exit 2. */
function refuse(what) {
  process.stderr.write(`lake.mjs: ${what}; refused\n`);
  process.exit(2);
}

/** Whether a path value is on drive C: as written, or (win32) once resolved against the cwd. */
function onDriveC(value) {
  if (ON_C.test(value) || ON_C.test(value.trim())) return true;
  return IS_WIN && ON_C.test(path.win32.resolve(value));
}

/** Whether `p` names an existing entry of the given kind; never throws. */
function isKind(p, kind) {
  const st = statSync(p, { throwIfNoEntry: false });
  if (st === undefined) return false;
  return kind === "file" ? st.isFile() : st.isDirectory();
}

/** A non-empty (after trim) environment value, or undefined. */
function envValue(name) {
  const v = process.env[name];
  return v === undefined || v.trim() === "" ? undefined : v;
}

// (1) and (2): the toolchain home.
const elanHome = envValue("ELAN_HOME");
if (elanHome === undefined) refuse("ELAN_HOME is empty");
if (onDriveC(elanHome)) refuse(`ELAN_HOME is on C: (${elanHome})`);

// (3): the pinned lake, by its path.
const lake = path.resolve(elanHome, "toolchains", TOOLCHAIN, "bin", IS_WIN ? "lake.exe" : "lake");
if (!isKind(lake, "file")) refuse(`no lake at ${lake}`);

// (4) and (5): the temp dir.
const tempDir =
  envValue("GENKAN_TMP") ??
  (IS_WIN ? path.win32.join("F" + ":", "tmp", "genkan") : path.join(envValue("RUNNER_TEMP") ?? tmpdir(), "genkan"));
if (onDriveC(tempDir)) refuse(`temp dir is on C: (${tempDir})`);
if (!isKind(tempDir, "dir")) refuse(`temp dir missing (${tempDir})`);
const tempAbs = path.resolve(tempDir);

// The child's environment: the parent's, with every spelling of TMP, TEMP and TMPDIR replaced (win32 keys ignore case).
const env = {};
for (const [k, v] of Object.entries(process.env)) if (!["TMP", "TEMP", "TMPDIR"].includes(k.toUpperCase())) env[k] = v;
env.TMP = tempAbs;
env.TEMP = tempAbs;
env.TMPDIR = tempAbs;

const r = spawnSync(lake, process.argv.slice(2), { cwd: KERNEL_DIR, env, stdio: "inherit", shell: false });
if (r.error !== undefined) refuse(`lake did not run (${String(r.error.code ?? r.error.message)})`);
if (r.status === null) refuse(`lake did not run (${String(r.signal ?? "no exit code")})`);
process.exit(r.status);
