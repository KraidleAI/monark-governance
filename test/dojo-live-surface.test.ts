// Root tests of PR-4c-1b (ADR-DOJO-PR-4: G0 fold of PR-4c-1, cp-1 fold C-V-1, G7 fold of PR-4c-1a): the surface of the head of the day
// reread in the browser. The view of apps/site/lib/dojo-served.ts (dojoLiveViewOf: Ed25519 by a known answer, the reread of
// lib/dojo-live.ts, the loader's rules of a head, the same sentences), the one path of a figure (sentenceParts), the component's wiring
// read from its source (no root program loads a .tsx), the site's proxy snippet (deploy/Caddyfile.monark-dojo-site.snippet) and the
// development rewrite (apps/site/next.config.mjs). Oracles, never the view under test: buildDojoServed and the page's loader on the
// same served tree, the sentences dojoExpected composes apart (scripts/assert-fleet-html.mjs), the timeline walker, node's Ed25519.
// Trees are signed at run time by the Dojo fixture (keys made by node:crypto, never written); no network. The exports this lot adds to
// lib/dojo-served.ts are read through the module namespace and asserted first, and a file the lot adds is asserted present before it is
// read, so that at the base each test reds by an assertion (red-proof), never by an import.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, webcrypto } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import * as live from "../apps/site/lib/dojo-live.ts";
import * as served from "../apps/site/lib/dojo-served.ts";
import { buildDojoServed, loadDojoServed, DOJO_HOST, DOJO_PUBKEY_PATH, DOJO_SERVED_REL, DOJO_TIMELINE_PATH, type DojoChainDeps, type DojoServedData,
  type DojoServedHead } from "../apps/site/lib/dojo-served-load.ts";
import * as copy from "../apps/site/lib/dojo-copy.ts";
import { dojoExpected } from "../scripts/assert-fleet-html.mjs";
import { FIRST, at, dojoFixture, dojoKeyringOf, dojoSpreadFixture, newKey, render, type Step } from "../apps/dojo/test/helpers/dojo-fixture.ts";
import { walkDojoTimeline } from "../apps/dojo/scripts/dojo-chain.mjs";
import { dojoTrustOf, verifyDojoServed } from "../apps/dojo/scripts/dojo-verify.mjs";
import { rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import { canonical, keyIdOf, lineHash, type Trust } from "../apps/bell/scripts/bell-chain.mjs";

type Tree = Map<string, Buffer>;
type Rec = Record<string, unknown>;
const ROOT = join(import.meta.dirname, ".."), NL = String.fromCharCode(10), T = copy.DOJO_TEXT;
const DEPS: DojoChainDeps<Trust> = { trustOf: dojoTrustOf, walk: walkDojoTimeline, lineHash, rootOf, verify: verifyDojoServed };
const sha256: live.Sha256 = (b) => Promise.resolve(new Uint8Array(createHash("sha256").update(b).digest()));
const ed25519: live.VerifyEd25519 = async (x, m, s) =>
  webcrypto.subtle.verify("Ed25519", await webcrypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x }, "Ed25519", false, ["verify"]), s, m);
/** The transport over a served tree: 200 and its bytes, 404 when absent. */
const hostOf = (tree: Tree): live.DojoLiveGet => (rel) => Promise.resolve(tree.has(rel) ? new Response(tree.get(rel)) : new Response(null, { status: 404 }));
const timelineOf = (tree: Tree): Rec[] => String(tree.get(DOJO_TIMELINE_PATH) ?? "").trimEnd().split(NL).map((s) => JSON.parse(s) as Rec);
/** An export this lot adds to lib/dojo-served.ts, asserted first: at the base the test reds here, by an assertion. */
function added<K extends keyof typeof served>(k: K): (typeof served)[K] {
  assert.ok(k in served, `lib/dojo-served.ts exports ${k}`);
  return served[k];
}
/** The record the sync writes for a served tree under a committed keyring (the build refuses what the reader's tool refuses). */
const recordOf = (tree: Tree, keyring: Rec): Promise<Rec> =>
  buildDojoServed({ readAt: "2026-10-11T06:00:00.000Z", tree, committedKeyring: Buffer.from(canonical(keyring) + NL) }, DEPS);
/** f(dir) over a temporary repository root holding `record` and its manifest entry, then removed. */
async function atRoot<R>(record: Rec, f: (dir: string) => R | Promise<R>): Promise<R> {
  const text = JSON.stringify(record, null, 2) + NL, dir = mkdtempSync(join(tmpdir(), "dojo-surface-"));
  try {
    mkdirSync(join(dir, "apps", "site", "data"), { recursive: true });
    writeFileSync(join(dir, ...DOJO_SERVED_REL.split("/")), text);
    const files = { [DOJO_SERVED_REL]: createHash("sha256").update(text).digest("hex") };
    writeFileSync(join(dir, "apps", "site", "data", "manifest.sha256.json"), JSON.stringify({ algorithm: "sha256", files }));
    return await f(dir);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
/** The record as the page loads it (the loader's checks included). */
const loaded = (record: Rec): Promise<DojoServedData> => atRoot(record, (dir) => loadDojoServed(dir) ?? assert.fail("no record"));
/** The loader's refusal of `record` carrying `head` in place of its own (its words, without their prefix), or null when it loads. */
const loaderRefusal = (record: Rec, head: DojoServedHead): Promise<string | null> => atRoot({ ...record, head }, (dir) => {
  try { loadDojoServed(dir); return null; } catch (e) { return (e instanceof Error ? e.message : String(e)).replace("dojo served: ", ""); }
});
/** The view's deps as the component wires them, over a served tree and an Ed25519 check; `calls` counts the rereads (each GETs). */
function wired(c: DojoServedData, tree: Tree, verifyEd25519: live.VerifyEd25519 = ed25519, text: served.DojoText = T) {
  const calls = { reread: 0 };
  const reread = (): Promise<live.DojoLiveOutcome> => {
    calls.reread += 1;
    return live.rereadDojoHead(c, { sha256, verifyEd25519, get: hostOf(tree) });
  };
  return { deps: { verifyEd25519, signingBytes: live.signingBytes, signatureOf: live.signatureOf, reread, text }, calls };
}
/** One sentence as components/dojo/dojo-figures.tsx renders it: its fixed parts and its figures, in order. */
const said = (text: string, figures: served.DojoShownFigures): string =>
  served.sentenceParts(text, figures).map((p) => (typeof p === "string" ? p : p.value)).join("");
/** Every sentence a view shows, in the component's order: the head's sentence, the view's own sentence, then the others. */
function shown(v: served.DojoLiveView): string[] {
  const [head, ...rest] = served.dojoBodyOf(v.figures);
  return [said(T[head ?? assert.fail("no sentence")], v.figures), v.note, ...rest.map((k) => said(T[k], v.figures))];
}
/** The committed record at E1 (seq 9: new lines 10 to 12), its record and the fixture's full served tree. */
async function e1(): Promise<{ f: ReturnType<typeof dojoFixture>; k: Rec; r1: Rec; c: DojoServedData; e2: Tree }> {
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]), r1 = await recordOf(render(f.steps.slice(0, 9)), k);
  return { f, k, r1, c: await loaded(r1), e2: render(f.steps) };
}

// killer: apps/site/lib/dojo-served.ts:143 CONST "head: o.head" -> "head: committed.head"
test("dojo_live_renders_through_the_same_figures", async () => {
  const viewOf = added("dojoLiveViewOf"), firstOf = added("dojoFirstViewOf"), bodyOf = added("dojoBodyOf");
  const { k, r1, c, e2 } = await e1(), r2 = await recordOf(e2, k), after = await loaded(r2);
  const fixed = [copy.DOJO_TITLE, T.lead, T.method, T.exclusion, T.bounds, T.check, T.tree, T.beacon, T.rereadFirst, T.table];
  /** The sentences the build check composes apart for a record (dojoExpected), those that carry figures. */
  const built = async (r: Rec): Promise<string[]> => {
    const e = await atRoot(r, (dir) => dojoExpected(dir));
    assert.ok(e.state !== "E0" && e.sentences.includes(T.rereadFirst), "every built page carries the reread's first sentence (TXT-14r)");
    assert.ok(e.sentences.includes(T.table), "and, its head counted, the first sentence of the table of every line (TXT-17)");
    return e.sentences.filter((s) => !fixed.includes(s)).sort();
  };
  const first = firstOf(c, T), v = await viewOf(c, wired(c, e2).deps);
  assert.deepEqual([first.note, v.note], [T.rereadFirst, T.rereadDone], "the first paint says TXT-14r; a reread where every check holds, TXT-14a");
  assert.deepStrictEqual(first.figures, served.dojoPageFiguresOf(c), "the first paint: the committed figures");
  assert.deepStrictEqual(v.figures, served.dojoPageFiguresOf(after), "the reread head's figures: those of the build of the same served tree");
  assert.deepEqual(shown(first).filter((s) => s !== first.note).sort(), await built(r1), "the first paint renders the build's sentences");
  assert.deepEqual(shown(v).filter((s) => s !== v.note).sort(), await built(r2), "the reread renders the build's sentences of its record");
  // One order, the page's: the head's sentence, the view's own sentence, the totals (never on an abstained day), the holders (E2), the
  // unit or the absence of a version, the tier (E2).
  assert.equal(shown(v)[1], T.rereadDone, "the view's sentence right after the head's sentence: the age of the figures is never hidden");
  const day = { day: "d" }, counted = { ...day, reads_done: "r", k_reads: "k", slot_min: "a", slot_max: "b", lines_count: "n", root: "h", score_total: "s",
    validated_total: "v" }, unit = { threshold_unit_token_days: "u", dust_threshold_tokens: "t" };
  const orders: Array<[served.DojoShownFigures, served.DojoBodyKey[]]> = [[{ state: "E1", ...counted }, ["counted", "totals", "noVersion"]],
    [{ state: "E2", ...counted, ...unit, holders_count: "1" }, ["counted", "totals", "holder", "tiers", "tier"]],
    [{ state: "E2", ...counted, ...unit, holders_count: "2" }, ["counted", "totals", "holders", "tiers", "tier"]],
    [{ state: "EA", ...day }, ["abstained", "noVersion"]], [{ state: "EA", ...day, threshold_unit_token_days: "u" }, ["abstained", "tiers"]]];
  for (const [figures, keys] of orders) assert.deepEqual(bodyOf(figures), keys, `order of ${figures.state}`);
  // The day shown is the day of the head whose figures are shown, and no other (M-L12).
  const fb = await viewOf(c, wired(c, new Map(e2).set(DOJO_TIMELINE_PATH, Buffer.alloc(0))).deps);
  const text = (x: served.DojoLiveView): string => shown(x).join(" ");
  assert.deepEqual([text(v).includes(after.head.day), text(v).includes(c.head.day)], [true, false], "a reread: its own day only");
  assert.deepEqual([fb.note, text(fb).includes(c.head.day), text(fb).includes(after.head.day)], [T.rereadFallback, true, false],
    "a fallback: the committed day only");
});

// killer: apps/site/lib/dojo-served.ts:124 CONST "!(await deps.verifyEd25519(key.public_key.x, bent, sig))" -> "true"
test("dojo_live_needs_ed25519_to_show_a_reread", async () => {
  const viewOf = added("dojoLiveViewOf"), usable = added("dojoEd25519Usable");
  const { c, e2 } = await e1(), committed = served.dojoPageFiguresOf(c), control = wired(c, e2);
  assert.equal(await usable(c, control.deps), true, "node's Ed25519 answers the committed anchor's known answer");
  assert.deepEqual([(await viewOf(c, control.deps)).note, control.calls.reread], [T.rereadDone, 1], "control: one reread, TXT-14a");
  // A browser without Ed25519 (the import rejects), one that says yes to anything (the byte changed passes), one that says no to anything
  // (the anchor's own signature fails): no reread at all (no GET), the committed figures and TXT-14b-r (M-L7, M-L13, M-L21).
  const doubles: Array<[string, live.VerifyEd25519]> = [["no Ed25519", () => Promise.reject(new Error("NotSupportedError: Ed25519"))],
    ["an Ed25519 that says yes to anything", () => Promise.resolve(true)], ["an Ed25519 that says no to anything", () => Promise.resolve(false)]];
  for (const [name, verify] of doubles) {
    const w = wired(c, e2, verify), v = await viewOf(c, w.deps);
    assert.equal(await usable(c, w.deps), false, `${name}: not usable`);
    assert.deepEqual([v.note, w.calls.reread], [T.rereadNoCheck, 0], `${name}: TXT-14b-r, and no reread`);
    assert.deepStrictEqual(v.figures, committed, `${name}: the committed figures`);
  }
  // The known answer is the committed anchor under ITS committed key: under another committed key it does not hold.
  const own = c.keyring.keys[0] ?? assert.fail("a key"), other = c.keyring.keys[1] ?? assert.fail("a key");
  const swapped = { ...c, keyring: { ...c.keyring, keys: [{ ...own, public_key: other.public_key }, other] } };
  assert.equal(await usable(swapped, control.deps), false, "the anchor's signature under another key");
});

// killer: deploy/Caddyfile.monark-dojo-site.snippet:20 SDL "header_down Cache-Control" -> ""
test("dojo_site_proxy_snippet_is_outside_the_page_route", async () => {
  const prefix = added("DOJO_LIVE_PREFIX"), rel = join(ROOT, "deploy", "Caddyfile.monark-dojo-site.snippet");
  assert.ok(existsSync(rel), "the site's proxy snippet exists");
  const code = readFileSync(rel, "utf8").split(NL).map((l) => l.trim()).filter((l) => l !== "" && !l.startsWith("#"));
  assert.deepEqual(code, [`handle_path ${prefix}* {`, "@read {", "method GET", `path /${DOJO_TIMELINE_PATH} /lines/* /${DOJO_PUBKEY_PATH}`, "}",
    "handle @read {", `reverse_proxy ${DOJO_HOST} {`, "header_up Host {upstream_hostport}", 'header_down Cache-Control "no-store"', "}", "}",
    "handle {", "respond 404", "}", "}"],
  "one block: GET of the three closed paths relayed to the Dojo host, Host set to it, no-store on every answer (M-L15), 404 for anything else");
  // Caddy path matchers, as the Narabi snippet's test reads them: "/x/*" matches every path under /x/, never /x itself (M-L9).
  const relayed = (route: string): boolean => route.startsWith(prefix);
  assert.deepEqual(["/dojo", "/dojo/", "/dojo/pubkey.json", "/dojo-served"].map(relayed), [false, false, false, false], "the page and /dojo/* stay with Next");
  assert.ok(relayed(`${prefix}${DOJO_TIMELINE_PATH}`) && !prefix.startsWith("/dojo/"), "the relayed files sit outside /dojo/*");
  // The development twin, read from the config itself: the same prefix to the Dojo host under `next dev` only (M-L20).
  const url = pathToFileURL(join(ROOT, "apps", "site", "next.config.mjs")).href;
  const cfg = (await import(url)) as { default: { rewrites: () => Promise<Array<{ source: string; destination: string }>> } };
  const env = process.env.NODE_ENV, rules = async (mode: string): Promise<unknown[]> => {
    process.env.NODE_ENV = mode;
    return (await cfg.default.rewrites()).filter((r) => r.source.startsWith(prefix));
  };
  try {
    for (const mode of ["production", "test"]) assert.deepEqual(await rules(mode), [], `no rewrite of ${prefix} under NODE_ENV=${mode}`);
    assert.deepEqual(await rules("development"), [{ source: `${prefix}:path*`, destination: `${DOJO_HOST}/:path*` }], "under next dev: the Dojo host");
  } finally {
    if (env === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = env;
  }
});

// killer: apps/site/lib/dojo-served.ts:68 SDL "if (value === undefined) return fail(" -> ""
test("dojo_sentence_refuses_a_figure_the_state_lacks", async () => {
  const parts = added("sentenceParts"), viewOf = added("dojoLiveViewOf");
  const e1f: served.DojoShownFigures = { state: "E1", day: "d", reads_done: "r", k_reads: "k", slot_min: "a", slot_max: "b", lines_count: "n", root: "h",
    score_total: "s", validated_total: "v" };
  const totals = ["Total hold score: ", { name: "score_total", value: "s" }, " · validated: ", { name: "validated_total", value: "v" }, ""];
  assert.deepEqual(parts(T.totals, e1f), totals, "the fixed parts and the figures, in order, read by name");
  const lacking: Array<[string, served.DojoShownFigures, string]> = [[T.totals, { state: "EA", day: "d" }, "score_total"],
    [T.tiers, e1f, "threshold_unit_token_days"], ["{state}", e1f, "state"]];
  for (const [text, figures, name] of lacking) {
    assert.throws(() => parts(text, figures), new RegExp(`the sentence names ${name}, a figure this state does not carry`), `${name} (C-17)`);
  }
  // DojoSentence renders through it, the one path of a figure (components/dojo/dojo-figures.tsx), with no path of its own.
  const fig = readFileSync(join(ROOT, "apps", "site", "components", "dojo", "dojo-figures.tsx"), "utf8");
  assert.equal(fig.split("{sentenceParts(text, figures).map((part, i) =>").length - 1, 1, "DojoSentence maps sentenceParts(text, figures)");
  assert.deepEqual([fig.includes("values.get"), fig.includes(".split(")], [false, false], "and splits nothing itself");
  // The reread never switches to figures a sentence cannot carry: a closed list whose unit sentence names a figure no state carries
  // keeps the committed figures, TXT-14c.
  const { c, e2 } = await e1(), text = { ...T, tiers: `${T.tiers} {nothing}` };
  const v = await viewOf(c, wired(c, e2, ed25519, text).deps);
  assert.deepStrictEqual([v.note, v.figures], [text.rereadFallback, served.dojoPageFiguresOf(c)], "a sentence left unfilled: the committed figures");
});

// killer: apps/site/lib/dojo-served.ts:141 CONST "keep(T.rereadFallback)" -> "keep(o.why)"
test("dojo_live_never_renders_why", async () => {
  const viewOf = added("dojoLiveViewOf");
  const { f, c, e2 } = await e1(), committed = served.dojoPageFiguresOf(c), tl = e2.get(DOJO_TIMELINE_PATH) ?? Buffer.alloc(0);
  const head = timelineOf(e2).pop() ?? assert.fail("a head"), lf = `lines/${String(head.lines_sha256)}.jsonl`, noLines = new Map(e2);
  noLines.delete(lf);
  // Refusals of several kinds, each with the reason the module gives: the view shows TXT-14c and the committed figures, never the reason.
  const trees: Array<[string, Tree]> = [["a timeline that ends before the committed head", render(f.steps.slice(0, 8))],
    ["a served line that is not JSON (named by its seq; the served text is never quoted)",
      new Map(e2).set(DOJO_TIMELINE_PATH, Buffer.concat([tl, Buffer.from(`xxxxxxxxxxxxxxxx${NL}`)]))],
    ["a timeline behind a BOM", new Map(e2).set(DOJO_TIMELINE_PATH, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), tl]))], ["no lines file", noLines]];
  for (const [name, tree] of trees) {
    const o = await live.rereadDojoHead(c, { sha256, verifyEd25519: ed25519, get: hostOf(tree) }), v = await viewOf(c, wired(c, tree).deps);
    const why = o.kind === "fallback" ? o.why : assert.fail(`${name}: a fallback`);
    assert.deepStrictEqual([v.note, v.figures], [T.rereadFallback, committed], `${name}: TXT-14c, the committed figures`);
    assert.ok(why.length > 0 && !JSON.stringify(v).includes(why), `${name}: the reason (${why}) is not in the view`);
  }
  // A reason written to be seen, and a reread that throws: the same.
  const outcomes = [(): Promise<live.DojoLiveOutcome> => Promise.resolve({ kind: "fallback", seq: 3, why: "WHY-SHOWN-IF-RENDERED" }),
    (): Promise<live.DojoLiveOutcome> => Promise.reject(new Error("WHY-THROWN"))];
  for (const reread of outcomes) {
    const v = await viewOf(c, { ...wired(c, e2).deps, reread });
    assert.deepEqual([v.note, JSON.stringify(v).includes("WHY-")], [T.rereadFallback, false], "TXT-14c, and never the reason");
  }
  // No reason is ever read on the way to the page: the component names none, the view reads none.
  const comp = join(ROOT, "apps", "site", "components", "dojo", "dojo-live.tsx");
  assert.ok(existsSync(comp), "the reread component exists");
  assert.deepEqual([readFileSync(comp, "utf8").includes("why"), readFileSync(join(ROOT, "apps", "site", "lib", "dojo-served.ts"), "utf8").includes(".why")],
    [false, false], "no `why` in the component, no `.why` in the view");
});

// killer: apps/site/components/dojo/dojo-live.tsx:30 CONST "{ sha256, verifyEd25519, get }" -> "{ sha256, verifyEd25519, get, bounds: undefined }"
// killer: apps/site/components/dojo/dojo-live.tsx:38 CONST "dojoBodyOf(view.figures);" -> "dojoBodyOf(view.figures).reverse();"
test("dojo_live_calls_the_reread_without_bounds", () => {
  const init = added("DOJO_LIVE_FETCH_INIT"), rel = join(ROOT, "apps", "site", "components", "dojo", "dojo-live.tsx");
  assert.deepStrictEqual(init, { cache: "no-store", redirect: "error", credentials: "omit" }, "never a cached, redirected or credentialed GET (M-L14)");
  assert.ok(Object.isFrozen(init), "frozen");
  assert.ok(existsSync(rel), "the reread component exists");
  const src = readFileSync(rel, "utf8"), count = (s: string): number => src.split(s).length - 1;
  assert.ok(src.startsWith(`"use client";`), "a client component: it runs in the reader's browser");
  // The reread under the module's own bounds, those of the reader's tool (G7 fold of PR-4c-1a): the call passes SHA-256, the Ed25519
  // check and the GET, never a bound (an injected one would replace the frozen ones).
  const call = "rereadDojoHead(committed, { sha256, verifyEd25519, get })";
  assert.deepEqual([count("rereadDojoHead("), count(call), count("bounds")], [1, 1, 0], "one call of the reread, no bounds anywhere");
  const getter = "fetch(`${DOJO_LIVE_PREFIX}${rel}`, { ...DOJO_LIVE_FETCH_INIT, signal })";
  assert.deepEqual([count("fetch("), count(getter)], [1, 1], "one GET: the same-origin prefix, the frozen init");
  const webCrypto = ['crypto.subtle.digest("SHA-256"', 'crypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x }',
    'crypto.subtle.verify({ name: "Ed25519" }'];
  for (const s of webCrypto) {
    assert.equal(count(s), 1, `Web Crypto: ${s}`);
  }
  // First paint: the committed figures and TXT-14r; once mounted, the view of the reread; every figure through DojoSentence (M-L11).
  assert.equal(count("useState<DojoLiveView>(() => dojoFirstViewOf(committed, T))"), 1, "the first paint");
  assert.equal(count("void dojoLiveViewOf(committed, { verifyEd25519, signingBytes, signatureOf, reread, text: T })"), 1, "the reread, once mounted");
  assert.deepEqual([count("useEffect("), count("<DojoSentence "), count("{view.note}"), count("view.figures."), count("dangerouslySetInnerHTML")],
    [1, 2, 1, 0, 0], "the figures only through DojoSentence, the view's sentence as text");
  const body = ["const [head, ...rest] = dojoBodyOf(view.figures);", "<DojoSentence text={T[head]} figures={view.figures} />", "<p>{view.note}</p>",
    "{rest.map((k) => (", "<DojoSentence text={T[k]} figures={view.figures} />"];
  assert.ok(body.every((s, i) => count(s) === 1 && (i === 0 || src.indexOf(body[i - 1] ?? "") < src.indexOf(s))),
    "the head's sentence (its day), the view's own right after it (QF-3), then the others: each once, in this order (C-G2-1)");
  assert.equal(count('import type { DojoServedData } from "@/lib/dojo-served-load";'), 1, "the loader, which reads files, as a type only");
  const page = readFileSync(join(ROOT, "apps", "site", "app", "dojo", "page.tsx"), "utf8"), inPage = (s: string): number => page.split(s).length - 1;
  assert.deepEqual([inPage("<DojoLive committed={data} />"), inPage("DojoSentence"), inPage("T.reread")], [1, 0, 0],
    "the page renders its figures section through the reread component, and no sentence of the reread of its own (M-L11)");
});

// killer: apps/site/lib/dojo-served.ts:91 CONST "h.slot_min > h.slot_max" -> "false"
test("dojo_live_refuses_a_head_the_loader_refuses", async () => {
  const refusal = added("dojoHeadRefusal"), viewOf = added("dojoLiveViewOf");
  const { f, k, r1, c } = await e1();
  /** The served tree with the readings of the new head (seq 12, step 11) edited before the key holder signs it. */
  const readings = (edit: (rs: Rec[]) => Rec[]): Tree => render(f.steps, new Map(), (s: Step[]) => {
    const b = s[11]?.body ?? assert.fail("the new head");
    b.reads = edit(b.reads as Rec[]);
  });
  const missed = (r: Rec): Rec => ({ ...r, read_at: null, slot_min: null, slot_max: null, accounts_concordant: 0, accounts_no_quorum: 4, pool_price: null,
    usd_per_sol: null, usd_per_sol_publish_time: null });
  // The two heads the G2 of PR-4c-1a measured (probe vi): the module rereads them, the loader refuses them; the view never renders them.
  const heads: Array<[string, Tree, string]> = [
    ["five readings made under K = 4", readings((rs) => [...rs.slice(0, 3), ...rs.slice(0, 2)]),
      "head: reads_done is at least 1 when counted, at most k_reads"],
    ["one reading made, its slots inverted", readings((rs) => rs.map((r, i) => (i === 0 ? { ...r, slot_min: r.slot_max, slot_max: r.slot_min } : missed(r)))),
      "head: slot_min exceeds slot_max"]];
  for (const [name, tree, rule] of heads) {
    const o = await live.rereadDojoHead(c, { sha256, verifyEd25519: ed25519, get: hostOf(tree) });
    const h = o.kind === "reread" ? o.head : assert.fail(`${name}: the module rereads it (as measured by the G2): ${JSON.stringify(o)}`);
    assert.deepEqual([refusal(h), await loaderRefusal(r1, h)], [rule, rule], `${name}: the loader's rule, in the loader's words`);
    const v = await viewOf(c, wired(c, tree).deps);
    assert.deepStrictEqual([v.note, v.figures], [T.rereadFallback, served.dojoPageFiguresOf(c)], `${name}: the committed figures, TXT-14c`);
  }
  // Rule by rule, in the loader's order (lib/dojo-served-load.ts, the rules of a head): no refusal where it loads, each of its five
  // refusals in its own words where it refuses.
  const r2 = await recordOf(render(f.steps), k), h1 = c.head, h2 = (await loaded(r2)).head, max = h1.slot_max ?? assert.fail("slots");
  const cases: Array<[Rec, DojoServedHead]> = [[r1, h1], [r1, { ...h1, holders_count: 0 }], [r1, { ...h1, slot_max: null }], [r1, { ...h1, reads_done: 0 }],
    [r1, { ...h1, slot_min: max + 1 }], [r1, { ...h1, reads_done: h1.k_reads + 1 }], [r1, { ...h1, validated_total: `${h1.score_total}1` }],
    // Each of the four comparisons at its bound: a head that loads, at the loader and here (C-G2-2).
    [r1, { ...h1, slot_min: max }], [r1, { ...h1, reads_done: h1.k_reads }], [r1, { ...h1, validated_total: h1.score_total }],
    [r2, { ...h2, holders_count: h2.lines_count }],
    [r1, { ...h1, status: "abstained" }], [r2, h2], [r2, { ...h2, holders_count: h2.lines_count + 1 }], [r2, { ...h2, dust_threshold: null }]];
  const met = new Set<string | null>();
  for (const [record, h] of cases) {
    const want = await loaderRefusal(record, h);
    assert.equal(refusal(h), want, `the loader's verdict on ${JSON.stringify(h).slice(0, 120)}`);
    met.add(want);
  }
  // Every rule of a head that the loader's source carries is restated here and met above (a rule added to the loader alone reds).
  const loader = readFileSync(join(ROOT, "apps", "site", "lib", "dojo-served-load.ts"), "utf8");
  // Under any of the three delimiters of a string: a rule written with single quotes or backticks is read too (C-G2-2).
  const rules = [...loader.matchAll(/fail[(](?:"(head: [^"]+)"|'(head: [^']+)'|`(head: [^`]+)`)[)]/g)].map((m) => m[1] ?? m[2] ?? m[3] ?? "");
  assert.deepEqual([...met].sort(), [...rules, null].sort(), "the loader's five rules of a head, each in its words, and a head that loads");
});

// killer: apps/site/lib/dojo-served.ts:140 CONST "keep(T.rereadKeyChange)" -> "keep(T.rereadFallback)"
test("dojo_live_says_a_key_change", async () => {
  const viewOf = added("dojoLiveViewOf");
  // A continuous rotation among the new lines (the spread fixture, committed at seq 12): the committed figures, TXT-14d.
  const s = dojoSpreadFixture(), ks = dojoKeyringOf([[s.key, 1, 13], [s.next, 13]]), cs = await loaded(await recordOf(render(s.steps.slice(0, 12)), ks));
  const rotated = await viewOf(cs, wired(cs, render(s.steps)).deps);
  assert.deepStrictEqual([rotated.note, rotated.figures], [T.rereadKeyChange, served.dojoPageFiguresOf(cs)], "a rotation: TXT-14d, the committed figures");
  // Declared (G7 fold of PR-4c-1a, Q-G2-1): a key line signed by a committed key is said as a key change even where the walker refuses
  // it, the committed figures shown either way: here a revocation signed by a committed key that is not the active one.
  const f = dojoFixture(), other = newKey(), k = dojoKeyringOf([[f.key, 1], [other, 1]]), c = await loaded(await recordOf(render(f.steps), k));
  const body = { kind: "key_revocation", published_at: at(FIRST + 9, 3), revoked_key_id: keyIdOf(f.key), revoked_from_seq: 1 };
  const revocation: Step = { key: other, body };
  const tree = render([...f.steps, revocation]), w = walkDojoTimeline(timelineOf(tree), dojoTrustOf(k)?.trust ?? assert.fail("a keyring"));
  assert.deepEqual([w.ok, w.ok ? null : w.reason], [false, "key_not_active"], "the walker refuses that line");
  const v = await viewOf(c, wired(c, tree).deps);
  assert.deepStrictEqual([v.note, v.figures], [T.rereadKeyChange, served.dojoPageFiguresOf(c)], "TXT-14d, the committed figures");
});
