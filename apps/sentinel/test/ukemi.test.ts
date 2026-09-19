// UKEMI (ADR-U1 D5 + C-7) — offline oracle for the sentinel-2 liquidation-book recorder. All fixtures are
// REAL recorded eth_call/getLogs bytes @ block 23545087 (WETH cluster, just before the liquidations); no network here. The
// recorder decodes the raw bytes fresh, so a green test is NOT a fixture that cooked its own answer — the
// bytes are the on-chain input, the digest is the output. Named mutants (D5): block shifted, oracle source
// changed, account/Transfer omitted, aToken balance zeroed, chain hash broken, vocab motif inserted.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { recordBook, canonicalStringify, ukemiLineHash, type UkemiTimelineLine } from "../src/ukemi/book.ts";
import { makeUkemiPool, NoQuorumError, type UkemiReader, type LogEntry } from "../src/ukemi/rpc2.ts";
import { QuorumDisagreementError, type RpcCall } from "../src/rpc.ts";
import { SEL, wordAddr, decodeUserAccountData, decUint } from "../src/ukemi/abi.ts";
import { crossCheckHealthFactor, healthFactorFromBalances, percentMul, wadDiv, eligibleStatic } from "../src/ukemi/wadray.ts";
import { CLUSTER_WETH, ORACLE } from "../src/ukemi/clusters.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(HERE, "..", "..", "..");

interface FixtureLog { blockNumber: string; logIndex: string; transactionHash: string; topics: string[]; data: string; }
interface Fixture { cluster: string; block: number; block_hash: string; block_ts: number; finalized_block: number; enumeration_logs: FixtureLog[]; calls: Record<string, string>; victim_vector: { address: string; getUserAccountData: string; getUserConfiguration: string; getUserEMode: string; aweth_balance: string }; }
const FX = JSON.parse(readFileSync(join(HERE, "fixtures", "ukemi", "weth-book.fixture.json"), "utf8")) as Fixture;

// The pinned outputs of recording the reduced fixture (recomputed at write time; a drift reddens).
const PIN = {
  book_digest: "034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921",
  holders_digest: "529bf2b8ba33201d1735193729ddbccac5e0ac20032073e77a03767de31bf110",
  line_hash: "eead4f5357a07d3d3c026c4fe1e2ac7c48a35a2485f6777ccdef4251ceb73e15",
};

/** A reader over the recorded bytes. eth_call is keyed by (to,data): the fixture is one block, so the block is
 *  not part of the key (look-ahead is enforced separately, test `ukemi_no_latest_literal`). getLogsRange
 *  returns the reduced enumeration. Optional overrides let a mutant replace individual responses / logs. */
function fixtureReader(calls: Record<string, string> = FX.calls, logs: FixtureLog[] = FX.enumeration_logs): UkemiReader {
  return {
    ethCall(to, data) { const k = `${to.toLowerCase()}|${data.toLowerCase()}`; const v = calls[k]; if (v === undefined) return Promise.reject(new Error(`fixture miss ${k}`)); return Promise.resolve(v); },
    getLogsRange() { return Promise.resolve(logs as unknown as LogEntry[]); },
    blockAt() { return Promise.resolve({ hash: FX.block_hash, ts: FX.block_ts }); },
    finalized() { return Promise.resolve({ block: FX.finalized_block, ts: FX.block_ts }); },
  };
}

// ── 1 — the deliverable oracle: replay the reduced book, digest is bit-identical ────────────────────────
test("sentinel2_book_identical_to_pull", async () => {
  const r = await recordBook(CLUSTER_WETH, FX.block, fixtureReader());
  assert.equal(r.book_digest, PIN.book_digest, "book_digest bit-identical to the pinned replay");
  assert.equal(r.holders_digest, PIN.holders_digest, "holders_digest bit-identical");
  assert.equal(r.timeline.line_hash, PIN.line_hash, "timeline line_hash bit-identical");
  assert.deepEqual(r.counts, { holders: 4, at_risk: 2, eligible: 0, excluded_collateral_off: 1, excluded_no_debt: 1, excluded_zero_balance: 0 });
  // Digest recomputes from the canonical serialization (no hidden state).
  assert.equal(r.book_digest, keccakFreeSha(canonicalStringify(r.book)));
  assert.equal(r.timeline.pair_status, "recorded");
  assert.equal(r.timeline.attestation_ref, null, "U-1a produces no attestation (that is U-1b)");
});

// ── 2 — mutant: block shifted B±1 ⇒ digest ≠ ────────────────────────────────────────────────────────────
test("ukemi_mutant_block_shift", async () => {
  const base = await recordBook(CLUSTER_WETH, FX.block, fixtureReader());
  for (const b of [FX.block - 1, FX.block + 1]) {
    const m = await recordBook(CLUSTER_WETH, b, fixtureReader());
    assert.notEqual(m.book_digest, base.book_digest, `block ${String(b)} changes the digest`);
  }
});

// ── 3 — mutant: oracle source changed ⇒ digest ≠ ────────────────────────────────────────────────────────
test("ukemi_mutant_oracle_source", async () => {
  const base = await recordBook(CLUSTER_WETH, FX.block, fixtureReader());
  const WETH = CLUSTER_WETH.collaterals[0]!.asset;
  const key = `${ORACLE.toLowerCase()}|${(SEL.getSourceOfAsset + wordAddr(WETH)).toLowerCase()}`;
  const mutated = { ...FX.calls, [key]: "0x000000000000000000000000dead00000000000000000000000000000000beef" };
  // the mutated source address needs its own description() (fail-closed otherwise); serve an empty string.
  mutated["0xdead00000000000000000000000000000000beef|" + SEL.description] = "0x" + "0".repeat(128);
  const m = await recordBook(CLUSTER_WETH, FX.block, fixtureReader(mutated));
  assert.notEqual(m.book_digest, base.book_digest, "a changed oracle source changes the digest");
});

// ── 4 — mutant: account omitted (Transfer dropped) ⇒ holders_digest ≠ ⇒ digest ≠ ────────────────────────
test("ukemi_mutant_account_and_transfer_omitted", async () => {
  const base = await recordBook(CLUSTER_WETH, FX.block, fixtureReader());
  const dropped = FX.enumeration_logs.filter((l) => !l.topics[2]!.toLowerCase().endsWith("552c4ad0849ab72c5b5ca4f30d216c8a654c07b4"));
  assert.equal(dropped.length, FX.enumeration_logs.length - 1, "one Transfer removed");
  const m = await recordBook(CLUSTER_WETH, FX.block, fixtureReader(FX.calls, dropped));
  assert.notEqual(m.holders_digest, base.holders_digest, "dropping a Transfer changes holders_digest");
  assert.notEqual(m.book_digest, base.book_digest, "…and therefore the book_digest");
  assert.equal(m.counts.at_risk, base.counts.at_risk - 1, "the omitted account is no longer at-risk");
});

// ── 5 — mutant: aToken balanceOf zeroed ⇒ excluded, not at-risk ⇒ digest ≠ ───────────────────────────────
test("ukemi_mutant_balance_zeroed", async () => {
  const base = await recordBook(CLUSTER_WETH, FX.block, fixtureReader());
  const aWETH = CLUSTER_WETH.collaterals[0]!.aToken;
  const key = `${aWETH.toLowerCase()}|${(SEL.balanceOf + wordAddr("0x552c4ad0849ab72c5b5ca4f30d216c8a654c07b4")).toLowerCase()}`;
  const mutated = { ...FX.calls, [key]: "0x" + "0".repeat(64) };
  const m = await recordBook(CLUSTER_WETH, FX.block, fixtureReader(mutated));
  assert.equal(m.counts.at_risk, base.counts.at_risk - 1, "a zero aToken balance is excluded, not at-risk");
  assert.equal(m.counts.excluded_zero_balance, 1, "counted as excluded_zero_balance");
  assert.notEqual(m.book_digest, base.book_digest, "…and the digest changes");
});

// ── 6 — mutant: chain hash broken ⇒ recomputed line_hash ≠ ⇒ timeline refused ───────────────────────────
test("ukemi_mutant_hash_chain", async () => {
  const r = await recordBook(CLUSTER_WETH, FX.block, fixtureReader());
  const tampered: UkemiTimelineLine = { ...r.timeline, block_hash: "0x" + "f".repeat(64) };
  assert.notEqual(ukemiLineHash(tampered), r.timeline.line_hash, "tampering a fact breaks the recomputed line_hash (timeline refused)");
  // A tampered book_digest in the line is likewise detected.
  const t2: UkemiTimelineLine = { ...r.timeline, book_digest: "0".repeat(64) };
  assert.notEqual(ukemiLineHash(t2), r.timeline.line_hash);
});

// ── 7 — HF invariant (ADR-U1 C-2): recompute is deterministic; edge-rounding delta RECORDED, not "≈" ─────
test("ukemi_hf_invariant_findings_recorded", async () => {
  const r = await recordBook(CLUSTER_WETH, FX.block, fixtureReader());
  const by = new Map(r.hf_findings.map((f) => [f.address, f]));
  const a = by.get("0x552c4ad0849ab72c5b5ca4f30d216c8a654c07b4")!;
  assert.equal(a.kind, "checked");
  assert.equal(a.hf_onchain, "1053019895078855106");
  assert.equal(a.hf_delta, "274302", "exact signed integer delta (a recorded finding, never a silent tolerance)");
  const b = by.get("0xe0c20053d20c8d6d6de243af2093b222eb3e9c03")!;
  assert.equal(b.hf_delta, "-458155");
  // e-mode ≠ 0 ⇒ emode_recompute_skipped (victim vector, real reads), on-chain HF authoritative + eligible.
  const uad = decodeUserAccountData(FX.victim_vector.getUserAccountData);
  const emode = decUint(FX.victim_vector.getUserEMode);
  const chk = crossCheckHealthFactor(uad, emode);
  assert.equal(chk.kind, "emode_recompute_skipped");
  assert.equal(emode, 2n);
  assert.equal(eligibleStatic(uad.healthFactor), true, "the account liquidated at B+1 is eligible_static (HF < 1e18)");
  assert.ok(uad.healthFactor < 10n ** 18n);
});

// ── 8 — WadRayMath reproduces the Aave aggregate formula on the recorded account ─────────────────────────
test("ukemi_wadray_matches_aave_formula", () => {
  const uad = decodeUserAccountData(FX.calls[`0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2|${(SEL.getUserAccountData + wordAddr("0x552c4ad0849ab72c5b5ca4f30d216c8a654c07b4")).toLowerCase()}`]!);
  const hf = healthFactorFromBalances(uad.totalCollateralBase, uad.currentLiquidationThresholdBps, uad.totalDebtBase);
  assert.equal(hf, wadDiv(percentMul(uad.totalCollateralBase, uad.currentLiquidationThresholdBps), uad.totalDebtBase));
  // debt = 0 ⇒ max (Aave GenericLogic).
  assert.equal(healthFactorFromBalances(1n, 8300n, 0n), 2n ** 256n - 1n);
});

// ── 9 — quorum-2: agreement returns; disagreement / < 2 providers fail closed (no_quorum abstention) ────
test("ukemi_quorum_two_fail_closed", async () => {
  const eps = ["https://one.example", "https://two.example"]; // two distinct providers
  const agree: RpcCall = () => Promise.resolve("0x64");
  const okPool = makeUkemiPool({ call: agree, ethCallProviders: eps, getLogsProviders: eps });
  assert.equal(await okPool.ethCall("0xabc", "0xdef", 100), "0x64", "two agreeing providers return the value");
  const disagree: RpcCall = (u) => Promise.resolve(u === eps[0] ? "0x64" : "0x65");
  await assert.rejects(() => makeUkemiPool({ call: disagree, ethCallProviders: eps, getLogsProviders: eps }).ethCall("0xabc", "0xdef", 100), QuorumDisagreementError);
  const oneDead: RpcCall = (u) => (u === eps[0] ? Promise.resolve("0x64") : Promise.reject(new Error("525")));
  await assert.rejects(() => makeUkemiPool({ call: oneDead, ethCallProviders: eps, getLogsProviders: eps }).ethCall("0xabc", "0xdef", 100), NoQuorumError);
});

// ── 10 — look-ahead forbidden: no `latest` literal anywhere under ukemi/** (calque sentinel_waits_for_finality) ─
test("ukemi_no_latest_literal", () => {
  const dir = join(HERE, "..", "src", "ukemi");
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".ts"))) {
    const src = readFileSync(join(dir, f), "utf8");
    assert.ok(!/["'`]latest["'`]/.test(src), `ukemi/${f} must not read the 'latest' tag (look-ahead forbidden, ADR-U1 D7)`);
  }
});

// ── 11 — mutant: vocab motif inserted ⇒ gate:vocab red; the ADR-U1 D8 patterns are wired to the sentinel scope ─
interface VocabRule { re: string; why: string }
interface Vocab { banned: VocabRule[]; scan: { sentinel: { banned: VocabRule[] } } }
test("ukemi_vocab_sentinel_scope_bans_adr_motifs", () => {
  const vocab = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8")) as Vocab;
  const pats = [...vocab.banned, ...vocab.scan.sentinel.banned].map((r) => new RegExp(r.re, "i"));
  const reds = (s: string): boolean => pats.some((re) => re.test(s));
  // Motifs assembled at RUNTIME so this test file does not itself carry the literal (else the sentinel-scope
  // gate:vocab would redden the oracle). Each ADR-U1 D8 motif reddens (a would-be insertion is caught).
  const motifs = [
    ["cas", "cade"].join(""),
    ["lambda", "=", "0"].join(" "),
    ["would", "have", "alerted"].join(" "),
    ["aurait", "alert"].join(" ") + "e",
    ["reference", "price"].join(" "),
    ["prix", "de", "r" + String.fromCharCode(0xe9) + "f" + String.fromCharCode(0xe9) + "rence"].join(" "),
  ];
  for (const m of motifs) assert.ok(reds(m), `banned motif reddens: "${m}"`);
  // "score" is NOT a regex ban (ADR-U1 D8: doctrine, not a motif — the Narabi tracker uses it legitimately).
  assert.ok(!reds(["the tracker", "sc" + "ore"].join(" ")), '"score" is not a regex ban');
  // The committed ukemi sources carry none of the motifs.
  const dir = join(HERE, "..", "src", "ukemi");
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".ts"))) {
    const hits = pats.filter((re) => re.test(readFileSync(join(dir, f), "utf8")));
    assert.equal(hits.length, 0, `ukemi/${f} carries no banned motif`);
  }
});

/** sha256 hex of a UTF-8 string via node:crypto (re-derives the digest from the canonical serialization). */
function keccakFreeSha(s: string): string { return createHash("sha256").update(s, "utf8").digest("hex"); }
