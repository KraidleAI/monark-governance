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

// Test 15 — M5 (lo>hi ⇒ throw) + NDG-1 (ADR-M011): lo < hi STRICT for a valid region; lo === hi
// (zero width) is degenerate ⇒ under_calib abstention, never a bounded `covered` region.
test("interval_lo_le_hi", () => {
  const r = buildIntervalRegion(-0.03, 0.03);
  assert.equal(r.abstain, false);
  if (!r.abstain) {
    assert.equal(r.region.kind, "interval");
    assert.equal(r.region.lo, -0.03);
    assert.equal(r.region.hi, 0.03);
  }
  assert.throws(() => buildIntervalRegion(0.05, 0.01), /lo .* > hi|M5/, "lo>hi ⇒ throw (M5)");
  // NDG-1 (ADR-M011): equal bounds (zero width) ⇒ abstention under_calib (was `abstain:false` pre-M011).
  const eq = buildIntervalRegion(1, 1);
  assert.equal(eq.abstain, true, "lo === hi ⇒ zero-width degenerate ⇒ abstain (NDG-1)");
  if (eq.abstain) assert.equal(eq.reason, "under_calib");
});

// Test 16 — non-finite bound ⇒ abstention (never ±inf on the wire).
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
  // Finiteness takes precedence over lo>hi: (+Inf, 5) is "unbounded ⇒ abstention", not an M5 throw.
  assert.equal(buildIntervalRegion(Infinity, 5).abstain, true);
});

// Test 17 — no feature indexed after t (anti look-ahead, D7).
test("features_strictly_before_t", () => {
  const t = 60 * 60; // decision instant (seconds)
  const mk = (closeTime: number, close: number): Candle => ({ close_time: closeTime, open: close, close });
  const byTime = new Map<number, Candle>();
  // Candles completed at t, t-15m, t-30m, t-45m, t-60m (all <= t).
  for (const off of [0, 15, 30, 45, 60]) byTime.set(t - off * 60, mk(t - off * 60, 100 + off));
  const f = extractMomentumFeatures(byTime, t);
  assert.equal(f.closes.length, 5);
  // close[t] accepted (offset 0).
  assert.equal(featureCloseAt(byTime, t, 0), 100);
  // A candle completed AFTER t (negative offset ⇒ close_time>t) ⇒ throw (look-ahead forbidden).
  byTime.set(t + 15 * 60, mk(t + 15 * 60, 999));
  assert.throws(() => featureCloseAt(byTime, t, -15), /look-ahead|D7/, "close completed after t rejected");
  // The sign(close-open) label is never a feature (design invariant).
  assert.equal(momentum4c(f), signDirection(f.closes[0], f.closes[4]));
  assert.equal(labelOf(mk(t, 100)), "non_evaluable", "close==open ⇒ non_evaluable");
});

// Non-regression guard: buildSetRegion copies defensively.
test("build_set_region_defensive_copy", () => {
  const labels = ["up"];
  const r = buildSetRegion(labels);
  labels.push("down");
  assert.deepEqual(r.labels, ["up"], "the region does not share the source array");
});
