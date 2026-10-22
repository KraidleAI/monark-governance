// MONARK Bell -- T-1b publisher (ADR-T1b-backend v2 D4-D9; G0 BELL-COLLECT-TIMER-1 DC-3). Turns pending bundles of real runMain runs into
// signed, chained, durably written publications, and refuses by name everything else (BellPublishError / exit 1, state directory untouched).
// It computes NO fact: its own fields are seq, published_at, hashes, key_id and signatures. Node built-ins + bell-chain.mjs and bell-validate.mjs
// only (the validation of a run and of a bundle, whose bindings this module re-exports). Layout of --state: timeline.jsonl (private, source of
// truth, commit point), keyring.json (private state keyring), staging/, archive/<seq>-<bundle>/ (--inbox), public/ (served by Caddy: state.json,
// provenance.json, timeline.jsonl, bell/pubkey.json, states/<sha>.json, provenance/<sha>.json). CLI, two publication modes: the systemd oneshot's
// --handoff <dir> --status <dir> --state <dir> (deploy/monark-bell-publish.service: up to HANDOFF_N bundles the tick deposited, section --handoff
// below; --handoff-start <D> --handoff <dir> --status <dir> poses its start mark), and --inbox <dir> --state <dir> (ADR D10, lot a: ONE bundle);
// the private key is read ONLY from $CREDENTIALS_DIRECTORY/bell-signing-key (systemd LoadCredential, PKCS#8 PEM). S-6 operator modes (ADR D9): --generate-key <new file> (prints the public part only); --rotate --state <dir> [--broken]
// (old key bell-signing-key, new key bell-signing-key-new, both from $CREDENTIALS_DIRECTORY; --broken = old key lost);
// --revoke <key_id> --from-seq <n> --state <dir> (signed by the active key bell-signing-key); the rotation in two steps, one key or none per run (--rotate-draft, --rotate-cosign, --rotate-commit) and --unlock --state <dir>, below.
import { openSync, readSync, writeSync, fsyncSync, closeSync, renameSync, mkdirSync, existsSync, readFileSync, readdirSync, linkSync, unlinkSync } from "node:fs";
import { join, dirname, basename, isAbsolute } from "node:path";
import { createPrivateKey, generateKeyPairSync } from "node:crypto";
import { pathToFileURL } from "node:url";
import { GENESIS, canonical, sha256Hex, lineHash, signLine, keyIdOf, keyringOf, trustOf, walkTimeline, deriveKeyring, verifyLine, publicKeyOfJwk } from "./bell-chain.mjs";
import { BOUNDS, BellPublishError, validateBundle, UNIT_NAME, manifestOf } from "./bell-validate.mjs";
export { REFUSAL_CODES, BellPublishError, BOUNDS, WHITELIST, NOT_SERVED, KEY_SHAPES } from "./bell-validate.mjs";

const refuse = (code, detail) => { throw new BellPublishError(code, detail); };

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
  // S-6: keyring.json holds the GENESIS key (written before the first commit); the rest is DERIVED from the timeline (rotations,
  // revocations), so a crash between a key line's commit and the keyring write is repaired by re-derivation (openState).
  const krPath = join(stateDir, "keyring.json");
  let keyring = null, genesis = null, krText = null;
  if (existsSync(krPath)) {
    krText = readFileSync(krPath, "utf8");
    try { const kr = JSON.parse(krText), g = kr?.keys?.[0]; if (kr.schema === "bell-keyring-v1" && g?.valid_from_seq === 1 && trustOf({ schema: kr.schema, keys: [g] }) !== null) genesis = g; } catch { genesis = null; }
    if (genesis === null) corrupt("keyring.json has no valid genesis key");
    try { keyring = deriveKeyring(genesis, lines); } catch { corrupt("the key lines of the private timeline do not derive a keyring"); }
  } else if (lines.length > 0) corrupt("keyring.json missing");
  if (lines.length > 0) { // the SAME walk as bell-verify.mjs, under the derived keyring: schema, seq, chain, signatures, key schedule
    const w = walkTimeline(lines, trustOf(keyring) ?? corrupt("the key lines of the private timeline derive a malformed keyring")); // C-9 (b): named, never a TypeError
    if (!w.ok) corrupt(`private line ${w.seq}: ${w.reason}`);
    if (lines[0].key_id !== genesis.key_id) corrupt("private line 1: not signed by the genesis key of keyring.json");
  }
  const pub = readLines(join(stateDir, "public", "timeline.jsonl"), B.MAX_LINE_BYTES, corrupt);
  if (pub.tail !== "" || pub.texts.length > texts.length || pub.texts.some((s, i) => s !== texts[i])) corrupt("public/timeline.jsonl is not a prefix of the private timeline");
  const moves = []; // the immutables of every committed publication: in public/, else still in staging/ (moved at repair), else corrupt
  for (const l of lines.filter((x) => x.kind === "publication")) for (const [d, h] of [["states", l.state_sha256], ["provenance", l.provenance_sha256]]) {
    const dst = join(stateDir, "public", d, `${h}.json`), src = join(stateDir, "staging", d, `${h}.json`);
    if (existsSync(dst)) continue;
    if (!existsSync(src) || sha256Hex(readFileSync(src)) !== h) corrupt(`immutable ${d}/${h}.json missing`);
    moves.push([src, dst]);
  }
  return { lines, texts, torn, keyring, genesis, krText, moves };
}
const activeKeyId = (keyring) => keyring.keys.find((k) => k.status === "active").key_id;
const lastPublication = (lines) => lines.filter((l) => l.kind === "publication").pop();

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
  const pub = join(stateDir, "public"), last = lastPublication(lines); // a key line changes no current state/provenance
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

/** Start-up of every mode: the integrity check (read-only), then the idempotent repairs of the COMMITTED state (torn private
 *  tail, derived keyring.json, public/). A loaded key that is not the active key refuses BEFORE any repair (nothing written). */
function openState(stateDir, B, D, key) {
  const st = inspect(stateDir, B);
  if (key !== null && st.keyring !== null && activeKeyId(st.keyring) !== keyIdOf(key)) refuse("signing_key_not_in_keyring", "the loaded key is not the active key of the state keyring");
  const privText = st.texts.map((s) => s + "\n").join("");
  if (st.torn) { writeDurable(join(stateDir, "timeline.jsonl"), privText, stateDir, D); process.stderr.write("bell/publish: repaired_torn_tail\n"); }
  if (st.keyring !== null && st.lines.length > 0 && st.krText !== canonical(st.keyring) + "\n") {
    writeDurable(join(stateDir, "keyring.json"), canonical(st.keyring) + "\n", stateDir, D); process.stderr.write("bell/publish: rederived_keyring\n");
  }
  if (st.lines.length > 0 && serve(stateDir, st.lines, st.moves, privText, st.keyring, D)) process.stderr.write("bell/publish: rederived_public\n");
  return { ...st, privText };
}
/** Steps 3-6 for ONE new line: the durable append of the private timeline (the COMMIT POINT), keyring.json re-derived (a key
 *  line changes it; a publication does not), then public/ (immutables `moves`, timeline, current files, bell/pubkey.json). */
function commitLine(stateDir, st, genesis, line, moves, D) {
  const lineText = canonical(line) + "\n", fd = D.openSync(join(stateDir, "timeline.jsonl"), "a");
  try { D.writeSync(fd, lineText); D.fsyncSync(fd); } finally { D.closeSync(fd); }
  D.fsyncDir(stateDir);
  const lines = [...st.lines, line], keyring = deriveKeyring(genesis, lines), krText = canonical(keyring) + "\n";
  if (readFileSync(join(stateDir, "keyring.json"), "utf8") !== krText) writeDurable(join(stateDir, "keyring.json"), krText, stateDir, D);
  serve(stateDir, lines, moves, st.privText + lineText, keyring, D);
}
const lineHead = (st, kind, t) => ({ schema: "bell-timeline-v1", seq: st.lines.length + 1, kind, published_at: new Date(t).toISOString(),
  prev_line_hash: lineHash(st.lines[st.lines.length - 1]) });
const keyLineResult = (status, l) => ({ status, seq: l.seq, published_at: l.published_at, key_id: l.new_key_id ?? l.key_id, line_hash: lineHash(l) });

/** The line path of ONE bundle, shared by --inbox and --handoff: the start-up check and repairs (openState), `locate()` names the
 *  bundle, validateBundle, C-in-9 and BELL-REPUBLISH-1 (a bundle whose runs are all published is "nothing_to_publish"), then
 *  `guard(fresh, lines)` (the --handoff overlap check; absent in --inbox), then the immutables and the commit. It never moves the
 *  bundle (the archive is publishToDir's). Returns the status, the line (the new one, or the last publication), the bundle, its runs. */
function publishOne({ stateDir, privateKey, t, B, D, locate, guard }) {
  const published_at = new Date(t).toISOString();
  const st = openState(stateDir, B, D, privateKey), keyId = keyIdOf(privateKey);
  const keyring = st.keyring ?? keyringOf(privateKey, 1), genesis = st.genesis ?? keyring.keys[0];
  const { bundle, bdir } = locate();
  const runs = validateBundle(bdir, B, t); // C-in-1, C-in-10 (bell-validate.mjs)
  const done = (status, line) => ({ status, line, bundle, bdir, lines: st.lines, runs: [...runs] });
  const last = lastPublication(st.lines), tail = st.lines[st.lines.length - 1]; // C-in-9 compares runs: the last PUBLICATION line
  if (last !== undefined && canonical(last.runs.map((r) => r.bell_sha)) === canonical(runs.map((r) => r.bellSha))) return done("nothing_to_publish", last); // C-in-9
  // BELL-REPUBLISH-1 (G2 PR-1 O-1, ADR D4 C-in-10 "never a run published twice"): a run already cited by a COMMITTED publication
  // line is never published again; only the new runs of the bundle are (journaled); none new => nothing to publish.
  const published = new Set(st.lines.filter((l) => l.kind === "publication").flatMap((l) => l.runs.map((r) => r.bell_sha)));
  const fresh = runs.filter((r) => !published.has(r.bellSha));
  if (fresh.length === 0) return done("nothing_to_publish", last);
  if (fresh.length < runs.length) process.stderr.write(`bell/publish: skipped_already_published ${String(runs.length - fresh.length)}\n`);
  guard?.(fresh, st.lines);
  runs.splice(0, runs.length, ...fresh);
  const seq = st.lines.length + 1;
  const envelope = (schema, key) => canonical({ schema, seq, published_at, runs: runs.map((r) => r[key]) }) + "\n";
  const stateText = envelope("bell-public-state-v1", "state"), provText = envelope("bell-public-provenance-v1", "projection");
  if (Buffer.byteLength(stateText) > B.MAX_PUBLIC_STATE_BYTES) refuse("public_state_too_large", "public/state.json");
  const line = { schema: "bell-timeline-v1", seq, kind: "publication", published_at, prev_line_hash: tail === undefined ? GENESIS : lineHash(tail), key_id: keyId,
    state_sha256: sha256Hex(stateText), provenance_sha256: sha256Hex(provText), runs: runs.map((r) => ({ bell_sha: r.bellSha, window: r.state.window, records: r.records })) };
  line.sig = signLine(line, privateKey);
  const lineText = canonical(line) + "\n";
  if (Buffer.byteLength(lineText) > B.MAX_LINE_BYTES) refuse("line_too_large", "the timeline line");
  const stg = (d, h) => join(stateDir, "staging", d, `${h}.json`);
  writeDurable(stg("states", line.state_sha256), stateText, stateDir, D); // step 2: the immutables, durable, NOT served
  writeDurable(stg("provenance", line.provenance_sha256), provText, stateDir, D);
  if (st.keyring === null) writeDurable(join(stateDir, "keyring.json"), canonical(keyring) + "\n", stateDir, D); // step 3: first run
  commitLine(stateDir, st, genesis, line, [[stg("states", line.state_sha256), join(stateDir, "public", "states", `${line.state_sha256}.json`)],
    [stg("provenance", line.provenance_sha256), join(stateDir, "public", "provenance", `${line.provenance_sha256}.json`)]], D); // steps 3-6
  return done("published", line);
}

/** Publish the ONE pending bundle of `inboxDir` into `stateDir` (ADR D8), or refuse by name with nothing written.
 *  Contract of ADR D12 (named parameters; the keyring derives from privateKey and the state). */
export function publishToDir({ inboxDir, stateDir, privateKey, clock, bounds = {}, fs: D = DURABLE_FS }) {
  const t = clock(); // C-3: the ONE clock read of a publication; the envelopes and the line carry the same published_at
  const B = { ...BOUNDS, ...bounds };
  const locate = () => {
    let entries = [];
    try { entries = readdirSync(inboxDir, { withFileTypes: true }); } catch { /* an absent inbox is zero bundles */ }
    if (entries.length !== 1 || !entries[0].isDirectory()) refuse("inbox_not_exactly_one_bundle", `${entries.length} inbox entries`); // C-in-1
    return { bundle: entries[0].name, bdir: join(inboxDir, entries[0].name) };
  };
  const r = publishOne({ stateDir, privateKey, t, B, D, locate });
  const dir = join(stateDir, "archive"), seq = r.line.seq; // step 7: the archive, also for nothing_to_publish (at the last publication's seq)
  ensureDir(dir, D);
  const dst = existsSync(join(dir, `${seq}-${r.bundle}`)) ? join(dir, `${seq}-${r.bundle}-dup-${t}`) : join(dir, `${seq}-${r.bundle}`);
  D.renameSync(r.bdir, dst); D.fsyncDir(dir); D.fsyncDir(inboxDir);
  const l = r.line;
  return { status: r.status, seq: l.seq, published_at: l.published_at, state_sha256: l.state_sha256, provenance_sha256: l.provenance_sha256, line_hash: lineHash(l) };
}

/** S-6 key rotation (ADR D9): one key_rotation line. Cross-signed: `oldKey` is the active key (sig) and `newKey` signs the same
 *  bytes (sig_new). Key LOST: `oldKey` null => continuity "broken", signed by `newKey` alone; a reader accepts it only if the
 *  new key is in the keyring it supplies (C-9) and reports the break. The new key signs every later line. */
export function rotateKey({ stateDir, oldKey = null, newKey, clock, fs: D = DURABLE_FS }) {
  const t = clock(), st = openState(stateDir, BOUNDS, D, oldKey);
  if (st.lines.length === 0) refuse("no_timeline", "a rotation needs a committed timeline (the first key comes with the first publication)");
  const nk = keyringOf(newKey, 1).keys[0];
  if (st.keyring.keys.some((k) => k.key_id === nk.key_id)) refuse("key_already_in_keyring", "the new key is already in the state keyring");
  const line = { ...lineHead(st, "key_rotation", t), key_id: oldKey === null ? nk.key_id : activeKeyId(st.keyring), new_key: nk.jwk, new_key_id: nk.key_id,
    ...(oldKey === null ? { continuity: "broken" } : {}) };
  line.sig_new = signLine(line, newKey); // the signed bytes exclude sig and sig_new: both keys sign the same line
  line.sig = signLine(line, oldKey ?? newKey);
  commitLine(stateDir, st, st.genesis, line, [], D);
  return keyLineResult("rotated", line);
}
/** S-6 compromise (ADR D9): one key_revocation line signed by the ACTIVE key. Every line signed by `revokedKeyId` at a seq >=
 *  `revokedFromSeq` is void for a reader. Only a former key (rotated away or lost) can be revoked. */
export function revokeKey({ stateDir, key, revokedKeyId, revokedFromSeq, clock, fs: D = DURABLE_FS }) {
  const t = clock(), st = openState(stateDir, BOUNDS, D, key);
  if (st.lines.length === 0) refuse("no_timeline", "a revocation needs a committed timeline");
  const k = st.keyring.keys.find((x) => x.key_id === revokedKeyId);
  if (k === undefined || k.status === "active" || !Number.isInteger(revokedFromSeq) || revokedFromSeq < 1 || revokedFromSeq > st.lines.length + 1)
    refuse("revocation_invalid", "a former key of the state keyring and 1 <= from-seq <= the revocation's seq");
  const line = { ...lineHead(st, "key_revocation", t), key_id: activeKeyId(st.keyring), revoked_key_id: revokedKeyId, revoked_from_seq: revokedFromSeq };
  line.sig = signLine(line, key);
  commitLine(stateDir, st, st.genesis, line, [], D);
  return keyLineResult("revoked", line);
}
/** S-6 --generate-key (ADR D9): a NEW Ed25519 key as PKCS#8 PEM, created 0600 and never over an existing file (flag "wx"),
 *  durable (fsync of the file and its directory). Returns the PUBLIC part only ({key_id, jwk}); `d` is never returned. */
export function generateKey(path, D = DURABLE_FS) {
  const { privateKey } = generateKeyPairSync("ed25519");
  let fd;
  try { fd = openSync(path, "wx", 0o600); } catch (e) { if (e?.code === "EEXIST") refuse("key_file_exists", "refusing to overwrite an existing key file"); throw e; }
  try { D.writeSync(fd, privateKey.export({ type: "pkcs8", format: "pem" })); D.fsyncSync(fd); } finally { D.closeSync(fd); }
  D.fsyncDir(dirname(path));
  const { key_id, jwk } = keyringOf(privateKey, 1).keys[0];
  return { key_id, jwk };
}

// ---- The --handoff mode (G0 BELL-COLLECT-TIMER-1 DC-3; plan of part 3, C3-1 to C3-6). The publisher publishes on its own what the
// collection tick deposits into the handoff directory, which it only reads: unit-<D>[-r<n>]/ with its sibling manifest, and the
// tombstone unit-<D>.abandoned with its manifest. The status directory holds the start mark `start`, published.jsonl and refused.jsonl
// (each rewritten whole: a synced temporary file, then a rename). One writer at a time: publish.lock in --state.
/** N, the bundles one --handoff call publishes at most (plan of part 3, C3-2). */
export const HANDOFF_N = 8;
/** The default clock probe: unsynced, so the mode is fail-closed like the tick's; the host form of the probe is item CLOCK-PROBE-FORM-1. */
const UNSYNCED = () => false;
const DAY = /^\d{4}-\d{2}-\d{2}$/, TOMBSTONE = /^unit-\d{4}-\d{2}-\d{2}\.abandoned$/;
const isDay = (d) => DAY.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
const dayOf = (name) => name.slice(5, 15);
const revOf = (name) => (name.length > 15 ? Number(name.slice(17)) : 0);
/** The refusals of a bundle (recorded in refused.jsonl); any other refusal is the call's (state, key, lock, clock, mark), never recorded. */
const BUNDLE_REFUSALS = new Set(["inbox_not_exactly_one_bundle", "too_many_runs", "input_too_large", "schema_mismatch", "unknown_field", "bell_sha_mismatch",
  "close_like_field", "session_not_yet_publishable", "run_timeline_broken", "provenance_binding_mismatch", "url_or_key_shaped_string", "duplicate_run",
  "public_state_too_large", "line_too_large", "window_overlaps_published", "manifest_mismatch"]);
const STATUS_FIELDS = { "published.jsonl": ["bundle", "manifest_sha256", "seq", "published_at"], "refused.jsonl": ["bundle", "manifest_sha256", "code", "refused_at"] };

/** The bundles of one --handoff call, PURE (no file, no clock). `names`: the entries of the handoff directory; `manifests`: name -> sha256 of
 *  its manifest (absent: no manifest; a tombstone's only when it matches; a bundle's that does not match the caller refuses, manifest_mismatch); `published`, `refused`: the entries of the two
 *  status files; `start`: the from_unit of the mark; `n`: the cap. Walks the D's at or after the mark in ascending order, skips a D
 *  published (any revision) or abandoned (a tombstone with its concordant manifest), and takes for each D the highest revision whose
 *  name and manifest sha256 are not refused; a D with no candidate stops the list: `awaiting` names it. */
export function chooseHandoff({ names, manifests, published, refused, start, n }) {
  const has = (x) => Object.hasOwn(manifests, x);
  const bundles = names.filter((x) => !x.startsWith(".tmp-") && UNIT_NAME.test(x)), stones = names.filter((x) => TOMBSTONE.test(x));
  const done = new Set(published.map((p) => dayOf(p.bundle))), dead = new Set(stones.filter(has).map(dayOf));
  const isRefused = (x) => refused.some((r) => r.bundle === x && r.manifest_sha256 === manifests[x]);
  const days = [...new Set([...bundles, ...stones].map(dayOf))].filter((d) => d >= start).sort();
  const chosen = [];
  for (const d of days) {
    if (chosen.length >= n) break;
    if (done.has(d) || dead.has(d)) continue;
    const c = bundles.filter((x) => dayOf(x) === d && has(x) && !isRefused(x)).sort((a, b) => revOf(b) - revOf(a))[0];
    if (c === undefined) return { bundles: chosen, awaiting: d };
    chosen.push({ bundle: c, manifest_sha256: manifests[c] });
  }
  return { bundles: chosen, awaiting: null };
}

/** For each bundle or tombstone at or after the mark with its sibling manifest: `manifests`, name -> sha256 of the manifest, a tombstone's when it matches
 *  (`<sha256 of the body>  <name>`, the tick's abandon), a bundle's in any case; `mismatched`, the bundles it no longer matches (manifestOf, the tick's own function; G0 DC-3 amended). */
function manifestsOf(handoffDir, entries, start) {
  const manifests = {}, mismatched = new Set();
  for (const e of entries) {
    const x = e.name, path = join(handoffDir, x), m = `${path}.manifest`;
    if (dayOf(x) < start) continue; // before the mark: never chosen, never hashed
    let text; try { text = readFileSync(m, "utf8"); } catch (err) { if (err?.code === "ENOENT") continue; throw err; } const bundle = UNIT_NAME.test(x); // no manifest: not deposited (the tick writes it first) or purged since the listing, skipped; any other errno fails the call (fatal: <errno>), never a refusal
    let ok = false;
    try { ok = bundle ? (e.isDirectory() && manifestOf(path) === text) : (TOMBSTONE.test(x) && e.isFile() && text === `${sha256Hex(readFileSync(path))}  ${x}\n`); } catch (err) {
      if (err?.code === "ENOENT") continue; if (!(err instanceof BellPublishError)) throw err; // an entry or a file purged since the listing (tick.ts:332): skipped, as at the base; manifestOf refuses an entry neither a file nor a directory: no match; an unreadable file fails the call too
    }
    if (ok || bundle) manifests[x] = sha256Hex(text); // a bundle that no longer matches keeps its sha256, so its refusal, once recorded, is matched (chooseHandoff)
    if (bundle && !ok) mismatched.add(x);
  }
  return { manifests, mismatched };
}
/** The entries of a status file (absent: none); a line that is not an object with a string bundle and manifest_sha256 is refused. */
function readStatus(statusDir, file) {
  const p = join(statusDir, file), text = existsSync(p) ? readFileSync(p, "utf8") : "";
  if (text !== "" && !text.endsWith("\n")) refuse("schema_mismatch", `status/${file}: no final newline`);
  return text.split("\n").slice(0, -1).map((s, i) => {
    let o = null;
    try { o = JSON.parse(s); } catch { o = null; }
    if (typeof o?.bundle !== "string" || typeof o?.manifest_sha256 !== "string") refuse("schema_mismatch", `status/${file} line ${i + 1}`);
    return o;
  });
}
/** One entry added to a status file, its fields in their fixed order: the whole file to a synced temporary file of the status
 *  directory, then the rename, then the fsync of the directory (through `D`, the same seam as the commit). */
function appendStatus(statusDir, file, entry, D) {
  const p = join(statusDir, file), prior = existsSync(p) ? readFileSync(p, "utf8") : "", tmp = join(statusDir, `.tmp-${file}`);
  const fd = D.openSync(tmp, "w");
  try { D.writeSync(fd, prior + JSON.stringify(Object.fromEntries(STATUS_FIELDS[file].map((k) => [k, entry[k]]))) + "\n"); D.fsyncSync(fd); } finally { D.closeSync(fd); }
  D.renameSync(tmp, p); D.fsyncDir(statusDir);
}
/** The from_unit of the start mark, or null when there is none; a mark not of its form is refused. */
function readStart(statusDir) {
  const p = join(statusDir, "start");
  if (!existsSync(p)) return null;
  let m = null;
  try { m = JSON.parse(readFileSync(p, "utf8")); } catch { m = null; }
  if (!isDay(String(m?.from_unit)) || typeof m?.posted_at !== "string") refuse("schema_mismatch", "status/start");
  return m.from_unit;
}

/** --handoff-start <D>: poses the start mark {"from_unit":D,"posted_at":<ISO>} once and only once, when every bundle and tombstone of
 *  the handoff directory starts before D. Created exclusively: a synced temporary file, then a hard link on the final name (an existing
 *  mark is never replaced). It reads no key: the mark does not depend on it. */
export function postStartMark({ from, handoffDir, statusDir, clock, clockSynced = UNSYNCED, fs: D = DURABLE_FS }) {
  if (!clockSynced()) refuse("clock_unsynced", "the host clock is not synchronized");
  const p = join(statusDir, "start");
  if (existsSync(p)) refuse("start_mark_exists", "status/start");
  const late = readdirSync(handoffDir).filter((x) => (UNIT_NAME.test(x) || TOMBSTONE.test(x)) && dayOf(x) >= from);
  if (late.length > 0) refuse("start_mark_not_after_bundles", `${String(late.length)} bundle(s) of the handoff directory start at or after the mark`);
  const posted_at = new Date(clock()).toISOString(), tmp = join(statusDir, `.tmp-start-${String(process.pid)}`), fd = D.openSync(tmp, "w");
  try { D.writeSync(fd, JSON.stringify({ from_unit: from, posted_at }) + "\n"); D.fsyncSync(fd); } finally { D.closeSync(fd); }
  try { linkSync(tmp, p); } catch (e) { if (e?.code === "EEXIST") refuse("start_mark_exists", "status/start"); throw e; } finally { unlinkSync(tmp); }
  D.fsyncDir(statusDir);
  return { status: "start_mark_posted", from_unit: from, posted_at };
}

/** --handoff: probe, lock, mark, ONE clock read, the choice (chooseHandoff), then for each chosen bundle the line path of --inbox (publishOne,
 *  no archive: the handoff directory is never written) under the overlap guard, and its status line; a bundle whose runs are all published
 *  already (a stop between commit and status line) is recorded at the line that holds them; a refusal of a bundle is recorded and stops the call, manifest_mismatch included (its files no longer match its manifest).
 *  The call is synchronous: a SIGTERM during it waits for the event loop, the listener set before the lock keeping the default exit off; the finally releases the lock and removes the listener, so its own release never runs mid-call (BELL-PUBLISH-SIGTERM-SYNC-1). */
export function publishHandoff({ handoffDir, stateDir, statusDir, privateKey, clock, clockSynced = UNSYNCED, bounds = {}, fs: D = DURABLE_FS, n = HANDOFF_N,
  exit = (code) => process.exit(code) }) {
  if (!clockSynced()) refuse("clock_unsynced", "the host clock is not synchronized");
  const key = typeof privateKey === "function" ? privateKey() : privateKey, lock = join(stateDir, "publish.lock");
  let held = false, mine = "";
  const release = () => { if (held) { held = false; releaseLock(lock, mine); } };
  const onTerm = () => { try { release(); process.stderr.write("bell/publish: sigterm: publish.lock released\n"); } finally { exit(1); } };
  process.on("SIGTERM", onTerm);
  try {
    try { mine = takeLock(lock); held = true; } catch (e) { if (e?.code === "EEXIST") refuse("lock_held", `publish.lock: another writer holds the state (${holderVerdict(holderOf(lock), bootId(), running)})`); throw e; }
    const start = readStart(statusDir) ?? refuse("handoff_start_missing", "status/start: no start mark (the act --handoff-start poses it)");
    const t = clock(), B = { ...BOUNDS, ...bounds }, entries = readdirSync(handoffDir, { withFileTypes: true }); // the ONE clock read of the call
    const { manifests, mismatched } = manifestsOf(handoffDir, entries, start), choice = chooseHandoff({ names: entries.map((e) => e.name), manifests, published: readStatus(statusDir, "published.jsonl"),
      refused: readStatus(statusDir, "refused.jsonl"), start, n });
    const overlap = (fresh, lines) => { // closed intervals [a, b] and [c, d] meet when a <= d and c <= b
      fresh.forEach((r, i) => { for (const l of lines.filter((x) => x.kind === "publication")) for (const p of l.runs) {
        if (r.state.window.from_utc_ms <= p.window.to_utc_ms && p.window.from_utc_ms <= r.state.window.to_utc_ms) refuse("window_overlaps_published", `$.runs[${String(i)}].state.window meets a window of line ${String(l.seq)}`);
      } });
    };
    const out = [];
    for (const { bundle, manifest_sha256 } of choice.bundles) {
      let r;
      try { if (mismatched.has(bundle)) refuse("manifest_mismatch", `${bundle}: its files no longer match ${bundle}.manifest`); r = publishOne({ stateDir, privateKey: key, t, B, D, locate: () => ({ bundle, bdir: join(handoffDir, bundle) }), guard: overlap }); } catch (e) {
        if (e instanceof BellPublishError && BUNDLE_REFUSALS.has(e.code)) appendStatus(statusDir, "refused.jsonl", { bundle, manifest_sha256, code: e.code, refused_at: new Date(t).toISOString() }, D);
        throw e;
      }
      const shas = new Set(r.runs.map((x) => x.bellSha)); // healed: the last line that holds a run of the bundle
      const l = r.status === "published" ? r.line : r.lines.filter((x) => x.kind === "publication" && x.runs.some((y) => shas.has(y.bell_sha))).pop();
      appendStatus(statusDir, "published.jsonl", { bundle, manifest_sha256, seq: l.seq, published_at: l.published_at }, D);
      out.push({ bundle, seq: l.seq, ...(r.status === "published" ? {} : { healed: true }) });
    }
    const status = choice.awaiting !== null ? "awaiting_unit" : out.length > 0 ? "published" : "nothing_to_publish";
    return { status, published: out, ...(choice.awaiting !== null ? { awaiting_unit: `unit-${choice.awaiting}` } : {}) };
  } finally { release(); process.off("SIGTERM", onTerm); }
}

// ---- The rotation in two steps (G0 BELL-COLLECT-TIMER-1 DC-8 (a), Q-6; PLAN-P5 C5-4): the key_rotation line of rotateKey, built once and
// signed in three runs that each load one key or none, so no private key leaves its host and only the line's public bytes travel:
// --rotate-draft (the new host, the new key bell-signing-key-new: the line on the head of its state, signed sig_new), --rotate-cosign (the
// former host, the old key bell-signing-key: the line checked against its own head and sig_new, then signed sig), --rotate-commit (the new
// host, no key: the line checked against its head and both signatures, then committed by commitLine). The draft and the cosign read the
// state (inspect) and write nothing; every refusal of a line is rotation_line_mismatch, its detail naming the field, nothing written.
const ROTATION_FIELDS = ["kind", "key_id", "new_key", "new_key_id", "prev_line_hash", "published_at", "schema", "seq"];
const isIso = (s) => typeof s === "string" && Number.isFinite(Date.parse(s)) && new Date(Date.parse(s)).toISOString() === s;
/** The read-only head of a state for the rotation: its committed lines (a torn tail is not one) and its derived keyring; never repaired here. */
function rotationHead(stateDir) {
  const st = inspect(stateDir, BOUNDS);
  if (st.lines.length === 0) refuse("no_timeline", "a rotation needs a committed timeline (the first key comes with the first publication)");
  return st;
}
/** The checks every form after the draft makes on the line: its fields (the draft's, plus `sigs`), its place on this state's head (seq,
 *  prev_line_hash, key_id the active key, published_at an ISO instant not before the head's), its new key, then sig_new and, with "sig", sig. */
function checkRotationLine(st, line, sigs) {
  const bad = (field) => refuse("rotation_line_mismatch", `${field}: the line does not follow the head of this state or its signatures`);
  if (line === null || typeof line !== "object" || Array.isArray(line) || Object.keys(line).sort().join(" ") !== [...ROTATION_FIELDS, ...sigs].sort().join(" ")) bad("fields");
  const tail = st.lines[st.lines.length - 1], active = st.keyring.keys.find((k) => k.status === "active");
  if (line.schema !== "bell-timeline-v1" || line.kind !== "key_rotation") bad("kind");
  if (line.seq !== st.lines.length + 1) bad("seq");
  if (line.prev_line_hash !== lineHash(tail)) bad("prev_line_hash");
  if (line.key_id !== active.key_id) bad("key_id");
  if (!isIso(line.published_at) || line.published_at < tail.published_at) bad("published_at");
  let nk = null;
  try { nk = keyringOf(publicKeyOfJwk(line.new_key), 1).keys[0]; } catch { nk = null; }
  if (nk === null || canonical(nk.jwk) !== canonical(line.new_key) || nk.key_id !== line.new_key_id) bad("new_key");
  if (st.keyring.keys.some((k) => k.key_id === nk.key_id)) refuse("key_already_in_keyring", "the new key is already in the state keyring");
  if (!verifyLine({ ...line, sig: line.sig_new }, publicKeyOfJwk(line.new_key))) bad("sig_new");
  if (sigs.includes("sig") && !verifyLine(line, publicKeyOfJwk(active.jwk))) bad("sig");
}
/** --rotate-draft: the key_rotation line on the head of `stateDir` (rotateKey's fields and instant), signed sig_new by `newKey`; writes nothing. */
export function rotateDraft({ stateDir, newKey, clock }) {
  const t = clock(), st = rotationHead(stateDir);
  const nk = keyringOf(newKey, 1).keys[0];
  if (st.keyring.keys.some((k) => k.key_id === nk.key_id)) refuse("key_already_in_keyring", "the new key is already in the state keyring");
  const line = { ...lineHead(st, "key_rotation", t), key_id: activeKeyId(st.keyring), new_key: nk.jwk, new_key_id: nk.key_id };
  line.sig_new = signLine(line, newKey); // the signed bytes exclude sig and sig_new: the old key signs the same bytes at the cosign
  return line;
}
/** --rotate-cosign: the drafted `line` checked against the head of `stateDir` and its sig_new, then signed sig by `oldKey`, the active key; writes nothing. */
export function rotateCosign({ stateDir, oldKey, line }) {
  const st = rotationHead(stateDir);
  if (activeKeyId(st.keyring) !== keyIdOf(oldKey)) refuse("signing_key_not_in_keyring", "the loaded key is not the active key of the state keyring");
  checkRotationLine(st, line, ["sig_new"]);
  return { ...line, sig: signLine(line, oldKey) };
}
/** --rotate-commit: the cosigned `line` checked (head and both signatures) before any write, then the start-up repairs and commitLine; no key. */
export function rotateCommit({ stateDir, line, fs: D = DURABLE_FS }) {
  checkRotationLine(rotationHead(stateDir), line, ["sig_new", "sig"]);
  const st = openState(stateDir, BOUNDS, D, null);
  checkRotationLine(st, line, ["sig_new", "sig"]);
  commitLine(stateDir, st, st.genesis, line, [], D);
  return keyLineResult("rotated", line);
}
/** The --line file of the cosign and the commit: at most MAX_LINE_BYTES, exactly one canonical line and its LF (an octet changed, or spaces, refused). */
function readRotationLine(path) {
  const max = BOUNDS.MAX_LINE_BYTES, buf = Buffer.alloc(max + 1), fd = openSync(path, "r");
  let n = 0;
  try { for (let r; n <= max && (r = readSync(fd, buf, n, max + 1 - n, null)) > 0;) n += r; } finally { closeSync(fd); }
  if (n > max) refuse("line_too_large", "--line");
  const text = buf.subarray(0, n).toString("utf8");
  let line = null;
  try { line = JSON.parse(text); } catch { line = null; }
  if (line === null || typeof line !== "object" || text !== canonical(line) + "\n") refuse("rotation_line_mismatch", "bytes: --line holds no canonical line with its final newline");
  return line;
}

// ---- The holder of publish.lock and its release (BELL-PUBLISH-LOCK-RELEASE-1; PLAN-P5 C5-6; calque of the Dojo's single writer, D-SW2 and
// D-SW3 of docs/G0-lot-single-writer.md): the lock holds the record {pid, boot_id, taken_at} of the call that took it, written whole and
// synced under that call's own name, then hard-linked to publish.lock (link(2) fails EEXIST when the lock exists: the lock never exists
// without its record); --unlock frees only a dead holder, never a live or unreadable one (never an automatic theft, rpc-guard lock.ts C-9).
/** The boot of this host (the kernel's random boot_id), or null where it cannot be read (not Linux): a holder of another boot is dead. */
function bootId() {
  try { const s = readFileSync("/proc/sys/kernel/random/boot_id", "utf8").trim(); return /^[0-9a-f-]{36}$/.test(s) ? s : null; } catch { return null; }
}
/** Signal 0 tests a pid of this host: delivered, or any error but ESRCH (EPERM: another user's process), it reads running (fail-closed). */
const running = (pid) => { try { return process.kill(pid, 0); } catch (e) { return e?.code !== "ESRCH"; } };
/** The record of a lock, or null when unreadable (empty, torn, foreign, absent): such a holder is never freed by --unlock. */
function holderOf(lock) {
  let o = null;
  try { o = JSON.parse(readFileSync(lock, "utf8")); } catch { return null; }
  return Number.isInteger(o?.pid) && o.pid > 0 && (o.boot_id === null || typeof o.boot_id === "string") && isIso(o.taken_at) ? o : null;
}
/** The verdict on a holder, PURE: unreadable; dead ("not running") when it took the lock in another boot, or when its pid no longer runs in
 *  this one (a boot that cannot be read on either side: the pid alone); else running. A pid reused in the same boot reads running: refused. */
export function holderVerdict(o, boot, isRunning) {
  if (o === null) return "owner unreadable";
  return (o.boot_id !== null && boot !== null && o.boot_id !== boot) || !isRunning(o.pid) ? "not running: --unlock releases it" : "running";
}
/** Takes publish.lock for this call: the record under publish.lock.<pid>, synced, then linked to the lock (EEXIST: held), the temporary name
 *  removed in every case, the directory synced (a failed sync removes the lock: never held without it). Returns the record's text, which the
 *  release compares before removing the lock. Real node:fs, never the `fs` seam of the call: the seam is the publication's (its writes). */
function takeLock(lock) {
  const mine = JSON.stringify({ pid: process.pid, boot_id: bootId(), taken_at: new Date().toISOString() }) + "\n", tmp = `${lock}.${String(process.pid)}`, fd = openSync(tmp, "w");
  try { writeSync(fd, mine); fsyncSync(fd); } finally { closeSync(fd); }
  try { linkSync(tmp, lock); } finally { unlinkSync(tmp); }
  try { DURABLE_FS.fsyncDir(dirname(lock)); } catch (e) { unlinkSync(lock); throw e; }
  return mine;
}
/** The release: the lock is removed only while it holds THIS call's record (a lock freed and taken again since is another's). */
function releaseLock(lock, mine) { if (existsSync(lock) && readFileSync(lock, "utf8") === mine) unlinkSync(lock); }
/** --unlock: a lock whose holder is dead is removed and its record returned; the next call repairs the state (openState). A live or
 *  unreadable holder is refused lock_held, nothing written; no lock: not_locked. It reads no key. */
export function unlockState(stateDir, D = DURABLE_FS) {
  const lock = join(stateDir, "publish.lock");
  if (!existsSync(lock)) return { status: "not_locked" };
  const o = holderOf(lock), v = holderVerdict(o, bootId(), running);
  if (o === null || v !== "not running: --unlock releases it") refuse("lock_held", `publish.lock: ${v}`);
  unlinkSync(lock);
  D.fsyncDir(stateDir);
  return { status: "unlocked", pid: o.pid, boot_id: o.boot_id, taken_at: o.taken_at };
}

/** The key loader of the CLI: $CREDENTIALS_DIRECTORY must be an absolute path, then each named key is read from it. */
function keyLoader() {
  const credDir = process.env.CREDENTIALS_DIRECTORY; // systemd LoadCredential (ADR D9): the ONLY environment read of this module
  if (typeof credDir !== "string" || !isAbsolute(credDir)) refuse("signing_key_missing", "$CREDENTIALS_DIRECTORY is not set to an absolute path");
  return (name) => {
    let k;
    try { k = createPrivateKey(readFileSync(join(credDir, name))); } catch { refuse("signing_key_missing", `$CREDENTIALS_DIRECTORY/${name} absent or unreadable`); }
    if (k.asymmetricKeyType !== "ed25519") refuse("signing_key_missing", `${name} is not an Ed25519 private key`);
    return k;
  };
}
/** The two --handoff forms, closed: each option once with a value; else null (usage). */
function handoffForm(argv) {
  const v = {};
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i], x = argv[i + 1];
    if (!["--handoff", "--state", "--status", "--handoff-start"].includes(k) || Object.hasOwn(v, k) || x === undefined || x === "" || x.startsWith("--")) return null;
    v[k] = x;
  }
  const keys = Object.keys(v).sort().join(" ");
  if (keys === "--handoff --state --status") return { mode: "handoff", handoffDir: v["--handoff"], stateDir: v["--state"], statusDir: v["--status"] };
  if (keys === "--handoff --handoff-start --status" && isDay(v["--handoff-start"])) return { mode: "start", from: v["--handoff-start"], handoffDir: v["--handoff"], statusDir: v["--status"] };
  return null;
}
/** The CLI of the two --handoff forms: exit 0 with one JSON line on stdout, 1 with `bell/publish: <code>: <detail>` on stderr, 64 on usage. */
function handoffCli(argv, deps) {
  const f = handoffForm(argv);
  if (f === null) {
    process.stderr.write("bell/publish: usage: --handoff <dir> --state <dir> --status <dir> | --handoff-start <YYYY-MM-DD> --handoff <dir> --status <dir>\n");
    return 64;
  }
  try {
    const clock = deps.clock ?? (() => Date.now()), clockSynced = deps.clockSynced ?? UNSYNCED;
    const r = f.mode === "start" ? postStartMark({ ...f, clock, clockSynced }) : publishHandoff({ ...f, privateKey: () => keyLoader()("bell-signing-key"), clock, clockSynced });
    process.stdout.write(JSON.stringify(r) + "\n");
    return 0;
  } catch (e) {
    process.stderr.write(`bell/publish: ${e instanceof BellPublishError ? `${e.code}: ${e.detail}` : `fatal: ${String(e?.code ?? e?.name ?? "error")}`}\n`);
    return 1;
  }
}
/** The forms of the rotation in two steps and of the lock's release, closed: the mode once, then each of its options once with a value; else null. */
const KEY_ACTS = Object.freeze({ "--rotate-draft": ["--state"], "--rotate-cosign": ["--line", "--state"], "--rotate-commit": ["--line", "--state"], "--unlock": ["--state"] });
function keyActForm(argv) {
  const at = argv.findIndex((a) => Object.hasOwn(KEY_ACTS, a)), mode = argv[at], rest = argv.filter((_, i) => i !== at), v = {};
  if (argv.filter((a) => Object.hasOwn(KEY_ACTS, a)).length !== 1) return null;
  for (let i = 0; i < rest.length; i += 2) {
    const k = rest[i], x = rest[i + 1];
    if (!KEY_ACTS[mode].includes(k) || Object.hasOwn(v, k) || x === undefined || x === "" || x.startsWith("--")) return null;
    v[k] = x;
  }
  return Object.keys(v).length === KEY_ACTS[mode].length ? { mode, stateDir: v["--state"], linePath: v["--line"] } : null;
}
/** Their CLI: exit 0 with one line on stdout (the draft's and the cosign's: the canonical line itself, for the next run; the commit's: the
 *  JSON result), 1 with `bell/publish: <code>: <detail>` on stderr, 64 on usage. Each form loads its one key, or none (the commit, --unlock). */
function keyActCli(argv, deps) {
  const f = keyActForm(argv);
  if (f === null) {
    process.stderr.write("bell/publish: usage: --rotate-draft --state <dir> | --rotate-cosign --line <file> --state <dir> | --rotate-commit --line <file> --state <dir> | --unlock --state <dir>\n");
    return 64;
  }
  try {
    const out = f.mode === "--rotate-draft" ? canonical(rotateDraft({ stateDir: f.stateDir, newKey: keyLoader()("bell-signing-key-new"), clock: deps.clock ?? (() => Date.now()) }))
      : f.mode === "--rotate-cosign" ? canonical(rotateCosign({ stateDir: f.stateDir, oldKey: keyLoader()("bell-signing-key"), line: readRotationLine(f.linePath) }))
        : JSON.stringify(f.mode === "--unlock" ? unlockState(f.stateDir) : rotateCommit({ stateDir: f.stateDir, line: readRotationLine(f.linePath) }));
    process.stdout.write(out + "\n");
    return 0;
  } catch (e) {
    process.stderr.write(`bell/publish: ${e instanceof BellPublishError ? `${e.code}: ${e.detail}` : `fatal: ${String(e?.code ?? e?.name ?? "error")}`}\n`);
    return 1;
  }
}

/** CLI: exit 0 with one JSON summary line on stdout, or exit 1 with `bell/publish: <code>: <detail>` on stderr. An argv with --handoff or
 *  --handoff-start and none of the four other mode options takes the --handoff forms (handoffCli; `deps.clockSynced` the probe, `deps.clock` the clock, PLAN-P3 C3-11). */
export function runCli(argv, deps = {}) {
  if (Object.keys(KEY_ACTS).some((k) => argv.includes(k))) return keyActCli(argv, deps); // the rotation in two steps (C5-4), --unlock (C5-6)
  if ((argv.includes("--handoff") || argv.includes("--handoff-start")) && !["--inbox", "--generate-key", "--rotate", "--revoke"].some((k) => argv.includes(k))) return handoffCli(argv, deps);
  const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const inboxDir = arg("--inbox"), stateDir = arg("--state"), genPath = arg("--generate-key"), revoke = arg("--revoke");
  const mode = argv.includes("--generate-key") ? "generate" : argv.includes("--rotate") ? "rotate" : argv.includes("--revoke") ? "revoke" : "publish";
  const misuse = ["--inbox", "--state", "--generate-key", "--revoke", "--from-seq"].some((k) => argv.includes(k) && (argv[argv.indexOf(k) + 1] ?? "--").startsWith("--")) // C-8: a valued option
    || ["--generate-key", "--rotate", "--revoke"].filter((k) => argv.includes(k)).length > 1 || (argv.includes("--broken") && mode !== "rotate"); // lacks its value (or takes a flag); >1 mode; --broken off --rotate
  if (misuse || (mode === "generate" ? !genPath : !stateDir || (mode === "publish" && !inboxDir) || (mode === "revoke" && !revoke))) {
    process.stderr.write("bell/publish: usage: --inbox <dir> --state <dir> | --generate-key <file> | --rotate [--broken] --state <dir> | --revoke <key_id> --from-seq <n> --state <dir>\n");
    return 1;
  }
  try {
    if (mode === "generate") { process.stdout.write(JSON.stringify(generateKey(genPath)) + "\n"); return 0; } // reads no environment
    const load = keyLoader();
    const clock = () => Date.now();
    const r = mode === "rotate" ? rotateKey({ stateDir, oldKey: argv.includes("--broken") ? null : load("bell-signing-key"), newKey: load("bell-signing-key-new"), clock })
      : mode === "revoke" ? revokeKey({ stateDir, key: load("bell-signing-key"), revokedKeyId: revoke, revokedFromSeq: Number(arg("--from-seq")), clock })
        : publishToDir({ inboxDir, stateDir, privateKey: load("bell-signing-key"), clock });
    process.stdout.write(JSON.stringify(r) + "\n");
    return 0;
  } catch (e) {
    process.stderr.write(`bell/publish: ${e instanceof BellPublishError ? `${e.code}: ${e.detail}` : `fatal: ${String(e?.code ?? e?.name ?? "error")}`}\n`);
    return 1;
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = runCli(process.argv.slice(2));
