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
