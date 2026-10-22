// MONARK Koyomi -- the calibration inventory (lot A1-a; G0 KOYOMI-A tests 1 and 2; plan A1 r2 C-A1-10, act AF-K2). Offline: test 1 runs
// the real script in a child node whose fetch is a stub preloaded with --import (never the network), with synthetic keys built at run
// time (this file carries no credential shape); test 2 drives its exported runInventory in process on stubbed close.ts seams. Every
// price of the fixture is SYNTHETIC (above any price of Bell's four stocks, four decimals, last digit not zero), never a market print.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { KEY_SHAPES } from "../../bell/scripts/bell-publish.mjs";
import { parseDatabentoJson, type DatabentoGet, type PolygonGet } from "../../bell/src/close.ts";
import { etWallClockToUtcMs } from "../../bell/src/sessions.ts";

const HERE = dirname(fileURLToPath(import.meta.url)), OPS = join(HERE, "..", "ops"), INVENTORY = join(OPS, "calib-inventory.mjs");
const REPO = join(HERE, "..", "..", "..");
interface Deps { databentoGet: DatabentoGet; polygonGet: PolygonGet; env: NodeJS.ProcessEnv; nowMs: number; out: (line: string) => void }
type Row = Record<string, unknown>;
const inv = (await import(pathToFileURL(INVENTORY).href)) as { runInventory: (argv: readonly string[], deps: Deps) => Promise<void>;
  refusalText: (e: unknown) => string; checkEntry: (row: Row) => Row; G_STATES: readonly string[] };

// ---- The fixture: four underlyings over a hand calendar, the weekdays of [2025-07-01, 2025-08-29) without the full closure of
// 2025-07-04 (42 days, written here without sessions.ts). Test 1 reads the whole window, across the 2025-08-26 of NE-2; test 2 reads
// [2025-07-01, 2025-07-15). TSLA departs from the others on days that are a D only or a D' only of a counted pair, so that reading
// D' for D (or D for D') changes a count: no close on 2025-07-01 (a D only), no open on 2025-07-03 (a D' only: its own gap is a
// holiday), a Massive close one unit off on 2025-07-07 (a D only), a Massive bar without close on 2025-07-03 (a D' only). ----
const SYMS = ["AAPL", "NVDA", "SPY", "TSLA"];
const DAYS: string[] = [];
for (let t = Date.UTC(2025, 6, 1); t < Date.UTC(2025, 7, 29); t += 86_400_000) {
  const day = new Date(t).toISOString().slice(0, 10), dow = new Date(t).getUTCDay();
  if (dow !== 0 && dow !== 6 && day !== "2025-07-04") DAYS.push(day);
}
const dec = (s: number, i: number, frac: string): string => `${String(5000 + 100 * s + i)}.${frac}`;
const scaled = (d: string): string => d.replace(".", "") + "00000"; // four decimals -> the 1e-9 integer string
const etMidnight = (day: string): number => { const [y, m, d] = day.split("-").map(Number) as [number, number, number]; return etWallClockToUtcMs(y, m, d, 0, 0, 0); };
const ns = (day: string): string => String(BigInt(Date.parse(day + "T00:00:00Z")) * 1_000_000n);
const isT = (sym: string, day: string, at: string): boolean => sym === "TSLA" && day === at;
const DBN: Record<string, string> = Object.fromEntries(SYMS.map((sym, s) => [sym, DAYS.map((day, i) => JSON.stringify({ ts_event: ns(day),
  ...(isT(sym, day, "2025-07-03") ? {} : { open: scaled(dec(s, i, "4561")) }), ...(isT(sym, day, "2025-07-01") ? {} : { close: scaled(dec(s, i, "1237")) }),
  symbol: sym })).join("\n") + "\n"]));
const MASSIVE: Record<string, Record<string, unknown>> = Object.fromEntries(SYMS.map((sym, s) => [sym, Object.fromEntries(DAYS.map((day, i) => {
  const c = Number(dec(s, i, isT(sym, day, "2025-07-07") ? "1239" : "1237"));
  return [day, { results: [{ ...(isT(sym, day, "2025-07-03") ? {} : { c }), o: Number(dec(s, i, "4561")), t: etMidnight(day), v: 1 }] }];
}))]));
const PRICES = SYMS.flatMap((_, s) => DAYS.flatMap((__, i) => [dec(s, i, "1237"), dec(s, i, "4561"), dec(s, i, "1239")].flatMap((d) => [d, scaled(d), String(Number(d))])));
const COST = "0.0421";
const END1 = "2025-08-29", END2 = "2025-07-15";
const ARGS = (end: string): string[] => ["--end", end, "--credits-per-window", "37", "--cap-credits", "5000"];
const HEAD = (mode: string, end: string, windows: number): string[] => [`mode=${mode} window_start=2025-07-01 window_end=${end} symbols=AAPL,NVDA,SPY,TSLA`,
  `cost_usd=${COST}`, `helius_credits_estimate=${String(windows * 37)} credits_per_window=37 windows_to_recompute=${String(windows)}`,
  `cap_credits=5000 within_cap=${windows * 37 <= 5000 ? "yes" : "no"}`];
const cell = (c: string, ...n: number[]): string => {
  const [p, o, oe, cl, m, mm, u] = n.map(String) as [string, string, string, string, string, string, string];
  return `cell=${c} pairs=${p} open_present=${o} open_present_early=${oe} close_present=${cl} cross_matched=${m} cross_mismatch=${mm} cross_unavailable=${u} to_recompute=${p}`;
};
// Counted by hand on the hand calendar: 33 nights and 7 weekends per underlying (2025-07-03 -> 07-07 is a holiday gap, 2025-08-28 has
// no D' in the window); 30 nights and the 7 weekends have their D' before 2025-08-26.
const CELLS = [...["AAPL", "NVDA", "SPY"].flatMap((s) => [cell(`${s}:night`, 33, 33, 30, 33, 33, 0, 0), cell(`${s}:weekend`, 7, 7, 7, 7, 7, 0, 0)]),
  cell("TSLA:night", 33, 32, 29, 32, 31, 1, 0), cell("TSLA:weekend", 7, 7, 7, 7, 7, 0, 0)];
const entry = (cellName: string, d: string, next: string, open: boolean, close: boolean, cross: string): string => JSON.stringify({ schema: "koyomi-calib-entry-v1",
  symbol: "TSLA", cell: cellName, d, d_next: next, open_present: open, close_present: close, cross, g: null, g_state: "pending" });
const pathDay = (path: string): string => /\/day\/(\d{4}-\d{2}-\d{2})\//.exec(path)?.[1] ?? "";
const pathSym = (path: string): string => /\/ticker\/([A-Z]+)\//.exec(path)?.[1] ?? new URLSearchParams(path.split("?")[1]).get("symbols") ?? "";
/** A synthetic secret, built at run time only (no credential shape in this file). */
const fake = (tag: string): string => `${tag}-${"q7".repeat(14)}`;
const KEYS = (): NodeJS.ProcessEnv => ({ DATABENTO_API_KEY: fake("dbk"), POLYGON_API_KEY: fake("plk"), HELIUS_API_KEY: fake("hlk") });

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

// killer: apps/koyomi/ops/calib-inventory.mjs:120 CONST "String(r.length)" -> "String(r.length / 4)"
test("koyomi_calib_inventory_prints_counts_only", () => {
  const dir = mkdtempSync(join(tmpdir(), "koyomi-inv-1-"));
  try {
    const stub = join(dir, "stub-fetch.mjs"), log = join(dir, "requests.jsonl");
    writeFileSync(stub, STUB);
    const child = (cost: string, entries: string): SpawnSyncReturns<string> => {
      const fixture = join(dir, `fixture-${String(Math.random()).slice(2)}.json`);
      writeFileSync(fixture, JSON.stringify({ cost, dbn: DBN, massive: MASSIVE }));
      writeFileSync(log, "");
      return spawnSync(process.execPath, ["--import", pathToFileURL(stub).href, INVENTORY, "--run", "--entries", entries, "--max-cost-usd", "1", ...ARGS(END1)],
        { encoding: "utf8", env: { ...process.env, ...KEYS(), STUB_FIXTURE: fixture, STUB_LOG: log } });
    };
    const entries = join(dir, "entries"), keys = KEYS();
    const r = child(COST, entries);
    assert.equal(r.status, 0, `the inventory ran (stderr: ${r.stderr})`);
    const lines = r.stdout.split("\n").filter(Boolean);
    const manifest = readFileSync(join(entries, "manifest.json"));
    assert.deepEqual(lines, [...HEAD("run", END1, 160), ...CELLS, "holiday_pairs_skipped=1", "databento_series=4 massive_requests=167 faults=0",
      `entries=160 manifest_sha256=${createHash("sha256").update(manifest).digest("hex")}`], "the output is the closed list of counts, the cost first");
    // The only decimal number printed is the dollar cost; no price, no key, in either stream.
    for (const l of lines) for (const tok of l.split(" ")) if (/\d\.\d/.test(tok)) assert.ok(tok.startsWith("cost_usd="), `a decimal outside the cost: ${tok}`);
    const streams = r.stdout + r.stderr;
    for (const p of PRICES) assert.ok(!streams.includes(p), `a fixture price reached the output: ${p}`);
    for (const k of Object.values(keys)) assert.ok(k !== undefined && !streams.includes(k), "a key reached the output");
    // The private entries: one file per underlying, booleans, strings and null only (never a number, never a price), hashed in the manifest.
    const m = JSON.parse(manifest.toString("utf8")) as { files: Record<string, string>; entries: number };
    assert.deepEqual(readdirSync(entries).sort(), ["AAPL.jsonl", "NVDA.jsonl", "SPY.jsonl", "TSLA.jsonl", "manifest.json"]);
    assert.equal(m.entries, 160);
    for (const sym of SYMS) {
      const bytes = readFileSync(join(entries, `${sym}.jsonl`));
      assert.equal(m.files[`${sym}.jsonl`], createHash("sha256").update(bytes).digest("hex"), `${sym}: the manifest hashes the file`);
      for (const row of bytes.toString("utf8").split("\n").filter(Boolean)) {
        for (const [k, v] of Object.entries(JSON.parse(row) as Row)) assert.ok(v === null || typeof v === "boolean" || typeof v === "string", `${sym}: ${k} is a number`);
        for (const p of PRICES) assert.ok(!row.includes(p), `${sym}: a price in the entries`);
      }
    }
    // The values of the entries the freeze reads: the open of D', the close of D, the cross of D, g not yet computed (review m-1, m-5).
    const tsla = readFileSync(join(entries, "TSLA.jsonl"), "utf8").split("\n").filter(Boolean);
    for (const want of [entry("night", "2025-07-01", "2025-07-02", true, false, "none"), entry("night", "2025-07-02", "2025-07-03", false, true, "matched"),
      entry("night", "2025-07-07", "2025-07-08", true, true, "mismatch"), entry("weekend", "2025-08-22", "2025-08-25", true, true, "matched"),
      entry("night", "2025-08-27", "2025-08-28", true, true, "matched")]) assert.ok(tsla.includes(want), `TSLA.jsonl holds ${want}`);
    // Keys ride in the header only: never in a url; no Helius host.
    const reqs = readFileSync(log, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as { url: string; host: string; auth: string | null });
    for (const q of reqs) for (const k of Object.values(keys)) assert.ok(k !== undefined && !q.url.includes(k), "a key in a url");
    assert.ok(reqs.every((q) => q.host === "hist.databento.com" || q.host === "api.polygon.io"), "only Databento and Massive are asked");
    assert.ok(reqs.every((q) => q.auth !== null), "every request carries its key in the header");
    // A provider body that is not one number: stderr names the refusal in a fixed form, never a fragment of that body (review m-4).
    // killer: apps/koyomi/ops/calib-inventory.mjs:66 CONST ": COST_SHAPE); }" -> ": e.message); }"
    const bad = child("<html>BODY-OF-THE-PROVIDER</html>", join(dir, "entries-bad"));
    assert.deepEqual([bad.status, bad.stderr], [1, "koyomi/calib-inventory: refused: metadata.get_cost did not answer one number (shape refused)\n"]);
    assert.ok(!bad.stdout.includes("BODY") && !bad.stdout.includes("cost_usd"), "nothing of the body in stdout, and no price line");
    // The schema of an entry (review m-5): g is null or the integer at 1e-9 as a string, g_state a closed list (pending, computed and
    // the five abstention codes Bell passes through, DK-8); a row outside it is refused before it is written.
    assert.deepEqual(inv.G_STATES, ["pending", "computed", "no_fill_in_window", "no_close_ref", "cash_cross_mismatch", "rebase_unverified", "corporate_action_in_window"]);
    const ok = JSON.parse(tsla[0] ?? "{}") as Row;
    assert.deepEqual(inv.checkEntry(ok), ok);
    assert.doesNotThrow(() => inv.checkEntry({ ...ok, g: "-1234567", g_state: "computed" }));
    // killer: apps/koyomi/ops/calib-inventory.mjs:59 CONST "row.g !== null" -> "false"
    for (const wrong of [{ ...ok, g: "12" }, { ...ok, g: 12, g_state: "computed" }, { ...ok, g: "1.5", g_state: "computed" }, { ...ok, g_state: "to_recompute" },
      { ...ok, g_state: "no_close_ref", g: "7" }, { ...ok, extra: true }]) assert.throws(() => inv.checkEntry(wrong), /calibration entry/, JSON.stringify(wrong));
    // No committed file of the lot carries a credential shape: the shapes of the Bell publisher and the two ops-only shapes of
    // apps/bell/test/bell-ops.test.ts l.33 (a key in a query string, a Basic credential) (review n-6).
    const shapes = [...KEY_SHAPES.slice(1), /[?&](?:api[-_]?key|apikey|key|token)=[^&\s"'$]{12,}/i, /\bBasic\s+[A-Za-z0-9+/]{16,}={0,2}/];
    for (const f of [INVENTORY, join(HERE, "..", "src", "label-read.ts")]) {
      const hits = readFileSync(f, "utf8").split("\n").flatMap((line, i) => shapes.filter((re) => re.test(line)).map((re) => `${String(i + 1)} ${re.source}`));
      assert.deepEqual(hits, [], `a credential shape in ${f}`);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// killer: apps/koyomi/ops/calib-inventory.mjs:146 CONST "costUsd > a.maxCost" -> "false"
test("koyomi_calib_inventory_cost_first", async () => {
  const dir = mkdtempSync(join(tmpdir(), "koyomi-inv-2-")), inRepo = join(REPO, "apps", "koyomi", "never-written-entries");
  const realFetch = globalThis.fetch, fetched: string[] = [];
  globalThis.fetch = (input) => { fetched.push(typeof input === "string" ? input : input instanceof URL ? input.href : input.url); return Promise.reject(new Error("no network in this test")); };
  try {
    const run = async (argv: readonly string[], opt: { env?: NodeJS.ProcessEnv; failSeries?: boolean } = {}): Promise<{ events: Array<{ kind: string; sym: string; out: number }>;
      out: string[]; reads: string[]; error: string | null; thrown: unknown }> => {
      const events: Array<{ kind: string; sym: string; out: number }> = [], out: string[] = [], reads: string[] = [];
      const env = new Proxy(opt.env ?? KEYS(), { get: (t, k) => { reads.push(String(k)); return t[String(k)]; } });
      const databentoGet: DatabentoGet = (path) => {
        const cost = path.startsWith("/v0/metadata.get_cost?");
        events.push({ kind: cost ? "cost" : "series", sym: cost ? "" : pathSym(path), out: out.length });
        if (!cost && opt.failSeries === true) return Promise.reject(new Error("HTTP 503"));
        return Promise.resolve(cost ? parseDatabentoJson(COST) : parseDatabentoJson(DBN[pathSym(path)] ?? ""));
      };
      const polygonGet: PolygonGet = (path) => { events.push({ kind: "massive", sym: pathSym(path), out: out.length }); return Promise.resolve(MASSIVE[pathSym(path)]?.[pathDay(path)] ?? { results: [] }); };
      let error: string | null = null, thrown: unknown = null;
      try { await inv.runInventory(argv, { databentoGet, polygonGet, env, nowMs: Date.UTC(2026, 10, 13), out: (l) => { out.push(l); } }); }
      catch (e) { error = (e as Error).message; thrown = e; }
      return { events, out, reads, error, thrown };
    };
    // --cost: one request, the price; then the estimate and the cap; no series.
    const c = await run(["--cost", ...ARGS(END2)]);
    assert.equal(c.error, null);
    assert.deepEqual([c.events.map((e) => e.kind), c.out], [["cost"], HEAD("cost", END2, 28)], "--cost asks the price and nothing else");
    // --run: the price is asked first and printed with the estimate and the cap before the first series; one series per underlying.
    const r = await run(["--run", "--entries", join(dir, "e1"), "--max-cost-usd", "1", ...ARGS(END2)]);
    assert.equal(r.error, null);
    assert.equal(r.events[0]?.kind, "cost", "the first request is metadata.get_cost");
    assert.equal(r.events.filter((e) => e.kind === "cost").length, 1, "one price request");
    const series = r.events.filter((e) => e.kind === "series");
    assert.deepEqual(series.map((e) => e.sym), SYMS, "exactly one series per underlying (the cross reuses the series read for the label)");
    assert.deepEqual(r.out.slice(0, 4), HEAD("run", END2, 28), "price, estimate and cap printed first");
    assert.ok(series.every((e) => e.out >= 4), "every series is asked after the price, the estimate and the cap are printed");
    assert.equal(r.events.filter((e) => e.kind === "massive").length, 35);
    // A price above the go: refused after the price is printed, before any series or Massive request; the refusal is printed as is.
    const over = await run(["--run", "--entries", join(dir, "e2"), "--max-cost-usd", "0.01", ...ARGS(END2)]);
    assert.match(over.error ?? "", /cost_usd .*above --max-cost-usd/);
    assert.deepEqual([over.events.map((e) => e.kind), over.out], [["cost"], HEAD("run", END2, 28)], "a price above the go stops the run before any series");
    assert.equal(inv.refusalText(over.thrown), over.error, "a refusal of the inventory is printed as written");
    // Malformed courses refuse before any request.
    for (const bad of [["--run", "--max-cost-usd", "1", ...ARGS(END2)], ["--cost", "--end", END2, "--cap-credits", "5000"], ["--cost", ...ARGS(END2), "--ledger", dir]]) {
      const b = await run(bad);
      assert.ok(b.error !== null && b.events.length === 0, `refused before any request: ${bad.join(" ")}`);
    }
    // Each refusal of the inventory, before any request and with nothing written (review m-2).
    // killer: apps/koyomi/ops/calib-inventory.mjs:135 CONST "!databentoKey" -> "false"
    const noKey = await run(["--cost", ...ARGS(END2)], { env: { POLYGON_API_KEY: fake("plk") } });
    assert.ok(/Databento key is absent/.test(noKey.error ?? "") && noKey.events.length === 0, "no Databento key: refused, no keyless request");
    // killer: apps/koyomi/ops/calib-inventory.mjs:130 CONST "assertOutsideRepo(a.entries, " -> "void (a.entries, "
    const under = await run(["--run", "--entries", inRepo, "--max-cost-usd", "1", ...ARGS(END2)]);
    assert.ok(/under the repository/.test(under.error ?? "") && under.events.length === 0 && !existsSync(inRepo), "--entries under the repository: refused, nothing created");
    // killer: apps/koyomi/ops/calib-inventory.mjs:132 CONST "readdirSync(a.entries).length > 0" -> "false"
    const full = join(dir, "full");
    mkdirSync(full);
    writeFileSync(join(full, "keep.txt"), "kept");
    const notEmpty = await run(["--run", "--entries", full, "--max-cost-usd", "1", ...ARGS(END2)]);
    assert.ok(/not empty/.test(notEmpty.error ?? "") && notEmpty.events.length === 0, "--entries not empty: refused");
    assert.deepEqual([readdirSync(full), readFileSync(join(full, "keep.txt"), "utf8")], [["keep.txt"], "kept"], "the folder is left as it was");
    // killer: apps/koyomi/ops/calib-inventory.mjs:89 CONST "a.mode === \"cost\" && (a.entries" -> "false && (a.entries"
    for (const extra of [["--entries", join(dir, "e3")], ["--max-cost-usd", "1"]]) {
      const b = await run(["--cost", ...extra, ...ARGS(END2)]);
      assert.ok(/--cost takes neither/.test(b.error ?? "") && b.events.length === 0 && !existsSync(join(dir, "e3")), `--cost with ${extra[0] ?? ""}: refused`);
    }
    // Every series in fault (review n-2): one fault per series, the counts printed, no manifest, and the course ends refused.
    // killer: apps/koyomi/ops/calib-inventory.mjs:172 CONST "seriesFailed > 0" -> "false"
    const down = await run(["--run", "--entries", join(dir, "e4"), "--max-cost-usd", "1", ...ARGS(END2)], { failSeries: true });
    assert.match(down.error ?? "", /^4 of 4 Databento series failed: no manifest written/);
    assert.equal(down.out.at(-1), "databento_series=4 massive_requests=0 faults=4");
    assert.ok(!existsSync(join(dir, "e4", "manifest.json")), "no manifest after a failed series");
    // An error that is not a refusal of the inventory: its type, or the clean HTTP status of close.ts, never its message (review m-4).
    // killer: apps/koyomi/ops/calib-inventory.mjs:41 CONST "e instanceof Error ? e.name : typeof e" -> "e instanceof Error ? e.message : typeof e"
    assert.deepEqual([inv.refusalText(new SyntaxError('Unexpected token \'<\', "<html>BODY"... is not valid JSON')), inv.refusalText(new Error("HTTP 503")), inv.refusalText("text")],
      ["SyntaxError (message withheld: it may quote a provider's answer)", "HTTP 503", "string (message withheld: it may quote a provider's answer)"]);
    // No Helius in this lot: its key is never read, nothing reaches the network outside the two seams.
    for (const x of [c, r, over, down]) assert.ok(!x.reads.some((k) => /HELIUS/.test(k)), "the Helius key is never read");
    assert.deepEqual(fetched, [], "no direct fetch");
  } finally { globalThis.fetch = realFetch; rmSync(dir, { recursive: true, force: true }); rmSync(inRepo, { recursive: true, force: true }); }
});
