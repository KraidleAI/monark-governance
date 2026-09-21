import { test } from "node:test";
import assert from "node:assert/strict";
// T18: import the canonical class by the PACKAGE NAME (self-reference) so we assert the EXPORTED identity is the
// very class the client throws - not a relative twin that could differ across the package boundary (C-13).
import { BudgetExceededError } from "@monark/rpc-guard";
import { HELIUS, OK, tmp, heliusLedger, heliusCfg, heliusClient } from "./harness.ts";
import type { Transport } from "../src/client.ts";

test("transport_never_receives_url", async () => {
  const { dir, cleanup } = tmp();
  try {
    const ledger = heliusLedger(dir);
    const seen: string[] = [];
    const spy: Transport = (op) => { seen.push(String(op)); return Promise.resolve({ ok: 1 }); };
    const client = heliusClient(heliusCfg(), ledger, spy);
    await client.call(HELIUS, "getTransaction", [1]);
    await client.call(HELIUS, "getSignaturesForAddress", ["m"]);
    const labels = new Set(client.operators().map(String));
    assert.equal(seen.length, 2, "the spy was invoked once per call");
    for (const first of seen) {
      assert.ok(labels.has(first), `transport got a non-label first arg: ${first}`);
      assert.doesNotMatch(first, /https?:|api-key|SECRET|:\/\//i, "transport first arg looks like a URL/secret");
    }
    // one transport invocation per `attempted` ledger line (mutant "retry nested"/"transport gets url" break this).
    assert.equal(seen.length, ledger.entries().filter((e) => e.outcome === "attempted").length);
  } finally { cleanup(); }
});

test("budget_stop_not_swallowed_by_quorum2", async () => {
  class Fatal403 extends BudgetExceededError {}
  assert.ok(new Fatal403() instanceof BudgetExceededError, "a subclass is still an instanceof the canonical class");
  const { dir, cleanup } = tmp();
  try {
    const client = heliusClient(heliusCfg({ maxCalls: 1 }), heliusLedger(dir), OK);
    await client.call(HELIUS, "getTransaction", [1]); // consumes the only allowed attempt
    const guarded = async (): Promise<string> => {
      try { await client.call(HELIUS, "getTransaction", [1]); return "no-stop"; }
      catch (e) { if (e instanceof BudgetExceededError) throw e; return "benched"; }
    };
    await assert.rejects(guarded(), (e: unknown) => e instanceof BudgetExceededError,
      "a budget stop must propagate through the quorum2 guard, never be swallowed as a fault");
  } finally { cleanup(); }
});
