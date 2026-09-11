// apps/site/lib/profiles.ts — the eight home-picker profiles (decision E-1, 2026-09-10, ratified in
// an internal design note). The design's own profile→product mapping was ERRONEOUS and is
// thrown out; E-1 is the corrected mapping. Each profile is a real client frame that
// points to ONE real product of the register — no invented value. Five map to the fingers (products of
// lib/fleet.ts PRODUCTS); three map to the VISAGE tier (MONARK Attestation / Hallmark / Threshold), whose
// register + panels are owned separately — here a profile only NAMES and links its product.
//
// `engineKeys` = which fleet agents power the product, used only to LIGHT the matching board cards. Every
// row is sourced (cited internally):
//   firebreak, softlanding -> ukemi        Mod #1 ("Softlanding/Firebreak -> Ukemi")
//   warden -> genkan                       Mod #1 ("Warden -> Genkan")
//   ballast -> kyokusen                    Mod #1 ("Ballast -> Kyokusen")
//   verdict -> mokugeki, kamae             decision β (Verdict = Mokugeki × Kamae)
//   Attestation -> shogen                  design CORE L515 (VISAGE)
//   Hallmark   -> hikae                    design CORE L517 (VISAGE)
//   Threshold  -> hikae                    design CORE L516 (VISAGE)
//
// SELF-CONTAINED (no relative import — same nodenext/bundler friction as lib/fleet.ts): products are
// named by their register `key` (fingers) or by name (visage); the board joins fingers against PRODUCTS,
// the numeric-hole test scans the rendered fields. RENDERED text = `label` + `productName` (covered by
// the C-4 numeric-hole scan). `n` is rendered through a call (String(n).padStart), never as a literal.

export type ProfileTier = "finger" | "visage";

export interface PickerProfile {
  /** Ordinal 1..8 (rendered via a call, never as a numeric literal). */
  readonly n: number;
  /** The client frame shown on the pill and the aside title. */
  readonly label: string;
  /** The register key of the product (fingers); null for the VISAGE tier. */
  readonly productKey: string | null;
  /** The product this profile points to. */
  readonly productName: string;
  readonly tier: ProfileTier;
  /** Fleet-agent keys that power the product — used only to light the board cards (sourced above). */
  readonly engineKeys: readonly string[];
}

export const PICKER_PROFILES: readonly PickerProfile[] = [
  { n: 1, label: "Vault LP", productKey: "firebreak", productName: "MONARK Firebreak", tier: "finger", engineKeys: ["ukemi"] },
  { n: 2, label: "DAO / agent", productKey: "warden", productName: "MONARK Warden", tier: "finger", engineKeys: ["genkan"] },
  { n: 3, label: "Leverage", productKey: "softlanding", productName: "MONARK Softlanding", tier: "finger", engineKeys: ["ukemi"] },
  { n: 4, label: "Betting desk", productKey: "verdict", productName: "MONARK Verdict", tier: "finger", engineKeys: ["mokugeki", "kamae"] },
  { n: 5, label: "Rate treasury", productKey: "ballast", productName: "MONARK Ballast", tier: "finger", engineKeys: ["kyokusen"] },
  // VISAGE engineKeys deliberately EMPTY: the design's CORE engine mapping (shogen/hikae/hikae) is the one
  // a product decision rejected the meaning of (2026-09-09); F-site-6 renders "no engine named" for
  // these. Home lights only the backbone (gate + adapter) for a VISAGE profile — no unratified engine claim.
  // Open question: whether Home should light an engine for the 3 VISAGE profiles, and which.
  { n: 6, label: "Fund admin / auditor / CFO", productKey: null, productName: "MONARK Attestation", tier: "visage", engineKeys: [] },
  { n: 7, label: "LP / curator", productKey: null, productName: "MONARK Hallmark", tier: "visage", engineKeys: [] },
  { n: 8, label: "Underwriter / claims officer", productKey: null, productName: "MONARK Threshold", tier: "visage", engineKeys: [] },
];
