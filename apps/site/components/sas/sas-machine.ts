// apps/site/components/sas/sas-machine.ts — the PURE reducer for the five storyboard states S0..S4
// (MODELE-ILLUSTRATION §8). Client-safe and resolver-neutral: it imports only TYPES from the model (an
// `import type` with a .ts specifier is elided, so it type-checks under both the root nodenext test and
// the apps/site bundler); every value it needs from the model — the profiles and the two anchored reason
// indices — arrives through the injected context, so no node:fs reaches the client.
//
// Deposits and the suspended brume carry a reason BY INDEX into the loaded frozen enum, never a code
// literal: the caller resolves those indices once (via the model's reasonIndexOf) and passes them in.
import type { ChamberId, SasProfile } from "./sas-model.ts";

export type SasStateId = "S0" | "S1" | "S2" | "S3" | "S4";

/** A settled sediment (or the fallen brume): a chamber plus the reason index it deposited under. */
export interface Deposit {
  readonly chamber: ChamberId;
  readonly reasonIndex: number;
}

/** The clear net leaving the sas toward the profiles. `dimmed` is the veille tint of a profile pick. */
export interface Downstream {
  readonly dimmed: boolean;
}

export interface SasState {
  readonly id: SasStateId;
  /** The downstream net — a refusal (S1) must leave this untouched: refusing does not darken what passes. */
  readonly downstream: Downstream;
  /** Defer in suspension inside Gate, leaving by the waiting mouth; null when nothing is deferred. */
  readonly brume: Deposit | null;
  readonly deposits: readonly Deposit[];
  /** Gate output valve — shut once the level reaches the floor (S3). */
  readonly valveClosed: boolean;
  readonly litPieceKeys: readonly string[];
  /** The spine (the four-chamber diagonal) — always lit on a profile pick (S4). */
  readonly litSpine: boolean;
}

/** Everything the reducer needs that lives in the model or the loaded enum — injected, never imported. */
export interface SasContext {
  readonly profiles: readonly SasProfile[];
  /** Index of the budget-floor deposit reason in the loaded enum (S3 forces every deposit to it). */
  readonly budgetExhaustedIndex: number;
  /** Index of the defer reason the brume carries in Gate (inherited by its fallen sediment, S2). */
  readonly deferReasonIndex: number;
}

export type SasEvent =
  | { readonly type: "calm" }
  | { readonly type: "refuse"; readonly chamber: ChamberId; readonly reasonIndex: number }
  | { readonly type: "defer" }
  | { readonly type: "clockClose" }
  | { readonly type: "budgetLow" }
  | { readonly type: "pick"; readonly profileIndex: number };

const FLOW: Downstream = { dimmed: false };

/** The default, permanent calm state S0. */
export function initSas(): SasState {
  return { id: "S0", downstream: FLOW, brume: null, deposits: [], valveClosed: false, litPieceKeys: [], litSpine: false };
}

/**
 * The storyboard reducer. Transitions are exactly those of §8; every branch returns one of S0..S4.
 * Invariants baked in and pinned by test/sas-machine.test.ts:
 *   S1 refuse         -> downstream unchanged; a deposit lands at the refusing chamber.
 *   S2 clockClose     -> the brume falls to sediment in Gate, inheriting its defer reason.
 *   S3 budgetLow / any deposit while the valve is shut -> reason forced to the budget-floor index in Gate.
 *   S4 pick           -> lit pieces == the profile path exactly; a VISAGE pick (empty path) lights the
 *                        spine alone; the spine is always lit on a pick.
 *   calm              -> back to S0.
 */
export function reduce(state: SasState, event: SasEvent, ctx: SasContext): SasState {
  switch (event.type) {
    case "calm":
      return initSas();
    case "refuse": {
      // When the valve is shut (S3), every arrival deposits as the budget-floor reason in Gate; otherwise
      // it settles at the refusing chamber with the given reason. Either way the downstream net is untouched.
      const forced = state.valveClosed;
      const deposit: Deposit = forced
        ? { chamber: "gate", reasonIndex: ctx.budgetExhaustedIndex }
        : { chamber: event.chamber, reasonIndex: event.reasonIndex };
      return { ...state, id: forced ? "S3" : "S1", deposits: [...state.deposits, deposit] };
    }
    case "defer":
      return { ...state, id: "S2", brume: { chamber: "gate", reasonIndex: ctx.deferReasonIndex } };
    case "clockClose": {
      if (state.brume === null) return { ...state, id: "S2" };
      return { ...state, id: "S2", brume: null, deposits: [...state.deposits, state.brume] };
    }
    case "budgetLow":
      return {
        ...state,
        id: "S3",
        valveClosed: true,
        brume: null,
        deposits: [...state.deposits, { chamber: "gate", reasonIndex: ctx.budgetExhaustedIndex }],
      };
    case "pick": {
      const profile = ctx.profiles[event.profileIndex];
      if (profile === undefined) return state;
      return { ...state, id: "S4", litPieceKeys: [...profile.path], litSpine: true, downstream: { dimmed: true } };
    }
  }
}
