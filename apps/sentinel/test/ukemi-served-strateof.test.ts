/**
 * Sentinel -- the SERVED strateOf (apps/harness/src/ukemi-strata.ts) equals the FROZEN strateOf
 * (scripts/census/u4b/u4b-scores.mjs) BY INDEX on the cuts, on the 9 code boundaries, AND on EVERY score_a
 * row of the committed scores fixtures: the e2 DESIGN set and, since U-4b-2b, the FRESH episode whose stratum s0 is
 * served (U-4b-2a; checkpoint-1 C-5 / delta D-4/D-6; ADR-U4b-2b section 4). This is the anti-drift twin
 * of u4b_served_strata_cuts_and_boundaries: it must live in the SENTINEL because it imports the frozen scorer,
 * which reads node:fs + apps/sentinel (so it cannot live in the pure harness). It is export-excluded
 * (scripts/export-exclude-tests.json) because it imports scripts/census/** and reads the upcoming fixture. It
 * reads ONLY yhat / strate (delta D-6, invariant under U-4b-SCORE-1) -- never a hard-coded fixture sha.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { strateOf as strateOfFrozen, STRATA_CUTS } from "../../../scripts/census/u4b/u4b-scores.mjs";
import { strateOf as strateOfServed, STRATA_CUTS_SERVED } from "../../harness/src/ukemi-strata.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const U4B = join(HERE, "fixtures", "ukemi", "u4b");
/** [file, minimum score_a rows] -- measured 565 (e2, base f0720ae) and 205 (fresh weth-2025-09-22, U-4b-2b). */
const FIXTURES: ReadonlyArray<readonly [string, number]> = [["U4b-scores-e2.jsonl", 500], ["U4b-scores-weth-2025-09-22.jsonl", 200]];

interface ScoreARow { kind: string; yhat?: string; strate?: number }
function jsonl(path: string): ScoreARow[] {
  return readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as ScoreARow);
}

const BOUNDARIES = [0, 199999999999, 200000000000, 9999999999999, 10000000000000, 99999999999999, 100000000000000, 182275303256926, 9007199254740991];

test("u4b_served_strateof_matches_frozen_on_jsonl", () => {
  // (1) the cuts agree BY INDEX (frozen bigint -> number; every cut < 2^53, so the conversion is exact).
  assert.equal(STRATA_CUTS_SERVED.length, STRATA_CUTS.length, "same number of cuts");
  STRATA_CUTS.forEach((c, i) => {
    assert.equal(STRATA_CUTS_SERVED[i], Number(c), `served cut[${String(i)}] == frozen cut[${String(i)}]`);
  });
  // (2) the 9 code boundaries agree on BOTH functions.
  for (const b of BOUNDARIES) {
    assert.equal(strateOfServed(b), strateOfFrozen(BigInt(b)), `served strateOf(${String(b)}) == frozen strateOf`);
  }
  // (3) EVERY score_a row: the served strateOf(Number(yhat)) equals the committed row.strate, and the frozen
  // function agrees on the SAME input (the byte-for-byte re-declaration proof, C-5).
  for (const [name, minRows] of FIXTURES) {
    const rows = jsonl(join(U4B, name)).filter((r) => r.kind === "score_a");
    assert.ok(rows.length >= minRows, `${name}: non-vacuous score_a set (found ${String(rows.length)}, at least ${String(minRows)})`);
    for (const r of rows) {
      const y = r.yhat ?? "0";
      assert.equal(strateOfServed(Number(y)), r.strate, `${name}: served strateOf(${y}) == committed row.strate ${String(r.strate)}`);
      assert.equal(strateOfFrozen(y), r.strate, `${name}: frozen strateOf(${y}) == committed row.strate ${String(r.strate)}`);
    }
  }
});
