// scripts/census/u4-scores.mjs
// ============================================================================================
// U-4a (Ukemi, ADR-M020 D1 (b) + checkpoint-1 C-1/C-2/C-3, ADR-U3 test name) — REDUCER A-4: (book B₀, oracle path
// D_e, U3-realized labels) → per-ACCOUNT conformity scores for event e2, canonical order, calibDigest. PURE over
// its inputs (offline, no network); the CI test `u4_calibrates_from_u3_realized_labels` replays it from the reduced
// fixtures. NO commit / workflow (R-20).
//
// Y_i  (C-1)  = Σ (repayment_base + deficit_base) of the U3-realized e2 lines of user i (base, 8-dec). A U-3
//              `deficit_base_no_price` residue (deficit recorded natively, unpriced in U-3) is COMPLETED with the
//              C-12 USDT getAssetPrice at the realized line's block (oracle.usdt_prices); fail-closed if absent.
// ŷ_i  (P-1/C-3) = total_debt_base of i at book B₀ IF HF(D_e) < 1e18, else 0. HF(D_e) is the authoritative on-chain
//                  HF at B₀ scaled for the WETH leg at p_min = min AnswerUpdated over [B₀,B_last] (other assets at
//                  p_0): HF_min = hf0 · (riskAdjMin / riskAdj0) · (totalDebt0 / totalDebtMin), riskAdj = percentMul(
//                  collateral, LT). LT_WETH = the WETH reserve LT if emode = 0, else the account's e-mode category
//                  LT (getEModeCategoryData, C-3 — DECLARED simplification: applies the account's e-mode category
//                  LT to the WETH leg, i.e. assumes WETH is a collateral of that category — holds for category 1
//                  (Aave's ETH e-mode); NOT verified for the 12 non-cat-1 in-cell accounts (cat 2/11/19/23), a
//                  DECLARED residual — ADR-U4). Identity: at p_min = p_0, HF_min == hf0 EXACTLY (C-3 identity test).
// Cell (C-1) = { book accounts with ŷ > 0 } ∪ { liquidated users of e2 }. Y = 0 for an eligible-not-liquidated
//              account. Residuals COUNTED: liquidated_not_in_book, liquidated_not_eligible_under_De, eligible_not_
//              liquidated. Score_i = |Y_i − ŷ_i| (base 8-dec, NO clipping, C-2). Canonical order = by address.
//              n = |cell|; p = ⌈(n+1)·0.99⌉; q̂ = p-th smallest score; α = 0.01; nMin = 100.
// ============================================================================================
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve, dirname, join } from "node:path";
import { percentMul } from "../../apps/sentinel/src/ukemi/wadray.ts";
import { decodeEModeCategoryData } from "../../apps/sentinel/src/ukemi/abi.ts";

const WAD = 10n ** 18n;
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const E2 = "e2-2025-10-10-weth";
const UINT_MAX = 2n ** 256n - 1n;
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const USDT_DECIMALS = 6n; // USDT native has 6 decimals; getAssetPrice is base 8-dec ⇒ value_base = native·price / 1e6
const lc = (s) => String(s).toLowerCase();

/** PURE reducer. book = ukemi-book/1; oracle = { p_min, emode_lt: {cat:LT} }; u3 = array of U3-realized lines. */
export function computeScores(book, oracle, u3lines) {
  const pMin = BigInt(oracle.p_min);
  const emodeLT = oracle.emode_lt; // { "1":"9500", ... }
  const usdtPrices = oracle.usdt_prices ?? {}; // { "23550406":"100567000", ... } base 8-dec, per block (C-12)
  // WETH reserve (price p0, base LT, vDebt token)
  const wr = book.reserves.find((r) => lc(r.asset) === WETH);
  if (wr === undefined) throw new Error("u4-scores: WETH reserve absent from book");
  const p0 = BigInt(wr.price_base_8dec);
  const wethBaseLT = BigInt(wr.liquidation_threshold_bps);
  const aWeth = lc(wr.atoken), vWeth = lc(wr.variable_debt_token);

  // Y_i from U3-realized e2 (group by user). Y = repayment_base + deficit_base (checkpoint-1 C-1, D-5 ratified).
  // A U-3 `deficit_base_no_price` residue (deficit recorded natively, unpriced in U-3) is COMPLETED here with the
  // C-12 USDT getAssetPrice at the realized line's block (oracle.usdt_prices); FAIL-CLOSED on an unexpected asset
  // or a missing price (never a silent 0 — the pre-C-V-2 bug that dropped Y by deficit_native·price/1e6).
  const Yby = new Map();
  let deficitPricedFromUsdt = 0;
  for (const p of u3lines) {
    if (p.event_id !== E2) continue;
    const u = lc(p.user);
    let db = BigInt(p.deficit_base ?? "0");
    if (db === 0n && Array.isArray(p.residual) && p.residual.includes("deficit_base_no_price")) {
      const dn = BigInt(p.deficit_native ?? "0");
      if (dn > 0n) {
        if (lc(p.debt_asset) !== USDT) throw new Error(`u4-scores: deficit_base_no_price on non-USDT asset ${String(p.debt_asset)} — C-12 only priced USDT (fail-closed)`);
        const blk = String(p.first_block);
        const px = usdtPrices[blk];
        if (px === undefined) throw new Error(`u4-scores: no USDT price at block ${blk} for the deficit_base_no_price line (C-12 requires getAssetPrice(USDT)@${blk}; fail-closed)`);
        db = (dn * BigInt(px)) / (10n ** USDT_DECIMALS);
        deficitPricedFromUsdt++;
      }
    }
    Yby.set(u, (Yby.get(u) ?? 0n) + BigInt(p.repayment_base) + db);
  }

  // ŷ_i per book account + eligibility census
  const acct = new Map(); // addr -> { yhat, hfMin, eligibleDe, inBook:true, emode }
  let eligB0 = 0, eligDe = 0, emodeInCell = 0, clampNeg = 0;
  for (const a of book.accounts) {
    const addr = lc(a.address);
    const emode = BigInt(a.emode);
    const totalColl0 = BigInt(a.total_collateral_base);
    const totalDebt0 = BigInt(a.total_debt_base);
    const avgLT = BigInt(a.current_liquidation_threshold_bps);
    const hf0 = BigInt(a.hf_onchain);
    if (hf0 < WAD) eligB0++;
    const bal = (tok) => { const b = a.balances.find((x) => lc(x.token) === tok); return b ? BigInt(b.amount) : 0n; };
    const aWethBal = bal(aWeth), vWethBal = bal(vWeth);
    const wethColl0 = (aWethBal * p0) / WAD;   // base 8-dec (WETH = 18 dec)
    const wethCollMin = (aWethBal * pMin) / WAD;
    const wethDebt0 = (vWethBal * p0) / WAD;
    const wethDebtMin = (vWethBal * pMin) / WAD;
    let ltWeth;
    if (emode === 0n) ltWeth = wethBaseLT;
    else {
      const catLt = emodeLT[a.emode] ?? emodeLT[String(emode)]; // FAIL-CLOSED (was `?? wethBaseLT`): a missing e-mode category LT throws (C-3), never a silent reserve-LT fallback
      if (catLt === undefined) throw new Error(`u4-scores: e-mode category ${String(emode)} liquidation threshold missing from the oracle path emode_lt (fail-closed, C-3)`);
      ltWeth = BigInt(catLt);
    }
    const riskAdj0 = percentMul(totalColl0, avgLT);
    const riskAdjMin = riskAdj0 - percentMul(wethColl0, ltWeth) + percentMul(wethCollMin, ltWeth);
    if (riskAdjMin < 0n) clampNeg++; // counts ONLY riskAdjMin<0 (measured 0); does NOT certify the e-mode LT is right for the WETH leg — the 12 non-cat-1 in-cell accounts rely on the C-3 WETH-in-category assumption (ADR-U4 residual)
    const totalDebtMin = totalDebt0 - wethDebt0 + wethDebtMin;
    let hfMin;
    if (totalDebtMin <= 0n) hfMin = UINT_MAX;
    else if (riskAdj0 <= 0n) hfMin = 0n;
    else hfMin = (hf0 * (riskAdjMin < 0n ? 0n : riskAdjMin) * totalDebt0) / (riskAdj0 * totalDebtMin);
    const eligibleDe = hfMin < WAD;
    if (eligibleDe) eligDe++;
    const yhat = eligibleDe ? totalDebt0 : 0n;
    acct.set(addr, { yhat, hfMin, eligibleDe, inBook: true, emode });
  }

  // Cell = {ŷ>0} ∪ {liquidated}
  const cell = new Set();
  for (const [addr, v] of acct) if (v.yhat > 0n) cell.add(addr);
  for (const u of Yby.keys()) cell.add(u);

  // Residual census + score rows
  let liq_not_in_book = 0, liq_not_eligible_De = 0, elig_not_liq = 0, liq_in_cell = 0;
  const rows = [];
  for (const addr of cell) {
    const Y = Yby.get(addr) ?? 0n;
    const a = acct.get(addr);
    const inBook = a !== undefined;
    const yhat = inBook ? a.yhat : 0n;
    const liquidated = Y > 0n;
    if (liquidated) liq_in_cell++;
    if (liquidated && !inBook) liq_not_in_book++;
    if (liquidated && inBook && yhat === 0n) liq_not_eligible_De++;
    if (!liquidated && yhat > 0n) elig_not_liq++;
    if (inBook && a.emode !== 0n && (yhat > 0n || liquidated)) emodeInCell++;
    const score = Y > yhat ? Y - yhat : yhat - Y; // |Y − ŷ|, no clipping
    rows.push({ address: addr, y: Y.toString(), yhat: yhat.toString(), score: score.toString(), in_book: inBook, eligible_de: inBook ? a.eligibleDe : false, liquidated });
  }
  rows.sort((x, z) => (x.address < z.address ? -1 : x.address > z.address ? 1 : 0)); // canonical

  const n = rows.length;
  const scoresSorted = rows.map((r) => BigInt(r.score)).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const p = Math.ceil((n + 1) * 0.99);
  const qhat = n === 0 ? null : scoresSorted[Math.min(p, n) - 1].toString(); // p-th smallest (1-indexed), clamp to n
  const calibDigest = createHash("sha256").update(JSON.stringify(rows.map((r) => [r.address, r.y, r.yhat, r.score]))).digest("hex");

  return {
    predictor_id: "ukemi:realized-v1@eip155:1/aave-v3-core/weth/e2-2025-10-10",
    task_class: "liquidation-realized-given-oracle-path-24h",
    alpha: 0.01, n_min: 100, p_min_price: pMin.toString(),
    n, p, qhat, calib_digest: calibDigest,
    census: {
      eligible_static_b0: eligB0, eligible_under_De: eligDe, liquidated_total: Yby.size, liquidated_in_cell: liq_in_cell,
      liquidated_not_in_book: liq_not_in_book, liquidated_not_eligible_under_De: liq_not_eligible_De, eligible_not_liquidated: elig_not_liq,
      emode_nonzero_in_cell: emodeInCell, emode_lt_overstate_clamps: clampNeg, deficit_lines_priced_from_usdt: deficitPricedFromUsdt,
    },
    rows,
  };
}

// ── runner (offline; reads the raws + fixture). Run-guard: never on import (u4-probe pattern). ──
if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".."); // scripts/census -> repo root (C-V-2: no absolute worktree path)
  const bookPath = process.argv[2] ?? "F:/PRODUITS/etude-2026-09-20/u4-raws/U4-book-23545087.raw.json";
  const oraclePath = process.argv[3] ?? "F:/PRODUITS/etude-2026-09-20/u4-raws/U4-oracle-path-e2.raw.json";
  const u3Path = process.argv[4] ?? join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "u3", "U3-realized.jsonl");
  const emodeLTPath = process.argv[5]; // optional pre-decoded JSON {cat:LT}
  const book = JSON.parse(readFileSync(bookPath, "utf8")).book;
  const oracleRaw = JSON.parse(readFileSync(oraclePath, "utf8"));
  // emode_lt: an explicit path, else the reduced fixture's already-decoded map, else decode from the raw's
  // emode_raw exactly as u4-reduce.mjs does (so the runner reproduces the driver/test digest on the raw).
  let emodeLT;
  if (emodeLTPath) emodeLT = JSON.parse(readFileSync(emodeLTPath, "utf8"));
  else if (oracleRaw.emode_lt) emodeLT = oracleRaw.emode_lt;
  else { emodeLT = {}; for (const [cat, hex] of Object.entries(oracleRaw.emode_raw ?? {})) if (typeof hex === "string") emodeLT[cat] = decodeEModeCategoryData(hex).liquidationThresholdBps.toString(); }
  const oracle = { p_min: oracleRaw.p_min, emode_lt: emodeLT, usdt_prices: oracleRaw.usdt_prices ?? {} };
  const u3 = readFileSync(u3Path, "utf8").split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  const out = computeScores(book, oracle, u3);
  const { rows, ...summary } = out;
  process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
}
