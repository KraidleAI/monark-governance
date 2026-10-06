// scripts/repin-served.d.mts - type surface of scripts/repin-served.mjs for test/harness-served.test.ts (lot T0-TOOLING-1).
// Runtime implementation = repin-served.mjs; Node ignores this file. Governance-only, NOT whitelisted for public export.
export const PIN_TEST_REL: string;
export const PINNED_FILES: readonly string[];
/** Each listed file present under `root`, to its CRLF->LF sha256, in the list's order. */
export function pinsOf(root: string): Record<string, string>;
/** The test text with its PINNED block rewritten to `pins`; throws unless the block occurs exactly once. */
export function repinText(text: string, pins: Record<string, string>): string;
