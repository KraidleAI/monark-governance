/**
 * The online level of a class (src/aci.ts): its exact value, its region, its replay from delayed outcomes and its bound.
 * Expected values by hand; `oracle` below writes the definition again the long way (exact rationals, a fresh sort at each step).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { aciBound, aciBoundText, aciLevel, aciLevelText, aciReplay } from "../src/aci.ts";
import type { AciEvidence, AciState } from "../src/aci.ts";
import { splitQuantileShortest, splitRankRational, splitRankShortest } from "../src/l1-split.ts";
import { add, cmp, mul, q, qString, sub } from "../src/pari/index.ts";
import type { Q } from "../src/pari/index.ts";

/** x as the rational of its shortest writing, for the values these tests use. */
const exact = (x: number): Q => {
  const [whole = "", frac = ""] = String(x).split(".");
  return q(BigInt(whole + frac), 10n ** BigInt(frac.length));
};
const inOrder = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
const ramp = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);
const ev = (gamma: number, window: number, decided: readonly number[]): AciEvidence => ({ gamma, window, decided_after: decided });
const qhatOf = (s: AciState): number => (s.region.kind === "quantile" ? s.region.qhat : assert.fail(`region ${s.region.kind}`));

/** 100 calibration scores, none deciding a signal (decided_after 0: the warm-up), then `tail`, each decided when the one before it had arrived. */
function afterWarmup(tail: readonly number[], alpha = 0.1, gamma = 0.05, nMin = 50, window = 100): AciState {
  const scores = [...ramp(100), ...tail];
  return aciReplay(scores, alpha, nMin, ev(gamma, window, [...new Array<number>(100).fill(0), ...tail.map((_, i) => 100 + i)]));
}

test("aci_exact_level_is_the_closed_form", () => {
  // A = alpha + gamma (T alpha - k), in rationals: no drift, whatever T.
  assert.equal(qString(aciLevel(0, 0, exact(0.1), exact(0.05))), "1/10");
  assert.equal(qString(aciLevel(3, 3, exact(0.1), exact(0.05))), "-7/200"); // -0.035, by hand: 0.1 - 3 x 0.045
  assert.equal(qString(aciLevel(10000, 1000, exact(0.1), exact(0.07))), "1/10"); // T alpha = k exactly
  assert.equal(qString(aciLevel(10000, 1001, exact(0.1), exact(0.07))), "3/100"); // one more miss: 0.1 - 0.07
});

test("aci_the_level_is_written_exactly", () => {
  const cases: readonly [Q, string][] = [
    [q(1n, 10n), "0.1"], [q(-7n, 200n), "-0.035"], [q(0n, 1n), "0"], [q(1n, 1n), "1"], [q(-1n, 1n), "-1"], [q(10n, 1n), "10"],
    [q(3n, 2n), "1.5"], [q(-3n, 2n), "-1.5"], [q(1n, 100n), "0.01"], [q(-1n, 100n), "-0.01"], [q(1200n, 10000n), "0.12"],
    [q(1n, 10n ** 320n), `0.${"0".repeat(319)}1`],
  ];
  for (const [level, text] of cases) assert.equal(aciLevelText(level), text);
  // No finite decimal: refused at once, however long the denominator. A level never gets there: alpha and gamma are decimals.
  for (const level of [q(1n, 3n), q(1n, 6n), q(-1n, 7n), q(1n, 15n), q(1n, 3n ** 2000n)]) {
    assert.throws(() => aciLevelText(level), RangeError);
  }
});

test("aci_the_bound_is_rounded_up_at_four_decimals", () => {
  const cases: readonly [Q, string][] = [
    [q(181n, 3000n), "0.0604"], // 0.060333...
    [q(1n, 2n), "0.5000"], [q(1n, 10000n), "0.0001"], [q(1n, 10001n), "0.0001"], [q(0n, 1n), "0.0000"], [q(1n, 1n), "1.0000"],
    [q(10001n, 10000n), "1.0001"], [q(100001n, 100000n), "1.0001"], [q(181n, 30n), "6.0334"], // 6.0333...: above 1 it says nothing, and it is still written
  ];
  for (const [bound, text] of cases) assert.equal(aciBoundText(bound), text);
  assert.throws(() => aciBoundText(q(-1n, 2n)), RangeError);
});

test("aci_before_any_step_serves_the_region_of_L1_exactly", () => {
  const scores = ramp(100);
  const s = aciReplay(scores, 0.1, 50, ev(0.05, 100, new Array<number>(100).fill(0)));
  assert.equal(qString(s.level), "1/10");
  assert.equal(s.steps, 0);
  assert.equal(s.misses, 0);
  assert.equal(s.bound, null);
  const l1 = splitQuantileShortest(scores, 0.1, 50);
  assert.ok("qhat" in l1);
  assert.equal(qhatOf(s), l1.qhat);
  assert.equal(qhatOf(s), 91); // rank ceil(101 x 0.9) = 91
  assert.deepEqual(s.window, scores);
});

test("aci_warmup_does_not_move_the_level_and_gives_no_region", () => {
  // Fewer than nMin scores, or too few for alpha: L1 has no region, so the level stays at alpha and the score only calibrates.
  const few = aciReplay(ramp(49), 0.1, 50, ev(0.05, 100, inOrder(49)));
  assert.equal(few.region.kind, "warmup");
  assert.equal(few.steps, 0);
  assert.equal(qString(few.level), "1/10");
  // nMin = 1 but alpha(n + 1) < 1 up to n = 8: rank ceil(9 x 0.9) = 9 > 8; the first region is at n = 9, as in L1.
  const tooFew = aciReplay(ramp(8), 0.1, 1, ev(0.05, 100, inOrder(8)));
  assert.equal(tooFew.region.kind, "warmup");
  assert.equal(tooFew.steps, 0);
  const first = aciReplay(ramp(9), 0.1, 1, ev(0.05, 100, inOrder(9)));
  assert.equal(first.steps, 0); // the signal decided at n = 8 had no region
  assert.equal(qhatOf(first), 9);
  // The signal decided at n = 9 is the first that moves the level.
  const next = aciReplay(ramp(10), 0.1, 1, ev(0.05, 100, inOrder(10)));
  assert.equal(next.steps, 1);
  assert.equal(next.misses, 1); // 10 > 9
  assert.equal(qString(next.level), "11/200"); // 0.055
  // A window smaller than the warm-up never serves.
  const narrow = aciReplay(ramp(200), 0.1, 50, ev(0.05, 49, inOrder(200)));
  assert.equal(narrow.region.kind, "warmup");
  assert.equal(narrow.steps, 0);
  assert.equal(narrow.window.length, 49);
});

test("aci_a_miss_widens_a_cover_narrows", () => {
  const miss = afterWarmup([1000]);
  assert.equal(miss.steps, 1);
  assert.equal(miss.misses, 1);
  assert.equal(qString(miss.level), "11/200");
  // Window: 2..100 and 1000; rank ceil(101 x 0.945) = 96, so the 96th of that order is 97. Without the miss in the window, 91 at the level alpha.
  assert.equal(qhatOf(miss), 97);
  const cover = afterWarmup([0]);
  assert.equal(cover.misses, 0);
  assert.equal(qString(cover.level), "21/200"); // 0.105
  // Window: 0, 2..100; rank ceil(101 x 0.895) = 91: the 91st of 0, 2, 3, ... is 91.
  assert.equal(qhatOf(cover), 91);
  assert.equal(miss.bound === null, false);
});

test("aci_three_misses_give_the_whole_line_and_nine_covers_reopen", () => {
  // alpha 0.1, gamma 0.05: 0.1, 0.055, 0.01, -0.035: three misses in a row, at n = 100.
  const two = afterWarmup([1000, 1000]);
  assert.equal(qString(two.level), "1/100");
  assert.equal(two.region.kind, "quantile"); // 0.01 >= 1/101: rank 100
  assert.equal(qhatOf(two), 1000);
  const three = afterWarmup([1e6, 2e6, 3e6]);
  assert.equal(qString(three.level), "-7/200");
  assert.equal(three.region.kind, "whole");
  // On the whole line nothing is missed, so each outcome raises the level by gamma alpha = 0.005; 1/101 < 0.01 takes nine covers.
  const eight = afterWarmup([1e6, 2e6, 3e6, ...new Array<number>(8).fill(1e9)]);
  assert.equal(eight.misses, 3); // a huge score on the whole line is no miss
  assert.equal(eight.noRegion, 8);
  assert.equal(qString(eight.level), "1/200");
  assert.equal(eight.region.kind, "whole");
  const nine = afterWarmup([1e6, 2e6, 3e6, ...new Array<number>(9).fill(1e9)]);
  assert.equal(qString(nine.level), "1/100");
  assert.equal(nine.region.kind, "quantile");
  assert.equal(qhatOf(nine), 1e9); // rank 100 of 100
});

test("aci_at_level_one_the_region_is_empty_and_the_next_outcome_counts_as_a_miss", () => {
  // alpha 0.5, gamma 0.9: a cover raises the level by 0.45: 0.5, 0.95, 1.4.
  const zeros = (n: number): number[] => new Array<number>(n).fill(0);
  const s = aciReplay(zeros(12), 0.5, 10, ev(0.9, 10, [...zeros(10), 10, 11]));
  assert.equal(qString(s.level), "7/5");
  assert.equal(s.region.kind, "empty");
  assert.equal(s.misses, 0);
  const next = aciReplay(zeros(13), 0.5, 10, ev(0.9, 10, [...zeros(10), 10, 11, 12]));
  assert.equal(next.misses, 1); // a score of 0 is outside an empty region
  assert.equal(next.noRegion, 1);
  assert.equal(qString(next.level), "19/20");
  assert.equal(next.region.kind, "quantile");
});

test("aci_a_delayed_outcome_is_judged_on_the_region_its_signal_got", () => {
  const scores = [...ramp(100), 95, 95, 95];
  // Three signals decided after the same 100 scores: q = 91 for each. All three miss, whatever the level did in between.
  const sameTime = aciReplay(scores, 0.1, 50, ev(0.05, 100, [...new Array<number>(100).fill(0), 100, 100, 100]));
  assert.equal(sameTime.misses, 3);
  assert.equal(sameTime.maxDelay, 2);
  // In order, each decided after the outcome before: the first misses (95 > 91), then the level has moved. Rank ceil(101 x 0.945) = 96 of
  // 2..100, 95 (the 96th is 96), and 95 is covered; so one miss, and D = 0.
  const inTurn = aciReplay(scores, 0.1, 50, ev(0.05, 100, [...new Array<number>(100).fill(0), 100, 101, 102]));
  assert.equal(inTurn.misses, 1);
  assert.equal(inTurn.maxDelay, 0);
  // The arrival order is the caller's: a later decision may resolve first.
  const crossed = aciReplay(scores, 0.1, 50, ev(0.05, 100, [...new Array<number>(100).fill(0), 100, 100, 101]));
  assert.equal(crossed.maxDelay, 1);
  // A warm-up score has no delay to count.
  assert.equal(aciReplay(ramp(100), 0.1, 50, ev(0.05, 100, new Array<number>(100).fill(0))).maxDelay, 0);
});

test("aci_the_window_keeps_the_last_scores", () => {
  const s = aciReplay([1000, ...ramp(10)], 0.5, 5, ev(0.01, 10, new Array<number>(11).fill(0)));
  assert.deepEqual(s.window, ramp(10));
  assert.equal(qhatOf(s), 6); // rank ceil(11 x 0.5) = 6, and the 1000 has left
  assert.deepEqual(aciReplay(ramp(3), 0.5, 1, ev(0.01, 10, [0, 0, 0])).window, ramp(3));
});

test("aci_bound_by_hand", () => {
  const b = (T: number, D: number, alpha: number, gamma: number) => qString(aciBound(T, D, exact(alpha), exact(gamma)));
  assert.equal(b(300, 0, 0.1, 0.05), "181/3000"); // max(0.1 + 0.045, 0.9 + 0.005) = 0.905, over 15
  assert.equal(b(300, 20, 0.1, 0.05), "209/3000"); // max(0.1 + 21 x 0.045, 0.9 + 21 x 0.005) = 1.045, over 15
  assert.equal(b(100, 0, 0.5, 0.1), "11/200"); // the two sides meet at 0.5 + 0.05, over gamma T = 10
  assert.throws(() => aciBound(0, 0, exact(0.1), exact(0.05)), RangeError);
  assert.throws(() => aciBound(1, -1, exact(0.1), exact(0.05)), RangeError);
});

/** The definition again: exact rationals, a fresh sort at each step, every threshold computed. Independent of src/aci.ts but for the L1 rank. */
function oracle(scores: readonly number[], alpha: number, nMin: number, e: AciEvidence): { level: Q; steps: number; misses: number; maxDelay: number; noRegion: number; threshold: number } {
  const A = exact(alpha), g = exact(e.gamma);
  let level = A, steps = 0, misses = 0, maxDelay = 0, noRegion = 0;
  const served: number[] = [];
  for (let i = 0; i <= scores.length; i++) {
    const w = scores.slice(Math.max(0, i - e.window), i);
    const n = w.length;
    const warm = n < nMin || splitRankShortest(n, alpha) > n;
    const p = splitRankRational(n, level.n, level.d);
    served[i] = warm ? Number.NaN : p > n ? Number.POSITIVE_INFINITY : p < 1 ? Number.NEGATIVE_INFINITY : ([...w].sort((x, y) => x - y)[p - 1] as number);
    if (i === scores.length) break;
    const d = e.decided_after[i] as number;
    const t = served[d] as number;
    if (Number.isNaN(t)) continue;
    const err = (scores[i] as number) > t;
    level = add(level, mul(g, sub(A, err ? q(1n) : q(0n))));
    steps++;
    if (err) misses++;
    if (!Number.isFinite(t)) noRegion++;
    maxDelay = Math.max(maxDelay, i - d);
  }
  return { level, steps, misses, maxDelay, noRegion, threshold: served[scores.length] as number };
}

/** A small seeded generator (mulberry32). */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Scores in regimes, with ties and zeros, and delays: each signal decided up to `maxLag` arrivals before its outcome. */
function sequence(seed: number, length: number, maxLag: number): { scores: number[]; decided: number[] } {
  const r = prng(seed);
  const scores: number[] = [], decided: number[] = [];
  let scale = 1;
  for (let i = 0; i < length; i++) {
    if (r() < 0.02) scale = [0.1, 1, 10, 100][Math.floor(r() * 4)] as number;
    const v = -Math.log(1 - r()) * scale;
    scores.push(r() < 0.1 ? 0 : r() < 0.3 ? Math.round(v) : v);
    decided.push(Math.max(0, i - Math.floor(r() * (maxLag + 1))));
  }
  return { scores, decided };
}

const CONFIGS: readonly { alpha: number; gamma: number; window: number; nMin: number; length: number; lag: number }[] = [
  { alpha: 0.1, gamma: 0.05, window: 100, nMin: 50, length: 400, lag: 0 },
  { alpha: 0.1, gamma: 0.05, window: 50, nMin: 20, length: 400, lag: 7 },
  { alpha: 0.05, gamma: 0.005, window: 200, nMin: 100, length: 500, lag: 3 },
  { alpha: 0.2, gamma: 0.3, window: 20, nMin: 5, length: 300, lag: 12 },
  { alpha: 0.5, gamma: 0.9, window: 7, nMin: 1, length: 300, lag: 2 },
  { alpha: 0.33, gamma: 0.02, window: 1000, nMin: 10, length: 300, lag: 40 },
  { alpha: 0.9, gamma: 0.5, window: 30, nMin: 1, length: 200, lag: 5 },
  { alpha: 0.01, gamma: 0.1, window: 300, nMin: 50, length: 500, lag: 1 },
];

test("aci_replay_is_the_definition", () => {
  for (const c of CONFIGS) {
    for (let seed = 1; seed <= 6; seed++) {
      const { scores, decided } = sequence(seed * 1000 + c.window, c.length, c.lag);
      // Every prefix of a short run, the full run of each: each prefix is a replay of what an earlier call saw.
      for (const end of [scores.length, Math.floor(scores.length / 2), Math.min(c.nMin + 3, scores.length)]) {
        const e = ev(c.gamma, c.window, decided.slice(0, end));
        const got = aciReplay(scores.slice(0, end), c.alpha, c.nMin, e);
        const want = oracle(scores.slice(0, end), c.alpha, c.nMin, e);
        const tag = `${JSON.stringify(c)} seed ${String(seed)} end ${String(end)}`;
        assert.equal(qString(got.level), qString(want.level), tag);
        assert.equal(got.steps, want.steps, tag);
        assert.equal(got.misses, want.misses, tag);
        assert.equal(got.maxDelay, want.maxDelay, tag);
        assert.equal(got.noRegion, want.noRegion, tag);
        const kind = Number.isNaN(want.threshold) ? "warmup" : want.threshold === Number.POSITIVE_INFINITY ? "whole" : want.threshold === Number.NEGATIVE_INFINITY ? "empty" : "quantile";
        assert.equal(got.region.kind, kind, tag);
        if (got.region.kind === "quantile") assert.equal(got.region.qhat, want.threshold, tag);
      }
    }
  }
});

/** |k/T - alpha| as an exact rational. */
const gap = (s: AciState, alpha: number): Q => {
  const d = sub(q(BigInt(s.misses), BigInt(s.steps)), exact(alpha));
  return d.n < 0n ? q(-d.n, d.d) : d;
};

test("aci_bound_holds_on_every_sequence", () => {
  for (const c of CONFIGS) {
    for (let seed = 1; seed <= 6; seed++) {
      const { scores, decided } = sequence(seed * 77 + c.nMin, c.length, c.lag);
      const s = aciReplay(scores, c.alpha, c.nMin, ev(c.gamma, c.window, decided));
      assert.ok(s.bound !== null);
      assert.equal(cmp(gap(s, c.alpha), s.bound), -1, `${JSON.stringify(c)} seed ${String(seed)}`);
    }
  }
});

test("aci_bound_holds_on_the_extreme_sequences", () => {
  // A score above all the others misses whenever a finite region allows it; a score of 0 never misses a region that is not empty.
  for (const { alpha, gamma, window, nMin } of [{ alpha: 0.1, gamma: 0.05, window: 100, nMin: 50 }, { alpha: 0.5, gamma: 0.3, window: 10, nMin: 1 }, { alpha: 0.05, gamma: 0.02, window: 50, nMin: 19 }]) {
    for (const mode of ["always-miss", "never-miss", "alternate"] as const) {
      const scores = Array.from({ length: 300 }, (_, i) => (mode === "always-miss" || (mode === "alternate" && i % 2 === 0) ? 1e6 + i : 0));
      const s = aciReplay(scores, alpha, nMin, ev(gamma, window, inOrder(300)));
      assert.ok(s.bound !== null);
      assert.equal(cmp(gap(s, alpha), s.bound), -1, `${mode} ${String(alpha)}`);
    }
  }
});

test("aci_the_miss_rate_of_an_always_missing_stream_is_held_at_alpha", () => {
  // Scores always above the window: a miss whenever a finite region exists; the whole line stops them, so k/T stays near alpha, within the bound.
  const scores = Array.from({ length: 2000 }, (_, i) => 1e6 + i);
  const s = aciReplay(scores, 0.1, 50, ev(0.05, 100, inOrder(2000)));
  assert.ok(s.noRegion > s.misses); // most steps are spent on the whole line: this is what the bound counts as covered
  assert.ok(Math.abs(s.misses / s.steps - 0.1) < 0.01);
});

test("aci_the_delay_is_in_the_bound", () => {
  // Forty signals decided at the same moment, all missed: k/T = 1. The bound without D, 0.905/2 = 0.4525, would be false; with D = 39 it holds.
  const scores = [...ramp(100), ...new Array<number>(40).fill(1e6)];
  const s = aciReplay(scores, 0.1, 50, ev(0.05, 100, [...new Array<number>(100).fill(0), ...new Array<number>(40).fill(100)]));
  assert.equal(s.steps, 40);
  assert.equal(s.misses, 40);
  assert.equal(s.maxDelay, 39);
  assert.ok(s.bound !== null);
  assert.equal(cmp(gap(s, 0.1), s.bound), -1);
  assert.equal(cmp(gap(s, 0.1), aciBound(40, 0, exact(0.1), exact(0.05))), 1);
});

test("aci_the_level_stays_in_its_band", () => {
  // -(D + 1) gamma (1 - alpha) < A < 1 + (D + 1) gamma alpha: the lemma behind the bound, on the sequences above and for each prefix.
  const c = { alpha: 0.2, gamma: 0.3, window: 20, nMin: 5 };
  for (let seed = 1; seed <= 10; seed++) {
    const { scores, decided } = sequence(seed, 200, 6);
    for (let end = 0; end <= scores.length; end += 7) {
      const s = aciReplay(scores.slice(0, end), c.alpha, c.nMin, ev(c.gamma, c.window, decided.slice(0, end)));
      const D1 = q(BigInt(s.maxDelay + 1));
      const low = mul(mul(D1, exact(c.gamma)), sub(exact(c.alpha), q(1n))); // -(D + 1) gamma (1 - alpha)
      const high = add(q(1n), mul(mul(D1, exact(c.gamma)), exact(c.alpha)));
      assert.equal(cmp(s.level, low), 1);
      assert.equal(cmp(s.level, high), -1);
    }
  }
});

test("aci_refusals", () => {
  const good = ev(0.05, 10, [0, 0, 0]);
  const scores = [1, 2, 3];
  assert.doesNotThrow(() => aciReplay(scores, 0.1, 1, good));
  for (const [what, fn] of [
    ["alpha 0", () => aciReplay(scores, 0, 1, good)],
    ["alpha 1", () => aciReplay(scores, 1, 1, good)],
    ["alpha NaN", () => aciReplay(scores, Number.NaN, 1, good)],
    ["nMin 0", () => aciReplay(scores, 0.1, 0, good)],
    ["nMin 1.5", () => aciReplay(scores, 0.1, 1.5, good)],
    ["gamma 0", () => aciReplay(scores, 0.1, 1, { ...good, gamma: 0 })],
    ["gamma 1", () => aciReplay(scores, 0.1, 1, { ...good, gamma: 1 })],
    ["gamma infinite", () => aciReplay(scores, 0.1, 1, { ...good, gamma: Number.POSITIVE_INFINITY })],
    ["window 0", () => aciReplay(scores, 0.1, 1, { ...good, window: 0 })],
    ["window 1.5", () => aciReplay(scores, 0.1, 1, { ...good, window: 1.5 })],
    ["a list too short", () => aciReplay(scores, 0.1, 1, { ...good, decided_after: [0, 0] })],
    ["a list too long", () => aciReplay(scores, 0.1, 1, { ...good, decided_after: [0, 0, 0, 0] })],
    ["a decision after its own outcome", () => aciReplay(scores, 0.1, 1, { ...good, decided_after: [0, 2, 0] })],
    ["a negative count", () => aciReplay(scores, 0.1, 1, { ...good, decided_after: [0, -1, 0] })],
    ["a count that is no integer", () => aciReplay(scores, 0.1, 1, { ...good, decided_after: [0, 0.5, 0] })],
    ["a score that is NaN", () => aciReplay([1, Number.NaN, 3], 0.1, 1, good)],
    ["a score that is infinite", () => aciReplay([1, Number.POSITIVE_INFINITY, 3], 0.1, 1, good)],
  ] as const) {
    assert.throws(fn, RangeError, what);
  }
});

test("aci_a_value_that_cannot_be_written_is_refused_like_any_other", () => {
  // Its own toString: String() would throw first, inside the message of the refusal.
  const hostile = JSON.parse('{"toString":1,"valueOf":1}') as number;
  const fine = ev(0.05, 3, [0, 0]);
  const cases: readonly [AciEvidence, RegExp][] = [
    [{ ...fine, gamma: hostile }, /gamma object is not/],
    [{ ...fine, window: hostile }, /window object is not/],
    [{ ...fine, decided_after: [hostile, 0] }, /decided_after\[0\] = object is not/],
    [{ ...fine, gamma: Object.create(null) as number }, /gamma object is not/],
  ];
  for (const [e, message] of cases) assert.throws(() => aciReplay([1, 2], 0.5, 1, e), { name: "RangeError", message });
  assert.throws(() => aciReplay([1, 2], hostile, 1, fine), { name: "RangeError", message: /alpha object is not/ });
  assert.throws(() => aciReplay([1, 2], 0.5, hostile, fine), { name: "RangeError", message: /nMin object is not/ });
  // A number keeps its own writing.
  assert.throws(() => aciReplay([1, 2], 0.5, 1, { ...fine, gamma: 2 }), { name: "RangeError", message: /gamma 2 is not/ });
});

test("aci_evidence_of_another_shape_is_a_range_error", () => {
  const scores = [1, 2];
  const cases: readonly unknown[] = [undefined, null, 3, { gamma: 0.1, window: 3 }, { gamma: 0.1, window: 3, decided_after: { length: 2 } }, { gamma: 0.1, window: 3, decided_after: "00" }];
  for (const e of cases) assert.throws(() => aciReplay(scores, 0.5, 1, e as AciEvidence), RangeError, String(e));
  assert.throws(() => aciReplay(undefined as unknown as number[], 0.5, 1, ev(0.1, 3, [])), RangeError);
});

test("aci_the_texts_refuse_what_is_no_rational", () => {
  // Not one a replay makes: q() keeps d > 0 and reduces. By hand, d = 0 would never leave the first loop.
  for (const level of [{ n: 1n, d: 0n }, { n: 0n, d: 0n }, { n: -1n, d: 0n }, { n: 1n, d: -2n }]) assert.throws(() => aciLevelText(level), RangeError);
  for (const bound of [{ n: 1n, d: 0n }, { n: 1n, d: -2n }, { n: -1n, d: -2n }]) assert.throws(() => aciBoundText(bound), RangeError);
  assert.equal(aciLevelText({ n: 2n, d: 4n }), "0.5", "reduced first: no trailing zero");
  assert.equal(aciLevelText({ n: 10n, d: 20n }), "0.5");
  assert.equal(aciBoundText({ n: 2n, d: 4n }), "0.5000");
});

test("aci_the_closed_forms_refuse_what_the_update_cannot_write", () => {
  const a = exact(0.1), g = exact(0.05);
  for (const r of [q(0n), q(1n), q(2n), q(-1n, 2n)]) {
    assert.throws(() => aciLevel(1, 0, r, g), RangeError);
    assert.throws(() => aciLevel(1, 0, a, r), RangeError);
    assert.throws(() => aciBound(1, 0, r, g), RangeError);
    assert.throws(() => aciBound(1, 0, a, r), RangeError);
  }
  assert.throws(() => aciLevel(1, 0, { n: 1n, d: 0n }, g), RangeError);
  assert.throws(() => aciBound(1, 0, a, { n: 1n, d: -2n }), RangeError);
  // Numbers pass the compare with 0 and with d; only the check of a rational stops them before the arithmetic, which would throw a TypeError.
  assert.throws(() => aciLevel(1, 0, { n: 1, d: 10 } as unknown as typeof a, g), RangeError);
  assert.throws(() => aciBound(1, 0, a, { n: 1, d: 10 } as unknown as typeof a), RangeError);
  for (const [steps, misses] of [[-1, 0], [1.5, 0], [Number.NaN, 0], [1, -1], [1, 0.5], [1, 2], [2 ** 53, 0]] as const) {
    assert.throws(() => aciLevel(steps, misses, a, g), RangeError, `${String(steps)} ${String(misses)}`);
  }
  assert.equal(qString(aciLevel(3, 3, a, g)), "-7/200", "misses up to steps");
  assert.equal(qString(aciLevel(0, 0, a, g)), "1/10", "and no step");
});

test("aci_every_refusal_is_a_range_error_whatever_the_value", () => {
  const a = exact(0.1), g = exact(0.05);
  // No primitive conversion: the message must not ask for one.
  for (const hostile of [Object.create(null), JSON.parse('{"toString":1,"valueOf":1}')] as unknown as number[]) {
    assert.throws(() => aciLevel(hostile, 0, a, g), { name: "RangeError", message: /T object is not/ });
    assert.throws(() => aciLevel(1, hostile, a, g), { name: "RangeError", message: /k object is not/ });
    assert.throws(() => aciBound(hostile, 0, a, g), { name: "RangeError", message: /T object is not/ });
    assert.throws(() => aciBound(1, hostile, a, g), { name: "RangeError", message: /D object is not/ });
  }
  // An absent rational: checkQ reads its fields only once it is an object.
  for (const absent of [null, undefined, 1, "1/2"] as unknown as Q[]) {
    assert.throws(() => aciLevel(1, 0, absent, g), RangeError);
    assert.throws(() => aciLevel(1, 0, a, absent), RangeError);
    assert.throws(() => aciBound(1, 0, absent, g), RangeError);
    assert.throws(() => aciBound(1, 0, a, absent), RangeError);
    assert.throws(() => aciLevelText(absent), RangeError);
    assert.throws(() => aciBoundText(absent), RangeError);
  }
  // Before the first step the state has no bound: the text refuses it like anything else.
  assert.throws(() => aciBoundText(aciReplay([], 0.1, 1, ev(0.05, 5, [])).bound as Q), RangeError);
});

test("aci_a_min_count_out_of_reach_is_a_warm_up_as_on_the_split_path", () => {
  const scores = ramp(100), e = ev(0.05, 100, new Array<number>(100).fill(0));
  // An integer past 2^53 is one all the same: no window reaches it.
  for (const nMin of [2 ** 53, 1e300]) {
    const s = aciReplay(scores, 0.1, nMin, e);
    assert.deepEqual([s.region.kind, s.steps], ["warmup", 0], String(nMin));
  }
  for (const nMin of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) assert.throws(() => aciReplay(scores, 0.1, nMin, e), { name: "RangeError", message: /nMin/ }, String(nMin));
});

test("aci_a_signal_decided_before_a_region_at_alpha_is_replayed_and_not_counted", () => {
  // 140 scores, the last forty far outside. Decided at 0: always before, since nMin is at least 1. At 49: still under nMin. At 50: counted.
  const scores = [...ramp(100), ...new Array<number>(40).fill(1e6)];
  const at = (d: number): AciState => aciReplay(scores, 0.1, 50, ev(0.05, 200, [...new Array<number>(100).fill(0), ...new Array<number>(40).fill(d)]));
  for (const d of [0, 49]) {
    const s = at(d);
    assert.deepEqual([s.steps, s.misses, s.noRegion, s.maxDelay, s.bound], [0, 0, 0, 0, null], `decided after ${String(d)}`);
    assert.equal(aciLevelText(s.level), "0.1");
    assert.equal(s.window.length, 140, "they are replayed: they are in the window");
  }
  const counted = at(50);
  assert.deepEqual([counted.steps, counted.misses], [40, 40]);
  assert.equal(aciLevelText(counted.level), "-1.7");
  // The warm-up also lasts while alpha (n + 1) < 1, past nMin: at alpha 0.01, 98 scores are not enough.
  const rare = aciReplay(scores, 0.01, 1, ev(0.05, 200, [...new Array<number>(100).fill(0), ...new Array<number>(40).fill(98)]));
  assert.equal(rare.steps, 0);
});

test("aci_misses_in_flight_all_count_and_the_way_back_is_counted_in_signals", () => {
  // Fifteen signals decided on the same 100 scores all miss: 0.1 - 15 x 0.045 = -0.575, what a delay of 14 costs at gamma 0.05. Each
  // cover gives back gamma alpha = 0.005, so a miss takes (1 - alpha)/alpha = 9 covers, at any gamma, and the region reopens at 1/101.
  const flight = (covers: number, gamma = 0.05): AciState => {
    const decided = [...new Array<number>(100).fill(0), ...new Array<number>(15).fill(100), ...Array.from({ length: covers }, (_, k) => 115 + k)];
    return aciReplay([...ramp(100), ...new Array<number>(15).fill(1000), ...new Array<number>(covers).fill(1)], 0.1, 50, ev(gamma, 100, decided));
  };
  const shut = flight(0);
  assert.deepEqual([aciLevelText(shut.level), shut.steps, shut.misses, shut.maxDelay, shut.region.kind], ["-0.575", 15, 15, 14, "whole"]);
  assert.deepEqual([aciLevelText(flight(116).level), flight(116).region.kind], ["0.005", "whole"]);
  assert.deepEqual([aciLevelText(flight(117).level), flight(117).region.kind], ["0.01", "quantile"]);
  // A step divided by the delay: the same fifteen misses cost what one costs at the first step, and the level never shuts.
  const small = flight(0, 0.05 / 15);
  assert.equal(small.region.kind, "quantile");
});

test("aci_a_step_divided_by_the_delay_has_the_bound_of_as_many_levels_without_delay", () => {
  // D + 1 levels of step gamma, each with T / (D + 1) outcomes and no delay, against one level of step gamma / (D + 1) with delay D.
  const a = exact(0.1);
  for (const [T, D, gamma, step] of [[300, 4, "1/20", "1/100"], [1200, 11, "1/20", "1/240"], [600, 2, "3/10", "1/10"]] as const) {
    const parse = (s: string): Q => { const [n = "", d = ""] = s.split("/"); return q(BigInt(n), BigInt(d)); };
    assert.equal(cmp(aciBound(T, D, a, parse(step)), aciBound(T / (D + 1), 0, a, parse(gamma))), 0, `T ${String(T)} D ${String(D)}`);
  }
});

test("aci_the_L1_rank_helpers_keep_their_answers", () => {
  for (const [n, alpha, p] of [[100, 0.1, 91], [9, 0.1, 9], [8, 0.1, 9], [0, 0.5, 1], [10, 1e-7, 11], [99, 0.01, 99]] as const) {
    assert.equal(splitRankShortest(n, alpha), p);
  }
  // The rank of a level outside (0, 1), as rationals: above n below 1/(n + 1), below 1 at 1 and over.
  assert.equal(splitRankRational(100, -7n, 200n), 105); // ceil(101 x 1.035) = ceil(104.535)
  assert.equal(splitRankRational(100, 1n, 1n), 0);
  assert.equal(splitRankRational(100, 7n, 5n), -40); // ceil(101 x -0.4) = ceil(-40.4)
});
