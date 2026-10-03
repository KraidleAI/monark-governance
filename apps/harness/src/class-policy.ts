/**
 * Harness - the F-7 class policy table (ADR-CM, amendment "nuit, 2": B-2 narrowed; audit P3 S-1; plan
 * docs/G0-lot-cm-2b.md). The server imposes ONLY the calibration-bound parameters (alpha, nMin) of a committed
 * calibration; a different value sent by the caller is a named 400, never silently replaced. tau and tauInterval
 * stay the caller's; cascade (empty registry) and BYO have no row.
 *
 * Pure data: no I/O, no clock, imports only the committed USDe key (calibration.ts, pure). It sits at src/ (not
 * src/tools/), so the K-8 scan of the tools stays meaningful. A row with `predictorId: null` binds the whole class
 * (liq: the server derives the stratum key and ignores the client key); a row with a key binds that key only (USDe:
 * every other key of the class abstains under_calib and keeps the caller's values). Base of CM-4 (F-7), which adds
 * the lookup by (task_class, predictor_id).
 */
import { USDE_STABLE_RUN_PREDICTOR_ID, USDE_STABLE_RUN_TASK_CLASS } from "./calibration.ts";

export interface ClassPolicyRow {
  readonly taskClass: string;
  /** null = the whole class; else the one committed key the row binds. */
  readonly predictorId: string | null;
  readonly alpha: number;
  readonly nMin: number;
}

/** liq (ADR-U4b D3): alpha 0.01, nMin 100, imposed on the whole class (== the frozen generator ALPHA/NMIN). */
export const LIQ_POLICY: ClassPolicyRow = { taskClass: "liquidation-eligible-coverage", predictorId: null, alpha: 0.01, nMin: 100 };

/** USDe committed key (ADR-M008 Amendement bis; its calibration's alpha 0.10 and nMin 50). */
export const USDE_POLICY: ClassPolicyRow = { taskClass: USDE_STABLE_RUN_TASK_CLASS, predictorId: USDE_STABLE_RUN_PREDICTOR_ID, alpha: 0.1, nMin: 50 };

/** The F-7 rows served today. */
export const CLASS_POLICY: readonly ClassPolicyRow[] = [LIQ_POLICY, USDE_POLICY];

