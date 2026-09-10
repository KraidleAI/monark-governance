// apps/site/lib/fleet-presentation.ts — the Mod #1 panel content: "What's inside" (a built agent) and
// "What it will use" (an upcoming agent, product, or visage). DESIGN-MODS-MONARK Mod #1 (investor
// 2026-09-09) / PLAN-Fsite-lot §7 C-8, rendered in F-site-6.
//
// SOURCING (C-8): every BUILT point below names a technique/algorithm anchored to a COMMITTED ADR line,
// cited line-by-line in docs/G1-lot-fsite-6.md. Points name METHODS, never a paper, never a number.
// Upcoming blocks name a technique (academic method names are allowed) and close with a single
// "(more details to come)" (rendered by the WhatInside component, not repeated per point); they make no
// built claim. β (2026-09-10): MONARK Verdict names its engine here (Mokugeki × Kamae) — the panel
// layer only; the frozen fleet register (lib/fleet.ts) keeps the Verdict wiring generic (C-1), unchanged.
//
// PURE DATA — no React/Next import, self-contained (no import of ./fleet: the root test program
// (nodenext) and the Next bundler disagree on the relative specifier and no single form type-checks under
// both; see lib/fleet.ts L9-16) — so test/visage-register.test.ts can import it under node:test and scan
// every rendered string for a numeric hole (C-4). Keyed by a lowercase slug: the three built agents, the
// eight roadmap agents (a.name.toLowerCase()), the five products (product.key), the three visage
// (visage.key) — nineteen keys, checked exhaustively by the register test (non-inert).

export type InsideKind = "built" | "upcoming";

export interface InsideBlock {
  /** "What's inside" when built; "What it will use" when upcoming. */
  kind: InsideKind;
  /** Short points naming techniques/algorithms/theorems — never a paper, never a number. */
  points: string[];
}

export const INSIDE: Record<string, InsideBlock> = {
  // ── The three built agents — "What's inside" (each point anchored to a committed ADR, see C-8 table) ──
  shogen: {
    kind: "built",
    points: [
      "Cryptographic attestation: a verified testimony, emitted only after a passing verdict",
      "Recomputable byte hashing — anyone re-derives the same hash",
      "Named residual hypotheses: the transport assumptions, stated, not hidden",
    ],
  },
  hikae: {
    kind: "built",
    points: [
      "Conformal prediction (split-conformal calibration)",
      "Finite-sample marginal coverage under exchangeability",
      "A closed gate policy that emits commit, defer, or abstain against the region and the budget",
      "Online monitoring of the remaining risk",
    ],
  },
  ukemi: {
    kind: "built",
    points: [
      "Network clearing fixed point (Eisenberg-Noe)",
      "Fictitious-default sequence — each node pays what it can, in rounds",
      "Recovery rates α, β and contagion amplification",
      "A conformal interval for the cascade, conformed by the gate",
    ],
  },

  // ── The eight roadmap agents — "What it will use" (DESIGN-MODS Mod #1; method names only) ──
  mokugeki: {
    kind: "upcoming",
    points: ["Cryptographic attestation for documents and events", "Named residual hypotheses"],
  },
  narabi: {
    kind: "upcoming",
    points: ["Redemption-run signals: burn-rate, redeem-queue growth, witness liveness"],
  },
  kaihi: {
    kind: "upcoming",
    points: ["Loss-versus-rebalancing and order-flow toxicity (Glosten-Milgrom, VPIN)"],
  },
  kessai: {
    kind: "upcoming",
    points: ["Transaction-cost analysis and implementation shortfall"],
  },
  kamae: {
    kind: "upcoming",
    points: ["Avellaneda-Stoikov inventory market-making"],
  },
  kyokusen: {
    kind: "upcoming",
    points: ["Nelson-Siegel yield-curve fitting across maturities"],
  },
  koyomi: {
    kind: "upcoming",
    points: ["Weekend-gap and thin-venue risk"],
  },
  genkan: {
    kind: "upcoming",
    points: ["Least-privilege dual control at the treasury door"],
  },

  // ── The five products — "What it will use": each inherits its engine agent (DESIGN-MODS Mod #1) ──
  softlanding: {
    kind: "upcoming",
    points: ["Ukemi's liquidation-cascade engine: a network clearing fixed point and a conformal interval, conformed by the gate"],
  },
  firebreak: {
    kind: "upcoming",
    points: ["Ukemi's liquidation-cascade engine: a network clearing fixed point and a conformal interval, conformed by the gate"],
  },
  warden: {
    kind: "upcoming",
    points: ["Genkan's least-privilege dual control at the treasury door"],
  },
  verdict: {
    kind: "upcoming",
    points: ["Mokugeki attests the event; Kamae quotes from inventory (Avellaneda-Stoikov)"],
  },
  ballast: {
    kind: "upcoming",
    points: ["Kyokusen's Nelson-Siegel yield-curve fitting across maturities"],
  },

  // ── The three visage artefacts — "What it will use": the decision's description, no engine named ──
  attestation: {
    kind: "upcoming",
    points: ["A sealed record of each hop: the act, the gate's decision, the budget before and after, named residuals, and a hash"],
  },
  hallmark: {
    kind: "upcoming",
    points: ["A binary SEALED badge on a vault — a costly signal, like a hallmark stamp"],
  },
  threshold: {
    kind: "upcoming",
    points: ["A parametric index that fires a claim — it provides the trigger, not the insurance"],
  },
};

/** Resolve one panel block by key, failing loud on a missing key (fail-closed: a bad key reds the
 *  build/render rather than showing an empty panel). Every key used in-tree is proven present by the
 *  register test's exhaustive key assertion. */
export function insideFor(key: string): InsideBlock {
  const block = INSIDE[key];
  if (block === undefined) {
    throw new Error(`fleet-presentation: no INSIDE block for '${key}'`);
  }
  return block;
}
