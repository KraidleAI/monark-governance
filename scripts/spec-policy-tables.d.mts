// scripts/spec-policy-tables.d.mts -- type surface of scripts/spec-policy-tables.mjs (lot SPEC-1-1-0-RELEASE) for what the root test
// imports (spec-publish.d.mts precedent). Node ignores this file.
export const REPO_ROOT: string;
export const OUT_DIR: string;
export const SCHEMA_NAMES: readonly string[];
export function publicId(name: string): string;
export function schemaCopy(name: string, text: string): string;
export function expectedFiles(root?: string): Promise<{ path: string; text: string }[]>;
export function differences(root: string, files: readonly { path: string; text: string }[]): string[];
export function main(argv: string[]): Promise<number>;
