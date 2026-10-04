/**
 * Canonical writing of contract 1.1.0 (spec section 2, plan r3 P-2; lot CM-3c-1, block A): the one writing behind every
 * digest of the contract. Minified JSON; object keys ASCII only (a non-ASCII key is refused) and sorted (JavaScript's
 * default order, the byte order for ASCII); numbers finite, written as JavaScript writes them (the shortest round-trip
 * decimal: 0 and 1 without a point, 1e-7, 1e+21; -0 is written 0); strings as JSON.stringify writes them. Refused
 * (RangeError), never written as null: a non-finite number, a lone surrogate in a string, a sparse array, an object that
 * is not plain, a cycle, undefined, a function, a symbol, a bigint. Same writing as canonicalRow of packages/hikae on
 * ASCII keys; canonicalRow also takes a non-ASCII key, until block C re-exports it from here.
 */
import { createHash } from "node:crypto";

/** A value the canonical writing takes. */
export type CanonicalValue = null | boolean | number | string | readonly CanonicalValue[] | { readonly [key: string]: CanonicalValue };

function str(t: string): string {
  if (!t.isWellFormed()) throw new RangeError("canonicalJson: a string or key with a lone surrogate");
  return JSON.stringify(t);
}

function write(v: unknown, seen: readonly object[]): string {
  if (v === null || typeof v === "boolean") return JSON.stringify(v);
  if (typeof v === "string") return str(v);
  if (typeof v === "number") {
    if (!Number.isFinite(v)) throw new RangeError(`canonicalJson: non-finite number ${String(v)}`);
    return JSON.stringify(v);
  }
  if (typeof v !== "object") throw new RangeError(`canonicalJson: not a JSON value (${typeof v})`);
  if (seen.includes(v)) throw new RangeError("canonicalJson: a cycle");
  const inner = [...seen, v];
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) if (!(i in v)) throw new RangeError(`canonicalJson: a sparse array (hole at ${String(i)})`);
    return `[${v.map((x) => write(x, inner)).join(",")}]`;
  }
  const proto: unknown = Object.getPrototypeOf(v);
  if (proto !== Object.prototype && proto !== null) throw new RangeError("canonicalJson: not a plain object");
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o).sort();
  for (const k of keys) if (/[^\x00-\x7f]/.test(k)) throw new RangeError(`canonicalJson: a non-ASCII key ${JSON.stringify(k)}`);
  return `{${keys.map((k) => `${str(k)}:${write(o[k], inner)}`).join(",")}}`;
}

/** The canonical writing of `value` (spec section 2). */
export function canonicalJson(value: CanonicalValue): string {
  return write(value, []);
}

/** A digest: the lowercase hex sha256 of the UTF-8 bytes of the canonical writing. */
export function sha256Canonical(value: CanonicalValue): string {
  return createHash("sha256").update(canonicalJson(value), "utf8").digest("hex");
}

/** `scores_sha256`: the digest of the scores as one JSON array, in the order given (`[]` included). */
export function scoresSha256(scores: readonly number[]): string {
  return sha256Canonical(scores);
}

/** The digest of a request envelope `{prediction, params, attested?}` as sent (an absent `attested` is omitted). */
export function requestSha256(envelope: { readonly prediction: object; readonly params: object; readonly attested?: object }): string {
  return createHash("sha256").update(write(envelope, []), "utf8").digest("hex");
}
