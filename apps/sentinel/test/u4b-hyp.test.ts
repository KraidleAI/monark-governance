// U-4b-STATS-1 (RUNBOOK ruling R-K; checkpoint-1 C-1..C-12) - OFFLINE tools for the pre-registered hypotheses H-3 /
// H-4 / H-6 of docs/PLAN-u4b-prereg.md (:95-106) and the report feeding the pre-registered U-6 condition (:359).
// Oracles are INDEPENDENT of the tool and ANTERIOR to it (C-5): (i) the advisor Q6 masses (3.6 / 6.3 / 5.8 / 10.4 %),
// (ii) ADR-U4 :104-112 (177 of 179 served values in the series, 2 = p0, lags 26 / 6 / 5), (iii) 11/99 and 24/189,
// (iv) exact reconciliation against repayment_base of the pinned U3-realized, (v) the report end to end on the
// committed e2 fixtures, plus closed forms (hockey stick, Angelopoulos & Bates p.50 moments) and an independent
// lgamma implementation. Export-excluded (imports scripts/census/**, reads the upcoming u4b fixtures). NO network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  ROOT, H3_LEVEL, H6_MAX_LAG, REFERENCE_REL, REFERENCE_SHA256_LF, PREREG_REL, SUMMARY_TEMPLATES, HypError, VERDICTS,
  rat, bbDistribution, bbLowerTail, rejectsAtLevel, pOfN, loadReferenceLines, extractC11Sentence, loadC11Sentence,
  parseJsonl, parseScores, h3Cell, computeH3, computeH4, computeH6, computeLabels, clause359, buildSummary, parseArgs,
  runCli,
  type Rat, type ParsedScores, type ScoreRow, type MetaCellA, type ReportDoc, type H3Result,
} from "../../../scripts/census/u4b/u4b-hyp.mjs";
import { compilePatterns, scanText, type VocabRule } from "../../../scripts/grep-forbidden.mjs";

const FIX = join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi");
const P_SCORES_E2 = join(FIX, "u4b", "U4b-scores-e2.jsonl");
const P_ORACLE_E2 = join(FIX, "u4b", "U4b-oracle-path-e2.jsonl");
const P_INPUTS = join(FIX, "u3", "U3-inputs.jsonl");
const P_REALIZED = join(FIX, "u3", "U3-realized.jsonl");
const EP = "e2-2025-10-10-weth";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
/** sha256 of the C-11 sentence read from the prereg (the sentence itself is never typed in a source file). */
const C11_SENTENCE_SHA256 = "b76dc9881b224a7ec4d67f9efea7cf6a037316773802c7d93398065b4a20cbac";
/** Regression pin of the e2-vs-e2 report body (C-5 v); the provenance (tool sha) is OUTSIDE the digest. */
const E2_REPORT_BODY_DIGEST = "49b138c3b0ea1c4debfd6276df898cb9e1379a93b676f0a9fe04fd04fb441d5f";

type Line = Record<string, unknown>;
const readLines = (p: string): Line[] => parseJsonl(readFileSync(p, "utf8"));
const sha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");
/** exact C(n, k) (BigInt), independent of the tool. */
function binom(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  let r = 1n;
  for (let i = 1; i <= k; i++) r = (r * BigInt(n - k + i)) / BigInt(i);
  return r;
}
const ratEq = (x: Rat, num: bigint, den: bigint): boolean => x.num * den === num * x.den;
const ratToFloat = (x: Rat): number => Number((x.num * 10n ** 18n) / x.den) / 1e18;

// ---------------------------------------------------------------------------------------------------------------
// independent float implementation (lgamma, Lanczos g=7) - used ONLY as a cross-check of the exact arithmetic
// ---------------------------------------------------------------------------------------------------------------
const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
function lgamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  const z = x - 1;
  let s = LANCZOS[0] ?? 0;
  for (let i = 1; i < LANCZOS.length; i++) s += (LANCZOS[i] ?? 0) / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(s);
}
function bbLowerTailFloat(N: number, a: number, b: number, k: number): number {
  const lnB = (x: number, y: number): number => lgamma(x) + lgamma(y) - lgamma(x + y);
  let s = 0;
  for (let j = 0; j <= k; j++) s += Math.exp(lgamma(N + 1) - lgamma(j + 1) - lgamma(N - j + 1) + lnB(j + a, N - j + b) - lnB(a, b));
  return s;
}

// ---------------------------------------------------------------------------------------------------------------
// synthetic ParsedScores (C-1 / C-3 cases) - rows carry their strate directly
// ---------------------------------------------------------------------------------------------------------------
function row(address: string, strate: number, score: bigint, liquidated = false): ScoreRow {
  return { address, y: score, yhat: 0n, score, liquidated, strate, pstar: null };
}
const kth = (xs: bigint[], p: number): bigint => {
  const s = xs.slice().sort((x, z) => (x < z ? -1 : x > z ? 1 : 0));
  const v = s[p - 1];
  if (v === undefined) throw new Error("kth out of range");
  return v;
};
const range = (lo: number, hi: number): bigint[] => { const o: bigint[] = []; for (let i = lo; i <= hi; i++) o.push(BigInt(i)); return o; };
/** Build a ParsedScores from per-stratum exceedance lists, meta n/p/qhat derived as the FROZEN producer does. */
function synthScores(perStratum: bigint[][], eventId: string): ParsedScores {
  const rows: ScoreRow[] = [];
  perStratum.forEach((xs, k) => { xs.forEach((s, i) => rows.push(row(`0x${String(k)}${String(i).padStart(39, "0")}`, k, s))); });
  const cellStat = (xs: bigint[]): { n: number; p: number | null; qhat: string | null } => {
    const n = xs.length;
    const p = n === 0 ? null : Math.ceil((n + 1) * 0.99);
    return { n, p, qhat: p === null || n < 100 || p > n ? null : kth(xs, p).toString() };
  };
  const strata = perStratum.map((xs, k) => ({ strate: k, ...cellStat(xs) }));
  const all = perStratum.flat();
  const cellA: MetaCellA = { predictor_id: `ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/${eventId}/A`, alpha: 0.01, n_min: 100, ...cellStat(all), strata };
  return { meta: { cell_a: cellA }, cellA, rows, eventId };
}

// ===============================================================================================================
test("u4b_hyp_bb_hand_cases_exact_rationals", () => {
  // BB(1,1,1): P(K<=0) = 1/2 ; BB(2,1,1) uniform on {0,1,2} ; BB(5,2,1): pmf(j) = (j+1)/21.
  assert.ok(ratEq(bbLowerTail(1, 1, 1, 0), 1n, 2n));
  assert.ok(ratEq(bbLowerTail(2, 1, 1, 0), 1n, 3n) && ratEq(bbLowerTail(2, 1, 1, 1), 2n, 3n));
  const expect521 = [[1n, 21n], [3n, 21n], [6n, 21n], [10n, 21n], [15n, 21n], [21n, 21n]] as const;
  expect521.forEach(([num, den], k) => assert.ok(ratEq(bbLowerTail(5, 2, 1, k), num, den), `BB(5,2,1) P(K<=${String(k)})`));
  // b = 1 (qhat = the fresh max): P(K <= N-1) = N/(N+a) (all N e2 values below the max of a fresh values).
  for (const [N, a] of [[5, 5], [148, 148], [7, 100], [60, 199]] as const) {
    assert.ok(ratEq(bbLowerTail(N, a, 1, N - 1), BigInt(N), BigInt(N + a)), `P(K<=N-1) = N/(N+a) for N=${String(N)} a=${String(a)}`);
  }
  // exact boundary 1/20 (a=95, b=1, N=5, k=4): reduced BigInt rational, and NON at the pre-registered 5/100 (<=).
  const boundary = bbLowerTail(5, 95, 1, 4);
  assert.equal(typeof boundary.num, "bigint");
  assert.equal(boundary.num, 1n, "p-value numerator is exactly 1 (exact arithmetic, reduced)");
  assert.equal(boundary.den, 20n, "p-value denominator is exactly 20");
  assert.equal(rejectsAtLevel(boundary), true, "p-value == 5/100 => NON (the decision is p <= level)");
  assert.equal(rejectsAtLevel(rat(1n, 20n), H3_LEVEL), true);
  assert.equal(rejectsAtLevel(rat(1000001n, 20000000n)), false, "just above 5/100 => OUI");
  // large case: exact equality with the hockey-stick closed form C(k+a,k)/C(N+a,N) at a=991 (fresh n=1000), N=565.
  const big = bbLowerTail(565, 991, 1, 560);
  assert.ok(ratEq(big, binom(560 + 991, 560), binom(565 + 991, 565)), "exact large-number case (float arithmetic overflows here)");
});

test("u4b_hyp_bb_total_mass_and_strict_monotone_tail", () => {
  for (const [N, a, b] of [[363, 361, 3], [148, 148, 1], [565, 561, 5], [46, 47, 1]] as const) {
    const d = bbDistribution(N, a, b);
    assert.equal(d.pmfNum.reduce((s, x) => s + x, 0n), d.den, "total mass exactly 1");
    let prev = rat(-1n, 1n);
    for (let k = 0; k <= N; k++) {
      const cur = bbLowerTail(N, a, b, k);
      assert.ok(cur.num * prev.den > prev.num * cur.den, `P(K<=k) strictly increasing at k=${String(k)}`);
      prev = cur;
    }
    assert.ok(ratEq(prev, 1n, 1n), "P(K<=N) = 1");
  }
});

test("u4b_hyp_bb_moments_match_angelopoulos_bates_p50", () => {
  // p.50 [lu]: E[C] = 1 - l/(n+1), Var(C) = l(n+1-l)(n+n_val+1) / (n_val R (n+1)^2 (n+2)); with R = 1 and K = n_val C:
  // E[K] = N(n+1-l)/(n+1), Var(K) = N l (n+1-l)(n+1+N) / ((n+1)^2 (n+2)), a = n+1-l = p, b = l.
  for (const [n, N] of [[363, 363], [148, 148], [565, 565], [150, 565], [1000, 565]] as const) {
    const p = pOfN(n), l = n + 1 - p;
    const d = bbDistribution(N, p, l);
    let s1 = 0n, s2 = 0n;
    d.pmfNum.forEach((w, j) => { s1 += BigInt(j) * w; s2 += BigInt(j) * BigInt(j) * w; });
    const mean = rat(s1, d.den);
    assert.ok(ratEq(mean, BigInt(N) * BigInt(p), BigInt(n + 1)), `E[K] (n=${String(n)}, N=${String(N)})`);
    const variance = rat(s2 * d.den - s1 * s1, d.den * d.den);
    assert.ok(ratEq(variance, BigInt(N) * BigInt(l) * BigInt(p) * BigInt(n + 1 + N), BigInt((n + 1) * (n + 1)) * BigInt(n + 2)), `Var(K) (n=${String(n)}, N=${String(N)})`);
  }
});

test("u4b_hyp_bb_reproduces_advisor_q6_masses", () => {
  // Advisor Q6 (2026-09-21, AVIS-advisor-defi-prereg-u4b-1b :71): false-NON mass of the rejected rule
  // "coverage e2 < 0.99 - 2 SE_Beta(p, n-p+1)" under BB(565, p, n+1-p): 3.6 % (n=150), 6.3 % (300), 5.8 % (565), 10.4 % (1000).
  const N = 565;
  const expected: Record<number, number> = { 150: 3.6, 300: 6.3, 565: 5.8, 1000: 10.4 };
  for (const n of [150, 300, 565, 1000]) {
    const p = pOfN(n), b = n + 1 - p;
    const se2Num = BigInt(p) * BigInt(b), se2Den = BigInt(n + 1) * BigInt(n + 1) * BigInt(n + 2);
    let cutoff = -1; // largest K with K/N < 99/100 - 2 SE (exact: d = 99/100 - K/N > 0 and d^2 > 4 SE^2)
    for (let K = 0; K <= N; K++) {
      const dNum = BigInt(99 * N - 100 * K), dDen = BigInt(100 * N);
      if (dNum <= 0n || dNum * dNum * se2Den <= 4n * se2Num * dDen * dDen) break;
      cutoff = K;
    }
    const mass = ratToFloat(bbLowerTail(N, p, b, cutoff));
    assert.equal(Math.round(mass * 1000) / 10, expected[n], `advisor Q6 mass at n=${String(n)} (measured ${String(mass)})`);
  }
});

test("u4b_hyp_bb_exact_agrees_with_independent_lgamma", () => {
  assert.ok(Math.abs(lgamma(1)) < 1e-12 && Math.abs(lgamma(5) - Math.log(24)) < 1e-12 && Math.abs(lgamma(0.5) - 0.5 * Math.log(Math.PI)) < 1e-12, "lgamma sanity");
  const cases: Array<[number, number, number, number]> = [[363, 361, 3, 361], [363, 361, 3, 355], [565, 561, 5, 561], [565, 561, 5, 550], [565, 991, 10, 550], [565, 991, 10, 559], [148, 148, 1, 140], [68, 100, 1, 64]];
  for (const [N, a, b, k] of cases) {
    const exact = ratToFloat(bbLowerTail(N, a, b, k));
    const approx = bbLowerTailFloat(N, a, b, k);
    assert.ok(Math.abs(exact - approx) < 1e-9, `exact ${String(exact)} vs lgamma ${String(approx)} at (N=${String(N)}, a=${String(a)}, b=${String(b)}, k=${String(k)})`);
  }
});

test("u4b_hyp_atoms_keep_the_lower_tail_test_conservative", () => {
  // Exact enumeration: exceedances in {0, 1} with P(0) = t/u (atoms). n=4 fresh, N=3 e2, qhat = p-th smallest fresh,
  // K = #{e2 <= qhat} (closed). Coupling s = F^-1(U) => K >= K_continuous ~ BB(N, p, n+1-p) => P(K<=k) <= BB CDF.
  const n = 4, N = 3;
  let strict = 0;
  for (const [t, u] of [[1n, 3n], [1n, 2n], [2n, 3n]] as const) {
    for (let p = 1; p <= n; p++) {
      const mass = new Array<bigint>(N + 1).fill(0n);
      for (let m = 0; m < 1 << (n + N); m++) {
        const bits = Array.from({ length: n + N }, (_, i) => (m >> i) & 1);
        const zeros = bits.filter((x) => x === 0).length;
        const w = t ** BigInt(zeros) * (u - t) ** BigInt(n + N - zeros);
        const fresh = bits.slice(0, n).sort((x, z) => x - z);
        const q = fresh[p - 1] ?? 1;
        const k = bits.slice(n).filter((x) => x <= q).length;
        mass[k] = (mass[k] ?? 0n) + w;
      }
      const den = u ** BigInt(n + N);
      let cum = 0n;
      for (let k = 0; k <= N; k++) {
        cum += mass[k] ?? 0n;
        const bb = bbLowerTail(N, p, n + 1 - p, k);
        assert.ok(cum * bb.den <= bb.num * den, `atoms: P(K<=${String(k)}) <= BB CDF (t/u=${String(t)}/${String(u)}, p=${String(p)})`);
        if (cum * bb.den < bb.num * den) strict++;
      }
    }
  }
  assert.ok(strict > 0, "atoms make the test strictly conservative somewhere (not vacuous)");
});

test("u4b_hyp_h3_verdict_enumeration_precedence_and_predicate", () => {
  // stratum 0: served, OUI ; stratum 1: served, NON ; stratum 2: fresh n=99 => UNDER_CALIB ; stratum 3: e2 n=49 =>
  // NON_TESTABLE_E2. C-1: only a NON on a SERVED stratum flips the :359 predicate.
  const fresh = synthScores([range(1, 120), range(1, 120), range(1, 99), range(1, 120)], "ep-test");
  const e2Non = synthScores([range(1, 60), [...range(1, 30), ...range(121, 150)], range(1, 60), range(1, 49)], "e2-test");
  const r1 = computeH3(fresh, e2Non);
  assert.deepEqual(r1.strata.map((s) => s.verdict), ["OUI", "NON", "UNDER_CALIB", "NON_TESTABLE_E2"]);
  assert.deepEqual(r1.served_strata, [0, 1, 3]);
  assert.deepEqual(r1.non_on_served_strata, [1]);
  assert.equal(r1.h3_no_NON_on_served_strata, false);
  const s1 = r1.strata[1];
  assert.ok(s1 !== undefined && s1.p_value !== null && s1.p_value !== undefined);
  assert.equal(s1.e2.k_covered, 30);
  assert.equal(s1.p_value.num + "/" + s1.p_value.den, (() => { const x = rat(binom(150, 30), binom(180, 60)); return `${x.num.toString()}/${x.den.toString()}`; })(), "NON p-value = C(30+120,30)/C(60+120,60) (hockey stick, b=1)");
  assert.equal(s1.barber_thm2_bound, "not_estimated", "C-11: the Barber Thm 2 bound is declared not estimated");
  assert.equal(r1.strata[2]?.served, false);
  // same fresh, e2 with no NON: UNDER_CALIB and NON_TESTABLE_E2 NEVER flip the predicate.
  const e2Ok = synthScores([range(1, 60), range(1, 60), range(1, 60), range(1, 49)], "e2-test");
  const r2 = computeH3(fresh, e2Ok);
  assert.deepEqual(r2.strata.map((s) => s.verdict), ["OUI", "OUI", "UNDER_CALIB", "NON_TESTABLE_E2"]);
  assert.equal(r2.h3_no_NON_on_served_strata, true, "UNDER_CALIB / NON_TESTABLE_E2 never count as NON");
  // VX-1 (cp-2 of unit 1a, C-V-3): fresh n < 100 AND e2 n < 50 on the SAME stratum => UNDER_CALIB wins over
  // NON_TESTABLE_E2 (precedence pinned by a synthetic case, not only by the real e2 strata 2/3 of T11).
  const r3 = computeH3(synthScores([range(1, 120), range(1, 120), range(1, 99), range(1, 99)], "ep-test"), synthScores([range(1, 60), range(1, 60), range(1, 60), range(1, 49)], "e2-test"));
  assert.deepEqual(r3.strata.map((s) => s.verdict), ["OUI", "OUI", "UNDER_CALIB", "UNDER_CALIB"]);
  const s3 = r3.strata[3];
  assert.ok(s3 !== undefined);
  assert.deepEqual([s3.verdict, s3.served, s3.fresh.n, s3.fresh.qhat, s3.e2.n], ["UNDER_CALIB", false, 99, null, 49], "fresh n=99 < 100 and e2 n=49 < 50 on one stratum => UNDER_CALIB (precedence)");
});

test("u4b_hyp_h3_one_sided_lower_tail_at_5_percent", () => {
  // fresh n=100 => p=100, b=1: P(K<=k) = C(k+100,k)/C(N+100,N) (independent closed form), N = 68.
  const n = 100, N = 68;
  assert.equal(pOfN(n), 100);
  const pv = (k: number): Rat => rat(binom(k + n, k), binom(N + n, N));
  let k0 = -1, k1 = -1;
  for (let k = 0; k < N; k++) {
    const x = pv(k);
    if (x.num * 40n > x.den && x.num * 20n <= x.den) k0 = k;   // p in (1/40, 1/20]
    if (x.num * 20n > x.den && x.num * 10n <= x.den) k1 = k;   // p in (1/20, 1/10]
  }
  assert.ok(k0 >= 0 && k1 >= 0, "discriminating cases exist (two-sided and level-0.10 mutants would flip them)");
  const freshScores = range(1, n);
  const qhat = kth(freshScores, 100).toString();
  const e2With = (k: number): bigint[] => [...range(1, k), ...range(101, 100 + N - k)];
  const cell = (k: number): string => h3Cell("t", { n, p: 100, qhat }, freshScores, e2With(k)).verdict;
  assert.equal(cell(k0), "NON", `lower-tail p-value in (1/40, 1/20] at k=${String(k0)} => NON (one-sided; a two-sided p would exceed 5/100)`);
  assert.equal(cell(k1), "OUI", `lower-tail p-value in (1/20, 1/10] at k=${String(k1)} => OUI at the 5/100 level`);
  assert.equal(cell(N), "OUI", "every e2 value covered => OUI (a high count is never evidence of low coverage)");
  const r = h3Cell("t", { n, p: 100, qhat }, freshScores, e2With(k0));
  assert.ok(r.p_value !== null && r.p_value !== undefined && r.p_value.num + "/" + r.p_value.den === `${pv(k0).num.toString()}/${pv(k0).den.toString()}`, "p-value is the LOWER tail P(K<=k)");
});

test("u4b_hyp_h3_reads_frozen_meta_and_refuses_inconsistency", () => {
  const s = range(1, 150);
  const q = kth(s, 150).toString();
  assert.equal(h3Cell("t", { n: 150, p: 150, qhat: q }, s, range(1, 60)).verdict, "OUI");
  assert.throws(() => h3Cell("t", { n: 150, p: 149, qhat: kth(s, 149).toString() }, s, range(1, 60)), /meta p=149 != ceil/, "meta p inconsistent with the frozen expression => refused (C-3)");
  assert.throws(() => h3Cell("t", { n: 150, p: 150, qhat: "149" }, s, range(1, 60)), /meta qhat 149 != 150-th smallest/, "meta qhat != p-th smallest => refused");
  assert.throws(() => h3Cell("t", { n: 151, p: 150, qhat: q }, s, range(1, 60)), /fresh meta n=151 != 150 fresh rows/);
  assert.throws(() => h3Cell("t", { n: 150, p: 150, qhat: null }, s, range(1, 60)), /meta qhat is null/);
  assert.throws(() => h3Cell("t", { n: 99, p: 99, qhat: "99" }, range(1, 99), range(1, 60)), /frozen producer violated/);
  // producer-drift guards on a real fixture line set
  const lines = readLines(P_SCORES_E2);
  const drift = lines.map((l) => (l.kind === "meta" ? { ...l, cell_a: { ...(l.cell_a as MetaCellA), alpha: 0.05 } } : l));
  assert.throws(() => parseScores(drift, EP, "x"), /producer drift/);
  const badStrate = lines.map((l, i) => (l.kind === "score_a" && i === 1 ? { ...l, strate: 3 } : l));
  assert.throws(() => parseScores(badStrate, EP, "x"), /!= strateOf\(yhat\)/);
  assert.throws(() => parseScores(lines, "another-episode", "x"), /!= --event-id/);
  assert.equal(pOfN(363), 361);
  assert.equal(pOfN(148), 148);
  assert.equal(pOfN(198), 198);
  assert.equal(pOfN(199), 198);
});

test("u4b_hyp_e2_comparison_fixture_sha_enforced", () => {
  const ref = loadReferenceLines();
  assert.equal(ref.sha256_lf, REFERENCE_SHA256_LF);
  assert.equal(sha256(readFileSync(join(ROOT, REFERENCE_REL), "utf8").replace(/\r\n/g, "\n")), REFERENCE_SHA256_LF, "pinned sha == committed fixture (LF)");
  const dir = mkdtempSync(join(tmpdir(), "u4b-hyp-ref-"));
  try {
    const tampered = join(dir, "U4b-scores-e2.jsonl");
    writeFileSync(tampered, readFileSync(join(ROOT, REFERENCE_REL), "utf8").replace('"score":"0"', '"score":"1"'));
    assert.throws(() => loadReferenceLines(tampered), (e: unknown) => e instanceof HypError && /sha256 LF .* != pinned/.test(e.message), "a tampered e2 comparison set is refused");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("u4b_hyp_h3_e2_vs_e2_strata_and_pooled", () => {
  const lines = readLines(P_SCORES_E2);
  const fresh = parseScores(lines, EP, "fresh");
  const reference = parseScores(loadReferenceLines().lines, null, "ref");
  const r: H3Result = computeH3(fresh, reference);
  assert.deepEqual(r.strata.map((s) => s.verdict), ["OUI", "OUI", "UNDER_CALIB", "UNDER_CALIB"]);
  assert.equal(r.h3_no_NON_on_served_strata, true);
  // independent recount of K from the raw fixture lines (closed coverage s <= qhat)
  const meta = lines.find((l) => l.kind === "meta") as { cell_a: MetaCellA };
  const sa = lines.filter((l) => l.kind === "score_a") as Array<{ strate: number; score: string }>;
  const countLe = (k: number | null, q: string): number => sa.filter((x) => (k === null || x.strate === k) && BigInt(x.score) <= BigInt(q)).length;
  const st0 = meta.cell_a.strata[0], st1 = meta.cell_a.strata[1];
  assert.ok(st0 !== undefined && st1 !== undefined && st0.qhat !== null && st1.qhat !== null && meta.cell_a.qhat !== null);
  assert.equal(r.strata[0]?.e2.k_covered, countLe(0, st0.qhat));
  assert.equal(r.strata[0]?.e2.k_covered, 361);
  assert.equal(r.strata[1]?.e2.k_covered, 148, "stratum 1: qhat is the max, closed coverage counts it");
  assert.equal(r.pooled.verdict, "OUI");
  assert.equal(r.pooled.fresh.n, 565);
  assert.equal(r.pooled.fresh.p, 561);
  assert.equal(r.pooled.e2.n, 565);
  assert.equal(r.pooled.e2.k_covered, countLe(null, meta.cell_a.qhat));
  assert.equal(r.pooled.e2.k_covered, 561);
  const pv0 = r.strata[0]?.p_value, pvA = r.pooled.p_value;
  assert.ok(pv0 !== null && pv0 !== undefined && pvA !== null && pvA !== undefined);
  assert.ok(Math.abs(Number(pv0.dec12) - bbLowerTailFloat(363, 361, 3, 361)) < 1e-9, "stratum 0 p-value == independent lgamma");
  assert.ok(Math.abs(Number(pvA.dec12) - bbLowerTailFloat(565, 561, 5, 561)) < 1e-9, "pooled p-value == independent lgamma");
  assert.equal(r.strata[1]?.p_value?.dec12, "1.000000000000");
});

// ---- G2 PROTOTYPE killer tests (relecteur G2 U-4b-STATS-1 1a, throwaway clone, NOT delivered). Inserted BEFORE the
// last test and using ONLY the existing imports, so that seam/1b.patch (header hunk :1-27, tail hunk at EOF) still
// applies. Each test kills a G2 mutant that survives the delivered 1a tests (logs/g2-mutants-A.log).
test("g2proto_c11_fields_on_non_cell_equal_closed_forms", () => {
  // NON cell of the enumeration test (stratum 1): fresh n=120 => p=120, b=1 ; N=60 e2 values, k=30 covered. C-11
  // closed forms: E[K] = N p/(n+1) = 7200/121 ; observed k/N = 1/2 ; nominal 99/100 ; H0 p/(n+1) = 120/121 ;
  // shortfall E[K]-k = 3570/121 ; gap to nominal 99/100 - 1/2 = 49/100.
  const c = h3Cell("t", { n: 120, p: 120, qhat: "120" }, range(1, 120), [...range(1, 30), ...range(121, 150)]);
  assert.equal(c.verdict, "NON");
  const q = (x: { num: string; den: string } | null | undefined): string => (x === null || x === undefined ? "absent" : `${x.num}/${x.den}`);
  assert.deepEqual(c.null_law, { family: "beta-binomial", trials: 60, a: 120, b: 1 });
  assert.equal(c.level, "5/100");
  assert.equal(q(c.expected_covered), "7200/121");
  assert.equal(q(c.coverage_observed), "1/2");
  assert.equal(q(c.coverage_nominal), "99/100");
  assert.equal(q(c.coverage_expected_h0), "120/121");
  assert.equal(q(c.shortfall_vs_expected), "3570/121");
  assert.equal(q(c.coverage_gap_vs_nominal), "49/100");
});

test("g2proto_atoms_ties_and_qhat_is_max_match_prereg_counts", () => {
  // prereg :100 (measured, anterior): e2 zero scores 344/363 (stratum 0), 120/148 (stratum 1), 509/565 pooled ;
  // prereg :98 (H-2bis): stratum 1 (n=148 < 199) => qhat = max ; stratum 0 (n=363) => interior.
  const lines = readLines(P_SCORES_E2);
  const r = computeH3(parseScores(lines, EP, "fresh"), parseScores(loadReferenceLines().lines, null, "ref"));
  assert.equal(r.strata[0]?.e2.atoms_at_zero, 344);
  assert.equal(r.strata[1]?.e2.atoms_at_zero, 120);
  assert.equal(r.pooled.e2.atoms_at_zero, 509);
  assert.equal(r.strata[0]?.fresh.qhat_is_max, false);
  assert.equal(r.strata[1]?.fresh.qhat_is_max, true);
  const sa = lines.filter((l) => l.kind === "score_a") as Array<{ strate: number; score: string }>;
  const meta = lines.find((l) => l.kind === "meta") as { cell_a: MetaCellA };
  for (const k of [0, 1]) {
    const qh = meta.cell_a.strata[k]?.qhat;
    assert.ok(qh !== null && qh !== undefined);
    assert.equal(r.strata[k]?.e2.ties_at_qhat, sa.filter((x) => x.strate === k && BigInt(x.score) === BigInt(qh)).length, `ties at qhat, stratum ${String(k)}`);
  }
});

test("g2proto_pooled_non_is_reported_outside_the_359_predicate_q1a", () => {
  // Ruling Q-1 (a): the :359 predicate counts NON on SERVED strata only; the pooled verdict is reported apart.
  // stratum 0 served (fresh n=120) but e2 n=49 => NON_TESTABLE_E2 ; stratum 1 fresh n=50 => UNDER_CALIB ; pooled:
  // fresh n=170 (p=170, qhat=120), e2 = 49 values <= 120 and 60 values > 120 => k=49 of 109 => NON.
  const r = computeH3(synthScores([range(1, 120), range(1, 50), [], []], "ep-q1"), synthScores([range(1, 49), range(121, 180), [], []], "e2-q1"));
  assert.deepEqual(r.strata.map((s) => s.verdict), ["NON_TESTABLE_E2", "UNDER_CALIB", "UNDER_CALIB", "UNDER_CALIB"]);
  assert.equal(r.pooled.verdict, "NON");
  assert.deepEqual(r.non_on_served_strata, []);
  assert.equal(r.h3_no_NON_on_served_strata, true, "a pooled NON never flips the :359 predicate (Q-1 (a))");
});

test("g2proto_tampered_meta_qhat_is_refused_through_computeH3", () => {
  // C-3 (i)/(iii): qhat is READ from the frozen meta and ASSERTED - through computeH3, for a stratum AND the pooled cell.
  const fresh = synthScores([range(1, 120), range(1, 120), range(1, 99), range(1, 120)], "ep-test");
  const e2 = synthScores([range(1, 60), range(1, 60), range(1, 60), range(1, 49)], "e2-test");
  assert.doesNotThrow(() => computeH3(fresh, e2));
  const pooledTampered: ParsedScores = { ...fresh, cellA: { ...fresh.cellA, qhat: "1" } };
  assert.throws(() => computeH3(pooledTampered, e2), /pooled class A: meta qhat 1 != \d+-th smallest/);
  const stratumTampered: ParsedScores = { ...fresh, cellA: { ...fresh.cellA, strata: fresh.cellA.strata.map((s) => (s.strate === 0 ? { ...s, qhat: "1" } : s)) } };
  assert.throws(() => computeH3(stratumTampered, e2), /stratum 0: meta qhat 1 != 120-th smallest/);
  const lines = readLines(P_SCORES_E2);
  const drift = lines.map((l) => (l.kind === "meta" ? { ...l, cell_a: { ...(l.cell_a as MetaCellA), n_min: 50 } } : l));
  assert.throws(() => parseScores(drift, EP, "x"), /producer drift/, "n_min drift of the producer is refused (C-3 iii guard)");
});

test("g2proto_level_decision_exact_where_float_cannot_tell", () => {
  // C-3 (ii) + exact arithmetic: p-values no IEEE-754 double separates from 1/20 are still decided exactly.
  const big = 2n ** 60n;
  assert.equal(Number(big + 1n) / Number(20n * big), 0.05, "sanity: in float the first value IS 0.05");
  assert.equal(rejectsAtLevel(rat(big + 1n, 20n * big)), false, "(2^60+1)/(20*2^60) > 5/100 => OUI");
  assert.equal(rejectsAtLevel(rat(big - 1n, 20n * big)), true, "(2^60-1)/(20*2^60) < 5/100 => NON");
  // large fresh cell (n=20000, pooled N=565, k=554): exact p-value ~0.031 => NON, while num and den both overflow a
  // double (Infinity/Infinity = NaN): a float decision would be FAIL-OPEN (NaN <= x is false => OUI).
  const pv = bbLowerTail(565, pOfN(20000), 20001 - pOfN(20000), 554);
  assert.ok(Number.isNaN(Number(pv.num) / Number(pv.den)), "sanity: the float ratio is NaN");
  assert.equal(rejectsAtLevel(pv), true, "exact decision at production-scale magnitudes: NON");
});

test("g2proto_e2_min_n_boundary_50_testable_49_not", () => {
  // prereg :100: e2 comparison stratum n < 50 => not testable ; n = 50 IS tested (both sides of E2_MIN_N pinned,
  // as NMIN is pinned at 99/100 by the delivered tests).
  const fr = range(1, 120);
  const at50 = h3Cell("t", { n: 120, p: 120, qhat: "120" }, fr, range(1, 50));
  assert.equal(at50.verdict, "OUI", "n_e2 = 50 is tested (all covered => OUI)");
  assert.ok(at50.p_value !== null && at50.p_value !== undefined);
  assert.equal(h3Cell("t", { n: 120, p: 120, qhat: "120" }, fr, range(1, 49)).verdict, "NON_TESTABLE_E2", "n_e2 = 49 => NON_TESTABLE_E2");
});

test("g2proto_producer_drift_n_min_and_score_guards_refuse", () => {
  const lines = readLines(P_SCORES_E2);
  const drift = lines.map((l) => (l.kind === "meta" ? { ...l, cell_a: { ...(l.cell_a as MetaCellA), n_min: 50 } } : l));
  assert.throws(() => parseScores(drift, EP, "x"), /producer drift/);
  const badScore = lines.map((l, i) => (l.kind === "score_a" && i === 1 ? { ...l, score: String(BigInt(String(l.score)) + 1n) } : l));
  assert.throws(() => parseScores(badScore, EP, "x"), /score != max\(Y - yhat, 0\)/);
});

test("u4b_hyp_c11_sentence_read_verbatim_from_pinned_prereg", () => {
  const s = loadC11Sentence();
  assert.equal(sha256(s), C11_SENTENCE_SHA256, "the C-11 sentence is the prereg span, byte for byte");
  const text = readFileSync(join(ROOT, PREREG_REL), "utf8");
  assert.throws(() => extractC11Sentence(text.replace("Texte servi (C-11)", "Texte servi (C-12)")), /prereg sha256 LF .* != pinned/, "an edited prereg is refused");
});

// ---------------------------------------------------------------------------------------------------------------
// C-V-3 (cp-2 of unit 1a): the three upstream guards of parseScores, each refused BY NAME (HypError + its exact message)
// at the pure function AND at the CLI boundary, with 0 write (no report file, nothing but the input in the directory).
// The message is matched exactly: without the guard, the code downstream refuses with ANOTHER HypError (VX-3, VX-6)
// or writes a report (VX-5), so a bare `instanceof HypError` would let the guard regress unseen.
// ---------------------------------------------------------------------------------------------------------------
const refusedWith = (needle: string) => (e: unknown): boolean => e instanceof HypError && e.message.includes(needle);
function refusedAtCliWithoutWrite(lines: Line[], needle: string): void {
  const dir = mkdtempSync(join(tmpdir(), "u4b-hyp-guard-"));
  try {
    const input = join(dir, "U4b-scores-tampered.jsonl"), out = join(dir, "hyp-report.json");
    writeFileSync(input, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
    assert.throws(() => runCli(["h3", "--scores", input, "--event-id", EP, "--out", out]), refusedWith(needle), `CLI refusal by name: ${needle}`);
    assert.equal(existsSync(out), false, "0 write: the report file is never created");
    assert.deepEqual(readdirSync(dir), ["U4b-scores-tampered.jsonl"], "0 write: the directory holds the input only");
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
const withCellA = (lines: Line[], patch: (c: MetaCellA) => MetaCellA): Line[] => lines.map((l) => (l.kind === "meta" ? { ...l, cell_a: patch(l.cell_a as MetaCellA) } : l));

test("u4b_hyp_parse_scores_refuses_rows_ne_meta_n_vx3", () => {
  const lines = readLines(P_SCORES_E2);
  assert.equal(parseScores(lines, EP, "fresh scores").rows.length, 565, "baseline: the committed fixture passes (565 rows = cell_a.n)");
  const tampered = withCellA(lines, (c) => ({ ...c, n: c.n + 1 }));
  const needle = "fresh scores: 565 score_a rows != cell_a.n 566";
  assert.throws(() => parseScores(tampered, EP, "fresh scores"), refusedWith(needle), "rows != cell_a.n => named refusal");
  refusedAtCliWithoutWrite(tampered, needle);
});

test("u4b_hyp_parse_scores_refuses_score_ne_exceedance_vx5", () => {
  const lines = readLines(P_SCORES_E2);
  const i = lines.findIndex((l) => l.kind === "score_a" && l.y === "0" && l.score === "0" && l.yhat !== "0");
  assert.ok(i > 0, "a real score_a row with Y = 0 < yhat (an atom at 0) exists");
  const address = String(lines[i]?.address);
  const tampered = lines.map((l, j) => (j === i ? { ...l, score: "1" } : l));
  const needle = `fresh scores: row ${address} score != max(Y - yhat, 0)`;
  assert.throws(() => parseScores(tampered, EP, "fresh scores"), refusedWith(needle), "score != max(Y - yhat, 0) => named refusal");
  refusedAtCliWithoutWrite(tampered, needle);
});

test("u4b_hyp_parse_scores_refuses_strata_ne_4_vx6", () => {
  const lines = readLines(P_SCORES_E2);
  assert.equal(parseScores(lines, EP, "fresh scores").cellA.strata.length, 4, "baseline: 4 a-priori strata");
  const tampered = withCellA(lines, (c) => ({ ...c, strata: c.strata.slice(0, 3) }));
  const needle = "fresh scores: cell_a.strata must list the 4 a-priori strata";
  assert.throws(() => parseScores(tampered, EP, "fresh scores"), refusedWith(needle), "strata != 4 => named refusal");
  refusedAtCliWithoutWrite(tampered, needle);
});

test("u4b_hyp_h4_e2_counts_reconciliation_and_shares", () => {
  const inputs = readLines(P_INPUTS), realized = readLines(P_REALIZED);
  const fresh = parseScores(readLines(P_SCORES_E2), EP, "fresh");
  const h = computeH4(inputs, realized, fresh, EP);
  // prior oracle (advisor Q6 :76): 11/99 class-A liquidated, 24/189 all liquidated have more than one call
  assert.equal(h.class_a_liquidated.n, 99);
  assert.equal(h.class_a_liquidated.multi_call, 11);
  assert.equal(h.class_a_liquidated.verdict, "NON");
  assert.equal(h.all_liquidated.n, 189);
  assert.equal(h.all_liquidated.multi_call, 24);
  assert.equal(h.all_liquidated.verdict, "NON");
  assert.equal(h.reconciliation.positions_reconciled, 194, "every e2 position reconciles exactly with repayment_base (C-5 iv)");
  assert.equal(h.reconciliation.positions_abstained, 0);
  // independent recomputation of the per-stratum sum after the first call (floorDiv, (block, log_index) order)
  type Call = { event_id: string; user: string; debt: string; block: number; log_index: number; debt_to_cover: string };
  const dec = new Map((inputs.filter((l) => l.kind === "reserve") as Array<{ asset: string; decimals: number }>).map((r) => [r.asset, BigInt(r.decimals)]));
  const px = new Map((inputs.filter((l) => l.kind === "price") as Array<{ asset: string; block: number; price: string }>).map((r) => [`${r.asset}|${String(r.block)}`, BigInt(r.price)]));
  const byUser = new Map<string, Call[]>();
  for (const c of inputs.filter((l) => l.kind === "call" && l.event_id === EP) as Call[]) byUser.set(c.user, [...(byUser.get(c.user) ?? []), c]);
  const expectAfter = [0n, 0n, 0n, 0n];
  for (const r of fresh.rows.filter((x) => x.liquidated)) {
    const cs = (byUser.get(r.address) ?? []).slice().sort((x, z) => x.block - z.block || x.log_index - z.log_index);
    for (const c of cs.slice(1)) expectAfter[r.strate] = (expectAfter[r.strate] ?? 0n) + (BigInt(c.debt_to_cover) * (px.get(`${c.debt}|${String(c.block)}`) ?? 0n)) / 10n ** (dec.get(c.debt) ?? 0n);
  }
  assert.deepEqual(h.strata.map((s) => s.sum_after_first), expectAfter.map(String));
  assert.deepEqual(h.strata.map((s) => s.liquidated), [24, 51, 21, 3], "liquidated class-A accounts per stratum (= cell B strata)");
  assert.equal(h.strata.map((s) => s.multi_call).reduce((a, x) => a + x, 0), 11);
});

test("u4b_hyp_h4_synthetic_first_call_deficit_and_abstention", () => {
  const E = "ep-h4", DEBT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const A = "0x" + "a".repeat(40), B = "0x" + "b".repeat(40), C = "0x" + "c".repeat(40);
  const call = (user: string, block: number, li: number, dtc: string): Line => ({ kind: "call", event_id: E, block, log_index: li, tx: "0x" + String(block), collateral: WETH, debt: DEBT, user, liquidator: "0x" + "9".repeat(40), debt_to_cover: dtc, liquidated_collateral: "1", receive_atoken: false, in_window: true });
  const inputs: Line[] = [
    { kind: "meta", events: [{ id: E }] },
    { kind: "reserve", asset: DEBT, decimals: 6 },
    { kind: "price", asset: DEBT, block: 10, price: "100000000" },
    { kind: "price", asset: DEBT, block: 11, price: "100000000" },
    { kind: "price", asset: DEBT, block: 12, price: "100000000" },
    call(A, 12, 0, "3000000"), call(A, 10, 1, "1000000"), // A: first call = block 10 (1e8 base), then block 12 (3e8)
    call(B, 11, 2, "2000000"),                            // B: one call
    call(C, 13, 0, "5000000"),                            // C: no price at block 13 => position abstains
  ];
  const lineOf = (user: string, repay: string | null, deficit: string, n: number): Line => ({ event_id: E, user, debt_asset: DEBT, collateral_asset: WETH, n_calls: n, repayment_base: repay, deficit_base: deficit, residual: repay === null ? ["no_quorum"] : [] });
  const realized: Line[] = [lineOf(A, "400000000", "50000000", 2), lineOf(B, "200000000", "0", 1), lineOf(C, null, "0", 1)];
  const mkRow = (address: string, y: bigint): ScoreRow => ({ address, y, yhat: 1n, score: y - 1n, liquidated: true, strate: 0, pstar: null });
  const fresh: ParsedScores = { ...synthScores([[], [], [], []], E), rows: [mkRow(A, 450000000n), mkRow(B, 200000000n), mkRow(C, 100000000n)] };
  const h = computeH4(inputs, realized, fresh, E);
  const s0 = h.strata[0];
  assert.ok(s0 !== undefined);
  assert.equal(s0.sum_after_first, "300000000", "A: only the call AFTER the first one (block 12) counts; the deficit does not");
  assert.equal(s0.sum_deficit_apart, "50000000", "deficit reported apart");
  assert.equal(s0.sum_y, "650000000");
  assert.equal(s0.share_sum?.num + "/" + s0.share_sum?.den, "6/13", "sum share = 3e8 / (4.5e8 + 2e8)");
  assert.equal(s0.share_median?.median.num + "/" + s0.share_median?.median.den, "1/3", "median of {2/3 (A), 0 (B)} = 1/3");
  assert.equal(s0.multi_call_subset.share_sum?.num + "/" + s0.multi_call_subset.share_sum?.den, "2/3");
  assert.equal(h.accounts_abstained, 1, "C (repayment_base null) is excluded from the shares and counted");
  assert.equal(h.class_a_liquidated.n, 3);
  assert.equal(h.class_a_liquidated.multi_call, 1);
  assert.equal(h.reconciliation.positions_abstained, 1);
  const bad = realized.map((l) => (l.user === A ? { ...l, repayment_base: "400000001" } : l));
  assert.throws(() => computeH4(inputs, bad, fresh, E), /reconciliation failed/, "a per-call floor sum != repayment_base is refused");
});

test("u4b_hyp_h6_reproduces_adr_u4_on_e2", () => {
  const h = computeH6(readLines(P_INPUTS), readLines(P_ORACLE_E2), EP);
  // ADR-U4 :104-112 (anterior): 179 sampled blocks (price + price_prev), 177 in the series, 2 = p0.
  assert.equal(h.served_blocks.n, 179);
  assert.equal(h.served_blocks.in_events, 177);
  assert.equal(h.served_blocks.equal_to_p0, 2);
  assert.equal(h.served_blocks.outside, 0);
  // the 107 getAssetPrice values at the call blocks: 69 current, lags 26 / 6 / 5, 1 = p0 before the first update.
  assert.equal(h.price_at_call_block.n, 107);
  assert.equal(h.price_at_call_block.matched_on_anchor, 1);
  assert.deepEqual(h.price_at_call_block.lag_histogram, { "0": 70, "1": 26, "2": 6, "3": 5 });
  assert.equal(h.served_blocks.max_lag, 3);
  assert.equal(h.verdict, "OUI", "every served value in events U {p0} with lag <= 3");
  assert.equal(h.anchor.source, "book_weth_price_base_8dec");
  assert.equal(h.anchor.book_fallback_d_n_path, true, "the e2 anchor is the book fallback (the D-n path of C-7)");
  assert.equal(h.min_served, h.min_events, "p_min bracket: min served == min events on e2");
});

test("u4b_hyp_h6_synthetic_lag_bound_membership_and_anchor", () => {
  const E = "ep-h6";
  const oracle: Line[] = [
    { kind: "anchor", block: 100, price: "1000", source: "answer_updated_pre_b0" },
    { kind: "meta", event_id: E, monotone_blocks: true, phase_change: false },
    ...[101, 102, 103, 104, 105, 106].map((b, i) => ({ kind: "update", block: b, log_index: 0, price: String(1001 + i) })),
  ];
  const inputsWith = (priceAt107: string): Line[] => [
    { kind: "call", event_id: E, block: 101 }, { kind: "call", event_id: E, block: 106 }, { kind: "call", event_id: E, block: 107 },
    { kind: "price", asset: WETH, block: 101, price: "1000", price_prev: "1000" }, // p0 at 100 (lag 0) and at 101 (lag 1 on the anchor)
    { kind: "price", asset: WETH, block: 106, price: "1006", price_prev: "1005" },
    { kind: "price", asset: WETH, block: 107, price: priceAt107, price_prev: "1006" },
  ];
  const ok = computeH6(inputsWith("1003"), oracle, E);
  assert.equal(ok.verdict, "OUI", "lag 3 at block 107 is within the bound");
  assert.equal(ok.served_blocks.max_lag, 3);
  const lag4 = computeH6(inputsWith("1002"), oracle, E);
  assert.equal(H6_MAX_LAG, 3);
  assert.equal(lag4.verdict, "NON", "lag 4 events exceeds the pre-registered bound of 3 => NON");
  assert.equal(lag4.served_blocks.lag_over_bound, 1);
  const outside = computeH6(inputsWith("999"), oracle, E);
  assert.equal(outside.verdict, "NON", "a served value outside events U {p0} => NON");
  assert.equal(outside.served_blocks.outside, 1);
  assert.equal(ok.anchor.book_fallback_d_n_path, false);
  assert.throws(() => computeH6(inputsWith("1003"), oracle, "other-episode"), /!= --event-id/);
});

test("u4b_hyp_report_e2_end_to_end_deterministic_body_digest", () => {
  const dir = mkdtempSync(join(tmpdir(), "u4b-hyp-rep-"));
  try {
    const args = (out: string): string[] => ["report", "--scores", P_SCORES_E2, "--inputs", P_INPUTS, "--u3-realized", P_REALIZED, "--oracle-path", P_ORACLE_E2, "--event-id", EP, "--out", out];
    const o1 = join(dir, "hyp-report-e2-a.json"), o2 = join(dir, "hyp-report-e2-b.json");
    runCli(args(o1));
    runCli(args(o2));
    const t1 = readFileSync(o1, "utf8"), t2 = readFileSync(o2, "utf8");
    assert.equal(t1, t2, "two runs => identical bytes (no clock, no absolute path)");
    const doc = JSON.parse(t1) as ReportDoc;
    assert.equal(doc.body_digest, E2_REPORT_BODY_DIGEST, "report body pinned (e2 on both sides)");
    assert.equal(doc.provenance.tool.sha256_lf, sha256(readFileSync(join(ROOT, "scripts", "census", "u4b", "u4b-hyp.mjs"), "utf8").replace(/\r\n/g, "\n")), "C-4: the tool sha LF is in the report provenance");
    assert.equal(doc.provenance.inputs.e2_comparison?.sha256_lf, REFERENCE_SHA256_LF);
    assert.equal(doc.provenance.inputs.u3_realized?.sha256_lf, "b4d93590f07b21017abe8ec2d980dee1f258a968395eb32497e6f9543b6f3923", "the pinned U3-realized (PROVENANCE-u3.md:10)");
    assert.deepEqual(doc.body.clause_359, { h3_no_NON_on_served_strata: true, labels_no_quorum_unresolved: 0, condition_satisfied: true, h3_pooled_verdict_outside_condition: "OUI" });
    assert.equal(doc.body.h5?.population_mono_weth, 9452, "prereg :102 (e2 mono-WETH population)");
    assert.equal(doc.body.q0_rule_failures?.yhat_zero_liquidated, 3, "prereg :99 (3 accounts, all without crossing)");
    assert.equal(doc.body.q0_rule_failures?.without_crossing.length, 3);
    assert.equal(doc.body.q0_rule_failures?.crossed_yhat_zero, 1);
    assert.ok(!/\bgo\b/i.test(t1), "C-4: the report never carries a decision token");
    assert.ok(!/[A-Za-z]:[\\/]/.test(t1) && !t1.includes(ROOT), "no absolute path in the artifact");
    assert.throws(() => runCli(args(o1)), /already exists/, "an existing report is never overwritten");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("u4b_hyp_summary_vocabulary_gate_and_c11_sentence", () => {
  const c11 = loadC11Sentence();
  const vocab = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as { banned: VocabRule[]; scan: Record<string, { banned?: VocabRule[] }> };
  const patterns = compilePatterns([
    ...vocab.banned, ...(vocab.scan.harness?.banned ?? []), ...(vocab.scan.site?.banned ?? []), ...(vocab.scan.sentinel?.banned ?? []),
    { re: "probab", why: "A-9: no probability wording" }, { re: "being\\s+right", why: "A-9" }, { re: "\\bgo\\b", why: "C-4: no decision token" },
    { re: "\\bprove[sn]?\\b|\\bestablish|\\bcertif|\\bvalidates?\\b|\\blicen[cs]es?\\b", why: "C-11: over-claim" },
  ]);
  // served state 1: the e2 report file (OUI + UNDER_CALIB + every census line)
  const dir = mkdtempSync(join(tmpdir(), "u4b-hyp-voc-"));
  let lines: string[] = [];
  try {
    const out = join(dir, "r.json");
    runCli(["report", "--scores", P_SCORES_E2, "--inputs", P_INPUTS, "--u3-realized", P_REALIZED, "--oracle-path", P_ORACLE_E2, "--event-id", EP, "--out", out]);
    lines = (JSON.parse(readFileSync(out, "utf8")) as ReportDoc).body.summary;
  } finally { rmSync(dir, { recursive: true, force: true }); }
  // served state 2: NON + NON_TESTABLE_E2 + UNDER_CALIB (synthetic H-3 body)
  const fresh = synthScores([range(1, 120), range(1, 120), range(1, 99), range(1, 120)], "ep-test");
  const e2 = synthScores([range(1, 60), [...range(1, 30), ...range(121, 150)], range(1, 60), range(1, 49)], "e2-test");
  const synth = buildSummary({ event_id: "ep-test", h3: computeH3(fresh, e2) }, c11);
  const all = [...lines, ...synth];
  for (const text of all) assert.deepEqual(scanText(text, patterns), [], `vocabulary gate on served line: ${text}`);
  for (const [k, tpl] of Object.entries(SUMMARY_TEMPLATES)) {
    assert.deepEqual(scanText(tpl, patterns), [], `vocabulary gate on template ${k}`);
    const prefix = tpl.split("{")[0] ?? tpl;
    assert.ok(all.some((l) => l.startsWith(prefix)), `template ${k} is rendered in a tested served state`);
  }
  const h3Lines = all.filter((l) => l.startsWith("H-3 ") && /: (OUI|NON|UNDER_CALIB|NON_TESTABLE_E2) /.test(l));
  assert.ok(h3Lines.some((l) => l.includes(": OUI ")) && h3Lines.some((l) => l.includes(": NON ")), "both OUI and NON lines are exercised");
  for (const l of h3Lines) assert.equal(l.includes(c11), l.includes(": OUI "), `C-11 sentence on every OUI line and only there: ${l}`);
});

test("u4b_hyp_cli_refuses_forbidden_unknown_and_in_repo_flags", () => {
  const base = ["--scores", "s", "--event-id", "e", "--out", "o"];
  assert.deepEqual(parseArgs(["h3", ...base]).opts, { "--scores": "s", "--event-id": "e", "--out": "o" });
  for (const f of ["--alpha", "--level", "--side", "--ref", "--reference", "--smoothed"]) {
    assert.throws(() => parseArgs(["h3", ...base, f, "0.05"]), /forbidden/, `${f} is a pre-registered constant, never a flag`);
  }
  assert.throws(() => parseArgs(["h3", ...base, "--foo", "1"]), /unknown argument/);
  assert.throws(() => parseArgs(["h3", "--scores", "s", "--event-id", "e"]), /--out is REQUIRED/);
  assert.throws(() => parseArgs(["h3", ...base, "--scores", "t"]), /duplicate/);
  assert.throws(() => parseArgs(["h5", ...base]), /sub-command/);
  assert.throws(() => parseArgs(["report", "--scores", "s", "--inputs", "i", "--oracle-path", "o", "--event-id", "e", "--out", "x"]), /--u3-realized is REQUIRED/, "C-2: the labels are required by the report");
  // in-repo --out: refused before any read or write; its parent does not exist, so even a regressed guard cannot
  // write into the repository (it would fail on the missing parent instead).
  const inRepoOut = join(ROOT, "u4b-hyp-no-such-dir", "hyp-report-inrepo.json");
  assert.throws(() => runCli(["h3", "--scores", P_SCORES_E2, "--event-id", EP, "--out", inRepoOut]), /inside the repository/);
  assert.equal(existsSync(inRepoOut), false, "nothing written inside the repository");
  const dir = mkdtempSync(join(tmpdir(), "u4b-hyp-cli-"));
  try {
    assert.throws(() => runCli(["h3", "--scores", P_SCORES_E2, "--event-id", "not-e2", "--out", join(dir, "x.json")]), /!= --event-id/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("u4b_hyp_labels_no_quorum_counts_null_repayment_only", () => {
  const E = "ep-lab";
  const realized: Line[] = [
    { event_id: E, user: "0x1", repayment_base: null, residual: ["no_quorum"] },
    { event_id: E, user: "0x2", repayment_base: "5", residual: ["no_quorum", "partial_liquidation"] },
    { event_id: E, user: "0x3", repayment_base: "7", residual: [] },
    { event_id: "other", user: "0x4", repayment_base: null, residual: ["no_quorum"] },
  ];
  const l = computeLabels(realized, E);
  assert.equal(l.labels_no_quorum_unresolved, 1, "C-2: unresolved = repayment_base null for the episode (u3-realized.mjs:226)");
  assert.equal(l.residual_no_quorum, 2, "residual no_quorum counted apart");
  assert.equal(l.other_event_lines, 1);
  const h3: H3Result = { strata: [], pooled: { cell: "pooled class A", verdict: "OUI", served: true, fresh: { n: 100, p: 100, qhat: "1" }, e2: { n: 60 } }, served_strata: [], non_on_served_strata: [], h3_no_NON_on_served_strata: true };
  const c = clause359(h3, l);
  assert.equal(c.condition_satisfied, false, "an unresolved labels_no_quorum defeats the :359 condition");
  assert.equal(c.labels_no_quorum_unresolved, 1);
  // C-1 at the clause level: UNDER_CALIB and NON_TESTABLE_E2 strata never defeat the condition; a served NON does.
  const fresh = synthScores([range(1, 120), range(1, 120), range(1, 99), range(1, 120)], "ep-test");
  const clean = { ...l, labels_no_quorum_unresolved: 0 };
  const ok = clause359(computeH3(fresh, synthScores([range(1, 60), range(1, 60), range(1, 60), range(1, 49)], "e2-test")), clean);
  assert.deepEqual([ok.h3_no_NON_on_served_strata, ok.condition_satisfied], [true, true]);
  const non = clause359(computeH3(fresh, synthScores([range(1, 60), [...range(1, 30), ...range(121, 150)], range(1, 60), range(1, 49)], "e2-test")), clean);
  assert.deepEqual([non.h3_no_NON_on_served_strata, non.condition_satisfied], [false, false]);
});

// ---- G2-delta PROTOTYPE killer tests (relecteur G2 U-4b-STATS-1 1b, throwaway clone, NOT delivered). Appended at the end,
// existing imports only. Each test kills a G2 mutant of unit 1b that survives the delivered tests (logs/g2-mutants-1b-E.log),
// except the first one, which is RED on the delivered tool (real defect C-G2D-1) and green once outOfRepo is fixed.
test("g2proto1b_out_with_dotdot_named_child_is_inside_the_repository", () => {
  const inRepo = (e: unknown): boolean => e instanceof HypError && /is inside the repository/.test(e.message);
  // a child of the repository whose FIRST segment starts with ".." is INSIDE the repository (path.relative gives "..x")
  assert.throws(() => runCli(["h3", "--scores", P_SCORES_E2, "--event-id", EP, "--out", join(ROOT, "..u4b-hyp-no-such-dir", "r.json")]), inRepo);
  const inRoot = join(ROOT, "..u4b-hyp-inrepo-probe.json");
  try {
    assert.throws(() => runCli(["h3", "--scores", P_SCORES_E2, "--event-id", EP, "--out", inRoot]), inRepo);
    assert.equal(existsSync(inRoot), false, "nothing written inside the repository");
  } finally { rmSync(inRoot, { force: true }); }
  // an existing report: the NAMED refusal (HypError), not only the fs EEXIST raised by the wx flag
  const dir = mkdtempSync(join(tmpdir(), "u4b-hyp-ow-"));
  try {
    const out = join(dir, "r.json");
    writeFileSync(out, "{}\n");
    assert.throws(() => runCli(["h3", "--scores", P_SCORES_E2, "--event-id", EP, "--out", out]), (e: unknown) => e instanceof HypError && /already exists \(never overwritten\)/.test(e.message));
    assert.equal(readFileSync(out, "utf8"), "{}\n", "the existing file is untouched");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("g2proto1b_clause359_pooled_non_outside_the_condition_q1a", () => {
  // Ruling Q-1 (a) at the CLAUSE level: no served stratum at NON, pooled NON, labels resolved => condition satisfied and
  // the pooled verdict is reported outside the condition.
  const h3 = computeH3(synthScores([range(1, 120), range(1, 50), [], []], "ep-q1"), synthScores([range(1, 49), range(121, 180), [], []], "e2-q1"));
  assert.equal(h3.pooled.verdict, "NON");
  const c = clause359(h3, computeLabels([{ event_id: "ep-q1", user: "0x1", repayment_base: "5", residual: [] }], "ep-q1"));
  assert.deepEqual(c, { h3_no_NON_on_served_strata: true, labels_no_quorum_unresolved: 0, condition_satisfied: true, h3_pooled_verdict_outside_condition: "NON" });
});

test("g2proto1b_h4_boundaries_and_guards", () => {
  const E = "ep-h4b", DEBT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const user = (i: number): string => "0x" + (i + 1).toString(16).padStart(40, "0");
  const call = (u: string, block: number, li: number, dtc: string): Line => ({ kind: "call", event_id: E, block, log_index: li, tx: "0x" + String(block), collateral: WETH, debt: DEBT, user: u, liquidator: "0x" + "9".repeat(40), debt_to_cover: dtc, liquidated_collateral: "1", receive_atoken: false, in_window: true });
  const lineOf = (u: string, repay: string, n: number): Line => ({ event_id: E, user: u, debt_asset: DEBT, collateral_asset: WETH, n_calls: n, repayment_base: repay, deficit_base: "0", residual: [] });
  const inputs: Line[] = [{ kind: "meta", events: [{ id: E }] }, { kind: "reserve", asset: DEBT, decimals: 6 }];
  const realized: Line[] = [];
  const rows: ScoreRow[] = [];
  for (let i = 0; i < 20; i++) {
    const b = 100 + i;
    inputs.push({ kind: "price", asset: DEBT, block: b, price: "100000000" });
    if (i === 0) {
      // account 0: TWO calls in the SAME block, listed in the order OPPOSITE to log_index (3e8 at li 5, 1e8 at li 2)
      inputs.push(call(user(0), b, 5, "3000000"), call(user(0), b, 2, "1000000"));
      realized.push(lineOf(user(0), "400000000", 2));
      rows.push({ address: user(0), y: 400000000n, yhat: 1n, score: 399999999n, liquidated: true, strate: 0, pstar: null });
    } else {
      inputs.push(call(user(i), b, 0, "1000000"));
      realized.push(lineOf(user(i), "100000000", 1));
      rows.push({ address: user(i), y: 100000000n, yhat: 1n, score: 99999999n, liquidated: true, strate: 0, pstar: null });
    }
  }
  const fresh: ParsedScores = { ...synthScores([[], [], [], []], E), rows };
  const h = computeH4(inputs, realized, fresh, E);
  assert.equal(h.strata[0]?.sum_after_first, "300000000", "(block, log_index): the first call of account 0 is log_index 2 (1e8)");
  assert.deepEqual([h.class_a_liquidated.n, h.class_a_liquidated.multi_call, h.class_a_liquidated.verdict], [20, 1, "OUI"], "1/20 = 5/100 is not above the threshold => OUI");
  assert.deepEqual([h.all_liquidated.n, h.all_liquidated.multi_call, h.all_liquidated.verdict], [20, 1, "OUI"]);
  const named = (re: RegExp) => (e: unknown): boolean => e instanceof HypError && re.test(e.message);
  const lowY: ParsedScores = { ...fresh, rows: rows.map((r, i) => (i === 0 ? { ...r, y: 399999999n, score: 399999998n } : r)) };
  assert.throws(() => computeH4(inputs, realized, lowY, E), named(/< sum of its repayments/), "y below the sum of the repayments => refused");
  const badN = realized.map((l, i) => (i === 0 ? { ...l, n_calls: 3 } : l));
  assert.throws(() => computeH4(inputs, badN, fresh, E), named(/n_calls 3 \(U3-realized\) != 2 in-window calls/), "n_calls mismatch => refused");
  const orphan = [...realized, lineOf("0x" + "e".repeat(40), "1", 1)];
  assert.throws(() => computeH4(inputs, orphan, fresh, E), named(/has no in-window call in U3-inputs/), "a realized line without a call => refused");
});

test("g2proto1b_h6_future_value_and_same_block_conflict", () => {
  const E = "ep-h6b";
  const oracle: Line[] = [
    { kind: "anchor", block: 100, price: "1000", source: "answer_updated_pre_b0" },
    { kind: "meta", event_id: E, monotone_blocks: true, phase_change: false },
    ...[101, 102, 103, 104, 105, 106].map((b, i) => ({ kind: "update", block: b, log_index: 0, price: String(1001 + i) })),
  ];
  // price_prev at block 101 = 1005, a value of the series published only at block 105 (future): lag undefined => NON
  const future = computeH6([{ kind: "call", event_id: E, block: 102 }, { kind: "price", asset: WETH, block: 102, price: "1002", price_prev: "1005" }], oracle, E);
  assert.equal(future.verdict, "NON", "a served value matching only a FUTURE update has no past match => NON");
  assert.equal(future.served_blocks.lag_undefined, 1);
  assert.deepEqual(future.served_blocks.violations, [{ block: 101, value: "1005", lag: null }]);
  // two different served values at the same block (price at 103 vs price_prev of block 104) => named refusal
  const conflict: Line[] = [
    { kind: "call", event_id: E, block: 103 }, { kind: "call", event_id: E, block: 104 },
    { kind: "price", asset: WETH, block: 103, price: "1003", price_prev: "1002" },
    { kind: "price", asset: WETH, block: 104, price: "1004", price_prev: "1004" },
  ];
  assert.throws(() => computeH6(conflict, oracle, E), (e: unknown) => e instanceof HypError && /two different served WETH values at block 103/.test(e.message));
});

test("g2proto1b_labels_deficit_base_no_price_non_usdt_only", () => {
  const E = "ep-lab2", USDT_A = "0xdac17f958d2ee523a2206206994597c13d831ec7", DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const realized: Line[] = [
    { event_id: E, user: "0x1", debt_asset: USDT_A, repayment_base: "5", residual: ["deficit_base_no_price"] },
    { event_id: E, user: "0x2", debt_asset: DAI, repayment_base: "5", residual: ["deficit_base_no_price"] },
    { event_id: E, user: "0x3", debt_asset: DAI, repayment_base: "5", residual: ["deficit_base_no_price"] },
  ];
  assert.equal(computeLabels(realized, E).deficit_base_no_price_non_usdt, 2, "only the non-USDT deficit_base_no_price lines count");
  assert.equal(computeLabels(readLines(P_REALIZED), EP).deficit_base_no_price_non_usdt, 0, "committed e2 labels: 0 (the frozen scorer throws otherwise, u4b-scores.mjs:113)");
});

test("g2proto1b_verdicts_closed_set_c1", () => {
  // item I-G2-1: VERDICTS becomes load-bearing - it IS the closed set of C-1 / prereg :100, and every H-3 cell verdict
  // produced (served, NON, UNDER_CALIB, NON_TESTABLE_E2, pooled, real e2) belongs to it.
  assert.deepEqual([...VERDICTS], ["OUI", "NON", "UNDER_CALIB", "NON_TESTABLE_E2"]);
  const fresh = synthScores([range(1, 120), range(1, 120), range(1, 99), range(1, 120)], "ep-test");
  const e2 = synthScores([range(1, 60), [...range(1, 30), ...range(121, 150)], range(1, 60), range(1, 49)], "e2-test");
  const real = computeH3(parseScores(readLines(P_SCORES_E2), EP, "fresh"), parseScores(loadReferenceLines().lines, null, "ref"));
  const seen = new Set<string>();
  for (const r of [computeH3(fresh, e2), real]) for (const c of [...r.strata, r.pooled]) { assert.ok(VERDICTS.includes(c.verdict), c.verdict); seen.add(c.verdict); }
  assert.deepEqual([...seen].sort(), [...VERDICTS].sort(), "the four outcomes are all exercised");
});

test("g2proto1b_census_guards_refuse", () => {
  const lines = readLines(P_SCORES_E2);
  const dir = mkdtempSync(join(tmpdir(), "u4b-hyp-cen-"));
  try {
    const run = (ls: Line[], name: string): void => {
      const input = join(dir, `${name}.jsonl`);
      writeFileSync(input, ls.map((l) => JSON.stringify(l)).join("\n") + "\n");
      runCli(["report", "--scores", input, "--inputs", P_INPUTS, "--u3-realized", P_REALIZED, "--oracle-path", P_ORACLE_E2, "--event-id", EP, "--out", join(dir, `${name}-report.json`)]);
    };
    const named = (re: RegExp) => (e: unknown): boolean => e instanceof HypError && re.test(e.message);
    const popTamper = lines.map((l) => (l.kind === "meta" ? { ...l, census: { ...(l.census as Record<string, number>), accounts: Number((l.census as Record<string, number>).accounts) + 1 } } : l));
    assert.throws(() => run(popTamper, "pop"), named(/H-5: population \d+ != crossed \+ no_crossing/), "H-5 population identity broken => refused");
    const maxTamper = withCellA(lines, (c) => ({ ...c, strata: c.strata.map((s) => (s.strate === 1 ? { ...s, max_score: "1" } : s)) }));
    assert.throws(() => run(maxTamper, "max"), named(/H-2bis: stratum 1 p == n but qhat != max_score/), "H-2bis qhat != stratum max when p == n => refused");
    assert.deepEqual(readdirSync(dir).filter((n) => n.endsWith("-report.json")), [], "0 report written on a refusal");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---- C-W-1 (checkpoint-2 of unit 1b), micro-pli 1c: the two C-W-1 items the G2 prototype above leaves open. (a) and the
// side AT 5/100 of (b) are g2proto1b_clause359_* / g2proto1b_h4_*; each test below kills mutants that survive them
// (harness cw1-mutants.mjs of the micro-pli: phase before = SURVIVED, phase after = KILLED byIntended).
test("cw1_h4_boundary_just_above_5_over_100_is_NON", () => {
  // (b) "NON iff > 5/100" (ADR section 3), the side ABOVE the boundary: 5/99 is the smallest fraction strictly above 1/20
  // with fewer than 100 accounts, so a decision threshold drifting to 5/99, 6/100 or 10/100 while the reported threshold
  // still reads 5/100 (the e2 fractions 1/9 and 8/63 stay NON, 1/20 stays OUI) turns it OUI (CW1-M1..M3).
  const E = "ep-h4c", DEBT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const user = (i: number): string => "0x" + (i + 1).toString(16).padStart(40, "0");
  const inputs: Line[] = [{ kind: "meta", events: [{ id: E }] }, { kind: "reserve", asset: DEBT, decimals: 6 }];
  const realized: Line[] = [];
  const rows: ScoreRow[] = [];
  for (let i = 0; i < 99; i++) {
    const b = 100 + i, n = i < 5 ? 2 : 1; // accounts 0..4: two calls in the same block => 5 multi-call accounts of 99
    inputs.push({ kind: "price", asset: DEBT, block: b, price: "100000000" });
    for (let j = 0; j < n; j++) inputs.push({ kind: "call", event_id: E, block: b, log_index: j, tx: "0x" + String(b), collateral: WETH, debt: DEBT, user: user(i), liquidator: "0x" + "9".repeat(40), debt_to_cover: "1000000", liquidated_collateral: "1", receive_atoken: false, in_window: true });
    realized.push({ event_id: E, user: user(i), debt_asset: DEBT, collateral_asset: WETH, n_calls: n, repayment_base: String(100000000 * n), deficit_base: "0", residual: [] });
    rows.push({ address: user(i), y: BigInt(100000000 * n), yhat: 1n, score: BigInt(100000000 * n) - 1n, liquidated: true, strate: 0, pstar: null });
  }
  const h = computeH4(inputs, realized, { ...synthScores([[], [], [], []], E), rows }, E);
  assert.equal(h.threshold, "5/100", "the reported threshold");
  for (const c of [h.class_a_liquidated, h.all_liquidated]) {
    assert.deepEqual([c.n, c.multi_call, c.fraction?.num, c.fraction?.den, c.verdict], [99, 5, "5", "99", "NON"], "5/99 is above 5/100 => NON");
  }
});

test("cw1_verdicts_membership_on_the_written_report_t17", () => {
  // (c) VERDICTS (closed set C-1, prereg :100) consumed on the SERVED artifact of T17: every H-3 cell of the WRITTEN
  // report (4 strata + pooled) and the pooled verdict reported by clause_359 belong to it (T11's cells: g2proto1b_verdicts_*).
  const dir = mkdtempSync(join(tmpdir(), "u4b-hyp-cw1-"));
  try {
    const out = join(dir, "hyp-report-e2.json");
    runCli(["report", "--scores", P_SCORES_E2, "--inputs", P_INPUTS, "--u3-realized", P_REALIZED, "--oracle-path", P_ORACLE_E2, "--event-id", EP, "--out", out]);
    const body = (JSON.parse(readFileSync(out, "utf8")) as ReportDoc).body;
    assert.ok(body.h3 !== undefined && body.clause_359 !== undefined, "the written report carries h3 and clause_359");
    const cells = [...body.h3.strata, body.h3.pooled];
    assert.equal(cells.length, 5, "4 strata + the pooled cell");
    for (const c of cells) assert.ok(VERDICTS.includes(c.verdict), `${c.cell}: ${c.verdict} is in the closed set C-1`);
    assert.ok(VERDICTS.includes(body.clause_359.h3_pooled_verdict_outside_condition), "the pooled verdict reported by the clause is in the closed set C-1");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
