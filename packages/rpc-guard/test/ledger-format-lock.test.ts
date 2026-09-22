import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sha256Hex, ledgerHeadSha, chainCycleEntry, verifyCycleLedger, LEDGER_GENESIS } from "../src/ledger.ts";

// LOCK the cycle-ledger chaining primitive to the reference it is a calque of (plan sect.3.2: "redeclare
// byte-identical with a lock test"). The reference apps/bell/src/rebase-crosscheck.ts lives in the REPO but is NOT
// in the public export (apps/bell is off-whitelist), so we (a) resolve it with a NON-LITERAL dynamic import (tsc
// does not statically resolve it - the exported typecheck stays green) and (b) SKIP when it is absent (the lock
// runs in the repo CI, where drift on either side reds). A TEST importing the reference is invisible to
// deps-hygiene (which scans src/ for @monark/*).
//
// GARDE-HELIUS-1b-0 (L-1 / C-4): the reference chainedLedgerEntry has ARITY 5 - (prev, page, txs, page_events,
// page_handoffs) - and `payload_sha256` (the 10th core field) = sha(JSON.stringify({page_events, page_handoffs})).
// The pre-1b test typed it arity 3 and called it with 3 args, so page_events/page_handoffs were undefined,
// payload_sha256 collapsed to sha(JSON.stringify({})) = sha('{}'), and its "10th key = payload_sha256" assertion held
// BY CONSTRUCTION for a 3-arg entry, a 5-arg entry AND a payload-dropped 9-field entry alike - it locked NOTHING
// (measured, checkpoint-1). This version calls with a SYNTHETIC NON-EMPTY payload, asserts the CLOSED 10-key core in
// write order (kills the "payload dropped => 9 fields" mutant), and RECOMPUTES payload_sha256 from the actual
// events/handoffs (kills the "arity 3 => payload = sha('{}')" mutant).
const REF_REL = "../../../apps/bell/src/rebase-crosscheck.ts";
const REF_ABS = fileURLToPath(new URL(REF_REL, import.meta.url));

interface RefMod {
  chainedLedgerEntry: (
    prev: string, page: number,
    txs: ReadonlyArray<{ sig: string; slot: number }>,
    pageEvents: ReadonlyArray<Record<string, unknown>>,
    pageHandoffs: ReadonlyArray<Record<string, unknown>>,
  ) => (Record<string, unknown> & { entry_sha256: string }) | null;
  ledgerSha: (e: readonly unknown[]) => string;
  LEDGER_GENESIS: string;
}

// The CLOSED list of the 10 core fields in WRITE ORDER (rebase-crosscheck.ts:165-166): prev_entry_sha256 first,
// payload_sha256 the tenth; entry_sha256 (the entry's 11th key) is stripped back out before hashing.
const CORE_KEYS_10 = [
  "prev_entry_sha256", "page", "slot_lo", "slot_hi", "first_sig", "last_sig",
  "tx_count", "tail_sigs_at_slot_hi", "list_sha256", "payload_sha256",
] as const;

test("ledger_format_locked_to_rebase_crosscheck", async (t) => {
  if (!existsSync(REF_ABS)) { t.skip("reference apps/bell absent in this tree (public export); the lock runs in the repo CI"); return; }
  const spec: string = REF_REL; // non-literal => tsc leaves it unresolved; Node resolves it at runtime
  const ref = (await import(spec)) as RefMod;
  // (1) genesis + empty-head identical to the reference primitive.
  assert.equal(LEDGER_GENESIS, ref.LEDGER_GENESIS);
  assert.equal(ledgerHeadSha([]), ref.ledgerSha([]));
  // (2) L-1 [C-4]: call the reference at ARITY 5 with a SYNTHETIC NON-EMPTY payload (one event + one handoff - plain
  //     data, never a raw record; only their JSON.stringify feeds payloadSha).
  const txs = [{ sig: "aaa", slot: 5 }, { sig: "bbb", slot: 9 }];
  const ev = [{ kind: "multiplier", mint: "MINT1", newMultiplier: "2", slot: 5 }];
  const ho = [{ kind: "setAuthority", mint: "MINT1", newAuthority: "AUTH1", slot: 9 }];
  const refEntry = ref.chainedLedgerEntry(ref.LEDGER_GENESIS, 1, txs, ev, ho)!;
  const { entry_sha256, ...core } = refEntry;
  // (i) the CLOSED list of the 10 core keys in write order (mutant "payload dropped => 9 fields" reds: only 9 keys).
  assert.deepEqual(Object.keys(core), [...CORE_KEYS_10], "the reference core drifted from the closed 10-field write order (payload_sha256 must be the 10th)");
  // (ii) payload_sha256 RECOMPUTED from the actual events/handoffs (mutant "arity 3 => payload = sha('{}')" reds).
  assert.equal(core.payload_sha256, sha256Hex(JSON.stringify({ page_events: ev, page_handoffs: ho })), "payload_sha256 is not sha256({page_events, page_handoffs}) - the payload commitment drifted (or the entry was built at arity 3)");
  assert.notEqual(core.payload_sha256, sha256Hex(JSON.stringify({})), "a non-empty payload can never hash to sha('{}') - this pins the arity-3 vacuity the pre-1b test missed");
  // (iii) entry_sha256 RECOMPUTED as sha(JSON.stringify(core)) byte-for-byte (my primitive reproduces the reference).
  assert.equal(sha256Hex(JSON.stringify(core)), entry_sha256, "the chaining primitive drifted from the reference (entry_sha256 != sha(JSON.stringify(core)))");
  // (3) my own cycle entries chain + verify internally-consistently under the SAME primitive.
  const e1 = chainCycleEntry(LEDGER_GENESIS, { cycle_id: "c", tariff_version: "t", by_op_method: { "helius|getTransaction": 1 }, outcome: "attempted", credits_derived: 1 });
  const e2 = chainCycleEntry(e1.entry_sha256, { cycle_id: "c", tariff_version: "t", by_op_method: { "helius|getTransactionsForAddress": 1 }, outcome: "attempted", credits_derived: 10 });
  assert.equal(ledgerHeadSha([e1, e2]), e2.entry_sha256);
  assert.doesNotThrow(() => verifyCycleLedger([e1, e2]));
});
