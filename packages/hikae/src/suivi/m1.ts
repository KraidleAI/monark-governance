/**
 * HIKAE tracking: one step of the monitor of the miss rate, and its bound.
 *
 *   - m1Step derives E = 1{s01 > r} itself, the strict inequality of the tracker, and returns r' = imocpStep(r, alpha, E, eta), with
 *     no projection of r;
 *   - it refuses s01 not finite or outside [0, 1], alpha not finite or outside (0, 1), eta not finite or not positive, r not finite,
 *     and r outside the band [imocpStep(0, alpha, 0, eta), imocpStep(1, alpha, 1, eta)], which a step from the band never leaves;
 *   - m1Bound(T, eta) = (1 + eta)/(eta T), exact, the bound on |k_T/T - alpha| that the width 1 + eta of the band gives; it refuses T
 *     that is not a safe integer >= 1 and eta that is not a rational of numerator > 0.
 * Pure: no clock, no network, no file, no environment. Every refusal throws a RangeError.
 */
import { imocpStep, type Miscover } from "../l2-monitor.ts";
import { q, type Q } from "../pari/index.ts";

export function m1Step(r: number, s01: number, alpha: number, eta: number): { readonly r: number; readonly E: Miscover } {
  if (!Number.isFinite(s01) || s01 < 0 || s01 > 1) throw new RangeError(`m1Step: s01 ${String(s01)} is not a finite number of [0, 1]`);
  if (!Number.isFinite(alpha) || alpha <= 0 || alpha >= 1) {
    throw new RangeError(`m1Step: alpha ${String(alpha)} is not a finite number of (0, 1)`);
  }
  if (!Number.isFinite(eta) || eta <= 0) throw new RangeError(`m1Step: eta ${String(eta)} is not a finite number > 0`);
  if (!Number.isFinite(r)) throw new RangeError(`m1Step: r ${String(r)} is not finite`);
  // The bounds come from imocpStep with the doubles of the step itself, so the rounding keeps a step from the band inside it.
  if (r < imocpStep(0, alpha, 0, eta) || r > imocpStep(1, alpha, 1, eta)) throw new RangeError(`m1Step: r ${String(r)} outside the band`);
  const E: Miscover = s01 > r ? 1 : 0;
  return { r: imocpStep(r, alpha, E, eta), E };
}

export function m1Bound(T: number, eta: Q): Q {
  if (!Number.isSafeInteger(T) || T < 1) throw new RangeError(`m1Bound: T ${String(T)} is not a safe integer >= 1`);
  if (typeof eta.n !== "bigint" || typeof eta.d !== "bigint" || eta.d <= 0n || eta.n <= 0n) {
    throw new RangeError("m1Bound: eta is not a rational of numerator > 0");
  }
  return q(eta.d + eta.n, eta.n * BigInt(T));
}
