// scripts/census/u4b/u4b-hyp.mjs
// ============================================================================================
// U-4b-STATS-1 (Ukemi, ADR-U4b; RUNBOOK ruling R-K) - OFFLINE tools for the pre-registered hypotheses H-3 / H-4 / H-6
// of docs/PLAN-u4b-prereg.md (lines 95-106, FROZEN, never edited here) and the report that feeds the pre-registered
// U-6 condition (prereg line 359; applied mechanically by the orchestrator, decision 137 - this tool NEVER decides).
// PURE over its inputs: no network, no env read, no clock in any output (two runs => identical bytes).
//
// Provenance: worker claude-opus-5-5[1m] (effort max), 2026-09-22, lot U-4b-STATS-1, base lot/etude-suite @ 50f78b0;
// reviewer = orchestrator (R-21); NO commit, NO workflow (R-20). Rulings applied = checkpoint-1 C-1..C-12
// (docs/CHECKPOINT1-lot-u4b-stats-1.md), transmitted by the orchestrator as pre-data rulings.
//
// H-3 (prereg :100; C-1/C-3/C-11). For each served Mondrian stratum k of class A AND for the pooled class-A cell:
//   statistic   K = #{ e2 class-A exceedances s (score_a rows of the sha-pinned e2 fixture) with s <= qhat_fresh }
//   null law    BetaBinomial(n_e2, a = p, b = n + 1 - p), n = fresh size, p = ceil((n+1)(1 - 0.01)) READ from the
//               frozen producer's meta (u4b-scores.mjs) and ASSERTED equal to the exact integer ceiling.
//   p-value     P(K' <= K) (LOWER tail: "coverage too low"), EXACT rational (BigInt), never a float.
//   decision    NON iff p-value <= 5/100 (super-uniform p-value: P_H(p <= t) <= t), else OUI.
//   verdicts    closed set {OUI, NON, UNDER_CALIB (fresh n < 100), NON_TESTABLE_E2 (e2 n < 50)}; precedence
//               UNDER_CALIB > NON_TESTABLE_E2 > test. Ties/atoms at 0 are counted covered (closed s <= qhat):
//               the test stays valid and conservative (K dominates the continuous-case law).
//   Source [lu]: Angelopoulos & Bates, arXiv:2107.07511v6 (2022), p.14 (conditional coverage ~ Beta(n+1-l, l),
//   l = floor((n+1)alpha)), p.49 (BetaBinom(n_val, n+1-l, l)), p.50 (moments; Thm D.1 closed set s <= qhat), A.1.1
//   (p-value super-uniformity). Note n+1-l = ceil((n+1)(1-alpha)) = p.
// H-4 (prereg :101; C-6). Calls of the episode ordered by (block, log_index); per account, numerator = sum of the
//   floor-priced repayments (ADR-U3 D1 floorDiv) of the calls AFTER the first; denominator = y of the scores JSONL;
//   deficit reported apart; median over the liquidated class-A accounts of the stratum (share 0 for one call).
//   Every position is reconciled EXACTLY against repayment_base of U3-realized (fail-closed).
// H-6 (prereg :103; G0-lot-u4b :164; ADR-U4 :104-112; C-7). Served values = getAssetPrice(WETH) lines of U3-inputs
//   (price at b AND price_prev at b-1) at the blocks of the episode calls; series = anchor p0 + update lines of the
//   REDUCED oracle path; NON iff a value is outside events U {p0} OR its lag exceeds 3 events (or has no past match).
// ============================================================================================
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { strateOf } from "./u4b-scores.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, "..", "..", "..");
export const SCHEMA = "ukemi-u4b-hyp/1";
export const TOOL_REL = "scripts/census/u4b/u4b-hyp.mjs";

// ---- pre-registered constants (NO flag can change them; C-10) ----
/** H-3 level, prereg :100 (the pre-registered 5 % level of the exact beta-binomial test). */
export const H3_LEVEL = Object.freeze({ num: 5n, den: 100n });
/** Calibration alpha of the frozen producer (u4b-scores.mjs:65, prereg :67). */
export const CALIB_ALPHA = Object.freeze({ num: 1n, den: 100n });
/** nMin per stratum (prereg :97, u4b-scores.mjs:44): fresh n < NMIN => UNDER_CALIB. */
export const NMIN = 100;
/** e2 comparison floor (prereg :100): e2 stratum n < E2_MIN_N => NON_TESTABLE_E2. */
export const E2_MIN_N = 50;
/** H-4 reporting threshold (prereg :101, G0-lot-u4b :135): multi-call fraction > 5 % => NON. */
export const H4_THRESHOLD = Object.freeze({ num: 5n, den: 100n });
/** H-5 threshold k_H5 = nMin (prereg :102). */
export const H5_K = 100;
/** H-6 lag bound in events (prereg :103, G0-lot-u4b :164, ADR-U4 :109-110; C-7). */
export const H6_MAX_LAG = 3;
/** H-2bis interior-qhat condition at alpha = 1 % (prereg :98). */
export const H2BIS_INTERIOR_N = 199;
export const VERDICTS = Object.freeze(["OUI", "NON", "UNDER_CALIB", "NON_TESTABLE_E2"]);

/** The e2 comparison set: a FIXED committed fixture, sha-pinned (C-3/C-10: no --reference flag). */
export const REFERENCE_REL = "apps/sentinel/test/fixtures/ukemi/u4b/U4b-scores-e2.jsonl";
export const REFERENCE_SHA256_LF = "301d39fa806fd36a72cc446484aa4d04807a56ab603b1b69f464264550a126ad";
/** The frozen prereg (C-11 served sentence is read from it, verbatim; never re-typed in a source file). */
export const PREREG_REL = "docs/PLAN-u4b-prereg.md";
export const PREREG_SHA256_LF = "1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49";

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const PREDICTOR_A_RE = /^ukemi:realized-v2@eip155:1\/aave-v3-core\/weth-mono\/([^/]+)\/A$/;

/** Named refusal of this tool (fail-closed). */
export class HypError extends Error {
  constructor(message) { super(message); this.name = "HypError"; }
}
const fail = (m) => { throw new HypError(`u4b-hyp: ${m}`); };
const lc = (s) => String(s).toLowerCase();

// ============================================================================================
// Exact rational arithmetic (BigInt)
// ============================================================================================
const gcd = (x, y) => { let a = x < 0n ? -x : x, b = y < 0n ? -y : y; while (b !== 0n) { const t = a % b; a = b; b = t; } return a; };
/** Reduced rational {num, den}, den > 0. */
export function rat(num, den) {
  let n = BigInt(num), d = BigInt(den);
  if (d === 0n) fail("rational with zero denominator");
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d);
  return g === 0n || g === 1n ? { num: n, den: d } : { num: n / g, den: d / g };
}
const ratSub = (x, y) => rat(x.num * y.den - y.num * x.den, x.den * y.den);
const ratCmp = (x, y) => { const l = x.num * y.den, r = y.num * x.den; return l < r ? -1 : l > r ? 1 : 0; };
/** Decimal rendering TRUNCATED toward zero to `digits` fractional digits (deterministic, display only). */
export function ratToDecimal(r, digits = 12) {
  const neg = r.num < 0n;
  const n = neg ? -r.num : r.num;
  const scale = 10n ** BigInt(digits);
  const q = (n * scale) / r.den;
  const s = (q / scale).toString() + "." + (q % scale).toString().padStart(digits, "0");
  return neg && q !== 0n ? "-" + s : s;
}
const ratJson = (r) => ({ num: r.num.toString(), den: r.den.toString(), dec12: ratToDecimal(r, 12) });

const assertCount = (x, what) => { if (!Number.isSafeInteger(x) || x < 0) fail(`${what} must be a non-negative safe integer (got ${String(x)})`); };

// ============================================================================================
// Beta-binomial law with integer shape parameters (exact)
//   generative form [lu] (Angelopoulos & Bates p.49): K | mu ~ Binom(N, mu), mu ~ Beta(a, b)
//   pmf(j) = C(j+a-1, j) C(N-j+b-1, N-j) / C(N+a+b-1, N)   (Beta integral; total mass checked EXACTLY below)
// ============================================================================================
/** Exact pmf numerators over the common denominator C(N+a+b-1, N). Throws if the total mass is not exactly 1. */
export function bbDistribution(trials, a, b) {
  assertCount(trials, "trials");
  if (!Number.isSafeInteger(a) || a < 1 || !Number.isSafeInteger(b) || b < 1) fail(`beta-binomial shapes must be integers >= 1 (a=${String(a)}, b=${String(b)})`);
  const N = trials;
  const colA = [1n]; // C(a-1+j, j)
  for (let j = 1; j <= N; j++) colA.push((colA[j - 1] * BigInt(a - 1 + j)) / BigInt(j));
  const colB = [1n]; // C(b-1+m, m)
  for (let m = 1; m <= N; m++) colB.push((colB[m - 1] * BigInt(b - 1 + m)) / BigInt(m));
  let den = 1n; // C(a+b-1+N, N)
  for (let m = 1; m <= N; m++) den = (den * BigInt(a + b - 1 + m)) / BigInt(m);
  const pmfNum = [];
  let total = 0n;
  for (let j = 0; j <= N; j++) { const t = colA[j] * colB[N - j]; pmfNum.push(t); total += t; }
  if (total !== den) fail(`beta-binomial total mass != 1 (N=${N}, a=${a}, b=${b}) - arithmetic defect`);
  return { pmfNum, den };
}

/** EXACT lower tail P(K <= k) of BetaBinomial(trials, a, b), reduced rational. */
export function bbLowerTail(trials, a, b, k) {
  const { pmfNum, den } = bbDistribution(trials, a, b);
  if (!Number.isSafeInteger(k)) fail(`k must be an integer (got ${String(k)})`);
  if (k < 0) return rat(0n, 1n);
  if (k >= trials) return rat(1n, 1n);
  let s = 0n;
  for (let j = 0; j <= k; j++) s += pmfNum[j];
  return rat(s, den);
}

/** Level-5/100 decision: reject (NON) iff p-value <= level (super-uniformity, Angelopoulos & Bates A.1.1). */
export function rejectsAtLevel(pValue, level = H3_LEVEL) {
  return pValue.num * level.den <= level.num * pValue.den;
}

/** p = ceil((n+1)(1-alpha)) at alpha = 1/100, EXACT, asserted equal to the frozen float expression of
 *  u4b-scores.mjs:65 (Math.ceil((n + 1) * 0.99)); any divergence is a named refusal, never a silent choice. */
export function pOfN(n) {
  assertCount(n, "n");
  const top = BigInt(n + 1) * (CALIB_ALPHA.den - CALIB_ALPHA.num);
  const exact = Number((top + CALIB_ALPHA.den - 1n) / CALIB_ALPHA.den);
  const frozen = Math.ceil((n + 1) * 0.99);
  if (exact !== frozen) fail(`p(n=${n}): exact ceil ${exact} != frozen expression ${frozen} (C-3)`);
  return exact;
}

// ============================================================================================
// Input readers (JSONL) + fixed reference + prereg sentence
// ============================================================================================
export const sha256LfOfText = (text) => createHash("sha256").update(String(text).replace(/\r\n/g, "\n"), "utf8").digest("hex");
export const parseJsonl = (text) => String(text).split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l));

/** Load the e2 comparison fixture and ENFORCE its LF sha (C-3/C-10; a tampered or stale copy is refused). */
export function loadReferenceLines(path = join(ROOT, REFERENCE_REL)) {
  if (!existsSync(path)) fail(`e2 comparison fixture absent: ${REFERENCE_REL}`);
  const text = readFileSync(path, "utf8");
  const sha = sha256LfOfText(text);
  if (sha !== REFERENCE_SHA256_LF) fail(`e2 comparison fixture sha256 LF ${sha} != pinned ${REFERENCE_SHA256_LF} (fail-closed)`);
  return { lines: parseJsonl(text), sha256_lf: sha };
}

/** Extract the C-11 served sentence VERBATIM from the sha-pinned prereg (the span between the guillemets after
 *  "Texte servi (C-11)"; exactly one occurrence required). */
export function extractC11Sentence(preregText) {
  const sha = sha256LfOfText(preregText);
  if (sha !== PREREG_SHA256_LF) fail(`prereg sha256 LF ${sha} != pinned ${PREREG_SHA256_LF} (fail-closed)`);
  const re = /Texte servi \(C-11\)\*\* : \u00ab ([^\u00bb]+) \u00bb/g;
  const found = [...String(preregText).matchAll(re)];
  if (found.length !== 1) fail(`C-11 sentence: expected exactly one occurrence in the prereg, found ${found.length}`);
  return found[0][1];
}
export function loadC11Sentence(path = join(ROOT, PREREG_REL)) {
  if (!existsSync(path)) fail(`prereg absent: ${PREREG_REL}`);
  return extractC11Sentence(readFileSync(path, "utf8"));
}

/** Scores JSONL (u4b-reduce output): meta + score_a rows; producer-drift guards (alpha, n_min, strate). */
export function parseScores(lines, eventId, role) {
  const metas = lines.filter((l) => l.kind === "meta");
  if (metas.length !== 1) fail(`${role}: expected exactly one meta line, found ${metas.length}`);
  const meta = metas[0];
  const cellA = meta.cell_a;
  if (cellA === undefined || cellA === null) fail(`${role}: meta.cell_a absent`);
  if (cellA.alpha !== 0.01 || cellA.n_min !== NMIN) fail(`${role}: producer drift (cell_a.alpha=${String(cellA.alpha)}, n_min=${String(cellA.n_min)}; expected 0.01 / ${NMIN})`);
  const m = PREDICTOR_A_RE.exec(String(cellA.predictor_id));
  if (m === null) fail(`${role}: cell_a.predictor_id does not match the frozen producer format`);
  if (eventId !== null && m[1] !== eventId) fail(`${role}: event id '${m[1]}' (predictor_id) != --event-id '${String(eventId)}'`);
  const rows = lines.filter((l) => l.kind === "score_a").map((r) => {
    const score = BigInt(r.score), y = BigInt(r.y), yhat = BigInt(r.yhat);
    if (score < 0n || y < 0n || yhat < 0n) fail(`${role}: negative value in row ${String(r.address)}`);
    if (strateOf(yhat) !== r.strate) fail(`${role}: row ${String(r.address)} strate ${String(r.strate)} != strateOf(yhat) ${strateOf(yhat)}`);
    if (score !== (y > yhat ? y - yhat : 0n)) fail(`${role}: row ${String(r.address)} score != max(Y - yhat, 0)`);
    return { address: lc(r.address), y, yhat, score, liquidated: r.liquidated === true, strate: r.strate, pstar: r.pstar ?? null };
  });
  if (rows.length !== cellA.n) fail(`${role}: ${rows.length} score_a rows != cell_a.n ${String(cellA.n)}`);
  if (!Array.isArray(cellA.strata) || cellA.strata.length !== 4) fail(`${role}: cell_a.strata must list the 4 a-priori strata`);
  return { meta, cellA, rows, eventId: m[1] };
}

// ============================================================================================
// H-3
// ============================================================================================
/** One H-3 cell (a stratum or the pooled cell). fresh = {n, p, qhat} READ from the frozen meta, freshScores = the
 *  fresh exceedances of that cell (bigint), e2Scores = the e2 exceedances of the matching cell (bigint). */
export function h3Cell(label, fresh, freshScores, e2Scores) {
  const n = fresh.n;
  assertCount(n, `${label}: fresh n`);
  if (freshScores.length !== n) fail(`${label}: fresh meta n=${n} != ${freshScores.length} fresh rows`);
  const nE2 = e2Scores.length;
  const base = { cell: label, fresh: { n, p: fresh.p, qhat: fresh.qhat }, e2: { n: nE2 } };
  if (n < NMIN) {
    if (fresh.qhat !== null) fail(`${label}: fresh n=${n} < nMin but meta qhat is not null (frozen producer violated)`);
    return { ...base, verdict: "UNDER_CALIB", served: false };
  }
  const p = pOfN(n);
  if (fresh.p !== p) fail(`${label}: meta p=${String(fresh.p)} != ceil((n+1)*0.99)=${p} for n=${n} (C-3)`);
  if (fresh.qhat === null || fresh.qhat === undefined) fail(`${label}: fresh n=${n} >= nMin but meta qhat is null`);
  const qhat = BigInt(fresh.qhat);
  const sorted = freshScores.slice().sort((x, z) => (x < z ? -1 : x > z ? 1 : 0));
  if (sorted[p - 1] !== qhat) fail(`${label}: meta qhat ${qhat} != ${p}-th smallest fresh exceedance ${String(sorted[p - 1])}`);
  let k = 0, atoms = 0, tiesAtQhat = 0;
  for (const s of e2Scores) { if (s <= qhat) k++; if (s === 0n) atoms++; if (s === qhat) tiesAtQhat++; }
  const e2 = { n: nE2, k_covered: k, atoms_at_zero: atoms, ties_at_qhat: tiesAtQhat };
  const common = { ...base, served: true, fresh: { n, p, qhat: qhat.toString(), qhat_is_max: p === n }, e2 };
  if (nE2 < E2_MIN_N) return { ...common, verdict: "NON_TESTABLE_E2", p_value: null, coverage_observed: nE2 === 0 ? null : ratJson(rat(k, nE2)) };
  const a = p, b = n + 1 - p;
  const pv = bbLowerTail(nE2, a, b, k);
  const verdict = rejectsAtLevel(pv) ? "NON" : "OUI";
  const expected = rat(BigInt(nE2) * BigInt(p), BigInt(n + 1));
  const covObs = rat(k, nE2), covNom = rat(CALIB_ALPHA.den - CALIB_ALPHA.num, CALIB_ALPHA.den), covH0 = rat(p, n + 1);
  return {
    ...common, verdict,
    null_law: { family: "beta-binomial", trials: nE2, a, b },
    p_value: ratJson(pv), level: `${H3_LEVEL.num}/${H3_LEVEL.den}`,
    expected_covered: ratJson(expected),
    coverage_observed: ratJson(covObs), coverage_nominal: ratJson(covNom), coverage_expected_h0: ratJson(covH0),
    shortfall_vs_expected: ratJson(ratSub(expected, rat(k, 1))),
    coverage_gap_vs_nominal: ratJson(ratSub(covNom, covObs)),
    barber_thm2_bound: "not_estimated",
  };
}

/** H-3 over the 4 strata + the pooled class-A cell. Predicate of prereg :359 counts NON on SERVED strata only. */
export function computeH3(fresh, reference) {
  const strata = [0, 1, 2, 3].map((k) => {
    const s = fresh.cellA.strata.find((x) => x.strate === k);
    if (s === undefined) fail(`fresh meta has no stratum ${k}`);
    const fr = fresh.rows.filter((r) => r.strate === k).map((r) => r.score);
    const e2 = reference.rows.filter((r) => r.strate === k).map((r) => r.score);
    return { strate: k, ...h3Cell(`stratum ${k}`, { n: s.n, p: s.p, qhat: s.qhat }, fr, e2) };
  });
  const pooled = h3Cell("pooled class A", { n: fresh.cellA.n, p: fresh.cellA.p, qhat: fresh.cellA.qhat }, fresh.rows.map((r) => r.score), reference.rows.map((r) => r.score));
  const nonServed = strata.filter((s) => s.served && s.verdict === "NON").map((s) => s.strate);
  return {
    strata, pooled,
    served_strata: strata.filter((s) => s.served).map((s) => s.strate),
    non_on_served_strata: nonServed,
    h3_no_NON_on_served_strata: nonServed.length === 0,
  };
}

// ============================================================================================
// H-4
// ============================================================================================
const medianOf = (xs) => {
  if (xs.length === 0) return null;
  const s = xs.slice().sort(ratCmp);
  const lo = s[Math.floor((s.length - 1) / 2)], hi = s[Math.floor(s.length / 2)];
  return { median: ratJson(rat(lo.num * hi.den + hi.num * lo.den, 2n * lo.den * hi.den)), lower_middle: ratJson(lo), upper_middle: ratJson(hi) };
};

/** H-4: share of Y coming from the calls AFTER the first one, per stratum (C-6), with exact reconciliation (C-5 iv). */
export function computeH4(inputs, realized, fresh, eventId) {
  const meta = inputs.find((r) => r.kind === "meta");
  if (meta === undefined) fail("U3-inputs: no meta line");
  if (!Array.isArray(meta.events) || !meta.events.some((e) => e.id === eventId)) fail(`U3-inputs: meta.events has no event '${eventId}'`);
  const dec = new Map();
  for (const r of inputs.filter((x) => x.kind === "reserve")) dec.set(lc(r.asset), r.decimals);
  const price = new Map();
  for (const r of inputs.filter((x) => x.kind === "price")) price.set(`${lc(r.asset)}|${r.block}`, r.price);
  const allCalls = inputs.filter((r) => r.kind === "call" && r.event_id === eventId);
  const calls = allCalls.filter((c) => c.in_window === true);
  if (calls.length === 0) fail(`U3-inputs: no in-window call for event '${eventId}'`);

  // per-call floor-priced repayment (ADR-U3 D1 toBase = floorDiv); a missing debt price => the position abstains.
  const priced = calls.map((c) => {
    const d = dec.get(lc(c.debt));
    if (d === undefined || d === null) fail(`U3-inputs: no reserve decimals for debt asset ${lc(c.debt)}`);
    const px = price.get(`${lc(c.debt)}|${c.block}`);
    const repay = px === undefined || px === null ? null : (BigInt(c.debt_to_cover) * BigInt(px)) / 10n ** BigInt(d);
    return { user: lc(c.user), debt: lc(c.debt), coll: lc(c.collateral), block: c.block, log_index: c.log_index, repay };
  });

  // reconciliation per position (user, debt, collateral) vs U3-realized repayment_base (exact, fail-closed)
  const posSum = new Map();
  for (const c of priced) {
    const key = `${c.user}|${c.debt}|${c.coll}`;
    const cur = posSum.get(key) ?? { sum: 0n, missing: false };
    if (c.repay === null) cur.missing = true; else cur.sum += c.repay;
    posSum.set(key, cur);
  }
  const lines = realized.filter((r) => r.event_id === eventId);
  if (lines.length === 0) fail(`U3-realized: no line for event '${eventId}'`);
  let reconciled = 0, abstained = 0;
  const abstainedUsers = new Set();
  const seen = new Set();
  for (const r of lines) {
    const key = `${lc(r.user)}|${lc(r.debt_asset)}|${lc(r.collateral_asset)}`;
    const ps = posSum.get(key);
    if (ps === undefined) fail(`U3-realized line ${key} has no in-window call in U3-inputs`);
    seen.add(key);
    if (r.repayment_base === null) { abstained++; abstainedUsers.add(lc(r.user)); continue; }
    if (ps.missing) fail(`position ${key}: a debt price is missing but repayment_base is present (inconsistent inputs)`);
    if (ps.sum !== BigInt(r.repayment_base)) fail(`reconciliation failed for position ${key}: sum of per-call floor repayments ${ps.sum} != repayment_base ${String(r.repayment_base)}`);
    reconciled++;
  }
  for (const key of posSum.keys()) if (!seen.has(key)) fail(`in-window position ${key} has no U3-realized line`);

  const byUser = new Map();
  for (const c of priced) { if (!byUser.has(c.user)) byUser.set(c.user, []); byUser.get(c.user).push(c); }

  // all liquidated users of the episode (U3-realized users; prereg :101, the "all liquidated" figure 24/189 on e2)
  const nCallsByUser = new Map();
  for (const r of lines) nCallsByUser.set(lc(r.user), (nCallsByUser.get(lc(r.user)) ?? 0) + Number(r.n_calls));
  let multiAll = 0;
  for (const [u, nc] of nCallsByUser) {
    const inInputs = (byUser.get(u) ?? []).length;
    if (inInputs !== nc) fail(`user ${u}: n_calls ${nc} (U3-realized) != ${inInputs} in-window calls (U3-inputs)`);
    if (nc > 1) multiAll++;
  }

  const perAccount = [];
  const liqRows = fresh.rows.filter((r) => r.liquidated);
  let accountsAbstained = 0, multiA = 0;
  for (const row of liqRows) {
    const cs = byUser.get(row.address);
    if (cs === undefined || cs.length === 0) fail(`liquidated class-A account ${row.address} has no call in U3-inputs for '${eventId}'`);
    if (cs.length > 1) multiA++;
    if (abstainedUsers.has(row.address) || cs.some((c) => c.repay === null)) { accountsAbstained++; continue; }
    const ordered = cs.slice().sort((x, z) => x.block - z.block || x.log_index - z.log_index);
    const afterRepay = ordered.slice(1).reduce((acc, c) => acc + c.repay, 0n);
    const allRepay = ordered.reduce((acc, c) => acc + c.repay, 0n);
    const deficitPart = row.y - allRepay;
    if (deficitPart < 0n) fail(`account ${row.address}: y ${row.y} < sum of its repayments ${allRepay}`);
    const numer = afterRepay;
    perAccount.push({ address: row.address, strate: row.strate, n_calls: ordered.length, y: row.y, after: numer, deficit: deficitPart, share: rat(numer, row.y) });
  }

  const summarize = (accts) => {
    const multi = accts.filter((x) => x.n_calls > 1);
    const sumY = accts.reduce((a, x) => a + x.y, 0n), sumAfter = accts.reduce((a, x) => a + x.after, 0n), sumDef = accts.reduce((a, x) => a + x.deficit, 0n);
    const mSumY = multi.reduce((a, x) => a + x.y, 0n), mSumAfter = multi.reduce((a, x) => a + x.after, 0n);
    return {
      liquidated: accts.length, multi_call: multi.length,
      multi_call_fraction: accts.length === 0 ? null : ratJson(rat(multi.length, accts.length)),
      sum_y: sumY.toString(), sum_after_first: sumAfter.toString(), sum_deficit_apart: sumDef.toString(),
      share_sum: sumY === 0n ? null : ratJson(rat(sumAfter, sumY)),
      share_median: medianOf(accts.map((x) => x.share)),
      multi_call_subset: { n: multi.length, share_sum: mSumY === 0n ? null : ratJson(rat(mSumAfter, mSumY)), share_median: medianOf(multi.map((x) => x.share)) },
    };
  };
  const pooled = summarize(perAccount);
  const strata = [0, 1, 2, 3].map((k) => ({ strate: k, ...summarize(perAccount.filter((x) => x.strate === k)) }));
  const liqA = liqRows.length;
  const fracA = liqA === 0 ? null : rat(multiA, liqA);
  const fracAll = nCallsByUser.size === 0 ? null : rat(multiAll, nCallsByUser.size);
  const verdictOf = (f) => (f === null ? null : ratCmp(f, rat(H4_THRESHOLD.num, H4_THRESHOLD.den)) > 0 ? "NON" : "OUI");
  return {
    threshold: `${H4_THRESHOLD.num}/${H4_THRESHOLD.den}`,
    class_a_liquidated: { n: liqA, multi_call: multiA, fraction: fracA === null ? null : ratJson(fracA), verdict: verdictOf(fracA) },
    all_liquidated: { n: nCallsByUser.size, multi_call: multiAll, fraction: fracAll === null ? null : ratJson(fracAll), verdict: verdictOf(fracAll) },
    reconciliation: { positions_reconciled: reconciled, positions_abstained: abstained, calls_in_window: calls.length, calls_not_in_window: allCalls.length - calls.length },
    accounts_abstained: accountsAbstained,
    pooled, strata,
  };
}

// ============================================================================================
// H-6
// ============================================================================================
/** H-6: served values (getAssetPrice(WETH) at b and b-1 at the episode call blocks) vs events U {p0} and lag <= 3. */
export function computeH6(inputs, oracleLines, eventId) {
  const anchors = oracleLines.filter((l) => l.kind === "anchor"), metas = oracleLines.filter((l) => l.kind === "meta");
  if (anchors.length !== 1 || metas.length !== 1) fail(`oracle path: expected one anchor and one meta line (found ${anchors.length}/${metas.length})`);
  const anchor = anchors[0], meta = metas[0];
  if (meta.event_id !== eventId) fail(`oracle path meta.event_id '${String(meta.event_id)}' != --event-id '${eventId}'`);
  const p0 = BigInt(anchor.price);
  if (p0 <= 0n) fail("oracle path anchor price must be > 0");
  const updates = oracleLines.filter((l) => l.kind === "update").map((u) => ({ block: Number(u.block), log_index: Number(u.log_index), price: BigInt(u.price) }))
    .sort((x, z) => x.block - z.block || x.log_index - z.log_index);
  const series = [{ block: Number(anchor.block), log_index: -1, price: p0, anchor: true }, ...updates.map((u) => ({ ...u, anchor: false }))];
  const eventPrices = new Set(updates.map((u) => u.price.toString()));

  const callBlocks = new Set(inputs.filter((r) => r.kind === "call" && r.event_id === eventId).map((r) => r.block));
  if (callBlocks.size === 0) fail(`U3-inputs: no call for event '${eventId}'`);
  const priceLines = inputs.filter((r) => r.kind === "price" && lc(r.asset) === WETH && callBlocks.has(r.block));
  const served = new Map(); // block -> bigint
  const atB = [];           // the `price` values at the call blocks (ADR-U4 form)
  let nullValues = 0;
  const put = (b, v) => {
    if (v === null || v === undefined) { nullValues++; return; }
    const x = BigInt(v);
    const prev = served.get(b);
    if (prev !== undefined && prev !== x) fail(`two different served WETH values at block ${b}`);
    served.set(b, x);
  };
  for (const r of priceLines) { put(r.block, r.price); put(r.block - 1, r.price_prev); if (r.price !== null && r.price !== undefined) atB.push({ block: r.block, value: BigInt(r.price) }); }

  const lagOf = (b, v) => {
    let L = -1;
    for (let i = 0; i < series.length; i++) if (series[i].block <= b) L = i;
    for (let j = 0; L - j >= 0; j++) if (series[L - j].price === v) return { lag: j, on_anchor: series[L - j].anchor };
    return { lag: null, on_anchor: false };
  };
  const classify = (vals) => {
    let inEvents = 0, isP0 = 0, outside = 0, lagUndefined = 0, lagOver = 0, maxLag = -1, onAnchor = 0;
    const hist = {};
    const violations = [];
    for (const { block, value } of vals) {
      const inEv = eventPrices.has(value.toString());
      if (inEv) inEvents++; else if (value === p0) isP0++; else outside++;
      const { lag, on_anchor: oa } = lagOf(block, value);
      if (oa) onAnchor++;
      if (lag === null) lagUndefined++;
      else { hist[String(lag)] = (hist[String(lag)] ?? 0) + 1; if (lag > maxLag) maxLag = lag; }
      const bad = (!inEv && value !== p0) || lag === null || lag > H6_MAX_LAG;
      if (lag !== null && lag > H6_MAX_LAG) lagOver++;
      if (bad) violations.push({ block, value: value.toString(), lag });
    }
    return { n: vals.length, in_events: inEvents, equal_to_p0: isP0, outside, lag_histogram: hist, matched_on_anchor: onAnchor, max_lag: maxLag < 0 ? null : maxLag, lag_over_bound: lagOver, lag_undefined: lagUndefined, violations };
  };
  if (served.size === 0) fail(`H-6: no served WETH value at the call blocks of '${eventId}' (inconsistent inputs; WETH is the episode collateral)`);
  const all = classify([...served.entries()].sort((x, z) => x[0] - z[0]).map(([block, value]) => ({ block, value })));
  const priceAtB = classify(atB.sort((x, z) => x.block - z.block));
  const minServed = served.size === 0 ? null : [...served.values()].reduce((m, x) => (x < m ? x : m));
  const minEvents = updates.length === 0 ? null : updates.reduce((m, u) => (u.price < m ? u.price : m), updates[0].price);
  return {
    verdict: all.violations.length === 0 ? "OUI" : "NON",
    max_lag_bound: H6_MAX_LAG,
    anchor: { block: Number(anchor.block), price: p0.toString(), source: String(anchor.source ?? "unknown"), book_fallback_d_n_path: anchor.source === "book_weth_price_base_8dec" },
    series: { n_updates: updates.length, monotone_blocks: meta.monotone_blocks === true, phase_change: meta.phase_change === true },
    served_price_lines: priceLines.length, served_null_values: nullValues,
    served_blocks: all,
    price_at_call_block: priceAtB,
    bracket_condition_all_served_in_events_or_p0: all.outside === 0,
    min_served: minServed === null ? null : minServed.toString(), min_events: minEvents === null ? null : minEvents.toString(),
    sample_note: "served values are sampled at liquidation blocks only (ADR-U4:106-107 bias, declared)",
  };
}

// ============================================================================================
// Labels (prereg :87-89 / :359; C-2) and census-derived H-2 / H-2bis / clause 3 / H-5 / H-7
// ============================================================================================
export function computeLabels(realized, eventId) {
  const lines = realized.filter((r) => r.event_id === eventId);
  const hasRes = (r, t) => Array.isArray(r.residual) && r.residual.includes(t);
  return {
    label_lines: lines.length,
    labels_no_quorum_unresolved: lines.filter((r) => r.repayment_base === null).length,
    residual_no_quorum: lines.filter((r) => hasRes(r, "no_quorum")).length,
    deficit_base_no_price_non_usdt: lines.filter((r) => hasRes(r, "deficit_base_no_price") && lc(r.debt_asset) !== USDT).length,
    other_event_lines: realized.length - lines.length,
  };
}

export function computeCensusHyps(fresh) {
  const census = fresh.meta.census ?? fail("fresh meta.census absent");
  const strata = [0, 1, 2, 3].map((k) => fresh.cellA.strata.find((x) => x.strate === k));
  const h2 = strata.map((s) => ({ strate: s.strate, n: s.n, n_min: NMIN, under_calib: s.n < NMIN }));
  const h2bis = strata.filter((s) => s.n >= NMIN).map((s) => ({
    strate: s.strate, n: s.n, p: s.p, qhat: s.qhat, interior: s.p < s.n, n_ge_199: s.n >= H2BIS_INTERIOR_N,
    qhat_is_stratum_max: s.qhat !== null && s.qhat === s.max_score,
  }));
  for (const x of h2bis) if (!x.interior && !x.qhat_is_stratum_max) fail(`H-2bis: stratum ${x.strate} p == n but qhat != max_score`);
  const y0liq = fresh.rows.filter((r) => r.yhat === 0n && r.liquidated);
  const q0 = {
    crossed_yhat_zero: census.crossed_yhat_zero,
    yhat_zero_liquidated: y0liq.length,
    without_crossing: y0liq.filter((r) => r.pstar === null).map((r) => ({ address: r.address, y: r.y.toString() })),
    crossed_yhat_zero_liquidated: y0liq.filter((r) => r.pstar !== null).map((r) => ({ address: r.address, y: r.y.toString(), pstar: String(r.pstar) })),
  };
  const population = census.accounts - census.no_aweth - census.non_evaluable_x - census.non_evaluable_emode;
  if (population !== census.crossed + census.no_crossing) fail(`H-5: population ${population} != crossed + no_crossing ${census.crossed + census.no_crossing}`);
  return {
    h2: { strata: h2 },
    h2bis: { strata: h2bis },
    q0_rule_failures: q0,
    h5: { population_mono_weth: population, k_h5: H5_K, meets_k_h5: population >= H5_K, class_a_n: fresh.cellA.n },
    h7: { pstar_is_anchor: census.pstar_is_anchor },
  };
}

// ============================================================================================
// Summary text (English + prereg vocabulary; checked by the vocabulary gate test; NEVER a decision token)
// ============================================================================================
export const SUMMARY_TEMPLATES = Object.freeze({
  HEAD: "U-4b hypothesis report, episode {ep}: offline tool; prereg lines 95-106 and 359; H-3, H-4 and H-5 are reporting thresholds, nothing served depends on them (prereg line 106).",
  H3_HEAD: "H-3 exchangeability across episodes: exact beta-binomial lower-tail test at the pre-registered 5/100 level; k = e2 class-A exceedances at or below the fresh qhat; null law BetaBinomial(n_e2, p, n+1-p); atoms at 0 counted covered (conservative).",
  H3_OUI: "H-3 {cell}: OUI (k={k} of n_e2={ne2}, expected {ek} under exchangeability, p-value {pv}; fresh n={n}, p={p}, qhat={qhat}). C-11: \"{c11}\"",
  H3_NON: "H-3 {cell}: NON (k={k} of n_e2={ne2}, expected {ek} under exchangeability, p-value {pv} at or below 5/100; observed coverage {cov}, nominal 99/100, shortfall {gap}); the Barber 2023 Thm 2 bound is not estimated; no claim on a new event.",
  H3_UNDER: "H-3 {cell}: UNDER_CALIB (fresh n={n} below nMin=100: qhat null, stratum not served, not tested).",
  H3_NONTEST: "H-3 {cell}: NON_TESTABLE_E2 (e2 comparison n={ne2} below 50: reported, not tested; k={k}).",
  H4_HEAD: "H-4 multi-call: {multiA} of {liqA} liquidated class-A accounts have more than one LiquidationCall ({verdictA} against 5/100); all liquidated: {multiAll} of {liqAll} ({verdictAll}); positions reconciled exactly: {recon}.",
  H4_STRATUM: "H-4 stratum {k}: liquidated {liq}, multi-call {multi}; share of Y after the first call: sum {sigma}, median {median}; deficit reported apart: {deficit} (base 8-dec).",
  H6_LINE: "H-6 served series: {verdict}; {nserved} served values at liquidation blocks: {inEv} in the AnswerUpdated series, {p0n} equal to the anchor p0 (source {src}), {outside} outside; max lag {maxLag} events (bound 3); sample biased toward liquidation blocks.",
  H2_LINE: "H-2 stratum {k}: n={n} ({status}).",
  H2BIS_LINE: "H-2bis stratum {k}: {status}.",
  Q0_LINE: "Next to qhat0 (clause 3): crossed_yhat_zero={cyz}; yhat=0 and liquidated: {n} accounts ({nNull} without crossing, {nCross} crossed with yhat=0).",
  H5_LINE: "H-5: mono-collateral WETH population {pop} against k_H5 = nMin = 100 ({meets}); class-A n={nA}.",
  H7_LINE: "H-7: pstar_is_anchor={x} (the identity HF == hf0 at p*=p0 is exercised by the frozen scorer tests).",
  LABELS_LINE: "Labels: {lines} label lines for the episode; repayment_base null (labels_no_quorum, unresolved): {nq}; residual no_quorum: {rq}; deficit_base_no_price on a non-USDT asset: {dnp}.",
  CLAUSE_LINE: "Clause 359 input (pre-registered U-6 condition, applied by the orchestrator, decision 137): no served stratum at NON = {a}; unresolved labels_no_quorum = {b}; condition satisfied = {c}. Pooled class-A H-3 verdict {pooled}, reported outside this condition.",
});
function fmt(key, vars) {
  const tpl = SUMMARY_TEMPLATES[key];
  if (tpl === undefined) fail(`summary template ${key} absent`);
  return tpl.replace(/\{([A-Za-z0-9]+)\}/g, (_, name) => {
    if (!(name in vars)) fail(`summary template ${key}: placeholder {${name}} unbound`);
    return String(vars[name]);
  });
}
function h3Line(c, c11) {
  if (c.verdict === "UNDER_CALIB") return fmt("H3_UNDER", { cell: c.cell, n: c.fresh.n });
  if (c.verdict === "NON_TESTABLE_E2") return fmt("H3_NONTEST", { cell: c.cell, ne2: c.e2.n, k: c.e2.k_covered });
  const v = { cell: c.cell, k: c.e2.k_covered, ne2: c.e2.n, ek: c.expected_covered.dec12, pv: c.p_value.dec12, n: c.fresh.n, p: c.fresh.p, qhat: c.fresh.qhat };
  if (c.verdict === "OUI") return fmt("H3_OUI", { ...v, c11 });
  return fmt("H3_NON", { ...v, cov: c.coverage_observed.dec12, gap: c.shortfall_vs_expected.dec12 });
}

export function buildSummary(body, c11) {
  const out = [fmt("HEAD", { ep: body.event_id })];
  if (body.h3 !== undefined) {
    out.push(fmt("H3_HEAD", {}));
    for (const s of body.h3.strata) out.push(h3Line(s, c11));
    out.push(h3Line(body.h3.pooled, c11));
  }
  if (body.h4 !== undefined) {
    const h = body.h4;
    out.push(fmt("H4_HEAD", { multiA: h.class_a_liquidated.multi_call, liqA: h.class_a_liquidated.n, verdictA: h.class_a_liquidated.verdict, multiAll: h.all_liquidated.multi_call, liqAll: h.all_liquidated.n, verdictAll: h.all_liquidated.verdict, recon: h.reconciliation.positions_reconciled }));
    for (const s of h.strata) out.push(fmt("H4_STRATUM", { k: s.strate, liq: s.liquidated, multi: s.multi_call, sigma: s.share_sum === null ? "n/a" : s.share_sum.dec12, median: s.share_median === null ? "n/a" : s.share_median.median.dec12, deficit: s.sum_deficit_apart }));
  }
  if (body.h6 !== undefined) {
    const h = body.h6, a = h.served_blocks;
    out.push(fmt("H6_LINE", { verdict: h.verdict, nserved: a.n, inEv: a.in_events, p0n: a.equal_to_p0, src: h.anchor.source, outside: a.outside, maxLag: a.max_lag === null ? "n/a" : a.max_lag }));
  }
  if (body.h2 !== undefined) {
    for (const s of body.h2.strata) out.push(fmt("H2_LINE", { k: s.strate, n: s.n, status: s.under_calib ? "under_calib, not served" : "served" }));
    for (const s of body.h2bis.strata) out.push(fmt("H2BIS_LINE", { k: s.strate, status: s.interior ? "interior qhat (n >= 199)" : "qhat is the stratum max (n below 199), reported as is" }));
    const q = body.q0_rule_failures;
    out.push(fmt("Q0_LINE", { cyz: q.crossed_yhat_zero, n: q.yhat_zero_liquidated, nNull: q.without_crossing.length, nCross: q.crossed_yhat_zero_liquidated.length }));
    out.push(fmt("H5_LINE", { pop: body.h5.population_mono_weth, meets: body.h5.meets_k_h5 ? "met" : "not met", nA: body.h5.class_a_n }));
    out.push(fmt("H7_LINE", { x: body.h7.pstar_is_anchor }));
  }
  if (body.labels !== undefined) {
    const l = body.labels;
    out.push(fmt("LABELS_LINE", { lines: l.label_lines, nq: l.labels_no_quorum_unresolved, rq: l.residual_no_quorum, dnp: l.deficit_base_no_price_non_usdt }));
  }
  if (body.clause_359 !== undefined) {
    const c = body.clause_359;
    out.push(fmt("CLAUSE_LINE", { a: c.h3_no_NON_on_served_strata, b: c.labels_no_quorum_unresolved, c: c.condition_satisfied, pooled: c.h3_pooled_verdict_outside_condition }));
  }
  return out;
}

/** The clause of prereg :359 as an INPUT of decision (C-4): never a decision token. */
export function clause359(h3, labels) {
  return {
    h3_no_NON_on_served_strata: h3.h3_no_NON_on_served_strata,
    labels_no_quorum_unresolved: labels.labels_no_quorum_unresolved,
    condition_satisfied: h3.h3_no_NON_on_served_strata && labels.labels_no_quorum_unresolved === 0,
    h3_pooled_verdict_outside_condition: h3.pooled.verdict,
  };
}

// ============================================================================================
// Canonical JSON + digest
// ============================================================================================
export function canon(v) {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
}
export const bodyDigest = (body) => createHash("sha256").update(canon(body), "utf8").digest("hex");

// ============================================================================================
// CLI
// ============================================================================================
const SPEC = Object.freeze({
  h3: ["--scores", "--event-id", "--out"],
  h4: ["--inputs", "--u3-realized", "--scores", "--event-id", "--out"],
  h6: ["--inputs", "--oracle-path", "--event-id", "--out"],
  report: ["--scores", "--inputs", "--u3-realized", "--oracle-path", "--event-id", "--out"],
});
/** Flags that would re-open a pre-registered choice (level, side, e2 set, smoothing): named refusal (C-10). */
export const FORBIDDEN_FLAGS = Object.freeze(["--alpha", "--level", "--side", "--ref", "--reference", "--smoothed", "--seed", "--tie-break", "--two-sided", "--n-min"]);

export function parseArgs(argv) {
  const [cmd, ...rest] = argv;
  if (cmd === undefined || !Object.hasOwn(SPEC, cmd)) fail(`sub-command must be one of ${Object.keys(SPEC).join("|")} (got ${String(cmd)})`);
  const allowed = SPEC[cmd];
  const opts = {};
  for (let i = 0; i < rest.length; i++) {
    const t = rest[i];
    if (FORBIDDEN_FLAGS.includes(t)) fail(`${t} is forbidden: the level, the side, the e2 comparison set and the tie handling are pre-registered constants (C-10)`);
    if (!allowed.includes(t)) fail(`unknown argument '${t}' for '${cmd}' (allowed: ${allowed.join(" ")})`);
    if (Object.hasOwn(opts, t)) fail(`duplicate argument ${t}`);
    const v = rest[i + 1];
    if (v === undefined || v.startsWith("--")) fail(`${t} requires a value`);
    opts[t] = v;
    i++;
  }
  for (const k of allowed) if (!Object.hasOwn(opts, k)) fail(`${k} is REQUIRED for '${cmd}' (no default)`);
  return { cmd, opts };
}

function outOfRepo(p) {
  const abs = resolve(p);
  const rel = relative(ROOT, abs);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) fail(`--out ${abs} is inside the repository (refused; reports live out of repo)`);
  const parent = dirname(abs);
  if (!existsSync(parent) || !statSync(parent).isDirectory()) fail(`--out parent directory does not exist: ${parent}`);
  if (existsSync(abs)) fail(`--out ${abs} already exists (never overwritten)`);
  return abs;
}
function readInput(path, role) {
  if (!existsSync(path)) fail(`${role}: file not found`);
  const text = readFileSync(path, "utf8");
  return { text, meta: { sha256_lf: sha256LfOfText(text), bytes: Buffer.byteLength(text, "utf8") } };
}
export function toolSha256Lf() { return sha256LfOfText(readFileSync(fileURLToPath(import.meta.url), "utf8")); }

/** Run one sub-command; returns { out, kind, body_digest }. Writes ONE JSON file (wx). No network, no env. */
export function runCli(argv) {
  const { cmd, opts } = parseArgs(argv);
  const out = outOfRepo(opts["--out"]);
  const eventId = opts["--event-id"];
  const inputsMeta = {};
  const body = { event_id: eventId };
  let reference = null, c11 = null;
  const needScores = cmd === "h3" || cmd === "h4" || cmd === "report";
  let fresh = null;
  if (needScores) {
    const s = readInput(opts["--scores"], "--scores");
    inputsMeta.scores = s.meta;
    fresh = parseScores(parseJsonl(s.text), eventId, "fresh scores");
  }
  let inputs = null, realized = null, oracle = null;
  if (opts["--inputs"] !== undefined) { const r = readInput(opts["--inputs"], "--inputs"); inputsMeta.u3_inputs = r.meta; inputs = parseJsonl(r.text); }
  if (opts["--u3-realized"] !== undefined) { const r = readInput(opts["--u3-realized"], "--u3-realized"); inputsMeta.u3_realized = r.meta; realized = parseJsonl(r.text); }
  if (opts["--oracle-path"] !== undefined) { const r = readInput(opts["--oracle-path"], "--oracle-path"); inputsMeta.oracle_path = r.meta; oracle = parseJsonl(r.text); }

  if (cmd === "h3" || cmd === "report") {
    const ref = loadReferenceLines();
    reference = parseScores(ref.lines, null, "e2 comparison fixture");
    inputsMeta.e2_comparison = { rel: REFERENCE_REL, sha256_lf: ref.sha256_lf };
    c11 = loadC11Sentence();
    inputsMeta.prereg = { rel: PREREG_REL, sha256_lf: PREREG_SHA256_LF };
    body.h3 = computeH3(fresh, reference);
  }
  if (cmd === "h4" || cmd === "report") body.h4 = computeH4(inputs, realized, fresh, eventId);
  if (cmd === "h6" || cmd === "report") body.h6 = computeH6(inputs, oracle, eventId);
  if (cmd === "report") {
    Object.assign(body, computeCensusHyps(fresh));
    body.labels = computeLabels(realized, eventId);
    body.clause_359 = clause359(body.h3, body.labels);
  }
  body.summary = buildSummary(body, c11 ?? "");
  const doc = {
    schema: SCHEMA, kind: cmd,
    provenance: { tool: { rel: TOOL_REL, sha256_lf: toolSha256Lf() }, node: process.version, inputs: inputsMeta, event_id: eventId },
    body, body_digest: bodyDigest(body),
  };
  const text = JSON.stringify(doc, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2) + "\n";
  writeFileSync(out, text, { flag: "wx" });
  process.stdout.write(`u4b-hyp ${cmd}: episode ${eventId}, body_digest ${doc.body_digest}\n` + body.summary.map((l) => "  " + l).join("\n") + "\n");
  return { out, kind: cmd, body_digest: doc.body_digest };
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { runCli(process.argv.slice(2)); }
  catch (e) { process.stderr.write(`${e instanceof Error ? e.message : String(e)}\n`); process.exitCode = 1; }
}
