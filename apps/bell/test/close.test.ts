// MONARK Bell — cash reference close oracle (lot -b3b, L-1/L-2). No network: the Databento/Massive seams are
// injected. Named mutants: raw-string compare => red; +24h dropped => red; mismatch swallowed => red.
import { test } from "node:test";
import assert from "node:assert/strict";
import { scaledFromDatabento, scaledFromDecimal, earliestPublishUtc, cashRequestDigest, parseDatabentoJson,
  dbnBarDateUtc, readReferenceCloses, databentoGetRangePath, type DatabentoGet, type PolygonGet } from "../src/close.ts";
import { etWallClockToUtcMs } from "../src/sessions.ts";
import { assertNoClose } from "../src/digest.ts";
import type { TransportFault } from "../src/quorum.ts";

const nsOf = (dateISO: string): string => String(BigInt(new Date(dateISO + "T00:00:00Z").getTime()) * 1_000_000n);

// ---- C-5: equality on the SCALED INTEGER (1e-9), never on the raw string ----
test("bell_cash_cross_scaled_integer_equality", () => {
  // trailing-zero absorption: a decimal with 9 fractional zeros equals the same decimal without (kills a naive
  // string compare "364.270000000" != "364.27").
  assert.equal(scaledFromDecimal("364.270000000"), scaledFromDecimal("364.27"));
  assert.equal(scaledFromDecimal("364.270000000"), 364_270_000_000n);
  // a real difference at the cent IS a mismatch.
  assert.notEqual(scaledFromDecimal("364.27"), scaledFromDecimal("364.28"));
  // the Databento scaled-int STRING and the Massive decimal decode to the SAME scaled BigInt (the cross basis).
  assert.equal(scaledFromDatabento("364270000000"), scaledFromDecimal("364.27"));
  assert.notEqual(scaledFromDatabento("364280000000"), scaledFromDecimal("364.27"));
  // integers and negatives scale correctly.
  assert.equal(scaledFromDecimal("5"), 5_000_000_000n);
  assert.equal(scaledFromDecimal("-1.5"), -1_500_000_000n);
  // shape rejection, never a silent NaN: a decimal is NOT a databento scaled-int string.
  assert.throws(() => scaledFromDatabento("364.27"));
  assert.throws(() => scaledFromDecimal("abc"));
});

// ---- C-6: earliestPublishUtc = 16:00 ET of the refClose day + 24h (DST-correct, conservative on half-days) ----
test("bell_earliest_publish_utc_close_plus_24h", () => {
  // normal EDT day: 16:00 ET = 20:00Z; + 24h => next day 20:00Z.
  assert.equal(earliestPublishUtc("2026-09-18"), etWallClockToUtcMs(2026, 9, 18, 16, 0, 0) + 86_400_000);
  assert.equal(earliestPublishUtc("2026-09-18"), Date.UTC(2026, 8, 19, 20, 0, 0));
  // DST-correct: a winter standard-time (UTC-5) refDate resolves 16:00 ET to 21:00Z, not 20:00Z (mutant: a fixed -4h offset).
  assert.equal(earliestPublishUtc("2026-01-16"), Date.UTC(2026, 0, 17, 21, 0, 0));
  // half-day (2026-11-27, 13:00 ET close): the gate uses 16:00 ET, i.e. >= its 13:00 close + 24h (conservative).
  assert.ok(earliestPublishUtc("2026-11-27") >= etWallClockToUtcMs(2026, 11, 27, 13, 0, 0) + 86_400_000);
  // mutant: +24h -> +0h would drop a full day (the gate must be strictly after the close).
  assert.equal(earliestPublishUtc("2026-09-18") - etWallClockToUtcMs(2026, 9, 18, 16, 0, 0), 86_400_000);
});

// ---- C-1/C-7: cash_request_digest is key-free, value-free, order-stable, and load-bearing ----
test("bell_cash_request_digest_key_free_and_stable", () => {
  const a = { provider: "databento.com", dataset: "EQUS.SUMMARY", schema: "ohlcv-1d", stype_in: "raw_symbol", symbols: ["TSLA"], start: "2026-09-18", end: "2026-09-19" };
  const b = { provider: "polygon.io", symbols: ["TSLA"], start: "2026-09-18", end: "2026-09-18" };
  const d = cashRequestDigest([a, b]);
  assert.match(d, /^[0-9a-f]{64}$/);
  assert.equal(cashRequestDigest([b, a]), d); // canonical + sorted => order-independent
  assert.notEqual(cashRequestDigest([{ ...a, symbols: ["SPY"] }]), cashRequestDigest([a])); // symbol set is load-bearing
  // the digest key is OUTSIDE CLOSE_KEY (C-1): a provenance carrying it does not trip the close-guard.
  assert.doesNotThrow(() => { assertNoClose({ cash_request_digest: d, close_source: "databento-equs-summary" }); });
});

// ---- PR-B-DBN: JSON framing (NDJSON or array) + ts_event (UTC midnight of the bar date) ----
test("bell_databento_json_parse_and_bar_date", () => {
  const rec = { hd: { ts_event: nsOf("2026-09-18") }, close: "364270000000", symbol: "TSLA" };
  const ndjson = JSON.stringify(rec) + "\n" + JSON.stringify({ hd: { ts_event: nsOf("2026-09-17") }, close: "365000000000" });
  assert.equal(parseDatabentoJson(ndjson).length, 2);
  assert.equal(parseDatabentoJson(JSON.stringify([rec])).length, 1);
  assert.equal(parseDatabentoJson("").length, 0);
  assert.equal(dbnBarDateUtc(rec), "2026-09-18"); // ts_event ns under hd
  assert.equal(dbnBarDateUtc({ ts_event: Number(BigInt(nsOf("2026-09-18"))), close: "1" }), "2026-09-18"); // numeric ns at root
  // the range query carries the [lu] params, start inclusive / end exclusive, encoding=json (no pretty_px).
  const path = databentoGetRangePath("TSLA", "2026-09-18", "2026-09-19");
  for (const s of ["dataset=EQUS.SUMMARY", "schema=ohlcv-1d", "stype_in=raw_symbol", "encoding=json", "start=2026-09-18", "end=2026-09-19"]) assert.ok(path.includes(s), s);
  assert.ok(!path.includes("pretty_px"));
});

// ---- L-2: the cross-check seam — matched publishes, mismatch abstains, unavailable single-sources ----
test("bell_read_reference_closes_cross_matched_mismatch_unavailable", async () => {
  const day = "2026-09-18";
  const dbn: DatabentoGet = () => Promise.resolve([{ hd: { ts_event: nsOf(day) }, close: "364270000000" }]);
  const massive = (c: number): PolygonGet => () => Promise.resolve({ results: [{ c }] });
  const deps = (get: PolygonGet, key: string, faults: TransportFault[]): Parameters<typeof readReferenceCloses>[1] =>
    ({ databentoGet: dbn, polygonGet: get, databentoKey: "k", polygonKey: key, faults });

  // matched: Massive 364.27 == Databento scaled int => publish + close_source + digest.
  const m = await readReferenceCloses({ TSLA: [day] }, deps(massive(364.27), "p", []));
  assert.equal(m.crossByUnderlying.TSLA?.[day], "matched");
  assert.equal(m.closeByUnderlying.TSLA?.[day], 364.27);
  assert.equal(m.close_source, "databento-equs-summary");
  assert.match(m.cash_request_digest, /^[0-9a-f]{64}$/);
  assert.deepEqual(m.cash_cross_mismatch_days, []);

  // mismatch: Massive 364.28 => NO close returned (session abstains downstream), day recorded, never an average.
  const mm = await readReferenceCloses({ TSLA: [day] }, deps(massive(364.28), "p", []));
  assert.equal(mm.crossByUnderlying.TSLA?.[day], "mismatch");
  assert.ok(!(day in (mm.closeByUnderlying.TSLA ?? {})));
  assert.deepEqual(mm.cash_cross_mismatch_days, [`TSLA:${day}`]);

  // unavailable (no Polygon key): publish the Databento close with the single-source marker (interim Q3(ii) (a)).
  const unav = await readReferenceCloses({ TSLA: [day] }, deps(() => Promise.reject(new Error("cross must not run")), "", []));
  assert.equal(unav.crossByUnderlying.TSLA?.[day], "unavailable");
  assert.equal(unav.closeByUnderlying.TSLA?.[day], 364.27);
  assert.deepEqual(unav.cash_cross_unavailable_days, [`TSLA:${day}`]);

  // a Databento transport fault => the day is absent (=> downstream no_close_ref), recorded, never fatal.
  const faults: TransportFault[] = [];
  const df = await readReferenceCloses({ TSLA: [day] }, { databentoGet: () => Promise.reject(new Error("HTTP 429")), polygonGet: massive(364.27), databentoKey: "k", polygonKey: "p", faults });
  assert.ok(!(day in (df.closeByUnderlying.TSLA ?? {})));
  assert.equal(faults.length, 1);
});
