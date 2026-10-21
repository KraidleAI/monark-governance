/**
 * Root oracles of lot 1d-ii (chantier BELL-COLLECT-TIMER-1, part 1): the "recomputable" phrases of the three Bell pages,
 * deviation (8) of the Terms header, and the counsel-pending mention.
 *   (1) bell_site_recompute_phrases_name_a_definition_not_a_source: the legal table is read through loadBellLegal(ROOT)
 *       (fail-closed on the manifest sha256); on the three pages, no form of the shared provider lists
 *       (test/helpers/provider-forms.ts), no "collector&rsquo;s source", no "official close" (the served definition is the
 *       consolidated close), no "across all US venues" (the source says "on Tapes A, B or C"), the definition of the closing
 *       price on the method page and on /bell; every sentence of the closed inventory that speaks of recomputing a gap, a
 *       ratio or the close carries "licen" or the table's "our data sources", never the table's "public inputs".
 *   (2) bell_terms_deviation_8_is_declared_in_the_header: the header comment of terms/page.tsx carries "(8)" and its reason.
 *   (3) bell_terms_header_carries_no_counsel_pending_mention: "to be validated by counsel" is absent from the Terms header and
 *       from the $comment of the legal data file (read after loadBellLegal(ROOT), which checks its sha256).
 * Each test carries a positive control: a faulty phrase injected into an in-memory copy reds its check (FM-3.3).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadBellLegal, BELL_LEGAL_REL, type BellLegalData } from "../apps/site/lib/bell-legal-load.ts";
import { CASH_CROSS_CHECK_FORMS, CLOSE_SOURCE_FORMS } from "./helpers/provider-forms.ts";

const ROOT = join(import.meta.dirname, "..");
const PAGES = { method: "apps/site/app/bell/method/page.tsx", page: "apps/site/app/bell/page.tsx", terms: "apps/site/app/bell/terms/page.tsx" };
type PageKey = keyof typeof PAGES;
type Pages = Record<PageKey, string>;
const readPages = (): Pages => ({ method: read(PAGES.method), page: read(PAGES.page), terms: read(PAGES.terms) });
const read = (rel: string): string => readFileSync(join(ROOT, rel), "utf8");
const flat = (src: string): string => src.replace(/\{" "\}/g, " ").replace(/\s+/g, " ");
const DEFINITION = "the last last-sale-eligible trade of the regular session on Tapes A, B and C";
const COLLECTOR = /collector(?:&rsquo;|'|’)s source/i;
// Two forms the served definition rules out, matched on the flattened page (a line break may split them; flat() makes it a space).
const OFFICIAL_CLOSE = /\bofficial clos/i;
const ALL_VENUES = /across all US venues/i;
const COUNSEL_PENDING = /to be validated by counsel/i;

/** The legal data, only once its sha256 equals the manifest entry; a refusal is an assertion failure, no message relayed. */
function legal(): BellLegalData {
  try {
    return loadBellLegal(ROOT);
  } catch {
    return assert.fail("loadBellLegal refused the legal data file (fail-closed)");
  }
}

/** Row ten of the Terms table ("any specific data provider's name"): the two phrases it says to use instead. */
function insteadPhrases(data: BellLegalData): string[] {
  return [...(data.terms_words_table[9]?.instead ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1] ?? "");
}

// The closed inventory of the "recompute" surfaces (G0 §1.2, plus page.tsx l.282, constat C-1). "licensed": speaks of
// recomputing a gap, a ratio or the close. "stays": true for the on-chain facts, and for a gap under the reader's own licence;
// or ruled to stay on 2026-10-21, as written or as corrected that day (the method description, the reference-close day, the
// signature card, the title of the first property of /bell).
const INVENTORY: { page: PageKey; start: string; end?: string; rule: "licensed" | "stays" }[] = [
  { page: "method", start: "Definitions pinned to the collector source", end: "collector source.", rule: "stays" },
  { page: "method", start: "Everything a third party needs to recompute a Bell record", end: "dated version of this page.", rule: "licensed" },
  { page: "method", start: "For the off-hours regimes and for after-hours, the anchor day&rsquo;s regular session has already ended", rule: "stays" },
  { page: "method", start: "It says nothing about whether the line&rsquo;s content is true", rule: "stays" },
  { page: "method", start: "A replay confirms the arithmetic", rule: "licensed" },
  { page: "method", start: "With the same inputs", rule: "licensed" },
  { page: "page", start: "Recomputable from the ledger", end: "</h3>", rule: "stays" },
  { page: "page", start: "A public, signed record of how tokenized", end: "anyone can recompute it.", rule: "stays" },
  { page: "page", start: "Each published fact will identify its on-chain transactions", end: "own licence.", rule: "licensed" },
  { page: "page", start: "This page and the facts it links to", rule: "stays" },
  { page: "page", start: "It does not show that the underlying fact is", end: "how you check that.", rule: "licensed" },
  { page: "terms", start: "Bell will publish public, signed, recomputable facts", rule: "stays" },
  { page: "terms", start: "It is a witness:", rule: "licensed" },
  { page: "terms", start: "Anyone will be able to recompute a record", rule: "licensed" },
];

/** The sentence that opens at `start`: up to `end` inclusive, else up to the first full stop before a space, a tag or the end. */
function sentence(text: string, start: string, end?: string): string | null {
  const i = text.indexOf(start);
  if (i < 0) return null;
  if (end !== undefined) {
    const j = text.indexOf(end, i);
    return j < 0 ? null : text.slice(i, j + end.length);
  }
  const m = /\.(?=\s|<|$)/.exec(text.slice(i));
  return m ? text.slice(i, i + m.index + 1) : null;
}

function recomputeProblems(pages: Pages, instead: string[]): string[] {
  const [publicInputs, ourSources] = instead;
  const out: string[] = [];
  for (const key of Object.keys(PAGES) as PageKey[]) {
    pages[key].split(/\r?\n/).forEach((line, i) => {
      for (const { re, why } of [...CASH_CROSS_CHECK_FORMS, ...CLOSE_SOURCE_FORMS]) if (re.test(line)) out.push(`${key}:${i + 1} [${why}]`);
      if (COLLECTOR.test(line)) out.push(`${key}:${i + 1} names the collector's source`);
    });
  }
  for (const key of Object.keys(PAGES) as PageKey[]) {
    if (OFFICIAL_CLOSE.test(flat(pages[key]))) out.push(`${key}: names an official close, not the consolidated close`);
    if (ALL_VENUES.test(flat(pages[key]))) out.push(`${key}: says across all US venues, which no read source says`);
  }
  for (const key of ["method", "page"] as const) if (!flat(pages[key]).includes(DEFINITION)) out.push(`${key}: the definition of the closing price is absent`);
  for (const { page, start, end, rule } of INVENTORY) {
    const s = sentence(flat(pages[page]), start, end);
    if (s === null) { out.push(`${page}: inventory sentence "${start}" not found`); continue; }
    if (rule !== "licensed") continue;
    if (!/licen/i.test(s) && !s.includes(ourSources ?? "\u0000")) out.push(`${page}: "${start}" names no licence and not "${ourSources}"`);
    if (s.includes(publicInputs ?? "\u0000")) out.push(`${page}: "${start}" recomputes from "${publicInputs}"`);
  }
  return out;
}

/** The header comment of terms/page.tsx: from its route line to the page function. */
function termsHeader(src: string): string {
  const i = src.indexOf("// /bell/terms"), j = src.indexOf("export default function");
  return i < 0 || j < i ? "" : src.slice(i, j);
}

const deviation8Problems = (header: string): string[] =>
  /\(8\) factual exactness:[^()]*recomput[^()]*licen[^()]*already requires/.test(flat(header)) ? [] : ["the Terms header does not declare deviation (8) with its reason"];

const counselProblems = (header: string, comment: string): string[] =>
  [COUNSEL_PENDING.test(header) ? "the Terms header" : "", COUNSEL_PENDING.test(comment) ? "the legal data $comment" : ""].filter((w) => w !== "").map((w) => `${w} carries a counsel-pending mention`);

// The one closed sample per close-source form: each form, alone, matches its sample (the list is load-bearing per form).
const CLOSE_SAMPLES: Record<string, string> = {
  "close source brand": "the close is read from Databento",
  "close source API host": "GET https://hist.databento.com/v0/timeseries.get_range",
  "close source env-key name": "no DATABENTO_API_KEY set",
  "close source dataset name": "dataset EQUS.SUMMARY",
  "close source schema name": "schema ohlcv-1d",
  "close feed product acronym": "the NLS+ end-of-day summary",
  "close feed product name": "Last Sale Plus",
  "close feed product family name": "Nasdaq Last Sale",
};

// killer: apps/site/app/bell/page.tsx:695 CONST "from the public ledger and from a reference close read under your own licence" -> "from the public inputs"
test("bell_site_recompute_phrases_name_a_definition_not_a_source", () => {
  const instead = insteadPhrases(legal());
  assert.deepEqual(instead, ["public inputs", "our data sources"], "row ten of the Terms table names the two phrases to use instead");
  const pages = readPages();
  assert.deepEqual(recomputeProblems(pages, instead), [], "a recompute phrase of the Bell pages names a source, or recomputes the close from public inputs");

  // The close-source list is closed and each form is load-bearing.
  assert.deepEqual(CLOSE_SOURCE_FORMS.map((f) => f.why).sort(), Object.keys(CLOSE_SAMPLES).sort(), "the closed list of close-source forms");
  for (const { re, why } of CLOSE_SOURCE_FORMS) assert.ok(re.test(CLOSE_SAMPLES[why] ?? ""), `form "${why}" must match its sample`);
  assert.ok(!CLOSE_SOURCE_FORMS.some((f) => f.re.test(DEFINITION)), "the definition itself names no source");

  // Positive controls: a faulty phrase injected into an in-memory copy reds the check.
  const gapFromPublic = { ...pages, page: pages.page.replace(/It does not show that the underlying fact is[\s\S]*?how you check that\./, "It does not show that the underlying fact is correct, recomputing it from the public inputs is how you check that.") };
  assert.ok(recomputeProblems(gapFromPublic, instead).some((p) => p.includes("public inputs")), "control: the gap recomputed from the public inputs reds");
  const collector = { ...pages, method: `${pages.method}\nDefinitions are those of the collector&rsquo;s source.` };
  assert.ok(recomputeProblems(collector, instead).some((p) => p.includes("collector")), "control: the collector's source reds");
  const named = { ...pages, terms: `${pages.terms}\nthe close is read from Databento` };
  assert.ok(recomputeProblems(named, instead).some((p) => p.includes("close source brand")), "control: a close-source name reds");
  const official = { ...pages, page: `${pages.page}\nthe anchor day&rsquo;s official\n  close has already settled` };
  assert.ok(recomputeProblems(official, instead).some((p) => p.includes("official close")), "control: an official close, across a line break, reds");
  const venues = { ...pages, terms: `${pages.terms}\nthe last eligible trade across all US venues` };
  assert.ok(recomputeProblems(venues, instead).some((p) => p.includes("across all US venues")), "control: across all US venues reds");
});

// killer: apps/site/app/bell/terms/page.tsx:27 CONST "(8) factual exactness: in sections one and two, the sentences on what can be" -> ""
test("bell_terms_deviation_8_is_declared_in_the_header", () => {
  const header = termsHeader(read(PAGES.terms));
  assert.ok(header.length > 0, "the Terms header comment is found");
  assert.deepEqual(deviation8Problems(header), []);
  // Positive control: the header without deviation (8) reds.
  assert.notDeepEqual(deviation8Problems(header.replace(/\(8\)/g, "")), [], "control: a header without (8) reds");
});

// killer: apps/site/app/bell/terms/page.tsx:29 CONST "already requires." -> "already requires (to be validated by counsel)."
test("bell_terms_header_carries_no_counsel_pending_mention", () => {
  legal();
  const comment = (JSON.parse(read(BELL_LEGAL_REL)) as { $comment?: unknown }).$comment;
  assert.ok(typeof comment === "string" && comment.length > 0, "the legal data file carries its $comment");
  const header = termsHeader(read(PAGES.terms));
  assert.ok(header.length > 0, "the Terms header comment is found");
  assert.deepEqual(counselProblems(header, comment), []);
  // Positive controls: the mention injected into the header, or into the $comment, reds.
  assert.equal(counselProblems(`${header} (to be validated by counsel)`, comment).length, 1, "control: the mention in the header reds");
  assert.equal(counselProblems(header, `${comment} (to be validated by counsel)`).length, 1, "control: the mention in the $comment reds");
});
