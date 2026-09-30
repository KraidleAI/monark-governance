# G0 - lot w4-empty-set-reason (worksite 4 of the RECHERCHES alignment, lot L4-1, P3): an empty conformal set on the BYO set path abstains with `intent_not_in_region`

- **Source plan**: RECHERCHES worksite 4 G0 v3, `KraidleAI/recherches` commit `32aff95618048098a53a36e0a43833ce10bfd8c9`, file `decisions/0002-G0-worksite-4-server-imposed-risk-parameters.md` (sha256 `027ec0184a50afa6ff0e3866f3ecdb9e5a6cfc9d54f292fa036459d72c6e58ed`), sections 4.1 (L4-1), 5 (E-1, E-3, E-4), 6 (R-25), 8 (risks), 11 (process). This file extracts the L4-1 part only.
- **ADR**: `decisions/0002-ADR-draft-server-imposed-risk-parameters.md` v3 at the same commit `32aff95` (sha256 `48976030793be4652001fa4baa5c5d1eba158c21d26625cc3b7d914eeae978eb`), decision D8 (P3), validated by the investor. ADR title on the PR: "ADR-M005 D5 K-4(d) amendment 2026-09-30 (class policy v1)".
- **Branch**: `lot/w4-empty-set-reason`, from `main` @ `4e9e6657497607c11540facebff02a8834d3fd7c` (the base; every existing-code anchor below is on this sha). The worksite G0 anchors are on the same sha: 0 line drift measured on the files of this lot (gate.ts sha256 `4cc340e2...cffb9a`, verdict.ts `7f2a5fe3...763b801`, both equal to the worksite G0 section 1).
- **Intention (one)**: on the BYO set path (`byoVerdict`, set mode, `apps/harness/src/tools/gate.ts` l.448-465 at base), an empty conformal set C gives a verdict `abstain = true`, `reason = "intent_not_in_region"`, the region stays the empty set and `qhat` stays the number (distinct from `under_calib`, whose `qhat` is `null`). Never `covered`. Declared semantics: `abstain = 1{|C| > tau or |C| = 0}`.
- **Not touched**: `btcDirVerdict` (it leaves with the retired class in L4-6); the L3 gate (`packages/hikae/src/l3-gate.ts`, already ABSTAIN `intent_not_in_region` on an empty set, l.97-98); `schemas/**`, `packages/contracts/**` (0 byte; `intent_not_in_region` is already in `COVERAGE_REASONS`, `packages/contracts/src/enums.ts` l.11); no new reason literal; no `schema_version` bump.
- **Served text (M-8)**: none moves. No tool description, no registry entry, no version change. Pinned empty-set fixtures read `upstream_timeout` (`fixtures/07-...`), `under_calib` (`fixtures/09-...`) and `under_calib` (`fixtures/h5-e2e-trace.json` step 3); none reads `covered` (re-measured on the base). Merge triggers no deploy.

## 1. Closed file list (the PR diff equals this list)

| File | Change |
|---|---|
| `docs/G0-lot-w4-empty-set-reason.md` | this file (new; excluded from R-25 by `:(exclude,glob)docs/**/*.md`) |
| `apps/harness/src/tools/gate.ts` | BYO set branch (l.454-464 at base): `empty = labels.length === 0`; `abstain = empty or abs(C) > tau`; reason `intent_not_in_region` when empty; the `byoVerdict` doc comment l.378 updated |
| `packages/hikae/src/verdict.ts` | comment l.9-12 only (declared semantics) |
| `packages/hikae/test/l1.test.ts` | comment only, inside l.37-50: one line added above `empty_set_not_allow` (l.42), outside the test body, so the test is not judged by `red-proof` |
| `apps/harness/test/gate-empty-set.test.ts` | new: E-1, E-3, E-4 |

## 2. Tests (killer line in the closed `red-proof.mjs` format, on the line above each `test(`)

| # | Test | Oracle | Cat. | Killer |
|---|---|---|---|---|
| E-1 | `byo_set_empty_region_abstains_intent_not_in_region` | ADR D8; ADR-M009 item 8: BYO set, scores 0.1..1.0 (n 10), alpha 0.1, nMin 5 -> p = ceil(11 x 0.9) = 10, qhat 1.0; candidates A 1.5, B 2.0 -> C empty: verdict labels [], abstain true, reason `intent_not_in_region`, qhat 1 (a number); gate ABSTAIN `intent_not_in_region` for tau 0 and 1 | F2P | `// killer: apps/harness/src/tools/gate.ts:457 ROR "labels.length === 0" -> "labels.length < 0"` (new code, anchored at the freeze) |
| E-3 | `nonempty_set_verdict_semantics_unchanged` | ADR D8 (declared semantics), ADR-M002 D5: abstain = 1{abs(C) > tau} for abs(C) in {1, 2, 3} (BYO, 4 candidates), tau in {0..4}, reasons `covered` / `set_too_large`, including abs(C) = tau | pin | `// killer: apps/harness/src/tools/gate.ts:458 ROR "labels.length > params.tau" -> "labels.length >= params.tau"` (`<before>` present at base on l.455) |
| E-4 | `empty_set_never_commits_at_l3` | L3 order (`l3-gate.ts` l.4-19, l.97-107), `gate()` called directly: empty set, tau in {0, 1, 100}, B large (1e9), clock open -> never COMMIT, always ABSTAIN `intent_not_in_region` | pin | `// killer: packages/hikae/src/l3-gate.ts:97 CONST "!intentInRegion(input.intent, region)" -> "false"` (existing code, base anchor) |

- Expected counts: F2P 1, pins 2.
- F2P proof: E-1 is run on the base tree (new test file only) before the fix and must be red by an assertion failure; then green after the fix. Pins: green at base and at the freeze; each named killer applied alone kills its test; the file is restored and checked by sha256.

## 3. R-25 estimate (bound 547 ascending per lot; CI pathspec `.github/workflows/ci.yml` l.79)

| File | Ascending |
|---|---|
| `apps/harness/src/tools/gate.ts` | about 10 |
| `packages/hikae/src/verdict.ts` | about 2 |
| `packages/hikae/test/l1.test.ts` | about 1 to 4 |
| `apps/harness/test/gate-empty-set.test.ts` | about 100 |
| Total | about 120 (projected measured about 130) |

Cut rule (worksite G0 section 6): above 547 at the freeze, the test file splits first; tests are never compacted.

## 4. Risks

- **R-a, compatibility (worksite R-2).** A BYO set caller whose candidates all score above qhat got `abstain false, covered` on the verdict and already an ABSTAIN `intent_not_in_region` on the gate decision; only the verdict fields change. No committed class is affected.
- **R-b, killer format.** The worksite G0 writes the E-4 killer as `SDL ... -> "false"`; the closed format admits SDL only with an empty `<after>`. The same mutation is written here as `CONST` (declared deviation, section 5).
- **R-c, red-proof and pins.** `red-proof.mjs` on the trunk refuses a test green at base ("self-confirming"); E-3 and E-4 are pins, counted apart (worksite 1 Q-1 ruling), proven by their killers.
- **R-d, language and bytes (worksite R-6).** New and changed lines: English, ASCII, no TAB, no backslash, LF, final newline; no `FR_WORDS` word, no `vocab-banned.json` term.

## 5. Declared deviations

- D-1: E-4 killer operator `CONST` instead of `SDL` (R-b).
- D-2: the `l1.test.ts` comment is added above the test declaration (l.42), not inside the body (l.43-52 at base), so that `empty_set_not_allow` stays unjudged; the existing body comment l.49-50 stays true (the L3 gate abstains on an empty set).
- D-3: the `byoVerdict` doc comment (gate.ts l.378) is updated in the same file, since its "set: abs(C) > tau => set_too_large else covered" no longer holds for an empty set.
