// MONARK Bell -- the measure of the two cash pairs, apps/bell/ops/measure-cash-pairs.mjs (BELL-JUSTESSE-1 lot 1d; G0 DJ-5, tests 16, 17
// and 34; plan P1 r2 C1-3). Offline: the GET seams (databentoGet, polygonGet) are stubs that record every call; nothing reaches the
// network and no key exists. The fixture is SYNTHETIC (no market print): closes >= 999 and volumes >= 4e6, a band disjoint from the
// counts (< 1000) and from the fixture's relative gaps (< 1), so a value that leaks into the output is told apart from a count or a gap.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DBN_UNDEF_PRICE, databentoCostPath, databentoGetRangePath } from "../src/close.ts";
import { isTradingDay } from "../src/sessions.ts";
import { advRangePath } from "../src/volume.ts";

const HERE = dirname(fileURLToPath(import.meta.url)), SCRIPT = join(HERE, "..", "ops", "measure-cash-pairs.mjs");
type Bar = { v?: number; c?: number; t?: number };
type Rec = { hd: { ts_event: string }; volume?: string; close?: string };
type Deps = { databentoGet: (p: string, k: string) => Promise<readonly unknown[]>; polygonGet: (p: string, k: string) => Promise<{ results?: Bar[] }>;
  env: Record<string, string>; out: (l: string) => void; err: (l: string) => void; head: string; sleep: (ms: number) => Promise<void> };
const M = (await import(pathToFileURL(SCRIPT).href)) as { measure: (argv: readonly string[], deps: Deps) => Promise<number>; SYMBOLS: readonly string[];
  gitEnv: (env: Record<string, string>) => Record<string, string> };

const DK = ["synthetic", "databento", "key", "1d"].join("-"), PK = ["synthetic", "massive", "key", "1d"].join("-"), HEAD = "c".repeat(40), COST = 0.42;
const ENV = { DATABENTO_API_KEY: DK, POLYGON_API_KEY: PK };
const etMidnight = (d: string): number => Date.parse(`${d}T05:00:00Z`); // 00:00 ET at UTC-5 (01:00 ET at UTC-4 from 2025-03-09): the ET date is d
const lateEt = (d: string): number => Date.parse(`${d}T02:00:00Z`) + 86_400_000; // 21:00 ET of d at UTC-5: UTC date d+1, ET date d (before 2025-03-09)
const dbnTs = (d: string): string => String(BigInt(Date.parse(`${d}T00:00:00Z`)) * 1_000_000n);
/** TSLA, 2025-03 only (synthetic). Massive: 03-05 is dated by its ET date, not its UTC date; 03-08 is a Saturday; 03-13 is read twice;
 *  the 02-28 bar, served in the March answer, is outside its month and dropped, as the ADV leg drops it (collect.ts advBarsFor). */
const MASSIVE: Bar[] = [
  { t: etMidnight("2025-03-03"), v: 10_000_000, c: 1000 }, { t: etMidnight("2025-03-04"), v: 10_001_000, c: 1000.0001 },
  { t: lateEt("2025-03-05"), v: 10_002_000, c: 2000.5 }, { t: etMidnight("2025-03-06"), v: 9_980_000, c: 999 },
  { t: etMidnight("2025-03-07"), v: 10_300_000, c: 1060 }, { t: etMidnight("2025-03-08"), v: 4_000_000, c: 1400 },
  { t: etMidnight("2025-03-10"), v: 9_000_000, c: 1050 }, { t: etMidnight("2025-03-12"), v: 5_000_000, c: 1500 },
  { t: etMidnight("2025-03-13"), v: 6_000_000, c: 1600 }, { t: etMidnight("2025-03-13"), v: 6_100_000, c: 1610 },
  { t: etMidnight("2025-02-28"), v: 4_500_000, c: 1450 }];
/** Databento: 03-10 has no valid close (UNDEF_PRICE) but a volume; 03-11 and 03-13 are on this side only. */
const DATABENTO: Rec[] = [["2025-03-03", "10000000", "1000"], ["2025-03-04", "10000000", "1000"], ["2025-03-05", "10000000", "2000"],
  ["2025-03-06", "10000000", "1000"], ["2025-03-07", "10000000", "1000"], ["2025-03-10", "10000000", null], ["2025-03-11", "7000000", "1700"],
  ["2025-03-13", "8000000", "1800"]].map(([d, v, c]) => ({ hd: { ts_event: dbnTs(d ?? "") }, volume: v ?? "", close: c === null ? DBN_UNDEF_PRICE : `${c ?? ""}000000000` }));
const TSLA_MARCH = advRangePath("TSLA", { year: 2025, month: 3 });
const http = (n: number): Error => new Error(`HTTP ${String(n)}`); // the plain error form of close.ts's GET seams

type Call = { side: "databento" | "massive"; path: string; key: string };
/** Faults: massive(path, attempt) fails one attempt of one request; databento(n) fails the n-th paid series. */
type Faults = { massive?: (path: string, attempt: number) => Error | undefined; databento?: (series: number) => Error | undefined };
/** Data: the symbol the fixture is served for (TSLA by default), or the paid records of each symbol (malformed bodies). */
type Data = { sym?: string; records?: (sym: string) => readonly unknown[] };
function seams(cost: () => unknown = () => COST, faults: Faults = {}, data: Data = {}): { deps: Deps; calls: Call[]; out: string[]; err: string[] } {
  const calls: Call[] = [], out: string[] = [], err: string[] = [], attempts = new Map<string, number>();
  const sym = data.sym ?? "TSLA", march = advRangePath(sym, { year: 2025, month: 3 });
  let series = 0;
  const deps: Deps = {
    databentoGet: (path, key) => {
      calls.push({ side: "databento", path, key });
      if (path.startsWith("/v0/metadata.get_cost?")) return Promise.resolve([cost()]);
      series += 1;
      const f = faults.databento?.(series);
      if (f) return Promise.reject(f);
      const s = new URLSearchParams(path.split("?")[1]).get("symbols") ?? "";
      return Promise.resolve(data.records ? data.records(s) : s === sym ? DATABENTO : []);
    },
    polygonGet: (path, key) => {
      calls.push({ side: "massive", path, key });
      const a = (attempts.get(path) ?? 0) + 1;
      attempts.set(path, a);
      const f = faults.massive?.(path, a);
      if (f) return Promise.reject(f);
      return Promise.resolve(path === march ? { results: MASSIVE } : {});
    },
    env: ENV, out: (l) => out.push(l), err: (l) => err.push(l), head: HEAD, sleep: () => Promise.resolve() };
  return { deps, calls, out, err };
}
const RUN = ["--run", "--confirm-cost-usd", String(COST)];
const tokens = (l: string): Array<[string, string]> => l.split(" ").map((t) => { const i = t.indexOf("="); return [t.slice(0, i), t.slice(i + 1)]; });
const ZERO = { read_massive: "0", read_databento: "0", paired: "0", equal: "0", massive_gt: "0", massive_lt: "0", over_1bp: "0", over_10bp: "0",
  over_100bp: "0", over_500bp: "0", median_rel: "none", max_rel: "none", only_massive: "0", only_databento: "0", off_calendar_massive: "0",
  off_calendar_databento: "0", dup_massive: "0", dup_databento: "0", unread_massive: "0", unread_databento: "0" };
/** The two lines of the symbol the fixture is served for (test 34 derives each count by hand in its messages). */
const FIXTURE_VOLUME = { ...ZERO, read_massive: "8", read_databento: "8", paired: "6", equal: "1", massive_gt: "3", massive_lt: "2",
  over_1bp: "4", over_10bp: "3", over_100bp: "2", over_500bp: "1", median_rel: "1.1000e-3", max_rel: "1.0000e-1", only_massive: "2", only_databento: "2",
  off_calendar_massive: "1", dup_massive: "1" };
const FIXTURE_CLOSE = { ...ZERO, read_massive: "8", read_databento: "7", paired: "5", equal: "1", massive_gt: "3", massive_lt: "1",
  over_1bp: "3", over_10bp: "1", over_100bp: "1", over_500bp: "1", median_rel: "2.5000e-4", max_rel: "6.0000e-2", only_massive: "3", only_databento: "2",
  off_calendar_massive: "1", dup_massive: "1", unread_databento: "1", "differ_1e-9": "4" };
const pairOf = (lines: readonly string[], pair: string, sym: string): Record<string, string> =>
  Object.fromEntries(tokens(lines.find((l) => l.startsWith(`pair=${pair} symbol=${sym} `)) ?? "").slice(2));
/** The printed method line (pinned by test 34): every reading of the counts, and where the script follows the course or departs from it. */
const METHOD = "method=v1 rel=abs(massive-databento)/databento over=strict median=middle_or_mean_of_two equal_close=same_at_1e-9_as_c14 "
  + "bars=month_requests_as_the_adv_leg c14_bars=one_day_requests_not_read_here outside_month=dropped_as_the_adv_leg "
  + "retry_massive=withRetry_as_the_adv_leg retry_databento=none_as_the_close_leg";
const STRING_KEYS: Record<string, RegExp> = { "measure-cash-pairs": /^v1$/, mode: /^run$/, head: /^[0-9a-f]{40}$/, symbols: /^AAPL,NVDA,SPY,TSLA$/,
  window: /^2025-01-01\.\.2026-09-30$/, confirmed: /^yes$/, partial: /^yes$/, pair: /^(volume|close)$/, symbol: /^(AAPL|NVDA|SPY|TSLA)$/ };
/** Every token of every line but the pinned method line: a closed string key, the price, a relative gap below 1, or a count below 1000. */
function countsOnly(lines: readonly string[]): void {
  for (const l of lines.filter((x) => x !== METHOD)) {
    for (const [k, v] of tokens(l)) {
      const where = `${k}=${v} in "${l.slice(0, 40)}"`;
      if (k in STRING_KEYS) assert.match(v, STRING_KEYS[k] ?? /^$/, where);
      else if (k === "cost_usd") assert.equal(v, String(COST), where);
      else if (k === "median_rel" || k === "max_rel") assert.ok(v === "none" || (/^\d\.\d{4}e[+-]\d+$/.test(v) && Number(v) < 1), `a relative gap, never a value: ${where}`);
      else assert.ok(/^\d+$/.test(v) && Number(v) < 1000, `a count, never a value: ${where}`);
    }
  }
}

// killer: apps/bell/ops/measure-cash-pairs.mjs:82 CONST "Math.abs(m - d) / d" -> "m"
test("bell_measure_cash_pairs_prints_counts_only", async () => {
  const s = seams();
  assert.equal(await M.measure(RUN, s.deps), 0, s.err.join("\n"));
  assert.equal(s.out.length, 12, "header, cost, method, confirmation, four volume lines, four close lines");
  countsOnly(s.out);
  const text = [...s.out, ...s.err].join("\n"), printed = new Set(text.split(/[\s=]+/)); // every printed token, key or value
  // killer: apps/bell/ops/measure-cash-pairs.mjs:66 CONST "rels.push(r)" -> "rels.push(Number(m))"
  const values = [...MASSIVE.flatMap((b) => [b.v ?? 0, b.c ?? 0]), ...DATABENTO.flatMap((r) => [Number(r.volume), Number(r.close) / 1e9])].filter((x) => x >= 999);
  for (const x of values) for (const r of [String(x), x.toFixed(2), x.toExponential(4), x.toExponential(3), String(BigInt(Math.round(x * 1e9)))]) assert.ok(!printed.has(r), `no market value printed (${r})`);
  assert.ok(!text.includes(DK) && !text.includes(PK), "no key printed");
  assert.ok(s.calls.every((c) => !c.path.includes(DK) && !c.path.includes(PK) && c.key === (c.side === "databento" ? DK : PK)), "the key goes to the seam as its argument, never into a path");
  const src = readFileSync(SCRIPT, "utf8");
  assert.ok(!/\bfetch\s*\(/.test(src) && !/\benv\.[A-Z_]*KEY/.test(src), "the script never calls fetch nor reads a key itself");
  assert.match(src, /^import \{[^}]*\bdatabentoGet\b[^}]*\bpolygonGet\b[^}]*\breadCashKeys\b[^}]*\} from "\.\.\/src\/close\.ts";$/m, "the GET seams and the key reader of close.ts");
  // killer: apps/bell/ops/measure-cash-pairs.mjs:152 CONST "status=${statusOf(e)" -> "key=${polygonKey} status=${statusOf(e)"
  // killer: apps/bell/ops/measure-cash-pairs.mjs:160 CONST "status=${statusOf(e)" -> "key=${databentoKey} status=${statusOf(e)"
  for (const [f, stop] of [[seams(undefined, { massive: (p) => (p === TSLA_MARCH ? http(429) : undefined) }), "stop fault side=massive symbol=TSLA month=2025-03 status=HTTP_429"],
    [seams(undefined, { databento: (n) => (n === 3 ? http(503) : undefined) }), "stop fault side=databento symbol=SPY status=HTTP_503"]] as const) {
    assert.equal(await M.measure(RUN, f.deps), 4, stop);
    assert.deepEqual(f.err, [stop], "a series fault names its side, symbol, month and status, and nothing else");
    countsOnly(f.out);
    const t = [...f.out, ...f.err].join("\n");
    assert.ok(!t.includes(DK) && !t.includes(PK), `no key printed on a fault (${stop})`);
  }
  // killer: apps/bell/ops/measure-cash-pairs.mjs:172 CONST "|API_KEY|_KEY$|TOKEN|SECRET" -> ""
  // killer: apps/bell/ops/measure-cash-pairs.mjs:172 CONST "|_URL$" -> ""
  assert.deepEqual(M.gitEnv({ PATH: "p", GIT_DIR: "g", DATABENTO_API_KEY: DK, POLYGON_API_KEY: PK, HELIUS_API_KEY: "h", BELL_SOLANA_RPC: "r", HELIUS_RPC_URL: "u" }), { PATH: "p" },
    "git rev-parse runs without the caller's GIT_* variables and without any key");
});

// killer: apps/bell/ops/measure-cash-pairs.mjs:143 CONST "Number(confirm) !== cost" -> "Number(confirm) < cost"
test("bell_measure_cash_pairs_cost_first", async () => {
  const cost = databentoCostPath(M.SYMBOLS, "2025-01-01", "2026-10-01");
  const c = seams();
  assert.equal(await M.measure(["--cost"], c.deps), 0);
  assert.deepEqual(c.calls, [{ side: "databento", path: cost, key: DK }], "--cost asks the price and nothing else");
  assert.deepEqual(c.out.slice(1), ["cost_usd=0.42"]);
  // killer: apps/bell/ops/measure-cash-pairs.mjs:143 CONST "confirm === undefined || !CONFIRM_FORM.test(confirm) || Number(confirm) !== cost" -> "false"
  for (const argv of [["--run"], ["--run", "--confirm-cost-usd", "0.41"], ["--run", "--confirm-cost-usd", "0.43"], ["--run", "--confirm-cost-usd", "0.50"],
    ["--run", "--confirm-cost-usd"], ["--run", "--confirm-cost-usd", ""]]) {
    const r = seams();
    assert.equal(await M.measure(argv, r.deps), 3, `stopped: ${argv.join(" ")}`);
    assert.deepEqual(r.calls.map((x) => x.path), [cost], `the price is read and printed, then no series without its confirmation (${argv.join(" ")})`);
    assert.deepEqual(r.out.slice(1), ["cost_usd=0.42"]);
    assert.match(r.err.join("\n"), /^stop cost_unconfirmed /m);
  }
  // killer: apps/bell/ops/measure-cash-pairs.mjs:143 CONST "!CONFIRM_FORM.test(confirm) || " -> ""
  for (const [price, confirm, code] of [[0, "", 3], [0, "0x0", 3], [0, " 0", 3], [0, "0", 0], [1e-7, "1e-7", 0], [COST, "0.420", 0]] as Array<[number, string, number]>) {
    const r = seams(() => price);
    assert.equal(await M.measure(["--run", "--confirm-cost-usd", confirm], r.deps), code, `price ${String(price)}, confirmation "${confirm}": the price as --cost prints it, in decimal form`);
  }
  // killer: apps/bell/ops/measure-cash-pairs.mjs:139 CONST "catch (e) { partial(); " -> "catch (e) { "
  // killer: apps/bell/ops/measure-cash-pairs.mjs:140 CONST "{ partial(); " -> "{ "
  for (const [what, f] of [["a failed cost query", () => { throw new Error("HTTP 503"); }], ["no number", () => "0.42"]] as Array<[string, () => unknown]>) {
    const r = seams(f);
    assert.equal(await M.measure(RUN, r.deps), 3, what);
    assert.deepEqual(r.calls.map((x) => x.path), [cost], `${what}: no series`);
    assert.match(r.err.join("\n"), /^stop cost_unavailable/m, what);
    assert.deepEqual(r.out.slice(1), ["partial=yes paid_series_asked=0 paid_series_received=0 requests_massive=0 retries_massive=0"], `${what}: the progress at zero, as at every fault exit`);
  }
  for (const env of [{ POLYGON_API_KEY: PK }, { DATABENTO_API_KEY: DK }]) {
    const r = seams();
    assert.equal(await M.measure(RUN, { ...r.deps, env }), 2);
    assert.deepEqual(r.calls, [], "a missing key: nothing is sent");
  }
  // killer: apps/bell/ops/measure-cash-pairs.mjs:138 CONST "costPath()" -> "databentoCostPath(SYMBOLS, WINDOW.start, WINDOW.last)"
  const g = seams();
  assert.equal(await M.measure(RUN, g.deps), 0);
  assert.deepEqual(g.calls[0], { side: "databento", path: cost, key: DK }, "the price first");
  const q = (p: string): URLSearchParams => new URLSearchParams(p.split("?")[1]), cq = q(cost), cs = new Set((cq.get("symbols") ?? "").split(","));
  const series = g.calls.slice(1).filter((x) => x.side === "databento");
  assert.equal(series.length, 4);
  for (const x of series) {
    const sq = q(x.path);
    assert.ok(cs.has(sq.get("symbols") ?? "") && (sq.get("start") ?? "") >= (cq.get("start") ?? "~") && (sq.get("end") ?? "~") <= (cq.get("end") ?? ""), `inside the priced request: ${x.path}`);
  }
  assert.equal(g.calls.filter((x) => x.side === "massive").length, 84);
  // killer: apps/bell/ops/measure-cash-pairs.mjs:152 CONST "return 4; }" -> "continue; }"
  const fm = seams(undefined, { massive: (p) => (p === TSLA_MARCH ? http(429) : undefined) });
  assert.equal(await M.measure(RUN, fm.deps), 4, "a Massive fault left after the course's four tries stops the measure");
  assert.equal(fm.calls.filter((x) => x.path === TSLA_MARCH).length, 4, "withRetry: four tries of a 429");
  assert.deepEqual(fm.calls.filter((x) => x.side === "databento").map((x) => x.path), [cost], "no paid series after a Massive fault");
  assert.deepEqual(fm.out.slice(3), ["partial=yes paid_series_asked=0 paid_series_received=0 requests_massive=66 retries_massive=3"], "the progress, in counts; no pair line");
  // killer: apps/bell/ops/measure-cash-pairs.mjs:160 CONST "return 4; }" -> "records[sym] = []; continue; }"
  const fd = seams(undefined, { databento: (n) => (n === 3 ? http(429) : undefined) });
  assert.equal(await M.measure(RUN, fd.deps), 4, "a Databento fault stops the measure");
  assert.equal(fd.calls.filter((x) => x.side === "databento").length, 4, "the price and three series: no fourth series after the fault");
  assert.equal(fd.out[3], "partial=yes paid_series_asked=3 paid_series_received=2 requests_massive=84 retries_massive=0", "the paid series asked, never lost in silence");
  assert.deepEqual(fd.out.slice(4).map((l) => l.split(" ").slice(0, 2).join(" ")), ["pair=volume symbol=AAPL", "pair=volume symbol=NVDA", "pair=close symbol=AAPL", "pair=close symbol=NVDA"],
    "the counts of the series already paid are printed");
  // killer: apps/bell/ops/measure-cash-pairs.mjs:133 CONST "pairLines(Object.keys(records), bars, records)" -> "pairLines(Object.keys(records), Object.fromEntries(SYMBOLS.map((s) => [s, []])), records)"
  const fa = seams(undefined, { databento: (n) => (n === 4 ? http(503) : undefined) }, { sym: "AAPL" }); // the fixture served for AAPL, read first
  assert.equal(await M.measure(RUN, fa.deps), 4);
  assert.equal(fa.out[3], "partial=yes paid_series_asked=4 paid_series_received=3 requests_massive=84 retries_massive=0");
  assert.deepEqual([pairOf(fa.out, "volume", "AAPL"), pairOf(fa.out, "close", "AAPL")], [FIXTURE_VOLUME, FIXTURE_CLOSE], "a partial pair line counts both sides, whole");
  assert.equal(fa.out.length, 10, "header, cost, method, progress, then the volume and close lines of AAPL, NVDA and SPY");
  // killer: apps/bell/ops/measure-cash-pairs.mjs:163 CONST "catch (e) { computeFault(e); return 4; }" -> "catch (e) { throw e; }"
  for (const [what, records, error] of [["a null record", [null], "TypeError"], ["a ts_event outside the Date range", [{ hd: { ts_event: 1e30 }, volume: "1", close: "1000000000000" }], "RangeError"]] as Array<[string, unknown[], string]>) {
    const r = seams(undefined, {}, { records: (s) => (s === "TSLA" ? records : DATABENTO) });
    const code = await M.measure(RUN, r.deps).catch((e: unknown) => `a rejection (${e instanceof Error ? e.name : "non-error"})`);
    assert.equal(code, 4, `${what}: a fault after the paid series exits 4, never by a rejection`);
    assert.deepEqual(r.out.slice(3), ["partial=yes paid_series_asked=4 paid_series_received=4 requests_massive=84 retries_massive=0"], `${what}: the progress, never lost in silence`);
    assert.deepEqual(r.err, [`stop fault side=compute error=${error}`], `${what}: the error type only, never a value nor a key`);
  }
});

// killer: apps/bell/ops/measure-cash-pairs.mjs:151 CONST "advRangePath(sym, p)" -> "advRangePath(sym, p).replace(\"adjusted=false\", \"adjusted=true\")"
test("bell_measure_cash_pairs_sign_median_and_course_paths", async () => {
  const s = seams(undefined, { massive: (p, a) => (p === TSLA_MARCH && a === 1 ? http(429) : undefined) }); // one 429, then the answer
  assert.equal(await M.measure(RUN, s.deps), 0, s.err.join("\n"));
  assert.deepEqual(M.SYMBOLS, ["AAPL", "NVDA", "SPY", "TSLA"], "the four underlyings of Bell's pools");
  const months = Array.from({ length: 21 }, (_, i) => ({ year: 2025 + Math.floor(i / 12), month: (i % 12) + 1 }));
  // killer: apps/bell/ops/measure-cash-pairs.mjs:151 CONST "await withRetry(() => deps.polygonGet(advRangePath(sym, p), polygonKey), retry)" -> "await deps.polygonGet(advRangePath(sym, p), polygonKey)"
  assert.deepEqual(s.calls.filter((c) => c.side === "massive").map((c) => c.path), M.SYMBOLS.flatMap((u) => months.map((p) => advRangePath(u, p))).flatMap((p) => (p === TSLA_MARCH ? [p, p] : [p])),
    "the course's request, retried once after a 429 as the course retries it (withRetry)");
  assert.deepEqual(s.calls.filter((c) => c.side === "databento").slice(1).map((c) => c.path), M.SYMBOLS.map((u) => databentoGetRangePath(u, "2025-01-01", "2026-10-01")));
  let td = 0;
  for (let ms = Date.parse("2025-01-01T00:00:00Z"); ms <= Date.parse("2026-09-30T00:00:00Z"); ms += 86_400_000) if (isTradingDay(new Date(ms).toISOString().slice(0, 10))) td += 1;
  assert.equal(s.out[2], METHOD, "the method line says each reading and each departure from the course");
  // killer: apps/bell/ops/measure-cash-pairs.mjs:155 CONST "d < first || d > last" -> "false"
  assert.equal(s.out[3], `confirmed=yes trading_days=${String(td)} requests_massive=84 retries_massive=1 requests_databento=4 empty_months_massive=83 outside_month_massive=1`);
  const got = (pair: string, sym: string): Record<string, string> => Object.fromEntries(tokens(s.out.find((l) => l.startsWith(`pair=${pair} symbol=${sym} `)) ?? "").slice(2));
  // killer: apps/bell/ops/measure-cash-pairs.mjs:67 ROR "r > t" -> "r >= t"
  // killer: apps/bell/ops/measure-cash-pairs.mjs:71 CONST "(rels[mid - 1] + rels[mid]) / 2" -> "rels[mid]"
  // killer: apps/bell/ops/measure-cash-pairs.mjs:81 CONST "a > b ? 1 : -1" -> "a < b ? 1 : -1"
  // killer: apps/bell/ops/measure-cash-pairs.mjs:89 CONST "barDateET(b.t)" -> "new Date(b.t).toISOString().slice(0, 10)"
  assert.deepEqual(got("volume", "TSLA"), { ...ZERO, read_massive: "8", read_databento: "8", paired: "6", equal: "1", massive_gt: "3", massive_lt: "2",
    over_1bp: "4", over_10bp: "3", over_100bp: "2", over_500bp: "1", median_rel: "1.1000e-3", max_rel: "1.0000e-1", only_massive: "2", only_databento: "2",
    off_calendar_massive: "1", dup_massive: "1" }, "rel 1e-4 exactly is not over 1 bp; even count: the mean of the two middle gaps");
  assert.deepEqual(got("close", "TSLA"), { ...ZERO, read_massive: "8", read_databento: "7", paired: "5", equal: "1", massive_gt: "3", massive_lt: "1",
    over_1bp: "3", over_10bp: "1", over_100bp: "1", over_500bp: "1", median_rel: "2.5000e-4", max_rel: "6.0000e-2", only_massive: "3", only_databento: "2",
    off_calendar_massive: "1", dup_massive: "1", unread_databento: "1", "differ_1e-9": "4" }, "1e-7 apart is not equal at 1e-9; rel 1e-3 exactly is not over 10 bp; odd count: the middle gap");
  for (const sym of ["AAPL", "NVDA", "SPY"]) {
    assert.deepEqual(got("volume", sym), ZERO, sym);
    assert.deepEqual(got("close", sym), { ...ZERO, "differ_1e-9": "0" }, sym);
  }
});
