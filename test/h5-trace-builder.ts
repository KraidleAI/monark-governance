/**
 * Lot H5 shared driver + independent oracle (ADR-M005 §H5, C-6; reworked at step 7 of ROADMAP.md, when attest and
 * cascade were archived). NOT a test file (no `*.test.ts` suffix ⇒ never run by the `test/*.test.ts` glob); imported
 * by BOTH the recorder (`scripts/record-h5-e2e-trace.mjs`) and the probe (`test/h5-e2e-probe.test.ts`), so the demo
 * is generated and verified by ONE code path.
 *
 * It stands the harness up in-process on a real `127.0.0.1` ephemeral listener (`startServer`) and
 * drives the REAL MCP `tools/call` path over the streamable-HTTP transport (an actual JSON-RPC request
 * over the socket, NOT a `tool.run()` call) plus the HTTP/JSON mirror (`api.` Host). `buildTrace()` returns the
 * captured chain; the ephemeral port is DELIBERATELY not recorded so the trace is reproducible.
 *
 * `mcpToolsCall` is the ANTI-MOCK SEAM: the probe's test-chosen perturbation drives it too, so a mutant
 * that replaces it with a frozen/replayed response makes the probe's perturbation assertion go RED.
 */
import { request as httpRequest } from "node:http";
import { createHash } from "node:crypto";
import type { Server as HttpServer, IncomingHttpHeaders } from "node:http";
import { startServer } from "../apps/harness/src/server.ts";
import { startLoopback } from "./helpers/loopback.ts";

export const HOST_MCP = "mcp.monarkgate.tech";
export const HOST_API = "api.monarkgate.tech";
/** MCP streamable-HTTP requires BOTH media types in Accept (else the SDK answers 406). */
export const ACCEPT_MCP = "application/json, text/event-stream";

/** Fixed caller-carried instant — the tools read no clock (D4/D7), so the trace is deterministic. */
export const PRODUCED_AT = "2026-09-04T00:00:00Z";

/** Caller-carried gate params (non-frozen, ADR-M005 D5/D6); `intent`/`remainingBudget` set per call. */
export const GATE_PARAMS = { bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, tool: "perps_order_preview", clockOpen: true } as const;
export const DEMO_REMAINING_BUDGET = 0.1;

/** The committed USDe key of stable-run-velocity-24h (GATE_PARAMS carries its imposed alpha 0.1 and nMin 50): the
 *  committed decision of the trace since btc-dir-15m is retired (ADR-CM B-5, CM-2b). */
export const USDE_PREDICTION = {
  schema_version: "1.1.0",
  task_class: "stable-run-velocity-24h",
  yhat: 0.0001,
  predictor_id: "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
  produced_at: PRODUCED_AT,
} as const;

/** The same served class from a predictor whose calibration is not committed: the gate abstains (under_calib), as
 *  it does for every predictor until its own calibration is committed. */
export const UNCALIBRATED_PREDICTION = {
  schema_version: "1.1.0",
  task_class: "stable-run-velocity-24h",
  yhat: 0.0001,
  predictor_id: "internal:uncalibrated-demo",
  produced_at: PRODUCED_AT,
} as const;

/** The demo calibration: 20 caller-carried scores at alpha 0.1 (rank ceil(21 x 0.9) = 19, so q̂ is the 19th smallest). */
export const DEMO_CALIBRATION = {
  scores: [0.12, 0.05, 0.31, 0.08, 0.22, 0.17, 0.41, 0.03, 0.27, 0.14, 0.09, 0.36, 0.19, 0.11, 0.25, 0.06, 0.33, 0.15, 0.21, 0.29],
  alpha: 0.1,
  nMin: 10,
} as const;

// ---------------------------------------------------------------------------- wire

interface WireResponse { status: number; contentType: string; body: string }

function postOverWire(port: number, hostHeader: string, path: string, body: string, accept: string): Promise<WireResponse> {
  return new Promise((resolve, reject) => {
    const headers = { "content-type": "application/json", "content-length": Buffer.byteLength(body), host: hostHeader, accept };
    const req = httpRequest({ hostname: "127.0.0.1", port, path, method: "POST", headers }, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (c: string) => { raw += c; });
      res.on("end", () => {
        const h: IncomingHttpHeaders = res.headers;
        resolve({ status: res.statusCode ?? 0, contentType: typeof h["content-type"] === "string" ? h["content-type"] : "", body: raw });
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

interface JsonRpcEnvelope { result?: unknown; error?: unknown; id?: unknown }

/** The MCP response is SSE-framed (`event: message\ndata: {json-rpc}`); the mirror is plain JSON. */
function extractJsonRpc(r: WireResponse): JsonRpcEnvelope {
  if (r.contentType.includes("text/event-stream")) {
    const dataLine = r.body.split(/\r?\n/).find((l) => l.startsWith("data:"));
    if (dataLine === undefined) throw new Error(`no SSE data line in MCP response: ${r.body.slice(0, 120)}`);
    return JSON.parse(dataLine.slice("data:".length).trim()) as JsonRpcEnvelope;
  }
  return JSON.parse(r.body) as JsonRpcEnvelope;
}

export interface JsonRpcRequest { jsonrpc: "2.0"; id: number; method: string; params?: unknown }

/** Send one JSON-RPC envelope over the socket to the MCP surface; return the `result` (throws on error). */
export async function mcpSend(port: number, envelope: JsonRpcRequest): Promise<unknown> {
  const r = await postOverWire(port, HOST_MCP, "/", JSON.stringify(envelope), ACCEPT_MCP);
  if (r.status !== 200) throw new Error(`MCP ${envelope.method} status ${String(r.status)}: ${r.body.slice(0, 160)}`);
  const env = extractJsonRpc(r);
  if (env.error !== undefined) throw new Error(`MCP ${envelope.method} error: ${JSON.stringify(env.error)}`);
  return env.result;
}

export interface ToolCallResponse { content: unknown; structuredContent: Record<string, unknown> }

/**
 * ANTI-MOCK SEAM. A real `tools/call` JSON-RPC request over the wire → the tool's `{content,
 * structuredContent}`. buildTrace() and the probe's perturbation BOTH call this; replacing its body
 * with a frozen/replayed response makes the perturbation assertion (`qhat` of scores not in the
 * committed trace) go RED.
 */
export async function mcpToolsCall(port: number, id: number, tool: string, args: unknown): Promise<ToolCallResponse> {
  const result = await mcpSend(port, { jsonrpc: "2.0", id, method: "tools/call", params: { name: tool, arguments: args } });
  return result as ToolCallResponse;
}

/** POST the HTTP/JSON mirror (`api.` Host) for one tool → its `{structuredContent, content}` body. */
export async function mirrorCall(port: number, path: string, body: unknown): Promise<ToolCallResponse> {
  const r = await postOverWire(port, HOST_API, path, JSON.stringify(body), "application/json");
  if (r.status !== 200) throw new Error(`mirror ${path} status ${String(r.status)}: ${r.body.slice(0, 160)}`);
  return JSON.parse(r.body) as ToolCallResponse;
}

// ---------------------------------------------------------------------------- independent oracle

/**
 * q̂ via a HAND-ROLLED split-conformal quantile — independent of `@monark/hikae` AND of the calibrate tool: the
 * ceil((n+1)(1-alpha))-th smallest score, alpha written as a whole number of hundredths so the rank is exact integer
 * arithmetic; `null` (under_calib) when n < nMin or the rank falls outside 1..n, never a clamped value. A
 * frozen/mock response cannot match this for arbitrary scores without doing the real computation.
 */
export function independentSplitQhat(scores: readonly number[], alphaHundredths: number, nMin: number): number | null {
  const n = scores.length;
  if (n < nMin) return null;
  const rank = Math.floor(((n + 1) * (100 - alphaHundredths) + 99) / 100);
  if (rank < 1 || rank > n) return null;
  return [...scores].sort((a, b) => a - b)[rank - 1] ?? null;
}

/** sha256 over LF-normalized bytes (matches fixtures-root.test.ts:37 and survives eol=lf commit). */
export function sha256Lf(text: string): string {
  return createHash("sha256").update(text.replace(/\r\n/g, "\n"), "utf8").digest("hex");
}

// ---------------------------------------------------------------------------- the trace

interface InitStep { n: number; surface: "mcp"; op: "initialize"; request: JsonRpcRequest; result: { protocolVersion: unknown; serverInfo: unknown } }
interface ListStep { n: number; surface: "mcp"; op: "tools/list"; request: JsonRpcRequest; result: { names: string[]; response_sha256: string } }
interface CallStep { n: number; surface: "mcp" | "http"; op: string; label: string; tool: string; note: string; request: unknown; response: ToolCallResponse }
type Step = InitStep | ListStep | CallStep;

export interface H5Trace {
  schema: string;
  title: string;
  generated_by: Record<string, string>;
  transport: Record<string, string>;
  honesty: Record<string, string>;
  closes: string;
  steps: Step[];
  observed: Record<string, unknown>;
}

function structuredOf(x: ToolCallResponse): Record<string, unknown> { return x.structuredContent; }
function field(o: Record<string, unknown>, k: string): unknown { return o[k]; }

/** Drive the full end-to-end chain over the wire and return the captured, deterministic trace. */
export async function buildTrace(): Promise<H5Trace> {
  const server: HttpServer = await startLoopback((port) => startServer(port));
  try {
    const addr = server.address();
    if (addr === null || typeof addr === "string") throw new Error("startServer did not yield an AddressInfo");
    if (addr.address !== "127.0.0.1") throw new Error(`harness must bind 127.0.0.1, got ${addr.address}`);
    const port = addr.port;

    // 1) initialize — the handshake (compacted to protocolVersion + serverInfo).
    const initReq: JsonRpcRequest = { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2026-07-28", capabilities: {}, clientInfo: { name: "monark-h5-probe", version: "1.0.0" } } };
    const initResult = await mcpSend(port, initReq) as { protocolVersion: unknown; serverInfo: unknown };

    // 2) tools/list — works without a session; compacted to the sorted names + a sha256 of the full result.
    const listReq: JsonRpcRequest = { jsonrpc: "2.0", id: 2, method: "tools/list" };
    const listResult = await mcpSend(port, listReq) as { tools: { name: string }[] };
    const names = listResult.tools.map((t) => t.name).sort((a, b) => (a < b ? -1 : 1));
    const listSha = createHash("sha256").update(JSON.stringify(listResult), "utf8").digest("hex");

    // 3) gate(USDe committed key) -> the committed decision (measured calibration; btc-dir-15m is retired, CM-2b).
    const gateUsdeArgs = { prediction: USDE_PREDICTION, params: { ...GATE_PARAMS, remainingBudget: DEMO_REMAINING_BUDGET, intent: 0.0001 } };
    const gateUsde = await mcpToolsCall(port, 3, "gate", gateUsdeArgs);

    // 4) gate(a predictor with no committed calibration, same class) -> the HONEST spine: abstain / under_calib.
    const gateUncalArgs = { prediction: UNCALIBRATED_PREDICTION, params: { ...GATE_PARAMS, remainingBudget: DEMO_REMAINING_BUDGET, intent: 0.0001 } };
    const gateUncal = await mcpToolsCall(port, 4, "gate", gateUncalArgs);

    // 5) calibrate(the demo scores) -> the split-conformal quantile of caller-carried scores; nothing is committed.
    const calibrate = await mcpToolsCall(port, 5, "calibrate", DEMO_CALIBRATION);
    const cal = structuredOf(calibrate);

    // 6) HTTP/JSON mirror of calibrate (api. Host) — both surfaces must agree.
    const mirror = await mirrorCall(port, "/calibrate", DEMO_CALIBRATION);

    const gb = structuredOf(gateUsde);
    const gbVerdict = field(gb, "verdict");
    const gu = structuredOf(gateUncal);

    const steps: Step[] = [
      { n: 1, surface: "mcp", op: "initialize", request: initReq, result: { protocolVersion: initResult.protocolVersion, serverInfo: initResult.serverInfo } },
      { n: 2, surface: "mcp", op: "tools/list", request: listReq, result: { names, response_sha256: listSha } },
      { n: 3, surface: "mcp", op: "tools/call", label: "committed-gate", tool: "gate", note: "the committed USDe key of stable-run-velocity-24h, over its measured calibration (alpha and nMin imposed by the server; no coverage is measured): the committed decision.", request: { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "gate", arguments: gateUsdeArgs } }, response: gateUsde },
      { n: 4, surface: "mcp", op: "tools/call", label: "uncalibrated-gate", tool: "gate", note: "the same class from a predictor whose calibration is not committed: the gate abstains (under_calib). This is the honest, expected result.", request: { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "gate", arguments: gateUncalArgs } }, response: gateUncal },
      { n: 5, surface: "mcp", op: "tools/call", label: "calibrate", tool: "calibrate", note: "split-conformal quantile of 20 caller-carried scores at alpha 0.1: the 19th smallest, rank ceil((n+1)(1-alpha)); nothing is committed and no decision is served.", request: { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "calibrate", arguments: DEMO_CALIBRATION } }, response: calibrate },
      { n: 6, surface: "http", op: "POST /calibrate", label: "calibrate-mirror", tool: "calibrate", note: "HTTP/JSON mirror (api. Host): the same structuredContent as the MCP surface.", request: { host: HOST_API, method: "POST", path: "/calibrate", body: DEMO_CALIBRATION }, response: mirror },
    ];

    return {
      schema: "monark-h5-e2e-trace/1",
      title: "MONARK harness — recorded end-to-end demonstration",
      generated_by: {
        recorder: "scripts/record-h5-e2e-trace.mjs",
        worker_model: "claude-opus-5-5",
        effort: "max",
        date: "2026-11-04",
        grounding: "step 7 of ROADMAP.md (first recorded 2026-09-11 for ADR-M005 H5 / C-6)",
      },
      transport: {
        mcp: "MCP streamable-HTTP via createMcpHandler (SDK @modelcontextprotocol/server 2.3.1, the version apps/harness/package.json pins); a real JSON-RPC tools/call over a 127.0.0.1 socket; the response is framed as text/event-stream.",
        http_mirror: "HTTP/JSON mirror on the api. Host: the same registry and the same frozen input/output schemas.",
        bind: "127.0.0.1, ephemeral port; the port is intentionally NOT recorded so this trace is reproducible byte-for-byte.",
        accept_required: "application/json, text/event-stream (a request missing text/event-stream is answered 406).",
        session: "stateless: tools/list and tools/call succeed with no session id; B_t is caller-carried in and out.",
        protocol_version_negotiated: "the client asks for 2026-07-28 and the SDK answers protocolVersion 2025-11-25 (step 1); an SDK observation, outside H5 scope.",
      },
      honesty: {
        calibration: "committed: the USDe key of stable-run-velocity-24h, measured on calm-window redemption flow and measured non-stationary across half-years; no coverage is measured. btc-dir-15m is retired and its synthetic calibration is no longer served.",
        budget_bt: "B_t is caller-carried: remainingBudget enters as a gate parameter and the SAME value leaves as remaining_budget. The stateless server does NOT deplete it (depletion would be monetisation, outside ADR-M005 scope, D6).",
        uncalibrated: "under_calib: no calibration is committed for this predictor, so the gate abstains. That abstention is the honest, expected result, not a defect.",
        calibrate: "calibrate computes a split-conformal quantile of the scores the caller supplies; it commits no calibration, serves no decision, and does not verify that the numbers are scores of any model.",
        vocabulary: "no overclaim: this trace states no correctness claim; its only coverage statement is the calibrate label, conditional on exchangeability; it uses no forbidden vocabulary.",
      },
      closes: "The tools/call steps are real JSON-RPC requests over the streamable-HTTP transport, not tool.run() calls (H5 closed the residual 'seam SDK tools/call not exercised'). Since step 7 of ROADMAP.md they drive gate and calibrate; judge runs the Genkan kernel and is driven by the kernel tests (npm run test:genkan).",
      steps,
      observed: {
        committed_gate_action: field(gb, "action"),
        committed_gate_reason: field(gb, "reason"),
        committed_gate_scores_sha256: gbVerdict !== null && typeof gbVerdict === "object" ? (gbVerdict as Record<string, unknown>)["scores_sha256"] : undefined,
        uncalibrated_gate_action: field(gu, "action"),
        uncalibrated_gate_reason: field(gu, "reason"),
        uncalibrated_gate_remaining_budget: field(gu, "remaining_budget"),
        calibrate_qhat: field(cal, "qhat"),
        calibrate_n: field(cal, "n"),
        calibrate_reason: field(cal, "reason"),
        mirror_matches_mcp_calibrate: JSON.stringify(structuredOf(mirror)) === JSON.stringify(cal),
      },
    };
  } finally {
    server.closeAllConnections(); // C-G2D-1: server-socket hygiene (destroy before close). Does NOT fix the libuv async.c flake (nodejs/node#56645)
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
}
