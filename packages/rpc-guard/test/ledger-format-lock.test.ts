import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { openGuardedClient, runCli, type Outcome, type Snapshot } from "@monark/rpc-guard";
import { sha256Hex, ledgerHeadSha, chainCycleEntry, verifyCycleLedger, LEDGER_GENESIS, LEDGER_FORMAT, type CycleLedgerEntry } from "../src/ledger.ts";
import { FAKE_HELIUS_ENV, HELIUS, tmp } from "./harness.ts";

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
// ADR-RPC-GUARD-RECONCILE-1 D-1 (format v2, lot 1a): the CLOSED outcome set and the core key order PER LINE KIND, asserted BEFORE
// the skip below (no Bell reference needed: the public mirror runs them too). A new Outcome member fails `typecheck` HERE (V2 must
// list exactly the union); a new core field reds the key lists; either one is a format v3.
const V2 = ["attempted", "refused", "reconciled", "unlocked", "settled", "course_reconciled"] as const satisfies readonly Outcome[];
const V2_CLOSED: [Exclude<Outcome, (typeof V2)[number]>] extends [never] ? true : false = true;
const CORE = ["prev_entry_sha256", "cycle_id", "tariff_version", "by_op_method", "outcome", "credits_derived"];
// A v1 `unlocked` line (the kind a course id names), its sha computed OUTSIDE this package (hand-written JSON, node:crypto) and
// equal to the pre-v2 primitive's output: a v1 kind stays byte-identical in v2.
const GOLDEN_V1_UNLOCKED = `{"prev_entry_sha256":"${"0".repeat(64)}","cycle_id":"c","tariff_version":"helius-2026-09-21","by_op_method":{"helius|unlock":1},"outcome":"unlocked","credits_derived":0,"reason":"course end","entry_sha256":"2691d78480d54f8f599130ca13d9c9cf9575e0939becc4273d3c68d412e13677"}`;

// RPC-GUARD-RECONCILE-1 (D-1 versioning, D-2): FORMAT v2 = v1 + the `settled` issue (and `course_reconciled`, lot 1a). The CLOSED issue set is a Record<Outcome, true>
// (a new issue fails the typecheck gate until this lock moves to v3); a v1 line stays byte-identical (GOLDEN_V1_ATTEMPTED: its entry_sha256
// was computed by sha256sum over the literal core, never by this code).
const V2_ISSUES: Record<Outcome, true> = { attempted: true, refused: true, reconciled: true, unlocked: true, settled: true, course_reconciled: true };
const GOLDEN_V1_ATTEMPTED = '{"prev_entry_sha256":"0000000000000000000000000000000000000000000000000000000000000000","cycle_id":"c","tariff_version":"helius-2026-09-21","by_op_method":{"helius|getTransaction":1},"outcome":"attempted","credits_derived":1,"entry_sha256":"716c1b1f01e4d936574e89c52aead0516df467acde1eea411c8b9466fd0b7ba9"}';

test("ledger_format_locked_to_rebase_crosscheck", async (t) => {
  // (0) the v2 lock, BEFORE the skip (it needs no Bell reference).
  assert.equal(LEDGER_FORMAT, 2);
  assert.deepEqual(Object.keys(V2_ISSUES).sort(), ["attempted", "course_reconciled", "reconciled", "refused", "settled", "unlocked"], "the closed v2 issue set drifted: a new issue => v3");
  assert.equal(JSON.stringify(chainCycleEntry(LEDGER_GENESIS, { cycle_id: "c", tariff_version: "helius-2026-09-21", by_op_method: { "helius|getTransaction": 1 }, outcome: "attempted", credits_derived: 1 })), GOLDEN_V1_ATTEMPTED, "a v1 line is byte-identical under v2");
  verifyCycleLedger([JSON.parse(GOLDEN_V1_ATTEMPTED) as CycleLedgerEntry]);
  // (0 bis, lot 1a) v2: the constant, the closed set, and the key order of every line kind WRITTEN by the served paths (openGuardedClient,
  //     runCli unlock and reconcile): `course` after credits_derived (and network) and before reason (M-R9).
  assert.deepEqual([LEDGER_FORMAT, V2_CLOSED], [2, true]);
  const { dir, cleanup } = tmp();
  try {
    const realFetch = globalThis.fetch;
    // I-3 (merge of 1a and 1b): a gTFA page at limit 1000 rendering no body writes a SERVED `settled` line (reserved 100, billed 10).
    globalThis.fetch = (): Promise<Response> => Promise.resolve(new Response(JSON.stringify({ result: { data: [] } }), { status: 200, headers: { "content-type": "application/json" } }));
    try {
      const c = openGuardedClient(FAKE_HELIUS_ENV, { maxCalls: 2, runCaps: { helius: 1000 }, methodCaps: { getTransaction: 5, getTransactionsForAddress: 5 }, cycleFloor: { helius: 0 } }, dir, { helius: "v2" });
      await c.call(HELIUS, "getTransaction", [1]);
      await c.call(HELIUS, "getTransactionsForAddress", ["a", { limit: 1000 }]);
      await assert.rejects(c.call(HELIUS, "getTransaction", [2]), /run_calls/);
    } finally { globalThis.fetch = realFetch; }
    const deps = { ledgerDir: dir, floor: 0, readSnapshot: (p: string): Snapshot => ({ cycle: "v2", byMethod: { getTransaction: p === "b" ? 0 : 2 } }) };
    const to = runCli(["unlock", "--cycle", "v2", "--op", "helius", "--reason", "v2"], deps).unlocked ?? "";
    for (const extra of [["--course-end", to], []]) runCli(["reconcile", "--cycle", "v2", "--op", "helius", "--before", "b", "--after", "a", ...extra], deps); // NO-GO hard: both lines carry a reason
    const lines = readFileSync(join(dir, "v2", "helius.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l) as Record<string, unknown>);
    assert.deepEqual(new Set(lines.map((l) => l.outcome)), new Set(V2), "the served paths write exactly the closed v2 set");
    const R = [...CORE, "reason", "entry_sha256"], A = [...CORE, "entry_sha256"];
    assert.deepEqual(lines.map((l) => [l.outcome, Object.keys(l)]), [["attempted", A], ["attempted", A], ["settled", R], ["refused", R], ["unlocked", R], ["course_reconciled", [...CORE, "course", "reason", "entry_sha256"]], ["reconciled", R]]);
    assert.deepEqual(Object.keys(lines[5]!.course as object), ["from", "to"]);
  } finally { cleanup(); }
  assert.equal(JSON.stringify(chainCycleEntry(LEDGER_GENESIS, { cycle_id: "c", tariff_version: "helius-2026-09-21", by_op_method: { "helius|unlock": 1 }, outcome: "unlocked", credits_derived: 0, reason: "course end" })), GOLDEN_V1_UNLOCKED);
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
