/**
 * schemas/tool-error.schema.json (contract 1.1.0, block C, lot CM-3c-2; decision Q-C5, condition 1): three closed bodies by `error` and
 * $defs/InternalError; the 29 codes of tool_error in the order of TOOL_ERROR_CODES (block A), and the four bodies carry exactly the 32.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { TOOL_ERROR_CODES } from "../src/tool-error-codes.ts";

type Body = { properties: { error: { const: string }; code?: { const?: string; enum?: string[] } } };
const FILE = new URL("../../../schemas/tool-error.schema.json", import.meta.url), ABSENT = { type: "object", properties: { error: { const: "absent" } } }; // fails by assertion
const SCHEMA = (existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : { oneOf: [ABSENT], $defs: { InternalError: ABSENT } }) as { oneOf: Body[]; $defs: { InternalError: Body } };
const require = createRequire(import.meta.url);
const Ajv = (require("ajv/dist/2020.js") as { default: new (o: object) => { compile: (s: unknown) => (v: unknown) => boolean } }).default;
const root = new Ajv({ strict: true }).compile(SCHEMA);
const internal = new Ajv({ strict: true }).compile({ ...SCHEMA, oneOf: undefined, $ref: "#/$defs/InternalError" });
const codesOf = (b: Body): string[] => b.properties.code?.enum ?? [b.properties.code?.const ?? "none"];

// killer: schemas/tool-error.schema.json:11 CONST "\"attest_refused\", " -> ""
test("tool_error_schema_codes_equal_the_closed_catalogue", () => {
  assert.deepEqual(SCHEMA.oneOf.map((b) => b.properties.error.const), ["tool_error", "invalid_input", "invalid_json"]);
  const [tool, input, json] = SCHEMA.oneOf.map(codesOf) as [string[], string[], string[]];
  assert.deepEqual(tool, TOOL_ERROR_CODES.filter((c) => !["output_invalid", "input_invalid", "json_invalid"].includes(c)), "29 codes, catalogue order");
  assert.deepEqual([tool.length, input, json, codesOf(SCHEMA.$defs.InternalError)], [29, ["input_invalid"], ["json_invalid"], ["output_invalid"]]);
  assert.deepEqual([...tool, ...input, ...json, ...codesOf(SCHEMA.$defs.InternalError)].sort(), [...TOOL_ERROR_CODES].sort(), "exactly the 32");
});

// killer: schemas/tool-error.schema.json:15 CONST "\"code\", \"issues\"]" -> "\"code\"]"
test("tool_error_schema_branches_by_error", () => {
  const op = { operation: "gate", message: "m" };
  for (const ok of [{ error: "tool_error", ...op, code: "param_invalid" }, { error: "invalid_input", ...op, code: "input_invalid", issues: [{ any: 1 }] }, { error: "invalid_json", ...op, code: "json_invalid" }]) assert.ok(root(ok), JSON.stringify(ok));
  for (const bad of [
    { error: "tool_error", ...op, code: "input_invalid" }, { error: "tool_error", ...op, code: "output_invalid" }, { error: "tool_error", ...op, code: "unknown" },
    { error: "invalid_input", ...op, code: "input_invalid" }, { error: "invalid_json", ...op, code: "json_invalid", issues: [] }, { error: "tool_error", ...op, code: "param_invalid", x: 1 },
    { error: "tool_error", operation: "", message: "m", code: "param_invalid" }, { error: "internal_error", operation: "gate" }, { error: "not_found", path: "/x" }, { error: "method_not_allowed", method: "PUT" },
    { error: "tool_error", operation: "gate", code: "param_invalid" }, { error: "invalid_json", operation: "gate", code: "json_invalid" }, { error: "invalid_input", ...op, message: 1, code: "input_invalid", issues: [] }, { error: "tool_error", ...op, message: 1, code: "param_invalid" }, { error: "invalid_json", ...op, message: 1, code: "json_invalid" }, { error: "invalid_input", ...op, code: "input_invalid", issues: {} },
  ]) assert.equal(root(bad), false, JSON.stringify(bad));
  assert.deepEqual([...[undefined, "output_invalid", "param_invalid"].map((code) => internal({ error: "internal_error", operation: "gate", code })), internal({ error: "internal_error" }), internal({ error: "internal_error", operation: "gate", x: 1 })], [true, true, false, false, false]);
});
