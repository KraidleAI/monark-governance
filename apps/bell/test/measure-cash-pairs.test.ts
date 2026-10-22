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
  env: Record<string, string>; out: (l: string) => void; err: (l: string) => void; head: string };
const M = (await import(pathToFileURL(SCRIPT).href)) as { measure: (argv: readonly string[], deps: Deps) => Promise<number>; SYMBOLS: readonly string[] };

const DK = ["synthetic", "databento", "key", "1d"].join("-"), PK = ["synthetic", "massive", "key", "1d"].join("-"), HEAD = "c".repeat(40), COST = 0.42;
const ENV = { DATABENTO_API_KEY: DK, POLYGON_API_KEY: PK };
const etMidnight = (d: string): number => Date.parse(`${d}T05:00:00Z`); // 00:00 ET at UTC-5 (01:00 ET at UTC-4 from 2025-03-09): the ET date is d
const lateEt = (d: string): number => Date.parse(`${d}T02:00:00Z`) + 86_400_000; // 21:00 ET of d at UTC-5: UTC date d+1, ET date d (before 2025-03-09)
const dbnTs = (d: string): string => String(BigInt(Date.parse(`${d}T00:00:00Z`)) * 1_000_000n);
/** TSLA, 2025-03 only (synthetic). Massive: 03-05 is dated by its ET date, not its UTC date; 03-08 is a Saturday; 03-13 is read twice. */
const MASSIVE: Bar[] = [
  { t: etMidnight("2025-03-03"), v: 10_000_000, c: 1000 }, { t: etMidnight("2025-03-04"), v: 10_001_000, c: 1000.0001 },
  { t: lateEt("2025-03-05"), v: 10_002_000, c: 2000.5 }, { t: etMidnight("2025-03-06"), v: 9_980_000, c: 999 },
  { t: etMidnight("2025-03-07"), v: 10_300_000, c: 1060 }, { t: etMidnight("2025-03-08"), v: 4_000_000, c: 1400 },
  { t: etMidnight("2025-03-10"), v: 9_000_000, c: 1050 }, { t: etMidnight("2025-03-12"), v: 5_000_000, c: 1500 },
  { t: etMidnight("2025-03-13"), v: 6_000_000, c: 1600 }, { t: etMidnight("2025-03-13"), v: 6_100_000, c: 1610 }];
/** Databento: 03-10 has no valid close (UNDEF_PRICE) but a volume; 03-11 and 03-13 are on this side only. */
const DATABENTO: Rec[] = [["2025-03-03", "10000000", "1000"], ["2025-03-04", "10000000", "1000"], ["2025-03-05", "10000000", "2000"],
  ["2025-03-06", "10000000", "1000"], ["2025-03-07", "10000000", "1000"], ["2025-03-10", "10000000", null], ["2025-03-11", "7000000", "1700"],
  ["2025-03-13", "8000000", "1800"]].map(([d, v, c]) => ({ hd: { ts_event: dbnTs(d ?? "") }, volume: v ?? "", close: c === null ? DBN_UNDEF_PRICE : `${c ?? ""}000000000` }));

type Call = { side: "databento" | "massive"; path: string; key: string };
function seams(cost: () => unknown = () => COST): { deps: Deps; calls: Call[]; out: string[]; err: string[] } {
  const calls: Call[] = [], out: string[] = [], err: string[] = [];
  const deps: Deps = {
    databentoGet: (path, key) => {
      calls.push({ side: "databento", path, key });
      if (path.startsWith("/v0/metadata.get_cost?")) return Promise.resolve([cost()]);
      return Promise.resolve(new URLSearchParams(path.split("?")[1]).get("symbols") === "TSLA" ? DATABENTO : []);
    },
    polygonGet: (path, key) => {
      calls.push({ side: "massive", path, key });
      return Promise.resolve(path.startsWith("/v2/aggs/ticker/TSLA/range/1/day/2025-03-01/") ? { results: MASSIVE } : {});
    },
    env: ENV, out: (l) => out.push(l), err: (l) => err.push(l), head: HEAD };
  return { deps, calls, out, err };
}
const RUN = ["--run", "--confirm-cost-usd", String(COST)];
const tokens = (l: string): Array<[string, string]> => l.split(" ").map((t) => { const i = t.indexOf("="); return [t.slice(0, i), t.slice(i + 1)]; });
const ZERO = { read_massive: "0", read_databento: "0", paired: "0", equal: "0", massive_gt: "0", massive_lt: "0", over_1bp: "0", over_10bp: "0",
  over_100bp: "0", over_500bp: "0", median_rel: "none", max_rel: "none", only_massive: "0", only_databento: "0", off_calendar_massive: "0",
  off_calendar_databento: "0", dup_massive: "0", dup_databento: "0", unread_massive: "0", unread_databento: "0" };

// killer: apps/bell/ops/measure-cash-pairs.mjs:81 CONST "Math.abs(m - d) / d" -> "m"
test("bell_measure_cash_pairs_prints_counts_only", async () => {
  const s = seams();
  assert.equal(await M.measure(RUN, s.deps), 0, s.err.join("\n"));
  assert.equal(s.out.length, 11, "header, cost, confirmation, four volume lines, four close lines");
  const STRING_KEYS: Record<string, RegExp> = { "measure-cash-pairs": /^v1$/, mode: /^run$/, head: /^[0-9a-f]{40}$/, symbols: /^AAPL,NVDA,SPY,TSLA$/,
    window: /^2025-01-01\.\.2026-09-30$/, confirmed: /^yes$/, pair: /^(volume|close)$/, symbol: /^(AAPL|NVDA|SPY|TSLA)$/ };
  for (const l of s.out) {
    for (const [k, v] of tokens(l)) {
      const where = `${k}=${v} in "${l.slice(0, 40)}"`;
      if (k in STRING_KEYS) assert.match(v, STRING_KEYS[k] ?? /^$/, where);
      else if (k === "cost_usd") assert.equal(v, String(COST), where);
      else if (k === "median_rel" || k === "max_rel") assert.ok(v === "none" || (/^\d\.\d{4}e[+-]\d+$/.test(v) && Number(v) < 1), `a relative gap, never a value: ${where}`);
      else assert.ok(/^\d+$/.test(v) && Number(v) < 1000, `a count, never a value: ${where}`);
    }
  }
  const text = [...s.out, ...s.err].join("\n"), printed = new Set(text.split(/[\s=]+/)); // every printed token, key or value
  // killer: apps/bell/ops/measure-cash-pairs.mjs:65 CONST "rels.push(r)" -> "rels.push(Number(m))"
  const values = [...MASSIVE.flatMap((b) => [b.v ?? 0, b.c ?? 0]), ...DATABENTO.flatMap((r) => [Number(r.volume), Number(r.close) / 1e9])].filter((x) => x >= 999);
  for (const x of values) for (const r of [String(x), x.toFixed(2), x.toExponential(4), x.toExponential(3), String(BigInt(Math.round(x * 1e9)))]) assert.ok(!printed.has(r), `no market value printed (${r})`);
  assert.ok(!text.includes(DK) && !text.includes(PK), "no key printed");
  assert.ok(s.calls.every((c) => !c.path.includes(DK) && !c.path.includes(PK) && c.key === (c.side === "databento" ? DK : PK)), "the key goes to the seam as its argument, never into a path");
  const src = readFileSync(SCRIPT, "utf8");
  assert.ok(!/\bfetch\s*\(/.test(src) && !/\benv\.[A-Z_]*KEY/.test(src), "the script never calls fetch nor reads a key itself");
  assert.match(src, /^import \{[^}]*\bdatabentoGet\b[^}]*\bpolygonGet\b[^}]*\breadCashKeys\b[^}]*\} from "\.\.\/src\/close\.ts";$/m, "the GET seams and the key reader of close.ts");
});

// killer: apps/bell/ops/measure-cash-pairs.mjs:107 CONST "confirm === undefined || Number(confirm) !== cost" -> "false"
test("bell_measure_cash_pairs_cost_first", async () => {
  const cost = databentoCostPath(M.SYMBOLS, "2025-01-01", "2026-10-01");
  const c = seams();
  assert.equal(await M.measure(["--cost"], c.deps), 0);
  assert.deepEqual(c.calls, [{ side: "databento", path: cost, key: DK }], "--cost asks the price and nothing else");
  assert.deepEqual(c.out.slice(1), ["cost_usd=0.42"]);
  for (const argv of [["--run"], ["--run", "--confirm-cost-usd", "0.41"], ["--run", "--confirm-cost-usd"]]) {
    const r = seams();
    assert.equal(await M.measure(argv, r.deps), 3, `stopped: ${argv.join(" ")}`);
    assert.deepEqual(r.calls.map((x) => x.path), [cost], `the price is read and printed, then no series without its confirmation (${argv.join(" ")})`);
    assert.deepEqual(r.out.slice(1), ["cost_usd=0.42"]);
    assert.match(r.err.join("\n"), /^stop cost_unconfirmed /m);
  }
  for (const [what, f] of [["a failed cost query", () => { throw new Error("HTTP 503"); }], ["no number", () => "0.42"]] as Array<[string, () => unknown]>) {
    const r = seams(f);
    assert.equal(await M.measure(RUN, r.deps), 3, what);
    assert.deepEqual(r.calls.map((x) => x.path), [cost], `${what}: no series`);
    assert.match(r.err.join("\n"), /^stop cost_unavailable/m, what);
  }
  for (const env of [{ POLYGON_API_KEY: PK }, { DATABENTO_API_KEY: DK }]) {
    const r = seams();
    assert.equal(await M.measure(RUN, { ...r.deps, env }), 2);
    assert.deepEqual(r.calls, [], "a missing key: nothing is sent");
  }
  // killer: apps/bell/ops/measure-cash-pairs.mjs:102 CONST "costPath()" -> "databentoCostPath(SYMBOLS, WINDOW.start, WINDOW.last)"
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
});

// killer: apps/bell/ops/measure-cash-pairs.mjs:113 CONST "advRangePath(sym, p)" -> "advRangePath(sym, p).replace(\"adjusted=false\", \"adjusted=true\")"
test("bell_measure_cash_pairs_sign_median_and_course_paths", async () => {
  const s = seams();
  assert.equal(await M.measure(RUN, s.deps), 0, s.err.join("\n"));
  assert.deepEqual(M.SYMBOLS, ["AAPL", "NVDA", "SPY", "TSLA"], "the four underlyings of Bell's pools");
  const months = Array.from({ length: 21 }, (_, i) => ({ year: 2025 + Math.floor(i / 12), month: (i % 12) + 1 }));
  assert.deepEqual(s.calls.filter((c) => c.side === "massive").map((c) => c.path), M.SYMBOLS.flatMap((u) => months.map((p) => advRangePath(u, p))), "the course's request");
  assert.deepEqual(s.calls.filter((c) => c.side === "databento").slice(1).map((c) => c.path), M.SYMBOLS.map((u) => databentoGetRangePath(u, "2025-01-01", "2026-10-01")));
  let td = 0;
  for (let ms = Date.parse("2025-01-01T00:00:00Z"); ms <= Date.parse("2026-09-30T00:00:00Z"); ms += 86_400_000) if (isTradingDay(new Date(ms).toISOString().slice(0, 10))) td += 1;
  assert.equal(s.out[2], `confirmed=yes trading_days=${String(td)} requests_massive=84 requests_databento=4 empty_months_massive=83`);
  const got = (pair: string, sym: string): Record<string, string> => Object.fromEntries(tokens(s.out.find((l) => l.startsWith(`pair=${pair} symbol=${sym} `)) ?? "").slice(2));
  // killer: apps/bell/ops/measure-cash-pairs.mjs:66 ROR "r > t" -> "r >= t"
  // killer: apps/bell/ops/measure-cash-pairs.mjs:70 CONST "(rels[mid - 1] + rels[mid]) / 2" -> "rels[mid]"
  // killer: apps/bell/ops/measure-cash-pairs.mjs:80 CONST "a > b ? 1 : -1" -> "a < b ? 1 : -1"
  // killer: apps/bell/ops/measure-cash-pairs.mjs:88 CONST "barDateET(b.t)" -> "new Date(b.t).toISOString().slice(0, 10)"
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
