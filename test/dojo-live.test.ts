// Root tests of PR-4c-1a (ADR-DOJO-PR-4, G0 fold of PR-4c-1 and its cp-1 fold): the head of the day reread in the browser by
// apps/site/lib/dojo-live.ts (dual-compile; SHA-256, Ed25519 and the transport injected), and the site's rule for an abstained head that
// carries its readings (Q-P2 (a)). Oracles, never the module under test: the build's own projection (buildDojoServed(...).head on the same
// served tree, its refusals included), the timeline walker (walkDojoTimeline: each mutation of a new line it refuses falls back under the
// walker's own code), the node primitives of bell-chain.mjs and dojo-core.mjs, and the bounds of the reader's tool (VERIFY_BOUNDS). Trees
// are signed at run time by the Dojo fixture (keys made by node:crypto, never written); Ed25519 is checked by node's crypto.subtle, injected
// as the browser injects Web Crypto; no network. FIXTURE-SPREAD (a continuous rotation, a second version) lives here, not in
// test/dojo-served.test.ts: a test there driving the base's correct build would be green at base, which red-proof refuses.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, webcrypto } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as live from "../apps/site/lib/dojo-live.ts";
import { buildDojoServed, loadDojoServed, DOJO_HEAD_KEYS, DOJO_SERVED_REL, type DojoChainDeps, type DojoServedData }
  from "../apps/site/lib/dojo-served-load.ts";
import { dojoPageFiguresOf } from "../apps/site/lib/dojo-served.ts";
import { ANCHOR_DAY, FIRST, anchorBody, at, dateOf, dojoFixture, dojoKeyringOf, dojoSpreadFixture, historyBody, linesOf, newKey, render, snapshotBody,
  versionBody, type Line, type Step } from "../apps/dojo/test/helpers/dojo-fixture.ts";
import { walkDojoTimeline } from "../apps/dojo/scripts/dojo-chain.mjs";
import * as chain from "../apps/dojo/scripts/dojo-chain.mjs"; // lot DEPTH-BOUND: new exports through namespaces, so the file loads at base
import * as load from "../apps/site/lib/dojo-served-load.ts";
import { dojoTrustOf, verifyDojoServed, VERIFY_BOUNDS } from "../apps/dojo/scripts/dojo-verify.mjs";
import { leafHash, nodeHash, rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import { canonical, keyIdOf, lineHash, signingBytes, type Trust } from "../apps/bell/scripts/bell-chain.mjs";

type Tree = Map<string, Buffer>;
type Rec = Record<string, unknown>;
const DEPS: DojoChainDeps<Trust> = { trustOf: dojoTrustOf, walk: walkDojoTimeline, lineHash, rootOf, verify: verifyDojoServed };
const sha256: live.Sha256 = (b) => Promise.resolve(new Uint8Array(createHash("sha256").update(b).digest()));
const verifyEd25519: live.VerifyEd25519 = async (x, m, s) =>
  webcrypto.subtle.verify("Ed25519", await webcrypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x }, "Ed25519", false, ["verify"]), s, m);
/** The transport over a served tree: 200 and its bytes, 404 when absent, answered after `delay` ms. */
const served = (tree: Tree, delay = 0): live.DojoLiveGet => (rel) => new Promise<live.DojoLiveResponse>((ok) => {
  setTimeout(() => { ok(tree.has(rel) ? new Response(tree.get(rel)) : new Response(null, { status: 404 })); }, delay);
});
const timelineOf = (tree: Tree): Rec[] => (tree.get("timeline.jsonl") ?? Buffer.alloc(0)).toString().trimEnd().split("\n").map((s) => JSON.parse(s) as Rec);
const build = (tree: Tree, keyring: Rec): Promise<Rec> =>
  buildDojoServed({ readAt: "2026-10-11T06:00:00.000Z", tree, committedKeyring: Buffer.from(`${canonical(keyring)}\n`) }, DEPS);
const built = (tree: Tree, keyring: Rec): Promise<Rec> => build(tree, keyring).catch((e: unknown) => assert.fail(`the build refuses: ${String(e)}`));
/** The committed record as the page loads it: built from `tree`, written with its manifest entry under a temporary root, read back. */
async function committedOf(tree: Tree, keyring: Rec): Promise<DojoServedData> {
  const text = `${JSON.stringify(await built(tree, keyring), null, 2)}\n`, dir = mkdtempSync(join(tmpdir(), "dojo-live-"));
  try {
    mkdirSync(join(dir, "apps", "site", "data"), { recursive: true });
    writeFileSync(join(dir, ...DOJO_SERVED_REL.split("/")), text);
    const files = { [DOJO_SERVED_REL]: createHash("sha256").update(text).digest("hex") };
    writeFileSync(join(dir, "apps", "site", "data", "manifest.sha256.json"), JSON.stringify({ algorithm: "sha256", files }));
    let data: DojoServedData | null = null;
    try { data = loadDojoServed(dir); } catch (e) { assert.fail(`the loader refuses: ${String(e)}`); }
    return data ?? assert.fail("no record");
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
const reread = (c: DojoServedData, tree: Tree, bounds?: live.DojoLiveBounds, delay = 0): Promise<live.DojoLiveOutcome> =>
  live.rereadDojoHead(c, { sha256, verifyEd25519, get: served(tree, delay), ...(bounds === undefined ? {} : { bounds }) });
const headOf = (o: live.DojoLiveOutcome): Rec => (o.kind === "reread" ? { ...o.head } : assert.fail(`no reread: ${JSON.stringify(o)}`));
const whyOf = (o: live.DojoLiveOutcome): string => (o.kind === "fallback" ? o.why : assert.fail(`no fallback: ${JSON.stringify(o)}`));
const body = (i: number, edit: Rec) => (s: Step[]): void => { Object.assign(s[i]?.body ?? {}, edit); };
const pre = (i: number, edit: (l: Line) => void) => (s: Step[]): void => { const x = s[i]; if (x !== undefined) x.pre = edit; };
const trustOf = (keyring: Rec): Trust => dojoTrustOf(keyring)?.trust ?? assert.fail("a committed keyring");

// killer: apps/site/lib/dojo-live.ts:73 CONST "leafOf(enc.encode(r), sha256)" -> "leafOf(enc.encode(canonical(JSON.parse(r))), sha256)"
test("dojo_live_primitives_equal_the_node_ones", async () => {
  const s = dojoSpreadFixture(), tree = render(s.steps), lines = timelineOf(tree);
  assert.deepEqual([...new Set(lines.map((l) => String(l.kind)))].sort(), ["anchor", "history", "key_rotation", "price_version", "snapshot"], "kinds");
  for (const l of lines) {
    assert.equal(live.canonical(l), canonical(l), `canonical, seq ${String(l.seq)}`);
    assert.deepEqual(Buffer.from(live.signingBytes(l)), signingBytes(l), `signed bytes, seq ${String(l.seq)}`);
    assert.equal(await live.lineHashOf(l, sha256), lineHash(l), `line hash, seq ${String(l.seq)}`);
  }
  const e = String.fromCharCode(0xe9), odd = { b: `${e}${String.fromCharCode(0x2028, 1)}"\\`, a: { z: null, [e]: true, A: [false, {}] } };
  for (const v of [[1e21, -0, 0.1, 5e-7, -12, 2 ** 53], odd, ""]) assert.equal(live.canonical(v), canonical(v));
  // The signature form of verifyLine (bell-chain.mjs): 64 bytes whose base64url re-encoding is the string itself.
  const sig = String(lines[0]?.sig);
  for (const x of [sig, `${sig}==`, sig.slice(0, -1), `${sig.slice(0, -1)}B`, `${sig.slice(0, -2)}+w`, `${sig.slice(0, -2)} w`]) {
    const raw = Buffer.from(x, "base64url"), bytes = live.signatureOf(x);
    assert.equal(bytes !== null, raw.length === 64 && raw.toString("base64url") === x, `signature form: ${x}`);
    if (bytes !== null) assert.deepEqual(Buffer.from(bytes), raw);
  }
  // A lines file as served, plus a line whose raw bytes are not its canonical form (M-L10): each leaf over the bytes as served.
  const rel = [...tree.keys()].find((k) => k.startsWith("lines/") && (tree.get(k)?.length ?? 0) > 0) ?? "";
  const rows = [...(tree.get(rel) ?? Buffer.alloc(0)).toString().trimEnd().split("\n"), ' { "b" : 1 , "a" : [ 2 ] }'];
  for (const r of rows) assert.equal(live.toHex(await live.leafOf(Buffer.from(r), sha256)), leafHash(r), "leaf");
  const [x, y] = [await live.leafOf(Buffer.from(rows[0] ?? ""), sha256), await live.leafOf(Buffer.from(rows[1] ?? ""), sha256)];
  assert.equal(live.toHex(await live.nodeOf(x, y, sha256)), nodeHash(live.toHex(x), live.toHex(y)), "node, left then right");
  for (let n = 0; n <= rows.length; n++) assert.equal(await live.rootOf(rows.slice(0, n), sha256), rootOf(rows.slice(0, n)), `root of ${String(n)} lines`);
  assert.notEqual(await live.rootOf(rows, sha256), rootOf(rows.map((r) => canonical(JSON.parse(r) as unknown))), "never the root of a reserialization");
});

// killer: apps/site/lib/dojo-live.ts:288 CONST "Math.max(...M)" -> "Math.min(...M)"
test("dojo_live_head_extends_the_committed_record", async () => {
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]), e1 = render(f.steps.slice(0, 9)), e2 = render(f.steps);
  const abstain = (s: Step[]): void => { Object.assign(s[s.length - 1]?.body ?? {}, { status: "abstained", beacon: null, reads: [] }); };
  const s = dojoSpreadFixture(), ks = dojoKeyringOf([[s.key, 1, 13], [s.next, 13]]);
  const anchored = render([...f.steps, { key: f.key, body: anchorBody(f.seed(10), 40, ANCHOR_DAY + 10) },
    { key: f.key, body: snapshotBody(ANCHOR_DAY + 11, f.seed(11), 1) }]);
  // committed prefix -> served tree: a version enters; nothing new; an abstained head; a new anchor, then a snapshot under it; lines
  // signed by the key a rotation of the committed prefix made active, and a second version.
  const cases: Array<[string, Tree, Tree, Rec]> = [["E1 to E2", e1, e2, k], ["E2 to E2", e2, e2, k], ["E1 to EA", e1, render(f.steps, new Map(), abstain), k],
    ["a new anchor", e2, anchored, k], ["rotated prefix to version 2", render(s.steps.slice(0, 18)), render(s.steps), ks]];
  for (const [name, prefix, tree, keyring] of cases) {
    const c = await committedOf(prefix, keyring), want = (await built(tree, keyring)).head as Rec;
    assert.deepEqual(Object.keys(want).sort(), [...DOJO_HEAD_KEYS].sort(), `${name}: the closed keys of a committed head`);
    assert.deepStrictEqual(headOf(await reread(c, tree)), want, `${name}: the head reread in the browser is the head the build projects`);
  }
});

// killer: apps/site/lib/dojo-live.ts:249 SDL "if (l.key_id !== active) return fail(\"key_not_active\");" -> ""
test("dojo_live_refuses_what_the_walker_refuses", async () => {
  const f = dojoFixture(), other = newKey(), k = dojoKeyringOf([[f.key, 1], [other, 1]]), c = await committedOf(render(f.steps.slice(0, 9)), k);
  const [v, s8, s9] = [9, 10, 11]; // steps of the new lines: price_version 1 (seq 10), the snapshots of read days 8 and 9 (seq 11 and 12)
  const push = (x: Step) => (s: Step[]): void => { s.push(x); }, anchor10 = anchorBody(f.seed(10), 40, ANCHOR_DAY + 10);
  // List (i) of the G1 journal: the walker's refusals reproduced on a new line, each line re-signed so that one check alone refuses it.
  const cases: Array<[string, (s: Step[]) => void]> = [
    ["timeline_malformed", pre(s9, (l) => { l.schema = "dojo-timeline-v2"; })], ["timeline_malformed", pre(s9, (l) => { l.seq = 13; })],
    ["timeline_malformed", pre(s9, (l) => { l.kind = "publication"; })], ["chain_broken", pre(s8, (l) => { l.prev_line_hash = "0".repeat(64); })],
    ["key_not_in_keyring", (s) => { Object.assign(s[s9] ?? {}, { key: newKey() }); }],
    ["signature_invalid", (s) => { Object.assign(s[s9] ?? {}, { post: (l: Line) => { l.published_at = "2026-10-12T01:00:00.000Z"; } }); }],
    ["key_not_active", (s) => { Object.assign(s[s9] ?? {}, { key: other }); }], ["day_not_increasing", body(s9, { day: dateOf(ANCHOR_DAY + 8) })],
    ["seed_revealed_early", body(s9, { published_at: at(ANCHOR_DAY + 9, 12) })], ["seed_chain_broken", body(s9, { seed: "ab".repeat(32) })],
    ["version_not_in_force", body(s9, { price_version: null })], ["timeline_malformed", body(s9, { reads: {} })],
    ["price_version_mismatch", body(v, { published_at: at(FIRST + 6, 2) })], ["timeline_malformed", body(v, { pool_price_daily: [["1", "7"]] })],
    ["version_not_in_force", push({ key: f.key, body: versionBody(2, FIRST + 1, at(FIRST + 9, 3)) })],
    ["timeline_malformed", push({ key: f.key, body: historyBody(ANCHOR_DAY) })],
    ["timeline_malformed", push({ key: f.key, body: { ...anchor10, k_reads: 0 } })],
    ["timeline_malformed", push({ key: f.key, body: { ...anchor10, read_rule: { ...(anchor10.read_rule as Rec), read_offset_s: 901 } } })],
  ];
  for (const [code, edit] of cases) {
    const tree = render(f.steps, new Map(), edit), w = walkDojoTimeline(timelineOf(tree), trustOf(k)), out = await reread(c, tree);
    const got = [w.ok ? "walks" : w.reason, out.kind === "fallback" ? out.why : out.kind];
    assert.deepEqual(got, [code, code], `${code}: the walker refuses, the browser falls back`);
    assert.equal(out.kind === "fallback" ? out.seq : null, w.ok ? null : w.seq, `${code}: at the walker's seq`);
  }
  // Key lines stop the reread (a rotation is not followed in the browser), whatever the walker says of them.
  for (const x of [{ key: f.key, rotateTo: other, body: { kind: "key_rotation", published_at: at(FIRST + 9, 3) } },
    { key: f.key, body: { kind: "key_revocation", published_at: at(FIRST + 9, 3), revoked_key_id: keyIdOf(other), revoked_from_seq: 1 } }]) {
    assert.deepEqual(await reread(c, render([...f.steps, x])), { kind: "key_change", seq: 13 }, `${String(x.body.kind)}: a key change`);
  }
  // Beyond the walker, refusals of the reader's tool reproduced here, which the build refuses too: closed keys, the committed key's
  // window, a key revoked from a seq, a snapshot field.
  const closed = dojoKeyringOf([[f.key, 1, 10], [other, 1]]);
  const revoked = { ...k, keys: (k.keys as Rec[]).map((e, i) => (i === 0 ? { ...e, revoked_from_seq: 11 } : e)) };
  const beyond: Array<[string, Rec, ((s: Step[]) => void) | undefined]> = [["timeline_malformed", k, pre(s9, (l) => { l.extra = 0; })],
    ["key_not_active", closed, undefined], ["key_not_active", revoked, undefined], ["timeline_malformed", k, body(s9, { decimals: -1 })]];
  for (const [code, keyring, edit] of beyond) {
    const tree = render(f.steps, new Map(), edit);
    assert.equal(walkDojoTimeline(timelineOf(tree), trustOf(keyring)).ok, true, `${code}: the walker walks it`);
    await assert.rejects(build(tree, keyring), Error, `${code}: the build refuses it`);
    assert.equal(whyOf(await reread(await committedOf(render(f.steps.slice(0, 9)), keyring), tree)), code, `${code}: the browser falls back`);
  }
});

// killer: apps/site/lib/dojo-live.ts:231 CONST "raws.length < at" -> "false"
test("dojo_live_falls_back_to_the_committed_figures", async () => {
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]), e2 = render(f.steps), c = await committedOf(render(f.steps.slice(0, 9)), k);
  const last = f.steps.length - 1, rel = `lines/${String(timelineOf(e2).pop()?.lines_sha256)}.jsonl`, tl = e2.get("timeline.jsonl") ?? Buffer.alloc(0);
  const lf = e2.get(rel) ?? Buffer.alloc(0), without = (p: string): Tree => { const t = new Map(e2); t.delete(p); return t; };
  // The served files older, unread or out of form.
  const unread: Array<[string, DojoServedData, Tree, RegExp]> = [
    ["an older timeline (M-L5)", await committedOf(e2, k), render(f.steps.slice(0, 9)), /ends before the committed head/],
    ["no timeline", c, without("timeline.jsonl"), /timeline\.jsonl: status 404/],
    ["no final LF", c, new Map(e2).set("timeline.jsonl", tl.subarray(0, -1)), /final newline/],
    ["a byte out of UTF-8", c, new Map(e2).set("timeline.jsonl", Buffer.concat([Buffer.from([0xff]), tl])), /not valid/],
    ["no lines file", c, without(rel), /status 404/],
    ["a lines file behind a BOM (M-L3)", c, new Map(e2).set(rel, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), lf])), /^lines_sha_mismatch$/],
  ];
  for (const [name, cc, tree, why] of unread) assert.match(whyOf(await reread(cc, tree)), why, name);
  // Signed lines whose lines file does not bind them (the key holder's own error): the build refuses each, the browser falls back.
  const missed = (s: Step[]): void => {
    const b = s[last]?.body ?? {};
    b.reads = (b.reads as Rec[]).map((r) => ({ ...r, read_at: null, slot_min: null, slot_max: null, accounts_concordant: 0, accounts_no_quorum: 4,
      pool_price: null, usd_per_sol: null, usd_per_sol_publish_time: null }));
  };
  const extra = new Map([[last, linesOf(f.steps, last).map((l, i) => (i === 0 ? { ...l, extra: 0 } : l))]]);
  const signed: Array<[string, Tree, RegExp]> = [
    ["a root the lines do not rebuild (M-L4)", render(f.steps, new Map(), body(last, { root: "ab".repeat(32) })), /^root_mismatch$/],
    ["a count", render(f.steps, new Map(), body(last, { lines_count: 2 })), /^lines_count_mismatch$/],
    ["totals (M-L18)", render(f.steps, new Map(), body(last, { score_total: "1" })), /sum to the signed totals/],
    ["holders (M-L18)", render(f.steps, new Map(), body(last, { holders_count: 0 })), /^holders_count_mismatch$/],
    ["a line out of its closed keys", render(f.steps, extra), /^line_malformed$/],
    ["a counted head without a reading made", render(f.steps, new Map(), missed), /a counted head without a reading/],
  ];
  for (const [name, tree, why] of signed) {
    await assert.rejects(build(tree, k), Error, `${name}: the build refuses`);
    assert.match(whyOf(await reread(c, tree)), why, `${name}: the browser falls back`);
  }
  // A key change in the new lines (M-L6): the committed figures, said as a key change.
  const s = dojoSpreadFixture(), ks = dojoKeyringOf([[s.key, 1, 13], [s.next, 13]]);
  assert.deepEqual(await reread(await committedOf(render(s.steps.slice(0, 12)), ks), render(s.steps)), { kind: "key_change", seq: 13 }, "rotation");
});

// killer: apps/site/lib/dojo-live.ts:91 CONST "++files > bounds.MAX_FILES" -> "false"
test("dojo_live_bounds_equal_the_verifier", async () => {
  assert.deepStrictEqual(live.DOJO_LIVE_BOUNDS, VERIFY_BOUNDS, "the browser's bounds are the reader's tool's, key for key (DOJO-LIVE-BOUNDS-KEYS-1)");
  assert.ok(Object.isFrozen(live.DOJO_LIVE_BOUNDS), "frozen");
  const src = readFileSync(join(import.meta.dirname, "..", "apps", "site", "lib", "dojo-live.ts"), "utf8");
  const code = src.split("\n").filter((l) => !/^\s*(\/\/|\/\*\*|\*)/.test(l));
  assert.deepEqual(code.filter((l) => /\bimport\b|\brequire\(/.test(l)), ['import type { DojoServedData, DojoServedHead } from "./dojo-served-load.ts";'],
    "one type import: nothing from apps/dojo, no node: builtin, no alias");
  assert.deepEqual(code.filter((l) => /\bfetch\b|\bwindow\b|\bdocument\b|\bcrypto\b/.test(l)), [], "no fetch, window, document or crypto");
  // Each bound applied: one refusal per key under a lowered bound, the same reread green under the tool's bounds, a slow host included.
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]), c = await committedOf(render(f.steps.slice(0, 9)), k), e2 = render(f.steps);
  const tl = (e2.get("timeline.jsonl") ?? Buffer.alloc(0)).length;
  assert.equal((await reread(c, e2, live.DOJO_LIVE_BOUNDS, 20)).kind, "reread", "under the tool's bounds");
  const lowered: Array<[keyof live.DojoLiveBounds, number, RegExp]> = [["MAX_BODY_BYTES", tl - 1, /bound of a body/], ["MAX_LINE_BYTES", 64, /bound of a line/],
    ["TIMEOUT_MS", 5, /timed out/], ["MAX_FILES", 1, /too many files/], ["MAX_TOTAL_BYTES", tl + 1, /bound of a whole reread/]];
  for (const [key, value, why] of lowered) assert.match(whyOf(await reread(c, e2, { ...live.DOJO_LIVE_BOUNDS, [key]: value }, 20)), why, `${key} applied`);
  // A body refused, by its bound or by its status, is cancelled, never left open.
  const refusals = [[200, { ...live.DOJO_LIVE_BOUNDS, MAX_BODY_BYTES: 4 }, /bound of a body/], [404, live.DOJO_LIVE_BOUNDS, /status 404/]] as const;
  for (const [status, bounds, why] of refusals) {
    let cancelled = false;
    const get: live.DojoLiveGet = () => Promise.resolve(new Response(new ReadableStream<Uint8Array>({ start: (q) => { q.enqueue(new Uint8Array(8)); },
      cancel: () => { cancelled = true; } }), { status }));
    assert.match(whyOf(await live.rereadDojoHead(c, { sha256, verifyEd25519, get, bounds })), why);
    assert.ok(cancelled, `a body refused at status ${String(status)} is cancelled`);
  }
});

// killer: apps/site/lib/dojo-served-load.ts:243 CONST "key_id: head.key_id" -> "key_id: anchor.key_id"
test("dojo_served_head_follows_rotation_and_version", async () => {
  const s = dojoSpreadFixture(), ks = dojoKeyringOf([[s.key, 1, 13], [s.next, 13]]), tree = render(s.steps), lines = timelineOf(tree);
  const [v1, v2] = lines.filter((l) => l.kind === "price_version"), head = (await built(tree, ks)).head as Rec;
  assert.deepEqual([head.seq, head.price_version, head.key_id], [21, 2, keyIdOf(s.next)], "the last snapshot, version 2, the rotated key (G-M8)");
  assert.notEqual(head.key_id, lines[0]?.key_id, "not the anchor's key");
  assert.deepEqual([head.threshold_unit, head.dust_threshold], [v2?.threshold_unit, v2?.dust_threshold], "the named version's thresholds (G-M19)");
  assert.notEqual(v1?.threshold_unit, v2?.threshold_unit, "two versions, two thresholds");
  assert.deepStrictEqual(headOf(await reread(await committedOf(render(s.steps.slice(0, 18)), ks), tree)), head, "the browser follows them too");
});

// killer: apps/site/lib/dojo-live.ts:261 CONST "prev !== committed.head.line_hash" -> "false"
test("dojo_live_prefix_chains_to_the_committed_head", async () => {
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]), e2 = render(f.steps);
  const c11 = await committedOf(render(f.steps.slice(0, 11)), k), c12 = await committedOf(e2, k);
  /** The served timeline with line `seq` edited by a relay (no key), then, if asked, every later line rechained to it. */
  const relay = (seq: number, edit: (l: Rec) => void, rechain = false): Tree => {
    const ls = timelineOf(e2);
    edit(ls[seq - 1] ?? assert.fail("a line"));
    if (rechain) for (let i = seq; i < ls.length; i++) Object.assign(ls[i] ?? {}, { prev_line_hash: lineHash(ls[i - 1]) });
    return new Map(e2).set("timeline.jsonl", Buffer.from(ls.map((x) => `${canonical(x)}\n`).join("")));
  };
  assert.equal((await reread(c11, e2)).kind, "reread", "control: the files as published are reread");
  const cases: Array<[string, DojoServedData, Tree]> = [
    ["M-L22: the thresholds of the prefix's version line", c11, relay(10, (l) => { l.threshold_unit = "7"; })],
    ["a prefix snapshot no figure reads", c11, relay(5, (l) => { l.score_total = "7"; })],
    ["a prev_line_hash of the prefix", c11, relay(7, (l) => { l.prev_line_hash = "0".repeat(64); })],
    ["the committed head's line, nothing after it", c12, relay(12, (l) => { l.published_at = "2026-10-12T01:00:00.000Z"; })],
    ["the whole prefix rewritten and rechained", c12, relay(5, (l) => { l.score_total = "7"; }, true)],
  ];
  for (const [name, c, tree] of cases) assert.equal((await reread(c, tree)).kind, "fallback", name);
  // M-L22, second kill: a committed record whose thresholds are not those of the version line it names is not reread.
  assert.match(whyOf(await reread({ ...c11, head: { ...c11.head, threshold_unit: "1" } }, e2)), /other thresholds/, "the committed thresholds bind");
});

// killer: apps/site/lib/dojo-served-load.ts:143 CONST "(head.reads_done === 0))" -> "(status === \"abstained\"))"
test("dojo_served_accepts_an_abstained_head_with_readings", async () => {
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]);
  const abstain = (s: Step[]): void => { Object.assign(s[s.length - 1]?.body ?? {}, { status: "abstained" }); }; // beacon and K reads kept
  for (const [n, name] of [[9, "E1"], [12, "E2"]] as const) {
    const tree = render(f.steps.slice(0, n), new Map(), abstain), head = timelineOf(tree).pop() ?? {}, reads = head.reads as Rec[];
    const slots = (key: string): number[] => reads.map((r) => r[key]).filter((x): x is number => typeof x === "number");
    const made = slots("slot_min").length;
    assert.deepEqual([head.status, head.beacon !== null, reads.length, made], ["abstained", true, 4, 3], `${name}: E-P5, beacon and readings kept`);
    const get = (rel: string): Promise<Buffer> => Promise.resolve(tree.get(rel) ?? assert.fail(rel));
    assert.equal((await verifyDojoServed({ source: { get }, keyring: k })).ok, true, `${name}: the reader's tool accepts it`);
    const h = (await built(tree, k)).head as Rec;
    assert.deepEqual([h.status, h.reads_done, h.slot_min, h.slot_max], ["abstained", 3, Math.min(...slots("slot_min")), Math.max(...slots("slot_max"))],
      `${name}: reads_done and the slots of the readings made`);
    const fig = dojoPageFiguresOf(await committedOf(tree, k)), keys = n === 12 ? ["day", "state", "threshold_unit_token_days"] : ["day", "state"];
    assert.deepEqual([fig.state, Object.keys(fig).sort()], ["EA", keys], `${name}: EA renders the day`);
    assert.deepStrictEqual(headOf(await reread(await committedOf(render(f.steps.slice(0, n - 1)), k), tree)), h, `${name}: the browser projects it too`);
  }
});

// C-G2-1 of the G2 of PR-4c-1a: one test per mutant that survived the reviewer's campaign c2 (its table-g2.mjs), which kills it by assertion.
/** The fixture, its committed keyring (a second key committed too) and the record committed at E1 (seq 9): new lines are seq 10 to 12. */
async function e1Record(): Promise<{ f: ReturnType<typeof dojoFixture>; k: Rec; c: DojoServedData }> {
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]);
  return { f, k, c: await committedOf(render(f.steps.slice(0, 9)), k) };
}
/** An edit of the first reading of the new head (seq 12, step 11), before the key holder signs it. */
const firstReading = (fn: (r: Rec) => Rec) => (s: Step[]): void => {
  const b = s[11]?.body ?? {};
  b.reads = (b.reads as Rec[]).map((r, i) => (i === 0 ? fn(r) : r));
};
/** The reader's tool beyond the walker: the walker walks the served tree, the build refuses it, the browser falls back with `why`. */
async function beyondTheWalker(tree: Tree, k: Rec, c: DojoServedData, why: RegExp): Promise<void> {
  assert.equal(walkDojoTimeline(timelineOf(tree), trustOf(k)).ok, true, "the walker walks it");
  await assert.rejects(build(tree, k), Error, "the build refuses it");
  assert.match(whyOf(await reread(c, tree)), why, "the browser falls back");
}

// killer: apps/site/lib/dojo-live.ts:222 CONST "l.mint === anchor.mint" -> "true"
test("dojo_live_refuses_a_new_head_of_another_mint", async () => {
  const { f, k, c } = await e1Record();
  await beyondTheWalker(render(f.steps, new Map(), body(11, { mint: "x" })), k, c, /^timeline_malformed$/);
});

// killer: apps/site/lib/dojo-live.ts:223 CONST "(l.status === " -> "(true || l.status === "
test("dojo_live_refuses_a_new_head_of_another_status", async () => {
  const { f, k, c } = await e1Record();
  await beyondTheWalker(render(f.steps, new Map(), body(11, { status: "provisional" })), k, c, /^timeline_malformed$/);
});

// killer: apps/site/lib/dojo-live.ts:102 CONST "await Promise.race([reader.read(), late])" -> "await reader.read()"
test("dojo_live_times_out_a_body_that_stalls", async () => {
  const { c } = await e1Record();
  let cancelled = false, timer: ReturnType<typeof setTimeout> | undefined;
  const get: live.DojoLiveGet = () => Promise.resolve(new Response(new ReadableStream<Uint8Array>({ start: (q) => { q.enqueue(new Uint8Array(8)); },
    cancel: () => { cancelled = true; } }), { status: 200 }));
  const run = live.rereadDojoHead(c, { sha256, verifyEd25519, get, bounds: { ...live.DOJO_LIVE_BOUNDS, TIMEOUT_MS: 100 } });
  const hung = new Promise<"hung">((r) => { timer = setTimeout(() => { r("hung"); }, 3000); });
  const o = await Promise.race([run, hung]).finally(() => { clearTimeout(timer); });
  assert.match(o === "hung" ? assert.fail("the reread waits on a stalled body") : whyOf(o), /timed out/, "a stalled body is timed out");
  assert.ok(cancelled, "and its body cancelled");
});

// killer: apps/site/lib/dojo-live.ts:283 CONST "m.length !== M.length" -> "false"
test("dojo_live_refuses_a_reading_without_its_slot_max", async () => {
  const { f, k, c } = await e1Record();
  await beyondTheWalker(render(f.steps, new Map(), firstReading((r) => ({ ...r, slot_max: null }))), k, c, /a counted head without a reading/);
});

// killer: apps/site/lib/dojo-live.ts:283 CONST "![...mins, ...maxs].every(int0)" -> "false"
test("dojo_live_refuses_a_slot_that_is_not_an_integer", async () => {
  const { f, k, c } = await e1Record();
  await beyondTheWalker(render(f.steps, new Map(), firstReading((r) => ({ ...r, slot_min: "x" }))), k, c, /a counted head without a reading/);
});

// killer: apps/site/lib/dojo-live.ts:276 CONST "version.dust_threshold !== c.dust_threshold" -> "false"
test("dojo_live_binds_the_committed_dust_threshold", async () => {
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]), c11 = await committedOf(render(f.steps.slice(0, 11)), k);
  const c = { ...c11, head: { ...c11.head, dust_threshold: `${String(c11.head.dust_threshold)}1` } };
  assert.match(whyOf(await reread(c, render(f.steps))), /other thresholds/, "a committed record whose dust threshold alone differs");
});

// killer: apps/site/lib/dojo-live.ts:301 CONST "objs.length !== rows.length ||" -> "false ||"
test("dojo_live_refuses_a_lines_row_that_is_not_an_object", async () => {
  const { f, k, c } = await e1Record(), nl = String.fromCharCode(10), rows = [...linesOf(f.steps, 11).map((l) => canonical(l)), "1"];
  const bytes = Buffer.from(rows.map((r) => `${r}${nl}`).join("")), sha = createHash("sha256").update(bytes).digest("hex");
  const tree = render(f.steps, new Map(), body(11, { lines_sha256: sha, lines_count: rows.length, root: rootOf(rows) })).set(`lines/${sha}.jsonl`, bytes);
  await beyondTheWalker(tree, k, c, /^line_malformed$/);
});

// killer: apps/site/lib/dojo-live.ts:303 CONST "!== h.validated_total" -> "!== h.validated_total && false"
test("dojo_live_binds_the_validated_total_to_the_lines", async () => {
  const { f, k, c } = await e1Record();
  await beyondTheWalker(render(f.steps, new Map(), body(11, { validated_total: "1" })), k, c, /sum to the signed totals/);
});

// killer: apps/site/lib/dojo-live.ts:35 CONST "{ fatal: true, ignoreBOM: true }" -> "{ fatal: true }"
test("dojo_live_refuses_a_timeline_behind_a_bom", async () => {
  const { f, k, c } = await e1Record(), e2 = render(f.steps), tl = e2.get("timeline.jsonl") ?? Buffer.alloc(0);
  const bom = new Map(e2).set("timeline.jsonl", Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), tl]));
  await assert.rejects(build(bom, k), Error, "the build refuses a timeline behind a BOM (the reader's tool: timeline_malformed at seq 1)");
  assert.equal((await reread(c, bom)).kind, "fallback", "the browser too: the BOM stays in the text, and the first line does not parse");
  assert.equal((await reread(c, e2)).kind, "reread", "control: the same bytes without it are reread");
});

// ---- Lot VERIFY-NONFINITE (G1 journal docs/G1-lot-verify-nonfinite.md): a served number that is not finite (1e400, which JSON.parse reads as
// Infinity, and -1e400) falls back by name, where the reader's tool refuses it: timeline_malformed at the seq of its timeline line (at base: the
// exception of canonical, caught with no seq), line_malformed for a lines file (at base: the file accepted and the head reread) ----
const NL = String.fromCharCode(10);
/** The served timeline with line `seq` edited as text by a relay, never re-signed. */
function edited(tree: Tree, seq: number, from: string | RegExp, to: string): Tree {
  const rows = (tree.get("timeline.jsonl") ?? Buffer.alloc(0)).toString("utf8").split(NL), row = rows[seq - 1] ?? "";
  assert.ok(typeof from === "string" ? row.includes(from) : from.test(row), `timeline line ${String(seq)} carries ${String(from)}`);
  rows[seq - 1] = row.replace(from, to);
  return new Map(tree).set("timeline.jsonl", Buffer.from(rows.join(NL)));
}
/** The reader's tool on a served tree under the keyring `k`: "<reason> @<seq>", "ok", or "threw <error>". */
const toolSays = (t: Tree, k: Rec): Promise<string> => verifyDojoServed({ source: { get: (rel: string) => Promise.resolve(t.get(rel) ?? Buffer.alloc(0)) },
  keyring: k }).then((r) => (r.ok ? "ok" : `${r.reason} @${String(r.seq)}`), (e: unknown) => `threw ${String(e)}`);

// killer: apps/site/lib/dojo-live.ts:240 CONST "canonical(l);" -> "void l;"
test("dojo_live_falls_back_on_a_non_finite_number_in_the_timeline", async () => {
  const { f, k, c } = await e1Record(), tree = render(f.steps);
  // a new line (seq 12, beyond the committed head at seq 9: its signed bytes) and a line of the committed prefix (seq 3: its chain hash)
  const places: Array<[number, string | RegExp, (x: string) => string]> = [[12, '"lines_count":3', (x) => `"lines_count":${x}`],
    [3, /"round":[0-9]+/, (x) => `"round":${x}`]];
  for (const x of ["1e400", "-1e400"]) {
    for (const [seq, from, to] of places) {
      const t = edited(tree, seq, from, to(x));
      assert.deepEqual([await reread(c, t), await toolSays(t, k)], [{ kind: "fallback", seq, why: "timeline_malformed" }, `timeline_malformed @${String(seq)}`],
        `${x} at seq ${String(seq)}: the browser falls back where the reader's tool refuses`);
    }
  }
});

// killer: apps/site/lib/dojo-live.ts:300 CONST "canonical(o); return o;" -> "return o;"
test("dojo_live_falls_back_on_a_non_finite_number_in_a_lines_file", async () => {
  const { f, k, c } = await e1Record(), text = linesOf(f.steps, 11).map((l) => `${canonical(l)}${NL}`).join("");
  const places: Array<[string, (x: string) => string]> = [['"tier":4', (x) => `"tier":${x}`], [",2]]", (x) => `,${x}]]`]];
  for (const x of ["1e400", "-1e400"]) {
    for (const [token, to] of places) {
      assert.ok(text.includes(token), `the head's lines carry ${token}`);
      const bytes = Buffer.from(text.replace(token, to(x))), sha = createHash("sha256").update(bytes).digest("hex");
      const edit = body(11, { lines_sha256: sha, root: rootOf(bytes.toString("utf8").slice(0, -1).split(NL)) });
      const tree = render(f.steps, new Map(), edit).set(`lines/${sha}.jsonl`, bytes);
      await beyondTheWalker(tree, k, c, /^line_malformed$/); // the reread of the new head: walked, refused by the build, falls back
      const head = timelineOf(tree)[11] ?? assert.fail("the signed head");
      assert.equal(await live.bindDojoLines(bytes, head, sha256), "line_malformed", `${x} for ${token}: the binding of the table (dojo-table.tsx:29)`);
    }
  }
});

// killer: apps/site/lib/dojo-served-load.ts:256 CONST "lineHash(l);" -> "void l;"
test("dojo_served_build_names_a_line_the_walk_cannot_hash", async () => {
  // BUILD-NONFINITE-1: the build walks the timeline before the reader's tool runs; a served line with a number canonical cannot write (1e400,
  // -1e400) or a value nested past the depth bound (lot DEPTH-BOUND: 17 levels, read as null before any parse, whatever the engine's stack)
  // is refused as the walk refuses it, never by canonical's exception (at base: refused by its signature for the nested one)
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]), tree = render(f.steps), deep = `${"[".repeat(16)}${"]".repeat(16)}`;
  const places: Array<[string, Tree, number]> = [["1e400", edited(tree, 12, '"lines_count":3', '"lines_count":1e400'), 12],
    ["-1e400", edited(tree, 3, /"round":[0-9]+/, '"round":-1e400'), 3], ["nested past the bound (17)", edited(tree, 5, '{"', `{"deep":${deep},"`), 5]];
  for (const [what, t, seq] of places) {
    const why = await build(t, k).then(() => "built", (e: unknown) => String(e));
    assert.equal(why, `Error: dojo served: the timeline does not walk under the committed keyring (seq ${String(seq)}: timeline_malformed)`, what);
  }
});

// killer: apps/site/lib/dojo-live.ts:240 CONST "let l: unknown = null; try { l = readJson(raw);" -> "let l: unknown = readJson(raw); try {"
test("dojo_live_falls_back_by_name_on_a_line_that_is_not_json", async () => {
  // LIVE-NOTJSON-1: a timeline line that is not JSON falls back at its seq, timeline_malformed, and a row of the head's lines file that is not
  // JSON line_malformed, as the reader's tool refuses them (at base: the parser's message, and no seq)
  const { f, k, c } = await e1Record(), tree = render(f.steps), text = linesOf(f.steps, 11).map((l) => `${canonical(l)}${NL}`).join("");
  for (const seq of [12, 3]) {
    const t = edited(tree, seq, '{"', '{x"');
    assert.deepEqual([await reread(c, t), await toolSays(t, k)], [{ kind: "fallback", seq, why: "timeline_malformed" }, `timeline_malformed @${String(seq)}`],
      `timeline line ${String(seq)}`);
  }
  const bytes = Buffer.from(text.replace('"tier":4', '"tier":4x')), sha = createHash("sha256").update(bytes).digest("hex");
  const edit = body(11, { lines_sha256: sha, root: rootOf(bytes.toString("utf8").slice(0, -1).split(NL)) });
  const withRow = render(f.steps, new Map(), edit).set(`lines/${sha}.jsonl`, bytes), head = timelineOf(withRow)[11] ?? assert.fail("the signed head");
  assert.deepEqual([await reread(c, withRow), await toolSays(withRow, k)], [{ kind: "fallback", seq: 12, why: "line_malformed" }, "line_malformed @12"],
    "a row of the lines file");
  assert.equal(await live.bindDojoLines(bytes, head, sha256), "line_malformed", "the binding of the table (dojo-table.tsx:29)");
});

// killer: apps/site/lib/dojo-live.ts:324 CONST "jsonDepth(text) > DOJO_LIVE_MAX_DEPTH" -> "false"
test("dojo_live_reads_no_text_past_the_depth_bound", async () => {
  // VERIFY-DEPTH-BOUND-1 (lot DEPTH-BOUND): the reread and the build restate the walker's bound and one-pass measure (pinned equal here), and
  // read a served text only within it: at the bound (16) a line is read as any other; one level more (17) it falls back by name at its seq, a
  // row as line_malformed (at base: read, then refused by its signature or by the chain, and a row past the bound reread with the head)
  assert.deepEqual([chain.DOJO_MAX_DEPTH, live.DOJO_LIVE_MAX_DEPTH, load.DOJO_SERVED_MAX_DEPTH], [16, 16, 16], "one bound, restated twice");
  const BS = String.fromCharCode(92), Q = String.fromCharCode(34), nest = (k: number): string => `${"[".repeat(k)}${"]".repeat(k)}`;
  const { f, c } = await e1Record(), tree = render(f.steps), text = linesOf(f.steps, 11).map((l) => `${canonical(l)}${NL}`).join("");
  // strings skipped with their escapes: brackets and an escaped quote inside a string; an escaped reverse solidus ending a string
  const corpus = [`[${Q}[[[{${BS}${Q}{{${Q}]`, `[${Q}${BS}${BS}${Q},[[]]]`, `{${Q}a${Q}:${Q}}}}${Q},${Q}b${Q}:[{${Q}c${Q}:[]}]}`, "5", "{}", nest(17)];
  assert.deepEqual(corpus.map((t) => chain.jsonDepth(t)), [1, 3, 4, 0, 1, 17], "the walker's measure, by hand");
  const served = [...corpus, ...(tree.get("timeline.jsonl") ?? Buffer.alloc(0)).toString("utf8").split(NL), ...text.split(NL)];
  for (const t of served) assert.deepEqual([live.jsonDepth(t), load.jsonDepth(t)], [chain.jsonDepth(t), chain.jsonDepth(t)], t.slice(0, 60));
  const line = (seq: number, kk: number): Tree => edited(tree, seq, '{"', `{"deep":${nest(kk)},"`);
  assert.deepEqual(await reread(c, line(12, 15)), { kind: "fallback", seq: 12, why: "signature_invalid" }, "a new line at the bound: read");
  assert.deepEqual(await reread(c, line(12, 16)), { kind: "fallback", seq: 12, why: "timeline_malformed" }, "a new line past it");
  assert.deepEqual(await reread(c, line(3, 16)), { kind: "fallback", seq: 3, why: "timeline_malformed" }, "a line of the prefix past it");
  const rowsAt = async (kk: number): Promise<[live.DojoLiveOutcome, string | number]> => {
    const bytes = Buffer.from(text.replace('"tier":4', `"tier":${nest(kk)}`)), sha = createHash("sha256").update(bytes).digest("hex");
    const edit = body(11, { lines_sha256: sha, root: rootOf(bytes.toString("utf8").slice(0, -1).split(NL)) });
    const t = render(f.steps, new Map(), edit).set(`lines/${sha}.jsonl`, bytes), head = timelineOf(t)[11] ?? assert.fail("the signed head");
    const bound = await live.bindDojoLines(bytes, head, sha256);
    return [await reread(c, t), typeof bound === "string" ? bound : bound.length];
  };
  const [atOutcome, atBound] = await rowsAt(15), [pastOutcome, pastBound] = await rowsAt(16);
  assert.deepEqual([atOutcome.kind, atBound], ["reread", 3], "a row at the bound is read: the reread does not recompute tiers");
  assert.deepEqual([pastOutcome, pastBound], [{ kind: "fallback", seq: 12, why: "line_malformed" }, "line_malformed"], "a row past it");
});

// killer: apps/site/lib/dojo-served-load.ts:277 CONST "jsonDepth(text) > DOJO_SERVED_MAX_DEPTH" -> "false"
test("dojo_served_build_reads_no_text_past_the_depth_bound", async () => {
  // VERIFY-DEPTH-BOUND-1: the build reads every served JSON text through its restated readJson: past the bound, a head line is not an object
  // and the key file is malformed, both refused before any parse (at base: the head line parsed, then refused by the reader's tool for its tier)
  assert.equal(load.DOJO_SERVED_MAX_DEPTH, 16, "the bound, restated");
  const f = dojoFixture(), k = dojoKeyringOf([[f.key, 1], [newKey(), 1]]), tree = render(f.steps), nest = `${"[".repeat(16)}${"]".repeat(16)}`;
  const why = (t: Tree): Promise<string> => build(t, k).then(() => "built", (e: unknown) => String(e));
  const text = linesOf(f.steps, 11).map((l) => `${canonical(l)}${NL}`).join(""), bytes = Buffer.from(text.replace('"tier":4', `"tier":${nest}`));
  const sha = createHash("sha256").update(bytes).digest("hex");
  const edit = body(11, { lines_sha256: sha, root: rootOf(bytes.toString("utf8").slice(0, -1).split(NL)) });
  assert.equal(await why(render(f.steps, new Map(), edit).set(`lines/${sha}.jsonl`, bytes)), "Error: dojo served: head line 3 must be an object",
    "a head line past the bound (A's line, the third)");
  const pk = (tree.get("dojo/pubkey.json") ?? Buffer.alloc(0)).toString("utf8").replace('"valid_from_seq":1', `"valid_from_seq":${nest}`);
  assert.equal(await why(new Map(tree).set("dojo/pubkey.json", Buffer.from(pk))), "Error: dojo served: dojo/pubkey.json is malformed", "the key file");
});
