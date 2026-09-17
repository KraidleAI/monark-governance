import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildIntervalRegion,
  buildSetRegion,
  buildVerdict,
  conformInterval,
  absoluteResidualScores,
  splitQuantile,
  gate,
} from "../src/index.ts";
import type { CalibPair, GateInput } from "../src/index.ts";
import type { PredictionRegion } from "@monark/contracts";

// ADR-M011 — interval non-degeneracy (NDG-1). A zero-width `interval` region (`lo === hi`, whether
// q̂=0 or float absorption) is NOT a `covered` verdict: it is a fail-closed `under_calib` abstention.
// Anti-circularity: the vectors here are built by hand / by fed scores, and every `under_calib` is
// proven to come from the region guard (NDG-1), NOT from L1's `n<nMin`/`p>n` path.

// Provenance (ADR-M011 §1): the msUSD F2-A episode (fixture sha
// d95cc0a34507ff9593ed52d55463c2daeca826a9cd2117e5776c19cabdff5e58, 198 windows, OUT-OF-REPO, REFUSED /
// negative closure — authority: ADR-M011 §1; see also docs/PLAN-m008-f2b-usde.md §0). This vector REPRODUCES its degenerate STRUCTURE —
// n=191 calm windows = 190 zero residuals + 1 positive dust (1 token / ~82M supply, ratio ≈ 1.2e-8). It
// is NOT the exact 198-window fixture and does not hash to that sha.
const DUST = 1.2e-8;
const NMIN = 5; // explicit, <= 191 — isolates NDG-1 from L1's n<nMin path (anti-circularity)
const COMMON = {
  alpha: 0.1, // PINNED — the trap: at α=0.01, p=n=191 ⇒ q̂ = the dust > 0 ⇒ NON-degenerate region
  nMin: NMIN,
  taskClass: "byo-msusd-like",
  residual: [] as string[],
  producedAt: "2026-09-17T00:00:00Z",
  schemaVersion: "1.0.0",
};

// §3.1 — conformer, msUSD-like degenerate calibration (190 residuals=0 + 1 dust) at α=0.10 PINNED.
test("interval_nondegenerate_conformer_msusd_like_under_calib", () => {
  // 190 pairs with residual 0 (yhat===y) + 1 pair with residual DUST. n=191.
  const calib: CalibPair[] = [
    ...Array.from({ length: 190 }, () => ({ yhat: 0, y: 0 })),
    { yhat: 0, y: DUST },
  ];
  const scores = absoluteResidualScores(calib);
  assert.equal(scores.length, 191, "n=191");
  assert.equal(scores.filter((s) => s === 0).length, 190, "190 zero residuals");
  assert.equal(scores.filter((s) => s > 0).length, 1, "exactly 1 positive residual (dust) — kills a naive all-zeros guard");

  // ANTI-CIRCULARITY: L1 produces q̂=0 here (NOT under_calib) ⇒ the under_calib below comes from the
  // region guard (NDG-1), not from splitQuantile. p=⌈192·0.9⌉=173, sorted[172]=0 (190 zeros fill 0..189).
  assert.deepEqual(splitQuantile(scores, 0.1, NMIN), { qhat: 0 }, "L1 q̂=0 at α=0.10 (not under_calib)");

  const r = conformInterval({ ...COMMON, calib, yhat: 1000 });
  assert.equal(r.verdict.reason, "under_calib", "zero-width region ⇒ under_calib (NDG-1)");
  assert.equal(r.verdict.abstain, true);
  assert.equal(r.qhat, null, "q̂ null on abstention (never clamped, never a width-0 covered)");
  assert.equal(r.region, null, "no interval region emitted");

  // NEGATIVE CONTROL — the α pin is load-bearing: the SAME vector at α=0.01 ⇒ p=n=191 ⇒ q̂ = the dust > 0
  // ⇒ NON-degenerate region ⇒ covered. Also proves the vector genuinely carries its one positive score.
  assert.deepEqual(splitQuantile(scores, 0.01, NMIN), { qhat: DUST }, "at α=0.01, q̂ = the dust > 0");
  const rNeg = conformInterval({ ...COMMON, alpha: 0.01, calib, yhat: 1000 });
  assert.equal(rNeg.verdict.reason, "covered", "α=0.01 ⇒ q̂>0 ⇒ non-degenerate ⇒ covered");
  assert.equal(rNeg.qhat, DUST);
  assert.notEqual(rNeg.region, null);
});

// §3.1 (pure) — all-zeros calibration (191 zeros): α-INDEPENDENT degeneracy ⇒ q̂=0 at any α ⇒ under_calib.
test("interval_nondegenerate_conformer_all_zeros_under_calib", () => {
  const calib: CalibPair[] = Array.from({ length: 191 }, () => ({ yhat: 5, y: 5 }));
  for (const alpha of [0.1, 0.01, 0.2]) {
    const r = conformInterval({ ...COMMON, alpha, calib, yhat: 5 });
    assert.equal(r.verdict.reason, "under_calib", `all-zeros ⇒ under_calib at α=${String(alpha)}`);
    assert.equal(r.verdict.abstain, true);
    assert.equal(r.qhat, null);
    assert.equal(r.region, null);
  }
});

// §3.2 — a hand-built zero-width `interval` region (bypassing buildIntervalRegion) carried by a `covered`
// verdict reaching L3 ⇒ decideInterval NDG-1 guard (D3(b)) abstains under_calib, NEVER commits.
test("interval_nondegenerate_l3_handbuilt_zero_width_abstains", () => {
  const region: PredictionRegion = { kind: "interval", lo: 100, hi: 100 };
  const verdict = buildVerdict({
    taskClass: "byo-handbuilt",
    method: "split",
    alpha: 0.1,
    scores: [1, 2, 3, 4, 5],
    region,
    qhat: 0,
    abstain: false,
    reason: "covered", // a forged covered verdict — the exact bug shape (auto-commit on width 0)
    residual: [],
    producedAt: "2026-09-17T00:00:00Z",
    schemaVersion: "1.0.0",
  });
  const input: GateInput = {
    intent: 100, // intent ∈ [100,100] ⇒ WITHOUT the guard (mutant M2) this COMMITs
    verdict,
    remainingBudget: 0.1,
    bFloor: 0,
    tau: 1,
    tauInterval: 1,
    nCalib: 50,
    nMin: 50, // nCalib >= nMin AND verdict.reason=covered ⇒ the line-79 guard does NOT fire (isolates D3(b))
    clockOpen: true,
    timedOut: false,
    evaluable: true,
    tool: "perps_order_preview",
    schemaVersion: "1.0.0",
  };
  const d = gate(input);
  assert.equal(d.action, "abstain", "zero-width interval region ⇒ ABSTAIN (NDG-1 D3(b)), never COMMIT");
  assert.equal(d.allow, false);
  assert.equal(d.reason, "under_calib");
});

// §3.3 (unit) — the structural NDG-1 guard on the SOLE constructor: equal bounds ⇒ abstain under_calib.
test("interval_nondegenerate_buildIntervalRegion_equal_bounds", () => {
  const r = buildIntervalRegion(1e6, 1e6);
  assert.equal(r.abstain, true, "buildIntervalRegion(1e6,1e6) ⇒ abstain (NDG-1)");
  if (r.abstain) assert.equal(r.reason, "under_calib");
});

// §3.4(a) — non-regression: a `set` singleton q̂=0 (C={ŷ}) is a LEGITIMATE calibrated silence (D5), NOT
// degenerate — intent ∈ {up} ⇒ COMMIT covered. The NDG-1 guard is interval-scoped and must not touch it.
test("interval_nondegenerate_set_singleton_qhat0_still_commits", () => {
  const region = buildSetRegion(["up"]);
  const verdict = buildVerdict({
    taskClass: "btc-dir-15m",
    method: "split",
    alpha: 0.1,
    scores: Array.from({ length: 50 }, () => 0),
    region,
    qhat: 0,
    abstain: false,
    reason: "covered",
    residual: [],
    producedAt: "2026-09-17T00:00:00Z",
    schemaVersion: "1.0.0",
  });
  const d = gate({
    intent: "up",
    verdict,
    remainingBudget: 0.1,
    bFloor: 0,
    tau: 1,
    tauInterval: 1,
    nCalib: 50,
    nMin: 50,
    clockOpen: true,
    timedOut: false,
    evaluable: true,
    tool: "perps_order_preview",
    schemaVersion: "1.0.0",
  });
  assert.equal(d.action, "commit", "set singleton q̂=0, intent ∈ {up} ⇒ COMMIT (D5, not degenerate)");
  assert.equal(d.reason, "covered");
  assert.equal(d.allow, true);
});

// §3.4(b) — non-regression: a real `interval` q̂=99 region [901,1099] (lo<hi) ⇒ covered/COMMIT untouched.
test("interval_nondegenerate_real_interval_still_commits", () => {
  const hand: CalibPair[] = Array.from({ length: 99 }, (_, i) => ({ yhat: 1000, y: 1000 + (i + 1) }));
  const r = conformInterval({ ...COMMON, alpha: 0.01, nMin: 50, calib: hand, yhat: 1000 });
  assert.equal(r.qhat, 99, "q̂ = 99 (residuals {1..99}, α=0.01, p=n=99)");
  assert.deepEqual(r.region, { lo: 901, hi: 1099 });
  assert.equal(r.verdict.reason, "covered");
  const d = gate({
    intent: 1000,
    verdict: r.verdict,
    remainingBudget: 0.1,
    bFloor: 0,
    tau: 1,
    tauInterval: 250,
    nCalib: 99,
    nMin: 50,
    clockOpen: true,
    timedOut: false,
    evaluable: true,
    tool: "perps_order_preview",
    schemaVersion: "1.0.0",
  });
  assert.equal(d.action, "commit", "width 198 <= τ 250, intent ∈ [901,1099] ⇒ COMMIT");
  assert.equal(d.reason, "covered");
});
