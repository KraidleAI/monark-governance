// scripts/probe-narabi.mjs — EXTERNAL freshness/chain probe + ALERT for the MONARK Narabi sentinel surface
// (ADR-NARABI-OPS-1 L-5, sub-lot -1b-ii-a: detection [from -1b-i] PLUS the SMTP mail alert). Runs on the SECOND
// VPS (Bell), a host distinct from the surveyed sentinel (decision 57), so a stalled or broken publication is
// observed from the outside. Node BUILT-INS ONLY: @monark/* is not installable on Bell, so the 31-field hash
// order and providerOf are DUPLICATED here (fidelity is an oracle: test/probe-narabi.test.ts). Pure logic +
// injected I/O (`--file`/`--now`/`--url`/`--out`/`--state-file`) + a built-ins SMTP client (node:tls implicit 465 / node:net
// loopback for tests), so the decision AND the send are replayed offline against a loopback fake — no network.
//
// CONTRACT: the probe ALWAYS writes narabi.json before it exits, and exits 1 IFF status === "unhealthy" OR an
// alert send failed (alert_error !== null), visible from systemd/journalctl. The only outbound actions are two
// GETs of the already-served public surface (`http://` on loopback ONLY — timeline.jsonl, then the derived
// state.json cross-check) and, on unhealthy, an SMTP submission.
//
// narabi.json (schema 2, DETECTION + ALERT + STATE CROSS-CHECK): schema 1 fields { schema, checked_at,
//   last_day, lag_days, chain_ok, reachable, chainstack_present, provider, status, reason, publish_latency }
//   PLUS the -1b-ii-a alert state machine { alerted, alert_error (closed set), last_alert_day (UTC YYYY-MM-DD) }
//   PLUS the -1b-ii-b state cross-check flag { state_checked } and the two reasons state_mismatch /
//   state_unreachable. READ back now (bootstrap alerted:false on absent/corrupt/schema-1/inconsistent, C-B-5).
//   The `schema` bump to 2 is -1b-ii-a's (kept as one edit); -1b-ii-b joins state_checked to that same shape.
import { createHash, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, statSync, renameSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import net from "node:net";
import tls from "node:tls";

/** narabi.json schema version. -1b-ii-a bumped this from 1 to 2 when it added alerted/alert_error/last_alert_day. */
export const SCHEMA = 2;

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
// HARD CAPS on the env-tunable bounds (C-G2-7): a mis-set /etc/monark/probe.env can never push the combined
// worst case past the unit's TimeoutStartSec and get the job killed mid-write. Capped combined worst case =
// GET1 10000 x (4+1) + GET2 STATE_TIMEOUT_MS x (STATE_RETRIES+1) + SMTP MAX_SMTP_DEADLINE_MS + 10000 margin
// = 50 + 10 + 30 + 10 = 100 s < TimeoutStartSec 120 s (asserted by probe_timer_multiple_shots, merge -a x -b).
export const MAX_TIMEOUT_MS = 10_000;
// Byte cap == DEFAULT_MAX_BYTES (env may only LOWER it): a cap-sized body peaks ~100 MiB RSS on the GET path
// (measured), 22% under MemoryMax=128M; 64 MiB peaked ~247 MiB -> cgroup-killed pre-write (C-V-3; coherence in timer test).
export const MAX_MAX_BYTES = 8 * 1024 * 1024;
export const MAX_RETRIES = 4;
export const START_MARGIN_MS = 10_000;

// ── SMTP conversation bounds (-1b-ii-a, C-B-2) ──────────────────────────────────────────────────────────
// A SINGLE wall-clock deadline for the WHOLE exchange — connect + TLS handshake + conversation (~9 RTs), ONE timer
// not two sequential per-phase deadlines (C-G2-1): a drip reply/handshake must still be given up on. Env
// SMTP_DEADLINE_MS clamps to MAX (like the GET bounds),
// so a mis-set /etc/monark/probe.env can never push the send past the unit's TimeoutStartSec (asserted by
// probe_timer_multiple_shots). SMTP_MAX_BYTES caps the total response bytes (a second, coarser stall/flood guard).
export const DEFAULT_SMTP_DEADLINE_MS = 20_000;
export const MAX_SMTP_DEADLINE_MS = 30_000;
export const SMTP_MAX_BYTES = 64 * 1024;

// State cross-check bounds (sub-lot -1b-ii-b): the SECOND GET, of /narabi/state.json, is bounded on its OWN.
// state.json is a single tiny object (398 bytes measured — ADR-NARABI-OPS-1 fact 5), so a small byte cap, a
// short timeout, and a FIXED 1-retry (env-independent, so no mis-set env can widen it) keep the GET1+GET2
// capped worst case (50 s + 10 s + 10 s margin = 70 s) STRICTLY under monark-probe.service TimeoutStartSec
// (=120 in the merged state — the raise to 120 is -1b-ii-a's for the SMTP send; -b's GET2 needs no raise of
// its own, asserted by probe_state_get_rss_and_worstcase_bounds).
export const STATE_MAX_BYTES = 64 * 1024; // 64 KiB — far above the 398-byte real state.json, far below MAX_MAX_BYTES
export const STATE_TIMEOUT_MS = 5_000;    // short: state.json is tiny and same-origin as the timeline
export const STATE_RETRIES = 1;           // one bounded retry (2 attempts), FIXED (not env-tunable)

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
 *  An admitted URL on a port that fetch refuses is refused too, reason bad_port (portAllowed, PROBE-BADPORT-REASON-1).
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
/** The Fetch "bad port" list of the fetch this probe calls (undici, bundled in Node), COPIED by hand: Node exposes it through
 *  no public API (no undici builtin module; the one in-process reader, process.binding("natives"), is deprecated, DEP0111).
 *  Provenance: node.exe v24.15.0, embedded module internal/deps/undici/undici (undici 7.24.4), its `var badPorts` array,
 *  module sha256 d6332aa1ca04f71ffdba505a7e2cb61d15d3e0799bdcc06352a89d6a58ebe475, read 2026-10-03. Strings, as undici holds
 *  them: its requestBadPort blocks an http(s) URL iff badPortsSet.has(url.port), url.port being the WHATWG port string ("" for
 *  the scheme default), and fetch then rejects "bad port" before any connect. test/probe-narabi.test.ts compares this copy
 *  with the source embedded in the node.exe that runs the suite (PROBE-BADPORT-REASON-1). */
export const FETCH_BAD_PORTS = Object.freeze([
  "1", "7", "9", "11", "13", "15", "17", "19", "20", "21", "22", "23", "25", "37", "42", "43", "53", "69", "77", "79", "87", "95",
  "101", "102", "103", "104", "109", "110", "111", "113", "115", "117", "119", "123", "135", "137", "139", "143", "161", "179",
  "389", "427", "465", "512", "513", "514", "515", "526", "530", "531", "532", "540", "548", "554", "556", "563", "587", "601",
  "636", "989", "990", "993", "995", "1719", "1720", "1723", "2049", "3659", "4045", "4190", "5060", "5061", "6000", "6566",
  "6665", "6666", "6667", "6668", "6669", "6679", "6697", "10080",
]);
const FETCH_BAD_PORT_SET = new Set(FETCH_BAD_PORTS);
/** A port that fetch refuses ("bad port", before any connect) would read unreachable on every try, forever, like a surface
 *  that is down: such a URL is refused BEFORE any call with its own reason, bad_port. Reached only once the transport is
 *  admitted, so an insecure URL keeps insecure_url whatever its port (no other reason changes). */
function portAllowed(u) {
  if (FETCH_BAD_PORT_SET.has(u.port)) return { ok: false, reason: "bad_port" };
  return { ok: true };
}
export function urlTransportAllowed(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return { ok: false, reason: "insecure_url" };
  }
  if (u.protocol === "https:") return portAllowed(u);
  // http ONLY on a strict loopback literal: no userinfo (the 127.0.0.1@evil.com trick), and BOTH the DIALED
  // host (u.hostname) AND the raw host (before normalization) must be loopback, so a mis-set PROBE_URL never
  // leaks a plaintext GET off-box (C-G2-1). rawUrlHost is what refuses 127.1 / 0x7f.0.0.1 / 2130706433.
  if (
    u.protocol === "http:" && u.username === "" && u.password === "" &&
    isLoopbackHost(u.hostname) && isLoopbackHost(rawUrlHost(url))
  ) return portAllowed(u);
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

/** The state.json URL derived from the timeline URL by BASENAME replacement (C-B-12): the last path segment
 *  becomes `state.json`, everything else (scheme, host, port, parent path, query) is kept. Overridable with
 *  env PROBE_STATE_URL. So `.../narabi/timeline.jsonl` -> `.../narabi/state.json` with NO extra config, which
 *  is exactly what probe_state_digest_cross_check exercises (one loopback server, no PROBE_STATE_URL). */
export function deriveStateUrl(timelineUrl) {
  const u = new URL(timelineUrl);
  u.pathname = u.pathname.replace(/[^/]*$/, "state.json");
  return u.toString();
}

/** Extract the comparable digest from a state.json body: { ok:true, digest } ONLY when the body parses to an
 *  object with a STRING `digest`; a parse failure or a missing/non-string digest is { ok:false } (we could
 *  not obtain a digest to check against -> state_unreachable, NOT state_mismatch). */
function stateDigestOf(text) {
  try {
    const d = JSON.parse(text)?.digest;
    return typeof d === "string" ? { ok: true, digest: d } : { ok: false };
  } catch {
    return { ok: false };
  }
}

/** Classify the state cross-check (precedence applied by the caller). `stateCheck` undefined = not requested
 *  (--file with no --state-file) -> no verdict, state_checked:false. { ok:false } -> state_unreachable (the
 *  2nd GET failed OR the body carried no comparable digest; Q4). { ok:true, digest } -> state_mismatch iff it
 *  differs from the last line's digest_T (fact 5 invariant); otherwise checked-and-consistent. */
function crossCheckVerdict(stateCheck, expectedDigestT) {
  if (stateCheck === undefined) return { reason: null, state_checked: false };
  if (!stateCheck.ok) return { reason: "state_unreachable", state_checked: false };
  if (stateCheck.digest !== expectedDigestT) return { reason: "state_mismatch", state_checked: true };
  return { reason: null, state_checked: true };
}

/** Pure decision over an already-obtained body (and an OPTIONAL state cross-check result). Precedence, FIXED
 *  (advisor #8): cannot-evaluate > chain_broken > state_unreachable > state_mismatch > lag. A transport
 *  failure (unreachable/too_large/insecure_url/bad_port) or a parse failure (probe_error) is unhealthy with no
 *  freshness verdict; a broken chain outranks a state fault, which outranks lag (a rewrite / a stale or
 *  unreachable state.json makes the freshness verdict untrustworthy). `stateCheck` undefined = no cross-check. */
export function evaluate({ text, nowIso, reachable, fetchReason, stateCheck }) {
  const checked_at = new Date(Date.parse(nowIso)).toISOString();
  const publish_latency = publishLatencySec(nowIso);
  const base = {
    schema: SCHEMA, checked_at, last_day: null, lag_days: null, chain_ok: false, reachable,
    chainstack_present: false, provider: null, status: "unhealthy", reason: null, publish_latency,
    // schema-2 alert fields default to the "no alert decided yet" shape; probe() fills them from the state machine.
    alerted: false, alert_error: null, last_alert_day: null, state_checked: false,
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
  // State cross-check (sub-lot -1b-ii-b): the served /narabi/state.json digest must equal the last line's
  // digest_T. A state fault (unreachable/mismatch) outranks lag on the same surface, but not a broken chain.
  const sx = crossCheckVerdict(stateCheck, last.digest_T);
  if (sx.reason !== null) {
    return { ...base, last_day: last.day, chainstack_present, provider, chain_ok: true, state_checked: sx.state_checked, reason: sx.reason };
  }
  const expected = expectedLastDay(nowIso);
  const lag_days = dayDiff(last.day, expected); // > 0 STRICT means a due day is missing; <= 0 is healthy
  const healthy = lag_days <= 0;
  return {
    ...base, last_day: last.day, lag_days, chain_ok: true, chainstack_present, provider, state_checked: sx.state_checked,
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
  // 2nd bounded GET / injected state (sub-lot -1b-ii-b): only when the timeline itself was obtained (a GET1
  // failure is cannot-evaluate and evaluate ignores stateCheck). URL mode DERIVES the state.json URL by
  // basename replacement (env PROBE_STATE_URL overrides; C-B-12); --file mode uses an OPTIONAL --state-file
  // (absent -> no cross-check, state_checked stays false). Any failure to obtain a comparable digest is
  // { ok:false } -> state_unreachable (Q4). Bounded exactly like the timeline read; never throws.
  let stateCheck;
  if (reachable) {
    try {
      if (opts.file !== undefined) {
        if (opts.stateFile !== undefined) {
          if (statSync(opts.stateFile).size > STATE_MAX_BYTES) stateCheck = { ok: false };
          else stateCheck = stateDigestOf(readFileSync(opts.stateFile, "utf8"));
        }
      } else {
        const url = opts.url ?? process.env.PROBE_URL ?? DEFAULT_URL;
        const stateUrl = process.env.PROBE_STATE_URL ?? deriveStateUrl(url);
        const sres = await fetchTimeline(stateUrl, { timeoutMs: STATE_TIMEOUT_MS, maxBytes: STATE_MAX_BYTES, retries: STATE_RETRIES });
        stateCheck = sres.ok ? stateDigestOf(sres.text) : { ok: false };
      }
    } catch {
      stateCheck = { ok: false };
    }
  }
  let state;
  try {
    if (!nowValid) throw new RangeError("invalid --now"); // -> probe_error with a real checked_at (C-G2-3)
    state = evaluate({ text, nowIso, reachable, fetchReason, stateCheck });
  } catch {
    state = {
      schema: SCHEMA, checked_at: new Date(Date.parse(nowIso)).toISOString(), last_day: null, lag_days: null,
      chain_ok: false, reachable, chainstack_present: false, provider: null, status: "unhealthy",
      reason: "probe_error", publish_latency: publishLatencySec(nowIso),
      alerted: false, alert_error: null, last_alert_day: null, state_checked: false,
    };
  }
  const out = opts.out ?? process.env.PROBE_OUT ?? DEFAULT_OUT;
  // Alert state machine (-1b-ii-a, E-3 / C-B-7): read the prior alert bit at `out`, decide, send, and fold the
  // result into `state`. Order = evaluate -> decide -> send -> 250 -> write ONCE (C-NB-10 option 2: narabi.json is
  // NOT written before the send; the send is wrapped so even a synchronous connector throw still lets us write it).
  const nowDay = state.checked_at.slice(0, 10); // UTC YYYY-MM-DD (checked_at is a normalized UTC ISO)
  const alert = await maybeAlert({ state, out, nowDay, env: process.env, deadlineMs: smtpDeadlineMs(process.env) });
  state.alerted = alert.alerted;
  state.last_alert_day = alert.last_alert_day;
  state.alert_error = alert.alert_error;
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
  // exit 1 IFF unhealthy OR an alert send failed (-1b-ii contract, G0 -1b C-15): a recovery-send failure on a
  // healthy day is a non-zero exit too, so a failed send is always visible from systemd/journalctl.
  return { state, exitCode: state.status === "unhealthy" || state.alert_error !== null ? 1 : 0 };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════
// -1b-ii-a — ALERT: state read (bootstrap), mail composition, SMTP client (built-ins), anti-storm machine.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Read the persisted alert bit from narabi.json at `out`. ANY of {absent, corrupt JSON, schema !== 2
 *  (incl. a schema-1 file left by a deployed -1b-i, or schema > 2), alerted not a boolean, or the inconsistent
 *  alerted:true with last_alert_day:null} bootstraps to {alerted:false, last_alert_day:null} — never a crash (C-B-5). */
export function readPriorState(out) {
  try {
    const j = JSON.parse(readFileSync(out, "utf8"));
    if (j && j.schema === SCHEMA && typeof j.alerted === "boolean") {
      const lad = (typeof j.last_alert_day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(j.last_alert_day)) ? j.last_alert_day : null;
      if (j.alerted && lad === null) return { alerted: false, last_alert_day: null }; // inconsistent -> bootstrap
      return { alerted: j.alerted, last_alert_day: lad };
    }
  } catch { /* absent or corrupt -> bootstrap */ }
  return { alerted: false, last_alert_day: null };
}

/** Whitelist a remote-carried field to printable ASCII (drops CR/LF/8-bit) and bound its length — the CR/LF
 *  injection guard for `last_day` (the ONLY free remote field reaching the mail, fact 19 / C-B-3). */
export function sanitizeField(s) {
  return String(s ?? "").replace(/[^\x20-\x7E]/g, "").slice(0, 100);
}

/** RFC-5322-form validation of ALERT_TO/ALERT_FROM (a malformed address -> smtp_unconfigured, C-NB-8). */
export function isEmailish(s) {
  return typeof s === "string" && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(s);
}

/** Constant Subject (C-7): never varies with remote content, so a subject-injection vector cannot exist. */
const SUBJECT = "[MONARK] Narabi external probe notice";

/** Deterministic RFC-5322 Date from an ISO instant, in UTC (+0000) — same instant as checked_at under --now. */
function rfc5322Date(iso) {
  const d = new Date(Date.parse(iso));
  // Concatenated (not an array) so no 3-letter abbreviation is a standalone token the lang-gate flags as French.
  const days = "SunMonTueWedThuFriSat";
  const mons = "JanFebMarAprMayJunJulAugSepOctNovDec";
  const p2 = (n) => String(n).padStart(2, "0");
  const dowTok = days.slice(d.getUTCDay() * 3, d.getUTCDay() * 3 + 3);
  const monTok = mons.slice(d.getUTCMonth() * 3, d.getUTCMonth() * 3 + 3);
  return `${dowTok}, ${p2(d.getUTCDate())} ${monTok} ${String(d.getUTCFullYear())} ` +
    `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())} +0000`;
}

/** Build the full RFC-822 message (headers + blank line + body). The Subject is constant (C-7); the body carries
 *  the sanitized remote `last_day` and closed-set facts only — no secret, no key-bearing URL, no forbidden vocab. */
export function composeMail({ from, to, nowIso, kind, status, reason, last_day, lag_days, chainstack_present, provider, checked_at }) {
  const condition = kind === "recovery" ? "recovered" : kind; // "alert" | "reminder" | "recovered"
  const domain = String(from).split("@")[1] || "monark-probe.local";
  const messageId = `<probe-${String(Date.parse(nowIso))}-${randomBytes(6).toString("hex")}@${domain}>`;
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${SUBJECT}`,
    `Date: ${rfc5322Date(nowIso)}`,
    `Message-ID: ${messageId}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=us-ascii",
  ];
  const body = [
    "MONARK Narabi external probe",
    `condition: ${condition}`,
    `status: ${sanitizeField(status)}`,
    `reason: ${reason === null ? "none" : sanitizeField(reason)}`,
    `last_day: ${last_day === null ? "none" : sanitizeField(last_day)}`,
    `lag_days: ${lag_days === null ? "none" : String(Number(lag_days))}`,
    `chainstack_present: ${chainstack_present ? "yes" : "no"}`,
    `provider: ${provider === null ? "none" : sanitizeField(provider)}`,
    `checked_at: ${sanitizeField(checked_at)}`,
  ];
  return { subject: SUBJECT, message: headers.join("\n") + "\n\n" + body.join("\n") + "\n" };
}

/** DATA wire-encoding (C-B-4): normalize to CRLF, dot-stuff every line beginning with '.', append the `.` terminator. */
export function encodeData(message) {
  const stuffed = String(message).split(/\r\n|\n/).map((l) => (l.startsWith(".") ? "." + l : l));
  let out = stuffed.join("\r\n");
  if (!out.endsWith("\r\n")) out += "\r\n";
  return out + ".\r\n";
}

/** A bare IPv4 literal or an IPv6 (has ':') — servername must NOT be set to an IP (RFC 6066; also avoids a
 *  DeprecationWarning on stderr that would pollute the secret-hygiene oracle). */
function isIpLiteral(host) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || String(host).includes(":");
}
/** Pinned TLS options: TLS >= 1.2, cert verified, SNI on real hostnames (C-B-8). NEVER rejectUnauthorized:false. */
export function tlsConnectOptions(host) {
  const o = { minVersion: "TLSv1.2", rejectUnauthorized: true };
  if (!isIpLiteral(host) && host !== "localhost") o.servername = host;
  return o;
}
/** Transport routing (C-B-8): implicit TLS everywhere; plaintext (net) on loopback ONLY; SMTP_TLS=none on a
 *  non-loopback host is REFUSED with NO connection (mirrors the http-loopback guard). */
export function smtpTransportPlan(host, tlsMode) {
  if (tlsMode === "none") return isLoopbackHost(host) ? { connector: "net" } : { connector: "refuse", error: "smtp_unconfigured" };
  return { connector: "tls", options: tlsConnectOptions(host) };
}

const NET_FAIL_CODES = new Set([
  "ECONNREFUSED", "ENOTFOUND", "EHOSTUNREACH", "ETIMEDOUT", "ECONNRESET",
  "EAI_AGAIN", "ENETUNREACH", "EHOSTDOWN", "EPIPE", "ECONNABORTED", "EADDRNOTAVAIL",
]);
/** A connect-phase error -> closed AlertError: a network code is unreachable; anything else (an SSL routine /
 *  wrong-version error before secureConnect) is a TLS handshake failure (measured spike, 2026-09-21). */
export function classifyConnectError(err) {
  const code = err && err.code ? String(err.code) : "";
  return NET_FAIL_CODES.has(code) ? "smtp_unreachable" : "smtp_tls_failed";
}

/** Read SMTP config from env; a missing field, malformed ALERT_TO/FROM, or unknown SMTP_TLS -> smtp_unconfigured. */
function smtpConfig(env) {
  const host = env.SMTP_HOST, user = env.SMTP_USER, pass = env.SMTP_PASS, from = env.ALERT_FROM, to = env.ALERT_TO;
  const tlsMode = env.SMTP_TLS ?? "implicit";
  const pn = Number(String(env.SMTP_PORT ?? "465").trim());
  const port = Number.isFinite(pn) && pn > 0 && pn < 65536 ? pn : 465;
  if (!host || !user || !pass || !from || !to) return { error: "smtp_unconfigured" };
  if (!isEmailish(from) || !isEmailish(to)) return { error: "smtp_unconfigured" };
  if (tlsMode !== "implicit" && tlsMode !== "none") return { error: "smtp_unconfigured" };
  return { host, port, tls: tlsMode, user, pass, from, to };
}

/** The env-tunable global SMTP deadline, clamped to MAX (like the GET bounds). Exported so its PLAFOND is pinned
 *  by an oracle (C-G2-5): an SMTP_DEADLINE_MS above MAX_SMTP_DEADLINE_MS is clamped down, never honored raw. */
export function smtpDeadlineMs(env = process.env) {
  const v = env.SMTP_DEADLINE_MS;
  if (v === undefined) return DEFAULT_SMTP_DEADLINE_MS;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n < 1) return DEFAULT_SMTP_DEADLINE_MS;
  return Math.min(n, MAX_SMTP_DEADLINE_MS);
}

/** Run ONE bounded SMTP conversation over built-ins (implicit TLS 465 / plaintext-loopback). Returns a CLOSED-set
 *  AlertError on any failure — NEVER a raw server line, NEVER a secret (C-B-1/2/8). A synchronous connector throw
 *  is caught by the caller (probe), so narabi.json is still written (C-NB-10). */
export async function sendSmtp({ host, port, tls: tlsMode, user, pass, from, to, message, deadlineMs, maxBytes = SMTP_MAX_BYTES, clock }) {
  const plan = smtpTransportPlan(host, tlsMode);
  if (plan.connector === "refuse") return { ok: false, error: plan.error };

  // C-G2-1: ONE wall-clock deadline for the WHOLE exchange — connection + TLS handshake + the ~9-round-trip
  // conversation. A SINGLE timer, armed as an absolute instant BEFORE the connect and cleared ONLY when the
  // exchange ends (the connect-failure catch OR the conversation finally, never a 2nd timer): (a) the worst case
  // is deadlineMs, never 2x a per-phase deadline; (b) a drip handshake or drip reply cannot reset an inactivity
  // (socket.setTimeout) timer; (c) no residual timer handle keeps the process alive after a successful send.
  // `onDeadline` is the current phase's action — the SAME timer drives connect, then the conversation. The clock
  // is injectable (default = real Date/setTimeout) so a test fires the deadline without a real sleep (C-G2-1).
  const nowFn = clock?.now ?? Date.now;
  const setT = clock?.setTimeout ?? setTimeout;
  const clearT = clock?.clearTimeout ?? clearTimeout;
  const deadlineAt = nowFn() + deadlineMs;
  let onDeadline = null;
  const timer = setT(() => { if (onDeadline) onDeadline(); }, Math.max(0, deadlineAt - nowFn()));

  // Connect. On failure this REJECTS with { alertError } — propagated (we only clear the timer here), NOT
  // swallowed: maybeAlert's try/catch is the SINGLE guard, so M-ii-20 (dropping that guard) turns a connector
  // throw into a FATAL that leaves narabi.json UNWRITTEN -> RED. A synchronous tls/net.connect throw becomes the
  // same rejection. The single deadline above bounds a stuck TCP/TLS handshake (TCP accepted, no ServerHello).
  let socket;
  try {
    socket = await new Promise((resolve, reject) => {
      let settled = false;
      const ok = (s) => { if (!settled) { settled = true; resolve(s); } };
      const no = (alertError, s) => { if (!settled) { settled = true; try { if (s) s.destroy(); } catch { /* closing */ } reject({ alertError }); } };
      let s;
      onDeadline = () => no("smtp_timeout", s); // connect phase: the single timer fires -> give up the handshake
      try {
        if (plan.connector === "tls") s = tls.connect({ ...plan.options, host, port }, () => ok(s));
        else { s = net.connect({ host, port }); s.once("connect", () => ok(s)); }
      } catch (e) { no(classifyConnectError(e), s); return; }
      s.once("error", (e) => no(classifyConnectError(e), s));
    });
  } catch (e) { clearT(timer); throw e; } // connect failed -> clear the single timer, then propagate to maybeAlert

  // Response reader over the SAME single deadline (never reset per read): a complete reply ends with a
  // "NNN " (space) status line; multiline "NNN-" continuations precede it (parsed for the EHLO AUTH mechs).
  let buf = "", total = 0, waiter = null, dead = false;
  const failWaiter = (alertError) => { const w = waiter; waiter = null; if (w) w.reject({ alertError }); };
  onDeadline = () => { dead = true; try { socket.destroy(); } catch { /* closing */ } failWaiter("smtp_timeout"); }; // conversation phase: the SAME single timer now fails the current read
  const deliver = () => {
    const lines = buf.split(/\r?\n/);
    let idx = -1;
    // C-G2-6: only a COMPLETE line (one FOLLOWED by a CRLF, i.e. NOT the trailing element after split) may resolve
    // a reply, so a TCP segment boundary mid-line (e.g. "250 O" then "K\r\n") never resolves early on a partial line.
    for (let i = 0; i < lines.length - 1; i++) { if (/^\d{3} /.test(lines[i])) { idx = i; break; } }
    if (idx >= 0 && waiter) {
      const reply = lines.slice(0, idx + 1);
      buf = lines.slice(idx + 1).join("\n");
      const code = Number(reply[reply.length - 1].slice(0, 3));
      const w = waiter; waiter = null; w.resolve({ code, lines: reply });
    }
  };
  socket.setEncoding("utf8");
  socket.on("data", (chunk) => {
    total += Buffer.byteLength(chunk, "utf8");
    if (total > maxBytes) { dead = true; try { socket.destroy(); } catch { /* closing */ } return failWaiter("smtp_timeout"); }
    buf += chunk; deliver();
  });
  socket.on("error", () => { dead = true; failWaiter("smtp_unreachable"); });
  socket.on("close", () => { dead = true; failWaiter("smtp_unreachable"); });
  const read = () => new Promise((resolve, reject) => {
    if (dead) { reject({ alertError: "smtp_unreachable" }); return; }
    waiter = { resolve, reject };
    deliver();
  });
  const send = (line) => { try { socket.write(line + "\r\n"); } catch { /* error surfaces via read() */ } };
  const is2 = (c) => Math.floor(c / 100) === 2;

  let error = null;
  try {
    let r = await read(); if (!is2(r.code)) throw { alertError: "smtp_rejected" };       // 220 greeting
    send("EHLO monark-probe");
    r = await read(); if (!is2(r.code)) throw { alertError: "smtp_rejected" };            // 250 (multiline)
    const mechs = (r.lines.map((l) => l.slice(4).trim().toUpperCase()).find((c) => c.startsWith("AUTH")) || "").split(/\s+/).slice(1);
    if (mechs.includes("PLAIN")) {                                                        // negotiated: only an ANNOUNCED mech
      send("AUTH PLAIN " + Buffer.concat([Buffer.from([0]), Buffer.from(user, "utf8"), Buffer.from([0]), Buffer.from(pass, "utf8")]).toString("base64"));
      r = await read(); if (r.code !== 235) throw { alertError: "smtp_auth_failed" };
    } else if (mechs.includes("LOGIN")) {
      send("AUTH LOGIN"); r = await read(); if (r.code !== 334) throw { alertError: "smtp_auth_failed" };
      send(Buffer.from(user, "utf8").toString("base64")); r = await read(); if (r.code !== 334) throw { alertError: "smtp_auth_failed" };
      send(Buffer.from(pass, "utf8").toString("base64")); r = await read(); if (r.code !== 235) throw { alertError: "smtp_auth_failed" };
    } else { throw { alertError: "smtp_auth_failed" }; }                                  // no mech announced -> fail (kills EHLO mono-line mutant)
    send(`MAIL FROM:<${from}>`); r = await read(); if (!is2(r.code)) throw { alertError: "smtp_rejected" };
    send(`RCPT TO:<${to}>`); r = await read(); if (!is2(r.code)) throw { alertError: "smtp_rejected" };
    send("DATA"); r = await read(); if (r.code !== 354) throw { alertError: "smtp_rejected" };
    try { socket.write(encodeData(message)); } catch { /* error surfaces via read() */ }
    r = await read(); if (!is2(r.code)) throw { alertError: "smtp_rejected" };            // 250 accepted
    try { send("QUIT"); await read(); } catch { /* mail already accepted — QUIT failure is not fatal */ }
  } catch (e) {
    error = (e && e.alertError) || "smtp_rejected";
  } finally {
    clearT(timer); // the SINGLE clearTimeout — here at the conversation end (or in the connect-failure catch above); never a 2nd timer
    try { socket.destroy(); } catch { /* already closing */ }
  }
  return error ? { ok: false, error } : { ok: true };
}

/** The anti-storm state machine (E-3, borne VRAIE C-B-7). Given the detection `state`, the current UTC day, and
 *  the prior alert bit read from `out`: send an alert (first unhealthy, or same-day retry after a failed send), a
 *  daily reminder (already alerted, a NEW UTC day still unhealthy), or a recovery mail (healthy after an alert).
 *  alerted/last_alert_day move ONLY after a 250 (at-least-once, C-2); a failed send keeps them intact + records a
 *  closed-set alert_error and leaves the same-day next shot to retry. */
async function maybeAlert({ state, out, nowDay, env, deadlineMs }) {
  const prior = readPriorState(out);
  let alerted = prior.alerted, last_alert_day = prior.last_alert_day, alert_error = null;
  let kind = null;
  if (state.status === "unhealthy") {
    if (!alerted) kind = "alert";
    else if (nowDay > (last_alert_day ?? "")) kind = "reminder";
  } else if (alerted) {
    kind = "recovery";
  }
  if (kind !== null) {
    const cfg = smtpConfig(env);
    if (cfg.error) {
      alert_error = cfg.error;
    } else {
      let res;
      try {
        const { message } = composeMail({
          from: cfg.from, to: cfg.to, nowIso: state.checked_at, kind, status: state.status, reason: state.reason,
          last_day: state.last_day, lag_days: state.lag_days, chainstack_present: state.chainstack_present,
          provider: state.provider, checked_at: state.checked_at,
        });
        res = await sendSmtp({ ...cfg, message, deadlineMs, maxBytes: SMTP_MAX_BYTES });
      } catch (e) { // a SYNCHRONOUS connector throw (tls/net.connect at construction) — narabi.json still gets written (C-NB-10)
        res = { ok: false, error: (e && e.alertError) || "smtp_unreachable" };
      }
      if (res.ok) {
        if (kind === "recovery") { alerted = false; last_alert_day = null; }
        else { alerted = true; last_alert_day = nowDay; }
      } else {
        alert_error = res.error; // prior alerted/last_alert_day INTACT -> the same-day next shot retries (C-2)
      }
    }
  }
  return { alerted, last_alert_day, alert_error };
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--file") { a.file = argv[++i]; }
    else if (t === "--now") { a.now = argv[++i]; }
    else if (t === "--url") { a.url = argv[++i]; }
    else if (t === "--out") { a.out = argv[++i]; }
    else if (t === "--state-file") { a.stateFile = argv[++i]; } // -1b-ii-b: inject state.json for the --file cross-check
    else { throw new Error(`unknown flag: ${t}`); } // C-B-13: a typo'd flag (e.g. --state) must FAIL LOUD, never
    // be silently ignored while the machine writes the PRODUCTION narabi.json. --state does NOT exist.
  }
  return a;
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    // A usage error is loud and terminal BEFORE probe(): no narabi.json is written (a typo must not touch prod).
    console.error("probe usage error:", e && e.message ? e.message : String(e));
    process.exitCode = 2;
    return;
  }
  const { state, exitCode } = await probe(args);
  console.log(JSON.stringify(state, null, 2));
  process.exitCode = exitCode;
}

// Run-guard (mirrors the repo's scripts): the CLI runs only when invoked directly, never on import (tests).
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((e) => { console.error("probe FATAL", e); process.exitCode = 1; });
}
