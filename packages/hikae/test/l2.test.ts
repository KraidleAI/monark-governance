import { test } from "node:test";
import assert from "node:assert/strict";
import { imocpStep, arrivedErrors, remainingBudget, budgetAt, gate } from "../src/index.ts";
import type { GateInput } from "../src/index.ts";
import { buildVerdict, buildSetRegion } from "../src/index.ts";

// Test 9 — direction du pas IM-OCP (mécanisme, PAS une garantie — D4 branche b).
test("imocp_update_direction", () => {
  const alpha = 0.1;
  const eta = 0.05;
  const r0 = 0.5;
  const onMiscover = imocpStep(r0, alpha, 1, eta); // E=1 ⇒ r monte
  const onCover = imocpStep(r0, alpha, 0, eta); // E=0 ⇒ r baisse
  assert.ok(onMiscover > r0, `miscover ⇒ r monte (${onMiscover} > ${r0})`);
  assert.ok(onCover < r0, `cover ⇒ r baisse (${onCover} < ${r0})`);
});

// Test 10 — B_t n'utilise JAMAIS un label en attente (H4 no-peek), même à delay=0.
test("budget_ignores_pending_label", () => {
  const alpha = 0.1;
  // Deux timelines qui ne diffèrent QUE sur l'indice t (la fenêtre en cours de décision).
  const t = 5;
  const baseTL = [0, 1, 0, 0, 1, 0, 0] as const;
  const tlA = baseTL.map((e, i) => (i === t ? 0 : e));
  const tlB = baseTL.map((e, i) => (i === t ? 1 : e));
  // À delay=0, le label courant (index t) est exclu car i<t requis (no-peek).
  assert.equal(
    budgetAt(tlA, t, 0, alpha),
    budgetAt(tlB, t, 0, alpha),
    "B_t identique quel que soit y_t (delay=0 ne peek pas)",
  );
  // À delay=2, un label de la fenêtre t-1 n'est pas encore réglé (i+delay=t+1>t) ⇒ exclu.
  const arrivedDelay2 = arrivedErrors(baseTL, t, 2);
  assert.ok(!arrivedDelay2.includes(baseTL[t - 1] as 0 | 1) || arrivedDelay2.length < t, "pending non compté");
  // t°=0 ⇒ B = alpha (rien consommé).
  assert.equal(remainingBudget([], alpha), alpha);
});

function commitInput(over: Partial<GateInput>): GateInput {
  const verdict = buildVerdict({
    taskClass: "btc-dir-15m",
    method: "hac-cp",
    alpha: 0.1,
    scores: Array.from({ length: 50 }, (_, i) => (i < 47 ? 0 : 1)),
    region: buildSetRegion(["up"]),
    qhat: 0,
    abstain: false,
    reason: "covered",
    residual: [],
    producedAt: "2026-09-04T00:00:00Z",
    schemaVersion: "1.0.0",
  });
  return {
    intent: "up",
    verdict,
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

// Test 11 — B_t < B_floor ⇒ refuse COMMIT (H5).
test("budget_exhausted_refuses_commit", () => {
  const ok = gate(commitInput({ remainingBudget: 0.1, bFloor: 0 }));
  assert.equal(ok.action, "commit", "budget suffisant ⇒ COMMIT");
  const exhausted = gate(commitInput({ remainingBudget: -0.01, bFloor: 0 }));
  assert.equal(exhausted.action, "abstain");
  assert.equal(exhausted.reason, "budget_exhausted");
  assert.equal(exhausted.allow, false);
});
