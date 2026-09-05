import { test } from "node:test";
import assert from "node:assert/strict";
import { emitPrediction, serialize, UKEMI_PREDICTOR_ID, liquidableAmount } from "../src/index.ts";
import type { Prediction } from "@monark/contracts";
import { loadPositions } from "./fixtures.ts";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

// Schéma gelé `prediction.schema.json` compilé par ajv (D11 test 23 : « serializePrediction + schéma ajv »).
const require = createRequire(import.meta.url);
const ajvMod = require("ajv/dist/2020");
const Ajv2020 = ajvMod.default ?? ajvMod;
const addFormatsMod = require("ajv-formats");
const addFormats = addFormatsMod.default ?? addFormatsMod;
const ROOT = join(import.meta.dirname, "..", "..", "..");
const ajv = new Ajv2020({ strict: true, allowUnionTypes: true, allErrors: true });
addFormats(ajv);
const validatePrediction = ajv.compile(JSON.parse(readFileSync(join(ROOT, "schemas", "prediction.schema.json"), "utf8")));

// Test 23 (ADR-M002 D11) — UKEMI émet une `Prediction` NUMÉRIQUE via le contrat gelé,
// sans région, sans garantie ; sérialisation canonique ; clé interdite refusée.
test("prediction_numeric_emitted", () => {
  const yhat = liquidableAmount(loadPositions("knife-edge-positions.json"), 0.2).liquidableDebt; // 160
  const p = emitPrediction(yhat, "2026-09-04T00:00:00Z");

  assert.equal(typeof p.yhat, "number", "yhat est un NOMBRE (cible ponctuelle, D1)");
  assert.equal(p.yhat, 160);
  assert.equal(p.predictor_id, UKEMI_PREDICTOR_ID);
  assert.equal(p.produced_at, "2026-09-04T00:00:00Z", "horodatage INJECTÉ, jamais lu (D7)");
  assert.ok(!("region" in p), "AUCUNE région : la région est un travail de conformeur (Lot H, Phase 2)");
  assert.ok(!("p_correct" in p), "AUCUN p_correct");

  // Schéma ajv gelé : l'instance émise est VALIDE ; une clé étrangère la rend INVALIDE (additionalProperties:false).
  assert.equal(validatePrediction(p), true, `ajv : ${JSON.stringify(validatePrediction.errors)}`);
  assert.equal(validatePrediction({ ...p, p_correct: 0.99 }), false, "ajv refuse p_correct (schéma fermé)");

  // Sérialisation canonique par le contrat gelé — déterministe.
  const s1 = serialize(p);
  const s2 = serialize(emitPrediction(yhat, "2026-09-04T00:00:00Z"));
  assert.equal(s1, s2, "sérialisation stable pour des entrées identiques");
  assert.ok(s1.includes(UKEMI_PREDICTOR_ID));

  // Clé étrangère/interdite ⇒ le contrat gelé lève (closed-check + garde récursif).
  const poisoned = { ...p, p_correct: 0.99 } as unknown as Prediction;
  assert.throws(() => serialize(poisoned), "une clé interdite (p_correct) est refusée par le contrat");
});
