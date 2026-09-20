// MONARK Bell — L-1 offline oracle for the Token-2022 multiplier trajectory (ADR-T1aii D1-quater, lot -b3a).
// Binary vectors are BUILT BY HAND from the lecture layout (C) — no fixture the code wrote itself (breaks the
// circular-replay MAST). No network. Named mutants each RED by construction (see comments).
import { test } from "node:test";
import assert from "node:assert/strict";
import { f64BitsHexLE, f64FromBitsHexLE, decodeUpdateMultiplier, decodeInitialize, decodeStateConfig,
  multiplierAtSec, multiplierAtMs, replayTriplet, overwrittenPending, constantMultiplierOver,
  type MultiplierEvent } from "../src/rebase-trajectory.ts";

// Hand-built 43/1 UpdateMultiplier instruction bytes (18): [43,1, f64 little-endian, i64 little-endian].
function updBytes(m: number, effTs: number): Uint8Array {
  const b = new Uint8Array(18); b[0] = 43; b[1] = 1;
  const dv = new DataView(b.buffer); dv.setFloat64(2, m, true); dv.setBigInt64(10, BigInt(effTs), true);
  return b;
}
// Hand-built 43/0 Initialize instruction bytes (42): [43,0, authority 32, f64 little-endian].
function initBytes(m: number, authByte = 0): Uint8Array {
  const b = new Uint8Array(42); b[0] = 43; b[1] = 0; if (authByte) b[2] = authByte;
  new DataView(b.buffer).setFloat64(34, m, true);
  return b;
}
// Hand-built ScaledUiAmountConfig STATE bytes (56, ORDER DISTINCT): authority 32, mult f64, effTs i64, newMult f64.
function stateBytes(mult: number, effTs: number, newMult: number): Uint8Array {
  const b = new Uint8Array(56); const dv = new DataView(b.buffer);
  dv.setFloat64(32, mult, true); dv.setBigInt64(40, BigInt(effTs), true); dv.setFloat64(48, newMult, true);
  return b;
}
const ev = (kind: "initialize" | "update", m: number, bt: number, slot: number, eff = 0, ix = 0): MultiplierEvent =>
  ({ kind, multiplier: String(m), multiplierBitsHex: f64BitsHexLE(m), effectiveTimestampSec: eff, blockTimeSec: bt, slot, instructionIndex: ix, signature: "sig" + String(slot) });

test("bell_rebase_replay_rule_ge — read rule and fold are LARGE >= at the exact effective timestamp", () => {
  // Init m=1 @t0; scheduled update m=3 effTs=500, submitted @400 (future effTs => stored stays 1 until 500).
  const events = [ev("initialize", 1, 0, 1), ev("update", 3, 400, 2, 500)];
  assert.equal(multiplierAtSec(events, 499)!.value, 1, "t<effTs => stored multiplier");
  assert.equal(multiplierAtSec(events, 500)!.value, 3, "t==effTs => new_multiplier (>= not >)"); // mutant >=->> : reds
  assert.equal(multiplierAtSec(events, 501)!.value, 3);
  // Fold at write time: an update whose effTs <= its own blockTime folds `multiplier` immediately (l.64-65).
  const folded = [ev("initialize", 1, 0, 1), ev("update", 7, 900, 2, 900)]; // effTs == blockTime
  assert.equal(replayTriplet(folded, 900)!.multiplierBitsHex, f64BitsHexLE(7), "effTs==blockTime folds (>=)"); // mutant reds
  assert.equal(multiplierAtSec(events, -5), null, "before Initialize => null, never a fabricated 1");
  assert.equal(multiplierAtMs(events, 500_000)!.value, 3, "ms boundary = floor(ms/1000)=500s => new");
});

test("bell_rebase_replay_overwrite_counts — a second scheduled update erases a still-pending first (F-2)", () => {
  // Two updates before the first's effTs (1000): the first pending value never folds — overwritten_pending=1.
  const pending = [ev("initialize", 1, 0, 1), ev("update", 2, 500, 2, 1000), ev("update", 3, 600, 3, 1000)];
  assert.equal(overwrittenPending(pending), 1); // mutant: condition flipped / made 0 => reds
  // The final stored multiplier is 1 (neither scheduled value elapsed by t=999) then 3 at t>=1000.
  assert.equal(multiplierAtSec(pending, 999)!.value, 1);
  assert.equal(multiplierAtSec(pending, 1000)!.value, 3, "the surviving (second) scheduled value, not the erased first");
  // When the first update already elapsed before the second arrives, nothing was overwritten pending.
  const elapsed = [ev("initialize", 1, 0, 1), ev("update", 2, 500, 2, 100), ev("update", 3, 600, 3, 1000)];
  assert.equal(overwrittenPending(elapsed), 0);
});

test("bell_rebase_decoder_layouts_distinct — instruction order != state order (two decoders, F-8)", () => {
  const u = decodeUpdateMultiplier(updBytes(1.5, 1781755200))!;
  assert.equal(u.multiplier, 1.5); assert.equal(u.effectiveTimestampSec, 1781755200); // mutant: swap offsets => reds
  assert.equal(u.multiplierBitsHex, f64BitsHexLE(1.5));
  assert.equal(decodeUpdateMultiplier(initBytes(1)), null, "43/0 is not a 43/1 update");
  assert.equal(decodeUpdateMultiplier(new Uint8Array([43, 1, 0])), null, "short buffer => null");
  const i = decodeInitialize(initBytes(1.0))!;
  assert.equal(i.multiplier, 1.0); assert.equal(i.authority, null, "all-zero authority => None");
  assert.notEqual(decodeInitialize(initBytes(1.0, 0x11))!.authority, null, "non-zero authority => Some");
  // State layout has the SAME bytes in a DIFFERENT order; decoding the instruction layout as state would misread.
  const s = decodeStateConfig(stateBytes(1.0039, 1781755200, 1.0057));
  assert.equal(s.multiplier, 1.0039); assert.equal(s.effectiveTimestampSec, 1781755200); assert.equal(s.newMultiplier, 1.0057); // mutant: swap mult/newMult offsets => reds
  assert.equal(f64FromBitsHexLE(s.multiplierBitsHex), 1.0039);
});

test("bell_rebase_constant_needs_trajectory — C-1: a pre-window update with an in-window effTs is NOT constant", () => {
  // Update submitted @1000 (pre-window) with effTs=1500 (IN window [1200,2000]) => m jumps at 1500 with NO
  // in-window instruction. constantMultiplierOver must sample the effTs breakpoint and REFUSE constant.
  const preWindow = [ev("initialize", 1, 0, 1), ev("update", 5, 1000, 2, 1500)];
  assert.equal(constantMultiplierOver(preWindow, 1200, 2000), null);
  // SPIKE-and-revert (the load-bearing effTs-breakpoint case): m=1 folds to 5 at effTs 1600, back to 1 at effTs
  // 1800 (overwritten_pending=0 — the revert arrives AFTER the spike elapsed). BOTH window bounds read m=1, so
  // only sampling the effTs breakpoints (1600,1800) catches the m=5 spike => constant must be REFUSED.
  const spike = [ev("initialize", 1, 0, 1), ev("update", 5, 1500, 2, 1600), ev("update", 1, 1700, 3, 1800)];
  assert.equal(multiplierAtSec(spike, 1500)!.value, 1); assert.equal(multiplierAtSec(spike, 2500)!.value, 1); // bounds equal
  assert.equal(multiplierAtSec(spike, 1600)!.value, 5); // the in-window spike
  assert.equal(constantMultiplierOver(spike, 1500, 2500), null); // mutant: drop effTs from breakpoints => grants constant => reds
  // A genuinely flat trajectory (no changes affecting the window) is constant at its value.
  assert.equal(constantMultiplierOver([ev("initialize", 1, 0, 1)], 1200, 2000)!.value, 1);
  // Equality is on the f64 BITS, not the decimal: a value equal at both bounds but different mid-window is caught.
  const flat = [ev("initialize", 1.0039, 0, 1)];
  assert.equal(constantMultiplierOver(flat, 1200, 2000)!.bitsHex, f64BitsHexLE(1.0039));
});

test("bell_rebase_replay_triplet_reproduces_stored_state — C-3 shape: stored != new when effTs is future", () => {
  // Motif measured on SPYx/NVDAx/AAPLx: an update whose effTs is in the future at the read slot => stored
  // `multiplier` stays the PRIOR value, never folded; the replayed triplet must reproduce that exactly.
  const events = [
    ev("initialize", 1, 0, 1),
    ev("update", 1.003909240011759, 1_600_000_100, 2, 1_600_000_000), // elapsed => folds into stored
    ev("update", 1.005714560286254, 1_700_000_000, 3, 9_999_999_999), // future effTs => NOT folded
  ];
  const t = replayTriplet(events, 1_700_000_001)!;
  assert.equal(t.multiplierBitsHex, f64BitsHexLE(1.003909240011759), "stored = last ELAPSED value");
  assert.equal(t.newMultiplierBitsHex, f64BitsHexLE(1.005714560286254), "new = last scheduled value");
  assert.equal(t.effectiveTimestampSec, 9_999_999_999);
  // The dynamic read at that slot still returns the stored value (t < effTs), never the pending one.
  assert.equal(multiplierAtSec(events, 1_700_000_001)!.value, 1.003909240011759);
});
