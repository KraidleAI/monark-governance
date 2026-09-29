// MONARK rpc-guard - the ONE budgeted client (GARDE-HELIUS task 1; multi-operator core GARDE-HELIUS-2). A single
// handle meters + ledgers every paid operator. The API speaks LABELS, never URLs (C-3): call(op, method, params)
// takes an OperatorLabel; the injected transport is invoked with that SAME label. This module resolves NO env key and
// holds NO URL (the default transport in ./transport.ts is the sole label -> URL site). It receives durable
// PER-OPERATOR ledgers (opened UNDER the lock by openGuardedClient, so each frozen prior reflects every prior writer)
// and FREEZES each operator's cycle prior. makeClient does NOT lock: the sole public path (openGuardedClient) acquires
// the per-operator locks BEFORE it opens the ledgers (C-2, "prior frozen AFTER the lock"). Retry is exactly ONE layer,
// at the CALLER (C-4): call makes EXACTLY one attempt (one write-ahead ledger line + one transport) and propagates.
import { BudgetExceededError, TransportError } from "./errors.ts";
import type { CycleLedger } from "./ledger.ts";

/** A LABEL for an independent paid operator (helius, chainstack, ...) - a branded string, NEVER a URL (ruling Q7). */
export type OperatorLabel = string & { readonly __brand: "OperatorLabel" };
/** The injected transport receives the LABEL, never the resolved endpoint URL (C-3, probe P6). */
export type Transport = (op: OperatorLabel, method: string, params: readonly unknown[]) => Promise<unknown>;

/** `settled` (GARDE-GTFA-FULL-TARIFF-1, D-2): the SIGNED delta from a reservation to the credits billed on the response. */
export type Outcome = "attempted" | "refused" | "reconciled" | "unlocked" | "settled" | "course_reconciled"; // ledger format v2 (ledger.ts LEDGER_FORMAT)
/** One append-only ledger fact: a REQUEST by (op, method) with its DERIVED cost in the op's unit (0 for refused/keyless). */
export interface AttemptRecord {
  readonly op: string;
  readonly method: string;
  readonly outcome: Outcome;
  readonly credits: number;
  readonly reason?: string;
}

/** D-2: what a response said - the transport's value, or the NAME of a RECEIVED failed response (Q-O1 (a)). */
export type SettleOutcome = { readonly result: unknown } | { readonly failed: string };
/** Per-operator metering class. Decision 115: every PAID operator (unit != "keyless") MUST carry a cycleCap. The
 *  `credits` fn returns the cost in the operator's UNIT (credits for helius, RU for chainstack) and THROWS on a method
 *  absent from its closed tariff (routed to a `refuse(unknown_method)`, never a bare Error). Keyless carries neither. */
export interface OperatorClass {
  readonly unit: "credits" | "ru" | "keyless";
  readonly credits?: (method: string, params?: readonly unknown[]) => number;
  /** D-2 (helius): the credits BILLED once the response is in, with a reason note; undefined = the reservation stands. */
  readonly settle?: (method: string, params: readonly unknown[], outcome: SettleOutcome) => { readonly credits: number; readonly note: string } | undefined;
  readonly cycleCap?: number;
}

/** Course inputs, ALL required except the OPTIONAL `cycleAttempts`, fail-closed before any network. PER OPERATOR (C-2): a `runCaps` RU cap NEVER sums with
 *  a credits cap, and a helius floor never governs chainstack. `maxCalls` is a run-wide ATTEMPT COUNT (unit-agnostic);
 *  `methodCaps` is a per-method attempt cap counted per (op, method) so a keyless method never spends a paid method's cap. */
export interface RunLimits {
  readonly maxCalls: number;
  readonly runCaps: Readonly<Record<string, number>>;
  readonly methodCaps: Readonly<Record<string, number>>;
  readonly cycleFloor: Readonly<Record<string, number>>;
  /** DRAND-RELAY-GET-1a (ADR-RPC-GUARD-DRAND-1 D-1 (b)): OPTIONAL per-cycle ATTEMPT cap of a KEYLESS operator (label -> an integer
   *  > 0). The prior is the count of `attempted` lines of its ledger at open; prior + this run + 1 > cap => refuse(cycle_attempts). */
  readonly cycleAttempts?: Readonly<Record<string, number>>;
}
export interface ClientConfig {
  readonly operators: Readonly<Record<string, OperatorClass>>;
  readonly limits: RunLimits;
}

export interface BudgetedClient {
  operators(): readonly OperatorLabel[];
  call(op: OperatorLabel, method: string, params: readonly unknown[]): Promise<unknown>;
  tick(op: OperatorLabel, kind: string): void;
  /** Run spend PER OPERATOR in that operator's unit (C-2): RU and credits are NEVER summed into one scalar. */
  spent(): { attempts: number; byOperator: Record<string, number> };
}

/** used + add > cap. Shared by the METHOD cap and the CYCLE cap (mutant "plafond ignore" replaces the body). */
const exceeds = (used: number, add: number, cap: number): boolean => used + add > cap;

/** The NON-ledger config guards (C-8/C-10/C-V-5, decision 115). Run BEFORE any lock by openGuardedClient (a bad
 *  config must never leave a stale lock) AND by makeClient (for direct callers). PER OPERATOR: each paid operator needs
 *  a run cap (> 0), a cycle cap, a finite floor <= that cap, and a non-empty method-cap table. Fail-closed. */
export function assertLimits(operators: Readonly<Record<string, OperatorClass>>, limits: RunLimits): void {
  if (!(limits.maxCalls > 0)) throw new BudgetExceededError("rpc-guard: --max-calls required (> 0), fail-closed");
  for (const label of Object.keys(operators)) {
    const cls = operators[label]!;
    if (cls.unit === "keyless") continue;
    const runCap = limits.runCaps[label];
    if (!(typeof runCap === "number" && runCap > 0)) throw new BudgetExceededError(`rpc-guard: run cap for paid operator '${label}' required (> 0), fail-closed`);
    if (cls.cycleCap === undefined) throw new BudgetExceededError(`rpc-guard: paid operator '${label}' has no cycle cap (decision 115), fail-closed`);
    const floor = limits.cycleFloor[label];
    if (typeof floor !== "number" || !Number.isFinite(floor)) throw new BudgetExceededError(`rpc-guard: cycle floor for '${label}' required, fail-closed`);
    if (floor > cls.cycleCap) throw new BudgetExceededError(`rpc-guard: cycle floor ${String(floor)} exceeds cap ${String(cls.cycleCap)} for '${label}', fail-closed`);
    if (Object.keys(limits.methodCaps).length === 0) throw new BudgetExceededError(`rpc-guard: --method-caps empty for paid operator '${label}' (C-V-5, no default), fail-closed`);
  }
  // DRAND-RELAY-GET-1a (D-1 (b)): an attempt cap is an integer > 0 on a KEYLESS operator (a paid cycle is capped in its unit);
  // a cap naming an operator this course did not request is validated (an integer > 0), then ignored (stricter than runCaps / cycleFloor, ignored unvalidated).
  for (const [label, cap] of Object.entries(limits.cycleAttempts ?? {})) if (!(Number.isInteger(cap) && cap > 0) || (operators[label]?.unit ?? "keyless") !== "keyless") throw new BudgetExceededError(`rpc-guard: cycle attempt cap for '${label}' must be an integer > 0 on a keyless operator, fail-closed`);
}

export function makeClient(config: ClientConfig, ledgers: ReadonlyMap<string, CycleLedger>, opts: { transport: Transport }): BudgetedClient {
  const { operators: ops, limits } = config;
  // (1) GUARDS - every input validated. NO lock here: openGuardedClient locks each operator BEFORE opening the
  //     ledgers, so by the time makeClient runs, the ledgers were read UNDER the lock (prior frozen after the lock).
  assertLimits(ops, limits);
  for (const label of Object.keys(ops)) if (!ledgers.has(label)) throw new BudgetExceededError(`rpc-guard: no ledger for operator '${label}', fail-closed`);
  // (2) FREEZE the cycle prior per operator = max(floor, Sigma_at_open attempted + settled) (C-V-1, D-2), each in its own unit.
  const priorFrozen = new Map<string, number>();
  for (const [label, led] of ledgers) priorFrozen.set(label, led.priorAtOpen());
  // DRAND-RELAY-GET-1a (D-1 (b)): the ATTEMPTS per operator in this cycle = its `attempted` lines at open (read under the lock) + this run's.
  const cycleAttempted = new Map<string, number>();
  for (const [label, led] of ledgers) cycleAttempted.set(label, led.priorAttemptsAtOpen());

  const transport = opts.transport;
  let attempts = 0;
  const runByOp = new Map<string, number>();            // run spend PER OPERATOR, in the op's unit (never summed)
  const methodAttempts: Record<string, number> = {};    // keyed by `${op}|${method}` (a keyless method never spends a paid cap)

  const classOf = (op: string): OperatorClass => {
    const c = ops[op];
    if (c === undefined) throw new BudgetExceededError(`rpc-guard: unknown operator '${op}', fail-closed`);
    return c;
  };
  const refuse = (op: string, method: string, reason: string): never => {
    ledgers.get(op)!.append({ op, method, outcome: "refused", credits: 0, reason });
    throw new BudgetExceededError(`rpc-guard: ${reason} (fail-closed)`);
  };
  const costOf = (op: string, cls: OperatorClass, method: string, params?: readonly unknown[]): number => {
    if (cls.unit === "keyless") return 0;
    try { return cls.credits!(method, params); } catch { return refuse(op, method, "unknown_method"); } // C-V-6: ledgered, never a bare Error
  };
  const meter = (op: string, method: string, params?: readonly unknown[]): number => {
    const cls = classOf(op);
    const cost = costOf(op, cls, method, params); // D-2: the RESERVATION (a gTfA page's worst case), read BEFORE any call
    if (attempts + 1 > limits.maxCalls) refuse(op, method, "run_calls");
    const acap = limits.cycleAttempts?.[op]; // assertLimits: held on a keyless operator only
    if (acap !== undefined && exceeds(cycleAttempted.get(op) ?? 0, 1, acap)) refuse(op, method, "cycle_attempts");
    if (cls.unit !== "keyless") {
      // run cost cap PER OPERATOR (C-2): the chainstack RU cap never sums with the helius credit spend.
      if ((runByOp.get(op) ?? 0) + cost > limits.runCaps[op]!) refuse(op, method, "run_credits");
      const mcap = limits.methodCaps[method];
      if (mcap === undefined) refuse(op, method, "method_cap_unlisted"); // C-V-5: a paid method not listed is refused
      else if (exceeds(methodAttempts[`${op}|${method}`] ?? 0, 1, mcap)) refuse(op, method, "method_cap");
      // Cycle cap (C-V-1): prior FROZEN at open + this run's spend FOR THIS OPERATOR + this attempt's cost > cap.
      if (cls.cycleCap !== undefined && (priorFrozen.get(op) ?? 0) + (runByOp.get(op) ?? 0) + cost > cls.cycleCap) refuse(op, method, "cycle_cap");
    }
    return cost;
  };
  const commit = (op: string, method: string, cost: number): string => {
    ledgers.get(op)!.append({ op, method, outcome: "attempted", credits: cost }); // WRITE-AHEAD (before the transport)
    attempts += 1;
    cycleAttempted.set(op, (cycleAttempted.get(op) ?? 0) + 1);
    runByOp.set(op, (runByOp.get(op) ?? 0) + cost);
    methodAttempts[`${op}|${method}`] = (methodAttempts[`${op}|${method}`] ?? 0) + 1;
    return ledgers.get(op)!.entries().at(-1)!.entry_sha256; // D-2: the sha a `settled` line names
  };
  // D-2: a `settled` line (by_op_method count 0: a correction, never a request) carries the SIGNED delta from the reservation
  // to the credits billed, iff they differ; runByOp moves by the same delta, so spent() and the run/cycle caps read the net.
  const settleLine = (op: string, method: string, sha: string, cost: number, s: { readonly credits: number; readonly note: string } | undefined): void => {
    if (s === undefined || s.credits === cost) return;
    ledgers.get(op)!.appendChained("settled", { [`${op}|${method}`]: 0 }, s.credits - cost, `settles:${sha};${s.note}`);
    runByOp.set(op, (runByOp.get(op) ?? 0) + s.credits - cost);
  };

  return {
    operators: () => Object.keys(ops) as OperatorLabel[],
    async call(op, method, params) {
      const cost = meter(op, method, params);
      const sha = commit(op, method, cost), settle = classOf(op).settle;
      let result: unknown;
      try { result = await transport(op, method, params); } // ONE attempt, no retry (C-4); the caller owns retry
      catch (e) {
        // Q-O1 (a): a RECEIVED failed response (HttpError, RpcError) is free (L-2); a network fault, a timeout, NonJsonBody or
        // RedirectBlocked keeps its reservation (outcome unknown). The settled line lands BEFORE the rethrow.
        if (e instanceof TransportError && (e.name === "HttpError" || e.name === "RpcError")) settleLine(op, method, sha, cost, settle?.(method, params, { failed: e.name }));
        throw e;
      }
      settleLine(op, method, sha, cost, settle?.(method, params, { result }));
      return result;
    },
    tick(op, kind) { const cost = meter(op, kind); commit(op, kind, cost); },
    spent: () => ({ attempts, byOperator: Object.fromEntries(runByOp) }),
  };
}
