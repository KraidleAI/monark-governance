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
import { readFileSync, writeFileSync, appendFileSync, copyFileSync, existsSync, mkdtempSync, openSync, closeSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { decodeSetAuthority, setAuthorityHandoffsFromTx, scanFullMint, compareToHybrid, canonicalListSha,
  chainedLedgerEntry, ledgerSha, verifyLedgerChain, loadHybridSeries, readPriorCalls, runRebaseCrosscheckCli,
  runDensityProbeCli, projectPagesAtFraction, DENSITY_POINTS,
  SET_AUTHORITY_TAG, AUTHORITY_TYPE_SCALED_UI, GTFA_PAGE_LIMIT, DURABLE_FS,
  type FullMintScan, type HybridSeries, type ScanSink, type LedgerRecord, type RetryFn } from "../src/rebase-crosscheck.ts";
import { scanMethodFromMethod } from "../src/rebase-produce.ts";
import { makeBudgetedCall, parseArgs, runMain } from "../src/collect.ts";
import { type DatabentoGet, type PolygonGet } from "../src/close.ts";
import { XSTOCKS } from "../src/pools.ts";
import { TOKEN_2022_PROGRAM } from "../src/rebase-scan.ts";
import { f64BitsHexLE, replayTriplet, type MultiplierEvent } from "../src/rebase-trajectory.ts";
import { BudgetExceededError, withRetry, type JsonRpcCall, type TransportFault } from "../src/quorum.ts";

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
// A body carrying its own signature on the REAL SPYx mint accountKeys (K2) — shared by the runMain crosscheck tests
// (resume + per-page-budget crash). accountKeys [0]=SPYx mint [1]=authority A [2]=Token-2022 [3]=OTHER [4]=new auth B.
const SPYX = XSTOCKS.find((t) => t.symbol === "SPYx")!;
const K2 = [SPYX.address, A_ADDR, TOKEN_2022_PROGRAM, OTHER, B_ADDR];
const jtx = (sig: string, slot: number, bt: number, data: Uint8Array): unknown =>
  ({ slot, blockTime: bt, transaction: { signatures: [sig], message: { accountKeys: K2, instructions: [{ programIdIndex: 2, accounts: [0, 1], data: b58enc(data) }] } }, meta: { err: null, innerInstructions: [] } });

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
  // C-G2-5 (N3): a presence byte NOT in {0,1} is Err (pod_instruction.rs:130) => null, even when 35 bytes long.
  const pres2 = new Uint8Array(35); pres2[0] = SET_AUTHORITY_TAG; pres2[1] = AUTHORITY_TYPE_SCALED_UI; pres2[2] = 2;
  assert.equal(decodeSetAuthority(pres2), null, "presence 2 => null (mutant presence>=1 accepted => reds)");
  // C-G2-6 (N4): COption Some is EXACTLY presence+32 = 35 bytes; a 36-byte body is not decodable => null.
  const some36 = new Uint8Array(36); some36[0] = SET_AUTHORITY_TAG; some36[1] = AUTHORITY_TYPE_SCALED_UI; some36[2] = 1;
  assert.equal(decodeSetAuthority(some36), null, "Some length 36 => null (mutant length>=35 accepted => reds)");
  // C-G2-4 (N2): a SetAuthority(15)-on-MINT instruction under a NON-Token-2022 program is NOT a hand-off (pid filter).
  const nonT22 = { slot: 12, blockTime: 1200, transaction: { signatures: ["ntSig"], message: { accountKeys: KEYS, instructions: [{ programIdIndex: 0, accounts: [0, 1], data: b58enc(setAuthBytes(AUTHORITY_TYPE_SCALED_UI, B_BYTES)) }] } }, meta: { err: null, innerInstructions: [] } };
  assert.deepEqual(setAuthorityHandoffsFromTx("ntSig", 12, 1200, nonT22, [MINT]), [], "a non-Token-2022 program is filtered (mutant pid===Token-2022 => true => reds)");
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
  // C-G2-2: sets are key-equal (both EXPECTED_EVENTS) but the replay != committed oracle => the DISTINCT sub-case B reason.
  assert.ok(c3.verdict === "inconclusive" && c3.reason === "c3_mismatch_sets_equal", "a key-equal full-mint whose replay != committed oracle is inconclusive:c3_mismatch_sets_equal");
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
  const p1 = chainedLedgerEntry("0".repeat(64), 1, [{ sig: "b", slot: 10 }, { sig: "a", slot: 10 }], [], [])!;
  const p2 = chainedLedgerEntry(p1.entry_sha256, 2, [{ sig: "c", slot: 20 }], [], [])!;
  assert.equal(p2.prev_entry_sha256, p1.entry_sha256, "entry N carries entry N-1's sha (chained)");
  assert.deepEqual([...p1.tail_sigs_at_slot_hi], ["a", "b"], "tail sigs at slot_hi are recorded (resume dedupe, sorted)");
  // canonical list sha is order-independent of input (rows sorted by (slot, sig)) => re-derivable by an auditor.
  assert.equal(canonicalListSha([{ sig: "a", slot: 10 }, { sig: "b", slot: 10 }]), canonicalListSha([{ sig: "b", slot: 10 }, { sig: "a", slot: 10 }]), "canonical sha is input-order-independent");
  assert.equal(ledgerSha([p1, p2]), p2.entry_sha256, "the ledger head sha is the last entry's chained sha");
});

test("bell_crosscheck_committed_artifacts_replay — replay compareToHybrid on crosscheck-*.json WRITTEN by runMain reproduces the verdict + biconditional (C-V-9, CA-11 durci)", async () => {
  // C-V-9 (CA-11 durci): the artefacts are produced by the REAL CLI (runMain --rebase-crosscheck), never hand-built;
  // the test LOADS the crosscheck-*.json the code wrote, replays compareToHybrid, and asserts the verdict + the
  // biconditional. m0 = equal (method WITHOUT pending); m1 = divergence (its series carries an EXTRA event; method WITH pending).
  const m0 = XSTOCKS[0]!, m1 = XSTOCKS[1]!;
  const sd = mkdtempSync(join(tmpdir(), "bell-cv9-s-")), od = mkdtempSync(join(tmpdir(), "bell-cv9-o-"));
  const bodyOf = (addr: string, sig: string, slot: number, data: Uint8Array): unknown =>
    ({ slot, blockTime: slot * 100, transaction: { signatures: [sig], message: { accountKeys: [addr, A_ADDR, TOKEN_2022_PROGRAM, OTHER, B_ADDR], instructions: [{ programIdIndex: 2, accounts: [0, 1], data: b58enc(data) }] } }, meta: { err: null, innerInstructions: [] } });
  const bodies: Record<string, unknown> = {};
  for (const m of [m0, m1]) { bodies[`${m.symbol}-i`] = bodyOf(m.address, `${m.symbol}-i`, 10, initBytes(1)); bodies[`${m.symbol}-u`] = bodyOf(m.address, `${m.symbol}-u`, 20, updBytes(1.5, 1500)); }
  const evOf = (sym: string): MultiplierEvent[] => [ev("initialize", 1, 0, 10, 0, `${sym}-i`), ev("update", 1.5, 1500, 20, 0, `${sym}-u`)];
  const triplet = replayTriplet(evOf(m0.symbol), Number.MAX_SAFE_INTEGER)!; // {1.5,1.5,1500} (signature-independent)
  writeFileSync(join(sd, `rebase-${m0.symbol}.json`), JSON.stringify({ symbol: m0.symbol, method: "hybrid-authority-scan", oracle_slot: 45, oracle_triplet: triplet, events: evOf(m0.symbol) })); // equal
  writeFileSync(join(sd, `rebase-${m1.symbol}.json`), JSON.stringify({ symbol: m1.symbol, method: "hybrid-authority-scan (pending R-26 ratification)", oracle_slot: 45, oracle_triplet: triplet, events: [...evOf(m1.symbol), ev("update", 1.6, 1600, 22, 0, `${m1.symbol}-x`)] })); // series has an extra event => divergence
  const stub: JsonRpcCall = (_u, method, params) => {
    throwOnState(method);
    if (method === "getTransactionsForAddress") {
      const sym = String((params as unknown[])[0]) === m0.address ? m0.symbol : m1.symbol;
      if (((params as unknown[])[1] as { sortOrder: string }).sortOrder === "desc") return Promise.resolve({ data: [bodies[`${sym}-u`]], paginationToken: null });
      return Promise.resolve({ data: [bodies[`${sym}-i`], bodies[`${sym}-u`]], paginationToken: null });
    }
    if (method === "getTransaction") return Promise.resolve(bodies[String((params as unknown[])[0])]);
    throw new Error("unexpected " + method);
  };
  await runMain(["--rebase-crosscheck", "--pools", `${m0.symbol},${m1.symbol}`, "--max-calls", "100", "--max-credits", "1000", "--max-pages", "10", "--min-interval", "0", "--allow-short-pages", "--series-dir", sd, "--out", od], b1aDeps(stub));
  for (const m of [m0, m1]) {
    const series = loadHybridSeries(sd, m.symbol)!;
    const artifact = JSON.parse(readFileSync(join(od, `crosscheck-${m.symbol}.json`), "utf8")) as { events: MultiplierEvent[]; scan_complete: boolean; scan_reason: string | null; comparator_verdict: { verdict: string } };
    const replayed = compareToHybrid({ events: artifact.events, handoffs: [], complete: artifact.scan_complete, ...(artifact.scan_reason ? { reason: artifact.scan_reason } : {}), n: artifact.events.length, pages: 1, ledger: [] }, series);
    assert.equal(replayed.verdict, artifact.comparator_verdict.verdict, `${m.symbol}: replayed verdict == committed verdict (M-b1a-13: hand-built artifact would not prove the CLI composition)`);
    assert.equal(!series.method.includes("(pending"), replayed.verdict === "equal", `${m.symbol}: method-without-pending <=> verdict equal (biconditional)`);
  }
});

test("bell_crosscheck_runmain_resumes_budget_and_ledger — runMain --rebase-crosscheck: cumulative budget + LOSSLESS resume (C-1/C-7 b, CA-11)", async () => {
  // CA-11 durci through the REAL CLI (runMain): a budget stop in run 1, then a resume in run 2 that must (a) OFFSET
  // the budget by run-1's persisted calls_used (mutant priorCalls=0 reds), (b) chain run-2's ledger page onto run-1's
  // (mutant genesis-reseed reds), and (c) carry run-1's Initialize so the resumed scan COMPLETES (mutant unseeded
  // events => start anchor fails => inconclusive reds). Bodies use the real SPYx mint address (runMain resolves it).
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
  const args = (maxCalls: string): string[] => ["--rebase-crosscheck", "--pools", "SPYx", "--max-calls", maxCalls, "--max-credits", String(Number(maxCalls) * 10), "--max-pages", "10", "--min-interval", "0", "--allow-short-pages", "--series-dir", seriesDir, "--out", outDir];
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
  // C-G2-1: budget.json persists credits_worst_case = calls_used × 10 (6 × 10) — mutant dropping the ×10 reds.
  assert.equal(readJson("budget.json").credits_worst_case, 60, "budget.json persists worst-case credits = 6 calls × 10 (C-G2-1)");
  // C-B-3/fact 4: calls_by_method is now CUMULATIVE across resumes (seeded from budget.json.calls_by_method.global), so
  // run-2 carries run-1's 2 gTfA + 1 getTransaction PLUS run-2's 2 gTfA + 1 getTransaction => {4,2}; credits_recomputed
  // = 4×10 + 2×1 = 42 (the old per-process {2,1}/21 under-counted the audit after a resume, C-V-2). Drop-the-×10 still reds.
  const cc = readJson("crosscheck-SPYx.json");
  assert.deepEqual(cc.calls_by_method, { getTransactionsForAddress: 4, getTransaction: 2 }, "run-2 calls_by_method is CUMULATIVE = 4 gTfA + 2 getTransaction (fact 4)");
  assert.equal(cc.credits_recomputed, 42, "credits_recomputed = 4×10 + 2×1 = 42 (cumulative; mutant: drop the ×10 => reds, C-G2-3)");
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

// ---- C-G2-1: the credit unit is explicit + fail-closed (calls vs credits unconfusable) ----------------------------
test("bell_crosscheck_budget_credits_cap_is_explicit — --max-credits caps in worst-case credits, independent of --max-calls (C-G2-1)", async () => {
  // A LOOSE --max-calls with a TIGHT --max-credits: the credit cap (every call = 10 cr worst case) binds at
  // floor(maxCredits/10) calls, so a probe written as 1500 CREDITS stops at 150 CALLS — the unit is unconfusable.
  let hits = 0;
  const inner: JsonRpcCall = () => { hits += 1; return Promise.resolve({}); };
  const b = makeBudgetedCall(100000, inner, 0, 1500); // huge max-calls, max-credits 1500 => 150 calls
  for (let i = 0; i < 150; i++) await b.call("u", "m", []);
  await assert.rejects(b.call("u", "m", []), BudgetExceededError, "the 151st call (1510 worst-case cr) fails closed on --max-credits");
  assert.equal(b.calls(), 150, "exactly 150 calls fit under 1500 worst-case credits (mutant: drop the ×10 => 1500 calls => reds)");
  assert.equal(b.credits(), 1500, "credits() = calls × 10 worst case");
  assert.equal(hits, 150, "only the 150 permitted inner calls fired");
});

test("bell_crosscheck_requires_max_credits — --rebase-crosscheck without --max-credits fails closed (C-G2-1)", () => {
  assert.throws(() => parseArgs(["--rebase-crosscheck", "--pools", "SPYx", "--max-calls", "100"], ["SPYx"]), /--max-credits/, "the crosscheck draw must be bounded in the CREDIT unit (probe 1500 / draw 6497500)");
});

// ---- C-G2-2: a c3 mismatch is never mute — sub-case A (divergence) and B (inconclusive) both publish diffs --------
test("bell_crosscheck_c3_mismatch_with_set_divergence_is_divergence — H5 fails AND sets differ => divergence, diffs published (C-G2-2 A)", () => {
  // full-mint self-consistent replay {1.5,1.5,1500}; the committed oracle says {2.0,2.0,1500} (H5 fails) AND the series
  // lacks the update (sets differ) => a GENUINE divergence, never the old mute inconclusive:c3_mismatch.
  const scan: FullMintScan = { events: EXPECTED_EVENTS, handoffs: [], complete: true, n: 2, pages: 1, ledger: [] };
  const badOracle: HybridSeries = { symbol: "SPYx", oracle_slot: ORACLE_SLOT, oracle_triplet: { multiplierBitsHex: f64BitsHexLE(2.0), newMultiplierBitsHex: f64BitsHexLE(2.0), effectiveTimestampSec: 1500 }, events: [EXPECTED_EVENTS[0]!] };
  const v = compareToHybrid(scan, badOracle);
  assert.ok(v.verdict === "divergence" && v.missingFromSeries.length === 1 && v.tripletDiff.length >= 1, "sets-differ + H5-fail => divergence with missing-set AND triplet diff (mutant: inconclusive on H5 fail w/o set check => reds)");
});

test("bell_crosscheck_c3_mismatch_sets_equal_declares_blocktime — H5 fails while sets key-equal => inconclusive + blockTime gap (C-G2-2 B)", () => {
  // Same relaxed key on both sides but the full-mint update folded (blockTime 2000 >= effTs 1500) while the series
  // update stayed pending (blockTime 1400 < 1500). eventKey omits blockTime => SETS equal; replayTriplet folds on it
  // => H5 fails => sub-case B (never a FALSE equal: the mutant deciding equal on sets BEFORE H5 reds here).
  const init = ev("initialize", 1, 0, 10, 0, "initSig");
  const updFolded: MultiplierEvent = { kind: "update", multiplier: "1.5", multiplierBitsHex: f64BitsHexLE(1.5), effectiveTimestampSec: 1500, blockTimeSec: 2000, slot: 20, instructionIndex: 0, signature: "updSig" };
  const updPending: MultiplierEvent = { ...updFolded, blockTimeSec: 1400 };
  const series: HybridSeries = { symbol: "SPYx", oracle_slot: ORACLE_SLOT, oracle_triplet: replayTriplet([init, updPending], Number.MAX_SAFE_INTEGER)!, events: [init, updPending] };
  const v = compareToHybrid({ events: [init, updFolded], handoffs: [], complete: true, n: 2, pages: 1, ledger: [] }, series);
  assert.ok(v.verdict === "inconclusive" && v.reason === "c3_mismatch_sets_equal", "key-equal sets + failed replay => DISTINCT inconclusive reason, never equal (order-inverted mutant reds)");
  assert.ok(v.verdict === "inconclusive" && (v.fieldDiffs ?? []).some((d) => d.field === "blockTimeSec" && d.fullmint === "2000" && d.series === "1400"), "the blockTime gap is declared explicitly (never mute)");
});

// ---- C-G2-7 (DEVIATION): instructionIndex relaxed OUT of the key, published in fieldDiffs; collision fails closed ---
test("bell_crosscheck_index_relaxed_published_collision_fails_closed — index-only gap => equal + published; key collision => fail-closed (C-G2-7)", () => {
  // (i) two events identical but for instructionIndex => same relaxed key => equal (no false divergence), and the
  // index gap is PUBLISHED in fieldDiffs. Mutant α: index back in key => divergence => reds; β: drop it from fieldDiffs => reds.
  const seriesEvents = [ev("initialize", 1, 0, 10, 4, "initSig"), ev("update", 1.5, 1500, 20, 2, "updSig")];
  const scanEvents = [ev("initialize", 1, 0, 10, 4, "initSig"), ev("update", 1.5, 1500, 20, 7, "updSig")]; // update ix 7 vs 2
  const series: HybridSeries = { symbol: "SPYx", oracle_slot: ORACLE_SLOT, oracle_triplet: replayTriplet(scanEvents, Number.MAX_SAFE_INTEGER)!, events: seriesEvents };
  const v = compareToHybrid({ events: scanEvents, handoffs: [], complete: true, n: 2, pages: 1, ledger: [] }, series);
  assert.equal(v.verdict, "equal", "an index-only difference is NOT a divergence (relaxed key; mutant α: index back in key => divergence => reds)");
  assert.ok(v.verdict === "equal" && v.fieldDiffs.some((d) => d.field === "instructionIndex" && d.fullmint === "7" && d.series === "2"), "the index gap is published, never masked (mutant β: drop it from fieldDiffs => reds)");
  // (ii) two full-mint events collapse to ONE relaxed key (same {slot,sig,kind,bits,effTs}) => fail-closed, never a silent false equal.
  const initE = ev("initialize", 1, 0, 10, 4, "initSig"), dupA = ev("update", 1.5, 1500, 20, 0, "dupSig"), dupB = ev("update", 1.5, 1500, 20, 1, "dupSig");
  const collSeries: HybridSeries = { symbol: "SPYx", oracle_slot: ORACLE_SLOT, oracle_triplet: replayTriplet([initE, dupA], Number.MAX_SAFE_INTEGER)!, events: [initE, dupA] };
  const c = compareToHybrid({ events: [initE, dupA, dupB], handoffs: [], complete: true, n: 3, pages: 1, ledger: [] }, collSeries);
  assert.ok(c.verdict === "inconclusive" && c.reason === "relaxed_key_collision", "a same-relaxed-key duplicate fails closed (mutant: drop the collision guard => false equal => reds)");
});

// ---- C-G2D-1: --max-pages is REQUIRED for the crosscheck (else default 3 => never reaches genesis => inconclusive) ---
test("bell_crosscheck_requires_max_pages — --rebase-crosscheck without --max-pages fails closed (C-G2D-1)", () => {
  // Without --max-pages the parse defaults maxPages to 3 (the probe/discover default) => the draw stops at 3 pages =>
  // not_at_genesis => inconclusive at EVERY invocation, never completing a real (hundreds-of-thousands-of-pages) mint.
  // --max-pages is REQUIRED (same idiom as --max-credits), checked AFTER --max-credits so that error surfaces first.
  assert.throws(() => parseArgs(["--rebase-crosscheck", "--pools", "SPYx", "--max-calls", "100", "--max-credits", "1000"], ["SPYx"]), /--max-pages/, "the crosscheck must state its page bound explicitly (probe 1, draw 649750)");
  // an explicit 0 is rejected too (a 0 bound never scans a page) — mirrors the --max-credits > 0 check.
  assert.throws(() => parseArgs(["--rebase-crosscheck", "--pools", "SPYx", "--max-calls", "100", "--max-credits", "1000", "--max-pages", "0"], ["SPYx"]), /--max-pages must be > 0/, "an explicit --max-pages 0 fails closed");
  // with --max-pages present and > 0, the parse succeeds (the crosscheck draw is expressible).
  const parsed = parseArgs(["--rebase-crosscheck", "--pools", "SPYx", "--max-calls", "649750", "--max-credits", "6497500", "--max-pages", "649750"], ["SPYx"]);
  assert.equal(parsed.maxPages, 649750, "an explicit --max-pages is honored (the draw bound)");
});

// ---- C-G2D-2: readPriorCalls binds the budget to the ledger — a decrease is always detectable (never a silent reset) --
test("bell_crosscheck_readPriorCalls_binds_to_ledger — ledger present + budget absent throws; calls_used below ledger pages throws (C-G2D-2)", () => {
  const dir = mkdtempSync(join(tmpdir(), "bell-budget-bind-"));
  const ledgerLine = (page: number): string => JSON.stringify({ prev_entry_sha256: "0".repeat(64), page, slot_lo: page, slot_hi: page, first_sig: "s", last_sig: "s", tx_count: 1, tail_sigs_at_slot_hi: ["s"], list_sha256: "x", entry_sha256: "y" }) + "\n";
  // (a) a ledger-<MINT>.jsonl present with NO budget.json is a resume state missing its counter => throw (never 0).
  writeFileSync(join(dir, "ledger-SPYx.jsonl"), ledgerLine(1));
  assert.throws(() => readPriorCalls(dir), /resume state but no budget\.json/, "ledger present + budget.json absent is incoherent (never a silent reset to 0; mutant: return 0 => reds)");
  // (b) budget.json calls_used below the on-disk ledger pages (2 here) is a downward tamper => throw.
  writeFileSync(join(dir, "ledger-SPYx.jsonl"), ledgerLine(1) + ledgerLine(2)); // 2 ledger pages on disk
  writeFileSync(join(dir, "budget.json"), JSON.stringify({ calls_used: 1, credits_worst_case: 10, pages: 2 }));
  assert.throws(() => readPriorCalls(dir), /below the 2 ledger pages/, "calls_used=1 < 2 ledger pages => tamper => throw (mutant: drop the check => reds)");
  // a legitimate resume (calls_used >= ledger pages) is accepted and read back.
  writeFileSync(join(dir, "budget.json"), JSON.stringify({ calls_used: 5, credits_worst_case: 50, pages: 2 }));
  assert.equal(readPriorCalls(dir), 5, "calls_used=5 >= 2 ledger pages is a valid resume");
});

// ---- C-G2D-3: equal (the sole pending-removal path) requires fieldDiffs subset of {instructionIndex} -----------------
test("bell_crosscheck_equal_requires_fielddiffs_subset_index — a blockTimeSec gap on matched events blocks equal => inconclusive (C-G2D-3)", () => {
  // Sets are key-EQUAL (eventKey omits blockTimeSec) and H5 passes (oracle anchored to the scan's own replay), but an
  // identity-matched event carries a blockTimeSec gap (2000 vs 2100, both >= effTs 1500 => the fold is identical =>
  // H5 concords). The old code returned equal (removing pending) with a mute blockTime alarm; C-G2D-3 refuses equal.
  const init = ev("initialize", 1, 0, 10, 0, "initSig");
  const scanUpd: MultiplierEvent = { kind: "update", multiplier: "1.5", multiplierBitsHex: f64BitsHexLE(1.5), effectiveTimestampSec: 1500, blockTimeSec: 2000, slot: 20, instructionIndex: 0, signature: "updSig" };
  const seriesUpd: MultiplierEvent = { ...scanUpd, blockTimeSec: 2100 }; // same relaxed key, different blockTimeSec
  const scanEvents = [init, scanUpd];
  const series = seriesWith(scanEvents, [init, seriesUpd]); // oracle_triplet anchored to the scan replay => H5 holds
  const v = compareToHybrid({ events: scanEvents, handoffs: [], complete: true, n: 2, pages: 1, ledger: [] }, series);
  assert.ok(v.verdict === "inconclusive" && v.reason === "field_diff_outside_index", "a blockTimeSec fieldDiff on matched events blocks equal (mutant: return equal regardless of fieldDiffs => reds)");
  assert.ok(v.verdict === "inconclusive" && (v.fieldDiffs ?? []).some((d) => d.field === "blockTimeSec" && d.fullmint === "2000" && d.series === "2100"), "the blockTime gap is published for the checkpoint escalation");
  // control: with NO blockTimeSec gap (only an index gap), equal still holds (C-G2-7 relaxed key unchanged).
  const okSeries = seriesWith(scanEvents, [init, { ...scanUpd, instructionIndex: 7 }]);
  const ok = compareToHybrid({ events: scanEvents, handoffs: [], complete: true, n: 2, pages: 1, ledger: [] }, okSeries);
  assert.equal(ok.verdict, "equal", "an index-only fieldDiff still rides on equal (C-G2-7 unchanged)");
});

// ---- C-G2D-4: budget.json is persisted PER PAGE (a crash before the final write leaves the exact per-page count) ----
test("bell_crosscheck_per_page_budget_survives_crash — a hard crash after a page's onPage but before the final write leaves budget.json at the per-page count (C-G2D-4)", async () => {
  const refEvents = [ev("initialize", 1, 0, 10, 0, "initSig"), ev("update", 1.5, 1500, 20, 0, "updSig")];
  const oracleTriplet = replayTriplet(refEvents, Number.MAX_SAFE_INTEGER)!;
  const seriesDir = mkdtempSync(join(tmpdir(), "bell-cc-crash-series-")), outDir = mkdtempSync(join(tmpdir(), "bell-cc-crash-out-"));
  writeFileSync(join(seriesDir, "rebase-SPYx.json"), JSON.stringify({ symbol: "SPYx", method: "hybrid-authority-scan", oracle_slot: 25, oracle_triplet: oracleTriplet, events: refEvents }));
  const cinit = jtx("initSig", 10, 1000, initBytes(1)), cupd = jtx("updSig", 20, 2000, updBytes(1.5, 1500));
  const bodies: Record<string, unknown> = { initSig: cinit, updSig: cupd };
  // A stub that serves page 1 (init) normally — its onPage MUST write budget.json — then HARD-CRASHES on the page-2
  // asc fetch (a non-budget error = a simulated process kill), BEFORE the CLI's final budget.json write is reached.
  let ascHits = 0;
  const crashOnP2: JsonRpcCall = (_u, method, params) => {
    throwOnState(method);
    if (method === "getTransactionsForAddress") {
      const p = (params as unknown[])[1] as { sortOrder: string };
      if (p.sortOrder === "desc") return Promise.resolve({ data: [bodies.updSig], paginationToken: null });
      ascHits += 1;
      if (ascHits >= 2) throw new Error("HTTP 418 simulated hard crash (process kill) mid-scan"); // non-transient code => the retry does not loop it
      return Promise.resolve({ data: [cinit], paginationToken: "p2" });
    }
    if (method === "getTransaction") return Promise.resolve(bodies[String((params as unknown[])[0])]);
    throw new Error("unexpected " + method);
  };
  const noDb: DatabentoGet = () => Promise.resolve([]);
  const noPoly: PolygonGet = () => Promise.resolve({ results: [] });
  const env = { BELL_SOLANA_RPC: PROVIDERS.join(",") } as NodeJS.ProcessEnv;
  const args = ["--rebase-crosscheck", "--pools", "SPYx", "--max-calls", "100", "--max-credits", "1000", "--max-pages", "10", "--min-interval", "0", "--allow-short-pages", "--series-dir", seriesDir, "--out", outDir];
  // C-B-4: the crash carries a NON-transient code (HTTP 418, not 5xx/429/timeout/transport) so withRetry does not loop
  // it; it propagates once and the `finally` writes the budget BEFORE it propagates (the try has no catch; scanFullMint
  // rethrows non-budget errors).
  await assert.rejects(runMain(args, { call: crashOnP2, databentoGet: noDb, polygonGet: noPoly, env, nowMs: 25000 }), /simulated hard crash/, "the hard crash propagates (not swallowed)");
  // C-B-4 (M-b1a-4a killer): the crash happens on the page-2 asc gTfA — its guard TICKED calls_used to 3 before the stub
  // threw. The `finally` persists that (calls_used 3), so a resume can't under-count => overspend. pages stays 1 (the
  // faulted page-2 is never committed, C-B-1). Removing the finally leaves the onPage value 2 => this test reds.
  const budget = JSON.parse(readFileSync(join(outDir, "budget.json"), "utf8")) as { calls_used: number; pages: number };
  assert.equal(budget.pages, 1, "budget.json reflects exactly the one committed page (per-page write; the faulted page-2 is not committed)");
  assert.equal(budget.calls_used, 3, "calls_used = 3 (p1 gTfA + initSig opB + p2 gTfA ticked) persisted by the finally (C-B-4; removing it => 2 => reds)");
});

// ---- C-G2D2-1: the calls_used == ledgerPages boundary is PINNED — a regression `<`->`<=` would FALSELY REFUSE a
// ---- legitimate near-genesis resume (the false refusal the mission flags as worst-case), + the density-helper resume --
test("bell_crosscheck_readPriorCalls_boundary_and_budget_only — calls_used == ledger pages resumes (not refused); a budget.json with zero ledger resumes cumulatively (C-G2D2-1)", () => {
  const ledgerLine = (page: number): string => JSON.stringify({ prev_entry_sha256: "0".repeat(64), page, slot_lo: page, slot_hi: page, first_sig: "s", last_sig: "s", tx_count: 1, tail_sigs_at_slot_hi: ["s"], list_sha256: "x", entry_sha256: "y" }) + "\n";
  // BOUNDARY: calls_used EXACTLY equal to the on-disk ledger pages (2 == 2) is a LEGITIMATE resume (k pages persisted
  // with no getTransaction otherOp re-read — reachable near genesis) => ACCEPTED, never a throw. A regression to `<=`
  // would falsely REFUSE it (throw on the equality), blocking the real draw (mutant N2 `< ledgerPages`->`<=` reds here).
  const bnd = mkdtempSync(join(tmpdir(), "bell-budget-bnd-"));
  writeFileSync(join(bnd, "ledger-SPYx.jsonl"), ledgerLine(1) + ledgerLine(2)); // 2 ledger pages on disk
  writeFileSync(join(bnd, "budget.json"), JSON.stringify({ calls_used: 2, credits_worst_case: 20, pages: 2 }));
  assert.equal(readPriorCalls(bnd), 2, "calls_used == 2 ledger pages is a valid resume, ACCEPTED (mutant `<`->`<=` throws here => reds)");
  // the OTHER side of the boundary stays fail-closed: calls_used == pages - 1 (1 < 2) is a downward tamper => throw.
  writeFileSync(join(bnd, "budget.json"), JSON.stringify({ calls_used: 1, credits_worst_case: 10, pages: 2 }));
  assert.throws(() => readPriorCalls(bnd), /below the 2 ledger pages/, "calls_used == pages - 1 stays a refusal (the downward-tamper guard is intact)");
  // DENSITY-HELPER SCENARIO (the density probe writes budget.json but NEVER a ledger-<MINT>.jsonl): budget.json present
  // with consumed calls and ZERO ledger pages => resume ACCEPTED, cumulative counter preserved (calls_used >= 0 pages holds).
  const dns = mkdtempSync(join(tmpdir(), "bell-budget-dns-"));
  writeFileSync(join(dns, "budget.json"), JSON.stringify({ calls_used: 32, credits_worst_case: 320 }));
  assert.equal(readPriorCalls(dns), 32, "budget-only (0 ledger pages) resumes with the cumulative counter intact");
});

// ---- C-G2D2-2: hasResumeState covers events-/handoffs- (not only ledger-): each alone, without budget.json, is a
// ---- fail-closed incoherent resume, never read as a fresh 0 — pins the two branches the ledger-only case (a) misses --
test("bell_crosscheck_hasResumeState_events_or_handoffs_fail_closed — an events- OR a handoffs- jsonl alone (no budget.json, no ledger) throws (C-G2D2-2)", () => {
  // The ledger- branch of hasResumeState is pinned by bell_crosscheck_readPriorCalls_binds_to_ledger (a); these pin the
  // events- and handoffs- branches, so a mutant dropping `events|handoffs` from the regex (reading a resume as a fresh 0
  // instead of throwing) reds. BOTH exercised so removing EITHER alternative — not only both together — is caught.
  const evDir = mkdtempSync(join(tmpdir(), "bell-budget-ev-"));
  writeFileSync(join(evDir, "events-SPYx.jsonl"), JSON.stringify({ kind: "update", slot: 20 }) + "\n");
  assert.throws(() => readPriorCalls(evDir), /resume state but no budget\.json/, "events- alone (no budget.json/ledger) is an incoherent resume => throw (mutant drops `events|` => returns 0 => reds)");
  const hoDir = mkdtempSync(join(tmpdir(), "bell-budget-ho-"));
  writeFileSync(join(hoDir, "handoffs-SPYx.jsonl"), JSON.stringify({ newAuthorityHex: "aa", slot: 12 }) + "\n");
  assert.throws(() => readPriorCalls(hoDir), /resume state but no budget\.json/, "handoffs- alone (no budget.json/ledger) is an incoherent resume => throw (mutant drops `|handoffs` => reds)");
});

// ================= -b3d-b1a (resume / ledger / budget) — checkpoint-1 corrections C-B-1..7 =================
// Shared SYNTHETIC fixtures (checkpoint-1 C-16), h1.ts-shaped: init@10, updA@20, updB@30, updC@40 on the real SPYx mint
// (K2), oracle_slot 45. NO network — the injected `call` returns hand-built pages/bodies. `b1aStub(faultOn)` makes op-B
// getTransaction REJECT for one sig (HTTP 503) => a body-quorum fault on its page (the V-1 driver). All oracles execute
// the composition through runMain / runRebaseCrosscheckCli from artefacts the CODE writes (CA-11 durci).
const cinitB = jtx("initSig", 10, 1000, initBytes(1)), cAB = jtx("updA", 20, 2000, updBytes(1.5, 1500)),
  cBB = jtx("updB", 30, 3000, updBytes(2, 2500)), cCB = jtx("updC", 40, 4000, updBytes(3, 3500));
const B1A_BODIES: Record<string, unknown> = { initSig: cinitB, updA: cAB, updB: cBB, updC: cCB };
const eInitB = ev("initialize", 1, 0, 10, 0, "initSig"), eAB = ev("update", 1.5, 1500, 20, 0, "updA"),
  eBB = ev("update", 2, 2500, 30, 0, "updB"), eCB = ev("update", 3, 3500, 40, 0, "updC");
const B1A_TRIPLET = replayTriplet([eInitB, eAB, eBB, eCB], Number.MAX_SAFE_INTEGER)!;
function b1aStub(ascPages: Array<{ data: unknown[]; paginationToken: string | null }>, faultOn: string | null = null): JsonRpcCall {
  let ai = 0;
  return (_u, method, params) => {
    throwOnState(method);
    if (method === "getTransactionsForAddress") {
      const p = (params as unknown[])[1] as { sortOrder: string; filters?: { slot?: { gte?: number } } };
      if (p.sortOrder === "desc") return Promise.resolve({ data: [B1A_BODIES.updC], paginationToken: null });
      const gte = p.filters?.slot?.gte, page = ascPages[ai++] ?? { data: [], paginationToken: null };
      return Promise.resolve({ data: gte === undefined ? page.data : page.data.filter((b) => Number((b as { slot: number }).slot) >= gte), paginationToken: page.paginationToken });
    }
    if (method === "getTransaction") { const sig = String((params as unknown[])[0]); if (sig === faultOn) return Promise.reject(new Error("HTTP 503")); return Promise.resolve(B1A_BODIES[sig]); }
    throw new Error("unexpected " + method);
  };
}
const noDbB: DatabentoGet = () => Promise.resolve([]);
const noPolyB: PolygonGet = () => Promise.resolve({ results: [] });
const b1aDeps = (call: JsonRpcCall): Parameters<typeof runMain>[1] => ({ call, databentoGet: noDbB, polygonGet: noPolyB, env: { BELL_SOLANA_RPC: PROVIDERS.join(",") }, nowMs: 50000 });
const b1aArgs = (seriesDir: string, outDir: string, maxCalls: number, maxCredits = maxCalls * 10): string[] =>
  ["--rebase-crosscheck", "--pools", "SPYx", "--max-calls", String(maxCalls), "--max-credits", String(maxCredits), "--max-pages", "10", "--min-interval", "0", "--allow-short-pages", "--series-dir", seriesDir, "--out", outDir];
const b1aSeries = (events: readonly MultiplierEvent[]): string =>
  JSON.stringify({ symbol: "SPYx", method: "hybrid-authority-scan (pending R-26 ratification)", oracle_slot: 45, oracle_triplet: B1A_TRIPLET, events });
type CrosscheckArtifact = { comparator_verdict: { verdict: string; reason?: string }; scan_complete: boolean; pages: number;
  calls_by_method: Record<string, number>; credits_recomputed: number; candidate_shas: Record<string, string>; set_authority_scan?: Record<string, unknown> };
// D9 ter §3: type the parsed artifact (no `any` return) so lint:ratchet's no-unsafe-return does not count it — the
// out-of-scope resorption of the b1a-added ratchet violation folded into this lot (RENDU §7.5(b), error_origin G7 b1a).
const readCC = (outDir: string): CrosscheckArtifact =>
  JSON.parse(readFileSync(join(outDir, "crosscheck-SPYx.json"), "utf8")) as CrosscheckArtifact;

// ---- -b3d-f (condition (f)): verifyLedgerChain re-derives the chain AND its COMMITTED payload, independently of the
// ---- writer (L-b1a-6 / C-V-3 base, now closing the payload vector: the ledger head commits page_events/page_handoffs) --
test("bell_crosscheck_ledger_chain_rederives_from_disk — verifyLedgerChain re-derives the head of a runMain ledger == its ledger_sha256; a tampered prev/core fails closed (C-V-3, C-F-5)", async () => {
  // C-F-5 (CA-11 durci): the records are the REAL ledger-<MINT>.jsonl runMain wrote, never hand-built in memory. A
  // multi-page ledger (3 chained records) so the mid-chain tamper has a real link to break.
  const sd = mkdtempSync(join(tmpdir(), "bell-fd-s-")), od = mkdtempSync(join(tmpdir(), "bell-fd-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  await runMain(b1aArgs(sd, od, 50), b1aDeps(b1aStub([{ data: [cinitB], paginationToken: "p2" }, { data: [cAB], paginationToken: "p3" }, { data: [cBB, cCB], paginationToken: null }])));
  const records = readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l) as LedgerRecord);
  assert.equal(records.length, 3, "runMain wrote three chained atomic records");
  const ok = verifyLedgerChain(records);
  assert.equal(ok.ok, true, "the real on-disk chain re-derives (payload committed on every record)");
  const artifact = JSON.parse(readFileSync(join(od, "crosscheck-SPYx.json"), "utf8")) as { ledger_sha256: string };
  assert.equal(ok.headSha, artifact.ledger_sha256, "the re-derived head == the artifact's ledger_sha256 (the §5/CA-9 audit anchor)");
  // a tampered prev_entry_sha256 in the MIDDLE breaks the link (independent re-derivation reds; M-b1a-7b stays live).
  const midTamper = records.map((r, i) => (i === 1 ? { ...r, prev_entry_sha256: "f".repeat(64) } : r));
  assert.equal(verifyLedgerChain(midTamper).ok, false, "a tampered prev_entry_sha256 mid-chain fails closed");
  // a core field edited under a STALE entry_sha256 (the writer's sha kept) => recomputed hash != stored => fail closed.
  assert.equal(verifyLedgerChain([{ ...records[0]!, tx_count: 999 }]).ok, false, "a core field edited under a stale entry_sha256 fails closed");
});

test("bell_crosscheck_ledger_chain_rederives_committing_page_payload — page_events/page_handoffs ENTER entry_sha256; a substituted payload under a kept entry_sha256 fails closed (condition (f); M-b1a-7/9 INVERTED)", () => {
  const pe = [ev("initialize", 1, 0, 10, 0, "a")];
  const ho = [{ mint: MINT, newAuthorityHex: null, currentAuthority: A_ADDR, slot: 10, instructionIndex: 0, signature: "a" }];
  // The payload is now COMMITTED (INVERSION of M-b1a-7/9, which hashed the payload as a MUTANT): two records with the
  // SAME core txs but DIFFERENT payload get DIFFERENT entry_sha256 (via payload_sha256, the 10th core field).
  const withEvents = chainedLedgerEntry("0".repeat(64), 1, [{ sig: "a", slot: 10 }], pe, [])!;
  const withHandoffs = chainedLedgerEntry("0".repeat(64), 1, [{ sig: "a", slot: 10 }], [], ho)!;
  assert.notEqual(withEvents.entry_sha256, withHandoffs.entry_sha256, "different payloads => different entry_sha256 (payload committed)");
  // C-V-1(ii) LITERAL expected-value vector (executable pre-registered form of Amendment 2): for this fixed synthetic
  // payload the two hex are hard-coded, computed once with HEAD code AND confirmed INDEPENDENTLY of the helper by raw
  // sha256(JSON.stringify({page_events:[the event], page_handoffs:[]})) over the written form / ingestion order (RENDU
  // cites the node -e). A degenerate helper that hashes only the array LENGTHS (M-f-5) or inverts the payload key order
  // (M-f-6) is consistent on both sides — so the edit tests pass — but yields a DIFFERENT hex HERE => reds. The event is
  // ev("initialize", 1, 0, 10, 0, "a") (multiplierBitsHex 000000000000f03f); the core carries payload_sha256 LAST.
  assert.equal(withEvents.payload_sha256, "a3b346f0de060d33c20a461fcb40d600417f9b6f52282cd1a14fda69da40fd8e",
    "payload_sha256 == raw sha256(JSON.stringify({page_events:[the event], page_handoffs:[]})), a hard-coded literal (M-f-5 lengths-only / M-f-6 key-order => different hex => reds)");
  assert.equal(withEvents.entry_sha256, "1e47da9efc918af3a74e7239677bf29c15a0fb1316f6a1e5fb2f9156c58cfbf4",
    "entry_sha256 == raw sha256(JSON.stringify(core with payload_sha256 LAST)), a hard-coded literal (a degenerate payload commitment => different entry_sha256 => reds)");
  // C-G2-DELTA-1: the 1-event/0-handoff vector above CANNOT pin ingestion order: sortEvents (or a sort of page_handoffs)
  // over a <=1 element array is identity, so the literal is unchanged => a mutant that sorts page_events on BOTH sides
  // (MINE-3) or sorts page_handoffs on BOTH sides (MINE-4) survives it. Two multi-element vectors close that gap. The two
  // hex are RECOMPUTED as raw sha256(JSON.stringify({page_events,page_handoffs})) INDEPENDENTLY of the payloadSha helper
  // (RENDU cites the node script). The objects are BESPOKE literals (NOT ev()/hexOf) so each hex is valid ONLY for these
  // exact bytes/order; a worker rebuilding them from ev()/hexOf would get a different hex (declared trap).
  const evA: MultiplierEvent = { kind: "initialize", multiplier: "1", multiplierBitsHex: "aa", effectiveTimestampSec: 0, blockTimeSec: 1000, slot: 10, instructionIndex: 0, signature: "a" };
  const evB: MultiplierEvent = { kind: "update", multiplier: "1.5", multiplierBitsHex: "bb", effectiveTimestampSec: 1500, blockTimeSec: 2000, slot: 20, instructionIndex: 0, signature: "b" };
  const ho1cc = { mint: "M", newAuthorityHex: "cc", currentAuthority: "A", slot: 20, instructionIndex: 1, signature: "b" };
  const ho0dd = { mint: "M", newAuthorityHex: "dd", currentAuthority: "A", slot: 10, instructionIndex: 0, signature: "a" };
  const ccTxs = [{ sig: "a", slot: 10 }, { sig: "b", slot: 20 }];
  // Vector 1 (event INGESTION ORDER): events [evB, evA] NON-sorted + one handoff [ho1cc]. A sortEvents on BOTH sides folds
  // [evB,evA] to [evA,evB] => the payload hex changes (194133c8... != f2243f755f...) => MINE-3 reds. The same literal also
  // pins the written FORM (MINE-2 key permutation => different hex) and the array CONTENT (MINE-1 lengths-only => different hex).
  const orderedEntry = chainedLedgerEntry("0".repeat(64), 1, ccTxs, [evB, evA], [ho1cc])!;
  assert.equal(orderedEntry.payload_sha256, "f2243f755fa55d8c564017c55b92debda4a5307cc6e5e6d1b5b5607a581ab1ff",
    "payload_sha256 pins the ingestion order of >=2 events: raw sha256 over [evB,evA] (sorted [evA,evB] => 194133c8... => MINE-3 reds; lengths-only => MINE-1 reds; key permutation => MINE-2 reds)");
  assert.equal(orderedEntry.entry_sha256, "aa0f826b5755754b6b258ecac9b26e8a6ac83632981945a31d55b0981322a0dd",
    "entry_sha256 folds that payload_sha256 as the 10th core field: raw sha256 over the core (a re-ordered or degenerate payload => different entry_sha256 => reds)");
  // Vector 2 (handoff INGESTION ORDER): two handoffs [ho1cc(slot20), ho0dd(slot10)] NON-sorted. A sort of page_handoffs on
  // BOTH sides folds them to [ho0dd, ho1cc] => the payload hex changes => MINE-4 reds (a single handoff cannot pin this).
  const handoffOrderEntry = chainedLedgerEntry("0".repeat(64), 1, ccTxs, [evB, evA], [ho1cc, ho0dd])!;
  assert.equal(handoffOrderEntry.payload_sha256, "f0a2d8a3d56eaaf6e2a3e55a9fb01c2dbd6c4578bbe6362ab28573b987e875c0",
    "payload_sha256 pins the ingestion order of >=2 handoffs: raw sha256 over [ho1cc,ho0dd] (a slot-asc handoff sort => [ho0dd,ho1cc] => different hex => MINE-4 reds)");
  const recEvents: LedgerRecord = { ...withEvents, page_events: pe, page_handoffs: [] };
  assert.equal(verifyLedgerChain([recEvents]).ok, true, "a record whose payload re-derives its committed sha is ok");
  // SUBSTITUTE the payload but KEEP entry_sha256 (and its STORED payload_sha256) => the RE-DERIVED payload_sha256 differs
  // => fail closed. M-f-1 (read the STORED payload_sha256 instead of recomputing) would MATCH => ok:true => reds.
  const substituted: LedgerRecord = { ...withEvents, page_events: [], page_handoffs: ho };
  assert.equal(verifyLedgerChain([substituted]).ok, false, "a substituted payload under a kept entry_sha256/payload_sha256 fails closed (M-f-1 => ok:true => reds)");
});

test("bell_crosscheck_ledger_chain_refuses_missing_payload_sha — a record whose payload_sha256 is ABSENT (9-field legacy or a tamper dropping it) is refused, never re-derived from the recomputed payload (C-F-1)", () => {
  const pe = [ev("initialize", 1, 0, 10, 0, "a")];
  const valid = chainedLedgerEntry("0".repeat(64), 1, [{ sig: "a", slot: 10 }], pe, [])!;
  const validRec: LedgerRecord = { ...valid, page_events: pe, page_handoffs: [] };
  assert.equal(verifyLedgerChain([validRec]).ok, true, "the 10-field record (payload committed) re-derives (control)");
  // TAMPER: drop payload_sha256 but KEEP entry_sha256 + the intact page_events/page_handoffs. A verifier that TOLERATES
  // the absent field (M-f-4) recomputes payload_sha256 from the intact payload, rebuilds the 10-field core and MATCHES
  // the kept entry_sha256 => ok:true. The C-F-1 presence guard refuses on the ABSENT field FIRST => ok:false.
  const dropped: Record<string, unknown> = { ...validRec };
  delete dropped.payload_sha256;
  assert.equal(verifyLedgerChain([dropped as unknown as LedgerRecord]).ok, false, "an absent payload_sha256 is refused, never ignored (M-f-4 tolerates it => recompute matches => ok:true => reds)");
  // a genuine 9-field legacy record (no payload_sha256, any entry_sha256) is refused too — no migration (fact 5).
  const legacyNine = { prev_entry_sha256: "0".repeat(64), page: 1, slot_lo: 10, slot_hi: 10, first_sig: "a", last_sig: "a",
    tx_count: 1, tail_sigs_at_slot_hi: ["a"], list_sha256: "x", entry_sha256: "y", page_events: pe, page_handoffs: [] };
  assert.equal(verifyLedgerChain([legacyNine as unknown as LedgerRecord]).ok, false, "a 9-field legacy record (no payload_sha256) is refused at the resume (no migration, fact 5)");
});

test("bell_crosscheck_resume_refuses_edited_payload — a resume onto a ledger whose page_events OR page_handoffs was edited (entry_sha256 kept) is fail-closed BEFORE any write; the byte-exact copy still resumes equal (condition (f), C-F-3)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-rep-s-")), od = mkdtempSync(join(tmpdir(), "bell-rep-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  const lf = join(od, "ledger-SPYx.jsonl"), bf = join(od, "budget.json");
  // RUN 1: budget stop after page 1 (p1 gTfA + initSig opB + p2 gTfA = 3; updA opB is the 4th) => ONE honest atomic
  // record carrying the Initialize in page_events and NO hand-off in page_handoffs.
  await runMain(b1aArgs(sd, od, 3), b1aDeps(b1aStub([{ data: [cinitB], paginationToken: "p2" }, { data: [cAB], paginationToken: null }])));
  assert.equal(readFileSync(lf, "utf8").trim().split("\n").length, 1, "run-1 persisted one atomic record");
  const rec0 = JSON.parse(readFileSync(lf, "utf8").trim()) as Record<string, unknown>;
  const pe0 = rec0.page_events as MultiplierEvent[];
  assert.ok(pe0.length === 1 && pe0[0]!.kind === "initialize", "run-1's record carries the Initialize in page_events");
  assert.equal((rec0.page_handoffs as unknown[]).length, 0, "run-1's record has NO hand-off => the (b) edit makes authority_change_found flip false->true (the L-5 premise)");
  const resumeStub = (): JsonRpcCall => b1aStub([{ data: [cAB, cBB, cCB], paginationToken: null }]);

  // (c) COUPLED CONTROL, run FIRST from a BYTE-EXACT copy taken BEFORE any edit (copyFileSync, not a utf8 re-encode):
  // the unedited ledger resumes to EQUAL in a DISTINCT --out => the refusals below are the EDIT, not a refuse-always bug.
  const odC = mkdtempSync(join(tmpdir(), "bell-rep-c-"));
  copyFileSync(lf, join(odC, "ledger-SPYx.jsonl")); copyFileSync(bf, join(odC, "budget.json"));
  await runMain(b1aArgs(sd, odC, 10), b1aDeps(resumeStub()));
  assert.equal(readCC(odC).comparator_verdict.verdict, "equal", "(c) the byte-exact honest ledger resumes to equal (M-f-3 strips payload_sha256 => this honest resume throws => reds; refuse-always => reds; the honest resumes in this file are the broader control)");

  // (a) EDIT page_events (drop the Initialize), KEEP entry_sha256, on a byte-exact copy.
  const odA = mkdtempSync(join(tmpdir(), "bell-rep-a-"));
  copyFileSync(lf, join(odA, "ledger-SPYx.jsonl")); copyFileSync(bf, join(odA, "budget.json"));
  const recA = JSON.parse(readFileSync(join(odA, "ledger-SPYx.jsonl"), "utf8").trim()) as Record<string, unknown>;
  writeFileSync(join(odA, "ledger-SPYx.jsonl"), JSON.stringify({ ...recA, page_events: [] }) + "\n"); // entry_sha256 kept => payload no longer re-derives
  const budgetA = readFileSync(join(odA, "budget.json"), "utf8");
  await assert.rejects(runMain(b1aArgs(sd, odA, 10), b1aDeps(resumeStub())), /chain does not re-derive/,
    "(a) an edited page_events under a kept entry_sha256 is fail-closed (M-f-1 reads the STORED payload_sha256 => no refusal => reds; base 9-field code => no commitment => no refusal => reds)");
  assert.equal(readFileSync(join(odA, "budget.json"), "utf8"), budgetA, "(a) budget.json is BYTE-IDENTICAL after the refusal (the refusal precedes any write: resumeFromLedger precedes writeBudget)");
  assert.equal(existsSync(join(odA, "crosscheck-SPYx.json")), false, "(a) NO crosscheck-SPYx.json written by the refused resume");
  assert.equal(existsSync(join(odA, "crosscheck-SPYx-attempt.json")), false, "(a) NO -attempt sidecar written by the refused resume");

  // (b) EDIT page_handoffs so authority_change_found WOULD FLIP ([] -> one hand-off), KEEP entry_sha256 (vector L-5).
  const odB = mkdtempSync(join(tmpdir(), "bell-rep-b-"));
  copyFileSync(lf, join(odB, "ledger-SPYx.jsonl")); copyFileSync(bf, join(odB, "budget.json"));
  const recB = JSON.parse(readFileSync(join(odB, "ledger-SPYx.jsonl"), "utf8").trim()) as Record<string, unknown>;
  const injected = [{ mint: SPYX.address, newAuthorityHex: hexOf(B_BYTES), currentAuthority: A_ADDR, slot: 10, instructionIndex: 1, signature: "initSig" }];
  writeFileSync(join(odB, "ledger-SPYx.jsonl"), JSON.stringify({ ...recB, page_handoffs: injected }) + "\n"); // authority_change_found would flip true
  const budgetB = readFileSync(join(odB, "budget.json"), "utf8");
  await assert.rejects(runMain(b1aArgs(sd, odB, 10), b1aDeps(resumeStub())), /chain does not re-derive/,
    "(b) an edited page_handoffs (authority_change_found would flip) is fail-closed, vector L-5 (M-f-2 hashes page_events only => handoff edit not caught => no refusal => reds)");
  assert.equal(readFileSync(join(odB, "budget.json"), "utf8"), budgetB, "(b) budget.json is BYTE-IDENTICAL after the refusal");
  assert.equal(existsSync(join(odB, "crosscheck-SPYx.json")), false, "(b) NO crosscheck-SPYx.json written by the refused resume");
  assert.equal(existsSync(join(odB, "crosscheck-SPYx-attempt.json")), false, "(b) NO -attempt sidecar written by the refused resume");

  // (d) C-V-1(i) EQUAL-LENGTH in-place edit: change ONE field of page_events[0] (multiplierBitsHex), keeping the array
  // LENGTHS (page_events 1, page_handoffs 0) and entry_sha256. M-f-5 (helper hashes only {e:events.length,h:handoffs.length})
  // sees no length change => verifies => NO refusal => reds. The honest verifier re-derives the FULL payload => refused.
  const odD = mkdtempSync(join(tmpdir(), "bell-rep-d-"));
  copyFileSync(lf, join(odD, "ledger-SPYx.jsonl")); copyFileSync(bf, join(odD, "budget.json"));
  const recD = JSON.parse(readFileSync(join(odD, "ledger-SPYx.jsonl"), "utf8").trim()) as Record<string, unknown>;
  const evsD = recD.page_events as MultiplierEvent[];
  writeFileSync(join(odD, "ledger-SPYx.jsonl"), JSON.stringify({ ...recD, page_events: [{ ...evsD[0]!, multiplierBitsHex: f64BitsHexLE(2) }] }) + "\n"); // same lengths, one field changed, entry_sha256 kept
  const budgetD = readFileSync(join(odD, "budget.json"), "utf8");
  await assert.rejects(runMain(b1aArgs(sd, odD, 10), b1aDeps(resumeStub())), /chain does not re-derive/,
    "(d) an EQUAL-LENGTH in-place field edit (multiplierBitsHex) is fail-closed (M-f-5 hashes only the array lengths => no change => no refusal => reds)");
  assert.equal(readFileSync(join(odD, "budget.json"), "utf8"), budgetD, "(d) budget.json is BYTE-IDENTICAL after the refusal");
  assert.equal(existsSync(join(odD, "crosscheck-SPYx.json")), false, "(d) NO crosscheck-SPYx.json written by the refused resume");
  assert.equal(existsSync(join(odD, "crosscheck-SPYx-attempt.json")), false, "(d) NO -attempt sidecar written by the refused resume");

  // (e) C-V-1(iii) C-F-1 via runMain: DELETE the payload_sha256 field on disk (keep entry_sha256 + the intact payload)
  // => the presence guard refuses at the resume through the REAL CLI (not only the unit test), killing M-f-4 via runMain.
  const odE = mkdtempSync(join(tmpdir(), "bell-rep-e-"));
  copyFileSync(lf, join(odE, "ledger-SPYx.jsonl")); copyFileSync(bf, join(odE, "budget.json"));
  const recE = JSON.parse(readFileSync(join(odE, "ledger-SPYx.jsonl"), "utf8").trim()) as Record<string, unknown>;
  delete recE.payload_sha256; // absent field, entry_sha256 + page_events/page_handoffs intact
  writeFileSync(join(odE, "ledger-SPYx.jsonl"), JSON.stringify(recE) + "\n");
  const budgetE = readFileSync(join(odE, "budget.json"), "utf8");
  await assert.rejects(runMain(b1aArgs(sd, odE, 10), b1aDeps(resumeStub())), /chain does not re-derive/,
    "(e) a record whose payload_sha256 field is DELETED on disk is refused at the resume via runMain (C-F-1 integration; M-f-4 tolerates absence => resume proceeds => no refusal => reds)");
  assert.equal(readFileSync(join(odE, "budget.json"), "utf8"), budgetE, "(e) budget.json is BYTE-IDENTICAL after the refusal");
  assert.equal(existsSync(join(odE, "crosscheck-SPYx.json")), false, "(e) NO crosscheck-SPYx.json written by the refused resume");
  assert.equal(existsSync(join(odE, "crosscheck-SPYx-attempt.json")), false, "(e) NO -attempt sidecar written by the refused resume");
});

// ---- L-b1a-5 / C-B-5: a torn queue is truncated at resume; a corruption before the queue is fail-closed --------------
test("bell_crosscheck_torn_queue_dropped_and_chain_verified — a torn tail is truncated + the chain re-derived at resume; a mid-file corruption throws (C-B-5)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-torn-s-")), od = mkdtempSync(join(tmpdir(), "bell-torn-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  const lf = join(od, "ledger-SPYx.jsonl");
  // RUN 1: budget stop after page 1 (p1 gTfA + initSig opB + p2 gTfA = 3; updA opB is the 4th) => ONE valid record.
  await runMain(b1aArgs(sd, od, 3), b1aDeps(b1aStub([{ data: [cinitB], paginationToken: "p2" }, { data: [cAB], paginationToken: null }])));
  assert.equal(readFileSync(lf, "utf8").trim().split("\n").length, 1, "run-1 persisted one atomic record");
  appendFileSync(lf, '{"prev_entry_sha256":"' + "0".repeat(64) + '","page":2,"slot'); // a crash mid-append: a TORN partial line
  // RUN 2: resume. readJsonl truncates the torn tail; verifyLedgerChain re-derives the 1 clean record; scan completes.
  await runMain(b1aArgs(sd, od, 10), b1aDeps(b1aStub([{ data: [cAB, cBB, cCB], paginationToken: null }])));
  for (const l of readFileSync(lf, "utf8").trim().split("\n")) JSON.parse(l); // every remaining line re-parses (torn tail gone)
  assert.equal(readCC(od).comparator_verdict.verdict, "equal", "the resume completed onto the re-derived chain => equal");
  // a corruption BEFORE the queue (content after it) is fail-closed (never buried mid-file by a later append).
  const od2 = mkdtempSync(join(tmpdir(), "bell-torn2-o-"));
  const valid = readFileSync(lf, "utf8").trim().split("\n")[0]!;
  writeFileSync(join(od2, "ledger-SPYx.jsonl"), valid + "\nNOT-JSON-MIDFILE\n" + valid + "\n");
  writeFileSync(join(od2, "budget.json"), JSON.stringify({ calls_used: 9, credits_worst_case: 90, pages: 3 }));
  await assert.rejects(runMain(b1aArgs(sd, od2, 10), b1aDeps(b1aStub([{ data: [], paginationToken: null }]))), /unreadable line before its queue/, "a corruption mid-file throws (M-b1a-5: tolerate it => reds)");
});

// ---- L-b1a-7 / C-B-6: candidate raws under candidates/<MINT>/ — re-derivation never mixes two mints -------------------
test("bell_crosscheck_candidate_shas_per_mint — candidate raws live under candidates/<MINT>/; re-derivation never mixes two mints (C-B-6)", async () => {
  const m0 = XSTOCKS[0]!, m1 = XSTOCKS[1]!; // two distinct mint addresses
  const sd = mkdtempSync(join(tmpdir(), "bell-perm-s-")), od = mkdtempSync(join(tmpdir(), "bell-perm-o-"));
  const initFor = (addr: string, sig: string): unknown =>
    ({ slot: 10, blockTime: 1000, transaction: { signatures: [sig], message: { accountKeys: [addr, A_ADDR, TOKEN_2022_PROGRAM, OTHER, B_ADDR], instructions: [{ programIdIndex: 2, accounts: [0, 1], data: b58enc(initBytes(1)) }] } }, meta: { err: null, innerInstructions: [] } });
  const bodies: Record<string, unknown> = { sig0: initFor(m0.address, "sig0"), sig1: initFor(m1.address, "sig1") };
  const oracleTriplet = replayTriplet([ev("initialize", 1, 0, 10, 0, "x")], Number.MAX_SAFE_INTEGER)!;
  for (const [sym, sig] of [[m0.symbol, "sig0"], [m1.symbol, "sig1"]] as const)
    writeFileSync(join(sd, `rebase-${sym}.json`), JSON.stringify({ symbol: sym, method: "hybrid-authority-scan", oracle_slot: 25, oracle_triplet: oracleTriplet, events: [ev("initialize", 1, 0, 10, 0, sig)] }));
  const stub: JsonRpcCall = (_u, method, params) => {
    throwOnState(method);
    if (method === "getTransactionsForAddress") {
      const sig = String((params as unknown[])[0]) === m0.address ? "sig0" : "sig1";
      return Promise.resolve({ data: [bodies[sig]], paginationToken: null }); // one short page; desc anchor = same body
    }
    if (method === "getTransaction") return Promise.resolve(bodies[String((params as unknown[])[0])]);
    throw new Error("unexpected " + method);
  };
  const budgeted = makeBudgetedCall(1000, stub);
  await runRebaseCrosscheckCli(budgeted.call, PROVIDERS, [m0.symbol, m1.symbol], sd, od, { maxPages: 10, requireFullPages: false }, budgeted.calls, budgeted.callsByMethod, budgeted.credits, 1000, []);
  assert.ok(existsSync(join(od, "candidates", m0.symbol, "sig0.json")), "mint 0's candidate is under its OWN subdir");
  assert.ok(existsSync(join(od, "candidates", m1.symbol, "sig1.json")), "mint 1's candidate is under its OWN subdir");
  const cc0 = JSON.parse(readFileSync(join(od, `crosscheck-${m0.symbol}.json`), "utf8")) as { candidate_shas: Record<string, string> };
  const cc1 = JSON.parse(readFileSync(join(od, `crosscheck-${m1.symbol}.json`), "utf8")) as { candidate_shas: Record<string, string> };
  assert.deepEqual(Object.keys(cc0.candidate_shas), ["sig0"], "mint 0's candidate_shas is ITS sigs only (M-b1a-2: a flat readdir => contains sig1 => reds)");
  assert.deepEqual(Object.keys(cc1.candidate_shas), ["sig1"], "mint 1's candidate_shas is ITS sigs only");
});

// A V-1 stub: op-B DISAGREES on updA's multiplier bits (body-quorum miss, no throw => retry-independent, fast) when
// `wrongUpdA`; otherwise it serves the true bodies. Same asc/desc shape as b1aStub.
function v1Stub(ascPages: Array<{ data: unknown[]; paginationToken: string | null }>, wrongUpdA: boolean): JsonRpcCall {
  let ai = 0;
  const wrongA = jtx("updA", 20, 2000, updBytes(9.9, 1500)); // op-B's bits (9.9) != op-A's (1.5) => body_quorum
  return (_u, method, params) => {
    throwOnState(method);
    if (method === "getTransactionsForAddress") {
      const p = (params as unknown[])[1] as { sortOrder: string; filters?: { slot?: { gte?: number } } };
      if (p.sortOrder === "desc") return Promise.resolve({ data: [cCB], paginationToken: null });
      const gte = p.filters?.slot?.gte, page = ascPages[ai++] ?? { data: [], paginationToken: null };
      return Promise.resolve({ data: gte === undefined ? page.data : page.data.filter((b) => Number((b as { slot: number }).slot) >= gte), paginationToken: page.paginationToken });
    }
    if (method === "getTransaction") { const sig = String((params as unknown[])[0]); return Promise.resolve(wrongUpdA && sig === "updA" ? wrongA : B1A_BODIES[sig]); }
    throw new Error("unexpected " + method);
  };
}

// ---- L-b1a-1 / C-B-1 (root of V-1): a faulted page is NOT committed + STOP; the resume re-reads it => no false equal -
test("bell_crosscheck_resume_after_decode_fault_is_not_equal — a body-quorum-faulted page is not committed; the resume re-reads it => never a false equal (C-B-1, V-1)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-v1-s-")), od = mkdtempSync(join(tmpdir(), "bell-v1-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eBB, eCB])); // the SERIES is MISSING updA (>= 2 updates follow, so H5 concords)
  // RUN 1: op-B disagrees on updA (body-quorum) => the [updA] page is discarded + STOP (never a sig without its event).
  await runMain(b1aArgs(sd, od, 50), b1aDeps(v1Stub([{ data: [cinitB], paginationToken: "p2" }, { data: [cAB], paginationToken: "p3" }, { data: [cBB, cCB], paginationToken: null }], true)));
  assert.equal(readCC(od).comparator_verdict.reason, "body_quorum", "run-1 stopped on the body-quorum fault");
  assert.equal(readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8").trim().split("\n").length, 1, "only the clean init page is committed (the faulted updA page is discarded)");
  // RUN 2: op-B now agrees. The resume re-fetches from the last clean page (slot 10) => updA is re-read and decoded.
  await runMain(b1aArgs(sd, od, 50), b1aDeps(v1Stub([{ data: [cAB, cBB, cCB], paginationToken: null }], false)));
  const v = readCC(od);
  assert.equal(v.scan_complete, true, "the resumed scan completed (init carried, end anchor, exhausted)");
  assert.notEqual(v.comparator_verdict.verdict, "equal", "the full-mint saw updA (absent from the series) => NEVER equal (base code: false equal => reds)");
  assert.equal(v.comparator_verdict.verdict, "divergence", "updA is missing-from-series => divergence (pending kept)");
});

test("bell_crosscheck_terminal_inconclusive_never_promotes — a body-quorum inconclusive relaunched under a persistent fault stays inconclusive (C-B-1)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-v1t-s-")), od = mkdtempSync(join(tmpdir(), "bell-v1t-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eBB, eCB]));
  await runMain(b1aArgs(sd, od, 50), b1aDeps(v1Stub([{ data: [cinitB], paginationToken: "p2" }, { data: [cAB], paginationToken: "p3" }], true)));
  assert.equal(readCC(od).comparator_verdict.reason, "body_quorum", "run-1 is inconclusive:body_quorum");
  // relaunch under the SAME persistent fault (op-B still disagrees) => still inconclusive, NEVER promoted to equal/complete.
  await runMain(b1aArgs(sd, od, 50), b1aDeps(v1Stub([{ data: [cAB], paginationToken: "p3" }], true)));
  const v = readCC(od);
  assert.equal(v.scan_complete, false, "a collant inconclusive never becomes complete by relaunch");
  assert.notEqual(v.comparator_verdict.verdict, "equal", "never promoted to equal");
});

// ---- L-b1a-2 / C-B-2 (V-2): a sealed equal artifact is never degraded by a mordant relaunch -------------------------
test("bell_crosscheck_artifact_write_is_monotone — a sealed equal artifact is byte-identical after a mordant relaunch (C-B-2, V-2)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-v2-s-")), od = mkdtempSync(join(tmpdir(), "bell-v2-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  await runMain(b1aArgs(sd, od, 50), b1aDeps(b1aStub([{ data: [cinitB, cAB, cBB, cCB], paginationToken: null }])));
  assert.equal(readCC(od).comparator_verdict.verdict, "equal", "run-1 is equal (sealed scan_complete:true)");
  const before = readFileSync(join(od, "crosscheck-SPYx.json"), "utf8");
  // RUN 2 under a mordant --max-credits (below the cumulative) => budget_exhausted => must NOT overwrite the sealed equal.
  await runMain(b1aArgs(sd, od, 50, 30), b1aDeps(b1aStub([{ data: [cinitB, cAB, cBB, cCB], paginationToken: null }])));
  assert.equal(readFileSync(join(od, "crosscheck-SPYx.json"), "utf8"), before, "the sealed equal artifact is byte-identical (M-b1a-14: unconditional overwrite => degraded => reds)");
  assert.ok(existsSync(join(od, "crosscheck-SPYx-attempt.json")), "the degraded attempt is journaled to a -attempt sidecar");
});

// ---- L-b1a-3 / C-B-3 (V-3): Σ calls_by_method == calls_used, including the budget_exhausted path --------------------
test("bell_crosscheck_calls_by_method_equals_calls_used — Σ calls_by_method == calls_used on a normal AND a budget_exhausted run (C-B-3, V-3)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-v3-s-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  const sumEqualsCalls = (od: string): void => {
    const cc = readCC(od), b = JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { calls_used: number };
    assert.equal(Object.values(cc.calls_by_method).reduce((a, x) => a + x, 0), b.calls_used, "Σ calls_by_method == calls_used");
  };
  const odN = mkdtempSync(join(tmpdir(), "bell-v3n-o-"));
  await runMain(b1aArgs(sd, odN, 50), b1aDeps(b1aStub([{ data: [cinitB, cAB, cBB, cCB], paginationToken: null }])));
  sumEqualsCalls(odN); // (a) a normal, complete run
  const od2 = mkdtempSync(join(tmpdir(), "bell-v3x-o-"));
  await runMain(b1aArgs(sd, od2, 3), b1aDeps(b1aStub([{ data: [cinitB, cAB, cBB, cCB], paginationToken: null }])));
  sumEqualsCalls(od2); // (b) budget_exhausted: the throwing call is NOT counted (M-b1a-3: count BEFORE the guard => Σ = calls_used+1 => reds)
  assert.equal(readCC(od2).scan_complete, false, "the budget-exhausted run is inconclusive");
});

// ---- L-b1a-4 / C-B-4: the budget is durable on the ERROR path (finally), retries included ---------------------------
test("bell_crosscheck_budget_persists_on_error_path — a throw on the desc end-anchor call still persists the budget via the finally (C-B-4)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-b4-s-")), od = mkdtempSync(join(tmpdir(), "bell-b4-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  // the asc page completes (1 page, 4 events); the DESC end-anchor call throws a NON-retryable hard error (outside onPage).
  const descThrows: JsonRpcCall = (_u, method, params) => {
    throwOnState(method);
    if (method === "getTransactionsForAddress") {
      if (((params as unknown[])[1] as { sortOrder: string }).sortOrder === "desc") return Promise.reject(new Error("HTTP 418 desc anchor hard fail"));
      return Promise.resolve({ data: [cinitB, cAB, cBB, cCB], paginationToken: null });
    }
    if (method === "getTransaction") return Promise.resolve(B1A_BODIES[String((params as unknown[])[0])]);
    throw new Error("unexpected " + method);
  };
  await assert.rejects(runMain(b1aArgs(sd, od, 50), b1aDeps(descThrows)), /desc anchor hard fail/, "the desc throw propagates");
  const budget = JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { calls_used: number; pages: number; retries_by_method: Record<string, number> };
  assert.equal(budget.pages, 1, "the one committed page is persisted");
  assert.equal(budget.calls_used, 6, "calls_used = p1 gTfA + 4 opB + desc gTfA (ticked before the throw), persisted by the finally (M-b1a-4a removing it => 5 => reds)");
  assert.ok(budget.retries_by_method && typeof budget.retries_by_method.getTransaction === "number", "retries_by_method is persisted (M-b1a-4b: drop it => reds)");
});

// ---- L-b1a-8: a terminal resume is idempotent (semis reproduces the end anchor); only the budget grows --------------
test("bell_crosscheck_resume_after_exhaustion_is_equal — a terminal resume reproduces the verdict/events/ledger; only the budget grows (L-b1a-8 semis, fact 3)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-rex-s-")), od = mkdtempSync(join(tmpdir(), "bell-rex-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  await runMain(b1aArgs(sd, od, 50), b1aDeps(b1aStub([{ data: [cinitB, cAB, cBB, cCB], paginationToken: null }])));
  const a1 = JSON.parse(readFileSync(join(od, "crosscheck-SPYx.json"), "utf8")) as { comparator_verdict: { verdict: string }; events: unknown[]; n_exact: number; pages: number; ledger_sha256: string; calls_by_method: Record<string, number> };
  const ledger1 = readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8");
  assert.equal(a1.comparator_verdict.verdict, "equal", "run-1 equal");
  // RUN 2 terminal resume (empty asc page): semis reproduces ascLastSig from the last committed page => end anchor holds.
  await runMain(b1aArgs(sd, od, 50), b1aDeps(b1aStub([{ data: [], paginationToken: null }])));
  const a2 = JSON.parse(readFileSync(join(od, "crosscheck-SPYx.json"), "utf8")) as typeof a1;
  assert.equal(a2.comparator_verdict.verdict, "equal", "the terminal resume is STILL equal (M-b1a-8a: drop the semis => end_anchor_mismatch => reds)");
  assert.deepEqual(a2.events, a1.events, "events reproduced identically");
  assert.equal(a2.pages, a1.pages, "pages is idempotent (fact 3: pages = ledger.length, not a +1-drifting counter; M-b1a-8b => reds)");
  assert.equal(a2.ledger_sha256, a1.ledger_sha256, "ledger_sha256 reproduced (no second genesis chain)");
  assert.equal(readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8"), ledger1, "the ledger file is unchanged (0 new pages committed)");
  const sum1 = Object.values(a1.calls_by_method).reduce((a, b) => a + b, 0), sum2 = Object.values(a2.calls_by_method).reduce((a, b) => a + b, 0);
  assert.ok(sum2 > sum1, "only the budget (calls_by_method) grows across the re-verification resume");
});

// ---- L-b1a-8 retry (fact 9): a transient 429 recovers in-process without loss or double-count ----------------------
test("bell_crosscheck_retry_on_429_resumes_without_loss_or_doublecount — a 429 on op-B is retried then succeeds; the page commits once, no event lost (L-b1a-8)", async () => {
  let updBTries = 0, retries = 0;
  const stub: JsonRpcCall = (_u, method, params) => {
    throwOnState(method);
    if (method === "getTransactionsForAddress") {
      if (((params as unknown[])[1] as { sortOrder: string }).sortOrder === "desc") return Promise.resolve({ data: [cCB], paginationToken: null });
      return Promise.resolve({ data: [cinitB, cAB, cBB, cCB], paginationToken: null });
    }
    if (method === "getTransaction") { const sig = String((params as unknown[])[0]); if (sig === "updB") { updBTries += 1; if (updBTries === 1) return Promise.reject(new Error("HTTP 429 rate")); } return Promise.resolve(B1A_BODIES[sig]); }
    throw new Error("unexpected " + method);
  };
  const budgeted = makeBudgetedCall(1000, stub);
  const retry: RetryFn = (fn, method) => withRetry(fn, { tries: 3, sleep: () => Promise.resolve(), onRetry: () => { retries += 1; void method; } });
  const scan = await scanFullMint(budgeted.call, PROVIDERS, SPYX.address, 45, { maxPages: 10, requireFullPages: false }, {}, noopSink, [], retry);
  assert.equal(scan.complete, true, "the transient 429 recovered => the scan completes (no loss)");
  assert.equal(scan.events.length, 4, "all four events decoded (updB re-read succeeded on the retry)");
  assert.equal(retries, 1, "exactly one retry taken");
  assert.equal(updBTries, 2, "updB op-B attempted twice (429 then ok)");
  assert.equal(scan.pages, 1, "the page committed exactly ONCE despite the retry (no double-count; pages = ledger.length)");
});

test("bell_withRetry_budget_and_nontransient_rethrow — withRetry retries 5xx/429, re-throws BudgetExceeded (even transient-looking) and 4xx at once (L-b1a-8, M-b1a-8c)", async () => {
  const noSleep = { sleep: (): Promise<void> => Promise.resolve() };
  // M-b1a-8c: a BudgetExceeded is re-thrown IMMEDIATELY even if its message looks transient — swallowing/retrying it
  // would mask an overspend. Drop the `instanceof BudgetExceededError` guard => it is retried `tries` times => reds.
  let bt = 0;
  await assert.rejects(withRetry(() => { bt += 1; return Promise.reject(new BudgetExceededError("HTTP 503 lookalike budget")); }, { tries: 4, ...noSleep }), BudgetExceededError);
  assert.equal(bt, 1, "BudgetExceeded is re-thrown at once, never retried (M-b1a-8c => bt=4 => reds)");
  // a non-transient error (HTTP 4xx != 429) is re-thrown at once.
  let e4 = 0;
  await assert.rejects(withRetry(() => { e4 += 1; return Promise.reject(new Error("HTTP 404 not found")); }, { tries: 4, ...noSleep }), /HTTP 404/);
  assert.equal(e4, 1, "a 4xx is not retried");
  // a 429 IS retried, then succeeds on the 3rd attempt.
  let ok = 0;
  const r = await withRetry(() => { ok += 1; return ok < 3 ? Promise.reject(new Error("HTTP 429")) : Promise.resolve("ok"); }, { tries: 6, ...noSleep });
  assert.equal(r, "ok"); assert.equal(ok, 3, "retried twice then succeeded");
});

// ---- L-b1a-1 / C-B-1 option (d): notFullPages = re-fetchable fault on the RAW page length (no ledger derivation) -----
// A `filler` is a valid tx on the mint that decodes to NO 43/x event (empty instructions) => enumerated in the ledger/N,
// never re-read on op-B. So a page of GTFA_PAGE_LIMIT raw txs costs 1 gTfA + op-B only for the real init/update.
const nfKeys = [SPYX.address, A_ADDR, TOKEN_2022_PROGRAM, OTHER, B_ADDR];
const nfFiller = (slot: number, sig: string): unknown =>
  ({ slot, blockTime: slot * 100, transaction: { signatures: [sig], message: { accountKeys: nfKeys, instructions: [] } }, meta: { err: null, innerInstructions: [] } });
const nfBulk = (count: number, startSlot: number, prefix: string): unknown[] => Array.from({ length: count }, (_, i) => nfFiller(startSlot + i, prefix + String(i)));
const nfInit = jtx("nfInit", 10, 1000, initBytes(1)), nfUpd = jtx("nfUpd", 1008, 100800, updBytes(1.5, 1500)); // 43/0 + 43/1 on SPYx (op-B re-read)
const nfOpB: Record<string, unknown> = { nfInit, nfUpd };
// P1 = exactly GTFA_PAGE_LIMIT raw txs: init@10 + fillers + a 3-tx TAIL at slot 1007 (=> k=3 dedup on resume).
const NF_P1 = [nfInit, ...nfBulk(GTFA_PAGE_LIMIT - 4, 11, "a"), nfFiller(1007, "t0"), nfFiller(1007, "t1"), nfFiller(1007, "t2")];
const nfEvents = [ev("initialize", 1, 0, 10, 0, "nfInit"), ev("update", 1.5, 1500, 1008, 0, "nfUpd")];
const nfSeries = JSON.stringify({ symbol: "SPYx", method: "hybrid-authority-scan (pending R-26 ratification)", oracle_slot: 3000, oracle_triplet: replayTriplet(nfEvents, Number.MAX_SAFE_INTEGER)!, events: nfEvents });
const nfStub = (ascPages: Array<{ data: unknown[]; token: string | null }>, descBody: unknown): JsonRpcCall => {
  let ai = 0;
  return (_u, method, params) => {
    throwOnState(method);
    if (method === "getTransactionsForAddress") {
      const p = (params as unknown[])[1] as { sortOrder: string; filters?: { slot?: { gte?: number } } };
      if (p.sortOrder === "desc") return Promise.resolve({ data: [descBody], paginationToken: null });
      const gte = p.filters?.slot?.gte, page = ascPages[ai++] ?? { data: [], token: null };
      return Promise.resolve({ data: gte === undefined ? page.data : page.data.filter((b) => Number((b as { slot: number }).slot) >= gte), paginationToken: page.token });
    }
    if (method === "getTransaction") return Promise.resolve(nfOpB[String((params as unknown[])[0])]);
    throw new Error("unexpected " + method);
  };
};
const b1aArgsStrict = (seriesDir: string, outDir: string, maxCalls: number): string[] => // NO --allow-short-pages => requireFullPages true
  ["--rebase-crosscheck", "--pools", "SPYx", "--max-calls", String(maxCalls), "--max-credits", String(maxCalls * 10), "--max-pages", "20", "--min-interval", "0", "--series-dir", seriesDir, "--out", outDir];

test("bell_crosscheck_full_boundary_page_deduped_does_not_false_stop — a RAW-full page deduped on resume is NOT flagged not_full_pages (C-B-1 option d)", async () => {
  assert.equal(NF_P1.length, GTFA_PAGE_LIMIT, "P1 is exactly a full page");
  const sd = mkdtempSync(join(tmpdir(), "bell-nf1-s-")), od = mkdtempSync(join(tmpdir(), "bell-nf1-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), nfSeries);
  const z = nfFiller(2005, "z");
  // RUN 1 (strict, max-calls 2): P1 (RAW-full, non-final) committed; the P2 fetch hits the budget => resume needed.
  await runMain(b1aArgsStrict(sd, od, 2), b1aDeps(nfStub([{ data: NF_P1, token: "p2" }], z)));
  assert.equal(readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8").trim().split("\n").length, 1, "run-1 committed exactly the full P1");
  // RUN 2 (strict): the resumed boundary page is RAW-full (GTFA_PAGE_LIMIT) but its k=3 tail is deduped => pageTxs < limit.
  const P2 = [nfFiller(1007, "t0"), nfFiller(1007, "t1"), nfFiller(1007, "t2"), nfUpd, ...nfBulk(GTFA_PAGE_LIMIT - 4, 1009, "b")];
  await runMain(b1aArgsStrict(sd, od, 50), b1aDeps(nfStub([{ data: P2, token: "p3" }, { data: [z], token: null }], z)));
  assert.equal(readCC(od).scan_complete, true, "the RAW-full deduped page does NOT false-STOP => scan completes (M-b1a-1c: test on pageTxs.length post-dedup => not_full_pages => scan_complete:false => reds)");
});

test("bell_crosscheck_short_nonfinal_page_is_not_committed — a genuinely short non-final page is a re-fetchable fault, never committed (C-B-1 option d)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-nf2-s-")), od = mkdtempSync(join(tmpdir(), "bell-nf2-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), nfSeries);
  const z = nfFiller(2005, "z"), shortP2 = nfBulk(400, 1009, "c"); // 400 raw < GTFA_PAGE_LIMIT, non-final
  // RUN 1 (strict): P1 committed; P2 is genuinely short + non-final => NOT committed + STOP (not_full_pages).
  // BELL-SHORTPAGE-1 (checkpoint-1 C-3): the probe of p3 SEES data ([z]) = a genuine truncation (an EMPTY probe + an equal
  // anchor would be the provably-final case, bell_shortpage_*); before the lot the stub served nothing after P2.
  await runMain(b1aArgsStrict(sd, od, 50), b1aDeps(nfStub([{ data: NF_P1, token: "p2" }, { data: shortP2, token: "p3" }, { data: [z], token: null }], z)));
  assert.equal((readSP(od).short_final_page_probe as { probe_empty: boolean }).probe_empty, false, "the STOP is the NON-EMPTY probe (data follows), not an anchor mismatch");
  assert.equal(readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8").trim().split("\n").length, 1, "only P1 committed (short P2 discarded, M-b1a-1b: commit P2 => 2 entries => reds)");
  const cc1 = readCC(od);
  assert.equal(cc1.scan_complete, false, "not complete");
  assert.equal(cc1.comparator_verdict.reason, "not_full_pages", "reason is not_full_pages (never sealed)");
  // RESUME under the same persistent short page => still inconclusive, never promoted.
  await runMain(b1aArgsStrict(sd, od, 50), b1aDeps(nfStub([{ data: shortP2, token: "p3" }, { data: [z], token: null }], z)));
  assert.equal(readCC(od).scan_complete, false, "the resume is STILL inconclusive (a short page never seals)");
});

test("bell_crosscheck_require_full_pages_mode_guard — a STRICT resume of a ledger built under --allow-short-pages is fail-closed (C-B-1 mixed-mode)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-nf3-s-")), od = mkdtempSync(join(tmpdir(), "bell-nf3-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  // RUN 1 LOOSE (--allow-short-pages) => budget.json records require_full_pages:false.
  await runMain(b1aArgs(sd, od, 50), b1aDeps(b1aStub([{ data: [cinitB, cAB, cBB, cCB], paginationToken: null }])));
  assert.equal((JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { require_full_pages: boolean }).require_full_pages, false, "run-1 persisted the loose mode");
  // RUN 2 STRICT (no --allow-short-pages), SAME --out => the mode guard refuses (a loose ledger may hold a short page).
  await assert.rejects(runMain(b1aArgsStrict(sd, od, 50), b1aDeps(b1aStub([{ data: [cinitB, cAB, cBB, cCB], paginationToken: null }]))), /built loosely/, "a strict resume of a loose ledger throws (guard removed => no throw => reds)");
});

// ================= PLI G2 (b3d-b1a) — killers for ANNOUNCED pipes (C-G2-1/2/3) + defensive ITEM-C ====================
// The G2 review (docs/G2-lot-t1a-ii-b3d-b1a.md) was PASS-WITH-CORRECTIONS: three ANNOUNCED pipes had no integration
// killer (verifyLedgerChain-at-resume, retries_by_method-via-the-real-CLI, the transient-short-page healing) and one
// defensive hole (the mixed-mode guard caught only an EXPLICIT false). These close them, ALL through the REAL CLI
// (runMain) from artefacts the CODE writes (CA-11 durci), never a regex on the source. NO network (the injected `call`
// is a stub). Each mutant is demonstrated red with byte-exact sha256 restore in docs/PLI-lot-t1a-ii-b3d-b1a.md.

// ---- C-G2-1: verifyLedgerChain re-derives at EVERY resume — a PARSABLE ledger with a BROKEN chain is refused ---------
test("bell_crosscheck_resume_onto_broken_chain_is_refused — a resume onto a PARSABLE ledger whose entry_sha256 no longer re-derives is fail-closed via runMain (C-G2-1, C-B-5/C-V-3 belt at resume)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-g21-s-")), od = mkdtempSync(join(tmpdir(), "bell-g21-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  // RUN 1: a budget stop after page 1 (p1 gTfA + initSig opB + p2 gTfA = 3) => ONE valid, chained atomic record on disk.
  await runMain(b1aArgs(sd, od, 3), b1aDeps(b1aStub([{ data: [cinitB], paginationToken: "p2" }, { data: [cAB], paginationToken: null }])));
  const lf = join(od, "ledger-SPYx.jsonl");
  assert.equal(readFileSync(lf, "utf8").trim().split("\n").length, 1, "run-1 persisted one atomic record");
  // TAMPER after the fact: edit a HASHED core field (tx_count) but KEEP the stale entry_sha256 => the record stays
  // PARSABLE JSON (not a torn line, so readJsonl passes it through unchanged) yet the chain no longer re-derives
  // (recomputed sha(core with tx_count 999) != stored entry_sha256). This is the on-disk analogue of the in-memory
  // {..., tx_count: 999} case that bell_crosscheck_ledger_chain_rederives_from_disk pins for the FUNCTION only.
  const rec = JSON.parse(readFileSync(lf, "utf8").trim().split("\n")[0]!) as Record<string, unknown>;
  writeFileSync(lf, JSON.stringify({ ...rec, tx_count: 999 }) + "\n"); // entry_sha256 / prev_sha now inconsistent
  assert.doesNotThrow(() => JSON.parse(readFileSync(lf, "utf8").trim().split("\n")[0]!), "the tampered ledger line is still PARSABLE (a broken CHAIN, not a torn tail)");
  const budget = JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { calls_used: number };
  assert.ok(budget.calls_used >= 1, "budget.json stays coherent (calls_used=" + String(budget.calls_used) + " >= 1 ledger page) => the throw below is the CHAIN belt at resume, NEVER readPriorCalls (C-G2D-2)");
  // RUN 2 (resume, SAME --out, SAME loose mode so the mixed-mode guard is provably NOT what fires): the belt at
  // rebase-crosscheck.ts:506 re-derives the chain, finds it broken, and REFUSES — never scanning onto tampered state.
  await assert.rejects(runMain(b1aArgs(sd, od, 10), b1aDeps(b1aStub([{ data: [cAB, cBB, cCB], paginationToken: null }]))),
    /chain does not re-derive/, "the resume onto the broken (but parsable) chain is fail-closed (mutant disabling verify@resume => the resume PROCEEDS onto tampered state => no throw => reds)");
});

// ---- C-G2-2: the retry -> retries_by_method -> budget.json pipe, WIRED through the real CLI (runMain), not a local retry
test("bell_crosscheck_retries_by_method_wired_through_runmain — a transient 429 on op-B is counted PER METHOD into budget.json via the real CLI retry wiring (C-G2-2)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-g22-s-")), od = mkdtempSync(join(tmpdir(), "bell-g22-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  // One asc page (loose), a desc anchor = updC, and op-B (getTransaction) for updB throws HTTP 429 on its FIRST attempt
  // then succeeds. The CLI wraps op-B in withRetry (rebase-crosscheck.ts:588) with NO injected sleep, so exactly ONE real
  // 400 ms backoff is INHERENT to exercising the real wiring (the prior retry_on_429 test injected a no-op sleep and a
  // LOCAL retry onto scanFullMint, so it never proved this pipe). --min-interval 0 keeps the run to that one backoff.
  let updBTries = 0;
  const stub429: JsonRpcCall = (_u, method, params) => {
    throwOnState(method);
    if (method === "getTransactionsForAddress") {
      if (((params as unknown[])[1] as { sortOrder: string }).sortOrder === "desc") return Promise.resolve({ data: [cCB], paginationToken: null });
      return Promise.resolve({ data: [cinitB, cAB, cBB, cCB], paginationToken: null });
    }
    if (method === "getTransaction") { const sig = String((params as unknown[])[0]); if (sig === "updB") { updBTries += 1; if (updBTries === 1) return Promise.reject(new Error("HTTP 429 rate")); } return Promise.resolve(B1A_BODIES[sig]); }
    throw new Error("unexpected " + method);
  };
  await runMain(b1aArgs(sd, od, 50), b1aDeps(stub429));
  const budget = JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { retries_by_method: Record<string, number> };
  assert.equal(budget.retries_by_method.getTransaction, 1, "the 429 on op-B was retried ONCE and metered into budget.json.retries_by_method.getTransaction (mutant onRetry no-op => 0 => reds; mutant retry=fn() => never retries => 0 => reds)");
  assert.equal(budget.retries_by_method.getTransactionsForAddress, 0, "the retry is attributed PER METHOD (gTfA saw no retry), never a lump sum");
  assert.equal(updBTries, 2, "op-B for updB was attempted twice (429 then ok) — the retry actually fired (mutant retry=fn() => 1 => reds)");
  assert.equal(readCC(od).comparator_verdict.verdict, "equal", "the transient 429 healed in-process => the scan completed => equal (mutant retry=fn() => body_quorum inconclusive => reds)");
});

// ---- C-G2-3: a not_full_pages STOP under a TRANSIENT short page HEALS on resume (the option-d completeness path) ------
test("bell_crosscheck_short_page_transient_token_heals_on_resume — a not_full_pages STOP heals when the same range returns a RAW-full page on resume => equal (C-G2-3, option d)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-g23-s-")), od = mkdtempSync(join(tmpdir(), "bell-g23-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), nfSeries);
  const z = nfFiller(2005, "z"), shortP2 = nfBulk(400, 1009, "c"); // 400 raw < GTFA_PAGE_LIMIT, non-final => a TRANSIENT truncated page
  // RUN 1 (strict): P1 (RAW-full) committed; P2 arrives SHORT + non-final (a transient truncation) => not_full_pages STOP,
  // P2 NOT committed, artifact NOT sealed (scan_complete:false) — so a later resume can still upgrade it.
  // BELL-SHORTPAGE-1: the probe of p3 SEES the truncated remainder ([z]) => the STOP stands (checkpoint-1 C-3: never green
  // by the anchor alone).
  await runMain(b1aArgsStrict(sd, od, 50), b1aDeps(nfStub([{ data: NF_P1, token: "p2" }, { data: shortP2, token: "p3" }, { data: [z], token: null }], z)));
  assert.equal((readSP(od).short_final_page_probe as { probe_empty: boolean }).probe_empty, false, "run-1: the probe saw data after the short page");
  assert.equal(readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8").trim().split("\n").length, 1, "run-1 committed only P1 (the transient short P2 discarded)");
  assert.equal(readCC(od).comparator_verdict.reason, "not_full_pages", "run-1 stopped not_full_pages (never sealed)");
  assert.equal(readCC(od).scan_complete, false, "run-1 is not complete");
  // RUN 2 (strict, resume): the SAME slot range now returns a RAW-FULL page (the truncation healed) then a final page.
  const P2full = [nfFiller(1007, "t0"), nfFiller(1007, "t1"), nfFiller(1007, "t2"), nfUpd, ...nfBulk(GTFA_PAGE_LIMIT - 4, 1009, "b")];
  assert.equal(P2full.length, GTFA_PAGE_LIMIT, "the healed P2 is RAW-full (its k=3 tail dedups to 997 on resume, but the RAW length = the limit => never falsely short, C-B-1 option d)");
  await runMain(b1aArgsStrict(sd, od, 50), b1aDeps(nfStub([{ data: P2full, token: "p3" }, { data: [z], token: null }], z)));
  const v = readCC(od);
  assert.equal(v.scan_complete, true, "the resumed RAW-full page committed => the scan COMPLETED (the transient short page healed)");
  assert.equal(v.comparator_verdict.verdict, "equal", "the healed resume is equal (init carried + update decoded, H5 holds, exhausted)");
});

// ---- ITEM-C (defensive, <= 2 lines): the mixed-mode guard fail-closes on an ABSENT require_full_pages, not only false --
test("bell_crosscheck_require_full_pages_absent_strict_resume_refused — a STRICT resume whose budget.json LACKS require_full_pages is fail-closed (ITEM-C defensive, PROBE4 hole)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-g2c-s-")), od = mkdtempSync(join(tmpdir(), "bell-g2c-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  // RUN 1 LOOSE => a valid resume state (1 ledger page + budget.json). Then STRIP require_full_pages: a legacy pre-field
  // or tampered budget.json where the field is ABSENT (undefined). The base guard tested `=== false`, so `undefined ===
  // false` is false => a STRICT resume would PROCEED onto a ledger of UNKNOWN mode (the PROBE4 hole). The fix tightens it
  // to `!== true`, GATED on a resume being present (existsSync budget.json), so a FRESH strict run is unaffected.
  await runMain(b1aArgs(sd, od, 3), b1aDeps(b1aStub([{ data: [cinitB], paginationToken: "p2" }, { data: [cAB], paginationToken: null }])));
  const bp = join(od, "budget.json");
  const b = JSON.parse(readFileSync(bp, "utf8")) as Record<string, unknown>;
  assert.equal(b.require_full_pages, false, "run-1 (loose) persisted require_full_pages:false");
  delete b.require_full_pages; // the field is now ABSENT (undefined) — the hole
  writeFileSync(bp, JSON.stringify(b));
  assert.equal("require_full_pages" in (JSON.parse(readFileSync(bp, "utf8")) as object), false, "budget.json now LACKS require_full_pages");
  // RUN 2 STRICT, SAME --out => the guard REFUSES (undefined !== true => fail-closed). budget.json stays coherent
  // (calls_used=3 >= 1 page) so the throw is the mode guard, not readPriorCalls; the mutant `!== true`->`=== false`
  // makes undefined PROCEED => this test reds, while the explicit-false mode_guard test stays green (a specific kill).
  await assert.rejects(runMain(b1aArgsStrict(sd, od, 10), b1aDeps(b1aStub([{ data: [cAB, cBB, cCB], paginationToken: null }]))),
    /built loosely/, "a strict resume of a field-less budget.json is refused (mutant `!== true`->`=== false` => undefined proceeds => no throw => reds)");
});

// ================= -b3d-b1b (density sonde + H6 out-of-process projection) — L-b1b-1 / L-b1b-2 =================
// SYNTHETIC (checkpoint-1 C-16): invented mints/signatures/slots, NO on-chain constant. `densityStub` is gTfA-ONLY —
// it THROWS on any non-gTfA method, structurally proving the sonde makes only getTransactionsForAddress calls (so
// calls_by_method.getTransaction stays 0). A genesis probe (asc limit:1, slot.lte only, NO gte) returns the mint's
// oldest body at `genesis`; a point page (asc limit:GTFA_PAGE_LIMIT, slot.gte=G) returns `txAt(G)` bodies spanning
// [G, G + DSTUB_SPAN] => a LOCAL density tx/span the sonde reads back. NEVER a ledger record built here (orchestrator
// constraint -f: no ledger core is pinned, no entry_sha256/ledger_sha256 asserted anywhere in this section).
const DSTUB_SPAN = 10;
function densityStub(byAddress: Record<string, { genesis: number; txAt: (pointSlot: number) => number }>): JsonRpcCall {
  const bodyAt = (slot: number, sig: string): unknown =>
    ({ slot, blockTime: slot * 100, transaction: { signatures: [sig], message: { accountKeys: [], instructions: [] } }, meta: { err: null, innerInstructions: [] } });
  return (_url, method, params) => {
    if (method !== "getTransactionsForAddress") throw new Error("density sonde must call only gTfA, saw: " + method);
    const addr = String((params as unknown[])[0]);
    const cfg = byAddress[addr]!;
    const gte = ((params as unknown[])[1] as { filters?: { slot?: { gte?: number } } }).filters?.slot?.gte;
    if (gte === undefined) return Promise.resolve({ data: [bodyAt(cfg.genesis, addr + "-gen")], paginationToken: null }); // genesis probe
    const tx = cfg.txAt(gte), data: unknown[] = [];
    for (let i = 0; i < tx; i++) data.push(bodyAt(i === tx - 1 && tx > 1 ? gte + DSTUB_SPAN : gte, addr + "-" + String(gte) + "-" + String(i)));
    return Promise.resolve({ data, paginationToken: null });
  };
}
const densitySeries = (sym: string, oracleSlot: number): string =>
  JSON.stringify({ symbol: sym, method: "hybrid-authority-scan", oracle_slot: oracleSlot, oracle_triplet: ORACLE_TRIPLET, events: [] });

// ---- L-b1b-1 / M-b1b-11 / M-b1b-14: the sonde MEASURES genesis + K=8 local densities => N with a [min,max] envelope --
test("bell_density_projects_N_with_interval — the sonde MEASURES genesis + K=8 local densities and trapezoid-integrates to N with a [min,max] envelope (L-b1b-1)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-dn-s-")), od = mkdtempSync(join(tmpdir(), "bell-dn-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), densitySeries("SPYx", 800));
  // genesis 100, oracle 800 => 8 points at 100,200,...,800 (step 100). txAt gives densities [1,2,3,4,3,2,1,0.5] (tx / span 10).
  const txMap: Record<number, number> = { 100: 10, 200: 20, 300: 30, 400: 40, 500: 30, 600: 20, 700: 10, 800: 5 };
  const budgeted = makeBudgetedCall(1000, densityStub({ [SPYX.address]: { genesis: 100, txAt: (s) => txMap[s] ?? 0 } }));
  await runDensityProbeCli(budgeted.call, PROVIDERS, ["SPYx"], sd, od, { requireFullPages: true }, budgeted.calls, budgeted.callsByMethod, 1000);
  const report = JSON.parse(readFileSync(join(od, "sonde-report.json"), "utf8")) as Record<string, { genesis_slot: number; oracle_slot: number; points: unknown[]; n_projected: number; n_min: number; n_max: number; duration_ms: number }>;
  const r = report.SPYx!;
  assert.equal(r.genesis_slot, 100, "genesis is MEASURED from the asc limit:1 probe (M-b1b-11: a date-estimate => != 100 => reds)");
  assert.equal(r.oracle_slot, 800, "the series' committed oracle_slot bounds the span");
  assert.equal(r.points.length, DENSITY_POINTS, "K=8 uniform sample points");
  // trapezoid Σ (d_j+d_{j+1})/2·100 over 7 segments = 1575; min-envelope 1250; max-envelope 1900.
  assert.equal(r.n_projected, 1575, "N_projected = the per-segment trapezoid integral (M-b1b-14: density_max × span => 2800 => reds)");
  assert.equal(r.n_min, 1250, "N_min substitutes the min adjacent density per segment");
  assert.equal(r.n_max, 1900, "N_max substitutes the max adjacent density per segment");
  assert.ok(r.n_min <= r.n_projected && r.n_projected <= r.n_max, "the projection lies within its [min,max] envelope");
  assert.equal(typeof r.duration_ms, "number", "the per-mint sonde duration is reported");
  assert.equal(budgeted.calls(), 9, "1 genesis probe + 8 point pages = 9 gTfA calls (=> <= 36 for the 4 mints)");
});

// ---- GARDE-HELIUS-1b-ii C-G2-3: the density probe reads the prior before persisting require_full_pages -------------
test("bell_density_strict_probe_over_loose_budget_is_fail_closed — a STRICT --rebase-density resuming a LOOSE budget.json is refused (C-G2-3: never silently upgrade require_full_pages false->true, which would defeat the crosscheck :643 mixed-mode guard and let a strict draw trust a loosely-built ledger)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-c23-s-")), od = mkdtempSync(join(tmpdir(), "bell-c23-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), densitySeries("SPYx", 800));
  // A LOOSE prior budget.json (--allow-short-pages => require_full_pages:false), as a loose crosscheck draw would leave.
  writeFileSync(join(od, "budget.json"), JSON.stringify({ calls_used: 2, credits_worst_case: 20, pages: 0,
    calls_by_method: { global: { getTransactionsForAddress: 2, getTransaction: 0 }, by_mint: {} }, retries_by_method: { getTransactionsForAddress: 0, getTransaction: 0 }, require_full_pages: false }));
  const budgeted = makeBudgetedCall(1000, densityStub({ [SPYX.address]: { genesis: 100, txAt: () => 4 } }));
  // a STRICT probe (requireFullPages true) over the loose prior => THROW BEFORE any call (mutant: remove the guard =>
  // the probe silently upgrades false->true, no throw => this reds).
  await assert.rejects(
    runDensityProbeCli(budgeted.call, PROVIDERS, ["SPYx"], sd, od, { requireFullPages: true }, budgeted.calls, budgeted.callsByMethod, 1000),
    /C-G2-3/,
    "a strict density probe cannot upgrade a loose budget.json (C-G2-3 fail-closed)",
  );
  assert.equal(budgeted.calls(), 0, "the guard fires BEFORE any gTfA call (fail-closed at the door, not mid-probe)");
  assert.equal((JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { require_full_pages: boolean }).require_full_pages, false, "the loose mode is UNCHANGED (never upgraded to true by the refused strict probe)");
  // a LOOSE probe over the loose prior is fine (no upgrade); the mode stays false.
  await runDensityProbeCli(budgeted.call, PROVIDERS, ["SPYx"], sd, od, { requireFullPages: false }, budgeted.calls, budgeted.callsByMethod, 1000);
  assert.equal((JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { require_full_pages: boolean }).require_full_pages, false, "the loose probe keeps the loose mode (matched modes never fail-close)");
});

// ---- L-b1b-1 / M-b1b-10: writes sonde-report.json + the SHARED budget.json (require_full_pages:true) but NEVER a ledger -
test("bell_density_writes_budget_never_ledger — the sonde writes sonde-report.json + the shared budget.json (require_full_pages:true, pages:0) but NEVER a ledger/crosscheck artifact (L-b1b-1, M-b1b-10)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-dnl-s-")), od = mkdtempSync(join(tmpdir(), "bell-dnl-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), densitySeries("SPYx", 800));
  // through the REAL CLI (runMain) so the --rebase-density branch + all three gate lines are exercised; default STRICT args.
  const args = ["--rebase-density", "--pools", "SPYx", "--max-calls", "150", "--max-credits", "1500", "--min-interval", "0", "--series-dir", sd, "--out", od];
  await runMain(args, b1aDeps(densityStub({ [SPYX.address]: { genesis: 100, txAt: () => 4 } })));
  assert.ok(existsSync(join(od, "sonde-report.json")), "the sonde report is written");
  assert.ok(existsSync(join(od, "budget.json")), "the shared budget.json is written");
  assert.equal(existsSync(join(od, "ledger-SPYx.jsonl")), false, "NEVER a ledger-<MINT>.jsonl (M-b1b-10: writing one => resumeFromLedger would resume from a sparse point => reds)");
  assert.equal(existsSync(join(od, "crosscheck-SPYx.json")), false, "NEVER a crosscheck-<MINT>.json (the sonde is not the draw)");
  const budget = JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { require_full_pages: boolean; pages: number };
  // TUYAU proof: the sonde's budget.json feeds a subsequent STRICT crosscheck draw resuming on the SAME --out — it must
  // declare require_full_pages:true, else the mixed-mode guard (rebase-crosscheck.ts:566) would refuse the first draw.
  assert.equal(budget.require_full_pages, true, "budget.json declares require_full_pages:true (mixed-mode handoff to the strict draw)");
  assert.equal(budget.pages, 0, "the sonde commits 0 ledger pages");
});

// ---- L-b1b-1 / M-b1b-12: --rebase-density requires --max-credits; --max-pages stays OPTIONAL for it (control) --------
test("bell_density_requires_max_credits — --rebase-density is bounded in the CREDIT unit; --max-pages stays OPTIONAL for it (L-b1b-1, M-b1b-12)", () => {
  assert.throws(() => parseArgs(["--rebase-density", "--pools", "SPYx", "--max-calls", "150"], ["SPYx"]), /--max-credits/,
    "the density sonde requires --max-credits like the crosscheck (M-b1b-12: drop `|| rebaseDensity` from the gate => no throw => reds)");
  // CONTROL (task: the gate is NOT added to --max-pages): --max-credits present + NO --max-pages parses, rebaseDensity true.
  const parsed = parseArgs(["--rebase-density", "--pools", "SPYx", "--max-calls", "150", "--max-credits", "1500"], ["SPYx"]);
  assert.equal(parsed.rebaseDensity, true, "--rebase-density parses (mode flag set)");
  assert.equal(parsed.maxCredits, 1500, "the credit bound is honored; --max-pages was NOT required (unlike --rebase-crosscheck)");
});

// ---- L-b1b-1 / M-b1b-12b: Σ calls_by_method.global == calls_used, CUMULATIVE across a resume (prior + 2 mints) -------
test("bell_density_feeds_global_calls_by_method — Σ calls_by_method.global == calls_used after the sonde, CUMULATIVE across a resume (L-b1b-1, M-b1b-12b)", async () => {
  const m0 = XSTOCKS[0]!, m1 = XSTOCKS[1]!;
  const sd = mkdtempSync(join(tmpdir(), "bell-dfg-s-")), od = mkdtempSync(join(tmpdir(), "bell-dfg-o-"));
  writeFileSync(join(sd, `rebase-${m0.symbol}.json`), densitySeries(m0.symbol, 800));
  writeFileSync(join(sd, `rebase-${m1.symbol}.json`), densitySeries(m1.symbol, 800));
  // a PRIOR shared budget.json (an earlier sonde invocation): 4 cumulative gTfA, 0 ledger pages. The resume MUST seed
  // calls_by_method.global from it (readPriorByMethod) — this is why `|| rebaseDensity` also gates priorByMethod.
  writeFileSync(join(od, "budget.json"), JSON.stringify({ calls_used: 4, credits_worst_case: 40, pages: 0,
    calls_by_method: { global: { getTransactionsForAddress: 4, getTransaction: 0 }, by_mint: {} }, retries_by_method: { getTransactionsForAddress: 0, getTransaction: 0 }, require_full_pages: true }));
  const stub = densityStub({ [m0.address]: { genesis: 100, txAt: () => 3 }, [m1.address]: { genesis: 100, txAt: () => 3 } });
  await runMain(["--rebase-density", "--pools", `${m0.symbol},${m1.symbol}`, "--max-calls", "150", "--max-credits", "1500", "--min-interval", "0", "--series-dir", sd, "--out", od], b1aDeps(stub));
  const budget = JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { calls_used: number; calls_by_method: { global: Record<string, number> } };
  assert.equal(budget.calls_used, 22, "prior 4 + 2 mints × 9 gTfA = 22 cumulative calls");
  assert.equal(Object.values(budget.calls_by_method.global).reduce((a, b) => a + b, 0), 22,
    "Σ calls_by_method.global == calls_used (M-b1b-12b: a LOCAL per-mint counter => 9 != 22 => reds; un-gating priorByMethod => 18 != 22 => reds)");
  assert.equal(budget.calls_by_method.global.getTransaction, 0, "the sonde makes ONLY gTfA calls (the stub throws otherwise) => getTransaction stays 0");
});

// ---- L-b1b (C-V-1): the EMITTED sonde-report.json points[] feed projectPagesAtFraction end-to-end via the real CLI ----
test("bell_density_report_points_feed_projection — points[] EMITTED by runMain --rebase-density feed projectPagesAtFraction (real artifact, not a hand-built model; C-V-1)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-dpp-s-")), od = mkdtempSync(join(tmpdir(), "bell-dpp-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), densitySeries("SPYx", 800));
  const txMap: Record<number, number> = { 100: 10, 200: 20, 300: 30, 400: 40, 500: 30, 600: 20, 700: 10, 800: 5 }; // densities [1,2,3,4,3,2,1,0.5], N=1575
  const args = ["--rebase-density", "--pools", "SPYx", "--max-calls", "150", "--max-credits", "1500", "--min-interval", "0", "--series-dir", sd, "--out", od];
  await runMain(args, b1aDeps(densityStub({ [SPYX.address]: { genesis: 100, txAt: (s) => txMap[s] ?? 0 } })));
  // read the artifact the CLI WROTE (CA-11 durci: never a hand-built model) and take its EMITTED points[] {slot,tx,span,density}.
  const report = JSON.parse(readFileSync(join(od, "sonde-report.json"), "utf8")) as Record<string, { genesis_slot: number; oracle_slot: number; points: { slot: number; tx: number; span: number; density: number }[]; n_projected: number }>;
  const r = report.SPYx!;
  // feed the EMITTED points to the pure H6 projection; at f=0.5 with pagesSoFar 0 the linear term is 0, so the returned
  // value is the density term = trapezoid(emitted points)/GTFA_PAGE_LIMIT = the sonde's own n_projected/GTFA_PAGE_LIMIT.
  const proj = projectPagesAtFraction(450, r.genesis_slot, r.oracle_slot, 0, r.points);
  assert.equal(proj, r.n_projected / GTFA_PAGE_LIMIT, "the EMITTED points[] feed projectPagesAtFraction from the real artifact (M-b1b-15: points[] under another key => r.points undefined => reds)");
  assert.equal(proj, 1.575, "the concrete pipe value on the fixture: n_projected 1575 / GTFA_PAGE_LIMIT 1000 = 1.575");
});

// ---- L-b1b (C-V-3): a BudgetExceededError mid-mint still persists the interrupted mint's by_mint slice (per-mint finally) --
test("bell_density_by_mint_survives_budget_exhaustion — a BudgetExceededError mid-mint persists the mint's by_mint slice via the per-mint finally (C-V-3)", async () => {
  const sd = mkdtempSync(join(tmpdir(), "bell-dbe-s-")), od = mkdtempSync(join(tmpdir(), "bell-dbe-o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), densitySeries("SPYx", 800));
  // --max-calls 3: genesis(1) + point0(2) + point1(3) succeed; point2 is the 4th call => BudgetExceededError mid-points.
  const args = ["--rebase-density", "--pools", "SPYx", "--max-calls", "3", "--max-credits", "1500", "--min-interval", "0", "--series-dir", sd, "--out", od];
  await assert.rejects(runMain(args, b1aDeps(densityStub({ [SPYX.address]: { genesis: 100, txAt: () => 2 } }))), BudgetExceededError, "the budget stop is fatal (mid-mint)");
  const budget = JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { calls_used: number; calls_by_method: { global: Record<string, number>; by_mint: Record<string, Record<string, number>> } };
  assert.equal(budget.calls_used, 3, "3 calls consumed before the stop");
  assert.equal(Object.values(budget.calls_by_method.global).reduce((a, b) => a + b, 0), 3, "global == calls_used (always exact via the budgeted layer, independent of the finally)");
  assert.equal(budget.calls_by_method.by_mint.SPYx?.getTransactionsForAddress, 3, "the interrupted mint's by_mint slice is preserved by the per-mint finally (M-b1b-16: drop setSlice from the finally => SPYx absent => reds)");
});

// ---- L-b1b-2 / M-b1b-13: projectPagesAtFraction = max(linear, density); fail-closed on invalid input ----------------
test("bell_h6_projection_pure_function — projectPagesAtFraction = max(linear, density); density = trapezoid(model)/GTFA_PAGE_LIMIT; fail-closed on invalid input (L-b1b-2, M-b1b-13)", () => {
  const model = [{ slot: 0, density: 2 }, { slot: 1000, density: 2 }]; // trapezoid (2+2)/2·1000 = 2000 tx => 2000/GTFA_PAGE_LIMIT = 2 pages
  // (A) linear dominates: fraction 0.05, pagesSoFar 3 => linear 60 > density 2 => 60.
  assert.equal(projectPagesAtFraction(50, 0, 1000, 3, model), 60, "linear = pagesSoFar/fraction dominates (M-b1b-13: min => 2 => reds)");
  // (B) density dominates: fraction 0.5, pagesSoFar 0 => linear 0 < density 2 => 2.
  assert.equal(projectPagesAtFraction(500, 0, 1000, 0, model), 2, "density = trapezoid/GTFA_PAGE_LIMIT dominates (M-b1b-13: min => 0 => reds)");
  // fail-closed on invalid input (THROW, never a silent 0):
  assert.throws(() => projectPagesAtFraction(500, 1000, 1000, 1, model), /span <= 0/, "oracle == genesis => span 0 => throw");
  assert.throws(() => projectPagesAtFraction(0, 0, 1000, 1, model), /fraction <= 0/, "slot_hi == genesis => fraction 0 => throw");
  assert.throws(() => projectPagesAtFraction(50, 0, 1000, 1, [{ slot: 0, density: 1 }]), /< 2 points/, "a < 2-point model cannot integrate => throw");
  assert.throws(() => projectPagesAtFraction(50, 0, 1000, 1, [{ slot: 1000, density: 1 }, { slot: 0, density: 2 }]), /not strictly sorted/, "unsorted points => throw");
});

// ---- L-b1b-2 / M-b1b-14: the density term is the per-segment trapezoid integral, NEVER density_max × span -----------
test("bell_h6_projection_rejects_max_times_span — the density term is the per-segment trapezoid integral, NEVER density_max × span (L-b1b-2, M-b1b-14)", () => {
  // a model whose density spikes only at the end: the per-segment trapezoid is SMALL; density_max × span over-projects.
  // With linear 0 (pagesSoFar 0), the density term is load-bearing => the mutant is observable.
  const model = [{ slot: 0, density: 0 }, { slot: 500, density: 0 }, { slot: 1000, density: 12 }];
  // trapezoid = (0+0)/2·500 + (0+12)/2·500 = 3000 tx => 3 pages. density_max × span = 12 × 1000 = 12000 => 12 pages.
  assert.equal(projectPagesAtFraction(500, 0, 1000, 0, model), 3,
    "the projection uses the trapezoid integral (3 pages), NEVER density_max × span (M-b1b-14: 12 pages => reds)");
});

// ==== GARDE-HELIUS-1b-ii: the crosscheck GUARDED end-to-end (real openGuardedClient, ONLY globalThis.fetch stubbed) ====
// The b1a fixtures are served over the guard's transport: gTfA -> helius (paid, 10 cr), getTransaction -> the KEYLESS
// solana-foundation (otherOp, 0 cr). Proves credits-derived-from-the-ledger (IT-3) and resume without loss after STOP (125).
const CAPS_1BII = ["getSignaturesForAddress", "getTransaction", "getAccountInfo", "getTransactionsForAddress"].map((m) => `${m}=100000000`).join(",");
const attemptedOf = (path: string, method?: string): Array<{ method: string; credits_derived: number }> =>
  (existsSync(path) ? readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.includes('"outcome":"attempted"')).map((l) => {
    const o = JSON.parse(l) as { by_op_method: Record<string, number>; credits_derived: number };
    const key = Object.keys(o.by_op_method ?? {})[0] ?? ""; // "<op>|<method>"
    return { method: key.split("|")[1] ?? "", credits_derived: o.credits_derived };
  }) : []).filter((l) => method === undefined || l.method === method);
const hasRefused = (path: string): boolean => existsSync(path) && readFileSync(path, "utf8").includes('"outcome":"refused"');
/** runMain --rebase-crosscheck via the REAL guard; callStub served over globalThis.fetch (no fake client/transport). */
async function runGuardXc(argv: readonly string[], callStub: JsonRpcCall, ledgerDir: string): Promise<void> {
  const real = globalThis.fetch;
  globalThis.fetch = (async (_i: string | URL, init?: RequestInit): Promise<Response> => {
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params?: unknown[] };
    const result = await callStub("op", req.method, req.params ?? []);
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof globalThis.fetch;
  try {
    await runMain([...argv, "--ledger-dir", ledgerDir, "--cycle", "cyc", "--operators", "helius,solana-foundation",
      "--floor", "helius=0,solana-foundation=0", "--method-caps", CAPS_1BII], { databentoGet: noDbB, polygonGet: noPolyB, env: { BELL_SOLANA_RPC: "https://helius.invalid" }, nowMs: 50000 });
  } finally { globalThis.fetch = real; }
}

// IT-3 — crosscheck_credits_derived_from_ledger: the guarded crosscheck's credits_recomputed == Σ helius credits_derived
// of the CYCLE LEDGER (gTfA×10; getTransaction is drawn on the KEYLESS solana-foundation => 0 helius credit), NOT the old
// local recompute gTfA×10 + getTx×1. Mutant "credits recomputed locally" (restore g.gTfA*10 + g.getTx*1) => reds.
test("crosscheck_credits_derived_from_ledger", async () => {
  const dir = mkdtempSync(join(tmpdir(), "bell-it3-"));
  const sd = mkdtempSync(join(tmpdir(), "bell-it3s-")), od = mkdtempSync(join(tmpdir(), "bell-it3o-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  await runGuardXc(b1aArgs(sd, od, 50), b1aStub([{ data: [cinitB], paginationToken: "p2" }, { data: [cAB], paginationToken: "p3" }, { data: [cBB, cCB], paginationToken: null }]), dir);
  const cc = readCC(od);
  assert.equal(cc.comparator_verdict.verdict, "equal", "the guarded crosscheck completed (verdict equal)");
  const heliusAtt = attemptedOf(join(dir, "cyc", "helius.jsonl"));
  const ledgerHelius = heliusAtt.reduce((a, l) => a + l.credits_derived, 0);
  const gtfa = heliusAtt.filter((l) => l.method === "getTransactionsForAddress").length;
  assert.ok(gtfa > 0 && ledgerHelius === gtfa * 10, "helius ledger credits = gTfA×10 (getTransaction on the keyless solana-foundation => 0 helius credit)");
  assert.equal(cc.credits_recomputed, ledgerHelius, "credits_recomputed == Σ helius credits_derived of the cycle ledger (CREDITS DERIVED FROM THE LEDGER)");
  const getTx = attemptedOf(join(dir, "cyc", "solana-foundation.jsonl"), "getTransaction").length;
  assert.ok(getTx > 0, "getTransaction WAS drawn (on the keyless solana-foundation)");
  assert.notEqual(cc.credits_recomputed, gtfa * 10 + getTx, "credits_recomputed is NOT the old local recompute gTfA×10 + getTx×1 (the mutant restoring it => this value => reds)");
});

// Resume (decision 125) — resume without loss after STOP: a guarded crosscheck STOPs on the helius run credit cap
// (--max-credits => runCaps.helius), and a resume on the SAME cycle/ledger-dir/out completes to `equal` WITHOUT losing
// the prior — the STOP is durably ledgered (helius.jsonl attempted + refused), the run-ledger (ledger-<MINT>.jsonl)
// persists and RESUMES (grows, never resets), and the cycle helius.jsonl is APPENDED across runs (frozen prior at run-2
// open includes run-1's spend). Mutant "resume resets the budget / prior not preserved" => reds.
test("bell_crosscheck_guarded_resume_without_loss_after_budget_stop", async () => {
  const dir = mkdtempSync(join(tmpdir(), "bell-rep-"));
  const sd = mkdtempSync(join(tmpdir(), "bell-reps-")), od = mkdtempSync(join(tmpdir(), "bell-repo-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  const lf = join(od, "ledger-SPYx.jsonl"), hf = join(dir, "cyc", "helius.jsonl");
  // RUN 1: --max-credits 15 => helius runCap 15 => asc gTfA p1 (10) OK, asc gTfA p2 (10+10=20>15) REFUSED => 1 committed
  // page, STOP (the desc end-anchor is never reached — budget_exhausted returns before it).
  await runGuardXc(b1aArgs(sd, od, 50, 15), b1aStub([{ data: [cinitB], paginationToken: "p2" }, { data: [cAB], paginationToken: "p3" }, { data: [cBB, cCB], paginationToken: null }]), dir);
  const run1Pages = readFileSync(lf, "utf8").trim().split("\n").filter((l) => l.trim() !== "").length;
  // EXACTLY 1: the gTfA p2 refusal is a CANONICAL BudgetExceededError re-thrown FIRST by withRetry/quorum2 (C-1), so the
  // scan STOPs — never retried 4x nor benched as a fault (a swallow would commit p2/p3 => run1Pages > 1). This is C-1
  // proven ON THE CROSSCHECK PATH (the same fail-open class checkpoint-1 C-1 warned about).
  assert.equal(run1Pages, 1, "run-1 committed EXACTLY 1 atomic record before the STOP (the budget refusal stopped the scan; a C-1 swallow would commit more pages)");
  assert.ok(hasRefused(hf), "the STOP is durably LEDGERED as a refused line in the cycle helius.jsonl (never a silent truncation)");
  const run1HeliusAtt = attemptedOf(hf).length;
  assert.ok(run1HeliusAtt >= 1, "run-1 wrote >= 1 helius attempted line (the spent gTfA)");
  assert.equal(existsSync(join(dir, "cyc", "helius.lock")), false, "run-1's finally released the helius lock (resume can re-acquire)");
  // RUN 2: resume on the SAME cycle/ledger-dir/out, --max-credits 500 => completes. The resume stub serves the REMAINING
  // pages (calque the offline resume test): the scanned page-1 is NOT re-fetched, the scan finishes onto the chain.
  await runGuardXc(b1aArgs(sd, od, 50, 500), b1aStub([{ data: [cAB, cBB, cCB], paginationToken: null }]), dir);
  assert.equal(readCC(od).comparator_verdict.verdict, "equal", "the resume COMPLETED onto the re-derived chain => equal (resume without loss)");
  assert.ok(readFileSync(lf, "utf8").trim().split("\n").filter((l) => l.trim() !== "").length > run1Pages, "the run-ledger GREW across the resume (never reset: the prior pages persisted, only the remainder was scanned)");
  const run2HeliusAtt = attemptedOf(hf).length;
  assert.ok(run2HeliusAtt > run1HeliusAtt, "the cycle helius.jsonl was APPENDED across runs (run-2's lines follow run-1's => the frozen prior at run-2 open included run-1's spend; a reset would drop run-1's lines => reds)");
});

// ==== BELL-RETRY-1: a NonJsonBody@200 (a REAL gateway HTML page at HTTP 200) is RETRIED on the guarded crosscheck ====
// A-8 real-shape integration (real openGuardedClient, ONLY globalThis.fetch stubbed -- no fake client/transport): on the
// FIRST asc gTfA the (paid) helius endpoint returns a REAL gateway error page -- an HTTP 200 response whose BODY is HTML
// -- the exact TSLAx fault (journal de course 14:21 UTC). The transport's JSON.parse fails => TransportError name
// "NonJsonBody", code 200 (transport.ts:241). Before this lot isTransient did not classify it transient => withRetry
// rejected AT ONCE => the per-mint scan threw => runMain REJECTED (rebase-crosscheck.ts:685-704 has a finally but NO
// catch = the STOP). After the fix the bounded retry (RETRY_TRIES=6, backoff 400*(i+1) ms) re-fetches (JSON), the scan
// completes to `equal`, and the retry is METERED into budget.json retries_by_method.getTransactionsForAddress (the field
// that read 0 on TSLAx). Mutant (mutants.mjs) "NonJsonBody removed from isTransient" => runMain rejects (the exact STOP)
// => this reds.
const GATEWAY_HTML_200 = "<!DOCTYPE html>\n<html>\n<head><title>502 Bad Gateway</title></head>\n<body bgcolor=\"white\">\n<center><h1>502 Bad Gateway</h1></center>\n<hr><center>cloudflare</center>\n</body>\n</html>\n";
/** runMain --rebase-crosscheck via the REAL guard, but the FIRST asc gTfA POST returns a real gateway HTML page at HTTP
 *  200 (=> NonJsonBody@200 in the transport); every other fetch (the retry, the desc anchor, getTransaction) is served
 *  JSON from callStub. The HTML attempt does NOT consult callStub, so b1aStub's asc page pointer is untouched and the
 *  retry gets page 1 (b1aStub advances by call, :592). */
async function runGuardXcHtmlFirstGtfa(argv: readonly string[], callStub: JsonRpcCall, ledgerDir: string): Promise<void> {
  const real = globalThis.fetch;
  let htmlServed = false;
  globalThis.fetch = (async (_i: string | URL, init?: RequestInit): Promise<Response> => {
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params?: unknown[] };
    const opts1 = (req.params ?? [])[1] as { sortOrder?: string } | undefined;
    if (!htmlServed && req.method === "getTransactionsForAddress" && opts1?.sortOrder === "asc") {
      htmlServed = true; // ONE gateway hiccup on the first paid asc page: HTTP 200 + an HTML body (the real shape, A-8)
      return new Response(GATEWAY_HTML_200, { status: 200, headers: { "content-type": "text/html" } });
    }
    const result = await callStub("op", req.method, req.params ?? []);
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof globalThis.fetch;
  try {
    await runMain([...argv, "--ledger-dir", ledgerDir, "--cycle", "cyc", "--operators", "helius,solana-foundation",
      "--floor", "helius=0,solana-foundation=0", "--method-caps", CAPS_1BII], { databentoGet: noDbB, polygonGet: noPolyB, env: { BELL_SOLANA_RPC: "https://helius.invalid" }, nowMs: 50000 });
  } finally { globalThis.fetch = real; }
}

test("bell_crosscheck_guarded_nonjsonbody_200_gateway_html_is_retried_and_metered", async () => {
  const dir = mkdtempSync(join(tmpdir(), "bell-njb-"));
  const sd = mkdtempSync(join(tmpdir(), "bell-njbs-")), od = mkdtempSync(join(tmpdir(), "bell-njbo-"));
  writeFileSync(join(sd, "rebase-SPYx.json"), b1aSeries([eInitB, eAB, eBB, eCB]));
  await runGuardXcHtmlFirstGtfa(b1aArgs(sd, od, 50), b1aStub([{ data: [cinitB], paginationToken: "p2" }, { data: [cAB], paginationToken: "p3" }, { data: [cBB, cCB], paginationToken: null }]), dir);
  // the guarded crosscheck RECOVERED from the NonJsonBody@200 (a real gateway HTML page) via the bounded retry, exactly
  // as the TSLAx draw could not. Mutant "NonJsonBody removed" => runMain REJECTS at the await above (the exact STOP) => reds.
  assert.equal(readCC(od).comparator_verdict.verdict, "equal", "the guarded crosscheck completed to `equal` AFTER a real NonJsonBody@200 (gateway HTML) was retried (mutant 'NonJsonBody removed from isTransient' => the run rejects = the exact TSLAx STOP => reds)");
  const budget = JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { retries_by_method?: Record<string, number> };
  assert.ok((budget.retries_by_method?.getTransactionsForAddress ?? 0) >= 1, "the retry was METERED into budget.json retries_by_method.getTransactionsForAddress (the field that read 0 when TSLAx STOPped)");
});

// ================= BELL-SHORTPAGE-1 (decision 135(2); checkpoint-1 C-1..C-5; ruling C-6) ================================
// Measured (docs/CHANTIERS.md, decision 135): Helius emitted a pagination token on TSLAx's LAST page (short) and the next
// page was empty. Rule under require_full_pages: ONE probe of that token -> ONLY if RAW-empty, the C-8 end anchor -> ONLY
// if equal, commit it as the final page; any other outcome STOPs not_full_pages, uncommitted. SYNTHETIC literals only
// (anti-close: nothing of the real page 8 784 is copied). SP2 = the TSLAx SHAPE on the nf fixtures (RAW 180 < limit).
// spStub wraps nfStub (the probe is the next asc page it serves) and RECORDS each asc request, so the probe's request is
// asserted, never assumed. Named mutants + byIntended attribution: the lot's G1 rendu (mutants.mjs, TAP reporter).
const SP2 = [nfUpd, ...nfBulk(179, 1009, "s")]; // RAW 180: nfUpd@1008 + fillers @1009..1187 (last "s178")
const SP2_LAST = SP2[SP2.length - 1]!;
type SpArtifact = CrosscheckArtifact & { n_exact: number; ledger_sha256: string; events: unknown[]; short_final_page_probe: unknown };
const readSP = (od: string): SpArtifact => JSON.parse(readFileSync(join(od, "crosscheck-SPYx.json"), "utf8")) as SpArtifact;
const reportProbe = (od: string): unknown =>
  (JSON.parse(readFileSync(join(od, "crosscheck-report.json"), "utf8")) as { per_mint: Record<string, { short_final_page_probe?: unknown }> }).per_mint.SPYx?.short_final_page_probe;
const spLedger = (od: string): LedgerRecord[] => readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l) as LedgerRecord);
const probeOf = (page: number, raw_len: number, probe_empty: boolean, end_anchor_ok: boolean, committed: boolean): Record<string, unknown> =>
  ({ page, raw_len, probe_calls: 1, probe_empty, end_anchor_ok, committed });
const sdNf = (): string => { const sd = mkdtempSync(join(tmpdir(), "bell-sp-s-")); writeFileSync(join(sd, "rebase-SPYx.json"), nfSeries); return sd; };
const slotOf = (req: Record<string, unknown> | undefined): { lte?: number; gte?: number } =>
  (req?.filters as { slot?: { lte?: number; gte?: number } } | undefined)?.slot ?? {};
function spStub(ascPages: Array<{ data: unknown[]; token: string | null }>, descBody: unknown, seen: Array<Record<string, unknown>> = []): JsonRpcCall {
  const inner = nfStub(ascPages, descBody);
  return (u, method, params) => {
    const p = (params as unknown[])[1] as Record<string, unknown> | undefined;
    if (method === "getTransactionsForAddress" && p?.sortOrder === "asc") seen.push(p);
    return inner(u, method, params);
  };
}

test("bell_shortpage_probe_empty_and_anchor_equal_commits_the_final_page - strict runMain: P1 full+token, SP2 short (RAW 180)+token, the probe is EMPTY (it still carries a token), desc = SP2's last => SP2 committed as the final page, complete, equal; exactly ONE probe + ONE anchor (checkpoint-1 C-1, C-3 a)", async () => {
  const sd = sdNf(), od = mkdtempSync(join(tmpdir(), "bell-sp-a-o-")), seen: Array<Record<string, unknown>> = [];
  await runMain(b1aArgsStrict(sd, od, 50), b1aDeps(spStub([{ data: NF_P1, token: "p2" }, { data: SP2, token: "p3" }, { data: [], token: "p4" }], SP2_LAST, seen)));
  const cc = readSP(od), recs = spLedger(od);
  assert.equal(cc.scan_complete, true, "the probe-proven short last page completes the scan (mutant: probe removed => not_full_pages => reds)");
  assert.equal(cc.comparator_verdict.verdict, "equal", "full-mint (init + update) == the committed series");
  assert.equal(cc.n_exact, GTFA_PAGE_LIMIT + SP2.length, "N = 1000 + 180: the short page is counted ONCE (mutant: exhausted without commit => 1000 => reds)");
  assert.equal(cc.pages, 2, "pages = ledger.length = 2");
  assert.ok(recs.length === 2 && recs[1]!.tx_count === SP2.length && recs[1]!.last_sig === "s178" && recs[1]!.prev_entry_sha256 === recs[0]!.entry_sha256, "SP2 is the 2nd chained record, ending on its last tx");
  assert.deepEqual(cc.calls_by_method, { getTransactionsForAddress: 4, getTransaction: 2 }, "EXACTLY 2 pages + 1 probe + 1 anchor (mutants: second probe / anchor replayed => 5; probe made without a call => 3 => reds)");
  assert.equal(seen.length, 3, "3 asc requests: P1, SP2, the probe");
  assert.ok(slotOf(seen[2]).lte === 3000 && seen[2]!.limit === GTFA_PAGE_LIMIT && seen[2]!.sortOrder === "asc", "probe: slot.lte = oracle_slot, limit = GTFA_PAGE_LIMIT, asc");
  assert.deepEqual(seen[2], { ...seen[1], paginationToken: "p3" }, "the probe replays SP2's request with SP2's token (mutants: no token / no slot.lte => reds)");
  assert.deepEqual(cc.short_final_page_probe, probeOf(2, SP2.length, true, true, true), "provenance in crosscheck-SPYx.json (mutant: key written null => reds)");
  assert.deepEqual(reportProbe(od), probeOf(2, SP2.length, true, true, true), "the SAME provenance in crosscheck-report.json per_mint (mutant: report key null => reds)");
});

test("bell_shortpage_probe_nonempty_stops_uncommitted_even_if_anchor_agrees - resumed strict run (the TSLAx r4 geometry): the first page is short (RAW 183 incl. 3 deduped boundary txs) + token, the probe returns 1 tx => STOP not_full_pages, ledger BYTE-identical, N unchanged, NO anchor asked - although the desc anchor would agree (checkpoint-1 C-3 b)", async () => {
  const sd = sdNf(), od = mkdtempSync(join(tmpdir(), "bell-sp-b-o-"));
  await runMain(b1aArgsStrict(sd, od, 2), b1aDeps(spStub([{ data: NF_P1, token: "p2" }], SP2_LAST))); // P1 committed; the SP2 fetch hits the budget
  const before = readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8"), resumed = [...NF_P1.slice(-3), ...SP2];
  await runMain(b1aArgsStrict(sd, od, 50), b1aDeps(spStub([{ data: resumed, token: "p3" }, { data: [nfFiller(1188, "x0")], token: null }], SP2_LAST)));
  const cc = readSP(od);
  assert.equal(cc.comparator_verdict.reason, "not_full_pages", "data follows the short page => STOP (mutants: non-empty probe taken as empty / probe skipped, anchor alone => complete => reds)");
  assert.equal(readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8"), before, "the ledger is BYTE-identical: the short page never reaches disk (mutant: commit before the probe => reds)");
  assert.ok(cc.n_exact === GTFA_PAGE_LIMIT && cc.pages === 1 && cc.events.length === 1, "N / pages / events = the committed P1 only (mutant: probe data counted into N => 1001 => reds)");
  assert.deepEqual(cc.short_final_page_probe, probeOf(2, resumed.length, false, false, false), "the STOP is traced as probe_empty:false (never mute)");
  assert.deepEqual(cc.calls_by_method, { getTransactionsForAddress: 3, getTransaction: 2 }, "cumulative: run-1 P1 + run-2 page + probe; no anchor after a non-empty probe");
});

test("bell_shortpage_probe_empty_but_anchor_differs_commits_nothing - strict: the probe is EMPTY but the desc anchor's newest sig is NOT SP2's last => nothing committed, NOT exhausted, not_full_pages; the anchor is asked ONCE (checkpoint-1 C-1, C-3 c)", async () => {
  const sd = sdNf(), od = mkdtempSync(join(tmpdir(), "bell-sp-c-o-"));
  await runMain(b1aArgsStrict(sd, od, 50), b1aDeps(spStub([{ data: NF_P1, token: "p2" }, { data: SP2, token: "p3" }, { data: [], token: null }], nfFiller(2005, "z"))));
  const cc = readSP(od);
  assert.ok(cc.scan_complete === false && cc.comparator_verdict.reason === "not_full_pages", "an unequal anchor refuses the page: not_full_pages (never end_anchor_mismatch after a commit)");
  assert.ok(spLedger(od).length === 1 && cc.n_exact === GTFA_PAGE_LIMIT && cc.pages === 1, "SP2 NOT committed (mutant: commit before the anchor => 2 records, N 1180 => reds)");
  assert.deepEqual(cc.short_final_page_probe, probeOf(2, SP2.length, true, false, false), "traced: probe empty, anchor unequal, nothing committed");
  assert.deepEqual(cc.calls_by_method, { getTransactionsForAddress: 4, getTransaction: 2 }, "P1, SP2, probe, ONE anchor (not asked again after the loop)");
});

test("bell_shortpage_resume_then_short_final_page_then_idempotent_reverification - (1) partial ledger (budget stop after P1); (2) resume: the first page is short (RAW 183 incl. 3 deduped boundary txs) + token, probe empty, anchor equal => committed, complete; (3) terminal re-verification: RAW 1 deduped to 0 + token => probe empty, anchor equal, NOTHING committed: N, pages, ledger_sha256, ledger bytes UNCHANGED (checkpoint-1 C-3 d; mission e)", async () => {
  const sd = sdNf(), od = mkdtempSync(join(tmpdir(), "bell-sp-d-o-")), s2: Array<Record<string, unknown>> = [], s3: Array<Record<string, unknown>> = [];
  await runMain(b1aArgsStrict(sd, od, 2), b1aDeps(spStub([{ data: NF_P1, token: "p2" }], SP2_LAST)));
  const resumed = [...NF_P1.slice(-3), ...SP2];
  await runMain(b1aArgsStrict(sd, od, 50), b1aDeps(spStub([{ data: resumed, token: "p3" }, { data: [], token: null }], SP2_LAST, s2)));
  const a2 = readSP(od), ledger2 = readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8");
  assert.ok(a2.scan_complete && a2.comparator_verdict.verdict === "equal" && a2.n_exact === GTFA_PAGE_LIMIT + SP2.length && a2.pages === 2, "the resumed short last page is committed once (180 after the dedup) => complete, equal");
  assert.deepEqual(s2[1], { ...s2[0], paginationToken: "p3" }, "the probe replays the resumed request: SAME filters.slot (lte AND gte) + the token");
  assert.equal(slotOf(s2[1]).gte, 1007, "the probe carries the resume gte = P1's slot_hi (mutant: probe without gte => reds)");
  assert.deepEqual(a2.short_final_page_probe, probeOf(2, resumed.length, true, true, true), "raw_len is the RAW length 183 (before the dedup)");
  await runMain(b1aArgsStrict(sd, od, 50), b1aDeps(spStub([{ data: [SP2_LAST], token: "q1" }], SP2_LAST, s3)));
  const a3 = readSP(od);
  assert.ok(a3.scan_complete && a3.comparator_verdict.verdict === "equal", "the terminal re-verification stays complete / equal");
  assert.ok(a3.n_exact === a2.n_exact && a3.pages === a2.pages && a3.ledger_sha256 === a2.ledger_sha256, "N, pages, ledger_sha256 UNCHANGED (the probe never feeds N / pages)");
  assert.equal(readFileSync(join(od, "ledger-SPYx.jsonl"), "utf8"), ledger2, "the ledger file is BYTE-identical (0 new tx => no record)");
  assert.equal(slotOf(s3[1]).gte, 1187, "the probe carries the NEW resume gte = SP2's slot_hi");
  assert.deepEqual(a3.short_final_page_probe, probeOf(3, 1, true, true, false), "RAW 1 (deduped to 0), committed:false (mutants: raw_len post-dedup / committed forced => reds)");
});

test("bell_shortpage_allow_short_pages_never_probes - --allow-short-pages: a short page + token is committed as before and the loop reads the next page itself; NO probe, provenance null (checkpoint-1 C-3 e; mission f)", async () => {
  const sd = sdNf(), od = mkdtempSync(join(tmpdir(), "bell-sp-e-o-")), x0 = nfFiller(1188, "x0");
  await runMain(b1aArgs(sd, od, 50), b1aDeps(spStub([{ data: NF_P1, token: "p2" }, { data: SP2, token: "p3" }, { data: [x0], token: null }], x0)));
  const cc = readSP(od);
  assert.ok(cc.scan_complete && spLedger(od).length === 3 && cc.n_exact === GTFA_PAGE_LIMIT + SP2.length + 1, "loose: SP2 AND the page after it are committed (mutant: probe also under --allow-short-pages => sees x0 => not_full_pages => reds)");
  assert.ok(cc.short_final_page_probe === null && reportProbe(od) === null, "no probe => provenance null in the artifact AND the report");
  assert.deepEqual(cc.calls_by_method, { getTransactionsForAddress: 4, getTransaction: 2 }, "P1, SP2, the x0 page, the anchor: the loose loop's own next page, no extra probe");
});

test("bell_shortpage_budget_bites_during_probe_or_anchor_commits_nothing - a BudgetExceededError on the probe (max-calls 4) OR on the probe-path anchor (max-calls 5) => budget_exhausted, SP2 NOT committed, no provenance (checkpoint-1 C-1, C-3 f; mission d)", async () => {
  for (const maxCalls of [4, 5]) { // P1, opB init, SP2, opB upd = 4 calls; the 5th = the probe; the 6th = the anchor
    const sd = sdNf(), od = mkdtempSync(join(tmpdir(), "bell-sp-f-o-"));
    await runMain(b1aArgsStrict(sd, od, maxCalls), b1aDeps(spStub([{ data: NF_P1, token: "p2" }, { data: SP2, token: "p3" }, { data: [], token: null }], SP2_LAST)));
    const cc = readSP(od), b = JSON.parse(readFileSync(join(od, "budget.json"), "utf8")) as { calls_used: number };
    assert.equal(cc.comparator_verdict.reason, "budget_exhausted", `max-calls ${String(maxCalls)}: budget_exhausted (never swallowed)`);
    assert.ok(spLedger(od).length === 1 && cc.n_exact === GTFA_PAGE_LIMIT, `max-calls ${String(maxCalls)}: SP2 NOT committed (mutants: commit before the probe / before the anchor => reds)`);
    assert.ok(cc.short_final_page_probe === null && b.calls_used === maxCalls, `max-calls ${String(maxCalls)}: no provenance; calls_used = the cap (the refused call is not counted)`);
  }
});

test("bell_shortpage_probe_metered_on_the_guarded_cycle_ledger - THROUGH the real guard (only globalThis.fetch stubbed): the probe is ONE attempted helius gTfA line (+10 cr): 4 lines, credits_recomputed 40; a tokenless short last page (Helius-conformant control) makes NO probe: 3 lines, 30 cr, provenance null (D-3; mission c)", async () => {
  const run = async (token: string | null): Promise<{ cc: SpArtifact; gtfa: number; credits: number }> => {
    const dir = mkdtempSync(join(tmpdir(), "bell-sp-g-")), sd = sdNf(), od = mkdtempSync(join(tmpdir(), "bell-sp-g-o-"));
    await runGuardXc(b1aArgsStrict(sd, od, 50), spStub([{ data: NF_P1, token: "p2" }, { data: SP2, token }, { data: [], token: null }], SP2_LAST), dir);
    const att = attemptedOf(join(dir, "cyc", "helius.jsonl"));
    return { cc: readSP(od), gtfa: att.filter((l) => l.method === "getTransactionsForAddress").length, credits: att.reduce((a, l) => a + l.credits_derived, 0) };
  };
  const probed = await run("p3"), control = await run(null);
  assert.ok(probed.cc.comparator_verdict.verdict === "equal" && control.cc.comparator_verdict.verdict === "equal", "both complete to equal through the guard");
  assert.equal(probed.gtfa, 4, "the helius cycle ledger holds EXACTLY 4 gTfA lines: P1, SP2, the probe, the anchor (mutant: probe routed off the paid operator => 3 => reds)");
  assert.ok(probed.credits === 40 && probed.cc.credits_recomputed === 40, "credits_recomputed = sum of the helius credits_derived = 40: the probe is billed +10 cr");
  assert.deepEqual(probed.cc.short_final_page_probe, probeOf(2, SP2.length, true, true, true), "the guarded artifact carries the provenance");
  assert.ok(control.gtfa === 3 && control.credits === 30 && control.cc.short_final_page_probe === null, "control: a tokenless short last page is final WITHOUT a probe (mutant: probe on a tokenless page => 4 lines => reds)");
});

test("bell_shortpage_probe_transient_error_is_retried - the probe goes through the injected retry: an HTTP 429 on its first attempt is retried ONCE (metered under getTransactionsForAddress), then the empty probe + the equal anchor complete (checkpoint-1 C-1: the probe under retry)", async () => {
  let asc = 0;
  const retries: Record<string, number> = {}, inner = spStub([{ data: NF_P1, token: "p2" }, { data: SP2, token: "p3" }, { data: [], token: null }], SP2_LAST);
  const stub: JsonRpcCall = (u, method, params) => {
    const p = (params as unknown[])[1] as { sortOrder?: string } | undefined;
    if (method === "getTransactionsForAddress" && p?.sortOrder === "asc" && ++asc === 3) return Promise.reject(new Error("HTTP 429 rate")); // the probe's FIRST attempt
    return inner(u, method, params);
  };
  const retry: RetryFn = (fn, method) => withRetry(fn, { tries: 3, sleep: () => Promise.resolve(), onRetry: () => { retries[method] = (retries[method] ?? 0) + 1; } });
  const scan = await scanFullMint(stub, PROVIDERS, SPYX.address, 3000, { maxPages: 20 }, {}, noopSink, [], retry);
  assert.equal(scan.complete, true, "the 429 on the probe healed in-process (mutant: probe outside the retry => the 429 propagates => reds)");
  assert.deepEqual(retries, { getTransactionsForAddress: 1 }, "exactly ONE retry, metered under the probe's method (mutant: probe error swallowed as empty => no retry => reds)");
  assert.deepEqual(scan.shortFinalPageProbe, probeOf(2, SP2.length, true, true, true), "the healed probe is traced like any empty probe");
});

// ---- ruling C-6 (orchestrator, after the 2026-09-22 power cut: ledger-AAPLx.jsonl kept 760 298 NUL bytes at its tail) ----
test("bell_crosscheck_writes_are_durable_fsync_per_page_and_per_json - ruling C-6: through runMain, with DURABLE_FS wrapped by a counting spy, EACH committed ledger page is open(a) -> write -> fsync -> close (exactly 1 fsync per page) and EACH whole JSON (budget.json, crosscheck-SPYx.json, the report, the candidates) is written to <f>.tmp, fsynced, closed, THEN renamed over <f>; the production fsyncSync is the real one", async () => {
  const orig = { ...DURABLE_FS };
  const pfd = openSync(join(mkdtempSync(join(tmpdir(), "bell-fs-p-")), "x"), "w");
  closeSync(pfd);
  assert.throws(() => { orig.fsyncSync(pfd); }, /EBADF/, "DURABLE_FS.fsyncSync reaches the real fs.fsyncSync (mutant: production fsync made a no-op => no throw => reds)");
  const log: Array<{ op: string; path: string }> = [], fdPath = new Map<number, string>();
  const at = (fd: number): string => fdPath.get(fd) ?? "?";
  Object.assign(DURABLE_FS, {
    openSync: (p: string, f: "a" | "w"): number => { const fd = orig.openSync(p, f); fdPath.set(fd, resolve(p)); log.push({ op: `open:${f}`, path: resolve(p) }); return fd; },
    writeFileSync: (fd: number, d: string): void => { log.push({ op: "write", path: at(fd) }); orig.writeFileSync(fd, d); },
    fsyncSync: (fd: number): void => { log.push({ op: "fsync", path: at(fd) }); orig.fsyncSync(fd); },
    closeSync: (fd: number): void => { log.push({ op: "close", path: at(fd) }); orig.closeSync(fd); },
    renameSync: (a: string, b: string): void => { log.push({ op: "rename", path: resolve(a) }); orig.renameSync(a, b); },
  });
  try {
    const sd = sdNf(), od = mkdtempSync(join(tmpdir(), "bell-fs-o-"));
    await runMain(b1aArgsStrict(sd, od, 50), b1aDeps(spStub([{ data: NF_P1, token: "p2" }, { data: SP2, token: "p3" }, { data: [], token: null }], SP2_LAST)));
    const ops = (f: string): string[] => log.filter((e) => e.path === resolve(od, f)).map((e) => e.op);
    assert.deepEqual(ops("ledger-SPYx.jsonl"), ["open:a", "write", "fsync", "close", "open:a", "write", "fsync", "close"], "each of the 2 committed pages: append -> fsync -> close, 1 fsync per page (mutants: fsync removed / fsync before write => reds)");
    for (const f of ["budget.json", "crosscheck-SPYx.json", "crosscheck-report.json", join("candidates", "SPYx", "nfInit.json"), join("candidates", "SPYx", "nfUpd.json")]) {
      const seq = ops(`${f}.tmp`);
      assert.ok(seq.length >= 5 && seq.length % 5 === 0, `${f}: written through the durable path (>= 1 fsync per JSON)`);
      for (let i = 0; i < seq.length; i += 5) assert.deepEqual(seq.slice(i, i + 5), ["open:w", "write", "fsync", "close", "rename"], `${f}: <f>.tmp write -> fsync -> close -> rename (mutants: fsync removed / rename first => reds)`);
    }
    assert.ok(verifyLedgerChain(spLedger(od)).ok && readSP(od).scan_complete, "the durable files are the real ones: the chain re-derives, the artifact is complete");
  } finally { Object.assign(DURABLE_FS, orig); }
});
