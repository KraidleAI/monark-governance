// Root tests of the Dōjō page (ADR-DOJO-PR-4 D-1, D-4 and section 4, PR-4b): the build check of /dojo (assertDojoBody,
// assertDojoAbsent and dojoExpected of scripts/assert-fleet-html.mjs) driven on synthetic pages, its expectations derived from records
// BUILT at run time from the signed fixture (keys made by node:crypto, never written; no dojo-served.json is committed), each
// written under a temporary root with its own manifest, then removed; the closed list of texts and tier names of lib/dojo-copy.ts;
// the absence before any served snapshot. The built page itself is asserted by `node scripts/assert-fleet-html.mjs` after the build.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import ts from "typescript";
import { buildDojoServed, loadDojoServed, DOJO_SERVED_REL, type DojoChainDeps } from "../apps/site/lib/dojo-served-load.ts";
import { dojoPageFiguresOf, type DojoPageFigures } from "../apps/site/lib/dojo-served.ts";
import * as copy from "../apps/site/lib/dojo-copy.ts";
import { renderedTexts } from "../apps/site/test/honesty-lint.ts";
import { assertDojoAbsent, assertDojoBody, dojoExpected, DOJO_FORBIDDEN, DOJO_NAMED_IDS, DOJO_TIER_NAMES, type DojoExpected } from "../scripts/assert-fleet-html.mjs";
import { OPERATOR_FORMS } from "../scripts/public-text-deny.mjs";
import { dojoFixture, dojoKeyringOf, newKey, render, type Step } from "../apps/dojo/test/helpers/dojo-fixture.ts";
import { walkDojoTimeline } from "../apps/dojo/scripts/dojo-chain.mjs";
import { dojoTrustOf, verifyDojoServed } from "../apps/dojo/scripts/dojo-verify.mjs";
import { rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import { canonical, lineHash, type Trust } from "../apps/bell/scripts/bell-chain.mjs";

const ROOT = join(import.meta.dirname, "..");
const DEPS: DojoChainDeps<Trust> = { trustOf: dojoTrustOf, walk: walkDojoTimeline, lineHash, rootOf, verify: verifyDojoServed };
const CLOSED_TIERS = ["Egg", "Caterpillar", "Chrysalis", "Monarch", "Migration"]; // decision 224, in this order
type Shown = Exclude<DojoExpected, { state: "E0" }>;

/** f(root) over a temporary repository root holding the record of a fixture state (none for E0) and its manifest entry: E1 = seven
 *  counted days, no unit version; E2 = version 1 in force; EA = E1's head abstained; EAV = E2's head abstained. */
async function withState<T>(state: "E0" | "E1" | "E2" | "EA" | "EAV", f: (dir: string) => T | Promise<T>): Promise<T> {
  const fx = dojoFixture(), committed = dojoKeyringOf([[fx.key, 1], [newKey(), 1]]), nine = fx.steps.slice(0, 9);
  const abstain = (s: Step[]): void => { Object.assign(s[s.length - 1]?.body ?? {}, { status: "abstained", beacon: null, reads: [] }); };
  const tree = { E0: null, E1: render(nine), E2: render(fx.steps), EA: render(nine, new Map(), abstain), EAV: render(fx.steps, new Map(), abstain) }[state];
  const record = tree === null ? null : await buildDojoServed({ readAt: "2026-10-11T06:00:00.000Z", tree, committedKeyring: Buffer.from(`${canonical(committed)}\n`) }, DEPS);
  const text = record === null ? null : `${JSON.stringify(record, null, 2)}\n`, dir = mkdtempSync(join(tmpdir(), "dojo-page-"));
  try {
    mkdirSync(join(dir, "apps", "site", "data"), { recursive: true });
    if (text !== null) writeFileSync(join(dir, ...DOJO_SERVED_REL.split("/")), text);
    const files = text === null ? {} : { [DOJO_SERVED_REL]: createHash("sha256").update(text).digest("hex") };
    writeFileSync(join(dir, "apps", "site", "data", "manifest.sha256.json"), JSON.stringify({ algorithm: "sha256", files }));
    return await f(dir);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
const shown = (e: DojoExpected): Shown => (e.state === "E0" ? assert.fail("a record was expected") : e);
const expectedOf = (state: "E1" | "E2" | "EA"): Promise<Shown> => withState(state, async (dir) => shown(await dojoExpected(dir)));
/** A page that renders `e` faithfully: a layout around one <main> holding the pill, then each sentence of the state. */
const pageOf = (e: Shown): string =>
  `<html><body><header><a href="/token">Token</a> 2026</header><main><div>Dōjō</div><span>${e.status}</span>${e.sentences.map((s) => `<p>${s}</p>`).join("")}</main></body></html>`;
const add = (html: string, s: string): string => html.replace("</main>", () => `<p>${s}</p></main>`);
const valuesOf = (f: DojoPageFigures): string[] => (f.state === "E0" ? [] : [f.validation_days, ...(f.state === "EA"
  ? [f.day, ...(f.threshold_unit_token_days === undefined ? [] : [f.threshold_unit_token_days])] : [f.day, f.reads_done, f.k_reads, f.slot_min, f.slot_max,
    f.lines_count, f.root, f.score_total, f.validated_total,
    ...(f.state === "E2" ? [f.threshold_unit_token_days, f.holders_count, f.dust_threshold_tokens, f.migration_days] : [])])]);

// killer: scripts/assert-fleet-html.mjs:681 CONST "T.rereadFirst, ...(counted" -> "...(counted"
// killer: scripts/assert-fleet-html.mjs:640 SDL "unfilled" -> ""
test("dojo_page_renders_served_figures_only — per state, each listed figure once, no other number; the state's sentences, the reread's first", async () => {
  const byState: Record<string, Shown> = {};
  for (const state of ["E1", "E2", "EA", "EAV"] as const) {
    const [e, figures, historyDay, anchorDays] = await withState(state, async (dir) => {
      const data = loadDojoServed(dir);
      return [shown(await dojoExpected(dir)), dojoPageFiguresOf(data), data?.history.history_last_day ?? assert.fail("no record"),
        String(data?.timeline.anchor.validation_days)] as const;
    });
    byState[state] = e;
    assert.equal(e.state, state.slice(0, 2));
    assert.deepEqual(e.figures.map((x) => x.value).sort(), valuesOf(figures).sort(), `${state}: the check composes the page's figures apart, equal on the fixture`);
    const firsts = state.startsWith("EA") ? [copy.DOJO_TEXT.rereadFirst] : [copy.DOJO_TEXT.rereadFirst, copy.DOJO_TEXT.table];
    assert.deepEqual(e.sentences.filter((s) => /browser|reread/i.test(s)), firsts, `${state}: TXT-14r, and the table's first sentence but abstained (TXT-17)`);
    const page = pageOf(e), first = e.figures[0] ?? assert.fail("no figure");
    // The method sentence's one figure, the validation window of the record's anchor in days: another window, or a word, is refused.
    const days = e.figures.find((x) => x.source.endsWith("timeline.anchor, figure validation_days"))?.value ?? assert.fail(`${state}: no window`);
    assert.equal(days, anchorDays, `${state}: the window of the record's anchor, in days`);
    for (const typed of ["60", "sixty", "thirty"]) {
      const said = page.replace(`held for ${days} days`, `held for ${typed} days`);
      assert.throws(() => assertDojoBody({ html: said, expected: e }), /is absent|numeric token|forbidden word/, `${state}: ${typed} days`);
    }
    assert.doesNotThrow(() => assertDojoBody({ html: page, expected: e }), `${state}: a faithful page passes`);
    const red = (html: string, re: RegExp, why: string): void => assert.throws(() => assertDojoBody({ html, expected: e }), re, `${state}: ${why}`);
    red(add(page, "7 lines"), /numeric token/, "a typed number (M-P1)");
    red(add(page, first.value), /occurs 2 time/, "a figure twice");
    red(page.replace(first.value, "x"), /is absent|occurs 0 time/, "a figure dropped");
    red(add(page, historyDay), /numeric token/, "a day of the history, without its text (M-P17)");
    red(add(page, copy.DOJO_TEXT.rereadDone), /another state/, "an outcome of the reread on the built page (TXT-14a)");
    red(add(page, copy.DOJO_TEXT.tableDone), /another state/, "the table once bound, on the built page (TXT-17a)");
    red(page.replace(copy.DOJO_TEXT.bounds, ""), /is absent/, "the bounds sentence dropped (M-P8)");
    red(page.replace(copy.DOJO_TEXT.check, ""), /is absent/, "the check sentence dropped");
    red(page.replace(`<span>${e.status}</span>`, `<span>${e.status === "built" ? "upcoming" : "built"}</span>`), /pill/, "a flipped pill");
    red(page.replace("<main>", "<main><p>&lt;7&gt;</p>"), /entity/, "a number behind an angle bracket written as an entity");
    red(page.replace("<main>", '<main><p title="7"></p>'), /numeric token/, "a number in a visible attribute (G2-M1)");
    red(page.replace("<main>", `<main title="${historyDay}">`), /numeric token/, "a day of the history in the <main> tag's own attribute (G2-M16)");
    red(add(page, "\u0663"), /non-ASCII digits/, "a number in non-ASCII digits (G2-M2)");
    red(add(page, copy.DOJO_TEXT.method), /unfilled/, "a sentence of the closed list with its {name} unfilled (N-1 and G2-M6 of the G2 of SITE-PREP)");
    assert.doesNotThrow(() => assertDojoBody({ html: add(page, first.value), expected: { ...e, figures: [...e.figures, { value: first.value, source: "an equal figure" }] } }), `${state}: two figures of equal value, both rendered (G2-M3)`);
  }
  const pick = (s: string): Shown => byState[s] ?? assert.fail(`the state ${s} is missing`), e1 = pick("E1"), e2 = pick("E2"), ea = pick("EA"), eav = pick("EAV");
  assert.ok(e1.sentences.some((s) => s.includes(" · 3 of 4 scheduled readings between slots ")), "E1: three readings made of four scheduled (TXT-3)");
  assert.throws(() => assertDojoBody({ html: pageOf(e2).replace(" holder holds ", " holders hold "), expected: e2 }), /is absent/, "one holder in the plural sentence (TXT-11s)");
  const root = (e: Shown): string => e.figures.find((x) => x.source.endsWith("figure root"))?.value ?? assert.fail("no root");
  assert.throws(() => assertDojoBody({ html: pageOf(e2).replace(root(e2), root(e1)), expected: e2 }), /is absent|occurs 0 time/, "the root of another day (M-P2)");
  const tiers = e2.sentences.find((s) => s.startsWith("Tiers:")) ?? assert.fail("no tiers sentence in E2");
  assert.throws(() => assertDojoBody({ html: add(pageOf(e1), tiers), expected: e1 }), /another state/, "the unit sentence without a version (M-P16)");
  assert.throws(() => assertDojoBody({ html: add(pageOf(e2), copy.DOJO_TEXT.noVersion), expected: e2 }), /another state/, "the no-version sentence under a version");
  assert.throws(() => assertDojoBody({ html: add(pageOf(ea), "Total hold score:"), expected: ea }), /another state/, "a total on an abstained day");
  assert.throws(() => assertDojoBody({ html: add(pageOf(ea), copy.DOJO_TEXT.table), expected: ea }), /another state/, "a table on an abstained day");
  assert.deepEqual(ea.figures.map((x) => x.source.split(" ").pop()), ["day", "validation_days"], "EA renders its day, and the anchor's window");
  assert.deepEqual(eav.figures.map((x) => x.source.split(" ").pop()), ["day", "threshold_unit_token_days", "validation_days"],
    "EA under a version: its day, the unit in token-days (TXT-3A, TXT-4) and the anchor's window");
  for (const s of [copy.DOJO_TEXT.tier, copy.DOJO_TEXT.noVersion, copy.DOJO_TEXT.totals, copy.DOJO_TEXT.holder, copy.DOJO_TEXT.holders]) assert.throws(() => assertDojoBody({ html: add(pageOf(eav), s), expected: eav }), /another state/, `EA under a version: ${s.slice(0, 32)}`);
});

// killer: apps/site/lib/dojo-copy.ts:82 CONST "could not be reread" -> "could not be read"
test("dojo_page_lexicon_is_closed — the closed list of texts is the approved one (its sha256, its three denials); no text of /dojo carries a forbidden word, 'thirty', 'independent', a name the site vocabulary bans or an operator's or the partner's name; the check refuses each on the page", async () => {
  assert.ok("DOJO_TABLE" in copy, "lib/dojo-copy.ts exports the words of the table (DOJO_TABLE)");
  const texts = [copy.DOJO_NAME, copy.DOJO_TITLE, ...Object.values(copy.DOJO_TEXT)], words = Object.values(copy.DOJO_TABLE);
  assert.deepEqual([texts.length, words.length], [35, 13], "the name, the title and the thirty-three sentences; the thirteen words of the table");
  // ADR-DOJO-PR-4, G0 fold of PR-4c-2 (TXT-14b-r2, 15r, 15a, 15b-r, 17, 17a, 17c, DOJO_TABLE) and decision 301 (TXT-17o), pinned at the G1 of PR-4c-2a;
  // part 3 of the page: TXT-5 names the anchor's window, TXT-17c its third case, the dust rule (17, 17a, 15r, 15b-r, three sentences added).
  // SITE-CORR (C-1 and N-3 of the G2 of SITE-PREP): tableDust and tableNoVersion say "lines", every line under the threshold; and the
  // tier sentence names the Migration window of the anchor in force, {migration_days}, never typed (DOJO-COPY-DURATIONS-DERIVED-1).
  // DOJO-PAGE-FOLD-1: the labels of the two folds of the page, foldCounted and foldCheck, two sentences added, no word of another changed.
  // DOJO-RETRO-TEXT-1 (second cp-1 of PR-4b, after the announcement): retro, the days before the first day read, one sentence added
  // right after method (its sha256 57f95f75...), no word of another changed.
  const TEXTS_SHA256 = "f61fb0d728a9e3fa2ac895bcc89830b0b6c9d5325e7de9e0f145f0d7ccf9b83c";
  assert.deepEqual(texts.filter((t) => t.includes("one hundred and eighty")), [], "no duration of the closed list is typed in words");
  const closed = { DOJO_TEXT: copy.DOJO_TEXT, DOJO_TITLE: copy.DOJO_TITLE, DOJO_TIER_NAMES: copy.DOJO_TIER_NAMES, DOJO_TABLE: copy.DOJO_TABLE };
  assert.equal(createHash("sha256").update(canonical(closed)).digest("hex"), TEXTS_SHA256, "the closed list of texts is the approved one, byte for byte");
  for (const [s, re] of [[copy.DOJO_TEXT.bounds, /What it does not show:/], [copy.DOJO_TEXT.check, /The check does not read the chain\./], [copy.DOJO_TEXT.beacon, /this page does not check that signature/]] as const) assert.match(s, re, "a denial of the approved wording");
  const vocab = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as { banned: { re: string }[]; scan: { site: { banned: { re: string }[] } } };
  const siteVocab = [...vocab.banned, ...vocab.scan.site.banned].map((b) => new RegExp(b.re, "i"));
  for (const t of [...texts, ...words]) {
    assert.deepEqual(siteVocab.filter((re) => re.test(t)).map(String), [], `a name the site vocabulary bans in ${JSON.stringify(t.slice(0, 48))}`);
    assert.deepEqual(DOJO_FORBIDDEN.filter((re) => re.test(t)).map(String), [], `a forbidden word in ${JSON.stringify(t.slice(0, 48))}`);
    assert.deepEqual(OPERATOR_FORMS.filter((f) => f.re.test(t)).map((f) => f.why), [], `an operator or partner name in ${JSON.stringify(t.slice(0, 48))}`);
  }
  const partner = OPERATOR_FORMS.find((f) => f.why === "inference partner") ?? assert.fail("the partner's form is not in the operator list");
  assert.ok([partner.sample, partner.sample.toLowerCase(), partner.sample.toUpperCase()].every((s) => partner.re.test(`via ${s} today`)), "the partner's form refuses its name");
  const e = await expectedOf("E2"), page = pageOf(e);
  for (const w of ["an agent", "agents", "reward", "airdrop", "yield", "eligible", "soon", "live", "guarantee", "verified", "real-time", "ranking",
    "leaderboard", "top holders", "the score", "inference", "budget", "NFT", "dollar", "USD", "$", "buy", "sell", "thirty days", "independent",
    "Bitcoin", "timestamped", "time-stamp", "BLS"]) { // the last four: claims put after the first publication, refused until they are done
    assert.throws(() => assertDojoBody({ html: add(page, w), expected: e }), /forbidden word/, `"${w}" on /dojo (M-P3, M-P19)`);
  }
});

test("dojo_page_tier_names_are_the_closed_list — Egg, Caterpillar, Chrysalis, Monarch, Migration, in this order, from one constant; the check refuses another list, order or place", async () => {
  assert.deepEqual([...copy.DOJO_TIER_NAMES], CLOSED_TIERS, "the page's constant is the closed list");
  assert.deepEqual([...DOJO_TIER_NAMES], CLOSED_TIERS, "the check's list is the closed list");
  const seq = (s: string): string[] => s.match(/\b(?:Egg|Caterpillar|Chrysalis|Monarch|Migration)\b/g) ?? [];
  assert.deepEqual([seq(copy.DOJO_TEXT.tiers), seq(copy.DOJO_TEXT.noVersion), seq(copy.DOJO_TEXT.tier)], [[...CLOSED_TIERS, "Egg"], [...CLOSED_TIERS, "Egg"], [...CLOSED_TIERS, "Migration"]]);
  const others = Object.entries(copy.DOJO_TEXT).filter(([k]) => !["tiers", "noVersion", "tier"].includes(k)).flatMap(([, s]) => seq(s));
  assert.deepEqual(others, [], "no other sentence names a tier");
  for (const [rel, n] of [["apps/site/lib/dojo-copy.ts", 1], ["apps/site/app/dojo/page.tsx", 0], ["apps/site/components/dojo/dojo-figures.tsx", 0]] as const) {
    const src = readFileSync(join(ROOT, ...rel.split("/")), "utf8");
    for (const name of CLOSED_TIERS) assert.equal(src.split(new RegExp(`\\b${name}\\b`)).length - 1, n, `${rel} writes ${name} ${String(n)} time(s): the names are typed once, in the constant`);
  }
  const e = await expectedOf("E2"), page = pageOf(e);
  assert.throws(() => assertDojoBody({ html: page, expected: { ...e, tierNames: ["Egg", "Chrysalis", "Caterpillar", "Monarch", "Migration"] } }), /closed list/, "another order (M-P10)");
  assert.throws(() => assertDojoBody({ html: page, expected: { ...e, tierNames: [...CLOSED_TIERS.slice(0, 4), "Butterfly"] } }), /closed list/, "a name outside the list (M-P10)");
  assert.throws(() => assertDojoBody({ html: add(page, "Monarch"), expected: e }), /tier name Monarch occurs/, "a tier name rendered outside its sentences");
  assert.throws(() => assertDojoBody({ html: page.replace("Caterpillar, Chrysalis", "Chrysalis, Caterpillar"), expected: e }), /is absent/, "the names out of order on the page");
});

test("dojo_page_absent_before_data — no record: no /dojo page (none, or the not-found document with status 404) and no link on /token; the page and the link read the record", async () => {
  assert.deepEqual(await withState("E0", (dir) => dojoExpected(dir)), { state: "E0" }, "no record: nothing to render");
  const token = (link: boolean): string => `<html><body><main><p>Token</p>${link ? `<p><a href="/dojo">${copy.DOJO_TITLE}</a></p>` : ""}</main></body></html>`;
  const notFound = "<html><head><title>MONARK</title></head><body><div>MONARK</div></body></html>"; // the shape measured at the build: no <main>
  assert.deepEqual(assertDojoAbsent({ dojoHtml: null, dojoMeta: null, tokenHtml: token(false) }), { page: "absent" });
  assert.doesNotThrow(() => assertDojoAbsent({ dojoHtml: notFound, dojoMeta: JSON.stringify({ status: 404 }), tokenHtml: token(false) }));
  assert.throws(() => assertDojoAbsent({ dojoHtml: null, dojoMeta: null, tokenHtml: token(true) }), /links to \/dojo/, "a link on /token before any snapshot (M-P17)");
  for (const href of ['href="https://monarkgate.tech/dojo"', 'href="//monarkgate.tech/dojo"', "href=/dojo"]) assert.throws(() => assertDojoAbsent({ dojoHtml: null, dojoMeta: null, tokenHtml: token(false).replace("<p>Token</p>", `<p><a ${href}>x</a></p>`) }), /links to \/dojo/, href);
  const page = pageOf(await expectedOf("E1"));
  assert.throws(() => assertDojoAbsent({ dojoHtml: page, dojoMeta: JSON.stringify({ status: 200 }), tokenHtml: token(false) }), /rendered before/, "a page before any snapshot (M-P17)");
  assert.throws(() => assertDojoAbsent({ dojoHtml: page, dojoMeta: null, tokenHtml: token(false) }), /rendered before/, "a page without its metadata");
  assert.throws(() => assertDojoAbsent({ dojoHtml: page, dojoMeta: JSON.stringify({ status: 404 }), tokenHtml: token(false) }), /carries a <main>/, "a page body under a 404 status");
  const src = (rel: string): string => readFileSync(join(ROOT, ...rel.split("/")), "utf8");
  assert.match(src("apps/site/app/dojo/page.tsx"), /if \(data === null \|\| figures\.state === "E0"\) notFound\(\);/, "the page is notFound() without a record");
  const tokenSrc = src("apps/site/app/token/page.tsx");
  assert.match(tokenSrc, /const dojo = loadDojoServed\(root\);/, "/token reads the record through the page's loader");
  assert.match(tokenSrc, /\{dojo === null \? null : \(\s*<p[^>]*>\s*<Link href=\{DOJO_ROUTE\}>\{DOJO_TITLE\}<\/Link>/, "the link sits in the branch of a loaded record");
  assert.equal(tokenSrc.split("DOJO_ROUTE").length - 1, 2, "one import and one link");
});

// killer: apps/site/components/dojo/dojo-live.tsx:45 CONST "<p>{view.note}</p>" -> "<p>{view.note} again</p>"
test("dojo_copy_is_digit_free — the texts of /dojo and their module type no digit (the names SHA-256 and Ed25519 aside); the page and its figures component render no literal text", () => {
  const unnamed = (s: string): string => DOJO_NAMED_IDS.reduce((t, id) => t.split(id).join(" "), s);
  const exported = ["DOJO_NAME", "DOJO_ROUTE", "DOJO_TABLE", "DOJO_TEXT", "DOJO_TIER_NAMES", "DOJO_TITLE"];
  assert.deepEqual(Object.keys(copy).sort(), exported, "every export is scanned");
  const strings = [copy.DOJO_ROUTE, copy.DOJO_NAME, copy.DOJO_TITLE, ...copy.DOJO_TIER_NAMES, ...Object.values(copy.DOJO_TEXT),
    ...Object.values(copy.DOJO_TABLE)];
  for (const s of strings) assert.doesNotMatch(unnamed(s), /\d/, `a digit in ${JSON.stringify(s.slice(0, 48))} (M-P1)`);
  const t = copy.DOJO_TEXT, withId = (id: string): string[] => strings.filter((s) => s.includes(id));
  const named = [[t.retro, t.check, t.rereadDone, t.table, t.tableDone], [t.exclusion, t.rereadFirst, t.rereadDone, t.rereadNoCheck]];
  assert.deepEqual([withId("SHA-256"), withId("Ed25519")], named, "the two names, where the texts carry them");
  assert.doesNotMatch(unnamed(readFileSync(join(ROOT, "apps", "site", "lib", "dojo-copy.ts"), "utf8")), /\d/, "no digit in the module's source (M-P1)");
  for (const rel of ["apps/site/app/dojo/page.tsx", "apps/site/components/dojo/dojo-figures.tsx", "apps/site/components/dojo/dojo-live.tsx",
    "apps/site/components/dojo/dojo-table.tsx"]) {
    const sf = ts.createSourceFile(rel, readFileSync(join(ROOT, ...rel.split("/")), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    assert.deepEqual(renderedTexts(sf).map((r) => r.text.trim()).filter((t) => t !== ""), [], `${rel} renders a literal text of its own (M-P1, M-P3)`);
  }
});
