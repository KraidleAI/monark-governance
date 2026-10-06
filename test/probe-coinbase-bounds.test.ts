// test/probe-coinbase-bounds.test.ts -- lot COINBASE-ADD7-1 (ADR 0006 addendum 7 P1 to P3): scripts/probe-coinbase-bounds.mjs, the
// boundary probe of the Coinbase candles on BTC-USD, run in-process through an injected fetch that builds each page in memory from a
// complete made-up series, under each reading of the bounds of the signature table (the definitions of the 144 runs of
// test/record-coinbase-candles.test.ts, written here again): no server and no network, the global fetch a tripwire. The made-up values
// of every candle, the malformed bodies included (G2-2 of the G2), and the value of one header carry marks (MARKS), searched in every byte
// that the probe writes and in every line that it prints, never found (P2: prices stripped before any write). One test copies the recorder
// and the probe under the OS temp directory, the origin of the recorder changed: both refuse it before any request (correction 4 of
// RECHERCHES: the check of the host bears load). Two tests run the recorder in a child (G03 and G02 of the campaign of the fusion): through a
// junction under --preserve-symlinks-main, then imported by a process whose argv[1] names an absent path. These three tests kill mutants of a
// file that exists at the base, so they live here, in the test file of a module that the lot adds (red-proof refuses a test green at the
// base: Q-A7-11). One child process runs the command line with no argument (a usage stop). Each test names, on the line above it, the
// production mutation that reddens it (scripts/red-proof.mjs convention). One test bounds the body (lot COINBASE-PASS-EDGES-1, D-3:
// 65 536 bytes, written here); its corrections add to it a large 404, a stalled body, an invalid UTF-8 byte (G2-3, G2-6, G2-7 of its G2)
// and the two launch guards of the probe, in a child (XP-G03, XP-G02). Outputs under the OS temp directory, removed after the file.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { main, PRODUCTS, STOPS } from "../scripts/probe-coinbase-bounds.mjs";
import type * as Probe from "../scripts/probe-coinbase-bounds.mjs";
import type * as Recorder from "../scripts/record-coinbase-candles.mjs";
import type { RecorderIo } from "../scripts/record-coinbase-candles.mjs";

globalThis.fetch = (): Promise<Response> => Promise.reject(new Error("tripwire: these tests never call the global fetch"));
const S = 900, DAY = 86_400, WEEK = Date.UTC(2026, 8, 7) / 1000, LF = String.fromCharCode(10);
const MARKS = ["64001.11", "64002.22", "64003.33", "64004.44", "0.987654321", "x-mark-77"]; // low, high, open, close, volume; a header value
const PROBE = fileURLToPath(new URL("../scripts/probe-coinbase-bounds.mjs", import.meta.url));
const RECORDER = fileURLToPath(new URL("../scripts/record-coinbase-candles.mjs", import.meta.url));
const ROOT = mkdtempSync(join(tmpdir(), "coinbase-probe-"));
after(() => { rmSync(ROOT, { recursive: true, force: true, maxRetries: 3 }); });
let made = 0;
const fresh = (): string => join(ROOT, `out-${String(++made)}`);
const iso = (s: number): string => new Date(s * 1000).toISOString().replace(".000Z", "Z");
const sha = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
/** The three requests that P2 fixes, written here (s): aligned, both bounds 1 s later, 300 data points. */
const ASKED: [number, number][] = [[WEEK, WEEK + 10 * S], [WEEK + DAY + 1, WEEK + DAY + 10 * S + 1], [WEEK + 2 * DAY, WEEK + 2 * DAY + 299 * S]];
const urlOf = ([s, e]: [number, number]): string => `https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=900&start=${iso(s)}&end=${iso(e)}`;
/** A complete made-up series (s): every slot of 40 days from 2026-08-25. */
const GRID = Array.from({ length: 40 * 96 }, (_, i) => Date.UTC(2026, 7, 25) / 1000 + i * S);
type Read = (u: readonly number[], s: number, e: number) => number[] | null;
const inside = (u: readonly number[], s: number, e: number): number[] => u.filter((t) => t >= s && t <= e);
const shift = (k: number): Read => (u, s, e) => inside(u, s + k * S, e + k * S);
/** The readings of the table as the 144 runs define them. */
const READS: [string, Read][] = [["A", (u, s, e) => u.filter((t) => t >= s && t < e)], ["B", (u, s, e) => u.filter((t) => t <= e).slice(-300)],
  ["C", (u, s, e) => u.filter((t) => t < e).slice(-300)], ["E", inside], ["F", (u, s, e) => u.filter((t) => t > s && t <= e)],
  ["G", (u, s, e) => (Math.floor((e - s) / S) + 1 > 300 ? null : inside(u, s, e))], ["H", (u, s, e) => u.filter((t) => t > s && t < e)],
  ["K", (u, s, e) => inside(u, s, e).slice(-299)], ["L", (u, s, e) => inside(u, s, e).slice(0, 299)], ["M", (u, s, e) => inside(u, s, e).slice(-298)],
  ["P", (u, s, e) => u.filter((t) => t >= s && t <= e + S)], ["Q", (u, s) => u.filter((t) => t >= s).slice(0, 300)],
  ["S1", shift(-1)], ["S2", shift(-2)], ["S8", shift(-8)], ["S299", shift(-299)], ["T1", shift(1)]];
interface Calls { urls: string[]; inits: RequestInit[] }
/** A scripted answer to request n (from 0), or null: the reading answers. */
type Answer = (n: number) => Response | null;
interface Plan { read?: Read; answer?: Answer; io?: RecorderIo; argv?: (out: string) => string[] }
interface Probed { code: number; stop: string | undefined; out: string; calls: Calls; sleeps: number[]; lines: string[]; result: Probe.ProbeResult | null }

/** The injected fetch: request n gets `answer` n when given, else what `read` serves from GRID, newest first, each candle of marked values. */
function server(read: Read, calls: Calls, answer: Answer): (url: string, init: RequestInit) => Promise<Response> {
  return (url, init) => {
    calls.urls.push(url);
    calls.inits.push(init);
    const q = new URL(url).searchParams, got = read(GRID, Date.parse(q.get("start") ?? "") / 1000, Date.parse(q.get("end") ?? "") / 1000);
    const fixed = answer(calls.urls.length - 1);
    if (fixed !== null) return Promise.resolve(fixed);
    const rows = (got ?? []).toReversed().map((t) => `[${String(t)},${MARKS.slice(0, 5).join(",")}]`);
    const body = got === null ? JSON.stringify({ message: "too many points" }) : `[${rows.join(",")}]`;
    const headers = { date: "Sat, 03 Oct 2026 00:00:00 GMT", "x-probe": MARKS[5] ?? "" };
    return Promise.resolve(new Response(body, { status: got === null ? 400 : 200, headers }));
  };
}

/** One probe through main, at 2026-10-03, clean environment, pauses recorded: its exit code, stop, outputs and the printed line. */
async function probe(plan: Plan = {}): Promise<Probed> {
  const calls: Calls = { urls: [], inits: [] }, sleeps: number[] = [], lines: string[] = [], out = fresh();
  const io: RecorderIo = { fetch: server(plan.read ?? inside, calls, plan.answer ?? (() => null)), env: {}, execArgv: [],
    sleep: (ms) => { sleeps.push(ms); return Promise.resolve(); }, now: () => Date.UTC(2026, 9, 3), print: (l) => { lines.push(l); }, ...plan.io };
  const code = await main(plan.argv?.(out) ?? ["--product", "BTC-USD", "--out", out], io), said = JSON.parse(lines[0] ?? "{}") as { stop?: string };
  if (said.stop !== undefined) assert.ok(STOPS.includes(said.stop), `${said.stop}: a code missing from STOPS`);
  const file = join(out, "probe.json"), result = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) as Probe.ProbeResult : null;
  return { code, stop: said.stop, out, calls, sleeps, lines, result };
}
/** The marks found in any byte written under --out or in any printed line: none, ever. */
function leaks(p: Probed): string[] {
  const files = existsSync(p.out) ? readdirSync(p.out, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()) : [];
  const texts = [...files.map((e) => readFileSync(join(e.parentPath, e.name), "utf8")), ...p.lines];
  return MARKS.filter((m) => texts.some((t) => t.includes(m)));
}

// killer: scripts/probe-coinbase-bounds.mjs:104 CONST "[...res.headers.keys()]" -> "[...res.headers.entries()]"
test("coinbase_probe_asks_three_windows_of_one_week_and_writes_no_price", async () => {
  const p = await probe(), r = p.result, first = (q: Probe.ProbeRequest): unknown[] => [q.name, q.status, q.times?.length, q.times?.[0], q.times?.at(-1)];
  assert.deepEqual([p.code, p.calls.urls, p.sleeps, p.calls.inits.map((i) => [i.redirect, i.headers, i.signal instanceof AbortSignal])],
    [0, ASKED.map(urlOf), [250, 250], [0, 1, 2].map(() => ["manual", undefined, true])], "three requests, no header, no redirect, a delay each");
  assert.deepEqual([readdirSync(p.out).sort(), leaks(p)], [["SHA256SUMS", "probe.json", "requests.jsonl"], []], "no price, no header value");
  const sums = ["probe.json", "requests.jsonl"].map((n) => `${sha(readFileSync(join(p.out, n)))}  ${n}`).join(LF) + LF;
  assert.equal(readFileSync(join(p.out, "SHA256SUMS"), "utf8"), sums, "SHA256SUMS seals both files");
  assert.deepEqual([r?.schema, r?.product, r?.granularity_s, r?.week, r?.requests.map(first)], ["monark.coinbase.bounds.v1", "BTC-USD", 900,
    [iso(WEEK), iso(WEEK + 7 * DAY)], [["aligned", 200, 11, iso(WEEK + 10 * S), iso(WEEK)], ["shifted", 200, 10, iso(WEEK + DAY + 10 * S),
      iso(WEEK + DAY + S)], ["limit", 200, 300, iso(WEEK + 2 * DAY + 299 * S), iso(WEEK + 2 * DAY)]]], "the times in the order served, newest first");
  const conclusion = { format_accepted: true, start_included: true, end_included: true, readings: ["E", "G"] };
  assert.deepEqual([r?.conclusion, JSON.parse(p.lines[0] ?? "{}") as unknown], [conclusion, { ok: true, product: "BTC-USD", ...conclusion }]);
  const logged = readFileSync(join(p.out, "requests.jsonl"), "utf8").split(LF).filter((l) => l !== "").map((l) => JSON.parse(l) as Record<string, unknown>);
  assert.deepEqual(logged.map((l) => [l.name, l.url, l.status, Object.keys(l), l.headers]), ASKED.map((a, i) => [["aligned", "shifted", "limit"][i],
    urlOf(a), 200, ["name", "url", "status", "at", "headers", "header_names"], { date: "Sat, 03 Oct 2026 00:00:00 GMT", "retry-after": null }]));
  assert.deepEqual([r?.probe_sha256, r?.recorder_sha256, r?.redistributable], [sha(readFileSync(PROBE)), sha(readFileSync(RECORDER)), false]);
});

// killer: scripts/probe-coinbase-bounds.mjs:55 CONST "t > s && t <= e" -> "t >= s && t <= e"
test("coinbase_probe_names_the_reading_of_the_bounds_from_the_signature_table", async () => {
  // each reading of the table (CORR2 section 11) served alone: the probe names it (E and G one row at 300 points, as in the table) and
  // the inclusion of start and end by the aligned request; bounds rounded to the grid, a refusal at the limit or the window ignored
  // match no reading: the probe contradicts the table (P3)
  const named: string[] = [];
  for (const [name, read] of READS) {
    const c = (await probe({ read })).result?.conclusion;
    named.push(`${name} ${c?.readings.join("+") ?? "?"} ${String(c?.format_accepted)} ${String(c?.start_included)} ${String(c?.end_included)}`);
  }
  assert.deepEqual(named, ["A A true true false", "B B true true true", "C C true true false", "E E+G true true true", "F F true false true",
    "G E+G true true true", "H H true false false", "K K true true true", "L L true true true", "M M true true true", "P P true true true",
    "Q Q true true true", "S1 S1 true true false", "S2 S2 true true false", "S8 S8 true true false", "S299 S299 false false false",
    "T1 T1 true false true"]);
  const floor = (t: number): number => Math.floor(t / S) * S;
  const rounded = await probe({ read: (u, s, e) => inside(u, floor(s), floor(e)) }), ignored = await probe({ read: (u) => u.slice(-300) });
  const refused = await probe({ answer: (n) => (n === 2 ? new Response(JSON.stringify({ message: "too many points" }), { status: 400 }) : null) });
  assert.deepEqual([rounded, refused, ignored].map((p) => [p.code, p.calls.urls.length, p.result?.requests.map((q) => q.status), p.result?.conclusion]), [
    [0, 3, [200, 200, 200], { format_accepted: true, start_included: true, end_included: true, readings: [] }],
    [0, 3, [200, 200, 400], { format_accepted: true, start_included: true, end_included: true, readings: [] }],
    [0, 3, [200, 200, 200], { format_accepted: false, start_included: false, end_included: false, readings: [] }]]);
  assert.equal(refused.result?.requests[2]?.times, null, "a refusal keeps its status, never a body");
});

// killer: scripts/probe-coinbase-bounds.mjs:110 SDL "if (status >= 300 && status < 400) stop(" -> ""
test("coinbase_probe_keeps_the_network_discipline_of_the_recorder", async () => {
  // the malformed 200 bodies carry the marks (G2-2 of the G2): a stop detail that printed a body or a refused candle would show one
  const reply = (status: number, body = "", headers: Record<string, string> = {}): Response => new Response(body, { status, headers });
  const on = (k: number, res: () => Response): Answer => (n) => (n === k ? res() : null);
  const v = MARKS.slice(0, 5).join(","), bad = (k: number, body: string): Plan => ({ answer: on(k, () => reply(200, body)) });
  const cases: [Plan, string, number][] = [[{ io: { env: { HTTPS_PROXY: "http://127.0.0.1:9" } } }, "proxy_refused", 0],
    [{ io: { env: { NODE_USE_SYSTEM_CA: "1" } } }, "proxy_refused", 0], [{ io: { env: { NODE_TLS_REJECT_UNAUTHORIZED: "0" } } }, "tls_unverified", 0],
    [{ io: { execArgv: ["--use-env-proxy"] } }, "proxy_refused", 0],
    [{ answer: on(0, () => reply(302, "", { location: "https://example.org/" })) }, "redirect_refused", 1],
    [{ answer: on(0, () => reply(429, "", { "retry-after": "1" })) }, "rate_limited", 1], [{ answer: on(1, () => reply(503)) }, "server_error", 2],
    [{ answer: on(0, () => reply(500)) }, "server_error", 1], [bad(0, `[[1788739200,${v}`), "body_not_json", 1],
    [bad(0, JSON.stringify({ message: v })), "body_not_candles", 1], [bad(2, `[[1788739200,${MARKS.slice(0, 2).join(",")}]]`), "body_not_candles", 3],
    [bad(0, `[[1.5,${v}]]`), "body_not_candles", 1], [bad(0, `[[-900,${v}]]`), "body_not_candles", 1],
    [bad(0, `[[8640000000001,${v}]]`), "body_not_candles", 1]]; // a time before 1970, then one past the last Date (P04, P05 of the G2)
  for (const [plan, stop, requests] of cases) {
    const p = await probe(plan);
    assert.deepEqual([p.code, p.stop, p.calls.urls.length, p.result, leaks(p)], [1, stop, requests, null, []], `${stop} after ${String(requests)} request(s)`);
  }
  // a 200 page out of order: its times written in the order received, never sorted (G2-13); a 404 is kept and the next request is made;
  // a silent endpoint stops on its delay, a broken one on a network error: never a retry
  const mixed = await probe(bad(0, `[[${String(WEEK + S)},${v}],[${String(WEEK)},${v}],[${String(WEEK + 2 * S)},${v}]]`));
  assert.deepEqual([mixed.code, mixed.result?.requests[0]?.times, leaks(mixed)], [0, [WEEK + S, WEEK, WEEK + 2 * S].map((t) => iso(t)), []]);
  const lost = await probe({ answer: on(0, () => reply(404, JSON.stringify({ message: "NotFound" }))) });
  assert.deepEqual([lost.code, lost.calls.urls.length, lost.result?.requests[0]?.status, lost.result?.conclusion], [0, 3, 404,
    { format_accepted: false, start_included: null, end_included: null, readings: [] }]);
  let asked = 0;
  const silent = await probe({ io: { timeoutMs: 50, fetch: (_url, init) => {
    asked += 1;
    return new Promise<Response>((_ok, fail) => { init.signal?.addEventListener("abort", () => { fail(new Error("aborted")); }); });
  } } });
  const broken = await probe({ io: { fetch: () => { asked += 1; return Promise.reject(new Error("socket hang up")); } } });
  assert.deepEqual([silent.stop, broken.stop, asked], ["timeout", "network_error", 2]);
});

// killer: scripts/probe-coinbase-bounds.mjs:77 CONST "!PRODUCTS.includes" -> "PRODUCTS.includes"
test("coinbase_probe_refuses_any_product_but_btc_usd_and_a_week_not_yet_closed", async () => {
  // P1: BTC-USD alone, never USDT-USD; the week closed (its end at or before now); --out as the recorder wants it
  const full = fresh(), argv = (product: string) => (out: string): string[] => ["--product", product, "--out", out];
  mkdirSync(full);
  writeFileSync(join(full, "keep.txt"), "kept");
  const cases: [Plan, string][] = [[{ argv: argv("USDT-USD") }, "bad_product"], [{ argv: argv("btc-usd") }, "bad_product"],
    [{ argv: (out) => ["--out", out] }, "usage"], [{ argv: (out) => [...argv("BTC-USD")(out), "--pass", "2"] }, "usage"],
    [{ io: { now: () => Date.UTC(2026, 8, 14) - 1 } }, "end_in_future"], [{ argv: () => argv("BTC-USD")(full) }, "out_not_empty"]];
  for (const [plan, stop] of cases) {
    const p = await probe(plan);
    assert.deepEqual([p.stop, p.calls.urls.length, existsSync(p.out)], [stop, 0, false], stop);
  }
  const closed = await probe({ io: { now: () => Date.UTC(2026, 8, 14) } });
  assert.deepEqual([PRODUCTS, closed.code, closed.calls.urls.length, readdirSync(full)], [["BTC-USD"], 0, 3, ["keep.txt"]], "the week closed at now");
});

// killer: scripts/record-coinbase-candles.mjs:192 SDL "checkHost(url);" -> ""
test("coinbase_recorder_and_probe_refuse_an_origin_outside_the_closed_host_before_any_request", async () => {
  // correction 4 of RECHERCHES (the mutant that removes checkHost from the recorder survived): copies of the recorder and of the probe,
  // the origin of the recorder changed in its copy (the probe reads it from there): each refuses it before its first request
  const origins = ["http://api.exchange.coinbase.com", "https://api.exchange.coinbase.com:8443", "https://api.exchange.coinbase.com.example.org",
    "https://user@api.exchange.coinbase.com"];
  const source = readFileSync(RECORDER, "utf8"), line = 'export const ORIGIN = "https://api.exchange.coinbase.com";';
  assert.equal(source.split(line).length, 2, "the origin of the recorder is written once");
  for (const [k, origin] of origins.entries()) {
    const dir = join(ROOT, `copy-${String(k)}`), urls: string[] = [];
    mkdirSync(dir);
    writeFileSync(join(dir, "record-coinbase-candles.mjs"), source.replace(line, `export const ORIGIN = ${JSON.stringify(origin)};`));
    copyFileSync(PROBE, join(dir, "probe-coinbase-bounds.mjs"));
    const rec = await (import(pathToFileURL(join(dir, "record-coinbase-candles.mjs")).href) as Promise<typeof Recorder>);
    const pro = await (import(pathToFileURL(join(dir, "probe-coinbase-bounds.mjs")).href) as Promise<typeof Probe>);
    const io: RecorderIo = { fetch: (url) => { urls.push(url); return Promise.reject(new Error("offline")); }, sleep: () => Promise.resolve(),
      env: {}, execArgv: [], now: () => Date.UTC(2026, 9, 3) };
    const codeOf = (p: Promise<unknown>): Promise<string> => p.then(() => "ok", (e: unknown) => (e instanceof rec.RecorderStop ? e.code : "not a stop"));
    const got = [await codeOf(rec.run(["--product", "USDT-USD", "--granularity", "15m", "--start", "2023-01-02T00:00Z", "--end", "2023-01-02T01:00Z",
      "--out", join(dir, "recorded")], io)), await codeOf(pro.run(["--product", "BTC-USD", "--out", join(dir, "probed")], io))];
    assert.deepEqual([got, urls], [["host_refused", "host_refused"], []], origin);
  }
});

/** One child node, a minimal environment, 30 s at most: [exit code, stdout, stderr]. */
const child = (args: string[]): [number | null, string, string] => {
  const r = spawnSync(process.execPath, args, { encoding: "utf8", timeout: 30_000, env: { SYSTEMROOT: process.env.SYSTEMROOT },
    stdio: ["ignore", "pipe", "pipe"] });
  return [r.status, r.stdout, r.stderr];
};

// killer: scripts/record-coinbase-candles.mjs:385 CONST "=== realpathSync(SCRIPT)" -> "=== SCRIPT"
test("coinbase_recorder_runs_its_command_line_through_a_link_that_node_keeps", () => {
  // G03 of the campaign of the fusion, the construction measured by the corr3 of COINBASE-USDT-RECORDER-1: a copy of the recorder, a
  // junction to its folder, a child launched through it under --preserve-symlinks-main (import.meta.url then names the link) with no
  // argument: the usage stop, exit 2; a guard that compared a real path with the link would exit 0 with nothing written
  const dir = fresh(), link = fresh();
  mkdirSync(dir);
  copyFileSync(RECORDER, join(dir, "record-coinbase-candles.mjs"));
  symlinkSync(dir, link, "junction");
  assert.deepEqual(child(["--preserve-symlinks-main", join(link, "record-coinbase-candles.mjs")]), [2, "", JSON.stringify({ ok: false,
    stop: "usage", detail: { absent: ["product", "granularity", "start", "end", "out"] } }) + LF]);
});

// killer: scripts/record-coinbase-candles.mjs:385 COR " && existsSync(process.argv[1])" -> ""
test("coinbase_recorder_imported_by_a_process_whose_argv_names_an_absent_path_runs_nothing", () => {
  // G02 of the campaign of the fusion, its measured form: node -e imports the recorder, argv[1] an absent path: the guard runs nothing
  // and throws nothing (exit 0, nothing printed)
  const imported = `await import(${JSON.stringify(pathToFileURL(RECORDER).href)});`;
  assert.deepEqual(child(["--input-type=module", "-e", imported, join(ROOT, "absent")]), [0, "", ""]);
});

// killer: scripts/probe-coinbase-bounds.mjs:174 SDL "process.exitCode = await main(process.argv.slice(2));" -> ""
test("coinbase_probe_command_line_prints_one_line_and_exits", () => {
  // no argument: the usage stop on stderr, exit 2, before any request
  const r = spawnSync(process.execPath, [PROBE], { encoding: "utf8", timeout: 30_000, env: { SYSTEMROOT: process.env.SYSTEMROOT },
    stdio: ["ignore", "pipe", "pipe"] });
  assert.deepEqual([r.status, r.stdout, r.stderr], [2, "", JSON.stringify({ ok: false, stop: "usage", detail: { absent: ["--product", "--out"] } }) + LF]);
});

// killer: scripts/probe-coinbase-bounds.mjs:106 SDL "if (body === null) stop(" -> ""
test("coinbase_probe_reads_a_body_as_a_stream_of_at_most_65536_bytes", async () => {
  // SERIES-BODY-BOUND-1 (lot COINBASE-PASS-EDGES-1, D-3): a 200 body of 85 537 bytes sent in chunks of 20 000 (a byte order mark, a
  // marked candle, then spaces) stops body_too_large in the chunk that passes 65 536 bytes, its stream cancelled, after the first request,
  // its status line alone written, nothing of it kept nor printed; one of exactly 65 536 bytes, in chunks too, is read, its mark removed
  // as res.text() removes it
  const rows = `[[${String(WEEK + S)},${MARKS.slice(0, 5).join(",")}]]`, cancelled: number[] = [];
  const sized = (n: number): Answer => (k) => {
    const bytes = new Uint8Array(n).fill(32);
    bytes.set(new TextEncoder().encode(`${String.fromCharCode(0xfeff)}${rows}`));
    return k !== 0 ? null : new Response(new ReadableStream<Uint8Array>({ start: (c) => {
      for (let i = 0; i < bytes.length; i += 20_000) c.enqueue(bytes.slice(i, i + 20_000));
      c.close();
    }, cancel: () => { cancelled.push(n); } }), { status: 200 });
  };
  const over = await probe({ answer: sized(85_537) }), exact = await probe({ answer: sized(65_536) });
  const said = JSON.parse(over.lines[0] ?? "{}") as { detail?: unknown }, log = join(over.out, "requests.jsonl");
  const logged = existsSync(log) ? readFileSync(log, "utf8") : "";
  const files = existsSync(over.out) ? readdirSync(over.out) : [];
  assert.deepEqual([over.code, over.stop, said.detail, over.calls.urls.length, files, logged.split(LF).length, leaks(over), cancelled],
    [1, "body_too_large", { url: urlOf([WEEK, WEEK + 10 * S]), status: 200, max_bytes: 65_536 }, 1, ["requests.jsonl"], 2, [], [85_537]]);
  assert.deepEqual([exact.code, exact.result?.requests[0]?.times, leaks(exact)], [0, [iso(WEEK + S)], []]);
  // G2 of that lot: a 404 past the bound stops body_too_large too, its status line alone written (G2-3); a body that stalls after its
  // headers, its stream errored by the abort of its request as a real fetch errors it, stops on its delay: timeout, never network_error
  // (G2-6); a 200 body ending with the byte 0xFF is decoded as res.text() decodes it, a replacement character (3 bytes), then refused:
  // body_not_json, never an unforeseen error (G2-7)
  const lost = await probe({ answer: (k) => (k === 0 ? new Response(" ".repeat(70_000), { status: 404 }) : null) });
  const stalled = await probe({ io: { timeoutMs: 50, fetch: (_url, init) => Promise.resolve(new Response(new ReadableStream<Uint8Array>({
    start: (c) => {
      c.enqueue(new TextEncoder().encode("["));
      init.signal?.addEventListener("abort", () => { c.error(new Error("aborted")); });
    } }), { status: 200 })) } });
  const page = new TextEncoder().encode(rows), odd = new Uint8Array(page.length + 1);
  odd.set(page);
  odd[page.length] = 0xff;
  const broken = await probe({ answer: (k) => (k === 0 ? new Response(odd, { status: 200 }) : null) });
  const detail = (p: Probed): unknown => (JSON.parse(p.lines[0] ?? "{}") as { detail?: unknown }).detail;
  const written = (p: Probed): string[] => (existsSync(p.out) ? readdirSync(p.out) : []);
  assert.deepEqual([lost.code, lost.stop, detail(lost), written(lost), stalled.code, stalled.stop, written(stalled), broken.code, broken.stop,
    detail(broken), [lost, stalled, broken].flatMap(leaks)], [1, "body_too_large", { url: urlOf([WEEK, WEEK + 10 * S]), status: 404,
    max_bytes: 65_536 }, ["requests.jsonl"], 1, "timeout", ["requests.jsonl"], 1, "body_not_json",
    { url: urlOf([WEEK, WEEK + 10 * S]), bytes: page.length + 3 }, []]);
  // D-3 of the corrections of that lot, the launch guards of the probe in the forms that the campaign of the fusion MUT-FUSION-ADD7-1
  // measured: through a junction under --preserve-symlinks-main (copies of the probe and of the recorder that it imports), no argument,
  // the usage stop, exit 2 (XP-G03); imported by a process whose argv[1] names an absent path, nothing runs, nothing printed (XP-G02).
  // Both guards are lines that the lot leaves unchanged: a test of them alone, green at the base, would be refused by
  // scripts/red-proof.mjs; they live in this body, red at the base
  const dir = fresh(), link = fresh();
  mkdirSync(dir);
  copyFileSync(PROBE, join(dir, "probe-coinbase-bounds.mjs"));
  copyFileSync(RECORDER, join(dir, "record-coinbase-candles.mjs"));
  symlinkSync(dir, link, "junction");
  const usage = JSON.stringify({ ok: false, stop: "usage", detail: { absent: ["--product", "--out"] } }) + LF;
  assert.deepEqual([child(["--preserve-symlinks-main", join(link, "probe-coinbase-bounds.mjs")]), child(["--input-type=module", "-e",
    `await import(${JSON.stringify(pathToFileURL(PROBE).href)});`, join(ROOT, "absent")])], [[2, "", usage], [0, "", ""]]);
});
