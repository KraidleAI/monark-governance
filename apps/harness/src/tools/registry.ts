/**
 * Harness — tool REGISTRY (ADR-M005 D1/D9/D11, K-8).
 *
 * The registry is DATA (`HARNESS_TOOLS`) so the closed allowlist and the descriptions are inspectable
 * without standing up a server (the K-8 oracle and the vocab oracle read this table directly).
 *
 * `ALLOWED_TOOL_NAMES` is the closed universe of the surface (`attest`·`gate`·`cascade`·`calibrate`). H1
 * wired `gate`, H2 added `cascade`, H3 added `attest` (the MVP terminal set, ADR-M005 D9); and
 * `calibrate`, the 4th pure primitive — the set terminal 3→4 EXPANSION ratified by a product decision and
 * carried by ADR-M007 (+ ADR-M005 Addendum D14). The K-8 oracle asserts BOTH: (a) the CLOSED ALLOWLIST
 * `REGISTERED_TOOL_NAMES ⊆ ALLOWED_TOOL_NAMES` (never a tool outside the four), and (b) the EXACT set —
 * now `=== {attest,gate,cascade,calibrate}`, the ADR-M007 TERMINAL state (each earlier stage asserted its
 * own exact set on the way here). Plus a static side-effect scan of `src/tools/**`.
 *
 * Like everything under `src/tools/`, this file does no I/O: it imports the frozen-schema PROJECTION
 * (`../schema-projection.ts`, which owns the one `node:fs` read at load) and the pure gate logic; it
 * never touches `node:fs`/`node:net`/`node:child_process`/`fetch`/`process.env`.
 */
import type { McpServer, StandardSchemaWithJSON } from "@modelcontextprotocol/server";
import type { Prediction } from "@monark/contracts";
import { toolInputStandardSchema, toolOutputStandardSchema, TOOL_INPUT_SCHEMA, TOOL_OUTPUT_SCHEMA } from "../schema-projection.ts";
import { cascadeInputStandardSchema, cascadeOutputStandardSchema, CASCADE_INPUT_SCHEMA, CASCADE_OUTPUT_SCHEMA } from "../schema-projection.ts";
import type { Json } from "../schema-projection.ts";
import { attestInputStandardSchema, attestOutputStandardSchema, ATTEST_INPUT_SCHEMA, ATTEST_OUTPUT_SCHEMA } from "../schema-projection.ts";
import { calibrateInputStandardSchema, calibrateOutputStandardSchema, CALIBRATE_INPUT_SCHEMA, CALIBRATE_OUTPUT_SCHEMA } from "../schema-projection.ts";
import { runGate, honestyText, GATE_TOOL_NAME, GATE_TOOL_DESCRIPTION, type HarnessParams } from "./gate.ts";
import { runCascade, cascadeHonestyText, CASCADE_TOOL_NAME, CASCADE_TOOL_DESCRIPTION, type CascadeInput } from "./cascade.ts";
import { runAttest, attestHonestyText, ATTEST_TOOL_NAME, ATTEST_TOOL_DESCRIPTION } from "./attest.ts";
import { runCalibrate, calibrateHonestyText, CALIBRATE_TOOL_NAME, CALIBRATE_TOOL_DESCRIPTION, type CalibrateInput } from "./calibrate.ts";

/** Closed universe of the tool surface (ADR-M005 D1, EXPANDED by ADR-M007 to the terminal set of 4). */
export const ALLOWED_TOOL_NAMES = ["attest", "gate", "cascade", "calibrate"] as const;
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
  /** Per-tool projected SDK schemas (H2): each tool owns its own input/output shape (gate: envelope
   *  -> GateDecision; cascade: FinancialSystem -> Prediction). registerTools no longer hardcodes one. */
  readonly inputStandardSchema: StandardSchemaWithJSON;
  readonly outputStandardSchema: StandardSchemaWithJSON;
  /** Executes the tool: caller-carried args (validated at the SDK boundary) → structured content + text. */
  readonly run: (args: unknown) => { readonly text: string; readonly structured: Record<string, unknown> };
}

/** The tools registered by THIS lot's cumulative state (H1: `gate`; H2: `cascade`; H3: `attest`; C1:
 *  `calibrate` — the terminal set {attest,gate,cascade,calibrate}, ADR-M007). */
export const HARNESS_TOOLS: readonly HarnessToolDescriptor[] = [
  {
    name: GATE_TOOL_NAME,
    description: GATE_TOOL_DESCRIPTION,
    inputSchemaJson: TOOL_INPUT_SCHEMA,
    outputSchemaJson: TOOL_OUTPUT_SCHEMA,
    inputStandardSchema: toolInputStandardSchema,
    outputStandardSchema: toolOutputStandardSchema,
    run: (args) => {
      const env = args as GateEnvelope;
      const decision = runGate(env.prediction, env.params);
      // structuredContent = the closed GateDecision ONLY (K-1); honesty prose rides in `content` text.
      // B-1: the honesty text is keyed on the PRESENCE of a BYO calibration, not task_class alone.
      return { text: honestyText(env.prediction.task_class, env.params.calibration !== undefined), structured: decision as unknown as Record<string, unknown> };
    },
  },
  {
    name: CASCADE_TOOL_NAME,
    description: CASCADE_TOOL_DESCRIPTION,
    inputSchemaJson: CASCADE_INPUT_SCHEMA,
    outputSchemaJson: CASCADE_OUTPUT_SCHEMA,
    inputStandardSchema: cascadeInputStandardSchema,
    outputStandardSchema: cascadeOutputStandardSchema,
    run: (args) => {
      const input = args as CascadeInput;
      const prediction = runCascade(input);
      // structuredContent = the closed Prediction ONLY (K-1); honesty prose rides in `content` text.
      return { text: cascadeHonestyText(), structured: prediction as unknown as Record<string, unknown> };
    },
  },
  {
    name: ATTEST_TOOL_NAME,
    description: ATTEST_TOOL_DESCRIPTION,
    inputSchemaJson: ATTEST_INPUT_SCHEMA,
    outputSchemaJson: ATTEST_OUTPUT_SCHEMA,
    inputStandardSchema: attestInputStandardSchema,
    outputStandardSchema: attestOutputStandardSchema,
    run: () => {
      // No caller input: the witness is the committed internal fixture (ADR-M005 H3).
      const output = runAttest();
      // structuredContent = the K-1 envelope {price, provenance, label}; `price` alone is the frozen
      // contract, label/provenance ride OUTSIDE it. Honesty prose rides in `content` text (K-1).
      return { text: attestHonestyText(), structured: output as unknown as Record<string, unknown> };
    },
  },
  {
    name: CALIBRATE_TOOL_NAME,
    description: CALIBRATE_TOOL_DESCRIPTION,
    inputSchemaJson: CALIBRATE_INPUT_SCHEMA,
    outputSchemaJson: CALIBRATE_OUTPUT_SCHEMA,
    inputStandardSchema: calibrateInputStandardSchema,
    outputStandardSchema: calibrateOutputStandardSchema,
    run: (args) => {
      const input = args as CalibrateInput;
      const result = runCalibrate(input);
      // structuredContent = the calibrate envelope {qhat,n,alpha,method,set_digest,label,reason}; the
      // K-1 honesty label rides IN the output (carrier 3/3, ADR-M007 D3/D5) and ALSO in `content` text.
      return { text: calibrateHonestyText(), structured: result as unknown as Record<string, unknown> };
    },
  },
];

/** The names actually registered (C1: `["gate","cascade","attest","calibrate"]` — terminal set, ADR-M007). */
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
        inputSchema: tool.inputStandardSchema,
        outputSchema: tool.outputStandardSchema,
      },
      (args: unknown) => {
        const { text, structured } = tool.run(args);
        return { content: [{ type: "text" as const, text }], structuredContent: structured };
      },
    );
  }
}
