/**
 * HIKAE tracking (packages/hikae/src/suivi/) - the policy, the labels and the O4 state.
 * What the modules compute. policy.ts: a closed policy object of 22 keys whose rationals are texts, its refusals, its canonical sha256, the
 * mixtures of its bets and the inverse of the reading threshold. label.ts: one label per evaluation and per horizon, entered in the order
 * of the evaluations. o4.ts: the licence of a cell by the test K, the closure of its segment by the test W or by an alarm, and the budget
 * floor(10^9 (1 - delta_exh W)) of an open segment, -1 elsewhere.
 * How the expected values are computed. Never by the modules: by hand, by closed forms in bigint written here (the capital of a mixture from
 * its factors; under the test policy W, one bet of 3/2 at a = 1/3, W = 2^(2k - t) and K = (7/6)^(t - k) (2/3)^k), by an exact dynamic
 * program over (t, k) in floats whose frontier is computed here, and by literals printed by a separate script of the test writer (the
 * canonical sha256 of two policies by its own writer, sorted keys and minified JSON; the probabilities of the program, to 1e-7).
 * Category: new-module (red at base by the load of ../src/suivi/policy.ts, which this change adds). No clock, no seed.
 */
import { assertSuiviPolicy, mixtureOf, srReadingDelta, suiviPolicySha256 } from "../src/suivi/policy.ts";
import type { BetsText, SuiviKey, SuiviPolicy } from "../src/suivi/policy.ts";
import { enterInOrder, labelOf } from "../src/suivi/label.ts";
import type { Outcome, RefEvaluation } from "../src/suivi/label.ts";
import { budgetNano, o4CloseOnAlarm, o4Init, o4Step } from "../src/suivi/o4.ts";
import type { O4Segment, O4State } from "../src/suivi/o4.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { forbiddenLoads, importSpecifiers } from "../../../apps/harness/test/helpers/import-specifiers.ts";
import { cmp, crosses, crossingTable, q, qParse } from "../src/pari/index.ts";

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
const flt = (text: string): number => Number(frac(text)[0]) / Number(frac(text)[1]);
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
const oneBet = (l: string): BetsText => ({ lambdas: [l], weights: ["1"] });
/** Test policy W: factors of W 2 and 1/2, so W = 2^(2k - t) and W = 64 = 1/delta_exh after six ones; K factors 7/6 and 2/3. */
const PW: SuiviPolicy = { ...FIX, a: "1/3", m: "1/3", bets_w: oneBet("3/2"), bets_k: oneBet("1/2"), bets_sr: oneBet("1/2"), delta_exh: "1/64" };
/** Test policy K: K = 49/36 = 1/delta_adm after two zeros. */
const PK: SuiviPolicy = { ...PW, delta_adm: "36/49" };
/** Two Ed25519 public keys and their sha256 ids, printed by the test writer's key script. */
const KEY1: SuiviKey = { key_id: "a68d9ebbf0aefecece386ae4c6781870c50fde0d266c5559e2fbca5d7739a78d",
  public_key_hex: "428e03a3445e08c3bf3bbafbd9848afd4a1cbdc2912466834cbc89a1448b33bf", from_seq: 0 };
const KEY2: SuiviKey = { key_id: "222f57bb4bbfa7902c48b31348c9a698d1c59e8d8f9140c9d8236dbeb9c41095",
  public_key_hex: "2f8b4ff227dd2bc7b5d12724ead3ee66edd735629b8ff8dd56fcbc25fc1bf195", from_seq: 5 };

/** The capital of W (side above, 1 + l (x - a)) or of K (side below, 1 + l (a - x)) of a policy, from its formula. */
function capital(p: SuiviPolicy, which: "k" | "w", t: number, k: number): { num: bigint; den: bigint } {
  const [an, ad] = frac(p.a), b = which === "w" ? p.bets_w : p.bets_k, up = which === "w";
  let num = 0n, den = 1n;
  b.lambdas.forEach((l, j) => {
    const [ln, ld] = frac(l), [wn, wd] = frac(at(b.weights, j));
    const f1 = up ? ld * ad + ln * (ad - an) : ld * ad - ln * (ad - an), f0 = up ? ld * ad - ln * an : ld * ad + ln * an;
    const tn = wn * f1 ** BigInt(k) * f0 ** BigInt(t - k), td = wd * (ld * ad) ** BigInt(t);
    num = num * td + tn * den;
    den *= td;
  });
  return { num, den };
}
/** floor(10^9 (1 - delta_exh W)) from the closed form. */
function budgetOf(p: SuiviPolicy, t: number, k: number): bigint {
  const { num, den } = capital(p, "w", t, k), [dn, dd] = frac(p.delta_exh);
  return (10n ** 9n * (dd * den - dn * num)) / (dd * den);
}

type Seg = O4Segment;
const st = (k_t: number, k_k: number, licensed_at: number | null, w_t: number, w_k: number, last_seq: number | null, segment: Seg): O4State =>
  ({ k_t, k_k, licensed_at, w_t, w_k, last_seq, segment });
const NOL: Seg = { kind: "no_license" };
const OPEN = (opened_at: number, opened_seq: number | null): Seg => ({ kind: "open", opened_at, opened_seq });
const CL = (opened_at: number, opened_seq: number | null, closed_at: number, closed_seq: number, closed_by: "w_exhausted" | "alarm"): Seg =>
  ({ kind: "closed", opened_at, opened_seq, closed_at, closed_seq, closed_by });
/** Labels entered one by one, seq following last_seq. */
function run(p: SuiviPolicy, s0: O4State, labels: readonly (0 | 1)[]): O4State {
  return labels.reduce((acc, E) => o4Step(acc, { seq: (acc.last_seq ?? -1) + 1, E }, p), s0);
}

/** The frontier of W (smallest crossing k, or t + 1) or of K (largest crossing k, or -1), in floats from ln of the capital, with the
 *  smallest margin |ln capital - ln(1/delta)| met at a frontier and at its neighbour. */
function floatFrontier(p: SuiviPolicy, which: "k" | "w", tMax: number): { table: number[]; margin: number } {
  const a = flt(p.a), b = which === "w" ? p.bets_w : p.bets_k, up = which === "w";
  const L = -Math.log(flt(which === "w" ? p.delta_exh : p.delta_adm));
  const f = b.lambdas.map((l) => [Math.log(1 + flt(l) * (up ? -a : a)), Math.log(1 + flt(l) * (up ? 1 - a : a - 1))] as const);
  const lw = b.weights.map((w) => Math.log(flt(w)));
  const ln = (t: number, k: number): number => {
    const e = f.map(([l0, l1], j) => at(lw, j) + k * l1 + (t - k) * l0), mx = Math.max(...e);
    return mx + Math.log(e.reduce((acc, v) => acc + Math.exp(v - mx), 0));
  };
  const cross = (t: number, k: number): boolean => ln(t, k) >= L;
  const table: number[] = [];
  let fr = up ? 1 : -1, margin = Infinity;
  for (let t = 0; t <= tMax; t++) {
    if (up) {
      fr = Math.min(fr, t + 1);
      while (fr > 0 && cross(t, fr - 1)) fr--;
      while (fr <= t && !cross(t, fr)) fr++;
    } else {
      fr = Math.min(fr, t);
      while (fr < t && cross(t, fr + 1)) fr++;
      while (fr >= 0 && !cross(t, fr)) fr--;
    }
    for (const k of up ? [fr, fr - 1] : [fr, fr + 1]) if (k >= 0 && k <= t) margin = Math.min(margin, Math.abs(ln(t, k) - L));
    table.push(fr);
  }
  return { table, margin };
}
/** P(T <= t) for t = 0..H, T the first crossing of a table under Bernoulli(p) labels, by the mass not yet stopped over k. */
function dpIid(table: readonly number[], up: boolean, p: number, H: number): number[] {
  let mass = [1];
  const cdf = [0];
  let stopped = 0;
  for (let t = 1; t <= H; t++) {
    const nx = new Array<number>(t + 1).fill(0), fr = at(table, t);
    mass.forEach((v, k) => {
      nx[k] = (nx[k] ?? 0) + v * (1 - p);
      nx[k + 1] = (nx[k + 1] ?? 0) + v * p;
    });
    nx.forEach((v, k) => {
      if (up ? k >= fr : k <= fr) {
        stopped += v;
        nx[k] = 0;
      }
    });
    mass = nx;
    cdf.push(stopped);
  }
  return cdf;
}
const TOL = 1e-9;

const G = FIX.grid_ms, T0 = 1761696000000;
const tOf = (seq: number): number => T0 + (seq - 10) * G;
const ev = (seq: number, pre = true, t_step_ms = tOf(seq)): RefEvaluation =>
  ({ seq, t_step_ms, yhat_ref: "1/10", produced_at_ref: "2026-10-29T00:00:00Z", pre_member: pre });
const oc = (seq: number, resolved: boolean, member: boolean, miss: 0 | 1): Outcome => ({ seq, resolved, member, miss });
const lastOf = (seq: number, t_step_ms = tOf(seq)): { seq: number; t_step_ms: number } => ({ seq, t_step_ms });
function messageOf(f: () => unknown): string {
  try {
    f();
  } catch (e) {
    assert.ok(e instanceof RangeError, "a RangeError");
    return e.message;
  }
  return assert.fail("no refusal");
}

const SUIVI = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "suivi");
const SUIVI_FILES = ["detector.ts", "label.ts", "m1.ts", "o4.ts", "policy.ts"];
const BANNED_NAMES = new Set(["fetch", "Date", "performance", "process", "globalThis", "setTimeout", "setInterval", "setImmediate",
  "queueMicrotask", "randomBytes", "randomInt", "randomUUID", "randomFill", "randomFillSync", "getRandomValues"]);
const ADMITTED = new Set(["node:crypto", "@monark/contracts", "../pari/index.ts", "../l2-monitor.ts"]);
/** A load that forbiddenLoads names; a specifier outside the closed list (a file of the folder by ./<file>.ts, ../pari/index.ts,
 *  @monark/contracts, node:crypto); an identifier of BANNED_NAMES anywhere; the member random of Math. */
function impurities(text: string): string[] {
  const found = [...forbiddenLoads(text)];
  for (const spec of importSpecifiers(text)) {
    if (!ADMITTED.has(spec) && !(/^\.\/[^/]+\.ts$/.test(spec) && existsSync(join(SUIVI, spec)))) found.push(`specifier ${spec}`);
  }
  const src = ts.createSourceFile("module.ts", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const line = (n: ts.Node): string => `l.${s(src.getLineAndCharacterOfPosition(n.getStart(src)).line + 1)}`;
  const isMath = (e: ts.Expression): boolean => ts.isIdentifier(e) && e.text === "Math";
  const visit = (n: ts.Node): void => {
    if (ts.isIdentifier(n) && BANNED_NAMES.has(n.text)) found.push(`${line(n)}: ${n.text}`);
    if (ts.isPropertyAccessExpression(n) && isMath(n.expression) && n.name.text === "random") found.push(`${line(n)}: Math.random`);
    if (ts.isElementAccessExpression(n) && isMath(n.expression) && ts.isStringLiteralLike(n.argumentExpression)
      && n.argumentExpression.text === "random") found.push(`${line(n)}: Math["random"]`);
    ts.forEachChild(n, visit);
  };
  visit(src);
  return found;
}

// killer: packages/hikae/src/suivi/policy.ts:95 CONST "lambdas: b.lambdas.map" -> "lambdas: b.weights.map"
test("o4_exact_dp_oracle", (t) => {
  const fw = floatFrontier(FIX, "w", 1000), fk = floatFrontier(FIX, "k", 3000);
  t.diagnostic(`smallest margin at the frontier: W ${fw.margin.toExponential(4)} (t <= 1000), K ${fk.margin.toExponential(4)} (t <= 3000)`);
  assert.ok(fw.margin > TOL && fk.margin > TOL, "the float frontiers are decided beyond the tolerance 1e-9");
  assert.deepEqual(fw.table.slice(0, 13), [1, 2, 3, 4, 5, 6, 7, 7, 7, 8, 8, 8, 9], "W frontier, t <= 12 (pari_crossing_table_exact)");
  assert.deepEqual(fk.table.slice(0, 13), new Array<number>(13).fill(-1), "K frontier, t <= 12 (pari_crossing_table_exact)");
  const a = qParse(FIX.a);
  assert.deepEqual([...crossingTable(mixtureOf(FIX.bets_w), "above", a, qParse(FIX.delta_exh), 1000)], fw.table, "W table of the fixture");
  assert.deepEqual([...crossingTable(mixtureOf(FIX.bets_k), "below", a, qParse(FIX.delta_adm), 3000)], fk.table, "K table of the fixture");
  const pw = at(dpIid(fw.table, true, flt(FIX.a), 1000), 1000), pk = at(dpIid(fk.table, false, flt(FIX.a), 2000), 2000);
  t.diagnostic(`exact: W closes before 1000 ${pw.toFixed(8)}, K licenses before 2000 ${pk.toFixed(8)}`);
  assert.ok(Math.abs(pw - 0.00700942) <= 1e-7 && pw < flt(FIX.delta_exh), `W ${s(pw)}`);
  assert.ok(Math.abs(pk - 0.03106722) <= 1e-7 && pk < flt(FIX.delta_adm), `K ${s(pk)}`);
});

// killer: packages/hikae/src/suivi/o4.ts:136 CONST "10n ** 9n);" -> "10n ** 9n) - 1n;"
test("o4_budget_nano_floor", () => {
  let x = o4Init(FIX, false);
  for (let i = 1; i <= 44; i++) {
    x = o4Step(x, { seq: i - 1, E: 0 }, FIX);
    assert.ok(x.licensed_at === null && x.segment.kind === "no_license" && budgetNano(x, FIX) === -1n, `no licence after ${s(i)} zeros`);
  }
  x = o4Step(x, { seq: 44, E: 0 }, FIX);
  assert.deepEqual(x, st(45, 0, 45, 0, 0, 44, OPEN(45, 44)), "K licenses at the 45th zero; that label does not enter W");
  assert.equal(budgetNano(x, FIX), 990000000n, "floor(10^9 (1 - 1/100)) at the opening, W = 1");
  for (let i = 1; i <= 150; i++) {
    x = o4Step(x, { seq: 44 + i, E: i % 5 === 0 ? 1 : 0 }, FIX);
    const b = budgetNano(x, FIX), k = Math.floor(i / 5);
    assert.ok(x.segment.kind === "open" && x.w_t === i && x.w_k === k, `segment open, w_t ${s(i)}`);
    assert.ok(b === budgetOf(FIX, i, k) && b >= 0n && b < 10n ** 9n, `budget ${s(b)} at w_t ${s(i)}`);
  }
  const y = run(FIX, o4Init(FIX, true), new Array<0 | 1>(45).fill(0));
  assert.deepEqual(y, st(45, 0, 45, 45, 0, 44, OPEN(0, null)), "a licence in a segment open at the start: w_t = k_t - opened_at");
  assert.equal(budgetNano(o4Init(FIX, true), FIX), 990000000n, "the open start");
  assert.equal(budgetNano(y, FIX), 999729470n, "W(45, 0)");
  assert.equal(budgetOf(FIX, 45, 0), 999729470n, "W(45, 0) by the closed form");
});

// killer: packages/hikae/src/suivi/o4.ts:135 CONST "return -1n;" -> "return 0n;"
test("o4_closure_returns_minus_one", () => {
  let x = run(PW, o4Init(PW, true), [1, 1, 1, 1, 1]);
  assert.deepEqual(x, st(5, 5, null, 5, 5, 4, OPEN(0, null)), "five ones, W = 32");
  assert.equal(budgetNano(x, PW), 500000000n, "floor(10^9 (1 - 32/64))");
  x = o4Step(x, { seq: 5, E: 1 }, PW);
  const closed = CL(0, null, 6, 5, "w_exhausted");
  assert.deepEqual(x, st(6, 6, null, 6, 6, 5, closed), "W = 64 = 1/delta_exh closes at the label of rank 6, a one");
  assert.equal(budgetNano(x, PW), -1n, "closed: -1, never 0");
  let kk = 6;
  for (let i = 1; i <= 200; i++) {
    const E = i <= 36 ? 0 : bit(i % 2);
    kk += E;
    x = o4Step(x, { seq: 5 + i, E }, PW);
    assert.deepEqual(x, st(6 + i, kk, 6 + i >= 42 ? 42 : null, 6, 6, 5 + i, closed), `frozen, ${s(i)} labels after the closure`);
    assert.equal(budgetNano(x, PW), -1n, `budget ${s(i)} labels after the closure`);
  }
  assert.throws(() => budgetNano(st(6, 6, null, 6, 6, 5, OPEN(0, null)), PW), RangeError, "open with w_t = w_k = 6");
  const k1 = run(PK, o4Init(PK, false), [0]);
  assert.deepEqual(k1, st(1, 0, null, 0, 0, 0, NOL), "K = 7/6 after one zero");
  assert.deepEqual(o4Step(k1, { seq: 1, E: 0 }, PK), st(2, 0, 2, 0, 0, 1, OPEN(2, 1)), "K = 49/36 = 1/delta_adm licenses at 2");
});

// killer: packages/hikae/src/suivi/o4.ts:126 CONST "s.segment.kind !== \"open\"" -> "s.segment.kind === \"no_license\""
test("o4_alarm_closes_segment", () => {
  const x = run(PW, o4Init(PW, true), [1, 0, 1]), a = o4CloseOnAlarm(x, PW);
  assert.deepEqual(a, st(3, 2, null, 3, 2, 2, CL(0, null, 3, 2, "alarm")), "the alarm closes at k_t, closed_seq = last_seq");
  assert.equal(budgetNano(a, PW), -1n, "closed by the alarm: -1");
  let b = a;
  for (let i = 1; i <= 6; i++) {
    b = o4Step(b, { seq: 2 + i, E: 1 }, PW);
    assert.deepEqual(b, { ...a, k_t: 3 + i, k_k: 2 + i, last_seq: 2 + i }, `absorbing, ${s(i)} ones later`);
  }
  assert.throws(() => o4CloseOnAlarm(b, PW), RangeError, "a second alarm");
  const k = run(PK, o4Init(PK, false), [0, 0]);
  assert.deepEqual(o4CloseOnAlarm(k, PK), st(2, 0, 2, 0, 0, 1, CL(2, 1, 2, 1, "alarm")), "an alarm at the opening step");
  const w = run(PW, o4Init(PW, true), [1, 1, 1, 1, 1, 1]);
  assert.throws(() => o4CloseOnAlarm(w, PW), RangeError, "an alarm at the step W closes");
  assert.equal(w.segment.kind === "closed" ? w.segment.closed_by : "", "w_exhausted", "W closed first");
  assert.throws(() => o4CloseOnAlarm(run(PW, o4Init(PW, false), [0]), PW), RangeError, "no licence");
  assert.throws(() => o4CloseOnAlarm(o4Init(PW, true), PW), RangeError, "last_seq null");
  assert.throws(() => o4CloseOnAlarm(x, { ...PW, m: "1/4" }), RangeError, "a refused policy");
});

// killer: packages/hikae/src/suivi/o4.ts:70 SDL "if (g.opened_at > 0 && licensed_at !== g.opened_at)" -> ""
test("o4_state_invariants_refused", () => {
  // Under PW: K(t, k) = (7/6)^(t - k) (2/3)^k against 20, W = 2^(2k - t) against 64.
  const valid: readonly [string, O4State][] = [["no licence", st(3, 1, null, 0, 0, 4, NOL)], ["open at 0", st(3, 1, null, 3, 1, 4, OPEN(0, null))],
    ["open by licence", st(5, 1, 2, 3, 1, 6, OPEN(2, 3))], ["closed by W", st(8, 6, null, 6, 6, 7, CL(0, null, 6, 5, "w_exhausted"))],
    ["closed by W, licensed", st(10, 6, 2, 6, 6, 9, CL(2, 3, 8, 7, "w_exhausted"))], ["alarm", st(5, 1, 2, 2, 1, 6, CL(2, 3, 4, 5, "alarm"))],
    ["k_k = k_t", st(6, 6, null, 6, 6, 5, CL(0, null, 6, 5, "w_exhausted"))], ["licensed at k_t", st(2, 0, 2, 0, 0, 1, OPEN(2, 1))],
    ["licensed at 1", st(1, 0, 1, 1, 0, 0, OPEN(0, null))], ["licensed, K at 1/delta_adm", st(20, 0, 20, 20, 0, 19, OPEN(0, null))],
    ["open, W = 32", st(5, 5, null, 5, 5, 4, OPEN(0, null))],
    ["alarm at opening", st(5, 1, 2, 0, 0, 6, CL(2, 3, 2, 3, "alarm"))]];
  for (const [what, x] of valid) {
    assert.doesNotThrow(() => o4Step(x, { seq: 100, E: 0 }, PW), `valid ${what}: o4Step`);
    assert.doesNotThrow(() => budgetNano(x, PW), `valid ${what}: budgetNano`);
    if (x.segment.kind === "open") assert.doesNotThrow(() => o4CloseOnAlarm(x, PW), `valid ${what}: o4CloseOnAlarm`);
  }
  assert.deepEqual([o4Init(PW, true), o4Init(PW, false)], [st(0, 0, null, 0, 0, null, OPEN(0, null)), st(0, 0, null, 0, 0, null, NOL)], "the two starts");
  assert.doesNotThrow(() => o4Step(o4Init(PW, true), { seq: 0, E: 1 }, PW), "a one as the first label of the open start");
  assert.doesNotThrow(() => o4Step(st(1, 1, null, 1, 1, 0, CL(0, null, 1, 0, "w_exhausted")), { seq: 1, E: 0 }, { ...PW, delta_exh: "1/2" }), "W closed at seq 0");
  // No state breaks opened_at <= k_t alone (w_t >= 0 and the closed chain imply it); capitalOfCounts refuses w_k > w_t too.
  const bad: readonly [string, O4State][] = [["k_t not an integer", st(3.5, 1, null, 0, 0, 4, NOL)],
    ["k_k not an integer", st(3, 0.5, null, 0, 0, 4, NOL)], ["w_k not an integer", st(3, 1, null, 3, 1.5, 4, OPEN(0, null))],
    ["last_seq not an integer", st(3, 1, null, 0, 0, 4.5, NOL)], ["licensed_at not an integer", st(3, 1, 1.5, 3, 1, 4, OPEN(0, null))],
    ["opened_at not an integer", st(5, 1, 2.5, 2.5, 1, 6, OPEN(2.5, 3))], ["opened_seq negative", st(5, 1, 2, 3, 1, 6, OPEN(2, -1))],
    ["opened_seq not an integer", st(5, 1, 2, 3, 1, 6, OPEN(2, 3.5))], ["closed_seq negative", st(8, 6, null, 6, 6, 7, CL(0, null, 6, -1, "w_exhausted"))],
    ["closed_at not an integer", st(8, 6, null, 6.5, 6, 7, CL(0, null, 6.5, 5, "w_exhausted"))], ["k_k above k_t, licensed", st(5, 6, 2, 3, 1, 6, OPEN(2, 3))],
    ["w_k above w_t", st(3, 1, null, 3, 4, 4, OPEN(0, null))], ["last_seq set at k_t 0", st(0, 0, null, 0, 0, 4, NOL)],
    ["last_seq null at k_t 3", st(3, 1, null, 0, 0, null, NOL)], ["k_t above last_seq + 1", st(3, 1, null, 0, 0, 1, NOL)],
    ["licensed_at 0", st(3, 1, 0, 3, 1, 4, OPEN(0, null))], ["licensed_at above k_t", st(3, 1, 4, 3, 1, 4, OPEN(0, null))],
    ["no_license licensed", st(3, 1, 2, 0, 0, 4, NOL)], ["no_license with W counts", st(3, 1, null, 1, 0, 4, NOL)],
    ["opened_seq set at rank 0", st(3, 1, null, 3, 1, 4, OPEN(0, 0))], ["opened_seq null at rank 2", st(5, 1, 2, 3, 1, 6, OPEN(2, null))],
    ["opened at 2 without licence", st(5, 1, null, 3, 1, 6, OPEN(2, 3))], ["opened at 2, licence at 1", st(5, 1, 1, 3, 1, 6, OPEN(2, 3))],
    ["open, w_t not k_t - opened_at", st(3, 1, null, 2, 1, 4, OPEN(0, null))], ["open, opened_seq after last_seq", st(5, 1, 2, 3, 1, 6, OPEN(2, 7))],
    // closed_at 0 forces opened_at 0, opened_seq null, hence closed_seq = opened_seq fails too: no state breaks 1 <= closed_at alone.
    ["closed at rank 0", st(3, 1, null, 0, 0, 4, CL(0, null, 0, 2, "alarm"))], ["closed_at above k_t", st(5, 1, 2, 4, 1, 6, CL(2, 3, 6, 5, "alarm"))],
    ["closed, w_t not closed_at - opened_at", st(5, 1, 2, 1, 1, 6, CL(2, 3, 4, 5, "alarm"))],
    ["closed_seq after last_seq", st(5, 1, 2, 2, 1, 6, CL(2, 3, 4, 7, "alarm"))], ["opened_seq after closed_seq", st(5, 1, 2, 2, 1, 6, CL(2, 3, 4, 2, "alarm"))],
    ["closed at the opening rank, other seq", st(5, 1, 2, 0, 0, 6, CL(2, 3, 2, 4, "alarm"))],
    ["w_exhausted at the opening seq", st(10, 6, 2, 6, 6, 9, CL(2, 3, 8, 3, "w_exhausted"))],
    // W(0, 0) = 1 < 64: a W closure at the opening rank breaks the capital invariant as well.
    ["w_exhausted at the opening rank", st(5, 1, 2, 0, 0, 6, CL(2, 3, 2, 3, "w_exhausted"))],
    ["K at 1/delta_adm without licence", st(20, 0, null, 0, 0, 19, NOL)], ["open with W at 1/delta_exh", st(6, 6, null, 6, 6, 5, OPEN(0, null))],
    ["w_exhausted under 1/delta_exh", st(8, 6, null, 6, 5, 7, CL(0, null, 6, 5, "w_exhausted"))],
    ["k_t not an integer, licensed", st(10.5, 6, 2, 6, 6, 10, CL(2, 3, 8, 7, "w_exhausted"))], ["no_license with w_k", st(3, 1, null, 0, 1, 4, NOL)],
    ["k_k not an integer, licensed", st(10, 5.5, 2, 6, 6, 9, CL(2, 3, 8, 7, "w_exhausted"))], ["opened_at negative", st(3, 1, null, 4, 1, 4, OPEN(-1, 0))],
    ["alarm at 1/delta_exh", st(8, 6, null, 6, 6, 7, CL(0, null, 6, 5, "alarm"))]];
  for (const [what, x] of bad) {
    assert.throws(() => o4Step(x, { seq: 100, E: 0 }, PW), RangeError, `${what}: o4Step`);
    assert.throws(() => budgetNano(x, PW), RangeError, `${what}: budgetNano`);
    assert.throws(() => o4CloseOnAlarm(x, PW), RangeError, `${what}: o4CloseOnAlarm`);
  }
  assert.ok(capital(PW, "k", 20, 0).num >= 20n * capital(PW, "k", 20, 0).den, "K(20, 0) >= 20");
  assert.ok(capital(PW, "k", 19, 0).num < 20n * capital(PW, "k", 19, 0).den, "K(19, 0) < 20");
  const o = st(3, 1, null, 3, 1, 4, OPEN(0, null));
  assert.deepEqual(o4Step(o, { seq: 5, E: 1 }, PW), st(4, 2, null, 4, 2, 5, OPEN(0, null)), "one label in a segment open at the start");
  assert.deepEqual(o4Step(st(20, 0, 20, 20, 0, 19, OPEN(0, null)), { seq: 20, E: 0 }, PW), st(21, 0, 20, 21, 0, 20, OPEN(0, null)), "K licenses once");
  for (const seq of [4, 3, -1, 4.5]) assert.throws(() => o4Step(o, { seq, E: 0 }, PW), RangeError, `label seq ${s(seq)} after 4`);
  for (const E of [2, 0.5]) assert.throws(() => o4Step(o, { seq: 5, E: bit(E) }, PW), RangeError, `label E ${s(E)}`);
  assert.throws(() => o4Step(o4Init(PW, false), { seq: -1, E: 0 }, PW), RangeError, "seq -1 on the first label");
  const refused = { ...PW, m: "1/4" };
  assert.throws(() => o4Step(o, { seq: 5, E: 0 }, refused), RangeError, "o4Step, refused policy");
  assert.throws(() => budgetNano(o, refused), RangeError, "budgetNano, refused policy");
  assert.throws(() => o4CloseOnAlarm(o, refused), RangeError, "o4CloseOnAlarm, refused policy");
});

// killer: packages/hikae/src/suivi/label.ts:75 CONST "break;" -> "continue;"
test("labels_enter_in_order", () => {
  for (const [e, o] of [[ev(1, false), oc(1, false, false, 0)], [ev(1), oc(1, true, true, 1)]] as const) assert.doesNotThrow(() => enterInOrder([e], [o], FIX, null), "entered");
  assert.equal(labelOf(ev(1), oc(1, true, false, 0)), null, "out of the population: no label");
  assert.equal(labelOf(ev(1, false), oc(1, false, false, 0)), null, "out of the population, unresolved");
  assert.equal(labelOf(ev(1, false), oc(1, true, false, 1)), null, "out of the population, missed");
  assert.deepEqual(labelOf(ev(1), oc(1, true, true, 0)), { E: 0 }, "resolved, hit");
  assert.deepEqual(labelOf(ev(1), oc(1, true, true, 1)), { E: 1 }, "resolved, missed");
  assert.deepEqual(labelOf(ev(1), oc(1, false, true, 0)), { E: 1 }, "unresolved in the population");
  for (const [what, e, o] of [["seq differ", ev(1), oc(2, true, true, 0)], ["member without pre_member", ev(1, false), oc(1, true, true, 0)],
    ["miss 2", ev(1), oc(1, true, true, bit(2))], ["miss 1 unresolved", ev(1), oc(1, false, true, 1)]] as const) {
    assert.throws(() => labelOf(e, o), RangeError, `labelOf: ${what}`);
  }
  const pend = [10, 11, 12, 13, 14].map((n) => ev(n));
  const r1 = enterInOrder(pend, [oc(14, false, true, 0), oc(10, true, false, 0), oc(13, true, true, 0), oc(11, true, true, 1)], FIX, null);
  assert.deepEqual(r1, { entered: [{ seq: 11, E: 1 }], pending: pend.slice(2), held: [oc(13, true, true, 0), oc(14, false, true, 0)],
    outcomes_through_seq: 11 }, "10 and 11 consumed, 12 has no outcome: 13 and 14 held, sorted");
  const r2 = enterInOrder(r1.pending, [oc(14, false, true, 0), oc(12, true, true, 0), oc(13, true, true, 0)], FIX, lastOf(11));
  assert.deepEqual(r2, { entered: [{ seq: 12, E: 0 }, { seq: 13, E: 0 }, { seq: 14, E: 1 }], pending: [], held: [], outcomes_through_seq: 14 },
    "the rest, in the order of the evaluations");
  assert.deepEqual(enterInOrder([ev(15)], [], FIX, lastOf(14)), { entered: [], pending: [ev(15)], held: [], outcomes_through_seq: null }, "none");
  assert.deepEqual(enterInOrder([], [], FIX, null), { entered: [], pending: [], held: [], outcomes_through_seq: null }, "empty");
  const refusals: readonly [string, readonly RefEvaluation[], readonly Outcome[], { seq: number; t_step_ms: number } | null][] = [
    ["equal seqs", [ev(10), ev(10)], [], null], ["falling seqs", [ev(11), ev(10)], [], null], ["first seq at last.seq", [ev(10)], [], lastOf(10)],
    ["first seq under last.seq", [ev(9)], [], lastOf(10)], ["two outcomes of one seq", [ev(10), ev(11)], [oc(10, true, true, 0), oc(10, true, true, 1)], null],
    ["outcome refused by labelOf", [ev(10)], [oc(10, false, true, 1)], null]];
  for (const [what, p, o, l] of refusals) assert.throws(() => enterInOrder(p, o, FIX, l), RangeError, what);
  const consumed = messageOf(() => enterInOrder([ev(11)], [oc(10, true, true, 0)], FIX, lastOf(10)));
  const unknown = messageOf(() => enterInOrder([ev(10), ev(12)], [oc(11, true, true, 0)], FIX, null));
  assert.notEqual(consumed, messageOf(() => enterInOrder([ev(11)], [oc(10, true, true, 0)], FIX, null)), "consumed, not unknown, at one seq");
  assert.notEqual(consumed, unknown, "an outcome of a consumed evaluation is refused as such");
  assert.throws(() => enterInOrder([ev(10), ev(12)], [oc(99, true, true, 0)], FIX, null), RangeError, "an outcome after every evaluation");
});

// killer: packages/hikae/src/suivi/label.ts:52 CONST "(ev.seq - prev.seq) * policy.grid_ms" -> "policy.grid_ms"
test("one_evaluation_per_horizon", () => {
  assert.doesNotThrow(() => enterInOrder([ev(10), ev(11)], [], FIX, null), "one horizon apart");
  assert.doesNotThrow(() => enterInOrder([ev(10), ev(12)], [], FIX, null), "two seqs, two horizons");
  assert.doesNotThrow(() => enterInOrder([ev(11)], [], FIX, lastOf(10)), "one horizon after the last call");
  const refused: readonly [string, readonly RefEvaluation[], { seq: number; t_step_ms: number } | null][] = [
    ["one ms short", [ev(10), ev(11, true, tOf(11) - 1)], null], ["two evaluations in one horizon", [ev(10), ev(11, true, tOf(10))], null],
    ["two seqs, one horizon", [ev(10), ev(12, true, tOf(11))], null], ["one ms late after the last call", [ev(11, true, tOf(11) + 1)], lastOf(10)],
    ["two seqs, one horizon, after the last call", [ev(12, true, tOf(11))], lastOf(10)], ["last call one ms late", [ev(11)], lastOf(10, tOf(10) + 1)]];
  for (const [what, p, l] of refused) assert.throws(() => enterInOrder(p, [], FIX, l), RangeError, what);
  const hourly = { ...FIX, grid_ms: 3600000 };
  assert.throws(() => enterInOrder([ev(10), ev(11)], [], hourly, null), RangeError, "a day apart under an hourly grid");
  assert.doesNotThrow(() => enterInOrder([ev(10), ev(11, true, tOf(10) + 3600000)], [], hourly, null), "an hour apart under an hourly grid");
});

// killer: packages/hikae/src/suivi/policy.ts:111 SDL "if (p.m !== p.a)" -> ""
test("suivi_policy_closed_and_canonical", () => {
  const KR = [KEY1, KEY2], flip = (h: string): string => h.slice(0, -1) + (h.endsWith("0") ? "1" : "0");
  const bare = <T extends object>(o: T): T => Object.assign(Object.create(null) as T, o);
  const notPlain = <T extends object>(o: T): T => Object.assign(Object.create({}) as T, o);
  const without = (o: object, k: string): unknown => Object.fromEntries(Object.entries(o).filter(([key]) => key !== k));
  const accepted: readonly [string, unknown][] = [["fixture", FIX], ["policy W", PW], ["policy K", PK], ["keyring", { ...FIX, keyring: KR }],
    ["null prototype", bare(FIX)], ["null prototype bets", { ...FIX, bets_w: bare(FIX.bets_w) }], ["null prototype key", { ...FIX, keyring: [bare(KEY1)] }],
    ["thin_min 0", { ...FIX, thin_min: 0 }], ["thin_min 90", { ...FIX, thin_min: 90 }], ["grace 0", { ...FIX, grace_steps: 0 }],
    ["threshold 2", { ...FIX, sr_reading_threshold: "2" }], ["version 2", { ...FIX, policy_version: 2 }]];
  for (const [what, p] of accepted) assert.doesNotThrow(() => assertSuiviPolicy(asPolicy(p)), what);
  assert.equal(Object.keys(FIX).length, 22, "22 keys");
  const patches: [string, object][] = [["schema", { schema: "hikae-suivi-policy-v2" }], ["task_class empty", { task_class: "" }],
    ["cell_key empty", { cell_key: "" }], ["population empty", { population: "" }], ["task_class number", { task_class: 5 }],
    ["version 0", { policy_version: 0 }], ["version 1.5", { policy_version: 1.5 }], ["version text", { policy_version: "1" }],
    ["restart weights", { restart_weights: "1/(j(j+2))" }], ["m not a", { m: "1/4" }], ["grace -1", { grace_steps: -1 }],
    ["grace 0.5", { grace_steps: 0.5 }], ["grid 0", { grid_ms: 0 }], ["grid bigint", { grid_ms: 86400000n }], ["l_ms 0", { l_ms: 0 }],
    ["thin_window 0", { thin_window: 0, thin_min: 0 }], ["thin_min -1", { thin_min: -1 }], ["thin_min above thin_window", { thin_min: 91 }],
    ["bets_k empty", { bets_k: { lambdas: [], weights: [] } }], ["bets_k unequal", { bets_k: { lambdas: ["1/16", "1/8"], weights: W4 } }],
    ["bets_k 5/4", { bets_k: { lambdas: ["1/16", "1/8", "1/4", "5/4"], weights: W4 } }],
    ["bets_w 5", { bets_w: { lambdas: ["1/4", "1/2", "1", "5"], weights: W4 } }], ["bets_sr 1", { bets_sr: { lambdas: ["1/10", "1/5", "2/5", "1"], weights: W4 } }],
    ["weights summing to 7/8", { bets_w: { lambdas: FIX.bets_w.lambdas, weights: ["1/4", "1/4", "1/4", "1/8"] } }],
    ["bet text 2/4", { bets_k: { lambdas: ["1/16", "1/8", "2/4", "1/2"], weights: W4 } }], ["extra key", { extra: 1 }],
    ["bets extra key", { bets_k: { ...FIX.bets_k, extra: 1 } }], ["bets missing key", { bets_k: without(FIX.bets_k, "weights") }],
    ["bets not plain", { bets_sr: notPlain(FIX.bets_sr) }], ["key extra", { keyring: [{ ...KEY1, extra: 1 }] }],
    ["key missing", { keyring: [without(KEY1, "from_seq")] }], ["key not plain", { keyring: [notPlain(KEY1)] }],
    ["key_id of another key", { keyring: [{ ...KEY1, key_id: KEY2.key_id }] }], ["key_id flipped", { keyring: [{ ...KEY1, key_id: flip(KEY1.key_id) }] }],
    ["key_id upper", { keyring: [{ ...KEY1, key_id: KEY1.key_id.toUpperCase() }] }],
    ["hex upper", { keyring: [{ ...KEY1, public_key_hex: KEY1.public_key_hex.toUpperCase() }] }],
    ["hex of 63 digits", { keyring: [{ ...KEY1, public_key_hex: KEY1.public_key_hex.slice(0, 63) }] }],
    ["two keys, one key_id", { keyring: [KEY1, { ...KEY1, from_seq: 5 }] }], ["from_seq equal", { keyring: [KEY1, { ...KEY2, from_seq: 0 }] }],
    ["from_seq falling", { keyring: [{ ...KEY1, from_seq: 5 }, { ...KEY2, from_seq: 0 }] }], ["from_seq -1", { keyring: [{ ...KEY1, from_seq: -1 }] }],
    ["keyring not a list", { keyring: {} }], ["lambdas a text", { bets_k: { lambdas: "1/16", weights: W4 } }],
    ["weights a text", { bets_k: { lambdas: FIX.bets_k.lambdas, weights: "1/41" } }],
    ["hex a list", { keyring: [{ ...KEY1, public_key_hex: [KEY1.public_key_hex] }] }],
    ["from_seq 1.5", { keyring: [{ ...KEY1, from_seq: 1.5 }] }]];
  for (const v of ["3/2", "1", "10000/1", "0"]) patches.push([`threshold ${v}`, { sr_reading_threshold: v }]);
  for (const v of ["2/4", "0.1", "1/1", "+1/5", "0", "1", "3/2"]) {
    patches.push([`a = m = ${v}`, { a: v, m: v }]);
    for (const f of ["delta_adm", "delta_exh", "alpha_arl", "eta_m1"]) patches.push([`${f} ${v}`, { [f]: v }]);
  }
  patches.push(["bets_w null", { bets_w: null }]);
  for (const [what, patch] of patches) assert.throws(() => assertSuiviPolicy(asPolicy({ ...FIX, ...patch })), RangeError, what);
  assert.throws(() => assertSuiviPolicy(notPlain(FIX)), RangeError, "policy not plain");
  assert.throws(() => assertSuiviPolicy(asPolicy(without(FIX, "thin_min"))), RangeError, "missing key");
  assert.equal(suiviPolicySha256(FIX), "6c9c625aa22fcddae19feec42c290f976f5dcb91c45ed1c8ab26af78057124a6", "sha256 of the fixture");
  assert.equal(suiviPolicySha256({ ...FIX, keyring: KR }), "5f1853454907a311dc4c595d56e05a99d0b7b8fa0adc789a2045e3a75466e2a3", "with two keys");
  const reversed = asPolicy(Object.fromEntries(Object.entries(FIX).reverse()));
  assert.doesNotThrow(() => assertSuiviPolicy(reversed), "the key order does not count, refusals");
  assert.equal(suiviPolicySha256(reversed), suiviPolicySha256(FIX), "the key order does not count");
  assert.throws(() => suiviPolicySha256({ ...FIX, m: "1/4" }), RangeError, "sha256 of a refused policy");
  assert.equal(createHash("sha256").update(Buffer.from(KEY1.public_key_hex, "hex")).digest("hex"), KEY1.key_id, "KEY1 id");
  assert.equal(createHash("sha256").update(Buffer.from(KEY2.public_key_hex, "hex")).digest("hex"), KEY2.key_id, "KEY2 id");
  assert.deepEqual(mixtureOf(FIX.bets_k), { lambdas: [q(1n, 16n), q(1n, 8n), q(1n, 4n), q(1n, 2n)], weights: W4.map(() => q(1n, 4n)) }, "mixture K");
  for (const b of [{ lambdas: [], weights: [] }, { lambdas: ["1/2"], weights: ["1/2", "1/2"] }, { lambdas: ["2/4"], weights: ["1"] }]) {
    assert.throws(() => mixtureOf(b), RangeError, `mixtureOf ${JSON.stringify(b)}`);
  }
  assert.deepEqual(srReadingDelta(FIX), q(1n, 10000n), "1/10000");
  assert.deepEqual(srReadingDelta({ ...FIX, sr_reading_threshold: "2" }), q(1n, 2n), "1/2");
  // 1/10: the alpha of the USDe class line, which a must exceed.
  assert.equal(cmp(qParse(FIX.a), q(1n, 10n)), 1, "a above the class alpha");
  assert.equal(crosses(q(10000n), srReadingDelta(FIX)), true, "10000 reaches the reading threshold");
  assert.equal(crosses(q(9999n), srReadingDelta(FIX)), false, "9999 does not");
});

// killer: packages/hikae/src/suivi/detector.ts:15 CONST "\"./label.ts\";" -> "\"./label.ts\"; import \"../l2-monitor.ts\";"
test("suivi_purity_sweep", () => {
  assert.deepEqual(readdirSync(SUIVI).sort(), SUIVI_FILES, "the files of src/suivi/");
  for (const f of SUIVI_FILES) assert.deepEqual(impurities(readFileSync(join(SUIVI, f), "utf8")), [], `src/suivi/${f}`);
  for (const f of SUIVI_FILES.filter((x) => x !== "m1.ts")) assert.ok(!importSpecifiers(readFileSync(join(SUIVI, f), "utf8")).includes("../l2-monitor.ts"), `src/suivi/${f}: no ../l2-monitor.ts`);
  const witnesses: readonly [string, string][] = [["import { readFileSync } from \"node:fs\";\nexport const r = readFileSync;\n", "node:fs"],
    ["export { srStep } from \"../pari/sr.ts\";\n", "../pari/sr.ts"], ["export { q } from \"../index.ts\";\n", "../index.ts"],
    ["export { x } from \"./absent.ts\";\n", "./absent.ts"], ["export const f = (): Promise<Response> => fetch(\"x\");\n", "fetch"],
    ["export const g = (): number => Date.now();\n", "Date"], ["export const h = (): number => Math.random();\n", "Math.random"]];
  for (const [text, name] of witnesses) assert.ok(impurities(text).some((hit) => hit.includes(name)), `the sweep refuses ${name}`);
  assert.deepEqual(impurities("import { q } from \"../pari/index.ts\";\nimport { createHash } from \"node:crypto\";\n"), [], "admitted");
});
