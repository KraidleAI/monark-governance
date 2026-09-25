// apps/site/lib/bell-served-load.ts — the committed facts about the SERVED Bell host (v4: every
// run of the latest publication, and lines[], the facts of every timeline line). Two halves, one closed shape:
//   - buildBellServed(): the PURE projection the source-repo sync (scripts/sync-bell-served.mjs) applies to the bytes it
//     read on the host. It walks the WHOLE timeline under the committed keyring (the chain functions are injected), binds
//     /state.json and /provenance.json to the LATEST publication line by sha256, reads the first record's state at its
//     immutable path, copies the facts of every walked line (lines[]: the anchors sync binds each anchor row to them),
//     and copies the served fields of every run of the latest publication. It never copies a consolidated
//     volume ratio, a provider label, a proof-of-reserves method or note, or a key: those are read and dropped here.
//   - loadBellServed(): the build-time loader. It reads apps/site/data/bell-served.json ONLY after its sha256 (CRLF->LF,
//     UTF-8) equals the site manifest entry, then checks the CLOSED shape (every level carries exactly its keys, formats
//     checked). FAIL-CLOSED: an unlisted file, a hash mismatch, an extra or missing key or a malformed value throws, so
//     `next build` reds rather than render an unchecked record. The pages render its values by property access, never as
//     typed literals (pinned by test/bell-served.test.ts).
// Self-contained (node built-ins only, no alias or relative import): shared by the pages, the sync and the root tests.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const BELL_SERVED_REL = "apps/site/data/bell-served.json";
export const BELL_SERVED_SCHEMA = "monark-site-bell-served-v4";
const MANIFEST_REL = "apps/site/data/manifest.sha256.json";
/** The one Bell host (the site links it and serves no second copy of the key). */
export const BELL_HOST = "https://bell.monarkgate.tech";
export const BELL_TIMELINE_PATH = "/timeline.jsonl";
export const BELL_PUBKEY_PATH = "/bell/pubkey.json";
export const BELL_STATE_PATH = "/state.json";
export const BELL_PROVENANCE_PATH = "/provenance.json";
/** The immutable copy of a published state, addressed by its sha256 (the value the signed line names). */
export const bellStatePathOf = (sha256: string): string => `/states/${sha256}.json`;
/** The previous-line hash of the first line of a chain (the publisher's GENESIS). */
export const BELL_GENESIS = "0".repeat(64);

/** The repository root while `next build` runs (cwd = apps/site), as lib/load-committed.ts documents. */
export function bellServedRepoRoot(): string {
  return join(process.cwd(), "..", "..");
}

// ── Keys copied from the served objects (the publisher's closed list, minus what the site never carries) ──
/** Session row = one served digest gap entry, every key of the publisher's gap object (test: == WHITELIST.gap). */
export const BELL_SESSION_KEYS = ["symbol", "session", "regime", "vwap", "volumeBase", "n", "cash_cross", "gT", "exceed1", "exceed2", "exceed5",
  "multiplierUsed", "rebase_residuals", "earliest_publish_utc", "abstain"] as const;
/** Volume entry = the served volume object WITHOUT vol_ratio (its display is suspended; test: == WHITELIST.volume minus it). */
export const BELL_VOLUME_KEYS = ["symbol", "session", "regime", "session_date_et", "window", "adv_period", "n", "n_bars", "n_trading_days",
  "formula", "abstain", "multiplier_unit"] as const;
/** The served volume keys the site never copies (read, dropped by buildBellServed). */
export const BELL_VOLUME_DROPPED = ["vol_ratio"] as const;
export const BELL_SUPPLY_KEYS = ["symbol", "supply", "decimals", "multiplier", "paused", "permanent_delegate"] as const;
/** Proof of reserves: the status only; the served method and note (third-party names) are never copied. */
export const BELL_POR_KEYS = ["symbol", "kind", "age_sec"] as const;
export const BELL_WRAPPER_KEYS = ["symbol", "contracts", "residue"] as const;
export const BELL_HALT_DELTA_KEYS = ["symbol", "chain", "reason_family", "halt_utc_ms", "resume_utc_ms", "first_fill_after_halt_utc_ms",
  "last_fill_before_resume_utc_ms", "n_fills_in_window"] as const;
export const BELL_RECORD_KEYS = ["symbol", "chain", "n_fills", "sessions", "quorum_coverage", "prev_line_hash"] as const;

// ── Types of the loaded data ──
export interface BellWindow { from_utc_ms: number; to_utc_ms: number }
export interface BellServedLine {
  seq: number; kind: string; published_at: string; line_hash: string; prev_line_hash: string; key_id: string;
  state_sha256: string; provenance_sha256: string;
}
/** lines[i] = the facts of timeline line i + 1 as walked; only a publication names its state and provenance files. */
export interface BellServedTimelineLine { seq: number; kind: string; line_hash: string; prev_line_hash: string; state_sha256?: string; provenance_sha256?: string }
export interface BellServedSession {
  symbol: string; session: string; regime: string | null; n: number; vwap: string; volumeBase: string;
  abstain: string | null; gT: string | null; exceed: Array<{ threshold: number; exceeded: number }>;
  earliest_publish_utc: number | null; cash_cross: string | null; multiplierUsed: string | null; rebase_residuals: string[];
}
export interface BellServedVolume {
  symbol: string; session: string; regime: string | null; session_date_et: string; window: BellWindow;
  adv_period: { year: number; month: number }; n: number; n_bars: number; n_trading_days: number; formula: string;
  abstain: string[]; multiplier_unit: boolean | null;
}
/** permanent_delegate is null when the mint carries no permanent-delegate authority (collector MintReadout: string | null). */
export interface BellServedSupply { symbol: string; supply: string; decimals: number; multiplier: string; paused: boolean; permanent_delegate: string | null }
export interface BellServedPor { symbol: string; kind: string; age_sec: number | null }
export interface BellServedWrapper { symbol: string; contracts: string[]; residue: string }
export interface BellServedHaltDelta {
  symbol: string; chain: string; reason_family: string; halt_utc_ms: number | null; resume_utc_ms: number | null;
  first_fill_after_halt_utc_ms: number | null; last_fill_before_resume_utc_ms: number | null; n_fills_in_window: number;
}
export interface BellServedRecord { symbol: string; chain: string; n_fills: number; sessions: number; quorum_coverage: string | null; prev_line_hash: string }
export interface BellServedFault { status: string; ledger_operator: boolean }
export interface BellServedRunProvenance {
  generated_at: string; providers_distinct: number; quorum_required: number; cash_request_digest: string | null;
  faults: BellServedFault[]; cash_cross_mismatch_days: string[]; cash_cross_unavailable_days: string[];
}
export interface BellServedRun {
  bell_sha: string; schema: string; digest_schema: string; window: BellWindow; records: BellServedRecord[];
  residuals: Record<string, number>; sessions: BellServedSession[]; volume: BellServedVolume[]; supply: BellServedSupply[];
  por: BellServedPor[]; wrapper: BellServedWrapper[]; halt_census: { total: number; empty_resume: number };
  halt_deltas: BellServedHaltDelta[]; provenance: BellServedRunProvenance;
}
export type BellShape = string | readonly [string];
export interface BellServedData {
  host: string;
  read_at: string;
  timeline: { schema: string; lines: number; publications: number };
  lines: BellServedTimelineLine[];
  first_record: BellServedLine & { symbols: string[] };
  head: BellServedLine & { sig: string; state_schema: string; provenance_schema: string; runs: BellServedRun[] };
  keyring: { schema: string; keys: Array<{ key_id: string; status: string; valid_from_seq: number }> };
  deploy_check: { checked_at: string; checks_total: number; checks_passed: number; tls_authorized: boolean };
  collector_revision: { commit: string; committed_at: string };
  served_schema: { state_file: string[]; provenance_file: string[]; timeline_line: string[]; timeline_run: string[]; objects: Record<string, Record<string, BellShape>> };
  bodies_sha256: { timeline: string; pubkey: string; state: string; provenance: string };
}

// ── Formats ──
const HEX64 = /^[0-9a-f]{64}$/;
const HEX40 = /^[0-9a-f]{40}$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const DEC = /^-?\d+(?:\.\d+)?$/;
const UINT_STR = /^\d+$/;
const LABEL = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const SCHEMA_ID = /^[a-z][a-z0-9-]*-v\d+$/;
/** An on-chain address: a base58 account key, or a 0x-prefixed 20-byte hex address. */
const ADDRESS = /^(?:[1-9A-HJ-NP-Za-km-z]{32,44}|0x[0-9a-fA-F]{40})$/;
const B64URL = /^[A-Za-z0-9_-]+$/;
/** A sanitized transport status token of the collector (an HTTP code, an rpc code, a non-JSON body, a timeout or transport). */
const STATUS = /^(?:HTTP \d{3}|rpc -?\d+|non-json (?:\d{3}|\?)|timeout|transport)$/;
const DAY_REF = /^[A-Z][A-Z0-9.]*:\d{4}-\d{2}-\d{2}$/;
const EXCEED = /^exceed(\d+)$/;

function fail(why: string): never {
  throw new Error(`bell served: ${why}`);
}
const isObj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);
function obj(v: unknown, keys: readonly string[], where: string): Record<string, unknown> {
  if (!isObj(v)) return fail(`${where} must be an object`);
  const got = Object.keys(v).sort().join(",");
  if (got !== [...keys].sort().join(",")) return fail(`${where} must carry exactly {${keys.join(", ")}}, got {${got}}`);
  return v;
}
/** An object whose keys are a subset of `allowed` and a superset of `required`. */
function objSub(v: unknown, allowed: readonly string[], required: readonly string[], where: string): Record<string, unknown> {
  if (!isObj(v)) return fail(`${where} must be an object`);
  for (const k of Object.keys(v)) if (!allowed.includes(k)) fail(`${where} carries an unknown key {${k}}`);
  for (const k of required) if (!Object.hasOwn(v, k)) fail(`${where} lacks {${k}}`);
  return v;
}
function str(v: unknown, re: RegExp, where: string): string {
  if (typeof v !== "string" || !re.test(v)) return fail(`${where} is malformed`);
  return v;
}
function text(v: unknown, where: string): string {
  if (typeof v !== "string" || v.trim().length === 0) return fail(`${where} must be a non-empty string`);
  return v;
}
function int(v: unknown, where: string, min = 0): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < min) return fail(`${where} must be an integer >= ${String(min)}`);
  return v;
}
function bool(v: unknown, where: string): boolean {
  if (typeof v !== "boolean") return fail(`${where} must be a boolean`);
  return v;
}
function arr<T>(v: unknown, where: string, each: (x: unknown, i: number) => T): T[] {
  if (!Array.isArray(v)) return fail(`${where} must be an array`);
  return v.map((x: unknown, i) => each(x, i));
}
const opt = <T>(v: unknown, f: (x: unknown) => T): T | null => (v === undefined || v === null ? null : f(v));
function windowOf(v: unknown, where: string): BellWindow {
  const w = obj(v, ["from_utc_ms", "to_utc_ms"], where);
  const out = { from_utc_ms: int(w.from_utc_ms, `${where}.from_utc_ms`), to_utc_ms: int(w.to_utc_ms, `${where}.to_utc_ms`) };
  if (out.to_utc_ms < out.from_utc_ms) fail(`${where} must not end before it starts`);
  return out;
}
const keyList = (v: unknown, where: string): string[] => arr(v, where, (x, i) => str(x, LABEL, `${where}[${String(i)}]`));

// ── Pure helpers shared by the pages ──
/** The thresholds named by `exceed<k>` keys, ascending (the digits come from the served keys, never from a literal). */
export function thresholdsOf(keys: Iterable<string>): number[] {
  const out = new Set<number>();
  for (const k of keys) { const m = EXCEED.exec(k); if (m?.[1] !== undefined) out.add(Number(m[1])); }
  return [...out].sort((a, b) => a - b);
}
/** An unsigned integer string shifted right by `decimals` places, exactly (string arithmetic, no float). */
export function shiftDecimal(raw: string, decimals: number): string {
  if (!UINT_STR.test(raw) || !Number.isInteger(decimals) || decimals < 0) throw new Error("shiftDecimal: an unsigned integer string and a non-negative integer are required");
  if (decimals === 0) return raw.replace(/^0+(?=\d)/, "");
  const padded = raw.padStart(decimals + 1, "0");
  const intPart = padded.slice(0, padded.length - decimals).replace(/^0+(?=\d)/, "");
  return `${intPart}.${padded.slice(padded.length - decimals)}`;
}
/** Milliseconds since the epoch as "YYYY-MM-DD HH:MM:SS" (UTC, seconds kept). */
export function utcSeconds(ms: number): string {
  return new Date(ms).toISOString().replace("T", " ").slice(0, 19);
}
/** A run's session rows, each with the volume entry of the same session group (the loader checked the pairing, in order). */
export function sessionRowsOf(run: BellServedRun): Array<{ session: BellServedSession; volume: BellServedVolume }> {
  return run.sessions.map((session, i) => {
    const volume = run.volume[i];
    if (volume === undefined) throw new Error(`bell served: session row ${String(i)} has no volume entry`);
    return { session, volume };
  });
}
/** "N with <code>" per abstention code among the rows, in first-seen order (the counts are read, never typed). */
export function abstentionsOf(rows: readonly BellServedSession[]): string[] {
  const counts = new Map<string, number>();
  for (const r of rows) if (r.abstain !== null) counts.set(r.abstain, (counts.get(r.abstain) ?? 0) + 1);
  return [...counts].map(([code, n]) => `${String(n)} with ${code}`);
}

// ── The loader ──
function lineOf(v: Record<string, unknown>, where: string): BellServedLine {
  return {
    seq: int(v.seq, `${where}.seq`, 1),
    kind: str(v.kind, LABEL, `${where}.kind`),
    published_at: str(v.published_at, ISO_UTC, `${where}.published_at`),
    line_hash: str(v.line_hash, HEX64, `${where}.line_hash`),
    prev_line_hash: str(v.prev_line_hash, HEX64, `${where}.prev_line_hash`),
    key_id: str(v.key_id, HEX64, `${where}.key_id`),
    state_sha256: str(v.state_sha256, HEX64, `${where}.state_sha256`),
    provenance_sha256: str(v.provenance_sha256, HEX64, `${where}.provenance_sha256`),
  };
}
const LINE_KEYS = ["seq", "kind", "published_at", "line_hash", "prev_line_hash", "key_id", "state_sha256", "provenance_sha256"] as const;
/** The publisher's closed list of line kinds (apps/bell/scripts/bell-chain.mjs KINDS; this module imports nothing). */
const LINE_KINDS: readonly string[] = ["publication", "key_rotation", "key_revocation"];

function sessionOf(v: unknown, where: string): BellServedSession {
  const g = objSub(v, BELL_SESSION_KEYS, ["symbol", "session", "regime", "vwap", "volumeBase", "n"], where);
  const exceed = Object.keys(g).flatMap((k) => {
    const m = EXCEED.exec(k);
    if (m?.[1] === undefined) return [];
    const x = int(g[k], `${where}.${k}`);
    if (x > 1) fail(`${where}.${k} must be 0 or 1`);
    return [{ threshold: Number(m[1]), exceeded: x }];
  }).sort((a, b) => a.threshold - b.threshold);
  const gT = opt(g.gT, (x) => str(x, DEC, `${where}.gT`));
  const abstain = opt(g.abstain, (x) => str(x, LABEL, `${where}.abstain`));
  if ((gT === null) === (abstain === null)) fail(`${where} must carry either a gap or an abstention, never both or neither`);
  return {
    symbol: str(g.symbol, LABEL, `${where}.symbol`), session: str(g.session, LABEL, `${where}.session`),
    regime: opt(g.regime, (x) => str(x, LABEL, `${where}.regime`)), n: int(g.n, `${where}.n`),
    vwap: str(g.vwap, DEC, `${where}.vwap`), volumeBase: str(g.volumeBase, DEC, `${where}.volumeBase`),
    abstain, gT, exceed,
    earliest_publish_utc: opt(g.earliest_publish_utc, (x) => int(x, `${where}.earliest_publish_utc`)),
    cash_cross: opt(g.cash_cross, (x) => str(x, LABEL, `${where}.cash_cross`)),
    multiplierUsed: opt(g.multiplierUsed, (x) => str(x, DEC, `${where}.multiplierUsed`)),
    rebase_residuals: g.rebase_residuals === undefined ? [] : keyList(g.rebase_residuals, `${where}.rebase_residuals`),
  };
}
function volumeOf(v: unknown, where: string): BellServedVolume {
  const e = objSub(v, BELL_VOLUME_KEYS, ["symbol", "session", "regime", "session_date_et", "window", "adv_period", "n", "n_bars", "n_trading_days", "formula"], where);
  const p = obj(e.adv_period, ["year", "month"], `${where}.adv_period`);
  const month = int(p.month, `${where}.adv_period.month`, 1);
  if (month > 12) fail(`${where}.adv_period.month must be a month`);
  return {
    symbol: str(e.symbol, LABEL, `${where}.symbol`), session: str(e.session, LABEL, `${where}.session`),
    regime: opt(e.regime, (x) => str(x, LABEL, `${where}.regime`)), session_date_et: str(e.session_date_et, ISO_DAY, `${where}.session_date_et`),
    window: windowOf(e.window, `${where}.window`), adv_period: { year: int(p.year, `${where}.adv_period.year`, 1), month },
    n: int(e.n, `${where}.n`), n_bars: int(e.n_bars, `${where}.n_bars`), n_trading_days: int(e.n_trading_days, `${where}.n_trading_days`),
    formula: text(e.formula, `${where}.formula`),
    abstain: e.abstain === undefined ? [] : keyList(e.abstain, `${where}.abstain`),
    multiplier_unit: opt(e.multiplier_unit, (x) => bool(x, `${where}.multiplier_unit`)),
  };
}
function runOf(v: unknown, where: string, residualCodes: readonly string[] | null): BellServedRun {
  const r = obj(v, ["bell_sha", "schema", "digest_schema", "window", "records", "residuals", "sessions", "volume", "supply", "por", "wrapper",
    "halt_census", "halt_deltas", "provenance"], where);
  if (!isObj(r.residuals)) fail(`${where}.residuals must be an object`);
  const residuals: Record<string, number> = {};
  for (const [k, n] of Object.entries(r.residuals as Record<string, unknown>)) residuals[str(k, LABEL, `${where}.residuals key`)] = int(n, `${where}.residuals.${k}`);
  if (residualCodes !== null && Object.keys(residuals).sort().join(",") !== [...residualCodes].sort().join(",")) fail(`${where}.residuals must count exactly the closed list of codes`);
  const hc = obj(r.halt_census, ["total", "empty_resume"], `${where}.halt_census`);
  const pv = obj(r.provenance, ["generated_at", "providers_distinct", "quorum_required", "cash_request_digest", "faults", "cash_cross_mismatch_days",
    "cash_cross_unavailable_days"], `${where}.provenance`);
  const run: BellServedRun = {
    bell_sha: str(r.bell_sha, HEX64, `${where}.bell_sha`), schema: str(r.schema, SCHEMA_ID, `${where}.schema`),
    digest_schema: str(r.digest_schema, SCHEMA_ID, `${where}.digest_schema`), window: windowOf(r.window, `${where}.window`),
    records: arr(r.records, `${where}.records`, (x, i) => {
      const w = `${where}.records[${String(i)}]`, e = obj(x, [...BELL_RECORD_KEYS], w);
      return { symbol: str(e.symbol, LABEL, `${w}.symbol`), chain: str(e.chain, LABEL, `${w}.chain`), n_fills: int(e.n_fills, `${w}.n_fills`),
        sessions: int(e.sessions, `${w}.sessions`), quorum_coverage: opt(e.quorum_coverage, (y) => str(y, DEC, `${w}.quorum_coverage`)),
        prev_line_hash: str(e.prev_line_hash, HEX64, `${w}.prev_line_hash`) };
    }),
    residuals,
    sessions: arr(r.sessions, `${where}.sessions`, (x, i) => sessionOf(x, `${where}.sessions[${String(i)}]`)),
    volume: arr(r.volume, `${where}.volume`, (x, i) => volumeOf(x, `${where}.volume[${String(i)}]`)),
    supply: arr(r.supply, `${where}.supply`, (x, i) => {
      const w = `${where}.supply[${String(i)}]`, e = obj(x, [...BELL_SUPPLY_KEYS], w);
      return { symbol: str(e.symbol, LABEL, `${w}.symbol`), supply: str(e.supply, UINT_STR, `${w}.supply`), decimals: int(e.decimals, `${w}.decimals`),
        multiplier: str(e.multiplier, DEC, `${w}.multiplier`), paused: bool(e.paused, `${w}.paused`), permanent_delegate: opt(e.permanent_delegate, (y) => str(y, ADDRESS, `${w}.permanent_delegate`)) };
    }),
    por: arr(r.por, `${where}.por`, (x, i) => {
      const w = `${where}.por[${String(i)}]`, e = objSub(x, [...BELL_POR_KEYS], ["symbol", "kind"], w);
      return { symbol: str(e.symbol, LABEL, `${w}.symbol`), kind: str(e.kind, LABEL, `${w}.kind`), age_sec: opt(e.age_sec, (y) => int(y, `${w}.age_sec`)) };
    }),
    wrapper: arr(r.wrapper, `${where}.wrapper`, (x, i) => {
      const w = `${where}.wrapper[${String(i)}]`, e = obj(x, [...BELL_WRAPPER_KEYS], w);
      return { symbol: str(e.symbol, LABEL, `${w}.symbol`), contracts: arr(e.contracts, `${w}.contracts`, (y, j) => str(y, ADDRESS, `${w}.contracts[${String(j)}]`)),
        residue: str(e.residue, LABEL, `${w}.residue`) };
    }),
    halt_census: { total: int(hc.total, `${where}.halt_census.total`), empty_resume: int(hc.empty_resume, `${where}.halt_census.empty_resume`) },
    halt_deltas: arr(r.halt_deltas, `${where}.halt_deltas`, (x, i) => {
      const w = `${where}.halt_deltas[${String(i)}]`, e = obj(x, [...BELL_HALT_DELTA_KEYS], w);
      const ms = (y: unknown, k: string): number | null => opt(y, (z) => int(z, `${w}.${k}`));
      return { symbol: str(e.symbol, LABEL, `${w}.symbol`), chain: str(e.chain, LABEL, `${w}.chain`), reason_family: str(e.reason_family, LABEL, `${w}.reason_family`),
        halt_utc_ms: ms(e.halt_utc_ms, "halt_utc_ms"), resume_utc_ms: ms(e.resume_utc_ms, "resume_utc_ms"),
        first_fill_after_halt_utc_ms: ms(e.first_fill_after_halt_utc_ms, "first_fill_after_halt_utc_ms"),
        last_fill_before_resume_utc_ms: ms(e.last_fill_before_resume_utc_ms, "last_fill_before_resume_utc_ms"), n_fills_in_window: int(e.n_fills_in_window, `${w}.n_fills_in_window`) };
    }),
    provenance: {
      generated_at: str(pv.generated_at, ISO_UTC, `${where}.provenance.generated_at`),
      providers_distinct: int(pv.providers_distinct, `${where}.provenance.providers_distinct`),
      quorum_required: int(pv.quorum_required, `${where}.provenance.quorum_required`),
      cash_request_digest: opt(pv.cash_request_digest, (y) => str(y, HEX64, `${where}.provenance.cash_request_digest`)),
      faults: arr(pv.faults, `${where}.provenance.faults`, (x, i) => {
        const w = `${where}.provenance.faults[${String(i)}]`, e = obj(x, ["status", "ledger_operator"], w);
        return { status: str(e.status, STATUS, `${w}.status`), ledger_operator: bool(e.ledger_operator, `${w}.ledger_operator`) };
      }),
      cash_cross_mismatch_days: arr(pv.cash_cross_mismatch_days, `${where}.provenance.cash_cross_mismatch_days`, (y, i) => str(y, DAY_REF, `${where}.provenance.cash_cross_mismatch_days[${String(i)}]`)),
      cash_cross_unavailable_days: arr(pv.cash_cross_unavailable_days, `${where}.provenance.cash_cross_unavailable_days`, (y, i) => str(y, DAY_REF, `${where}.provenance.cash_cross_unavailable_days[${String(i)}]`)),
    },
  };
  // Cross-field checks: the counts the timeline line signs equal the rows the state carries.
  for (const rec of run.records) {
    const rows = run.sessions.filter((s) => s.symbol === rec.symbol);
    if (rows.length !== rec.sessions) fail(`${where}: ${rec.symbol} sessions must equal its session rows`);
    if (rows.reduce((a, s) => a + s.n, 0) !== rec.n_fills) fail(`${where}: ${rec.symbol} fills must equal the sum of its session n`);
  }
  for (const vol of run.volume) {
    if (vol.window.from_utc_ms < run.window.from_utc_ms || vol.window.to_utc_ms > run.window.to_utc_ms) fail(`${where}: a session window must lie inside the run window`);
  }
  // The collector pushes exactly one gap entry and one volume entry per session group (session, regime, session date), in the
  // same order: the pages pair them by index, so the pairing is checked here, one to one, in order (a gap row carries no date).
  if (run.volume.length !== run.sessions.length) fail(`${where}: the volume entries must pair one to one with the session rows`);
  run.sessions.forEach((s, i) => {
    const v = run.volume[i];
    if (v === undefined || v.symbol !== s.symbol || v.session !== s.session || v.regime !== s.regime || v.n !== s.n) {
      fail(`${where}: volume entry ${String(i)} does not pair with session row ${String(i)} (symbol, session, regime, fills)`);
    }
  });
  return run;
}
function schemaObjects(v: unknown, where: string): Record<string, Record<string, BellShape>> {
  if (!isObj(v)) return fail(`${where} must be an object`);
  const names = Object.keys(v);
  const out: Record<string, Record<string, BellShape>> = {};
  for (const name of names) {
    const o = v[name];
    if (!isObj(o)) return fail(`${where}.${name} must be an object`);
    const shapes: Record<string, BellShape> = {};
    for (const [k, s] of Object.entries(o)) {
      str(k, LABEL, `${where}.${name} key`);
      if (s === "scalar" || s === "scalar[]" || (typeof s === "string" && names.includes(s))) shapes[k] = s;
      else if (Array.isArray(s) && s.length === 1 && typeof s[0] === "string" && names.includes(s[0])) shapes[k] = [s[0]] as const;
      else fail(`${where}.${name}.${k} has an unknown shape`);
    }
    out[str(name, LABEL, `${where} object name`)] = shapes;
  }
  return out;
}

/** Load and check the committed file. `residualCodes`, when given, is the closed list every run must count exactly. */
export function loadBellServed(rootDir: string, residualCodes: readonly string[] | null = null): BellServedData {
  const manifest = JSON.parse(readFileSync(join(rootDir, MANIFEST_REL), "utf8")) as { algorithm?: unknown; files?: Record<string, unknown> };
  if (manifest.algorithm !== "sha256") fail("site manifest algorithm is not sha256 (fail-closed)");
  const expected = manifest.files?.[BELL_SERVED_REL];
  if (typeof expected !== "string") fail(`${BELL_SERVED_REL} is not listed in the site manifest (fail-closed)`);
  const raw = readFileSync(join(rootDir, BELL_SERVED_REL), "utf8");
  const actual = createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  if (actual !== expected) fail(`sha256 mismatch for ${BELL_SERVED_REL} (manifest ${String(expected)}, actual ${actual})`);

  const d = obj(JSON.parse(raw) as unknown, ["$comment", "schema", "host", "read_at", "timeline", "lines", "first_record", "head", "keyring", "deploy_check",
    "collector_revision", "served_schema", "bodies_sha256"], "file");
  if (d.schema !== BELL_SERVED_SCHEMA) fail(`schema is not ${BELL_SERVED_SCHEMA}`);
  if (d.host !== BELL_HOST) fail(`host must be ${BELL_HOST}`);
  const tl = obj(d.timeline, ["schema", "lines", "publications"], "timeline");
  const fr = obj(d.first_record, [...LINE_KEYS, "symbols"], "first_record");
  const hd = obj(d.head, [...LINE_KEYS, "sig", "state_schema", "provenance_schema", "runs"], "head");
  const kr = obj(d.keyring, ["schema", "keys"], "keyring");
  const dc = obj(d.deploy_check, ["checked_at", "checks_total", "checks_passed", "tls_authorized"], "deploy_check");
  const cr = obj(d.collector_revision, ["commit", "committed_at"], "collector_revision");
  const ss = obj(d.served_schema, ["state_file", "provenance_file", "timeline_line", "timeline_run", "objects"], "served_schema");
  const b = obj(d.bodies_sha256, [BELL_TIMELINE_PATH, BELL_PUBKEY_PATH, BELL_STATE_PATH, BELL_PROVENANCE_PATH], "bodies_sha256");

  const first = { ...lineOf(fr, "first_record"), symbols: keyList(fr.symbols, "first_record.symbols") };
  const runs = arr(hd.runs, "head.runs", (x, i) => runOf(x, `head.runs[${String(i)}]`, residualCodes));
  if (runs.length < 1) fail("head.runs must be non-empty");
  const head = { ...lineOf(hd, "head"), sig: str(hd.sig, B64URL, "head.sig"), state_schema: str(hd.state_schema, SCHEMA_ID, "head.state_schema"),
    provenance_schema: str(hd.provenance_schema, SCHEMA_ID, "head.provenance_schema"), runs };
  const timeline = { schema: str(tl.schema, SCHEMA_ID, "timeline.schema"), lines: int(tl.lines, "timeline.lines", 1), publications: int(tl.publications, "timeline.publications", 1) };
  if (first.seq !== 1 || first.prev_line_hash !== BELL_GENESIS) fail("first_record must be the genesis-chained line at seq 1");
  if (head.seq < first.seq || head.seq > timeline.lines || timeline.publications > timeline.lines) fail("head, first record and timeline counts disagree");
  if (head.seq === first.seq && head.line_hash !== first.line_hash) fail("a head at seq 1 must be the first record");
  // lines[]: line i + 1 of a closed kind, chained from the genesis value, the head's and the first record's facts, no publication after
  // the head (the head is the latest publication); only a publication carries its state and provenance digests.
  const lines = arr(d.lines, "lines", (x, i): BellServedTimelineLine => {
    const w = `lines[${String(i)}]`, pub = isObj(x) && x.kind === "publication";
    const e = obj(x, ["seq", "kind", "line_hash", "prev_line_hash", ...(pub ? ["state_sha256", "provenance_sha256"] : [])], w);
    if (e.seq !== i + 1 || !LINE_KINDS.includes(String(e.kind))) fail(`${w} must be line ${String(i + 1)}, of a closed kind`);
    const facts = { seq: i + 1, kind: String(e.kind), line_hash: str(e.line_hash, HEX64, `${w}.line_hash`), prev_line_hash: str(e.prev_line_hash, HEX64, `${w}.prev_line_hash`) };
    return pub ? { ...facts, state_sha256: str(e.state_sha256, HEX64, `${w}.state_sha256`), provenance_sha256: str(e.provenance_sha256, HEX64, `${w}.provenance_sha256`) } : facts;
  });
  const factsOf = (l: BellServedTimelineLine | BellServedLine | undefined): string => (l === undefined ? "" : [l.seq, l.kind, l.line_hash, l.prev_line_hash, l.state_sha256, l.provenance_sha256].join());
  if (lines.length !== timeline.lines || lines.filter((l) => l.kind === "publication").length !== timeline.publications) fail("lines must count the timeline's lines and publications");
  lines.forEach((l, k) => { if (l.prev_line_hash !== (k === 0 ? BELL_GENESIS : lines[k - 1]?.line_hash)) fail(`lines[${String(k)}] is not chained to the line before it`); });
  if (factsOf(lines[first.seq - 1]) !== factsOf(first) || factsOf(lines[head.seq - 1]) !== factsOf(head)) fail("lines must carry the facts of the first record and of the head");
  if (lines.slice(head.seq).some((l) => l.kind === "publication")) fail("a publication line follows the head (the head is the latest publication)");
  const checksTotal = int(dc.checks_total, "deploy_check.checks_total", 1);
  const out: BellServedData = {
    host: BELL_HOST,
    read_at: str(d.read_at, ISO_UTC, "read_at"),
    timeline,
    lines,
    first_record: first,
    head,
    keyring: {
      schema: str(kr.schema, SCHEMA_ID, "keyring.schema"),
      keys: arr(kr.keys, "keyring.keys", (x, i) => {
        const w = `keyring.keys[${String(i)}]`, e = obj(x, ["key_id", "status", "valid_from_seq"], w);
        return { key_id: str(e.key_id, HEX64, `${w}.key_id`), status: str(e.status, LABEL, `${w}.status`), valid_from_seq: int(e.valid_from_seq, `${w}.valid_from_seq`, 1) };
      }),
    },
    deploy_check: {
      checked_at: str(dc.checked_at, ISO_UTC, "deploy_check.checked_at"), checks_total: checksTotal,
      checks_passed: int(dc.checks_passed, "deploy_check.checks_passed"), tls_authorized: bool(dc.tls_authorized, "deploy_check.tls_authorized"),
    },
    collector_revision: { commit: str(cr.commit, HEX40, "collector_revision.commit"), committed_at: str(cr.committed_at, ISO_UTC, "collector_revision.committed_at") },
    served_schema: {
      state_file: keyList(ss.state_file, "served_schema.state_file"), provenance_file: keyList(ss.provenance_file, "served_schema.provenance_file"),
      timeline_line: keyList(ss.timeline_line, "served_schema.timeline_line"), timeline_run: keyList(ss.timeline_run, "served_schema.timeline_run"),
      objects: schemaObjects(ss.objects, "served_schema.objects"),
    },
    bodies_sha256: {
      timeline: str(b[BELL_TIMELINE_PATH], HEX64, "bodies_sha256 timeline"), pubkey: str(b[BELL_PUBKEY_PATH], HEX64, "bodies_sha256 pubkey"),
      state: str(b[BELL_STATE_PATH], HEX64, "bodies_sha256 state"), provenance: str(b[BELL_PROVENANCE_PATH], HEX64, "bodies_sha256 provenance"),
    },
  };
  if (out.deploy_check.checks_passed > checksTotal) fail("deploy_check passes more controls than it runs");
  if (out.bodies_sha256.state !== head.state_sha256 || out.bodies_sha256.provenance !== head.provenance_sha256) fail("the bodies read must be the ones the latest line names");
  if (!out.keyring.keys.some((k) => k.key_id === head.key_id) || !out.keyring.keys.some((k) => k.key_id === first.key_id)) fail("every signing key must be in the key set");
  return out;
}

/** The site manifest text with the entry of `rel` set to `sha256`, every other byte kept: the served-data sync writes the entry it used
 *  to print. Throws unless the text lists `rel` exactly once with a 64-hex value (fail-closed: nothing is added or reordered). */
export function setManifestEntry(text: string, rel: string, sha256: string): string {
  const key = `${JSON.stringify(rel)}: "`, at = text.indexOf(key), v = at + key.length;
  if (!HEX64.test(sha256) || at < 0 || text.includes(key, v) || !HEX64.test(text.slice(v, v + 64)) || text[v + 64] !== '"') fail(`the site manifest does not list ${rel} once with a sha256`);
  return text.slice(0, v) + sha256 + text.slice(v + 64);
}

// ── The projection applied by the sync (pure; the chain functions of the publisher are injected) ──
export interface BellChainDeps<T> {
  trustOf: (keyring: unknown) => T | null;
  walkTimeline: (lines: readonly unknown[], trust: T) => unknown;
  lineHash: (line: unknown) => string;
}
export interface BellServedBuildInput {
  readAt: string;
  /** Bodies as read on the host. */
  timeline: Uint8Array; pubkey: Uint8Array; state: Uint8Array; provenance: Uint8Array;
  /** /states/<sha>.json of the latest line and of the first line (the same bytes when they are one line). */
  headStateImmutable: Uint8Array; firstStateImmutable: Uint8Array;
  /** The committed keyring (the trust root), the committed deploy check, the collector revision and the publisher's closed list. */
  committedKeyring: Uint8Array; deployCheck: unknown; collectorRevision: { commit: string; committed_at: string };
  whitelist: Readonly<Record<string, Readonly<Record<string, BellShape>>>>;
}
const sha256Hex = (b: Uint8Array): string => createHash("sha256").update(b).digest("hex");
const sameBytes = (a: Uint8Array, b: Uint8Array): boolean => a.length === b.length && a.every((x, i) => x === b[i]);
const parseJson = (b: Uint8Array, where: string): unknown => { try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(b)) as unknown; } catch { return fail(`${where} is not UTF-8 JSON`); } };
/** Copy the listed keys that are present (a key outside `allowed` and outside `dropped` throws: nothing unknown is carried). */
function pick(v: unknown, allowed: readonly string[], dropped: readonly string[], where: string): Record<string, unknown> {
  if (!isObj(v)) return fail(`${where} must be an object`);
  const out: Record<string, unknown> = {};
  for (const [k, x] of Object.entries(v)) {
    if (allowed.includes(k)) out[k] = x;
    else if (!dropped.includes(k)) fail(`${where} carries a key the site does not know: ${k}`);
  }
  return out;
}

/** Build the committed file (without writing it). Throws on any check that does not hold. */
export function buildBellServed<T>(input: BellServedBuildInput, deps: BellChainDeps<T>): Record<string, unknown> {
  const wl = input.whitelist;
  const keysOf = (name: string): string[] => Object.keys(wl[name] ?? fail(`the publisher's closed list has no ${name} object`));
  if (!sameBytes(input.pubkey, input.committedKeyring)) fail("the served key set is not byte-identical to the committed keyring");
  const keyring = parseJson(input.committedKeyring, "the committed keyring");
  const trust = deps.trustOf(keyring);
  if (trust === null) fail("the committed keyring is malformed");
  const tlText = new TextDecoder("utf-8", { fatal: true }).decode(input.timeline);
  if (tlText.length === 0 || !tlText.endsWith("\n")) fail("the timeline is empty or lacks its final newline");
  const lines = tlText.slice(0, -1).split("\n").map((s, i) => { try { return JSON.parse(s) as unknown; } catch { return fail(`timeline line ${String(i + 1)} is not JSON`); } });
  const walk = deps.walkTimeline(lines, trust as T) as { ok?: unknown; seq?: unknown; reason?: unknown; head?: unknown; voided?: unknown; breaks?: unknown };
  if (walk.ok !== true) fail(`the timeline does not walk under the committed keyring (seq ${String(walk.seq)}: ${String(walk.reason)})`);
  if (!Array.isArray(walk.voided) || walk.voided.length > 0) fail("a line is voided by a revocation; the page renders no voided line (fail-closed)");
  if (!Array.isArray(walk.breaks) || walk.breaks.length > 0) fail("the key schedule carries a broken-continuity rotation; the page renders none yet (fail-closed)");
  if (!isObj(walk.head)) fail("the timeline carries no publication");
  const head = walk.head as Record<string, unknown>;
  const first = lines[0];
  if (!isObj(first) || first.kind !== "publication") fail("the first timeline line is not a publication");
  const firstLine = first as Record<string, unknown>;
  // Bindings: the current files are the latest line's; the first record's state is read at its immutable address.
  if (sha256Hex(input.state) !== head.state_sha256) fail("the served /state.json is not the state the latest signed line names");
  if (!sameBytes(input.state, input.headStateImmutable)) fail("the immutable copy of the latest state differs from /state.json");
  if (sha256Hex(input.firstStateImmutable) !== firstLine.state_sha256) fail("the immutable state of the first record does not hash to the value its line names");
  if (sha256Hex(input.provenance) !== head.provenance_sha256) fail("the served /provenance.json is not the provenance the latest signed line names");
  const state = obj(parseJson(input.state, "/state.json"), ["schema", "seq", "published_at", "runs"], "/state.json");
  const prov = obj(parseJson(input.provenance, "/provenance.json"), ["schema", "seq", "published_at", "runs"], "/provenance.json");
  for (const [f, where] of [[state, "/state.json"], [prov, "/provenance.json"]] as const) {
    if (f.seq !== head.seq || f.published_at !== head.published_at) fail(`${where} is not the envelope of the latest publication`);
  }
  const lineRuns = arr(head.runs, "latest line runs", (x) => obj(x, ["bell_sha", "window", "records"], "latest line run"));
  const stateRuns = arr(state.runs, "/state.json runs", (x) => x);
  const provRuns = arr(prov.runs, "/provenance.json runs", (x) => x);
  if (stateRuns.length !== lineRuns.length || provRuns.length !== lineRuns.length) fail("the state, the provenance and the signed line do not carry the same runs");

  const runs = lineRuns.map((lr, i) => {
    const where = `run ${String(i)}`;
    const sr = stateRuns.find((x) => isObj(x) && x.bell_sha === lr.bell_sha);
    const pr = provRuns.find((x) => isObj(x) && x.bellSha === lr.bell_sha);
    if (!isObj(sr) || !isObj(pr)) return fail(`${where}: no state or provenance for the run the line names`);
    const s = pick(sr, keysOf("state"), [], `${where} state`);
    const dg = pick(s.digest, keysOf("digest"), [], `${where} digest`);
    if (JSON.stringify(s.window) !== JSON.stringify(lr.window)) fail(`${where}: the state window differs from the signed window`);
    if (JSON.stringify(s.residuals) !== JSON.stringify(dg.residuals)) fail(`${where}: the run residuals differ from the digest residuals`);
    const p = pick(pr, keysOf("provenance"), [], `${where} provenance`);
    const pp = pick(p.providers, keysOf("providers"), [], `${where} providers`);
    const src = pick(p.sources, keysOf("sources"), [], `${where} sources`);
    const operators = arr(pp.providers, `${where} operator labels`, (x) => String(x)); // read to classify each fault, never stored
    return {
      bell_sha: lr.bell_sha, schema: s.schema, digest_schema: dg.schema, window: lr.window,
      records: arr(lr.records, `${where} records`, (x) => { const e = pick(x, keysOf("record"), [], `${where} record`); return { ...e, quorum_coverage: e.quorum_coverage === undefined || e.quorum_coverage === null ? null : String(e.quorum_coverage as number | string) }; }),
      residuals: s.residuals,
      sessions: arr(dg.gaps, `${where} gaps`, (x) => pick(x, keysOf("gap"), [], `${where} gap`)),
      volume: arr(dg.volume ?? [], `${where} volume`, (x) => pick(x, keysOf("volume").filter((k) => !(BELL_VOLUME_DROPPED as readonly string[]).includes(k)), BELL_VOLUME_DROPPED, `${where} volume`)),
      supply: arr(dg.supply ?? [], `${where} supply`, (x) => pick(x, keysOf("supply"), [], `${where} supply`)),
      por: arr(dg.por ?? [], `${where} por`, (x) => pick(x, BELL_POR_KEYS, keysOf("por").filter((k) => !(BELL_POR_KEYS as readonly string[]).includes(k)), `${where} por`)),
      wrapper: arr(dg.wrapper ?? [], `${where} wrapper`, (x) => pick(x, keysOf("wrapper"), [], `${where} wrapper`)),
      halt_census: pick(dg.halt_census, keysOf("halt_census"), [], `${where} halt census`),
      halt_deltas: arr(s.halt_deltas ?? [], `${where} halt deltas`, (x) => pick(x, keysOf("halt_deltas"), [], `${where} halt delta`)),
      provenance: {
        generated_at: p.generatedAt, providers_distinct: pp.providers_distinct, quorum_required: pp.quorum_required,
        cash_request_digest: src.cash_request_digest ?? null,
        faults: arr(pp.faults ?? [], `${where} faults`, (x) => { const f = pick(x, keysOf("fault"), [], `${where} fault`); return { status: f.status, ledger_operator: operators.includes(String(f.provider)) }; }),
        cash_cross_mismatch_days: src.cash_cross_mismatch_days ?? [], cash_cross_unavailable_days: src.cash_cross_unavailable_days ?? [],
      },
    };
  });

  const firstSymbols = [...new Set(arr(firstLine.runs, "first line runs", (x) => x).flatMap((r) => (isObj(r) && Array.isArray(r.records) ? r.records : [])).map((rec) => (isObj(rec) ? String(rec.symbol) : fail("first line record"))))];
  const lineFacts = (l: Record<string, unknown>): Record<string, unknown> => ({
    seq: l.seq, kind: l.kind, published_at: l.published_at, line_hash: deps.lineHash(l), prev_line_hash: l.prev_line_hash, key_id: l.key_id,
    state_sha256: l.state_sha256, provenance_sha256: l.provenance_sha256,
  });
  const ca = isObj(input.deployCheck) ? input.deployCheck : fail("the committed deploy check is not an object");
  if (ca.url !== BELL_HOST) fail("the committed deploy check names another host");
  const caBodies = isObj(ca.bodies_sha256) ? ca.bodies_sha256 : fail("the committed deploy check carries no bodies");
  const read: Array<[string, Uint8Array]> = [[BELL_TIMELINE_PATH, input.timeline], [BELL_PUBKEY_PATH, input.pubkey], [BELL_STATE_PATH, input.state], [BELL_PROVENANCE_PATH, input.provenance]];
  for (const [path, bytes] of read) {
    if (caBodies[path] !== sha256Hex(bytes)) fail(`the committed deploy check was captured on another ${path}: re-run the deploy check and commit its output before this sync`);
  }
  const checks = arr(ca.checks, "the committed deploy check controls", (x) => (isObj(x) && typeof x.ok === "boolean" ? x.ok : fail("a deploy check control has no ok flag")));
  const keyringObj = obj(keyring, ["schema", "keys"], "the committed keyring");
  return {
    $comment:
      "Committed, hashed facts about the SERVED Bell host, rendered by /bell and /bell/method through apps/site/lib/bell-served-load.ts after a sha256 check against apps/site/data/manifest.sha256.json. Written by scripts/sync-bell-served.mjs (source-repo tool) from the files the host serves: /timeline.jsonl walked line by line under the committed keyring (chain, signatures, key schedule), /bell/pubkey.json (byte-identical to the committed keyring), /state.json and /provenance.json (bound by sha256 to the latest signed publication line, the head), the immutable /states/<sha256>.json of the head and of the first record. first_record and head = the facts of those two lines (line_hash = sha256 of the canonical line). lines = the facts of every walked line, in order: seq, kind, line_hash, prev_line_hash and, for a publication, its state and provenance digests (the anchors sync binds each anchor row to them). head.runs = every run of the latest publication as served: the signed records, the residual counts (every code), the per-session rows, the volume-ratio periods and definitions WITHOUT the ratio values, the supply readout, the proof-of-reserves status only, the wrappers, the halt census and deltas, and per run from the provenance: the start of the collection, the operator counts, the fault statuses (each marked as on a ledger operator or not; no label is kept), the closing-price request digest. keyring = key ids, statuses and first seq of the committed keyring. deploy_check = counts of the committed deploy check, captured on these same bodies. collector_revision = the last commit of the collector source. served_schema = the key lists of the served envelopes and the publisher's closed list of objects. bodies_sha256 = the sha256 of the four bodies as read at read_at.",
    schema: BELL_SERVED_SCHEMA,
    host: BELL_HOST,
    read_at: input.readAt,
    timeline: { schema: head.schema, lines: lines.length, publications: lines.filter((l) => isObj(l) && l.kind === "publication").length },
    lines: lines.map((x) => {
      const l = isObj(x) ? x : fail("a timeline line is not an object");
      return { seq: l.seq, kind: l.kind, line_hash: deps.lineHash(l), prev_line_hash: l.prev_line_hash, ...(l.kind === "publication" ? { state_sha256: l.state_sha256, provenance_sha256: l.provenance_sha256 } : {}) };
    }),
    first_record: { ...lineFacts(firstLine), symbols: firstSymbols },
    head: { ...lineFacts(head), sig: head.sig, state_schema: state.schema, provenance_schema: prov.schema, runs },
    keyring: { schema: keyringObj.schema, keys: arr(keyringObj.keys, "the committed keyring keys", (x) => { const k = isObj(x) ? x : fail("a keyring key"); return { key_id: k.key_id, status: k.status, valid_from_seq: k.valid_from_seq }; }) },
    deploy_check: { checked_at: ca.checked_at, checks_total: checks.length, checks_passed: checks.filter((x) => x).length, tls_authorized: isObj(ca.tls) && ca.tls.authorized === true },
    collector_revision: input.collectorRevision,
    served_schema: {
      state_file: Object.keys(state).sort(), provenance_file: Object.keys(prov).sort(), timeline_line: Object.keys(head).sort(),
      timeline_run: Object.keys(lineRuns[0] ?? {}).sort(), objects: JSON.parse(JSON.stringify(wl)) as unknown,
    },
    bodies_sha256: Object.fromEntries(read.map(([path, bytes]) => [path, sha256Hex(bytes)])),
  };
}
