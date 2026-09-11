/**
 * Harness — the `attest` tool (ADR-M005 D1/D3/D8/D9, PLAN H3).
 *
 * Exposes the REAL Shōgen adapter (`fromShogen`, imported from `@monark/monark`, NEVER re-implemented): it
 * projects the ONE committed, sha256-pinned Shōgen witness (Binance BTCUSDT, self-notarized) into the
 * frozen `AttestedPrice`, wrapped in the K-1 envelope `{ price, provenance, label }`. The verifier is NOT
 * run at call time — this is a projection of an artifact that was verified once, at capture.
 *
 * NO side effects (K-8): like everything under `src/tools/`, this file reads no file, opens no socket,
 * spawns no process, makes no network request, and writes no environment variable. The one fixture read
 * lives in `../shogen-fixture.ts` (src/ level); this tool imports the already-loaded triple and a pure
 * adapter, so the static side-effect scan of the tool implementations stays meaningful.
 *
 * HONESTY (N-4/K-1/D9): every honesty statement rides in the tool DESCRIPTION, the MCP text content, and
 * the envelope `label` — NEVER inside the frozen `price`. `price` alone passes `assertClosedAttestedPrice`;
 * `provenance`/`label` live outside it (K-1). An adapter refusal is a TOOL ERROR (fail-closed), never a
 * silent price.
 */
import { fromShogen, isAdapterError, DEMONSTRATIVE_LABEL } from "@monark/monark";
import type { AdapterOutput } from "@monark/monark";
import { assertClosedAttestedPrice, assertNoForbiddenKey } from "@monark/contracts";
import { SHOGEN_LOT_BYTES, SHOGEN_VERDICT_TEXT, SHOGEN_CONSTAT } from "../shogen-fixture.ts";

export const ATTEST_TOOL_NAME = "attest";

/**
 * Tool description (N-4/K-9): declares the projection is of a COMMITTED, previously Shōgen-verified witness
 * and that the verifier is NOT executed at call time. It makes NO probative or call-time claim and carries
 * no banned honesty vocab; the only `verified` is the past-tense compound `Shōgen-verified`, a descriptor
 * of the committed artifact (asserted by `attest_makes_no_probative_claim`).
 */
export const ATTEST_TOOL_DESCRIPTION =
  "projection of a committed Shōgen-verified witness (Binance BTCUSDT, self-notarized); " +
  "the verifier is NOT executed at call time.";

/** A tool-level error (fail-closed): an adapter refusal is surfaced as a tool error, never a silent price. */
export class AttestToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttestToolError";
  }
}

/**
 * Pure projection of a Shōgen witness triple into the K-1 `AdapterOutput`. Fail-closed: a named adapter
 * refusal (`isAdapterError`) becomes an `AttestToolError`, never a silent or partial price. Re-affirms the
 * closed posture on `price` (fromShogen already ensures it; this is defense in depth, D9). Exposed so
 * the fail-closed path is exercisable (a negated verdict), while the tool projects only the committed triple.
 */
export function projectShogen(lot: Uint8Array, verdictText: string, constat: unknown): AdapterOutput {
  const result = fromShogen(lot, verdictText, constat);
  if (isAdapterError(result)) {
    throw new AttestToolError(`attest refused the witness: ${result.reason} — ${result.message}`);
  }
  // Honesty gate (D9/K-1): the FROZEN contract is `price` alone; label/provenance ride the envelope.
  assertClosedAttestedPrice(result.price);
  assertNoForbiddenKey(result.price);
  return result;
}

/** Project the ONE committed Shōgen witness fixture (the tool takes no caller parameters). */
export function runAttest(): AdapterOutput {
  return projectShogen(SHOGEN_LOT_BYTES, SHOGEN_VERDICT_TEXT, SHOGEN_CONSTAT);
}

/** The honesty text carried in the MCP tool result content (never inside the frozen price, K-1). */
export function attestHonestyText(): string {
  return (
    "Projection of a committed, previously Shōgen-verified witness (Binance BTCUSDT, self-notarized); " +
    "the verifier is NOT executed at call time. Label: " +
    DEMONSTRATIVE_LABEL +
    "."
  );
}
