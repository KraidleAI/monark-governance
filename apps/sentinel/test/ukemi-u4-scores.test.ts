// UKEMI U-4a A-4 (ADR-M020 D1(b), checkpoint-1 C-1/C-2/C-3; ADR-U3 reserved test name) — OFFLINE replay of the
// score reducer from the committed reduced fixtures (book B₀ + D_e oracle path + U3-realized e2 labels): the
// per-ACCOUNT |Y−ŷ| conformity scores, canonical order, calibDigest. C-1 SUPERSEDES the G0 "194 scores": the cell
// is {book accounts with ŷ>0 under D_e} ∪ {189 liquidated} = 797. NO network. Mutants (each ⇒ calibDigest drift):
// Y altered ; D_e ignored (p_min=p0 ⇒ eligibility collapses to the 64 B₀-static) ; LT_W←0 (the WETH collateral leg
// no longer lowers HF under p_min ⇒ 59). eligible_under_De=770≫64 and the LT_W←0=59 prove the p_min recompute is
// load-bearing (not the tautological anchor identity).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { computeScores, type U4Book, type U3RealizedLine } from "../../../scripts/census/u4-scores.mjs";
import { selectIndices } from "../../../scripts/census/u4-redraw.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const U4 = join(HERE, "fixtures", "ukemi", "u4");
const U3 = join(HERE, "fixtures", "ukemi", "u3");
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const PINNED_DIGEST = "267cd9918abde0ee6de23f71c1dc0852d545e00824107c3dfb51f84bb943ea4b"; // C-V-2: re-pinned after Y completed (was 668ab214…)

interface OracleMeta { kind: "meta"; p_min: string; emode_lt: Record<string, string>; usdt_prices: Record<string, string>; monotone_blocks: boolean; phase_change: boolean }
interface OracleUpdate { kind: "update"; block: number; log_index: number; price: string; round_id: string; updated_at: string }
interface PriceInput { kind: string; asset: string; block: number; price: string | number }

function jsonl<T>(p: string): T[] {
  return readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as T);
}
function load(): { book: U4Book; oracle: { p_min: string; emode_lt: Record<string, string>; usdt_prices: Record<string, string> }; updates: OracleUpdate[]; u3: U3RealizedLine[]; meta: OracleMeta } {
  const book = JSON.parse(readFileSync(join(U4, "U4-book-23545087.json"), "utf8")) as U4Book;
  const oLines = jsonl<OracleMeta | OracleUpdate>(join(U4, "U4-oracle-path-e2.jsonl"));
  const meta = oLines.find((l): l is OracleMeta => l.kind === "meta");
  if (meta === undefined) throw new Error("oracle fixture: no meta line");
  const updates = oLines.filter((l): l is OracleUpdate => l.kind === "update");
  const u3 = jsonl<U3RealizedLine>(join(U3, "U3-realized.jsonl"));
  return { book, oracle: { p_min: meta.p_min, emode_lt: meta.emode_lt, usdt_prices: meta.usdt_prices }, updates, u3, meta };
}
const wethP0 = (book: U4Book): string => {
  const r = book.reserves.find((x) => x.asset.toLowerCase() === WETH);
  if (r === undefined) throw new Error("no WETH reserve");
  return r.price_base_8dec;
};

test("u4_calibrates_from_u3_realized_labels", () => {
  const { book, oracle, u3 } = load();
  const r = computeScores(book, oracle, u3);
  assert.equal(r.n, 797, "n = |cell| = {ŷ>0 under D_e} ∪ {189 liquidated} (C-1 supersedes the G0 '194 scores')");
  assert.equal(r.calib_digest, PINNED_DIGEST, "calibDigest == pinned (canonical order, base 8-dec, no clipping)");
  assert.equal(r.census.eligible_static_b0, 64, "static-eligible at B₀ (hf_onchain < 1e18)");
  assert.equal(r.census.eligible_under_De, 770, "eligible under D_e at p_min ≫ 64 (the WETH price drop makes many more liquidatable)");
  assert.equal(r.census.liquidated_not_in_book, 4, "residual: 4 liquidated users opened their WETH position AFTER the B₀ snapshot");
  assert.equal(r.census.liquidated_not_eligible_under_De, 23, "residual: 23 liquidated whose non-WETH collateral is NOT itemized in the book (20/23 multi-collateral); the WETH-p_min model holds their non-WETH collateral at p0 and misses them");
  assert.equal(r.census.eligible_not_liquidated, 608, "eligible under D_e, Y=0 ⇒ score=ŷ (drives q̂); 'eligible not liquidated' is not 'false' (a post-hoc exploratory constat bounds a model-artifact share — ADR-U4)");
  assert.equal(r.census.emode_lt_overstate_clamps, 0, "clampNeg counts ONLY riskAdjMin<0 (measured 0) ⇒ the 42 e-mode cell accounts are kept, not non_evaluable; it does NOT certify the e-mode LT is right for the WETH leg (see the 12 non-cat-1 residual below)");
  assert.equal(r.qhat, "364550606513851", "q̂ = p-th smallest score (p=791 < n=797), NOT the maximal score; structural ~50% of debt (close factor)");
  assert.equal(r.p, 791);
  // C-V-2 — Y completed: the U-3 `deficit_base_no_price` residue (user 0x15391e14, USDT) is priced with the C-12
  // getAssetPrice(USDT)@23550406 ⇒ Y = repayment 277615428066 + deficit 445329889526 = 722945317592. ŷ=0 (this
  // liquidated account is not eligible under D_e) ⇒ score = Y; 722945317592 << q̂ ⇒ n/p/q̂ invariant, digest re-pins.
  assert.equal(r.census.deficit_lines_priced_from_usdt, 1, "exactly one deficit_base_no_price line priced from usdt_prices (C-12)");
  const dLine = r.rows.find((x) => x.address === "0x15391e14a74a808f5e7a2055e755bd7f3db97f40");
  assert.ok(dLine !== undefined, "the 0x15391e14 realized line is in the cell");
  assert.equal(dLine.y, "722945317592", "Y completed = repayment 277615428066 + USDT deficit 445329889526 (C-12)");
  assert.equal(dLine.yhat, "0", "yhat=0 (not eligible under D_e)");
  assert.equal(dLine.score, "722945317592", "score = |Y-ŷ| = 722945317592 < q̂ ⇒ n/p/q̂ unchanged, only calib_digest re-pins");
  // C-G2-6 — e-mode residual (declared). 42 in-cell accounts have emode != 0; 12 of those are non-cat-1
  // (distribution {2:7, 11:3, 19:1, 23:1}). The 12 rely on the C-3 assumption that WETH is a collateral of their
  // e-mode category — true for category 1 (Aave's ETH e-mode), NOT verified for cat 2/11/19/23 (declared residual,
  // ADR-U4). clampNeg=0 above does not certify these; it only catches riskAdjMin<0.
  const emodeByAddr = new Map(book.accounts.map((a) => [a.address.toLowerCase(), Number(a.emode)]));
  const cellEmode = r.rows.filter((x) => (emodeByAddr.get(x.address) ?? 0) !== 0);
  assert.equal(cellEmode.length, 42, "42 in-cell accounts with emode != 0 (== census emode_nonzero_in_cell)");
  assert.equal(cellEmode.filter((x) => (emodeByAddr.get(x.address) ?? 0) !== 1).length, 12, "12 non-cat-1 e-mode in-cell accounts — declared residual governed by the C-3 WETH-in-category assumption (C-G2-6)");
});

test("u4_oracle_path_monotone_and_matches_u3_prices", () => {
  const { updates, meta } = load();
  const blocks = updates.map((u) => u.block);
  assert.ok(blocks.every((b, i) => i === 0 || b >= (blocks[i - 1] ?? 0)), "AnswerUpdated blocks monotone non-decreasing (u4_oracle_path_monotone_blocks)");
  assert.equal(meta.monotone_blocks, true);
  assert.equal(meta.phase_change, false, "aggregator() identical at B₀ and B_last (no phase change ⇒ no abi_mismatch)");
  const wethPrices = jsonl<PriceInput>(join(U3, "U3-inputs.jsonl")).filter((p) => p.kind === "price" && p.asset.toLowerCase() === WETH);
  assert.equal(wethPrices.length, 107, "107 WETH getAssetPrice observations in U3-inputs");

  // PRE-REGISTERED H6 (U4-H6, C-4 form): for each of the 107 WETH price blocks b, the LAST AnswerUpdated with
  // block <= b must equal getAssetPrice@b. RECORDED RESULT = NON: 69/107 (union of the "<= b" and "< b" forms =
  // 77/107). This is the pre-registered criterion, PINNED here as a regression guard (C-G2-3 / D-9); a NON is a
  // measured result, not a defect. The prereg is NOT rewritten.
  const ordered = updates.slice().sort((a, b) => a.block - b.block || a.log_index - b.log_index);
  const lastAt = (b: number, strict: boolean): OracleUpdate | undefined => {
    let best: OracleUpdate | undefined;
    for (const u of ordered) if (strict ? u.block < b : u.block <= b) best = u; // ordered asc ⇒ last kept = max (block, log_index)
    return best;
  };
  let preregLE = 0, unionLEorLT = 0;
  for (const p of wethPrices) {
    const atLE = lastAt(p.block, false), atLT = lastAt(p.block, true);
    const okLE = atLE !== undefined && atLE.price === String(p.price);
    const okLT = atLT !== undefined && atLT.price === String(p.price);
    if (okLE) preregLE++;
    if (okLE || okLT) unionLEorLT++;
  }
  assert.equal(preregLE, 69, "U4-H6 PRE-REGISTERED form (last AnswerUpdated <= b == getAssetPrice@b) = 69/107 — RECORDED NON (a measured result, not a defect; prereg not rewritten)");
  assert.equal(unionLEorLT, 77, "union of the <=b and <b forms = 77/107 (still NON) — regression guard on the recorded H6 result");

  // POST-HOC diagnostic (NOT the pre-registered criterion; does NOT validate H6). It BOUNDS the use of p_min only:
  // 106/107 served values are members of the AnswerUpdated series (the 1 = the pre-window p0 @23545088), and p_min
  // is exact (below). The mechanism of the 38 prereg misses is NOT explained — to procure (D-9). Measured
  // constraints: 0 of the 38 misses is explained by a multi-update block (3 multi-update blocks DO exist in D_e —
  // 23549856, 23549957, 23549988 — none among the misses); the served value lags the last event by 1-3 events.
  const updPrices = new Set(updates.map((u) => u.price));
  const inSet = wethPrices.filter((p) => updPrices.has(String(p.price))).length;
  assert.equal(inSet, 106, "POST-HOC diagnostic (not the prereg criterion; does not validate H6): 106/107 getAssetPrice values in the AnswerUpdated series (the 1 = pre-window p0 @23545088). Bounds p_min's use only.");
  const gapMin = wethPrices.reduce((m, p) => (BigInt(String(p.price)) < m ? BigInt(String(p.price)) : m), 2n ** 255n).toString();
  assert.equal(meta.p_min, gapMin, "p_min (min AnswerUpdated) == min getAssetPrice EXACTLY — the load-bearing quantity for ŷ. The bracket min(events) <= min(served, all blocks) <= min(served, sampled) = min(events) holds ONLY under the measured CONDITION that every served value is in events ∪ {p0} (179 sampled blocks, biased toward liquidations) — C-V-5");
});

test("u4_scores_mutants_shift_calib_digest", () => {
  const { book, oracle, u3 } = load();
  assert.equal(computeScores(book, oracle, u3).calib_digest, PINNED_DIGEST, "baseline pinned");
  // Mutant 1 — Y altered (bump one e2 line's repayment_base by 1) ⇒ that account's score changes ⇒ digest drift.
  const u3m = u3.map((l) => ({ ...l }));
  const i = u3m.findIndex((l) => l.event_id === "e2-2025-10-10-weth");
  const cur = u3m[i];
  if (cur === undefined) throw new Error("no e2 line");
  u3m[i] = { ...cur, repayment_base: (BigInt(cur.repayment_base) + 1n).toString() };
  assert.notEqual(computeScores(book, oracle, u3m).calib_digest, PINNED_DIGEST, "Y altered ⇒ calibDigest drift");
  // Mutant 2 — D_e ignored: p_min = p0 ⇒ HF(D_e) == hf_onchain ⇒ eligibility collapses to the 64 B₀-static ⇒ drift.
  const de0 = computeScores(book, { p_min: wethP0(book), emode_lt: oracle.emode_lt, usdt_prices: oracle.usdt_prices }, u3);
  assert.equal(de0.census.eligible_under_De, 64, "p_min=p0 ⇒ 64 eligible (D_e ignored)");
  assert.notEqual(de0.calib_digest, PINNED_DIGEST, "D_e ignored ⇒ calibDigest drift");
  // Mutant 3 — LT_W←0: zero the WETH leg LT (reserve + every e-mode category) ⇒ the WETH collateral drop no longer
  // lowers HF under p_min ⇒ only 59 eligible (the residual WETH-debt scaling) ⇒ drift.
  const bookM: U4Book = { ...book, reserves: book.reserves.map((r) => (r.asset.toLowerCase() === WETH ? { ...r, liquidation_threshold_bps: "0" } : r)) };
  const lt0: Record<string, string> = Object.fromEntries(Object.keys(oracle.emode_lt).map((k) => [k, "0"]));
  const m3 = computeScores(bookM, { p_min: oracle.p_min, emode_lt: lt0, usdt_prices: oracle.usdt_prices }, u3);
  assert.equal(m3.census.eligible_under_De, 59, "LT_W=0 ⇒ 59 eligible (WETH collateral leg no longer lowers HF)");
  assert.notEqual(m3.calib_digest, PINNED_DIGEST, "LT_W←0 ⇒ calibDigest drift");
});

test("u4_reducer_fails_closed_on_missing_usdt_price_and_missing_emode_lt", () => {
  const { book, oracle, u3 } = load();
  // C-V-2 guard: with no usdt_prices, the deficit_base_no_price line cannot be priced ⇒ THROW, never a silent Y
  // drop (the pre-C-V-2 bug). This is the fail-closed proof for the deficit completion.
  assert.throws(() => computeScores(book, { p_min: oracle.p_min, emode_lt: oracle.emode_lt, usdt_prices: {} }, u3), /no USDT price/, "empty usdt_prices ⇒ fail-closed (C-V-2)");
  // C-3 guard (was a silent `?? wethBaseLT` fallback, now fail-closed): a missing e-mode category LT — category 1
  // is used in-cell — ⇒ THROW, never a silent reserve-LT substitution.
  const noCat1 = { ...oracle.emode_lt };
  delete noCat1["1"];
  assert.throws(() => computeScores(book, { p_min: oracle.p_min, emode_lt: noCat1, usdt_prices: oracle.usdt_prices }, u3), /category 1 .*missing/, "dropping emode_lt category 1 ⇒ fail-closed (C-3)");
});

test("u4_redraw_selects_by_book_digest_seed", () => {
  // C-V-3: the G2-delta live re-draw (scripts/census/u4-redraw.mjs) picks its >= 3 accounts and >= 3 AnswerUpdated
  // by a seed DERIVED from book_digest, never by hand. Pinned deterministic triplets (book_digest 695d862f…): a
  // mutant that ignores the seed (e.g. returns [0,1,2]) reds these pins. The live network wiring is exercised by
  // G2-delta (a bounded --max-calls <= 60 fail-closed control), not here.
  const bd = "695d862fd1560d5a0ae1349f358accd36ecf394437bd2f497fa1a0fae7d7ab09";
  assert.deepEqual(selectIndices(bd, 16096, 3), [3443, 12793, 15952], "account indices = the book_digest-seeded triplet (not hand-picked)");
  assert.deepEqual(selectIndices(`${bd}:updates`, 140, 3), [131, 68, 114], "AnswerUpdated indices drawn with a distinct seed suffix");
  assert.deepEqual(selectIndices(bd, 16096, 3), [3443, 12793, 15952], "deterministic ⇒ a reproducible re-draw");
  const a = selectIndices(bd, 16096, 3);
  assert.equal(new Set(a).size, 3, "distinct indices");
  assert.ok(a.every((x) => x >= 0 && x < 16096), "in range [0,n)");
});
