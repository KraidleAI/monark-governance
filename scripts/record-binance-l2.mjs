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
// space of the file system holds the rest of the quota, else disk_short. A recording runs the loop (record(), P1-c5-bis-b) until a signal or
// a named stop; the replay (P1-c6) is not built: after its guards it stops, named (not_built). Test seam (point 22): run(argv, io) and main(argv,
// io) take the clocks, timers, fetch, the WebSocket factory, the environment, execArgv, the free space and print from their caller.
// Exit 1 on a named stop (closed list STOPS), 2 on usage. The command runs when node starts this very file, compared by real paths
// (MAIN-GUARD-REALPATH-1). adopt() (P1-c5) takes --out for the loop, markTails() (P1-c5-bis-a) marks tails at its start. The agent never commits (R-20).
import { closeSync, constants, existsSync, fstatSync, lstatSync, mkdirSync, opendirSync, openSync, readdirSync, readFileSync, readSync, realpathSync, rmSync, statfsSync, statSync, writeFileSync, writeSync } from "node:fs";
import { dirname, join, resolve, win32 } from "node:path";
import { fileURLToPath } from "node:url"; import { createBook } from "./l2/book.mjs"; import { dayOf, DAY_US, GRACE_US } from "./l2/day.mjs"; import { SEAL_TIMEOUT_MS, sealApart } from "./l2/seal.mjs";
import { marketUrl, openingGate, openLink, spotUrl, SYMBOLS } from "./l2/links.mjs"; import { checkTail, PERIOD_US, segmentOf } from "./l2/segments.mjs"; import { createRest, exchangeInfoFacts, logTimeOffset, RestStop } from "./l2/rest.mjs";

export const STOPS = Object.freeze(["usage", "bad_quota", "bad_symbol", "bad_day", "proxy_refused", "env_refused", "out_not_l2",
  "out_in_git_tree", "out_too_deep", "quota_stop", "disk_short", "not_built", "rest_stopped", "unhandled_rejection"]);
export const ADMITTED_ENV = Object.freeze({ win32: Object.freeze(["SYSTEMROOT", "TEMP", "TMP"]) }); // Q-P1-10; names in upper case
export const OUT_ENTRIES = Object.freeze(["conn", "days", "journal.jsonl", "requests.jsonl", "rest"]); // what P1-a2 to P1-c3 write in --out
const OUT_DIRS = Object.freeze(["conn", "days", "rest"]); // the directories of OUT_ENTRIES; the others are files
export const ALARM_PCT = 70; // Q-11 of the ADR: alarm at 70 % of the quota, journaled once,
export const STOP_PCT = 85; // a named stop at 85 % (thresholds of the ADR, quota fixed on M-1: L2-DISK-QUOTA-1)
export const QUOTA_MAX = 2 ** 46; // 64 TiB: 100 x a quota stays a safe integer
export const WALK_DEPTH = 3; // directories below --out: days/<SYMBOL>/<day>; one Dir handle open per level at most
const APPEND = constants.O_WRONLY | constants.O_CREAT | constants.O_APPEND | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0);
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
      sum += e.isDirectory() ? bytesUnder(path, depth + 1) : (lstatSync(path, { throwIfNoEntry: false })?.size ?? 0); // vanished: absent (a seal unlinks its temporary)
    }
  } finally { d.closeSync(); }
  return sum;
}

/** The quota of --out (point 16): check() counts its bytes, stops at STOP_PCT % of the quota (quota_stop), journals one quota_alarm line
 *  at ALARM_PCT % (once per process), and returns the bytes counted. io: wallUs (host wall clock, us), monoNs (bigint). check({ at, journal,
 *  pin }): the bytes counted and the alarm written under `at` (adopt: the pinned --out, m-2 of the G2 of c5), `pin` run right before the
 *  append; journal false (prepare) counts and stops, never writes (n-4). */
export function createQuota({ out, quota }, io) {
  let alarmed = false;
  return function check({ at = out, journal = true, pin = () => {} } = {}) {
    const used = bytesUnder(at);
    if (100 * used >= STOP_PCT * quota) stop("quota_stop", { used, quota, pct: STOP_PCT });
    if (100 * used >= ALARM_PCT * quota && !alarmed && journal) {
      alarmed = true;
      const line = { host_us: io.wallUs(), mono_ns: String(io.monoNs()), symbol: "ALL", cid: null, event: "quota_alarm", used, quota };
      pin();
      appendLine(join(at, "journal.jsonl"), line); // no link followed (win32: no O_NOFOLLOW), one link alone (P1-c5)
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
  const check = createQuota({ out: args.out, quota: args.quota }, clocks), used = check({ journal: false }), free = (io.freeBytes ?? freeBytes)(args.out);
  if (free < args.quota - used) stop("disk_short", { free, quota: args.quota, used });
  return { ...args, resume, used, free, check };
}

/** The recorder that the start line of its journal names (n-5 of the G2 of c4); bytes of journal.jsonl read for its first line. */
export const RECORDER = "scripts/record-binance-l2.mjs";
const HEAD = 4096;
const LINUX = process.platform === "linux", RACED = Object.freeze(["ENOENT", "ENOTDIR", "ELOOP"]), CID = /^(spot|market)-[A-Z0-9]+-[0-9]{8}T[0-9]{9}Z$/; // m-3; a <cid> (segments.mjs:28)
const DIR_OPEN = constants.O_RDONLY | (constants.O_DIRECTORY ?? 0) | (constants.O_NOFOLLOW ?? 0); // --out opened once (Linux), never through a link

/** One JSON line appended to a file of --out by one write: never through a link (O_NOFOLLOW: out_not_l2, not ELOOP, n-8 of the delta G2
 *  of c4), to a regular file (O_NONBLOCK: a FIFO never blocks, n-3 of the G2 of c5) of one link alone (fstat nlink 1, else out_not_l2,
 *  nothing written: n-5bis). `entry` names the file in a stop (adopt: its real path, not the descriptor's). */
export function appendLine(path, line, entry = path) {
  let fd = null;
  try {
    fd = openSync(path, APPEND, 0o644);
    if (!fstatSync(fd).isFile()) stop("out_not_l2", { entry, why: "not a regular file" });
    if (fstatSync(fd).nlink !== 1) stop("out_not_l2", { entry, why: "hard link" });
    writeSync(fd, JSON.stringify(line) + LF);
  } catch (e) {
    if (e.code === "ELOOP") stop("out_not_l2", { entry, why: "a link" });
    if (e.code === "ENXIO") stop("out_not_l2", { entry, why: "not a regular file" }); // a FIFO without a reader
    throw e;
  } finally { if (fd !== null) closeSync(fd); }
}

/** A resumed --out is this recorder's: the first line of its journal.jsonl, read in its first HEAD bytes, is a start of RECORDER (n-5). */
function ownJournal(out) {
  const fd = openSync(join(out, "journal.jsonl"), constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0)), head = Buffer.alloc(HEAD);
  let first = null;
  try { first = JSON.parse(head.toString("utf8", 0, readSync(fd, head, 0, HEAD, 0)).split(LF)[0]); } catch { first = null; } finally { closeSync(fd); }
  if (first?.event !== "start" || first.recorder !== RECORDER) stop("out_not_l2", { out, why: "journal.jsonl not of this recorder" });
}

/** A recording takes --out once prepare passed, before anything is opened: the guards of --out again (m-1 of the G2 of c5); a resumed
 *  output is this recorder's (n-5); --out is made, its real path and its directory (dev, ino: n-2) pinned (n-7 of the delta G2 of c4); on
 *  Linux --out is opened once and every walk and write of the command goes through /proc/self/fd/<fd>, the equivalent of openat (m-2,
 *  Q-C5-6), elsewhere through the real path (a window remains, declared); the guards again and the pin right before the start line
 *  (Q-C1-10); then a first check(), which journals the quota alarm (n-4). check(), at the pace of the loop: the pin, else out_not_l2; the
 *  guards of --out again, no .git above it as given and as resolved (n-2); journal.jsonl and requests.jsonl of one link each (n-5bis);
 *  then the quota (its bytes), the pin again right before its append. ENOENT, ENOTDIR or ELOOP met on the way: out_not_l2 (m-3). io:
 *  wallUs (host wall clock, us), monoNs (bigint). */
export function adopt(plan, io) {
  guardOut(plan.out);
  if (plan.resume) ownJournal(plan.out);
  mkdirSync(plan.out, { recursive: true });
  const real = realpathSync.native(plan.out), fd = LINUX ? openSync(real, DIR_OPEN) : null, at = fd === null ? real : `/proc/self/fd/${fd}`;
  const id = fd === null ? statSync(real, { bigint: true }) : fstatSync(fd, { bigint: true });
  const pin = () => {
    if ((existsSync(plan.out) ? realpathSync.native(plan.out) : null) !== real) stop("out_not_l2", { out: plan.out, real, why: "real path changed" });
    const now = statSync(plan.out, { bigint: true });
    if (now.dev !== id.dev || now.ino !== id.ino) stop("out_not_l2", { out: plan.out, real, why: "another directory" });
  };
  const named = (f) => {
    try { return f(); } catch (e) {
      if (RACED.includes(e?.code)) stop("out_not_l2", { out: plan.out, real, why: "real path changed", error: e.code });
      throw e;
    }
  };
  const start = { host_us: io.wallUs(), mono_ns: String(io.monoNs()), symbol: "ALL", cid: null, event: "start", recorder: RECORDER };
  guardOut(plan.out);
  named(() => { pin(); appendLine(join(at, "journal.jsonl"), start, join(real, "journal.jsonl")); });
  const check = () => named(() => {
    pin();
    guardOut(plan.out);
    for (const name of ["journal.jsonl", "requests.jsonl"]) if (existsSync(join(at, name)) && lstatSync(join(at, name)).nlink !== 1) stop("out_not_l2", { entry: name, why: "hard link" });
    return plan.check({ at, pin });
  });
  check();
  return { real, at, check };
}

/** At a start, once adopt passed (Q-C1-4, P1-c5-bis-a): the last segment of each connection that the last run with an open line opened (an
 *  earlier run's were checked at the start after it), unless already marked, gets checkTail of P1-a2; a tail found is journaled, one
 *  tail_marked line (the head of P1-a3, then the fields of the tail), which the seal of c1 reads as the mark. `at`: adopt's root. */
export function markTails(at, io) {
  const lines = existsSync(join(at, "journal.jsonl")) ? readFileSync(join(at, "journal.jsonl"), "utf8").split(LF).map((t) => { try { return JSON.parse(t); } catch { return null; } }) : [];
  let last = new Set(), run = new Set();
  for (const l of lines) if (l?.event === "start") [last, run] = [run.size > 0 ? run : last, new Set()]; else if (l?.event === "open" && CID.test(l.cid)) run.add(l.cid);
  const marked = new Set(lines.filter((l) => l?.event === "tail_marked").map((l) => `${l.cid}/${l.seg}`)), found = [];
  for (const cid of run.size > 0 ? run : last) {
    const seg = existsSync(join(at, "conn", cid)) ? readdirSync(join(at, "conn", cid)).filter((n) => n.endsWith(".frames")).sort().at(-1)?.slice(0, -7) : undefined;
    const tail = seg === undefined || marked.has(`${cid}/${seg}`) ? null : checkTail(at, cid, seg);
    if (tail === null) continue;
    appendLine(join(at, "journal.jsonl"), { host_us: io.wallUs(), mono_ns: String(io.monoNs()), symbol: cid.split("-")[1], cid, event: "tail_marked", ...tail });
    found.push(tail);
  }
  return found;
}

// The loop (P1-c5-bis-b). Its calendar, on the host clock (plan section 3): the cut of every writer on the hour (D24-3); the seals at HH:03,
// once the day's end plus the grace (D24-5) is past and no writer holds a segment of its window, else at the next hour; the place time at
// minute 30 (point 13); check() every 10 min at minute 5 (n-3 of c4: a synchronous walk, about 1 s at 300 000 files, away from the cuts,
// the place time and the anchors); exchangeInfo at 23:58:00 + 10 s x rank and the anchors at 23:59:10 + 10 s x rank, on the host clock
// corrected by the last offset (points 14, 15). Planned renewals (point 6) are the links' own.
const MINUTE_US = 60_000_000;
export const WEIGHT_FLOOR = 4_000; // Q-P1-6, Q-B1-3: the worst minute of D24-2; a REQUEST_WEIGHT limit read below it suspends every resync, named
export const STOP_BOUND_MS = 30_000; // Q-8 of a3: the clean stop waits this long for the writers, then as long for a seal child, which it then kills
export const OVERDUE_US = 20_000_000; // m-2 of the G2 of c5-bis-b: a dated event (exchangeInfo, anchor) later than this, after a clock step, is skipped, named
export const EXIT_GRACE_MS = 5_000; // m-1 (b): once main resolves, the command line exits within this, though a socket lingers
export const SCHEDULE = Object.freeze([["cut", null, PERIOD_US, 0, false], ["seal", null, PERIOD_US, 3 * MINUTE_US, false],
  ["time", null, PERIOD_US, 30 * MINUTE_US, false], ["check", null, 10 * MINUTE_US, 5 * MINUTE_US, false],
  ...SYMBOLS.flatMap((s, r) => [["exchangeInfo", s, DAY_US, (86_280 + 10 * r) * 1_000_000, true], ["anchor", s, DAY_US, (86_350 + 10 * r) * 1_000_000, true]])].map((e) => Object.freeze(e)));

/** The events of SCHEDULE in (fromUs, endUs] of the host clock, in time order; a corrected one when the host clock plus offsetUs reads its phase. */
export function calendar(fromUs, endUs, offsetUs = 0) {
  const events = [];
  for (const [task, symbol, period, phase, corrected] of SCHEDULE) {
    const off = corrected ? offsetUs : 0;
    for (let t = (Math.floor((fromUs + off - phase) / period) + 1) * period + phase - off; t <= endUs; t += period) events.push({ at: t, task, symbol });
  }
  return events.sort((x, y) => x.at - y.at);
}

/** The recording loop once adopt and markTails passed (header): the REST client, the books and the links under adopt's root, the calendar;
 *  on a signal (io.signal) or a named stop, the clean stop: the links stopped, their writers awaited STOP_BOUND_MS at most (Q-8 of a3), the
 *  books and the REST client closed, a seal child awaited as long, then killed; one stopped line. */
export async function record(plan, { at, check }, io) {
  const signal = io.signal ?? signals(), proc = io.process ?? (io.signal === undefined ? process : null); // n-4: before anything opens; the net (B-1): the command line's process
  const { wallUs, monoNs } = io, setTimer = io.setTimer ?? setTimeout, clearTimer = io.clearTimer ?? clearTimeout, env = { ...(io.env ?? process.env) };
  const note = (event, fields, symbol = "ALL") => appendLine(join(at, "journal.jsonl"), { host_us: wallUs(), mono_ns: String(monoNs()), symbol, cid: null, event, ...fields });
  const rest = createRest({ fetch: io.fetch ?? globalThis.fetch, nowUs: wallUs, out: at }), facts = new Map(), due = new Set(), followed = new Map(), abort = new AbortController();
  let offset = 0, low = null, lowUntil = 0, timer = null, sealing = null, finished = false, done = () => {}, links = new Map();
  const ended = new Promise((r) => { done = r; }), finish = (cause) => { if (!finished) { finished = true; done(cause); } }, codeOf = (e) => String(e?.code ?? e?.name ?? "unknown");
  const tell = (event, fields, symbol) => { try { note(event, fields, symbol); } catch { /* the journal failed too: the stop names the cause */ } };
  const failed = (task, e, symbol = "ALL", where = {}) => { tell("schedule_failed", { task, ...where, code: codeOf(e) }, symbol); };
  const stray = (e) => { tell("unhandled_rejection", { code: codeOf(e) }); try { stop("unhandled_rejection", { code: codeOf(e) }); } catch (s) { finish(s); } }; // B-1: the net
  proc?.on("unhandledRejection", stray);
  const snapshot = (kind, symbol) => rest.request(kind, symbol).catch((e) => { // B-2 (plan section 4.3): a 451 on a book's snapshot stops everything at once
    if (rest.stopped) finish(new RecorderStop("rest_stopped", { task: "snapshot", symbol, code: codeOf(e) }));
    throw e;
  });
  const bookRest = { request: (kind, symbol) => (low === null ? snapshot(kind, symbol) : Promise.reject(new RestStop("suspended", { why: "request_weight", limit: low }))),
    get stopped() { return rest.stopped; }, get suspendedUntilUs() { return low === null ? rest.suspendedUntilUs : Math.max(rest.suspendedUntilUs, lowUntil); } };
  const sleep = io.sleep ?? ((ms) => new Promise((r) => { setTimeout(r, ms).unref(); }));
  const books = new Map(SYMBOLS.map((s) => [s, createBook({ symbol: s, rest: bookRest, wallUs, monoNs, sleep, out: at })]));
  const onText = (text, cid) => { // a diff of a connection the book does not follow: the switch once it reaches the book, or its own is gone (Q-A4-3)
    const symbol = cid.split("-")[1], book = books.get(symbol), from = followed.get(symbol) ?? cid;
    if (book === undefined || !book.feed(text, cid)) return; // /market feeds no book; another stream; a retired connection
    followed.set(symbol, from);
    if (cid === from || !(book.id === null || JSON.parse(text)?.data?.U <= book.id + 1 || links.get(symbol).closed(from, ""))) return; // "": no segment, so true once the link no longer holds <from>
    book.switchTo(cid);
    links.get(symbol).switched(cid);
    followed.set(symbol, cid);
  };
  const linkIo = { webSocket: io.webSocket ?? ((url) => new WebSocket(url)), wallUs, monoNs, setTimer, clearTimer, gate: openingGate(), open: io.open, onText };
  const openIn = (start) => { // the "cid/seg" of the day's window that a writer holds open (Q-C1-5), for the child
    const conn = join(at, "conn"), [from, to] = [segmentOf(start - PERIOD_US), segmentOf(start + DAY_US + GRACE_US)];
    return (existsSync(conn) ? readdirSync(conn) : []).flatMap((c) => readdirSync(join(conn, c)).filter((n) => n.endsWith(".frames")).map((n) => n.slice(0, -7))
      .filter((g) => g >= from && g <= to && [...links.values()].some((l) => !l.closed(c, g))).map((g) => `${c}/${g}`));
  };
  const apart = (spec) => (io.seal ?? sealApart)({ ...spec, out: at }, { env, signal: abort.signal }); // the one call of the child (its root: adopt's, its fd 3)
  async function seals() { // one symbol at a time; a throw on one key journaled with its symbol and day, the next keys go on (r-1 of the G2 delta)
    for (const key of [...due].sort()) {
      const [symbol, day] = key.split("/"), start = Date.parse(`${day}T00:00:00Z`) * 1000, f = facts.get(key);
      try {
        const lock = join(at, "days", symbol, `.${day}.seal.lock`); // n-4 of the G2 of c5-bis-a: one seal of a day at a time, an orphan child's too
        if (finished || (existsSync(lock) && Date.now() - statSync(lock).mtimeMs < SEAL_TIMEOUT_MS)) continue; // sealDay waits for the grace itself
        let r = { sealed: false, failed: { stop: "no_scale" } };
        if (f !== undefined) {
          mkdirSync(dirname(lock), { recursive: true });
          writeFileSync(lock, String(process.pid));
          try { r = await apart({ symbol, day, nowUs: wallUs(), scale: f.scale, config: f, open: openIn(start) }); } finally { rmSync(lock, { force: true }); }
        }
        if (abort.signal.aborted) return; // n-1: a seal aborted by the clean stop writes nothing after the stopped line (its seal_done false)
        if (r.wait !== undefined) continue; // a segment still open: the next hour
        due.delete(key); // sealed, or failed and left to the replay (P1-c6), named
        note(r.sealed ? "day_sealed" : "seal_failed", r.sealed ? { day, frames: r.frames } : { day, ...r.failed }, symbol);
      } catch (e) { failed("seal", e, symbol, { day }); } // the key stays due: the next hour
    }
  }
  async function fire({ at: t, task, symbol, days = [dayOf(t + offset + PERIOD_US)] }) { // one event; a failure journaled, a named stop ends the loop
    try {
      if (task === "cut") for (const l of links.values()) l.cut();
      else if (task === "check") check();
      else if (task === "seal") { if (dayOf(t - PERIOD_US) !== dayOf(t)) for (const s of SYMBOLS) due.add(`${s}/${dayOf(t - PERIOD_US)}`); sealing ??= seals().catch((e) => { failed("seal", e); }).finally(() => { sealing = null; }); } // the day before, at 00:03
      else if (task === "time") { const r = await rest.request("time", null); if (finished) return; const e = logTimeOffset(at, r.body, r.sentUs, r.receivedUs, { wallUs, monoNs }); offset = e.offset_us ?? offset; }
      else if (task === "exchangeInfo") {
        const f = exchangeInfoFacts((await rest.request("exchangeInfo", symbol)).body), was = low; if (finished) return; // r-2 of the G2 delta: an answer after the stop writes nothing to the journal or days/
        for (const d of days) facts.set(`${symbol}/${d}`, { tickSize: f.tickSize, scale: f.scale, rateLimits: f.rateLimits });
        low = f.requestWeightPerMinute < WEIGHT_FLOOR ? f.requestWeightPerMinute : null;
        if (low !== null) lowUntil = calendar(wallUs(), wallUs() + DAY_US, offset).filter((e) => e.task === "exchangeInfo").at(-1).at + 1_000_000; // past the next round
        if ((was === null) !== (low === null)) note(low === null ? "weight_resumed" : "weight_suspended", { limit: f.requestWeightPerMinute, floor: WEIGHT_FLOOR });
      } else { // anchor: the bytes kept by the REST client, as anchor-close.json of its day and anchor-open.json of the next (D-9)
        const { body } = await rest.request("depth", symbol); if (finished) return; // r-2
        for (const [d, name] of [[dayOf(t + offset), "anchor-close.json"], [dayOf(t + offset + PERIOD_US), "anchor-open.json"]]) {
          mkdirSync(join(at, "days", symbol, d), { recursive: true });
          writeFileSync(join(at, "days", symbol, d, name), body, { flag: "wx" });
        }
      }
    } catch (e) {
      if (finished || e instanceof RecorderStop) { finish(e); return; } // r-2: a failure after the stop is not journaled
      failed(task, e, symbol ?? "ALL");
      try { if (rest.stopped) stop("rest_stopped", { task, code: String(e?.code ?? null) }); } catch (s) { finish(s); } // 451 and the others: everything stops
    }
  }
  let last = wallUs();
  const arm = () => { if (!finished) timer = setTimer(tick, Math.min(PERIOD_US / 1000, Math.max(0, (calendar(last, last + DAY_US, offset)[0].at - wallUs()) / 1000))); }; // n-3: under setTimeout's cap
  function tick() {
    const now = wallUs(), events = calendar(last, now, offset);
    last = Math.max(last, now); // a clock stepped back fires nothing twice
    for (const e of events) { // m-2: a dated event overdue after a clock step is skipped, named (an anchor never written from a later depth)
      if (["exchangeInfo", "anchor"].includes(e.task) && now - e.at > OVERDUE_US) tell("event_skipped", { task: e.task, late_us: now - e.at }, e.symbol);
      else void fire(e);
    }
    arm();
  }
  signal.addEventListener("abort", () => { finish(null); }, { once: true });
  if (signal.aborted) finish(null);
  for (const e of [{ at: last, task: "time" }, ...SYMBOLS.map((symbol) => ({ at: last, task: "exchangeInfo", symbol, days: [dayOf(last), dayOf(last + PERIOD_US)] }))]) {
    if (finished) break; // m-1 (a): a stop during the start waits for no request
    await Promise.race([fire(e), ended]);
  }
  if (!finished) links = new Map([...SYMBOLS.map((s) => [s, { symbol: s, url: spotUrl(s), out: at }]), ["ALL", { symbol: "ALL", url: marketUrl(), out: at, kind: "market" }]].map(([k, spec]) => [k, openLink(spec, linkIo)])); // m-3: after the start (G0 point 2)
  arm();
  const cause = await ended, within = (p) => new Promise((r) => { const t = setTimer(() => { r(false); }, STOP_BOUND_MS); void p.then(() => { clearTimer(t); r(true); }, () => { clearTimer(t); r(false); }); });
  clearTimer(timer);
  const linksClosed = await within(Promise.all([...links.values()].map((l) => l.stop())));
  for (const b of books.values()) b.close();
  rest.close();
  const sealDone = await within(sealing ?? Promise.resolve());
  if (!sealDone) abort.abort();
  proc?.off("unhandledRejection", stray);
  note("stopped", { cause: cause?.code ?? "signal", links_closed: linksClosed, seal_done: sealDone });
  if (cause !== null) throw cause;
  return { mode: "record", out: plan.out, stopped: "signal", links_closed: linksClosed, seal_done: sealDone };
}
/** SIGTERM or SIGINT aborts the signal of a run started from the command line. */
const signals = () => { const c = new AbortController(), on = () => { c.abort(); }; process.once("SIGTERM", on); process.once("SIGINT", on); return c.signal; };

/** One run: its guards; a recording takes --out (adopt), marks its tails, then runs the loop; the replay (P1-c6) stops, named. */
export async function run(argv, io = {}) {
  const plan = prepare(argv, io);
  if (plan.mode === "replay") return stop("not_built", { mode: plan.mode, out: plan.out, resume: plan.resume });
  const clocks = { wallUs: io.wallUs ?? (() => Date.now() * 1000), monoNs: io.monoNs ?? process.hrtime.bigint }, taken = adopt(plan, clocks);
  markTails(taken.at, clocks);
  return record(plan, taken, { ...io, ...clocks });
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
/** m-1 (b): the exit code set, then the process ends within EXIT_GRACE_MS, though a socket whose other end never answers its CLOSE lingers. */
export function leave(code) { process.exitCode = code; setTimeout(() => { process.exit(code); }, EXIT_GRACE_MS).unref(); }
if (started(process.argv[1])) leave(await main(process.argv.slice(2)));
