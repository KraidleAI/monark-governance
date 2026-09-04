import { test } from "node:test";
import assert from "node:assert/strict";
import { calibDigest } from "../src/index.ts";

test("digest is 64 lowercase hex chars", () => {
  assert.match(calibDigest([0, 1, 0, 1]), /^[0-9a-f]{64}$/);
});

test("order-independent (scores are sorted ascending before hashing)", () => {
  assert.equal(calibDigest([1, 0, 1, 0, 0]), calibDigest([0, 0, 0, 1, 1]));
});

test("different score multisets give different digests", () => {
  assert.notEqual(calibDigest([0, 0, 1]), calibDigest([0, 1, 1]));
});

test("deterministic across calls", () => {
  assert.equal(calibDigest([0.2, 0.5, 0.1]), calibDigest([0.2, 0.5, 0.1]));
});

test("negative zero is normalized (same real → same digest)", () => {
  assert.equal(calibDigest([-0]), calibDigest([0]));
  assert.equal(calibDigest([0, -0]), calibDigest([-0, 0]));
  assert.equal(calibDigest([-0, 1]), calibDigest([0, 1]));
});

// Cross-language oracles (ADR-M001 C5): a Python/Rust binder MUST reproduce these
// via SHA-256( concat float64_be(s) for s in sorted-ascending(scores) ), hex.
test("known vector [0.0, 1.0]", () => {
  assert.equal(
    calibDigest([0, 1]),
    "1e47beee7f4175a863385dc2f9c8278138e35f0caa43a5467a523519f1e91081",
  );
});

test("empty scores → SHA-256 of the empty byte string", () => {
  assert.equal(
    calibDigest([]),
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );
});

test("a non-finite score is refused", () => {
  assert.throws(() => calibDigest([0, Number.NaN, 1]), /non-finite/);
  assert.throws(() => calibDigest([0, Number.POSITIVE_INFINITY]), /non-finite/);
});
