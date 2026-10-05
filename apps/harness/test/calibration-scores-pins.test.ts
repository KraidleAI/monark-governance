/**
 * Harness: the load guard of the committed calibrations in contract 1.1.0 (block C, lot CM-3c-3b1; decision Q-3b-2).
 * At import, scores_sha256 of each committed entry, over its scores in the stored order, must equal a pin held outside
 * the block that scripts/emit-u4b-calibration.mjs generates: USDe (time order; the sha256 of fixtures/usde-calib-scores.json),
 * liq stratum s0 (ascending), and the retired btc-dir draw. The C5 pins (digestPinned) stay provenance values, checked
 * by the other tests through the provenance tool. A drifted copy, a reordered copy (scores_sha256 keeps the order, unlike
 * C5) or an entry with no pin is refused by name.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { scoresSha256 } from "@monark/contracts";
import { calibDigest } from "../../../scripts/lib/calib-digest-provenance.mjs";
import {
  assertCommittedScores,
  BTC_DIR_CALIB,
  BTC_DIR_CALIB_DIGEST,
  CALIB_DIGEST_PINNED,
  lookupCommittedCalibration,
  UKEMI_LIQ_COMMITTED,
  UKEMI_LIQ_PREDICTOR_BASE,
  UKEMI_LIQ_SCORES_SHA256_PINNED,
  USDE_STABLE_RUN_PREDICTOR_ID,
  USDE_STABLE_RUN_SCORES_SHA256_PINNED,
  USDE_STABLE_RUN_TASK_CLASS,
} from "../src/calibration.ts";
import { SERVED_MARGINAL_TABLES, SERVED_TABLE_TEXTS, TASK_LIQ_ELIGIBLE } from "../src/tools/gate.ts";

const USDE_PIN = "e44a68b6b697a32f3f198770e740ab206393dc3425e8cc59e4b0e1e4e65cfd28";
const LIQ_S0_PIN = "a927722276941a4f8f677bab3625b8ee3128ecf84d2d078da0a316b42a6ee3c8";
const BTC_DIR_PIN = "bb438031be5ca37ab62eedcb8044ea63969fa6314287019b4e68c235c473afd6";

// killer: apps/harness/src/calibration.ts:272 SDL "  if (computed !== pinned) throw new Error(`calibration: scores drift for ${c.predictorId}: scores_sha256 ${computed} != pinned ${String(pinned)} (re-record and re-pin, never silently accept).`);" -> ""
test("committed_scores_sha256_load_guard_against_the_new_pins", () => {
  // The three pins by value, and the USDe pin is the sha256 of the committed fixture bytes.
  assert.equal(USDE_STABLE_RUN_SCORES_SHA256_PINNED, USDE_PIN);
  assert.equal(UKEMI_LIQ_SCORES_SHA256_PINNED[`${UKEMI_LIQ_PREDICTOR_BASE}/s0`], LIQ_S0_PIN);
  assert.equal(CALIB_DIGEST_PINNED, BTC_DIR_PIN);
  assert.equal(BTC_DIR_CALIB_DIGEST, BTC_DIR_PIN, "the btc-dir draw, scores_sha256 in the derived order");
  assert.equal(calibDigest(BTC_DIR_CALIB), "fcebed27fd3f9607bba94898f5ae4ebba548ced519d1d800b49890235358eda6", "the C5 provenance of the retired draw (G2 m-3)");
  assert.equal(createHash("sha256").update(readFileSync(new URL("../../../fixtures/usde-calib-scores.json", import.meta.url))).digest("hex"), USDE_PIN);

  const usde = lookupCommittedCalibration(USDE_STABLE_RUN_TASK_CLASS, USDE_STABLE_RUN_PREDICTOR_ID);
  assert.ok(usde !== undefined, "the USDe entry is committed");
  const entries = [usde, ...UKEMI_LIQ_COMMITTED];
  assert.equal(entries.length, 2, "USDe and liq s0: the committed entries");
  for (const c of entries) {
    assert.doesNotThrow(() => { assertCommittedScores(c); }, `${c.predictorId}: the committed bytes pass`);
    assert.notEqual(scoresSha256(c.scores), c.digestPinned, `${c.predictorId}: the guard pin is not the C5 provenance pin`);
    const drifted = { ...c, scores: [...c.scores.slice(0, -1), (c.scores.at(-1) ?? 0) + 1] };
    assert.throws(() => { assertCommittedScores(drifted); }, new RegExp(`scores drift for ${c.predictorId.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}`), `${c.predictorId}: a drifted score throws`);
    const reordered = { ...c, scores: [...c.scores].reverse() };
    assert.throws(() => { assertCommittedScores(reordered); }, /scores drift/, `${c.predictorId}: the stored order is guarded`);
  }
  const s0 = UKEMI_LIQ_COMMITTED[0] ?? assert.fail("liq s0 is committed");
  const unpinned = { ...s0, predictorId: `${UKEMI_LIQ_PREDICTOR_BASE}/s1` };
  assert.throws(() => { assertCommittedScores(unpinned); }, /scores drift for .*\/s1: .* != pinned undefined/, "an entry with no pin throws");
});

// Q-3b1-1 (dated re-reading of Q-3b-4): the liq table source names the fresh scores series by its sha256 only, with the
// frozen generator; no path, no file name (the series is export-excluded data). No liq table digest is pinned here.
// killer: apps/harness/src/tools/gate.ts:1037 CONST "registry_file: \"sha256:" -> "registry_file: \"apps/sentinel/test/fixtures/sha256:"
test("liq_table_source_names_the_series_by_sha256_only", () => {
  const series = "fd6fab7ebf5d2779b904494accab8916fac8293587ed24d21fb052cb024074a4";
  const inp = SERVED_TABLE_TEXTS.marginal(TASK_LIQ_ELIGIBLE);
  assert.deepEqual({ ...inp, text: "" }, { registry_file: `sha256:${series}`, registry_sha256: series, generator: "scripts/record-u4b-calib.mjs", text: "" });
  const liq = SERVED_MARGINAL_TABLES.find((t) => t.task_class === TASK_LIQ_ELIGIBLE) ?? assert.fail("the liq table is served");
  assert.ok(liq.table.rows.length >= 1, "the liq table has its committed row");
  for (const r of liq.table.rows) {
    assert.doesNotMatch(r.source.registry_file, /[/\\]|\.jsonl?$/, "no path and no file name in the served source");
    assert.equal(r.source.registry_sha256, series);
  }
});
