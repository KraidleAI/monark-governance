import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { COVERAGE_REASONS, GATE_ACTIONS, METHODS, ATTESTED_FLOW_RESIDUALS } from "../src/index.ts";

// Closes G2 reserve M3: the enums are single-sourced in enums.ts; the JSON Schema
// copies are asserted identical to it, so no silent drift between the two.
const schemasDir = new URL("../../../schemas/", import.meta.url);
/** Minimal structural view of a JSON-Schema node — only the shape these enum drift tests read. Recursive. */
type SchemaNode = {
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
  enum?: readonly unknown[];
};
function load(name: string): SchemaNode {
  return JSON.parse(readFileSync(new URL(name, schemasDir), "utf8")) as SchemaNode;
}

test("reason enum: both schemas match the TS single source (no drift)", () => {
  const cv = load("coverage-verdict.schema.json");
  const gd = load("gate-decision.schema.json");
  assert.deepEqual(cv.properties!.reason!.enum, [...COVERAGE_REASONS]);
  assert.deepEqual(gd.properties!.reason!.enum, [...COVERAGE_REASONS]);
});

test("method enum: schema matches the TS single source", () => {
  const cv = load("coverage-verdict.schema.json");
  assert.deepEqual(cv.properties!.method!.enum, [...METHODS]);
});

test("action enum: schema matches the TS single source", () => {
  const gd = load("gate-decision.schema.json");
  assert.deepEqual(gd.properties!.action!.enum, [...GATE_ACTIONS]);
});

test("attested-flow residual enum: schema matches the TS single source (ADR-M008 D3)", () => {
  const af = load("attested-flow.schema.json");
  assert.deepEqual(af.properties!.residual!.items!.enum, [...ATTESTED_FLOW_RESIDUALS]);
});
