// apps/site/lib/how-copy.ts — How-page presentation copy (Lot F-site-5). PURE DATA: no JSX, no React,
// no node: import, no `@/` alias — so BOTH the Next app (bundler resolution) and the root test program
// (nodenext) import it, exactly like lib/fleet.ts (which documents the dual-resolution friction and is
// self-contained for the same reason). The reason CODES and the third action WORD are NEVER spelled in a
// rendered position from here: the How page renders them from the FROZEN enum (lib/gate-enums.ts) by
// position; this module only carries the human GLOSSES + the region vocabulary. Those strings render via
// {property access}, which the honesty lint (test 44) never scans, so they are covered instead by
// test/ci-gates.test.ts `how_page_rendered_vocab_has_no_numeric_hole` (R2, the numeric-hole closure).

// Tone = index into the frozen `action` enum [commit, defer, abstain] (order pinned by the C-9 root
// test; mirrors lib/sim.ts ACTION_*). Kept local so this module imports nothing (node --test loads it
// raw). The page resolves the action WORD + colour from this index against the loaded enum.
export const TONE_COMMIT = 0;
export const TONE_DEFER = 1;
export const TONE_ABSTAIN = 2;

export interface Outcome {
  /** Index into the frozen action enum — selects the tone colour AND the action word (from the enum). */
  readonly tone: number;
  /** Plain-English gloss of the outcome (design L163-165). */
  readonly gloss: string;
}

/** The three gate outcomes, in frozen action-enum order. The page renders the TITLE from the loaded enum
 *  (actions[o.tone]); only the gloss lives here — so the third action word is never a literal. */
export const OUTCOMES: readonly Outcome[] = [
  {
    tone: TONE_COMMIT,
    gloss:
      "The intent lies inside a region small enough to act on, and budget remains. The act is authorized and B_t is spent.",
  },
  {
    tone: TONE_DEFER,
    gloss:
      "The region is too large to act on — the set holds every label, or the interval is too wide. Wait for a better reading. B_t is untouched.",
  },
  {
    tone: TONE_ABSTAIN,
    gloss:
      "The gate holds no opinion: the intent is not in the region, the budget is exhausted, or the upstream attestation is absent or timed out. A first-class outcome — it is what lets the gate act at all.",
  },
];

export interface ReasonGloss {
  /** Index into the frozen action enum — the tone the reason resolves to (colour + action word). */
  readonly tone: number;
  /** Plain-English gloss (design L775-787). Scanned for numeric holes by the R2 test. */
  readonly gloss: string;
}

/**
 * The thirteen frozen reason codes → their tone + gloss. Keyed by the reason CODE, which is NOT a
 * contract field (see lib/sim.ts header: reason codes are cited as plain literals), so a literal key is
 * honest here. The page renders the code text FROM the loaded enum, never from these keys; the R2 test
 * pins keys == enum BOTH WAYS (a new reason with no gloss, or a phantom gloss, reds), so the rendered
 * grid can neither drift from nor outrun the frozen reason enum — "a new reason needs an ADR, not a
 * deploy" (design L238).
 */
export const REASON_GLOSS: Record<string, ReasonGloss> = {
  covered: { tone: TONE_COMMIT, gloss: "The intent lies inside a region small enough to act on, and budget remains." },
  set_too_large: { tone: TONE_DEFER, gloss: "The set holds every label — nothing is ruled out yet." },
  interval_too_wide: { tone: TONE_DEFER, gloss: "The interval is wider than the act can tolerate." },
  intent_not_in_region: { tone: TONE_ABSTAIN, gloss: "What you wanted to do is outside what coverage allows." },
  under_calib: { tone: TONE_ABSTAIN, gloss: "Too few calibration points to state a region at all." },
  no_label_schema: { tone: TONE_ABSTAIN, gloss: "The task declares no label schema to conform against." },
  budget_exhausted: { tone: TONE_ABSTAIN, gloss: "B_t is spent. No bar is lowered; the gate waits for a new epoch." },
  clock_expired: { tone: TONE_ABSTAIN, gloss: "The testimony is older than the task allows." },
  upstream_timeout: { tone: TONE_ABSTAIN, gloss: "The sensor did not answer in time." },
  attestation_absent: { tone: TONE_ABSTAIN, gloss: "No attestation reached the adapter." },
  attestation_refused: { tone: TONE_ABSTAIN, gloss: "The verifier refused the testimony — a hash or signature did not hold." },
  binding_broken: { tone: TONE_ABSTAIN, gloss: "The prediction is not bound to the testimony it claims." },
  non_evaluable: { tone: TONE_ABSTAIN, gloss: "The input cannot be evaluated against the contract at all." },
};

export interface RegionKind {
  /** The mono eyebrow, e.g. "region · kind = set" (design L215/L223). */
  readonly eyebrow: string;
  readonly title: string;
  /** The illustrative region shape, rendered line-by-line in a <pre> (design L218-220 / L226-227). The
   *  keys are bare identifiers (no adjacent quotes) and no value carries a digit. */
  readonly example: readonly string[];
}

/** The two region shapes the gate conforms into (set / interval). Rendered via {property access}, so
 *  covered by the R2 numeric-hole scan. The budget card (the third region-section panel) is rendered
 *  inline on the page (it is not a region kind). */
export const REGION_KINDS: readonly RegionKind[] = [
  {
    eyebrow: "region · kind = set",
    title: "Classification — a set of labels",
    example: ["{ kind: set,", "  labels: [ up ],", "  label_schema: up|down }"],
  },
  {
    eyebrow: "region · kind = interval",
    title: "Regression — an interval",
    example: ["{ kind: interval,", "  lo: …, hi: … }"],
  },
];
