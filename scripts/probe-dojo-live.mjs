// scripts/probe-dojo-live.mjs -- DOJO-LIVE-HEALTH-1 (ADR-DOJO-PR-4 PL-3, lot PR-4c-1c): the daily non-LLM probe of the served Dojo page.
// Runs on the Bell host (deploy/monark-dojo-probe.service, user probe), outside the site's server that holds the proxy (decision 57).
// Calque of scripts/probe-narabi.mjs: inputs and outputs injected (--proxy, --host, --keyring, --verifier, --out, --now), node built-ins
// and the repository's own built-ins-only modules (the tree DOJO_PROBE_TREE_PATHS, shipped whole by git archive), tested offline on
// loopback servers (test/probe-dojo-live.test.ts). ONE run checks, in this order; the first fault is the reason (precedence = this
// order) and every later check is skipped:
//   1. transport of both bases, before any GET (probe-narabi's urlTransportAllowed): insecure_url, bad_port; and
//      NODE_TLS_REJECT_UNAUTHORIZED=0 in the environment (it would disable the certificate check of every GET): insecure_url; and
//      SMTP_PASS in the environment (the verifier child runs as the same user and could read it in /proc): secret_in_environment;
//   2. the core: timeline.jsonl read from the host, then through the site's proxy, equal byte for byte (sha256 and length); then
//      lines/<lines_sha256 of the host's head, its last snapshot line>.jsonl the same way; a difference waits REREAD_DELAY_MS and reads
//      both once more (a publication between two GETs), only that second read is judged. Every GET is bounded by VERIFY_BOUNDS of the
//      verifier: unreachable, timeout, too_large (side: host or proxy); timeline_malformed (no head); proxy_timeline_differs,
//      proxy_lines_differs;
//   3. the proxy's headers on both files: Cache-Control carries no-store (proxy_not_no_store); cf-cache-status absent, DYNAMIC or
//      BYPASS (edge_cache_status), its value recorded;
//   4. the real verifier, `node <dojo-verify-cli.mjs> --url <host> --keyring <committed keyring>`, a child with a closed environment:
//      exit 0, a success report under the supplied keyring, its timeline_sha256 the host's of step 2 (verifier_timeout,
//      verifier_refused with the verifier's own named reason, verifier_timeline_differs);
//   5. freshness: the head's day is at least the day due at DEADLINE_UTC (lag).
// CONTRACT: dojo-live.json (keys DOJO_LIVE_KEYS, written atomically) is written by every run whose argv parses; on a transition to
// unhealthy, then once per UTC day while unhealthy, and on recovery, ONE mail by probe-narabi's sendSmtp (the keys of
// /etc/monark/probe.env but SMTP_PASS, which the probe reads from DEFAULT_SMTP_PASS_FILE when it sends, after the verifier child ended).
// EXIT: 0 healthy and no failed mail; 1 unhealthy, a failed mail (alert_error), or a fatal (a write the disk refuses); 2 usage error,
// nothing written. No secret and no address in any output: hosts by their public names, closed sets, digests and days only.
import { createHash, randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { closeSync, constants, fstatSync, mkdirSync, openSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DOJO_VERIFY_REFUSALS, DOJO_VERIFY_REPORT_KEYS, VERIFY_BOUNDS, dayOk } from "../apps/dojo/scripts/dojo-verify.mjs";
import { SMTP_MAX_BYTES, addDaysUTC, dayDiff, isEmailish, sanitizeField, sendSmtp, smtpDeadlineMs, urlTransportAllowed } from "./probe-narabi.mjs";

/** dojo-live.json schema version. */
export const SCHEMA = 1;
/** The site's proxy of /dojo-served/* (deploy/Caddyfile.monark-dojo-site.snippet) and the Dojo host it relays, by their public names. */
export const DEFAULT_PROXY = "https://monarkgate.tech/dojo-served";
export const DEFAULT_HOST = "https://dojo.monarkgate.tech";
/** The record, beside narabi.json in the probe's only writable directory. */
export const DEFAULT_OUT = "/var/lib/monark-probe/dojo-live.json";
/** The SMTP password of the mail, one line in a file of the probe's user only (mode 0600; RUNBOOK-dojo section 25 (1b)), never in the
 *  environment: read when a mail is sent, after the verifier child has ended (DOJO-PROBE-FOLLOWUP-1, N-1). */
export const DEFAULT_SMTP_PASS_FILE = "/etc/monark/dojo-probe-smtp-pass";
export const SMTP_PASS_MAX_BYTES = 1024;
/** The verifier's public command and the committed keyring, at their repository paths relative to this file: in the repository, and
 *  in the tree the RUNBOOK ships (the keyring redeployed at each synchro, RUNBOOK-dojo section 25). */
export const DEFAULT_VERIFIER = fileURLToPath(new URL("../apps/dojo/scripts/dojo-verify-cli.mjs", import.meta.url));
export const DEFAULT_KEYRING = fileURLToPath(new URL("../apps/dojo/keys/dojo-keyring.json", import.meta.url));
/** The tree of the probe on the host: the static import closure of this file and of the verifier's CLI, plus the committed keyring.
 *  Byte order. Pinned by dojo_probe_tree_is_the_import_closure; shipped by git archive at the G7 (RUNBOOK-dojo section 25). */
export const DOJO_PROBE_TREE_ROOT = "/opt/monark-dojo-probe";
export const DOJO_PROBE_TREE_PATHS = Object.freeze(["apps/bell/scripts/bell-chain.mjs", "apps/dojo/keys/dojo-keyring.json",
  "apps/dojo/scripts/dojo-chain.mjs", "apps/dojo/scripts/dojo-core.mjs", "apps/dojo/scripts/dojo-verify-cli.mjs", "apps/dojo/scripts/dojo-verify.mjs",
  "scripts/probe-dojo-live.mjs", "scripts/probe-narabi.mjs"]);

// Freshness (PL-3 (iii)): the last slot of deploy/monark-dojo-publish.timer (06:30 UTC) plus the publish unit's TimeoutStartSec
// (2900 s) ends by 07:18:21 UTC; 07:30 is the next half hour. Before it, the day before yesterday is still due; from it, yesterday.
// No env override: the probe timer's first shot is pinned to it (dojo_probe_timer_follows_the_publish_deadline).
export const DEADLINE_UTC = "07:30";
export const DEADLINE_UTC_MINUTES = Number(DEADLINE_UTC.slice(0, 2)) * 60 + Number(DEADLINE_UTC.slice(3));
/** The wait before the one reread of a pair that differs (motif REREAD_DELAY_MS, apps/site/lib/narabi-live.ts l.256). */
export const REREAD_DELAY_MS = 1500;
/** DOJO-VERIFY-SCALE-1 (G1 journal of PR-3b-2a l.336; dated line of ADR-DOJO-PR-3 l.667): the verifier child's heap is the publish
 *  unit's (448 MiB under MemoryMax=512M); its delay is the worst CLI measured, 586.9 s of CPU (N = 1 144, D = 365), x 4 under the
 *  unit's CPUQuota=25%, x 1.25, up to the hundred: 3 000 s. Covered: N <= 10 000 at D <= 30, N <= 1 144 at D <= 365. */
export const VERIFIER_HEAP_MIB = 448;
export const VERIFIER_TIMEOUT_MS = 3_000_000;
/** The names the verifier child receives, a closed list taken by name (never the unit's environment, which holds SMTP_PASS): those
 *  of the CA's child, DOJO_CA_CHILD_ENV of scripts/verify-dojo.mjs (equality pinned); on the host only PATH is set among them. */
export const VERIFIER_ENV = Object.freeze(["HOMEDRIVE", "HOMEPATH", "LOGONSERVER", "PATH", "SYSTEMDRIVE", "SYSTEMROOT", "TEMP",
  "USERDOMAIN", "USERNAME", "USERPROFILE", "WINDIR"]);
/** cf-cache-status values admitted on the proxy's responses (PL-2 l.305: DYNAMIC or BYPASS, never HIT); absent is admitted too (no
 *  edge in front of the site, DOJO-EDGE-CACHE-1 as found on 2026-10-03). */
export const EDGE_ADMITTED = Object.freeze(["DYNAMIC", "BYPASS"]);
/** The closed reasons, by the step that names them (steps 1 to 5 above); in a step, the first fault met (GETs: host before proxy). */
export const DOJO_LIVE_REASONS = Object.freeze(["probe_error", "insecure_url", "bad_port", "secret_in_environment", "unreachable", "timeout", "too_large",
  "timeline_malformed", "proxy_timeline_differs", "proxy_lines_differs", "proxy_not_no_store", "edge_cache_status", "verifier_timeout",
  "verifier_refused", "verifier_timeline_differs", "lag"]);
/** The closed keys of dojo-live.json, in their order. */
export const DOJO_LIVE_KEYS = Object.freeze(["schema", "checked_at", "status", "reason", "side", "reread", "head_seq", "head_day", "expected_day",
  "lag_days", "timeline_sha256", "lines_sha256", "no_store", "cf_cache_status_timeline", "cf_cache_status_lines", "verifier_exit",
  "verifier_reason", "alerted", "alert_error", "last_alert_day"]);

const HEX64 = /^[0-9a-f]{64}$/;

/** The day the head must have reached at `nowIso` (UTC): yesterday from DEADLINE_UTC on, the day before before it. */
export function expectedDay(nowIso) {
  const d = new Date(Date.parse(nowIso));
  return addDaysUTC(d.toISOString().slice(0, 10), d.getUTCHours() * 60 + d.getUTCMinutes() >= DEADLINE_UTC_MINUTES ? -1 : -2);
}

/** A sink that hashes and counts a body. */
function digestSink() {
  const h = createHash("sha256");
  let bytes = 0;
  return { push: (c) => { h.update(c); bytes += c.length; return true; }, end: () => ({ sha256: h.digest("hex"), bytes }) };
}
/** The host's timeline: digestSink, plus each LF-terminated line parsed as it arrives, one line held at a time (false when a line
 *  passes MAX_LINE_BYTES, the verifier's bound); end() adds the head, the last snapshot line, or null on a body without its final
 *  newline, a line that is not a JSON object, or no snapshot line with a seq, a day and a 64-hex lines_sha256. */
function timelineSink(maxLine) {
  const d = digestSink();
  let tail = Buffer.alloc(0), head = null, bad = false;
  return {
    push: (c) => {
      d.push(c);
      let b = Buffer.concat([tail, c]);
      for (let i = b.indexOf(10); i >= 0; i = b.indexOf(10)) {
        if (i + 1 > maxLine) return false;
        let o = null;
        try { o = JSON.parse(b.subarray(0, i).toString("utf8")); } catch { o = null; }
        if (o === null || typeof o !== "object" || Array.isArray(o)) bad = true;
        else if (o.kind === "snapshot") head = o;
        b = b.subarray(i + 1);
      }
      tail = b;
      return tail.length < maxLine;
    },
    end: () => {
      const ok = !bad && tail.length === 0 && head !== null && Number.isSafeInteger(head.seq) && head.seq >= 1 && dayOk(head.day)
        && typeof head.lines_sha256 === "string" && HEX64.test(head.lines_sha256);
      return { ...d.end(), head: ok ? { seq: head.seq, day: head.day, lines_sha256: head.lines_sha256 } : null };
    },
  };
}

/** The replay rule of dojo-verify-cli.mjs (replayOf): the same GET once more only when its FIRST try failed before any answer on a
 *  closed or reset socket; never on the timer, never twice. */
function replayOf(e, tries, signal) {
  if (tries > 1 || signal.aborted || !["UND_ERR_SOCKET", "ECONNRESET"].includes(e?.cause?.code)) throw e;
  return null;
}
const TOO_LARGE = new Error("too_large");
/** One GET bounded like urlSource of dojo-verify-cli.mjs: files and bytes counted on `run`, one timer over headers and body, redirect
 *  "manual" and any status but 200 refused, each chunk handed to `sink`. Resolves { ok: true, headers } or { ok: false, reason }. */
async function get(url, sink, run) {
  const b = run.bounds;
  if (++run.files > b.MAX_FILES) return { ok: false, reason: "too_large" };
  const ctl = new AbortController(), timer = setTimeout(() => { ctl.abort(); }, b.TIMEOUT_MS);
  let res = null, tries = 0;
  try {
    while (res === null) res = await fetch(url, { redirect: "manual", signal: ctl.signal }).catch((e) => replayOf(e, ++tries, ctl.signal));
    if (res.status !== 200 || res.body === null) throw new Error("status");
    let n = 0;
    for await (const c of res.body) {
      n += c.length;
      run.bytes += c.length;
      if (n > b.MAX_BODY_BYTES || run.bytes > b.MAX_TOTAL_BYTES || !sink.push(c)) throw TOO_LARGE;
    }
    return { ok: true, headers: res.headers };
  } catch (e) {
    await res?.body?.cancel().catch(() => undefined);
    return { ok: false, reason: e === TOO_LARGE ? "too_large" : ctl.signal.aborted ? "timeout" : "unreachable" };
  } finally { clearTimeout(timer); }
}

/** Step 2 for one served file: read from the host, then through the proxy, compared; a difference reads both once more. */
async function pair(rel, run, s, timeline) {
  for (let attempt = 0; ; attempt++) {
    const hs = timeline ? timelineSink(run.bounds.MAX_LINE_BYTES) : digestSink(), ps = digestSink();
    const h = await get(`${run.host}/${rel}`, hs, run);
    if (!h.ok) return { fault: h.reason, side: "host" };
    const host = hs.end();
    if (timeline && host.head === null) return { fault: "timeline_malformed", side: "host" };
    const p = await get(`${run.proxy}/${rel}`, ps, run);
    if (!p.ok) return { fault: p.reason, side: "proxy" };
    const proxy = ps.end();
    if (host.sha256 === proxy.sha256 && host.bytes === proxy.bytes) return { host, headers: p.headers };
    if (attempt > 0) return { fault: timeline ? "proxy_timeline_differs" : "proxy_lines_differs", side: null };
    s.reread = true;
    await run.sleep(REREAD_DELAY_MS);
  }
}

const noStore = (h) => String(h.get("cache-control") ?? "").split(",").some((t) => t.trim().toLowerCase() === "no-store");
const edgeOf = (h) => { const v = h.get("cf-cache-status"); return v === null ? null : /^[A-Za-z]{1,32}$/.test(v) ? v.toUpperCase() : "MALFORMED"; };

/** Step 4: the verifier's public command as a child: VERIFIER_ENV only, the publish unit's heap cap, killed at `timeoutMs`. */
function runVerifier(cli, host, keyring, timeoutMs) {
  const env = Object.fromEntries(VERIFIER_ENV.flatMap((k) => (process.env[k] === undefined ? [] : [[k, process.env[k]]])));
  return new Promise((done) => {
    let timedOut = false, timer = null;
    const child = execFile(process.execPath, [`--max-old-space-size=${String(VERIFIER_HEAP_MIB)}`, cli, "--url", host, "--keyring", keyring],
      { env, maxBuffer: VERIFY_BOUNDS.MAX_LINE_BYTES, encoding: "utf8", windowsHide: true },
      (e, stdout) => { clearTimeout(timer); done({ code: e === null ? 0 : typeof e.code === "number" ? e.code : null, timedOut, stdout: String(stdout ?? "") }); });
    timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, timeoutMs);
  });
}
/** A success report of the verifier: exactly DOJO_VERIFY_REPORT_KEYS, ok, the supplied keyring as its trust root, no TLS name. */
const reportOk = (r) => r !== null && typeof r === "object" && !Array.isArray(r) && Object.keys(r).sort().join() === [...DOJO_VERIFY_REPORT_KEYS].sort().join()
  && r.ok === true && r.status === "consistent_with_supplied_keyring" && r.trust_root === "supplied_keyring" && r.detail === null;
/** The verifier's one stdout line read, never its exit alone (M-H5); its timeline_sha256 must be the host's read at the core (M-H6). */
function verdictOf(v, timelineSha) {
  let r = null;
  try { r = /^[^\n]*\n$/.test(v.stdout) ? JSON.parse(v.stdout) : null; } catch { r = null; }
  const named = r !== null && typeof r === "object" && DOJO_VERIFY_REFUSALS.includes(r.reason) ? r.reason : null;
  if (!(v.code === 0 && reportOk(r))) return { reason: "verifier_refused", named };
  return { reason: r.timeline_sha256 === timelineSha ? null : "verifier_timeline_differs", named: null };
}

/** Steps 1 to 5 on `s`; returns the reason, null when healthy. */
async function check(s, opts) {
  const run = { proxy: opts.proxy ?? DEFAULT_PROXY, host: opts.host ?? DEFAULT_HOST, bounds: opts.bounds ?? VERIFY_BOUNDS, files: 0, bytes: 0,
    sleep: opts.sleep ?? ((ms) => new Promise((r) => { setTimeout(r, ms); })) };
  for (const [side, base] of [["host", run.host], ["proxy", run.proxy]]) {
    const t = urlTransportAllowed(`${base}/timeline.jsonl`);
    if (!t.ok) { s.side = side; return t.reason; }
  }
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") return "insecure_url";
  if ((opts.env ?? process.env).SMTP_PASS !== undefined) return "secret_in_environment";
  const tl = await pair("timeline.jsonl", run, s, true);
  if (tl.fault !== undefined) { s.side = tl.side; return tl.fault; }
  const head = tl.host.head;
  Object.assign(s, { head_seq: head.seq, head_day: head.day, timeline_sha256: tl.host.sha256, lines_sha256: head.lines_sha256 });
  const ln = await pair(`lines/${head.lines_sha256}.jsonl`, run, s, false);
  if (ln.fault !== undefined) { s.side = ln.side; return ln.fault; }
  Object.assign(s, { no_store: noStore(tl.headers) && noStore(ln.headers), cf_cache_status_timeline: edgeOf(tl.headers),
    cf_cache_status_lines: edgeOf(ln.headers) });
  if (!s.no_store) return "proxy_not_no_store";
  if (![s.cf_cache_status_timeline, s.cf_cache_status_lines].every((v) => v === null || EDGE_ADMITTED.includes(v))) return "edge_cache_status";
  const v = await runVerifier(opts.verifier ?? DEFAULT_VERIFIER, run.host, opts.keyring ?? DEFAULT_KEYRING, opts.verifierTimeoutMs ?? VERIFIER_TIMEOUT_MS);
  s.verifier_exit = v.code;
  if (v.timedOut) return "verifier_timeout";
  const vd = verdictOf(v, s.timeline_sha256);
  s.verifier_reason = vd.named;
  if (vd.reason !== null) return vd.reason;
  s.lag_days = dayDiff(head.day, s.expected_day);
  return s.lag_days > 0 ? "lag" : null;
}

/** The prior alert bit at `out` (motif readPriorState of probe-narabi.mjs): anything but a record of this schema with a boolean
 *  `alerted` (and its day when alerted) reads as not alerted. */
export function readPriorAlert(out) {
  try {
    const j = JSON.parse(readFileSync(out, "utf8")), day = typeof j?.last_alert_day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(j.last_alert_day) ? j.last_alert_day : null;
    if (j?.schema === SCHEMA && typeof j.alerted === "boolean" && (!j.alerted || day !== null)) return { alerted: j.alerted, last_alert_day: day };
  } catch { /* absent or corrupt */ }
  return { alerted: false, last_alert_day: null };
}
/** The SMTP password at `path`, or null: a regular file reached without a link (O_NOFOLLOW; win32 has none), never waited on (a FIFO),
 *  at most SMTP_PASS_MAX_BYTES, ONE non-empty line (its final newline dropped), that neither its group nor others may read. win32 has no
 *  POSIX mode bits (Node reports 0o666 or 0o444 whatever the ACL): they are not checked there; the probe runs on Linux (the Bell host). */
export function readSmtpPass(path) {
  let fd = null;
  try {
    fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
    const st = fstatSync(fd);
    if (!st.isFile() || st.size > SMTP_PASS_MAX_BYTES) return null;
    if (process.platform !== "win32" && (st.mode & 0o077) !== 0) return null;
    const text = readFileSync(fd, "utf8").replace(/\r?\n$/, "");
    return /^[^\r\n\0]+$/.test(text) ? text : null;
  } catch { return null; } finally { if (fd !== null) closeSync(fd); }
}
/** The mail configuration of /etc/monark/probe.env, under the keys and rules of smtpConfig of probe-narabi.mjs but SMTP_PASS, never
 *  read from the environment; null = unconfigured. */
function mailConfigOf(env) {
  const host = env.SMTP_HOST, user = env.SMTP_USER, from = env.ALERT_FROM, to = env.ALERT_TO, tls = env.SMTP_TLS ?? "implicit";
  const pn = Number(String(env.SMTP_PORT ?? "465").trim()), port = Number.isFinite(pn) && pn > 0 && pn < 65536 ? pn : 465;
  if (!host || !user || !isEmailish(from) || !isEmailish(to) || !["implicit", "none"].includes(tls)) return null;
  return { host, port, tls, user, from, to };
}
const SUBJECT = "[MONARK] Dojo probe notice";
/** The mail: a constant subject, a UTC date, and closed-set facts of the record only (no URL, no address, no server line). */
export function composeDojoMail({ from, to, kind, state }) {
  const t = Date.parse(state.checked_at), f = (v) => (v === null ? "none" : sanitizeField(v));
  const head = [`From: ${from}`, `To: ${to}`, `Subject: ${SUBJECT}`, `Date: ${new Date(t).toUTCString().replace(/GMT$/, "+0000")}`,
    `Message-ID: <dojo-probe-${String(t)}-${randomBytes(6).toString("hex")}@${String(from).split("@")[1] ?? "monark-probe.local"}>`,
    "MIME-Version: 1.0", "Content-Type: text/plain; charset=us-ascii"];
  const body = ["MONARK Dojo probe of the served page", `condition: ${kind === "recovery" ? "recovered" : kind}`, `status: ${f(state.status)}`,
    `reason: ${f(state.reason)}`, `side: ${f(state.side)}`, `head_day: ${f(state.head_day)}`, `expected_day: ${f(state.expected_day)}`,
    `lag_days: ${state.lag_days === null ? "none" : String(Number(state.lag_days))}`, `checked_at: ${f(state.checked_at)}`];
  return { subject: SUBJECT, message: `${head.join("\n")}\n\n${body.join("\n")}\n` };
}
/** The anti-storm machine of probe-narabi.mjs (maybeAlert): an alert on the transition to unhealthy, a reminder on a new UTC day still
 *  unhealthy, a recovery mail when healthy after an alert; the bit moves only after a delivered mail (a failure is retried next run).
 *  Called after check, so after the verifier child's end: the password is read only then, and only when a mail is due. */
async function alertOf(s, out, env, opts) {
  let { alerted, last_alert_day } = readPriorAlert(out), alert_error = null;
  const day = s.checked_at.slice(0, 10);
  const kind = s.status === "unhealthy" ? (!alerted ? "alert" : day > (last_alert_day ?? "") ? "reminder" : null) : alerted ? "recovery" : null;
  if (kind !== null) {
    const cfg = mailConfigOf(env), pass = cfg === null ? null : readSmtpPass(opts.smtpPassFile ?? DEFAULT_SMTP_PASS_FILE);
    let res = { ok: false, error: "smtp_unconfigured" };
    if (cfg !== null && pass !== null) {
      try { res = await sendSmtp({ ...cfg, pass, message: composeDojoMail({ from: cfg.from, to: cfg.to, kind, state: s }).message, deadlineMs: smtpDeadlineMs(env), maxBytes: SMTP_MAX_BYTES }); }
      catch (e) { res = { ok: false, error: e?.alertError ?? "smtp_unreachable" }; }
    }
    if (!res.ok) alert_error = res.error;
    else if (kind === "recovery") [alerted, last_alert_day] = [false, null];
    else [alerted, last_alert_day] = [true, day];
  }
  return { alerted, last_alert_day, alert_error };
}

/** One run: check, decide the mail, write dojo-live.json atomically (a temporary name in the same directory, then a rename). */
export async function probe(opts = {}) {
  const given = opts.now ?? new Date().toISOString(), valid = !Number.isNaN(Date.parse(given)), nowIso = valid ? given : new Date().toISOString();
  const out = opts.out ?? DEFAULT_OUT;
  const s = { schema: SCHEMA, checked_at: new Date(Date.parse(nowIso)).toISOString(), status: "unhealthy", reason: "probe_error", side: null,
    reread: false, head_seq: null, head_day: null, expected_day: expectedDay(nowIso), lag_days: null, timeline_sha256: null, lines_sha256: null,
    no_store: null, cf_cache_status_timeline: null, cf_cache_status_lines: null, verifier_exit: null, verifier_reason: null, alerted: false,
    alert_error: null, last_alert_day: null };
  try { if (valid) s.reason = await check(s, opts); } catch { s.reason = "probe_error"; }
  s.status = s.reason === null ? "healthy" : "unhealthy";
  Object.assign(s, await alertOf(s, out, opts.env ?? process.env, opts));
  mkdirSync(dirname(out), { recursive: true });
  const tmp = `${out}.tmp-${String(process.pid)}-${randomBytes(8).toString("hex")}`;
  try { writeFileSync(tmp, `${JSON.stringify(s, null, 2)}\n`); renameSync(tmp, out); } catch (e) { rmSync(tmp, { force: true }); throw e; }
  return { state: s, exitCode: s.status === "unhealthy" || s.alert_error !== null ? 1 : 0 };
}

const FLAGS = { "--proxy": "proxy", "--host": "host", "--keyring": "keyring", "--verifier": "verifier", "--out": "out", "--now": "now", "--smtp-pass-file": "smtpPassFile" };
/** The argv: each flag of FLAGS at most once, each with a value; anything else throws (the run writes nothing: exit 2). */
export function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = String(argv[i]), v = argv[i + 1];
    if (!Object.hasOwn(FLAGS, flag) || Object.hasOwn(a, FLAGS[flag]) || v === undefined || v.startsWith("--")) {
      throw new Error(`unknown, repeated or valueless flag ${flag}`);
    }
    a[FLAGS[flag]] = v;
  }
  return a;
}

// Run-guard (real paths compared, motif dojo-verify-cli.mjs): the CLI runs when launched, never on import (the tests).
const isEntry = () => { try { return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]); } catch { return false; } };
if (isEntry()) {
  let args = null;
  try { args = parseArgs(process.argv.slice(2)); } catch (e) { process.stderr.write(`dojo probe: usage: ${e.message}\n`); process.exitCode = 2; }
  if (args !== null) {
    probe(args).then(({ state, exitCode }) => { process.stdout.write(`${JSON.stringify(state, null, 2)}\n`); process.exitCode = exitCode; },
      () => { process.stderr.write("dojo probe: fatal\n"); process.exitCode = 1; });
  }
}
