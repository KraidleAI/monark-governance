/**
 * Harness -- served Mondrian strata + the upper-bound region helper (U-4b-2a; ADR-U4b D1/D3; decisions
 * 108/126; checkpoint-1 C-5 + delta D-1/D-2). Literal-only (survives the public export). Each test is killed
 * by >= 1 named mutant, run by the -2a mutant harness (see the passe report).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { STRATA_CUTS_SERVED, strateOf, liqUpperBoundRegion } from "../src/ukemi-strata.ts";

// 2a-6a -- the SERVED cuts equal the frozen values BY VALUE, and strateOf is exact at the code cuts (9
// boundaries, left-closed). Mutant (d) off-by-one (`<` -> `<=`) and mutant (k) wrong unit (cuts / 1e8) each
// redden a boundary here (and, on the fixture, in the sentinel twin u4b_served_strateof_matches_frozen_on_jsonl).
test("u4b_served_strata_cuts_and_boundaries", () => {
  assert.deepEqual(STRATA_CUTS_SERVED, [200000000000, 10000000000000, 100000000000000], "served cuts == {2000e8, 100k$, 1M$}");
  assert.equal(strateOf(0), 0, "0 -> strate 0");
  assert.equal(strateOf(199999999999), 0, "just below 2000e8 -> strate 0");
  assert.equal(strateOf(200000000000), 1, "at 2000e8 -> strate 1 (half-open [cut, .))");
  assert.equal(strateOf(9999999999999), 1, "just below 100k$ -> strate 1");
  assert.equal(strateOf(10000000000000), 2, "at 100k$ -> strate 2");
  assert.equal(strateOf(99999999999999), 2, "just below 1M$ -> strate 2");
  assert.equal(strateOf(100000000000000), 3, "at 1M$ -> strate 3");
  assert.equal(strateOf(182275303256926), 3, "the e2 max cell-A yhat -> strate 3");
  assert.equal(strateOf(9007199254740991), 3, "2^53 - 1 (the safe-integer ceiling) -> strate 3");
});

// helper -- liqUpperBoundRegion is the UPPER BOUND [0, yhat + qhat], never the symmetric [yhat-qhat, yhat+qhat],
// and qhat=0 abstains under_calib (delta D-2). Mutant (n) symmetric form and mutant (p) dropped qhat=0 guard redden.
test("u4b_liq_upper_bound_region_helper", () => {
  // qhat > 0, yhat > 0 -> a bounded region [0, yhat + qhat]; the wire kind stays "interval" (frozen contract).
  const r = liqUpperBoundRegion(1000, 200);
  assert.equal(r.abstain, false, "qhat>0 -> a bounded region");
  if (r.abstain) throw new Error("unreachable"); // narrow for the type-checker (no `any`, off the ratchet)
  assert.equal(r.region.kind, "interval", "the wire kind stays 'interval' (frozen contract, delta D-1)");
  assert.equal(r.region.lo, 0, "the lower edge is 0 by construction (upper bound, NOT the symmetric yhat-qhat=800)");
  assert.equal(r.region.hi, 1200, "the upper edge is yhat + qhat = 1200");
  // qhat = 0 -> abstain under_calib (delta D-2): serving [0, yhat] would fabricate certainty; NDG-1 does not
  // fire here (lo=0 != hi=yhat), so the helper closes the hole explicitly.
  const z = liqUpperBoundRegion(1000, 0);
  assert.equal(z.abstain, true, "qhat=0 -> abstain (delta D-2, the upper-bound NDG-1 hole)");
  if (!z.abstain) throw new Error("unreachable");
  assert.equal(z.reason, "under_calib", "qhat=0 abstention reason is under_calib");
  // yhat + qhat = 0 (yhat=0, qhat=0) -> under_calib (subsumed by the qhat=0 guard; NDG-1 lo===hi===0).
  assert.equal(liqUpperBoundRegion(0, 0).abstain, true, "yhat=qhat=0 -> abstain under_calib");
  // yhat=0, qhat>0 -> a valid [0, qhat] region (a strate-0 amount of 0 is legitimate).
  const y0 = liqUpperBoundRegion(0, 5);
  assert.equal(y0.abstain, false, "yhat=0, qhat>0 -> [0, qhat] is a valid region");
  if (y0.abstain) throw new Error("unreachable");
  assert.equal(y0.region.lo, 0);
  assert.equal(y0.region.hi, 5);
});
