# G0 - lot w2-binomial-core (worksite 2 of the RECHERCHES alignment, lot L2-1: exact binomial core)

- **Source**: extracted from the worksite G0 `recherches/decisions/0004-G0-worksite-2-commit-error-binomial-bound.md` v3 (sha256 `78947e2b2247cacd5d69ee0104bd55ce72a4aee50ed2722110b6980a0a36a43a`), sections 2 (M-1 to M-5, M-17 to M-19), 6 (L2-1), 6.1 (R-25 and cut rule), 7 (tests B-1 to B-7), 8 (R-4, R-8). Decision record: ADR v3 `recherches/decisions/0004-ADR-draft-commit-error-binomial-bound.md` (sha256 `c70ed749f2ca17913660340d2804cce02be1a6e2739dce6a817dfe24a4f65726`), KraidleAI/recherches commit `d894c22` (validated by the founder 2026-09-30): D3 (rule, published bound, arithmetic), D4 (refusals, floor n0), D5 (spend).
- **Branch**: `lot/w2-binomial-core`, from workshop `main` @ `8968695698d5c1affe1244ae7392e3bc7a927142` (the base named by MONARK checkpoint-1 for L2-1).
- **Intention (one)**: a pure engine module that decides P(Bin(n, a) <= k) <= delta in exact big-integer arithmetic and derives from it k*, n0, the published bound U(n, k*, delta) at 7 decimals rounded up, the four-decimal rounding up and the test_delta spend. No served text, no consumer yet (L2-2 is the first); its merge triggers no deploy.

## 1. Scope

- **Files (closed list; the PR diff equals it)**:
  1. `packages/hikae/src/binomial.ts` (new): `parseUnitDecimal`, `parseAlpha`, `parseTestDelta`, `binomCdfLeq(n, k, a, delta)`, `riskControlMaxExceedances(n, alphaDec, deltaDec)`, `zeroErrorFloor(alphaDec, deltaDec)`, `missUpperBound(n, kStar, deltaDec)`, `ceilDecimal4(ratio)`, `spendDelta(baseDec, attempt)`, type `Ratio`.
  2. `packages/hikae/src/index.ts`: one export block.
  3. `packages/hikae/test/binomial.test.ts` (new): B-1 to B-7.
  4. `docs/G0-lot-w2-binomial-core.md` (this file; process artefact, outside the R-25 pathspec `:(exclude,glob)docs/**/*.md`).
- **Refusals (ADR D4)**, each a `RangeError`: a string that is not `0.` followed by digits only (sign, exponent, second point, blank, empty, leading `.`), zero, 1 or more; alpha with more than four decimals once trailing zeros are dropped; test_delta at or above 0.25; calib_attempt outside the integers 1 to 4; a non-integer or negative n or k; kStar >= n in `missUpperBound`.
- **Arithmetic (ADR D3)**: delta.den x sum_{i <= k} C(n, i) a.num^i (a.den - a.num)^(n - i) <= delta.num x a.den^n; k* by increasing k; n0 by doubling then bisection on the same comparator at k = 0 (no logarithm); U by bisection on the integer grid m / 1e7, returning the smallest grid point whose tail is at most delta.
- **Out of scope**: `schemas/**`, `packages/contracts/**`, `l1-split.ts` (L2-2), the runs diagnostic (L2-1r), the harness and every served text (L2-3, L2-4).

## 2. Tests (killers in the closed format of `scripts/red-proof.mjs`, line numbers on the lot tree)

Category of every test: new-module (ADR-METHODE-2 D2 as amended: the base run cannot load `packages/hikae/src/binomial.ts`, a file the diff adds; the test imports it directly, not through `index.ts`, so the red is on the added file). The killer on the line above each test is its intention mutant. Oracles are computed in the test (closed forms in big integers, exact zero-miss rule) or taken from the worksite G0 tables, never from the module.

| # | Test | Oracle | Killer (formal line) | Extra mutants checked |
|---|---|---|---|---|
| B-1 | `binomial_cdf_exact_against_closed_forms` | k = 0: (1 - a)^n; k = 1: (1 - a)^n + n a (1 - a)^(n-1), exact, n in {1, 10, 170, 613}, a in {0.01, 0.1, 0.5}; true at the tail, false just below; k > n reads the tail as 1; M-5: P(Bin(613, 0.10) <= 60) = 0.46419 (0.4642); M-6: 0.99^170 in (0.1811, 0.1812] | `packages/hikae/src/binomial.ts:80 ROR "i <= top" -> "i < top"` | `binomial.ts:86 ROR "<=" -> "<"` |
| B-2 | `binomial_zero_error_floor_table` | M-1: 22, 29, 45, 59, 114, 149, 230, 299; M-19: 36, 42, 49 and 368, 437, 505; n0 meets the rule and n0 - 1 does not (exact check in the test); boundary 0.5^3 = 0.125 gives 3 | `packages/hikae/src/binomial.ts:86 ROR "<=" -> "<"` | none |
| B-3 | `binomial_kstar_matches_synthesis_table` | M-4: 5, 12, 38 with the tails at k* and k* + 1 (0.05758, 0.11716; 0.03205, 0.05656; 0.03934, 0.05502) bracketed at half a unit; split thresholds 9, 19, 49 larger; M-5: 48, 51; M-6: none (-1); M-3: k* >= 1 from 473 and 388, k* >= 2 from 628 and 531 | `packages/hikae/src/binomial.ts:96 CONST "k + 1" -> "k"` | none |
| B-4 | `binomial_upper_bound_at_kstar_rounded_up` | M-2, M-5, M-6, M-17 tables (U(170, 0, 0.05) = 0.0174676, U(170, 0, 0.10) = 0.0134534, U(299, 0, 0.05) = 0.0099692, U(613, 48, 0.05) = 0.0985253, ...); at k = 0 the printed value meets the rule and one grid step below does not (exact, in the test), and it is within 1e-7 above 1 - delta^(1/n); four decimals (0.0892, ..., 0.0100) >= seven decimals and <= alpha | `packages/hikae/src/binomial.ts:137 CONST "fixed(hi" -> "fixed(lo"` | none |
| B-5 | `binomial_upper_bound_monotone` | U strictly decreasing in n (n 1 to 200, k 0) and in delta, strictly increasing in k (n 200, k 0 to 30); the comparator along a = j/100 turns true once (tail non-increasing in a) | `packages/hikae/src/binomial.ts:134 CONST "hi = mid" -> "lo = mid"` | none |
| B-6 | `binomial_refuses_out_of_range_inputs` | ADR D4: "0", "1", "-0.1", "NaN", "1e-1", "0.1.0", "" and ten more malformed strings refused (among them "0.1:" and "0./1", the characters next to the digit range); alpha "0.00001" refused; delta "0.25", "0.3" refused, "0.2499" accepted; "0.10" equals "0.1"; the public functions refuse the same; binomCdfLeq refuses a negative n, a non-integer k, a above 1 | `packages/hikae/src/binomial.ts:56 ROR ">=" -> ">"` | `binomial.ts:38 SDL "!dec.startsWith(" -> ""`; `binomial.ts:49 CONST "10000n" -> "100000n"` |
| B-7 | `binomial_ceil4_and_spend` | M-18: 61/614 -> 0.0994, 1/171 -> 0.0059, 49/614 -> 0.0799, 22/300 -> 0.0734, 85/1001 -> 0.0850, 99^170/100^170 -> 0.1812; ADR D5: spend 0.05, 0.025, 0.0125, 0.00625, attempt 5 refused; spend floors 29, 36, 42, 49 | `packages/hikae/src/binomial.ts:143 CONST "r.den - 1n" -> "0n"` | `binomial.ts:18 CONST "MAX_ATTEMPT = 4" -> "MAX_ATTEMPT = 5"` |

Expected counts: 7 new-module, 0 F2P, 0 pins.

## 3. R-25

Estimate (worksite G0 section 6.1): binomial.ts 170, index.ts 2, binomial.test.ts 320, about 490 ascending, about 510 measured. Planned here: binomial.ts about 160, index.ts 4, test about 235, about 400. Bound 547 per lot, CI 1 205; measured at freeze by `r25()` of `scripts/oracle/r25.mjs` (trunk) on the `ci.yml` pathspec. Cut rule (worksite G0 section 6.1), written before coding: above 547, B-5 and B-7 move to `lot/w2-binomial-core-b`, merged before L2-2; tests are never compacted.

## 4. Risks

- R-4 (big-integer cost): U at n 1 000 and k* 84 costs 24 comparator calls on numbers of about 7 000 digits; the whole test file runs in well under a second on Node 24. The guard of L2-3 runs once at import.
- R-8 (host): Node 24 required (`engines`); versions cited in the G1 log.
- R-11 (decimal reading): "more than four decimals" is read on the value (trailing zeros dropped), so "0.1000000" is alpha 0.1; the four-decimal bound stays at most alpha on every accepted alpha.
- R-12 (bytes): new files English, ASCII, no TAB, no backslash, LF, final newline; no regular expression in the module or the test.
