/**
 * Root tests for the committed legal data of /bell/terms and /bell/privacy (lot SITE-LEGAL-1; decisions 146, 147,
 * 148). apps/site/data/bell-legal.json lives under apps/site/data/, which the page-source gates do not walk (gate:vocab
 * SITE_SKIP, honesty lint SKIP_TOP, the probative oracle SKIP): it exists to carry, verbatim, the validated spans those
 * gates refuse in page source. These non-LLM oracles keep that directory from becoming a hole:
 *   (1) bell_legal_loader_checks_the_manifest — loadBellLegal() returns the two privacy spans and the ten table rows
 *       only when the file's sha256 equals the site manifest entry; a one-byte edit, or a file missing from the
 *       manifest, throws (fail-closed; test 44 (a) checks the same manifest entry independently).
 *   (2) bell_legal_data_gate_tokens_are_closed — EXACTLY what the data file carries that a gate would refuse: numeric
 *       tokens 6 and 1 (the GDPR article), 3 (the retention numeral), and the six numbers of the Terms' first-served
 *       instant (an ISO instant: the date part is not admitted when a time follows); the site vocabulary hits "guarante"
 *       (the refused word of row one, since the site scope bans it in any form) and "autonomous"; the probative hit
 *       "verified". Any other digit, banned word or probative word added to the data file reds here. The internal
 *       cross-reference that closed row ten's 'why' cell is removed (deviation 7 of the Terms page); restoring it reds.
 *   (3) bell_legal_section_order_matches_the_validated_numbering — the ids are in the order of the validated texts,
 *       so the derived numbers equal the drafts' own ("## 8. Symbol requests", "## 4. Legal basis", "## 7. Your
 *       rights"), which the cross-references "§8", "§4" and "§7" rely on.
 * Named mutants (measured in the lot report): a digit added to a table cell => (2) reds; "verified" added to a cell
 * => (2) reds; two Terms ids swapped => (3) reds; one byte of the data file changed => (1) and test 44 (a) red.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadBellLegal, BELL_LEGAL_REL } from "../apps/site/lib/bell-legal-load.ts";
import { TERMS_SECTIONS, PRIVACY_SECTIONS, sectionNumber } from "../apps/site/lib/bell-legal.ts";
import { scanText as scanNumericText } from "../apps/site/test/honesty-lint.ts";
import { compilePatterns, scanText as scanVocab } from "../scripts/grep-forbidden.mjs";

const ROOT = join(import.meta.dirname, "..");
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
// Verbatim from the PROBATIVE constant of test/public-surfaces-honesty.test.ts (the same probative oracle).
const PROBATIVE = /(?<!\bnot )(?<!\bno )(?<!\bnever )\b(?:verified|proven|certified)\b/gi;

test("bell_legal_loader_checks_the_manifest — sha256-checked, complete, fail-closed", () => {
  const data = loadBellLegal(ROOT);
  // The instant the Terms text was first served: the switch of the storefront upload that shipped it (operator upload
  // journal). Since then the text changed only by deviation 7 of the Terms page (an internal cross-reference removed from
  // row ten, no obligation changed). Whether that change is material, and so re-dated to the switch instant of the upload
  // that first serves it (Terms section 'Changes': "Material changes will be dated"), is item TERMS-REDATE-1 (owner:
  // orchestrator; trigger: that upload). Until that ruling the committed date stays the first-served instant.
  assert.equal(data.terms_last_updated_utc, "2026-09-23T19:49:17Z");
  assert.equal(data.terms_words_table[9]?.why, "Which sources we cross-check against is not published.", "row ten's 'why' cell without the internal cross-reference");
  for (const r of data.terms_words_table) {
    for (const cell of [r.avoid, r.why, r.instead]) assert.doesNotMatch(cell, /\bdecisions? \d|\binternal\)/i, `an internal cross-reference in the Terms table: ${cell}`);
  }
  const terms = readFileSync(join(ROOT, "apps/site/app/bell/terms/page.tsx"), "utf8");
  assert.match(terms, /legal\.terms_last_updated_utc/, "the Terms page reads the date from the hashed data file");
  assert.ok(terms.includes("Last updated: {legal.terms_last_updated_utc.slice(0, 10)}."), "the Last updated line renders the loaded date, never a typed one");
  assert.ok(!terms.includes("terms_published_date"), "the stale placeholder is gone");
  assert.equal(data.privacy.legal_basis_citation, "Article 6(1)(f) GDPR");
  assert.equal(data.privacy.retention_period, "Three (3) years");
  assert.equal(
    data.terms_words_scope_sentence,
    'On this Service\'s pages these words appear only in this list and in negations (for example "never a score").',
    "the table's second introductory sentence (orchestrator ruling TERMS-WORDS-SENTENCE-1)",
  );
  assert.equal(data.terms_words_table.length, 10, "the validated table has ten rows");
  assert.equal(data.terms_words_table[0]?.avoid, '"guarantee"');
  assert.equal(data.terms_words_table[9]?.avoid, "any specific data provider's name");

  const tmp = mkdtempSync(join(tmpdir(), "bell-legal-"));
  try {
    mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
    const manifest = readFileSync(join(ROOT, MANIFEST_REL), "utf8");
    const raw = readFileSync(join(ROOT, BELL_LEGAL_REL), "utf8");
    writeFileSync(join(tmp, MANIFEST_REL), manifest);
    writeFileSync(join(tmp, BELL_LEGAL_REL), raw.replace("Three (3) years", "Three (4) years"));
    assert.throws(() => loadBellLegal(tmp), /sha256 mismatch/, "a one-byte edit must throw");
    const unlisted = JSON.parse(manifest) as { files: Record<string, string> };
    delete unlisted.files[BELL_LEGAL_REL];
    writeFileSync(join(tmp, MANIFEST_REL), JSON.stringify(unlisted));
    writeFileSync(join(tmp, BELL_LEGAL_REL), raw);
    assert.throws(() => loadBellLegal(tmp), /not listed in the site manifest/, "a file missing from the manifest must throw");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("bell_legal_data_gate_tokens_are_closed — exactly the refused spans, nothing else", () => {
  const data = loadBellLegal(ROOT);
  const fields: Array<[string, string]> = [
    ["terms_last_updated_utc", data.terms_last_updated_utc],
    ["privacy.legal_basis_citation", data.privacy.legal_basis_citation],
    ["privacy.retention_period", data.privacy.retention_period],
    ["terms_words_scope_sentence", data.terms_words_scope_sentence],
  ];
  data.terms_words_table.forEach((r, i) => {
    fields.push([`terms_words_table[${i}].avoid`, r.avoid], [`terms_words_table[${i}].why`, r.why], [`terms_words_table[${i}].instead`, r.instead]);
  });
  assert.equal(fields.length, 34, "one date + two spans + one sentence + ten rows of three cells");

  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as {
    banned: { re: string; why: string }[];
    scan: { site: { banned: { re: string; why: string }[]; exemptPhrases: string[] } };
  };
  const sitePatterns = [...compilePatterns(cfg.banned), ...compilePatterns(cfg.scan.site.banned)];

  const digits: Record<string, string[]> = {};
  const vocab: Record<string, string[]> = {};
  const probative: Record<string, string[]> = {};
  for (const [name, s] of fields) {
    const d = scanNumericText(s, new Set<string>());
    if (d.length) digits[name] = d;
    const v = scanVocab(s, sitePatterns, cfg.scan.site.exemptPhrases).map((h) => h.word);
    if (v.length) vocab[name] = v;
    const p = s.match(PROBATIVE);
    if (p) probative[name] = [...p];
  }
  assert.deepEqual(
    digits,
    { terms_last_updated_utc: ["2026", "09", "23", "19", "49", "17"], "privacy.legal_basis_citation": ["6", "1"], "privacy.retention_period": ["3"] },
    "numeric tokens carried by the legal data (honesty-lint detector, no exemption)",
  );
  assert.deepEqual(vocab, { "terms_words_table[0].avoid": ["guarante"], "terms_words_table[3].avoid": ["autonomous"] }, "site vocabulary hits carried by the legal data");
  assert.deepEqual(probative, { "terms_words_table[1].avoid": ["verified"] }, "probative hits carried by the legal data");
});

test("bell_legal_section_order_matches_the_validated_numbering — derived numbers = the drafts' own", () => {
  assert.deepEqual(
    [...TERMS_SECTIONS],
    ["about", "publish", "licence", "prohibited-uses", "no-warranty", "liability", "availability", "symbol-requests", "no-account", "changes", "governing-law", "contact"],
  );
  assert.deepEqual(
    [...PRIVACY_SECTIONS],
    ["controller", "collect", "purpose", "legal-basis", "recipients", "retention", "rights", "required", "automated", "access-logs", "changes"],
  );
  assert.equal(sectionNumber(TERMS_SECTIONS, "about"), "1");
  assert.equal(sectionNumber(TERMS_SECTIONS, "symbol-requests"), "8", "TERMS '## 8. Symbol requests' (target of PRIVACY §3)");
  assert.equal(sectionNumber(TERMS_SECTIONS, "contact"), "12");
  assert.equal(sectionNumber(PRIVACY_SECTIONS, "legal-basis"), "4", "PRIVACY '## 4. Legal basis' (target of §4 in section seven)");
  assert.equal(sectionNumber(PRIVACY_SECTIONS, "rights"), "7", "PRIVACY '## 7. Your rights' (target of §7 in section six)");
  assert.equal(sectionNumber(PRIVACY_SECTIONS, "changes"), "11");
  assert.throws(() => sectionNumber(TERMS_SECTIONS as readonly string[], "nowhere"), /not in the page's section order/);
});
