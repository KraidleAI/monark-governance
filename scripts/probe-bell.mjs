// scripts/probe-bell.mjs -- the Bell probe, off Bell's host (G0 BELL-COLLECT-TIMER-1 DC-9, DC-15 and section 13 L-1, L-2; PLAN-P4 C4-2 to
// C4-7, lot 4a). Runs on the former host under the user probe (its unit and timer are lot 4b's). Each run, in this order:
//   1. timeline.jsonl read WHOLE at BELL_PUBLIC_ORIGIN (L-2): one GET vetted by probe-narabi's urlTransportAllowed, no redirect followed,
//      the body bounded by probe-narabi's DEFAULT_MAX_BYTES (too_large past it, never silent);
//   2. the kept copy <state>/bell/timeline.jsonl must be a byte prefix of it (prefix_rewritten); only the lines after it are checked, and
//      those that pass are appended to it (the mirror off Bell's host);
//   3. chain and signature of those lines by this file's OWN code (walkLines) against the COMMITTED keyring (DEFAULT_KEYRING, or --keyring),
//      never against a served key: bell/pubkey.json is never read. The verdict is held equal to walkTimeline of apps/bell/scripts/bell-chain.mjs
//      on the publisher's real output and a corpus of altered lines (bell_probe_chain_verdict_equals_the_readers_on_a_corpus), a module this
//      file never imports (L-1: nothing of apps/bell/scripts/, nothing of apps/bell/src/ but sessions.ts, no node:child_process);
//   4. freshness on the trading calendar (C4-5): the unit due at the latest deadline passed must be covered by a published window; and the
//      calendar-free bound (PXB-20): the last window ends at most CALENDAR_FREE_BOUND_H before the run, a bound read here, never in sessions.ts;
//   5. the legacy origin (compareOrigins, tuyau T-o3) and the site's /api/v1/status.json (tuyau T-s2), absent without an alert, against the head;
//   6. (lot 4b, BELL-PROBE-SERVED-STATE-CHECK-1) the served state as bell-verify.mjs:105-112 checks it: each new publication's two immutables
//      read at BELL_PUBLIC_ORIGIN, hashed to their names and their envelopes bound to the line (a line is kept only with them, mirrored under
//      bell/states/ and bell/provenance/), a new line kept in its canonical bytes only, and the current state.json and provenance.json bound to
//      the head whenever the served timeline walks whole, a catch-up included (one reread on a difference, its extension walked first);
//   7. (lot 4b, tuyau T-q) the OpenTimestamps step of scripts/probe-bell-ots.mjs over the kept copy on disk: each line stamped once, a pending
//      proof upgraded at the following runs, under bell/ots/ with its append-only registry.
// THE HEAD is the last publication line, as the reader's (walkTimeline of bell-chain.mjs, head_seq of bell-verify.mjs): bell.json's head_seq and
// head_line_hash, the mail's head_seq and the hash the site status is compared with; a key line after the last publication moves none of them.
// The head and the freshness read every new line that walks; kept_lines counts the mirror, which waits for the immutables of a line.
// CONTRACT: bell.json (BELL_PROBE_KEYS), the kept copy, its immutables and the OpenTimestamps files, under --state, each written atomically (a
// temporary file, fsync, rename, fsync of the directory; PROBE_FS). One mail through probe-narabi's sendSmtp on the transition to unhealthy, once a UTC day while it lasts, and on recovery, at
// most one a run; SMTP_PASS is read from its 0600 file when a mail is sent, never from the environment (DOJO-PROBE-UID-BOUNDARY-1). EXIT: 0
// healthy and no failed mail; 1 unhealthy, a failed mail or a write refused; 2 usage error, nothing written. The entry point runProbe takes the
// clock and the transport (fetch, for the origins and the calendars; sendSmtp) as its only dependencies: no option and no variable changes an origin or the clock.
import { createHash, createPublicKey, randomBytes, verify } from "node:crypto";
import { closeSync, constants, existsSync, fstatSync, fsyncSync, mkdirSync, openSync, readFileSync, readSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BELL_COLLECT_SLOTS_UTC, BELL_LEGACY_ORIGIN, BELL_PUBLIC_ORIGIN, BELL_PUBLISH_TIMEOUT_START_SEC, TICK_TIMEOUT_START_SEC, UNIT_DUE_MARGIN_MIN } from "./bell-deploy.mjs";
import { DEFAULT_MAX_BYTES, MAX_SMTP_DEADLINE_MS, SMTP_MAX_BYTES, isEmailish, sanitizeField, sendSmtp, smtpDeadlineMs, urlTransportAllowed } from "./probe-narabi.mjs";
import { CALENDAR_RANGE, PRE_OPEN, earliestPublishUtc, etWallClockToUtcMs, isTradingDay, nextTradingDay, refCloseDateOf } from "../apps/bell/src/sessions.ts";
import { OTS_MAX_STAMPS, OTS_MAX_UPGRADES, OTS_TIMEOUT_MS, otsRun } from "./probe-bell-ots.mjs";
export { OTS_AGGREGATORS, OTS_M, OTS_MAX_STAMPS, OTS_MAX_UPGRADES, OTS_PENDING_STALE_H, OTS_TIMEOUT_MS, OTS_UNSTAMPED_ALERT_H, isComplete, manifestOf, readProof, whitelisted,
  writeProof } from "./probe-bell-ots.mjs";

/** bell.json schema version. */
export const SCHEMA = 1;
/** The committed keyring, the probe's only trust root (redeployed with the tree at each rotation, DC-8), at its repository path. */
export const DEFAULT_KEYRING = fileURLToPath(new URL("../apps/bell/keys/bell-keyring.json", import.meta.url));
/** The SMTP password, one line in a file of the user probe only (mode 0600), read when a mail is sent. */
export const DEFAULT_SMTP_PASS_FILE = "/etc/monark/bell-probe-smtp-pass";
export const SMTP_PASS_MAX_BYTES = 1024;
/** The tree of the probe on its host: the static import closure of this file, plus the committed keyring. Byte order. */
export const BELL_PROBE_TREE_ROOT = "/opt/monark-bell-probe";
export const BELL_PROBE_TREE_PATHS = Object.freeze(["apps/bell/keys/bell-keyring.json", "apps/bell/src/sessions.ts", "scripts/bell-deploy.mjs",
  "scripts/probe-bell-ots.mjs", "scripts/probe-bell.mjs", "scripts/probe-narabi.mjs"]);
// Bounds (value + motive). FRESHNESS_MARGIN_MIN 10 min past the slot, the tick and the publication (C4-5, proposed); CALENDAR_FREE_BOUND_H
// 120 h (PXB-20: the longest legitimate gap of 2025-2026 is about four days, a Friday closure then the weekend); SITE_STATUS_LAG_MIN 15 min
// (the site's ARCHI, proposed); GET_TIMEOUT_MS 30 s per GET (bell-verify's TIMEOUT_MS); MAX_LINE_BYTES 1 MiB (the publisher's MAX_LINE_BYTES,
// bell-validate.mjs BOUNDS); SITE_STATUS_MAX_BYTES 64 KiB (status.json is one small envelope); BELL_PROBE_MAX_NEW_PUBLICATIONS 4 a run
// (their immutables read; the next ones wait for the next run: one or two publications a day, four runs).
export const FRESHNESS_MARGIN_MIN = 10;
export const CALENDAR_FREE_BOUND_H = 120;
export const SITE_STATUS_LAG_MIN = 15;
export const GET_TIMEOUT_MS = 30_000;
export const MAX_LINE_BYTES = 1024 * 1024;
export const SITE_STATUS_MAX_BYTES = 64 * 1024;
export const BELL_PROBE_MAX_NEW_PUBLICATIONS = 4;
/** The worst run, every term a bound of this code: GETs of GET_TIMEOUT_MS (the timeline; the legacy origin's two reads and their reread; the
 *  site status; state.json and provenance.json, then their reread with the timeline; two immutables per new publication), the stamps (four
 *  parallel calendar calls under one timer each) and the upgrade calls of OTS_TIMEOUT_MS, the mail's MAX_SMTP_DEADLINE_MS. The
 *  unit's TimeoutStartSec is this plus a margin (bell_probe_unit_is_hardened_and_never_on_bell_host). */
export const BELL_PROBE_WORST_RUN_MS = (1 + 4 + 1 + 5 + 2 * BELL_PROBE_MAX_NEW_PUBLICATIONS) * GET_TIMEOUT_MS + (OTS_MAX_STAMPS + OTS_MAX_UPGRADES) * OTS_TIMEOUT_MS + MAX_SMTP_DEADLINE_MS;
/** The closed alert names: the read's, the chain's (bell-verify's names, so the differential compares reasons), the calendar's, the two origins', the site status', the run's. */
export const BELL_PROBE_ALERTS = Object.freeze(["probe_error", "secret_in_environment", "keyring_invalid", "insecure_url", "bad_port", "redirect",
  "http_status", "unreachable", "timeout", "too_large", "prefix_rewritten", "timeline_malformed", "chain_broken", "rotation_key_not_in_keyring",
  "key_not_in_keyring", "signature_invalid", "key_not_active", "rotation_malformed", "revocation_malformed", "head_signed_by_revoked_key", "stale",
  "calendar_free_bound", "legacy_origin_differs", "legacy_origin_redirect", "legacy_origin_unreachable", "site_status_behind", "site_status_error",
  "write_refused", "immutable_mismatch", "envelope_mismatch", "bell_sha_mismatch", "state_not_bound_by_head", "ots_unstamped", "ots_op_unsupported", "ots_pending_stale"]);
/** The closed keys of bell.json, in their order. */
export const BELL_PROBE_KEYS = Object.freeze(["schema", "checked_at", "status", "alerts", "served_lines", "kept_lines", "new_lines", "head_seq",
  "head_line_hash", "last_window_end_utc", "due_unit", "due_by_utc", "legacy_origin", "site_status", "site_status_since", "alerted", "alert_error",
  "last_alert_day", "ots"]);

const HEX64 = /^[0-9a-f]{64}$/, DAY = /^\d{4}-\d{2}-\d{2}$/, GENESIS = "0".repeat(64), HOUR_MS = 3_600_000, DAY_MS = 86_400_000;
const sha256Hex = (b) => createHash("sha256").update(b).digest("hex");

// ---- the chain and the key schedule, this file's own code (ADR-T1b-backend v2 D6, D9; checkpoint-1 C-9) ----
/** Canonical JSON, the form a timeline line is hashed and signed in: object keys sorted, no whitespace, finite numbers only. */
export function canonicalOf(v) {
  if (Array.isArray(v)) return `[${v.map(canonicalOf).join(",")}]`;
  if (v !== null && typeof v === "object") return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonicalOf(v[k])}`).join(",")}}`;
  if (typeof v === "number" && !Number.isFinite(v)) throw new Error("bell probe: a non-finite number");
  return JSON.stringify(v);
}
/** line_hash = sha256 of the canonical line; the next line carries it as prev_line_hash. */
export const lineHashOf = (line) => sha256Hex(canonicalOf(line));
const KINDS = new Set(["publication", "key_rotation", "key_revocation"]);
const jwkOk = (j) => j !== null && typeof j === "object" && j.kty === "OKP" && j.crv === "Ed25519" && typeof j.x === "string";
const keyOf = (x) => createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x }, format: "jwk" });
/** key_id of a JWK: the sha256 hex of its 32 raw public bytes; null when it is no Ed25519 public key. */
function keyIdOf(jwk) {
  try {
    const k = keyOf(jwk.x), raw = Buffer.from(k.export({ format: "jwk" }).x ?? "", "base64url");
    return k.asymmetricKeyType === "ed25519" && raw.length === 32 ? sha256Hex(raw) : null;
  } catch { return null; }
}
/** `sig`: a canonical base64url Ed25519 signature of the line without sig and sig_new, under the public key `x`. */
function signedBy(line, sig, x) {
  if (typeof sig !== "string") return false;
  const raw = Buffer.from(sig, "base64url"), body = { ...line };
  if (raw.length !== 64 || raw.toString("base64url") !== sig) return false;
  delete body.sig;
  delete body.sig_new;
  return verify(null, Buffer.from(canonicalOf(body), "utf8"), keyOf(x), raw);
}
/** The trust set of a bell-keyring-v1: key_id -> {x, revoked_from_seq?}; null when malformed (a key_id that is not the sha256 of its key, a
 *  duplicate, no key, a revocation marker that is not an integer from 1, or a key marked revoked without one). */
export function trustOf(keyring) {
  if (keyring === null || typeof keyring !== "object" || keyring.schema !== "bell-keyring-v1" || !Array.isArray(keyring.keys) || keyring.keys.length === 0) return null;
  const trust = new Map();
  for (const k of keyring.keys) {
    const id = jwkOk(k?.jwk) ? keyIdOf(k.jwk) : null, from = k?.revoked_from_seq;
    if (id === null || id !== k.key_id || trust.has(id)) return null;
    if (from !== undefined ? !(Number.isInteger(from) && from >= 1) : k.status === "revoked") return null;
    trust.set(id, from === undefined ? { x: k.jwk.x } : { x: k.jwk.x, revoked_from_seq: from });
  }
  return trust;
}
/** Walk a bell-timeline-v1 under `trust`, checking the lines from index `from` on (the earlier ones, already checked and kept, only carry the
 *  schedule): line n has the schema, seq n, kind, the prev_line_hash of line n-1 (GENESIS first), a signer in the trust set and its signature.
 *  The first signer is active; a publication or a revocation is signed by the active key; a key_rotation names a trusted new key and carries
 *  sig_new under it, signed by the active key, or by the new key alone when `continuity: "broken"` (reported in `breaks`); the new key is then
 *  active. A key_revocation names a former key and a revoked_from_seq in [1, its seq]; lines signed by a key revoked at their seq are `voided`.
 *  Returns {ok: true, active, head, voided, breaks} (head: the last publication line or null) or {ok: false, seq, reason}. */
export function walkLines(lines, trust, from = 0) {
  let prev = GENESIS, active = null;
  const revoked = new Map([...trust].filter(([, k]) => k.revoked_from_seq !== undefined).map(([id, k]) => [id, k.revoked_from_seq]));
  const breaks = [], former = new Set();
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], seq = i + 1, check = i >= from, fail = (reason) => ({ ok: false, seq, reason });
    if (check && (l === null || typeof l !== "object" || l.schema !== "bell-timeline-v1" || l.seq !== seq || !KINDS.has(l.kind))) return fail("timeline_malformed");
    if (check && l.prev_line_hash !== prev) return fail("chain_broken");
    const rot = l.kind === "key_rotation", broken = rot && l.continuity === "broken", k = trust.get(l.key_id);
    if (check && rot && !trust.has(l.new_key_id)) return fail("rotation_key_not_in_keyring");
    if (check && k === undefined) return fail("key_not_in_keyring");
    if (check && !signedBy(l, l.sig, k.x)) return fail("signature_invalid");
    if (i === 0) active = l.key_id;
    if (check && (broken ? l.key_id !== l.new_key_id : l.key_id !== active)) return fail("key_not_active");
    if (rot) {
      const bad = !(l.continuity === undefined || broken) || !jwkOk(l.new_key) || l.new_key.x !== trust.get(l.new_key_id)?.x || l.new_key_id === active || former.has(l.new_key_id);
      if (check && bad) return fail("rotation_malformed");
      if (check && !signedBy(l, l.sig_new, l.new_key.x)) return fail("signature_invalid");
      if (broken) breaks.push({ seq, lost_key_id: active, new_key_id: l.new_key_id });
      former.add(active);
      active = l.new_key_id;
    }
    if (l.kind === "key_revocation") {
      const r = l.revoked_key_id, f = l.revoked_from_seq;
      if (check && (!former.has(r) || !Number.isInteger(f) || f < 1 || f > seq)) return fail("revocation_malformed");
      revoked.set(r, Math.min(revoked.get(r) ?? f, f));
    }
    prev = lineHashOf(l);
  }
  const pubs = lines.filter((l) => l.kind === "publication");
  return { ok: true, active, head: pubs[pubs.length - 1] ?? null, voided: lines.filter((l) => l.seq >= (revoked.get(l.key_id) ?? Infinity)).map((l) => l.seq), breaks };
}

// ---- freshness on the trading calendar (C4-5) and the calendar-free bound (PXB-20) ----
const SESSIONS = ["pre", "regular", "after", "overnight-weekday", "weekend", "holiday"];
const preOpenUtc = (d) => { const [y = 0, mo = 1, dd = 1] = d.split("-").map(Number); return etWallClockToUtcMs(y, mo, dd, Math.floor(PRE_OPEN / 60), PRE_OPEN % 60, 0); };
/** The end of unit U(d): 04:00 ET of the next trading day (apps/bell/src/plan.ts unitOf, never imported). */
export const unitEndOf = (d) => preOpenUtc(nextTradingDay(d));
/** The instant U(d) is due, computed as planUnit does (plan.ts dueInstant, l.37-41): its end plus the margin, or the latest publication
 *  gate of its sessions when later. Equal on the whole committed calendar (bell_probe_due_instant_is_the_planners_on_the_whole_calendar). */
export const dueInstantOf = (d) => Math.max(unitEndOf(d) + UNIT_DUE_MARGIN_MIN * 60_000, ...SESSIONS.map((s) => earliestPublishUtc(refCloseDateOf(s, d))));
// LIMIT (C4-5 kept, item BELL-PROBE-CYCLE-STRADDLE-1): a slot the tick refuses (cycle_boundary_straddle, tick.ts cyclesOf) publishes past this.
/** The instant U(d) must be published by: the first collection slot at or after its due instant, plus the tick's and the publisher's
 *  TimeoutStartSec, plus FRESHNESS_MARGIN_MIN. */
export function deadlineOf(d) {
  const due = dueInstantOf(d), day = new Date(due).toISOString().slice(0, 10);
  const slots = [0, 1].flatMap((k) => BELL_COLLECT_SLOTS_UTC.map((s) => Date.parse(`${new Date(Date.parse(day) + k * DAY_MS).toISOString().slice(0, 10)}T${s}:00Z`)));
  return Math.min(...slots.filter((t) => t >= due)) + (TICK_TIMEOUT_START_SEC + BELL_PUBLISH_TIMEOUT_START_SEC) * 1000 + FRESHNESS_MARGIN_MIN * 60_000;
}
/** At `nowMs`, with `lastEnd` the latest to_utc_ms of a published window (null: none): the unit due at the latest deadline passed (a trading
 *  day of the committed calendar whose next trading day is in it too), stale when that unit is not covered (a run's window of U(d) ends at
 *  its end minus 1 s, apps/bell/src/tick.ts:350), and the calendar-free bound, which reads no calendar. */
export function freshnessOf(nowMs, lastEnd) {
  let due = null;
  for (let t = Math.min(nowMs + DAY_MS, Date.parse(`${CALENDAR_RANGE.toISO}T12:00:00Z`)), k = 0; k < 15 && due === null; k++, t -= DAY_MS) {
    const d = new Date(t).toISOString().slice(0, 10);
    if (d >= CALENDAR_RANGE.fromISO && isTradingDay(d) && nextTradingDay(d) <= CALENDAR_RANGE.toISO && deadlineOf(d) <= nowMs) due = d;
  }
  const stale = lastEnd === null || (due !== null && lastEnd < unitEndOf(due) - 1000);
  const bound = lastEnd === null || nowMs - lastEnd > CALENDAR_FREE_BOUND_H * HOUR_MS;
  return { due_unit: due, due_by_utc: due === null ? null : new Date(deadlineOf(due)).toISOString(), stale, bound };
}
/** The latest to_utc_ms of the windows of the publication lines. */
const lastWindowEnd = (lines) => lines.filter((l) => l.kind === "publication" && Array.isArray(l.runs)).flatMap((l) => l.runs.map((r) => r?.window?.to_utc_ms))
  .filter((t) => Number.isSafeInteger(t)).reduce((m, t) => (m === null || t > m ? t : m), null);

// ---- the transport ----
/** A bounded GET over `fetchFn` (a fetch): probe-narabi's transport policy first, no redirect followed, 200 only, the body bounded by
 *  `maxBytes`, one timer of GET_TIMEOUT_MS. Resolves {ok: true, body} or {ok: false, reason, status}. */
export function httpTransport(fetchFn) {
  return async (url, maxBytes = DEFAULT_MAX_BYTES) => {
    const vetted = urlTransportAllowed(url);
    if (!vetted.ok) return { ok: false, reason: vetted.reason, status: null };
    const ctl = new AbortController(), timer = setTimeout(() => { ctl.abort(); }, GET_TIMEOUT_MS);
    try {
      const res = await fetchFn(url, { redirect: "manual", signal: ctl.signal });
      const done = (reason) => { res.body?.cancel().catch(() => undefined); return { ok: false, reason, status: res.status }; };
      if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) return done("redirect");
      if (res.status !== 200 || res.body === null) return done("http_status");
      const chunks = [];
      let n = 0;
      for await (const c of res.body) { n += c.length; if (n > maxBytes) return { ok: false, reason: "too_large", status: 200 }; chunks.push(c); }
      return { ok: true, body: Buffer.concat(chunks), status: 200 };
    } catch { return { ok: false, reason: ctl.signal.aborted ? "timeout" : "unreachable", status: null }; } finally { clearTimeout(timer); }
  };
}
/** Tuyau T-o3 (Q-15): the legacy origin serves timeline.jsonl byte for byte as the public one, in 200. Equal origins: nothing compared, said.
 *  A difference reads both once more (a publication between two GETs). Pure: the two origins and the transport are its parameters. */
export async function compareOrigins(publicOrigin, legacyOrigin, transport) {
  if (publicOrigin === legacyOrigin) return { verdict: "same as the public origin", alert: null };
  for (let attempt = 0; ; attempt++) {
    const p = await transport(`${publicOrigin}/timeline.jsonl`), l = await transport(`${legacyOrigin}/timeline.jsonl`);
    if (!l.ok) return { verdict: l.reason, alert: l.reason === "redirect" ? "legacy_origin_redirect" : "legacy_origin_unreachable" };
    if (!p.ok) return { verdict: "public origin unread", alert: null }; // the public read names its own fault
    if (p.body.equals(l.body)) return { verdict: "same bytes", alert: null };
    if (attempt > 0) return { verdict: "differs", alert: "legacy_origin_differs" };
  }
}
/** Tuyau T-s2: 404 is "site not served", no alert; 200 compares source.line_hash with the head's (the last publication), an alert past
 *  SITE_STATUS_LAG_MIN after the first run that saw it differ (`since`, kept in bell.json), none at it; any other answer is an alert. */
async function siteStatusOf(get, headHash, since, nowMs, checkedAt) {
  const r = await get(`${BELL_PUBLIC_ORIGIN}/api/v1/status.json`, SITE_STATUS_MAX_BYTES);
  if (!r.ok && r.reason === "http_status" && r.status === 404) return { site_status: "not_served", site_status_since: null, alert: null };
  let lh = null;
  try { lh = r.ok ? JSON.parse(r.body.toString("utf8"))?.source?.line_hash : null; } catch { lh = null; }
  if (typeof lh !== "string" || !HEX64.test(lh)) return { site_status: "error", site_status_since: null, alert: "site_status_error" };
  if (lh === headHash) return { site_status: "in_step", site_status_since: null, alert: null };
  const first = since ?? checkedAt;
  return { site_status: "differs", site_status_since: first, alert: nowMs - Date.parse(first) > SITE_STATUS_LAG_MIN * 60_000 ? "site_status_behind" : null };
}
/** The envelopes of a publication's immutables against its line (bell-verify.mjs checkPublication): schema, seq, published_at and runs of
 *  both, each run's bell_sha, window and the provenance's bellSha, each bell_sha the sha256 of its digest; null when they hold. */
function envelopeOf(line, sBuf, pBuf) {
  try {
    const s = JSON.parse(sBuf.toString("utf8")), p = JSON.parse(pBuf.toString("utf8"));
    const ok = (e, schema) => e !== null && typeof e === "object" && e.schema === schema && e.seq === line.seq && e.published_at === line.published_at
      && Array.isArray(e.runs) && e.runs.length === line.runs.length;
    if (!ok(s, "bell-public-state-v1") || !ok(p, "bell-public-provenance-v1")) return "envelope_mismatch";
    for (const [i, r] of s.runs.entries()) {
      if (r?.bell_sha !== line.runs[i]?.bell_sha || p.runs[i]?.bellSha !== r.bell_sha || canonicalOf(r.window) !== canonicalOf(line.runs[i].window)) return "envelope_mismatch";
      if (sha256Hex(canonicalOf(r.digest)) !== r.bell_sha) return "bell_sha_mismatch";
    }
    return null;
  } catch { return "envelope_mismatch"; }
}
/** The two immutables of each publication among the new lines `lines`, at most BELL_PROBE_MAX_NEW_PUBLICATIONS, read at BELL_PUBLIC_ORIGIN as
 *  bell-verify.mjs:105-112 reads them (64-hex names and runs an array, else timeline_malformed; a GET that fails, named as the transport names
 *  it; bytes hashed to their names, else immutable_mismatch; envelopes, envelopeOf). Resolves {good: the lines before the first that fails or
 *  past the bound, files, alert}. */
async function immutablesOf(get, lines) {
  const files = new Map();
  for (let i = 0, pubs = 0; i < lines.length; i++) {
    const l = lines[i], at = (alert) => ({ good: i, files, alert });
    if (l.kind !== "publication") continue;
    if (!HEX64.test(l.state_sha256) || !HEX64.test(l.provenance_sha256) || !Array.isArray(l.runs)) return at("timeline_malformed");
    if (++pubs > BELL_PROBE_MAX_NEW_PUBLICATIONS) return at(null);
    const s = await get(`${BELL_PUBLIC_ORIGIN}/states/${l.state_sha256}.json`), p = await get(`${BELL_PUBLIC_ORIGIN}/provenance/${l.provenance_sha256}.json`);
    if (!s.ok || !p.ok) return at((s.ok ? p : s).reason);
    if (sha256Hex(s.body) !== l.state_sha256 || sha256Hex(p.body) !== l.provenance_sha256) return at("immutable_mismatch");
    const why = envelopeOf(l, s.body, p.body);
    if (why !== null) return at(why);
    files.set(`states/${l.state_sha256}.json`, s.body).set(`provenance/${l.provenance_sha256}.json`, p.body);
  }
  return { good: lines.length, files, alert: null };
}
/** bell-verify.mjs:107-108: the served state.json and provenance.json are the head's (a GET that fails, named as the transport names it). On
 *  a difference they are read once more with the timeline, which must extend the body read first (`body`, its lines `seen`); the extension
 *  is walked under `trust` after them, and only a walk that holds makes its last publication the head (one published between two GETs). */
async function headBoundOf(get, head, body, seen, trust) {
  for (let attempt = 0, h = head; ; attempt++) {
    const s = await get(`${BELL_PUBLIC_ORIGIN}/state.json`), p = await get(`${BELL_PUBLIC_ORIGIN}/provenance.json`);
    if (!s.ok || !p.ok) return (s.ok ? p : s).reason;
    if (sha256Hex(s.body) === h.state_sha256 && sha256Hex(p.body) === h.provenance_sha256) return null;
    if (attempt > 0) return "state_not_bound_by_head";
    const t = await get(`${BELL_PUBLIC_ORIGIN}/timeline.jsonl`), x = t.ok && t.body.subarray(0, body.length).equals(body) ? linesOf(t.body.subarray(body.length)) : null;
    const w = x === null || x.torn ? null : walkLines([...seen, ...x.parsed], trust, seen.length);
    h = w?.ok === true ? (w.head ?? head) : head;
  }
}

// ---- the run ----
/** The LF-terminated lines of `buf`: each raw line (its LF included) and its parse (null: not JSON, or past MAX_LINE_BYTES); `torn` when the
 *  last bytes carry no final LF (they are dropped). */
function linesOf(buf) {
  const raws = [];
  for (let s = 0, i = buf.indexOf(10); i >= 0; s = i + 1, i = buf.indexOf(10, s)) raws.push(buf.subarray(s, i + 1));
  const parsed = raws.map((b) => { if (b.length > MAX_LINE_BYTES) return null; try { return JSON.parse(b.toString("utf8")); } catch { return null; } });
  return { raws, parsed, torn: raws.reduce((n, b) => n + b.length, 0) !== buf.length };
}
/** Steps 1 to 6 on the report `r`; returns the new kept copy (null when it is unchanged) and the immutables it names, to write first. */
async function check(r, a, nowMs, prior, get, keptPath) {
  if (process.env.SMTP_PASS !== undefined) r.alerts.push("secret_in_environment");
  let trust = null;
  try { trust = trustOf(JSON.parse(readFileSync(a.keyring ?? DEFAULT_KEYRING, "utf8"))); } catch { trust = null; }
  if (trust === null) { r.alerts.push("keyring_invalid"); return { keep: null, files: new Map() }; }
  const kept = existsSync(keptPath) ? readFileSync(keptPath) : Buffer.alloc(0), k = linesOf(kept);
  if (k.torn || k.parsed.includes(null)) throw new Error("bell probe: the kept copy does not parse");
  let lines = k.parsed, keep = null, files = new Map(), seen = null;
  const got = await get(`${BELL_PUBLIC_ORIGIN}/timeline.jsonl`);
  if (!got.ok) r.alerts.push(got.reason);
  else if (got.body.length < kept.length || !got.body.subarray(0, kept.length).equals(kept)) r.alerts.push("prefix_rewritten");
  else {
    const n = linesOf(got.body.subarray(kept.length)), w = walkLines([...k.parsed, ...n.parsed], trust, k.parsed.length);
    let good = w.ok ? n.parsed.length : w.seq - 1 - k.parsed.length;
    if (n.torn) r.alerts.push("timeline_malformed");
    if (!w.ok) r.alerts.push((n.raws[w.seq - 1 - k.parsed.length]?.length ?? 0) > MAX_LINE_BYTES ? "too_large" : w.reason); // bell-verify.mjs:90, for the line where the walk fails (the reader names any too-long line first)
    else if (w.head !== null && w.voided.includes(w.head.seq)) r.alerts.push("head_signed_by_revoked_key");
    // A new line is kept in its canonical bytes only, the ones its line_hash names and the anchor tool hashes (anchor-bell-timeline.mjs l.28,
    // l.41: no CR, the canonical form; a CR is never canonical), so that the manifest the probe stamps is the operator's.
    const odd = n.raws.slice(0, good).findIndex((b, i) => sha256Hex(b.subarray(0, -1)) !== lineHashOf(n.parsed[i]));
    if (odd >= 0) { r.alerts.push("timeline_malformed"); good = odd; }
    // The head and the freshness read every line that walks; the mirror keeps those whose immutables are read (the ones past
    // BELL_PROBE_MAX_NEW_PUBLICATIONS wait for the next run, with no alert: a catch-up rings nothing). The head is bound to state.json
    // whenever the whole served timeline walks, a catch-up included.
    lines = [...k.parsed, ...n.parsed.slice(0, good)];
    const imm = await immutablesOf(get, n.parsed.slice(0, good));
    if (imm.alert !== null) r.alerts.push(imm.alert);
    [good, files, seen] = [imm.good, imm.files, w.ok && !n.torn && odd < 0 ? [...k.parsed, ...n.parsed] : null];
    Object.assign(r, { served_lines: k.parsed.length + n.parsed.length, new_lines: good, kept_lines: k.parsed.length + good });
    if (good > 0) keep = Buffer.concat([kept, ...n.raws.slice(0, good)]);
  }
  const head = lines.filter((l) => l.kind === "publication").at(-1) ?? null, lastEnd = lastWindowEnd(lines), f = freshnessOf(nowMs, lastEnd);
  Object.assign(r, { kept_lines: r.kept_lines ?? k.parsed.length, head_seq: head?.seq ?? null, head_line_hash: head === null ? null : lineHashOf(head),
    last_window_end_utc: lastEnd === null ? null : new Date(lastEnd).toISOString(), due_unit: f.due_unit, due_by_utc: f.due_by_utc });
  if (f.stale) r.alerts.push("stale");
  if (f.bound) r.alerts.push("calendar_free_bound");
  const legacy = await compareOrigins(BELL_PUBLIC_ORIGIN, BELL_LEGACY_ORIGIN, get);
  r.legacy_origin = legacy.verdict;
  if (legacy.alert !== null) r.alerts.push(legacy.alert);
  if (got.ok && head !== null) {
    const s = await siteStatusOf(get, r.head_line_hash, prior.site_status_since, nowMs, r.checked_at);
    Object.assign(r, { site_status: s.site_status, site_status_since: s.site_status_since });
    if (s.alert !== null) r.alerts.push(s.alert);
  }
  const bound = seen !== null && head !== null ? await headBoundOf(get, head, got.body, seen, trust) : null;
  if (bound !== null) r.alerts.push(bound);
  return { keep, files };
}

/** The prior alert bit, the site status' first difference and the last seq asked an upgrade (ots.upgrade_after_seq), read back from
 *  bell.json; anything but a record of this schema reads as none. */
function priorOf(path) {
  try {
    const j = JSON.parse(readFileSync(path, "utf8")), day = typeof j?.last_alert_day === "string" && DAY.test(j.last_alert_day) ? j.last_alert_day : null;
    const since = typeof j?.site_status_since === "string" && !Number.isNaN(Date.parse(j.site_status_since)) ? j.site_status_since : null;
    const after = Number.isSafeInteger(j?.ots?.upgrade_after_seq) && j.ots.upgrade_after_seq > 0 ? j.ots.upgrade_after_seq : 0;
    if (j?.schema === SCHEMA && typeof j.alerted === "boolean" && (!j.alerted || day !== null)) return { alerted: j.alerted, last_alert_day: day, site_status_since: since, ots_after: after };
  } catch { /* absent or corrupt */ }
  return { alerted: false, last_alert_day: null, site_status_since: null, ots_after: 0 };
}
/** The SMTP password at `path`, or null: a regular file reached without following a final symbolic link (O_NOFOLLOW, absent on win32), never
 *  waited on, at most SMTP_PASS_MAX_BYTES read in one go, one non-empty line of UTF-8 without a BOM (its final newline dropped), and on POSIX
 *  readable by its owner only. The rule of readSmtpPass of probe-dojo-live.mjs, written here: that module imports node:child_process (L-1). */
export function readSmtpPass(path) {
  let fd = null;
  try {
    fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
    const st = fstatSync(fd), buf = Buffer.alloc(SMTP_PASS_MAX_BYTES + 1);
    if (!st.isFile() || st.size > SMTP_PASS_MAX_BYTES || (process.platform !== "win32" && (st.mode & 0o077) !== 0)) return null;
    const n = readSync(fd, buf, 0, buf.length, 0);
    if (n !== st.size) return null;
    const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(buf.subarray(0, n)).replace(/\r?\n$/, "");
    return /^[^\r\n\0\uFEFF]+$/.test(text) ? text : null;
  } catch { return null; } finally { if (fd !== null) closeSync(fd); }
}
/** The mail configuration of the environment (the keys of probe-narabi's smtpConfig but SMTP_PASS); null = unconfigured. */
function mailConfigOf(env) {
  const host = env.SMTP_HOST, user = env.SMTP_USER, from = env.ALERT_FROM, to = env.ALERT_TO, tls = env.SMTP_TLS ?? "implicit";
  const pn = Number(String(env.SMTP_PORT ?? "465").trim()), port = Number.isFinite(pn) && pn > 0 && pn < 65536 ? pn : 465;
  if (!host || !user || !isEmailish(from) || !isEmailish(to) || !["implicit", "none"].includes(tls)) return null;
  return { host, port, tls, user, from, to };
}
const SUBJECT = "[MONARK] Bell probe notice";
/** The mail: a constant subject, a UTC date, and closed-set facts of the report only (no URL, no address, no server line). */
export function composeBellMail({ from, to, kind, report }) {
  const t = Date.parse(report.checked_at), f = (v) => (v === null ? "none" : sanitizeField(v));
  const head = [`From: ${from}`, `To: ${to}`, `Subject: ${SUBJECT}`, `Date: ${new Date(t).toUTCString().replace(/GMT$/, "+0000")}`,
    `Message-ID: <bell-probe-${String(t)}-${randomBytes(6).toString("hex")}@${String(from).split("@")[1] ?? "monark-probe.local"}>`, "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=us-ascii"];
  const body = ["MONARK Bell probe of the served timeline", `condition: ${kind === "recovery" ? "recovered" : kind}`, `status: ${f(report.status)}`,
    `alerts: ${report.alerts.length === 0 ? "none" : report.alerts.filter((x) => BELL_PROBE_ALERTS.includes(x)).join(" ")}`, `head_seq: ${f(report.head_seq)}`,
    `due_unit: ${f(report.due_unit)}`, `checked_at: ${f(report.checked_at)}`];
  return `${head.join("\n")}\n\n${body.join("\n")}\n`;
}
/** The anti-storm machine of probe-narabi.mjs: an alert on the transition to unhealthy, a reminder on a new UTC day still unhealthy, a
 *  recovery mail when healthy after an alert; the bit moves only after a delivered mail (a failure is retried at the next run). */
async function mailOf(r, prior, smtp, passFile) {
  let { alerted, last_alert_day } = prior, alert_error = null;
  const day = r.checked_at.slice(0, 10);
  const kind = r.status === "unhealthy" ? (!alerted ? "alert" : day > (last_alert_day ?? "") ? "reminder" : null) : alerted ? "recovery" : null;
  if (kind !== null) {
    const cfg = mailConfigOf(process.env), pass = cfg === null ? null : readSmtpPass(passFile);
    let res = { ok: false, error: "smtp_unconfigured" };
    if (cfg !== null && pass !== null) {
      try { res = await smtp({ ...cfg, pass, message: composeBellMail({ from: cfg.from, to: cfg.to, kind, report: r }), deadlineMs: smtpDeadlineMs(process.env), maxBytes: SMTP_MAX_BYTES }); }
      catch (e) { res = { ok: false, error: e?.alertError ?? "smtp_unreachable" }; }
    }
    if (!res.ok) alert_error = res.error ?? "smtp_rejected";
    else if (kind === "recovery") [alerted, last_alert_day] = [false, null];
    else [alerted, last_alert_day] = [true, day];
  }
  return { alerted, last_alert_day, alert_error };
}
/** The file gestures of writeAtomic (BELL-PROBE-ATOMIC-FAULT-1, calque of DURABLE_FS of apps/bell/scripts/bell-publish.mjs): a MUTABLE object on
 *  purpose, the test seam that cuts a run between two gestures. fsync(2) of a directory makes a renamed entry durable; win32 opens it "r+"
 *  (bell-publish.mjs DURABLE_FS, measured). */
export const PROBE_FS = {
  open: (tmp) => openSync(tmp, "wx", 0o644),
  write: (fd, data) => { writeFileSync(fd, data); },
  fsync: (fd) => { fsyncSync(fd); },
  close: (fd) => { closeSync(fd); },
  rename: (a, b) => { renameSync(a, b); },
  remove: (p) => { rmSync(p, { force: true }); },
  fsyncDir: (dir) => { const fd = openSync(dir, process.platform === "win32" ? "r+" : "r"); try { fsyncSync(fd); } finally { closeSync(fd); } },
};
/** `dir` and its missing parents made, each one's entry synced in its parent (ensureDir of bell-publish.mjs). */
function ensureDir(dir, D) { if (existsSync(dir)) return; ensureDir(dirname(dir), D); mkdirSync(dir); D.fsyncDir(dirname(dir)); }
/** `data` to `path` atomically: a temporary file of the same directory, written and synced, renamed over `path`, then the directory synced. */
function writeAtomic(path, data, D = PROBE_FS) {
  const dir = dirname(path), tmp = join(dir, `.tmp-${String(process.pid)}-${randomBytes(6).toString("hex")}`);
  ensureDir(dir, D);
  try {
    const fd = D.open(tmp);
    try { D.write(fd, data); D.fsync(fd); } finally { D.close(fd); }
    D.rename(tmp, path);
  } catch (e) { D.remove(tmp); throw e; }
  D.fsyncDir(dir);
}

const FLAGS = { "--state": "state", "--keyring": "keyring", "--smtp-pass-file": "smtpPassFile" };
/** The argv: --state <dir> once, --keyring and --smtp-pass-file at most once, each with a value; anything else throws (exit 2, nothing written). */
export function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = String(argv[i]), v = argv[i + 1];
    if (!Object.hasOwn(FLAGS, flag) || Object.hasOwn(a, FLAGS[flag]) || v === undefined || v.startsWith("--")) throw new Error(`unknown, repeated or valueless flag ${flag}`);
    a[FLAGS[flag]] = v;
  }
  if (a.state === undefined) throw new Error("--state <dir> is required");
  return a;
}
/** The entry point: one run under `clock` (ms) and the transport `fetch` (HTTP) and `smtp` (probe-narabi's sendSmtp form), its only
 *  dependencies. Resolves {exitCode, report}; report is null on a usage error (exit 2, nothing read, nothing written). */
export async function runProbe(argv, { clock, fetch, smtp }) {
  let a;
  try { a = parseArgs(argv); } catch (e) { return { exitCode: 2, report: null, usage: e.message }; }
  const nowMs = clock(), out = join(a.state, "bell.json"), keptPath = join(a.state, "bell", "timeline.jsonl"), prior = priorOf(out);
  const r = { schema: SCHEMA, checked_at: new Date(nowMs).toISOString(), status: "unhealthy", alerts: [], served_lines: null, kept_lines: null,
    new_lines: null, head_seq: null, head_line_hash: null, last_window_end_utc: null, due_unit: null, due_by_utc: null, legacy_origin: null,
    site_status: null, site_status_since: null, alerted: false, alert_error: null, last_alert_day: null, ots: null };
  let c = { keep: null, files: new Map() };
  try { c = await check(r, a, nowMs, prior, httpTransport(fetch), keptPath); } catch { r.alerts.push("probe_error"); }
  // The immutables first, then the kept copy that names them (a cut between the two leaves files no kept line names yet).
  if (c.keep !== null) { try { for (const [rel, b] of c.files) writeAtomic(join(a.state, "bell", ...rel.split("/")), b); writeAtomic(keptPath, c.keep); } catch { r.alerts.push("write_refused"); } }
  try {
    const kept = existsSync(keptPath) ? readFileSync(keptPath) : Buffer.alloc(0);
    const o = await otsRun({ dir: join(a.state, "bell", "ots"), kept, lines: linesOf(kept).parsed, nowMs, fetchFn: fetch, write: (p, d) => { writeAtomic(p, d); }, after: prior.ots_after });
    r.alerts.push(...o.alerts);
    r.ots = o.summary;
  } catch { r.alerts.push("probe_error"); }
  r.alerts = [...new Set(r.alerts)];
  r.status = r.alerts.length === 0 ? "healthy" : "unhealthy";
  Object.assign(r, await mailOf(r, prior, smtp, a.smtpPassFile ?? DEFAULT_SMTP_PASS_FILE));
  let wrote = true;
  try { writeAtomic(out, `${JSON.stringify(r, null, 2)}\n`); } catch { wrote = false; }
  return { exitCode: r.status === "unhealthy" || r.alert_error !== null || !wrote ? 1 : 0, report: r };
}

// Run-guard (real paths compared, motif probe-dojo-live.mjs): the CLI runs when launched, never on import (the tests).
const isEntry = () => { try { return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]); } catch { return false; } };
if (isEntry()) {
  runProbe(process.argv.slice(2), { clock: Date.now, fetch: globalThis.fetch, smtp: sendSmtp }).then(({ exitCode, report, usage }) => {
    if (report === null) process.stderr.write(`bell probe: ${String(usage)}\n`);
    else process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exitCode = exitCode;
  }, () => { process.stderr.write("bell probe: fatal\n"); process.exitCode = 1; });
}
