/**
 * Harness -- the MECHANICAL branchement proof for the liquidation-eligible-coverage class on the EMPTY -2a
 * registry (U-4b-2a; ADR-U4b tuyau "region servie"; checkpoint-1 C-3 + delta D-3/D-6/D-8). It sources a REAL
 * committed artifact -- the sentinel scores fixture -- and maps EVERY `score_a` row DETERMINISTICALLY (yhat =
 * Number(row.yhat); predictor_id from the meta cell-A key), no object hand-built, then drives the SERVED path
 * both ways: the `gate` descriptor of HARNESS_TOOLS (`run`) AND the HTTP/JSON mirror (`handleJsonMirror`,
 * POST /gate). On the empty -2a registry EVERY row abstains `under_calib` (delta D-3: the server stratum is
 * NOT observable on an empty registry -- the CoverageVerdict has no predictor_id and honestyText receives the
 * CLIENT key -- so this test asserts ONLY the observable: under_calib + the named 400s; strata derivation is
 * proved by u4b_served_strata_cuts_and_boundaries / u4b_served_strateof_matches_frozen_on_jsonl).
 *
 * This file reads an UPCOMING sentinel fixture (export-excluded data, scripts/export-exclude-data.json), so it
 * is itself listed in scripts/export-exclude-tests.json (guard (a) of test/export-hygiene.test.ts). It reads
 * ONLY the invariant fields yhat / meta.cell_a.predictor_id (delta D-6), never a hard-coded fixture sha.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertClosedGateDecision } from "@monark/contracts";
import type { Prediction } from "@monark/contracts";
import { TASK_LIQ_ELIGIBLE, LIQ_ALPHA, LIQ_NMIN, type HarnessParams } from "../src/tools/gate.ts";
import { HARNESS_TOOLS, type GateEnvelope } from "../src/tools/registry.ts";
import { handleJsonMirror } from "../src/http.ts";

const FIXTURE = fileURLToPath(new URL("../../sentinel/test/fixtures/ukemi/u4b/U4b-scores-e2.jsonl", import.meta.url));

interface MetaLine { kind: "meta"; cell_a: { predictor_id: string } }
interface ScoreARow { kind: "score_a"; yhat: string; strate: number }
type Line = MetaLine | ScoreARow | { kind: string };

function jsonl(path: string): Line[] {
  return readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as Line);
}

const LIQ_PARAMS: HarnessParams = {
  remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: LIQ_ALPHA, nMin: LIQ_NMIN,
  intent: 1, tool: "perps_order_preview", clockOpen: true,
};

const GATE_TOOL = HARNESS_TOOLS.find((t) => t.name === "gate");
if (GATE_TOOL === undefined) throw new Error("gate tool missing from HARNESS_TOOLS");

test("u4b_gate_serves_region_from_real_artifact", async () => {
  const lines = jsonl(FIXTURE);
  const meta = lines.find((l): l is MetaLine => l.kind === "meta");
  if (meta === undefined) throw new Error("fixture has no meta line");
  const predictorBase = meta.cell_a.predictor_id;
  assert.ok(typeof predictorBase === "string" && predictorBase.length > 0, "meta.cell_a.predictor_id is a non-empty committed key");
  const rows = lines.filter((l): l is ScoreARow => l.kind === "score_a");

  // Non-vacuity: many rows, many DISTINCT yhat values (the mapping exercises varied inputs, not one constant).
  assert.ok(rows.length >= 500, `the artifact has many score_a rows (found ${String(rows.length)}; measured 565 at base f0720ae)`);
  assert.ok(new Set(rows.map((r) => r.yhat)).size >= 50, "the yhat values are varied (anti-vacuity)");

  // DETERMINISTIC mapping over ALL rows (delta D-8): yhat = Number(row.yhat); predictor_id = the committed
  // cell-A key. On the EMPTY -2a registry every row abstains under_calib via the `gate` descriptor `run`.
  for (const row of rows) {
    const yhat = Number(row.yhat);
    assert.ok(Number.isSafeInteger(yhat) && yhat >= 0, `row yhat ${row.yhat} is a non-negative safe integer (base 8-dec, invariant)`);
    const env: GateEnvelope = { prediction: pred(yhat, predictorBase), params: LIQ_PARAMS };
    const { structured } = GATE_TOOL.run(env);
    assertClosedGateDecision(structured);
    assert.equal(structured["action"], "abstain", `yhat=${row.yhat} abstains on the empty registry (via registry.run)`);
    assert.equal(structured["reason"], "under_calib", `yhat=${row.yhat} reason under_calib`);
  }

  // The SAME served class over the HTTP/JSON mirror (POST /gate): the two surfaces consume the same registry,
  // so the mirror abstains identically on the first row (a real second surface, not a re-declared literal).
  const first = rows[0];
  if (first === undefined) throw new Error("no score_a rows");
  const res = await handleJsonMirror(
    new Request("http://api.monarkgate.tech/gate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prediction: pred(Number(first.yhat), predictorBase), params: LIQ_PARAMS } satisfies GateEnvelope),
    }),
  );
  assert.equal(res.status, 200, "POST /gate is a 200 (a decision, not a 400)");
  const body = (await res.json()) as { structuredContent?: Record<string, unknown> };
  assert.equal(body.structuredContent?.["action"], "abstain", "the HTTP mirror abstains identically (same registry, two surfaces)");
  assert.equal(body.structuredContent?.["reason"], "under_calib", "the HTTP mirror reason under_calib");
});

function pred(yhat: number, predictorId: string): Prediction {
  return { schema_version: "1.0.0", task_class: TASK_LIQ_ELIGIBLE, yhat, predictor_id: predictorId, produced_at: "2026-09-04T00:00:00Z" };
}
