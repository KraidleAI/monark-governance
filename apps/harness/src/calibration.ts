/**
 * Harness — committed SYNTHETIC `btc-dir-15m` calibration (ADR-M005 D5, C-8).
 *
 * DERIVED from the HIKAE S2 instrument (`generateLabeledSeries` over the committed `S2_DEFAULT.s2a`
 * parameters — `harness_version = "fixtures-synth"`), NOT hand-authored: the first `nCalib` evaluable
 * points of the seeded draw give the 0/1 indicator calibration scores. The result is DIGEST-PINNED:
 * `calibDigest(scores)` is asserted equal to `CALIB_DIGEST_PINNED` at module load — a fail-closed
 * guard, so a silent drift in the HIKAE draw (or in this derivation) throws at import time rather than
 * changing the gate's behaviour unnoticed.
 *
 * It is DECLARED synthetic (a plumbing fixture, not a measured predictor): the honesty of the class
 * lives in the tool description and in `BTC_DIR_CALIB_PROVENANCE`, never inside a frozen contract
 * (K-1). No cascade calibration exists — that class abstains (`under_calib`), by design (D5).
 */
import { S2_DEFAULT, generateLabeledSeries, indicatorScore, HARNESS_VERSION } from "@monark/hikae";
import { calibDigest } from "@monark/contracts";

const { seed, n, accuracy, nCalib } = S2_DEFAULT.s2a;

/** The committed synthetic calibration scores (indicator, 0/1), derived from the S2a draw. */
export const BTC_DIR_CALIB: readonly number[] = (() => {
  const draw = generateLabeledSeries({ seed, n, accuracy });
  const evaluable = draw.filter((p) => p.y !== "non_evaluable");
  return evaluable.slice(0, nCalib).map((p) => indicatorScore(p.yhat, p.y));
})();

/** Committed digest of the calibration (recalculable by reference, ADR-M001 C5). */
export const CALIB_DIGEST_PINNED = "fcebed27fd3f9607bba94898f5ae4ebba548ced519d1d800b49890235358eda6";

/** Digest computed from the derived scores at load time. */
export const BTC_DIR_CALIB_DIGEST: string = calibDigest(BTC_DIR_CALIB);

// Fail-closed: a drift in the derivation or in the HIKAE draw is a defect, not a silent re-calibration.
if (BTC_DIR_CALIB_DIGEST !== CALIB_DIGEST_PINNED) {
  throw new Error(
    `calibration: synthetic btc-dir digest drift — derived ${BTC_DIR_CALIB_DIGEST} != pinned ${CALIB_DIGEST_PINNED} ` +
      `(ADR-M005 D5/C-8; re-derive from HIKAE S2a and re-pin, do not silently accept).`,
  );
}

/** Honest provenance line (declared `synthetic`); carried outside any frozen contract (K-1). */
export const BTC_DIR_CALIB_PROVENANCE =
  `synthetic — HIKAE S2a instrument draw (harness_version=${HARNESS_VERSION}, seed=${seed}, n=${n}, ` +
  `nCalib=${nCalib}); 0/1 indicator scores; calib_digest=${CALIB_DIGEST_PINNED}; declared synthetic, ` +
  `a plumbing fixture, not a measured predictor (ADR-M005 D5, C-8).`;
