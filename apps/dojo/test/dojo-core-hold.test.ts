// MONARK Dojo -- PR-1a T-1 oracle (ADR-DOJO-SNAPSHOT-1 section 6, PR-1a, l.363): hold score, lots, validation, units,
// tiers, conversion, dust threshold. Test names are those of the ADR; every expected figure is a worked example of the
// ADR (line cited) or an oracle recoded here, never read from the module. No network, no clock, no market data: the
// amounts are arbitrary test units. Pseudo-random series come from a fixed-seed generator (reproducible).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addressReading, dayValue, stepLots, lotsOf, scoreOf, validatedOf, provisionalOf, ageOf, unitsOf, tierOf, holderCounted,
  medianOfSeven, unitPrice, unitThreshold, type DayValue, type Fraction,
} from "../scripts/dojo-core.mjs";

const W = 30; // validation window, D-16 l.270 (decision 223)
const held = (days: number, v = "100"): DayValue[] => Array.from({ length: days }, () => v);
function units(series: DayValue[], w: number, t: string): bigint {
  const u = unitsOf(series, w, t);
  assert.ok(u !== null, "units are defined once a threshold is given");
  return BigInt(u);
}
function lcg(seed: bigint): (n: number) => number {
  let s = seed;
  return (n) => {
    s = (s * 6364136223846793005n + 1442695040888963407n) % (1n << 64n);
    return Number((s >> 33n) % BigInt(n));
  };
}
// Closed form of D-16 l.278, recoded: h_t(d) = min of the counted m_u on [t, d]; S = sum over counted t of h_t(d);
// V = sum over counted t of min(h_t(d), h_p(d)), p = last counted day <= d - W + 1, V = 0 if p does not exist.
function closedForm(series: DayValue[], w: number): { S: bigint; V: bigint } {
  const last = series.length - 1;
  const h: (bigint | null)[] = [];
  let run: bigint | null = null;
  for (let t = last; t >= 0; t--) {
    const v = series[t];
    if (v !== null && v !== undefined && (run === null || BigInt(v) < run)) run = BigInt(v);
    h[t] = run;
  }
  let p = -1;
  for (let u = last - w + 1; u >= 0; u--) if (series[u] !== null) { p = u; break; }
  let S = 0n;
  let V = 0n;
  for (let t = 0; t <= last; t++) {
    const ht = h[t];
    if (series[t] === null || ht === null || ht === undefined) continue;
    S += ht;
    const hp = p >= 0 ? h[p] : null;
    if (hp !== null && hp !== undefined) V += ht < hp ? ht : hp;
  }
  return { S, V };
}

test("dojo_score_is_the_lifo_running_minimum", () => {
  // M2 (B), l.119: [100, 150, 100] gives 300 under LIFO (FIFO 250, pro rata 267, no reset 350); [100, 0, 100] gives 100.
  assert.equal(scoreOf(["100", "150", "100"]), "300");
  assert.equal(scoreOf(["100", "0", "100"]), "100");
  assert.deepEqual(lotsOf(["100", "150", "100"]), [["100", 1]]);
  // one transition at a time (D-16 l.271): a rise is a new lot, a fall leaves from the newest lot
  assert.deepEqual(stepLots([["100", 1], ["50", 2]], 3, "120"), [["100", 1], ["20", 2]]);
  assert.deepEqual(stepLots([["100", 1], ["50", 2]], 3, "40"), [["40", 1]]);
  assert.deepEqual(stepLots([["100", 1]], 3, "130"), [["100", 1], ["30", 3]]);
  assert.deepEqual(stepLots([], 1, "0"), []);
  // 2^53 + 1 base units stay exact (D-2 l.160; M1: canonical(2**53 + 1) gives 9007199254740992)
  const e53 = "9007199254740993";
  assert.equal(scoreOf([e53]), e53);
  assert.equal(scoreOf([e53, e53, e53]), "27021597764222979");
  // sum of the running minima (M2 (C), l.119), recoded above, on fixed-seed pseudo-random series
  const rnd = lcg(12345n);
  for (let trial = 0; trial < 500; trial++) {
    const series: DayValue[] = Array.from({ length: 1 + rnd(40) }, () => (rnd(8) === 0 ? null : String(BigInt(rnd(6)) * 10n ** BigInt(rnd(16)))));
    assert.equal(scoreOf(series), String(closedForm(series, 1).S), JSON.stringify(series));
  }
  // fail-closed inputs
  for (const bad of ["01", "-1", "1.5", " 1", "", "1e3", "0x10"]) assert.throws(() => scoreOf([bad]), /canonical decimal/);
  assert.throws(() => scoreOf([100 as unknown as string]), /canonical decimal/);
  assert.throws(() => stepLots([["100", 2]], 2, "50"), /newest birth day/);
  assert.throws(() => stepLots([["0", 1]], 2, "50"), /positive/);
  assert.throws(() => stepLots([["5", 3], ["5", 2]], 4, "50"), /increasing days/);
});

test("dojo_units_never_rise_by_splitting", () => {
  // M2 (A), l.118 and l.125: 1 000 units held 30 days, T = 1 000 unit-days: 30 units on one address and never more once
  // split; the binary right (1 if S >= T) gave 1 against 29 split, the cap C = 100 per day 3 against 30.
  assert.equal(units(held(30, "1000"), W, "1000"), 30n);
  assert.equal([...Array<string>(28).fill("34"), "48"].reduce((a, p) => a + units(held(30, p), W, "1000"), 0n), 29n);
  assert.equal(Array<string>(10).fill("100").reduce((a, p) => a + units(held(30, p), W, "1000"), 0n), 30n);
  // exhaustive grid: two addresses, five days, each holding 0, 10 or 20 each day (9^5 configurations), without and with a
  // common missing day (day 3), W in {1, 3}, T = 15: units and validated points of the parts never exceed the whole.
  const vals = ["0", "10", "20"];
  let checked = 0;
  for (let code = 0; code < 9 ** 5; code++) {
    const a: DayValue[] = [];
    const b: DayValue[] = [];
    const ab: DayValue[] = [];
    for (let day = 0, c = code; day < 5; day++, c = Math.floor(c / 9)) {
      const x = vals[c % 3] ?? "0";
      const y = vals[Math.floor(c / 3) % 3] ?? "0";
      a.push(x);
      b.push(y);
      ab.push(String(BigInt(x) + BigInt(y)));
    }
    for (const gap of [false, true]) {
      if (gap) [a[2], b[2], ab[2]] = [null, null, null];
      for (const w of [1, 3]) {
        assert.ok(units(a, w, "15") + units(b, w, "15") <= units(ab, w, "15"), `units ${JSON.stringify([a, b])}`);
        assert.ok(BigInt(validatedOf(a, w)) + BigInt(validatedOf(b, w)) <= BigInt(validatedOf(ab, w)));
        checked++;
      }
    }
  }
  assert.equal(checked, 9 ** 5 * 4);
});

test("dojo_missing_day_neither_counts_nor_resets", () => {
  // D-2 l.158, D-16 l.271: a day without a concordant reading brings neither a contribution nor a reset.
  const s: DayValue[] = ["100", "100", null, "100"];
  assert.equal(scoreOf(s), "300");
  assert.deepEqual(lotsOf(s), [["100", 1]]);
  assert.equal(ageOf(s), 3);
  assert.deepEqual(stepLots([["100", 1]], 3, null), [["100", 1]]);
  assert.equal(scoreOf(["100", null, "50", null, "80"]), "180");
  assert.deepEqual(lotsOf(["100", null, "50", null, "80"]), [["50", 1], ["30", 5]]);
  assert.deepEqual(lotsOf([null, null, "100"]), [["100", 3]]);
  assert.equal(scoreOf([null, null]), "0");
  // M4 (D), l.127: a common missing day on j10, read on j29: 2 900 validated (the points skip the day, the validation
  // counts calendar days). j-numbering of M4: day = j + 1.
  assert.equal(validatedOf([...held(10), null, ...held(19)], W), "2900");
});

test("dojo_absence_reads_zero", () => {
  // C-1, D-2 l.158: [100, 100, 100, 0, 0, 0, 100, 100]: score 200 and age 2, not 500 and 5 as for missing days.
  const zero: DayValue[] = ["100", "100", "100", "0", "0", "0", "100", "100"];
  assert.equal(scoreOf(zero), "200");
  assert.equal(ageOf(zero), 2);
  const missing: DayValue[] = ["100", "100", "100", null, null, null, "100", "100"];
  assert.equal(scoreOf(missing), "500");
  assert.equal(ageOf(missing), 5);
  // the collector writes a concordant absence as "0" (D-7 l.217): the address reads 0 and the pile empties
  assert.equal(dayValue([["0"], ["0"]]), "0");
  assert.deepEqual(stepLots([["100", 1]], 2, dayValue([["0"]])), []);
  assert.equal(dayValue([["0", "50"]]), "50");
});

test("dojo_validation_after_thirty_days", () => {
  // M4 (D), l.127 (100 units, j-numbering day = j + 1): held 29 days: 0 validated, 2 900 provisional; 30 days: 3 000.
  assert.equal(validatedOf(held(29), W), "0");
  assert.equal(provisionalOf(held(29), W), "2900");
  assert.equal(validatedOf(held(30), W), "3000");
  assert.equal(provisionalOf(held(30), W), "0");
  // sold on j20, bought back on j21, read on j40: 0 validated, 2 000 provisional (the rebought lot starts from zero)
  const back: DayValue[] = [...held(20), "0", ...held(20)];
  assert.equal(validatedOf(back, W), "0");
  assert.equal(provisionalOf(back, W), "2000");
  // 100 from j0, a second 100 from j10, back to 100 on j36: the newest lot leaves; 4 100 validated on j40
  assert.equal(validatedOf([...held(10), ...held(26, "200"), ...held(5)], W), "4100");
  // validated points leave with the part sold (D-16 l.275): 100 held 40 days, then sold down to 40, then to 0
  assert.equal(validatedOf([...held(40), "40"], W), "1640");
  assert.equal(validatedOf([...held(40), "0"], W), "0");
  // units count validated points only (D-3 l.173): 29 days give 0 units at T_1 = 1 000, 30 days give 3
  assert.equal(unitsOf(held(29), W, "1000"), "0");
  assert.equal(unitsOf(held(30), W, "1000"), "3");
  assert.equal(unitsOf(held(30), W, null), null); // before the first price version (D-7 l.217)
  assert.throws(() => validatedOf(held(3), 0), /positive integer/);
  assert.throws(() => unitsOf(held(3), W, "0"), /positive/);
});

test("dojo_validated_points_match_the_closed_form", () => {
  // D-16 l.278 (M4 (A): 0 gap on 3 000 series; M8 (R): 0 gap with missing days), against the recoded closed form.
  const rnd = lcg(223223n);
  for (let trial = 0; trial < 800; trial++) {
    const w = [1, 2, 3, 7, 30][rnd(5)] ?? 30;
    const series: DayValue[] = [];
    let level = BigInt(rnd(5) * 100);
    for (let i = 1 + rnd(70); i > 0; i--) {
      const r = rnd(10);
      if (r === 0) {
        series.push(null);
        continue;
      }
      if (r < 3) level = BigInt(rnd(5) * 100);
      series.push(String(level));
    }
    const { S, V } = closedForm(series, w);
    assert.equal(validatedOf(series, w), String(V), `W=${String(w)} ${JSON.stringify(series)}`);
    assert.equal(provisionalOf(series, w), String(S - V));
    assert.equal(scoreOf(series), String(S));
  }
});

test("dojo_units_never_rise_by_splitting_with_validation", () => {
  // M4 (C), l.127: 1 160 held 60 days, T_1 = 2 400: 29 units on one address, 29 on 29 addresses of 40.
  assert.equal(units(held(60, "1160"), W, "2400"), 29n);
  assert.equal(units(held(60, "40"), W, "2400") * 29n, 29n);
  // a hand-over on the last day: the whole holds 100 for 30 days (3 000 validated, 0 provisional); split, the second
  // address receives the 100 on day 30 (100 provisional): no unit may appear on the parts (D-3 l.173).
  const handA: DayValue[] = [...held(29), "0"];
  const handB: DayValue[] = [...held(29, "0"), "100"];
  assert.ok(units(handA, W, "100") + units(handB, W, "100") <= units(held(30), W, "100"));
  assert.equal(units(handB, W, "100"), 0n);
  // M4 (B) motif: arbitrary daily splits of one series among 2 to 6 addresses (zeros and common missing days included)
  const rnd = lcg(225225n);
  for (let trial = 0; trial < 300; trial++) {
    const k = 2 + rnd(5);
    const parts: DayValue[][] = Array.from({ length: k }, () => []);
    const whole: DayValue[] = [];
    let level = BigInt(rnd(10) * 50);
    for (let i = 30 + rnd(50); i > 0; i--) {
      if (rnd(12) === 0) {
        whole.push(null);
        for (const p of parts) p.push(null);
        continue;
      }
      if (rnd(4) === 0) level = BigInt(rnd(10) * 50);
      whole.push(String(level));
      let rest = level;
      for (const [j, p] of parts.entries()) {
        const x = j === k - 1 ? rest : BigInt(rnd(Number(rest) + 1));
        p.push(String(x));
        rest -= x;
      }
    }
    const T = String(50 + rnd(500));
    assert.ok(parts.reduce((a, p) => a + BigInt(validatedOf(p, W)), 0n) <= BigInt(validatedOf(whole, W)));
    assert.ok(parts.reduce((a, p) => a + units(p, W, T), 0n) <= units(whole, W, T), `trial ${String(trial)}`);
  }
});

test("dojo_price_version_is_exact", () => {
  // D-17 l.287: p_v = median of the seven daily pi_d x sigma_d x 10^-3 (micro-dollars per base unit), exact fractions;
  // D-3 l.174: T_1 = ceil(O_1 / p), rounded up. Arbitrary test values, no market data.
  const seven: Fraction[] = [["7", "2"], ["1", "3"], ["5", "1"], ["2", "7"], ["9", "4"], ["1", "1"], ["3", "2"]];
  assert.deepEqual(medianOfSeven(seven), ["3", "2"]); // 2/7 < 1/3 < 1 < 3/2 < 9/4 < 7/2 < 5; mean about 1.98, max 5
  assert.deepEqual(medianOfSeven([["6", "4"], ["0", "9"], ["0", "9"], ["8", "1"], ["8", "1"], ["8", "1"], ["6", "4"]]), ["3", "2"]);
  // pi = r_S / r_M lamports per base unit; sigma = 1 000 dollars per SOL (test value): products 50, 1, 100, 3, 20, 2, 10
  const pools: Fraction[] = [["50", "1"], ["2", "2"], ["300", "3"], ["3", "1"], ["40", "2"], ["2", "1"], ["10", "1"]];
  const thousand: Fraction[] = Array.from({ length: 7 }, () => ["1000", "1"] as const);
  assert.deepEqual(unitPrice(pools, thousand), ["10", "1"]); // median 10; mean about 26.6; max 100
  // an exact fraction: pi = 7/3 lamports per base unit, sigma = 150 dollars per SOL: 7 x 150 / (3 x 1 000) = 7/20
  const sevenThirds: Fraction[] = Array.from({ length: 7 }, () => ["7", "3"] as const);
  const usd150: Fraction[] = Array.from({ length: 7 }, () => ["150", "1"] as const);
  assert.deepEqual(unitPrice(sevenThirds, usd150), ["7", "20"]);
  // T_1 = ceil(O_1 / p): 1 000 / 3 = 333.3 gives 334; 999 / 3 = 333; 1 000 / (7/20) = 2 857.1 gives 2 858
  assert.equal(unitThreshold("1000", ["3", "1"]), "334");
  assert.equal(unitThreshold("999", ["3", "1"]), "333");
  assert.equal(unitThreshold("1000", unitPrice(sevenThirds, usd150)), "2858");
  assert.throws(() => medianOfSeven(seven.slice(0, 6)), /seven/);
  assert.throws(() => medianOfSeven([...seven.slice(0, 6), ["1", "0"]]), /positive/);
  assert.throws(() => unitThreshold("1000", ["0", "1"]), /positive/);
  assert.throws(() => unitThreshold("0", ["3", "1"]), /positive/);
  assert.throws(() => unitPrice(pools, thousand.slice(0, 6)), /same length/);
});

test("dojo_address_reading_needs_every_account_concordant", () => {
  // C-9, D-2 l.157 (validator case rejeu-ambig2 (3)): accounts X = 100 and Y = 50 from j0; on j10 Y has no quorum at each
  // of the K readings: the day is missing for the address, 5 850 on j39 (5 450 summing the concordant accounts).
  const ok = Array.from({ length: 4 }, () => ["100", "50"]);
  const yLost = Array.from({ length: 4 }, () => ["100", null]);
  const series = Array.from({ length: 40 }, (_, j) => dayValue(j === 10 ? yLost : ok));
  assert.equal(series[10], null);
  assert.equal(scoreOf(series), "5850");
  assert.equal(validatedOf(series, W), "5850");
  // one reading without quorum leaves the day's minimum to the concordant readings
  assert.equal(dayValue([["100", "50"], ["100", null], ["100", "50"]]), "150");
  // the day value is the smallest concordant reading (D-2 l.158, P-34); a reading without quorum never lowers it, and
  // neither the maximum (the non-super-additive witness of M8, l.145) nor the first or last reading of the day is taken
  assert.equal(dayValue([["100", "50"], ["40", null], ["40", "30"], ["90", "80"]]), "70");
  assert.equal(addressReading(["100", null]), null);
  assert.equal(addressReading([]), "0"); // vacuous reading: concordant, balance 0 (G1 journal, Q-3)
  assert.throws(() => dayValue([]), /non-empty/);
  assert.throws(() => addressReading(["100", "5.0"]), /canonical decimal/);
});

test("dojo_migration_counts_lots_held_long_enough", () => {
  // C-16, D-3 l.172 (rejeu-ambig2 (4), M6 (F) l.134): 1 base unit held since j0 plus 1 000 000 bought on j200, read on j230:
  // V^(180) = 231; 1 000 000 held since j0: V^(180) = 231 000 000.
  const dust: DayValue[] = Array.from({ length: 231 }, (_, j) => (j < 200 ? "1" : "1000001"));
  const whale = held(231, "1000000");
  assert.equal(validatedOf(dust, 180), "231");
  assert.equal(validatedOf(whale, 180), "231000000");
  assert.equal(validatedOf(dust, W), "31000231");
  // tier windows 30, 30, 30, 30, 180 (D-8 l.227 tier_windows; decision 225 (5)); u_k are test values (DOJO-OBJECTIVES-1)
  const windows = [30, 30, 30, 30, 180];
  const tierUnits = ["1", "2", "3", "4", "5"];
  assert.equal(tierOf(dust, "1000", tierUnits, windows), 4); // Monarch: 31 000 units on V^(30); 0 on V^(180)
  assert.equal(tierOf(whale, "1000", tierUnits, windows), 5); // Migration: 231 000 units on V^(180)
  // a tier counts units, not points: 10 held 40 days is 400 points, 0 unit at T_1 = 1 000
  assert.equal(tierOf(held(40, "10"), "1000", tierUnits, windows), 0);
  assert.equal(tierOf(held(40, "10"), null, tierUnits, windows), null);
  assert.throws(() => tierOf(whale, "1000", ["2", "3", "4", "5", "6"], windows), /tier units/);
  assert.throws(() => tierOf(whale, "1000", ["1", "3", "3", "4", "5"], windows), /tier units/);
  assert.throws(() => tierOf(whale, "1000", tierUnits, [30, 30, 30, 180, 30]), /tier windows/);
  assert.throws(() => tierOf(whale, "1000", tierUnits.slice(0, 4), windows.slice(0, 4)), /five tier/);
});

test("dojo_holder_counted_uses_the_dust_threshold", () => {
  // D-7 l.217, D-17 l.290, C-10: class holder and day value >= dust threshold (base units) of the version in force;
  // false otherwise; null before the first version. Day value 7, hold score 70.
  const s = held(10, "7");
  assert.equal(holderCounted("holder", s, "7"), true);
  assert.equal(holderCounted("holder", s, "8"), false);
  assert.equal(holderCounted("holder", s, "70"), false); // the hold score reaches 70, the day value does not
  assert.equal(holderCounted("program", s, "1"), false);
  assert.equal(holderCounted("holder", [...s, null], "1"), false);
  assert.equal(holderCounted("holder", s, null), null);
  // dust_threshold = ceil(1 000 000 / p) (D-17 l.290; 1 000 000 micro-dollars, decision 225 (7)): p = 3 gives 333 334
  const dust = unitThreshold("1000000", ["3", "1"]);
  assert.equal(dust, "333334");
  assert.equal(holderCounted("holder", ["333334"], dust), true);
  assert.equal(holderCounted("holder", ["333333"], dust), false);
  assert.throws(() => holderCounted("holder", [], "1"), /no day/);
  assert.throws(() => holderCounted("wallet" as unknown as "holder", s, "1"), /class/);
});

test("dojo_sold_part_never_recovers", () => {
  // D-16 l.275, decision 228: a sold part loses its points, validated or not; a rebuy is a new lot, age zero, no claim.
  // (a) total sale then a rebuy held 40 days: V = the points of the new lot only
  const total: DayValue[] = [...held(60), "0", ...held(40)];
  assert.equal(validatedOf(total, W), "4000");
  assert.equal(provisionalOf(total, W), "0");
  assert.equal(scoreOf(total), "4000");
  assert.deepEqual(lotsOf(total), [["100", 62]]);
  // (b) M8 (E6), l.145 (day minimum of D-18): 200 bought on day 2 (day value 200 from day 3), 50 sold on day 40, 50
  // bought back on day 45 (day value 200 from day 46): 8 700 validated and 750 provisional on day 60
  const e6: DayValue[] = ["0", "0", ...held(37, "200"), ...held(6, "150"), ...held(15, "200")];
  assert.equal(e6.length, 60);
  assert.equal(validatedOf(e6, W), "8700");
  assert.equal(provisionalOf(e6, W), "750");
  // (c) back to a zero balance: no point kept, no lot, no claim
  const gone: DayValue[] = [...held(60), "0", "0"];
  assert.equal(validatedOf(gone, W), "0");
  assert.equal(scoreOf(gone), "0");
  assert.deepEqual(lotsOf(gone), []);
});
