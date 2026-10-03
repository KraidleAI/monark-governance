#!/usr/bin/env node
// scripts/detect-ee7-history.mjs -- detector of the EE-7 episodes of the historical blocks (lot EE7-HISTORY-DETECTOR-1, 2026-10-03): the
// rule that addendum 4 of ADR 0006 of RECHERCHES (section 3) fixed before any read, on the source and the read that its addendum 5 fixed
// (C1 to C4), with the episode kinds of its addendum 7 (W3, W4; lot EE7-ADD7-1). Node 24, zero dependencies, offline, deterministic.
//   node scripts/detect-ee7-history.mjs --root <dir> --from <instant> --to <instant>
// S and F come from ONE run over the whole recording, --from at the earliest 2022-08-01T00:15Z (the read of the first slot of the
// recording, which starts in 2022-08); a run per block serves the C4 counts only.
// Input: sealed month folders <root>/<YYYY-MM>/15m/ of the Coinbase USDT-USD 900 s candles, in the forms that the Coinbase recorder
// writes (lot COINBASE-USDT-RECORDER-1): USDT-USD-15m.csv (fixed header below, values as received), missing.json (its array `missing`:
// every slot without a candle), manifest.json and SHA256SUMS (sha256sum -c format; raw/ pages and requests.jsonl when listed). Every
// month that the window needs is verified before any read: SHA256SUMS re-read, each listed file re-hashed, no file left unlisted; then
// its manifest.json must be the recorder's for that month (D-1 of lot EE7-ADD7-1, correction 5 of the review of RECHERCHES): schema
// SCHEMA, product USDT-USD, granularity_s 900, end_exclusive the end of the month and a recorder_sha256; then each 15-minute slot of
// the month must be exactly one CSV row or one missing.json entry. Any doubt is a named refusal.
// Read at instant tau of the 15-minute grid (addendum 5, C2): the close of the candle whose start is tau - 15 min, never the candle
// stamped tau (it would read the future); absent when missing.json lists that candle, never replaced nor interpolated. Declared, not
// corrected (C3): a candle covers [tau - 15 min, tau), where addendum 4 read (tau - 15 min, tau). The window: --from <= tau < --to.
// Rule (addendum 4, section 3), in exact integer arithmetic (a decimal string scaled to a BigInt, never a float):
//   S = the instant of the FIRST of 4 consecutive present reads with |x - 1| > 0.01; an absent read neither counts nor resets the run;
//   F = the first instant after the 4th read such that [F - 24 h, F) holds at least 48 present reads and every one has |x - 1| < 0.005
//       (F may equal --to: it rests on earlier reads only); the next search for S starts at F;
//   an absent read never opens nor closes an episode; one still open at --to takes F = --to (addendum 7, W4), named in open_episode_at_end.
// Output, and nothing else (stdout, exit 0): one closed JSON {source, window, reads, edge, calm_certified_from, episodes,
// open_episode_at_end} of instants, counts and sha256 digests; no price and no volume, anywhere. C4, counts that inform and never move
// S nor F: reads.absent, the absent reads of the window, i.e. the missing candles of [--from - 15 min, --to - 15 min), one slot before
// the candles [B0, B1) of a block run with --from B0 --to B1 (at most one candle differs at each end; --from B0 + 15 min and --to
// B1 + 15 min read exactly them); and per episode present_reads_last_24h, the present reads of [F - 24 h, F) (null if open at --to).
// edge, information only: the present reads that depart (|x - 1| > 0.01) in a row at the start and at the end of the window, absent
// reads skipped as in the rule: a run that --from cuts (its S may be earlier) or that --to cuts.
// calm_certified_from (F-1): the first instant f of the window whose day [f - 24 h, f) lies in the window (f >= --from + 24 h) and
// holds at least 48 present reads, all with |x - 1| < 0.005; null if none. At f, whatever came before --from, every episode begun
// earlier is closed and no run of departing reads is pending: an episode whose S is at or after f is that of a run over the whole
// recording; before f, an episode in progress at --from may be invisible or show a late S.
// Episodes (addendum 7; D-2 of lot EE7-ADD7-1): each carries its kind (closed list KINDS) and its exclusion interval [exclude_from, F).
// W4 first: open-at-end, still open at --to, F = --to. Then W3: lead-in, an S that calm_certified_from does not certify (S before it,
// or no such instant: Q-1 of that lot), listed and never dropped; else episode. exclude_from is S when calm_certified_from certifies
// it, --from otherwise: a late S never under-excludes. While calm_certified_from is set, an open episode begins at or after it.
// A named refusal (STOPS, closed list) prints {ok: false, stop, detail} on stderr and exits 1 (usage: 2); a detail names a file, a
// line, a column, a key or an instant, never the content of a field. Writes no file.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PRODUCT = "USDT-USD";
export const SCHEMA = "monark.series.coinbase.v1"; // the schema of the recorder's manifest.json (D-1 of lot EE7-ADD7-1)
export const CSV_NAME = `${PRODUCT}-15m.csv`;
export const CSV_HEADER = "open_time_utc,open_time_ms,low,high,open,close,volume";
export const SEALED = [CSV_NAME, "manifest.json", "missing.json"]; // the files that SHA256SUMS must list
export const STEP_MS = 900_000; // the 15-minute grid: one read per instant, one candle per slot
export const OPEN_RUN = 4; // S: 4 consecutive present reads ...
export const OPEN_BAND = "0.01"; // ... each with |x - 1| > 0.01
export const CALM_BAND = "0.005"; // F: every present read of [F - 24 h, F) with |x - 1| < 0.005 ...
export const CALM_SPAN_MS = 86_400_000; // ... over 24 h ...
export const CALM_MIN_PRESENT = 48; // ... and at least 48 of them present
export const KINDS = ["episode", "lead-in", "open-at-end"]; // the kind of an episode, closed list (addendum 7, W3 and W4)
export const STOPS = ["usage", "bad_time", "month_absent", "sums_missing", "sums_malformed", "sums_mismatch", "sums_unlisted",
  "manifest_malformed", "manifest_mismatch", "csv_header", "csv_row", "bad_value", "missing_malformed", "missing_conflict",
  "slot_unaccounted"];
const LF = String.fromCharCode(10);
const DECIMAL = /^[0-9]+([.][0-9]+)?$/;
const TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}(:00)?Z$/;
const SUM_LINE = /^([0-9a-f]{64}) {2}([\w.-]+(?:[/][\w.-]+)*)$/;
const MS = /^(0|[1-9][0-9]{0,15})$/;
const MAX_MS = 8_640_000_000_000_000; // the last instant that a Date holds
const FLAGS = "--root --from --to".split(" "); // one string: no quote right after a flag name (lexical import scan of the repository)
const SCRIPT = fileURLToPath(import.meta.url);

/** A named refusal: `code` is one of STOPS, `detail` where it was seen (file, line, column, instant), never the content of a field. */
export class DetectorStop extends Error {
  constructor(code, detail = {}) {
    super(`${code} ${JSON.stringify(detail)}`);
    this.name = "DetectorStop";
    this.code = code;
    this.detail = detail;
  }
}
const stop = (code, detail) => { throw new DetectorStop(code, detail); };
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
/** ISO 8601 UTC to the second, the form of the CSV and of the output: 2025-01-01T00:15:00Z. */
export const isoOf = (ms) => new Date(ms).toISOString().replace(".000Z", "Z");
const monthOf = (ms) => isoOf(ms).slice(0, 7);
const nextMonth = (ms) => { const d = new Date(ms); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1); };

/** --from or --to: YYYY-MM-DDTHH:MMZ or YYYY-MM-DDTHH:MM:00Z, a real date (round trip), on the 15-minute grid. */
export function parseTime(text) {
  const ms = TIME.test(text) ? Date.parse(text) : Number.NaN, whole = Number.isFinite(ms) && isoOf(ms).slice(0, 16) === text.slice(0, 16);
  if (!whole) stop("bad_time", { value: text, why: "not a whole UTC minute" });
  if (ms % STEP_MS !== 0) stop("bad_time", { value: text, why: "not on the 15-minute grid" });
  return ms;
}

/** The closed command line: --root, --from and --to, each once and with a value. */
export function parseArgs(argv) {
  const a = new Map();
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i], value = argv[i + 1];
    if (!FLAGS.includes(flag) || value === undefined || value.startsWith("--") || a.has(flag)) stop("usage", { flag });
    a.set(flag, value);
  }
  const absent = FLAGS.filter((f) => !a.has(f)).map((f) => f.slice(2));
  if (absent.length > 0) stop("usage", { absent });
  const [rootText, fromText, toText] = FLAGS.map((f) => a.get(f)), from = parseTime(fromText), to = parseTime(toText);
  if (to <= from) stop("bad_time", { why: "--from must come before --to" });
  return { root: resolve(rootText), from, to };
}

/** A decimal string as the exact fraction n / s, s a power of ten ("0.995" is 995 / 1000); null when the text is not of that form. */
export function parseDecimal(text) {
  if (!DECIMAL.test(text)) return null;
  const [whole, frac = ""] = text.split(".");
  return { n: BigInt(whole + frac), s: 10n ** BigInt(frac.length) };
}

/** The sign of |x - 1| - band, exactly: |n - s| / s against band.n / band.s, cross-multiplied in BigInt (-1, 0 or 1). */
export function deviationVersus(x, band) {
  const gap = x.n > x.s ? x.n - x.s : x.s - x.n, left = gap * band.s, right = band.n * x.s;
  return left > right ? 1 : left < right ? -1 : 0;
}
const OPEN = parseDecimal(OPEN_BAND), CALM = parseDecimal(CALM_BAND);
const departs = (x) => deviationVersus(x, OPEN) > 0; // |x - 1| > 0.01, strictly
const calm = (x) => deviationVersus(x, CALM) < 0; // |x - 1| < 0.005, strictly
const [EPISODE, LEAD_IN, OPEN_AT_END] = KINDS;

/** Every file under dir, as a relative path with "/" separators. */
const filesUnder = (dir, prefix = "") => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory()
  ? filesUnder(join(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`]));

/** One month folder, verified before any read; returns the sha256 of its SHA256SUMS, which pins every byte of the folder. */
function verifyMonth(dir, month) {
  const at = (name) => `${month}/15m/${name}`, sumsPath = join(dir, "SHA256SUMS"), listed = new Map();
  if (!existsSync(dir) || !statSync(dir).isDirectory()) stop("month_absent", { folder: `${month}/15m` });
  if (!existsSync(sumsPath) || !statSync(sumsPath).isFile()) stop("sums_missing", { file: at("SHA256SUMS") });
  const bytes = readFileSync(sumsPath), lines = bytes.toString("utf8").split(LF);
  if (lines.pop() !== "") stop("sums_malformed", { file: at("SHA256SUMS"), line: lines.length + 1, why: "no final line feed" });
  lines.forEach((line, i) => {
    const m = SUM_LINE.exec(line), name = m?.[2] ?? "";
    if (m === null || listed.has(name) || name === "SHA256SUMS" || name.split("/").some((p) => p === "." || p === "..")) {
      stop("sums_malformed", { file: at("SHA256SUMS"), line: i + 1 });
    }
    listed.set(name, m[1]);
  });
  for (const name of SEALED) if (!listed.has(name)) stop("sums_malformed", { file: at("SHA256SUMS"), why: `${name} is not listed` });
  for (const [name, hash] of listed) {
    const path = join(dir, ...name.split("/"));
    if (!existsSync(path) || !statSync(path).isFile() || sha256(readFileSync(path)) !== hash) stop("sums_mismatch", { file: at(name) });
  }
  for (const name of filesUnder(dir)) if (name !== "SHA256SUMS" && !listed.has(name)) stop("sums_unlisted", { file: at(name) });
  return sha256(bytes);
}

/** One month's manifest.json, pinned by the seal: the Coinbase recorder's for that month (D-1 of lot EE7-ADD7-1): its schema, the
 *  product, the 900 s grid, the exclusive end of the month and the digest of the recorder that wrote it; a refusal names the key only. */
function readManifest(dir, month) {
  const file = `${month}/15m/manifest.json`, text = readFileSync(join(dir, "manifest.json"), "utf8");
  let doc;
  try { doc = JSON.parse(text); } catch { stop("manifest_malformed", { file, why: "not JSON" }); }
  if (doc === null || typeof doc !== "object" || Array.isArray(doc)) stop("manifest_malformed", { file, why: "not an object" });
  const end = isoOf(nextMonth(Date.parse(`${month}-01T00:00:00Z`))); // the exclusive end of the month, in the recorder's form
  const wanted = { schema: (v) => v === SCHEMA, product: (v) => v === PRODUCT, granularity_s: (v) => v === STEP_MS / 1000,
    end_exclusive: (v) => v === end, recorder_sha256: (v) => typeof v === "string" && /^[0-9a-f]{64}$/.test(v) };
  for (const [key, ok] of Object.entries(wanted)) if (!ok(doc[key])) stop("manifest_mismatch", { file, key });
}

/** The closes of one month's CSV by open time (ms), each an exact fraction; every row checked before its close is kept. */
function readCsv(dir, month) {
  const file = `${month}/15m/${CSV_NAME}`, lines = readFileSync(join(dir, CSV_NAME), "utf8").split(LF), closes = new Map();
  if (lines[0] !== CSV_HEADER) stop("csv_header", { file, line: 1 });
  if (lines.pop() !== "") stop("csv_row", { file, line: lines.length + 1, why: "no final line feed" });
  let last = -1;
  for (let i = 1; i < lines.length; i++) {
    const f = lines[i].split(","), line = i + 1;
    if (f.length !== 7) stop("csv_row", { file, line, why: "not 7 fields" });
    const ms = MS.test(f[1]) ? Number(f[1]) : -1;
    if (ms < 0 || ms > MAX_MS || isoOf(ms) !== f[0]) stop("csv_row", { file, line, why: "open time" });
    if (ms % STEP_MS !== 0 || monthOf(ms) !== month) stop("csv_row", { file, line, why: "not a 15-minute slot of the month" });
    if (ms <= last) stop("csv_row", { file, line, why: "not strictly ascending" });
    const x = parseDecimal(f[5]);
    if (x === null) stop("bad_value", { file, line, column: "close", open_time_utc: f[0] });
    closes.set(ms, x);
    last = ms;
  }
  return closes;
}

/** The open times that one month's missing.json declares without a candle: its array `missing` of {open_time_ms, open_time_utc}. */
function readMissing(dir, month) {
  const file = `${month}/15m/missing.json`, slots = new Set();
  let doc;
  try { doc = JSON.parse(readFileSync(join(dir, "missing.json"), "utf8")); } catch { stop("missing_malformed", { file, why: "not JSON" }); }
  if (doc === null || typeof doc !== "object" || !Array.isArray(doc.missing)) stop("missing_malformed", { file, why: "no missing array" });
  doc.missing.forEach((e, entry) => {
    const ms = e?.open_time_ms, ok = Number.isSafeInteger(ms) && ms >= 0 && ms <= MAX_MS;
    if (!ok || e.open_time_utc !== isoOf(ms) || ms % STEP_MS !== 0 || monthOf(ms) !== month || slots.has(ms)) {
      stop("missing_malformed", { file, entry });
    }
    slots.add(ms);
  });
  return slots;
}

/** The reads of the window: reads[i] is the close read at instant from + i * STEP_MS, null when absent; and each month's digest. */
function readWindow(root, from, to) {
  const book = new Map(), months = [], reads = [];
  for (let t = from - STEP_MS; t < to - STEP_MS; t = nextMonth(t)) {
    const month = monthOf(t), dir = join(root, month, "15m"), sha256sums = verifyMonth(dir, month);
    readManifest(dir, month);
    const closes = readCsv(dir, month), missing = readMissing(dir, month);
    for (let slot = Date.parse(`${month}-01T00:00:00Z`), end = nextMonth(slot); slot < end; slot += STEP_MS) {
      if (closes.has(slot) && missing.has(slot)) stop("missing_conflict", { month, open_time_utc: isoOf(slot) });
      if (!closes.has(slot) && !missing.has(slot)) stop("slot_unaccounted", { month, open_time_utc: isoOf(slot) });
    }
    for (const [slot, x] of closes) book.set(slot, x);
    months.push({ month, sha256sums });
  }
  for (let tau = from; tau < to; tau += STEP_MS) reads.push(book.get(tau - STEP_MS) ?? null);
  return { reads, months };
}

/** The episodes over the reads (index i = instant from + i * STEP_MS): s and f as indices, f null while open, the present reads of
 *  [S, F) (of [S, --to) while open) and, C4 of addendum 5, the present reads of [F - 24 h, F) (null while open); and `certified` (F-1),
 *  the first index f >= 96 of the window whose day [f - 24 h, f) closes as F would (48 present reads or more, all calm), else null. */
function detect(reads) {
  const n = reads.length, span = CALM_SPAN_MS / STEP_MS, present = [0], loud = [0], episodes = [];
  for (const x of reads) {
    present.push(present[present.length - 1] + (x === null ? 0 : 1)); // present reads before each index
    loud.push(loud[loud.length - 1] + (x !== null && !calm(x) ? 1 : 0)); // present reads not calm before each index
  }
  const closesAt = (f) => present[f] - present[Math.max(0, f - span)] >= CALM_MIN_PRESENT && loud[f] === loud[Math.max(0, f - span)];
  let first = span; // F-1: the day before f lies in the window; a read before --from is not read, so it certifies nothing
  while (first < n && !closesAt(first)) first += 1;
  let run = [], i = 0;
  while (i < n) {
    const x = reads[i];
    run = x === null ? run : departs(x) ? [...run, i] : []; // an absent read neither counts nor resets
    i += 1;
    if (run.length < OPEN_RUN) continue;
    let f = i; // F is searched from the instant after the 4th read: an earlier F always holds a read of the run or too few reads
    while (f <= n && !closesAt(f)) f += 1;
    const day = f <= n ? present[f] - present[f - span] : null; // C4; f - span > run[3] >= 3: [F - 24 h, F) never holds the 4th read
    episodes.push({ s: run[0], f: f <= n ? f : null, inside: present[Math.min(f, n)] - present[run[0]], day });
    [run, i] = [[], f]; // the next search for S starts at F
  }
  return { episodes, certified: first < n ? first : null };
}

/** Q-3, information only: how many present reads depart (|x - 1| > 0.01) in a row at the head of xs; an absent read is skipped, it
 *  neither counts nor ends the row (as in the rule). Run on the reads, then on the reads reversed: the two edges of the window. */
function departingHead(xs) {
  let k = 0;
  for (const x of xs) {
    if (x === null) continue;
    if (!departs(x)) break;
    k += 1;
  }
  return k;
}

/** One detection over the window of --from and --to: the closed report (instants, counts and sha256 digests, never a value). */
export function run(argv) {
  const { root, from, to } = parseArgs(argv), { reads, months } = readWindow(root, from, to), { episodes, certified } = detect(reads);
  const at = (i) => isoOf(from + i * STEP_MS), present = reads.filter((x) => x !== null).length, open = episodes.find((e) => e.f === null);
  const whole = (e) => certified !== null && e.s >= certified; // W3: an S at or after calm_certified_from is that of the whole recording
  return {
    source: { venue: "coinbase", product: PRODUCT, granularity_s: STEP_MS / 1000, months, detector_sha256: sha256(readFileSync(SCRIPT)) },
    window: { from: isoOf(from), to_exclusive: isoOf(to) },
    reads: { present, absent: reads.length - present },
    edge: { start: departingHead(reads), end: departingHead(reads.toReversed()) },
    calm_certified_from: certified === null ? null : at(certified),
    episodes: episodes.map((e) => ({ kind: e.f === null ? OPEN_AT_END : whole(e) ? EPISODE : LEAD_IN, S: at(e.s),
      F: at(e.f ?? reads.length), exclude_from: at(whole(e) ? e.s : 0), present_reads_in_episode: e.inside,
      present_reads_last_24h: e.day })),
    open_episode_at_end: open === undefined ? null : at(open.s),
  };
}

/** The command line: the report as one JSON line on stdout (exit 0), or one refusal line on stderr (exit 1; usage 2). */
export function main(argv, io = {}) {
  const print = io.print ?? ((line, toStderr) => { (toStderr ? process.stderr : process.stdout).write(line + LF); });
  try {
    const report = run(argv);
    print(JSON.stringify(report), false);
    return 0;
  } catch (e) {
    if (!(e instanceof DetectorStop)) throw e;
    print(JSON.stringify({ ok: false, stop: e.code, detail: e.detail }), true);
    return e.code === "usage" ? 2 : 1;
  }
}

const invoked = process.argv[1]; // compared by real path (F-4): the detector also runs when called through a junction or a link
if (invoked && existsSync(invoked) && realpathSync(invoked) === realpathSync(SCRIPT)) process.exitCode = main(process.argv.slice(2));
