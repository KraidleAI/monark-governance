#!/usr/bin/env node
// scripts/probe-coinbase-bounds.mjs -- the boundary probe of the Coinbase candles (ADR 0006 addendum 7 P1 to P3; lot COINBASE-ADD7-1,
// 2026-10-03): how GET /products/{id}/candles reads its start and end parameters, measured on BTC-USD and never on USDT-USD (P1: the
// times of USDT-USD alone would reveal the pattern of its absent reads), before any USDT-USD request. Node 24, zero dependencies.
//   node scripts/probe-coinbase-bounds.mjs --product BTC-USD --out <dir>
// Three requests (P2), 900 s, in the week from 2026-09-07T00:00Z (a Monday) to 2026-09-14T00:00Z: aligned on the grid (10 slots, 11
// data points if both bounds are served); the same span with both bounds 1 s later (an exact reading of the bounds, a rounding down
// and a rounding up each serve another set); at the limit of 300 data points (the request of the recorder: a core of 298 slots and a
// margin slot on each side). The network discipline of scripts/record-coinbase-candles.mjs, through its own functions: guardEnv (no
// proxy route, no widened TLS trust), guardOut (--out empty, outside any git tree), checkHost before each request (https, the closed
// host), redirects refused, a delay of 30 s, 250 ms between two requests, no retry; a 429, a 5xx, a 3xx, a network error, an expired
// delay or a 200 body that is not a list of candles is a named stop; any other status is kept and the next request is made.
// Prices stripped before any write (P2): a body stays in memory, and of each candle [time, low, high, open, close, volume] the time alone is
// kept. Written in --out: requests.jsonl (one line per answer as its status and headers arrive: status, date, retry-after and the header names),
// probe.json (per request its URL, its status and the open times served, in the order received; the conclusion) and SHA256SUMS; no body.
// Conclusion: format_accepted (the aligned request served an open time of its window: the ISO 8601 form of the recorder is read),
// start_included and end_included (the aligned request), and readings: the readings of the signature table of the second corrections
// of COINBASE-USDT-RECORDER-1 (CORR2, section 11), defined as the 144 runs of test/record-coinbase-candles.test.ts define them, whose
// sets equal the sets served to the three requests, a complete series assumed (BTC-USD trades in every 15 minutes). D (the window
// ignored) and N (a past window) are not functions of the window: they read as format_accepted false or as no reading. No reading:
// the probe contradicts the table, and the recorder is corrected and reviewed again before any USDT-USD request (P3).
// Exit 0 written, 1 named stop (a RecorderStop, the class of the recorder, its code in STOPS below), 2 usage, 3 unforeseen error; one
// JSON line each. Test seam: run(argv, io) and main(argv, io) take fetch, sleep, now, timeoutMs, env, execArgv and print from their
// caller, as the recorder does; neither the command line nor the environment can set them. The agent never commits (R-20).
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkHost, guardEnv, guardOut, isoOf, ORIGIN, PAUSE_MS, RecorderStop, TIMEOUT_MS } from "./record-coinbase-candles.mjs";

export const SCHEMA = "monark.coinbase.bounds.v1";
export const PRODUCTS = ["BTC-USD"]; // closed list, its own: never the recorder's USDT-USD (P1)
export const STOPS = ["usage", "bad_product", "end_in_future", "proxy_refused", "tls_unverified", "out_not_empty", "out_in_git_tree",
  "host_refused", "network_error", "timeout", "rate_limited", "server_error", "redirect_refused", "body_not_json", "body_not_candles"];
const STEP_S = 900, STEP = STEP_S * 1000, DAY = 86_400_000, WEEK = Date.UTC(2026, 8, 7), WEEK_END = WEEK + 7 * DAY;
/** [name, start, end] in ms: aligned, both bounds 1 s later, 300 data points (P2). */
const REQUESTS = [["aligned", WEEK, WEEK + 10 * STEP], ["shifted", WEEK + DAY + 1000, WEEK + DAY + 10 * STEP + 1000],
  ["limit", WEEK + 2 * DAY, WEEK + 2 * DAY + 299 * STEP]];
const FLAGS = ["--product", "--out"];
const LF = String.fromCharCode(10);
const MAX_S = 8_640_000_000_000; // the last second that a Date holds
const SCRIPT = fileURLToPath(import.meta.url), RECORDER = fileURLToPath(new URL("./record-coinbase-candles.mjs", import.meta.url));
const TERMS = "docs/marche/FAITS-USDT-USD-HISTORY-1-conditions-2026-10-03.md";

const stop = (code, detail) => { throw new RecorderStop(code, detail); };
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const both = (u, s, e) => u.filter((t) => t >= s && t <= e);
const shifted = (k) => (u, s, e) => both(u, s + k * STEP_S, e + k * STEP_S);
/** The readings of the signature table (CORR2 section 11), as the 144 runs of the recorder's test define them: the open times (s) that
 *  each serves for the parameters s and e (s) from a complete series u, or null for a refusal. */
const READINGS = {
  A: (u, s, e) => u.filter((t) => t >= s && t < e), B: (u, s, e) => u.filter((t) => t <= e).slice(-300),
  C: (u, s, e) => u.filter((t) => t < e).slice(-300), E: both, F: (u, s, e) => u.filter((t) => t > s && t <= e),
  G: (u, s, e) => (Math.floor((e - s) / STEP_S) + 1 > 300 ? null : both(u, s, e)), H: (u, s, e) => u.filter((t) => t > s && t < e),
  K: (u, s, e) => both(u, s, e).slice(-299), L: (u, s, e) => both(u, s, e).slice(0, 299), M: (u, s, e) => both(u, s, e).slice(-298),
  P: (u, s, e) => u.filter((t) => t >= s && t <= e + STEP_S), Q: (u, s) => u.filter((t) => t >= s).slice(0, 300),
  S1: shifted(-1), S2: shifted(-2), S8: shifted(-8), S299: shifted(-299), T1: shifted(1),
};
/** The complete series around [s, e] (s): every slot of the grid from 700 slots before s to 700 slots after e. */
function around(s, e) {
  const u = [];
  for (let t = Math.ceil(s / STEP_S) * STEP_S - 700 * STEP_S; t <= e + 700 * STEP_S; t += STEP_S) u.push(t);
  return u;
}

/** The closed command line: --product (BTC-USD) and --out, each once and with a value. */
export function parseArgs(argv) {
  const a = new Map();
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i], value = argv[i + 1];
    if (!FLAGS.includes(flag) || value === undefined || value.startsWith("--") || a.has(flag)) stop("usage", { flag });
    a.set(flag, value);
  }
  if (a.size !== FLAGS.length) stop("usage", { absent: FLAGS.filter((f) => !a.has(f)) });
  if (!PRODUCTS.includes(a.get("--product"))) stop("bad_product", { value: a.get("--product"), allowed: PRODUCTS });
  return { product: a.get("--product"), out: resolve(a.get("--out")) };
}

/** The open times (s) of a 200 body, in the order received (never sorted): JSON.parse reads the list, and each candle keeps its time alone (P2). */
function timesOf(url, text) {
  let list;
  try { list = JSON.parse(text); } catch { stop("body_not_json", { url, bytes: Buffer.byteLength(text) }); }
  if (!Array.isArray(list)) stop("body_not_candles", { url });
  const times = list.map((k, row) => {
    if (!Array.isArray(k) || k.length !== 6 || !Number.isSafeInteger(k[0]) || k[0] < 0 || k[0] > MAX_S) stop("body_not_candles", { url, row });
    return k[0];
  });
  return times;
}

/** One request: checkHost, a fetch that follows no redirect under its delay, the status and headers logged as they arrive, the body
 *  read in memory and its open times alone kept. */
async function ask(ctx, [name, from, to]) {
  const url = `${ORIGIN}/products/${ctx.product}/candles?granularity=${String(STEP_S)}&start=${isoOf(from)}&end=${isoOf(to)}`;
  checkHost(url);
  const at = new Date(ctx.now()).toISOString(), signal = AbortSignal.timeout(ctx.timeoutMs);
  const failed = (e) => stop(signal.aborted ? "timeout" : "network_error", { url, message: String(e?.cause?.message ?? e?.message ?? e) });
  let res, text;
  try { res = await ctx.fetch(url, { redirect: "manual", signal }); } catch (e) { failed(e); }
  const status = res.status, header = (h) => res.headers.get(h);
  appendFileSync(join(ctx.out, "requests.jsonl"), JSON.stringify({ name, url, status, at, headers: { date: header("date"),
    "retry-after": header("retry-after") }, header_names: [...res.headers.keys()] }) + LF);
  try { text = await res.text(); } catch (e) { failed(e); }
  if (status === 429) stop("rate_limited", { url, status, retry_after: header("retry-after") });
  if (status >= 500) stop("server_error", { url, status });
  if (status >= 300 && status < 400) stop("redirect_refused", { url, status, location: header("location") });
  return { name, url, from: from / 1000, to: to / 1000, status, times: status === 200 ? timesOf(url, text) : null };
}

/** The readings of the table whose sets equal the sets served to every request (a refusal or another status matches none). */
function readingsOf(got) {
  return Object.keys(READINGS).filter((k) => got.every((g) => {
    const want = READINGS[k](around(g.from, g.to), g.from, g.to);
    return want !== null && g.times !== null && want.length === g.times.length && g.times.toSorted((a, b) => a - b).every((t, i) => t === want[i]);
  }));
}

/** The conclusion (P2, P3): the format read, the inclusion of start and end (the aligned request) and the readings of the table. */
function conclude(got) {
  const [one] = got, served = one.times;
  return { format_accepted: served !== null && served.some((t) => t >= one.from && t <= one.to),
    start_included: served === null ? null : served.includes(one.from), end_included: served === null ? null : served.includes(one.to),
    readings: readingsOf(got) };
}

/** One probe into --out: resolves to the content of probe.json, rejects with a RecorderStop. */
export async function run(argv, io = {}) {
  const now = io.now ?? Date.now, args = parseArgs(argv);
  if (WEEK_END > now()) stop("end_in_future", { end: isoOf(WEEK_END), now: new Date(now()).toISOString() });
  guardEnv(io.env ?? process.env, io.execArgv ?? process.execArgv);
  guardOut(args.out);
  const ctx = { ...args, now, timeoutMs: io.timeoutMs ?? TIMEOUT_MS, fetch: io.fetch ?? ((url, init) => globalThis.fetch(url, init)),
    sleep: io.sleep ?? ((ms) => new Promise((done) => { setTimeout(done, ms); })) };
  const startedAt = new Date(now()).toISOString(), got = [];
  mkdirSync(args.out, { recursive: true });
  for (const request of REQUESTS) {
    if (got.length > 0) await ctx.sleep(PAUSE_MS);
    got.push(await ask(ctx, request));
  }
  const probe = { schema: SCHEMA, product: args.product, granularity_s: STEP_S, week: [isoOf(WEEK), isoOf(WEEK_END)],
    requests: got.map((g) => ({ name: g.name, url: g.url, status: g.status, times: g.times === null ? null : g.times.map((t) => isoOf(t * 1000)) })),
    conclusion: conclude(got), probe_sha256: sha256(readFileSync(SCRIPT)), recorder_sha256: sha256(readFileSync(RECORDER)),
    node: process.version, started_at: startedAt, finished_at: new Date(now()).toISOString(), redistributable: false, terms: TERMS };
  writeFileSync(join(args.out, "probe.json"), JSON.stringify(probe, null, 2) + LF);
  const sums = ["probe.json", "requests.jsonl"].map((n) => `${sha256(readFileSync(join(args.out, n)))}  ${n}`);
  writeFileSync(join(args.out, "SHA256SUMS"), sums.join(LF) + LF);
  return probe;
}

/** The command line: one JSON line on stdout when probe.json is written (exit 0), one on stderr on a stop (1; usage 2) or on an
 *  unforeseen error (3, its name and message). */
export async function main(argv, io = {}) {
  const print = io.print ?? ((line, toStderr) => { (toStderr ? process.stderr : process.stdout).write(line + LF); });
  try {
    const p = await run(argv, io);
    print(JSON.stringify({ ok: true, product: p.product, ...p.conclusion }), false);
    return 0;
  } catch (e) {
    if (e instanceof RecorderStop) {
      print(JSON.stringify({ ok: false, stop: e.code, detail: e.detail }), true);
      return e.code === "usage" ? 2 : 1;
    }
    print(JSON.stringify({ ok: false, error: e instanceof Error ? e.name : typeof e, message: e instanceof Error ? e.message : String(e) }), true);
    return 3;
  }
}

// Main guard by real paths, as the recorder's (F-4 of the G2 of the EE-7 detector): a launch through a link also runs.
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(SCRIPT)) {
  process.exitCode = await main(process.argv.slice(2));
}
