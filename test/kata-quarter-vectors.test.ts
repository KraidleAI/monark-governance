// test/kata-quarter-vectors.test.ts -- CM-5, the quarter counts tool (docs/G0-lot-cm5-c2.md, L-T7): the TS guard's vetoFires and uTest
// (apps/harness/src/policy-guard.ts) equal the vectors that the tool writes from binom_exact, fixtures/kata-quarter/veto-vectors.json,
// pinned by the sha256 that its provenance declares. TS only, in test:main; test/kata-quarter.test.ts writes the vectors again and holds
// them byte for byte under the pinned CPython.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as G from "../apps/harness/src/policy-guard.ts";

const DIR = fileURLToPath(new URL("../fixtures/kata-quarter/", import.meta.url));
type Vectors = { format: string; alpha: string; delta: string; vectors: Record<string, [number, number, string, boolean][]> };

// reddened by: uTest not exported, a vetoFires or a uTest of the guard that differs from binom_exact on one pair of the grid k* - 1,
// k*, k* + 1 of each n up to LIVE_N_MAX, or vectors that are not the file its provenance pins
// killer: apps/harness/src/policy-guard.ts:29 CONST "parseTestDelta(KATA_BASE_DELTA)" -> "parseTestDelta(\"0.025\")"
// killer: apps/harness/src/policy-guard.ts:33 CONST "k === n ? \"1\" : " -> ""
test("u_test_and_fire_cross_equal - vetoFires and uTest of the TS guard equal the 8278 vectors that the tool writes from binom_exact at alpha 0.01, k* - 1, k* and k* + 1 for each n up to 2208 at 1h and 552 at 4h", () => {
  assert.ok(existsSync(`${DIR}veto-vectors.json`), "fixtures/kata-quarter/veto-vectors.json absent");
  assert.equal(typeof G.uTest, "function", "uTest is exported by policy-guard.ts");
  const raw = readFileSync(`${DIR}veto-vectors.json`), pin = /^- `veto-vectors\.json` `([0-9a-f]{64})`$/m.exec(readFileSync(`${DIR}PROVENANCE-veto-vectors.md`, "utf8"))?.[1];
  assert.equal(createHash("sha256").update(raw).digest("hex"), pin, "the vectors are the file that the provenance pins");
  const v = JSON.parse(raw.toString("ascii")) as Vectors, seen = new Map<string, [string | null, boolean]>(), wrong: string[] = [];
  assert.deepEqual([v.format, v.alpha, v.delta, Object.keys(v.vectors), Object.values(v.vectors).flat().length], ["kata-veto-vectors-v1", "0.01", "0.05", ["1h", "4h"], 8278]);
  for (const [h, rows] of Object.entries(v.vectors)) {
    for (const [n, k, u, f] of rows) {
      const key = `${n} ${k}`, got = seen.get(key) ?? [G.uTest(k, n), G.vetoFires(n, k, v.alpha)]; // 4h repeats the pairs of 1h
      seen.set(key, got);
      if (got[0] !== u || got[1] !== f) wrong.push(`${h} n ${n} k ${k}: uTest ${String(got[0])} vetoFires ${got[1]}, vectors ${u} ${f}`);
    }
  }
  assert.deepEqual(wrong.slice(0, 5), [], `${wrong.length} pairs differ`);
});
