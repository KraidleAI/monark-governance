// MONARK Bell -- T-1b publisher (ADR-T1b-backend v2 D4-D9). Turns ONE pending bundle of real runMain runs into a signed, chained,
// durably written publication, and refuses by name everything else (BellPublishError / exit 1, state directory untouched). It
// computes NO fact: its own fields are seq, published_at, hashes, key_id and signatures. Node built-ins + bell-chain.mjs and
// bell-validate.mjs only (the validation of a run and of a bundle, whose bindings this module re-exports).
// Layout of --state: timeline.jsonl (private, source of truth, commit point), keyring.json (private state keyring), staging/,
// archive/<seq>-<bundle>/, public/ (served by Caddy: state.json, provenance.json, timeline.jsonl, bell/pubkey.json,
// states/<sha>.json, provenance/<sha>.json). CLI (systemd oneshot, ADR D10): node bell-publish.mjs --inbox <dir> --state <dir>;
// the private key is read ONLY from $CREDENTIALS_DIRECTORY/bell-signing-key (systemd LoadCredential, PKCS#8 PEM).
// S-6 operator modes (ADR D9): --generate-key <new file> (prints the public part only); --rotate --state <dir> [--broken]
// (old key bell-signing-key, new key bell-signing-key-new, both from $CREDENTIALS_DIRECTORY; --broken = old key lost);
// --revoke <key_id> --from-seq <n> --state <dir> (signed by the active key bell-signing-key).
import { openSync, readSync, writeSync, fsyncSync, closeSync, renameSync, mkdirSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname, basename, isAbsolute } from "node:path";
import { createPrivateKey, generateKeyPairSync } from "node:crypto";
import { pathToFileURL } from "node:url";
import { GENESIS, canonical, sha256Hex, lineHash, signLine, keyIdOf, keyringOf, trustOf, walkTimeline, deriveKeyring } from "./bell-chain.mjs";
import { BOUNDS, BellPublishError, validateBundle } from "./bell-validate.mjs";
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

/** Publish the ONE pending bundle of `inboxDir` into `stateDir` (ADR D8), or refuse by name with nothing written.
 *  Contract of ADR D12 (named parameters; the keyring derives from privateKey and the state). */
export function publishToDir({ inboxDir, stateDir, privateKey, clock, bounds = {}, fs: D = DURABLE_FS }) {
  const t = clock(); // C-3: the ONE clock read of a publication; the envelopes and the line carry the same published_at
  const published_at = new Date(t).toISOString(), B = { ...BOUNDS, ...bounds };
  const st = openState(stateDir, B, D, privateKey), keyId = keyIdOf(privateKey);
  const keyring = st.keyring ?? keyringOf(privateKey, 1), genesis = st.genesis ?? keyring.keys[0];
  let entries = [];
  try { entries = readdirSync(inboxDir, { withFileTypes: true }); } catch { /* an absent inbox is zero bundles */ }
  if (entries.length !== 1 || !entries[0].isDirectory()) refuse("inbox_not_exactly_one_bundle", `${entries.length} inbox entries`); // C-in-1
  const bundle = entries[0].name, bdir = join(inboxDir, bundle);
  const runs = validateBundle(bdir, B, t); // C-in-1, C-in-10 (bell-validate.mjs)
  const archive = (seq) => { // step 7
    const dir = join(stateDir, "archive");
    ensureDir(dir, D);
    const dst = existsSync(join(dir, `${seq}-${bundle}`)) ? join(dir, `${seq}-${bundle}-dup-${t}`) : join(dir, `${seq}-${bundle}`);
    D.renameSync(bdir, dst); D.fsyncDir(dir); D.fsyncDir(inboxDir);
  };
  const result = (status, l) => ({ status, seq: l.seq, published_at: l.published_at, state_sha256: l.state_sha256, provenance_sha256: l.provenance_sha256, line_hash: lineHash(l) });
  const last = lastPublication(st.lines), tail = st.lines[st.lines.length - 1]; // C-in-9 compares runs: the last PUBLICATION line
  if (last !== undefined && canonical(last.runs.map((r) => r.bell_sha)) === canonical(runs.map((r) => r.bellSha))) { // C-in-9
    archive(last.seq);
    return result("nothing_to_publish", last);
  }
  // BELL-REPUBLISH-1 (G2 PR-1 O-1, ADR D4 C-in-10 "never a run published twice"): a run already cited by a COMMITTED publication
  // line is never published again; only the new runs of the bundle are (journaled); none new => nothing to publish.
  const published = new Set(st.lines.filter((l) => l.kind === "publication").flatMap((l) => l.runs.map((r) => r.bell_sha)));
  const fresh = runs.filter((r) => !published.has(r.bellSha));
  if (fresh.length === 0) { archive(last.seq); return result("nothing_to_publish", last); }
  if (fresh.length < runs.length) process.stderr.write(`bell/publish: skipped_already_published ${String(runs.length - fresh.length)}\n`);
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
  archive(seq);
  return result("published", line);
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

/** CLI: exit 0 with one JSON summary line on stdout, or exit 1 with `bell/publish: <code>: <detail>` on stderr. */
export function runCli(argv) {
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
    const credDir = process.env.CREDENTIALS_DIRECTORY; // systemd LoadCredential (ADR D9): the ONLY environment read of this module
    if (typeof credDir !== "string" || !isAbsolute(credDir)) refuse("signing_key_missing", "$CREDENTIALS_DIRECTORY is not set to an absolute path");
    const load = (name) => {
      let k;
      try { k = createPrivateKey(readFileSync(join(credDir, name))); } catch { refuse("signing_key_missing", `$CREDENTIALS_DIRECTORY/${name} absent or unreadable`); }
      if (k.asymmetricKeyType !== "ed25519") refuse("signing_key_missing", `${name} is not an Ed25519 private key`);
      return k;
    };
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
