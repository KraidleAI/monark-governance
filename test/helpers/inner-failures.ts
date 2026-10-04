// test/helpers/inner-failures.ts -- lot EXPORT-HARNESS-413-LOAD-1, extends EXPORT-TEST42-INNER-NAMES-1: the failing tests of a nested
// `node --test` run, each with the text of its failing assertion, so an intermittent failure inside the exported CI of test 42 is
// attributable from the outer report alone. The spec reporter prints a failing test twice: its `✖ name (ms)` line during the run,
// then, in the closing "failing tests" list, the same line followed by the error (message, actual/expected, stack). TAP prints
// `not ok N - name` followed by its YAML diagnostic. Each entry keeps the header line and up to DETAIL detail lines (stack frames
// and TAP bookkeeping dropped); a header printed twice keeps its longest entry. Test: test/inner-failures.test.ts.

/** Detail lines kept after each failing header. */
export const DETAIL = 6;
/** Entries kept. */
export const ENTRIES = 10;

const HEADER = /^(✖|not ok)(\s|$)/;
/** A line that opens another entry, a summary or a location ends the detail of the current entry. */
const STOP = /^(✖|✔|ℹ|▶|﹣|not ok\b|ok\b|# |test at )/;
/** Stack frames and TAP bookkeeping: never detail. */
const NOISE = /^(at |---$|\.\.\.$|duration_ms:|type:|location:)/;

/** The failing entries of a nested run's output, at most ENTRIES, each a header line then its indented detail lines. */
export function innerFailures(output: string): string[] {
  const lines = output.split(/\r?\n/).map((l) => l.trim());
  const entries = new Map<string, string[]>();
  lines.forEach((header, i) => {
    if (!HEADER.test(header) || header === "✖ failing tests:") return;
    const detail: string[] = [];
    for (let j = i + 1; j < lines.length && detail.length < DETAIL; j++) {
      const l = lines[j] ?? "";
      if (STOP.test(l)) break;
      if (l !== "" && !NOISE.test(l)) detail.push(`  ${l}`);
    }
    if (detail.length >= (entries.get(header)?.length ?? 0)) entries.set(header, detail);
  });
  return [...entries].slice(0, ENTRIES).map(([header, detail]) => [header, ...detail].join("\n"));
}
