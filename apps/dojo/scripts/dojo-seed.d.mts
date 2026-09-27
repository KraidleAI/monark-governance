// apps/dojo/scripts/dojo-seed.d.mts -- type surface of dojo-seed.mjs (TS7016 sidecar, precedent dojo-core.d.mts) so the type-checked
// root tests import the tool without executing its CLI. Runtime = dojo-seed.mjs.
export const DOJO_SEED_REFUSALS: readonly string[];
export class DojoSeedError extends Error {
  code: string;
  detail: string;
  constructor(code: string, detail: string);
}
export function initSeed(path: string, horizon: number): { seed_anchor: string; horizon: number };
export function runCli(argv: readonly string[]): number;
