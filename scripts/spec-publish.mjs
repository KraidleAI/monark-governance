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
// table file must be its own canonical writing, so its sha256 is its policy_table_sha256), previous_commit, previous_dirty, withdrawn
// (a file of the previous tree the release drops); then out_not_empty, out_parent_missing, out_in_git_tree, write_failed. --verify
// <dir> then compares --out with <dir> (.git ignored): exit 0 iff the same paths with the same bytes. Exit 2: usage.
import { spawnSync } from "node:child_process";
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
const okPath = (p) => /^[\w.-]+(\/[\w.-]+)*$/.test(String(p)) && p.split("/").every((s) => s !== "." && s !== "..") && p.split("/")[0] !== ".git";
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

/** contentProblems(out, kind, bytes) -> [{code, detail}]: what keeps one output file out of a version. JSON is also gated decoded. */
export function contentProblems(out, kind, bytes) {
  let text;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { return [{ code: "not_text", detail: `${out}: not UTF-8` }]; }
  if (text.includes("\0")) return [{ code: "not_text", detail: `${out}: a NUL byte` }];
  const p = vocabularyHits(text).map((h) => ({ code: "vocabulary", detail: `${out}:${h.line} [${h.rule}] ${h.word}` }));
  if (text.includes("\r")) p.push({ code: "crlf", detail: `${out}: a CR byte (LF line ends only)` });
  if (kind === "text") return p;
  let v;
  try { v = JSON.parse(text); } catch (e) { return [...p, { code: "json_invalid", detail: `${out}: ${e.message}` }]; }
  p.push(...vocabularyHits(strings(v).join("\n")).map((h) => ({ code: "vocabulary", detail: `${out}: a decoded string [${h.rule}] ${h.word}` })));
  if (kind === "schema" && !(isObj(v) && typeof v.$schema === "string")) p.push({ code: "schema_invalid", detail: `${out}: no $schema` });
  if (kind !== "policy-table") return p;
  if (!isObj(v) || v.row_format !== "class-policy-v2" || !isObj(v.class) || !Array.isArray(v.rows) || out.replace(/^[\w.-]+\/(?=policy\/)/, "") !== `policy/${String(v.class.task_class)}.json`) {
    p.push({ code: "policy_table_invalid", detail: `${out}: not a class-policy-v2 table file named [<version>/]policy/<class.task_class>.json` });
  }
  try { if (canonicalJson(v) !== text) p.push({ code: "not_canonical", detail: `${out}: the bytes are not the canonical writing` }); }
  catch (e) { p.push({ code: "not_canonical", detail: `${out}: ${e.message}` }); }
  return p;
}

const git = (dir, args) => { const r = spawnSync("git", ["-C", dir, ...args], { encoding: "utf8" }); return r.status === 0 ? r.stdout : null; };

/** manifestText(files): "<sha256>  <path>" lines for [{path, bytes}], sorted by path, LF ended. */
export const manifestText = (files) => [...files].sort(byPath).map((f) => `${sha(f.bytes)}  ${f.path}\n`).join("");

/** plan({inputs, release, date, roots}) -> {files, problems}: reads, never writes; VERSION and MANIFEST.sha256 only without problem. */
export function plan({ inputs, release, date, roots }) {
  const problems = [], add = (code, detail) => problems.push({ code, detail }), files = [];
  if (!validDate(date)) add("date_invalid", String(date));
  const rel = Object.hasOwn(inputs.releases, release) ? inputs.releases[release] : null;
  if (rel === null) return { files, problems: [...problems, { code: "release_unknown", detail: String(release) }] };
  for (const e of rel.entries) {
    const dir = roots[e.root], abs = dir === undefined ? null : join(dir, e.path), at = `${e.out} <- ${e.root}:${e.path}`;
    if (abs === null) { add("root_missing", `${e.out}: root ${e.root} not given`); continue; }
    if (e.root === "governance" && STRUCTURAL_BLACKLIST.some((re) => re.test(e.path))) { add("input_blacklisted", at); continue; }
    if (!existsSync(abs)) { add("input_missing", at); continue; }
    if (!realpathSync(abs).startsWith(realpathSync(dir) + sep)) { add("input_escapes", `${at} resolves out of its root`); continue; }
    if (!statSync(abs).isFile()) { add("input_not_file", at); continue; }
    const bytes = readFileSync(abs);
    if (sha(bytes) !== e.sha256) { add("input_digest", `${at} is ${sha(bytes)}, pinned ${e.sha256}`); continue; }
    problems.push(...contentProblems(e.out, e.kind, bytes));
    files.push({ path: e.out, bytes });
  }
  const prev = roots.previous;
  if (rel.previous_commit !== null && prev === undefined) add("root_missing", `previous tree at ${rel.previous_commit} not given`);
  else if (rel.previous_commit !== null) {
    const outs = new Set([...rel.entries.map((e) => e.out), ...RESERVED]); // declared outputs: a missing input is input_missing, not withdrawn
    const [top, head] = (git(prev, ["rev-parse", "--show-toplevel", "HEAD"]) ?? "").split("\n");
    if (!existsSync(prev) || !top || realpathSync(top) !== realpathSync(prev) || head !== rel.previous_commit) add("previous_commit", `${prev} is not the top of a git tree at ${rel.previous_commit}`);
    else if (git(prev, ["status", "--porcelain"]) !== "") add("previous_dirty", `${prev} has local changes`);
    else for (const p of (git(prev, ["ls-files", "-z"]) ?? "").split("\0")) if (p !== "" && !outs.has(p)) add("withdrawn", `${p} is published, the release drops it`);
  }
  if (problems.length > 0) return { files: [], problems };
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

const real = (p) => { try { const r = realpathSync(p); return process.platform === "win32" ? r.toLowerCase() : r; } catch { return null; } }; // a link or a junction too
if (process.argv[1] && real(process.argv[1]) !== null && real(process.argv[1]) === real(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
