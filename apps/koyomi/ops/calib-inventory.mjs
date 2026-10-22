// MONARK Koyomi -- the calibration inventory (lot A1-a; G0 KOYOMI-A, tests 1 and 2; plan A1 r2 C-A1-10, act AF-K2 of the founder).
// The price first: `--cost` asks Databento's free metadata.get_cost for the ohlcv-1d records of Bell's four underlyings over the window
// and prints it with the Helius estimate and the declared cap, nothing else. `--run` asks the price again, prints the same three lines,
// refuses if the price is above the go (`--max-cost-usd`), then reads one ohlcv-1d series per underlying (the label reader of Koyomi,
// apps/koyomi/src/label-read.ts, and Bell's cross against Massive, readReferenceCloses, share that one request) and keeps one private
// entry per (underlying, D) outside the repository: open of D' present, close of D present, cross marker, g still pending (checkEntry
// below). It prints counts only (never a price, never a key) and the sha256 of the manifest of the entries. A Massive fault is a count
// (`faults`, `cross_unavailable`); a failed Databento series ends the course refused, its counts printed, no manifest written.
// What this lot does not do (named in the A1-a report): no Helius request at all and no g. Every pair is counted as a window to
// recompute, at `--credits-per-window` credits each; the recomputation needs NE-11 (runMain on a window, brief of A1-d-i) and the
// Sunday cut of lot A1-b-i. The cells follow Bell's own regime of the gap after D (classifySession); slots.ts of A1-b-i rules the freeze.
// Network and keys: no fetch here (scanner root apps/koyomi/ops/*.mjs, test 60). The GETs are the seams of apps/bell/src/close.ts, the
// keys are read there (readCashKeys gets the whole env), passed in a header, never in a url, never printed.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { databentoCostPath, databentoGet, polygonGet, readCashKeys, readReferenceCloses } from "../../bell/src/close.ts";
import { assertOutsideRepo } from "../../bell/src/collect.ts";
import { POOLS } from "../../bell/src/pools.ts";
import { CALENDAR_RANGE, classifySession, etWallClockToUtcMs, isTradingDay, nextTradingDay } from "../../bell/src/sessions.ts";
import { readDatabentoLabels } from "../src/label-read.ts";

export const WINDOW_START = "2025-07-01"; // the start of the query of act AF-K1 (G0 KOYOMI-A section 8)
export const WINDOW_END_MAX = "2026-12-05"; // exclusive: the last label is the open of a D' on or before 2026-12-04 (plan A1 r2, C-8)
export const OPEN_EARLY_BEFORE = "2025-08-26"; // NE-2 of the G0: is `open` present before this date
export const SYMBOLS = [...new Set(POOLS.map((p) => p.underlying))].sort();
const DATE = /^\d{4}-\d{2}-\d{2}$/, INT = /^[1-9]\d{0,14}$/, USD = /^\d{1,6}(\.\d{1,6})?$/;
const addDays = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const COST_SHAPE = "metadata.get_cost did not answer one number (shape refused)";
const HTTP_STATUS = /^HTTP \d{3}$/; // the clean form of a transport fault of close.ts: a status, never a url nor a body

/** A refusal of the inventory: its message is written here, never a value nor a fragment of a provider's answer. */
export class Refusal extends Error {}
/** What stderr shows for an error: a refusal as written, the bare HTTP status of close.ts, else the type of the error alone (a parse
 *  error of a provider's body quotes that body: review m-4). */
export function refusalText(e) {
  if (e instanceof Refusal) return e.message;
  if (e instanceof Error && HTTP_STATUS.test(e.message)) return e.message;
  return `${e instanceof Error ? e.name : typeof e} (message withheld: it may quote a provider's answer)`;
}

/** The schema of a private calibration entry, read by the freeze of lot A1-c (plan A1, dated line of 08:1x UTC on review m-5). `g` is
 *  null, or the token gap as the integer at 1e-9 written as a string of digits (exact, like Databento's 64-bit fields); `g_state` is a
 *  closed list: `pending` (not computed yet, the only state this lot writes), `computed`, or one of the five abstention codes Bell
 *  passes through (G0 DK-8; the closed list of lot A1-b-i, apps/koyomi/src/abstain.ts, holds them). Lot A1-g fills g in a new folder. */
export const ENTRY_SCHEMA = "koyomi-calib-entry-v1";
export const G_STATES = Object.freeze(["pending", "computed", "no_fill_in_window", "no_close_ref", "cash_cross_mismatch", "rebase_unverified", "corporate_action_in_window"]);
const ENTRY_KEYS = "schema,symbol,cell,d,d_next,open_present,close_present,cross,g,g_state";
const CROSS = ["matched", "mismatch", "unavailable", "none"];
/** The row itself, or a refusal: a row outside the schema is never written. */
export function checkEntry(row) {
  const bad = (what) => new Refusal(`calibration entry: ${what}`);
  if (Object.keys(row).join(",") !== ENTRY_KEYS) throw bad("keys outside the schema");
  if (row.schema !== ENTRY_SCHEMA || typeof row.symbol !== "string" || (row.cell !== "night" && row.cell !== "weekend")) throw bad("schema, symbol or cell");
  if (!DATE.test(row.d) || !DATE.test(row.d_next) || typeof row.open_present !== "boolean" || typeof row.close_present !== "boolean" || !CROSS.includes(row.cross)) throw bad("dates, flags or cross");
  if (!G_STATES.includes(row.g_state)) throw bad("g_state outside the closed list");
  if (row.g_state === "computed" ? !(typeof row.g === "string" && /^-?\d{1,19}$/.test(row.g)) : row.g !== null) throw bad("g is the integer at 1e-9 as a string when computed, null otherwise");
  return row;
}
/** The price request alone, through the close.ts seam: a transport fault keeps its HTTP status, any other failure is the fixed shape
 *  refusal (a body that is not JSON would otherwise quote itself in the error of the parser). */
async function priceBody(deps, path, key) {
  try { return await deps.databentoGet(path, key); }
  catch (e) { throw new Refusal(e instanceof Error && HTTP_STATUS.test(e.message) ? `metadata.get_cost failed: ${e.message}` : COST_SHAPE); }
}

/** Parse the command line. Refuses an unknown argument without echoing it (a pasted secret never reaches the output). */
export function parseInventoryArgs(argv, nowMs) {
  const a = { mode: null, end: null, cpw: null, cap: null, entries: null, maxCost: null };
  const takes = { "--end": "end", "--credits-per-window": "cpw", "--cap-credits": "cap", "--entries": "entries", "--max-cost-usd": "maxCost" };
  for (let i = 0; i < argv.length; i++) {
    const f = argv[i];
    if (f === "--cost" || f === "--run") { if (a.mode !== null) throw new Refusal("give one of --cost or --run, once"); a.mode = f.slice(2); continue; }
    const k = Object.hasOwn(takes, f) ? takes[f] : undefined;
    if (k === undefined) throw new Refusal(`unknown argument at position ${String(i + 1)}`);
    if (a[k] !== null || argv[i + 1] === undefined) throw new Refusal(`${f} takes one value, once`);
    a[k] = argv[++i];
  }
  if (a.mode === null) throw new Refusal("give --cost (the price, the estimate, the cap) or --run (the inventory)");
  if (a.cpw === null || !INT.test(a.cpw)) throw new Refusal("--credits-per-window <positive integer> is required: the Helius credits of one recomputed window, from a dated line of MONARK");
  if (a.cap === null || !INT.test(a.cap)) throw new Refusal("--cap-credits <positive integer> is required: the declared cap of Q-2 (a), from a dated line of MONARK");
  const today = new Date(nowMs).toISOString().slice(0, 10);
  const end = a.end ?? (today < WINDOW_END_MAX ? today : WINDOW_END_MAX);
  if (!DATE.test(end) || end <= WINDOW_START || end > WINDOW_END_MAX || end > today) throw new Refusal(`--end is an exclusive date after ${WINDOW_START}, at most ${WINDOW_END_MAX} and at most today`);
  if (a.mode === "run" && a.entries === null) throw new Refusal("--run needs --entries <dir>, outside the repository");
  if (a.mode === "run" && (a.maxCost === null || !USD.test(a.maxCost))) throw new Refusal("--run needs --max-cost-usd <dollars>: the price given the go after --cost");
  if (a.mode === "cost" && (a.entries !== null || a.maxCost !== null)) throw new Refusal("--cost takes neither --entries nor --max-cost-usd");
  return { mode: a.mode, end, cpw: Number(a.cpw), cap: Number(a.cap), entries: a.entries, maxCost: a.maxCost === null ? null : Number(a.maxCost) };
}

/** The (D, D') pairs of the window: D a trading day, D' the next one inside the window, the cell from Bell's regime of the gap after D
 *  (an instant at 21:00 New York time, past the after-hours close of every day). A holiday gap is no cell: counted, skipped. */
export function calibrationPairs(start, endExclusive) {
  if (start < CALENDAR_RANGE.fromISO || endExclusive > addDays(CALENDAR_RANGE.toISO, 1)) throw new Refusal("the window leaves Bell's committed calendar");
  const days = [], pairs = [];
  let holiday = 0;
  for (let d = start; d < endExclusive; d = addDays(d, 1)) if (isTradingDay(d)) days.push(d);
  for (const d of days) {
    const next = nextTradingDay(d);
    if (next >= endExclusive) continue;
    const [y, m, dd] = d.split("-").map(Number);
    const { regime } = classifySession(etWallClockToUtcMs(y, m, dd, 21, 0, 0));
    if (regime === "overnight-weekday" || regime === "weekend") pairs.push({ d, next, cell: regime === "weekend" ? "weekend" : "night" });
    else holiday += 1;
  }
  return { days, pairs, holiday };
}

/** metadata.get_cost answers one JSON number (dollars); parseDatabentoJson of the close.ts seam hands it back as a one-element array. */
function costOf(records) {
  const v = Array.isArray(records) && records.length === 1 ? records[0] : undefined;
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) throw new Refusal(COST_SHAPE);
  return v;
}

function cellLine(sym, cell, rows) {
  const r = rows.filter((x) => x.cell === cell), n = (f) => String(r.filter(f).length);
  return [`cell=${sym}:${cell}`, `pairs=${String(r.length)}`, `open_present=${n((x) => x.open_present)}`,
    `open_present_early=${n((x) => x.open_present && x.d_next < OPEN_EARLY_BEFORE)}`, `close_present=${n((x) => x.close_present)}`,
    `cross_matched=${n((x) => x.cross === "matched")}`, `cross_mismatch=${n((x) => x.cross === "mismatch")}`,
    `cross_unavailable=${n((x) => x.cross === "unavailable")}`, `to_recompute=${n((x) => x.g_state === "pending")}`].join(" ");
}

/** The inventory. deps = { databentoGet, polygonGet, env, nowMs, out } (the close.ts seams, the environment, the clock, one line out). */
export async function runInventory(argv, deps) {
  const a = parseInventoryArgs(argv, deps.nowMs);
  if (a.mode === "run") {
    try { assertOutsideRepo(a.entries, resolve(fileURLToPath(new URL("../../../", import.meta.url)))); }
    catch { throw new Refusal("--entries is under the repository: the private entries stay outside the tree"); }
    if (existsSync(a.entries) && readdirSync(a.entries).length > 0) throw new Refusal("--entries is not empty: an inventory never overwrites entries");
  }
  const { polygonKey, databentoKey } = readCashKeys(deps.env);
  if (!databentoKey) throw new Refusal("the Databento key is absent from the environment: no request emitted");
  const { days, pairs, holiday } = calibrationPairs(WINDOW_START, a.end);
  if (days.length === 0) throw new Refusal("no trading day in the window");
  deps.out(`mode=${a.mode} window_start=${WINDOW_START} window_end=${a.end} symbols=${SYMBOLS.join(",")}`);
  // The price first: the only request before these three lines is the free metadata.get_cost (test 2).
  const costUsd = costOf(await priceBody(deps, databentoCostPath(SYMBOLS, WINDOW_START, a.end), databentoKey));
  const windows = pairs.length * SYMBOLS.length, estimate = windows * a.cpw;
  deps.out(`cost_usd=${String(costUsd)}`);
  deps.out(`helius_credits_estimate=${String(estimate)} credits_per_window=${String(a.cpw)} windows_to_recompute=${String(windows)}`);
  deps.out(`cap_credits=${String(a.cap)} within_cap=${estimate <= a.cap ? "yes" : "no"}`);
  if (a.mode === "cost") return;
  if (costUsd > a.maxCost) throw new Refusal(`cost_usd ${String(costUsd)} is above --max-cost-usd: no series requested`);
  // One paid series per underlying: the label reader and readReferenceCloses build the same range path, the memo answers the second.
  const start = days[0], seriesEnd = addDays(days[days.length - 1], 1), memo = new Map(), faults = [], files = {};
  let series = 0, massive = 0, entries = 0, seriesFailed = 0;
  const dbnOnce = (path, key) => { if (!memo.has(path)) { series += 1; memo.set(path, deps.databentoGet(path, key)); } return memo.get(path); };
  const polyCounted = (path, key) => { massive += 1; return deps.polygonGet(path, key); };
  mkdirSync(a.entries, { recursive: true });
  const cells = [];
  for (const sym of SYMBOLS) {
    let labels = {};
    try { labels = await readDatabentoLabels(sym, start, seriesEnd, { databentoGet: dbnOnce, databentoKey }); }
    catch { seriesFailed += 1; } // a failed series counts once: readReferenceCloses records its fault on the same memoized request (review n-2)
    const ref = await readReferenceCloses({ [sym]: days }, { databentoGet: dbnOnce, polygonGet: polyCounted, databentoKey, polygonKey, faults });
    const cross = ref.crossByUnderlying[sym] ?? {};
    const rows = pairs.map(({ d, next, cell }) => ({ schema: ENTRY_SCHEMA, symbol: sym, cell, d, d_next: next,
      open_present: labels[next]?.open_state === "present", close_present: labels[d]?.close_state === "present",
      cross: cross[d] ?? "none", g: null, g_state: "pending" })).map(checkEntry);
    const bytes = rows.map((x) => JSON.stringify(x)).join("\n") + "\n";
    writeFileSync(join(a.entries, `${sym}.jsonl`), bytes);
    files[`${sym}.jsonl`] = sha256(bytes);
    entries += rows.length;
    cells.push(cellLine(sym, "night", rows), cellLine(sym, "weekend", rows));
  }
  for (const l of cells) deps.out(l);
  deps.out(`holiday_pairs_skipped=${String(holiday)}`);
  deps.out(`databento_series=${String(series)} massive_requests=${String(massive)} faults=${String(faults.length)}`);
  if (seriesFailed > 0) throw new Refusal(`${String(seriesFailed)} of ${String(SYMBOLS.length)} Databento series failed: no manifest written; rerun into an empty --entries`);
  const manifest = JSON.stringify({ schema: "koyomi-calib-manifest-v1", window_start: WINDOW_START, window_end: a.end, symbols: SYMBOLS, entries, files }) + "\n";
  writeFileSync(join(a.entries, "manifest.json"), manifest);
  deps.out(`entries=${String(entries)} manifest_sha256=${sha256(manifest)}`);
}

/** The shell: the real close.ts seams, the process environment and clock. A refusal prints its reason (never a value) and exits 1. */
export async function main(argv) {
  try {
    await runInventory(argv, { databentoGet, polygonGet, env: process.env, nowMs: Date.now(), out: (l) => { process.stdout.write(`${l}\n`); } });
    return 0;
  } catch (e) {
    process.stderr.write(`koyomi/calib-inventory: refused: ${refusalText(e)}\n`);
    return 1;
  }
}
const self = fileURLToPath(import.meta.url);
if (process.argv[1] !== undefined && resolve(process.argv[1]).toLowerCase() === self.toLowerCase()) process.exitCode = await main(process.argv.slice(2));
