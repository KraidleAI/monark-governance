/**
 * Lot H5 shared driver + independent oracles (ADR-M005 §H5, C-6). NOT a test file (no `*.test.ts`
 * suffix ⇒ never run by the `test/*.test.ts` glob); imported by BOTH the recorder
 * (`scripts/record-h5-e2e-trace.mjs`) and the probe (`test/h5-e2e-probe.test.ts`), so the demo is
 * generated and verified by ONE code path.
 *
 * It stands the harness up in-process on a real `127.0.0.1` ephemeral listener (`startServer`) and
 * drives the REAL MCP `tools/call` path over the streamable-HTTP transport (an actual JSON-RPC request
 * over the socket, NOT a `tool.run()` call) plus the HTTP/JSON mirror (`api.` Host) — closing the
 * deferred "seam SDK tools/call" residual from an earlier lot. `buildTrace()` returns the
 * captured chain; the ephemeral port is DELIBERATELY not recorded so the trace is reproducible.
 *
 * `mcpToolsCall` is the ANTI-MOCK SEAM: the probe's test-chosen perturbation drives it too, so a mutant
 * that replaces it with a frozen/replayed response makes the probe's perturbation assertion go RED.
 */
import { once } from "node:events";
import { request as httpRequest } from "node:http";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Server as HttpServer, IncomingHttpHeaders } from "node:http";
import { startServer } from "../apps/harness/src/server.ts";
import { GATE_NON_REVERIFICATION_SENTENCE } from "../apps/harness/src/tools/gate.ts";

export const HOST_MCP = "mcp.monarkgate.tech";
export const HOST_API = "api.monarkgate.tech";
/** MCP streamable-HTTP requires BOTH media types in Accept (else the SDK answers 406). */
export const ACCEPT_MCP = "application/json, text/event-stream";

/** Fixed caller-carried instant — the tools read no clock (D4/D7), so the trace is deterministic. */
export const PRODUCED_AT = "2026-09-04T00:00:00Z";

export interface CascadeInput {
  readonly L: number[][];
  readonly e: number[];
  readonly shock: number;
  readonly producedAt: string;
}

/** The demo interbank system: node 0 owes 100, node 1 owes 50; e=[40,20]; no 24h shock. */
export const DEMO_CASCADE_INPUT: CascadeInput = { L: [[0, 100], [50, 0]], e: [40, 20], shock: 0, producedAt: PRODUCED_AT };

/** Caller-carried gate params (non-frozen, ADR-M005 D5/D6); `intent`/`remainingBudget` set per call. */
export const GATE_PARAMS = { bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, tool: "perps_order_preview", clockOpen: true } as const;
export const DEMO_REMAINING_BUDGET = 0.1;

/** The committed USDe key of stable-run-velocity-24h (GATE_PARAMS carries its imposed alpha 0.1 and nMin 50): the
 *  committed decision of the trace since btc-dir-15m is retired (ADR-CM B-5, CM-2b). */
export const USDE_PREDICTION = {
  schema_version: "1.0.0",
  task_class: "stable-run-velocity-24h",
  yhat: 0.0001,
  predictor_id: "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
  produced_at: PRODUCED_AT,
} as const;

/** The retired btc-dir-15m prediction (ADR-CM B-5): carried by step 7 with the attested witness, refused (400). */
export const BTC_DIR_PREDICTION = {
  schema_version: "1.0.0",
  task_class: "btc-dir-15m",
  yhat: "up",
  predictor_id: "internal:momentum-4c",
  produced_at: PRODUCED_AT,
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
 * with a frozen/replayed response makes the perturbation assertion (`yhat` at a shock not in the
 * committed trace) go RED — that is the mutant the PLAN requires.
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

// ---------------------------------------------------------------------------- independent oracles

/**
 * yhat via a HAND-ROLLED Eisenberg-Noe clearing — independent of `@monark/ukemi` AND the cascade tool.
 * Picard from p=p̄ (from above) converges to L* for the E&N map (α=β=1); each cleared node is read as a
 * leveraged position (collateral = external + interbank receipts under L*, debt = nominal p̄, K=1) and
 * `yhat` sums the debts of the nodes whose shocked cleared value no longer covers p̄ — the exact wiring
 * `apps/harness/src/tools/cascade.ts` documents. A frozen/mock response cannot match this for an
 * arbitrary shock without doing the real computation.
 */
export function independentCascadeYhat(L: readonly (readonly number[])[], e: readonly number[], shock: number): number {
  const n = e.length;
  const pbar = L.map((row) => row.reduce((a, b) => a + b, 0));
  const pi = L.map((row, i) => { const d = pbar[i] ?? 0; return row.map((lij) => (d > 0 ? lij / d : 0)); });
  let p = [...pbar];
  for (let iter = 0; iter < 1000; iter++) {
    const next = p.map((_, i) => {
      let v = e[i] ?? 0;
      for (let j = 0; j < n; j++) v += (pi[j]?.[i] ?? 0) * (p[j] ?? 0);
      return Math.min(pbar[i] ?? 0, v);
    });
    let delta = 0;
    for (let i = 0; i < n; i++) delta += Math.abs((next[i] ?? 0) - (p[i] ?? 0));
    p = next;
    if (delta < 1e-12) break;
  }
  let yhat = 0;
  for (let i = 0; i < n; i++) {
    let inflow = 0;
    for (let j = 0; j < n; j++) inflow += (pi[j]?.[i] ?? 0) * (p[j] ?? 0);
    const clearedValue = (e[i] ?? 0) + inflow;
    if (clearedValue * (1 - shock) < (pbar[i] ?? 0)) yhat += pbar[i] ?? 0;
  }
  return yhat;
}

const FIXTURES_DIR = fileURLToPath(new URL("../fixtures/", import.meta.url));

/** The emitted-meaning digest read straight from the committed Shōgen constat — attest's independent oracle. */
export function constatSensEmisDigest(): string {
  const constat = JSON.parse(readFileSync(FIXTURES_DIR + "s3-binance.constat.json", "utf8")) as Record<string, unknown>;
  const v = constat["empreinte_sent_revele_sha256"];
  if (typeof v !== "string") throw new Error("constat.empreinte_sent_revele_sha256 is not a string");
  return v;
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
  const server: HttpServer = startServer(0);
  try {
    await once(server, "listening");
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

    // 3) cascade(UKEMI) -> Prediction (yhat = estimated liquidable amount).
    const cascadeArgs = DEMO_CASCADE_INPUT;
    const cascade = await mcpToolsCall(port, 3, "cascade", cascadeArgs);
    const cascadePrediction = structuredOf(cascade);

    // 4) gate(cascade Prediction) -> the HONEST spine: no cascade calibration ⇒ abstain / under_calib.
    const gateCascadeArgs = { prediction: cascadePrediction, params: { ...GATE_PARAMS, remainingBudget: DEMO_REMAINING_BUDGET, intent: 100 } };
    const gateCascade = await mcpToolsCall(port, 4, "gate", gateCascadeArgs);

    // 5) gate(USDe committed key) -> the committed decision (measured calibration; btc-dir-15m is retired, CM-2b).
    const gateUsdeArgs = { prediction: USDE_PREDICTION, params: { ...GATE_PARAMS, remainingBudget: DEMO_REMAINING_BUDGET, intent: 0.0001 } };
    const gateUsde = await mcpToolsCall(port, 5, "gate", gateUsdeArgs);

    // 6) attest(Shōgen) -> AttestedPrice envelope: demonstrative, not probative.
    const attest = await mcpToolsCall(port, 6, "attest", {});
    const at = structuredOf(attest);
    const atPrice = field(at, "price");

    // 7) gate(btc-dir-15m) CARRYING the LIVE attested price of step 6 (ADR-M017 D2(iii)/D4(3)). btc-dir-15m was the
    //    only class with a committed attestation subject; it is retired (ADR-CM B-5), so the call passes the
    //    consistency guard and is refused (400 task_class_retired): the attest -> gate join is dormant since CM-2b
    //    (ADR-CM amendment "nuit, 3"). Kept and re-pinned on that refusal.
    const gateAttestedArgs = { prediction: BTC_DIR_PREDICTION, params: { ...GATE_PARAMS, remainingBudget: DEMO_REMAINING_BUDGET, intent: "up" }, attested: atPrice };
    const gateAttested = await mcpToolsCall(port, 7, "gate", gateAttestedArgs);

    // 8) HTTP/JSON mirror of cascade (api. Host) — both surfaces must agree.
    const mirror = await mirrorCall(port, "/cascade", cascadeArgs);

    const mirrorMatches = JSON.stringify(structuredOf(mirror)) === JSON.stringify(cascadePrediction);
    const gc = structuredOf(gateCascade);
    const gb = structuredOf(gateUsde);
    const gbVerdict = field(gb, "verdict");
    const gaMeta = (gateAttested as unknown as { _meta?: Record<string, unknown> })._meta;

    const steps: Step[] = [
      { n: 1, surface: "mcp", op: "initialize", request: initReq, result: { protocolVersion: initResult.protocolVersion, serverInfo: initResult.serverInfo } },
      { n: 2, surface: "mcp", op: "tools/list", request: listReq, result: { names, response_sha256: listSha } },
      { n: 3, surface: "mcp", op: "tools/call", label: "cascade", tool: "cascade", note: "UKEMI cascade -> Prediction (estimated liquidable amount).", request: { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "cascade", arguments: cascadeArgs } }, response: cascade },
      { n: 4, surface: "mcp", op: "tools/call", label: "cascade-gate", tool: "gate", note: "cascade -> gate: no cascade calibration is committed, so the gate abstains (under_calib). This is the honest, expected result.", request: { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "gate", arguments: gateCascadeArgs } }, response: gateCascade },
      { n: 5, surface: "mcp", op: "tools/call", label: "committed-gate", tool: "gate", note: "the committed USDe key of stable-run-velocity-24h, over its measured calibration (alpha and nMin imposed by the server; no coverage is measured): the committed decision.", request: { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "gate", arguments: gateUsdeArgs } }, response: gateUsde },
      { n: 6, surface: "mcp", op: "tools/call", label: "attest", tool: "attest", note: "Shōgen projection of one committed, previously Shōgen-verified witness; demonstrative, not probative; the verifier is not executed at call time.", request: { jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "attest", arguments: {} } }, response: attest },
      { n: 7, surface: "mcp", op: "tools/call", label: "attested-gate", tool: "gate", note: `${GATE_NON_REVERIFICATION_SENTENCE}; btc-dir-15m, the only class with a committed attestation subject, is retired, so this call is refused (task_class_retired): the attest -> gate join is dormant`, request: { jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "gate", arguments: gateAttestedArgs } }, response: gateAttested },
      { n: 8, surface: "http", op: "POST /cascade", label: "cascade-mirror", tool: "cascade", note: "HTTP/JSON mirror (api. Host): the same frozen structuredContent as the MCP surface.", request: { host: HOST_API, method: "POST", path: "/cascade", body: cascadeArgs }, response: mirror },
    ];

    return {
      schema: "monark-h5-e2e-trace/1",
      title: "MONARK harness — recorded end-to-end demonstration",
      generated_by: {
        recorder: "scripts/record-h5-e2e-trace.mjs",
        worker_model: "claude-opus-4-8",
        effort: "max",
        date: "2026-09-11",
        grounding: "ADR-M005 H5 / C-6",
        reviewer: "Independently reviewed and recorded before commit.",
        repinned: "2026-10-04, CM-2b surfaces: step 5 on the committed USDe key, step 7 on the task_class_retired refusal.",
      },
      transport: {
        mcp: "MCP streamable-HTTP via createMcpHandler (SDK modelcontextprotocol server 2.0.0); a real JSON-RPC tools/call over a 127.0.0.1 socket; the response is framed as text/event-stream.",
        http_mirror: "HTTP/JSON mirror on the api. Host: the same registry and the same frozen input/output schemas.",
        bind: "127.0.0.1, ephemeral port; the port is intentionally NOT recorded so this trace is reproducible byte-for-byte.",
        accept_required: "application/json, text/event-stream (a request missing text/event-stream is answered 406).",
        session: "stateless: tools/list and tools/call succeed with no session id; B_t is caller-carried in and out.",
        protocol_version_negotiated: "the SDK 2.0.0 negotiates protocolVersion 2025-11-25 (the ADR names 2026-07-28); a pre-existing SDK observation, outside H5 scope.",
      },
      honesty: {
        calibration: "committed: the USDe key of stable-run-velocity-24h, measured on calm-window redemption flow and measured non-stationary across half-years; no coverage is measured. btc-dir-15m is retired and its synthetic calibration is no longer served.",
        budget_bt: "B_t is caller-carried: remainingBudget enters as a gate parameter and the SAME value leaves as remaining_budget. The stateless server does NOT deplete it (depletion would be monetisation, outside ADR-M005 scope, D6).",
        cascade_class: "under_calib: no cascade calibration is committed, so the cascade -> gate path abstains. That abstention is the honest, expected result, not a defect.",
        attest: "demonstrative, not probative: a projection of ONE committed, previously Shōgen-verified witness (Binance BTCUSDT, self-notarised); the verifier is not executed at call time.",
        vocabulary: "no overclaim: this trace states no correctness or coverage claim and uses no forbidden vocabulary.",
      },
      closes: "H5 closes the deferred residual 'seam SDK tools/call (gate/cascade/attest not exercised via createHarnessHandler)' from an earlier lot: these tools/call steps are real JSON-RPC over the streamable-HTTP transport, not tool.run() calls.",
      steps,
      observed: {
        cascade_yhat: field(cascadePrediction, "yhat"),
        cascade_gate_action: field(gc, "action"),
        cascade_gate_reason: field(gc, "reason"),
        cascade_gate_remaining_budget: field(gc, "remaining_budget"),
        committed_gate_action: field(gb, "action"),
        committed_gate_reason: field(gb, "reason"),
        committed_gate_calib_digest: gbVerdict !== null && typeof gbVerdict === "object" ? (gbVerdict as Record<string, unknown>)["calib_digest"] : undefined,
        attest_label: field(at, "label"),
        attest_sens_emis_digest: atPrice !== null && typeof atPrice === "object" ? (atPrice as Record<string, unknown>)["sens_emis_digest"] : undefined,
        attested_gate_is_error: (gateAttested as unknown as { isError?: unknown }).isError,
        attested_gate_error_code: gaMeta?.["monarkgate.tech/error_code"],
        mirror_matches_mcp_cascade: mirrorMatches,
      },
    };
  } finally {
    server.closeAllConnections(); // C-G2D-1: server-socket hygiene (destroy before close). Does NOT fix the libuv async.c flake (nodejs/node#56645)
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }
}
