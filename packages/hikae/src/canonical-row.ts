/**
 * HIKAE canonical writing of F-7 rows and the ordered calibration digest (ADR-CM chantier moteur, lot CM-3b; audit P3
 * S-13 and E-2). Lives in hikae, not in the frozen contracts (rule R-3).
 *
 * S-13: ONE canonicalizer for the F-7 rows, `canonicalRow`: minified JSON, object keys sorted by their UTF-8 bytes (the
 * order of canonicalStringify in packages/monark), every number finite and written as JavaScript writes it (the
 * shortest round-trip decimal: 0 and 1 without a point, 1e-7, 1e+21; -0 is written 0). A non-finite number, undefined,
 * a function, a symbol or a bigint throws a RangeError, never a silent null. The two other canonicalizers keep their
 * domains: calibDigest (sorted float64, the frozen calib_digest field) and the Ukemi book writer (no floats).
 *
 * E-2: `orderedCalibDigest` = the sha256 of the CALIB scores and of the auxiliary sequence, each in time order, written
 * by canonicalRow: byte for byte the scoresSha256 / auxSha256 of the RECHERCHES P2 bench (kata/bench/calibrate.ts
 * seqDigest, registry FORMAT.md), which fixes the time order that calibDigest (sorted) does not. Pure.
 */
import { createHash } from "node:crypto";

/** A value of an F-7 row. */
export type RowValue = null | boolean | number | string | readonly RowValue[] | { readonly [key: string]: RowValue };

const byUtf8 = (a: string, b: string): number => Buffer.from(a, "utf8").compare(Buffer.from(b, "utf8"));

/** S-13: the canonical JSON writing of an F-7 row value (see the module header). */
export function canonicalRow(v: RowValue): string {
  if (v === null || typeof v === "boolean" || typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number") {
    if (!Number.isFinite(v)) throw new RangeError(`canonicalRow: non-finite number ${String(v)}`);
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) return `[${(v as readonly RowValue[]).map(canonicalRow).join(",")}]`;
  if (typeof v !== "object") throw new RangeError(`canonicalRow: not a row value (${typeof v})`);
  const o = v as { readonly [key: string]: RowValue };
  return `{${Object.keys(o).sort(byUtf8).map((k) => `${JSON.stringify(k)}:${canonicalRow(o[k] as RowValue)}`).join(",")}}`;
}

/** E-2: the sha256 of the scores and of the auxiliary sequence, each in time order (P2 bench scoresSha256, auxSha256). */
export function orderedCalibDigest(scores: readonly number[], aux: readonly number[]): { readonly scoresSha256: string; readonly auxSha256: string } {
  const sha = (xs: readonly number[]): string => createHash("sha256").update(canonicalRow(xs)).digest("hex");
  return { scoresSha256: sha(scores), auxSha256: sha(aux) };
}
