// apps/site/app/roadmap/frozen-contracts.ts — server-only, build-time listing of the FROZEN JSON-Schema contracts
// (schemas/*.schema.json, the language-neutral source of truth, byte-frozen by the root contracts-frozen test). The home
// page and /roadmap render the COUNT as a word derived from this listing, never a typed number, so the two pages can no
// longer disagree on it. The contract that is frozen but not served yet is named ONCE here, by its schema file; the root
// test frozen_contracts_count_is_derived (test/site-build-fleet.test.ts) checks that the file exists, that no served
// harness module names the contract (its file name, its schema title or an adapter carrying that title) and that no
// registered tool schema carries its distinctive keys, so the words "upcoming until served" red the day a lot serves it
// through the harness. Declared limit: a contract served outside the harness (a published file) is not seen there.
// Self-contained (node built-ins only, no alias import): the root test program imports it too.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface FrozenContractEntry {
  /** The schema file name under schemas/. */
  readonly file: string;
  /** The schema's own title (e.g. "AttestedBook"), read from the file, never typed here. */
  readonly title: string;
}

export interface FrozenContractsSummary {
  /** How many frozen contracts schemas/ holds (rendered as a word). */
  readonly count: number;
  /** Titles of the frozen contracts not served yet, read from their schema files. */
  readonly unservedTitles: readonly string[];
}

/** Frozen but not served yet: the schema is frozen, no served path emits or consumes it (README "Upcoming until served"). */
export const UNSERVED_CONTRACT_FILES: readonly string[] = ["attested-book.schema.json"];

/** Every frozen contract under `rootDir`/schemas, sorted by file name. Fail-closed on an empty directory or a schema
 *  without a title (a build must never render a count or a name it could not read). */
export function listFrozenContracts(rootDir: string): FrozenContractEntry[] {
  const dir = join(rootDir, "schemas");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".schema.json"))
    .sort();
  if (files.length === 0) throw new Error("frozen contracts: no schemas/*.schema.json found (fail-closed)");
  return files.map((file) => {
    const schema = JSON.parse(readFileSync(join(dir, file), "utf8")) as { title?: unknown };
    if (typeof schema.title !== "string" || schema.title.trim().length === 0) {
      throw new Error(`frozen contracts: schemas/${file} carries no title (fail-closed)`);
    }
    return { file, title: schema.title };
  });
}

/** The count and the not-yet-served titles, both read from schemas/. Fail-closed if a declared unserved file is absent. */
export function frozenContractsSummary(rootDir: string): FrozenContractsSummary {
  const all = listFrozenContracts(rootDir);
  const unservedTitles = UNSERVED_CONTRACT_FILES.map((file) => {
    const entry = all.find((c) => c.file === file);
    if (!entry) throw new Error(`frozen contracts: declared unserved schema ${file} is absent from schemas/ (fail-closed)`);
    return entry.title;
  });
  return { count: all.length, unservedTitles };
}
