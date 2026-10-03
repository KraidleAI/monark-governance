/**
 * Harness - BYO look-alike guard (chantier moteur, lot CM-1, BYO-NEAR-NAME-1, audit P3 point S-11).
 * Oracle: docs/adr/ADR-CM-chantier-moteur-audit-P3.md §5 B-1; plan docs/G0-lot-cm-1-byo-near-name.md.
 * A BYO calibration must never run under a name that imitates a committed class or key (ASCII case, leading
 * or trailing blank, checksum-case address), nor under the reserved kata class pattern or the `kata:` key
 * prefix. Each test names its killer on the line above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertClosedGateDecision } from "@monark/contracts";
import type { Prediction } from "@monark/contracts";
import { runGate, HarnessToolError, type HarnessParams } from "../src/tools/gate.ts";

const PARAMS: HarnessParams = {
  remainingBudget: 0.1,
  bFloor: 0,
  tau: 1,
  tauInterval: 1,
  alpha: 0.1,
  nMin: 5,
  intent: "A",
  tool: "perps_order_preview",
  clockOpen: true,
};

// n = 10, alpha = 0.1, nMin = 5: qhat = the 10th smallest score = 1.0.
const SCORES = [0.5, 0.1, 0.9, 0.3, 1.0, 0.7, 0.2, 0.8, 0.4, 0.6];
const SET_CAL = { scores: SCORES, mode: "set" as const, candidates: [{ label: "A", score: 0.5 }, { label: "B", score: 1.5 }] };
const INTERVAL_CAL = { scores: SCORES, mode: "interval" as const };

const USDE_KEY = "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3";
const USDE_KEY_CHECKSUM = "narabi:persistence-v2@eip155:1/erc20:0x4c9EDD5852cd905f086C759E8383e09bff1E68B3";

function pred(taskClass: string, predictorId: string, yhat: string | number): Prediction {
  return { schema_version: "1.0.0", task_class: taskClass, yhat, predictor_id: predictorId, produced_at: "2026-09-04T00:00:00Z" };
}

function refused(p: Prediction, cal: NonNullable<HarnessParams["calibration"]>, at: string): void {
  assert.throws(
    () => runGate(p, { ...PARAMS, calibration: cal }),
    (e: unknown) => e instanceof HarnessToolError,
    `${at}: a look-alike BYO must be a named tool error (400)`,
  );
}

// Test T-1 (F2P): the nine look-alike names of MONARK's probe (status of audit P3, priority 1) are refused.
// killer: apps/harness/src/tools/gate.ts byoLookAlike CONST "asciiLower(taskClass)" -> "taskClass"
test("byo_lookalike_probe_names_refused", () => {
  const set: [string, string][] = [
    ["BTC-DIR-15M", "caller:model"],
    ["btc-dir-15m ", "caller:model"],
    [" btc-dir-15m", "caller:model"],
    ["Cascade-Liquidable-24h", "caller:model"],
    ["liquidation-eligible-coverage ", "caller:model"],
  ];
  for (const [cls, key] of set) refused(pred(cls, key, "A"), SET_CAL, `set ${JSON.stringify(cls)}`);
  const usde: [string, string][] = [
    ["stable-run-velocity-24h", `${USDE_KEY} `],
    ["stable-run-velocity-24h", USDE_KEY_CHECKSUM],
    ["Stable-Run-Velocity-24h", USDE_KEY],
  ];
  for (const [cls, key] of usde) refused(pred(cls, key, 1), INTERVAL_CAL, `usde ${JSON.stringify(cls)} / ${JSON.stringify(key)}`);
  refused(pred("btc-dir-1h", "kata:vote4-v1@binance/BTCUSDT/1h/up-b3", "A"), SET_CAL, "kata class with kata key");
});

// Test T-2 (F2P): a leading or trailing blank (space, tab, no-break space) on the class or on the key is refused
// on the BYO path, for any name.
// killer: apps/harness/src/tools/gate.ts byoLookAlike ROR "EDGE_BLANK.test(predictorId)" -> "false"
test("byo_edge_blank_refused", () => {
  for (const blank of [" ", "\t", " "]) {
    refused(pred(`acme-model-x${blank}`, "caller:model", "A"), SET_CAL, `class trailing ${JSON.stringify(blank)}`);
    refused(pred(`${blank}acme-model-x`, "caller:model", "A"), SET_CAL, `class leading ${JSON.stringify(blank)}`);
    refused(pred("acme-model-x", `caller:model${blank}`, "A"), SET_CAL, `key trailing ${JSON.stringify(blank)}`);
    refused(pred("acme-model-x", `${blank}caller:model`, "A"), SET_CAL, `key leading ${JSON.stringify(blank)}`);
  }
});

// Test T-3 (F2P): the kata class pattern (any ASCII case) and the `kata:` key prefix (any ASCII case) are
// reserved against BYO.
// killer: apps/harness/src/tools/gate.ts byoLookAlike CONST "KATA_CLASS_RE.test(cls)" -> "false"
test("byo_kata_names_reserved", () => {
  for (const cls of ["btc-dir-1h", "ETH-RANGE-4H", "sol-mae-down-1h", "Bnb-Mae-Up-4h"]) {
    refused(pred(cls, "caller:model", "A"), SET_CAL, `kata class ${cls}`);
  }
  for (const key of ["kata:vote4-v1@binance/BTCUSDT/1h/up-b3", "KATA:anything"]) {
    refused(pred("acme-model-x", key, "A"), SET_CAL, `kata key ${key}`);
  }
});

// Test T-4 (pin): an honest BYO keeps its behaviour: a fresh class, a class NAME that merely contains a kata
// fragment, and another population on the stable-run class (committed by KEY only) still decide; the
// already-refused exact names keep their message byte for byte.
// killer: apps/harness/src/tools/gate.ts byoLookAlike CONST "return undefined" (end) -> "return 'x'"
test("byo_honest_names_unchanged", () => {
  const honest: [string, string][] = [["acme-model-x", "caller:model"], ["my-btc-dir-1h-clone", "caller:model"], ["btc-dir-1d", "caller:kata"]];
  for (const [cls, key] of honest) {
    const d = runGate(pred(cls, key, "A"), { ...PARAMS, calibration: SET_CAL });
    assertClosedGateDecision(d);
    assert.equal(d.action, "commit", `${cls}: an honest BYO set {A} with tau 1 commits`);
    assert.equal(d.verdict.task_class, cls);
  }
  const other = runGate(pred("stable-run-velocity-24h", "caller:other-population", 1), { ...PARAMS, calibration: INTERVAL_CAL });
  assertClosedGateDecision(other);
  assert.equal(other.verdict.task_class, "stable-run-velocity-24h");
  assert.throws(
    () => runGate(pred("btc-dir-15m", "caller:model", "A"), { ...PARAMS, calibration: SET_CAL }),
    (e: unknown) =>
      e instanceof HarnessToolError &&
      e.message ===
        "calibration must not override the committed (task_class, predictor_id) 'btc-dir-15m' / 'caller:model': use a caller-owned key for BYO (ADR-M007 D7, ADR-M008 A6)",
    "the exact committed name keeps its message byte for byte",
  );
});
