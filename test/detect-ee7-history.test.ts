// test/detect-ee7-history.test.ts -- lot EE7-HISTORY-DETECTOR-1 (2026-10-03): the EE-7 detector of the historical blocks,
// scripts/detect-ee7-history.mjs, run in-process (and as a child process: by its path, and through a directory junction made under the
// temp root) on synthetic month folders that this file writes under the OS temp directory, in the forms of the Coinbase recorder: no
// series is read from a venue and no network is used. Read i of a test, at
// instant from + i * 15 min, is the close of the candle that starts 15 min earlier (addendum 5, C2; one test writes the candles by their
// start instead); every other slot of each month is declared missing, so each folder is a whole sealed month.
// Each test names, on the line above it, the production mutation that reddens it (scripts/red-proof.mjs convention); every outcome is
// compared by assert. The numbers of the rule (4 reads, 0.01, 0.005, 24 h = 96 instants, 48 reads) are written here, never imported.
// Lot EE7-ADD7-1 (2026-10-03): each folder carries a manifest.json with the recorder's keys (D-1); one test reads a month that the
// Coinbase recorder itself writes, through an injected fetch (no network). The schema and the three kinds of addendum 7 are written
// here too, never imported: the base detector must load this file for the red proof.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DetectorStop, deviationVersus, main, parseDecimal, run, STOPS } from "../scripts/detect-ee7-history.mjs";
import type { Decimal, Ee7Report } from "../scripts/detect-ee7-history.mjs";
import { run as record } from "../scripts/record-coinbase-candles.mjs";

type Read = string | null;
type Cls = "calm" | "mid" | "depart" | "absent";
type Shape = [number, number | null, number];
type Cells = readonly [string, string, string, string];
interface MissingDoc { missing: { open_time_ms: number; open_time_utc: string }[] }

const SCRIPT = fileURLToPath(new URL("../scripts/detect-ee7-history.mjs", import.meta.url));
const RECORDER = fileURLToPath(new URL("../scripts/record-coinbase-candles.mjs", import.meta.url));
globalThis.fetch = (): Promise<Response> => Promise.reject(new Error("tripwire: these tests never call the global fetch"));
const STEP = 900_000, DAY = 96, LF = String.fromCharCode(10); // 15 min; 24 h = 96 instants
const SCHEMA = "monark.series.coinbase.v2"; // the schema that the recorder writes in manifest.json (record-coinbase-candles.mjs l.273)
const HEADER = "open_time_utc,open_time_ms,low,high,open,close,volume", CSV = "USDT-USD-15m.csv";
const T0 = Date.UTC(2025, 0, 31, 12); // 2025-01-31T12:00Z: a window from T0 longer than 12 h reads two months
const D = "1.0150", C = "0.9990", M = "1.0070", A = null; // |x - 1| = 0.015 departs, 0.001 is calm, 0.007 is neither; A is absent
const ROOT = mkdtempSync(join(tmpdir(), "ee7-history-"));
after(() => { rmSync(ROOT, { recursive: true, force: true, maxRetries: 3 }); });
let made = 0;
const fresh = (): string => join(ROOT, `root-${String(++made)}`);
const iso = (ms: number): string => new Date(ms).toISOString().replace(".000Z", "Z");
const sha = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
const rep = (x: Read, k: number): Read[] => Array.from({ length: k }, () => x);
const monthStart = (ms: number): number => { const d = new Date(ms); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1); };
const nextMonth = (ms: number): number => { const d = new Date(ms); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1); };
/** Every file under dir, as a relative path with "/" separators. */
const walk = (dir: string, prefix = ""): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  (e.isDirectory() ? walk(join(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`]));

/** SHA256SUMS over every other file of the folder, sub-folders included, in the recorder's format. */
function seal(dir: string): void {
  const names = walk(dir).filter((n) => n !== "SHA256SUMS").sort();
  writeFileSync(join(dir, "SHA256SUMS"), names.map((n) => `${sha(readFileSync(join(dir, n)))}  ${n}`).join(LF) + LF);
}

/** The sealed month folders of a run of candles under a fresh root, in the forms of the Coinbase recorder: candles[k] is the close of
 *  the candle that STARTS at first + k * STEP (null: declared missing); every other slot of each month is declared missing.
 *  `cells`: low, high, open, volume. */
function candlesAt(first: number, candles: readonly Read[], cells: Cells = ["0.97", "1.03", "1.00", "250.5"]): string {
  const root = fresh(), closes = new Map<number, string>();
  candles.forEach((x, k) => { if (x !== null) closes.set(first + k * STEP, x); });
  for (let m = monthStart(first); m <= first + (candles.length - 1) * STEP; m = nextMonth(m)) {
    const dir = join(root, iso(m).slice(0, 7), "15m"), rows: string[] = [], missing: number[] = [];
    for (let t = m, end = nextMonth(m); t < end; t += STEP) {
      const x = closes.get(t);
      if (x === undefined) missing.push(t);
      else rows.push([iso(t), String(t), cells[0], cells[1], cells[2], x, cells[3]].join(","));
    }
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, CSV), [HEADER, ...rows].join(LF) + LF);
    const doc = { product: "USDT-USD", granularity: "15m", start: iso(m), end_exclusive: iso(nextMonth(m)), count: missing.length,
      missing: missing.map((t) => ({ open_time_ms: t, open_time_utc: iso(t) })) }; // the keys and the layout of the recorder's file
    writeFileSync(join(dir, "missing.json"), JSON.stringify(doc, null, 2) + LF);
    const manifest = { schema: SCHEMA, mode: "record", platform: "coinbase", product: "USDT-USD", granularity: "15m", granularity_s: 900,
      start: iso(m), end_exclusive: iso(nextMonth(m)), pass: 1, expected: rows.length + missing.length, rows: rows.length,
      missing: missing.length, empty_pages: 0, csv: CSV, recorder_sha256: sha(readFileSync(RECORDER)) }; // keys of the recorder's manifest.json
      // (l.318-328), among them D-1's five and, lot COINBASE-PRE-LOOP-1, pass and empty_pages
    writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + LF);
    seal(dir);
  }
  return root;
}
/** The folders that the reads need: read i, at instant from + i * STEP, is the close of the candle starting 15 min earlier (C2). */
const sealed = (from: number, reads: readonly Read[], cells?: Cells): string => candlesAt(from - STEP, reads, cells);

/** The command line of the window [from, from + n * STEP) over a root. */
const argvOf = (root: string, from: number, n: number): string[] => ["--root", root, "--from", iso(from), "--to", iso(from + n * STEP)];
/** The report over the reads, from a fresh sealed root. */
const detectOn = (reads: readonly Read[], from = T0): Ee7Report => run(argvOf(sealed(from, reads), from, reads.length));
/** The episodes as [S, F, present reads in [S, F)], S and F counted in instants from `from`; F null for an episode still open at --to
 *  (kind open-at-end, whose F is --to: the tests of addendum 7 read it whole). */
const shape = (r: Ee7Report, from = T0): Shape[] => r.episodes.map((e): Shape =>
  [(Date.parse(e.S) - from) / STEP, e.kind === "open-at-end" ? null : (Date.parse(e.F) - from) / STEP, e.present_reads_in_episode]);
/** "ok", or the code of the DetectorStop that the call throws; anything else is named, so that a mutant reddens by assertion. */
function outcome(f: () => unknown): string {
  try {
    f();
    return "ok";
  } catch (e) {
    return e instanceof DetectorStop ? e.code : `not a stop: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

// killer: scripts/detect-ee7-history.mjs:216 CONST "book.get(tau - STEP_MS)" -> "book.get(tau)"
test("ee7_opens_at_the_first_of_four_reads_and_closes_after_a_calm_day", () => {
  const reads = [...rep(C, 8), ...rep(D, 6), ...rep(C, 100)], root = sealed(T0, reads), argv = argvOf(root, T0, reads.length);
  const r = run(argv), sums = (m: string): string => sha(readFileSync(join(root, m, "15m", "SHA256SUMS")));
  assert.deepEqual(r, {
    source: { venue: "coinbase", product: "USDT-USD", granularity_s: 900, months: [{ month: "2025-01", sha256sums: sums("2025-01") },
      { month: "2025-02", sha256sums: sums("2025-02") }], detector_sha256: sha(readFileSync(SCRIPT)) },
    window: { from: "2025-01-31T12:00:00Z", to_exclusive: "2025-02-01T16:30:00Z" },
    reads: { present: 114, absent: 0 },
    edge: { start: 0, end: 0 },
    calm_certified_from: "2025-02-01T15:30:00Z", // F-1: the first read whose whole previous day is calm (index 110, here F)
    episodes: [{ kind: "lead-in", S: "2025-01-31T14:00:00Z", F: "2025-02-01T15:30:00Z", exclude_from: "2025-01-31T12:00:00Z",
      present_reads_in_episode: 102, present_reads_last_24h: 96 }], // S (index 8) before calm_certified_from (110): W3, from --from
    open_episode_at_end: null,
  }, "S at the first of the 4 reads (index 8); F 96 instants after the last departing read (index 13); 102 present reads in [S, F)");
  assert.equal(JSON.stringify(run(argv)), JSON.stringify(r), "deterministic: the same folders give the same bytes");
});

// killer: scripts/detect-ee7-history.mjs:235 CONST ": [];" -> ": run;"
test("ee7_three_departing_reads_then_one_inside_the_band_open_nothing", () => {
  const broken = detectOn([...rep(C, 4), D, D, D, C, D, D, D, M, D, D, D, C, ...rep(C, 10)]);
  assert.deepEqual([broken.episodes, broken.open_episode_at_end], [[], null], "a present read inside the band resets the run");
  assert.deepEqual(shape(detectOn([...rep(C, 4), D, D, D, D, ...rep(C, 10)])), [[4, null, 14]], "a fourth departing read opens it");
});

// killer: scripts/detect-ee7-history.mjs:235 CONST "x === null ? run :" -> "x === null ? [] :"
test("ee7_absent_reads_neither_count_nor_reset_the_run", () => {
  const r = detectOn([...rep(C, 4), D, A, A, D, A, D, A, D, ...rep(C, 120)]);
  assert.deepEqual([shape(r), r.reads], [[[4, 108, 100]], { present: 128, absent: 4 }], "4 departing reads across 4 absences: one episode");
  assert.deepEqual(detectOn([...rep(C, 4), D, D, D, A, C, D, A, ...rep(C, 10)]).episodes, [], "an absence is not a fourth read");
});

// killer: scripts/detect-ee7-history.mjs:241 CONST "s: run[0]" -> "s: run[3]"
test("ee7_dates_S_at_the_first_of_the_four_reads_not_at_the_fourth", () => {
  const r = detectOn([...rep(C, 6), D, A, D, D, A, A, D, ...rep(C, 110)]);
  assert.deepEqual(shape(r), [[6, 109, 100]]);
  assert.deepEqual([r.episodes[0]?.S, r.episodes[0]?.F], ["2025-01-31T13:30:00Z", "2025-02-01T15:15:00Z"]);
});

// killer: scripts/detect-ee7-history.mjs:229 ROR ">= CALM_MIN_PRESENT" -> "> CALM_MIN_PRESENT"
test("ee7_closes_with_48_present_reads_in_the_last_day_and_not_with_47", () => {
  const half = Array.from({ length: DAY }, (_, i): Read => (i % 2 === 0 ? C : A)); // 48 present reads, 48 absent
  const day48 = [...rep(C, 4), ...rep(D, 4), ...half, ...rep(A, 20)];
  const day47 = [...rep(C, 4), ...rep(D, 4), ...half.map((x, i): Read => (i === DAY - 2 ? A : x)), ...rep(A, 20)];
  const closed = detectOn(day48), open = detectOn(day47);
  assert.deepEqual([shape(closed), closed.episodes[0]?.present_reads_last_24h], [[[4, 104, 52]], 48], "48 present calm reads in [F - 24 h, F)");
  assert.deepEqual([shape(open), open.open_episode_at_end, open.episodes[0]?.present_reads_last_24h], [[[4, null, 51]], "2025-01-31T13:00:00Z",
    37], "47: still open at the end (shape: F null, kind open-at-end); C4 counts the present reads of [--to - 24 h, --to) (D-5)");
});

// killer: scripts/detect-ee7-history.mjs:122 ROR "deviationVersus(x, CALM) < 0" -> "deviationVersus(x, CALM) <= 0"
test("ee7_a_read_at_exactly_0_005_from_1_is_not_calm", () => {
  const closing = (x: string): Read[] => [...rep(C, 4), ...rep(D, 4), ...rep(C, 42), x, ...rep(C, 200)];
  for (const x of ["1.005", "0.995", "1.00500", "0.9949", "1.0050000000000000000001"]) {
    assert.deepEqual(shape(detectOn(closing(x))), [[4, 147, 143]], `${x}: not calm, F waits 24 h after it`);
  }
  for (const x of ["1.0049999999999999999", "0.9950000000000000001", "1.004"]) {
    assert.deepEqual(shape(detectOn(closing(x))), [[4, 104, 100]], `${x}: calm`);
  }
});

// killer: scripts/detect-ee7-history.mjs:121 ROR "deviationVersus(x, OPEN) > 0" -> "deviationVersus(x, OPEN) >= 0"
test("ee7_four_reads_at_exactly_0_01_from_1_open_nothing", () => {
  const four = (x: string): Read[] => [...rep(C, 4), ...rep(x, 4), ...rep(C, 120)];
  for (const x of ["1.01", "0.99", "1.0100", "1.0099999999999999999", "0.9900000000000000001"]) {
    assert.deepEqual(detectOn(four(x)).episodes, [], `${x}: not above 0.01`);
  }
  for (const x of ["1.0100000000000000001", "0.9899999999999999999", "1.02", "0"]) {
    assert.deepEqual(shape(detectOn(four(x))), [[4, 104, 100]], `${x}: above 0.01`);
  }
});

// killer: scripts/detect-ee7-history.mjs:112 CONST "10n ** BigInt(frac.length)" -> "10n ** BigInt(frac.length + 1)"
test("ee7_compares_the_deviation_in_exact_integers_never_in_floats", () => {
  const dec = (t: string): Decimal => parseDecimal(t) ?? assert.fail(`not a decimal: ${t}`);
  const cmp = (x: string, band: string): number => deviationVersus(dec(x), dec(band));
  assert.deepEqual([parseDecimal("0.995"), parseDecimal("1"), parseDecimal("0001.0100")], [{ n: 995n, s: 1000n }, { n: 1n, s: 1n },
    { n: 10100n, s: 10000n }]);
  assert.deepEqual([cmp("1.01", "0.01"), cmp("0.99", "0.01"), cmp("1.005", "0.005"), cmp("0.995", "0.005")], [0, 0, 0, 0], "on the bands");
  assert.deepEqual([cmp("1.0100000000000000000000001", "0.01"), cmp("1.0099999999999999999999999", "0.01")], [1, -1], "1e-25 apart");
  assert.deepEqual([cmp("1", "0.005"), cmp("0", "0.01"), cmp("2", "0.01")], [-1, 1, 1]);
  for (const t of ["1e-2", "-1.0", "+1.0", "", ".5", "1.", "1.0.0", " 1.0", "1.0 ", "NaN", "Infinity", "0x1", "1,0", String.fromCharCode(0x661, 0x2e, 0x660)]) {
    assert.equal(parseDecimal(t), null, JSON.stringify(t));
  }
  const [f01, f005] = [Number.parseFloat("1.01") - 1, Number.parseFloat("1.005") - 1];
  assert.deepEqual([f01 > 0.01, f005 < 0.005], [true, true], "a float puts both bands on the wrong side: the detector never uses one");
});

// killer: scripts/detect-ee7-history.mjs:242 CONST "[run, i] = [[], f];" -> "[run, i] = [[], i];"
test("ee7_finds_two_episodes_and_no_second_one_inside_an_open_episode", () => {
  const from = Date.UTC(2023, 2, 10), reads = [...rep(C, 4), ...rep(D, 4), ...rep(C, 20), ...rep(D, 4), ...rep(C, 100), ...rep(D, 4),
    ...rep(C, 100)];
  const r = detectOn(reads, from);
  assert.deepEqual([shape(r, from), r.open_episode_at_end], [[[4, 128, 124], [132, 232, 100]], null], "the burst at 28 belongs to the first");
});

// killer: scripts/detect-ee7-history.mjs:241 CONST "f: f <= n ? f : null" -> "f: f < n ? f : null"
test("ee7_names_an_episode_still_open_at_the_end_and_closes_one_at_exactly_to", () => {
  const open = detectOn([...rep(C, 4), ...rep(D, 4), ...rep(C, 50)]);
  assert.deepEqual([shape(open), open.open_episode_at_end], [[[4, null, 54]], "2025-01-31T13:00:00Z"], "shape: F null for the open-at-end episode (F = --to), named by its S");
  const edge = detectOn([...rep(C, 4), ...rep(D, 4), ...rep(C, DAY)]); // the last day before --to is calm: F = --to
  assert.deepEqual([shape(edge), edge.open_episode_at_end, edge.window.to_exclusive], [[[4, 104, 100]], null, iso(T0 + 104 * STEP)]);
});

/** Rewrites the folder's SHA256SUMS line by line (null drops the line). */
function sumsLines(dir: string, f: (line: string) => string | null): void {
  const lines = readFileSync(join(dir, "SHA256SUMS"), "utf8").split(LF).slice(0, -1).map(f).filter((l): l is string => l !== null);
  writeFileSync(join(dir, "SHA256SUMS"), lines.join(LF) + LF);
}
/** One bit of the byte before the final line feed flipped. */
function flip(path: string): void {
  const b = readFileSync(path), i = b.length - 2;
  b.writeUInt8(b.readUInt8(i) ^ 1, i);
  writeFileSync(path, b);
}

// killer: scripts/detect-ee7-history.mjs:146 SDL "!== hash)" -> ""
test("ee7_refuses_an_altered_month_folder", () => {
  const reads = [...rep(C, 4), ...rep(D, 4), ...rep(C, 100)], feb = (root: string): string => join(root, "2025-02", "15m");
  const cases: [string, (dir: string) => void, string][] = [
    ["one bit of the CSV", (d) => { flip(join(d, CSV)); }, "sums_mismatch"],
    ["missing.json deleted", (d) => { unlinkSync(join(d, "missing.json")); }, "sums_mismatch"],
    ["an unlisted file", (d) => { writeFileSync(join(d, "notes.txt"), "x"); }, "sums_unlisted"],
    ["an unlisted file under raw/", (d) => { mkdirSync(join(d, "raw")); writeFileSync(join(d, "raw", "page.json"), "[]"); }, "sums_unlisted"],
    ["SHA256SUMS deleted", (d) => { unlinkSync(join(d, "SHA256SUMS")); }, "sums_missing"],
    ["one space instead of two", (d) => { sumsLines(d, (l) => l.replace("  ", " ")); }, "sums_malformed"],
    ["an uppercase digest", (d) => { sumsLines(d, (l) => l.slice(0, 64).toUpperCase() + l.slice(64)); }, "sums_malformed"],
    ["manifest.json not listed", (d) => { sumsLines(d, (l) => (l.endsWith("  manifest.json") ? null : l)); }, "sums_malformed"],
    ["a file listed twice", (d) => { sumsLines(d, (l) => (l.endsWith("  missing.json") ? `${l}${LF}${l}` : l)); }, "sums_malformed"],
    ["a path out of the folder", (d) => { appendFileSync(join(d, "SHA256SUMS"), `${"0".repeat(64)}  ../x${LF}`); }, "sums_malformed"],
    ["no final line feed", (d) => { writeFileSync(join(d, "SHA256SUMS"), readFileSync(join(d, "SHA256SUMS"), "utf8").slice(0, -1)); },
      "sums_malformed"],
  ];
  for (const [what, alter, code] of cases) {
    const root = sealed(T0, reads);
    alter(feb(root));
    assert.equal(outcome(() => run(argvOf(root, T0, reads.length))), code, what);
  }
  const first = Date.UTC(2025, 2, 1, 0, 15), march = sealed(first, reads); // its first slot opens 2025-03-01T00:00Z
  assert.equal(outcome(() => run(argvOf(march, first - STEP, reads.length))), "month_absent", "a window that needs 2025-02-28T23:45Z");
  const ok = sealed(T0, reads);
  mkdirSync(join(feb(ok), "raw"));
  writeFileSync(join(feb(ok), "raw", "page.json"), "[]");
  seal(feb(ok));
  assert.deepEqual(shape(run(argvOf(ok, T0, reads.length))), [[4, 104, 100]], "a raw/ page listed in SHA256SUMS belongs to the folder");
});

/** An edit of one file of a folder. */
const edit = (name: string, f: (text: string) => string) => (dir: string): void => {
  writeFileSync(join(dir, name), f(readFileSync(join(dir, name), "utf8")));
};
/** An edit of the CSV lines (header first; the final line feed kept). */
const csvLines = (f: (lines: string[]) => string[]): ((dir: string) => void) => edit(CSV, (t) => f(t.split(LF).slice(0, -1)).join(LF) + LF);
/** An edit of the cells of CSV line k (1 = the first row). */
const csvCells = (k: number, f: (cells: string[]) => string[]): ((dir: string) => void) =>
  csvLines((ls) => ls.map((l, i) => (i === k ? f(l.split(",")).join(",") : l)));
/** An edit of missing.json. */
const missingDoc = (f: (doc: MissingDoc) => void): ((dir: string) => void) => edit("missing.json", (t) => {
  const doc = JSON.parse(t) as MissingDoc;
  f(doc);
  return JSON.stringify(doc) + LF;
});

// killer: scripts/detect-ee7-history.mjs:177 ROR "ms <= last" -> "ms < last"
test("ee7_refuses_an_unsound_csv_or_missing_list_even_when_sealed", () => {
  const from = Date.UTC(2025, 5, 2), reads = [...rep(C, 4), ...rep(D, 4), ...rep(C, 8)], may = Date.UTC(2025, 4, 31, 23, 45);
  const june = Date.UTC(2025, 5, 1); // the first slot of the month: declared missing by the fixture
  const at = (ms: number): string[] => [iso(ms), String(ms)];
  const cases: [string, (dir: string) => void, string][] = [
    ["two header columns swapped", csvLines((ls) => ls.map((l, i) => (i === 0 ? l.replace("low,high", "high,low") : l))), "csv_header"],
    ["a row of 6 fields", csvCells(1, (c) => c.slice(0, 6)), "csv_row"],
    ["a row of 8 fields", csvCells(1, (c) => [...c, "1"]), "csv_row"],
    ["an ISO time that disagrees with its ms", csvCells(1, (c) => [iso(Number(c[1]) - STEP), ...c.slice(1)]), "csv_row"],
    ["a row off the 15-minute grid", csvCells(1, (c) => [...at(Number(c[1]) + 60_000), ...c.slice(2)]), "csv_row"],
    ["a row of the previous month", csvCells(1, (c) => [...at(may), ...c.slice(2)]), "csv_row"],
    ["two rows swapped", csvLines((ls) => ls.map((l, i) => (i === 1 ? ls[2] ?? l : i === 2 ? ls[1] ?? l : l))), "csv_row"],
    ["a row repeated", csvLines((ls) => [...ls.slice(0, 2), ...ls.slice(1)]), "csv_row"],
    ["no final line feed", edit(CSV, (t) => t.slice(0, -1)), "csv_row"],
    ...["1e0", "-1.0", "", "1.", ".999", " 1.0", "NaN", "1_0"].map((v): [string, (dir: string) => void, string] =>
      [`a close of ${JSON.stringify(v)}`, csvCells(1, (c) => c.map((x, i) => (i === 5 ? v : x))), "bad_value"]),
    ["missing.json not JSON", edit("missing.json", () => "{"), "missing_malformed"],
    ["missing.json without its array", edit("missing.json", () => "{}"), "missing_malformed"],
    ["an entry whose ISO time disagrees", missingDoc((d) => { d.missing[0] = { open_time_ms: from, open_time_utc: iso(from + STEP) }; }),
      "missing_malformed"],
    ["an entry twice", missingDoc((d) => { d.missing.push({ open_time_ms: june, open_time_utc: iso(june) }); }), "missing_malformed"],
    ["an entry of the previous month", missingDoc((d) => { d.missing.push({ open_time_ms: may, open_time_utc: iso(may) }); }),
      "missing_malformed"],
    ["a candle both in the CSV and in missing.json", missingDoc((d) => { d.missing.push({ open_time_ms: from, open_time_utc: iso(from) }); }),
      "missing_conflict"],
    ["a slot in neither", missingDoc((d) => { d.missing.shift(); }), "slot_unaccounted"],
  ];
  for (const [what, alter, code] of [...cases, ["nothing altered", (): void => undefined, "ok"] as const]) {
    const root = sealed(from, reads), dir = join(root, "2025-06", "15m");
    alter(dir);
    seal(dir);
    assert.equal(outcome(() => run(argvOf(root, from, reads.length))), code, what);
    assert.ok(code === "ok" || STOPS.includes(code), code);
  }
});

// killer: scripts/detect-ee7-history.mjs:287 CONST "? 2 : 1" -> "? 1 : 1"
test("ee7_refuses_bad_arguments_with_a_named_stop_and_exit_codes_1_and_2", () => {
  const root = sealed(T0, rep(C, 8)), base = argvOf(root, T0, 8);
  const swap = (flag: string, value: string): string[] => base.map((v, i) => (base[i - 1] === flag ? value : v));
  const cases: [string[], string][] = [
    [[...base, "--x", "1"], "usage"], [base.slice(0, 4), "usage"], [base.slice(0, 5), "usage"], [[...base, "--to", iso(T0 + STEP)], "usage"],
    [["--root", "--from", ...base.slice(2)], "usage"], [swap("--from", "2025-01-31T12:05Z"), "bad_time"],
    [swap("--from", "2025-01-31T12:00:30Z"), "bad_time"], [swap("--to", "2025-02-30T00:00Z"), "bad_time"],
    [swap("--from", "2025-01-31T24:00Z"), "bad_time"], [swap("--from", "2025-01-31 12:00Z"), "bad_time"], [swap("--to", iso(T0)), "bad_time"],
    [swap("--to", iso(T0 - STEP)), "bad_time"],
  ];
  for (const [argv, code] of cases) {
    assert.equal(outcome(() => run(argv)), code, argv.join(" "));
    assert.ok(STOPS.includes(code), code);
  }
  const lines: [string, boolean][] = [], print = (l: string, toStderr: boolean): void => { lines.push([l, toStderr]); };
  assert.deepEqual([main(base, { print }), main(swap("--from", "2025-01-31T12:05Z"), { print }), main(base.slice(0, 4), { print })], [0, 1, 2]);
  assert.deepEqual(lines.map(([l, e]) => [(JSON.parse(l) as { stop?: string }).stop ?? "report", e]), [["report", false], ["bad_time", true],
    ["usage", true]], "the report on stdout, one refusal line on stderr");
});

/** Every leaf of a JSON value. */
const leaves = (v: unknown): unknown[] => (v !== null && typeof v === "object" ? Object.values(v).flatMap(leaves) : [v]);
const FORMS = [/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00Z$/, /^\d{4}-\d{2}$/, /^[0-9a-f]{64}$/, /^(coinbase|USDT-USD|episode|lead-in|open-at-end)$/];

// killer: scripts/detect-ee7-history.mjs:179 CONST "open_time_utc: f[0]" -> "open_time_utc: f[5]"
test("ee7_writes_no_price_nor_volume_in_its_report_nor_in_a_refusal", () => {
  const up = "1.01234567", down = "0.99987654", cells: Cells = ["0.97531246", "1.02468135", "1.00013579", "86420.1357"];
  const values = [up, down, ...cells, "1.0123456e0"], reads = [...rep(down, 4), ...rep(up, 4), ...rep(down, 100)];
  const lines: [string, boolean][] = [], print = (l: string, toStderr: boolean): void => { lines.push([l, toStderr]); };
  const root = sealed(T0, reads, cells), files = (): string[] => walk(root).map((n) => `${n} ${sha(readFileSync(join(root, n)))}`);
  const before = files();
  assert.equal(main(argvOf(root, T0, reads.length), { print }), 0);
  const report = lines[0]?.[0] ?? "";
  assert.deepEqual([shape(JSON.parse(report) as Ee7Report), files()], [[[4, 104, 100]], before], "one episode; the folders untouched");
  for (const leaf of leaves(JSON.parse(report) as unknown)) {
    const count = typeof leaf === "number" && Number.isSafeInteger(leaf) && leaf >= 0;
    assert.ok(leaf === null || count || (typeof leaf === "string" && FORMS.some((re) => re.test(leaf))), JSON.stringify(leaf));
  }
  const refusals: [(dir: string) => void, string][] = [[csvCells(5, (c) => c.map((x, i) => (i === 5 ? "1.0123456e0" : x))), "bad_value"],
    [csvLines((ls) => ls.slice(1)), "csv_header"], [csvCells(7, (c) => [...c, up]), "csv_row"]];
  for (const [alter, code] of refusals) {
    const bad = sealed(T0, reads, cells), dir = join(bad, "2025-01", "15m");
    alter(dir);
    seal(dir);
    assert.equal(main(argvOf(bad, T0, reads.length), { print }), 1);
    assert.equal((JSON.parse(lines.at(-1)?.[0] ?? "{}") as { stop?: string }).stop, code);
  }
  for (const [line] of lines) for (const v of values) assert.ok(!line.includes(v), `${v} printed`);
  const source = readFileSync(SCRIPT, "utf8");
  assert.deepEqual(source.match(/\b(writeFileSync|appendFileSync|createWriteStream|mkdirSync|rmSync|renameSync|copyFileSync|unlinkSync|fetch|node:https?|node:net|node:child_process)\b/g), null, "the detector reads only: no write API, no network, no child process");
});

// killer: scripts/detect-ee7-history.mjs:292 SDL "process.exitCode = main" -> ""
test("ee7_command_line_prints_one_report_line_and_exits_0_1_or_2", () => {
  const reads = [...rep(C, 4), ...rep(D, 4), ...rep(C, 100)], argv = argvOf(sealed(T0, reads), T0, reads.length);
  const cli = (args: readonly string[]): [number | null, string, string] => {
    const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8", timeout: 60_000 });
    return [r.status, r.stdout, r.stderr];
  };
  const [code, out, err] = cli(argv);
  assert.deepEqual([code, err, out.split(LF).length, out.endsWith(LF)], [0, "", 2, true], "one JSON line on stdout");
  assert.deepEqual(JSON.parse(out) as unknown, run(argv));
  const stopOf = (text: string): string | undefined => (JSON.parse(text) as { stop?: string }).stop;
  const [c1, o1, e1] = cli(argv.map((v) => (v === iso(T0) ? "2025-01-31T12:05Z" : v))), [c2, o2, e2] = cli(argv.slice(0, 4));
  assert.deepEqual([c1, o1, stopOf(e1), c2, o2, stopOf(e2)], [1, "", "bad_time", 2, "", "usage"]);
});

const VALUES: Readonly<Record<Exclude<Cls, "absent">, readonly string[]>> = {
  calm: ["1", "0.9990", "1.0049", "0.9951", "1.0049999999999999999"],
  mid: ["1.005", "0.995", "1.0070", "1.01", "0.99", "1.0099999999999999999"],
  depart: ["1.0150", "0.9800", "1.0100000000000000001", "0.9899999999999999999"],
};
/** A seeded series in three regimes (calm, stress, outage), each read with its class. */
function seeded(seed: number, n: number): { reads: Read[]; cls: Cls[] } {
  let s = seed >>> 0, regime = 0;
  const rnd = (): number => { s = (Math.imul(s, 1_664_525) + 1_013_904_223) >>> 0; return s / 4_294_967_296; };
  const reads: Read[] = [], cls: Cls[] = [];
  for (let i = 0; i < n; i++) {
    const u = rnd(), v = rnd(), w = rnd();
    regime = regime === 0 ? (u < 0.006 ? 1 : u < 0.01 ? 2 : 0) : u < (regime === 1 ? 0.04 : 0.03) ? 0 : regime;
    const c: Cls = regime === 2 ? "absent" : regime === 1 ? (v < 0.7 ? "depart" : v < 0.8 ? "mid" : v < 0.9 ? "calm" : "absent")
      : v < 0.95 ? "calm" : v < 0.96 ? "mid" : v < 0.965 ? "depart" : "absent";
    const pool = c === "absent" ? [] : VALUES[c];
    cls.push(c);
    reads.push(c === "absent" ? null : pool[Math.floor(w * pool.length)] ?? null);
  }
  return { reads, cls };
}
/** The rule read naively from addendum 4, section 3, on the classes alone: rescans everything, no prefix sums, no decimal. */
function naive(cls: readonly Cls[]): Shape[] {
  const n = cls.length, out: Shape[] = [], present = (i: number): boolean => cls[i] !== "absent";
  const calmDay = (f: number): boolean => {
    const day = cls.slice(Math.max(0, f - DAY), f).filter((c) => c !== "absent");
    return day.length >= 48 && day.every((c) => c === "calm");
  };
  for (let t = 0; ;) {
    let s = -1, fourth = -1;
    for (let i = t; i < n && s < 0; i++) {
      if (cls[i] !== "depart") continue;
      const next = [i];
      for (let j = i + 1; j < n && next.length < 4 && cls[j] !== "mid" && cls[j] !== "calm"; j++) if (present(j)) next.push(j);
      if (next.length === 4) [s, fourth] = [i, next[3] ?? -1];
    }
    if (s < 0) return out;
    let f = fourth + 1;
    while (f <= n && !calmDay(f)) f += 1;
    out.push([s, f <= n ? f : null, cls.slice(s, Math.min(f, n)).filter((c) => c !== "absent").length]);
    if (f > n) return out;
    t = f;
  }
}

// killer: scripts/detect-ee7-history.mjs:227 CONST "!calm(x) ? 1 : 0" -> "departs(x) ? 1 : 0"
test("ee7_agrees_with_a_naive_reading_of_the_rule_on_seeded_series", () => {
  const from = Date.UTC(2024, 6, 3);
  let episodes = 0, open = 0, leadIn = 0;
  for (let seed = 1; seed <= 8; seed++) {
    const { reads, cls } = seeded(seed, 1500), r = detectOn(reads, from), expected = naive(cls);
    assert.deepEqual(shape(r, from), expected, `seed ${String(seed)}`);
    const leadIns = r.episodes.filter((e) => e.kind === "lead-in").map((e) => e.F); // P1 (G2 of lot EE7-ADD7-1, D-6), before the naive reading
    assert.ok(leadIns.length <= 1 && leadIns.every((F) => r.calm_certified_from === null || F === r.calm_certified_from), `seed ${String(seed)}: P1`);
    assert.deepEqual(r.reads, { present: cls.filter((c) => c !== "absent").length, absent: cls.filter((c) => c === "absent").length });
    const lastDay = (f: number | null): number => { // C4; an open episode counts [--to - 24 h, --to) (D-5)
      const g = f ?? cls.length;
      return cls.slice(Math.max(0, g - DAY), g).filter((c) => c !== "absent").length;
    };
    const head = (cs: readonly Cls[]): number => { // the departing reads before the first present read inside the band
      const inside = cs.findIndex((c) => c === "calm" || c === "mid");
      return cs.slice(0, inside < 0 ? cs.length : inside).filter((c) => c === "depart").length;
    };
    assert.deepEqual([r.episodes.map((e) => e.present_reads_last_24h), r.edge], [expected.map((e) => lastDay(e[1])),
      { start: head(cls), end: head(cls.toReversed()) }], `seed ${String(seed)}: C4 and edge`);
    const calmDay = (f: number): boolean => { // F-1, read naively: the 96 classes before f hold 48 present reads or more, all calm
      const day = cls.slice(f - DAY, f).filter((c) => c !== "absent");
      return day.length >= 48 && day.every((c) => c === "calm");
    };
    const certified = cls.findIndex((_, f) => f >= DAY && calmDay(f));
    assert.equal(r.calm_certified_from, certified < 0 ? null : iso(from + certified * STEP), `seed ${String(seed)}: calm_certified_from`);
    const whole = (s: number): boolean => certified >= 0 && s >= certified; // addendum 7, read naively: W4 first, then W3
    assert.deepEqual(r.episodes.map((e) => [e.kind, e.exclude_from, e.F]), expected.map(([s, f]) => [f === null ? "open-at-end"
      : whole(s) ? "episode" : "lead-in", iso(from + (whole(s) ? s : 0) * STEP), iso(from + (f ?? cls.length) * STEP)]), `seed ${String(seed)}: kinds`);
    assert.ok(expected.every(([s, f]) => f !== null || whole(s) || certified < 0), `seed ${String(seed)}: an open episode is never a lead-in`);
    episodes += expected.length;
    open += expected.filter((e) => e[1] === null).length;
    leadIn += expected.filter(([s, f]) => f !== null && !whole(s)).length;
  }
  assert.deepEqual([episodes, open, leadIn], [23, 6, 5],
    "the seeded series: 23 episodes, 17 closed (5 of them lead-in) and 6 open at the end (measured, G1 journals of both lots)");
});

// killer: scripts/detect-ee7-history.mjs:216 CONST "book.get(tau - STEP_MS)" -> "book.get(tau)"
test("ee7_reads_at_tau_the_close_of_the_candle_that_starts_at_tau_minus_15_min", () => {
  // Addendum 5, C2, with the candles written by their START (no read index): read at its own stamp (the future), S would fall at 12:00
  // and F at 13:15, on the candles stamped there; a missing candle replaced by the one stamped tau would open an episode at 06:15.
  const first = Date.UTC(2025, 2, 9, 23, 45), marks = new Map<string, Read>([
    ["2025-03-10T06:00", D], ["2025-03-10T06:15", D], ["2025-03-10T06:30", A], ["2025-03-10T06:45", D], // read 06:45 absent: 3 reads
    ["2025-03-10T12:00", D], ["2025-03-10T12:15", A], ["2025-03-10T12:30", D], ["2025-03-10T12:45", D], ["2025-03-10T13:00", D],
    ["2025-03-11T13:30", D], ["2025-03-11T13:45", D], ["2025-03-11T14:00", D], ["2025-03-11T14:15", D], // a burst stamped from F on
  ]);
  const candles = Array.from({ length: 2 * DAY }, (_, k): Read => {
    const stamp = iso(first + k * STEP).slice(0, 16);
    return marks.has(stamp) ? marks.get(stamp) ?? null : C;
  });
  const r = run(argvOf(candlesAt(first, candles), first + STEP, candles.length));
  assert.deepEqual(r.episodes, [
    { kind: "lead-in", S: "2025-03-10T12:15:00Z", F: "2025-03-11T13:30:00Z", exclude_from: "2025-03-10T00:00:00Z", present_reads_in_episode: 100,
      present_reads_last_24h: 96 },
    { kind: "open-at-end", S: "2025-03-11T13:45:00Z", F: "2025-03-12T00:00:00Z", exclude_from: "2025-03-11T13:45:00Z",
      present_reads_in_episode: 41, present_reads_last_24h: 96 },
  ], "S = 12:15, the close of the 12:00 candle; F = 24 h after 13:15, the read of the 13:00 candle, plus 15 min; then S = 13:45");
  assert.deepEqual([r.window, r.reads, r.edge, r.open_episode_at_end], [
    { from: "2025-03-10T00:00:00Z", to_exclusive: "2025-03-12T00:00:00Z" }, { present: 190, absent: 2 }, { start: 0, end: 0 },
    "2025-03-11T13:45:00Z"], "the reads at 06:45 and 12:30 are absent: the candles that start 15 min earlier are missing");
});

// killer: scripts/detect-ee7-history.mjs:240 CONST "present[f - span]" -> "present[f - span + 1]"
test("ee7_prints_the_present_reads_of_the_day_before_F_and_before_to_while_open", () => {
  const gappy = Array.from({ length: DAY }, (_, i): Read => (i % 4 === 3 ? A : C)); // 72 present calm reads, 24 absent
  const r = detectOn([...rep(C, 4), ...rep(D, 4), ...gappy, ...rep(C, 20), ...rep(D, 4), ...rep(C, 30)]);
  assert.deepEqual([r.episodes, r.reads], [[
    { kind: "lead-in", S: iso(T0 + 4 * STEP), F: iso(T0 + 104 * STEP), exclude_from: iso(T0), present_reads_in_episode: 76,
      present_reads_last_24h: 72 },
    { kind: "open-at-end", S: iso(T0 + 124 * STEP), F: iso(T0 + 158 * STEP), exclude_from: iso(T0 + 124 * STEP), present_reads_in_episode: 34,
      present_reads_last_24h: 85 },
  ], { present: 134, absent: 24 }], "C4: 72 present reads in [F - 24 h, F), 85 in [--to - 24 h, --to) (D-5), 24 absent reads; S and F do not move");
});

// killer: scripts/detect-ee7-history.mjs:252 CONST "continue;" -> "break;"
test("ee7_counts_the_departing_reads_in_a_row_at_both_edges_of_the_window", () => {
  const cut = detectOn([A, D, A, D, D, D, ...rep(C, 110), D, A, D, D]); // --from cuts a run (it opens at once), --to cuts 3 reads
  assert.deepEqual([cut.edge, shape(cut), cut.open_episode_at_end], [{ start: 4, end: 3 }, [[1, 102, 100]], null],
    "4 at the start: an S at the first present read may be late; the 3 at the end open nothing in this window");
  assert.deepEqual([detectOn([D, A, D]).edge, detectOn([M, D, D, D, M]).edge], [{ start: 2, end: 2 }, { start: 0, end: 0 }],
    "an absent read is skipped; a present read inside the band ends the count");
});

// killer: scripts/detect-ee7-history.mjs:242 CONST "[run, i] = [[], f];" -> "[run, i] = [[], f + 1];"
test("ee7_opens_the_next_episode_at_the_very_instant_F_of_the_previous_one", () => {
  const r = detectOn([...rep(C, 4), ...rep(D, 4), ...rep(C, 96), ...rep(D, 4), ...rep(C, 100)]);
  assert.deepEqual(shape(r), [[4, 104, 100], [104, 204, 100]], "F1 = 104 (the day [8, 104) is calm) and the read at 104 departs: S2 = F1");
});

// killer: scripts/detect-ee7-history.mjs:230 CONST "let first = span;" -> "let first = 0;"
test("ee7_certifies_the_calm_from_the_first_whole_calm_day_inside_the_window", () => {
  // Case T of the G2 (F-1): 4 departing reads, 50 reads between the bands, then calm. Opened at read 20, the window shows no episode
  // and a silent edge, and certifies the calm only from the F of the whole run (read 160): before it, an episode may be invisible.
  const t = [...rep(C, 10), ...rep(D, 4), ...rep(M, 50), ...rep(C, 200)], tRoot = sealed(T0, t);
  const whole = run(argvOf(tRoot, T0, t.length)), cut = run(argvOf(tRoot, T0 + 20 * STEP, t.length - 20));
  assert.deepEqual([shape(whole), whole.calm_certified_from], [[[10, 160, 150]], iso(T0 + 160 * STEP)], "the whole run: S 10, F 160");
  assert.deepEqual([cut.episodes, cut.edge, cut.open_episode_at_end, cut.calm_certified_from], [[], { start: 0, end: 0 }, null,
    whole.episodes[0]?.F], "the cut window shows nothing and certifies the calm at the F that it cannot see");
  // Case L: opened just after a burst, the window's first 48 calm reads certify nothing (their day began before --from); a second
  // burst that the whole run absorbs shows with a late S, before the certified instant; the episode after it is the same in both.
  const l = [...rep(C, 10), ...rep(D, 4), ...rep(C, 60), ...rep(D, 4), ...rep(C, 200), ...rep(D, 4), ...rep(C, 100)];
  const lRoot = sealed(T0, l), full = run(argvOf(lRoot, T0, l.length)), late = run(argvOf(lRoot, T0 + 14 * STEP, l.length - 14));
  assert.deepEqual([shape(full), shape(late, T0)], [[[10, 174, 164], [278, 378, 100]], [[74, 174, 100], [278, 378, 100]]],
    "the burst at 74 belongs to the episode of 10; opened at 14, the window gives it S 74: late, F equal");
  assert.deepEqual([full.calm_certified_from, late.calm_certified_from], [iso(T0 + 174 * STEP), iso(T0 + 174 * STEP)],
    "both certify at 174, never at 62 where the cut window's first 48 calm reads end");
});

// killer: scripts/detect-ee7-history.mjs:205 CONST "t < to - STEP_MS" -> "t < to"
test("ee7_reads_no_month_after_the_month_of_the_last_candle_that_the_window_reads", () => {
  // --to 2025-02-01T00:15Z: the last read, at 00:00, is the close of January's last candle; February is not needed.
  const reads = rep(C, 49), argv = argvOf(sealed(T0, reads), T0, reads.length);
  assert.equal(outcome(() => run(argv)), "ok", "no month folder of February is written, none is needed");
  assert.deepEqual([run(argv).source.months.map((m) => m.month), run(argv).reads], [["2025-01"], { present: 49, absent: 0 }]);
});

// killer: scripts/detect-ee7-history.mjs:138 CONST "name === \"SHA256SUMS\" || " -> ""
test("ee7_refuses_a_SHA256SUMS_that_lists_itself_as_malformed", () => {
  const reads = [...rep(C, 4), ...rep(D, 4), ...rep(C, 100)], root = sealed(T0, reads), sums = join(root, "2025-02", "15m", "SHA256SUMS");
  appendFileSync(sums, `${sha(readFileSync(sums))}  SHA256SUMS${LF}`); // its digest before this line, never its digest after it
  assert.equal(outcome(() => run(argvOf(root, T0, reads.length))), "sums_malformed", "a seal that lists itself: malformed, not a mismatch");
});

// killer: scripts/detect-ee7-history.mjs:175 CONST "ms < 0 || ms > MAX_MS ||" -> "ms < 0 ||"
test("ee7_refuses_an_open_time_past_the_last_instant_of_a_date_by_its_name", () => {
  const from = Date.UTC(2025, 5, 2), reads = [...rep(C, 4), ...rep(D, 4), ...rep(C, 8)], root = sealed(from, reads);
  const dir = join(root, "2025-06", "15m");
  csvCells(1, (c) => [...c.slice(0, 1), "9000000000000000", ...c.slice(2)])(dir); // 16 digits: past 8.64e15 ms, the last Date
  seal(dir);
  assert.equal(outcome(() => run(argvOf(root, from, reads.length))), "csv_row", "a named refusal, never a RangeError");
});

// killer: scripts/detect-ee7-history.mjs:292 CONST "realpathSync(invoked) === realpathSync(SCRIPT)" -> "resolve(invoked) === resolve(SCRIPT)"
test("ee7_command_line_runs_when_called_through_a_directory_junction", () => {
  const reads = [...rep(C, 4), ...rep(D, 4), ...rep(C, 100)], argv = argvOf(sealed(T0, reads), T0, reads.length), dir = fresh();
  const real = join(dir, "real"), jx = join(dir, "jx"); // jx: a directory junction to real (a symbolic link off Windows)
  mkdirSync(real, { recursive: true });
  copyFileSync(SCRIPT, join(real, "detect-ee7-history.mjs")); // the same bytes, hence the same detector_sha256
  symlinkSync(real, jx, "junction");
  try {
    const r = spawnSync(process.execPath, [join(jx, "detect-ee7-history.mjs"), ...argv], { encoding: "utf8", timeout: 60_000 });
    assert.deepEqual([r.status, r.stderr, r.stdout.split(LF).length], [0, "", 2], "one report line, as when called by its real path");
    assert.deepEqual(JSON.parse(r.stdout) as unknown, run(argv));
    // N11 of the campaign of the fusion (MAIN-GUARD-REALPATH-1): under --preserve-symlinks-main, import.meta.url names the junction; the
    // guard compares two real paths and prints the same line (a guard that compared a real path with SCRIPT printed nothing, exit 0)
    const kept = spawnSync(process.execPath, ["--preserve-symlinks-main", join(jx, "detect-ee7-history.mjs"), ...argv], { encoding: "utf8", timeout: 60_000 });
    assert.deepEqual([kept.status, kept.stderr, kept.stdout], [0, "", r.stdout], "--preserve-symlinks-main: the same report line");
  } finally { rmSync(jx, { force: true }); }
});

// killer: scripts/detect-ee7-history.mjs:292 CONST "existsSync(invoked) && " -> ""
test("ee7_imported_by_a_process_whose_argv_names_an_absent_path_runs_nothing", () => {
  // N8 of the campaign of the fusion (MAIN-GUARD-REALPATH-1), its measured form: node -e imports the detector, argv[1] an absent path:
  // the guard runs nothing and throws nothing (exit 0, nothing printed)
  const imported = `await import(${JSON.stringify(pathToFileURL(SCRIPT).href)});`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", imported, join(ROOT, "absent")], { encoding: "utf8", timeout: 60_000,
    env: { SYSTEMROOT: process.env.SYSTEMROOT } });
  assert.deepEqual([r.status, r.stdout, r.stderr], [0, "", ""]);
});

// killer: scripts/detect-ee7-history.mjs:269 CONST "certified === null ? null : at(certified)" -> "at(certified)"
test("ee7_certifies_nothing_without_a_whole_calm_day_inside_the_window", () => {
  const cert = (rs: Read[]): string | null => detectOn(rs).calm_certified_from;
  assert.deepEqual([cert(rep(C, 95)), cert(rep(C, 96)), cert(rep(C, 97)), cert(rep(M, 120)), cert([...rep(C, 4), ...rep(D, 4), ...rep(C, DAY)])],
    [null, null, iso(T0 + DAY * STEP), null, null], "a whole calm day inside the window, ending before --to; null if none (D-2)");
});

/** An edit of manifest.json as a JSON object, written back in the recorder's layout (two-space indent, final line feed). */
const manifestDoc = (f: (doc: Record<string, unknown>) => Record<string, unknown>): ((dir: string) => void) =>
  edit("manifest.json", (t) => JSON.stringify(f(JSON.parse(t) as Record<string, unknown>), null, 2) + LF);

// killer: scripts/detect-ee7-history.mjs:207 SDL "recorders.push(readManifest(dir, month, recorders[0]));" -> ""
test("ee7_refuses_a_month_whose_manifest_is_not_the_recorders_for_usdt_usd_at_900_s_and_that_month", () => {
  const reads = [...rep(C, 4), ...rep(D, 4), ...rep(C, 100)], set = (k: string, v: unknown) => manifestDoc((d) => ({ ...d, [k]: v }));
  const drop = (k: string): ((dir: string) => void) => manifestDoc((d) => Object.fromEntries(Object.entries(d).filter(([n]) => n !== k)));
  const cases: [string, string, (dir: string) => void, string, string | undefined][] = [
    ["2025-02", "the schema of a Binance series", set("schema", "monark.series.binance.v1"), "manifest_mismatch", "schema"],
    ["2025-02", "the schema of the recorder before lot COINBASE-ADD7-1 (D-4)", set("schema", "monark.series.coinbase.v1"), "manifest_mismatch",
      "schema"],
    ["2025-02", "no schema", drop("schema"), "manifest_mismatch", "schema"],
    ["2025-02", "BTC-USD", set("product", "BTC-USD"), "manifest_mismatch", "product"],
    ["2025-01", "BTC-USD in the first month read", set("product", "BTC-USD"), "manifest_mismatch", "product"],
    ["2025-02", "60 s candles", set("granularity_s", 60), "manifest_mismatch", "granularity_s"],
    ["2025-02", "900 written as a string", set("granularity_s", "900"), "manifest_mismatch", "granularity_s"],
    ["2025-02", "a manifest of January filed under February", set("end_exclusive", "2025-02-01T00:00:00Z"), "manifest_mismatch",
      "end_exclusive"],
    ["2025-02", "an end without its seconds", set("end_exclusive", "2025-03-01T00:00Z"), "manifest_mismatch", "end_exclusive"],
    ["2025-02", "no recorder_sha256", drop("recorder_sha256"), "manifest_mismatch", "recorder_sha256"],
    ["2025-02", "a recorder_sha256 in capitals", set("recorder_sha256", "AB".repeat(32)), "manifest_mismatch", "recorder_sha256"],
    ["2025-02", "a recorder_sha256 in an array", set("recorder_sha256", ["ab".repeat(32)]), "manifest_mismatch", "recorder_sha256"],
    ["2025-02", "a recorder_sha256 of 65 hexadecimal digits", set("recorder_sha256", "a".repeat(65)), "manifest_mismatch", "recorder_sha256"],
    ["2025-02", "not JSON", edit("manifest.json", () => "{"), "manifest_malformed", undefined],
    ["2025-02", "an array", edit("manifest.json", () => `[]${LF}`), "manifest_malformed", undefined],
    ["2025-02", "null", edit("manifest.json", () => `null${LF}`), "manifest_malformed", undefined],
    ["2025-02", "a number", edit("manifest.json", () => `5${LF}`), "manifest_malformed", undefined],
  ];
  const lines: string[] = [], print = (l: string): void => { lines.push(l); };
  for (const [month, what, alter, code, key] of cases) {
    const root = sealed(T0, reads), dir = join(root, month, "15m");
    alter(dir);
    seal(dir);
    let exit = -1; // main inside outcome(): an error that is not a stop reddens by assertion (D-3)
    assert.equal(outcome(() => { exit = main(argvOf(root, T0, reads.length), { print }); }), "ok", what);
    const out = JSON.parse(lines.at(-1) ?? "{}") as { stop?: string; detail?: { file?: string; key?: string } };
    assert.deepEqual([exit, out.stop, out.detail?.file, out.detail?.key, STOPS.includes(code)], [1, code, `${month}/15m/manifest.json`, key, true],
      what);
  }
  for (const v of ["binance", "BTC-USD", "ABAB", "2025-03-01T00:00Z"]) assert.ok(lines.every((l) => !l.includes(v)), `${v}: never printed`);
  assert.deepEqual(shape(detectOn(reads)), [[4, 104, 100]], "the manifest as the recorder writes it: the month is read");
});

// killer: scripts/detect-ee7-history.mjs:159 CONST "v === SCHEMA" -> "v === PRODUCT"
test("ee7_reads_a_month_that_the_coinbase_recorder_wrote_and_refuses_it_once_its_manifest_names_btc_usd", async () => {
  const m = Date.UTC(2025, 2, 1), end = Date.UTC(2025, 3, 1), out = join(fresh(), "2025-03", "15m"), i = (k: number): string => iso(m + k * STEP);
  const page = (url: string): Promise<Response> => { // the candles of [start, end] inside March, newest first; 4 depart from slot 100
    const q = new URL(url).searchParams, rows: string[] = [];
    for (let t = Math.min(Date.parse(q.get("end") ?? ""), end - STEP); t >= Math.max(Date.parse(q.get("start") ?? ""), m); t -= STEP) {
      const k = (t - m) / STEP;
      rows.push(`[${String(t / 1000)},0.97,1.03,1.00,${k >= 100 && k < 104 ? D : C},250.5]`);
    }
    return Promise.resolve(new Response(`[${rows.join(",")}]`, { status: 200 }));
  };
  const io = { fetch: page, sleep: (): Promise<void> => Promise.resolve(), now: (): number => Date.UTC(2026, 9, 3), env: {}, execArgv: [] };
  await record(["--product", "USDT-USD", "--granularity", "15m", "--start", iso(m), "--end", iso(end), "--out", out], io);
  const argv = ["--root", dirname(dirname(out)), "--from", i(1), "--to", iso(end + STEP)];
  assert.equal(outcome(() => run(argv)), "ok", "the month that the recorder wrote is read (D-3: a stop reddens by assertion)");
  const r = run(argv);
  assert.deepEqual([r.source.months.map((x) => x.month), r.reads, r.calm_certified_from, r.episodes], [["2025-03"], { present: 2976, absent: 0 },
    i(97), [{ kind: "episode", S: i(101), F: i(201), exclude_from: i(101), present_reads_in_episode: 100, present_reads_last_24h: 96 }]],
    "read k is the close of candle k of March; S at the burst's first candle plus 15 min, after the calm certified at 97: an episode");
  manifestDoc((d) => ({ ...d, product: "BTC-USD" }))(out);
  seal(out);
  assert.equal(outcome(() => run(argv)), "manifest_mismatch", "the same folder, its manifest naming BTC-USD, resealed");
});

// killer: scripts/detect-ee7-history.mjs:271 CONST "whole(e) ? e.s : 0" -> "e.s"
test("ee7_lists_an_episode_whose_S_precedes_calm_certified_from_as_lead_in_excluded_from_from", () => {
  // Case L of ee7_certifies_the_calm_from_the_first_whole_calm_day_inside_the_window, opened at read 14: the first episode shows a late
  // S (74, where the whole run has 10); W3 lists it, never drops it, and excludes it from --from, so that the late S never
  // under-excludes; the second begins after the calm certified at 174: excluded from its S.
  const l = [...rep(C, 10), ...rep(D, 4), ...rep(C, 60), ...rep(D, 4), ...rep(C, 200), ...rep(D, 4), ...rep(C, 100)];
  const late = run(argvOf(sealed(T0, l), T0 + 14 * STEP, l.length - 14)), i = (k: number): string => iso(T0 + k * STEP);
  assert.deepEqual([late.calm_certified_from, late.episodes.map((e) => [e.kind, e.S, e.exclude_from, e.F])], [i(174), [["lead-in", i(74), i(14),
    i(174)], ["episode", i(278), i(278), i(378)]]], "lead-in: excluded over [--from, F); episode: over [S, F)");
});

// killer: scripts/detect-ee7-history.mjs:263 ROR "e.s >= certified" -> "e.s > certified"
test("ee7_counts_an_S_at_exactly_calm_certified_from_as_certified", () => {
  const r = detectOn([...rep(C, 4), ...rep(D, 4), ...rep(C, DAY), ...rep(D, 4), ...rep(C, 100)]), i = (k: number): string => iso(T0 + k * STEP);
  assert.deepEqual([r.calm_certified_from, r.episodes.map((e) => [e.kind, e.S, e.exclude_from, e.F])], [i(104), [["lead-in", i(4), i(0), i(104)],
    ["episode", i(104), i(104), i(204)]]], "S2 = F1 = calm_certified_from = 104: the day [8, 104) is calm, so S2 is that of the whole recording");
});

// killer: scripts/detect-ee7-history.mjs:271 CONST "e.f ?? reads.length" -> "e.f"
test("ee7_gives_an_episode_still_open_at_to_F_equal_to_to_and_lists_it_open_at_end", () => {
  // W4: never an F null. Its S (104) follows the calm certified at 96: excluded from S; C4 counts [--to - 24 h, --to) (D-5): 96.
  const r = detectOn([...rep(C, DAY + 8), ...rep(D, 4), ...rep(C, 30)]), i = (k: number): string => iso(T0 + k * STEP);
  assert.deepEqual([r.calm_certified_from, r.episodes, r.open_episode_at_end, r.window.to_exclusive], [i(96), [{ kind: "open-at-end", S: i(104),
    F: i(138), exclude_from: i(104), present_reads_in_episode: 34, present_reads_last_24h: 96 }], i(104), i(138)]);
});

// killer: scripts/detect-ee7-history.mjs:263 CONST "certified !== null && " -> ""
test("ee7_certifies_no_S_while_calm_certified_from_is_null_provisionally", () => {
  // Q-1 of lot EE7-ADD7-1, provisional: no certified calm in the window, so no S is certified and every episode is excluded from
  // --from (W3: never under-exclude); W4 still lists an open one open-at-end. A calm day that ends at --to certifies nothing (F-1).
  // The open one's C4 (D-5): [--to - 24 h, --to) begins before --from, so it counts the window's 58 present reads, never a read before.
  const closed = detectOn([...rep(C, 4), ...rep(D, 4), ...rep(C, DAY)]), open = detectOn([...rep(C, 4), ...rep(D, 4), ...rep(C, 50)]);
  const i = (k: number): string => iso(T0 + k * STEP);
  assert.deepEqual([closed.calm_certified_from, closed.episodes, open.calm_certified_from, open.episodes], [null, [{ kind: "lead-in", S: i(4),
    F: i(104), exclude_from: i(0), present_reads_in_episode: 100, present_reads_last_24h: 96 }], null, [{ kind: "open-at-end", S: i(4), F: i(58),
    exclude_from: i(0), present_reads_in_episode: 54, present_reads_last_24h: 58 }]]);
});

/** Lot COINBASE-PRE-LOOP-1: the reads of a run over 2025-01 and 2025-02, its folders sealed after `alter` changed the named months. */
const altered = (alter: ReadonlyMap<string, (dir: string) => void>): [string, string[]] => {
  const reads = [...rep(C, 4), ...rep(D, 4), ...rep(C, 100)], root = sealed(T0, reads);
  for (const [month, f] of alter) { f(join(root, month, "15m")); seal(join(root, month, "15m")); }
  return [root, argvOf(root, T0, reads.length)];
};
/** [exit, stop, file, key] of one run through main (inside outcome: an error that is not a stop reddens by assertion). */
const refusal = (argv: string[]): [number, string | undefined, string | undefined, string | undefined, string] => {
  const lines: string[] = [];
  let exit = -1;
  const how = outcome(() => { exit = main(argv, { print: (l: string): void => { lines.push(l); } }); });
  const out = JSON.parse(lines.at(-1) ?? "{}") as { stop?: string; detail?: { file?: string; key?: string } };
  return [exit, out.stop, out.detail?.file, out.detail?.key, how];
};

// killer: scripts/detect-ee7-history.mjs:159 ROR "v === 1," -> "v >= 1,"
test("ee7_refuses_a_month_whose_manifest_is_not_a_sealed_pass_1", () => {
  // the rest of EE7-MANIFEST-READ-1 (m2 of the review of RECHERCHES): a folder of pass 2, or one whose manifest lacks pass, or names it as
  // text, is never read as the series; nor one that counts an empty page (the recorder writes none: it stops) or lacks the count
  const set = (k: string, v: unknown) => manifestDoc((d) => ({ ...d, [k]: v }));
  const drop = (k: string) => manifestDoc((d) => Object.fromEntries(Object.entries(d).filter(([n]) => n !== k)));
  const cases: [string, (dir: string) => void, string][] = [["pass 2", set("pass", 2), "pass"], ["no pass", drop("pass"), "pass"],
    ["pass as text", set("pass", "1"), "pass"], ["an empty page counted", set("empty_pages", 1), "empty_pages"],
    ["no empty_pages", drop("empty_pages"), "empty_pages"]];
  for (const [what, alter, key] of cases) {
    assert.deepEqual(refusal(altered(new Map([["2025-02", alter]]))[1]), [1, "manifest_mismatch", "2025-02/15m/manifest.json", key, "ok"], what);
  }
  assert.deepEqual(refusal(altered(new Map())[1]), [0, undefined, undefined, undefined, "ok"], "pass 1, no empty page: read");
});

// killer: scripts/detect-ee7-history.mjs:161 CONST "(first ?? v) === v" -> "true"
test("ee7_refuses_months_written_by_different_recorders", () => {
  // m2, the choice of the G0 of lot COINBASE-PRE-LOOP-1: recorder_sha256 identical over every month that the run reads (S and F come
  // from one run over the whole recording); the first month read sets it, a later one that differs is refused there, by its key alone
  const other = (dir: string): void => { manifestDoc((d) => ({ ...d, recorder_sha256: sha("another recorder") }))(dir); };
  const [root, argv] = altered(new Map([["2025-02", other]]));
  assert.deepEqual(refusal(argv), [1, "manifest_mismatch", "2025-02/15m/manifest.json", "recorder_sha256", "ok"], "the second month differs");
  assert.deepEqual(refusal(altered(new Map([["2025-01", other]]))[1]), [1, "manifest_mismatch", "2025-02/15m/manifest.json", "recorder_sha256",
    "ok"], "the first month differs: the second is refused");
  other(join(root, "2025-01", "15m"));
  seal(join(root, "2025-01", "15m"));
  assert.deepEqual(refusal(argv), [0, undefined, undefined, undefined, "ok"], "both months of the other recorder: read (not pinned)");
});
