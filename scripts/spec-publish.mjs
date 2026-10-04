// scripts/spec-publish.mjs -- producer of the content of the public spec repository KraidleAI/monark-kata-spec (lot
// SPEC-PUBLISH-PIPELINE-1). Node 24, no dependency beyond this repository's own gate modules.
//
//   node scripts/spec-publish.mjs --release <id> --date <YYYY-MM-DD> --out <dir> [--root <name>=<dir>]... [--verify <dir>] [--inputs <file>]
//
// It writes ONE dated version of the spec repository into a LOCAL, absent or empty --out directory: every file of the release's closed
// input list (scripts/spec-publish-inputs.json), copied byte for byte from its declared source, plus VERSION (the date argument and a
// LF) and MANIFEST.sha256 ("<sha256>  <path>" per other file, sorted by path, LF; `sha256sum -c --strict MANIFEST.sha256` checks it).
// The date argument is the only time in the output: the same sources and date give the same bytes. It never publishes and never
// writes outside --out; its only git commands are three reads of the previous published tree. Publication stays MONARK's act (F-5).
//
// Roots: "governance" (this repository by default), "recherches" (a clone of that repository) and "previous" (a clean checkout of the
// spec repository at the release's previous_commit); an input of an external root pins its sha256. FAIL-CLOSED (exit 1, nothing
// written), each problem named by its code: release_unknown, date_invalid, root_missing, input_blacklisted, input_missing,
// input_digest, not_text, crlf, vocabulary, json_invalid, schema_invalid, policy_table_invalid, not_canonical (a policy table file
// must be its own canonical writing, so its sha256 is its policy_table_sha256), previous_commit, previous_dirty, withdrawn (a file
// of the previous tree the release drops). --verify <dir> then compares --out with <dir> (.git ignored): exit 0 iff the same paths
// with the same bytes. Exit 2: usage.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadExempt, scanText as scanLang } from "./lang-gate.mjs";
import { compilePatterns, scanText as scanVocab } from "./grep-forbidden.mjs";
import { DATA_SOURCE_FORMS, HOSTING_FORMS, KITCHEN_FORMS, OPERATOR_FORMS, SECRET_SHAPES } from "./public-text-deny.mjs";
import { STRUCTURAL_BLACKLIST, WINDOWS_ABS_PATH_RE } from "./export-public.mjs";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const INPUTS_FILE = "scripts/spec-publish-inputs.json";
export const ROOTS = Object.freeze(["governance", "recherches", "previous"]);
export const EXTERNAL_ROOTS = Object.freeze(["recherches", "previous"]);
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
    const outs = new Set();
    for (const e of rel.entries) {
      if (!closed(e, ["out", "root", "path", "kind", "sha256", "note"])) bad(`${id}: entry keys`);
      if (!okPath(e.out) || RESERVED.includes(e.out) || outs.has(e.out)) bad(`${id}: output ${e.out}`);
      outs.add(e.out);
      if (!ROOTS.includes(e.root) || !okPath(e.path) || !KINDS.includes(e.kind)) bad(`${id}: ${e.out} source or kind`);
      if (e.sha256 !== null && !/^[0-9a-f]{64}$/.test(String(e.sha256))) bad(`${id}: ${e.out} sha256`);
      if (e.sha256 === null && EXTERNAL_ROOTS.includes(e.root)) bad(`${id}: ${e.out} comes from ${e.root} and must pin its sha256`);
      if (e.root === "previous" && rel.previous_commit === null) bad(`${id}: ${e.out} reads the previous tree, previous_commit is null`);
    }
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

// ---- The vocabulary gate of the public spec repository: a closed list of rules. Venue names are not banned there (BLQ-DEP-7). ----
export const GATE_RULES = Object.freeze(["lang", "claims", "vendor", "kitchen", "secret", "path", "format", "email"]);
const anyCase = (forms) => forms.map((f) => new RegExp(f.re.source, `${f.re.flags.replace("i", "")}i`));
// The form G0..G7 stays out: the published report and vectors cite a plan file named "...-G0-..." (measured at ddfee9e).
const FORMS = [["vendor", anyCase([...DATA_SOURCE_FORMS, ...OPERATOR_FORMS, ...HOSTING_FORMS])],
  ["kitchen", [...KITCHEN_FORMS.filter((f) => f.why !== "gate G0..G7").map((f) => f.re), /\bRECHERCHES\b/]], ["secret", SECRET_SHAPES],
  ["path", [WINDOWS_ABS_PATH_RE]], ["format", [/\p{Cf}/u]], ["email", [/(?<![\w.+-])(?!noreply@)[\w.+-]+@[\w-]+\.[A-Za-z][\w.]*/]]];
let gateConfig = null;

/** vocabularyHits(text) -> [{rule, line, word}]: every hit of the spec repository's gate, empty when the text is clean. */
export function vocabularyHits(text) {
  gateConfig ??= { maskers: loadExempt(REPO_ROOT).maskers, claims: compilePatterns(JSON.parse(readFileSync(join(REPO_ROOT, "vocab-banned.json"), "utf8")).banned) };
  const hits = [...scanLang(text, gateConfig.maskers).map((h) => ({ rule: "lang", line: h.line, word: h.word })),
    ...scanVocab(text, gateConfig.claims).map((h) => ({ rule: "claims", line: h.line, word: h.word }))];
  text.split("\n").forEach((l, i) => {
    for (const [rule, res] of FORMS) for (const re of res) { const m = re.exec(l); if (m) hits.push({ rule, line: i + 1, word: rule === "secret" ? "(masked)" : m[0] }); }
  });
  return hits;
}

/** contentProblems(out, kind, bytes) -> [{code, detail}]: what keeps one output file out of a version. */
export function contentProblems(out, kind, bytes) {
  let text;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { return [{ code: "not_text", detail: `${out}: not UTF-8` }]; }
  if (text.includes("\0")) return [{ code: "not_text", detail: `${out}: a NUL byte` }];
  const p = vocabularyHits(text).map((h) => ({ code: "vocabulary", detail: `${out}:${h.line} [${h.rule}] ${h.word}` }));
  if (text.includes("\r")) p.push({ code: "crlf", detail: `${out}: a CR byte (LF line ends only)` });
  if (kind === "text") return p;
  let v;
  try { v = JSON.parse(text); } catch (e) { return [...p, { code: "json_invalid", detail: `${out}: ${e.message}` }]; }
  if (kind === "schema" && !(isObj(v) && typeof v.$schema === "string")) p.push({ code: "schema_invalid", detail: `${out}: no $schema` });
  if (kind !== "policy-table") return p;
  if (!isObj(v) || v.row_format !== "class-policy-v2" || !isObj(v.class) || !Array.isArray(v.rows) || out !== `policy/${String(v.class.task_class)}.json`) {
    p.push({ code: "policy_table_invalid", detail: `${out}: not a class-policy-v2 table file named policy/<class.task_class>.json` });
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
    const dir = roots[e.root], abs = dir === undefined ? null : join(dir, e.path);
    if (abs === null) { add("root_missing", `${e.out}: root ${e.root} not given`); continue; }
    if (e.root === "governance" && STRUCTURAL_BLACKLIST.some((re) => re.test(e.path))) { add("input_blacklisted", `${e.out} <- ${e.path}`); continue; }
    if (!existsSync(abs) || !statSync(abs).isFile()) { add("input_missing", `${e.out} <- ${e.root}:${e.path}`); continue; }
    const bytes = readFileSync(abs);
    if (e.sha256 !== null && sha(bytes) !== e.sha256) { add("input_digest", `${e.out} <- ${e.root}:${e.path} is ${sha(bytes)}, pinned ${e.sha256}`); continue; }
    problems.push(...contentProblems(e.out, e.kind, bytes));
    files.push({ path: e.out, bytes });
  }
  const prev = roots.previous;
  if (rel.previous_commit !== null && prev === undefined) add("root_missing", `previous tree at ${rel.previous_commit} not given`);
  else if (rel.previous_commit !== null) {
    const outs = new Set([...rel.entries.map((e) => e.out), ...RESERVED]); // declared outputs: a missing input is input_missing, not withdrawn
    if (git(prev, ["rev-parse", "HEAD"])?.trim() !== rel.previous_commit) add("previous_commit", `${prev} is not at ${rel.previous_commit}`);
    else if (git(prev, ["status", "--porcelain"]) !== "") add("previous_dirty", `${prev} has local changes`);
    else for (const p of (git(prev, ["ls-files", "-z"]) ?? "").split("\0")) if (p !== "" && !outs.has(p)) add("withdrawn", `${p} is published, the release drops it`);
  }
  if (problems.length > 0) return { files: [], problems };
  files.push({ path: "VERSION", bytes: Buffer.from(`${date}\n`) });
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

/** produce(o) -> {files: [{path, sha256, bytes}], manifest_sha256}; throws SpecPublishError before any write on a problem. */
export function produce({ inputs, release, date, roots, out }) {
  const { files, problems } = plan({ inputs, release, date, roots });
  if (problems.length > 0) throw new SpecPublishError("refused", `${problems.length} problem(s)`, problems);
  if (existsSync(out) && readdirSync(out).length > 0) throw new SpecPublishError("out_not_empty", `${out} is not empty`);
  for (const f of files) { mkdirSync(dirname(join(out, f.path)), { recursive: true }); writeFileSync(join(out, f.path), f.bytes); }
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

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
