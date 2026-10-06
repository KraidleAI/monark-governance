/**
 * HIKAE L3 and interval conformer - literature oracle tests (worksite 1 of the conformal alignment).
 * The L3 reason order is written from ADR-M002 D5 as declared in the packages/hikae/src/l3-gate.ts header,
 * never read back from the chain of if in the code; every flag combination is enumerated.
 * The interval tests follow [LEI] Lei, G'Sell, Rinaldo, Tibshirani and Wasserman 2018, Thm 2.2, and
 * Papadopoulos et al. 2002 (constant width 2 qhat). All tests are pins (green at base), each with one
 * named killer. Pure: no clock, no file, seeds committed.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { gate, buildVerdict, buildSetRegion, conformInterval } from "../src/index.ts";
import type { GateInput, CalibPair } from "../src/index.ts";
import type { CoverageReason, GateAction, PredictionRegion } from "@monark/contracts";

interface Expected {
  action: GateAction;
  reason: CoverageReason;
}

/** Budget cases around the floor: below, equal (D5 reads B_t >= B_floor, so equal commits), above. */
const B_FLOOR = 0.1;
const BUDGETS = [0.05, 0.1, 0.2];

/** Reads bit i of a combination index as a boolean flag. */
const bit = (mask: number, i: number): boolean => ((mask >> i) & 1) === 1;

function mkInput(region: PredictionRegion, verdictUnderCalib: boolean, over: Partial<GateInput>): GateInput {
  const verdict = buildVerdict({
    taskClass: "oracle-class",
    method: "split",
    alpha: 0.1,
    scores: [0.5],
    region,
    qhat: verdictUnderCalib ? null : 1,
    abstain: verdictUnderCalib,
    reason: verdictUnderCalib ? "under_calib" : "covered",
    residual: [],
    producedAt: "2026-09-04T00:00:00Z",
    schemaVersion: "1.0.0",
    cell: { qhatUnit: "score", scale: null, cellKey: null, policyRowSha256: null, policyTableSha256: null },
  });
  return {
    intent: null,
    verdict,
    remainingBudget: 0.2,
    bFloor: B_FLOOR,
    tau: 1,
    tauInterval: 2,
    nCalib: 50,
    nMin: 50,
    clockOpen: true,
    timedOut: false,
    evaluable: true,
    tool: "perps_order_preview",
    schemaVersion: "1.0.0",
    requestSha256: "e".repeat(64),
    ...over,
  };
}

/** First entry whose condition holds, in the declared order; none holds: commit covered. */
function firstHit(ordered: [boolean, Expected][]): Expected {
  const hit = ordered.find(([cond]) => cond);
  return hit === undefined ? { action: "commit", reason: "covered" } : hit[1];
}

// [D5] set path, all 2^7 flag combinations times 3 budgets (384 cases). Oracle: ADR-M002 D5 as declared
// in packages/hikae/src/l3-gate.ts header, reason priority order: non_evaluable, upstream_timeout,
// under_calib (n < n_min, or verdict under_calib: D6(b)), intent_not_in_region, budget_exhausted, then
// |C| > tau (clock open: defer set_too_large, else abstain clock_expired), else commit covered.
// killer: packages/hikae/src/l3-gate.ts:94 CONST "input.nCalib < input.nMin" -> "false"
test("oracle_l3_set_path_reason_order_exhaustive", () => {
  const seen = new Set<string>();
  for (let mask = 0; mask < 128; mask++) {
    const notEvaluable = bit(mask, 0);
    const timedOut = bit(mask, 1);
    const lowCount = bit(mask, 2);
    const verdictUnderCalib = bit(mask, 3);
    const intentOut = bit(mask, 4);
    const large = bit(mask, 5);
    const clockOpen = bit(mask, 6);
    for (const remainingBudget of BUDGETS) {
      const expected = firstHit([
        [notEvaluable, { action: "abstain", reason: "non_evaluable" }],
        [timedOut, { action: "abstain", reason: "upstream_timeout" }],
        [lowCount, { action: "abstain", reason: "under_calib" }],
        [verdictUnderCalib, { action: "abstain", reason: "under_calib" }],
        [intentOut, { action: "abstain", reason: "intent_not_in_region" }],
        [remainingBudget < B_FLOOR, { action: "abstain", reason: "budget_exhausted" }],
        [large && clockOpen, { action: "defer", reason: "set_too_large" }],
        [large, { action: "abstain", reason: "clock_expired" }],
      ]);
      const region = buildSetRegion(large ? ["up", "down"] : ["up"]);
      const d = gate(
        mkInput(region, verdictUnderCalib, {
          intent: intentOut ? "sideways" : "up",
          evaluable: !notEvaluable,
          timedOut,
          nCalib: lowCount ? 10 : 50,
          clockOpen,
          remainingBudget,
        }),
      );
      const where = `mask=${mask}, budget=${remainingBudget}`;
      assert.equal(d.action, expected.action, `${where}: action`);
      assert.equal(d.reason, expected.reason, `${where}: reason`);
      assert.equal(d.allow, expected.action === "commit", `${where}: allow`);
      seen.add(d.reason);
    }
  }
  assert.equal(seen.size, 8, "every declared reason of the set path is reached");
});

// [D5, interval sub-path of the same header] common guards (non_evaluable, upstream_timeout, under_calib),
// then lo >= hi gives region_degenerate (NDG-1, B-16, before budget), then budget_exhausted, then width > tauInterval
// (clock open: defer interval_too_wide, else abstain clock_expired), then intent outside [lo, hi], else
// commit covered. All 2^8 flag combinations times 3 budgets (768 cases), including B_t = B_floor.
// killer: packages/hikae/src/l3-gate.ts:130 ROR "<" -> "<="
test("oracle_l3_interval_path_reason_order_exhaustive", () => {
  const seen = new Set<string>();
  for (let mask = 0; mask < 256; mask++) {
    const notEvaluable = bit(mask, 0);
    const timedOut = bit(mask, 1);
    const lowCount = bit(mask, 2);
    const verdictUnderCalib = bit(mask, 3);
    const degenerate = bit(mask, 4);
    const wide = bit(mask, 5);
    const clockOpen = bit(mask, 6);
    const intentOut = bit(mask, 7);
    for (const remainingBudget of BUDGETS) {
      const expected = firstHit([
        [notEvaluable, { action: "abstain", reason: "non_evaluable" }],
        [timedOut, { action: "abstain", reason: "upstream_timeout" }],
        [lowCount || verdictUnderCalib, { action: "abstain", reason: "under_calib" }],
        [degenerate, { action: "abstain", reason: "region_degenerate" }],
        [remainingBudget < B_FLOOR, { action: "abstain", reason: "budget_exhausted" }],
        [wide && clockOpen, { action: "defer", reason: "interval_too_wide" }],
        [wide, { action: "abstain", reason: "clock_expired" }],
        [intentOut, { action: "abstain", reason: "intent_not_in_region" }],
      ]);
      // Hand-built regions (degenerate lo = hi cannot come from buildIntervalRegion); tauInterval = 2.
      const region: PredictionRegion = degenerate
        ? { kind: "interval", lo: 0.5, hi: 0.5 }
        : { kind: "interval", lo: 0, hi: wide ? 3 : 1 };
      const d = gate(
        mkInput(region, verdictUnderCalib, {
          intent: intentOut ? 10 : 0.5,
          evaluable: !notEvaluable,
          timedOut,
          nCalib: lowCount ? 10 : 50,
          clockOpen,
          remainingBudget,
        }),
      );
      const where = `mask=${mask}, budget=${remainingBudget}`;
      assert.equal(d.action, expected.action, `${where}: action`);
      assert.equal(d.reason, expected.reason, `${where}: reason`);
      assert.equal(d.allow, expected.action === "commit", `${where}: allow`);
      seen.add(d.reason);
    }
  }
  assert.equal(seen.size, 9, "every declared reason of the interval path is reached (region_degenerate apart since B-16)");
});

const COMMON = {
  nMin: 1,
  taskClass: "oracle-interval",
  residual: [],
  producedAt: "2026-09-04T00:00:00Z",
  schemaVersion: "1.0.0",
  cell: { qhatUnit: "label", scale: null, cellKey: null, policyRowSha256: null, policyTableSha256: null },
} as const;

// [SOA 2.2; Papadopoulos et al. 2002; LEI] the split interval has constant width 2 qhat, independent of the
// test point: residuals 1..19, alpha = 0.1, p = ceil(20 * 0.9) = 18, qhat = 18.
// killer: packages/hikae/src/interval-conformer.ts:87 CONST "scoreTestBand(params.yhat, qhat)" -> "scoreTestBand(params.yhat, 2 * qhat)"
test("oracle_interval_width_is_two_qhat_for_every_yhat", () => {
  const calib: CalibPair[] = Array.from({ length: 19 }, (_, i) => ({ yhat: 0, y: i + 1 }));
  for (const yhat of [-1e3, 0, 0.5, 1234.5]) {
    const r = conformInterval({ ...COMMON, calib, yhat, alpha: 0.1 });
    assert.equal(r.qhat, 18, `yhat=${yhat}: qhat = 18th smallest residual`);
    assert.deepEqual(r.region, { lo: yhat - 18, hi: yhat + 18 }, `yhat=${yhat}: region [yhat - 18, yhat + 18]`);
    assert.equal(r.verdict.reason, "covered");
    assert.ok(r.region !== null && r.region.hi - r.region.lo === 36, `yhat=${yhat}: width 2 qhat = 36`);
  }
});

/** Local seeded PRNG (mulberry32 copy, kept apart from the S2 instrument; first draw pinned below). */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// [LEI Thm 2.2; TB Thm 3.2] same oracle as the L1 coverage test, through conformInterval (absolute residual
// score): pairs yhat = 0, y = u - 0.5 with u uniform, seed 20260931, n = 19, alpha = 0.1, R = 20000:
// abs(K/R - 18/20) <= t = sqrt(ln(2e6)/(2R)) (Hoeffding, delta = 1e-6). A signed residual gives about 0.80.
// killer: packages/hikae/src/interval-conformer.ts:57 CONST "Math.abs(c.y - c.yhat)" -> "(c.y - c.yhat)"
test("oracle_interval_marginal_coverage_seeded_exchangeable", () => {
  assert.equal(prng(20260931)(), 0.5109332276042551, "first draw of seed 20260931 pinned");
  const R = 20000;
  const t = Math.sqrt(Math.log(2e6) / (2 * R));
  const draw = prng(20260931);
  let covered = 0;
  for (let rep = 0; rep < R; rep++) {
    const calib: CalibPair[] = Array.from({ length: 19 }, () => ({ yhat: 0, y: draw() - 0.5 }));
    const y = draw() - 0.5;
    const r = conformInterval({ ...COMMON, calib, yhat: 0, alpha: 0.1 });
    assert.ok(r.region !== null, `rep ${rep}: a region is produced`);
    if (r.region.lo <= y && y <= r.region.hi) covered++;
  }
  const rate = covered / R;
  assert.ok(Math.abs(rate - 0.9) <= t, `coverage ${rate} vs 0.9, radius ${t}`);
});
