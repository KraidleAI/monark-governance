// MONARK Koyomi -- the label reader (lot A1-a; G0 KOYOMI-A DK-6, C-3 of its checkpoint-1, test 48; plan A1 r2 C-A1-13). Offline: the
// Databento and Massive seams of apps/bell/src/close.ts are stubbed, no request leaves the process. The fixture body below is the one
// the carnet's test 5 (bell_carnet_label_is_koyomi_label, G0 BELL-CARNET-1) consumes: it is pinned by its sha256, so a copy elsewhere
// proves it is the same body by the same digest. Every price in it is SYNTHETIC: above any price of Bell's four stocks, four decimals,
// last digit not zero (the rule of the fixture close purge), never a market print. Each Massive bar carries a `t` dated its own day in
// New York time, so the cross of lot 1c of the justesse (only the bar dated the requested day is compared) still matches it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parseDatabentoJson, readReferenceCloses, databentoGetRangePath, scaledFromDecimal, type DatabentoGet, type PolygonGet } from "../../bell/src/close.ts";
import { etWallClockToUtcMs } from "../../bell/src/sessions.ts";
import type { TransportFault } from "../../bell/src/quorum.ts";
import { labelsFromRecords, readDatabentoLabels } from "../src/label-read.ts";

const ns = (iso: string): string => String(BigInt(Date.parse(iso)) * 1_000_000n);
// One record per line (Databento encoding=json NDJSON). The five dates carry the four ways a date is keyed (ts_event as a nanosecond
// string, hd.ts_event, a JSON number, an ISO string) and the four states of a field (present, absent, UNDEF_PRICE, shape rejected);
// the last three lines repeat a date, as close.ts reads repeats: an empty close (2026-09-14) and an UNDEF_PRICE close (2026-09-16) never
// erase the close read before them, a close of refused shape (2026-09-15) does (close.ts keeps it, then refuses its shape).
const BODY = [
  `{"ts_event":"${ns("2026-09-14T00:00:00Z")}","open":"4012345900000","close":"4004400700000","symbol":"TSLA"}`,
  `{"hd":{"ts_event":"${ns("2026-09-15T00:00:00Z")}"},"open":"4021111300000","close":"4016222900000","symbol":"TSLA"}`,
  `{"ts_event":${ns("2026-09-16T00:00:00Z")},"open":"9223372036854775807","close":"4027333100000","symbol":"TSLA"}`,
  `{"ts_event":"2026-09-17T00:00:00Z","close":"9223372036854775807","symbol":"TSLA"}`,
  `{"ts_event":"${ns("2026-09-18T00:00:00Z")}","open":"4033.5557","close":"4031.0003","symbol":"TSLA"}`,
  `{"ts_event":"${ns("2026-09-14T00:00:00Z")}","close":"","symbol":"TSLA"}`,
  `{"ts_event":"${ns("2026-09-15T00:00:00Z")}","close":"4016.2229","symbol":"TSLA"}`,
  `{"ts_event":"${ns("2026-09-16T00:00:00Z")}","close":"9223372036854775807","symbol":"TSLA"}`,
].join("\n") + "\n";
const BODY_SHA256 = "7d9f939233a36373591c69b8585e254797eb9b863c5b4e22ad7d2674ea10aef5";
// A second body, kept apart from the pinned one (review m-3): one date carries two VALID closes and two valid opens in a row, so the
// rule "the last valid value of a date replaces the earlier one" (close.ts keeps the last valid close) is replayed against Bell.
const BODY_LAST = [
  `{"ts_event":"${ns("2026-09-21T00:00:00Z")}","open":"4044444100000","close":"4040404100000","symbol":"TSLA"}`,
  `{"ts_event":"${ns("2026-09-21T00:00:00Z")}","open":"4055555300000","close":"4050505300000","symbol":"TSLA"}`,
].join("\n") + "\n";
const DATES = ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18"];
// The Massive daily bar of each date: `t` = 00:00 New York time of that date, `c` equal to the Databento close (synthetic).
const MASSIVE_C: Record<string, number> = { "2026-09-14": 4004.4007, "2026-09-16": 4027.3331 };
const massiveBar = (date: string): { results: Array<{ c?: number; t: number; v: number }> } => {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const c = MASSIVE_C[date];
  return { results: [{ ...(c === undefined ? {} : { c }), t: etWallClockToUtcMs(y, m, d, 0, 0, 0), v: 1 }] };
};

// killer: apps/koyomi/src/label-read.ts:32 CONST "dbnBarDateUtc(rec)" -> "String(rec.ts_event).slice(0, 10)"
test("koyomi_label_reader_close_equals_bell_reader", async () => {
  assert.equal(createHash("sha256").update(BODY).digest("hex"), BODY_SHA256, "the fixture body is the pinned one (the carnet's test 5 pins the same digest)");
  // Koyomi's reader, through the seam: one request, the range path of close.ts, the key passed to the seam and never elsewhere.
  const asked: string[] = [];
  const dbn: DatabentoGet = (path) => { asked.push(path); return Promise.resolve(parseDatabentoJson(BODY)); };
  const koyomi = await readDatabentoLabels("TSLA", "2026-09-14", "2026-09-19", { databentoGet: dbn, databentoKey: "k" });
  assert.deepEqual(asked, [databentoGetRangePath("TSLA", "2026-09-14", "2026-09-19")], "one range request, built by close.ts");
  assert.deepEqual(await readDatabentoLabels("TSLA", "2026-09-14", "2026-09-19", { databentoGet: dbn, databentoKey: "" }), {}, "no key: no request (the keyless rule of close.ts)");
  assert.equal(asked.length, 1, "the keyless call emitted no request");
  assert.deepEqual(labelsFromRecords(parseDatabentoJson(BODY)), koyomi, "the seam and the pure reader agree");
  // Bell's reader on the same body, with and without the Massive cross (matched where the bar equals the close).
  for (const polygonKey of ["", "p"]) {
    const faults: TransportFault[] = [];
    const poly: PolygonGet = (path) => Promise.resolve(massiveBar(/\/day\/(\d{4}-\d{2}-\d{2})\//.exec(path)?.[1] ?? ""));
    const bell = await readReferenceCloses({ TSLA: DATES }, { databentoGet: () => Promise.resolve(parseDatabentoJson(BODY)), polygonGet: poly, databentoKey: "k", polygonKey, faults });
    const bellCloses = bell.closeByUnderlying.TSLA ?? {};
    const koyomiCloseDates = DATES.filter((d) => koyomi[d]?.close_state === "present");
    assert.deepEqual(koyomiCloseDates, Object.keys(bellCloses).sort(), `the same dates carry a close (polygon key ${polygonKey === "" ? "absent" : "present"})`);
    for (const d of koyomiCloseDates) {
      const k = koyomi[d]!.close!;
      assert.equal(Number(String(k)) / 1e9, bellCloses[d], `${d}: Koyomi's close, read the way Bell reads it, is Bell's close`);
      assert.equal(scaledFromDecimal(String(bellCloses[d])), k, `${d}: equal to the integer at 1e-9`);
    }
    assert.deepEqual(koyomiCloseDates, ["2026-09-14", "2026-09-16"], "the two dates whose last non-empty close is valid");
    if (polygonKey !== "") assert.deepEqual(bell.crossByUnderlying.TSLA, { "2026-09-14": "matched", "2026-09-16": "matched" }, "the dated Massive bars match");
  }
  // The open: present, UNDEF_PRICE refused, absent, shape rejected; never a float.
  assert.deepEqual(DATES.map((d) => [koyomi[d]?.open_state, koyomi[d]?.open ?? null]), [
    ["present", 4_012_345_900_000n], ["present", 4_021_111_300_000n], ["undef", null], ["absent", null], ["rejected", null]]);
  assert.deepEqual(DATES.map((d) => koyomi[d]?.close_state), ["present", "rejected", "present", "undef", "rejected"]);
  // Two valid values on one date: the last one, for the open as for the close, and the close equals Bell's (review m-3).
  // killer: apps/koyomi/src/label-read.ts:26 CONST "next.state === \"present\" || " -> ""
  const last = labelsFromRecords(parseDatabentoJson(BODY_LAST))["2026-09-21"];
  const bellLast = await readReferenceCloses({ TSLA: ["2026-09-21"] }, { databentoGet: () => Promise.resolve(parseDatabentoJson(BODY_LAST)), polygonGet: () => Promise.resolve({ results: [] }), databentoKey: "k", polygonKey: "", faults: [] });
  assert.deepEqual([last?.open, last?.close], [4_055_555_300_000n, 4_050_505_300_000n], "the last valid open and close of the date");
  assert.equal(Number(String(last?.close)) / 1e9, bellLast.closeByUnderlying.TSLA?.["2026-09-21"], "Bell keeps the same close");
});
