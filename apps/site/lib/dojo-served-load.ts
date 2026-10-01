// apps/site/lib/dojo-served-load.ts -- the committed facts about the SERVED Dojo host, read by /dojo.
// Two halves, one closed shape:
//   - buildDojoServed(): the PURE projection the source-repo sync applies to the served tree it read (timeline.jsonl,
//     dojo/pubkey.json, lines/<sha256>.jsonl, history/<sha256>.jsonl). It walks the whole timeline under the COMMITTED keyring (the
//     chain functions are injected: this module imports nothing from the publisher or the reader's tool), refuses a voided line or a
//     broken rotation, takes the head as the walker's last snapshot line, then binds the head's lines file and the history file to
//     their signed lines: sha256 of the bytes, count of lines and the Merkle root recomputed by the injected rootOf. The page figures
//     are composed from those lines (sums of the hold scores and of the validated points, count of the counted holders) and must equal
//     the signed totals. It does not recompute lots, points, units, tiers, versions or key windows itself: it then runs the reader's
//     tool (injected verify) on the very bytes it projects, under the committed keyring, and refuses unless the tool accepts the tree
//     and recomputes the signed roots of the head and of the history, so the page never composes a figure the tool refuses.
//   - loadDojoServed(): the build-time loader. No file and no manifest entry is the state without any served snapshot: it returns
//     null. Otherwise it reads apps/site/data/dojo-served.json ONLY after its sha256 (CRLF->LF, UTF-8) equals the site manifest entry,
//     then checks the CLOSED shape. FAIL-CLOSED: a file without its entry, an entry without its file, a hash mismatch, an extra or
//     missing key or a malformed value throws, so `next build` reds rather than render an unchecked record.
// Self-contained (node built-ins only, no alias or relative import): shared by the page, the sync and the root tests.
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const DOJO_SERVED_REL = "apps/site/data/dojo-served.json";
export const DOJO_SERVED_SCHEMA = "monark-site-dojo-served-v1";
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
/** The one Dojo host and its served layout (the paths of the tree read by the sync). */
export const DOJO_HOST = "https://dojo.monarkgate.tech";
export const DOJO_TIMELINE_PATH = "timeline.jsonl";
export const DOJO_PUBKEY_PATH = "dojo/pubkey.json";
export const dojoLinesPathOf = (sha256: string): string => `lines/${sha256}.jsonl`;
export const dojoHistoryPathOf = (sha256: string): string => `history/${sha256}.jsonl`;

// -- Closed keys (the timeline line of each kind, the head record, the dojo-keyring-v1 key set) --
export const DOJO_HEAD_KEYS = ["seq", "day", "status", "lines_count", "root", "lines_sha256", "score_total", "validated_total", "holders_count",
  "price_version", "threshold_unit", "dust_threshold", "decimals", "k_reads", "reads_done", "slot_min", "slot_max", "line_hash", "key_id", "published_at"] as const;
export const DOJO_HISTORY_KEYS = ["history_first_day", "history_last_day", "history_sha256", "history_lines_count", "history_root"] as const;
/** The signed anchor line, carried whole: the one committed source of k_reads, validation_days, tier_units and tier_windows. */
export const DOJO_ANCHOR_KEYS = ["schema", "seq", "kind", "prev_line_hash", "key_id", "published_at", "sig", "seed_anchor", "mint", "program", "k_reads",
  "horizon", "validation_days", "objective_unit_microusd_days", "tier_units", "tier_windows", "price_window_days", "pool", "pool_quote_vault",
  "sol_usd_source", "dust_threshold_microusd", "read_rule"] as const;
export const DOJO_READ_RULE_KEYS = ["beacon_chain_hash", "beacon_public_key", "beacon_scheme", "beacon_genesis_time", "beacon_period", "read_offset_s",
  "read_tolerance_s", "sol_usd_max_age_s"] as const;

// -- Types of the loaded data --
export type DojoStatus = "counted" | "abstained";
export interface DojoServedHead {
  seq: number; day: string; status: DojoStatus; lines_count: number; root: string; lines_sha256: string; score_total: string; validated_total: string;
  holders_count: number | null; price_version: number | null; threshold_unit: string | null; dust_threshold: string | null; decimals: number;
  k_reads: number; reads_done: number; slot_min: number | null; slot_max: number | null; line_hash: string; key_id: string; published_at: string;
}
export interface DojoServedHistory { history_first_day: string; history_last_day: string; history_sha256: string; history_lines_count: number; history_root: string }
export interface DojoKeyringEntry { key_id: string; public_key: { kty: "OKP"; crv: "Ed25519"; x: string }; valid_from_seq: number; valid_to_seq?: number; revoked_from_seq?: number }
export interface DojoServedData {
  host: string; read_at: string;
  timeline: { schema: string; lines: number; snapshots: number; anchor: Readonly<Record<string, unknown>> };
  head: DojoServedHead; history: DojoServedHistory;
  keyring: { schema: "dojo-keyring-v1"; keys: DojoKeyringEntry[] };
  bodies_sha256: { timeline: string; pubkey: string };
}

const HEX64 = /^[0-9a-f]{64}$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const DEC = /^(?:0|[1-9]\d*)$/;
const B64URL = /^[A-Za-z0-9_-]+$/;
const SCHEMA_ID = /^[a-z][a-z0-9-]*-v\d+$/;

function fail(why: string): never {
  throw new Error(`dojo served: ${why}`);
}
const isObj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);
function obj(v: unknown, keys: readonly string[], where: string, optional: readonly string[] = []): Record<string, unknown> {
  if (!isObj(v)) return fail(`${where} must be an object`);
  const got = Object.keys(v).filter((k) => !optional.includes(k)).sort().join(",");
  if (got !== [...keys].sort().join(",")) return fail(`${where} must carry exactly {${keys.join(", ")}}, got {${Object.keys(v).sort().join(",")}}`);
  return v;
}
function str(v: unknown, re: RegExp, where: string): string {
  if (typeof v !== "string" || !re.test(v)) return fail(`${where} is malformed`);
  return v;
}
function int(v: unknown, where: string, min = 0): number {
  if (typeof v !== "number" || !Number.isSafeInteger(v) || v < min) return fail(`${where} must be an integer >= ${String(min)}`);
  return v;
}
const orNull = <T>(v: unknown, f: (x: unknown) => T): T | null => (v === null ? null : f(v));
const list = (v: unknown, where: string, n: number): unknown[] => (Array.isArray(v) && v.length === n ? v : fail(`${where} must be a list of ${String(n)}`));

/** The signed anchor line as committed: closed keys at both levels, and the forms the page reads. */
function anchorOf(v: unknown): Record<string, unknown> {
  const a = obj(v, DOJO_ANCHOR_KEYS, "timeline.anchor");
  if (a.kind !== "anchor") fail("timeline.anchor is not an anchor line");
  obj(a.read_rule, DOJO_READ_RULE_KEYS, "timeline.anchor.read_rule");
  int(a.seq, "timeline.anchor.seq", 1); int(a.horizon, "timeline.anchor.horizon", 1); int(a.validation_days, "timeline.anchor.validation_days", 1);
  if (int(a.k_reads, "timeline.anchor.k_reads", 1) > 255) fail("timeline.anchor.k_reads is out of range");
  list(a.tier_units, "timeline.anchor.tier_units", 5).forEach((x, i) => str(x, DEC, `timeline.anchor.tier_units[${String(i)}]`));
  list(a.tier_windows, "timeline.anchor.tier_windows", 5).forEach((x, i) => int(x, `timeline.anchor.tier_windows[${String(i)}]`, 1));
  str(a.key_id, HEX64, "timeline.anchor.key_id"); str(a.prev_line_hash, HEX64, "timeline.anchor.prev_line_hash"); str(a.sig, B64URL, "timeline.anchor.sig");
  str(a.published_at, ISO_UTC, "timeline.anchor.published_at"); str(a.schema, SCHEMA_ID, "timeline.anchor.schema");
  return a;
}

/** The committed record, or null in the state without any served snapshot (no file AND no manifest entry). Throws otherwise when unchecked. */
export function loadDojoServed(rootDir: string): DojoServedData | null {
  const manifest = JSON.parse(readFileSync(join(rootDir, MANIFEST_REL), "utf8")) as { algorithm?: unknown; files?: Record<string, unknown> };
  if (manifest.algorithm !== "sha256" || !isObj(manifest.files)) fail("site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files[DOJO_SERVED_REL], present = existsSync(join(rootDir, DOJO_SERVED_REL));
  if (expected === undefined && !present) return null;
  if (typeof expected !== "string") fail(`${DOJO_SERVED_REL} is not listed in the site manifest (fail-closed)`);
  if (!present) fail(`${DOJO_SERVED_REL} is listed in the site manifest but absent (fail-closed)`);
  const raw = readFileSync(join(rootDir, DOJO_SERVED_REL), "utf8");
  const actual = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  if (actual !== expected) fail(`sha256 mismatch for ${DOJO_SERVED_REL} (manifest ${expected}, actual ${actual})`);

  const d = obj(JSON.parse(raw) as unknown, ["$comment", "schema", "host", "read_at", "timeline", "head", "history", "keyring", "bodies_sha256"], "file");
  if (d.schema !== DOJO_SERVED_SCHEMA) fail(`schema is not ${DOJO_SERVED_SCHEMA}`);
  if (d.host !== DOJO_HOST) fail(`host must be ${DOJO_HOST}`);
  const tl = obj(d.timeline, ["schema", "lines", "snapshots", "anchor"], "timeline");
  const h = obj(d.head, DOJO_HEAD_KEYS, "head"), hi = obj(d.history, DOJO_HISTORY_KEYS, "history");
  const kr = obj(d.keyring, ["schema", "keys"], "keyring"), b = obj(d.bodies_sha256, ["timeline", "pubkey"], "bodies_sha256");
  if (kr.schema !== "dojo-keyring-v1" || !Array.isArray(kr.keys) || kr.keys.length === 0) fail("keyring must be a non-empty dojo-keyring-v1");
  const keys = kr.keys.map((x: unknown, i): DojoKeyringEntry => {
    const w = `keyring.keys[${String(i)}]`, e = obj(x, ["key_id", "public_key", "valid_from_seq"], w, ["valid_to_seq", "revoked_from_seq"]);
    const pk = obj(e.public_key, ["kty", "crv", "x"], `${w}.public_key`);
    if (pk.kty !== "OKP" || pk.crv !== "Ed25519") fail(`${w}.public_key is not an Ed25519 key`);
    const from = int(e.valid_from_seq, `${w}.valid_from_seq`, 1);
    return { key_id: str(e.key_id, HEX64, `${w}.key_id`), public_key: { kty: "OKP", crv: "Ed25519", x: str(pk.x, B64URL, `${w}.public_key.x`) }, valid_from_seq: from,
      ...(e.valid_to_seq === undefined ? {} : { valid_to_seq: int(e.valid_to_seq, `${w}.valid_to_seq`, from) }),
      ...(e.revoked_from_seq === undefined ? {} : { revoked_from_seq: int(e.revoked_from_seq, `${w}.revoked_from_seq`, 1) }) };
  });
  const status = h.status === "counted" || h.status === "abstained" ? h.status : fail("head.status must be counted or abstained");
  const head: DojoServedHead = {
    seq: int(h.seq, "head.seq", 1), day: str(h.day, ISO_DAY, "head.day"), status, lines_count: int(h.lines_count, "head.lines_count"),
    root: str(h.root, HEX64, "head.root"), lines_sha256: str(h.lines_sha256, HEX64, "head.lines_sha256"),
    score_total: str(h.score_total, DEC, "head.score_total"), validated_total: str(h.validated_total, DEC, "head.validated_total"),
    holders_count: orNull(h.holders_count, (x) => int(x, "head.holders_count")), price_version: orNull(h.price_version, (x) => int(x, "head.price_version", 1)),
    threshold_unit: orNull(h.threshold_unit, (x) => str(x, DEC, "head.threshold_unit")), dust_threshold: orNull(h.dust_threshold, (x) => str(x, DEC, "head.dust_threshold")),
    decimals: int(h.decimals, "head.decimals"), k_reads: int(h.k_reads, "head.k_reads", 1), reads_done: int(h.reads_done, "head.reads_done"),
    slot_min: orNull(h.slot_min, (x) => int(x, "head.slot_min")), slot_max: orNull(h.slot_max, (x) => int(x, "head.slot_max")),
    line_hash: str(h.line_hash, HEX64, "head.line_hash"), key_id: str(h.key_id, HEX64, "head.key_id"), published_at: str(h.published_at, ISO_UTC, "head.published_at"),
  };
  // A version in force carries the unit, the dust threshold and the count of holders; none of them exists without it.
  const versioned = [head.holders_count, head.threshold_unit, head.dust_threshold].map((x) => x !== null);
  if (versioned.some((x) => x !== (head.price_version !== null))) fail("head: holders_count, threshold_unit and dust_threshold exist exactly with a price_version");
  if ((head.slot_min === null) !== (head.slot_max === null) || (head.slot_min === null) !== (head.reads_done === 0)) fail("head: slots exactly with a reading");
  if (head.slot_min !== null && head.slot_max !== null && head.slot_min > head.slot_max) fail("head: slot_min exceeds slot_max");
  if ((status === "counted" && head.reads_done === 0) || head.reads_done > head.k_reads) fail("head: reads_done is at least 1 when counted, at most k_reads");
  if (BigInt(head.validated_total) > BigInt(head.score_total) || (head.holders_count ?? 0) > head.lines_count) fail("head: totals disagree");
  const anchor = anchorOf(tl.anchor);
  const timeline = { schema: str(tl.schema, SCHEMA_ID, "timeline.schema"), lines: int(tl.lines, "timeline.lines", 1), snapshots: int(tl.snapshots, "timeline.snapshots", 1), anchor };
  if (anchor.schema !== timeline.schema || (anchor.seq as number) >= head.seq || head.seq > timeline.lines || timeline.snapshots > timeline.lines) fail("head, anchor and timeline counts disagree");
  if (head.k_reads !== anchor.k_reads) fail("head.k_reads is not the anchor's");
  if (!keys.some((k) => k.key_id === head.key_id) || !keys.some((k) => k.key_id === anchor.key_id)) fail("every signing key must be in the committed keyring");
  const history: DojoServedHistory = {
    history_first_day: str(hi.history_first_day, ISO_DAY, "history.history_first_day"), history_last_day: str(hi.history_last_day, ISO_DAY, "history.history_last_day"),
    history_sha256: str(hi.history_sha256, HEX64, "history.history_sha256"), history_lines_count: int(hi.history_lines_count, "history.history_lines_count"),
    history_root: str(hi.history_root, HEX64, "history.history_root"),
  };
  if (history.history_first_day > history.history_last_day || history.history_last_day >= head.day) fail("history must end before the head's day");
  return { host: DOJO_HOST, read_at: str(d.read_at, ISO_UTC, "read_at"), timeline, head, history, keyring: { schema: "dojo-keyring-v1", keys },
    bodies_sha256: { timeline: str(b.timeline, HEX64, "bodies_sha256.timeline"), pubkey: str(b.pubkey, HEX64, "bodies_sha256.pubkey") } };
}

// -- The projection applied by the sync (no I/O of its own; the chain functions and the check of the reader's tool are injected) --
export interface DojoChainDeps<T extends ReadonlyMap<string, { x: string }>> {
  /** dojo-keyring-v1 -> its trust set, null when malformed (dojoTrustOf). */
  trustOf: (keyring: unknown) => { trust: T } | null;
  /** The timeline walker under a trust set (walkDojoTimeline): {ok, head, voided, breaks} or {ok: false, seq, reason}. */
  walk: (lines: readonly unknown[], trust: T) => unknown;
  lineHash: (line: unknown) => string;
  /** The Merkle root of LF-less line bytes (rootOf, RFC 9162 s2.1.1). */
  rootOf: (lines: readonly string[]) => string;
  /** The reader's complete check (verifyDojoServed) of a source under a supplied keyring: {ok: true, head, history} or {ok: false, reason}. */
  verify: (opts: { source: { get: (rel: string) => Promise<Buffer> }; keyring: unknown }) => Promise<unknown>;
}
export interface DojoServedBuildInput {
  readAt: string;
  /** The served tree as read: DOJO_TIMELINE_PATH, DOJO_PUBKEY_PATH, and the lines and history files by their sha256 paths. */
  tree: ReadonlyMap<string, Uint8Array>;
  /** The committed dojo-keyring-v1 bytes: the trust root (never the served dojo/pubkey.json). */
  committedKeyring: Uint8Array;
}
const sha256Hex = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");
const utf8 = (b: Uint8Array, where: string): string => { try { return new TextDecoder("utf-8", { fatal: true }).decode(b); } catch { return fail(`${where} is not UTF-8`); } };
const parseJson = (s: string, where: string): unknown => { try { return readJson(s); } catch { return fail(`${where} is not JSON`); } };
/** LF-terminated lines of a body, without their LF (an empty body has none). */
function linesOfBody(b: Uint8Array, where: string): string[] {
  const t = utf8(b, where);
  if (t !== "" && !t.endsWith("\n")) fail(`${where} lacks its final newline`);
  return t === "" ? [] : t.slice(0, -1).split("\n");
}

/** Build the committed record (without writing it). Rejects on any check that does not hold, the reader's tool last. */
export async function buildDojoServed<T extends ReadonlyMap<string, { x: string }>>(input: DojoServedBuildInput, deps: DojoChainDeps<T>): Promise<Record<string, unknown>> {
  const body = (rel: string): Uint8Array => input.tree.get(rel) ?? fail(`the served tree lacks ${rel}`);
  const keyring = parseJson(utf8(input.committedKeyring, "the committed keyring"), "the committed keyring");
  const root = deps.trustOf(keyring) ?? fail("the committed keyring is malformed");
  const served = deps.trustOf(parseJson(utf8(body(DOJO_PUBKEY_PATH), DOJO_PUBKEY_PATH), DOJO_PUBKEY_PATH)) ?? fail(`${DOJO_PUBKEY_PATH} is malformed`);
  for (const [id, k] of served.trust) if (root.trust.get(id)?.x !== k.x) fail(`${DOJO_PUBKEY_PATH} serves a key outside the committed keyring`);
  const lines = linesOfBody(body(DOJO_TIMELINE_PATH), DOJO_TIMELINE_PATH).map((s, i) => walkable(s, i + 1, deps.lineHash));
  const walk = deps.walk(lines, root.trust) as { ok?: unknown; seq?: unknown; reason?: unknown; head?: unknown; voided?: unknown; breaks?: unknown };
  if (walk.ok !== true) fail(`the timeline does not walk under the committed keyring (seq ${String(walk.seq)}: ${String(walk.reason)})`);
  if (!Array.isArray(walk.voided) || walk.voided.length > 0) fail("a line is voided by a revocation; the page renders no voided line (fail-closed)");
  if (!Array.isArray(walk.breaks) || walk.breaks.length > 0) fail("the key schedule carries a broken-continuity rotation; the page renders none yet (fail-closed)");
  const head = isObj(walk.head) ? walk.head : fail("the timeline carries no snapshot");
  const signed = lines.filter(isObj), before = signed.filter((l) => (l.seq as number) < (head.seq as number));
  const anchor = before.filter((l) => l.kind === "anchor").pop() ?? fail("no anchor precedes the head");
  const hist = signed.find((l) => l.kind === "history") ?? fail("the timeline carries no history line");
  const version = head.price_version === null ? null : before.find((l) => l.kind === "price_version" && l.price_version === head.price_version) ?? fail("the head names a version the timeline does not carry");

  // The lines of the head and of the history, bound to their signed lines: sha256, count, then the recomputed Merkle root.
  const bind = (sha: unknown, count: unknown, signedRoot: unknown, rel: string): string[] => {
    const bytes = body(rel), raw = linesOfBody(bytes, rel);
    if (raw.length !== count) fail(`${rel}: the count differs from the signed line`);
    if (sha256Hex(bytes) !== sha) fail(`${rel}: the sha256 differs from the signed line`);
    if (deps.rootOf(raw) !== signedRoot) fail(`${rel}: the recomputed Merkle root differs from the signed root`);
    return raw;
  };
  const dayLines = bind(head.lines_sha256, head.lines_count, head.root, dojoLinesPathOf(str(head.lines_sha256, HEX64, "head lines_sha256")))
    .map((s, i) => obj(parseJson(s, `head line ${String(i + 1)}`), ["address", "class", "reads", "day_value", "lots", "score", "validated", "provisional", "units", "tier", "holder_counted"], `head line ${String(i + 1)}`));
  bind(hist.history_sha256, hist.history_lines_count, hist.history_root, dojoHistoryPathOf(str(hist.history_sha256, HEX64, "history_sha256")));
  // The page figures, composed from the served lines, must be the signed totals.
  const sum = (k: string): string => String(dayLines.reduce((t, l, i) => t + BigInt(str(l[k], DEC, `head line ${String(i + 1)} ${k}`)), 0n));
  if (sum("score") !== head.score_total || sum("validated") !== head.validated_total) fail("the lines do not sum to the signed totals");
  if ((version === null ? null : dayLines.filter((l) => l.holder_counted === true).length) !== head.holders_count) fail("the lines do not count the signed holders_count");
  // The slots of the K reads: the smallest and the largest over every reading made (a day abstained on its mint keeps its readings).
  const reads = Array.isArray(head.reads) ? head.reads.filter(isObj) : fail("the head carries no reads");
  const mins = reads.map((r) => r.slot_min).filter((x) => x !== null).map((x) => int(x, "read slot_min"));
  const maxs = reads.map((r) => r.slot_max).filter((x) => x !== null).map((x) => int(x, "read slot_max"));
  if ((mins.length === 0 && head.status === "counted") || mins.length !== maxs.length) fail("a counted snapshot carries a reading made");
  const slot = (xs: number[], pick: (a: number, b: number) => number): number | null => (xs.length === 0 ? null : xs.reduce(pick));
  // The reader's tool, on the very bytes projected here (views, no copy) and under the committed keyring: lots, points, units,
  // versions and key windows are its checks; the page composes no figure it refuses.
  const source = { get: (rel: string): Promise<Buffer> => { const b = body(rel); return Promise.resolve(Buffer.from(b.buffer, b.byteOffset, b.byteLength)); } };
  const report = (await deps.verify({ source, keyring })) as { ok?: unknown; reason?: unknown; seq?: unknown; detail?: unknown; head?: { recomputed_root?: unknown } | null; history?: { recomputed_root?: unknown } | null };
  if (report.ok !== true) fail(`the reader's tool refuses the served tree under the committed keyring (${String(report.reason)} at seq ${String(report.seq)}: ${String(report.detail)})`);
  if (report.head?.recomputed_root !== head.root || report.history?.recomputed_root !== hist.history_root) fail("the reader's tool recomputes other roots than the signed ones");
  return {
    $comment: "Committed, hashed facts about the SERVED Dojo host, rendered by /dojo through apps/site/lib/dojo-served-load.ts after a sha256 check against apps/site/data/manifest.sha256.json. Written by the source repository's sync tool from the files the host serves: timeline.jsonl walked line by line under the committed keyring; the head = the last snapshot line, its lines file and the history file bound to their signed lines by sha256, count and recomputed Merkle root; the totals composed from the lines equal the signed ones; the reader's tool, run on the same bytes under the committed keyring, accepted the tree and recomputed the signed roots. timeline.anchor = the signed anchor line in force, whole. keyring = the committed keyring. bodies_sha256 = the sha256 of the timeline and of the served key set as read at read_at.",
    schema: DOJO_SERVED_SCHEMA, host: DOJO_HOST, read_at: input.readAt,
    timeline: { schema: head.schema, lines: lines.length, snapshots: signed.filter((l) => l.kind === "snapshot").length, anchor },
    head: { seq: head.seq, day: head.day, status: head.status, lines_count: head.lines_count, root: head.root, lines_sha256: head.lines_sha256,
      score_total: head.score_total, validated_total: head.validated_total, holders_count: head.holders_count, price_version: head.price_version,
      threshold_unit: version === null ? null : version.threshold_unit, dust_threshold: version === null ? null : version.dust_threshold, decimals: head.decimals,
      k_reads: anchor.k_reads, reads_done: mins.length, slot_min: slot(mins, (a, b) => Math.min(a, b)), slot_max: slot(maxs, (a, b) => Math.max(a, b)), line_hash: deps.lineHash(head), key_id: head.key_id, published_at: head.published_at },
    history: Object.fromEntries(DOJO_HISTORY_KEYS.map((k) => [k, hist[k]])),
    keyring,
    bodies_sha256: { timeline: sha256Hex(body(DOJO_TIMELINE_PATH)), pubkey: sha256Hex(body(DOJO_PUBKEY_PATH)) },
  };
}

/** A served timeline line as the walker takes it: read by parseJson (nested past the depth bound, it is null, never parsed, and the walk refuses
 *  it), then hashed through the injected lineHash, whose canonical throws on a number it cannot write (JSON.parse reads 1e400 as Infinity): such
 *  a line is refused as the walk refuses it, timeline_malformed at its seq (the reader's tool says the same), never by that exception. Declared
 *  last, so that no line above it moves (the killers of the tests name lines of this file). */
function walkable(s: string, seq: number, lineHash: (line: unknown) => string): unknown {
  const l = parseJson(s, `timeline line ${String(seq)}`);
  try { lineHash(l); } catch { fail(`the timeline does not walk under the committed keyring (seq ${String(seq)}: timeline_malformed)`); }
  return l;
}

/** The deepest nesting of objects and arrays a served JSON text may carry: DOJO_MAX_DEPTH of the timeline walker (dojo-chain.mjs), restated,
 *  since this module imports nothing of the chain; pinned equal by test. */
export const DOJO_SERVED_MAX_DEPTH = 16;
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
/** A served JSON text parsed only within the bound, where one that is not JSON throws (refused as not JSON); past it, null, JSON or not, never parsed, which
 *  every reader of this module refuses by its own sentence (a timeline line as the walk refuses it, a key file as malformed, a head line as not an object). */
function readJson(text: string): unknown {
  return jsonDepth(text) > DOJO_SERVED_MAX_DEPTH ? null : (JSON.parse(text) as unknown);
}
