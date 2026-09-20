// scripts/probe-narabi.mjs — EXTERNAL freshness/chain probe for the MONARK Narabi sentinel surface
// (ADR-NARABI-OPS-1 L-5, sub-lot -1b-i: DETECTION only, no mail). Runs on the SECOND VPS (Bell), a host
// distinct from the surveyed sentinel (decision 57), so a stalled or broken publication is observed from
// the outside. Node BUILT-INS ONLY: @monark/* is not installable on Bell, so the 31-field hash order and
// providerOf are DUPLICATED here (their fidelity is an oracle: test/probe-narabi.test.ts). This file is
// pure logic + injected I/O (`--file`/`--now`/`--url`/`--out`), so the whole decision is replayed offline
// with no network. It NEVER sends mail and carries NO state machine — that is sub-lot -1b-ii.
//
// CONTRACT: the probe ALWAYS writes narabi.json before it exits, and exits 1 IFF status === "unhealthy"
// (visible from systemd/journalctl), 0 otherwise. It performs NO outbound action other than a GET of the
// already-served public surface; `http://` is accepted on loopback ONLY (the offline test wire).
//
// narabi.json (schema 1, DETECTION): { schema, checked_at, last_day, lag_days, chain_ok, reachable,
//   chainstack_present, provider, status, reason, publish_latency }. WRITE-ONLY in -1b-i (no prior state is
//   read back); the state-machine read path (alerted/alert_error) lands in -1b-ii, which bumps `schema`.
import { createHash, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, statSync, renameSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

/** narabi.json schema version. -1b-ii bumps this when it adds alerted/alert_error/last_alert_day. */
export const SCHEMA = 1;

/** The served surface the probe reads (public, key-less). Overridable with `--url` / env PROBE_URL. */
export const DEFAULT_URL = "https://monarkgate.tech/narabi/timeline.jsonl";

/** Default narabi.json path on Bell (the probe's ONLY writable state). Overridable with `--out` / PROBE_OUT. */
export const DEFAULT_OUT = "/var/lib/monark-probe/narabi.json";

// ── Freshness deadline (ADR-NARABI-OPS-1 fact 5 / C-4) ──────────────────────────────────────────────────
// A single pinned constant, NO env override: the deploy timer's OnCalendar is checked to be >= this value
// (test probe_timer_oncalendar_ge_deadline), so an env knob would break that coupling. 10:30 UTC = the last
// sentinel retry slot (09:30) + its 1800 s jitter + the publishing run's duration (NOT yet measured — the
// orchestrator reads the 00:30 UTC 2026-09-21 journal before the freeze; 10:30 is a DECLARED hypothesis
// until then). SINGLE source of truth (C-G2-5): the string; the minutes form is DERIVED from it, never edited
// independently, so expectedLastDay (minutes) can never drift from publishLatencySec (the string).
export const DEADLINE_UTC = "10:30";
/** Parse an "HH:MM" wall-clock string to minutes-of-day (the single-source derivation for the deadline). */
function hhmmToMinutes(hm) {
  const m = /^(\d{2}):(\d{2})$/.exec(hm);
  if (!m) throw new Error(`DEADLINE must be HH:MM, got ${hm}`);
  return Number(m[1]) * 60 + Number(m[2]);
}
export const DEADLINE_UTC_MINUTES = hhmmToMinutes(DEADLINE_UTC); // DERIVED — single source (C-G2-5)

// Transport bounds (C-6): the GET is never allowed to hang or read an unbounded body. These MAY be tuned by
// env for the offline test (a short timeout proves the never-hang guard); DEADLINE deliberately may NOT.
export const DEFAULT_TIMEOUT_MS = 8000;
export const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;
export const DEFAULT_RETRIES = 2;
// HARD CAPS on the env-tunable bounds (C-G2-7): a mis-set /etc/monark/probe.env can never push the fetch worst
// case (timeout x (retries+1)) past the unit's TimeoutStartSec and get the job killed mid-write. Capped worst
// case = 10000 x (4+1) + 10000 margin = 60 s < TimeoutStartSec 90 s (asserted by probe_timer_multiple_shots).
export const MAX_TIMEOUT_MS = 10_000;
export const MAX_MAX_BYTES = 64 * 1024 * 1024;
export const MAX_RETRIES = 4;
export const START_MARGIN_MS = 10_000;

const DAY_MS = 86_400_000;

/** The provider behind an endpoint URL: its registrable domain (last two host labels). BYTE-FAITHFUL
 *  duplicate of apps/sentinel/src/rpc.ts providerOf (Bell cannot import it); the equality is an oracle
 *  (test probe_provider_of_matches_sentinel). A scheme-less test double returns as-is (its own provider). */
export function providerOf(url) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return url;
  }
  return host.split(".").slice(-2).join(".");
}

/** The two registrable domains that mean "the Chainstack paid operator is in the pool" (inherited item i:
 *  a *.p2pify.com host collapses to p2pify.com, the legacy Chainstack domain; ADR-M012 D3 says chainstack.com
 *  — both accepted, the quorum holds either way). */
export const CHAINSTACK_PROVIDERS = ["chainstack.com", "p2pify.com"];

/** Whether the Chainstack operator is present in a line's published `endpoints` — by PROVIDER membership,
 *  NEVER a positional index endpoints[8] (PUBLIC_ENDPOINTS can gain/lose a free host; C-12 / hypothesis 2). */
export function chainstackPresent(endpoints) {
  return Array.isArray(endpoints) && endpoints.some((e) => CHAINSTACK_PROVIDERS.includes(providerOf(e)));
}

/** The matched Chainstack provider (chainstack.com | p2pify.com) or null — a recorded fact for narabi.json. */
export function chainstackProviderOf(endpoints) {
  if (!Array.isArray(endpoints)) return null;
  for (const e of endpoints) {
    const p = providerOf(e);
    if (CHAINSTACK_PROVIDERS.includes(p)) return p;
  }
  return null;
}

/** The 31 hashed fields, in FIXED order — a byte-faithful duplicate of apps/sentinel/src/timeline.ts
 *  hashedFields (:94-101). Any permutation/truncation diverges the recomputed line_hash (test
 *  probe_hashed_fields_order_equals_sentinel, on a synthetic line with 31 pairwise-distinct values). */
export function hashedFieldsOf(l) {
  return [
    l.day, l.from_block, l.to_block, l.burns, l.mints, l.supply_close, l.s_open, l.c1_ok,
    l.utterance_hash, l.attested_flow_sha256, l.v, l.regime.floor, l.regime.stress, l.pair_status,
    l.s_raw, l.s, l.E_tracker, l.q_before, l.eta, l.q_after, l.T, l.mean_E_tracker, l.bound_thm1,
    l.digest_T, l.E_static, l.t_deg, l.sum_E_static, l.B_t, l.rolling90_calm_miss, l.drift_flag, l.prev_line_hash,
  ];
}

/** Recompute a line's chain hash from its 31 hashed fields (duplicate of timeline.ts lineHashOf :104-106). */
export function lineHashOf(l) {
  return createHash("sha256").update(JSON.stringify(hashedFieldsOf(l)), "utf8").digest("hex");
}

/** UTC date (YYYY-MM-DD) `n` days from `day`. */
export function addDaysUTC(day, n) {
  return new Date(Date.parse(day + "T00:00:00Z") + n * DAY_MS).toISOString().slice(0, 10);
}

/** Whole UTC days from `a` to `b` (b - a). */
export function dayDiff(a, b) {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / DAY_MS);
}

/** The day whose line SHOULD be the last published one at instant `nowIso`, in UTC. Before the 10:30 UTC
 *  deadline the previous day's line may still be in flight (retries), so we tolerate today-2; after it, we
 *  expect today-1. This grid lives in the LOGIC (not only the timer): a boot / manual `systemctl start` at
 *  03:00 UTC (Persistent=true) would otherwise see today-1 legitimately absent and false-alarm (C-4).
 *  The date and the minute-of-day are read via SEPARATE UTC calls, so a swap to local time on EITHER is an
 *  independently-killable mutant on a UTC+1 host (probe_narabi_detects_lag: 09:45Z, 23:30Z). */
export function expectedLastDay(nowIso) {
  const d = new Date(Date.parse(nowIso));
  const todayUTC = d.toISOString().slice(0, 10);
  const minuteOfDayUTC = d.getUTCHours() * 60 + d.getUTCMinutes();
  return minuteOfDayUTC >= DEADLINE_UTC_MINUTES ? addDaysUTC(todayUTC, -1) : addDaysUTC(todayUTC, -2);
}

/** publish_latency (seconds): checked_at minus the 10:30 UTC deadline instant on the check's UTC day. It is
 *  the OBSERVATION DELAY past the freshness deadline (a fact to calibrate the margin), NOT the sentinel
 *  publishing run's latency (that needs a deploy-time journal read — a separate item). Deterministic under
 *  `--now`. Negative before the deadline (the normal 00:30-10:30 UTC morning state). */
export function publishLatencySec(nowIso) {
  const t = Date.parse(nowIso);
  const todayUTC = new Date(t).toISOString().slice(0, 10);
  const deadlineInstant = Date.parse(todayUTC + "T" + DEADLINE_UTC + ":00Z");
  return Math.round((t - deadlineInstant) / 1000);
}

/** Parse a timeline.jsonl body into lines (CRLF-tolerant). Throws on a malformed line (caught upstream). */
export function parseTimeline(text) {
  return text.replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim()).map((l) => JSON.parse(l));
}

/** Recompute the FULL chain (C-9): every line's own hash AND every prev_line_hash link, not just the last —
 *  so a tampered MIDDLE line is caught. Returns { ok, at } (at = first bad index, -1 when ok). */
export function checkChain(lines) {
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (lineHashOf(l) !== l.line_hash) return { ok: false, at: i };
    if (i > 0 && l.prev_line_hash !== lines[i - 1].line_hash) return { ok: false, at: i };
  }
  return { ok: true, at: -1 };
}

/** Transport policy (C-6): https anywhere; http on loopback ONLY (the offline test wire). Anything else is
 *  refused BEFORE any dial (reason insecure_url), so a mis-set PROBE_URL never leaks a plaintext GET off-box.
 *  Exported so the test can assert it with ZERO packets (the mutant-removed variant stops here). */
export function isLoopbackHost(hostname) {
  const h = String(hostname).replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "localhost" || h === "::1") return true;
  // A LITERAL IPv4 in 127.0.0.0/8 ONLY: exactly four canonical decimal octets (0-255, no leading zero), first
  // === 127. Refuses DNS names (127.evil.com, 127.0.0.1.evil.com) and non-canonical numeric forms (C-G2-1).
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (!m) return false;
  for (let i = 1; i <= 4; i++) {
    const p = m[i];
    if (p.length > 1 && p[0] === "0") return false; // a leading-zero (octal-looking) octet is not canonical
    if (Number(p) > 255) return false;
  }
  return Number(m[1]) === 127;
}
/** The host EXACTLY as written in the URL authority (userinfo + port removed), read from the raw string BEFORE
 *  the WHATWG parser normalizes 127.1 / 0x7f.0.0.1 / 2130706433 / 0177.0.0.1 to 127.0.0.1 — so those
 *  non-canonical numeric loopback forms are refused even though u.hostname would look canonical (C-G2-1). */
function rawUrlHost(url) {
  const m = /^[a-z][a-z0-9+.-]*:\/\/([^/?#\\]*)/i.exec(String(url));
  if (!m) return "";
  let auth = m[1];
  const at = auth.lastIndexOf("@");
  if (at >= 0) auth = auth.slice(at + 1);
  if (auth.startsWith("[")) { const rb = auth.indexOf("]"); return rb >= 0 ? auth.slice(0, rb + 1) : auth; }
  const colon = auth.indexOf(":");
  return colon >= 0 ? auth.slice(0, colon) : auth;
}
export function urlTransportAllowed(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return { ok: false, reason: "insecure_url" };
  }
  if (u.protocol === "https:") return { ok: true };
  // http ONLY on a strict loopback literal: no userinfo (the 127.0.0.1@evil.com trick), and BOTH the DIALED
  // host (u.hostname) AND the raw host (before normalization) must be loopback, so a mis-set PROBE_URL never
  // leaks a plaintext GET off-box (C-G2-1). rawUrlHost is what refuses 127.1 / 0x7f.0.0.1 / 2130706433.
  if (
    u.protocol === "http:" && u.username === "" && u.password === "" &&
    isLoopbackHost(u.hostname) && isLoopbackHost(rawUrlHost(url))
  ) return { ok: true };
  return { ok: false, reason: "insecure_url" };
}

/** Transport bounds read from env, each HARD-CAPPED (C-G2-7) so a mis-set env can never exceed the systemd
 *  TimeoutStartSec worst case. A missing/negative/non-finite value falls back to the default. */
export function transportBounds(env = process.env) {
  // A blank/whitespace/non-numeric/NaN/negative or below-floor value falls back to the DEFAULT — never a silent 0
  // that makes every fetch abort instantly (timeoutMs) or every body oversize (maxBytes), an always-unhealthy mute
  // state (C-G2D-3) — then clamps to the hard MAX (C-G2-7). Floor: timeout/maxBytes at 1 (0 is pathological there);
  // retries at 0, so an explicit PROBE_RETRIES=0 (legitimate "no retry") is KEPT while a blank/malformed one defaults.
  const num = (v, dflt, max, floor) => {
    if (v === undefined) return dflt;
    const s = String(v).trim();
    if (s === "") return dflt; // empty/whitespace is malformed -> default (NOT Number("") === 0 -> a silent 0)
    const n = Number(s);
    if (!Number.isFinite(n) || n < floor) return dflt;
    return Math.min(n, max);
  };
  return {
    timeoutMs: num(env.PROBE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS, 1),
    maxBytes: num(env.PROBE_MAX_BYTES, DEFAULT_MAX_BYTES, MAX_MAX_BYTES, 1),
    retries: num(env.PROBE_RETRIES, DEFAULT_RETRIES, MAX_RETRIES, 0),
  };
}

/** GET the surface with a bounded timeout, a bounded body, and a bounded retry, so the probe never hangs and
 *  never buffers an unbounded response (C-6). On any failure returns { ok:false, reason } — never throws. */
export async function fetchTimeline(url, opts = {}) {
  // Defense in depth (C-G2D-4): fetchTimeline vets transport ITSELF (idempotent with probe()'s pre-check), so a
  // future -1b-ii caller reaching it directly cannot bypass the https/loopback guard. No dial on refusal.
  const allowed = urlTransportAllowed(url);
  if (!allowed.ok) return { ok: false, reason: allowed.reason };
  const b = transportBounds(process.env);
  const timeoutMs = opts.timeoutMs ?? b.timeoutMs;
  const maxBytes = opts.maxBytes ?? b.maxBytes;
  const retries = opts.retries ?? b.retries;
  let lastReason = "unreachable";
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctl = new AbortController();
    const to = setTimeout(() => { ctl.abort(); }, timeoutMs);
    try {
      const res = await fetch(url, { redirect: "manual", signal: ctl.signal, headers: { accept: "application/jsonl, text/plain" } });
      // A 3xx is NEVER followed off the guarded URL (C-G2-4): urlTransportAllowed vetted only the initial URL,
      // so a redirect to any other host is treated as unreachable, deterministically (do not retry a redirect).
      if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) return { ok: false, reason: "unreachable" };
      if (!res.ok || !res.body) { lastReason = "unreachable"; continue; }
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;
      let tooLarge = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        if (received > maxBytes) { tooLarge = true; try { await reader.cancel(); } catch { /* already closing */ } break; }
        chunks.push(value);
      }
      if (tooLarge) return { ok: false, reason: "too_large" }; // deterministic — do not retry an oversize body
      return { ok: true, text: Buffer.concat(chunks).toString("utf8") };
    } catch { // AbortError (timeout) or a network error — bounded retry
      lastReason = "unreachable";
    } finally {
      clearTimeout(to);
    }
  }
  return { ok: false, reason: lastReason };
}

/** Pure decision over an already-obtained body. Precedence (cannot-evaluate > chain > lag): a transport
 *  failure (unreachable/too_large/insecure_url) or a parse failure (probe_error) is unhealthy with no
 *  freshness verdict; a broken chain outranks lag (a rewrite makes last_day untrustworthy). */
export function evaluate({ text, nowIso, reachable, fetchReason }) {
  const checked_at = new Date(Date.parse(nowIso)).toISOString();
  const publish_latency = publishLatencySec(nowIso);
  const base = {
    schema: SCHEMA, checked_at, last_day: null, lag_days: null, chain_ok: false, reachable,
    chainstack_present: false, provider: null, status: "unhealthy", reason: null, publish_latency,
  };
  if (!reachable) return { ...base, reason: fetchReason ?? "unreachable" };
  let lines;
  try {
    lines = parseTimeline(text);
  } catch {
    return { ...base, reason: "probe_error" };
  }
  if (lines.length === 0) return { ...base, reason: "probe_error" };
  const last = lines[lines.length - 1];
  const chainstack_present = chainstackPresent(last.endpoints);
  const provider = chainstackProviderOf(last.endpoints);
  const chain = checkChain(lines);
  if (!chain.ok) {
    return { ...base, last_day: last.day, chainstack_present, provider, chain_ok: false, reason: "chain_broken" };
  }
  const expected = expectedLastDay(nowIso);
  const lag_days = dayDiff(last.day, expected); // > 0 STRICT means a due day is missing; <= 0 is healthy
  const healthy = lag_days <= 0;
  return {
    ...base, last_day: last.day, lag_days, chain_ok: true, chainstack_present, provider,
    status: healthy ? "healthy" : "unhealthy", reason: healthy ? null : "lag",
  };
}

/** Obtain the body (from `--file` or a bounded GET), evaluate, and ALWAYS write narabi.json. Never throws
 *  out: any unexpected error still writes an unhealthy `probe_error` state. Returns { state, exitCode }. */
export async function probe(opts = {}) {
  // An invalid --now must NOT abort the write (contract: narabi.json is ALWAYS written). Fall back to the real
  // clock for checked_at and report probe_error, never a FATAL that leaves narabi.json unwritten (C-G2-3).
  const providedNow = opts.now ?? new Date().toISOString();
  const nowValid = !Number.isNaN(Date.parse(providedNow));
  const nowIso = nowValid ? providedNow : new Date().toISOString();
  let text = null;
  let reachable = false;
  let fetchReason = "unreachable";
  try {
    if (opts.file !== undefined) {
      // --file is size-bounded like the GET (C-G2-8): an oversize file is refused too_large, never read whole.
      const maxBytes = opts.maxBytes ?? transportBounds(process.env).maxBytes;
      if (statSync(opts.file).size > maxBytes) { fetchReason = "too_large"; }
      else { text = readFileSync(opts.file, "utf8"); reachable = true; }
    } else {
      const url = opts.url ?? process.env.PROBE_URL ?? DEFAULT_URL;
      const allowed = urlTransportAllowed(url);
      if (!allowed.ok) {
        fetchReason = allowed.reason;
      } else {
        const got = await fetchTimeline(url, opts);
        if (got.ok) { text = got.text; reachable = true; }
        else fetchReason = got.reason;
      }
    }
  } catch {
    reachable = false;
    text = null;
    fetchReason = "unreachable";
  }
  let state;
  try {
    if (!nowValid) throw new RangeError("invalid --now"); // -> probe_error with a real checked_at (C-G2-3)
    state = evaluate({ text, nowIso, reachable, fetchReason });
  } catch {
    state = {
      schema: SCHEMA, checked_at: new Date(Date.parse(nowIso)).toISOString(), last_day: null, lag_days: null,
      chain_ok: false, reachable, chainstack_present: false, provider: null, status: "unhealthy",
      reason: "probe_error", publish_latency: publishLatencySec(nowIso),
    };
  }
  const out = opts.out ?? process.env.PROBE_OUT ?? DEFAULT_OUT;
  try { mkdirSync(dirname(out), { recursive: true }); } catch { /* dir may exist / be a root */ }
  // Atomic write (C-G2-6): write a temp file in the SAME dir, then rename over the target (atomic on one
  // filesystem, overwrites on POSIX and Windows), so a crash mid-write never leaves a torn narabi.json. The temp
  // name carries the pid AND 8 crypto-random bytes so two simultaneous shots never collide on it (C-G2D-2).
  const tmp = `${out}.tmp-${String(process.pid)}-${randomBytes(8).toString("hex")}`;
  try {
    writeFileSync(tmp, JSON.stringify(state, null, 2) + "\n");
    renameSync(tmp, out);
  } catch {
    // A disk/rename I/O fault must NOT leak the orphan temp NOR escape as an uncaught FATAL: clean the temp and
    // fall back to a best-effort DIRECT write of a probe_error state, keeping the "narabi.json ALWAYS written"
    // invariant (C-G2D-2). If even that direct write fails (disk truly gone), still return the contract code.
    try { unlinkSync(tmp); } catch { /* the temp may never have been created */ }
    const errState = { ...state, status: "unhealthy", reason: "probe_error" };
    try { writeFileSync(out, JSON.stringify(errState, null, 2) + "\n"); } catch { /* best-effort, never FATAL */ }
    return { state: errState, exitCode: 1 };
  }
  return { state, exitCode: state.status === "unhealthy" ? 1 : 0 };
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--file") { a.file = argv[++i]; }
    else if (t === "--now") { a.now = argv[++i]; }
    else if (t === "--url") { a.url = argv[++i]; }
    else if (t === "--out") { a.out = argv[++i]; }
  }
  return a;
}

async function main() {
  const { state, exitCode } = await probe(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify(state, null, 2));
  process.exitCode = exitCode;
}

// Run-guard (mirrors the repo's scripts): the CLI runs only when invoked directly, never on import (tests).
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((e) => { console.error("probe FATAL", e); process.exitCode = 1; });
}
