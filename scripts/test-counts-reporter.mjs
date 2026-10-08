// A node --test reporter that test:main loads beside spec. For each test file it writes how many tests the file's process reported
// (test:pass and test:fail events of kind "test", at any depth, skipped and todo ones included) and whether that process sent a summary
// of its own. A process that ends before it reports (an exit or an exec, at load or inside a test) sends none: the launcher then reports
// the file by its name as one test. Its output is one JSON object, keyed by each file's path from the working directory, sorted.
import { relative, sep } from "node:path";

export default async function* testCounts(source) {
  const files = new Map();
  const of = (file) => {
    const f = file === undefined ? "" : relative(process.cwd(), file).split(sep).join("/");
    if (!files.has(f)) files.set(f, { tests: 0, summary: false });
    return files.get(f);
  };
  for await (const { type, data } of source) {
    if ((type === "test:pass" || type === "test:fail") && data.details?.type === "test") of(data.file).tests++;
    else if (type === "test:summary" && data.file !== undefined) of(data.file).summary = true;
  }
  yield `${JSON.stringify(Object.fromEntries([...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))), null, 1)}\n`;
}
