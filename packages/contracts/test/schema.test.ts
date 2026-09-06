import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { ValidateFunction } from "ajv";
import {
  validAttestedPrice,
  validPrediction,
  validVerdictSet,
  validVerdictInterval,
  validGateDecision,
} from "./fixtures.ts";

// Execute the FROZEN source of truth (schemas/*.json) — not the TS mirror.
// This is what proves a `pattern` typo, an unresolved `$ref`, or a missing C4
// value-constraint would be caught. Runtime stays zero-dep; ajv is test-only.

const schemasDir = new URL("../../../schemas/", import.meta.url);
// deno-lint-ignore no-explicit-any
function load(name: string): any {
  return JSON.parse(readFileSync(new URL(name, schemasDir), "utf8"));
}

const ID = {
  ap: "https://monark.local/schemas/attested-price.schema.json",
  pred: "https://monark.local/schemas/prediction.schema.json",
  cv: "https://monark.local/schemas/coverage-verdict.schema.json",
  gd: "https://monark.local/schemas/gate-decision.schema.json",
} as const;

// ajv + ajv-formats are CJS libraries; createRequire is the robust interop under
// nodenext (a default import mis-types the CJS namespace, though it runs fine).
const require = createRequire(import.meta.url);
// deno-lint-ignore no-explicit-any
const ajvMod: any = require("ajv/dist/2020.js");
// deno-lint-ignore no-explicit-any
const afMod: any = require("ajv-formats");
// deno-lint-ignore no-explicit-any
const Ajv2020: any = ajvMod.default ?? ajvMod;
// deno-lint-ignore no-explicit-any
const addFormats: any = afMod.default ?? afMod;
// allowUnionTypes: the contracts use `"type": ["string","number"]` (yhat/intent)
// and `["number","null"]` (qhat) — declared unions, not a schema defect.
const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);
// Register all four so the gate-decision → coverage-verdict `$ref` resolves.
ajv.addSchema([
  load("attested-price.schema.json"),
  load("prediction.schema.json"),
  load("coverage-verdict.schema.json"),
  load("gate-decision.schema.json"),
]);

function validator(id: string): ValidateFunction {
  const v = ajv.getSchema(id);
  if (!v) throw new Error(`no compiled schema for ${id}`);
  return v;
}

test("all four schemas compile (valid JSON Schema; the $ref resolves)", () => {
  assert.doesNotThrow(() => {
    for (const id of Object.values(ID)) validator(id);
  });
});

test("valid fixtures pass their schema", () => {
  const vap = validator(ID.ap);
  assert.equal(vap(validAttestedPrice()), true, JSON.stringify(vap.errors));
  const vp = validator(ID.pred);
  assert.equal(vp(validPrediction()), true, JSON.stringify(vp.errors));
  const vcv = validator(ID.cv);
  assert.equal(vcv(validVerdictSet()), true, JSON.stringify(vcv.errors));
  assert.equal(vcv(validVerdictInterval()), true, JSON.stringify(vcv.errors));
  const vgd = validator(ID.gd);
  assert.equal(vgd(validGateDecision()), true, JSON.stringify(vgd.errors));
});

test("schema rejects an unknown key (additionalProperties:false)", () => {
  assert.equal(validator(ID.ap)({ ...validAttestedPrice(), foo: 1 }), false);
});

test("schema rejects an empty attestor (minItems)", () => {
  assert.equal(validator(ID.ap)({ ...validAttestedPrice(), attestor: [] }), false);
});

test("schema rejects a duplicate attestor (uniqueItems — EntreeDupliquee mirror)", () => {
  const a = { identity: "x", key: "ab" };
  assert.equal(validator(ID.ap)({ ...validAttestedPrice(), attestor: [a, { ...a }] }), false);
});

test("schema rejects a 63-char hash (pattern ^[0-9a-f]{64}$)", () => {
  const ap = validAttestedPrice();
  assert.equal(validator(ID.ap)({ ...ap, utterance: { hash: "a".repeat(63) } }), false);
});

test("schema rejects a control char in subject (ASCII-printable pattern)", () => {
  const withControl = "bad" + String.fromCharCode(1) + "subject";
  assert.equal(validator(ID.ap)({ ...validAttestedPrice(), subject: withControl }), false);
});

test("schema rejects an EMPTY residual (minItems) — the value constraint the TS type does NOT enforce", () => {
  // residual: [] typechecks against `string[]` but the schema is authoritative.
  assert.equal(validator(ID.ap)({ ...validAttestedPrice(), residual: [] }), false);
});

test("schema rejects a DUPLICATE residual (uniqueItems) — validator C4 edge case", () => {
  assert.equal(validator(ID.ap)({ ...validAttestedPrice(), residual: ["dup", "dup"] }), false);
});

test("schema rejects a bad region kind (oneOf) and a set-region missing label_schema", () => {
  const vcv = validator(ID.cv);
  assert.equal(vcv({ ...validVerdictSet(), region: { kind: "triangle", a: 1 } }), false);
  assert.equal(vcv({ ...validVerdictSet(), region: { kind: "set", labels: ["up"] } }), false);
});
