// SENTINEL — off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// The append-only timeline engine (ADR-M012 D2/D4): one line per processed window, a per-line hash chain
// over fact+score+state+prev_line_hash (a rewrite is DETECTABLE, never certified — the only guarantor of
// facts is the on-chain recompute + trackerReplay). ONE tracker steps on EVERY evaluable pair (Thm 1 holds
// for an arbitrary sequence; excluding a pair would fabricate a regime). The regime {floor, stress} is
// recomputable METADATA, never a tracker filter. E_tracker comes from trackerStep; E_static = 1{s > q̂} is
// computed directly from the committed q̂ (never a gate verdict); B_t is budgetAt over E_static, labelDelay 1
// (no-peek); rolling90_calm_miss counts misses over CALM pairs only; a rolling value >= 0.40 sets
// `drift_flag` and NOTHING else (a drift only OPENS an ADR — never an automatic switch). q̂ = q1 is the
// split quantile of the COMMITTED calibration, recomputed at init, never pasted (test 12d).
import { createHash } from "node:crypto";
import { trackerInit, trackerStep, trackerStepSize, trackerReplay, trackerDigest, clipScore } from "@monark/hikae";
import type { TrackerParams, TrackerState, Miscover } from "@monark/hikae";
import { splitQuantile, budgetAt } from "@monark/hikae";
import { USDE_STABLE_RUN_CALIB } from "@monark/harness/calibration";
import type { AttestResult, WindowFacts } from "./flow.ts";

/** Pre-registered parameters (ADR-M012 D6). `c = B = 1/24`, ε = 0.1, t0 = 0, α = 0.10, δ_target = 0.10. */
export const TRACKER_PARAMS: TrackerParams = { alpha: 0.1, c: 1 / 24, eps: 0.1, t0: 0, B: 1 / 24 };
export const DELTA_TARGET = 0.1;
export const LABEL_DELAY = 1;
export const S_FLOOR = 10n ** 25n;        // 10,000,000 USDe (wei) — regime floor
export const CALM_WINDOW = 90;             // drift is evaluable after 90 calm pairs
export const DRIFT_THRESHOLD = 0.4;        // r_t >= 0.40 (= 0.30 in-sample max + α) opens an ADR

/** q1 = split quantile of the committed calibration (α, nMin 50), recomputed — NEVER pasted (test 12d). */
export function committedQ1(): number {
  const r = splitQuantile(USDE_STABLE_RUN_CALIB, TRACKER_PARAMS.alpha, 50);
  if (!("qhat" in r)) throw new Error("committedQ1: committed calibration is under_calib — cannot seed the tracker");
  return r.qhat;
}

/** Regime is calm iff the opening stock clears the floor AND < 1% of it redeemed (exact integer test). */
export function isCalm(sOpen: bigint, burns: bigint): boolean {
  return sOpen >= S_FLOOR && burns * 100n < sOpen;
}

/** ABB Theorem 1 long-run bound at T live steps: (B + η₁)/(T·η_T), η via `trackerStepSize` (never reimplemented). */
export function boundThm1(T: number, params: TrackerParams = TRACKER_PARAMS): number {
  const eta1 = trackerStepSize(0, params);
  const etaT = trackerStepSize(T - 1, params);
  return (params.B + eta1) / (T * etaT);
}

/** Minimal T at which the bound reaches `target` (a static projection of the params — not data). */
export function projectedBoundT(target: number, params: TrackerParams = TRACKER_PARAMS): number {
  let T = 1;
  while (boundThm1(T, params) > target) T++;
  return T;
}

/** One timeline line (ADR-M012 D4). Hashed fields = fact+score+state; the last three are provenance (outside the hash). */
export interface TimelineLine {
  day: string; from_block: number; to_block: number;
  burns: string; mints: string; supply_close: string; s_open: string; c1_ok: boolean;
  utterance_hash: string; attested_flow_sha256: string; v: number | null;
  regime: { floor: boolean; stress: boolean }; pair_status: "evaluable" | "non_evaluable" | "clipped";
  s_raw: number | null; s: number | null; E_tracker: Miscover | null;
  q_before: number; eta: number | null; q_after: number; T: number;
  mean_E_tracker: number | null; bound_thm1: number | null; digest_T: string;
  E_static: Miscover | null; t_deg: number; sum_E_static: number; B_t: number;
  rolling90_calm_miss: number | null; drift_flag: boolean; prev_line_hash: string;
  line_hash: string; endpoints: readonly string[]; node_version: string; sentinel_sha: string;
}

/** Carried engine state. Fully reconstructable by folding `step` over the published timeline. */
export interface SentinelState {
  tracker: TrackerState;
  scores: number[];        // s of every evaluable pair, in order (for the digest + replay)
  eStatic: Miscover[];     // E_static of every evaluable pair (for B_t)
  eTrackerSum: number;
  eStaticSum: number;
  calmMiss: Miscover[];    // E_static of CALM pairs only (for rolling90)
  prevVelocity: number | null;
  prevCalm: boolean;
  prevDay: string | null;
  lastBt: number;
  lastRolling: number | null;
  prevLineHash: string;
}

/** A fresh state: tracker at T = 0, empty timeline (test `sentinel_state_T_zero_before_J0`). */
export function initState(): SentinelState {
  return {
    tracker: trackerInit(committedQ1(), TRACKER_PARAMS),
    scores: [], eStatic: [], eTrackerSum: 0, eStaticSum: 0, calmMiss: [],
    prevVelocity: null, prevCalm: false, prevDay: null,
    lastBt: TRACKER_PARAMS.alpha, lastRolling: null, prevLineHash: "GENESIS",
  };
}

/** The hashed projection (fact+score+state+prev), in fixed order — the anti-tamper witness (M5). */
export function hashedFields(l: TimelineLine): unknown[] {
  return [
    l.day, l.from_block, l.to_block, l.burns, l.mints, l.supply_close, l.s_open, l.c1_ok,
    l.utterance_hash, l.attested_flow_sha256, l.v, l.regime.floor, l.regime.stress, l.pair_status,
    l.s_raw, l.s, l.E_tracker, l.q_before, l.eta, l.q_after, l.T, l.mean_E_tracker, l.bound_thm1,
    l.digest_T, l.E_static, l.t_deg, l.sum_E_static, l.B_t, l.rolling90_calm_miss, l.drift_flag, l.prev_line_hash,
  ];
}

/** Recompute a line's chain hash from its facts+score+state and its prev_line_hash. */
export function lineHashOf(l: TimelineLine): string {
  return createHash("sha256").update(JSON.stringify(hashedFields(l)), "utf8").digest("hex");
}

const oneDayApart = (a: string, b: string): boolean =>
  new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime() === 86_400_000;

interface Provenance { readonly endpoints: readonly string[]; readonly node_version: string; readonly sentinel_sha: string; }

/** Advance the engine by one processed window (evaluable or non_evaluable). Pure; returns the line + next state. */
export function step(state: SentinelState, w: WindowFacts, r: Exclude<AttestResult, { status: "c1_fail" }>, prov: Provenance): { line: TimelineLine; state: SentinelState } {
  const p = TRACKER_PARAMS;
  const sOpen = r.sOpen;
  const burns = w.burns;
  const floor = sOpen >= S_FLOOR;
  const stress = !(sOpen > 0n && burns * 100n < sOpen);
  const calm = isCalm(sOpen, burns);
  const v = r.status === "evaluable" ? r.velocity : null;

  const consecutive = state.prevDay === null || oneDayApart(state.prevDay, w.day);

  let next: SentinelState = { ...state };
  let didStep = false;
  let pair_status: TimelineLine["pair_status"] = "non_evaluable";
  let s_raw: number | null = null, s: number | null = null, E_tracker: Miscover | null = null, E_static: Miscover | null = null;
  let eta: number | null = null;
  let q_before = state.tracker.q, q_after = state.tracker.q, T = state.tracker.t;
  let B_t = state.lastBt, rolling: number | null = state.lastRolling;

  if (r.status === "evaluable" && state.prevVelocity !== null && consecutive) {
    didStep = true;
    const prevV = state.prevVelocity;
    s_raw = Math.abs(r.velocity - prevV);
    s = clipScore(s_raw, p.B);
    pair_status = s_raw > p.B ? "clipped" : "evaluable";
    eta = trackerStepSize(state.tracker.t, p);
    const stepped = trackerStep(state.tracker, s);
    q_before = state.tracker.q; q_after = stepped.state.q; T = stepped.state.t; E_tracker = stepped.E;
    E_static = s > state.tracker.q1 ? 1 : 0;
    const scores = [...state.scores, s];
    const eStatic = [...state.eStatic, E_static];
    const calmMiss = state.prevCalm && calm ? [...state.calmMiss, E_static] : state.calmMiss;
    B_t = budgetAt(eStatic, eStatic.length - 1, LABEL_DELAY, p.alpha);
    rolling = calmMiss.length >= CALM_WINDOW ? calmMiss.slice(-CALM_WINDOW).reduce<number>((a, b) => a + b, 0) / CALM_WINDOW : null;
    next = {
      ...state, tracker: stepped.state, scores, eStatic, calmMiss,
      eTrackerSum: state.eTrackerSum + stepped.E, eStaticSum: state.eStaticSum + E_static,
      lastBt: B_t, lastRolling: rolling ?? state.lastRolling,
    };
  }

  const line: TimelineLine = {
    day: w.day, from_block: w.fromBlock, to_block: w.toBlock,
    burns: burns.toString(), mints: w.mints.toString(), supply_close: w.supplyClose.toString(), s_open: sOpen.toString(), c1_ok: true,
    utterance_hash: r.flow.utterance.hash, attested_flow_sha256: r.flowSha256, v,
    regime: { floor, stress }, pair_status,
    s_raw, s, E_tracker, q_before, eta, q_after, T,
    mean_E_tracker: T > 0 ? next.eTrackerSum / T : null, bound_thm1: T >= 1 ? boundThm1(T, p) : null,
    digest_T: trackerDigest(state.tracker.q1, p, next.scores),
    E_static, t_deg: next.eStatic.length - (didStep ? 1 : 0), sum_E_static: next.eStaticSum, B_t,
    rolling90_calm_miss: rolling, drift_flag: rolling !== null && rolling >= DRIFT_THRESHOLD, prev_line_hash: state.prevLineHash,
    line_hash: "", endpoints: prov.endpoints, node_version: prov.node_version, sentinel_sha: prov.sentinel_sha,
  };
  line.line_hash = lineHashOf(line);

  next.prevVelocity = v;
  next.prevCalm = calm;
  next.prevDay = w.day;
  next.prevLineHash = line.line_hash;
  return { line, state: next };
}

/** state.json content (ADR-M012 D4): TrackerState + digest + the projected horizon T(bound <= δ_target). */
export function stateSummary(state: SentinelState): { tracker: TrackerState; digest: string; projected_bound_leq_target_T: number; replay_q: number } {
  return {
    tracker: state.tracker,
    digest: trackerDigest(state.tracker.q1, state.tracker.params, state.scores),
    projected_bound_leq_target_T: projectedBoundT(DELTA_TARGET),
    replay_q: trackerReplay(state.tracker.q1, state.tracker.params, state.scores).q,
  };
}
