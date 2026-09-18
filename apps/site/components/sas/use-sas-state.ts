"use client";

// apps/site/components/sas/use-sas-state.ts — a THIN client hook over the pure reducer. It is the only
// sas file that imports the model/machine as VALUES; it does so through the @/ alias (bundler resolution),
// and it is never pulled into the root nodenext test program (not imported by any test), so no dual-
// resolution friction arises. No JSX — not a rendered surface. The scene (F-site-9a-ii) mounts this hook.
import { useMemo, useReducer } from "react";
import { PICKER_PROFILES } from "@/lib/profiles";
import { deriveProfiles, REASON, reasonIndexOf } from "@/components/sas/sas-model";
import { initSas, reduce, type SasContext, type SasEvent, type SasState } from "@/components/sas/sas-machine";

export interface UseSasState {
  readonly state: SasState;
  readonly dispatch: (event: SasEvent) => void;
}

/**
 * Build the injected context once from the loaded reason enum and the derived profiles, then drive the
 * pure reducer. `reasons` is the frozen enum loaded server-side (lib/gate-enums) and passed in, so the
 * two anchored reason indices are resolved here, never on the client from node:fs.
 */
export function useSasState(reasons: readonly string[]): UseSasState {
  const ctx: SasContext = useMemo(
    () => ({
      profiles: deriveProfiles(PICKER_PROFILES),
      budgetExhaustedIndex: reasonIndexOf(reasons, REASON.EXHAUSTED),
      deferReasonIndex: reasonIndexOf(reasons, REASON.DEFER),
    }),
    [reasons],
  );
  const [state, dispatch] = useReducer((s: SasState, e: SasEvent): SasState => reduce(s, e, ctx), initSas());
  return { state, dispatch };
}
