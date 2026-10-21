# G0 — W2B-GUARD-ADMISSION-1: the import guard admits the rows of wave 2b

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-17. Base: trunk `lot/etude-suite` at `e041c563` (#322, the reader
  of the wave 2b registry in the quarter counts). Branch `recherches/w2b-guard-admission-1`, one pull request.
- **The item**: docs/ETAT.md l.1993-1999 at the base: « l admission des lignes de la vague 2b à la garde », refused today at
  `policy-guard.ts` l.43 and l.56-57 and `policy-wave2.ts` l.60; the class entry check of l.48 changes only « si la base par horizon
  passe dans l entrée de classe ».
- **The rule implemented**: the frozen wave 2b registry format, recherches `kata/registry/FORMAT-wave2b.md` (frozen at `23a70607`,
  sha256 `b994d2b66c86565b753791a659df657c9ee3b5344c7622e221fe740df55d02f7`), section « Admission at the guard », l.148-161: the
  projection columns of a wave 2b row (l.150) and the six refusals by name (l.152-159). Zone row: recherches `coordination/ZONES.md`,
  row W2B-GUARD-ADMISSION-1 (`a84a6ff3`).
- **No series byte, no registry file read.** Every test builds its rows from the seeded synthetic registry of block B1
  (`apps/harness/test/helpers/synthetic-registry.ts`), as the wave 2 tests do.

## 1. What this lot delivers

- `apps/harness/src/policy-wave2.ts`: the wave 2b mark and refusals 1 to 4 (`wave2Mark`, appended after the last line, so no line that
  a mutation line names moves), refusal 6 in the calib_parent chain, called at l.57, and the attempt 1 of a wave 2b row in that chain (l.60); l.4, l.57 and l.60 in place.
- `apps/harness/src/policy-guard.ts`: lines changed in place, none added nor removed (mutation lines of other test files name l.94,
  l.118 and l.130): l.15 (import), l.42 (the mark and refusals 1 to 4, before any other check of a wave 2 row), l.43 (wave and kind
  only; the fit_sha256 condition goes to refusal 1), l.56 (the test_delta of a wave 2b row: the base of its horizon), l.57 and l.59
  (the A-1 spend and the hour-of-week table held on every row but a wave 2b row, which refusals 2 and 4 hold), and the header (l.7).
- `apps/harness/test/policy-wave2b.test.ts` (new): one test per refusal and one admission test, each with its mutation line.
- `test/test-counts.json`, `test/test-names.json`: by `node scripts/test-count-floor.mjs write` after `npm run test:main`.
- **Not changed**: `apps/harness/src/policy-classes.ts` (section 3, D-5), any schema, any served table, the policy row's closed list of
  60 keys, `GuardPins`.

## 2. Sources read at `e041c563` (file:line)

- `apps/harness/src/policy-guard.ts` l.42 (`w2`), l.43 (a wave 2 row needs a null `fit_sha256`: « the wave 2 guard admits wave 2 core
  band rows only (ADR 0006 D1; wave 2b waits for P0-2) »), l.46-47 (n on CALIB-2, bridge and fwd, `tail_frac`), l.48 (the class entry:
  `cls.test_delta === KATA_BASE_DELTA`), l.52 (the source against the pins: `r.source.registry_file === pins.registryFile &&
  r.source.registry_sha256 === pins.registrySha256 && r.source.generator === pins.generator`), l.53 (`trial_id` with `W2-CALIB`),
  l.56-57 (`spendDelta(KATA_BASE_DELTA, at)`; attempt `(w2 ? 2 : 1)`, initial and none at attempt 1 only), l.59 (`hour-of-week`, 168
  or 42 values), l.61-64 (n_min and k_star at `delta`), l.66-68 (block bounds, u_test), l.82-89 (tails, reasons, veto order), l.98
  (`miss_bound` at `delta`).
- `apps/harness/src/policy-wave2.ts` l.26-43 (`wave2Admission`), l.53-64 (`guardCalibChain`; l.60: `r.calib_attempt === (r.source.wave
  === 2 ? 2 : 1)`).
- `apps/harness/src/policy-classes.ts` l.10 (`KATA_BASE_DELTA = "0.05"`), l.22 (every class entry at `test_delta: KATA_BASE_DELTA`).
- `apps/harness/src/policy-projection.ts` l.75-81 (`ProjectionInputs`: `registryFile`, `registrySha256`, `generator`), l.117 (the
  projection writes them into `source`): **how the pin of a registry reaches the guard today**. The guard holds one registry per
  table: `GuardPins` extends `ProjectionInputs` (policy-guard.ts l.17), and l.52 binds each row's `source` to that pin;
  `guardKataTable` checks the bytes against `registrySha256` first (l.116, `assertRegistryPinned`). No other place names
  `wave2.json`: the core rows are told apart by `source.wave` 2 alone.
- `packages/contracts/src/policy-table.ts` l.69 (`scale_table.kind` is `hour-of-week` or `us-profile` already), l.70 (`fit_sha256`
  null or hex64), l.122 (`scale_table.sha256` is the canonical digest of its values).
- The mutation lines that name lines of the three source files (`git grep "killer: apps/harness/src/policy-"` at the base): 42 lines in
  `policy-guard.test.ts`, `policy-wave2.test.ts`, `policy-retire.test.ts`, `kata-path.test.ts` and `test/kata-quarter-vectors.test.ts`.
  Each keeps its line and its text once on it (`test/killer-lines.test.ts`).

## 3. Decisions

- **D-1, the mark.** A row is a wave 2b row iff `source.wave` is 2 and `source.registry_file` is `"wave3.json"`, the name the format
  writes (l.150, l.154). Its pin reaches the guard as the pin of `wave2.json` does: by `GuardPins.registryFile` and
  `registrySha256`, which l.52 holds on every row and l.116 on the bytes. A wave 2b table is guarded with pins whose `registryFile` is
  `"wave3.json"`; nothing is added to `GuardPins` (Q-1).
- **D-2, refusal 1** (l.154), first of every wave 2 check (l.42): a wave 2 row with the mark has `scale_table.kind` `"us-profile"` and a
  non-null `fit_sha256`; without it, neither. Its text keeps the words `wave 2 core band rows only`, which an existing test reads
  (`policy-wave2.test.ts` l.98). l.43 then holds the wave and the band kind only.
- **D-3, refusals 2 to 4** (l.155-157), right after refusal 1 on a wave 2b row: attempt 1, `initial`, `none`, `test_delta` `"0.025"` at
  1h and `"0.05"` at 4h, exact strings; `kata_id` one of `har-rv15-sp-v1`, `garch11-sf-sp-v1`, `ewma-vol-sp-v1` and `w` 168 / 42,
  1 to 720 / 1 to 180, 101; `scale_table.values` 26 at 1h and 14 at 4h, each a number above 0. n_min, k_star and miss_bound are held at
  that `test_delta` by the clauses that hold them on every row (l.63, l.64, l.98), with `delta` the base of the horizon on a wave 2b row
  (l.56): one rule, each column named by its clause (Q-2). The windows are compared by explicit comparisons, never by a lookup in an
  object (a `kata_id` `"constructor"` would find a prototype member).
- **D-4, refusal 5** (l.158): nothing is added; a wave 2b row runs every clause of a core band row (l.44-112), with l.57 and l.59
  replaced on it by refusals 2 and 4.
- **D-5, the class entry** (`kata/registry/FORMAT-wave2b.md` l.155: « the class entry keeps its `test_delta` »; l.161: « does not change »): `policy-classes.ts` is not
  touched, and l.48 still compares the class's `test_delta` with the base 0.05.
- **D-6, refusal 6** (l.159), in `guardCalibChain` before the chain's own check (l.57): a cell that holds a wave 2b row and more than one
  row, or whose only row is not current, is refused by name; l.60 takes attempt 1 on a wave 2b row.
- **D-7, core and wave 1 rows held as today**: every clause keeps its outcome on a row without the mark (a wave 1 row never reads the
  mark; a wave 2 row without it runs the same conditions, refusal 1 holding what l.43 and l.59 held). Measured by the whole `test:main`
  at the base and at the head, each test's outcome compared (section 7).

## 4. Questions (default in brackets; each default built here)

- **Q-1** — The mark: the bare name `"wave3.json"` that the format writes for `source.registry_file`, or a path such as
  `kata/registry/wave3.json`? [the bare name; a projection that writes a path would need a dated line of the format.]
- **Q-2** — n_min, k_star and miss_bound of refusal 2: named by the clauses that hold them on every row, at the 2b `test_delta`, rather
  than by a clause of their own? [yes.]
- **Q-3** — A wave 1 row whose `source.registry_file` is `"wave3.json"`: the format names wave 2 rows only (l.154; l.12: every row of
  `wave3.json` is a wave 2 row). [held as today: not refused by the mark; l.52 binds it to its table's pin, and the projection of that
  file writes wave 2 rows only.]
- **Q-4** — The order: refusal 1, then 2, 3, 4, before any other check of the row; refusal 6 before the chain's own check. [yes.]

## 5. Left out

The projection of `wave3.json` rows and the table path for them (`readRegistry` and `projectCell` read the core format; so
`guardKataTable` on a wave 2b table waits for that reader), the reader checks of the format (l.172-185), a retire list on a wave 2b
cell, any served table, schema, `tools/` or `packages/` file, docs/ETAT.md (the item is closed by MONARK) and the docs/PAROXYSME
register.

## 6. Size and tests

- **Estimate before the code** (R-25 in the CI form, docs and the two test lists excluded): ~40 lines in `policy-wave2.ts`, 7 lines
  changed in place in `policy-guard.ts` (14 insertions and deletions), ~170 in the new test file: ~225, ~290 at +30 %, under 547.
- **Tests** (`apps/harness/test/policy-wave2b.test.ts`): `w2b_guard_admits_a_wave2b_row`, then one test per refusal 1 to 4 and 6, each
  red at the base by an assertion (the trunk refuses every 2b row, under other names), each with its mutation line above it.
- **Measured at the head of the code** (`a14b0f3a`): R-25 in the CI form (`scripts/oracle/r25.mjs` against `e041c563`), 184 changed
  lines (174 insertions, 10 deletions), under the lot bound of 547; the content count 0.

## 7. Verification (offline, `offline.mjs --no-egress`, Node 24.21.0, Linux; 0 refused connection in every run)

- **The whole `test:main`**, at the base and at the head, each test's outcome compared by name: base 3276 tests (3252 pass, 24
  skipped), head 3282 (3258 pass, 24 skipped), 0 fail on either side; no outcome of the base differs at the head; the six new tests
  are the only difference. `node scripts/test-count-floor.mjs write`, then `node scripts/test-count-check.mjs --base e041c563…`:
  320 files, 3282 tests, equal to both records, 0 drop.
- **`scripts/red-proof.mjs --base e041c563… --gel <the tree> --draw 6`**: 6 judged, 6 F2P (red at the base by an assertion, green at
  the head), the 6 mutation lines drawn, 6 killed by an assertion, each file restored by sha256. A first run found the mutation line
  of the chain test (`policy-wave2.ts` at the head, the condition `chain.length !== 1 ||` removed) still green: no case had attempt 1 current with a second
  attempt after it; that case was added, and the second run killed it.
- **The six existing mutation lines on the lines changed in place** (`policy-guard.ts` l.43, l.56, l.57; `policy-wave2.ts` l.60,
  three lines): each applied alone at the head with only its test run: 6 red by an assertion, the file restored by sha256.
- **Anchor checker** (`verifie-ancres.mjs`, every killer line of the tree, `--ref e041c563…`): 2593 killer lines, 2587 ANCRE, 6
  DERIVE, 0 PERDU; the 6 DERIVE are exactly the six lines above (the text they name is still once on the same line, which changed in
  place; the proposed anchor is the same line). `test/killer-lines.test.ts` green.
- **Gates**: `npx tsc --noEmit` clean; eslint on the three touched code files clean; `lint:ratchet` 69/69 (the ceiling, unchanged);
  `lang:gate`, `gate:vocab` and `export:check` OK. The new tests write no path, so the case-folding check has nothing to fold.
