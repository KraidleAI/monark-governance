/**
 * Harness — OpenAPI 3.1 spec DERIVED from the frozen-projected schemas (ADR-M005 D7/D8, Lot H4).
 *
 * The HTTP/JSON mirror (`src/http.ts`) is a byte-faithful mirror of the MCP surface: the SAME four
 * operations, the SAME frozen input/output schemas (`schema-projection.ts`, projected from the frozen
 * `schemas/*.json`, NEVER re-written by hand — D8). This module assembles those projected schemas into an
 * OpenAPI 3.1 document. OpenAPI 3.1 adopts JSON Schema 2020-12 as its schema dialect, so the projected
 * schemas are embedded VERBATIM (they already had `$schema`/`$id`/`description`/`title` stripped by
 * `stripMeta`, so no dialect/annotation keys leak onto the external surface).
 *
 * It is NEVER hand-authored: the spec is a pure function of the registry descriptors and the projected
 * schemas, so a drift in a frozen contract flows through the projection into this spec. The drift is
 * checked INDEPENDENTLY by `openapi_generated_matches_frozen_schemas` (test 43): it re-reads the frozen
 * files and asserts every operation's frozen-derived `required` set survives into the generated spec.
 *
 * No I/O, no secret: it composes the pure registry (`HARNESS_TOOLS`), which itself does one frozen-schema
 * read at load via `schema-projection.ts` (never here, never in a tool).
 */
import { HARNESS_TOOLS } from "./tools/registry.ts";
import type { Json } from "./schema-projection.ts";

type JsonObject = { [k: string]: Json };

export const OPENAPI_VERSION = "3.1.0";
export const OPENAPI_INFO_VERSION = "1.0.0";
/** Public JSON base URL (the `api.` sub-domain fronted by Caddy -> 127.0.0.1:3001, ADR-M005 D7/D10). */
export const API_SERVER_URL = "https://api.monarkgate.tech";

/**
 * The JSON envelope every mirror operation returns — the MCP `CallToolResult` shape reduced to JSON:
 * `structuredContent` is the FROZEN contract (byte-identical to the MCP `structuredContent`), and
 * `content` carries the honesty prose OUTSIDE the frozen contract (K-1). `outputSchema` is embedded
 * verbatim at `properties.structuredContent`, so the frozen `required` set is reachable by test 43.
 */
function resultEnvelopeSchema(outputSchema: Json): JsonObject {
  return {
    type: "object",
    additionalProperties: false,
    required: ["structuredContent", "content"],
    properties: {
      structuredContent: outputSchema,
      content: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "text"],
          properties: {
            type: { const: "text" },
            text: { type: "string" },
          },
        },
      },
    },
  };
}

/**
 * Build the OpenAPI 3.1 document for the JSON-mirror operations. One `POST /{tool}` per registered
 * tool (the path set == the registry, so the spec cannot advertise an operation the mirror does not
 * serve). Request body = the tool's projected input schema; the 200 response = the result envelope over
 * the tool's projected output schema. Descriptions reuse the vocab-clean, English tool descriptions.
 */
export function buildOpenApi(): JsonObject {
  const paths: JsonObject = {};
  for (const tool of HARNESS_TOOLS) {
    paths["/" + tool.name] = {
      post: {
        operationId: tool.name,
        summary: `Run the ${tool.name} operation (JSON mirror of the MCP tool).`,
        description: tool.description,
        requestBody: {
          required: true,
          content: { "application/json": { schema: tool.inputSchemaJson } },
        },
        responses: {
          "200": {
            description: "The frozen structuredContent plus the honesty content text (K-1).",
            content: { "application/json": { schema: resultEnvelopeSchema(tool.outputSchemaJson) } },
          },
          "400": {
            description: "Input failed the frozen schema, or the tool refused the input (never a silent result).",
          },
          "403": {
            description: "Origin present and not a monarkgate.tech origin (K-9).",
          },
        },
      },
    };
  }
  return {
    openapi: OPENAPI_VERSION,
    info: {
      title: "MONARK harness — HTTP/JSON mirror",
      version: OPENAPI_INFO_VERSION,
      description:
        "Plain-JSON mirror of the MONARK MCP harness (attest, gate, cascade, calibrate). Same frozen contracts as the " +
        "MCP surface; derived from the frozen schemas, never hand-written. The gate only emits a decision; " +
        "it never calls the named tool.",
    },
    servers: [{ url: API_SERVER_URL }],
    paths,
  };
}
