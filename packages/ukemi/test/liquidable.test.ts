import { test } from "node:test";
import assert from "node:assert/strict";
import { isLiquidable, liquidableAmount } from "../src/index.ts";
import { loadPositions } from "./fixtures.ts";

// Test 22 (ADR-M002 D11) — cible A par l'Eq. 3 de « Knife-edge » (arXiv 2009.13235v6 p.7),
// oracle à la main (voir note de la fixture). Horizon 24 h = décision investisseur (d).
test("liquidable_amount_eq3", () => {
  const positions = loadPositions("knife-edge-positions.json");
  const [p1, p2, p3] = positions;
  assert.ok(p1 && p2 && p3);

  // P1 : seuil de bascule à 12,5 % — de part et d'autre, et exactement au seuil (non strict ⇒ non liquidable).
  assert.equal(isLiquidable(p1, 0.1), false, "P1 s=0,10 : 100·0,9·0,8=72 ≥ 70");
  assert.equal(isLiquidable(p1, 0.125), false, "P1 s=0,125 : 70 < 70 est faux — le seuil n'est pas liquidable");
  assert.equal(isLiquidable(p1, 0.2), true, "P1 s=0,20 : 100·0,8·0,8=64 < 70");
  // P2 : ne bascule qu'au-delà de 60 %.
  assert.equal(isLiquidable(p2, 0.5), false, "P2 s=0,50 : 100·0,5·0,5=25 ≥ 20");
  assert.equal(isLiquidable(p2, 0.7), true, "P2 s=0,70 : 100·0,3·0,5=15 < 20");
  // P3 : déjà liquidable sans choc.
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

  // Monotone en le choc : un choc plus fort ne « dé-liquide » jamais une position.
  let prev = -1;
  for (const s of [0, 0.1, 0.125, 0.2, 0.5, 0.7, 1]) {
    const d = liquidableAmount(positions, s).liquidableDebt;
    assert.ok(d >= prev, `liquidableDebt croissant en s (s=${s})`);
    prev = d;
  }
});
