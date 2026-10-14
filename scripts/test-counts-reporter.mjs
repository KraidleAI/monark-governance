// A node --test reporter that test:main loads beside spec. For each test file it writes how many of its tests were reported (test:pass and
// test:fail events of kind "test", at any depth, skipped and todo ones included), whether its process sent a summary of its own (a process
// that ends before it reports sends none), each test's full name (the tests and suites that hold it, then its own, joined by " > "), and
// foreign: those another process ran too (a test file imports it, or it runs twice), written above 0 with a summary. Keyed by real paths.
import { relative, sep } from "node:path";
import { realpathSync } from "node:fs";
export default async function* testCounts(source) {
  const files = new Map(), held = new Map(), ran = [], real = (p) => { try { return realpathSync(p); } catch { return null; } }; // held: per file, the names started at each depth; ran: the files of the tests reported since the last summary of a file
  const of = (file) => {
    const f = file === undefined ? "" : (real(file) === null ? relative(process.cwd(), file) : relative(real(process.cwd()), real(file))).split(sep).join("/");
    if (!files.has(f)) files.set(f, { tests: 0, summary: false, names: [], foreign: 0 });
    return files.get(f);
  };
  for await (const { type, data } of source) { // a process's tests come in one block, closed by its summary: there, a test of another file, or of a file already summed up, ran again
    if ((type === "test:pass" || type === "test:fail") && data.details?.type === "test") { const c = of(data.file); c.tests++; c.names.push([...(held.get(data.file) ?? []).slice(0, data.nesting), data.name].join(" > ")); ran.push(c); }
    else if (type === "test:summary" && data.file !== undefined) { for (const c of ran.splice(0)) if (c !== of(data.file) || c.summary) c.foreign++; of(data.file).summary = true; }
    else if (type === "test:start") held.set(data.file, [...(held.get(data.file) ?? []).slice(0, data.nesting), data.name]);
  }
  const run = [...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([f, c]) => [f, { tests: c.tests, summary: c.summary, names: c.names.sort(), ...(c.summary && c.foreign > 0 ? { foreign: c.foreign } : {}) }]);
  yield `${JSON.stringify(Object.fromEntries(run), null, 1)}\n`;
}
