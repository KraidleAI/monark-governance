/**
 * Harness — schema PROJECTION drift test (ADR-M005 D8).
 * The tool input/output schemas MUST be the frozen `schemas/*.json`, read here INDEPENDENTLY and
 * compared to what `schema-projection.ts` publishes. Mutant: drop a `required` field in the
 * projection (e.g. make `stripMeta` also skip `required`) ⇒ red. No `any` (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { TOOL_INPUT_SCHEMA, TOOL_OUTPUT_SCHEMA, stripMeta, type Json } from "../src/schema-projection.ts";

const SCHEMAS = fileURLToPath(new URL("../../../schemas/", import.meta.url));

function loadJson(file: string): Json {
  return JSON.parse(readFileSync(SCHEMAS + file, "utf8")) as Json;
}

function asObj(node: Json | undefined, where: string): { [k: string]: Json } {
  if (node === null || node === undefined || typeof node !== "object" || Array.isArray(node)) {
    throw new Error(`expected object at ${where}`);
  }
  return node;
}

const SUBSCHEMA_MAP_KEYWORDS = new Set(["properties", "patternProperties", "$defs", "definitions", "dependentSchemas"]);

/**
 * C-1 (H1 review) — assert NO `description`/`title` annotation survived onto a frozen-derived
 * schema subtree, at any depth. Position-aware to match `stripMeta`: keys inside a subschema map are
 * property names, not annotations. Mutant: disable the annotation strip in `stripMeta` ⇒ the frozen
 * French / RR-1-inverted descriptions reappear here ⇒ red.
 */
function assertNoAnnotations(node: Json, path: string, insideMap: boolean): void {
  if (Array.isArray(node)) {
    node.forEach((n, i) => assertNoAnnotations(n, `${path}[${String(i)}]`, false));
    return;
  }
  if (node === null || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    if (!insideMap) {
      assert.ok(k !== "description" && k !== "title", `annotation '${k}' leaked onto the wire at ${path}`);
    }
    assertNoAnnotations(v, `${path}.${k}`, SUBSCHEMA_MAP_KEYWORDS.has(k));
  }
}

test("tool_schema_equals_frozen_schema", () => {
  const frozenPrediction = asObj(loadJson("prediction.schema.json"), "prediction");
  const frozenGateDecision = asObj(loadJson("gate-decision.schema.json"), "gate-decision");
  const frozenCoverageVerdict = asObj(loadJson("coverage-verdict.schema.json"), "coverage-verdict");

  // INPUT: envelope.properties.prediction == frozen Prediction (modulo the documented $schema/$id strip).
  const inputProps = asObj(TOOL_INPUT_SCHEMA["properties"], "input.properties");
  const predProj = asObj(inputProps["prediction"], "input.properties.prediction");
  assert.deepEqual(predProj["required"], frozenPrediction["required"], "prediction.required must match the frozen file");
  assert.deepEqual(
    Object.keys(asObj(predProj["properties"], "predProj.properties")),
    Object.keys(asObj(frozenPrediction["properties"], "frozenPrediction.properties")),
    "prediction property set must match the frozen file",
  );
  assert.equal(predProj["additionalProperties"], false, "prediction stays a closed contract");
  // O1 hardening — full VALUE parity (not just keys): every projected field definition (types,
  // patterns, nested shape) must equal the frozen file. stripMeta drops $schema/$id/description/title
  // at every depth (C-1), but the frozen `properties` subschemas carry NO such annotations, so the
  // projected `properties` stay byte-for-byte the frozen ones. A drift in any field pattern reddens.
  assert.deepEqual(
    asObj(predProj["properties"], "predProj.properties"),
    asObj(frozenPrediction["properties"], "frozenPrediction.properties"),
    "prediction property definitions must match the frozen file in full",
  );

  // OUTPUT: frozen GateDecision with the verdict $ref dereferenced to the frozen CoverageVerdict.
  assert.deepEqual(TOOL_OUTPUT_SCHEMA["required"], frozenGateDecision["required"], "GateDecision.required must match");
  assert.equal(TOOL_OUTPUT_SCHEMA["additionalProperties"], false, "GateDecision stays a closed contract");
  const outProps = asObj(TOOL_OUTPUT_SCHEMA["properties"], "output.properties");
  const verdictProj = asObj(outProps["verdict"], "output.properties.verdict");
  assert.deepEqual(
    verdictProj["required"],
    frozenCoverageVerdict["required"],
    "the dereferenced verdict.required must match the frozen CoverageVerdict",
  );
  assert.equal(verdictProj["additionalProperties"], false, "the inlined verdict stays a closed contract");

  // O1 hardening — full VALUE parity on the output. The dereferenced verdict must equal the frozen
  // CoverageVerdict field-for-field; the GateDecision's OWN (non-verdict) fields must equal the frozen
  // file (verdict excluded: it is a $ref in the frozen file, an inlined object in the projection).
  assert.deepEqual(
    asObj(verdictProj["properties"], "verdictProj.properties"),
    asObj(frozenCoverageVerdict["properties"], "frozenCoverageVerdict.properties"),
    "the dereferenced verdict property definitions must match the frozen CoverageVerdict in full",
  );
  const projOtherProps: { [k: string]: Json } = { ...outProps };
  const frozenOtherProps: { [k: string]: Json } = { ...asObj(frozenGateDecision["properties"], "frozenGateDecision.properties") };
  delete projOtherProps["verdict"];
  delete frozenOtherProps["verdict"];
  assert.deepEqual(projOtherProps, frozenOtherProps, "GateDecision non-verdict property definitions must match the frozen file in full");

  // C-1 (H1 review) — the FROZEN schemas carry French, RR-1-inverted prose (coverage-verdict:
  // "alpha = couverture VISEE"); the projection MUST strip it before the wire. Assert none survives on
  // the frozen-derived subtrees (the output in full; the prediction input). `params` is NOT checked —
  // it is the non-frozen, English, honest gate-parameter schema and keeps its descriptions.
  assertNoAnnotations(TOOL_OUTPUT_SCHEMA, "TOOL_OUTPUT_SCHEMA", false);
  assertNoAnnotations(predProj, "TOOL_INPUT_SCHEMA.properties.prediction", false);
});

// Test (ADR-M017 D4(1)) — the gate INPUT envelope carries `attested` as the frozen AttestedPrice, PROJECTED
// (stripMeta) byte-for-byte the frozen file, kept OPTIONAL (required stays {prediction,params}); the envelope
// property set is exactly {prediction, params, attested}. Mutants: `required` gains `attested`, or the
// projection is left un-stripped (annotations survive) ⇒ red here (ADR-M017 D5).
test("gate_attested_is_frozen_attested_price", () => {
  const inputProps = asObj(TOOL_INPUT_SCHEMA["properties"], "input.properties");

  // (a) envelope property set == {prediction, params, attested}, in insertion order (ADR-M017 D1).
  assert.deepEqual(Object.keys(inputProps), ["prediction", "params", "attested"], "envelope keys == {prediction, params, attested}");

  // (b) `attested` stays OPTIONAL — `required` is the frozen 2-tuple, unchanged.
  assert.deepEqual(TOOL_INPUT_SCHEMA["required"], ["prediction", "params"], "required stays [prediction, params] (attested is OPTIONAL)");

  // (c) the projected `attested` == the frozen attested-price schema, STRIPPED, byte-for-byte (the SAME
  // mechanism as `prediction`): deepEqual for structure + JSON.stringify for byte/key-order parity.
  const strippedFrozen = stripMeta(loadJson("attested-price.schema.json"));
  const attestedProj = asObj(inputProps["attested"], "input.properties.attested");
  assert.deepEqual(attestedProj, strippedFrozen, "attested projection == frozen AttestedPrice (stripped)");
  assert.equal(JSON.stringify(attestedProj), JSON.stringify(strippedFrozen), "attested projection == frozen (stripped) byte-for-byte");

  // (d) the closed contract + no leaked annotation survive the projection (C-1).
  assert.equal(attestedProj["additionalProperties"], false, "projected attested stays a closed contract");
  assertNoAnnotations(attestedProj, "TOOL_INPUT_SCHEMA.properties.attested", false);
});
