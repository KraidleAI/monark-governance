import { test } from "node:test";
import assert from "node:assert/strict";
import { emitPrediction, serialize, UKEMI_PREDICTOR_ID, liquidableAmount } from "../src/index.ts";
import type { Prediction } from "@monark/contracts";
import { loadPositions } from "./fixtures.ts";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

// Frozen schema `prediction.schema.json` compiled by ajv (D11 test 23: "serializePrediction + ajv schema").
const require = createRequire(import.meta.url);
const ajvMod = require("ajv/dist/2020");
const Ajv2020 = ajvMod.default ?? ajvMod;
const addFormatsMod = require("ajv-formats");
const addFormats = addFormatsMod.default ?? addFormatsMod;
const ROOT = join(import.meta.dirname, "..", "..", "..");
const ajv = new Ajv2020({ strict: true, allowUnionTypes: true, allErrors: true });
addFormats(ajv);
const validatePrediction = ajv.compile(JSON.parse(readFileSync(join(ROOT, "schemas", "prediction.schema.json"), "utf8")));

// Test 23 (ADR-M002 D11) — UKEMI emits a NUMERIC `Prediction` via the frozen contract,
// no region, no guarantee; canonical serialization; forbidden key refused.
test("prediction_numeric_emitted", () => {
  const yhat = liquidableAmount(loadPositions("knife-edge-positions.json"), 0.2).liquidableDebt; // 160
  const p = emitPrediction(yhat, "2026-09-04T00:00:00Z");

  assert.equal(typeof p.yhat, "number", "yhat is a NUMBER (point target, D1)");
  assert.equal(p.yhat, 160);
  assert.equal(p.predictor_id, UKEMI_PREDICTOR_ID);
  assert.equal(p.produced_at, "2026-09-04T00:00:00Z", "INJECTED timestamp, never read (D7)");
  assert.ok(!("region" in p), "NO region: the region is a conformalizer's job (Phase 2)");
  assert.ok(!("p_correct" in p), "NO p_correct");

  // Frozen ajv schema: the emitted instance is VALID; a foreign key makes it INVALID (additionalProperties:false).
  assert.equal(validatePrediction(p), true, `ajv : ${JSON.stringify(validatePrediction.errors)}`);
  assert.equal(validatePrediction({ ...p, p_correct: 0.99 }), false, "ajv refuses p_correct (closed schema)");

  // Canonical serialization by the frozen contract — deterministic.
  const s1 = serialize(p);
  const s2 = serialize(emitPrediction(yhat, "2026-09-04T00:00:00Z"));
  assert.equal(s1, s2, "serialization stable for identical inputs");
  assert.ok(s1.includes(UKEMI_PREDICTOR_ID));

  // Foreign/forbidden key ⇒ the frozen contract throws (closed-check + recursive guard).
  const poisoned = { ...p, p_correct: 0.99 } as unknown as Prediction;
  assert.throws(() => serialize(poisoned), "a forbidden key (p_correct) is refused by the contract");
});
