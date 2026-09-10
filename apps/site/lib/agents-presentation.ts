// apps/site/lib/agents-presentation.ts — PRESENTATION-ONLY metadata for the engine board (Lot F-site-4).
// The fleet register (lib/fleet.ts) stays the single source of truth for name / role / status / teaser
// line; this module adds ONLY what the board draws that is not part of the frozen register: the kanji
// glyph and the one fixed brand accent per agent (brand freeze 2026-09-07 — "one fixed accent per
// agent"). Kanji + accent are transcribed from the MONARK design source AG table (MONARK.dc.html
// L524-535; external, not committed to this public mirror). No status, no count, NOTHING that could
// drift from the register lives here — a join by `name` in the board reunites the two.
//
// SELF-CONTAINED on purpose (no relative import): this module is imported both by the Next app (bundler
// resolution) and by the root numeric-hole test under nodenext, and lib/fleet.ts documents that no single
// relative specifier type-checks under both. It therefore names agents by a plain ascii `key` and the
// display `name`; the board joins against FLEET_AGENTS, the numeric-hole test scans the rendered fields.
//
// RENDERED text = `name` + `kanji` only (covered by the C-4 numeric-hole scan in test/ci-gates.test.ts).
// `accent` is emitted into an inline style (a border / tint / glow), never into a text position, so it is
// neither a honesty-lint surface nor part of the numeric-hole scan — hence the hex accents are safe.

export interface AgentPresentation {
  /** Ascii key, used to pick the SVG mark in the board (never a frozen-contract field name). */
  readonly key: string;
  /** Display name — joined against FLEET_AGENTS.name (the register is the source of truth). */
  readonly name: string;
  /** The kanji drawn beside the name (design AG). */
  readonly kanji: string;
  /** The one fixed brand accent for this agent: a CSS variable for the three built agents, the frozen
   *  design hex for the eight upcoming ones. Emitted only into inline style (border / tint / glow). */
  readonly accent: string;
}

export const AGENTS_PRESENTATION: readonly AgentPresentation[] = [
  { key: "shogen", name: "Shōgen", kanji: "証言", accent: "var(--shogen-t)" },
  { key: "hikae", name: "Hikae", kanji: "控え", accent: "var(--hikae-t)" },
  { key: "ukemi", name: "Ukemi", kanji: "受身", accent: "var(--ukemi-t)" },
  { key: "mokugeki", name: "Mokugeki", kanji: "目撃", accent: "#4E6E8E" },
  { key: "narabi", name: "Narabi", kanji: "並び", accent: "#B8922E" },
  { key: "kaihi", name: "Kaihi", kanji: "回避", accent: "#E06B2E" },
  { key: "kessai", name: "Kessai", kanji: "決済", accent: "#2E8B57" },
  { key: "kamae", name: "Kamae", kanji: "構え", accent: "#7A5AC2" },
  { key: "kyokusen", name: "Kyokusen", kanji: "曲線", accent: "#C0478F" },
  { key: "koyomi", name: "Koyomi", kanji: "暦", accent: "#1E9AA6" },
  { key: "genkan", name: "Genkan", kanji: "玄関", accent: "#B06A4A" },
];
