/**
 * Harness — schema PROJECTION (ADR-M005 D8).
 *
 * The tool's input/output schemas are the FROZEN `schemas/*.json` (ADR-M001), loaded verbatim
 * and published as-is — NEVER re-written by hand. This module is the only place that reads the
 * frozen files (it sits at `src/`, NOT `src/tools/`, so the K-8 side-effect scan of the tool
 * implementations stays meaningful: a tool never does I/O).
 *
 * Two mechanical, deterministic transforms are applied so `fromJsonSchema` (the SDK's ajv-backed
 * compiler) can consume the schemas — both are functions of the frozen bytes, reproducible by the
 * drift test (`tool_schema_equals_frozen_schema`), NOT a hand rewrite:
 *   (1) `stripMeta`  — drop the JSON-Schema identity/dialect keys `$schema`/`$id` AND the annotation
 *                      keys `description`/`title` of every schema node. ajv rejects an unresolved nested
 *                      `$id`; the annotation strip keeps the FROZEN schemas' French / RR-1-inverted prose
 *                      (e.g. coverage-verdict's "alpha = couverture VISEE") OFF the MCP wire, on an
 *                      English-only external surface — the frozen bytes on disk are untouched (C-1,
 *                      checkpoint-2 H1; "frozen != honest", RR-2). Position-aware: keys INSIDE a
 *                      subschema map (`properties`/`$defs`/…) are property NAMES, never annotations, so a
 *                      contract with a property literally named `description` survives.
 *   (2) `derefVerdict` — the frozen `GateDecision` carries `verdict: { $ref:
 *                      "coverage-verdict.schema.json" }`; there is no external resolver, so we
 *                      splice the (stripped) `CoverageVerdict` object in place of the `$ref` node.
 *
 * The INPUT is an envelope `{ prediction, params }` (ADR-M005 D8/D5): `prediction` is the frozen
 * `Prediction` (spliced verbatim, `additionalProperties:false` — the SDK enforces the closed
 * contract AT THE BOUNDARY, measured), and `params` is the NON-frozen gate parameters, declared
 * here (never in `schemas/`).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { fromJsonSchema } from "@modelcontextprotocol/server";
import type { JsonSchemaType, StandardSchemaWithJSON } from "@modelcontextprotocol/server";
// Lot H6 resource cap: the single source for the cascade node bound lives in the pure tool file. No cycle
// (this module -> cascade -> gate -> calibration; none import back here). cascade.ts does no I/O, so
// importing it here does not move any filesystem read out of this module (the K-8 boundary is intact).
import { CASCADE_MAX_NODES } from "./tools/cascade.ts";

/** A JSON value (no `any`; keeps the type-checked linter happy end-to-end). */
export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
type JsonObject = { [k: string]: Json };

const SCHEMAS_DIR = fileURLToPath(new URL("../../../schemas/", import.meta.url));

function loadFrozen(file: string): JsonObject {
  const raw = JSON.parse(readFileSync(SCHEMAS_DIR + file, "utf8")) as Json;
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`schema-projection: ${file} is not a JSON object`);
  }
  return raw;
}

/** The frozen schemas, loaded verbatim (the drift test reads the same files independently). */
export const PREDICTION_SCHEMA: JsonObject = loadFrozen("prediction.schema.json");
export const GATE_DECISION_SCHEMA: JsonObject = loadFrozen("gate-decision.schema.json");
export const COVERAGE_VERDICT_SCHEMA: JsonObject = loadFrozen("coverage-verdict.schema.json");

/** Keywords whose VALUE is a map from arbitrary (author-chosen) names to subschemas. The child KEYS
 *  there are property names, NOT schema-node annotations, so they are never stripped by name. */
const SUBSCHEMA_MAP_KEYWORDS = new Set(["properties", "patternProperties", "$defs", "definitions", "dependentSchemas"]);

/** (1) Drop the identity keys `$schema`/`$id` and the annotation keys `description`/`title` of every
 *  schema node, at every depth. Pure; a function of the input bytes. Position-aware (C-1): inside a
 *  subschema map the keys are property names and are preserved (we still recurse into their subschemas). */
export function stripMeta(node: Json): Json {
  if (Array.isArray(node)) return node.map((n) => stripMeta(n));
  if (node !== null && typeof node === "object") {
    const out: JsonObject = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === "$schema" || k === "$id" || k === "description" || k === "title") continue;
      if (SUBSCHEMA_MAP_KEYWORDS.has(k) && v !== null && typeof v === "object" && !Array.isArray(v)) {
        const inner: JsonObject = {};
        for (const [name, sub] of Object.entries(v)) inner[name] = stripMeta(sub);
        out[k] = inner;
      } else {
        out[k] = stripMeta(v);
      }
    }
    return out;
  }
  return node;
}

function asObject(node: Json, where: string): JsonObject {
  if (node === null || typeof node !== "object" || Array.isArray(node)) {
    throw new Error(`schema-projection: expected an object at ${where}`);
  }
  return node;
}

/** (2) Splice the stripped CoverageVerdict in place of GateDecision.properties.verdict's `$ref`. */
export function derefVerdict(gateDecision: JsonObject, coverageVerdict: JsonObject): JsonObject {
  const gd = asObject(stripMeta(gateDecision), "GateDecision");
  const props = asObject(gd["properties"] ?? {}, "GateDecision.properties");
  props["verdict"] = stripMeta(coverageVerdict);
  gd["properties"] = props;
  return gd;
}

/** Non-frozen gate parameters (ADR-M005 D5/D6, caller-carried). Declared here, never in schemas/. */
export const PARAMS_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["remainingBudget", "bFloor", "tau", "tauInterval", "alpha", "nMin", "intent", "tool", "clockOpen"],
  properties: {
    remainingBudget: { type: "number", description: "B_t — remaining authorization capacity (caller-owned, D6)." },
    bFloor: { type: "number", description: "B_floor threshold (>= 0)." },
    tau: { type: "number", description: "Set-size threshold for the `set` path (>= 0)." },
    tauInterval: { type: "number", description: "Width threshold for the `interval` path (>= 0)." },
    alpha: { type: "number", description: "Target miscoverage in (0,1)." },
    nMin: { type: "integer", description: "Minimum calibration count (>= 1)." },
    intent: { type: ["string", "number", "null"], description: "The intent tested against the region." },
    tool: { type: "string", description: "The NAMED gated tool (echoed, never invoked — D0/D1)." },
    clockOpen: { type: "boolean", description: "Whether the coverage window is still open (caller-owned)." },
  },
};

/** Projected tool INPUT schema (envelope). `properties.prediction` is the frozen Prediction (stripped). */
export const TOOL_INPUT_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["prediction", "params"],
  properties: {
    prediction: stripMeta(PREDICTION_SCHEMA),
    params: PARAMS_SCHEMA,
  },
};

/** Projected tool OUTPUT schema = frozen GateDecision with the CoverageVerdict `$ref` dereferenced. */
export const TOOL_OUTPUT_SCHEMA: JsonObject = derefVerdict(GATE_DECISION_SCHEMA, COVERAGE_VERDICT_SCHEMA);

/** SDK Standard Schemas built from the projected JSON (the actual `registerTool` arguments). */
export const toolInputStandardSchema: StandardSchemaWithJSON = fromJsonSchema(TOOL_INPUT_SCHEMA as unknown as JsonSchemaType);
export const toolOutputStandardSchema: StandardSchemaWithJSON = fromJsonSchema(TOOL_OUTPUT_SCHEMA as unknown as JsonSchemaType);

// ---------------------------------------------------------------------------- cascade (Lot H2, D4/D8)

/**
 * cascade INPUT (ADR-M005 D4/D8): the NON-frozen UKEMI `FinancialSystem` (`L`, `e`) plus the declared
 * 24h `shock` and the caller-carried `producedAt`. Declared HERE, never in schemas/ — a matrix/vector
 * shape the frozen contracts never described (the gate's `params` precedent).
 */
export const CASCADE_INPUT_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["L", "e", "shock", "producedAt"],
  properties: {
    L: {
      type: "array",
      description: "Nominal interbank liabilities matrix L[i][j] = what node i owes node j. Square, entries >= 0, zero diagonal.",
      // Lot H6 resource cap: bound BOTH the outer array (node count n) and each inner row at the SDK
      // boundary — a square matrix is n x n, so an unbounded row is as much a DoS vector as an unbounded n.
      maxItems: CASCADE_MAX_NODES,
      items: { type: "array", items: { type: "number" }, maxItems: CASCADE_MAX_NODES },
    },
    e: {
      type: "array",
      description: "External assets (liquidation value) per node at the clearing date. One value per node.",
      maxItems: CASCADE_MAX_NODES, // Lot H6: |e| == n, capped in lockstep with L.
      items: { type: "number" },
    },
    shock: { type: "number", description: "24h collateral price shock fraction in [0,1] — a declared fixture parameter, not a dynamics model." },
    producedAt: { type: "string", description: "Caller-carried RFC3339 instant, injected for hash stability (D4); the tool reads no clock." },
  },
};

/** cascade OUTPUT = the frozen `Prediction`, PROJECTED (stripped), never re-written (D8). */
export const CASCADE_OUTPUT_SCHEMA: JsonObject = asObject(stripMeta(PREDICTION_SCHEMA), "cascade output (Prediction)");

/** SDK Standard Schemas for the cascade tool (`registerTool` arguments). */
export const cascadeInputStandardSchema: StandardSchemaWithJSON = fromJsonSchema(CASCADE_INPUT_SCHEMA as unknown as JsonSchemaType);
export const cascadeOutputStandardSchema: StandardSchemaWithJSON = fromJsonSchema(CASCADE_OUTPUT_SCHEMA as unknown as JsonSchemaType);

// ---------------------------------------------------------------------------- attest (Lot H3, D3/D8)

/**
 * attest OUTPUT (ADR-M005 D3/D8, K-1): the `AdapterOutput` ENVELOPE. Only `price` is a FROZEN contract —
 * the projected `attested-price.schema.json` (stripped), byte-for-byte the frozen file (drift-guarded by
 * `attest_output_is_frozen_attested_price`). `provenance` and `label` are the K-1 honesty envelope: they
 * live OUTSIDE the closed contract (the frozen `AttestedPrice` is `additionalProperties:false` and can
 * carry neither), declared HERE in English, never in schemas/ — the gate `params` / cascade-input precedent.
 */
export const ATTESTED_PRICE_SCHEMA: JsonObject = loadFrozen("attested-price.schema.json");

/** attest INPUT: none. The witness is the committed internal fixture; the tool takes no caller parameters. */
export const ATTEST_INPUT_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  properties: {},
};

/** attest OUTPUT = the K-1 envelope: frozen (projected) `price` + non-frozen `provenance`/`label`. */
export const ATTEST_OUTPUT_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["price", "provenance", "label"],
  properties: {
    price: stripMeta(ATTESTED_PRICE_SCHEMA),
    provenance: {
      type: "object",
      additionalProperties: false,
      required: ["source_lot_sha256", "source_verdict_sha256", "shogen_head_sha"],
      properties: {
        source_lot_sha256: { type: "string", pattern: "^[0-9a-f]{64}$", description: "sha256 of the committed witness lot (CBOR), recomputed from the bytes." },
        source_verdict_sha256: { type: "string", pattern: "^[0-9a-f]{64}$", description: "sha256 of the committed verifier output (UTF-8), recomputed from the bytes." },
        shogen_head_sha: { type: "string", pattern: "^[0-9a-f]{40}$", description: "Source revision the fixtures were extracted from (pinned)." },
      },
    },
    label: { type: "string", description: "Honesty label carried OUTSIDE the frozen price (K-1): the witness is demonstrative, not probative." },
  },
};

/** SDK Standard Schemas for the attest tool (`registerTool` arguments). */
export const attestInputStandardSchema: StandardSchemaWithJSON = fromJsonSchema(ATTEST_INPUT_SCHEMA as unknown as JsonSchemaType);
export const attestOutputStandardSchema: StandardSchemaWithJSON = fromJsonSchema(ATTEST_OUTPUT_SCHEMA as unknown as JsonSchemaType);
