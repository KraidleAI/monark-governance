// MONARK Bell — the SINGLE closed runtime source of residual codes (ADR-T1aii C-9, ADR-B0 D8). A residual
// is a NAMED reason the collector could not produce a clean fact; every one is COUNTED in state.json (D8),
// never bucketed in silence. The closed map is the UNION of the T-1a-i halt residues (halts.ts HaltResidue)
// and the collector residues added at T-1a-ii (iii/iv/quorum). ONE array, ONE counter factory: collect.ts
// imports these and never re-declares them, so the residual map has a single runtime source of truth
// (test bell_residual_map_is_single_source; a second parallel list would drift and redden).
//
// NOTE (doc 03, code prevails): halts.ts carries `resume_date_gt_halt_date`, which the ADR C-9 enumeration
// omitted. The measured code is the truth, so it is listed here; the omission is reported at G1.
import type { HaltResidue } from "./halts.ts";

// The halt residues exactly as halts.ts produces them (T-1a-i). Bound to HaltResidue at the type level below,
// so adding/removing a halt residue in halts.ts without matching this list is a COMPILE error.
export const HALT_RESIDUE_CODES = [
  "resume_time_missing",
  "resume_date_gt_halt_date",
  "no_fill_in_window",
  "reason_unknown",
  "block_ts_vs_submission",
] as const;

// The collector residues added at T-1a-ii (iii volume/ADV, iv supply/PoR, quorum). `volume_zero` is NOT
// here: C-9 retires it to `no_fill_in_window` (a zero-volume session already abstains there).
export const COLLECTOR_RESIDUE_CODES = [
  "no_close_ref", // V-7: closeRef missing / <= 0 for a filled session — abstain, never a fabricated gap
  "por_unavailable", // iv: no first-hand proof-of-reserves source named for a token
  "por_stale", // iv: the PoR value's updatedAt is older than the staleness bound
  "no_wrapper", // iv: no wrapper/bridge contract named for a token
  "multiplier_unit", // iii/iv: token unit vs share unit differ by a scaled-UI multiplier != 1
  "no_quorum", // C-1: fewer than two distinct providers answered a read
  "quorum_sampled", // C-1: bodies concorded on a deterministic sample, not the full set (coverage published)
  "rebase_unverified", // C-6 (D1-bis): the scaled-UI multiplier was not verified CONSTANT across the pool-window
                       // (unread at a bound, or changed) — the session abstains, never a silently rescaled g_t
  "authority_scan_mono_operator", // D1-quater (decision 60): a trajectory_known reconstructed by the hybrid AUTHORITY
                       // scan carries this — the authority enumeration (getTransactionsForAddress) is Helius-only; a
                       // Helius omission that would change the final state is caught by C-3, one that would not is not
  "set_authority_unscanned", // D1-quater (decision 60, C-12): the mint's SetAuthority history is not scanned — a
                       // signer-side A->B->A authority change with self-cancelling B-signed updates is the residual gap
] as const;

/** The ONE closed list of residual codes (union). Iterated to build the counter and to check state.json. */
export const RESIDUAL_CODES = [...HALT_RESIDUE_CODES, ...COLLECTOR_RESIDUE_CODES] as const;
export type Residual = (typeof RESIDUAL_CODES)[number];

// Type-level binding to halts.ts (C-9 single source). (1) every HALT_RESIDUE_CODES entry IS a HaltResidue;
// (2) every HaltResidue is covered by HALT_RESIDUE_CODES. If halts.ts diverges, one line fails to compile.
const _everyCodeIsHaltResidue: readonly HaltResidue[] = HALT_RESIDUE_CODES;
type _EveryHaltResidueCovered = HaltResidue extends (typeof HALT_RESIDUE_CODES)[number] ? true : never;
const _covered: _EveryHaltResidueCovered = true;
void _everyCodeIsHaltResidue;
void _covered;

export type ResidualCounts = Record<Residual, number>;
/** A fresh counter with every residual at 0 — the ONE factory state.json uses (D8). */
export function newResidualCounts(): ResidualCounts {
  const out = {} as ResidualCounts;
  for (const c of RESIDUAL_CODES) out[c] = 0;
  return out;
}
