import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureCycleDir, openOperatorLedger, verifyCycleLedger, type CycleLedgerEntry } from "../src/ledger.ts";
import { makeClient, type ClientConfig, type Transport } from "../src/client.ts";
import { BudgetExceededError } from "@monark/rpc-guard";
import { heliusCredits } from "../src/tariff.ts";
import { HELIUS, OK, tmp } from "./harness.ts";

const REPO = fileURLToPath(new URL("../../../", import.meta.url));

test("ledger_persists_and_fail_closes", () => {
  const { dir, cleanup } = tmp();
  try {
    const a = openOperatorLedger(ensureCycleDir(dir, "ca"), "helius", 0);
    a.appendChained("attempted", { "helius|getTransaction": 1 }, 1);
    a.appendChained("attempted", { "helius|getTransactionsForAddress": 1 }, 10);
    verifyCycleLedger(a.entries()); // green when intact
    const tampered: CycleLedgerEntry[] = [...a.entries()];
    tampered[1] = { ...tampered[1]!, credits_derived: 99 };
    assert.throws(() => verifyCycleLedger(tampered), /sha mismatch|chain broken/);
    writeFileSync(a.path, "{not json\n", { flag: "a" }); // malformed line on reopen => throw
    assert.throws(() => openOperatorLedger(ensureCycleDir(dir, "ca"), "helius", 0), /malformed/);
    // C-V-8 (b): ledger present + head sidecar deleted => throw.
    const b = openOperatorLedger(ensureCycleDir(dir, "cb"), "helius", 0);
    b.appendChained("attempted", { "helius|getTransaction": 1 }, 1);
    rmSync(b.headPath);
    assert.throws(() => openOperatorLedger(ensureCycleDir(dir, "cb"), "helius", 0), /head sidecar absent/);
    // C-V-8 (c): tail truncation (a valid chain PREFIX) but a stale head => throw (P2, undetectable by replay alone).
    const cdir = ensureCycleDir(dir, "cc");
    const c = openOperatorLedger(cdir, "helius", 0);
    c.appendChained("attempted", { "helius|getTransaction": 1 }, 1);
    const firstLine = readFileSync(c.path, "utf8").split(/\r?\n/).filter(Boolean)[0]!;
    c.appendChained("attempted", { "helius|getTransaction": 1 }, 1); // head now points to entry 2
    writeFileSync(c.path, firstLine + "\n"); // chop back to entry 1, keep the head sidecar at entry 2 (c is stale from here)
    assert.throws(() => openOperatorLedger(cdir, "helius", 0), /tail truncation/);
  } finally { cleanup(); }
});

test("delete_ledger_prior_ge_floor", () => {
  const { dir, cleanup } = tmp();
  const FLOOR = 60938;
  try {
    const cd = ensureCycleDir(dir, "c10");
    const ledger = openOperatorLedger(cd, "helius", FLOOR);
    ledger.appendChained("attempted", { "helius|getTransactionsForAddress": 1 }, 10);
    assert.equal(ledger.priorAtOpen(), FLOOR, "prior = max(floor, Sigma) = floor here");
    rmSync(ledger.path); rmSync(ledger.headPath); // wipe BOTH files (the HELIUS-1 "rm the dir" gesture)
    const reopened = openOperatorLedger(cd, "helius", FLOOR);
    assert.equal(reopened.priorAtOpen(), FLOOR, "a wiped ledger reopens at the FLOOR, never 0 (mutant reset-on-missing => 0)");
  } finally { cleanup(); }
});

test("ledger_path_is_outside_out_and_repo", () => {
  const { dir, cleanup } = tmp();
  try {
    const ledger = openOperatorLedger(ensureCycleDir(dir, "c11"), "helius", 0);
    assert.ok(ledger.path.startsWith(dir), "the ledger lives under HELIUS_LEDGER_DIR");
    assert.ok(!ledger.path.startsWith(REPO), "the ledger is OUTSIDE the repo tree (never in --out)");
    assert.throws(() => ensureCycleDir(join(dir, "ghost-parent"), "cx"), /does not pre-exist/); // mutant mkdir-recursive
  } finally { cleanup(); }
});

test("required_inputs_fail_closed", async () => {
  const { dir, cleanup } = tmp();
  try {
    // GARDE-HELIUS-2: PER-OPERATOR limits (runCaps / cycleFloor keyed by label). The run-cost cap for a paid operator
    // replaces the former scalar maxCredits.
    const mk = (over: Partial<ClientConfig["limits"]>, cap = 8_000_000, cycle = "t12") => () => makeClient(
      { operators: { helius: { unit: "credits", credits: heliusCredits, cycleCap: cap } }, limits: { maxCalls: 10, runCaps: { helius: 1000 }, methodCaps: { getTransaction: 1 }, cycleFloor: { helius: 0 }, ...over } },
      new Map([["helius", openOperatorLedger(ensureCycleDir(dir, cycle), "helius", 0)]]), { transport: OK });
    assert.throws(mk({ maxCalls: 0 }), BudgetExceededError, "--max-calls required (> 0)");
    assert.throws(mk({ runCaps: { helius: 0 } }), BudgetExceededError, "run cap required (> 0) for the paid operator");
    assert.throws(mk({ cycleFloor: { helius: Number.NaN } }), BudgetExceededError, "--cycle-floor required per operator");
    assert.throws(mk({ cycleFloor: { helius: 9_000_000 } }), BudgetExceededError, "floor > cap => throw");
    assert.throws(mk({ methodCaps: {} }), BudgetExceededError, "empty --method-caps on a paid operator (C-V-5, M7a)");
    // paid operator without a cycle cap (decision 115).
    assert.throws(() => makeClient({ operators: { helius: { unit: "credits", credits: heliusCredits } }, limits: { maxCalls: 10, runCaps: { helius: 1000 }, methodCaps: { getTransaction: 1 }, cycleFloor: { helius: 0 } } },
      new Map([["helius", openOperatorLedger(ensureCycleDir(dir, "t12b"), "helius", 0)]]), { transport: OK }), BudgetExceededError);
    // M7b: a paid method NOT listed in --method-caps is REFUSED (not silently uncapped), 0 transport, ledgered.
    let calls = 0; const spy: Transport = () => { calls++; return Promise.resolve({ ok: 1 }); };
    const led = openOperatorLedger(ensureCycleDir(dir, "t12c"), "helius", 0);
    const c = makeClient({ operators: { helius: { unit: "credits", credits: heliusCredits, cycleCap: 8_000_000 } }, limits: { maxCalls: 10, runCaps: { helius: 1000 }, methodCaps: { getTransaction: 1 }, cycleFloor: { helius: 0 } } }, new Map([["helius", led]]), { transport: spy });
    await assert.rejects(c.call(HELIUS, "getTransactionsForAddress", ["m"]), (e: unknown) => e instanceof BudgetExceededError);
    assert.equal(calls, 0);
    assert.equal(led.entries().at(-1)!.reason, "method_cap_unlisted");
  } finally { cleanup(); }
});
