// test/compare-coinbase-passes.test.ts -- lot COINBASE-ADD7-1 (ADR 0006 addendum 7 R1): scripts/compare-coinbase-passes.mjs, the
// comparison of the two readings of a month, on folders that the recorder (scripts/record-coinbase-candles.mjs) writes in-process, pass 1
// and --pass 2, from pages that an injected fetch builds in memory (both bounds served, newest first): no server and no network, the
// global fetch a tripwire; child processes run the command line (one test: no argument, a usage stop; through a junction; imported
// with an absent argv[1]; two readings of a window of 149 slots, refused). Each test names, on the line above
// it, the production mutation that reddens it (scripts/red-proof.mjs convention). Every candle value is made up; the closes of the
// candles that a test singles out carry a mark (MARKS) that is searched in every line that the comparison prints, never found. The
// folders are hashed before and after each comparison: it writes nothing. Copies of folders, changed then sealed again or not, hold each
// guard of the comparison (G2-5 of the G2). One test runs the recorder alone, on pages that disagree on a slot (W10 of the campaign of
// the fusion): it kills a mutant of a file that exists at the base, so it lives here, in the test file of a module that the lot adds
// (red-proof refuses a test green at the base: Q-A7-11). Lot COINBASE-PASS-EDGES-1: the series run 150 slots past each side of the
// window (pass 2 reads 149 slots on each side, its witnesses); one test replays, in months of 28 to 31 days, the omission that the G2 of
// COINBASE-ADD7-1 measured, one holds witness_slots. Outputs under the OS temp directory, removed after the file.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { main, STOPS } from "../scripts/compare-coinbase-passes.mjs";
import { RecorderStop, run as record } from "../scripts/record-coinbase-candles.mjs";

globalThis.fetch = (): Promise<Response> => Promise.reject(new Error("tripwire: these tests never call the global fetch"));
const STEP = 900_000, T0 = Date.UTC(2023, 0, 2), N = 700, LF = String.fromCharCode(10), MARKS = ["6.6666", "7.7777", "8.8888"];
const ROOT = mkdtempSync(join(tmpdir(), "coinbase-passes-")), SCRIPT = fileURLToPath(new URL("../scripts/compare-coinbase-passes.mjs", import.meta.url));
after(() => { rmSync(ROOT, { recursive: true, force: true, maxRetries: 3 }); });
let made = 0;
const fresh = (): string => join(ROOT, `out-${String(++made)}`);
const at = (i: number): number => T0 + i * STEP;
const iso = (ms: number): string => new Date(ms).toISOString().replace(".000Z", "Z");
const sha = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
/** Slots [-150, N + 150) with their close (made up): [0, N), the margins of pass 1 and the slots that pass 2 reads outside [0, N); `skip`
 *  has no trade, `marked` carries a close of MARKS. */
const series = (skip: readonly number[] = [], marked: ReadonlyMap<number, string> = new Map()): Map<number, string> =>
  new Map(Array.from({ length: N + 300 }, (_, i) => i - 150).filter((i) => !skip.includes(i)).map((i) => [at(i), marked.get(i) ?? "1.0001"]));
/** The injected fetch: both bounds served, newest first, each number written as text. */
const pagesOf = (s: ReadonlyMap<number, string>) => (url: string): Promise<Response> => {
  const q = new URL(url).searchParams, a = Date.parse(q.get("start") ?? ""), b = Date.parse(q.get("end") ?? "");
  const rows = [...s].filter(([t]) => t >= a && t <= b).sort((x, y) => y[0] - x[0]).map(([t, c]) => `[${String(t / 1000)},0.9990,1.0010,1.0000,${c},125.5]`);
  return Promise.resolve(new Response(`[${rows.join(",")}]`, { status: 200 }));
};
/** One recording of [0, end) from `s`, pass 1 or 2: its folder, asserted written (a named stop reddens by assertion, never by a crash). */
async function recorded(s: ReadonlyMap<number, string>, pass: string, end = N): Promise<string> {
  const out = fresh(), argv = ["--product", "USDT-USD", "--granularity", "15m", "--start", iso(at(0)), "--end", iso(at(end)), "--out", out];
  const m = await record([...argv, "--pass", pass], { fetch: pagesOf(s), sleep: () => Promise.resolve(), env: {}, execArgv: [] })
    .catch((e: unknown) => assert.fail(`pass ${pass} not written: ${e instanceof Error ? e.message : "unknown"}`));
  assert.deepEqual([m.pass, m.empty_pages], [Number(pass), 0]);
  return out;
}
/** sha256 over every file of a folder (name and bytes), to show that a comparison writes nothing. */
const digest = (dir: string): string => sha(readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile())
  .map((e) => `${join(e.parentPath, e.name)} ${sha(readFileSync(join(e.parentPath, e.name)))}`).sort().join(LF));
/** One comparison through main: [exit code, the parsed line, printed on stderr]; the line holds no mark and the folders are unchanged. */
function compare(one: string, two: string): [number, Record<string, unknown>, boolean] {
  const lines: [string, boolean][] = [], before = [digest(one), digest(two)];
  const code = main(["--pass-1", one, "--pass-2", two], { print: (l, e) => { lines.push([l, e]); } });
  const [line, toStderr] = lines[0] ?? ["{}", false], said = JSON.parse(line) as Record<string, unknown>;
  assert.deepEqual([lines.length, MARKS.filter((x) => line.includes(x)), [digest(one), digest(two)]], [1, [], before], "one line, no value, nothing written");
  if (typeof said.stop === "string") assert.ok(STOPS.includes(said.stop), `${said.stop}: a code missing from STOPS`);
  return [code, said, toStderr];
}

// killer: scripts/compare-coinbase-passes.mjs:140 SDL "else both += 1;" -> ""
test("coinbase_passes_agree_on_two_readings_of_one_month", async () => {
  // three slots without trade, read as missing by both passes; a marked close read the same by both: exit 0, the closed result
  const s = series([5, 300, 451], new Map([[7, MARKS[1] ?? ""]])), one = await recorded(s, "1"), two = await recorded(s, "2");
  const [code, said, toStderr] = compare(one, two);
  assert.deepEqual([code, toStderr, Object.keys(said)], [0, false, ["ok", "schema", "product", "granularity", "start", "end_exclusive", "slots",
    "both", "neither", "pass_1", "pass_2", "compare_sha256"]]);
  assert.deepEqual([said.schema, said.product, said.granularity, said.start, said.end_exclusive, said.slots, said.both, said.neither],
    ["monark.coinbase.passes.v1", "USDT-USD", "15m", iso(at(0)), iso(at(N)), N, N - 3, 3]);
  const digests = (dir: string): Record<string, string> => ({ sums_sha256: sha(readFileSync(join(dir, "SHA256SUMS"))),
    csv_sha256: sha(readFileSync(join(dir, "USDT-USD-15m.csv"))) });
  assert.deepEqual([said.pass_1, said.pass_2, said.compare_sha256], [digests(one), digests(two), sha(readFileSync(SCRIPT))]);
});

// killer: scripts/compare-coinbase-passes.mjs:142 SDL "if (Object.values(lists).some((l) => l.length > 0))" -> ""
test("coinbase_passes_stop_on_a_candle_that_one_reading_lacks", async () => {
  // a candle that one pass served and the other did not (the false absent of addendum 7 R1) stops the comparison, its open time listed,
  // never its value; each side, then both at once
  const marks = new Map([[200, MARKS[0] ?? ""], [450, MARKS[2] ?? ""]]), full = series([], marks);
  const one = await recorded(full, "1"), two = await recorded(full, "2"), lack200 = await recorded(series([200], marks), "2");
  const lack450 = await recorded(series([450], marks), "1");
  const cases: [string, string, unknown][] = [[one, lack200, { absent_from_pass_1: [], absent_from_pass_2: [iso(at(200))], differ: [] }],
    [lack450, two, { absent_from_pass_1: [iso(at(450))], absent_from_pass_2: [], differ: [] }],
    [lack450, lack200, { absent_from_pass_1: [iso(at(450))], absent_from_pass_2: [iso(at(200))], differ: [] }]];
  for (const [a, b, lists] of cases) {
    const [code, said, toStderr] = compare(a, b);
    assert.deepEqual([code, toStderr, said.stop, said.detail], [1, true, "passes_disagree", lists]);
  }
});

// killer: scripts/compare-coinbase-passes.mjs:139 ROR "a !== b" -> "a === b"
test("coinbase_passes_stop_on_two_candles_of_one_slot_that_differ", async () => {
  // the same slot served by both passes with another close: listed under differ, by its open time alone
  const one = await recorded(series(), "1"), two = await recorded(series([], new Map([[300, MARKS[1] ?? ""], [301, MARKS[2] ?? ""]])), "2");
  const [code, said] = compare(one, two);
  assert.deepEqual([code, said.stop, said.detail], [1, "passes_disagree", { absent_from_pass_1: [], absent_from_pass_2: [],
    differ: [iso(at(300)), iso(at(301))] }]);
});

/** A copy of a folder changed by `change`, then sealed again (its SHA256SUMS rewritten; the manifest follows a changed CSV, then `late`
 *  may change it again: a manifest that names another digest of its CSV). */
function forged(dir: string, change: (copy: string) => void, late?: (copy: string) => void): string {
  const copy = fresh(), csv = join(copy, "USDT-USD-15m.csv"), manifest = join(copy, "manifest.json");
  cpSync(dir, copy, { recursive: true });
  change(copy);
  const m = JSON.parse(readFileSync(manifest, "utf8")) as Record<string, unknown>;
  writeFileSync(manifest, JSON.stringify({ ...m, csv_sha256: sha(readFileSync(csv)) }, null, 2) + LF);
  late?.(copy);
  const names = readdirSync(copy, { recursive: true, withFileTypes: true }).filter((e) => e.isFile() && e.name !== "SHA256SUMS")
    .map((e) => relative(copy, join(e.parentPath, e.name)).split(sep).join("/")).sort();
  writeFileSync(join(copy, "SHA256SUMS"), names.map((n) => `${sha(readFileSync(join(copy, n)))}  ${n}`).join(LF) + LF);
  return copy;
}

// killer: scripts/compare-coinbase-passes.mjs:70 CONST "sha256(readFileSync(path)) !== hash" -> "false"
test("coinbase_passes_refuse_folders_that_are_not_two_sealed_readings_of_one_month", async () => {
  const one = await recorded(series(), "1"), two = await recorded(series(), "2"), short = await recorded(series(), "2", N - 1);
  const edit = (file: string, f: (text: string) => string) => (d: string): void => { writeFileSync(join(d, file), f(readFileSync(join(d, file), "utf8"))); };
  const altered = fresh(), unsealed = fresh(), extra = fresh();
  for (const d of [altered, unsealed, extra]) cpSync(two, d, { recursive: true });
  edit("USDT-USD-15m.csv", (t) => t.replace(",1.0001,", ",1.0002,"))(altered);
  rmSync(join(unsealed, "SHA256SUMS"));
  writeFileSync(join(extra, "notes.txt"), "an unlisted file");
  const manifest = (f: (m: Record<string, unknown>) => Record<string, unknown>) =>
    edit("manifest.json", (t) => JSON.stringify(f(JSON.parse(t) as Record<string, unknown>)));
  const copied = (d: string, change: (copy: string) => void): string => { const c = fresh(); cpSync(d, c, { recursive: true }); change(c); return c; };
  const lines = (file: string, f: (l: string[]) => string[]) => edit(file, (t) => f(t.split(LF)).join(LF)), csv = "USDT-USD-15m.csv";
  const first = (f: (row: string) => string) => lines(csv, (l) => l.map((r, i) => (i === 1 ? f(r) : r))); // the row of slot 0
  const both = (f: (m: Record<string, unknown>) => Record<string, unknown>): [string, string] => [forged(one, manifest(f)), forged(two, manifest(f))];
  const times = (ms: number): string => `${iso(ms)},${String(ms)}`, gone = (d: string): void => { rmSync(join(d, "missing.json")); };
  const cases: [string, string, string, unknown][] = [
    // the seal (G2-5): a listed path out of the folder, a line twice, a listed file absent, a listed folder
    [one, copied(two, lines("SHA256SUMS", (l) => [`${sha("x")}  ../x`, ...l])), "seal_broken", { pass: 2, file: "SHA256SUMS", line: 1 }],
    [one, copied(two, lines("SHA256SUMS", (l) => [l[0] ?? "", ...l])), "seal_broken", { pass: 2, file: "SHA256SUMS", line: 2 }],
    [one, copied(two, gone), "seal_broken", { pass: 2, file: "missing.json", why: "sha256" }],
    [one, copied(two, (d) => { gone(d); mkdirSync(join(d, "missing.json")); }), "seal_broken", { pass: 2, file: "missing.json", why: "sha256" }],
    // the manifest (G2-5, D-4): missing.json unlisted, another digest of the CSV, a v1 manifest, another recorder, then a product and a
    // month that the recorder never writes (both passes)
    [one, forged(two, gone), "not_comparable", { pass: 2, file: "manifest.json" }],
    [one, forged(two, () => undefined, manifest((m) => ({ ...m, csv_sha256: sha("x") }))), "not_comparable", { pass: 2, file: "manifest.json" }],
    [forged(one, manifest((m) => ({ ...m, schema: "monark.series.coinbase.v1" }))), two, "not_comparable", { pass: 1, file: "manifest.json" }],
    [one, forged(two, manifest((m) => ({ ...m, recorder_sha256: sha("x") }))), "not_comparable", { field: "recorder_sha256" }],
    [...both((m) => ({ ...m, product: "BTC-USD" })), "not_comparable", { field: "product, granularity, start, end_exclusive" }],
    [...both((m) => ({ ...m, end_exclusive: m.start })), "not_comparable", { field: "product, granularity, start, end_exclusive" }],
    // the rows (G2-5): the header, a row twice, a row past the month, two time columns that disagree, digits not canonical, off the grid
    [one, forged(two, edit(csv, (t) => t.replace("volume", "vol"))), "csv_malformed", { pass: 2, file: csv, line: 1 }],
    [one, forged(two, lines(csv, (l) => [...l.slice(0, 2), ...l.slice(1)])), "csv_malformed", { pass: 2, file: csv, line: 3 }],
    [one, forged(two, lines(csv, (l) => [...l.slice(0, -1), `${times(at(N))},0.9990,1.0010,1.0000,1.0001,125.5`, ""])), "csv_malformed",
      { pass: 2, file: csv, line: N + 2 }],
    [one, forged(two, first((r) => r.replace(`${iso(at(0))},`, `${iso(at(1))},`))), "csv_malformed", { pass: 2, file: csv, line: 2 }],
    [one, forged(two, first((r) => r.replace(`,${String(at(0))},`, `,0${String(at(0))},`))), "csv_malformed", { pass: 2, file: csv, line: 2 }],
    [one, forged(two, first((r) => r.replace(times(at(0)), times(at(0) + 60_000)))), "csv_malformed", { pass: 2, file: csv, line: 2 }],
    [one, altered, "seal_broken", { pass: 2, file: "USDT-USD-15m.csv", why: "sha256" }], [unsealed, two, "not_sealed", { pass: 1, file: "SHA256SUMS" }],
    [one, extra, "seal_broken", { pass: 2, file: "notes.txt", why: "not listed" }], [one, one, "not_comparable", { pass: 2, file: "manifest.json" }],
    [one, short, "not_comparable", { field: "end_exclusive" }],
    [forged(one, manifest((m) => Object.fromEntries(Object.entries(m).filter(([k]) => k !== "pass")))), two, "not_comparable",
      { pass: 1, file: "manifest.json" }], // a manifest of the older recorder: no pass
    [one, forged(two, manifest((m) => ({ ...m, empty_pages: 1 }))), "not_comparable", { pass: 2, file: "manifest.json" }],
    [one, forged(two, edit("USDT-USD-15m.csv", (t) => t.split(LF).filter((_, i) => i !== 3).join(LF))), "passes_disagree", {
      absent_from_pass_1: [], absent_from_pass_2: [iso(at(2))], differ: [] }], // a row removed and the folder sealed again: still seen
    [forged(one, edit("USDT-USD-15m.csv", (t) => t.replace(LF, `${LF}x,`))), two, "csv_malformed", { pass: 1, file: "USDT-USD-15m.csv", line: 2 }],
  ];
  for (const [a, b, stop, detail] of cases) {
    const [code, said] = compare(a, b);
    assert.deepEqual([code, said.stop, said.detail], [1, stop, detail], `${stop} ${JSON.stringify(detail)}`);
  }
});

// killer: scripts/record-coinbase-candles.mjs:297 CONST "first: isoOf(Math.min(...orphans))" -> "first: isoOf(orphans[0])"
test("coinbase_passes_never_get_a_reading_whose_pages_disagree_on_a_slot", async () => {
  // W10 of the campaign of the fusion, its measured form: page 1 leaves slots 0 and 1 out, page 2 serves them before its own start, kept
  // by no core; the recorder stops that reading (pass 1, then the same pages around the windows of pass 2): window_inconsistent, its
  // detail naming the earliest of the two slots, and no SHA256SUMS that the comparison could read
  const ids = (a: number, b: number): number[] => Array.from({ length: b - a }, (_, k) => a + k);
  const readings: [string, number[][]][] = [["1", [ids(2, 299), [0, 1, ...ids(297, 597)], ids(595, 601)]],
    ["2", [ids(2, 150), [0, 1, ...ids(148, 448)], ids(446, 601)]]];
  for (const [pass, pages] of readings) {
    let n = 0;
    const out = fresh(), fetch = (): Promise<Response> => Promise.resolve(new Response(`[${(pages[n++] ?? []).toReversed()
      .map((i) => `[${String(at(i) / 1000)},0.9990,1.0010,1.0000,1.0001,125.5]`).join(",")}]`, { status: 200 }));
    const argv = ["--product", "USDT-USD", "--granularity", "15m", "--start", iso(at(0)), "--end", iso(at(600)), "--out", out, "--pass", pass];
    const got = await record(argv, { fetch, sleep: () => Promise.resolve(), env: {}, execArgv: [] })
      .then(() => "written", (e: unknown) => (e instanceof RecorderStop ? [e.code, e.detail] : String(e)));
    assert.deepEqual([got, existsSync(join(out, "SHA256SUMS"))], [["window_inconsistent", { slots: 2, first: iso(at(0)) }], false], `pass ${pass}`);
  }
});

// killer: scripts/compare-coinbase-passes.mjs:166 SDL "process.exitCode = main(process.argv.slice(2));" -> ""
test("coinbase_passes_command_line_prints_one_line_and_exits", async () => {
  // no argument: the usage stop on stderr, exit 2, before any read. Lot COINBASE-PASS-EDGES-1: the same stop through a junction under
  // --preserve-symlinks-main (copies of the comparison and of the recorder that it imports: XC-G03 of the campaign of the fusion
  // MUT-FUSION-ADD7-1); imported by a process whose argv[1] names an absent path, nothing runs, nothing printed (XC-G02); two readings
  // of a window of 149 slots, the second forged from the first (the recorder never writes such a pass 2), exit 1, not_comparable (D-1,
  // G2-1 of the G2 of that lot). The two launch guards are lines that the lot leaves unchanged: a test of them alone, green at the base,
  // would be refused by scripts/red-proof.mjs; this one is red at the base by the refusal of D-1
  const cli = (args: string[]): [number | null, string, string] => {
    const r = spawnSync(process.execPath, args, { encoding: "utf8", timeout: 30_000, env: { SYSTEMROOT: process.env.SYSTEMROOT },
      stdio: ["ignore", "pipe", "pipe"] });
    return [r.status, r.stdout, r.stderr];
  };
  const dir = fresh(), link = fresh(), one = await recorded(series(), "1", 149);
  mkdirSync(dir);
  for (const name of ["compare-coinbase-passes.mjs", "record-coinbase-candles.mjs"]) cpSync(join(dirname(SCRIPT), name), join(dir, name));
  symlinkSync(dir, link, "junction");
  const two = forged(one, (d) => {
    const p = join(d, "manifest.json"), m = JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
    writeFileSync(p, JSON.stringify({ ...m, pass: 2, witness_slots: { count: 0, first: null, last: null } }));
  });
  const usage = JSON.stringify({ ok: false, stop: "usage", detail: { absent: ["--pass-1", "--pass-2"] } }) + LF;
  const refused = JSON.stringify({ ok: false, stop: "not_comparable", detail: { field: "start, end_exclusive", core_end: iso(at(149)) } }) + LF;
  assert.deepEqual([cli([SCRIPT]), cli(["--preserve-symlinks-main", join(link, "compare-coinbase-passes.mjs")]),
    cli(["--input-type=module", "-e", `await import(${JSON.stringify(pathToFileURL(SCRIPT).href)});`, join(ROOT, "absent")]),
    cli([SCRIPT, "--pass-1", one, "--pass-2", two])], [[2, "", usage], [2, "", usage], [0, "", ""], [1, "", refused]]);
});

// killer: scripts/record-coinbase-candles.mjs:130 CONST "from = start - pad, to;" -> "from = start, to;"
test("coinbase_passes_see_a_slot_that_the_request_opening_or_closing_pass_1_omits_in_months_of_28_to_31_days", async () => {
  // lot COINBASE-PASS-EDGES-1 (D-2): the class that the G2 of COINBASE-ADD7-1 measured (sections 7 and 8, G2-1), replayed in four past
  // months: the server drops the slots 0 and 147 when start is the start of the month - 900 s (the request that opens pass 1), and the
  // first slot of the end band that it measured and the last slot when end is the end of the month (the request that closes it); the
  // requests of the two passes share no start and no end: pass 1 alone misses the four slots, written as missing, and the comparison
  // stops passes_disagree, the four listed (at the base, pass 2 asked the same two requests, missed the same slots, and both agreed);
  // the four months are read before one assertion, so that a failing run shows each of them; a reading that stops gives its stop and its
  // month is not compared (the guard of D-1 of the corrections stops a pass 2 whose core would end with one of pass 1: by assertion here)
  const months: [number, number, number][] = [[Date.UTC(2023, 1, 1), Date.UTC(2023, 2, 1), 2683], [Date.UTC(2024, 1, 1), Date.UTC(2024, 2, 1), 2683],
    [Date.UTC(2022, 8, 1), Date.UTC(2022, 9, 1), 2832], [Date.UTC(2022, 7, 1), Date.UTC(2022, 8, 1), 2832]], got: unknown[] = [], want: unknown[] = [];
  const none: [number, Record<string, unknown>, boolean] = [-1, {}, false];
  for (const [S, E, band] of months) {
    const n = (E - S) / STEP, lost = [0, 147, band, n - 1].map((k) => S + k * STEP), asked: URLSearchParams[][] = [];
    const reading = async (pass: string): Promise<[string, number | string]> => {
      const out = fresh(), params: URLSearchParams[] = [];
      asked.push(params);
      const fetch = (url: string): Promise<Response> => {
        const q = new URL(url).searchParams, a = Date.parse(q.get("start") ?? ""), b = Date.parse(q.get("end") ?? ""), rows: string[] = [];
        const gone = [...(a === S - STEP ? lost.slice(0, 2) : []), ...(b === E ? lost.slice(2) : [])];
        params.push(q);
        for (let t = b; t >= a; t -= STEP) if (!gone.includes(t)) rows.push(`[${String(t / 1000)},0.9990,1.0010,1.0000,1.0001,125.5]`);
        return Promise.resolve(new Response(`[${rows.join(",")}]`, { status: 200 }));
      };
      const argv = ["--product", "USDT-USD", "--granularity", "15m", "--start", iso(S), "--end", iso(E), "--out", out, "--pass", pass];
      const read = record(argv, { fetch, sleep: () => Promise.resolve(), env: {}, execArgv: [] });
      return [out, await read.then((m) => m.missing, (e: unknown) => (e instanceof RecorderStop ? e.code : "not a stop"))];
    };
    const [one, missed1] = await reading("1"), [two, missed2] = await reading("2");
    const [code, said] = typeof missed1 === "number" && typeof missed2 === "number" ? compare(one, two) : none;
    const shared = (k: string): string[] => (asked[0] ?? []).map((q) => q.get(k) ?? "").filter((v) => (asked[1] ?? []).some((q) => q.get(k) === v));
    got.push([iso(S), n, missed1, missed2, shared("start"), shared("end"), code, said.stop, said.detail]);
    want.push([iso(S), n, 4, 0, [], [], 1, "passes_disagree", { absent_from_pass_1: lost.map((t) => iso(t)), absent_from_pass_2: [], differ: [] }]);
  }
  assert.deepEqual(got, want, "months of 2 688, 2 784, 2 880 and 2 976 slots");
});

// killer: scripts/compare-coinbase-passes.mjs:90 CONST "return w === undefined || w === null;" -> "return true;"
test("coinbase_passes_ignore_the_witnesses_of_pass_2_but_require_their_count_coherent", async () => {
  // lot COINBASE-PASS-EDGES-1 (D-4): witness_slots counts the slots that pass 2 read outside the month, never compared: a pass 2 whose
  // witnesses have gaps and marked closes agrees with pass 1. Absent or null in pass 1; in pass 2 a count, the first and the last witness
  // (null both for none), each a slot of the 149 before the month or of the 149 after it, the count at most the slots of those zones
  // between them and two at least when they differ: any other value is refused, the manifest named
  const one = await recorded(series(), "1"), two = await recorded(series(), "2");
  const odd = await recorded(series([-100, -1, N, N + 148], new Map([[-50, MARKS[0] ?? ""], [N + 1, MARKS[2] ?? ""]])), "2");
  const as = (dir: string, f: (m: Record<string, unknown>) => Record<string, unknown>): string => forged(dir, (d) => {
    const p = join(d, "manifest.json");
    writeFileSync(p, JSON.stringify(f(JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>)));
  });
  const ws = (count: unknown, first: unknown, last: unknown): string => as(two, (m) => ({ ...m, witness_slots: { count, first, last } }));
  const t = (i: number): string => iso(at(i));
  const witnessesOf = (dir: string): unknown => (JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")) as Record<string, unknown>).witness_slots;
  assert.deepEqual([witnessesOf(two), witnessesOf(odd)], [{ count: 298, first: t(-149), last: t(N + 148) }, { count: 294, first: t(-149),
    last: t(N + 147) }], "the witnesses that the recorder counted");
  const cases: [string, string, number, unknown][] = [
    [one, as(two, (m) => Object.fromEntries(Object.entries(m).filter(([k]) => k !== "witness_slots"))), 2, 0], // a pass 2 of the base
    [one, as(two, (m) => ({ ...m, witness_slots: null })), 2, 0], [one, ws("298", t(-149), t(N + 148)), 2, 0], [one, ws(-1, t(N), t(N)), 2, 0],
    [one, ws(0, t(-149), null), 2, 0], [one, ws(0, null, t(N + 148)), 2, 0], [one, ws(2, "x", t(N + 148)), 2, 0],
    [one, ws(2, new Date(at(-149)).toISOString(), t(N + 148)), 2, 0], [one, ws(2, t(0), t(N + 148)), 2, 0], [one, ws(2, t(-150), t(N + 148)), 2, 0],
    [one, ws(2, t(-149), t(N + 149)), 2, 0], [one, ws(2, iso(at(-149) + 60_000), t(N + 148)), 2, 0], [one, ws(299, t(-149), t(N + 148)), 2, 0],
    [one, ws(3, t(-1), t(N)), 2, 0], [one, ws(1, t(-149), t(N + 148)), 2, 0], [one, ws(2, t(N + 148), t(-149)), 2, 0],
    [as(one, (m) => ({ ...m, witness_slots: { count: 0, first: null, last: null } })), two, 1, 0],
    [as(one, (m) => ({ ...m, witness_slots: null })), two, 0, N], [one, ws(0, null, null), 0, N], [one, ws(1, t(N), t(N)), 0, N],
    [one, ws(149, t(-149), t(-1)), 0, N], [one, ws(2, t(-1), t(N)), 0, N], [one, odd, 0, N]];
  for (const [i, [a, b, refused, both]] of cases.entries()) {
    const [code, said] = compare(a, b), shown = code === 0 ? said.both : said.detail;
    assert.deepEqual([code, said.stop, shown], refused > 0 ? [1, "not_comparable", { pass: refused, file: "manifest.json" }] : [0, undefined, both],
      `case ${String(i)}: ${refused > 0 ? `refused in pass ${String(refused)}` : "compared"}`);
  }
});
