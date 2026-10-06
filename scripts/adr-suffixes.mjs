// scripts/adr-suffixes.mjs -- lot ADR-M003-SUFFIX-DUP-1 (2026-10-06; item ADR-M003-SUFFIX-DUP-1, opened by the erratum of
// docs/JOURNAL-PROVENANCE.md of 2026-10-06 07:4x UTC): the suffixes of the addenda of decision D9 of
// docs/adr/ADR-M003-phase2-integration.md. A heading is a line that opens, at column 0, with "**Addendum D9"; it reads
// "**Addendum D9 <suffix> — <date> (...)**", the suffix a Latin ordinal adverb (none for the first addendum, then bis, ter,
// quater, ...), the date YYYY-MM-DD (bis alone has none: its heading names its subject). d9SuffixProblems refuses: a heading that does
// not parse; a suffix outside LATIN_ORDINALS; a suffix that, at its first heading in file order, is not the term of LATIN_ORDINALS
// that comes next (a gap or a disorder); a suffix that two headings or more carry, except the closed list HISTORICAL_DUPLICATES:
// octies of 2026-09-20 (lot CI-site) and of 2026-09-24 (one-off R-25 exception of PR #89), each cited under that name before the
// duplicate was seen, so neither is renamed and each is cited with its date (registry note of ADR-M003 under the second; draft of
// RECHERCHES of 2026-10-06, section 0). LATIN_ORDINALS stops at octodecies, the last term that the lot's mission names: a later
// suffix is refused until the list grows from a read source (item ADR-M003-SUFFIX-LIST-1). Pure, zero dependencies, Node 24; not in
// the export whitelist (scripts/export-public.mjs). Test: test/adr-m003-suffixes.test.ts (adr_m003_d9_suffixes_are_unique).

/** The Latin ordinal suffixes of the D9 addenda, in order; "" is the first addendum, which has none. */
export const LATIN_ORDINALS = Object.freeze(["", "bis", "ter", "quater", "quinquies", "sexies", "septies", "octies", "nonies", "decies",
  "undecies", "duodecies", "terdecies", "quaterdecies", "quindecies", "sexdecies", "septdecies", "octodecies"]);
/** The closed list of the suffixes that may repeat, each with the dates of its headings in file order. */
export const HISTORICAL_DUPLICATES = Object.freeze([Object.freeze({ suffix: "octies", dates: Object.freeze(["2026-09-20", "2026-09-24"]) })]);

const OPENS = /^\*\*Addendum D9\b/; // every line that opens so is a heading: parsed, or refused
const HEADING = /^\*\*Addendum D9(?: ([a-z]+))? \u{2014} (?:(\d{4}-\d{2}-\d{2})\b)?/u; // U+2014, the em dash: an en dash or a hyphen does not parse
const shown = (s) => (s === "" ? "(none)" : `"${s}"`);

/** The D9 headings of an ADR text, in file order: the 1-based line, the suffix ("" for none, null when the heading does not parse) and
 *  the date (null when none follows the dash). */
export function d9Headings(text) {
  return text.split(/\r?\n/).flatMap((l, i) => {
    if (!OPENS.test(l)) return [];
    const m = HEADING.exec(l);
    return [{ line: i + 1, suffix: m === null ? null : (m[1] ?? ""), date: m?.[2] ?? null }];
  });
}

/** The refusals of a list of D9 headings in file order; none when each parses, the suffixes run through LATIN_ORDINALS with no gap and
 *  none repeats but a pair of HISTORICAL_DUPLICATES, under its dates. */
export function d9SuffixProblems(headings) {
  const problems = [], carriers = new Map();
  let next = 0; // the index in LATIN_ORDINALS of the suffix that comes next
  for (const h of headings) {
    if (h.suffix === null) { problems.push(`l.${h.line}: heading does not parse (**Addendum D9 <suffix> \u{2014} <date>)`); continue; }
    const at = LATIN_ORDINALS.indexOf(h.suffix);
    if (at < 0) { problems.push(`l.${h.line}: suffix ${shown(h.suffix)} is not in LATIN_ORDINALS (ends at ${LATIN_ORDINALS.at(-1)})`); continue; }
    if (carriers.has(h.suffix)) { carriers.get(h.suffix).push(h); continue; } // a repeat: judged below
    carriers.set(h.suffix, [h]);
    if (at !== next) problems.push(`l.${h.line}: suffix ${shown(h.suffix)} where ${next < LATIN_ORDINALS.length ? shown(LATIN_ORDINALS[next]) : "no known suffix"} comes next`);
    next = at + 1;
  }
  for (const [suffix, hs] of carriers) {
    const dates = hs.map((h) => h.date ?? "no date").join(", ");
    if (hs.length > 1 && !HISTORICAL_DUPLICATES.some((d) => d.suffix === suffix && d.dates.join(", ") === dates)) problems.push(`l.${hs.map((h) => h.line).join(", l.")}: suffix ${shown(suffix)} repeats (${dates}), outside HISTORICAL_DUPLICATES`);
  }
  return problems;
}
