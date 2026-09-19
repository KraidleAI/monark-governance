// MONARK Bell — T-1a-ii collector oracle (ADR-T1aii D1 lot -a, D5). Named mutants, each RED by construction.
// No network (readers pre-decide quorum; the low-level call is injected where the quorum primitive is tested).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { assertOutsideRepo, collect, chainTimeline, type SymbolInput } from "../src/collect.ts";
import { quorum2, signaturesSetKey, statusOf, NoQuorumError, QuorumDisagreementError, ConcordantRevertError,
  SolRpcError, type JsonRpcCall, type TransportFault } from "../src/quorum.ts";
import { readMintToken2022, porStatus, wrapperStatus, supplyVsPoRStatement } from "../src/supply.ts";
import { volumeToAdvRatio, poolVolumeBase } from "../src/volume.ts";
import { assertNoClose } from "../src/digest.ts";
import { newResidualCounts, RESIDUAL_CODES } from "../src/residuals.ts";
import { solanaEndpoints, type SwapFill } from "../src/rpc.ts";
import { providerOf } from "../../sentinel/src/rpc.ts";
import type { HaltRow } from "../src/halts.ts";
import { classifySession } from "../src/sessions.ts";
import { decodeV3Swap, ethSwapToFill, ethVwap, UNISWAP_V3_SWAP_TOPIC } from "../src/ethereum.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const SERIES = join(HERE, "fixtures", "series");

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

const PINNED_BELL_SHA = "4375042c518253e2232f0390dfcd792db4d65ca55e9832900bc19862fab6fa46";

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
    closeRefBySession: {}, advDailyVolumes: [1000], mint: { symbol: "TSLAx", decimals: 8, supply: "100", multiplier: "2", paused: false, permanentDelegate: null } };
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
