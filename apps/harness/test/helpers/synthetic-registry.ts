/**
 * Seeded synthetic kata registry of the shape of wave1.json (lot CM-4a-i; plan r3 section 5.3 point 8, BLQ-DEP-6), no market
 * data: 32 classes, 8 katas, statuses region, silence (two reasons), vetoed, under_calib (n below n0, one side without thresholds);
 * one threshold pair per side (b1's, CM-4b C-8). Exact counts: k*, rank = n - k*, U, UTest, qhat, k_obs (A-2 2.2.3), TEST veto (2.2.5).
 */
import { createHash } from "node:crypto";
import { sha256Canonical, type ClassEntry } from "@monark/contracts";
import { binomCdfLeq, missUpperBound, parseAlpha, riskControlMaxExceedances, zeroErrorFloor } from "@monark/hikae";

const DELTA = "0.05";
const DIR_KATAS = ["trend-ema-v1", "tsmom-v1", "meanrev-z-v1", "takerflow-v1", "vote4-v1"];
const SCALE_KATAS = ["ewma-vol-hw-v1", "realized-vol-hw-v1", "parkinson-hw-v1"];
/** One plan per calibrated cell, in turn: the status the cell is built to reach. */
const PLANS = ["region", "silence-misses", "silence-runs", "vetoed", "region", "silence-misses", "under"] as const;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A-2 section 2.2 point 5: P(Bin(nTest, alpha) >= kTest) <= 0.05, as P(Bin(nTest, 1 - alpha) <= nTest - kTest) <= 0.05. */
export function testVetoFires(nTest: number, kTest: number, alpha: string): boolean {
  const a = parseAlpha(alpha);
  return binomCdfLeq(nTest, nTest - kTest, { num: a.den - a.num, den: a.den }, { num: 1n, den: 20n });
}

export function syntheticRegistry(seed = 37): { readonly registry: { rows: Record<string, unknown>[] }; readonly bytes: Uint8Array; readonly sha256: string } {
  const rnd = mulberry32(seed);
  const between = (lo: number, hi: number): number => lo + Math.floor(rnd() * (hi - lo + 1));
  const digest = (tag: string): string => createHash("sha256").update(`${String(seed)}:${tag}`).digest("hex");
  const rows: Record<string, unknown>[] = [];
  let p = 0;
  ["btc", "eth", "bnb", "sol"].forEach((sym, si) => ["dir", "range", "mae-down", "mae-up"].forEach((fam, fi) => ["1h", "4h"].forEach((h, hi) => {
    const dir = fam === "dir";
    const taskClass = `${sym}-${fam}-${h}`;
    const kataId = dir ? (DIR_KATAS[(si * 2 + hi) % 5] as string) : (SCALE_KATAS[(si + fi + hi) % 3] as string);
    const symbol = `${sym.toUpperCase()}USDT`;
    const alpha = dir ? "0.45" : "0.01";
    const n0 = zeroErrorFloor(alpha, DELTA);
    const buckets = dir ? ["up-b1", "up-b2", "up-b3", "down-b1", "down-b2", "down-b3"] : ["b0"];
    const factors = dir ? null : Array.from({ length: h === "1h" ? 168 : 42 }, () => 0.5 + rnd());
    for (const bucket of buckets) {
      const side = dir ? (bucket.split("-")[0] as string) : null;
      const noThresholds = taskClass === "eth-dir-4h" && side === "down";
      const drawn = PLANS[p++ % PLANS.length];
      const plan = noThresholds ? "empty" : !dir && drawn === "silence-misses" ? "silence-runs" : drawn;
      const key = `kata:${kataId}@binance/${symbol}/${h}/${bucket}`;
      const n = plan === "empty" ? 0 : plan === "under" ? between(1, n0 - 1) : between(n0 + 20, dir ? 400 : 1500);
      const calibrated = plan !== "empty" && plan !== "under";
      const kStar = calibrated ? riskControlMaxExceedances(n, alpha, DELTA) : null;
      const misses = kStar === null ? null : plan === "silence-misses" ? kStar + between(1, 30) : between(0, kStar);
      const calibStatus = calibrated ? (plan === "silence-misses" || plan === "silence-runs" ? "silence" : "region") : "under_calib";
      const qhat = misses === null ? null : dir ? (misses > (kStar ?? 0) ? 1 : 0) : 1.5 + rnd() * 3;
      const nTest = plan === "empty" ? 0 : between(n0, dir ? 400 : 1500);
      const kTest = plan === "empty" || (plan === "under" && !dir) ? null : plan === "vetoed" ? Math.min(nTest, Math.ceil(nTest * Number(alpha) * 1.5) + 8) : Math.floor(nTest * Number(alpha) * 0.9);
      const vetoed = calibStatus === "region" && nTest >= 1 && kTest !== null && testVetoFires(nTest, kTest, alpha);
      const kObs = misses === null ? null : dir && qhat === 1 ? 0 : misses;
      const check1 = !calibrated ? "n/a" : kObs === 0 ? "empty" : "pass";
      const reason = plan === "empty" ? "empty bucket (no thresholds on this side)" : plan === "under" ? `n ${String(n)} below n0 ${String(n0)}`
        : plan === "silence-misses" ? `misses ${String(misses)} above k* ${String(kStar)}` : plan === "silence-runs" ? "dependence check rejects" : "";
      const tag = `${key}:${String(n)}`;
      rows.push({
        taskClass, key, kataId, W: dir ? 200 : 101, venue: "binance", symbol, horizon: h, side, bucket,
        thresholds: dir && !noThresholds ? ((drawn: Record<string, string>) => (bucket.endsWith("-b1") ? drawn : rows.at(-1)?.thresholds))({ t1: String(0.1 + rnd() * 0.2), t2: String(0.4 + rnd() * 0.3) }) : null,
        hourOfWeekFactors: factors, factorTableSha256: factors === null ? null : sha256Canonical(factors),
        alpha, testDelta: DELTA, calibAttempt: 1, auxSeq: dir ? "label" : "score", order: "time",
        calibSupport: dir ? null : { min: 0.001 + rnd() * 0.002, max: 0.02 + rnd() * 0.01 }, seriesSha256: digest(`${symbol}:series`), epoch: 1,
        drops: { calib: between(0, 2), test: 0 },
        calib: {
          n, scoresSha256: n === 0 ? sha256Canonical([]) : digest(`${tag}:scores`), auxSha256: n === 0 ? sha256Canonical([]) : digest(`${tag}:second`),
          qhat, rank: kStar === null ? null : n - kStar, kStar, kObs, misses,
          U: kStar === null ? null : missUpperBound(n, kStar, DELTA), check1, check2: !calibrated ? "n/a" : plan === "silence-runs" ? "reject" : "pass", status: calibStatus, reason,
        },
        test: {
          nTest, kTest, UTest: kTest === null || nTest === 0 ? null : kTest === nTest ? "1" : missUpperBound(nTest, kTest, DELTA), vetoed,
          months: kTest === null ? {} : { "2026-04": { n: nTest - 1, k: Math.max(0, kTest - 1) }, "2026-05": { n: 1, k: Math.min(1, kTest) } },
        },
        live1: null, status: vetoed ? "vetoed" : calibStatus, trialId: `${taskClass}|${kataId}|binance|${symbol}|${h}|CALIB`,
      });
    }
  })));
  const registry = { plan: "synthetic registry (seeded)", engine: "synthetic", trialRegistryHead: { length: 32, hash: digest("trials") }, rows };
  const bytes = new TextEncoder().encode(`${JSON.stringify(registry, null, 2)}\n`);
  return { registry, bytes, sha256: createHash("sha256").update(bytes).digest("hex") };
}

/** A class entry of the shape of spec section 9 for the tests' tables (the 32 kata entries and their test: block B2). */
export function syntheticClassEntry(task_class: string): ClassEntry {
  const dir = task_class.includes("-dir-");
  return { task_class, region_kind: dir ? "set" : "interval", region_rule: dir ? "sign-set" : "scaled-band", qhat_unit: dir ? "score" : "scale", statement: "per-calibration",
    method: "risk-control", alpha: dir ? "0.45" : "0.01", test_delta: DELTA, n_min: dir ? 6 : 299, h_ms: task_class.endsWith("-1h") ? 3_600_000 : 14_400_000, grid: true,
    cell_key_rule: "kata-bucket", cell_key_base: null, strata_cuts: null, label_schema: dir ? "up|down" : null, text: `class text of ${task_class}` };
}
