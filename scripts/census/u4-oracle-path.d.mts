// Type declarations for scripts/census/u4-oracle-path.mjs (U-4b D_e prober, parameterised by episode-selection.json).
// Governance surface for the type-checked test u4b-oracle-path.test.ts. Runtime = the .mjs; Node ignores this file.

export interface Deps {
  env: Record<string, string | undefined>;
  now: () => number;
}

export interface OraclePathResult {
  status: number;         // 0 = ok, 2 = controlled BUDGET STOP, 3 = PRE-B0 ANCHOR STOP (no raw written)
  rawPath?: string;
  inputsPath?: string;
}

/** Read episode-selection.json, verify selection_sha256, return the D_e bornes. Throws (0 fetch) on a sha mismatch. */
export function parseEpisodeFile(path: string): { B0: number; bLast: number; episodeId: string; selectionSha: string };

/** Distinct nonzero e-mode categories from a recorder book (accounts[].emode), sorted ascending. */
export function emodeCategoriesFromBook(book: { accounts?: Array<{ emode?: unknown }> }): number[];

/** R-H: --usdt-blocks from the labeler's U3-realized.jsonl (the frozen scorer's own predicate; throws on a NON-USDT
 *  deficit_base_no_price line); optional USDT DeficitCreated blocks of the same users from U3-inputs.jsonl. */
export function usdtBlocksFromLabelerDeficit(realizedJsonl: string, inputsJsonl?: string): { required: number[]; optional: number[]; blocks: number[] };

/** R-I: pre-B0 anchor lookback constants (ADDENDUM 2026-09-22 section 2) and the named STOP status. */
export const PRE_B0_FIRST_DEPTH: number;
export const DEFAULT_PRE_B0_MAX_WINDOWS: number;
export const EXIT_PRE_B0_ANCHOR_STOP: number;

/** R-I: the receding lookback windows [from, to] (inclusive, disjoint, newest first). */
export function preB0Windows(B0: number, maxWindows: number, firstDepth?: number): Array<[number, number]>;

/** R-I: the LAST AnswerUpdated (block, logIndex) with lo <= block <= hi, in the cp-1 C-4 field form, or null. */
export function pickPreB0Anchor(logs: ReadonlyArray<{ blockNumber: string; logIndex: string; topics: readonly string[] }>, lo: number, hi: number): { price: string; block: number; log_index: number; round_id: string } | null;

/** The realized oracle path course. deps.env is the ONLY env source (C-8); tests stub globalThis.fetch. */
export function run(argv: readonly string[], deps: Deps): Promise<OraclePathResult>;
