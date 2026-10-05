/**
 * The provenance tool scripts/lib/calib-digest-provenance.mjs (contract 1.1.0, plan r3 section 5.5; lot CM-3c-2) equals calibDigest of
 * @monark/contracts while the contract exports it: same digest on every vector (order, duplicates, -0, empty, subnormal, large, seeded
 * random), same refusal of a non-finite score.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calibDigest } from "@monark/contracts";
import { calibDigest as provenanceDigest } from "../scripts/lib/calib-digest-provenance.mjs";
import { mulberry32 } from "@monark/hikae";

// killer: scripts/lib/calib-digest-provenance.mjs:16 CONST "s === 0 ? 0 : s" -> "s"
test("calib_digest_provenance_equals_the_contract_function", () => {
  const rnd = mulberry32(37);
  const vectors: number[][] = [[], [0, 1], [1, 0], [-0], [0, -0, 1], [5e-324, -1e308, 0.1, 0.1], [126184298996, 0.0001, -3]];
  for (let i = 0; i < 20; i++) vectors.push(Array.from({ length: 1 + Math.floor(rnd() * 40) }, () => (rnd() - 0.5) * 10 ** Math.floor(rnd() * 12)));
  for (const v of vectors) assert.equal(provenanceDigest(v), calibDigest(v), JSON.stringify(v));
  assert.equal(provenanceDigest([0, 1]), "1e47beee7f4175a863385dc2f9c8278138e35f0caa43a5467a523519f1e91081", "C5 oracle [0, 1]");
  for (const bad of [Number.NaN, Number.POSITIVE_INFINITY]) assert.throws(() => provenanceDigest([0, bad]), /non-finite/);
});
