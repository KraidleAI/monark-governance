#!/usr/bin/env node
// scripts/record-usde-calib.mjs — F2-B committed-calibration recorder (Narabi ADR-M008 D7bis + Amendement
// 2026-09-17 bis; PLAN-m008-f2b-usde §3/§5/§8). REPRODUCIBLE chain, series -> scores -> digest:
//   fixtures/usde-calib-series.json  →  AttestedFlow per window  →  fromAttestedFlow (the DEPLOYED adapter,
//   1e12 fixed-point scale — NOT the pull's 1e6)  →  consecutive-calm pair residuals s_t = |v_t − v̂_t|
//   under the PRE-REGISTERED criterion  →  calibDigest (ADR-M001 C5, float64_be sorted).
//
// A1 (Amendement bis): the committed scores are the ADAPTER's, so re-running this recorder reproduces
// apps/harness/src/calibration.ts USDE_STABLE_RUN_CALIB + its pinned digest byte-for-byte. The recorder(1e6
// pull)↔adapter(1e12) score gap is a truncation artefact, DECLARED in fixtures/PROVENANCE-usde.md.
//
// SELF-CHECK: calibDigest is the C5 contract function (float64_be sorted), NOT a sha256(JSON.stringify)
// look-alike — asserted on the [0,1] oracle before anything else (the 2026-09-17 defect this replaces).
//
// C-12 (forbidden surface purged): none of the banned counterfactual / timing-vs-price / attestation-verb
// phrases (see vocab-banned.json scope narabi_docs); the retrospective is strictly factual —
// `run_windows_above_q99` with BARE DATES. Three negative modes distinguished (C-13/C-14 + ADR-M015 D1(a) undecidable).
// Scratchpad discipline: the agent does NOT commit (R-20); the orchestrator commits the produced artifacts.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { calibDigest } from "@monark/contracts";
import { splitQuantile } from "@monark/hikae";
import { fromAttestedFlow, isNarabiError, narabiPredictorId } from "@monark/monark";

const SERIES = new URL("../fixtures/usde-calib-series.json", import.meta.url);
const OUT_SCORES = new URL("../fixtures/usde-calib-scores.json", import.meta.url);

const ALPHA = 0.1, ALERT_P = 0.99, N_MIN = 50, RHO_MIN = 0.3;
const S_FLOOR = 10n ** 25n;      // 10,000,000 USDe (bootstrap floor, wei)
const ACTIVE_FLOOR = 10n ** 21n; // 1,000 USDe (activity floor, wei)
const THETA_STRESS = 0.01;       // 1% of opening stock in 24h -> stress, excluded (symmetric, absolute, non-circular)
const TOKEN = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"; // USDe (Ethena), mainnet
const SUBJECT = "erc20:0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"; // A4 canonical token
const CHAIN = "eip155:1"; // A4 CAIP-2
const ISSUER = "0xe3490297a08d6fc8da46edb7b6142e4f461b62d3"; // EthenaMinting V2 (A4)
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// --- SELF-CHECK: prove calibDigest is the C5 contract function (float64_be sorted), not JSON.stringify ---
const CALIB_DIGEST_ORACLE = "1e47beee7f4175a863385dc2f9c8278138e35f0caa43a5467a523519f1e91081";
if (calibDigest([0, 1]) !== CALIB_DIGEST_ORACLE) {
  throw new Error(`record-usde-calib: calibDigest([0,1]) self-check FAILED (got ${calibDigest([0, 1])}) — wrong digest function.`);
}

// A3 canonical payload -> utterance.hash (address/fromBlock/toBlock/topics). Velocity-independent.
function utteranceHash(w) {
  return createHash("sha256")
    .update(JSON.stringify({ address: TOKEN.toLowerCase(), fromBlock: w.fromBlock, toBlock: w.toBlock, topics: [TRANSFER_TOPIC] }), "utf8")
    .digest("hex");
}
const midnight = (day) => Math.floor(new Date(day + "T00:00:00Z").getTime() / 1000);

/** Build the AttestedFlow the deployed adapter consumes; velocity = fromAttestedFlow (1e12). */
function flowOf(w) {
  return {
    schema_version: "1.0.0", subject: SUBJECT,
    attestor: [{ identity: "ethena-por", key: "deadbeef" }],
    source: { chain: CHAIN, issuer: ISSUER }, window: "24h",
    flow: { burns: w.burns, mints: w.mints, supply: w.supplyClose, from_block: w.fromBlock, to_block: w.toBlock },
    residual: ["ap_capacity_unknown"], transport: "rpc+eth_getLogs",
    utterance: { hash: utteranceHash(w) }, observed_at: { clock: "utc-midnight", instant: midnight(w.day) },
    octets_recalcules: true, verifier_revision: "narabi-adapter@f2b",
  };
}
function adapterVelocity(w) {
  const out = fromAttestedFlow(flowOf(w));
  if (isNarabiError(out)) throw new Error(`adapter refused ${w.day}: ${out.reason} ${out.message}`);
  return out.provenance.velocity_per_hour;
}

const dailyFrac = (w) => { const b = BigInt(w.burns), S = BigInt(w.supplyOpen); return S > 0n ? Number((b * 1000000n) / S) / 1e6 : Infinity; };
// Empirical p-quantile at rank ceil((n+1)*p). FAIL-CLOSED (ADR-M015 D1(a)): when the rank exceeds n the
// quantile is UNDECIDABLE -> return null, NEVER Infinity. Infinity was silently masked (Number.isFinite) into
// a "valid-but-retrospective-negative" verdict for every 50 <= n < 99 population, which is indecidable.
function q(arr, p) { const s = [...arr].sort((a, b) => a - b), n = s.length, rank = Math.ceil((n + 1) * p); return rank > n ? null : s[rank - 1]; }
const support = (arr, qq) => arr.filter((s) => s >= qq).length;
// Smallest n for which the empirical p-quantile rank ceil((n+1)*p) is attainable (<= n); 99 at ALERT_P=0.99.
const minPairsForQuantile = (p) => Math.ceil(p / (1 - p));

// Closure decision (§5.1, pre-registered). Priority: support/degeneracy first, THEN q99 decidability (the
// ADR-M015 D1(a) THIRD branch: an undecidable retrospective is not a negative one), THEN the run crossing.
function closureOf(hasSupport, hasActivity, zeroWidth, q99Decidable, retro) {
  if (hasSupport && hasActivity && !zeroWidth && q99Decidable && retro) return "COMMITTABLE";
  if (!hasSupport || !hasActivity || zeroWidth) return "under_calib:insufficient-support-or-degenerate";
  if (!q99Decidable) return "under_calib:retrospective-undecidable";
  return "under_calib:valid-but-retrospective-negative";
}
// Self-tests (C-14 + ADR-M015 D1(a)) — every closure branch is reachable, on EVERY invocation (never vacuous).
if (closureOf(true, true, false, true, false) !== "under_calib:valid-but-retrospective-negative")
  throw new Error("record-usde-calib: 'valid-but-retrospective-negative' unreachable (C-14).");
if (closureOf(true, true, false, false, false) !== "under_calib:retrospective-undecidable")
  throw new Error("record-usde-calib: 'retrospective-undecidable' unreachable (ADR-M015 D1(a)).");
if (closureOf(true, true, false, true, true) !== "COMMITTABLE")
  throw new Error("record-usde-calib: COMMITTABLE unreachable with all conditions true (C-14).");

/**
 * PURE §5.1 committability decision (no I/O, no network), extracted for the ADR-M015 D1(a) oracle
 * (test/record-usde-calib.test.ts). Inputs: calm-pair residual `scores`, run-window velocities, activity
 * ratio `rho`. `q99_calm` is the calm-population q99 alert (the report field `q99_alert` = same value),
 * null when the ALERT_P quantile rank exceeds n (n < 99 at 0.99) -> closure `retrospective-undecidable`.
 */
export function evaluateClosure({ scores, rho, runVelocities = [] }, cfg = {}) {
  const alpha = cfg.alpha ?? ALPHA, alertP = cfg.alertP ?? ALERT_P, nMin = cfg.nMin ?? N_MIN, rhoMin = cfg.rhoMin ?? RHO_MIN;
  const n = scores.length;
  const q_hat = q(scores, 1 - alpha);
  const q99_calm = q(scores, alertP);               // null when ceil((n+1)*alertP) > n (fail-closed, never Infinity)
  const q99_decidable = q99_calm !== null;
  const zero_width = !(q_hat > 0);
  const enough_support = n >= nMin;
  const enough_activity = rho >= rhoMin;
  const retrospective_positive = q99_decidable && runVelocities.some((v) => v > q99_calm);
  const closure = closureOf(enough_support, enough_activity, zero_width, q99_decidable, retrospective_positive);
  const reason = q99_decidable ? null : `q99 needs n >= ${minPairsForQuantile(alertP)} calm pairs; got ${n}`;
  return { n, q_hat, q99_calm, q99_decidable, zero_width, enough_support, enough_activity, retrospective_positive, closure, committable: closure === "COMMITTABLE", reason };
}

/** Consecutive-calm pairs: v̂_t = v_{t-24h}, s_t = |v_t − v̂_t| (adapter velocities). */
function pairsFrom(days) {
  const dayMs = 86400000, scores = [];
  for (let i = 1; i < days.length; i++) {
    const prev = days[i - 1], cur = days[i];
    if (new Date(cur.day + "T00:00:00Z") - new Date(prev.day + "T00:00:00Z") !== dayMs) continue;
    if (prev.v == null || cur.v == null) continue;
    scores.push(Math.abs(cur.v - prev.v));
  }
  return scores;
}

function main() {
  const fx = JSON.parse(readFileSync(SERIES, "utf8"));
  const ok = fx.windows.filter((x) => !x.error && x.c1_ok);
  const run = ok.filter((x) => x.regime === "run");
  const calmFloored = ok.filter((x) => x.regime === "calm" && BigInt(x.supplyOpen) >= S_FLOOR);
  const belowFloor = ok.filter((x) => x.regime === "calm").length - calmFloored.length;
  const stress = calmFloored.filter((x) => dailyFrac(x) >= THETA_STRESS);
  const calmKept = calmFloored.filter((x) => dailyFrac(x) < THETA_STRESS);
  const active = calmKept.filter((x) => BigInt(x.burns) >= ACTIVE_FLOOR).length;
  const rho = calmKept.length ? active / calmKept.length : 0;

  // adapter velocities (1e12) on retained calm + all run windows
  for (const w of calmFloored) w.v = adapterVelocity(w);
  for (const w of run) w.v = adapterVelocity(w);

  const scores = pairsFrom(calmKept);                 // committable set (WITH stress exclusion)
  const scoresNoEx = pairsFrom(calmFloored);          // sensitivity (WITHOUT exclusion) — diagnostic only
  const sq = splitQuantile(scores, ALPHA, N_MIN);     // cross-check q̂ against the production L1 (anti-circularity)
  const qHatSplit = "qhat" in sq ? sq.qhat : null;

  // §5.1 committability via the PURE decision (extracted; test/record-usde-calib.test.ts). ADR-M015 D1(a):
  // for n < 99 the ALERT_P quantile is UNDECIDABLE (q99_calm null, closure retrospective-undecidable) instead
  // of "valid-but-retrospective-negative". The n >= 99 path (USDe n=613) stays byte-identical.
  const dec = evaluateClosure({ scores, rho, runVelocities: run.map((x) => x.v) });
  const { n, q_hat: qHat, q99_calm, q99_decidable, zero_width: zeroWidth, retrospective_positive: retroPositive, closure, committable, reason } = dec;

  // Anti-circularity HARD invariant (NOT a §5.1 condition): the hand-rolled q̂ must equal the production L1.
  const crossOk = qHat === qHatSplit;
  if (!crossOk) throw new Error(`record-usde-calib: q_hat hand-rolled (${qHat}) != splitQuantile L1 (${qHatSplit}) — anti-circularity FAILED.`);

  // Retrospective — factual, bare dates (C-12). §5.1.5 (tightened by the orchestrator in the PLAN): the run
  // crosses iff >= 1 NAMED run window has v > q99_calm, and ONLY when q99 is decidable. Pre-registered, gates
  // `committable` (C-14). closureOf + its C-14/D1(a) reachability self-tests are now at module scope.
  const runAboveQ99 = run.map((x) => ({ day: x.day, v_t_per_hr: x.v, above_q99_calm: q99_decidable && x.v > q99_calm }));
  const digest = committable ? calibDigest(scores) : null;

  const report = {
    instrument: "USDe (Ethena)", token: TOKEN, chain: CHAIN,
    wrapping_family: "synthetic-dollar-whitelisted-redeem",
    predictor_id_key: narabiPredictorId(CHAIN, SUBJECT),
    scale_note: "velocities via fromAttestedFlow (adapter 1e12); the pull's v_t_per_hr is 1e6 (declared in PROVENANCE-usde.md)",
    calm_below_floor_excluded: belowFloor, calm_after_floor: calmFloored.length,
    stress_excluded_days: stress.map((x) => ({ day: x.day, daily_frac: +dailyFrac(x).toFixed(5) })),
    calm_kept: calmKept.length, active_windows: active, rho: +rho.toFixed(4), rho_min: RHO_MIN,
    pairs_committable: n, n_min: N_MIN, alpha: ALPHA,
    q_hat_1_minus_alpha: qHat, q_hat_split_crosscheck: qHatSplit, q_hat_crosscheck_ok: crossOk,
    q_hat_support: Number.isFinite(qHat) ? support(scores, qHat) : 0,
    q99_alert: q99_calm, q99_support: q99_decidable ? support(scores, q99_calm) : 0,
    sensitivity_without_stress_exclusion: { pairs: scoresNoEx.length, q_hat: q(scoresNoEx, 1 - ALPHA), q99: q(scoresNoEx, ALERT_P) },
    zero_width_region: zeroWidth, retrospective_positive: retroPositive, committable, closure, reason, calib_digest: digest,
    run_windows_above_q99: runAboveQ99,
  };
  console.log(JSON.stringify(report, null, 2));
  if (committable) {
    writeFileSync(OUT_SCORES, JSON.stringify(scores));
    console.log(`\nCOMMITTABLE: n=${n}, rho=${rho.toFixed(4)}, q_hat=${qHat}, q99=${q99_calm}, calib_digest=${digest}`);
    console.log(`(pin this digest in apps/harness/src/calibration.ts USDE_STABLE_RUN_CALIB_DIGEST_PINNED; the orchestrator commits — R-20.)`);
  } else {
    console.log(`\nNON-COMMITTABLE (honest ${closure}). No fabricated region; the class stays under_calib.`);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
