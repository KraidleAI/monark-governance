import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertClosedAttestedPrice,
  assertClosedAttestedBook,
  assertClosedCoverageVerdict,
  assertClosedGateDecision,
  assertClosedPrediction,
  scoresSha256,
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

// Contract 1.1.0 (lot CM-3c-3a, spec section 5): the couplings of the verdict, checked by the closed-check before it is sent.
const verdictCheck = (v: unknown) => () => assertClosedCoverageVerdict(v);
const NO_REGION = { region: null, qhat: null, abstain: true, reason: "under_calib" } as const;

// killer: packages/contracts/src/closed-check.ts:145 SDL "if ((region === null) !== (qhat === null)) fail(\"region\", \"qhat\");" -> ""
test("verdict_1_1_0_region_null_iff_qhat_null_and_abstains", () => {
  const none = { ...validVerdictSet(), ...NO_REGION };
  assert.doesNotThrow(verdictCheck(none));
  assert.throws(verdictCheck({ ...none, qhat: 1 }), /region breaks its coupling with qhat/);
  assert.throws(verdictCheck({ ...validVerdictSet(), qhat: null, abstain: true, reason: "under_calib" }), /region breaks its coupling with qhat/);
  assert.throws(verdictCheck({ ...none, abstain: false }), /region breaks its coupling with reason/);
  assert.throws(verdictCheck({ ...none, reason: "covered" }), /region breaks its coupling with reason/);
});

// killer: packages/contracts/src/closed-check.ts:147 SDL "if (reason.startsWith(\"calib_\") && abstain !== true) fail(\"reason\", \"abstain\");" -> ""
test("verdict_1_1_0_calib_reason_abstains", () => {
  const silence = { ...validVerdictSet(), region: { kind: "set", labels: ["up", "down"], label_schema: "up|down" }, reason: "calib_silence", abstain: true };
  assert.doesNotThrow(verdictCheck(silence));
  assert.doesNotThrow(verdictCheck({ ...validVerdictSet(), ...NO_REGION, reason: "calib_vetoed" }));
  assert.throws(verdictCheck({ ...silence, abstain: false }), /reason breaks its coupling with abstain/);
  assert.throws(verdictCheck({ ...silence, reason: "calib_retired", abstain: false }), /reason breaks its coupling with abstain/);
});

// killer: packages/contracts/src/closed-check.ts:148 SDL "if ((scale !== null) !== (unit === \"scale\")) fail(\"scale\", \"qhat_unit\");" -> ""
test("verdict_1_1_0_scale_iff_scale_unit", () => {
  const scaled = { ...validVerdictInterval(), qhat_unit: "scale", scale: 0.02 };
  assert.doesNotThrow(verdictCheck(scaled));
  assert.throws(verdictCheck({ ...validVerdictInterval(), scale: 0.02 }), /scale breaks its coupling with qhat_unit/);
  assert.throws(verdictCheck({ ...scaled, scale: null }), /scale breaks its coupling with qhat_unit/);
});

// killer: packages/contracts/src/closed-check.ts:150 SDL "if ((cellKey === null) !== (tableSha === null)) fail(\"cell_key\", \"policy_table_sha256\");" -> ""
test("verdict_1_1_0_cell_key_couplings", () => {
  assert.doesNotThrow(verdictCheck({ ...validVerdictInterval(), policy_row_sha256: null }));
  assert.throws(verdictCheck({ ...validVerdictSet(), policy_row_sha256: "b".repeat(64) }), /policy_row_sha256 breaks its coupling with cell_key/);
  assert.throws(verdictCheck({ ...validVerdictSet(), policy_table_sha256: "c".repeat(64) }), /cell_key breaks its coupling with policy_table_sha256/);
  assert.throws(verdictCheck({ ...validVerdictInterval(), policy_row_sha256: null, policy_table_sha256: null }), /cell_key breaks its coupling with policy_table_sha256/);
});

// killer: packages/contracts/src/closed-check.ts:151 CONST "scoresSha256(scores as number[])" -> "scoresSha256([...(scores as number[])].sort((a, b) => a - b))"
test("verdict_1_1_0_scores_digest_matches_scores", () => {
  const v = validVerdictSet();
  assert.doesNotThrow(verdictCheck(v));
  const sorted = [...(v.scores ?? [])].sort((a, b) => a - b);
  assert.throws(verdictCheck({ ...v, scores_sha256: scoresSha256(sorted) }), /scores_sha256 breaks its coupling with scores/);
  assert.throws(verdictCheck({ ...v, scores: [1, 0, 0, 0, 1] }), /scores_sha256 breaks its coupling with scores/);
});

// killer: packages/contracts/src/enums.ts:33 CONST "[\"upstream_timeout\", \"attestation_absent\", \"attestation_refused\"," -> "[\"attestation_absent\", \"attestation_refused\","
test("verdict_1_1_0_reserved_reasons_admit_no_region", () => {
  for (const reason of ["upstream_timeout", "attestation_absent", "attestation_refused", "binding_broken"]) assert.doesNotThrow(verdictCheck({ ...validVerdictSet(), ...NO_REGION, reason }), reason);
});
