#!/usr/bin/env node
// scripts/compare-coinbase-passes.mjs -- the comparison of the two readings of one month of Coinbase candles (ADR 0006 addendum 7 R1;
// lot COINBASE-ADD7-1, 2026-10-03): the folder that scripts/record-coinbase-candles.mjs wrote for the month (pass 1) and the one that it
// wrote with --pass 2 (the same month, its windows shifted by half a core). Node 24, zero dependencies, offline; writes no file.
//   node scripts/compare-coinbase-passes.mjs --pass-1 <folder> --pass-2 <folder>
// Each folder is verified before any read: its SHA256SUMS well formed, every listed file at its sha256, no file left unlisted; its manifest of the
// recorder's schema (monark.series.coinbase.v2: a v1 manifest is refused), with the pass of its flag, no empty page, its CSV and missing.json listed
// and the CSV at the sha256 that the manifest names; both manifests of the same product, granularity, start, end and recorder (recorder_sha256). Each
// CSV row: the fixed header, 7 fields, an open time on the grid of the month, strictly ascending. Then, slot by slot of the month: a candle that one
// pass holds and the other lacks, or two candles of one slot whose five values differ (compared as received, byte for byte), stop the comparison
// (passes_disagree), every such slot listed by its open time under absent_from_pass_1, absent_from_pass_2 or differ; never a value.
// Output, and nothing else: one closed JSON line on stdout (exit 0): the month, its slots, the slots present in both passes and those
// absent from both, the sha256 of each SHA256SUMS (it pins every byte of its folder) and of each CSV, and the sha256 of this script; no
// price and no volume. A named stop (a RecorderStop, the class of the recorder, its code in STOPS below) prints {ok: false, stop, detail}
// on stderr and exits 1 (usage: 2); an unforeseen error exits 3. A detail names a pass, a file, a line, a field or an open time, never
// the content of a field. The agent never commits (R-20).
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CSV_COLUMNS, GRANULARITIES, isoOf, PRODUCTS, RecorderStop } from "./record-coinbase-candles.mjs";

export const SCHEMA = "monark.coinbase.passes.v1";
export const SERIES_SCHEMA = "monark.series.coinbase.v2"; // the manifest that the recorder writes since addendum 7 (v1: refused, Q-U5)
export const STOPS = ["usage", "not_sealed", "seal_broken", "not_comparable", "csv_malformed", "passes_disagree"];
const FLAGS = ["--pass-1", "--pass-2"];
const SAME = ["product", "granularity", "granularity_s", "start", "end_exclusive", "recorder_sha256"]; // the month, and the recorder of both passes
const LF = String.fromCharCode(10);
const SUM_LINE = /^([0-9a-f]{64}) {2}([A-Za-z0-9_.-]+(?:[/][A-Za-z0-9_.-]+)*)$/; // a SHA256SUMS line: the sha256, two spaces, a path
const SCRIPT = fileURLToPath(import.meta.url);

const stop = (code, detail) => { throw new RecorderStop(code, detail); };
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const filesUnder = (dir, prefix = "") => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory()
  ? filesUnder(join(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`]));

/** The closed command line: --pass-1 and --pass-2, each once and with a folder. */
export function parseArgs(argv) {
  const a = new Map();
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i], value = argv[i + 1];
    if (!FLAGS.includes(flag) || value === undefined || value.startsWith("--") || a.has(flag)) stop("usage", { flag });
    a.set(flag, value);
  }
  if (a.size !== FLAGS.length) stop("usage", { absent: FLAGS.filter((f) => !a.has(f)) });
  return FLAGS.map((f) => a.get(f));
}

/** One folder, verified before any read: the sha256 of its SHA256SUMS (it pins every byte of the folder) and its listed files. */
function sealed(dir, pass) {
  const sums = join(dir, "SHA256SUMS"), listed = new Map();
  if (!existsSync(sums) || !statSync(sums).isFile()) stop("not_sealed", { pass, file: "SHA256SUMS" });
  const bytes = readFileSync(sums), lines = bytes.toString("utf8").split(LF);
  if (lines.pop() !== "") stop("seal_broken", { pass, file: "SHA256SUMS", line: lines.length + 1 });
  lines.forEach((l, i) => {
    const m = SUM_LINE.exec(l), name = m?.[2] ?? "";
    if (m === null || listed.has(name) || name === "SHA256SUMS" || name.split("/").some((p) => p === "." || p === "..")) {
      stop("seal_broken", { pass, file: "SHA256SUMS", line: i + 1 });
    }
    listed.set(name, m[1]);
  });
  for (const name of filesUnder(dir)) if (name !== "SHA256SUMS" && !listed.has(name)) stop("seal_broken", { pass, file: name, why: "not listed" });
  for (const [name, hash] of listed) {
    const path = join(dir, ...name.split("/"));
    if (!existsSync(path) || !statSync(path).isFile() || sha256(readFileSync(path)) !== hash) stop("seal_broken", { pass, file: name, why: "sha256" });
  }
  return { sums: sha256(bytes), listed };
}

/** The manifest of a sealed folder: the recorder's schema, the pass of its flag, no empty page, its CSV and missing.json listed. */
function manifestOf(dir, pass, listed) {
  let m = null;
  try { m = listed.has("manifest.json") ? JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")) : null; } catch { m = null; }
  const ok = m !== null && typeof m === "object" && m.schema === SERIES_SCHEMA && m.pass === pass && m.empty_pages === 0
    && listed.has("missing.json") && listed.has(m.csv) && listed.get(m.csv) === m.csv_sha256 && SAME.every((k) => k in m);
  if (!ok) stop("not_comparable", { pass, file: "manifest.json" });
  return m;
}

/** The rows of one CSV by open time, the text of their five values; each row checked first (7 fields, a slot of the month, ascending). */
function rowsOf(dir, pass, m, start, end, step) {
  const lines = readFileSync(join(dir, m.csv), "utf8").split(LF), rows = new Map();
  if (lines[0] !== CSV_COLUMNS.join(",") || lines.pop() !== "") stop("csv_malformed", { pass, file: m.csv, line: 1 });
  let last = start - step;
  for (let i = 1; i < lines.length; i++) {
    const f = lines[i].split(","), ms = Number(f[1]);
    if (f.length !== 7 || String(ms) !== f[1] || ms % step !== 0 || ms <= last || ms >= end || isoOf(ms) !== f[0]) {
      stop("csv_malformed", { pass, file: m.csv, line: i + 1 });
    }
    rows.set(ms, f.slice(2).join(","));
    last = ms;
  }
  return rows;
}

/** One comparison: returns its closed result, throws a RecorderStop whose code is one of STOPS. */
export function run(argv) {
  const dirs = parseArgs(argv), seals = dirs.map((d, i) => sealed(d, i + 1)), [m1, m2] = dirs.map((d, i) => manifestOf(d, i + 1, seals[i].listed));
  const field = SAME.find((k) => m1[k] !== m2[k]);
  if (field !== undefined) stop("not_comparable", { field });
  const step = Object.hasOwn(GRANULARITIES, m1.granularity) ? GRANULARITIES[m1.granularity] * 1000 : Number.NaN;
  const start = Date.parse(m1.start), end = Date.parse(m1.end_exclusive);
  const named = PRODUCTS.includes(m1.product) && step === m1.granularity_s * 1000 && Number.isSafeInteger(start) && Number.isSafeInteger(end);
  if (!named || end <= start || start % step !== 0 || end % step !== 0 || isoOf(start) !== m1.start || isoOf(end) !== m1.end_exclusive) {
    stop("not_comparable", { field: "product, granularity, start, end_exclusive" });
  }
  const [one, two] = dirs.map((d, i) => rowsOf(d, i + 1, [m1, m2][i], start, end, step));
  const lists = { absent_from_pass_1: [], absent_from_pass_2: [], differ: [] };
  let both = 0, neither = 0;
  for (let t = start; t < end; t += step) {
    const a = one.get(t), b = two.get(t);
    if (a === undefined && b === undefined) neither += 1;
    else if (a === undefined) lists.absent_from_pass_1.push(isoOf(t));
    else if (b === undefined) lists.absent_from_pass_2.push(isoOf(t));
    else if (a !== b) lists.differ.push(isoOf(t));
    else both += 1;
  }
  if (Object.values(lists).some((l) => l.length > 0)) stop("passes_disagree", lists);
  return { ok: true, schema: SCHEMA, product: m1.product, granularity: m1.granularity, start: m1.start, end_exclusive: m1.end_exclusive,
    slots: (end - start) / step, both, neither, pass_1: { sums_sha256: seals[0].sums, csv_sha256: m1.csv_sha256 },
    pass_2: { sums_sha256: seals[1].sums, csv_sha256: m2.csv_sha256 }, compare_sha256: sha256(readFileSync(SCRIPT)) };
}

/** The command line: the result on stdout (exit 0), or one JSON line on stderr on a stop (1; usage 2) or an unforeseen error (3). */
export function main(argv, io = {}) {
  const print = io.print ?? ((line, toStderr) => { (toStderr ? process.stderr : process.stdout).write(line + LF); });
  try {
    print(JSON.stringify(run(argv)), false);
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
  process.exitCode = main(process.argv.slice(2));
}
