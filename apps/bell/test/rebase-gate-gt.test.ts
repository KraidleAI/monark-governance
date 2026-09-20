// MONARK Bell — L-3/L-4 offline oracle: the 3-state rebase gate and the rebase-aware g_t (ADR-T1aii D1-quater,
// lot -b3a). No network (injected call for the C-V-3 build). Named mutants: trajectory_known granted with
// overwritten_pending>0 => red; g_t × instead of ÷ m => red; the multiplier ignored on a trajectory => red.
import { test } from "node:test";
import assert from "node:assert/strict";
import { rebaseGateFromTrajectory } from "../src/supply.ts";
import { sessionGap, sessionGapRebase } from "../src/gap.ts";
import { f64BitsHexLE, type MultiplierEvent } from "../src/rebase-trajectory.ts";
import { collect, buildSolanaSymbol, type SymbolInput } from "../src/collect.ts";
import { classifySession, refCloseDateOf } from "../src/sessions.ts";
import { operatorOf } from "../src/operators.ts";
import { POOLS, XSTOCKS } from "../src/pools.ts";
import { type JsonRpcCall, type TransportFault } from "../src/quorum.ts";
import { type SwapFill } from "../src/rpc.ts";

const ev = (kind: "initialize" | "update", m: number, bt: number, slot: number, eff = 0): MultiplierEvent =>
  ({ kind, multiplier: String(m), multiplierBitsHex: f64BitsHexLE(m), effectiveTimestampSec: eff, blockTimeSec: bt, slot, instructionIndex: 0, signature: "s" + String(slot) });

test("bell_rebase_gate_three_states — constant | trajectory_known | rebase_unverified (C-6)", () => {
  // constant: a flat trajectory over the window.
  assert.deepEqual(rebaseGateFromTrajectory([ev("initialize", 1, 0, 1)], 1000, 5000, true), { status: "constant", multiplier: "1" });
  // trajectory_known: m changes in-window (effTs 3000 in [1000,5000]), overwritten_pending 0.
  const varying = [ev("initialize", 1, 0, 1), ev("update", 1.0039, 2000, 2, 3000)];
  const g = rebaseGateFromTrajectory(varying, 1000, 5000, true);
  assert.equal(g.status, "trajectory_known");
  assert.ok(g.status === "trajectory_known" && g.events.length === 2 && g.overwrittenPending === 0);
  // rebase_unverified: an incomplete scan.
  assert.equal(rebaseGateFromTrajectory(varying, 1000, 5000, false).status, "unverified");
  // rebase_unverified: overwritten_pending>0 fails CLOSED even with a complete scan (mutant: granting
  // trajectory_known here => red).
  const overwritten = [ev("initialize", 1, 0, 1), ev("update", 2, 500, 2, 9000), ev("update", 3, 600, 3, 9000)];
  assert.equal(rebaseGateFromTrajectory(overwritten, 1000, 5000, true).status, "unverified");
});

test("bell_gt_rebase_direction_m2 — C-7: m=2 with a raw price of 2×close gives g_t = 0 (÷ m, not × m)", () => {
  // one fill: 1 base unit (8 dec) for 200 quote (6 dec) => raw price 200 = 2×close(100). Per-share price = 200/2
  // = 100 = close => g_t = 0. A ×-m mutant would give ln(400/100) != 0.
  const fills: SwapFill[] = [{ signature: "a", blockTimeUtcMs: 1000, baseDelta: 100_000_000n, quoteDelta: -200_000_000n }];
  const r = sessionGapRebase(fills, 100, 8, 6, () => 2);
  assert.ok(!("abstain" in r));
  if (!("abstain" in r)) { assert.equal(Number(r.gT), 0); assert.equal(r.multiplierUsed, "2"); }
  // the RAW (m-blind) gap is ln(2) != 0 — proves the multiplier is load-bearing.
  const raw = sessionGap(fills, 100, 8, 6);
  assert.ok("gT" in raw && Math.abs(Number(raw.gT) - Math.log(2)) < 1e-9);
});

test("bell_gt_constant_m_neq_1_defect — a constant m!=1 shifts g_t by −ln(m) (error_origin -b1: was raw)", () => {
  // Latent -b1 defect surfaced: `constant` with m!=1 used the RAW gap (off by ln m). Now g_t = g_t_raw − ln(m).
  const fills: SwapFill[] = [{ signature: "a", blockTimeUtcMs: 1000, baseDelta: 100_000_000n, quoteDelta: -365_000_000n }];
  const raw = sessionGap(fills, 364, 8, 6);
  const reb = sessionGapRebase(fills, 364, 8, 6, () => 1.0039);
  assert.ok("gT" in raw && !("abstain" in reb));
  if ("gT" in raw && !("abstain" in reb)) assert.ok(Math.abs(Number(reb.gT) - (Number(raw.gT) - Math.log(1.0039))) < 1e-9);
});

test("bell_gt_multiplier_before_vwap — per-fill m in the denominator != raw VWAP scaled by an average m", () => {
  // two fills at different multipliers: VWAP_share = Σ|q| / Σ(|b|·m(tᵢ)), NOT (Σ|q|/Σ|b|) / mean(m).
  const f1: SwapFill = { signature: "a", blockTimeUtcMs: 1000, baseDelta: 100_000_000n, quoteDelta: -100_000_000n };
  const f2: SwapFill = { signature: "b", blockTimeUtcMs: 9000, baseDelta: 300_000_000n, quoteDelta: -900_000_000n }; // UNEQUAL base so weighted != mean
  const mAt = (ms: number): number => (ms < 5000 ? 1 : 2);
  const r = sessionGapRebase([f1, f2], 150, 8, 6, mAt);
  assert.ok(!("abstain" in r));
  if (!("abstain" in r)) {
    // exact: Σ|q|=1000 (human), Σ(|b|·m)=1·1 + 3·2 = 7 => VWAP_share = 1000/7; g_t = ln((1000/7)/150).
    assert.ok(Math.abs(Number(r.gT) - Math.log((1000 / 7) / 150)) < 1e-9);
    // the WRONG "average m" form (raw VWAP 250 / mean m 1.5 = 166.67) differs => the placement is load-bearing.
    assert.ok(Math.abs(Number(r.gT) - Math.log((250 / 1.5) / 150)) > 1e-3);
  }
});

test("bell_gt_trajectory_known_integration — collect() emits a rebase-aware g_t + multiplierUsed per session", () => {
  // A trajectory_known window: one fill @ a time where m=1.0039; collect() must divide by m and publish it.
  const bt = Date.UTC(2025, 8, 20, 2, 0, 0); // an off-hours (overnight) instant => reference close = anchor day
  const btSec = Math.floor(bt / 1000);
  const events = [ev("initialize", 1, btSec - 100_000, 1), ev("update", 1.0039, btSec - 50_000, 2, btSec - 50_000)];
  const fill: SwapFill = { signature: "a", blockTimeUtcMs: bt, baseDelta: 100_000_000n, quoteDelta: -365_000_000n };
  const cls = classifySession(bt);
  const refDate = refCloseDateOf(cls.session, cls.sessionDateET); // key the close exactly as collect() does
  const sym: SymbolInput = { symbol: "SPYx", chain: "solana", baseDec: 8, quoteDec: 6, fills: [fill], fillsResidues: [],
    closeRefBySession: { [refDate]: 364 }, advDailyVolumes: [], rebase: { status: "trajectory_known", events, overwrittenPending: 0 } };
  const d = collect({ symbols: [sym], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" }).digest as { gaps: Array<Record<string, unknown>>; residuals: Record<string, number> };
  const g = d.gaps.find((x) => "gT" in x);
  assert.ok(g, "a filled gap exists");
  assert.equal(g.multiplierUsed, "1.0039", "the applied multiplier is published");
  assert.equal(d.residuals.rebase_unverified, 0, "trajectory_known does NOT abstain");
  // the g_t equals the rebase-aware value (÷ m), not the raw one.
  const raw = sessionGap([fill], 364, 8, 6);
  assert.ok("gT" in raw && Math.abs(Number(g.gT) - (Number(raw.gT) - Math.log(1.0039))) < 1e-9);
});

test("bell_symbol_build_mint_quorum_fail_unverified — C-V-3: mint getAccountInfo no-quorum => rebase_unverified, no gT", () => {
  // buildSolanaSymbol (the injectable seam) with a stub where the pool fills SUCCEED (quorum) but the mint
  // getAccountInfo makes NO quorum (chainstack faults) => mint absent => rebase_unverified => collect() yields NO gT.
  const pool = POOLS.find((p) => p.chain === "solana")!;
  const tok = XSTOCKS.find((t) => t.symbol === pool.baseSymbol)!;
  const btSec = 1_750_000_000, providers = ["https://mainnet.helius-rpc.com", "https://sol.core.chainstack.com"];
  const swapBody = { slot: 1, transaction: { message: { accountKeys: [{ pubkey: pool.vaultBase }, { pubkey: pool.vaultQuote }] } },
    meta: { err: null, preTokenBalances: [{ accountIndex: 0, uiTokenAmount: { amount: "1000000000" } }, { accountIndex: 1, uiTokenAmount: { amount: "5000000000" } }],
      postTokenBalances: [{ accountIndex: 0, uiTokenAmount: { amount: "1015000000" } }, { accountIndex: 1, uiTokenAmount: { amount: "4946000000" } }] } };
  const call: JsonRpcCall = (url, method) => {
    if (method === "getSignaturesForAddress") return Promise.resolve([{ signature: "s1", slot: 1, blockTime: btSec, err: null }]);
    if (method === "getTransaction") return Promise.resolve(swapBody);
    if (method === "getAccountInfo") { if (operatorOf(url) === "chainstack") return Promise.reject(new Error("HTTP 503")); return Promise.resolve({ context: { slot: 9 }, value: { data: { parsed: { info: { supply: "1", decimals: 8, extensions: [] } } } } }); }
    throw new Error("unexpected " + method);
  };
  const faults: TransportFault[] = [];
  return buildSolanaSymbol(call, providers, tok, pool, { fromSec: btSec - 86400, toSec: btSec + 86400 }, btSec * 1000, "", { maxPages: 2, bodySample: 0 }, undefined, faults).then((sym) => {
    assert.equal(sym.rebase?.status, "unverified", "mint no-quorum => rebase_unverified");
    assert.ok(sym.fillsResidues.includes("no_quorum"), "the mint no_quorum reason is carried");
    assert.equal(sym.fills.length, 1, "the pool fill still succeeded (quorum on signatures)");
    const d = collect({ symbols: [sym], haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" }).digest as { gaps: Array<Record<string, unknown>>; residuals: Record<string, number> };
    assert.ok(!d.gaps.some((g) => "gT" in g), "no gT on an unverified pool-window");
    assert.ok((d.residuals.rebase_unverified ?? 0) >= 1, "rebase_unverified counted");
  });
});
