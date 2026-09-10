/**
 * Harness Lot H3 — `attest` tool tests (ADR-M005 D1/D3/D8/D9, PLAN H3).
 * Each test is killed by >= 1 named mutant (proven red, then restored byte-exact via sha256 — see the
 * passe report). Fully typed: no `any`, no unsafe access — the file stays at the lint ratchet ceiling.
 *
 * `attest` projects the ONE committed Shōgen witness (s3-binance, Binance BTCUSDT, self-notarized) through
 * the REAL `fromShogen` adapter into the K-1 envelope { price, provenance, label }. `price` alone is the
 * frozen contract; the honesty label + provenance live OUTSIDE it (K-1).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { assertClosedAttestedPrice } from "@monark/contracts";
import type { AttestedPrice } from "@monark/contracts";
import { DEMONSTRATIVE_LABEL } from "@monark/monark";
import type { Ajv2020 as Ajv2020Instance, Options, SchemaObject, ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";
import { runAttest, projectShogen, AttestToolError, ATTEST_TOOL_DESCRIPTION, attestHonestyText } from "../src/tools/attest.ts";
import { ATTEST_OUTPUT_SCHEMA, type Json } from "../src/schema-projection.ts";
import { SHOGEN_LOT_BYTES, SHOGEN_VERDICT_TEXT, SHOGEN_CONSTAT } from "../src/shogen-fixture.ts";

// ajv / ajv-formats are CommonJS; load via `require` and narrow to the exact types used here (no `any`, no
// eslint-disable — the typing tokens are erased by Node type stripping). Same pattern as
// packages/monark/test/adapter-shogen.test.ts (test 29).
type Ajv2020Ctor = new (opts?: Options) => Ajv2020Instance;
const require = createRequire(import.meta.url);
const ajvExport = require("ajv/dist/2020") as { default?: Ajv2020Ctor };
const Ajv2020: Ajv2020Ctor = ajvExport.default ?? (ajvExport as unknown as Ajv2020Ctor);
const addFormatsExport = require("ajv-formats") as { default?: FormatsPlugin };
const addFormats: FormatsPlugin = addFormatsExport.default ?? (addFormatsExport as unknown as FormatsPlugin);

const SCHEMAS = fileURLToPath(new URL("../../../schemas", import.meta.url));
function loadJson(name: string): Json {
  return JSON.parse(readFileSync(join(SCHEMAS, name), "utf8")) as Json;
}
function asObj(node: Json | undefined, where: string): { [k: string]: Json } {
  if (node === null || node === undefined || typeof node !== "object" || Array.isArray(node)) {
    throw new Error(`expected object at ${where}`);
  }
  return node;
}

// Test — the tool emits the K-1 envelope whose `price` VALIDATES the frozen attested-price schema (ajv),
// AND the projected wire schema's `price` IS the frozen file (drift guard, D8); a key outside the frozen
// contract is refused; a refused witness is a tool error (fail-closed), never a silent price.
// Mutant: in attest.ts, `return { ...result, price: { ...result.price, p_correct: 0 } as unknown as AdapterOutput["price"] }`
// AFTER the re-affirm ⇒ the frozen ajv validation here (additionalProperties:false) reddens.
test("attest_output_is_frozen_attested_price", () => {
  const out = runAttest();

  // (1) the runtime price validates the frozen schema (ajv, draft 2020) — the substantive honesty check.
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  addFormats(ajv);
  const validate: ValidateFunction<AttestedPrice> = ajv.compile<AttestedPrice>(
    loadJson("attested-price.schema.json") as unknown as SchemaObject,
  );
  assert.ok(validate(out.price), `price must satisfy the frozen schema: ${JSON.stringify(validate.errors)}`);
  assertClosedAttestedPrice(out.price);

  // (1b) the FULL envelope validates its own projected schema ATTEST_OUTPUT_SCHEMA (the provenance/label
  // branch — the only place a wire-level regression could hide, since no test crosses the SDK boundary;
  // K-1 "+ the envelope"). A fresh ajv instance (the frozen `price` sub-schema carries no $id after strip).
  const ajvEnv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  addFormats(ajvEnv);
  const validateEnvelope: ValidateFunction = ajvEnv.compile(ATTEST_OUTPUT_SCHEMA as unknown as SchemaObject);
  assert.ok(validateEnvelope(out), `output must satisfy the projected envelope schema: ${JSON.stringify(validateEnvelope.errors)}`);

  // (2) drift guard (D8): the projected wire schema for `price` IS the frozen attested-price file, in full.
  const frozen = asObj(loadJson("attested-price.schema.json"), "attested-price");
  const projectedPrice = asObj(asObj(ATTEST_OUTPUT_SCHEMA["properties"], "output.properties")["price"], "price");
  assert.deepEqual(projectedPrice["required"], frozen["required"], "projected price.required must match the frozen file");
  assert.deepEqual(
    asObj(projectedPrice["properties"], "projected price.properties"),
    asObj(frozen["properties"], "frozen price.properties"),
    "projected price property definitions must match the frozen file in full",
  );
  assert.equal(projectedPrice["additionalProperties"], false, "price stays a closed contract on the wire");

  // (3) a key outside the frozen contract is refused (the p_correct mutant trips here before the wire).
  const tampered = { ...out.price, p_correct: 0 } as unknown;
  assert.throws(() => { assertClosedAttestedPrice(tampered); }, /unknown key/i);
  assert.ok(!validate(tampered), "a price with an extra key must fail the frozen schema (additionalProperties:false)");

  // (4) fail-closed: a refused witness (negated verdict) is a TOOL ERROR, never a silent price.
  const negated = SHOGEN_VERDICT_TEXT.replace("VERDICT : valide", "VERDICT : invalide");
  assert.notEqual(negated, SHOGEN_VERDICT_TEXT, "the negation edit must alter the VERDICT line");
  assert.throws(() => projectShogen(SHOGEN_LOT_BYTES, negated, SHOGEN_CONSTAT), AttestToolError);
});

// Test — the description makes NO probative claim (N-4 honesty guard, K-9; beyond the vocab gate, which
// does NOT ban live/verified/probative). The ONE sanctioned use of "verified" is the past-tense compound
// `Shōgen-verified` — a descriptor of the COMMITTED witness (it was verified once, at capture), NOT a
// call-time claim. Mask exactly that compound (the grep-forbidden / lang-gate exemptPhrases idiom; `\S*`
// is macron-normalization-tolerant), then assert NO probative token survives.
// Mutant: add live/verified/probative to ATTEST_TOOL_DESCRIPTION (a bare call-time claim) ⇒ it survives
// the scope-locked mask ⇒ red.
test("attest_makes_no_probative_claim", () => {
  // Two sanctioned phrases, masked BEFORE scanning EVERY rendered honesty carrier (OBS-1/OBS-2, G2 H3):
  //  - "Shōgen-verified": the past-tense compound describing the COMMITTED witness. The macron class is
  //    BOUNDED (`[o Ō ō ◌̄]{1,2}`), so a forged contiguous word `Sh<token>gen-verified` can NOT smuggle a
  //    probative token through the mask (the old `\S*` could).
  //  - "not probative": the honest disclaimer carried by DEMONSTRATIVE_LABEL and the MCP content text.
  // After masking exactly these, NO probative token may survive in the description, the MCP content, OR the label.
  const VERIFIED_COMPOUND = /Sh[oŌō̄]{1,2}gen-verified/gi;
  const NOT_PROBATIVE = /\bnot probative\b/gi;
  const PROBATIVE = /\blive\b|\bverified\b|\bprobative\b|\bp_correct\b|\bconfidence\b/i;
  const scrub = (s: string): string =>
    s.replace(VERIFIED_COMPOUND, (m) => " ".repeat(m.length)).replace(NOT_PROBATIVE, (m) => " ".repeat(m.length));

  // non-vacuous: the sanctioned compound is actually present in the description.
  assert.ok(/Sh[oŌō̄]{1,2}gen-verified/i.test(ATTEST_TOOL_DESCRIPTION), "the sanctioned 'Shōgen-verified' compound must be present (mask non-vacuous)");

  // EVERY rendered honesty carrier: the tool description, the MCP content text, and the envelope label.
  const carriers: ReadonlyArray<readonly [string, string]> = [
    ["description", ATTEST_TOOL_DESCRIPTION],
    ["content", attestHonestyText()],
    ["label", DEMONSTRATIVE_LABEL],
  ];
  for (const [name, text] of carriers) {
    assert.ok(!PROBATIVE.test(scrub(text)), `${name} makes no probative claim (scrubbed: "${scrub(text)}")`);
  }

  // positive anchors (non-vacuous): the description DISCLAIMS call-time verification and names the commit.
  assert.ok(/not executed at call time/i.test(ATTEST_TOOL_DESCRIPTION), "declares the verifier is not run at call time");
  assert.ok(ATTEST_TOOL_DESCRIPTION.includes("committed"), "declares the witness is committed");

  // scope-locked proofs: a bare claim ELSEWHERE, and a smuggled token in a forged compound, are BOTH caught.
  assert.ok(
    PROBATIVE.test(scrub("the price is live and verified now, probative " + ATTEST_TOOL_DESCRIPTION)),
    "a bare probative claim outside the sanctioned phrases must be caught",
  );
  assert.ok(PROBATIVE.test(scrub("Shprobativegen-verified")), "a smuggled token in a forged compound must not be masked (OBS-1)");
});

// Test — the label and provenance live on the ENVELOPE, NEVER inside the frozen `price` (K-1). The frozen
// AttestedPrice is additionalProperties:false and can carry neither.
// Mutant: in attest.ts, fold the label INTO the price (`price: { ...result.price, label: result.label }`)
// ⇒ `"label" in out.price` here (and assertClosedAttestedPrice) ⇒ red.
test("attest_label_off_frozen_contract", () => {
  const out = runAttest();

  // label + provenance are envelope-only (K-1): the frozen price carries neither key.
  const priceKeys = Object.keys(out.price);
  assert.ok(!priceKeys.includes("label"), "price carries no 'label' key (K-1: label rides the envelope)");
  assert.ok(!priceKeys.includes("provenance"), "price carries no 'provenance' key (K-1)");
  assert.doesNotThrow(() => { assertClosedAttestedPrice(out.price); }, "price stays a closed AttestedPrice");

  // the demonstrative label rides on the envelope and disclaims probative force.
  assert.equal(out.label, DEMONSTRATIVE_LABEL, "the demonstrative label rides on the envelope");
  assert.ok(out.label.includes("demonstrative"), "label declares 'demonstrative'");
  assert.ok(out.label.includes("not probative"), "label disclaims probative force");

  // provenance rides on the envelope (three bound digests, well-formed).
  assert.match(out.provenance.source_lot_sha256, /^[0-9a-f]{64}$/, "source_lot_sha256 is 64-hex");
  assert.match(out.provenance.source_verdict_sha256, /^[0-9a-f]{64}$/, "source_verdict_sha256 is 64-hex");
  assert.match(out.provenance.shogen_head_sha, /^[0-9a-f]{40}$/, "shogen_head_sha is 40-hex");

  // K-1 mutant proof (in-test): folding the label INTO the price makes it a non-closed contract.
  const folded = { ...out.price, label: out.label } as unknown;
  assert.throws(() => { assertClosedAttestedPrice(folded); }, /unknown key/i);
});
