// scripts/spec-policy-tables.d.mts -- type surface of scripts/spec-policy-tables.mjs (lot SPEC-1-1-0-RELEASE) for what the root test
// imports (spec-publish.d.mts precedent). Node ignores this file.
export const REPO_ROOT: string;
export const VERSION_DIR: string;
export const OUT_DIR: string;
export const SCHEMA_NAMES: readonly string[];
export const EDITS: Readonly<Record<string, readonly (readonly [string, string])[]>>;
export function publicId(name: string): string;
export function schemaCopy(name: string, text: string): string;
export const SHORT_N: number;
export function tableText(table: { class: { task_class: string }; rows: readonly { cell_key: string; recompute: unknown; n: number }[] }): string;
export function expectedFiles(root?: string): Promise<{ path: string; text: string }[]>;
export function differences(root: string, files: readonly { path: string; text: string }[]): string[];
export function writeAll(root: string, files: readonly { path: string; text: string }[]): void;
export function isMain(argv1: string | undefined, self: string): boolean;
export function main(argv: string[]): Promise<number>;
