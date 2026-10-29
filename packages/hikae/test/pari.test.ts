/**
 * HIKAE betting library (packages/hikae/src/pari/) - oracle tests.
 * What the library computes. Exact rationals over bigint (Q: positive denominator, coprime, zero as 0/1); the betting factor on a
 * variable x in {0, 1}, side "below" 1 + lambda (a - x) and side "above" 1 + lambda (x - a), with open bounds on lambda and on a; the
 * capital of a fixed mixture of bets, which depends on the counts (t, k) alone; the crossing table, for each t the frontier k at which
 * capital * delta >= 1 (the smallest crossing k for "above", the largest for "below"); in fixed point at 2^-64 rounded down, a
 * Shiryaev-Roberts reading (R <- (1 + R) g) and a detector with weighted restarts (S <- (S + w_t) g, w_t = 1/(t (t + 1)) rounded down
 * first), g being 1 + lambda (x/m - 1); and an integer threshold test, value * delta >= 1.
 * How the expected values are computed. Never by the library: by literals written by hand, by closed forms computed here in bigint
 * (each factor from its formula, the products along every path, the powers of the factors over one common denominator, the fixed-point
 * recurrences, the exact rational recurrences and their error bounds B_t and B'_t), and by literals printed by a separate exact bigint
 * script (the frontiers for t <= 12 and at a few later t, the rounding witnesses, the first crossing steps of the fixed sequence below).
 * Every test-side rational is reduced by the gcd written here.
 * Category: new-module (red at base by the load of ../src/pari/index.ts, which this change adds). No clock, no seed; the only files read
 * are the library sources, by the purity sweep.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { forbiddenLoads, importSpecifiers } from "../../../apps/harness/test/helpers/import-specifiers.ts";
import * as pari from "../src/pari/index.ts";
import type { BetSide, Mixture, Q } from "../src/pari/index.ts";

const { add, betFactor, capitalOfCounts, cmp, crosses, crossingTable, floorScaled, mul, pow, q, qParse, qString, srIncrement, srStep,
  srValue, sub, weightedStep, weightedValue } = pari;

/** Test-side rationals, the same shape as Q, reduced by the gcd below and never by the library. */
type Frac = { readonly n: bigint; readonly d: bigint };
const absB = (x: bigint): bigint => (x < 0n ? -x : x);
function gcdB(a: bigint, b: bigint): bigint {
  let x = absB(a), y = absB(b);
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}
function rq(n: bigint, d = 1n): Frac {
  if (d === 0n) throw new Error("test-side rational with a zero denominator");
  const sign = d < 0n ? -1n : 1n, g = gcdB(n, d);
  return { n: (sign * n) / g, d: (sign * d) / g };
}
const tAdd = (x: Frac, y: Frac): Frac => rq(x.n * y.d + y.n * x.d, x.d * y.d);
const tSub = (x: Frac, y: Frac): Frac => rq(x.n * y.d - y.n * x.d, x.d * y.d);
const tMul = (x: Frac, y: Frac): Frac => rq(x.n * y.n, x.d * y.d);
const tDiv = (x: Frac, y: Frac): Frac => rq(x.n * y.d, x.d * y.n);
/** A test-side mixture, the shape of Mixture, so that the closed forms below read their own types. */
type TMix = { readonly lambdas: readonly Frac[]; readonly weights: readonly Frac[] };
/** x >= y, on integers (both denominators positive). */
const geF = (x: Frac, y: Frac): boolean => x.n * y.d >= y.n * x.d;
const ZERO = rq(0n), ONE = rq(1n), TWO64 = 2n ** 64n, UNIT = rq(TWO64);
/** Text of a number or a bigint, for the messages. */
const s = String;
function at<T>(xs: readonly T[], i: number): T {
  const v = xs[i];
  if (v === undefined) throw new Error(`test-side index ${s(i)} out of range`);
  return v;
}

/** A Q of the library is reduced: bigint fields, positive denominator, gcd 1 (so zero is 0/1). */
function assertReduced(x: Q, what: string): void {
  assert.equal(typeof x.n, "bigint", `${what}: numerator not a bigint`);
  assert.equal(typeof x.d, "bigint", `${what}: denominator not a bigint`);
  assert.ok(x.d > 0n, `${what}: denominator ${s(x.d)} not positive`);
  assert.equal(gcdB(x.n, x.d), 1n, `${what}: ${s(x.n)}/${s(x.d)} not reduced`);
}
/** The library's Q against a test-side expectation: the same two fields, and reduced. */
function same(actual: Q, expected: Frac, what: string): void {
  assert.deepEqual({ n: actual.n, d: actual.d }, { n: expected.n, d: expected.d }, what);
  assertReduced(actual, what);
}

const xq = (x: 0 | 1): Frac => rq(BigInt(x));
/** A value outside {0, 1} typed as a label, for the refusals. */
const notBit = (v: number): 0 | 1 => v as 0 | 1;
/** A value of another type typed as a bigint, and a text typed as a side, for the refusals of the type guards. */
const asBig = (v: unknown): bigint => v as bigint;
const asSide = (v: string): BetSide => v as BetSide;
/** The refusal of the library itself: a RangeError whose message matches, never a native error of the arithmetic. */
const refusal = (message: RegExp): { name: string; message: RegExp } => ({ name: "RangeError", message });
/** The betting factor from its formula: "below" 1 + lambda (a - x), "above" 1 + lambda (x - a). */
const tFactor = (side: BetSide, l: Frac, a: Frac, x: 0 | 1): Frac => tAdd(ONE, tMul(l, side === "below" ? tSub(a, xq(x)) : tSub(xq(x), a)));
/** The increment of the reading and of the detector from its formula: 1 + lambda (x/m - 1). */
const tInc = (l: Frac, m: Frac, x: 0 | 1): Frac => tAdd(ONE, tMul(l, tSub(tDiv(xq(x), m), ONE)));
/** The restart weight rounded down first: floor(2^64 / (t (t + 1))), in units of 2^-64. */
const wTilde = (t: number): bigint => TWO64 / (BigInt(t) * BigInt(t + 1));

/** The sealed settings: a = 1/5; K bets {1/16, 1/8, 1/4, 1/2} at delta 1/20; W bets {1/4, 1/2, 1, 2} at delta 1/100; the detector and
 *  the reading at m = 1/5 with bets {1/10, 1/5, 2/5, 4/5}, thresholds 100 (delta 1/100) and 10 000 (delta 1/10 000); weights 1/4. */
const Q4 = rq(1n, 4n), A = rq(1n, 5n), M = rq(1n, 5n);
const MIX_K: TMix = { lambdas: [rq(1n, 16n), rq(1n, 8n), rq(1n, 4n), rq(1n, 2n)], weights: [Q4, Q4, Q4, Q4] };
const MIX_W: TMix = { lambdas: [rq(1n, 4n), rq(1n, 2n), rq(1n), rq(2n)], weights: [Q4, Q4, Q4, Q4] };
const MIX_DET: TMix = { lambdas: [rq(1n, 10n), rq(1n, 5n), rq(2n, 5n), rq(4n, 5n)], weights: [Q4, Q4, Q4, Q4] };
const DELTA_ADM = rq(1n, 20n), DELTA_EXH = rq(1n, 100n), DELTA_ARL = rq(1n, 100n), DELTA_SR = rq(1n, 10000n);
/** A second setting of K, chosen so that its frontier moves before t = 12: a = 1/2 (lambda in (0, 2)), delta = 1/4. */
const A2 = rq(1n, 2n), DELTA_2 = rq(1n, 4n);
const MIX_K2: TMix = { lambdas: [rq(1n, 2n), rq(1n), rq(3n, 2n)], weights: [Q4, rq(1n, 2n), Q4] };
/** The one-bet mixture of the restart-weight checks: lambda 1/2, so g is 1/2 at x = 0 and 3 at x = 1 (m = 1/5). */
const ONE_BET: Mixture = { lambdas: [rq(1n, 2n)], weights: [ONE] };

/** A fixed sequence of 300 labels: a 1 at every fifth step, and a burst of twelve 1s at steps 151 to 162. */
const SEQ_TEXT = "00001000010000100001000010000100001000010000100001" + "00001000010000100001000010000100001000010000100001"
  + "00001000010000100001000010000100001000010000100001" + "11111111111100100001000010000100001000010000100001"
  + "00001000010000100001000010000100001000010000100001" + "00001000010000100001000010000100001000010000100001";
const SEQ: readonly (0 | 1)[] = [...SEQ_TEXT].map((c) => (c === "1" ? 1 : 0));

/** The closed form of the capital, sum_j w_j f1_j^k f0_j^(t - k), over one unreduced common denominator. */
function capitalTerms(mix: TMix, side: BetSide, a: Frac, t: number, k: number): { num: bigint; den: bigint } {
  let num = 0n, den = 1n;
  mix.lambdas.forEach((l, j) => {
    const w = at(mix.weights, j), f1 = tFactor(side, l, a, 1), f0 = tFactor(side, l, a, 0);
    const tn = w.n * f1.n ** BigInt(k) * f0.n ** BigInt(t - k), td = w.d * f1.d ** BigInt(k) * f0.d ** BigInt(t - k);
    num = num * td + tn * den;
    den *= td;
  });
  return { num, den };
}
const capitalClosed = (mix: TMix, side: BetSide, a: Frac, t: number, k: number): Frac => {
  const c = capitalTerms(mix, side, a, t, k);
  return rq(c.num, c.den);
};
/** capital * delta >= 1, on integers. */
const crossesClosed = (mix: TMix, side: BetSide, a: Frac, delta: Frac, t: number, k: number): boolean => {
  const c = capitalTerms(mix, side, a, t, k);
  return c.num * delta.n >= c.den * delta.d;
};
/** The capital as the product along one path, sum_j w_j prod_i f_j(x_i), each factor from its formula. */
function pathCapital(mix: TMix, side: BetSide, a: Frac, path: readonly (0 | 1)[]): Frac {
  let total = ZERO;
  mix.lambdas.forEach((l, j) => {
    const f = [tFactor(side, l, a, 0), tFactor(side, l, a, 1)], w = at(mix.weights, j);
    let n = w.n, d = w.d;
    for (const x of path) {
      n *= at(f, x).n;
      d *= at(f, x).d;
    }
    total = tAdd(total, rq(n, d));
  });
  return total;
}

const PARI = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "pari");
const PARI_FILES = ["bet.ts", "index.ts", "mixture.ts", "rational.ts", "sr.ts", "threshold.ts", "weighted.ts"];
const BANNED_NAMES = new Set(["fetch", "Date", "performance", "process", "globalThis", "setTimeout", "setInterval", "setImmediate",
  "queueMicrotask", "randomBytes", "randomInt", "randomUUID", "randomFill", "randomFillSync", "getRandomValues"]);
/** What makes a library text impure: a load that forbiddenLoads names; a specifier other than node:crypto or a relative one naming a
 *  file of the folder; an identifier of BANNED_NAMES anywhere (property names included); the member random of Math. */
function impurities(text: string): string[] {
  const found = [...forbiddenLoads(text)];
  for (const spec of importSpecifiers(text)) {
    const p = join(PARI, spec);
    if (spec !== "node:crypto" && !(/^\.{1,2}\//.test(spec) && existsSync(p) && dirname(p) === PARI)) found.push(`specifier ${spec}`);
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

// killer: packages/hikae/src/pari/rational.ts:107 CONST "truncated - 1n" -> "truncated + 1n"
test("pari_rational_exact", () => {
  same(q(6n, 4n), { n: 3n, d: 2n }, "q(6, 4)");
  same(q(3n, -6n), { n: -1n, d: 2n }, "q(3, -6)");
  same(q(0n, -7n), { n: 0n, d: 1n }, "q(0, -7)");
  same(q(5n), { n: 5n, d: 1n }, "q(5)");
  same(q(-(2n ** 70n), -(2n ** 72n)), { n: 1n, d: 4n }, "q(-2^70, -2^72)");
  assert.throws(() => q(1n, 0n), RangeError, "q(1, 0)");
  assert.throws(() => q(0n, 0n), RangeError, "q(0, 0)");
  for (const [n, d] of [[asBig(1), 2n], [1n, asBig(2)]] as const) {
    assert.throws(() => q(n, d), refusal(/^q: numerator and denominator must be bigints$/), `q(${s(n)}, ${s(d)}) with a number`);
  }
  for (const bad of [{ n: 1n, d: 0n }, { n: asBig(1), d: 2n }, { n: 1n, d: asBig(2) }]) {
    assert.throws(() => qString(bad), refusal(/^qString: not a rational with d > 0$/), `qString(${s(bad.n)}/${s(bad.d)})`);
  }
  for (const text of [" 1", "a7"]) {
    assert.throws(() => qParse(text), refusal(/^qParse: ".+" is not a rational text$/), `qParse(${JSON.stringify(text)}) before the accepted texts`);
  }
  const accepted: readonly [string, Frac][] = [["0", { n: 0n, d: 1n }], ["7", { n: 7n, d: 1n }], ["-7", { n: -7n, d: 1n }],
    ["3/2", { n: 3n, d: 2n }], ["-7/3", { n: -7n, d: 3n }], ["18446744073709551617/18446744073709551616", { n: TWO64 + 1n, d: TWO64 }],
    ["-1/1" + "0".repeat(31), { n: -1n, d: 10n ** 31n }]];
  for (const [text, x] of accepted) {
    same(qParse(text), x, `qParse(${text})`);
    assert.equal(qString(x), text, `qString of ${text}`);
    assert.equal(qString(qParse(text)), text, `qString(qParse(${text}))`);
    same(qParse(qString(x)), x, `qParse(qString(${text}))`);
  }
  for (const text of ["2/4", "1/1", "-0", "01", "0/3", "1/0", "1/-2", " 1", "1.5", "", "+1", "1 ", "-01", "1/01", "-1/1", "0/1", "-0/1",
    "1/2/3", "/2", "1/", "-", "1e3", "0x10", "-3/6", "4/2"]) assert.throws(() => qParse(text), RangeError, `qParse(${JSON.stringify(text)})`);
  const x = rq(2n ** 60n + 1n, 3n ** 40n), y = rq(-(2n ** 70n + 7n), 5n ** 30n);
  same(add(x, y), rq(x.n * y.d + y.n * x.d, x.d * y.d), "add beyond 2^53");
  same(sub(x, y), rq(x.n * y.d - y.n * x.d, x.d * y.d), "sub beyond 2^53");
  same(mul(x, y), rq(x.n * y.n, x.d * y.d), "mul beyond 2^53");
  same(add(rq(1n, 6n), rq(1n, 3n)), { n: 1n, d: 2n }, "add reduces");
  same(sub(x, x), { n: 0n, d: 1n }, "sub to zero");
  same(add(rq(-1n, TWO64), rq(1n, TWO64)), { n: 0n, d: 1n }, "add to zero");
  same(mul(x, ZERO), { n: 0n, d: 1n }, "mul by zero");
  same(mul(rq(2n ** 60n, 3n ** 5n), rq(3n ** 7n, 2n ** 62n)), { n: 9n, d: 4n }, "mul reduces");
  same(pow(rq(81n, 80n), 2000), { n: 81n ** 2000n, d: 80n ** 2000n }, "pow(81/80, 2000)");
  same(pow(ZERO, 0), { n: 1n, d: 1n }, "pow(0, 0)");
  same(pow(ZERO, 3), { n: 0n, d: 1n }, "pow(0, 3)");
  same(pow(rq(-2n, 3n), 3), { n: -8n, d: 27n }, "pow(-2/3, 3)");
  same(pow(rq(-2n, 3n), 0), { n: 1n, d: 1n }, "pow(-2/3, 0)");
  same(pow(rq(-2n, 3n), 1), { n: -2n, d: 3n }, "pow(-2/3, 1)");
  for (const k of [-1, 1.5, Number.NaN]) assert.throws(() => pow(rq(2n), k), RangeError, `pow(2, ${s(k)})`);
  for (const k of [-1, 1.5, Number.NaN]) {
    assert.throws(() => pow(rq(2n), k), refusal(/^pow: exponent \S+ is not a safe integer >= 0$/), `pow(2, ${s(k)}) refused by pow`);
  }
  assert.equal(cmp(q(2n, 4n), q(-3n, -6n)), 0, "2/4 against -3/-6");
  assert.equal(cmp(x, x), 0, "x against x");
  const big = rq(2n ** 80n + 1n, 2n ** 80n);
  assert.equal(Number(big.n) / Number(big.d), 1, "a float reads (2^80 + 1)/2^80 as 1");
  assert.equal(cmp(big, ONE), 1, "(2^80 + 1)/2^80 against 1");
  assert.equal(cmp(ONE, big), -1, "1 against (2^80 + 1)/2^80");
  assert.equal(cmp(rq(-1n, 3n), rq(-1n, 4n)), -1, "-1/3 against -1/4");
  assert.equal(cmp(rq(-5n), ZERO), -1, "-5 against 0");
  assert.equal(cmp(ZERO, rq(-5n)), 1, "0 against -5");
  const e = 10n ** 30n;
  assert.equal(cmp(rq(e + 1n, e), rq(e + 2n, e + 1n)), 1, "(e + 1)/e against (e + 2)/(e + 1)");
  const floors: readonly [Frac, bigint, bigint][] = [[rq(-1n, 3n), 10n, -4n], [rq(-7n, 2n), 1n, -4n], [rq(7n, 2n), 1n, 3n],
    [rq(1n, 3n), 10n, 3n], [rq(3n, 4n), 4n, 3n], [rq(-3n, 4n), 4n, -3n], [rq(5n), 7n, 35n], [ZERO, 1000n, 0n],
    [rq(-1n, TWO64), 10n ** 9n, -1n], [rq(TWO64 + 1n, TWO64), 10n ** 9n, 10n ** 9n]];
  for (const [v, scale, want] of floors) assert.equal(floorScaled(v, scale), want, `floorScaled(${s(v.n)}/${s(v.d)}, ${s(scale)})`);
  for (const scale of [0n, -1n]) assert.throws(() => floorScaled(rq(1n, 2n), scale), RangeError, `floorScaled scale ${s(scale)}`);
  for (const scale of [asBig(2), 0n]) {
    assert.throws(() => floorScaled(rq(1n, 2n), scale), refusal(/^floorScaled: scale must be a bigint >= 1$/), `floorScaled scale ${typeof scale}`);
  }
});

// killer: packages/hikae/src/pari/bet.ts:32 ROR "lambda.n * span >= lambda.d * a.d" -> "lambda.n * span > lambda.d * a.d"
test("pari_bet_factor_bounds", () => {
  const cases: readonly [BetSide, Frac, 0 | 1, Frac][] = [["below", rq(1n, 16n), 0, { n: 81n, d: 80n }],
    ["below", rq(1n, 16n), 1, { n: 19n, d: 20n }], ["below", rq(1n, 2n), 0, { n: 11n, d: 10n }], ["below", rq(1n, 2n), 1, { n: 3n, d: 5n }],
    ["above", rq(2n), 1, { n: 13n, d: 5n }], ["above", rq(2n), 0, { n: 3n, d: 5n }], ["above", rq(1n, 4n), 1, { n: 6n, d: 5n }],
    ["above", rq(1n, 4n), 0, { n: 19n, d: 20n }]];
  for (const [side, l, x, f] of cases) same(betFactor(side, l, A, x), f, `${side} lambda ${s(l.n)}/${s(l.d)} x ${s(x)}`);
  const eps = rq(1n, 10n ** 30n);
  same(betFactor("below", tSub(rq(5n, 4n), eps), A, 1), rq(4n, 5n * 10n ** 30n), "below at 5/4 - 10^-30, x = 1");
  same(betFactor("above", tSub(rq(5n), eps), A, 0), rq(1n, 5n * 10n ** 30n), "above at 5 - 10^-30, x = 0");
  for (const x of [0, 1] as const) {
    for (const l of [ZERO, rq(5n, 4n), rq(-1n, 16n)]) assert.throws(() => betFactor("below", l, A, x), RangeError, `below ${s(l.n)}/${s(l.d)}`);
    for (const l of [ZERO, rq(5n), rq(-1n, 4n)]) assert.throws(() => betFactor("above", l, A, x), RangeError, `above ${s(l.n)}/${s(l.d)}`);
  }
  for (const side of ["below", "above"] as const) {
    for (const a of [ZERO, ONE, rq(-1n, 5n), rq(6n, 5n)]) {
      assert.throws(() => betFactor(side, rq(1n, 16n), a, 0), RangeError, `${side} a ${s(a.n)}/${s(a.d)}`);
    }
    for (const x of [2, 0.5]) assert.throws(() => betFactor(side, rq(1n, 16n), A, notBit(x)), RangeError, `${side} x ${s(x)}`);
  }
  const middle = refusal(/^betFactor: side middle is neither below nor above$/);
  assert.throws(() => betFactor(asSide("middle"), rq(1n, 16n), A, 0), middle, "side middle");
  for (const [mix, side] of [[MIX_K, "below"], [MIX_W, "above"]] as const) {
    for (const l of mix.lambdas) {
      const f0 = betFactor(side, l, A, 0), f1 = betFactor(side, l, A, 1), what = `${side} lambda ${s(l.n)}/${s(l.d)}`;
      same(f0, tFactor(side, l, A, 0), `${what} x 0`);
      same(f1, tFactor(side, l, A, 1), `${what} x 1`);
      if (side === "below") assert.ok(f0.n > f0.d && f1.n < f1.d, `${what}: above 1 at x = 0, below 1 at x = 1`);
      else assert.ok(f1.n > f1.d && f0.n < f0.d, `${what}: above 1 at x = 1, below 1 at x = 0`);
    }
  }
});

// killer: packages/hikae/src/pari/mixture.ts:79 CONST "scale * den" -> "den"
test("pari_capital_counts_equal_product", () => {
  for (const [mix, side] of [[MIX_K, "below"], [MIX_W, "above"]] as const) {
    for (let t = 0; t <= 10; t++) {
      for (let mask = 0; mask < 2 ** t; mask++) {
        const path = Array.from({ length: t }, (_, i): 0 | 1 => (((mask >> i) & 1) === 1 ? 1 : 0));
        const k = path.reduce<number>((acc, x) => acc + x, 0);
        same(capitalOfCounts(mix, side, A, t, k), pathCapital(mix, side, A, path), `${side} t ${s(t)} path ${s(mask)}`);
      }
    }
  }
  same(capitalOfCounts(MIX_K, "below", A, 2000, 400), capitalClosed(MIX_K, "below", A, 2000, 400), "below t 2000 k 400");
  same(capitalOfCounts(MIX_W, "above", A, 1000, 200), capitalClosed(MIX_W, "above", A, 1000, 200), "above t 1000 k 200");
  for (const [t, k] of [[3, 4], [3, -1], [-1, 0], [1.5, 1], [3, 0.5]] as const) {
    assert.throws(() => capitalOfCounts(MIX_K, "below", A, t, k), RangeError, `t ${s(t)} k ${s(k)}`);
  }
  const counts = refusal(/^capitalOfCounts: counts t \S+ and k \S+ outside 0 <= k <= t$/);
  for (const [t, k] of [[3, 4], [3, -1], [-1, 0], [1.5, 1], [3, 0.5]] as const) {
    assert.throws(() => capitalOfCounts(MIX_K, "below", A, t, k), counts, `t ${s(t)} k ${s(k)} refused by capitalOfCounts`);
  }
  const two = [rq(1n, 16n), rq(1n, 8n)];
  const bad: readonly Mixture[] = [{ lambdas: [], weights: [] }, { lambdas: two, weights: [ONE] }, { lambdas: two, weights: [ONE, ZERO] },
    { lambdas: two, weights: [rq(5n, 4n), rq(-1n, 4n)] }, { lambdas: two, weights: [rq(1n, 2n), tAdd(rq(1n, 2n), rq(1n, 10n ** 20n))] }];
  for (const side of ["below", "above"] as const) {
    bad.forEach((mix, i) => assert.throws(() => capitalOfCounts(mix, side, A, 3, 1), RangeError, `${side} bad mixture ${s(i)}`));
  }
  const notOne = /^capitalOfCounts: the weights do not sum to 1$/;
  const refused: readonly [Mixture, RegExp, string][] = [[{ lambdas: [], weights: [] }, /^capitalOfCounts: mixture lists empty/, "empty"],
    [{ lambdas: two, weights: [ONE, ONE] }, notOne, "weights summing to 2"], [{ lambdas: two, weights: [Q4, Q4] }, notOne, "weights summing to 1/2"]];
  for (const [mix, message, what] of refused) assert.throws(() => capitalOfCounts(mix, "below", A, 3, 1), refusal(message), what);
  const outK: Mixture = { lambdas: [rq(1n, 16n), rq(1n, 8n), rq(1n, 4n), rq(5n, 4n)], weights: [Q4, Q4, Q4, Q4] };
  const outW: Mixture = { lambdas: [rq(1n, 4n), rq(1n, 2n), rq(1n), rq(5n)], weights: [Q4, Q4, Q4, Q4] };
  assert.throws(() => capitalOfCounts(outK, "below", A, 3, 1), RangeError, "below lambda 5/4");
  assert.throws(() => capitalOfCounts(outW, "above", A, 3, 1), RangeError, "above lambda 5");
});

// killer: packages/hikae/src/pari/mixture.ts:121 CONST "front = t + 1" -> "front = t"
test("pari_crossing_table_exact", () => {
  assert.deepEqual([...crossingTable(MIX_W, "above", A, DELTA_EXH, 0)], [1], "W at tMax 0: no crossing is t + 1");
  assert.deepEqual([...crossingTable(MIX_K, "below", A, DELTA_ADM, 0)], [-1], "K at tMax 0: no crossing is -1");
  const pinned: readonly [TMix, BetSide, Frac, Frac, readonly number[], string][] = [
    [MIX_W, "above", A, DELTA_EXH, [1, 2, 3, 4, 5, 6, 7, 7, 7, 8, 8, 8, 9], "W sealed"],
    [MIX_K, "below", A, DELTA_ADM, [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], "K sealed"],
    [MIX_K2, "below", A2, DELTA_2, [-1, -1, -1, -1, 0, 0, 0, 1, 1, 1, 2, 2, 2], "K second"]];
  for (const [mix, side, a, delta, want, what] of pinned) assert.deepEqual([...crossingTable(mix, side, a, delta, 12)], want, `${what}, t <= 12`);
  assert.ok(!crossesClosed(MIX_K, "below", A, DELTA_ADM, 12, 0), "K sealed: k = 0 does not cross at t = 12");
  const deep: readonly [TMix, BetSide, Frac, Frac, number, readonly [number, number][], string][] = [
    [MIX_K, "below", A, DELTA_ADM, 2000, [[44, -1], [45, 0], [46, 0], [200, 24], [2000, 349]], "K sealed"],
    [MIX_W, "above", A, DELTA_EXH, 1000, [[45, 20], [200, 61], [1000, 246]], "W sealed"],
    [MIX_K2, "below", A2, DELTA_2, 200, [[45, 15], [200, 81]], "K second"]];
  for (const [mix, side, a, delta, tMax, points, what] of deep) {
    const table = crossingTable(mix, side, a, delta, tMax);
    assert.equal(table.length, tMax + 1, `${what}: length`);
    for (const [t, k] of points) assert.equal(table[t], k, `${what}: entry at t ${s(t)}`);
    for (let t = 0; t <= tMax; t++) {
      const k = table[t] ?? Number.NaN, where = `${what}: t ${s(t)} entry ${s(k)}`;
      assert.ok(Number.isSafeInteger(k), `${where} not an integer`);
      if (side === "above") {
        assert.ok(k >= 0 && k <= t + 1, `${where} out of [0, t + 1]`);
        if (k <= t) assert.ok(crossesClosed(mix, side, a, delta, t, k), `${where} does not cross`);
        if (k - 1 >= 0) assert.ok(!crossesClosed(mix, side, a, delta, t, k - 1), `${where}: k - 1 crosses`);
      } else {
        assert.ok(k >= -1 && k <= t, `${where} out of [-1, t]`);
        if (k >= 0) assert.ok(crossesClosed(mix, side, a, delta, t, k), `${where} does not cross`);
        if (k + 1 <= t) assert.ok(!crossesClosed(mix, side, a, delta, t, k + 1), `${where}: k + 1 crosses`);
      }
    }
  }
  for (const delta of [ZERO, ONE, rq(3n, 2n)]) {
    assert.throws(() => crossingTable(MIX_W, "above", A, delta, 5), RangeError, `delta ${s(delta.n)}/${s(delta.d)}`);
  }
  for (const tMax of [-1, 1.5]) assert.throws(() => crossingTable(MIX_K, "below", A, DELTA_ADM, tMax), RangeError, `tMax ${s(tMax)}`);
  const sumTwo: Mixture = { lambdas: [rq(1n, 4n), rq(1n, 2n)], weights: [ONE, ONE] };
  const sumNotOne = refusal(/^crossingTable: the weights do not sum to 1$/);
  assert.throws(() => crossingTable(sumTwo, "above", A, DELTA_EXH, 3), sumNotOne, "weights summing to 2");
  // One bet, lambda 1, a = 1/2: the factors are 3/2 and 1/2, so the capital is 3^c / 2^t with c the count of the winning label, and
  // capital * 4/9 >= 1 iff 4 * 3^c >= 9 * 2^t: c = 2 at t = 2 is an equality (36 = 36), c = 3 at t = 3 and c = 4 at t = 4 cross.
  assert.equal(4n * 3n ** 2n, 9n * 2n ** 2n, "4 * 3^2 = 9 * 2^2");
  const EQ: Mixture = { lambdas: [ONE], weights: [ONE] }, DELTA_EQ = rq(4n, 9n);
  assert.deepEqual([...crossingTable(EQ, "above", A2, DELTA_EQ, 4)], [1, 2, 2, 3, 4], "above, equality at t = 2 crosses");
  assert.deepEqual([...crossingTable(EQ, "below", A2, DELTA_EQ, 4)], [-1, -1, 0, 0, 0], "below, equality at t = 2 crosses");
});

// killer: packages/hikae/src/pari/weighted.ts:19 CONST "BigInt(t) * BigInt(t + 1)" -> "BigInt(t) * BigInt(t)"
test("pari_weighted_restart_weights", () => {
  same(srIncrement(rq(1n, 2n), M, 0), { n: 1n, d: 2n }, "g at x = 0");
  same(srIncrement(rq(1n, 2n), M, 1), { n: 3n, d: 1n }, "g at x = 1");
  assert.equal(wTilde(1), 2n ** 63n, "w~_1 = 2^63");
  assert.equal(wTilde(2 ** 32), 0n, "w~ at t = 2^32 is 0");
  const rows: readonly [number, bigint, bigint][] = [[1, 4611686018427387904n, 27670116110564327424n],
    [2, 1537228672809129301n, 9223372036854775806n], [3, 768614336404564650n, 4611686018427387903n],
    [10, 83848836698679780n, 503093020192078680n], [1000, 9214157878975n, 55284947273853n], [2 ** 26, 2047n, 12285n], [2 ** 32, 0n, 0n]];
  for (const [t, at0, at1] of rows) {
    assert.equal(at0, wTilde(t) / 2n, `literal at x = 0, t ${s(t)}`);
    assert.equal(at1, 3n * wTilde(t), `literal at x = 1, t ${s(t)}`);
    assert.deepEqual([...weightedStep([0n], ONE_BET, M, 0, t)], [at0], `x = 0, t ${s(t)}`);
    assert.deepEqual([...weightedStep([0n], ONE_BET, M, 1, t)], [at1], `x = 1, t ${s(t)}`);
  }
  assert.equal((3n * TWO64) / 6n, 2n ** 63n, "rounded after the sum, t = 2 from 0, x = 1");
  const sPrev = 1806243690550726928n, after = ((sPrev * 30n + TWO64) * 3n) / 30n;
  assert.equal(after, 7263405479023135945n, "rounded after the sum, t = 5, x = 1");
  assert.deepEqual([...weightedStep([sPrev], ONE_BET, M, 1, 5)], [7263405479023135944n], "weight rounded first, t = 5, x = 1");
  assert.ok(SEQ.length === 300 && /^[01]+$/.test(SEQ_TEXT), "the fixed sequence");
  const gs = ([0, 1] as const).map((x) => MIX_DET.lambdas.map((l) => tInc(l, M, x)));
  let st: bigint[] = MIX_DET.lambdas.map(() => 0n);
  const want: bigint[] = MIX_DET.lambdas.map(() => 0n);
  for (let t = 1; t <= 300; t++) {
    const x = at(SEQ, t - 1), g = at(gs, x);
    st = weightedStep(st, MIX_DET, M, x, t);
    for (let j = 0; j < want.length; j++) want[j] = ((at(want, j) + wTilde(t)) * at(g, j).n) / at(g, j).d;
    assert.deepEqual([...st], want, `detector state, t ${s(t)}`);
    const value = want.reduce((acc, v, j) => tAdd(acc, tMul(at(MIX_DET.weights, j), rq(v, TWO64))), ZERO);
    same(weightedValue(st, MIX_DET), value, `detector value, t ${s(t)}`);
  }
  for (const t of [0, -1, 1.5, Number.NaN]) assert.throws(() => weightedStep([0n], ONE_BET, M, 1, t), RangeError, `t ${s(t)}`);
  const rank = refusal(/^weightedStep: rank \S+ is not a safe integer >= 1$/);
  for (const t of [0, -1, 1.5, Number.NaN]) assert.throws(() => weightedStep([0n], ONE_BET, M, 1, t), rank, `t ${s(t)} refused by weightedStep`);
  assert.throws(() => weightedStep([0n, 0n], ONE_BET, M, 1, 1), RangeError, "state of length 2");
  assert.throws(() => weightedStep([-1n], ONE_BET, M, 1, 1), RangeError, "negative component");
  for (const l of [ZERO, ONE]) {
    assert.throws(() => weightedStep([0n], { lambdas: [l], weights: [ONE] }, M, 1, 1), RangeError, `lambda ${s(l.n)}`);
  }
  for (const m of [ZERO, ONE]) assert.throws(() => weightedStep([0n], ONE_BET, m, 1, 1), RangeError, `m ${s(m.n)}`);
});

// killer: packages/hikae/src/pari/sr.ts:50 CONST "((UNIT + v) * gj.n) / gj.d" -> "((UNIT + v) * gj.n + gj.d - 1n) / gj.d"
test("sr_fixed_point_never_exceeds_exact", () => {
  const gs = ([0, 1] as const).map((x) => MIX_DET.lambdas.map((l) => tInc(l, M, x)));
  const mixOf = (vals: readonly Frac[]): Frac => vals.reduce((acc, v, j) => tAdd(acc, tMul(at(MIX_DET.weights, j), v)), ZERO);
  const fixedOf = (vals: readonly bigint[]): Frac => mixOf(vals.map((v) => rq(v, TWO64)));
  let r: bigint[] = MIX_DET.lambdas.map(() => 0n), w: bigint[] = MIX_DET.lambdas.map(() => 0n);
  const wantR = [...r], wantW = [...w];
  const exR: Frac[] = MIX_DET.lambdas.map(() => ZERO), exW = [...exR], bR = [...exR], bW = [...exR];
  const first = { exactR: 0, fixedR: 0, exactW: 0, fixedW: 0 }, margin = { r: false, w: false };
  for (let t = 1; t <= 300; t++) {
    const x = at(SEQ, t - 1), g = at(gs, x);
    r = srStep(r, MIX_DET, M, x);
    w = weightedStep(w, MIX_DET, M, x, t);
    for (let j = 0; j < wantR.length; j++) {
      const gj = at(g, j);
      wantR[j] = ((TWO64 + at(wantR, j)) * gj.n) / gj.d;
      wantW[j] = ((at(wantW, j) + wTilde(t)) * gj.n) / gj.d;
      exR[j] = tMul(tAdd(ONE, at(exR, j)), gj);
      exW[j] = tMul(tAdd(at(exW, j), rq(1n, BigInt(t) * BigInt(t + 1))), gj);
      bR[j] = tAdd(tMul(gj, at(bR, j)), ONE);
      bW[j] = tAdd(tMul(gj, tAdd(at(bW, j), ONE)), ONE);
    }
    assert.deepEqual([...r], wantR, `reading state, t ${s(t)}`);
    assert.deepEqual([...w], wantW, `detector state, t ${s(t)}`);
    for (let j = 0; j < wantR.length; j++) {
      const errR = tSub(tMul(at(exR, j), UNIT), rq(at(r, j))), errW = tSub(tMul(at(exW, j), UNIT), rq(at(w, j)));
      const where = `t ${s(t)} component ${s(j)}`;
      assert.ok(errR.n >= 0n && geF(at(bR, j), errR), `${where}: R 2^64 - r~ outside [0, B_t]`);
      assert.ok(errW.n >= 0n && geF(at(bW, j), errW), `${where}: S 2^64 - s~ outside [0, B'_t]`);
    }
    const vR = srValue(r, MIX_DET), vW = weightedValue(w, MIX_DET), xR = mixOf(exR), xW = mixOf(exW);
    same(vR, fixedOf(wantR), `reading value, t ${s(t)}`);
    same(vW, fixedOf(wantW), `detector value, t ${s(t)}`);
    assert.ok(geF(xR, vR) && geF(xW, vW), `t ${s(t)}: a fixed value above the exact mixture`);
    const exactR = geF(tMul(xR, DELTA_SR), ONE), exactW = geF(tMul(xW, DELTA_ARL), ONE);
    const fixedR = crosses(vR, DELTA_SR), fixedW = crosses(vW, DELTA_ARL);
    assert.equal(fixedR, geF(tMul(vR, DELTA_SR), ONE), `t ${s(t)}: crosses on the reading against integers`);
    assert.equal(fixedW, geF(tMul(vW, DELTA_ARL), ONE), `t ${s(t)}: crosses on the detector against integers`);
    assert.ok(!fixedR || exactR, `t ${s(t)}: the fixed reading crosses, the exact one does not`);
    assert.ok(!fixedW || exactW, `t ${s(t)}: the fixed detector crosses, the exact one does not`);
    if (exactR && first.exactR === 0) {
      first.exactR = t;
      margin.r = tSub(tSub(xR, rq(10000n)), tDiv(mixOf(bR), UNIT)).n > 0n;
    }
    if (exactW && first.exactW === 0) {
      first.exactW = t;
      margin.w = tSub(tSub(xW, rq(100n)), tDiv(mixOf(bW), UNIT)).n > 0n;
    }
    if (fixedR && first.fixedR === 0) first.fixedR = t;
    if (fixedW && first.fixedW === 0) first.fixedW = t;
  }
  assert.equal(first.exactR, 156, "the exact reading first crosses 10 000 at step 156");
  assert.equal(first.exactW, 160, "the exact detector first crosses 100 at step 160");
  assert.ok(margin.r && margin.w, "at those steps the exact values exceed their thresholds by more than their bounds");
  assert.equal(first.fixedR, first.exactR, "the fixed reading first crosses at the same step");
  assert.equal(first.fixedW, first.exactW, "the fixed detector first crosses at the same step");
  for (const bad of [{ st: [0n, 0n, 0n], what: "state of length 3" }, { st: [0n, 0n, -1n, 0n], what: "negative component" }]) {
    assert.throws(() => srStep(bad.st, MIX_DET, M, 1), RangeError, `srStep ${bad.what}`);
  }
  for (const m of [ZERO, ONE]) assert.throws(() => srStep([0n], ONE_BET, m, 1), RangeError, `srStep m ${s(m.n)}`);
  for (const l of [ZERO, ONE, rq(-1n, 2n)]) {
    assert.throws(() => srIncrement(l, M, 1), RangeError, `srIncrement lambda ${s(l.n)}/${s(l.d)}`);
    assert.throws(() => srStep([0n], { lambdas: [l], weights: [ONE] }, M, 1), RangeError, `srStep lambda ${s(l.n)}/${s(l.d)}`);
  }
  for (const m of [ZERO, ONE, rq(3n, 2n)]) assert.throws(() => srIncrement(rq(1n, 2n), m, 1), RangeError, `srIncrement m ${s(m.n)}/${s(m.d)}`);
  assert.throws(() => srIncrement(rq(1n, 2n), M, notBit(2)), RangeError, "srIncrement x 2");
  assert.throws(() => srIncrement(rq(1n, 2n), ZERO, 1), refusal(/^srIncrement: m outside \(0, 1\)$/), "srIncrement m 0 refused by srIncrement");
  const halfW: Mixture = { lambdas: [rq(1n, 2n)], weights: [rq(1n, 2n)] }, betOne: Mixture = { lambdas: [ONE], weights: [ONE] };
  assert.throws(() => srStep([0n], halfW, M, 1), refusal(/^srStep: the weights do not sum to 1$/), "srStep weights summing to 1/2");
  assert.throws(() => srValue([0n], halfW), refusal(/^srValue: the weights do not sum to 1$/), "srValue weights summing to 1/2");
  assert.throws(() => srValue([0n], betOne), refusal(/^srIncrement: lambda outside \(0, 1\)$/), "srValue lambda 1");
  assert.throws(() => srValue([-1n], ONE_BET), refusal(/^srValue: a state component is not a bigint >= 0$/), "srValue component -1");
  const notBigState = refusal(/^srStep: a state component is not a bigint >= 0$/);
  assert.throws(() => srStep([asBig(1)], ONE_BET, M, 1), notBigState, "srStep component 1 as a number");
});

// killer: packages/hikae/src/pari/threshold.ts:19 ROR ">=" -> ">"
test("pari_threshold_integer", () => {
  assert.equal(crosses(rq(100n), rq(1n, 100n)), true, "equality crosses");
  assert.equal(crosses(rq(9999n, 100n), rq(1n, 100n)), false, "99.99 at 1/100");
  const v = rq(3n * 2n ** 60n - 1n, 2n ** 60n);
  assert.equal((Number(v.n) / Number(v.d)) * (1 / 3), 1, "a float product reads 1");
  assert.equal(crosses(v, rq(1n, 3n)), false, "(3 2^60 - 1)/2^60 at 1/3");
  assert.equal(crosses(rq(3n), rq(1n, 3n)), true, "3 at 1/3");
  for (const neg of [ZERO, rq(-5n), rq(-1n, 3n)]) assert.equal(crosses(neg, rq(1n, 2n)), false, `${s(neg.n)}/${s(neg.d)} at 1/2`);
  assert.equal(crosses(rq(10n ** 40n), rq(1n, 10n ** 40n)), true, "10^40 at 10^-40");
  assert.equal(crosses(rq(10n ** 40n - 1n), rq(1n, 10n ** 40n)), false, "10^40 - 1 at 10^-40");
  for (const delta of [ZERO, ONE, rq(-1n, 2n), rq(3n, 2n)]) {
    assert.throws(() => crosses(rq(100n), delta), RangeError, `delta ${s(delta.n)}/${s(delta.d)}`);
  }
  assert.throws(() => crosses({ n: 1n, d: 0n }, rq(1n, 2n)), refusal(/^crosses value: not a rational with d > 0$/), "value 1/0");
});

// killer: packages/hikae/src/pari/index.ts:16 CONST "{ crosses }" -> "{ crosses, checkDelta }"
test("pari_purity_sweep", () => {
  assert.deepEqual(readdirSync(PARI).sort(), PARI_FILES, "the files of src/pari/");
  for (const f of PARI_FILES) assert.deepEqual(impurities(readFileSync(join(PARI, f), "utf8")), [], `src/pari/${f}`);
  const witnesses: readonly [string, string][] = [["import { readFileSync } from \"node:fs\";\nexport const r = readFileSync;\n", "node:fs"],
    ["export const f = (): Promise<Response> => fetch(\"x\");\n", "fetch"], ["export const g = (): number => Date.now();\n", "Date"]];
  for (const [text, name] of witnesses) assert.ok(impurities(text).some((hit) => hit.includes(name)), `the sweep refuses ${name}`);
  assert.deepEqual(Object.keys(pari).sort(), ["add", "betFactor", "capitalOfCounts", "cmp", "crosses", "crossingTable", "floorScaled", "mul",
    "pow", "q", "qParse", "qString", "srIncrement", "srStep", "srValue", "sub", "weightedStep", "weightedValue"], "the values of index.ts");
  for (const [name, value] of Object.entries(pari)) assert.equal(typeof value, "function", `${name} is a function`);
  const index = ts.createSourceFile("index.ts", readFileSync(join(PARI, "index.ts"), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const typeNames: string[] = [];
  for (const st of index.statements) {
    if (!ts.isExportDeclaration(st)) continue;
    assert.ok(st.exportClause !== undefined && ts.isNamedExports(st.exportClause), "index.ts re-exports by name, never by export *");
    for (const el of st.exportClause.elements) if (st.isTypeOnly || el.isTypeOnly) typeNames.push(el.name.text);
  }
  assert.deepEqual(typeNames.sort(), ["BetSide", "Mixture", "Q"], "the types of index.ts");
});
