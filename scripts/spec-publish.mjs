// scripts/spec-publish.mjs -- producer of the content of the public spec repository KraidleAI/monark-kata-spec (lot
// SPEC-PUBLISH-PIPELINE-1). Node 24, no dependency beyond this repository's own gate modules.
//
//   node scripts/spec-publish.mjs --release <id> --date <YYYY-MM-DD> --out <dir> [--root <name>=<dir>]... [--verify <dir>] [--inputs <file>]
//
// It writes ONE dated version of the spec repository into a LOCAL, absent or empty --out directory outside any git tree: every file of
// the release's closed input list (scripts/spec-publish-inputs.json), each pinned by its sha256 and copied byte for byte, plus VERSION
// (the date argument and a LF) and MANIFEST.sha256 ("<sha256>  <path>" per other file, sorted by path, LF; `sha256sum -c --strict
// MANIFEST.sha256` checks it); files 0644. The date argument is the only time in the output: the same sources and date give the same
// bytes. The tree is written in a temporary directory beside --out and renamed into place: on any failure --out stays absent or as it
// was. It never publishes; its git commands are reads only. Publication stays MONARK's act (F-5).
//
// Roots: "governance" (this repository by default), "recherches" (a clone of that repository) and "previous" (the top of a clean
// checkout of the spec repository at the release's previous_commit). FAIL-CLOSED (exit 1, nothing written), each problem named by its
// code: release_unknown, date_invalid, root_missing, input_blacklisted, input_missing, input_escapes (a link out of its root),
// input_not_file, input_digest, not_text, crlf, vocabulary, json_invalid, schema_invalid, policy_table_invalid, not_canonical (a policy
// table file must be its own canonical writing, so its sha256 is its policy_table_sha256), recompute_held, short_digest (tableRowProblems),
// policy_table_kind, version_dir_invalid, previous_commit, previous_dirty, previous_blob_missing (a previous entry is read from the git
// object of previous_commit, never the working tree: a CRLF checkout cannot change it), withdrawn (a file of the previous tree the release drops),
// rewritten (a file under contract-*/ of the previous tree the release changes), added_to_published (a new file under it),
// foreign_version_dir (a new version directory other than the release's own), retire_list_missing, retire_list_invalid (F-1, at the end); then out_not_empty, out_parent_missing, out_in_git_tree, write_failed. --verify
// <dir> then compares --out with <dir> (.git ignored): exit 0 iff the same paths with the same bytes. Exit 2: usage.
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { checkPublicText } from "./public-text-deny.mjs";
import { STRUCTURAL_BLACKLIST } from "./export-public.mjs";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const INPUTS_FILE = "scripts/spec-publish-inputs.json";
export const ROOTS = Object.freeze(["governance", "recherches", "previous"]);
export const KINDS = Object.freeze(["text", "json", "schema", "policy-table"]);
export const RESERVED = Object.freeze(["VERSION", "MANIFEST.sha256"]);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const okPath = (p) => /^[\w.-]+(\/[\w.-]+)*$/.test(String(p)) && p.split("/").every((s) => !/^\.+$/.test(s)) && p.split("/")[0] !== ".git";
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const byPath = (a, b) => (a.path < b.path ? -1 : 1);

export class SpecPublishError extends Error {
  constructor(code, message, problems = []) { super(`${code}: ${message}`); this.code = code; this.problems = problems; }
}

/** validDate(s): a YYYY-MM-DD string naming a real calendar day. */
export function validDate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number), t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** parseInputs(raw): the checked input list; throws SpecPublishError("inputs_invalid") on any departure from the closed format. */
export function parseInputs(raw) {
  const bad = (why) => { throw new SpecPublishError("inputs_invalid", why); };
  const closed = (o, keys) => isObj(o) && Object.keys(o).every((k) => keys.includes(k));
  if (!closed(raw, ["format", "releases"]) || raw.format !== "spec-inputs-v1" || !isObj(raw.releases)) bad("format spec-inputs-v1 with releases");
  for (const [id, rel] of Object.entries(raw.releases)) {
    if (!closed(rel, ["previous_commit", "entries", "note"]) || !Array.isArray(rel.entries) || rel.entries.length === 0) bad(`${id}: entries`);
    if (rel.previous_commit !== null && !/^[0-9a-f]{40}$/.test(String(rel.previous_commit))) bad(`${id}: previous_commit`);
    for (const e of rel.entries) {
      if (!closed(e, ["out", "root", "path", "kind", "sha256", "note"])) bad(`${id}: entry keys`);
      if (!okPath(e.out) || RESERVED.includes(e.out)) bad(`${id}: output ${e.out}`);
      if (!ROOTS.includes(e.root) || !okPath(e.path) || !KINDS.includes(e.kind)) bad(`${id}: ${e.out} source or kind`);
      if (!/^[0-9a-f]{64}$/.test(String(e.sha256))) bad(`${id}: ${e.out} must pin its sha256`);
      if (e.root === "previous" && rel.previous_commit === null) bad(`${id}: ${e.out} reads the previous tree, previous_commit is null`);
    }
    const all = [...rel.entries.map((e) => String(e.out)), ...RESERVED].map((p) => p.toLowerCase());
    if (new Set(all).size !== all.length || all.some((a) => all.some((b) => b.startsWith(`${a}/`)))) bad(`${id}: two outputs collide (a name in any case, or a file under another)`);
  }
  return raw;
}

export function loadInputs(file = join(REPO_ROOT, INPUTS_FILE)) {
  let raw;
  try { raw = JSON.parse(readFileSync(file, "utf8")); } catch (e) { throw new SpecPublishError("inputs_invalid", `${file}: ${e.message}`); }
  return parseInputs(raw);
}

/** canonicalJson(v): the canonical writing of the 1.1.0 draft, section 2 (sorted ASCII keys, shortest numbers, -0 as 0, no space). */
export function canonicalJson(v) {
  const no = (why) => { throw new SpecPublishError("not_canonical", why); };
  if (v === null || typeof v === "boolean") return JSON.stringify(v);
  if (typeof v === "number") return Number.isFinite(v) ? (Object.is(v, -0) ? "0" : JSON.stringify(v)) : no("a non-finite number");
  if (typeof v === "string") return v.isWellFormed() ? JSON.stringify(v) : no("a lone surrogate");
  if (Array.isArray(v)) return `[${v.map(canonicalJson).join(",")}]`;
  if (!isObj(v)) return no(`a value of type ${typeof v}`);
  const keys = Object.keys(v).sort();
  if (keys.some((k) => !/^[\x20-\x7e]*$/.test(k))) no("a non-ASCII key");
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(v[k])}`).join(",")}}`;
}

// ---- The vocabulary gate of the public spec repository: the public free-text gate (checkPublicText, kind "notes") on the NFKC text,
// with a closed list of exceptions: G0..G7 and monark-governance, which the published files cite, the json-schema.org URL, and a venue named inside a cell key
// written in its grammar (kata:<id>@<venue>/..., ukemi:...@.../aave-v3-core/...). Plus private names, home paths and withheld words.
const KEY_TOKEN = /\b(?:kata|ukemi):[\w.-]+@[\w:.-]+(?:\/[\w.-]+)+/g, VENUE = /@(eip155:\d+\/)?[a-z0-9-]+\//; // only the venue segment is masked
const EXCEPTED = (v) => (v.rule === "k" && /^G[0-7]$/.test(v.word)) || (v.rule === "c" && /^monark-governance$/i.test(v.word))
  || (v.rule === "g" && /^https:\/\/json-schema\.org\/draft\//.test(v.word)); // and the meta-schema URL a JSON Schema names in $schema
const EXTRA = [["private", /recherches/i], ["home", /(?<![\w.-])(?:\/var\/home|\/home|\/Users|\/root|~|\$HOME)\/[\w.-]|[A-Za-z]:\\+Users\\/i]];
/** The words withheld from every file by instruction: their length and the sha256 of their NFKC lower-case form, matched on every
 *  substring of that length (glued to letters or digits too), so that the word is never written. */
export const WITHHELD = Object.freeze([{ length: 6, sha256: "e8522fd87f748c388684c3eff07de12ac2f77d5c8f5f0222d50c7e819e26ca91" }]);

/** vocabularyHits(text, withheld) -> [{rule, line, word}]: every hit of the spec repository's gate, empty when the text is clean. The
 *  private, home and withheld checks read the whole NFKC text; the public free-text gate reads it with the venue of each key masked. */
export function vocabularyHits(text, withheld = WITHHELD) {
  const t = text.normalize("NFKC"), hits = [];
  if (t.trim() === "") return [];
  t.split("\n").forEach((l, i) => {
    for (const [rule, re] of EXTRA) { const m = re.exec(l); if (m) hits.push({ rule, line: i + 1, word: m[0] }); }
    const low = [...l.toLowerCase()];
    for (const w of withheld) for (let j = 0; j + w.length <= low.length; j++) if (sha(low.slice(j, j + w.length).join("")) === w.sha256) { hits.push({ rule: "withheld", line: i + 1, word: "(withheld)" }); break; }
  });
  const masked = t.replace(KEY_TOKEN, (k) => k.replace(VENUE, "@$1KEY/"));
  return [...checkPublicText(masked, "notes").violations.filter((v) => !EXCEPTED(v)).map((v) => ({ rule: v.rule, line: v.line, word: v.word })), ...hits];
}

const strings = (v) => (typeof v === "string" ? [v] : v !== null && typeof v === "object" ? Object.entries(v).flatMap(([k, x]) => [...(Array.isArray(v) ? [] : [k]), ...strings(x)]) : []);

/** A version directory: contract-<major>.<minor>.<patch> (no leading zero, lower case), or contract-<x.y.z>-tables-<YYYY-MM-DD> (a real
 *  calendar day) for a dated table-only revision. */
export const VERSION_DIR = /^contract-(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-tables-(\d{4}-\d{2}-\d{2}))?$/;
export const versionDir = (name) => { const m = VERSION_DIR.exec(String(name)); return m !== null && (m[1] === undefined || validDate(m[1])); };
/** A table by its shape (packages/contracts policy-table.ts), not its label: an object with a rows array and a class entry naming a
 *  task_class. tablesIn(v) -> [{table, path}] at any depth (a table's own content is not searched). */
const isTable = (o) => isObj(o) && Array.isArray(o.rows) && isObj(o.class) && typeof o.class.task_class === "string";
export const tablesIn = (v, path = "") => (isTable(v) ? [{ table: v, path }] : isObj(v) || Array.isArray(v) ? Object.entries(v).flatMap(([k, x]) => tablesIn(x, `${path}/${k}`)) : []);
/** The one file that may hold tables without being a table file: the vectors of a contract version, contract-<v>/vectors-<v>.json. Its
 *  tables under synthetic_kata are recomputation fixtures: their recompute and sequence digests are not refused; their n and p_served are. */
const VECTORS = /^contract-(\d+\.\d+\.\d+)\/vectors-\1\.json$/;
/** contentProblems(out, kind, bytes, release, carried) -> [{code, detail}]: what keeps one output file out of a version. JSON is also gated
 *  decoded. Any file under a policy/ segment, and any JSON holding a table at any depth (the vectors file excepted), must be a policy-table
 *  entry; a table carried byte for byte from the previous commit (carried) may lie under an older version directory, rows checked all the same. */
export function contentProblems(out, kind, bytes, release, carried = false) {
  let text;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { return [{ code: "not_text", detail: `${out}: not UTF-8` }]; }
  if (text.includes("\0")) return [{ code: "not_text", detail: `${out}: a NUL byte` }];
  const p = vocabularyHits(venueMaskedText(text, out, kind)).map((h) => ({ code: "vocabulary", detail: `${out}:${h.line} [${h.rule}] ${h.word}` }));
  if (text.includes("\r")) p.push({ code: "crlf", detail: `${out}: a CR byte (LF line ends only)` });
  const top = out.split("/")[0], parsed = (() => { try { return JSON.parse(text); } catch { return undefined; } })();
  if (/^contract-/i.test(top) && out.includes("/") && !versionDir(top)) p.push({ code: "version_dir_invalid", detail: `${out}: ${top} is not contract-<x.y.z>[-tables-<YYYY-MM-DD>]` });
  const held = tablesIn(parsed), vectors = kind === "json" && VECTORS.test(out);
  if (kind !== "policy-table" && (/(^|\/)policy\//i.test(out) || (held.length > 0 && !vectors))) p.push({ code: "policy_table_kind", detail: `${out}: a table file is declared policy-table` });
  if (vectors) for (const t of held) p.push(...tableRowProblems(t.table, t.path.startsWith("/synthetic_kata/")).map((x) => ({ ...x, detail: `${out}${t.path}: ${x.detail}` })));
  if (kind === "text") return p;
  let v;
  try { v = JSON.parse(text); } catch (e) { return [...p, { code: "json_invalid", detail: `${out}: ${e.message}` }]; }
  p.push(...vocabularyHits(strings(venueMasked(v, out, kind).value).join("\n")).map((h) => ({ code: "vocabulary", detail: `${out}: a decoded string [${h.rule}] ${h.word}` })));
  if (kind === "schema" && !(isObj(v) && typeof v.$schema === "string")) p.push({ code: "schema_invalid", detail: `${out}: no $schema` });
  if (kind !== "policy-table") return p;
  const at = /^(?:([^/]+)\/)?policy\/([^/]+)\.json$/.exec(out); // a new table lies under the release's own directory
  if (!isObj(v) || v.row_format !== "class-policy-v2" || !isObj(v.class) || !Array.isArray(v.rows) || at === null || at[2] !== String(v.class.task_class) || (at[1] !== undefined && (!versionDir(at[1]) || (at[1] !== release && !carried)))) {
    p.push({ code: "policy_table_invalid", detail: `${out}: not a class-policy-v2 table file named [<release>/]policy/<class.task_class>.json` });
  } else p.push(...tableRowProblems(v).map((x) => ({ ...x, detail: `${out}: ${x.detail}` })));
  try { if (canonicalJson(v) !== text) p.push({ code: "not_canonical", detail: `${out}: the bytes are not the canonical writing` }); }
  catch (e) { p.push({ code: "not_canonical", detail: `${out}: ${e.message}` }); }
  return p;
}
// Each git call names its tree with -C: neither refs/replace (G2 F-1) nor a caller's repository location (the location half of `git rev-parse --local-env-vars`, any case: a hook's GIT_DIR, GIT_INDEX_FILE) stands in for it; GIT_CONFIG_* still reaches git (G2 T-8).
const GIT_LOCATION = /^GIT_(?:DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|IMPLICIT_WORK_TREE|PREFIX|INTERNAL_SUPER_PREFIX|SHALLOW_FILE|GRAFT_FILE|REPLACE_REF_BASE|NAMESPACE)$/i, GIT_ENV = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !GIT_LOCATION.test(k))), GIT_NO_REPLACE_OBJECTS: "1" }; // G2 F-1, T-8
const git = (dir, args) => { const r = spawnSync("git", ["-C", dir, ...args], { encoding: "utf8", env: GIT_ENV }); return r.status === 0 ? r.stdout : null; };
/** {bytes} of <path> in the git object of <commit> under <dir> (no filter, no shell: CRLF of a checkout never reaches them), or
 *  {bytes: null, why}: git's first stderr line, kept for the refusal (G2 F-4). */
const blob = (dir, commit, path) => { try { return { bytes: execFileSync("git", ["-C", dir, "cat-file", "blob", `${commit}:${path}`], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 28, env: GIT_ENV }), why: "" }; }
  catch (e) { return { bytes: null, why: (String(e?.stderr ?? "").trim().split("\n")[0] || String(e?.code ?? e?.message ?? e)).trim() }; } };

/** manifestText(files): "<sha256>  <path>" lines for [{path, bytes}], sorted by path, LF ended. */
export const manifestText = (files) => [...files].sort(byPath).map((f) => `${sha(f.bytes)}  ${f.path}\n`).join("");

/** plan({inputs, release, date, roots}) -> {files, problems}: reads, never writes; VERSION and MANIFEST.sha256 only without problem. */
export function plan({ inputs, release, date, roots }) {
  const problems = [], add = (code, detail) => problems.push({ code, detail }), files = [], objects = new Map(), once = (dir, commit, path) => { const k = [dir, commit, path].join("\0"); if (!objects.has(k)) objects.set(k, blob(dir, commit, path)); return objects.get(k); }; // each object read once (G2 T-3)
  if (!validDate(date)) add("date_invalid", String(date));
  const rel = Object.hasOwn(inputs.releases, release) ? inputs.releases[release] : null;
  if (rel === null) return { files, problems: [...problems, { code: "release_unknown", detail: String(release) }] };
  for (const e of rel.entries) {
    const dir = roots[e.root], abs = dir === undefined ? null : join(dir, e.path), at = `${e.out} <- ${e.root}:${e.path}`;
    if (abs === null) { add("root_missing", `${e.out}: root ${e.root} not given`); continue; }
    // SPEC-PUBLISH-PREVIOUS-BLOBS-1: a previous entry is the committed object of previous_commit, never the working tree.
    const got = e.root === "previous" ? once(dir, rel.previous_commit, e.path) : null;
    if (got !== null && got.bytes === null) { add("previous_blob_missing", `${at} is not readable in ${rel.previous_commit}: ${got.why}`); continue; }
    if (e.root === "governance" && STRUCTURAL_BLACKLIST.some((re) => re.test(e.path))) { add("input_blacklisted", at); continue; }
    if (e.root !== "previous" && !existsSync(abs)) { add("input_missing", at); continue; }
    if (e.root !== "previous" && !realpathSync(abs).startsWith(realpathSync(dir) + sep)) { add("input_escapes", `${at} resolves out of its root`); continue; }
    if (e.root !== "previous" && !statSync(abs).isFile()) { add("input_not_file", at); continue; }
    const bytes = got !== null ? got.bytes : readFileSync(abs);
    if (sha(bytes) !== e.sha256) { add("input_digest", `${at} is ${sha(bytes)}, pinned ${e.sha256}`); continue; }
    const prior = roots.previous, was = prior === undefined || rel.previous_commit === null ? null : once(prior, rel.previous_commit, e.out).bytes; // carried: committed, same bytes
    problems.push(...contentProblems(e.out, e.kind, bytes, release, was !== null && was.equals(bytes)));
    files.push({ path: e.out, bytes });
  }
  const prev = roots.previous;
  if (rel.previous_commit !== null && prev === undefined) add("root_missing", `previous tree at ${rel.previous_commit} not given`);
  else if (rel.previous_commit !== null) {
    const outs = new Set([...rel.entries.map((e) => e.out), ...RESERVED]); // declared outputs: a missing input is input_missing, not withdrawn
    const [top, head] = (git(prev, ["rev-parse", "--show-toplevel", "HEAD"]) ?? "").split("\n");
    if (!existsSync(prev) || !top || realpathSync(top) !== realpathSync(prev) || head !== rel.previous_commit) add("previous_commit", `${prev} is not the top of a git tree at ${rel.previous_commit}`);
    else if (git(prev, ["status", "--porcelain"]) !== "") add("previous_dirty", `${prev} has local changes`);
    else for (const p of (() => { const ls = (git(prev, ["ls-files", "-z"]) ?? "").split("\0"), dir = (x) => (/^contract-[^/]*\//i.test(x) ? x.split("/")[0].toLowerCase() : null);
      const dirs = new Set(ls.map(dir).filter(Boolean));
      for (const o of outs) if (dirs.has(dir(o)) && !ls.includes(o)) add("added_to_published", `${o} is new under ${o.split("/")[0]}/, which is published: a release adds under a new directory`);
      else if (dir(o) !== null && !dirs.has(dir(o)) && o.split("/")[0] !== release) add("foreign_version_dir", `${o}: a release creates only its own directory, ${String(release)}/`);
      return ls; })()) {
      if (p !== "" && !outs.has(p)) add("withdrawn", `${p} is published, the release drops it`);
      const now = files.find((f) => f.path === p); // a file under a version directory is never rewritten: one $id, one content
      const old = /^contract-[^/]*\//i.test(p) && now !== undefined ? once(prev, rel.previous_commit, p) : null; // never compared with empty bytes (G2 F-2)
      if (old !== null && old.bytes === null) add("previous_blob_missing", `${p} is published, its object is not readable in ${rel.previous_commit}: ${old.why}`);
      else if (old !== null && !now.bytes.equals(old.bytes)) add("rewritten", `${p} is published with other bytes, the release changes it`);
    }
  }
  problems.push(...retireProblems(files)); if (problems.length > 0) return { files: [], problems };
  files.push({ path: "VERSION", bytes: Buffer.from(date + "\n") });
  return { files: [...files.sort(byPath), { path: "MANIFEST.sha256", bytes: Buffer.from(manifestText(files)) }], problems };
}

/** listTree(dir) -> sorted relative POSIX paths of the files under dir, .git excluded. */
export function listTree(dir, rel = "") {
  return readdirSync(join(dir, rel)).map((n) => (rel === "" ? n : `${rel}/${n}`)).filter((p) => p !== ".git")
    .flatMap((p) => (statSync(join(dir, p)).isDirectory() ? listTree(dir, p) : [p])).sort();
}

/** compareTrees(produced, published) -> {equal, differ, missing, extra}: missing = only published, extra = only produced. */
export function compareTrees(produced, published) {
  const a = listTree(produced), b = listTree(published), r = { equal: [], differ: [], missing: b.filter((p) => !a.includes(p)), extra: [] };
  for (const p of a) {
    if (!b.includes(p)) r.extra.push(p);
    else if (readFileSync(join(produced, p)).equals(readFileSync(join(published, p)))) r.equal.push(p);
    else r.differ.push(p);
  }
  return r;
}

/** produce(o) -> {files: [{path, sha256, bytes}], manifest_sha256}; throws SpecPublishError and leaves --out as it was on any failure. */
export function produce({ inputs, release, date, roots, out }) {
  const { files, problems } = plan({ inputs, release, date, roots }), parent = dirname(out);
  if (problems.length > 0) throw new SpecPublishError("refused", `${problems.length} problem(s)`, problems);
  if (existsSync(out) && readdirSync(out).length > 0) throw new SpecPublishError("out_not_empty", `${out} is not empty`);
  if (!existsSync(parent)) throw new SpecPublishError("out_parent_missing", `${parent} does not exist`);
  if (git(parent, ["rev-parse", "--show-toplevel"]) !== null) throw new SpecPublishError("out_in_git_tree", `${out} is inside a git working tree`);
  const tmp = mkdtempSync(join(parent, ".spec-publish-"));
  try {
    for (const f of files) { const p = join(tmp, f.path); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, f.bytes); chmodSync(p, 0o644); }
    chmodSync(tmp, 0o755);
    renameSync(tmp, out); // over an empty --out where rename(2) allows it (POSIX); elsewhere write_failed and --out untouched
  } catch (e) {
    rmSync(tmp, { recursive: true, force: true });
    throw new SpecPublishError("write_failed", `${e.message}; nothing left in ${out}`);
  }
  return { files: files.map((f) => ({ path: f.path, sha256: sha(f.bytes), bytes: f.bytes.length })), manifest_sha256: sha(files.at(-1).bytes) };
}

export function parseArgs(argv) {
  const a = { roots: {} }, usage = (why) => { throw new SpecPublishError("usage", why); };
  for (let i = 0; i < argv.length; i += 2) {
    const [k, v] = [argv[i], argv[i + 1]], m = /^([a-z]+)=(.+)$/.exec(v ?? "");
    if (v === undefined) usage(`${k} needs a value`);
    else if (k === "--root" && m && ROOTS.includes(m[1]) && !Object.hasOwn(a.roots, m[1])) a.roots[m[1]] = resolve(m[2]);
    else if (["--release", "--date", "--out", "--verify", "--inputs"].includes(k) && !Object.hasOwn(a, k.slice(2))) a[k.slice(2)] = v;
    else usage(`unknown, repeated or malformed option ${k} ${v}`);
  }
  if (!a.release || !a.date || !a.out) usage("--release <id> --date <YYYY-MM-DD> --out <dir> are required");
  return a;
}

export function main(argv) {
  let a;
  try { a = parseArgs(argv); } catch (e) { console.error(`spec-publish: ${e.message}`); return 2; }
  try {
    const out = resolve(a.out), inputs = loadInputs(a.inputs === undefined ? undefined : resolve(a.inputs));
    const r = produce({ inputs, release: a.release, date: a.date, roots: { governance: REPO_ROOT, ...a.roots }, out });
    for (const f of r.files) console.log(`${f.sha256}  ${f.path}`);
    console.log(`spec-publish OK: release ${a.release}, version ${a.date}, ${r.files.length} file(s) -> ${out}; MANIFEST.sha256 ${r.manifest_sha256}`);
    if (a.verify === undefined) return 0;
    const c = compareTrees(out, resolve(a.verify)), diff = c.differ.length + c.missing.length + c.extra.length;
    for (const k of ["differ", "missing", "extra"]) for (const p of c[k]) console.log(`${k.padEnd(7)} ${p}`);
    console.log(`verify ${diff === 0 ? "EQUAL" : "DIFFERENT"}: ${c.equal.length} equal, ${c.differ.length} differ, ${c.missing.length} missing, ${c.extra.length} extra`);
    return diff === 0 ? 0 : 1;
  } catch (e) {
    console.error(`spec-publish REFUSED: ${e.message}`);
    for (const p of e.problems ?? []) console.error(`  ${p.code}  ${p.detail}`);
    return 1;
  }
}

/** The rows a published table file may not carry (contract 1.1.0, section 10): SHORT_N points or fewer (n or p_served); outside the
 *  synthetic fixtures, a digest that the import guard refuses too (digestProblems of apps/harness/src/policy-digest-floor.ts: a 0/1
 *  digest with fewer than 2^128 compatible sequences, or the digest of an unstated sequence; SHORT-DIGEST-INVERSION-1); and a row with a
 *  recompute before the published list of verifiers (VERIFIERS-LIST-F5A-1). The writer of the table files calls this same function. */
export const SHORT_N = 30;
export function tableRowProblems(table, fixture = false) {
  const cls = String(table.class?.task_class), all = Array.isArray(table.rows) ? table.rows : [], rows = all.filter(isObj), int = (x) => Number.isSafeInteger(x);
  if (rows.length !== all.length) return [{ code: "policy_table_invalid", detail: `${cls} has a row that is not an object` }];
  const held = fixture ? [] : rows.filter((r) => r.recompute !== null).map((r) => String(r.cell_key));
  const why = (r) => [!int(r.n) || r.n <= SHORT_N ? `n ${String(r.n)}` : null, r.p_served !== null && (!int(r.p_served) || r.p_served <= SHORT_N) ? `p_served ${String(r.p_served)}` : null,
    ...(fixture ? [] : digestProblems(r))].filter((x) => x !== null);
  const short = rows.filter((r) => why(r).length > 0).map((r) => `${String(r.cell_key)} (${why(r).join(", ")})`);
  return [...(held.length > 0 ? [{ code: "recompute_held", detail: `VERIFIERS-LIST-F5A-1: ${cls} has a row with a recompute (${held.join(", ")}); the published list of verifiers comes first` }] : []),
    ...(short.length > 0 ? [{ code: "short_digest", detail: `SHORT-DIGEST-INVERSION-1: ${cls} has a row whose digests cover ${String(SHORT_N)} points or fewer, an unstated sequence, or fewer than 2^${String(DIGEST_FLOOR_BITS)} compatible sequences: ${short.join(", ")}` }] : [])];
}

const real = (p) => { try { const r = realpathSync(p); return process.platform === "win32" ? r.toLowerCase() : r; } catch { return null; } }; // a link or a junction too
if (process.argv[1] && real(process.argv[1]) !== null && real(process.argv[1]) === real(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));

// F-1 of ENGINE-ROW-RETIRE-PATH-1 (lot R-b; MONARK's review of its G0, section 5; M-1 of its G2): a table file of the release, under any
// policy/ segment, that publishes a retired row (status "retired") lies in a dated table version, contract-<x.y.z>-tables-<date>/policy/,
// and the release holds that directory's retire list, <dir>/retire/retire-<date>.json, its own or carried from the previous release
// (retire_list_missing); a retire list lies at <dated directory>/retire/retire-<its date>.json only (retire_list_invalid), as its own
// canonical writing (not_canonical), never rewritten after (rewritten). Its entries are R-a's to read, not this gate's. A function
// declaration, hoisted, kept last so that no line above moves (scripts/red-proof.mjs precedent); main runs above, so no const out here.
function retireProblems(files) {
  const p = [], text = (f) => f.bytes.toString("utf8"), dated = /^(contract-(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)-tables-(\d{4}-\d{2}-\d{2}))\/policy\/[^/]+$/;
  const list = (f) => { const m = dated.exec(f.path); return m !== null && validDate(m[2]) ? `${m[1]}/retire/retire-${m[2]}.json` : null; }; // its directory's list: a dated one only
  const retired = files.filter((f) => /(^|\/)policy\//i.test(f.path) && (() => { try { return JSON.parse(text(f)).rows.some((r) => r?.status === "retired"); } catch { return false; } })());
  const off = retired.filter((f) => !files.some((x) => x.path === list(f))); // its own list or a carried one: both are files of the release
  if (off.length > 0) p.push({ code: "retire_list_missing", detail: `${off.map((f) => f.path).join(", ")}: a retired row is published from a dated table version only, contract-<x.y.z>-tables-<date>/policy/, with the retire list of its directory, <dir>/retire/retire-<date>.json (F-1)` });
  for (const f of files.filter((x) => /(^|\/)retire\//i.test(x.path))) {
    const m = /^contract-(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)-tables-(\d{4}-\d{2}-\d{2})\/retire\/retire-(\d{4}-\d{2}-\d{2})\.json$/.exec(f.path);
    if (m === null || m[1] !== m[2]) p.push({ code: "retire_list_invalid", detail: `${f.path}: a retire list lies at <dated directory>/retire/retire-<its date>.json` });
    else if ((() => { try { return canonicalJson(JSON.parse(text(f))) !== text(f); } catch { return true; } })()) p.push({ code: "not_canonical", detail: `${f.path}: a retire list is its own canonical writing` });
  }
  return p;
}

// SHORT-DIGEST-INVERSION-1: the digest rule of tableRowProblems, shared with the import guard (guardKataRow). Imported last, not at the
// top, so that the import moves no line (killers pin them; the retireProblems precedent above); imports are hoisted.
import { DIGEST_FLOOR_BITS, digestProblems } from "../apps/harness/src/policy-digest-floor.ts";

// VOCAB-VENUE-FIELDS-1 (RECHERCHES, 76ffa25): a row of a table carries the venue of its cell twice outside its key, in the column venue and
// in the third segment of source.trial_id (<taskClass>|<kataId>|<venue>|<symbol>|<horizon>|<attempt>, policy-projection.ts). Both are
// masked like the venue segment of a key, but BOUND TO ONE PINNED VALUE, never exempted by field name: only in a row of a table of a
// policy-table file or of the vectors file (VECTORS), and only when the value is exactly the pinned venue of wave 1, the one venue of all
// 280 cells of the registry 811fcd57. Another value in these fields, the name in any other field or in free text stays refused. The
// decoded pass masks a copy of the parsed value; the byte pass masks the same members in the text only when it finds exactly as many as
// the parsed value holds (an escaped, repeated or stray member masks nothing). Function declarations, hoisted, kept last (retireProblems).

/** waveVenue() -> the pin: the venue of every cell of the wave 1 registry, by that registry's sha256 and size. */
export function waveVenue() {
  return Object.freeze({ venue: "binance", registry_sha256: "811fcd574e182f33e24e19795b18139adb1917cf392a02810705c6adda1dd9cb", cells: 280 });
}

/** venueMasked(v, out, kind) -> {value, venues, trials}: a copy of v with the pinned venue masked in the two fields of each row of the
 *  tables it may hold (none outside a policy-table file and the vectors file), and the number of fields masked. */
export function venueMasked(v, out, kind) {
  const value = structuredClone(v), pin = waveVenue().venue, r = { value, venues: 0, trials: 0 };
  if (kind !== "policy-table" && !(kind === "json" && VECTORS.test(out))) return r;
  for (const { table } of tablesIn(value)) for (const row of table.rows.filter(isObj)) {
    if (row.venue === pin) { row.venue = "KEY"; r.venues++; }
    const t = isObj(row.source) && typeof row.source.trial_id === "string" ? row.source.trial_id.split("|") : [];
    if (t.length === 6 && t[2] === pin) { row.source.trial_id = [...t.slice(0, 2), "KEY", ...t.slice(3)].join("|"); r.trials++; }
  }
  return r;
}

/** venueMaskedText(text, out, kind) -> the text with the members masked by venueMasked replaced, when the text holds exactly as many
 *  members "venue":"<pin>" and "trial_id":"…|…|<pin>|…|…|…" as the parsed value masks; else the text unchanged. */
export function venueMaskedText(text, out, kind) {
  let v;
  try { v = JSON.parse(text); } catch { return text; }
  const m = venueMasked(v, out, kind), pin = waveVenue().venue, seg = '[^"\\|]*';
  const venue = new RegExp(`"venue"(\\s*):(\\s*)"${pin}"`, "g"), trial = new RegExp(`"trial_id"(\\s*):(\\s*)"(${seg}\\|${seg})\\|${pin}\\|(${seg}\\|${seg}\\|${seg})"`, "g");
  if ((m.venues === 0 && m.trials === 0) || (text.match(venue) ?? []).length !== m.venues || (text.match(trial) ?? []).length !== m.trials) return text;
  return text.replace(venue, '"venue"$1:$2"KEY"').replace(trial, '"trial_id"$1:$2"$3|KEY|$4"');
}
