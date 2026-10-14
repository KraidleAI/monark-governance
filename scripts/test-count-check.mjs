// TEST-COUNT-FLOOR-1 and TEST-COUNT-NAMES-1, the gate (docs/G0-lot-test-count-floor-1b.md, docs/G0-lot-test-count-names-1.md).
//   npm run test:main && node scripts/test-count-check.mjs [--base <rev>]
// test:main writes the run, RUN, by its reporter (scripts/test-counts-reporter.mjs); `node scripts/test-count-floor.mjs write` turns a run
// into the committed records, RECORD and NAMES. This gate holds: P1, each file of the run sent a report of its own; P2, the run equals both
// records, file by file, its count and its names; P3, both records are in their written form; P4, against the base: once the base carries
// NAMES, each name gone from a file has exactly one line added since the base to REMOVALS ({file, removed, reason}, {file, renamed, to,
// reason} to a name the file gained, or for a file gone {file, from, to: 0, reason}); before that, each drop of a count has its line {file,
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
  const shaped = (v, ok, what) => { if (!ok(v)) throw new Error(`not ${what}`); return v; };
  const base = read(`the merge base of HEAD and ${named}`, () => git("merge-base", "HEAD", named).trim()), pr = /^refs\/pull\/([1-9]\d*)\/merge$/.exec(process.env.GITHUB_REF ?? "")?.[1];
  const atBase = (path, none, ok, what) => read(`${path} at the base ${base}`, () => (git("ls-tree", "--name-only", base, "--", path).trim() === "" ? none : shaped(JSON.parse(git("show", `${base}:${path}`)), ok, what)));
  const baseRecord = atBase(RECORD, {}, counts, "a record { \"<file>\": tests }"), baseList = atBase(REMOVALS, [], Array.isArray, "a list [ ... ]");
  const baseNames = atBase(NAMES, null, lists, "a names record { \"<file>\": [names] }"), run = read(`${RUN} (run npm run test:main first)`, () => readRun(readFileSync(RUN, "utf8"))), text = read(RECORD, () => readFileSync(RECORD, "utf8"));
  const record = read(RECORD, () => JSON.parse(text)), list = read(REMOVALS, () => shaped(JSON.parse(readFileSync(REMOVALS, "utf8")), Array.isArray, "a list [ ... ]")), ntext = read(NAMES, () => readFileSync(NAMES, "utf8")), names = read(NAMES, () => shaped(JSON.parse(ntext), lists, "a names record { \"<file>\": [names] }"));
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

/** P2 on names: in each file, the run's names equal the names record's, as multisets; the exact names on each side. */
function namesDiffer(run, names) {
  return [...new Set([...Object.keys(run), ...Object.keys(names)])].filter((f) => f !== "").sort().flatMap((f) => {
    const ran = minus(run[f]?.names ?? [], names[f] ?? []), kept = minus(names[f] ?? [], run[f]?.names ?? []);
    return ran.length + kept.length === 0 ? [] : [`${f}: run and ${NAMES} differ: run only ${JSON.stringify(ran)}, recorded only ${JSON.stringify(kept)}`];
  });
}

/** P4 by names: in each file, each name of the base's names record that the head's lacks (as multisets) takes exactly one added line: removed,
 *  or renamed to a name the file gained (each gained name the `to` of one line at most); a file gone takes one line {file, from, to: 0} at its
 *  base count, or one line per name. Each line names a name gone. The hint offers the exact line, with this pull request's number in CI. */
function nameProblems(base, head, lines, pr) {
  const out = [], reason = `#${pr ?? "<pull request>"}: ...`;
  for (const f of [...new Set([...Object.keys(base), ...Object.keys(head), ...lines.map((r) => r.file)])].sort()) {
    const gone = minus(base[f] ?? [], head[f] ?? []), gained = minus(head[f] ?? [], base[f] ?? []), whole = gone.length;
    for (const r of lines.filter((l) => l.file === f)) {
      const i = gone.indexOf(r.removed ?? r.renamed), j = r.renamed === undefined ? -1 : gained.indexOf(r.to);
      if (r.from !== undefined) { if (head[f] === undefined && base[f]?.length === r.from && gone.length === r.from) gone.length = 0; else out.push(`${REMOVALS}: ${JSON.stringify(r)} names no file gone since the base, at its count`); }
      else if (i < 0) out.push(`${REMOVALS}: ${JSON.stringify(r)} names no test gone from ${f} since the base`);
      else if (r.renamed !== undefined && j < 0) out.push(`${REMOVALS}: ${JSON.stringify(r)}: ${JSON.stringify(r.to)} is no test that ${f} gained since the base`);
      else { gone.splice(i, 1); if (j >= 0) gained.splice(j, 1); }
    }
    if (head[f] === undefined && gone.length > 0 && gone.length === whole) { out.push(`${f}: ${whole} test(s) at the base, 0 here: wants one line ${JSON.stringify({ file: f, from: whole, to: 0, reason })} in ${REMOVALS}`); continue; }
    const one = gone.length === 1 && gained.length === 1;
    for (const n of gone) out.push(`${f}: the test ${JSON.stringify(n)} is gone since the base: wants one line ${JSON.stringify(one ? { file: f, renamed: n, to: gained[0], reason } : { file: f, removed: n, reason })} in ${REMOVALS}${gained.length > 0 ? `; tests ${f} gained: ${JSON.stringify(gained)}` : ""}`);
  }
  return out;
}
