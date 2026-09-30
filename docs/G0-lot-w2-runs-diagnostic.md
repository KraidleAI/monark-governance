# G0 - lot w2-runs-diagnostic (worksite 2 of the RECHERCHES alignment, lot L2-1r: exact one-sided runs test)

- **Source**: extracted from the worksite G0 `recherches/decisions/0004-G0-worksite-2-commit-error-binomial-bound.md` v3 (sha256 `78947e2b2247cacd5d69ee0104bd55ce72a4aee50ed2722110b6980a0a36a43a`), sections 6 (L2-1r), 6.1 (R-25), 7 (tests R-1 to R-3), 8 (R-3, R-4, R-9). Decision record: ADR draft v3 `recherches/decisions/0004-ADR-draft-commit-error-binomial-bound.md` (sha256 `c70ed749f2ca17913660340d2804cce02be1a6e2739dce6a817dfe24a4f65726`), KraidleAI/recherches commit `d894c22`, validated by the founder 2026-09-30: D6 (dependence diagnostic with teeth at import: exact one-sided runs test on the miss indicator and on the median exceedance, `runs_level` pre-registered, default 0.05, fails closed).
- **Branch**: `lot/w2-runs-diagnostic`, from workshop `main` @ `8968695698d5c1affe1244ae7392e3bc7a927142` (the base named by the worksite G0 v3 and MONARK checkpoint-1). Independent of L2-1 (`lot/w2-binomial-core`), built in parallel: no import from it.
- **Intention (one)**: a pure engine module that computes, for a time-ordered 0/1 sequence, the number of runs and the exact conditional lower tail P(R <= r_obs | the counts of ones and zeros) in big integers, with the decision tail <= level; and the median exceedance indicator of a score sequence. No consumer in this lot (L2-3 wires it in the class policy import guard). No served text, no served byte moves.

## 1. Scope

- **Files (closed list; the PR diff equals it)**:
  1. `packages/hikae/src/runs.ts` (new): `runsCount(bits)`, `runsLowerTailLeq(bits, levelDec)`, `medianExceedance(scores)`, types `Bits`, `RunsTail`.
  2. `packages/hikae/src/index.ts`: one export block (4 lines).
  3. `packages/hikae/test/runs.test.ts` (new): R-1 to R-4.
  4. `docs/G0-lot-w2-runs-diagnostic.md` (this file; outside the R-25 pathspec `:(exclude,glob)docs/**/*.md`).
- **Contract of `runsLowerTailLeq`**: bits must be 0 or 1 (else `RangeError`); levelDec a plain decimal `0.d...` strictly inside (0, 1) (else `RangeError`). No ones or no zeros: `{ empty: true, runs, ones, zeros }` (no tail, no decision; the caller reads it as not a pass). Else `{ empty: false, runs, ones, zeros, tailNum, tailDen, reject }` with tailDen = C(n, ones) (all arrangements, unreduced), tailNum = the arrangements with at most `runs` runs, reject = tailNum / tailDen <= level, compared as tailNum x levelDen <= levelNum x tailDen.
- **Formula** (Wald and Wolfowitz 1940, standard definition, no fiche; every value recomputed): with n1 ones and n0 zeros, the arrangements with r = 2k runs number 2 C(n1 - 1, k - 1) C(n0 - 1, k - 1), with r = 2k + 1 runs C(n1 - 1, k) C(n0 - 1, k - 1) + C(n1 - 1, k - 1) C(n0 - 1, k).
- **Median exceedance**: 1{s > m}, m = the ceil(n/2)-th smallest score; ties at m count as 0; the empty sequence gives the empty sequence; a NaN score is refused.
- **Out of scope**: the binomial core and its parser (L2-1), the risk-controlling rank (L2-2), the guard clauses that call this module and the reading of `empty` on the miss and median indicators (L2-3), any served text (L2-4), `schemas/**`, `packages/contracts/**`, any existing test.

## 2. Tests (killers in the closed format of `scripts/red-proof.mjs`, trunk; line numbers at the freeze)

Category: new-module (ADR-METHODE-2 D2 as amended at cp-1, row M-4: a new module is admitted red by import at base with an intention mutant attached; the killer is that mutant). Oracles are computed in the test, never read back from `runs.ts`.

| # | Test | Oracle | Cat. | Killer |
|---|---|---|---|---|
| R-1 | `runs_lower_tail_exact_against_enumeration` | every 0/1 sequence of length 1 to 16 (runs from the bit transitions of an integer): tailNum and tailDen equal the enumerated counts, the decision at 0.05 equals the enumerated share; worksite G0 M-20 thresholds 35, 82, 146, 135, 286 at 0.05 (rejected at the threshold, kept one run above); Swed and Eisenhart 1943 Table I lower critical values at 0.025 for (5, 5) 2, (10, 10) 6, (12, 12) 7, (15, 15) 10, (20, 20) 14, (2, 20) 2, (5, 10) 3, (8, 12) 6 (recomputed with exact rationals before pinning); tail non-decreasing in r and equal to 1 at the largest count (613 points, 306 ones) | new-module | `// killer: packages/hikae/src/runs.ts:79 ROR "r <= runs" -> "r < runs"` |
| R-2 | `runs_empty_and_fail_closed` | ADR D6: all zeros, all ones, one element, the empty sequence -> `empty`, no `reject` key, never a pass; median indicator with no ones (all tied, or the top half tied at the median) -> not a pass; alternating sequence -> a pass at 0.99 | new-module | `// killer: packages/hikae/src/runs.ts:75 CONST "empty: true, runs" -> "empty: false, runs"` |
| R-3 | `runs_median_exceedance_with_ties` | counting definition of the ceil(n/2)-th smallest score; hand cases (even, odd, ties at the median); 129 zeros then 100 distinct values -> 129 zeros then 100 ones, 2 runs, rejected; seeded grid (LCG, seed 20260930, values 0 to 4, lengths 1 to 40, 25 draws each) | new-module | `// killer: packages/hikae/src/runs.ts:93 ROR "s > m" -> "s >= m"` |
| R-4 | `runs_refuses_bad_inputs` | levels 0, 0.0, 0.000, 1, 1.0, empty, `0.`, `.05`, `5e-2`, trailing blank, negative, `0.1.0`, NaN refused; 0.05 and 0.050 give the same result; n1 = n2 = 10 at 7 runs, tail 4735/92378 = 0.05126: kept at 0.0512, rejected at 0.0513; a bit other than 0 or 1 and a NaN score refused | new-module | `// killer: packages/hikae/src/runs.ts:48 SDL "if (num === 0n)" -> ""` |

Expected counts: new-module 4, F2P 0, pins 0. Every killer applied alone reddens its test (measured at the freeze; file restored, sha256 equal).

## 3. R-25

Worksite G0 estimate: runs.ts 80, index.ts 2, runs.test.ts 190, about 270 ascending, about 285 measured. Planned here: runs.ts 94, index.ts 4, runs.test.ts 174, 272 insertions. Bound 547 per lot, CI 1 205; measured at the freeze by `r25()` of `scripts/oracle/r25.mjs` (trunk) on the `ci.yml` pathspec.

## 4. Risks

- R-3 (worksite): the test is against one alternative (positive serial dependence of the indicator); passing it never establishes exchangeability. The module doc comment says so; no served text in this lot.
- R-4 (worksite, big-integer cost): the tail at n = 1 000 sums about n products of binomials of a few hundred digits; measured in R-1 (613 calls at n = 613 inside the test, whole file under 1 s).
- R-9 (worksite): two checks at 0.05 refuse up to a 0.10 share of i.i.d. calibrations; admission cost only, decided in L2-3.
- Parallel parser: L2-1 ships a decimal parser; this lot keeps a private minimal one (plain `0.d...` only). To be merged into the L2-1 parser in a later lot (declared deviation D-2).
- Bytes: new files English, ASCII, no TAB, no backslash (the level pattern uses a character class), LF, final newline.

## 5. Declared deviations from the worksite G0

- D-1: a fourth test R-4 (refusals of the private level parser and of bad bits or scores); the worksite G0 lists R-1 to R-3 only.
- D-2: private level parser in `runs.ts` instead of the L2-1 parser (the lots run in parallel; deduplicate after both merge).
- D-3: `empty` is carried as the discriminant `empty: true` of the result object (with runs and counts), not a bare literal, so that the caller can report the counts; the non-empty result carries `tailNum`, `tailDen` (unreduced, C(n, ones)) and `reject`.
- D-4: enumeration up to length 16 (worksite G0: 12).
- D-5: Swed and Eisenhart 1943 critical values added as a textbook oracle in R-1 (recomputed, since no fiche carries the table).
