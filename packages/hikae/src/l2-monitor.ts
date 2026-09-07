/**
 * HIKAE L2 — remaining-risk MONITOR (IM-OCP mechanism).
 *
 * *** MONITOR, NO GUARANTEE CLAIMED (ADR-M002 D4, branch b). ***
 * In Phase 1, the split `q̂` (L1) ALONE defines C_t. `r_t` (IM-OCP) and `B_t` are
 * monitoring statistics that drive π (L3) and the drift flag; `r_t` has
 * NO set consumer, so Wang's long-run type-(ii) guarantee is
 * attached to nothing and is NOT claimed. Branch (a) (`C_t = {y : s <= r_t}`,
 * guarantee (ii) carried by C_t) is NAMED for Phase 2, by ADR after a real S2.
 *
 * [lu] source of the mechanism: Wang, Zecchin, Simeone, IEEE SPL 32 (2025) 2888-2892,
 * eq. 10 / Thm 1 (cited, not republished) — transported onto the subsequence of ARRIVED labels
 * (p = 1 on this subsequence, not "p_t = 0 before w": R5:151-158 requires p_min > 0).
 * The clock term `w/T` (deterministic delay) is a COMPOSITION (H4) — our design
 * choice, not a published theorem. Tests 9-10 verify the MECHANISM, not a guarantee.
 */

/** E_t = 1{Y_t not in C_t} — miscover indicator (0 = covered, 1 = miscover). */
export type Miscover = 0 | 1;

/**
 * IM-OCP step (Euclidean case of eq. 10, on ONE arrived label):
 *   `r_t = r_{t-1} - eta * (alpha - E)`.
 * Direction (test `imocp_update_direction`): miscover (E=1) ⇒ r RISES; covered (E=0)
 * ⇒ r FALLS. This is the mechanism, never a coverage guarantee (branch b).
 */
export function imocpStep(r: number, alpha: number, E: Miscover, eta: number): number {
  return r - eta * (alpha - E);
}

/**
 * Subsequence of the E's of labels ARRIVED at the decision instant of window `t` (H4, D4).
 *
 * `errorTimeline[i]` = E of the i-th EVALUABLE window (`non_evaluable` points are
 * excluded UPSTREAM — they never enter `t°`). A label of window `i` is
 * *settled* at `i + labelDelay` AND is usable only if it is not the one of the current
 * window (`i < t`: the gate decides BEFORE its own label — this is H4). So usable
 * iff `i + labelDelay <= t` AND `i < t`. B_t NEVER reads a pending label — nor `y_t`
 * itself, EVEN at `labelDelay = 0` (the "no-peek").
 */
export function arrivedErrors(
  errorTimeline: readonly Miscover[],
  t: number,
  labelDelay: number,
): Miscover[] {
  const out: Miscover[] = [];
  for (let i = 0; i < errorTimeline.length; i++) {
    const settled = i + labelDelay <= t; // the label is settled
    const notCurrent = i < t; // not the window currently being decided (no-peek H4)
    if (settled && notCurrent) {
      const e = errorTimeline[i];
      if (e !== undefined) out.push(e); // noUncheckedIndexedAccess guard
    }
  }
  return out;
}

/**
 * Remaining budget `B_t = alpha - (1/t°) * sum_{arrived labels} E_i`, where `t°` = number of
 * ARRIVED labels. `t° = 0` (no label arrived) ⇒ `B_t = alpha` (nothing consumed).
 * Sufficient statistic for L3 (authorization predicate H5) and the drift flag —
 * NEVER a yield (ADR-CERT-MONARK).
 */
export function remainingBudget(arrived: readonly Miscover[], alpha: number): number {
  const tDeg = arrived.length;
  if (tDeg === 0) return alpha;
  let sum = 0;
  for (const e of arrived) sum += e;
  return alpha - sum / tDeg;
}

/**
 * B_t directly from an error timeline and the decision instant `t` (composes
 * `arrivedErrors` + `remainingBudget`) — the path that guarantees no-peek for L3/S2.
 */
export function budgetAt(
  errorTimeline: readonly Miscover[],
  t: number,
  labelDelay: number,
  alpha: number,
): number {
  return remainingBudget(arrivedErrors(errorTimeline, t, labelDelay), alpha);
}
