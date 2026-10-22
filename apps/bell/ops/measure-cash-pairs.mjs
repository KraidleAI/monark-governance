#!/usr/bin/env node
// MONARK Bell -- the measure of the two cash pairs (BELL-JUSTESSE-1 lot 1d; G0 DJ-5, plan P1 r2 C1-3), run by the founder: AF-2 reads
// the price, AF-3 runs the measure. For the four underlyings of Bell's pools and every day of the whole months 2025-01 to 2026-09, it
// compares (a) the Massive daily `v` with the `volume` of Databento EQUS.SUMMARY ohlcv-1d, (b) the Massive daily `c` with the EQUS.SUMMARY
// `close`. Requests and dating are the course's own: advRangePath and barDateET (volume.ts) on the Massive side, databentoGetRangePath and
// dbnBarDateUtc (close.ts) on the Databento side; both datings give the ET trading date of a US day (close.ts l.81-83, declared).
// Paid reads go through the GET seams of close.ts only (databentoGet, polygonGet; this file never calls fetch); the keys come from
// readCashKeys (close.ts) over the founder's environment and are never written nor printed. The price (metadata.get_cost, close.ts
// databentoCostPath) is read BEFORE any series and printed; --run stops unless --confirm-cost-usd repeats that price.
// Output: counts only, plus the relative gaps (median_rel, max_rel) and the price (cost_usd); never a market value.
//   rel = abs(massive - databento) / databento (Databento is the reference; 0/0 = 0, x/0 = inf); thresholds are strict (over_1bp counts
//   rel > 1e-4; over_10bp 1e-3; over_100bp 1e-2; over_500bp 5e-2); median = middle value, or the mean of the two middle values;
//   equal = the "=" sign (volumes: same number; closes: same value at 1e-9, the comparison of C14, close.ts l.182), so the close pair's
//   differ_1e-9 = paired - equal is the number of days C14 would refuse (stop_cash_cross_mismatch).
//   A day read twice on one side is dropped from that side (dup_*), never picked; a record without a date or a value is unread_*.
// Usage: node apps/bell/ops/measure-cash-pairs.mjs --cost
//        node apps/bell/ops/measure-cash-pairs.mjs --run --confirm-cost-usd <the cost_usd printed by --cost>
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DBN_UNDEF_PRICE, databentoCostPath, databentoGet, databentoGetRangePath, dbnBarDateUtc, polygonGet, readCashKeys, scaledFromDatabento, scaledFromDecimal } from "../src/close.ts";
import { POOLS } from "../src/pools.ts";
import { statusOf } from "../src/quorum.ts";
import { isTradingDay } from "../src/sessions.ts";
import { advRangePath, barDateET, periodBounds, tradingDaysOf } from "../src/volume.ts";

export const WINDOW = Object.freeze({ start: "2025-01-01", last: "2026-09-30", endExclusive: "2026-10-01" });
/** The 21 whole months of the window, as the ADV periods advRangePath takes. */
export const MONTHS = Object.freeze(Array.from({ length: 21 }, (_, i) => ({ year: 2025 + Math.floor(i / 12), month: (i % 12) + 1 })));
/** The four underlyings of Bell's pools (pools.ts), sorted. */
export const SYMBOLS = Object.freeze([...new Set(POOLS.map((p) => p.underlying).filter((u) => typeof u === "string"))].sort());
export const THRESHOLDS = Object.freeze([["over_1bp", 1e-4], ["over_10bp", 1e-3], ["over_100bp", 1e-2], ["over_500bp", 5e-2]]);

/** The cost query of the whole measure: every Databento series the run asks for lies inside it (symbols and [start, end)). */
export const costPath = () => databentoCostPath(SYMBOLS, WINDOW.start, WINDOW.endExclusive);
export const fmtRel = (x) => (x === Infinity ? "inf" : x.toExponential(4));
const inWindow = (date) => date >= WINDOW.start && date <= WINDOW.last;

/** Collect one side's values by date: a date seen twice leaves the side (dup), a missing date or value is unread. */
function bySide(items, dateOf, valueOf) {
  const seen = new Map(), dups = new Set();
  let unread = 0;
  for (const it of items) {
    const date = dateOf(it), value = valueOf(it);
    if (date === undefined || value === undefined) { unread += 1; continue; }
    if (!inWindow(date)) continue;
    if (seen.has(date)) dups.add(date); else seen.set(date, value);
  }
  for (const d of dups) seen.delete(d);
  return { days: seen, dup: dups.size, unread };
}

/** The counts of one pair for one symbol. cmp and rel work on numbers (volumes) or scaled BigInts (closes). */
export function pairCounts(massive, databento, cmp, rel) {
  const c = { read_massive: massive.days.size, read_databento: databento.days.size, paired: 0, equal: 0, massive_gt: 0, massive_lt: 0 };
  for (const [k] of THRESHOLDS) c[k] = 0;
  const rels = [];
  for (const [date, m] of massive.days) {
    const d = databento.days.get(date);
    if (d === undefined) continue;
    c.paired += 1;
    const s = cmp(m, d);
    if (s === 0) c.equal += 1; else if (s > 0) c.massive_gt += 1; else c.massive_lt += 1;
    const r = rel(m, d);
    rels.push(r);
    for (const [k, t] of THRESHOLDS) if (r > t) c[k] += 1;
  }
  rels.sort((a, b) => a - b);
  const n = rels.length, mid = Math.floor(n / 2);
  c.median_rel = n === 0 ? "none" : fmtRel(n % 2 === 1 ? rels[mid] : (rels[mid - 1] + rels[mid]) / 2);
  c.max_rel = n === 0 ? "none" : fmtRel(rels[n - 1]);
  c.only_massive = c.read_massive - c.paired;
  c.only_databento = c.read_databento - c.paired;
  let offM = 0, offD = 0;
  for (const d of massive.days.keys()) if (!isTradingDay(d)) offM += 1;
  for (const d of databento.days.keys()) if (!isTradingDay(d)) offD += 1;
  return { ...c, off_calendar_massive: offM, off_calendar_databento: offD, dup_massive: massive.dup, dup_databento: databento.dup, unread_massive: massive.unread, unread_databento: databento.unread };
}

const numCmp = (a, b) => (a === b ? 0 : a > b ? 1 : -1);
const numRel = (m, d) => (d === 0 ? (m === 0 ? 0 : Infinity) : Math.abs(m - d) / d);
const bigCmp = (a, b) => (a === b ? 0 : a > b ? 1 : -1);
const bigRel = (m, d) => (d === 0n ? (m === 0n ? 0 : Infinity) : Number(m > d ? m - d : d - m) / Number(d));
const finite = (x) => (typeof x === "number" && Number.isFinite(x) ? x : undefined);
const dbnVolume = (r) => (typeof r.volume === "string" && /^\d+$/.test(r.volume.trim()) ? Number(r.volume.trim()) : typeof r.volume === "number" && Number.isFinite(r.volume) ? r.volume : undefined);
const dbnClose = (r) => { const s = typeof r.close === "string" ? r.close.trim() : ""; if (s === "" || s === DBN_UNDEF_PRICE) return undefined; try { return scaledFromDatabento(s); } catch { return undefined; } };
const massiveClose = (b) => { const c = finite(b.c); if (c === undefined) return undefined; try { return scaledFromDecimal(String(c)); } catch { return undefined; } };
const massiveDate = (b) => (finite(b.t) === undefined ? undefined : barDateET(b.t));
const line = (o) => Object.entries(o).map(([k, v]) => `${k}=${String(v)}`).join(" ");

/** The measure. deps: { databentoGet, polygonGet, env, out, err, head }. Returns the exit code: 0 done; 2 usage or a missing key;
 *  3 price unread or not confirmed (no series asked); 4 a fault on a series (stopped, nothing counted). */
export async function measure(argv, deps) {
  const mode = argv.includes("--cost") ? "cost" : argv.includes("--run") ? "run" : null;
  const ci = argv.indexOf("--confirm-cost-usd"), confirm = ci >= 0 ? argv[ci + 1] : undefined;
  if (mode === null) { deps.err("stop usage: --cost | --run --confirm-cost-usd <cost_usd>"); return 2; }
  const { databentoKey, polygonKey } = readCashKeys(deps.env);
  if (!databentoKey) { deps.err("stop no_databento_key (the session sets none; nothing is sent)"); return 2; }
  if (mode === "run" && !polygonKey) { deps.err("stop no_massive_key (the session sets none; nothing is sent)"); return 2; }
  deps.out(line({ "measure-cash-pairs": "v1", mode, head: deps.head ?? "unknown", symbols: SYMBOLS.join(","), window: `${WINDOW.start}..${WINDOW.last}`, months: MONTHS.length }));
  let cost = NaN;
  try { const v = await deps.databentoGet(costPath(), databentoKey); cost = v.length === 1 && typeof v[0] === "number" ? v[0] : NaN; }
  catch (e) { deps.err(`stop cost_unavailable status=${statusOf(e).replace(/\s+/g, "_")}`); return 3; }
  if (!Number.isFinite(cost)) { deps.err("stop cost_unavailable (the cost query returned no number)"); return 3; }
  deps.out(`cost_usd=${String(cost)}`);
  if (mode === "cost") return 0;
  if (confirm === undefined || Number(confirm) !== cost) { deps.err(`stop cost_unconfirmed (--confirm-cost-usd ${confirm === undefined ? "absent" : "differs"}; no series asked)`); return 3; }
  const bars = Object.fromEntries(SYMBOLS.map((s) => [s, []]));
  let emptyMonths = 0, nM = 0, nD = 0;
  for (const sym of SYMBOLS) {
    for (const p of MONTHS) {
      let res;
      try { nM += 1; res = await deps.polygonGet(advRangePath(sym, p), polygonKey); }
      catch (e) { deps.err(`stop fault side=massive symbol=${sym} month=${periodBounds(p).first.slice(0, 7)} status=${statusOf(e).replace(/\s+/g, "_")}`); return 4; }
      if (!Array.isArray(res?.results) || res.results.length === 0) emptyMonths += 1; else bars[sym].push(...res.results);
    }
  }
  const records = {};
  for (const sym of SYMBOLS) {
    try { nD += 1; records[sym] = await deps.databentoGet(databentoGetRangePath(sym, WINDOW.start, WINDOW.endExclusive), databentoKey); }
    catch (e) { deps.err(`stop fault side=databento symbol=${sym} status=${statusOf(e).replace(/\s+/g, "_")}`); return 4; }
  }
  const td = MONTHS.reduce((n, p) => n + (tradingDaysOf(p)?.length ?? 0), 0);
  deps.out(line({ confirmed: "yes", trading_days: td, requests_massive: nM, requests_databento: nD, empty_months_massive: emptyMonths }));
  for (const sym of SYMBOLS) {
    const mv = bySide(bars[sym], massiveDate, (b) => finite(b.v)), dv = bySide(records[sym], dbnBarDateUtc, dbnVolume);
    deps.out(line({ pair: "volume", symbol: sym, ...pairCounts(mv, dv, numCmp, numRel) }));
  }
  for (const sym of SYMBOLS) {
    const mc = bySide(bars[sym], massiveDate, massiveClose), dc = bySide(records[sym], dbnBarDateUtc, dbnClose);
    const c = pairCounts(mc, dc, bigCmp, bigRel);
    deps.out(line({ pair: "close", symbol: sym, ...c, "differ_1e-9": c.paired - c.equal }));
  }
  return 0;
}

/** The trunk SHA the founder runs, read-only (git rev-parse, without the caller's GIT_* variables); "unknown" if git cannot say. */
function headSha() {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
  const r = spawnSync("git", ["rev-parse", "HEAD"], { cwd: join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".."), env, encoding: "utf8" });
  return r.status === 0 && /^[0-9a-f]{40}$/.test(r.stdout.trim()) ? r.stdout.trim() : "unknown";
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const write = (s) => (l) => s.write(`${l}\n`);
  process.exitCode = await measure(process.argv.slice(2), { databentoGet, polygonGet, env: process.env, out: write(process.stdout), err: write(process.stderr), head: headSha() });
}
