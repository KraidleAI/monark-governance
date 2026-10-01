// MONARK Dojo -- the publisher of PR-3a-1, parts 1a to 1c (ADR-DOJO-PR-3 D-1 row PR-3a-1, cut DOJO-PR3A1-CUT-1; mere
// ADR-DOJO-SNAPSHOT-1 T-9, D-8). It keeps the signed, chained dojo-timeline-v1 under --state and serves it from the public/ subtree,
// Caddy's only root (M-E9). A declared calque of apps/bell/scripts/bell-publish.mjs (state layout, durable writes, key schedule, CLI),
// with the Dojo walker: every line is walked by walkDojoTimeline of dojo-chain.mjs BEFORE its commit, so no line the reader's walker
// refuses is ever committed. Modes: --inbox <bundles> (the next closed day of the collector's handoff layout, read by the layout reader
// of PR-2-2 with its check, published as its lines file and its snapshot line, then a price_version at the seventh valid day),
// --anchor <request> (the anchor line's closed keys, read_rule included; seed_anchor and horizon as printed by dojo-seed.mjs --init),
// --generate-key <new file>, --rotate [--broken], --revoke <key_id> --from-seq <n>, --history <packet>. Keys are read ONLY from $CREDENTIALS_DIRECTORY
// (dojo-signing-key, dojo-signing-key-new: systemd LoadCredential, PKCS#8 PEM). Layout of --state: timeline.jsonl (private, source of
// truth, commit point), keyring.json (the genesis key; the rest derives from the key lines), staging/, public/ (timeline.jsonl,
// dojo/pubkey.json in dojo-keyring-v1, lines/<sha256>.jsonl, history/<sha256>.jsonl). Node built-ins and modules of the repo only.
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, realpathSync, renameSync, statSync, writeSync } from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import { createPrivateKey, generateKeyPairSync } from "node:crypto";
import { fileURLToPath } from "node:url";
import { GENESIS, canonical, deriveKeyring, keyIdOf, keyringOf, lineHash, sha256Hex, signLine, trustOf } from "../../bell/scripts/bell-chain.mjs";
import { DOJO_TIMELINE_SCHEMA, walkDojoTimeline } from "./dojo-chain.mjs";
import { dirSource, verifyDojoServed } from "./dojo-verify.mjs";
import { dayMinimum, dayValue, holderCounted, lotsOf, ownerClass, provisionalOf, rootOf, scoreOf, seedAnchor, tierOf, unitPrice, unitThreshold,
  unitsOf, validatedOf } from "./dojo-core.mjs";
import { DOJO_BUNDLE_REFUSALS } from "../src/bundle.ts";
import { DOJO_LAYOUT_REFUSALS, readDayLayout } from "../src/layout.ts";
import { READ_RULE } from "../src/dojo-methods.ts";

const HISTORY = Object.freeze(["history_exists", "history_after_snapshot", "history_bundle_malformed", "history_bundle_mismatch"]); // --history (PR-3a-2)
const PASSED = Object.freeze([...DOJO_LAYOUT_REFUSALS, ...DOJO_BUNDLE_REFUSALS]); // the readers' (PR-2-1, PR-2-2), passed through under their own names
/** The CLOSED list of the publisher's refusals, outside the verifier's 45 codes. A detail names a file, a key or a seq, never a value. */
export const DOJO_PUBLISH_REFUSALS = Object.freeze(["existing_timeline_corrupt", "signing_key_missing", "signing_key_not_in_keyring", "price_version_pending",
  "anchor_malformed", "line_refused", "no_timeline", "key_already_in_keyring", "revocation_invalid", "key_file_exists", "anchor_on_published_day", ...HISTORY,
  "history_missing", "day_not_after_anchor", "bundle_day_mismatch", "bundle_anchor_mismatch", "seed_outside_anchor_chain", "eve_mismatch", ...PASSED]);
export class DojoPublishError extends Error {
  constructor(code, detail) { super(`dojo/publish: ${code}: ${detail}`); this.name = "DojoPublishError"; this.code = code; this.detail = detail; }
}
const refuse = (code, detail) => { throw new DojoPublishError(code, detail); };

/** 1 MiB per timeline line and per anchor request: the verifier's VERIFY_BOUNDS.MAX_LINE_BYTES (dojo-verify.mjs). */
export const BOUNDS = Object.freeze({ MAX_LINE_BYTES: 1024 * 1024 });
/** An anchor request = the anchor line's own fields (mere D-8, tenth pli), closed; declared duplicate of FIELDS.anchor of dojo-verify.mjs. */
export const ANCHOR_KEYS = Object.freeze(["seed_anchor", "mint", "program", "k_reads", "horizon", "validation_days", "tier_units",
  "objective_unit_microusd_days", "tier_windows", "price_window_days", "pool", "pool_quote_vault", "sol_usd_source",
  "dust_threshold_microusd", "read_rule"]);
/** The anchor's account fields are 32-byte base58 addresses, never a label: no operator label is ever served (M-E3). */
const ACCOUNTS = ["mint", "program", "pool", "pool_quote_vault", "sol_usd_source"];
const KEY = "dojo-signing-key";
const DAY_MS = 86_400_000;
/** A day AAAA-MM-JJ as its count of days since 1970-01-01, and back (the walker's forms, dojo-chain.mjs:33-37). */
const epochOf = (s) => Date.parse(`${s}T00:00:00.000Z`) / DAY_MS;
const dateOf = (n) => new Date(n * DAY_MS).toISOString().slice(0, 10);

/** The durable write primitives (calque of bell-publish.mjs DURABLE_FS): a MUTABLE object on purpose, the test seam. */
export const DURABLE_FS = {
  openSync: (p, flags) => openSync(p, flags),
  writeSync: (fd, data) => { const b = Buffer.from(data, "utf8"); for (let o = 0; o < b.length;) o += writeSync(fd, b, o, b.length - o); },
  fsyncSync: (fd) => { fsyncSync(fd); },
  closeSync: (fd) => { closeSync(fd); },
  renameSync: (a, b) => { renameSync(a, b); },
  // fsync(2) of the parent directory makes a created or renamed entry durable; a directory opens "r+" on win32, "r" on POSIX
  // (measured by Bell, bell-publish.mjs:211-213).
  fsyncDir: (dir) => { const fd = openSync(dir, process.platform === "win32" ? "r+" : "r"); try { fsyncSync(fd); } finally { closeSync(fd); } },
};
function ensureDir(dir, D) { if (existsSync(dir)) return; ensureDir(dirname(dir), D); mkdirSync(dir); D.fsyncDir(dirname(dir)); }
/** tmp in staging/, beside public/ and never under it (M-E9) -> write -> fsync -> close -> rename -> fsync(parent directory). */
function writeDurable(path, content, stateDir, D) {
  const stg = join(stateDir, "staging");
  ensureDir(stg, D); ensureDir(dirname(path), D);
  const tmp = join(stg, `tmp-${basename(path)}`), fd = D.openSync(tmp, "w");
  try { D.writeSync(fd, content); D.fsyncSync(fd); } finally { D.closeSync(fd); }
  D.renameSync(tmp, path); D.fsyncDir(dirname(path));
}

/** The complete lines of a jsonl file, each at most MAX_LINE_BYTES, and the bytes after its last LF (a torn tail). */
function readTimeline(path, B) {
  const text = existsSync(path) ? readFileSync(path, "utf8") : "", cut = text.lastIndexOf("\n") + 1;
  const texts = text.slice(0, cut).split("\n").slice(0, -1);
  if (texts.some((s) => Buffer.byteLength(s) + 1 > B.MAX_LINE_BYTES)) refuse("existing_timeline_corrupt", `a line of ${basename(path)} is too large`);
  return { texts, tail: text.slice(cut) };
}
const activeKeyId = (keyring) => keyring.keys.find((k) => k.status === "active").key_id;
/** The served dojo-keyring-v1 (mere D-8, ninth pli): Bell's derived keyring, jwk renamed public_key, without status or continuity. */
const dojoKeyring = (keyring) => ({ schema: "dojo-keyring-v1", keys: keyring.keys.map((k) => ({ key_id: k.key_id, public_key: k.jwk,
  valid_from_seq: k.valid_from_seq, ...(k.valid_to_seq === undefined ? {} : { valid_to_seq: k.valid_to_seq }),
  ...(k.revoked_from_seq === undefined ? {} : { revoked_from_seq: k.revoked_from_seq }) })) });

/** Idempotent (also the start-up repair): the immutables `moves` into public/, then public/timeline.jsonl = the private timeline, then
 *  public/dojo/pubkey.json. */
function serve(stateDir, privText, keyring, D, moves = []) {
  const pub = join(stateDir, "public");
  let wrote = false;
  for (const [a, b] of moves) { ensureDir(dirname(b), D); D.renameSync(a, b); D.fsyncDir(dirname(b)); wrote = true; }
  for (const [p, c] of [[join(pub, "timeline.jsonl"), privText], [join(pub, "dojo", "pubkey.json"), `${canonical(dojoKeyring(keyring))}\n`]]) {
    if (!existsSync(p) || readFileSync(p, "utf8") !== c) { writeDurable(p, c, stateDir, D); wrote = true; }
  }
  return wrote;
}

/** Start-up of every mode (calque of bell-publish.mjs inspect and openState): the private timeline walked by the Dojo walker under the
 *  keyring derived from its genesis key, public/ a prefix of it; a loaded key that is not the active key refuses BEFORE any repair;
 *  then the idempotent repairs of the committed state (a torn private tail, never served; public/). */
function openState(stateDir, B, D, key) {
  const corrupt = (why) => refuse("existing_timeline_corrupt", why), priv = readTimeline(join(stateDir, "timeline.jsonl"), B);
  let texts = priv.texts, torn = priv.tail !== "", genesis = null, keyring = null;
  const lines = [];
  texts.forEach((s, i) => {
    try { lines.push(JSON.parse(s)); } catch { if (i === texts.length - 1 && !torn) torn = true; else corrupt(`private line ${i + 1} does not parse`); }
  });
  if (lines.length < texts.length) texts = texts.slice(0, -1); // a torn last line: repairable only if never served (below)
  const krPath = join(stateDir, "keyring.json");
  if (existsSync(krPath)) {
    try { const kr = JSON.parse(readFileSync(krPath, "utf8")); if (kr.keys.length === 1 && trustOf(kr) !== null) genesis = kr.keys[0]; } catch {
      genesis = null;
    }
    if (genesis === null) corrupt("keyring.json holds no valid genesis key");
    try { keyring = deriveKeyring(genesis, lines); } catch { corrupt("the key lines of the private timeline do not derive a keyring"); }
  } else if (lines.length > 0) corrupt("keyring.json missing");
  if (lines.length > 0) {
    const w = walkDojoTimeline(lines, trustOf(keyring) ?? corrupt("the key lines derive a malformed keyring"));
    if (!w.ok) corrupt(`private line ${w.seq}: ${w.reason}`);
    if (lines[0].key_id !== genesis.key_id) corrupt("private line 1 is not signed by the genesis key of keyring.json");
  }
  const pub = readTimeline(join(stateDir, "public", "timeline.jsonl"), B);
  if (pub.tail !== "" || pub.texts.length > texts.length || pub.texts.some((s, i) => s !== texts[i])) corrupt("public/timeline.jsonl is not a prefix");
  const moves = []; // the immutable of every committed line: in public/, else still in staging/ (moved at repair), else corrupt
  const named = (l) => (l.kind === "snapshot" ? [["lines", l.lines_sha256]] : l.kind === "history" ? [["history", l.history_sha256]] : []);
  for (const l of lines) for (const [dir, h] of named(l)) {
    const dst = join(stateDir, "public", dir, `${h}.jsonl`), src = join(stateDir, "staging", dir, `${h}.jsonl`);
    if (existsSync(dst)) continue;
    if (!existsSync(src) || sha256Hex(readFileSync(src)) !== h) corrupt(`immutable ${dir}/${h}.jsonl missing`);
    moves.push([src, dst]);
  }
  if (key !== null && keyring !== null && activeKeyId(keyring) !== keyIdOf(key)) refuse("signing_key_not_in_keyring", "the loaded key is not the active key");
  const privText = texts.map((s) => `${s}\n`).join("");
  if (torn) { writeDurable(join(stateDir, "timeline.jsonl"), privText, stateDir, D); process.stderr.write("dojo/publish: repaired_torn_tail\n"); }
  if (lines.length > 0 && serve(stateDir, privText, keyring, D, moves)) process.stderr.write("dojo/publish: rederived_public\n");
  return { lines, genesis, keyring, privText };
}

/** The COMMIT POINT of one line: walked by the Dojo walker after the committed timeline, under the keyring derived WITH it, else refused
 *  with nothing written; its immutables ([path under staging/ and public/, text]) durable in staging/ BEFORE the line (M-E1);
 *  keyring.json before the first line; the durable append of the private timeline; then public/. Returns the state after the line. */
function commitLine(stateDir, st, line, D, immutables = []) {
  const lines = [...st.lines, line], keyring = deriveKeyring(st.genesis, lines);
  const w = walkDojoTimeline(lines, trustOf(keyring) ?? refuse("line_refused", "the key lines derive a malformed keyring"));
  if (!w.ok) refuse("line_refused", `seq ${w.seq}: ${w.reason}${w.detail === undefined ? "" : ` (${w.detail})`}`);
  const lineText = `${canonical(line)}\n`;
  if (Buffer.byteLength(lineText) > BOUNDS.MAX_LINE_BYTES) refuse("line_refused", "the line exceeds MAX_LINE_BYTES");
  for (const [rel, text] of immutables) writeDurable(join(stateDir, "staging", rel), text, stateDir, D);
  if (st.lines.length === 0) writeDurable(join(stateDir, "keyring.json"), `${canonical({ schema: "bell-keyring-v1", keys: [st.genesis] })}\n`, stateDir, D);
  const fd = D.openSync(join(stateDir, "timeline.jsonl"), "a");
  try { D.writeSync(fd, lineText); D.fsyncSync(fd); } finally { D.closeSync(fd); }
  D.fsyncDir(stateDir);
  serve(stateDir, st.privText + lineText, keyring, D, immutables.map(([rel]) => [join(stateDir, "staging", rel), join(stateDir, "public", rel)]));
  return { ...st, lines, keyring, privText: st.privText + lineText };
}
const lineHead = (st, kind, t, keyId) => ({ schema: DOJO_TIMELINE_SCHEMA, seq: st.lines.length + 1, kind, key_id: keyId,
  prev_line_hash: st.lines.length === 0 ? GENESIS : lineHash(st.lines[st.lines.length - 1]), published_at: new Date(t).toISOString() });
const result = (status, l) => ({ status, seq: l.seq, published_at: l.published_at, key_id: l.new_key_id ?? l.key_id, line_hash: lineHash(l) });

/** --anchor (ADR-DOJO-PR-3 D-1, D-4; mere D-8): one anchor line from a request holding exactly the anchor's fields; its form and its
 *  read_rule are those the walker accepts. The first anchor opens the timeline and makes the loaded key its genesis key. */
export function publishAnchor({ stateDir, key, request, clock, fs: D = DURABLE_FS }) {
  const t = clock(), st = openState(stateDir, BOUNDS, D, key);
  const r = request !== null && typeof request === "object" && !Array.isArray(request) ? request : {};
  if (Object.keys(r).length !== ANCHOR_KEYS.length || !ANCHOR_KEYS.every((k) => Object.hasOwn(r, k))) refuse("anchor_malformed", "closed keys");
  const bad = ACCOUNTS.find((k) => { try { ownerClass(r[k]); return false; } catch { return true; } });
  if (bad !== undefined) refuse("anchor_malformed", `${bad}: not a 32-byte base58 address`);
  if (canonical(r.read_rule) !== canonical(READ_RULE)) refuse("anchor_malformed", "read_rule"); // D-C2: the collector's READ_RULE only (TB-17)
  // C-G2-5: the request of the anchor committed last (replayed after a stop past its commit; its signer is the loaded key, openState) writes nothing
  const last = st.lines[st.lines.length - 1];
  if (last?.kind === "anchor" && canonical(Object.fromEntries(ANCHOR_KEYS.map((k) => [k, last[k]]))) === canonical(r)) return result("anchored", last);
  if (pending(st, t, key) !== null) refuse("price_version_pending", "a price_version is due: --inbox completes it first (D-C3, TB-16)");
  const days = st.lines.flatMap((l) => (l.kind === "snapshot" ? [epochOf(l.day)] : l.kind === "history" ? [epochOf(l.history_last_day)] : []));
  if (Math.floor(t / DAY_MS) <= Math.max(...days)) refuse("anchor_on_published_day", "a new anchor comes after the last published day"); // DOJO-WALK-GAPS-1 (c)
  const line = { ...r, ...lineHead(st, "anchor", t, keyIdOf(key)) };
  line.sig = signLine(line, key);
  commitLine(stateDir, { ...st, genesis: st.genesis ?? keyringOf(key, 1).keys[0] }, line, D);
  return result("anchored", line);
}

/** One immutable of the served tree, checked against the sha256 its signed line names (fail-closed), as parsed lines. */
function immutable(stateDir, dir, h) {
  const buf = readFileSync(join(stateDir, "public", dir, `${h}.jsonl`)), text = buf.toString("utf8");
  if (sha256Hex(buf) !== h) refuse("existing_timeline_corrupt", `public/${dir}/${h}.jsonl: sha256`);
  return text === "" ? [] : text.slice(0, -1).split("\n").map((s) => JSON.parse(s));
}

/** --inbox (ADR-DOJO-PR-3 D-1, D-2 TU-1c; mere T-9, D-7, D-16): the day after the last published day and the anchor's day, once over and
 *  closed, read through the layout reader of PR-2-2 (publish/SHA256SUMS, its K readings and its Eve; readDayBundle WITH its check;
 *  never evidence/), guarded before any signature (the history line first, decision 231; a day after the anchor's; the seed on the
 *  anchor's chain), then its lines computed from the history and every published day exactly as dojo-verify.mjs recomputes them, their
 *  immutable file, the snapshot line, and, at the seventh consecutive valid day, the price_version line. PR-3a-1c: the snapshot and its
 *  price_version are verified TOGETHER by the reader's verifier before the first append (D-C1, VAE); a price_version due after the last
 *  snapshot and absent is completed first, the launch's only action (D-C3). */
export async function publishDay({ inboxDir, stateDir, key, clock, fs: D = DURABLE_FS }) {
  const t = clock(), st = openState(stateDir, BOUNDS, D, key), L = st.lines, hist = L.find((l) => l.kind === "history");
  if (hist === undefined) refuse("history_missing", "the first snapshot waits for the history line (decision 231)");
  const due = pending(st, t, key); // D-C3 (DOJO-PUBLISH-PV-ATOMIC-1): the reprise that completes, before any new day
  if (due !== null) return complete(stateDir, st, due, D);
  const ai = L.findLastIndex((l) => l.kind === "anchor"), A = L[ai], anchorDay = Math.floor(Date.parse(A.published_at) / DAY_MS);
  const snaps = L.filter((l) => l.kind === "snapshot"), last = snaps[snaps.length - 1], chain = L.slice(ai).filter((l) => l.kind === "snapshot").pop();
  const d = Math.max(anchorDay, epochOf(hist.history_last_day), last === undefined ? -Infinity : epochOf(last.day)) + 1, day = dateOf(d);
  const dir = join(inboxDir, day);
  if (t < (d + 1) * DAY_MS || !existsSync(join(dir, "publish", "SHA256SUMS"))) return { status: "nothing_to_publish", day }; // M-12; open day
  let b;
  try { b = readDayLayout(dir).bundle; } catch (e) { if (PASSED.includes(e?.code)) refuse(e.code, `${day}: ${e.detail}`); throw e; }
  if (epochOf(b.day) <= anchorDay) refuse("day_not_after_anchor", `${day}/publish/day.json: day`); // M-E8
  if (b.day !== day) refuse("bundle_day_mismatch", `${day}/publish/day.json: day`);
  if (b.mint !== A.mint || b.program !== A.program || b.k_reads !== A.k_reads) refuse("bundle_anchor_mismatch", `${day}: mint, program or k_reads`);
  const seedDay = chain === undefined ? anchorDay : epochOf(chain.day), prior = chain === undefined ? A.seed_anchor : chain.seed;
  if (d - anchorDay > A.horizon || seedAnchor(b.seed, d - seedDay) !== prior) refuse("seed_outside_anchor_chain", `${day}: seed`); // M-E6
  // The series of every address from day 1 (the history's first day): its history lines, then each published day's lines (D-16).
  const day1 = epochOf(hist.history_first_day), n = d - day1 + 1, series = new Map(), K = A.k_reads, W = A.validation_days;
  const put = (a, k, x) => { const s = series.get(a) ?? []; while (s.length < k - 1) s.push(null); s[k - 1] = x; series.set(a, s); };
  for (const o of immutable(stateDir, "history", hist.history_sha256)) put(o.address, epochOf(o.day) - day1 + 1, o.day_value);
  for (const s of snaps) for (const o of immutable(stateDir, "lines", s.lines_sha256)) put(o.address, epochOf(s.day) - day1 + 1, o.day_value);
  const v = L.filter((l) => l.kind === "price_version" && epochOf(l.effective_day) <= d).pop() ?? null; // the version in force at d
  const T = v === null ? null : v.threshold_unit, dust = v === null ? null : v.dust_threshold, rows = new Map((b.addresses ?? []).map((x) => [x.address, x]));
  const holds = (a) => ownerClass(a) === "holder" && lotsOf(series.get(a) ?? []).length > 0; // the eve's pile (D-7: its line is due)
  const piled = [...series.keys()].filter(holds);
  if (b.addresses !== null && piled.some((a) => !rows.has(a))) refuse("eve_mismatch", `${day}: an address holding lots is not in the bundle`);
  const lines = [...new Set([...rows.keys(), ...piled])].sort((x, y) => Buffer.compare(Buffer.from(x), Buffer.from(y))).flatMap((a) => {
    const reads = rows.get(a)?.reads ?? Array.from({ length: K }, () => null), c = ownerClass(a), m = dayValue(reads.map((r) => [r]));
    const s = [...(series.get(a) ?? [])];
    while (s.length < n - 1) s.push(null);
    s.push(m);
    if (!reads.some((r) => r !== null && r !== "0") && !holds(a)) return []; // D-7: a positive reading or a pile the eve
    return [c === "program" ? { address: a, class: c, reads, day_value: m, lots: [], score: "0", validated: "0", provisional: "0",
      units: T === null ? null : "0", tier: T === null ? null : 0, holder_counted: T === null ? null : false }
      : { address: a, class: c, reads, day_value: m, lots: lotsOf(s), score: scoreOf(s), validated: validatedOf(s, W), provisional: provisionalOf(s, W),
        units: unitsOf(s, W, T), tier: tierOf(s, T, A.tier_units, A.tier_windows), holder_counted: holderCounted("holder", s, dust) }];
  });
  const text = lines.map((l) => `${canonical(l)}\n`).join(""), h = sha256Hex(text), sum = (k) => String(lines.reduce((x, l) => x + BigInt(l[k]), 0n));
  const snap = { ...lineHead(st, "snapshot", t, keyIdOf(key)), day, seed: b.seed, beacon: b.beacon, reads: b.reads, mint: b.mint,
    decimals: b.decimals, price_version: v === null ? null : v.price_version, lines_sha256: h, lines_count: lines.length,
    root: rootOf(lines.map((l) => canonical(l))), score_total: sum("score"), validated_total: sum("validated"),
    holders_count: v === null ? null : lines.filter((l) => l.holder_counted === true).length, status: b.status };
  snap.sig = signLine(snap, key);
  const pv = versionAfter({ ...st, lines: [...L, snap] }, A, t, key), imm = [[`lines/${h}.jsonl`, text]];
  await checked(stateDir, st, [snap, ...(pv === null ? [] : [pv])], imm); // D-C1: both candidates verified before the first append
  const after = commitLine(stateDir, st, snap, D, imm);
  if (pv !== null) commitLine(stateDir, after, pv, D);
  return { ...result("published", snap), day, lines_sha256: h, lines_count: lines.length, price_version: pv === null ? null : pv.price_version };
}

/** The price_version after the snapshot of day d (mere D-3 "Versions", D-17; TU-11): the price_window_days consecutive days ending at d, each
 *  a counted snapshot with a pool price and a SOL rate (the smallest non-null reads, as dojo-verify.mjs recomputes them), starting after the
 *  window of the version before (one version per window, never two over the same day); in force from d + 1. Else null. The window is on
 *  read days only: a snapshot is always after the history's last day and the anchor's day (walker, DOJO-WALK-GAPS-1 (a)). */
function versionAfter(st, A, t, key) {
  const snaps = new Map(st.lines.filter((l) => l.kind === "snapshot").map((l) => [l.day, l])), P = A.price_window_days;
  const prev = st.lines.filter((l) => l.kind === "price_version").pop(), d = epochOf([...snaps.keys()].pop()), first = d - P + 1;
  const win = Array.from({ length: P }, (_, k) => snaps.get(dateOf(first + k)));
  const daily = (f) => win.map((l) => (l === undefined || l.status !== "counted" ? null : dayMinimum(l.reads.map((r) => r[f]))));
  const pi = daily("pool_price"), sigma = daily("usd_per_sol");
  if ([...pi, ...sigma].some((x) => x === null) || (prev !== undefined && first < epochOf(prev.window_first_day) + P)) return null; // M-E7
  const p = unitPrice(pi, sigma), line = { ...lineHead(st, "price_version", t, keyIdOf(key)), price_version: (prev?.price_version ?? 0) + 1,
    effective_day: dateOf(d + 1), window_first_day: dateOf(first), pool_price_daily: pi, usd_per_sol_daily: sigma, unit_price_microusd: p,
    threshold_unit: unitThreshold(A.objective_unit_microusd_days, p), dust_threshold: unitThreshold(A.dust_threshold_microusd, p) };
  line.sig = signLine(line, key);
  return line;
}
/** The price_version due after the last snapshot and absent (D-C3), else null. None before a first snapshot, read before any anchor (the
 *  first anchor and the first --inbox: versionAfter throws on a timeline without snapshot, PC-3); none when an anchor follows the last
 *  snapshot (the segment guard, C-V-1 (a): a new segment owes nothing, TB-16); else versionAfter under the last anchor. */
function pending(st, t, key) {
  const L = st.lines, s = L.findLastIndex((l) => l.kind === "snapshot");
  if (s < 0) return null; // M-E19
  if (L.slice(s).some((l) => l.kind === "anchor")) return null; // M-E20
  return versionAfter(st, L.findLast((l) => l.kind === "anchor"), t, key);
}
/** VAE (D-C1, DOJO-PUBLISH-VERIFY-BEFORE-COMMIT-1): the REAL verifier of dojo-verify.mjs, self_consistent_only, over the served tree plus
 *  the candidates (in memory: the committed timeline then the candidate lines, the derived dojo/pubkey.json, the candidates' immutables);
 *  refused: line_refused, its detail the verifier's seq, reason and sub-check, and nothing written. */
async function checked(stateDir, st, cand, files) {
  const text = st.privText + cand.map((l) => `${canonical(l)}\n`).join(""), disk = dirSource(join(stateDir, "public"));
  const mem = new Map([...files, ["timeline.jsonl", text], ["dojo/pubkey.json", `${canonical(dojoKeyring(st.keyring))}\n`]]);
  const v = await verifyDojoServed({ source: { get: (rel) => (mem.has(rel) ? Promise.resolve(Buffer.from(mem.get(rel))) : disk.get(rel)) } });
  if (!v.ok) refuse("line_refused", `seq ${v.seq}: ${v.reason} (${v.detail})`);
}
/** D-C3 (DOJO-PUBLISH-PV-ATOMIC-1), the reprise that completes: the price_version due, recomputed over the committed snapshots (the window
 *  and the effect of a launch without a stop; only its published_at is later, which the walker admits), verified, committed and named on
 *  stderr (as repaired_torn_tail); the launch's only action. */
async function complete(stateDir, st, pv, D) {
  await checked(stateDir, st, [pv], []);
  commitLine(stateDir, st, pv, D);
  process.stderr.write("dojo/publish: completed_price_version\n");
  return { ...result("completed", pv), price_version: pv.price_version };
}

/** --rotate (calque of bell-publish.mjs rotateKey; Q-11 of the mere D-8 settled by ADR-DOJO-PR-3 D-5): one key_rotation line,
 *  cross-signed (sig by the active key, sig_new by the new key, same bytes); key LOST (oldKey null): continuity "broken", signed by the
 *  new key alone. The new key signs every later line; no key file is written. */
export function rotateKey({ stateDir, oldKey = null, newKey, clock, fs: D = DURABLE_FS }) {
  const t = clock(), st = openState(stateDir, BOUNDS, D, oldKey);
  if (st.lines.length === 0) refuse("no_timeline", "a rotation needs a committed timeline (the first key comes with the first anchor)");
  const nk = keyringOf(newKey, 1).keys[0];
  if (st.keyring.keys.some((k) => k.key_id === nk.key_id)) refuse("key_already_in_keyring", "the new key is already in the state keyring");
  const line = { ...lineHead(st, "key_rotation", t, oldKey === null ? nk.key_id : activeKeyId(st.keyring)), new_key: nk.jwk,
    new_key_id: nk.key_id, ...(oldKey === null ? { continuity: "broken" } : {}) };
  line.sig_new = signLine(line, newKey); // the signed bytes exclude sig and sig_new: both keys sign the same line
  line.sig = signLine(line, oldKey ?? newKey);
  commitLine(stateDir, st, line, D);
  return result("rotated", line);
}
/** --revoke (calque of bell-publish.mjs revokeKey): one key_revocation line signed by the ACTIVE key; for a reader, every line signed by
 *  the revoked key at a seq >= revokedFromSeq is void. Only a former key (rotated away or lost) can be revoked. */
export function revokeKey({ stateDir, key, revokedKeyId, revokedFromSeq, clock, fs: D = DURABLE_FS }) {
  const t = clock(), st = openState(stateDir, BOUNDS, D, key);
  if (st.lines.length === 0) refuse("no_timeline", "a revocation needs a committed timeline");
  const k = st.keyring.keys.find((x) => x.key_id === revokedKeyId);
  if (k === undefined || k.status === "active" || !Number.isInteger(revokedFromSeq) || revokedFromSeq < 1 || revokedFromSeq > st.lines.length + 1) {
    refuse("revocation_invalid", "a former key of the state keyring and 1 <= from-seq <= the revocation's seq");
  }
  if (st.lines.some((l) => l.key_id === revokedKeyId && l.seq >= revokedFromSeq)) refuse("revocation_invalid", "from-seq voids a committed line of that key");
  const line = { ...lineHead(st, "key_revocation", t, activeKeyId(st.keyring)), revoked_key_id: revokedKeyId, revoked_from_seq: revokedFromSeq };
  line.sig = signLine(line, key);
  commitLine(stateDir, st, line, D);
  return result("revoked", line);
}
/** --generate-key (calque of bell-publish.mjs generateKey): a NEW Ed25519 key as PKCS#8 PEM, created 0600 and never over an existing
 *  file (flag "wx"), durable. Returns the PUBLIC part only, as a dojo-keyring-v1 entry names it: {key_id, public_key}. */
export function generateKey(path, D = DURABLE_FS) {
  const { privateKey } = generateKeyPairSync("ed25519");
  let fd;
  try { fd = openSync(path, "wx", 0o600); } catch (e) { if (e?.code === "EEXIST") refuse("key_file_exists", "refusing to overwrite a key file"); throw e; }
  try { D.writeSync(fd, privateKey.export({ type: "pkcs8", format: "pem" })); D.fsyncSync(fd); } finally { D.closeSync(fd); }
  D.fsyncDir(dirname(path));
  const { key_id, jwk } = keyringOf(privateKey, 1).keys[0];
  return { key_id, public_key: jwk };
}

function readRequest(path) {
  if (!existsSync(path) || statSync(path).size > BOUNDS.MAX_LINE_BYTES) refuse("anchor_malformed", "the request file is absent or too large");
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return refuse("anchor_malformed", "the request is not JSON"); }
}
/** --from-seq: a positive decimal integer, no sign, no leading zero (Q-G2-5: Number() also reads 0x3, 3.0, 3e0, +3, 0b11, 0o3). */
const fromSeq = (s) => (/^[1-9][0-9]*$/.test(s) ? Number(s) : refuse("revocation_invalid", "--from-seq is not a plain positive decimal integer"));

/** The history line's own fields (mere D-18; declared duplicate of FIELDS.history of dojo-verify.mjs), taken from the manifest. */
const HISTORY_LINE = ["history_first_day", "history_last_day", "history_sha256", "history_lines_count", "history_root"];
/** The manifest's CLOSED keys (ADR-DOJO-PR-2B D-12): a declared duplicate of the literal of historyBundle (history-build.ts), pinned by the
 *  end-to-end test that runs that real writer (dojo_history_publish_to_verify_end_to_end). */
const MANIFEST = ["schema", "status", "mint", "program", "decimals", "history_first_day", "history_last_day", "sig0", "sig0_slot", "window_slot_max",
  "first_read_day", "enumeration_slots", "history_sha256", "history_lines_count", "history_root", "transactions_admitted", "transactions_failed_excluded",
  "transactions_without_quorum", "token_accounts", "addresses", "missing_address_days", "supply_check", "enumeration_check", "chain_check",
  "collector_sha256", "evidence_sha256sums_sha256"];
/** The history packet of PR-2b, read WITH its check (ADR-DOJO-PR-2B D-12 l.474 and its dated line of 11:53Z; M-E12): publish/SHA256SUMS,
 *  its single entry, names exactly eve.json, history/<sha256>.jsonl and manifest.json (relative to publish/, in byte order), and each file
 *  is checked against its sha256, as bytes; then the manifest: canonical, its closed keys, complete, its three checks passed, naming the
 *  file. Nothing else is read (never evidence/); the file's lines are the verifier's (count, sha256, forms, order, root: the VAE). */
function readHistory(dir) {
  const pub = join(dir, "publish"), bad = (why) => refuse("history_bundle_malformed", why);
  const get = (p) => (existsSync(join(pub, ...p.split("/"))) ? readFileSync(join(pub, ...p.split("/"))) : bad(`publish/${p} is missing`));
  const sums = get("SHA256SUMS").toString("utf8");
  const rows = sums.split("\n").slice(0, -1).map((l) => /^([0-9a-f]{64}) {2}(eve\.json|history\/[0-9a-f]{64}\.jsonl|manifest\.json)$/.exec(l)
    ?? bad("publish/SHA256SUMS line"));
  const paths = rows.map((r) => r[2]), [ep, hp, mp] = paths;
  if (!sums.endsWith("\n") || paths.map((p) => p.split("/")[0]).join(" ") !== "eve.json history manifest.json") bad("publish/SHA256SUMS paths");
  const body = new Map(rows.map(([, , p]) => [p, get(p)]));
  for (const [, hex, p] of rows) if (sha256Hex(body.get(p)) !== hex) refuse("history_bundle_mismatch", `publish/${p}: sha256`); // the check (M-E12)
  const text = (p) => body.get(p).toString("utf8");
  let m = null;
  try { m = JSON.parse(text(mp)); if (`${canonical(m)}\n` !== text(mp)) m = null; } catch { m = null; }
  if (m?.schema !== "dojo-history-bundle-v1" || Object.keys(m).length !== MANIFEST.length || !MANIFEST.every((k) => Object.hasOwn(m, k))
    || m.status !== "complete" || [m.supply_check, m.enumeration_check, m.chain_check].some((c) => c !== "pass")
    || hp !== `history/${m.history_sha256}.jsonl`) bad("publish/manifest.json");
  return { m, text: text(hp), eve: text(ep) };
}
/** --history <packet> (PR-3a-2; ADR-DOJO-PR-3 D-1 row PR-3a-2, TU-12c; mere D-18, decision 231): the history packet of PR-2b, read with
 *  its check, under the anchor in force (its mint and program: the line carries neither), before every snapshot and once per timeline;
 *  its line and its file verified TOGETHER by the reader's verifier before any append (PC-7: the same VAE, asynchronous from its birth),
 *  the Eve of the first day read checked against the file's last day, then the file durable before the line (M-E4, commitLine). */
export async function publishHistory({ historyDir, stateDir, key, clock, fs: D = DURABLE_FS }) {
  const t = clock(), st = openState(stateDir, BOUNDS, D, key), A = st.lines.findLast((l) => l.kind === "anchor");
  if (A === undefined) refuse("no_timeline", "the history line follows an anchor");
  if (st.lines.some((l) => l.kind === "snapshot")) refuse("history_after_snapshot", "a snapshot is published: the history precedes it (decision 231)");
  if (st.lines.some((l) => l.kind === "history")) refuse("history_exists", "one history line per timeline");
  const { m, text, eve } = readHistory(historyDir), imm = [[`history/${m.history_sha256}.jsonl`, text]];
  if (m.mint !== A.mint || m.program !== A.program) refuse("bundle_anchor_mismatch", "history publish/manifest.json: mint or program");
  const line = { ...lineHead(st, "history", t, keyIdOf(key)), ...Object.fromEntries(HISTORY_LINE.map((k) => [k, m[k]])) };
  line.sig = signLine(line, key);
  await checked(stateDir, st, [line], imm); // the line and its file verified together, before any append (PC-7)
  const last = text.split("\n").slice(0, -1).map((s) => JSON.parse(s)).filter((o) => o.day === m.history_last_day); // verified lines, LF-ended
  if (eve !== `${canonical({ addresses: last.map((o) => o.address), accounts: [] })}\n`) refuse("history_bundle_mismatch", "publish/eve.json: addresses");
  commitLine(stateDir, st, line, D, imm);
  return { ...result("published", line), history_last_day: line.history_last_day, history_sha256: line.history_sha256,
    history_lines_count: line.history_lines_count };
}

const USAGE = "dojo/publish: usage: --inbox <bundles> --state <dir> | --anchor <request> --state <dir> | --generate-key <file>"
  + " | --rotate [--broken] --state <dir> | --revoke <key_id> --from-seq <n> --state <dir> | --history <packet> --state <dir>\n";
const MODES = { "--inbox": ["--state"], "--history": ["--state"], "--anchor": ["--state"], "--generate-key": [], "--rotate": ["--state", "--broken"],
  "--revoke": ["--from-seq", "--state"] };
const VALUED = ["--inbox", "--history", "--anchor", "--state", "--generate-key", "--revoke", "--from-seq"];

/** CLI (calque of bell-publish.mjs runCli, argv closed): exit 0 with one JSON line on stdout, or exit 1 with `dojo/publish: <code>:
 *  <detail>` (or the usage) on stderr. */
export async function runCli(argv) {
  const opt = new Map();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], v = argv[i + 1], valued = VALUED.includes(a);
    if (opt.has(a) || (valued ? v === undefined || v.startsWith("--") : a !== "--rotate" && a !== "--broken")) { process.stderr.write(USAGE); return 1; }
    opt.set(a, valued ? argv[++i] : true);
  }
  const modes = Object.keys(MODES).filter((m) => opt.has(m)), mode = modes[0], allowed = [mode, ...(MODES[mode] ?? [])];
  if (modes.length !== 1 || [...opt.keys()].some((k) => !allowed.includes(k)) || allowed.some((k) => k !== "--broken" && !opt.has(k))) {
    process.stderr.write(USAGE);
    return 1;
  }
  try {
    if (mode === "--generate-key") { process.stdout.write(`${JSON.stringify(generateKey(opt.get(mode)))}\n`); return 0; } // reads no environment
    const credDir = process.env.CREDENTIALS_DIRECTORY; // systemd LoadCredential: the ONLY environment read of this module
    if (typeof credDir !== "string" || !isAbsolute(credDir)) refuse("signing_key_missing", "$CREDENTIALS_DIRECTORY is not an absolute path");
    const load = (name) => {
      let k;
      try { k = createPrivateKey(readFileSync(join(credDir, name))); } catch { refuse("signing_key_missing", `$CREDENTIALS_DIRECTORY/${name} unreadable`); }
      if (k.asymmetricKeyType !== "ed25519") refuse("signing_key_missing", `${name} is not an Ed25519 private key`);
      return k;
    };
    const stateDir = opt.get("--state"), clock = () => Date.now();
    const r = mode === "--inbox" ? await publishDay({ inboxDir: opt.get(mode), stateDir, key: load(KEY), clock })
      : mode === "--history" ? await publishHistory({ historyDir: opt.get(mode), stateDir, key: load(KEY), clock })
      : mode === "--anchor" ? publishAnchor({ stateDir, key: load(KEY), request: readRequest(opt.get(mode)), clock })
      : mode === "--rotate" ? rotateKey({ stateDir, oldKey: opt.has("--broken") ? null : load(KEY), newKey: load(`${KEY}-new`), clock })
        : revokeKey({ stateDir, key: load(KEY), revokedKeyId: opt.get(mode), revokedFromSeq: fromSeq(opt.get("--from-seq")), clock });
    process.stdout.write(`${JSON.stringify(r)}\n`);
    return 0;
  } catch (e) {
    process.stderr.write(`dojo/publish: ${e instanceof DojoPublishError ? `${e.code}: ${e.detail}` : `fatal: ${String(e?.code ?? e?.name ?? "error")}`}\n`);
    return 1;
  }
}

// ENTRY-MAIN-LINK-1 (C-G2-1 of PR-1b-5b): REAL paths compared, so a launch through a directory link runs it; argv[1] absent or unreadable: an import.
const isEntry = () => { try { return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]); } catch { return false; } };
if (isEntry()) process.exitCode = await runCli(process.argv.slice(2));
