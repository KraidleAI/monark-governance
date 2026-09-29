// MONARK Dojo -- the publisher, part 1a of PR-3a-1 (ADR-DOJO-PR-3 D-1 row PR-3a-1, cut DOJO-PR3A1-CUT-1; mere ADR-DOJO-SNAPSHOT-1
// T-9, D-8). It keeps the signed, chained dojo-timeline-v1 under --state and serves it from the public/ subtree, Caddy's only root
// (M-E9). A declared calque of apps/bell/scripts/bell-publish.mjs (state layout, durable writes, key schedule, CLI), with the Dojo
// walker: every line is walked by walkDojoTimeline of dojo-chain.mjs BEFORE its commit, so no line the reader's walker refuses is
// ever committed. Modes: --anchor <request> (the anchor line's closed keys, read_rule included; seed_anchor and horizon as printed
// by dojo-seed.mjs --init), --generate-key <new file>, --rotate [--broken], --revoke <key_id> --from-seq <n>. Keys are read ONLY
// from $CREDENTIALS_DIRECTORY (dojo-signing-key, dojo-signing-key-new: systemd LoadCredential, PKCS#8 PEM). Layout of --state:
// timeline.jsonl (private, source of truth, commit point), keyring.json (the genesis key; the rest derives from the key lines),
// staging/, public/ (timeline.jsonl, dojo/pubkey.json in dojo-keyring-v1). Node built-ins and three modules of the repo: no network.
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, statSync, writeSync } from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import { createPrivateKey, generateKeyPairSync } from "node:crypto";
import { pathToFileURL } from "node:url";
import { GENESIS, canonical, deriveKeyring, keyIdOf, keyringOf, lineHash, signLine, trustOf } from "../../bell/scripts/bell-chain.mjs";
import { DOJO_TIMELINE_SCHEMA, walkDojoTimeline } from "./dojo-chain.mjs";
import { ownerClass } from "./dojo-core.mjs";

/** The CLOSED list of the publisher's refusals, outside the verifier's 45 codes. A detail names a file, a key or a seq, never a value. */
export const DOJO_PUBLISH_REFUSALS = Object.freeze(["existing_timeline_corrupt", "signing_key_missing", "signing_key_not_in_keyring",
  "anchor_malformed", "line_refused", "no_timeline", "key_already_in_keyring", "revocation_invalid", "key_file_exists"]);
export class DojoPublishError extends Error {
  constructor(code, detail) { super(`dojo/publish: ${code}: ${detail}`); this.name = "DojoPublishError"; this.code = code; this.detail = detail; }
}
const refuse = (code, detail) => { throw new DojoPublishError(code, detail); };

/** 1 MiB per timeline line and per anchor request: the verifier's MAX_LINE_BYTES (dojo-verify.mjs:37). */
export const BOUNDS = Object.freeze({ MAX_LINE_BYTES: 1024 * 1024 });
/** An anchor request = the anchor line's own fields (mere D-8, tenth pli), closed; declared duplicate of FIELDS.anchor of dojo-verify.mjs. */
export const ANCHOR_KEYS = Object.freeze(["seed_anchor", "mint", "program", "k_reads", "horizon", "validation_days", "tier_units",
  "objective_unit_microusd_days", "tier_windows", "price_window_days", "pool", "pool_quote_vault", "sol_usd_source",
  "dust_threshold_microusd", "read_rule"]);
/** The anchor's account fields are 32-byte base58 addresses, never a label: no operator label is ever served (M-E3). */
const ACCOUNTS = ["mint", "program", "pool", "pool_quote_vault", "sol_usd_source"];
const KEY = "dojo-signing-key";

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

/** Idempotent (also the start-up repair): public/timeline.jsonl = the private timeline, then public/dojo/pubkey.json. */
function serve(stateDir, privText, keyring, D) {
  const pub = join(stateDir, "public");
  let wrote = false;
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
  if (key !== null && keyring !== null && activeKeyId(keyring) !== keyIdOf(key)) refuse("signing_key_not_in_keyring", "the loaded key is not the active key");
  const privText = texts.map((s) => `${s}\n`).join("");
  if (torn) { writeDurable(join(stateDir, "timeline.jsonl"), privText, stateDir, D); process.stderr.write("dojo/publish: repaired_torn_tail\n"); }
  if (lines.length > 0 && serve(stateDir, privText, keyring, D)) process.stderr.write("dojo/publish: rederived_public\n");
  return { lines, genesis, keyring, privText };
}

/** The COMMIT POINT of one line: walked by the Dojo walker after the committed timeline, under the keyring derived WITH it, else refused
 *  with nothing written; keyring.json before the first line; the durable append of the private timeline; then public/. */
function commitLine(stateDir, st, line, D) {
  const lines = [...st.lines, line], keyring = deriveKeyring(st.genesis, lines);
  const w = walkDojoTimeline(lines, trustOf(keyring) ?? refuse("line_refused", "the key lines derive a malformed keyring"));
  if (!w.ok) refuse("line_refused", `seq ${w.seq}: ${w.reason}${w.detail === undefined ? "" : ` (${w.detail})`}`);
  const lineText = `${canonical(line)}\n`;
  if (Buffer.byteLength(lineText) > BOUNDS.MAX_LINE_BYTES) refuse("line_refused", "the line exceeds MAX_LINE_BYTES");
  if (st.lines.length === 0) writeDurable(join(stateDir, "keyring.json"), `${canonical({ schema: "bell-keyring-v1", keys: [st.genesis] })}\n`, stateDir, D);
  const fd = D.openSync(join(stateDir, "timeline.jsonl"), "a");
  try { D.writeSync(fd, lineText); D.fsyncSync(fd); } finally { D.closeSync(fd); }
  D.fsyncDir(stateDir);
  serve(stateDir, st.privText + lineText, keyring, D);
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
  const line = { ...r, ...lineHead(st, "anchor", t, keyIdOf(key)) };
  line.sig = signLine(line, key);
  commitLine(stateDir, { ...st, genesis: st.genesis ?? keyringOf(key, 1).keys[0] }, line, D);
  return result("anchored", line);
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
const USAGE = "dojo/publish: usage: --anchor <request> --state <dir> | --generate-key <file> | --rotate [--broken] --state <dir>"
  + " | --revoke <key_id> --from-seq <n> --state <dir>\n";
const MODES = { "--anchor": ["--state"], "--generate-key": [], "--rotate": ["--state", "--broken"], "--revoke": ["--from-seq", "--state"] };
const VALUED = ["--anchor", "--state", "--generate-key", "--revoke", "--from-seq"];

/** CLI (calque of bell-publish.mjs runCli, argv closed): exit 0 with one JSON line on stdout, or exit 1 with `dojo/publish: <code>:
 *  <detail>` (or the usage) on stderr. */
export function runCli(argv) {
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
    const r = mode === "--anchor" ? publishAnchor({ stateDir, key: load(KEY), request: readRequest(opt.get(mode)), clock })
      : mode === "--rotate" ? rotateKey({ stateDir, oldKey: opt.has("--broken") ? null : load(KEY), newKey: load(`${KEY}-new`), clock })
        : revokeKey({ stateDir, key: load(KEY), revokedKeyId: opt.get(mode), revokedFromSeq: Number(opt.get("--from-seq")), clock });
    process.stdout.write(`${JSON.stringify(r)}\n`);
    return 0;
  } catch (e) {
    process.stderr.write(`dojo/publish: ${e instanceof DojoPublishError ? `${e.code}: ${e.detail}` : `fatal: ${String(e?.code ?? e?.name ?? "error")}`}\n`);
    return 1;
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = runCli(process.argv.slice(2));
