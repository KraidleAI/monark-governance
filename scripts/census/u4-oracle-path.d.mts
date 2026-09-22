// Type declarations for scripts/census/u4-oracle-path.mjs (U-4b D_e prober, parameterised by episode-selection.json).
// Governance surface for the type-checked test u4b-oracle-path.test.ts. Runtime = the .mjs; Node ignores this file.

export interface Deps {
  env: Record<string, string | undefined>;
  now: () => number;
}

export interface OraclePathResult {
  status: number;         // 0 = ok, 2 = controlled BUDGET STOP
  rawPath?: string;
  inputsPath?: string;
}

/** Read episode-selection.json, verify selection_sha256, return the D_e bornes. Throws (0 fetch) on a sha mismatch. */
export function parseEpisodeFile(path: string): { B0: number; bLast: number; episodeId: string; selectionSha: string };

/** Distinct nonzero e-mode categories from a recorder book (accounts[].emode), sorted ascending. */
export function emodeCategoriesFromBook(book: { accounts?: Array<{ emode?: unknown }> }): number[];

/** Distinct USDT blocks from the labeler's U3-deficit.jsonl (debt_asset == USDT), sorted — a PURE helper for the
 *  orchestrator to compute --usdt-blocks (documented command). */
export function usdtBlocksFromLabelerDeficit(deficitJsonl: string): number[];

/** The realized oracle path course. deps.env is the ONLY env source (C-8); tests stub globalThis.fetch. */
export function run(argv: readonly string[], deps: Deps): Promise<OraclePathResult>;
