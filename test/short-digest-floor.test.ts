// test/short-digest-floor.test.ts -- lot SHORT-DIGEST-INVERSION-1 (docs/G0-lot-short-digest-inversion-1.md sections 4.1, 5 and 10;
// decisions Q-1 to Q-10 of RECHERCHES, 2026-10-06): the exact digest floor of apps/harness/src/policy-digest-floor.ts and the publication
// gate that applies it (tableRowProblems and contentProblems of scripts/spec-publish.mjs). The oracle of every count is runsLowerTailLeq
// of @monark/hikae, run on every sequence (complete enumeration) or on sequences built with a given number of runs. Every row is
// synthetic: no registry, no series. Each test names on the lines above it the change that reddens it and one killer on production code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { runsCount, runsLowerTailLeq } from "@monark/hikae";
import { DIGEST_FLOOR_BITS, LABEL_FLAT_CAP, digestProblems, flatBounds, runsOutcomeCount } from "../apps/harness/src/policy-digest-floor.ts";
import type { Bound, RunsOutcome } from "../apps/harness/src/policy-digest-floor.ts";
import { contentProblems, tableRowProblems } from "../scripts/spec-publish.mjs";

type Bit = 0 | 1;
const OUTCOMES: readonly RunsOutcome[] = ["pass", "reject", "empty"];
const bitsOf = (x: number, n: number): Bit[] => Array.from({ length: n }, (_, i): Bit => ((x >> i) & 1 ? 1 : 0));
const ones = (x: number): number => { let c = 0; for (let v = x; v > 0; v &= v - 1) c++; return c; };
/** The outcome of runs.ts on one sequence: the oracle. */
const outcomeOf = (bits: readonly Bit[]): RunsOutcome => { const t = runsLowerTailLeq(bits, "0.05"); return t.empty ? "empty" : t.reject ? "reject" : "pass"; };
/** A sequence of `k` ones and `z` zeros with exactly r runs (2 <= r <= the most the counts allow). */
function withRuns(k: number, z: number, r: number): Bit[] {
  const first: Bit = Math.ceil(r / 2) <= k && Math.floor(r / 2) <= z ? 1 : 0, out: Bit[] = [];
  for (let i = 0; i < r; i++) {
    const s: Bit = i % 2 === 0 ? first : first === 1 ? 0 : 1, blocks = s === first ? Math.ceil(r / 2) : Math.floor(r / 2), idx = Math.floor(i / 2);
    for (let j = 0; j < (idx === blocks - 1 ? (s === 1 ? k : z) - (blocks - 1) : 1); j++) out.push(s);
  }
  assert.deepEqual([out.filter((b) => b === 1).length, out.length - k, runsCount(out)], [k, z, r], `withRuns(${String(k)}, ${String(z)}, ${String(r)})`);
  return out;
}
const DIGESTS = { scores_sha256: "a".repeat(64), aux_sha256: "b".repeat(64), series_sha256: "c".repeat(64) };
/** A sign-set row of wave 1, up side, n 60 and 2 misses at qhat 1, both digests published; `o` overrides. */
const signSet = (o: Record<string, unknown> = {}): Record<string, unknown> => ({ cell_key: "kata:k-v1@venue/AAAUSDT/1h/up-b1", region_rule: "sign-set", aux_seq: "label", side: "up",
  n: 60, p_served: 40, misses: 2, qhat: 1, runs_miss: "empty", runs_aux: "pass", runs_level: "0.05", source: { wave: 1 }, recompute: null, ...DIGESTS, ...o });
const band = (o: Record<string, unknown> = {}): Record<string, unknown> => ({ cell_key: "kata:b-v1@venue/AAAUSDT/1h/b0", region_rule: "scaled-band", aux_seq: "score", side: null,
  n: 1092, p_served: 1000, misses: 9, qhat: 2.5, runs_miss: "pass", runs_aux: "pass", runs_level: "0.05", source: { wave: 1 }, recompute: null, ...DIGESTS, aux_sha256: DIGESTS.scores_sha256, ...o });
/** The short_digest refusals of a one-row table, each read as "<cell_key> (<reasons>)", through the publication gate. */
const why = (row: Record<string, unknown>, fixture = false): string[] =>
  tableRowProblems({ class: { task_class: "aaa-dir-1h" }, rows: [row] }, fixture).map((p) => `${p.code} ${p.detail.replace(/^.*: /, "")}`);
const refused = (row: Record<string, unknown>, reasons: string): string[] => [`short_digest ${String(row.cell_key)} (${reasons})`];

// reddened by: a term of the closed form, the level or the comparator of runsOutcomeCount drifting from runs.ts (G0 section 5)
// killer: apps/harness/src/policy-digest-floor.ts:59 CONST "2n * ca * cb" -> "ca * cb"
test("the_runs_outcome_count_matches_every_sequence_of_up_to_14_points", () => {
  for (let n = 1; n <= 14; n++) {
    const tally = Array.from({ length: n + 1 }, () => ({ pass: 0n, reject: 0n, empty: 0n }));
    for (let x = 0; x < 1 << n; x++) (tally[ones(x)] ?? assert.fail("k"))[outcomeOf(bitsOf(x, n))] += 1n;
    for (let k = 0; k <= n; k++) for (const o of OUTCOMES) {
      assert.equal(runsOutcomeCount(n, k, o), (tally[k] ?? assert.fail("k"))[o], `n ${String(n)}, k ${String(k)}, ${o}`);
      assert.equal(runsOutcomeCount(n, n - k, o), runsOutcomeCount(n, k, o), "the same count with ones and zeros swapped (the labels of an up side)");
    }
  }
  assert.equal(runsOutcomeCount(14, 7, "reject") > 0n, true, "a rejected set exists at the sizes enumerated");
  for (const [n, k] of [[5, 6], [5, -1], [5.5, 2]] as const) assert.throws(() => runsOutcomeCount(n, k, "pass"), RangeError);
});

// reddened by: the level of runsOutcomeCount off the 0.05 of runs.ts, or a count off its rejection boundary at the sizes of wave 1
// killer: apps/harness/src/policy-digest-floor.ts:32 CONST "den: 20n" -> "den: 21n"
test("the_runs_outcome_count_meets_runs_ts_at_the_rejection_boundary_of_long_sequences", () => {
  for (const [n, k] of [[60, 2], [132, 64], [150, 44], [200, 6], [377, 190], [1254, 627]] as const) {
    const rejects = (r: number): boolean => outcomeOf(withRuns(k, n - k, r)) === "reject";
    let lo = 1, hi = 2 * Math.min(k, n - k) + (k === n - k ? 0 : 1); // the largest rejected number of runs lies in lo..hi (lo = 1: none)
    while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); if (rejects(mid)) lo = mid; else hi = mid - 1; }
    assert.ok(lo >= 2 && !rejects(lo + 1), `n ${String(n)}, k ${String(k)}: a rejected set, then a pass`);
    const t = runsLowerTailLeq(withRuns(k, n - k, lo), "0.05");
    if (t.empty || !t.reject) assert.fail(`n ${String(n)}, k ${String(k)}: the largest rejected number of runs is rejected`);
    assert.deepEqual([runsOutcomeCount(n, k, "reject"), runsOutcomeCount(n, k, "pass")], [t.tailNum, t.tailDen - t.tailNum], `n ${String(n)}, k ${String(k)}`);
  }
});

// reddened by: a sign-set row published under the floor, or its refusal without the bits of its digests (G0 section 5, Q-1, Q-2)
// killer: apps/harness/src/policy-digest-floor.ts:28 CONST "DIGEST_FLOOR_BITS = 128" -> "DIGEST_FLOOR_BITS = 10"
test("a_sign_set_row_under_the_floor_is_refused_by_its_bits", () => {
  const row = signSet();
  assert.deepEqual(why(row), refused(row, "scores 10.74 bits, labels 10.74 bits"), "C(60, 2) = 1770, 60 of them rejected: log2 1710");
  assert.deepEqual([why(signSet({ n: 300, misses: 150 })), DIGEST_FLOOR_BITS], [[], 128], "the digests of a row above the floor, its series digest too, are published");
  assert.deepEqual(why(signSet({ aux_sha256: null })), refused(row, "scores 10.74 bits"), "without its labels digest, the row is still refused by its scores digest");
});

// reddened by: the floor moved from 2^128 (127, 52), or the runs outcome left out of the count (a rejected outcome counted as C(n, k))
// killer: apps/harness/src/policy-digest-floor.ts:61 CONST "outcome === \"reject\" ? rejected : all - rejected" -> "all"
test("the_floor_is_2_to_the_128_and_counts_the_runs_outcome", () => {
  const under = signSet({ n: 131, misses: 64 }), over = signSet({ n: 132, misses: 65 }), rejected = signSet({ n: 132, misses: 64, runs_aux: "reject" });
  assert.deepEqual(why(under), refused(under, "scores 127.05 bits, labels 127.05 bits"));
  assert.deepEqual(why(over), [], "128.06 bits");
  assert.deepEqual(why(rejected), refused(rejected, "scores 123.72 bits, labels 123.72 bits"), "C(132, 64) is 2^128.06, its rejected arrangements 2^123.72");
  assert.deepEqual(why({ ...rejected, runs_aux: "pass" }), refused(rejected, "scores 127.99 bits, labels 127.99 bits"), "the same counts, the runs check passed: the other part of C(132, 64)");
});

// reddened by: the labels of a down side counted without the flats (cap 0) or with fewer than the 34 of wave 1 (G0 section 5, Q-5)
// killer: apps/harness/src/policy-digest-floor.ts:30 CONST "LABEL_FLAT_CAP = 34" -> "LABEL_FLAT_CAP = 33"
test("a_down_side_label_digest_is_counted_over_the_flat_cap", () => {
  const down = signSet({ side: "down", n: 200, misses: 40 }), cap = signSet({ side: "down", n: 150, misses: 78 });
  assert.deepEqual(why(down), refused(down, "labels 36.24 bits"), "u = 40 - 34 = 6 label ones: N(200, 6, pass) = 2^36.24");
  assert.deepEqual([why({ ...down, side: "up" }), why({ ...down, aux_sha256: DIGESTS.scores_sha256 })], [[], []], "an up side, or equal digests (no flat): N(200, 40, pass) = 2^140.51");
  assert.deepEqual(why(cap), refused(cap, "labels 127.08 bits"), "only the 34th flat takes the labels of this row under the floor");
  assert.equal(LABEL_FLAT_CAP, 34);
});

// reddened by: the scores of a down side counted as if no flat could be (RECHERCHES Q-6: the cap covers every count of flats explicitly)
// killer: apps/harness/src/policy-digest-floor.ts:118 CONST "scores = under(b.scores, scores)" -> "scores = f > 0 ? scores : under(b.scores, scores)"
test("a_down_side_scores_digest_is_bounded_over_every_flat_count", () => {
  const row = signSet({ side: "down", n: 162, misses: 118, runs_aux: "reject" });
  assert.deepEqual(why(row), refused(row, "scores 127.88 bits"), "with one flat: C(162, 118) N(162, 117, reject) / C(162, 117) = 2^127.88");
  assert.deepEqual(why({ ...row, aux_sha256: DIGESTS.scores_sha256 }), [], "equal digests: no flat, N(162, 118, reject) = 2^128.35");
  const C = (n: number, k: number): bigint => runsOutcomeCount(n, k, "pass") + runsOutcomeCount(n, k, "reject"), x = C(162, 118) * runsOutcomeCount(162, 117, "reject");
  assert.deepEqual(flatBounds(162, 118, 1, "reject", null), { scores: [x, C(162, 117)], labels: [x, C(162, 118)] }, "the double count: scores x / C(n, m - f), labels x / C(n, m)");
});

// reddened by: a down row whose two digests differ still counted with no flat, though equal sequences have equal digests (calibrate.ts
// l.17): differing digests prove one flat at least; with no labels digest published the row says nothing on f, and f = 0 stays
// killer: apps/harness/src/policy-digest-floor.ts:111 CONST "r.aux_sha256 !== r.scores_sha256 ? 1 : 0" -> "r.aux_sha256 !== r.scores_sha256 ? 0 : 0"
test("differing_digests_on_a_down_side_count_one_flat_at_least", () => {
  const row = signSet({ side: "down", n: 548, misses: 525, runs_aux: "reject" });
  assert.deepEqual(why(row), [], "with no flat N(548, 525, reject) = 2^127.98 would be the smallest bound; from one flat on, 2^128.16 at least");
  assert.deepEqual([why({ ...row, aux_sha256: DIGESTS.scores_sha256 }), why({ ...row, aux_sha256: null })],
    [refused(row, "scores 127.98 bits, labels 127.98 bits"), refused(row, "scores 127.98 bits")], "equal digests: f = 0 alone; no labels digest: f from 0");
  const none = signSet({ side: "down", n: 300, misses: 0, qhat: 0, runs_miss: "empty", runs_aux: "empty" });
  assert.deepEqual(why(none), refused(none, "sign-set outcomes that no count of flats up to 34 admits"), "no miss, differing digests: no flat can make them differ");
});

// reddened by: the runs_miss of a down side at qhat 0 and its runs_aux counted apart once flats may lie between them (no union bound)
// killer: apps/harness/src/policy-digest-floor.ts:83 CONST "runsMiss !== null && f > 0" -> "false"
test("the_union_bound_joins_both_outcomes_of_a_down_side_at_qhat_0", () => {
  const q0 = (o: Record<string, unknown>): Record<string, unknown> => signSet({ side: "down", n: 400, misses: 150, qhat: 0, runs_miss: "pass", runs_aux: "pass", ...o });
  assert.deepEqual(why(q0({})), [], "both checks passed: x = C(n, m) N(n, u, pass) - (C(n, m) - N(n, m, pass)) C(n, u) stays far above the floor");
  assert.deepEqual([why(q0({ runs_aux: "reject" })), why(q0({ runs_miss: "reject", runs_aux: "reject" }))], [refused(q0({}), "scores -Infinity bits, labels -Infinity bits"),
    refused(q0({}), "scores -Infinity bits, labels -Infinity bits")], "a rejected check: the union bound bounds nothing for some f");
  assert.deepEqual(why(q0({ runs_miss: "reject", runs_aux: "reject", aux_sha256: DIGESTS.scores_sha256 })), [], "equal digests: both outcomes bear on the scores, N(400, 150, reject)");
  const none = "sign-set outcomes that no count of flats up to 34 admits";
  assert.deepEqual([why(q0({ runs_aux: "reject", aux_sha256: DIGESTS.scores_sha256 })), why(q0({ side: "up", runs_aux: "reject" }))], [refused(q0({}), none), refused(q0({}), none)],
    "one sequence cannot pass and reject: no flat, or an up side");
});

// reddened by: a bound of flatBounds above the compatible sequences it bounds (RECHERCHES Q-6, the measured check of G0 section 10)
// killer: apps/harness/src/policy-digest-floor.ts:84 CONST "scores: [x, allU]" -> "scores: [x, all]"
test("the_flat_bounds_hold_against_every_sequence_of_up_to_12_points", () => {
  const atMost = (count: number, [x, den]: Bound): boolean => BigInt(count) * den >= x;
  let cases = 0, flatCases = 0, unionCases = 0;
  for (let n = 1; n <= 12; n++) {
    const out = Array.from({ length: 1 << n }, (_, x) => outcomeOf(bitsOf(x, n)));
    for (let m = 0; m <= n; m++) for (let f = 0; f <= m; f++) for (const runsAux of OUTCOMES) for (const runsMiss of [null, ...OUTCOMES]) {
      const scores = new Set<number>(), labels = new Set<number>(); // the scores s (m ones, outcome runsMiss if stated), F = f of its ones, labels s - F
      for (let s = 0; s < 1 << n; s++) {
        if (ones(s) !== m || (runsMiss !== null && out[s] !== runsMiss)) continue;
        const at = Array.from({ length: n }, (_, i) => i).filter((i) => (s >> i) & 1);
        const pick = (from: number, left: number, mask: number): void => {
          if (left === 0) { if (out[s & ~mask] === runsAux) { scores.add(s); labels.add(s & ~mask); } return; }
          for (let i = from; i <= at.length - left; i++) pick(i + 1, left - 1, mask | (1 << (at[i] ?? 0)));
        };
        pick(0, f, 0);
      }
      const b = flatBounds(n, m, f, runsAux, runsMiss);
      cases++;
      if (b === null) { assert.equal(scores.size, 0, `null hides a compatible sequence: n ${String(n)}, m ${String(m)}, f ${String(f)}`); continue; }
      assert.ok(atMost(scores.size, b.scores) && atMost(labels.size, b.labels), `n ${String(n)}, m ${String(m)}, f ${String(f)}, ${runsAux}, ${String(runsMiss)}`);
      if (f > 0 && b.scores[0] > 0n) flatCases++;
      if (f > 0 && runsMiss !== null && b.scores[0] > 0n) unionCases++;
    }
  }
  assert.deepEqual([cases, flatCases > 500, unionCases > 100], [5448, true, true]);
});

// reddened by: a scaled-band row refused for its series digest or for an auxiliary digest equal to its scores, or admitted with another one
// killer: apps/harness/src/policy-digest-floor.ts:133 CONST "r.aux_sha256 === r.scores_sha256" -> "true"
test("a_band_row_publishes_its_series_digest_and_an_auxiliary_digest_equal_to_its_scores", () => {
  const row = band();
  assert.deepEqual(why(row), [], "aux_sha256 = scores_sha256 (the scores themselves, measured 40 of 40 in wave 1) and series_sha256 are published");
  assert.deepEqual([why({ ...row, aux_sha256: DIGESTS.aux_sha256 }), why({ ...row, aux_seq: "label" })], [refused(row, "aux_sha256"), refused(row, "aux_sha256")]);
  assert.deepEqual(digestProblems({ ...row, aux_sha256: null, series_sha256: null }), [], "no auxiliary or series digest: nothing to refuse");
});

// reddened by: a digest of a sequence that no rule states published on a marginal row (G0 section 4.1 points 2 and 3)
// killer: apps/harness/src/policy-digest-floor.ts:134 CONST "!signSet && !band" -> "false"
test("an_auxiliary_or_series_digest_of_an_unstated_sequence_is_refused", () => {
  const marginal = { cell_key: "liq:s1", region_rule: "upper-bound", n: 170, p_served: 160, scores_sha256: DIGESTS.scores_sha256, aux_sha256: null, series_sha256: null, recompute: null };
  assert.deepEqual([why(marginal), why({ ...marginal, aux_sha256: DIGESTS.aux_sha256 }), why({ ...marginal, series_sha256: DIGESTS.series_sha256 })],
    [[], refused(marginal, "aux_sha256"), refused(marginal, "series_sha256")]);
  assert.deepEqual(why({ ...marginal, ...DIGESTS, n: 30 }), refused(marginal, "n 30, aux_sha256, series_sha256"));
  const scoreSeq = signSet({ n: 300, misses: 150, aux_seq: "score" });
  assert.deepEqual(why(scoreSeq), refused(scoreSeq, "aux_sha256"), "a sign-set row whose auxiliary digest is not its labels");
});

// reddened by: a sign-set row of another wave or runs level, or with counts the rule cannot read, published (closed, FLAT-CAP-NEXT-WAVE-1)
// killer: apps/harness/src/policy-digest-floor.ts:107 CONST "wave !== 1 || " -> ""
test("a_sign_set_row_off_wave_1_or_with_unreadable_counts_is_refused_closed", () => {
  const ok = signSet({ n: 300, misses: 150 }), off = "sign-set off wave 1 or runs_level 0.05, no flat cap pinned (FLAT-CAP-NEXT-WAVE-1)";
  const unreadable = "sign-set counts unreadable (n, misses, qhat, runs_miss, runs_aux, side)";
  for (const o of [{ source: { wave: 2 } }, { source: null }, { runs_level: "0.1" }, { runs_level: null }]) assert.deepEqual(why({ ...ok, ...o }), refused(ok, off), JSON.stringify(o));
  for (const o of [{ misses: 301 }, { misses: -1 }, { misses: 1.5 }, { qhat: 0.5 }, { qhat: null }, { qhat: 0, runs_miss: null }, { runs_aux: "maybe" }, { side: null }])
    assert.deepEqual(why({ ...ok, ...o }), refused(ok, unreadable), JSON.stringify(o));
  assert.deepEqual([why({ ...ok, runs_aux: "empty" }), why({ ...ok, misses: 0, qhat: 0, runs_miss: "empty", runs_aux: "empty" })],
    [refused(ok, "sign-set outcomes that no count of flats up to 34 admits"), refused(ok, "scores 0.00 bits, labels 0.00 bits")], "an empty outcome: one sequence at most");
});

// reddened by: the exemption of the synthetic fixtures of the vectors file widened to the digest rule of every table (RECHERCHES Q-9)
// killer: scripts/spec-publish.mjs:294 CONST "fixture ? [] : digestProblems(r)" -> "[]"
test("the_synthetic_fixtures_of_the_vectors_file_are_exempt_from_the_digest_rule_only", () => {
  const fixture = signSet({ cell_key: "kata:k-v1@example/AAAUSDT/1h/down-b2", side: "down", n: 140, misses: 39, qhat: 0, runs_miss: "pass", p_served: 90 });
  const codes = (v: unknown): string[] => contentProblems("contract-1.1.0/vectors-1.1.0.json", "json", Buffer.from(JSON.stringify(v)), "contract-1.1.0").map((p) => p.code);
  const table = (row: Record<string, unknown>): unknown => ({ row_format: "class-policy-v2", class: { task_class: "aaa-dir-1h" }, rows: [row] });
  assert.deepEqual([codes({ synthetic_kata: { tables: [{ table: table(fixture) }] } }), codes({ other: { tables: [{ table: table(fixture) }] } })], [[], ["short_digest"]]);
  assert.deepEqual([why(fixture, true), why(fixture)], [[], refused(fixture, "scores 115.63 bits, labels 28.57 bits")], "the down-b2 fixture: its labels are 2^28.57 over the flat cap");
  assert.deepEqual(why({ ...fixture, n: 30 }, true), refused(fixture, "n 30"), "a fixture keeps the rule of 30 points");
});
