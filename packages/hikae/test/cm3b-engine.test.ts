/**
 * HIKAE engine - lot CM-3b of the chantier moteur (audit P3 S-4 / E-1 engine side, E-14 pin, E-2, S-13; ADR-CM section 3).
 * Oracle: docs/G0-lot-cm-3b.md; RECHERCHES decisions/0005-AVIS-advisor-conformal-P2a-band-edge.md (h* the largest double
 * with fl(h* / sigmaHat) <= qhat); RECHERCHES kata/registry/FORMAT.md l.36 and kata/bench/calibrate.ts seqDigest (the
 * ordered digests). Expected values come from this file: the band edge is checked by an exact rounding rule in BigInt
 * rationals (round to nearest, ties to even), the digests by vectors computed with the bench's seqDigest and with
 * sha256sum on the literal text. New names are read through the index namespace, so the base reddens by assertion.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as hikae from "../src/index.ts";
import { riskControlRow, buildIntervalRegion } from "../src/index.ts";

type Fn = (...args: never[]) => unknown;
function fn<T extends Fn>(name: string): T {
  const f = (hikae as Record<string, unknown>)[name];
  assert.equal(typeof f, "function", `index exports ${name}`);
  return f as T;
}
type Row = Record<string, unknown>;
const UNDER = { reason: "under_calib" };

/** Test-side exact value of a finite double: num / den, den a power of two. */
function exact(x: number): { num: bigint; den: bigint } {
  const v = new DataView(new ArrayBuffer(8));
  v.setFloat64(0, x);
  const bits = v.getBigUint64(0);
  const e = Number((bits >> 52n) & 0x7ffn);
  const m = bits & ((1n << 52n) - 1n);
  const mant = e === 0 ? m : m | (1n << 52n);
  const p = (e === 0 ? 1 : e) - 1075; // x = mant x 2^p
  return p >= 0 ? { num: mant << BigInt(p), den: 1n } : { num: mant, den: 1n << BigInt(-p) };
}

/** Test-side next double above x >= 0, and the parity of x's last mantissa bit. */
function up(x: number): number {
  const v = new DataView(new ArrayBuffer(8));
  v.setFloat64(0, x);
  v.setBigUint64(0, v.getBigUint64(0) + 1n);
  return v.getFloat64(0);
}
function evenLast(x: number): boolean {
  const v = new DataView(new ArrayBuffer(8));
  v.setFloat64(0, x);
  return (v.getBigUint64(0) & 1n) === 0n;
}

/**
 * Exact rule: fl(h / s) <= q, round to nearest, ties to even, for h, q >= 0 and s > 0 finite: the exact quotient lies below
 * the midpoint of q and its successor, or on it with q even. Never uses the floating division.
 */
function divLeq(h: number, s: number, q: number): boolean {
  const H = exact(h), S = exact(s), Q = exact(q), U = exact(up(q));
  // h / s versus (q + up(q)) / 2: compare H.num S.den 2 Q.den U.den with (Q.num U.den + U.num Q.den) S.num H.den.
  const lhs = H.num * S.den * 2n * Q.den * U.den;
  const rhs = (Q.num * U.den + U.num * Q.den) * S.num * H.den;
  return lhs < rhs || (lhs === rhs && evenLast(q));
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// S-4 / E-1: h* = bandEdge(qhat, sigmaHat) is the largest double with fl(h* / sigmaHat) <= qhat, on a grid of 40 x 40
// (qhat, sigmaHat) pairs (fixed values and seeded draws over many binades): the exact rule holds at h* and fails at its
// successor; x <= h* iff fl(x / sigmaHat) <= qhat on the four neighbours of h*; the raw product fl(qhat x sigmaHat) is
// not h* on a share of the grid (the advisor's point: the product band can exclude its own qhat point).
// killer: packages/hikae/src/scaled-band.ts:43 ROR "h / sigmaHat > qhat" -> "h / sigmaHat >= qhat"
test("band_edge_is_the_largest_double_under_qhat", () => {
  const edge = fn<(q: number, s: number) => number | null>("bandEdge");
  const rnd = mulberry32(31);
  const draw = (): number => (0.5 + rnd()) * 10 ** Math.floor(rnd() * 16 - 8);
  const qs = [1e-300, 1e-9, 0.001, 0.1, 1 / 3, 0.7, 1, 2.5, Math.PI, 1e10, ...Array.from({ length: 30 }, draw)];
  const ss = [1e-8, 0.003, 0.1, 1 / 3, 0.5, 1, 1.1, 7, 1e5, 2, ...Array.from({ length: 30 }, draw)];
  let differ = 0;
  for (const q of qs) {
    for (const s of ss) {
      const h = edge(q, s);
      assert.ok(h !== null && h >= 0, `q ${q} s ${s}`);
      assert.ok(divLeq(h, s, q), `fl(h*/s) <= q at q ${q} s ${s}`);
      assert.ok(!divLeq(up(h), s, q), `the successor of h* is out at q ${q} s ${s}`);
      const down = h === 0 ? 0 : exactPrev(h);
      for (const x of [down, h, up(h), up(up(h))]) assert.equal(x <= h, x / s <= q, `x ${x} q ${q} s ${s}`);
      if (h !== q * s) differ++;
    }
  }
  assert.ok(differ > 0, "the product band differs from h* somewhere on the grid");
  assert.equal(edge(1e300, 1e10), null, "a non-finite product gives no band");
  for (const [q, s] of [[-1, 1], [Number.NaN, 1], [1, 0], [1, -1], [1, Infinity]]) assert.throws(() => edge(q as number, s as number), RangeError);
});

/** Test-side previous double of x > 0. */
function exactPrev(x: number): number {
  const v = new DataView(new ArrayBuffer(8));
  v.setFloat64(0, x);
  v.setBigUint64(0, v.getBigUint64(0) - 1n);
  return v.getFloat64(0);
}

// S-4 / E-1 and E-14: conformScaledBand = riskControlRow on the band domain, then the closed region [0, h*] of
// buildIntervalRegion. qhat = 0 (all-zero scores) is under_calib: at sigmaHat 2 the band [0, 5e-324] would otherwise be
// served (fl(5e-324 / 2) = 0), and the additive band at qhat 0 abstains too (NDG-1). Negative scores, a sigmaHat not
// finite and > 0, and the refusals of riskControlRow fail closed; attempt and spendIndex reach the row (amendment A-1).
// killer: packages/hikae/src/scaled-band.ts:83 CONST "row.qhat === 0" -> "false"
test("conform_scaled_band_serves_zero_to_h_star", () => {
  const band = fn<(scores: readonly number[], s: number, a: string, d: string, nMin: number, o?: Row) => Row>("conformScaledBand");
  const edge = fn<(q: number, s: number) => number | null>("bandEdge");
  const rnd = mulberry32(7);
  const scores = Array.from({ length: 1000 }, () => Math.abs(rnd() - 0.5) * 3);
  const sigma = 0.0137;
  const row = riskControlRow(scores, "0.01", "0.05", 300, { domain: "band" });
  assert.ok("qhat" in row && !row.silence);
  const out = band(scores, sigma, "0.01", "0.05", 300);
  const hStar = edge(row.qhat, sigma);
  assert.ok(hStar !== null);
  const built = buildIntervalRegion(0, hStar);
  assert.ok(!built.abstain);
  const { qhat, rank, kStar, kObs, calibMisses, attempt, spendIndex, testDelta, missBound } = row;
  assert.deepEqual(out, { qhat, rank, kStar, kObs, calibMisses, attempt, spendIndex, testDelta, missBound, hStar, region: built.region });
  assert.deepEqual(built.region, { kind: "interval", lo: 0, hi: hStar });
  const again = band(scores, sigma, "0.01", "0.10", 300, { attempt: 2, spendIndex: 2 });
  assert.deepEqual([again.testDelta, again.attempt, again.spendIndex, again.qhat], ["0.05", 2, 2, row.qhat]);
  // E-14: qhat 0 never serves, in the scaled band and in the additive band.
  const zeros = Array.from({ length: 400 }, () => 0);
  for (const s of [2, 1, 0.5]) assert.deepEqual(band(zeros, s, "0.01", "0.05", 300), UNDER, `zeros, sigmaHat ${s}`);
  assert.equal(edge(0, 2), Number.MIN_VALUE, "the edge itself is a subnormal at sigmaHat 2");
  assert.deepEqual(buildIntervalRegion(5, 5), UNDER_ABSTAIN);
  // Refusals.
  for (const s of [0, -1, Number.NaN, Infinity]) assert.deepEqual(band(scores, s, "0.01", "0.05", 300), UNDER, `sigmaHat ${s}`);
  assert.deepEqual(band([...scores, -0.1], sigma, "0.01", "0.05", 300), UNDER, "a negative score");
  assert.deepEqual(band(scores.slice(0, 298), sigma, "0.01", "0.05", 1), UNDER, "n below n0");
  assert.deepEqual(band(scores, sigma, "0.01", "0.05", 300, { attempt: 2, spendIndex: 3 }), UNDER, "spendIndex above attempt");
});
const UNDER_ABSTAIN = { abstain: true, reason: "under_calib" };

// E-2: orderedCalibDigest is the P2 bench's scoresSha256 / auxSha256 (sha256 of the JSON writing in time order). Vectors
// computed on 2026-10-03 by RECHERCHES kata/bench/calibrate.ts seqDigest (Node 24.21.0), the first and the empty one
// also by sha256sum on the literal text. Order matters (calibDigest sorts); a non-finite number throws.
// killer: packages/hikae/src/canonical-row.ts:38 CONST "sha(aux)" -> "sha(scores)"
test("ordered_calib_digest_matches_the_p2_bench", () => {
  const digest = fn<(s: readonly number[], a: readonly number[]) => Row>("orderedCalibDigest");
  const v = [0, 1, 1e-7, 0.30000000000000004, 1.5501056004166666e-4, 2, 123456789.125, -0, 5e-324];
  const labels = [1, 0, 0, 1, 1];
  assert.deepEqual(digest(v, labels), {
    scoresSha256: "f94f348484ec6ee2cec00727302cb79e617715de0060db2d06c1a758ea86c5d4",
    auxSha256: "168574641f44603a79ef6fc2eaf500a0b640894c0ce4cd60aebb87e72a30922b",
  });
  assert.equal(digest([], []).scoresSha256, "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945");
  assert.notEqual(digest([...v].reverse(), labels).scoresSha256, digest(v, labels).scoresSha256, "time order matters");
  for (const bad of [Number.NaN, Infinity, -Infinity]) assert.throws(() => digest([0, bad], []), RangeError);
});

// S-13: canonicalRow writes an F-7 row as minified JSON, keys sorted by UTF-8 bytes, numbers in the shortest round-trip
// decimal (-0 as 0, 1e+21), and throws on a non-finite number, undefined or a function at any depth.
// killer: packages/hikae/src/canonical-row.ts:26 CONST "Number.isFinite(v)" -> "true"
test("canonical_row_is_one_writing_for_f7_rows", () => {
  const canon = fn<(v: unknown) => string>("canonicalRow");
  const row = { b: 1, a: [0.1, -0, 1e21, 1e-7, "x"], "é": null, Z: true, n: { y: 2, x: [] } };
  assert.equal(canon(row), '{"Z":true,"a":[0.1,0,1e+21,1e-7,"x"],"b":1,"n":{"x":[],"y":2},"é":null}');
  assert.equal(canon({ "é": 1, "￿": 2, "😀": 3 }), '{"é":1,"￿":2,"😀":3}', "UTF-8 byte order, not UTF-16");
  assert.equal(canon(1.5501056004166666e-4), "0.00015501056004166666");
  for (const [name, bad] of [["NaN", Number.NaN], ["Infinity", Infinity], ["nested -Infinity", { a: [1, -Infinity] }], ["undefined", { a: undefined }], ["function", { f: () => 0 }], ["bigint", [1n]]] as const) {
    assert.throws(() => canon(bad), RangeError, name);
  }
});
