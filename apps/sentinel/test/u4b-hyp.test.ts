// U-4b-STATS-1 unit 1a (RUNBOOK ruling R-K; checkpoint-1 C-1..C-12) - the EXACT H-3 core of the offline tools for the
// pre-registered hypotheses of docs/PLAN-u4b-prereg.md (:95-106). Oracles INDEPENDENT of the tool and ANTERIOR to it
// (C-5): (i) the advisor Q6 masses (3.6 / 6.3 / 5.8 / 10.4 %), closed forms (hockey stick, Angelopoulos & Bates p.50
// moments), an independent lgamma implementation and an exact enumeration with atoms; unit 1b adds (ii) ADR-U4
// :104-112, (iii) 11/99 and 24/189, (iv) the exact reconciliation and (v) the report end to end. Export-excluded
// (imports scripts/census/**, reads the upcoming u4b fixtures). NO network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  ROOT, H3_LEVEL, REFERENCE_REL, REFERENCE_SHA256_LF, PREREG_REL, HypError,
  rat, bbDistribution, bbLowerTail, rejectsAtLevel, pOfN, loadReferenceLines, extractC11Sentence, loadC11Sentence,
  parseJsonl, parseScores, h3Cell, computeH3,
  type Rat, type ParsedScores, type ScoreRow, type MetaCellA, type H3Result,
} from "../../../scripts/census/u4b/u4b-hyp.mjs";

const FIX = join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi");
const P_SCORES_E2 = join(FIX, "u4b", "U4b-scores-e2.jsonl");
const EP = "e2-2025-10-10-weth";
/** sha256 of the C-11 sentence read from the prereg (the sentence itself is never typed in a source file). */
const C11_SENTENCE_SHA256 = "b76dc9881b224a7ec4d67f9efea7cf6a037316773802c7d93398065b4a20cbac";

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

test("u4b_hyp_c11_sentence_read_verbatim_from_pinned_prereg", () => {
  const s = loadC11Sentence();
  assert.equal(sha256(s), C11_SENTENCE_SHA256, "the C-11 sentence is the prereg span, byte for byte");
  const text = readFileSync(join(ROOT, PREREG_REL), "utf8");
  assert.throws(() => extractC11Sentence(text.replace("Texte servi (C-11)", "Texte servi (C-12)")), /prereg sha256 LF .* != pinned/, "an edited prereg is refused");
});
