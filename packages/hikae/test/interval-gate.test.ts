import { test } from "node:test";
import assert from "node:assert/strict";
import { gate, conformInterval, LIQUIDABLE_24H_CLASS, LIQUIDABLE_24H_ALPHA, LIQUIDABLE_24H_NMIN } from "../src/index.ts";
import type { GateInput, CalibPair } from "../src/index.ts";
import type { CoverageVerdict } from "@monark/contracts";

// Verdict `interval` réel : q̂ = 99 sur résidus {1,…,99}, ŷ=1000 ⇒ région [901,1099], largeur 198.
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

// Test 35 (ADR-M003 D11) — les trois états du chemin `interval` sur largeur/intention (D6.1). Mutant
// nommé : τ_interval inversé (`width > tauInterval` → `width < tauInterval`) ⇒ COMMIT et DEFER
// s'échangent ⇒ ce test rouge.
test("interval_gate_commit_defer_abstain", () => {
  const WIDTH = 1099 - 901; // 198

  // COMMIT : intention ∈ [901,1099] ET largeur (198) <= τ_interval (250).
  const commit = gate(input({ intent: 1000, tauInterval: 250 }));
  assert.equal(commit.action, "commit", "intent∈région, largeur<=τ ⇒ COMMIT");
  assert.equal(commit.reason, "covered");
  assert.equal(commit.allow, true);

  // DEFER : largeur (198) > τ_interval (150), horloge ouverte.
  const defer = gate(input({ intent: 1000, tauInterval: 150, clockOpen: true }));
  assert.equal(defer.action, "defer", `largeur ${WIDTH} > τ ⇒ DEFER`);
  assert.equal(defer.reason, "interval_too_wide");
  assert.equal(defer.allow, false);

  // ABSTAIN : intention ∉ [901,1099], largeur <= τ.
  const abstain = gate(input({ intent: 500, tauInterval: 250 }));
  assert.equal(abstain.action, "abstain", "intent∉région ⇒ ABSTAIN");
  assert.equal(abstain.reason, "intent_not_in_region");
  assert.equal(abstain.allow, false);

  // Invariant d'horloge du module : un DEFER impossible (horloge close) devient ABSTAIN clock_expired.
  const clockClosed = gate(input({ intent: 1000, tauInterval: 150, clockOpen: false }));
  assert.equal(clockClosed.action, "abstain", "largeur>τ mais horloge close ⇒ ABSTAIN");
  assert.equal(clockClosed.reason, "clock_expired");

  // La décision porte la région `interval` du verdict (containment numérique, C6).
  assert.equal(commit.verdict.region.kind, "interval");
  assert.equal(commit.intent, 1000);
});
