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
// `run_windows_above_q99` with BARE DATES. Two negative modes distinguished (C-13/C-14).
// Scratchpad discipline: the agent does NOT commit (R-20); the orchestrator commits the produced artifacts.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
function q(arr, p) { const s = [...arr].sort((a, b) => a - b), n = s.length, rank = Math.ceil((n + 1) * p); return rank > n ? Infinity : s[rank - 1]; }
const support = (arr, qq) => arr.filter((s) => s >= qq).length;

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
  const n = scores.length;
  const qHat = q(scores, 1 - ALPHA), q99 = q(scores, ALERT_P);
  const sq = splitQuantile(scores, ALPHA, N_MIN);     // cross-check q̂ against the production L1 (anti-circularity)
  const qHatSplit = "qhat" in sq ? sq.qhat : null;
  const zeroWidth = !(qHat > 0);
  const crossOk = qHat === qHatSplit;
  // Anti-circularity HARD invariant (NOT a §5.1 condition): the hand-rolled q̂ must equal the production L1.
  if (!crossOk) throw new Error(`record-usde-calib: q_hat hand-rolled (${qHat}) != splitQuantile L1 (${qHatSplit}) — anti-circularity FAILED.`);

  // Retrospective — factual, bare dates (C-12). §5.1.5 (tightened by the orchestrator in the PLAN): the run
  // crosses iff >= 1 NAMED run window has v > q99_calm. This is a PRE-REGISTERED committability condition,
  // NOT a diagnostic — §5.1 requires ALL conditions to hold, so it must gate `committable` (C-14).
  const runAboveQ99 = run.map((x) => ({ day: x.day, v_t_per_hr: x.v, above_q99_calm: Number.isFinite(q99) && x.v > q99 }));
  const enoughSupport = n >= N_MIN;
  const enoughActivity = rho >= RHO_MIN;
  const retroPositive = runAboveQ99.some((w) => w.above_q99_calm);

  // The two negative modes stay DISTINCT and BOTH reachable (C-13/C-14): (a) support/activity/degeneracy;
  // (b) valid support+activity+width BUT the run does not cross (§5.1.5 negative).
  function closureOf(support, activity, zw, retro) {
    if (support && activity && !zw && retro) return "COMMITTABLE";
    if (!support || !activity || zw) return "under_calib:insufficient-support-or-degenerate";
    return "under_calib:valid-but-retrospective-negative";
  }
  // Self-test (C-14): branch (b) IS reachable — support/activity/width OK, run does NOT cross ⇒ (b), never (a).
  if (closureOf(true, true, false, false) !== "under_calib:valid-but-retrospective-negative") {
    throw new Error("record-usde-calib: §5.1.5 vacuous — closure branch (b) 'valid-but-retrospective-negative' unreachable (C-14).");
  }
  if (closureOf(true, true, false, true) !== "COMMITTABLE") {
    throw new Error("record-usde-calib: COMMITTABLE unreachable with all conditions true (C-14).");
  }
  const closure = closureOf(enoughSupport, enoughActivity, zeroWidth, retroPositive);
  const committable = closure === "COMMITTABLE";
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
    q99_alert: q99, q99_support: Number.isFinite(q99) ? support(scores, q99) : 0,
    sensitivity_without_stress_exclusion: { pairs: scoresNoEx.length, q_hat: q(scoresNoEx, 1 - ALPHA), q99: q(scoresNoEx, ALERT_P) },
    zero_width_region: zeroWidth, retrospective_positive: retroPositive, committable, closure, calib_digest: digest,
    run_windows_above_q99: runAboveQ99,
  };
  console.log(JSON.stringify(report, null, 2));
  if (committable) {
    writeFileSync(OUT_SCORES, JSON.stringify(scores));
    console.log(`\nCOMMITTABLE: n=${n}, rho=${rho.toFixed(4)}, q_hat=${qHat}, q99=${q99}, calib_digest=${digest}`);
    console.log(`(pin this digest in apps/harness/src/calibration.ts USDE_STABLE_RUN_CALIB_DIGEST_PINNED; the orchestrator commits — R-20.)`);
  } else {
    console.log(`\nNON-COMMITTABLE (honest ${closure}). No fabricated region; the class stays under_calib.`);
  }
}
main();
