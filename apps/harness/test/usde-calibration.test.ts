/**
 * Harness — USDe committed calibration pins (ADR-M008 Amendement 2026-09-17 bis; Lot F2-B).
 *
 * Proves the FIRST committed MEASURED calibration is reproducible and anti-circular:
 *   - the series fixture is sha-pinned (the exact input the recorder rebuilds AttestedFlow from);
 *   - the committed scores array EQUALS the scores fixture the recorder writes (adapter 1e12, A1);
 *   - calib_digest = calibDigest (ADR-M001 C5, float64_be) — NOT a sha256(JSON.stringify) look-alike
 *     (the [0,1] oracle proves the function; this is the exact defect the lot's A1 gate replaced);
 *   - the pre-registered stats reproduce (n=613, q̂ support 61, q99 support 6, region non-degenerate);
 *   - the committed KEY is the ratified `<formula>@<chain>/<token>` value.
 * No `any`, no unsafe: this file stays off the lint ratchet.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { calibDigest } from "@monark/contracts";
import { splitQuantile } from "@monark/hikae";
import { narabiPredictorId } from "@monark/monark";
import {
  USDE_STABLE_RUN_CALIB,
  USDE_STABLE_RUN_CALIB_DIGEST_PINNED,
  USDE_STABLE_RUN_PREDICTOR_ID,
  USDE_STABLE_RUN_CHAIN,
  USDE_STABLE_RUN_SUBJECT,
} from "../src/calibration.ts";

const SERIES = fileURLToPath(new URL("../../../fixtures/usde-calib-series.json", import.meta.url));
const SCORES = fileURLToPath(new URL("../../../fixtures/usde-calib-scores.json", import.meta.url));

const SERIES_SHA256_PINNED = "7c33027a0e4c6a72e6b390dd95aa2396f1f8c6cdcfee22f8abe729ba8dfc9ef1";

/** p-th smallest split-conformal quantile (hand-rolled, anti-circular vs splitQuantile). */
function handQuantile(scores: readonly number[], p: number): number {
  const s = [...scores].sort((a, b) => a - b);
  const rank = Math.ceil((s.length + 1) * p);
  return rank > s.length ? Infinity : (s[rank - 1] as number);
}
const support = (scores: readonly number[], q: number): number => scores.filter((x) => x >= q).length;

test("usde_series_fixture_is_sha_pinned (the recorder's exact input)", () => {
  const raw = readFileSync(SERIES, "utf8").replace(/\r\n/g, "\n");
  assert.equal(createHash("sha256").update(raw, "utf8").digest("hex"), SERIES_SHA256_PINNED, "series fixture sha256(LF) drift");
});

test("usde_committed_scores_equal_the_scores_fixture (adapter 1e12, A1)", () => {
  const fixtureScores = JSON.parse(readFileSync(SCORES, "utf8")) as number[];
  assert.equal(fixtureScores.length, 613, "the scores fixture holds 613 scores");
  assert.equal(USDE_STABLE_RUN_CALIB.length, 613, "the committed array holds 613 scores");
  assert.deepEqual([...USDE_STABLE_RUN_CALIB], fixtureScores, "the committed array must equal the recorder's scores fixture");
});

test("usde_calib_digest_is_calibDigest_C5_not_json_stringify (anti-circularity)", () => {
  // The [0,1] oracle proves calibDigest is the float64_be C5 function (the 2026-09-17 defect used JSON.stringify).
  assert.equal(calibDigest([0, 1]), "1e47beee7f4175a863385dc2f9c8278138e35f0caa43a5467a523519f1e91081", "calibDigest is the C5 function");
  assert.equal(calibDigest(USDE_STABLE_RUN_CALIB), USDE_STABLE_RUN_CALIB_DIGEST_PINNED, "the committed digest is calibDigest(scores)");
  assert.equal(
    USDE_STABLE_RUN_CALIB_DIGEST_PINNED,
    "c9793b281167465af88c9e837aaeaf7fb26c709ff4c5e342c68893e759d9e86c",
    "the pinned digest is the ratified value",
  );
  // NOT the two rejected values: 2b5834e3… = sha256(JSON.stringify) of the scratchpad recorder (NOD 1
  // reject); 0cbc7d5a… = calibDigest over the 1e6-pull-scale scores (wrong scale, superseded by A1 1e12).
  assert.notEqual(USDE_STABLE_RUN_CALIB_DIGEST_PINNED, "2b5834e35d5a6e875b6dcd110baf8996e466fb86f1d23f93ce0976841c49e53e");
  assert.notEqual(USDE_STABLE_RUN_CALIB_DIGEST_PINNED, "0cbc7d5a3e7986df23904e3aa8b0e29546f94b31847a11d26da41f8b15675b4d");
});

test("usde_pre_registered_stats_reproduce (n=613, q̂ support 61, q99 support 6, non-degenerate)", () => {
  const alpha = 0.1;
  const qHat = handQuantile(USDE_STABLE_RUN_CALIB, 1 - alpha);
  const q99 = handQuantile(USDE_STABLE_RUN_CALIB, 0.99);
  // cross-check the hand quantile against the production L1 (anti-circularity).
  const sq = splitQuantile(USDE_STABLE_RUN_CALIB, alpha, 50);
  assert.ok("qhat" in sq, "the committed calibration is not under-calibrated at α=0.10, nMin=50");
  assert.equal(sq.qhat, qHat, "hand q̂ == splitQuantile q̂ (L1)");
  assert.ok(qHat > 0, "region non-degenerate: q̂ > 0 (NDG-1 would abstain otherwise)");
  assert.equal(support(USDE_STABLE_RUN_CALIB, qHat), 61, "q̂ support == 61 (pre-registered)");
  assert.equal(support(USDE_STABLE_RUN_CALIB, q99), 6, "q99 support == 6 (pre-registered)");
});

test("usde_committed_key_is_the_ratified_value (ADR-M008 Amendement bis)", () => {
  assert.equal(
    USDE_STABLE_RUN_PREDICTOR_ID,
    "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
    "the committed key is the ratified <formula>@<chain>/<token>",
  );
  // derived by the SAME shared function the adapter emits (no duplicated registry).
  assert.equal(USDE_STABLE_RUN_PREDICTOR_ID, narabiPredictorId(USDE_STABLE_RUN_CHAIN, USDE_STABLE_RUN_SUBJECT));
});
