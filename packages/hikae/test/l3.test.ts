import { test } from "node:test";
import assert from "node:assert/strict";
import { gate, buildVerdict, buildSetRegion } from "../src/index.ts";
import type { GateInput } from "../src/index.ts";
import type { CoverageVerdict } from "@monark/contracts";

function mkVerdict(labels: string[], qhat: number, reason: CoverageVerdict["reason"]): CoverageVerdict {
  return buildVerdict({
    taskClass: "btc-dir-15m",
    method: "hac-cp",
    alpha: 0.1,
    scores: Array.from({ length: 50 }, (_, i) => (i % 2 === 0 && labels.length > 1 ? 1 : i < 47 ? 0 : 1)),
    region: buildSetRegion(labels),
    qhat,
    abstain: labels.length > 1,
    reason,
    residual: [],
    producedAt: "2026-09-04T00:00:00Z",
    schemaVersion: "1.0.0",
  });
}

function input(over: Partial<GateInput> & Pick<GateInput, "verdict" | "intent">): GateInput {
  return {
    remainingBudget: 0.1,
    bFloor: 0,
    tau: 1,
    nCalib: 50,
    nMin: 50,
    clockOpen: true,
    timedOut: false,
    evaluable: true,
    tool: "perps_order_preview",
    schemaVersion: "1.0.0",
    ...over,
  };
}

// Test 2 — intent hors région ⇒ ABSTAIN (littéral gelé intent_not_in_region).
test("intent_not_in_region_denied", () => {
  const v = mkVerdict(["up"], 0, "covered");
  const d = gate(input({ verdict: v, intent: "down" })); // down ∉ {up}
  assert.equal(d.action, "abstain");
  assert.equal(d.reason, "intent_not_in_region");
  assert.equal(d.allow, false);
});

// Test 3 — timeout ⇒ deny upstream_timeout, jamais un set.
test("timeout_is_deny", () => {
  const v = mkVerdict(["up"], 0, "covered");
  const d = gate(input({ verdict: v, intent: "up", timedOut: true }));
  assert.equal(d.action, "abstain");
  assert.equal(d.reason, "upstream_timeout");
});

// Test 6 — |C|>tau (q̂=1 ⇒ {up,down}) ⇒ DEFER, pas COMMIT.
test("set_too_large_defers", () => {
  const v = mkVerdict(["up", "down"], 1, "set_too_large");
  const d = gate(input({ verdict: v, intent: "up", clockOpen: true }));
  assert.equal(d.action, "defer");
  assert.equal(d.reason, "set_too_large");
  // Horloge close ⇒ le DEFER se convertit en ABSTAIN clock_expired.
  const d2 = gate(input({ verdict: v, intent: "up", clockOpen: false }));
  assert.equal(d2.action, "abstain");
  assert.equal(d2.reason, "clock_expired");
});

// Test 7 — H3 : le report ne change pas Σ miscover. Deux politiques RÉELLEMENT distinctes passent
// par `gate()` : π^H (τ=1 : un 2-set ⇒ DEFER) et π⁰ (τ=2 : un 2-set ⇒ COMMIT). E_t = 1{y∉C_t} est
// dérivé du MÊME C_t (région du verdict, L1) — la politique ne touche jamais C_t. Si `l3-gate`
// corrompait la comptabilité (ex. DEFER → COMMIT), le compte de DEFER ci-dessous casse.
test("deferral_preserves_miscover", () => {
  const seq: { labels: string[]; y: string }[] = [
    { labels: ["up"], y: "up" }, // covered
    { labels: ["up"], y: "down" }, // miscover
    { labels: ["up", "down"], y: "down" }, // covered (DEFER sous π^H, COMMIT sous π⁰)
    { labels: ["up", "down"], y: "up" }, // covered
    { labels: ["down"], y: "up" }, // miscover
  ];
  const run = (tau: number) => {
    let miscover = 0;
    let defers = 0;
    let commits = 0;
    for (const { labels, y } of seq) {
      const v = mkVerdict(labels, labels.length > 1 ? 1 : 0, labels.length > 1 ? "set_too_large" : "covered");
      const d = gate(input({ verdict: v, intent: labels[0] as string, tau }));
      const C = d.verdict.region;
      assert.ok(C !== undefined && C !== null && C.kind === "set", "C_t porté par la décision");
      if (!C.labels.includes(y)) miscover++;
      if (d.action === "defer") defers++;
      if (d.action === "commit") commits++;
    }
    return { miscover, defers, commits };
  };
  const piH = run(1);
  const pi0 = run(2);
  assert.equal(piH.defers, 2, "π^H reporte les deux 2-sets");
  assert.equal(pi0.defers, 0, "π⁰ ne reporte jamais");
  assert.equal(pi0.commits, piH.commits + 2, "les deux politiques diffèrent réellement");
  assert.equal(piH.miscover, pi0.miscover, "Σ 1{y∉C} identique (H3)");
  assert.equal(piH.miscover, 2, "2 miscovers, invariants au report");
});
