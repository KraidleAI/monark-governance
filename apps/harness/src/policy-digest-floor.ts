/**
 * The digest floor of a published kata row (SHORT-DIGEST-INVERSION-1; docs/G0-lot-short-digest-inversion-1.md sections 4.1 and 10;
 * decisions Q-1 to Q-10 of RECHERCHES, 2026-10-06). One rule for the publication gate (tableRowProblems of scripts/spec-publish.mjs)
 * and for the import guard (guardKataRow of policy-guard.ts). Pure: no clock, no file, no import, and no floating point in a decision
 * (log2 is computed for a refusal text only).
 *
 * A sign-set row digests two 0/1 sequences of its n calibration points (generator calibrate.ts l.71-72): the scores s, 1 for a miss (a
 * flat label is a miss), with `misses` ones; and the labels, 1 for an up label. The row is refused unless each published digest has at
 * least 2^DIGEST_FLOOR_BITS sequences compatible with what the row publishes, counted exactly in big integers:
 * - up side: the labels are the complement of the scores, hence the same count (the closed form is symmetric in ones and zeros);
 * - down side: the labels are the scores less the f flats of the cell, f unpublished. Equal sequences have equal digests (calibrate.ts
 *   l.17), so f = 0 when the labels digest equals the scores digest, 1 <= f <= min(LABEL_FLAT_CAP, misses) when it differs, and
 *   0 <= f <= min(LABEL_FLAT_CAP, misses) when the labels digest is not published. With f flats the labels have misses - f ones and
 *   the stated runs_aux. Each pair (s, F) of a scores sequence and f of its ones gives one label sequence; there are C(n, m) C(m, f) =
 *   C(n, m - f) C(n - m + f, f) pairs, each label sequence receives C(n - m + f, f) of them and each scores sequence gives C(m, f): so
 *   at least C(n, m) N(n, m - f, runs_aux) / C(n, m - f) scores sequences are compatible, N(n, m, runs_aux) itself at f = 0. The rule
 *   takes the smallest bound over the f admitted (RECHERCHES Q-6: the no-flat count is not shown to bound them all, so the cap covers
 *   every f explicitly);
 * - qhat 0: runs_miss is the outcome of the scores themselves; with f >= 1 the two constraints are joined by the union bound.
 * A count of flats under which the stated outcomes cannot occur is not the cell's; a row that no count admits is refused.
 *
 * N(n, k, o) is the closed form of packages/hikae/src/runs.ts l.60-62, summed in one pass, with the decision of its l.77 at the level
 * 0.05. runs.ts exposes the test on a sequence only (runsLowerTailLeq) and an entry by counts there needs a zone exception (header of
 * tail.ts), so the form lives here and test/short-digest-floor.test.ts holds it to runsLowerTailLeq by complete enumeration.
 */

/** The floor in bits (RECHERCHES Q-2). */
export const DIGEST_FLOOR_BITS = 128;
/** The largest number of flat labels in one CALIB block of wave 1: SOLUSDT 1h, census.json 95e5b984 (RECHERCHES Q-5). */
export const LABEL_FLAT_CAP = 34;
/** The runs level of a wave 1 row, "0.05" (policy-guard.ts pins runs_level), as the ratio 1/20. */
const LEVEL = { num: 1n, den: 20n };
const FLOOR = 1n << BigInt(DIGEST_FLOOR_BITS);

export type RunsOutcome = "pass" | "reject" | "empty";

/** C(n, k) in exact integers, 0 outside 0..n: each partial product is itself a binomial, so every division is exact. */
function choose(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  let c = 1n;
  for (let i = 0; i < Math.min(k, n - k); i++) c = (c * BigInt(n - i)) / BigInt(i + 1);
  return c;
}

/**
 * N(n, k, outcome): the 0/1 sequences of n points with k ones whose runs outcome at 0.05 is `outcome`, as runsLowerTailLeq decides it
 * (runs.ts l.63-77): `empty` iff k is 0 or n; otherwise rejected iff the arrangements with at most R runs, times 20, are at most
 * C(n, k). Arrangements with r runs, a = k - 1, b = n - k - 1: r = 2j: 2 C(a, j - 1) C(b, j - 1); r = 2j + 1: C(a, j) C(b, j - 1) +
 * C(a, j - 1) C(b, j). The rejected values of R form a lower tail, so one pass up to the first passing r gives the rejected count.
 */
export function runsOutcomeCount(n: number, k: number, outcome: RunsOutcome): bigint {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) || k < 0 || k > n) throw new RangeError(`runsOutcomeCount: k ${String(k)} outside 0..${String(n)}`);
  if (k === 0 || k === n) return outcome === "empty" ? 1n : 0n;
  if (outcome === "empty") return 0n;
  const all = choose(n, k), a = k - 1, b = n - k - 1;
  let rejected = 0n, tail = 0n, ca = 1n, cb = 1n; // C(a, j - 1) and C(b, j - 1)
  for (let j = 1; ; j++) {
    const caNext = (ca * BigInt(a - j + 1)) / BigInt(j), cbNext = (cb * BigInt(b - j + 1)) / BigInt(j); // C(a, j) and C(b, j)
    for (const runs of [2n * ca * cb, caNext * cb + ca * cbNext]) { // r = 2j, then r = 2j + 1; the tail reaches C(n, k), so the loop ends
      tail += runs;
      if (tail * LEVEL.den > LEVEL.num * all) return outcome === "reject" ? rejected : all - rejected;
      rejected = tail;
    }
    [ca, cb] = [caNext, cbNext];
  }
}

/** A lower bound as a fraction [numerator, denominator > 0]; a numerator of 0 or less bounds nothing. */
export type Bound = readonly [bigint, bigint];

/**
 * The lower bounds on the scores sequences and on the label sequences compatible with a sign-set row of n points and m misses whose
 * labels carry f flats (f = 0 on an up side or when the two digests are equal), runs_aux `runsAux` and, at qhat 0, runs_miss `runsMiss`
 * (null at qhat 1: the miss indicator is then all zero and says nothing on the scores). Null when the stated outcomes cannot hold with
 * f flats. x = C(n, m) N(n, m - f, runsAux), less (C(n, m) - N(n, m, runsMiss)) C(n, m - f) at qhat 0 with f >= 1 (union bound);
 * the scores are at least x / C(n, m - f), the labels at least x / C(n, m).
 */
export function flatBounds(n: number, m: number, f: number, runsAux: RunsOutcome, runsMiss: RunsOutcome | null): { readonly scores: Bound; readonly labels: Bound } | null {
  if (!Number.isSafeInteger(m) || !Number.isSafeInteger(f) || f < 0 || f > m || m > n) throw new RangeError(`flatBounds: f ${String(f)} outside 0..${String(m)}, or m above n ${String(n)}`);
  const label = runsOutcomeCount(n, m - f, runsAux);
  if (label === 0n || (f === 0 && runsMiss !== null && runsMiss !== runsAux)) return null;
  const all = choose(n, m), allU = choose(n, m - f);
  const x = all * label - (runsMiss !== null && f > 0 ? (all - runsOutcomeCount(n, m, runsMiss)) * allU : 0n);
  return { scores: [x, allU], labels: [x, all] };
}

/** The columns the rule reads, as a table file writes them: any JSON value (the gate reads hand-edited files), each checked before use. */
export interface DigestRow {
  readonly region_rule?: unknown; readonly aux_seq?: unknown; readonly side?: unknown; readonly n?: unknown; readonly misses?: unknown;
  readonly qhat?: unknown; readonly runs_miss?: unknown; readonly runs_aux?: unknown; readonly runs_level?: unknown;
  readonly scores_sha256?: unknown; readonly aux_sha256?: unknown; readonly series_sha256?: unknown; readonly source?: unknown;
}

const OUTCOMES: readonly unknown[] = ["pass", "reject", "empty"];
const isOutcome = (v: unknown): v is RunsOutcome => OUTCOMES.includes(v);
const isCount = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;
const given = (v: unknown): boolean => v !== null && v !== undefined;
const log2 = (v: bigint): number => { const w = v.toString(2).length; return w <= 53 ? Math.log2(Number(v)) : w - 53 + Math.log2(Number(v >> BigInt(w - 53))); };
/** log2 of a bound, to two decimals (G0 section 4.1): the refusal text, never the decision. */
const bits = ([x, den]: Bound): string => (x <= 0n ? "-Infinity" : (log2(x) - log2(den)).toFixed(2));
/** The smaller of two bounds under the floor, or `low` when `b` clears it. */
const under = (b: Bound, low: Bound | null): Bound | null => (b[0] >= FLOOR * b[1] ? low : low === null || b[0] * low[1] < low[0] * b[1] ? b : low);

/** The floor of a sign-set row: its scores digest and, when published, its labels digest. */
function floorProblems(r: DigestRow, labels: boolean): string[] {
  const wave = typeof r.source === "object" && r.source !== null ? (r.source as { readonly wave?: unknown }).wave : undefined;
  if (wave !== 1 || r.runs_level !== "0.05") return ["sign-set off wave 1 or runs_level 0.05, no flat cap pinned (FLAT-CAP-NEXT-WAVE-1)"];
  const { n, misses: m, qhat, runs_miss: om, runs_aux: oa, side } = r;
  if (!isCount(n) || !isCount(m) || m > n || !isOutcome(oa) || (side !== "up" && side !== "down") || !(qhat === 1 || (qhat === 0 && isOutcome(om)))) return ["sign-set counts unreadable (n, misses, qhat, runs_miss, runs_aux, side)"];
  const own = qhat === 0 && isOutcome(om) ? om : null;
  const fMin = side === "down" && labels && r.aux_sha256 !== r.scores_sha256 ? 1 : 0; // differing digests: at least one flat
  const fMax = side === "down" && !(labels && r.aux_sha256 === r.scores_sha256) ? Math.min(LABEL_FLAT_CAP, m) : 0;
  let held = false, scores: Bound | null = null, label: Bound | null = null;
  for (let f = fMin; f <= fMax; f++) {
    const b = flatBounds(n, m, f, oa, own);
    if (b === null) continue;
    held = true;
    scores = under(b.scores, scores);
    if (labels) label = under(b.labels, label);
  }
  if (!held) return [`sign-set outcomes that no count of flats up to ${String(LABEL_FLAT_CAP)} admits`];
  return [...(scores === null ? [] : [`scores ${bits(scores)} bits`]), ...(label === null ? [] : [`labels ${bits(label)} bits`])];
}

/**
 * The refusals of a row's digests (G0 section 4.1, points 2 to 4), empty when none: aux_sha256 that digests neither the scores of a
 * scaled-band row (aux_seq score, so equal to scores_sha256) nor the labels of a sign-set row (aux_seq label); series_sha256 (the pinned
 * source file of the symbol, not a sequence of points) on a row that is neither sign-set nor scaled-band; and on a sign-set row, a scores
 * or labels digest under the floor ("scores <log2> bits", "labels <log2> bits") or counts the rule cannot read (refused, closed).
 */
export function digestProblems(r: DigestRow): string[] {
  const signSet = r.region_rule === "sign-set", band = r.region_rule === "scaled-band", out: string[] = [];
  if (given(r.aux_sha256) && !(band && r.aux_seq === "score" && r.aux_sha256 === r.scores_sha256) && !(signSet && r.aux_seq === "label")) out.push("aux_sha256");
  if (given(r.series_sha256) && !signSet && !band) out.push("series_sha256");
  return signSet ? [...out, ...floorProblems(r, given(r.aux_sha256) && r.aux_seq === "label")] : out;
}
