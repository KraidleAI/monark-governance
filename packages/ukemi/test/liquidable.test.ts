import { test } from "node:test";
import assert from "node:assert/strict";
import { isLiquidable, liquidableAmount } from "../src/index.ts";
import { loadPositions } from "./fixtures.ts";

// Test 22 (ADR-M002 D11) — target A via Eq. 3 of "Knife-edge" (arXiv 2009.13235v6 p.7),
// oracle by hand (see fixture note). Horizon 24 h = a product decision (d).
test("liquidable_amount_eq3", () => {
  const positions = loadPositions("knife-edge-positions.json");
  const [p1, p2, p3] = positions;
  assert.ok(p1 && p2 && p3);

  // P1: tipping threshold at 12,5 % — on both sides, and exactly at the threshold (non-strict ⇒ not liquidable).
  assert.equal(isLiquidable(p1, 0.1), false, "P1 s=0,10 : 100·0,9·0,8=72 ≥ 70");
  assert.equal(isLiquidable(p1, 0.125), false, "P1 s=0,125 : 70 < 70 is false — the threshold is not liquidable");
  assert.equal(isLiquidable(p1, 0.2), true, "P1 s=0,20 : 100·0,8·0,8=64 < 70");
  // P2: only tips beyond 60 %.
  assert.equal(isLiquidable(p2, 0.5), false, "P2 s=0,50 : 100·0,5·0,5=25 ≥ 20");
  assert.equal(isLiquidable(p2, 0.7), true, "P2 s=0,70 : 100·0,3·0,5=15 < 20");
  // P3: already liquidable without shock.
  assert.equal(isLiquidable(p3, 0), true, "P3 s=0 : 80 < 90");

  const r0 = liquidableAmount(positions, 0);
  assert.equal(r0.horizon, "24h");
  assert.deepEqual(r0.liquidableIds, ["P3"]);
  assert.equal(r0.liquidableDebt, 90);

  const r20 = liquidableAmount(positions, 0.2);
  assert.deepEqual(r20.liquidableIds, ["P1", "P3"]);
  assert.equal(r20.liquidableDebt, 160, "70 + 90");

  const r70 = liquidableAmount(positions, 0.7);
  assert.deepEqual(r70.liquidableIds, ["P1", "P2", "P3"]);
  assert.equal(r70.liquidableDebt, 180, "70 + 20 + 90");

  // Monotone in the shock: a stronger shock never "de-liquidates" a position.
  let prev = -1;
  for (const s of [0, 0.1, 0.125, 0.2, 0.5, 0.7, 1]) {
    const d = liquidableAmount(positions, s).liquidableDebt;
    assert.ok(d >= prev, `liquidableDebt increasing in s (s=${s})`);
    prev = d;
  }
});
