// MONARK Bell -- T-1b publisher (ADR-T1b-backend v2 D4-D9). Turns ONE pending bundle of real runMain runs into a signed, chained,
// durably written publication, and refuses by name everything else (BellPublishError / exit 1, state directory untouched). It
// computes NO fact: its own fields are seq, published_at, hashes, key_id and signatures. Node built-ins + bell-chain.mjs only.
// Layout of --state: timeline.jsonl (private, source of truth, commit point), keyring.json (private state keyring), staging/,
// archive/<seq>-<bundle>/, public/ (served by Caddy: state.json, provenance.json, timeline.jsonl, bell/pubkey.json,
// states/<sha>.json, provenance/<sha>.json). CLI (systemd oneshot, ADR D10): node bell-publish.mjs --inbox <dir> --state <dir>;
// the private key is read ONLY from $CREDENTIALS_DIRECTORY/bell-signing-key (systemd LoadCredential, PKCS#8 PEM).
import { openSync, readSync, writeSync, fsyncSync, closeSync, renameSync, mkdirSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename, isAbsolute } from "node:path";
import { createPrivateKey } from "node:crypto";
import { pathToFileURL } from "node:url";
import { GENESIS, canonical, closeLikePath, sha256Hex, lineHash, rechainRunTimeline, signLine, verifyLine, keyIdOf, keyringOf, publicKeyOfJwk } from "./bell-chain.mjs";

/** The CLOSED list of refusal codes. The detail names a JSON path or a file, never a value. */
export const REFUSAL_CODES = Object.freeze(["inbox_not_exactly_one_bundle", "too_many_runs", "input_too_large", "schema_mismatch", "unknown_field",
  "bell_sha_mismatch", "close_like_field", "session_not_yet_publishable", "run_timeline_broken", "provenance_binding_mismatch", "url_or_key_shaped_string",
  "duplicate_run", "public_state_too_large", "line_too_large", "existing_timeline_corrupt", "signing_key_missing", "signing_key_not_in_keyring"]);
export class BellPublishError extends Error {
  constructor(code, detail) { super(`bell/publish: ${code}: ${detail}`); this.name = "BellPublishError"; this.code = code; this.detail = detail; }
}
const refuse = (code, detail) => { throw new BellPublishError(code, detail); };
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
/** CP1 point (i), under C-in-8: a served provider label is a bare providerOf label; a dotted host (e.g. a cash-data domain logged
 *  on a transport fault, collect.ts:435, close.ts:162) is refused like a url, never served (decision 69). */
const BARE_LABEL = /^[a-z0-9][a-z0-9-]*$/;
function scanStrings(v, path) {
  if (typeof v === "string") { if (KEY_SHAPES.some((re) => re.test(v))) refuse("url_or_key_shaped_string", path); return; }
  if (Array.isArray(v)) v.forEach((x, i) => scanStrings(x, `${path}[${i}]`));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) scanStrings(x, `${path}.${k}`);
}

const RUN_FILES = ["state.json", "timeline.jsonl", "provenance.json", "journal.json"]; // journal.json: tolerated, never read, never served
/** C-in-1..8 for one run directory, as runMain writes it (collect.ts:854-859). */
function validateRun(ent, dir, at, B, t) {
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
  (state.digest.gaps ?? []).forEach((g, j) => { // C-in-5 (R-T1b-1: one session early refuses the whole bundle)
    if (g.earliest_publish_utc !== undefined && !(typeof g.earliest_publish_utc === "number" && g.earliest_publish_utc <= t))
      refuse("session_not_yet_publishable", `${at}.state.digest.gaps[${j}].earliest_publish_utc`);
  });
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

/** Read a jsonl file line by line in chunks, each line bounded by MAX_LINE_BYTES (never the whole file at once). */
function readLines(path, max, corrupt) {
  if (!existsSync(path)) return { texts: [], tail: "" };
  const fd = openSync(path, "r"), buf = Buffer.alloc(1 << 16), texts = [];
  let cur = [], len = 0;
  try {
    for (let n; (n = readSync(fd, buf, 0, buf.length, null)) > 0;) {
      let s = 0;
      for (let i = 0; i < n; i++) {
        if (buf[i] !== 10) continue;
        len += i - s;
        if (len + 1 > max) corrupt(`a line of ${basename(path)} exceeds MAX_LINE_BYTES`);
        texts.push(Buffer.concat([...cur, buf.subarray(s, i)]).toString("utf8"));
        cur = []; len = 0; s = i + 1;
      }
      if (s < n) { cur.push(Buffer.from(buf.subarray(s, n))); len += n - s; if (len + 1 > max) corrupt(`a line of ${basename(path)} exceeds MAX_LINE_BYTES`); }
    }
  } finally { closeSync(fd); }
  return { texts, tail: Buffer.concat(cur).toString("utf8") };
}

/** Start-up integrity (read-only): chain, signatures (state keyring), contiguous seq; public/ a prefix of the private timeline. */
function inspect(stateDir, B) {
  const corrupt = (why) => refuse("existing_timeline_corrupt", why);
  const priv = readLines(join(stateDir, "timeline.jsonl"), B.MAX_LINE_BYTES, corrupt);
  let texts = priv.texts, torn = priv.tail !== "";
  const lines = [];
  texts.forEach((s, i) => {
    try { lines.push(JSON.parse(s)); } catch { if (i === texts.length - 1 && !torn) torn = true; else corrupt(`private line ${i + 1} does not parse`); }
  });
  if (lines.length < texts.length) texts = texts.slice(0, -1); // a torn last line: repairable only if never served (below)
  const krPath = join(stateDir, "keyring.json");
  let keyring = null;
  if (existsSync(krPath)) {
    const txt = readFileSync(krPath, "utf8");
    let ok = false;
    try {
      keyring = JSON.parse(txt);
      const k = keyring.keys[0];
      ok = keyring.schema === "bell-keyring-v1" && keyring.keys.length === 1 && k.status === "active" && Number.isInteger(k.valid_from_seq) && k.valid_from_seq >= 1
        && canonical(keyring) + "\n" === txt && keyIdOf(publicKeyOfJwk(k.jwk)) === k.key_id;
    } catch { ok = false; }
    if (!ok) corrupt("keyring.json is not a bell-keyring-v1 with one active key");
  } else if (lines.length > 0) corrupt("keyring.json missing");
  let prev = GENESIS;
  lines.forEach((l, i) => {
    const k = keyring.keys[0];
    let ok = false;
    try {
      ok = l.schema === "bell-timeline-v1" && l.kind === "publication" && l.seq === i + 1 && l.prev_line_hash === prev && l.key_id === k.key_id
        && l.seq >= k.valid_from_seq && verifyLine(l, publicKeyOfJwk(k.jwk));
      prev = lineHash(l);
    } catch { ok = false; }
    if (!ok) corrupt(`private line ${i + 1}: schema, seq, chain or signature`);
  });
  const pub = readLines(join(stateDir, "public", "timeline.jsonl"), B.MAX_LINE_BYTES, corrupt);
  if (pub.tail !== "" || pub.texts.length > texts.length || pub.texts.some((s, i) => s !== texts[i])) corrupt("public/timeline.jsonl is not a prefix of the private timeline");
  const moves = []; // the immutables of every committed line: in public/, else still in staging/ (moved at repair), else corrupt
  for (const l of lines) for (const [d, h] of [["states", l.state_sha256], ["provenance", l.provenance_sha256]]) {
    const dst = join(stateDir, "public", d, `${h}.json`), src = join(stateDir, "staging", d, `${h}.json`);
    if (existsSync(dst)) continue;
    if (!existsSync(src) || sha256Hex(readFileSync(src)) !== h) corrupt(`immutable ${d}/${h}.json missing`);
    moves.push([src, dst]);
  }
  return { lines, texts, torn, keyring, moves };
}

/** The durable write primitives (calque rebase-crosscheck.ts:595-655). A MUTABLE object on purpose, the test seam; publishToDir
 *  also takes an `fs` of this shape. Linux: no rename retry (a failure is a refusal of the run, recovered at the next start). */
export const DURABLE_FS = {
  openSync: (p, flags) => openSync(p, flags),
  writeSync: (fd, data) => { const b = Buffer.from(data, "utf8"); for (let o = 0; o < b.length;) o += writeSync(fd, b, o, b.length - o); },
  fsyncSync: (fd) => { fsyncSync(fd); },
  closeSync: (fd) => { closeSync(fd); },
  renameSync: (a, b) => { renameSync(a, b); },
  // fsync(2) of the parent directory makes a created/renamed entry durable. Measured 2026-09-23 (Node v24.15.0, win32): open(dir,
  // "r") then fsync => EPERM; open(dir, "r+") then fsync => ok. POSIX opens a directory O_RDONLY (O_RDWR is EISDIR on Linux).
  fsyncDir: (dir) => { const fd = openSync(dir, process.platform === "win32" ? "r+" : "r"); try { fsyncSync(fd); } finally { closeSync(fd); } },
};
function ensureDir(dir, D) { if (existsSync(dir)) return; ensureDir(dirname(dir), D); mkdirSync(dir); D.fsyncDir(dirname(dir)); }
/** tmp (in staging/, never under public/) -> write -> fsync -> close -> rename -> fsync(parent directory). */
function writeDurable(path, content, stateDir, D) {
  const stg = join(stateDir, "staging");
  ensureDir(stg, D); ensureDir(dirname(path), D);
  const tmp = join(stg, `tmp-${basename(path)}`), fd = D.openSync(tmp, "w");
  try { D.writeSync(fd, content); D.fsyncSync(fd); } finally { D.closeSync(fd); }
  D.renameSync(tmp, path); D.fsyncDir(dirname(path));
}
/** Steps 4-6, idempotent (also the start-up repair): immutables into public/, then public/timeline.jsonl, then the current files. */
function serve(stateDir, lines, moves, privText, keyring, D) {
  const pub = join(stateDir, "public"), last = lines[lines.length - 1];
  let wrote = false;
  for (const [a, b] of moves) { ensureDir(dirname(b), D); D.renameSync(a, b); D.fsyncDir(dirname(b)); wrote = true; }
  for (const [p, content] of [[join(pub, "timeline.jsonl"), () => privText],
    [join(pub, "state.json"), () => readFileSync(join(pub, "states", `${last.state_sha256}.json`), "utf8")],
    [join(pub, "provenance.json"), () => readFileSync(join(pub, "provenance", `${last.provenance_sha256}.json`), "utf8")],
    [join(pub, "bell", "pubkey.json"), () => canonical(keyring) + "\n"]]) {
    const c = content();
    if (!existsSync(p) || readFileSync(p, "utf8") !== c) { writeDurable(p, c, stateDir, D); wrote = true; }
  }
  return wrote;
}

/** Publish the ONE pending bundle of `inboxDir` into `stateDir` (ADR D8), or refuse by name with nothing written.
 *  Contract of ADR D12 (named parameters; the keyring derives from privateKey and the state). */
export function publishToDir({ inboxDir, stateDir, privateKey, clock, bounds = {}, fs: D = DURABLE_FS }) {
  const t = clock(); // C-3: the ONE clock read of a publication; the envelopes and the line carry the same published_at
  const published_at = new Date(t).toISOString(), B = { ...BOUNDS, ...bounds };
  const st = inspect(stateDir, B);
  const keyId = keyIdOf(privateKey);
  if (st.keyring !== null && st.keyring.keys[0].key_id !== keyId) refuse("signing_key_not_in_keyring", "the loaded key is not the active key of the state keyring");
  const keyring = st.keyring ?? keyringOf(privateKey, 1);
  let privText = st.texts.map((s) => s + "\n").join("");
  if (st.torn) { writeDurable(join(stateDir, "timeline.jsonl"), privText, stateDir, D); process.stderr.write("bell/publish: repaired_torn_tail\n"); }
  if (st.lines.length > 0 && serve(stateDir, st.lines, st.moves, privText, keyring, D)) process.stderr.write("bell/publish: rederived_public\n");
  let entries = [];
  try { entries = readdirSync(inboxDir, { withFileTypes: true }); } catch { /* an absent inbox is zero bundles */ }
  if (entries.length !== 1 || !entries[0].isDirectory()) refuse("inbox_not_exactly_one_bundle", `${entries.length} inbox entries`); // C-in-1
  const bundle = entries[0].name, bdir = join(inboxDir, bundle);
  const runDirs = readdirSync(bdir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1));
  if (runDirs.length === 0) refuse("inbox_not_exactly_one_bundle", "the bundle has no run");
  if (runDirs.length > B.MAX_RUNS) refuse("too_many_runs", `${runDirs.length} runs > MAX_RUNS ${B.MAX_RUNS}`);
  const runs = runDirs.map((e, i) => validateRun(e, join(bdir, e.name), `$.runs[${i}]`, B, t));
  const seen = new Set(); // C-in-10
  runs.forEach((r, i) => { if (seen.has(r.bellSha)) refuse("duplicate_run", `$.runs[${i}].state.bell_sha`); seen.add(r.bellSha); });
  runs.sort((a, b) => (a.bellSha < b.bellSha ? -1 : 1));
  const archive = (seq) => { // step 7
    const dir = join(stateDir, "archive");
    ensureDir(dir, D);
    const dst = existsSync(join(dir, `${seq}-${bundle}`)) ? join(dir, `${seq}-${bundle}-dup-${t}`) : join(dir, `${seq}-${bundle}`);
    D.renameSync(bdir, dst); D.fsyncDir(dir); D.fsyncDir(inboxDir);
  };
  const result = (status, l) => ({ status, seq: l.seq, published_at: l.published_at, state_sha256: l.state_sha256, provenance_sha256: l.provenance_sha256, line_hash: lineHash(l) });
  const last = st.lines[st.lines.length - 1];
  if (last !== undefined && canonical(last.runs.map((r) => r.bell_sha)) === canonical(runs.map((r) => r.bellSha))) { // C-in-9
    archive(last.seq);
    return result("nothing_to_publish", last);
  }
  const seq = st.lines.length + 1;
  const envelope = (schema, key) => canonical({ schema, seq, published_at, runs: runs.map((r) => r[key]) }) + "\n";
  const stateText = envelope("bell-public-state-v1", "state"), provText = envelope("bell-public-provenance-v1", "projection");
  if (Buffer.byteLength(stateText) > B.MAX_PUBLIC_STATE_BYTES) refuse("public_state_too_large", "public/state.json");
  const line = { schema: "bell-timeline-v1", seq, kind: "publication", published_at, prev_line_hash: last === undefined ? GENESIS : lineHash(last), key_id: keyId,
    state_sha256: sha256Hex(stateText), provenance_sha256: sha256Hex(provText), runs: runs.map((r) => ({ bell_sha: r.bellSha, window: r.state.window, records: r.records })) };
  line.sig = signLine(line, privateKey);
  const lineText = canonical(line) + "\n";
  if (Buffer.byteLength(lineText) > B.MAX_LINE_BYTES) refuse("line_too_large", "the timeline line");
  const stg = (d, h) => join(stateDir, "staging", d, `${h}.json`);
  writeDurable(stg("states", line.state_sha256), stateText, stateDir, D); // step 2: the immutables, durable, NOT served
  writeDurable(stg("provenance", line.provenance_sha256), provText, stateDir, D);
  if (st.keyring === null) writeDurable(join(stateDir, "keyring.json"), canonical(keyring) + "\n", stateDir, D); // step 3: first run
  const fd = D.openSync(join(stateDir, "timeline.jsonl"), "a"); // step 3: durable append = the COMMIT POINT
  try { D.writeSync(fd, lineText); D.fsyncSync(fd); } finally { D.closeSync(fd); }
  D.fsyncDir(stateDir);
  privText += lineText;
  serve(stateDir, [...st.lines, line], [[stg("states", line.state_sha256), join(stateDir, "public", "states", `${line.state_sha256}.json`)],
    [stg("provenance", line.provenance_sha256), join(stateDir, "public", "provenance", `${line.provenance_sha256}.json`)]], privText, keyring, D); // steps 4-6
  archive(seq);
  return result("published", line);
}

/** CLI: exit 0 with one JSON summary line on stdout, or exit 1 with `bell/publish: <code>: <detail>` on stderr. */
export function runCli(argv) {
  const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const inboxDir = arg("--inbox"), stateDir = arg("--state");
  if (!inboxDir || !stateDir) { process.stderr.write("bell/publish: usage: node bell-publish.mjs --inbox <dir> --state <dir>\n"); return 1; }
  try {
    const credDir = process.env.CREDENTIALS_DIRECTORY; // systemd LoadCredential (ADR D9): the ONLY environment read of this module
    if (typeof credDir !== "string" || !isAbsolute(credDir)) refuse("signing_key_missing", "$CREDENTIALS_DIRECTORY is not set to an absolute path");
    let privateKey;
    try { privateKey = createPrivateKey(readFileSync(join(credDir, "bell-signing-key"))); } catch { refuse("signing_key_missing", "$CREDENTIALS_DIRECTORY/bell-signing-key absent or unreadable"); }
    if (privateKey.asymmetricKeyType !== "ed25519") refuse("signing_key_missing", "bell-signing-key is not an Ed25519 private key");
    process.stdout.write(JSON.stringify(publishToDir({ inboxDir, stateDir, privateKey, clock: () => Date.now() })) + "\n");
    return 0;
  } catch (e) {
    process.stderr.write(`bell/publish: ${e instanceof BellPublishError ? `${e.code}: ${e.detail}` : `fatal: ${String(e?.code ?? e?.name ?? "error")}`}\n`);
    return 1;
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = runCli(process.argv.slice(2));
