// scripts/spec-policy-tables.mjs -- writer of the governance sources of the contract-1.1.0 version of the public spec repository (lot
// SPEC-1-1-0-RELEASE). Node 24, no dependency beyond this repository.
//
//   node scripts/spec-policy-tables.mjs --write | --check [--root <dir>]      (--write --date <YYYY-MM-DD>: a dated table version, at the end)
//
// It derives, never by hand, the files that the version publishes from this repository, each at spec/<published path>:
// - contract-1.1.0/schemas/<name>.schema.json: the frozen schemas/<name>.schema.json under a closed list of exact replacements (the public
//   $id of the versioned path, the internal references of three descriptions, the name of the spec document); each replacement must match
//   exactly once, everything else is kept byte for byte;
// - contract-1.1.0/policy/<task_class>.json: the canonical writing of each table the harness serves (SERVED_POLICY_TABLES of tools/gate.ts,
//   the value the service builds at load, not a second build), so the file's sha256 is the served policy_table_sha256; no final LF. A table
//   whose rows tableRowProblems of spec-publish.mjs refuses (a recompute, SHORT_N points or fewer) is refused here too: one rule, the
//   publication gate's (VERIFIERS-LIST-F5A-1, SHORT-DIGEST-INVERSION-1).
// Without --date, both keep the base's behaviour (M-2): --check compares every file under <root>/spec/ (this repository by default; each table in its SERVED_TABLE_DIRS directory, a table that no directory holds expected under contract-1.1.0/) and exits 1 on any difference, missing or
// extra file; --write writes every file of contract-1.1.0/, a missing or changed one included, to a temporary file beside it, then renames them into place, and on a failed rename puts back the
// previous bytes and mode of the files already replaced: the set is replaced whole or not at all. A target that is a symbolic link is refused.
// It reads no clock and no network, and writes only under <root>/spec/contract-1.1.0/, or a new <root>/spec/contract-1.1.0-tables-<date>/ (--date): a dated directory is never rewritten, whatever the option (B-1: writeFlat, writeDated).
import { chmodSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url"; import { createHash } from "node:crypto";
import { canonicalJson, tableRowProblems, validDate } from "./spec-publish.mjs";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const VERSION_DIR = "contract-1.1.0";
export const OUT_DIR = `spec/${VERSION_DIR}`, RETIRE_DIR = "apps/harness/data/kata/retire"; // the retire lists of R-a (draft G0 4.1, Q-R2)
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

/** expectedFiles(root, tables) -> [{path, text}] under spec/, sorted by path: the 5 schema copies under OUT_DIR and one table file per table
 *  ([{task_class, table}], the served tables by default) in the directory SERVED_TABLE_DIRS names for its class (servedTableDirs, at the end). */
export async function expectedFiles(root = REPO_ROOT, tables = undefined) {
  const served = tables ?? (await import("../apps/harness/src/tools/gate.ts")).SERVED_POLICY_TABLES, dirs = servedTableDirs(root, served);
  const schemas = SCHEMA_NAMES.map((n) => ({ path: `${OUT_DIR}/schemas/${n}.schema.json`, text: schemaCopy(n, readFileSync(join(root, "schemas", `${n}.schema.json`), "utf8")) }));
  const files = served.map((t) => ({ path: `spec/${dirs[t.task_class]}/policy/${t.task_class}.json`, text: tableText(t.table) }));
  return [...schemas, ...files].sort((a, b) => (a.path < b.path ? -1 : 1));
}

const tree = (root, rel) => (statSync(join(root, rel)).isDirectory() ? readdirSync(join(root, rel)).flatMap((n) => tree(root, `${rel}/${n}`)) : [rel]);

/** differences(root, files) -> ["differ|missing|extra <path>"]: empty iff <root>/OUT_DIR holds exactly these files with these bytes, besides what published() keeps, and the dated directories pass published(). */
export function differences(root, files) {
  const pub = published(root, files), want = new Set([...files.map((f) => f.path), ...pub.kept]), out = [];
  for (const f of files) {
    const p = join(root, f.path);
    if (!existsSync(p)) out.push(`missing ${f.path}`);
    else if (!statSync(p).isFile() || !readFileSync(p).equals(Buffer.from(f.text, "utf8"))) out.push(`differ ${f.path}`);
  }
  for (const p of existsSync(join(root, OUT_DIR)) ? tree(root, OUT_DIR) : []) if (!want.has(p)) out.push(`extra ${p}`);
  return [...out, ...pub.notes];
}

/** writeAll(root, files): every file to a temporary sibling first, then each renamed into place; on a failed rename the files already
 *  replaced get their previous bytes and mode back (or are removed when they did not exist), and the error is thrown; the temporaries are
 *  removed. */
export function writeAll(root, files) {
  const tmp = files.map((f) => ({ ...f, at: join(root, f.path), tmp: join(root, `${f.path}.tmp-spec-policy-tables`) })), done = [];
  for (const f of tmp) if (lstatSync(f.at, { throwIfNoEntry: false })?.isSymbolicLink() === true) throw new Error(`${f.path} is a symbolic link: not written over`);
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
  const [mode, ...rest] = argv, o = Object.fromEntries(rest.map((v, i) => [v, rest[i + 1]]).filter((_, i) => i % 2 === 0)), dir = o["--root"], date = o["--date"];
  if (!["--write", "--check"].includes(mode) || rest.length !== 2 * Object.keys(o).length || Object.keys(o).some((k) => k !== "--root" && (k !== "--date" || mode !== "--write"))) {
    console.error("usage: spec-policy-tables.mjs --write | --check [--root <dir>]; --write --date <YYYY-MM-DD> [--root <dir>]: a dated table version");
    return 2;
  }
  try {
    const root = dir === undefined ? REPO_ROOT : resolve(dir), files = date === undefined ? await expectedFiles(root) : await datedFiles(root, date);
    if (mode === "--write") (date === undefined ? writeFlat : writeDated)(root, files);
    const diff = differences(root, date === undefined ? files : await expectedFiles(root)), entries = date === undefined ? [] : releaseEntries(files);
    for (const d of [...diff, ...entries]) console.log(d);
    console.log(`spec-policy-tables ${diff.length === 0 ? "OK" : "DIFFERENT"}: ${files.length} file(s) ${date !== undefined ? `written under spec/${datedDir(date)}/, the governance entries of its release above` : `under ${files.every((f) => f.path.startsWith(`${OUT_DIR}/`)) ? OUT_DIR : "spec/"}`}`);
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

// ---- ENGINE-ROW-RETIRE-PATH-1, lot R-b (draft G0 4.3; F-1 of MONARK's review, section 5): the dated table versions, as function declarations
// kept last so that no line above moves (scripts/red-proof.mjs precedent). `--write --date <YYYY-MM-DD> [--root <dir>]` writes, whole and
// canonical, spec/contract-1.1.0-tables-<date>/policy/<task_class>.json for each served table that differs from the file of its directory, never
// a file under spec/contract-1.1.0/ (CONTRACT 1.1.0 l.441, l.449), plus retire/retire-<date>.json, the list in force at that date, when one of
// them holds a retired row (F-1); it prints the governance entries of the release, then checks the whole tree. SERVED_TABLE_DIRS maps each
// served class to the last version directory that holds its file; two with the same bytes are refused, and a class that no directory holds is refused when a dated version is written (M-2: else it is expected under contract-1.1.0/). A dated directory is written once, never rewritten (B-1).

/** versionDirs(root) -> the version directories under <root>/spec, in order: contract-1.1.0, then contract-1.1.0-tables-<real day> by day. */
function versionDirs(root) {
  const s = join(root, "spec"), dated = (n) => n.length === VERSION_DIR.length + 18 && n.startsWith(`${VERSION_DIR}-tables-`) && validDate(n.slice(-10));
  return existsSync(s) ? readdirSync(s).filter((n) => n === VERSION_DIR || dated(n)).sort() : [];
}

/** servedTableDirs(root, tables, without) -> SERVED_TABLE_DIRS, the closed map task_class -> the last version directory under <root>/spec
 *  that holds policy/<task_class>.json (without: a dated directory left out, the one being written; then a class that none holds is refused, else it maps to contract-1.1.0, M-2). */
export function servedTableDirs(root, tables, without = null) {
  const dirs = versionDirs(root).filter((d) => d !== without);
  return Object.freeze(Object.fromEntries(tables.map(({ task_class: c }) => {
    const has = dirs.filter((d) => existsSync(join(root, "spec", d, "policy", `${c}.json`))), texts = has.map((d) => readFileSync(join(root, "spec", d, "policy", `${c}.json`), "utf8"));
    if (has.length === 0 && without !== null) throw new Error(`spec-policy-tables: ${c}: no directory publishes its table`);
    const twice = has.filter((_, i) => texts.indexOf(texts[i]) !== texts.lastIndexOf(texts[i]));
    if (twice.length > 0) throw new Error(`spec-policy-tables: ${c}: two directories publish the same table (${twice.join(", ")}): a dated directory holds the changed classes only`);
    return [c, has.at(-1) ?? VERSION_DIR];
  })));
}

/** datedDir(date) -> contract-1.1.0-tables-<date>; a date that is no real calendar day is refused (validDate of spec-publish.mjs). */
export function datedDir(date) {
  if (!validDate(date)) throw new Error(`spec-policy-tables: ${String(date)} is not a real calendar day (YYYY-MM-DD)`);
  return `${VERSION_DIR}-tables-${date}`;
}

/** retireListAt(root, date) -> the text of the retire list in force at date, the last <root>/RETIRE_DIR/retire-<day>.json with day at or
 *  before date (a list cumulates the earlier retires, draft G0 4.1), or null. */
export function retireListAt(root, date) {
  const dir = join(root, RETIRE_DIR), days = (existsSync(dir) ? readdirSync(dir) : []).map((n) => /^retire-(\d{4}-\d{2}-\d{2})\.json$/.exec(n)?.[1]).filter((d) => validDate(d) && d <= date).sort();
  return days.length === 0 ? null : readFileSync(join(dir, `retire-${days.at(-1)}.json`), "utf8");
}

/** datedFiles(root, date, tables) -> [{path, text}] of the dated version: each table ([{task_class, table}], the served ones by default) that
 *  differs from the file of its directory, the dated one left out, then the retire list in force when one of them holds a retired row. */
export async function datedFiles(root, date, tables = undefined) {
  const dir = datedDir(date), later = versionDirs(root).filter((d) => d > dir);
  if (later.length > 0) throw new Error(`spec-policy-tables: ${later.join(", ")} is later than ${dir}: a dated version follows every published one`);
  const served = tables ?? (await import("../apps/harness/src/tools/gate.ts")).SERVED_POLICY_TABLES, dirs = servedTableDirs(root, served, dir);
  const changed = served.filter((t) => readFileSync(join(root, "spec", dirs[t.task_class], "policy", `${t.task_class}.json`), "utf8") !== tableText(t.table));
  const retired = changed.filter((t) => t.table.rows.some((r) => r?.status === "retired")).map((t) => t.task_class), list = retired.length > 0 ? retireListAt(root, date) : null;
  if (changed.length === 0) throw new Error("spec-policy-tables: every served table is the file of its directory: no dated version to write");
  if (retired.length > 0 && list === null) throw new Error(`spec-policy-tables: F-1: ${retired.join(", ")} hold(s) a retired row and no retire list is in force at ${date} (${RETIRE_DIR}/retire-<YYYY-MM-DD>.json)`);
  return [...changed.map((t) => ({ path: `spec/${dir}/policy/${t.task_class}.json`, text: tableText(t.table) })), ...(list === null ? [] : [{ path: `spec/${dir}/retire/retire-${date}.json`, text: canonicalJson(JSON.parse(list)) }])];
}

/** writeDated(root, files): writeAll, once every file lies under spec/contract-1.1.0-tables-<real day>/(policy|retire)/, never under
 *  contract-1.1.0/, and no such directory exists yet: a dated directory is never rewritten, whatever the option, its own date included (B-1). */
export function writeDated(root, files) {
  const at = new RegExp(`^spec/${VERSION_DIR.replaceAll(".", "\\.")}-tables-(\\d{4}-\\d{2}-\\d{2})/(?:policy|retire)/[\\w.-]+\\.json$`), off = files.filter((f) => !validDate(at.exec(f.path)?.[1]));
  if (off.length > 0) throw new Error(`spec-policy-tables: ${off.map((f) => f.path).join(", ")}: a dated version writes under spec/${VERSION_DIR}-tables-<YYYY-MM-DD>/policy/ or retire/ only, never under ${OUT_DIR}/`);
  const there = [...new Set(files.map((f) => f.path.split("/").slice(0, 2).join("/")))].filter((d) => existsSync(join(root, d)));
  if (there.length > 0) throw new Error(`spec-policy-tables: ${there.join(", ")} already exists: a dated directory is never rewritten, whatever the option; to redo it before its publication, remove it with git, then write it again`);
  writeAll(root, files);
}

/** releaseEntries(files) -> the governance entries of the dated release, one line each as written in scripts/spec-publish-inputs.json, each
 *  pinned by its sha256; the release carries besides every output of the previous one (root "previous", previous_commit its published head). */
export function releaseEntries(files) {
  return files.map((f) => Object.entries({ out: f.path.slice("spec/".length), root: "governance", path: f.path, kind: f.path.includes("/policy/") ? "policy-table" : "json", sha256: createHash("sha256").update(f.text).digest("hex") }))
    .map((e) => `{${e.map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(", ")}}`);
}

/** published(root, files) -> {kept, notes}: what --check keeps without deriving it again (a table file that the directory of its class
 *  supersedes, the retire list of a dated directory) and what it reports under the dated directories: "missing" the retire list of one that
 *  holds a retired row (F-1), "extra" any other file there. */
function published(root, files) {
  const want = new Set(files.map((f) => f.path)), dirs = versionDirs(root), notes = [];
  const retired = (p) => { try { return JSON.parse(readFileSync(join(root, p), "utf8")).rows.some((r) => r?.status === "retired"); } catch { return false; } };
  const kept = files.flatMap((f) => (/^spec\/[^/]+\/policy\//.test(f.path) ? dirs.map((d) => f.path.replace(/^spec\/[^/]+/, `spec/${d}`)).filter((p) => !want.has(p) && existsSync(join(root, p))) : []));
  for (const d of dirs.filter((x) => x !== VERSION_DIR)) {
    const list = `spec/${d}/retire/retire-${d.slice(-10)}.json`, paths = tree(root, `spec/${d}`);
    if (!paths.includes(list) && paths.some((p) => p.includes("/policy/") && retired(p))) notes.push(`missing ${list}`);
    notes.push(...paths.filter((p) => !want.has(p) && !kept.includes(p) && p !== list).map((p) => `extra ${p}`));
  }
  return { kept, notes };
}

/** writeFlat(root, files): --write without --date. The base's behaviour (M-2): writeAll of the files of contract-1.1.0/, a missing or a
 *  changed one written again. A dated directory is never written into (B-1): an expected file of one whose bytes would change is refused by
 *  its path before anything is written, with the way to publish a changed table, --write --date; a file of one with the same bytes is left as it is. */
export function writeFlat(root, files) {
  const same = (f) => { const p = join(root, f.path); return existsSync(p) && statSync(p).isFile() && readFileSync(p).equals(Buffer.from(f.text, "utf8")); };
  const changed = files.filter((f) => !f.path.startsWith(`${OUT_DIR}/`) && !same(f));
  if (changed.length > 0) throw new Error(`spec-policy-tables: ${changed.map((f) => f.path).join(", ")}: a dated directory is never rewritten (B-1); a served table that changed is published as a new dated version, --write --date <YYYY-MM-DD>`);
  writeAll(root, files.filter((f) => f.path.startsWith(`${OUT_DIR}/`)));
}
