// packages/monark/test/cbor-canonique.test.ts — ADR-M003 D10 / ADR-M005 D3.
//
// Decodes the REAL, sha256-pinned Shogen batch fixtures/s3-binance.lot.cbor and asserts every decoded
// field AGAINST AN INDEPENDENT ORACLE: fixtures/s3-binance.verdict.txt, the re-played output of the
// Rust shogen-verifier (see fixtures/PROVENANCE-s3-binance.md). Each expected value is asserted to
// appear verbatim in that verifier output, so the test is NOT circular (it does not pin values read
// back from our own decoder). It also asserts round-trip byte-equality and that non-canonical /
// corrupted copies are rejected. Mutant inputs are built on COPIES; the fixture file is never written,
// and its sha256 is re-checked unchanged at the end.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { decodeTemoignageCbor, encodeTemoignageCanonical, CborError } from "../src/cbor-canonique.ts";

const FIX = fileURLToPath(new URL("../../../fixtures", import.meta.url));

// sha256 pins (fixtures/PROVENANCE-s3-binance.md; match the Shōgen source, ADR-M003 D3 l.55).
const LOT_SHA256 = "8700d88f87253f0fd8496402601dc7326362a2cd9e6614a9bf44b79052f1e5a3";

// Expected decoded values — read off the Shogen verifier output (s3-binance.verdict.txt), NOT our decoder.
const EXPECT = {
  subject: "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
  transport: "tlsn-mpc/1",
  clock: "tlsn-mpc/1:connection_info.time",
  instant: 1786594228n,
  hashHex: "c28a41ce87dafcd313d301ab56472b6f3cd1b3d81d903da787b0ca9dfffbeea0",
  attestorIdentity: "shogen:attestateur-de-demonstration-s3",
  attestorKeyLength: 71, // verifier: pinned key of 71 octets
  transportProofLength: 6034, // verifier: transport proof of 6034 octets
  residual: ["A(notary-neutrality)", "A(self-attestation)"],
} as const;

// Structural byte boundaries in the canonical batch (top-level pairs), used only to build a
// deliberately key-UNSORTED copy: subject pair = [1,69), attestor pair = [69,206), residual key at 206.
const ATTESTOR_START = 69;
const RESIDUAL_START = 206;

function readBytes(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(FIX, name)));
}
function sha256Hex(u: Uint8Array): string {
  return createHash("sha256").update(u).digest("hex");
}
function toHex(u: Uint8Array): string {
  return Buffer.from(u).toString("hex");
}
function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

const LOT = readBytes("s3-binance.lot.cbor");
const VERDICT = readFileSync(join(FIX, "s3-binance.verdict.txt"), "utf8");

test("cbor_canonique_decodes_pinned_s3_binance — input sha256 is pinned", () => {
  assert.equal(sha256Hex(LOT), LOT_SHA256, "the committed lot.cbor must be the pinned Shogen fixture");
  assert.equal(LOT.length, 7399, "expected the 7399-octet canonical batch");
});

test("cbor_canonique_decodes_pinned_s3_binance — fields match the Shogen verifier output (independent oracle)", () => {
  const t = decodeTemoignageCbor(LOT);

  // subject / transport / observed_at / attestor / transport_proof: each value appears verbatim in the
  // re-played verifier verdict (s3-binance.verdict.txt) — so agreement is with the Rust binary, not us.
  assert.equal(t.subject, EXPECT.subject);
  assert.ok(VERDICT.includes(t.subject), "subject must appear in the verifier verdict");

  assert.equal(t.transport, EXPECT.transport);
  assert.ok(VERDICT.includes(t.transport), "transport must appear in the verifier verdict");

  assert.equal(t.observed_at.clock, EXPECT.clock);
  assert.ok(VERDICT.includes(t.observed_at.clock), "clock must appear in the verifier verdict");

  assert.equal(t.observed_at.instant, EXPECT.instant);
  assert.ok(VERDICT.includes(t.observed_at.instant.toString()), "instant must appear in the verifier verdict");

  assert.equal(t.attestor.length, 1);
  assert.equal(t.attestor[0]?.identity, EXPECT.attestorIdentity);
  assert.ok(VERDICT.includes(EXPECT.attestorIdentity), "attestor identity must appear in the verifier verdict");
  assert.equal(t.attestor[0]?.key.length, EXPECT.attestorKeyLength);

  assert.equal(t.transport_proof.length, EXPECT.transportProofLength);
  assert.ok(VERDICT.includes(String(EXPECT.transportProofLength)), "transport-proof length must appear in the verdict");

  // residual: the CBOR field is exactly the first two of the three residuals the verdict names
  // (the third, A(transport-check-delegated), is appended by the verifier, not carried by the batch).
  assert.deepEqual([...t.residual], EXPECT.residual);
  for (const r of EXPECT.residual) assert.ok(VERDICT.includes(r), `residual ${r} must appear in the verdict`);

  // utterance: the stored empreinte equals what the verifier printed, AND it is the SHA-256 of the
  // carried octets (octets_recalcules = true; ADR-0005 rule 1) — an independent recomputation.
  assert.equal(toHex(t.utterance.hash), EXPECT.hashHex);
  assert.ok(VERDICT.includes(EXPECT.hashHex), "utterance empreinte must appear in the verifier verdict");
  assert.ok(t.utterance.bytes !== undefined, "this fixture carries the utterance octets");
  assert.equal(sha256Hex(t.utterance.bytes), EXPECT.hashHex, "sha256(utterance.bytes) must equal the stored empreinte");
});

test("cbor_canonique_roundtrip_byte_equal — encode(decode(b)) === b", () => {
  const t = decodeTemoignageCbor(LOT);
  const re = encodeTemoignageCanonical(t);
  assert.equal(re.length, LOT.length);
  assert.equal(toHex(re), toHex(LOT), "canonical re-encoding must reproduce the exact input bytes");
});

test("cbor_canonique_rejects_non_canonical — corrupted / non-canonical copies throw CborError", () => {
  // (1) corrupt the top-level map header 0xa7 -> 0xa8 (declares 8 entries): a single corrupted byte.
  const badHeader = new Uint8Array(LOT);
  badHeader[0] = 0xa8;
  assert.throws(() => decodeTemoignageCbor(badHeader), CborError, "corrupted top-level header must be rejected");

  // (2) a trailing byte after a complete batch is not canonical.
  const trailing = concatBytes([LOT, Uint8Array.of(0x00)]);
  assert.throws(() => decodeTemoignageCbor(trailing), CborError, "trailing byte must be rejected");

  // (3) truncation: drop the last byte -> premature end.
  const truncated = LOT.subarray(0, LOT.length - 1);
  assert.throws(() => decodeTemoignageCbor(truncated), CborError, "truncated batch must be rejected");

  // (4) non-preferred integer: rewrite the subject length 0x78 0x3a (58 on 1 byte) as 0x79 0x00 0x3a
  //     (58 on 2 bytes). Valid CBOR, but not the shortest form -> rejected by the canonical subset.
  const nonPreferred = concatBytes([LOT.subarray(0, 9), Uint8Array.of(0x79, 0x00, 0x3a), LOT.subarray(11)]);
  assert.throws(() => decodeTemoignageCbor(nonPreferred), CborError, "non-preferred integer must be rejected");

  // (5) invalid UTF-8: set a byte inside the ASCII subject URL to 0xff.
  const badUtf8 = new Uint8Array(LOT);
  badUtf8[20] = 0xff;
  assert.throws(() => decodeTemoignageCbor(badUtf8), CborError, "invalid UTF-8 text must be rejected");

  // (6) unsorted map keys: swap the subject and attestor top-level pairs so keys decrease.
  const unsorted = concatBytes([
    LOT.subarray(0, 1),
    LOT.subarray(ATTESTOR_START, RESIDUAL_START),
    LOT.subarray(1, ATTESTOR_START),
    LOT.subarray(RESIDUAL_START),
  ]);
  assert.equal(unsorted.length, LOT.length);
  assert.throws(() => decodeTemoignageCbor(unsorted), CborError, "unsorted map keys must be rejected");

  // the fixture on disk is untouched by the mutants above (they operate on copies).
  assert.equal(sha256Hex(readBytes("s3-binance.lot.cbor")), LOT_SHA256, "fixture sha256 must be unchanged");
});
