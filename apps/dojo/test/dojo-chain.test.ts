// MONARK Dojo -- PR-1b-1 T-5 oracles (ADR-DOJO-SNAPSHOT-1 section 6 PR-1b-1 l.370, l.372, l.391; D-8 l.227-229; D-10 l.248):
// the walker against Bell's on a renamed corpus, then one test per invariant of the walker. Every timeline is signed at run
// time by helpers/dojo-fixture.ts; the expected verdicts are written from the mere, never read from the walker. No network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { KeyObject } from "node:crypto";
import { keyIdOf, keyringOf, trustOf, walkTimeline, type Trust } from "../../bell/scripts/bell-chain.mjs";
import { DOJO_TIMELINE_SCHEMA as S, DOJO_WALK_REASONS, walkDojoTimeline } from "../scripts/dojo-chain.mjs";
import * as chain from "../scripts/dojo-chain.mjs"; // lot DEPTH-BOUND: the new exports through the namespace, so the file loads at base
import { ANCHOR_DAY, DAY1, DAY_MS, FIRST, anchorBody, at, dateOf, dojoFixture, historyBody, newKey, renamedPair, seal, seedChain, servedTree,
  snapshotBody, trustOfKeys, versionBody, type Ev, type Fixture, type Line, type Step } from "./helpers/dojo-fixture.ts";

type Verdict = { ok: true } | { ok: false; seq: number; reason: string };
const OK: Verdict = { ok: true };
const refused = (seq: number, reason: string): Verdict => ({ ok: false, seq, reason });
const verdict = (r: { ok: true } | { ok: false; seq: number; reason: string }): Verdict => (r.ok ? OK : refused(r.seq, r.reason));
const seen = new Set<string>(); // every reason the Dojo walk gave in this file (closed-list test, last)
function walk(lines: readonly Line[], trust: Trust): Verdict {
  const r = walkDojoTimeline(lines, trust);
  if (!r.ok) seen.add(r.reason);
  return verdict(r);
}
/** The fixture's 12 steps (0 anchor, 1 history, 2-8 read days 1-7, 9 price_version, 10-11 read days 8-9), copied, edited,
 *  sealed and walked under the fixture's trust. */
function run(f: Fixture, edit: (s: Step[]) => void): Verdict {
  const s = f.steps.map((x) => ({ ...x, body: { ...x.body } }));
  edit(s);
  return walk(seal(S, s), f.trust);
}
function body(s: readonly Step[], i: number): Line {
  const x = s[i];
  if (x === undefined) throw new Error(`no step ${String(i)}`);
  return x.body;
}

// ---- D-8 l.229: same verdict (ok, seq, reason) as Bell's walk on the same event scripts, renamed; adjacency: each line of the
// "before" cases fails two consecutive checks of Bell's order (bell-chain.mjs:131-151), and the earlier one is the reason ----
test("dojo_walk_matches_bell_walk_on_renamed_corpus", () => {
  const [K1, K2, K3, X, Y] = [newKey(), newKey(), newKey(), newKey(), newKey()] as const;
  const trust = trustOfKeys([K1, K2, K3]), zero = "0".repeat(64), x2 = keyringOf(K2, 1).keys[0]?.jwk.x ?? "";
  const C = (by: KeyObject, hooks: Pick<Ev, "pre" | "post"> = {}): Ev => ({ t: "content", by, ...hooks });
  const cases: Array<[string, Ev[], Verdict]> = [
    ["one key", [C(K1), C(K1), C(K1)], OK],
    ["cross-signed rotation", [C(K1), { t: "rotate", by: K1, to: K2 }, C(K2)], OK],
    ["lost key", [C(K1), { t: "lose", by: K2, to: K2 }, C(K2)], OK],
    ["revocation", [C(K1), C(K1), { t: "rotate", by: K1, to: K2 }, { t: "revoke", by: K2, revoke: [keyIdOf(K1), 2] }, C(K2)], OK],
    // each condition of Bell's walk decides once
    ["schema", [C(K1), C(K1, { post: (l) => { l.schema = "x"; } })], refused(2, "timeline_malformed")],
    ["unknown kind", [C(K1), C(K1, { post: (l) => { l.kind = "unknown"; } })], refused(2, "timeline_malformed")],
    ["continuity other than broken", [C(K1), { t: "rotate", by: K1, to: K2, pre: (l) => { l.continuity = "x"; } }], refused(2, "rotation_malformed")],
    ["new key not a JWK, right x", [C(K1), { t: "rotate", by: K1, to: K2, pre: (l) => { l.new_key = { kty: "RSA", crv: "Ed25519", x: x2 }; } }],
      refused(2, "rotation_malformed")],
    ["rotation to the active key", [C(K1), { t: "rotate", by: K1, to: K1 }], refused(2, "rotation_malformed")],
    ["rotation back to a former key", [C(K1), { t: "rotate", by: K1, to: K2 }, { t: "rotate", by: K2, to: K1 }], refused(3, "rotation_malformed")],
    ["broken rotation signed by another key", [C(K1), { t: "lose", by: K3, to: K2 }], refused(2, "key_not_active")],
    ["revocation of a key never rotated away", [C(K1), { t: "revoke", by: K1, revoke: [keyIdOf(K2), 1] }], refused(2, "revocation_malformed")],
    ...[0, 4, 1.5].map((from): [string, Ev[], Verdict] => [`revocation from seq ${String(from)}`,
      [C(K1), { t: "rotate", by: K1, to: K2 }, { t: "revoke", by: K2, revoke: [keyIdOf(K1), from] }], refused(3, "revocation_malformed")]),
    ["rotation without its second signature", [C(K1), { t: "rotate", by: K1, to: K2, post: (l) => { delete l.sig_new; } }], refused(2, "signature_invalid")],
    ["malformed before chain", [C(K1), C(K1, { post: (l) => { l.seq = 3; l.prev_line_hash = zero; } })], refused(2, "timeline_malformed")],
    ["chain before rotation key", [C(K1), { t: "rotate", by: K1, to: X, pre: (l) => { l.prev_line_hash = zero; } }], refused(2, "chain_broken")],
    ["rotation key before key", [C(K1), { t: "rotate", by: Y, to: X }], refused(2, "rotation_key_not_in_keyring")],
    ["key before signature", [C(K1), C(X, { post: (l) => { l.sig = "A".repeat(86); } })], refused(2, "key_not_in_keyring")],
    ["signature before active key", [C(K1), C(X, { pre: (l) => { l.key_id = keyIdOf(K2); } })], refused(2, "signature_invalid")],
    ["active key before rotation form", [C(K1), { t: "rotate", by: K2, to: K3, pre: (l) => { l.new_key = { kty: "x" }; } }], refused(2, "key_not_active")],
    ["rotation form before its second signature", [C(K1), { t: "rotate", by: K1, to: K2, pre: (l) => { l.new_key_id = keyIdOf(K3); },
      post: (l) => { l.sig_new = l.sig; } }], refused(2, "rotation_malformed")],
    ["active key before revocation form", [C(K1), { t: "rotate", by: K1, to: K2 }, { t: "revoke", by: K1, revoke: [keyIdOf(K3), 1] }], refused(3, "key_not_active")],
    ["active key before the Dojo checks", [C(K1), C(K1), C(K2, { pre: (l) => { delete l.seed; } })], refused(3, "key_not_active")],
  ];
  for (const [name, events, want] of cases) {
    const { bell, dojo } = renamedPair(events);
    const b = walkTimeline(bell, trust), d = walkDojoTimeline(dojo, trust);
    if (!d.ok) seen.add(d.reason);
    assert.deepEqual(verdict(b), want, `${name}: Bell's walk`);
    assert.deepEqual(verdict(d), verdict(b), `${name}: same verdict`);
    if (b.ok && d.ok) assert.deepEqual([d.active, d.voided, d.breaks], [b.active, b.voided, b.breaks], `${name}: same key schedule`);
  }
  assert.equal(new Set(cases.flatMap(([, , w]) => (w.ok ? [] : [w.reason]))).size, 8, "the corpus reaches the eight reasons of Bell's walk");
  for (const raw of [[null], [7], ["line"], [[]]]) { // lines that are not objects
    assert.deepEqual(verdict(walkDojoTimeline(raw, trust)), verdict(walkTimeline(raw, trust)), `raw ${JSON.stringify(raw)}`);
  }
  // a revocation known from the SUPPLIED keyring only (bell-chain.mjs:127): the same lines are void
  const revoked = trustOf({ schema: "bell-keyring-v1", keys: [...keyringOf(K1, 1).keys.map((k) => ({ ...k, revoked_from_seq: 2 })), ...keyringOf(K2, 1).keys] });
  assert.ok(revoked !== null, "keyring with a revocation marker");
  const { bell, dojo } = renamedPair([C(K1), C(K1), { t: "rotate", by: K1, to: K2 }, C(K2)]);
  const b = walkTimeline(bell, revoked), d = walkDojoTimeline(dojo, revoked);
  assert.deepEqual([d.ok && d.voided, b.ok && b.voided], [[2, 3], [2, 3]], "lines of K1 from seq 2 void, in both walks");
});

// ---- l.391 (third pli), D-8 l.227-228, P-36 l.589: one history line, after the anchor, before the first snapshot, its last day
// before the first read day ----
test("dojo_walk_places_history_before_the_first_snapshot", () => {
  const f = dojoFixture();
  const tree = servedTree(seal(S, f.steps), [f.key]);
  const served = (tree.get("timeline.jsonl")?.toString("utf8") ?? "").trimEnd().split("\n").map((s) => JSON.parse(s) as Line);
  const trust = trustOf(JSON.parse(tree.get("dojo/pubkey.json")?.toString("utf8") ?? "null") as unknown);
  assert.ok(trust !== null, "the served keyring is well formed");
  const r = walkDojoTimeline(served, trust);
  assert.deepEqual([r.ok, r.ok ? r.head?.seq : 0, served.length], [true, 12, 12], "the served tree walks under its served keyring");
  const h = served[1]?.history_sha256;
  assert.ok(typeof h === "string" && tree.has(`history/${h}.jsonl`), "the history line names a served file");
  const move = (s: Step[]): void => { const [x] = s.splice(1, 1); if (x !== undefined) s.splice(2, 0, x); };
  assert.deepEqual(run(f, (s) => { s.splice(1, 1); }), refused(2, "timeline_malformed"), "no history before the first snapshot");
  assert.deepEqual(run(f, move), refused(2, "timeline_malformed"), "history after the first snapshot");
  assert.deepEqual(run(f, (s) => { s.splice(2, 0, { key: f.key, body: { ...body(s, 1) } }); }), refused(3, "timeline_malformed"), "a second history line");
  assert.deepEqual(run(f, (s) => { s.splice(3, 0, { key: f.key, body: { ...body(s, 1) } }); }), refused(4, "timeline_malformed"), "a history line after the first snapshot (letter of M-K2, l.391)");
  assert.deepEqual(run(f, (s) => { body(s, 1).history_last_day = dateOf(FIRST); }), refused(3, "day_not_increasing"), "last day = first read day");
  assert.deepEqual(run(f, (s) => { body(s, 1).history_first_day = dateOf(DAY1 + 1); }), refused(2, "timeline_malformed"), "first day other than day 1");
  assert.deepEqual(run(f, (s) => { body(s, 1).history_last_day = dateOf(DAY1 - 1); }), refused(2, "timeline_malformed"), "last day before day 1");
  const one = seedChain("dojo-one-day-history", 40); // SYNTHETIC: anchor on day 1, a one-day history, first read day = day 2
  assert.deepEqual(walk(seal(S, [{ key: f.key, body: anchorBody(one(0), 40, DAY1) }, { key: f.key, body: historyBody(DAY1) }, { key: f.key, body: snapshotBody(DAY1 + 1, one(1), null) }]), f.trust), OK, "a one-day history");
});

// ---- D-8 l.228: the first line is an anchor. Bell's walk accepts an empty timeline and a timeline opened by a well-formed key
// line: the two declared exclusions of the renamed corpus (G1 journal Q-7) ----
test("dojo_walk_requires_the_anchor_first", () => {
  const f = dojoFixture();
  assert.deepEqual(run(f, () => undefined), OK, "the fixture as built");
  assert.deepEqual(walk([], f.trust), refused(1, "anchor_missing"), "an empty timeline");
  assert.deepEqual(run(f, (s) => { s.splice(0, 1); s.length = 1; }), refused(1, "anchor_missing"), "a history line first");
  assert.deepEqual(run(f, (s) => { s.splice(0, 2); }), refused(1, "anchor_missing"), "a snapshot first");
  const [R1, R2] = [newKey(), newKey()], r12 = trustOfKeys([R1, R2]); // a well-formed key rotation first (declared divergence, Q-7)
  const rp = renamedPair([{ t: "rotate", by: R1, to: R2 }, { t: "content", by: R2 }, { t: "content", by: R2 }, { t: "content", by: R2 }]);
  assert.deepEqual([verdict(walkTimeline(rp.bell, r12)), walk(rp.dojo, r12)], [OK, refused(1, "anchor_missing")], "a key rotation first: Bell's walk accepts it");
});

// ---- Q-4 (l.858 (c)): price_window_days = 7, the seven daily values of D-17 l.287 that medianOfSeven fixes ----
test("dojo_walk_refuses_an_anchor_price_window_other_than_seven", () => {
  const f = dojoFixture();
  for (const w of [6, 8, 0, "7", null]) {
    assert.deepEqual(run(f, (s) => { body(s, 0).price_window_days = w; }), refused(1, "timeline_malformed"), `price_window_days ${String(w)}`);
  }
  assert.deepEqual(run(f, (s) => { delete body(s, 0).price_window_days; }), refused(1, "timeline_malformed"), "absent");
});

// ---- D-8 l.227, D-3 l.171-172, D-17 l.290, l.858 (c): five tier units (1, then strictly increasing), five non-decreasing tier
// windows (the precondition of tierOf) and the dust threshold on the anchor; dust_threshold on each version ----
test("dojo_walk_anchor_carries_tier_windows_and_dust_threshold", () => {
  const f = dojoFixture();
  const anchor: Array<[string, (b: Line) => void]> = [
    ["decreasing tier windows", (b) => { b.tier_windows = [30, 30, 30, 180, 30]; }],
    ["four tier windows", (b) => { b.tier_windows = [30, 30, 30, 30]; }],
    ["a zero tier window", (b) => { b.tier_windows = [0, 30, 30, 30, 180]; }],
    ["tier units from 2", (b) => { b.tier_units = ["2", "4", "8", "16", "32"]; }],
    ["tier units not increasing", (b) => { b.tier_units = ["1", "2", "2", "8", "16"]; }],
    ["no dust threshold", (b) => { delete b.dust_threshold_microusd; }],
    ["a zero dust threshold", (b) => { b.dust_threshold_microusd = "0"; }],
  ];
  for (const [what, edit] of anchor) assert.deepEqual(run(f, (s) => { edit(body(s, 0)); }), refused(1, "timeline_malformed"), what);
  assert.deepEqual(run(f, (s) => { body(s, 0).tier_windows = [30, 30, 30, 180, 180]; }), OK, "non-decreasing, equal windows included");
  assert.deepEqual(run(f, (s) => { delete body(s, 9).dust_threshold; }), refused(10, "timeline_malformed"), "a version without dust_threshold");
  assert.deepEqual(run(f, (s) => { body(s, 9).dust_threshold = "0"; }), refused(10, "timeline_malformed"), "a zero dust_threshold");
});

// ---- D-8 l.228: day strictly increasing, and after the anchor's day (no snapshot for a day before the anchor) ----
test("dojo_walk_days_strictly_increase", () => {
  const f = dojoFixture();
  assert.deepEqual(run(f, (s) => { body(s, 3).day = dateOf(FIRST); }), refused(4, "day_not_increasing"), "the same day twice");
  assert.deepEqual(run(f, (s) => { body(s, 3).day = dateOf(FIRST - 1); }), refused(4, "day_not_increasing"), "an earlier day");
  assert.deepEqual(run(f, (s) => { body(s, 1).history_last_day = dateOf(ANCHOR_DAY - 1); body(s, 2).day = dateOf(ANCHOR_DAY); }),
    refused(3, "day_not_increasing"), "a snapshot of the anchor's day");
});

// ---- D-4 l.186, l.302 (seeds revealed late, never early): the line of day d is published at the end of day d at the earliest ----
test("dojo_walk_never_reveals_a_seed_early", () => {
  const f = dojoFixture();
  const end = (FIRST + 1) * DAY_MS;
  assert.deepEqual(run(f, (s) => { body(s, 2).published_at = new Date(end - 1).toISOString(); }), refused(3, "seed_revealed_early"), "1 ms before the end");
  assert.deepEqual(run(f, (s) => { body(s, 2).published_at = new Date(end).toISOString(); }), OK, "at the end of the day");
  assert.deepEqual(run(f, (s) => { body(s, 2).published_at = at(FIRST, 12); }), refused(3, "seed_revealed_early"), "during the day");
  assert.deepEqual(run(f, (s) => { body(s, 3).published_at = at(FIRST + 1, 12); }), refused(4, "seed_revealed_early"), "a later snapshot, during its day");
  assert.deepEqual(run(f, (s) => { body(s, 2).published_at = "2026-10-03T01:00:00Z"; }), refused(3, "timeline_malformed"), "not the toISOString form");
});

// ---- D-4 l.186: H^j(seed) = the previous revealed seed, j = the gap in days, the anchor's seed first, within the anchor's
// horizon; a new anchor (horizon spent) restarts the chain from its own day (G1 journal Q-2) ----
test("dojo_walk_chains_the_seeds", () => {
  const f = dojoFixture();
  const flip = (h: unknown): string => (typeof h === "string" ? (h.startsWith("0") ? "1" : "0") + h.slice(1) : "");
  assert.deepEqual(run(f, (s) => { body(s, 4).seed = flip(body(s, 4).seed); }), refused(5, "seed_chain_broken"), "one altered seed");
  assert.deepEqual(run(f, (s) => { body(s, 3).seed = f.seed(1); }), refused(4, "seed_chain_broken"), "the previous seed replayed");
  assert.deepEqual(run(f, (s) => { s.splice(3, 1); }), OK, "a day without a line: H^2 over the gap");
  const short = dojoFixture(5, 40); // horizon 5 declared, chain of 40: the seeds of offsets 6.. exist but lie beyond the horizon
  assert.deepEqual(run(short, (s) => { s.length = 7; }), OK, "offset 5, the horizon");
  assert.deepEqual(run(short, () => undefined), refused(8, "seed_chain_broken"), "offset 6, beyond the horizon");
  const other = seedChain("dojo-fixture-seed-2", 40);
  const reanchor = (seed: string) => (s: Step[]): void => {
    s.splice(5, 7, { key: f.key, body: anchorBody(other(0), 40, ANCHOR_DAY + 4) }, { key: f.key, body: snapshotBody(ANCHOR_DAY + 5, seed, null) });
  };
  assert.deepEqual(run(f, reanchor(other(1))), OK, "a new anchor restarts the chain from its day");
  assert.deepEqual(run(f, reanchor(f.seed(5))), refused(7, "seed_chain_broken"), "the old chain after a new anchor");
});

// ---- D-8 l.228, D-17 l.287-288 (form and order only; the median is the verifier's, PR-1b-2): version numbers and effective days
// strictly increasing, seven daily values per series ----
test("dojo_walk_price_versions_increase_with_seven_values", () => {
  const f = dojoFixture();
  const add = (v: number, windowFirst: number) => (s: Step[]): void => { s.push({ key: f.key, body: versionBody(v, windowFirst, at(FIRST + 9, 2)) }); };
  assert.deepEqual(run(f, add(2, FIRST + 2)), OK, "version 2, effect after version 1's");
  assert.deepEqual(run(f, add(1, FIRST + 2)), refused(13, "timeline_malformed"), "the same number again");
  assert.deepEqual(run(f, add(2, FIRST)), refused(13, "timeline_malformed"), "an effective day not after the previous one");
  assert.deepEqual(run(f, (s) => { add(2, FIRST + 2)(s); add(2, FIRST + 3)(s); }), refused(14, "timeline_malformed"), "the number of the last version again");
  for (const k of ["pool_price_daily", "usd_per_sol_daily"]) {
    assert.deepEqual(run(f, (s) => { const b = body(s, 9); b[k] = (b[k] as unknown[]).slice(1); }), refused(10, "timeline_malformed"), `six values in ${k}`);
  }
});

// ---- D-17 l.288 (effect the day after the window), D-3 l.175 (never applied to a past day): the effective day follows the
// window's last day (first + 7 - 1 at the earliest: the line carries the first day only, G1 journal Q-5) and every published day ----
test("dojo_walk_price_version_takes_effect_after_its_window", () => {
  const f = dojoFixture();
  assert.deepEqual(run(f, (s) => { body(s, 9).effective_day = dateOf(FIRST + 6); }), refused(10, "price_version_mismatch"), "effect on the window's last day");
  assert.deepEqual(run(f, (s) => { body(s, 9).published_at = at(FIRST + 6, 23.5); }), refused(10, "price_version_mismatch"), "published before its window ends (Q-6)");
  assert.deepEqual(run(f, (s) => { body(s, 9).published_at = at(FIRST + 7, 0); }), OK, "published at its window's end");
  assert.deepEqual(run(f, (s) => { body(s, 9).published_at = dateOf(FIRST + 7); }), refused(10, "timeline_malformed"), "published_at out of form");
  const late = (s: Step[]): void => {
    const [v] = s.splice(9, 1);
    Object.assign(body(s, 9), { price_version: null, holders_count: null });
    if (v !== undefined) s.splice(10, 0, v);
  };
  assert.deepEqual(run(f, late), refused(11, "version_not_in_force"), "published after the snapshot of its effective day");
});

// ---- D-3 l.175, D-17 l.289 (nothing converted before the first version): a snapshot names the version in force on its day ----
test("dojo_walk_snapshot_names_the_version_in_force", () => {
  const f = dojoFixture();
  assert.deepEqual(run(f, (s) => { body(s, 10).price_version = null; }), refused(11, "version_not_in_force"), "null on the effective day");
  assert.deepEqual(run(f, (s) => { body(s, 10).price_version = 2; }), refused(11, "version_not_in_force"), "a version never published");
  assert.deepEqual(run(f, (s) => { body(s, 8).price_version = 1; }), refused(9, "version_not_in_force"), "a version not yet published");
  const early = (s: Step[]): void => { const [v] = s.splice(9, 1); if (v !== undefined) s.splice(8, 0, v); };
  assert.deepEqual(run(f, early), refused(9, "price_version_mismatch"), "published before the snapshot of its window's last day (Q-6 of PR-1b-3)");
  assert.deepEqual(run(f, (s) => { body(s, 9).effective_day = dateOf(FIRST + 8); }), refused(11, "version_not_in_force"), "named before its effective day");
  const v2 = (named: number) => (s: Step[]): void => { // version 2 (effect on read day 10), then the snapshot of read day 10
    s.push({ key: f.key, body: versionBody(2, FIRST + 2, at(FIRST + 9, 2)) }, { key: f.key, body: snapshotBody(FIRST + 9, f.seed(10), named) }); };
  assert.deepEqual(run(f, v2(2)), OK, "version 2 from its effective day");
  assert.deepEqual(run(f, v2(1)), refused(14, "version_not_in_force"), "version 1 after version 2's effective day (in force until the next)");
});

// ---- D-8 l.227, G1 journal Q-4 and Q-6: a field the walker reads, out of its form, is refused at its line (timeline_malformed) ----
test("dojo_walk_refuses_malformed_fields", () => {
  const f = dojoFixture(); // "2026-09-31": Date.parse reads it as 2026-10-01, the fixture's own last history day
  const cases: Array<[number, string, unknown]> = [[0, "seed_anchor", "zz"], [0, "mint", ""], [1, "history_root", "zz"], [1, "history_sha256", "zz"],
    [1, "history_lines_count", -1], [1, "history_last_day", "2026-09-31"], [2, "seed", f.seed(1).toUpperCase()], [9, "threshold_unit", "0"]];
  for (const [i, k, x] of cases) assert.deepEqual(run(f, (s) => { body(s, i)[k] = x; }), refused(i + 1, "timeline_malformed"), `${k} ${String(x)}`);
  for (const [k, v] of [[255, OK], [256, refused(1, "timeline_malformed")]] as const) assert.deepEqual(run(f, (s) => { body(s, 0).k_reads = k; }), v, `K = ${String(k)} (Q-9)`);
});

// ---- PR-1b-3 (ADR-DOJO-PR-2 D-5 l.154, D-8 l.192; M-K3): the anchor carries read_rule, eight closed keys, its scheme, offset, tolerance
// and freshness fixed, its hash and key in lowercase hexadecimal of 32 and 96 bytes; else timeline_malformed, detail read_rule. An anchor
// without it (the form of PR-1b-2) is refused: no anchor line is published before PR-1b-3 (ADR-DOJO-PR-2 D-1 l.117) ----
test("dojo_walk_requires_the_read_rule", () => {
  const f = dojoFixture();
  const said = (edit: (s: Step[]) => void): string => {
    const s = f.steps.map((x) => ({ ...x, body: structuredClone(x.body) }));
    edit(s);
    const r = walkDojoTimeline(seal(S, s), f.trust);
    if (!r.ok) seen.add(r.reason);
    return r.ok ? "ok" : `${r.reason} @${String(r.seq)} ${String(r.detail)}`;
  };
  const rr = (g: (r: Line) => void) => (s: Step[]): void => { g(body(s, 0).read_rule as Line); };
  const keys = Object.keys(body(f.steps, 0).read_rule as Line);
  assert.equal(said(() => undefined), "ok");
  assert.equal(keys.length, 8);
  const cases: Array<[string, (s: Step[]) => void]> = [["absent", (s) => { delete body(s, 0).read_rule; }], ["null", (s) => { body(s, 0).read_rule = null; }],
    ...keys.map((k): [string, (s: Step[]) => void] => [`without ${k}`, rr((r) => { delete r[k]; })]), ["an extra key", rr((r) => { r.beacon_round = 1; })],
    ["another scheme", rr((r) => { r.beacon_scheme = "bls-unchained-on-g1"; })], ["offset 899", rr((r) => { r.read_offset_s = 899; })],
    ["offset as text", rr((r) => { r.read_offset_s = "900"; })], ["tolerance 601", rr((r) => { r.read_tolerance_s = 601; })],
    ["freshness 166", rr((r) => { r.sol_usd_max_age_s = 166; })], ["period 0", rr((r) => { r.beacon_period = 0; })],
    ["genesis -1", rr((r) => { r.beacon_genesis_time = -1; })], ["genesis 1.5", rr((r) => { r.beacon_genesis_time = 1.5; })],
    ["a key of 95 bytes", rr((r) => { r.beacon_public_key = String(r.beacon_public_key).slice(2); })],
    ["a key in capitals", rr((r) => { r.beacon_public_key = String(r.beacon_public_key).toUpperCase(); })],
    ["a hash of 31 bytes", rr((r) => { r.beacon_chain_hash = String(r.beacon_chain_hash).slice(2); })]];
  for (const [what, edit] of cases) assert.equal(said(edit), "timeline_malformed @1 read_rule", what);
  const other = seedChain("dojo-fixture-seed-2", 40), second = anchorBody(other(0), 40, ANCHOR_DAY + 4);
  delete second.read_rule;
  assert.equal(said((s) => { s.splice(5, 7, { key: f.key, body: second }, { key: f.key, body: snapshotBody(ANCHOR_DAY + 5, other(1), null) }); }),
    "timeline_malformed @6 read_rule", "a new anchor without read_rule");
});

// ---- D-10 l.248: the walker's reasons are codes of the closed list, read from the mere (never retyped; kinds are not codes),
// plus rotation_key_not_in_keyring (Bell's walk, bell-chain.mjs:134; admitted at the mere's eighth pli, G1 journal Q-1); each reached above ----
test("dojo_walk_reasons_are_the_closed_list", () => {
  const mere = readFileSync(join(import.meta.dirname, "..", "..", "..", "docs", "adr", "ADR-DOJO-SNAPSHOT-1.md"), "utf8");
  const line = mere.split("\n").find((l) => l.startsWith("- Codes de refus, liste ferm")) ?? "";
  const kinds = ["anchor", "snapshot", "price_version", "history", "key_rotation", "key_revocation"]; // D-8 l.227: kinds, not codes
  const d10 = new Set([...line.matchAll(/`([a-z_]+)`/g)].map((m) => m[1] ?? "").filter((c) => !kinds.includes(c)));
  assert.ok(d10.has("insecure_url") && d10.has("history_transition_mismatch") && d10.size >= 44, "D-10 read from the mere");
  for (const r of DOJO_WALK_REASONS) assert.ok(d10.has(r), `${r}: in D-10 (l.252 since the eighth pli, Q-1)`);
  assert.deepEqual([...seen].sort(), [...DOJO_WALK_REASONS].sort(), "the tests above reached every reason, and no other");
});

// ---- D-8 l.228, P-15 l.594: dojo-chain.mjs imports node:crypto and, from bell-chain.mjs, the closed list only; no network and
// no dynamic load (motif of apps/bell/test/bell-publish-chain.test.ts:96-108) ----
test("dojo_walk_imports_the_closed_list", () => {
  const text = readFileSync(join(import.meta.dirname, "..", "scripts", "dojo-chain.mjs"), "utf8");
  assert.deepEqual([...text.matchAll(/\b(?:from|import)\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]), ["node:crypto", "../../bell/scripts/bell-chain.mjs"]);
  const names = (/import \{([^}]*)\} from "\.\.\/\.\.\/bell\/scripts\/bell-chain\.mjs";/.exec(text)?.[1] ?? "").split(",").map((x) => x.trim());
  const p15 = new Set(["canonical", "lineHash", "verifyLine", "trustOf", "publicKeyOfJwk", "GENESIS"]);
  assert.ok(names.length >= 1 && names.every((n) => p15.has(n)), names.join(", "));
  for (const re of [/node:https?\b/, /node:net\b/, /node:tls\b/, /node:dns\b/, /node:fs\b/, /child_process/, /\bfetch\s*\(/, /\bimport\s*\(/, /\brequire\s*\(/]) {
    assert.equal(re.test(text), false, String(re));
  }
});

// ---- Lot DEPTH-BOUND (VERIFY-DEPTH-BOUND-1): the declared bound of a served JSON text, its one-pass reader, and the walker's own guard on the
// values it receives (from any caller, the publisher included), before any canonical; at base the walk reads the line, then refuses its signature ----
// killer: apps/dojo/scripts/dojo-chain.mjs:139 SDL "if (depthOf(l) > DOJO_MAX_DEPTH)" -> ""
test("dojo_walk_refuses_a_line_nested_past_the_bound", () => {
  assert.deepEqual([chain.DOJO_MAX_DEPTH, typeof chain.jsonDepth, typeof chain.readJson], [16, "function", "function"], "the bound and its readers");
  const nest = (k: number): unknown => { // k nested arrays, built without recursion
    let v: unknown = [];
    for (let i = 1; i < k; i++) v = [v];
    return v;
  };
  const f = dojoFixture(), lines = seal(S, f.steps), deep = (k: number): Line[] => lines.map((l, i) => (i === 11 ? { ...l, deep: nest(k) } : l));
  assert.deepEqual(walk(deep(15), f.trust), refused(12, "signature_invalid"), "a line at the bound (16): walked, then refused by its signature");
  assert.deepEqual(walk(deep(16), f.trust), refused(12, "timeline_malformed"), "a line past it (17): refused before any canonical");
  // readJson: JSON.parse within the bound, null past it; a text that is not JSON still throws
  const text = (k: number): string => `{"deep":${"[".repeat(k)}${"]".repeat(k)}}`;
  assert.deepEqual([chain.jsonDepth(text(15)), chain.readJson(text(15)) !== null, chain.jsonDepth(text(16)), chain.readJson(text(16))], [16, true, 17, null]);
  assert.throws(() => chain.readJson("{x"), SyntaxError, "a text that is not JSON");
});
