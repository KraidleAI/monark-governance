// scripts/journal/index.mjs - the lot journal written by a tool, its generated index and the closing controls (ADR-METHODE-2
// D8a, D10, D11, D12 (d); lots M-5 and M-5b; orchestrator decisions 275-e and 275-d). Node 24, zero dependencies.
//   add   --repo <tree> --lot <LOT> --gate <gate> [--tour n] [--commit <sha>] [--tree-head <sha>] [--from-recu <receipt>]
//         [--from-oracle <record>] [--model <resolved>] [--tier <id>] [--effort <e>] [--r25 <n>[/<cap>]] [--verdict <v>]
//         [--adjudication <text>] [--origin <code>[,<code>]] [--trace <kind>:<ref>] [--note <text>] [--corrections <b>/<nb>]
//   build --repo <tree> [--only <lot>] [--json]
// add builds ONE entry of schema monark.journal.v1 (every field of FIELDS, null when not applicable), sets `date` itself (UTC
// to the second; no option sets it), checks J-SCHEMA only (a fact incomplete from another point of view is recorded, build
// reddens it), appends one line to <tree>/docs/journal/<LOT>.jsonl and prints it; usage or J-SCHEMA: exit 2, nothing written.
// --from-recu fills `mission` from a green receipt of scripts/mission/launch.mjs (recu_head = its head) and the sha256 of the
// mission bytes read now, and `tier` from the Palier field of that mission (generated or hand-written; M-5b): --tier given
// and different, or no field and no --tier, exits 2 (TIER-FROM-HEADER); --from-oracle fills `oracle` (and tree_head) from a
// record of scripts/oracle/run.mjs and its sha256.
// add stores absolute paths; a relative path in an entry is read from --repo (frozen fixtures).
// --r25 of an entry: the R-25 of the gel the entry records (insertions + deletions of the lot diff at that gel, the entry line included).
// build reads every docs/journal/*.jsonl and prints one line per hit `code lot:line extract`, the count per code, the verdict.
// Green only, it writes docs/journal/INDEX.md, dated by the last entry, never by the clock; red leaves the previous index.
// --only <lot>: that lot alone, never an index. Exit 0 green, 1 red, 2 usage, unreadable journal or tool error. Green proves
// the coherence of the facts the controls below read, never that a verdict is right (MAST FM-2.6). A line red on J-SCHEMA is
// read by no other control; J-ORACLE, J-RECU and J-LINT read outside the repository and fail closed (absent: red, never skipped).
//   J-SCHEMA a field outside FIELDS or missing, a value outside its domain (no text holds a control byte or "F:" + two spaces:
//            the byte guard of lot M-1 covers docs/journal/), a field null where NEED requires it, a lot != its file, an oracle at G0, cp-1 or fusion
//   J-TIME   date before the committer date (%cI) of commit or commit unknown, or the dates of a lot decreasing
//   J-TRACE  a G7 without public_trace, or a trace with an empty ref (D10)
//   J-ORIGIN an error_origin code outside the vocabulary of audit A plus G2 (D11 and its dated line of 2026-09-28)
//   J-TOURS  more than 5 distinct corr tours (values of tour) in a lot and no G7 with an adjudication (D12 (d))
//   J-ORACLE G2, cp-2, G7 (required), G1 and corr (if cited; G0, cp-1, fusion: refused by J-SCHEMA): record absent or not JSON, sha256 !=
//            oracle.sha256, incomplete (REQUIRED of scripts/oracle/run.mjs:33, schema, pid, tree.object), role != gate, static_only
//            or exit != 0, a field copied != the record; G2, cp-2, G7 also: tree.head != commit, start before the commit date,
//            served_from or tree.dirty not null (a full, clean replay). G1, corr: a run before the gel, dirty or served (D4) admitted,
//            bound to its launch (M-5b): tree.head != mission.recu_head, start before mission.recu_date, or a served record
//            (served_from.file, next to the citing one) absent, unreadable, of another sha256 or tree.head: red, never skipped
//   J-RECU   the mission file absent or its sha256 != mission.sha, or mission.sha != mission.recu_sha
//   J-LINT   a receipt (recu_sha) on a text that lintMission reddens at commit, else at recu_head (not a commit: red); repo paths
//            are read at that revision, never on disk; absolute paths, branches and tool directories on the host now (C-G2-8);
//            an R-PATH hit on a path that the generated header lists "(non suivi)" is removed, whatever the revision replayed
//            (LINT-UNTRACKED, M-5b; lint.mjs untouched): any other hit stays, R-TOOL on an untracked script included
//   J-MODEL  an entry with a mission, a tier or a model: tier outside TIERS, or the model is not the tier (token boundary)
//   J-ADJ    a G7 without a non-empty adjudication (its presence, never its nature)
// J-ORDER and J-VERDICT read only a lot file holding a G2 or cp-2 line (a file of retro G7 lines alone is not read):
//   J-ORDER  a cp-2 or G7 line at ACCEPTE or ACCEPTE-AVEC-CORRECTIONS whose nearest G2 or cp-2 line with a verdict ABOVE it in
//            the FILE (never by date: two lines can share a second; ESCALADE lines are transparent, neither witness nor target)
//            is missing, is not at ACCEPTE or ACCEPTE-AVEC-CORRECTIONS (a refusal is lifted by a review), or carries a commit
//            that is neither the line's commit nor an ancestor of it (git merge-base --is-ancestor; any git error: red)
//   J-VERDICT a verdict with corrections null; ACCEPTE with blocking > 0; ACCEPTE-AVEC-CORRECTIONS, CORRECTIONS-D-ABORD or REFUS
//            at 0/0; CORRECTIONS-D-ABORD with blocking 0; ESCALADE: no rule (corrections null admitted). Both check coherence
//            of the verdicts with their order and counts, never that a verdict is right (FM-2.6)
//   J-HEADER a mission holding a stamp line of scripts/mission/gen.mjs (else not read; M-5b): its HEAD line != mission.recu_head,
//            a stamp without sha256 (earlier format), or the stamp's sha256 != the blob scripts/mission/gen.mjs at the stamp's
//            own revision (the generator's checkout, never recu_head) resolved in --repo (unresolvable: red)
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { lintMission, TIERS } from "../mission/lint.mjs";

const CODES = ["J-SCHEMA", "J-TIME", "J-TRACE", "J-ORIGIN", "J-TOURS", "J-ORACLE", "J-RECU", "J-LINT", "J-MODEL", "J-ADJ", "J-ORDER", "J-VERDICT", "J-HEADER"];
const FIELDS = ["schema", "lot", "gate", "date", "tour", "commit", "tree_head", "mission", "model_resolved", "tier", "effort", "r25",
  "oracle", "corrections", "verdict", "adjudication", "error_origin", "public_trace", "note"];
const GATES = ["G0", "G1", "G2", "corr", "cp-1", "cp-2", "G7", "fusion"], ORACLED = ["G2", "cp-2", "G7"], PRE_GEL = ["G1", "corr"];
const VERDICTS = ["ACCEPTE", "ACCEPTE-AVEC-CORRECTIONS", "CORRECTIONS-D-ABORD", "REFUS", "ESCALADE"];
const REVIEWED = ["G2", "cp-2"], TARGETS = ["cp-2", "G7"], OK = ["ACCEPTE", "ACCEPTE-AVEC-CORRECTIONS"]; // J-ORDER, J-VERDICT
const STAMP_FIELD = "G\u00e9n\u00e9r\u00e9 :"; // the stamp line of scripts/mission/gen.mjs: a generated mission (LINT-UNTRACKED, J-HEADER)
const PALIER = /^Palier\s*:\s*`([^`\n]+)`/mu; // the Palier field as scripts/mission/lint.mjs reads it (trimmed, lower case): TIER-FROM-HEADER
const STAMP = /^G\u00e9n\u00e9r\u00e9 : `(?:[A-Za-z]:)?\/[^`]*\/scripts\/mission\/gen\.mjs` `([0-9a-f]{8})` sha256 `([0-9a-f]{64})` \d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/u; // = GENERATED of lint.mjs
const ORIGINS = ["G0", "G1", "G2", "ORCH", "OUT", "ANT", "VAL", "PROV", "NA"], KINDS = ["commit", "release", "note", "motif"];
// Non-null by gate. commit may be null at G0 and cp-1, and at G1 and corr (Q-M5-1): their entry precedes the gel it lands in.
const NEED = { tour: ["G2", "corr"], commit: ["G2", "cp-2", "G7", "fusion"], mission: ["G1", "G2", "corr", "cp-2"], oracle: ORACLED, error_origin: ["G7"] };
const REQUIRED = ["schema", "role", "tree", "base", "key", "pid", "start", "end", "static_only", "gates", "tests", "r25", "residues", "ci_only", "cv4", "exit", "served_from"]; // = scripts/oracle/run.mjs:33 (tested)
const SHA = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/, H64 = /^[0-9a-f]{64}$/, LOT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/, R25_CAP = 547;
const BAD = /[\x00-\x1f\x7f-\x9f]|(?<![A-Za-z0-9])F: {2}/;
const txt = (v, max = 5000) => typeof v === "string" && v.length <= max && !BAD.test(v);
const full = (v, max) => txt(v, max) && v.trim() !== "";
const nat = (v, min = 0) => Number.isInteger(v) && v >= min;
const iso = (v) => typeof v === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(v) && new Date(Date.parse(v) || 0).toISOString() === v.replace("Z", ".000Z");
const sha = (v) => typeof v === "string" && SHA.test(v);
const shape = (v, keys) => v !== null && typeof v === "object" && !Array.isArray(v) && Object.keys(v).sort().join() === [...keys].sort().join();
const DOMAIN = {
  schema: (v) => v === "monark.journal.v1", lot: (v) => typeof v === "string" && LOT.test(v), gate: (v) => GATES.includes(v), date: iso,
  tour: nat, commit: sha, tree_head: sha, model_resolved: (v) => full(v, 80), tier: (v) => full(v, 80),
  effort: (v) => ["low", "medium", "high", "xhigh", "max"].includes(v), verdict: (v) => VERDICTS.includes(v), adjudication: txt,
  mission: (v) => shape(v, ["path", "sha", "recu_sha", "recu_date", "recu_head"]) && full(v.path) && H64.test(v.sha)
    && (v.recu_sha === null ? v.recu_date === null && v.recu_head === null : H64.test(v.recu_sha) && iso(v.recu_date) && sha(v.recu_head)),
  oracle: (v) => shape(v, ["record", "sha256", "role", "head", "start", "served_from", "tests_total"]) && full(v.record) && H64.test(v.sha256)
    && full(v.role, 16) && sha(v.head) && iso(v.start) && typeof v.served_from === "object" && (v.tests_total === null || nat(v.tests_total)),
  r25: (v) => shape(v, ["lines", "cap"]) && nat(v.lines) && nat(v.cap, 1),
  corrections: (v) => shape(v, ["blocking", "nonblocking"]) && nat(v.blocking) && nat(v.nonblocking),
  error_origin: (v) => Array.isArray(v) && v.every((x) => txt(x, 16)),
  public_trace: (v) => shape(v, ["kind", "ref"]) && KINDS.includes(v.kind) && txt(v.ref, 500), note: (v) => txt(v, 500),
};
// add options -> [field, parse]; a value that does not parse stays a string, and J-SCHEMA refuses it.
const OPTS = {
  tour: ["tour", (s) => (/^\d+$/.test(s) ? Number(s) : s)], commit: ["commit"], "tree-head": ["tree_head"], model: ["model_resolved"], tier: ["tier"],
  effort: ["effort"], verdict: ["verdict"], adjudication: ["adjudication"], note: ["note"], origin: ["error_origin", (s) => (s === "" ? [] : s.split(","))],
  r25: ["r25", (s) => { const m = /^(\d+)(?:\/(\d+))?$/.exec(s); return m ? { lines: Number(m[1]), cap: Number(m[2] ?? R25_CAP) } : s; }],
  corrections: ["corrections", (s) => { const m = /^(\d+)\/(\d+)$/.exec(s); return m ? { blocking: Number(m[1]), nonblocking: Number(m[2]) } : s; }],
  trace: ["public_trace", (s) => { const m = /^([^:]*):(.*)$/s.exec(s); return m ? { kind: m[1], ref: m[2] } : s; }],
};
class Usage extends Error {}
const hash = (b) => createHash("sha256").update(b).digest("hex");
const abs = (p) => resolve(p).replace(/\\/g, "/"), base = (p) => p.split(/[\\/]/).at(-1);
const natural = (s) => s.replace(/\d+/g, (d) => d.padStart(9, "0"));
const bytesOf = (p, what) => { try { return readFileSync(p); } catch (e) { throw new Usage(`${what} ${p} unreadable (${e.code ?? e.message})`); } };
const jsonOf = (b) => { try { return JSON.parse(b.toString("utf8")); } catch { return null; } };
/** J-VERDICT: the first rule a line with a verdict breaks, or null (no verdict, or ESCALADE: no rule). */
const verdictWhy = ({ verdict: v, corrections: c }) => (v === null || v === "ESCALADE" ? null : c === null ? `${v} with corrections null`
  : v === "ACCEPTE" && c.blocking > 0 ? `ACCEPTE with ${c.blocking} blocking correction(s)`
  : ["ACCEPTE-AVEC-CORRECTIONS", "CORRECTIONS-D-ABORD", "REFUS"].includes(v) && c.blocking === 0 && c.nonblocking === 0 ? `${v} with no correction (0/0)`
  : v === "CORRECTIONS-D-ABORD" && c.blocking === 0 ? `CORRECTIONS-D-ABORD without a blocking correction (0/${c.nonblocking})` : null);
/** LINT-UNTRACKED (M-5b): the lint result less its R-PATH hits on the paths that the generated header of the mission (a stamp
 * line present) lists with the marker "(non suivi)", in the path lines right under its Changements field; any other hit stays. */
function unlisted(r, text) {
  const lines = text.split(/\r?\n/), i = lines.findIndex((l) => l.startsWith("Changements ")), off = new Set();
  if (lines.some((l) => l.startsWith(STAMP_FIELD))) for (let j = i + 1; i >= 0 && j < lines.length; j++) {
    const p = /^- `([^`]+)` \(([^()]+)\) `[0-9a-f]{64}`$/.exec(lines[j]);
    if (p === null) break;
    if (p[2] === "non suivi") off.add(`${p[1]} absent`); // the extract of an R-PATH hit (scripts/mission/lint.mjs)
  }
  const hits = r.hits.filter((h) => !(h.code === "R-PATH" && off.has(h.extract)));
  return { ...r, hits, verdict: hits.length === 0 ? "vert" : "rouge" };
}

/** J-SCHEMA: the problems of one parsed line ([] when valid); `lot` is the lot of its file (build only). */
function problems(e, lot) {
  if (e === null || typeof e !== "object" || Array.isArray(e)) return ["not a JSON object"];
  const p = Object.keys(e).filter((k) => !FIELDS.includes(k)).map((k) => `unknown field ${k}`);
  for (const k of FIELDS) {
    if (!Object.hasOwn(e, k)) p.push(`missing field ${k}`);
    else if (e[k] !== null) { if (!DOMAIN[k](e[k])) p.push(`${k} out of domain`); }
    else if (["schema", "lot", "gate", "date"].includes(k) || NEED[k]?.includes(e.gate)) p.push(`${k} null, required for ${String(e.gate)}`);
  }
  if (["G0", "cp-1", "fusion"].includes(e.gate) && (e.oracle ?? null) !== null) p.push("oracle cited at a gate that never runs one");
  if (lot !== undefined && e.lot !== lot) p.push(`lot ${String(e.lot)} in the journal of ${lot}`);
  return p;
}

function add(o) {
  for (const k of ["repo", "lot", "gate"]) if (o[k] === undefined) throw new Usage(`add needs --${k}`);
  if (!existsSync(o.repo)) throw new Usage(`--repo ${o.repo} does not exist`);
  const e = Object.fromEntries(FIELDS.map((k) => [k, null]));
  Object.assign(e, { schema: "monark.journal.v1", lot: o.lot, gate: o.gate, date: new Date().toISOString().replace(/\.\d{3}Z$/, "Z") });
  for (const [k, [field, parse = (s) => s]] of Object.entries(OPTS)) if (o[k] !== undefined) e[field] = parse(o[k]);
  if (o["from-recu"] !== undefined) {
    const r = jsonOf(bytesOf(o["from-recu"], "receipt"));
    if (r?.verdict !== "vert" || typeof r.mission !== "string") throw new Usage(`--from-recu ${o["from-recu"]}: not a green launch receipt`);
    const mb = bytesOf(r.mission, "mission"), tier = PALIER.exec(mb.toString("utf8"))?.[1].trim().toLowerCase(); // TIER-FROM-HEADER (M-5b)
    if (tier === undefined ? o.tier === undefined : o.tier !== undefined && o.tier !== tier) throw new Usage(`--from-recu: Palier ${tier ?? "absent"} of the mission, --tier ${o.tier ?? "absent"}: ${tier === undefined ? "no tier" : "they differ"} (TIER-FROM-HEADER)`);
    e.tier = tier ?? o.tier;
    e.mission = { path: abs(r.mission), sha: hash(mb), recu_sha: r.sha ?? null, recu_date: r.date ?? null, recu_head: r.head ?? null };
  }
  if (o["from-oracle"] !== undefined) {
    const b = bytesOf(o["from-oracle"], "oracle record"), r = jsonOf(b);
    if (r?.schema !== "monark.oracle.v1") throw new Usage(`--from-oracle ${o["from-oracle"]}: not a monark.oracle.v1 record`);
    e.oracle = { record: abs(o["from-oracle"]), sha256: hash(b), role: r.role ?? null, head: r.tree?.head ?? null, start: r.start ?? null,
      served_from: r.served_from ?? null, tests_total: r.tests?.total ?? null };
    e.tree_head ??= e.oracle.head;
  }
  const p = problems(e);
  if (p.length > 0) throw new Usage(`J-SCHEMA: ${p.join("; ")}`);
  const dir = join(o.repo, "docs", "journal"), file = join(dir, `${e.lot}.jsonl`), line = `${JSON.stringify(e)}\n`;
  mkdirSync(dir, { recursive: true });
  if (existsSync(file) && !/(?:^|\n)$/.test(readFileSync(file, "utf8"))) throw new Usage(`${file} does not end with a newline: nothing appended`);
  appendFileSync(file, line);
  process.stdout.write(line);
  return 0;
}

function build(o) {
  if (o.repo === undefined) throw new Usage("build needs --repo");
  const repo = resolve(o.repo), dir = join(repo, "docs", "journal"), hits = [], memo = new Map();
  const hit = (code, lot, line, extract) => hits.push({ code, lot, line, extract: String(extract).slice(0, 200) });
  const once = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  const at = (p) => (isAbsolute(p) ? p : join(repo, p));
  const read = (p) => once(`f:${p}`, () => { try { return readFileSync(at(p)); } catch { return null; } });
  const when = (c) => once(`c:${c}`, () => { try { return Date.parse(execFileSync("git", ["-C", repo, "show", "-s", "--format=%cI", `${c}^{commit}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()); } catch { return NaN; } });
  const adjudicated = (x) => x.e.gate === "G7" && (x.e.adjudication ?? "").trim() !== "";
  const ancestor = (a, c) => a === c || once(`a:${a}:${c}`, () => { try { execFileSync("git", ["-C", repo, "merge-base", "--is-ancestor", a, c], { stdio: "ignore" }); return true; } catch { return false; } });
  const headerWhy = (text, m) => { // J-HEADER: null for a mission without a stamp line; else every reason its generated header does not hold
    const lines = text.split(/\r?\n/), s = lines.find((l) => l.startsWith(STAMP_FIELD)), g = s === undefined ? null : STAMP.exec(s), why = [];
    if (s === undefined) return null;
    const head = lines.map((l) => /^HEAD `([0-9a-f]{40}(?:[0-9a-f]{24})?)`$/.exec(l)?.[1]).find((x) => x !== undefined) ?? null;
    if (head !== m.recu_head) why.push(`HEAD ${String(head)} of the header != mission.recu_head ${String(m.recu_head)}`);
    const blob = g === null ? null : once(`g:${g[1]}`, () => { try { return execFileSync("git", ["-C", repo, "cat-file", "blob", `${g[1]}^{commit}:scripts/mission/gen.mjs`], { stdio: ["ignore", "pipe", "ignore"], maxBuffer: 1 << 28 }); } catch { return null; } });
    if (g === null) why.push(`a stamp line without sha256 (earlier format): ${s}`);
    else if (blob === null) why.push(`no blob scripts/mission/gen.mjs at ${g[1]} in --repo (revision unresolvable)`);
    else if (hash(blob) !== g[2]) why.push(`gen.mjs sha256 ${g[2].slice(0, 12)} != the blob at ${g[1]} (${hash(blob).slice(0, 12)})`);
    return why.length === 0 ? null : why.join("; ");
  };
  const oracleWhy = (e) => { // J-ORACLE: the first reason the cited record does not back the entry, or null
    const o = e.oracle, b = read(o.record), r = b === null ? null : jsonOf(b), gel = ORACLED.includes(e.gate); // false: G1 or corr, a run before the gel
    if (r === null || typeof r !== "object") return b === null ? "record absent" : "record not JSON";
    if (hash(b) !== o.sha256) return "sha256 != oracle.sha256";
    const miss = REQUIRED.filter((k) => r[k] === undefined).concat(r.schema === "monark.oracle.v1" ? [] : ["schema"], Number.isInteger(r.pid) && r.pid > 0 ? [] : ["pid"], /^[0-9a-f]{40,64}$/.test(r.tree?.object) ? [] : ["tree.object"]);
    if (miss.length > 0) return `incomplete record (missing or invalid: ${[...new Set(miss)].join(", ")})`;
    if (r.role !== e.gate) return `role ${String(r.role)} != gate ${e.gate}`;
    if (gel && r.tree?.head !== e.commit) return `tree.head ${String(r.tree?.head)} != commit`;
    if (gel && !(Date.parse(r.start) >= when(e.commit))) return `start ${String(r.start)} before the commit date`;
    if (gel && r.served_from !== null) return "served_from not null: a store citation, never a replay";
    if (r.static_only !== false || gel && r.tree?.dirty !== null || r.exit !== 0) return `static_only ${String(r.static_only)}, tree.dirty ${String(r.tree?.dirty)}, exit ${String(r.exit)}: not a full${gel ? ", clean" : ""}, green run`;
    if (o.role !== r.role || o.head !== r.tree.head || o.start !== r.start || JSON.stringify(o.served_from) !== JSON.stringify(r.served_from) || o.tests_total !== (r.tests?.total ?? null)) return "a field copied into the entry != the record";
    if (gel) return null; // G1, corr (PRE-GEL-BIND, M-5b): bound to the launch of their mission; a served record read, never skipped (FM-3.2)
    const m = e.mission, sf = r.served_from, sb = sf === null ? null : typeof sf.file === "string" ? read(join(dirname(at(o.record)), sf.file)) : null, s = sb === null ? null : jsonOf(sb);
    if (o.head !== m.recu_head) return `head ${o.head} != mission.recu_head ${String(m.recu_head)}: a run of another tree`;
    if (!(Date.parse(o.start) >= Date.parse(m.recu_date))) return `start ${o.start} before mission.recu_date ${String(m.recu_date)}`;
    if (sf !== null && sb === null) return `served_from.file ${String(sf.file)}: the served record is absent or unreadable`;
    if (sf !== null && hash(sb) !== sf.sha256) return `served record ${sf.file}: sha256 != served_from.sha256`;
    if (sf !== null && s?.tree?.head !== o.head) return `served record ${sf.file}: tree.head ${String(s?.tree?.head)} != head ${o.head}`;
    return null;
  };
  const check = (lot, entries) => {
    let last = -Infinity;
    for (const { e, n } of entries) {
      const t = Date.parse(e.date), h = (code, extract) => hit(code, lot, n, extract), m = e.mission;
      if (e.commit !== null && !(t >= when(e.commit))) h("J-TIME", `date ${e.date} before the commit date of ${e.commit}, or not a commit of --repo`);
      if (t < last) h("J-TIME", `date ${e.date} before the previous entry of the lot`);
      last = Math.max(last, t);
      if ((e.gate === "G7" && e.public_trace === null) || (e.public_trace !== null && e.public_trace.ref.trim() === "")) h("J-TRACE", `${e.gate} without a public trace or with an empty ref`);
      for (const x of e.error_origin ?? []) if (!ORIGINS.includes(x)) h("J-ORIGIN", `error_origin ${x} outside ${ORIGINS.join(",")}`);
      const why = ORACLED.includes(e.gate) || (e.oracle !== null && PRE_GEL.includes(e.gate)) ? oracleWhy(e) : null;
      if (why !== null) h("J-ORACLE", `${base(e.oracle.record)}: ${why}`);
      const b = m === null ? null : read(m.path);
      if (m !== null && (b === null || hash(b) !== m.sha || m.sha !== m.recu_sha)) h("J-RECU", `${base(m.path)}: ${b === null ? "absent" : `bytes ${hash(b).slice(0, 12)}, sha ${m.sha.slice(0, 12)}, receipt ${String(m.recu_sha).slice(0, 12)}`}`);
      const rev = e.commit ?? m?.recu_head, lint = m === null || m.recu_sha === null || b === null || Number.isNaN(when(rev)) ? null : once(`l:${m.path}:${rev}`, () => unlisted(lintMission({ text: b.toString("utf8"), missionPath: at(m.path), repo, rev }), b.toString("utf8")));
      if (m !== null && m.recu_sha !== null && lint?.verdict !== "vert") h("J-LINT", `${base(m.path)} replayed at ${rev}: ${lint === null ? (b === null ? "mission absent" : "not a commit of --repo") : lint.hits.map((x) => x.code).join(",")}`);
      const header = b === null ? null : headerWhy(b.toString("utf8"), m); // a mission absent: J-RECU (and J-LINT) redden it
      if (header !== null) h("J-HEADER", `${base(m.path)}: ${header}`);
      if ((m ?? e.tier ?? e.model_resolved) !== null && !(TIERS.includes(e.tier) && e.model_resolved?.startsWith(e.tier) && !/^[\w-]/.test(e.model_resolved.slice(e.tier.length)))) h("J-MODEL", `model ${String(e.model_resolved)} is not the tier ${String(e.tier)} (${TIERS.join(", ")})`);
      if (e.gate === "G7" && !adjudicated({ e })) h("J-ADJ", "G7 without an adjudication");
    }
    const corr = entries.filter((x) => x.e.gate === "corr"), tours = [...new Set(corr.map((x) => x.e.tour))];
    if (tours.length > 5 && !entries.some(adjudicated)) hit("J-TOURS", lot, corr.find((x) => x.e.tour === tours[5]).n, `${tours.length} distinct corr tours and no G7 adjudication (D12 (d))`);
    if (entries.some((x) => REVIEWED.includes(x.e.gate))) entries.forEach(({ e, n }, i) => { // J-ORDER, J-VERDICT: in FILE order
      const w = entries.slice(0, i).findLast((x) => REVIEWED.includes(x.e.gate) && x.e.verdict !== null && x.e.verdict !== "ESCALADE"), me = `${e.gate} ${e.verdict} at ${e.commit?.slice(0, 12)}`;
      if (TARGETS.includes(e.gate) && OK.includes(e.verdict)) {
        if (w === undefined) hit("J-ORDER", lot, n, `${me}: no G2 or cp-2 line with a verdict above it`);
        else if (!OK.includes(w.e.verdict)) hit("J-ORDER", lot, n, `${me}: the nearest reviewed line above (${w.n}, ${w.e.gate} ${w.e.verdict}) is not an acceptance`);
        else if (!ancestor(w.e.commit, e.commit)) hit("J-ORDER", lot, n, `${me}: the commit ${w.e.commit.slice(0, 12)} of line ${w.n} is neither this commit nor an ancestor`);
      }
      const v = verdictWhy(e);
      if (v !== null) hit("J-VERDICT", lot, n, v);
    });
  };
  let files;
  try { files = readdirSync(dir).filter((f) => f.endsWith(".jsonl") && (o.only === undefined || f === `${o.only}.jsonl`)); } catch { throw new Usage(`no journal directory ${dir}`); }
  if (files.length === 0) throw new Usage(`no journal file in ${dir}${o.only === undefined ? "" : ` for lot ${o.only}`}`);
  const lots = files.sort((a, b) => (natural(a) < natural(b) ? -1 : 1)).map((f) => {
    const lot = f.slice(0, -6), rows = String(bytesOf(join(dir, f), "journal")).split("\n"), entries = [];
    if (rows.at(-1) === "") rows.pop();
    if (rows.length === 0) hit("J-SCHEMA", lot, 1, "empty journal file");
    rows.forEach((row, i) => { const e = jsonOf(row), p = e === null ? ["not JSON"] : problems(e, lot); if (p.length > 0) hit("J-SCHEMA", lot, i + 1, p.join("; ")); else entries.push({ e, n: i + 1 }); });
    check(lot, entries);
    return { lot, entries: entries.map((x) => x.e) };
  });
  const counts = Object.fromEntries(CODES.map((c) => [c, hits.filter((x) => x.code === c).length])), verdict = hits.length === 0 ? "vert" : "rouge";
  const index = hits.length === 0 && o.only === undefined ? join(dir, "INDEX.md") : null;
  if (index !== null) { writeFileSync(`${index}.tmp`, render(lots)); renameSync(`${index}.tmp`, index); }
  const entries = lots.reduce((s, l) => s + l.entries.length, 0);
  if (o.json) console.log(JSON.stringify({ verdict, counts, hits, lots: lots.length, entries, index }, null, 2));
  else console.log([...hits.map((x) => `${x.code} ${x.lot}:${x.line} ${x.extract}`), `counts ${CODES.map((c) => `${c}=${counts[c]}`).join(" ")}`,
    `verdict ${verdict} (${hits.length} hit(s), ${lots.length} lot(s), ${entries} entries)${index === null ? "" : `; index written ${index}`}`].join("\n"));
  return hits.length === 0 ? 0 : 1;
}

/** INDEX.md: one table per lot (one row per entry) and its summary line, then the status point. Deterministic: no clock. */
function render(lots) {
  const all = lots.flatMap((l) => l.entries), cell = (v) => (v === null || v === undefined || v === "" ? "-" : String(v).replace(/\\/g, "\\\\").replace(/\|/g, "\\|"));
  const corrs = (l) => new Set(l.entries.filter((e) => e.gate === "corr").map((e) => e.tour)).size;
  const out = ["# Journal index", "", `Generated by \`scripts/journal/index.mjs build\` (ADR-METHODE-2 D8a) from docs/journal/*.jsonl, never edited by hand: ${lots.length} lot(s), ${all.length} entries, last entry ${all.map((e) => e.date).sort().at(-1)}.`];
  for (const l of lots) {
    out.push("", `## ${l.lot}`, "", "| # | gate | tour | date | commit | model | verdict | r25 | oracle record | tests |", "|---|---|---|---|---|---|---|---|---|---|");
    l.entries.forEach((e, i) => out.push(`| ${[i + 1, e.gate, e.tour, e.date, e.commit?.slice(0, 12), e.model_resolved, e.verdict, e.r25 && `${e.r25.lines}/${e.r25.cap}`, e.oracle && base(e.oracle.record), e.oracle?.tests_total].map(cell).join(" | ")} |`));
    const v = l.entries.findLast((e) => e.verdict !== null), g = l.entries.findLast((e) => e.r25 !== null), t = l.entries.findLast((e) => e.gate === "G7")?.public_trace;
    const recs = [...new Set(l.entries.flatMap((e) => (e.oracle ? [base(e.oracle.record)] : [])))], orig = [...new Set(l.entries.flatMap((e) => e.error_origin ?? []))];
    out.push("", `Tours (distinct corr tours): ${corrs(l)}. Last verdict: ${v ? `${v.verdict} (${v.gate})` : "-"}. R-25 of the last gel: ${g ? `${g.r25.lines}/${g.r25.cap} (${g.gate})` : "-"}. Oracle records: ${recs.join(", ") || "-"}. error_origin: ${orig.join(", ") || "-"}. G7 public trace: ${t ? `${t.kind} ${t.ref}` : "-"}.`);
  }
  const g7 = lots.filter((l) => l.entries.some((e) => e.gate === "G7")), open = lots.filter((l) => !g7.includes(l)).map((l) => `${l.lot} (${l.entries.at(-1).gate}, ${l.entries.at(-1).date})`);
  out.push("", "## Status point", "", `- At G7: ${g7.map((l) => l.lot).join(", ") || "none"}.`, `- In progress, last gate: ${open.join(", ") || "none"}.`, `- Over 3 tours: ${lots.filter((l) => corrs(l) > 3).map((l) => l.lot).join(", ") || "none"}.`);
  return `${out.join("\n")}\n`;
}

function parse(argv, valued, flags = []) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i].slice(2);
    if (!argv[i].startsWith("--") || Object.hasOwn(o, k)) throw new Usage(`unexpected or repeated argument ${argv[i]}`);
    if (flags.includes(k)) o[k] = true;
    else if (valued.includes(k) && i + 1 < argv.length) o[k] = argv[++i];
    else throw new Usage(`unknown or incomplete option ${argv[i]}`);
  }
  return o;
}

function main([cmd, ...rest]) {
  try {
    if (cmd === "add") return add(parse(rest, ["repo", "lot", "gate", "from-recu", "from-oracle", ...Object.keys(OPTS)]));
    if (cmd === "build") return build(parse(rest, ["repo", "only"], ["json"]));
    throw new Usage("usage: node scripts/journal/index.mjs add|build --repo <tree> ... (see the header of this file)");
  } catch (e) { console.error(`journal: ${e instanceof Usage ? e.message : e.stack}`); return 2; }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
