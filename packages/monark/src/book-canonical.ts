// packages/monark/src/book-canonical.ts — the SINGLE canonical-serialization definition of the Ukemi book
// domain (ADR-U1b D8, C-1). There is exactly ONE definition of "canonical" in the tree: `canonicalStringify`
// lives here and `apps/sentinel/src/ukemi/book.ts` IMPORTS it (an import-only substitution, no second copy).
// `packages/monark` may not import `apps/*` (apps/sentinel already depends on @monark/monark — importing back
// would be a cycle), and `packages/contracts/src` is a FROZEN zone, so the definition is carried here.
//
// Two domains:
//   - `canonicalStringify` / `bookDigest` = the Ukemi BOOK domain (byte-identical to the recorder's, so
//     `bookDigest(recordBook(...).book)` reproduces the pinned `book_digest` — the single-canonical proof).
//     `Canon` forbids numbers by construction (every integer is a decimal string), so there is no number branch.
//   - `canonicalAttestedBook` / `attestedBookDigest` = the AttestedBook ENVELOPE domain (the future domain of
//     `attestor.sig`, K-1). The envelope carries real JSON numbers (block.number, quorum.required, ...), so this
//     is a TYPED extension: an integer is canonical iff `Number.isSafeInteger`, `null` is admitted, and ANY other
//     number (a float, an unsafe integer) THROWS a named error — never a silent `{}` (C-2, measured on the naked
//     `canonicalStringify`, which returns `{}` for a number). RFC 8949 discipline applied to JSON (cbor-canonique.ts:9-16).
import { createHash } from "node:crypto";

/** A canonical JSON value: strings (all integers as decimal strings), booleans, arrays, objects. No floats. */
export type Canon = string | boolean | Canon[] | { [k: string]: Canon };

/** Deterministic serialization (ADR-U1 D2): keys sorted by UTF-8 bytes, minified, no floats, UTF-8. */
export function canonicalStringify(v: Canon): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) return "[" + v.map(canonicalStringify).join(",") + "]";
  const keys = Object.keys(v).sort((a, b) => Buffer.from(a, "utf8").compare(Buffer.from(b, "utf8")));
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalStringify(v[k] as Canon)).join(",") + "}";
}

const sha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");

/** SHA-256 of the canonical book — the domain of `AttestedBook.book_digest` (ADR-U1b D8). */
export function bookDigest(book: Canon): string {
  return sha256(canonicalStringify(book));
}

/** A canonical envelope value: like `Canon` but with the JSON numbers and `null` the AttestedBook envelope carries. */
export type CanonicalEnvelope = string | number | boolean | null | CanonicalEnvelope[] | { [k: string]: CanonicalEnvelope };

/** Thrown when a number is not a safe integer (a float or an out-of-safe-range integer) — never canonicalised silently. */
export class NonCanonicalNumberError extends Error {}

/**
 * Deterministic serialization of the AttestedBook ENVELOPE (ADR-U1b D8, C-2): keys sorted by UTF-8 bytes,
 * minified, `null` admitted; a number is canonical IFF `Number.isSafeInteger` (emitted as its decimal form),
 * and any other number THROWS `NonCanonicalNumberError`. The future domain of `attestor.sig` (K-1). Note:
 * `1.0` / `1e2` are indistinguishable from `1` / `100` AFTER `JSON.parse`, so they are canonical integers here.
 */
export function canonicalAttestedBook(v: CanonicalEnvelope): string {
  if (v === null) return "null";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") {
    if (!Number.isSafeInteger(v)) {
      throw new NonCanonicalNumberError(`canonicalAttestedBook: a canonical number must be a safe integer (RFC 8949 discipline), got ${String(v)}`);
    }
    return String(v);
  }
  if (Array.isArray(v)) return "[" + v.map(canonicalAttestedBook).join(",") + "]";
  const keys = Object.keys(v).sort((a, b) => Buffer.from(a, "utf8").compare(Buffer.from(b, "utf8")));
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalAttestedBook(v[k] as CanonicalEnvelope)).join(",") + "}";
}

/** SHA-256 of the canonical AttestedBook envelope — the future domain of `attestor.sig` (K-1, ADR-U1b D8). */
export function attestedBookDigest(envelope: CanonicalEnvelope): string {
  return sha256(canonicalAttestedBook(envelope));
}
