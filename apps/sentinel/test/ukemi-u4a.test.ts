// UKEMI U-4a (ADR-M020 D1 (b), G0 lot U-4 + checkpoint-1 C-5) — offline oracles for the A-1 recorder hardening:
// the fail-closed RPC budget (BudgetExceededError re-thrown FIRST at all three pool guards, never benched into
// no_quorum / split / swallowed), key hygiene (no endpoint URL or key ever reaches a journal/brut message), the
// per-operator budget breakdown, the --resume request→result cache (a hit costs no budget; a tampered enumeration
// trips the holders_digest guard ⇒ abstention), and the reduced-recipient-log encoding that keeps that cache O(N)
// while reproducing the holders_digest bit-identically. No network here. Named mutants: budget guard removed at
// quorum2 / finalized ⇒ no_quorum instead of the budget stop; a corrupted holders line ⇒ NO abstention; a dropped
// recipient in the reduced set ⇒ holders_digest drift.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
// GARDE-HELIUS-2b-ii: makeDefaultCall / makeBudgetedCall / operatorLabel / scrubUrls / ARCHIVE_ENV_LABEL /
// applyExcludeOperators are REMOVED from record.ts (transport + budget + key hygiene moved into @monark/rpc-guard).
// Only enumerateAndCountAtRisk (the D-3 filter-only core) remains imported here. The budget-guard oracle below drives
// an INLINE budgeted `call` (throws BudgetExceededError after N) - the pool-guard behaviour it pins (quorum2 /
// finalized / getLogsVia re-throw the budget stop FIRST) is unchanged and still lives in makeUkemiPool.
import { enumerateAndCountAtRisk } from "../src/ukemi/record.ts";
import { makeUkemiPool, BudgetExceededError, resolveInterval, type UkemiReader, type LogEntry } from "../src/ukemi/rpc2.ts";
import { recordBook } from "../src/ukemi/book.ts";
import { CLUSTER_WETH } from "../src/ukemi/clusters.ts";
import { SEL, TRANSFER_TOPIC0, topicAddr, transferRecipients, ANSWER_UPDATED_TOPIC0, decInt256, decodeEModeCategoryData, keccak256, selector } from "../src/ukemi/abi.ts";
import { makeResumeReader, assertResumeHoldersMatch, parseResumeLines, holdersDigestOf, reducedRecipientLogs, ResumeCacheError, type CacheLine } from "../src/ukemi/resume.ts";
import type { RpcCall } from "../src/rpc.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(HERE, "..", "..", ".."); // apps/sentinel/test -> repo root
const ZERO_WORD = "0x" + "0".repeat(64);

// -- C-5: the budget stop is fatal and re-thrown FIRST - never benched into a no_quorum, split, or swallowed. Each
// read is a quorum over injected providers; the budget is enforced by an INLINE budgeted call (the removed record.ts
// makeBudgetedCall). Mutant "budget swallowed" (drop the `instanceof BudgetExceededError` guard at rpc2 quorum2 or
// finalized) => NoQuorumError => red.
// An INLINE budgeted call (calque of the removed record.ts makeBudgetedCall): throws BudgetExceededError after `max`.
// The budget now lives in @monark/rpc-guard's client; this stub reproduces just the fail-closed shape the POOL guards
// must re-throw FIRST - the property under test is makeUkemiPool's, not the client's.
const budgetedCall = (max: number, inner: RpcCall): RpcCall => { let n = 0; return (u, m, p) => { if (n >= max) return Promise.reject(new BudgetExceededError("ukemi-u4a: budget")); n += 1; return inner(u, m, p); }; };
test("u4_budget_fail_closed_not_swallowed", async () => {
  const okCall: RpcCall = () => Promise.resolve("0x2a"); // valid hex for asHex
  // eth_call: quorum needs 2 provider reads; budget 1 ⇒ the 2nd read throws budget ⇒ propagates (not no_quorum).
  {
    const call = budgetedCall(1, okCall);
    const pool = makeUkemiPool({ call, ethCallProviders: ["https://a.example", "https://b.example"], getLogsProviders: ["https://a.example", "https://b.example"], minIntervalMs: 0 });
    await assert.rejects(() => pool.ethCall("0xto", "0xdata", 100), BudgetExceededError, "budget stop propagates from quorum2 — never benched into no_quorum");
  }
  // finalized: budget 1 ⇒ the 2nd finalized read throws budget ⇒ propagates (not swallowed by the bare catch).
  {
    const blockCall: RpcCall = () => Promise.resolve({ hash: ZERO_WORD, number: "0x64", timestamp: "0x1" });
    const call = budgetedCall(1, blockCall);
    const pool = makeUkemiPool({ call, ethCallProviders: ["https://a.example", "https://b.example"], getLogsProviders: ["https://a.example"], minIntervalMs: 0 });
    await assert.rejects(() => pool.finalized(), BudgetExceededError, "budget stop propagates from finalized — never swallowed");
  }
  // getLogsRange: budget 0 ⇒ the first getLogs read throws budget ⇒ propagates (not range-split to the floor).
  {
    const logsCall: RpcCall = () => Promise.resolve([]);
    const call = budgetedCall(0, logsCall);
    const pool = makeUkemiPool({ call, ethCallProviders: ["https://a.example"], getLogsProviders: ["https://a.example", "https://b.example"], minIntervalMs: 0 });
    await assert.rejects(() => pool.getLogsRange("0xabc", ["0xtopic"], 1, 100), BudgetExceededError, "budget stop propagates from getLogsVia — never split");
  }
});

// GARDE-HELIUS-2b-ii: u4_never_prints_endpoint_url (makeDefaultCall + scrubUrls) and u4_budgeted_call_counts_per_operator_and_stops
// (makeBudgetedCall + operatorLabel + ARCHIVE_ENV_LABEL) are RETIRED - the key-hygiene of a raised message and the
// per-operator spend now live in @monark/rpc-guard: transport_error_never_echoes_operator_key / _drops_body_when_operator_url_unparseable
// / _key_straddling_truncation_never_leaks (transport) and client.spent().byOperator / two_paid_operators_keep_separate_priors_and_units
// (client). The recorder-side journal hygiene (never a raw body, by e.name) is pinned in ukemi-guard-record.test.ts.

// ── C-5 resume: a HIT returns the cached bytes without touching the base (no budget spend); a MISS delegates and
// is appended. Keys are case-insensitive on hex (a provider's format drift cannot force a re-read).
test("u4_resume_reader_hits_cache_and_appends_misses", async () => {
  let baseEthCalls = 0;
  const base: UkemiReader = {
    ethCall: () => { baseEthCalls++; return Promise.resolve("0xBA5E"); },
    getLogsRange: () => Promise.resolve([]),
    blockAt: () => Promise.resolve({ hash: ZERO_WORD, ts: 1 }),
    finalized: () => Promise.resolve({ block: 9, ts: 1 }),
  };
  const lines: CacheLine[] = [{ kind: "meta" }, { kind: "ethCall", to: "0xAA", data: "0xDD", block: 100, result: "0xCACHED" }];
  const appended: CacheLine[] = [];
  const r = makeResumeReader(base, lines, (l) => appended.push(l));
  assert.equal(await r.ethCall("0xaa", "0xdd", 100), "0xCACHED", "a hit returns the cached bytes (case-insensitive key)");
  assert.equal(baseEthCalls, 0, "a hit never touches the base reader (no budget spend)");
  assert.equal(await r.ethCall("0xBB", "0xEE", 100), "0xBA5E", "a miss delegates to the base");
  assert.equal(baseEthCalls, 1, "the miss cost exactly one base call");
  assert.deepEqual(appended, [{ kind: "ethCall", to: "0xBB", data: "0xEE", block: 100, result: "0xBA5E" }], "the miss is appended");
});

// ── C-5 abstention (mutant "cache --resume corrompu ⇒ abstention"): if the enumeration in the cache was tampered,
// recordBook's recomputed holders_digest disagrees with the `holders` line ⇒ ResumeCacheError (abstain). A fresh
// run (no holders line) is a no-op. Also exercises parseResumeLines fail-closed on a kind-less line.
test("u4_resume_corrupted_cache_abstains", () => {
  const base: UkemiReader = { ethCall: () => Promise.resolve("0x"), getLogsRange: () => Promise.resolve([]), blockAt: () => Promise.resolve({ hash: ZERO_WORD, ts: 1 }), finalized: () => Promise.resolve({ block: 1, ts: 1 }) };
  const r = makeResumeReader(base, [{ kind: "holders", n: 2, holders_digest: "DIGEST_X" }], () => { /* no append */ });
  assert.doesNotThrow(() => { assertResumeHoldersMatch("DIGEST_X", r); }, "a matching digest ⇒ no abstention");
  assert.throws(() => { assertResumeHoldersMatch("DIGEST_Y", r); }, ResumeCacheError, "a tampered/corrupted enumeration (digest mismatch) ⇒ abstention");
  const fresh = makeResumeReader(base, [{ kind: "meta" }], () => { /* no append */ });
  assert.doesNotThrow(() => { assertResumeHoldersMatch("ANYTHING", fresh); }, "a fresh run (no holders line) ⇒ no-op");
  assert.throws(() => parseResumeLines('{"no":"kind"}\n'), ResumeCacheError, "a kind-less cache line fails closed at parse");
  assert.deepEqual(parseResumeLines('{"kind":"meta","x":1}\n\n'), [{ kind: "meta", x: 1 }], "blank lines are skipped");
});

// ── C-5 reduced-log identity (backs u4_book_replays_bit_identical + the O(N) cache): the reduced synthetic Transfer
// logs (one per distinct recipient) reproduce the holders_digest of the RAW stream bit-identically, and the zero
// address is dropped. Mutant "position-removed" (drop a recipient from the reduced set) ⇒ digest drift.
test("u4_reduced_recipient_logs_preserve_holders_digest", () => {
  const tlog = (to: string) => ({ blockNumber: "0x1", logIndex: "0x0", transactionHash: ZERO_WORD, topics: [TRANSFER_TOPIC0, ZERO_WORD, topicAddr(to)], data: "0x" });
  const A = "0x00000000000000000000000000000000000000aa", B = "0x00000000000000000000000000000000000000bb", C = "0x00000000000000000000000000000000000000cc";
  const ZERO = "0x0000000000000000000000000000000000000000";
  const raw = [tlog(A), tlog(A), tlog(B), tlog(ZERO), tlog(C)]; // dup A, a zero-address recipient
  const { holders: hRaw, holders_digest: dRaw } = holdersDigestOf(transferRecipients(raw));
  assert.deepEqual(hRaw, [A, B, C], "distinct recipients, zero address dropped, sorted");
  const reduced = reducedRecipientLogs(hRaw);
  assert.equal(holdersDigestOf(transferRecipients(reduced)).holders_digest, dRaw, "reduced logs reproduce the holders_digest bit-identically (O(N) cache)");
  const dropped = holdersDigestOf(transferRecipients(reducedRecipientLogs([A, B]))).holders_digest; // a recipient removed
  assert.notEqual(dropped, dRaw, "dropping a recipient shifts the digest (mutant 'position-removed' ⇒ red)");
});

// ── D-3 --filter-only: the config-filter core enumerates + counts at-risk WITHOUT any per-account read, on REAL
// recorded bytes (weth-book.fixture.json). Drift-guard vs recordBook: same holders_digest, and n_at_risk_config =
// counts.at_risk + excluded_zero_balance (config-passing = final at-risk + zero-balance-excluded). Mutant
// "--filter-only ignored / not honored" (the core does a per-account read) ⇒ a getUserAccountData/getUserEMode/
// balanceOf selector appears ⇒ RED.
interface Fx { block: number; block_hash: string; block_ts: number; finalized_block: number; enumeration_logs: LogEntry[]; calls: Record<string, string>; }
const FX = JSON.parse(readFileSync(join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "weth-book.fixture.json"), "utf8")) as Fx;
function fxReader(onEthCall?: (to: string, data: string) => void): UkemiReader {
  return {
    ethCall(to, data) { if (onEthCall) onEthCall(to, data); const v = FX.calls[`${to.toLowerCase()}|${data.toLowerCase()}`]; return v === undefined ? Promise.reject(new Error(`fixture miss ${to}|${data}`)) : Promise.resolve(v); },
    getLogsRange() { return Promise.resolve(FX.enumeration_logs); },
    blockAt() { return Promise.resolve({ hash: FX.block_hash, ts: FX.block_ts }); },
    finalized() { return Promise.resolve({ block: FX.finalized_block, ts: FX.block_ts }); },
  };
}
test("u4_filter_only_stops_after_config_and_matches_recordbook", async () => {
  const full = await recordBook(CLUSTER_WETH, FX.block, fxReader());
  const seen: string[] = [];
  const fr = await enumerateAndCountAtRisk(CLUSTER_WETH, FX.block, fxReader((_to, data) => seen.push(data.slice(0, 10).toLowerCase())));
  // Drift-guard: same enumeration, and config-passing = final at-risk + zero-balance-excluded.
  assert.equal(fr.holders_digest, full.holders_digest, "filter-only enumerates the SAME holders as recordBook");
  assert.equal(fr.n_at_risk_config, full.counts.at_risk + full.counts.excluded_zero_balance, "n_at_risk_config = final at_risk + zero-balance-excluded (config-passing upper bound)");
  // Mutant-backing: NO per-account selector is ever read by the filter-only core.
  const perAccount = new Set([SEL.getUserAccountData, SEL.getUserEMode, SEL.balanceOf].map((s) => s.toLowerCase()));
  const leaked = seen.filter((s) => perAccount.has(s));
  assert.deepEqual(leaked, [], "filter-only makes NO getUserAccountData/getUserEMode/balanceOf read (--filter-only honored)");
  assert.ok(seen.some((s) => s === SEL.getUserConfiguration.toLowerCase()), "filter-only DOES read getUserConfiguration (the filter itself)");
});

// ── D-4 per-operator throttle: a slow operator waits `slowIntervalMs`, the rest `minIntervalMs`. Pure resolution
// (polite() consults it). Mutant "slowOperators ignored" (resolveInterval always returns minIntervalMs) ⇒ red.
test("u4_resolve_interval_per_operator", () => {
  const slow = ["drpc.org"];
  assert.equal(resolveInterval("drpc.org", 50, slow, 200), 200, "a slow operator uses slowIntervalMs (raised alone)");
  assert.equal(resolveInterval("mevblocker.io", 50, slow, 200), 50, "a normal operator keeps minIntervalMs");
  assert.equal(resolveInterval("drpc.org", 50, [], 200), 50, "empty slow set ⇒ minIntervalMs (mutant: slowOperators ignored ⇒ line 1 reds)");
});

// GARDE-HELIUS-2b-ii: u4_exclude_operator_drops_degraded_keeps_quorum is RETIRED - applyExcludeOperators is removed;
// operator selection is now an EXPLICIT --operators include list (not listing an operator excludes it). The include
// list is pinned recorder-side by ukemi_record_requires_the_six_run_inputs_and_validates_operators, and the
// >= 2-distinct-operator (by operatorOf) fail-closed guard by ukemi_record_distinct_guard_by_operator - both in
// ukemi-guard-record.test.ts driving runRecorder over the guard (GARDE-HELIUS-2b-ii-c C-G-2 / C-R-b3).

// ── D_e (C-4/C-3) abi additions: COMPUTED selectors/topic + the e-mode decoder validated on REAL @B₀ bytes. The
// AnswerUpdated topic0 reproduces the well-known Chainlink value via the self-tested keccak (signature proof);
// decInt256 is two's-complement signed (AnswerUpdated.current is int256); decodeEModeCategoryData reads the
// OFFSET-PREFIXED dynamic tuple (a bare-tuple mutant reads LT from the ltv slot ⇒ 9300 ≠ 9500 ⇒ red).
test("u4_de_selectors_topic_and_int256", () => {
  assert.equal(SEL.aggregator, selector("aggregator()"), "aggregator() selector computed (not pasted)");
  assert.equal(SEL.getEModeCategoryData, selector("getEModeCategoryData(uint8)"), "getEModeCategoryData(uint8) selector computed");
  assert.equal(ANSWER_UPDATED_TOPIC0, keccak256("AnswerUpdated(int256,uint256,uint256)"), "AnswerUpdated topic0 computed via the self-tested keccak");
  assert.equal(ANSWER_UPDATED_TOPIC0, "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f", "== the well-known Chainlink AnswerUpdated topic0 (signature proof — matched the on-chain logs of the resolved aggregator)");
  assert.equal(decInt256("0x" + "f".repeat(64)), -1n, "decInt256 two's-complement (-1)");
  assert.equal(decInt256("0x" + (345670460000n).toString(16).padStart(64, "0")), 345670460000n, "a positive int256 (p_min) decodes unchanged");
});

test("u4_decode_emode_category_data_real_bytes", () => {
  // MEASURED getEModeCategoryData(1) @B₀ (impl 0x97287a4f…): label "ETH correlated", ltv 9300 / LT 9500 / bonus 10100.
  const cat1 = "0x" +
    "0000000000000000000000000000000000000000000000000000000000000020" + // dynamic-tuple offset (0x20 ⇒ struct @word1)
    "0000000000000000000000000000000000000000000000000000000000002454" + // ltv 9300
    "000000000000000000000000000000000000000000000000000000000000251c" + // liquidationThreshold 9500
    "0000000000000000000000000000000000000000000000000000000000002774" + // liquidationBonus 10100
    "0000000000000000000000000000000000000000000000000000000000000000" + // priceSource 0x0
    "00000000000000000000000000000000000000000000000000000000000000a0" + // string offset
    "000000000000000000000000000000000000000000000000000000000000000e" + // len 14
    "45544820636f7272656c61746564000000000000000000000000000000000000";  // "ETH correlated"
  const d = decodeEModeCategoryData(cat1);
  assert.equal(d.ltvBps, 9300n, "ltv (first word after the tuple offset)");
  assert.equal(d.liquidationThresholdBps, 9500n, "liquidationThreshold — the LT that drives the HF recompute under D_e (C-3)");
  assert.equal(d.liquidationBonusBps, 10100n, "liquidationBonus");
  assert.equal(d.priceSource, "0x0000000000000000000000000000000000000000", "priceSource (default oracle)");
});
