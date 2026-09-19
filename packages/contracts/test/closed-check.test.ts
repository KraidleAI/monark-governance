import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertClosedAttestedPrice,
  assertClosedAttestedBook,
  assertClosedCoverageVerdict,
  assertClosedGateDecision,
  assertClosedPrediction,
} from "../src/index.ts";
import {
  validAttestedPrice,
  validAttestedBook,
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

test("assertClosedAttestedBook passes a valid book and refuses an unknown envelope key (price/peg_score, ADR-U1b D1)", () => {
  const ok = validAttestedBook();
  assert.doesNotThrow(() => assertClosedAttestedBook(ok));
  // a price or a peg_score smuggled onto the envelope is a CleInconnue-style refusal (closed contract).
  assert.throws(() => assertClosedAttestedBook({ ...ok, price: "1000" }), /unknown key 'price' in AttestedBook/);
  assert.throws(() => assertClosedAttestedBook({ ...ok, peg_score: 0.9 }), /unknown key 'peg_score' in AttestedBook/);
});

test("assertClosedAttestedBook is recursive — unknown key in a nested object / array element is refused (C-8)", () => {
  const ok = validAttestedBook();
  assert.throws(() => assertClosedAttestedBook({ ...ok, block: { ...ok.block, price: 1 } }), /unknown key 'price' in AttestedBook\.block/);
  assert.throws(() => assertClosedAttestedBook({ ...ok, abstain: { ...ok.abstain, mid: "1" } }), /unknown key 'mid' in AttestedBook\.abstain/);
  const badSource = { ...ok, oracle_sources: [{ asset: "0x" + "3".repeat(40), source: "0x" + "4".repeat(40), description: "x", mid: "1" }] };
  assert.throws(() => assertClosedAttestedBook(badSource), /unknown key 'mid' in AttestedBook\.oracle_sources\[0\]/);
});

// O-3 (ADR-U1b D6, lot U-1b-b): extend the recursive `sneak` probe to the sub-objects the base suite did not
// exercise — eligible, providers[0], quorum, attestor, observed_at (before this, 4/8 were covered). A mutant
// that cuts the closed-check recursion one level (drops these assertOnlyKeys calls) reddens this test.
test("assertClosedAttestedBook recursion covers eligible/providers/quorum/attestor/observed_at (O-3)", () => {
  const ok = validAttestedBook();
  assert.throws(() => assertClosedAttestedBook({ ...ok, eligible: { ...ok.eligible, price: 1 } }), /unknown key 'price' in AttestedBook\.eligible/);
  assert.throws(() => assertClosedAttestedBook({ ...ok, providers: [{ name: "drpc", method: "eth_call", ok: true, mid: "1" }] }), /unknown key 'mid' in AttestedBook\.providers\[0\]/);
  assert.throws(() => assertClosedAttestedBook({ ...ok, quorum: { ...ok.quorum, price: 1 } }), /unknown key 'price' in AttestedBook\.quorum/);
  assert.throws(() => assertClosedAttestedBook({ ...ok, attestor: { ...ok.attestor, mid: "1" } }), /unknown key 'mid' in AttestedBook\.attestor/);
  assert.throws(() => assertClosedAttestedBook({ ...ok, observed_at: { ...ok.observed_at, price: 1 } }), /unknown key 'price' in AttestedBook\.observed_at/);
});
