import { test } from "node:test";
import assert from "node:assert/strict";
import { imocpStep, arrivedErrors, remainingBudget, budgetAt, gate } from "../src/index.ts";
import type { GateInput } from "../src/index.ts";
import { buildVerdict, buildSetRegion } from "../src/index.ts";

// Test 9 — direction of the IM-OCP step (mechanism, NOT a guarantee — D4 branch b).
test("imocp_update_direction", () => {
  const alpha = 0.1;
  const eta = 0.05;
  const r0 = 0.5;
  const onMiscover = imocpStep(r0, alpha, 1, eta); // E=1 ⇒ r rises
  const onCover = imocpStep(r0, alpha, 0, eta); // E=0 ⇒ r falls
  assert.ok(onMiscover > r0, `miscover ⇒ r rises (${onMiscover} > ${r0})`);
  assert.ok(onCover < r0, `cover ⇒ r falls (${onCover} < ${r0})`);
});

// Test 10 — B_t NEVER uses a pending label (H4 no-peek), even at delay=0.
test("budget_ignores_pending_label", () => {
  const alpha = 0.1;
  // Two timelines that differ ONLY at index t (the window currently under decision).
  const t = 5;
  const baseTL = [0, 1, 0, 0, 1, 0, 0] as const;
  const tlA = baseTL.map((e, i) => (i === t ? 0 : e));
  const tlB = baseTL.map((e, i) => (i === t ? 1 : e));
  // At delay=0, the current label (index t) is excluded since i<t is required (no-peek).
  assert.equal(
    budgetAt(tlA, t, 0, alpha),
    budgetAt(tlB, t, 0, alpha),
    "B_t identical whatever y_t (delay=0 does not peek)",
  );
  // At delay=2, a label from window t-1 is not yet settled (i+delay=t+1>t) ⇒ excluded.
  const arrivedDelay2 = arrivedErrors(baseTL, t, 2);
  assert.ok(!arrivedDelay2.includes(baseTL[t - 1] as 0 | 1) || arrivedDelay2.length < t, "pending not counted");
  // t°=0 ⇒ B = alpha (nothing consumed).
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
    tauInterval: 1, // inert: verdict `set` (interval path not exercised here)
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

// Test 11 — B_t < B_floor ⇒ refuses COMMIT (H5).
test("budget_exhausted_refuses_commit", () => {
  const ok = gate(commitInput({ remainingBudget: 0.1, bFloor: 0 }));
  assert.equal(ok.action, "commit", "sufficient budget ⇒ COMMIT");
  const exhausted = gate(commitInput({ remainingBudget: -0.01, bFloor: 0 }));
  assert.equal(exhausted.action, "abstain");
  assert.equal(exhausted.reason, "budget_exhausted");
  assert.equal(exhausted.allow, false);
});
