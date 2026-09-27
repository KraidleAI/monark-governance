// Root tests of PR-4a-1 (ADR-DOJO-PR-4 D-1 to D-3, section 4, with the corrections after its review): the served Dojo tree composed
// to the figures of /dojo, the loader's fail-closed contract, and the build's refusal of any tree the reader's tool refuses. Wiring
// root `test` (WIRING_TEST_ROOTS unchanged, D-3). The signed tree is GENERATED at run time by the fixture of the Dojo tests (keys made
// by node:crypto, never written): no dojo-served.json is committed (DOJO-SITE-BUILD-BEFORE-DATA-1); each record is written under a
// temporary root with its own manifest, read back through loadDojoServed, then removed. The oracles (Merkle root, sums, slots, decimal
// shift, line hash, body hashes) are recoded here, never taken from the modules under test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { buildDojoServed, loadDojoServed, DOJO_SERVED_REL, type DojoChainDeps, type DojoServedData } from "../apps/site/lib/dojo-served-load.ts";
import { dojoPageFiguresOf, shiftUnits } from "../apps/site/lib/dojo-served.ts";
import { shiftDecimal } from "../apps/site/lib/bell-served-load.ts";
import { ANCHOR_DAY, dateOf, dojoFixture, dojoKeyringOf, linesOf, newKey, render, type Step } from "../apps/dojo/test/helpers/dojo-fixture.ts";
import { walkDojoTimeline } from "../apps/dojo/scripts/dojo-chain.mjs";
import { dojoTrustOf, verifyDojoServed } from "../apps/dojo/scripts/dojo-verify.mjs";
import { rootOf } from "../apps/dojo/scripts/dojo-core.mjs";
import { canonical, lineHash, type Trust } from "../apps/bell/scripts/bell-chain.mjs";

type Tree = Map<string, Buffer>;
type Rec = Record<string, unknown>;
const DEPS: DojoChainDeps<Trust> = { trustOf: dojoTrustOf, walk: walkDojoTimeline, lineHash, rootOf, verify: verifyDojoServed };
const READ_AT = "2026-10-11T06:00:00.000Z";
const sha = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
const keyringBytes = (k: Rec): Buffer => Buffer.from(`${canonical(k)}\n`);
const build = (tree: Tree, committed: Rec, deps: DojoChainDeps<Trust> = DEPS): Promise<Rec> =>
  buildDojoServed({ readAt: READ_AT, tree, committedKeyring: keyringBytes(committed) }, deps);

/** A temporary repository root: the record (if any) and a manifest listing `entry` (the record's sha256 by default; null = no entry). */
function withRoot<T>(record: Rec | null, entry: string | null | undefined, f: (dir: string) => T, algorithm = "sha256"): T {
  const dir = mkdtempSync(join(tmpdir(), "dojo-served-"));
  try {
    mkdirSync(join(dir, "apps", "site", "data"), { recursive: true });
    const text = record === null ? null : `${JSON.stringify(record, null, 2)}\n`;
    if (text !== null) writeFileSync(join(dir, ...DOJO_SERVED_REL.split("/")), text);
    const e = entry === undefined ? (text === null ? null : sha(text)) : entry;
    writeFileSync(join(dir, "apps", "site", "data", "manifest.sha256.json"), JSON.stringify({ algorithm, files: e === null ? {} : { [DOJO_SERVED_REL]: e } }));
    return f(dir);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// -- Oracles recoded here --
/** RFC 9162 s2.1.1: leaf SHA-256(0x00 || line), node SHA-256(0x01 || left || right), split at the largest power of two below n. */
function merkle(ls: readonly string[]): Buffer {
  if (ls.length === 0) return createHash("sha256").digest();
  if (ls.length === 1) return createHash("sha256").update(Buffer.from([0])).update(ls[0] ?? "").digest();
  let k = 1;
  while (k * 2 < ls.length) k *= 2;
  return createHash("sha256").update(Buffer.from([1])).update(merkle(ls.slice(0, k))).update(merkle(ls.slice(k))).digest();
}
const tokens = (raw: string, d: number): string => {
  const n = BigInt(raw), p = 10n ** BigInt(d), frac = String(n % p).padStart(d, "0");
  return d === 0 ? String(n) : `${String(n / p)}.${frac}`;
};
/** The figures a reader recomputes by hand from the served tree: the last snapshot line, its lines file, the anchor, the version. */
function expected(tree: Tree): Rec {
  const lines = (tree.get("timeline.jsonl") ?? Buffer.alloc(0)).toString().trimEnd().split("\n").map((s) => JSON.parse(s) as Rec);
  const head = lines.filter((l) => l.kind === "snapshot").pop() ?? {}, anchor = lines.find((l) => l.kind === "anchor") ?? {};
  const v = lines.find((l) => l.kind === "price_version" && l.price_version === head.price_version) ?? {}, d = head.decimals as number;
  if (head.status === "abstained") return { state: "EA", day: head.day, ...(head.price_version === null ? {} : { threshold_unit_token_days: tokens(String(v.threshold_unit), d) }) };
  const raw = (tree.get(`lines/${String(head.lines_sha256)}.jsonl`) ?? Buffer.alloc(0)).toString().split("\n").filter((s) => s !== "");
  const objs = raw.map((s) => JSON.parse(s) as Rec), sum = (k: string): string => String(objs.reduce((t, o) => t + BigInt(String(o[k])), 0n));
  const reads = head.reads as Rec[], slots = (k: string): number[] => reads.map((r) => r[k]).filter((x): x is number => typeof x === "number");
  const out: Rec = { state: head.price_version === null ? "E1" : "E2", day: head.day, reads_done: String(slots("slot_min").length), k_reads: String(anchor.k_reads), slot_min: String(Math.min(...slots("slot_min"))),
    slot_max: String(Math.max(...slots("slot_max"))), lines_count: String(raw.length), root: merkle(raw).toString("hex"), score_total: tokens(sum("score"), d), validated_total: tokens(sum("validated"), d) };
  if (head.price_version === null) return out;
  return { ...out, threshold_unit_token_days: tokens(String(v.threshold_unit), d), holders_count: String(objs.filter((o) => o.holder_counted === true).length),
    dust_threshold_tokens: tokens(String(v.dust_threshold), d) };
}
/** The committed facts a reader recomputes from the served bytes: the last snapshot line's hash (SHA-256 of its canonical bytes as
 *  served), its key and instant, the counts of lines and snapshots, the SHA-256 of the timeline and of the served key set. */
function recorded(tree: Tree): Rec {
  const tl = tree.get("timeline.jsonl") ?? Buffer.alloc(0), raws = tl.toString().trimEnd().split("\n"), kinds = raws.map((s) => (JSON.parse(s) as Rec).kind);
  const i = kinds.lastIndexOf("snapshot"), last = JSON.parse(raws[i] ?? "{}") as Rec;
  return { line_hash: sha(raws[i] ?? ""), key_id: last.key_id, published_at: last.published_at, lines: raws.length, snapshots: kinds.filter((k) => k === "snapshot").length,
    bodies_sha256: { timeline: sha(tl), pubkey: sha(tree.get("dojo/pubkey.json") ?? "") } };
}
const factsOf = (d: DojoServedData): Rec => ({ line_hash: d.head.line_hash, key_id: d.head.key_id, published_at: d.head.published_at, lines: d.timeline.lines,
  snapshots: d.timeline.snapshots, bodies_sha256: d.bodies_sha256 });
/** The fixture's trees: E1 = seven counted days, no version; E2 = the whole fixture (version 1 in force); EA = E2 with its head abstained. */
function trees(): { committed: Rec; e1: Tree; e2: Tree; ea: Tree; steps: Step[]; key: Step["key"] } {
  const f = dojoFixture(), committed = dojoKeyringOf([[f.key, 1], [newKey(), 1]]); // a second, unused committed key (M-P15)
  const abstain = (s: Step[]): void => { Object.assign(s[s.length - 1]?.body ?? {}, { status: "abstained", beacon: null, reads: [] }); };
  return { committed, e1: render(f.steps.slice(0, 9)), e2: render(f.steps), ea: render(f.steps, new Map(), abstain), steps: f.steps, key: f.key };
}

test("dojo_snapshot_composes_served_lines_to_page_figures", async () => {
  const { committed, e1, e2, ea } = trees();
  for (const [name, tree] of [["E1", e1], ["E2", e2], ["EA", ea]] as const) {
    const data = await build(tree, committed); // the reader's tool accepts each of them under the committed keyring (it runs inside the build)
    const loaded = withRoot(data, undefined, (dir) => loadDojoServed(dir));
    assert.ok(loaded !== null, `${name}: the record loads`);
    assert.deepEqual(JSON.parse(JSON.stringify(loaded)), JSON.parse(JSON.stringify({ ...data, $comment: undefined, schema: undefined })), `${name}: the loader returns the built record`);
    assert.deepEqual(loaded.keyring, committed, `${name}: the keyring is the committed one, never the served key set (M-P15)`);
    assert.deepEqual(factsOf(loaded), recorded(tree), `${name}: line hash, key, instant, counts and body hashes are the ones recomputed from the served bytes`);
    const figures = dojoPageFiguresOf(loaded);
    if (figures.state === "E2") assert.notEqual(figures.validated_total, "0", "E2: validated points exist, so the sum is exercised");
    assert.deepEqual(figures, expected(tree), `${name}: the page figures are the ones recomputed from the served lines`);
  }
  assert.deepEqual(dojoPageFiguresOf(null), { state: "E0" }, "E0: no record, no figure");
  for (const [raw, d] of [["0", 0], ["0", 6], ["5", 6], ["1234567", 6], ["007", 2], ["0012345", 2], ["120000000", 6]] as const) assert.equal(shiftUnits(raw, d), shiftDecimal(raw, d), `shiftUnits(${raw}, ${String(d)})`);
});

test("dojo_served_head_is_the_latest_snapshot", async () => {
  const { committed, e1, e2, steps } = trees();
  const last = steps[steps.length - 1]?.body ?? {};
  const head = (await build(e2, committed)).head as Rec, h1 = (await build(e1, committed)).head as Rec;
  assert.deepEqual([head.seq, head.day, head.price_version], [steps.length, dateOf(ANCHOR_DAY + 9), 1], "E2: the head is the last snapshot, under version 1 (M-P13)");
  assert.equal(head.day, last.day);
  assert.deepEqual([h1.seq, h1.price_version], [9, null], "E1: the head is the seventh counted day, no version");
});

test("dojo_served_loader_is_fail_closed", async () => {
  const { committed, e1, e2, steps } = trees();
  const data = await build(e2, committed), last = steps.length - 1;
  // E0 only when the file AND its entry are absent; one without the other is refused (M-P12).
  assert.equal(withRoot(null, null, (dir) => loadDojoServed(dir)), null, "no file, no entry: E0");
  assert.throws(() => withRoot(data, null, (dir) => loadDojoServed(dir)), /not listed in the site manifest/, "a file without its entry is refused");
  assert.throws(() => withRoot(null, sha("x"), (dir) => loadDojoServed(dir)), /listed in the site manifest but absent/, "an entry without its file is refused");
  assert.throws(() => withRoot(data, sha("x"), (dir) => loadDojoServed(dir)), /sha256 mismatch/, "a file whose sha256 is not the manifest's is refused (M-P5)");
  assert.throws(() => withRoot(data, undefined, (dir) => loadDojoServed(dir), "sha1"), /algorithm is not sha256/, "a manifest of another algorithm is refused");
  // The closed shape: each mutant is hashed into the manifest, so only the loader's own checks refuse it.
  const e1Data = await build(e1, committed), hd = (d: Rec): Rec => d.head as Rec, tl = (d: Rec): Rec => d.timeline as Rec;
  const shapes: Array<[Rec, (d: Rec) => void, RegExp]> = [
    [data, (d) => { d.extra = true; }, /must carry exactly/], [data, (d) => { hd(d).extra = 0; }, /head must carry exactly/],
    [data, (d) => { ((d.timeline as Rec).anchor as Rec).extra = 0; }, /timeline\.anchor must carry exactly/],
    [data, (d) => { (((d.timeline as Rec).anchor as Rec).read_rule as Rec).extra = 0; }, /timeline\.anchor\.read_rule must carry exactly/],
    [e1Data, (d) => { hd(d).holders_count = 0; }, /exactly with a price_version/], [data, (d) => { hd(d).k_reads = 3; }, /k_reads is not the anchor's/],
    [data, (d) => { d.host = "http://dojo.monarkgate.tech"; }, /host must be/], [data, (d) => { d.schema = "monark-site-dojo-served-v2"; }, /schema is not/],
    [data, (d) => { hd(d).key_id = "cd".repeat(32); }, /every signing key must be in the committed keyring/],
    [data, (d) => { (d.history as Rec).history_last_day = hd(d).day; }, /history must end before the head's day/],
    [data, (d) => { hd(d).status = "abstained"; }, /a counted snapshot carries its slots/],
    [data, (d) => { hd(d).validated_total = `${String(hd(d).score_total)}1`; }, /totals disagree/],
    [data, (d) => { hd(d).reads_done = (hd(d).k_reads as number) + 1; }, /reads_done is 0 exactly when abstained/], [data, (d) => { hd(d).reads_done = 0; }, /reads_done is 0 exactly when abstained/],
    // C-V-1 (cp-2): the anchor before the head, the head and the snapshots within the timeline, one schema (C-4); the history's days in order (C-7).
    [data, (d) => { (tl(d).anchor as Rec).seq = hd(d).seq; }, /counts disagree/], [data, (d) => { tl(d).lines = (hd(d).seq as number) - 1; }, /counts disagree/],
    [data, (d) => { tl(d).snapshots = (tl(d).lines as number) + 1; }, /counts disagree/], [data, (d) => { tl(d).schema = "dojo-timeline-v2"; }, /counts disagree/],
    [data, (d) => { (d.history as Rec).history_first_day = hd(d).day; }, /history must end before/],
  ];
  for (const [base, edit, re] of shapes) {
    const d = JSON.parse(JSON.stringify(base)) as Rec;
    edit(d);
    assert.throws(() => withRoot(d, undefined, (dir) => loadDojoServed(dir)), re, String(re));
  }
  // The build refuses a voided line and a broken rotation reported by the walker (injected here), before the reader's tool runs.
  const walkWith = (extra: Rec): DojoChainDeps<Trust> => ({ ...DEPS, walk: (l, t) => ({ ...walkDojoTimeline(l, t), ...extra }) });
  await assert.rejects(build(e2, committed, walkWith({ voided: [3] })), /a line is voided by a revocation/, "a voided line is refused");
  await assert.rejects(build(e2, committed, walkWith({ breaks: [{ seq: 4 }] })), /broken-continuity rotation/, "a broken rotation is refused");
  // C-V-1 (cp-2): a line changed after signing does not walk (C-1); a counted head whose K reads all missed (C-2); no final LF (C-3).
  const tampered = render(steps, new Map(), (s) => { const x = s[last]; if (x !== undefined) x.post = (l) => { l.published_at = READ_AT; }; });
  await assert.rejects(build(tampered, committed), /does not walk under the committed keyring/, "a line changed after signing is refused");
  const missed = render(steps, new Map(), (s) => { const b = s[last]?.body ?? {}; b.reads = (b.reads as Rec[]).map((r) => ({ ...r, read_at: null, slot_min: null, slot_max: null,
    accounts_concordant: 0, accounts_no_quorum: 4, pool_price: null, usd_per_sol: null, usd_per_sol_publish_time: null })); });
  await assert.rejects(build(missed, committed), /a counted snapshot carries a reading made/, "all K reads missed is refused (DOJO-SERVED-ALL-MISSED-1)");
  const noLf = new Map(e2).set("timeline.jsonl", (e2.get("timeline.jsonl") ?? Buffer.alloc(0)).subarray(0, -1));
  await assert.rejects(build(noLf, committed), /timeline.jsonl lacks its final newline/, "a timeline without its final LF is refused");
  // It binds the head's lines to their signed line: a root signed by the key holder but not recomputable is refused (M-P9) ...
  const badRoot = render(steps, new Map(), (s) => { Object.assign(s[s.length - 1]?.body ?? {}, { root: "ab".repeat(32) }); });
  await assert.rejects(build(badRoot, committed), /recomputed Merkle root differs/, "a signed root that the lines do not rebuild is refused (M-P9)");
  // ... a count, or totals, signed by the key holder that the lines do not match are refused (the page figures come from the lines) ...
  for (const [k, v, re] of [["lines_count", 2, /count differs from the signed line/], ["score_total", "1", /sum to the signed totals/], ["holders_count", 0, /count the signed holders_count/]] as const) {
    await assert.rejects(build(render(steps, new Map(), (s) => { Object.assign(s[s.length - 1]?.body ?? {}, { [k]: v }); }), committed), re, k);
  }
  // ... a served line with a key outside the closed list is refused ...
  const extra = render(steps, new Map([[last, linesOf(steps, last).map((l, i) => (i === 0 ? { ...l, extra: 0 } : l))]]));
  await assert.rejects(build(extra, committed), /head line 1 must carry exactly/, "a served line with an extra key is refused");
  // ... and bytes changed after signing are refused by their sha256: the head's lines file, then the history file (same path, same count).
  const timeline = (e2.get("timeline.jsonl") ?? Buffer.alloc(0)).toString().trimEnd().split("\n").map((s) => JSON.parse(s) as Rec);
  const rel = `lines/${String(timeline[last]?.lines_sha256)}.jsonl`, swapped = new Map(e2);
  swapped.set(rel, Buffer.from((e2.get(rel) ?? Buffer.alloc(0)).toString().replace("\"validated\":\"", "\"validated\":\"1")));
  await assert.rejects(build(swapped, committed), /sha256 differs/, "a lines file changed after signing is refused");
  const hRel = [...e2.keys()].find((k) => k.startsWith("history/")) ?? "", altered = new Map(e2), missing = new Map(e2);
  altered.set(hRel, Buffer.from((e2.get(hRel) ?? Buffer.alloc(0)).toString().replace(/"day_value":"(\d)/, "\"day_value\":\"9$1")));
  missing.delete(hRel);
  assert.notDeepEqual(altered.get(hRel), e2.get(hRel), "the history file is altered");
  await assert.rejects(build(altered, committed), /history\/[0-9a-f]{64}\.jsonl: the sha256 differs from the signed line/, "a history file changed after signing is refused");
  await assert.rejects(build(missing, committed), /the served tree lacks history\//, "a missing history file is refused");
  // A lines file that only the reader's tool reads (an earlier snapshot's), missing, is refused too.
  const early = new Map(e2);
  early.delete(`lines/${String(timeline.find((l) => l.kind === "snapshot")?.lines_sha256)}.jsonl`);
  await assert.rejects(build(early, committed), /the served tree lacks lines\//, "an earlier snapshot's missing lines file is refused");
  // The trust root is the committed keyring: a tree signed and served under another key is refused (M-P15).
  const other = dojoFixture();
  await assert.rejects(build(render(other.steps), committed), /outside the committed keyring/, "a served key set outside the committed keyring is refused (M-P15)");
});

test("dojo_served_refuses_a_tree_the_verifier_refuses", async () => {
  const { committed, e2, steps, key } = trees();
  const last = steps.length - 1, v = steps.findIndex((s) => s.body.kind === "price_version");
  // P6: a signed price_version whose threshold_unit is not the conversion of its prices (the lines were built under the right one).
  const p6 = render(steps, new Map(), (s) => { const b = s[v]?.body ?? {}; b.threshold_unit = String(BigInt(String(b.threshold_unit)) * 2n); });
  // P8: one holder's score raised by one, the signed totals summed from the lines (consistent sums, a wrong line).
  const l8 = linesOf(steps, last).map((l) => ({ ...l })), h = l8.find((l) => l.class === "holder" && l.score !== "0");
  assert.ok(h !== undefined, "P8: a scored holder exists");
  h.score = String(BigInt(h.score) + 1n);
  // P9: the committed keyring closes the signing key's window at seq 5, before the head.
  const c9 = dojoKeyringOf([[key, 1, 5], [newKey(), 1]]);
  for (const [name, tree, keyring, code] of [["P6", p6, committed, "threshold_conversion_mismatch"], ["P8", render(steps, new Map([[last, l8]])), committed, "score_mismatch"],
    ["P9", e2, c9, "key_not_active"]] as const) {
    await assert.rejects(build(tree, keyring), new RegExp(`the reader's tool refuses the served tree under the committed keyring \\(${code} at seq`), `${name}: refused (${code})`);
  }
  // The roots the tool recomputes must be the signed ones: a report naming another root is refused.
  for (const part of ["head", "history"] as const) {
    const verify = async (o: Parameters<typeof verifyDojoServed>[0]): Promise<unknown> => {
      const r = (await verifyDojoServed(o)) as Rec;
      return { ...r, [part]: { ...(r[part] as Rec), recomputed_root: "00".repeat(32) } };
    };
    await assert.rejects(build(e2, committed, { ...DEPS, verify }), /recomputes other roots than the signed ones/, `${part}: another recomputed root is refused`);
  }
});
