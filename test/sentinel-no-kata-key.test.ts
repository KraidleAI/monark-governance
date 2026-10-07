// test/sentinel-no-kata-key.test.ts -- the Narabi sentinel stays apart from the served kata rows: no file under apps/sentinel names a
// kata key, and no import line there names a kata module. The test lives outside apps/sentinel so that its own text stays out of the scan.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SENTINEL = fileURLToPath(new URL("../apps/sentinel/", import.meta.url));

// killer: apps/sentinel/src/timeline.ts:16 CONST "@monark/harness/calibration" -> "@monark/harness/kata"
test("sentinel_imports_no_kata_key", () => {
  const files = readdirSync(SENTINEL, { recursive: true, withFileTypes: true }).filter((e) => e.isFile() && !e.parentPath.includes("node_modules")).map((e) => join(e.parentPath, e.name));
  assert.ok(files.some((f) => f.endsWith("timeline.ts")) && files.some((f) => f.endsWith(".json")), "the walk reaches the sources and the fixtures");
  for (const f of files) {
    const text = readFileSync(f, "latin1");
    assert.doesNotMatch(text, /\bkata:/i, `${f} names a kata key`);
    assert.ok(!text.split("\n").some((ln) => /^\s*(import|export)\b.*["'][^"']*kata/i.test(ln)), `${f} imports a kata module`);
  }
});
