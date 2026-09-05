import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildIntervalRegion,
  buildSetRegion,
  extractMomentumFeatures,
  featureCloseAt,
  momentum4c,
  labelOf,
  signDirection,
} from "../src/index.ts";
import type { Candle } from "../src/index.ts";

// Test 15 — invariant M5 : lo <= hi, sinon throw ; lo <= hi ⇒ région bornée.
test("interval_lo_le_hi", () => {
  const r = buildIntervalRegion(-0.03, 0.03);
  assert.equal(r.abstain, false);
  if (!r.abstain) {
    assert.equal(r.region.kind, "interval");
    assert.equal(r.region.lo, -0.03);
    assert.equal(r.region.hi, 0.03);
  }
  assert.throws(() => buildIntervalRegion(0.05, 0.01), /lo .* > hi|M5/, "lo>hi ⇒ throw (M5)");
  // Bornes égales admises (intervalle dégénéré valide).
  assert.equal(buildIntervalRegion(1, 1).abstain, false);
});

// Test 16 — borne non finie ⇒ abstention (jamais ±inf sur le fil).
test("unbounded_is_abstain", () => {
  for (const [lo, hi] of [
    [-Infinity, 0.03],
    [0, Infinity],
    [NaN, 0.03],
    [-Infinity, Infinity],
  ] as const) {
    const r = buildIntervalRegion(lo, hi);
    assert.equal(r.abstain, true, `(${lo},${hi}) ⇒ abstention`);
    if (r.abstain) assert.equal(r.reason, "under_calib");
  }
  // La finitude prime sur lo>hi : (+Inf, 5) est « non borné ⇒ abstention », pas un throw M5.
  assert.equal(buildIntervalRegion(Infinity, 5).abstain, true);
});

// Test 17 — aucune feature indexée après t (anti look-ahead, D7).
test("features_strictly_before_t", () => {
  const t = 60 * 60; // instant de décision (secondes)
  const mk = (closeTime: number, close: number): Candle => ({ close_time: closeTime, open: close, close });
  const byTime = new Map<number, Candle>();
  // Bougies terminées à t, t-15m, t-30m, t-45m, t-60m (toutes <= t).
  for (const off of [0, 15, 30, 45, 60]) byTime.set(t - off * 60, mk(t - off * 60, 100 + off));
  const f = extractMomentumFeatures(byTime, t);
  assert.equal(f.closes.length, 5);
  // close[t] accepté (offset 0).
  assert.equal(featureCloseAt(byTime, t, 0), 100);
  // Une bougie terminée APRÈS t (offset négatif ⇒ close_time>t) ⇒ throw (look-ahead interdit).
  byTime.set(t + 15 * 60, mk(t + 15 * 60, 999));
  assert.throws(() => featureCloseAt(byTime, t, -15), /look-ahead|D7/, "close terminé après t rejeté");
  // Le label sign(close-open) n'est jamais une feature (invariant de conception).
  assert.equal(momentum4c(f), signDirection(f.closes[0], f.closes[4]));
  assert.equal(labelOf(mk(t, 100)), "non_evaluable", "close==open ⇒ non_evaluable");
});

// Garde de non-régression : buildSetRegion copie défensivement.
test("build_set_region_defensive_copy", () => {
  const labels = ["up"];
  const r = buildSetRegion(labels);
  labels.push("down");
  assert.deepEqual(r.labels, ["up"], "la région ne partage pas le tableau source");
});
