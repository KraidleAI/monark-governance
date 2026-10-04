/**
 * Harness - BYO ASCII confusable guard (chantier moteur, lot CM-2c, BYO-ASCII-LOOKALIKE-1, ADR-CM section 5 B-10).
 * Oracle: the ADR-CM amendment "nuit, 2" (B-10); MONARK's probe cases E1 to E17
 * (recherches:coordination/pieces/2026-10-03-cm1-dem4/cm1-RAPPORT.md, C-1); plan docs/G0-lot-cm-2c.md. A BYO name
 * whose ASCII confusable reduction equals a committed or reserved name is a 400 `byo_lookalike_confusable`, after the
 * B-1 guard (whose messages and codes stay byte-identical). Realistic honest names keep deciding. Each test names its
 * killer on the line above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Prediction } from "@monark/contracts";
import { runGate, HarnessToolError, type HarnessParams } from "../src/tools/gate.ts";
import { handleJsonMirror } from "../src/http.ts";
import { USDE_STABLE_RUN_PREDICTOR_ID } from "../src/calibration.ts";

const PARAMS: HarnessParams = {
  remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 5, intent: 0, tool: "perps_order_preview", clockOpen: true,
  calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], mode: "interval" },
};

function pred(taskClass: string, predictorId: string): Prediction {
  return { schema_version: "1.0.0", task_class: taskClass, yhat: 0, predictor_id: predictorId, produced_at: "2026-09-04T00:00:00Z" };
}

/** The code of the refusal, or "decided". */
function outcome(taskClass: string, predictorId: string): unknown {
  try {
    runGate(pred(taskClass, predictorId), PARAMS);
  } catch (e) {
    assert.ok(e instanceof HarnessToolError, `${taskClass} / ${predictorId}: a HarnessToolError, got ${String(e)}`);
    return (e as { code?: unknown }).code;
  }
  return "decided";
}

const HONEST = ["acme-model-1", "my_model", "cascade-v2", "liquidity-model", "eth-dir-1d", "sol-scorer", "model-rn-01", "btc-dir-15m-v2", "liquidation-model", "cascade_liquidity_7d"];

// Test C-1 (F2P): MONARK's ASCII look-alike class names (E1 to E10, E17) are refused with the new code; realistic
// honest names keep deciding.
// killer: apps/harness/src/tools/gate.ts:752 CONST ".replace(/rn/g, \"m\")" -> ".replace(/rn/g, \"rn\")"
test("byo_confusable_class_names_refused", () => {
  const lookAlikes = [
    "cascade-liquidabIe-24h", "cascade-liquidab1e-24h", "liquidation-eIigible-coverage", "Iiquidation-eligible-coverage",
    "btc-dir-l5m", "btc-dir-I5m", "btc-dir-15rn", "btc--dir-15m", "btc-dir-15m.", "btc_dir_15m", "cascade-liquidable -24h",
    "CASCADE_LIQUIDABLE_24H", "liquidation.eligible.coverage", "-btc-dir-15m",
  ];
  for (const c of lookAlikes) assert.equal(outcome(c, "caller:model"), "byo_lookalike_confusable", `${c}: refused`);
  for (const c of HONEST) assert.equal(outcome(c, "caller:model"), "decided", `${c}: an honest BYO name decides`);
});

// Test C-2 (F2P): look-alike kata class names (E11 to E13) and kata keys (E14, E15) are refused; near names decide.
// killer: apps/harness/src/tools/gate.ts:775 CONST ".replace(/4/g, \"a\")" -> ".replace(/4/g, \"4\")"
test("byo_confusable_kata_names_and_keys_refused", () => {
  // sol_mae_up_4h: the mae-up family; btc-dlr-1h: i folds to l (precision (4) of B-10, ADR-CM amendment 2026-10-04).
  for (const c of ["btc-dir-lh", "so1-dir-1h", "bnb-dir-Ih", "eth_range_4h", "sol-mae-down-l h", "sol_mae_up_4h", "btc-dlr-1h"]) {
    assert.equal(outcome(c, "caller:model"), "byo_lookalike_confusable", `${c}: a reduced kata name is refused`);
  }
  for (const k of ["k4ta:x", "kata :x", "K4TA:btc-dir-1h", "k a t a:x", "_kata:x"]) {
    assert.equal(outcome("byo-x", k), "byo_lookalike_confusable", `${k}: a reduced kata key is refused`);
  }
  for (const k of ["kat:x", "katana:x", "caller:kata", "4ta:x"]) assert.equal(outcome("byo-x", k), "decided", `${k}: decides`);
  // doge-dir-1h: an asset outside the four kata assets, with a kata family and horizon, is not reserved.
  for (const c of ["eth-dir-1d", "btc-dir-2h", "sol-dir-1hr", "doge-dir-1h"]) assert.equal(outcome(c, "caller:model"), "decided", `${c}: decides`);
});

// Test C-3 (F2P): a (class, key) pair whose reduction is a committed pair (E16, the USDe key with O for 0) is refused;
// another population keeps deciding; B-1 names keep their B-1 codes and messages; the HTTP body carries the new code
// and the exact message.
// killer: apps/harness/src/tools/gate.ts:754 CONST ".replace(/0/g, \"o\")" -> ".replace(/0/g, \"0\")"
test("byo_confusable_committed_pair_refused", async () => {
  const usdeO = USDE_STABLE_RUN_PREDICTOR_ID.replace("0x4c9", "Ox4c9");
  assert.notEqual(usdeO, USDE_STABLE_RUN_PREDICTOR_ID, "the probe key differs");
  assert.equal(outcome("stable-run-velocity-24h", usdeO), "byo_lookalike_confusable", "USDe key with O for 0: refused");
  assert.equal(outcome("stable_run_velocity_24h", USDE_STABLE_RUN_PREDICTOR_ID), "byo_lookalike_confusable", "class confusable + committed key: refused");
  assert.equal(outcome("stable-run-velocity-24h", "caller:other-population"), "decided", "another population decides");
  assert.equal(outcome("my-model", USDE_STABLE_RUN_PREDICTOR_ID), "decided", "another class with the committed USDe key decides (pair, not key)");
  // B-1 first: codes unchanged.
  assert.equal(outcome("byo-x", "kata:x"), "byo_reserved_kata", "B-1 kata key keeps its code");
  assert.equal(outcome("BTC-DIR-15M", "caller:model"), "byo_lookalike_committed", "B-1 case variant keeps its code");
  assert.equal(outcome("eth-dir-1h", "caller:model"), "byo_reserved_kata", "B-1 kata name keeps its code");
  assert.equal(outcome(" byo-x", "caller:model"), "byo_edge_blank", "B-1 edge blank keeps its code");

  const message =
    "task_class 'btc_dir_15m' / predictor_id 'caller:model' reduces to a committed or reserved name once ASCII confusables are " +
    "folded (l, I, 1; rn, m; 0, o; _ and . as -; repeated -; blanks): use a distinct caller-owned name for BYO (ADR-CM B-10)";
  const res = await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", { method: "POST", body: JSON.stringify({ prediction: pred("btc_dir_15m", "caller:model"), params: PARAMS }) }));
  assert.equal(res.status, 400, "HTTP 400");
  assert.equal(await res.text(), JSON.stringify({ error: "tool_error", operation: "gate", message, code: "byo_lookalike_confusable" }), "exact body");
});
