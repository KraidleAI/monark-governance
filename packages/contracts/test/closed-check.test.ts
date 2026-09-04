import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertClosedAttestedPrice,
  assertClosedCoverageVerdict,
  assertClosedGateDecision,
  assertClosedPrediction,
} from "../src/index.ts";
import {
  validAttestedPrice,
  validPrediction,
  validVerdictSet,
  validVerdictInterval,
  validGateDecision,
} from "./fixtures.ts";

test("valid instances pass the closed-check", () => {
  assert.doesNotThrow(() => assertClosedAttestedPrice(validAttestedPrice()));
  assert.doesNotThrow(() => assertClosedPrediction(validPrediction()));
  assert.doesNotThrow(() => assertClosedCoverageVerdict(validVerdictSet()));
  assert.doesNotThrow(() => assertClosedCoverageVerdict(validVerdictInterval()));
  assert.doesNotThrow(() => assertClosedGateDecision(validGateDecision()));
});

test("unknown key at root is REFUSED (CleInconnue-style)", () => {
  const bad = { ...validAttestedPrice(), foo: 1 };
  assert.throws(() => assertClosedAttestedPrice(bad), /unknown key 'foo' in AttestedPrice/);
});

test("unknown key in a nested object (utterance) is refused", () => {
  const ap = validAttestedPrice();
  const bad = { ...ap, utterance: { ...ap.utterance, sneaky: 1 } };
  assert.throws(() => assertClosedAttestedPrice(bad), /unknown key 'sneaky' in AttestedPrice\.utterance/);
});

test("unknown key in an attestor element is refused", () => {
  const ap = validAttestedPrice();
  const bad = { ...ap, attestor: [{ identity: "x", key: "ab", extra: 1 }] };
  assert.throws(() => assertClosedAttestedPrice(bad), /unknown key 'extra' in AttestedPrice\.attestor\[0\]/);
});

test("unknown key in the nested verdict of a GateDecision is refused (recursive)", () => {
  const gd = validGateDecision();
  const bad = { ...gd, verdict: { ...gd.verdict, foo: 1 } };
  assert.throws(() => assertClosedGateDecision(bad), /unknown key 'foo' in CoverageVerdict/);
});

test("an unknown region kind is refused", () => {
  const v = validVerdictSet();
  const bad = { ...v, region: { kind: "triangle", a: 1 } };
  assert.throws(() => assertClosedCoverageVerdict(bad), /unknown region kind 'triangle'/);
});
