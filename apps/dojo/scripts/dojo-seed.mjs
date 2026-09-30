// MONARK Dojo -- the seed tool (ADR-DOJO-PR-3 D-1 table l.64, D-4, D-5; calque of apps/bell/scripts/bell-publish.mjs --generate-key).
//   node dojo-seed.mjs --init <new file> --horizon <n>
// writes a NEW secret s of 32 random bytes as 64 lowercase hex characters + LF (flag "wx": never over an existing file; mode 0600),
// durably (fsync of the file, then of its directory), and prints ONLY its public part {seed_anchor, horizon}, seed_anchor = H^n(s)
// (seedAnchor of dojo-core.mjs, the value the anchor line carries). The secret is never printed, returned or logged. Run as root on
// the collect host (docs/RUNBOOK-dojo.md, act A-4), never in a code tree (seed_inside_tree). Exit 0 with one JSON line; 1 on a refusal
// (`dojo/seed: <code>: <detail>`); 2 on usage.
import { randomBytes } from "node:crypto";
import { closeSync, fsyncSync, openSync, realpathSync, writeSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { seedAnchor } from "./dojo-core.mjs";

export const DOJO_SEED_REFUSALS = Object.freeze(["seed_file_exists", "seed_inside_tree"]);
export class DojoSeedError extends Error {
  constructor(code, detail) { super(`dojo/seed: ${code}: ${detail}`); this.code = code; this.detail = detail; }
}

/** The root of the tree that holds this tool: the repository, or /opt/monark-dojo-collect on the host (the root of collect.ts). */
const ROOT = fileURLToPath(new URL("../../../", import.meta.url));

/** Creates the seed file and returns {seed_anchor, horizon}; the anchor is computed before the file is created. A path inside the
 *  tree is refused first (calque of collect.ts outside(), lowercased compare): a bare hex seed is invisible to no_secret_in_repo (B-3). */
export function initSeed(path, horizon) {
  const rel = relative(resolve(ROOT).toLowerCase(), resolve(path).toLowerCase());
  if (!rel.startsWith("..") && !isAbsolute(rel)) throw new DojoSeedError("seed_inside_tree", "the seed never lives in a code tree");
  const secret = randomBytes(32).toString("hex"), anchor = seedAnchor(secret, horizon);
  let fd;
  try { fd = openSync(path, "wx", 0o600); } catch (e) { if (e?.code === "EEXIST") throw new DojoSeedError("seed_file_exists", "refusing to overwrite an existing file"); throw e; }
  try { writeSync(fd, `${secret}\n`); fsyncSync(fd); } finally { closeSync(fd); }
  // fsync(2) of the parent directory makes the new entry durable (win32 opens a directory "r+", POSIX "r": bell-publish.mjs DURABLE_FS).
  const dir = openSync(dirname(path), process.platform === "win32" ? "r+" : "r");
  try { fsyncSync(dir); } finally { closeSync(dir); }
  return { seed_anchor: anchor, horizon };
}

/** The CLI: exactly --init <file> and --horizon <n> (1 <= n <= 999 999 999, the anchor bound of collect.ts), in either order. */
export function runCli(argv) {
  const val = (k) => (argv.indexOf(k) % 2 === 0 ? argv[argv.indexOf(k) + 1] : undefined), file = val("--init"), n = val("--horizon");
  if (argv.length !== 4 || file === undefined || file.startsWith("--") || n === undefined || !/^[1-9][0-9]{0,8}$/.test(n)) {
    process.stderr.write("dojo/seed: usage: --init <new file> --horizon <n>\n");
    return 2;
  }
  try { process.stdout.write(`${JSON.stringify(initSeed(file, Number(n)))}\n`); return 0; } catch (e) {
    process.stderr.write(`dojo/seed: ${e instanceof DojoSeedError ? `${e.code}: ${e.detail}` : `fatal: ${String(e?.code ?? e?.name ?? "error")}`}\n`);
    return 1;
  }
}

// ENTRY-MAIN-LINK-1 (C-G2-1 of PR-1b-5b): REAL paths compared, so a launch through a directory link runs it; argv[1] absent or unreadable: an import.
const isEntry = () => { try { return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]); } catch { return false; } };
if (isEntry()) process.exitCode = runCli(process.argv.slice(2));
