// A node --test reporter that test:main loads beside spec. For each test file it writes how many tests the file's process reported
// (test:pass and test:fail events of kind "test", at any depth, skipped and todo ones included), whether that process sent a summary of
// its own, and the full name of each of those tests: the names of the tests and suites that hold it, then its own, joined by " > ". A
// process that ends before it reports sends no summary. The output is one JSON object keyed by each file's real path from the real cwd.
import { relative, sep } from "node:path";
import { realpathSync } from "node:fs";
export default async function* testCounts(source) {
  const files = new Map(), held = new Map(), real = (p) => { try { return realpathSync(p); } catch { return null; } }; // held: per file, the names started at each depth
  const of = (file) => {
    const f = file === undefined ? "" : (real(file) === null ? relative(process.cwd(), file) : relative(real(process.cwd()), real(file))).split(sep).join("/");
    if (!files.has(f)) files.set(f, { tests: 0, summary: false, names: [] });
    return files.get(f);
  };
  for await (const { type, data } of source) {
    if ((type === "test:pass" || type === "test:fail") && data.details?.type === "test") { const c = of(data.file); c.tests++; c.names.push([...(held.get(data.file) ?? []).slice(0, data.nesting), data.name].join(" > ")); }
    else if (type === "test:summary" && data.file !== undefined) of(data.file).summary = true;
    else if (type === "test:start") held.set(data.file, [...(held.get(data.file) ?? []).slice(0, data.nesting), data.name]);
  }
  const run = [...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([f, c]) => [f, { tests: c.tests, summary: c.summary, names: c.names.sort() }]);
  yield `${JSON.stringify(Object.fromEntries(run), null, 1)}\n`;
}
