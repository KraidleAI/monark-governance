/**
 * Harness - served replay of lot CM-3a (chantier moteur, audit P3 E-8, E-4, E-5, E-6, E-9, E-12; ADR-CM section 3: CM-3
 * changes no served verdict). A fixed set of runGate calls (USDe committed key and another key, liq strata s0 to s3, BYO
 * interval and set including negative and infinite scores, cascade; budgets, tau, tauInterval and the clock varied) is
 * projected (action, reason, allow, region or null, qhat, n_calib, alpha; a refusal by its code) and hashed: the
 * projection is version-independent (contract 1.1.0, block C), measured equal at the base 418a421f and at 3c-3b2. The same test proves the E-8 guard sits in the gate that runGate calls: a NaN field never
 * COMMITs there (it did at the base). Pure: no clock (produced_at in the past, nowMs pinned), no network, no file.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { Prediction } from "@monark/contracts";
import { gate } from "@monark/hikae";
import { runGate, SCHEMA_VERSION, type HarnessParams } from "../src/tools/gate.ts";
import { USDE_STABLE_RUN_PREDICTOR_ID } from "../src/calibration.ts";

const AT = "2026-09-04T00:00:00Z";
const NOW = Date.parse("2026-10-03T00:00:00Z");
const BASE: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0, tool: "perps_order_preview", clockOpen: true };
const USDE = "stable-run-velocity-24h";
const LIQ = "liquidation-eligible-coverage";
const CASCADE = "cascade-liquidable-24h";
const BYO_SCORES = [0.5, 0.1, 0.9, 0.3, 1.0, 0.7, 0.2, 0.8, 0.4, 0.6];

const pred = (taskClass: string, yhat: string | number, predictorId: string): Prediction => ({ schema_version: SCHEMA_VERSION, task_class: taskClass, yhat, predictor_id: predictorId, produced_at: AT });

/** The fixed replay set: [prediction, params] pairs, in a stable order. */
function replaySet(): [Prediction, HarnessParams][] {
  const out: [Prediction, HarnessParams][] = [];
  const knobs: Partial<HarnessParams>[] = [{}, { tauInterval: 1e-5 }, { tauInterval: 1e-5, clockOpen: false }, { remainingBudget: 0, bFloor: 0.5 }];
  for (const yhat of [0, 1e-4, 5e-4, 0.01, -1e-4]) {
    for (const intent of [0, 1e-4, 1]) {
      for (const k of knobs) out.push([pred(USDE, yhat, USDE_STABLE_RUN_PREDICTOR_ID), { ...BASE, intent, ...k }]);
    }
  }
  out.push([pred(USDE, 1e-4, "narabi:other@eip155:1/erc20:0x0"), BASE]);
  out.push([pred(USDE, 1e-4, USDE_STABLE_RUN_PREDICTOR_ID), { ...BASE, alpha: 0.5 }]);
  for (const yhat of [0, 5000, 2e5, 1e6, 5e7, 1e9]) {
    for (const intent of [0, 5000, 2e6]) {
      for (const tauInterval of [1e12, 1]) out.push([pred(LIQ, yhat, "x"), { ...BASE, alpha: 0.01, nMin: 100, intent, tauInterval }]);
    }
  }
  for (const yhat of [0, 1000, 1e6]) out.push([pred(CASCADE, yhat, "internal:ukemi-cascade-v0"), BASE]);
  for (const [scores, intent, tauInterval] of [[BYO_SCORES, 1, 2], [BYO_SCORES, 3, 2], [BYO_SCORES, 1, 0.5], [[-1, ...BYO_SCORES], 1, 2], [[Infinity, ...BYO_SCORES], 1, 2]] as const) {
    out.push([pred("acme-model-x", 1, "acme:key"), { ...BASE, nMin: 5, intent, tauInterval, calibration: { scores, mode: "interval" } }]);
  }
  const candidates = [{ label: "A", score: 0.05 }, { label: "B", score: 0.95 }, { label: "C", score: 1.5 }];
  for (const [scores, tau, intent] of [[BYO_SCORES, 1, "A"], [BYO_SCORES, 2, "B"], [BYO_SCORES, 0, "A"], [[-2, -1, ...BYO_SCORES], 1, "A"], [[Infinity, ...BYO_SCORES], 3, "C"]] as const) {
    out.push([pred("acme-model-x", "A", "acme:key"), { ...BASE, nMin: 5, tau, intent, calibration: { scores, mode: "set", candidates } }]);
  }
  return out;
}

function replayLine([p, params]: [Prediction, HarnessParams]): string {
  try {
    const d = runGate(p, params, undefined, { nowMs: NOW });
    const v = d.verdict;
    return JSON.stringify([d.action, d.reason, d.allow, v.qhat === null ? null : v.region, v.qhat, v.n_calib, v.alpha]);
  } catch (e) {
    return JSON.stringify({ error: (e as { code?: unknown }).code ?? null });
  }
}

// killer: packages/hikae/src/l3-gate.ts:90 SDL "if (!finiteFields(input)) return { action: \"abstain\", allow: false, reason: \"non_evaluable\" };" -> ""
test("served_replay_identical_and_nan_never_commits_in_the_served_gate", () => {
  const set = replaySet();
  assert.equal(set.length, 111);
  const lines = set.map(replayLine);
  const digest = createHash("sha256").update(lines.join("\n")).digest("hex");
  assert.equal(digest, "efdde3e6331a784c15a3e64f3528d44e61dc69e7d595ca0d7478f65226eacd56", "projection: only the B-13 edges of 39 calls move in CM-3c-4b (was c9db863c..., base 418a421f)");
  // The replay reaches every served outcome kind (commit, defer, abstain, 400), so the digest is not vacuous.
  for (const kind of ['["commit"', '["defer"', '["abstain"', '"error":"']) assert.ok(lines.some((l) => l.includes(kind)), kind);
  // E-8 in the served gate: the committed USDe decision, re-run with one numeric field set to NaN, never commits.
  const first = set[0];
  assert.ok(first !== undefined);
  const committed = runGate(first[0], { ...first[1], intent: 1e-4 }, undefined, { nowMs: NOW });
  assert.equal(committed.action, "commit");
  const base = { intent: committed.intent, verdict: committed.verdict, remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, nCalib: 613, nMin: 50, clockOpen: true, timedOut: false, evaluable: true, tool: "t", schemaVersion: SCHEMA_VERSION, requestSha256: "0".repeat(64) };
  assert.equal(gate(base).action, "commit", "the finite input commits");
  for (const field of ["remainingBudget", "bFloor", "tau", "tauInterval", "nCalib", "nMin"] as const) {
    const d = gate({ ...base, [field]: Number.NaN });
    assert.deepEqual([d.action, d.reason], ["abstain", "non_evaluable"], `${field} NaN`);
  }
});

// G2 B-1 of 3c-3b2: next to the version-independent projection, the full 1.1.0 served bytes of the same 111 calls are
// pinned (whole GateDecision; a refusal by its code and message), so a served field the projection ignores (method,
// residual, schema_version, cell fields...) cannot move unseen. Any lot that changes served bytes updates this pin in a
// declared line (G7). Second mutant fired by hand: gate.ts:619 "residual: []," -> "residual: [\"x\"],".
// killer: apps/harness/src/tools/gate.ts:654 CONST "method: \"split\"" -> "method: \"hac-cp\""
test("served_replay_full_bytes_are_pinned_at_1_1_0", () => {
  const lines = replaySet().map(([p, params]) => {
    try {
      return JSON.stringify(runGate(p, params, undefined, { nowMs: NOW }));
    } catch (e) {
      return JSON.stringify({ error: (e as { code?: unknown }).code ?? null, message: (e as Error).message });
    }
  });
  assert.equal(lines.length, 111);
  assert.equal(createHash("sha256").update(lines.join("\n")).digest("hex"), "1aab90a8c81af1cbc7a97681c4032402d4dc51cdedbfc09ad1dba0538965682d", "served bytes of the replay (1.1.0; CM-3c-4b, was cb6a4e4f...)");
});

// G2 m-6 of 3c-3a (spec r3 section 5, constraints the closed check does not hold): on every served verdict of the replay,
// (c) n_calib is the length of scores when scores is carried; (d) scores is carried on a caller-supplied calibration only
// (cell_key null); (e) a caller-supplied calibration (cell_key null) never has qhat_unit "scale", and scale is null.
// killer: apps/harness/src/tools/gate.ts:656 CONST "schemaVersion: SCHEMA_VERSION, cell," -> "schemaVersion: SCHEMA_VERSION, cell, includeScores: true,"
test("served_replay_verdicts_hold_the_implicit_constraints_c_d_e", () => {
  const seen = { byo: 0, committed: 0 };
  for (const [p, params] of replaySet()) {
    let v;
    try {
      v = runGate(p, params, undefined, { nowMs: NOW }).verdict;
    } catch {
      continue;
    }
    if (v.scores !== undefined) assert.deepEqual([v.n_calib, v.cell_key], [v.scores.length, null], `${p.task_class}: (c) and (d)`);
    if (v.cell_key === null) assert.deepEqual([v.qhat_unit === "scale", v.scale], [false, null], `${p.task_class}: (e)`);
    seen[v.cell_key === null ? "byo" : "committed"]++;
  }
  assert.ok(seen.byo > 0 && seen.committed > 0, JSON.stringify(seen));
});
