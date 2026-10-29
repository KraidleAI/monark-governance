/**
 * HIKAE tracking (packages/hikae/src/suivi/) - the five modules composed, and M1, the monitor of the miss rate.
 * What the modules compute. m1.ts: one step of M1, r' = imocpStep(r, alpha, E, eta) with E = 1{s01 > r} derived inside, no projection of
 * r, r refused outside the band [imocpStep(0, alpha, 0, eta), imocpStep(1, alpha, 1, eta)], and its bound (1 + eta)/(eta T) on
 * |k_T/T - alpha|. policy.ts, label.ts, o4.ts and detector.ts composed on the 613 committed calibration scores of the USDe cell, one
 * evaluation per step; the alarm closes an open segment after the step of O4. tracker.ts refuses a step size that is not positive.
 * How the expected values are computed. Never by the modules: the counts of E+ by hand from the outcomes; the bound of M1 in rationals and
 * in integers written here (|10 k_T - T| <= 210 at eta = 1/20); the ranks of the composition by exact rationals written here (the detector
 * on all ones from the texts of bets_sr, S_j <- (S_j + 1/(t (t + 1))) g_j, and W(t, t) from those of bets_w); the other numbers are literals
 * printed by a separate script of the test writer (q-hat and its rank, the budgets, the largest detector and reading values, r_1, r_614
 * and the counts of M1, the perturbation, the step sizes), each to the precision written at its assertion. Seeds fixed before any run:
 * 2026102925 for the LCG suite of M1, 2026102926 for the quadruplets.
 * Category: new-module (red at base by the load of ../src/suivi/detector.ts, which this change adds).
 */
import { alarm, detInit, detStep, srReading } from "../src/suivi/detector.ts";
import type { DetState } from "../src/suivi/detector.ts";
import { m1Bound, m1Step } from "../src/suivi/m1.ts";
import { assertSuiviPolicy, mixtureOf } from "../src/suivi/policy.ts";
import type { SuiviPolicy } from "../src/suivi/policy.ts";
import { enterInOrder } from "../src/suivi/label.ts";
import type { Label } from "../src/suivi/label.ts";
import { budgetNano, o4CloseOnAlarm, o4Init, o4Step } from "../src/suivi/o4.ts";
import type { O4State } from "../src/suivi/o4.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { importSpecifiers } from "../../../apps/harness/test/helpers/import-specifiers.ts";
import { q, weightedValue } from "../src/pari/index.ts";
import { imocpStep, remainingBudget } from "../src/l2-monitor.ts";
import type { Miscover } from "../src/l2-monitor.ts";
import { splitQuantile } from "../src/l1-split.ts";
import { clipScore, trackerStepSize } from "../src/tracker.ts";
import type { TrackerParams } from "../src/tracker.ts";

const s = String;
function at<T>(xs: readonly T[], i: number): T {
  const v = xs[i];
  if (v === undefined) throw new Error(`test-side index ${s(i)} out of range`);
  return v;
}
/** A rational text read here, never by the modules: [numerator, denominator]. */
function frac(text: string): readonly [bigint, bigint] {
  const parts = text.split("/");
  return [BigInt(at(parts, 0)), BigInt(parts[1] ?? "1")];
}
const W4 = ["1/4", "1/4", "1/4", "1/4"];
const FIX: SuiviPolicy = { schema: "hikae-suivi-policy-v1", task_class: "stable-run-velocity-24h",
  cell_key: "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3", population: "usde-consecutive-calm-pairs-v1",
  policy_version: 1, a: "1/5", delta_adm: "1/20", delta_exh: "1/100", alpha_arl: "1/100", m: "1/5", eta_m1: "1/20", sr_reading_threshold: "10000",
  restart_weights: "1/(j(j+1))", bets_k: { lambdas: ["1/16", "1/8", "1/4", "1/2"], weights: W4 },
  bets_w: { lambdas: ["1/4", "1/2", "1", "2"], weights: W4 }, bets_sr: { lambdas: ["1/10", "1/5", "2/5", "4/5"], weights: W4 }, grace_steps: 1,
  grid_ms: 86400000, l_ms: 37800000, thin_window: 90, thin_min: 30, keyring: [] };
const oneBet = (l: string): { lambdas: string[]; weights: string[] } => ({ lambdas: [l], weights: ["1"] });
/** Test policy W: W = 2^(2k - t), so 64 = 1/delta_exh after six ones; one detector bet of 1/2 at m = 1/3. PW256: delta_exh 1/256. */
const PW: SuiviPolicy = { ...FIX, a: "1/3", m: "1/3", bets_w: oneBet("3/2"), bets_k: oneBet("1/2"), bets_sr: oneBet("1/2"), delta_exh: "1/64" };
const PW256: SuiviPolicy = { ...PW, delta_exh: "1/256" };
/** M1 at the USDe class line: B = 1/24 and alpha = 1/10 (TRACKER_PARAMS of apps/sentinel/src/timeline.ts), eta the double of 1/20. */
const B = 1 / 24, ALPHA = 1 / 10, ETA = Number(1n) / Number(20n);
/** The committed scores, their sha256, q-hat (rank 553 of 613) and r_1 = q-hat / B, printed by the test writer's script. */
const SCORES_RAW = readFileSync(new URL("../../../fixtures/usde-calib-scores.json", import.meta.url));
const SCORES = JSON.parse(SCORES_RAW.toString("utf8")) as number[];
const QHAT = 0.00013119228083333334, R1 = QHAT / B, T0 = 1761696000000;
const SUIVI = new URL("../src/suivi/", import.meta.url);

interface Row { readonly label: Label; readonly open: O4State; readonly none: O4State; readonly det: DetState; readonly r: number;
  readonly E1: Miscover; readonly miss: 0 | 1; readonly unres: boolean }
/** One evaluation per step, seq = stride i, resolved and in the population (unresolved when seq is a multiple of every > 0), entered by
 *  enterInOrder, then o4Step from both starts, detStep, and m1Step on s01 = clipScore(s, B) / B. */
function compose(scores: readonly number[], every = 0, stride = 1): Row[] {
  let last: { seq: number; t_step_ms: number } | null = null, open = o4Init(FIX, true), none = o4Init(FIX, false), det = detInit(FIX), r = R1;
  return scores.map((score, i) => {
    const seq = i * stride, t_step_ms = T0 + seq * FIX.grid_ms, unres = every > 0 && seq % every === 0, miss = score > QHAT ? 1 : 0;
    const got = enterInOrder([{ seq, t_step_ms, yhat_ref: "1/10", produced_at_ref: "2026-10-29T00:00:00Z", pre_member: true }],
      [{ seq, resolved: !unres, member: true, miss: unres ? 0 : miss }], FIX, last);
    assert.equal(got.entered.length, 1, `seq ${s(seq)}: one label entered`);
    const label = at(got.entered, 0);
    last = { seq, t_step_ms };
    open = o4Step(open, label, FIX);
    none = o4Step(none, label, FIX);
    det = detStep(det, label, FIX);
    const m = m1Step(r, clipScore(score, B) / B, ALPHA, ETA);
    r = m.r;
    return { label, open, none, det, r, E1: m.E, miss, unres };
  });
}
let memo: Row[] | undefined;
const replay = (): Row[] => (memo ??= compose(SCORES));
/** k_T and r_{T+1} of M1 along a suite of s01 from r_1. */
function m1Run(s01s: readonly number[], r1: number): { k: number[]; r: number[] } {
  const k: number[] = [], r = [r1];
  s01s.forEach((x) => {
    const m = m1Step(at(r, r.length - 1), x, ALPHA, ETA);
    k.push((k.at(-1) ?? 0) + m.E);
    r.push(m.r);
  });
  return { k, r };
}
function lcg(seed: number): () => number {
  let x = seed;
  return () => (x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296;
}
const SEED_M1 = 2026102925, SEED_QUAD = 2026102926;
const lcgSuite = (): number[] => {
  const g = lcg(SEED_M1);
  return [...new Array<number>(20).fill(1), ...Array.from({ length: 980 }, () => g())];
};
/** The next double away from zero. */
function away(x: number): number {
  const f = new Float64Array([x]), b = new BigInt64Array(f.buffer);
  b[0] = (b[0] ?? 0n) + 1n;
  return f[0] ?? Number.NaN;
}
type F = readonly [bigint, bigint];
const fadd = ([a, b]: F, [c, d]: F): F => [a * d + c * b, b * d];
const fmul = ([a, b]: F, [c, d]: F): F => [a * c, b * d];
/** On all ones, in fractions of bigint from the texts: the detector S_j <- (S_j + 1/(t (t + 1))) g_j, g_j = 1 + l_j (1/m - 1), against
 *  1/alpha_arl, and W(t, t) = sum_j w_j (1 + l_j (1 - a))^t against 1/delta_exh; the first rank of each. */
function ranksAllOnes(p: SuiviPolicy): { alarmAt: number; wAt: number } {
  const [mn, md] = frac(p.m), [an, ad] = frac(p.a), arl = frac(p.alpha_arl), exh = frac(p.delta_exh);
  const g = p.bets_sr.lambdas.map((l): F => [frac(l)[1] * mn + frac(l)[0] * (md - mn), frac(l)[1] * mn]);
  const f = p.bets_w.lambdas.map((l): F => [frac(l)[1] * ad + frac(l)[0] * (ad - an), frac(l)[1] * ad]);
  let S = g.map((): F => [0n, 1n]), alarmAt = 0, wAt = 0;
  for (let t = 1; t <= 20; t++) {
    S = S.map((v, j) => fmul(fadd(v, [1n, BigInt(t * (t + 1))]), at(g, j)));
    const v = S.reduce((acc, x, j) => fadd(acc, fmul(x, frac(at(p.bets_sr.weights, j)))), [0n, 1n] as F);
    const W = f.reduce((acc, [n, d], j) => fadd(acc, fmul([n ** BigInt(t), d ** BigInt(t)], frac(at(p.bets_w.weights, j)))), [0n, 1n] as F);
    if (alarmAt === 0 && v[0] * arl[0] >= v[1] * arl[1]) alarmAt = t;
    if (wAt === 0 && W[0] * exh[0] >= W[1] * exh[1]) wAt = t;
  }
  return { alarmAt, wAt };
}
/** All ones from o4Init(p, true) and detInit(p): o4Step, detStep, then o4CloseOnAlarm when alarm and the segment still open. */
function onesComposed(p: SuiviPolicy, n: number): { o: O4State; d: DetState; closes: boolean }[] {
  let o = o4Init(p, true), d = detInit(p);
  return Array.from({ length: n }, (_, i) => {
    const label: Label = { seq: i, E: 1 };
    o = o4Step(o, label, p);
    d = detStep(d, label, p);
    const closes = alarm(d, p) && o.segment.kind === "open";
    if (closes) o = o4CloseOnAlarm(o, p);
    return { o, d, closes };
  });
}

// killer: packages/hikae/src/suivi/detector.ts:41 CONST "mixtureOf(policy.bets_sr)" -> "mixtureOf(policy.bets_k)"
test("suivi_in_sample_replay_library", () => {
  assert.equal(createHash("sha256").update(SCORES_RAW).digest("hex"), "e44a68b6b697a32f3f198770e740ab206393dc3425e8cc59e4b0e1e4e65cfd28", "the fixture");
  const sq = splitQuantile(SCORES, 0.1, 50);
  assert.ok("qhat" in sq && sq.qhat === QHAT, "q-hat of the committed calibration");
  assert.deepEqual([SCORES.length, Math.ceil((SCORES.length + 1) * 0.9), [...SCORES].sort((x, y) => x - y)[552]], [613, 553, QHAT], "613 scores, rank 553");
  assert.equal(SCORES.filter((x) => x > QHAT).length, 60, "60 misses");
  assert.equal(budgetNano(o4Init(FIX, true), FIX), 990000000n, "the open start, W = 1");
  const rows = replay(), mix = mixtureOf(FIX.bets_sr);
  let maxS = [0, 0], maxR = [0, 0], minBudget = 10n ** 9n, k1 = 0, dev = 0;
  for (const [i, x] of rows.entries()) {
    const t = i + 1, sv = Number(weightedValue(x.det.s.map(BigInt), mix).n) / Number(weightedValue(x.det.s.map(BigInt), mix).d) / 100;
    const rd = srReading(x.det, FIX), rv = Number(rd.value.n) / Number(rd.value.d) / 10000, b = budgetNano(x.open, FIX);
    assert.ok(!alarm(x.det, FIX) && !rd.above, `step ${s(t)}: no alarm, the reading under its threshold`);
    assert.ok(x.open.segment.kind === "open" && x.open.licensed_at === (t >= 45 ? 45 : null), `step ${s(t)}: open start, licence at 45`);
    assert.deepEqual(x.none.segment, t >= 45 ? { kind: "open", opened_at: 45, opened_seq: 44 } : { kind: "no_license" }, `step ${s(t)}: no_license start`);
    if (sv > at(maxS, 0)) maxS = [sv, t];
    if (rv > at(maxR, 0)) maxR = [rv, t];
    minBudget = b < minBudget ? b : minBudget;
    k1 += x.E1;
    dev = Math.max(dev, Math.abs(10 * k1 - t));
  }
  assert.equal(minBudget, 991875000n, "the smallest budget after the first label (W delta_exh at most 0.008125)");
  assert.ok(at(maxS, 1) === 2 && Math.abs(at(maxS, 0) - 0.0033541666666666663) <= 1e-9, `largest detector value times alpha_arl ${s(maxS)}`);
  assert.ok(at(maxR, 1) === 458 && Math.abs(at(maxR, 0) - 0.0704088050956253) <= 1e-9, `largest reading value over 10000 ${s(maxR)}`);
  assert.equal(R1, 0.00314861474, "r_1 = q-hat / B");
  assert.equal(k1, 62, "62 misses of M1");
  assert.ok(Math.abs(at(rows, 612).r - 0.03814861473999916) <= 1e-15, `r_614 ${s(at(rows, 612).r)}`);
  assert.ok(dev === 10 && dev <= 210, `largest |10 k_T - T| ${s(dev)}`);
});

// killer: packages/hikae/src/suivi/detector.ts:92 CONST "label.E, t);" -> "label.E, label.seq + 1);"
test("detector_reads_only_labels", () => {
  const specs = importSpecifiers(readFileSync(new URL("detector.ts", SUIVI), "utf8"));
  assert.deepEqual([...new Set(specs)].sort(), ["../pari/index.ts", "./label.ts", "./policy.ts"], "the loads of detector.ts");
  const base = replay(), low = compose(SCORES.map((x) => (x <= QHAT ? QHAT : x))), diff: number[] = [];
  for (const [i, x] of base.entries()) {
    const y = at(low, i);
    assert.deepEqual(y.label, x.label, `step ${s(i + 1)}: the same E+`);
    assert.deepEqual(y.det, x.det, `step ${s(i + 1)}: the same detector state`);
    if (y.E1 !== x.E1) diff.push(i + 1);
  }
  assert.deepEqual([diff.length, diff[0]], [104, 11], "the E of M1 differ at 104 steps, the first at step 11");
  const five = compose(SCORES, 0, 5);
  for (const [i, x] of base.entries()) {
    const y = at(five, i).det;
    assert.deepEqual([y.s, y.r, y.alarm_at], [x.det.s, x.det.r, x.det.alarm_at], `step ${s(i + 1)}: seq 5 i or i, the same statistics`);
  }
  let d1 = detInit(FIX), d5 = detInit(FIX);
  for (let i = 0; i < 14; i++) {
    d1 = detStep(d1, { seq: i, E: 1 }, FIX);
    d5 = detStep(d5, { seq: 5 * i, E: 1 }, FIX);
    assert.deepEqual([d5.s, d5.r, d5.alarm_at], [d1.s, d1.r, d1.alarm_at], `fourteen ones, step ${s(i + 1)}`);
  }
  assert.deepEqual([d1.alarm_seq, d5.alarm_seq], [4, 20], "seq reaches alarm_seq only");
});

// killer: packages/hikae/src/suivi/label.ts:40 CONST "outcome.miss : 1 }" -> "outcome.miss : 0 }"
test("raw_rate_parity_l2_monitor", () => {
  assert.ok(Object.is(remainingBudget([], 0.1), 0.1), "no label: 0.1");
  for (const [every, total, final] of [[0, 60, 0.0021207177814029365], [7, 138, -0.12512234910277323]] as const) {
    const hand: Miscover[] = [];
    for (const [i, x] of (every === 0 ? replay() : compose(SCORES, every)).entries()) {
      hand.push(x.unres || x.miss === 1 ? 1 : 0);
      const kk = hand.reduce((p: number, v) => p + v, 0);
      assert.deepEqual([x.open.k_t, x.open.k_k], [i + 1, kk], `every ${s(every)}, step ${s(i + 1)}: the counts of O4 are those of the E+ entered`);
      assert.ok(Object.is(remainingBudget(hand, 0.1), 0.1 - x.open.k_k / x.open.k_t), `every ${s(every)}, step ${s(i + 1)}: the raw budget`);
    }
    assert.equal(hand.reduce((p: number, v) => p + v, 0), total, `every ${s(every)}: E+ total`);
    assert.ok(Object.is(remainingBudget(hand, 0.1), final), `every ${s(every)}: 0.1 - ${s(total)}/613`);
  }
});

// killer: packages/hikae/src/suivi/m1.ts:33 CONST "eta.d + eta.n," -> "eta.d,"
test("m1_bound_each_step", () => {
  const ones = new Array<number>(1000).fill(1), zeros = new Array<number>(1000).fill(0), alt = Array.from({ length: 1000 }, (_, i) => (i % 2 === 0 ? 1 : 0));
  const k613 = replay().reduce((acc: number[], x) => [...acc, (acc.at(-1) ?? 0) + x.E1], []);
  for (const [what, k, max] of [["s01 = 1", m1Run(ones, 0.5).k, 108], ["s01 = 0", m1Run(zeros, 0.5).k, 100], ["alternated", m1Run(alt, 0.5).k, 107],
    ["20 x 1 then LCG", m1Run(lcgSuite(), 0.5).k, 108], ["the 613", k613, 10]] as const) {
    let dev = 0;
    for (const [i, kT] of k.entries()) {
      const T = i + 1, b = m1Bound(T, q(1n, 20n)), d = Math.abs(10 * kT - T);
      assert.ok(BigInt(d) * b.d <= 10n * BigInt(T) * b.n && d <= 210, `${what}, T ${s(T)}: |k_T/T - 1/10| = ${s(d)}/(10 T) above the bound`);
      dev = Math.max(dev, d);
    }
    assert.equal(dev, max, `${what}: largest |10 k_T - T|`);
  }
  for (let T = 1; T <= 1000; T++) assert.deepEqual(m1Bound(T, q(1n, 20n)), q(21n, BigInt(T)), `21/T at T ${s(T)}`);
  assert.deepEqual(m1Bound(4, q(1n, 3n)), q(1n), "(1 + 1/3) / (4/3)");
});

// killer: packages/hikae/src/suivi/m1.ts:25 CONST "r: imocpStep(r, alpha, E, eta)" -> "r: Math.min(1, Math.max(0, imocpStep(r, alpha, E, eta)))"
test("m1_telescoping_identity", () => {
  const xs = lcgSuite(), { k, r } = m1Run(xs, 0.5);
  let sum = 0;
  for (const [i, kT] of k.entries()) sum += ETA * (kT - (k[i - 1] ?? 0) - ALPHA);
  const gap = Math.abs(sum - (at(r, 1000) - at(r, 0)));
  assert.ok(gap <= 1e-12, `sum of eta (E_t - alpha) against r_1001 - r_1: ${s(gap)}`);
  assert.equal(Math.max(...r), 1.0400000000000005, "the trajectory leaves [0, 1]");
});

// killer: packages/hikae/src/suivi/m1.ts:25 CONST "imocpStep(r, alpha, E, eta)" -> "r - eta * (alpha - E)"
test("m1_reuses_imocp_step", () => {
  const text = readFileSync(new URL("m1.ts", SUIVI), "utf8"), src = ts.createSourceFile("m1.ts", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let calls = 0;
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "imocpStep") calls++;
    ts.forEachChild(n, visit);
  };
  visit(src);
  assert.ok(importSpecifiers(text).includes("../l2-monitor.ts") && calls >= 1, "m1.ts loads ../l2-monitor.ts and calls imocpStep");
  const callsOnR = (n: ts.Node): boolean => (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "imocpStep" &&
    n.arguments[0] !== undefined && ts.isIdentifier(n.arguments[0]) && n.arguments[0].text === "r") || ts.forEachChild(n, callsOnR) === true;
  const step = src.statements.find((n): n is ts.FunctionDeclaration => ts.isFunctionDeclaration(n) && n.name?.text === "m1Step");
  assert.ok(step?.parameters[0] !== undefined && ts.isIdentifier(step.parameters[0].name) && step.parameters[0].name.text === "r" && callsOnR(step),
    "m1Step, whose first parameter is r, calls imocpStep with r as its first argument");
  assert.equal(m1Step(0.5, 0.5, ALPHA, ETA).E, 0, "s01 = r: E = 0, the strict inequality");
  const g = lcg(SEED_QUAD);
  for (let i = 0; i < 1000; i++) {
    const al = 0.01 + 0.98 * g(), et = 0.001 + g(), u3 = g(), s01 = g();
    const lo = imocpStep(0, al, 0, et), hi = imocpStep(1, al, 1, et), r = lo + (hi - lo) * u3, E = s01 > r ? 1 : 0;
    assert.ok(r >= lo && r <= hi, `quadruplet ${s(i)}: r in the band`);
    const got = m1Step(r, s01, al, et);
    assert.ok(Object.is(got.r, imocpStep(r, al, E, et)) && got.E === E, `quadruplet ${s(i)}: imocpStep with E = 1{s01 > r}`);
  }
});

// killer: packages/hikae/src/suivi/m1.ts:23 ROR "r < imocpStep(0" -> "r <= imocpStep(0"
test("m1_inputs_refused", () => {
  const lo = imocpStep(0, ALPHA, 0, ETA), hi = imocpStep(1, ALPHA, 1, ETA);
  assert.deepEqual([lo, hi, away(lo), away(hi)], [-0.005000000000000001, 1.045, -0.005000000000000002, 1.0450000000000002], "the band and its next doubles");
  for (const [r, x] of [[lo, 0], [lo, 1], [hi, 0], [hi, 1], [0.5, 0], [0.5, 1]] as const) assert.doesNotThrow(() => m1Step(r, x, ALPHA, ETA), `r ${s(r)}, s01 ${s(x)}`);
  const refused: readonly [string, number, number, number, number][] = [["s01 NaN", 0.5, Number.NaN, ALPHA, ETA], ["s01 Infinity", 0.5, Infinity, ALPHA, ETA],
    ["s01 under 0", 0.5, -1e-12, ALPHA, ETA], ["s01 above 1", 0.5, away(1), ALPHA, ETA], ["alpha NaN", 0.5, 0.3, Number.NaN, ETA],
    ["alpha Infinity", 0.5, 0.3, Infinity, ETA], ["alpha 0", 0.5, 0.3, 0, ETA], ["alpha 1", 0.5, 0.3, 1, ETA], ["alpha -0.1", 0.5, 0.3, -0.1, ETA],
    ["eta NaN", 0.5, 0.3, ALPHA, Number.NaN], ["eta Infinity", 0.5, 0.3, ALPHA, Infinity], ["eta 0", 0.5, 0.3, ALPHA, 0], ["eta -0", 0.5, 0.3, ALPHA, -0],
    ["eta -0.05", 0.5, 0.3, ALPHA, -0.05], ["r NaN", Number.NaN, 0.3, ALPHA, ETA], ["r Infinity", Infinity, 0.3, ALPHA, ETA],
    ["r -Infinity", -Infinity, 0.3, ALPHA, ETA], ["r under the band", away(lo), 0.3, ALPHA, ETA], ["r above the band", away(hi), 0.3, ALPHA, ETA]];
  for (const [what, r, x, al, et] of refused) assert.throws(() => m1Step(r, x, al, et), RangeError, `m1Step: ${what}`);
  assert.deepEqual(m1Bound(1, q(1n, 20n)), q(21n), "T = 1");
  for (const T of [0, -1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => m1Bound(T, q(1n, 20n)), RangeError, `m1Bound: T ${s(T)}`);
  for (const eta of [q(0n), q(-1n, 20n)]) assert.throws(() => m1Bound(10, eta), RangeError, `m1Bound: eta ${s(eta.n)}/${s(eta.d)}`);
  assert.throws(() => m1Bound(0, q(1n, 20n)), /m1Bound: T 0 is not a safe integer >= 1/, "m1Bound: T 0, its own refusal");
  for (const eta of [q(0n), { n: 1, d: 20n }, { n: 1n, d: 20 }, { n: 1n, d: 0n }, { n: 1n, d: -20n }]) {
    assert.throws(() => m1Bound(10, eta as unknown as ReturnType<typeof q>), /m1Bound: eta is not a rational/, `m1Bound: eta ${s(eta.n)}/${s(eta.d)}, its own refusal`);
  }
});

// killer: packages/hikae/src/tracker.ts:83 ROR "eta <= 0" -> "eta < 0"
test("tracker_step_size_rejects_nonpositive", () => {
  const good: TrackerParams = { alpha: 0.1, c: 1 / 24, eps: 0.1, t0: 0, B: 1 / 24 };
  const nonPositive = (e: unknown): boolean => e instanceof Error && !(e instanceof RangeError) && e.message.includes("non-positive step");
  for (const [what, t, p] of [["c 0", 0, { ...good, c: 0 }], ["c -1", 0, { ...good, c: -1 }], ["c -0", 0, { ...good, c: -0 }],
    ["eps 1000 at t 2", 2, { ...good, eps: 1000 }]] as const) assert.throws(() => trackerStepSize(t, p), nonPositive, what);
  assert.throws(() => trackerStepSize(-1, { ...good, t0: 0 }), /non-finite step/, "base 0");
  assert.equal(trackerStepSize(0, { ...good, c: Number.MIN_VALUE }), 5e-324, "the smallest positive step");
  assert.equal(trackerStepSize(1, { ...good, eps: 1000 }), 2.749654305326338e-303, "eps 1000 at t 1, positive");
  assert.equal(trackerStepSize(0, good), 1 / 24, "base 1");
});

// killer: packages/hikae/src/suivi/detector.ts:41 CONST "qParse(policy.alpha_arl)" -> "qParse(policy.delta_exh)"
test("suivi_alarm_composition_precedence", () => {
  assert.doesNotThrow(() => assertSuiviPolicy(PW256), "delta_exh 1/256 in (0, 1)");
  assert.deepEqual([ranksAllOnes(FIX), ranksAllOnes(PW), ranksAllOnes(PW256)], [{ alarmAt: 5, wAt: 7 }, { alarmAt: 8, wAt: 6 }, { alarmAt: 8, wAt: 8 }], "the ranks");
  const f = onesComposed(FIX, 10), closedA = { kind: "closed", opened_at: 0, opened_seq: null, closed_at: 5, closed_seq: 4, closed_by: "alarm" };
  assert.ok(at(f, 3).o.segment.kind === "open" && !alarm(at(f, 3).d, FIX), "FIX, step 4: open, no alarm");
  for (let i = 4; i < 10; i++) {
    const x = at(f, i);
    assert.deepEqual([x.o.segment, x.o.w_t, x.o.w_k, x.d.alarm_at, x.closes], [closedA, 5, 5, 5, i === 4], `FIX, step ${s(i + 1)}: closed by the alarm at 5`);
    assert.equal(budgetNano(x.o, FIX), -1n, `FIX, step ${s(i + 1)}: budget -1`);
  }
  const w = onesComposed(PW, 8);
  assert.deepEqual([at(w, 5).o.segment, alarm(at(w, 5).d, PW), alarm(at(w, 6).d, PW)],
    [{ kind: "closed", opened_at: 0, opened_seq: null, closed_at: 6, closed_seq: 5, closed_by: "w_exhausted" }, false, false], "PW: W closes at 6");
  const w8 = at(w, 7);
  assert.deepEqual([w8.d.alarm_at, w8.closes, w8.o.segment.kind === "closed" ? w8.o.segment.closed_by : ""], [8, false, "w_exhausted"], "PW: the alarm at 8");
  assert.throws(() => o4CloseOnAlarm(w8.o, PW), RangeError, "PW: the segment is closed");
  const v = onesComposed(PW256, 8), v8 = at(v, 7);
  assert.ok(at(v, 6).o.segment.kind === "open" && !alarm(at(v, 6).d, PW256), "PW256, step 7: open, no alarm");
  assert.deepEqual([v8.o.segment, v8.d.alarm_at, v8.closes],
    [{ kind: "closed", opened_at: 0, opened_seq: null, closed_at: 8, closed_seq: 7, closed_by: "w_exhausted" }, 8, false], "PW256: W first, then the alarm");
});
