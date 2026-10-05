import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildVerdict, buildSetRegion, serialize, underCalibVerdict, conformInterval, type VerdictCell } from "../src/index.ts";
import * as hikae from "../src/index.ts";
import { scoresSha256, serializeVerdict } from "@monark/contracts";
import type { CoverageVerdict } from "@monark/contracts";
import { runS2 } from "../src/index.ts";

const SCORES = [0, 0, 1, 0, 1];
const BYO_CELL: VerdictCell = { qhatUnit: "score", scale: null, cellKey: null, policyRowSha256: null, policyTableSha256: null };
const TABLE_CELL: VerdictCell = { qhatUnit: "label", scale: null, cellKey: "usde/s0", policyRowSha256: "b".repeat(64), policyTableSha256: "c".repeat(64) };

function baseVerdict(scores: number[] = SCORES, cell: VerdictCell = BYO_CELL): CoverageVerdict {
  return buildVerdict({
    taskClass: "btc-dir-15m",
    method: "hac-cp",
    alpha: 0.1,
    scores,
    region: buildSetRegion(["up"]),
    qhat: 0,
    abstain: false,
    reason: "covered",
    residual: ["assume:tls-notary"],
    producedAt: "2026-09-04T00:00:00Z",
    schemaVersion: "1.0.0",
    cell,
  });
}

// Test 4 — a forbidden key (p_correct) in the verdict serialization ⇒ THROWS (frozen contract).
test("no_p_correct_field", () => {
  const clean = baseVerdict();
  assert.doesNotThrow(() => serialize(clean), "a clean verdict serializes");
  const poisoned = { ...clean, p_correct: 0.9 } as unknown as CoverageVerdict;
  assert.throws(() => serializeVerdict(poisoned), /p_correct|forbidden|unknown/i);
  // Deep injection (into the region) caught too.
  const deep = { ...clean, region: { kind: "set", labels: ["up"], label_schema: "up|down", confidence: 1 } } as unknown as CoverageVerdict;
  assert.throws(() => serializeVerdict(deep), /confidence|forbidden|unknown/i);
});

// Test 13 (contract 1.1.0, lot CM-3c-3a): scores_sha256 = scoresSha256(scores) in the order given (never sorted); the cell is copied as given.
// killer: packages/hikae/src/verdict.ts:57 CONST "scoresSha256(params.scores)" -> "scoresSha256([...params.scores].sort((a, b) => a - b))"
test("verdict_scores_sha256_is_over_the_declared_order", () => {
  const v = baseVerdict();
  assert.equal(v.scores_sha256, scoresSha256(SCORES), "scores_sha256 over the declared order");
  assert.notEqual(baseVerdict([1, 1, 0, 0, 0]).scores_sha256, v.scores_sha256, "two orders of one multiset, two digests");
  assert.equal("calib_digest" in v, false, "calib_digest left the verdict");
  const t = baseVerdict(SCORES, TABLE_CELL);
  assert.deepEqual([t.qhat_unit, t.scale, t.cell_key, t.policy_row_sha256, t.policy_table_sha256], ["label", null, "usde/s0", "b".repeat(64), "c".repeat(64)]);
  assert.doesNotThrow(() => serialize(t), "a 1.1.0 verdict passes the closed-check couplings");
  assert.equal(baseVerdict(SCORES, { ...TABLE_CELL, qhatUnit: "scale", scale: 0.02 }).scale, 0.02, "a non-null scale is copied (m-3)");
});

// killer: packages/hikae/src/interval-conformer.ts:102 CONST "cell: params.cell," -> "cell: { ...params.cell, cellKey: null, policyRowSha256: null, policyTableSha256: null },"
test("conform_interval_carries_the_cell_on_the_served_path", () => {
  const cell: VerdictCell = { qhatUnit: "scale", scale: 0.02, cellKey: "k/b0", policyRowSha256: "b".repeat(64), policyTableSha256: "c".repeat(64) };
  const calib = Array.from({ length: 19 }, (_, i) => ({ yhat: 0, y: i + 1 }));
  const v = conformInterval({ taskClass: "t", alpha: 0.1, calib, yhat: 0, nMin: 19, residual: [], producedAt: "2026-09-04T00:00:00Z", schemaVersion: "1.1.0", cell }).verdict;
  assert.deepEqual([v.reason, v.qhat_unit, v.scale, v.cell_key, v.policy_row_sha256, v.policy_table_sha256], ["covered", "scale", 0.02, "k/b0", "b".repeat(64), "c".repeat(64)]);
  assert.doesNotThrow(() => serialize(v));
});

// Contract 1.1.0 (spec section 5): a verdict without region has region and qhat null, abstains, keeps n_calib and the scores digest.
// killer: packages/hikae/src/verdict.ts:71 CONST "region: null," -> "region: { kind: \"set\", labels: [], label_schema: \"up|down\" },"
test("no_region_verdict_has_null_region_and_qhat", () => {
  const noRegion = (hikae as Record<string, unknown>)["noRegionVerdict"];
  assert.equal(typeof noRegion, "function", "noRegionVerdict is exported");
  const params = { taskClass: "t", method: "split", alpha: 0.1, scores: SCORES, residual: [], producedAt: "2026-09-04T00:00:00Z", schemaVersion: "1.1.0", cell: TABLE_CELL } as const;
  const v = (noRegion as (reason: string, p: typeof params) => CoverageVerdict)("out_of_support", params);
  assert.deepEqual([v.region, v.qhat, v.abstain, v.reason, v.n_calib, v.scores_sha256], [null, null, true, "out_of_support", 5, scoresSha256(SCORES)]);
  assert.doesNotThrow(() => serialize(v));
  const u = underCalibVerdict(params);
  assert.deepEqual([u.region, u.qhat, u.abstain, u.reason], [null, null, true, "under_calib"]);
  const c = conformInterval({ ...params, calib: [{ yhat: 0, y: 1 }], yhat: 0, nMin: 50 });
  assert.deepEqual([c.verdict.region, c.verdict.qhat, c.verdict.reason, c.region], [null, null, "under_calib", null]);
});

// Test 12 — the error|COMMIT is a LABELLED desk figure (H2.3) + the vocab gate catches a forbidden phrasing.
test("commit_error_not_alpha_is_labelled", () => {
  // (a) the report (generated by the REAL runner, predictors run) labels the action-conditional
  // coverage "NOT the CP guarantee".
  const report = runS2().report;
  assert.match(report, /NOT the CP guarantee/, "the conditional coverage is labelled (H2.3)");
  // (b) the root vocab gate rejects a "NN % of ... correct" claim (exit 1).
  const root = join(import.meta.dirname, "..", "..", "..");
  // Outside the work tree (review corr. 3): `os.tmpdir()`, ephemeral directory, cleaned up.
  const scratch = mkdtempSync(join(tmpdir(), "hikae-vocab-"));
  const tmp = join(scratch, "hikae-vocab-mutant.md");
  writeFileSync(tmp, "Our agent achieves 73 % de fills corrects.\n");
  let exitCode = 0;
  try {
    execFileSync("node", [join(root, "scripts", "grep-forbidden.mjs"), tmp], { stdio: "pipe" });
  } catch (e) {
    exitCode = (e as { status?: number }).status ?? 1;
  }
  rmSync(scratch, { recursive: true, force: true });
  assert.equal(exitCode, 1, "a percent-correct claim ⇒ vocab gate fails");
});
