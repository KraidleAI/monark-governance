import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import {
  conformInterval,
  absoluteResidualScores,
  generateLiquidable24hPairs,
  liquidable24hProvenanceLine,
  LIQUIDABLE_24H_CLASS,
  LIQUIDABLE_24H_HARNESS,
  LIQUIDABLE_24H_ALPHA,
  LIQUIDABLE_24H_N,
  LIQUIDABLE_24H_NMIN,
} from "../src/index.ts";
import type { CalibPair } from "../src/index.ts";
import type { Ajv2020 as Ajv2020Instance, Options, SchemaObject, ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";
import type { CoverageVerdict } from "@monark/contracts";

// Frozen schema `coverage-verdict.schema.json`, compiled by strict ajv — the produced `interval`
// region must validate against the frozen contract. ajv and ajv-formats are CommonJS; under NodeNext
// ESM the export may sit on `.default`, so both are loaded via `require` and the untyped result is
// narrowed to the exact types used here. No `any`, no `eslint-disable`: every token added for typing
// (`import type`, the `type` alias, `as`, and the `<T>` argument) is erased by Node type stripping and
// adds no runtime effect; the executed logic is unchanged (same 83 tests, same behaviour).
type Ajv2020Ctor = new (opts?: Options) => Ajv2020Instance;

const require = createRequire(import.meta.url);
const ajvExport = require("ajv/dist/2020") as { default?: Ajv2020Ctor };
const Ajv2020: Ajv2020Ctor = ajvExport.default ?? (ajvExport as unknown as Ajv2020Ctor);
const addFormatsExport = require("ajv-formats") as { default?: FormatsPlugin };
const addFormats: FormatsPlugin = addFormatsExport.default ?? (addFormatsExport as unknown as FormatsPlugin);
const ROOT = join(import.meta.dirname, "..", "..", "..");
const ajv = new Ajv2020({ strict: true, allowUnionTypes: true, allErrors: true });
addFormats(ajv);
const verdictSchema = JSON.parse(
  readFileSync(join(ROOT, "schemas", "coverage-verdict.schema.json"), "utf8"),
) as SchemaObject;
const validateVerdict: ValidateFunction<CoverageVerdict> = ajv.compile<CoverageVerdict>(verdictSchema);

const COMMON = {
  alpha: LIQUIDABLE_24H_ALPHA,
  nMin: LIQUIDABLE_24H_NMIN,
  taskClass: LIQUIDABLE_24H_CLASS,
  residual: ["assume:synthetic-liquidable-24h"],
  producedAt: "2026-09-04T00:00:00Z",
  schemaVersion: "1.0.0",
} as const;

// Test 34 (ADR-M003 D11) — `interval` conformer: EXACT q̂ and region (deterministic) + MEAN coverage
// over R=100 seeded repetitions (seeds 1..100) >= 1−α−0.005. Named mutant: q̂ shifted by one
// rank (splitQuantile sorted[p-1]→sorted[p-2]) ⇒ exact q̂ wrong ⇒ this test red.
test("interval_conformer_coverage", () => {
  // (a) EXACT q̂/region — hand case. n=99, α=0.01 ⇒ p=⌈100·0.99⌉=99=n ⇒ q̂ = 99th (=max) residual.
  // Constructed residuals = {1,2,…,99} (ŷ=1000, y=1000+i) ⇒ q̂ = 99 EXACTLY; region [901,1099].
  const hand: CalibPair[] = Array.from({ length: 99 }, (_, i) => ({ yhat: 1000, y: 1000 + (i + 1) }));
  const rHand = conformInterval({ ...COMMON, calib: hand, yhat: 1000 });
  assert.equal(rHand.qhat, 99, "q̂ = ⌈(99+1)·0.99⌉-th = 99th sorted residual = 99 (hand constant)");
  assert.deepEqual(rHand.region, { lo: 901, hi: 1099 }, "region = [ŷ−q̂, ŷ+q̂] = [901,1099]");
  assert.equal(rHand.verdict.region.kind, "interval");
  assert.equal(rHand.verdict.reason, "covered");
  assert.equal(rHand.verdict.abstain, false);
  assert.equal(rHand.verdict.method, "split");
  assert.equal(rHand.verdict.task_class, LIQUIDABLE_24H_CLASS);
  // The produced verdict VALIDATES against the frozen schema; a foreign key makes it invalid (closed).
  assert.equal(validateVerdict(rHand.verdict), true, `ajv: ${JSON.stringify(validateVerdict.errors)}`);
  assert.equal(validateVerdict({ ...rHand.verdict, p_correct: 0.99 }), false, "ajv rejects p_correct (closed schema)");

  // (a′) EXACT q̂ at n=300 (seed 1), by INDEPENDENT recomputation in the test (sort + index 297).
  const s1 = generateLiquidable24hPairs(1, LIQUIDABLE_24H_N);
  const sorted = [...absoluteResidualScores(s1)].sort((x, y) => x - y);
  const pIdx = Math.ceil((LIQUIDABLE_24H_N + 1) * (1 - LIQUIDABLE_24H_ALPHA)) - 1; // 298th ⇒ index 297
  assert.equal(pIdx, 297);
  const r300 = conformInterval({ ...COMMON, calib: s1, yhat: 1234.5 });
  assert.equal(r300.qhat, sorted[pIdx], "q̂ = 298th smallest residual (index 297), recomputed independently");
  assert.deepEqual(
    r300.region,
    { lo: 1234.5 - (sorted[pIdx] as number), hi: 1234.5 + (sorted[pIdx] as number) },
    "region centered on the test ŷ",
  );

  // (b) MEAN coverage, R=100 seeds (1..100). Each repetition: n=300 calibration + m=200 test
  // from the SAME seeded stream (exchangeable). Coverage = fraction of test points where y ∈ [ŷ−q̂, ŷ+q̂].
  const R = 100;
  const M = 200;
  let coveredTotal = 0;
  let testTotal = 0;
  for (let seed = 1; seed <= R; seed++) {
    const all = generateLiquidable24hPairs(seed, LIQUIDABLE_24H_N + M);
    const calib = all.slice(0, LIQUIDABLE_24H_N);
    const held = all.slice(LIQUIDABLE_24H_N);
    // q̂ depends only on the calibration: a single conformer pass suffices to obtain it.
    const q = conformInterval({ ...COMMON, calib, yhat: 0 }).qhat;
    assert.notEqual(q, null, `seed ${seed}: q̂ produced (n=300 ≥ nMin)`);
    const qhat = q as number;
    for (const pt of held) {
      testTotal++;
      if (Math.abs(pt.y - pt.yhat) <= qhat) coveredTotal++;
    }
  }
  const meanCoverage = coveredTotal / testTotal;
  const floor = 1 - LIQUIDABLE_24H_ALPHA - 0.005; // 0.985
  assert.ok(
    meanCoverage >= floor,
    `mean coverage ${meanCoverage.toFixed(4)} >= 1−α−0.005 = ${floor} (R=${R} seeds, ${testTotal} points)`,
  );

  // (c) IMPOSED D10 line (D6.2, item 6): harness_version=fixtures-synth + "synthetic" next
  // to the identifier. INJECTED date (never read).
  const d10 = liquidable24hProvenanceLine(1, LIQUIDABLE_24H_N, "2026-09-05");
  assert.ok(d10.includes(`${LIQUIDABLE_24H_CLASS}\` (synthetic)`), `"synthetic" next to the identifier`);
  assert.ok(d10.includes(`harness_version = \`${LIQUIDABLE_24H_HARNESS}\``), "harness_version=fixtures-synth");
  assert.ok(d10.includes("n = 300") && d10.includes("α = 0.01"), "n and α carried on the D10 line");
});
