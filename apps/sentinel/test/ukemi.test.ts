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
import { makeUkemiPool, NoQuorumError, RpcError, ConcordantRevertError, isRpcRevert, type UkemiReader, type LogEntry } from "../src/ukemi/rpc2.ts";
import { QuorumDisagreementError, type RpcCall } from "../src/rpc.ts";
import { SEL, wordAddr, decodeUserAccountData, decUint } from "../src/ukemi/abi.ts";
import { crossCheckHealthFactor, healthFactorFromBalances, percentMul, wadDiv, eligibleStatic } from "../src/ukemi/wadray.ts";
import { CLUSTER_WETH, ORACLE } from "../src/ukemi/clusters.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(HERE, "..", "..", "..");

interface FixtureLog { blockNumber: string; logIndex: string; transactionHash: string; topics: string[]; data: string; }
interface Fixture { cluster: string; block: number; block_hash: string; block_ts: number; finalized_block: number; enumeration_logs: FixtureLog[]; calls: Record<string, string>; victim_vector: { address: string; getUserAccountData: string; getUserConfiguration: string; getUserEMode: string; aweth_balance: string }; }
const FX = JSON.parse(readFileSync(join(HERE, "fixtures", "ukemi", "weth-book.fixture.json"), "utf8")) as Fixture;

/** GARDE-HELIUS-2b-ii: build a KEYLESS canonical RpcError from the legacy (message, code, data?) shape. The quorum
 *  tests exercise revertKey / isRpcRevert / ConcordantRevertError on KEYLESS reverts (op/detail are immaterial;
 *  unit "keyless" so the R-A paid-"0x"-bench never triggers - the live GHO V-4 mixed case stays concordant). */
const rerr = (message: string, code: number, data?: string): RpcError => new RpcError("test-op", message, code, "", "keyless", data);

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

// ── 0 — description() at the QUORUM, all THROUGH the real makeUkemiPool (4 distinct providers), V-1 correctif ──
// A `call` over the fixture bytes that mirrors record.ts's defaultCall shapes; `tamper(selector,url)` may throw
// an RpcError (EVM revert) or a plain Error (transport) per (read, provider), so a concordant revert, a
// value/revert split, and a transport fault are all exercised against the ACTUAL quorum2, not a mocked reader.
const POOL_EPS = ["https://a.example", "https://b.example", "https://c.example", "https://d.example"];
function poolCall(tamper: (selector: string, url: string) => void = () => { /* no tamper */ }): RpcCall {
  return (url, method, params) => {
    if (method === "eth_getBlockByNumber") return Promise.resolve({ hash: FX.block_hash, number: "0x" + FX.block.toString(16), timestamp: "0x" + FX.block_ts.toString(16) });
    if (method === "eth_getLogs") return Promise.resolve(FX.enumeration_logs);
    const p = (params as ReadonlyArray<{ to: string; data: string }>)[0];
    if (p === undefined) return Promise.reject(new Error("eth_call: missing params"));
    tamper(p.data.toLowerCase(), url);
    const v = FX.calls[`${p.to.toLowerCase()}|${p.data.toLowerCase()}`];
    return v === undefined ? Promise.reject(new Error(`fixture miss ${p.to}`)) : Promise.resolve(v);
  };
}
const poolOver = (call: RpcCall) => makeUkemiPool({ call, ethCallProviders: POOL_EPS, getLogsProviders: POOL_EPS });
const isDesc = (selector: string) => selector.startsWith(SEL.description.toLowerCase());

// (a) UNANIMOUS revert on every description() ⇒ concordant ⇒ recorded "" ⇒ a book is produced (GHO-like source).
test("ukemi_description_concordant_revert_tolerated_through_pool", async () => {
  let descCalls = 0;
  const call = poolCall((selector) => { if (isDesc(selector)) { descCalls++; throw rerr("execution reverted", 3); } });
  const r = await recordBook(CLUSTER_WETH, FX.block, poolOver(call));
  const parsed = JSON.parse(canonicalStringify(r.book)) as { reserves: Array<{ oracle_description: string }> };
  for (const rv of parsed.reserves) assert.equal(rv.oracle_description, "", "a concordant description() revert is recorded as \"\"");
  assert.equal(descCalls, 6, "3 reserves × exactly 2 concordant reverts (a revert does not bench; the quorum stops at 2)");
  // The pool path (ConcordantRevertError ⇒ "") converges bit-exactly with a reader path whose descriptions decode to "".
  const empty: Record<string, string> = { ...FX.calls };
  for (const k of Object.keys(empty)) if (k.endsWith("|" + SEL.description.toLowerCase())) empty[k] = "0x" + "0".repeat(128);
  const viaReader = await recordBook(CLUSTER_WETH, FX.block, fixtureReader(empty));
  assert.equal(r.book_digest, viaReader.book_digest, "pool concordant-revert path == reader empty-description path (bit-identical)");
  assert.notEqual(r.book_digest, PIN.book_digest, "oracle_description is a digest field: emptying it changes the digest");
});

// (b) revert on one provider / value on another ⇒ QuorumDisagreementError ⇒ the whole book abstains, never a digest.
test("ukemi_description_disagreement_abstains_book", async () => {
  const call = poolCall((selector, url) => { if (isDesc(selector) && url !== POOL_EPS[0]) throw rerr("execution reverted", 3); });
  await assert.rejects(() => recordBook(CLUSTER_WETH, FX.block, poolOver(call)), QuorumDisagreementError, "a value/revert split on description() abstains the book");
});

// (c) revert on one provider / transport fault on the rest ⇒ fewer than 2 outcomes ⇒ NoQuorumError ⇒ abstain.
test("ukemi_description_no_quorum_abstains_book", async () => {
  const call = poolCall((selector, url) => { if (isDesc(selector)) { if (url === POOL_EPS[0]) throw rerr("execution reverted", 3); throw new Error("HTTP 429 rate limited"); } });
  await assert.rejects(() => recordBook(CLUSTER_WETH, FX.block, poolOver(call)), NoQuorumError, "one revert + transport faults is a no-quorum, not a tolerated revert");
});

// (d) a CONCORDANT revert on getAssetPrice (a load-bearing digest field, NOT description) propagates ⇒ abstain, never a digest.
test("ukemi_concordant_revert_on_price_field_abstains_book", async () => {
  const call = poolCall((selector) => { if (selector.startsWith(SEL.getAssetPrice.toLowerCase())) throw rerr("execution reverted", 3); });
  await assert.rejects(() => recordBook(CLUSTER_WETH, FX.block, poolOver(call)), ConcordantRevertError, "tolerance is scoped to description(); getAssetPrice abstains");
});

// The explicit, testable revert criterion (ADR-U1 D3 amendment): code 3 (EIP-1474) or -32000 (node) naming a revert.
test("ukemi_is_rpc_revert_criterion", () => {
  assert.ok(isRpcRevert(rerr("execution reverted", 3)));
  assert.ok(isRpcRevert(rerr("execution reverted: out of gas", -32000)));
  assert.ok(!isRpcRevert(rerr("method not found", -32601)), "a non-revert JSON-RPC error benches (transport-classed)");
  assert.ok(!isRpcRevert(rerr("rate limited", 429)), "a rate-limit is not a revert");
  assert.ok(!isRpcRevert(new Error("HTTP 503 gateway")), "a transport fault is not a revert");
});

// ── V-4 killers (checkpoint-2 bis): the three mutants the G2 delta proved survive the base suite (M4/M5/M6). ──

// M4 — a revert is on-chain DATA, not a fault: it does NOT bench the provider. Killer for the mutation that
// benches on a revert. Exactly 3 providers: read1 reverts concordantly on the first two; in read2 those two
// return a value while the THIRD is a transport fault — so the only way read2 can reach a 2-quorum is from the
// two that reverted. read2 succeeding proves they were NOT put in cooldown (a direct inference, not "2-of-3 left 1").
test("ukemi_revert_does_not_bench_provider", async () => {
  const eps = ["https://one.example", "https://two.example", "https://three.example"];
  let phase: "revert" | "value" = "revert";
  const call: RpcCall = (url) => {
    if (phase === "revert") return Promise.reject(rerr("execution reverted", 3));
    if (url === eps[2]) return Promise.reject(new Error("HTTP 503 transport")); // third can never contribute in read2
    return Promise.resolve("0x64");
  };
  const pool = makeUkemiPool({ call, ethCallProviders: eps, getLogsProviders: eps });
  await assert.rejects(() => pool.ethCall("0xabc", "0xdef", 100), ConcordantRevertError, "read1: concordant revert across two distinct providers");
  phase = "value";
  assert.equal(await pool.ethCall("0xabc", "0xdef", 100), "0x64", "read2: quorum comes from the two that reverted ⇒ they were not benched");
});

// M5 — the revert concordance key is the revert DATA (custom-error selector / reason) when present, else the
// message. Killer for the mutation that ignores data and keys on the message: same data + different messages ⇒
// concordant (ConcordantRevertError); different data + same message ⇒ disagreement (QuorumDisagreementError).
test("ukemi_revert_key_uses_data", async () => {
  const eps = ["https://one.example", "https://two.example"];
  const sameData: RpcCall = (url) => Promise.reject(rerr(url === eps[0] ? "execution reverted: alpha" : "execution reverted: beta", 3, "0xdeadbeef"));
  await assert.rejects(() => makeUkemiPool({ call: sameData, ethCallProviders: eps, getLogsProviders: eps }).ethCall("0xa", "0xb", 1), ConcordantRevertError, "same revert data ⇒ concordant even if messages differ");
  const diffData: RpcCall = (url) => Promise.reject(rerr("execution reverted", 3, url === eps[0] ? "0xaaaa" : "0xbbbb"));
  await assert.rejects(() => makeUkemiPool({ call: diffData, ethCallProviders: eps, getLogsProviders: eps }).ethCall("0xa", "0xb", 1), QuorumDisagreementError, "different revert data ⇒ disagreement (abstain)");
  // The REAL GHO case (measured live, V-4): one provider returns data "0x", another returns NO data. The
  // `data !== "0x"` guard routes BOTH to the normalized message ⇒ concordant. Without that guard, "0x" vs the
  // message would disagree ⇒ the whole book would abstain a real on-chain fact. This sub-case is load-bearing.
  const mixed: RpcCall = (url) => Promise.reject(url === eps[0] ? rerr("execution reverted", 3, "0x") : rerr("execution reverted", 3));
  await assert.rejects(() => makeUkemiPool({ call: mixed, ethCallProviders: eps, getLogsProviders: eps }).ethCall("0xa", "0xb", 1), ConcordantRevertError, "data \"0x\" and absent-data both key on the message ⇒ concordant (the !== \"0x\" guard)");
});

// M6 — isRpcRevert REJECTS an archive miss: a -32000 whose message is "header not found" / "missing trie node"
// is transport (benched), not a revert; a code 3 with no revert word is not a revert either. Killer for the
// mutation that drops the message clause. That clause is what separates a real revert from an archive miss.
test("ukemi_is_rpc_revert_rejects_archive_miss", () => {
  assert.equal(isRpcRevert(rerr("header not found", -32000)), false, "archive miss (header not found) is transport, not a revert");
  assert.equal(isRpcRevert(rerr("missing trie node 0xabc (path ) <nil>", -32000)), false, "archive miss (missing trie node) is transport");
  assert.equal(isRpcRevert(rerr("some node failure", 3)), false, "code 3 without a revert word is not classed a revert");
  assert.ok(isRpcRevert(rerr("execution reverted", 3)), "positive control: code 3 naming a revert");
  assert.ok(isRpcRevert(rerr("execution reverted: out of gas", -32000)), "positive control: -32000 naming a revert");
});

// GARDE-HELIUS-2b-ii: the fetch -> typed RpcError -> quorum2 -> book path (formerly `ukemi_default_call_classifies_rpc_errors`,
// on the removed record.ts `defaultCall`) is RETIRED here. It is superseded through the MIGRATED path in
// apps/sentinel/test/ukemi-guard-record.test.ts (ukemi_record_full_book_reproduces_pin_through_guard, and the revert
// scenarios via the concordance chain), which drives runRecorder over openGuardedClient with only globalThis.fetch stubbed (C-5).

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
  // the mutated source address needs its own description(): the fixtureReader is a single reader (no quorum), so a
  // miss is a bare Error that now abstains the book (only a ConcordantRevertError is tolerated) — serve an empty ABI
  // string so the changed source ADDRESS alone drives the digest delta.
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
