import { test } from "node:test";
import assert from "node:assert/strict";
import { gate, conformInterval, LIQUIDABLE_24H_CLASS, LIQUIDABLE_24H_ALPHA, LIQUIDABLE_24H_NMIN } from "../src/index.ts";
import type { GateInput, CalibPair } from "../src/index.ts";
import type { CoverageVerdict } from "@monark/contracts";

// Real `interval` verdict: q̂ = 99 on residuals {1,…,99}, ŷ=1000 ⇒ region [901,1099], width 198.
const hand: CalibPair[] = Array.from({ length: 99 }, (_, i) => ({ yhat: 1000, y: 1000 + (i + 1) }));
const intervalVerdict: CoverageVerdict = conformInterval({
  calib: hand,
  yhat: 1000,
  alpha: LIQUIDABLE_24H_ALPHA,
  nMin: LIQUIDABLE_24H_NMIN,
  taskClass: LIQUIDABLE_24H_CLASS,
  residual: ["assume:synthetic-liquidable-24h"],
  producedAt: "2026-09-04T00:00:00Z",
  schemaVersion: "1.0.0",
}).verdict;

function input(over: Partial<GateInput>): GateInput {
  return {
    intent: 1000,
    verdict: intervalVerdict,
    remainingBudget: 0.1,
    bFloor: 0,
    tau: 1,
    tauInterval: 250,
    nCalib: 300,
    nMin: LIQUIDABLE_24H_NMIN,
    clockOpen: true,
    timedOut: false,
    evaluable: true,
    tool: "perps_order_preview",
    schemaVersion: "1.0.0",
    ...over,
  };
}

// Test 35 (ADR-M003 D11) — the three states of the `interval` path on width/intent (D6.1). Named
// mutant: τ_interval inverted (`width > tauInterval` → `width < tauInterval`) ⇒ COMMIT and DEFER
// swap ⇒ this test red.
test("interval_gate_commit_defer_abstain", () => {
  const WIDTH = 1099 - 901; // 198

  // COMMIT: intent ∈ [901,1099] AND width (198) <= τ_interval (250).
  const commit = gate(input({ intent: 1000, tauInterval: 250 }));
  assert.equal(commit.action, "commit", "intent∈region, width<=τ ⇒ COMMIT");
  assert.equal(commit.reason, "covered");
  assert.equal(commit.allow, true);

  // DEFER: width (198) > τ_interval (150), clock open.
  const defer = gate(input({ intent: 1000, tauInterval: 150, clockOpen: true }));
  assert.equal(defer.action, "defer", `width ${WIDTH} > τ ⇒ DEFER`);
  assert.equal(defer.reason, "interval_too_wide");
  assert.equal(defer.allow, false);

  // ABSTAIN: intent ∉ [901,1099], width <= τ.
  const abstain = gate(input({ intent: 500, tauInterval: 250 }));
  assert.equal(abstain.action, "abstain", "intent∉region ⇒ ABSTAIN");
  assert.equal(abstain.reason, "intent_not_in_region");
  assert.equal(abstain.allow, false);

  // Module clock invariant: an impossible DEFER (clock closed) becomes ABSTAIN clock_expired.
  const clockClosed = gate(input({ intent: 1000, tauInterval: 150, clockOpen: false }));
  assert.equal(clockClosed.action, "abstain", "width>τ but clock closed ⇒ ABSTAIN");
  assert.equal(clockClosed.reason, "clock_expired");

  // The decision carries the verdict's `interval` region (numeric containment, C6).
  assert.equal(commit.verdict.region.kind, "interval");
  assert.equal(commit.intent, 1000);
});
