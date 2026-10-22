// MONARK Koyomi -- the calibration inventory (lot A1-a; G0 KOYOMI-A tests 1 and 2; plan A1 r2 C-A1-10, act AF-K2). Offline: test 1 runs
// the real script in a child node whose fetch is a stub preloaded with --import (never the network), with synthetic keys built at run
// time (this file carries no credential shape); test 2 drives its exported runInventory in process on stubbed close.ts seams. Every
// price of the fixture is SYNTHETIC (above any price of Bell's four stocks, four decimals, last digit not zero), never a market print.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { KEY_SHAPES } from "../../bell/scripts/bell-publish.mjs";
import { parseDatabentoJson, type DatabentoGet, type PolygonGet } from "../../bell/src/close.ts";
import { etWallClockToUtcMs } from "../../bell/src/sessions.ts";

const HERE = dirname(fileURLToPath(import.meta.url)), OPS = join(HERE, "..", "ops"), INVENTORY = join(OPS, "calib-inventory.mjs");
interface Deps { databentoGet: DatabentoGet; polygonGet: PolygonGet; env: NodeJS.ProcessEnv; nowMs: number; out: (line: string) => void }
const inv = (await import(pathToFileURL(INVENTORY).href)) as { runInventory: (argv: readonly string[], deps: Deps) => Promise<void> };

// ---- The fixture: four underlyings, the nine trading days of [2025-07-01, 2025-07-15) (2025-07-04 is a full closure). ----
const SYMS = ["AAPL", "NVDA", "SPY", "TSLA"];
const DAYS = ["2025-07-01", "2025-07-02", "2025-07-03", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10", "2025-07-11", "2025-07-14"];
const dec = (s: number, i: number, frac: string): string => `${String(5000 + 100 * s + i)}.${frac}`;
const scaled = (d: string): string => d.replace(".", "") + "00000"; // four decimals -> the 1e-9 integer string
const etMidnight = (day: string): number => { const [y, m, d] = day.split("-").map(Number) as [number, number, number]; return etWallClockToUtcMs(y, m, d, 0, 0, 0); };
const ns = (day: string): string => String(BigInt(Date.parse(day + "T00:00:00Z")) * 1_000_000n);
// TSLA: no open on 2025-07-08, a Massive close one unit off on 2025-07-09 (mismatch), a Massive bar without close on 2025-07-10.
const DBN: Record<string, string> = Object.fromEntries(SYMS.map((sym, s) => [sym, DAYS.map((day, i) => JSON.stringify({ ts_event: ns(day),
  ...(sym === "TSLA" && day === "2025-07-08" ? {} : { open: scaled(dec(s, i, "4561")) }), close: scaled(dec(s, i, "1237")), symbol: sym })).join("\n") + "\n"]));
const MASSIVE: Record<string, Record<string, unknown>> = Object.fromEntries(SYMS.map((sym, s) => [sym, Object.fromEntries(DAYS.map((day, i) => {
  const c = sym === "TSLA" && day === "2025-07-09" ? Number(dec(s, i, "1239")) : Number(dec(s, i, "1237"));
  return [day, { results: [{ ...(sym === "TSLA" && day === "2025-07-10" ? {} : { c }), o: Number(dec(s, i, "4561")), t: etMidnight(day), v: 1 }] }];
}))]));
const PRICES = SYMS.flatMap((_, s) => DAYS.flatMap((__, i) => [dec(s, i, "1237"), dec(s, i, "4561"), dec(s, i, "1239")].flatMap((d) => [d, scaled(d), String(Number(d))])));
const COST = "0.0421";
const ARGS = ["--end", "2025-07-15", "--credits-per-window", "37", "--cap-credits", "5000"];
const HEAD = (mode: string): string[] => [`mode=${mode} window_start=2025-07-01 window_end=2025-07-15 symbols=AAPL,NVDA,SPY,TSLA`, `cost_usd=${COST}`,
  "helius_credits_estimate=1036 credits_per_window=37 windows_to_recompute=28", "cap_credits=5000 within_cap=yes"];
const cell = (c: string, p: number, o: number, m: number, mm: number, u: number): string =>
  `cell=${c} pairs=${String(p)} open_present=${String(o)} open_present_early=${String(o)} close_present=${String(p)} cross_matched=${String(m)} cross_mismatch=${String(mm)} cross_unavailable=${String(u)} to_recompute=${String(p)}`;
const CELLS = [...["AAPL", "NVDA", "SPY"].flatMap((s) => [cell(`${s}:night`, 6, 6, 6, 0, 0), cell(`${s}:weekend`, 1, 1, 1, 0, 0)]),
  cell("TSLA:night", 6, 5, 4, 1, 1), cell("TSLA:weekend", 1, 1, 1, 0, 0)];
const pathDay = (path: string): string => /\/day\/(\d{4}-\d{2}-\d{2})\//.exec(path)?.[1] ?? "";
const pathSym = (path: string): string => /\/ticker\/([A-Z]+)\//.exec(path)?.[1] ?? new URLSearchParams(path.split("?")[1]).get("symbols") ?? "";
/** A synthetic secret, built at run time only (no credential shape in this file). */
const fake = (tag: string): string => `${tag}-${"q7".repeat(14)}`;

// The stub preloaded in the child: answers the cost, the series and the Massive bars from the fixture file, logs every request.
const STUB = [
  'import { readFileSync, appendFileSync } from "node:fs";',
  'const fx = JSON.parse(readFileSync(process.env.STUB_FIXTURE, "utf8"));',
  "globalThis.fetch = async (url, init) => {",
  "  const u = new URL(String(url));",
  "  appendFileSync(process.env.STUB_LOG, JSON.stringify({ url: String(url), host: u.host, path: u.pathname, auth: init?.headers?.Authorization ?? null }) + String.fromCharCode(10));",
  '  if (u.host === "hist.databento.com" && u.pathname === "/v0/metadata.get_cost") return new Response(fx.cost);',
  '  if (u.host === "hist.databento.com" && u.pathname === "/v0/timeseries.get_range") return new Response(fx.dbn[u.searchParams.get("symbols")] ?? "");',
  '  const p = u.pathname.split("/");',
  '  if (u.host === "api.polygon.io" && p[1] === "v2" && p[2] === "aggs") return new Response(JSON.stringify(fx.massive[p[4]]?.[p[8]] ?? { results: [] }));',
  '  return new Response("not stubbed", { status: 418 });',
  "};",
].join("\n");

// killer: apps/koyomi/ops/calib-inventory.mjs:82 CONST "String(r.length)" -> "String(r.length / 4)"
test("koyomi_calib_inventory_prints_counts_only", () => {
  const dir = mkdtempSync(join(tmpdir(), "koyomi-inv-1-"));
  try {
    const stub = join(dir, "stub-fetch.mjs"), fixture = join(dir, "fixture.json"), log = join(dir, "requests.jsonl"), entries = join(dir, "entries");
    writeFileSync(stub, STUB);
    writeFileSync(fixture, JSON.stringify({ cost: COST, dbn: DBN, massive: MASSIVE }));
    writeFileSync(log, "");
    const keys = { DATABENTO_API_KEY: fake("dbk"), POLYGON_API_KEY: fake("plk"), HELIUS_API_KEY: fake("hlk") };
    const r = spawnSync(process.execPath, ["--import", pathToFileURL(stub).href, INVENTORY, "--run", "--entries", entries, "--max-cost-usd", "1", ...ARGS],
      { encoding: "utf8", env: { ...process.env, ...keys, STUB_FIXTURE: fixture, STUB_LOG: log } });
    assert.equal(r.status, 0, `the inventory ran (stderr: ${r.stderr})`);
    const lines = r.stdout.split("\n").filter(Boolean);
    const manifest = readFileSync(join(entries, "manifest.json"));
    assert.deepEqual(lines, [...HEAD("run"), ...CELLS, "holiday_pairs_skipped=1", "databento_series=4 massive_requests=36 faults=0",
      `entries=28 manifest_sha256=${createHash("sha256").update(manifest).digest("hex")}`], "the output is the closed list of counts, the cost first");
    // The only decimal number printed is the dollar cost; no price, no key, in either stream.
    for (const l of lines) for (const tok of l.split(" ")) if (/\d\.\d/.test(tok)) assert.ok(tok.startsWith("cost_usd="), `a decimal outside the cost: ${tok}`);
    const streams = r.stdout + r.stderr;
    for (const p of PRICES) assert.ok(!streams.includes(p), `a fixture price reached the output: ${p}`);
    for (const k of Object.values(keys)) assert.ok(!streams.includes(k), "a key reached the output");
    // The private entries: one file per underlying, booleans and strings only (never a number, never a price), hashed in the manifest.
    const m = JSON.parse(manifest.toString("utf8")) as { files: Record<string, string>; entries: number };
    assert.deepEqual(readdirSync(entries).sort(), ["AAPL.jsonl", "NVDA.jsonl", "SPY.jsonl", "TSLA.jsonl", "manifest.json"]);
    assert.equal(m.entries, 28);
    for (const sym of SYMS) {
      const bytes = readFileSync(join(entries, `${sym}.jsonl`));
      assert.equal(m.files[`${sym}.jsonl`], createHash("sha256").update(bytes).digest("hex"), `${sym}: the manifest hashes the file`);
      for (const row of bytes.toString("utf8").split("\n").filter(Boolean)) {
        for (const [k, v] of Object.entries(JSON.parse(row) as Record<string, unknown>)) assert.ok(v === null || typeof v === "boolean" || typeof v === "string", `${sym}: ${k} is a number`);
        for (const p of PRICES) assert.ok(!row.includes(p), `${sym}: a price in the entries`);
      }
    }
    // Keys ride in the header only: never in a url; no Helius host.
    const reqs = readFileSync(log, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as { url: string; host: string; auth: string | null });
    for (const q of reqs) for (const k of Object.values(keys)) assert.ok(!q.url.includes(k), "a key in a url");
    assert.ok(reqs.every((q) => q.host === "hist.databento.com" || q.host === "api.polygon.io"), "only Databento and Massive are asked");
    assert.ok(reqs.every((q) => q.auth !== null), "every request carries its key in the header");
    // No committed file of the lot carries a credential shape (the shapes of the Bell publisher, apps/bell/test/bell-ops.test.ts l.36).
    for (const f of [INVENTORY, join(HERE, "..", "src", "label-read.ts")]) {
      const hits = readFileSync(f, "utf8").split("\n").flatMap((line, i) => KEY_SHAPES.slice(1).filter((re) => re.test(line)).map((re) => `${String(i + 1)} ${re.source}`));
      assert.deepEqual(hits, [], `a credential shape in ${f}`);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// killer: apps/koyomi/ops/calib-inventory.mjs:108 CONST "costUsd > a.maxCost" -> "false"
test("koyomi_calib_inventory_cost_first", async () => {
  const dir = mkdtempSync(join(tmpdir(), "koyomi-inv-2-"));
  const realFetch = globalThis.fetch, fetched: string[] = [];
  globalThis.fetch = (input) => { fetched.push(typeof input === "string" ? input : input instanceof URL ? input.href : input.url); return Promise.reject(new Error("no network in this test")); };
  try {
    const run = async (argv: readonly string[]): Promise<{ events: Array<{ kind: string; sym: string; out: number }>; out: string[]; reads: string[]; error: string | null }> => {
      const events: Array<{ kind: string; sym: string; out: number }> = [], out: string[] = [], reads: string[] = [];
      const held: NodeJS.ProcessEnv = { DATABENTO_API_KEY: fake("dbk"), POLYGON_API_KEY: fake("plk"), HELIUS_API_KEY: fake("hlk") };
      const env = new Proxy(held,
        { get: (t, k) => { reads.push(String(k)); return t[String(k)]; } });
      const databentoGet: DatabentoGet = (path) => {
        const cost = path.startsWith("/v0/metadata.get_cost?");
        events.push({ kind: cost ? "cost" : "series", sym: cost ? "" : pathSym(path), out: out.length });
        return Promise.resolve(cost ? parseDatabentoJson(COST) : parseDatabentoJson(DBN[pathSym(path)] ?? ""));
      };
      const polygonGet: PolygonGet = (path) => { events.push({ kind: "massive", sym: pathSym(path), out: out.length }); return Promise.resolve(MASSIVE[pathSym(path)]?.[pathDay(path)] ?? { results: [] }); };
      let error: string | null = null;
      try { await inv.runInventory(argv, { databentoGet, polygonGet, env, nowMs: Date.UTC(2026, 10, 13), out: (l) => { out.push(l); } }); }
      catch (e) { error = (e as Error).message; }
      return { events, out, reads, error };
    };
    // --cost: one request, the price; then the estimate and the cap; no series.
    const c = await run(["--cost", ...ARGS]);
    assert.equal(c.error, null);
    assert.deepEqual([c.events.map((e) => e.kind), c.out], [["cost"], HEAD("cost")], "--cost asks the price and nothing else");
    // --run: the price is asked first and printed with the estimate and the cap before the first series; one series per underlying.
    const r = await run(["--run", "--entries", join(dir, "e1"), "--max-cost-usd", "1", ...ARGS]);
    assert.equal(r.error, null);
    assert.equal(r.events[0]?.kind, "cost", "the first request is metadata.get_cost");
    assert.equal(r.events.filter((e) => e.kind === "cost").length, 1, "one price request");
    const series = r.events.filter((e) => e.kind === "series");
    assert.deepEqual(series.map((e) => e.sym), SYMS, "exactly one series per underlying (the cross reuses the series read for the label)");
    assert.deepEqual(r.out.slice(0, 4), HEAD("run"), "price, estimate and cap printed first");
    assert.ok(series.every((e) => e.out >= 4), "every series is asked after the price, the estimate and the cap are printed");
    assert.equal(r.events.filter((e) => e.kind === "massive").length, 36);
    // A price above the go: refused after the price is printed, before any series or Massive request.
    const over = await run(["--run", "--entries", join(dir, "e2"), "--max-cost-usd", "0.01", ...ARGS]);
    assert.match(over.error ?? "", /cost_usd .*above --max-cost-usd/);
    assert.deepEqual([over.events.map((e) => e.kind), over.out], [["cost"], HEAD("run")], "a price above the go stops the run before any series");
    // Malformed courses refuse before any request.
    for (const bad of [["--run", "--max-cost-usd", "1", ...ARGS], ["--cost", "--end", "2025-07-15", "--cap-credits", "5000"], ["--cost", ...ARGS, "--ledger", dir]]) {
      const b = await run(bad);
      assert.ok(b.error !== null && b.events.length === 0, `refused before any request: ${bad.join(" ")}`);
    }
    // No Helius in this lot: its key is never read, nothing reaches the network outside the two seams.
    for (const x of [c, r, over]) assert.ok(!x.reads.some((k) => /HELIUS/.test(k)), "the Helius key is never read");
    assert.deepEqual(fetched, [], "no direct fetch");
  } finally { globalThis.fetch = realFetch; rmSync(dir, { recursive: true, force: true }); }
});
