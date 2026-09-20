// MONARK Bell — T-1a-ii collector oracle (ADR-T1aii D1 lot -a, D5). Named mutants, each RED by construction.
// No network (readers pre-decide quorum; the low-level call is injected where the quorum primitive is tested).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { assertOutsideRepo, buildSolanaSymbol, collect, chainTimeline, parseArgs, fatalMessage, makeBudgetedCall, refCloseDatesForFills, runMain, type SymbolInput } from "../src/collect.ts";
import { POOLS, XSTOCKS } from "../src/pools.ts";
import { f64BitsHexLE, type MultiplierEvent } from "../src/rebase-trajectory.ts";
import { earliestPublishUtc, type DatabentoGet, type PolygonGet } from "../src/close.ts";
import { quorum2, signaturesSetKey, statusOf, isSolRevert, NoQuorumError, QuorumDisagreementError, ConcordantRevertError,
  BudgetExceededError, SolRpcError, type JsonRpcCall, type TransportFault } from "../src/quorum.ts";
import { readMintToken2022, porStatus, wrapperStatus, supplyVsPoRStatement, rebaseGate, rebaseGateFromMint, rebaseForMint } from "../src/supply.ts";
import { coverageDecision, foundingCourseCostFloorSigs } from "../src/coverage.ts";
import { volumeToAdvRatio, poolVolumeBase } from "../src/volume.ts";
import { assertNoClose, bellSha } from "../src/digest.ts";
import { newResidualCounts, RESIDUAL_CODES } from "../src/residuals.ts";
import { solanaEndpoints, PUBLIC_SOLANA, type SwapFill } from "../src/rpc.ts";
import { providerOf } from "../../sentinel/src/rpc.ts";
import { operatorOf } from "../src/operators.ts";
import { rowsFromCsv, type HaltRow } from "../src/halts.ts";
import { classifySession, refCloseDateOf, etWallClockToUtcMs } from "../src/sessions.ts";
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

/** L-4 (C-7): a synthetic 56-byte ScaledUiAmountConfig (authority 32 zero, then multiplier f64, effTs i64,
 *  new_multiplier f64, all little-endian) as base64 — the getAccountInfo(encoding:"base64") shape the C-3 anchor
 *  decodes. No real account bytes (a m=1 or a scheduled-update state is built field by field). */
function stateConfigB64(mult: number, effTs: number, newMult: number): string {
  const b = new Uint8Array(56);
  const dv = new DataView(b.buffer);
  dv.setFloat64(32, mult, true);
  dv.setBigInt64(40, BigInt(effTs), true);
  dv.setFloat64(48, newMult, true);
  return Buffer.from(b).toString("base64");
}

// Re-pinned at -b1 (C-6): the closed residual set grew by `rebase_unverified`, so the digest's `residuals`
// map carries one more key (`rebase_unverified: 0`) and its sha shifts. The fixture BYTES are unchanged; the
// drift is the intended residual-vocabulary extension, recomputed here (a fixture byte still reddens this).
// Re-pinned again at -b3a-3 (decision 60): the closed set grew by TWO more keys (`authority_scan_mono_operator: 0`,
// `set_authority_unscanned: 0`), so the `residuals` map and thus this digest shift once more — fixture BYTES still
// unchanged (was eaed7ea4b200cf97957d5ea0b4ac4a5f3f4fa6870af7c640fcc61d1c700d6df6).
// Re-pinned at -b3b: the digest gained (a) two more residual keys (`cash_cross_mismatch: 0`, `cash_cross_unavailable: 0`)
// and (b) an `earliest_publish_utc` field on each FILLED gap entry (C-6, digest placement). Fixture BYTES unchanged;
// PROOF BY SUBTRACTION (docs/PLI-lot-t1a-ii-b3b.md): stripping earliest_publish_utc from the gaps and the two
// cash_* keys from residuals recomputes exactly the -b3a sha 126abfaed17630808942a0dafc0ff6f1f9acf375d8f7adc6487d8c1e9e2c06d3.
const PINNED_BELL_SHA = "0cfbed20fc7ab4391b687d870452211cdce02c3cc19ab1cc8f0425a3c24743d7";
const PINNED_BELL_SHA_B3A = "126abfaed17630808942a0dafc0ff6f1f9acf375d8f7adc6487d8c1e9e2c06d3"; // -b3a, recovered by subtraction (b3b_subtraction test)

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

test("bell_rebase_gate_from_mint_needs_trajectory", () => {
  // C-1/C-12 (D1-quater): the CURRENT mint readout ALONE never grants `constant` — constancy is decided on the
  // replayed trajectory (rebaseGateFromTrajectory), not on the authority being null now (C-G2-8 shortcut CLOSED).
  const base = { symbol: "X", decimals: 8, supply: "0", paused: false, permanentDelegate: null };
  // null authority ("immutable now") => still unverified without the trajectory (null-now != null-in-2025).
  assert.equal(rebaseGateFromMint({ ...base, multiplier: "1", newMultiplier: "1", newMultiplierEffectiveTimestampSec: 0, scaledAuthority: null }).status, "unverified");
  assert.equal(rebaseGateFromMint({ ...base, multiplier: "2", newMultiplier: "2", newMultiplierEffectiveTimestampSec: 0, scaledAuthority: null }).status, "unverified");
  // present authority (every measured xStock shares S7vYFF…) => unverified too.
  const g = rebaseGateFromMint({ ...base, multiplier: "1", newMultiplier: "1", newMultiplierEffectiveTimestampSec: 0, scaledAuthority: "SomeUpdateAuthority1111" });
  assert.ok(g.status === "unverified" && g.residue === "rebase_unverified");
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
  assert.equal(c.block_ts_vs_submission, 2, "two halts, standing residue (row-level, once per row)");
  assert.equal(c.resume_time_missing, 1, "one empty-resume halt");
  assert.equal(c.reason_unknown, 1, "one off-carte graphie");
  // error_origin: generator (-b3b L-3 join). Both halt rows are Symbol=TSLA and now JOIN onto TSLAx's real fill
  // (blockTimeUtcMs 1_789_824_710_000 = 2026-09-19). Row 1 has an EMPTY resume => window [halt, +inf) => that fill
  // is in-window => no_fill_in_window does NOT fire for it; only row 2's bounded [11:00,11:05] window abstains.
  // Was 2 (empty-fills position, pre-join); now 1 (a measurement change from wiring the on-chain leg, not a re-pin).
  assert.equal(c.no_fill_in_window, 1, "one bounded-window halt with no fill in it (row 2); row 1's open window captures the join fill");
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
  assert.throws(() => { assertNoClose({ close_source: 123.45 }); }); // a NUMERIC close value still reddens (mutant)
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
  // C-1/C-12 (D1-quater): the C-G2-8 "immutable now => constant" shortcut is CLOSED — the current readout alone
  // never grants constant (constancy is decided by the replayed trajectory), so this too is rebase_unverified.
  assert.equal(rebaseForMint({ ...baseMint, multiplier: "1", scaledAuthority: null }).status, "unverified");

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

  // wiring proof (SRC): buildSolanaSymbol (the C-6 injectable seam main() loops over) applies the fail-closed
  // mapping and pushes `rebase` UNCONDITIONALLY; with a scanned trajectory it uses rebaseGateFromTrajectory, else
  // rebaseForMint(mint); the old fail-open line (`... : undefined`) is gone.
  assert.match(SRC, /: rebaseForMint\(mint\);/);
  assert.match(SRC, /rebaseGateFromTrajectory\(trajectory\.events/);
  assert.match(SRC, /\.\.\.\(mint \? \{ mint \} : \{\}\), rebase \};/);
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

// ---- C-1: the residual counter (incl. the new cash_* keys) passes the close-guard; the guard is NOT widened ----
test("bell_residual_counter_passes_close_guard", () => {
  // the fresh counter carries cash_cross_mismatch / cash_cross_unavailable and does NOT trip assertNoClose
  // (the names are OUTSIDE CLOSE_KEY). A future residual name colliding with the guard would redden here.
  assert.doesNotThrow(() => { assertNoClose(newResidualCounts()); });
  assert.ok("cash_cross_mismatch" in newResidualCounts() && "cash_cross_unavailable" in newResidualCounts());
  // a provenance carrying a cash_request_digest hex passes (the key is not close-like), close_source too.
  assert.doesNotThrow(() => { assertNoClose({ sources: { close_source: "databento-equs-summary", cash_request_digest: "a".repeat(64) } }); });
  // non-vacuity (ESC-1 c intact): the MEASURED C-1 collision — a `close_*` numeric key STILL reddens (why cash_ was chosen).
  assert.throws(() => { assertNoClose({ close_cross_mismatch: 0 }); });
  assert.throws(() => { assertNoClose({ close_request_digest: 0 }); });
});

// ---- L-2: cash_cross_mismatch is a named residual; matched/unavailable mark the per-session g_t (C-9) ----
test("bell_cash_cross_mismatch_is_a_named_residual", () => {
  const refDate = "2026-09-18"; // the weekend series anchors here
  const run = (status: "matched" | "unavailable" | "mismatch") =>
    collect({ symbols: [{ ...tslaxInput(364.5), crossBySession: { [refDate]: status } }], haltRows: [],
      window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" })
      .digest as { residuals: Record<string, number>; gaps: Array<Record<string, unknown>> };
  // mismatch => abstain with the NAMED residual, NO g_t, marked (never an average, never a silent pick).
  const mm = run("mismatch");
  assert.equal(mm.residuals.cash_cross_mismatch, 1);
  const gm = mm.gaps.find((x) => x.abstain === "cash_cross_mismatch");
  assert.ok(gm && !("gT" in gm) && gm.cash_cross === "mismatch", "mismatch abstains, no g_t, marked");
  assert.equal(mm.residuals.no_close_ref, 0, "a mismatch is DISTINCT from no_close_ref");
  // matched => publish g_t with a cross marker + earliest_publish_utc.
  const ok = run("matched");
  assert.equal(ok.residuals.cash_cross_mismatch, 0);
  const gok = ok.gaps.find((x) => "gT" in x);
  assert.ok(gok && gok.cash_cross === "matched" && typeof gok.earliest_publish_utc === "number");
  // unavailable => still publish g_t (interim Q3(ii) (a)) + a DISTINCT residual + single-source marker.
  const unav = run("unavailable");
  assert.equal(unav.residuals.cash_cross_unavailable, 1);
  assert.equal((unav.gaps.find((x) => "gT" in x) ?? {}).cash_cross, "unavailable");
});

// ---- re-pin proof: -b3b digest MINUS its additions recomputes the -b3a pin (by subtraction) ----
test("bell_pinned_sha_reduces_to_b3a_by_subtraction", () => {
  const r = collect({ symbols: [tslaxInput(364.5)], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  assert.equal(r.bellSha, PINNED_BELL_SHA);
  const d = JSON.parse(JSON.stringify(r.digest)) as { gaps: Array<Record<string, unknown>>; residuals: Record<string, number> };
  assert.ok(d.gaps.some((g) => "earliest_publish_utc" in g), "a filled gap carries earliest_publish_utc (else the subtraction is vacuous)");
  for (const g of d.gaps) delete g.earliest_publish_utc;
  delete d.residuals.cash_cross_mismatch;
  delete d.residuals.cash_cross_unavailable;
  assert.equal(bellSha(d as unknown as Parameters<typeof bellSha>[0]), PINNED_BELL_SHA_B3A);
});

// ---- L-3: the halt delta is EXECUTED on real fills, one bracket per token/chain (CA-11 composition) ----
test("bell_halt_delta_brackets_real_fills_integration", () => {
  // the synthetic halt CSV (Symbol=TSLA, outside series/) + the REAL weekend fills (series/) => collect() brackets.
  const rows = rowsFromCsv(readFileSync(join(HERE, "fixtures", "halts-tsla-synth.csv"), "utf8"));
  assert.equal(rows.length, 1);
  const fills = loadSeriesFills();
  const tslax: SymbolInput = { symbol: "TSLAx", chain: "solana", baseDec: 8, quoteDec: 6, fills, fillsResidues: [], closeRefBySession: {}, advDailyVolumes: [] };
  // second token = a TSLAon SymbolInput built IN-TEST (declared, in-memory), one fill inside the same window.
  const tslaon: SymbolInput = { symbol: "TSLAon", chain: "ethereum", baseDec: 18, quoteDec: 6,
    fills: [{ signature: "eth1", blockTimeUtcMs: 1_789_824_680_000, baseDelta: 1_000_000_000_000_000_000n, quoteDelta: -365_000_000n }],
    fillsResidues: [], closeRefBySession: {}, advDailyVolumes: [] };
  const r = collect({ symbols: [tslax, tslaon], haltRows: rows, window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  const hd = (r.state as { halt_deltas?: Array<Record<string, unknown>> }).halt_deltas ?? [];
  // ONE bracket per token/chain, never merged (mutant: merge => length 1).
  assert.equal(hd.length, 2);
  const bx = hd.find((x) => x.symbol === "TSLAx");
  const bo = hd.find((x) => x.symbol === "TSLAon");
  assert.ok(bx && bo && bx.chain === "solana" && bo.chain === "ethereum");
  // TSLAx bracket: first fill AFTER halt = earliest real fill, last BEFORE resume = latest, n = all 8 in-window.
  assert.equal(bx.first_fill_after_halt_utc_ms, 1_789_824_664_000);
  assert.equal(bx.last_fill_before_resume_utc_ms, 1_789_824_710_000);
  assert.equal(bx.n_fills_in_window, 8);
  // mutant: join absent (fills not passed) => n would be 0 (position, never a measure).
  assert.notEqual(bx.n_fills_in_window, 0);
  // TSLAon bracket is DISTINCT (its own in-memory fill), proving per-token/chain brackets.
  assert.equal(bo.n_fills_in_window, 1);
  assert.equal(bo.first_fill_after_halt_utc_ms, 1_789_824_680_000);
  // mutant: a halt bound shifted +30s drops the pre-shift fills (the bracket bound is load-bearing).
  const late = rowsFromCsv(readFileSync(join(HERE, "fixtures", "halts-tsla-synth.csv"), "utf8").replace("09:31:00", "09:31:30"));
  const rLate = collect({ symbols: [tslax], haltRows: late, window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  const bxLate = ((rLate.state as { halt_deltas?: Array<Record<string, unknown>> }).halt_deltas ?? []).find((x) => x.symbol === "TSLAx");
  assert.notEqual(bxLate?.first_fill_after_halt_utc_ms, bx.first_fill_after_halt_utc_ms);
});

// ---- L-1 (C-2): runMain composes the WHOLE pipeline offline (read fills -> Databento close cross-check ->
// ---- collect -> write state/provenance), asserted on the PRODUCED artifacts (never a regex on the source) ----
test("bell_close_databento_replays_synthetic_fixture", async () => {
  const btMs = Date.UTC(2026, 8, 19, 13, 31, 4), btSec = Math.floor(btMs / 1000); // Sat 2026-09-19 => weekend, ref close 2026-09-18
  const pool = POOLS.find((p) => p.baseSymbol === "TSLAx" && p.chain === "solana")!;
  // a swap giving vwap = 365 exactly: +1.0 TSLAx (8 dec) for 365 USDC (6 dec).
  const swapBody = { slot: 1, transaction: { message: { accountKeys: [{ pubkey: pool.vaultBase }, { pubkey: pool.vaultQuote }] } },
    meta: { err: null, preTokenBalances: [{ accountIndex: 0, uiTokenAmount: { amount: "1000000000" } }, { accountIndex: 1, uiTokenAmount: { amount: "5000000000" } }],
      postTokenBalances: [{ accountIndex: 0, uiTokenAmount: { amount: "1100000000" } }, { accountIndex: 1, uiTokenAmount: { amount: "4635000000" } }] } };
  const call: JsonRpcCall = (_url, method, params) => {
    if (method === "getSignaturesForAddress") return Promise.resolve([{ signature: "sig1", slot: 1, blockTime: btSec, err: null }]);
    if (method === "getTransaction") return Promise.resolve(swapBody);
    if (method === "getAccountInfo") {
      // L-4: the C-3 anchor reads encoding:"base64" (a 56-byte m=1 state, consistent with the init m=1 trajectory);
      // the mint readout still reads jsonParsed. Same value on both operators => quorum concords.
      const enc = (params[1] as { encoding?: string } | undefined)?.encoding;
      if (enc === "base64") return Promise.resolve({ context: { slot: 9 }, value: { data: [stateConfigB64(1, 0, 1), "base64"] } });
      return Promise.resolve({ context: { slot: 9 }, value: { data: { parsed: { info: { supply: "1000000000", decimals: 8, extensions: [] } } } } });
    }
    throw new Error("unexpected " + method);
  };
  // synthetic fixtures (declared, in-memory): Databento returns a scaled-int close 364.0 for TSLA on the ref day;
  // Massive returns 364 (matched) for the cross and a volume for the ADV leg. NO real close is committed.
  const databentoGet: DatabentoGet = () => Promise.resolve([{ hd: { ts_event: String(BigInt(Date.UTC(2026, 8, 18)) * 1_000_000n) }, close: "364000000000" }]);
  const polygonGet: PolygonGet = (path) => Promise.resolve(path.includes("adjusted=false") ? { results: [{ c: 364 }] } : { results: [{ v: 1_000_000, c: 364 }] });
  // a scanned trajectory (constant m=1) so the gate is `constant` and collect() computes g_t (else it abstains).
  const outDir = mkdtempSync(join(tmpdir(), "bell-runmain-"));
  const trajPath = join(outDir, "traj.json");
  writeFileSync(trajPath, JSON.stringify({ TSLAx: { events: [{ kind: "initialize", multiplier: "1", multiplierBitsHex: f64BitsHexLE(1), effectiveTimestampSec: 0, blockTimeSec: 0, slot: 1, instructionIndex: 0, signature: "s1" }], scanComplete: true, scanMethod: "authority" } }));
  // C-V-3 (O-1): also wire the halt CSV through runMain so the BELL_HALTS_CSV -> haltsSince -> collect -> halt_deltas
  // path is replayed in composition (kills MV9). The synthetic halt window (13:31:00Z-13:32:00Z) brackets the runMain fill.
  const env = { BELL_SOLANA_RPC: "https://mainnet.helius-rpc.com,https://solana-mainnet.core.chainstack.com", POLYGON_API_KEY: "p", DATABENTO_API_KEY: "k",
    BELL_HALTS_CSV: join(HERE, "fixtures", "halts-tsla-synth.csv") } as NodeJS.ProcessEnv;
  const argv = ["--pools", "TSLAx", "--max-calls", "100000", "--body-sample", "0", "--min-interval", "0",
    "--from-utc", String(btMs - 2 * 86_400_000), "--to-utc", String(btMs + 86_400_000), "--rebase-trajectory", trajPath, "--out", outDir];
  await runMain(argv, { call, databentoGet, polygonGet, env, nowMs: btMs + 86_400_000 });

  const state = JSON.parse(readFileSync(join(outDir, "state.json"), "utf8")) as { residuals: Record<string, number>; digest: { gaps: Array<Record<string, unknown>> }; halt_deltas?: Array<Record<string, unknown>> };
  const prov = JSON.parse(readFileSync(join(outDir, "provenance.json"), "utf8")) as { sources: Record<string, unknown> };
  // the seam ran: close_source names Databento (mutant: drop the seam => close_source absent => red).
  assert.equal(prov.sources.close_source, "databento-equs-summary");
  assert.match(String(prov.sources.cash_request_digest), /^[0-9a-f]{64}$/); // present, no key, no value
  assert.equal(state.residuals.cash_cross_mismatch, 0); // matched
  const gap = state.digest.gaps.find((g) => "gT" in g);
  assert.ok(gap, "a filled g_t gap was produced from the composed close");
  assert.equal(gap.cash_cross, "matched");
  // C-4: g_t derived OFF-CODE from the round inputs (vwap 365 from the declared deltas, close 364) — not captured.
  assert.equal(gap.gT, Math.log(365 / 364).toFixed(10));
  assert.equal(typeof gap.earliest_publish_utc, "number");
  // C-V-3 (O-1 / MV9): the halt CSV read by runMain reached collect() and produced a TSLAx bracket over the fill.
  const hd = (state.halt_deltas ?? []).find((x) => x.symbol === "TSLAx");
  assert.ok(hd && (hd.n_fills_in_window as number) >= 1, "BELL_HALTS_CSV -> runMain -> collect -> halt_deltas bracket over the fill");
  // no reference close leaks into ANY produced artifact (ESC-1 c).
  assert.doesNotThrow(() => { assertNoClose(state); });
  assert.doesNotThrow(() => { assertNoClose(prov.sources); });
});

// ---- C-6 (option a rationale): earliest_publish_utc rides ON each filled entry => JOINABLE per session ----
test("bell_earliest_publish_utc_is_joinable_per_session_on_collect_output", () => {
  // filled sessions on DIFFERENT reference-close days carry DIFFERENT earliest_publish_utc = earliestPublishUtc(refDate)
  // — joinable (why the field rides on the digest entry, not one envelope scalar). A `regular` fill (anchor != refDate)
  // also proves the gate is keyed on refCloseDateOf(session, anchor), NOT the anchor (C-V-2 MV8). Closes = bare
  // synthetic ints (not close records; verified not among the real closes).
  const fA: SwapFill = { signature: "a", blockTimeUtcMs: Date.UTC(2026, 8, 19, 13, 0, 0), baseDelta: 100_000_000n, quoteDelta: -364_000_000n }; // Sat => ref 2026-09-18
  const fB: SwapFill = { signature: "b", blockTimeUtcMs: Date.UTC(2026, 8, 12, 13, 0, 0), baseDelta: 100_000_000n, quoteDelta: -360_000_000n }; // Sat => ref 2026-09-11
  const fC: SwapFill = { signature: "c", blockTimeUtcMs: Date.UTC(2026, 8, 16, 18, 0, 0), baseDelta: 100_000_000n, quoteDelta: -355_000_000n }; // Wed 14:00 ET => regular, anchor 09-16, ref 09-15
  const sym: SymbolInput = { symbol: "TSLAx", chain: "solana", baseDec: 8, quoteDec: 6, fills: [fA, fB, fC], fillsResidues: [],
    closeRefBySession: { "2026-09-18": 364, "2026-09-11": 360, "2026-09-15": 355 }, advDailyVolumes: [] };
  const d = collect({ symbols: [sym], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" }).digest as { gaps: Array<Record<string, unknown>> };
  const filled = d.gaps.filter((g) => "gT" in g);
  const epus = filled.map((g) => g.earliest_publish_utc as number).sort((x, y) => x - y);
  assert.equal(epus.length, 3, "three filled sessions on three ref-close days");
  assert.deepEqual(epus, [earliestPublishUtc("2026-09-11"), earliestPublishUtc("2026-09-15"), earliestPublishUtc("2026-09-18")].sort((x, y) => x - y), "each entry carries its OWN refDate gate");
  // MV8: the `regular` gap is gated on refCloseDateOf("regular", anchor) = the PRIOR trading day, NOT the anchor.
  const reg = filled.find((g) => g.session === "regular");
  assert.ok(reg, "a regular filled session exists");
  assert.equal(reg.earliest_publish_utc, earliestPublishUtc(refCloseDateOf("regular", "2026-09-16")));
  assert.notEqual(earliestPublishUtc(refCloseDateOf("regular", "2026-09-16")), earliestPublishUtc("2026-09-16"), "refDate gate != anchor gate (MV8 distinguishable)");
  // C-6 on the PRODUCED output: the latest gate is >= 16:00 ET of its refDate + 24h.
  assert.ok(epus[epus.length - 1]! >= etWallClockToUtcMs(2026, 9, 18, 16, 0, 0) + 86_400_000);
});

// ---- L-4 (C-7): the C-3 anchor grants trajectory_known ONLY on a bit-identical live state (never presence) ----
test("bell_c3_anchor_stale_trajectory_is_unverified", async () => {
  const pool = POOLS.find((p) => p.baseSymbol === "SPYx" && p.chain === "solana")!; // a NON-first symbol (C-7(b))
  const tok = XSTOCKS.find((t) => t.symbol === "SPYx")!;
  const providers = ["https://mainnet.helius-rpc.com", "https://solana-mainnet.core.chainstack.com"];
  const from = 1751328000, to = 1761955199, effTs = 1761954000;
  // an in-window varying trajectory (init m=1, one update m=1.0039 whose effTs lands in-window): replayTriplet =
  // {mul: f64(1), new: f64(1.0039), effTs}. trajectory_known once anchored.
  const events: MultiplierEvent[] = [
    { kind: "initialize", multiplier: "1", multiplierBitsHex: f64BitsHexLE(1), effectiveTimestampSec: 0, blockTimeSec: 1000, slot: 10, instructionIndex: 0, signature: "i" },
    { kind: "update", multiplier: "1.0039", multiplierBitsHex: f64BitsHexLE(1.0039), effectiveTimestampSec: effTs, blockTimeSec: 1761950000, slot: 20, instructionIndex: 0, signature: "u" },
  ];
  const traj = { events, scanComplete: true, scanMethod: "authority" as const };
  // the anchor read is keyed on the MINT address; `other` is what a hardcoded-wrong-address anchor (C-7(b) mutant)
  // would read — a DIFFERENT new_multiplier, so the mutant diverges on the concordance case and reds.
  const build = (mintState: string, otherState: string): Promise<SymbolInput> => {
    const call: JsonRpcCall = (_url, method, params) => {
      if (method === "getSignaturesForAddress") return Promise.resolve([]);
      if (method === "getAccountInfo") {
        const addr = (params as unknown[])[0] as string;
        const enc = ((params as unknown[])[1] as { encoding?: string } | undefined)?.encoding;
        if (enc === "base64") return Promise.resolve({ context: { slot: 25 }, value: { data: [addr === tok.address ? mintState : otherState, "base64"] } });
        return Promise.resolve({ context: { slot: 25 }, value: { data: { parsed: { info: { supply: "1", decimals: 8, extensions: [] } } } } });
      }
      throw new Error("unexpected " + method);
    };
    return buildSolanaSymbol(call, providers, tok, pool, { fromSec: from, toSec: to }, to * 1000, "", { maxPages: 1, bodySample: 0 }, traj, [] as TransportFault[]);
  };
  // CONCORDANCE: the live state == the replayed triplet on ALL THREE fields => trajectory_known + the two authority
  // residuals (scanMethod passed; mutant "scanMethod not passed" => residuals empty => reds).
  const ok = await build(stateConfigB64(1, effTs, 1.0039), stateConfigB64(1, effTs, 1.0057));
  assert.equal(ok.rebase?.status, "trajectory_known", "bit-identical live state => trajectory_known");
  assert.ok(ok.rebase?.status === "trajectory_known" && ok.rebase.residuals.length === 2, "the two authority residuals ride (scanMethod passed)");
  // STALE: same file, live state has a DIFFERENT scheduled update (multiplier bits EQUAL, new_multiplier/effTs
  // differ) => the full-triplet check diverges => rebase_unverified. Mutants "compare multiplier bits only" and
  // "anchor removed (presence only)" would grant trajectory_known here => this reds them.
  const stale = await build(stateConfigB64(1, effTs + 600, 1.0057), stateConfigB64(1, effTs + 600, 1.0057));
  assert.equal(stale.rebase?.status, "unverified", "a post-scan scheduled update (stale file) => rebase_unverified");
  // C-G2-5: the CURRENT multiplier diverges (mulBits differ: replay 1 vs live 2) while new_multiplier + effTs MATCH =>
  // the full-triplet check must still diverge => rebase_unverified. Mutant "drop the mulBits equality" grants
  // trajectory_known here => this reds it (MINE1, the G2's surviving mutant — the mulBits field was never exercised).
  const mulDiverge = await build(stateConfigB64(2, effTs, 1.0039), stateConfigB64(2, effTs, 1.0039));
  assert.equal(mulDiverge.rebase?.status, "unverified", "current-multiplier bits divergence => rebase_unverified (kills MINE1)");
  // an unreadable state (no base64 bytes) => quorum benched => rebase_unverified (fail-closed).
  const noState = await build("", "");
  assert.equal(noState.rebase?.status, "unverified", "an unreadable live state => rebase_unverified");
});

// ---- L-5 (C-10): a published trajectory_known session counts the gate residuals + lists them (hors CLOSE_KEY) ----
test("bell_gate_residuals_counted_in_state", () => {
  const bt = Date.UTC(2025, 8, 20, 2, 0, 0), btSec = Math.floor(bt / 1000); // off-hours => ref close = anchor day
  const events: MultiplierEvent[] = [
    { kind: "initialize", multiplier: "1", multiplierBitsHex: f64BitsHexLE(1), effectiveTimestampSec: 0, blockTimeSec: btSec - 100_000, slot: 1, instructionIndex: 0, signature: "i" },
    { kind: "update", multiplier: "1.0039", multiplierBitsHex: f64BitsHexLE(1.0039), effectiveTimestampSec: btSec - 50_000, blockTimeSec: btSec - 50_000, slot: 2, instructionIndex: 0, signature: "u" },
  ];
  const fill: SwapFill = { signature: "a", blockTimeUtcMs: bt, baseDelta: 100_000_000n, quoteDelta: -365_000_000n };
  const cls = classifySession(bt);
  const refDate = refCloseDateOf(cls.session, cls.sessionDateET);
  const sym: SymbolInput = { symbol: "SPYx", chain: "solana", baseDec: 8, quoteDec: 6, fills: [fill], fillsResidues: [],
    closeRefBySession: { [refDate]: 364 }, advDailyVolumes: [], rebase: { status: "trajectory_known", events, overwrittenPending: 0, residuals: ["authority_scan_mono_operator", "set_authority_unscanned"] } };
  const r = collect({ symbols: [sym], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  const d = r.digest as { gaps: Array<Record<string, unknown>>; residuals: Record<string, number> };
  const g = d.gaps.find((x) => "gT" in x);
  assert.ok(g, "a published trajectory_known g_t exists");
  // per-session COUNT (calque rebase_unverified): one published session => each code counted once. Mutant: neutralise
  // the emission (`for (const r of [])`) => both 0 + no rebase_residuals => this reds.
  assert.equal(d.residuals.authority_scan_mono_operator, 1, "authority_scan_mono_operator counted per published session");
  assert.equal(d.residuals.set_authority_unscanned, 1, "set_authority_unscanned counted per published session");
  assert.deepEqual(g.rebase_residuals, ["authority_scan_mono_operator", "set_authority_unscanned"], "the codes ride on the gap under rebase_residuals");
  assert.equal(d.residuals.rebase_unverified, 0, "trajectory_known does NOT abstain");
  // C-10 sonde: the produced state carries non-empty rebase_residuals and STILL passes the close-guard.
  assert.doesNotThrow(() => { assertNoClose(r.state); }, "rebase_residuals is hors CLOSE_KEY (ESC-1 c intact)");
});
