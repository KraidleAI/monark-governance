// MONARK Bell -- T-1b validation of a pending bundle (ADR-T1b-backend v2 D4, D5, D7, "Constantes"), extracted from bell-publish.mjs
// so that the publisher and the collection tick run the SAME rules: validateRun (C-in-1..8, one run directory as runMain writes it)
// and validateBundle (C-in-1 and C-in-10, the bundle check of publishToDir). It reads only the directory it is given; it holds no
// key and reads no environment. Node built-ins, bell-chain.mjs and the calendar ../src/sessions.ts (PXB-1) only. bell-publish.mjs re-exports its bindings.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { canonical, closeLikePath, sha256Hex, rechainRunTimeline } from "./bell-chain.mjs"; import { earliestPublishUtc, refCloseDateOf } from "../src/sessions.ts";

/** The CLOSED list of refusal codes. The detail names a JSON path or a file, never a value. */
export const REFUSAL_CODES = Object.freeze(["inbox_not_exactly_one_bundle", "too_many_runs", "input_too_large", "schema_mismatch", "unknown_field",
  "bell_sha_mismatch", "close_like_field", "session_not_yet_publishable", "run_timeline_broken", "provenance_binding_mismatch", "url_or_key_shaped_string",
  "duplicate_run", "public_state_too_large", "line_too_large", "existing_timeline_corrupt", "signing_key_missing", "signing_key_not_in_keyring",
  "no_timeline", "key_already_in_keyring", "revocation_invalid", "key_file_exists", "handoff_start_missing", "start_mark_exists", "start_mark_not_after_bundles", "window_overlaps_published", "lock_held", "clock_unsynced", "manifest_mismatch", "rotation_line_mismatch"]);
export class BellPublishError extends Error {
  constructor(code, detail) { super(`bell/publish: ${code}: ${detail}`); this.name = "BellPublishError"; this.code = code; this.detail = detail; }
}
const refuse = (code, detail) => { throw new BellPublishError(code, detail); }; // local, not exported (the publisher keeps its own)
const deepFreeze = (o) => { for (const v of Object.values(o)) if (v && typeof v === "object") deepFreeze(v); return Object.freeze(o); };

// C-7 (ADR v2 "Constantes"). MAX_RUNS 64: the v1 perimeter is 5 tokens (ADR-B0 D2), a few runs per publication, one order of
// magnitude of margin. MAX_INPUT_FILE_BYTES 64 MiB: <= 1/7 of the unit's V8 heap (--max-old-space-size=448), which must also hold
// the parse, a canonical copy and the hash. MAX_PUBLIC_STATE_BYTES 64 MiB: same memory budget. MAX_LINE_BYTES 1 MiB: a line
// embeds at most MAX_RUNS x a few records per symbol. Injectable (publishToDir `bounds`) for the lowered-bound tests.
export const BOUNDS = Object.freeze({ MAX_RUNS: 64, MAX_INPUT_FILE_BYTES: 64 * 1024 * 1024, MAX_PUBLIC_STATE_BYTES: 64 * 1024 * 1024, MAX_LINE_BYTES: 1024 * 1024 });

const S = "scalar", SA = "scalar[]";
/** C-4: the keys a served object may carry, DERIVED from the collector's types and construction sites @ adc3260 (never from a
 *  fixture), with the shape of each value: S scalar, SA array of scalars, "<name>" object, ["<name>"] array of objects. */
export const WHITELIST = deepFreeze({
  gap: { symbol: S, session: S, regime: S, vwap: S, volumeBase: S, n: S, cash_cross: S, gT: S, exceed1: S, exceed2: S, exceed5: S, // digest.ts:66-97
    multiplierUsed: S, rebase_residuals: SA, earliest_publish_utc: S, abstain: S },
  residuals: Object.fromEntries(["resume_time_missing", "resume_date_gt_halt_date", "no_fill_in_window", "reason_unknown", "block_ts_vs_submission", // residuals.ts:14-55
    "no_close_ref", "por_unavailable", "por_stale", "no_wrapper", "multiplier_unit", "no_quorum", "quorum_sampled", "rebase_unverified",
    "authority_scan_mono_operator", "set_authority_unscanned", "cash_cross_mismatch", "cash_cross_unavailable", "no_adv", "no_multiplier"].map((c) => [c, S])),
  window: { from_utc_ms: S, to_utc_ms: S }, // collect.ts:225, :304
  adv_period: { year: S, month: S }, // collect.ts:225
  volume: { symbol: S, session: S, regime: S, session_date_et: S, window: "window", adv_period: "adv_period", n: S, n_bars: S, n_trading_days: S, // collect.ts:224-233
    formula: S, abstain: SA, vol_ratio: S, multiplier_unit: S },
  supply: { symbol: S, supply: S, decimals: S, multiplier: S, paused: S, permanent_delegate: S }, // collect.ts:241-242
  por: { symbol: S, kind: S, method: S, note: S, age_sec: S, statement: S }, // collect.ts:245-247 (three forms)
  wrapper: { symbol: S, contracts: SA, residue: S }, // collect.ts:250
  halt_deltas: { symbol: S, chain: S, reason_family: S, halt_utc_ms: S, resume_utc_ms: S, first_fill_after_halt_utc_ms: S, // collect.ts:272-273
    last_fill_before_resume_utc_ms: S, n_fills_in_window: S },
  halt_census: { total: S, empty_resume: S }, // collect.ts:277
  digest: { schema: S, gaps: ["gap"], halt_census: "halt_census", residuals: "residuals", volume: ["volume"], supply: ["supply"], por: ["por"], wrapper: ["wrapper"] }, // digest.ts:103 + collect.ts:279-281
  state: { schema: S, bell_sha: S, window: "window", residuals: "residuals", digest: "digest", halt_deltas: ["halt_deltas"] }, // collect.ts:303-305
  record: { symbol: S, chain: S, n_fills: S, sessions: S, quorum_coverage: S, prev_line_hash: S }, // collect.ts:90, :254-255 (declared addition)
  provenance: { bellSha: S, generatedAt: S, sources: "sources", providers: "providers" }, // the SERVED projection (digest.ts:108)
  sources: { generated_at: S, cash_request_digest: S, cash_cross_mismatch_days: SA, cash_cross_unavailable_days: SA }, // collect.ts:294-299
  providers: { providers: SA, quorum_required: S, providers_distinct: S, faults: ["fault"] }, // collect.ts:300-301
  fault: { provider: S, status: S }, // quorum.ts:80
});
/** Read in a run's provenance, NEVER served (decision 69, R-T1b-2): the names of the cash-data sources. */
export const NOT_SERVED = deepFreeze({ sources: { close_source: S, adv_source: S } });

const isScalar = (v) => v === null || typeof v === "string" || typeof v === "boolean" || (typeof v === "number" && Number.isFinite(v));
const own = (o, k) => (o !== undefined && Object.hasOwn(o, k) ? o[k] : undefined);
/** C-in-2: every key at every level is whitelisted and every value has its declared shape. */
function check(v, desc, path, extra = {}) {
  if (desc === S) { if (!isScalar(v)) refuse("schema_mismatch", `${path}: not a finite scalar`); return; }
  if (desc === SA || Array.isArray(desc)) {
    if (!Array.isArray(v)) refuse("schema_mismatch", `${path}: not an array`);
    v.forEach((x, i) => check(x, desc === SA ? S : desc[0], `${path}[${i}]`, extra));
    return;
  }
  if (v === null || typeof v !== "object" || Array.isArray(v)) refuse("schema_mismatch", `${path}: not an object`);
  for (const [k, x] of Object.entries(v)) {
    const d = own(WHITELIST[desc], k) ?? own(extra[desc], k);
    if (d === undefined) refuse("unknown_field", `${path}.${k}`);
    check(x, d, `${path}.${k}`, extra);
  }
}
/** The served projection: whitelisted keys only (drops NOT_SERVED); computes nothing. */
function project(v, desc) {
  if (Array.isArray(desc)) return v.map((x) => project(x, desc[0]));
  if (desc === S || desc === SA) return v;
  return Object.fromEntries(Object.entries(v).filter(([k]) => own(WHITELIST[desc], k) !== undefined).map(([k, x]) => [k, project(x, WHITELIST[desc][k])]));
}

/** C-in-8: "://" plus the credential shapes of test/no-secret-in-repo.test.ts:34-63 (copied verbatim, pinned by the validate test). */
export const KEY_SHAPES = Object.freeze([/:\/\//, /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----/, /\bAKIA[0-9A-Z]{16}\b/, /\bghp_[0-9A-Za-z]{36}\b/,
  /\bgithub_pat_[0-9A-Za-z_]{40,}\b/, /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/, /\bAIza[0-9A-Za-z_-]{35}\b/,
  /api[-_]?key["' ]*[=:]["' ]*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, /(?:core\.)?chainstack\.com\/[0-9a-f]{32}/i,
  /p2pify\.com\/[0-9a-f]+/i, /\bBearer\s+[A-Za-z0-9._-]{16,}/, /\b[A-Z][A-Z0-9_]*_API_KEY\s*=\s*["']?[^\s"'#]{6,}/, /\bdb-[A-Za-z0-9]{20,}\b/]);
/** CP1 point (i), under C-in-8: a served provider label is bare: a providerOf operator label, or a cash-leg label naming the LEG
 *  (cash-close, cash-crosscheck, adv-bars: ADR-BELL-CASH-LEG-1 D2); a dotted host is refused like a url, never served (decision 69). */
const BARE_LABEL = /^[a-z0-9][a-z0-9-]*$/;
function scanStrings(v, path) {
  if (typeof v === "string") { if (KEY_SHAPES.some((re) => re.test(v))) refuse("url_or_key_shaped_string", path); return; }
  if (Array.isArray(v)) v.forEach((x, i) => scanStrings(x, `${path}[${i}]`));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) scanStrings(x, `${path}.${k}`);
}

const RUN_FILES = ["state.json", "timeline.jsonl", "provenance.json", "journal.json"]; // journal.json: tolerated, never read, never served
/** C-in-1..8 for one run directory, as runMain writes it (collect.ts:854-859). */
export function validateRun(ent, dir, at, B, t) {
  if (!ent.isDirectory()) refuse("schema_mismatch", `${at}: not a run directory`);
  const raw = {};
  for (const f of readdirSync(dir)) {
    const p = join(dir, f), st = statSync(p);
    if (!RUN_FILES.includes(f) || !st.isFile()) refuse("schema_mismatch", `${at}: unexpected entry in the run directory`);
    if (st.size > B.MAX_INPUT_FILE_BYTES) refuse("input_too_large", `${at}/${f}`);
    if (f !== "journal.json") raw[f] = readFileSync(p, "utf8");
  }
  for (const f of RUN_FILES.slice(0, 3)) if (raw[f] === undefined) refuse("schema_mismatch", `${at}/${f}: missing`);
  const parse = (s, p, code) => { try { return JSON.parse(s); } catch { return refuse(code, `${p}: not JSON`); } };
  const state = parse(raw["state.json"], `${at}.state`, "schema_mismatch"), prov = parse(raw["provenance.json"], `${at}.provenance`, "schema_mismatch");
  const tl = raw["timeline.jsonl"];
  if (!tl.endsWith("\n")) refuse("run_timeline_broken", `${at}.timeline: no final newline`);
  const records = tl === "\n" ? [] : tl.slice(0, -1).split("\n").map((l, j) => parse(l, `${at}.timeline[${j}]`, "run_timeline_broken"));
  // C-in-4 FIRST: these contents are served verbatim (state) or projected (provenance, records); a leaked close is named as such.
  for (const [v, p] of [[state, "state"], [prov, "provenance"], [records, "timeline"]]) { const c = closeLikePath(v, `${at}.${p}`); if (c !== null) refuse("close_like_field", c); }
  if (state?.schema !== "bell-state-v1") refuse("schema_mismatch", `${at}.state.schema`); // C-in-2
  check(state, "state", `${at}.state`);
  if (state.digest?.schema !== "bell-digest-v1" || state.window === undefined) refuse("schema_mismatch", `${at}.state.digest.schema or .window`);
  check(prov, "provenance", `${at}.provenance`, NOT_SERVED);
  check(records, ["record"], `${at}.timeline`);
  if (state.bell_sha !== sha256Hex(canonical(state.digest))) refuse("bell_sha_mismatch", `${at}.state.bell_sha`); // C-in-3
  (state.digest.gaps ?? []).forEach((g, j) => { // C-in-5 (R-T1b-1: one session early refuses the whole bundle; BELL-EPU-REQUIRED-1: a g_t without its gate too)
    if ((g.earliest_publish_utc !== undefined || Object.hasOwn(g, "gT")) && !(typeof g.earliest_publish_utc === "number" && g.earliest_publish_utc <= t))
      refuse("session_not_yet_publishable", `${at}.state.digest.gaps[${j}].earliest_publish_utc`);
  }); abstentionGate(state.digest, at, t); // PXB-1 (i): an abstention no_close_ref served before its gate is refused too (below)
  const rc = rechainRunTimeline(records); // C-in-6
  if (!rc.ok) refuse("run_timeline_broken", `${at}.timeline[${rc.index}]: ${rc.reason}`);
  const symbols = new Set([...["gaps", "volume", "supply", "por", "wrapper"].flatMap((k) => state.digest[k] ?? []), ...(state.halt_deltas ?? [])].map((e) => e.symbol));
  records.forEach((r, j) => { if (!symbols.has(r.symbol)) refuse("run_timeline_broken", `${at}.timeline[${j}].symbol: not in the state`); });
  if (prov.bellSha !== state.bell_sha) refuse("provenance_binding_mismatch", `${at}.provenance.bellSha`); // C-in-7
  const projection = project(prov, "provenance"); // C-in-8
  for (const [v, p] of [[state, "state"], [projection, "provenance"], [records, "timeline"]]) scanStrings(v, `${at}.${p}`);
  const labels = [...(projection.providers?.providers ?? []).map((x, j) => [x, `providers[${j}]`]), ...(projection.providers?.faults ?? []).map((f, j) => [f.provider, `faults[${j}].provider`])];
  for (const [x, p] of labels) if (!BARE_LABEL.test(String(x))) refuse("url_or_key_shaped_string", `${at}.provenance.providers.${p}`);
  return { bellSha: state.bell_sha, state, projection, records };
}

/** C-in-1 and C-in-10 for ONE bundle directory: at least one run, at most B.MAX_RUNS, each run valid (validateRun), no bell_sha twice.
 *  `B` is the full bounds object (BOUNDS, or the publisher's lowered bounds); `t` the clock of C-in-5. Returns the runs sorted by bell_sha. */
export function validateBundle(bdir, B, t) {
  const runDirs = readdirSync(bdir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1));
  if (runDirs.length === 0) refuse("inbox_not_exactly_one_bundle", "the bundle has no run");
  if (runDirs.length > B.MAX_RUNS) refuse("too_many_runs", `${runDirs.length} runs > MAX_RUNS ${B.MAX_RUNS}`);
  const runs = runDirs.map((e, i) => validateRun(e, join(bdir, e.name), `$.runs[${i}]`, B, t));
  const seen = new Set(); // C-in-10
  runs.forEach((r, i) => { if (seen.has(r.bellSha)) refuse("duplicate_run", `$.runs[${i}].state.bell_sha`); seen.add(r.bellSha); });
  runs.sort((a, b) => (a.bellSha < b.bellSha ? -1 : 1));
  return runs;
}

/** The closed grammar of a bundle name in the handoff directory: unit-<D>, D the trading day the unit starts, or unit-<D>-r<n> for a
 *  recollection, n from 1 to 99. Any other name (a .tmp- name, a manifest, a tombstone) is not a bundle. */
export const UNIT_NAME = /^unit-\d{4}-\d{2}-\d{2}(-r[1-9]\d?)?$/;
const byteOrder = (x, y) => Buffer.compare(Buffer.from(x), Buffer.from(y));
/** The manifest of a bundle directory, the sibling file <name>.manifest: one line `<sha256>  <path>` + LF per file under `dir`, the path
 *  relative to it, "/" separated, in byte order. An entry that is neither a file nor a directory is refused. */
export function manifestOf(dir) {
  const paths = [];
  const walk = (d, rel) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = rel === "" ? e.name : `${rel}/${e.name}`;
      if (e.isDirectory()) walk(join(d, e.name), p); else if (e.isFile()) paths.push(p); else refuse("schema_mismatch", `${p}: neither a file nor a directory`);
    }
  };
  walk(dir, "");
  return paths.sort(byteOrder).map((p) => `${sha256Hex(readFileSync(join(dir, ...p.split("/"))))}  ${p}\n`).join("");
}
const MANIFEST_LINE = /^([0-9a-f]{64}) {2}((?:[\w.@-]+\/)*[\w.@-]+)$/;
/** The entries of a manifest, or null when the text is not exactly the form manifestOf writes (a final LF, lowercase digests, two
 *  spaces, paths in strict byte order, no "." or ".." segment). Pure. */
export function readManifest(text) {
  if (typeof text !== "string" || !text.endsWith("\n")) return null;
  const entries = [];
  for (const line of text.slice(0, -1).split("\n")) {
    const m = MANIFEST_LINE.exec(line);
    if (m === null || m[2].split("/").some((s) => s === "." || s === "..")) return null;
    if (entries.length > 0 && byteOrder(entries[entries.length - 1].path, m[2]) >= 0) return null;
    entries.push({ sha256: m[1], path: m[2] });
  }
  return entries;
}

/** PXB-1 BELL-ABSTAIN-GATE-1, prevention (i) (PLAN-P4 l.387-393; PLAN-P5 C5-5): an abstention no_close_ref is served only once its gate has
 *  passed, the earliest publication instant of its reference close, earliestPublishUtc(refCloseDateOf(session, session date)) of the
 *  collector's own calendar (sessions.ts); served before it, it would freeze the abstention of a session whose close is not yet
 *  publishable (G0 R-1, the irreversible abstained session), as C-in-5 refuses a g_t before its gate. The session date is its volume
 *  entry's, by the join of apps/bell/ops/q6-controls.mjs:184-200 (within one (symbol, session, regime) bucket the k-th gap is the k-th
 *  volume entry, of the same n, and the buckets have the same sizes); when a no_close_ref is present and the join is not proven, the run is
 *  refused as well (fail-closed). The refusal is C-in-5's code, the detail naming the gap. Run by validateRun: the tick and the publisher. */
function abstentionGate(digest, at, t) {
  const gaps = Array.isArray(digest.gaps) ? digest.gaps : [];
  if (!gaps.some((g) => g?.abstain === "no_close_ref")) return;
  const bucket = (e) => `${String(e?.symbol)}|${String(e?.session)}|${typeof e?.regime === "string" ? e.regime : "null"}`, vols = new Map(), seen = new Map();
  for (const v of Array.isArray(digest.volume) ? digest.volume : []) vols.set(bucket(v), [...(vols.get(bucket(v)) ?? []), v]);
  const dates = gaps.map((g) => {
    const b = bucket(g), k = seen.get(b) ?? 0, v = (vols.get(b) ?? [])[k];
    seen.set(b, k + 1);
    return v !== undefined && v.n === g.n && typeof v.session_date_et === "string" ? v.session_date_et : null;
  });
  if (dates.includes(null) || [...vols].some(([b, l]) => l.length !== (seen.get(b) ?? 0))) refuse("session_not_yet_publishable", `${at}.state.digest: an abstention no_close_ref and no proven join of gaps and volume entries to date it`);
  gaps.forEach((g, j) => {
    if (g.abstain !== "no_close_ref") return;
    let gate = NaN;
    try { gate = earliestPublishUtc(refCloseDateOf(g.session, dates[j])); } catch { gate = NaN; }
    if (!(gate <= t)) refuse("session_not_yet_publishable", `${at}.state.digest.gaps[${j}].abstain: no_close_ref served before its gate`);
  });
}
