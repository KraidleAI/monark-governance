// scripts/spec-policy-tables.mjs -- writer of the governance sources of the contract-1.1.0 version of the public spec repository (lot
// SPEC-1-1-0-RELEASE). Node 24, no dependency beyond this repository.
//
//   node scripts/spec-policy-tables.mjs --write | --check [--root <dir>]
//
// It derives, never by hand, the files that the version publishes from this repository, each at spec/<published path>:
// - contract-1.1.0/schemas/<name>.schema.json: the frozen schemas/<name>.schema.json under a closed list of exact replacements (the public
//   $id of the versioned path, the internal references of three descriptions, the name of the spec document); each replacement must match
//   exactly once, everything else is kept byte for byte;
// - contract-1.1.0/policy/<task_class>.json: the canonical writing of each table the harness serves (SERVED_POLICY_TABLES of tools/gate.ts,
//   the value the service builds at load, not a second build), so the file's sha256 is the served policy_table_sha256; no final LF. A table
//   whose rows tableRowProblems of spec-publish.mjs refuses (a recompute, SHORT_N points or fewer) is refused here too: one rule, the
//   publication gate's (VERIFIERS-LIST-F5A-1, SHORT-DIGEST-INVERSION-1).
// --check compares every file under <root>/spec/contract-1.1.0/ (this repository by default) and exits 1 on any difference, missing or
// extra file; --write writes every file to a temporary file beside it, then renames them into place, and on a failed rename puts back the
// previous bytes and mode of the files already replaced: the set is replaced whole or not at all.
// It reads no clock and no network, and writes only under <root>/spec/contract-1.1.0/.
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, tableRowProblems } from "./spec-publish.mjs";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const VERSION_DIR = "contract-1.1.0";
export const OUT_DIR = `spec/${VERSION_DIR}`;
export const SCHEMA_NAMES = Object.freeze(["prediction", "coverage-verdict", "gate-decision", "policy-row", "tool-error"]);
export const publicId = (name) => `https://github.com/KraidleAI/monark-kata-spec/raw/main/${VERSION_DIR}/schemas/${name}.schema.json`;
const DOC = (n) => [`spec section ${n}`, `${VERSION_DIR}/CONTRACT.md section ${n}`];
export const EDITS = Object.freeze({
  prediction: [[" ADR-M001 Decision 6.", ""]],
  "coverage-verdict": [DOC(5), [" ADR-M001 Decision 4.", ""]],
  "gate-decision": [[", NEVER a yield (ADR-CERT-MONARK). ADR-M001 Decision 5.", ", never an investment return or income paid to anyone."]],
  "policy-row": [DOC(10)],
  "tool-error": [DOC(13)],
});

/** schemaCopy(name, text) -> the published copy of a frozen schema; throws when a replacement does not match exactly once. */
export function schemaCopy(name, text) {
  const edits = [[`"$id": "https://monark.local/schemas/${name}.schema.json"`, `"$id": "${publicId(name)}"`], ...(EDITS[name] ?? [])];
  return edits.reduce((t, [before, after]) => {
    if (t.split(before).length !== 2) throw new Error(`spec-policy-tables: ${name}: "${before}" does not occur exactly once`);
    return t.replace(before, () => after);
  }, text);
}

export { SHORT_N } from "./spec-publish.mjs";

/** tableText(table) -> the canonical writing of a table; refused, by the first rule of tableRowProblems it breaks, like spec-publish. */
export function tableText(table) {
  const [no] = tableRowProblems(table);
  if (no !== undefined) throw new Error(no.detail);
  return canonicalJson(table);
}

/** expectedFiles(root, tables) -> [{path, text}] under OUT_DIR, sorted by path: the 5 schema copies and one table file per table
 *  ([{task_class, table}], the served tables by default). */
export async function expectedFiles(root = REPO_ROOT, tables = undefined) {
  const served = tables ?? (await import("../apps/harness/src/tools/gate.ts")).SERVED_POLICY_TABLES;
  const schemas = SCHEMA_NAMES.map((n) => ({ path: `${OUT_DIR}/schemas/${n}.schema.json`, text: schemaCopy(n, readFileSync(join(root, "schemas", `${n}.schema.json`), "utf8")) }));
  const files = served.map((t) => ({ path: `${OUT_DIR}/policy/${t.task_class}.json`, text: tableText(t.table) }));
  return [...schemas, ...files].sort((a, b) => (a.path < b.path ? -1 : 1));
}

const tree = (root, rel) => (statSync(join(root, rel)).isDirectory() ? readdirSync(join(root, rel)).flatMap((n) => tree(root, `${rel}/${n}`)) : [rel]);

/** differences(root, files) -> ["differ|missing|extra <path>"]: empty iff <root>/OUT_DIR holds exactly these files with these bytes. */
export function differences(root, files) {
  const want = new Set(files.map((f) => f.path)), out = [];
  for (const f of files) {
    const p = join(root, f.path);
    if (!existsSync(p)) out.push(`missing ${f.path}`);
    else if (!statSync(p).isFile() || !readFileSync(p).equals(Buffer.from(f.text, "utf8"))) out.push(`differ ${f.path}`);
  }
  for (const p of existsSync(join(root, OUT_DIR)) ? tree(root, OUT_DIR) : []) if (!want.has(p)) out.push(`extra ${p}`);
  return out;
}

/** writeAll(root, files): every file to a temporary sibling first, then each renamed into place; on a failed rename the files already
 *  replaced get their previous bytes and mode back (or are removed when they did not exist), and the error is thrown; the temporaries are
 *  removed. */
export function writeAll(root, files) {
  const tmp = files.map((f) => ({ ...f, at: join(root, f.path), tmp: join(root, `${f.path}.tmp-spec-policy-tables`) })), done = [];
  try {
    for (const f of tmp) { mkdirSync(dirname(f.at), { recursive: true }); writeFileSync(f.tmp, f.text); }
    try {
      for (const f of tmp) { const was = existsSync(f.at) && statSync(f.at).isFile(), old = was ? readFileSync(f.at) : null; done.push({ at: f.at, old, mode: was ? statSync(f.at).mode : 0 }); renameSync(f.tmp, f.at); }
    } catch (e) {
      done.pop(); // the failed rename replaced nothing
      for (const d of done.reverse()) if (d.old === null) rmSync(d.at, { force: true }); else { writeFileSync(d.at, d.old); chmodSync(d.at, d.mode & 0o7777); }
      throw e;
    }
  } finally {
    for (const f of tmp) rmSync(f.tmp, { force: true });
  }
}

export async function main(argv) {
  const [mode, flag, dir] = argv;
  if (!["--write", "--check"].includes(mode) || (flag !== undefined && (flag !== "--root" || dir === undefined)) || argv.length > 3) {
    console.error("usage: spec-policy-tables.mjs --write | --check [--root <dir>]");
    return 2;
  }
  try {
    const root = dir === undefined ? REPO_ROOT : resolve(dir), files = await expectedFiles(root);
    if (mode === "--write") writeAll(root, files);
    const diff = differences(root, files);
    for (const d of diff) console.log(d);
    console.log(`spec-policy-tables ${diff.length === 0 ? "OK" : "DIFFERENT"}: ${files.length} file(s) under ${OUT_DIR}`);
    return diff.length === 0 ? 0 : 1;
  } catch (e) {
    console.error(`spec-policy-tables REFUSED: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

/** isMain(argv1, self): the real paths are equal (a link, a junction or the drive letter's case does not hide the entry point). */
export function isMain(argv1, self) {
  const real = (p) => { try { return realpathSync(p); } catch { return null; } };
  const [a, b] = [real(argv1 ?? ""), real(self)].map((p) => (p !== null && process.platform === "win32" ? p.toLowerCase() : p));
  return a !== null && a === b;
}

if (isMain(process.argv[1], fileURLToPath(import.meta.url))) process.exitCode = await main(process.argv.slice(2));
