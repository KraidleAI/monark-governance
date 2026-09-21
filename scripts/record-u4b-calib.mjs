#!/usr/bin/env node
// scripts/record-u4b-calib.mjs — U-4b-1a C-9 generator: the NAMED maillon U4b-scores.jsonl → apps/harness/src/
// calibration.ts entries (Mondrian class A, one CommittedCalibration per stratum). REPRODUCIBLE: reads the
// committed class-A score rows, groups by the a-priori strata, scales the base-8dec bigint scores to number[]
// with an EXPLICIT scale (default 1, declared) and a per-stratum 2^53 fail-closed bound, and computes q̂ +
// calibDigest (ADR-M001 C5, float64_be sorted) per stratum. Class A ONLY (decision investisseur 108: Class B is
// a formed item, not served). Here it runs on the e2 DESIGN set — the committed calibration.ts entries are built
// in -2 from the FRESH episode; this validates the generator + its recompute test offline. NO commit (R-20).
//   node scripts/record-u4b-calib.mjs [--scores <U4b-scores.jsonl>] [--scale <bigint>]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname, join } from "node:path";
import { calibDigest } from "@monark/contracts";
import { splitQuantile } from "@monark/hikae";

const NMIN = 100, ALPHA = 0.01;
const CAP = 2n ** 53n; // largest integer exactly representable as float64

// SELF-CHECK: calibDigest is the C5 contract function (float64_be sorted), not a sha256(JSON) look-alike.
if (calibDigest([0, 1]) !== "1e47beee7f4175a863385dc2f9c8278138e35f0caa43a5467a523519f1e91081") throw new Error("record-u4b-calib: calibDigest self-check FAILED — wrong digest function.");

/** PURE: class-A score rows → one registry entry per Mondrian stratum. Scores are base-8dec bigint strings; each
 *  is scaled by `scale` (exact division required) and bounded by 2^53 (fail-closed, C-9). q̂ comes from the SAME
 *  L1 `splitQuantile` gate.ts serves in -2 (anti-circularity: the hand p-th smallest is cross-checked and throws
 *  on divergence); under_calib (n < nMin) ⇒ q̂ null, NEVER a clamped max. predictor_id is inherited from the
 *  fixture's cell-A key (episode-agnostic). Class A only (decision 108). */
export function buildRegistryEntries(rowsA, opts = {}) {
  const scale = BigInt(opts.scale ?? 1n);
  const predictorBase = opts.predictorBase ?? "ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/UNSPECIFIED/A";
  if (scale <= 0n) throw new Error("record-u4b-calib: scale must be a positive bigint");
  const byStrate = new Map();
  for (const r of rowsA) { const k = Number(r.strate); if (!byStrate.has(k)) byStrate.set(k, []); byStrate.get(k).push(BigInt(r.score)); }
  const entries = [];
  for (const k of [...byStrate.keys()].sort((a, b) => a - b)) {
    const sorted = byStrate.get(k).slice().sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const scores = sorted.map((s) => {
      if (s % scale !== 0n) throw new Error(`record-u4b-calib: stratum ${k} score ${s} not divisible by scale ${scale} — an inexact scale would corrupt the digest (fail-closed, C-9)`);
      const v = s / scale;
      if (v > CAP) throw new Error(`record-u4b-calib: stratum ${k} scaled score ${v} exceeds 2^53 — choose an explicit larger scale, never silently lose precision (fail-closed, C-9)`);
      return Number(v);
    });
    const n = scores.length;
    const p = n === 0 ? null : Math.ceil((n + 1) * (1 - ALPHA));
    const sq = splitQuantile(scores, ALPHA, NMIN); // L1 (the served function); { qhat } | { reason: "under_calib" }
    const underCalib = "reason" in sq;
    let qhat = null;
    if (!underCalib) {
      const hand = scores[p - 1]; // scores are sorted ascending ⇒ p-th smallest
      if (hand !== sq.qhat) throw new Error(`record-u4b-calib: stratum ${k} q̂ hand ${hand} != splitQuantile L1 ${sq.qhat} — anti-circularity FAILED (§0: one quantile implementation, L1)`);
      qhat = sq.qhat;
    }
    entries.push({
      strate: k, predictor_id: `${predictorBase}/s${k}`,
      task_class: "liquidation-eligible-coverage", alpha: ALPHA, n_min: NMIN, n, p, qhat,
      scale: scale.toString(), calib_digest: calibDigest(scores), under_calib: underCalib, scores,
    });
  }
  return entries;
}

function main() {
  const arg = (kk) => { const i = process.argv.indexOf(kk); return i >= 0 ? process.argv[i + 1] : undefined; };
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const scoresPath = arg("--scores") ?? join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "u4b", "U4b-scores-e2.jsonl");
  const scale = BigInt(arg("--scale") ?? "1");
  const lines = readFileSync(scoresPath, "utf8").split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  const meta = lines.find((l) => l.kind === "meta");
  if (meta === undefined) throw new Error("record-u4b-calib: scores fixture has no meta line");
  const rowsA = lines.filter((r) => r.kind === "score_a");
  const entries = buildRegistryEntries(rowsA, { scale, predictorBase: meta.cell_a.predictor_id });
  const report = entries.map((e) => ({ strate: e.strate, predictor_id: e.predictor_id, n: e.n, p: e.p, qhat: e.qhat, scale: e.scale, calib_digest: e.calib_digest, under_calib: e.under_calib }));
  process.stdout.write(JSON.stringify({ class: "A (decision 108: Class B is a formed item, not served)", n_min: NMIN, alpha: ALPHA, strata: report }, null, 2) + "\n");
  const served = entries.filter((e) => !e.under_calib);
  process.stdout.write(`\nregistry: ${served.length}/${entries.length} strata committable (n ≥ ${NMIN}); the rest abstain under_calib. The orchestrator pins these in calibration.ts in -2 from the FRESH episode (R-20).\n`);
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
