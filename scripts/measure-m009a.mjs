// scripts/measure-m009a.mjs — Measure of ADR-M009 item (a): P(B_t < 0) at bFloor = 0 on the REAL
// miscover suite from the Shogen S2 traces (BTC/USD campaign), compared to the 35-47% [abs] claim.
//
// Provenance (G1): worker claude-opus-4-8[1m], effort max, 2026-09-18, mission P0-b (ADR-M015 D1 c/d/e).
// Replayable, READ-ONLY, NO network. Node built-ins only. Cross-checked against the Shogen shogen_s2
// reader (Decimal prec 50); see docs/measure-M009a.md section 7.
//
// Committed rule this replays (NOT modified here):
//   B_t = alpha - (1/t_deg) * sum_{arrived labels} E_i       (ADR-M002 D4, l2-monitor.ts:64)
//   budget_exhausted  <=>  remainingBudget < bFloor          (l3-gate.ts:100/126)
//   committed params (ADR-M002 D6): alpha = 0.10, bFloor = 0, label_delay = 1
//   => B_t < 0  <=>  p_hat (miscover rate over t_deg labels) > alpha
//
// The miscover indicator E_i (one per window) is mapped onto the Shogen S2 attestation (R1):
//   "the attestation misses the window in the tau/sigma sense" = CO-FAILURE = window where >= 2 sources
//   are simultaneously in ecart (outage | staleness(sigma) | out-of-envelope(tau)) -- the K event of the
//   K&L test (r1.py:415 `if win_ecarts >= 2: k_count += 1`).
//   CANONICAL definition (D2): co-failure among PRESENT sources -- pyth EXCLUDED, accepted-absent by the
//   Shogen ADR-0023 ("the flag 2 / phi matrix use only present sources"). Reported variants: D1 (raw r1 K,
//   pyth counted), D3 (>= 2 on the tau/sigma axes only), and ">= 1 tau/sigma cell" (literal tau/sigma read).
//
// Reproduces shogen_s2/r1.py::classify_ecart in float64 (the Shogen harness is Decimal prec 50). Precision
// gap DECLARED. The Shogen reader fail-closes on the 2 torn lines (power cuts, cf. REPAIR-2026-09-16/18);
// here we read TOLERANTLY, logging them. Never modifies the trace.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const CTRL = process.env.S2_CONTROL ?? "F:/shogen-campagne/campagne/control.jsonl";
const JOUR = process.env.S2_JOURNAL ?? "F:/shogen-campagne/campagne/journal.jsonl";

const ALPHA = 0.10;      // ADR-M002 D6
const BFLOOR = 0;        // ADR-M002 D6 (bFloor = 0 -- item (a) measured)
const N_MIN = 4;         // r1.py N_MIN_HORSENV (leave-one-out envelope)
const W = 60;            // S2 window = 60 s (run_params.w)
const HORIZONS = [30, 90, 365, 1440]; // t_deg in LABELS (comparable to [abs]); 1440 = 1 day @60s
const BOOT = 2000;       // bootstrap resamples
const BLOCK = 60;        // block length (block bootstrap, ~1 h @60s) for autocorrelation
const SEED = 424242;     // fixed seed (replayable)

// ---- Deterministic seeded PRNG (mulberry32) -- no dependency --------------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- sha256 of a file (provenance) ---------------------------------------
function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

// ---- Tolerant JSONL read (skips non-parseable lines, logs them) ----------
function readJsonlTolerant(path) {
  const buf = readFileSync(path, "utf8");
  const lines = buf.split("\n");
  const objs = [];
  const skipped = [];
  for (let i = 0; i < lines.length; i++) {
    const s = lines[i].trim();
    if (s.length === 0) continue;
    try { objs.push(JSON.parse(s)); } catch { skipped.push(i + 1); }
  }
  return { objs, skipped };
}

// ---- median (average of the two middle values if even, like statistics.median)
function median(sorted) {
  const m = sorted.length;
  if (m === 0) return NaN;
  const mid = m >> 1;
  return m % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ---- Cell classification (window x source), mirror of r1.classify_ecart --
// Returns 'outage' | 'staleness' | 'out_env' | 'no_ecart' | 'non_eval'
function classifyEcart(reading, othersPrices, nResponding, winEnd, klass, sigmaByClass, tauByClass) {
  // (iii) outage -- highest precedence
  if (!reading || reading.status !== "ok" || reading.price === null || reading.price === undefined) {
    return "outage";
  }
  // (ii) staleness on the carried source_ts (sigma per class); sigma=null or source_ts=null => non-eval => (i)
  const sigma = sigmaByClass[klass];
  const srcTs = reading.source_ts;
  if (sigma !== null && sigma !== undefined && srcTs !== null && srcTs !== undefined) {
    if (winEnd - Number(srcTs) > Number(sigma)) return "staleness";
  }
  // (i) out-of-envelope (relative tau per class) -- needs N >= n_min responders
  if (nResponding >= N_MIN) {
    const sorted = othersPrices.slice().sort((x, y) => x - y);
    const mLoo = median(sorted);
    if (mLoo <= 0) return "non_eval";
    const tau = tauByClass[klass];
    if (tau === null || tau === undefined) return "non_eval";
    const price = Number(reading.price);
    if (Math.abs(price - mLoo) / mLoo > Number(tau)) return "out_env";
    return "no_ecart";
  }
  return "non_eval";
}

const ECARTS = new Set(["outage", "staleness", "out_env"]);
const TAUSIG = new Set(["staleness", "out_env"]);

// ---- Exact binomial tail P(K >= kObs | Bin(n,p)) -- stable recurrence
//      (mirror of r1.binomial_tail_ge), no overflow ----------------------
function binomTailGe(kObs, n, p) {
  if (kObs <= 0) return 1;
  if (kObs > n) return 0;
  if (p <= 0) return kObs <= 0 ? 1 : 0;
  if (p >= 1) return kObs <= n ? 1 : 0;
  const q = 1 - p;
  // anchor pmf(kObs) via logs (avoids C(n,kObs) overflow) then recurrence
  let logPmf = 0;
  for (let x = 1; x <= kObs; x++) logPmf += Math.log(n - x + 1) - Math.log(x);
  logPmf += kObs * Math.log(p) + (n - kObs) * Math.log(q);
  let term = Math.exp(logPmf);
  let total = term;
  for (let x = kObs; x < n; x++) {
    term = (term * (n - x)) / (x + 1) * p / q;
    total += term;
  }
  return total > 1 ? 1 : total;
}

// P(B_{t_deg=H} < 0) analytic = P(sum E > alpha*H) = P(Bin(H,p) >= floor(alpha*H)+1)
function pBudgetNeg(H, p) {
  const thr = Math.floor(ALPHA * H) + 1;
  return binomTailGe(thr, H, p);
}

// Monte-Carlo 95% half-width of a bootstrap fraction over BOOT resamples (the "intervals"
// the bootstrap provides): SE = sqrt(p(1-p)/BOOT), CI95 = p +/- 1.96*SE.
const mcCi95 = (p) => 1.96 * Math.sqrt((p * (1 - p)) / BOOT);

// ---- B_t replayed (committed rule, label_delay=1): the single real path --
// budgetAt(errorTimeline, t, labelDelay=1, alpha): arrived = {i : i+1 <= t and i < t} = {0..t-1}
// => B(t_deg) = alpha - mean(E[0..t_deg-1]). We scan t_deg=1..N and record the minimum.
function realTrajectoryMin(seq) {
  let cum = 0, min = Infinity, argmin = -1, firstNeg = -1;
  for (let t = 1; t <= seq.length; t++) {
    cum += seq[t - 1];
    const B = ALPHA - cum / t;
    if (B < min) { min = B; argmin = t; }
    if (B < BFLOOR && firstNeg < 0) firstNeg = t;
  }
  return { min, argmin, firstNeg, final: ALPHA - cum / seq.length };
}

// ---- P(B_H<0) empirical: sliding window over the real suite --------------
function slidingPneg(seq, H) {
  if (seq.length < H) return null;
  const thr = ALPHA * H;
  let sum = 0;
  for (let i = 0; i < H; i++) sum += seq[i];
  let neg = sum > thr ? 1 : 0, count = 1;
  for (let i = H; i < seq.length; i++) { sum += seq[i] - seq[i - H]; count++; if (sum > thr) neg++; }
  return neg / count;
}

// ---- P(B_H<0) disjoint blocks -------------------------------------------
function disjointPneg(seq, H) {
  if (seq.length < H) return null;
  const thr = ALPHA * H;
  let neg = 0, count = 0;
  for (let s = 0; s + H <= seq.length; s += H) {
    let sum = 0; for (let i = s; i < s + H; i++) sum += seq[i];
    if (sum > thr) neg++; count++;
  }
  return count ? neg / count : null;
}

// ---- Seeded i.i.d. bootstrap: resample H labels with replacement ---------
function iidBootstrapPneg(seq, H, rng) {
  const thr = ALPHA * H, n = seq.length;
  let neg = 0;
  for (let b = 0; b < BOOT; b++) {
    let sum = 0;
    for (let i = 0; i < H; i++) sum += seq[(rng() * n) | 0];
    if (sum > thr) neg++;
  }
  return neg / BOOT;
}

// ---- Seeded block bootstrap: preserves autocorrelation (outage bursts) ---
function blockBootstrapPneg(seq, H, rng) {
  const thr = ALPHA * H, n = seq.length, nBlocks = Math.ceil(H / BLOCK);
  let neg = 0;
  for (let b = 0; b < BOOT; b++) {
    let sum = 0, taken = 0;
    for (let k = 0; k < nBlocks && taken < H; k++) {
      const start = (rng() * n) | 0;
      for (let j = 0; j < BLOCK && taken < H; j++) { sum += seq[(start + j) % n]; taken++; }
    }
    if (sum > thr) neg++;
  }
  return neg / BOOT;
}

// ==========================================================================
function main() {
  const t0 = Date.now();
  // 1. committed run_params (the first; concordance is fail-closed-checked by the Shogen harness)
  const ctrl = readJsonlTolerant(CTRL);
  const runParams = ctrl.objs.find((o) => o.record === "run_params");
  if (!runParams) throw new Error("run_params missing from control.jsonl");
  const pool = runParams.pool;
  const sigmaByClass = {};
  for (const [k, v] of Object.entries(runParams.sigma_classe)) sigmaByClass[k] = v === null ? null : Number(v);
  const tauByClass = {};
  for (const [k, v] of Object.entries(runParams.tau_classe)) tauByClass[k] = v === null ? null : Number(v);
  const classOfFlux = runParams.sigma_class_of_flux;

  // 2. window_close markers (dedup by window_start, last-wins)
  const winStrate = new Map();
  for (const o of ctrl.objs) if (o.record === "window_close") winStrate.set(o.window_start, o.strate);

  // 3. journal readings (tolerant), reading_map last-wins per (window, flux)
  const jour = readJsonlTolerant(JOUR);
  const readingMap = new Map();
  for (const r of jour.objs) readingMap.set(`${r.window_start}|${r.flux_id}`, r);

  // 4/5. classification + miscover suites (chronological order)
  const windows = [...winStrate.keys()].sort((a, b) => a - b);
  const seqD1 = [], seqD2 = [];
  const perSrcEcart = Object.fromEntries(pool.map((f) => [f, 0]));
  let tausigCells = 0, tausigWindows = 0, d3 = 0;
  for (const ws of windows) {
    const winEnd = ws + W;
    const responding = [];
    const respPrice = {};
    for (const f of pool) {
      const rd = readingMap.get(`${ws}|${f}`);
      if (rd && rd.status === "ok" && rd.price !== null && rd.price !== undefined) {
        responding.push(f); respPrice[f] = Number(rd.price);
      }
    }
    const nResp = responding.length;
    const cls = {};
    for (const f of pool) {
      const others = responding.filter((g) => g !== f).map((g) => respPrice[g]);
      cls[f] = classifyEcart(readingMap.get(`${ws}|${f}`), others, nResp, winEnd, classOfFlux[f], sigmaByClass, tauByClass);
    }
    const ecart = pool.filter((f) => ECARTS.has(cls[f]));
    const ecartNoPyth = ecart.filter((f) => f !== "pyth");
    const tsCells = pool.filter((f) => TAUSIG.has(cls[f]));
    for (const f of ecart) perSrcEcart[f]++;
    tausigCells += tsCells.length;
    if (tsCells.length >= 1) tausigWindows++;
    if (tsCells.length >= 2) d3++;
    seqD1.push(ecart.length >= 2 ? 1 : 0);
    seqD2.push(ecartNoPyth.length >= 2 ? 1 : 0);
  }
  const N = windows.length;
  const rate = (s) => s.reduce((a, b) => a + b, 0) / s.length;
  const pD1 = rate(seqD1), pD2 = rate(seqD2);

  // 6. single real B_t trajectory (committed rule)
  const trajD2 = realTrajectoryMin(seqD2);
  const trajD1 = realTrajectoryMin(seqD1);

  // 7/8. P(B_t<0) per horizon: [abs] (alpha), analytic(p_hat), empirical, bootstraps
  const rng = mulberry32(SEED);
  const byHorizon = [];
  for (const H of HORIZONS.concat([N])) {
    const iidD2 = iidBootstrapPneg(seqD2, H, rng);
    const blkD2 = blockBootstrapPneg(seqD2, H, rng);
    const iidD1 = iidBootstrapPneg(seqD1, H, rng);
    const blkD1 = blockBootstrapPneg(seqD1, H, rng);
    byHorizon.push({
      t_deg: H,
      days_at_60s: +(H / 1440).toFixed(3),
      abs_binom_alpha: pBudgetNeg(H, ALPHA),        // [abs] anchor: E ~ Bernoulli(0.10)
      analytic_phat_D2: pBudgetNeg(H, pD2),
      analytic_phat_D1: pBudgetNeg(H, pD1),
      sliding_D2: slidingPneg(seqD2, H),
      disjoint_D2: disjointPneg(seqD2, H),
      // bootstrap fractions WITH their Monte-Carlo 95% half-width (the "intervals", BOOT resamples)
      iid_boot_D2: iidD2, iid_boot_D2_ci95: mcCi95(iidD2),
      block_boot_D2: blkD2, block_boot_D2_ci95: mcCi95(blkD2),
      sliding_D1: slidingPneg(seqD1, H),
      iid_boot_D1: iidD1, iid_boot_D1_ci95: mcCi95(iidD1),
      block_boot_D1: blkD1, block_boot_D1_ci95: mcCi95(blkD1),
    });
  }

  const out = {
    provenance: {
      model: "claude-opus-4-8[1m]", date: "2026-09-18", mission: "P0-b (ADR-M015 D1 c/d/e)",
      control: CTRL, journal: JOUR,
      sha256_control: sha256(CTRL), sha256_journal: sha256(JOUR),
      note_campaign_live: "S2 campaign still collecting -- n may grow between reads; the sha256 pin the measured state",
    },
    committed_rule: { alpha: ALPHA, bFloor: BFLOOR, label_delay: 1, n_min: N_MIN, w_seconds: W,
      formula: "B_t = alpha - (1/t_deg)*sum E_i ; budget_exhausted <=> B_t < bFloor" },
    corruption: {
      control_skipped_lines: ctrl.skipped, journal_skipped_lines: jour.skipped,
      note: "torn lines (NUL bytes, power cuts) -- the Shogen reader fail-closes (non-final); here tolerant read, logged",
    },
    miscover_def: {
      canonical_D2: "co-failure of >=2 PRESENT sources (pyth excluded, ADR-0023) in ecart (outage|sigma|tau)",
      D1_raw_r1_K: ">=2 sources (pyth included) -- raw r1.py:415 K",
      D3_tausig_only: ">=2 cells on the tau/sigma axes only (staleness|out_env)",
      tausig_literal: ">=1 tau/sigma cell (literal 'tau/sigma sense' read)",
    },
    measured: {
      n_windows: N, span_days: +((windows[N - 1] - windows[0]) / 86400).toFixed(3),
      p_hat_D2_canonical: pD2, p_hat_D1_raw: pD1,
      D3_tausig_cofailure_windows: d3, tausig_cells_total: tausigCells, tausig_windows_ge1: tausigWindows,
      per_source_ecart: perSrcEcart,
      real_trajectory_B_D2: trajD2, real_trajectory_B_D1: trajD1,
    },
    P_Bt_neg_by_horizon: byHorizon,
    abs_claim_ADR_M009: { at_30: 0.35, at_365: 0.47, note: "35%->47% [abs] = binomial at the boundary (p_hat=alpha)" },
    elapsed_ms: Date.now() - t0,
  };
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");

  // Human table
  const pct = (x) => (x === null ? "  n/a " : (100 * x).toFixed(x < 0.01 ? 4 : 2).padStart(7) + "%");
  process.stderr.write(`\n=== P(B_t < 0) by horizon (alpha=${ALPHA}, bFloor=0) -- n=${N}, p_hat_D2=${(100 * pD2).toFixed(3)}%, p_hat_D1=${(100 * pD1).toFixed(3)}% ===\n`);
  process.stderr.write("  t_deg  [abs]a    analD2   slidD2   iidbD2   blkbD2   analD1   slidD1   blkbD1\n");
  for (const h of byHorizon) {
    process.stderr.write(`  ${String(h.t_deg).padStart(6)} ${pct(h.abs_binom_alpha)} ${pct(h.analytic_phat_D2)} ${pct(h.sliding_D2)} ${pct(h.iid_boot_D2)} ${pct(h.block_boot_D2)} ${pct(h.analytic_phat_D1)} ${pct(h.sliding_D1)} ${pct(h.block_boot_D1)}\n`);
  }
  const h30 = byHorizon[0];
  process.stderr.write(`  bootstrap CI95 (MC half-width, ${BOOT} resamples), t_deg=30: blkbD2 ${(100 * h30.block_boot_D2).toFixed(2)}% +-${(100 * h30.block_boot_D2_ci95).toFixed(2)}pp, blkbD1 ${(100 * h30.block_boot_D1).toFixed(2)}% +-${(100 * h30.block_boot_D1_ci95).toFixed(2)}pp\n`);
  process.stderr.write(`\n  real B_t path (D2): min=${trajD2.min.toFixed(5)} @t_deg=${trajD2.argmin}, first B<0 @t_deg=${trajD2.firstNeg}, B_final=${trajD2.final.toFixed(5)}\n`);
  process.stderr.write(`  real B_t path (D1): min=${trajD1.min.toFixed(5)} @t_deg=${trajD1.argmin}, first B<0 @t_deg=${trajD1.firstNeg}, B_final=${trajD1.final.toFixed(5)}\n`);
  process.stderr.write(`  tau/sigma strict: D3(>=2 tau/sigma)=${d3} windows, ${tausigCells} tau/sigma cells total (${tausigWindows} windows >=1)\n`);
  process.stderr.write(`  elapsed: ${Date.now() - t0} ms\n`);
}

main();
