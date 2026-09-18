/**
 * HIKAE tracker — quantile tracker primitive (ABB 2024, rule (4)) over the L2 IM-OCP step.
 *
 * *** TRACKER — (i)-(ii) delivered by the sentinel (ADR-M012), T counted from its first step; (iii)
 * pre-registered, unmet. NO GUARANTEE CLAIMED beyond ABB 2024 Thm 1 long-run bound. ***
 * The sentinel (apps/sentinel/, off-tool, D8 (iv) caller) carries the state and feeds the daily attested
 * outcome; this file stays the pure primitive and its byte-level oracle — no wire byte, no frozen contract
 * touched, tracker logic unchanged (the header alone moved from "unmet" to "delivered", ADR-M012 D9).
 *
 * Mechanism (Angelopoulos, Barber, Bates 2024, arXiv:2402.01139, rule (4), cited not
 * republished): q_{t+1} = q_t + eta_t * (1{s_t > q_t} - alpha), which is EXACTLY
 * imocpStep(q, alpha, E, eta) of l2-monitor.ts with E = 1{s_t > q_t} and a step schedule
 * eta_t = c * (t + t0) ^ (-1/2 - eps), eps > 0. imocpStep is REUSED, never duplicated.
 *
 * Carried bound (and only it): ABB Theorem 1 — for an arbitrary sequence, positive
 * non-increasing eta_t and q_1 in [0,B], | (1/T) sum_{t<=T} E_t - alpha | <= (B + eta_1) /
 * (T * eta_T). No per-window coverage, no convergence, no such claim for any class.
 *
 * NO clamp of q anywhere: ABB Lemma 1 bounds q with no projection step, and the telescoping
 * identity sum_t eta_t (E_t - alpha) = q_{T+1} - q_1 (the anti-clamp oracle) holds only
 * without projection. The one licit clipping is on the SCORE (clipScore), a separate helper
 * NEVER called inside the recursion.
 *
 * Index convention: state `t` = number of LIVE steps already consumed (t = 0 at init). The
 * step applied to state `t` is eta_{t+1} = c * (t + 1 + t0) ^ (-1/2 - eps), so the base is
 * >= 1 and `0 ^ (-x)` never arises; a non-finite eta is rejected (throw).
 */
import { createHash } from "node:crypto";
import { imocpStep } from "./l2-monitor.ts";
import type { Miscover } from "./l2-monitor.ts";

/** Tracker parameters. `c, eps, t0` carry NO default (ADR-M009 D5): the caller declares them. */
export interface TrackerParams {
  readonly alpha: number;
  readonly c: number;
  readonly eps: number;
  readonly t0: number;
  readonly B: number;
}

/** Caller-carried state. `t` = live steps consumed; `q1` = warm start, kept for the digest. */
export interface TrackerState {
  readonly q: number;
  readonly t: number;
  readonly q1: number;
  readonly params: TrackerParams;
}

/**
 * Fail-closed constructor. Rejects (throw): q1 outside [0,B], eps <= 0, c <= 0, t0 < 0,
 * B <= 0, alpha outside (0,1), or any non-finite input. No silent default is ever supplied.
 */
export function trackerInit(q1: number, params: TrackerParams): TrackerState {
  const { alpha, c, eps, t0, B } = params;
  if (
    !Number.isFinite(alpha) || !Number.isFinite(c) || !Number.isFinite(eps) ||
    !Number.isFinite(t0) || !Number.isFinite(B) || !Number.isFinite(q1)
  ) {
    throw new Error(
      `trackerInit: non-finite input (alpha=${String(alpha)}, c=${String(c)}, eps=${String(eps)}, t0=${String(t0)}, B=${String(B)}, q1=${String(q1)}).`,
    );
  }
  if (B <= 0) throw new Error(`trackerInit: B must be > 0 (B=${String(B)}).`);
  if (alpha <= 0 || alpha >= 1) throw new Error(`trackerInit: alpha must be in (0,1) (alpha=${String(alpha)}).`);
  if (c <= 0) throw new Error(`trackerInit: c must be > 0 (c=${String(c)}).`);
  if (eps <= 0) throw new Error(`trackerInit: eps must be > 0 (eps=${String(eps)}).`);
  if (t0 < 0) throw new Error(`trackerInit: t0 must be >= 0 (t0=${String(t0)}).`);
  if (q1 < 0 || q1 > B) throw new Error(`trackerInit: q1 must be in [0,B] (q1=${String(q1)}, B=${String(B)}).`);
  return { q: q1, t: 0, q1, params: { alpha, c, eps, t0, B } };
}

/**
 * Step size applied to state `t`: eta_{t+1} = c * (t + 1 + t0) ^ (-1/2 - eps). Throws on a
 * non-finite eta (e.g. a hand-built state whose base t + 1 + t0 <= 0), so the recursion never
 * consumes an infinite or NaN step (ADR-M009 C-1).
 */
export function trackerStepSize(t: number, params: TrackerParams): number {
  const base = t + 1 + params.t0;
  const eta = params.c * base ** (-1 / 2 - params.eps);
  if (!Number.isFinite(eta)) {
    throw new Error(`trackerStepSize: non-finite step (t=${String(t)}, base=${String(base)}).`);
  }
  return eta;
}

/**
 * Score clip into [0,B] (part of the ABB definition s : X x Y -> [0,B]). This is the ONLY
 * licit clipping and it is a SEPARATE helper: it is NEVER called inside trackerStep, so it
 * cannot inject a projection into the recursion (which would void ABB Theorem 1 / Lemma 1).
 */
export function clipScore(s: number, B: number): number {
  if (!Number.isFinite(s)) throw new Error(`clipScore: non-finite score (s=${String(s)}).`);
  if (!Number.isFinite(B) || B <= 0) throw new Error(`clipScore: B must be finite and > 0 (B=${String(B)}).`);
  return Math.max(0, Math.min(B, s));
}

/**
 * One live step. Validates the incoming score (s in [0,B], finite; throw otherwise — the
 * throw, not a clip, is why clipScore is never needed here), derives E = 1{s > q} ITSELF
 * (strict `>`; the primitive never accepts E from the caller), advances q via imocpStep, and
 * increments the step counter. No clamp of q.
 */
export function trackerStep(state: TrackerState, s: number): { state: TrackerState; E: Miscover } {
  const p = state.params;
  if (!Number.isFinite(s) || s < 0 || s > p.B) {
    throw new Error(`trackerStep: score out of [0,B] or non-finite (s=${String(s)}, B=${String(p.B)}).`);
  }
  const eta = trackerStepSize(state.t, p);
  const E: Miscover = s > state.q ? 1 : 0;
  const qNext = imocpStep(state.q, p.alpha, E, eta);
  return { state: { q: qNext, t: state.t + 1, q1: state.q1, params: p }, E };
}

/**
 * Replays a whole timeline from (q1, params, scores) in order: returns the final q, the E
 * timeline and the live step count. Any third party reproduces q_{T+1} and every E_t from
 * these inputs alone (trackerDigest below pins the bytes).
 */
export function trackerReplay(
  q1: number,
  params: TrackerParams,
  scores: readonly number[],
): { q: number; E: Miscover[]; t: number } {
  let state = trackerInit(q1, params);
  const E: Miscover[] = [];
  for (const s of scores) {
    const stepped = trackerStep(state, s);
    state = stepped.state;
    E.push(stepped.E);
  }
  return { q: state.q, E, t: state.t };
}

/**
 * Timeline digest (hikae, OUTSIDE the frozen contracts): sha256 hex over
 *   f64be(alpha)||f64be(c)||f64be(eps)||f64be(t0)||f64be(B)||f64be(q1)||f64be(s_1)||...||f64be(s_T)
 * with the scores IN ORDER (NOT sorted) — DISTINCT from calibDigest, which sorts. Mirrors
 * calibDigest's float64_be + sha256 encoding, INCLUDING its -0 -> +0 normalization (so a
 * caller passing -0 does not fork the hash); a cross-language replayer MUST do the same.
 * Throws on any non-finite input (fail-closed, like calibDigest).
 */
export function trackerDigest(q1: number, params: TrackerParams, scores: readonly number[]): string {
  const header = [params.alpha, params.c, params.eps, params.t0, params.B, q1];
  for (const v of header) {
    if (!Number.isFinite(v)) throw new Error(`trackerDigest: non-finite header value (${String(v)}).`);
  }
  for (const s of scores) {
    if (!Number.isFinite(s)) throw new Error(`trackerDigest: non-finite score (${String(s)}).`);
  }
  const buf = Buffer.alloc((header.length + scores.length) * 8);
  let off = 0;
  for (const v of header) {
    buf.writeDoubleBE(v === 0 ? 0 : v, off);
    off += 8;
  }
  for (const s of scores) {
    buf.writeDoubleBE(s === 0 ? 0 : s, off);
    off += 8;
  }
  return createHash("sha256").update(buf).digest("hex");
}
