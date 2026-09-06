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

// Test 34 (ADR-M003 D11) — conformeur `interval` : q̂ et région EXACTS (déterministe) + couverture
// MOYENNE sur R=100 répétitions seedées (seeds 1..100) >= 1−α−0.005. Mutant nommé : q̂ décalé d'un
// rang (splitQuantile sorted[p-1]→sorted[p-2]) ⇒ q̂ exact faux ⇒ ce test rouge.
test("interval_conformer_coverage", () => {
  // (a) q̂/région EXACTS — cas à la main. n=99, α=0.01 ⇒ p=⌈100·0.99⌉=99=n ⇒ q̂ = 99e (=max) résidu.
  // Résidus construits = {1,2,…,99} (ŷ=1000, y=1000+i) ⇒ q̂ = 99 EXACTEMENT ; région [901,1099].
  const hand: CalibPair[] = Array.from({ length: 99 }, (_, i) => ({ yhat: 1000, y: 1000 + (i + 1) }));
  const rHand = conformInterval({ ...COMMON, calib: hand, yhat: 1000 });
  assert.equal(rHand.qhat, 99, "q̂ = ⌈(99+1)·0.99⌉-ième = 99e résidu trié = 99 (constante à la main)");
  assert.deepEqual(rHand.region, { lo: 901, hi: 1099 }, "région = [ŷ−q̂, ŷ+q̂] = [901,1099]");
  assert.equal(rHand.verdict.region.kind, "interval");
  assert.equal(rHand.verdict.reason, "covered");
  assert.equal(rHand.verdict.abstain, false);
  assert.equal(rHand.verdict.method, "split");
  assert.equal(rHand.verdict.task_class, LIQUIDABLE_24H_CLASS);
  // Le verdict produit VALIDE le schéma gelé ; une clé étrangère le rend invalide (fermé).
  assert.equal(validateVerdict(rHand.verdict), true, `ajv : ${JSON.stringify(validateVerdict.errors)}`);
  assert.equal(validateVerdict({ ...rHand.verdict, p_correct: 0.99 }), false, "ajv refuse p_correct (schéma fermé)");

  // (a′) q̂ EXACT à n=300 (seed 1), par recomputation INDÉPENDANTE dans le test (tri + indice 297).
  const s1 = generateLiquidable24hPairs(1, LIQUIDABLE_24H_N);
  const sorted = [...absoluteResidualScores(s1)].sort((x, y) => x - y);
  const pIdx = Math.ceil((LIQUIDABLE_24H_N + 1) * (1 - LIQUIDABLE_24H_ALPHA)) - 1; // 298e ⇒ indice 297
  assert.equal(pIdx, 297);
  const r300 = conformInterval({ ...COMMON, calib: s1, yhat: 1234.5 });
  assert.equal(r300.qhat, sorted[pIdx], "q̂ = 298e plus petit résidu (indice 297), recalculé indépendamment");
  assert.deepEqual(
    r300.region,
    { lo: 1234.5 - (sorted[pIdx] as number), hi: 1234.5 + (sorted[pIdx] as number) },
    "région centrée sur ŷ de test",
  );

  // (b) Couverture MOYENNE, R=100 seeds (1..100). Chaque répétition : n=300 calibration + m=200 test
  // du MÊME flux seedé (échangeables). Couverture = fraction des points de test dont y ∈ [ŷ−q̂, ŷ+q̂].
  const R = 100;
  const M = 200;
  let coveredTotal = 0;
  let testTotal = 0;
  for (let seed = 1; seed <= R; seed++) {
    const all = generateLiquidable24hPairs(seed, LIQUIDABLE_24H_N + M);
    const calib = all.slice(0, LIQUIDABLE_24H_N);
    const held = all.slice(LIQUIDABLE_24H_N);
    // q̂ ne dépend que de la calibration : une passe du conformeur suffit à l'obtenir.
    const q = conformInterval({ ...COMMON, calib, yhat: 0 }).qhat;
    assert.notEqual(q, null, `seed ${seed}: q̂ produit (n=300 ≥ nMin)`);
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
    `couverture moyenne ${meanCoverage.toFixed(4)} >= 1−α−0.005 = ${floor} (R=${R} seeds, ${testTotal} points)`,
  );

  // (c) Ligne D10 IMPOSÉE (D6.2, item 6) : harness_version=fixtures-synth + « synthétique » à côté
  // de l'identifiant. Date INJECTÉE (jamais lue).
  const d10 = liquidable24hProvenanceLine(1, LIQUIDABLE_24H_N, "2026-09-05");
  assert.ok(d10.includes(`${LIQUIDABLE_24H_CLASS}\` (synthétique)`), "« synthétique » accolé à l'identifiant");
  assert.ok(d10.includes(`harness_version = \`${LIQUIDABLE_24H_HARNESS}\``), "harness_version=fixtures-synth");
  assert.ok(d10.includes("n = 300") && d10.includes("α = 0.01"), "n et α portés sur la ligne D10");
});
