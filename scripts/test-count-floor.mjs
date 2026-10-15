// TEST-COUNT-FLOOR-1 (docs/G0-lot-test-count-floor-1.md) and TEST-COUNT-NAMES-1 (docs/G0-lot-test-count-names-1.md): the records of the
// tests that each test file of test:main reports, their number and their names.   npm run test:main && node scripts/test-count-floor.mjs write
// test:main writes the run, RUN, by its reporter (scripts/test-counts-reporter.mjs): { "<file>": { tests, summary, names, foreign?, sites } }.
// write turns it into the record, RECORD, { "<file>": tests }, and the names record, NAMES, { "<file>": [names] }, in their written forms, and
// refuses a run in which a file sent no report of its own (P1: its process ended before it reported, it declares no test, or its tests ran
// in a test file's process), another process ran its tests too, two of its tests share a full name, or one of its declaration sites is reported
// at two nesting depths under one name (it ran twice, inside a test). Exits: 0 written; 1 refused; 2 usage; 4 unreadable. The gate (scripts/test-count-check.mjs) imports this module and holds each run to both records.
import { readFileSync, writeFileSync } from "node:fs";

export const RUN = "test-counts.out.json", RECORD = "test/test-counts.json", NAMES = "test/test-names.json";

/** The run as the reporter writes it, read by its own keys (a copy without a prototype: P2 finds no file named "constructor" in it); any other shape throws. The sites of a file are read by depths(). */
export function readRun(text) {
  const run = JSON.parse(text), ok = (c) => Number.isInteger(c?.tests) && c.tests >= 0 && typeof c.summary === "boolean";
  if (run === null || typeof run !== "object" || Array.isArray(run) || !Object.values(run).every((c) => ok(c) && Array.isArray(c.names) && c.names.length === c.tests && c.names.every((n) => typeof n === "string"))) throw new Error(`not a run of the reporter, { "<file>": { tests, summary, names } }`);
  return Object.assign(Object.create(null), run);
}

/** P1: each file of the run sent a report of its own, no other process ran its tests (foreign: a test file that imports it, or a second run of it, runs them twice), no two of its tests share a full name (it ran twice in its own process), and no declaration site of it is reported at two nesting depths under one name (it ran twice, inside a test: depths); a test without a file is a problem too. One problem per file, the first that applies: block gives the first three. */
export const runProblems = (run) => Object.entries(run).flatMap((e) => { const p = block(e); return p.length > 0 ? p : depths(e); });
const block = ([f, c]) => {
  if (f === "") return [`${c.tests} test(s) reported without a file`];
  if (!c.summary) return [`${f}: no report of its own (${c.tests} test(s) under its name): its process ended before it reported, it declares no test, or it is a module whose tests ran in a test file's process: that file imports it, or runs it in a worker or in a child that writes to its output (declare each test in its *.test.ts, and give a nested test run an output of its own)`];
  return c.foreign > 0 ? [`${f}: ${c.foreign} of its test(s) also ran in another process: a test file imports it (move what they share to a module that declares no test), or it runs twice`] : twice(c.names) > 0 ? [`${f}: ${twice(c.names)} of its test(s) repeat a full name of the file: two of its tests share a name (name each apart), or the file runs twice in its own process (it imports itself, e.g. with a query string)`] : [];
};

/** P3, the written form of a record { "<file>": tests }: one file per line, sorted, and a final line feed. */
export const recordText = (record) =>
  `${JSON.stringify(Object.fromEntries(Object.entries(record).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))), null, 1)}\n`;

const stop = (code, text) => { console.error(text); process.exit(code); };
if (import.meta.main !== false) { // as scripts/red-proof.mjs: a launch runs the command, an import runs nothing
  if (process.argv.length !== 3 || process.argv[2] !== "write") stop(2, "usage: node scripts/test-count-floor.mjs write   (after npm run test:main)");
  let run;
  try { run = readRun(readFileSync(RUN, "utf8")); } catch (e) { stop(4, `::error::${RUN} not readable (run npm run test:main first): ${e.message}`); }
  const problems = runProblems(run);
  if (problems.length > 0) stop(1, problems.map((p) => `::error::${p}`).join("\n"));
  writeFileSync(RECORD, recordText(Object.fromEntries(Object.entries(run).map(([f, c]) => [f, c.tests]))));
  writeFileSync(NAMES, namesText(Object.fromEntries(Object.entries(run).map(([f, c]) => [f, c.names]))));
  console.log(`${RECORD} and ${NAMES}: ${Object.keys(run).length} files, ${Object.values(run).reduce((s, c) => s + c.tests, 0)} tests`);
}

/** P3, the written form of a names record { "<file>": [names] }: one name per line, the files sorted and each file's names sorted, a final
 *  line feed, and U+2028 and U+2029 escaped (JSON leaves them raw; JavaScript, and R-25, end a line there). Declared after the command,
 *  which calls it: a function declaration is hoisted. */
export function namesText(names) {
  const sorted = Object.fromEntries(Object.keys(names).sort().map((f) => [f, [...names[f]].sort()]));
  return `${JSON.stringify(sorted, null, 1)}\n`.replace(/[\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16)}`);
}

/** P1: how many of a file's full names repeat one before them. A second run of a test file in its own process (an import of itself with a
 *  query string) repeats each name of the file, and a copy would cover a name another file lost. Hoisted, as namesText. */
function twice(names) {
  return names.length - new Set(names).size;
}

/** P1: a file's sites, one [site, depth, name] per test as the reporter writes them (site: "<line>:<column>" of the declaration, as Node's
 *  runner gives it, else null; depth: the nesting the test was reported at; name: its own). One site reported, under one name, at two depths is
 *  a second module instance of the file loaded inside a test or a suite (it imports itself, e.g. with a query string, from a test body): its
 *  tests nest there, under full names that repeat none, in its own process before its summary, and a copy would cover a name another file lost.
 *  A run without sites (an older reporter's) has none to read; a list that is not one such entry per test is no run of the reporter. Hoisted. */
function depths([f, c]) {
  const entry = (s) => Array.isArray(s) && s.length === 3 && (s[0] === null || typeof s[0] === "string") && Number.isInteger(s[1]) && s[1] >= 0 && typeof s[2] === "string";
  if (c.sites === undefined) return [];
  if (!(Array.isArray(c.sites) && c.sites.length === c.tests && c.sites.every(entry))) return [`${f}: its sites are not one [ "<line>:<column>", depth, name ] per test: not a run of the reporter (npm run test:main writes it)`];
  const seen = new Map();
  for (const [site, depth, name] of c.sites) if (site !== null) { const k = `${site}\u0000${name}`; seen.set(k, (seen.get(k) ?? new Set()).add(depth)); }
  const n = [...seen.values()].filter((d) => d.size > 1).length;
  return n > 0 ? [`${f}: ${n} of its declaration site(s) reported at more than one nesting depth under one name: the file runs twice in its own process, the second time inside a test or a suite (it imports itself, e.g. with a query string, from a test body), or one helper of it declares the same tests at the top level and inside a suite, or a test declares a subtest of itself, recursively (declare each once)`] : [];
}
