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
import * as projection from "../src/schema-projection.ts";
import { TOOL_ERROR_CODES } from "@monark/contracts";

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
    ["qhat", "n", "alpha", "method", "scores_sha256", "label", "reason"],
    "calibrate response requires the 7 D3 fields (reason IN the schema, M-5)",
  );
  assert.equal(calibrateOut["additionalProperties"], false, "calibrate response is a closed envelope");
});

/** The independent projection of a tool-error node: annotations and identity keys dropped, local $defs refs inlined. */
function projectToolError(node: Json, defs: { [k: string]: Json }): Json {
  if (Array.isArray(node)) return node.map((n) => projectToolError(n, defs));
  if (node === null || typeof node !== "object") return node;
  const ref = node["$ref"];
  if (typeof ref === "string") return projectToolError(defs[ref.replace("#/$defs/", "")] ?? null, defs);
  return Object.fromEntries(Object.entries(node).filter(([k]) => !["$schema", "$id", "description", "title", "$defs"].includes(k)).map(([k, v]) => [k, projectToolError(v, defs)]));
}

// OPENAPI-ERROR-CODE-1 (ADR-CM amendment 2026-10-04 (1); Q-C5 conditions 3 and 4; lot CM-3c-4a): the 400 and 500 responses of
// every operation are the projections of the root and of $defs/InternalError of schemas/tool-error.schema.json, so their
// codes are the 32 of the catalogue; no code is a literal of openapi.ts or schema-projection.ts, and no $ref is left. The 500
// also admits the transport-level body the frozen description names, {"error":"internal_error"} (TRANSPORT-500-SCHEMA-1).
// killer: apps/harness/src/openapi.ts:86 CONST "TOOL_ERROR_400_SCHEMA" -> "TOOL_ERROR_500_SCHEMA"
test("openapi_400_and_500_are_the_tool_error_projections", () => {
  const frozen = asObj(loadJson("tool-error.schema.json"), "tool-error");
  const defs = asObj(frozen["$defs"], "tool-error.$defs");
  const transport = { type: "object", additionalProperties: false, required: ["error"], properties: { error: { const: "internal_error" } } };
  const want400 = projectToolError(frozen, defs), want500 = { oneOf: [projectToolError(defs["InternalError"] ?? null, defs), transport] };
  type Responses = Record<string, { content?: Record<string, { schema?: Json } | undefined> } | undefined>;
  const spec = buildOpenApi();
  for (const op of ["attest", "calibrate", "cascade", "gate"]) {
    const post = asObj(asObj(asObj(spec["paths"], "paths")["/" + op], op)["post"], `${op}.post`);
    const responses = post["responses"] as unknown as Responses;
    assert.deepEqual(responses["400"]?.content?.["application/json"]?.schema, want400, `${op}: the 400 is the projected tool-error root`);
    assert.deepEqual(responses["500"]?.content?.["application/json"]?.schema, want500, `${op}: the 500 is the projected InternalError or the transport-level body`);
  }
  const text = JSON.stringify(want400) + JSON.stringify(want500);
  assert.deepEqual(TOOL_ERROR_CODES.filter((c) => !text.includes(`"${c}"`)), [], "the projections carry the 32 codes");
  assert.ok(!JSON.stringify(spec).includes("$ref") && !JSON.stringify(spec).includes("$defs"), "no reference is left for OpenAPI to resolve");
  for (const f of ["../src/openapi.ts", "../src/schema-projection.ts"]) {
    const src = readFileSync(fileURLToPath(new URL(f, import.meta.url)), "utf8");
    assert.deepEqual(TOOL_ERROR_CODES.filter((c) => src.includes(`"${c}"`)), [], `${f}: no code literal (C-3)`);
  }
});

/** The guarded builder of the 500 schema, read through the namespace (so a tree without it loads this file and reddens by
 *  assertion), and the independent projection of the frozen $defs/InternalError. */
function internal500(): { build: (internal: { [k: string]: Json }) => Json; internal: { [k: string]: Json } } {
  const build = (projection as Record<string, unknown>)["internal500Schema"];
  assert.equal(typeof build, "function", "the 500 schema is built by a guarded function of schema-projection.ts");
  const defs = asObj(asObj(loadJson("tool-error.schema.json"), "tool-error")["$defs"], "tool-error.$defs");
  return { build: build as (internal: { [k: string]: Json }) => Json, internal: asObj(projectToolError(defs["InternalError"] ?? null, defs), "InternalError") };
}

// TRANSPORT-500-SCHEMA-1, fold of its review (N-1; scope of SCHEMA-PROJECTION-FAIL-CLOSED-1): the two 500 branches exclude each
// other only while InternalError is closed and requires operation; the builder refuses any other InternalError at load.
// killer: apps/harness/src/schema-projection.ts:195 CONST "internal[\"additionalProperties\"] !== false" -> "false"
test("internal_500_branches_fail_closed_unless_exclusive", () => {
  const { build, internal } = internal500();
  assert.doesNotThrow(() => build(internal), "the frozen InternalError builds");
  const without = (key: string): { [k: string]: Json } => Object.fromEntries(Object.entries(internal).filter(([k]) => k !== key));
  const cases: [string, { [k: string]: Json }][] = [
    ["additionalProperties true", { ...internal, additionalProperties: true }], ["no additionalProperties", without("additionalProperties")],
    ["operation optional", { ...internal, required: ["error"] }], ["no required", without("required")],
  ];
  for (const [at, bad] of cases) assert.throws(() => build(bad), /would overlap/, `${at}: refused at load`);
});

// TRANSPORT-500-SCHEMA-1, fold of its review (N-2; scope of SCHEMA-PROJECTION-FAIL-CLOSED-1): the transport-level branch takes
// a closed list of keys from InternalError (type, additionalProperties) plus its own required and error property, so a future
// key of the frozen definition (minProperties, allOf) stays in the InternalError branch and never in the transport one.
// killer: apps/harness/src/schema-projection.ts:199 CONST "...picked" -> "...internal"
test("transport_500_branch_takes_a_closed_list_of_keys", () => {
  const { build, internal } = internal500();
  const props = asObj(internal["properties"], "InternalError.properties");
  const extended = { ...internal, minProperties: 2, allOf: [{ required: ["operation"] }] };
  const branches = asObj(build(extended), "500")["oneOf"];
  assert.ok(Array.isArray(branches) && branches.length === 2, "two branches");
  assert.deepEqual(branches[0], extended, "the InternalError branch is the definition itself");
  assert.deepEqual(branches[1], { type: internal["type"] ?? null, additionalProperties: false, required: ["error"], properties: { error: props["error"] ?? null } }, "the transport branch: closed keys and error alone");
});

/** SCHEMA-PROJECTION-FAIL-CLOSED-1 (N-2 of the G2 of C' 3c-4a): the inliner of the error bodies, read through the namespace (so a
 *  tree without the export loads this file and reddens by assertion). */
function spfInline(): (node: Json, defs: { [k: string]: Json }) => Json {
  const inline = (projection as Record<string, unknown>)["inlineDefs"];
  assert.equal(typeof inline, "function", "the error bodies are inlined by an exported function of schema-projection.ts");
  return inline as (node: Json, defs: { [k: string]: Json }) => Json;
}
const SPF_DEFS: { [k: string]: Json } = { Operation: { type: "string", minLength: 1 } };

// SCHEMA-PROJECTION-FAIL-CLOSED-1: a $ref with sibling keywords fails closed; at the base the siblings were dropped in silence
// ({ $ref, maxLength: 64 } projected to Operation alone). A bare $ref still inlines, so the frozen bodies are unchanged.
// killer: apps/harness/src/schema-projection.ts:176 CONST "siblings.length > 0" -> "false"
test("spf_ref_with_sibling_keywords_fails_closed", () => {
  const inline = spfInline();
  assert.deepEqual(inline({ properties: { operation: { $ref: "#/$defs/Operation" } } }, SPF_DEFS), { properties: { operation: { type: "string", minLength: 1 } } }, "a bare $ref inlines");
  assert.throws(() => inline({ $ref: "#/$defs/Operation", maxLength: 64 }, SPF_DEFS), /has sibling keywords \(maxLength\) that inlining would drop/, "root");
  assert.throws(() => inline({ type: "object", properties: { operation: { $ref: "#/$defs/Operation", enum: ["gate"] } } }, SPF_DEFS), /has sibling keywords \(enum\)/, "nested");
  assert.throws(() => inline({ $ref: "#/$defs/Operation", $defs: {} }, SPF_DEFS), /has sibling keywords \(\$defs\)/, "$defs beside the $ref");
});

// SCHEMA-PROJECTION-FAIL-CLOSED-1: a definition reached again on its own path fails closed with the path named; at the base the
// inliner recursed until the stack overflowed (RangeError). A definition used twice side by side is not recursive.
// killer: apps/harness/src/schema-projection.ts:177 CONST "via.includes(name)" -> "false"
test("spf_recursive_definition_fails_closed", () => {
  const inline = spfInline();
  const self = { Node: { type: "object", properties: { next: { $ref: "#/$defs/Node" } } } };
  assert.throws(() => inline({ $ref: "#/$defs/Node" }, self), /is recursive \(Node -> Node\)/, "self-recursive");
  assert.throws(() => inline({ items: { $ref: "#/$defs/A" } }, { A: { items: { $ref: "#/$defs/B" } }, B: { items: { $ref: "#/$defs/A" } } }), /is recursive \(A -> B -> A\)/, "mutual");
  const chain = { A: { items: { $ref: "#/$defs/B" } }, B: { items: { $ref: "#/$defs/Operation" } }, Operation: SPF_DEFS["Operation"] ?? null };
  assert.deepEqual(inline({ oneOf: [{ $ref: "#/$defs/A" }, { $ref: "#/$defs/A" }] }, chain), { oneOf: [{ items: { items: { type: "string", minLength: 1 } } }, { items: { items: { type: "string", minLength: 1 } } }] }, "a chain used twice side by side inlines");
});

// SCHEMA-PROJECTION-FAIL-CLOSED-1: only a local #/$defs/<name> of a known object definition inlines. At the base a bare name
// resolved in silence, a non-string $ref was kept, and an unknown one threw an unrelated message ("expected an object").
// killer: apps/harness/src/schema-projection.ts:173 CONST "!Object.hasOwn(defs, name)" -> "false"
test("spf_unknown_or_nonlocal_ref_fails_closed", () => {
  const inline = spfInline();
  const defs = { ...SPF_DEFS, "a~1b": { type: "null" }, "a%20b": { type: "null" }, Flag: true };
  for (const ref of ["#/$defs/Missing", "#/$defs/constructor", "Operation", "other.schema.json#/$defs/Operation", "#/$defs/Operation/minLength", "#/properties/x", "#/$defs/a~1b", "#/$defs/a%20b", "#/$defs/", 42, null]) {
    assert.throws(() => inline({ $ref: ref }, defs), /does not name a known local definition/, `${JSON.stringify(ref)}: refused`);
  }
  assert.throws(() => inline({ $ref: "#/$defs/Flag" }, defs), /expected an object at #\/\$defs\/Flag/, "a boolean definition: refused");
});

/** A function of schema-projection.ts read through the namespace (a tree without it loads this file and reddens by assertion). */
function spfFn<F>(name: string): F {
  const f = (projection as Record<string, unknown>)[name];
  assert.equal(typeof f, "function", `${name} is an exported function of schema-projection.ts`);
  return f as F;
}

// SCHEMA-PROJECTION-FAIL-CLOSED-1, fold of its review (N-1): the value of const, enum, default and examples is data, copied
// verbatim and never read as a schema (at the lot's first gel a $ref in a const was inlined, a $defs in a default dropped); and
// the inliner is position-aware like stripMeta: a property named $ref, $defs or const is a name, its schema is inlined.
// killer: apps/harness/src/schema-projection.ts:162 CONST "DATA_KEYWORDS.has(k) ? structuredClone(v)" -> "false ? structuredClone(v)"
test("spf_data_keywords_are_not_schemas", () => {
  const inline = spfInline();
  for (const data of [{ const: { $ref: "#/$defs/Operation" } }, { enum: [{ $ref: "#/$defs/Operation" }, "x"] }, { default: { $defs: 1, a: 2 } }, { examples: [{ $ref: "#/$defs/Missing", $dynamicRef: "#a" }] }]) {
    assert.deepEqual(inline(data, SPF_DEFS), data, `${JSON.stringify(data)}: data kept verbatim`);
  }
  const named = { properties: { $ref: { type: "string" }, $defs: { type: "null" }, const: { $ref: "#/$defs/Operation" } } };
  assert.deepEqual(inline(named, SPF_DEFS), { properties: { $ref: { type: "string" }, $defs: { type: "null" }, const: { type: "string", minLength: 1 } } }, "property names are names");
  const strip = spfFn<(node: Json) => Json>("stripMeta");
  assert.deepEqual(strip({ const: { description: "kept", title: "kept", $id: "kept" }, description: "dropped" }), { const: { description: "kept", title: "kept", $id: "kept" } }, "stripMeta keeps data verbatim");
});

// SCHEMA-PROJECTION-FAIL-CLOSED-1, fold of its review (N-2): a nested $id opens another resource that #/$defs/... would resolve
// against, and stripMeta drops it; so the raw frozen file is refused before the strip. A root $id, a property named $id and an
// $id inside data pass. At the lot's first gel { $id: "other.json", $ref: "#/$defs/Operation" } inlined the root's definition.
// killer: apps/harness/src/schema-projection.ts:122 CONST "Object.hasOwn(n, \"$id\")" -> "false"
test("spf_nested_id_fails_closed", () => {
  const refuse = spfFn<(raw: { [k: string]: Json }, where: string) => { [k: string]: Json }>("refuseNestedId");
  const frozen = asObj(loadJson("tool-error.schema.json"), "tool-error");
  assert.equal(refuse(frozen, "ToolError"), frozen, "the frozen file passes (one $id, at its root)");
  const fine = { $id: "root.json", properties: { $id: { type: "string" } }, const: { $id: "data" } };
  assert.equal(refuse(fine, "fine"), fine, "root $id, property named $id, $id in data");
  for (const bad of [{ properties: { a: { $id: "x.json", $ref: "#/$defs/Operation" } } }, { items: { $id: "y.json" } }, { $defs: { A: { $id: "z.json" } } }, { oneOf: [{ type: "null" }, { $id: "w.json" }] }]) {
    assert.throws(() => refuse(bad, "bad"), /bad carries a nested \$id/, `${JSON.stringify(bad)}: refused`);
  }
});

// SCHEMA-PROJECTION-FAIL-CLOSED-1, fold of its review (N-2): $dynamicRef, $recursiveRef, $anchor and $dynamicAnchor are not
// inlined, so they are refused (at the lot's first gel they passed into /openapi.json untouched). A property so named passes.
// killer: apps/harness/src/schema-projection.ts:160 CONST "dynamic.length > 0" -> "false"
test("spf_dynamic_keywords_fail_closed", () => {
  const inline = spfInline();
  for (const bad of [{ $dynamicRef: "#/$defs/Operation" }, { items: { $recursiveRef: "#" } }, { $defs: {}, properties: { a: { $anchor: "a", type: "string" } } }, { anyOf: [{ $dynamicAnchor: "n" }] }]) {
    assert.throws(() => inline(bad, SPF_DEFS), /cannot be inlined \(dynamic scope or anchor\)/, `${JSON.stringify(bad)}: refused`);
  }
  const named = { properties: { $anchor: { type: "string" }, $dynamicRef: { type: "null" } } };
  assert.deepEqual(inline(named, SPF_DEFS), named, "properties so named are names");
});

// SCHEMA-PROJECTION-FAIL-CLOSED-1, fold of its review (N-3; closes DEREF-VERDICT-FAIL-CLOSED-1): the MCP outputSchema splices
// CoverageVerdict only in place of a verdict that is exactly { $ref: "coverage-verdict.schema.json" }, and only a CoverageVerdict
// without $ref, $defs or dynamic keyword. At the lot's first gel each case below was spliced in silence.
// killer: apps/harness/src/schema-projection.ts:142 CONST "!isMap(v) || Object.keys(v).join() !== \"$ref\" || v[\"$ref\"] !== VERDICT_REF" -> "false"
test("spf_deref_verdict_fails_closed", () => {
  const deref = spfFn<(gd: { [k: string]: Json }, cv: { [k: string]: Json }) => Json>("derefVerdict");
  const gd = asObj(loadJson("gate-decision.schema.json"), "gate-decision"), cv = asObj(loadJson("coverage-verdict.schema.json"), "coverage-verdict");
  assert.deepEqual(deref(gd, cv), projection.TOOL_OUTPUT_SCHEMA, "the frozen pair projects to the served output schema");
  const withVerdict = (verdict: Json | undefined): { [k: string]: Json } => {
    const props = { ...asObj(gd["properties"], "gd.properties") };
    if (verdict === undefined) delete props["verdict"]; else props["verdict"] = verdict;
    return { ...gd, properties: props };
  };
  for (const [at, verdict] of [["sibling", { $ref: "coverage-verdict.schema.json", maxItems: 3 }], ["other target", { $ref: "other.json" }], ["not a $ref", { type: "string" }], ["absent", undefined]] as const) {
    assert.throws(() => deref(withVerdict(verdict), cv), /verdict is not exactly/, `${at}: refused`);
  }
  for (const [at, extra] of [["internal $ref", { properties: { a: { $ref: "#/$defs/X" } } }], ["$defs", { $defs: { X: {} } }], ["$dynamicRef", { items: { $dynamicRef: "#n" } }]] as const) {
    assert.throws(() => deref(gd, { ...cv, ...extra }), /CoverageVerdict carries/, `${at}: refused`);
  }
});

// SCHEMA-PROJECTION-FAIL-CLOSED-1, fold of its review (N-4): a JSON key __proto__ stays an own data key through stripMeta (at the
// lot's first gel it became the prototype, the key was lost), and a $ref is read only as an own key, never inherited.
// killer: apps/harness/src/schema-projection.ts:157 CONST "Object.hasOwn(node, \"$ref\")" -> "\"$ref\" in node"
test("spf_proto_key_stays_own_data", () => {
  const inline = spfInline();
  const strip = spfFn<(node: Json) => Json>("stripMeta");
  for (const text of ['{"properties":{"x":{"__proto__":{"$ref":"#/$defs/Operation"}}}}', '{"properties":{"__proto__":{"type":"string"},"a":{}}}']) {
    assert.equal(JSON.stringify(strip(JSON.parse(text) as Json)), text, `${text}: __proto__ kept as a key`);
  }
  const inherited = Object.create({ $ref: "#/$defs/Operation" }) as { [k: string]: Json };
  assert.deepEqual(inline(inherited, SPF_DEFS), {}, "an inherited $ref is not a reference");
});
