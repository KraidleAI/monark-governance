// scripts/emit-u4b-calibration.d.mts - type surface of the pure functions scripts/emit-u4b-calibration.mjs exports
// (behind a run-guard), so the type-checked test apps/harness/test/calibration-liq.test.ts can recompose the committed
// block WITHOUT running the CLI. Runtime implementation = emit-u4b-calibration.mjs; Node ignores this file.
// Governance-only (record-u4b-calib.d.mts precedent), NOT whitelisted for public export.
import type { U4bRegistryEntry } from "./record-u4b-calib.mjs";

/** The two marker lines that delimit the generated region of apps/harness/src/calibration.ts (inclusive). */
export const BEGIN_MARK: string;
export const END_MARK: string;
/** The scores series as the frozen generator's own main() reads it: its meta line and its class-A rows. */
export function readScores(path: string): { meta: { cell_a?: { predictor_id?: string } } & Record<string, unknown>; rowsA: Array<{ strate: number; score: string; [k: string]: unknown }> };
/** Smallest n whose conformal rank ceil((n+1)(1-alpha)) is below n (an interior q-hat); alpha must be 1/k. */
export function interiorRankMinN(alpha: number): number;
/** PURE: generator entries (+ the digests of the committed inputs) -> the TypeScript block, markers included. */
export function emitBlock(args: {
  entries: readonly U4bRegistryEntry[];
  predictorBase: string;
  digests: { scores: string; book: string; oracle: string; labels: string; reportBody: string; eventId: string };
  measuredOn: string;
}): string;
/** Read every input (all committed repository files), cross-check the report copy, compose the block. */
export function blockFromFiles(args: { scores: string; book: string; oraclePath: string; labels: string; report: string; measuredOn: string }): string;
/** Replace the marked region (inclusive) of `text` by `block` (LF-normalized); throws unless exactly one pair of markers. */
export function spliceBlock(text: string, block: string): string;
