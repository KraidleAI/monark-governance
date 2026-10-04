/**
 * Harness - served replay of lot CM-3a (chantier moteur, audit P3 E-8, E-4, E-5, E-6, E-9, E-12; ADR-CM section 3: CM-3
 * changes no served verdict). A fixed set of runGate calls (USDe committed key and another key, liq strata s0 to s3, BYO
 * interval and set including negative and infinite scores, cascade; budgets, tau, tauInterval and the clock varied) is
 * serialized and hashed; the digest was measured at the base 2abe801 and must not move. Refusals are recorded with
 * their code and message. The same test proves the E-8 guard sits in the gate that runGate calls: a NaN field never
 * COMMITs there (it did at the base). Pure: no clock (produced_at in the past, nowMs pinned), no network, no file.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { Prediction } from "@monark/contracts";
import { gate } from "@monark/hikae";
import { runGate, type HarnessParams } from "../src/tools/gate.ts";
import { USDE_STABLE_RUN_PREDICTOR_ID } from "../src/calibration.ts";

const AT = "2026-09-04T00:00:00Z";
const NOW = Date.parse("2026-10-03T00:00:00Z");
const BASE: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0, tool: "perps_order_preview", clockOpen: true };
const USDE = "stable-run-velocity-24h";
const LIQ = "liquidation-eligible-coverage";
const CASCADE = "cascade-liquidable-24h";
const BYO_SCORES = [0.5, 0.1, 0.9, 0.3, 1.0, 0.7, 0.2, 0.8, 0.4, 0.6];

const pred = (taskClass: string, yhat: string | number, predictorId: string): Prediction => ({ schema_version: "1.0.0", task_class: taskClass, yhat, predictor_id: predictorId, produced_at: AT });

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
    return JSON.stringify(runGate(p, params, undefined, { nowMs: NOW }));
  } catch (e) {
    return JSON.stringify({ error: (e as { code?: unknown }).code ?? null, message: e instanceof Error ? e.message : String(e) });
  }
}

// killer: packages/hikae/src/l3-gate.ts:88 SDL "if (!finiteFields(input)) return { action: \"abstain\", allow: false, reason: \"non_evaluable\" };" -> ""
test("served_replay_identical_and_nan_never_commits_in_the_served_gate", () => {
  const set = replaySet();
  assert.equal(set.length, 111);
  const lines = set.map(replayLine);
  const digest = createHash("sha256").update(lines.join("\n")).digest("hex");
  assert.equal(digest, "b891dcab1b8cb40ca44c60d7dc16f641987aa43df0fab64be09340152181d238", "served decisions byte-identical to the base 2abe801");
  // The replay reaches every served outcome kind (commit, defer, abstain, 400), so the digest is not vacuous.
  for (const kind of ['"action":"commit"', '"action":"defer"', '"action":"abstain"', '"error":"']) assert.ok(lines.some((l) => l.includes(kind)), kind);
  // E-8 in the served gate: the committed USDe decision, re-run with one numeric field set to NaN, never commits.
  const first = set[0];
  assert.ok(first !== undefined);
  const committed = runGate(first[0], { ...first[1], intent: 1e-4 }, undefined, { nowMs: NOW });
  assert.equal(committed.action, "commit");
  const base = { intent: committed.intent, verdict: committed.verdict, remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, nCalib: 613, nMin: 50, clockOpen: true, timedOut: false, evaluable: true, tool: "t", schemaVersion: "1.0.0" };
  assert.equal(gate(base).action, "commit", "the finite input commits");
  for (const field of ["remainingBudget", "bFloor", "tau", "tauInterval", "nCalib", "nMin"] as const) {
    const d = gate({ ...base, [field]: Number.NaN });
    assert.deepEqual([d.action, d.reason], ["abstain", "non_evaluable"], `${field} NaN`);
  }
});
