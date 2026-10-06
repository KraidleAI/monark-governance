// apps/site/lib/dojo-live.ts -- the head of the day, reread in the reader's browser from the published timeline and lines file, and
// checked there against the COMMITTED record this page was built with (lib/dojo-served-load.ts). PURE: no I/O of its own.
// DUAL-COMPILE (as lib/narabi-live.ts): the root test program (nodenext, no DOM) and the Next bundler (DOM) both compile this file, so
// it has no node: builtin, no value import, no alias and no reference to fetch, window, document or crypto: the caller injects SHA-256,
// the Ed25519 check and the transport (Web Crypto and a same-origin GET in the browser; node:crypto and served trees in the tests).
// Anchors: the committed head's line hash and the committed keyring, never the served key set. ONE forward pass from line 1 chains
// every served line from the genesis hash, folds the state of the timeline walker (recoded here from apps/dojo/scripts/dojo-chain.mjs)
// and requires the committed head's hash at its seq, so the prefix is authenticated by that hash alone; each NEW line then passes the
// walker's checks, its closed keys, the committed key's window and an Ed25519 signature; a key rotation or revocation stops the reread.
// The new head's lines file is bound to its signed line: count, sha256, Merkle root, sums and holders. Any failure: the committed
// figures. No lot, point, unit, tier or version value is recomputed here: the reader's tool does that on the served host.
import type { DojoServedData, DojoServedHead } from "./dojo-served-load.ts";

/** SHA-256 of some bytes (Web Crypto in the browser, node:crypto in the tests). */
export type Sha256 = (bytes: Uint8Array) => Promise<Uint8Array>;
/** Ed25519 (RFC 8032) check of a 64-byte signature of `message` under the JWK x of a committed key; false when it does not verify. */
export type VerifyEd25519 = (x: string, message: Uint8Array, signature: Uint8Array) => Promise<boolean>;
/** The injected transport: one GET of a served path under an abort signal (a fetch Response has this shape). */
export interface DojoLiveReader { read(): Promise<{ done: boolean; value?: Uint8Array | undefined }>; cancel(): Promise<void> }
export interface DojoLiveResponse { readonly status: number; readonly body: { getReader(): DojoLiveReader } | null }
export type DojoLiveGet = (rel: string, signal: AbortSignal) => Promise<DojoLiveResponse>;
export interface DojoLiveDeps { sha256: Sha256; verifyEd25519: VerifyEd25519; get: DojoLiveGet; bounds?: DojoLiveBounds }
/** reread: the new head, rendered through the same figures as the committed one, its lines as served and the anchor in force at it; key_change: the new lines
 *  carry a key change, not followed here; fallback: anything else. In the last two cases the page shows the committed figures and says so. */
export type DojoLiveOutcome = { kind: "reread"; head: DojoServedHead; rows: readonly string[]; anchor: Line } | { kind: "key_change"; seq: number }
  | { kind: "fallback"; seq: number | null; why: string };

/** The bounds of the reader's tool (VERIFY_BOUNDS, apps/dojo/scripts/dojo-verify.mjs), restated and never imported; the root test pins
 *  the two objects deep-equal, so a bound added to the tool reds until it is added and applied here. */
export const DOJO_LIVE_BOUNDS = Object.freeze({ MAX_BODY_BYTES: 64 * 1024 * 1024, MAX_LINE_BYTES: 1024 * 1024, TIMEOUT_MS: 30_000, MAX_FILES: 1024,
  MAX_TOTAL_BYTES: 2 * 1024 ** 3 });
export type DojoLiveBounds = { readonly [K in keyof typeof DOJO_LIVE_BOUNDS]: number };

// -- Primitives, recoded from apps/bell/scripts/bell-chain.mjs and apps/dojo/scripts/dojo-core.mjs (pinned equal by test) --
const enc = new TextEncoder(), utf8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
/** Lowercase hex of some bytes. */
export const toHex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
function cat(xs: readonly Uint8Array[]): Uint8Array {
  const out = new Uint8Array(xs.reduce((n, x) => n + x.length, 0));
  xs.reduce((at, x) => { out.set(x, at); return at + x.length; }, 0);
  return out;
}
/** Canonical JSON (canonical of bell-chain.mjs, line for line): recursively sorted keys, no incidental whitespace. */
export function canonical(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") { if (!Number.isFinite(v)) throw new Error("non-finite number in digest"); return String(v); }
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`).join(",")}}`;
}
/** The signed bytes of a line: UTF-8 of canonical(the line without sig and sig_new). */
export function signingBytes(line: Readonly<Record<string, unknown>>): Uint8Array {
  const body: Record<string, unknown> = { ...line };
  delete body.sig;
  delete body.sig_new;
  return enc.encode(canonical(body));
}
/** line_hash = SHA-256(canonical(the whole line)), lowercase hex; the next line carries it as prev_line_hash. */
export const lineHashOf = async (line: unknown, sha256: Sha256): Promise<string> => toHex(await sha256(enc.encode(canonical(line))));
/** RFC 9162 s2.1.1: leaf SHA-256(0x00 || line), node SHA-256(0x01 || left || right). */
export const leafOf = (line: Uint8Array, sha256: Sha256): Promise<Uint8Array> => sha256(cat([Uint8Array.of(0), line]));
export const nodeOf = (left: Uint8Array, right: Uint8Array, sha256: Sha256): Promise<Uint8Array> => sha256(cat([Uint8Array.of(1), left, right]));
/** The Merkle root of the lines of a served file AS SERVED (each leaf over the bytes of its line without the LF, never a
 *  reserialization), split at the largest power of two below n; SHA-256 of nothing when there is no line. */
export async function rootOf(rows: readonly string[], sha256: Sha256): Promise<string> {
  const mth = async (xs: readonly Uint8Array[]): Promise<Uint8Array> => {
    let k = 1;
    while (k * 2 < xs.length) k *= 2;
    return xs.length === 1 ? (xs[0] as Uint8Array) : nodeOf(await mth(xs.slice(0, k)), await mth(xs.slice(k)), sha256);
  };
  return toHex(rows.length === 0 ? await sha256(new Uint8Array(0)) : await mth(await Promise.all(rows.map((r) => leafOf(enc.encode(r), sha256)))));
}
/** The 64 bytes of a canonical base64url Ed25519 signature (86 characters, the last one carrying two bits), else null. */
export const signatureOf = (s: unknown): Uint8Array | null => (typeof s === "string" && /^[A-Za-z0-9_-]{85}[AQgw]$/.test(s)
  ? Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)) : null);
/** The LF-terminated lines of a served body, without their LF, decoded as strict UTF-8 (an empty body has none). */
function linesOf(b: Uint8Array, rel: string): string[] {
  const t = utf8.decode(b);
  if (t !== "" && !t.endsWith("\n")) throw new Error(`${rel} lacks its final newline`);
  return t === "" ? [] : t.slice(0, -1).split("\n");
}

/** A bounded source over the injected transport, as urlSource of the reader's tool: 200 only; the files counted before each GET; one
 *  timer per GET over the headers and the body, raced, so it holds whatever the transport does with the signal; the bytes of each body
 *  and of the whole reread counted as they stream; a refusal cancels the body and throws. */
export function boundedSource(get: DojoLiveGet, bounds: DojoLiveBounds = DOJO_LIVE_BOUNDS): (rel: string) => Promise<Uint8Array> {
  let files = 0, total = 0;
  return async (rel) => {
    if (++files > bounds.MAX_FILES) throw new Error("the reread reads too many files");
    const ctl = new AbortController();
    const late = new Promise<never>((_, no) => { ctl.signal.addEventListener("abort", () => { no(new Error(`${rel}: timed out`)); }); });
    const timer = setTimeout(() => { ctl.abort(); }, bounds.TIMEOUT_MS);
    let reader: DojoLiveReader | null = null, n = 0;
    try {
      const res = await Promise.race([get(rel, ctl.signal), late]);
      reader = res.body === null ? null : res.body.getReader();
      if (res.status !== 200 || reader === null) throw new Error(`${rel}: status ${String(res.status)}`);
      const parts: Uint8Array[] = [];
      for (;;) {
        const r = await Promise.race([reader.read(), late]);
        if (r.done) return cat(parts);
        const c = r.value ?? new Uint8Array(0);
        if ((n += c.length) > bounds.MAX_BODY_BYTES) throw new Error(`${rel}: beyond the bound of a body`);
        if ((total += c.length) > bounds.MAX_TOTAL_BYTES) throw new Error("beyond the bound of a whole reread");
        parts.push(c);
      }
    } catch (e) {
      await reader?.cancel().catch(() => undefined);
      throw e;
    } finally {
      clearTimeout(timer);
    }
  };
}

// -- The walker's forms and checks (walkDojoTimeline, apps/dojo/scripts/dojo-chain.mjs), recoded; the refusals keep its codes --
type Line = Record<string, unknown>;
const isObj = (v: unknown): v is Line => v !== null && typeof v === "object" && !Array.isArray(v);
const same = (keys: readonly string[], want: readonly string[]): boolean => keys.length === want.length && want.every((k) => keys.includes(k));
const DAY_MS = 86_400_000, HEX64 = /^[0-9a-f]{64}$/, DECIMAL = /^(0|[1-9][0-9]*)$/, DAY = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const SCHEMA = "dojo-timeline-v1", GENESIS = "0".repeat(64), DAY_ONE = "2026-09-10";
const hex64 = (s: unknown): boolean => typeof s === "string" && HEX64.test(s);
const dec = (s: unknown): boolean => typeof s === "string" && DECIMAL.test(s);
const positive = (s: unknown): boolean => dec(s) && s !== "0";
const count = (n: unknown): boolean => Number.isSafeInteger(n) && (n as number) >= 1;
const int0 = (n: unknown): boolean => Number.isSafeInteger(n) && (n as number) >= 0;
const named = (s: unknown): boolean => typeof s === "string" && s !== "";
const fraction = (f: unknown): boolean => Array.isArray(f) && f.length === 2 && dec(f[0]) && positive(f[1]);
function dayOf(s: unknown): number | null {
  if (typeof s !== "string" || !DAY.test(s)) return null;
  const t = Date.parse(`${s}T00:00:00.000Z`);
  return Number.isFinite(t) && new Date(t).toISOString().startsWith(s) ? t / DAY_MS : null;
}
function instantOf(s: unknown): number | null {
  const t = typeof s === "string" ? Date.parse(s) : NaN;
  return Number.isFinite(t) && new Date(t).toISOString() === s ? t : null;
}
const KINDS = ["anchor", "snapshot", "price_version", "history", "key_rotation", "key_revocation"];
const READ_RULE = ["beacon_chain_hash", "beacon_public_key", "beacon_scheme", "beacon_genesis_time", "beacon_period", "read_offset_s",
  "read_tolerance_s", "sol_usd_max_age_s"];
/** Closed keys of a line of each followed kind (the reader's tool): the common keys, then those of its kind. */
const COMMON = ["schema", "seq", "kind", "prev_line_hash", "key_id", "published_at", "sig"];
const FIELDS: Readonly<Record<string, readonly string[]>> = {
  anchor: ["seed_anchor", "mint", "program", "k_reads", "horizon", "validation_days", "objective_unit_microusd_days", "tier_units", "tier_windows",
    "price_window_days", "pool", "pool_quote_vault", "sol_usd_source", "dust_threshold_microusd", "read_rule"],
  snapshot: ["day", "seed", "beacon", "reads", "mint", "decimals", "price_version", "lines_sha256", "lines_count", "root", "score_total",
    "validated_total", "holders_count", "status"],
  price_version: ["price_version", "effective_day", "window_first_day", "pool_price_daily", "usd_per_sol_daily", "unit_price_microusd",
    "threshold_unit", "dust_threshold"],
  history: ["history_first_day", "history_last_day", "history_sha256", "history_lines_count", "history_root"],
};
const LINE_KEYS = ["address", "class", "reads", "day_value", "lots", "score", "validated", "provisional", "units", "tier", "holder_counted"];

function anchorForm(l: Line): boolean {
  const u = l.tier_units, w = l.tier_windows, big = (x: unknown): bigint => BigInt(x as string);
  return hex64(l.seed_anchor) && [l.mint, l.program, l.pool, l.pool_quote_vault, l.sol_usd_source].every(named)
    && [l.k_reads, l.horizon, l.validation_days].every(count) && (l.k_reads as number) <= 255 && positive(l.objective_unit_microusd_days)
    && positive(l.dust_threshold_microusd) && Array.isArray(u) && u.length === 5 && u.every(positive) && u[0] === "1"
    && u.every((x, k) => k === 0 || big(x) > big(u[k - 1])) && Array.isArray(w) && w.length === 5 && w.every(count)
    && w.every((x, k) => k === 0 || (x as number) >= (w[k - 1] as number)) && l.price_window_days === 7 && instantOf(l.published_at) !== null;
}
const readRuleForm = (r: unknown): boolean => isObj(r) && Object.keys(r).length === 8 && READ_RULE.every((k) => Object.hasOwn(r, k))
  && hex64(r.beacon_chain_hash) && typeof r.beacon_public_key === "string" && /^[0-9a-f]{192}$/.test(r.beacon_public_key)
  && r.beacon_scheme === "bls-unchained-g1-rfc9380" && Number.isSafeInteger(r.beacon_genesis_time) && (r.beacon_genesis_time as number) >= 0
  && count(r.beacon_period) && r.read_offset_s === 900 && r.read_tolerance_s === 600 && r.sol_usd_max_age_s === 165;

/** The walker's state, folded over every served line: the anchor in force and its seed chain, the history's end, the last snapshot day,
 *  the versions with their effect days. */
interface State { anchor: Line | null; anchorDay: number; seed: string; seedDay: number; history: number | null; last: number | null;
  versions: { v: number; eff: number; line: Line }[] }
async function hashTimes(seed: string, j: number, sha256: Sha256): Promise<string> {
  let b: Uint8Array = Uint8Array.from(seed.match(/../g) ?? [], (x) => parseInt(x, 16));
  for (let k = 0; k < j; k++) b = await sha256(b);
  return toHex(b);
}
function versionCheck(l: Line, st: State): string | null {
  const W = (st.anchor as Line).price_window_days as number, eff = dayOf(l.effective_day), first = dayOf(l.window_first_day), prev = st.versions.at(-1);
  const seven = (s: unknown): boolean => Array.isArray(s) && s.length === W && s.every(fraction);
  const t = instantOf(l.published_at), unit = l.unit_price_microusd;
  if (!count(l.price_version) || eff === null || first === null || !seven(l.pool_price_daily) || !seven(l.usd_per_sol_daily) || !fraction(unit)
    || !positive((unit as unknown[])[0]) || !positive(l.threshold_unit) || !positive(l.dust_threshold) || t === null
    || (prev !== undefined && ((l.price_version as number) <= prev.v || eff <= prev.eff))) return "timeline_malformed";
  if (eff <= first + W - 1 || t < (first + W) * DAY_MS || st.last === null || st.last < first + W - 1) return "price_version_mismatch";
  if (eff <= st.last) return "version_not_in_force";
  st.versions.push({ v: l.price_version as number, eff, line: l });
  return null;
}
async function snapshotCheck(l: Line, st: State, sha256: Sha256): Promise<string | null> {
  const d = dayOf(l.day), t = instantOf(l.published_at);
  if (d === null || t === null || !hex64(l.seed) || !Array.isArray(l.reads) || !(l.price_version === null || count(l.price_version))
    || st.history === null) return "timeline_malformed";
  if (d <= Math.max(st.last ?? -Infinity, st.anchorDay, st.history)) return "day_not_increasing";
  if (t < (d + 1) * DAY_MS) return "seed_revealed_early";
  const horizon = (st.anchor as Line).horizon as number;
  if (d - st.anchorDay > horizon || (await hashTimes(l.seed as string, d - st.seedDay, sha256)) !== st.seed) return "seed_chain_broken";
  const force = st.versions.filter((v) => v.eff <= d).pop();
  if (l.price_version !== (force === undefined ? null : force.v)) return "version_not_in_force";
  Object.assign(st, { last: d, seed: l.seed, seedDay: d });
  return null;
}
async function dojoCheck(l: Line, first: boolean, st: State, sha256: Sha256): Promise<string | null> {
  if (first && l.kind !== "anchor") return "anchor_missing";
  if (l.kind === "anchor") {
    if (!anchorForm(l) || !readRuleForm(l.read_rule)) return "timeline_malformed";
    const day = Math.floor((instantOf(l.published_at) as number) / DAY_MS);
    Object.assign(st, { anchor: l, anchorDay: day, seed: l.seed_anchor, seedDay: day });
    return null;
  }
  if (l.kind === "history") {
    const a = dayOf(l.history_first_day), b = dayOf(l.history_last_day);
    if (st.history !== null || l.history_first_day !== DAY_ONE || a === null || b === null || a > b || !hex64(l.history_sha256)
      || !hex64(l.history_root) || !int0(l.history_lines_count)) return "timeline_malformed";
    st.history = b;
    return null;
  }
  if (l.kind === "price_version") return versionCheck(l, st);
  return l.kind === "snapshot" ? snapshotCheck(l, st, sha256) : null;
}
/** The fields of a snapshot that the reader's tool checks beyond the walker, and that the projection reads. */
const snapshotFields = (l: Line, anchor: Line): boolean => hex64(l.lines_sha256) && hex64(l.root) && int0(l.lines_count) && l.mint === anchor.mint
  && int0(l.decimals) && (l.status === "counted" || l.status === "abstained");

/** Reread the head of the day against the committed record: one outcome, never a throw (see the header). */
export async function rereadDojoHead(committed: DojoServedData, deps: DojoLiveDeps): Promise<DojoLiveOutcome> {
  const { sha256 } = deps, bounds = deps.bounds ?? DOJO_LIVE_BOUNDS, source = boundedSource(deps.get, bounds), at = committed.head.seq;
  const fallback = (seq: number | null, why: string): DojoLiveOutcome => ({ kind: "fallback", seq, why });
  try {
    const raws = linesOf(await source("timeline.jsonl"), "timeline.jsonl");
    if (raws.length < at) return fallback(null, "the served timeline ends before the committed head");
    const trust = new Map(committed.keyring.keys.map((k) => [k.key_id, k]));
    const revoked = new Map<string, number>();
    for (const k of committed.keyring.keys) if (k.revoked_from_seq !== undefined) revoked.set(k.key_id, k.revoked_from_seq);
    const st: State = { anchor: null, anchorDay: 0, seed: "", seedDay: 0, history: null, last: null, versions: [] };
    let prev = GENESIS, active: unknown = null, head: { l: Line; hash: string; anchor: Line } | null = null;
    for (const [i, raw] of raws.entries()) {
      const seq = i + 1, fail = (why: string): DojoLiveOutcome => fallback(seq, why);
      if (enc.encode(raw).length + 1 > bounds.MAX_LINE_BYTES) return fail("a timeline line beyond the bound of a line");
      let l: unknown = null; try { l = readJson(raw); canonical(l); } catch { l = null; } // not JSON, past the depth bound, or 1e400: malformed below
      if (!isObj(l) || l.schema !== SCHEMA || l.seq !== seq || !KINDS.includes(l.kind as string)) return fail("timeline_malformed");
      if (l.prev_line_hash !== prev) return fail("chain_broken");
      const key = trust.get(l.key_id as string), keyLine = l.kind === "key_rotation" || l.kind === "key_revocation";
      if (seq > at) {
        if (key === undefined) return fail("key_not_in_keyring");
        const sig = signatureOf(l.sig);
        if (sig === null || !(await deps.verifyEd25519(key.public_key.x, signingBytes(l), sig))) return fail("signature_invalid");
        if (keyLine) return { kind: "key_change", seq };
        if (l.key_id !== active) return fail("key_not_active");
        if (!same(Object.keys(l), [...COMMON, ...(FIELDS[l.kind as string] ?? [])])) return fail("timeline_malformed");
        if (seq < key.valid_from_seq || seq > (key.valid_to_seq ?? Infinity) || seq >= (revoked.get(key.key_id) ?? Infinity)) return fail("key_not_active");
      }
      if (seq === 1) active = l.key_id;
      if (l.kind === "key_rotation") active = l.new_key_id;
      const r = l.revoked_key_id as string;
      if (l.kind === "key_revocation") revoked.set(r, Math.min(revoked.get(r) ?? Infinity, l.revoked_from_seq as number));
      const why = await dojoCheck(l, seq === 1, st, sha256);
      if (why !== null) return fail(why);
      if (seq > at && l.kind === "snapshot" && !snapshotFields(l, st.anchor as Line)) return fail("timeline_malformed");
      prev = await lineHashOf(l, sha256);
      if (seq === at && prev !== committed.head.line_hash) return fail("the served line at the committed head's seq is not the committed one");
      if (l.kind === "snapshot") head = { l, hash: prev, anchor: st.anchor as Line };
    }
    return head === null ? fallback(null, "no snapshot") : await project(head, st.versions, committed.head, source, sha256);
  } catch (e) {
    return fallback(null, e instanceof Error ? e.message : String(e));
  }
}

/** The new head's figures, bound to its lines file as buildDojoServed binds them; the version is the one the head names. */
async function project(head: { l: Line; hash: string; anchor: Line }, versions: State["versions"], c: DojoServedHead,
  source: (rel: string) => Promise<Uint8Array>, sha256: Sha256): Promise<DojoLiveOutcome> {
  const h = head.l, seq = h.seq as number, pv = h.price_version as number | null, fail = (why: string): DojoLiveOutcome => ({ kind: "fallback", seq, why });
  const version = pv === null ? null : versions.find((v) => v.v === pv)?.line;
  if (version === undefined) return fail("the head names a version the timeline does not carry");
  if (version !== null && pv === c.price_version && (version.threshold_unit !== c.threshold_unit || version.dust_threshold !== c.dust_threshold)) {
    return fail("the version the committed head names carries other thresholds");
  }
  const rows = await bindDojoLines(await source(`lines/${h.lines_sha256 as string}.jsonl`), h, sha256);
  if (typeof rows === "string") return fail(rows);
  const reads = (h.reads as unknown[]).filter(isObj), mins = reads.map((r) => r.slot_min).filter((x) => x !== null);
  const maxs = reads.map((r) => r.slot_max).filter((x) => x !== null), m = mins as number[], M = maxs as number[];
  if (![...mins, ...maxs].every(int0) || m.length !== M.length || (m.length === 0 && h.status === "counted")) return fail("a counted head without a reading");
  return { kind: "reread", head: { seq, day: h.day as string, status: h.status as DojoServedHead["status"], lines_count: rows.length,
    root: h.root as string, lines_sha256: h.lines_sha256 as string, score_total: h.score_total as string, validated_total: h.validated_total as string,
    holders_count: h.holders_count as number | null, price_version: pv, threshold_unit: version === null ? null : (version.threshold_unit as string),
    dust_threshold: version === null ? null : (version.dust_threshold as string), decimals: h.decimals as number, k_reads: head.anchor.k_reads as number,
    reads_done: m.length, slot_min: m.length === 0 ? null : Math.min(...m), slot_max: M.length === 0 ? null : Math.max(...M), line_hash: head.hash,
    key_id: h.key_id as string, published_at: h.published_at as string }, rows, anchor: head.anchor };
}

/** The lines of a lines file AS SERVED (each without its LF), bound to the signed line that names it (the reread's new head, or the
 *  committed head, whose file the table lists): count, SHA-256, Merkle root, closed keys, sums and holders, in this order; else the
 *  refusal. A body out of UTF-8 or without its final LF throws; a line not JSON, past the depth bound or that canonical cannot write is line_malformed. */
export async function bindDojoLines(bytes: Uint8Array, h: Line | DojoServedHead, sha256: Sha256): Promise<string[] | string> {
  const rows = linesOf(bytes, `lines/${h.lines_sha256 as string}.jsonl`);
  if (rows.length !== h.lines_count) return "lines_count_mismatch";
  if (toHex(await sha256(bytes)) !== h.lines_sha256) return "lines_sha_mismatch";
  if ((await rootOf(rows, sha256)) !== h.root) return "root_mismatch";
  const objs = rows.map((s): unknown => { try { const o: unknown = readJson(s); canonical(o); return o; } catch { return null; } }).filter(isObj);
  if (objs.length !== rows.length || !objs.every((o) => same(Object.keys(o), LINE_KEYS))) return "line_malformed";
  const sum = (k: string): string | null => (objs.every((o) => dec(o[k])) ? String(objs.reduce((t, o) => t + BigInt(o[k] as string), 0n)) : null);
  if (sum("score") !== h.score_total || sum("validated") !== h.validated_total) return "the lines do not sum to the signed totals";
  if ((h.price_version === null ? null : objs.filter((o) => o.holder_counted === true).length) !== h.holders_count) return "holders_count_mismatch";
  return rows;
}

/** The deepest nesting of objects and arrays a served JSON text may carry: DOJO_MAX_DEPTH of the timeline walker (dojo-chain.mjs), restated,
 *  since this file imports no value; pinned equal by test. */
export const DOJO_LIVE_MAX_DEPTH = 16;
/** jsonDepth of dojo-chain.mjs, restated and pinned equal by test: the deepest nesting of objects and arrays in a JSON text, in one pass over its
 *  characters, a string skipped with its escapes (code 92 skips the character after it); nothing is parsed and nothing recurses. */
export function jsonDepth(text: string): number {
  let depth = 0, max = 0, str = false;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (str) { if (c === 92) i++; else if (c === 34) str = false; } else if (c === 34) str = true;
    else if (c === 123 || c === 91) { depth++; if (depth > max) max = depth; } else if (c === 125 || c === 93) depth--;
  }
  return max;
}
/** A served text parsed only within the bound, where one not JSON throws; past it, null, JSON or not, never parsed, which no line of the reread accepts. */
function readJson(text: string): unknown {
  return jsonDepth(text) > DOJO_LIVE_MAX_DEPTH ? null : (JSON.parse(text) as unknown);
}
