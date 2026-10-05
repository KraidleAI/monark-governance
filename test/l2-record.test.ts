// test/l2-record.test.ts -- lot L2-P1-c4 (2026-10-05): the command of the L2 recorder, scripts/record-binance-l2.mjs: its closed flags,
// the closed list of the environment and execArgv, --out outside any git tree (an absent root included) and resumed only as an L2
// output, the quota of --out (alarm at 70 %, stop at 85 %, free space at the start) and the start by real paths (plan
// docs/G0-partie-l2-p1.md section 3 points 16, 17, 22, 23; lot plan docs/G0-lot-l2-p1-c4.md). Outputs under the OS temp directory (made
// in before(), removed after), outside any git tree; no network: the command opens nothing in this lot. The module is loaded by a dynamic
// import that each test asserts, so the base, which has no command, reddens by assertion. Each test names, on the line above it, the
// mutation that reddens it.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statfsSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type * as RecordM from "../scripts/record-binance-l2.mjs";
import { keepCause } from "./helpers/keep-cause.ts";
keepCause("test/l2-record.test.ts"); // a crash of this file names its cause on stdout, which the runner keeps (L2-LINKS-FILE-CRASH-1)
let ROOT = "", made = 0;
before(() => { ROOT = mkdtempSync(join(tmpdir(), "l2-record-")); });
after(() => { if (ROOT !== "") rmSync(ROOT, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });
const LF = String.fromCharCode(10), SCRIPTS = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts");
const WIN = { TEMP: "C:\\T", Tmp: "C:\\T", SystemRoot: "C:\\Windows" };

async function load(): Promise<typeof RecordM> {
  const m = await import("../scripts/record-binance-l2.mjs").catch(() => null);
  return m ?? assert.fail("scripts/record-binance-l2.mjs is absent");
}
const fresh = (): string => join(ROOT, `out-${String(++made)}`);
/** What f returns, or the code of what it throws (a RecorderStop, or a file system error). */
const codeOf = (f: () => unknown): unknown => { try { return f(); } catch (e) { return (e as { code?: string }).code ?? String(e); } };
/** The detail of the stop that f throws. */
const detailOf = (f: () => unknown): unknown => { try { f(); return null; } catch (e) { return (e as { detail?: unknown }).detail; } };
/** A file of `size` bytes at `path` under `out`, its folders made. */
const put = (out: string, path: string, size: number): void => {
  mkdirSync(dirname(join(out, path)), { recursive: true });
  writeFileSync(join(out, path), "x".repeat(size));
};
const lines = (out: string): unknown[] => existsSync(join(out, "journal.jsonl"))
  ? readFileSync(join(out, "journal.jsonl"), "utf8").split(LF).filter((l) => l !== "").map((l) => JSON.parse(l) as unknown) : [];
const clocks = { wallUs: (): number => 7, monoNs: (): bigint => 9n };

// killer: scripts/record-binance-l2.mjs:81 CONST "!admitted.test(name)" -> "false"
test("l2_guard_env_allowlist", async () => {
  const m = await load(), env = (e: Record<string, string>, platform: string): unknown => codeOf(() => m.guardEnv(e, [], platform));
  assert.deepEqual(m.ADMITTED_ENV, { win32: ["SYSTEMROOT", "TEMP", "TMP"] }, "Q-P1-10: win32 alone, three names");
  assert.deepEqual([env(WIN, "win32"), env({}, "linux"), env({ TEMP: "/tmp" }, "linux"), env({ INVOCATION_ID: "a1" }, "linux"),
    env({ ...WIN, PATH: "C:\\bin" }, "win32"), env({ NODE_TLS_REJECT_UNAUTHORIZED: "0" }, "win32"), env({ TEMP: "/tmp" }, "darwin")],
  [undefined, undefined, "env_refused", "env_refused", "env_refused", "env_refused", "env_refused"],
  "the win32 names in any case; elsewhere none, so a unit's own variables stop a launch under it");
  const d = detailOf(() => m.guardEnv({ TEMP: "/secret-value", HOME: "/h" }, [], "linux"));
  assert.deepEqual(d, { variables: ["HOME", "TEMP"], execArgv_length: 0 }, "names sorted, never a value");
});

// killer: scripts/record-binance-l2.mjs:83 CONST "execArgv.length > 0" -> "false"
test("l2_guard_proxy_and_flags_refused", async () => {
  const m = await load();
  assert.deepEqual([codeOf(() => m.guardEnv({ ...WIN, HTTPS_PROXY: "http://u:pw@127.0.0.1:9" }, [], "win32")),
    codeOf(() => m.guardEnv({ node_options: "--x" }, [], "win32")), codeOf(() => m.guardEnv({}, ["--expose-gc"], "linux"))],
  ["proxy_refused", "proxy_refused", "proxy_refused"], "a proxy variable, NODE_OPTIONS in any case, a node flag");
  assert.deepEqual(detailOf(() => m.guardEnv({}, ["--expose-gc"], "linux")), { variables: [], execArgv_length: 1 });
  assert.equal(JSON.stringify(detailOf(() => m.guardEnv({ HTTPS_PROXY: "http://u:pw@127.0.0.1:9" }, [], "linux"))).includes("pw"), false);
});

// killer: scripts/record-binance-l2.mjs:85 CONST "!win32.isAbsolute(String(env[name]))" -> "false"
test("l2_guard_env_values_closed_form", async () => {
  const m = await load(), env = (e: Record<string, string>): unknown => codeOf(() => m.guardEnv(e, [], "win32"));
  assert.deepEqual([env({ TEMP: "tmp" }), env({ SYSTEMROOT: "" }), env({ TMP: "\\\\host\\share" }), env(WIN)],
    ["env_refused", "env_refused", undefined, undefined], "each admitted value an absolute path");
  assert.deepEqual(detailOf(() => m.guardEnv({ TEMP: "tmp", TMP: "C:\\T" }, [], "win32")),
    { variables: ["TEMP"], why: "values outside their closed form" });
});

// killer: scripts/record-binance-l2.mjs:100 SDL "if (exists(join(dir, " -> ""
test("l2_guard_out_outside_git", async () => {
  const m = await load(), repo = fresh(), worktree = fresh(), link = fresh(), clean = fresh();
  mkdirSync(join(repo, ".git"), { recursive: true });
  mkdirSync(join(repo, "inner"));
  symlinkSync(join(repo, "inner"), link, "dir"); // out of the repository by its path: only its resolved path holds .git
  mkdirSync(worktree);
  writeFileSync(join(worktree, ".git"), "gitdir: elsewhere");
  assert.deepEqual([join(repo, "deep", "out"), join(worktree, "out"), join(link, "out")].map((out) => codeOf(() => m.guardOut(out))),
    ["out_in_git_tree", "out_in_git_tree", "out_in_git_tree"], "a .git directory, a .git file, a link into a repository");
  assert.deepEqual([existsSync(join(repo, "deep")), existsSync(join(worktree, "out")), readdirSync(join(repo, "inner"))], [false, false, []]);
  assert.equal(m.guardOut(join(clean, "a", "b")), false, "outside any git tree: a new output, nothing made");
  assert.equal(existsSync(clean), false);
});

// killer: scripts/record-binance-l2.mjs:98 CONST "exists(near) ? real(near) : near" -> "real(near)"
test("l2_guard_out_absent_root", async () => {
  // SERIES-ABSENT-ROOT-TEST-1: the walk up ends at a root that does not exist (a win32 drive without a disk), which has no real path; the
  // guard then walks the path as given, reaches that root and admits a new output. Simulated by exists and real of the caller.
  const m = await load(), asked: string[] = [];
  const exists = (p: string): boolean => { asked.push(p); return false; };
  const real = (p: string): string => { throw Object.assign(new Error(`ENOENT ${p}`), { code: "ENOENT" }); };
  assert.equal(codeOf(() => m.guardOut("/l2-absent-root/a/b", { exists, real })), false, "admitted, no real path asked");
  assert.deepEqual(asked.filter((p) => p.endsWith(".git")), ["/l2-absent-root/a/b/.git", "/l2-absent-root/a/.git", "/l2-absent-root/.git",
    "/.git", "/.git"], "every ancestor up to the root looked at, then the root again as resolved");
});

// killer: scripts/record-binance-l2.mjs:110 CONST "!OUT_ENTRIES.includes(e.name)" -> "false"
test("l2_guard_out_resume_l2_only", async () => {
  const m = await load(), [empty, l2, mixed, nojournal, file] = [fresh(), fresh(), fresh(), fresh(), fresh()];
  mkdirSync(empty);
  for (const p of ["journal.jsonl", "requests.jsonl", "conn/c/s.frames", "rest/BTCUSDT/x.json", "days/BTCUSDT/d/index.jsonl"]) put(l2, p, 1);
  for (const p of ["journal.jsonl", "keep.txt"]) put(mixed, p, 1);
  put(nojournal, "conn/c/s.frames", 1);
  writeFileSync(file, "a file");
  assert.deepEqual([empty, l2, mixed, nojournal, file].map((out) => codeOf(() => m.guardOut(out))),
    [false, true, "out_not_l2", "out_not_l2", "out_not_l2"], "empty: new; an L2 output: resumed; anything else refused");
  assert.deepEqual(detailOf(() => m.guardOut(mixed)), { out: mixed, entry: "keep.txt" });
  assert.deepEqual([readdirSync(mixed).sort(), readFileSync(file, "utf8")], [["journal.jsonl", "keep.txt"], "a file"], "nothing touched");
});

// killer: scripts/record-binance-l2.mjs:147 ROR "100 * used >= STOP_PCT * quota" -> "100 * used > STOP_PCT * quota"
test("l2_quota_alarm_and_stop", async () => {
  const m = await load(), [at, below] = [fresh(), fresh()];
  put(at, "conn/c/s.frames", 85);
  put(below, "conn/c/s.frames", 84);
  assert.deepEqual([m.ALARM_PCT, m.STOP_PCT], [70, 85]);
  assert.deepEqual(detailOf(() => m.createQuota({ out: at, quota: 100 }, clocks)()), { used: 85, quota: 100, pct: 85 }, "85 %: stop");
  assert.deepEqual(lines(at), [], "the stop journals nothing");
  assert.equal(m.createQuota({ out: below, quota: 100 }, clocks)(), 84, "one byte under: no stop");
});

// killer: scripts/record-binance-l2.mjs:148 ROR "100 * used >= ALARM_PCT * quota" -> "100 * used > ALARM_PCT * quota"
test("l2_quota_alarm_at_seventy_once", async () => {
  const m = await load(), out = fresh();
  put(out, "conn/c/s.frames", 6_999);
  const check = m.createQuota({ out, quota: 10_000 }, clocks);
  assert.deepEqual([check(), lines(out)], [6_999, []], "one byte under 70 %: no alarm");
  put(out, "conn/c/s.frames", 7_000);
  const line = { host_us: 7, mono_ns: "9", symbol: "ALL", cid: null, event: "quota_alarm", used: 7_000, quota: 10_000 };
  assert.deepEqual([check(), lines(out)], [7_000, [line]], "70 %: one quota_alarm line");
  assert.deepEqual([check(), lines(out)], [7_000 + JSON.stringify(line).length + 1, [line]], "once per process; the journal counts");
});

// killer: scripts/record-binance-l2.mjs:175 ROR "free < args.quota - used" -> "free <= args.quota - used"
test("l2_quota_free_space_at_start", async () => {
  const m = await load(), [fresh1, resumed] = [fresh(), fresh()];
  put(resumed, "journal.jsonl", 100);
  const plan = (out: string, free: number): unknown => codeOf(() => {
    const p = m.prepare(["--out", out, "--quota-bytes", "1000"], { env: {}, execArgv: [], freeBytes: () => free, ...clocks });
    return p.mode === "record" ? [p.resume, p.used, p.free] : p.mode;
  });
  assert.deepEqual([plan(fresh1, 1000), plan(fresh1, 999), plan(resumed, 900), plan(resumed, 899)],
    [[false, 0, 1000], "disk_short", [true, 100, 900], "disk_short"], "the free space holds the rest of the quota, or a stop");
  assert.deepEqual([existsSync(fresh1), readdirSync(resumed)], [false, ["journal.jsonl"]], "nothing written");
});

// killer: scripts/record-binance-l2.mjs:132 ROR "depth === WALK_DEPTH" -> "depth > WALK_DEPTH"
test("l2_quota_walk_depth_bound", async () => {
  const m = await load(), out = fresh();
  put(out, "days/BTCUSDT/2026-10-04/index.jsonl", 10);
  put(out, "conn/spot-BTCUSDT-x/2026100400.frames", 20);
  put(out, "journal.jsonl", 5);
  put(out, "rest/BTCUSDT/x.json", 4);
  assert.equal(m.bytesUnder(out), 39, "the files of the layout, three levels deep");
  mkdirSync(join(out, "days", "BTCUSDT", "2026-10-04", "deeper"));
  assert.deepEqual([m.WALK_DEPTH, codeOf(() => m.bytesUnder(out))], [3, "out_too_deep"], "a fourth level stops");
});

// killer: scripts/record-binance-l2.mjs:63 CONST "foreign.length > 0" -> "false"
test("l2_args_closed_flags", async () => {
  const m = await load(), args = (argv: string[]): unknown => codeOf(() => m.parseArgs(argv));
  assert.deepEqual(args(["--out", "/o", "--quota-bytes", "5"]), { mode: "record", out: "/o", quota: 5 });
  assert.deepEqual(args(["--from-raw", "/r", "--symbol", "BTCUSDT", "--day", "2026-10-04", "--out", "/o"]),
    { mode: "replay", fromRaw: "/r", symbol: "BTCUSDT", day: "2026-10-04", out: "/o" });
  assert.deepEqual([["--out", "/o"], ["--out", "/o", "--quota-bytes", "5", "--symbol", "BTCUSDT"], ["--out", "/o", "--out", "/p"],
    ["--out", "--quota-bytes", "5"], ["--quota", "5", "--out", "/o"], ["--from-raw", "/r", "--out", "/o", "--quota-bytes", "5"]].map(args),
  ["usage", "usage", "usage", "usage", "usage", "usage"], "absent, foreign, twice, without a value, unknown, of the other mode");
  assert.deepEqual(["0", "1.5", "08", "-1", String(2 ** 46 + 1)].map((q) => args(["--out", "/o", "--quota-bytes", q])),
    ["bad_quota", "bad_quota", "bad_quota", "bad_quota", "bad_quota"]);
  const replay = (symbol: string, day: string): unknown => args(["--from-raw", "/r", "--symbol", symbol, "--day", day, "--out", "/o"]);
  assert.deepEqual([replay("btcusdt", "2026-10-04"), replay("BTCUSDT", "2026-02-30"), replay("BTCUSDT", "2026-2-03")],
    ["bad_symbol", "bad_day", "bad_day"]);
});

// killer: scripts/record-binance-l2.mjs:404 CONST "realpathSync(argv1) === realpathSync(SCRIPT)" -> "resolve(argv1) === resolve(SCRIPT)"
test("l2_main_runs_by_real_path", async () => {
  // MAIN-GUARD-REALPATH-1: through a link, node runs the module at its real path while argv[1] keeps the link; a guard on resolved paths
  // ran nothing and exited 0. The scripts folder behind a link, the command run with no argument: the usage stop, exit 2; imported: nothing.
  const m = await load(), link = fresh(), out = fresh(), printed: [string, boolean][] = [];
  symlinkSync(SCRIPTS, link, "dir");
  const child = (args: string[]): [number | null, string, string] => {
    const r = spawnSync(process.execPath, args, { env: {}, encoding: "utf8", timeout: 60_000 });
    return [r.status, r.stdout, r.stderr];
  };
  const usage = JSON.stringify({ ok: false, stop: "usage", detail: { mode: "record", absent: ["--out", "--quota-bytes"], foreign: [] } });
  assert.deepEqual([child([join(link, "record-binance-l2.mjs")]), child(["--input-type=module", "-e",
    `await import(${JSON.stringify(pathToFileURL(join(SCRIPTS, "record-binance-l2.mjs")).href)});`, "no-such-file"])],
  [[2, "", usage + LF], [0, "", ""]], "through the link, the usage stop; imported, nothing");
  const io = { env: {}, execArgv: [], freeBytes: () => 1e9, ...clocks, print: (l: string, e: boolean) => { printed.push([l, e]); } };
  assert.equal(await m.main(["--from-raw", out, "--symbol", "BTCUSDT", "--day", "2026-10-04", "--out", out], io), 1, "after its guards, a named stop: the replay is c6's");
  assert.deepEqual(printed, [[JSON.stringify({ ok: false, stop: "not_built", detail: { mode: "replay", out, resume: false } }), true]]);
});

// killer: scripts/record-binance-l2.mjs:131 CONST "!e.isFile() && !e.isDirectory()" -> "false"
test("l2_guard_out_links_refused", async () => {
  // B-1 of the G2: a link under --out leads into a repository; resumed, c4 appended its quota_alarm there and the quota did not count it.
  const m = await load(), repo = fresh(), [top, deep, file] = [fresh(), fresh(), fresh()];
  put(repo, ".git/HEAD", 1);
  put(repo, "data/tracked.jsonl", 3);
  put(repo, "data/big", 900);
  for (const out of [deep, file]) put(out, "journal.jsonl", 1);
  mkdirSync(top);
  symlinkSync(join(repo, "data", "tracked.jsonl"), join(top, "journal.jsonl"));
  mkdirSync(join(deep, "days"));
  symlinkSync(join(repo, "data"), join(deep, "days", "BTCUSDT"), "dir");
  put(file, "conn/c/x", 1);
  symlinkSync(join(repo, "data", "big"), join(file, "conn", "c", "s.frames"));
  const io = { env: {}, execArgv: [], freeBytes: () => 1e9, ...clocks };
  assert.deepEqual([top, deep, file].map((out) => codeOf(() => m.prepare(["--out", out, "--quota-bytes", "80"], io))),
    ["out_not_l2", "out_not_l2", "out_not_l2"], "a link at any depth, to a file or a directory, stops");
  assert.deepEqual([readFileSync(join(repo, "data", "tracked.jsonl"), "utf8"), readdirSync(join(repo, "data")).sort()],
    ["xxx", ["big", "tracked.jsonl"]], "nothing written in the repository");
});

// killer: scripts/record-binance-l2.mjs:112 CONST "!typed" -> "false"
test("l2_guard_out_entry_types", async () => {
  const m = await load(), [dirJournal, fileConn, linkDays, target] = [fresh(), fresh(), fresh(), fresh()];
  put(dirJournal, "journal.jsonl/x", 1);
  for (const out of [fileConn, linkDays]) put(out, "journal.jsonl", 1);
  put(fileConn, "conn", 1);
  mkdirSync(target);
  symlinkSync(target, join(linkDays, "days"), "dir");
  assert.deepEqual([dirJournal, fileConn, linkDays].map((out) => codeOf(() => m.guardOut(out))), ["out_not_l2", "out_not_l2", "out_not_l2"]);
  assert.deepEqual(detailOf(() => m.guardOut(linkDays)), { out: linkDays, entry: "days", why: "not of its type" }, "the replay's guard too");
});

// killer: scripts/record-binance-l2.mjs:96 CONST "linked(near)" -> "false"
test("l2_guard_out_dangling_link", async () => {
  const m = await load(), dl = fresh(), target = join(fresh(), "new");
  symlinkSync(target, dl, "dir");
  assert.deepEqual([dl, join(dl, "out")].map((out) => codeOf(() => m.guardOut(out))), ["out_not_l2", "out_not_l2"], "never a new output");
  assert.deepEqual([detailOf(() => m.guardOut(dl)), existsSync(target)], [{ out: dl, entry: dl, why: "dangling link" }, false]);
});

// killer: scripts/record-binance-l2.mjs:58 CONST "a.has(flag)" -> "false"
test("l2_args_flag_once", async () => {
  const m = await load();
  assert.deepEqual(detailOf(() => m.parseArgs(["--out", "/o", "--quota-bytes", "5", "--out", "/p"])), { flag: "--out" }, "twice");
  assert.equal(codeOf(() => m.parseArgs(["--out", "--quota-bytes", "--quota-bytes", "5"])), "usage", "a value is never a flag");
});

// killer: scripts/record-binance-l2.mjs:58 CONST "value === \"\"" -> "false"
test("l2_args_empty_value", async () => {
  const m = await load();
  assert.deepEqual(detailOf(() => m.parseArgs(["--out", "", "--quota-bytes", "5"])), { flag: "--out" }, "an empty --out is no output");
});

// killer: scripts/record-binance-l2.mjs:170 CONST "args.mode === \"record\"" -> "true"
test("l2_replay_skips_env_guard", async () => {
  // Q-C4-7: the replay opens nothing; the environment and execArgv are not its guard, --out is.
  const m = await load(), out = fresh(), repo = fresh(), io = { env: { FOO: "1" }, execArgv: ["--x"] };
  mkdirSync(join(repo, ".git"), { recursive: true });
  const replay = (o: string): string[] => ["--from-raw", "r", "--symbol", "BTCUSDT", "--day", "2026-10-04", "--out", o];
  assert.deepEqual(codeOf(() => m.prepare(replay(out), io)),
    { mode: "replay", fromRaw: resolve("r"), symbol: "BTCUSDT", day: "2026-10-04", out, resume: false });
  assert.equal(codeOf(() => m.prepare(replay(join(repo, "o")), io)), "out_in_git_tree");
});

// killer: scripts/record-binance-l2.mjs:161 SDL "while (!existsSync(p) && dirname(p) !== p) p = dirname(p);" -> ""
test("l2_free_bytes_default", async () => {
  const m = await load(), s = statfsSync(ROOT), got = codeOf(() => m.freeBytes(join(ROOT, "absent", "x")));
  assert.equal(typeof got, "number", "an absent output reads its nearest existing ancestor");
  assert.ok(Math.abs((got as number) - s.bavail * s.bsize) <= 64 * s.bsize, "bavail x bsize, a few blocks apart");
});

// killer: scripts/record-binance-l2.mjs:80 CONST "\"i\"" -> "\"iu\""
test("l2_guard_env_names_ascii", async () => {
  const m = await load();
  assert.equal(codeOf(() => m.guardEnv({ "\u017fYSTEMROOT": "C:\\W", ...WIN }, [], "win32")), "env_refused", "U+017F is no S");
});

// killer: scripts/record-binance-l2.mjs:29 CONST "\"disk_short\", " -> ""
test("l2_stops_closed_list", async () => {
  const m = await load(), text = readFileSync(join(SCRIPTS, "record-binance-l2.mjs"), "utf8");
  const raised = [...new Set([...text.matchAll(/stop\("([a-z0-9_]+)"/g)].map((x) => x[1]))].sort();
  assert.deepEqual([...m.STOPS].sort(), raised, "each code raised is in STOPS, and each of STOPS is raised");
});
