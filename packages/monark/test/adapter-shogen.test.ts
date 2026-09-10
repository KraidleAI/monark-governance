// packages/monark/test/adapter-shogen.test.ts — Lot I-b (ADR-M003 D10/D11, ADR-M001 Decision 3, ADR-M005 D3).
//
// Exercises `fromShogen` on the committed, sha256-pinned s3-binance fixtures. ANTI-CIRCULARITY: every
// mapped field is confronted with an INDEPENDENT oracle — the Shogen verifier stdout
// (fixtures/s3-binance.verdict.txt) and the companion Constat (fixtures/s3-binance.constat.json) — never
// with our own decoder alone. Tests:
//   - test 29 `shogen_s3_binance_decodes_to_attested_price` : output.price |= the frozen schema (ajv).
//   - `adapter_maps_shogen_triple_to_attested_price`        : each field's SOURCE (mis-map => red).
//   - `adapter_output_carries_demonstrative_label`          : the K-1 honesty label (probative/verified => red).
// The fixtures on disk are never written; their sha256 is re-checked unchanged at the end.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { fromShogen, isAdapterError, DEMONSTRATIVE_LABEL, SHOGEN_HEAD_SHA } from "../src/adapter-shogen.ts";
import type { AdapterOutput } from "../src/adapter-shogen.ts";
import type { AttestedPrice } from "@monark/contracts";
import type { Ajv2020 as Ajv2020Instance, Options, SchemaObject, ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";

// ajv / ajv-formats are CommonJS; load via `require` and narrow the untyped result to the exact types
// used here (no `any`, no eslint-disable — the typing tokens are erased by Node type stripping). Same
// pattern as packages/hikae/test/interval-conformer.test.ts.
type Ajv2020Ctor = new (opts?: Options) => Ajv2020Instance;

const FIX = fileURLToPath(new URL("../../../fixtures", import.meta.url));
const SCHEMAS = fileURLToPath(new URL("../../../schemas", import.meta.url));
const require = createRequire(import.meta.url);
const ajvExport = require("ajv/dist/2020") as { default?: Ajv2020Ctor };
const Ajv2020: Ajv2020Ctor = ajvExport.default ?? (ajvExport as unknown as Ajv2020Ctor);
const addFormatsExport = require("ajv-formats") as { default?: FormatsPlugin };
const addFormats: FormatsPlugin = addFormatsExport.default ?? (addFormatsExport as unknown as FormatsPlugin);

// sha256 pins (fixtures/PROVENANCE-s3-binance.md).
const LOT_SHA256 = "8700d88f87253f0fd8496402601dc7326362a2cd9e6614a9bf44b79052f1e5a3";
const VERDICT_SHA256 = "b2528be9c75b388f538a4a2aa81daa268a3da4ecf4b6c5d52e314b9a27d3663d";

function readBytes(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(FIX, name)));
}
function sha256Hex(u: Uint8Array): string {
  return createHash("sha256").update(u).digest("hex");
}
function loadSchema(name: string): SchemaObject {
  return JSON.parse(readFileSync(join(SCHEMAS, name), "utf8")) as SchemaObject;
}

const LOT = readBytes("s3-binance.lot.cbor");
const VERDICT = readFileSync(join(FIX, "s3-binance.verdict.txt"), "utf8");
const CONSTAT = JSON.parse(readFileSync(join(FIX, "s3-binance.constat.json"), "utf8")) as Record<string, unknown>;

/** The three residuals the verifier NAMES on its VERDICT line (the two carried + the delegation one). */
const EXPECT_RESIDUAL = ["A(notary-neutrality)", "A(self-attestation)", "A(transport-check-delegated)"];

function adapt(): AdapterOutput {
  const out = fromShogen(LOT, VERDICT, CONSTAT);
  assert.ok(!isAdapterError(out), `fromShogen unexpectedly refused: ${JSON.stringify(out)}`);
  return out;
}

test("shogen_s3_binance_decodes_to_attested_price — output.price validates the frozen schema (ajv)", () => {
  assert.equal(sha256Hex(LOT), LOT_SHA256, "lot fixture must be the pinned bytes");
  assert.equal(sha256Hex(new Uint8Array(Buffer.from(VERDICT, "utf8"))), VERDICT_SHA256, "verdict fixture pinned");

  const { price } = adapt();

  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  addFormats(ajv);
  const validate: ValidateFunction<AttestedPrice> = ajv.compile<AttestedPrice>(loadSchema("attested-price.schema.json"));
  assert.ok(validate(price), `price must satisfy the frozen schema: ${JSON.stringify(validate.errors)}`);
});

test("adapter_maps_shogen_triple_to_attested_price — each field is bound to its INDEPENDENT source", () => {
  const { price } = adapt();

  // schema_version: the contract constant.
  assert.equal(price.schema_version, "1.0.0");

  // subject / transport / observed_at: from the Temoignage, each appearing verbatim in the verifier output.
  assert.equal(price.subject, "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
  assert.ok(VERDICT.includes(price.subject), "subject must appear in the verifier output");
  assert.equal(price.transport, "tlsn-mpc/1");
  assert.ok(VERDICT.includes(price.transport), "transport must appear in the verifier output");
  assert.equal(price.observed_at.clock, "tlsn-mpc/1:connection_info.time");
  assert.ok(VERDICT.includes(price.observed_at.clock), "clock must appear in the verifier output");
  assert.equal(price.observed_at.instant, 1786594228);
  assert.ok(VERDICT.includes(String(price.observed_at.instant)), "instant must appear in the verifier output");
  // instant also equals the Constat's connection_info_time (a second independent oracle).
  assert.equal(price.observed_at.instant, CONSTAT["connection_info_time"]);

  // attestor: one identity (verbatim in the verifier output); its key = hex("k256 " + constat.attestor_cle_hex),
  // an independent recomposition from the Constat (two pieces, one 71-octet key).
  assert.equal(price.attestor.length, 1);
  assert.equal(price.attestor[0]?.identity, "shogen:attestateur-de-demonstration-s3");
  assert.ok(VERDICT.includes("shogen:attestateur-de-demonstration-s3"), "attestor identity in the verifier output");
  const composedKey = Buffer.from(`k256 ${String(CONSTAT["attestor_cle_hex"])}`, "utf8").toString("hex");
  assert.equal(price.attestor[0]?.key, composedKey, "attestor key = hex of the constat-composed pinned key");
  assert.equal(price.attestor[0]?.key.length, 71 * 2, "71-octet key -> 142 hex chars (verifier: 71 octets)");

  // residual <- Verdict.residus: the THREE the verdict names (NOT the two the CBOR field carries).
  // Confronted with the verifier output, in emitted order.
  assert.deepEqual([...price.residual], EXPECT_RESIDUAL);
  for (const r of EXPECT_RESIDUAL) assert.ok(VERDICT.includes(r), `residual ${r} must appear in the verifier output`);

  // octets_recalcules <- Verdict: true for this fixture (hash recomputed over carried bytes, ADR-0005 rule 1).
  assert.equal(price.octets_recalcules, true);

  // verifier_revision <- Verdict.revision_amont_deleguee: verbatim in the verifier output AND equal to the
  // Constat's revision_amont (the value the verifier itself read from the constat) — a cross-source check.
  assert.equal(price.verifier_revision, "0fe3c32d35382b3f290a43c4156399ca4512bb89");
  assert.ok(VERDICT.includes(price.verifier_revision), "revision must appear in the verifier output");
  assert.equal(price.verifier_revision, CONSTAT["revision_amont"], "revision must equal the constat's revision_amont");

  // sens_emis_digest <- Constat.empreinte_sent_revele_sha256 (constat.rs:608) — DISTINCT from utterance.hash.
  assert.equal(price.sens_emis_digest, CONSTAT["empreinte_sent_revele_sha256"]);
  assert.equal(price.sens_emis_digest, "4ad0e84b4f078e7ee62482ca86853c09e3c17bf074274168d65c024d1777e24b");
  assert.notEqual(price.sens_emis_digest, price.utterance.hash, "emitted-meaning digest != received utterance hash");

  // utterance <- Temoignage: hash verbatim in the verifier output AND = sha256(carried bytes) (rule 1);
  // hash equals the Constat's empreinte_recv_revele_sha256 (received transcript).
  assert.equal(price.utterance.hash, "c28a41ce87dafcd313d301ab56472b6f3cd1b3d81d903da787b0ca9dfffbeea0");
  assert.ok(VERDICT.includes(price.utterance.hash), "utterance hash must appear in the verifier output");
  assert.equal(price.utterance.hash, CONSTAT["empreinte_recv_revele_sha256"]);
  assert.ok(price.utterance.bytes !== undefined, "this fixture carries the utterance octets");
  const uttBytes = Buffer.from(price.utterance.bytes ?? "", "hex");
  assert.equal(createHash("sha256").update(uttBytes).digest("hex"), price.utterance.hash, "sha256(bytes)==hash");
});

test("adapter_output_carries_demonstrative_label — the K-1 honesty label + bound provenance", () => {
  const out = adapt();

  // The label is the exact demonstrative literal, on the ENVELOPE (never inside the frozen contract).
  assert.equal(out.label, DEMONSTRATIVE_LABEL);
  assert.ok(out.label.includes("demonstrative"), "label must declare 'demonstrative'");
  assert.ok(out.label.includes("not probative"), "label must disclaim probative force");
  assert.ok(!/\bverified\b/i.test(out.label), "label must NOT claim 'verified'");
  // honesty guard: a bare positive 'probative' (without the 'not ') is a false claim.
  assert.ok(!/(^|[^t] )probative/.test(out.label), "label must not make a bare probative claim");

  // provenance: the two content digests are recomputed from the actual inputs; the head sha is pinned.
  assert.equal(out.provenance.source_lot_sha256, LOT_SHA256);
  assert.equal(out.provenance.source_verdict_sha256, VERDICT_SHA256);
  assert.equal(out.provenance.shogen_head_sha, SHOGEN_HEAD_SHA);

  // the label/provenance are OUTSIDE the frozen contract: price carries no such key.
  const priceKeys = Object.keys(out.price);
  assert.ok(!priceKeys.includes("label"), "price carries no label key (K-1: label lives on the envelope)");
  assert.ok(!priceKeys.includes("provenance"), "price carries no provenance key (K-1)");
});

test("adapter_rejects_negated_verdict — 'invalide' does not fail-open (R2, G2 I-b)", () => {
  // A substring test on "valide" ACCEPTS "invalide" (the negation) and would emit a price. The anchored
  // accept marker refuses it. Mutant: revert the predicate to `includes("valide")` => this emits a price => red.
  const negated = VERDICT.replace("VERDICT : valide", "VERDICT : invalide");
  assert.notEqual(negated, VERDICT, "the negation edit must alter the VERDICT line");
  const out = fromShogen(LOT, negated, CONSTAT);
  assert.ok(isAdapterError(out), "a negated verdict must NOT yield a price (no fail-open on the negation)");
  assert.equal(out.reason, "attestation_refused", "present-but-non-accept verdict => attestation_refused");
});

test("adapter_fixture_bytes_untouched — the pinned fixtures are never written by this test", () => {
  assert.equal(sha256Hex(readBytes("s3-binance.lot.cbor")), LOT_SHA256, "lot fixture sha256 unchanged");
  assert.equal(sha256Hex(new Uint8Array(readFileSync(join(FIX, "s3-binance.verdict.txt")))), VERDICT_SHA256);
});
