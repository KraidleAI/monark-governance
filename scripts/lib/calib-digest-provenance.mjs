// scripts/lib/calib-digest-provenance.mjs -- calibDigest as a provenance tool outside the contract (contract 1.1.0, plan r3 section 5.5,
// ADR-M001 D9-ter; lot CM-3c-2): the statements of packages/contracts/src/calib-digest.ts (ADR-M001 C5), types and comments removed, so
// the recorded digests stay reproducible once block C retires it from @monark/contracts. Parity: test/calib-digest-provenance.test.ts.
import { createHash } from "node:crypto";

export function calibDigest(scores) {
  for (const s of scores) {
    if (!Number.isFinite(s)) {
      throw new Error(`calibDigest: non-finite score ${String(s)} — scores must be finite reals.`);
    }
  }
  const sorted = [...scores].sort((a, b) => a - b);
  const buf = Buffer.allocUnsafe(sorted.length * 8);
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    buf.writeDoubleBE(s === 0 ? 0 : s, i * 8);
  }
  return createHash("sha256").update(buf).digest("hex");
}
