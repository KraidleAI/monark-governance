/**
 * Root test `harness_export_whitelisted` (ADR-M005 D10/D16, PLAN §H4, Q-A). The public export
 * (scripts/export-public.mjs) MUST carry apps/harness PACKAGE-STYLE — src, test, package.json,
 * README.md — so KraidleAI/monark is reproducible e2e, and MUST NOT drag apps/harness/tsconfig.json
 * (whole-dir cruft the export does not need). The committed s3-binance Shōgen fixtures MUST also be in
 * the export (already via WHITELIST_DIRS=["fixtures",…]). Governance-only: this test is NOT whitelisted,
 * so it never runs inside the exported CI. No `any` (off the ratchet).
 *
 * Uses collectFiles directly (run-guarded, side-effect-free on import; it does NOT exit on the pending
 * LICENSE — that lands in `missingRequired`, harmless here). Mutant: drop "apps/harness" from
 * APP_PACKAGE_DIRS in export-public.mjs ⇒ the harness src/test files leave `kept` ⇒ red.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { collectFiles } from "../scripts/export-public.mjs";

const ROOT = join(import.meta.dirname, "..");

test("harness_export_whitelisted", () => {
  const { kept } = collectFiles(ROOT);
  const rels = new Set(kept.map((f) => f.rel));

  // apps/harness is exported PACKAGE-STYLE: src/** (incl. the H4 mirror + OpenAPI), test/**, package.json, README.md.
  const required = [
    "apps/harness/package.json",
    "apps/harness/README.md",
    "apps/harness/src/server.ts",
    "apps/harness/src/http.ts",
    "apps/harness/src/openapi.ts",
    "apps/harness/src/schema-projection.ts",
    "apps/harness/src/tools/registry.ts",
    "apps/harness/src/tools/gate.ts",
    "apps/harness/src/tools/cascade.ts",
    "apps/harness/src/tools/attest.ts",
    "apps/harness/test/http.test.ts",
    "apps/harness/test/openapi.test.ts",
  ];
  for (const rel of required) assert.ok(rels.has(rel), `apps/harness export must include ${rel}`);

  // whole-dir cruft the package-style export deliberately omits (the exported root tsconfig covers it).
  assert.ok(!rels.has("apps/harness/tsconfig.json"), "apps/harness/tsconfig.json must NOT be exported (package-style, not whole-dir)");

  // the type surface registry.test.ts needs at import (else the exported tsc reds TS7016).
  assert.ok(rels.has("scripts/grep-forbidden.d.mts"), "grep-forbidden.d.mts must be exported (registry.test.ts type import)");

  // Q-A: the committed s3-binance Shōgen fixtures ship too (already via WHITELIST_DIRS=["fixtures",…]),
  // so the attest path is reproducible in the public mirror.
  for (const rel of ["fixtures/s3-binance.lot.cbor", "fixtures/s3-binance.verdict.txt", "fixtures/s3-binance.constat.json"]) {
    assert.ok(rels.has(rel), `Shōgen fixture ${rel} must be exported (Q-A e2e reproducibility)`);
  }
});
