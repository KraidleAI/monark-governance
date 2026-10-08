// TEST-COUNT-FLOOR-1, the gate (docs/G0-lot-test-count-floor-1b.md; the design of both pull requests: docs/G0-lot-test-count-floor-1.md).
//   npm run test:main && node scripts/test-count-check.mjs [--base <rev>]
// test:main writes the run, RUN, by its reporter (scripts/test-counts-reporter.mjs); `node scripts/test-count-floor.mjs write` turns a
// run into the committed record, RECORD. This gate holds: P1, each file of the run sent a report of its own; P2, the run equals the record,
// file by file; P3, the record is in its written form; P4, each drop from the base's record (a file gone counts 0) has exactly one line
// {file, from, to, reason} added since the base to REMOVALS, at its numbers, each added line names a drop, and the base's lines stay (the
// list only grows). The base: --base <rev>, else origin/$GITHUB_BASE_REF (the CI), else $ORACLE_BASE (the local oracle); its record and
// list are read at the merge base of HEAD and that revision, a record absent there as {}, a list absent as []. Exits: 0 green; 1 a
// problem; 2 the usage; 3 no base; 4 an input unreadable (the run, the record, the list, the merge base, or a file of the base).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { RECORD, RUN, readRun, recordText, runProblems } from "./test-count-floor.mjs";

export const REMOVALS = "test/test-count-removals.json";

/** P2: the run equals the record, file by file, a rise as well as a drop; the tests reported without a file are P1's. */
export const recordProblems = (run, record) => [
  ...Object.entries(run).filter(([f, c]) => f !== "" && record[f] !== c.tests).map(([f, c]) => `${f}: ${c.tests} test(s) run, ${record[f] ?? "not"} in ${RECORD}`),
  ...Object.keys(record).filter((f) => run[f] === undefined).map((f) => `${f}: in ${RECORD} (${record[f]}), not in the run`),
];

const isLine = (r) => r !== null && typeof r === "object" && !Array.isArray(r) && Object.keys(r).sort().join() === "file,from,reason,to" && typeof r.file === "string"
  && r.file !== "" && Number.isInteger(r.from) && Number.isInteger(r.to) && r.to >= 0 && r.to < r.from && typeof r.reason === "string" && r.reason.trim() !== "";

/** P4: each drop from the base's record (a file gone counts 0) has exactly one line added since the base, at its numbers; each added line
 *  names a drop; each line of the base stays, once (the list only grows). */
export function dropProblems(baseRecord, record, baseList, list) {
  const left = baseList.map((r) => JSON.stringify(r)), added = [], lines = [], out = [];
  for (const r of list) { const i = left.indexOf(JSON.stringify(r)); if (i >= 0) left.splice(i, 1); else added.push(r); }
  if (left.length > 0) out.push(`${REMOVALS}: ${left.length} line(s) of the base changed or removed; the list only grows`);
  for (const r of added) if (isLine(r)) lines.push(r); else out.push(`${REMOVALS}: ${JSON.stringify(r)} is not a line {file, from, to, reason} with from > to >= 0 and a reason`);
  for (const f of [...new Set([...Object.keys(baseRecord), ...Object.keys(record)])].sort()) {
    const from = baseRecord[f] ?? 0, to = record[f] ?? 0, mine = lines.filter((r) => r.file === f);
    if (to < from && !(mine.length === 1 && mine[0].from === from && mine[0].to === to)) out.push(`${f}: ${from} test(s) at the base, ${to} here: wants one line ${JSON.stringify({ file: f, from, to, reason: "..." })} in ${REMOVALS}`);
  }
  for (const r of lines) if (!((baseRecord[r.file] ?? 0) > (record[r.file] ?? 0))) out.push(`${REMOVALS}: ${JSON.stringify(r)} names no drop since the base`);
  return out;
}

const stop = (code, text) => { console.error(text); process.exit(code); };
const counts = (o) => o !== null && typeof o === "object" && !Array.isArray(o) && Object.values(o).every((n) => Number.isInteger(n) && n >= 0);
if (import.meta.main !== false) { // as scripts/test-count-floor.mjs: a launch runs the gate, an import runs nothing
  const argv = process.argv.slice(2);
  if (!(argv.length === 0 || (argv.length === 2 && argv[0] === "--base" && argv[1] !== ""))) stop(2, "usage: node scripts/test-count-check.mjs [--base <rev>]   (after npm run test:main)");
  const named = argv[1] ?? (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : process.env.ORACLE_BASE);
  if (!named) stop(3, "::error::no base: pass --base <rev>, or run where GITHUB_BASE_REF (the CI) or ORACLE_BASE (the local oracle) names it");
  const git = (...a) => execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 26 });
  const read = (what, f) => { try { return f(); } catch (e) { return stop(4, `::error::${what} not readable: ${String(e?.message ?? e).split("\n")[0]}`); } };
  const shaped = (v, ok, what) => { if (!ok(v)) throw new Error(`not ${what}`); return v; };
  const base = read(`the merge base of HEAD and ${named}`, () => git("merge-base", "HEAD", named).trim());
  const atBase = (path, none, ok, what) => read(`${path} at the base ${base}`, () => (git("ls-tree", "--name-only", base, "--", path).trim() === "" ? none : shaped(JSON.parse(git("show", `${base}:${path}`)), ok, what)));
  const baseRecord = atBase(RECORD, {}, counts, "a record { \"<file>\": tests }"), baseList = atBase(REMOVALS, [], Array.isArray, "a list [ ... ]");
  const run = read(`${RUN} (run npm run test:main first)`, () => readRun(readFileSync(RUN, "utf8"))), text = read(RECORD, () => readFileSync(RECORD, "utf8"));
  const record = read(RECORD, () => JSON.parse(text)), list = read(REMOVALS, () => shaped(JSON.parse(readFileSync(REMOVALS, "utf8")), Array.isArray, "a list [ ... ]"));
  const form = counts(record) && text === recordText(record) ? [] : [`${RECORD}: not in its written form (npm run test:main && node scripts/test-count-floor.mjs write)`];
  const problems = [...runProblems(run), ...form, ...(counts(record) ? [...recordProblems(run, record), ...dropProblems(baseRecord, record, baseList, list)] : [])];
  if (problems.length > 0) stop(1, problems.map((p) => `::error::${p}`).join("\n"));
  const drops = Object.keys(baseRecord).filter((f) => (record[f] ?? 0) < baseRecord[f]).length;
  console.log(`test counts: ${Object.keys(run).length} files, ${Object.values(run).reduce((s, c) => s + c.tests, 0)} tests, equal to ${RECORD}; ${drops} drop(s) from the base ${base.slice(0, 12)}, each with its line in ${REMOVALS}`);
}
