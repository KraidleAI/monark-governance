/**
 * Root test `fixtures_root_valid` — ADR-M002 D1 (Lot D item 2) / D11.
 * The 9 states in `fixtures/` (3 COMMIT / 2 DEFER / 3 ABSTAIN / 1 under_calib) are
 * `GateDecision` values valid against the frozen schemas (ajv) AND against the Phase 0
 * runtime guards (closed-check + forbidden-keys), and their sha256 == fixtures/manifest.json.
 * Read by Lot D (replay) and by Lot H (conformance oracle). Run by `npm test`
 * in each worktree.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { serializeGateDecision, calibDigest } from "../packages/contracts/src/index.ts";
import type { GateDecision } from "../packages/contracts/src/index.ts";

const ROOT = join(import.meta.dirname, "..");
const FIX = join(ROOT, "fixtures");
const require = createRequire(import.meta.url);
const ajvMod = require("ajv/dist/2020");
const Ajv2020 = ajvMod.default ?? ajvMod;
const addFormatsMod = require("ajv-formats");
const addFormats = addFormatsMod.default ?? addFormatsMod;

function loadSchema(name: string): object {
  return JSON.parse(readFileSync(join(ROOT, "schemas", name), "utf8")) as object;
}

const manifest = JSON.parse(readFileSync(join(FIX, "manifest.json"), "utf8")) as Record<string, string>;
const files = readdirSync(FIX).filter((f) => f.endsWith(".gate-decision.json")).sort();

test("fixtures_root_valid — 9 states, hash == manifest", () => {
  assert.equal(files.length, 9, "expected 9 fixtures");
  assert.deepEqual(Object.keys(manifest).sort(), files, "manifest != files");
  for (const f of files) {
    const raw = readFileSync(join(FIX, f), "utf8").replace(/\r\n/g, "\n");
    assert.equal(createHash("sha256").update(raw, "utf8").digest("hex"), manifest[f], `derived hash: ${f}`);
  }
});

test("fixtures_root_valid — ajv + Phase 0 runtime guards, 3/2/3/1 split", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  addFormats(ajv);
  ajv.addSchema(loadSchema("coverage-verdict.schema.json"), "coverage-verdict.schema.json");
  const validate = ajv.compile(loadSchema("gate-decision.schema.json"));
  const counts = { commit: 0, defer: 0, abstain: 0, under_calib: 0 };
  for (const f of files) {
    const d = JSON.parse(readFileSync(join(FIX, f), "utf8")) as GateDecision;
    assert.ok(validate(d), `${f}: ${JSON.stringify(validate.errors)}`);
    assert.doesNotThrow(() => serializeGateDecision(d), `${f}: runtime guard`);
    if (d.verdict.scores) assert.equal(d.verdict.calib_digest, calibDigest(d.verdict.scores), `${f}: calib_digest`);
    // 3/2/3/1: under_calib is counted separately from abstentions (ADR-M002 D11).
    if (d.reason === "under_calib") counts.under_calib += 1;
    else counts[d.action] += 1;
    assert.equal(d.allow, d.action === "commit", `${f}: allow != (action==commit)`);
  }
  assert.deepEqual(counts, { commit: 3, defer: 2, abstain: 3, under_calib: 1 });
});
