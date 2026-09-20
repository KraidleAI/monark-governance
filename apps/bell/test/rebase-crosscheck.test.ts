// MONARK Bell — L-1(dec)/L-2/L-3 full-mint CROSS-CHECK offline oracle (ADR-T1aii D1-quater, lot -b3d-a; checkpoint-1
// C-1/C-2/C-5/C-8/C-9/C-10, decision 67). NO network: the injected `call` returns hand-built gTfA `full` pages,
// getTransaction json bodies, and (never) getAccountInfo — the cross-check must not read live state (C-2). ALL
// fixtures are SYNTHETIC (signatures, slots, literals — checkpoint-1 C-16); no real on-chain record is copied here.
// Named mutants are demonstrated red in docs/G1 (source mutation + sha-exact cp restore, R-20 — never git checkout):
// M1 comparator hybrid⊆fullmint accepted; M2 key drops effTs; M3 budget swallowed; M4 comparator drops the slot bound;
// M5 decodeSetAuthority "no change"; M7 mint filter removed; M8 resume resets the budget; M9 crosscheck reads live
// state; M11 token-null accepted without anchors; M12 failed tx decoded; M13 SetAuthority CPI ignored; M14 fullmint⊆hybrid.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { decodeSetAuthority, setAuthorityHandoffsFromTx, scanFullMint, compareToHybrid, canonicalListSha,
  chainedLedgerEntry, ledgerSha, loadHybridSeries, readPriorCalls, SET_AUTHORITY_TAG, AUTHORITY_TYPE_SCALED_UI,
  type FullMintScan, type HybridSeries, type ScanSink } from "../src/rebase-crosscheck.ts";
import { scanMethodFromMethod } from "../src/rebase-produce.ts";
import { makeBudgetedCall, runMain } from "../src/collect.ts";
import { type DatabentoGet, type PolygonGet } from "../src/close.ts";
import { XSTOCKS } from "../src/pools.ts";
import { TOKEN_2022_PROGRAM } from "../src/rebase-scan.ts";
import { f64BitsHexLE, replayTriplet, type MultiplierEvent } from "../src/rebase-trajectory.ts";
import { BudgetExceededError, type JsonRpcCall, type TransportFault } from "../src/quorum.ts";

const PROVIDERS = ["https://mainnet.helius-rpc.com", "https://sol.core.chainstack.com"]; // operators helius, chainstack
const MINT = "MintZZ111111111111111111111111111111111111", OTHER = "OtherMint22222222222222222222222222222222";
const ORACLE_SLOT = 25;

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function b58enc(bytes: Uint8Array): string {
  let x = 0n; for (const b of bytes) x = x * 256n + BigInt(b);
  let s = ""; while (x > 0n) { s = B58[Number(x % 58n)] + s; x /= 58n; }
  for (const b of bytes) { if (b === 0) s = "1" + s; else break; }
  return s || "1";
}
const A_BYTES = new Uint8Array(32).fill(0xaa), B_BYTES = new Uint8Array(32).fill(0xbb);
const A_ADDR = b58enc(A_BYTES), B_ADDR = b58enc(B_BYTES);
const hexOf = (b: Uint8Array): string => [...b].map((n) => n.toString(16).padStart(2, "0")).join("");
// accountKeys layout [0]=mint [1]=current authority A [2]=Token-2022 [3]=OTHER mint [4]=new authority B.
const KEYS = [MINT, A_ADDR, TOKEN_2022_PROGRAM, OTHER, B_ADDR];

function initBytes(m: number): Uint8Array { const b = new Uint8Array(42); b[0] = 43; b[1] = 0; new DataView(b.buffer).setFloat64(34, m, true); return b; }
function updBytes(m: number, effTs: number): Uint8Array {
  const b = new Uint8Array(18); b[0] = 43; b[1] = 1; const dv = new DataView(b.buffer); dv.setFloat64(2, m, true); dv.setBigInt64(10, BigInt(effTs), true); return b;
}
/** SetAuthority(ScaledUiAmount) instruction data — [lu] tag 6, type 15, COption<Pubkey> (0=None len3 / 1=Some len35). */
function setAuthBytes(authType: number, newAuth: Uint8Array | null): Uint8Array {
  if (newAuth === null) return new Uint8Array([SET_AUTHORITY_TAG, authType, 0]);
  const b = new Uint8Array(35); b[0] = SET_AUTHORITY_TAG; b[1] = authType; b[2] = 1; b.set(newAuth.slice(0, 32), 3); return b;
}
/** A gTfA-`full` / getTransaction-json body carrying its own signature; accountKeys = KEYS. */
function jsonTx(sig: string, slot: number, blockTime: number | null, instrs: Array<{ accts: number[]; data: Uint8Array }>,
  inner: Array<{ accts: number[]; data: Uint8Array }> = [], err: unknown = null): unknown {
  const mk = (i: { accts: number[]; data: Uint8Array }) => ({ programIdIndex: 2, accounts: i.accts, data: b58enc(i.data) });
  return { slot, blockTime, transaction: { signatures: [sig], message: { accountKeys: KEYS, instructions: instrs.map(mk) } },
    meta: { err, innerInstructions: inner.length ? [{ index: 0, instructions: inner.map(mk) }] : [] } };
}
const ev = (kind: "initialize" | "update", m: number, effTs: number, slot: number, ix: number, sig: string): MultiplierEvent =>
  ({ kind, multiplier: String(m), multiplierBitsHex: f64BitsHexLE(m), effectiveTimestampSec: effTs, blockTimeSec: slot * 100, slot, instructionIndex: ix, signature: sig });
const noopSink: ScanSink = { onPage: () => {} };
const throwOnState = (method: string): void => { if (method === "getAccountInfo") throw new Error("C-2/M9: the cross-check must NEVER read live state (getAccountInfo)"); };

// The canonical trajectory the synthetic bodies decode to: init m=1 @slot10, update m=1.5 effTs=1500 @slot20 (effTs<bt
// => folds => multiplier 1.5). Final triplet {mult=1.5, new=1.5, effTs=1500}. Both events are <= ORACLE_SLOT (25).
const initTx = jsonTx("initSig", 10, 1000, [{ accts: [0, 1], data: initBytes(1) }]);
const updTx = jsonTx("updSig", 20, 2000, [{ accts: [0, 1], data: updBytes(1.5, 1500) }, { accts: [3, 1], data: updBytes(9.9, 0) }]); // MINT ix0; OTHER ix1 (M7 excluded)
const BODIES: Record<string, unknown> = { initSig: initTx, updSig: updTx };
const EXPECTED_EVENTS: MultiplierEvent[] = [ev("initialize", 1, 0, 10, 0, "initSig"), ev("update", 1.5, 1500, 20, 0, "updSig")];
const ORACLE_TRIPLET = { multiplierBitsHex: f64BitsHexLE(1.5), newMultiplierBitsHex: f64BitsHexLE(1.5), effectiveTimestampSec: 1500 };
const seriesOf = (events: readonly MultiplierEvent[]): HybridSeries => ({ symbol: "SPYx", oracle_slot: ORACLE_SLOT, oracle_triplet: ORACLE_TRIPLET, events });
// A committed series whose oracle_triplet is anchored to a REFERENCE full-mint's replay — so H5 (the C-3 gate) passes
// and the SET comparison is the discriminator (a divergence verdict is only meaningful when the full-mint is itself
// self-consistent with the committed oracle; a full-mint whose own replay differs is inconclusive:c3_mismatch, not divergence).
const seriesWith = (reference: readonly MultiplierEvent[], events: readonly MultiplierEvent[]): HybridSeries =>
  ({ symbol: "SPYx", oracle_slot: ORACLE_SLOT, oracle_triplet: replayTriplet(reference, Number.MAX_SAFE_INTEGER)!, events });

/** A stub over 2 asc gTfA pages + a desc end-anchor + op-B getTransaction re-reads. Throws on getAccountInfo (M9).
 *  Captures the asc `filters.slot` each call so a test can assert the bound. Honors filters.slot.gte (resume). */
function makeStub(ascPages: Array<{ data: unknown[]; paginationToken: string | null }>, bodies: Record<string, unknown>,
  descAnchorSig: string | null, seen: { slotFilters: Record<string, number>[] }): JsonRpcCall {
  let ai = 0;
  return (_url, method, params) => {
    throwOnState(method);
    if (method === "getTransactionsForAddress") {
      const p = (params as unknown[])[1] as { sortOrder: string; filters?: { slot?: Record<string, number> } };
      if (p.sortOrder === "desc") return Promise.resolve({ data: descAnchorSig ? [bodies[descAnchorSig]] : [], paginationToken: null });
      if (p.filters?.slot) seen.slotFilters.push(p.filters.slot);
      const gte = p.filters?.slot?.gte;
      const page = ascPages[ai++] ?? { data: [], paginationToken: null };
      const data = gte === undefined ? page.data : page.data.filter((b) => Number((b as { slot: number }).slot) >= gte);
      return Promise.resolve({ data, paginationToken: page.paginationToken });
    }
    if (method === "getTransaction") return Promise.resolve(bodies[String((params as unknown[])[0])]);
    throw new Error("unexpected " + method);
  };
}

// ---- L-1 (dec): decodeSetAuthority + hand-off detection (incl. CPI), source-cited [lu] ----------------------------
test("bell_setauthority_handoff_detected_from_bodies — a SetAuthority(ScaledUiAmount) A->B leg is decoded from a body", () => {
  // decodeSetAuthority: tag 6 (instruction.rs:774), type 15 (instruction.rs:1177), COption present=1 + 32 bytes.
  const d = decodeSetAuthority(setAuthBytes(AUTHORITY_TYPE_SCALED_UI, B_BYTES));
  assert.ok(d && d.authorityType === 15 && d.newAuthorityHex === hexOf(B_BYTES), "decoded type 15 + new authority B");
  assert.equal(decodeSetAuthority(setAuthBytes(AUTHORITY_TYPE_SCALED_UI, null))?.newAuthorityHex, null, "presence 0 => None (authority removed, definitive)");
  // A body carrying a SetAuthority(15) on MINT (accts [mint, A]) AND one on OTHER mint (excluded, M7) AND a wrong
  // authority_type (excluded). Only the MINT/type-15 leg is a hand-off; absence => [] (M5 unconditional-null reds).
  const tx = jsonTx("saSig", 12, 1200, [
    { accts: [0, 1], data: setAuthBytes(AUTHORITY_TYPE_SCALED_UI, B_BYTES) }, // MINT, ScaledUiAmount => detected
    { accts: [3, 1], data: setAuthBytes(AUTHORITY_TYPE_SCALED_UI, B_BYTES) }, // OTHER mint => filtered (M7)
    { accts: [0, 1], data: setAuthBytes(0, B_BYTES) },                        // MintTokens authority => wrong type, ignored
  ]);
  const hs = setAuthorityHandoffsFromTx("saSig", 12, 1200, tx, [MINT]);
  assert.equal(hs.length, 1, "exactly the MINT ScaledUiAmount hand-off (OTHER-mint + wrong-type excluded)");
  assert.equal(hs[0]!.newAuthorityHex, hexOf(B_BYTES), "new authority B");
  assert.equal(hs[0]!.currentAuthority, A_ADDR, "current authority A recorded (account index 1)");
  assert.deepEqual(setAuthorityHandoffsFromTx("noneSig", 12, 1200, jsonTx("noneSig", 12, 1200, [{ accts: [0, 1], data: updBytes(1.5, 0) }]), [MINT]), [], "no SetAuthority => no hand-off");
});

test("bell_setauthority_decodes_inner_cpi — a SetAuthority(ScaledUiAmount) emitted in an inner instruction (CPI) is caught (C-9)", () => {
  // The SetAuthority is NOT a top-level instruction: it rides in a CPI under top-level ix 0. §E: CPI is not forbidden
  // for this instruction => the scanner MUST walk inner instructions (M13: ignore innerInstructions => this reds).
  const tx = jsonTx("cpiSig", 14, 1400, [{ accts: [3, 1], data: updBytes(9.9, 0) }], [{ accts: [0, 1], data: setAuthBytes(AUTHORITY_TYPE_SCALED_UI, B_BYTES) }]);
  const hs = setAuthorityHandoffsFromTx("cpiSig", 14, 1400, tx, [MINT]);
  assert.equal(hs.length, 1, "the CPI SetAuthority is decoded (inner instruction walked)");
  assert.equal(hs[0]!.newAuthorityHex, hexOf(B_BYTES));
});

// ---- L-2: scanFullMint (pagination, bound, budget, completeness anchors, blockTime null, failed tx) ---------------
test("bell_fullmint_scan_paginates_and_bounds — gTfA `full` asc over 2 pages, bounded slot.lte, complete + N exact", async () => {
  const seen = { slotFilters: [] as Record<string, number>[] };
  const mkCall = (): JsonRpcCall => makeStub([{ data: [initTx], paginationToken: "p2" }, { data: [updTx], paginationToken: null }], BODIES, "updSig", seen);
  // The `requireFullPages` gate (default ON — real gTfA pages are 1000 txs; A-6: relaxed by the sonde outcome, not a
  // code change): with it ON these synthetic 1-tx pages are `not_full_pages`; OFF, they complete. The offline oracle
  // drives OFF (no 1000-tx synthetic pages); the flag is asserted here so it cannot silently disappear.
  assert.equal((await scanFullMint(mkCall(), PROVIDERS, MINT, ORACLE_SLOT, { maxPages: 10 }, {}, noopSink, [])).reason, "not_full_pages", "default requireFullPages flags a short intermediate page");
  const scan = await scanFullMint(mkCall(), PROVIDERS, MINT, ORACLE_SLOT, { maxPages: 10, requireFullPages: false }, {}, noopSink, []);
  assert.equal(scan.complete, true, scan.reason ?? "complete");
  assert.equal(scan.n, 2, "exact tx count (init + update) — sub-product at exhaustion");
  assert.equal(scan.pages, 2, "two asc pages traversed");
  assert.equal(scan.events.length, 2, "init + MINT update only (OTHER-mint 43/1 excluded, M7)");
  assert.equal(scan.events[0]!.kind, "initialize");
  assert.equal(scan.events[1]!.multiplierBitsHex, f64BitsHexLE(1.5));
  assert.ok(seen.slotFilters.every((f) => f.lte === ORACLE_SLOT), "every asc page carried filters.slot.lte = oracle_slot (the bound)");
  // ledger chained + N-exact anchored; getAccountInfo was never called (M9: throwOnState would have thrown).
  assert.equal(scan.ledger.length, 2, "one chained ledger entry per page");
  assert.equal(scan.ledger[1]!.prev_entry_sha256, scan.ledger[0]!.entry_sha256, "the ledger chains (entry N carries entry N-1's sha)");
});

test("bell_fullmint_budget_fail_closed — a BudgetExceededError caps the scan as incomplete, never presented complete (M3)", async () => {
  const seen = { slotFilters: [] as Record<string, number>[] };
  const inner = makeStub([{ data: [initTx], paginationToken: "p2" }, { data: [updTx], paginationToken: null }], BODIES, "updSig", seen);
  const budgeted = makeBudgetedCall(1, inner); // 1 call only => the first gTfA page consumes it, the 2nd throws
  const scan = await scanFullMint(budgeted.call, PROVIDERS, MINT, ORACLE_SLOT, { maxPages: 10 }, {}, noopSink, []);
  assert.equal(scan.complete, false, "budget-capped scan is NOT complete");
  assert.equal(scan.reason, "budget_exhausted", "the reason is budget_exhausted (M3: swallow+present-complete reds)");
});

test("bell_fullmint_budget_survives_resume — the budget is cumulative across resumes (C-1) + slot.gte dedupe (C-7 b)", async () => {
  // (A) makeBudgetedCall priorCalls offset is load-bearing (M8): a resume at prior=6, max=10 allows exactly 4 more.
  let hits = 0;
  const inner: JsonRpcCall = () => { hits += 1; return Promise.resolve({}); };
  const resumed = makeBudgetedCall(10, inner, 6); // prior cumulative 6
  for (let i = 0; i < 4; i++) await resumed.call("u", "m", []);
  await assert.rejects(resumed.call("u", "m", []), BudgetExceededError, "the 5th call (cumulative 11) fails closed");
  assert.equal(resumed.calls(), 10, "calls() returns the CUMULATIVE total (M8: ignore priorCalls => 4 here => reds)");
  assert.equal(hits, 4, "exactly 4 inner calls fired past the prior 6");
  // (B) scanFullMint resume: filters.slot.gte = slot_hi + the boundary tx already ingested is DROPPED once.
  const seen = { slotFilters: [] as Record<string, number>[] };
  const dupAtBoundary = jsonTx("initSig", 10, 1000, [{ accts: [0, 1], data: initBytes(1) }]); // same sig/slot as page-1 tail
  const call = makeStub([{ data: [dupAtBoundary, updTx], paginationToken: null }], BODIES, "updSig", seen);
  const scan = await scanFullMint(call, PROVIDERS, MINT, ORACLE_SLOT, { maxPages: 10 }, { resumeFromSlot: 10, tailSigsAtResumeSlot: ["initSig"] }, noopSink, []);
  assert.ok(seen.slotFilters.some((f) => f.gte === 10), "the resumed page carried filters.slot.gte = the last ledger slot_hi");
  assert.equal(scan.events.filter((e) => e.signature === "initSig").length, 0, "the already-ingested boundary tx is dropped exactly once (no double count)");
  assert.equal(scan.events.filter((e) => e.signature === "updSig").length, 1, "the new tx past the boundary is kept once");
});

test("bell_fullmint_completeness_requires_anchors — token-null with a broken end anchor is NOT complete (M11)", async () => {
  // Pagination ends (token null) but the desc end-anchor's newest sig != the asc run's last sig => the tail is not
  // proven reached => complete:false, reason end_anchor_mismatch (M11: accept token-null without anchors => reds).
  const seen = { slotFilters: [] as Record<string, number>[] };
  const call = makeStub([{ data: [initTx, updTx], paginationToken: null }], BODIES, "someOtherNewerSig", seen); // desc anchor != updSig
  const scan = await scanFullMint(call, PROVIDERS, MINT, ORACLE_SLOT, { maxPages: 10 }, {}, noopSink, []);
  assert.equal(scan.complete, false, "a bare token-null does not prove completeness");
  assert.equal(scan.reason, "end_anchor_mismatch", "the end anchor (desc newest sig == asc last sig) is required");
});

test("bell_fullmint_null_blocktime_is_inconclusive — a page tx with null blockTime is inconclusive, never a skip (C-8)", async () => {
  const seen = { slotFilters: [] as Record<string, number>[] };
  const nullBt = jsonTx("nullSig", 15, null, [{ accts: [0, 1], data: updBytes(1.2, 1400) }]);
  const call = makeStub([{ data: [initTx, nullBt, updTx], paginationToken: null }], { ...BODIES, nullSig: nullBt }, "updSig", seen);
  const scan = await scanFullMint(call, PROVIDERS, MINT, ORACLE_SLOT, { maxPages: 10 }, {}, noopSink, []);
  assert.equal(scan.complete, false, "a null-blockTime page is inconclusive");
  assert.equal(scan.reason, "block_time_null", "the reason is block_time_null (never silently skipped)");
});

test("bell_fullmint_skips_failed_tx — a failed tx (meta.err != null) is enumerated but NEVER decoded (C-9, M12)", async () => {
  const seen = { slotFilters: [] as Record<string, number>[] };
  const failedUpd = jsonTx("failSig", 18, 1800, [{ accts: [0, 1], data: updBytes(3.0, 1700) }], [], { InstructionError: [0, "Custom"] });
  const call = makeStub([{ data: [initTx, failedUpd, updTx], paginationToken: null }], { ...BODIES, failSig: failedUpd }, "updSig", seen);
  const scan = await scanFullMint(call, PROVIDERS, MINT, ORACLE_SLOT, { maxPages: 10 }, {}, noopSink, []);
  assert.equal(scan.n, 3, "the failed tx IS enumerated (in N/ledger)");
  assert.equal(scan.events.filter((e) => e.signature === "failSig").length, 0, "but its instruction is NOT decoded (M12: decode a failed tx => reds)");
  assert.equal(scan.events.length, 2, "only the two successful events");
});

// ---- L-3: compareToHybrid — three verdicts, symmetric divergence, committed-oracle H5, slot bound -----------------
test("bell_crosscheck_equal_removes_pending — full-mint set == committed series + H5 ok => equal (the sole pending-removal path)", async () => {
  const seen = { slotFilters: [] as Record<string, number>[] };
  const call = makeStub([{ data: [initTx], paginationToken: "p2" }, { data: [updTx], paginationToken: null }], BODIES, "updSig", seen);
  const scan = await scanFullMint(call, PROVIDERS, MINT, ORACLE_SLOT, { maxPages: 10, requireFullPages: false }, {}, noopSink, []);
  const verdict = compareToHybrid(scan, seriesOf(EXPECTED_EVENTS));
  assert.equal(verdict.verdict, "equal", "a matching complete scan with a valid H5 anchor is equal");
});

test("bell_crosscheck_divergence_keeps_pending — a full-mint event ABSENT from the series => divergence (C-10 sens a, M14)", () => {
  // The full-mint (self-consistent: its replay == the committed oracle) has the update; the series LACKS it => the
  // full-mint has an event absent from the series => divergence (missingFromSeries). Pending is kept.
  const scan: FullMintScan = { events: EXPECTED_EVENTS, handoffs: [], complete: true, n: 2, pages: 1, ledger: [] };
  const v = compareToHybrid(scan, seriesWith(EXPECTED_EVENTS, [EXPECTED_EVENTS[0]!]));
  assert.equal(v.verdict, "divergence");
  assert.ok(v.verdict === "divergence" && v.missingFromSeries.length === 1, "the full-mint update is flagged missing-from-series (M14: hybrid⊆fullmint accepted => reds)");
  // M2: an appariated event differing ONLY on effectiveTimestampSec is a divergence (the key carries effTs).
  const effDiff = compareToHybrid(scan, seriesWith(EXPECTED_EVENTS, [EXPECTED_EVENTS[0]!, ev("update", 1.5, 1501, 20, 0, "updSig")]));
  assert.equal(effDiff.verdict, "divergence", "a sole-effTs difference diverges (M2: key drops effTs => reds)");
});

test("bell_crosscheck_series_event_absent_is_divergence — a SERIES event absent from the full-mint => divergence (C-10 sens b, M1)", () => {
  // The full-mint (self-consistent with its own committed oracle) has ONLY the init; the series carries an EXTRA
  // update => a series event absent from the full-mint => divergence (missingFromFullmint). H5 passes (oracle anchored
  // to the full-mint's own replay), so this is a genuine SET divergence, not a c3_mismatch.
  const scan: FullMintScan = { events: [EXPECTED_EVENTS[0]!], handoffs: [], complete: true, n: 1, pages: 1, ledger: [] };
  const v = compareToHybrid(scan, seriesWith([EXPECTED_EVENTS[0]!], EXPECTED_EVENTS));
  assert.equal(v.verdict, "divergence");
  assert.ok(v.verdict === "divergence" && v.missingFromFullmint.length === 1, "the series update is flagged missing-from-fullmint (M1: fullmint⊆hybrid accepted => reds)");
});

test("bell_crosscheck_incomplete_keeps_pending — an incomplete scan OR an H5 mismatch => inconclusive, never equal", () => {
  const scan: FullMintScan = { events: EXPECTED_EVENTS, handoffs: [], complete: false, reason: "not_at_genesis", n: 2, pages: 1, ledger: [] };
  const v = compareToHybrid(scan, seriesOf(EXPECTED_EVENTS));
  assert.ok(v.verdict === "inconclusive" && v.reason === "not_at_genesis", "an incomplete scan carries its stop reason");
  // H5 gate (C-2): a COMPLETE full-mint whose own replay != the committed oracle_triplet => inconclusive:c3_mismatch
  // (never divergence): the committed triplet is the anchor, so this is decided WITHOUT the live state.
  const wrongOracle: HybridSeries = { symbol: "SPYx", oracle_slot: ORACLE_SLOT, oracle_triplet: { multiplierBitsHex: f64BitsHexLE(2.0), newMultiplierBitsHex: f64BitsHexLE(2.0), effectiveTimestampSec: 1500 }, events: EXPECTED_EVENTS };
  const c3 = compareToHybrid({ events: EXPECTED_EVENTS, handoffs: [], complete: true, n: 2, pages: 1, ledger: [] }, wrongOracle);
  assert.ok(c3.verdict === "inconclusive" && c3.reason === "c3_mismatch", "a full-mint replay != committed oracle is inconclusive:c3_mismatch");
});

test("bell_crosscheck_ignores_events_after_oracle_slot — an event past oracle_slot is bounded out (no false divergence/c3, C-2/M4)", () => {
  // The full-mint carries an UpdateMultiplier at slot 40 > oracle_slot 25 (a legitimate post-window update). The
  // comparator MUST re-bound to slot <= oracle_slot: the extra event neither diverges nor breaks H5 (M4: drop the
  // bound => the slot-40 event is missing-from-series => false divergence => reds). compareToHybrid is PURE (no
  // `call`), so it STRUCTURALLY cannot pin live state (M9 by construction; the scan path proves no getAccountInfo via throwOnState).
  const withFuture = [...EXPECTED_EVENTS, ev("update", 2.0, 4000, 40, 0, "futureSig")];
  const v = compareToHybrid({ events: withFuture, handoffs: [], complete: true, n: 3, pages: 1, ledger: [] }, seriesOf(EXPECTED_EVENTS));
  assert.equal(v.verdict, "equal", "the post-oracle_slot event is ignored; H5 anchors on the COMMITTED triplet {1.5,1.5,1500}");
});

// ---- L-4 coupling + C-5 ledger + committed-artifact replay -------------------------------------------------------
test("bell_series_method_maps_to_authority — the ratified method string maps to the closed scanMethod enum (C-13)", () => {
  // The RATIFIED label (pending removed) and the PENDING label BOTH map to "authority" (coexist, no re-pin); an
  // unmapped method has no scanMethod. Never a substring test — an exact closed-map lookup.
  assert.equal(scanMethodFromMethod("hybrid-authority-scan"), "authority", "the ratified series method maps to authority");
  assert.equal(scanMethodFromMethod("hybrid-authority-scan (pending R-26 ratification)"), "authority", "the pending label still maps (kept until 4/4 equal)");
  assert.equal(scanMethodFromMethod("some-other-method"), undefined, "an unmapped method has no scanMethod (fail-closed)");
});

test("bell_crosscheck_ledger_is_chained_and_rederivable — the page ledger chains + canonical list sha is stable (C-5)", () => {
  const p1 = chainedLedgerEntry("0".repeat(64), 1, [{ sig: "b", slot: 10 }, { sig: "a", slot: 10 }])!;
  const p2 = chainedLedgerEntry(p1.entry_sha256, 2, [{ sig: "c", slot: 20 }])!;
  assert.equal(p2.prev_entry_sha256, p1.entry_sha256, "entry N carries entry N-1's sha (chained)");
  assert.deepEqual([...p1.tail_sigs_at_slot_hi], ["a", "b"], "tail sigs at slot_hi are recorded (resume dedupe, sorted)");
  // canonical list sha is order-independent of input (rows sorted by (slot, sig)) => re-derivable by an auditor.
  assert.equal(canonicalListSha([{ sig: "a", slot: 10 }, { sig: "b", slot: 10 }]), canonicalListSha([{ sig: "b", slot: 10 }, { sig: "a", slot: 10 }]), "canonical sha is input-order-independent");
  assert.equal(ledgerSha([p1, p2]), p2.entry_sha256, "the ledger head sha is the last entry's chained sha");
});

test("bell_crosscheck_committed_artifacts_replay — replay compareToHybrid on committed files reproduces the verdict + biconditional (C-5/CA-11)", () => {
  // CA-11 durci: EXECUTE the composition from the input FILES (crosscheck-<MINT>.json + rebase-<MINT>.json), never a
  // regex on source. Two synthetic mints: SPYx equal + method WITHOUT pending; NVDAx divergence + method WITH pending.
  // Biconditional asserted per mint: `method` lacks "(pending" <=> the committed verdict is equal. Until the real
  // race commits crosscheck-*.json under series/rebase/, this runs on a mkdtemp set (declared, checkpoint-1 C-16).
  const dir = mkdtempSync(join(tmpdir(), "bell-crosscheck-"));
  const writeMint = (sym: string, method: string, seriesEvents: MultiplierEvent[], scanEvents: MultiplierEvent[]): void => {
    const oracleTriplet = replayTriplet(scanEvents, Number.MAX_SAFE_INTEGER)!; // anchored to the reference full-mint replay (H5 passes)
    writeFileSync(join(dir, `rebase-${sym}.json`), JSON.stringify({ symbol: sym, method, oracle_slot: ORACLE_SLOT, oracle_triplet: oracleTriplet, events: seriesEvents }));
    const verdict = compareToHybrid({ events: scanEvents, handoffs: [], complete: true, n: scanEvents.length, pages: 1, ledger: [] }, { symbol: sym, oracle_slot: ORACLE_SLOT, oracle_triplet: oracleTriplet, events: seriesEvents });
    writeFileSync(join(dir, `crosscheck-${sym}.json`), JSON.stringify({ oracle_slot: ORACLE_SLOT, scan_complete: true, scan_reason: null, events: scanEvents, c3_oracle_triplet: oracleTriplet, comparator_verdict: verdict }));
  };
  writeMint("SPYx", "hybrid-authority-scan", EXPECTED_EVENTS, EXPECTED_EVENTS); // equal (sets match, H5 ok)
  writeMint("NVDAx", "hybrid-authority-scan (pending R-26 ratification)", [...EXPECTED_EVENTS, ev("update", 1.6, 1600, 22, 0, "extraSig")], EXPECTED_EVENTS); // divergence (series has an extra event)
  for (const sym of ["SPYx", "NVDAx"]) {
    const series = loadHybridSeries(dir, sym)!;
    const artifact = JSON.parse(readFileSync(join(dir, `crosscheck-${sym}.json`), "utf8")) as { events: MultiplierEvent[]; scan_complete: boolean; scan_reason: string | null; comparator_verdict: { verdict: string } };
    // Faithful replay: reconstruct the scan's completeness from the committed fields (a real inconclusive mint replays as inconclusive).
    const replayed = compareToHybrid({ events: artifact.events, handoffs: [], complete: artifact.scan_complete, ...(artifact.scan_reason ? { reason: artifact.scan_reason } : {}), n: artifact.events.length, pages: 1, ledger: [] }, series);
    assert.equal(replayed.verdict, artifact.comparator_verdict.verdict, `${sym}: replayed verdict == committed verdict`);
    assert.equal(!series.method.includes("(pending"), replayed.verdict === "equal", `${sym}: method-without-pending <=> verdict equal (biconditional)`);
  }
});

test("bell_crosscheck_runmain_resumes_budget_and_ledger — runMain --rebase-crosscheck: cumulative budget + LOSSLESS resume (C-1/C-7 b, CA-11)", async () => {
  // CA-11 durci through the REAL CLI (runMain): a budget stop in run 1, then a resume in run 2 that must (a) OFFSET
  // the budget by run-1's persisted calls_used (mutant priorCalls=0 reds), (b) chain run-2's ledger page onto run-1's
  // (mutant genesis-reseed reds), and (c) carry run-1's Initialize so the resumed scan COMPLETES (mutant unseeded
  // events => start anchor fails => inconclusive reds). Bodies use the real SPYx mint address (runMain resolves it).
  const SPYX = XSTOCKS.find((t) => t.symbol === "SPYx")!;
  const K2 = [SPYX.address, A_ADDR, TOKEN_2022_PROGRAM, OTHER, B_ADDR];
  const jtx = (sig: string, slot: number, bt: number, data: Uint8Array): unknown =>
    ({ slot, blockTime: bt, transaction: { signatures: [sig], message: { accountKeys: K2, instructions: [{ programIdIndex: 2, accounts: [0, 1], data: b58enc(data) }] } }, meta: { err: null, innerInstructions: [] } });
  const cinit = jtx("initSig", 10, 1000, initBytes(1)), cupd = jtx("updSig", 20, 2000, updBytes(1.5, 1500));
  const bodies: Record<string, unknown> = { initSig: cinit, updSig: cupd };
  const evInit = ev("initialize", 1, 0, 10, 0, "initSig"), evUpd = ev("update", 1.5, 1500, 20, 0, "updSig");
  const oracleTriplet = replayTriplet([evInit, evUpd], Number.MAX_SAFE_INTEGER)!;
  const seriesDir = mkdtempSync(join(tmpdir(), "bell-cc-series-")), outDir = mkdtempSync(join(tmpdir(), "bell-cc-out-"));
  writeFileSync(join(seriesDir, "rebase-SPYx.json"), JSON.stringify({ symbol: "SPYx", method: "hybrid-authority-scan", oracle_slot: 25, oracle_triplet: oracleTriplet, events: [evInit, evUpd] }));
  const compStub = (ascPages: Array<{ data: unknown[]; paginationToken: string | null }>): JsonRpcCall => {
    let ai = 0;
    return (_u, method, params) => {
      throwOnState(method);
      if (method === "getTransactionsForAddress") {
        const p = (params as unknown[])[1] as { sortOrder: string; filters?: { slot?: { gte?: number } } };
        if (p.sortOrder === "desc") return Promise.resolve({ data: [bodies.updSig], paginationToken: null });
        const gte = p.filters?.slot?.gte, page = ascPages[ai++] ?? { data: [], paginationToken: null };
        return Promise.resolve({ data: gte === undefined ? page.data : page.data.filter((b) => Number((b as { slot: number }).slot) >= gte), paginationToken: page.paginationToken });
      }
      if (method === "getTransaction") return Promise.resolve(bodies[String((params as unknown[])[0])]);
      throw new Error("unexpected " + method);
    };
  };
  const noDb: DatabentoGet = () => Promise.resolve([]);
  const noPoly: PolygonGet = () => Promise.resolve({ results: [] });
  const env = { BELL_SOLANA_RPC: PROVIDERS.join(",") } as NodeJS.ProcessEnv;
  const args = (maxCalls: string): string[] => ["--rebase-crosscheck", "--pools", "SPYx", "--max-calls", maxCalls, "--min-interval", "0", "--allow-short-pages", "--series-dir", seriesDir, "--out", outDir];
  const readJson = (f: string): Record<string, unknown> => JSON.parse(readFileSync(join(outDir, f), "utf8")) as Record<string, unknown>;

  // RUN 1: --max-calls 3 => p1 gTfA + initSig opB + p2 gTfA = 3; updSig opB is the 4th => BudgetExceeded => budget_exhausted.
  await runMain(args("3"), { call: compStub([{ data: [cinit], paginationToken: "p2" }, { data: [cupd], paginationToken: null }]), databentoGet: noDb, polygonGet: noPoly, env, nowMs: 25000 });
  assert.equal(readJson("budget.json").calls_used, 3, "run-1 persisted its cumulative calls_used");
  assert.equal((readJson("crosscheck-SPYx.json").comparator_verdict as { verdict: string }).verdict, "inconclusive", "run-1 stopped on budget => inconclusive (pending kept)");
  const ledger1 = readFileSync(join(outDir, "ledger-SPYx.jsonl"), "utf8").trim().split("\n");
  assert.equal(ledger1.length, 1, "run-1 persisted exactly one ledger page");

  // RUN 2: --max-calls 10, SAME --out => resume. Fresh stub, one asc page [init(deduped), upd], desc anchor = updSig.
  await runMain(args("10"), { call: compStub([{ data: [cinit, cupd], paginationToken: null }]), databentoGet: noDb, polygonGet: noPoly, env, nowMs: 25000 });
  assert.equal(readJson("budget.json").calls_used, 6, "run-2 budget is CUMULATIVE (3 prior + gTfA + opB + desc anchor); mutant priorCalls=0 => reds");
  const ledger2 = readFileSync(join(outDir, "ledger-SPYx.jsonl"), "utf8").trim().split("\n");
  assert.equal(ledger2.length, 2, "run-2 APPENDED one page onto run-1 (ONE chain, not a second genesis chain)");
  const l1 = JSON.parse(ledger2[0]!) as { entry_sha256: string }, l2 = JSON.parse(ledger2[1]!) as { prev_entry_sha256: string };
  assert.equal(l2.prev_entry_sha256, l1.entry_sha256, "run-2's page chains onto run-1's head (continuity; mutant genesis-reseed => reds)");
  assert.equal((readJson("crosscheck-SPYx.json").comparator_verdict as { verdict: string }).verdict, "equal", "the resumed scan carries run-1's Initialize => complete => equal (mutant unseeded events => inconclusive => reds)");
});

test("bell_crosscheck_readPriorCalls_fail_closed — missing budget.json => 0, malformed => throw (C-1)", () => {
  const dir = mkdtempSync(join(tmpdir(), "bell-budget-"));
  assert.equal(readPriorCalls(dir), 0, "a fresh run (no budget.json) reads prior 0");
  writeFileSync(join(dir, "budget.json"), JSON.stringify({ calls_used: 123 }));
  assert.equal(readPriorCalls(dir), 123, "a persisted calls_used is read back");
  writeFileSync(join(dir, "budget.json"), JSON.stringify({ calls_used: "oops" }));
  assert.throws(() => readPriorCalls(dir), /malformed/, "a corrupt ledger is a fail-closed throw, never read as 0");
  void ([] as TransportFault[]); // faults threading is exercised by the scan tests
});
