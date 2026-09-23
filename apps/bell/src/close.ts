// MONARK Bell — cash reference close via Databento EQUS.SUMMARY (ohlcv-1d), cross-checked against Massive
// (Polygon.io) range/1/day (ADR-B0 D2 i / ESC-1 c, decision 53, lot -b3b). The close is READ to compute g_t and
// is NEVER written to any output (digest.ts assertNoClose is the guard); only the DERIVED gap (g_t) and a
// per-session cross marker are carried. This module is injectable: `readReferenceCloses` takes `databentoGet` /
// `polygonGet` seams so CI drives it offline on synthetic fixtures (no network, no real close committed).
//
// PR-B-DBN (docs/biblio/bell/L-lecture-databento-api-2026-09-20.md, [lu] unless noted):
//  · basic auth, API key = USERNAME + empty password (header only, never printed, never in a url — C-10);
//  · endpoint `/v0/timeseries.get_range` on `hist.databento.com` ([2nd]; confirmed by a real metadata.get_cost);
//  · dataset=EQUS.SUMMARY, schema=ohlcv-1d, stype_in=raw_symbol, start inclusive / end EXCLUSIVE (UTC);
//  · encoding=json => 64-bit ints are STRINGS; `close` = scaled fixed-point integer, 1 unit = 1e-9 (SYNTHETIC
//    illustration, not a market print: "123450000000" == 123.45); header (ts_event) under `hd`; ts_event of an
//    ohlcv-1d bar = midnight UTC of the bar date;
//  · close = the official consolidated Nasdaq NLS+ end-of-day summary (20:15 ET), non-adjusted;
//  · one range request covers the whole [start,end); <= 2000 symbols; unknown symbol => 200 + `warnings`.
import { createHash } from "node:crypto";
import { etWallClockToUtcMs } from "./sessions.ts";
import { canonical } from "./digest.ts";
import type { CashCross } from "./digest.ts";
import type { TransportFault } from "./quorum.ts";
import { statusOf } from "./quorum.ts";

export const EQUS_DATASET = "EQUS.SUMMARY";
export const OHLCV_SCHEMA = "ohlcv-1d";
export const CLOSE_SOURCE = "databento-equs-summary"; // decision 53: Databento is THE cash-close source (named, never a value)
export const DATABENTO_HIST = "https://hist.databento.com"; // [2nd] PR-B-DBN; a real metadata.get_cost call confirms it
export const DBN_UNDEF_PRICE = "9223372036854775807"; // INT64_MAX = Databento UNDEF_PRICE (no valid close)

/** Massive/Polygon GET seam (moved here from collect.ts so both the ADV leg and the cross leg share one type). `t` =
 *  "The Unix millisecond timestamp for the start of the aggregate window" (Massive Custom Bars docs, [lu] 2026-09-23);
 *  the ADV leg dates each daily bar by it (BELL-ADV-1). */
export type PolygonGet = (pathAndQuery: string, apiKey: string) => Promise<{ results?: Array<{ v?: number; c?: number; t?: number }> }>;
/** One Databento ohlcv-1d record (only the fields we read). `close` is the scaled-int STRING (encoding=json). */
export interface DatabentoOhlcvRecord { readonly hd?: { ts_event?: string | number }; readonly ts_event?: string | number; readonly close?: string; readonly symbol?: string }
/** Databento timeseries GET seam: returns the parsed ohlcv-1d records for a single-symbol range request. */
export type DatabentoGet = (pathAndQuery: string, apiKey: string) => Promise<readonly DatabentoOhlcvRecord[]>;

/** GARDE-HELIUS-1b (C-6 / ruling R-1): close.ts is the SINGLE allowlisted cash module — it holds BOTH the paid GET
 *  (databentoGet/polygonGet below) AND the paid-key read, so no other Bell module reads POLYGON_API_KEY /
 *  DATABENTO_API_KEY (collect.ts is NEVER allowlisted; its :582-583 env reads MOVE here). The keys are threaded to
 *  the GET seams as arguments (header only, never in a url, never printed — C-10). Empty string ⇒ that leg is
 *  unavailable (Databento: the reference close abstains; Polygon: cash_cross_unavailable). The scanner allowlist
 *  entry for close.ts carries the trigger "G0 of the Bell cash course" (quotas/caps posed then, decision 115 / R-1). */
export function readCashKeys(env: NodeJS.ProcessEnv): { readonly polygonKey: string; readonly databentoKey: string } {
  return { polygonKey: env.POLYGON_API_KEY ?? "", databentoKey: env.DATABENTO_API_KEY ?? "" };
}

/** Databento JSON `close` (a scaled-int STRING, 1e-9) -> the exact scaled BigInt. Shape-checked (never a float,
 *  never a raw-string compare — C-5). The value is never surfaced in an error (it is a close). */
export function scaledFromDatabento(closeStr: string): bigint {
  const t = closeStr.trim();
  if (!/^-?\d+$/.test(t)) throw new Error("bell/close: databento close is not an integer string (shape rejected)");
  return BigInt(t);
}
/** A Massive/Polygon decimal close (`String(number)` of the JSON `c`) -> a scaled BigInt at 1e-9. Trailing zeros
 *  are absorbed (SYNTHETIC: "123.450000000" == "123.45"); a real US-equity close has <= 4 decimals, and 1e-9 is finer than any
 *  close, so the 9-digit fraction is exact for our purpose (C-5). Never a raw-string compare. */
export function scaledFromDecimal(decimalStr: string): bigint {
  const t = decimalStr.trim();
  if (!/^-?\d+(\.\d+)?$/.test(t)) throw new Error("bell/close: massive close is not a decimal string (shape rejected)");
  const neg = t.startsWith("-");
  const body = neg ? t.slice(1) : t;
  const [intPart, fracRaw = ""] = body.split(".");
  const frac9 = (fracRaw + "000000000").slice(0, 9); // pad/truncate to 9 fractional digits (1e-9)
  const scaled = BigInt(intPart + frac9);
  return neg ? -scaled : scaled;
}

/** C-6: the earliest UTC instant a session's g_t may be published = 16:00 ET (regular close) of the reference-close
 *  day + 24 h. 16:00 ET is conservative on a half-day (>= its 13:00 ET close + 24 h). Pure; DST via sessions.ts. */
export function earliestPublishUtc(refCloseDateET: string): number {
  const [y, mo, d] = refCloseDateET.split("-").map(Number);
  return etWallClockToUtcMs(y ?? 0, mo ?? 1, d ?? 1, 16, 0, 0) + 24 * 3600 * 1000;
}

/** The UTC calendar date (YYYY-MM-DD) of an ohlcv-1d bar. ts_event = midnight UTC of the bar date (PR-B-DBN);
 *  for a US trading day the bar's UTC date IS the ET trading date (the session runs inside one UTC calendar day),
 *  so this keys the close by the same reference-close day sessions.ts computes (declared assumption). */
export function dbnBarDateUtc(rec: DatabentoOhlcvRecord): string | undefined {
  const ev = rec.hd?.ts_event ?? rec.ts_event;
  if (ev === undefined) return undefined;
  let ms: number;
  if (typeof ev === "number") ms = ev / 1e6; // ns -> ms
  else if (/^\d+$/.test(ev.trim())) ms = Number(BigInt(ev.trim()) / 1_000_000n); // ns string -> ms
  else ms = Date.parse(ev);
  if (!Number.isFinite(ms)) return undefined;
  return new Date(ms).toISOString().slice(0, 10);
}
/** Map single-symbol ohlcv-1d records to {refDate -> scaled-int close string}, dropping UNDEF_PRICE. */
function closeStringsByDate(records: readonly DatabentoOhlcvRecord[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rec of records) {
    const date = dbnBarDateUtc(rec);
    if (date !== undefined && typeof rec.close === "string" && rec.close.trim() !== "" && rec.close.trim() !== DBN_UNDEF_PRICE) out[date] = rec.close;
  }
  return out;
}

/** A cash-close request actually emitted — no key, no value, no close. The canonical, sorted list is sha256'd into
 *  `cash_request_digest` (C-1/C-7): a reproducible proof of which queries ran, safe to publish (outside CLOSE_KEY). */
export interface CashRequest { readonly provider: string; readonly dataset?: string; readonly schema?: string; readonly stype_in?: string; readonly symbols: readonly string[]; readonly start: string; readonly end: string }
export function cashRequestDigest(requests: readonly CashRequest[]): string {
  const canon = requests.map((r) => ({ provider: r.provider,
    ...(r.dataset !== undefined ? { dataset: r.dataset } : {}), ...(r.schema !== undefined ? { schema: r.schema } : {}),
    ...(r.stype_in !== undefined ? { stype_in: r.stype_in } : {}), symbols: [...r.symbols].sort(), start: r.start, end: r.end }));
  canon.sort((a, b) => canonical(a).localeCompare(canonical(b)));
  return createHash("sha256").update(canonical(canon)).digest("hex");
}

const addDaysIso = (dateISO: string, n: number): string =>
  new Date(new Date(dateISO + "T00:00:00Z").getTime() + n * 86_400_000).toISOString().slice(0, 10);

/** Build the timeseries.get_range query (one symbol, start inclusive / end EXCLUSIVE, encoding=json). */
export function databentoGetRangePath(symbol: string, start: string, endExclusive: string): string {
  const q = new URLSearchParams({ dataset: EQUS_DATASET, schema: OHLCV_SCHEMA, stype_in: "raw_symbol", symbols: symbol, start, end: endExclusive, encoding: "json" });
  return `/v0/timeseries.get_range?${q.toString()}`;
}
/** Build the (free) metadata.get_cost query for a set of symbols over [start,endExclusive). Used by the operational
 *  operational validation (get_cost BEFORE any series) and available for a run-time pre-flight. */
export function databentoCostPath(symbols: readonly string[], start: string, endExclusive: string): string {
  const q = new URLSearchParams({ dataset: EQUS_DATASET, schema: OHLCV_SCHEMA, stype_in: "raw_symbol", symbols: [...symbols].join(","), start, end: endExclusive });
  return `/v0/metadata.get_cost?${q.toString()}`;
}

export interface ReadClosesDeps {
  readonly databentoGet: DatabentoGet;
  readonly polygonGet: PolygonGet;
  readonly databentoKey: string;
  readonly polygonKey: string; // "" => the cross cannot run => cash_cross_unavailable (interim Q3(ii) (a))
  readonly faults: TransportFault[];
}
export interface ReferenceCloses {
  readonly closeByUnderlying: Record<string, Record<string, number>>;  // underlying -> refDate -> close (READ, internal)
  readonly crossByUnderlying: Record<string, Record<string, CashCross>>; // underlying -> refDate -> cross status
  readonly close_source: string;
  readonly cash_request_digest: string;
  readonly cash_cross_mismatch_days: string[];    // "UNDERLYING:refDate" (provenance detail, not the per-session counter)
  readonly cash_cross_unavailable_days: string[];
}

/** The L-1/L-2 seam: read the EQUS.SUMMARY close per reference-close day (one range GET per underlying), cross-check
 *  each against Massive range/1/day (adjusted=false) on the SCALED INTEGER (C-5). matched => publish; mismatch =>
 *  NO close returned (the session abstains cash_cross_mismatch downstream); unavailable (no Polygon key / transport)
 *  => publish the Databento close with a cash_cross_unavailable marker (interim Q3(ii) (a)). Never an average, never
 *  a silent pick. The close is never returned as a string, only as the number g_t consumes; the digest guard keeps
 *  it out of every output. */
export async function readReferenceCloses(datesByUnderlying: Readonly<Record<string, readonly string[]>>, deps: ReadClosesDeps): Promise<ReferenceCloses> {
  const closeByUnderlying: Record<string, Record<string, number>> = {};
  const crossByUnderlying: Record<string, Record<string, CashCross>> = {};
  const cash_cross_mismatch_days: string[] = [];
  const cash_cross_unavailable_days: string[] = [];
  const requests: CashRequest[] = [];
  for (const underlying of Object.keys(datesByUnderlying).sort()) {
    const dates = [...(datesByUnderlying[underlying] ?? [])].sort();
    if (dates.length === 0) continue;
    closeByUnderlying[underlying] = {};
    crossByUnderlying[underlying] = {};
    const start = dates[0]!, endExclusive = addDaysIso(dates[dates.length - 1]!, 1);
    requests.push({ provider: "databento.com", dataset: EQUS_DATASET, schema: OHLCV_SCHEMA, stype_in: "raw_symbol", symbols: [underlying], start, end: endExclusive });
    let dbnByDate: Record<string, string> = {};
    try { dbnByDate = closeStringsByDate(await deps.databentoGet(databentoGetRangePath(underlying, start, endExclusive), deps.databentoKey)); }
    catch (e) { deps.faults.push({ provider: "databento.com", status: statusOf(e) }); continue; }
    for (const date of dates) {
      const dbnStr = dbnByDate[date];
      if (dbnStr === undefined) continue; // no official close that day => downstream no_close_ref (absent from the map)
      let dbnScaled: bigint;
      try { dbnScaled = scaledFromDatabento(dbnStr); } catch (e) { deps.faults.push({ provider: "databento.com", status: statusOf(e) }); continue; }
      const dbnClose = Number(dbnStr) / 1e9; // the number g_t consumes (never stored)
      if (!deps.polygonKey) { closeByUnderlying[underlying][date] = dbnClose; crossByUnderlying[underlying][date] = "unavailable"; cash_cross_unavailable_days.push(`${underlying}:${date}`); continue; }
      requests.push({ provider: "polygon.io", symbols: [underlying], start: date, end: date });
      let massiveC: number | undefined;
      try { massiveC = (await deps.polygonGet(`/v2/aggs/ticker/${underlying}/range/1/day/${date}/${date}?adjusted=false`, deps.polygonKey)).results?.[0]?.c; }
      catch (e) { deps.faults.push({ provider: "polygon.io", status: statusOf(e) }); }
      if (typeof massiveC !== "number") { closeByUnderlying[underlying][date] = dbnClose; crossByUnderlying[underlying][date] = "unavailable"; cash_cross_unavailable_days.push(`${underlying}:${date}`); continue; }
      if (dbnScaled === scaledFromDecimal(String(massiveC))) { closeByUnderlying[underlying][date] = dbnClose; crossByUnderlying[underlying][date] = "matched"; }
      else { crossByUnderlying[underlying][date] = "mismatch"; cash_cross_mismatch_days.push(`${underlying}:${date}`); }
    }
  }
  return { closeByUnderlying, crossByUnderlying, close_source: CLOSE_SOURCE, cash_request_digest: cashRequestDigest(requests), cash_cross_mismatch_days, cash_cross_unavailable_days };
}

/** Default Databento timeseries GET — basic auth (key = username, empty password: `Buffer.from(key+":")` base64),
 *  header only, NEVER in the url and NEVER printed (C-10). encoding=json streams NDJSON (one record per line) or a
 *  JSON array; both accepted (the captured raw settles the framing). No `pretty_px` (its render type is unconfirmed —
 *  the default gives scaled-int strings, which C-5 decodes exactly). */
export const databentoGet: DatabentoGet = async (pathAndQuery, apiKey) => {
  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const res = await fetch(`${DATABENTO_HIST}${pathAndQuery}`, { headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) throw new Error(`HTTP ${String(res.status)}`); // no url in the message (C-10)
  return parseDatabentoJson(await res.text());
};
/** Parse a Databento encoding=json body: a JSON array, or NDJSON (one record per line). */
export function parseDatabentoJson(text: string): DatabentoOhlcvRecord[] {
  const t = text.trim();
  if (t === "") return [];
  if (t.startsWith("[")) return JSON.parse(t) as DatabentoOhlcvRecord[];
  return t.split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l) as DatabentoOhlcvRecord);
}

/** Default Massive/Polygon GET — key in the Authorization header, NEVER in the url (?apiKey). Values are used
 *  internally; the close/ADV are never written to any output (ESC-1 c / C-6). */
export const polygonGet: PolygonGet = async (pathAndQuery, apiKey) => {
  const res = await fetch(`https://api.polygon.io${pathAndQuery}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error(`HTTP ${String(res.status)}`);
  return (await res.json()) as { results?: Array<{ v?: number; c?: number; t?: number }> };
};
