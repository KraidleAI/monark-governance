// TEST-COUNT-FLOOR-1 and TEST-COUNT-NAMES-1, the gate (docs/G0-lot-test-count-floor-1b.md, docs/G0-lot-test-count-names-1.md).
//   npm run test:main && node scripts/test-count-check.mjs [--base <rev>]
// test:main writes the run, RUN, by its reporter (scripts/test-counts-reporter.mjs); `node scripts/test-count-floor.mjs write` turns a run
// into the committed records, RECORD and NAMES. This gate holds: P1, each file of the run sent a report of its own; P2, the run equals both
// records, file by file, its count and its names; P3, both records are in their written form; P4, against the base: once the base carries
// NAMES, each name gone from a file has exactly one line added since the base to REMOVALS ({file, removed, reason}, {file, renamed, to,
// reason} to a name the file gained, or for a file gone {file, from, to: 0, reason} for its names another file gained); before that, each drop of a count has its line {file,
// from, to, reason}. Each added line names what it declares, its reason reads "#<pull request>: " then three words or more (in CI, this
// pull request's number), and the base's lines stay. Base: --base <rev>, else origin/$GITHUB_BASE_REF, else $ORACLE_BASE. Exits: 0 1 2 3 4.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { NAMES, RECORD, RUN, namesText, readRun, recordText, runProblems } from "./test-count-floor.mjs";

export const REMOVALS = "test/test-count-removals.json";

/** P2: the run equals the record, file by file, a rise as well as a drop; the tests reported without a file are P1's. With the names record, each file's names too. */
export const recordProblems = (run, record, names) => [
  ...Object.entries(run).filter(([f, c]) => f !== "" && record[f] !== c.tests).map(([f, c]) => `${f}: ${c.tests} test(s) run, ${record[f] ?? "not"} in ${RECORD}`),
  ...Object.keys(record).filter((f) => run[f] === undefined).map((f) => `${f}: in ${RECORD} (${record[f]}), not in the run`),
  ...(names === undefined ? [] : namesDiffer(run, names))];

const isLine = (r) => r !== null && typeof r === "object" && !Array.isArray(r) && Object.keys(r).sort().join() === "file,from,reason,to" && typeof r.file === "string"
  && r.file !== "" && Number.isInteger(r.from) && Number.isInteger(r.to) && r.to >= 0 && r.to < r.from && typeof r.reason === "string" && r.reason.trim() !== "";

/** P4: each drop from the base's record (a file gone counts 0) has exactly one line added since the base, at its numbers; each added line
 *  names a drop; each line of the base stays, once (the list only grows). Once the base carries names (names.base), by names: nameProblems. */
export function dropProblems(baseRecord, record, baseList, list, names = {}) {
  const left = baseList.map((r) => JSON.stringify(r)), added = [], lines = [], out = [], byNames = (names.base ?? null) !== null;
  for (const r of list) { const i = left.indexOf(JSON.stringify(r)); if (i >= 0) left.splice(i, 1); else added.push(r); }
  if (left.length > 0) out.push(`${REMOVALS}: ${left.length} line(s) of the base changed or removed; the list only grows`);
  for (const r of added) if (lineOk(r, byNames, names.pr)) lines.push(r); else out.push(`${REMOVALS}: ${JSON.stringify(r)} is not a line {file, from, to, reason} with from > to >= 0${byNames ? " (to 0: a file gone), {file, removed, reason} or {file, renamed, to, reason}" : ""}, and a reason "#<pull request>: <why, in three words or more>"${names.pr === undefined ? "" : ` naming #${names.pr}`}`);
  if (byNames) return [...out, ...nameProblems(names.base, names.head ?? {}, lines, names.pr)]; for (const f of [...new Set([...Object.keys(baseRecord), ...Object.keys(record)])].sort()) {
    const from = baseRecord[f] ?? 0, to = record[f] ?? 0, mine = lines.filter((r) => r.file === f);
    if (to < from && !(mine.length === 1 && mine[0].from === from && mine[0].to === to)) out.push(`${f}: ${from} test(s) at the base, ${to} here: wants one line ${JSON.stringify({ file: f, from, to, reason: "..." })} in ${REMOVALS}`);
  }
  for (const r of lines) if (!((baseRecord[r.file] ?? 0) > (record[r.file] ?? 0))) out.push(`${REMOVALS}: ${JSON.stringify(r)} names no drop since the base`);
  return out;
}

const stop = (code, text) => { console.error(text); process.exit(code); };
const counts = (o) => o !== null && typeof o === "object" && !Array.isArray(o) && Object.values(o).every((n) => Number.isInteger(n) && n >= 0), lists = (o) => o !== null && typeof o === "object" && !Array.isArray(o) && Object.values(o).every((a) => Array.isArray(a) && a.every((n) => typeof n === "string"));
if (import.meta.main !== false) { // as scripts/test-count-floor.mjs: a launch runs the gate, an import runs nothing
  const argv = process.argv.slice(2);
  if (!(argv.length === 0 || (argv.length === 2 && argv[0] === "--base" && argv[1] !== ""))) stop(2, "usage: node scripts/test-count-check.mjs [--base <rev>]   (after npm run test:main)");
  const named = argv[1] ?? (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : process.env.ORACLE_BASE);
  if (!named) stop(3, "::error::no base: pass --base <rev>, or run where GITHUB_BASE_REF (the CI) or ORACLE_BASE (the local oracle) names it");
  const git = (...a) => execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 26 });
  const read = (what, f) => { try { return f(); } catch (e) { return stop(4, `::error::${what} not readable: ${String(e?.message ?? e).split("\n")[0]}`); } };
  const shaped = (v, ok, what) => { if (!ok(v)) throw new Error(`not ${what}`); return own(v); };
  const base = read(`the merge base of HEAD and ${named}`, () => git("merge-base", "HEAD", named).trim()), pr = /^refs\/pull\/([1-9]\d*)\/merge$/.exec(process.env.GITHUB_REF ?? "")?.[1];
  const atBase = (path, none, ok, what) => read(`${path} at the base ${base}`, () => (git("ls-tree", "--name-only", base, "--", path).trim() === "" ? none : shaped(JSON.parse(git("show", `${base}:${path}`)), ok, what)));
  const baseRecord = atBase(RECORD, {}, counts, "a record { \"<file>\": tests }"), baseList = atBase(REMOVALS, [], Array.isArray, "a list [ ... ]");
  const baseNames = atBase(NAMES, null, lists, "a names record { \"<file>\": [names] }"), run = read(`${RUN} (run npm run test:main first)`, () => readRun(readFileSync(RUN, "utf8"))), text = read(RECORD, () => readFileSync(RECORD, "utf8")); if (baseNames !== null) read(`${NAMES} at the base ${base}`, () => agrees(baseNames, baseRecord));
  const record = read(RECORD, () => own(JSON.parse(text))), list = read(REMOVALS, () => shaped(JSON.parse(readFileSync(REMOVALS, "utf8")), Array.isArray, "a list [ ... ]")), ntext = read(NAMES, () => readFileSync(NAMES, "utf8")), names = read(NAMES, () => shaped(JSON.parse(ntext), lists, "a names record { \"<file>\": [names] }"));
  const form = counts(record) && text === recordText(record) ? [] : [`${RECORD}: not in its written form (npm run test:main && node scripts/test-count-floor.mjs write)`];
  const problems = [...runProblems(run), ...form, ...(ntext === namesText(names) ? [] : [`${NAMES}: not in its written form (npm run test:main && node scripts/test-count-floor.mjs write)`]), ...(counts(record) ? [...recordProblems(run, record, names), ...dropProblems(baseRecord, record, baseList, list, { base: baseNames, head: names, pr })] : [])];
  if (problems.length > 0) stop(1, problems.map((p) => `::error::${p}`).join("\n"));
  const drops = Object.keys(baseRecord).filter((f) => (record[f] ?? 0) < baseRecord[f]).length;
  console.log(`test counts: ${Object.keys(run).length} files, ${Object.values(run).reduce((s, c) => s + c.tests, 0)} tests, equal to ${RECORD} and ${NAMES}; ${drops} drop(s) from the base ${base.slice(0, 12)}, ${baseNames === null ? "judged by counts (no names at the base), each with its line" : "each name gone with its line"} in ${REMOVALS}`);
}

/** a minus b, as multisets: each element of b takes out one equal element of a. */
function minus(a, b) {
  const left = [...b];
  return a.filter((x) => { const i = left.indexOf(x); if (i < 0) return true; left.splice(i, 1); return false; });
}

/** A reason: "#<n>: " with the number of a pull request (in CI, this pull request's own, pr), then why, in three words or more. */
function because(reason, pr) {
  return typeof reason === "string" && new RegExp(`^#${pr ?? "[1-9]\\d*"}: `).test(reason) && reason.slice(reason.indexOf(": ") + 2).trim().split(/\s+/).length >= 3;
}

/** An added line: a drop {file, from, to, reason} (once the base has names, a file gone only: to 0), or once the base has names a test removed
 *  {file, removed, reason} or renamed {file, renamed, to, reason}; whatever its shape, its reason as because() reads it. */
function lineOk(r, byNames, pr) {
  const keys = r !== null && typeof r === "object" && !Array.isArray(r) ? Object.keys(r).sort().join() : "", text = (s) => typeof s === "string" && s !== "";
  const shaped = isLine(r) ? !byNames || r.to === 0 : byNames && text(r.file) && (keys === "file,reason,removed" ? text(r.removed) : keys === "file,reason,renamed,to" && text(r.renamed) && text(r.to) && r.renamed !== r.to);
  return shaped && because(r.reason, pr);
}

/** P2 on names: in each file, the run's names equal the names record's, as multisets; the exact names on each side. The run's tests without a file are P1's; a names-record key "" is held to the run like any file. */
function namesDiffer(run, names) {
  return [...new Set([...Object.keys(run).filter((f) => f !== ""), ...Object.keys(names)])].sort().flatMap((f) => {
    const ran = minus(run[f]?.names ?? [], names[f] ?? []), kept = minus(names[f] ?? [], run[f]?.names ?? []);
    return ran.length + kept.length === 0 ? [] : [`${f}: run and ${NAMES} differ: run only ${JSON.stringify(ran)}, recorded only ${JSON.stringify(kept)}`];
  });
}

/** P4 by names: in each file, each name of the base's names record that the head's lacks (as multisets) takes exactly one added line: removed,
 *  or renamed to a name the file gained (each gained name the `to` of one line at most). A file gone may take, besides, one line {file, from,
 *  to: 0} at its base count: it covers each of its names that reappears, one that some file of the head gained since the base and no rename
 *  line took (each such name covers one name gone); a name that reappears nowhere takes its own line. Each line names a name or a file gone.
 *  The hint offers the exact lines, with this pull request's number in CI. */
function nameProblems(baseNames, headNames, lines, pr) {
  const out = [], reason = `#${pr ?? "<pull request>"}: ...`, base = own(baseNames), head = own(headNames), at = []; // own keys only: a line for "constructor" names no file
  for (const f of [...new Set([...Object.keys(base), ...Object.keys(head), ...lines.map((r) => r.file)])].sort()) {
    const gone = minus(base[f] ?? [], head[f] ?? []), gained = minus(head[f] ?? [], base[f] ?? []), said = []; let moved = false;
    for (const r of lines.filter((l) => l.file === f)) {
      const i = gone.indexOf(r.removed ?? r.renamed), j = r.renamed === undefined ? -1 : gained.indexOf(r.to);
      if (r.from !== undefined) { if (head[f] === undefined && base[f]?.length === r.from && !moved) moved = true; else said.push(`${REMOVALS}: ${JSON.stringify(r)} names no file gone since the base, at its count`); }
      else if (i < 0) said.push(`${REMOVALS}: ${JSON.stringify(r)} names no test gone from ${f} since the base`);
      else if (r.renamed !== undefined && j < 0) said.push(`${REMOVALS}: ${JSON.stringify(r)}: ${JSON.stringify(r.to)} is no test that ${f} gained since the base`);
      else { gone.splice(i, 1); if (j >= 0) gained.splice(j, 1); }
    }
    at.push({ f, gone, gained, said, moved });
  }
  const pool = at.flatMap((x) => x.gained); // the names the head's files gained since the base, less those a rename line took
  for (const { f, gone: all, gained, said, moved } of at) {
    out.push(...said);
    const back = head[f] === undefined ? all.filter((n) => { const k = pool.indexOf(n); if (k >= 0) pool.splice(k, 1); return k >= 0; }) : [], gone = minus(all, back);
    if (back.length > 0 && !moved) out.push(`${f}: ${base[f].length} test(s) at the base, 0 here: wants one line ${JSON.stringify({ file: f, from: base[f].length, to: 0, reason })} in ${REMOVALS}`);
    const one = gone.length === 1 && gained.length === 1;
    for (const n of gone) out.push(`${f}: the test ${JSON.stringify(n)} is gone since the base: wants one line ${JSON.stringify(one ? { file: f, renamed: n, to: gained[0], reason } : { file: f, removed: n, reason })} in ${REMOVALS}${gained.length > 0 ? `; tests ${f} gained: ${JSON.stringify(gained)}` : ""}`);
  }
  return out;
}

/** A record read by its own keys only: an object becomes a copy without a prototype, so that an inherited name ("constructor",
 *  "__proto__") is no file of it; anything else is returned as it is. */
function own(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v) ? Object.assign(Object.create(null), v) : v;
}

/** The base's two records agree: the same files, and in each as many names as its count. Else it throws, naming the first file that
 *  differs, and the gate stops with exit 4: a base whose names record disagrees with its counts record would hide a drop. */
function agrees(names, record) {
  const has = (o, f) => Object.hasOwn(o, f), f = [...new Set([...Object.keys(names), ...Object.keys(record)])].sort().find((k) => !has(names, k) || !has(record, k) || names[k].length !== record[k]);
  if (f === undefined) return;
  throw new Error(`it disagrees with ${RECORD} there: ${f}: ${!has(names, f) ? `in ${RECORD} (${record[f]}), not in ${NAMES}` : !has(record, f) ? `in ${NAMES} (${names[f].length} name(s)), not in ${RECORD}` : `${names[f].length} name(s) in ${NAMES}, ${record[f]} test(s) in ${RECORD}`}`);
}
