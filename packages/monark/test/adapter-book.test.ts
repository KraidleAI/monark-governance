// packages/monark/test/adapter-book.test.ts — oracles for the Ukemi AttestedBook adapter PAIR (ADR-U1b D5/D6).
//
// The fixture packages/monark/test/fixtures/attested-book-weth.json is BUILT FROM the WETH book recorder
// (apps/sentinel weth-book.fixture.json @ block 23545087): it is `serializeAttestedBook(toAttestedBook(recordBook(...)))`,
// so its `book_digest`/`holders_digest`/`block` are the recorder's real outputs. The tests ASSERT those against the
// recorder PIN of apps/sentinel/test/ukemi.test.ts (NOT against the fixture itself, C-6). PROVENANCE of the fixture:
// `attestor.key = "deadbeef"` is the K-1 placeholder and `attestor.sig` is ABSENT (asserted below); `recorder_revision`
// is a declared placeholder (provenance, not pinned). The composition test re-derives it live from the recorder.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import {
  fromAttestedBook,
  toAttestedBook,
  isBookError,
  BOOK_LABEL,
  bookDigest,
  canonicalAttestedBook,
  attestedBookDigest,
  NonCanonicalNumberError,
  type BookOutput,
  type BookError,
  type AttestedBookContext,
  type CanonicalEnvelope,
} from "@monark/monark";
import { serializeAttestedBook } from "@monark/contracts";
import type { AttestedBook } from "@monark/contracts";
import { recordBook } from "../../../apps/sentinel/src/ukemi/book.ts";
import { CLUSTER_WETH } from "../../../apps/sentinel/src/ukemi/clusters.ts";
import type { UkemiReader, LogEntry } from "../../../apps/sentinel/src/ukemi/rpc2.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const FIXTURE = readFileSync(join(HERE, "fixtures", "attested-book-weth.json"), "utf8");

// The recorder PIN — copied from apps/sentinel/test/ukemi.test.ts (the digests recomputed at write time there).
const PIN = {
  book_digest: "034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921",
  holders_digest: "529bf2b8ba33201d1735193729ddbccac5e0ac20032073e77a03767de31bf110",
};

// The recorder fixture (its calls/logs) — the composition oracle replays it live, no network.
interface FixtureLog { blockNumber: string; logIndex: string; transactionHash: string; topics: string[]; data: string; }
interface RecFixture { block: number; block_hash: string; block_ts: number; finalized_block: number; enumeration_logs: FixtureLog[]; calls: Record<string, string>; }
const FX = JSON.parse(readFileSync(join(HERE, "..", "..", "..", "apps", "sentinel", "test", "fixtures", "ukemi", "weth-book.fixture.json"), "utf8")) as RecFixture;
function recorderReader(): UkemiReader {
  return {
    ethCall(to: string, data: string) { const k = `${to.toLowerCase()}|${data.toLowerCase()}`; const v = FX.calls[k]; if (v === undefined) return Promise.reject(new Error(`fixture miss ${k}`)); return Promise.resolve(v); },
    getLogsRange() { return Promise.resolve(FX.enumeration_logs as unknown as LogEntry[]); },
    blockAt() { return Promise.resolve({ hash: FX.block_hash, ts: FX.block_ts }); },
    finalized() { return Promise.resolve({ block: FX.finalized_block, ts: FX.block_ts }); },
  };
}
function bookCtx(): AttestedBookContext {
  return {
    subject: "https://monarkgate.tech/ukemi/book/weth/23545087.json",
    chain: "eip155:1",
    protocol: "aave-v3-core",
    attestor: { kind: "recorder", key: "deadbeef" }, // K-1 placeholder; sig ABSENT
    recorder_revision: "ukemi-recorder@" + "0".repeat(64), // declared placeholder
    observed_at: { clock: "block", instant: FX.block_ts },
    quorum: { required: 2, achieved: 2 },
    providers: [
      { name: "drpc", method: "eth_call", ok: true },
      { name: "mevblocker", method: "eth_call", ok: true },
      { name: "drpc", method: "getLogs", ok: true },
      { name: "mevblocker", method: "getLogs", ok: true },
    ],
    residual: ["no_third_party_verifier", "rpc_quorum_2_keyless", "oracle_price_as_read", "oracle_source_as_read", "block_timestamp_not_submission"],
    abstain: { value: false, reason: null },
  };
}

function expectBook(out: BookOutput | BookError): BookOutput {
  if (isBookError(out)) assert.fail(`expected a decoded book, got ${out.reason}: ${out.message}`);
  return out;
}
function expectError(out: BookOutput | BookError): BookError {
  if (!isBookError(out)) assert.fail("expected a BookError, got a decoded book");
  return out;
}
/** Parse the fixture, apply a patch to the mutable record, re-serialize (a malformed-but-JSON envelope). */
function mutate(patch: (b: Record<string, unknown>) => void): string {
  const b = JSON.parse(FIXTURE) as Record<string, unknown>;
  patch(b);
  return JSON.stringify(b);
}

test("attested_book_roundtrip", () => {
  const book = JSON.parse(FIXTURE) as AttestedBook;
  // fixture asserted against the recorder PIN / recorder fixture block, NOT against itself (C-6).
  assert.equal(book.book_digest, PIN.book_digest, "fixture book_digest is the recorder PIN");
  assert.equal(book.holders_digest, PIN.holders_digest, "fixture holders_digest is the recorder PIN");
  assert.equal(book.block.number, FX.block, "fixture block.number is the recorder block");
  assert.equal(book.block.hash, FX.block_hash, "fixture block.hash is the recorder block hash");
  assert.equal(book.attestor.sig, undefined, "attestor.sig is ABSENT (K-1 placeholder key only, C-6)");
  const s1 = serializeAttestedBook(book);
  assert.equal(FIXTURE.trim(), s1, "the fixture on disk IS the closed, minified serialization");
  const out = expectBook(fromAttestedBook(s1));
  assert.equal(serializeAttestedBook(out.book), s1, "serialize(fromAttestedBook(serialize(book)).book) === serialize(book) — byte-exact");
  assert.equal(out.provenance.book_digest, PIN.book_digest);
  assert.equal(out.provenance.holders_digest, PIN.holders_digest);
  assert.equal(out.provenance.block, FX.block);
  assert.equal(out.label, BOOK_LABEL);
});

test("attested_book_canonical_deterministic", async () => {
  const parsed = JSON.parse(FIXTURE) as Record<string, unknown>;
  const rev = (o: Record<string, unknown>): Record<string, unknown> => Object.fromEntries(Object.entries(o).reverse());
  // (i) permuted keys (top-level AND a nested object) ⇒ same canonical form and digest.
  const permuted = { ...rev(parsed), block: rev(parsed["block"] as Record<string, unknown>) };
  assert.equal(canonicalAttestedBook(permuted as CanonicalEnvelope), canonicalAttestedBook(parsed as CanonicalEnvelope), "key order does not change the canonical form");
  assert.equal(attestedBookDigest(permuted as CanonicalEnvelope), attestedBookDigest(parsed as CanonicalEnvelope), "…nor the digest");
  // (ii) on parsed values: a float and an unsafe integer are rejected by the canonicaliser; a negative
  //      n_positions (where an integer >= 0 is expected) is rejected by the adapter guard.
  assert.throws(() => canonicalAttestedBook({ x: 1.5 }), NonCanonicalNumberError, "1.5 is not a canonical number");
  assert.throws(() => canonicalAttestedBook({ x: Number.MAX_SAFE_INTEGER + 1 }), NonCanonicalNumberError, "an unsafe integer is not canonical");
  const neg = expectError(fromAttestedBook(mutate((b) => { (b["eligible"] as Record<string, unknown>)["n_positions"] = -1; })));
  assert.equal(neg.reason, "binding_broken");
  assert.match(neg.message, /n_positions/);
  // (iii) non-minified JSON (whitespace) ⇒ same canonical form (parse discards layout).
  const pretty = JSON.stringify(parsed, null, 2);
  assert.equal(canonicalAttestedBook(JSON.parse(pretty) as CanonicalEnvelope), canonicalAttestedBook(parsed as CanonicalEnvelope), "whitespace does not change the canonical form");
  // (iv) the recorder book canonicalised by L-2 ⇒ digest = PIN (the SINGLE canonical, C-7).
  const result = await recordBook(CLUSTER_WETH, FX.block, recorderReader());
  assert.equal(bookDigest(result.book), PIN.book_digest, "bookDigest(recorder book) reproduces the pinned book_digest");
});

test("attested_book_composition", async () => {
  const result = await recordBook(CLUSTER_WETH, FX.block, recorderReader());
  assert.equal(result.book_digest, PIN.book_digest, "control: the recorder reproduces the PIN");
  const book = toAttestedBook(result, bookCtx());
  const out = expectBook(fromAttestedBook(serializeAttestedBook(book)));
  assert.equal(out.book.book_digest, PIN.book_digest, "recordBook → toAttestedBook → serialize → fromAttestedBook carries the PIN");
  assert.equal(out.book.holders_digest, PIN.holders_digest);
  assert.equal(out.book.block.number, FX.block);
  assert.equal(out.book.block.hash, FX.block_hash);
  assert.equal(out.book.oracle_sources.length, 3, "the three used reserves become three oracle_sources");
});

test("attested_book_abstain_coupling", () => {
  // a valid COUPLED abstained book decodes; both UNCOUPLED directions are named refusals (ADR-U1b D4, C-1).
  const coupledAbstain = expectBook(fromAttestedBook(mutate((b) => { b["abstain"] = { value: true, reason: "no_quorum" }; })));
  assert.equal(coupledAbstain.book.abstain.reason, "no_quorum");
  const trueNull = expectError(fromAttestedBook(mutate((b) => { b["abstain"] = { value: true, reason: null }; })));
  assert.equal(trueNull.reason, "binding_broken");
  assert.match(trueNull.message, /coupling/);
  const falseReason = expectError(fromAttestedBook(mutate((b) => { b["abstain"] = { value: false, reason: "no_quorum" }; })));
  assert.equal(falseReason.reason, "binding_broken");
  assert.match(falseReason.message, /coupling/);
});

test("attested_book_rejects_prediction_keys", () => {
  // NO Prediction leaks into AttestedBook: yhat / predictor_id / produced_at are UNKNOWN keys ⇒ closed refusal (C-2).
  for (const key of ["yhat", "predictor_id", "produced_at"]) {
    const err = expectError(fromAttestedBook(mutate((b) => { b[key] = "x"; })));
    assert.equal(err.reason, "binding_broken");
    assert.match(err.message, new RegExp(`unknown key '${key}'`));
  }
});

test("attested_book_residual_enum", () => {
  // a residual outside the closed enum, and a residual omitting no_third_party_verifier, are refusals (ADR-U1b D2ter).
  const outOfEnum = expectError(fromAttestedBook(mutate((b) => { b["residual"] = ["no_third_party_verifier", "price_as_read"]; })));
  assert.equal(outOfEnum.reason, "binding_broken");
  assert.match(outOfEnum.message, /closed enum/);
  const missingNtpv = expectError(fromAttestedBook(mutate((b) => { b["residual"] = ["rpc_quorum_2_keyless"]; })));
  assert.equal(missingNtpv.reason, "binding_broken");
  assert.match(missingNtpv.message, /no_third_party_verifier/);
});

test("attested_book_n_positions_integer", () => {
  // O-1: n_positions must be an integer >= 0 — a float, a string, or a negative are all named refusals.
  for (const bad of [1.5, "3", -1]) {
    const err = expectError(fromAttestedBook(mutate((b) => { (b["eligible"] as Record<string, unknown>)["n_positions"] = bad; })));
    assert.equal(err.reason, "binding_broken");
    assert.match(err.message, /n_positions/);
  }
});

test("attested_book_quorum_required", () => {
  // quorum-by-method sanity: required cannot exceed the distinct providers; a non-abstained sub-quorum is non_evaluable (D4).
  const over = expectError(fromAttestedBook(mutate((b) => { b["quorum"] = { required: 5, achieved: 2 }; })));
  assert.equal(over.reason, "binding_broken");
  assert.match(over.message, /distinct provider/);
  const subQuorum = expectError(fromAttestedBook(mutate((b) => { b["quorum"] = { required: 2, achieved: 1 }; })));
  assert.equal(subQuorum.reason, "non_evaluable", "not abstained yet achieved < required ⇒ non_evaluable");
});
