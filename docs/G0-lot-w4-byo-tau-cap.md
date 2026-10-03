# G0 - lot w4-byo-tau-cap (worksite 4 of the RECHERCHES alignment, lot L4-5: BYO set-mode tau cap)

- **Source**: extracted from the worksite G0 `recherches/decisions/0002-G0-worksite-4-server-imposed-risk-parameters.md` (sha256 `027ec0184a50afa6ff0e3866f3ecdb9e5a6cfc9d54f292fa036459d72c6e58ed`), sections 4.1 (L4-5), 5 (tests B-1 to B-3), 6 (R-25), 8 (R-2, R-4). Decision record: ADR v3 `recherches/decisions/0002-ADR-draft-server-imposed-risk-parameters.md` (sha256 `48976030793be4652001fa4baa5c5d1eba158c21d26625cc3b7d914eeae978eb`), KraidleAI/recherches commit `32aff95` (investor validated v3): D2 BYO row, D3 (tau cap, error text, check order), D5 (BYO), D9 (release).
- **Branch**: `lot/w4-byo-tau-cap`, from workshop `main` @ `4e9e6657497607c11540facebff02a8834d3fd7c` (the worksite G0 base; no drift: `apps/harness/src/tools/gate.ts` sha256 `4cc340e29c3f9224917efa2a75fd63cec684e49c1a3acf7f5b7d07cf42fffb9a`, 811 lines, as in the worksite G0 section 1).
- **Intention (one)**: on the BYO path in `set` mode, `params.tau` must be at most the number of candidates minus 1; a larger tau is a named tool error (400 through `HarnessToolError`). A COMMIT on the whole candidate list is vacuous (the case the split method refuses, ADR D3). Interval mode is not capped (ADR D5). tau = 0 stays legal.

## 1. Scope

- **Files (closed list; the PR diff equals it)**:
  1. `apps/harness/src/tools/gate.ts`: one helper `assertByoSetTauCap` after `validateCalibration` (l.373-388 at freeze), one call in `byoVerdict` after the yhat type checks (l.410 at freeze).
  2. `apps/harness/test/gate-byo-tau-cap.test.ts` (new): B-1 to B-3.
  3. `docs/G0-lot-w4-byo-tau-cap.md` (this file; process artefact, outside the R-25 pathspec `:(exclude,glob)docs/**/*.md`).
- **Error text (ADR D3, BYO set mode)**: `byo 'set' mode requires params.tau = <k - 1> or smaller (the number of candidates minus 1, so a COMMIT is never on the whole candidate list), got <x>`; numbers printed by `String(value)` (R-5). It names the required value and the way out (a smaller tau).
- **Served or pinned text**: the 400 text is served on the wire (a 400 body on HTTP, an `isError` result on MCP) but it is not a pinned served text: the ADR D3 pinned prefixes are the class-level and key-level forms only; no served description, param description (`schema-projection.ts` l.121), README, h5 trace (`fixtures/h5-e2e-trace.json`: 0 BYO set step) or site data carries it (grep at base). Worksite G0 section 10 lists no served text for L4-5. Consequence (R-4, ADR D9): the description does not declare the cap until R1 or L4-4; MONARK does not deploy in that window.
- **Check order (ADR D3)**: `validateHarnessParams`, then `validateCalibration` (B-3 label checks), then the yhat type check, then the cap, then `splitQuantile`. The cap is independent of the scores, so it fires also when the calibration would be `under_calib`.
- **Out of scope**: committed set classes (none after L4-6), the description and param texts (L4-4), `schemas/**`, `packages/contracts/**`, `packages/hikae/**`, any existing test file.

## 2. Existing callers (measured at base, `git grep` outside `docs/**`)

- BYO `set` calls: `apps/harness/test/gate.test.ts` l.196, l.209 (3 candidates, tau 1), l.290 (btc-dir plus calibration, 2 candidates, tau 1, refused earlier by the anti-override guard), l.307 (helper of `gate_byo_set_label_validation`, 5 calls), l.338 (1 candidate, tau 1); `apps/harness/test/registry.test.ts` l.207 (2 candidates, tau 1). Scripts, h5 trace, site data, skills: 0.
- Calls with tau >= number of candidates: 3 (l.338: 1 candidate, tau 1; l.307: the `[""]` call, 1 candidate, tau 1, and the `[]` call, 0 candidate, tau 1). All three assert a `HarnessToolError` raised before the cap (yhat type, label check, empty list); their outcome does not change. No existing test is rewritten.

## 3. Tests (killers in the closed format of `scripts/red-proof.mjs`, line numbers at the freeze; l.361 is the same line at base)

| # | Test | Oracle | Cat. | Killer |
|---|---|---|---|---|
| B-1 | `byo_set_tau_cap_names_required_value` | ADR D3, advisor-conformal 1.3: 3 candidates: tau 2 -> a decision (COMMIT on a 2-label set); tau 3, 7 and 2.5 -> 400 with the exact text; 1 candidate: tau 0 -> a decision, tau 1 -> 400 | F2P | `apps/harness/src/tools/gate.ts:382 ROR "params.tau > candidates.length - 1" -> "params.tau > candidates.length"` |
| B-2 | `byo_set_tau_cap_after_label_validation` | ADR D3 order: a label containing a pipe with tau 5 -> the B-3 label text, not the tau text | pin (new code order) | `apps/harness/src/tools/gate.ts:361 SDL "must not contain" -> ""` |
| B-3 | `byo_interval_mode_ignores_tau` | ADR D5: interval mode, tau 9 -> a decision | pin | `apps/harness/src/tools/gate.ts:380 SDL "cal.mode !==" -> ""` |

Expected counts: F2P 1, pins 2.

## 4. R-25

Estimate (worksite G0 section 6): gate.ts 10, test 70, about 80 ascending, about 85 measured. Planned here: gate.ts 17 insertions (helper with its doc comment, plus the call), test about 90. Bound 547 per lot, CI 1 205; measured at freeze by `r25()` of `scripts/oracle/r25.mjs` (trunk) on the `ci.yml` pathspec.

## 5. Risks

- R-2 (compatibility): an external BYO set caller with tau >= number of candidates now gets a 400; the text names the value. Not measurable (stateless server).
- R-4 (served-text window): the source enforces a rule the served description does not declare yet; no deploy until R1 declares it (ADR D9) or L4-4.
- R-5 (float texts): tests build the expected text with `String(value)`.
- R-6 (bytes): new lines ASCII, no TAB, no backslash, LF, English.
