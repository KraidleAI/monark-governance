import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { ValidateFunction } from "ajv";
import {
  validAttestedPrice,
  validAttestedFlow,
  validAttestedBook,
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
  af: "https://monark.local/schemas/attested-flow.schema.json",
  ab: "https://monark.local/schemas/attested-book.schema.json",
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
  load("attested-flow.schema.json"),
  load("attested-book.schema.json"),
  load("prediction.schema.json"),
  load("coverage-verdict.schema.json"),
  load("gate-decision.schema.json"),
]);

function validator(id: string): ValidateFunction {
  const v = ajv.getSchema(id);
  if (!v) throw new Error(`no compiled schema for ${id}`);
  return v;
}

test("all six schemas compile (valid JSON Schema; the $ref resolves)", () => {
  assert.doesNotThrow(() => {
    for (const id of Object.values(ID)) validator(id);
  });
});

test("valid fixtures pass their schema", () => {
  const vap = validator(ID.ap);
  assert.equal(vap(validAttestedPrice()), true, JSON.stringify(vap.errors));
  const vaf = validator(ID.af);
  assert.equal(vaf(validAttestedFlow()), true, JSON.stringify(vaf.errors));
  const vp = validator(ID.pred);
  assert.equal(vp(validPrediction()), true, JSON.stringify(vp.errors));
  const vcv = validator(ID.cv);
  assert.equal(vcv(validVerdictSet()), true, JSON.stringify(vcv.errors));
  assert.equal(vcv(validVerdictInterval()), true, JSON.stringify(vcv.errors));
  const vgd = validator(ID.gd);
  assert.equal(vgd(validGateDecision()), true, JSON.stringify(vgd.errors));
  const vab = validator(ID.ab);
  assert.equal(vab(validAttestedBook()), true, JSON.stringify(vab.errors));
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

// ---- AttestedFlow (ADR-M008 D2/D3) — the frozen source of truth, Ajv-executed.

test("attested-flow rejects a residual OUTSIDE the closed enum (ADR-M008 D3)", () => {
  const vaf = validator(ID.af);
  assert.equal(vaf({ ...validAttestedFlow(), residual: ["peg_broke"] }), false);
  assert.equal(vaf({ ...validAttestedFlow(), residual: [] }), false); // minItems
  assert.equal(vaf({ ...validAttestedFlow(), residual: ["ap_capacity_unknown", "ap_capacity_unknown"] }), false); // uniqueItems
});

test("attested-flow rejects a non-decimal-string flow count (raw uint256, no precision loss)", () => {
  const af = validAttestedFlow();
  // a JS number would lose precision above 2^53 ⇒ the schema demands a decimal string.
  assert.equal(validator(ID.af)({ ...af, flow: { ...af.flow, burns: 1000 } }), false);
  assert.equal(validator(ID.af)({ ...af, flow: { ...af.flow, supply: "0x1f" } }), false);
});

test("attested-flow rejects an unknown window and an unknown top-level key (closed)", () => {
  const af = validAttestedFlow();
  assert.equal(validator(ID.af)({ ...af, window: "7d" }), false);
  assert.equal(validator(ID.af)({ ...af, peg_score: 0.9 }), false); // additionalProperties:false
});

// ---- AttestedBook (ADR-U1b D2/D2ter/D4) — the frozen source of truth, Ajv-executed.

test("attested-book rejects a residual OUTSIDE the closed enum, an empty residual, and a duplicate (ADR-U1b D2ter)", () => {
  const vab = validator(ID.ab);
  assert.equal(vab({ ...validAttestedBook(), residual: ["price_as_read"] }), false); // out of the closed enum
  assert.equal(vab({ ...validAttestedBook(), residual: [] }), false); // minItems:1 — no_third_party_verifier always present (C-10)
  assert.equal(vab({ ...validAttestedBook(), residual: ["no_third_party_verifier", "no_third_party_verifier"] }), false); // uniqueItems
});

// V-6 (b), investor decision 2026-09-19: the frozen schema itself must FORCE `residual` to carry
// `no_third_party_verifier` (ADR-U1b D2ter) via `"contains": {"const": ...}`, so the invariant is enforced,
// not merely stated in the description. Before V-6 (b) an in-enum, unique, non-empty residual that OMITTED
// it was ACCEPTED (the gap checkpoint-2 flagged). Mutant (delete the schema `contains` line) reddens (b)
// below AND the contracts_frozen guard (schema sha != manifest).
test("attested_book_residual_always_names_no_third_party_verifier", () => {
  const vab = validator(ID.ab);
  const base = validAttestedBook();
  // (a) a residual that CARRIES no_third_party_verifier passes — alone, and alongside another residual.
  assert.equal(vab({ ...base, residual: ["no_third_party_verifier"] }), true, JSON.stringify(vab.errors));
  assert.equal(vab({ ...base, residual: ["no_third_party_verifier", "oracle_price_as_read"] }), true, JSON.stringify(vab.errors));
  // (b) an in-enum, unique, non-empty residual that OMITS no_third_party_verifier is REFUSED, and the
  // failing keyword is `contains` (enum/minItems/uniqueItems all pass here) — proof the NEW constraint bites.
  assert.equal(vab({ ...base, residual: ["oracle_price_as_read"] }), false, "residual omitting no_third_party_verifier must be refused");
  assert.ok(vab.errors?.some((e) => e.keyword === "contains"), `refusal must come from the contains keyword: ${JSON.stringify(vab.errors)}`);
  assert.equal(vab({ ...base, residual: ["oracle_price_as_read", "rpc_quorum_2_keyless"] }), false, "multi-element residual still refused when no_third_party_verifier is absent");
});

// value ⇔ reason≠null (ADR-U1b D4, C-1): BOTH uncoupled directions rejected by the frozen schema `oneOf`.
test("attested_book_abstain_coupling", () => {
  const vab = validator(ID.ab);
  const base = validAttestedBook();
  // the two COUPLED shapes are the only valid ones:
  assert.equal(vab({ ...base, abstain: { value: false, reason: null } }), true, "not-abstained ⇔ reason null");
  assert.equal(vab({ ...base, abstain: { value: true, reason: "no_quorum" } }), true, JSON.stringify(vab.errors));
  assert.equal(vab({ ...base, abstain: { value: true, reason: "abi_mismatch" } }), true);
  assert.equal(vab({ ...base, abstain: { value: true, reason: "unfinalized_block" } }), true);
  // both UNCOUPLED directions are refused:
  assert.equal(vab({ ...base, abstain: { value: true, reason: null } }), false, "value true but reason null must fail");
  assert.equal(vab({ ...base, abstain: { value: false, reason: "no_quorum" } }), false, "value false but reason non-null must fail");
  // a reason outside the enum is refused too:
  assert.equal(vab({ ...base, abstain: { value: true, reason: "boom" } }), false);
});

test("attested-book rejects a non-decimal base amount, a bad provider method, a sub-quorum, and an unknown key (closed)", () => {
  const b = validAttestedBook();
  assert.equal(validator(ID.ab)({ ...b, eligible: { ...b.eligible, debt_base: 1000 } }), false); // uint256 base = decimal STRING
  assert.equal(validator(ID.ab)({ ...b, providers: [{ name: "x", method: "trace_call", ok: true }] }), false); // method enum
  assert.equal(validator(ID.ab)({ ...b, quorum: { required: 1, achieved: 0 } }), false); // required >= 2
  assert.equal(validator(ID.ab)({ ...b, block: { number: 1, hash: "a".repeat(64) } }), false); // block hash needs 0x
  assert.equal(validator(ID.ab)({ ...b, price: "1" }), false); // additionalProperties:false — no price on the envelope
});

test("attested_book_description_may_be_empty", () => {
  // ADR-U1b D2 amend (2026-09-19, pre-freeze): oracle_sources[].description is `^[ -~]*$` — the EMPTY
  // string is admitted so a CONCORDANT-revert oracle description ("" at the digest, ADR-U1 D1 amendment,
  // measured on-chain GHO fact) stays schema-valid; non-ASCII is still refused (still ASCII-printable).
  const vab = validator(ID.ab);
  const b = validAttestedBook();
  const withDesc = (d: string) => ({
    ...b,
    oracle_sources: [{ asset: "0x" + "1".repeat(40), source: "0x" + "2".repeat(40), description: d }],
  });
  assert.equal(vab(withDesc("")), true, "empty description accepted (concordant revert, ADR-U1 D1)");
  assert.equal(vab(withDesc("x")), true, "normal description accepted");
  assert.equal(vab(withDesc("\u00e9")), false, "non-ASCII description refused (still ^[ -~]*$)");
});

// O-2 (ADR-U1b D2bis V-4, lot U-1b-b): SEMANTIC ajv probes on the FROZEN schema — the value constraints the
// closed-check cannot express. Each asserts valid===false AND the EXPECTED error path/keyword, so removing that
// one schema keyword (a mutant) reddens exactly this probe.
test("attested_book_schema_subject_must_match_pattern (S1)", () => {
  const vab = validator(ID.ab);
  assert.equal(vab({ ...validAttestedBook(), subject: "https://monarkgate.tech" }), false, "a subject with no path segment (empty group) is refused");
  assert.ok(vab.errors?.some((e) => e.instancePath === "/subject" && e.keyword === "pattern"), `refusal must be a subject pattern error: ${JSON.stringify(vab.errors)}`);
});

test("attested_book_schema_oracle_sources_unique (S2)", () => {
  const vab = validator(ID.ab);
  const s = { asset: "0x" + "1".repeat(40), source: "0x" + "2".repeat(40), description: "x" };
  assert.equal(vab({ ...validAttestedBook(), oracle_sources: [s, { ...s }] }), false, "a duplicate oracle_source is refused");
  assert.ok(vab.errors?.some((e) => e.keyword === "uniqueItems" && e.instancePath === "/oracle_sources"), `refusal must be a uniqueItems error: ${JSON.stringify(vab.errors)}`);
});

test("attested_book_schema_providers_min_items (S3)", () => {
  const vab = validator(ID.ab);
  assert.equal(vab({ ...validAttestedBook(), providers: [] }), false, "an empty providers array is refused (minItems:1)");
  assert.ok(vab.errors?.some((e) => e.keyword === "minItems" && e.instancePath === "/providers"), `refusal must be a minItems error: ${JSON.stringify(vab.errors)}`);
});

test("attested_book_schema_required_key_missing (S6)", () => {
  const vab = validator(ID.ab);
  const b = { ...validAttestedBook() } as Record<string, unknown>;
  delete b["book_digest"];
  assert.equal(vab(b), false, "a missing required key is refused");
  assert.ok(vab.errors?.some((e) => e.keyword === "required" && (e.message ?? "").includes("book_digest")), `refusal must name the missing required key: ${JSON.stringify(vab.errors)}`);
});
