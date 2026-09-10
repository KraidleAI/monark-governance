/**
 * Harness — tool REGISTRY (ADR-M005 D1/D9/D11, K-8).
 *
 * The registry is DATA (`HARNESS_TOOLS`) so the closed allowlist and the descriptions are inspectable
 * without standing up a server (the K-8 oracle and the vocab oracle read this table directly).
 *
 * `ALLOWED_TOOL_NAMES` is the closed universe of the MVP surface (`attest`·`gate`·`cascade`, D1). In
 * H1 only `gate` is wired; H2/H3 add `cascade`/`attest`. The K-8 oracle asserts BOTH: (a) the CLOSED
 * ALLOWLIST `REGISTERED_TOOL_NAMES ⊆ ALLOWED_TOOL_NAMES` (never a tool outside the three), and (b) the
 * EXACT per-lot set — H1 registers precisely `["gate"]` (G2 R1). The ADR-M005 D9 literal
 * `=== {attest,gate,cascade}` is the TERMINAL state reached at H3; each lot asserts its own exact set
 * on the way there. Plus a static side-effect scan of `src/tools/**`.
 *
 * Like everything under `src/tools/`, this file does no I/O: it imports the frozen-schema PROJECTION
 * (`../schema-projection.ts`, which owns the one `node:fs` read at load) and the pure gate logic; it
 * never touches `node:fs`/`node:net`/`node:child_process`/`fetch`/`process.env`.
 */
import type { McpServer } from "@modelcontextprotocol/server";
import type { Prediction } from "@monark/contracts";
import { toolInputStandardSchema, toolOutputStandardSchema, TOOL_INPUT_SCHEMA, TOOL_OUTPUT_SCHEMA } from "../schema-projection.ts";
import type { Json } from "../schema-projection.ts";
import { runGate, honestyText, GATE_TOOL_NAME, GATE_TOOL_DESCRIPTION, type HarnessParams } from "./gate.ts";

/** Closed universe of the MVP tool surface (ADR-M005 D1). */
export const ALLOWED_TOOL_NAMES = ["attest", "gate", "cascade"] as const;
export type AllowedToolName = (typeof ALLOWED_TOOL_NAMES)[number];

/** The tool input envelope (D8): frozen `Prediction` + non-frozen params. */
export interface GateEnvelope {
  readonly prediction: Prediction;
  readonly params: HarnessParams;
}

export interface HarnessToolDescriptor {
  readonly name: AllowedToolName;
  readonly description: string;
  readonly inputSchemaJson: Json;
  readonly outputSchemaJson: Json;
  /** Executes the tool: caller-carried envelope → closed decision (structured content). */
  readonly run: (env: GateEnvelope) => { readonly text: string; readonly structured: Record<string, unknown> };
}

/** The tools registered in THIS lot (H1: `gate` only). */
export const HARNESS_TOOLS: readonly HarnessToolDescriptor[] = [
  {
    name: GATE_TOOL_NAME,
    description: GATE_TOOL_DESCRIPTION,
    inputSchemaJson: TOOL_INPUT_SCHEMA,
    outputSchemaJson: TOOL_OUTPUT_SCHEMA,
    run: (env) => {
      const decision = runGate(env.prediction, env.params);
      // structuredContent = the closed GateDecision ONLY (K-1); honesty prose rides in `content` text.
      return { text: honestyText(env.prediction.task_class), structured: decision as unknown as Record<string, unknown> };
    },
  },
];

/** The names actually registered (H1: `["gate"]`). */
export const REGISTERED_TOOL_NAMES: readonly string[] = HARNESS_TOOLS.map((t) => t.name);

/**
 * Register every harness tool on a fresh `McpServer` instance (the stateless per-request factory, D6).
 * Input/output are the PROJECTED frozen schemas (D8); the SDK enforces `additionalProperties:false`
 * at the boundary (measured), and `runGate` re-asserts the closed contract on the way out (D9).
 */
export function registerTools(server: McpServer): void {
  for (const tool of HARNESS_TOOLS) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: toolInputStandardSchema,
        outputSchema: toolOutputStandardSchema,
      },
      (args: unknown) => {
        const env = args as GateEnvelope;
        const { text, structured } = tool.run(env);
        return { content: [{ type: "text" as const, text }], structuredContent: structured };
      },
    );
  }
}
