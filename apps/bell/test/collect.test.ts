// MONARK Bell — T-1a-ii collector oracle (ADR-T1aii D1 lot -a, D5). Named mutants, each RED by construction.
// No network (readers pre-decide quorum; the low-level call is injected where the quorum primitive is tested).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { assertOutsideRepo, collect, chainTimeline, parseArgs, fatalMessage, makeBudgetedCall, refCloseDatesForFills, type SymbolInput } from "../src/collect.ts";
import { quorum2, signaturesSetKey, statusOf, isSolRevert, NoQuorumError, QuorumDisagreementError, ConcordantRevertError,
  BudgetExceededError, SolRpcError, type JsonRpcCall, type TransportFault } from "../src/quorum.ts";
import { readMintToken2022, porStatus, wrapperStatus, supplyVsPoRStatement, rebaseGate, rebaseGateFromMint, rebaseForMint } from "../src/supply.ts";
import { coverageDecision, foundingCourseCostFloorSigs } from "../src/coverage.ts";
import { volumeToAdvRatio, poolVolumeBase } from "../src/volume.ts";
import { assertNoClose } from "../src/digest.ts";
import { newResidualCounts, RESIDUAL_CODES } from "../src/residuals.ts";
import { solanaEndpoints, PUBLIC_SOLANA, type SwapFill } from "../src/rpc.ts";
import { providerOf } from "../../sentinel/src/rpc.ts";
import { operatorOf } from "../src/operators.ts";
import type { HaltRow } from "../src/halts.ts";
import { classifySession, refCloseDateOf } from "../src/sessions.ts";
import { decodeV3Swap, ethSwapToFill, ethVwap, UNISWAP_V3_SWAP_TOPIC } from "../src/ethereum.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const SERIES = join(HERE, "fixtures", "series");
const SRC = readFileSync(join(HERE, "..", "src", "collect.ts"), "utf8"); // source, for the V-1/V-3 wiring proofs

/** Load the reduced REAL session fills (sha-pinned under series/, PROVENANCE same-dir). */
function loadSeriesFills(): SwapFill[] {
  const text = readFileSync(join(SERIES, "tslax-weekend-fills.jsonl"), "utf8");
  return text.split(/\r?\n/).filter((l) => l.trim()).map((l) => {
    const o = JSON.parse(l) as { signature: string; blockTimeUtcMs: number; baseDelta: string; quoteDelta: string };
    return { signature: o.signature, blockTimeUtcMs: o.blockTimeUtcMs, baseDelta: BigInt(o.baseDelta), quoteDelta: BigInt(o.quoteDelta) };
  });
}
function loadMintFixture(): unknown {
  return JSON.parse(readFileSync(join(SERIES, "tslax-mint-token2022.json"), "utf8"));
}

function tslaxInput(closeAnchor: number | null): SymbolInput {
  const fills = loadSeriesFills();
  const mint = readMintToken2022(loadMintFixture(), "TSLAx");
  // anchor the close on the trading day the collector computes for these fills (a real weekend session).
  const closeRefBySession: Record<string, number> = {};
  if (closeAnchor !== null) {
    // classifySession is deterministic; use the same anchor the core will compute.
    for (const f of fills) closeRefBySession[anchorKeyOf(f.blockTimeUtcMs)] = closeAnchor;
  }
  return { symbol: "TSLAx", chain: "solana", baseDec: 8, quoteDec: 6, fills, fillsResidues: [], quorumCoverage: 1,
    closeRefBySession, advDailyVolumes: [1_000_000, 1_100_000, 900_000], mint };
}
const anchorKeyOf = (utcMs: number): string => classifySession(utcMs).sessionDateET;

// Re-pinned at -b1 (C-6): the closed residual set grew by `rebase_unverified`, so the digest's `residuals`
// map carries one more key (`rebase_unverified: 0`) and its sha shifts. The fixture BYTES are unchanged; the
// drift is the intended residual-vocabulary extension, recomputed here (a fixture byte still reddens this).
const PINNED_BELL_SHA = "eaed7ea4b200cf97957d5ea0b4ac4a5f3f4fa6870af7c640fcc61d1c700d6df6";

// ---- replay (bit-identical) ----------------------------------------------------------------------
test("bell_collector_replays_fixture_bit_identical", () => {
  const anchor = anchorKeyOf(loadSeriesFills()[0]!.blockTimeUtcMs);
  const base = tslaxInput(364.5);
  const a = collect({ symbols: [base], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "2026-09-19T00:00:00Z" });
  const b = collect({ symbols: [tslaxInput(364.5)], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "2026-09-19T99:99:99Z" });
  assert.equal(a.bellSha, b.bellSha, "same inputs => bit-identical bell_sha (generatedAt is NOT hashed)");
  // the series carries a real weekend session anchored on the prior trading day
  assert.equal(anchor, "2026-09-18");
  // D5 on the series FILE: no close-like field and no ADV in the committed series (mutant: add one => throws)
  const raw = readFileSync(join(SERIES, "tslax-weekend-fills.jsonl"), "utf8").split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l) as unknown);
  assert.doesNotThrow(() => { for (const o of raw) assertNoClose(o); });
  assert.doesNotThrow(() => { assertNoClose(loadMintFixture()); });
  // pinned digest: a single byte of the series (a delta) or the mint (supply) changes bell_sha => this reddens
  assert.equal(a.bellSha, PINNED_BELL_SHA, "series/mint fixture drifted from the pinned digest");
});

// ---- quorum (no quorum on a single provider) -----------------------------------------------------
test("bell_no_quorum_on_single_provider", async () => {
  const ok: JsonRpcCall = () => Promise.resolve("V");
  const keyOf = (v: unknown): string => String(v);
  const fetchOne = (c: JsonRpcCall, u: string): Promise<unknown> => c(u, "m", [u]);
  // C-1 archival concordance: the signature-SET key is order-independent and set-sensitive
  assert.equal(signaturesSetKey(["s2", "s1"]), signaturesSetKey(["s1", "s2"]));
  assert.notEqual(signaturesSetKey(["s1"]), signaturesSetKey(["s1", "s2"]));
  // one provider => no quorum
  await assert.rejects(quorum2("x", ["https://a.solana.com"], ok, fetchOne, keyOf), NoQuorumError);
  // two ALIASES of one provider (providerOf collapses to solana.com) => still no quorum
  await assert.rejects(quorum2("x", ["https://a.solana.com", "https://b.solana.com"], ok, fetchOne, keyOf), NoQuorumError);
  // C-1a: the DEFAULT endpoint list is a SINGLE provider (publicnode retired), so a read with no Helius
  // override via BELL_SOLANA_RPC is no_quorum — fail-closed, not a silent Helius-less quorum.
  const def = solanaEndpoints({});
  assert.deepEqual([...def], ["https://api.mainnet-beta.solana.com"]);
  assert.equal(providerOf(def[0]!), "solana.com");
  assert.equal(new Set(def.map(providerOf)).size, 1, "the default is one distinct provider");
  await assert.rejects(quorum2("default", def, ok, fetchOne, keyOf), NoQuorumError, "the default list alone is no_quorum");
  // two DISTINCT providers, concordant => the value
  assert.equal(await quorum2("x", ["https://api.mainnet-beta.solana.com", "https://mainnet.helius-rpc.com"], ok, fetchOne, keyOf), "V");
  // two distinct providers that DISAGREE => fail-closed
  const disagree: JsonRpcCall = (u) => Promise.resolve(u.includes("helius") ? "H" : "M");
  await assert.rejects(quorum2("x", ["https://api.mainnet-beta.solana.com", "https://mainnet.helius-rpc.com"], disagree, fetchOne, keyOf), QuorumDisagreementError);
  // concordant node error across two providers => ConcordantRevertError (a deterministic on-chain fact)
  const revert: JsonRpcCall = () => Promise.reject(new SolRpcError("account not found", -32602));
  await assert.rejects(quorum2("x", ["https://api.mainnet-beta.solana.com", "https://mainnet.helius-rpc.com"], revert, fetchOne, keyOf), ConcordantRevertError);
  // a symbol whose reader returned no_quorum is counted, with no gap entry for it
  const r = collect({ symbols: [{ symbol: "SPYx", chain: "solana", baseDec: 8, quoteDec: 6, fills: [], fillsResidues: ["no_quorum"], closeRefBySession: {}, advDailyVolumes: [] }],
    haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  const d = r.digest as { residuals: Record<string, number>; gaps: unknown[] };
  assert.equal(d.residuals.no_quorum, 1);
  assert.equal(d.gaps.length, 0);
});

// ---- C-9: quorum distinctness is by OPERATOR, not by DNS labels ----------------------------------
test("bell_quorum_pair_two_operators", async () => {
  // operatorOf collapses a provider's alias hosts to ONE operator (no hex key in these — hostnames only).
  assert.equal(operatorOf("https://solana-mainnet.core.chainstack.com"), "chainstack");
  assert.equal(operatorOf("https://nd-123-456-789.p2pify.com"), "chainstack"); // legacy host, SAME operator
  assert.equal(operatorOf("https://mainnet.helius-rpc.com"), "helius");
  assert.equal(operatorOf("https://api.mainnet-beta.solana.com"), "solana-foundation");
  assert.equal(operatorOf("https://bsc-dataseed1.binance.org"), operatorOf("https://bsc-dataseed2.bnbchain.org"));
  assert.equal(operatorOf("https://new.example.com"), "example.com"); // unmapped -> its own operator (safe default)
  const ok: JsonRpcCall = () => Promise.resolve("V");
  const fetchOne = (c: JsonRpcCall, u: string): Promise<unknown> => c(u, "m", [u]);
  const keyOf = (v: unknown): string => String(v);
  // a PAIR of two Chainstack hosts is ONE operator => no_quorum (the C-9 fix; providerOf would have passed it)
  await assert.rejects(quorum2("cs-pair", ["https://solana-mainnet.core.chainstack.com", "https://nd-1.p2pify.com"], ok, fetchOne, keyOf), NoQuorumError);
  // Helius + Chainstack = two operators => the value
  assert.equal(await quorum2("h+cs", ["https://mainnet.helius-rpc.com", "https://solana-mainnet.core.chainstack.com"], ok, fetchOne, keyOf), "V");
  // providers_distinct in the journal counts OPERATORS: two Chainstack hosts + Helius = 2, not 3
  const r = collect({ symbols: [], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1, staleBoundSec: 1, generatedAt: "t",
    providers: ["https://solana-mainnet.core.chainstack.com", "https://nd-1.p2pify.com", "https://mainnet.helius-rpc.com"] });
  assert.equal((r.journal as { providers_distinct: number }).providers_distinct, 2);
});

// ---- O-9: isSolRevert tells a deterministic node error from a transport/rate fault ---------------
test("bell_is_sol_revert_transport_vs_deterministic", () => {
  // transport-like node codes BENCH (not a revert): -32005 behind/rate, -32004 slot not available, -32603 internal
  for (const code of [-32005, -32004, -32603]) assert.equal(isSolRevert(new SolRpcError("transport-like", code)), false, `code ${String(code)} is transport`);
  // deterministic node errors ARE reverts (identical across honest providers -> a concordant on-chain fact)
  for (const code of [-32602, -32601, -32000, 0]) assert.equal(isSolRevert(new SolRpcError("deterministic", code)), true, `code ${String(code)} is deterministic`);
  // a plain transport Error (HTTP/timeout) is NEVER a revert
  assert.equal(isSolRevert(new Error("HTTP 429")), false);
  assert.equal(isSolRevert(new Error("abort/timeout")), false);
});

// ---- O-10: solanaEndpoints reads BELL_SOLANA_RPC (env override), fail-closed to the public default ---------
test("bell_solana_endpoints_env_override", () => {
  // default (no env): the SINGLE public archival endpoint (publicnode retired) -> one operator -> no_quorum by design
  assert.deepEqual([...solanaEndpoints({})], [...PUBLIC_SOLANA]);
  // BELL_SOLANA_RPC (comma-separated): trimmed, empties dropped -> the live quorum list (Helius + Chainstack)
  const two = solanaEndpoints({ BELL_SOLANA_RPC: " https://mainnet.helius-rpc.com , https://solana-mainnet.core.chainstack.com ,, " });
  assert.deepEqual([...two], ["https://mainnet.helius-rpc.com", "https://solana-mainnet.core.chainstack.com"]);
  assert.equal(new Set([...two].map(operatorOf)).size, 2, "the override yields two distinct operators");
  // a blank override falls back to the default (never an empty endpoint list)
  assert.deepEqual([...solanaEndpoints({ BELL_SOLANA_RPC: "   " })], [...PUBLIC_SOLANA]);
});

// ---- (iv) PoR staleness + wrapper rate + Token-2022 readout --------------------------------------
test("bell_por_staleness_and_wrapper_rate", () => {
  const m = readMintToken2022(loadMintFixture(), "TSLAx");
  assert.equal(m.multiplier, "1");
  assert.equal(m.paused, false);
  assert.ok(m.permanentDelegate && m.permanentDelegate.length > 30, "permanent delegate read (parity fact, T-2)");
  assert.ok(/^\d+$/.test(m.supply), "supply is a raw base-unit integer string");
  // no relayed value => por_unavailable, with a NAMED method (never a bare unavailable)
  const unavail = porStatus("TSLAx", 1_800_000_000, 93_600);
  assert.equal(unavail.kind, "unavailable");
  assert.ok(unavail.kind === "unavailable" && unavail.residue === "por_unavailable");
  assert.ok(unavail.source.method.length > 0, "PoR method is named");
  // a stale relayed value => por_stale
  const st = porStatus("TSLAx", 1_800_000_000, 3_600, { value: "1", updatedAtSec: 1_800_000_000 - 7_200 });
  assert.equal(st.kind, "stale");
  // a fresh relayed value => ok + the honest statement (no surclaim)
  const ok = porStatus("TSLAx", 1_800_000_000, 3_600, { value: "1", updatedAtSec: 1_800_000_000 - 60 });
  assert.equal(ok.kind, "ok");
  assert.ok(ok.kind === "ok" && ok.statement.includes("not verified against the custodian"));
  assert.ok(!/\bguarantee|\bpartner|verified against the custodian is|price band/i.test(supplyVsPoRStatement("TSLAx")));
  // wrapper rate: no wrapper contract is named first-hand => no_wrapper (never a fabricated rate)
  const wr = wrapperStatus("TSLAx");
  assert.equal(wr.residue, "no_wrapper");
  assert.equal(wr.contracts.length, 0);
});

// ---- C-7: reference close is per reference-close DAY, look-ahead-safe (never one /prev for all) ----
test("bell_close_per_reference_day_no_lookahead", () => {
  // off-hours regimes + `after` reference the ANCHOR day's (settled) close; pre/regular reference the PRIOR
  // trading day's close (the same-day close has not settled at session time). Mutant: return anchor for pre
  // => the look-ahead assertions redden.
  assert.equal(refCloseDateOf("weekend", "2026-09-18"), "2026-09-18");
  assert.equal(refCloseDateOf("holiday", "2026-01-16"), "2026-01-16");
  assert.equal(refCloseDateOf("overnight-weekday", "2026-09-16"), "2026-09-16");
  assert.equal(refCloseDateOf("after", "2026-09-16"), "2026-09-16");
  assert.equal(refCloseDateOf("pre", "2026-09-17"), "2026-09-16"); // Wed close, NOT Thu (a look-ahead)
  assert.equal(refCloseDateOf("regular", "2026-09-17"), "2026-09-16");
  // two overnight fills on adjacent trading days map to DISTINCT reference-close days — the C-7 bug applied
  // ONE /prev close to every anchor; the fix keys per day. Wed 22:00 ET and Thu 22:00 ET (UTC-4 in Sept).
  const wed: SwapFill = { signature: "w", blockTimeUtcMs: Date.UTC(2026, 8, 17, 2, 0, 0), baseDelta: 1n, quoteDelta: 1n };
  const thu: SwapFill = { signature: "t", blockTimeUtcMs: Date.UTC(2026, 8, 18, 2, 0, 0), baseDelta: 1n, quoteDelta: 1n };
  assert.deepEqual(refCloseDatesForFills([wed, thu]), ["2026-09-16", "2026-09-17"]);
});

// ---- C-6: rebase gate — constant multiplier or the sessions abstain (never a rescaled g_t) --------
test("bell_rebase_gate_constant_or_abstains", () => {
  assert.deepEqual(rebaseGate("1", "1"), { status: "constant", multiplier: "1" });
  assert.deepEqual(rebaseGate("2", "2"), { status: "constant", multiplier: "2" });
  for (const g of [rebaseGate("1", "2"), rebaseGate(null, "1"), rebaseGate("1", null), rebaseGate(null, null)]) {
    assert.equal(g.status, "unverified");
    assert.ok(g.status === "unverified" && g.residue === "rebase_unverified");
  }
});

test("bell_rebase_gate_from_mint_immutable_vs_mutable", () => {
  const base = { symbol: "X", decimals: 8, supply: "0", paused: false, permanentDelegate: null };
  // immutable multiplier (no scaledUiAmount update authority) => constant at its value (readable at both bounds)
  assert.deepEqual(rebaseGateFromMint({ ...base, multiplier: "1", newMultiplier: "1", newMultiplierEffectiveTimestampSec: 0, scaledAuthority: null }), { status: "constant", multiplier: "1" });
  assert.deepEqual(rebaseGateFromMint({ ...base, multiplier: "2", newMultiplier: "2", newMultiplierEffectiveTimestampSec: 0, scaledAuthority: null }), { status: "constant", multiplier: "2" });
  // MUTABLE multiplier (authority present — every measured xStock shares S7vYFF…): the historical begin bound is
  // unreadable at -b1 => rebase_unverified (deferred to -b3's SetMultiplier reconstruction).
  const g = rebaseGateFromMint({ ...base, multiplier: "1", newMultiplier: "1", newMultiplierEffectiveTimestampSec: 0, scaledAuthority: "SomeUpdateAuthority1111" });
  assert.ok(g.status === "unverified" && g.residue === "rebase_unverified");
  assert.equal(rebaseGateFromMint({ ...base, multiplier: "1.0039", newMultiplier: "1.0057", newMultiplierEffectiveTimestampSec: 1781755200, scaledAuthority: "auth" }).status, "unverified");
});

test("bell_rebase_unverified_abstains_sessions", () => {
  // an unverified pool-window: every session abstains rebase_unverified, carrying vwap but NO gT.
  const s: SymbolInput = { ...tslaxInput(364.5), rebase: { status: "unverified", residue: "rebase_unverified" } };
  const r = collect({ symbols: [s], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  const d = r.digest as { residuals: Record<string, number>; gaps: Array<Record<string, unknown>> };
  assert.ok((d.residuals.rebase_unverified ?? 0) >= 1, "rebase_unverified counted");
  const g = d.gaps.find((x) => x.abstain === "rebase_unverified");
  assert.ok(g, "a rebase_unverified gap entry exists");
  assert.ok(!("gT" in (g ?? {})), "no gT on an unverified pool-window");
  assert.ok(typeof g.vwap === "string", "the first-hand vwap is still carried");
  // a CONSTANT gate does NOT abstain: the same input with a constant gate computes g_t normally.
  const ok = collect({ symbols: [{ ...tslaxInput(364.5), rebase: { status: "constant", multiplier: "1" } }], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  assert.equal((ok.digest as { residuals: Record<string, number> }).residuals.rebase_unverified, 0);
  assert.ok((ok.digest as { gaps: Array<Record<string, unknown>> }).gaps.some((x) => "gT" in x), "constant gate => g_t computed");
});

// ---- V-7: no_close_ref is a named residual (never a fabricated gap) ------------------------------
test("bell_no_close_ref_is_a_named_residual", () => {
  // fills present but NO close in the map => abstain no_close_ref, carry vwap, NO gT (never a fake 0/-Inf gap)
  const noClose = tslaxInput(null);
  const r = collect({ symbols: [noClose], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  const d = r.digest as { residuals: Record<string, number>; gaps: Array<Record<string, unknown>> };
  assert.equal(d.residuals.no_close_ref, 1);
  const g = d.gaps.find((x) => x.abstain === "no_close_ref");
  assert.ok(g, "a no_close_ref gap entry exists");
  assert.ok(!("gT" in (g ?? {})), "no gT when there is no close ref");
  assert.ok(typeof g.vwap === "string", "the first-hand vwap is still carried");
  // closeRef <= 0 is ALSO a no_close_ref (V-7): never a fabricated gap
  const zero = { ...tslaxInput(0), closeRefBySession: { "2026-09-18": 0 } };
  const r2 = collect({ symbols: [zero], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  assert.equal((r2.digest as { residuals: Record<string, number> }).residuals.no_close_ref, 1);
});

// ---- D8: abstentions counted (mutant: a frozen counter reddens) ----------------------------------
test("bell_abstentions_counted", () => {
  const A: SymbolInput = { symbol: "AAPLx", chain: "solana", baseDec: 8, quoteDec: 6, fills: [], fillsResidues: ["no_quorum"], closeRefBySession: {}, advDailyVolumes: [] };
  const oneFill: SwapFill = { signature: "b1", blockTimeUtcMs: 1_789_824_710_000, baseDelta: 15_000_000n, quoteDelta: -54_000_000n };
  const B: SymbolInput = { symbol: "TSLAx", chain: "solana", baseDec: 8, quoteDec: 6, fills: [oneFill], fillsResidues: ["quorum_sampled"], quorumCoverage: 0.5,
    closeRefBySession: {}, advDailyVolumes: [1000], mint: { symbol: "TSLAx", decimals: 8, supply: "100", multiplier: "2", paused: false, permanentDelegate: null, scaledAuthority: null, newMultiplier: "2", newMultiplierEffectiveTimestampSec: 0 } };
  const halts: HaltRow[] = [
    { haltDate: "2026-09-15", haltTime: "10:00:00", symbol: "TSLA", name: "x", exchange: "Nasdaq", reason: "LULD pause", resumeDate: "2026-09-15", resumeTime: "" },
    { haltDate: "2026-09-15", haltTime: "11:00:00", symbol: "TSLA", name: "x", exchange: "Nasdaq", reason: "ZZZ unknown graphie", resumeDate: "2026-09-15", resumeTime: "11:05:00" },
  ];
  const r = collect({ symbols: [A, B], haltRows: halts, window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  const c = (r.digest as { residuals: Record<string, number> }).residuals;
  assert.equal(c.no_quorum, 1, "A");
  assert.equal(c.quorum_sampled, 1, "B");
  assert.equal(c.no_close_ref, 1, "B missing close");
  assert.equal(c.por_unavailable, 2, "A + B");
  assert.equal(c.no_wrapper, 2, "A + B");
  assert.equal(c.multiplier_unit, 1, "B multiplier 2");
  assert.equal(c.block_ts_vs_submission, 2, "two halts, standing residue");
  assert.equal(c.resume_time_missing, 1, "one empty-resume halt");
  assert.equal(c.reason_unknown, 1, "one off-carte graphie");
  assert.equal(c.no_fill_in_window, 2, "two halts with no fills");
  assert.equal(c.por_stale, 0);
  assert.equal(c.resume_date_gt_halt_date, 0);
  // the state.json view carries the same counters (D8)
  assert.deepEqual((r.state as { residuals: Record<string, number> }).residuals, c);
});

// ---- C-10: journal + provenance carry no key (mutant: a raw URL reddens) -------------------------
test("bell_journal_and_provenance_carry_no_key", () => {
  const FAKE_UUID = "deadbeef-1234-5678-9abc-def012345678"; // a Helius-shaped api key (fake)
  const KEY_URL = `https://mainnet.helius-rpc.com/?api-key=${FAKE_UUID}`;
  // statusOf SCRUBS: an HTTP code survives, the url/uuid do NOT (mutant: return e.message => the url leaks)
  assert.equal(statusOf(new Error(`HTTP 429 ${KEY_URL}`)), "HTTP 429");
  assert.equal(statusOf(new Error(KEY_URL)), "transport");
  for (const s of [statusOf(new Error(`HTTP 429 ${KEY_URL}`)), statusOf(new Error(KEY_URL))]) {
    assert.ok(!/https?:\/\//.test(s) && !s.includes(FAKE_UUID) && !/api-key/i.test(s), "status token carries no url/key");
  }
  // a transport fault through the quorum records provider + sanitized status only
  const faults: TransportFault[] = [];
  const throwsUrl: JsonRpcCall = (u) => Promise.reject(new Error(`HTTP 429 https://${new URL(u).hostname}/?api-key=${FAKE_UUID}`));
  return quorum2("q", ["https://api.mainnet-beta.solana.com", "https://mainnet.helius-rpc.com"], throwsUrl, (c, u) => c(u, "m", []), (v) => String(v), faults)
    .then(() => assert.fail("should have no quorum"), (e: unknown) => {
      assert.ok(e instanceof NoQuorumError);
      assert.equal(faults.length, 2);
      for (const f of faults) assert.ok(!/https?:\/\//.test(f.status) && !f.status.includes(FAKE_UUID), "fault carries no url/key");
      // the full collector output (state + timeline + provenance + journal) carries no url / uuid / api-key
      const r = collect({ symbols: [{ symbol: "TSLAx", chain: "solana", baseDec: 8, quoteDec: 6, fills: [], fillsResidues: ["no_quorum"], closeRefBySession: {}, advDailyVolumes: [] }],
        haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t", faults, providers: ["solana.com", "helius-rpc.com"] });
      const blob = JSON.stringify([r.state, r.timeline, r.provenance, r.journal]);
      assert.ok(!/https?:\/\//.test(blob), "no raw url anywhere in the outputs");
      assert.ok(!blob.includes(FAKE_UUID), "no api key anywhere in the outputs");
      assert.ok(!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(blob), "no UUID anywhere in the outputs");
      assert.ok(!/api-key=/i.test(blob), "no api-key context anywhere in the outputs");
    });
});

// ---- C-9: the residual map has a single runtime source ------------------------------------------
test("bell_residual_map_is_single_source", () => {
  // the counter factory covers EXACTLY the closed code list (one source of truth)
  assert.deepEqual(Object.keys(newResidualCounts()).sort(), [...RESIDUAL_CODES].sort());
  // the collector's state + digest residual maps ARE that same closed set (wired, not a parallel list)
  const r = collect({ symbols: [], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1, staleBoundSec: 1, generatedAt: "t" });
  assert.deepEqual(Object.keys((r.digest as { residuals: Record<string, number> }).residuals).sort(), [...RESIDUAL_CODES].sort());
  assert.deepEqual(Object.keys((r.state as { residuals: Record<string, number> }).residuals).sort(), [...RESIDUAL_CODES].sort());
});

// ---- (iii) ratio killer + extended close/ADV guard ----------------------------------------------
test("bell_ratio_killer_adv_and_unit", () => {
  const vol = poolVolumeBase([{ signature: "x", blockTimeUtcMs: 1, baseDelta: 15_000_000n, quoteDelta: -54_000_000n }]);
  // a changed ADV changes the ratio (killer): adv1 != adv2 => vol_ratio differs
  assert.notEqual(volumeToAdvRatio(vol, 8, 1000, "1").vol_ratio, volumeToAdvRatio(vol, 8, 2000, "1").vol_ratio);
  // a multiplier != 1 flips the unit residue; multiplier 1 does not
  assert.equal(volumeToAdvRatio(vol, 8, 1000, "2").multiplier_unit, true);
  assert.equal(volumeToAdvRatio(vol, 8, 1000, "1").multiplier_unit, false);
  // adv must be > 0 (never a fabricated denominator)
  assert.throws(() => volumeToAdvRatio(vol, 8, 0, "1"));
  // extended close/ADV guard (C-6): adv|share_volume|volume_ref (bare) redden; the ratio key vol_ratio does not
  assert.throws(() => assertNoClose({ adv: 1 }));
  assert.throws(() => assertNoClose({ advShares: 1 }));
  assert.throws(() => assertNoClose({ share_volume: 1 }));
  assert.throws(() => assertNoClose({ volume_ref: 1 }));
  assert.doesNotThrow(() => assertNoClose({ vol_ratio: "0.5", volumeBase: "52", multiplier_unit: false }));
});

// ---- C-7: close_source is NAMED in provenance (never a close value); the close-guard still fires -----------
test("bell_close_source_named_in_provenance", () => {
  const r = collect({ symbols: [], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1, staleBoundSec: 1, generatedAt: "t", closeSource: "massive-starter-internal" });
  const sources = r.provenance.sources as { close_source?: string };
  assert.equal(sources.close_source, "massive-starter-internal"); // decision 41: the close provider is named
  assert.doesNotThrow(() => { assertNoClose(r.provenance.sources); }); // a non-numeric string does not redden
  assert.throws(() => { assertNoClose({ close_source: 364.27 }); }); // a NUMERIC close value still reddens (mutant)
  // absent closeSource => no close_source key at all (never a fabricated one)
  const r0 = collect({ symbols: [], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1, staleBoundSec: 1, generatedAt: "t" });
  assert.ok(!("close_source" in (r0.provenance.sources as object)));
});

// ---- timeline chain -----------------------------------------------------------------------------
test("bell_timeline_is_hash_chained", () => {
  const lines = chainTimeline([{ symbol: "TSLAx", n: 1 }, { symbol: "SPYx", n: 2 }]);
  const l0 = lines[0] as { prev_line_hash: string };
  const l1 = lines[1] as { prev_line_hash: string };
  assert.equal(l0.prev_line_hash, "0".repeat(64), "genesis");
  assert.equal(l1.prev_line_hash.length, 64, "chained to the previous line");
  assert.notEqual(l1.prev_line_hash, l0.prev_line_hash);
});

// ---- Ethereum leg: v3 Swap decode + signed VWAP (real TSLAon vector, grounded first-hand) --------
test("bell_eth_v3_swap_decode_and_vwap", () => {
  // grounded first-hand (rpc.mevblocker.io, 2026-09-19): the v3 Swap topic0
  assert.equal(UNISWAP_V3_SWAP_TOPIC, "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67");
  // a REAL TSLAon/USDC swap (tx 0x8a2908..., block 23802381): amount0 (USDC, negative = out), amount1 (TSLAon, in)
  const data = "0x" +
    "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff5392cf" + // amount0 = -11300145 (USDC 6dec)
    "00000000000000000000000000000000000000000000000000630b2ae59ae040" + // amount1 = 27878301563019328 (TSLAon 18dec)
    "0".repeat(64 * 3); // sqrtPriceX96 / liquidity / tick (not needed for VWAP)
  const { amount0, amount1 } = decodeV3Swap(data);
  assert.equal(amount0, -11_300_145n); // signed int256 two's-complement decode (negative)
  assert.equal(amount1, 27_878_301_563_019_328n);
  // base = token1 (TSLAon 18dec), quote = token0 (USDC 6dec) -> the fill feeds the same gap.ts path
  const fill = ethSwapToFill({ blockNumber: "0x16b57f0", logIndex: "0x0", transactionHash: "0x8a29", topics: [UNISWAP_V3_SWAP_TOPIC], data }, 1_789_000_000_000);
  assert.equal(fill.baseDelta, 27_878_301_563_019_328n);
  assert.equal(fill.quoteDelta, -11_300_145n);
  // signed VWAP (quote per base) ~ 405.34 USDC/TSLAon (a plausible TSLA price) -- magnitudes, so a sell adds too
  assert.equal(Number(ethVwap([fill])).toFixed(2), "405.34");
});

// ---- CA-11: --out guard is a pure, wired, case-robust function (mutant: neutralize OR unwire => red) ----
test("bell_out_guard_is_outside_the_repo", () => {
  // under the root (same case / the root itself / upper-cased / mixed separators) => throw (CA-11)
  assert.throws(() => assertOutsideRepo(join(HERE, "out-hole"), HERE), /CA-11/);
  assert.throws(() => assertOutsideRepo(HERE, HERE), /CA-11/);
  assert.throws(() => assertOutsideRepo(join(HERE, "out-hole").toUpperCase(), HERE), /CA-11/);
  assert.throws(() => assertOutsideRepo(HERE.replace(/\\/g, "/") + "/a\\b", HERE), /CA-11/);
  // a sibling OUTSIDE the root => ok (cross-platform anchor; CI is ubuntu, so F:/ literals are win32-only)
  assert.doesNotThrow(() => assertOutsideRepo(join(HERE, "..", "bell-out-sibling"), HERE));
  if (process.platform === "win32") {
    // the MEASURED win32 hole: same path, drive-letter lower-cased (the old startsWith missed f: vs F:)
    assert.throws(() => assertOutsideRepo(HERE[0]!.toLowerCase() + HERE.slice(1) + "\\out-hole", HERE), /CA-11/);
    assert.doesNotThrow(() => assertOutsideRepo(HERE[0]! + ":/tmp/bell-out", HERE)); // task's F:/tmp/x => ok
  }
  // Wiring proof (branchement): main() actually CALLS the guard — dropping the call reddens this test.
  assert.match(readFileSync(join(HERE, "..", "src", "collect.ts"), "utf8"), /assertOutsideRepo\(out, repoRoot\)/);
});

// ---- V-1: parseArgs is a pure, WIRED, fail-closed CLI parser (mutant: accept unknown / unwire => red) -----
test("bell_parseargs_fail_closed_and_wired", () => {
  const K = ["TSLAx", "SPYx", "NVDAx", "AAPLx", "TSLAon"];
  // these specific errors fire BEFORE the --max-calls requirement (ordering: pool/numeric/eth checked first).
  assert.throws(() => parseArgs(["--pools", "ZZZ"], K), /bell\/collect: unknown pool symbol 'ZZZ' \(known: /);
  assert.throws(() => parseArgs(["--window-days", "abc"], K), /bell\/collect: invalid numeric/);
  assert.throws(() => parseArgs(["--window-days", "-3"], K), /bell\/collect: invalid numeric/);
  assert.throws(() => parseArgs(["--pools", "TSLAon", "--eth"], K), /bell\/collect: --eth with TSLAon/);
  // C-11: --max-calls is REQUIRED and must be > 0. O-12: Infinity/NaN/negative rejected by num().
  assert.throws(() => parseArgs(["--pools", "TSLAx"], K), /bell\/collect: --max-calls is required/);
  assert.throws(() => parseArgs(["--pools", "TSLAx", "--max-calls", "0"], K), /bell\/collect: --max-calls must be > 0/);
  assert.throws(() => parseArgs(["--pools", "TSLAx", "--max-calls", "Infinity"], K), /bell\/collect: invalid numeric --max-calls/);
  assert.throws(() => parseArgs(["--pools", "TSLAx", "--max-calls", "-1"], K), /bell\/collect: invalid numeric --max-calls/);
  const g = parseArgs(["--pools", "TSLAon", "--eth", "--eth-from-block", "9", "--eth-to-block", "20", "--max-calls", "500"], K, 1_000);
  assert.deepEqual([g.wanted, g.eth, g.ethFrom, g.ethTo, g.toUtcMs, g.maxCalls], [["TSLAon"], true, 9, 20, 1_000, 500]);
  assert.match(SRC, /parseArgs\(argv, POOLS\.map/);
  assert.match(SRC, /makeBudgetedCall\(maxCalls,/); // wiring proof: main() enforces the budget through the wrapper
});

// ---- C-11 / O-12: the RPC budget is machine-enforced and fail-closed (never a swallowed fault) ------------
test("bell_max_calls_budget_fail_closed", async () => {
  let inner = 0;
  const okCall: JsonRpcCall = () => { inner += 1; return Promise.resolve("v"); };
  const { call, calls } = makeBudgetedCall(2, okCall);
  assert.equal(await call("u", "m", []), "v");
  assert.equal(await call("u", "m", []), "v");
  assert.equal(calls(), 2);
  // the 3rd call throws BudgetExceededError (a bell/collect: message, surfaced verbatim) and does NOT hit inner
  await assert.rejects(call("u", "m", []), BudgetExceededError);
  await assert.rejects(call("u", "m", []), /bell\/collect: --max-calls budget of 2 exceeded/);
  assert.equal(inner, 2, "over-budget calls never reach the inner RPC");
  // fatalMessage surfaces it verbatim (exit-1 path), so the operator sees the budget stop
  const e = new BudgetExceededError("bell/collect: --max-calls budget of 2 exceeded (C-11 fail-closed)");
  assert.match(fatalMessage(e), /^bell\/collect: --max-calls budget/);
  // wiring: quorum2 re-throws it (never swallowed as a {provider,status} fault)
  const faults: TransportFault[] = [];
  const overBudget: JsonRpcCall = () => Promise.reject(new BudgetExceededError("bell/collect: --max-calls budget of 0 exceeded (C-11 fail-closed)"));
  await assert.rejects(
    quorum2("q", ["https://mainnet.helius-rpc.com", "https://solana-mainnet.core.chainstack.com"], overBudget, (c, u) => c(u, "m", []), (v) => String(v), faults),
    BudgetExceededError);
  assert.equal(faults.length, 0, "a budget error is never recorded as a transport fault");
});

// ---- V-2: journal + provenance carry quorum_required + providers_distinct (derived via providerOf) --------
test("bell_journal_quorum_required_and_providers_distinct", () => {
  const r = collect({ symbols: [], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1, staleBoundSec: 1, generatedAt: "t",
    providers: ["https://api.mainnet-beta.solana.com", "https://mainnet.helius-rpc.com", "https://b.helius-rpc.com"] });
  const j = r.journal as { quorum_required: number; providers_distinct: number };
  assert.deepEqual([j.quorum_required, j.providers_distinct, "quorum" in (r.journal as object)], [2, 2, false]);
  assert.equal((r.provenance.providers as { providers_distinct: number }).providers_distinct, 2);
});

// ---- V-3: a LOCAL bell/collect: error is surfaced verbatim; a transport fault keeps the C-10 scrub --------
test("bell_fatal_message_verbatim_local_and_scrubbed_transport", () => {
  let local = "";
  try { assertOutsideRepo(HERE, HERE); } catch (e) { local = fatalMessage(e); }
  assert.match(local, /^bell\/collect: --out is under the repo root/);
  assert.equal(fatalMessage(new Error("HTTP 429 https://x.example/rpc")), "FATAL HTTP 429");
  assert.match(SRC, /main\(\)\.catch.*fatalMessage\(e\)/s);
});

// ---- C-G2-1 (BLOQUANT): a FAILED mint read must abstain (rebase_unverified), never a fail-open g_t ---------
test("bell_mint_read_failure_abstains_fail_closed", () => {
  // The LIVE mapping main() applies: an ABSENT mint (getAccountInfo quorum failed) => rebase_unverified.
  assert.deepEqual(rebaseForMint(undefined), { status: "unverified", residue: "rebase_unverified" });
  const baseMint = { symbol: "X", decimals: 8, supply: "0", paused: false, permanentDelegate: null, newMultiplier: "1", newMultiplierEffectiveTimestampSec: 0 };
  assert.equal(rebaseForMint({ ...baseMint, multiplier: "1", scaledAuthority: "auth" }).status, "unverified"); // mutable => unverified
  assert.deepEqual(rebaseForMint({ ...baseMint, multiplier: "1", scaledAuthority: null }), { status: "constant", multiplier: "1" }); // immutable => constant

  // integration: the SymbolInput main() builds on a FAILED mint read (repro-A shape), fed to the pure core.
  const oneFill: SwapFill = { signature: "s1", blockTimeUtcMs: Date.UTC(2026, 8, 19, 2, 0, 0), baseDelta: 15_000_000n, quoteDelta: -54_000_000n };
  const failed: SymbolInput = { symbol: "SPYx", chain: "solana", baseDec: 8, quoteDec: 6, fills: [oneFill],
    fillsResidues: ["no_quorum"], closeRefBySession: { "2026-09-17": 640, "2026-09-18": 640 }, advDailyVolumes: [] };
  const run = (s: SymbolInput): { residuals: Record<string, number>; gaps: Array<Record<string, unknown>> } =>
    collect({ symbols: [s], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" })
      .digest as { residuals: Record<string, number>; gaps: Array<Record<string, unknown>> };

  // AFTER (fixed wiring): rebase = rebaseForMint(undefined) => the session ABSTAINS, no g_t emitted.
  const after = run({ ...failed, rebase: rebaseForMint(undefined) });
  assert.ok(!after.gaps.some((g) => "gT" in g), "fixed: no g_t on a failed-mint session");
  assert.ok((after.residuals.rebase_unverified ?? 0) >= 1, "fixed: rebase_unverified counted");
  assert.equal(after.residuals.no_quorum, 1, "fixed: the no_quorum reason is still counted");
  assert.ok(after.gaps.some((g) => g.abstain === "rebase_unverified"), "fixed: abstain gap is named");

  // BEFORE (fail-open, documented): with rebase ABSENT, collect() computes a g_t — this is the repro-A bug. The
  // pure core is UNCHANGED by design (the fix lives in main()'s rebaseForMint), so the replay oracle stays green.
  const before = run(failed);
  assert.ok(before.gaps.some((g) => "gT" in g), "fail-open: absent rebase => g_t emitted (repro-A)");
  assert.equal(before.residuals.rebase_unverified, 0, "fail-open: no abstention when rebase absent");

  // wiring proof (SRC): main() applies the fail-closed mapping and pushes `rebase` UNCONDITIONALLY; the old
  // fail-open line (`... : undefined`) is gone.
  assert.match(SRC, /const rebase: RebaseGate = rebaseForMint\(mint\);/);
  assert.match(SRC, /\.\.\.\(mint \? \{ mint \} : \{\}\), rebase \}\);/);
  assert.doesNotMatch(SRC, /rebaseGateFromMint\(mint\) : undefined/);
});

// ---- C-G2-3: the mint readout preserves multiplier / newMultiplier / effTs distinctly (rule is [abs] offline) --
test("bell_mint_readout_preserves_scaled_fields", () => {
  // SPYx-shaped: multiplier != newMultiplier, effTs elapsed (2026-06-18Z). readMintToken2022 returns the STORED
  // multiplier verbatim (it does NOT silently resolve to newMultiplier — that rule is [abs], PR-B-SPL-TOKEN2022).
  const result = { value: { data: { parsed: { info: { supply: "1000", decimals: 8, extensions: [
    { extension: "scaledUiAmountConfig", state: { multiplier: "1.0039", newMultiplier: "1.0057", newMultiplierEffectiveTimestamp: 1781755200, authority: "S7vYFF" } },
  ] } } } } };
  const m = readMintToken2022(result, "SPYx");
  assert.equal(m.multiplier, "1.0039", "stored multiplier preserved verbatim");
  assert.equal(m.newMultiplier, "1.0057", "scheduled newMultiplier preserved");
  assert.equal(m.newMultiplierEffectiveTimestampSec, 1781755200, "effTs preserved (elapsed 2026-06-18Z, C-G2-2)");
  assert.notEqual(m.multiplier, m.newMultiplier, "the two are distinct — the resolving rule is [abs] offline");
  assert.equal(rebaseForMint(m).status, "unverified"); // gate unaffected: mutable authority => unverified
});

// ---- C-G2-5: the C-5 coverage decision (decision 45) — over threshold => top20 + published share -----------
test("bell_c5_coverage_projection_over_threshold_top20", () => {
  assert.equal(coverageDecision({ heliusCredits: 1_000_000, chainstackRu: 1_000_000, days: 3 }).mode, "full-population");
  // over EACH budget INDEPENDENTLY => top20 (mutant: drop one conjunct => that case wrongly stays full-population).
  const over1 = coverageDecision({ heliusCredits: 6_000_000, chainstackRu: 1_000_000, days: 3 });
  const over2 = coverageDecision({ heliusCredits: 1_000_000, chainstackRu: 20_000_000, days: 3 });
  const over3 = coverageDecision({ heliusCredits: 1_000_000, chainstackRu: 1_000_000, days: 9 });
  for (const d of [over1, over2, over3]) {
    assert.equal(d.mode, "top20-per-chain");
    assert.ok(d.mode === "top20-per-chain" && d.publishCoverageShare === true, "top20 publishes the covered share");
  }
  // NOT computable (census 0 in-window data — the measured -b1 case) => NAMED abstention, never "assume it fits".
  const none = coverageDecision(null);
  assert.ok(none.mode === "abstain" && none.reason === "projection_not_computable");
  // measured FLOOR (lower bound, capped): >= 8000 in-window sigs x 4 mints (spike-findings.json).
  assert.equal(foundingCourseCostFloorSigs(8000, 4), 32000);
});
