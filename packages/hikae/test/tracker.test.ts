import { test } from "node:test";
import assert from "node:assert/strict";
import {
  trackerInit,
  trackerStepSize,
  trackerStep,
  clipScore,
  trackerReplay,
  trackerDigest,
  imocpStep,
  mulberry32,
} from "../src/index.ts";
import type { TrackerParams, TrackerState, Miscover } from "../src/index.ts";

// Every numeric parameter below is TEST-ONLY (ADR-M009 D5 exports no default for c, eps, t0).
// B = 1/24 is the ADR-M009 physical bound (a score is a fraction of the opening stock per hour).
// Pinned engine = Node (Buffer float64_be + node:crypto sha256), declared per ADR-M009 D6.
const B = 1 / 24; // test-only bound (ADR-M009 D4 / M008 D4)

/** float64_be hex of one double (Node engine, pinned). */
function doubleBEHex(x: number): string {
  const b = Buffer.alloc(8);
  b.writeDoubleBE(x, 0);
  return b.toString("hex");
}

/** Seeded scores in [0,B] (mulberry32 from the S2 instrument — clock-independent). */
function seededScores(seed: number, n: number, bound: number): number[] {
  const rnd = mulberry32(seed);
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(rnd() * bound);
  return out;
}

// 1 — miscover raises q, cover lowers q (via imocpStep).
test("tracker_direction", () => {
  const params: TrackerParams = { alpha: 0.1, c: B, eps: 0.1, t0: 0, B }; // test-only
  const q1 = B / 2; // test-only warm start in (0,B)
  const init = trackerInit(q1, params);
  const miss = trackerStep(init, B); // s = B > q  => miscover
  const cov = trackerStep(init, 0); // s = 0 <= q  => covered
  assert.equal(miss.E, 1, "s=B > q => E=1 (miscover)");
  assert.equal(cov.E, 0, "s=0 <= q => E=0 (covered)");
  assert.ok(miss.state.q > init.q, `miscover => q rises (${String(miss.state.q)} > ${String(init.q)})`);
  assert.ok(cov.state.q < init.q, `cover => q falls (${String(cov.state.q)} < ${String(init.q)})`);
});

// 2 — ABB Lemma 1: -alpha*M_{t-1} <= q_t <= B + (1-alpha)*M_{t-1}, M_t = max_{r<=t} eta_r, for all t.
test("tracker_lemma1_bound", () => {
  const params: TrackerParams = { alpha: 0.1, c: B, eps: 0.1, t0: 0, B }; // c = B, test-only
  const q1 = B / 2;
  const T = 1000;
  const seqs: { name: string; scores: number[] }[] = [
    { name: "s=B", scores: Array.from({ length: T }, () => B) },
    { name: "s=0", scores: Array.from({ length: T }, () => 0) },
    { name: "alt", scores: Array.from({ length: T }, (_, i) => (i % 2 === 0 ? B : 0)) },
  ];
  const tol = 1e-9; // float rounding headroom only (the bound is not fudged)
  for (const seq of seqs) {
    let state = trackerInit(q1, params);
    let mMax = 0; // M_0 = 0
    assert.ok(
      state.q >= -params.alpha * mMax - tol && state.q <= params.B + (1 - params.alpha) * mMax + tol,
      `${seq.name}: Lemma1 at t=1 (q_1=${String(state.q)})`,
    );
    for (const [k, s] of seq.scores.entries()) {
      const eta = trackerStepSize(k, params); // eta_{k+1}, applied to state t=k
      mMax = Math.max(mMax, eta);
      state = trackerStep(state, s).state; // now q_{k+2}; its bound uses M_{k+1}
      const lo = -params.alpha * mMax - tol;
      const hi = params.B + (1 - params.alpha) * mMax + tol;
      assert.ok(
        state.q >= lo && state.q <= hi,
        `${seq.name}: Lemma1 violated at t=${String(k + 2)}: ${String(lo)} <= ${String(state.q)} <= ${String(hi)}`,
      );
    }
  }
});

// 3 — telescoping identity sum_t eta_t (E_t - alpha) = q_{T+1} - q_1 (anti-clamp oracle).
test("tracker_telescoping_identity", () => {
  const params: TrackerParams = { alpha: 0.1, c: B, eps: 0.1, t0: 0, B }; // c = B, test-only
  const q1 = B / 2;
  // 20-score prefix s = B (forces the trajectory out of [0,B]), then seeded scores.
  const scores = [...Array.from({ length: 20 }, () => B), ...seededScores(12345, 200, B)];
  let state = trackerInit(q1, params);
  const qs: number[] = [state.q];
  const Es: Miscover[] = [];
  for (const s of scores) {
    const stepped = trackerStep(state, s);
    state = stepped.state;
    qs.push(state.q);
    Es.push(stepped.E);
  }
  // C-2: the trajectory MUST leave [0,B], else a clamp mutant is not killed here.
  const minQ = Math.min(...qs);
  const maxQ = Math.max(...qs);
  assert.ok(minQ < 0 || maxQ > params.B, `trajectory must leave [0,B] (min=${String(minQ)}, max=${String(maxQ)})`);
  let sum = 0;
  for (const [k, e] of Es.entries()) sum += trackerStepSize(k, params) * (e - params.alpha);
  const delta = state.q - q1;
  assert.ok(
    Math.abs(sum - delta) <= 1e-12,
    `telescoping: |${String(sum)} - ${String(delta)}| = ${String(Math.abs(sum - delta))} <= 1e-12`,
  );
});

// 4 — ABB Theorem 1: |mean(E) - alpha| <= (B + eta_1)/(T*eta_T), on worst-case score streams.
test("tracker_thm1_worst_case", () => {
  const T = 1000;
  const params: TrackerParams = { alpha: 0.1, c: B, eps: 0.1, t0: 0, B }; // T=1000, c=B, eps=0.1, alpha=0.1 (test-only)
  const q1 = B / 2;
  const eta1 = trackerStepSize(0, params);
  const etaT = trackerStepSize(T - 1, params);
  const bound = (params.B + eta1) / (T * etaT);
  assert.ok(bound < 1, `Thm1 bound must be < 1 to be non-vacuous (bound=${String(bound)})`);
  for (const worst of [Array.from({ length: T }, () => B), Array.from({ length: T }, () => 0)]) {
    const rep = trackerReplay(q1, params, worst);
    let sumE = 0;
    for (const e of rep.E) sumE += e;
    const meanE = sumE / T;
    assert.ok(
      Math.abs(meanE - params.alpha) <= bound,
      `Thm1: |mean(E)-alpha| = |${String(meanE)} - ${String(params.alpha)}| = ${String(Math.abs(meanE - params.alpha))} <= bound ${String(bound)}`,
    );
  }
});

// 5 — q_{T+1} pinned byte-exact (float64_be hex), t0 = 7 test-only so M4 (t0 twice) is distinguishable.
test("tracker_q_pinned", () => {
  // State engine (pinned, Node): q_{t+1} = imocpStep(q_t, alpha, 1{s_t>q_t}, c*(t+1+t0)^(-1/2-eps)),
  // q_1 = q1, folded in order over 200 seeded scores. t0 = 7 is TEST-ONLY (ADR-M009 C-4).
  const params: TrackerParams = { alpha: 0.1, c: B, eps: 0.1, t0: 7, B }; // test-only
  const q1 = B / 2; // test-only
  const scores = seededScores(20260917, 200, B);
  const qFinal = trackerReplay(q1, params, scores).q;
  assert.equal(doubleBEHex(qFinal), "3fa29520dacf6cca", `q_{T+1} float64_be pinned (got ${doubleBEHex(qFinal)})`);
});

// 6 — E derived from (s,q) only; s exactly equal to q => E=0 under STRICT `>` (M5 uses `>=`).
test("tracker_E_from_fact", () => {
  const params: TrackerParams = { alpha: 0.1, c: B, eps: 0.1, t0: 0, B }; // test-only
  const v = B / 3; // test-only q in (0,B)
  const init = trackerInit(v, params);
  const atEqual = trackerStep(init, v); // s === q exactly
  assert.equal(atEqual.E, 0, `s == q => E=0 (strict >), got E=${String(atEqual.E)}`);
  const above = trackerStep(init, Math.min(params.B, v + 1e-6));
  assert.equal(above.E, 1, "s just above q => E=1");
});

// 7 — fail-closed: every invalid input throws; plus clipScore (separate helper) coverage.
test("tracker_fail_closed", () => {
  const good: TrackerParams = { alpha: 0.1, c: B, eps: 0.1, t0: 0, B }; // test-only
  const q1 = B / 2;
  assert.throws(() => trackerInit(q1, { ...good, eps: 0 }), /eps/, "eps<=0");
  assert.throws(() => trackerInit(q1, { ...good, eps: -0.1 }), /eps/, "eps<0");
  assert.throws(() => trackerInit(q1, { ...good, c: 0 }), /c/, "c<=0");
  assert.throws(() => trackerInit(q1, { ...good, c: -1 }), /c/, "c<0");
  assert.throws(() => trackerInit(-1e-9, good), /q1/, "q1<0");
  assert.throws(() => trackerInit(B + 1e-9, good), /q1/, "q1>B");
  assert.throws(() => trackerInit(q1, { ...good, alpha: 0 }), /alpha/, "alpha<=0");
  assert.throws(() => trackerInit(q1, { ...good, alpha: 1 }), /alpha/, "alpha>=1");
  assert.throws(() => trackerInit(q1, { ...good, alpha: 1.5 }), /alpha/, "alpha>1");
  assert.throws(() => trackerInit(q1, { ...good, t0: -1 }), /t0/, "t0<0");
  assert.throws(() => trackerInit(q1, { ...good, B: 0 }), /B/, "B<=0");
  assert.throws(() => trackerInit(q1, { ...good, B: -1 }), /B/, "B<0");
  assert.throws(() => trackerInit(Number.NaN, good), /non-finite/, "q1 NaN");
  assert.throws(() => trackerInit(q1, { ...good, alpha: Number.NaN }), /non-finite/, "alpha NaN");
  const st = trackerInit(q1, good);
  // the THROW (not a clip) on s>B is why clipScore is never called in the recursion.
  assert.throws(() => trackerStep(st, B + 1e-9), /\[0,B\]/, "s>B throws (not clipped)");
  assert.throws(() => trackerStep(st, -1e-9), /\[0,B\]/, "s<0");
  assert.throws(() => trackerStep(st, Number.NaN), /non-finite|\[0,B\]/, "s NaN");
  // eta non-finite: hand-built state t = -1, t0 = 0 => base t+1+t0 = 0 => 0^(-1/2-eps) = Infinity (C-1).
  const badState: TrackerState = { q: q1, t: -1, q1, params: { ...good, t0: 0 } };
  assert.throws(() => trackerStep(badState, 0), /non-finite step/, "eta non-finite (base 0)");
  assert.throws(() => trackerStepSize(-1, { ...good, t0: 0 }), /non-finite step/, "stepSize base 0");
  // clipScore: fail-closed and clamps (separate helper, never inside the recursion).
  assert.throws(() => clipScore(Number.NaN, B), /non-finite/, "clipScore NaN");
  assert.throws(() => clipScore(0.01, 0), /B/, "clipScore B<=0");
  assert.equal(clipScore(B + 1, B), B, "clipScore clamps above to B");
  assert.equal(clipScore(-1, B), 0, "clipScore clamps below to 0");
  assert.equal(clipScore(B / 2, B), B / 2, "clipScore identity inside [0,B]");
});

// 8 — no-peek: changing s_t changes neither q_t nor E_{<t}; the step is still causal in s_t.
test("tracker_no_peek", () => {
  const params: TrackerParams = { alpha: 0.1, c: B, eps: 0.1, t0: 0, B }; // test-only
  const q1 = B / 2;
  const t = 3; // decision window index (0-based)
  const prefix = Array.from({ length: t }, () => q1); // mild: keeps q_t inside (0,B)
  const tail = seededScores(777, 6, B);
  const aLow = [...prefix, 0, ...tail]; // s_t = 0
  const aHigh = [...prefix, B, ...tail]; // s_t = B
  const repLow = trackerReplay(q1, params, aLow);
  const repHigh = trackerReplay(q1, params, aHigh);
  assert.deepEqual(repLow.E.slice(0, t), repHigh.E.slice(0, t), "E_{<t} independent of s_t");
  const qtLow = trackerReplay(q1, params, aLow.slice(0, t)).q;
  const qtHigh = trackerReplay(q1, params, aHigh.slice(0, t)).q;
  assert.equal(qtLow, qtHigh, "q_t independent of s_t");
  assert.notDeepEqual(repLow.E, repHigh.E, "s_t changes E_t (the step is causal, not blind)");
});

// 9 — mechanism control (ABB Prop 1): the fixed step eta=B leaves [0,B) strictly more often.
test("tracker_fixed_vs_decaying", () => {
  const params: TrackerParams = { alpha: 0.1, c: B, eps: 0.1, t0: 0, B }; // decaying, test-only
  const q1 = B / 2;
  const scores = seededScores(2024, 2000, B);
  let dState = trackerInit(q1, params);
  let decayOut = dState.q < 0 || dState.q >= params.B ? 1 : 0;
  for (const s of scores) {
    dState = trackerStep(dState, s).state;
    if (dState.q < 0 || dState.q >= params.B) decayOut++;
  }
  let fq = q1;
  let fixedOut = fq < 0 || fq >= params.B ? 1 : 0;
  for (const s of scores) {
    const E: Miscover = s > fq ? 1 : 0;
    fq = imocpStep(fq, params.alpha, E, params.B); // fixed step = B (via imocpStep directly)
    if (fq < 0 || fq >= params.B) fixedOut++;
  }
  assert.ok(
    fixedOut > decayOut,
    `fixed leaves [0,B) strictly more than decaying (fixed=${String(fixedOut)} > decaying=${String(decayOut)})`,
  );
});

// digest — order-sensitive (unlike calibDigest, which sorts) + pinned vector.
test("tracker_digest_order_sensitive", () => {
  const params: TrackerParams = { alpha: 0.1, c: B, eps: 0.1, t0: 3, B }; // test-only
  const q1 = B / 2; // test-only
  const scores = [0.01, 0.02, 0.03]; // test-only, all in [0,B]
  const d = trackerDigest(q1, params, scores);
  assert.match(d, /^[0-9a-f]{64}$/, "digest is 64 lowercase hex chars");
  assert.equal(d, "06e2a024f78b1b13e2c907bbd232d03f491ce25e815ceadb80c7e28910f9ea89", `pinned digest vector (got ${d})`);
  const swapped = trackerDigest(q1, params, [0.02, 0.01, 0.03]); // swap first two
  assert.notEqual(d, swapped, "permuting two scores changes the digest");
});
