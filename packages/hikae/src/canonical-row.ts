/**
 * HIKAE canonical writing of policy rows and the ordered calibration digest. Lives in hikae, not in the frozen
 * contracts.
 *
 * ONE canonicalizer for the policy rows, `canonicalRow`: minified JSON, object keys sorted by their UTF-8 bytes,
 * every number finite and written as JavaScript writes it (the
 * shortest round-trip decimal: 0 and 1 without a point, 1e-7, 1e+21; -0 is written 0). A non-finite number, undefined,
 * a function, a symbol or a bigint VALUE throws a RangeError, never a silent null. Outside the declared RowValue type it
 * is not a validator: symbol keys, extra (non-index) properties of arrays and non-enumerable properties are dropped,
 * getters are called, a Proxy is accepted, and keys get no Unicode normalisation. calibDigest keeps its own
 * domain (scripts/lib/calib-digest-provenance.mjs: sorted float64, the frozen calib_digest field).
 *
 * `orderedCalibDigest` = the sha256 of the CALIB scores and of the auxiliary sequence, each in time order, written
 * by canonicalRow (vectors pinned in test/cm3b-engine.test.ts), which fixes the time order that calibDigest (sorted)
 * does not. Pure.
 */
import { createHash } from "node:crypto";

/** A value of a policy row. */
export type RowValue = null | boolean | number | string | readonly RowValue[] | { readonly [key: string]: RowValue };

const byUtf8 = (a: string, b: string): number => Buffer.from(a, "utf8").compare(Buffer.from(b, "utf8"));

/** A JSON string of a well-formed string (a lone surrogate would make the key order and the bytes ill-defined). */
function str(t: string): string {
  if (!t.isWellFormed()) throw new RangeError("canonicalRow: a string or key with a lone surrogate");
  return JSON.stringify(t);
}

/**
 * canonicalRow: the canonical JSON writing of a policy row value (see the module header). Refused (RangeError): a non-finite
 * number, a sparse array, an object that is not plain (prototype Object.prototype or null: no Date, Map, boxed number),
 * a string or key that is not well formed, a cycle, and any other type.
 */
export function canonicalRow(v: RowValue): string {
  return write(v, []);
}

function write(v: RowValue, seen: readonly object[]): string {
  if (v === null || typeof v === "boolean") return JSON.stringify(v);
  if (typeof v === "string") return str(v);
  if (typeof v === "number") {
    if (!Number.isFinite(v)) throw new RangeError(`canonicalRow: non-finite number ${String(v)}`);
    return JSON.stringify(v);
  }
  if (typeof v !== "object") throw new RangeError(`canonicalRow: not a row value (${typeof v})`);
  if (seen.includes(v)) throw new RangeError("canonicalRow: a cycle");
  const inner = [...seen, v];
  if (Array.isArray(v)) {
    const a = v as readonly RowValue[];
    for (let i = 0; i < a.length; i++) if (!(i in a)) throw new RangeError(`canonicalRow: a sparse array (hole at ${String(i)})`);
    return `[${a.map((x) => write(x, inner)).join(",")}]`;
  }
  const proto: unknown = Object.getPrototypeOf(v);
  if (proto !== Object.prototype && proto !== null) throw new RangeError("canonicalRow: not a plain object");
  const o = v as { readonly [key: string]: RowValue };
  return `{${Object.keys(o).sort(byUtf8).map((k) => `${str(k)}:${write(o[k] as RowValue, inner)}`).join(",")}}`;
}

/** The sha256 of the scores and of the auxiliary sequence, each in time order (fields scoresSha256, auxSha256). */
export function orderedCalibDigest(scores: readonly number[], auxiliary: readonly number[]): { readonly scoresSha256: string; readonly auxSha256: string } {
  const sha = (xs: readonly number[]): string => createHash("sha256").update(canonicalRow(xs)).digest("hex");
  return { scoresSha256: sha(scores), auxSha256: sha(auxiliary) };
}
