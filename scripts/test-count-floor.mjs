// TEST-COUNT-FLOOR-1 (docs/G0-lot-test-count-floor-1.md): the record of the tests that each test file of test:main reports.
//   npm run test:main && node scripts/test-count-floor.mjs write
// test:main writes the run, RUN, by its reporter (scripts/test-counts-reporter.mjs): { "<file>": { tests, summary } }. write turns it
// into the record, RECORD, { "<file>": tests }, in its written form (recordText), and refuses a run in which a file sent no report of
// its own (P1): its process ended before it reported, it declares no test, or it is a module that declared tests for a test file.
// Exits: 0 written; 1 refused, nothing written; 2 the usage; 4 the run unreadable. The gate of the second pull request
// (scripts/test-count-check.mjs) imports this module and holds each run to the record.
import { readFileSync, writeFileSync } from "node:fs";

export const RUN = "test-counts.out.json", RECORD = "test/test-counts.json";

/** The run as the reporter writes it; any other shape throws. */
export function readRun(text) {
  const run = JSON.parse(text), ok = (c) => Number.isInteger(c?.tests) && c.tests >= 0 && typeof c.summary === "boolean";
  if (run === null || typeof run !== "object" || Array.isArray(run) || !Object.values(run).every(ok)) throw new Error(`not a run of the reporter, { "<file>": { tests, summary } }`);
  return run;
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
  console.log(`${RECORD}: ${Object.keys(run).length} files, ${Object.values(run).reduce((s, c) => s + c.tests, 0)} tests`);
}
