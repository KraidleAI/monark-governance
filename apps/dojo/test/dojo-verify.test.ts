// MONARK Dojo -- PR-1b-2 T-6 oracles (ADR-DOJO-SNAPSHOT-1 D-10 l.250-253; section 6 l.377-395; eighth pli: table of the uses of the
// codes, DOJO-WALK-GAPS-1, DOJO-KEYRING-SCHEMA-1). Every served tree is signed at run time by helpers/dojo-fixture.ts; the expected
// verdicts are written from the mere, never read from the verifier; values of the fixture are pinned by hand. No network.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { canonical, keyIdOf } from "../../bell/scripts/bell-chain.mjs";
import { proofOf, rootOf } from "../scripts/dojo-core.mjs";
import { DOJO_VERIFY_REFUSALS, DojoVerifyError, VERIFY_BOUNDS, checkInclusion, dirSource, verifyDojoServed, type DojoVerifyReport,
  type VerifyBounds } from "../scripts/dojo-verify.mjs";
import { ADDR, ANCHOR_DAY, DAY1, FIRST, anchorBody, at, dateOf, dayLines, dojoFixture, dojoKeyringOf, historyBody, historyLines, keyringOfKeys,
  linesOf, newKey, removeTrees, render, seedChain, snapshotBody, versionAt, versionBody, writeTree, type DayLine, type Fixture, type HistoryLine,
  type Line, type Step } from "./helpers/dojo-fixture.ts";

const SCRIPT = join(import.meta.dirname, "..", "scripts", "dojo-verify.mjs");
const DAY = (j: number): number => ANCHOR_DAY - DAY1 + 1 + j; // day number of read day j (read day 0 = the anchor's day, the last history day)
const seen = new Set<string>(); // every reason the verifier gave in this file (closed-list assertion, last test)
after(removeTrees); // the trees written under os.tmpdir() by this file (C-G2-4 of PR-1b-2)
async function check(tree: ReadonlyMap<string, Buffer>, keyring: unknown, address: string | null = null, bounds: VerifyBounds = VERIFY_BOUNDS): Promise<DojoVerifyReport> {
  const r = await verifyDojoServed({ source: dirSource(writeTree(tree), bounds), keyring, address, bounds });
  if (!r.ok) seen.add(r.reason);
  return r;
}
/** "ok", or "<reason> @<seq>". */
const said = (r: DojoVerifyReport): string => (r.ok ? "ok" : `${r.reason} @${String(r.seq)}`);
function step(s: readonly Step[], i: number): Step {
  const x = s[i];
  if (x === undefined) throw new Error(`no step ${String(i)}`);
  return x;
}
const body = (s: readonly Step[], i: number): Line => step(s, i).body;

// ---- D-10 l.251, TU-5 l.348: a signed served tree, recomputed from its files alone, is accepted under the supplied keyring ----
test("dojo_verify_accepts_a_signed_served_fixture", async () => {
  const f = dojoFixture(), kr = dojoKeyringOf([[f.key, 1]]), tree = render(f.steps), r = await check(tree, kr);
  assert.ok(r.ok, said(r));
  assert.deepEqual([r.status, r.trust_root, r.seq, r.day, r.snapshots, r.head?.seq, r.head?.lines_count, r.history?.history_lines_count, r.voided_lines],
    ["consistent_with_supplied_keyring", "supplied_keyring", 12, dateOf(ANCHOR_DAY + 9), 9, 12, 3, 73, []]);
  assert.deepEqual([r.active_key_id, r.head?.recomputed_root, r.history?.recomputed_root], [keyIdOf(f.key), rootOf(linesOf(f.steps, 11).map((l) => canonical(l))),
    rootOf(historyLines(DAY(0)).map((l) => canonical(l)))], "the roots a deployment check (TU-6) reads");
  // By hand (D-3 l.177-178, D-16 l.277, D-17 l.291-294): p = median of (10 + k)/7 x 150 / 1000 = 39/140; T_1 = ceil(5 000 000 x 140 / 39)
  // = 17 948 718; dust = ceil(1 000 000 x 140 / 39) = 3 589 744. Day 31: A's lot born on day 2 is 30 days old: 5 000 000 x 30 =
  // 150 000 000 validated, floor(150 000 000 / 17 948 718) = 8 units, tier 4 (u = 1, 2, 4, 8, 16; Migration needs 180 days). B keeps
  // 500 000 of its day-10 lot (LIFO) over 20 counted days (15 and 26 missing), and 1 000 000 from day 27 over 5: 15 000 000, provisional.
  const v = body(f.steps, 9), l31 = dayLines(DAY(9), v), a = l31.find((l) => l.address === ADDR.A), b = l31.find((l) => l.address === ADDR.B);
  assert.deepEqual([v.unit_price_microusd, v.threshold_unit, v.dust_threshold], [["39", "140"], "17948718", "3589744"]);
  assert.deepEqual([a?.lots, a?.validated, a?.provisional, a?.units, a?.tier, a?.holder_counted], [[["5000000", 2]], "150000000", "0", "8", 4, true]);
  assert.deepEqual([b?.lots, b?.score, b?.validated, b?.units, b?.holder_counted], [[["500000", 10], ["1000000", 27]], "15000000", "0", "0", false]);
  // D reads a concordant 0 on day 24 (C-1): its line carries an empty pile that day, and it has no line after (D-7 l.222)
  assert.deepEqual([dayLines(DAY(2), null).find((l) => l.address === ADDR.D)?.lots, dayLines(DAY(3), null).some((l) => l.address === ADDR.D)], [[], false]);
  const self = await check(tree, null); // without a supplied keyring: self-consistent only (D-10 l.253; bell-verify.mjs:114)
  assert.deepEqual([self.ok, self.ok && self.status], [true, "self_consistent_only"]);
  // a day without a snapshot line is a missing day for every address; an anchor and its history line alone are accepted, without a
  // head (ADR-DOJO-PR-2B l.547)
  assert.equal(said(await check(render(f.steps.filter((_, i) => i !== 5)), kr)), "ok");
  const h = await check(render(f.steps.slice(0, 2)), kr);
  assert.deepEqual([said(h), h.ok && h.head, h.ok && h.history?.history_lines_count], ["ok", null, 73]);
});

// ---- D-10 l.250, mission of PR-1b-2: the CLI is fail-closed; the path TU-5 (signer -> served directory -> CLI) end to end ----
test("dojo_verify_cli_is_fail_closed", () => {
  const f = dojoFixture(), dir = writeTree(render(f.steps));
  const put = (name: string, text: string): string => join(writeTree(new Map([[name, Buffer.from(text)]])), name);
  const kr = put("kr.json", canonical(dojoKeyringOf([[f.key, 1]])));
  const cli = (...a: string[]): [number | null, DojoVerifyReport | null, string] => {
    const p = spawnSync(process.execPath, [SCRIPT, ...a], { encoding: "utf8" });
    return [p.status, p.stdout === "" ? null : (JSON.parse(p.stdout) as DojoVerifyReport), p.stderr];
  };
  const [s1, r1] = cli(dir, "--keyring", kr), [s2, r2] = cli(dir, "--self-consistent-only");
  assert.deepEqual([s1, r1?.ok === true && r1.status, s2, r2?.ok === true && r2.status], [0, "consistent_with_supplied_keyring", 0, "self_consistent_only"]);
  for (const a of [[dir], [], ["--self-consistent-only"], [dir, "--keyring"], [dir, "--keyring", "--self-consistent-only"], [dir, "--keyring", kr, "--self-consistent-only"],
    [dir, "--self-consistent-only", "--self-consistent-only"], [dir, "--self-consistent-only", "--address"], [dir, dir, "--self-consistent-only"], ["--keyrng", "--self-consistent-only"]]) {
    const [s, r, err] = cli(...a);
    assert.deepEqual([s, r, /^dojo\/verify: usage: /.test(err)], [1, null, true], `usage: ${a.join(" ")}`);
  }
  for (const k of [join(dir, "absent.json"), put("null.json", "null")]) {
    assert.deepEqual(cli(dir, "--keyring", k).slice(0, 2), [1, { ok: false, reason: "keyring_invalid", seq: null, day: null, detail: "--keyring" }], "never a run without a root");
  }
  const bad = writeTree(render(f.steps, undefined, (s) => { body(s, 11).score_total = "0"; }));
  assert.deepEqual(cli(bad, "--keyring", kr).slice(0, 2), [1, { ok: false, reason: "score_mismatch", seq: 12, day: dateOf(ANCHOR_DAY + 9), detail: "score_total" }]);
  // --address (D-10 l.250-251): the head's line and its path (proofOf of PR-1a, RFC 9162 s2.1.1), checked against the signed root
  const raw = linesOf(f.steps, 11).map((l) => canonical(l)), i = raw.findIndex((l) => l.includes(ADDR.A)), [s4, r4] = cli(dir, "--keyring", kr, "--address", ADDR.A);
  assert.deepEqual([s4, r4?.ok === true && r4.inclusion], [0, { address: ADDR.A, index: i, count: 3, line: raw[i], proof: proofOf(raw, i) }]);
  assert.deepEqual(cli(dir, "--keyring", kr, "--address", ADDR.D)[1],
    { ok: false, reason: "line_missing", seq: 12, day: dateOf(ANCHOR_DAY + 9), detail: "--address: no line in the head snapshot" });
  // built-in modules and the three local modules only; no network, no environment (motif apps/bell/test/bell-verify.test.ts)
  const text = readFileSync(SCRIPT, "utf8");
  assert.deepEqual([...text.matchAll(/\b(?:from|import)\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]),
    ["node:fs", "node:path", "node:url", "node:crypto", "../../bell/scripts/bell-chain.mjs", "./dojo-chain.mjs", "./dojo-core.mjs"]);
  for (const re of [/node:https?\b/, /node:net\b/, /node:tls\b/, /node:dns\b/, /child_process/, /\bfetch\s*\(/, /\bimport\s*\(/, /\brequire\s*\(/, /process\.env/]) {
    assert.equal(re.test(text), false, String(re));
  }
});

// ---- D-10 l.251, D-18 l.306, TU-12 l.355 (M-17, M-18); ADR-DOJO-PR-2B l.548: order of the history refusals ----
test("dojo_verify_history_transition", async () => {
  const f = dojoFixture(), kr = dojoKeyringOf([[f.key, 1]]), hist = historyLines(DAY(0));
  const run = async (g: ((h: HistoryLine[]) => HistoryLine[]) | null, edit?: (s: Step[]) => void): Promise<string> =>
    said(await check(render(f.steps, g === null ? undefined : new Map([[1, g(structuredClone(hist))]]), edit), kr));
  const on = (d: number, a: string) => (x: HistoryLine): boolean => x.day === dateOf(DAY1 + d - 1) && x.address === a;
  assert.equal(await run(null, (s) => { body(s, 1).history_root = rootOf(["x"]); }), "history_root_mismatch @2", "M-17 the history root altered");
  assert.equal(await run((h) => h.map((x) => (on(20, ADDR.A)(x) ? { ...x, day_value: "0" } : x))), "history_transition_mismatch @3",
    "M-18 a sale on day 20 in the history: the first snapshot's pile (a lot born on day 2) does not follow from it");
  // the file changed under its signed name: one day_value (same count) is a sha256, one line removed a count; the sha256 and the count
  // re-signed without the root are a root (ADR-DOJO-PR-2B l.548)
  const tree = render(f.steps), name = [...tree.keys()].find((k) => k.startsWith("history/")) ?? "", text = tree.get(name)?.toString("utf8") ?? "";
  const served = (t: string): Map<string, Buffer> => new Map([...tree, [name, Buffer.from(t)]]);
  assert.equal(said(await check(served(text.replace('"day_value":"5000000"', '"day_value":"5000001"')), kr)), "history_sha_mismatch @2");
  assert.equal(said(await check(served(text.slice(text.indexOf("\n") + 1)), kr)), "history_count_mismatch @2");
  assert.equal(said(await check(served(text.slice(0, -1)), kr)), "line_malformed @2", "no final newline");
  assert.equal(said(await check(new Map([...tree].filter(([k]) => !k.startsWith("history/"))), kr)), "unreachable @null", "the history file not served");
  assert.equal(await run((h) => h.map((x, i) => (i === 0 ? { ...x, day_value: "5000001" } : x)), (s) => { body(s, 1).history_root = rootOf(hist.map((x) => canonical(x))); }),
    "history_root_mismatch @2");
  assert.equal(await run((h) => [...h].reverse()), "history_not_sorted @2");
  assert.equal(await run((h) => h.filter((x) => !on(10, ADDR.A)(x))), "line_missing @2", "an address holding a pile has a line each day (ADR-DOJO-PR-2B l.465)");
  assert.equal(await run((h) => h.map((x) => (x.address === ADDR.P ? { ...x, class: "holder" } : x))), "class_mismatch @2");
  for (const [what, x] of [["a day after history_last_day", { day: dateOf(ANCHOR_DAY + 1) }], ["a day before day 1", { day: dateOf(DAY1 - 1) }],
    ["an impossible date", { day: "2026-09-31" }], ["a day_value out of form", { day_value: "01" }], ["an address out of base58", { address: "0x" }],
    ["a class out of the list", { class: "pool" }]] as const) {
    assert.equal(await run((h) => h.map((y, i) => (i === 0 ? { ...y, ...x } : y))), "line_malformed @2", what);
  }
});

// ---- D-17 l.291-294, D-3 l.178, TU-11 l.354 (M-13, M-14): each price_version recomputed from its seven values ----
test("dojo_price_version_recomputes_the_unit", async () => {
  const f = dojoFixture(), kr = dojoKeyringOf([[f.key, 1]]), v = body(f.steps, 9), a = body(f.steps, 0);
  // recoded from the mere, never from the core: p = the median of the seven pi_d x sigma_d x 10^-3, exact fractions; T_1 = ceil(O_1 / p);
  // dust_threshold = ceil(dust_threshold_microusd / p)
  const fr = (x: unknown): [bigint, bigint] => { const [n, d] = x as [string, string]; return [BigInt(n), BigInt(d)]; };
  const sigma = v.usd_per_sol_daily as unknown[];
  const prods = (v.pool_price_daily as unknown[]).map((x, i): [bigint, bigint] => { const [p, q] = fr(x), [s, t] = fr(sigma[i]); return [p * s, q * t * 1000n]; })
    .sort((x, y) => (x[0] * y[1] < y[0] * x[1] ? -1 : x[0] * y[1] > y[0] * x[1] ? 1 : 0));
  const [pn, pd] = prods[3] ?? [0n, 1n], gcd = (x: bigint, y: bigint): bigint => (y === 0n ? x : gcd(y, x % y)), g = gcd(pn, pd);
  const by = (x: unknown, up: bigint): string => String((BigInt(x as string) * pd + up * (pn - 1n)) / pn); // up = 1: ceil; up = 0: floor
  assert.deepEqual([v.unit_price_microusd, v.threshold_unit, v.dust_threshold],
    [[String(pn / g), String(pd / g)], by(a.objective_unit_microusd_days, 1n), by(a.dust_threshold_microusd, 1n)]);
  const run = async (edit: (b: Line) => void): Promise<string> => said(await check(render(f.steps, undefined, (s) => { edit(body(s, 9)); }), kr));
  assert.equal(await run(() => undefined), "ok");
  assert.equal(await run((b) => { b.unit_price_microusd = ["40", "140"]; }), "price_version_mismatch @10", "M-13 p not from the seven values");
  assert.equal(await run((b) => { b.pool_price_daily = (b.pool_price_daily as unknown[]).map((x, i) => (i === 3 ? ["20", "7"] : x)); }),
    "price_version_mismatch @10", "M-13 one daily value changed: the median moves");
  assert.equal(await run((b) => { b.threshold_unit = by(a.objective_unit_microusd_days, 0n); }), "threshold_conversion_mismatch @10", "M-14 T_1 rounded down");
  assert.equal(await run((b) => { b.dust_threshold = by(a.dust_threshold_microusd, 0n); }), "threshold_conversion_mismatch @10", "M-14 dust_threshold rounded down");
});

// ---- DOJO-WALK-GAPS-1 (a) (l.658; D-17 l.293: the history days carry no price, the first version comes from the read days) ----
test("dojo_verify_refuses_a_price_version_on_history_days", async () => {
  const f = dojoFixture(), kr = dojoKeyringOf([[f.key, 1]]);
  const tl = (first: number): Step[] => [step(f.steps, 0), step(f.steps, 1), { key: f.key, body: versionBody(1, first, at(FIRST, 0.75)) },
    ...[1, 2, 3].map((j): Step => ({ key: f.key, body: snapshotBody(ANCHOR_DAY + j, f.seed(j), first + 7 <= ANCHOR_DAY + j ? 1 : null) }))];
  assert.equal(said(await check(render(tl(ANCHOR_DAY - 6)), kr)), "price_version_mismatch @3", "a window of history days, in force from the first read day");
  assert.equal(said(await check(render(tl(ANCHOR_DAY)), kr)), "price_version_mismatch @3", "a window opening on the last history day");
  assert.equal(said(await check(render(tl(FIRST)), kr)), "ok", "a window of read days");
});

// ---- DOJO-WALK-GAPS-1 (b) (l.658; D-4 l.190, D-8 l.231: the anchor precedes the first read day, the history ends on its eve) ----
test("dojo_verify_refuses_a_history_ending_before_the_anchor_day", async () => {
  const f = dojoFixture(), kr = dojoKeyringOf([[f.key, 1]]);
  const tl = (last: number, read: number): Step[] => [step(f.steps, 0), { key: f.key, body: historyBody(last) },
    { key: f.key, body: snapshotBody(read, f.seed(read - ANCHOR_DAY), null) }];
  assert.equal(said(await check(render(tl(ANCHOR_DAY - 1, ANCHOR_DAY + 1)), kr)), "timeline_malformed @2", "a history ending the day before the anchor's");
  assert.equal(said(await check(render(tl(ANCHOR_DAY + 1, ANCHOR_DAY + 2)), kr)), "ok", "a history ending after the anchor's day (equality: question of the G1 journal)");
});

// ---- DOJO-WALK-GAPS-1 (c) (l.658; journal of PR-1b-1, Q-5 (d)): a new anchor is dated after the last published day ----
test("dojo_verify_refuses_an_anchor_on_a_published_day", async () => {
  const f = dojoFixture(), kr = dojoKeyringOf([[f.key, 1]]), other = seedChain("dojo-fixture-seed-2", 40);
  const tl = (day: number): Step[] => [...f.steps.slice(0, 5), { key: f.key, body: anchorBody(other(0), 40, day) },
    { key: f.key, body: snapshotBody(ANCHOR_DAY + 5, other(ANCHOR_DAY + 5 - day), null) }];
  assert.equal(said(await check(render(tl(ANCHOR_DAY + 3)), kr)), "day_not_increasing @6", "a new anchor dated on the last snapshot's day");
  assert.equal(said(await check(render([step(f.steps, 0), step(f.steps, 1), { key: f.key, body: anchorBody(other(0), 40, ANCHOR_DAY) },
    { key: f.key, body: snapshotBody(ANCHOR_DAY + 1, other(1), null) }]), kr)), "day_not_increasing @3", "a new anchor dated on the last history day");
  assert.equal(said(await check(render(tl(ANCHOR_DAY + 4)), kr)), "ok", "on the next day, itself a missing day for every address");
});

// ---- DOJO-KEYRING-SCHEMA-1 (l.659; D-8 l.234): dojo-keyring-v1, distinct from Bell's schema, closed, with validity windows ----
test("dojo_verify_keyring_is_the_dojo_schema", async () => {
  const f = dojoFixture(), tree = render(f.steps), kr = dojoKeyringOf([[f.key, 1]]), e0 = (kr.keys as Line[])[0] ?? {};
  const run = async (k: unknown): Promise<string> => said(await check(tree, k)), one = (e: Line): Line => ({ schema: "dojo-keyring-v1", keys: [e] });
  assert.equal(await run(kr), "ok");
  const bell = JSON.parse(readFileSync(join(import.meta.dirname, "..", "..", "bell", "keys", "bell-keyring.json"), "utf8")) as unknown;
  for (const [what, k] of [["the committed Bell keyring", bell], ["this key in Bell's schema", keyringOfKeys([f.key])], ["an extra member", { ...kr, extra: 1 }],
    ["the Dojo shape under Bell's schema name", { ...kr, schema: "bell-keyring-v1" }],
    ["no key", { schema: "dojo-keyring-v1", keys: [] }], ["a member of Bell's schema", one({ ...e0, status: "active" })],
    ["a private member", one({ ...e0, public_key: { ...(e0.public_key as object), d: "AA" } })], ["valid from seq 0", one({ ...e0, valid_from_seq: 0 })],
    ["a window ending before it starts", one({ ...e0, valid_from_seq: 3, valid_to_seq: 2 })], ["a key_id of other bytes", one({ ...e0, key_id: "0".repeat(64) })],
    ["a key twice", { ...kr, keys: [e0, e0] }]] as const) assert.equal(await run(k), "keyring_invalid @null", what);
  assert.equal(await run(dojoKeyringOf([[f.key, 1, 5]])), "key_not_active @6", "a key valid until seq 5 signs line 6");
  assert.equal(await run(dojoKeyringOf([[f.key, 2]])), "key_not_active @1", "a key valid from seq 2 signs line 1");
  assert.equal(await run(one({ ...e0, revoked_from_seq: 12 })), "key_not_active @12", "the head signed by a key revoked at its seq (bell-verify.mjs:104)");
  // a cross-signed rotation at seq 3 (bell-chain.mjs:133-146), the key windows [1, 3] and [3, open); then the old key revoked from seq
  // 2: its lines 2 and 3 are void and the snapshots derive from them, key_not_active at the oldest (F-1, fail-closed; Bell reports and goes on)
  const K2 = newKey(), rot = [step(f.steps, 0), step(f.steps, 1), { key: f.key, rotateTo: K2, body: { kind: "key_rotation", published_at: at(FIRST, 0.75) } },
    ...f.steps.slice(2).map((x) => ({ ...x, key: K2 }))], both = dojoKeyringOf([[f.key, 1, 3], [K2, 3]]), ks = both.keys as Line[];
  const r1 = await check(render(rot), both), r2 = await check(render(rot), { ...both, keys: [{ ...(ks[0] ?? {}), revoked_from_seq: 2 }, ks[1] ?? {}] });
  assert.deepEqual([said(r1), r1.ok && r1.active_key_id, r1.ok && r1.voided_lines, said(r2), !r2.ok && r2.detail],
    ["ok", keyIdOf(K2), [], "key_not_active @2", "voided_lines 2,3: signed by a key revoked at its seq"]);
  const X = newKey(), impostor = render(f.steps.map((x) => ({ ...x, key: X })));
  assert.deepEqual([said(await check(impostor, null)), said(await check(impostor, kr))], ["ok", "served_key_not_in_keyring @null"],
    "an impostor tree is self-consistent under its own key, refused under the supplied keyring");
});

// ---- F-1 (orchestrator's decision after the G2 of PR-1b-2, fail-closed; declared divergence from bell-verify.mjs:104): a line voided at or
// before the verified line refuses it, key_not_active at the oldest voided seq, voided_lines in the detail; a later voided line does not ----
test("dojo_verify_refuses_a_snapshot_derived_from_voided_lines", async () => {
  const f = dojoFixture(), K2 = newKey(), both = dojoKeyringOf([[f.key, 1, 3], [K2, 3]]), ks = both.keys as Line[], e0 = ks[0] ?? {};
  const rot = [step(f.steps, 0), step(f.steps, 1), { key: f.key, rotateTo: K2, body: { kind: "key_rotation", published_at: at(FIRST, 0.75) } },
    ...f.steps.slice(2).map((x) => ({ ...x, key: K2 }))], kr = { ...both, keys: [{ ...e0, revoked_from_seq: 2 }, ks[1] ?? {}] };
  const r4 = await check(render(rot.slice(0, 4)), kr), late = await check(render([...f.steps, { key: f.key, body: versionAt(2, FIRST + 2, at(FIRST + 9, 2), "300") }]),
    { schema: "dojo-keyring-v1", keys: [{ ...((dojoKeyringOf([[f.key, 1]]).keys as Line[])[0] ?? {}), revoked_from_seq: 13 }] });
  assert.deepEqual([said(r4), !r4.ok && r4.detail], ["key_not_active @2", "voided_lines 2,3: signed by a key revoked at its seq"], "line 4 (a snapshot) after the voided 2 and 3");
  assert.equal(said(await check(render(rot.slice(0, 1)), kr)), "ok", "line 1, before every voided line");
  assert.deepEqual([said(late), late.ok && late.voided_lines], ["ok", [13]], "a version voided after the head (seq 12) does not refuse it");
});

// ---- G2 of PR-1b-2, C-G2-3: six behaviours of the verifier pinned (probes R-04, R-15, R-03, R-06, R-07, R-17); verdicts from the mere ----
const pinned = async (g: (f: Fixture) => [ReadonlyMap<number, readonly object[]> | undefined, ((s: Step[]) => void) | undefined]): Promise<string> => {
  const f = dojoFixture(), [files, edit] = g(f);
  return said(await check(render(f.steps, files, edit), dojoKeyringOf([[f.key, 1]])));
};
const on11 = (f: Fixture, a: string, g: (l: DayLine) => DayLine[]): Map<number, DayLine[]> => new Map([[11, linesOf(f.steps, 11).flatMap((l) => (l.address === a ? g(l) : [l]))]]);
test("dojo_verify_refuses_a_duplicated_line", async () => {
  assert.equal(await pinned((f) => [on11(f, ADDR.A, (l) => [l, l]), undefined]), "lines_not_sorted @12", "R-04: A's line twice at its rank, totals re-summed (M-3)");
});
test("dojo_price_version_refuses_a_non_reduced_unit_price", async () => {
  assert.equal(await pinned(() => [undefined, (s) => { body(s, 9).unit_price_microusd = ["78", "280"]; }]), "price_version_mismatch @10", "R-15: 39/140 not reduced (Q-10)");
});
test("dojo_verify_history_refuses_same_day_lines_swapped", async () => {
  const h = historyLines(DAY(0)), i = h.findIndex((x, j) => h[j + 1]?.day === x.day), sw = h.map((x, j) => (j === i ? h[i + 1] : j === i + 1 ? h[i] : x) ?? x);
  assert.equal(await pinned(() => [new Map([[1, sw]]), undefined]), "history_not_sorted @2", "R-03: two addresses of one history day permuted");
});
test("dojo_verify_refuses_lines_under_no_version_while_one_is_in_force", async () => {
  assert.equal(await pinned(() => [new Map([[11, dayLines(DAY(9), null)]]), undefined]), "threshold_mismatch @12", "R-06: version 1 in force, day 31 under none (M-4)");
});
test("dojo_verify_refuses_a_program_address_validated", async () => {
  assert.equal(await pinned((f) => [on11(f, ADDR.P, (l) => [{ ...l, validated: "1" }]), undefined]), "program_address_scored @12", "R-07: validated typed on P (M-5)");
});
test("dojo_verify_refuses_a_provisional_typed_alone", async () => {
  assert.equal(await pinned((f) => [on11(f, ADDR.A, (l) => [{ ...l, provisional: "1" }]), undefined]), "validation_mismatch @12", "R-17: provisional alone on A (M-16)");
});

// ---- section 6 l.378-393 (M-1 to M-16; M-13 and M-14 above, M-17 and M-18 in the history test) and D-10 l.252: each named mutant of a
// served tree is refused by its code; the codes given in this file are those of D-10, read from the mere. Runs last ----
test("dojo_verify_refuses_each_named_mutant", async () => {
  const f = dojoFixture(), kr = dojoKeyringOf([[f.key, 1]]), X = newKey();
  const run = async (steps: readonly Step[], files?: ReadonlyMap<number, readonly object[]>, edit?: (s: Step[]) => void): Promise<string> =>
    said(await check(render(steps, files, edit), kr));
  const lines = (i: number, g: (l: DayLine) => DayLine, a: string): Map<number, DayLine[]> => new Map([[i, linesOf(f.steps, i).map((l) => (l.address === a ? g(l) : l))]]);
  const v2: Step = { key: f.key, body: versionAt(2, FIRST + 2, at(FIRST + 8, 2), "300") }, s4 = [...f.steps.slice(0, 11), v2, ...f.steps.slice(11)];
  const cases: Array<[string, Promise<string>, string]> = [
    ["M-1 a score typed +1 on a line", run(f.steps, lines(11, (l) => ({ ...l, score: String(BigInt(l.score) + 1n) }), ADDR.A)), "score_mismatch @12"],
    ["M-2 the line of an address of the eve omitted", run(f.steps, new Map([[11, linesOf(f.steps, 11).filter((l) => l.address !== ADDR.B)]])), "line_missing @12"],
    ["M-3 lines reordered, the root recomputed and signed", run(f.steps, new Map([[11, linesOf(f.steps, 11).reverse()]])), "lines_not_sorted @12"],
    ["M-3 sorted lines under the root of another order", run(f.steps, undefined, (s) => { body(s, 11).root = rootOf(linesOf(f.steps, 11).reverse().map((l) => canonical(l))); }),
      "root_mismatch @12"],
    ["M-4 control: version 2 published, not yet in force", run(s4), "ok"],
    ["M-4 the thresholds of version 2 applied before its effective day", run(s4, new Map([[12, dayLines(DAY(9), v2.body)]])), "threshold_mismatch @13"],
    ["M-4 version 1 applied to a day before it", run(f.steps, new Map([[8, dayLines(DAY(7), body(f.steps, 9))]])), "threshold_mismatch @9"],
    ["units typed on a line, no version's threshold", run(f.steps, lines(11, (l) => ({ ...l, units: "9" }), ADDR.A)), "units_mismatch @12"],
    ["a tier typed on a line", run(f.steps, lines(11, (l) => ({ ...l, tier: 3 }), ADDR.A)), "tier_mismatch @12"],
    ["M-5 a program address scored", run(f.steps, lines(11, (l) => ({ ...l, lots: [["7000000", 2]], score: "210000000", provisional: "210000000" }), ADDR.P)),
      "program_address_scored @12"],
    ["a program address classed holder", run(f.steps, lines(11, (l) => ({ ...l, class: "holder" }), ADDR.P)), "class_mismatch @12"],
    ["M-6 prev_line_hash altered", run(f.steps, undefined, (s) => { s[5] = { ...step(s, 5), post: (l) => { l.prev_line_hash = "0".repeat(64); } }; }), "chain_broken @6"],
    ["M-7 a line signed by a key outside the keyring", run(f.steps.map((x, i) => (i === 5 ? { ...x, key: X } : x))), "key_not_in_keyring @6"],
    ["M-7 another key under the genuine key_id", run(f.steps.map((x, i) => (i === 5 ? { ...x, key: X, pre: (l: Line) => { l.key_id = keyIdOf(f.key); } } : x))),
      "signature_invalid @6"],
    ["M-8 a second snapshot for the same day", run([...f.steps, step(f.steps, 11)]), "day_not_increasing @13"],
    ["M-9 an incoherent seed", run(f.steps, undefined, (s) => { body(s, 4).seed = "0".repeat(64); }), "seed_chain_broken @5"],
    ["M-10 a pile that does not follow from the eve", run(f.steps, lines(6, (l) => ({ ...l, lots: [["5000000", 3]] }), ADDR.A)), "lots_transition_mismatch @7"],
    ["M-12 a seed revealed before the end of its day", run(f.steps, undefined, (s) => { body(s, 4).published_at = at(FIRST + 2, 12); }), "seed_revealed_early @5"],
    ["M-15 holders_count counting one more", run(f.steps, undefined, (s) => { body(s, 11).holders_count = 2; }), "holders_count_mismatch @12"],
    ["M-15 a line under the dust threshold counted", run(f.steps, lines(11, (l) => ({ ...l, holder_counted: true }), ADDR.B)), "holders_count_mismatch @12"],
    ["M-15 a program address counted", run(f.steps, lines(11, (l) => ({ ...l, holder_counted: true }), ADDR.P)), "holders_count_mismatch @12"],
    ["M-16 a lot of 29 days published as validated", run(f.steps, lines(10, (l) => ({ ...l, validated: l.provisional, provisional: "0" }), ADDR.A)), "validation_mismatch @11"],
    ["a day_value other than the smallest concordant reading", run(f.steps, lines(11, (l) => ({ ...l, day_value: "5000001" }), ADDR.A)), "line_malformed @12"],
    ["validated_total other than the sum of the lines", run(f.steps, undefined, (s) => { body(s, 11).validated_total = "0"; }), "validation_mismatch @12"],
  ];
  for (const [what, got, want] of cases) assert.equal(await got, want, what);
  for (const [what, x] of [["an extra field (closed keys, D-8 l.231)", { price: "1" }], ["another mint", { mint: "x" }], ["a status out of the list", { status: "late" }],
    ["a lines_sha256 out of form", { lines_sha256: "../timeline" }], ["a root out of form", { root: "x" }], ["decimals out of form", { decimals: -1 }],
    ["lines_count out of form", { lines_count: 1.5 }]] as const) {
    assert.equal(await run(f.steps, undefined, (s) => { Object.assign(body(s, 11), x); }), "timeline_malformed @12", what);
  }
  for (const [what, g] of [["an extra key in a line (D-7 l.221)", (l: DayLine) => ({ ...l, extra: 1 })], ["reads of another count than k_reads",
    (l: DayLine) => ({ ...l, reads: l.reads.slice(1) })], ["a reading out of form", (l: DayLine) => ({ ...l, reads: ["x", ...l.reads.slice(1)] })],
    ["a class out of the list", (l: DayLine) => ({ ...l, class: "pool" })]] as const) assert.equal(await run(f.steps, lines(11, g, ADDR.A)), "line_malformed @12", what);
  // served files changed under their signed names, a signed line out of canonical JSON, and the bounds (D-10 l.250)
  const tree = render(f.steps), t11 = linesOf(f.steps, 11).map((l) => `${canonical(l)}\n`).join(""), tl = tree.get("timeline.jsonl")?.toString("utf8") ?? "";
  const name11 = [...tree.keys()].find((k) => tree.get(k)?.toString("utf8") === t11) ?? "", nc = t11.replace('{"address"', '{ "address"');
  const swap = async (k: string, t: string, b: VerifyBounds = VERIFY_BOUNDS): Promise<string> => said(await check(new Map([...tree, [k, Buffer.from(t)]]), kr, null, b));
  const ncSha = createHash("sha256").update(nc).digest("hex"), ncTree = render(f.steps, undefined, (s) => { Object.assign(body(s, 11), { lines_sha256: ncSha,
    root: rootOf(nc.slice(0, -1).split("\n")) }); });
  for (const [what, got, want] of [["one value of a lines file", swap(name11, t11.replace("1500000", "1500001")), "lines_sha_mismatch @12"],
    ["one line of a lines file removed", swap(name11, t11.slice(t11.indexOf("\n") + 1)), "lines_count_mismatch @12"],
    ["a line out of canonical JSON, signed", said(await check(new Map([...ncTree, [`lines/${ncSha}.jsonl`, Buffer.from(nc)]]), kr)), "line_malformed @12"],
    ["the timeline without its final newline", swap("timeline.jsonl", tl.slice(0, -1)), "timeline_malformed @null"],
    ["a timeline line out of JSON", swap("timeline.jsonl", `x\n${tl}`), "timeline_malformed @1"], ["the served keyring out of JSON", swap("dojo/pubkey.json", "{"), "not_json @null"],
    ["the served keyring in Bell's schema", swap("dojo/pubkey.json", canonical(keyringOfKeys([f.key]))), "keyring_invalid @null"],
    ["a body over the bound", swap("timeline.jsonl", tl, { ...VERIFY_BOUNDS, MAX_BODY_BYTES: 64 }), "too_large @null"],
    ["a timeline line over the bound", swap("timeline.jsonl", tl, { ...VERIFY_BOUNDS, MAX_LINE_BYTES: 64 }), "too_large @1"]] as const) {
    assert.equal(await got, want, what);
  }
  const raw = linesOf(f.steps, 11).map((l) => canonical(l)), path = proofOf(raw, 1), root = rootOf(raw);
  checkInclusion(raw[1] ?? "", 1, raw.length, path, root);
  assert.throws(() => { checkInclusion(raw[1] ?? "", 1, raw.length, path.map((x, i) => (i === 0 ? rootOf([]) : x)), root); },
    (e: unknown) => e instanceof DojoVerifyError && e.code === "proof_invalid", "M-11 an altered inclusion path");
  seen.add("proof_invalid");
  const mere = readFileSync(join(import.meta.dirname, "..", "..", "..", "docs", "adr", "ADR-DOJO-SNAPSHOT-1.md"), "utf8");
  const line = mere.split("\n").find((l) => l.startsWith("- Codes de refus, liste ferm")) ?? "";
  const kinds = ["anchor", "snapshot", "price_version", "history", "key_rotation", "key_revocation"]; // D-8 l.231: kinds, not codes
  const d10 = [...line.matchAll(/`([a-z_]+)`/g)].map((m) => m[1] ?? "").filter((c) => !kinds.includes(c));
  assert.deepEqual([...DOJO_VERIFY_REFUSALS], d10, "the closed list of D-10, read from the mere, in its order");
  for (const r of seen) assert.ok(d10.includes(r), `${r}: a code of D-10`);
});
