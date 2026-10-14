// MONARK Bell -- the deployment constants of the collection tick (scripts/bell-deploy.mjs): the values proposed by the plan of the
// collection timer (indexing margin, units per tick, attempt budget, the closed environment key list, the universe and the operators),
// and the run and method caps, read from the mode W3 line of the operator's launcher (apps/bell/ops/launch-q6.sh, one trading-day
// window) so that a drift of either side reds.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ATTEMPT_BUDGET, BELL_COLLECT_ENV_KEYS, BELL_METHOD_CAPS, BELL_OPERATORS, BELL_RUN_CAPS, BELL_UNIVERSE, UNIT_DUE_MARGIN_MIN, UNITS_PER_TICK } from "../scripts/bell-deploy.mjs";
import { UNITS_PER_TICK as PLAN_UNITS_PER_TICK } from "../apps/bell/src/plan.ts";
import { POOLS } from "../apps/bell/src/pools.ts";
import * as deploy from "../scripts/bell-deploy.mjs";

const LAUNCHER = readFileSync(join(import.meta.dirname, "..", "apps", "bell", "ops", "launch-q6.sh"), "utf8");
const nums = (re: RegExp): number[] => { const m = re.exec(LAUNCHER); assert.ok(m, `launch-q6.sh carries ${String(re)}`); return m.slice(1).map(Number); };

// killer: scripts/bell-deploy.mjs:13 CONST "UNIT_DUE_MARGIN_MIN = 30" -> "UNIT_DUE_MARGIN_MIN = 31"
test("bell_deploy_pins_the_proposed_values", () => {
  assert.deepEqual([UNIT_DUE_MARGIN_MIN, UNITS_PER_TICK, ATTEMPT_BUDGET], [30, 1, 8], "margin 30 min, one unit per tick, eight attempts per unit");
  assert.equal(UNITS_PER_TICK, PLAN_UNITS_PER_TICK, "the deployment and the planner hold the same k");
  assert.deepEqual([...BELL_COLLECT_ENV_KEYS], ["BELL_SOLANA_RPC", "HELIUS_API_KEY", "CHAINSTACK_SOLANA_URL", "DATABENTO_API_KEY", "POLYGON_API_KEY",
    "HELIUS_CYCLE_ANCHOR_UTC", "CHAINSTACK_CYCLE_ANCHOR_UTC", "HELIUS_CYCLE_SHARE", "CHAINSTACK_CYCLE_SHARE"], "the closed key list, no floor key");
  const [pages, gsfa, gai, gtfa] = nums(/^MAX_PAGES=(\d+); CAP_GSFA=(\d+); CAP_GAI=(\d+); CAP_GTFA=(\d+);/m);
  const [credits, gtx, calls, ru] = nums(/^\s*W3\)\s+FROM=\d+; TO=\d+; LOG=\S+;\s+MAX_CREDITS=(\d+); CAP_GTX=(\d+); MAX_CALLS=(\d+); MAX_RU=(\d+) ;;$/m);
  assert.deepEqual(BELL_RUN_CAPS, { maxCredits: credits, maxRu: ru, maxCalls: calls, maxPages: pages }, "the run caps of mode W3");
  assert.deepEqual(BELL_METHOD_CAPS, { getSignaturesForAddress: gsfa, getTransaction: gtx, getAccountInfo: gai, getTransactionsForAddress: gtfa }, "the method caps of mode W3");
  assert.ok([BELL_COLLECT_ENV_KEYS, BELL_RUN_CAPS, BELL_METHOD_CAPS].every((x) => Object.isFrozen(x)), "frozen: no caller widens them");
});

// killer: scripts/bell-deploy.mjs:9 CONST "[\"TSLAx\", \"AAPLx\"]" -> "[\"TSLAx\", \"AAPLx\", \"SPYx\"]"
test("bell_deploy_universe_is_the_dated_list", () => {
  assert.deepEqual([[...BELL_UNIVERSE], [...BELL_OPERATORS]], [["TSLAx", "AAPLx"], ["helius", "chainstack"]], "two mints, never one; two operators");
  assert.ok(Object.isFrozen(BELL_UNIVERSE) && Object.isFrozen(BELL_OPERATORS), "frozen: an extension is a dated line and this test");
  for (const m of BELL_UNIVERSE) assert.ok(POOLS.some((p) => p.baseSymbol === m && p.chain === "solana"), `${m} is a Solana pool the collector knows`);
});

// killer: scripts/bell-deploy.mjs:27 CONST "TICK_TIMEOUT_START_SEC = 7200" -> "TICK_TIMEOUT_START_SEC = 3600"
test("bell_deploy_pins_the_floor_and_the_tick_timeout_bound", () => {
  const d = deploy as Record<string, unknown>;
  assert.deepEqual([d.BELL_FLOORS, d.TICK_TIMEOUT_START_SEC], [{ helius: 0, chainstack: 0 }, 7200], "floor zero per operator (A-6); a declared upper bound of a tick's run, 2 h, until the rehearsal measures it (N-3)");
  assert.ok(Object.isFrozen(d.BELL_FLOORS), "frozen: no caller widens it");
  assert.deepEqual(Object.keys(d.BELL_FLOORS as object), [...BELL_OPERATORS], "one floor per operator of a run, in the same order");
});
