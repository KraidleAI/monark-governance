// MONARK Bell — -b3a-3 offline oracle: the hybrid AUTHORITY-scan course replays bit-identical (ADR-T1aii D1-quater,
// orchestrator decision 60). The FOUR per-mint series (apps/bell/test/fixtures/series/rebase/rebase-<MINT>.json,
// sha-pinned in PROVENANCE-rebase-course.md) are the served output of the authority scan; this test REPLAYS each one
// through the PRODUCTION functions (replayTriplet / multiplierAtSec / overwrittenPending / rebaseGateFromTrajectory)
// and asserts bit-identity to the pinned oracle. No network, no RPC (everything is already measured). Named mutants:
// one series byte altered => replay != oracle here + series_pinned red (test/ci-gates.test.ts); the authority residuals
// omitted from rebaseGateFromTrajectory => the equality assertions red.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { multiplierAtSec, replayTriplet, overwrittenPending, type MultiplierEvent } from "../src/rebase-trajectory.ts";
import { rebaseGateFromTrajectory } from "../src/supply.ts";
import { RESIDUAL_CODES } from "../src/residuals.ts";

const DIR = fileURLToPath(new URL("./fixtures/series/rebase/", import.meta.url));
const MINTS = ["TSLAx", "SPYx", "NVDAx", "AAPLx"] as const;
const BOUNDS = ["2025-07-01T00:00:00Z", "2025-10-31T23:59:59Z", "2026-09-19T00:00:00Z"] as const;
const AUTHORITY_RESIDUALS = ["authority_scan_mono_operator", "set_authority_unscanned"] as const;

interface Triplet { multiplierBitsHex: string; newMultiplierBitsHex: string; effectiveTimestampSec: number }
interface Series {
  readonly symbol: string;
  readonly initialize_authority: string;
  readonly oracle_triplet: Triplet & { authority: string };
  readonly events: MultiplierEvent[];
  readonly overwritten_pending: number;
  readonly replay_triplet: Triplet;
  readonly scan_complete: boolean;
  readonly multiplier_at: Record<string, { value: string; bitsHex: string }>;
  readonly founding_window: { fromSec: number; toSec: number };
  readonly founding_window_gate: string;
  readonly gate_detail: { status: string; multiplier?: string };
}
const load = (m: string): Series => JSON.parse(readFileSync(DIR + "rebase-" + m + ".json", "utf8")) as Series;

test("bell_rebase_course_replays_bit_identical — the 4 authority-scan series replay to the pinned oracle (C-3, decision 60)", () => {
  for (const m of MINTS) {
    const s = load(m);
    const ev = s.events;
    // Precondition of the completeness argument: Initialize.authority == oracle.authority (== S7vYFF), per series.
    assert.equal(s.initialize_authority, s.oracle_triplet.authority, `${m}: Initialize authority == oracle authority`);
    // C-3: the replayed final triplet is bit-identical to the quorum-2 read ScaledUiAmountConfig (on the f64 BITS).
    const rt = replayTriplet(ev, Number.MAX_SAFE_INTEGER)!;
    assert.equal(rt.multiplierBitsHex, s.oracle_triplet.multiplierBitsHex, `${m}: stored multiplier bits`);
    assert.equal(rt.newMultiplierBitsHex, s.oracle_triplet.newMultiplierBitsHex, `${m}: new_multiplier bits`);
    assert.equal(rt.effectiveTimestampSec, s.oracle_triplet.effectiveTimestampSec, `${m}: effTs`);
    assert.deepEqual({ ...rt }, s.replay_triplet, `${m}: replay_triplet field matches the recomputed triplet`);
    // overwritten_pending is 0 (F-2), both recomputed and as pinned.
    assert.equal(overwrittenPending(ev), 0, `${m}: overwritten_pending recomputed`);
    assert.equal(s.overwritten_pending, 0, `${m}: overwritten_pending pinned`);
    // multiplier_at each bound: equality on the f64 BITS (load-bearing, F-4) AND the pinned decimal string.
    for (const b of BOUNDS) {
      const at = multiplierAtSec(ev, Math.floor(Date.parse(b) / 1000))!;
      assert.equal(at.bitsHex, s.multiplier_at[b]!.bitsHex, `${m} @ ${b}: multiplier bits`);
      assert.equal(String(at.value), s.multiplier_at[b]!.value, `${m} @ ${b}: multiplier decimal`);
    }
    // The founding-window gate matches the pinned verdict; trajectory_known carries the two authority residuals.
    const gate = rebaseGateFromTrajectory(ev, s.founding_window.fromSec, s.founding_window.toSec, s.scan_complete, "authority");
    assert.equal(gate.status, s.founding_window_gate, `${m}: founding-window gate`);
    if (gate.status === "constant") assert.equal(gate.multiplier, s.gate_detail.multiplier, `${m}: constant multiplier`);
    if (gate.status === "trajectory_known") assert.deepEqual([...gate.residuals], [...AUTHORITY_RESIDUALS], `${m}: authority residuals carried`);
  }
});

test("bell_rebase_authority_residuals_named_and_gated — the two codes are closed-set + emitted only under scanMethod authority", () => {
  // Both codes are members of the ONE closed residual set (residuals.ts), so they are counted in state.json (D8).
  for (const c of AUTHORITY_RESIDUALS) assert.ok((RESIDUAL_CODES as readonly string[]).includes(c), `${c} is in the closed residual set`);
  const s = load("SPYx"); // a trajectory_known mint
  // OBLIGATORY under the authority scan: the two residuals, in order (mutant: emission removed => this reds).
  const auth = rebaseGateFromTrajectory(s.events, s.founding_window.fromSec, s.founding_window.toSec, true, "authority");
  assert.equal(auth.status, "trajectory_known");
  if (auth.status === "trajectory_known") assert.deepEqual([...auth.residuals], [...AUTHORITY_RESIDUALS], "authority residuals, in order");
  // WITHOUT the authority method the gate carries NO residual (the emission is authority-gated, not unconditional).
  const other = rebaseGateFromTrajectory(s.events, s.founding_window.fromSec, s.founding_window.toSec, true);
  assert.ok(other.status === "trajectory_known" && other.residuals.length === 0, "no residual without scanMethod authority");
});
