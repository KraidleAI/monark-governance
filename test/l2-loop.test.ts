// test/l2-loop.test.ts -- lot L2-P1-c5 (2026-10-05): what the recording loop is built on, before the loop itself (P1-c5-bis): the seal
// hook that composes the replay of P1-c2 and the digests of P1-c3 (scripts/l2/seal.mjs), the command hashed into the day's manifest,
// a kept snapshot read again with another lastUpdateId named (scripts/l2/derive.mjs), and how a recording takes --out
// (scripts/record-binance-l2.mjs: a parent that is a file, a journal of this recorder, the start line, one link per journal, the real
// path pinned, the guards again at each check). Plan docs/G0-partie-l2-p1.md section 8.2; lot plan docs/G0-lot-l2-p1-c5.md. Segments
// are written by the writer of P1-a2 with an injected wall clock, anchors and snapshots by hand, under the OS temp directory (made in
// before(), removed after), outside any git tree: no network, no place, synthetic frames whose numbers mean nothing of a market. Each
// test asserts what it loads, so the base, which has neither seal.mjs nor adopt, reddens by assertion. Each test names, on the line above
// it, the mutation that reddens it.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, linkSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DayStop, sealDay, STOPS, type DeriveContext } from "../scripts/l2/day.mjs";
import { deriveDay } from "../scripts/l2/derive.mjs";
import { cidOf, openWriter } from "../scripts/l2/segments.mjs";
import type * as RecordM from "../scripts/record-binance-l2.mjs";
import type * as SealM from "../scripts/l2/seal.mjs";
import { keepCause } from "./helpers/keep-cause.ts";
keepCause("test/l2-loop.test.ts"); // a crash of this file names its cause on stdout, which the runner keeps (L2-LINKS-FILE-CRASH-1)
let ROOT = "", made = 0;
before(() => { ROOT = mkdtempSync(join(tmpdir(), "l2-loop-")); });
after(() => { if (ROOT !== "") rmSync(ROOT, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });
const LF = String.fromCharCode(10), D = "2026-10-04", S = 1_000_000, START = Date.UTC(2026, 9, 4) * 1000, END = START + 86_400 * S;
const SCRIPTS = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts"), RECORDER = "scripts/record-binance-l2.mjs";
type Lv = [string, string];
type Line = Record<string, unknown>;

async function seal(): Promise<typeof SealM> {
  const m = await import("../scripts/l2/seal.mjs").catch(() => null);
  return m ?? assert.fail("scripts/l2/seal.mjs is absent");
}
async function command(): Promise<typeof RecordM> {
  const m = await import("../scripts/record-binance-l2.mjs");
  assert.equal(typeof m.adopt, "function", "adopt is absent");
  return m;
}
const fresh = (): string => join(ROOT, `out-${String(++made)}`);
/** What f returns, or the code of what it throws (a named stop, or a file system error), or its text. */
const codeOf = (f: () => unknown): unknown => { try { return f(); } catch (e) { return (e as { code?: string }).code ?? String(e); } };
const detailOf = (f: () => unknown): unknown => { try { f(); return null; } catch (e) { return (e as { detail?: unknown }).detail; } };
/** A spot connection of BTCUSDT under `out`, its frames [recv_us, text] written by the writer of P1-a2. */
async function conn(out: string, frames: [number, string][]): Promise<void> {
  let now = frames[0]![0];
  const w = openWriter(out, cidOf("spot", "BTCUSDT", now), { wallUs: () => now, monoNs: () => BigInt(now) * 1000n });
  for (const [us, text] of frames) { now = us; assert.equal(w.push(text), true); }
  await w.close();
}
const diff = (U: number, u: number, E: number, b: Lv[] = []): [number, string] =>
  [E, JSON.stringify({ stream: "btcusdt@depth@100ms", data: { e: "depthUpdate", E, s: "BTCUSDT", U, u, b, a: [] } })];
const ticker = (u: number, us: number): [number, string] => [us, JSON.stringify({ stream: "btcusdt@bookTicker", data: { u, s: "BTCUSDT", b: "100.00", B: "3", a: "101.00", A: "1" } })];
const trade = (t: number, E: number): [number, string] => [E, JSON.stringify({ stream: "btcusdt@trade", data: { e: "trade", E, s: "BTCUSDT", t, p: "100.00", q: "1" } })];
const snap = (lastUpdateId: number): string => JSON.stringify({ lastUpdateId, bids: [["100.00", "1"]], asks: [["101.00", "1"]] });
const dayDir = (out: string): string => join(out, "days", "BTCUSDT", D);
/** A depth snapshot kept by P1-b1, requested at `us` (its file name as rest.mjs stamps it); its path. */
function kept(out: string, us: number, body: string): string {
  const name = `BTCUSDT-depth-${new Date(Math.floor(us / 1000)).toISOString().replace(/[-:.]/g, "").slice(0, -1)}${String(us % 1000).padStart(3, "0")}Z.json`;
  mkdirSync(join(out, "rest", "BTCUSDT"), { recursive: true });
  writeFileSync(join(out, "rest", "BTCUSDT", name), body);
  return join(out, "rest", "BTCUSDT", name);
}
/** A day of D: its open anchor, two diffs (the second changes the best bid, the first is on a book just set), a ticker, a trade. */
async function day(out: string): Promise<void> {
  mkdirSync(dayDir(out), { recursive: true });
  writeFileSync(join(dayDir(out), "anchor-open.json"), snap(100));
  await conn(out, [diff(101, 101, START + S, [["100.00", "2"]]), diff(102, 102, START + 2 * S, [["100.00", "3"]]), ticker(102, START + 3 * S), trade(5, START + 4 * S)]);
}
/** sealOf on D at scale 2, or the code of its named stop. */
async function sealed(out: string, bounds?: SealM.SealBounds): Promise<unknown> {
  const m = await seal();
  return codeOf(() => m.sealOf({ out, symbol: "BTCUSDT", day: D, nowUs: END + 121 * S, closed: () => true, scale: 2, ...(bounds ? { bounds } : {}) }));
}
const manifest = (out: string): Line => JSON.parse(readFileSync(join(dayDir(out), "manifest.json"), "utf8")) as Line;
const sha = (path: string): string => createHash("sha256").update(readFileSync(path)).digest("hex");
const clocks = { wallUs: (): number => 7, monoNs: (): bigint => 9n };
const START_LINE = { host_us: 7, mono_ns: "9", symbol: "ALL", cid: null, event: "start", recorder: RECORDER };
const journal = (dir: string): unknown[] => readFileSync(join(dir, "journal.jsonl"), "utf8").split(LF).filter((l) => l !== "").map((l) => JSON.parse(l) as unknown);
/** The plan of a recording into `out` (quota `quota`), guards passed. */
function plan(m: typeof RecordM, out: string, quota = 1_000_000): Extract<RecordM.Plan, { mode: "record" }> {
  const p = m.prepare(["--out", out, "--quota-bytes", String(quota)], { env: {}, execArgv: [], freeBytes: () => 1e12, ...clocks });
  assert.equal(p.mode, "record");
  return p;
}

// killer: scripts/l2/seal.mjs:30 CONST "best: best.result()" -> "best: null"
test("l2_seal_composes_replay_then_canon", async () => {
  const out = fresh();
  await day(out);
  assert.deepEqual(await sealed(out), { sealed: true, dir: dayDir(out), frames: 4 });
  const m = manifest(out), replay = m.replay as Line;
  assert.deepEqual([replay.scale, replay.start, replay.syncs, (m.parity as Line).absent], [2, "anchor", [100], "anchor_missing"], "the replay of c2");
  assert.deepEqual(Object.keys(m.canon as Line).sort(), ["bookTicker", "depth@100ms", "forceOrder", "named", "trade"], "the digests of c3");
  assert.deepEqual(m.crosscheck, { i: { tickers: 1, outside: 0 }, ii: { changes: 1, unmatched: 0, unjudged: 1, first: [] } },
    "(ii) from the tap of the same replay: the diff 102 changed the best bid and the ticker 102 holds it; 101, on a book just set, unjudged");
  assert.ok(existsSync(join(dayDir(out), "minutes.jsonl")) && existsSync(join(dayDir(out), "SHA256SUMS")));
});

// killer: scripts/l2/seal.mjs:31 CONST "\"seal\", COMMAND" -> "\"seal\""
test("l2_seal_hashes_the_command", async () => {
  const out = fresh();
  await day(out);
  await sealed(out);
  const shas = manifest(out).script_sha256 as Record<string, string>;
  assert.deepEqual(Object.keys(shas).sort(), ["scripts/l2/book.mjs", "scripts/l2/canon.mjs", "scripts/l2/day.mjs", "scripts/l2/derive.mjs",
    "scripts/l2/links.mjs", "scripts/l2/rest.mjs", "scripts/l2/seal.mjs", "scripts/l2/segments.mjs", RECORDER], "Q-C4-5: the command beside the modules");
  assert.deepEqual([shas[RECORDER], shas["scripts/l2/seal.mjs"]], [sha(join(SCRIPTS, "record-binance-l2.mjs")), sha(join(SCRIPTS, "l2", "seal.mjs"))]);
});

// killer: scripts/l2/seal.mjs:19 CONST "keys.length > 0" -> "false"
test("l2_seal_parts_keys_disjoint", async () => {
  const m = await seal(), merge = (...parts: Line[]): unknown => codeOf(() => m.mergeDerived("BTCUSDT", D, parts));
  assert.deepEqual([merge({ manifest: { replay: 1 } }, { manifest: { replay: 2 } }), merge({ missing: { holes: [] } }, { missing: { holes: [1] } })],
    ["stray_file", "stray_file"], "n-5 of the G2 of c3: a key of two parts is named, never overwritten");
  assert.deepEqual(detailOf(() => m.mergeDerived("BTCUSDT", D, [{ manifest: { a: 1, b: 1 } }, { manifest: { b: 2 } }])), { symbol: "BTCUSDT", day: D, keys: ["b"] });
  assert.deepEqual(merge({ files: [["minutes.jsonl", "x"]], refs: ["r1"], modules: ["derive"], manifest: { a: 1 }, missing: { h: 1 } },
    { refs: ["r2"], modules: ["canon"], manifest: { b: 2 } }),
  { files: [["minutes.jsonl", "x"]], refs: ["r1", "r2"], modules: ["derive", "canon"], manifest: { a: 1, b: 2 }, missing: { h: 1 } }, "a key of a manifest and of a missing.json may be one");
});

// killer: scripts/l2/seal.mjs:29 CONST "bound: bounds.minutes" -> "bound: undefined"
test("l2_seal_bounds_provisional", async () => {
  const m = await seal(), [small, run] = [fresh(), fresh()];
  assert.deepEqual(m.SEAL_BOUNDS, { minutes: 64 * 1024 * 1024, canon: 32 * 1024 * 1024 }, "L2-MINUTES-SIZE-1: provisional bounds");
  for (const out of [small, run]) await day(out);
  assert.deepEqual([await sealed(small, { minutes: 1000, canon: m.SEAL_BOUNDS.canon }), await sealed(run, { minutes: m.SEAL_BOUNDS.minutes, canon: 10 })],
    ["minutes_bound", "canon_bound"], "each bound reaches its module");
  assert.deepEqual([small, run].map((out) => existsSync(join(dayDir(out), "index.jsonl"))), [false, false], "nothing written");
});

// killer: scripts/l2/derive.mjs:106 CONST "full?.lid !== s.lid" -> "false"
test("l2_snapshot_reload_named", async () => {
  // L2-SNAPSHOT-RELOAD-1 (m-c of the delta G2 of c2): b1 writes rest/ once (flag wx); a body read again at the book's set that is not the
  // one listed stops, named, nothing written. The tap of the replay rewrites the second snapshot between its listing and its use.
  const rewrite = async (body: string): Promise<unknown> => {
    const out = fresh(), second = kept(out, START - 5 * S, snap(200));
    kept(out, START - 10 * S, snap(100));
    await conn(out, [diff(101, 101, START + S), diff(201, 201, START + 2 * S)]);
    const hook = (ctx: DeriveContext): ReturnType<typeof deriveDay> => deriveDay({ ...ctx, scale: 2, tap: () => { writeFileSync(second, body); } });
    const got = codeOf(() => sealDay({ out, symbol: "BTCUSDT", day: D, nowUs: END + 121 * S, closed: () => true, derive: hook }));
    return [got, existsSync(join(dayDir(out), "index.jsonl"))];
  };
  assert.deepEqual([await rewrite(snap(999)), await rewrite("{")], [["snapshot_reload", false], ["snapshot_reload", false]], "another lastUpdateId; unreadable");
  assert.ok(STOPS.includes("snapshot_reload") && new DayStop("snapshot_reload").code === "snapshot_reload");
});

// killer: scripts/record-binance-l2.mjs:104 CONST "!statSync(near).isDirectory()" -> "false"
test("l2_guard_out_parent_file", async () => {
  // m-8 of the delta G2 of c4: a parent that is a regular file was taken for a new output; making --out would have thrown ENOTDIR.
  const m = await command(), top = fresh(), file = join(top, "afile");
  mkdirSync(top);
  writeFileSync(file, "a file");
  assert.deepEqual([codeOf(() => m.guardOut(join(file, "o"))), codeOf(() => m.guardOut(join(file, "o", "p"))), codeOf(() => m.guardOut(join(top, "o")))],
    ["out_not_l2", "out_not_l2", false], "under a file, refused; under a directory, a new output");
  assert.deepEqual(detailOf(() => m.prepare(["--out", join(file, "o"), "--quota-bytes", "5"], { env: {}, execArgv: [], ...clocks })),
    { out: join(file, "o"), entry: file, why: "not a directory" });
});

// killer: scripts/record-binance-l2.mjs:199 CONST "first.recorder !== RECORDER" -> "false"
test("l2_adopt_journal_of_this_recorder", async () => {
  // n-5 of the G2 of c4: an output is adopted only when its journal begins with a start of this recorder; adopt journals its start first.
  const m = await command(), out = fresh(), foreign = fresh(), junk = fresh();
  assert.equal(m.adopt(plan(m, out), clocks).real, realpathSync(out));
  assert.deepEqual(journal(out), [START_LINE], "a new output: the start line, first");
  assert.equal(plan(m, out).resume, true);
  m.adopt(plan(m, out), clocks);
  assert.deepEqual(journal(out), [START_LINE, START_LINE], "resumed: its own journal, a second start");
  mkdirSync(foreign);
  writeFileSync(join(foreign, "journal.jsonl"), JSON.stringify({ event: "start", symbol: "ALL" }) + LF);
  mkdirSync(junk);
  writeFileSync(join(junk, "journal.jsonl"), "xxxx");
  assert.deepEqual([foreign, junk].map((o) => codeOf(() => m.adopt(plan(m, o), clocks))), ["out_not_l2", "out_not_l2"], "a start of no recorder; no start");
  assert.deepEqual([readFileSync(join(foreign, "journal.jsonl"), "utf8"), readFileSync(join(junk, "journal.jsonl"), "utf8")],
    [JSON.stringify({ event: "start", symbol: "ALL" }) + LF, "xxxx"], "nothing written");
});

// killer: scripts/record-binance-l2.mjs:186 CONST "fstatSync(fd).nlink !== 1" -> "false"
test("l2_append_single_link", async () => {
  // n-5bis of the delta G2 of c4: journal.jsonl a hard link of a file elsewhere (the G2 wrote its quota_alarm into a repository so).
  const m = await command(), out = fresh(), elsewhere = join(fresh() + "-file");
  m.adopt(plan(m, out), clocks);
  const own = readFileSync(join(out, "journal.jsonl"), "utf8");
  rmSync(join(out, "journal.jsonl"));
  writeFileSync(elsewhere, own);
  linkSync(elsewhere, join(out, "journal.jsonl"));
  assert.deepEqual(detailOf(() => m.adopt(plan(m, out), clocks)), { entry: join(realpathSync(out), "journal.jsonl"), why: "hard link" });
  assert.equal(readFileSync(elsewhere, "utf8"), own, "nothing written through the link");
});

// killer: scripts/record-binance-l2.mjs:214 CONST "lstatSync(join(real, name)).nlink !== 1" -> "false"
test("l2_check_single_links", async () => {
  const m = await command(), out = fresh(), elsewhere = fresh() + "-file", run = m.adopt(plan(m, out), clocks);
  writeFileSync(join(out, "requests.jsonl"), "{}" + LF);
  assert.equal(run.check(), readFileSync(join(out, "journal.jsonl")).length + 3, "check: the bytes of --out");
  linkSync(join(out, "requests.jsonl"), elsewhere);
  assert.deepEqual(detailOf(() => run.check()), { entry: "requests.jsonl", why: "hard link" }, "n-5bis at each check");
});

// killer: scripts/record-binance-l2.mjs:212 CONST "!== real" -> "=== real"
test("l2_check_real_path_pinned", async () => {
  // n-7 of the delta G2 of c4: --out swapped for a link to another output after its guards; the G2 wrote a quota_alarm there.
  const m = await command(), top = fresh(), moved = fresh(), other = fresh(), out = join(top, "o");
  mkdirSync(top);
  const run = m.adopt(plan(m, out, 1000), clocks);
  assert.equal(typeof codeOf(() => run.check()), "number", "unmoved: the bytes");
  mkdirSync(join(other, "o"), { recursive: true });
  writeFileSync(join(other, "o", "journal.jsonl"), "x".repeat(750));
  renameSync(top, moved);
  symlinkSync(other, top, "dir");
  assert.deepEqual(detailOf(() => run.check()), { out, real: run.real, why: "real path changed" });
  assert.equal(readFileSync(join(other, "o", "journal.jsonl"), "utf8"), "x".repeat(750), "nothing written there");
});

// killer: scripts/record-binance-l2.mjs:213 SDL "    guardOut(plan.out);" -> ""
test("l2_check_git_tree_again", async () => {
  // n-2 of the G2 of c4: a git init above --out after the start is seen at the next check.
  const m = await command(), top = fresh(), out = join(top, "o");
  mkdirSync(top);
  const run = m.adopt(plan(m, out), clocks);
  assert.equal(typeof run.check(), "number");
  mkdirSync(join(top, ".git"));
  assert.deepEqual([codeOf(() => run.check()), detailOf(() => run.check())], ["out_in_git_tree", { out, git: join(top, ".git") }]);
});

// killer: scripts/record-binance-l2.mjs:189 CONST "e.code === \"ELOOP\"" -> "false"
test("l2_append_link_named", { skip: process.platform === "win32" ? "win32 has no O_NOFOLLOW: the guards of --out refuse its links" : false }, async () => {
  // n-8 of the delta G2 of c4: an append through a link stops named (out_not_l2), not by ELOOP.
  const m = await command(), out = fresh(), elsewhere = fresh() + "-file", path = join(out, "journal.jsonl");
  m.adopt(plan(m, out), clocks);
  writeFileSync(elsewhere, "kept");
  rmSync(path);
  symlinkSync(elsewhere, path);
  assert.deepEqual([codeOf(() => m.appendLine(path, { event: "x" })), detailOf(() => m.appendLine(path, { event: "x" }))],
    ["out_not_l2", { entry: path, why: "a link" }]);
  assert.equal(readFileSync(elsewhere, "utf8"), "kept");
});
