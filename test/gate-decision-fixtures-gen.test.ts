/**
 * FIXTURES-GATE-DECISION-GEN-1 (contract 1.1.0, block C, lot CM-3c-2): before block C regenerates the nine states in 1.1.0, the generator
 * scripts/gen-gate-decision-fixtures.mjs reproduces the committed fixtures/*.gate-decision.json and fixtures/manifest.json byte for byte.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gateDecisionFixtures } from "../scripts/gen-gate-decision-fixtures.mjs";

const FIX = join(import.meta.dirname, "..", "fixtures"), lf = (f: string): string => readFileSync(join(FIX, f), "utf8").replace(/\r\n/g, "\n");

// killer: scripts/gen-gate-decision-fixtures.mjs:35 CONST "\"down\", 0.06" -> "\"down\", 0.07"
test("gate_decision_fixtures_generator_reproduces_the_committed_files", () => {
  const { files, manifest } = gateDecisionFixtures();
  const committed = readdirSync(FIX).filter((f) => f.endsWith(".gate-decision.json")).sort();
  assert.deepEqual(Object.keys(files).sort(), committed, "the generator writes exactly the nine committed states");
  for (const f of committed) assert.equal(files[f], lf(f), `${f}: generator output != committed bytes`);
  assert.equal(manifest, lf("manifest.json"), "fixtures/manifest.json is the generator's manifest");
});
