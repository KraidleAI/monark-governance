// scripts/record-usde-calib.d.mts — type surface for the pure closure function that
// scripts/record-usde-calib.mjs exports (behind a run-guard). It lets the root type-checked test
// (test/record-usde-calib.test.ts) import evaluateClosure WITHOUT executing the recorder or pulling the
// network, staying free of the ratcheted no-unsafe rules. Runtime implementation = record-usde-calib.mjs;
// Node ignores this file. Root test/ is not part of the public export, so nothing in the exported tree
// imports the recorder -> this .d.mts is NOT whitelisted, governance-only (release-public.d.mts precedent).
export interface ClosureDecision {
  n: number;
  q_hat: number | null;
  q99_calm: number | null;
  q99_decidable: boolean;
  zero_width: boolean;
  enough_support: boolean;
  enough_activity: boolean;
  retrospective_positive: boolean;
  closure: string;
  committable: boolean;
  reason: string | null;
}

export interface ClosureConfig {
  alpha?: number;
  alertP?: number;
  nMin?: number;
  rhoMin?: number;
}

/** Pure §5.1 committability decision (no I/O, no network): calm-pair residual `scores`, run-window
 *  velocities and activity ratio `rho` -> closure. `q99_calm` is null (never Infinity) when the ALERT_P
 *  quantile rank ceil((n+1)*p) exceeds n (n < 99 at 0.99) — the ADR-M015 D1(a) retrospective-undecidable
 *  branch. The n >= 99 path is unchanged (USDe n=613 stays byte-identical). */
export function evaluateClosure(
  input: { scores: number[]; rho: number; runVelocities?: number[] },
  cfg?: ClosureConfig,
): ClosureDecision;
