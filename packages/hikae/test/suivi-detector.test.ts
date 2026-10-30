/**
 * HIKAE tracking (packages/hikae/src/suivi/) - the closing detector and the published change reading.
 * What the module computes. detector.ts: from the labels alone, the closing detector with weighted restarts, S <- (S + w_t) g with
 * w_t = 1/(t (t + 1)), and the change reading, R <- (1 + R) g, both in fixed point at 2^-64 rounded down by the betting library on the
 * bets of bets_sr; a sticky alarm at the first rank at which the detector reaches 1/alpha_arl; the reading compared with its threshold at
 * each step, published and never acting; the refusals of a policy, of a malformed state and of a label.
 * How the expected values are computed. Never by the module: the Monte-Carlo loops call weightedStep and srStep of the library and decide
 * the threshold here, on integers (sum_j omega_j v_j >= n scale 2^64, scale and omega read here from the weight texts); the frozen float
 * loops of the two studies are copied here and run on the same labels, path by path; the counts and instants of (A) and (B) are literals
 * printed by a separate script of the test writer (its own fixed point, no library, equal to the library loop on every path); the steps
 * and values of the suites likewise (exact rationals and that fixed point, equal at every step); the count of (C) is pinned from the
 * first run of its test, equal on the study's float loop; the bounds at 3.09 standard errors, computed here.
 * Each run draws from the studies' LCG, seed (1664525 seed + 1013904223) mod 2^32, value seed / 2^32, jumped by the affine map composed in
 * bigint; all the labels of a trajectory are drawn first, then each loop stops at its first crossing; one run per stream, kept for its
 * tests.
 * Category: new-module (red at base by the load of ../src/suivi/detector.ts, which this change adds). The mean run length test of (C),
 * added later, is a pin: green at base, since the library it runs is unchanged by its change, with one named killer.
 */
import { alarm, detInit, detStep, srReading } from "../src/suivi/detector.ts";
import type { DetState } from "../src/suivi/detector.ts";
import { mixtureOf, srReadingDelta } from "../src/suivi/policy.ts";
import type { SuiviPolicy } from "../src/suivi/policy.ts";
import type { Label } from "../src/suivi/label.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { crosses, qParse, srStep, srValue, weightedStep, weightedValue } from "../src/pari/index.ts";

const s = String;
function at<T>(xs: readonly T[], i: number): T {
  const v = xs[i];
  if (v === undefined) throw new Error(`test-side index ${s(i)} out of range`);
  return v;
}
/** A rational text read here, never by the module: [numerator, denominator]. */
function frac(text: string): readonly [bigint, bigint] {
  const parts = text.split("/");
  return [BigInt(at(parts, 0)), BigInt(parts[1] ?? "1")];
}
/** Values of other types typed as the interface's, for the refusals. */
const bit = (v: number): 0 | 1 => v as 0 | 1;
const asPolicy = (v: unknown): SuiviPolicy => v as SuiviPolicy;

/** The fixture: the sealed settings of the USDe cell, keyring empty. */
const W4 = ["1/4", "1/4", "1/4", "1/4"];
const FIX: SuiviPolicy = { schema: "hikae-suivi-policy-v1", task_class: "stable-run-velocity-24h",
  cell_key: "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3", population: "usde-consecutive-calm-pairs-v1",
  policy_version: 1, a: "1/5", delta_adm: "1/20", delta_exh: "1/100", alpha_arl: "1/100", m: "1/5", eta_m1: "1/20", sr_reading_threshold: "10000",
  restart_weights: "1/(j(j+1))", bets_k: { lambdas: ["1/16", "1/8", "1/4", "1/2"], weights: W4 },
  bets_w: { lambdas: ["1/4", "1/2", "1", "2"], weights: W4 }, bets_sr: { lambdas: ["1/10", "1/5", "2/5", "4/5"], weights: W4 }, grace_steps: 1,
  grid_ms: 86400000, l_ms: 37800000, thin_window: 90, thin_min: 30, keyring: [] };
const UNIT = 2n ** 64n, MIX = mixtureOf(FIX.bets_sr), M = qParse(FIX.m), N = 2000;
const gcd = (x: bigint, y: bigint): bigint => (y === 0n ? x : gcd(y, x % y));
/** The weights of bets_sr over their least common denominator, from the texts: w_j = omega_j / scale. */
const WF = FIX.bets_sr.weights.map(frac), SCALE = WF.reduce((acc, [, d]) => (acc * d) / gcd(acc, d), 1n);
const OMEGA = WF.map(([n, d]) => n * (SCALE / d));
const num = (v: readonly bigint[]): bigint => v.reduce((acc, x, j) => acc + at(OMEGA, j) * x, 0n);
/** sum_j w_j v_j / 2^64 as a float, by one division written here. */
const flt = (v: readonly bigint[]): number => Number(num(v)) / Number(SCALE * UNIT);
/** 1/alpha_arl and the reading threshold as integers, from the texts; the integer threshold of the test. */
const N_ARL = frac(FIX.alpha_arl)[1], N_SR = frac(FIX.sr_reading_threshold)[0];
const reaches = (v: readonly bigint[], n: bigint): boolean => num(v) >= n * SCALE * UNIT;
const zero = (): bigint[] => MIX.lambdas.map(() => 0n);

function lcg(seed: number): { next: () => number; state: () => number } {
  let x = seed;
  return { next: () => (x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296, state: () => x };
}
const MOD = 4294967296n;
/** The state after n draws: the affine map x -> (1664525 x + 1013904223) mod 2^32 composed n times, by squaring, in bigint. */
function jump(seed: number, n: number): number {
  let mA = 1664525n, mC = 1013904223n, rA = 1n, rC = 0n, k = BigInt(n);
  while (k > 0n) {
    if ((k & 1n) === 1n) [rA, rC] = [(mA * rA) % MOD, (mA * rC + mC) % MOD];
    [mA, mC] = [(mA * mA) % MOD, (mA * mC + mC) % MOD];
    k >>= 1n;
  }
  return Number((rA * BigInt(seed) + rC) % MOD);
}
/** The streams, fixed by the mission before any run. (A): study 1b, the weighted detector at alpha_arl = 1/100, after its first case
 *  (2 000 x 5 000 draws) and its four change cases (1 000 x (3 200 + 3 200 + 4 000 + 4 000) draws); one draw per label, 1 under 0.2.
 *  (B): study 1, candidate D, section 5, H = 500, 1 000 and 5 000 in one stream; two draws per label, the second never read (u = 0). */
const SEED_A = 20261029, JUMP_A = 24400000, H_A = 5000, P_A = 0.2;
const SEED_B = 20261028, POS_B500 = 790000000, POS_B1000 = 792000000, POS_B5000 = 796000000, P_B = 0.2, U_B = 0;
/** The alarm instants of (A) in path order and the counts of (B), printed by the test writer's script; the study's frozen outputs give
 *  0.0090 of 2 000 and 0.0300, 0.0635, 0.2855 of 2 000. */
const INSTANTS_A = [85, 64, 90, 284, 7, 27, 110, 87, 105, 78, 272, 414, 129, 5, 388, 290, 19, 246];
const COUNTS_B = [60, 127, 571], BANDS_B = [0.065059, 0.120728, 0.534547];
/** (C): the reading's mean run length, on the stream of (B) where its three sections end, H = 3 x 10 000; its count of crossings,
 *  pinned from the first run of this test, equal on the study's float loop. */
const POS_C = 816000000, H_C = 30000, COUNT_C = 1814;
const STUDY_L = [0.1, 0.2, 0.4, 0.8], STUDY_A = 0.2, STUDY_ARL_A = 1 / 100, STUDY_ARL_B = 1e-4;

/** Study 1b, alarmTime, branch of the weighted detector, copied operation by operation; the mean of each step kept. */
function studyA(labels: Uint8Array, means: Float64Array): number {
  const S = STUDY_L.map(() => 0);
  for (let t = 1; t <= labels.length; t++) {
    const X = labels[t - 1] ?? 0;
    for (let j = 0; j < STUDY_L.length; j++) {
      const g = 1 + at(STUDY_L, j) * (X / STUDY_A - 1);
      S[j] = (at(S, j) + 1 / (t * (t + 1))) * g;
    }
    means[t] = S.reduce((x, y) => x + y, 0) / STUDY_L.length;
    if ((means[t] ?? 0) >= 1 / STUDY_ARL_A) return t;
  }
  return Infinity;
}
/** Study 1, the statistic R of stepStats and crossings, copied operation by operation; the mean of each step kept. */
function studyB(labels: Uint8Array, means: Float64Array): number {
  const R = STUDY_L.map(() => 0);
  for (let i = 0; i < labels.length; i++) {
    const E = labels[i] ?? 0;
    for (let j = 0; j < STUDY_L.length; j++) R[j] = (1 + at(R, j)) * (1 + at(STUDY_L, j) * (E / STUDY_A - 1));
    means[i + 1] = R.reduce((x, y) => x + y, 0) / R.length;
    if ((means[i + 1] ?? 0) >= 1 / STUDY_ARL_B) return i + 1;
  }
  return Infinity;
}
/** The same first crossing on both sides, or none in the horizon: "same"; a one-step gap at a float mean within 1e-9 of the threshold
 *  at the step in cause: "gap", admitted and counted; anything else: "break", asserted absent by the test of the stream. */
function parity(study: number, lib: number, means: Float64Array, delta: number): "same" | "gap" | "break" {
  if (study === lib) return "same";
  const m = means[Math.min(study, lib)] ?? Number.NaN;
  return Math.abs(study - lib) === 1 && Math.abs(m * delta - 1) <= 1e-9 ? "gap" : "break";
}
/** The mean, the empirical standard deviation (divisor n - 1) and 3.09 standard errors. */
function stats(xs: readonly number[]): { mean: number; sd: number; tol: number } {
  const n = xs.length, mean = xs.reduce((p, v) => p + v, 0) / n;
  const sd = Math.sqrt(xs.reduce((p, v) => p + (v - mean) ** 2, 0) / (n - 1));
  return { mean, sd, tol: (3.09 * sd) / Math.sqrt(n) };
}
interface Kept { readonly labels: Uint8Array; readonly stop: number }
interface Run { readonly lib: number[]; readonly study: number[]; readonly gaps: number; readonly breaks: string[]; readonly x: number[];
  readonly kept: Kept[]; readonly ms: number; readonly floatMs: number }
/** One stream section: n paths of H labels drawn first, the study's float loop, then the library loop to its first crossing. x is
 *  U~ = S~ + 1/(stop + 1) for the detector, D = M~ - stop for the reading; kept: the labels of the first crossing and missing paths. */
function section(next: () => 0 | 1, H: number, detector: boolean, keep: readonly [number, number]): Run {
  const lib: number[] = [], study: number[] = [], x: number[] = [], hit: Kept[] = [], miss: Kept[] = [], breaks: string[] = [];
  let gaps = 0, ms = 0, floatMs = 0;
  for (let i = 0; i < N; i++) {
    const labels = new Uint8Array(H), means = new Float64Array(H + 1);
    for (let j = 0; j < H; j++) labels[j] = next();
    let t0 = performance.now();
    const st = detector ? studyA(labels, means) : studyB(labels, means);
    floatMs += performance.now() - t0;
    t0 = performance.now();
    let v = zero(), li = Infinity, stop = H;
    for (let t = 1; t <= H; t++) {
      const E = bit(labels[t - 1] ?? 0);
      v = detector ? weightedStep(v, MIX, M, E, t) : srStep(v, MIX, M, E);
      if (reaches(v, detector ? N_ARL : N_SR)) {
        li = t;
        stop = t;
        break;
      }
    }
    ms += performance.now() - t0;
    const p = parity(st, li, means, detector ? STUDY_ARL_A : STUDY_ARL_B);
    if (p === "gap") gaps++;
    if (p === "break") breaks.push(`path ${s(i)}: study ${s(st)}, library ${s(li)}`);
    if (li < Infinity) {
      lib.push(li);
      if (hit.length < keep[0]) hit.push({ labels, stop });
    } else if (miss.length < keep[1]) miss.push({ labels, stop });
    if (st < Infinity) study.push(st);
    x.push(detector ? flt(v) + 1 / (stop + 1) : flt(v) - stop);
  }
  return { lib, study, gaps, breaks, x, kept: [...hit, ...miss], ms, floatMs };
}
let memoA: Run | undefined;
function runA(): Run {
  const r = lcg(jump(SEED_A, JUMP_A));
  memoA ??= section(() => (r.next() < P_A ? 1 : 0), H_A, true, [INSTANTS_A.length, 2]);
  return memoA;
}
let memoB: (Run & { readonly H: number })[] | undefined;
function runB(): (Run & { readonly H: number })[] {
  if (memoB !== undefined) return memoB;
  const r = lcg(jump(SEED_B, POS_B500)), out: (Run & { readonly H: number })[] = [];
  const next = (): 0 | 1 => {
    let E: 0 | 1 = r.next() < P_B ? 1 : 0;
    if (r.next() < U_B) E = 1;
    return E;
  };
  for (const [H, pos] of [[500, POS_B500], [1000, POS_B1000], [5000, POS_B5000]] as const) {
    assert.equal(r.state(), jump(SEED_B, pos), `H ${s(H)}: the stream walked from the jump`);
    out.push({ ...section(next, H, false, [5, 1]), H });
  }
  memoB = out;
  return out;
}
let memoC: Run | undefined;
function runC(): Run {
  const r = lcg(jump(SEED_B, POS_C));
  memoC ??= section(() => {
    let E: 0 | 1 = r.next() < P_B ? 1 : 0;
    if (r.next() < U_B) E = 1;
    return E;
  }, H_C, false, [0, 0]);
  return memoC;
}
const ds = (t: number, sv: readonly string[], r: readonly string[], last_seq: number | null, alarm_at: number | null,
  alarm_seq: number | null): DetState => ({ t, s: sv, r, last_seq, alarm_at, alarm_seq });
const rep = (n: number, E: 0 | 1): (0 | 1)[] => new Array<0 | 1>(n).fill(E);
/** detStep over a suite of labels, seq = first + stride (i - 1) at the label of rank i, every state kept. */
function walk(labels: readonly (0 | 1)[], first = 0, stride = 1): DetState[] {
  let d = detInit(FIX);
  return labels.map((E, i) => (d = detStep(d, { seq: first + stride * i, E }, FIX)));
}

// killer: packages/hikae/src/pari/weighted.ts:19 CONST "UNIT / (" -> "2n * UNIT / ("
test("detector_pfa_control", (t) => {
  const w = lcg(SEED_A);
  for (let i = 0; i < 100000; i++) w.next();
  assert.equal(jump(SEED_A, 100000), w.state(), "the jump against a walk of 100 000 draws");
  assert.equal(jump(SEED_A, 0), SEED_A, "no draw");
  assert.equal(frac(FIX.alpha_arl)[0], 1n, "alpha_arl = 1/n");
  const a = runA(), arl = 1 / Number(N_ARL), band = arl + 3.09 * Math.sqrt((arl * (1 - arl)) / N), freq = a.lib.length / N;
  t.diagnostic(`(A): ${s(a.lib.length)} alarms of ${s(N)} before ${s(H_A)}, admitted one-step gaps ${s(a.gaps)}, band ${band.toFixed(6)}`);
  t.diagnostic(`(A): library loop ${a.ms.toFixed(0)} ms, float loop ${a.floatMs.toFixed(0)} ms`);
  assert.deepEqual(a.breaks, [], "(A): the same first alarm on every path, or a one-step gap at a float tie");
  assert.deepEqual(a.lib, INSTANTS_A, "the library's alarm instants, in path order");
  assert.deepEqual(a.study, INSTANTS_A, "the study's alarm instants, on the same labels");
  assert.ok(Math.abs(band - 0.016875) <= 1e-6 && freq <= band, `frequency ${s(freq)} above the band ${s(band)}`);
});

// killer: packages/hikae/src/pari/weighted.ts:19 CONST "UNIT / (BigInt(t) * BigInt(t + 1))" -> "UNIT / BigInt(t)"
test("detector_restart_supermartingale", (t) => {
  // sum_{j = a + 1}^{a + n} 1/(j (j + 1)) = 1/(a + 1) - 1/(a + n + 1) = n / ((a + 1) (a + n + 1)), in fractions of bigint.
  for (let a0 = 0; a0 <= 50; a0++) {
    for (let n = 1; n <= 50; n++) {
      let sn = 0n, sd = 1n;
      for (let j = a0 + 1; j <= a0 + n; j++) [sn, sd] = [sn * BigInt(j * (j + 1)) + sd, sd * BigInt(j * (j + 1))];
      assert.equal(sn * BigInt((a0 + 1) * (a0 + n + 1)), BigInt(n) * sd, `the restart weights from ${s(a0 + 1)}, ${s(n)} terms`);
    }
  }
  const a = runA(), u = stats(a.x), bound = 1 + u.tol;
  t.diagnostic(`U~ at min(tau, ${s(H_A)}): mean ${u.mean.toFixed(6)}, sd ${u.sd.toFixed(6)}, bound ${bound.toFixed(6)}, max ${Math.max(...a.x).toFixed(6)}`);
  assert.equal(a.x.length, N, "one value per path");
  assert.ok(u.mean <= bound, `mean of U~ ${s(u.mean)} above 1 + 3.09 standard errors ${s(bound)}`);
});

// killer: packages/hikae/src/pari/sr.ts:50 CONST "(UNIT + v)" -> "(2n * UNIT + v)"
test("detector_sr_reading_false_alarm_before_h_mc", (t) => {
  const w = lcg(SEED_B);
  for (let i = 0; i < 100000; i++) w.next();
  assert.equal(jump(SEED_B, 100000), w.state(), "the jump against a walk of 100 000 draws");
  for (const [i, b] of runB().entries()) {
    const h = b.H / Number(N_SR), band = h + 3.09 * Math.sqrt((h * (1 - h)) / N);
    t.diagnostic(`H ${s(b.H)}: library ${s(b.lib.length)}, study ${s(b.study.length)} of ${s(N)}, admitted one-step gaps ${s(b.gaps)}, band ${band.toFixed(6)}`);
    t.diagnostic(`H ${s(b.H)}: library loop ${b.ms.toFixed(0)} ms, float loop ${b.floatMs.toFixed(0)} ms`);
    assert.deepEqual(b.breaks, [], `H ${s(b.H)}: the same first crossing on every path, or a one-step gap at a float tie`);
    assert.equal(b.lib.length, at(COUNTS_B, i), `H ${s(b.H)}: the library's count`);
    assert.equal(b.study.length, at(COUNTS_B, i), `H ${s(b.H)}: the study's count, on the same labels`);
    assert.ok(Math.abs(band - at(BANDS_B, i)) <= 1e-6 && b.lib.length / N <= band, `H ${s(b.H)}: above the band ${s(band)}`);
  }
});

// killer: packages/hikae/src/pari/sr.ts:50 CONST "(UNIT + v)" -> "(2n * UNIT + v)"
test("detector_sr_reading_expectation", (t) => {
  for (const b of runB()) {
    const d = stats(b.x);
    t.diagnostic(`H ${s(b.H)}: mean of M~ - min(N*, H) ${d.mean.toFixed(3)}, sd ${d.sd.toFixed(3)}, tolerance ${d.tol.toFixed(3)}, ${(d.mean / (d.tol / 3.09)).toFixed(2)} standard errors`);
    assert.equal(b.x.length, N, "one difference per path");
    assert.ok(d.mean <= d.tol, `H ${s(b.H)}: mean difference ${s(d.mean)} above 3.09 standard errors ${s(d.tol)}`);
  }
});

// killer: packages/hikae/src/pari/sr.ts:50 CONST "(UNIT + v)" -> "(2n * UNIT + v)"
test("detector_sr_reading_arl_lower_bound", (t) => {
  assert.equal(POS_C, POS_B5000 + 2 * 5000 * N, "(C) starts where the stream of (B) ends");
  const c = runC(), runs = [...c.lib, ...new Array<number>(N - c.lib.length).fill(H_C)], d = stats(runs), lb = d.mean - d.tol;
  t.diagnostic(`(C): library ${s(c.lib.length)}, study ${s(c.study.length)} of ${s(N)} before ${s(H_C)}, admitted one-step gaps ${s(c.gaps)}`);
  t.diagnostic(`(C): min(N~*, H) mean ${d.mean.toFixed(1)}, sd ${d.sd.toFixed(1)}, lower bound ${lb.toFixed(1)}; library loop ${c.ms.toFixed(0)} ms, float loop ${c.floatMs.toFixed(0)} ms`);
  assert.deepEqual(c.breaks, [], "(C): the same first crossing on every path, or a one-step gap at a float tie");
  assert.equal(c.lib.length, COUNT_C, "(C): the library's count");
  assert.equal(c.study.length, COUNT_C, "(C): the study's count, on the same labels");
  // min(N~*, H) <= N~*: a lower confidence bound on its mean above the threshold bounds E[N~*] from below.
  assert.ok(lb >= Number(N_SR), `(C): lower bound ${s(lb)} of the mean of min(N~*, ${s(H_C)}) under ${s(N_SR)}`);
});

// killer: packages/hikae/src/suivi/detector.ts:92 CONST "label.E, t);" -> "label.E, t + 1);"
test("detector_parity_per_path", (t) => {
  const t0 = performance.now(), arl = qParse(FIX.alpha_arl), delta = srReadingDelta(FIX), a = runA(), b = at(runB(), 0);
  assert.deepEqual([a.kept.length, b.kept.length, b.H], [20, 6, 500], "18 alarming paths and two silent ones; five crossing and one silent");
  let steps = 0;
  for (const [i, k] of a.kept.entries()) {
    let d = detInit(FIX), v = zero();
    for (let j = 1; j <= k.stop; j++) {
      const label: Label = { seq: j - 1, E: bit(k.labels[j - 1] ?? 0) }, rings = i < INSTANTS_A.length && j === k.stop, at1 = `(A) path ${s(i)}, step ${s(j)}`;
      d = detStep(d, label, FIX);
      v = weightedStep(v, MIX, M, label.E, j);
      steps++;
      assert.equal(crosses(weightedValue(v, MIX), arl), reaches(v, N_ARL), `${at1}: the integer threshold is crosses`);
      assert.equal(reaches(v, N_ARL), rings, `${at1}: the loop crosses at its stop only`);
      assert.equal(alarm(d, FIX), rings, `${at1}: alarm`);
      assert.equal(d.alarm_at, rings ? j : null, `${at1}: alarm_at`);
      assert.deepEqual(d.s, v.map(s), `${at1}: the components of S~`);
    }
  }
  for (const [i, k] of b.kept.entries()) {
    let d = detInit(FIX), v = zero();
    for (let j = 1; j <= k.stop; j++) {
      const label: Label = { seq: j - 1, E: bit(k.labels[j - 1] ?? 0) }, crossing = i < 5 && j === k.stop, at1 = `(B) path ${s(i)}, step ${s(j)}`;
      d = detStep(d, label, FIX);
      v = srStep(v, MIX, M, label.E);
      steps++;
      const rd = srReading(d, FIX);
      assert.equal(crosses(srValue(v, MIX), delta), reaches(v, N_SR), `${at1}: the integer threshold is crosses`);
      assert.equal(reaches(v, N_SR), crossing, `${at1}: the loop crosses at its stop only`);
      assert.equal(rd.above, crossing, `${at1}: above`);
      assert.deepEqual(rd.value, srValue(v, MIX), `${at1}: the value of the reading`);
      assert.deepEqual(d.r, v.map(s), `${at1}: the components of R~`);
    }
  }
  t.diagnostic(`${s(steps)} steps through detStep, ${(performance.now() - t0).toFixed(0)} ms`);
});

// killer: packages/hikae/src/suivi/detector.ts:93 CONST "crosses(weightedValue(s, x.mix), x.arl);" -> "(crosses(weightedValue(s, x.mix), x.arl) || crosses(srValue(r, x.mix), srReadingDelta(policy)));"
test("detector_sr_reading_never_acts", () => {
  const arl = 1 / Number(N_ARL);
  let mx = 0;
  for (const [i, d] of walk([...rep(200, 0), ...rep(8, 1), ...rep(92, 0)]).entries()) {
    assert.ok(!alarm(d, FIX) && d.alarm_at === null, `step ${s(i + 1)}: no alarm`);
    assert.equal(srReading(d, FIX).above, i + 1 === 208, `step ${s(i + 1)}: above at 208 only`);
    assert.deepEqual(srReading(d, FIX).value, srValue(d.r.map(BigInt), MIX), `step ${s(i + 1)}: the value is the library value of R~`);
    mx = Math.max(mx, flt(d.s.map(BigInt)) * arl);
  }
  assert.ok(Math.abs(mx - 0.00977113420337542) <= 1e-9, `the largest detector value times alpha_arl ${s(mx)}`);
  for (const [i, d] of walk(rep(10, 1)).entries()) {
    assert.equal(alarm(d, FIX), i + 1 >= 5, `ten ones, step ${s(i + 1)}: alarm from step 5`);
    assert.equal(srReading(d, FIX).above, i + 1 >= 8, `ten ones, step ${s(i + 1)}: above from step 8`);
  }
});

// killer: packages/hikae/src/suivi/detector.ts:100 CONST "d.alarm_at !== null" -> "crosses(weightedValue(d.s.map((c) => BigInt(c)), betsOf(policy).mix), betsOf(policy).arl)"
test("detector_alarm_sticky", () => {
  const fifth = detStep(at(walk(rep(4, 1), 7, 2), 3), { seq: 15, E: 1 }, FIX);
  assert.deepEqual([fifth.t, fifth.last_seq, fifth.alarm_at, fifth.alarm_seq], [5, 15, 5, 15], "the fifth one, before any later step: t' 5, its seq, the alarm at 5");
  const labels = [...rep(14, 1), ...rep(26, 0)], xs = walk(labels, 7, 2), arl = 1 / Number(N_ARL);
  let v = zero();
  for (const [i, d] of xs.entries()) {
    const t = i + 1;
    v = weightedStep(v, MIX, M, at(labels, i), t);
    assert.deepEqual(d.s, v.map(s), `step ${s(t)}: S~ computed after the alarm`);
    assert.equal(alarm(d, FIX), t >= 5, `step ${s(t)}: alarm from step 5 on`);
    assert.deepEqual([d.alarm_at, d.alarm_seq], t >= 5 ? [5, 15] : [null, null], `step ${s(t)}: alarm_at and the seq of the fifth label`);
    assert.equal(flt(v) * arl >= 1, t >= 5 && t < 29, `step ${s(t)}: the detector value back under 1/alpha_arl at step 29`);
    assert.equal(srReading(d, FIX).above, t >= 8 && t < 22, `step ${s(t)}: the reading above from 8 to 21`);
  }
  assert.notDeepEqual(at(xs, 39).s, at(xs, 4).s, "S~ at step 40 is not S~ at step 5");
  assert.equal(alarm(detInit(FIX), FIX), false, "detInit: no alarm");
});

// killer: packages/hikae/src/suivi/detector.ts:64 SDL "if (alarm_seq + (t - alarm_at) > last) bad(\"alarm_seq too late for the labels after it\");" -> ""
test("detector_state_invariants_refused", () => {
  const Z4 = ["0", "0", "0", "0"], S4 = ["1", "2", "3", "4"], R4 = ["5", "6", "7", "8"], H = s(100n * UNIT);
  const BIG = [H, H, H, H], LOW = [s(100n * UNIT - 1n), H, H, H], swap = (xs: readonly string[], i: number, c: string): string[] => xs.map((x, j) => (j === i ? c : x));
  assert.ok(reaches(BIG.map(BigInt), N_ARL) && !reaches(LOW.map(BigInt), N_ARL), "BIG at 1/alpha_arl, LOW under");
  assert.deepEqual(detInit(FIX), ds(0, Z4, Z4, null, null, null), "the start");
  const valid: readonly [string, DetState][] = [["start", ds(0, Z4, Z4, null, null, null)], ["three labels", ds(3, S4, R4, 5, null, null)],
    ["alarm", ds(5, S4, R4, 7, 3, 4)], ["alarm at t", ds(5, S4, R4, 7, 5, 7)], ["under 1/alpha_arl", ds(3, LOW, R4, 5, null, null)],
    ["above, alarm set", ds(3, BIG, R4, 5, 2, 3)], ["alarm_seq at its latest", ds(5, S4, R4, 7, 3, 5)], ["alarm_seq at its earliest", ds(5, S4, R4, 7, 4, 3)],
    ["t = last_seq + 1", ds(3, S4, R4, 2, null, null)]];
  for (const [what, x] of valid) {
    assert.doesNotThrow(() => detStep(x, { seq: 100, E: 0 }, FIX), `valid ${what}: detStep`);
    assert.doesNotThrow(() => alarm(x, FIX), `valid ${what}: alarm`);
    assert.doesNotThrow(() => srReading(x, FIX), `valid ${what}: srReading`);
  }
  // Each state breaks one rule alone (checked by the test writer's reference checker of F1 to F8 and P1).
  const bad: readonly [string, DetState][] = [["t 3.5", ds(3.5, S4, R4, 5, null, null)], ["t -1", ds(-1, S4, R4, 5, null, null)],
    ["t 2^53", ds(2 ** 53, S4, R4, 2 ** 53 - 1, null, null)], ["last_seq 4.5", ds(3, S4, R4, 4.5, null, null)],
    ["last_seq NaN", ds(3, S4, R4, Number.NaN, null, null)], ["alarm_at 2.5", ds(5, S4, R4, 7, 2.5, 4)], ["alarm_seq 4.5", ds(5, S4, R4, 7, 3, 4.5)],
    ...["01", "0x10", " 1", "-1"].map((c, i): [string, DetState] => [`s ${JSON.stringify(c)}`, ds(3, swap(S4, i, c), R4, 5, null, null)]),
    ...["", "1 ", "+1", "1e3"].map((c, i): [string, DetState] => [`r ${JSON.stringify(c)}`, ds(3, S4, swap(R4, i, c), 5, null, null)]),
    ["last_seq set at t 0", ds(0, Z4, Z4, 4, null, null)], ["last_seq null at t 3", ds(3, S4, R4, null, null, null)],
    ["s nonzero at t 0", ds(0, swap(Z4, 0, "1"), Z4, null, null, null)], ["r nonzero at t 0", ds(0, Z4, swap(Z4, 3, "1"), null, null, null)],
    ["t above last_seq + 1", ds(3, S4, R4, 1, null, null)], ["alarm_at without alarm_seq", ds(5, S4, R4, 7, 3, null)],
    ["alarm_seq without alarm_at", ds(5, S4, R4, 7, null, 4)], ["alarm_at 0", ds(5, S4, R4, 7, 0, 2)], ["alarm_at above t", ds(5, S4, R4, 7, 6, 5)],
    ["alarm at t, other seq", ds(5, S4, R4, 7, 5, 6)], ["alarm_seq too late", ds(5, S4, R4, 7, 3, 6)], ["alarm_seq too early", ds(5, S4, R4, 7, 4, 2)],
    ["at 1/alpha_arl without alarm", ds(3, BIG, R4, 5, null, null)],
    ["s of three components", ds(3, S4.slice(1), R4, 5, null, null)], ["r of five components", ds(3, S4, [...R4, "9"], 5, null, null)]];
  for (const [what, x] of bad) {
    assert.throws(() => detStep(x, { seq: 100, E: 0 }, FIX), RangeError, `${what}: detStep`);
    assert.throws(() => alarm(x, FIX), RangeError, `${what}: alarm`);
    assert.throws(() => srReading(x, FIX), RangeError, `${what}: srReading`);
  }
  const v1 = ds(3, S4, R4, 5, null, null);
  assert.doesNotThrow(() => detStep(v1, { seq: 6, E: 1 }, FIX), "seq last_seq + 1");
  assert.doesNotThrow(() => detStep(detInit(FIX), { seq: 0, E: 1 }, FIX), "seq 0 first");
  for (const seq of [-1, 1.5, 5]) assert.throws(() => detStep(v1, { seq, E: 0 }, FIX), RangeError, `label seq ${s(seq)} after 5`);
  assert.throws(() => detStep(v1, { seq: 6, E: bit(2) }, FIX), RangeError, "label E 2");
  assert.throws(() => detStep(detInit(FIX), { seq: -1, E: 0 }, FIX), RangeError, "seq -1 on the first label");
  assert.throws(() => detStep(v1, { seq: 6, E: bit(2) }, FIX), /detStep: label E 2 is neither 0 nor 1/, "label E 2: the refusal of detStep");
  const rung = detStep(ds(3, LOW, R4, 5, null, null), { seq: 6, E: 1 }, FIX);
  assert.deepEqual([rung.t, rung.last_seq, rung.alarm_at, rung.alarm_seq], [4, 6, 4, 6], "LOW and a one: t' 4, the seq 6, the alarm at 4 (mean 250.125)");
  const noSr = asPolicy(Object.fromEntries(Object.entries(FIX).filter(([k]) => k !== "bets_sr")));
  for (const [what, p] of [["bets_sr { 1 }", { ...FIX, bets_sr: { lambdas: ["1"], weights: ["1"] } }], ["no bets_sr", noSr]] as const) {
    assert.throws(() => detInit(p), RangeError, `${what}: detInit`);
    assert.throws(() => detStep(v1, { seq: 6, E: 0 }, p), RangeError, `${what}: detStep`);
    assert.throws(() => alarm(v1, p), RangeError, `${what}: alarm`);
    assert.throws(() => srReading(v1, p), RangeError, `${what}: srReading`);
  }
});
