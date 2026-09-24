/**
 * Harness — OpenAPI derivation drift test (test 43, ADR-M005 D7/D8).
 * The OpenAPI 3.1 spec MUST be DERIVED from the frozen `schemas/*.json` (via the projection), NEVER
 * hand-written. This test reads the frozen files INDEPENDENTLY and asserts every operation's
 * frozen-derived `required` set (and full property definitions where the projection is byte-faithful)
 * survives into the generated spec. Mutant: remove a required field from the generated OpenAPI (e.g.
 * drop `action` from the gate response schema in openapi.ts) ⇒ red. No `any` (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildOpenApi, OPENAPI_VERSION } from "../src/openapi.ts";
import type { Json } from "../src/schema-projection.ts";

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

/** The projected input schema for `POST /{op}` (requestBody.content['application/json'].schema). */
function requestSchema(spec: { [k: string]: Json }, op: string): { [k: string]: Json } {
  const post = asObj(asObj(asObj(spec["paths"], "paths")["/" + op], op)["post"], `${op}.post`);
  const content = asObj(asObj(post["requestBody"], `${op}.requestBody`)["content"], `${op}.content`);
  return asObj(asObj(content["application/json"], `${op}.json`)["schema"], `${op}.request.schema`);
}

/** The FROZEN structuredContent sub-schema of the 200 response envelope for `POST /{op}`. */
function responseStructured(spec: { [k: string]: Json }, op: string): { [k: string]: Json } {
  const post = asObj(asObj(asObj(spec["paths"], "paths")["/" + op], op)["post"], `${op}.post`);
  const ok = asObj(asObj(post["responses"], `${op}.responses`)["200"], `${op}.200`);
  const schema = asObj(asObj(asObj(ok["content"], `${op}.rescontent`)["application/json"], `${op}.resjson`)["schema"], `${op}.resschema`);
  return asObj(asObj(schema["properties"], `${op}.envelope.properties`)["structuredContent"], `${op}.structuredContent`);
}

test("openapi_generated_matches_frozen_schemas", () => {
  const spec = buildOpenApi();
  assert.equal(spec["openapi"], OPENAPI_VERSION, "OpenAPI 3.1 (JSON Schema 2020-12 dialect)");

  // Paths are DERIVED from the registry — exactly the four operations, no more, no less (ADR-M007 C1).
  assert.deepEqual(Object.keys(asObj(spec["paths"], "paths")).sort(), ["/attest", "/calibrate", "/cascade", "/gate"], "paths == the 4 ops");

  const frozenPrediction = asObj(loadJson("prediction.schema.json"), "prediction");
  const frozenGate = asObj(loadJson("gate-decision.schema.json"), "gate-decision");
  const frozenVerdict = asObj(loadJson("coverage-verdict.schema.json"), "coverage-verdict");
  const frozenPrice = asObj(loadJson("attested-price.schema.json"), "attested-price");

  // --- gate: request envelope carries the frozen Prediction; response carries the frozen GateDecision.
  const gateReq = requestSchema(spec, "gate");
  const gatePred = asObj(asObj(gateReq["properties"], "gate.request.properties")["prediction"], "gate.request.prediction");
  assert.deepEqual(gatePred["required"], frozenPrediction["required"], "gate request prediction.required == frozen");
  assert.equal(gatePred["additionalProperties"], false, "gate request prediction stays closed");
  // full VALUE parity on the request Prediction (the frozen properties carry no annotations to strip).
  assert.deepEqual(
    asObj(gatePred["properties"], "gate.request.prediction.properties"),
    asObj(frozenPrediction["properties"], "frozen prediction.properties"),
    "gate request prediction property definitions == frozen in full",
  );

  // C2 (ADR-M007 D7): the gate request `params` carries the OPTIONAL BYO `calibration` — present in the
  // properties, but NOT in `required` (so committed-class calls stay valid). A drift reddens here.
  const gateParams = asObj(asObj(gateReq["properties"], "gate.request.properties")["params"], "gate.request.params");
  assert.deepEqual(gateParams["required"], ["remainingBudget", "bFloor", "tau", "tauInterval", "alpha", "nMin", "intent", "tool", "clockOpen"], "params.required stays the 9 committed fields (calibration is OPTIONAL)");
  const gateParamProps = asObj(gateParams["properties"], "gate.request.params.properties");
  assert.ok("calibration" in gateParamProps, "params carries the optional BYO calibration field (C2)");
  const calib = asObj(gateParamProps["calibration"], "gate.request.params.calibration");
  assert.deepEqual(calib["required"], ["scores", "mode"], "calibration requires scores + mode");
  assert.equal(calib["additionalProperties"], false, "calibration is a closed sub-object");

  // ADR-M017 D4(6): the gate request envelope carries the OPTIONAL frozen `attested` (AttestedPrice) —
  // PRESENT in `properties`, ABSENT from `required` (so a {prediction, params} call stays valid). A drift
  // (attested dropped, or slipped into `required`) reddens here. NOTE (K2-2, checkpoint-2 b1): an UN-STRIPPED
  // projection is NOT caught here — this test checks `required` / presence / `additionalProperties`, not full
  // property VALUE parity for `attested`; the un-stripped mutant is killed by `gate_attested_is_frozen_attested_price`
  // (schema.test.ts, test (1)), which deep-equals the projection to the stripped frozen file byte-for-byte.
  const gateReqProps = asObj(gateReq["properties"], "gate.request.properties");
  assert.ok("attested" in gateReqProps, "gate request carries the optional `attested` (ADR-M017 D1)");
  assert.deepEqual(gateReq["required"], ["prediction", "params"], "gate request required stays {prediction, params} (attested is OPTIONAL)");
  const gateAttested = asObj(gateReqProps["attested"], "gate.request.attested");
  assert.deepEqual(gateAttested["required"], frozenPrice["required"], "gate request attested.required == frozen AttestedPrice");
  assert.equal(gateAttested["additionalProperties"], false, "gate request attested stays a closed contract");

  const gateOut = responseStructured(spec, "gate");
  assert.deepEqual(gateOut["required"], frozenGate["required"], "gate response GateDecision.required == frozen");
  assert.equal(gateOut["additionalProperties"], false, "gate response GateDecision stays closed");
  const verdict = asObj(asObj(gateOut["properties"], "gate.response.properties")["verdict"], "gate.response.verdict");
  assert.deepEqual(verdict["required"], frozenVerdict["required"], "dereferenced verdict.required == frozen CoverageVerdict");
  assert.equal(verdict["additionalProperties"], false, "inlined verdict stays closed");

  // --- cascade: response carries the frozen Prediction.
  const cascadeOut = responseStructured(spec, "cascade");
  assert.deepEqual(cascadeOut["required"], frozenPrediction["required"], "cascade response Prediction.required == frozen");
  assert.equal(cascadeOut["additionalProperties"], false, "cascade response Prediction stays closed");

  // --- attest: response envelope's `price` is the frozen AttestedPrice (label/provenance ride outside, K-1).
  const attestOut = responseStructured(spec, "attest");
  const price = asObj(asObj(attestOut["properties"], "attest.response.properties")["price"], "attest.response.price");
  assert.deepEqual(price["required"], frozenPrice["required"], "attest response price.required == frozen AttestedPrice");
  assert.equal(price["additionalProperties"], false, "attest response price stays closed");
  assert.deepEqual(
    asObj(price["properties"], "attest.response.price.properties"),
    asObj(frozenPrice["properties"], "frozen attested-price.properties"),
    "attest response price property definitions == frozen in full",
  );

  // --- calibrate (ADR-M007 D2/D3): the path is present and NON-frozen (declared in
  // schema-projection.ts, never in schemas/). We pin the wire shape here — the request requires
  // {scores,alpha,nMin} and the response structuredContent requires the 7 D3 fields (reason IN the
  // schema = M-5) — so a drift in the projected calibrate schema reddens.
  const calibrateReq = requestSchema(spec, "calibrate");
  assert.deepEqual(calibrateReq["required"], ["scores", "alpha", "nMin"], "calibrate request requires scores, alpha, nMin");
  assert.equal(calibrateReq["additionalProperties"], false, "calibrate request is a closed envelope");
  const calibrateOut = responseStructured(spec, "calibrate");
  assert.deepEqual(
    calibrateOut["required"],
    ["qhat", "n", "alpha", "method", "set_digest", "label", "reason"],
    "calibrate response requires the 7 D3 fields (reason IN the schema, M-5)",
  );
  assert.equal(calibrateOut["additionalProperties"], false, "calibrate response is a closed envelope");
});
