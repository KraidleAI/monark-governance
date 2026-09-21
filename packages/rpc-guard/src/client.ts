// MONARK rpc-guard - the ONE budgeted client (GARDE-HELIUS task 1). A single handle meters + ledgers every paid
// operator. The API speaks LABELS, never URLs (C-3): call(op, method, params) takes an OperatorLabel; the injected
// transport is invoked with that SAME label. This module resolves NO env key and holds NO URL (the default transport
// in ./transport.ts is the sole label -> URL site). It receives a durable PER-OPERATOR ledger per operator and, at
// CONSTRUCTION, validates every input, then ACQUIRES the per-operator exclusive lock (C-V-4) BEFORE any transport,
// then FREEZES each operator's cycle prior (C-V-1). Retry is exactly ONE layer, at the CALLER (C-4): call makes
// EXACTLY one attempt (one write-ahead ledger line + one transport invocation) and propagates without retrying.
import { BudgetExceededError } from "./errors.ts";
import { acquireLock } from "./lock.ts";
import type { CycleLedger } from "./ledger.ts";

/** A LABEL for an independent paid operator (helius, chainstack, ...) - a branded string, NEVER a URL (ruling Q7). */
export type OperatorLabel = string & { readonly __brand: "OperatorLabel" };
/** The injected transport receives the LABEL, never the resolved endpoint URL (C-3, probe P6). */
export type Transport = (op: OperatorLabel, method: string, params: readonly unknown[]) => Promise<unknown>;

export type Outcome = "attempted" | "refused" | "reconciled" | "unlocked";
/** One append-only ledger fact: a REQUEST by (op, method) with its DERIVED credits (0 for a refused/keyless). */
export interface AttemptRecord {
  readonly op: string;
  readonly method: string;
  readonly outcome: Outcome;
  readonly credits: number;
  readonly reason?: string;
}

/** Per-operator metering class. Decision 115: every PAID operator (unit != "keyless") MUST carry a cycleCap. */
export interface OperatorClass {
  readonly unit: "credits" | "requests" | "keyless";
  readonly credits?: (method: string) => number; // throws on a method absent from the closed table (routed to refuse)
  readonly cycleCap?: number;
}

/** Course inputs, ALL required, fail-closed before any network (C-8/C-10/C-V-5, T12). */
export interface RunLimits {
  readonly maxCalls: number;
  readonly maxCredits: number;
  readonly methodCaps: Readonly<Record<string, number>>;
  readonly cycleFloor: number;
}
export interface ClientConfig {
  readonly operators: Readonly<Record<string, OperatorClass>>;
  readonly limits: RunLimits;
}

export interface BudgetedClient {
  operators(): readonly OperatorLabel[];
  call(op: OperatorLabel, method: string, params: readonly unknown[]): Promise<unknown>;
  tick(op: OperatorLabel, kind: string): void;
  spent(): { attempts: number; credits: number };
}

/** used + add > cap. Shared by the METHOD cap and the CYCLE cap (mutant "plafond ignore" replaces the body). */
const exceeds = (used: number, add: number, cap: number): boolean => used + add > cap;

export function makeClient(config: ClientConfig, ledgers: ReadonlyMap<string, CycleLedger>, opts: { transport: Transport }): BudgetedClient {
  const { operators: ops, limits } = config;
  // (1) GUARDS - every input validated BEFORE any lock (a bad config must never leave a stale lock). Fail-closed (T12).
  if (!(limits.maxCalls > 0)) throw new BudgetExceededError("rpc-guard: --max-calls required (> 0), fail-closed");
  if (!(limits.maxCredits > 0)) throw new BudgetExceededError("rpc-guard: --max-credits required (> 0), fail-closed");
  if (typeof limits.cycleFloor !== "number" || !Number.isFinite(limits.cycleFloor)) throw new BudgetExceededError("rpc-guard: --cycle-floor required, fail-closed");
  for (const label of Object.keys(ops)) {
    const cls = ops[label]!;
    if (!ledgers.has(label)) throw new BudgetExceededError(`rpc-guard: no ledger for operator '${label}', fail-closed`);
    if (cls.unit !== "keyless") {
      if (cls.cycleCap === undefined) throw new BudgetExceededError(`rpc-guard: paid operator '${label}' has no cycle cap (decision 115), fail-closed`);
      if (limits.cycleFloor > cls.cycleCap) throw new BudgetExceededError(`rpc-guard: cycle floor ${String(limits.cycleFloor)} exceeds cap ${String(cls.cycleCap)} for '${label}', fail-closed`);
      if (Object.keys(limits.methodCaps).length === 0) throw new BudgetExceededError(`rpc-guard: --method-caps empty for paid operator '${label}' (C-V-5, no default), fail-closed`);
    }
  }
  // (2) LOCKS - per paid operator, before any transport (C-V-4). A second constructor on the same dir => LockHeldError.
  for (const label of Object.keys(ops)) if (ops[label]!.unit !== "keyless") acquireLock(ledgers.get(label)!.cycleDir, label);
  // (3) FREEZE the cycle prior per operator at open = max(floor, Sigma_at_open) (C-V-1).
  const priorFrozen = new Map<string, number>();
  for (const [label, led] of ledgers) priorFrozen.set(label, led.priorAtOpen());

  const transport = opts.transport;
  let attempts = 0, runCredits = 0;
  const methodAttempts: Record<string, number> = {};
  const runCreditsByOp = new Map<string, number>();

  const classOf = (op: string): OperatorClass => {
    const c = ops[op];
    if (c === undefined) throw new BudgetExceededError(`rpc-guard: unknown operator '${op}', fail-closed`);
    return c;
  };
  const refuse = (op: string, method: string, reason: string): never => {
    ledgers.get(op)!.append({ op, method, outcome: "refused", credits: 0, reason });
    throw new BudgetExceededError(`rpc-guard: ${reason} (fail-closed)`);
  };
  const costOf = (op: string, cls: OperatorClass, method: string): number => {
    if (cls.unit === "keyless") return 0;
    if (cls.unit === "requests") return 1;
    try { return cls.credits!(method); } catch { return refuse(op, method, "unknown_method"); } // C-V-6: ledgered, never a bare Error
  };
  const meter = (op: string, method: string): number => {
    const cls = classOf(op);
    const cost = costOf(op, cls, method);
    if (attempts + 1 > limits.maxCalls) refuse(op, method, "run_calls");
    if (runCredits + cost > limits.maxCredits) refuse(op, method, "run_credits");
    if (cls.unit !== "keyless") {
      const mcap = limits.methodCaps[method];
      if (mcap === undefined) refuse(op, method, "method_cap_unlisted"); // C-V-5: a paid method not listed is refused
      else if (exceeds(methodAttempts[method] ?? 0, 1, mcap)) refuse(op, method, "method_cap");
    }
    // Cycle cap (C-V-1): prior FROZEN at open + this run's credits FOR THIS OPERATOR + this attempt's cost > cap.
    if (cls.unit !== "keyless" && cls.cycleCap !== undefined && (priorFrozen.get(op) ?? 0) + (runCreditsByOp.get(op) ?? 0) + cost > cls.cycleCap) refuse(op, method, "cycle_cap");
    return cost;
  };
  const commit = (op: string, method: string, cost: number): void => {
    ledgers.get(op)!.append({ op, method, outcome: "attempted", credits: cost }); // WRITE-AHEAD (before the transport)
    attempts += 1; runCredits += cost; methodAttempts[method] = (methodAttempts[method] ?? 0) + 1;
    runCreditsByOp.set(op, (runCreditsByOp.get(op) ?? 0) + cost);
  };

  return {
    operators: () => Object.keys(ops) as OperatorLabel[],
    async call(op, method, params) {
      const cost = meter(op, method);
      commit(op, method, cost);
      return transport(op, method, params); // ONE attempt, no retry (C-4); the caller owns retry
    },
    tick(op, kind) { const cost = meter(op, kind); commit(op, kind, cost); },
    spent: () => ({ attempts, credits: runCredits }),
  };
}
