#!/usr/bin/env node
// scripts/record-binance-l2.mjs -- the command of the L2 recorder of Binance spot books, trades and liquidations (lot P1-c4 of
// ADR-L2-CAPTURE-1, 2026-10-05; plan docs/G0-partie-l2-p1.md section 3 points 16, 17, 22 and 23; lot plan docs/G0-lot-l2-p1-c4.md).
// Node 24, zero dependencies. Discipline (model: scripts/record-binance-klines.mjs l.1-30): the terms were read before any call
// (docs/marche/FAITS-L2-ACCESS-1-2026-10-03.md and its successors); public streams and REST alone, no key, no account, no cost; the
// frames are NOT redistributable and never enter a repository (an output under any git tree is refused); RECHERCHES reviews this recorder
// before its first call; the hosts are the closed lists of scripts/l2/links.mjs and scripts/l2/rest.mjs, nothing else is ever opened.
//   record: node scripts/record-binance-l2.mjs --out <dir> --quota-bytes <n>
//   replay: node scripts/record-binance-l2.mjs --from-raw <dir> --symbol <SYMBOL> --day <YYYY-MM-DD> --out <dir>
// Closed flags, each once and with a value; a flag of the other mode is a usage stop. Guards, in this order, before anything is opened:
// the environment of a recording is a closed list of names (ADMITTED_ENV, Q-P1-10: win32 TEMP, TMP and SYSTEMROOT, provisional; empty
// elsewhere until it is measured under the unit in P3, so a launch under a unit, which sets its own variables, stops), values never
// printed; a proxy variable or a node flag in execArgv stops (proxy_refused, SERIES-PROXY-GUARD-1), any other name too (env_refused,
// SERIES-ENV-ALLOWLIST-1); a --require of NODE_OPTIONS runs before any guard: the guard closes the accident, not a code already run;
// --out lies under no git tree, as given and as resolved on disk, no dangling link on its path, and is absent, empty, or an L2 output to
// resume (its entries of OUT_ENTRIES alone, each of its type, journal.jsonl among them; a link anywhere under it stops); quota (Q-11, point 16): the bytes of --out, counted at the start and on
// each check, journal a quota_alarm once at ALARM_PCT % of --quota-bytes and stop at STOP_PCT % (quota_stop); at the start the free
// space of the file system holds the rest of the quota, else disk_short. The loop (P1-c5-bis) and the replay (P1-c6) are not built: after
// its guards the command stops, named (not_built). Test seam (point 22): run(argv, io) and main(argv, io) take the clocks, the
// environment, execArgv, the reading of the free space and print from their caller, never from the command line nor the environment.
// Exit 1 on a named stop (closed list STOPS), 2 on usage. The command runs when node starts this very file, compared by real paths
// (MAIN-GUARD-REALPATH-1). adopt() (P1-c5) takes --out for the loop. The agent never commits (R-20).
import { closeSync, constants, existsSync, fstatSync, lstatSync, mkdirSync, opendirSync, openSync, readSync, realpathSync, statfsSync, statSync, writeSync } from "node:fs";
import { dirname, join, resolve, win32 } from "node:path";
import { fileURLToPath } from "node:url";
import { SYMBOLS } from "./l2/links.mjs";

export const STOPS = Object.freeze(["usage", "bad_quota", "bad_symbol", "bad_day", "proxy_refused", "env_refused", "out_not_l2",
  "out_in_git_tree", "out_too_deep", "quota_stop", "disk_short", "not_built"]);
export const ADMITTED_ENV = Object.freeze({ win32: Object.freeze(["SYSTEMROOT", "TEMP", "TMP"]) }); // Q-P1-10; names in upper case
export const OUT_ENTRIES = Object.freeze(["conn", "days", "journal.jsonl", "requests.jsonl", "rest"]); // what P1-a2 to P1-c3 write in --out
const OUT_DIRS = Object.freeze(["conn", "days", "rest"]); // the directories of OUT_ENTRIES; the others are files
export const ALARM_PCT = 70; // Q-11 of the ADR: alarm at 70 % of the quota, journaled once,
export const STOP_PCT = 85; // a named stop at 85 % (thresholds of the ADR, quota fixed on M-1: L2-DISK-QUOTA-1)
export const QUOTA_MAX = 2 ** 46; // 64 TiB: 100 x a quota stays a safe integer
export const WALK_DEPTH = 3; // directories below --out: days/<SYMBOL>/<day>; one Dir handle open per level at most
const APPEND = constants.O_WRONLY | constants.O_CREAT | constants.O_APPEND | (constants.O_NOFOLLOW ?? 0);
const PROXY_ENV = /^(NODE_OPTIONS|NODE_USE_ENV_PROXY)$|_PROXY$/i, LF = String.fromCharCode(10), SCRIPT = fileURLToPath(import.meta.url);
const FLAGS = Object.freeze({ record: ["--out", "--quota-bytes"], replay: ["--from-raw", "--symbol", "--day", "--out"] });

/** A named stop: `code` is one of STOPS, `detail` what was seen (names, counts, paths; never a value of the environment). */
export class RecorderStop extends Error {
  constructor(code, detail = {}) {
    super(`${code} ${JSON.stringify(detail)}`);
    this.name = "RecorderStop";
    this.code = code;
    this.detail = detail;
  }
}
const stop = (code, detail) => { throw new RecorderStop(code, detail); };

/** The closed command line: --from-raw selects the replay; each flag of its mode once, with a value, and none of the other mode. */
export function parseArgs(argv) {
  const a = new Map();
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i], value = argv[i + 1];
    if (!FLAGS.replay.includes(flag) && !FLAGS.record.includes(flag)) stop("usage", { flag });
    if (value === undefined || value === "" || value.startsWith("--") || a.has(flag)) stop("usage", { flag });
    a.set(flag, value);
  }
  const mode = a.has("--from-raw") ? "replay" : "record", absent = FLAGS[mode].filter((f) => !a.has(f));
  const foreign = [...a.keys()].filter((f) => !FLAGS[mode].includes(f));
  if (absent.length > 0 || foreign.length > 0) stop("usage", { mode, absent, foreign });
  if (mode === "replay") {
    const symbol = a.get("--symbol"), day = a.get("--day"), ms = Date.parse(`${day}T00:00:00Z`);
    if (!SYMBOLS.includes(symbol)) stop("bad_symbol", { symbol, allowed: SYMBOLS });
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(day) || !Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== day) stop("bad_day", { day });
    return { mode, fromRaw: resolve(a.get("--from-raw")), symbol, day, out: resolve(a.get("--out")) };
  }
  const text = a.get("--quota-bytes"), quota = Number(text);
  if (!/^[1-9][0-9]*$/.test(text) || quota > QUOTA_MAX) stop("bad_quota", { quota_bytes: text, max: QUOTA_MAX });
  return { mode, out: resolve(a.get("--out")), quota };
}

/** The environment of a recording (SERIES-ENV-ALLOWLIST-1, Q-P1-10): any node flag in execArgv, or any name outside the list of the
 *  platform, stops; proxy_refused when a proxy variable or a flag is there, else env_refused; the stop names the variables and counts the
 *  flags, never a value. On win32 (names in any ASCII case: a regex without u never folds U+017F into S) each admitted value is an
 *  absolute path, else env_refused. */
export function guardEnv(env, execArgv, platform = process.platform) {
  const admitted = new RegExp(`^(${ADMITTED_ENV[platform]?.join("|") ?? "(?!)"})$`, "i");
  const names = Object.keys(env).filter((name) => !admitted.test(name)).sort();
  const detail = { variables: names, execArgv_length: execArgv.length };
  if (execArgv.length > 0 || names.some((name) => PROXY_ENV.test(name))) stop("proxy_refused", detail);
  if (names.length > 0) stop("env_refused", detail);
  const unformed = Object.keys(env).filter((name) => !win32.isAbsolute(String(env[name]))).sort();
  if (unformed.length > 0) stop("env_refused", { variables: unformed, why: "values outside their closed form" });
}

/** --out: no ancestor, as given and as resolved on disk, holds .git (directory or file); the walk up ends at a root, even an absent one
 *  (SERIES-ABSENT-ROOT-TEST-1: exists and real are the caller's for that test alone), and meets no dangling link. Then absent or empty
 *  (false: a new output), or an L2 output to resume (true): its entries all in OUT_ENTRIES, each of its type (Dirent: a link is neither),
 *  journal.jsonl among them, read one at a time (a foreign one stops). */
export function guardOut(out, { exists = existsSync, real = realpathSync.native } = {}) {
  let near = out;
  for (; !exists(near) && dirname(near) !== near; near = dirname(near)) {
    if (linked(near)) stop("out_not_l2", { out, entry: near, why: "dangling link" });
  }
  for (const top of new Set([out, exists(near) ? real(near) : near])) {
    for (let dir = top; ; dir = dirname(dir)) {
      if (exists(join(dir, ".git"))) stop("out_in_git_tree", { out, git: join(dir, ".git") });
      if (dirname(dir) === dir) break;
    }
  }
  if (!exists(out)) return exists(near) && !statSync(near).isDirectory() ? stop("out_not_l2", { out, entry: near, why: "not a directory" }) : false; // m-8
  if (!statSync(out).isDirectory()) stop("out_not_l2", { out, why: "not a directory" });
  const d = opendirSync(out);
  let journal = false, count = 0;
  try {
    for (let e = d.readSync(); e !== null; e = d.readSync(), count += 1) {
      if (!OUT_ENTRIES.includes(e.name)) stop("out_not_l2", { out, entry: e.name });
      const typed = OUT_DIRS.includes(e.name) ? e.isDirectory() : e.isFile();
      if (!typed) stop("out_not_l2", { out, entry: e.name, why: "not of its type" });
      journal ||= e.name === "journal.jsonl";
    }
  } finally { d.closeSync(); }
  if (count > 0 && !journal) stop("out_not_l2", { out, why: "no journal.jsonl" });
  return count > 0;
}
const linked = (path) => { try { return lstatSync(path).isSymbolicLink(); } catch { return false; } };

/** The bytes of the files under `dir`, one entry at a time; an entry neither a file nor a directory (a link, by its Dirent type, never
 *  followed) stops (out_not_l2); a directory deeper than WALK_DEPTH below --out stops (out_too_deep), so at most WALK_DEPTH + 1 Dir
 *  handles are open. Absent: 0. */
export function bytesUnder(dir, depth = 0) {
  if (!existsSync(dir)) return 0;
  const d = opendirSync(dir);
  let sum = 0;
  try {
    for (let e = d.readSync(); e !== null; e = d.readSync()) {
      const path = join(dir, e.name);
      if (!e.isFile() && !e.isDirectory()) stop("out_not_l2", { entry: path, why: "neither a file nor a directory" });
      if (e.isDirectory() && depth === WALK_DEPTH) stop("out_too_deep", { dir: path, depth: WALK_DEPTH });
      sum += e.isDirectory() ? bytesUnder(path, depth + 1) : lstatSync(path).size;
    }
  } finally { d.closeSync(); }
  return sum;
}

/** The quota of --out (point 16): check() counts its bytes, stops at STOP_PCT % of the quota (quota_stop), journals one quota_alarm line
 *  at ALARM_PCT % (once per process), and returns the bytes counted. io: wallUs (host wall clock, us), monoNs (bigint). */
export function createQuota({ out, quota }, io) {
  let alarmed = false;
  return function check() {
    const used = bytesUnder(out);
    if (100 * used >= STOP_PCT * quota) stop("quota_stop", { used, quota, pct: STOP_PCT });
    if (100 * used >= ALARM_PCT * quota && !alarmed) {
      alarmed = true;
      const line = { host_us: io.wallUs(), mono_ns: String(io.monoNs()), symbol: "ALL", cid: null, event: "quota_alarm", used, quota };
      appendLine(join(out, "journal.jsonl"), line); // no link followed (win32: no O_NOFOLLOW), one link alone (P1-c5)
    }
    return used;
  };
}

/** The free bytes of the file system that holds `path` (its nearest existing ancestor), for an unprivileged writer. */
export function freeBytes(path) {
  let p = path;
  while (!existsSync(p) && dirname(p) !== p) p = dirname(p);
  const s = statfsSync(p);
  return s.bavail * s.bsize;
}

/** The guards of a run, in order, before anything is opened: arguments, environment (recording), --out, quota and free space (recording).
 *  Returns the plan: the arguments, resume, and for a recording the bytes used, the free bytes and the quota check. */
export function prepare(argv, io = {}) {
  const args = parseArgs(argv);
  if (args.mode === "record") guardEnv(io.env ?? process.env, io.execArgv ?? process.execArgv);
  const resume = guardOut(args.out);
  if (args.mode === "replay") return { ...args, resume };
  const clocks = { wallUs: io.wallUs ?? (() => Date.now() * 1000), monoNs: io.monoNs ?? process.hrtime.bigint };
  const check = createQuota({ out: args.out, quota: args.quota }, clocks), used = check(), free = (io.freeBytes ?? freeBytes)(args.out);
  if (free < args.quota - used) stop("disk_short", { free, quota: args.quota, used });
  return { ...args, resume, used, free, check };
}

/** The recorder that the start line of its journal names (n-5 of the G2 of c4); bytes of journal.jsonl read for its first line. */
export const RECORDER = "scripts/record-binance-l2.mjs";
const HEAD = 4096;

/** One JSON line appended to a file of --out by one write: never through a link (O_NOFOLLOW: out_not_l2, not ELOOP, n-8 of the delta G2
 *  of c4), to a file of one link alone (fstat nlink 1, else out_not_l2, nothing written: n-5bis). */
export function appendLine(path, line) {
  let fd = null;
  try {
    fd = openSync(path, APPEND, 0o644);
    if (fstatSync(fd).nlink !== 1) stop("out_not_l2", { entry: path, why: "hard link" });
    writeSync(fd, JSON.stringify(line) + LF);
  } catch (e) {
    if (e.code === "ELOOP") stop("out_not_l2", { entry: path, why: "a link" });
    throw e;
  } finally { if (fd !== null) closeSync(fd); }
}

/** A resumed --out is this recorder's: the first line of its journal.jsonl, read in its first HEAD bytes, is a start of RECORDER (n-5). */
function ownJournal(out) {
  const fd = openSync(join(out, "journal.jsonl"), constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0)), head = Buffer.alloc(HEAD);
  let first = null;
  try { first = JSON.parse(head.toString("utf8", 0, readSync(fd, head, 0, HEAD, 0)).split(LF)[0]); } catch { first = null; } finally { closeSync(fd); }
  if (first?.event !== "start" || first.recorder !== RECORDER) stop("out_not_l2", { out, why: "journal.jsonl not of this recorder" });
}

/** A recording takes --out once prepare passed, before anything is opened: a resumed output is this recorder's (n-5); --out is made, its
 *  real path pinned (n-7 of the delta G2 of c4), the start line journaled (Q-C1-10). check(), at the pace of the loop: the real path
 *  unchanged, else out_not_l2; the guards of --out again, no .git above it as given and as resolved (n-2); journal.jsonl and requests.jsonl of one link each
 *  (n-5bis); then the quota (its bytes). io: wallUs (host wall clock, us), monoNs (bigint). */
export function adopt(plan, io) {
  if (plan.resume) ownJournal(plan.out);
  mkdirSync(plan.out, { recursive: true });
  const real = realpathSync.native(plan.out);
  appendLine(join(real, "journal.jsonl"), { host_us: io.wallUs(), mono_ns: String(io.monoNs()), symbol: "ALL", cid: null, event: "start", recorder: RECORDER });
  const check = () => {
    if ((existsSync(plan.out) ? realpathSync.native(plan.out) : null) !== real) stop("out_not_l2", { out: plan.out, real, why: "real path changed" });
    guardOut(plan.out);
    for (const name of ["journal.jsonl", "requests.jsonl"]) if (existsSync(join(real, name)) && lstatSync(join(real, name)).nlink !== 1) stop("out_not_l2", { entry: name, why: "hard link" });
    return plan.check();
  };
  return { real, check };
}

/** One run: its guards, then a named stop until the loop (P1-c5) and the replay (P1-c6) are built. */
export async function run(argv, io = {}) {
  const plan = prepare(argv, io);
  return stop("not_built", { mode: plan.mode, out: plan.out, resume: plan.resume });
}

/** The command line: one JSON line on stdout when a run ends (exit 0), one on stderr on a named stop (1; usage 2). */
export async function main(argv, io = {}) {
  const print = io.print ?? ((line, toStderr) => { (toStderr ? process.stderr : process.stdout).write(line + LF); });
  try {
    print(JSON.stringify({ ok: true, ...(await run(argv, io)) }), false);
    return 0;
  } catch (e) {
    if (!(e instanceof RecorderStop)) throw e;
    print(JSON.stringify({ ok: false, stop: e.code, detail: e.detail }), true);
    return e.code === "usage" ? 2 : 1;
  }
}

/** The command line runs when node starts this very file, through a link too: real paths compared (MAIN-GUARD-REALPATH-1); an import
 *  runs nothing, nor does a node whose argv[1] is absent or names no file (realpathSync throws). */
const started = (argv1) => { try { return realpathSync(argv1) === realpathSync(SCRIPT); } catch { return false; } };
if (started(process.argv[1])) process.exitCode = await main(process.argv.slice(2));
