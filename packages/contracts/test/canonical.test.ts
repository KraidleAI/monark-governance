/**
 * Canonical writing of contract 1.1.0 (spec section 2; lot CM-3c-1, block A, docs/G0-lot-cm-3c-1.md). The vector
 * digests are pinned by sha256sum on the literal texts (printf '%s' '<text>' | sha256sum), never by the code under
 * test. Parity with orderedCalibDigest of packages/hikae on finite scores (the P2 bench writing, FORMAT.md "Digests").
 * Each test names its killer above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { orderedCalibDigest } from "@monark/hikae";
import { canonicalJson, sha256Canonical, scoresSha256, requestSha256 } from "../src/canonical.ts";

const sha = (text: string): string => createHash("sha256").update(text, "utf8").digest("hex");

// killer: packages/contracts/src/canonical.ts:37 CONST "Object.keys(o).sort()" -> "Object.keys(o)"
test("canonical_spec_vector_and_number_writing", () => {
  assert.equal(canonicalJson({ b: 1, a: [0.1, 1e-7, -0] }), '{"a":[0.1,1e-7,0],"b":1}');
  assert.equal(sha256Canonical({ b: 1, a: [0.1, 1e-7, -0] }), "5f092fcffdb6f012f59af4d9214b9875fc47af0d59a913f2026c7b75a9403e47");
  assert.equal(canonicalJson([0, 1, 1e21, 1.5e-7, 123456789012, -2.5]), "[0,1,1e+21,1.5e-7,123456789012,-2.5]");
  assert.equal(canonicalJson({ z: null, B: "\u00e9", a: { d: true, c: false } }), '{"B":"\u00e9","a":{"c":false,"d":true},"z":null}');
});

// killer: packages/contracts/src/canonical.ts:38 CONST "\\x7f" -> "\\xff"
test("canonical_refuses_a_non_ascii_key", () => {
  assert.throws(() => canonicalJson({ "\u00e9": 1 }), /non-ASCII key/);
  assert.throws(() => canonicalJson({ a: { "\u00a0b": 1 } }), /non-ASCII key/);
  assert.equal(canonicalJson({ "\x7f": 1 }), '{"\x7f":1}');
});

// killer: packages/contracts/src/canonical.ts:16 SDL "if (!t.isWellFormed())" -> ""
test("canonical_refuses_a_lone_surrogate", () => {
  assert.throws(() => canonicalJson(["\ud800"]), /lone surrogate/);
  assert.throws(() => canonicalJson({ a: "x\udc00" }), /lone surrogate/);
  assert.equal(canonicalJson(["\ud83d\ude00"]), '["\ud83d\ude00"]');
});

// killer: packages/contracts/src/canonical.ts:28 SDL "if (seen.includes(v))" -> ""
test("canonical_refuses_what_json_cannot_write", () => {
  const cycle: Record<string, unknown> = {};
  cycle["self"] = cycle;
  assert.throws(() => canonicalJson(cycle as never), /a cycle/);
  const bad: readonly unknown[] = [NaN, Infinity, undefined, () => 0, Symbol("s"), 1n, new Date(0), new Map(), [1, , 2]];
  for (const v of bad) assert.throws(() => canonicalJson([v] as never), RangeError, String(typeof v));
  const shared = [1];
  assert.equal(canonicalJson({ a: shared, b: shared }), '{"a":[1],"b":[1]}', "a shared array is not a cycle");
});

// killer: packages/contracts/src/canonical.ts:54 CONST "sha256Canonical(scores)" -> "sha256Canonical([...scores].sort())"
test("scores_sha256_keeps_the_order_and_parity_with_hikae", () => {
  assert.equal(scoresSha256([]), "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945");
  assert.equal(scoresSha256([0.5, 1, 0]), sha("[0.5,1,0]"));
  assert.notEqual(scoresSha256([0.5, 1, 0]), scoresSha256([0, 0.5, 1]), "a permutation changes the digest");
  const scores = [0.25, -0, 3, 1e-9, 0.1 + 0.2, 1e21, 7];
  assert.equal(scoresSha256(scores), orderedCalibDigest(scores, []).scoresSha256);
});

// killer: packages/contracts/src/canonical.ts:59 CONST "write(envelope, [])" -> "JSON.stringify(envelope)"
test("request_sha256_digests_the_envelope_as_sent", () => {
  const prediction = { schema_version: "1.1.0", task_class: "c", yhat: 1, predictor_id: "p", produced_at: "2026-10-04T00:00:00Z" };
  const params = { tau: 1, alpha: 0.1, nMin: 50 };
  const text = '{"params":{"alpha":0.1,"nMin":50,"tau":1},"prediction":{"predictor_id":"p","produced_at":"2026-10-04T00:00:00Z","schema_version":"1.1.0","task_class":"c","yhat":1}}';
  assert.equal(requestSha256({ prediction, params }), sha(text));
  const attested = { subject: "s" };
  assert.equal(requestSha256({ prediction, params, attested }), sha(`{"attested":{"subject":"s"},${text.slice(1)}`));
});
