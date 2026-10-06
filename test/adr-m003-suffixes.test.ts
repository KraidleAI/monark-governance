// test/adr-m003-suffixes.test.ts -- lot ADR-M003-SUFFIX-DUP-1 (2026-10-06; item ADR-M003-SUFFIX-DUP-1, opened by the erratum of
// docs/JOURNAL-PROVENANCE.md of 2026-10-06 07:4x UTC): the "**Addendum D9" headings of docs/adr/ADR-M003-phase2-integration.md, read
// by scripts/adr-suffixes.mjs. The ADR as committed comes first: its first 17 headings, none to sexdecies with the two octies of
// 2026-09-20 and 2026-09-24, are pinned (a parse that finds nothing is no pass), and later ones may follow (lot R25-REGISTRY-ROOT-1
// appends septdecies). Then headings built here, one per line, from those 17: septdecies appended, then octodecies, pass; a second
// decies, a skipped septdecies, a third octies, the pair under another date, another suffix under the pair's dates, a misspelt suffix
// and an en dash are each refused, by line. The line above the test names the production mutation that reddens it
// (scripts/red-proof.mjs convention). Reads one file, writes nothing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { d9Headings, d9SuffixProblems } from "../scripts/adr-suffixes.mjs";

const ADR = join(import.meta.dirname, "..", "docs", "adr", "ADR-M003-phase2-integration.md");
type Row = readonly [suffix: string, date: string | null];
/** The 17 D9 headings of ADR-M003 at base a43b0126, in file order (l.97 to l.207); bis has no date. */
const PINNED: readonly Row[] = [
  ["", "2026-09-05"], ["bis", null], ["ter", "2026-09-06"], ["quater", "2026-09-06"], ["quinquies", "2026-09-17"], ["sexies", "2026-09-19"],
  ["septies", "2026-09-19"], ["octies", "2026-09-20"], ["octies", "2026-09-24"], ["nonies", "2026-10-05"], ["decies", "2026-10-05"],
  ["undecies", "2026-10-05"], ["duodecies", "2026-10-05"], ["terdecies", "2026-10-05"], ["quaterdecies", "2026-10-05"],
  ["quindecies", "2026-10-05"], ["sexdecies", "2026-10-06"],
];
const row = ([s, d]: Row, dash = "\u{2014}"): string => `**Addendum D9${s === "" ? "" : ` ${s}`} ${dash} ${d ?? "subject"} (synthetic)** : text`;
const LINES = PINNED.map((r) => row(r));
/** The refusals of LINES with line i (0-based) replaced, if given, and extra lines appended. */
const refusals = (extra: readonly string[], i = -1, line = ""): string[] =>
  d9SuffixProblems(d9Headings([...LINES.map((l, j) => (j === i ? line : l)), ...extra].join("\n")));

// killer: scripts/adr-suffixes.mjs:50 CONST "hs.length > 1" -> "hs.length > 2"
test("adr_m003_d9_suffixes_are_unique - each D9 suffix of ADR-M003 is carried once, but octies of 2026-09-20 and of 2026-09-24, and the suffixes run through the Latin ordinals with no gap", () => {
  const heads = d9Headings(readFileSync(ADR, "utf8"));
  assert.deepEqual(heads.slice(0, PINNED.length).map((h) => [h.suffix, h.date]), PINNED, "the 17 D9 headings of 2026-10-06, in file order");
  assert.deepEqual(d9SuffixProblems(heads), [], "ADR-M003 as committed");
  assert.deepEqual(refusals([]), [], "the 17 rebuilt");
  assert.deepEqual(refusals([row(["septdecies", "2026-10-06"])]), [], "septdecies next (lot R25-REGISTRY-ROOT-1)");
  assert.deepEqual(refusals([row(["septdecies", "2026-10-06"]), row(["octodecies", "2026-10-07"])]), [], "then octodecies");
  assert.deepEqual(refusals([row(["decies", "2026-10-07"])]), ['l.11, l.18: suffix "decies" repeats (2026-10-05, 2026-10-07), outside HISTORICAL_DUPLICATES']);
  assert.deepEqual(refusals([row(["octodecies", "2026-10-07"])]), ['l.18: suffix "octodecies" where "septdecies" comes next']);
  assert.deepEqual(refusals([row(["octies", "2026-10-07"])]), ['l.8, l.9, l.18: suffix "octies" repeats (2026-09-20, 2026-09-24, 2026-10-07), outside HISTORICAL_DUPLICATES']);
  assert.deepEqual(refusals([], 8, row(["octies", "2026-09-21"])), ['l.8, l.9: suffix "octies" repeats (2026-09-20, 2026-09-21), outside HISTORICAL_DUPLICATES']);
  assert.deepEqual(refusals([row(["nonies", "2026-09-24"])], 9, row(["nonies", "2026-09-20"])), ['l.10, l.18: suffix "nonies" repeats (2026-09-20, 2026-09-24), outside HISTORICAL_DUPLICATES']);
  assert.deepEqual(refusals([], 16, row(["sedecies", "2026-10-06"])), ['l.17: suffix "sedecies" is not in LATIN_ORDINALS (ends at octodecies)']);
  assert.deepEqual(refusals([], 16, row(["sexdecies", "2026-10-06"], "\u{2013}")), ["l.17: heading does not parse (**Addendum D9 <suffix> \u{2014} <date>)"]);
});
