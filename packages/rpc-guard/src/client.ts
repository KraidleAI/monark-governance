// MONARK rpc-guard - the ONE budgeted client (GARDE-HELIUS task 1). A single handle owns metering + ledgering for
// every paid operator. The API speaks LABELS, never URLs: `call(op, method, params)` takes an OperatorLabel (a
// branded string), and the injected transport is invoked with that SAME label (C-3). This module resolves NO env
// key and holds NO endpoint URL (the default transport in ./transport.ts is the sole place a label -> URL happens);
// so the CI grep (T4) allowlists only ./transport.ts, and this file stays green.
//
// Retry is exactly ONE layer, at the CALLER (C-4): `client.call` makes EXACTLY one attempt (one write-ahead ledger
// line + one transport invocation) and propagates the fault without retrying. A caller's withRetry re-enters
// `call`, so every attempt is counted. BudgetExceededError is re-thrown first by those retries (calque bell).
import { BudgetExceededError } from "./errors.ts";

/** A LABEL for an independent paid operator (helius, chainstack, ...) - a branded string, NEVER a URL (ruling Q7). */
export type OperatorLabel = string & { readonly __brand: "OperatorLabel" };
/** The injected transport receives the LABEL, never the resolved endpoint URL (C-3, test T1). */
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

/** Per-operator metering class. `credits` throws (fail-closed) on a method absent from the closed table (T15).
 *  Decision 115: every PAID operator (unit != "keyless") MUST carry a `cycleCap`, else makeClient fail-closes. */
export interface OperatorClass {
  readonly unit: "credits" | "requests" | "keyless";
  readonly credits?: (method: string) => number;
  readonly cycleCap?: number;
}

/** Course inputs, ALL required, fail-closed before any network (C-8/C-10, ruling Q4, test T12). */
export interface RunLimits {
  readonly maxCalls: number;
  readonly maxCredits: number;
  readonly methodCaps: Readonly<Record<string, number>>;
  readonly cycleFloor: number;
}
export interface ClientConfig {
  /** label -> metering class, resolved from env by the caller/transport; carries NO URL. */
  readonly operators: Readonly<Record<string, OperatorClass>>;
  readonly limits: RunLimits;
}

/** Append-only sink. `append` is the WRITE-AHEAD point: it is called BEFORE the transport, so a crash in flight
 *  OVER-counts, never under-counts (adv-2). The durable cycle ledger (./ledger.ts) implements this interface; the
 *  in-memory sink below is the 1a-i default (run caps only; the cycle prior is the floor). */
export interface LedgerSink {
  append(rec: AttemptRecord): void;
  priorCredits(): number;
}

export class InMemorySink implements LedgerSink {
  readonly records: AttemptRecord[] = [];
  private readonly floor: number;
  constructor(floor = 0) { this.floor = floor; } // no parameter property: node's native type-stripping forbids it
  append(rec: AttemptRecord): void { this.records.push(rec); }
  priorCredits(): number {
    const sum = this.records.reduce((a, r) => a + (r.outcome === "attempted" ? r.credits : 0), 0);
    return Math.max(this.floor, sum);
  }
}

export interface BudgetedClient {
  operators(): readonly OperatorLabel[];
  call(op: OperatorLabel, method: string, params: readonly unknown[]): Promise<unknown>;
  tick(op: OperatorLabel, kind: string): void;
  spent(): { attempts: number; credits: number };
}

/** used + add > cap. Shared by the METHOD cap and the CYCLE cap (mutant "cap ignored" replaces the body). */
const exceeds = (used: number, add: number, cap: number): boolean => used + add > cap;

export function makeClient(config: ClientConfig, sink: LedgerSink, opts: { transport: Transport }): BudgetedClient {
  const { operators: ops, limits } = config;
  // Required course inputs - fail-closed BEFORE any transport (T12). A default here would reopen HELIUS-1.
  if (!(limits.maxCalls > 0)) throw new BudgetExceededError("rpc-guard: --max-calls required (> 0), fail-closed");
  if (!(limits.maxCredits > 0)) throw new BudgetExceededError("rpc-guard: --max-credits required (> 0), fail-closed");
  if (limits.methodCaps === null || typeof limits.methodCaps !== "object") throw new BudgetExceededError("rpc-guard: --method-caps required (no default), fail-closed");
  if (typeof limits.cycleFloor !== "number" || !Number.isFinite(limits.cycleFloor)) throw new BudgetExceededError("rpc-guard: --cycle-floor required, fail-closed");
  // Decision 115: a paid operator without a cycle cap, or a floor already past the cap, refuses at construction.
  for (const label of Object.keys(ops)) {
    const cls = ops[label]!;
    if (cls.unit !== "keyless") {
      if (cls.cycleCap === undefined) throw new BudgetExceededError(`rpc-guard: paid operator '${label}' has no cycle cap (decision 115), fail-closed`);
      if (limits.cycleFloor > cls.cycleCap) throw new BudgetExceededError(`rpc-guard: cycle floor ${String(limits.cycleFloor)} exceeds cap ${String(cls.cycleCap)} for '${label}', fail-closed`);
    }
  }
  const transport = opts.transport;
  let attempts = 0, runCredits = 0;
  const methodAttempts: Record<string, number> = {};

  const classOf = (op: string): OperatorClass => {
    const c = ops[op];
    if (c === undefined) throw new BudgetExceededError(`rpc-guard: unknown operator '${op}', fail-closed`);
    return c;
  };
  const costOf = (cls: OperatorClass, method: string): number => {
    if (cls.unit === "keyless") return 0;
    if (cls.unit === "requests") return 1;
    if (!cls.credits) throw new Error("rpc-guard: a credits operator has no tariff fn (misconfigured)");
    return cls.credits(method); // throws (fail-closed) on an unknown method - T15
  };
  const refuse = (op: string, method: string, reason: string): never => {
    sink.append({ op, method, outcome: "refused", credits: 0, reason });
    throw new BudgetExceededError(`rpc-guard: ${reason} cap reached (fail-closed)`);
  };
  const meter = (op: string, method: string): number => {
    const cls = classOf(op);
    const cost = costOf(cls, method);
    if (attempts + 1 > limits.maxCalls) refuse(op, method, "run_calls");
    if (runCredits + cost > limits.maxCredits) refuse(op, method, "run_credits");
    const mcap = limits.methodCaps[method];
    if (mcap !== undefined && exceeds(methodAttempts[method] ?? 0, 1, mcap)) refuse(op, method, "method_cap");
    // Cycle cap re-evaluated at EACH call. priorCredits() is sum attempted-so-far in the (durable) cycle ledger,
    // floored (max(floor, sum)); `meter` runs BEFORE `commit`, so this attempt is not yet in it - hence + cost, and
    // NOT + runCredits (the run's write-ahead attempts are already inside priorCredits()).
    if (cls.unit !== "keyless" && cls.cycleCap !== undefined && exceeds(sink.priorCredits(), cost, cls.cycleCap)) refuse(op, method, "cycle_cap");
    return cost;
  };
  const commit = (op: string, method: string, cost: number): void => {
    sink.append({ op, method, outcome: "attempted", credits: cost }); // WRITE-AHEAD (before the transport)
    attempts += 1; runCredits += cost; methodAttempts[method] = (methodAttempts[method] ?? 0) + 1;
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
