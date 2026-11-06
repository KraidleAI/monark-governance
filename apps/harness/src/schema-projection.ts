/**
 * Harness — schema PROJECTION.
 *
 * The tool's input/output schemas are the FROZEN `schemas/*.json`, loaded verbatim
 * and published as-is — NEVER re-written by hand. This module is the only place that reads the
 * frozen files (it sits at `src/`, NOT `src/tools/`, so the side-effect scan of the tool
 * implementations stays meaningful: a tool never does I/O).
 *
 * Two mechanical, deterministic transforms are applied so `fromJsonSchema` (the SDK's ajv-backed
 * compiler) can consume the schemas — both are functions of the frozen bytes, reproducible by the
 * drift test (`tool_schema_equals_frozen_schema`), NOT a hand rewrite:
 *   (1) `stripMeta`  — drop the JSON-Schema identity/dialect keys `$schema`/`$id` AND the annotation
 *                      keys `description`/`title` of every schema node. ajv rejects an unresolved nested
 *                      `$id`; the annotation strip keeps the FROZEN schemas' French / inverted prose
 *                      (e.g. coverage-verdict's "alpha = couverture VISEE") OFF the MCP wire, on an
 *                      English-only external surface — the frozen bytes on disk are untouched.
 *                      Position-aware: keys INSIDE a
 *                      subschema map (`properties`/`$defs`/…) are property NAMES, never annotations, so a
 *                      contract with a property literally named `description` survives.
 *   (2) `derefVerdict` — the frozen `GateDecision` carries `verdict: { $ref:
 *                      "coverage-verdict.schema.json" }`; there is no external resolver, so we
 *                      splice the (stripped) `CoverageVerdict` object in place of the `$ref` node.
 *
 * The INPUT is an envelope `{ prediction, params }`: `prediction` is the frozen
 * `Prediction` (spliced verbatim, `additionalProperties:false` — the SDK enforces the closed
 * contract AT THE BOUNDARY, measured), and `params` is the NON-frozen gate parameters, declared
 * here (never in `schemas/`).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { fromJsonSchema } from "@modelcontextprotocol/server";
import type { JsonSchemaType, StandardSchemaWithJSON } from "@modelcontextprotocol/server";
// Resource cap: the single source for the calibrate score bound lives in the pure tool file. No cycle (this module ->
// calibrate; calibrate does no I/O, imports no schema), and importing it moves no filesystem read out of this module.
import { CALIBRATE_MAX_N } from "./tools/calibrate.ts";
import { SUIVI_MAX_BETS, SUIVI_MAX_N, SUIVI_MAX_TEXT, SUIVI_MAX_WORK_BITS } from "./tools/gate.ts";
// The judge tool's closed lists and patterns: single source in the pure tool, as for calibrate. No cycle (this module ->
// judge -> gate; none import back here).
import { JUDGE_DECIMAL_PATTERN, JUDGE_LIST_MAX, JUDGE_NAME_PATTERN, JUDGE_ORDER_KINDS, JUDGE_REASONS } from "./tools/judge.ts";
import { TOOL_ERROR_CODES } from "@monark/contracts";

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
// The gate INPUT envelope `attested` projects it, in TOOL_INPUT_SCHEMA (which JUDGE_INPUT_SCHEMA spreads).
export const ATTESTED_PRICE_SCHEMA: JsonObject = loadFrozen("attested-price.schema.json");

/** Keywords whose VALUE is a map from arbitrary (author-chosen) names to subschemas. The child KEYS
 *  there are property names, NOT schema-node annotations, so they are never stripped by name. */
const SUBSCHEMA_MAP_KEYWORDS = new Set(["properties", "patternProperties", "$defs", "definitions", "dependentSchemas"]);
/** Keywords whose VALUE is data (a JSON instance), never a schema: copied verbatim and never descended into, so a `$ref`, `$defs`
 *  or `description` key inside a `const` stays data. */
const DATA_KEYWORDS = new Set(["const", "enum", "default", "examples"]);
/** Keywords that resolve against a dynamic scope or an anchor: none is inlined, so each is refused where a reference is resolved. */
const DYNAMIC_KEYWORDS = new Set(["$dynamicRef", "$recursiveRef", "$anchor", "$dynamicAnchor", "$recursiveAnchor"]);

const isMap = (v: Json | undefined): v is JsonObject => v !== null && typeof v === "object" && !Array.isArray(v);
/** Sets `k` as an OWN data property, so a JSON key `__proto__` stays a key and never becomes the prototype. */
function setOwn(o: JsonObject, k: string, v: Json): void {
  Object.defineProperty(o, k, { value: v, enumerable: true, writable: true, configurable: true });
}

/** (1) Drop the identity keys `$schema`/`$id` and the annotation keys `description`/`title` of every
 *  schema node, at every depth. Pure; a function of the input bytes. Position-aware: inside a
 *  subschema map the keys are property names and are preserved (we still recurse into their subschemas);
 *  the value of a data keyword (`const`, `enum`, `default`, `examples`) is copied verbatim. */
export function stripMeta(node: Json): Json {
  if (Array.isArray(node)) return node.map((n) => stripMeta(n));
  if (node !== null && typeof node === "object") {
    const out: JsonObject = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === "$schema" || k === "$id" || k === "description" || k === "title") continue;
      if (DATA_KEYWORDS.has(k)) {
        setOwn(out, k, structuredClone(v));
      } else if (SUBSCHEMA_MAP_KEYWORDS.has(k) && isMap(v)) {
        const inner: JsonObject = {};
        for (const [name, sub] of Object.entries(v)) setOwn(inner, name, stripMeta(sub));
        setOwn(out, k, inner);
      } else {
        setOwn(out, k, stripMeta(v));
      }
    }
    return out;
  }
  return node;
}

/** Every schema node of `node`, root first, read position-aware like `stripMeta` (a data keyword's value is not a schema). */
function schemaNodes(node: Json, out: JsonObject[] = []): JsonObject[] {
  if (Array.isArray(node)) for (const n of node) schemaNodes(n, out);
  if (!isMap(node)) return out;
  out.push(node);
  for (const [k, v] of Object.entries(node)) {
    if (DATA_KEYWORDS.has(k)) continue;
    if (SUBSCHEMA_MAP_KEYWORDS.has(k) && isMap(v)) for (const sub of Object.values(v)) schemaNodes(sub, out);
    else schemaNodes(v, out);
  }
  return out;
}

/** A raw frozen file whose `$id` is only at its root, or a throw: a nested `$id` opens another resource, against which
 *  `#/$defs/...` would resolve, and `stripMeta` drops it, so it is refused before the strip. */
export function refuseNestedId(raw: JsonObject, where: string): JsonObject {
  if (schemaNodes(raw).slice(1).some((n) => Object.hasOwn(n, "$id"))) throw new Error(`schema-projection: ${where} carries a nested $id; its references would resolve against another resource`);
  return raw;
}

function asObject(node: Json, where: string): JsonObject {
  if (node === null || typeof node !== "object" || Array.isArray(node)) {
    throw new Error(`schema-projection: expected an object at ${where}`);
  }
  return node;
}

/** The one node `derefVerdict` replaces: the frozen `GateDecision.properties.verdict`, exactly. */
const VERDICT_REF = "coverage-verdict.schema.json";
/** (2) Splice the stripped CoverageVerdict in place of GateDecision.properties.verdict's `$ref`. Fails closed: `verdict` must
 *  be present and exactly `{ "$ref": "coverage-verdict.schema.json" }` (no sibling, no other target), and the CoverageVerdict
 *  must carry no `$ref`, `$defs` or dynamic keyword (it would resolve against GateDecision once spliced). */
export function derefVerdict(gateDecision: JsonObject, coverageVerdict: JsonObject): JsonObject {
  const gd = asObject(stripMeta(refuseNestedId(gateDecision, "GateDecision")), "GateDecision");
  const props = asObject(gd["properties"] ?? null, "GateDecision.properties");
  const v = props["verdict"];
  if (!isMap(v) || Object.keys(v).join() !== "$ref" || v["$ref"] !== VERDICT_REF) throw new Error(`schema-projection: GateDecision.properties.verdict is not exactly { "$ref": "${VERDICT_REF}" }`);
  const cv = stripMeta(refuseNestedId(coverageVerdict, "CoverageVerdict"));
  const bad = schemaNodes(cv).flatMap((n) => Object.keys(n).filter((k) => k === "$ref" || k === "$defs" || DYNAMIC_KEYWORDS.has(k)));
  if (bad.length > 0) throw new Error(`schema-projection: CoverageVerdict carries ${bad.join(", ")}; spliced into GateDecision it would resolve there`);
  setOwn(props, "verdict", cv);
  gd["properties"] = props;
  return gd;
}

/** (3) The frozen error bodies of the mirror, stripped, with every local
 *  `#/$defs/<name>` reference inlined (OpenAPI resolves `#` against its own document) and `$defs` dropped. Position-aware like
 *  `stripMeta`; the refusals are those of `defOfRef`, plus any dynamic keyword. */
export function inlineDefs(node: Json, defs: JsonObject, via: readonly string[] = []): Json {
  if (Array.isArray(node)) return node.map((n) => inlineDefs(n, defs, via));
  if (node === null || typeof node !== "object") return node;
  const name = Object.hasOwn(node, "$ref") ? defOfRef(node, defs, via) : null;
  if (name !== null) return inlineDefs(defs[name] ?? null, defs, [...via, name]);
  const dynamic = Object.keys(node).filter((k) => DYNAMIC_KEYWORDS.has(k));
  if (dynamic.length > 0) throw new Error(`schema-projection: ${dynamic.join(", ")} cannot be inlined (dynamic scope or anchor)`);
  const sub = (v: Json): Json => (isMap(v) ? Object.fromEntries(Object.entries(v).map(([n, s]) => [n, inlineDefs(s, defs, via)])) : inlineDefs(v, defs, via));
  return Object.fromEntries(Object.entries(node).filter(([k]) => k !== "$defs").map(([k, v]) => [k, DATA_KEYWORDS.has(k) ? structuredClone(v) : SUBSCHEMA_MAP_KEYWORDS.has(k) ? sub(v) : inlineDefs(v, defs, via)]));
}

/** The definition a `$ref` node of `inlineDefs` stands for, or a throw. Refused: a `$ref` that
 *  is not a local `#/$defs/<name>` of a known object definition (another document, a deeper pointer, an escaped name, a
 *  non-string), a `$ref` with sibling keywords (inlining would drop them), and a definition reached again on its own path
 *  (recursive: inlining never ends). `via` is the path of definitions being inlined, so a definition used twice side by side
 *  is not recursive. */
function defOfRef(node: JsonObject, defs: JsonObject, via: readonly string[]): string {
  const ref = node["$ref"], local = "#/$defs/";
  const name = typeof ref === "string" && ref.startsWith(local) ? ref.slice(local.length) : "";
  if (/^$|[/~%]/.test(name) || !Object.hasOwn(defs, name)) throw new Error(`schema-projection: $ref ${JSON.stringify(ref)} does not name a known local definition (#/$defs/<name>)`);
  asObject(defs[name] ?? null, local + name);
  const siblings = Object.keys(node).filter((k) => k !== "$ref");
  if (siblings.length > 0) throw new Error(`schema-projection: $ref ${local}${name} has sibling keywords (${siblings.join(", ")}) that inlining would drop`);
  if (via.includes(name)) throw new Error(`schema-projection: $ref ${local}${name} is recursive (${[...via, name].join(" -> ")}); it cannot be inlined`);
  return name;
}
const TOOL_ERROR_SCHEMA = asObject(stripMeta(refuseNestedId(loadFrozen("tool-error.schema.json"), "ToolError")), "ToolError");
const TOOL_ERROR_DEFS = asObject(TOOL_ERROR_SCHEMA["$defs"] ?? null, "ToolError.$defs");
/** The 400 body (the root: tool_error, invalid_input, invalid_json). */
export const TOOL_ERROR_400_SCHEMA = asObject(inlineDefs(TOOL_ERROR_SCHEMA, TOOL_ERROR_DEFS), "ToolError 400");
/** The keys the transport-level branch takes from $defs/InternalError: a closed list, so a future key of the frozen definition
 *  (minProperties, allOf, ...) never leaks into that branch. */
const TRANSPORT_500_KEYS: readonly string[] = ["type", "additionalProperties"];
/**
 * The 500 body from the projected $defs/InternalError: oneOf [InternalError (an operation failed; it names the operation), the
 * transport-level 500 that the frozen description names outside its branches, "without operation" (server.ts, before or around
 * any operation): InternalError's closed keys and its `error` property alone, so exactly the body that server.ts sends].
 * Fails closed at load unless the two branches exclude each other: InternalError closed and requiring `operation`.
 */
export function internal500Schema(internal: JsonObject): JsonObject {
  const required = internal["required"];
  if (internal["additionalProperties"] !== false) throw new Error("InternalError is not closed: the two 500 branches would overlap");
  if (!Array.isArray(required) || !required.includes("operation")) throw new Error("InternalError does not require operation: the two 500 branches would overlap");
  const error = asObject(asObject(internal["properties"] ?? null, "InternalError.properties")["error"] ?? null, "InternalError.error");
  const picked = Object.fromEntries(TRANSPORT_500_KEYS.filter((k) => k in internal).map((k) => [k, internal[k] ?? null]));
  const transport: JsonObject = { ...picked, required: ["error"], properties: { error } };
  return { oneOf: [internal, transport] };
}
/** The 500 body: $defs/InternalError, or the transport-level 500. */
export const TOOL_ERROR_500_SCHEMA = internal500Schema(asObject(inlineDefs(TOOL_ERROR_DEFS["InternalError"] ?? null, TOOL_ERROR_DEFS), "ToolError 500"));

/** Step 6 of ROADMAP.md: a mixture of the tracking policy, its rationals written n/d (or n). */
const SUIVI_BETS_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["lambdas", "weights"],
  properties: {
    lambdas: { type: "array", items: { type: "string", maxLength: SUIVI_MAX_TEXT }, minItems: 1, maxItems: SUIVI_MAX_BETS, description: "The bets, rationals n/d." },
    weights: { type: "array", items: { type: "string", maxLength: SUIVI_MAX_TEXT }, minItems: 1, maxItems: SUIVI_MAX_BETS, description: "Their weights, rationals n/d of sum 1." },
  },
};
const SUIVI_UNIT: JsonObject = { type: "string", maxLength: SUIVI_MAX_TEXT, description: "A rational n/d in (0, 1)." };
/** The closed tracking policy of a cell (packages/hikae/src/suivi/policy.ts): its 22 keys; assertSuiviPolicy refuses any other. */
const SUIVI_POLICY_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["schema", "task_class", "cell_key", "population", "policy_version", "a", "delta_adm", "delta_exh", "alpha_arl", "m", "eta_m1",
    "sr_reading_threshold", "restart_weights", "bets_k", "bets_w", "bets_sr", "grace_steps", "grid_ms", "l_ms", "thin_window", "thin_min", "keyring"],
  description: "The cell's closed tracking policy (hikae-suivi-policy-v1); its task_class must be the request's class, and its cell_key the verdict's cell, or on the BYO path (params.calibration, whose verdict names no cell) the request's predictor_id.",
  properties: {
    schema: { type: "string", enum: ["hikae-suivi-policy-v1"] },
    task_class: { type: "string", minLength: 1 },
    cell_key: { type: "string", minLength: 1 },
    population: { type: "string", minLength: 1 },
    policy_version: { type: "integer", minimum: 1 },
    a: SUIVI_UNIT,
    delta_adm: { ...SUIVI_UNIT, description: "The licence level of the test K, a rational n/d in (0, 1)." },
    delta_exh: { ...SUIVI_UNIT, description: "The closure level of the test W, a rational n/d in (0, 1)." },
    alpha_arl: { ...SUIVI_UNIT, description: "The alarm level of the detector, a rational n/d in (0, 1)." },
    m: { ...SUIVI_UNIT, description: "The detector's reference rate, the text of a." },
    eta_m1: SUIVI_UNIT,
    sr_reading_threshold: { type: "string", maxLength: SUIVI_MAX_TEXT, description: "An integer n >= 2, the threshold of the published reading." },
    restart_weights: { type: "string", enum: ["1/(j(j+1))"] },
    bets_k: SUIVI_BETS_SCHEMA,
    bets_w: SUIVI_BETS_SCHEMA,
    bets_sr: SUIVI_BETS_SCHEMA,
    grace_steps: { type: "integer", minimum: 0 },
    grid_ms: { type: "integer", minimum: 1, description: "The evaluation grid: one evaluation per horizon." },
    l_ms: { type: "integer", minimum: 1 },
    thin_window: { type: "integer", minimum: 1 },
    thin_min: { type: "integer", minimum: 0 },
    keyring: {
      type: "array",
      maxItems: 16,
      description: "Declared keys; no signature is read by the gate.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key_id", "public_key_hex", "from_seq"],
        properties: { key_id: { type: "string" }, public_key_hex: { type: "string" }, from_seq: { type: "integer", minimum: 0 } },
      },
    },
  },
};
/** OPTIONAL `suivi` (step 6 of ROADMAP.md): the cell's tracking evidence, carried by the caller and replayed by the gate. */
const SUIVI_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["policy", "evaluations", "outcomes", "open"],
  description: `OPTIONAL tracking evidence of the cell (step 6): the gate replays it from the start and reads B_t = min(remainingBudget, the replayed budget), -1 with no licence or after a closure. It only lowers B_t; no signature is read and nothing is stored. The replay is bounded: the number of evaluations times the bits of the common denominator of the policy's K and W betting factors is at most ${String(SUIVI_MAX_WORK_BITS)}, or the call is refused (param_invalid).`,
  properties: {
    policy: SUIVI_POLICY_SCHEMA,
    evaluations: {
      type: "array",
      maxItems: SUIVI_MAX_N,
      description: "The cell's reference evaluations from its start, in seq order, one per horizon on the policy's grid.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["seq", "t_step_ms", "yhat_ref", "produced_at_ref", "pre_member"],
        properties: {
          seq: { type: "integer", minimum: 0 },
          t_step_ms: { type: "integer" },
          yhat_ref: { type: "string" },
          produced_at_ref: { type: "string" },
          pre_member: { type: "boolean" },
        },
      },
    },
    outcomes: {
      type: "array",
      maxItems: SUIVI_MAX_N,
      description: "Their arrived outcomes; an evaluation whose outcome has not arrived stops the entry of the labels after it.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["seq", "resolved", "member", "miss"],
        properties: {
          seq: { type: "integer", minimum: 0 },
          resolved: { type: "boolean" },
          member: { type: "boolean" },
          miss: { type: "integer", enum: [0, 1] },
        },
      },
    },
    open: { type: "boolean", description: "The starting state of the cell's segment: open, or waiting for the licence of the test K." },
  },
};

/** Non-frozen gate parameters (caller-carried). Declared here, never in schemas/.
 *  The OPTIONAL `calibration` object opens the BYO loop — the caller supplies its
 *  own nonconformity `scores` + a `mode` (interval|set), and the gate conformalizes against THOSE scores
 *  instead of a committed class. It stays OUT of `required` so the existing committed-class calls
 *  (cascade, USDe, liq) remain valid. `maxItems: CALIBRATE_MAX_N` bounds both `scores` and `candidates`
 *  at the SDK boundary (the bound of calibrate); `gate.ts` re-validates below the boundary. */
export const PARAMS_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["remainingBudget", "bFloor", "tau", "tauInterval", "alpha", "nMin", "intent", "tool", "clockOpen"],
  properties: {
    remainingBudget: { type: "number", description: "B_t — remaining authorization capacity (caller-owned: the server keeps no state)." },
    bFloor: { type: "number", description: "B_floor threshold (>= 0)." },
    tau: { type: "number", description: "Set-size threshold for the `set` path (>= 0)." },
    tauInterval: { type: "number", description: "Width threshold for the `interval` path (>= 0)." },
    alpha: { type: "number", description: "Target miscoverage in (0,1)." },
    nMin: { type: "integer", description: "Minimum calibration count (>= 1)." },
    intent: { type: ["string", "number", "null"], description: "The intent tested against the region." },
    tool: { type: "string", description: "The NAMED gated tool (echoed, never invoked)." },
    clockOpen: { type: "boolean", description: "Whether the coverage window is still open (caller-owned)." },
    calibration: {
      type: "object",
      additionalProperties: false,
      required: ["scores", "mode"],
      description: "OPTIONAL BYO calibration: caller-supplied nonconformity scores + region mode. Present ⇒ the gate conformalizes on the caller's model, not a committed class.",
      properties: {
        scores: { type: "array", items: { type: "number" }, maxItems: CALIBRATE_MAX_N, description: "Caller-supplied nonconformity scores (interval mode requires all >= 0)." },
        mode: { type: "string", enum: ["interval", "set"], description: "`interval` ⇒ region [yhat - q̂, yhat + q̂]; `set` ⇒ conformal set over `candidates`." },
        candidates: {
          type: "array",
          maxItems: CALIBRATE_MAX_N,
          description: "Set-mode candidate labels with their nonconformity scores (required and non-empty when mode = set).",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["label", "score"],
            properties: {
              label: { type: "string", description: "Candidate label (printable ASCII, unique, no `|`)." },
              score: { type: "number", description: "The candidate's nonconformity score." },
            },
          },
        },
        aci: {
          type: "object",
          additionalProperties: false,
          required: ["gamma", "window", "decided_after"],
          description: "OPTIONAL online level of the class: `scores` then holds every arrived score in arrival order, the gate replays them and the region is the quantile of the last `window` scores at the current level. Absent ⇒ the split quantile of all `scores`.",
          properties: {
            gamma: { type: "number", exclusiveMinimum: 0, exclusiveMaximum: 1, description: "The step of the level, in (0,1)." },
            window: { type: "integer", minimum: 1, description: "How many of the last arrived scores the quantile reads." },
            decided_after: { type: "array", items: { type: "integer", minimum: 0 }, maxItems: CALIBRATE_MAX_N, description: "For each score, how many scores had arrived when its signal was decided: an integer from 0 to its own index; 0 marks a score that only calibrates." },
          },
        },
      },
    },
    suivi: SUIVI_SCHEMA,
  },
};

/**
 * Projected tool INPUT schema (envelope). `properties.prediction` is the frozen
 * Prediction (stripped); `properties.attested` is the frozen `AttestedPrice` (stripped, the SAME mechanism
 * as `prediction`, byte-for-byte). `attested` is OPTIONAL, so `required` stays `["prediction","params"]` and
 * a `{prediction, params}` call is byte-identical (guarded by `gate_attested_is_frozen_attested_price`).
 */
export const TOOL_INPUT_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["prediction", "params"],
  properties: {
    prediction: stripMeta(PREDICTION_SCHEMA),
    params: PARAMS_SCHEMA,
    attested: stripMeta(ATTESTED_PRICE_SCHEMA),
  },
};

/** Projected tool OUTPUT schema = frozen GateDecision with the CoverageVerdict `$ref` dereferenced. */
export const TOOL_OUTPUT_SCHEMA: JsonObject = derefVerdict(GATE_DECISION_SCHEMA, COVERAGE_VERDICT_SCHEMA);

/**
 * The most validator errors one refusal names; the others are counted. The validator reports every fault of a body, up to 5 for one
 * empty list element, and the SDK joins them into the message of its ONE issue, which the mirror serves in `issues` and MCP as its error
 * text: a body of 498 KB answered 64 MB on both. At 100, only a long list is cut: a body with every field wrong and one element per
 * list holds 86 errors (judge, measured 2026-11-06).
 */
const MAX_INPUT_ERRORS = 100;
/** Where ajv's `errorsText` joins two errors, each `data<path> <message>`. The text comes from the schema, never from the caller's
 *  data: an input schema has no open map, so no caller's key reaches a path, and none holds this sequence. */
const INPUT_ERROR_BOUNDARY = /, (?=data[/ ])/;

function capInputErrors(message: string): string {
  const errors = message.split(INPUT_ERROR_BOUNDARY);
  const omitted = errors.length - MAX_INPUT_ERRORS;
  return omitted > 0 ? `${errors.slice(0, MAX_INPUT_ERRORS).join(", ")}, and ${String(omitted)} more omitted` : message;
}

/** The SDK Standard Schema of a tool INPUT, the one object both surfaces validate with: what it accepts and the JSON Schema it
 *  publishes are `fromJsonSchema`'s, and its refusal names at most MAX_INPUT_ERRORS errors. */
function cappedInputSchema(schema: JsonObject): StandardSchemaWithJSON {
  const standard = fromJsonSchema(schema as unknown as JsonSchemaType)["~standard"];
  return {
    "~standard": {
      ...standard,
      validate: async (value) => {
        const result = await standard.validate(value);
        return result.issues === undefined ? result : { issues: result.issues.map((issue) => ({ ...issue, message: capInputErrors(issue.message) })) };
      },
    },
  };
}

/** SDK Standard Schemas built from the projected JSON (the actual `registerTool` arguments). */
export const toolInputStandardSchema: StandardSchemaWithJSON = cappedInputSchema(TOOL_INPUT_SCHEMA);
export const toolOutputStandardSchema: StandardSchemaWithJSON = fromJsonSchema(TOOL_OUTPUT_SCHEMA as unknown as JsonSchemaType);

// ---------------------------------------------------------------------------- calibrate

/**
 * calibrate INPUT: the NON-frozen BYO score array plus `alpha` and `nMin`. Declared HERE,
 * never in schemas/, as the gate `params` are. `maxItems` bounds the
 * score count at the SDK boundary, the first line of the fail-closed cap that
 * `runCalibrate` also enforces below the boundary (belt-and-suspenders).
 */
export const CALIBRATE_INPUT_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["scores", "alpha", "nMin"],
  properties: {
    scores: {
      type: "array",
      description: "Caller-supplied nonconformity scores (BYO: the caller owns the score function; MONARK stays agnostic).",
      maxItems: CALIBRATE_MAX_N, // Resource cap: bound the score count at the SDK boundary.
      items: { type: "number" },
    },
    alpha: { type: "number", description: "Target miscoverage in the open interval (0,1)." },
    nMin: { type: "integer", description: "Minimum calibration count (>= 1); n < nMin fails closed to under_calib." },
  },
};

/**
 * calibrate OUTPUT (NON-frozen envelope): declared
 * HERE, never in schemas/. `reason` is IN the schema so `additionalProperties:false` accepts the
 * fail-closed shape; `qhat` is nullable (number on success, null on under_calib). `label` is the
 * honesty carrier (outside any frozen contract). `scores_sha256` is the
 * 64-hex `scoresSha256`.
 */
export const CALIBRATE_OUTPUT_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["qhat", "n", "alpha", "method", "scores_sha256", "label", "reason"],
  properties: {
    qhat: { type: ["number", "null"], description: "The conformal quantile q̂, or null when the calibration is insufficient (fail-closed)." },
    n: { type: "integer", description: "The number of supplied scores (echoed)." },
    alpha: { type: "number", description: "The target miscoverage (echoed)." },
    method: { const: "split", description: "The conformal method — always split." },
    scores_sha256: { type: "string", pattern: "^[0-9a-f]{64}$", description: "scoresSha256(scores) in the caller's order: the audit tie to verdict.scores_sha256." },
    label: { type: "string", description: "Honesty label: the marginal coverage holds only under exchangeability with the supplied scores." },
    reason: { type: ["string", "null"], description: "under_calib when q̂ is null, else null on success." },
  },
};

/** SDK Standard Schemas for the calibrate tool (`registerTool` arguments). */
export const calibrateInputStandardSchema: StandardSchemaWithJSON = cappedInputSchema(CALIBRATE_INPUT_SCHEMA);
export const calibrateOutputStandardSchema: StandardSchemaWithJSON = fromJsonSchema(CALIBRATE_OUTPUT_SCHEMA as unknown as JsonSchemaType);

// ---------------------------------------------------------------------------- judge (step 5 of ROADMAP.md)

/** A name of the frames (apps/genkan/src/frame.ts). */
const JUDGE_NAME: JsonObject = { type: "string", pattern: JUDGE_NAME_PATTERN };
/** An integer as a decimal string; the frames refuse one at or above 2^128 (a tool error `param_invalid`). */
const JUDGE_DECIMAL: JsonObject = { type: "string", pattern: JUDGE_DECIMAL_PATTERN };

/**
 * judge INPUT: the gate's envelope (the same `prediction`, `params` and optional `attested` as TOOL_INPUT_SCHEMA), plus the
 * `order` and the caller's `limits`. Declared here, never in schemas/. The SWAP rule (`assetOut` and `minOut` a SWAP's, and
 * only a SWAP's), a name listed twice in `limits.assets` and an integer at or above 2^128 are refused by the frames, below the
 * boundary.
 */
export const JUDGE_INPUT_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["prediction", "params", "order", "limits"],
  properties: {
    ...asObject(TOOL_INPUT_SCHEMA["properties"] ?? null, "gate input properties"),
    order: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "target", "asset", "amount"],
      description: "The order to judge (GNK1). `assetOut` and `minOut` are a SWAP's, and only a SWAP's.",
      properties: {
        kind: { type: "string", enum: [...JUDGE_ORDER_KINDS], description: "TRANSFER and APPROVE are always denied; EXIT passes on a listed venue whatever the action." },
        target: { ...JUDGE_NAME, description: "The venue the order targets." },
        asset: { ...JUDGE_NAME, description: "The asset the order moves." },
        amount: { ...JUDGE_DECIMAL, description: "The amount the order moves, in the asset's base units." },
        assetOut: { ...JUDGE_NAME, description: "A SWAP's asset out." },
        minOut: { ...JUDGE_DECIMAL, description: "A SWAP's least amount out; above 0 to pass, and not a slippage bound." },
      },
    },
    limits: {
      type: "object",
      additionalProperties: false,
      required: ["venues", "assets"],
      description: "The caller's limits the kernel holds the order to.",
      properties: {
        venues: { type: "array", items: JUDGE_NAME, maxItems: JUDGE_LIST_MAX, uniqueItems: true, description: "The venues an order may target." },
        assets: {
          type: "array",
          maxItems: JUDGE_LIST_MAX,
          description: "The assets an order may move, each named once, with its cap.",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["asset", "cap"],
            properties: {
              asset: JUDGE_NAME,
              cap: { ...JUDGE_DECIMAL, description: "The most one order may move, in the asset's base units: per order, not a total." },
            },
          },
        },
      },
    },
  },
};

/** judge OUTPUT: the gate's GateDecision (TOOL_OUTPUT_SCHEMA), the kernel's verdict, and the sha256 of the request it was handed. */
export const JUDGE_OUTPUT_SCHEMA: JsonObject = {
  type: "object",
  additionalProperties: false,
  required: ["decision", "gate_error", "kernel_verdict", "kernel_reason", "reduce_only", "kernel_request_sha256"],
  properties: {
    // null: an EXIT whose envelope the gate refused, judged with no gate decision.
    decision: { oneOf: [TOOL_OUTPUT_SCHEMA, { type: "null" }] },
    gate_error: {
      oneOf: [
        { type: "object", additionalProperties: false, required: ["code", "message"], properties: { code: { enum: [...TOOL_ERROR_CODES] }, message: { type: "string" } } },
        { type: "null" },
      ],
    },
    kernel_verdict: { enum: ["allow", "deny"] },
    kernel_reason: { enum: [null, ...JUDGE_REASONS] },
    reduce_only: { type: "boolean" },
    kernel_request_sha256: { type: "string", pattern: "^[0-9a-f]{64}$" },
  },
  allOf: [
    // The verdict ties its fields, as runJudge does: an allow has no reason; a deny has one, and is never reduce_only.
    {
      oneOf: [
        { properties: { kernel_verdict: { const: "allow" }, kernel_reason: { const: null } } },
        { properties: { kernel_verdict: { const: "deny" }, kernel_reason: { enum: [...JUDGE_REASONS] }, reduce_only: { const: false } } },
      ],
    },
    // A gate decision or a gate error, never both and never neither. With no gate decision the order is an EXIT, so an allow is
    // reduce_only (a deny, or reduce_only true).
    {
      oneOf: [
        { properties: { decision: { type: "object" }, gate_error: { type: "null" } } },
        {
          properties: { decision: { type: "null" }, gate_error: { type: "object" } },
          anyOf: [{ properties: { kernel_verdict: { const: "deny" } } }, { properties: { reduce_only: { const: true } } }],
        },
      ],
    },
  ],
};

/** SDK Standard Schemas for the judge tool (the `registerTool` arguments). */
export const judgeInputStandardSchema: StandardSchemaWithJSON = cappedInputSchema(JUDGE_INPUT_SCHEMA);
export const judgeOutputStandardSchema: StandardSchemaWithJSON = fromJsonSchema(JUDGE_OUTPUT_SCHEMA as unknown as JsonSchemaType);
