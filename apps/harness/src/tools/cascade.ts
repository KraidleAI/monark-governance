/**
 * Harness — the `cascade` tool (ADR-M005 D1/D4/D8/D9, PLAN H2).
 *
 * A PURE composition of the REAL UKEMI primitives (imported from `@monark/ukemi`, NEVER
 * re-implemented): it runs an Eisenberg-Noe clearing (`fictitiousDefault`, the greatest clearing vector
 * L* in <=n rounds) of an interbank system, reads each cleared
 * node as a leveraged position, runs `liquidableAmount` under a caller-carried 24h shock, and emits
 * the estimated liquidable amount as a closed, frozen `Prediction` (task_class
 * `cascade-liquidable-24h`). It returns a `Prediction`, NOT a `GateDecision` (atomicity, D4): the
 * `gate` tool consumes this Prediction downstream.
 *
 * NO side effects (K-8): this file — like everything under `src/tools/` — imports no
 * `node:fs`/`node:net`/`node:child_process`, calls no `fetch`, writes no `process.env`, and reads no
 * clock. `producedAt` is INJECTED via the input (hash stability, D4/D7), exactly as the gate takes its
 * instant from the Prediction rather than the wall clock.
 *
 * Wiring `fictitiousDefault -> liquidableAmount -> yhat` (composed here in TS, the ADR leaves it to the lot):
 *   1. `fictitiousDefault({L, e})` with alpha=beta=1 (Eisenberg-Noe) yields the largest clearing vector L*
 *      (the greatest fixed point, GA / fictitious default, <= n rounds — Thm 3.7). This is exactly
 *      `clearing().pPlus` WITHOUT the 100000-iteration `clearingFromBelow` least-vector pass cascade never
 *      reads (H7 self-DoS fix): `clearing()` obtains its pPlus by calling this same function (clearing.ts:186).
 *   2. each node i is read as a leveraged position on its CLEARED balance sheet:
 *        collateral value  = e_i + interbank receipts under L* (= sum_j Pi[j][i] * L*_j)  <- clearing feeds in
 *        debt              = nominal obligations pbar_i
 *        liquidation K     = 1
 *   3. `liquidableAmount(positions, shock)` sums the debts of the nodes whose cleared value, once
 *        shocked by the 24h fraction, no longer covers their obligations.
 *   4. yhat = that liquidable debt; `emitPrediction(yhat, producedAt)` -> the frozen Prediction.
 * At shock=0 the liquidable set is exactly the E&N default set {i : L*_i < pbar_i}: the clearing is
 * load-bearing, not decorative (asserted by `cascade_wires_clearing_to_yhat`). Shocking the WHOLE
 * cleared value is a v0 simplification (no source supports shocking interbank receivables); this is
 * DECLARED here and in the tool description, never asserted as a validated systemic-risk model. All
 * honesty rides in the description and the MCP text content, NEVER inside the Prediction (K-1).
 */
import {
  fictitiousDefault,
  liquidableAmount,
  emitPrediction,
  pbarOf,
  piOf,
} from "@monark/ukemi";
import type { FinancialSystem, Position, LiquidableResult } from "@monark/ukemi";
import { assertClosedPrediction, assertNoForbiddenKey } from "@monark/contracts";
import type { Prediction } from "@monark/contracts";
import { CASCADE_UNCALIBRATED_SENTENCE } from "./gate.ts";

export const CASCADE_TOOL_NAME = "cascade";

/**
 * Resource cap (Lot H6, deploy-hardening): the maximum node count `n` (`|L| = |e|`) the cascade accepts.
 * The harness is a public, unauthenticated compute surface co-located with the vitrine on one VPS, so `n`
 * must be bounded. cascade computes the largest clearing vector L* via `fictitiousDefault`: <= n rounds
 * (Thm 3.7, clearing.ts:104-108), each round a Gaussian solve on the defaulting block O(|D|^3) <= O(n^3),
 * so <= O(n^4) worst case (~1.7e7 ops at n=64), deterministic and always terminating. (H7 self-DoS fix:
 * cascade no longer calls `clearing()`, which ALSO runs a 100000-iteration `clearingFromBelow` least-vector
 * pass — O(n^2)/iter, ~1e9 ops on a crafted cyclic/tiny-e system — that cascade never consumed; the prior
 * "< 3e5 ops" claim was FALSE in that worst case.) The cap stays defense-in-depth; 64 nodes covers any
 * realistic interbank fixture. Enforced TWICE, fail-closed: the tool-input projection sets `maxItems` at the SDK boundary
 * (`schema-projection.ts`, which imports THIS constant) AND `validateCascadeInput` rejects `n >
 * CASCADE_MAX_NODES` below — belt-and-suspenders behind the schema, so a direct in-process tool call
 * (bypassing the SDK boundary, e.g. the HTTP mirror or a test) is capped too. This file stays pure/no-I/O
 * (K-8), so `schema-projection.ts` -> `cascade.ts` -> `gate.ts` -> `calibration.ts` has no cycle back here.
 */
export const CASCADE_MAX_NODES = 64;

/**
 * Tool description (D4/D9/K-1): declares the node->position mapping, the v0 shock simplification, that
 * yhat is a monetary amount (a single point HIKAE conformalizes) and no guarantee, and carries the
 * K-4e honesty sentence. Carries NO probability/score claim token (asserted by
 * `cascade_description_makes_no_probability_claim`) and no banned vocab.
 */
export const CASCADE_TOOL_DESCRIPTION =
  "Estimated liquidable amount from the real UKEMI cascade primitives (imported, never re-implemented): " +
  "an Eisenberg-Noe clearing of the interbank system (L, e) with alpha=beta=1 yields the largest " +
  "clearing vector L*; each node is then read as a leveraged position — collateral is its cleared " +
  "balance-sheet value (external assets plus interbank receipts under L*), debt is its nominal " +
  "obligations, liquidation threshold K=1 — and liquidableAmount sums the debts of the nodes whose " +
  "cleared value, once shocked by the caller-carried 24h fraction, no longer covers their obligations. " +
  "Shocking the whole cleared value is a v0 simplification; no source supports shocking interbank " +
  "receivables. yhat is that liquidable amount: a monetary quantity in the reference asset, a single " +
  "point that HIKAE conformalizes downstream — no guarantee, no score. Downstream, " +
  CASCADE_UNCALIBRATED_SENTENCE +
  ".";

/**
 * Non-frozen tool input (ADR-M005 D4/D8), declared field by field — NEVER in schemas/. `L`/`e` are the
 * real UKEMI `FinancialSystem`; `shock` is the declared 24h fixture fraction; `producedAt` is the
 * caller-carried instant injected for hash stability.
 */
export interface CascadeInput {
  /** Nominal interbank liabilities matrix L[i][j] = what node i owes node j. Square, >= 0, zero diagonal. */
  readonly L: readonly (readonly number[])[];
  /** External assets (liquidation value) per node at the clearing date. */
  readonly e: readonly number[];
  /** 24h collateral price shock fraction in [0,1] — a DECLARED fixture parameter, not a dynamics model. */
  readonly shock: number;
  /** Caller-carried RFC3339 instant, injected for hash stability (D4); the tool reads no clock. */
  readonly producedAt: string;
}

/** A tool-level error (K-4a analog): surfaced by the MCP seam as a tool error, never a silent output. */
export class CascadeToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CascadeToolError";
  }
}

/** RFC3339 date-time (matches the frozen Prediction.produced_at `format: date-time`). */
const RFC3339 = /^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2})$/;

/** Server-side validation of the non-frozen input (K-4a). Invalid => tool error, never a silent output. */
function validateCascadeInput(input: CascadeInput): void {
  const n = input.L.length;
  if (n === 0) throw new CascadeToolError("invalid 'L': expected a non-empty square matrix");
  // Resource cap (Lot H6): bound `n` BEFORE the O(n^2) validation loop and the bounded fictitious-default
  // L* solve (<= n rounds, H7), so a crafted huge `L` cannot exhaust the shared VPS even on a direct tool
  // call (schema `maxItems` is the first line at the SDK boundary; this is the fail-closed backstop).
  // |L| == |e| is enforced below.
  if (n > CASCADE_MAX_NODES) {
    throw new CascadeToolError(
      `invalid 'L': ${String(n)} nodes exceeds the cap of ${String(CASCADE_MAX_NODES)} (resource guard, Lot H6)`,
    );
  }
  for (let i = 0; i < n; i++) {
    const row = input.L[i];
    if (row === undefined || row.length !== n) {
      throw new CascadeToolError(`invalid 'L': row ${String(i)} must have length ${String(n)} (square matrix)`);
    }
    for (let j = 0; j < n; j++) {
      const v = row[j];
      if (v === undefined || !Number.isFinite(v) || v < 0) {
        throw new CascadeToolError(`invalid 'L[${String(i)}][${String(j)}]': expected a finite number >= 0`);
      }
      if (i === j && v !== 0) {
        throw new CascadeToolError(`invalid 'L[${String(i)}][${String(i)}]': the diagonal must be 0`);
      }
    }
  }
  if (input.e.length !== n) {
    throw new CascadeToolError(`invalid 'e': expected an array of length ${String(n)} (one value per node)`);
  }
  for (let i = 0; i < n; i++) {
    const v = input.e[i];
    if (v === undefined || !Number.isFinite(v) || v < 0) {
      throw new CascadeToolError(`invalid 'e[${String(i)}]': expected a finite number >= 0`);
    }
  }
  if (!Number.isFinite(input.shock) || input.shock < 0 || input.shock > 1) {
    throw new CascadeToolError("invalid 'shock': expected a finite number in [0,1]");
  }
  if (!RFC3339.test(input.producedAt)) {
    throw new CascadeToolError("invalid 'producedAt': expected an RFC3339 date-time string");
  }
}

/**
 * clearing -> positions -> liquidableAmount (the wired intermediate, exposed for verification). Reads
 * each cleared node as a leveraged position (collateral = cleared balance-sheet value, debt = nominal
 * obligations, K=1); the clearing vector L* feeds the interbank-receipts term, so the E&N result is
 * load-bearing. Returns the raw `LiquidableResult` (ids + total debt), before the frozen projection.
 */
export function cascadeLiquidable(input: CascadeInput): LiquidableResult {
  validateCascadeInput(input);
  const sys: FinancialSystem = { L: input.L, e: input.e };
  // Eisenberg-Noe largest clearing vector L* via fictitious default / GA (alpha=1, beta=1 defaults, D4).
  // IDENTICAL to `clearing().pPlus`: clearing() computes its pPlus by calling exactly this function
  // (clearing.ts:186) and cascade consumes ONLY L*. Calling fictitiousDefault directly SKIPS the
  // 100000-iteration `clearingFromBelow` least-vector pass clearing() also runs (never read here) —
  // fictitiousDefault is bounded to <= n rounds (Thm 3.7, clearing.ts:104-108), killing the checkpoint-2
  // self-DoS: a crafted cyclic/tiny-e system can no longer make cascade burn ~1e9 ops on the event loop.
  const { p: pPlus } = fictitiousDefault(sys);
  const pbar = pbarOf(input.L);
  const Pi = piOf(input.L, pbar);
  const positions: Position[] = pbar.map((pbi, i) => {
    let inflow = 0; // interbank receipts under the clearing vector L*: sum_j Pi[j][i] * L*_j.
    for (let j = 0; j < pPlus.length; j++) inflow += (Pi[j]?.[i] ?? 0) * (pPlus[j] ?? 0);
    const clearedValue = (input.e[i] ?? 0) + inflow;
    return { id: String(i), collateralQty: 1, collateralPrice: clearedValue, liqThreshold: 1, debt: pbi };
  });
  return liquidableAmount(positions, input.shock);
}

/**
 * Compose the real primitives into a closed, frozen `Prediction` (D4). yhat = the estimated liquidable
 * amount (a monetary point). Throws `CascadeToolError` on invalid input. Honesty stays OUT of the
 * Prediction (K-1): the closed-check + forbidden-key guards refuse any extra key on the way out.
 */
export function runCascade(input: CascadeInput): Prediction {
  const liquidable = cascadeLiquidable(input);
  const yhat = liquidable.liquidableDebt; // target A: total obligations tipped into the liquidable region.
  const prediction = emitPrediction(yhat, input.producedAt);
  // Honesty gates (D9): the wire is the frozen, closed Prediction — nothing else.
  assertClosedPrediction(prediction);
  assertNoForbiddenKey(prediction);
  return prediction;
}

/** The honesty text carried in the MCP tool result content (never inside the frozen Prediction, K-1). */
export function cascadeHonestyText(): string {
  return (
    "yhat is the estimated liquidable amount (a monetary quantity in the reference asset), a single " +
    "point that HIKAE conformalizes downstream; no guarantee, no score. " +
    CASCADE_UNCALIBRATED_SENTENCE +
    "."
  );
}
