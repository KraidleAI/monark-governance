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
import { EventEmitter } from "node:events";
import { spawnSync } from "node:child_process";
import { createRequire, syncBuiltinESMExports } from "node:module";
import { closeSync, constants, existsSync, linkSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DayStop, sealDay, STOPS, type DeriveContext } from "../scripts/l2/day.mjs";
import { deriveDay } from "../scripts/l2/derive.mjs";
import { cidOf, openWriter, segmentOf, type SegmentFile } from "../scripts/l2/segments.mjs";
import * as L from "../scripts/l2/links.mjs";
import type * as RecordM from "../scripts/record-binance-l2.mjs";
import type * as SealM from "../scripts/l2/seal.mjs";
import { settles } from "./helpers/host-clock.ts";
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
    "scripts/l2/links.mjs", "scripts/l2/rest.mjs", "scripts/l2/seal-child.mjs", "scripts/l2/seal.mjs", "scripts/l2/segments.mjs", RECORDER], "Q-C4-5: the command beside the modules; Q-C5B-4: the seal child");
  assert.deepEqual([shas[RECORDER], shas["scripts/l2/seal.mjs"], shas["scripts/l2/seal-child.mjs"]], [sha(join(SCRIPTS, "record-binance-l2.mjs")), sha(join(SCRIPTS, "l2", "seal.mjs")), sha(join(SCRIPTS, "l2", "seal-child.mjs"))]);
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
test("l2_check_walk_pinned", { skip: process.platform === "win32" ? "win32 cannot replace a directory link by rename (EPERM): the atomic swap does not exist" : false }, async () => {
  // m-2 of the G2 of c5: the parent link swapped atomically during check(), before its walk: the walk counts the pinned --out (75 %,
  // its alarm), never the foreign one (90 %); the pin before the append stops.
  const m = await command(), s = staged(m, (_o, swap) => { swap(); });
  assert.deepEqual(s.take(), "out_not_l2");
  assert.deepEqual([s.foreign(), s.events(s.real)], ["f".repeat(9_000), ["start", "start"]], "nothing written in the foreign journal");
});

// killer: scripts/record-binance-l2.mjs:152 CONST "join(at, \"journal.jsonl\")" -> "join(out, \"journal.jsonl\")"
test("l2_check_alarm_pinned", { skip: process.platform === "win32" ? "win32 cannot replace a directory link by rename (EPERM): the atomic swap does not exist" : false }, async () => {
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
type Sock = { onopen: () => void; onmessage: (e: { data: unknown }) => void };
function handLink(out: string, hook?: (text: string, cid: string) => void): { link: L.Link; ws: Sock; socks: Sock[]; texts: [string, string][]; clock: { now: number }; cid: () => string } {
  const clock = { now: START + 10 * 3_600 * S }, texts: [string, string][] = [], socks: Sock[] = [];
  const io: L.LinkIo = { webSocket: () => { const w = { close: () => undefined, extensions: "" } as unknown as Sock; socks.push(w); return w as unknown as WebSocket; },
    wallUs: () => clock.now, monoNs: () => BigInt(clock.now) * 1000n, setTimer: () => 0, clearTimer: () => undefined, gate: L.openingGate(), onText: hook ?? ((t, c) => { texts.push([t, c]); }) };
  const link = L.openLink({ symbol: "BTCUSDT", url: L.spotUrl("BTCUSDT"), out }, io), ws = socks[0]!;
  ws.onopen();
  return { link, ws, socks, texts, clock, cid: () => cidOf("spot", "BTCUSDT", START + 10 * 3_600 * S) };
}

// killer: scripts/l2/seal-child.mjs:36 CONST "!open.includes(" -> "open.includes("
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

// killer: scripts/l2/seal-child.mjs:32 CONST "execArgv.length !== 1 || " -> ""
test("l2_seal_child_flags_closed", { skip: APART }, async () => {
  // The child's own guard (c4's execArgv guard, for the one flag it is spawned with): the heap cap alone, else proxy_refused, nothing read.
  const out = fresh(), cap = "--max-old-space-size=64", refused = { stop: "proxy_refused", detail: { why: "the heap cap alone" } };
  await day(out);
  const of = (n: number): unknown => [1, { ...refused, detail: { ...refused.detail, execArgv_length: n } }];
  assert.deepEqual([child(out, [], {}), child(out, ["--no-warnings"], {}), child(out, [cap, "--no-warnings"], {}), child(out, ["--no-warnings", cap], {})],
    [of(0), of(1), of(2), of(2)], "none, another one alone, or a second one: refused");
  assert.equal(existsSync(join(dayDir(out), "SHA256SUMS")), false);
});

// killer: scripts/l2/seal-child.mjs:33 SDL "  guardEnv(env, []);" -> ""
test("l2_seal_child_env_closed", { skip: APART }, async () => {
  // SERIES-ENV-ALLOWLIST-1 in the child: the closed list of the platform (empty on Linux), names only, never a value.
  const out = fresh(), cap = "--max-old-space-size=64";
  await day(out);
  assert.deepEqual([child(out, [cap], { HTTPS_PROXY: "http://proxy.invalid" }), child(out, [cap], { LANG: "C" })],
    [[1, { stop: "proxy_refused", detail: { variables: ["HTTPS_PROXY"], execArgv_length: 0 } }], [1, { stop: "env_refused", detail: { variables: ["LANG"], execArgv_length: 0 } }]]);
  assert.equal(existsSync(join(dayDir(out), "SHA256SUMS")), false);
});

// killer: scripts/l2/seal.mjs:71 CONST "`--max-old-space-size=${heapMb}`, CHILD" -> "CHILD"
test("l2_seal_apart_heap_named", { skip: APART }, async () => {
  // m-5 of the G2 of c5: a heap past the cap kills the child alone; the day stays unsealed, the failure named, this process lives on.
  const m = await seal(), out = fresh(), big = (i: number): [number, string] => [START + S + i * 1000, JSON.stringify({ stream: "btcusdt@trade", data: { e: "trade", E: START + S + i * 1000, s: "BTCUSDT", t: i, x: "y".repeat(4_000_000) } })];
  assert.equal(typeof m.sealApart, "function", "sealApart is absent");
  for (const i of [0, 1, 2, 3]) await conn(out, [big(i)]); // one connection each: a queue holds 8 MiB at most
  const r = await m.sealApart(specOf(out), { env: {}, heapMb: 8 }), failed = (r as { failed?: { code: number | null; signal: string | null; stop: unknown; detail: unknown } }).failed;
  assert.deepEqual([r.sealed, failed?.stop, failed?.code, failed?.signal, existsSync(join(dayDir(out), "SHA256SUMS"))], [false, null, null, "SIGABRT", false]);
  assert.match(String((failed?.detail as { stderr?: string } | null)?.stderr), /heap/, "the tail of the child's stderr says why (n-2)");
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

// killer: scripts/l2/links.mjs:181 CONST "fed(io, note, e.data, cid)" -> "0"
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

// ---- P1-c5-bis-a, fold of its G2 ----
/** dev and ino of a directory, as the parent of the seal child passes them (B-1 of the G2 of c5-bis-a). */
const idOf = (dir: string): { dev: string; ino: string } => { const s = statSync(dir, { bigint: true }); return { dev: String(s.dev), ino: String(s.ino) }; };
const UNPINNED = "fd 3 alone, the pinned root";
/** The child spawned by hand with its one flag, env {} and `fds` from fd 3: [exit code, its JSON line or null]; 30 s at most. */
function pinnedChild(spec: unknown, fds: number[]): [number | null, unknown] {
  const r = spawnSync(process.execPath, ["--max-old-space-size=64", CHILD, JSON.stringify(spec)], { env: {}, encoding: "utf8", timeout: 30_000, stdio: ["ignore", "pipe", "pipe", ...fds] });
  try { return [r.status, JSON.parse(r.stdout) as unknown]; } catch { return [r.status, null]; }
}
/** An output adopted (its root pinned, `at`), a day of D under it. */
async function adopted(m: typeof RecordM): Promise<{ at: string; real: string }> {
  const c = await crashed(m, 0);
  await day(c.real);
  return c;
}

// killer: scripts/l2/seal.mjs:71 CONST ", fd]" -> "]"
test("l2_seal_apart_through_the_pinned_root", { skip: APART }, async () => {
  // B-1 of the G2 of c5-bis-a: adopt's root, /proc/self/fd/<n>, is close-on-exec, absent in the child (whose mkdir spun there without end):
  // the parent passes it as the child's fd 3. The day sealed apart through it is the in-process seal's through the same kind of root,
  // byte for byte, and the call ends; env defaults to none (n-3).
  const m = await seal(), r = await command(), [a, b] = [await adopted(r), await adopted(r)];
  assert.equal(typeof m.SEAL_TIMEOUT_MS, "number", "the deadline of sealApart is absent");
  const inProcess = m.sealOf({ out: b.at, symbol: "BTCUSDT", day: D, nowUs: END + 121 * S, closed: () => true, scale: 2 });
  assert.deepEqual([await m.sealApart(specOf(a.at)), inProcess], [{ sealed: true, dir: dayDir(a.at), frames: 4 }, { sealed: true, dir: dayDir(b.at), frames: 4 }]);
  assert.equal(readFileSync(join(dayDir(a.real), "SHA256SUMS"), "utf8"), readFileSync(join(dayDir(b.real), "SHA256SUMS"), "utf8"), "the same bytes, apart or not");
});

// killer: scripts/l2/seal-child.mjs:26 CONST "String(st.ino) === root?.ino" -> "true"
test("l2_seal_child_root_checked", { skip: APART }, async () => {
  // B-1: the child writes through its fd 3 alone, checked first (a directory of the dev and ino its parent names): another directory is
  // refused, named, nothing written; no fd 3 (the reproducer of the G2: a spec naming /proc/self/fd/999) is refused at once, never a spin.
  const out = fresh(), other = fresh();
  await day(out);
  mkdirSync(other);
  const spec = { ...specOf(out), root: idOf(out) };
  const fd = openSync(other, "r");
  try {
    assert.deepEqual([pinnedChild(spec, [fd]), pinnedChild({ ...spec, out: "/proc/self/fd/999" }, [])],
      [[1, { stop: "out_not_l2", detail: { extra: [], why: UNPINNED } }], [1, { stop: "out_not_l2", detail: { extra: [], why: UNPINNED } }]]); // no fd 3: node's own there
  } finally { closeSync(fd); }
  assert.deepEqual([existsSync(join(dayDir(out), "SHA256SUMS")), existsSync(join(other, "days"))], [false, false]);
});

// killer: scripts/l2/seal-child.mjs:26 CONST "extra.length === 0" -> "true"
test("l2_seal_child_root_alone", { skip: APART }, async () => {
  // B-1: fd 3 is the one descriptor the child takes from its parent; a file, a directory or a socket past it is refused, named.
  const out = fresh();
  await day(out);
  const fd = openSync(out, "r"), file = openSync(CHILD, "r"), spec = { ...specOf(out), root: idOf(out) };
  try {
    assert.deepEqual(pinnedChild(spec, [fd, file]), [1, { stop: "out_not_l2", detail: { extra: [4], why: UNPINNED } }]);
    assert.deepEqual(pinnedChild(spec, [fd]), [0, { result: { sealed: true, dir: dayDir(out), frames: 4 } }]);
  } finally { closeSync(fd); closeSync(file); }
});

// killer: scripts/l2/seal.mjs:72 CONST "timer = setTimeout(" -> "timer = Math.max("
test("l2_seal_apart_deadline", { skip: APART }, async () => {
  // B-1: past its deadline the child is killed and the call ends, a named failure; never a promise left pending.
  const m = await seal(), out = fresh();
  await day(out);
  assert.equal(typeof m.SEAL_TIMEOUT_MS, "number", "the deadline of sealApart is absent");
  assert.deepEqual(await m.sealApart(specOf(out), { env: {}, timeoutMs: 1 }), { sealed: false, failed: { code: null, signal: null, stop: "seal_timeout", detail: { timeout_ms: 1 } } });
});

// killer: scripts/l2/seal.mjs:73 CONST "signal?.addEventListener(" -> "void ("
test("l2_seal_apart_aborted", { skip: APART }, async () => {
  // B-1: the loop's clean stop aborts a seal under way (the child killed), or one not begun (no child): seal_aborted, named.
  const m = await seal(), out = fresh(), ac = new AbortController(), aborted = { sealed: false, failed: { code: null, signal: null, stop: "seal_aborted", detail: null } };
  await day(out);
  assert.equal(typeof m.SEAL_TIMEOUT_MS, "number", "the deadline of sealApart is absent");
  const under = m.sealApart(specOf(out), { env: {}, signal: ac.signal });
  ac.abort();
  assert.deepEqual([await under, await m.sealApart(specOf(out), { env: {}, signal: AbortSignal.abort() })], [aborted, aborted]);
});

// killer: scripts/l2/seal.mjs:74 CONST "catch (e) { return finish(" -> "catch (e) { throw e; return finish("
test("l2_seal_apart_never_rejects", { skip: APART }, async () => {
  // m-2 of the G2 of c5-bis-a: a spec past what one argument holds (E2BIG), one that is not JSON, a root absent (n-8: never an empty day
  // sealed): a named failure each, never a rejection.
  const m = await seal(), out = fresh();
  await day(out);
  const of = (s: unknown): Promise<unknown> => m.sealApart(s as SealM.ApartSpec, { env: {} }).then((r) => (r as { failed?: unknown }).failed, (e: unknown) => ({ rejected: String(e) }));
  const named = (stop: string, error: string): unknown => ({ code: null, signal: null, stop, detail: { error } });
  assert.deepEqual(await Promise.all([of({ ...specOf(out), config: "x".repeat(200_000) }), of({ ...specOf(out), nowUs: 1n }), of(specOf(join(out, "none")))]),
    [named("spawn_failed", "E2BIG"), named("spec_refused", "TypeError"), named("root_refused", "ENOENT")]);
  assert.equal(existsSync(join(out, "none")), false);
});

// killer: scripts/l2/seal-child.mjs:26 CONST "st.nlink > 0n && " -> ""
test("l2_seal_apart_root_deleted", { skip: APART }, async () => {
  // r-1 of the G2 delta of c5-bis-a: a pinned root deleted since it was opened (nlink 0; the child's mkdir spun there to the deadline) is refused at once.
  const m = await seal(), out = fresh(), fd = openSync(mkdirSync(out, { recursive: true }) ?? out, "r");
  rmSync(out, { recursive: true });
  assert.deepEqual(await m.sealApart(specOf(`/proc/self/fd/${String(fd)}`), { timeoutMs: 5_000 }).finally(() => { closeSync(fd); }), { sealed: false, failed: { code: 1, signal: null, stop: "out_not_l2", detail: { extra: [], why: UNPINNED } } });
});

// killer: scripts/l2/seal.mjs:64 CONST "given === undefined ? undefined : null" -> "given"
test("l2_seal_apart_io_refused", { skip: APART }, async () => {
  // r-2 and n-9 of the G2 delta of c5-bis-a: a signal no AbortSignal, an io getter that throws: spec_refused before the root is opened; a null io is none.
  const m = await seal(), none = join(fresh(), "none"), named = (stop: string, error: string): unknown => ({ code: null, signal: null, stop, detail: { error } });
  const of = (io: unknown): Promise<unknown> => Promise.resolve().then(async () => await m.sealApart(specOf(none), io as never)).then((r) => (r as { failed?: unknown }).failed, (e: unknown) => ({ rejected: String(e) }));
  assert.deepEqual(await Promise.all([of({ signal: {} }), of({ signal: new EventTarget() }), of({ get env(): never { throw new RangeError("io"); } }), of(null)]),
    [named("spec_refused", "TypeError"), named("spec_refused", "TypeError"), named("spec_refused", "RangeError"), named("root_refused", "ENOENT")]);
});

// killer: scripts/l2/seal.mjs:60 CONST "child?.kill(\"SIGKILL\")" -> "0"
test("l2_seal_apart_child_killed", { skip: APART }, async () => {
  // r-3 (M4) of the G2 delta of c5-bis-a: past the deadline or on abort the child is dead, not left to seal: no day sealed after a seal's time.
  const m = await seal(), [a, b] = [fresh(), fresh()], ac = new AbortController();
  await day(a); await day(b);
  const ends = [m.sealApart(specOf(a), { timeoutMs: 1 }), m.sealApart(specOf(b), { signal: ac.signal })], slept = new Promise((r) => { ac.abort(); setTimeout(r, 3_000); });
  assert.deepEqual([...(await Promise.all(ends)).map((r) => r.sealed), await slept, ...[a, b].map((o) => existsSync(join(dayDir(o), "SHA256SUMS")))], [false, false, undefined, false, false]);
});

// killer: scripts/record-binance-l2.mjs:257 CONST ".sort()" -> ""
test("l2_tails_of_the_last_segment_by_name", async () => {
  // m-3 of the G2 of c5-bis-a: the last segment of a connection is the last by name, whatever order its directory lists them in.
  const m = await command(), c = await crashed(m, 1), real = fs.readdirSync;
  fs.readdirSync = ((...a: Parameters<typeof real>) => (real(...a) as unknown as string[]).sort().reverse()) as unknown as typeof real;
  syncBuiltinESMExports();
  try { assert.equal(m.markTails(c.at, clocks).length, 1); } finally { fs.readdirSync = real; syncBuiltinESMExports(); }
});

// killer: scripts/l2/segments.mjs:70 CONST "await f.sync?.()" -> "f.sync?.()"
test("l2_segment_closed_once_synced", async () => {
  // m-3: a file of a segment closes once its fsync has ended, never once it was asked.
  const ops: string[] = [], file = (name: string): SegmentFile => ({ appendFile: () => Promise.resolve(), close: () => { ops.push(`${name} close`); return Promise.resolve(); },
    sync: () => new Promise<void>((r) => { setTimeout(() => { ops.push(`${name} synced`); r(); }, 5); }) });
  const w = openWriter(fresh(), cidOf("spot", "BTCUSDT", START), { wallUs: () => START, monoNs: () => 1n, open: (p) => Promise.resolve(file(p.endsWith(".frames") ? "frames" : "index")) });
  w.push("a");
  await w.close();
  assert.deepEqual(["frames", "index"].map((n) => ops.filter((o) => o.startsWith(n))), [["frames synced", "frames close"], ["index synced", "index close"]]);
});

// killer: scripts/l2/segments.mjs:67 CONST "; await syncDir(dir);" -> ";"
test("l2_segment_dir_synced", async () => {
  // n-6 of the G2 of c5-bis-a: once a segment's two files exist, conn/<cid>/ is synced, as sealDay syncs the day's directory.
  const p = createRequire(import.meta.url)("node:fs/promises") as { open: typeof import("node:fs/promises").open }, real = p.open, out = fresh(), cid = cidOf("spot", "BTCUSDT", START), synced: string[] = [];
  p.open = (async (...a: Parameters<typeof real>) => { const h = await real(...a), s = h.sync.bind(h); h.sync = async () => { synced.push(String(a[0])); await s(); }; return h; });
  syncBuiltinESMExports();
  try {
    const w = openWriter(out, cid, { wallUs: () => START, monoNs: () => 1n });
    w.push("a");
    await w.close();
  } finally { p.open = real; syncBuiltinESMExports(); }
  assert.ok(synced.includes(join(out, "conn", cid)), "conn/<cid>/ synced");
});

// killer: scripts/l2/links.mjs:204 CONST "for (const w of live.values()) w.cut();" -> "cur?.w.cut();"
test("l2_link_cut_in_an_overlap", async () => {
  // m-3: cut() reaches each writer the link holds, the old connection's during an overlap too.
  const out = fresh(), h = handLink(out), seg = segmentOf(h.clock.now), first = h.cid();
  h.ws.onmessage({ data: "a" });
  h.clock.now += 1_000; // a millisecond on: the new connection's <cid>
  h.ws.onmessage({ data: JSON.stringify({ e: "serverShutdown" }) });
  const second = cidOf("spot", "BTCUSDT", h.clock.now);
  assert.equal(h.socks.length, 2, "a new connection opened");
  h.socks[1]!.onopen();
  h.socks[1]!.onmessage({ data: "b" });
  h.clock.now += 3_600 * S;
  h.link.cut();
  assert.ok(await twice(() => h.link.closed(first, seg) && h.link.closed(second, seg)), "both segments closed");
  await h.link.stop();
});

// killer: scripts/l2/links.mjs:181 CONST "c.w.push(e.data); fed(io, note, e.data, cid);" -> "fed(io, note, e.data, cid); c.w.push(e.data);"
test("l2_link_hook_after_the_writer", async () => {
  // m-3: the hook runs once the writer has the message: a hook that stops the link loses nothing of it.
  const held: { stop?: Promise<void> } = {}, out = fresh(), h = handLink(out, () => { held.stop ??= h.link.stop(); });
  h.ws.onmessage({ data: "a" });
  await held.stop;
  assert.equal(codeOf(() => readFileSync(join(out, "conn", h.cid(), `${segmentOf(h.clock.now)}.frames`), "utf8")), "a" + LF);
});

// killer: scripts/l2/links.mjs:212 CONST "catch (x) {" -> "catch (x) { throw x;"
test("l2_link_hook_failure_named", async () => {
  // m-4 of the G2 of c5-bis-a: a hook that throws never reaches the socket's dispatch (an uncaughtException ends the recorder): named
  // hook_failed in the journal, the message kept by its writer, the next one fed.
  let n = 0;
  const out = fresh(), h = handLink(out, () => { n += 1; if (n === 1) throw new TypeError("x"); });
  assert.doesNotThrow(() => { h.ws.onmessage({ data: "a" }); });
  h.ws.onmessage({ data: "b" });
  await h.link.stop();
  assert.deepEqual([n, (journal(out) as Line[]).filter((l) => l.event === "hook_failed").map((l) => [l.cid, l.error])], [2, [[h.cid(), "TypeError"]]]);
  assert.equal(readFileSync(join(out, "conn", h.cid(), `${segmentOf(h.clock.now)}.frames`), "utf8"), "a" + LF + "b" + LF);
});

// ---- P1-c5-bis-b ----
const H = 3_600 * S, TIME = "/api/v3/time", ex = (s: string): string => `/api/v3/exchangeInfo?symbol=${s}`, dp = (s: string): string => `/api/v3/depth?symbol=${s}&limit=5000`;
/** Host microseconds of day D + d at h:m:s. */
const at = (d: number, h: number, m: number, s = 0): number => START + d * 86_400 * S + h * H + m * 60 * S + s * S;
const BOOK = JSON.stringify({ lastUpdateId: 7, bids: [["100.00", "1"]], asks: [["101.00", "1"]] });
const depth = (U: number, u: number): string => JSON.stringify({ stream: "btcusdt@depth@100ms", data: { e: "depthUpdate", E: 1, s: "BTCUSDT", U, u, b: [["100.00", "2"]], a: [] } });
const limits = (limit: number): Line[] => [{ rateLimitType: "REQUEST_WEIGHT", interval: "MINUTE", intervalNum: 1, limit }];
/** The place's REST answers: its clock `ahead` us ahead of the host, its REQUEST_WEIGHT limit and tickSize at a host time, a depth of lastUpdateId 7. */
const place = (ahead: number, limit: (now: number) => number = () => 6_000, tick: (now: number) => string = () => "0.01000000") => (path: string, now: number): [number, unknown] =>
  path === TIME ? [200, { serverTime: (now + ahead) / 1000 }] : path.startsWith("/api/v3/depth") ? [200, JSON.parse(BOOK) as unknown]
    : [200, { symbols: [{ filters: [{ filterType: "PRICE_FILTER", tickSize: tick(now) }] }], rateLimits: limits(limit(now)) }];
type HandSock = { url: string; opened: boolean; closed: boolean; onopen?: () => void; onmessage?: (e: { data: unknown }) => void; onclose?: (e: { code: number; reason: string; wasClean: boolean }) => void };
/** A recording on a host driven by hand: its clock and timers, fetch answered by `answer` (never the network), sockets by hand that hear
 *  "{}" (spot every 20 s from 7 s, /market every 8 min from 4 min 7 s: no watchdog fires, and hour 23 of /market is silent from 23:56:07 to
 *  00:04:07), the seal given; until(us) runs the timers due in time order; send() a text on the live BTCUSDT socket. */
function host(t0: number, answer: (path: string, now: number) => [number, unknown], seal: RecordM.RecorderIo["seal"] = () => Promise.resolve({ sealed: true, dir: "", frames: 0 })) {
  const t = { now: t0 }, timers: { at: number; fn: () => void }[] = [], fetched: [number, string][] = [], socks: HandSock[] = [], ac = new AbortController();
  const pulses = [{ next: t0 + 7 * S, every: 20 * S, spot: true }, { next: t0 + 247 * S, every: 480 * S, spot: false }];
  const io: RecordM.RecorderIo = { env: {}, execArgv: [], freeBytes: () => 1e12, wallUs: () => t.now, monoNs: () => BigInt(t.now) * 1000n, signal: ac.signal, seal,
    setTimer: (fn, ms) => { const h = { at: t.now + Math.round(ms * 1000), fn }; timers.push(h); return h; },
    clearTimer: (h) => { if (timers.includes(h as never)) timers.splice(timers.indexOf(h as never), 1); },
    sleep: (ms) => new Promise((r) => { io.setTimer!(r, ms); }), // segment files made on disk, their bytes nowhere: the writers keep pace with the host's clock
    open: (path) => { writeFileSync(path, "", { flag: "wx" }); return Promise.resolve({ appendFile: () => Promise.resolve(), sync: () => Promise.resolve(), close: () => Promise.resolve() }); },
    fetch: (url) => { const p = new URL(url), path = p.pathname + p.search, [status, body] = answer(path, t.now); fetched.push([t.now, path]); return Promise.resolve(new Response(JSON.stringify(body), { status })); },
    webSocket: (url) => { const s: HandSock = { url, opened: false, closed: false }; socks.push(s); return Object.assign(s, { close: () => { s.closed = true; }, extensions: "" }) as unknown as WebSocket; } };
  const settle = async (): Promise<void> => { await new Promise((r) => setTimeout(r, 5)); for (const s of socks) if (!s.opened && s.onopen) { s.opened = true; s.onopen(); } };
  const until = async (us: number): Promise<void> => {
    for (;;) {
      await settle();
      timers.sort((x, y) => x.at - y.at);
      const p = pulses.reduce((x, y) => (y.next < x.next ? y : x)), next = Math.min(timers[0]?.at ?? Infinity, p.next);
      if (next > us) break;
      t.now = Math.max(t.now, next);
      if (next < p.next) timers.shift()!.fn();
      else for (const s of socks) if (s.opened && !s.closed && s.url.includes("/market/") !== p.spot) s.onmessage?.({ data: "{}" });
      if (next === p.next) p.next += p.every;
    }
    t.now = us;
    await settle();
  };
  const live = (): HandSock => socks.filter((s) => s.url.includes("btcusdt@depth") && !s.closed).at(-1)!;
  return { io, fetched, until, live, stop: () => { ac.abort(); }, send: (text: string) => { live().onmessage!({ data: text }); }, jump: (us: number) => { t.now = us; }, socks };
}
const argv = (out: string): string[] => ["--out", out, "--quota-bytes", "1000000000"];
const events = (out: string, names: string[]): Line[] => (journal(out) as Line[]).filter((l) => names.includes(l.event as string));

// killer: scripts/record-binance-l2.mjs:278 CONST "(86_350 + 10 * r)" -> "(86_340 + 10 * r)"
test("l2_record_loop_schedules", async () => {
  // FM-1.1 (plan section 3 points 13 to 15, D24-3, D24-5; n-3 of c4): across a day boundary, the place 5 s ahead: the place time at the
  // start and at minute 30; exchangeInfo at the start, then at 23:58:00 + 10 s x rank of the place; the anchors at 23:59:10 + 10 s x rank,
  // the same bytes closing D and opening D + 1; the cut on the hour (the seal of D at 00:03 waits for the segments of hour 00 alone, then
  // seals at 01:03 at the scale of its day, once, its lock held during each call: n-4); check() at minute 5 of ten (a stray entry found at
  // 02:15, a named stop after the clean stop).
  const m = await command(), out = fresh(), seals: [number, string, number, unknown, string[], boolean][] = [];
  assert.equal(typeof m.calendar, "function", "the loop is absent");
  const h = host(at(0, 23, 20), place(5 * S, undefined, (now) => (now < at(0, 23, 57) ? "0.01000000" : "0.10000000")), (spec) => {
    seals.push([h.io.wallUs!(), `${spec.symbol}/${spec.day}`, spec.scale, spec.config, [...new Set(spec.open!.map((o) => o.split("/")[1]!))],
      existsSync(join(out, "days", spec.symbol, `.${spec.day}.seal.lock`))]);
    return Promise.resolve(spec.open!.length > 0 ? { sealed: false, wait: "segments", open: spec.open! } : { sealed: true, dir: "", frames: 0 });
  });
  const run = m.run(argv(out), h.io).catch((e: unknown) => e);
  await h.until(at(1, 2, 10));
  writeFileSync(join(out, "stray"), "");
  await h.until(at(1, 2, 15));
  assert.deepEqual(h.fetched, [[at(0, 23, 20), TIME], ...L.SYMBOLS.map((s) => [at(0, 23, 20), ex(s)]), [at(0, 23, 30), TIME],
    ...L.SYMBOLS.map((s, r) => [at(0, 23, 57, 55 + 10 * r), ex(s)]), ...L.SYMBOLS.map((s, r) => [at(0, 23, 59, 5 + 10 * r), dp(s)]), [at(1, 0, 30), TIME], [at(1, 1, 30), TIME]]);
  assert.deepEqual(seals, [at(1, 0, 3), at(1, 1, 3)].flatMap((t, i) => [...L.SYMBOLS].sort().map((s) => [t, `${s}/${D}`, 2, { tickSize: "0.01000000", scale: 2, rateLimits: limits(6_000) }, i === 0 ? ["20261005T00"] : [], true])));
  const close = readFileSync(join(dayDir(out), "anchor-close.json"), "utf8");
  assert.deepEqual([close, readFileSync(join(out, "days", "BTCUSDT", "2026-10-05", "anchor-open.json"), "utf8")], [BOOK, BOOK]);
  assert.equal(((await run) as { code?: string }).code, "out_not_l2");
  assert.deepEqual((journal(out) as Line[]).at(-1), { host_us: at(1, 2, 15), mono_ns: String(at(1, 2, 15) * 1000), symbol: "ALL", cid: null, event: "stopped", cause: "out_not_l2", links_closed: true, seal_done: true });
});

// killer: scripts/record-binance-l2.mjs:397 SDL "  if (!sealDone) abort.abort();" -> ""
test("l2_record_loop_clean_stop", async () => {
  // Q-8 of a3: on its signal, the links stop (each connection closed, named), their writers on a stalled disk awaited STOP_BOUND_MS, the
  // books and the REST client closed, a seal child awaited as long, then killed; one stopped line, then the run resolves.
  const m = await command(), out = fresh(), seen: { signal?: AbortSignal } = {};
  assert.equal(typeof m.calendar, "function", "the loop is absent");
  const h = host(at(0, 23, 59, 50), place(0), (_, o) => { seen.signal = o.signal; return new Promise(() => undefined); });
  h.io.open = () => Promise.resolve({ appendFile: () => new Promise(() => undefined), close: () => Promise.resolve() }); // a stalled disk
  const run = m.run(argv(out), h.io);
  await h.until(at(1, 0, 3, 10));
  assert.equal(seen.signal?.aborted, false, "a seal in flight");
  h.stop();
  await h.until(at(1, 0, 4, 10));
  assert.deepEqual([await run, seen.signal?.aborted], [{ mode: "record", out, stopped: "signal", links_closed: false, seal_done: false }, true]);
  assert.deepEqual(events(out, ["close", "stopped"]).map((l) => [l.host_us, l.event, l.cause]), [...Array<unknown>(5).fill([at(1, 0, 3, 10), "close", "stopped"]), [at(1, 0, 4, 10), "stopped", "signal"]]);
});

// killer: scripts/record-binance-l2.mjs:309 CONST "Math.max(rest.suspendedUntilUs, lowUntil)" -> "rest.suspendedUntilUs"
test("l2_record_weight_suspended", async () => {
  // Q-P1-6, Q-B1-3: a REQUEST_WEIGHT limit read under 4 000 suspends every resync, named, until a reading at or above it: the book waits,
  // no vain try, and takes its snapshot after the next round of exchangeInfo.
  const m = await command(), out = fresh(), h = host(at(0, 23, 50), place(0, (now) => (now < at(0, 23, 58) ? 3_999 : 4_000)));
  assert.equal(typeof m.calendar, "function", "the loop is absent");
  const run = m.run(argv(out), h.io);
  await h.until(at(0, 23, 50, 1));
  h.send(depth(7, 8));
  await h.until(at(0, 23, 59));
  h.stop();
  await run;
  assert.deepEqual(h.fetched.filter(([, p]) => p.startsWith("/api/v3/depth")), [[at(0, 23, 58, 31), dp("BTCUSDT")]]);
  assert.deepEqual(events(out, ["weight_suspended", "weight_resumed", "sync_try_vain", "chain_synced"]).map((l) => [l.host_us, l.event, l.limit ?? l.last_update_id]),
    [[at(0, 23, 50), "weight_suspended", 3_999], [at(0, 23, 58), "weight_resumed", 4_000], [at(0, 23, 58, 31), "chain_synced", 7]]);
});

// killer: scripts/record-binance-l2.mjs:316 CONST "links.get(symbol).closed(from, \"\")" -> "false"
test("l2_record_switch_rule", async () => {
  // Q-A4-3, D-8: a renewal's new connection takes the book once its diff reaches it (switchTo, then switched: the old one closes renewed
  // after the overlap); after an unplanned close, the next connection takes it at once, its gap named by the book.
  const m = await command(), out = fresh(), h = host(at(0, 10, 0), place(0));
  assert.equal(typeof m.calendar, "function", "the loop is absent");
  const run = m.run(argv(out), h.io);
  await h.until(at(0, 10, 0, 1));
  h.send(depth(7, 8));
  await h.until(at(0, 10, 0, 2));
  h.send(JSON.stringify({ e: "serverShutdown" }));
  await h.until(at(0, 10, 0, 3));
  const b = h.live();
  h.send(depth(9, 9));
  await h.until(at(0, 11, 2, 0));
  b.onclose!({ code: 1006, reason: "", wasClean: false });
  for (let i = 0; i < 100 && h.live() === b; i += 1) await h.until(h.io.wallUs!() + S); // the retry, once B's writer has closed
  h.send(depth(20, 20));
  await h.until(h.io.wallUs!() + S);
  h.stop();
  await run;
  const cids = events(out, ["open"]).filter((l) => l.symbol === "BTCUSDT").map((l) => l.cid);
  assert.deepEqual(events(out, ["chain_switched", "chain_gap", "close"]).filter((l) => l.symbol === "BTCUSDT" && l.cause !== "stopped").map((l) => [l.event, l.from ?? l.cid, l.to ?? l.cause ?? l.reason]),
    [["chain_switched", cids[0], cids[1]], ["close", cids[0], "renewed"], ["close", cids[1], "closed"], ["chain_switched", cids[1], cids[2]], ["chain_gap", cids[2], "gap"]]);
});

// killer: scripts/record-binance-l2.mjs:369 CONST "if (rest.stopped) stop(" -> "if (false) stop("
test("l2_record_rest_stop_ends_all", async () => {
  // Plan section 4.3: a 451 stops the REST client, and the loop with it, named after its clean stop; the run marked the tail of the
  // output it resumed first (Q-C1-4).
  const m = await command(), c = await crashed(m, 1), out = c.real, h = host(at(0, 10, 0), (p, now) => (p.startsWith("/api/v3/exchangeInfo") ? [451, {}] : place(0)(p, now)));
  assert.equal(typeof m.calendar, "function", "the loop is absent");
  let settled: unknown = "running";
  m.run(argv(out), h.io).then((r) => { settled = r; }, (e: unknown) => { settled = e; });
  await h.until(at(0, 10, 0, 1));
  h.stop();
  await h.until(at(0, 10, 0, 2));
  assert.deepEqual([(settled as { code?: string }).code, (settled as { detail?: unknown }).detail], ["rest_stopped", { task: "exchangeInfo", code: "restricted_location" }]);
  assert.equal(c.tails().length, 1, "the tail marked at the start");
  assert.deepEqual(events(out, ["schedule_failed", "stopped"]).map((l) => [l.event, l.code ?? l.cause]).slice(0, 1).concat(events(out, ["stopped"]).map((l) => [l.event, l.cause])), [["schedule_failed", "restricted_location"], ["stopped", "rest_stopped"]]);
});

// killer: scripts/record-binance-l2.mjs:333 CONST "Date.now() - statSync(lock).mtimeMs < SEAL_TIMEOUT_MS" -> "false"
test("l2_record_seal_locked_per_day", async () => {
  // n-4 of the G2 of c5-bis-a: a day whose lock is younger than SEAL_TIMEOUT_MS (another run's seal, or its orphan child) waits for the
  // next hour; a day without its scale (this run started after it) fails, named, and leaves no lock.
  const m = await command(), out = fresh(), lock = (s: string): string => join(out, "days", s, `.${D}.seal.lock`), h = host(at(1, 0, 2), place(0));
  assert.equal(typeof m.calendar, "function", "the loop is absent");
  mkdirSync(dirname(lock("BTCUSDT")), { recursive: true });
  writeFileSync(lock("BTCUSDT"), "1");
  writeFileSync(join(out, "journal.jsonl"), JSON.stringify(START_LINE) + LF);
  const run = m.run(argv(out), h.io);
  await h.until(at(1, 0, 3, 1));
  h.stop();
  await run;
  assert.deepEqual([events(out, ["seal_failed", "day_sealed"]).map((l) => [l.symbol, l.event, l.stop]), L.SYMBOLS.map((s) => existsSync(lock(s)))],
    [[["BNBUSDT", "seal_failed", "no_scale"], ["ETHUSDT", "seal_failed", "no_scale"], ["SOLUSDT", "seal_failed", "no_scale"]], [true, false, false, false]]);
});

// ---- fold of the G2 of c5-bis-b ----
/** The rejections that fn leaves unhandled, the process's own listeners (the runner's) set aside meanwhile. */
async function strays(fn: () => Promise<void>): Promise<unknown[]> {
  const caught: unknown[] = [], keep = process.listeners("unhandledRejection"), on = (e: unknown): void => { caught.push(e); };
  process.removeAllListeners("unhandledRejection");
  process.on("unhandledRejection", on);
  try { await fn(); } finally { process.off("unhandledRejection", on); for (const l of keep) process.on("unhandledRejection", l); }
  return caught;
}
/** A run whose end the test reads as it goes: "running" until it settles. */
function watch(run: Promise<unknown>): { settled: unknown } { const w: { settled: unknown } = { settled: "running" }; run.then((r) => { w.settled = r; }, (e: unknown) => { w.settled = e; }); return w; }
/** Until w settles (a loaded host: the fetches and the clean stop take real turns), 200 steps of 1 us of the host's clock at most. */
const waited = async (h: { until: (us: number) => Promise<void>; io: RecordM.RecorderIo }, w: { settled: unknown }): Promise<void> => { for (let i = 0; i < 200 && w.settled === "running"; i += 1) await h.until(h.io.wallUs!() + 1); };
const signalled = (out: string): unknown => ({ mode: "record", out, stopped: "signal", links_closed: true, seal_done: true });

// killer: scripts/record-binance-l2.mjs:344 CONST "catch (e) { failed(\"seal\", e, symbol, { day }); }" -> "catch (e) { throw e; }"
test("l2_record_seal_throw_named", async () => {
  // B-1 of the G2 of c5-bis-b: a throw in the seals is journaled schedule_failed, never left an unhandled rejection; the loop goes on, and its
  // clean stop writes the stopped line. r-1 of its delta: the throw of one symbol (its lock a directory dated 1970: EISDIR) is named with its
  // symbol and day, and starves no other symbol.
  const m = await command(), out = fresh(), h = host(at(0, 23, 20), place(0));
  assert.equal(typeof m.calendar, "function", "the loop is absent");
  let w = { settled: "running" as unknown };
  const caught = await strays(async () => {
    w = watch(m.run(argv(out), h.io));
    await h.until(at(0, 23, 30));
    const lock = join(out, "days", "BTCUSDT", `.${D}.seal.lock`);
    mkdirSync(lock, { recursive: true }); fs.utimesSync(lock, new Date(0), new Date(0));
    await h.until(at(1, 0, 3, 5));
    h.stop();
    await h.until(at(1, 0, 3, 6)).then(() => waited(h, w));
  });
  assert.deepEqual([caught.map((e) => (e as { code?: string }).code), events(out, ["schedule_failed", "day_sealed", "stopped"]).map((l) => [l.event, l.symbol, l.day ?? null, l.code ?? l.cause ?? null])],
    [[], [["day_sealed", "BNBUSDT", D, null], ["schedule_failed", "BTCUSDT", D, "EISDIR"], ["day_sealed", "ETHUSDT", D, null], ["day_sealed", "SOLUSDT", D, null], ["stopped", "ALL", null, "signal"]]]);
  assert.deepEqual(w.settled, signalled(out));
});

// killer: scripts/record-binance-l2.mjs:303 CONST "proc?.on(\"unhandledRejection\", stray);" -> ""
test("l2_record_unhandled_rejection_stops", async () => {
  // B-1: the command's net: an unhandled rejection anywhere in the process is journaled and ends the loop, named, after its clean stop;
  // its listener gone once the run ends.
  const m = await command(), out = fresh(), proc = new EventEmitter(), h = host(at(0, 10, 0), place(0));
  const w = watch(m.run(argv(out), { ...h.io, process: proc }));
  await h.until(at(0, 10, 0, 1));
  proc.emit("unhandledRejection", Object.assign(new Error("lost"), { code: "EIO" }), Promise.resolve());
  await h.until(at(0, 10, 0, 2)).then(() => waited(h, w));
  const e = w.settled as { code?: string; detail?: unknown };
  assert.deepEqual([e.code, e.detail, proc.listenerCount("unhandledRejection")], ["unhandled_rejection", { code: "EIO" }, 0]);
  assert.deepEqual(events(out, ["unhandled_rejection", "stopped"]).map((l) => [l.event, l.code ?? l.cause]), [["unhandled_rejection", "EIO"], ["stopped", "unhandled_rejection"]]);
});

// killer: scripts/record-binance-l2.mjs:305 CONST "if (rest.stopped) finish(" -> "if (false) finish("
test("l2_record_snapshot_451_ends_all", async () => {
  // B-2 of the G2 of c5-bis-b (plan section 4.3, FM-1.2): a 451 on a book's snapshot stops everything at once, its cause kept.
  const m = await command(), out = fresh(), h = host(at(0, 10, 0), (p, now) => (p.startsWith("/api/v3/depth") ? [451, {}] : place(0)(p, now)));
  const w = watch(m.run(argv(out), h.io));
  await h.until(at(0, 10, 0, 1));
  h.send(depth(7, 8));
  await h.until(at(0, 10, 0, 2)).then(() => waited(h, w));
  const e = w.settled as { code?: string; detail?: unknown };
  assert.deepEqual([e.code, e.detail, events(out, ["stopped"]).map((l) => l.cause)], ["rest_stopped", { task: "snapshot", symbol: "BTCUSDT", code: "restricted_location" }, ["rest_stopped"]]);
});

// killer: scripts/record-binance-l2.mjs:387 CONST "await Promise.race([fire(e), ended]);" -> "await fire(e);"
test("l2_record_stop_during_start", async () => {
  // m-1 (a) of the G2 of c5-bis-b (Q-8 of a3): a place silent at the start (its requests unanswered) holds no clean stop: the signal ends
  // the run at once, no link opened. r-2 of its delta: a late answer writes no line after the stopped line (its killer by hand, G7).
  const m = await command(), out = fresh(), h = host(at(0, 10, 0), place(0)), answer = h.io.fetch!, late: (() => void)[] = [];
  h.io.fetch = (url, i) => { h.fetched.push([h.io.wallUs!(), new URL(url).pathname]); return new Promise((r) => { late.push(() => { r(answer(url, i)); }); }); };
  const w = watch(m.run(argv(out), h.io));
  await h.until(at(0, 10, 0, 1));
  h.stop();
  await h.until(at(0, 10, 0, 2)).then(() => waited(h, w));
  assert.deepEqual([w.settled, h.fetched.map(([, p]) => p), h.socks.length], [signalled(out), [TIME], 0]);
  late[0]?.(); await h.until(at(0, 10, 0, 3));
  assert.deepEqual([(journal(out) as Line[]).at(-1)?.event, events(out, ["clock_offset"]).length], ["stopped", 0]);
});

// killer: scripts/record-binance-l2.mjs:432 CONST "process.exit(code)" -> "undefined"
test("l2_command_exit_bounded", () => {
  // m-1 (b): once main resolves, the command line leaves within EXIT_GRACE_MS though a handle lingers (a socket whose peer never answers
  // its CLOSE): leave() sets the exit code, then exits.
  const t0 = Date.now(), url = new URL("../scripts/record-binance-l2.mjs", import.meta.url).href;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", `const m = await import(${JSON.stringify(url)}); setInterval(() => undefined, 1_000); m.leave(3);`], { timeout: 20_000, env: {} });
  assert.deepEqual([r.status, r.signal, Date.now() - t0 < 15_000], [3, null, true]);
});

// killer: scripts/record-binance-l2.mjs:389 CONST "if (!finished) links = " -> "if (finished) links = "
test("l2_record_links_after_start", async () => {
  // m-3 of the G2 of c5-bis-b (G0 point 2): the links open once the place time and the four exchangeInfo are read, the weight limit
  // known before any snapshot.
  const m = await command(), out = fresh(), h = host(at(0, 10, 0), place(0)), seen: number[] = [], f = h.io.fetch!;
  h.io.fetch = (url, init) => { seen.push(h.socks.length); return f(url, init); };
  const run = m.run(argv(out), h.io);
  await h.until(at(0, 10, 0, 1));
  const opened = h.socks.length;
  h.stop();
  await run;
  assert.deepEqual([seen, opened], [[0, 0, 0, 0, 0], 5]);
});

// killer: scripts/record-binance-l2.mjs:378 CONST "now - e.at > OVERDUE_US" -> "false"
test("l2_record_overdue_skipped", async () => {
  // m-2 of the G2 of c5-bis-b: the host clock stepped 20 min forward at 23:52, its timers unmoved: exchangeInfo and the anchors, overdue
  // past OVERDUE_US, are skipped, named; no anchor of D written from a depth of D + 1 (the day left to the replay).
  const m = await command(), out = fresh(), h = host(at(0, 23, 50), place(0));
  const run = m.run(argv(out), h.io);
  await h.until(at(0, 23, 52));
  h.jump(at(1, 0, 12));
  await h.until(at(1, 0, 12, 1));
  h.stop();
  await run;
  assert.deepEqual([h.fetched.filter(([, p]) => p.startsWith("/api/v3/depth")), existsSync(join(dayDir(out), "anchor-close.json"))], [[], false]);
  assert.deepEqual(events(out, ["event_skipped"]).map((l) => [l.task, l.symbol, l.late_us]), [...L.SYMBOLS.map((s, r) => ["exchangeInfo", s, at(1, 0, 12) - at(0, 23, 58, 10 * r)]),
    ...L.SYMBOLS.map((s, r) => ["anchor", s, at(1, 0, 12) - at(0, 23, 59, 10 + 10 * r)])]);
});

// killer: scripts/record-binance-l2.mjs:316 CONST "JSON.parse(text)?.data?.U <= book.id + 1" -> "true"
test("l2_record_switch_waits_to_join", async () => {
  // m-4 of the G2 of c5-bis-b (Q-A4-3): a renewal's new connection ahead of the book (U > id + 1) does not take it; once the book reaches
  // it, it does, with no gap.
  const m = await command(), out = fresh(), h = host(at(0, 10, 0), place(0));
  const run = m.run(argv(out), h.io);
  await h.until(at(0, 10, 0, 1));
  h.send(depth(7, 8));
  await h.until(at(0, 10, 0, 2));
  const a = h.live();
  h.send(JSON.stringify({ e: "serverShutdown" }));
  await h.until(at(0, 10, 0, 3));
  h.send(depth(10, 10));
  a.onmessage!({ data: depth(9, 10) });
  h.send(depth(11, 11));
  await h.until(at(0, 10, 0, 4));
  h.stop();
  await run;
  const cids = events(out, ["open"]).filter((l) => l.symbol === "BTCUSDT").map((l) => l.cid);
  assert.deepEqual(events(out, ["chain_switched", "chain_gap"]).filter((l) => l.symbol === "BTCUSDT").map((l) => [l.event, l.from ?? l.cid, l.to ?? l.reason]), [["chain_switched", cids[0], cids[1]]]);
});

// killer: scripts/record-binance-l2.mjs:352 CONST "offset = e.offset_us ?? offset" -> "offset = e.offset_us"
test("l2_record_unsafe_time_keeps_offset", async () => {
  // m-4 of the G2 of c5-bis-b (point 13): a place time read unsafe (offset_us null) keeps the last offset: exchangeInfo still leaves 5 s early.
  const m = await command(), out = fresh(), h = host(at(0, 23, 20), (p, now) => (p === TIME && now >= at(0, 23, 30) ? [200, { serverTime: "late" }] : place(5 * S)(p, now)));
  const run = m.run(argv(out), h.io);
  await h.until(at(0, 23, 58, 40));
  h.stop();
  await run;
  assert.deepEqual([events(out, ["clock_offset"]).map((l) => l.offset_us), h.fetched.filter(([t, p]) => t > at(0, 23, 30) && p.startsWith("/api/v3/exchangeInfo")).map(([t]) => t)],
    [[5 * S, null], L.SYMBOLS.map((_, r) => at(0, 23, 57, 55 + 10 * r))]);
});

// killer: scripts/record-binance-l2.mjs:340 SDL "        if (abort.signal.aborted) return; // n-1: a seal aborted by the clean stop writes nothing after the stopped line (its seal_done false)" -> ""
test("l2_record_stopped_line_last", async () => {
  // n-1 of the G2 of c5-bis-b: a seal aborted by the clean stop (its child killed: seal_aborted) writes nothing after the stopped line.
  const m = await command(), out = fresh(), h = host(at(0, 23, 59, 50), place(0), (_, o) => new Promise((r) => {
    o.signal.addEventListener("abort", () => { r({ sealed: false, failed: { stop: "seal_aborted" } } as unknown as SealM.ApartResult); });
  }));
  const run = m.run(argv(out), h.io);
  await h.until(at(1, 0, 3, 10));
  h.stop();
  assert.equal(await settles(run, () => h.until(h.io.wallUs!() + S), 600), true, "the clean stop ends"); // never awaited at a fixed instant
  await h.until(h.io.wallUs!() + S);
  assert.deepEqual([(journal(out) as Line[]).at(-1)?.event, events(out, ["seal_failed"]).length], ["stopped", 0]);
});

// killer: test/helpers/host-clock.ts:8 CONST "i < steps && !done" -> "false"
test("l2_record_stop_bound_armed_late", async () => {
  // The hang of the test above under load (MONARK's Windows oracle): a disk that no longer answers from the hour's cut, the links' bound
  // fires at 00:03:40, the seal's is armed then, due at 00:04:10: at 00:03:41 the run still waits; driven, it ends at 00:04:10.
  const m = await command(), out = fresh(), h = host(at(0, 23, 59, 50), place(0), (_, o) => new Promise((r) => { o.signal.addEventListener("abort", () => { r({ sealed: false } as SealM.ApartResult); }); })), open = h.io.open!;
  h.io.open = (path) => (h.io.wallUs!() < at(1, 0, 0) ? open(path) : new Promise(() => undefined));
  const run = m.run(argv(out), h.io);
  await h.until(at(1, 0, 3, 10));
  h.stop();
  await h.until(at(1, 0, 3, 41));
  assert.deepEqual([await settles(run, () => Promise.resolve(), 1), await settles(run, () => h.until(h.io.wallUs!() + S), 600), (journal(out) as Line[]).at(-1)],
    [false, true, { host_us: at(1, 0, 4, 10), mono_ns: String(at(1, 0, 4, 10) * 1000), symbol: "ALL", cid: null, event: "stopped", cause: "signal", links_closed: false, seal_done: false }]);
});
