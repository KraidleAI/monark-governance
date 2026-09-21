import { test } from "node:test";
import assert from "node:assert/strict";
import { makeClient, InMemorySink, type OperatorLabel, type Transport, type ClientConfig } from "../src/index.ts";
// T18: import the canonical class by the PACKAGE NAME (self-reference) so we assert the EXPORTED identity is the
// very class the client throws - not a relative twin that could differ across the package boundary (C-13).
import { BudgetExceededError } from "@monark/rpc-guard";

const HELIUS = "helius" as OperatorLabel;
const heliusCredits = (m: string): number => (m === "getTransactionsForAddress" ? 10 : 1);

function baseConfig(over: Partial<ClientConfig["limits"]> = {}): ClientConfig {
  return {
    operators: { helius: { unit: "credits", credits: heliusCredits, cycleCap: 8_000_000 } },
    limits: { maxCalls: 100, maxCredits: 1_000_000, methodCaps: {}, cycleFloor: 0, ...over },
  };
}

test("transport_never_receives_url", async () => {
  const sink = new InMemorySink();
  const seen: string[] = [];
  const spy: Transport = (op) => { seen.push(String(op)); return Promise.resolve({ ok: true }); };
  const client = makeClient(baseConfig(), sink, { transport: spy });
  await client.call(HELIUS, "getTransaction", [1]);
  await client.call(HELIUS, "getSignaturesForAddress", ["m"]);
  const labels = new Set(client.operators().map(String));
  assert.ok(seen.length === 2, "the spy was invoked once per call");
  for (const first of seen) {
    assert.ok(labels.has(first), `transport got a non-label first arg: ${first}`);
    assert.doesNotMatch(first, /https?:|api-key|SECRET|:\/\//i, "transport first arg looks like a URL/secret");
  }
  // sect.6-C4: exactly one transport invocation per `attempted` ledger line (mutant "retry nested" breaks this).
  assert.equal(seen.length, sink.records.filter((r) => r.outcome === "attempted").length);
});

test("budget_stop_not_swallowed_by_quorum2", async () => {
  // canonical class identity is preserved across the boundary AND under subclassing (Fatal403Error motif).
  class Fatal403 extends BudgetExceededError {}
  assert.ok(new Fatal403() instanceof BudgetExceededError, "a subclass is still an instanceof the canonical class");
  const sink = new InMemorySink();
  const spy: Transport = () => Promise.resolve({ ok: true });
  const client = makeClient(baseConfig({ maxCalls: 1 }), sink, { transport: spy });
  await client.call(HELIUS, "getTransaction", [1]); // consumes the only allowed attempt
  // a quorum2-like guard BENCHES a transport fault but MUST re-throw a budget stop (never fail-open).
  const guarded = async (): Promise<string> => {
    try { await client.call(HELIUS, "getTransaction", [1]); return "no-stop"; }
    catch (e) { if (e instanceof BudgetExceededError) throw e; return "benched"; }
  };
  await assert.rejects(guarded(), (e: unknown) => e instanceof BudgetExceededError,
    "a budget stop must propagate through the quorum2 guard, never be swallowed as a fault");
});
