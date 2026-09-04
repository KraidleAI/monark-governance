import { createHash } from "node:crypto";

/**
 * calib_digest (ADR-M001 C5) — recalculability by reference, deterministic across
 * TS / Python / Rust.
 *
 *   calib_digest = hex( SHA-256( concat over ascending-sorted scores of float64_be(s) ) )
 *
 * where float64_be(s) = the 8-byte IEEE-754 double-precision, big-endian encoding.
 * Ascending sort matches the split-conformal quantile computation. Mirrors the
 * Shogen ADR-0005 discipline ("hash always carried, bytes optional"): the verdict
 * always carries this digest, the scores array is optional payload.
 */
export function calibDigest(scores: readonly number[]): string {
  for (const s of scores) {
    if (!Number.isFinite(s)) {
      throw new Error(`calibDigest: non-finite score ${String(s)} — scores must be finite reals.`);
    }
  }
  const sorted = [...scores].sort((a, b) => a - b);
  const buf = Buffer.allocUnsafe(sorted.length * 8);
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i] as number;
    // Normalize negative zero: -0 and +0 are the same real but differ in the
    // IEEE-754 sign bit, so [0, -0] and [-0, 0] (same multiset) would hash
    // differently. Cross-language binders MUST do the same (e.g. Python: s or 0.0).
    buf.writeDoubleBE(s === 0 ? 0 : s, i * 8);
  }
  return createHash("sha256").update(buf).digest("hex");
}
