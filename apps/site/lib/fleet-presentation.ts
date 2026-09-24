// apps/site/lib/fleet-presentation.ts — the panel content: "What's inside" (a built agent) and "What it will use" (an
// upcoming agent, application, or visage).
//
// SOURCING: every BUILT point below names a technique/algorithm anchored to a committed design record, cited
// line-by-line internally. Points name METHODS, never a paper, never a number.
// Upcoming blocks name a technique (academic method names are allowed) and close with a single
// "(more details to come)" (rendered by the WhatInside component, not repeated per point); they make no
// built claim. MONARK Verdict names its engine here (Mokugeki × Kamae) — the panel layer only; the frozen fleet
// register (lib/fleet.ts) keeps the Verdict wiring generic, unchanged.
//
// PURE DATA — no React/Next import, self-contained (no import of ./fleet: the root test program
// (nodenext) and the Next bundler disagree on the relative specifier and no single form type-checks under
// both; see lib/fleet.ts) — so test/visage-register.test.ts can import it under node:test and scan
// every rendered string for a numeric hole (C-4). Keyed by a lowercase slug: the four built agents (incl.
// Narabi), the seven roadmap agents (a.name.toLowerCase()), the six applications (product.key; MONARK Bell is built,
// so its block is "What's inside"), the three visage (visage.key) — twenty keys, checked exhaustively by the register
// test (non-inert).
// Ukemi's points say region, never interval: its served liquidation class delivers a one-sided upper bound, never
// an interval, and neither of its served classes delivers any region until a calibration is committed (the gate
// abstains by construction) — pinned by test/site-build-fleet.test.ts.

export type InsideKind = "built" | "upcoming";

export interface InsideBlock {
  /** "What's inside" when built; "What it will use" when upcoming. */
  kind: InsideKind;
  /** Short points naming techniques/algorithms/theorems — never a paper, never a number. */
  points: string[];
}

export const INSIDE: Record<string, InsideBlock> = {
  // ── The four built agents — "What's inside" (each point anchored to a committed design record) ──
  shogen: {
    kind: "built",
    points: [
      "Cryptographic attestation: an attested testimony, emitted only after a passing verdict",
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
      "A conformal region for the liquidable amount, delivered by the gate only once a calibration is committed; until then it abstains by construction",
    ],
  },
  // ── Narabi — built. Points: the attested flow, the quantile tracker, the published replayable timeline + per-line
  //    hash chain, the static committed gate region. Digit-free and paper-free (method names only), like the three
  //    engines. ──
  narabi: {
    kind: "built",
    points: [
      "Attested redemption flow: burns, mints and closing supply over a declared block window, recomputable onchain",
      "An adaptive quantile tracker (Angelopoulos, Barber and Bates decaying step), stepped on the realized outcome each window",
      "A published, replayable timeline with a per-line hash chain; the committed gate region stays static until a pre-registered drift criterion fires",
    ],
  },

  // ── The seven roadmap agents — "What it will use" (Mod #1; method names only) ──
  mokugeki: {
    kind: "upcoming",
    points: ["Cryptographic attestation for documents and events", "Named residual hypotheses"],
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

  // ── The five upcoming applications — "What it will use": each inherits its engine agent. The two that inherit
  //    Ukemi's engine say what the gate serves for it: a bound only once a calibration is committed (never "conformed
  //    by the gate" today, which the served cascade sentence contradicts; pinned by test/site-ukemi.test.ts). ──
  softlanding: {
    kind: "upcoming",
    points: ["Ukemi's liquidation-cascade engine: a network clearing fixed point, with the gate's conformal bound once a calibration is committed"],
  },
  firebreak: {
    kind: "upcoming",
    points: ["Ukemi's liquidation-cascade engine: a network clearing fixed point, with the gate's conformal bound once a calibration is committed"],
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
  // MONARK Bell (built) — "What's inside" says only what is served today: the signed chained timeline and its reader-side check, the named abstentions
  // (the first record abstains on every session: no closing price is read into it), the anchored journal. No gap
  // is claimed: the cash leg is not connected (the /bell page says so in plain words).
  bell: {
    kind: "built",
    points: [
      "A public timeline served on its own host, one signed, hash-chained line per publication, checked by a reader-side verifier against a committed keyring",
      "Named abstentions instead of estimates, each counted in the published state; no closing price is read into the first record, so it carries no gap",
      "A hash-chained collection journal whose manifests are anchored to a public timestamp",
    ],
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
