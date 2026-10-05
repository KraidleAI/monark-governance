/**
 * HIKAE engine - lot CM-3a of the chantier moteur (audit P3 E-8, E-4, E-5, E-12, E-9, E-6; ADR-CM section 3 and rule R-2).
 * Oracle: docs/adr/ADR-CM-chantier-moteur-audit-P3.md; plan docs/G0-lot-cm-3a.md; audit recherches:monark/AUDIT-P3-2026-10-01.md
 * section 2-3. Expected values come from this file (exact integer arithmetic on the test side) or from the audit and the
 * earlier lot pins (USDe k* 48 and 51, U 0.0985253; n 728 at alpha 0.45: k* 305, U 0.4499257), never read back from the
 * code under test. The new functions are read through the module namespace, so the base loads this file and reddens by
 * assertion. splitQuantile and riskControlQuantile stay unchanged (pins folded in). One killer per test.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import * as l1 from "../src/l1-split.ts";
import * as binomial from "../src/binomial.ts";
import { gate, buildVerdict, buildSetRegion } from "../src/index.ts";
import type { GateInput } from "../src/index.ts";
import type { CoverageVerdict } from "@monark/contracts";
import { USDE } from "./served-scores.ts";

type Fn = (...args: never[]) => unknown;
/** A function of the module namespace, asserted present (the base has none of the CM-3a names). */
function fn<T extends Fn>(mod: Record<string, unknown>, name: string): T {
  const f = mod[name];
  assert.equal(typeof f, "function", `exports ${name}`);
  return f as T;
}

type Split = (scores: readonly number[], alphaDec: string, nMin: number, domain?: "finite" | "band") => { qhat: number } | { reason: "under_calib" };
type Row = Record<string, unknown>;
type RowFn = (scores: readonly number[], alphaDec: string, baseDeltaDec: string, nMin: number, options?: Row) => Row;
const UNDER = { reason: "under_calib" };

/** Exact split rank ceil((n + 1)(1 - num/den)) in integer arithmetic. */
const exactRank = (n: number, num: number, den: number): number => Math.floor(((n + 1) * (den - num) + den - 1) / den);
const ranks = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);

function verdictOf(kind: "set" | "interval"): CoverageVerdict {
  return buildVerdict({
    taskClass: "t",
    method: "split",
    alpha: 0.1,
    scores: Array.from({ length: 50 }, () => 0),
    region: kind === "set" ? buildSetRegion(["up"]) : { kind: "interval", lo: 0.5, hi: 1.5 },
    qhat: kind === "set" ? 0 : 0.5,
    abstain: false,
    reason: "covered",
    residual: [],
    producedAt: "2026-09-04T00:00:00Z",
    schemaVersion: "1.0.0",
    cell: { qhatUnit: "score", scale: null, cellKey: null, policyRowSha256: null, policyTableSha256: null },
  });
}

// E-8: a NaN or an infinity in any of the six numeric fields of decide() abstains non_evaluable, on the set and on the
// interval path, with the clock open or closed; the finite inputs still COMMIT (pin). At the base, NaN reached COMMIT.
// killer: packages/hikae/src/l3-gate.ts:166 CONST "Number.isFinite(v)" -> "!Number.isNaN(v)"
test("nan_and_infinity_never_commit", () => {
  for (const kind of ["set", "interval"] as const) {
    const base: GateInput = {
      intent: kind === "set" ? "up" : 1, verdict: verdictOf(kind), remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 2,
      nCalib: 50, nMin: 50, clockOpen: true, timedOut: false, evaluable: true, tool: "perps_order_preview", schemaVersion: "1.0.0", requestSha256: "e".repeat(64),
    };
    assert.deepEqual([gate(base).action, gate(base).reason], ["commit", "covered"], `${kind}: finite inputs commit`);
    for (const field of ["remainingBudget", "bFloor", "tau", "tauInterval", "nCalib", "nMin"] as const) {
      for (const bad of [Number.NaN, Infinity, -Infinity]) {
        for (const clockOpen of [true, false]) {
          const d = gate({ ...base, clockOpen, [field]: bad });
          assert.deepEqual([d.action, d.allow, d.reason], ["abstain", false, "non_evaluable"], `${kind} ${field} ${String(bad)} clock ${String(clockOpen)}`);
        }
      }
    }
    // The earlier guards keep their priority.
    assert.equal(gate({ ...base, tau: Number.NaN, timedOut: true }).reason, "upstream_timeout");
  }
});

// E-4: scoresInDomain refuses NaN and the infinities ("finite"), and also negative scores ("band", -0 passes); the kata
// entry points (splitQuantileExact, riskControlRow) fail closed on them. riskControlQuantile and splitQuantile keep
// accepting infinities and negative scores (pins: their callers are unchanged, R-2).
// killer: packages/hikae/src/l1-split.ts:122 ROR "s >= 0" -> "s >= -1"
test("score_domain_refuses_non_finite_and_negative_band_scores", () => {
  const inDomain = fn<(s: readonly number[], d: "finite" | "band") => boolean>(l1, "scoresInDomain");
  const exact = fn<Split>(l1, "splitQuantileExact");
  const row = fn<RowFn>(l1, "riskControlRow");
  const good = ranks(100).map((i) => i / 100);
  assert.equal(inDomain(good, "band"), true);
  assert.equal(inDomain([], "band"), true);
  assert.equal(inDomain([-0, 0, 1], "band"), true);
  assert.equal(inDomain([-1, 0, 1], "finite"), true);
  for (const bad of [Number.NaN, Infinity, -Infinity]) {
    assert.equal(inDomain([0, bad], "finite"), false, String(bad));
    assert.deepEqual(exact([...good, bad], "0.10", 1), UNDER, `split exact ${String(bad)}`);
    assert.deepEqual(row([...good, bad], "0.10", "0.05", 1), UNDER, `row ${String(bad)}`);
  }
  for (const neg of [-1e-300, -0.5, -1]) {
    assert.equal(inDomain([0, neg], "band"), false, String(neg));
    assert.deepEqual(exact([...good, neg], "0.10", 1, "band"), UNDER);
    assert.deepEqual(row([...good, neg], "0.10", "0.05", 1, { domain: "band" }), UNDER);
    assert.ok("qhat" in row([...good, neg], "0.10", "0.05", 1), "a negative score passes the finite domain");
  }
  // Pins (unchanged callers): riskControlQuantile refuses NaN only; splitQuantile serves negative and infinite scores.
  assert.ok("qhat" in l1.riskControlQuantile([...good, Infinity], "0.10", "0.05", 1));
  assert.ok("qhat" in l1.riskControlQuantile([...good, -1], "0.10", "0.05", 1));
  assert.deepEqual(l1.splitQuantile([-3, -2, -1, ...good.slice(0, 7)], 0.1, 1), { qhat: 0.07 });
});

// E-5: the split rank is the exact integer ceil((n + 1)(1 - alpha)), alpha a decimal string. At alpha 0.45 the float
// rank of splitQuantile is one too high on exactly 112 values of n below 5 000 (audit; n 99: 56 instead of 55); the
// exact entry point serves the exact rank on all of them and on a grid. splitQuantile keeps its float rank (pin, R-2).
// killer: packages/hikae/src/l1-split.ts:132 CONST "a.den - 1n" -> "a.den"
test("split_quantile_exact_uses_the_integer_rank", () => {
  const rankOf = fn<(n: number, a: string) => number>(l1, "splitRankExact");
  const exact = fn<Split>(l1, "splitQuantileExact");
  const off: number[] = [];
  for (let n = 1; n < 5000; n++) if (Math.ceil((n + 1) * (1 - 0.45)) !== exactRank(n, 45, 100)) off.push(n);
  assert.equal(off.length, 112);
  assert.equal(off[0], 99);
  assert.equal(exactRank(99, 45, 100), 55);
  for (const n of off) {
    const r = exactRank(n, 45, 100);
    assert.equal(rankOf(n, "0.45"), r, `rank n ${n}`);
    assert.deepEqual(exact(ranks(n), "0.45", 1), { qhat: r }, `qhat n ${n}`);
    assert.deepEqual(l1.splitQuantile(ranks(n), 0.45, 1), { qhat: r + 1 }, `served float rank n ${n} unchanged`);
  }
  for (const [num, den] of [[1, 100], [5, 100], [10, 100], [45, 100], [1234, 10000], [99, 100]] as const) {
    const dec = `0.${String(num * (10000 / den)).padStart(4, "0")}`;
    for (let n = 0; n <= 300; n += 7) {
      const r = exactRank(n, num, den);
      assert.equal(rankOf(n, dec), r, `rank ${dec} n ${n}`);
      assert.deepEqual(exact(ranks(n), dec, 1), r > n ? UNDER : { qhat: r }, `${dec} n ${n}`);
    }
  }
  // Three-way order and the fail-closed refusals.
  assert.deepEqual(exact([5, -2, 3, 1, 4, 2, 0, -1, 6, 7], "0.10", 10), { qhat: 7 });
  assert.deepEqual(exact([5, -2, 3, 1, 4, 2, 0, -1, 6, 7], "0.20", 10), { qhat: 6 });
  assert.deepEqual(exact(ranks(10), "0.10", 11), UNDER, "n < nMin");
  assert.deepEqual(exact(ranks(10), "0.10", Number.NaN), UNDER, "nMin NaN");
  for (const bad of ["0", "1", "0.1.0", "1e-1", "0.00001", "NaN"]) assert.deepEqual(exact(ranks(10), bad, 1), UNDER, bad);
  assert.throws(() => rankOf(10, "0.00001"), RangeError);
});

// E-12 (amendment A-1, G2 of CM-3a): riskControlRow takes the base test_delta, the calib_attempt and spendIndex = h + 1
// (h the NON-exempt recalibrations, default the attempt, an integer in 1..attempt); the test delta is
// spendDelta(base, spendIndex), returned with spendIndex and the attempt. Attempt 1 (the default) is riskControlQuantile
// at the base delta (pin: riskControlQuantile unchanged). USDe: base 0.10 spend 2 is delta 0.05 (k* 48, rank 565, U
// 0.0985253); attempt 2 after an exempt recalibration (spendIndex 1) keeps the base delta 0.1.
// killer: packages/hikae/src/l1-split.ts:207 CONST "spendDelta(baseDeltaDec, spendIndex)" -> "spendDelta(baseDeltaDec, attempt)"
test("risk_control_row_spends_test_delta_by_attempt", () => {
  const row = fn<RowFn>(l1, "riskControlRow");
  const second = row(USDE, "0.10", "0.10", 50, { attempt: 2 });
  assert.deepEqual(second, { qhat: 1.5501056004166666e-4, rank: 565, kStar: 48, kObs: 48, calibMisses: 48, attempt: 2, spendIndex: 2, testDelta: "0.05", silence: false, missBound: "0.0985253" });
  const first = row(USDE, "0.10", "0.10", 50);
  assert.deepEqual(first, { qhat: 1.515488218333333e-4, rank: 562, kStar: 51, kObs: 51, calibMisses: 51, attempt: 1, spendIndex: 1, testDelta: "0.1", silence: false, missBound: "0.0993457" });
  assert.deepEqual(row(USDE, "0.10", "0.10", 50, { attempt: 1 }), first);
  assert.deepEqual(row(USDE, "0.10", "0.10", 50, { attempt: 2, spendIndex: 1 }), { ...first, attempt: 2 }, "an exempt recalibration spends nothing");
  assert.deepEqual(row(USDE, "0.10", "0.10", 50, { attempt: 4, spendIndex: 2 }), { ...second, attempt: 4 });
  for (const [attempt, spendIndex] of [[2, 0], [2, 3], [2, 1.5], [1, Number.NaN], [5, 1]]) {
    assert.deepEqual(row(USDE, "0.10", "0.10", 50, { attempt, spendIndex }), UNDER, `attempt ${attempt} spendIndex ${spendIndex}`);
  }
  assert.deepEqual(l1.riskControlQuantile(USDE, "0.10", "0.10", 50), { qhat: 1.515488218333333e-4, rank: 562, kStar: 51, kObs: 51, missBound: "0.0993457" });
  // Attempts 3 and 4 halve again (0.025, 0.0125): k* never grows as the delta is spent.
  const k = [1, 2, 3, 4].map((attempt) => row(USDE, "0.10", "0.10", 50, { attempt }));
  assert.deepEqual(k.map((r) => r.testDelta), ["0.1", "0.05", "0.025", "0.0125"]);
  const ks = k.map((r) => r.kStar as number);
  for (let i = 1; i < 4; i++) assert.ok((ks[i] as number) <= (ks[i - 1] as number), `k* at attempt ${i + 1}`);
  assert.deepEqual({ ...k[3], attempt: 1, spendIndex: 1 }, row(USDE, "0.10", "0.0125", 50), "spend 4 of 0.10 is spend 1 of 0.0125");
  // Refusals fail closed.
  for (const attempt of [0, 5, 1.5, Number.NaN]) assert.deepEqual(row(USDE, "0.10", "0.10", 50, { attempt }), UNDER, `attempt ${attempt}`);
  assert.deepEqual(row(USDE, "0.10", "0.25", 50), UNDER, "base delta 0.25");
});

/** The k* of the base (the earlier computation): one exact CDF per candidate k, through binomCdfLeq. */
function kStarByCdf(n: number, alphaDec: string, deltaDec: string): number {
  const a = binomial.parseAlpha(alphaDec);
  const d = binomial.parseTestDelta(deltaDec);
  let k = -1;
  while (k + 1 < n && binomial.binomCdfLeq(n, k + 1, a, d)) k++;
  return k;
}

// E-9: riskControlMaxExceedances (k*) in one linear pass equals the earlier computation (one exact CDF per k) on a grid of
// n, alpha and test_delta (the audit values at alpha 0.45: k* 305 at n 728, 70 at n 182), and decides
// n 4 368 at alpha 0.45, test_delta 0.05 (k* 1 911) well under the 8.7 s of the base (bound 4 s, measured near 20 ms).
// killer: packages/hikae/src/binomial.ts:173 CONST "BigInt(i + 1) * q" -> "BigInt(i + 2) * q"
test("kstar_in_one_pass_equals_the_exact_cdf_and_is_fast", () => {
  for (const alphaDec of ["0.01", "0.05", "0.10", "0.20", "0.45", "0.5001", "0.9"]) {
    for (const deltaDec of ["0.05", "0.10", "0.0125"]) {
      for (let n = 0; n <= 160; n++) {
        assert.equal(binomial.riskControlMaxExceedances(n, alphaDec, deltaDec), kStarByCdf(n, alphaDec, deltaDec), `n ${n} alpha ${alphaDec} delta ${deltaDec}`);
      }
    }
  }
  for (const [n, alphaDec, want] of [[728, "0.45", 305], [182, "0.45", 70], [613, "0.10", 48]] as const) {
    assert.equal(kStarByCdf(n, alphaDec, "0.05"), want);
    assert.equal(binomial.riskControlMaxExceedances(n, alphaDec, "0.05"), want, `n ${n}`);
  }
  const t0 = performance.now();
  const big = binomial.riskControlMaxExceedances(4368, "0.45", "0.05");
  const ms = performance.now() - t0;
  assert.equal(big, 1911);
  assert.ok(binomial.binomCdfLeq(4368, 1911, binomial.parseAlpha("0.45"), binomial.parseTestDelta("0.05")), "k* meets the rule");
  assert.ok(!binomial.binomCdfLeq(4368, 1912, binomial.parseAlpha("0.45"), binomial.parseTestDelta("0.05")), "k* + 1 does not");
  assert.ok(ms < 4000, `k* at n 4368 took ${ms.toFixed(0)} ms`);
});

// E-6: a direction cell (indicator scores, silenceAt 1) at n 728, alpha 0.45, test_delta 0.05 (k* 305, rank 423). With
// 306 errors qhat is 1: the row is silent, kObs is 0 but calibMisses is 306, and no missBound is carried (the base row
// read misses 0, bound 0.4499257). With 305 errors qhat is 0: calibMisses equals kObs 305 and missBound 0.4499257. Without
// silenceAt (bands) calibMisses is kObs and the row is never silent; the time order of the scores is irrelevant here.
// G2 of CM-3a: silenceAt is the top of the score space, so a score above it fails closed (an intermediate silenceAt on a
// band); on non-binary scores in silence, calibMisses counts the scores at silenceAt, kObs stays 0.
// killer: packages/hikae/src/l1-split.ts:202 CONST "scores.some((s) => s > silenceAt)" -> "false"
test("silent_row_counts_calib_misses_and_carries_no_bound", () => {
  const row = fn<RowFn>(l1, "riskControlRow");
  const cell = (errors: number): number[] => Array.from({ length: 728 }, (_, i) => (i < errors ? 1 : 0)).reverse();
  const common = { rank: 423, kStar: 305, attempt: 1, spendIndex: 1, testDelta: "0.05" };
  const silent = row(cell(306), "0.45", "0.05", 1, { silenceAt: 1 });
  assert.deepEqual(silent, { qhat: 1, kObs: 0, calibMisses: 306, silence: true, ...common });
  assert.equal("missBound" in silent, false);
  assert.deepEqual(l1.riskControlQuantile(cell(306), "0.45", "0.05", 1), { qhat: 1, rank: 423, kStar: 305, kObs: 0, missBound: "0.4499257" }, "pin: the base row");
  assert.deepEqual(row(cell(305), "0.45", "0.05", 1, { silenceAt: 1 }), { qhat: 0, kObs: 305, calibMisses: 305, silence: false, missBound: "0.4499257", ...common });
  assert.deepEqual(row(cell(728), "0.45", "0.05", 1, { silenceAt: 1 }), { qhat: 1, kObs: 0, calibMisses: 728, silence: true, ...common });
  const band = row(USDE, "0.10", "0.05", 50, { domain: "band" });
  assert.deepEqual([band.silence, band.calibMisses, band.kObs, band.missBound], [false, 48, 48, "0.0985253"]);
  assert.deepEqual(row(USDE, "0.10", "0.05", 50, { silenceAt: Number.NaN }), UNDER, "silenceAt NaN");
  // Bands with silenceAt: an intermediate value (the median score) is refused; the top score is admitted, not silent.
  const sorted = [...USDE].sort((x, y) => x - y);
  const median = sorted[306] as number;
  const top = sorted[612] as number;
  assert.deepEqual(row(USDE, "0.10", "0.05", 50, { domain: "band", silenceAt: median }), UNDER, "a score above silenceAt");
  const topRow = row(USDE, "0.10", "0.05", 50, { domain: "band", silenceAt: top });
  assert.deepEqual([topRow.silence, topRow.calibMisses, topRow.kObs, topRow.missBound], [false, 48, 48, "0.0985253"]);
  // Non-binary scores in silence: 306 scores at the top value 2, 422 distinct values in (0, 1).
  const graded = (atTop: number): number[] => Array.from({ length: 728 }, (_, i) => (i < atTop ? 2 : (i + 1) / 1000));
  assert.deepEqual(row(graded(306), "0.45", "0.05", 1, { domain: "band", silenceAt: 2 }), { qhat: 2, kObs: 0, calibMisses: 306, silence: true, ...common });
  const open = row(graded(305), "0.45", "0.05", 1, { domain: "band", silenceAt: 2 });
  assert.deepEqual([open.qhat, open.silence, open.kObs, open.calibMisses, open.missBound], [0.728, false, 305, 305, "0.4499257"]);
});
