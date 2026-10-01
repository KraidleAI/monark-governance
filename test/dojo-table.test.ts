// Root tests of PR-4c-2a (ADR-DOJO-PR-4: G0 fold of PR-4c-2, its cp-1 correction C-V-1; decision 301, the order by hold score): the
// table of every line of the head /dojo shows, and the look-up of one address among them. Under test: dojoTableOf and dojoTableFirstOf
// of apps/site/lib/dojo-served.ts (the reread's lines, or one GET of the committed head's lines file bound by bindDojoLines of
// lib/dojo-live.ts; forms, signed order, cells, order shown), isDojoAddress, findDojoRow and dojoLookupOf of lib/dojo-lookup.ts, and the
// component's wiring read from its source (no root program loads a .tsx). Oracles, never the modules under test: the reader's tool on
// the same served tree (verifyDojoServed with an address and a day: its inclusion), the core's address rule (ownerClass), the served
// bytes. Trees are signed at run time by the Dojo fixture (keys made by node:crypto, never written); no network. Exports this lot adds
// are read through the module namespace and asserted first, and the module it adds is asserted present before it is loaded, so that
// at the base each test reds by an assertion (red-proof), never by an import.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, webcrypto } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as live from "../apps/site/lib/dojo-live.ts";
import * as served from "../apps/site/lib/dojo-served.ts";
import * as copy from "../apps/site/lib/dojo-copy.ts";
import { buildDojoServed, loadDojoServed, DOJO_SERVED_REL, type DojoChainDeps, type DojoServedData, type DojoServedHead }
  from "../apps/site/lib/dojo-served-load.ts";
import { ADDR, MINT, dojoFixture, dojoKeyringOf, dojoSpreadFixture, linesOf, newKey, render, type Step } from "../apps/dojo/test/helpers/dojo-fixture.ts";
import { walkDojoTimeline } from "../apps/dojo/scripts/dojo-chain.mjs";
import { dojoTrustOf, verifyDojoServed } from "../apps/dojo/scripts/dojo-verify.mjs";
import { ownerClass, rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import { canonical, lineHash, type Trust } from "../apps/bell/scripts/bell-chain.mjs";

type Tree = Map<string, Buffer>;
type Rec = Record<string, unknown>;
type Rows = { columns: string[]; bound: served.DojoTableRow[]; shown: served.DojoTableRow[] };
const ROOT = join(import.meta.dirname, ".."), NL = String.fromCharCode(10), T = copy.DOJO_TEXT;
const DEPS: DojoChainDeps<Trust> = { trustOf: dojoTrustOf, walk: walkDojoTimeline, lineHash, rootOf, verify: verifyDojoServed };
const ed25519: live.VerifyEd25519 = async (x, m, s) =>
  webcrypto.subtle.verify("Ed25519", await webcrypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x }, "Ed25519", false, ["verify"]), s, m);
const noEd25519: live.VerifyEd25519 = () => Promise.reject(new Error("NotSupportedError: Ed25519"));
/** An export this lot adds to a module the base has, asserted first: at the base the test reds here, by an assertion. */
function added<M extends object, K extends keyof M>(m: M, k: K): M[K] {
  assert.ok(k in m, `the module exports ${String(k)}`);
  return m[k];
}
/** The module this lot adds, asserted present before it is loaded. */
async function lookupModule(): Promise<typeof import("../apps/site/lib/dojo-lookup.ts")> {
  assert.ok(existsSync(join(ROOT, "apps", "site", "lib", "dojo-lookup.ts")), "lib/dojo-lookup.ts exists");
  return import("../apps/site/lib/dojo-lookup.ts");
}
/** The committed record as the page loads it: built from `tree`, written with its manifest entry under a temporary root, read back. */
async function committedOf(tree: Tree, keyring: Rec): Promise<DojoServedData> {
  const record = await buildDojoServed({ readAt: "2026-10-11T06:00:00.000Z", tree, committedKeyring: Buffer.from(canonical(keyring) + NL) }, DEPS);
  const text = JSON.stringify(record, null, 2) + NL, dir = mkdtempSync(join(tmpdir(), "dojo-table-"));
  try {
    mkdirSync(join(dir, "apps", "site", "data"), { recursive: true });
    writeFileSync(join(dir, ...DOJO_SERVED_REL.split("/")), text);
    const files = { [DOJO_SERVED_REL]: createHash("sha256").update(text).digest("hex") };
    writeFileSync(join(dir, "apps", "site", "data", "manifest.sha256.json"), JSON.stringify({ algorithm: "sha256", files }));
    return loadDojoServed(dir) ?? assert.fail("no record");
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
/** The view and the table as components/dojo/dojo-live.tsx and dojo-table.tsx wire them over a served tree: every GET (`all`), and the
 *  GETs and SHA-256 calls of the table alone, once the view is settled. */
async function run(c: DojoServedData, tree: Tree, verifyEd25519 = ed25519, bounds?: live.DojoLiveBounds) {
  const tableOf = added(served, "dojoTableOf"), bind = added(live, "bindDojoLines"), all: string[] = [], calls = { sha: 0 };
  const sha256: live.Sha256 = (b) => {
    calls.sha += 1;
    return Promise.resolve(new Uint8Array(createHash("sha256").update(b).digest()));
  };
  const get: live.DojoLiveGet = (rel) => {
    all.push(rel);
    return Promise.resolve(tree.has(rel) ? new Response(tree.get(rel)) : new Response(null, { status: 404 }));
  };
  const reread = (): Promise<live.DojoLiveOutcome> => live.rereadDojoHead(c, { sha256, verifyEd25519, get });
  const view = await served.dojoLiveViewOf(c, { verifyEd25519, signingBytes: live.signingBytes, signatureOf: live.signatureOf, reread, text: T });
  const [g, s] = [all.length, calls.sha], words = copy.DOJO_TABLE, tiers = copy.DOJO_TIER_NAMES;
  const deps = { read: live.boundedSource(get, bounds), bind: (b: Uint8Array, h: DojoServedHead) => bind(b, h, sha256), words, tiers };
  const table = await tableOf(view, deps);
  return { view, table, all, gets: all.slice(g), sha: calls.sha - s, deps };
}
const rowsOf = (t: served.DojoTable): Rows => (t.kind === "rows" ? t : assert.fail(`no line listed: ${t.kind}`));
/** The fixture, its committed keyring (a second key committed too) and the committed records at seq 8 (E1), 9 (E1) and 12 (E2). */
async function records() {
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]), e1 = render(f.steps.slice(0, 9)), e2 = render(f.steps);
  const [c8, c9, c12] = await Promise.all([render(f.steps.slice(0, 8)), e1, e2].map((t) => committedOf(t, k)));
  return { f, k, e1, e2, c8: c8 as DojoServedData, c9: c9 as DojoServedData, c12: c12 as DojoServedData };
}

// killer: apps/site/lib/dojo-lookup.ts:20 CONST "n === 32" -> "true"
test("dojo_lookup_address_rule_equals_the_core", async () => {
  const { isDojoAddress } = await lookupModule();
  const core = (s: string): boolean => {
    try { ownerClass(s); return true; } catch { return false; }
  };
  // The corpus of the G0 fold (PK-3): the fixture's holders and program, thirty-two zero bytes, the mint, thirty-one and forty-five
  // characters, the four characters out of the alphabet, an inner space, characters out of ASCII, forty-four that decode to 33 bytes.
  const a = ADDR.A, swap = (c: string): string => `${c}${a.slice(1)}`, e = String.fromCharCode(0xe9), wide = String.fromCharCode(0xff12);
  const corpus = [ADDR.A, ADDR.B, ADDR.D, ADDR.P, "1".repeat(32), MINT, "2".repeat(31), "2".repeat(45), ...["0", "O", "I", "l"].map(swap),
    `${a.slice(0, 16)} ${a.slice(17)}`, `${a.slice(0, -1)}${e}`, `${a.slice(0, -1)}${wide}`, "z".repeat(44), "", " ", a.slice(0, 31), `${a}1`];
  assert.deepEqual(corpus.map((s) => isDojoAddress(s)), corpus.map(core), "the verdict of the reader's tool on each input (M-K16)");
  assert.deepEqual([ADDR.A, ADDR.P, "1".repeat(32), MINT, "z".repeat(44)].map(core), [true, true, true, true, false], "both verdicts met");
  // The text typed is reduced by trim() first: the verdict of the tool on the reduced text.
  for (const s of corpus) assert.equal(isDojoAddress(`  ${s} `), core(s.trim()), `trimmed: ${JSON.stringify(s)}`);
});

// killer: apps/site/lib/dojo-served.ts:193 CONST "shift(s), shift(v)" -> "s, shift(v)"
test("dojo_table_rows_are_the_verifier_lines", async () => {
  const { k, e1, e2, c8, c9, c12 } = await records();
  // Heads shown: reread under a version and without one; committed (no Ed25519 here) under a version, and while the tree went on.
  const cases: Array<[string, DojoServedData, Tree, live.VerifyEd25519]> = [["reread E2", c9, e2, ed25519], ["reread E1", c8, e1, ed25519],
    ["committed E2", c12, e2, noEd25519], ["committed E1, the served tree gone on", c9, e2, noEd25519]];
  for (const [name, c, tree, ed] of cases) {
    const { view, table } = await run(c, tree, ed), h = view.head ?? assert.fail("a settled view"), { bound, shown } = rowsOf(table);
    const W = copy.DOJO_TABLE, tiers: string[] = [W.none, ...copy.DOJO_TIER_NAMES], d = h.decimals;
    const file = (tree.get(`lines/${h.lines_sha256}.jsonl`) ?? assert.fail(name)).toString().split(NL).slice(0, -1);
    const source = { get: (p: string): Promise<Buffer> => Promise.resolve(tree.get(p) ?? assert.fail(p)) };
    assert.equal(bound.length, file.length, `${name}: every line, none more`);
    for (const raw of file) {
      const o = JSON.parse(raw) as Rec, r = await verifyDojoServed({ source, keyring: k, address: String(o.address), day: h.day });
      const inc = (r.ok ? r.inclusion : null) ?? assert.fail(`${name}: the tool refuses (${JSON.stringify(r)})`);
      // The row at the index of the line's inclusion in the bound table (decision 301 (4)), never at a place shown.
      const row = bound[inc.index] ?? assert.fail(`${name}: no row at ${String(inc.index)}`);
      assert.deepEqual([row.line, row.address, row.score, inc.line, inc.count], [raw, o.address, o.score, raw, bound.length], `${name}: ${inc.address}`);
      const back = (s: string | undefined): string => {
        const [w = "", fr = ""] = (s ?? "").split(".");
        assert.equal(fr.length, d, `${name}: shifted by the head's decimals (M-K11)`);
        return `${w}${fr}`.replace(/^0+(?=[0-9])/, "");
      };
      const x = row.cells, klass = x[1] === W.holder ? "holder" : x[1] === W.program ? "program" : `raw ${String(x[1])}`;
      assert.deepEqual([x[0], klass, back(x[2]), back(x[3]), back(x[4])], [o.address, o.class, o.score, o.validated, o.provisional],
        `${name}: each cell gives back its field (D-K5)`);
      const unit = h.price_version === null ? [x.length] : [x.length, x[5], tiers.indexOf(x[6] ?? "")];
      assert.deepEqual(unit, h.price_version === null ? [5] : [7, o.units, o.tier], `${name}: units, and a tier name or none, under a version only`);
    }
    // Shown: the bound rows by hold score, highest first, equal hold scores by address (decision 301 (1), M-K12 reformulated).
    const want = [...bound].sort((p, q) => (BigInt(p.score) === BigInt(q.score) ? Buffer.compare(Buffer.from(p.address), Buffer.from(q.address))
      : BigInt(p.score) > BigInt(q.score) ? -1 : 1));
    assert.deepEqual(shown, want, `${name}: the order shown is the order declared`);
  }
  // Equal hold scores, and a longer one (compared as numbers, never as text), on lines given to the table: ten first, then the nines.
  const r = await run(c9, e2), base = rowsOf(r.table).bound, scores = ["9", "10", "9"];
  assert.equal(base.length, scores.length, "three lines at the head of the fixture");
  const lines = base.map((row, i) => canonical({ ...(JSON.parse(row.line) as Rec), score: scores[i] }));
  const t = rowsOf(await served.dojoTableOf({ ...r.view, rows: lines }, r.deps));
  assert.deepEqual(t.shown.map((x) => x.address), [1, 0, 2].map((i) => base[i]?.address), "ten first, then the two nines by address");
});

// killer: apps/site/lib/dojo-served.ts:183 CONST "view.rows ??" -> "null ??"
test("dojo_table_follows_the_displayed_head", async () => {
  const { f, e2, c9 } = await records(), tl = e2.get("timeline.jsonl") ?? assert.fail("a timeline");
  const s = dojoSpreadFixture(), ks = dojoKeyringOf([[s.key, 1, 13], [s.next, 13]]), cs = await committedOf(render(s.steps.slice(0, 12)), ks);
  const five = render(f.steps, new Map(), (st: Step[]) => {
    const b = st[11]?.body ?? {}, rs = b.reads as Rec[];
    b.reads = [...rs.slice(0, 3), ...rs.slice(0, 2)]; // five readings made under K = 4: the reread projects it, the loader's rules refuse it
  });
  // [case, committed record, served tree, Ed25519, the view's sentence, the reread head shown]
  const cases: Array<[string, DojoServedData, Tree, live.VerifyEd25519, string, boolean]> = [["(A) the reread head", c9, e2, ed25519, T.rereadDone, true],
    ["(B) a fallback", c9, new Map(e2).set("timeline.jsonl", Buffer.concat([tl, Buffer.from(`not json${NL}`)])), ed25519, T.rereadFallback, false],
    ["(B) a key change", cs, render(s.steps), ed25519, T.rereadKeyChange, false], ["(C) no Ed25519", c9, e2, noEd25519, T.rereadNoCheck, false],
    ["a reread head the loader's rules refuse", c9, five, ed25519, T.rereadFallback, false]];
  for (const [name, c, tree, ed, note, reread] of cases) {
    const { view, table, gets, sha, all } = await run(c, tree, ed), { bound } = rowsOf(table), h = view.head ?? assert.fail(name);
    assert.deepEqual([view.note, reread ? h.seq > c.head.seq : h], [note, reread ? true : c.head], `${name}: the head shown`);
    const digest = createHash("sha256").update(bound.map((x) => `${x.line}${NL}`).join("")).digest("hex");
    assert.equal(digest, h.lines_sha256, `${name}: the lines of the head shown, and of no other (M-K9)`);
    const want = reread ? [[], 0] : [[`lines/${h.lines_sha256}.jsonl`], 2 * bound.length];
    assert.deepEqual([gets, sha], want, `${name}: no second GET; else one GET of that head's file, and 2N SHA-256 calls (M-K15, PK-5)`);
    if (ed === noEd25519) assert.deepEqual(all, gets, `${name}: no reread without Ed25519, the table's GET alone`);
  }
  // An abstained head shown: nothing, and no GET. The first paint (the build): the sentence of a table to come, no GET, or nothing.
  const abstain = (st: Step[]): void => { Object.assign(st[11]?.body ?? {}, { status: "abstained", beacon: null, reads: [] }); };
  const ea = await run(c9, render(f.steps, new Map(), abstain));
  assert.deepEqual([ea.view.figures.state, ea.table, ea.gets], ["EA", { kind: "none" }, []], "an abstained head shown: no table");
  const first = added(served, "dojoTableFirstOf"), paint = served.dojoFirstViewOf(c9, T);
  const idle = served.dojoFirstViewOf({ ...c9, head: { ...c9.head, status: "abstained" } }, T);
  const quiet = { ...ea.deps, read: (): Promise<Uint8Array> => assert.fail("a GET at the first paint (M-K15)") };
  assert.deepEqual([first(paint), await served.dojoTableOf(paint, quiet), first(idle), await served.dojoTableOf(idle, quiet)],
    [{ kind: "wait" }, { kind: "wait" }, { kind: "none" }, { kind: "none" }], "the first paint waits, with no GET");
});

// killer: apps/site/lib/dojo-served.ts:195 SDL "address >= r.address" -> ""
test("dojo_table_refuses_a_file_it_cannot_bind", async () => {
  const { f, e2, c9 } = await records(), rel = `lines/${c9.head.lines_sha256}.jsonl`, lf = e2.get(rel) ?? assert.fail("the committed file");
  const text = lf.toString(), without = new Map(e2), bounds = live.DOJO_LIVE_BOUNDS;
  without.delete(rel);
  // The committed head's file, read without Ed25519 (one GET): absent, changed after signing, a line short, behind a BOM, beyond a
  // lowered bound of a body; a committed head whose root its lines do not rebuild. No line, never a part (M-K7, M-K10).
  const committed: Array<[string, DojoServedData, Tree, live.DojoLiveBounds]> = [["absent", c9, without, bounds],
    ["changed", c9, new Map(e2).set(rel, Buffer.from(text.replace('"validated":"', '"validated":"1'))), bounds],
    ["a line short", c9, new Map(e2).set(rel, Buffer.from(text.split(NL).slice(1).join(NL))), bounds],
    ["behind a BOM", c9, new Map(e2).set(rel, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), lf])), bounds],
    ["beyond the bound of a body", c9, e2, { ...bounds, MAX_BODY_BYTES: lf.length - 1 }],
    ["another root", { ...c9, head: { ...c9.head, root: "ab".repeat(32) } }, e2, bounds]];
  for (const [name, c, tree, b] of committed) {
    const r = await run(c, tree, noEd25519, b);
    assert.deepEqual([r.view.note, r.table, r.gets], [T.rereadNoCheck, { kind: "refused" }, [rel]], `${name}: no line listed, one GET`);
  }
  // Lines a signed head names that the reread binds and the table refuses (the key holder's own error): out of the signed order, a
  // class out of the list, an address out of the alphabet, a provisional count that is not a decimal, a tier beyond the list.
  const edit = (fn: (ls: Rec[]) => Rec[]): Tree => render(f.steps, new Map([[11, fn(linesOf(f.steps, 11) as unknown as Rec[])]]));
  const first = (x: (l: Rec) => Rec) => (ls: Rec[]): Rec[] => ls.map((l, i) => (i === 0 ? x(l) : l));
  const signed: Array<[string, Tree]> = [["out of the signed order (M-K13)", edit((ls) => [...ls].reverse())],
    ["a class out of the list", edit(first((l) => ({ ...l, class: "robot" })))],
    ["an address out of the alphabet", edit(first((l) => ({ ...l, address: `0${String(l.address).slice(1)}` })))],
    ["a provisional count that is not a decimal", edit(first((l) => ({ ...l, provisional: "01" })))],
    ["a tier beyond the list", edit(first((l) => ({ ...l, tier: 6 })))]];
  for (const [name, tree] of signed) {
    const r = await run(c9, tree);
    assert.deepEqual([r.view.note, r.table, r.gets], [T.rereadDone, { kind: "refused" }, []], `${name}: the reread holds, no line listed`);
  }
  // The component says a refusal by TXT-17c alone, never its reason, under the limits of the module (no bound of its own).
  const src = readFileSync(join(ROOT, "apps", "site", "components", "dojo", "dojo-table.tsx"), "utf8"), count = (s: string): number => src.split(s).length - 1;
  assert.deepEqual([count("T.tableRefused"), count("why"), count("bounds"), count("boundedSource(get)")], [1, 0, 0, 1], "TXT-17c, never a reason");
});

// killer: apps/site/lib/dojo-served.ts:196 CONST "...(versioned ? [W.units, W.tier] : [])" -> "W.units, W.tier"
test("dojo_table_units_only_with_a_version", async () => {
  const { f, e1, e2, c8, c9 } = await records(), W = copy.DOJO_TABLE, five = [W.address, W.class, W.holdScore, W.validated, W.provisional];
  const cases: Array<[string, DojoServedData, Tree, live.VerifyEd25519, string[]]> = [["E1 reread", c8, e1, ed25519, five],
    ["E1 committed", c9, e2, noEd25519, five], ["E2 reread", c9, e2, ed25519, [...five, W.units, W.tier]]];
  for (const [name, c, tree, ed, columns] of cases) {
    const { columns: got, bound } = rowsOf((await run(c, tree, ed)).table);
    assert.deepEqual([got, bound.every((r) => r.cells.length === columns.length)], [columns, true], `${name}: no unit and no tier without a version (M-K6)`);
    if (columns.length > five.length) {
      const names: string[] = [W.none, ...copy.DOJO_TIER_NAMES];
      const formed = bound.every((r) => /^(0|[1-9][0-9]*)$/.test(r.cells[5] ?? "") && names.includes(r.cells[6] ?? ""));
      assert.ok(formed, `${name}: a unit count, a tier name or none`);
    }
  }
  // A line whose units or tier contradict the version of its head: refused (a unit without a version; none under one).
  const firstOf = (i: number, x: Rec): Rec[] => (linesOf(f.steps, i) as unknown as Rec[]).map((l, j) => (j === 0 ? { ...l, ...x } : l));
  const e1u = render(f.steps.slice(0, 9), new Map([[8, firstOf(8, { units: "1", tier: 1 })]]));
  const e2u = render(f.steps, new Map([[11, firstOf(11, { units: null })]]));
  assert.deepEqual([(await run(c8, e1u)).table, (await run(c9, e2u)).table], [{ kind: "refused" }, { kind: "refused" }], "units against the version");
});

// killer: apps/site/lib/dojo-lookup.ts:41 CONST "row };" -> "row, typed };"
test("dojo_lookup_never_echoes_the_input", async () => {
  const { dojoLookupOf, findDojoRow } = await lookupModule(), { e2, c9 } = await records(), { bound } = rowsOf((await run(c9, e2)).table);
  // Each address of the table, typed with spaces around it: its row, the very row bound, and nothing more (M-K1, M-K13, M-K14).
  for (const [i, row] of bound.entries()) {
    const out = dojoLookupOf(`  ${row.address} `, bound);
    assert.deepEqual([Object.keys(out).sort(), out.kind === "found" && out.row === bound[i], findDojoRow(bound, row.address) === bound[i]],
      [["kind", "row"], true, true], `${row.address}: its row alone`);
  }
  // Absent, or not an address: the kind alone, whatever was typed; a part of an address present, or one character more, is not its line.
  const a = bound[0]?.address ?? assert.fail("a line");
  for (const s of [ADDR.D, "1".repeat(32), MINT]) assert.deepEqual(dojoLookupOf(s, bound), { kind: "absent" }, `${s}: no line for it`);
  for (const s of ["<img src=x onerror=alert(1)>", "javascript:alert(1)", ""]) assert.deepEqual(dojoLookupOf(s, bound), { kind: "invalid" }, s);
  for (const s of [a.slice(0, -1), a.slice(1), `${a}1`]) {
    const out = dojoLookupOf(s, bound);
    assert.deepEqual([Object.keys(out), out.kind === "found"], [["kind"], false], `${s}: an exact search`);
  }
  // The component reads its field once, into the look-up, and never gives it back to the page.
  const src = readFileSync(join(ROOT, "apps", "site", "components", "dojo", "dojo-table.tsx"), "utf8"), count = (s: string): number => src.split(s).length - 1;
  const reads = ["typed.current", "dojoLookupOf(typed.current?.value", "value=", "defaultValue", "dangerouslySetInnerHTML"].map(count);
  assert.deepEqual(reads, [1, 1, 0, 0, 0], "the field read once, into the look-up, never rendered");
});

// killer: apps/site/components/dojo/dojo-table.tsx:58 CONST "spellCheck={false}" -> "spellCheck={false} name={W.address}"
test("dojo_lookup_sends_no_address", async () => {
  const { dojoLookupOf } = await lookupModule(), { e2, c9 } = await records();
  for (const ed of [ed25519, noEd25519]) {
    const r = await run(c9, e2, ed), { bound } = rowsOf(r.table), n = r.all.length;
    // The page reads the published timeline and the signed lines files by their sha256 paths, nothing else: no address (M-K2).
    assert.ok(n > 0 && r.all.every((g) => g === "timeline.jsonl" || /^lines[/][0-9a-f]{64}[.]jsonl$/.test(g)), `the GETs: ${r.all.join(" ")}`);
    for (const s of [...bound.map((x) => x.address), ADDR.D, MINT, "not an address"]) dojoLookupOf(s, bound);
    assert.equal(r.all.length, n, "a look-up makes no GET");
  }
  // The component and the look-up module: no form, no field name, no request, no link built from the text, nothing kept (M-K8, TY-18).
  const tokens = ["<form", "name=", "fetch(", "location", "history.", "localStorage", "sessionStorage", "document.cookie", "URLSearchParams",
    "sendBeacon", "get("];
  for (const rel of ["components/dojo/dojo-table.tsx", "lib/dojo-lookup.ts"]) {
    const src = readFileSync(join(ROOT, "apps", "site", ...rel.split("/")), "utf8");
    assert.deepEqual(tokens.filter((t) => src.includes(t)), [], `${rel}: none of ${tokens.join(" ")}`);
  }
  const lookup = readFileSync(join(ROOT, "apps", "site", "lib", "dojo-lookup.ts"), "utf8").split(NL).filter((l) => /^import/.test(l));
  assert.deepEqual(lookup, ['import type { DojoTableRow } from "./dojo-served.ts";'], "the look-up imports a type alone");
});
