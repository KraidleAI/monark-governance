// test/sentinel-no-kata-key.test.ts -- the Narabi sentinel stays apart from the served kata rows: no file under apps/sentinel holds
// "kata" in any case, which is the measure `git grep -i kata -- apps/sentinel` itself (a key, an import in any form, a path or a
// comment alike). The test lives outside apps/sentinel so that its own text stays out of the scan.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SENTINEL = fileURLToPath(new URL("../apps/sentinel/", import.meta.url));

// killer: apps/sentinel/src/timeline.ts:16 CONST "@monark/harness/calibration" -> "@monark/harness/kata"
test("sentinel_imports_no_kata_key", () => {
  const files = readdirSync(SENTINEL, { recursive: true, withFileTypes: true }).filter((e) => e.isFile() && !relative(SENTINEL, e.parentPath).split(sep).includes("node_modules")).map((e) => join(e.parentPath, e.name));
  // Anchor a source and a fixture: a walk that silently skipped src/, test/ or test/fixtures/ would be a false green.
  const rel = files.map((f) => relative(SENTINEL, f).split(sep).join("/"));
  assert.ok(rel.includes("src/timeline.ts") && rel.includes("test/fixtures/usde-boundary-blocks.json"), "the walk reaches src/timeline.ts and test/fixtures/usde-boundary-blocks.json");
  for (const f of files) assert.doesNotMatch(readFileSync(f, "latin1"), /kata/i, `${f} names a kata key (its text holds "kata", case ignored)`);
});
