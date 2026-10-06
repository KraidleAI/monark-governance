/**
 * Harness — HTTP/JSON MIRROR of the MCP surface (ADR-M005 D7/D8).
 *
 * The SAME four operations (attest, gate, cascade, calibrate), the SAME frozen input/output schemas
 * (`schema-projection.ts` / the registry), exposed as plain JSON: `POST /{tool}` with a JSON body ->
 * a JSON response mirroring the MCP `CallToolResult` (`{ structuredContent, content }`). The mirror is
 * DERIVED from the SAME `HARNESS_TOOLS` registry the MCP server registers, so the two surfaces cannot
 * drift: the route set IS `REGISTERED_TOOL_NAMES`, and input is validated with the SAME projected
 * standard schema the MCP boundary uses — a present-but-invalid body (extra key, missing field, wrong
 * type) is a `400`, mirroring how the MCP boundary rejects it, never a silent result.
 *
 * `structuredContent` is byte-identical to the MCP `structuredContent` (the frozen, closed contract for
 * gate/cascade; the K-1 envelope for attest); the honesty prose rides in `content`, OUTSIDE the frozen
 * contract (K-1) — the frozen output is `additionalProperties:false` and can carry no note.
 *
 * NO side effects, NO secret: this module composes the pure registry tools, reads no env var, opens no
 * socket (server.ts owns the one 127.0.0.1 listener), and makes no network call. Routing (by Host:
 * `api.` -> here, `mcp.`/default -> the MCP handler) and the Origin guard (K-9, on BOTH surfaces) live in
 * server.ts, applied BEFORE this handler.
 */
import { HARNESS_TOOLS, REGISTERED_TOOL_NAMES } from "./tools/registry.ts";
import type { HarnessToolDescriptor } from "./tools/registry.ts";
import { buildOpenApi } from "./openapi.ts";
import { toolErrorCode, type HarnessErrorCode } from "./tools/gate.ts";

const JSON_HEADERS = { "content-type": "application/json" } as const;

/** Tool descriptor by name — the mirror's route table IS the MCP registry (no hardcoded route list). */
const TOOL_BY_NAME: ReadonlyMap<string, HarnessToolDescriptor> = new Map(
  HARNESS_TOOLS.map((t) => [t.name, t] as const),
);

/** The operations the JSON mirror serves == exactly the registered MCP tools (no more, no less). */
export const MIRROR_OPERATIONS: readonly string[] = REGISTERED_TOOL_NAMES;

/** Names of the tool-level errors the pure tools throw - surfaced as `400` with their stable `code` (ADR-CM B-3),
 *  never a `500` with a stack. */
const TOOL_ERROR_NAMES: ReadonlySet<string> = new Set(["HarnessToolError", "CascadeToolError", "AttestToolError", "CalibrateToolError", "UkemiPredictToolError"]);

function json(body: unknown, status = 200, extraHeaders?: Readonly<Record<string, string>>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...(extraHeaders ?? {}) } });
}

/**
 * Serve one JSON-mirror request. `GET /health` (and `/`) -> liveness + operation list; `GET /openapi.json`
 * -> the derived spec; `POST /{tool}` -> validate against the projected schema, run the pure tool, return
 * `{ structuredContent, content }`. A `GET /{tool}` on a KNOWN operation is a wrong method, answered with
 * `405` + `Allow: POST` and a "use POST /{tool}" hint (an unknown path stays `404`), so a caller that GETs
 * self-corrects. The Origin guard is applied by server.ts BEFORE this, identically to the MCP path, so
 * this handler never sees a present-and-invalid Origin. `clock` is the current instant handed to the tool
 * (ADR-CM B-4), read here in src/ (K-8). The output is validated against the tool's output schema before it is
 * sent (ADR-CM B-6): an invalid output is a `500` with code `output_invalid`, never served.
 */
export async function handleJsonMirror(request: Request, clock: () => number = Date.now): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (request.method === "GET") {
    if (pathname === "/health" || pathname === "/") {
      return json({ status: "ok", surface: "http-json-mirror", operations: MIRROR_OPERATIONS });
    }
    if (pathname === "/openapi.json") return json(buildOpenApi());
    // A GET to a known operation path is a wrong METHOD, not a missing route: every tool is served at
    // POST /{tool}. Return 405 (with Allow: POST) and a hint, so a caller that GETs self-corrects instead
    // of reading a bare 404 as "endpoint not deployed". An unknown GET path stays a 404.
    const getName = pathname.replace(/^\/+/, "");
    if (TOOL_BY_NAME.has(getName)) {
      return json(
        { error: "method_not_allowed", operation: getName, message: `use POST /${getName} with a JSON body`, operations: MIRROR_OPERATIONS },
        405,
        { allow: "POST" },
      );
    }
    return json({ error: "not_found", path: pathname }, 404);
  }
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed", method: request.method }, 405, { allow: "POST" });
  }

  const name = pathname.replace(/^\/+/, "");
  const tool = TOOL_BY_NAME.get(name);
  if (tool === undefined) {
    return json({ error: "unknown_operation", operation: name, operations: MIRROR_OPERATIONS }, 404);
  }

  let body: unknown;
  try {
    const text = await request.text();
    body = text.length === 0 ? {} : (JSON.parse(text) as unknown);
  } catch {
    return json({ error: "invalid_json", operation: name, message: `the body of POST /${name} is not JSON`, code: "json_invalid" }, 400);
  }

  // Validate with the SAME projected standard schema the MCP boundary uses (mirror the boundary): a
  // present-but-invalid body (extra key vs additionalProperties:false, missing/typed field) -> 400.
  const validated = await tool.inputStandardSchema["~standard"].validate(body);
  if (validated.issues !== undefined) {
    return json({ error: "invalid_input", operation: name, message: `the body of POST /${name} does not match its input schema`, code: "input_invalid", issues: validated.issues }, 400);
  }

  let result: ReturnType<HarnessToolDescriptor["run"]>;
  try {
    result = tool.run(validated.value, { nowMs: clock() });
  } catch (error) {
    // A tool-level refusal (bad params / refused witness) is a client error, never a leaked stack.
    if (error instanceof Error && TOOL_ERROR_NAMES.has(error.name)) {
      return json({ error: "tool_error", operation: name, message: error.message, code: toolErrorCode(error) }, 400);
    }
    return json({ error: "internal_error", operation: name }, 500);
  }
  // S-15 / B-6: the mirror serves only an output its MCP twin would accept (same projected output schema).
  const checked = await tool.outputStandardSchema["~standard"].validate(result.structured);
  if (checked.issues !== undefined) {
    const code: HarnessErrorCode = "output_invalid";
    return json({ error: "internal_error", operation: name, code }, 500);
  }
  return json({ structuredContent: result.structured, content: [{ type: "text", text: result.text }] });
}
