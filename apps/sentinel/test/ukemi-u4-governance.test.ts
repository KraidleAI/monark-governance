// UKEMI U-4a A-2 (governance-only) — the committed prereg LF sha is exactly the one the course --prereg-sha
// will require (order proof, U4-H1 not post hoc). SEPARATED from ukemi-u4a.test.ts and EXCLUDED from the
// public export (scripts/export-exclude-tests.json, ADR-M004 D7 addendum): it reads docs/PLAN-u4-prereg.md,
// a governance/provenance file the export deliberately omits (D7 structural blacklist), so an EXPORTED run
// would ENOENT (the C-V-1 α failure). Kept here for the governance CI, never a silent skip. NO network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { lfSha256 } from "../src/ukemi/record.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(HERE, "..", "..", ".."); // apps/sentinel/test -> repo root

test("u4_prereg_sha_matches_committed_plan", () => {
  const text = readFileSync(join(ROOT, "docs", "PLAN-u4-prereg.md"), "utf8");
  assert.equal(lfSha256(text), "9209cdabe26d56f0be8603e214b29e8b10b2efb55f9d6c9e6fad68ae189849fb", "docs/PLAN-u4-prereg.md LF sha256 == the pinned prereg sha (A-2)");
});
