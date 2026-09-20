// Type declarations for scripts/census/u4-scores.mjs (U-4a A-4 reducer). See the .mjs header for the model.
export interface U4Reserve {
  asset: string; atoken: string; variable_debt_token: string; decimals: string;
  liquidation_threshold_bps: string; price_base_8dec: string; [k: string]: unknown;
}
export interface U4Account {
  address: string; user_config: string; emode: string;
  balances: Array<{ token: string; amount: string }>;
  total_collateral_base: string; total_debt_base: string;
  current_liquidation_threshold_bps: string; hf_onchain: string; eligible_static: boolean; [k: string]: unknown;
}
export interface U4Book { schema: string; reserves: U4Reserve[]; accounts: U4Account[]; [k: string]: unknown }
/** D_e reduction: p_min = min AnswerUpdated price over [B₀,B_last] (base 8-dec, string); emode_lt maps an
 *  e-mode category id (as string) to its liquidationThreshold in bps (string). */
export interface U4Oracle { p_min: string; emode_lt: Record<string, string> }
export interface U3RealizedLine {
  event_id: string; user: string; repayment_base: string; deficit_base: string; [k: string]: unknown;
}
export interface U4ScoreRow { address: string; y: string; yhat: string; score: string; in_book: boolean; eligible_de: boolean; liquidated: boolean }
export interface U4Census {
  eligible_static_b0: number; eligible_under_De: number; liquidated_total: number; liquidated_in_cell: number;
  liquidated_not_in_book: number; liquidated_not_eligible_under_De: number; eligible_not_liquidated: number;
  emode_nonzero_in_cell: number; emode_lt_overstate_clamps: number;
}
export interface U4ScoresResult {
  predictor_id: string; task_class: string; alpha: number; n_min: number; p_min_price: string;
  n: number; p: number; qhat: string | null; calib_digest: string; census: U4Census; rows: U4ScoreRow[];
}
/** PURE reducer (C-1/C-2/C-3): (book B₀, D_e oracle path, U3-realized e2 labels) → per-account |Y−ŷ| scores,
 *  canonical order (by address), calibDigest. Offline; the CI test replays it from the reduced fixtures. */
export function computeScores(book: U4Book, oracle: U4Oracle, u3lines: U3RealizedLine[]): U4ScoresResult;
