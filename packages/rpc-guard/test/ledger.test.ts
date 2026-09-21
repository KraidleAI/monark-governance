import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  openCycleLedger, verifyCycleLedger, makeClient, InMemorySink, BudgetExceededError,
  type CycleLedgerEntry, type ClientConfig, type Transport,
} from "../src/index.ts";

const REPO = fileURLToPath(new URL("../../../", import.meta.url));
const paidCfg = (over: Partial<ClientConfig["limits"]> = {}): ClientConfig => ({
  operators: { helius: { unit: "credits", credits: () => 1, cycleCap: 8_000_000 } },
  limits: { maxCalls: 10, maxCredits: 1000, methodCaps: {}, cycleFloor: 0, ...over },
});

test("ledger_persists_and_fail_closes", () => {
  const dir = mkdtempSync(join(tmpdir(), "rpcg-"));
  try {
    const ledger = openCycleLedger(dir, "cycle-9", 0);
    ledger.appendChained("attempted", { "helius|getTransaction": 1 }, 1);
    ledger.appendChained("attempted", { "helius|getTransactionsForAddress": 1 }, 10);
    verifyCycleLedger(ledger.entries()); // green when intact
    // a broken chain is fail-closed (throw), never read as 0:
    const tampered: CycleLedgerEntry[] = [...ledger.entries()];
    tampered[1] = { ...tampered[1]!, credits_derived: 99 }; // sha no longer matches its core
    assert.throws(() => verifyCycleLedger(tampered), /sha mismatch|chain broken/);
    // an unreadable/malformed line on REOPEN is fail-closed:
    writeFileSync(ledger.path, "{not json\n", { flag: "a" });
    assert.throws(() => openCycleLedger(dir, "cycle-9", 0), /malformed/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("delete_ledger_prior_ge_floor", () => {
  const dir = mkdtempSync(join(tmpdir(), "rpcg-"));
  const FLOOR = 60938;
  try {
    const ledger = openCycleLedger(dir, "cycle-10", FLOOR);
    ledger.appendChained("attempted", { "helius|getTransactionsForAddress": 1 }, 10);
    assert.equal(ledger.priorCredits(), FLOOR, "prior = max(floor, sum) = floor here");
    rmSync(ledger.path); // wipe the ledger file - the HELIUS-1 reset-on-missing gesture
    const reopened = openCycleLedger(dir, "cycle-10", FLOOR);
    assert.equal(reopened.priorCredits(), FLOOR, "a wiped ledger reopens at the FLOOR, never 0 (mutant reset-on-missing => 0)");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("ledger_path_is_outside_out_and_repo", () => {
  const dir = mkdtempSync(join(tmpdir(), "rpcg-"));
  try {
    const ledger = openCycleLedger(dir, "cycle-11", 0);
    assert.ok(ledger.path.startsWith(dir), "the ledger lives under HELIUS_LEDGER_DIR");
    assert.ok(!ledger.path.startsWith(REPO), "the ledger is OUTSIDE the repo tree (never in --out)");
    // parent absent => throw (a ledger under an auto-created parent is a phantom; mutant mkdir-recursive => no throw):
    const ghost = join(dir, "does-not-exist-parent");
    assert.throws(() => openCycleLedger(ghost, "cycle-x", 0), /does not pre-exist/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("required_inputs_fail_closed", () => {
  const sink = new InMemorySink();
  const spy: Transport = () => Promise.resolve({ ok: 1 });
  const mk = (over: Partial<ClientConfig["limits"]>): (() => unknown) => () => makeClient(paidCfg(over), sink, { transport: spy });
  assert.throws(mk({ maxCalls: 0 }), BudgetExceededError, "--max-calls required (> 0)");
  assert.throws(mk({ maxCredits: 0 }), BudgetExceededError, "--max-credits required (> 0)");
  assert.throws(mk({ cycleFloor: Number.NaN }), BudgetExceededError, "--cycle-floor required");
  assert.throws(mk({ cycleFloor: 9_000_000 }), BudgetExceededError, "floor > cap => throw");
  // decision 115: a PAID operator without a cycle cap fail-closes at construction.
  const noCap: ClientConfig = { operators: { helius: { unit: "credits", credits: () => 1 } }, limits: paidCfg().limits };
  assert.throws(() => makeClient(noCap, sink, { transport: spy }), BudgetExceededError, "paid operator needs a cycle cap");
  // sanity: a fully-specified config constructs, and the ledger dir input is validated too.
  assert.doesNotThrow(() => makeClient(paidCfg(), sink, { transport: spy }));
  assert.ok(!existsSync(join(tmpdir(), "rpcg-nonexistent-xyz")));
});
