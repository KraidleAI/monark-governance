// MONARK Bell -- lot BELL-ADV-1 oracle (items I-v3-1, I-G2-1, I-G2-3; docs/sec-4927/G2-TEXTE-v3.md C-G2-1, O-8). Fact
// (iii) re-aligned on SEC order 34-106402 II.F: ONE ratio per session = the session's share volume (multiplier in effect
// at each fill) over the average daily share volume of the CALENDAR MONTH BEFORE the session's ET trading day; the
// abstentions no_adv / no_multiplier are NAMED on the entry and COUNTED in state.json (fail-closed, never "1", never a
// partial month). Composition through the REAL collect() on synthetic inputs (no network); the last test drives runMain
// over the REAL openGuardedClient and the REAL polygonGet/databentoGet with ONLY globalThis.fetch stubbed (D-3).
// Cases A/B/D reproduce the G2 probe probe-q6.mts (docs/sec-4927/G2-TEXTE-v3.md l.428-436, sha 69f0a2a4...38f3) as
// assertions.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { collect, runMain, type SymbolInput } from "../src/collect.ts";
import { advPeriodsForFills, VOL_RATIO_FORMULA, ADV_SOURCE, type AdvDailyBar } from "../src/volume.ts";
import { assertNoClose, bellSha } from "../src/digest.ts";
import { rebaseForMint, readMintToken2022, type MintReadout, type RebaseGate } from "../src/supply.ts";
import { classifySession, etWallClockToUtcMs } from "../src/sessions.ts";
import { f64BitsHexLE, type MultiplierEvent } from "../src/rebase-trajectory.ts";
import { POOLS } from "../src/pools.ts";
import { polygonGet, databentoGet } from "../src/close.ts";
import { type SwapFill } from "../src/rpc.ts";
import { BELL_SOLANA_METHODS } from "@monark/rpc-guard";

const HERE = dirname(fileURLToPath(import.meta.url));
const SERIES = join(HERE, "fixtures", "series");

// ---- helpers (test-local references, independent of volume.ts) ------------------------------------------------------
/** One synthetic fill: `tokens` whole tokens at 8 decimals (sign = direction; the volume is |base|). */
const fill = (sig: string, ms: number, tokens: number): SwapFill =>
  ({ signature: sig, blockTimeUtcMs: ms, baseDelta: BigInt(Math.round(tokens * 1e8)), quoteDelta: BigInt(Math.round(-tokens * 365e6)) });
/** Daily bars of a month, one per weekday not in `closed` (the NYSE closures of that month, listed by hand here). */
function monthBars(y: number, m: number, v: (i: number) => number, closed: readonly string[] = []): AdvDailyBar[] {
  const out: AdvDailyBar[] = [];
  const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  for (let d = 1; d <= n; d++) {
    const iso = `${String(y)}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dow = new Date(`${iso}T12:00:00Z`).getUTCDay();
    if (dow !== 0 && dow !== 6 && !closed.includes(iso)) out.push({ dateET: iso, v: v(out.length) });
  }
  return out;
}
const mintOf = (multiplier: string): MintReadout => ({ symbol: "TSLAx", decimals: 8, supply: "1", multiplier, paused: false,
  permanentDelegate: null, scaledAuthority: null, newMultiplier: multiplier, newMultiplierEffectiveTimestampSec: 0 });
const baseSym = (fills: readonly SwapFill[], bars: readonly AdvDailyBar[], extra: Partial<SymbolInput> = {}): SymbolInput =>
  ({ symbol: "TSLAx", chain: "solana", baseDec: 8, quoteDec: 6, fills, fillsResidues: [], closeRefBySession: {}, advDailyVolumes: bars, ...extra });
interface VolEntry {
  symbol: string; session: string; regime: string | null; session_date_et: string; window: { from_utc_ms: number; to_utc_ms: number };
  adv_period: { year: number; month: number }; n: number; n_bars: number; n_trading_days: number | null; formula: string;
  vol_ratio?: string; multiplier_unit?: boolean; abstain?: string[];
}
interface Out { volume: VolEntry[]; residuals: Record<string, number>; gaps: Array<Record<string, unknown>>; stateResiduals: Record<string, number>; bellSha: string }
function run(symbols: readonly SymbolInput[]): Out {
  const r = collect({ symbols, haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  const d = r.digest as unknown as { volume: VolEntry[]; residuals: Record<string, number>; gaps: Array<Record<string, unknown>> };
  return { volume: d.volume, residuals: d.residuals, gaps: d.gaps, stateResiduals: (r.state as unknown as { residuals: Record<string, number> }).residuals, bellSha: r.bellSha };
}
const entryOf = (o: Out, session: string, day: string): VolEntry => {
  const e = o.volume.find((x) => x.session === session && x.session_date_et === day);
  assert.ok(e, `a volume entry for ${session} ${day}`);
  return e;
};
const COMPUTED_KEYS = ["adv_period", "formula", "multiplier_unit", "n", "n_bars", "n_trading_days", "regime", "session", "session_date_et", "symbol", "vol_ratio", "window"];
const ABSTAINED_KEYS = ["abstain", "adv_period", "formula", "n", "n_bars", "n_trading_days", "regime", "session", "session_date_et", "symbol", "window"];
const ev = (kind: "initialize" | "update", m: number, btSec: number, slot: number, effSec = 0): MultiplierEvent =>
  ({ kind, multiplier: String(m), multiplierBitsHex: f64BitsHexLE(m), effectiveTimestampSec: effSec, blockTimeSec: btSec, slot, instructionIndex: 0, signature: "s" + String(slot) });

// Month bars used below (closures of each month listed by hand, NYSE calendar): Aug 2025 = 21 trading days (none closed),
// Sep 2025 = 21 (09-01 Labor Day), Oct 2025 = 23 (none), Nov 2025 = 19 (11-27), Dec 2025 = 22 (12-25), Mar 2026 = 22.
const AUG25 = (v = 1_000_000): AdvDailyBar[] => monthBars(2025, 8, () => v);
const SEP25 = (v = 2_000_000): AdvDailyBar[] => monthBars(2025, 9, () => v, ["2025-09-01"]);
const OCT25 = (v = 3_000_000): AdvDailyBar[] => monthBars(2025, 10, () => v);
const NOV25 = (v = 5_000_000): AdvDailyBar[] => monthBars(2025, 11, () => v, ["2025-11-27"]);
const DEC25 = (v = 4_000_000): AdvDailyBar[] => monthBars(2025, 12, () => v, ["2025-12-25"]);

// ---- 1. the ADV month = the calendar month BEFORE the session's ET trading day (month and year boundaries) ------------
// (a) regular Wed 2025-10-01 14:00 ET: day 10-01 => September (the ruling's refCloseDateOf key would give 09-30 => August:
// the prior month of an Oct-1 session is September -- D-n of the rendu); (b) Wed 2025-10-01 02:00 ET is overnight of
// Tue 09-30 (note 69: the trade date starts with the SIP day) => August, NOT the fill's civil month; (c) Sat 2025-11-01 is
// the weekend of Fri 10-31 => September, NOT October; (d) regular Fri 2026-01-02 => December 2025 (year roll; the
// refCloseDateOf key would give 2025-12-31 => November). Decoy months (Oct, Nov 2025) carry DIFFERENT volumes so a
// wrong month is a wrong ratio, never a silent pass. Mutants: M instead of M-1, refCloseDateOf key, civil-month key.
test("bell_adv_period_is_prior_calendar_month_of_session_day", () => {
  const fa = fill("a", Date.UTC(2025, 9, 1, 18, 0, 0), 1);   // Wed 14:00 EDT, regular
  const fb = fill("b", Date.UTC(2025, 9, 1, 6, 0, 0), 1);    // Wed 02:00 EDT, overnight of Tue 09-30
  const fc = fill("c", Date.UTC(2025, 10, 1, 15, 0, 0), 1);  // Sat 11:00 EDT, weekend of Fri 10-31
  const fd = fill("d", Date.UTC(2026, 0, 2, 15, 0, 0), 1);   // Fri 10:00 ET (UTC-5), regular
  assert.equal(classifySession(fb.blockTimeUtcMs).sessionDateET, "2025-09-30");
  assert.equal(classifySession(fc.blockTimeUtcMs).sessionDateET, "2025-10-31");
  const o = run([baseSym([fa, fb, fc, fd], [...AUG25(), ...SEP25(), ...OCT25(), ...NOV25(), ...DEC25()], { mint: mintOf("1") })]);
  const a = entryOf(o, "regular", "2025-10-01"), b = entryOf(o, "overnight-weekday", "2025-09-30");
  const c = entryOf(o, "weekend", "2025-10-31"), d = entryOf(o, "regular", "2026-01-02");
  assert.deepEqual(a.adv_period, { year: 2025, month: 9 }, "(a) Oct-1 regular => September");
  assert.deepEqual(b.adv_period, { year: 2025, month: 8 }, "(b) 02:00 ET of Oct 1 belongs to the Sep-30 day => August");
  assert.deepEqual(c.adv_period, { year: 2025, month: 9 }, "(c) Sat Nov 1 belongs to Fri Oct 31 => September");
  assert.deepEqual(d.adv_period, { year: 2025, month: 12 }, "(d) Jan 2 2026 => December 2025 (year roll)");
  // 1 token at m = 1 over each month's ADV (Aug 1e6, Sep 2e6, Dec 4e6) -- values derived by hand, not captured.
  assert.equal(a.vol_ratio, "0.0000005000");
  assert.equal(b.vol_ratio, "0.0000010000");
  assert.equal(c.vol_ratio, "0.0000005000");
  assert.equal(d.vol_ratio, "0.0000002500");
  // the calendar's trading-day counts, independently counted above (21 / 21 / 21 / 22), and complete coverage
  assert.deepEqual([a, b, c, d].map((e) => [e.n_bars, e.n_trading_days]), [[21, 21], [21, 21], [21, 21], [22, 22]]);
  assert.equal(o.residuals.no_adv, 0);
});

// ---- 2. no_adv: named on the entry, counted per SESSION, ratio absent (G2 probe case B + insufficiency variants) -------
test("bell_no_adv_is_named_counted_and_ratio_absent", () => {
  const sat = fill("s1", Date.UTC(2025, 8, 13, 15, 0, 0), 2); // Sat 2025-09-13 => day Fri 09-12 => August 2025
  const monday = fill("s2", Date.UTC(2025, 8, 15, 18, 0, 0), 1); // Monday 2025-09-15 14:00 EDT regular => August 2025
  const mint15 = { mint: mintOf("1.5") };
  // B (probe): multiplier 1.5, NO bar at all => both sessions abstain no_adv; counted TWICE (per session, not per symbol).
  const b0 = run([baseSym([sat, monday], [], mint15)]);
  assert.equal(b0.volume.length, 2);
  for (const e of b0.volume) {
    assert.deepEqual(e.abstain, ["no_adv"]);
    assert.ok(!("vol_ratio" in e), "no ratio without its denominator");
    assert.deepEqual(Object.keys(e).sort(), ABSTAINED_KEYS, "closed key list of an abstained entry");
    assert.equal(e.n_bars, 0);
    assert.equal(e.n_trading_days, 21);
  }
  assert.equal(b0.residuals.no_adv, 2, "counted per session entry");
  assert.equal(b0.stateResiduals.no_adv, 2, "the state.json view carries the same counter (D8)");
  assert.equal(b0.residuals.no_multiplier, 0, "the multiplier 1.5 is established");
  // Insufficient or malformed months: each one => no_adv on the Saturday session, never a partial average.
  const full = AUG25();
  const variants: Array<[string, AdvDailyBar[], number]> = [
    ["one trading day missing", full.filter((x) => x.dateET !== "2025-08-15"), 20],
    ["an extra bar on a Saturday", [...full, { dateET: "2025-08-16", v: 1_000_000 }], 22],
    ["a duplicated day in place of a missing one", [...full.filter((x) => x.dateET !== "2025-08-15"), { dateET: "2025-08-14", v: 1_000_000 }], 21],
    ["a zero-volume day", full.map((x) => (x.dateET === "2025-08-20" ? { dateET: x.dateET, v: 0 } : x)), 21],
  ];
  for (const [label, bars, nBars] of variants) {
    const o = run([baseSym([sat], bars, mint15)]);
    assert.deepEqual(o.volume[0]?.abstain, ["no_adv"], label);
    assert.equal(o.volume[0]?.n_bars, nBars, `${label}: n_bars reports the bars found`);
    assert.equal(o.residuals.no_adv, 1, label);
  }
  // A month outside the committed calendar (Dec 2024) is unknown => no_adv even with 22 plausible bars; n_trading_days null.
  const jan = fill("j", Date.UTC(2025, 0, 11, 15, 0, 0), 1); // Sat 2025-01-11 => day Fri 01-10 => December 2024
  const oo = run([baseSym([jan], monthBars(2024, 12, () => 1_000_000, ["2024-12-25"]), mint15)]);
  assert.deepEqual(oo.volume[0]?.adv_period, { year: 2024, month: 12 });
  assert.deepEqual(oo.volume[0]?.abstain, ["no_adv"]);
  assert.equal(oo.volume[0]?.n_trading_days, null);
  // Control (probe case C): the complete month computes 2 tokens x 1.5 / 1e6.
  const ok = run([baseSym([sat], full, mint15)]);
  assert.equal(ok.volume[0]?.vol_ratio, "0.0000030000");
  assert.equal(ok.volume[0]?.multiplier_unit, true);
  assert.deepEqual(Object.keys(ok.volume[0] ?? {}).sort(), COMPUTED_KEYS, "closed key list of a computed entry");
  assert.equal(ok.residuals.no_adv, 0);
});

// ---- 3. no_multiplier: never a default "1" (G2 probe cases A and D + variants) ----------------------------------------
test("bell_no_multiplier_is_named_counted_never_one", () => {
  const f = fill("m1", Date.UTC(2025, 8, 13, 15, 0, 0), 2); // weekend of Fri 2025-09-12 => August 2025, bars complete
  const abst = (extra: Partial<SymbolInput>): Out => run([baseSym([f], AUG25(), extra)]);
  // A (probe): mint ABSENT (quorum failed), no gate => no_multiplier (was: a ratio on the default "1").
  const a = abst({ fillsResidues: ["no_quorum"] });
  assert.deepEqual(a.volume[0]?.abstain, ["no_multiplier"]);
  assert.ok(!("vol_ratio" in (a.volume[0] ?? {})));
  assert.equal(a.residuals.no_multiplier, 1);
  assert.equal(a.stateResiduals.no_multiplier, 1);
  assert.equal(a.residuals.multiplier_unit, 0, "an absent mint raises no unit residue (its session abstains)");
  // D (probe): mint absent + the LIVE gate rebaseForMint(undefined) + a close => the gap abstains rebase_unverified AND the
  // ratio abstains no_multiplier (the asymmetry C-G2-1 named is closed).
  const d = abst({ fillsResidues: ["no_quorum"], rebase: rebaseForMint(undefined), closeRefBySession: { "2025-09-12": 350 } });
  assert.deepEqual(d.volume[0]?.abstain, ["no_multiplier"]);
  assert.equal(d.gaps[0]?.abstain, "rebase_unverified");
  assert.ok(d.residuals.no_multiplier === 1 && d.residuals.rebase_unverified === 1);
  // U: a LEGIBLE current mint (m = 1) under an UNVERIFIED gate => no_multiplier (today's readout never stands in for an
  // unverified history).
  const unverified: RebaseGate = { status: "unverified", residue: "rebase_unverified" };
  assert.deepEqual(abst({ mint: mintOf("1"), rebase: unverified }).volume[0]?.abstain, ["no_multiplier"]);
  // P: unparseable / non-positive multiplier strings => no_multiplier.
  for (const m of ["abc", "", "0", "-1", "Infinity"]) assert.deepEqual(abst({ mint: mintOf(m) }).volume[0]?.abstain, ["no_multiplier"], `multiplier '${m}'`);
  // T: a trajectory whose Initialize comes AFTER the fill => no multiplier at the fill => no_multiplier.
  const late: RebaseGate = { status: "trajectory_known", events: [ev("initialize", 1, Math.floor(f.blockTimeUtcMs / 1000) + 60, 1)], overwrittenPending: 0, residuals: [] };
  assert.deepEqual(abst({ mint: mintOf("1"), rebase: late }).volume[0]?.abstain, ["no_multiplier"]);
  // Both inputs missing => BOTH named and BOTH counted (no silent second cause).
  const both = run([baseSym([f], [], {})]);
  assert.deepEqual(both.volume[0]?.abstain, ["no_multiplier", "no_adv"]);
  assert.ok(both.residuals.no_multiplier === 1 && both.residuals.no_adv === 1);
  // Control: a constant gate m = 1.5 converts (2 x 1.5 / 1e6) even with the mint absent.
  const constant: RebaseGate = { status: "constant", multiplier: "1.5" };
  assert.equal(abst({ rebase: constant }).volume[0]?.vol_ratio, "0.0000030000");
});

// ---- 4. unit (I-G2-3): per SESSION share volume over a DAILY average; per-fill multiplier ------------------------------
// Wed 2025-09-17 has three sessions (pre 0.5 token; regular 1.0 then -0.25 token; after 0.75 token), Thu 09-18 one
// (regular 3.0). The trajectory moves m from 1 to 1.02 at 15:15Z on Wed (between the two regular fills). ADV Aug = 1e6.
// Expected by hand: pre 0.5; regular 1.0 + 0.25 x 1.02 = 1.255; after 0.75 x 1.02 = 0.765; Thu 3.0 x 1.02 = 3.06 (e-6).
// Mutants: window total restored (every entry = 5.52e-6), a daily-rate rescaling, one current multiplier for all fills.
test("bell_vol_ratio_unit_is_session_share_volume_over_daily_adv", () => {
  const wed = (h: number, mi: number): number => Date.UTC(2025, 8, 17, h, mi, 0);
  const fills = [fill("p", wed(12, 0), 0.5), fill("r1", wed(15, 0), 1), fill("r2", wed(15, 30), -0.25), fill("a", wed(21, 0), 0.75),
    fill("t", Date.UTC(2025, 8, 18, 15, 0, 0), 3)];
  const updSec = Math.floor(wed(15, 15) / 1000);
  const gate: RebaseGate = { status: "trajectory_known", events: [ev("initialize", 1, 0, 1), ev("update", 1.02, updSec, 2, updSec)], overwrittenPending: 0, residuals: [] };
  const o = run([baseSym(fills, AUG25(), { mint: mintOf("1.02"), rebase: gate })]);
  assert.equal(o.volume.length, 4, "one entry per session group, never one per symbol");
  const pre = entryOf(o, "pre", "2025-09-17"), reg = entryOf(o, "regular", "2025-09-17");
  const aft = entryOf(o, "after", "2025-09-17"), thu = entryOf(o, "regular", "2025-09-18");
  assert.equal(pre.vol_ratio, "0.0000005000");
  assert.equal(reg.vol_ratio, "0.0000012550", "per-fill multiplier: 1.0 x 1 + 0.25 x 1.02");
  assert.equal(aft.vol_ratio, "0.0000007650");
  assert.equal(thu.vol_ratio, "0.0000030600");
  assert.deepEqual([pre.multiplier_unit, reg.multiplier_unit, aft.multiplier_unit, thu.multiplier_unit], [false, true, true, true]);
  assert.deepEqual([pre.n, reg.n, aft.n, thu.n], [1, 2, 1, 1]);
  // additivity (the II.F daily term): the Wed sessions sum to Wed's share volume over the ADV (2.52e-6)
  const wedSum = [pre, reg, aft].reduce((s, e) => s + Number(e.vol_ratio), 0);
  assert.ok(Math.abs(wedSum - 2.52e-6) < 1e-15, `Wed sessions add up to the day: ${String(wedSum)}`);
  // a session's window is the span of ITS fills (regular: 15:00Z..15:30Z)
  assert.deepEqual(reg.window, { from_utc_ms: wed(15, 0), to_utc_ms: wed(15, 30) });
  assert.deepEqual(pre.window, { from_utc_ms: wed(12, 0), to_utc_ms: wed(12, 0) });
});

// ---- 5. roll of the bars across months: each session takes ITS month, never a union / rolling window ------------------
test("bell_adv_bars_roll_across_months", () => {
  const fri = fill("f", Date.UTC(2025, 9, 31, 15, 0, 0), 1);  // Fri 2025-10-31 11:00 EDT => September
  const monday = fill("m", Date.UTC(2025, 10, 3, 16, 0, 0), 1);  // Monday 2025-11-03 11:00 ET (UTC-5) => October
  // the live reader requests exactly these two months (one GET each)
  assert.deepEqual(advPeriodsForFills([fri, monday]), [{ year: 2025, month: 9 }, { year: 2025, month: 10 }]);
  const o = run([baseSym([fri, monday], [...SEP25(), ...OCT25()], { mint: mintOf("1") })]);
  const ef = entryOf(o, "regular", "2025-10-31"), em = entryOf(o, "regular", "2025-11-03");
  assert.equal(ef.vol_ratio, "0.0000005000", "Oct-31 session / September ADV 2e6");
  assert.equal(em.vol_ratio, "0.0000003333", "Nov-3 session / October ADV 3e6 (a union of both months would give 1 / 2.52e6)");
  assert.deepEqual([ef.n_bars, em.n_bars], [21, 23]);
  // October incomplete => only the Nov-3 session abstains; the Oct-31 session keeps its ratio (per-session independence)
  const o2 = run([baseSym([fri, monday], [...SEP25(), ...OCT25().slice(1)], { mint: mintOf("1") })]);
  assert.equal(entryOf(o2, "regular", "2025-10-31").vol_ratio, "0.0000005000");
  assert.deepEqual(entryOf(o2, "regular", "2025-11-03").abstain, ["no_adv"]);
  assert.equal(o2.residuals.no_adv, 1);
});

// ---- 6. the ratio is RECOMPUTABLE from the published entry + the fills + the bars (independent reference) -------------
/** Recompute a published entry from scratch: the fills of (session, regime, session_date_et) selected by the published
 *  session rule over ALL fills, the multiplier m, the bars dated in adv_period. Returns the ratio string. */
function recompute(e: VolEntry, fills: readonly SwapFill[], bars: readonly AdvDailyBar[], m: (ms: number) => number): string {
  const mine = fills.filter((x) => { const c = classifySession(x.blockTimeUtcMs); return c.session === e.session && c.regime === e.regime && c.sessionDateET === e.session_date_et; });
  assert.equal(mine.length, e.n, "n = the fills of this session");
  assert.deepEqual(e.window, { from_utc_ms: Math.min(...mine.map((x) => x.blockTimeUtcMs)), to_utc_ms: Math.max(...mine.map((x) => x.blockTimeUtcMs)) }, "window = first and last fill of the session");
  let s = 0;
  for (const x of mine) s += (Number(x.baseDelta < 0n ? -x.baseDelta : x.baseDelta) / 1e8) * m(x.blockTimeUtcMs);
  const ym = `${String(e.adv_period.year)}-${String(e.adv_period.month).padStart(2, "0")}-`;
  const inMonth = bars.filter((b) => b.dateET.startsWith(ym));
  assert.equal(inMonth.length, e.n_bars, "n_bars = the bars dated in adv_period");
  return (s / (inMonth.reduce((a, b) => a + b.v, 0) / inMonth.length)).toFixed(10);
}
test("bell_vol_ratio_recomputable_from_published_entry", () => {
  // (a) the REAL reduced session series (8 fills, sha-pinned) + its mint (m = 1, published in digest.supply)
  const fills = readFileSync(join(SERIES, "tslax-weekend-fills.jsonl"), "utf8").split(/\r?\n/).filter((l) => l.trim()).map((l) => {
    const x = JSON.parse(l) as { signature: string; blockTimeUtcMs: number; baseDelta: string; quoteDelta: string };
    return { signature: x.signature, blockTimeUtcMs: x.blockTimeUtcMs, baseDelta: BigInt(x.baseDelta), quoteDelta: BigInt(x.quoteDelta) };
  });
  const mint = readMintToken2022(JSON.parse(readFileSync(join(SERIES, "tslax-mint-token2022.json"), "utf8")), "TSLAx");
  const bars = monthBars(2026, 8, (i) => [1_000_000, 1_100_000, 900_000][i % 3]!);
  const r = collect({ symbols: [baseSym(fills, bars, { mint })], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  const d = r.digest as unknown as { volume: VolEntry[]; supply: Array<{ multiplier: string }> };
  const e = d.volume[0];
  assert.ok(e && d.volume.length === 1);
  const m = Number(d.supply[0]?.multiplier);
  assert.equal(e.vol_ratio, recompute(e, fills, bars, () => m));
  assert.equal(e.vol_ratio, "0.0000019375", "1.93751892 shares over a 1e6 August-2026 ADV");
  assert.deepEqual([e.session, e.session_date_et, e.adv_period.year, e.adv_period.month], ["weekend", "2026-09-18", 2026, 8]);
  assert.equal(e.formula, VOL_RATIO_FORMULA, "the definition rides on the entry");
  assert.deepEqual(Object.keys(e).sort(), COMPUTED_KEYS);
  // (b) the multi-session, per-fill-multiplier input of test 4: every entry recomputes from its published fields
  const wed = (h: number, mi: number): number => Date.UTC(2025, 8, 17, h, mi, 0);
  const f4 = [fill("p", wed(12, 0), 0.5), fill("r1", wed(15, 0), 1), fill("r2", wed(15, 30), -0.25), fill("a", wed(21, 0), 0.75), fill("t", Date.UTC(2025, 8, 18, 15, 0, 0), 3)];
  const upd = Math.floor(wed(15, 15) / 1000);
  const mAt = (ms: number): number => (Math.floor(ms / 1000) >= upd ? 1.02 : 1);
  const o = run([baseSym(f4, AUG25(), { rebase: { status: "trajectory_known", events: [ev("initialize", 1, 0, 1), ev("update", 1.02, upd, 2, upd)], overwrittenPending: 0, residuals: [] } })]);
  for (const x of o.volume) assert.equal(x.vol_ratio, recompute(x, f4, AUG25(), mAt), `${x.session} ${x.session_date_et}`);
});

// ---- 7. the close/ADV guard exempts ONLY the residual counter no_adv; a numeric adv still reddens ---------------------
test("bell_no_adv_counter_passes_close_guard_adv_still_reddens", () => {
  assert.doesNotThrow(() => { assertNoClose({ no_adv: 3, no_multiplier: 2 }); });
  assert.doesNotThrow(() => { assertNoClose({ adv_period: { year: 2026, month: 8 }, n_bars: 21 }); });
  for (const k of ["adv", "advShares", "adv_shares", "x_adv", "adv_period"]) assert.throws(() => { assertNoClose({ [k]: 1_000_000 }); }, /close-like/, `numeric '${k}' still reddens`);
  // composition: a digest that COUNTS no_adv hashes (the guard runs inside bellSha) and the whole state is guard-clean
  const f = fill("g", Date.UTC(2025, 8, 13, 15, 0, 0), 1);
  const r = collect({ symbols: [baseSym([f], [], { mint: mintOf("1") })], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  assert.equal((r.digest as unknown as { residuals: Record<string, number> }).residuals.no_adv, 1);
  assert.match(r.bellSha, /^[0-9a-f]{64}$/);
  assert.equal(bellSha(r.digest), r.bellSha);
  assert.doesNotThrow(() => { assertNoClose(r.state); });
});

// ---- 8. D-3 BRANCHED: runMain -> REAL openGuardedClient (Solana) + REAL polygonGet/databentoGet, ONLY fetch stubbed ----
// A Saturday 2026-04-11 swap (+2.5 tokens) => day Fri 2026-04-10 => ADV month March 2026 (22 trading days, DST starts
// Mar 8). The Massive body has the DOCUMENTED form (keys adjusted, queryCount, request_id, results[{c,h,l,n,o,t,v,vw}],
// resultsCount, status, ticker; t = midnight ET of each bar). Asserted on the WRITTEN state.json/provenance.json: the one
// ADV request (exact month, adjusted=false, key in the header only), the entry (March 2026, 22 bars, 2.5 / 5e6), the
// named source. A DST-naive bar date or a 45-day window or adjusted=true reddens here.
const HELIUS_HOST = "helius.example.invalid";
function stateConfigB64(mult: number): string {
  const b = new Uint8Array(56);
  const dv = new DataView(b.buffer);
  dv.setFloat64(32, mult, true); dv.setBigInt64(40, 0n, true); dv.setFloat64(48, mult, true);
  return Buffer.from(b).toString("base64");
}
test("bell_adv_leg_is_wired_runmain_guard_real_polygon_get", async () => {
  const pool = POOLS.find((p) => p.baseSymbol === "TSLAx" && p.chain === "solana");
  assert.ok(pool);
  const btMs = Date.UTC(2026, 3, 11, 13, 31, 4), btSec = Math.floor(btMs / 1000);
  const swapBody = { slot: 1, transaction: { message: { accountKeys: [{ pubkey: pool.vaultBase }, { pubkey: pool.vaultQuote }] } },
    meta: { err: null, preTokenBalances: [{ accountIndex: 0, uiTokenAmount: { amount: "1000000000" } }, { accountIndex: 1, uiTokenAmount: { amount: "5000000000" } }],
      postTokenBalances: [{ accountIndex: 0, uiTokenAmount: { amount: "1250000000" } }, { accountIndex: 1, uiTokenAmount: { amount: "4087500000" } }] } };
  const marchBars = monthBars(2026, 3, (i) => (i % 2 === 0 ? 4_000_000 : 6_000_000)); // 22 bars, mean 5e6
  assert.equal(marchBars.length, 22);
  const massiveBody = { adjusted: false, queryCount: marchBars.length, request_id: "synthetic-0001", resultsCount: marchBars.length, status: "OK", ticker: "TSLA",
    results: marchBars.map((b) => { const [y, mo, d] = b.dateET.split("-").map(Number); return { c: 1, h: 1, l: 1, n: 1, o: 1, t: etWallClockToUtcMs(y ?? 0, mo ?? 1, d ?? 1, 0, 0, 0), v: b.v, vw: 1 }; }) };
  const polyCalls: Array<{ url: string; auth: string }> = [];
  const json = (x: unknown): Response => new Response(JSON.stringify(x), { status: 200, headers: { "content-type": "application/json" } });
  const stub = ((input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (url.startsWith("https://api.polygon.io/")) {
      polyCalls.push({ url, auth: String((init?.headers as Record<string, string> | undefined)?.Authorization) });
      return Promise.resolve(json(massiveBody));
    }
    if (url.startsWith("https://hist.databento.com/")) return Promise.resolve(new Response("", { status: 200 })); // no close (fine)
    if (url.startsWith(`https://${HELIUS_HOST}`) || url.startsWith("https://api.mainnet.solana.com")) {
      const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
      const rpc = (result: unknown): Promise<Response> => Promise.resolve(json({ jsonrpc: "2.0", id: 1, result }));
      if (req.method === "getSignaturesForAddress") return rpc([{ signature: "sig1", slot: 1, blockTime: btSec, err: null }]);
      if (req.method === "getTransaction") return rpc(swapBody);
      if (req.method === "getAccountInfo") {
        const enc = (req.params[1] as { encoding?: string } | undefined)?.encoding;
        if (enc === "base64") return rpc({ context: { slot: 9 }, value: { data: [stateConfigB64(1), "base64"] } });
        return rpc({ context: { slot: 9 }, value: { data: { parsed: { info: { supply: "1000000000", decimals: 8, extensions: [] } } } } });
      }
      return rpc(null);
    }
    throw new Error("unexpected host in the stubbed fetch (no real network in this oracle)");
  }) as typeof globalThis.fetch;
  const dir = mkdtempSync(join(tmpdir(), "bell-adv1-ledger-"));
  const out = mkdtempSync(join(tmpdir(), "bell-adv1-out-"));
  const traj = join(out, "traj.json");
  writeFileSync(traj, JSON.stringify({ TSLAx: { events: [{ kind: "initialize", multiplier: "1", multiplierBitsHex: f64BitsHexLE(1), effectiveTimestampSec: 0, blockTimeSec: 0, slot: 1, instructionIndex: 0, signature: "s1" }], scanComplete: true, scanMethod: "authority" } }));
  const caps = BELL_SOLANA_METHODS.map((m) => `${m}=100000000`).join(",");
  const argv = ["--ledger-dir", dir, "--cycle", "cyc", "--operators", "helius,solana-foundation", "--floor", "helius=0,solana-foundation=0",
    "--method-caps", caps, "--max-credits", "1000000000", "--max-calls", "500000", "--min-interval", "0", "--out", out, "--pools", "TSLAx",
    "--body-sample", "0", "--max-pages", "1", "--from-utc", String(btMs - 86_400_000), "--to-utc", String(btMs + 86_400_000), "--rebase-trajectory", traj];
  const env = { BELL_SOLANA_RPC: `https://${HELIUS_HOST}`, POLYGON_API_KEY: "p-fake", DATABENTO_API_KEY: "d-fake" } as NodeJS.ProcessEnv;
  const real = globalThis.fetch;
  globalThis.fetch = stub;
  try {
    await runMain(argv, { databentoGet, polygonGet, env, nowMs: Date.UTC(2026, 3, 12) });
  } finally { globalThis.fetch = real; }
  try {
    assert.deepEqual(polyCalls.map((c) => c.url), ["https://api.polygon.io/v2/aggs/ticker/TSLA/range/1/day/2026-03-01/2026-03-31?adjusted=false&sort=asc&limit=50"], "ONE request, the exact ADV month, unadjusted");
    assert.equal(polyCalls[0]?.auth, "Bearer p-fake", "the key rides in the Authorization header (C-10), never in the url");
    const state = JSON.parse(readFileSync(join(out, "state.json"), "utf8")) as { residuals: Record<string, number>; digest: { volume: VolEntry[] } };
    const prov = JSON.parse(readFileSync(join(out, "provenance.json"), "utf8")) as { sources: Record<string, unknown> };
    assert.equal(state.digest.volume.length, 1);
    const e = state.digest.volume[0];
    assert.ok(e);
    assert.deepEqual([e.session, e.session_date_et, e.adv_period.year, e.adv_period.month, e.n_bars, e.n_trading_days, e.n], ["weekend", "2026-04-10", 2026, 3, 22, 22, 1]);
    assert.equal(e.vol_ratio, "0.0000005000", "2.5 shares / mean(4e6, 6e6) -- both sides of the Mar 8 DST switch dated in ET");
    assert.deepEqual(e.window, { from_utc_ms: btSec * 1000, to_utc_ms: btSec * 1000 });
    assert.ok(state.residuals.no_adv === 0 && state.residuals.no_multiplier === 0);
    assert.equal(prov.sources.adv_source, ADV_SOURCE);
    assert.doesNotThrow(() => { assertNoClose(state); });
    const nums: number[] = [];
    JSON.parse(readFileSync(join(out, "state.json"), "utf8"), (_k, v: unknown) => { if (typeof v === "number") nums.push(v); return v; });
    assert.ok(nums.length > 0 && !nums.includes(5_000_000), "the ADV value itself (5e6) is never written as a number");
  } finally { rmSync(out, { recursive: true, force: true }); rmSync(dir, { recursive: true, force: true }); }
});
