import { test } from "node:test";
import assert from "node:assert/strict";
import { findForbiddenKey, assertNoForbiddenKey, FORBIDDEN_KEYS, serializeGateDecision } from "../src/index.ts";
import { validVerdictSet, validGateDecision } from "./fixtures.ts";

test("a clean object has no forbidden key", () => {
  assert.equal(findForbiddenKey({ a: 1, b: { c: [1, 2, { d: "ok" }] } }), null);
});

test("a valid verdict has no forbidden key", () => {
  assert.equal(findForbiddenKey(validVerdictSet()), null);
});

test("forbidden key at root is found", () => {
  assert.equal(findForbiddenKey({ p_correct: 0.9 }), "$.p_correct");
});

test("forbidden key nested deep is found (recursive, not root-only)", () => {
  assert.equal(findForbiddenKey({ a: { b: { confidence: 0.5 } } }), "$.a.b.confidence");
});

test("forbidden key inside an array element is found", () => {
  assert.equal(findForbiddenKey({ items: [{ ok: 1 }, { hallucination: true }] }), "$.items[1].hallucination");
});

test("assertNoForbiddenKey THROWS with the path (the test that must fail on violation)", () => {
  assert.throws(() => assertNoForbiddenKey({ x: { truth: 1 } }), /forbidden key at \$\.x\.truth/);
});

test("every FORBIDDEN_KEY is individually caught at any depth", () => {
  for (const k of FORBIDDEN_KEYS) {
    assert.throws(
      () => assertNoForbiddenKey({ wrapper: { [k]: 1 } }),
      new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `expected forbidden key '${k}' to be caught`,
    );
  }
});

test("a forbidden key inside a GateDecision's nested verdict is caught end-to-end (G2 M4)", () => {
  const gd = validGateDecision();
  const bad = { ...gd, verdict: { ...gd.verdict, p_correct: 0.9 } };
  // The recursive guard locates it at the nested path...
  assert.equal(findForbiddenKey(bad), "$.verdict.p_correct");
  // ...and serializeGateDecision REFUSES it (closed-check + guard) rather than emitting it.
  assert.throws(() => serializeGateDecision(bad), /p_correct/);
});
