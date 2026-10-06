// scripts/spec-policy-tables.d.mts -- type surface of scripts/spec-policy-tables.mjs (lot SPEC-1-1-0-RELEASE; the dated table versions of
// lot R-b of ENGINE-ROW-RETIRE-PATH-1) for what the root tests import (spec-publish.d.mts precedent). Node ignores this file.
export const REPO_ROOT: string;
export const VERSION_DIR: string;
export const OUT_DIR: string;
export const RETIRE_DIR: string;
export const SCHEMA_NAMES: readonly string[];
export const EDITS: Readonly<Record<string, readonly (readonly [string, string])[]>>;
export function publicId(name: string): string;
export function schemaCopy(name: string, text: string): string;
export const SHORT_N: number;
export function tableText(table: unknown): string;
export function expectedFiles(root?: string, tables?: readonly { task_class: string; table: unknown }[]): Promise<{ path: string; text: string }[]>;
export function differences(root: string, files: readonly { path: string; text: string }[]): string[];
export function writeAll(root: string, files: readonly { path: string; text: string }[]): void;
export function isMain(argv1: string | undefined, self: string): boolean;
export function main(argv: string[]): Promise<number>;
export function servedTableDirs(root: string, tables: readonly { task_class: string }[], without?: string | null): Readonly<Record<string, string>>;
export function datedDir(date: string): string;
export function retireListAt(root: string, date: string): string | null;
export function datedFiles(root: string, date: string, tables?: readonly { task_class: string; table: unknown }[]): Promise<{ path: string; text: string }[]>;
export function writeDated(root: string, files: readonly { path: string; text: string }[]): void;
export function writeFlat(root: string, files: readonly { path: string; text: string }[]): void;
export function releaseEntries(files: readonly { path: string; text: string }[]): string[];
