/**
 * Lot M006 D10 shared driver + independent oracles (ADR-M006 D10). NOT a test file (no `*.test.ts`
 * suffix ⇒ never run by the `test/*.test.ts` glob); imported by BOTH the recorder
 * (`scripts/record-byo-demo.mjs`) and the probe (`test/byo-demo-probe.test.ts`), so the BYO demo is
 * generated and verified by ONE code path (motif `test/h5-trace-builder.ts`).
 *
 * It stands the harness up in-process on a real `127.0.0.1` ephemeral listener (`startServer`) and
 * drives the REAL MCP `tools/call` path over the streamable-HTTP transport (an actual JSON-RPC request
 * over the socket, NOT a `tool.run()` call). The recorded chain is the "bring-your-own" (BYO) loop of
 * `skills/monark/SKILL.md`: a fictitious third-party caller (a) `calibrate`s its OWN nonconformity
 * scores ⇒ a split-conformal quantile q̂ + a `set_digest`, then (b) `gate`s its OWN prediction with
 * `params.calibration` (the SAME scores, `interval` mode) ⇒ a covered `commit`. The audit closes when
 * the gate verdict's `calib_digest` equals the calibrate `set_digest` over the same scores.
 *
 * `byoToolsCall` is the LOCAL ANTI-MOCK SEAM (delegates to h5's `mcpToolsCall`): the probe's
 * test-chosen perturbations drive it too, so a mutant that freezes/replays a canned response makes the
 * probe's perturbation assertion go RED. It resides HERE (not in the shared h5 builder) so that mutant
 * mutates this uncommitted file, never the committed h5 driver.
 *
 * Determinism: the tools read no clock (`produced_at` is caller-carried); the ephemeral port is
 * DELIBERATELY not recorded. Re-running the recorder reproduces the file byte-for-byte.
 */
import { once } from "node:events";
import type { Server as HttpServer } from "node:http";
import { startServer } from "../apps/harness/src/server.ts";
import { CALIBRATE_LABEL } from "../apps/harness/src/tools/calibrate.ts";
import { mcpSend, mcpToolsCall, sha256Lf, PRODUCED_AT } from "./h5-trace-builder.ts";
import type { JsonRpcRequest, ToolCallResponse } from "./h5-trace-builder.ts";

export { sha256Lf, PRODUCED_AT };

// ---------------------------------------------------------------------------- the caller's inputs
//
// A GENERIC third-party caller. No named asset, no measured model: the scores below are ILLUSTRATIVE
// nonconformity scores a caller owns; `task_class` is a caller-owned label, never a committed class.

/** The fictitious caller's own nonconformity scores (n=10), illustrative — not measured, not an asset. */
export const CALLER_SCORES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] as const;
/** Target miscoverage α. n=10, α=0.1 ⇒ p=⌈(n+1)(1−α)⌉=⌈9.9⌉=10 ⇒ q̂ = 10th smallest score = 1.0. */
export const CALLER_ALPHA = 0.1;
/** Minimum calibration count (fail-closed under `nMin`); n=10 ≥ 5. */
export const CALLER_NMIN = 5;
/** Set-size threshold (unused in interval mode; carried for a well-formed gate call). */
export const CALLER_TAU = 1;
/** Interval-width threshold. Region width = 2q̂ = 2, comfortably < 3 ⇒ a CLEAR commit (visible margin). */
export const CALLER_TAU_INTERVAL = 3;
/** The caller's point prediction ŷ. Interval mode ⇒ region [ŷ−q̂, ŷ+q̂] = [−1, 1]. */
export const CALLER_YHAT = 0;
/** The caller's intent, inside the region [−1, 1] ⇒ covered. */
export const CALLER_INTENT = 0;
/** Caller-carried authorization budget B_t (echoed out unchanged; the stateless server never depletes it). */
export const CALLER_REMAINING_BUDGET = 0.1;
export const CALLER_BFLOOR = 0;
/** A GENERIC caller-owned task label — never one of the two committed plumbing classes (gate.ts `TASK_*`). */
export const CALLER_TASK_CLASS = "caller-demo-reg";
/** A GENERIC predictor id — the caller owns the model; MONARK never sees it. */
export const CALLER_PREDICTOR_ID = "caller:own-model";
/** The named downstream tool: echoed, NEVER invoked (the gate emits a decision, it does not act). */
export const CALLER_TOOL = "caller_downstream_tool";

/** The caller's prediction, valid against the frozen `prediction.schema.json`. */
export const CALLER_PREDICTION = {
  schema_version: "1.0.0",
  task_class: CALLER_TASK_CLASS,
  yhat: CALLER_YHAT,
  predictor_id: CALLER_PREDICTOR_ID,
  produced_at: PRODUCED_AT,
} as const;

/** Build the calibrate tool arguments for a given score set / α / nMin. */
export function calibrateArgs(scores: readonly number[], alpha: number, nMin: number): { scores: readonly number[]; alpha: number; nMin: number } {
  return { scores, alpha, nMin };
}

/** Build the gate tool arguments (BYO interval calibration) for a given score set / ŷ. */
export function gateByoArgs(scores: readonly number[], yhat: number): {
  prediction: Record<string, unknown>;
  params: Record<string, unknown>;
} {
  return {
    prediction: { ...CALLER_PREDICTION, yhat },
    params: {
      remainingBudget: CALLER_REMAINING_BUDGET,
      bFloor: CALLER_BFLOOR,
      tau: CALLER_TAU,
      tauInterval: CALLER_TAU_INTERVAL,
      alpha: CALLER_ALPHA,
      nMin: CALLER_NMIN,
      intent: CALLER_INTENT,
      tool: CALLER_TOOL,
      clockOpen: true,
      calibration: { scores, mode: "interval" },
    },
  };
}

// ---------------------------------------------------------------------------- local anti-mock seam

/**
 * LOCAL ANTI-MOCK SEAM. A real `tools/call` JSON-RPC request over the wire → `{content,
 * structuredContent}`. `buildByoTrace()` and the probe's perturbations BOTH call this; a mutant that
 * freezes its result (ignoring `args`) makes the probe's α/ŷ perturbation assertions go RED.
 */
export async function byoToolsCall(port: number, id: number, tool: string, args: unknown): Promise<ToolCallResponse> {
  return mcpToolsCall(port, id, tool, args);
}

// ---------------------------------------------------------------------------- independent oracle

/**
 * HAND-ROLLED split-conformal quantile — INDEPENDENT of `@monark/hikae`'s `splitQuantile`. `p =
 * ⌈(n+1)(1−α)⌉`; fail-closed (`null`) when `n < nMin` OR `p > n`; else the p-th smallest score, found
 * by REPEATED MIN-EXTRACTION (an O(p·n) selection), NOT a full sort — a deliberately different code
 * path from production, so this cannot silently mirror a bug in `splitQuantile`.
 */
export function independentSplitQhat(scores: readonly number[], alpha: number, nMin: number): number | null {
  const n = scores.length;
  if (n < nMin) return null;
  const p = Math.ceil((n + 1) * (1 - alpha));
  if (p > n) return null;
  const pool = [...scores];
  let qhat = Number.NaN;
  for (let k = 0; k < p; k++) {
    let minIdx = 0;
    for (let i = 1; i < pool.length; i++) {
      const cur = pool[i];
      const best = pool[minIdx];
      if (cur !== undefined && best !== undefined && cur < best) minIdx = i;
    }
    const picked = pool[minIdx];
    if (picked === undefined) return null;
    qhat = picked;
    pool.splice(minIdx, 1);
  }
  return qhat;
}

// ---------------------------------------------------------------------------- the trace

interface InitStep {
  n: number;
  surface: "mcp";
  op: "initialize";
  request: JsonRpcRequest;
  result: { protocolVersion: unknown; serverInfo: unknown };
}
interface CallStep {
  n: number;
  surface: "mcp";
  op: "tools/call";
  label: string;
  tool: string;
  note: string;
  request: unknown;
  response: ToolCallResponse;
}
type Step = InitStep | CallStep;

export interface ByoTrace {
  schema: string;
  title: string;
  generated_by: Record<string, string>;
  transport: Record<string, string>;
  scenario: Record<string, unknown>;
  honesty: Record<string, string>;
  audit: string;
  steps: Step[];
  observed: Record<string, unknown>;
}

function structuredOf(x: ToolCallResponse): Record<string, unknown> {
  return x.structuredContent;
}
function field(o: Record<string, unknown>, k: string): unknown {
  return o[k];
}
function objField(o: Record<string, unknown>, k: string): Record<string, unknown> {
  const v = o[k];
  if (v === null || typeof v !== "object") throw new Error(`field '${k}' is not an object`);
  return v as Record<string, unknown>;
}

/** Drive the BYO calibrate → gate chain over the wire and return the captured, deterministic trace. */
export async function buildByoTrace(): Promise<ByoTrace> {
  const server: HttpServer = startServer(0);
  try {
    await once(server, "listening");
    const addr = server.address();
    if (addr === null || typeof addr === "string") throw new Error("startServer did not yield an AddressInfo");
    if (addr.address !== "127.0.0.1") throw new Error(`harness must bind 127.0.0.1, got ${addr.address}`);
    const port = addr.port;

    // 1) initialize — a real MCP handshake over the wire (stateless; compacted to protocolVersion + serverInfo).
    const initReq: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2026-07-28", capabilities: {}, clientInfo: { name: "monark-byo-demo", version: "1.0.0" } },
    };
    const initResult = (await mcpSend(port, initReq)) as { protocolVersion: unknown; serverInfo: unknown };

    // 2) calibrate — the caller's OWN nonconformity scores ⇒ split-conformal q̂ + set_digest.
    const cArgs = calibrateArgs(CALLER_SCORES, CALLER_ALPHA, CALLER_NMIN);
    const calibrate = await byoToolsCall(port, 2, "calibrate", cArgs);
    const calibrateSc = structuredOf(calibrate);

    // 3) gate BYO — the caller's OWN prediction under params.calibration (same scores, interval) ⇒ commit.
    const gArgs = gateByoArgs(CALLER_SCORES, CALLER_YHAT);
    const gate = await byoToolsCall(port, 3, "gate", gArgs);
    const gateSc = structuredOf(gate);
    const verdict = objField(gateSc, "verdict");
    const region = objField(verdict, "region");

    const setDigest = field(calibrateSc, "set_digest");
    const calibDigest = field(verdict, "calib_digest");

    const steps: Step[] = [
      { n: 1, surface: "mcp", op: "initialize", request: initReq, result: { protocolVersion: initResult.protocolVersion, serverInfo: initResult.serverInfo } },
      {
        n: 2,
        surface: "mcp",
        op: "tools/call",
        label: "calibrate",
        tool: "calibrate",
        note: "The caller calibrates its OWN nonconformity scores: MONARK returns the split-conformal quantile qhat and a set_digest over exactly those scores. MONARK does not see, store, or verify the caller's data or model.",
        request: { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "calibrate", arguments: cArgs } },
        response: calibrate,
      },
      {
        n: 3,
        surface: "mcp",
        op: "tools/call",
        label: "gate-byo",
        tool: "gate",
        note: "The caller gates its OWN prediction with params.calibration (the SAME scores, interval mode): the gate conformalizes against THOSE caller-supplied scores (BYO) and returns a covered commit. 'allow' is a coverage verdict on the caller's prediction, NOT permission to execute the named tool.",
        request: { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "gate", arguments: gArgs } },
        response: gate,
      },
    ];

    return {
      schema: "monark-byo-demo-trace/1",
      title: "MONARK harness — recorded bring-your-own (BYO) calibrate -> gate -> audit demonstration",
      generated_by: {
        recorder: "scripts/record-byo-demo.mjs",
        worker_model: "claude-opus-4-8",
        effort: "high",
        date: "2026-09-11",
        grounding: "ADR-M006 D10; the BYO loop of skills/monark/SKILL.md",
        reviewer: "Independently reviewed and recorded before commit.",
      },
      transport: {
        mcp: "MCP streamable-HTTP via createMcpHandler (SDK modelcontextprotocol server 2.0.0); a real JSON-RPC tools/call over a 127.0.0.1 socket; the response is framed as text/event-stream.",
        bind: "127.0.0.1, ephemeral port; the port is intentionally NOT recorded so this trace is reproducible byte-for-byte.",
        accept_required: "application/json, text/event-stream (a request missing text/event-stream is answered 406).",
        session: "stateless: MONARK stores nothing between the calibrate and the gate call; the caller carries qhat and B_t in and out.",
      },
      scenario: {
        caller: "a fictitious third-party caller with its OWN predictor and its OWN nonconformity score function; the scores below are ILLUSTRATIVE, not measured, and name no asset.",
        task_class: CALLER_TASK_CLASS,
        scores: CALLER_SCORES,
        alpha: CALLER_ALPHA,
        n_min: CALLER_NMIN,
        yhat: CALLER_YHAT,
        intent: CALLER_INTENT,
        tau_interval: CALLER_TAU_INTERVAL,
        remaining_budget: CALLER_REMAINING_BUDGET,
        expected: "p = ceil((n+1)(1-alpha)) = ceil(11 * 0.9) = 10; qhat = 10th smallest score = 1.0; region [yhat-qhat, yhat+qhat] = [-1, 1]; width 2 < tauInterval 3 and intent 0 in [-1, 1] => commit / covered.",
      },
      honesty: {
        byo: CALIBRATE_LABEL,
        coverage: "Marginal 1-alpha coverage holds ONLY under exchangeability of the caller's future points with these scores; non-exchangeable data voids it. This is not a probability of being right.",
        budget_bt: "B_t is caller-carried: remainingBudget enters as a gate parameter and the SAME value leaves as remaining_budget. The stateless server does NOT deplete it.",
        allow: "'allow' is a coverage verdict on the caller's prediction, NOT permission to execute the named tool; the gate never calls the named tool.",
        illustrative: "The scores, the prediction, and the task label are generic and illustrative. MONARK gates the caller's prediction; it does not itself predict, and it names no asset.",
        vocabulary: "This trace states no correctness or coverage claim and uses no forbidden vocabulary.",
      },
      audit: "The BYO loop closes when the gate verdict's calib_digest equals the calibrate set_digest over the same scores. Both are recorded below and asserted equal by test/byo-demo-probe.test.ts.",
      steps,
      observed: {
        calibrate_qhat: field(calibrateSc, "qhat"),
        calibrate_n: field(calibrateSc, "n"),
        calibrate_reason: field(calibrateSc, "reason"),
        calibrate_set_digest: setDigest,
        gate_action: field(gateSc, "action"),
        gate_allow: field(gateSc, "allow"),
        gate_reason: field(gateSc, "reason"),
        gate_tool: field(gateSc, "tool"),
        gate_remaining_budget: field(gateSc, "remaining_budget"),
        gate_calib_digest: calibDigest,
        gate_n_calib: field(verdict, "n_calib"),
        gate_qhat: field(verdict, "qhat"),
        gate_region_kind: field(region, "kind"),
        gate_region_lo: field(region, "lo"),
        gate_region_hi: field(region, "hi"),
        audit_calib_digest_equals_set_digest: typeof setDigest === "string" && setDigest === calibDigest,
      },
    };
  } finally {
    server.closeAllConnections(); // C-G2D-1: destroy live sockets so no loopback handle survives --test-force-exit
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }
}
