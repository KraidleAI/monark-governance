// MONARK Dojo -- PR-1b-1 T-5: the timeline walker (ADR-DOJO-SNAPSHOT-1 D-8 l.227-229; section 6 PR-1b-1 l.370, l.372,
// l.391). walkDojoTimeline is a DECLARED CALQUE of walkTimeline (apps/bell/scripts/bell-chain.mjs:118-157), which stays unmodified (D-8 l.231: parametrising it
// is the rejected alternative): Bell's checks in Bell's order, with Bell's reasons and Bell's key schedule, plus ONE guard Bell's walk lacks, the Dojo's depth
// bound (lot DEPTH-BOUND): a line nested past it (17 levels) is timeline_malformed where Bell's order goes on to the signature (signature_invalid for a line
// edited after signing; far deeper, canonical recurses); then the Dojo checks of the line (D-8 l.228). The Bell primitives are imported unchanged, from the
// closed list of P-15 (l.594); isJwk (bell-chain.mjs:103, module-private) is the one declared duplicate. Pure, Node built-ins only: no I/O, no clock, no
// network. A refusal is {ok: false, seq, reason}, reason in DOJO_WALK_REASONS: codes of D-10 (l.252 since the mere's eighth pli, rotation_key_not_in_keyring
// included: Bell's walk emits it, bell-chain.mjs:134; G1 journal Q-1). The interface choices below are declared in the G1 journal (Q-2 to Q-6), never silent.
import { createHash } from "node:crypto";
import { GENESIS, lineHash, verifyLine, publicKeyOfJwk } from "../../bell/scripts/bell-chain.mjs";

export const DOJO_TIMELINE_SCHEMA = "dojo-timeline-v1"; // D-8 l.227
export const DOJO_WALK_REASONS = Object.freeze(["timeline_malformed", "chain_broken", "rotation_key_not_in_keyring", "key_not_in_keyring",
  "signature_invalid", "key_not_active", "rotation_malformed", "revocation_malformed", "anchor_missing", "day_not_increasing",
  "seed_revealed_early", "seed_chain_broken", "price_version_mismatch", "version_not_in_force"]);

const KINDS = new Set(["anchor", "snapshot", "price_version", "history", "key_rotation", "key_revocation"]); // D-8 l.227
const isJwk = (j) => j !== null && typeof j === "object" && j.kty === "OKP" && j.crv === "Ed25519" && typeof j.x === "string";

// Forms (G1 journal Q-4): a day is a UTC date AAAA-MM-JJ (ADR-DOJO-PR-2B D-12 l.457, l.468), read as its count of days
// since 1970-01-01 (ADR-DOJO-PR-2B l.229); published_at is the output of toISOString (bell-publish.mjs:262, :269), exact
// round trip; a seed is 64 lowercase hex and H = SHA-256 runs on its 32 raw bytes (D-4 l.186; hex convention of Q-8).
const DAY_MS = 86_400_000;
const DAY_ONE = "2026-09-10"; // history_first_day = day 1 (D-8 l.227), token creation (D-18 l.296, decision 227; first hand: l.814)
const HEX64 = /^[0-9a-f]{64}$/;
const DECIMAL = /^(0|[1-9][0-9]*)$/;
const hex64 = (s) => typeof s === "string" && HEX64.test(s);
const decimal = (s) => typeof s === "string" && DECIMAL.test(s);
const positive = (s) => decimal(s) && s !== "0";
const count = (n) => Number.isSafeInteger(n) && n >= 1;
const named = (s) => typeof s === "string" && s !== "";
const fraction = (f) => Array.isArray(f) && f.length === 2 && decimal(f[0]) && positive(f[1]);
function dayOf(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const t = Date.parse(`${s}T00:00:00.000Z`);
  return Number.isFinite(t) && new Date(t).toISOString().startsWith(s) ? t / DAY_MS : null;
}
function instantOf(s) {
  if (typeof s !== "string") return null;
  const t = Date.parse(s);
  return Number.isFinite(t) && new Date(t).toISOString() === s ? t : null;
}
function hashTimes(seed, j) {
  let b = Buffer.from(seed, "hex");
  for (let k = 0; k < j; k++) b = createHash("sha256").update(b).digest();
  return b.toString("hex");
}

// Anchor (D-8 l.227): its fields; tier_units u_1 = 1 then strictly increasing (D-3 l.171), five tiers (decision 224);
// tier_windows non-decreasing (precondition of tierOf, l.858 (c)); price_window_days = 7, the seven daily values of D-17
// l.287 that medianOfSeven fixes (Q-4, l.858 (c)); k_reads <= 255, byte(i) (ADR-DOJO-PR-2 D-5 l.152; Q-9 of PR-1b-3).
function anchorForm(l) {
  const u = l.tier_units, w = l.tier_windows;
  return hex64(l.seed_anchor) && [l.mint, l.program, l.pool, l.pool_quote_vault, l.sol_usd_source].every(named)
    && [l.k_reads, l.horizon, l.validation_days].every(count) && l.k_reads <= 255 && positive(l.objective_unit_microusd_days) && positive(l.dust_threshold_microusd)
    && Array.isArray(u) && u.length === 5 && u.every(positive) && u[0] === "1" && u.every((x, k) => k === 0 || BigInt(x) > BigInt(u[k - 1]))
    && Array.isArray(w) && w.length === 5 && w.every(count) && w.every((x, k) => k === 0 || x >= w[k - 1])
    && l.price_window_days === 7 && instantOf(l.published_at) !== null;
}
// read_rule (ADR-DOJO-PR-2 D-5 l.154, closed keys; PR-1b-3): the beacon's chain hash (32 bytes) and public key (96 bytes) in lowercase
// hexadecimal, its scheme, genesis time and period (seconds), then O = 900 (D-5 l.152), the tolerance 600 and the SOL/USD freshness 165 (D-3).
const READ_RULE = ["beacon_chain_hash", "beacon_public_key", "beacon_scheme", "beacon_genesis_time", "beacon_period", "read_offset_s",
  "read_tolerance_s", "sol_usd_max_age_s"];
const readRuleForm = (r) => r !== null && typeof r === "object" && !Array.isArray(r) && Object.keys(r).length === 8 && READ_RULE.every((k) => Object.hasOwn(r, k))
  && hex64(r.beacon_chain_hash) && typeof r.beacon_public_key === "string" && /^[0-9a-f]{192}$/.test(r.beacon_public_key)
  && r.beacon_scheme === "bls-unchained-g1-rfc9380" && Number.isSafeInteger(r.beacon_genesis_time) && r.beacon_genesis_time >= 0 && count(r.beacon_period)
  && r.read_offset_s === 900 && r.read_tolerance_s === 600 && r.sol_usd_max_age_s === 165;

// price_version (D-8 l.227-228, D-17 l.287-288): numbers and effective days strictly increasing; seven daily values per
// series; effect after the last day of its window, which the line does not carry: first + 7 - 1 bounds it from below
// (G1 journal Q-5); never on a day already published (D-3 l.175: never applied to a past day).
function versionCheck(l, st) {
  const eff = dayOf(l.effective_day), first = dayOf(l.window_first_day), prev = st.versions[st.versions.length - 1];
  const seven = (s) => Array.isArray(s) && s.length === st.anchor.price_window_days && s.every(fraction);
  if (!count(l.price_version) || eff === null || first === null || !seven(l.pool_price_daily) || !seven(l.usd_per_sol_daily)
    || !fraction(l.unit_price_microusd) || !positive(l.unit_price_microusd[0]) || !positive(l.threshold_unit) || !positive(l.dust_threshold) || instantOf(l.published_at) === null
    || (prev !== undefined && (l.price_version <= prev.v || eff <= prev.eff))) return "timeline_malformed";
  const W = st.anchor.price_window_days; // Q-6 of PR-1b-3: published after its window's end, after the snapshot of its last day
  if (eff <= first + W - 1 || instantOf(l.published_at) < (first + W) * DAY_MS || st.last === null || st.last < first + W - 1) return "price_version_mismatch";
  if (st.last !== null && eff <= st.last) return "version_not_in_force";
  st.versions.push({ v: l.price_version, eff });
  return null;
}

// snapshot (D-8 l.228): the history precedes the first snapshot (l.391; P-36 l.589, decision 231); day strictly increasing,
// after the anchor's day and after the last history day (l.228, l.302); seed of day d revealed at the end of day d at the
// earliest (D-4 l.186; l.302 "revealed late, never early"); H^j(seed) = the previous revealed seed, j = the gap in days,
// the anchor's day being day 0 of its chain, within its horizon (D-4 l.186; G1 journal Q-2); the version named is the
// one in force at d, null before the first (D-3 l.175, D-17 l.289).
function snapshotCheck(l, st) {
  const d = dayOf(l.day), t = instantOf(l.published_at);
  if (d === null || t === null || !hex64(l.seed) || !Array.isArray(l.reads) || !(l.price_version === null || count(l.price_version))
    || st.history === null) return "timeline_malformed";
  if (d <= Math.max(st.last ?? -Infinity, st.anchorDay, st.history)) return "day_not_increasing";
  if (t < (d + 1) * DAY_MS) return "seed_revealed_early";
  if (d - st.anchorDay > st.anchor.horizon || hashTimes(l.seed, d - st.seedDay) !== st.seed) return "seed_chain_broken";
  const force = st.versions.filter((v) => v.eff <= d).pop();
  if (l.price_version !== (force === undefined ? null : force.v)) return "version_not_in_force";
  Object.assign(st, { last: d, seed: l.seed, seedDay: d });
  return null;
}

// The Dojo checks of one line, run after Bell's (D-8 l.228): first line an anchor; a new anchor restarts the seed chain
// (D-4 l.186: horizon spent, a new anchor line); one history line (l.227, l.391); key lines: Bell's checks only.
function dojoCheck(l, first, st) {
  if (first && l.kind !== "anchor") return "anchor_missing";
  if (l.kind === "anchor") {
    if (!anchorForm(l)) return "timeline_malformed";
    if (!readRuleForm(l.read_rule)) return ["timeline_malformed", "read_rule"]; // a reason and the sub-check its detail names (D-8, C-V-1 (b))
    const day = Math.floor(instantOf(l.published_at) / DAY_MS);
    Object.assign(st, { anchor: l, anchorDay: day, seed: l.seed_anchor, seedDay: day });
    return null;
  }
  if (l.kind === "history") {
    const a = dayOf(l.history_first_day), b = dayOf(l.history_last_day);
    if (st.history !== null || l.history_first_day !== DAY_ONE || a === null || b === null || a > b || !hex64(l.history_sha256) || !hex64(l.history_root)
      || !(Number.isSafeInteger(l.history_lines_count) && l.history_lines_count >= 0)) return "timeline_malformed";
    st.history = b;
    return null;
  }
  if (l.kind === "price_version") return versionCheck(l, st);
  if (l.kind === "snapshot") return snapshotCheck(l, st);
  return null;
}

/** Walk a dojo-timeline-v1 under a trust set (trustOf of the keyring supplied by the reader). Returns {ok: true, active,
 *  head, voided, breaks} (head = last snapshot line or null), or {ok: false, seq, reason}, plus detail = "read_rule" when the
 *  anchor's read_rule is out of form (PR-1b-3); an empty timeline has no anchor. */
export function walkDojoTimeline(lines, trust) {
  if (lines.length === 0) return { ok: false, seq: 1, reason: "anchor_missing" };
  let prev = GENESIS, active = null;
  const revoked = new Map([...trust].filter(([, k]) => k.revoked_from_seq !== undefined).map(([id, k]) => [id, k.revoked_from_seq]));
  const breaks = [], former = new Set(), keyOf = (x) => publicKeyOfJwk({ x });
  const st = { anchor: null, anchorDay: 0, seed: "", seedDay: 0, history: null, last: null, versions: [] };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], seq = i + 1, fail = (reason) => ({ ok: false, seq, reason });
    // ---- Bell's checks, same order, same reasons (bell-chain.mjs:131-151), and the depth guard, a Dojo addition Bell's walk lacks (header) ----
    if (l === null || typeof l !== "object" || l.schema !== DOJO_TIMELINE_SCHEMA || l.seq !== seq || !KINDS.has(l.kind)) return fail("timeline_malformed");
    if (depthOf(l) > DOJO_MAX_DEPTH) return fail("timeline_malformed"); // nested past the bound: no canonical (verifyLine, lineHash) runs on it
    if (l.prev_line_hash !== prev) return fail("chain_broken");
    const rot = l.kind === "key_rotation", broken = rot && l.continuity === "broken";
    if (rot && !trust.has(l.new_key_id)) return fail("rotation_key_not_in_keyring");
    const k = trust.get(l.key_id);
    if (k === undefined) return fail("key_not_in_keyring");
    if (!verifyLine(l, keyOf(k.x))) return fail("signature_invalid");
    if (i === 0) active = l.key_id;
    if (broken ? l.key_id !== l.new_key_id : l.key_id !== active) return fail("key_not_active");
    if (rot) {
      if (!(l.continuity === undefined || broken) || !isJwk(l.new_key) || l.new_key.x !== trust.get(l.new_key_id).x || l.new_key_id === active || former.has(l.new_key_id)) return fail("rotation_malformed");
      if (!verifyLine({ ...l, sig: l.sig_new }, keyOf(l.new_key.x))) return fail("signature_invalid");
      if (broken) breaks.push({ seq, lost_key_id: active, new_key_id: l.new_key_id });
      former.add(active);
      active = l.new_key_id;
    }
    if (l.kind === "key_revocation") {
      const r = l.revoked_key_id, from = l.revoked_from_seq;
      if (!former.has(r) || !Number.isInteger(from) || from < 1 || from > seq) return fail("revocation_malformed");
      revoked.set(r, Math.min(revoked.get(r) ?? from, from));
    }
    // ---- then the Dojo checks of the line (D-8 l.228) ----
    const reason = dojoCheck(l, i === 0, st);
    if (Array.isArray(reason)) return { ...fail(reason[0]), detail: reason[1] };
    if (reason !== null) return fail(reason);
    prev = lineHash(l);
  }
  const voided = lines.filter((l) => l.seq >= (revoked.get(l.key_id) ?? Infinity)).map((l) => l.seq);
  const snapshots = lines.filter((l) => l.kind === "snapshot");
  return { ok: true, active, head: snapshots[snapshots.length - 1] ?? null, voided, breaks };
}

// ---- The depth bound of a served JSON text (G1 journal of lot DEPTH-BOUND, section 1.4): the verifier, its CLI, the browser's reread and the page
// build measure a text before any JSON.parse (the sync does not: item SYNC-SERVED-DEPTH-SCAN-1), the walker a value before any canonical; none recurses ----
/** The deepest nesting of objects and arrays a served JSON text may carry: 16, four times the deepest served form (4: a snapshot line's
 *  readings, line > reads > reading > fraction; a key file, file > keys > key > public_key), and about 1/197 of the 3 148 levels canonical
 *  writes before its RangeError on Node 24.15.0 (win32). */
export const DOJO_MAX_DEPTH = 16;
/** The deepest nesting of objects and arrays in a JSON text, read in one pass over its characters: a string is skipped with its escapes (a
 *  reverse solidus, code 92, skips the character after it); nothing is parsed and nothing recurses, so a text of any depth is measured. */
export function jsonDepth(text) {
  let depth = 0, max = 0, str = false;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (str) { if (c === 92) i++; else if (c === 34) str = false; } else if (c === 34) str = true;
    else if (c === 123 || c === 91) { depth++; if (depth > max) max = depth; } else if (c === 125 || c === 93) depth--;
  }
  return max;
}
/** A served JSON text parsed only within DOJO_MAX_DEPTH, where a text that is not JSON throws, as JSON.parse does; past it, null, JSON or not, never
 *  parsed, which no served form accepts: each reader refuses it as it refuses a null, by the code of its form (not_json names a text within the bound). */
export function readJson(text) {
  return jsonDepth(text) > DOJO_MAX_DEPTH ? null : JSON.parse(text);
}
/** The nesting depth of a parsed value, without recursion (an explicit stack), cut short once past DOJO_MAX_DEPTH: the walker's guard, since
 *  the walker receives values, not texts. */
function depthOf(v) {
  let max = 0;
  for (const stack = [[v, 0]]; stack.length > 0 && max <= DOJO_MAX_DEPTH;) {
    const [x, d] = stack.pop();
    if (x !== null && typeof x === "object") {
      if (d + 1 > max) max = d + 1;
      for (const y of Object.values(x)) stack.push([y, d + 1]);
    }
  }
  return max;
}
