/**
 * Tool error codes of contract 1.1.0: a closed list, in
 * order. The first 24 are the harness codes in their order; the last 8 follow them:
 * input_invalid and json_invalid, then the 6 kata codes.
 * A code is never renamed, removed or reused for another refusal. The list is served nowhere.
 */
export const TOOL_ERROR_CODES = [
  "param_invalid", "schema_version_unsupported", "byo_calibration_invalid", "byo_yhat_type", "byo_set_tau_cap",
  "yhat_type_mismatch", "liq_yhat_domain", "attested_inconsistent", "task_class_unknown", "byo_overrides_committed",
  "byo_edge_blank", "byo_lookalike_committed", "byo_reserved_kata", "byo_lookalike_confusable",
  "produced_at_invalid", "produced_at_future", "output_invalid",
  "policy_alpha_mismatch", "policy_nmin_mismatch", "task_class_retired",
  "attest_refused", "calibrate_input_invalid", "cascade_input_invalid", "ukemi_predict_input_invalid",
  "input_invalid", "json_invalid", "kata_key_invalid", "kata_yhat_domain", "features_digest_required", "policy_tau_cap",
  "produced_at_off_grid", "produced_at_stale",
] as const;
export type ToolErrorCode = (typeof TOOL_ERROR_CODES)[number];
