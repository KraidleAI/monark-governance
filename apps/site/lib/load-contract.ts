// apps/site/lib/load-contract.ts — server-only read of a FROZEN JSON-Schema contract from schemas/
// (ADR-M001; the schemas are the language-neutral source of truth per README). The storefront shows
// the contract SHAPE for integrators (PLAN F-2 §2, panel block 6: the frozen JSON contract, read from schemas/).
// Read at build time inside a server component and passed to the client panel as a prop, so no
// node:fs reaches the client bundle. `rootDir` is the repo root: a server component passes
// join(process.cwd(), "..", "..") — apps/site is the cwd under `next build`/`next dev` (mirrors
// lib/load-committed.ts). schemas/ is frozen (contracts-frozen.test.ts); this module only reads it.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface FrozenContract {
  title: string;
  producer: string;
  required: string[];
}

/**
 * Read ONE frozen JSON-Schema contract from schemas/ (title + required[]) and tag it with the agent
 * that produces it. Used by the per-agent panel block 6. `producer` is the storefront-facing name of
 * the emitting agent (the schemas themselves carry no producer field); it is a caller constant, never a
 * schema value. required[] flows dynamically to the panel — the field names are NEVER hard-coded in the
 * app (guarded by test/ci-gates.test.ts `frozen_contract_fields_stay_dynamic`).
 */
export function loadContract(rootDir: string, schemaFile: string, producer: string): FrozenContract {
  const abs = join(rootDir, "schemas", schemaFile);
  const schema = JSON.parse(readFileSync(abs, "utf8")) as { title?: string; required?: string[] };
  return {
    title: typeof schema.title === "string" ? schema.title : schemaFile,
    producer,
    required: Array.isArray(schema.required) ? schema.required : [],
  };
}

// AttestedPrice producer (README contract table); Shogen is Rust, not in this repo.
export function loadAttestedPriceContract(rootDir: string): FrozenContract {
  return loadContract(rootDir, "attested-price.schema.json", "Shōgen");
}
