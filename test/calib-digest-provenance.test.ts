/**
 * The provenance tool scripts/lib/calib-digest-provenance.mjs (contract 1.1.0, plan r3 section 5.5; lot CM-3c-2) keeps the C5 vectors once
 * calibDigest has left @monark/contracts (lot CM-3c-3a, ADR-M001 D9-ter): the digest over the 27 vectors of lot CM-3c-2 (order, duplicates,
 * -0, empty, subnormal, large, seeded random) is pinned to the value the contract function gave at the base of the lot (5a491fa6); a
 * non-finite score is refused.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as contracts from "@monark/contracts";
import { calibDigest as provenanceDigest } from "../scripts/lib/calib-digest-provenance.mjs";
import { mulberry32 } from "@monark/hikae";

/** sha256 of the 27 vector digests joined by "\n", computed by calibDigest of @monark/contracts at 5a491fa6. */
const VECTORS_DIGEST = "de78a2a76f2f099ecc50b753fbfcbf59f72d80c1d0f8b8d545ae47edf4c073b7";

// killer: scripts/lib/calib-digest-provenance.mjs:16 CONST "s === 0 ? 0 : s" -> "s"
test("calib_digest_provenance_keeps_the_c5_vectors", () => {
  assert.equal("calibDigest" in contracts, false, "calibDigest left @monark/contracts (D9-ter)");
  const rnd = mulberry32(37);
  const vectors: number[][] = [[], [0, 1], [1, 0], [-0], [0, -0, 1], [5e-324, -1e308, 0.1, 0.1], [126184298996, 0.0001, -3]];
  for (let i = 0; i < 20; i++) vectors.push(Array.from({ length: 1 + Math.floor(rnd() * 40) }, () => (rnd() - 0.5) * 10 ** Math.floor(rnd() * 12)));
  assert.equal(vectors.length, 27);
  assert.equal(createHash("sha256").update(vectors.map((v) => provenanceDigest(v)).join("\n")).digest("hex"), VECTORS_DIGEST);
  assert.equal(provenanceDigest([0, 1]), "1e47beee7f4175a863385dc2f9c8278138e35f0caa43a5467a523519f1e91081", "C5 oracle [0, 1]");
  for (const bad of [Number.NaN, Number.POSITIVE_INFINITY]) assert.throws(() => provenanceDigest([0, bad]), /non-finite/);
});
