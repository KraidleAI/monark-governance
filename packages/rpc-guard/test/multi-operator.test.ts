// GARDE-HELIUS-2 multi-operator core (C-2 + D3). A SECOND paid operator (chainstack, RU) alongside helius (credits):
// per-operator priors/units/floors/caps, an operator SUBSET on openGuardedClient (a Ukemi course never locks helius),
// an ATOMIC multi-lock with rollback, the prior FROZEN AFTER the lock, and the transport timeout/abort/error hook.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, appendFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { openGuardedClient, BudgetExceededError, ETH_CALL_KEYLESS_LABELS, GET_LOGS_KEYLESS_LABELS } from "@monark/rpc-guard";
import { makeClient, type OperatorClass, type RunLimits, type OperatorLabel } from "../src/client.ts";
import { ensureCycleDir, openOperatorLedger } from "../src/ledger.ts";
import { acquireLock, releaseLock, LockHeldError } from "../src/lock.ts";
import { chainstackRu, heliusCredits } from "../src/tariff.ts";
import { tmp, OK } from "./harness.ts";

const HELIUS = "helius" as OperatorLabel, CHAINSTACK = "chainstack" as OperatorLabel, DRPC = "drpc.org" as OperatorLabel;
const ENV_BOTH = { BELL_SOLANA_RPC: "https://example.invalid/HELIUS", HELIUS_API_KEY: "FAKEKEY-9z9z9z", CHAINSTACK_ETH_URL: "https://example.invalid/CHAINSTACK" };
const okFetch = (): Promise<Response> => Promise.resolve(new Response(JSON.stringify({ result: 1 }), { status: 200, headers: { "content-type": "application/json" } }));

test("two_paid_operators_keep_separate_priors_and_units", async () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "cyc");
    // helius: floor 15 / cap 25 in CREDITS (gTfA = 10). chainstack: floor 5 / cap 9 in RU (eth_call = 2). Distinct
    // floors AND units AND caps; a SHARED scalar floor (mutant) would apply 15 to chainstack (> cap 9) and throw.
    const ops = {
      helius: { unit: "credits", credits: heliusCredits, cycleCap: 25 } as OperatorClass,
      chainstack: { unit: "ru", credits: chainstackRu, cycleCap: 9 } as OperatorClass,
    };
    const limits: RunLimits = { maxCalls: 100, runCaps: { helius: 1000, chainstack: 1000 }, methodCaps: { getTransactionsForAddress: 100, eth_call: 100 }, cycleFloor: { helius: 15, chainstack: 5 } };
    const ledgers = new Map([["helius", openOperatorLedger(cd, "helius", 15)], ["chainstack", openOperatorLedger(cd, "chainstack", 5)]]);
    const client = makeClient({ operators: ops, limits }, ledgers, { transport: OK });
    await client.call(HELIUS, "getTransactionsForAddress", ["m"]);        // helius 15+0+10 = 25 <= 25 => ok
    await client.call(CHAINSTACK, "eth_call", [{}, "0x1"]);               // chainstack 5+0+2 = 7 <= 9 => ok
    await client.call(CHAINSTACK, "eth_call", [{}, "0x1"]);               // chainstack 5+2+2 = 9 <= 9 => ok
    await assert.rejects(client.call(HELIUS, "getTransactionsForAddress", ["m"]), (e: unknown) => e instanceof BudgetExceededError); // 15+10+10 = 35 > 25
    await assert.rejects(client.call(CHAINSTACK, "eth_call", [{}, "0x1"]), (e: unknown) => e instanceof BudgetExceededError);        // 5+4+2 = 11 > 9
    // spent is PER OPERATOR in the op's unit - RU (4) and credits (10) are NEVER summed (mutant "units merged" reds).
    assert.deepEqual(client.spent().byOperator, { helius: 10, chainstack: 4 });
  } finally { cleanup(); }
});

test("paid_operator_requires_cycle_cap", () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "cap");
    const mk = (op: string, cls: OperatorClass) => () => makeClient(
      { operators: { [op]: cls }, limits: { maxCalls: 10, runCaps: { [op]: 100 }, methodCaps: { eth_call: 1 }, cycleFloor: { [op]: 0 } } },
      new Map([[op, openOperatorLedger(cd, op, 0)]]), { transport: OK });
    // decision 115: EVERY paid operator (credits OR ru) must carry a cycle cap, else fail-closed at construction.
    assert.throws(mk("chainstack", { unit: "ru", credits: chainstackRu }), BudgetExceededError, "chainstack (ru) without a cycle cap");
    assert.throws(mk("helius", { unit: "credits", credits: heliusCredits }), BudgetExceededError, "helius (credits) without a cycle cap");
    assert.doesNotThrow(mk("chainstack", { unit: "ru", credits: chainstackRu, cycleCap: 16_000_000 }), "chainstack WITH a cap constructs");
  } finally { cleanup(); }
});

test("keyless_method_attempts_never_spend_a_paid_method_cap", async () => {
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = okFetch;
  try {
    const limits: RunLimits = { maxCalls: 100, runCaps: { chainstack: 1000 }, methodCaps: { eth_call: 1 }, cycleFloor: { chainstack: 0 } };
    const client = openGuardedClient(ENV_BOTH, limits, dir, { chainstack: "cyc", "drpc.org": "cyc" });
    // FIVE keyless eth_call (cost 0). They must NOT consume chainstack's per-method cap: the counter is keyed by
    // (op, method), so `drpc.org|eth_call` is separate from `chainstack|eth_call` (mutant: one global counter).
    for (let i = 0; i < 5; i++) await client.call(DRPC, "eth_call", [{}, "0x1"]);
    // the FIRST paid chainstack eth_call must still pass (cap 1). The global-counter mutant refuses it (5 >= 1).
    await client.call(CHAINSTACK, "eth_call", [{}, "0x1"]);
    assert.equal(client.spent().byOperator.chainstack, 2, "one paid eth_call = 2 RU; the keyless calls stayed at 0 cost");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

test("unrequested_operator_is_never_locked", () => {
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = okFetch;
  try {
    const cd = ensureCycleDir(dir, "cyc");
    // env resolves BOTH helius and chainstack, but the course requests ONLY chainstack (a Ukemi course).
    const limits: RunLimits = { maxCalls: 100, runCaps: { chainstack: 1000 }, methodCaps: { eth_call: 100 }, cycleFloor: { chainstack: 0 } };
    const client = openGuardedClient(ENV_BOTH, limits, dir, { chainstack: "cyc" });
    assert.deepEqual(client.operators().map(String), ["chainstack"], "ONLY the requested operator is opened (mutant: subset ignored)");
    assert.ok(existsSync(join(cd, "chainstack.lock")), "the requested operator IS locked");
    assert.ok(!existsSync(join(cd, "helius.lock")), "the UNREQUESTED helius is never locked (mutant: locks all resolved)");
    assert.ok(!existsSync(join(cd, "helius.jsonl")), "the UNREQUESTED helius is never even opened");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

test("multi_lock_acquire_is_atomic_with_rollback", () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "cyc");
    // BI-PROCESS: a real child process (node --eval, type-stripping the .ts import) acquires the `helius` lock and
    // exits; the lock is file existence, so it persists. execFileSync blocks until the child exits => deterministic.
    const lockUrl = new URL("../src/lock.ts", import.meta.url).href;
    const childCode = `const { acquireLock } = await import(${JSON.stringify(lockUrl)}); acquireLock(${JSON.stringify(cd)}, "helius");`;
    execFileSync(process.execPath, ["--eval", childCode], { stdio: "pipe" });
    assert.ok(existsSync(join(cd, "helius.lock")), "the child (process 2) holds the helius lock");
    // The parent requests {chainstack, helius}: locks acquire in SORTED order, so chainstack (1st) succeeds and helius
    // (2nd, held by the child) throws. The k-1 already-held lock (chainstack) MUST be rolled back, and 0 transport runs.
    let threw: unknown;
    const limits: RunLimits = { maxCalls: 100, runCaps: { helius: 1000, chainstack: 1000 }, methodCaps: { eth_call: 100, getTransaction: 100 }, cycleFloor: { helius: 0, chainstack: 0 } };
    try { openGuardedClient(ENV_BOTH, limits, dir, { chainstack: "cyc", helius: "cyc" }); } catch (e) { threw = e; }
    assert.ok(threw instanceof LockHeldError, "the k-th lock (helius) fails => LockHeldError, not a client");
    assert.ok(!existsSync(join(cd, "chainstack.lock")), "ATOMIC rollback: the k-1 lock (chainstack) was released (mutant: rollback removed => it persists)");
    assert.ok(existsSync(join(cd, "helius.lock")), "the child's helius lock is untouched by the rollback");
  } finally { cleanup(); }
});

test("prior_is_frozen_after_lock", () => {
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  try {
    const cd = ensureCycleDir(dir, "cyc");
    const ledgerPath = join(cd, "chainstack.jsonl"), headPath = join(cd, "chainstack.head");
    const ENV = { CHAINSTACK_ETH_URL: "https://example.invalid/CS" };
    const limits: RunLimits = { maxCalls: 100, runCaps: { chainstack: 1_000_000 }, methodCaps: { eth_call: 100 }, cycleFloor: { chainstack: 0 } };
    // A writer W holds the lock and leaves a MALFORMED partial line on disk (a crash mid-append). This is the
    // DETERMINISTIC barrier (no cross-process race): the sole public path must hit the held lock BEFORE it reads the
    // file. Correct => LockHeldError. The mutant "open the ledger before acquiring the lock" reads the malformed file
    // and throws /malformed/ instead - so the prior would be frozen from a stale/partial read.
    acquireLock(cd, "chainstack");
    appendFileSync(ledgerPath, "{ partial not-json\n");
    assert.throws(() => openGuardedClient(ENV, limits, dir, { chainstack: "cyc" }),
      (e: unknown) => e instanceof LockHeldError && !/malformed/i.test(String(e)), "open must be gated by the lock");
    // W repairs (fresh ledger), commits a VALID prior of 2 RU UNDER its lock, then releases.
    rmSync(ledgerPath, { force: true }); rmSync(headPath, { force: true });
    openOperatorLedger(cd, "chainstack", 0).appendChained("attempted", { "chainstack|eth_call": 1 }, 2);
    releaseLock(cd, "chainstack");
    // The on-disk prior now reflects W's committed 2 RU; the public path, opening the ledger UNDER the lock, sees it.
    assert.equal(openOperatorLedger(cd, "chainstack", 0).priorAtOpen(), 2, "the frozen prior includes the writer's committed 2 RU");
    globalThis.fetch = okFetch;
    const client = openGuardedClient(ENV, limits, dir, { chainstack: "cyc" });
    assert.deepEqual(client.operators().map(String), ["chainstack"], "the public path acquires once the lock is free");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

test("transport_timeout_aborts_and_hook_carries_label_and_error_name_never_url", async () => {
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  // A fetch that hangs until its AbortSignal fires (the 10 ms timeout), then rejects with an AbortError.
  globalThis.fetch = (_input, init) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => { reject(new DOMException("aborted", "AbortError")); });
  });
  const seen: Array<[string, string]> = [];
  try {
    const limits: RunLimits = { maxCalls: 100, runCaps: { chainstack: 1000 }, methodCaps: { eth_call: 100 }, cycleFloor: { chainstack: 0 } };
    const client = openGuardedClient({ CHAINSTACK_ETH_URL: "https://SECRET-KEY-9z9z.example.invalid/rpc" }, limits, dir,
      { chainstack: "cyc" }, { timeoutMs: 10, onTransportError: (op, name) => { seen.push([op, name]); } });
    await assert.rejects(client.call(CHAINSTACK, "eth_call", [{}, "0x1"]), (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      assert.doesNotMatch(msg, /SECRET-KEY|example\.invalid/i, `the thrown error leaks the endpoint: ${msg}`);
      return e instanceof Error;
    });
    assert.deepEqual(seen, [["chainstack", "AbortError"]], "the hook got the label + error NAME only, never the URL");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

test("keyless_eth_labels_pinned_to_recorder_order", async (t) => {
  // LOCK the exported keyless ETH label lists to the recorder's PINNED provider order (rpc2.ts). A non-literal
  // dynamic import (the ledger-format-lock precedent) keeps the public-export typecheck green and SKIPs when
  // apps/sentinel is absent (public tree); in the repo CI a drift on either side reds.
  const rpc2Rel = "../../../apps/sentinel/src/ukemi/rpc2.ts", rpcRel = "../../../apps/sentinel/src/rpc.ts";
  if (!existsSync(new URL(rpc2Rel, import.meta.url))) { t.skip("apps/sentinel absent (public export tree); the lock runs in the repo CI"); return; }
  const spec2: string = rpc2Rel, spec1: string = rpcRel; // non-literal => tsc leaves them unresolved
  const rpc2 = (await import(spec2)) as { ETH_CALL_PROVIDERS: readonly string[]; GET_LOGS_PROVIDERS: readonly string[] };
  const rpc = (await import(spec1)) as { providerOf: (u: string) => string };
  assert.deepEqual(rpc2.ETH_CALL_PROVIDERS.map(rpc.providerOf), [...ETH_CALL_KEYLESS_LABELS], "eth_call keyless labels drifted from the recorder order");
  assert.deepEqual(rpc2.GET_LOGS_PROVIDERS.map(rpc.providerOf), [...GET_LOGS_KEYLESS_LABELS], "getLogs keyless labels drifted from the recorder order");
});
