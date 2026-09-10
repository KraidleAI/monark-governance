"use client";

// The gate-sim state hook (Lot F-site-3). Drives the illustrative policy from lib/sim.ts: a phase
// machine (idle -> in -> gate -> out -> done) animated with setTimeout, and an optional ambient auto-demo
// for the non-interactive mounts. It reads prefers-reduced-motion from the ThemeProvider and, when set,
// applies each decision in one settled step with no animation. This module is client-only (React hooks,
// timers); it must be mounted under the layout's ThemeProvider (useTheme throws otherwise).
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import {
  applyDecision,
  decide,
  formatBudget,
  formatSigned,
  fresh,
  type AmbientInput,
  type Intent,
  type SimInput,
  type SimState,
} from "@/lib/sim";

const PHASE_GATE_MS = 650;
const PHASE_APPLY_MS = 1050;
const PHASE_DONE_MS = 1750;
const REDUCED_DONE_MS = 12;
const AMBIENT_TICK_MS = 3200;

export type GateSimMode = "board" | "explainer" | "token";

export interface UseGateSim {
  readonly state: SimState;
  readonly reducedMotion: boolean;
  readonly budgetText: string;
  readonly readingText: string;
  readonly spreadText: string;
  readonly regionText: string;
  /** Push with the current control values (explainer). */
  readonly push: () => void;
  /** Step the illustrative ambient sequence, recovering the epoch when the budget is spent (board auto,
   *  token button). Ignored while an animation is mid-flight. */
  readonly pushAmbient: () => void;
  readonly reset: () => void;
  readonly setReading: (v: number) => void;
  readonly setSpread: (v: number) => void;
  readonly setIntent: (i: Intent) => void;
  readonly toggleTimeout: () => void;
}

const REASON_BUDGET_EXHAUSTED = "budget_exhausted";

export function useGateSim(mode: GateSimMode, ambient: readonly AmbientInput[]): UseGateSim {
  const { reducedMotion } = useTheme();
  const [state, setState] = useState<SimState>(fresh);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ambIdx = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  const clearTimers = useCallback(() => {
    for (const t of timers.current) clearTimeout(t);
    timers.current = [];
  }, []);

  const newEpoch = useCallback(() => {
    setState((s) => ({ ...fresh(), reading: s.reading, spread: s.spread, intent: s.intent, epoch: s.epoch + 1 }));
  }, []);

  const run = useCallback(
    (input: SimInput) => {
      clearTimers();
      const d = decide(stateRef.current, input);
      if (reducedRef.current) {
        setState((s) => applyDecision(s, input, d));
        timers.current.push(setTimeout(() => setState((s) => ({ ...s, phase: "done" })), REDUCED_DONE_MS));
        return;
      }
      setState((s) => ({
        ...s,
        reading: input.reading,
        spread: input.spread,
        intent: input.intent,
        timeout: input.timeout,
        phase: "in",
        actionIndex: null,
        reason: null,
      }));
      timers.current.push(setTimeout(() => setState((s) => ({ ...s, phase: "gate" })), PHASE_GATE_MS));
      timers.current.push(setTimeout(() => setState((s) => applyDecision(s, input, d)), PHASE_APPLY_MS));
      timers.current.push(setTimeout(() => setState((s) => ({ ...s, phase: "done" })), PHASE_DONE_MS));
    },
    [clearTimers],
  );

  const push = useCallback(() => {
    const s = stateRef.current;
    run({ reading: s.reading, spread: s.spread, intent: s.intent, timeout: s.timeout });
  }, [run]);

  // Step the ambient sequence. Ignored while busy (a settled/idle phase only). Once a spent epoch has
  // settled, start a fresh one so the demo — auto (board) or manual (token) — keeps making progress.
  const pushAmbient = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "idle" && s.phase !== "done") return;
    if (s.reason === REASON_BUDGET_EXHAUSTED) {
      clearTimers();
      newEpoch();
      return;
    }
    const next = ambient[ambIdx.current % ambient.length];
    ambIdx.current += 1;
    if (next) run({ reading: next.reading, spread: next.spread, intent: next.intent, timeout: false });
  }, [ambient, run, clearTimers, newEpoch]);

  const reset = useCallback(() => {
    clearTimers();
    newEpoch();
  }, [clearTimers, newEpoch]);

  const setReading = useCallback((v: number) => setState((s) => ({ ...s, reading: v })), []);
  const setSpread = useCallback((v: number) => setState((s) => ({ ...s, spread: v })), []);
  const setIntent = useCallback((i: Intent) => setState((s) => ({ ...s, intent: i })), []);
  const toggleTimeout = useCallback(() => setState((s) => ({ ...s, timeout: !s.timeout })), []);

  // Board is the ONLY auto-cycling mount: it steps the ambient sequence on its own. Explainer and token
  // are manual (token drives pushAmbient from its button), so a manual push/reset is never overwritten.
  useEffect(() => {
    if (mode !== "board" || ambient.length === 0) return;
    pushAmbient();
    const id = setInterval(pushAmbient, AMBIENT_TICK_MS);
    return () => clearInterval(id);
  }, [mode, ambient.length, pushAmbient]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    state,
    reducedMotion,
    budgetText: formatBudget(state.budget),
    readingText: formatSigned(state.reading),
    spreadText: formatBudget(state.spread),
    regionText: state.labels ? "{ " + state.labels.join(", ") + " }" : "—",
    push,
    pushAmbient,
    reset,
    setReading,
    setSpread,
    setIntent,
    toggleTimeout,
  };
}
