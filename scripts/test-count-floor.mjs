// TEST-COUNT-FLOOR-1 (docs/G0-lot-test-count-floor-1.md) and TEST-COUNT-NAMES-1 (docs/G0-lot-test-count-names-1.md): the records of the
// tests that each test file of test:main reports, their number and their names.   npm run test:main && node scripts/test-count-floor.mjs write
// test:main writes the run, RUN, by its reporter (scripts/test-counts-reporter.mjs): { "<file>": { tests, summary, names } }. write turns
// it into the record, RECORD, { "<file>": tests }, and the names record, NAMES, { "<file>": [names] }, in their written forms (recordText,
// namesText), and refuses a run in which a file sent no report of its own (P1): its process ended before it reported, it declares no test,
// or it is a module that declared tests for a test file. Exits: 0 written; 1 refused, nothing written; 2 the usage; 4 the run unreadable.
// The gate (scripts/test-count-check.mjs) imports this module and holds each run to both records.
import { readFileSync, writeFileSync } from "node:fs";

export const RUN = "test-counts.out.json", RECORD = "test/test-counts.json", NAMES = "test/test-names.json";

/** The run as the reporter writes it, read by its own keys (a copy without a prototype: P2 finds no file named "constructor" in it); any other shape throws. */
export function readRun(text) {
  const run = JSON.parse(text), ok = (c) => Number.isInteger(c?.tests) && c.tests >= 0 && typeof c.summary === "boolean";
  if (run === null || typeof run !== "object" || Array.isArray(run) || !Object.values(run).every((c) => ok(c) && Array.isArray(c.names) && c.names.length === c.tests && c.names.every((n) => typeof n === "string"))) throw new Error(`not a run of the reporter, { "<file>": { tests, summary, names } }`);
  return Object.assign(Object.create(null), run);
}

/** P1: each file of the run sent a report of its own; a test reported without a file is a problem too. */
export const runProblems = (run) => Object.entries(run).flatMap(([f, c]) => {
  if (f === "") return [`${c.tests} test(s) reported without a file`];
  return c.summary ? [] : [`${f}: no report of its own (${c.tests} test(s) under its name): its process ended before it reported, it declares no test, or it is a module that declared tests for a test file (declare each test in its *.test.ts)`];
});

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
