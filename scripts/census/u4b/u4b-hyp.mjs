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
// H-4 / H-6 / labels / report / CLI: unit 1b of the same lot (R-25 seam, consigne A-5); this unit = the exact H-3 core.
// ============================================================================================
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
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
export const VERDICTS = Object.freeze(["OUI", "NON", "UNDER_CALIB", "NON_TESTABLE_E2"]);

/** The e2 comparison set: a FIXED committed fixture, sha-pinned (C-3/C-10: no --reference flag). */
export const REFERENCE_REL = "apps/sentinel/test/fixtures/ukemi/u4b/U4b-scores-e2.jsonl";
export const REFERENCE_SHA256_LF = "301d39fa806fd36a72cc446484aa4d04807a56ab603b1b69f464264550a126ad";
/** The frozen prereg (C-11 served sentence is read from it, verbatim; never re-typed in a source file). */
export const PREREG_REL = "docs/PLAN-u4b-prereg.md";
export const PREREG_SHA256_LF = "1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49";

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
