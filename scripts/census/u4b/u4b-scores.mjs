// scripts/census/u4b/u4b-scores.mjs
// ============================================================================================
// U-4b-1a (Ukemi, ADR-U4b; G0-lot-u4b §3/§4; checkpoint-1 C-1/C-7/C-8/C-13/C-14) — REDUCER (A-4 for the fresh
// episode; here OFFLINE on e2, the DESIGN set, NEVER served): (reduced u4b book B₀, oracle path D_e with a
// pre-B₀ ANCHOR, U3-realized labels) → per-ACCOUNT conformity scores at CLOSE FACTOR v3.5.0 evaluated at the
// PER-ACCOUNT FIRST CROSSING p*, canonical order, per-cell + per-stratum digests. PURE over its inputs (offline,
// no network). NO commit / workflow (R-20). This code is FROZEN by sha256 in the -1b prereg (C-12): its bytes are
// fixed BEFORE the fresh data exists (anti selection-on-the-outcome).
//
// p*   (C-1) = the FIRST price along [anchor p0, then D_e AnswerUpdated in (block,logIndex) order] at which
//              HF(p*) < 1e18, PER ACCOUNT. HF uses the u4-scores scaling identity (hf0 · riskAdj(p)/riskAdj0 ·
//              totalDebt0/totalDebt(p)), WETH legs (aWETH collat + vWETH debt) repriced at p, other assets held
//              at p0 (declared D2 limit), LT_WETH = reserve LT if emode=0 else the WETH e-mode category LT.
//              Edge: HF(anchor p0) < 1e18 ⇒ p*=p0 (H-7: HF(anchor)==hf0 exactly). No crossing ⇒ ŷ=0 (Y counted).
// ŷ    (C-1/C-7) = max over the account's DEBT reserves r_d of ŷ_base(r_d, WETH) — one call liquidates ONE pair
//              (the liquidator picks the best single call; MAX, never Σ). Per pair, at p*:
//                 CF_base = min(D_r, 0.5·D_tot)  if C_weth ≥ 2000e8 AND D_r ≥ 2000e8 AND HF > 0.95e18  (STRICT)
//                         = D_r                   otherwise
//                 ŷ_base  = min(CF_base, C_weth / m)                                   [collateral-availability cap]
//              m = liquidation-bonus multiplier of the collateral reserve (WETH): reserve bonus if emode=0, else
//              the WETH e-mode category bonus decoded from emode_raw (C-14). D_tot at p*, D_r(WETH)@p*, others@p0.
// dust (C-13, E-I-4(b)) = ŷ UNCHANGED + a `dust_bounded` residue counted on the triggering pair (r_d*, WETH) when
//              the Solidity MustNotLeaveDust gate would revert: (ŷ < D_r AND ŷ·m < C_weth) AND ((D_r−ŷ) < 1000e8
//              OR (C_weth−ŷ·m) < 1000e8). The inner clause is OU (either leg dusty), never AND.
// Cells: A `liquidation-eligible-coverage` = {ŷ>0} ∪ {liquidated}, MONDRIAN-stratified by ŷ size (cuts
//        {2000e8,100k$,1M$}); B `liquidation-realized-given-liquidated` = {liquidated}. mono-collateral-WETH ONLY
//        (X=0 exact: non_evaluable if total_collateral_base ≠ aWETH·p0/1e18 or aWETH=0). e-mode fail-closed to
//        {0, WETH-category}: any other e-mode ⇒ non_evaluable (WETH∈category not verifiable off-line). score =
//        |Y − ŷ| (base 8-dec, no clipping). Per-cell AND per-stratum calib_digest (sha256 of canonical rows).
// ============================================================================================
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { percentMul } from "../../../apps/sentinel/src/ukemi/wadray.ts";
import { decodeEModeCategoryData } from "../../../apps/sentinel/src/ukemi/abi.ts";

const WAD = 10n ** 18n;
const MAXU = 2n ** 256n - 1n;
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const USDT_DECIMALS = 6n;
const NMIN = 100;                 // per-stratum minimum; below it ⇒ under_calib (q̂ null, never clamped)
const T = 2000n * 10n ** 8n;      // MIN_BASE_MAX_CLOSE_FACTOR_THRESHOLD = 2000e8 (PR-U4-3:127)
const LEFT = 1000n * 10n ** 8n;   // MIN_LEFTOVER_BASE = 1000e8 (PR-U4-3:128)
const HF95 = 95n * 10n ** 16n;    // CLOSE_FACTOR_HF_THRESHOLD = 0.95e18 (PR-U4-3:126)
const CF_BPS = 5000n;             // DEFAULT_LIQUIDATION_CLOSE_FACTOR = 0.5e4 (PR-U4-3:124)
const lc = (s) => String(s).toLowerCase();

/** Mondrian strata cuts on ŷ (base 8-dec): {2000e8, 100k$, 1M$} → k ∈ {0,1,2,3}. Fixed A PRIORI (Mondrian 2003
 *  §4.4: κ chosen before data). SERVER-SIDE in -2 (the caller never picks its strate) — EXPORTED, imported by
 *  gate.ts strateOf(yhat) (C-10). */
export const STRATA_CUTS = [2n * 10n ** 11n, 1n * 10n ** 13n, 1n * 10n ** 14n];
export function strateOf(yhat) {
  const y = BigInt(yhat);
  let k = 0;
  for (const c of STRATA_CUTS) { if (y < c) return k; k++; }
  return k;
}

const digestOf = (rows) => createHash("sha256").update(JSON.stringify(rows.map((r) => [r.address, r.y, r.yhat, r.score]))).digest("hex");
const qhatOf = (rows) => {
  const n = rows.length;
  const p = n === 0 ? null : Math.ceil((n + 1) * 0.99);
  // FAIL-CLOSED (L1 rule, mirrors @monark/hikae splitQuantile): n < nMin OR p > n ⇒ under_calib ⇒ q̂ null,
  // NEVER a silently clamped max (the served q̂ in -2 comes from splitQuantile; this diagnostic matches its rule).
  if (p === null || n < NMIN || p > n) return { n, p, qhat: null };
  const s = rows.map((r) => BigInt(r.score)).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return { n, p, qhat: s[p - 1].toString() };
};
const maxScoreOf = (rows) => rows.reduce((m, r) => (BigInt(r.score) > m ? BigInt(r.score) : m), 0n).toString();

/** PURE reducer. book = reduced u4b book; oracle = { event_id, anchor_price, updates:[{block,log_index,price}],
 *  emode_params:{cat:{lt,bonus}}, usdt_prices }; u3 = U3-realized lines. EPISODE-AGNOSTIC: the event id is a
 *  PARAMETER (never hard-coded), so the FROZEN bytes (C-12) run unchanged on the fresh -1b episode. */
export function computeScoresU4b(book, oracle, u3lines) {
  const eventId = oracle.event_id;
  if (eventId === undefined) throw new Error("u4b-scores: oracle.event_id is REQUIRED (fail-closed — the frozen score code is episode-agnostic, C-12; a hard-coded episode would defeat the freeze)");
  // (C-G2-2) the pre-B₀ anchor is REQUIRED and must be > 0: a missing/zero anchor would make every account "cross"
  // at price 0 (garbage scoring), silently — in -1b the anchor is a real AnswerUpdated ≤ B₀ that could be absent.
  if (oracle.anchor_price === undefined) throw new Error("u4b-scores: oracle.anchor_price is REQUIRED (fail-closed, C-G2-2 — a missing pre-B₀ anchor degenerates the first-crossing traversal)");
  const anchorPrice = BigInt(oracle.anchor_price);
  if (anchorPrice <= 0n) throw new Error("u4b-scores: oracle.anchor_price must be > 0 (a zero/negative anchor makes every account 'cross' at price 0 — garbage scoring, C-G2-2)");
  const emodeParams = oracle.emode_params ?? {}; // { "1": { lt:"9500", bonus:"10100" }, ... }
  const usdtPrices = oracle.usdt_prices ?? {};

  // WETH reserve (collateral leg, scaling reference p0) + reserve maps.
  const wr = book.reserves.find((r) => lc(r.asset) === WETH);
  if (wr === undefined) throw new Error("u4b-scores: WETH reserve absent from book");
  const p0 = BigInt(wr.price_base_8dec);
  const aWeth = lc(wr.atoken), vWeth = lc(wr.variable_debt_token);
  const wethBaseLT = BigInt(wr.liquidation_threshold_bps);
  const wethBaseBonus = BigInt(wr.liquidation_bonus_bps);
  const wethEmCat = BigInt(wr.reserve_emode_category); // = 1 (Aave's ETH-correlated category)
  const resByV = new Map(); // vtoken -> { asset, price, dec, emcat }
  for (const r of book.reserves) resByV.set(lc(r.variable_debt_token), { asset: lc(r.asset), price: BigInt(r.price_base_8dec), dec: BigInt(r.decimals), emcat: BigInt(r.reserve_emode_category) });

  // price path: pre-B₀ ANCHOR (C-8 entry 7) then D_e updates in (block, logIndex) order.
  const upd = oracle.updates.slice().sort((a, b) => a.block - b.block || (a.log_index ?? a.logIndex ?? 0) - (b.log_index ?? b.logIndex ?? 0));
  const path = [anchorPrice, ...upd.map((u) => BigInt(u.price))];

  // Y_i from U3-realized e2 (repayment + deficit, USDT deficit completion — mirrors u4-scores, FAIL-CLOSED).
  const Yby = new Map();
  let deficitPricedFromUsdt = 0;
  for (const p of u3lines) {
    if (p.event_id !== eventId) continue;
    const u = lc(p.user);
    let db = BigInt(p.deficit_base ?? "0");
    if (db === 0n && Array.isArray(p.residual) && p.residual.includes("deficit_base_no_price")) {
      const dn = BigInt(p.deficit_native ?? "0");
      if (dn > 0n) {
        if (lc(p.debt_asset) !== USDT) throw new Error(`u4b-scores: deficit_base_no_price on non-USDT asset ${String(p.debt_asset)} (fail-closed)`);
        const px = usdtPrices[String(p.first_block)];
        if (px === undefined) throw new Error(`u4b-scores: no USDT price at block ${String(p.first_block)} for the deficit_base_no_price line (fail-closed)`);
        db = (dn * BigInt(px)) / (10n ** USDT_DECIMALS);
        deficitPricedFromUsdt++;
      }
    }
    Yby.set(u, (Yby.get(u) ?? 0n) + BigInt(p.repayment_base) + db);
  }

  // Per-account ŷ + census.
  const acct = new Map(); // addr -> { yhat, evaluable, liquidated, m_bps, pstar, strate } | { ne }
  const census = {
    accounts: book.accounts.length, no_aweth: 0, non_evaluable_x: 0, non_evaluable_x_smallpos: 0, non_evaluable_emode: 0,
    crossed: 0, crossed_yhat_zero: 0, no_crossing: 0, pstar_is_anchor: 0, ca_binding: 0, ca_binding_emode: 0, sum_ne_max: 0,
    dust_bounded: 0, dust_bounded_emode: 0, lst_debt_at_p0: "0", lst_effect_accounts: 0, lst_effect_abs_sum: "0",
    deficit_lines_priced_from_usdt: deficitPricedFromUsdt,
  };
  let lstDebtSum = 0n, lstEffectSum = 0n;

  for (const a of book.accounts) {
    const addr = lc(a.address);
    const emode = BigInt(a.emode);
    const totalColl0 = BigInt(a.total_collateral_base);
    const totalDebt0 = BigInt(a.total_debt_base);
    const avgLT = BigInt(a.current_liquidation_threshold_bps);
    const hf0 = BigInt(a.hf_onchain);
    const balOf = (tok) => { const x = a.balances.find((z) => lc(z.token) === tok); return x ? BigInt(x.amount) : 0n; };
    const aWethBal = balOf(aWeth), vWethBal = balOf(vWeth);
    const wethColl0 = (aWethBal * p0) / WAD;
    const wethDebt0 = (vWethBal * p0) / WAD;

    // (C-8) mono-collateral WETH, X = 0 EXACT. GenericLogic floors balance·price/unit per reserve ⇒ a pure-WETH
    // account has total_collateral_base == aWETH·p0/1e18 EXACTLY. A non-zero residue = non-WETH collateral (not
    // itemized in the book, cannot be repriced off-line) ⇒ non_evaluable, never estimated. aWETH=0 ⇒ no collateral.
    if (aWethBal === 0n) { census.no_aweth++; acct.set(addr, { ne: "no_aweth" }); continue; }
    const residual = totalColl0 - wethColl0;
    if (residual !== 0n) { census.non_evaluable_x++; if (residual > 0n && residual < 10n ** 8n) census.non_evaluable_x_smallpos++; acct.set(addr, { ne: "non_mono_weth" }); continue; }

    // (C-14) e-mode fail-closed to {0, WETH-category}: getEModeCategoryData carries no collateralBitmap, so
    // WETH∈category is NOT verifiable off-line for any other category ⇒ non_evaluable (cleaner than u4-scores'
    // declared cross-category assumption).
    let ltWeth, bonusWeth;
    if (emode === 0n) { ltWeth = wethBaseLT; bonusWeth = wethBaseBonus; }
    else if (emode === wethEmCat) {
      const e = emodeParams[String(emode)];
      if (e === undefined) throw new Error(`u4b-scores: WETH e-mode category ${String(emode)} params missing from emode_params (fail-closed, C-14)`);
      ltWeth = BigInt(e.lt); bonusWeth = BigInt(e.bonus);
    } else { census.non_evaluable_emode++; acct.set(addr, { ne: "non_evaluable_emode" }); continue; }

    const riskAdj0 = percentMul(totalColl0, avgLT);
    const hfAt = (p) => {
      const wc = (aWethBal * p) / WAD, wd = (vWethBal * p) / WAD;
      const ra = riskAdj0 - percentMul(wethColl0, ltWeth) + percentMul(wc, ltWeth);
      const td = totalDebt0 - wethDebt0 + wd;
      if (td <= 0n) return MAXU;
      if (riskAdj0 <= 0n) return 0n;
      return (hf0 * (ra < 0n ? 0n : ra) * totalDebt0) / (riskAdj0 * td);
    };

    // First crossing along the path (anchor first).
    let pStar = null, hfStar = null;
    for (const p of path) { const hf = hfAt(p); if (hf < WAD) { pStar = p; hfStar = hf; break; } }
    if (pStar === null) { census.no_crossing++; acct.set(addr, { yhat: 0n, evaluable: true, liquidated: (Yby.get(addr) ?? 0n) > 0n }); continue; }
    census.crossed++;
    if (pStar === anchorPrice) census.pstar_is_anchor++;

    const C_weth = (aWethBal * pStar) / WAD;
    const CA = (C_weth * 10000n) / bonusWeth; // collateral-availability cap C_weth / m, m = bonus/1e4
    const wethDebtStar = (vWethBal * pStar) / WAD;
    const D_tot = totalDebt0 - wethDebt0 + wethDebtStar;
    const halfDtot = percentMul(D_tot, CF_BPS);

    // ŷ = max over debt reserves; LST counterfactual in the same pass (C-8 entry 4).
    let yhat = 0n, ySum = 0n, rdStarDebt = 0n, caBindsAtStar = false;
    let yhatLst = 0n, lstDebtAcct = 0n;
    for (const bal of a.balances) {
      const r = resByV.get(lc(bal.token));
      if (r === undefined) continue; // aWETH (collateral) or an unknown token
      const amt = BigInt(bal.amount);
      if (amt === 0n) continue;
      const isWeth = r.asset === WETH;
      const priceR = isWeth ? pStar : r.price;
      const D_r = (amt * priceR) / (10n ** r.dec);
      if (D_r === 0n) continue;
      const gate = C_weth >= T && D_r >= T && hfStar > HF95;
      const CF = gate ? (D_r < halfDtot ? D_r : halfDtot) : D_r;
      const yb = CF < CA ? CF : CA;
      ySum += yb;
      if (yb > yhat) { yhat = yb; rdStarDebt = D_r; caBindsAtStar = CA < CF; }
      // LST (reserve in the WETH e-mode category, ≠ WETH): reprice its debt by pStar/p0 (ETH-correlated) —
      // counterfactual ONLY, ŷ itself holds it at p0. rsETH (emcat 0) is DECLARED out (not in the category).
      const isLst = !isWeth && r.emcat === wethEmCat;
      if (isLst) lstDebtAcct += D_r;
      const priceL = isLst ? (r.price * pStar) / p0 : priceR;
      const D_rL = (amt * priceL) / (10n ** r.dec);
      const CF_L = gate ? (D_rL < halfDtot ? D_rL : halfDtot) : D_rL;
      const yb_L = CF_L < CA ? CF_L : CA;
      if (yb_L > yhatLst) yhatLst = yb_L;
    }
    if (ySum !== yhat) census.sum_ne_max++;
    if (caBindsAtStar) { census.ca_binding++; if (emode !== 0n) census.ca_binding_emode++; }
    lstDebtSum += lstDebtAcct;
    if (yhatLst !== yhat) { census.lst_effect_accounts++; lstEffectSum += (yhat > yhatLst ? yhat - yhatLst : yhatLst - yhat); }

    // (C-13) dust on the triggering pair (r_d*, WETH): ŷ unchanged, count only.
    const seized = percentMul(yhat, bonusWeth); // collateral seized in base ≈ ŷ·m
    if (yhat < rdStarDebt && seized < C_weth && ((rdStarDebt - yhat) < LEFT || (C_weth - seized) < LEFT)) {
      census.dust_bounded++; if (emode !== 0n) census.dust_bounded_emode++;
    }

    if (yhat === 0n) census.crossed_yhat_zero++; // crossed HF<1e18 but every D_r floors to 0 ⇒ ŷ=0 (out of cell unless liquidated); NEVER a silent 0
    acct.set(addr, { yhat, evaluable: true, liquidated: (Yby.get(addr) ?? 0n) > 0n, m_bps: bonusWeth.toString(), pstar: pStar.toString(), strate: strateOf(yhat) });
  }
  census.lst_debt_at_p0 = lstDebtSum.toString();
  census.lst_effect_abs_sum = lstEffectSum.toString();

  // liquidated residues: not-in-book / non-evaluable.
  let liqNotInBook = 0, liqNonEval = 0;
  for (const u of Yby.keys()) {
    const v = acct.get(u);
    if (v === undefined) liqNotInBook++;
    else if (v.ne !== undefined) liqNonEval++;
  }
  census.liquidated_total = Yby.size;
  census.liquidated_not_in_book = liqNotInBook;
  census.liquidated_non_evaluable = liqNonEval;

  // Build cells A (elig ∪ liq) and B (liq only), evaluable accounts only.
  const rowOf = (addr, v) => {
    const Y = Yby.get(addr) ?? 0n;
    const yhat = v.yhat ?? 0n;
    const score = Y > yhat ? Y - yhat : yhat - Y;
    return { address: addr, y: Y.toString(), yhat: yhat.toString(), score: score.toString(), liquidated: Y > 0n, strate: strateOf(yhat), m_bps: v.m_bps ?? null, pstar: v.pstar ?? null };
  };
  const rowsA = [], rowsB = [];
  for (const [addr, v] of acct) {
    if (v.ne !== undefined) continue;
    const Y = Yby.get(addr) ?? 0n;
    const liq = Y > 0n;
    if ((v.yhat ?? 0n) > 0n || liq) rowsA.push(rowOf(addr, v));
    if (liq) rowsB.push(rowOf(addr, v));
  }
  const canon = (rows) => rows.sort((x, z) => (x.address < z.address ? -1 : x.address > z.address ? 1 : 0));
  canon(rowsA); canon(rowsB);

  const stratify = (rows) => [0, 1, 2, 3].map((k) => {
    const sr = rows.filter((r) => r.strate === k);
    return { strate: k, ...qhatOf(sr), calib_digest: digestOf(sr), max_score: maxScoreOf(sr) };
  });
  const cellOf = (predictorSuffix, taskClass, rows) => ({
    predictor_id: `ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/${eventId}/${predictorSuffix}`,
    task_class: taskClass, alpha: 0.01, n_min: 100, anchor_price: anchorPrice.toString(),
    ...qhatOf(rows), calib_digest: digestOf(rows), strata: stratify(rows), rows,
  });

  return {
    cellA: cellOf("A", "liquidation-eligible-coverage", rowsA),
    cellB: cellOf("B", "liquidation-realized-given-liquidated", rowsB),
    census,
  };
}

/** Runner input paths — ALL required, NO episode default (C-G2-1): the frozen runner must be pointed at the
 *  episode's fixtures explicitly, never silently at the e2 design set. Exported so the guard is unit-tested. */
export function resolveRunnerInputs(argv) {
  const book = argv[2], oracle = argv[3], u3 = argv[4];
  if (book === undefined || oracle === undefined || u3 === undefined) throw new Error("u4b-scores runner: <book.json> <oracle.jsonl> <u3-realized.jsonl> paths are ALL REQUIRED (no e2 default — episode-agnostic, C-G2-1)");
  return { book, oracle, u3 };
}

// ── runner (offline; reads the reduced u4b fixtures). Run-guard: never on import. ──
if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const { book: bookPath, oracle: oraclePath, u3: u3Path } = resolveRunnerInputs(process.argv);
  const book = JSON.parse(readFileSync(bookPath, "utf8"));
  const oLines = readFileSync(oraclePath, "utf8").split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  const anchor = oLines.find((l) => l.kind === "anchor");
  const meta = oLines.find((l) => l.kind === "meta");
  const updates = oLines.filter((l) => l.kind === "update");
  const u3 = readFileSync(u3Path, "utf8").split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  const oracle = { event_id: meta.event_id, anchor_price: anchor.price, updates, emode_params: meta.emode_params, usdt_prices: meta.usdt_prices };
  const out = computeScoresU4b(book, oracle, u3);
  process.stdout.write(JSON.stringify({ cellA: { n: out.cellA.n, qhat: out.cellA.qhat, calib_digest: out.cellA.calib_digest, strata: out.cellA.strata.map((s) => ({ k: s.strate, n: s.n, q: s.qhat })) }, cellB: { n: out.cellB.n, qhat: out.cellB.qhat, calib_digest: out.cellB.calib_digest }, census: out.census }, null, 2) + "\n");
}
