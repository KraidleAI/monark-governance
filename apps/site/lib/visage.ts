// apps/site/lib/visage.ts — the VISAGE register: the three face-market artefacts sold to a named buyer
// (ADR-M004 addendum D15). Distinct from PRODUCTS (the five fingers) and
// FLEET_AGENTS (the eleven budō agents): a VISAGE is a packaging sold to a buyer, and all three are
// UPCOMING today. Copy, taglines and buyers are a product decision, NOT the
// design's CORE blurbs — the design INVERTS the sense (it calls Threshold "the gate as a product"; the
// decision calls it The Trigger, a parametric index that fires a claim). D15 requires this register, not
// a status hard-coded on the storefront.
//
// Locked by test/visage-register.test.ts (F-site-6 C-7): exactly three, all upcoming; the storefront's
// global upcoming count is sixteen (thirteen fleet + three visage); a numeric-hole scan over every
// rendered string; a named mutant (flip one visage to "built" reds). PURE DATA — no React/Next import,
// self-contained (declares VisageStatus locally, identical to FleetStatus, proven by the register test's
// bidirectional-assignability coercion) — so the root test can import it under node:test.

/** The frozen public status vocabulary (identical to lib/status.ts AgentStatus / lib/fleet.ts FleetStatus).
 *  No "live" exists — a stray one reds `next build` at every <StatusBadge status={...} /> call site. */
export type VisageStatus = "built" | "upcoming";

export interface VisageArtifact {
  /** Stable key — also the INSIDE lookup key in lib/fleet-presentation.ts. */
  key: string;
  /** Product name ("MONARK …"). */
  name: string;
  /** The short face of the artefact (The File / The Seal / The Trigger). */
  tagline: string;
  /** One-sentence English restatement of what the artefact is (translated, not embellished). */
  what: string;
  /** The named buyer the artefact is sold to. */
  buyers: string;
  status: VisageStatus;
}

export const VISAGE: VisageArtifact[] = [
  {
    key: "attestation",
    name: "MONARK Attestation",
    tagline: "The File",
    what: "A sealed artefact of each hop — the act, the gate's decision, the budget before and after, named residuals, and a hash.",
    buyers: "Fund administrators, auditors, a CFO or COO, an insurer.",
    status: "upcoming",
  },
  {
    key: "hallmark",
    name: "MONARK Hallmark",
    tagline: "The Seal",
    what: "A binary SEALED badge on a vault — a costly signal, like a hallmark stamp.",
    buyers: "Liquidity providers and curators.",
    status: "upcoming",
  },
  {
    key: "threshold",
    name: "MONARK Threshold",
    tagline: "The Trigger",
    what: "A parametric index that fires a claim — it provides the trigger, not the insurance.",
    buyers: "Underwriters and claims officers.",
    status: "upcoming",
  },
];
