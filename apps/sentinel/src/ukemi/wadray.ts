// UKEMI (ADR-U1 C-2) — WadRayMath / PercentageMath reproduced from the Aave v3 Pool, exact integers.
//
// The invariant is a CROSS-CHECK, not a claim of bit-identity: we recompute the health factor from the
// Pool's OWN aggregate reads (totalCollateralBase, currentLiquidationThreshold, totalDebtBase) with the
// documented formula `percentMul(totalCollateral, avgLt).wadDiv(totalDebt)` and compare it to the on-chain
// `getUserAccountData.healthFactor`. Measured on real accounts just before the liquidations @23545087, the recompute
// differs from the authoritative value by a small SIGNED edge-rounding delta (the Pool keeps sub-unit
// precision in its per-reserve accumulation that the aggregates cannot reproduce): +274302 / -458155 on two
// probes, 0 when debt=0. ADR-U1 C-2: an edge-rounding gap is a RECORDED finding (exact integer, never "≈",
// never a silent tolerance); `getUserAccountData.healthFactor` stays authoritative and drives eligibility.

export const WAD = 10n ** 18n;
export const RAY = 10n ** 27n;
export const HALF_RAY = RAY / 2n;
export const PERCENTAGE_FACTOR = 10000n;
export const HALF_PERCENTAGE_FACTOR = 5000n;
export const UINT256_MAX = 2n ** 256n - 1n;
export const ONE_WAD = WAD; // healthFactor unit; eligible ⇔ hf < 1e18

/** PercentageMath.percentMul — half-up rounding: (value·pct + 5000) / 1e4. */
export function percentMul(value: bigint, percentageBps: bigint): bigint {
  return (value * percentageBps + HALF_PERCENTAGE_FACTOR) / PERCENTAGE_FACTOR;
}

/** WadRayMath.wadDiv — half-up: (a·1e18 + b/2) / b. Reverts (throws) on b = 0, like the Pool. */
export function wadDiv(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error("ukemi/wadray: wadDiv by zero");
  return (a * WAD + b / 2n) / b;
}

/** WadRayMath.rayMul — half-up: (a·b + 0.5·1e27) / 1e27 (kept for provenance/debt reconstruction cross-checks). */
export function rayMul(a: bigint, b: bigint): bigint {
  return (a * b + HALF_RAY) / RAY;
}

/** GenericLogic.calculateHealthFactorFromBalances reproduced on the aggregates. debt=0 ⇒ uint256 max. */
export function healthFactorFromBalances(totalCollateralBase: bigint, avgLiquidationThresholdBps: bigint, totalDebtBase: bigint): bigint {
  if (totalDebtBase === 0n) return UINT256_MAX;
  return wadDiv(percentMul(totalCollateralBase, avgLiquidationThresholdBps), totalDebtBase);
}

/** The HF cross-check outcome for one account (ADR-U1 C-2). `skipped` when e-mode ≠ 0 (v1 WETH: e-mode
 *  category params are read only at the e-mode-cluster lot; the on-chain HF stays authoritative). */
export type HfCheck =
  | { readonly kind: "checked"; readonly hf_onchain: bigint; readonly hf_recompute: bigint; readonly hf_delta: bigint }
  | { readonly kind: "emode_recompute_skipped"; readonly hf_onchain: bigint; readonly emode: bigint };

export function crossCheckHealthFactor(uad: { totalCollateralBase: bigint; totalDebtBase: bigint; currentLiquidationThresholdBps: bigint; healthFactor: bigint }, emode: bigint): HfCheck {
  if (emode !== 0n) return { kind: "emode_recompute_skipped", hf_onchain: uad.healthFactor, emode };
  const hf_recompute = healthFactorFromBalances(uad.totalCollateralBase, uad.currentLiquidationThresholdBps, uad.totalDebtBase);
  return { kind: "checked", hf_onchain: uad.healthFactor, hf_recompute, hf_delta: hf_recompute - uad.healthFactor };
}

/** Static eligibility (Perez Eq. 3 via the authoritative on-chain HF): hf < 1e18. */
export const eligibleStatic = (healthFactor: bigint): boolean => healthFactor < ONE_WAD;
