import { test } from "node:test";
import assert from "node:assert/strict";
import { heliusCredits, HELIUS_TARIFF_VERSION } from "../src/index.ts";

test("unknown_method_fail_closed", () => {
  // the [lu] closed table (FAITS-tarification-helius-2026-09-21 + rebase-crosscheck.ts:55-56):
  assert.equal(heliusCredits("getTransactionsForAddress"), 10, "archival gTfA - the incident's method");
  assert.equal(heliusCredits("getProgramAccounts"), 10);
  assert.equal(heliusCredits("getAssetsByOwner"), 10, "a DAS call");
  assert.equal(heliusCredits("getTransaction"), 1);
  assert.equal(heliusCredits("getSignaturesForAddress"), 1);
  // a method ABSENT from the closed table is REFUSED (throws), never priced 0 or a silent worst-case (ruling Q2).
  assert.throws(() => heliusCredits("getMagicUndocumentedArchival"), /absent from the closed tariff/);
  assert.equal(typeof HELIUS_TARIFF_VERSION, "string");
});
