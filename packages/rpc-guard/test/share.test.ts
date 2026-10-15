// CAP-PER-ACCOUNT-1: a writer's declared share of the account (RunLimits.cycleShare, per operator) caps its OWN cumulative spend
// over the cycle (the attempted + settled credits of its ledger at open, plus this run), never max(floor, own) (priorAtOpen): a
// floor below the code cap leaves every run free to spend up to the cap, so a share posed as a floor would not bound the cycle.
// Without a share, every behaviour of the guard is unchanged. Internals are reached by relative import (C-V-2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { openGuardedClient, BudgetExceededError, HELIUS_CYCLE_CAP_CREDITS } from "@monark/rpc-guard";
import { ensureCycleDir, openOperatorLedger, parseEntries, type CycleLedgerEntry } from "../src/ledger.ts";
import { assertLimits, makeClient, type BudgetedClient, type OperatorClass, type RunLimits, type Transport } from "../src/client.ts";
import { heliusCredits, heliusSettle } from "../src/tariff.ts";
import { HELIUS, tmp, heliusLedger, heliusCfg, heliusClient, GTFA_P100, FAKE_HELIUS_ENV, okFetch } from "./harness.ts";

const GTFA = "getTransactionsForAddress"; // a page of 100 (GTFA_P100) reserves 10 credits; 150 rendered bodies settle at 20
const PAID: OperatorClass = { unit: "credits", credits: heliusCredits, settle: heliusSettle, cycleCap: 8_000_000 };
const limitsOf = (over: Partial<RunLimits> = {}): RunLimits => ({ maxCalls: 100, runCaps: { helius: 1_000_000 }, methodCaps: { [GTFA]: 100 }, cycleFloor: { helius: 0 }, ...over });
const ownSum = (entries: readonly CycleLedgerEntry[]): number => entries.reduce((a, e) => a + (e.outcome === "attempted" || e.outcome === "settled" ? e.credits_derived : 0), 0);
const isRefusal = (reason: string) => (e: unknown): boolean => e instanceof BudgetExceededError && e.message.includes(reason);
const ATTEMPTED_KEYS = ["prev_entry_sha256", "cycle_id", "tariff_version", "by_op_method", "outcome", "credits_derived", "entry_sha256"];
const REFUSED_KEYS = ["prev_entry_sha256", "cycle_id", "tariff_version", "by_op_method", "outcome", "credits_derived", "reason", "entry_sha256"];

/** One course: a FRESH ledger handle on the same cycle dir (prior and own sum frozen at open), then up to `tries` gTfA pages,
 *  stopping at the first guard refusal. The i-th response renders rendered[i] bodies (absent: 0, billed at the 10 reserved).
 *  Returns the number of transport invocations. */
async function course(cycleDir: string, limits: RunLimits, tries: number, rendered: readonly number[] = []): Promise<number> {
  const ledger = openOperatorLedger(cycleDir, "helius", limits.cycleFloor.helius ?? 0);
  let calls = 0;
  const spy: Transport = () => { const n = rendered[calls++] ?? 0; return Promise.resolve({ data: Array.from({ length: n }, (_, i) => i) }); };
  const client = makeClient({ operators: { helius: PAID }, limits }, new Map([["helius", ledger]]), { transport: spy });
  for (let i = 0; i < tries; i++) {
    try { await client.call(HELIUS, GTFA, GTFA_P100); } catch (e) { if (e instanceof BudgetExceededError) break; throw e; }
  }
  return calls;
}

// killer: packages/rpc-guard/src/client.ts:148 CONST "(ownFrozen.get(op) ?? 0) + (runByOp.get(op) ?? 0) + cost > share" -> "Math.max(cls.cycleCap! - share, ownFrozen.get(op) ?? 0) + (runByOp.get(op) ?? 0) + cost > cls.cycleCap!"
test("rpc_guard_share_caps_cumulative_spend_across_runs", async () => {
  // Three successive courses of one cycle, floor 40 ABOVE the share 30 (a floor is a reading of the account, never a share).
  const { dir, cleanup } = tmp();
  try {
    const cycleDir = ensureCycleDir(dir, "c-share");
    const limits = limitsOf({ cycleFloor: { helius: 40 }, cycleShare: { helius: 30 } });
    const calls = [await course(cycleDir, limits, 1, [150]), await course(cycleDir, limits, 4), await course(cycleDir, limits, 4)];
    // run 1: own 0 + 10 <= 30, billed 20 (settled +10); run 2: own 20 + 10 = 30 passes, 20 + 10 + 10 = 40 refused; run 3: 30 + 10 refused.
    assert.deepEqual(calls, [1, 1, 0], "the share bounds the CUMULATIVE own spend across courses (a floor cap - share would let run 2 spend 30 again)");
    const entries = openOperatorLedger(cycleDir, "helius", 40).entries();
    assert.equal(ownSum(entries), 30, "here the own spend stops AT the share; the check bounds each reservation, so a later settle delta could exceed it, as for cycle_cap");
    assert.deepEqual(entries.map((e) => [e.outcome, e.credits_derived, e.outcome === "refused" ? e.reason : ""]), [
      ["attempted", 10, ""], ["settled", 10, ""], ["attempted", 10, ""], ["refused", 0, "cycle_share"], ["refused", 0, "cycle_share"],
    ], "the settled delta counts in the own sum; each course stops on the named refusal");
  } finally { cleanup(); }
});

// killer: packages/rpc-guard/src/client.ts:88 COR "share !== undefined && !(" -> "share === undefined || !("
test("rpc_guard_without_share_is_unchanged", async () => {
  // caps.test.ts cycle_cap_stops (floor 15, cap 25) and cycle_cap_floor_probe (floor 100, cap 115), replayed with NO cycleShare key.
  for (const [floor, cap] of [[15, 25], [100, 115]] as const) {
    const { dir, cleanup } = tmp();
    try {
      const ledger = heliusLedger(dir, `c-${String(cap)}`, floor);
      let calls = 0; const spy: Transport = () => { calls++; return Promise.resolve({ ok: 1 }); };
      let client: BudgetedClient | undefined;
      assert.doesNotThrow(() => { client = heliusClient(heliusCfg({ cycleFloor: { helius: floor }, methodCaps: { [GTFA]: 100 } }, cap), ledger, spy); }, "no share: the config is admitted as before");
      await client!.call(HELIUS, GTFA, GTFA_P100);
      await assert.rejects(client!.call(HELIUS, GTFA, GTFA_P100), isRefusal("cycle_cap"));
      assert.equal(calls, 1, `floor ${String(floor)} / cap ${String(cap)}: exactly one transport, as in caps.test.ts`);
      assert.deepEqual(ledger.entries().map((e) => [Object.keys(e), e.outcome, e.credits_derived, e.reason]), [
        [ATTEMPTED_KEYS, "attempted", 10, undefined], [REFUSED_KEYS, "refused", 0, "cycle_cap"],
      ], "no share: the ledger lines keep their v2 fields, no new field and no new reason");
    } finally { cleanup(); }
  }
  // Non-vacuity: the SAME course with a share of 5 is refused on its first call, by the share alone (floor 15, cap 25 not reached).
  const { dir, cleanup } = tmp();
  try {
    const ledger = heliusLedger(dir, "c-contrast", 15);
    let calls = 0; const spy: Transport = () => { calls++; return Promise.resolve({ ok: 1 }); };
    const client = heliusClient(heliusCfg({ cycleFloor: { helius: 15 }, methodCaps: { [GTFA]: 100 }, cycleShare: { helius: 5 } }, 25), ledger, spy);
    await assert.rejects(client.call(HELIUS, GTFA, GTFA_P100), isRefusal("cycle_share"));
    assert.equal(calls, 0, "the share is the only switch: with it, the first call is refused before the transport");
  } finally { cleanup(); }
});

// killer: packages/rpc-guard/src/client.ts:88 CONST " && share <= cls.cycleCap" -> ""
test("rpc_guard_refuses_a_share_above_the_code_cap", () => {
  const ops: Record<string, OperatorClass> = { helius: { unit: "credits", credits: heliusCredits, cycleCap: 25 }, "keyless-relay": { unit: "keyless" } };
  const refused = (share: Record<string, number>): void => {
    assert.throws(() => { assertLimits(ops, limitsOf({ cycleShare: share })); }, (e: unknown) => e instanceof BudgetExceededError && /cycle share/.test(e.message), `share ${JSON.stringify(share)} must be refused`);
  };
  refused({ helius: 26 });                    // above the code cap of the operator
  assert.doesNotThrow(() => { assertLimits(ops, limitsOf({ cycleShare: { helius: 25 } })); }, "a share equal to the code cap is admitted");
  refused({ helius: 0 }); refused({ helius: -1 }); refused({ helius: 2.5 }); refused({ helius: Number.NaN });
  refused({ "keyless-relay": 5 });            // a share on an operator without a key
  refused({ chainstack: 5 });                 // a share on an operator this course does not request
  // The public path refuses it BEFORE any lock (no cycle dir created), at the decision-112 code cap.
  const { dir, cleanup } = tmp();
  try {
    assert.throws(() => openGuardedClient(FAKE_HELIUS_ENV, limitsOf({ cycleShare: { helius: HELIUS_CYCLE_CAP_CREDITS + 1 } }), dir, { helius: "c-over" }), (e: unknown) => e instanceof BudgetExceededError && /cycle share/.test(e.message));
    assert.equal(existsSync(join(dir, "c-over")), false, "a refused share leaves no lock and no ledger");
  } finally { cleanup(); }
});

// killer: packages/rpc-guard/src/client.ts:148 CONST "> share) refuse(op, method, \"cycle_share\")" -> "> share) refuse(op, method, \"cycle_cap\")"
test("rpc_guard_share_exhaustion_is_a_named_refusal_before_any_call", async () => {
  // Through the PUBLIC path: share 10, one gTfA page of 10 spends it; the next is refused by name, ledgered, and never reaches fetch.
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  let fetches = 0;
  globalThis.fetch = () => { fetches++; return okFetch(); };
  try {
    const client = openGuardedClient(FAKE_HELIUS_ENV, limitsOf({ cycleShare: { helius: 10 } }), dir, { helius: "c-exhaust" });
    await client.call(HELIUS, GTFA, GTFA_P100); // 0 + 0 + 10 = 10, not > 10
    await assert.rejects(client.call(HELIUS, GTFA, GTFA_P100), isRefusal("cycle_share")); // 0 + 10 + 10 = 20 > 10
    assert.equal(fetches, 1, "the refused call never reaches the transport");
    const entries = parseEntries(readFileSync(join(dir, "c-exhaust", "helius.jsonl"), "utf8"));
    assert.deepEqual(entries.map((e) => [e.outcome, e.credits_derived, e.reason, e.by_op_method]), [
      ["attempted", 10, undefined, { [`helius|${GTFA}`]: 1 }], ["refused", 0, "cycle_share", { [`helius|${GTFA}`]: 1 }],
    ], "a refused line written BEFORE any commit: one attempted line only, never an attempted line for the refused call");
    assert.deepEqual(client.spent(), { attempts: 1, byOperator: { helius: 10 } });
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

// killer: packages/rpc-guard/src/client.ts:126 CONST "{ reason }" -> "{}"
test("rpc_guard_refusal_carries_its_reason_code", async () => {
  // TICK-GUARD-ERROR-NAMES-ALL-1: a caller reads the refusal by its code, the reason of the ledger's refused line, never by the message.
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => okFetch();
  try {
    const client = openGuardedClient(FAKE_HELIUS_ENV, limitsOf({ cycleShare: { helius: 10 }, maxCalls: 2 }), dir, { helius: "c-code" });
    await client.call(HELIUS, GTFA, GTFA_P100);
    const reasons: unknown[] = [];
    for (let i = 0; i < 2; i++) await client.call(HELIUS, GTFA, GTFA_P100).catch((e: unknown) => { assert.ok(e instanceof BudgetExceededError); reasons.push((e as { reason?: unknown }).reason); });
    const refused = parseEntries(readFileSync(join(dir, "c-code", "helius.jsonl"), "utf8")).filter((e) => e.outcome === "refused").map((e) => e.reason);
    assert.deepEqual([reasons, refused], [["cycle_share", "cycle_share"], ["cycle_share", "cycle_share"]], "the thrown code is the ledger's reason");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

// killer: packages/rpc-guard/src/errors.ts:8 CONST " readonly reason?: string; " -> " "
test("rpc_guard_budget_error_declares_its_refusal_code", async () => {
  // The meter's BudgetExceededError carries `reason`, the code of its refused ledger line, as a field the class declares: a caller reads
  // e.reason typed, without a cast (the typecheck holds that read), and a stop that writes no refused line carries the field undefined.
  const bare = new BudgetExceededError("rpc-guard: a stop");
  assert.deepEqual([Object.hasOwn(bare, "reason"), bare.reason, bare.message], [true, undefined, "rpc-guard: a stop"],
    "declared by the class, undefined until a refusal sets it; the constructor and its message unchanged");
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => okFetch();
  try {
    const client = openGuardedClient(FAKE_HELIUS_ENV, limitsOf({ cycleShare: { helius: 10 } }), dir, { helius: "c-field" });
    await client.call(HELIUS, GTFA, GTFA_P100);
    const e = await client.call(HELIUS, GTFA, GTFA_P100).then(() => null, (x: unknown) => x);
    assert.ok(e instanceof BudgetExceededError, "the share refusal is a budget stop");
    const code: string | undefined = e.reason; // the typed read, no cast
    assert.deepEqual([code, e.message], ["cycle_share", "rpc-guard: cycle_share (fail-closed)"], "the code of the cycle_share refusal; the message unchanged");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});
