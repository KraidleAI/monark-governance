import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { PredictionRegion } from "../src/index.ts";
import {
  ALLOWED_KEYS,
  FORBIDDEN_KEYS,
  intentInRegion,
  serializeAttestedPrice,
  serializeAttestedBook,
  serializePrediction,
  serializeVerdict,
  serializeGateDecision,
} from "../src/index.ts";
import {
  validAttestedPrice,
  validAttestedFlow,
  validAttestedBook,
  validPrediction,
  validVerdictSet,
  validVerdictInterval,
  validGateDecision,
} from "./fixtures.ts";
import { serializeAttestedFlow } from "../src/index.ts";

const schemasDir = new URL("../../../schemas/", import.meta.url);
/** Minimal structural view of a JSON-Schema node — only the shape these drift tests read (plus
 *  `forbidden_keys`, since loadSchema also parses schemas/forbidden-keys.json). Recursive. */
type SchemaNode = {
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
  oneOf?: SchemaNode[];
  forbidden_keys?: readonly string[];
};
function loadSchema(name: string): SchemaNode {
  return JSON.parse(readFileSync(new URL(name, schemasDir), "utf8")) as SchemaNode;
}
function propKeys(node: SchemaNode): string[] {
  return Object.keys(node.properties ?? {});
}

test("schema properties are IN SYNC with the TS allowed-key sets (no drift)", () => {
  const ap = loadSchema("attested-price.schema.json");
  assert.deepEqual(propKeys(ap).sort(), [...ALLOWED_KEYS.attestedPrice].sort());
  assert.deepEqual(propKeys(ap.properties!.attestor!.items!).sort(), [...ALLOWED_KEYS.attestor].sort());
  assert.deepEqual(propKeys(ap.properties!.utterance!).sort(), [...ALLOWED_KEYS.utterance].sort());
  assert.deepEqual(propKeys(ap.properties!.observed_at!).sort(), [...ALLOWED_KEYS.observedAt].sort());

  const af = loadSchema("attested-flow.schema.json");
  assert.deepEqual(propKeys(af).sort(), [...ALLOWED_KEYS.attestedFlow].sort());
  assert.deepEqual(propKeys(af.properties!.attestor!.items!).sort(), [...ALLOWED_KEYS.attestor].sort());
  assert.deepEqual(propKeys(af.properties!.source!).sort(), [...ALLOWED_KEYS.attestedFlowSource].sort());
  assert.deepEqual(propKeys(af.properties!.flow!).sort(), [...ALLOWED_KEYS.attestedFlowFlow].sort());
  assert.deepEqual(propKeys(af.properties!.utterance!).sort(), [...ALLOWED_KEYS.utterance].sort());
  assert.deepEqual(propKeys(af.properties!.observed_at!).sort(), [...ALLOWED_KEYS.observedAt].sort());

  const ab = loadSchema("attested-book.schema.json");
  assert.deepEqual(propKeys(ab).sort(), [...ALLOWED_KEYS.attestedBook].sort());
  assert.deepEqual(propKeys(ab.properties!.block!).sort(), [...ALLOWED_KEYS.attestedBookBlock].sort());
  assert.deepEqual(propKeys(ab.properties!.oracle_sources!.items!).sort(), [...ALLOWED_KEYS.attestedBookOracleSource].sort());
  assert.deepEqual(propKeys(ab.properties!.eligible!).sort(), [...ALLOWED_KEYS.attestedBookEligible].sort());
  assert.deepEqual(propKeys(ab.properties!.providers!.items!).sort(), [...ALLOWED_KEYS.attestedBookProvider].sort());
  assert.deepEqual(propKeys(ab.properties!.quorum!).sort(), [...ALLOWED_KEYS.attestedBookQuorum].sort());
  assert.deepEqual(propKeys(ab.properties!.abstain!).sort(), [...ALLOWED_KEYS.attestedBookAbstain].sort());
  assert.deepEqual(propKeys(ab.properties!.attestor!).sort(), [...ALLOWED_KEYS.attestedBookAttestor].sort());
  assert.deepEqual(propKeys(ab.properties!.observed_at!).sort(), [...ALLOWED_KEYS.observedAt].sort());

  assert.deepEqual(propKeys(loadSchema("prediction.schema.json")).sort(), [...ALLOWED_KEYS.prediction].sort());

  const cv = loadSchema("coverage-verdict.schema.json");
  assert.deepEqual(propKeys(cv).sort(), [...ALLOWED_KEYS.coverageVerdict].sort());
  const [setV, intV] = cv.properties!.region!.oneOf!;
  assert.deepEqual(propKeys(setV!).sort(), [...ALLOWED_KEYS.regionSet].sort());
  assert.deepEqual(propKeys(intV!).sort(), [...ALLOWED_KEYS.regionInterval].sort());

  assert.deepEqual(propKeys(loadSchema("gate-decision.schema.json")).sort(), [...ALLOWED_KEYS.gateDecision].sort());
});

test("every contract schema declares additionalProperties:false at each object node (closed)", () => {
  // deno-lint-ignore no-explicit-any
  function assertClosedNode(node: any, where: string): void {
    if (node && typeof node === "object") {
      if (node.type === "object") {
        assert.equal(node.additionalProperties, false, `${where} must be closed`);
      }
      for (const k of Object.keys(node.properties ?? {})) assertClosedNode(node.properties[k], `${where}.${k}`);
      for (const variant of node.oneOf ?? []) assertClosedNode(variant, `${where}|`);
      if (node.items) assertClosedNode(node.items, `${where}[]`);
    }
  }
  for (const name of ["attested-price", "attested-flow", "attested-book", "prediction", "coverage-verdict", "gate-decision"]) {
    assertClosedNode(loadSchema(`${name}.schema.json`), name);
  }
});

test("forbidden-keys.json matches the TS FORBIDDEN_KEYS", () => {
  const fk = loadSchema("forbidden-keys.json");
  assert.deepEqual([...fk.forbidden_keys!].sort(), [...FORBIDDEN_KEYS].sort());
});

test("intentInRegion — set variant", () => {
  const region: PredictionRegion = { kind: "set", labels: ["up", "down"], label_schema: "up|down" };
  assert.equal(intentInRegion("up", region), true);
  assert.equal(intentInRegion("sideways", region), false);
  assert.equal(intentInRegion(0.5, region), false); // a number is never in a set region
  assert.equal(intentInRegion(null, region), false);
});

test("intentInRegion — interval variant", () => {
  const region: PredictionRegion = { kind: "interval", lo: -1, hi: 1 };
  assert.equal(intentInRegion(0, region), true);
  assert.equal(intentInRegion(-1, region), true);
  assert.equal(intentInRegion(1, region), true);
  assert.equal(intentInRegion(2, region), false);
  assert.equal(intentInRegion("up", region), false); // a string is never in an interval region
});

test("valid contracts serialize without throwing", () => {
  assert.doesNotThrow(() => serializeAttestedPrice(validAttestedPrice()));
  assert.doesNotThrow(() => serializeAttestedFlow(validAttestedFlow()));
  assert.doesNotThrow(() => serializeAttestedBook(validAttestedBook()));
  assert.doesNotThrow(() => serializePrediction(validPrediction()));
  assert.doesNotThrow(() => serializeVerdict(validVerdictSet()));
  assert.doesNotThrow(() => serializeVerdict(validVerdictInterval()));
  assert.doesNotThrow(() => serializeGateDecision(validGateDecision()));
});
