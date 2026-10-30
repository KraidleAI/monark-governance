/**
 * HIKAE tracking (packages/hikae/src/suivi/) - the Monte-Carlo runs of the O4 tests K (licence) and W (closure).
 * What the modules compute. The mixtures of the policy's bets (mixtureOf), on which the library's crossingTable gives, for each t, the
 * count of E+ labels at which W closes (count >= entry) and K licenses (count <= entry); o4Step must decide the same steps.
 * How the expected values are computed. Never by the modules: the probability of a first crossing by an exact dynamic program over
 * (t, k, last label) in floats, its frontier computed here from ln of the capital (the i.i.d. program is the chain with
 * P(1 | 1) = P(1 | 0)); the bands at 3.09 standard deviations of that exact value, on both sides; the study's counts, printed by its
 * frozen output, written as literals. Each run draws from the study's LCG, seed (1664525 seed + 1013904223) mod 2^32, value seed / 2^32,
 * with a seed fixed before any run; a trajectory stops at its first crossing and the next one continues the same stream.
 * Category: new-module (red at base by the load of ../src/suivi/policy.ts, which this change adds).
 */
import { mixtureOf } from "../src/suivi/policy.ts";
import type { SuiviPolicy } from "../src/suivi/policy.ts";
import { o4Init, o4Step } from "../src/suivi/o4.ts";
import type { O4State } from "../src/suivi/o4.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { crossingTable, qParse } from "../src/pari/index.ts";

const s = String;
function at<T>(xs: readonly T[], i: number): T {
  const v = xs[i];
  if (v === undefined) throw new Error(`test-side index ${s(i)} out of range`);
  return v;
}
const flt = (text: string): number => {
  const parts = text.split("/");
  return Number(at(parts, 0)) / Number(parts[1] ?? "1");
};
const W4 = ["1/4", "1/4", "1/4", "1/4"];
const FIX: SuiviPolicy = { schema: "hikae-suivi-policy-v1", task_class: "stable-run-velocity-24h",
  cell_key: "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3", population: "usde-consecutive-calm-pairs-v1",
  policy_version: 1, a: "1/5", delta_adm: "1/20", delta_exh: "1/100", alpha_arl: "1/100", m: "1/5", eta_m1: "1/20", sr_reading_threshold: "10000",
  restart_weights: "1/(j(j+1))", bets_k: { lambdas: ["1/16", "1/8", "1/4", "1/2"], weights: W4 },
  bets_w: { lambdas: ["1/4", "1/2", "1", "2"], weights: W4 }, bets_sr: { lambdas: ["1/10", "1/5", "2/5", "4/5"], weights: W4 }, grace_steps: 1,
  grid_ms: 86400000, l_ms: 37800000, thin_window: 90, thin_min: 30, keyring: [] };
const A = flt(FIX.a), D_ADM = flt(FIX.delta_adm), D_EXH = flt(FIX.delta_exh), N = 10000;
/** The seeds, fixed by the mission before any run. */
const SEED_CLOSURE_U0 = 2026102911, SEED_CLOSURE_U3 = 2026102912, SEED_LICENCE_U0 = 2026102913, SEED_LICENCE_U3 = 2026102914;
const SEED_POWER_W = 2026102915, SEED_POWER_K = 2026102916, SEED_NULL_W = 2026102917, SEED_NULL_K = 2026102918;
const SEED_NEG_W = 2026102919, SEED_NEG_K = 2026102920, SEED_STUDY = 20261028;
/** The exact values of the dynamic program, pinned to 1e-7 (printed by the test writer's script). */
const EXACT_W = 0.00700942, EXACT_K = 0.03106722, NULL_W = 0.0001409, NULL_K = 0.00234619, NEG_W = 0.05822533, NEG_K = 0.12635668;

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
type Side = "above" | "below";
const memo = new Map<string, readonly number[]>();
/** The library's table of the fixture: W on bets_w above, delta_exh; K on bets_k below, delta_adm. */
function table(side: Side, tMax: number): readonly number[] {
  const key = `${side}${s(tMax)}`, a = qParse(FIX.a);
  const got = memo.get(key) ?? (side === "above" ? crossingTable(mixtureOf(FIX.bets_w), "above", a, qParse(FIX.delta_exh), tMax)
    : crossingTable(mixtureOf(FIX.bets_k), "below", a, qParse(FIX.delta_adm), tMax));
  memo.set(key, got);
  return got;
}
const hit = (side: Side, tab: readonly number[], t: number, k: number): boolean => (side === "above" ? k >= at(tab, t) : k <= at(tab, t));

/** The frontier in floats from ln of the capital (smallest crossing k or t + 1 above, largest or -1 below), never from crossingTable. */
function floatFrontier(side: Side, tMax: number): number[] {
  const up = side === "above", b = up ? FIX.bets_w : FIX.bets_k, L = -Math.log(up ? D_EXH : D_ADM);
  const f = b.lambdas.map((l) => [Math.log(1 + flt(l) * (up ? -A : A)), Math.log(1 + flt(l) * (up ? 1 - A : A - 1))] as const);
  const cross = (t: number, k: number): boolean => {
    const e = f.map(([l0, l1], j) => Math.log(flt(at(b.weights, j))) + k * l1 + (t - k) * l0), mx = Math.max(...e);
    return mx + Math.log(e.reduce((acc, v) => acc + Math.exp(v - mx), 0)) >= L;
  };
  const out: number[] = [];
  let fr = up ? 1 : -1;
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
    out.push(fr);
  }
  return out;
}
/** P(T <= t), t = 0..H, for a chain with P(1 | 1) = p1 and P(1 | 0) = p0 started after a label 0, over (k, last label). */
function dpMarkov(side: Side, tab: readonly number[], p1: number, p0: number, H: number): number[] {
  let m0 = [1], m1 = [0], stopped = 0;
  const cdf = [0];
  for (let t = 1; t <= H; t++) {
    const n0 = new Array<number>(t + 1).fill(0), n1 = new Array<number>(t + 1).fill(0);
    m0.forEach((v0, k) => {
      const v1 = at(m1, k);
      n0[k] = (n0[k] ?? 0) + v0 * (1 - p0) + v1 * (1 - p1);
      n1[k + 1] = (n1[k + 1] ?? 0) + v0 * p0 + v1 * p1;
    });
    for (let k = 0; k <= t; k++) {
      if (hit(side, tab, t, k)) {
        stopped += at(n0, k) + at(n1, k);
        n0[k] = 0;
        n1[k] = 0;
      }
    }
    [m0, m1] = [n0, n1];
    cdf.push(stopped);
  }
  return cdf;
}
/** freq within 3.09 standard deviations of the exact value v on both sides, the deviation taken at v, the lower edge at 0 at least. */
function inBand(freq: number, v: number, n: number, what: string): void {
  const h = 3.09 * Math.sqrt((v * (1 - v)) / n);
  assert.ok(freq >= Math.max(0, v - h) && freq <= v + h, `${what}: ${s(freq)} outside [${s(Math.max(0, v - h))}, ${s(v + h)}]`);
}
type Kept = { readonly path: readonly (0 | 1)[]; readonly crossed: boolean };
/** A chain (or i.i.d. labels when p1 = p0), one draw per step, E = 1 when the draw is under P(1 | last); the labels of the first trajectories kept. */
function chainMc(side: Side, H: number, p1: number, p0: number, seed: number, n: number, keep = 0): { n: number; kept: Kept[] } {
  const r = lcg(seed), tab = table(side, H), kept: Kept[] = [];
  let count = 0;
  for (let i = 0; i < n; i++) {
    const path: (0 | 1)[] = [];
    let k = 0, last = 0, crossed = false;
    for (let t = 1; t <= H; t++) {
      const E = r.next() < (last === 1 ? p1 : p0) ? 1 : 0;
      path.push(E);
      last = E;
      k += E;
      if (hit(side, tab, t, k)) {
        count++;
        crossed = true;
        break;
      }
    }
    if (i < keep) kept.push({ path, crossed });
  }
  return { n: count, kept };
}
/** The null at the boundary: u = 0, one draw, E+ = 1 under a; u > 0, the resolution coin (unresolved under u), then the miss coin
 *  (missed under (a - u)/(1 - u)), drawn at every step and ignored when the window is unresolved. */
function nullMc(side: Side, H: number, u: number, seed: number): { n: number } {
  const r = lcg(seed), tab = table(side, H), p = (A - u) / (1 - u);
  let n = 0;
  for (let i = 0; i < N; i++) {
    let k = 0;
    for (let t = 1; t <= H; t++) {
      let E: 0 | 1;
      if (u === 0) E = r.next() < A ? 1 : 0;
      else {
        const noRes = r.next() < u, miss = r.next() < p;
        E = noRes || miss ? 1 : 0;
      }
      k += E;
      if (hit(side, tab, t, k)) {
        n++;
        break;
      }
    }
  }
  return { n };
}
function nullRuns(t: { diagnostic: (m: string) => void }, side: Side, H: number, seeds: readonly [number, number], exact: number, delta: number): void {
  assert.deepEqual([...table(side, H)], floatFrontier(side, H), `the ${side} table of the fixture's mixture`);
  for (const [u, seed] of [[0, seeds[0]], [0.03, seeds[1]]] as const) {
    const t0 = performance.now(), out = nullMc(side, H, u, seed), freq = out.n / N;
    t.diagnostic(`${side} u ${s(u)}: ${s(out.n)} of ${s(N)} cross before ${s(H)}, ${(performance.now() - t0).toFixed(0)} ms`);
    inBand(freq, exact, N, `${side} u ${s(u)}`);
    assert.ok(freq < delta, `${side} u ${s(u)} under delta`);
  }
}

// The study draws two numbers per label whatever p and u (the miss first, then the non-resolution). Per candidate: section 1,
// 10 000 x 2 000 labels; 2, 3 x 4 000 x 3 000; 3, 2 x 10 000 x 1 000; 4, 4 000 x 1 000; 5, 2 000 x (500 + 1 000 + 5 000); 6,
// 2 x 2 000 x 3 000: 105 000 000 labels, 210 000 000 draws. D is the fourth candidate: its section 1 starts after 630 000 000 draws,
// its section 3 after 630 000 000 + 40 000 000 + 72 000 000 = 742 000 000 (u = 0), then 762 000 000 (u = 0.03).
const POS_S1 = 630000000, POS_S3 = 742000000, POS_S3_U3 = 762000000;
const STUDY_C = [0.1, 0.2, 0.4, 0.8], STUDY_D = { a: 0.20, adm: 0.05, exh: 0.01 };

/** The first trajectories through o4Step under the fixture, label by label, up to the step at which the table crosses. */
function agree(paths: readonly Kept[], open: boolean): void {
  for (const { path, crossed } of paths) {
    assert.ok(crossed, "the trajectory crosses");
    let x: O4State = o4Init(FIX, open);
    path.forEach((E, j) => {
      x = o4Step(x, { seq: j, E }, FIX);
      const last = j + 1 === path.length, closedAt = x.segment.kind === "closed" ? x.segment.closed_at : null;
      if (open) assert.equal(closedAt, last ? path.length : null, `W closes at the table's step ${s(path.length)}, not at ${s(j + 1)}`);
      else assert.equal(x.licensed_at, last ? path.length : null, `K licenses at the table's step ${s(path.length)}, not at ${s(j + 1)}`);
    });
  }
}

// killer: packages/hikae/src/suivi/policy.ts:95 CONST "lambdas: b.lambdas.map" -> "lambdas: b.weights.map"
test("o4_false_licence_mc", (t) => {
  nullRuns(t, "below", 2000, [SEED_LICENCE_U0, SEED_LICENCE_U3], EXACT_K, D_ADM);
});

// killer: packages/hikae/src/suivi/policy.ts:95 CONST "lambdas: b.lambdas.map" -> "lambdas: b.weights.map"
test("o4_false_closure_mc", (t) => {
  nullRuns(t, "above", 1000, [SEED_CLOSURE_U0, SEED_CLOSURE_U3], EXACT_W, D_EXH);
});

// killer: packages/hikae/src/suivi/policy.ts:95 CONST "lambdas: b.lambdas.map" -> "lambdas: b.weights.map"
test("o4_study_parity_per_path", (t) => {
  const t0 = performance.now(), walk = lcg(SEED_STUDY);
  for (let i = 0; i < 100000; i++) walk.next();
  assert.equal(jump(SEED_STUDY, 100000), walk.state(), "the jump against a walk of 100 000 draws");
  assert.equal(jump(SEED_STUDY, 0), SEED_STUDY, "no draw");
  const c = STUDY_D, labels = new Uint8Array(2000);
  const sections = [{ name: "K, p = a", pos: POS_S1, n: 2000, p: c.a, u: 0, side: "below" as const, want: 301 },
    { name: "W, u = 0", pos: POS_S3, n: 1000, p: (c.a - 0) / (1 - 0), u: 0, side: "above" as const, want: 68 },
    { name: "W, u = 0.03", pos: POS_S3_U3, n: 1000, p: (c.a - 0.03) / (1 - 0.03), u: 0.03, side: "above" as const, want: 73 }];
  let r = lcg(SEED_STUDY);
  for (const sec of sections) {
    if (sec.pos === POS_S3_U3) assert.equal(r.state(), jump(SEED_STUDY, POS_S3_U3), `${sec.name}: the stream walked from the jump`);
    else r = lcg(jump(SEED_STUDY, sec.pos));
    const tab = table(sec.side, sec.n), up = sec.side === "above", d = up ? c.exh : c.adm, means = new Float64Array(sec.n + 1);
    const grid = STUDY_C.map((x) => (up ? x / (2 * c.a) : x / (2 * (1 - c.a))));
    let studyCount = 0, libCount = 0, ties = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < sec.n; j++) {
        const q = sec.p;
        let E = r.next() < q ? 1 : 0;
        if (r.next() < sec.u) E = 1;
        labels[j] = E;
      }
      let lib = Infinity, study = Infinity, k = 0;
      for (let j = 0; j < sec.n && lib === Infinity; j++) {
        k += labels[j] ?? 0;
        if (hit(sec.side, tab, j + 1, k)) lib = j + 1;
      }
      const v = STUDY_C.map(() => 1);
      for (let j = 0; j < sec.n && study === Infinity; j++) {
        const E = labels[j] ?? 0;
        for (let x = 0; x < v.length; x++) v[x] = at(v, x) * (1 + at(grid, x) * (up ? E - c.a : c.a - E));
        const m = v.reduce((x, y) => x + y, 0) / v.length;
        means[j + 1] = m;
        if (m >= 1 / d) study = j + 1;
        if (study === Infinity && j + 1 > lib) break;
      }
      if (study !== lib) {
        const at1 = Math.min(study, lib), m = means[at1] ?? Number.NaN;
        assert.ok(Math.abs(study - lib) === 1 && Math.abs(m * d - 1) <= 1e-9, `${sec.name}, path ${s(i)}: study ${s(study)}, library ${s(lib)}`);
        ties++;
      }
      if (study < Infinity) studyCount++;
      if (lib < Infinity) libCount++;
    }
    t.diagnostic(`${sec.name}: study ${s(studyCount)}, library ${s(libCount)}, admitted one-step gaps ${s(ties)}`);
    assert.equal(studyCount, sec.want, `${sec.name}: the study's count (frozen output, candidate D)`);
    assert.equal(libCount, sec.want, `${sec.name}: the library's count`);
  }
  t.diagnostic(`parity ${(performance.now() - t0).toFixed(0)} ms`);
});

// killer: packages/hikae/src/suivi/o4.ts:115 CONST "w_k += label.E;" -> "w_k += 1 - label.E;"
test("o4_power_w_closes", (t) => {
  const t0 = performance.now(), out = chainMc("above", 1000, 0.3, 0.3, SEED_POWER_W, 1000, 3);
  t.diagnostic(`W at p = 0.30: ${s(out.n)} of 1000 close before 1000, ${(performance.now() - t0).toFixed(0)} ms`);
  assert.ok(out.n >= 999, `${s(out.n)} closures`);
  agree(out.kept, true);
});

// killer: packages/hikae/src/suivi/o4.ts:106 CONST "k_k = s.k_k + label.E;" -> "k_k = s.k_k + 1 - label.E;"
test("o4_power_k_licenses", (t) => {
  const t0 = performance.now(), out = chainMc("below", 300, 0.05, 0.05, SEED_POWER_K, 1000, 3);
  t.diagnostic(`K at p = 0.05: ${s(out.n)} of 1000 license before 300, ${(performance.now() - t0).toFixed(0)} ms`);
  assert.ok(out.n >= 999, `${s(out.n)} licences`);
  agree(out.kept, false);
});

// killer: packages/hikae/src/suivi/policy.ts:95 CONST "lambdas: b.lambdas.map" -> "lambdas: b.weights.map"
test("o4_dependent_null_family", (t) => {
  const fw = floatFrontier("above", 1000), fk = floatFrontier("below", 2000);
  assert.deepEqual([[...table("above", 1000)], [...table("below", 2000)]], [fw, fk], "the tables of the fixture's mixtures");
  assert.ok(Math.abs(at(dpMarkov("above", fw, A, A, 1000), 1000) - EXACT_W) <= 1e-7, "the i.i.d. chain gives W 0.00700942");
  assert.ok(Math.abs(at(dpMarkov("below", fk, A, A, 2000), 2000) - EXACT_K) <= 1e-7, "the i.i.d. chain gives K 0.03106722");
  const cases = [{ side: "above" as const, fr: fw, H: 1000, p1: 1 / 5, p0: 1 / 10, seed: SEED_NULL_W, v: NULL_W, delta: D_EXH },
    { side: "below" as const, fr: fk, H: 2000, p1: 2 / 5, p0: 1 / 5, seed: SEED_NULL_K, v: NULL_K, delta: D_ADM }];
  for (const c of cases) {
    const exact = at(dpMarkov(c.side, c.fr, c.p1, c.p0, c.H), c.H);
    assert.ok(Math.abs(exact - c.v) <= 1e-7 && exact < c.delta, `${c.side}: exact ${s(exact)}`);
    const t0 = performance.now(), freq = chainMc(c.side, c.H, c.p1, c.p0, c.seed, N).n / N;
    t.diagnostic(`${c.side} null chain: ${s(freq)} (exact ${exact.toFixed(8)}), ${(performance.now() - t0).toFixed(0)} ms`);
    assert.ok(freq < c.delta, `${c.side}: under delta`);
    inBand(freq, c.v, N, `${c.side} null chain`);
  }
});

// killer: packages/hikae/src/suivi/policy.ts:95 CONST "lambdas: b.lambdas.map" -> "lambdas: b.weights.map"
test("o4_dependent_negative_witness", (t) => {
  assert.equal(3n * 5n, 20n - 8n + 3n, "stationary law p0 / (1 - p1 + p0) = (3/20) / (15/20) = 1/5 = a");
  const cases = [{ side: "above" as const, H: 1000, seed: SEED_NEG_W, v: NEG_W, delta: D_EXH },
    { side: "below" as const, H: 2000, seed: SEED_NEG_K, v: NEG_K, delta: D_ADM }];
  for (const c of cases) {
    const exact = at(dpMarkov(c.side, floatFrontier(c.side, c.H), 2 / 5, 3 / 20, c.H), c.H);
    assert.ok(Math.abs(exact - c.v) <= 1e-7 && exact > c.delta, `${c.side}: exact ${s(exact)}`);
    const t0 = performance.now(), freq = chainMc(c.side, c.H, 2 / 5, 3 / 20, c.seed, N).n / N;
    t.diagnostic(`${c.side} negative witness: ${s(freq)} (exact ${exact.toFixed(8)}), ${(performance.now() - t0).toFixed(0)} ms`);
    assert.ok(freq > c.delta, `${c.side}: above delta`);
    inBand(freq, c.v, N, `${c.side} negative witness`);
  }
});

// killer: packages/hikae/src/suivi/policy.ts:95 CONST "lambdas: b.lambdas.map" -> "lambdas: b.weights.map"
test("o4_licence_median_bt_power", (t) => {
  const fk = floatFrontier("below", 3000);
  assert.deepEqual([...table("below", 3000)], fk, "the K table of the fixture's mixture, t <= 3000");
  const quantile = (cdf: readonly number[], x: number): number => cdf.findIndex((v) => v >= x);
  for (const [p, med, p90] of [[0.1, 107, 189], [1 - (1 - 0.1) * (1 - 0.03), 176, 384], [0.12, 151, 312]] as const) {
    const cdf = dpMarkov("below", fk, p, p, 3000);
    t.diagnostic(`K at p = ${p.toFixed(3)}: median ${s(quantile(cdf, 0.5))}, 90th percentile ${s(quantile(cdf, 0.9))}`);
    assert.equal(quantile(cdf, 0.5), med, `median at p ${s(p)}`);
    assert.equal(quantile(cdf, 0.9), p90, `90th percentile at p ${s(p)}`);
  }
});
