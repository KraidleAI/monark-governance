// MONARK Bell -- T-1b publication chain primitives (ADR-T1b-backend v2 D3, D6). Node built-ins only (node:crypto): no
// network, no npm module, so a third party checks a publication with Node alone. DECLARED DUPLICATES of the collector
// (a .mjs run by plain node cannot import the .ts, precedent bell-report.mjs:29-38), proven equal by
// apps/bell/test/bell-publish-chain.test.ts: canonical() == apps/bell/src/digest.ts:28-36 byte for byte on a fixed
// corpus; CLOSE_KEY == digest.ts:38 twice (C-6): the regex LITERAL extracted from both sources, and the VERDICT of the
// guard vs the exported assertNoClose on a corpus of positive and negative names. The signature attests ORIGIN (who
// published these bytes), never that a fact is true.
import { createHash, createPublicKey, sign, verify } from "node:crypto";

/** 64 zeros: prev_line_hash of a first line (collect.ts:83; same motif for the served timeline). */
export const GENESIS = "0".repeat(64);

/** Deterministic canonical JSON: recursively sorted object keys, no incidental whitespace (digest.ts:28-36). */
export function canonical(v) {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") { if (!Number.isFinite(v)) throw new Error("non-finite number in digest"); return String(v); }
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
  const keys = Object.keys(v).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonical(v[k])).join(",") + "}";
}

export const CLOSE_KEY = /(?<!no_)close|ref[_]?price|p[_]?ref|reference|\bprev\b|(?<!no_)adv|share_volume|volume_ref/i;
const isNumericLike = (x) => typeof x === "number" || (typeof x === "string" && x.trim() !== "" && Number.isFinite(Number(x)));

/** JSON path of the first key naming the reference close / ADV with a numeric (or numeric-string) value, else null.
 *  Same walk as digest.ts:43-53 (array order, then each key before its value), hence the same verdict. */
export function closeLikePath(v, path = "$") {
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) { const p = closeLikePath(v[i], `${path}[${String(i)}]`); if (p !== null) return p; }
    return null;
  }
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v)) {
      if (CLOSE_KEY.test(k) && isNumericLike(val)) return `${path}.${k}`;
      const p = closeLikePath(val, `${path}.${k}`);
      if (p !== null) return p;
    }
  }
  return null;
}
/** Throws on any close-like numeric field (the guard of digest.ts assertNoClose, same verdict). */
export function assertNoCloseLike(v, path = "$") {
  const p = closeLikePath(v, path);
  if (p !== null) throw new Error(`bell/chain close guard: forbidden close-like field at ${p} (ESC-1 c)`);
}

export const sha256Hex = (x) => createHash("sha256").update(x).digest("hex");
/** line_hash = sha256(canonical(full line)); the next line carries it as prev_line_hash (ADR D6). */
export const lineHash = (line) => sha256Hex(canonical(line));

/** Re-derive a collector run chain (collect.ts:86-96): line i carries prev_line_hash = sha256(canonical(line i-1)),
 *  GENESIS for the first. Returns {ok: true} or {ok: false, index, reason}; never a value. */
export function rechainRunTimeline(lines) {
  let prev = GENESIS;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l === null || typeof l !== "object" || Array.isArray(l)) return { ok: false, index: i, reason: "not_an_object" };
    if (l.prev_line_hash !== prev) return { ok: false, index: i, reason: "prev_line_hash_mismatch" };
    prev = lineHash(l);
  }
  return { ok: true };
}

/** The signed bytes of a timeline line: UTF-8 of canonical(line without `sig` and `sig_new`) (ADR D6). */
export function signingBytes(line) {
  const body = { ...line };
  delete body.sig;
  delete body.sig_new;
  return Buffer.from(canonical(body), "utf8");
}
/** Ed25519 (RFC 8032 5.1.6) through node:crypto sign with a null algorithm (required for Ed25519), base64url, no padding. */
export const signLine = (line, privateKey) => sign(null, signingBytes(line), privateKey).toString("base64url");
/** true iff line.sig is a canonical base64url 64-byte Ed25519 signature of signingBytes(line) under publicKey. */
export function verifyLine(line, publicKey) {
  const s = line !== null && typeof line === "object" ? line.sig : undefined;
  if (typeof s !== "string") return false;
  const raw = Buffer.from(s, "base64url");
  if (raw.length !== 64 || raw.toString("base64url") !== s) return false; // node decodes base64url laxly: re-encode
  return verify(null, signingBytes(line), publicKey, raw);
}

const asPublic = (k) => (k.type === "public" ? k : createPublicKey(k));
/** key_id = sha256 hex of the 32 raw public-key bytes, decoded from the `x` of its JWK export. */
export function keyIdOf(publicKey) {
  const pub = asPublic(publicKey);
  const raw = Buffer.from(pub.export({ format: "jwk" }).x ?? "", "base64url");
  if (pub.asymmetricKeyType !== "ed25519" || raw.length !== 32) throw new Error("bell/chain: not an Ed25519 public key");
  return sha256Hex(raw);
}
/** The keyring (public keys only, never `d`). Single key here; rotation lines extend it later (ADR D9). */
export function keyringOf(publicKey, validFromSeq) {
  const pub = asPublic(publicKey);
  return { schema: "bell-keyring-v1", keys: [{ key_id: keyIdOf(pub), jwk: { kty: "OKP", crv: "Ed25519", x: pub.export({ format: "jwk" }).x },
    valid_from_seq: validFromSeq, status: "active" }] };
}
/** The public KeyObject of a keyring entry's JWK (public members only). */
export const publicKeyOfJwk = (jwk) => createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: jwk.x }, format: "jwk" });

// ---- S-6 (ADR D6, D9; C-9): the key schedule, shared by the publisher's start-up check and bell-verify.mjs ----
const KINDS = new Set(["publication", "key_rotation", "key_revocation"]);
const isJwk = (j) => j !== null && typeof j === "object" && j.kty === "OKP" && j.crv === "Ed25519" && typeof j.x === "string";
/** The trust set of a bell-keyring-v1: Map key_id -> {x, revoked_from_seq?}; null when malformed (a key_id that is not the
 *  sha256 of its 32 public bytes, a duplicate, no key). */
export function trustOf(keyring) {
  if (keyring === null || typeof keyring !== "object" || keyring.schema !== "bell-keyring-v1" || !Array.isArray(keyring.keys) || keyring.keys.length === 0) return null;
  const m = new Map();
  for (const k of keyring.keys) {
    let id = null;
    try { if (isJwk(k?.jwk)) id = keyIdOf(publicKeyOfJwk(k.jwk)); } catch { id = null; }
    if (id === null || id !== k.key_id || m.has(id)) return null;
    if (k.revoked_from_seq !== undefined ? !(Number.isInteger(k.revoked_from_seq) && k.revoked_from_seq >= 1) : k.status === "revoked") return null; // C-9: a malformed revocation marker is never ignored
    m.set(id, Number.isInteger(k.revoked_from_seq) ? { x: k.jwk.x, revoked_from_seq: k.revoked_from_seq } : { x: k.jwk.x });
  }
  return m;
}
/** Walk a bell-timeline-v1 under a trust set. Line n: schema, seq n, prev_line_hash chain from GENESIS, signer (key_id) in
 *  the trust set, sig valid. Schedule: line 1's signer is the genesis key; a publication or a revocation is signed by the
 *  ACTIVE key; a key_rotation names new_key (in the trust set, C-9) and carries sig_new under it (same signed bytes); a
 *  cross-signed one is signed by the active key, a `continuity: "broken"` one (key lost) by the new key alone, reported in
 *  `breaks`; the new key is then active. A key_revocation names a former key and revoked_from_seq in [1, its seq]. Lines
 *  signed by a key revoked at their seq (timeline or trust set) are `voided` (attestation void, never a head for a reader).
 *  Returns {ok: true, active, head, voided, breaks} (head = last publication line or null) or {ok: false, seq, reason}. */
export function walkTimeline(lines, trust) {
  let prev = GENESIS, active = null;
  const revoked = new Map([...trust].filter(([, k]) => k.revoked_from_seq !== undefined).map(([id, k]) => [id, k.revoked_from_seq]));
  const breaks = [], former = new Set(), keyOf = (x) => publicKeyOfJwk({ x });
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], seq = i + 1, fail = (reason) => ({ ok: false, seq, reason });
    if (l === null || typeof l !== "object" || l.schema !== "bell-timeline-v1" || l.seq !== seq || !KINDS.has(l.kind)) return fail("timeline_malformed");
    if (l.prev_line_hash !== prev) return fail("chain_broken");
    const rot = l.kind === "key_rotation", broken = rot && l.continuity === "broken";
    if (rot && !trust.has(l.new_key_id)) return fail("rotation_key_not_in_keyring"); // C-9: a new key is trusted out of band only
    const k = trust.get(l.key_id);
    if (k === undefined) return fail("key_not_in_keyring");
    if (!verifyLine(l, keyOf(k.x))) return fail("signature_invalid");
    if (i === 0) active = l.key_id;
    if (broken ? l.key_id !== l.new_key_id : l.key_id !== active) return fail("key_not_active");
    if (rot) {
      if (!(l.continuity === undefined || broken) || !isJwk(l.new_key) || l.new_key.x !== trust.get(l.new_key_id).x || l.new_key_id === active || former.has(l.new_key_id)) return fail("rotation_malformed");
      if (!verifyLine({ ...l, sig: l.sig_new }, keyOf(l.new_key.x))) return fail("signature_invalid"); // sig_new is required
      if (broken) breaks.push({ seq, lost_key_id: active, new_key_id: l.new_key_id });
      former.add(active);
      active = l.new_key_id;
    }
    if (l.kind === "key_revocation") {
      const r = l.revoked_key_id, from = l.revoked_from_seq;
      if (!former.has(r) || !Number.isInteger(from) || from < 1 || from > seq) return fail("revocation_malformed");
      revoked.set(r, Math.min(revoked.get(r) ?? from, from));
    }
    prev = lineHash(l);
  }
  const voided = lines.filter((l) => l.seq >= (revoked.get(l.key_id) ?? Infinity)).map((l) => l.seq);
  const pubs = lines.filter((l) => l.kind === "publication");
  return { ok: true, active, head: pubs[pubs.length - 1] ?? null, voided, breaks };
}
/** The keyring DERIVED from its genesis entry and the timeline (the served /bell/pubkey.json): a rotation retires the active
 *  key (valid_to_seq = its seq), or marks it lost (broken: valid_to_seq = seq - 1), and appends the new key active; a
 *  revocation marks its key revoked from revoked_from_seq. Public members only, never `d`. Lines are those walkTimeline accepts. */
export function deriveKeyring(genesis, lines) {
  const keys = [{ key_id: genesis.key_id, jwk: { kty: "OKP", crv: "Ed25519", x: genesis.jwk.x }, valid_from_seq: 1, status: "active" }];
  for (const l of lines) {
    if (l.kind === "key_rotation") {
      const old = keys.find((k) => k.status === "active"), broken = l.continuity === "broken";
      Object.assign(old, broken ? { status: "lost", valid_to_seq: l.seq - 1 } : { status: "retired", valid_to_seq: l.seq });
      keys.push({ key_id: l.new_key_id, jwk: { kty: "OKP", crv: "Ed25519", x: l.new_key.x }, valid_from_seq: l.seq, status: "active", ...(broken ? { continuity: "broken" } : {}) });
    }
    if (l.kind === "key_revocation") {
      const k = keys.find((x) => x.key_id === l.revoked_key_id);
      Object.assign(k, { status: "revoked", revoked_from_seq: Math.min(k.revoked_from_seq ?? l.revoked_from_seq, l.revoked_from_seq) });
    }
  }
  return { schema: "bell-keyring-v1", keys };
}
