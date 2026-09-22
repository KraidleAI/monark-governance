// UKEMI U-4b-1a (ADR-U4b; G0-lot-u4b §3/§4; checkpoint-1 C-1/C-7/C-8/C-13/C-14) — OFFLINE replay of the close-
// factor score reducer from the committed u4b fixtures (reduced book B₀ + D_e oracle path WITH a pre-B₀ anchor +
// U3-realized e2 labels): per-ACCOUNT max(Y−ŷ,0) one-sided exceedance scores at the PER-ACCOUNT FIRST CROSSING p*, two Mondrian cells,
// per-cell + per-stratum digests. e2 is the DESIGN set (never served). NO network. The pins below are the FROZEN
// score-form (C-12). Input mutants (each ⇒ a cell digest / census shift) are in-test; the code mutants
// (a ŷ=total_debt, b p_min, c 50%-always, d e-mode-bonus, g dust-AND, h Σ-not-max) are run by the worker with a
// byte-exact save/restore (rendu), each killing a pinned assertion below.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { computeScoresU4b, strateOf, STRATA_CUTS, resolveRunnerInputs, type U4bBook, type U4bOracle, type U4bU3Line } from "../../../scripts/census/u4b/u4b-scores.mjs";
import { buildRegistryEntries, resolveScoresPath } from "../../../scripts/record-u4b-calib.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const U4B = join(HERE, "fixtures", "ukemi", "u4b");
const U4 = join(HERE, "fixtures", "ukemi", "u4");
const U3 = join(HERE, "fixtures", "ukemi", "u3");
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const WAD = 10n ** 18n;
const lc = (s: string): string => s.toLowerCase();

// FROZEN pins (measured on e2, U-4b-1a; the gel sha of the .mjs is in the rendu / -1b prereg).
const CELL_A_DIGEST = "2feb4ab057613925c9ed77dbec4f186044375b223d5ea520df3ec82d63524720";
const CELL_B_DIGEST = "07bb8e3b1f35a95f5679f013133cc3e87540e01177279ccfe9ec6f4f8dfb8b0f";

interface OMeta { kind: "meta"; event_id: string; emode_params: Record<string, { lt: string; bonus: string }>; usdt_prices: Record<string, string> }
interface OAnchor { kind: "anchor"; price: string }
interface OUpdate { kind: "update"; block: number; log_index: number; price: string }

function jsonl<T>(p: string): T[] { return readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as T); }
function load(): { book: U4bBook; oracle: U4bOracle; u3: U4bU3Line[] } {
  const book = JSON.parse(readFileSync(join(U4B, "U4b-book-23545087.json"), "utf8")) as U4bBook;
  const oLines = jsonl<OMeta | OAnchor | OUpdate>(join(U4B, "U4b-oracle-path-e2.jsonl"));
  const anchor = oLines.find((l): l is OAnchor => l.kind === "anchor");
  const meta = oLines.find((l): l is OMeta => l.kind === "meta");
  if (anchor === undefined || meta === undefined) throw new Error("oracle fixture: missing anchor/meta");
  const updates = oLines.filter((l): l is OUpdate => l.kind === "update");
  const u3 = jsonl<U4bU3Line>(join(U3, "U3-realized.jsonl"));
  return { book, oracle: { event_id: meta.event_id, anchor_price: anchor.price, updates, emode_params: meta.emode_params, usdt_prices: meta.usdt_prices }, u3 };
}
const lfSha = (p: string): string => createHash("sha256").update(readFileSync(p, "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");

test("u4b_scores_on_e2 — close factor at first crossing, two cells, pinned digests + census (C-1/C-7/C-8/C-13/C-14)", () => {
  const { book, oracle, u3 } = load();
  const r = computeScoresU4b(book, oracle, u3);
  // cell A `liquidation-eligible-coverage` (Mondrian by ŷ size)
  assert.equal(r.cellA.n, 565, "cell A = {ŷ>0 at first crossing} ∪ {liquidated}, mono-collateral WETH only");
  assert.equal(r.cellA.calib_digest, CELL_A_DIGEST, "cell A digest (canonical order, base 8-dec, one-sided exceedance clamped at 0, decision 126)");
  assert.equal(r.cellA.qhat, "1861718113769", "q̂_A whole-cell = p-th smallest one-sided score (p=561, n−p=4 excluded); pooled diagnostic — the served q̂ is per-stratum (decision 126)");
  assert.equal(r.cellA.p, 561);
  assert.deepEqual(r.cellA.strata.map((s) => [s.strate, s.n]), [[0, 363], [1, 148], [2, 46], [3, 8]], "Mondrian strata {<2000e8, <100k$, <1M$, ≥1M$}; strate 3 (n=8 < nMin) is under_calib");
  // cell B `liquidation-realized-given-liquidated`
  assert.equal(r.cellB.n, 99, "cell B = evaluable liquidated (189 − 86 non_evaluable − 4 not_in_book)");
  assert.equal(r.cellB.calib_digest, CELL_B_DIGEST, "cell B digest");
  assert.equal(r.cellB.qhat, null, "cell B n=99 < nMin=100 ⇒ under_calib (q̂ null, fail-closed — never a clamped value)");
  // census (residues counted, never a silent 0)
  const c = r.census;
  assert.equal(c.accounts, 16096);
  assert.equal(c.non_evaluable_x, 6611, "mono-collateral X=0 EXACT excludes 6611 (non-WETH collateral via aggregate residue)");
  assert.equal(c.non_evaluable_x_smallpos, 483, "of which 483 have a sub-$1 non-WETH-collateral residue — NOT rounding (validator histogram: only 5 ≤ 5 units, 478/483 are genuine tiny non-WETH collaterals); strict X=0 (decision 91) excludes them, the correct reading (C-V-4)");
  assert.equal(c.non_evaluable_emode, 33, "e-mode ∉ {0, WETH-category=1} ⇒ non_evaluable (WETH∈category not verifiable off-line, C-14)");
  assert.equal(c.crossed, 563, "accounts with a first crossing (HF<1e18 somewhere on the path)");
  assert.equal(c.crossed_yhat_zero, 1, "of the 563 crossed, 1 has every D_r floor to 0 ⇒ ŷ=0 (out of cell unless liquidated) — counted, never a silent 0");
  assert.equal(c.no_crossing, 8889, "mono-WETH evaluable, never HF<1e18 along the path ⇒ ŷ=0");
  assert.equal(c.pstar_is_anchor, 52, "static-eligible (HF(anchor)=hf0<1e18) ⇒ p*=anchor (H-7)");
  assert.equal(c.ca_binding, 3, "collateral cap C_weth/m binds in 3 accounts at the correct params (all non-e-mode); the e-mode bonus mutant (reserve 10500 > category 10100) shrinks CA below CF for 6 e-mode accounts ⇒ ca_binding→9 ⇒ mutant d RED on the digest (MEASURED — the e-mode bonus IS load-bearing)");
  assert.equal(c.ca_binding_emode, 0, "0 e-mode accounts have CA binding at the correct bonus 10100; u4b_emode_bonus_sourced_from_emode_raw is the additional structural guard on the source");
  assert.equal(c.sum_ne_max, 111, "111 accounts where Σ_r ≠ max_r ⇒ mutant h (Σ instead of max) is RED on the digest");
  assert.equal(c.dust_bounded, 9, "MustNotLeaveDust OU gate triggers on 9 (ŷ unchanged, E-I-4(b)); AND would give 1 ⇒ mutant g RED on this census");
  assert.equal(c.dust_bounded_emode, 0);
  assert.equal(c.lst_debt_at_p0, "1887774040533922", "LST debt (emcat==1, ≠WETH) held at p0 ≈ $18.88M (residue, ŷ holds it at p0)");
  assert.equal(c.lst_effect_accounts, 105, "accounts whose ŷ would change if LST debt were repriced by p*/p0");
  assert.equal(c.lst_effect_abs_sum, "69569421844", "Σ|Δŷ| ≈ $695 total — NEGLIGIBLE at first crossing (p*≈p0), so holding LST at p0 is ratified by measurement");
  assert.equal(c.liquidated_total, 189);
  assert.equal(c.liquidated_not_in_book, 4);
  assert.equal(c.liquidated_non_evaluable, 86, "liquidated but multi-collateral or e-mode∉{0,1} ⇒ out of cells A and B, counted");
  assert.equal(c.deficit_lines_priced_from_usdt, 1);
});

test("u4b_score_is_one_sided_exceedance — max(Y−ŷ,0): Y<ŷ ⇒ 0, Y>ŷ ⇒ Y−ŷ (decision 126; symmetric mutant RED)", () => {
  // Decision 126 re-gel: the score is the ONE-SIDED exceedance max(Y−ŷ,0), NOT the symmetric |Y−ŷ|. On e2 cell A
  // has 509 rows with Y<ŷ (must score exactly 0), 0 ties, 56 rows with Y>ŷ (score = Y−ŷ). Reverting
  // u4b-scores.mjs:244 to the symmetric `yhat − Y` gives every Y<ŷ row a positive score ⇒ this test RED (and every
  // pinned cell/stratum digest RED). Non-vacuous: the 509 Y<ŷ rows are the discriminating population.
  const { book, oracle, u3 } = load();
  const rows = computeScoresU4b(book, oracle, u3).cellA.rows;
  const under = rows.filter((r) => BigInt(r.y) < BigInt(r.yhat));
  const over = rows.filter((r) => BigInt(r.y) > BigInt(r.yhat));
  const ties = rows.filter((r) => BigInt(r.y) === BigInt(r.yhat));
  assert.equal(under.length, 509, "cell A rows with Y<ŷ (the population the symmetric mutant would mis-score)");
  assert.equal(over.length, 56, "cell A rows with genuine exceedance Y>ŷ");
  assert.ok(under.every((r) => r.score === "0"), "every Y<ŷ account scores exactly 0 (one-sided clamp; symmetric mutant RED here)");
  assert.ok(ties.every((r) => r.score === "0"), "every Y==ŷ account scores 0 = max(0,0)");
  assert.ok(over.every((r) => r.score === (BigInt(r.y) - BigInt(r.yhat)).toString()), "every Y>ŷ account scores exactly Y−ŷ");
  assert.ok(rows.every((r) => !r.score.startsWith("-")), "no negative score is ever emitted (clamped at 0)");
});

test("u4b_scores_fixture_kind_census — the decision-126 re-gel keeps the population (1 meta + 565 score_a + 99 score_b)", () => {
  // Non-regression: changing the score must NOT change WHICH accounts are in the fixture — only the `score` field
  // and the cell/stratum digests move. Count committed fixture lines by `kind`; a re-reduction that dropped or
  // added a row (an eligibility change) would RED here. Pairs with the census-identical proof in the G1 rendu.
  const lines = jsonl<{ kind: string }>(join(U4B, "U4b-scores-e2.jsonl"));
  const byKind = lines.reduce<Record<string, number>>((m, l) => { m[l.kind] = (m[l.kind] ?? 0) + 1; return m; }, {});
  assert.deepEqual(byKind, { meta: 1, score_a: 565, score_b: 99 }, "population unchanged by the one-sided re-gel");
  assert.equal(lines.length, 665, "665 total lines");
});

test("u4b_scores_input_mutants_shift_digest — D_e / LT_W / e-mode-LT / Y (each ⇒ digest drift, non-tautological)", () => {
  const { book, oracle, u3 } = load();
  assert.equal(computeScoresU4b(book, oracle, u3).cellA.calib_digest, CELL_A_DIGEST, "baseline pinned");
  // Mutant (e) — D_e ignored: no updates ⇒ path = [anchor] ⇒ eligibility collapses to the 52 static ⇒ digest drift.
  const de0 = computeScoresU4b(book, { ...oracle, updates: [] }, u3);
  assert.equal(de0.census.crossed, 52, "no D_e ⇒ only the 52 static-eligible cross (at the anchor)");
  assert.notEqual(de0.cellA.calib_digest, CELL_A_DIGEST, "D_e ignored ⇒ cell A digest drift");
  // Mutant (f) — LT_W←0: zero the WETH leg LT (reserve + every e-mode category) ⇒ the WETH collateral drop no
  // longer lowers HF ⇒ eligibility collapses ⇒ drift.
  const bookLT0: U4bBook = { ...book, reserves: book.reserves.map((r) => (lc(r.asset) === WETH ? { ...r, liquidation_threshold_bps: "0" } : r)) };
  const ep0: Record<string, { lt: string; bonus: string }> = Object.fromEntries(Object.entries(oracle.emode_params).map(([k, v]) => [k, { lt: "0", bonus: v.bonus }]));
  const m3 = computeScoresU4b(bookLT0, { ...oracle, emode_params: ep0 }, u3);
  assert.equal(m3.census.crossed, 68, "LT_W=0 ⇒ eligibility collapses to 68 (WETH collateral leg no longer lowers HF)");
  assert.notEqual(m3.cellA.calib_digest, CELL_A_DIGEST, "LT_W←0 ⇒ cell A digest drift");
  // Mutant (f') — e-mode LT taken from the WETH RESERVE (8300) instead of emode_raw (9500): changes HF of the 21
  // e-mode cell accounts ⇒ drift (distinct from the BONUS mutant; the LT IS load-bearing, the bonus is not).
  const e1 = oracle.emode_params["1"];
  if (e1 === undefined) throw new Error("no e-mode category 1 in fixture");
  const epLtReserve = { ...oracle.emode_params, "1": { lt: "8300", bonus: e1.bonus } };
  assert.notEqual(computeScoresU4b(book, { ...oracle, emode_params: epLtReserve }, u3).cellA.calib_digest, CELL_A_DIGEST, "e-mode LT from reserve ⇒ digest drift");
  // Mutant — Y altered: bump the realized repayment of an EVALUABLE liquidated account (a cell-B member, so it is
  // in cell A too) by 1 ⇒ its score changes ⇒ drift. (Bumping a NON-evaluable liquidated line would be invisible —
  // it is out of both cells — so target a cell-B address explicitly, not the first e2 line.)
  const b0 = computeScoresU4b(book, oracle, u3).cellB.rows[0];
  if (b0 === undefined) throw new Error("cell B is empty — cannot pick a target");
  const target = b0.address;
  const u3m = u3.map((l) => ({ ...l }));
  const i = u3m.findIndex((l) => l.event_id === "e2-2025-10-10-weth" && lc(l.user) === target);
  const cur = u3m[i];
  if (cur === undefined) throw new Error("no e2 line for the cell-B target");
  u3m[i] = { ...cur, repayment_base: (BigInt(cur.repayment_base ?? "0") + 1n).toString() };
  assert.notEqual(computeScoresU4b(book, oracle, u3m).cellA.calib_digest, CELL_A_DIGEST, "Y altered (evaluable liquidated) ⇒ digest drift");
});

test("u4b_event_id_is_a_parameter — the frozen code is EPISODE-AGNOSTIC (C-12): renaming the episode ⇒ same digest", () => {
  // The whole point of the sha-freeze (C-12) is that the SAME bytes produce the fresh -1b scores. Prove the code
  // filters by the event_id PARAMETER, not a hard-coded "e2": rename the episode everywhere ⇒ identical scoring.
  const { book, oracle, u3 } = load();
  const base = computeScoresU4b(book, oracle, u3).cellA.calib_digest;
  const u3x = u3.map((l) => ({ ...l, event_id: l.event_id === "e2-2025-10-10-weth" ? "fresh-weth-2026" : l.event_id }));
  const rx = computeScoresU4b(book, { ...oracle, event_id: "fresh-weth-2026" }, u3x);
  assert.equal(rx.cellA.calib_digest, base, "episode rename ⇒ same cell-A digest (filters by the PARAMETER, not 'e2')");
  assert.equal(rx.cellA.predictor_id, "ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/fresh-weth-2026/A", "predictor_id carries the parameter episode");
  // Fail-closed when event_id is absent (never a silent all-labels-dropped, empty cell B).
  const noEvt: U4bOracle = { ...oracle };
  delete (noEvt as Partial<U4bOracle>).event_id;
  assert.throws(() => computeScoresU4b(book, noEvt, u3), /event_id is REQUIRED/, "missing event_id ⇒ THROW (fail-closed, C-12)");
});

test("u4b_anchor_is_required_and_positive — a missing / zero / negative pre-B₀ anchor fails-closed (C-G2-2)", () => {
  // In -1b the anchor is a real AnswerUpdated ≤ B₀ that COULD be absent/null; a zero anchor makes every account
  // "cross" at price 0 (garbage scoring). The guard throws instead of scoring silently. Mutant: remove the guard
  // ⇒ anchor "0" no longer throws (RED). Digests on e2 are untouched (the e2 anchor is the book WETH price > 0).
  const { book, oracle, u3 } = load();
  assert.throws(() => computeScoresU4b(book, { ...oracle, anchor_price: "0" }, u3), /must be > 0/, "anchor 0 ⇒ THROW (never garbage scoring at price 0)");
  const neg: U4bOracle = { ...oracle, anchor_price: "-1" };
  assert.throws(() => computeScoresU4b(book, neg, u3), /must be > 0/, "negative anchor ⇒ THROW");
  const noAnchor: U4bOracle = { ...oracle };
  delete (noAnchor as Partial<U4bOracle>).anchor_price;
  assert.throws(() => computeScoresU4b(book, noAnchor, u3), /anchor_price is REQUIRED/, "missing anchor ⇒ THROW (explicit, not a bare TypeError)");
});

test("u4b_runner_and_generator_paths_are_required — NO e2 default in the CLI runners (C-G2-1)", () => {
  // The frozen runner / generator must be pointed at the EPISODE's fixtures explicitly, never silently at the e2
  // design set. Mutant: restore a default ⇒ these guards no longer throw (RED).
  assert.throws(() => resolveRunnerInputs(["node", "s"]), /REQUIRED/, "no paths ⇒ THROW");
  assert.throws(() => resolveRunnerInputs(["node", "s", "b", "o"]), /REQUIRED/, "only 2 of 3 paths ⇒ THROW");
  assert.deepEqual(resolveRunnerInputs(["node", "s", "b", "o", "u"]), { book: "b", oracle: "o", u3: "u" }, "3 paths ⇒ resolved");
  assert.throws(() => resolveScoresPath(["node", "s"]), /REQUIRED/, "no --scores ⇒ THROW (never the e2 design set)");
  assert.equal(resolveScoresPath(["node", "s", "--scores", "x.jsonl"]), "x.jsonl", "--scores ⇒ resolved");
});

test("u4b_emode_bonus_sourced_from_emode_raw — m is the e-mode category bonus, not the reserve bonus (C-14, structural)", () => {
  // C-14 direct/structural guard: the per-account diagnostic m_bps (NOT in the digest) equals the e-mode category
  // bonus (10100) for an e-mode account and the reserve bonus (10500) for a non-e-mode account. The code mutant
  // "bonus from reserve" flips the e-mode m_bps to 10500 ⇒ RED here — AND (measured) RED on the digest too, since
  // the larger reserve bonus shrinks CA below CF for 6 e-mode accounts. This structural test also kills the
  // "bonus OMITTED (m=1)" variant robustly (m=1 would NOT bind CA for the e-mode accounts, but flips m_bps here).
  const { book, oracle, u3 } = load();
  const rows = computeScoresU4b(book, oracle, u3).cellA.rows;
  const byAddr = new Map(rows.map((r) => [r.address, r.m_bps]));
  assert.equal(byAddr.get("0x071c6780217a8f10056118df96c96ac2cd27a5c2"), "10100", "e-mode cell account ⇒ m from emode_raw category 1 (bonus 10100)");
  assert.equal(byAddr.get("0x00234cac4eca3a103a0d66415b319d3397521605"), "10500", "non-e-mode account ⇒ m = WETH reserve bonus 10500");
  assert.equal(rows.filter((r) => r.m_bps === "10100").length, 21, "21 e-mode cell accounts sourced from emode_raw (the mutant would drop this to 0)");
});

test("u4b_anchor_identity_h7 — anchor = p0 ⇒ HF(anchor)==hf0 (the pre-B₀ anchor is load-bearing, C-8 entry 7)", () => {
  const { book, oracle } = load();
  const wr = book.reserves.find((r) => lc(r.asset) === WETH);
  if (wr === undefined) throw new Error("no WETH reserve");
  assert.equal(oracle.anchor_price, wr.price_base_8dec, "the -1a design anchor IS the book WETH price @B₀ (identity source)");
  // static-eligible evaluable accounts cross EXACTLY at the anchor ⇔ HF(anchor)==hf0 for them (H-7). Count them
  // independently and compare to census.pstar_is_anchor.
  const p0 = BigInt(wr.price_base_8dec), aWeth = lc(wr.atoken);
  let staticEligEvaluable = 0;
  for (const a of book.accounts) {
    const aWethBal = (a.balances.find((b) => lc(b.token) === aWeth)?.amount) ?? "0";
    const bal = BigInt(aWethBal);
    if (bal === 0n) continue;
    if (BigInt(a.total_collateral_base) - (bal * p0) / WAD !== 0n) continue; // mono-WETH exact
    const em = BigInt(a.emode);
    if (em !== 0n && em !== 1n) continue; // evaluable e-mode
    if (BigInt(a.hf_onchain) < WAD) staticEligEvaluable++;
  }
  const { u3 } = load();
  assert.equal(computeScoresU4b(book, oracle, u3).census.pstar_is_anchor, staticEligEvaluable, "pstar_is_anchor == static-eligible evaluable count ⇒ the anchor reproduces hf0 (H-7)");
  assert.equal(staticEligEvaluable, 52);
});

test("u4b_reduce_keeps_bonus — reduced book carries liquidation_bonus_bps + reserve_emode_category (C-14)", () => {
  const { book } = load();
  for (const r of book.reserves) {
    assert.ok(typeof r.liquidation_bonus_bps === "string" && r.liquidation_bonus_bps.length > 0, `reserve ${r.asset} keeps liquidation_bonus_bps`);
    assert.ok(typeof r.reserve_emode_category === "string", `reserve ${r.asset} keeps reserve_emode_category`);
  }
  const wr = book.reserves.find((r) => lc(r.asset) === WETH);
  assert.equal(wr?.liquidation_bonus_bps, "10500", "WETH reserve bonus 10500");
  assert.equal(wr?.reserve_emode_category, "1", "WETH reserve e-mode category 1");
});

test("u4b_strate_boundaries — strateOf is exact at the code cuts {2000e8, 100k$, 1M$} (mutant: off-by-one ⇒ RED)", () => {
  assert.deepEqual(STRATA_CUTS.map((c) => c.toString()), ["200000000000", "10000000000000", "100000000000000"], "cuts fixed a priori (Mondrian 2003: κ before data)");
  assert.equal(strateOf(0n), 0);
  assert.equal(strateOf(199999999999n), 0);
  assert.equal(strateOf(200000000000n), 1, "at 2000e8 ⇒ strate 1 (half-open [cut, …))");
  assert.equal(strateOf(9999999999999n), 1);
  assert.equal(strateOf(10000000000000n), 2, "at 100k$ ⇒ strate 2");
  assert.equal(strateOf(99999999999999n), 2);
  assert.equal(strateOf(100000000000000n), 3, "at 1M$ ⇒ strate 3");
  assert.equal(strateOf(10n ** 18n), 3);
});

test("u4b_registry_recomputes_from_scores_jsonl — generator maillon (class A only, decision 108), scale + 2^53 (C-9)", () => {
  // Recompute the registry from the IN-REPO scores fixture (anti fixture-self-recording): read the class-A rows,
  // rebuild one entry per Mondrian stratum, assert n / p / q̂ / calib_digest / under_calib match the pins. Class B
  // is NOT emitted (decision investisseur 108: Class B is a formed item, not served).
  const lines = jsonl<{ kind: string; strate?: number; score?: string; cell_a?: { predictor_id: string } }>(join(U4B, "U4b-scores-e2.jsonl"));
  const predictorBase = lines.find((l) => l.kind === "meta")?.cell_a?.predictor_id;
  const rowsA = lines.filter((r): r is { kind: string; strate: number; score: string } => r.kind === "score_a");
  const e = buildRegistryEntries(rowsA, { scale: 1n, predictorBase }) as { strate: number; n: number; p: number; qhat: number; calib_digest: string; under_calib: boolean; predictor_id: string }[];
  assert.equal(e[0]?.predictor_id, "ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/e2-2025-10-10-weth/A/s0", "predictor_id inherits the cell-A key from the meta (episode-agnostic, no UNSPECIFIED default)");
  assert.deepEqual(e.map((x) => [x.strate, x.n, x.p, x.qhat, x.under_calib]), [
    [0, 363, 361, 23169870364, false],
    [1, 148, 148, 3609978241254, false],
    [2, 46, 47, null, true],
    [3, 8, 9, null, true],
  ], "per-stratum n / p / q̂ / under_calib (strata 2,3 abstain: n < nMin=100 ⇒ q̂ null via splitQuantile L1, never clamped)");
  assert.equal(e[0]?.calib_digest, "371f0577030e19310741685512a09aaf3d3b9c7b68e346c3b122aff273f2b6fa", "strate 0 registry calibDigest (float64_be sorted, C5)");
  assert.equal(e[1]?.calib_digest, "624e21c7bd50fc19a0ad92f2abef2adbd3ad1f589075b54069dd9def4c02e92f", "strate 1 registry calibDigest");
  assert.equal(e[2]?.calib_digest, "31654567b10610b2d71986ff143440c5a6e2ab3f1c0ee9b60b189f25308c58cf", "strate 2");
  assert.equal(e[3]?.calib_digest, "db51ef06dd1f82fcc7dbe5cb54803bfd083e56bc3fdd74e7241e4447cd0b165b", "strate 3");
  // No stratum exceeds 2^53 on e2 (scale=1 exact); but the guard MUST fail-close on a > 2^53 score (mutant m).
  assert.throws(() => buildRegistryEntries([{ strate: 3, score: (2n ** 53n + 1n).toString() }], { scale: 1n, predictorBase: "x" }), /exceeds 2\^53/, "a score > 2^53 with scale 1 ⇒ THROW, never a silent precision loss (C-9)");
  // And on an inexact scale (would corrupt the digest by truncation).
  assert.throws(() => buildRegistryEntries([{ strate: 0, score: "5" }], { scale: 2n, predictorBase: "x" }), /not divisible by scale/, "inexact scale ⇒ THROW (C-9)");
  // 2^53 itself is exactly representable ⇒ accepted.
  assert.doesNotThrow(() => buildRegistryEntries([{ strate: 3, score: (2n ** 53n).toString() }], { scale: 1n, predictorBase: "x" }), "2^53 is the last exact float64 integer ⇒ accepted");
  // predictorBase is REQUIRED — no silent UNSPECIFIED default (C-G2-1 family, advisor closure).
  assert.throws(() => buildRegistryEntries([{ strate: 0, score: "5" }], { scale: 1n }), /predictorBase is REQUIRED/, "missing predictorBase ⇒ THROW (never a silent UNSPECIFIED key)");
});

test("u4_e2_fixtures_byte_identical — U-4b did NOT regenerate the e2 u4/ fixtures (C-17)", () => {
  assert.equal(lfSha(join(U4, "U4-book-23545087.json")), "743e9499f81055bec7ab4f6b9cb5fb27347b94cf85b40eb93fc63cebb9f1ec87");
  assert.equal(lfSha(join(U4, "U4-oracle-path-e2.jsonl")), "970357153ff60e305c8c6818439358db0140dc72d2eb538d5efbdf944b15daed");
  assert.equal(lfSha(join(U4, "U4-scores-e2.jsonl")), "8b84e095d9b66595bffc67fb9d525558cff1a37f133d97eda23250b2feaf0852");
});
