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
  fromRealizedBook,
  isRealizedError,
  type RealizedBookSlice,
  type RealizedOracleParams,
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
  assert.equal(serializeAttestedBook(book), FIXTURE.trim(), "C-V1: the producer output IS the fixture byte-exact (locks every copied field)");
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
  const over3 = expectError(fromAttestedBook(mutate((b) => { b["quorum"] = { required: 3, achieved: 2 }; })));
  assert.equal(over3.reason, "binding_broken", "C-G2-1: required 3 > the 2 DISTINCT provider names, though <= the 4 providers[] entries");
  assert.match(over3.message, /exceeds the 2 distinct provider/, "guard counts distinct NAMES (2), not providers.length (4)");
  const subQuorum = expectError(fromAttestedBook(mutate((b) => { b["quorum"] = { required: 2, achieved: 1 }; })));
  assert.equal(subQuorum.reason, "non_evaluable", "not abstained yet achieved < required ⇒ non_evaluable");
});

// ── U-5a: the PURE per-account yhat producer `fromRealizedBook` (decision 123/132; G0 §2/§3; checkpoint-1 C-1). ──
// SELF-CONTAINED synthetic vectors (D-2: non-empty, closed keys, HAND-RECOMPUTED value) for the pure-function
// contract; the EXACT equality to the frozen module over the real 565 `score_a` rows / 16 096 accounts is the
// export-excluded oracle (apps/sentinel/test/ukemi-producer-oracle.test.ts, Oracle A + Oracle B).
const R_WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const R_AWETH = "0x00000000000000000000000000000000000000a1";
const R_VWETH = "0x00000000000000000000000000000000000000d1";
const R_USDC = "0x00000000000000000000000000000000000000c0";
const R_AUSDC = "0x00000000000000000000000000000000000000a2";
const R_VUSDC = "0x00000000000000000000000000000000000000d2";
/** Two reserves (WETH p0 = 100e8, USDC 1e8). WETH LT 8000, bonus 11000, e-mode category 1. */
function baseReserves() {
  return [
    { asset: R_WETH, atoken: R_AWETH, variable_debt_token: R_VWETH, decimals: "18", liquidation_threshold_bps: "8000", liquidation_bonus_bps: "11000", reserve_emode_category: "1", price_base_8dec: "10000000000" },
    { asset: R_USDC, atoken: R_AUSDC, variable_debt_token: R_VUSDC, decimals: "6", liquidation_threshold_bps: "8500", liquidation_bonus_bps: "10500", reserve_emode_category: "0", price_base_8dec: "100000000" },
  ];
}
/** A mono-WETH account (1 WETH collateral = 100e8, 60 USDC debt = 60e8) with hf0 = 0.9e18 ⇒ crosses at the anchor. */
function baseAccount() {
  return {
    address: "0x0000000000000000000000000000000000000001",
    emode: "0",
    balances: [{ token: R_AWETH, amount: "1000000000000000000" }, { token: R_VUSDC, amount: "60000000" }],
    total_collateral_base: "10000000000", // = aWETH*p0/1e18 EXACTLY (mono-collateral WETH)
    total_debt_base: "6000000000", // 60e8
    current_liquidation_threshold_bps: "8000",
    hf_onchain: "900000000000000000", // 0.9e18 < 1e18 ⇒ hfAt(anchor) = hf0 < 1e18 (H-7)
  };
}
function baseParams(): RealizedOracleParams {
  return { anchor_price: "10000000000", updates: [], emode_params: {} };
}
function baseBook(): RealizedBookSlice {
  return { reserves: baseReserves(), account: baseAccount() };
}

test("u5_producer_crossing_recomputes_yhat_mbps_pstar", () => {
  // HAND recompute: crosses at anchor (hfStar = 0.9e18). C_weth = 100e8 = 1e10 < T (2000e8) ⇒ gate FALSE ⇒
  // CF = D_r(USDC) = 60e8 = 6e9; CA = C_weth*1e4/bonus = 1e10*1e4/11000 = 9090909090; yhat = min = 6e9.
  const r = fromRealizedBook(baseBook(), baseParams());
  assert.ok(!isRealizedError(r), "the synthetic mono-WETH account is evaluable");
  if (isRealizedError(r)) return;
  assert.equal(r.yhat, 6000000000n, "yhat = min(CF=60e8, CA) = 60e8 (gate off, C_weth < 2000e8)");
  assert.equal(r.m_bps, "11000", "m_bps = the WETH collateral liquidation bonus (e-mode 0 reserve bonus)");
  assert.equal(r.pstar, "10000000000", "pstar = the anchor price (crosses at the first path price, H-7)");
});

test("u5_producer_yhat0_no_crossing_is_a_prediction", () => {
  // hf0 = 2e18 ⇒ never crosses on a single-anchor path ⇒ yhat 0 WITH m_bps/pstar null (Q-U5-7: a legitimate
  // prediction, not a refusal).
  const book = baseBook();
  const acct = { ...book.account, hf_onchain: "2000000000000000000" };
  const r = fromRealizedBook({ reserves: book.reserves, account: acct }, baseParams());
  assert.ok(!isRealizedError(r) && r.ok, "no crossing is evaluable (yhat 0), never a refusal");
  if (isRealizedError(r)) return;
  assert.equal(r.yhat, 0n);
  assert.equal(r.pstar, null);
  assert.equal(r.m_bps, null);
});

test("u5_producer_refuses_named", () => {
  const refusal = (book: RealizedBookSlice, params: RealizedOracleParams, reason: string) => {
    const r = fromRealizedBook(book, params);
    assert.ok(isRealizedError(r), `expected refusal ${reason}`);
    if (isRealizedError(r)) assert.equal(r.reason, reason);
  };
  // WETH reserve absent.
  refusal({ reserves: baseReserves().filter((x) => x.asset !== R_WETH), account: baseAccount() }, baseParams(), "weth_reserve_absent");
  // anchor <= 0.
  refusal(baseBook(), { ...baseParams(), anchor_price: "0" }, "anchor_not_positive");
  // no aWETH collateral.
  refusal({ reserves: baseReserves(), account: { ...baseAccount(), balances: [{ token: R_VUSDC, amount: "60000000" }] } }, baseParams(), "no_collateral");
  // not mono-collateral WETH (residual != 0).
  refusal({ reserves: baseReserves(), account: { ...baseAccount(), total_collateral_base: "20000000000" } }, baseParams(), "non_mono_weth");
  // e-mode outside {0, WETH-category}.
  refusal({ reserves: baseReserves(), account: { ...baseAccount(), emode: "2" } }, baseParams(), "emode_out_of_range");
  // WETH-category e-mode but params missing.
  refusal({ reserves: baseReserves(), account: { ...baseAccount(), emode: "1" } }, baseParams(), "emode_params_missing");
  // Q-U5-6 guard: a non-zero balance token that is neither aWETH nor a carried vtoken (pruned reserves).
  refusal({ reserves: baseReserves(), account: { ...baseAccount(), balances: [{ token: R_AWETH, amount: "1000000000000000000" }, { token: "0x00000000000000000000000000000000000000ff", amount: "1" }] } }, baseParams(), "unknown_balance_token");
});
