// scripts/lib/calib-digest-provenance.d.mts -- type surface of the provenance tool (outside the contract; lot CM-3c-2). Node ignores it.
/** hex(SHA-256(concat over ascending-sorted scores of float64_be(s))), -0 written as +0; throws on a non-finite score. */
export function calibDigest(scores: readonly number[]): string;
