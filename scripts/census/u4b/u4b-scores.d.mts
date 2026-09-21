// Type declarations for scripts/census/u4b/u4b-scores.mjs (U-4b-1a close-factor reducer). See the .mjs header.
export interface U4bReserve {
  asset: string; atoken: string; variable_debt_token: string; decimals: string;
  liquidation_threshold_bps: string; liquidation_bonus_bps: string; reserve_emode_category: string;
  price_base_8dec: string; [k: string]: unknown;
}
export interface U4bAccount {
  address: string; user_config: string; emode: string;
  balances: Array<{ token: string; amount: string }>;
  total_collateral_base: string; total_debt_base: string;
  current_liquidation_threshold_bps: string; hf_onchain: string; eligible_static: boolean; [k: string]: unknown;
}
export interface U4bBook { reserves: U4bReserve[]; accounts: U4bAccount[]; [k: string]: unknown }
/** Oracle path: anchor_price = the pre-B₀ anchor (base 8-dec, string); updates = AnswerUpdated series; emode_params
 *  maps an e-mode category id (string) to its liquidationThreshold + liquidationBonus in bps (string). */
export interface U4bOracle {
  event_id: string;
  anchor_price: string;
  updates: Array<{ block: number; log_index?: number; logIndex?: number; price: string }>;
  emode_params: Record<string, { lt: string; bonus: string }>;
  usdt_prices?: Record<string, string>;
}
export interface U4bU3Line {
  event_id: string; user: string; repayment_base: string; deficit_base?: string;
  deficit_native?: string; residual?: string[]; first_block?: number; debt_asset?: string; [k: string]: unknown;
}
export interface U4bScoreRow {
  address: string; y: string; yhat: string; score: string; liquidated: boolean; strate: number;
  m_bps: string | null; pstar: string | null;
}
export interface U4bStratum { strate: number; n: number; p: number | null; qhat: string | null; calib_digest: string; max_score: string }
export interface U4bCell {
  predictor_id: string; task_class: string; alpha: number; n_min: number; anchor_price: string;
  n: number; p: number | null; qhat: string | null; calib_digest: string; strata: U4bStratum[]; rows: U4bScoreRow[];
}
export interface U4bCensus {
  accounts: number; no_aweth: number; non_evaluable_x: number; non_evaluable_x_smallpos: number;
  non_evaluable_emode: number; crossed: number; crossed_yhat_zero: number; no_crossing: number; pstar_is_anchor: number;
  ca_binding: number; ca_binding_emode: number; sum_ne_max: number; dust_bounded: number; dust_bounded_emode: number;
  lst_debt_at_p0: string; lst_effect_accounts: number; lst_effect_abs_sum: string;
  deficit_lines_priced_from_usdt: number; liquidated_total: number; liquidated_not_in_book: number;
  liquidated_non_evaluable: number; [k: string]: number | string;
}
export interface U4bResult { cellA: U4bCell; cellB: U4bCell; census: U4bCensus }
/** PURE reducer (C-1/C-7/C-8/C-13/C-14): (reduced book B₀, D_e oracle path with pre-B₀ anchor, U3-realized e2
 *  labels) → per-account |Y−ŷ| scores at the per-account FIRST CROSSING p*, two Mondrian cells, per-cell +
 *  per-stratum digests. Offline; the CI test replays it from the reduced fixtures. */
export function computeScoresU4b(book: U4bBook, oracle: U4bOracle, u3lines: readonly U4bU3Line[]): U4bResult;
/** Mondrian strate of a ŷ (base 8-dec): cuts {2000e8, 100k$, 1M$} → 0..3. Server-side in -2 (C-10). */
export function strateOf(yhat: bigint | string | number): number;
export const STRATA_CUTS: bigint[];
/** Runner input paths (argv[2..4]) — ALL required, no episode default (C-G2-1). Throws if any is absent. */
export function resolveRunnerInputs(argv: readonly string[]): { book: string; oracle: string; u3: string };
