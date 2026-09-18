// apps/site/components/sas/sas-audit.ts — the side-panel payload for an audit click (a deposit, the
// brume, or a point of the clear net). PURE and client-safe: the loaded required[] of the frozen
// contracts and the resolved reason flow IN as parameters (mirror of hikae-panel, which renders
// contract.required read server-side); this module reads no node:fs and cites no frozen field name.
//
// The panel labels come FROM the loaded required[] (never hard-coded), selected by INDEX; the reason is
// carried by its INDEX into the loaded enum, its value resolved by the caller from that index. The values
// are illustrative under a caveat — never a real-looking digest.
import type { ChamberId } from "./sas-model.ts";

// Positions of the audit labels inside the loaded required[] (schema order, pinned by the root test
// against the loaded arrays — never a quoted field name here). REASON/REGION/CALIB_DIGEST/PRODUCED_AT
// index the CoverageVerdict required[]; REMAINING_BUDGET indexes the GateDecision required[].
export const FIELD = { REASON: 8, REGION: 5, CALIB_DIGEST: 10, PRODUCED_AT: 11, REMAINING_BUDGET: 6 } as const;

/** An obviously-illustrative placeholder value (mirrors lib/sim.ts ELLIPSIS) — never a real digest. */
export const ILLUSTRATIVE = "…";
/** The caveat qualifying every value in the payload (no market figure, no real attestation). */
export const AUDIT_CAVEAT = "Illustrative sim values under caveat — not real attested figures.";

export interface AuditRow {
  readonly label: string;
  readonly value: string;
}

export interface AuditPayload {
  readonly chamber: ChamberId;
  readonly chamberLabel: string;
  /** The reason index into the loaded enum (the panel resolves everything else from it). */
  readonly reasonIndex: number;
  /** The reason code the index resolves to (caller passes reasons[reasonIndex]). */
  readonly reason: string;
  readonly rows: readonly AuditRow[];
  readonly caveat: string;
}

export interface AuditInput {
  readonly chamber: ChamberId;
  readonly chamberLabel: string;
  readonly reasonIndex: number;
  /** reasons[reasonIndex] of the loaded enum — resolved by the caller (by index, never a code literal). */
  readonly reason: string;
  /** The loaded CoverageVerdict required[] (server-side read, passed as a prop). */
  readonly verdictFields: readonly string[];
  /** The loaded GateDecision required[] (server-side read, passed as a prop). */
  readonly gateFields: readonly string[];
}

function labelAt(fields: readonly string[], index: number): string {
  return fields[index] ?? "";
}

/**
 * Build the audit payload. Every row label is a required[] entry selected by index (dynamic, honest); the
 * reason row shows the code resolved by index, the rest are illustrative under the caveat.
 */
export function buildAuditPayload(input: AuditInput): AuditPayload {
  const rows: readonly AuditRow[] = [
    { label: labelAt(input.verdictFields, FIELD.REASON), value: input.reason },
    { label: labelAt(input.verdictFields, FIELD.REGION), value: ILLUSTRATIVE },
    { label: labelAt(input.verdictFields, FIELD.CALIB_DIGEST), value: ILLUSTRATIVE },
    { label: labelAt(input.gateFields, FIELD.REMAINING_BUDGET), value: ILLUSTRATIVE },
    { label: labelAt(input.verdictFields, FIELD.PRODUCED_AT), value: ILLUSTRATIVE },
  ];
  return {
    chamber: input.chamber,
    chamberLabel: input.chamberLabel,
    reasonIndex: input.reasonIndex,
    reason: input.reason,
    rows,
    caveat: AUDIT_CAVEAT,
  };
}
