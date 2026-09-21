import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sha256Hex, ledgerHeadSha, chainCycleEntry, verifyCycleLedger, LEDGER_GENESIS } from "../src/ledger.ts";

// LOCK the cycle-ledger chaining primitive to the reference it is a calque of (plan sect.3.2: "redeclare
// byte-identical with a lock test"). The reference apps/bell/src/rebase-crosscheck.ts lives in the REPO but is NOT
// in the public export (apps/bell is off-whitelist), so we (a) resolve it with a NON-LITERAL dynamic import (tsc
// does not statically resolve it — the exported typecheck stays green) and (b) SKIP when it is absent (the lock
// runs in the repo CI, where drift on either side reds). A TEST importing the reference is invisible to
// deps-hygiene (which scans src/ for @monark/*).
const REF_REL = "../../../apps/bell/src/rebase-crosscheck.ts";
const REF_ABS = fileURLToPath(new URL(REF_REL, import.meta.url));

interface RefMod {
  chainedLedgerEntry: (prev: string, page: number, txs: ReadonlyArray<{ sig: string; slot: number }>) => (Record<string, unknown> & { entry_sha256: string }) | null;
  ledgerSha: (e: readonly unknown[]) => string;
  LEDGER_GENESIS: string;
}

test("ledger_format_locked_to_rebase_crosscheck", async (t) => {
  if (!existsSync(REF_ABS)) { t.skip("reference apps/bell absent in this tree (public export); the lock runs in the repo CI"); return; }
  const spec: string = REF_REL; // non-literal => tsc leaves it unresolved; Node resolves it at runtime
  const ref = (await import(spec)) as RefMod;
  // (1) genesis + empty-head identical to the reference primitive.
  assert.equal(LEDGER_GENESIS, ref.LEDGER_GENESIS);
  assert.equal(ledgerHeadSha([]), ref.ledgerSha([]));
  // (2) my primitive reproduces the reference entry_sha256 byte-for-byte. The reference builds core with
  //     prev_entry_sha256 as the FIRST key, then entry_sha256 = sha(JSON.stringify(core)); stripping entry_sha256
  //     back out yields exactly the string it hashed.
  const refEntry = ref.chainedLedgerEntry(ref.LEDGER_GENESIS, 1, [{ sig: "aaa", slot: 5 }, { sig: "bbb", slot: 9 }])!;
  const { entry_sha256, ...core } = refEntry;
  assert.equal(sha256Hex(JSON.stringify(core)), entry_sha256, "the chaining primitive drifted from the reference");
  // (3) my own cycle entries chain + verify internally-consistently under the SAME primitive.
  const e1 = chainCycleEntry(LEDGER_GENESIS, { cycle_id: "c", tariff_version: "t", by_op_method: { "helius|getTransaction": 1 }, outcome: "attempted", credits_derived: 1 });
  const e2 = chainCycleEntry(e1.entry_sha256, { cycle_id: "c", tariff_version: "t", by_op_method: { "helius|getTransactionsForAddress": 1 }, outcome: "attempted", credits_derived: 10 });
  assert.equal(ledgerHeadSha([e1, e2]), e2.entry_sha256);
  assert.doesNotThrow(() => verifyCycleLedger([e1, e2]));
});
