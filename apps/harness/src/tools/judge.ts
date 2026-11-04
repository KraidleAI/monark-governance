/**
 * Harness — the `judge` tool (step 5 of ROADMAP.md): the gate's decision on a signal, then the verdict of Genkan's Lean kernel on
 * an order under that decision.
 *
 * It runs the gate on the same envelope as `gate` (`runGate`: the same rules and the same refusals), so the action the kernel is
 * handed is the gate's own answer to this call, never the caller's word. It builds the kernel's context from that action and the
 * caller's `limits` (venues, assets and caps), encodes the order, and hands the mode 1 request to the runner the entry point
 * injects (`kernel`, src/kernel.ts). An EXIT is the one order the gate's refusal does not stop (the founder's decision of
 * 2026-11-04): the kernel judges an EXIT whatever the action, so it judges this one under the action abstain, with no gate
 * decision and the gate's refusal in `gate_error`; any other order under a refused envelope is the gate's tool error. It reads the answer with `readVerdict` of apps/genkan/src/frame.ts, fail-closed: an allow
 * only for exit 0 and exactly the line `allow`. No runner, or no kernel binary, is a deny `unavailable`. A field outside the
 * formats of the frames is a tool error `param_invalid` (the frozen tool-error contract has no code of its own for this tool),
 * and the kernel is not run.
 *
 * Like everything under `src/tools/`, this file does no I/O and reads no clock: the runner and the instant are injected.
 */
import { createHash } from "node:crypto";
import type { AttestedPrice, GateDecision, Prediction } from "@monark/contracts";
import { encodeContext, encodeJudgeRequest, encodeOrder, readVerdict, type OrderFields, type OrderKind } from "@monark/genkan/frame";
import { HarnessToolError, runGate, toolErrorCode, type HarnessErrorCode, type HarnessParams } from "./gate.ts";

export const JUDGE_TOOL_NAME = "judge";

/** The order kinds of the GNK1 format (apps/genkan/src/frame.ts). */
export const JUDGE_ORDER_KINDS: readonly OrderKind[] = ["TRANSFER", "APPROVE", "SWAP", "EXIT", "OPEN"];
/** Why an order is denied: the kernel's reasons, then `refused` and `unreadable` (readVerdict), then `unavailable` (no kernel ran). */
export const JUDGE_REASONS = ["bad-ctx", "bad-order", "kind", "venue", "not-commit", "asset", "over-cap", "asset-out", "min-out", "refused", "unreadable", "unavailable"] as const;
export type JudgeReason = (typeof JUDGE_REASONS)[number];
/** At most this many venues, and this many assets: a list's count is one byte of the context. */
export const JUDGE_LIST_MAX = 255;
/** An integer as a decimal string: 0, or 1 to 39 digits with no leading 0. The frames refuse one at or above 2^128. */
export const JUDGE_DECIMAL_PATTERN = "^(0|[1-9][0-9]{0,38})$";
/** A name of the frames: 1 to 128 characters of 0-9, a-z, `:`, `.`, `_`, `/`, `@`, `-`. */
export const JUDGE_NAME_PATTERN = "^[0-9a-z:._/@-]{1,128}$";

/** An order as the caller sends it: the GNK1 fields, its integers as decimal strings (a JSON number cannot hold 2^128 - 1). */
export interface JudgeOrder {
  readonly kind: OrderKind;
  readonly target: string;
  readonly asset: string;
  readonly amount: string;
  /** A SWAP's, and only a SWAP's. */
  readonly assetOut?: string;
  /** A SWAP's, and only a SWAP's. */
  readonly minOut?: string;
}

/** The caller's limits: the venues an order may target, and the assets it may move, each with its cap (a decimal string). */
export interface JudgeLimits {
  readonly venues: readonly string[];
  readonly assets: readonly { readonly asset: string; readonly cap: string }[];
}

/** The tool's input: the gate's envelope, plus the order and the limits. */
export interface JudgeInput {
  readonly prediction: Prediction;
  readonly params: HarnessParams;
  readonly attested?: AttestedPrice;
  readonly order: JudgeOrder;
  readonly limits: JudgeLimits;
}

/** What the kernel answered to one request: its exit status (null after a signal) and its stdout; null when no kernel ran. */
export type KernelAnswer = { readonly status: number | null; readonly stdout: Uint8Array } | null;
/** Runs the kernel on one request (src/kernel.ts). The entry point injects it; nothing under src/tools/ starts a process. */
export type KernelRunner = (request: Uint8Array) => KernelAnswer;

/** What the entry point hands a run: the current instant (as for `gate`) and the kernel runner. */
export interface JudgeRunOptions {
  readonly nowMs?: number;
  readonly kernel?: KernelRunner;
}

/** The gate's refusal of the envelope, as it threw it: its code and its message. */
export interface JudgeGateError {
  readonly code: HarnessErrorCode;
  readonly message: string;
}

/** The tool's output: the gate's decision, the kernel's verdict read fail-closed, and the sha256 of the request it was handed. */
export interface JudgeOutput {
  /** null exactly for an EXIT whose envelope the gate refused; `gate_error` then says why. */
  readonly decision: GateDecision | null;
  /** null exactly when there is a gate decision. */
  readonly gate_error: JudgeGateError | null;
  readonly kernel_verdict: "allow" | "deny";
  /** null exactly when the verdict is allow. */
  readonly kernel_reason: JudgeReason | null;
  /** true exactly for an allowed EXIT, which the kernel lets pass whatever the action: it must be executed reduce-only. */
  readonly reduce_only: boolean;
  readonly kernel_request_sha256: string;
}

const DECIMAL = new RegExp(JUDGE_DECIMAL_PATTERN);

/** A decimal string's integer, or a tool error naming the field. */
function decimal(name: string, s: unknown): bigint {
  if (typeof s !== "string" || !DECIMAL.test(s)) {
    throw new HarnessToolError(`invalid ${name}: expected the decimal string of an integer, 0 or 1 to 39 digits with no leading 0 (got ${JSON.stringify(s)})`, "param_invalid");
  }
  return BigInt(s);
}

/** The bytes a frame encoder writes, or a tool error naming the field when it refuses one (a RangeError). */
function framed(name: string, encode: () => Uint8Array): Uint8Array {
  try {
    return encode();
  } catch (error) {
    if (error instanceof RangeError) throw new HarnessToolError(`invalid ${name}: ${error.message}`, "param_invalid");
    throw error;
  }
}

/** The mode 1 request of an order under the gate's action and the caller's limits; a field outside the frames is `param_invalid`. */
export function judgeRequest(action: GateDecision["action"], order: JudgeOrder, limits: JudgeLimits): Uint8Array {
  const assets = limits.assets.map((a, i) => ({ asset: a.asset, cap: decimal(`limits.assets[${String(i)}].cap`, a.cap) }));
  const fields: OrderFields = {
    kind: order.kind,
    target: order.target,
    asset: order.asset,
    amount: decimal("order.amount", order.amount),
    ...(order.assetOut === undefined ? {} : { assetOut: order.assetOut }),
    ...(order.minOut === undefined ? {} : { minOut: decimal("order.minOut", order.minOut) }),
  };
  const ctx = framed("limits", () => encodeContext({ action, venues: limits.venues, assets }));
  const ord = framed("order", () => encodeOrder(fields));
  return framed("request", () => encodeJudgeRequest(ctx, ord));
}

/** The gate's decision on the envelope; for an EXIT only, its refusal instead of a throw. */
function gateOrRefusal(input: JudgeInput, nowMs: number | undefined): { readonly decision: GateDecision; readonly gate_error: null } | { readonly decision: null; readonly gate_error: JudgeGateError } {
  try {
    return { decision: runGate(input.prediction, input.params, input.attested, nowMs === undefined ? {} : { nowMs }), gate_error: null };
  } catch (error) {
    const code = toolErrorCode(error);
    if (input.order.kind !== "EXIT" || code === undefined || !(error instanceof Error)) throw error;
    return { decision: null, gate_error: { code, message: error.message } };
  }
}

/** Runs the gate, then the kernel on the order under the gate's action (abstain for an EXIT whose envelope the gate refused).
 *  Throws the gate's tool errors for any order but an EXIT, and `param_invalid` for a field outside the frames, before any kernel
 *  runs. */
export function runJudge(input: JudgeInput, options: JudgeRunOptions = {}): JudgeOutput {
  const gate = gateOrRefusal(input, options.nowMs);
  const request = judgeRequest(gate.decision === null ? "abstain" : gate.decision.action, input.order, input.limits);
  const answer = options.kernel === undefined ? null : options.kernel(request);
  const verdict = answer === null ? undefined : readVerdict(answer.status, answer.stdout);
  const allow = verdict?.allow === true;
  return {
    decision: gate.decision,
    gate_error: gate.gate_error,
    kernel_verdict: allow ? "allow" : "deny",
    kernel_reason: verdict === undefined ? "unavailable" : verdict.allow ? null : verdict.reason,
    reduce_only: allow && input.order.kind === "EXIT",
    kernel_request_sha256: createHash("sha256").update(request).digest("hex"),
  };
}

/** The honesty text of an answer that carries the kernel's verdict on the order (an allow, or a deny with one of the kernel's
 *  own reasons), served in `content`: what an allow says, and what it does not. */
export const JUDGE_LABEL =
  "Genkan's Lean kernel judged this order under a context made of this call's own gate decision (its action) and the caller's " +
  "limits (venues, assets and caps). An allow says the order passes the kernel's rules and nothing more: the kernel knows no " +
  "balance, position, price or venue rule; a cap holds one order, not a total; a minOut above 0 is not a slippage bound; and an " +
  "EXIT passes on a listed venue whatever the gate decided, so it is marked reduce_only and must be executed reduce-only. The " +
  "harness places no order.";

/** The honesty text of an answer that carries no verdict of the kernel on the order. */
export const JUDGE_NO_VERDICT_LABEL =
  "Genkan's Lean kernel gave no verdict on this order: no kernel ran (unavailable), the kernel refused the request (refused), or " +
  "its answer was not a verdict (unreadable). The order is denied, and nothing here says whether it would pass the kernel's " +
  "rules. The harness places no order.";

/** The honesty text of an answer that carries the kernel's verdict on an EXIT whose envelope the gate refused. */
export const JUDGE_EXIT_LABEL =
  "The gate refused this call's envelope (gate_error says why), so there is no gate decision. The order is an EXIT, which " +
  "Genkan's Lean kernel judges whatever the action: it judged it under the action abstain and the caller's limits (venues, assets " +
  "and caps). An allow says the EXIT targets a listed venue and nothing more: the kernel knows no balance, position, price or " +
  "venue rule, so it is marked reduce_only and must be executed reduce-only. The harness places no order.";

/** The reasons that carry no verdict of the kernel on the order. */
export const JUDGE_NO_VERDICT_REASONS: readonly JudgeReason[] = ["refused", "unreadable", "unavailable"];

/** The honesty text of an answer: JUDGE_NO_VERDICT_LABEL for a reason of JUDGE_NO_VERDICT_REASONS, else JUDGE_EXIT_LABEL with no
 *  gate decision, else JUDGE_LABEL. */
export function judgeHonestyText(o: Pick<JudgeOutput, "decision" | "kernel_reason">): string {
  if (o.kernel_reason !== null && JUDGE_NO_VERDICT_REASONS.includes(o.kernel_reason)) return JUDGE_NO_VERDICT_LABEL;
  return o.decision === null ? JUDGE_EXIT_LABEL : JUDGE_LABEL;
}

/** The verdict line that follows the honesty text, for clients that read `content` only (derived from the output). */
export function judgeVerdictSummary(o: JudgeOutput): string {
  const digest = `${o.kernel_request_sha256.slice(0, 8)}...${o.kernel_request_sha256.slice(-6)}`;
  const gate = o.decision === null ? `action=none gate_error=${o.gate_error?.code ?? "none"}` : `action=${o.decision.action}`;
  return `verdict kernel=${o.kernel_verdict} reason=${o.kernel_reason ?? "none"} reduce_only=${String(o.reduce_only)} ${gate} kernel_request_sha256=${digest}`;
}

/** The served description (tools/list, /openapi.json). */
export const JUDGE_TOOL_DESCRIPTION =
  "Order gate (Genkan). Runs the gate on the same envelope as `gate` (prediction, params and an optional attested, with the same " +
  "rules and the same refusals), then hands Genkan's Lean kernel (mode 1) the `order` under a context made of that decision's " +
  "action and the caller's `limits` (venues, and assets with their caps). A refusal of the gate is the tool's refusal for any " +
  "order but an EXIT: an EXIT is judged even then, under the action abstain, with `decision` null and the refusal in " +
  "`gate_error`. The tool reads the kernel's answer fail-closed: `allow` only for exit 0 " +
  "and exactly the line `allow`; anything else is a deny, with the kernel's reason, `refused` (the kernel refused the request), " +
  "`unreadable` (any other answer) or `unavailable` (no kernel ran). The kernel's rules, which its theorems state: a TRANSFER or " +
  "an APPROVE is always denied; the target must be a listed venue; an EXIT on a listed venue is then allowed whatever the action, " +
  "and `reduce_only` is true: execute it reduce-only; any other order needs the action commit, a listed asset and an amount at " +
  "most its cap; a SWAP also needs a listed `assetOut` and a `minOut` above 0. Amounts, caps and `minOut` are decimal strings of " +
  "integers below 2^128; names are 1 to 128 characters of 0-9, a-z, `:`, `.`, `_`, `/`, `@`, `-`. The kernel knows no balance, " +
  "position, price or venue rule, and a cap holds one order, not a total. The tool only returns a verdict; it never places an order.";
