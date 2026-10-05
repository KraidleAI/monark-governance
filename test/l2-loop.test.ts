// test/l2-loop.test.ts -- lots L2-P1-c5 and P1-c5-bis-a (2026-10-05): what the recording loop is built on, before the loop itself (P1-c5-bis-b): the seal
// hook that composes the replay of P1-c2 and the digests of P1-c3 (scripts/l2/seal.mjs), the command hashed into the day's manifest,
// a kept snapshot read again with another lastUpdateId named (scripts/l2/derive.mjs), and how a recording takes --out
// (scripts/record-binance-l2.mjs: a parent that is a file, a journal of this recorder, the start line, one link per journal, the real
// path pinned, the guards again at each check). Plan docs/G0-partie-l2-p1.md section 8.2; lot plan docs/G0-lot-l2-p1-c5.md. Segments
// are written by the writer of P1-a2 with an injected wall clock, anchors and snapshots by hand, under the OS temp directory (made in
// before(), removed after), outside any git tree: no network, no place, synthetic frames whose numbers mean nothing of a market. Each
// test asserts what it loads, so the base, which has neither seal.mjs nor adopt, reddens by assertion. Each test names, on the line above
// it, the mutation that reddens it. P1-c5-bis-a (lot plan docs/G0-lot-l2-p1-c5-bis.md), at the end: the seal apart in a capped child
// process, its own guards, a file vanished under the walk, the link's hook, cut and closed segments (sockets driven by hand, no place),
// segments synced before closed, tails marked once at a start.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire, syncBuiltinESMExports } from "node:module";
import { closeSync, constants, existsSync, linkSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DayStop, sealDay, STOPS, type DeriveContext } from "../scripts/l2/day.mjs";
import { deriveDay } from "../scripts/l2/derive.mjs";
import { cidOf, openWriter, segmentOf, type SegmentFile } from "../scripts/l2/segments.mjs";
import * as L from "../scripts/l2/links.mjs";
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
const ticker = (u: number, us: number, b = "100.00"): [number, string] => [us, JSON.stringify({ stream: "btcusdt@bookTicker", data: { u, s: "BTCUSDT", b, B: "3", a: "101.00", A: "1" } })];
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
/** A day of D: its open anchor, two diffs (the second changes the best bid, at `bid`; the first is on a book just set), a ticker, a trade. */
async function day(out: string, bid = "100.00"): Promise<void> {
  mkdirSync(dayDir(out), { recursive: true });
  writeFileSync(join(dayDir(out), "anchor-open.json"), snap(100));
  await conn(out, [diff(101, 101, START + S, [["100.00", "2"]]), diff(102, 102, START + 2 * S, [[bid, "3"]]), ticker(102, START + 3 * S, bid), trade(5, START + 4 * S)]);
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
type Opts = NonNullable<Parameters<RecordM.QuotaCheck>[0]>;
/** top/o reached through a link top -> realtop, resumed, its journal at 7 400 bytes of a quota of 10 000 (75 % once adopted); a foreign
 *  output of the same form at 90 %; plan.check runs `act` once first, whose options, if any, go to the original check. */
function staged(m: typeof RecordM, act: (o: Opts, swap: () => void) => Opts | void = () => {}) {
  const [top, realtop, foreign] = [fresh(), fresh(), fresh()], real = join(realtop, "o"), head = JSON.stringify(START_LINE) + LF;
  for (const dir of [real, join(foreign, "o")]) mkdirSync(dir, { recursive: true });
  writeFileSync(join(real, "journal.jsonl"), head + "x".repeat(7_399 - head.length) + LF);
  writeFileSync(join(foreign, "o", "journal.jsonl"), "f".repeat(9_000));
  symlinkSync(realtop, top, "dir");
  const swap = (): void => { symlinkSync(foreign, top + ".new", "dir"); renameSync(top + ".new", top); }; // atomic, as ln -s then mv -T
  const p = plan(m, join(top, "o"), 10_000), check = p.check;
  let acted = false;
  const adopted = { ...p, check: (o: Opts = {}): number => check(acted ? o : (acted = true, act(o, swap) ?? o)) };
  const events = (dir: string): unknown[] => readFileSync(join(dir, "journal.jsonl"), "utf8").split(LF).filter((l) => l.startsWith("{")).map((l) => (JSON.parse(l) as Line).event);
  return { out: p.out, real, realtop, events, take: () => codeOf(() => m.adopt(adopted, clocks).real), foreign: () => readFileSync(join(foreign, "o", "journal.jsonl"), "utf8") };
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

// killer: scripts/record-binance-l2.mjs:207 CONST "first.recorder !== RECORDER" -> "false"
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

// killer: scripts/record-binance-l2.mjs:193 CONST "fstatSync(fd).nlink !== 1" -> "false"
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

// killer: scripts/record-binance-l2.mjs:241 CONST "lstatSync(join(at, name)).nlink !== 1" -> "false"
test("l2_check_single_links", async () => {
  const m = await command(), out = fresh(), elsewhere = fresh() + "-file", run = m.adopt(plan(m, out), clocks);
  writeFileSync(join(out, "requests.jsonl"), "{}" + LF);
  assert.equal(run.check(), readFileSync(join(out, "journal.jsonl")).length + 3, "check: the bytes of --out");
  linkSync(join(out, "requests.jsonl"), elsewhere);
  assert.deepEqual(detailOf(() => run.check()), { entry: "requests.jsonl", why: "hard link" }, "n-5bis at each check");
});

// killer: scripts/record-binance-l2.mjs:225 CONST "(existsSync(plan.out) ? realpathSync.native(plan.out) : null) !== real" -> "false"
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

// killer: scripts/record-binance-l2.mjs:240 SDL "    guardOut(plan.out);" -> ""
test("l2_check_git_tree_again", async () => {
  // n-2 of the G2 of c4: a git init above --out after the start is seen at the next check.
  const m = await command(), top = fresh(), out = join(top, "o");
  mkdirSync(top);
  const run = m.adopt(plan(m, out), clocks);
  assert.equal(typeof run.check(), "number");
  mkdirSync(join(top, ".git"));
  assert.deepEqual([codeOf(() => run.check()), detailOf(() => run.check())], ["out_in_git_tree", { out, git: join(top, ".git") }]);
});

// killer: scripts/record-binance-l2.mjs:196 CONST "e.code === \"ELOOP\"" -> "false"
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

// killer: scripts/l2/seal.mjs:28 CONST "bestTap({ scale, start" -> "bestTap({ scale: 3, start"
test("l2_seal_one_scale", async () => {
  // m-4 (a) of the G2 of c5: the second diff sets a new best bid, which the ticker holds: the tap reads the price at the replay's scale.
  const out = fresh();
  await day(out, "100.50");
  await sealed(out);
  assert.deepEqual(manifest(out).crosscheck, { i: { tickers: 1, outside: 0 }, ii: { changes: 1, unmatched: 0, unjudged: 1, first: [] } });
});

// killer: scripts/record-binance-l2.mjs:241 CONST "[\"journal.jsonl\", \"requests.jsonl\"]" -> "[\"requests.jsonl\"]"
test("l2_check_journal_single_link", async () => {
  const m = await command(), out = fresh(), elsewhere = fresh() + "-file", run = m.adopt(plan(m, out), clocks);
  linkSync(join(out, "journal.jsonl"), elsewhere);
  assert.deepEqual(detailOf(() => run.check()), { entry: "journal.jsonl", why: "hard link" }, "m-4 (b): n-5bis of journal.jsonl at each check");
});

// killer: scripts/record-binance-l2.mjs:219 SDL "  guardOut(plan.out);" -> ""
test("l2_adopt_guards_again", async () => {
  // m-1 of the G2 of c5: after prepare, the parent of --out swapped for a link to a directory that holds .git; nothing made there.
  const m = await command(), top = fresh(), git = fresh(), out = join(top, "o");
  mkdirSync(top);
  mkdirSync(join(git, ".git"), { recursive: true });
  const p = plan(m, out);
  rmSync(top, { recursive: true });
  symlinkSync(git, top, "dir");
  assert.deepEqual([codeOf(() => m.adopt(p, clocks)), readdirSync(git)], ["out_in_git_tree", [".git"]]);
});

// killer: scripts/record-binance-l2.mjs:236 SDL "  guardOut(plan.out);" -> ""
test("l2_adopt_guards_before_start", async () => {
  // m-1: the same swap once --out is made, while its start line is stamped: the guards again right before the append.
  const m = await command(), top = fresh(), git = fresh(), out = join(top, "o"), p = plan(m, out);
  mkdirSync(join(git, ".git"), { recursive: true });
  const swap = (): number => { renameSync(top, top + "-aside"); symlinkSync(git, top, "dir"); return 7; };
  assert.deepEqual(codeOf(() => m.adopt(p, { ...clocks, wallUs: swap })), "out_in_git_tree");
  assert.deepEqual([readdirSync(git), readdirSync(join(top + "-aside", "o"))], [[".git"], []], "no start line anywhere");
});

// killer: scripts/record-binance-l2.mjs:146 CONST "bytesUnder(at)" -> "bytesUnder(out)"
test("l2_check_walk_pinned", async () => {
  // m-2 of the G2 of c5: the parent link swapped atomically during check(), before its walk: the walk counts the pinned --out (75 %,
  // its alarm), never the foreign one (90 %); the pin before the append stops.
  const m = await command(), s = staged(m, (_o, swap) => { swap(); });
  assert.deepEqual(s.take(), "out_not_l2");
  assert.deepEqual([s.foreign(), s.events(s.real)], ["f".repeat(9_000), ["start", "start"]], "nothing written in the foreign journal");
});

// killer: scripts/record-binance-l2.mjs:152 CONST "join(at, \"journal.jsonl\")" -> "join(out, \"journal.jsonl\")"
test("l2_check_alarm_pinned", async () => {
  // m-2: the swap between the pin and the append of quota_alarm: the alarm lands in the pinned --out.
  const m = await command(), s = staged(m, (o, swap) => ({ ...o, pin: () => { o.pin?.(); swap(); } }));
  assert.equal(s.take(), s.real);
  assert.deepEqual([s.foreign(), s.events(s.real)], ["f".repeat(9_000), ["start", "start", "quota_alarm"]]);
});

// killer: scripts/record-binance-l2.mjs:222 CONST "`/proc/self/fd/${fd}`" -> "real"
test("l2_check_through_descriptor", { skip: process.platform === "linux" ? false : "no /proc/self/fd: the real path is written, a window declared" }, async () => {
  // m-2 on Linux (Q-C5-6): --out renamed and remade at its real path between the pin and the append: the alarm follows the descriptor.
  const m = await command(), moved = fresh();
  const s = staged(m, (o) => ({ ...o, pin: () => { o.pin?.(); renameSync(s.realtop, moved); mkdirSync(s.real, { recursive: true }); } }));
  assert.equal(s.take(), s.real);
  assert.deepEqual([existsSync(join(s.real, "journal.jsonl")), s.events(join(moved, "o"))], [false, ["start", "start", "quota_alarm"]]);
});

// killer: scripts/record-binance-l2.mjs:227 CONST "now.dev !== id.dev || now.ino !== id.ino" -> "false"
test("l2_check_directory_pinned", async () => {
  // n-2 of the G2 of c5: --out renamed, a new directory at its path: same real path, another directory.
  const m = await command(), moved = fresh(), s = staged(m), run = m.adopt(plan(m, s.out, 1_000_000), clocks);
  renameSync(s.realtop, moved);
  mkdirSync(s.real, { recursive: true });
  assert.deepEqual(detailOf(() => run.check()), { out: s.out, real: s.real, why: "another directory" });
});

// killer: scripts/record-binance-l2.mjs:231 CONST "RACED.includes(e?.code)" -> "false"
test("l2_check_path_vanished_named", async () => {
  // m-3 of the G2 of c5: --out removed between the pin and the append: a named stop, not a raw ENOENT.
  const m = await command(), s = staged(m, (o) => ({ ...o, pin: () => { o.pin?.(); rmSync(s.real, { recursive: true }); } }));
  assert.deepEqual([s.take(), existsSync(s.real)], ["out_not_l2", false]);
});

// killer: scripts/record-binance-l2.mjs:174 CONST "check({ journal: false })" -> "check()"
test("l2_quota_alarm_at_adopt", async () => {
  // n-4 of the G2 of c5 (Q-C5-5): another tool's journal.jsonl alone at 75 %: prepare writes nothing, adopt refuses it; this recorder's
  // output at 75 %: the alarm after the start line.
  const m = await command(), other = fresh(), s = staged(m);
  mkdirSync(other);
  writeFileSync(join(other, "journal.jsonl"), "o".repeat(7_500));
  assert.deepEqual([codeOf(() => m.adopt(plan(m, other, 10_000), clocks)), readFileSync(join(other, "journal.jsonl"), "utf8")], ["out_not_l2", "o".repeat(7_500)]);
  assert.deepEqual([s.take(), s.events(s.real)], [s.real, ["start", "start", "quota_alarm"]]);
});

// killer: scripts/record-binance-l2.mjs:192 CONST "!fstatSync(fd).isFile()" -> "false"
test("l2_append_not_a_file", { skip: process.platform === "win32" ? "no FIFO" : false }, async () => {
  // n-3 of the G2 of c5: journal.jsonl swapped for a FIFO: never blocks, named, without a reader and with one.
  const m = await command(), dir = fresh(), fifo = join(dir, "journal.jsonl");
  mkdirSync(dir);
  assert.equal(spawnSync("mkfifo", [fifo]).status, 0);
  const without = detailOf(() => m.appendLine(fifo, { event: "x" })), reader = openSync(fifo, constants.O_RDONLY | constants.O_NONBLOCK);
  try { assert.deepEqual([without, detailOf(() => m.appendLine(fifo, { event: "x" }))], [{ entry: fifo, why: "not a regular file" }, { entry: fifo, why: "not a regular file" }]); } finally { closeSync(reader); }
});

// ---- P1-c5-bis-a ----
const fs = createRequire(import.meta.url)("node:fs") as { -readonly [K in keyof typeof import("node:fs")]: (typeof import("node:fs"))[K] }; // the CommonJS object, whose lstatSync a test wraps
const CHILD = join(SCRIPTS, "l2", "seal-child.mjs"), APART = process.platform === "win32" ? "win32: libuv gives a child the names of its base environment, which the child refuses (m-7 of the G7 of c4, M-1)" : false;
const specOf = (out: string, open: string[] = []): SealM.ApartSpec => ({ out, symbol: "BTCUSDT", day: D, nowUs: END + 121 * S, scale: 2, open });
/** The child spawned by hand: [exit code, its JSON line or null], with `flags` before the script and `env`. */
function child(out: string, flags: string[], env: Record<string, string>): [number | null, unknown] {
  const r = spawnSync(process.execPath, [...flags, CHILD, JSON.stringify(specOf(out))], { env, encoding: "utf8" });
  try { return [r.status, JSON.parse(r.stdout) as unknown]; } catch { return [r.status, null]; }
}
/** f() once true, polled for 5 s at most (the writer's loop runs on the file system). */
const twice = async (f: () => boolean): Promise<boolean> => { for (let i = 0; i < 1_000 && !f(); i += 1) await new Promise((r) => setTimeout(r, 5)); return f(); };
/** A spot link of BTCUSDT on a socket driven by hand, its clock at `now` (us), each message's hook recorded. */
function handLink(out: string): { link: L.Link; ws: { onopen: () => void; onmessage: (e: { data: unknown }) => void }; texts: [string, string][]; clock: { now: number }; cid: () => string } {
  const clock = { now: START + 10 * 3_600 * S }, texts: [string, string][] = [], socks: { onopen: () => void; onmessage: (e: { data: unknown }) => void }[] = [];
  const io: L.LinkIo = { webSocket: () => { const w = { close: () => undefined, extensions: "" } as unknown as (typeof socks)[0]; socks.push(w); return w as unknown as WebSocket; },
    wallUs: () => clock.now, monoNs: () => BigInt(clock.now) * 1000n, setTimer: () => 0, clearTimer: () => undefined, gate: L.openingGate(), onText: (t, c) => { texts.push([t, c]); } };
  const link = L.openLink({ symbol: "BTCUSDT", url: L.spotUrl("BTCUSDT"), out }, io), ws = socks[0]!;
  ws.onopen();
  return { link, ws, texts, clock, cid: () => cidOf("spot", "BTCUSDT", START + 10 * 3_600 * S) };
}

// killer: scripts/l2/seal-child.mjs:22 CONST "!open.includes(" -> "open.includes("
test("l2_seal_apart_as_in_process", { skip: APART }, async () => {
  // Q-5 of a2, Q-C1-9, m-5 of the G2 of c5: the loop seals in a child process; its day is the in-process seal's, byte for byte, and it
  // waits while a writer holds a segment open (closed(cid, seg) from the loop's "cid/seg").
  const m = await seal(), [a, b] = [fresh(), fresh()], seg = `${cidOf("spot", "BTCUSDT", START + S)}/${segmentOf(START)}`;
  assert.equal(typeof m.sealApart, "function", "sealApart is absent");
  for (const out of [a, b]) await day(out);
  assert.deepEqual(await m.sealApart(specOf(a, [seg]), { env: {} }), { sealed: false, wait: "segments", open: [seg] });
  assert.deepEqual([await m.sealApart(specOf(a), { env: {} }), await sealed(b)], [{ sealed: true, dir: dayDir(a), frames: 4 }, { sealed: true, dir: dayDir(b), frames: 4 }]);
  assert.equal(readFileSync(join(dayDir(a), "SHA256SUMS"), "utf8"), readFileSync(join(dayDir(b), "SHA256SUMS"), "utf8"), "the same bytes, apart or not");
});

// killer: scripts/l2/seal-child.mjs:19 CONST "execArgv.length !== 1 || " -> ""
test("l2_seal_child_flags_closed", { skip: APART }, async () => {
  // The child's own guard (c4's execArgv guard, for the one flag it is spawned with): the heap cap alone, else proxy_refused, nothing read.
  const out = fresh(), cap = "--max-old-space-size=64", refused = { stop: "proxy_refused", detail: { execArgv_length: 0, why: "the heap cap alone" } };
  await day(out);
  assert.deepEqual([child(out, [], {}), child(out, [cap, "--no-warnings"], {}), child(out, ["--no-warnings", cap], {})],
    [[1, refused], [1, { ...refused, detail: { ...refused.detail, execArgv_length: 2 } }], [1, { ...refused, detail: { ...refused.detail, execArgv_length: 2 } }]]);
  assert.equal(existsSync(join(dayDir(out), "SHA256SUMS")), false);
});

// killer: scripts/l2/seal-child.mjs:20 SDL "  guardEnv(env, []);" -> ""
test("l2_seal_child_env_closed", { skip: APART }, async () => {
  // SERIES-ENV-ALLOWLIST-1 in the child: the closed list of the platform (empty on Linux), names only, never a value.
  const out = fresh(), cap = "--max-old-space-size=64";
  await day(out);
  assert.deepEqual([child(out, [cap], { HTTPS_PROXY: "http://proxy.invalid" }), child(out, [cap], { LANG: "C" })],
    [[1, { stop: "proxy_refused", detail: { variables: ["HTTPS_PROXY"], execArgv_length: 0 } }], [1, { stop: "env_refused", detail: { variables: ["LANG"], execArgv_length: 0 } }]]);
  assert.equal(existsSync(join(dayDir(out), "SHA256SUMS")), false);
});

// killer: scripts/l2/seal.mjs:52 CONST "`--max-old-space-size=${heapMb}`, CHILD" -> "CHILD"
test("l2_seal_apart_heap_named", { skip: APART }, async () => {
  // m-5 of the G2 of c5: a heap past the cap kills the child alone; the day stays unsealed, the failure named, this process lives on.
  const m = await seal(), out = fresh(), big = (i: number): [number, string] => [START + S + i * 1000, JSON.stringify({ stream: "btcusdt@trade", data: { e: "trade", E: START + S + i * 1000, s: "BTCUSDT", t: i, x: "y".repeat(4_000_000) } })];
  assert.equal(typeof m.sealApart, "function", "sealApart is absent");
  for (const i of [0, 1, 2, 3]) await conn(out, [big(i)]); // one connection each: a queue holds 8 MiB at most
  const r = await m.sealApart(specOf(out), { env: {}, heapMb: 8 }), failed = (r as { failed?: { code: number | null; stop: unknown } }).failed;
  assert.deepEqual([r.sealed, failed?.stop, failed?.code === 0, existsSync(join(dayDir(out), "SHA256SUMS"))], [false, null, false, false]);
  assert.equal(m.SEAL_HEAP_MB, 128, "the cap measured in the lot plan");
});

// killer: scripts/record-binance-l2.mjs:133 CONST ", { throwIfNoEntry: false }" -> ""
test("l2_walk_vanished_entry_absent", async () => {
  // The concurrent seal of the G2 of c5: a file unlinked under days/ between the listing and its lstat counts as absent, never a stop.
  const m = await command(), dir = fresh(), tmp = join(dir, "days", "BTCUSDT", `.${D}.SHA256SUMS.tmp`), real = fs.lstatSync;
  mkdirSync(dirname(tmp), { recursive: true });
  writeFileSync(join(dir, "journal.jsonl"), "x".repeat(10));
  writeFileSync(tmp, "y".repeat(5));
  fs.lstatSync = ((...a: Parameters<typeof real>) => { if (a[0] === tmp && existsSync(tmp)) fs.unlinkSync(tmp); return real(...a); }) as typeof real;
  syncBuiltinESMExports();
  try { assert.deepEqual([codeOf(() => m.bytesUnder(dir)), existsSync(tmp)], [10, false]); } finally { fs.lstatSync = real; syncBuiltinESMExports(); }
});

// killer: scripts/l2/links.mjs:181 CONST "io.onText?.(e.data, cid)" -> "0"
test("l2_link_feeds_its_hook", async () => {
  // Q-A4-3: each text message reaches the loop's hook with its <cid>, once its writer has it; a binary one never.
  const out = fresh(), h = handLink(out);
  h.ws.onmessage({ data: "a" });
  h.ws.onmessage({ data: "b" });
  h.ws.onmessage({ data: new ArrayBuffer(1) });
  assert.deepEqual(h.texts, [["a", h.cid()], ["b", h.cid()]]);
  await h.link.stop();
});

// killer: scripts/l2/links.mjs:205 CONST "live.get(cid).closed.includes(seg)" -> "true"
test("l2_link_closed_segments", async () => {
  // Q-C1-5: closed(cid, seg) is false while a writer of the link holds the segment open, true once closed, true for a <cid> it never held.
  const out = fresh(), h = handLink(out), seg = segmentOf(h.clock.now);
  h.ws.onmessage({ data: "a" });
  assert.equal(typeof h.link.closed, "function", "closed is absent");
  assert.ok(await twice(() => existsSync(join(out, "conn", h.cid(), `${seg}.frames`))));
  assert.deepEqual([h.link.closed(h.cid(), seg), h.link.closed(cidOf("spot", "BTCUSDT", START), seg)], [false, true]);
  await h.link.stop();
  assert.equal(h.link.closed(h.cid(), seg), true);
});

// killer: scripts/l2/links.mjs:204 CONST "w.cut()" -> "0"
test("l2_link_cut_on_the_hour", async () => {
  // D24-3: cut(), on the hour, closes each writer's open segment once its hour is over, no frame needed.
  const out = fresh(), h = handLink(out), seg = segmentOf(h.clock.now);
  h.ws.onmessage({ data: "a" });
  assert.equal(typeof h.link.cut, "function", "cut is absent");
  h.link.cut();
  h.clock.now += 3_600 * S;
  h.link.cut();
  assert.deepEqual([await twice(() => h.link.closed(h.cid(), seg)), existsSync(join(out, "conn", h.cid(), `${segmentOf(h.clock.now)}.frames`))], [true, false]);
  await h.link.stop();
});

// killer: scripts/l2/segments.mjs:70 CONST "f.sync?.()" -> "0"
test("l2_segment_synced_before_close", async () => {
  // m-7 of the G7 of c1: each file of a segment is synced, then closed, before the seal can read it.
  const ops: string[] = [], file = (name: string): SegmentFile & { sync: () => Promise<void> } =>
    ({ appendFile: () => { ops.push(`${name} append`); return Promise.resolve(); }, sync: () => { ops.push(`${name} sync`); return Promise.resolve(); }, close: () => { ops.push(`${name} close`); return Promise.resolve(); } });
  const w = openWriter(fresh(), cidOf("spot", "BTCUSDT", START), { wallUs: () => START, monoNs: () => 1n, open: (p) => Promise.resolve(file(p.endsWith(".frames") ? "frames" : "index")) });
  w.push("a");
  await w.close();
  assert.deepEqual(ops.filter((o) => !o.endsWith("append")).sort(), ["frames close", "frames sync", "index close", "index sync"]);
  assert.ok(ops.indexOf("frames sync") < ops.indexOf("frames close") && ops.indexOf("index sync") < ops.indexOf("index close"));
});

/** An output adopted after a run that opened `cids` (their last segment cut short by hand: a frame without its line), then `between`
 *  runs that opened nothing; the root and the clocks of adopt. */
async function crashed(m: typeof RecordM, cids: number, between = 0): Promise<{ at: string; real: string; tails: () => Line[] }> {
  const out = fresh(), opened: string[] = [];
  mkdirSync(out);
  for (let i = 0; i < cids; i += 1) {
    const cid = cidOf("spot", "BTCUSDT", START + i * S);
    opened.push(JSON.stringify({ host_us: 1, mono_ns: "1", symbol: "BTCUSDT", cid, event: "open" }));
    let now = START + i * S;
    const w = openWriter(out, cid, { wallUs: () => now, monoNs: () => 1n });
    for (const us of [now, START + 3_600 * S]) { now = us; w.push("{}"); }
    await w.close();
    fs.appendFileSync(join(out, "conn", cid, `${segmentOf(START + 3_600 * S)}.frames`), "{}" + LF);
  }
  writeFileSync(join(out, "journal.jsonl"), [START_LINE, ...opened.map((l) => JSON.parse(l) as Line), ...Array<Line>(between).fill(START_LINE)].map((l) => JSON.stringify(l) + LF).join(""));
  const run = m.adopt(plan(m, out), clocks);
  return { at: run.at, real: run.real, tails: () => journal(run.real).filter((l) => (l as Line).event === "tail_marked") as Line[] };
}

// killer: scripts/record-binance-l2.mjs:258 CONST "marked.has(`${cid}/${seg}`)" -> "false"
test("l2_tails_marked_once", async () => {
  // Q-C1-4: at a start, the tail of each last segment of the last run is journaled tail_marked, the fields of checkTail, once.
  const m = await command(), c = await crashed(m, 2), cid = cidOf("spot", "BTCUSDT", START), seg = segmentOf(START + 3_600 * S);
  assert.equal(typeof m.markTails, "function", "markTails is absent");
  const first = m.markTails(c.at, clocks);
  assert.deepEqual([first.length, m.markTails(c.at, clocks).length, c.tails().length], [2, 0, 2], "marked once");
  assert.deepEqual(c.tails()[0], { host_us: 7, mono_ns: "9", symbol: "BTCUSDT", cid, event: "tail_marked", seg, ranks: 1, frames_kept: 3, frames_size: 6, index_kept: 74, index_size: 74, causes: ["frame_without_line"] });
});

// killer: scripts/record-binance-l2.mjs:254 CONST "run.size > 0 ? run : last, new Set()" -> "run, new Set()"
test("l2_tails_of_the_last_run_with_links", async () => {
  // A run that died before its links opened (its start alone) leaves the run before it to the next start: its tails are still found.
  const m = await command(), c = await crashed(m, 1, 2);
  assert.equal(typeof m.markTails, "function", "markTails is absent");
  assert.deepEqual([m.markTails(c.at, clocks).length, c.tails().length], [1, 1]);
});
