// Root tests of the server render of /dojo: the page, its figures section and the table of the lines, transpiled by typescript (jsx:
// react-jsx) into a temporary directory, the alias @/ resolved to the site's own files, and rendered by react-dom/server, never by a
// browser. A server render is the first paint the build serves (no effect runs on a server); each state of the table is rendered through
// its body, DojoTableBody, which holds no hook. Oracles, never the modules under test: the build check (assertDojoBody and dojoExpected of
// scripts/assert-fleet-html.mjs) on the page rendered from records built at run time from the signed fixture (keys made by node:crypto,
// never written), the served lines files, the closed list of lib/dojo-copy.ts. No network. The exports this part adds are asserted present
// first, so that at the base each test reds by an assertion (red-proof), never by an import.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { createElement, type FunctionComponent } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as served from "../apps/site/lib/dojo-served.ts";
import * as live from "../apps/site/lib/dojo-live.ts";
import * as copy from "../apps/site/lib/dojo-copy.ts";
import { dojoLookupOf } from "../apps/site/lib/dojo-lookup.ts";
import { buildDojoServed, loadDojoServed, DOJO_SERVED_REL, type DojoChainDeps, type DojoServedData } from "../apps/site/lib/dojo-served-load.ts";
import { assertDojoBody, dojoExpected } from "../scripts/assert-fleet-html.mjs";
import { ANCHOR_DAY, at, dojoFixture, dojoKeyringOf, newKey, render, type Step } from "../apps/dojo/test/helpers/dojo-fixture.ts";
import { walkDojoTimeline } from "../apps/dojo/scripts/dojo-chain.mjs";
import { dojoTrustOf, verifyDojoServed } from "../apps/dojo/scripts/dojo-verify.mjs";
import { rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import { canonical, lineHash, type Trust } from "../apps/bell/scripts/bell-chain.mjs";

type Tree = Map<string, Buffer>;
type Rec = Record<string, unknown>;
type Rows = Extract<served.DojoTable, { kind: "rows" }>;
const ROOT = join(import.meta.dirname, ".."), SITE = join(ROOT, "apps", "site"), NL = String.fromCharCode(10), T = copy.DOJO_TEXT;
const DEPS: DojoChainDeps<Trust> = { trustOf: dojoTrustOf, walk: walkDojoTimeline, lineHash, rootOf, verify: verifyDojoServed };
const fromRoot = createRequire(join(ROOT, "package.json")), urlOf = (p: string): string => pathToFileURL(p).href, temps: string[] = [];
after(() => { for (const d of temps) rmSync(d, { recursive: true, force: true }); });
const temp = (prefix: string): string => { const d = mkdtempSync(join(tmpdir(), prefix)); temps.push(d); return d; };

/** The site's components, transpiled once: react-jsx; @/lib/x is the library's own file, @/components/x its transpiled twin, react its
 *  installed package; next/navigation a stub whose notFound throws (a page with a record never calls it); any other import fails. */
let compiled: string | null = null;
async function load(rel: string): Promise<Rec> {
  compiled ??= (() => {
    const dir = temp("dojo-render-"), stub = join(dir, "next-navigation.mjs");
    writeFileSync(stub, `export function notFound() { throw new Error("notFound"); }${NL}`);
    const target = (spec: string): string => {
      if (spec.startsWith("node:")) return spec;
      if (spec.startsWith("@/lib/")) return urlOf(join(SITE, "lib", `${spec.slice(6)}.ts`));
      if (spec.startsWith("@/components/")) return urlOf(join(dir, "components", `${spec.slice(13)}.mjs`));
      if (spec === "react" || spec === "react/jsx-runtime") return urlOf(fromRoot.resolve(spec));
      return spec === "next/navigation" ? urlOf(stub) : assert.fail(`an import the render does not resolve: ${spec}`);
    };
    for (const file of ["components/dojo/dojo-figures.tsx", "components/dojo/dojo-table.tsx", "components/dojo/dojo-live.tsx", "app/dojo/page.tsx"]) {
      const options = { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 };
      const out = ts.transpileModule(readFileSync(join(SITE, ...file.split("/")), "utf8"), { fileName: file, compilerOptions: options }).outputText;
      const to = join(dir, ...file.replace(/[.]tsx$/, ".mjs").split("/"));
      mkdirSync(dirname(to), { recursive: true });
      writeFileSync(to, out.replace(/from "([^"]+)"/g, (_, spec: string) => `from "${target(spec)}"`));
    }
    return dir;
  })();
  return (await import(urlOf(join(compiled, ...rel.split("/"))))) as Rec;
}
/** An export a component module must carry, asserted first: at the base the test reds here, by an assertion. */
async function component<P extends object>(rel: string, name: string): Promise<FunctionComponent<P>> {
  const m = await load(rel);
  assert.equal(typeof m[name], "function", `${rel} exports ${name}`);
  return m[name] as FunctionComponent<P>;
}
/** The text of some markup: tags dropped, the five entities React writes decoded. */
const textOf = (html: string): string => html.replace(/<[^>]*>/g, "").replaceAll("&#x27;", "'").replaceAll("&quot;", '"')
  .replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
/** The cells of each row of the body of the rendered table, in order. */
const rowsIn = (html: string): string[][] => [...(html.split("<tbody>")[1] ?? "").matchAll(/<tr>(.*?)<[/]tr>/g)]
  .map((m) => [...(m[1] ?? "").matchAll(/<td class="break-all">(.*?)<[/]td>/g)].map((c) => textOf(c[1] ?? "")));

/** A temporary repository root holding `record` (as the sync writes it) and its manifest entry. */
function rootWith(record: Rec): string {
  const dir = temp("dojo-render-root-"), text = JSON.stringify(record, null, 2) + NL;
  mkdirSync(join(dir, "apps", "site", "data"), { recursive: true });
  writeFileSync(join(dir, ...DOJO_SERVED_REL.split("/")), text);
  const files = { [DOJO_SERVED_REL]: createHash("sha256").update(text).digest("hex") };
  writeFileSync(join(dir, "apps", "site", "data", "manifest.sha256.json"), JSON.stringify({ algorithm: "sha256", files }));
  return dir;
}
/** The fixture's served trees and records: E1 (seven counted days, no unit version), E2 (version 1 in force), EA (E1's head abstained). */
async function records(): Promise<{ trees: Record<"E1" | "E2" | "EA", Tree>; recs: Record<"E1" | "E2" | "EA", Rec> }> {
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]), nine = f.steps.slice(0, 9);
  const abstain = (s: Step[]): void => { Object.assign(s[s.length - 1]?.body ?? {}, { status: "abstained", beacon: null, reads: [] }); };
  const trees = { E1: render(nine), E2: render(f.steps), EA: render(nine, new Map(), abstain) };
  const build = (tree: Tree): Promise<Rec> =>
    buildDojoServed({ readAt: "2026-10-11T06:00:00.000Z", tree, committedKeyring: Buffer.from(canonical(k) + NL) }, DEPS);
  return { trees, recs: { E1: await build(trees.E1), E2: await build(trees.E2), EA: await build(trees.EA) } };
}
/** The page the server renders over the record under `dir` (its loader reads the repository root two levels above the working directory). */
async function pageAt(dir: string): Promise<string> {
  const page = (await load("app/dojo/page.mjs")).default as FunctionComponent, cwd = process.cwd();
  mkdirSync(join(dir, "apps", "site"), { recursive: true });
  process.chdir(join(dir, "apps", "site"));
  try { return `<html><body>${renderToStaticMarkup(createElement(page))}</body></html>`; } finally { process.chdir(cwd); }
}
/** The table of the head a loaded record commits, through the module under test, its lines file read from the served tree and bound. */
async function tableOf(c: DojoServedData, tree: Tree): Promise<served.DojoTable> {
  const sha256: live.Sha256 = (b) => Promise.resolve(new Uint8Array(createHash("sha256").update(b).digest()));
  const get: live.DojoLiveGet = (rel) => Promise.resolve(tree.has(rel) ? new Response(tree.get(rel)) : new Response(null, { status: 404 }));
  const view: served.DojoLiveView = { ...served.dojoFirstViewOf(c, T), head: c.head, rows: null };
  return served.dojoTableOf(view, { read: live.boundedSource(get), bind: (b, h) => live.bindDojoLines(b, h, sha256), words: copy.DOJO_TABLE,
    tiers: copy.DOJO_TIER_NAMES });
}
const rowsOf = (t: served.DojoTable): Rows => (t.kind === "rows" && t.bound.length > 0 ? t : assert.fail(`no line bound: ${t.kind}`));
type BodyProps = { table: served.DojoTable; found: ReturnType<typeof dojoLookupOf> | null; count: number; typed: { current: null };
  look: () => void; all: () => void; more: () => void };
const none = (): void => undefined;
/** One state of the table, rendered by its body. */
async function body(table: served.DojoTable, found: BodyProps["found"] = null, count = 100): Promise<string> {
  const Body = await component<BodyProps>("components/dojo/dojo-table.mjs", "DojoTableBody");
  return renderToStaticMarkup(createElement(Body, { table, found, count, typed: { current: null }, look: none, all: none, more: none }));
}

/** What the build check expects of the record under `dir`, asserted to be a page (never the state without a record). */
async function expectedAt(dir: string): Promise<Exclude<Awaited<ReturnType<typeof dojoExpected>>, { state: "E0" }>> {
  const e = await dojoExpected(dir);
  return e.state === "E0" ? assert.fail("a record was expected") : e;
}

// killer: apps/site/app/dojo/page.tsx:19 CONST "[T.exclusion," -> "[T.method, T.exclusion,"
// killer: apps/site/app/dojo/page.tsx:39 CONST "<DojoSentence text={T.method} figures={figures} />" -> "{T.method}"
// killer: scripts/assert-fleet-html.mjs:678 CONST "String(A.tier_windows[4])" -> "String(A.tier_windows[3])"
// killer: apps/site/lib/dojo-served.ts:49 CONST "migration_days: migrationOf(data)" -> "migration_days: validation_days"
// killer: apps/site/lib/dojo-copy.ts:41 CONST "{migration_days} days" -> "one hundred and eighty days"
test("dojo_render_page_passes_the_build_check", async () => {
  const { recs } = await records(), pages = new Map<string, string>();
  for (const state of ["E1", "E2", "EA"] as const) {
    const record = recs[state], dir = rootWith(record), html = await pageAt(dir);
    const days = String(((record.timeline as Rec).anchor as Rec).validation_days);
    // The method sentence names the validation window of the record's anchor, in days: never a duration typed in the copy.
    assert.ok(textOf(html).includes(`has been held for ${days} days in a row`), `${state}: the anchor's window, ${days} days`);
    // The tier sentence (E2 only) names the Migration window of the same anchor, tier_windows[4], in days; no page says it in words.
    const migration = String((((record.timeline as Rec).anchor as Rec).tier_windows as number[])[4]);
    assert.deepEqual([textOf(html).includes(`held for at least ${migration} days, read from its line`), textOf(html).includes("one hundred and eighty")],
      [state === "E2", false], `${state}: the anchor's Migration window, ${migration} days, in E2 alone; no duration typed in words`);
    const expected = await expectedAt(dir);
    assert.doesNotThrow(() => assertDojoBody({ html, expected }), `${state}: the page the server renders passes the build check`);
    pages.set(state, html);
  }
  // Another window in the anchor: the page names it and passes; the page of the first window is refused against it.
  const e2 = recs.E2, tl = e2.timeline as Rec, other = { ...e2, timeline: { ...tl, anchor: { ...(tl.anchor as Rec), validation_days: 60 } } };
  const dir = rootWith(other), html = await pageAt(dir), expected = await expectedAt(dir);
  assert.ok(textOf(html).includes("has been held for 60 days in a row"), "the window of the anchor, whatever it is");
  assert.doesNotThrow(() => assertDojoBody({ html, expected }), "the page of that anchor passes");
  assert.throws(() => assertDojoBody({ html: pages.get("E2") ?? "", expected }), /is absent|occurs 0 time/, "a window other than the anchor's is refused");
  // A second anchor line, as on the served chronology (line 2, Migration at 90 days, same seed and day): the record takes the anchor in force,
  // the page names its Migration window and passes; the page of the first anchor is refused against it (DOJO-COPY-DURATIONS-DERIVED-1).
  const fx = dojoFixture(), [a1, ...rest] = fx.steps, one = a1 ?? assert.fail("an anchor line"), k1 = dojoKeyringOf([[fx.key, 1]]);
  const a2: Step = { key: fx.key, body: { ...one.body, published_at: at(ANCHOR_DAY, 13), tier_windows: [30, 30, 30, 30, 90] } };
  const two = await buildDojoServed({ readAt: "2026-10-11T06:00:00.000Z", tree: render([one, a2, ...rest]), committedKeyring: Buffer.from(canonical(k1) + NL) },
    DEPS), a = (two.timeline as Rec).anchor as Rec, dir2 = rootWith(two), html2 = await pageAt(dir2), expected2 = await expectedAt(dir2);
  assert.deepEqual([a.seq, a.tier_windows, textOf(html2).includes("held for at least 90 days, read from its line")], [2, [30, 30, 30, 30, 90], true],
    "the anchor in force is line 2, and the page names its Migration window, 90 days");
  assert.doesNotThrow(() => assertDojoBody({ html: html2, expected: expected2 }), "the page of the anchor in force passes the build check");
  assert.throws(() => assertDojoBody({ html: pages.get("E2") ?? "", expected: expected2 }), /is absent|occurs 0 time/, "the first anchor's page is refused");
});

// killer: apps/site/components/dojo/dojo-table.tsx:67 CONST "slice(0, count)" -> "slice(0, count + 1)"
test("dojo_render_table_lists_the_lines", async () => {
  const { trees, recs } = await records(), c = loadDojoServed(rootWith(recs.E2)) ?? assert.fail("a record"), t = rowsOf(await tableOf(c, trees.E2));
  // The rows rendered are the lines listed, in the order shown, each cell as the module gives it; the columns as given.
  const html = await body(t);
  assert.deepEqual(rowsIn(html), t.shown.map((r) => r.cells), "each row rendered is a line listed, cell for cell, in order");
  assert.deepEqual([...html.matchAll(/<th>(.*?)<[/]th>/g)].map((m) => textOf(m[1] ?? "")), t.columns, "the columns");
  // By slices of one hundred lines: a press shows one hundred more, and the button goes once every line listed is shown.
  const row = (i: number): served.DojoTableRow => ({ line: `l${String(i)}`, address: `a${String(1000 + i)}`, score: String(i), listed: true,
    cells: [`a${String(1000 + i)}`, "holder", String(i)] });
  const many: Rows = { ...t, bound: Array.from({ length: 250 }, (_, i) => row(i)), shown: Array.from({ length: 250 }, (_, i) => row(249 - i)) };
  for (const [count, shown, more] of [[100, 100, true], [200, 200, true], [300, 250, false]] as const) {
    const h = await body(many, null, count);
    assert.deepEqual([rowsIn(h).length, rowsIn(h)[0]?.[0], h.includes(copy.DOJO_TABLE.showMore)], [shown, "a1249", more], `count ${String(count)}`);
  }
  // A line looked up: that row alone, and the button that shows every line again; no row before the lines are bound.
  const found = dojoLookupOf(t.bound[0]?.address ?? "", t.bound), one = await body(t, found);
  assert.deepEqual([rowsIn(one), one.includes(copy.DOJO_TABLE.showAll), one.includes(copy.DOJO_TABLE.showMore)],
    [[t.bound[0]?.cells], true, false], "the row looked up, alone");
  assert.deepEqual(rowsIn(await body({ kind: "wait" })), [], "no row before the lines are bound");
});

// killer: apps/site/components/dojo/dojo-table.tsx:66 SDL "table.bound.length === 0" -> ""
test("dojo_render_table_says_each_state", async () => {
  const { trees, recs } = await records(), c = loadDojoServed(rootWith(recs.E2)) ?? assert.fail("a record"), t = rowsOf(await tableOf(c, trees.E2));
  // A table to come, a refusal, an abstained head: one sentence, or nothing.
  assert.deepEqual([textOf(await body({ kind: "wait" })), textOf(await body({ kind: "refused" })), await body({ kind: "none" })],
    [T.table, T.tableRefused, ""], "the sentence of each state, alone");
  assert.match(T.tableRefused, /could not be read in your browser, did not match the signed line, or carries a line out of form/, "TXT-17c, three cases");
  // A lines file without a line: its first sentence alone, no order, no field and no table.
  const empty = await body({ ...t, bound: [], shown: [] });
  assert.deepEqual([textOf(empty), empty.includes("<input"), empty.includes("<table")], [T.tableDone, false, false], "no line: one sentence");
});

// killer: apps/site/components/dojo/dojo-table.tsx:90 CONST "role=" -> "data-role="
test("dojo_render_table_says_a_look_up_in_a_status_region", async () => {
  const { trees, recs } = await records(), c = loadDojoServed(rootWith(recs.E2)) ?? assert.fail("a record"), t = rowsOf(await tableOf(c, trees.E2));
  // The outcome of a look-up is said in a status region, which a screen reader announces; the rows stay as they were.
  for (const [typed, sentence] of [["not an address", T.lookupInvalid], ["1".repeat(32), T.lookupAbsent]] as const) {
    const html = await body(t, dojoLookupOf(typed, t.bound));
    assert.ok(html.includes(`<p role="status">${sentence}</p>`), `${typed}: said in a status region`);
    assert.deepEqual(rowsIn(html), t.shown.map((r) => r.cells), `${typed}: the lines listed, unchanged`);
  }
  assert.equal((await body(t)).includes("role="), false, "no status region before a look-up");
});

// killer: apps/site/components/dojo/dojo-table.tsx:71 CONST "table.versioned ? T.tableDust : T.tableNoVersion" -> "T.tableDust"
test("dojo_render_table_says_the_dust_rule", async () => {
  const { trees, recs } = await records(), c2 = loadDojoServed(rootWith(recs.E2)) ?? assert.fail("E2");
  const e1 = rowsOf(await tableOf(loadDojoServed(rootWith(recs.E1)) ?? assert.fail("E1"), trees.E1)), e2 = rowsOf(await tableOf(c2, trees.E2));
  // Without a unit version: every line listed, and the sentence of what the first version changes.
  const h1 = await body(e1);
  assert.deepEqual([h1.includes(T.tableNoVersion), h1.includes(T.tableDust), rowsIn(h1).length], [true, false, e1.bound.length], "E1: every line");
  // Under a version: the sentence of the dust rule; a line whose day value is under the dust threshold of the version line the served
  // timeline signs (never the module's) is bound, never listed, and a look-up finds it and says so (C-1 and N-3 of the G2 of SITE-PREP).
  // First the same lines with the program line under the threshold and the holder line under it read without a day value, then the fixture's.
  const tl = (trees.E2.get("timeline.jsonl") ?? assert.fail("a timeline")).toString().split(NL).filter((s) => s !== "").map((s) => JSON.parse(s) as Rec);
  const dust = BigInt(String((tl.find((l) => l.kind === "price_version") ?? assert.fail("a version line")).dust_threshold));
  const under = (r: served.DojoTableRow): boolean => {
    const v = (JSON.parse(r.line) as Rec).day_value;
    return typeof v === "string" && BigInt(v) < dust;
  };
  const swap = (o: Rec): Rec => (o.class === "program" ? { ...o, day_value: "1" } : BigInt(String(o.day_value)) < dust ? { ...o, day_value: null } : o);
  const quiet = { read: () => assert.fail("no GET"), bind: () => assert.fail("no binding"), words: copy.DOJO_TABLE, tiers: copy.DOJO_TIER_NAMES };
  const view = { ...served.dojoFirstViewOf(c2, T), head: c2.head, rows: e2.bound.map((r) => canonical(swap(JSON.parse(r.line) as Rec))) };
  const swapped = rowsOf(await served.dojoTableOf(view, quiet)), lookups = await import("../apps/site/lib/dojo-lookup.ts");
  for (const [name, t, klass] of [["a program line under it, a holder line without a day value", swapped, "program"], ["the fixture", e2, "holder"]] as const) {
    const hidden = t.bound.filter(under), h2 = await body(t), listed = rowsIn(h2).map((cells) => cells[0] ?? "").sort();
    assert.deepEqual([hidden.map((r) => (JSON.parse(r.line) as Rec).class), h2.includes(T.tableDust), h2.includes(T.tableNoVersion)], [[klass], true, false],
      `${name}: one ${klass} line under the threshold, and the dust rule`);
    assert.deepEqual(listed, t.bound.filter((r) => !under(r)).map((r) => r.address).sort(), `${name}: every line listed but the one under the threshold`);
    for (const r of hidden) {
      assert.ok("dojoTableLookupOf" in lookups, "lib/dojo-lookup.ts exports dojoTableLookupOf (the look-up the component makes)");
      const html = await body(t, lookups.dojoTableLookupOf(r.address, t)), said = [html.includes(`<p role="status">${T.lookupDust}</p>`), rowsIn(html)];
      assert.deepEqual(said, [true, [r.cells]], `${r.address}: found, said under the threshold`);
    }
  }
});

// killer: apps/site/lib/dojo-served.ts:211 CONST "view.head?.line_hash" -> "view.figures.state"
test("dojo_render_table_starts_over_for_another_head", async () => {
  assert.ok("dojoTableKeyOf" in served, "lib/dojo-served.ts exports dojoTableKeyOf");
  const keyOf = served.dojoTableKeyOf;
  const { recs } = await records(), f = dojoFixture(), k = dojoKeyringOf([[f.key, 1]]);
  const c8 = loadDojoServed(rootWith(await buildDojoServed({ readAt: "2026-10-11T06:00:00.000Z", tree: render(f.steps.slice(0, 8)),
    committedKeyring: Buffer.from(canonical(k) + NL) }, DEPS))) ?? assert.fail("seq 8");
  const loaded = (s: "E1" | "E2" | "EA"): DojoServedData => loadDojoServed(rootWith(recs[s])) ?? assert.fail(s);
  const c9 = loaded("E1"), c12 = loaded("E2"), ea = loaded("EA");
  const at = (c: DojoServedData): served.DojoLiveView => ({ ...served.dojoFirstViewOf(c, T), head: c.head, rows: null });
  // The table is keyed by the head shown: one key per head (two heads of one state too), the first paint apart, the same head the same key.
  const views = [served.dojoFirstViewOf(c9, T), at(c8), at(c9), at(c12), at(ea)].map((v) => keyOf(v));
  assert.equal(new Set(views).size, views.length, "a key per head shown");
  assert.deepEqual([views[0], keyOf(at(c9)) === views[2]], ["", true], "the first paint apart; the same head, the same key");
  const src = readFileSync(join(SITE, "components", "dojo", "dojo-live.tsx"), "utf8");
  assert.equal(src.split("<DojoTable key={dojoTableKeyOf(view)} view={view} get={get} sha256={sha256} />").length - 1, 1, "the table is keyed so");
  // A new key mounts a new table (React: an element child is kept only under the same key), which starts from the first state of its view.
  const Table = await component<{ view: served.DojoLiveView; get: live.DojoLiveGet; sha256: live.Sha256 }>("components/dojo/dojo-table.mjs", "DojoTable");
  const shell = (view: served.DojoLiveView): string => renderToStaticMarkup(createElement(Table, { view, get: () => assert.fail("no GET"),
    sha256: () => assert.fail("no hash") }));
  assert.deepEqual([textOf(shell(at(c9))), shell(at(ea))], [T.table, ""], "a counted head: the sentence of a table to come; an abstained one: nothing");
});

// killer: apps/site/app/dojo/page.tsx:56 CONST "!isAbsolute(local)" -> "false"
// killer: apps/site/app/dojo/page.tsx:27 CONST "style={{ paddingTop: 32 }}" -> "data-root={recordRootOf()} style={{ paddingTop: 32 }}"
// killer: apps/site/components/dojo/dojo-live.tsx:23 CONST "${DOJO_LIVE_PREFIX}${rel}" -> "${process.env.MONARK_DOJO_LOCAL_BUILD_ROOT}${rel}"
// killer: .github/workflows/ci.yml:204 CONST "run: npm run build" -> "run: MONARK_DOJO_LOCAL_BUILD_ROOT=/tmp npm run build"
// killer: apps/site/app/dojo/page.tsx:54 CONST "process.env.MONARK_DOJO_LOCAL_BUILD_ROOT" -> "undefined"
test("dojo_page_reads_a_local_root_on_the_server_at_build_only", async () => {
  // The record of a local build on a fixture (the measures of the page in a browser): MONARK_DOJO_LOCAL_BUILD_ROOT, absent by default,
  // and then the committed record is read as before; set, the absolute directory it names; relative or empty, the build reds.
  const NAME = "MONARK_DOJO_LOCAL_BUILD_ROOT", { recs } = await records(), here = rootWith(recs.E1), there = rootWith(recs.E2);
  const saved = process.env[NAME], seen: string[] = [];
  const pageWith = async (value: string | undefined): Promise<string> => {
    if (value === undefined) delete process.env[NAME];
    else process.env[NAME] = value;
    try { return await pageAt(here); } catch (e) { return `throws: ${e instanceof Error ? e.message : String(e)}`; }
  };
  try {
    for (const value of [undefined, there, join("relative", "root"), ""]) seen.push(await pageWith(value));
  } finally {
    if (saved === undefined) delete process.env[NAME];
    else process.env[NAME] = saved;
  }
  const [absent = "", local = "", relative = "", empty = ""] = seen, atHere = await expectedAt(here), atThere = await expectedAt(there);
  assert.deepEqual([atHere.state, atThere.state], ["E1", "E2"], "two records of two states");
  assert.doesNotThrow(() => assertDojoBody({ html: absent, expected: atHere }), "absent: the record under the working directory's repository root");
  assert.doesNotThrow(() => assertDojoBody({ html: local, expected: atThere }), "set: the record under the directory it names");
  assert.throws(() => assertDojoBody({ html: local, expected: atHere }), /is absent/, "set: never the record under the working directory");
  assert.deepEqual([relative, empty].map((p) => p.startsWith("throws: ") && p.includes(`${NAME} must name an absolute directory`)), [true, true],
    "a relative or an empty value: the build reds");
  // Read on the server when the build renders the page, and only there: a server page (no "use client"), static (no request-time API,
  // no dynamic or revalidate export), that reads the name once, without the prefix Next inlines in client bundles (NEXT_PUBLIC_), and
  // whose value goes to the loader alone, never into the markup or the props of a component.
  const page = readFileSync(join(SITE, "app", "dojo", "page.tsx"), "utf8"), count = (s: string): number => page.split(s).length - 1;
  assert.deepEqual([page.startsWith('"use client"'), count(`process.env.${NAME}`), NAME.startsWith("NEXT_PUBLIC_")], [false, 1, false],
    "a server page that reads the name once");
  assert.deepEqual([count("recordRootOf()"), count("loadDojoServed(recordRootOf())")], [2, 1], "declared once, called once: the loader's argument");
  assert.deepEqual(["export const dynamic", "export const revalidate", "cookies(", "headers(", "connection(", "searchParams"].filter((s) => count(s) > 0), [],
    "a static page: rendered by the build alone");
  // Among the tracked files out of test/ and docs/ (no Markdown), the name is in that page alone: no client component, no next.config.mjs,
  // no package.json script, no workflow, no deploy file, no script sets or reads it. The list is this checkout's: git runs without the
  // caller's GIT_* variables (a hook sets GIT_DIR or GIT_INDEX_FILE), as the fixture of test/byte-guard.test.ts runs it.
  const [{ execFileSync }, { existsSync }] = await Promise.all([import("node:child_process"), import("node:fs")]);
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_")));
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, env, maxBuffer: 1 << 26 }).toString("utf8").split(String.fromCharCode(0));
  const naming = tracked.filter((f) => f !== "" && !/^(test|docs)[/]/.test(f) && !f.endsWith(".md") && existsSync(join(ROOT, f))
    && readFileSync(join(ROOT, f), "latin1").includes(NAME));
  assert.deepEqual(naming, ["apps/site/app/dojo/page.tsx"], "the name in the server page alone");
});
