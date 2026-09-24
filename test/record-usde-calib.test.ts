// test/record-usde-calib.test.ts — non-network oracle for the recorder q99 fail-closed fix (ADR-M015 D1(a),
// lot P0-a). The recorder's ALERT_P=0.99 alert quantile needs rank ceil((n+1)*0.99) <= n calm pairs (n >= 99);
// below that the retrospective is UNDECIDABLE, not negative. Before this lot, q() returned Infinity and the
// closure mislabeled every 50 <= n < 99 population as "valid-but-retrospective-negative". This test feeds the
// extracted PURE decision synthetic calm-pair series — no I/O, no network (the recorder stays out of CI for
// its network pull; nothing here pulls). Runs at the repo root under `node --test`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateClosure } from "../scripts/record-usde-calib.mjs";

// Non-degenerate, active calm-pair residuals of length n: strictly positive and distinct so q_hat > 0 (width)
// and support/activity hold — isolating q99 decidability as the ONLY condition at play on the n=98/99 boundary.
const calmScores = (n: number): number[] => Array.from({ length: n }, (_, i) => (i + 1) * 1e-6);
// A run-window velocity above every calm score: retrospective-positive IF (and only if) q99 is decidable.
const RUN_CROSSING = [1];

test("record q99 fail-closed — n=98 calm pairs => retrospective-undecidable, q99_calm null, non-committable", () => {
  const dec = evaluateClosure({ scores: calmScores(98), rho: 1, runVelocities: RUN_CROSSING });
  assert.equal(dec.closure, "under_calib:retrospective-undecidable");
  assert.equal(dec.q99_calm, null); // fail-closed: null, never Infinity (Infinity is not valid JSON)
  assert.equal(dec.q99_decidable, false);
  assert.equal(dec.committable, false);
  assert.equal(dec.reason, "q99 needs n >= 99 calm pairs; got 98");
  // Support / activity / width all HOLD — undecidability is the SOLE reason, not degeneracy (the older
  // "insufficient-support-or-degenerate" branch must not swallow this case).
  assert.equal(dec.enough_support, true);
  assert.equal(dec.enough_activity, true);
  assert.equal(dec.zero_width, false);
});

// Mutant "n = 99" => q99 becomes decidable: the boundary is EXACTLY n=99. With a crossing run window and all
// §5.1 conditions met the population is COMMITTABLE — proving the undecidable label does not mask a decidable one.
test("record q99 fail-closed — mutant n=99 => decidable (COMMITTABLE, not undecidable)", () => {
  const dec = evaluateClosure({ scores: calmScores(99), rho: 1, runVelocities: RUN_CROSSING });
  assert.equal(dec.q99_decidable, true);
  assert.equal(typeof dec.q99_calm, "number");
  assert.ok(dec.q99_calm !== null && Number.isFinite(dec.q99_calm));
  assert.notEqual(dec.closure, "under_calib:retrospective-undecidable");
  assert.equal(dec.closure, "COMMITTABLE");
});

// Mutant "Infinity reintroduced": the fix makes q() return null (not Infinity) when the rank exceeds n. If a
// regression let Infinity through, q99_calm would be Infinity (not null) AND the closure would silently fall to
// "valid-but-retrospective-negative" — both reddening the n=98 assertions. This restates the invariant directly.
test("record q99 fail-closed — q99_calm stays null (never Infinity) when undecidable", () => {
  const dec = evaluateClosure({ scores: calmScores(98), rho: 1, runVelocities: [] });
  assert.equal(dec.q99_calm, null);
  assert.equal(Number.isFinite(dec.q99_calm), false);
  assert.notEqual(dec.q99_calm, Infinity);
});
