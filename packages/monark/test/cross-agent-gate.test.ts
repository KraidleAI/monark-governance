// packages/monark/test/cross-agent-gate.test.ts — test 30 `cross_agent_gate_end_to_end` (ADR-M003 D4).
//
// The end-to-end "three agents work together" proof: the REAL Shogen AttestedPrice (from fromShogen on
// the committed s3-binance fixtures) + a UKEMI numeric Prediction + a seeded GateContext -> HIKAE
// conforms an `interval` region -> the frozen L3 gate() -> a `GateDecision` that validates the frozen
// gate-decision schema (ajv). The intent axis is exercised (commit / defer / abstain) so the gate is
// NOT vacuous, and the AttestedPrice.residual is asserted to flow into the verdict (the integration seam).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { crossAgentGate } from "../src/index.ts";
import type { GateContext } from "../src/index.ts";
import { fromShogen, isAdapterError } from "../src/adapter-shogen.ts";
import { emitPrediction } from "@monark/ukemi";
import {
  generateLiquidable24hPairs,
  LIQUIDABLE_24H_ALPHA,
  LIQUIDABLE_24H_N,
  LIQUIDABLE_24H_NMIN,
} from "@monark/hikae";
import type { AttestedPrice, GateDecision, Prediction } from "@monark/contracts";
import type { Ajv2020 as Ajv2020Instance, Options, SchemaObject, ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";

// ajv / ajv-formats are CommonJS; load via `require` and narrow to the exact types used here (no `any`,
// no eslint-disable). Same typed pattern as packages/hikae/test/interval-conformer.test.ts.
type Ajv2020Ctor = new (opts?: Options) => Ajv2020Instance;

const FIX = fileURLToPath(new URL("../../../fixtures", import.meta.url));
const SCHEMAS = fileURLToPath(new URL("../../../schemas", import.meta.url));
const require = createRequire(import.meta.url);
const ajvExport = require("ajv/dist/2020") as { default?: Ajv2020Ctor };
const Ajv2020: Ajv2020Ctor = ajvExport.default ?? (ajvExport as unknown as Ajv2020Ctor);
const addFormatsExport = require("ajv-formats") as { default?: FormatsPlugin };
const addFormats: FormatsPlugin = addFormatsExport.default ?? (addFormatsExport as unknown as FormatsPlugin);

function loadSchema(name: string): SchemaObject {
  return JSON.parse(readFileSync(join(SCHEMAS, name), "utf8")) as SchemaObject;
}
const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);
ajv.addSchema(loadSchema("coverage-verdict.schema.json"), "coverage-verdict.schema.json");
const validateGateDecision: ValidateFunction<GateDecision> = ajv.compile<GateDecision>(loadSchema("gate-decision.schema.json"));

// The real AttestedPrice, once.
const LOT = new Uint8Array(readFileSync(join(FIX, "s3-binance.lot.cbor")));
const VERDICT = readFileSync(join(FIX, "s3-binance.verdict.txt"), "utf8");
const CONSTAT = JSON.parse(readFileSync(join(FIX, "s3-binance.constat.json"), "utf8")) as Record<string, unknown>;

function realPrice(): AttestedPrice {
  const out = fromShogen(LOT, VERDICT, CONSTAT);
  assert.ok(!isAdapterError(out), "fromShogen must produce the demonstrative AttestedPrice");
  return out.price;
}

const NOW = "2026-09-10T00:00:00Z";
const YHAT = 1000; // a liquidable amount (UKEMI cascade point); center of the conformed interval.
const CALIB = generateLiquidable24hPairs(101, LIQUIDABLE_24H_N); // seeded synthetic pairs (D6.2)

/** Build a context, with overrides for the budget / request axes. */
function ctxWith(over: {
  tau?: number;
  remaining?: number;
  floor?: number;
  intent?: string | number | null;
  open?: boolean;
}): GateContext {
  return {
    calib: { pairs: CALIB, alpha: LIQUIDABLE_24H_ALPHA, nMin: LIQUIDABLE_24H_NMIN },
    budget: { remaining: over.remaining ?? 1, floor: over.floor ?? 0, tau: over.tau ?? 1000 },
    clock: { now: NOW, open: over.open ?? true },
    request: { tool: "perps_order_preview", intent: over.intent ?? YHAT },
  };
}

function run(prediction: Prediction, ctx: GateContext): GateDecision {
  const decision = crossAgentGate(realPrice(), prediction, ctx);
  assert.ok(validateGateDecision(decision), `GateDecision must satisfy the frozen schema: ${JSON.stringify(validateGateDecision.errors)}`);
  return decision;
}

test("cross_agent_gate_end_to_end — real price + UKEMI prediction -> a COMMIT GateDecision (schema-closed)", () => {
  const prediction = emitPrediction(YHAT, NOW); // task_class cascade-liquidable-24h, numeric yhat
  const decision = run(prediction, ctxWith({ tau: 1000, intent: YHAT }));

  assert.equal(decision.action, "commit");
  assert.equal(decision.allow, true);
  assert.equal(decision.reason, "covered");
  assert.equal(decision.tool, "perps_order_preview"); // NAMED, echoed — never invoked
  assert.equal(decision.intent, YHAT);
  assert.equal(decision.remaining_budget, 1);
  assert.equal(decision.schema_version, "1.0.0");

  // HIKAE produced an `interval` region centered on the prediction; the width fits under tau.
  assert.equal(decision.verdict.region.kind, "interval");
  if (decision.verdict.region.kind === "interval") {
    assert.ok(decision.verdict.region.lo < YHAT && YHAT < decision.verdict.region.hi, "yhat inside the interval");
  }
  assert.equal(decision.verdict.task_class, "cascade-liquidable-24h"); // the prediction's class flows through
  assert.equal(decision.verdict.n_calib, LIQUIDABLE_24H_N);
  assert.equal(decision.verdict.qhat !== null, true);

  // The integration SEAM: AttestedPrice.residual flows into the verdict (traceability, C2).
  assert.deepEqual(decision.verdict.residual, realPrice().residual);
  assert.deepEqual(decision.verdict.residual, [
    "A(notary-neutrality)",
    "A(self-attestation)",
    "A(transport-check-delegated)",
  ]);
});

test("cross_agent_gate_end_to_end — the intent axis is live (defer on width, abstain off-region)", () => {
  const prediction = emitPrediction(YHAT, NOW);

  // tau below the interval width, clock open -> DEFER (interval_too_wide), still a closed decision.
  const deferred = run(prediction, ctxWith({ tau: 1, intent: YHAT }));
  assert.equal(deferred.action, "defer");
  assert.equal(deferred.reason, "interval_too_wide");
  assert.equal(deferred.allow, false);

  // intent far outside the region -> ABSTAIN (intent_not_in_region): a mutant ignoring intent would COMMIT.
  const abstained = run(prediction, ctxWith({ tau: 1000, intent: 10_000_000 }));
  assert.equal(abstained.action, "abstain");
  assert.equal(abstained.reason, "intent_not_in_region");
  assert.equal(abstained.allow, false);

  // budget below the floor -> ABSTAIN (budget_exhausted): the B_t axis is live too.
  const broke = run(prediction, ctxWith({ tau: 1000, intent: YHAT, remaining: 0, floor: 1 }));
  assert.equal(broke.action, "abstain");
  assert.equal(broke.reason, "budget_exhausted");
});

test("cross_agent_gate_end_to_end — a non-finite prediction is a fail-closed non_evaluable decision", () => {
  // A right-shaped but non-numeric yhat (never from UKEMI) is a DECISION, never silence.
  const stringPrediction: Prediction = {
    schema_version: "1.0.0",
    task_class: "cascade-liquidable-24h",
    yhat: "not-a-number",
    predictor_id: "internal:test-nonfinite",
    produced_at: NOW,
  };
  const decision = run(stringPrediction, ctxWith({ tau: 1000, intent: "not-a-number" }));
  assert.equal(decision.action, "abstain");
  assert.equal(decision.reason, "non_evaluable");
  assert.equal(decision.allow, false);
});
