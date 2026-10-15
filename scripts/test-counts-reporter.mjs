// A node --test reporter that test:main loads beside spec. For each test file it writes how many of its tests were reported (test:pass and
// test:fail events of kind "test", at any depth, skipped and todo ones included), whether its process sent a summary of its own (a process
// that ends before it reports sends none), each test's full name (the tests and suites that hold it, then its own, joined by " > "), foreign:
// those another process ran too (a test file imports it, or it runs twice), written above 0 with a summary, and sites: per test, where it was
// declared, the depth it was reported at and its own name (l.16). Keyed by real paths. The process of an event is data.entryFile: Node's runner
// sets it, on each event that a test file's process sends, to that file, the events of a node:test root that the file runs in a worker or in a
// child writing to its output included. A test is foreign when its process is not its file's, or its file was already summed up; a summary is its
// file's own only when its file's process sent it. Without entryFile: a process's tests come in one block, closed by its summary; there, a test of another file, or of a file summed up, ran again.
import { relative, sep } from "node:path";
import { realpathSync } from "node:fs";
export default async function* testCounts(source) {
  const files = new Map(), held = new Map(), ran = [], real = (p) => { try { return realpathSync(p); } catch { return null; } }; // held: per file, the names started at each depth; ran: without entryFile, the files of the tests reported since the last summary of a file
  const key = (file) => (file === undefined ? "" : (real(file) === null ? relative(process.cwd(), file) : relative(real(process.cwd()), real(file))).split(sep).join("/"));
  const of = (file) => { const f = key(file); if (!files.has(f)) files.set(f, { tests: 0, summary: false, names: [], foreign: 0, sites: [] }); return files.get(f); };
  const counted = (type, data) => (type === "test:pass" || type === "test:fail") && data.details?.type === "test"; // a test reported: the loop's first clause counts it (the same condition, there), its last line keeps the site
  const site = (data) => [Number.isInteger(data.line) && Number.isInteger(data.column) ? `${data.line}:${data.column}` : null, data.nesting, data.name]; // where the test was declared (data.line:data.column, as Node's runner gives them; null when it gives none), the depth it was reported at, its own name:
  // a second module instance of the file, loaded inside a test or a suite (it imports itself, with a query string, from a test body), declares its tests nested there, at the same sites one depth down, under
  // full names that repeat none, and nothing foreign (its own process, before its summary). P1 of scripts/test-count-floor.mjs refuses a site reported at two depths under one name.
  for await (const { type, data } of source) {
    const by = data?.entryFile === undefined ? undefined : key(data.entryFile); // the file whose process sent the event, when the runner names it
    if ((type === "test:pass" || type === "test:fail") && data.details?.type === "test") { const c = of(data.file); c.tests++; c.names.push([...(held.get(data.file) ?? []).slice(0, data.nesting), data.name].join(" > ")); if (by === undefined) ran.push(c); else if (by !== key(data.file) || c.summary) c.foreign++; }
    else if (type === "test:summary" && data.file !== undefined) { const c = of(data.file); if (by === undefined) for (const r of ran.splice(0)) { if (r !== c || r.summary) r.foreign++; } if (by === undefined || by === key(data.file)) c.summary = true; }
    else if (type === "test:start") held.set(data.file, [...(held.get(data.file) ?? []).slice(0, data.nesting), data.name]);
    if (counted(type, data)) of(data.file).sites.push(site(data)); } // the site of the test counted above, in the order reported
  const run = [...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([f, c]) => [f, { tests: c.tests, summary: c.summary, names: c.names.sort(), ...(c.summary && c.foreign > 0 ? { foreign: c.foreign } : {}) }]);
  for (const [f, c] of run) c.sites = files.get(f).sites; // after the written fields, each test's [site, depth, name]
  yield `${JSON.stringify(Object.fromEntries(run), null, 1)}\n`;
}
