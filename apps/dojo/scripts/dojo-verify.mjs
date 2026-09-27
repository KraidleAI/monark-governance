// MONARK Dojo -- PR-1b-2 T-6: the reader's verifier (ADR-DOJO-SNAPSHOT-1 D-10 l.250-253; section 6 l.377-395; eighth pli).
// From the SERVED files alone (timeline.jsonl, dojo/pubkey.json, lines/<sha256>.jsonl, history/<sha256>.jsonl: D-9 l.246) it
// walks the timeline with walkDojoTimeline (D-8 l.232), then recomputes every price_version, the history file and the lines of
// every snapshot with the pure core of PR-1a. TRUST ROOT = the dojo-keyring-v1 SUPPLIED with --keyring (D-8 l.234; item
// DOJO-KEYRING-SCHEMA-1); the served dojo/pubkey.json is a cross-checked channel; --self-consistent-only runs under the served
// keyring and says so (motif bell-verify.mjs:1-9). Refusals: the codes of D-10 l.252 only; their uses are declared in the G1
// journal of PR-1b-2. It never reads the Solana chain: a signature attests origin, never truth (D-10 l.253). Built-ins only.
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { canonical, trustOf } from "../../bell/scripts/bell-chain.mjs";
import { walkDojoTimeline } from "./dojo-chain.mjs";
import { dayValue, holderCounted, ownerClass, proofOf, provisionalOf, rootOf, scoreOf, stepLots, tierOf, unitPrice, unitThreshold,
  unitsOf, validatedOf, verifyProof } from "./dojo-core.mjs";

/** The closed list of D-10 (l.252), in its order: 45 codes. A refusal's detail names a file, a line or a field, never a value. */
export const DOJO_VERIFY_REFUSALS = Object.freeze(["insecure_url", "redirect_refused", "http_status", "unreachable", "too_large",
  "not_json", "keyring_invalid", "served_key_not_in_keyring", "timeline_malformed", "chain_broken", "rotation_key_not_in_keyring",
  "key_not_in_keyring", "signature_invalid", "key_not_active", "rotation_malformed", "revocation_malformed", "anchor_missing",
  "day_not_increasing", "seed_chain_broken", "seed_revealed_early", "read_instant_mismatch", "lines_sha_mismatch",
  "lines_count_mismatch", "lines_not_sorted", "line_malformed", "line_missing", "class_mismatch", "program_address_scored",
  "lots_transition_mismatch", "score_mismatch", "units_mismatch", "threshold_mismatch", "root_mismatch", "proof_invalid",
  "validation_mismatch", "tier_mismatch", "holders_count_mismatch", "price_version_mismatch", "threshold_conversion_mismatch",
  "version_not_in_force", "history_sha_mismatch", "history_count_mismatch", "history_not_sorted", "history_root_mismatch",
  "history_transition_mismatch"]);
export class DojoVerifyError extends Error {
  constructor(code, seq, day, detail) {
    super(`dojo/verify: ${code}: ${detail}`);
    Object.assign(this, { name: "DojoVerifyError", code, seq, day, detail });
  }
}
const refuse = (code, seq, day, detail) => { throw new DojoVerifyError(code, seq, day, detail); };

// Bounds (D-10 l.250: sources and bounds as bell-verify.mjs): 64 MiB per body and 1 MiB per line, bell-verify.mjs:25-28; a day of
// lines weighs 26,7 MiB for N = 10^5 addresses at K = 4 (D-7 l.223, M3).
export const VERIFY_BOUNDS = Object.freeze({ MAX_BODY_BYTES: 64 * 1024 * 1024, MAX_LINE_BYTES: 1024 * 1024 });

/** A directory holding the served layout (a mirror, or the publisher's public/); motif bell-verify.mjs:35-46. */
export function dirSource(root, bounds = VERIFY_BOUNDS) {
  return {
    get: (rel) => {
      const p = join(root, ...rel.split("/"));
      let size = -1;
      try { const st = statSync(p); if (st.isFile()) size = st.size; } catch { size = -1; }
      if (size < 0) refuse("unreachable", null, null, rel);
      if (size > bounds.MAX_BODY_BYTES) refuse("too_large", null, null, rel);
      return Promise.resolve(readFileSync(p));
    },
  };
}

const same = (keys, want) => keys.length === want.length && want.every((k) => keys.includes(k));
const seqNo = (n) => Number.isSafeInteger(n) && n >= 1;
const ENTRY = ["key_id", "public_key", "valid_from_seq", "valid_to_seq", "revoked_from_seq"];
/** dojo-keyring-v1 (item DOJO-KEYRING-SCHEMA-1, schema of the G1 journal of PR-1b-2): {schema, keys}, each key {key_id, public_key:
 *  {kty, crv, x}, valid_from_seq, valid_to_seq?, revoked_from_seq?}, closed keys at every level. Key ids, duplicates and revocation
 *  markers are checked by Bell's trustOf on the converted view (P-15 l.610; journal of PR-1b-1, Q-3 (b)). Returns {trust, windows}
 *  (key_id -> [valid_from_seq, valid_to_seq or Infinity]), or null when malformed. */
export function dojoTrustOf(k) {
  const entry = (e) => e !== null && typeof e === "object" && Object.keys(e).every((x) => ENTRY.includes(x)) && e.public_key !== null
    && typeof e.public_key === "object" && same(Object.keys(e.public_key), ["kty", "crv", "x"]) && seqNo(e.valid_from_seq)
    && (e.valid_to_seq === undefined || (seqNo(e.valid_to_seq) && e.valid_to_seq >= e.valid_from_seq));
  if (k === null || typeof k !== "object" || !same(Object.keys(k), ["schema", "keys"]) || k.schema !== "dojo-keyring-v1"
    || !Array.isArray(k.keys) || !k.keys.every(entry)) return null;
  const trust = trustOf({ schema: "bell-keyring-v1", keys: k.keys.map((e) => ({ key_id: e.key_id, jwk: e.public_key,
    ...(e.revoked_from_seq === undefined ? {} : { revoked_from_seq: e.revoked_from_seq }) })) });
  return trust === null ? null : { trust, windows: new Map(k.keys.map((e) => [e.key_id, [e.valid_from_seq, e.valid_to_seq ?? Infinity]])) };
}

// Closed keys (D-8 l.231): those of every timeline line, then those of its kind (a key rotation may add continuity, bell-chain.mjs:133);
// a line of the day (D-7 l.221); a history line (D-18 l.306).
const COMMON = ["schema", "seq", "kind", "prev_line_hash", "key_id", "published_at", "sig"];
const FIELDS = {
  anchor: ["seed_anchor", "mint", "program", "k_reads", "horizon", "validation_days", "objective_unit_microusd_days", "tier_units",
    "tier_windows", "price_window_days", "pool", "pool_quote_vault", "sol_usd_source", "dust_threshold_microusd"],
  snapshot: ["day", "seed", "reads", "mint", "decimals", "price_version", "lines_sha256", "lines_count", "root", "score_total",
    "validated_total", "holders_count", "status"],
  price_version: ["price_version", "effective_day", "window_first_day", "pool_price_daily", "usd_per_sol_daily", "unit_price_microusd",
    "threshold_unit", "dust_threshold"],
  history: ["history_first_day", "history_last_day", "history_sha256", "history_lines_count", "history_root"],
  key_rotation: ["new_key", "new_key_id", "sig_new"], key_revocation: ["revoked_key_id", "revoked_from_seq"],
};
const closed = (l) => same(Object.keys(l).filter((k) => !(l.kind === "key_rotation" && k === "continuity")), [...COMMON, ...FIELDS[l.kind]]);
const LINE_KEYS = ["address", "class", "reads", "day_value", "lots", "score", "validated", "provisional", "units", "tier", "holder_counted"];
const HISTORY_KEYS = ["address", "class", "day", "day_value"];
const LINES_CODES = ["lines_count_mismatch", "lines_sha_mismatch", "lines_not_sorted", "root_mismatch"];
const HISTORY_CODES = ["history_count_mismatch", "history_sha_mismatch", "history_not_sorted", "history_root_mismatch"];

const DAY_MS = 86_400_000;
const HEX64 = /^[0-9a-f]{64}$/;
const decOrNull = (s) => s === null || (typeof s === "string" && /^(0|[1-9][0-9]*)$/.test(s));
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const epoch = (s) => Date.parse(`${s}T00:00:00.000Z`) / DAY_MS; // a day AAAA-MM-JJ, as days since 1970-01-01 (journal of PR-1b-1, Q-4)
const dayOk = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(epoch(s))
  && new Date(epoch(s) * DAY_MS).toISOString().startsWith(s);
const instantDay = (s) => Math.floor(Date.parse(s) / DAY_MS); // the UTC day of a published_at: an anchor's day (journal of PR-1b-1, Q-2 (B))
const addressOk = (a) => { try { ownerClass(a); return true; } catch { return false; } };
const lt = (a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)) < 0; // byte order (D-7 l.221)
const dayOf = (l) => (l !== null && typeof l === "object" && typeof l.day === "string" ? l.day : null);

/** One immutable file named by its signed line (D-7 l.221, D-18 l.306), bounded as a body: LF-terminated lines; the count, the
 *  sha256, then each line in canonical JSON of Bell with closed keys and its forms, then the order, then the Merkle root (RFC 9162
 *  s2.1.1 by rootOf), in that order (ADR-DOJO-PR-2B l.548: a removed line is a count, a changed value a sha256, a re-signed sha256 a root). */
async function readImmutable(source, rel, sig, keys, form, before, codes) {
  const at = (code, what) => refuse(code, sig.seq, sig.day, what), buf = await source.get(rel), text = buf.toString("utf8");
  if (text !== "" && !text.endsWith("\n")) at("line_malformed", `${rel}: no final newline`);
  const raw = text === "" ? [] : text.slice(0, -1).split("\n");
  if (raw.length !== sig.count) at(codes[0], rel);
  if (sha256(buf) !== sig.sha) at(codes[1], rel);
  const objs = raw.map((s, i) => {
    let o = null;
    try { o = JSON.parse(s); } catch { o = null; }
    if (o === null || typeof o !== "object" || Array.isArray(o) || canonical(o) !== s || !same(Object.keys(o), keys) || !form(o)) {
      at("line_malformed", `${rel} line ${i + 1}`);
    }
    return o;
  });
  objs.forEach((o, i) => { if (i > 0 && !before(objs[i - 1], o)) at(codes[2], `${rel} line ${i + 1}`); });
  const root = rootOf(raw);
  if (root !== sig.root) at(codes[3], rel);
  return { raw, objs, root };
}

/** The reader's check of an inclusion proof (D-7 l.221, D-10 l.251; RFC 9162 s2.1.3.2 through verifyProof of PR-1a). */
export function checkInclusion(line, index, count, path, root) {
  if (!verifyProof(line, index, count, path, root)) refuse("proof_invalid", null, null, `inclusion of line ${index + 1} of ${count}`);
}

async function verify({ source, keyring, address, bounds }) {
  const parse = (buf, code, seq, what) => { try { return JSON.parse(buf.toString("utf8")); } catch { return refuse(code, seq, null, what); } };
  const text = (await source.get("timeline.jsonl")).toString("utf8");
  if (text !== "" && !text.endsWith("\n")) refuse("timeline_malformed", null, null, "timeline.jsonl: no final newline");
  const lines = text === "" ? [] : text.slice(0, -1).split("\n").map((s, i) => {
    if (Buffer.byteLength(s) + 1 > bounds.MAX_LINE_BYTES) refuse("too_large", i + 1, null, "timeline.jsonl");
    return parse(Buffer.from(s), "timeline_malformed", i + 1, "timeline.jsonl");
  });
  const served = dojoTrustOf(parse(await source.get("dojo/pubkey.json"), "not_json", null, "dojo/pubkey.json"));
  if (served === null) refuse("keyring_invalid", null, null, "dojo/pubkey.json");
  const root = keyring === null ? served : dojoTrustOf(keyring);
  if (root === null) refuse("keyring_invalid", null, null, "the supplied keyring");
  for (const [id, k] of served.trust) if (root.trust.get(id)?.x !== k.x) refuse("served_key_not_in_keyring", null, null, id);
  const w = walkDojoTimeline(lines, root.trust); // D-8 l.232: Bell's checks, then the walker's (table of the eighth pli)
  if (!w.ok) refuse(w.reason, w.seq, dayOf(lines[w.seq - 1]), "timeline.jsonl");

  // The timeline, line by line: closed keys, the keyring's validity windows, DOJO-WALK-GAPS-1 (a) to (c), each price_version
  // recomputed (D-17 l.291-294), the fields of each snapshot the walker does not read (D-8 l.231).
  const hist = lines.find((l) => l.kind === "history") ?? null, versions = new Map(), snaps = [];
  let anchor = null, last = -Infinity;
  for (const l of lines) {
    const at = (code, what) => refuse(code, l.seq, dayOf(l), what), [from, to] = root.windows.get(l.key_id);
    if (!closed(l)) at("timeline_malformed", "closed keys (D-8 l.231)");
    if (l.seq < from || l.seq > to) at("key_not_active", "validity window of the keyring");
    if (l.kind === "anchor") {
      if (anchor !== null && instantDay(l.published_at) <= last) at("day_not_increasing", "a new anchor on a published day (DOJO-WALK-GAPS-1 (c))");
      anchor = l;
    } else if (l.kind === "history") {
      if (epoch(l.history_last_day) < instantDay(anchor.published_at)) at("timeline_malformed", "a history ending before the anchor's day (DOJO-WALK-GAPS-1 (b))");
      last = epoch(l.history_last_day); // its days are published days (DOJO-WALK-GAPS-1 (c)); the walker puts it before every snapshot
    } else if (l.kind === "price_version") {
      if (epoch(l.window_first_day) <= Math.max(instantDay(anchor.published_at), hist === null ? -Infinity : epoch(hist.history_last_day))) {
        at("price_version_mismatch", "a window on history days (DOJO-WALK-GAPS-1 (a))");
      }
      const p = unitPrice(l.pool_price_daily, l.usd_per_sol_daily);
      if (canonical(p) !== canonical(l.unit_price_microusd)) at("price_version_mismatch", "unit_price_microusd");
      if (l.threshold_unit !== unitThreshold(anchor.objective_unit_microusd_days, p) || l.dust_threshold !== unitThreshold(anchor.dust_threshold_microusd, p)) {
        at("threshold_conversion_mismatch", "threshold_unit or dust_threshold");
      }
      versions.set(l.price_version, l);
    } else if (l.kind === "snapshot") {
      if (!HEX64.test(l.lines_sha256) || !HEX64.test(l.root) || !(Number.isSafeInteger(l.lines_count) && l.lines_count >= 0) || l.mint !== anchor.mint
        || !(Number.isSafeInteger(l.decimals) && l.decimals >= 0) || !["counted", "abstained"].includes(l.status)) at("timeline_malformed", "snapshot fields");
      last = epoch(l.day);
      snaps.push({ l, anchor });
    }
  }
  // F-1 (fail-closed; orchestrator's decision after the G2 of PR-1b-2): a line voided at or before the verified line (the head, else
  // the last line) refuses, since piles, series and versions would derive from it; a later voided line does not (Bell reports and goes on).
  const head = snaps.length === 0 ? null : snaps[snaps.length - 1].l, voided = w.voided.filter((s) => s <= (head === null ? lines.length : head.seq));
  if (voided.length > 0) refuse("key_not_active", voided[0], dayOf(lines[voided[0] - 1]), `voided_lines ${w.voided.join(",")}: signed by a key revoked at its seq`);

  // The history file (D-18 l.306; ADR-DOJO-PR-2B l.456-465): its lots held from day 1 to its last day, an address with a pile having
  // a line each day; day numbers from day 1, the walker's history_first_day (D-18 l.300).
  const series = new Map();
  const seriesOf = (a, d) => { const s = series.get(a) ?? []; while (s.length < d) s.push(null); series.set(a, s); return s; };
  const no = (s) => epoch(s) - (hist === null ? 0 : epoch(hist.history_first_day)) + 1;
  let piles = new Map(), hFile = null, headFile = null;
  if (hist !== null) {
    const N = no(hist.history_last_day), at = (code, what) => refuse(code, hist.seq, null, what), rel = `history/${hist.history_sha256}.jsonl`;
    hFile = await readImmutable(source, rel, { seq: hist.seq, day: null, count: hist.history_lines_count, sha: hist.history_sha256, root: hist.history_root },
      HISTORY_KEYS, (o) => addressOk(o.address) && ["holder", "program"].includes(o.class) && dayOk(o.day) && no(o.day) >= 1 && no(o.day) <= N
        && decOrNull(o.day_value), (p, o) => p.day < o.day || (p.day === o.day && lt(p.address, o.address)), HISTORY_CODES);
    for (let d = 1, k = 0; d <= N; d++) {
      const today = [];
      while (k < hFile.objs.length && no(hFile.objs[k].day) === d) today.push(hFile.objs[k++]);
      const seen = new Set(today.map((o) => o.address));
      for (const [a, lots] of piles) if (lots.length > 0 && !seen.has(a)) at("line_missing", `${rel}: day ${d}`);
      for (const o of today) {
        if (ownerClass(o.address) !== o.class) at("class_mismatch", rel);
        seriesOf(o.address, d)[d - 1] = o.day_value;
        if (o.class === "holder") piles.set(o.address, stepLots(piles.get(o.address) ?? [], d, o.day_value));
      }
    }
  }

  // Each snapshot's lines (D-10 l.251): class, day value, lots from the eve's verified pile (the history's for the first snapshot),
  // points, then units, tier and holder_counted, then the omitted lines and the totals. A day without a snapshot is a missing day.
  for (const [n, { l: L, anchor: A }] of snaps.entries()) {
    const d = no(L.day), v = L.price_version === null ? null : versions.get(L.price_version), W = A.validation_days;
    const rel = `lines/${L.lines_sha256}.jsonl`, at = (code, what) => refuse(code, L.seq, L.day, what);
    const f = await readImmutable(source, rel, { seq: L.seq, day: L.day, count: L.lines_count, sha: L.lines_sha256, root: L.root }, LINE_KEYS,
      (o) => addressOk(o.address) && ["holder", "program"].includes(o.class) && Array.isArray(o.reads) && o.reads.length === A.k_reads
        && o.reads.every(decOrNull) && decOrNull(o.day_value), (p, o) => lt(p.address, o.address), LINES_CODES);
    const next = new Map(), ser = new Map();
    f.objs.forEach((o, i) => {
      const where = `${rel} line ${i + 1}`, m = dayValue(o.reads.map((r) => [r])); // D-2 l.162: the smallest concordant reading, 0 on a concordant absence (C-1)
      if (ownerClass(o.address) !== o.class) at("class_mismatch", where);
      if (m !== o.day_value) at("line_malformed", `${where}: day_value`);
      const s = seriesOf(o.address, d);
      s[d - 1] = m;
      ser.set(o.address, s);
      if (o.class === "program") { // D-2 l.169, D-6: an empty pile, a zero score
        if (canonical([o.lots, o.score, o.validated, o.provisional]) !== canonical([[], "0", "0", "0"])) at("program_address_scored", where);
        return;
      }
      const lots = stepLots(piles.get(o.address) ?? [], d, m); // D-16 l.275
      if (canonical(lots) !== canonical(o.lots)) at(n === 0 ? "history_transition_mismatch" : "lots_transition_mismatch", where);
      next.set(o.address, lots);
      if (scoreOf(s) !== o.score) at("score_mismatch", where);
      if (validatedOf(s, W) !== o.validated || provisionalOf(s, W) !== o.provisional) at("validation_mismatch", where);
    });
    for (const [a, lots] of piles) if (lots.length > 0 && !next.has(a)) at("line_missing", `${rel}: ${a}`); // D-7 l.222
    // Units, tier and holder_counted under the version in force (D-3 l.177-179, D-7 l.221, D-17 l.294). A day whose lines all apply
    // the thresholds of another version state (another price_version, or none) is threshold_mismatch (M-4); otherwise the field's code.
    const exp = (o, x) => canonical(x === null ? [null, null, null] : o.class === "program" ? ["0", 0, false]
      : [unitsOf(ser.get(o.address), W, x.threshold_unit), tierOf(ser.get(o.address), x.threshold_unit, A.tier_units, A.tier_windows),
        holderCounted("holder", ser.get(o.address), x.dust_threshold)]);
    const pub = (o) => canonical([o.units, o.tier, o.holder_counted]), bad = f.objs.findIndex((o) => pub(o) !== exp(o, v));
    if (bad >= 0) {
      if ([null, ...versions.values()].some((x) => x !== v && f.objs.every((o) => pub(o) === exp(o, x)))) at("threshold_mismatch", rel);
      const o = f.objs[bad], [u, t] = JSON.parse(exp(o, v));
      at(canonical(o.units) !== canonical(u) ? "units_mismatch" : canonical(o.tier) !== canonical(t) ? "tier_mismatch" : "holders_count_mismatch", `${rel} line ${bad + 1}`);
    }
    const sum = (key) => String(f.objs.reduce((t, o) => t + BigInt(o[key]), 0n));
    if (sum("score") !== L.score_total) at("score_mismatch", "score_total");
    if (sum("validated") !== L.validated_total) at("validation_mismatch", "validated_total");
    if (L.holders_count !== (v === null ? null : f.objs.filter((o) => o.holder_counted === true).length)) at("holders_count_mismatch", "holders_count");
    piles = next;
    headFile = f;
  }

  let inclusion = null; // --address (D-10 l.250-251): the head's line, its path, checked against the signed root
  if (address !== null) {
    const i = headFile === null ? -1 : headFile.objs.findIndex((o) => o.address === address);
    if (i < 0) refuse("line_missing", head === null ? lines.length : head.seq, head === null ? null : head.day, "--address: no line in the head snapshot");
    const path = proofOf(headFile.raw, i);
    checkInclusion(headFile.raw[i], i, headFile.raw.length, path, head.root);
    inclusion = { address, index: i, count: headFile.raw.length, line: headFile.raw[i], proof: path };
  }
  return { ok: true, reason: null, seq: lines.length, day: head === null ? null : head.day, detail: null,
    status: keyring === null ? "self_consistent_only" : "consistent_with_supplied_keyring", trust_root: keyring === null ? "served_keyring" : "supplied_keyring",
    active_key_id: w.active, voided_lines: w.voided, snapshots: snaps.length,
    head: head === null ? null : { seq: head.seq, lines_sha256: head.lines_sha256, lines_count: head.lines_count, recomputed_root: headFile.root },
    history: hist === null ? null : { history_sha256: hist.history_sha256, history_lines_count: hist.history_lines_count, recomputed_root: hFile.root },
    inclusion, scope: "a signature attests origin, never truth; the readings are what two operators reported; the Solana chain is not read" };
}

/** The complete check of D-10 (l.251): resolves to {ok: true, ...} or {ok: false, reason, seq, day, detail}, reason in
 *  DOJO_VERIFY_REFUSALS. `keyring` = the SUPPLIED dojo-keyring-v1 (parsed JSON), the trust root; null = self_consistent_only. */
export async function verifyDojoServed({ source, keyring = null, address = null, bounds = VERIFY_BOUNDS }) {
  try {
    return await verify({ source, keyring, address, bounds });
  } catch (e) {
    if (e instanceof DojoVerifyError) return { ok: false, reason: e.code, seq: e.seq, day: e.day, detail: e.detail };
    throw e;
  }
}

const USAGE = "dojo/verify: usage: node dojo-verify.mjs <served tree> (--keyring <file> | --self-consistent-only) [--address <address>]\n";
/** CLI (D-10 l.250; mission of PR-1b-2): one served tree (a directory) and a trust root chosen explicitly, --keyring <file> or
 *  --self-consistent-only; neither, both, a flag twice, a dangling or unknown flag, zero or two trees: usage on stderr, nothing on
 *  stdout, exit 1. Otherwise one canonical JSON line on stdout, exit 0 iff ok; a keyring file unreadable or not an object is
 *  keyring_invalid, never a run without a root. */
export async function runVerifyCli(argv) {
  const opt = new Map(), trees = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], valued = a === "--keyring" || a === "--address";
    if (opt.has(a) || (a.startsWith("--") && !valued && a !== "--self-consistent-only") || (valued && (argv[i + 1] ?? "--").startsWith("--"))) {
      process.stderr.write(USAGE);
      return 1;
    }
    if (a === "--self-consistent-only") opt.set(a, true);
    else if (valued) opt.set(a, argv[++i]);
    else trees.push(a);
  }
  if (trees.length !== 1 || opt.has("--keyring") === opt.has("--self-consistent-only")) { process.stderr.write(USAGE); return 1; }
  try {
    let keyring = null;
    if (opt.has("--keyring")) { try { keyring = JSON.parse(readFileSync(opt.get("--keyring"), "utf8")); } catch { keyring = undefined; } }
    const r = opt.has("--keyring") && (keyring === null || typeof keyring !== "object")
      ? { ok: false, reason: "keyring_invalid", seq: null, day: null, detail: "--keyring" }
      : await verifyDojoServed({ source: dirSource(trees[0]), keyring, address: opt.get("--address") ?? null });
    process.stdout.write(`${canonical(r)}\n`);
    return r.ok ? 0 : 1;
  } catch (e) {
    process.stderr.write(`dojo/verify: fatal: ${String(e?.name ?? "error")}\n`);
    return 1;
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = await runVerifyCli(process.argv.slice(2));
