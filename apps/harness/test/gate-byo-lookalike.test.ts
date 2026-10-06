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
import { SCHEMA_VERSION } from "../src/tools/gate.ts";

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
  return { schema_version: SCHEMA_VERSION, task_class: taskClass, yhat, predictor_id: predictorId, produced_at: "2026-09-04T00:00:00Z" };
}

function decided(p: Prediction, cal: NonNullable<HarnessParams["calibration"]>, at: string): ReturnType<typeof runGate> {
  try {
    return runGate(p, { ...PARAMS, calibration: cal });
  } catch (e) {
    assert.fail(`${at}: an honest BYO name must decide, got ${String(e)}`);
  }
}

/** The codes of the B-1 rule. A name B-1 refuses keeps a B-1 code and message: the B-10 guard (CM-2c) runs after it. */
const B1_CODES: readonly unknown[] = ["byo_edge_blank", "byo_lookalike_committed", "byo_reserved_kata"];

function refused(p: Prediction, cal: NonNullable<HarnessParams["calibration"]>, at: string): void {
  assert.throws(
    () => runGate(p, { ...PARAMS, calibration: cal }),
    (e: unknown) => e instanceof HarnessToolError && B1_CODES.includes(e.code) && /\(ADR-CM B-1[,)]/.test(e.message),
    `${at}: a look-alike BYO must be a named tool error (400) with a B-1 code and message, not a later guard's`,
  );
}

// Test T-1 (F2P): the eight look-alike names of MONARK's probe (status of audit P3, priority 1), plus a case variant
// of the stable-run class with the committed key, are refused.
// killer: apps/harness/src/tools/gate.ts:828 CONST "asciiLower(taskClass)" -> "taskClass"
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
  // Pinned in the same test (red at the base by the refusals above): honest names keep deciding, and an exact
  // committed name keeps the message of the exact guard byte for byte (the look-alike guard runs after it).
  for (const [cls, key] of [["acme-model-x", "caller:model"], ["acme model x", "caller: model"]] as [string, string][]) {
    const d = decided(pred(cls, key, "A"), SET_CAL, `${cls} / ${key}`);
    assertClosedGateDecision(d);
    assert.equal(d.action, "commit", `${cls}: an honest BYO set {A} with tau 1 commits`);
    assert.equal(d.verdict.task_class, cls);
  }
  const other = decided(pred("stable-run-velocity-24h", "caller:other-population", 1), INTERVAL_CAL, "stable-run, other population");
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

// Test T-1b (F2P): a case variant of the liq class, committed on the CLASS, is refused for any key.
// killer: apps/harness/src/tools/gate.ts:779 CONST "TASK_CASCADE, TASK_LIQ_ELIGIBLE" -> "TASK_CASCADE"
test("byo_lookalike_liq_class_case_refused", () => {
  refused(pred("Liquidation-Eligible-Coverage", "caller:model", "A"), SET_CAL, "liq class, other case");
  refused(pred("LIQUIDATION-ELIGIBLE-COVERAGE", "caller:other", 1), INTERVAL_CAL, "liq class, upper case");
});

// Test T-2 (F2P): a leading or trailing blank (space, tab, no-break space) on the class or on the key is refused
// on the BYO path, for any name (tab and no-break space reach the guard on a direct runGate call only: the
// frozen schema refuses them at the served boundary).
// killer: apps/harness/src/tools/gate.ts:825 CONST "EDGE_BLANK.test(predictorId)" -> "false"
test("byo_edge_blank_refused", () => {
  for (const blank of [" ", "\t", "\u00a0"]) {
    refused(pred(`acme-model-x${blank}`, "caller:model", "A"), SET_CAL, `class trailing ${JSON.stringify(blank)}`);
    refused(pred(`${blank}acme-model-x`, "caller:model", "A"), SET_CAL, `class leading ${JSON.stringify(blank)}`);
    refused(pred("acme-model-x", `caller:model${blank}`, "A"), SET_CAL, `key trailing ${JSON.stringify(blank)}`);
    refused(pred("acme-model-x", `${blank}caller:model`, "A"), SET_CAL, `key leading ${JSON.stringify(blank)}`);
  }
});

// Test T-3 (F2P): the kata class pattern is reserved against BYO, in any ASCII case; near names are not.
// killer: apps/harness/src/tools/gate.ts:833 CONST "KATA_CLASS_RE.test(cls)" -> "false"
test("byo_kata_class_names_reserved", () => {
  for (const cls of ["btc-dir-1h", "ETH-RANGE-4H", "sol-mae-down-1h", "Bnb-Mae-Up-4h"]) {
    refused(pred(cls, "caller:model", "A"), SET_CAL, `kata class ${cls}`);
  }
  // Pinned: class names that merely contain a kata fragment keep deciding (anchors of the pattern).
  for (const cls of ["my-btc-dir-1h-clone", "acme-btc-dir-1h", "btc-dir-1h-v2", "btc-dir-1d"]) {
    const d = decided(pred(cls, "caller:model", "A"), SET_CAL, cls);
    assert.equal(d.action, "commit", `${cls}: not a kata class name`);
  }
});

// Test T-3b (F2P): the `kata:` key prefix is reserved against BYO, in any ASCII case; near keys are not.
// killer: apps/harness/src/tools/gate.ts:833 CONST "key.startsWith(KATA_KEY_PREFIX)" -> "false"
test("byo_kata_key_prefix_reserved", () => {
  for (const key of ["kata:vote4-v1@binance/BTCUSDT/1h/up-b3", "KATA:anything", "KaTa:x"]) {
    refused(pred("acme-model-x", key, "A"), SET_CAL, `kata key ${key}`);
  }
  // Pinned: keys that contain "kata" without starting with "kata:" keep deciding.
  for (const key of ["caller:kata", "kata-model", "katax", "caller:kata:x"]) {
    const d = decided(pred("acme-model-x", key, "A"), SET_CAL, key);
    assert.equal(d.action, "commit", `${key}: not the kata key prefix`);
  }
});
