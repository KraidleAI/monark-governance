# G0 — RETIRE-READER-WAVE2-1: the retire list reader resolves attempt 2 of a wave 2 core cell

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-17. Base: trunk `lot/etude-suite` at `c6aa4907` (#324, the wave 2b
  admission at the import guard). Branch `recherches/retire-reader-wave2-1`, one pull request.
- **The item**: docs/ETAT.md l.2000-2005 at the base: « le lecteur de liste de retrait ne résout que l essai 1 ; il doit résoudre aussi
  l essai 2 d une case de vague 2. L essai courant d une entrée se lit à la date de sa liste : 2 seulement pour une liste datée au plus
  tôt du jour où l enfant devient courant ; une entrée reportée inchangée garde l essai 1 (`47939bb`, M-2). Cette règle tranche aussi le
  cas 2 de RETIRE-CHILD-ROW-1 » ; closing test `retire_list_attempt_2_on_a_wave2_cell`, « avec la chaîne où la parente est retirée
  d abord ». RETIRE-CHILD-ROW-1, l.2088-2096: case 2 is « l entrée de l essai 1 reprise après qu un enfant existe, qui heurte le
  contrôle d essai courant (`policy-retire.ts` l.75) », closed with this item; cases 1 and 3 stay there.
- **The rule implemented**, three sources, which say the same:
  - recherches `47939bb` (MONARK's final check of the wave 2 format), `coordination/pieces/2026-10-07-final-fw2-r1/fw2-r1-final.json`
    l.147-151, the finding M-2: points (1) and (2) of the item contradicted each other when the parent is retired before its child; its
    fix, l.151: « L'essai courant d'une entrée se lit à la date de sa liste. Il vaut 2 seulement pour une liste datée au plus tôt du jour
    où l'enfant devient courant (date épinglée, par exemple celle de la première version datée qui le porte). » and « Une entrée
    reportée inchangée d'une liste antérieure garde l'essai 1. », with the chain [L1 dated before, attempt 1 entry; L2 cumulative plus the attempt 2
    entry], admitted with both registries pinned. MONARK's decision: the message of the same commit,
    `coordination/messages/2026-10-07-MONARK-vers-RECHERCHES-final-fw2-r1.md` l.36-38.
  - The frozen format of the core registry, recherches `kata/registry/FORMAT-wave2.md` (frozen at `f781057`, sha256
    `a9db3fa9db81ce7dd000571a84f588b646cf0e3028fd9516da8ea6a6a895ea7c`, read at the mailbox head), l.186: « An entry of a retire list
    names the attempt of its cell that is current at the date of the list: for a core cell, attempt 2 in a list dated on or after the day
    its `wave2.json` row becomes current, attempt 1 before; an entry carried unchanged from an earlier list keeps its attempt. »
  - Its draft's note 3 (recherches `coordination/pieces/2026-10-07-format-w2/FORMAT-W2-draft.md` at `f781057`, l.313-317): the reader
    reads « the current attempt of an entry **at the date of its list**, on the pinned registries (`wave1.json` through `readRegistry`,
    `wave2.json` through the closed reader of E-1a) »; « A new entry is admitted on the current attempt at the date of its list only, and
    the status test reads that attempt's status »; (2) « the list key becomes (`task_class`, `cell_key`, `calib_attempt`); an attempt-1
    entry older than the child stays valid in later cumulative lists and covers row 1 only ».
- **Where « the day the child becomes current » is defined**: nowhere in code. FORMAT-wave2.md l.93 names the version (« the dated version
  of the policy table of the class that first publishes the child »), l.186 the day of a cell's row (« the day its `wave2.json` row
  becomes current »), and the fix of M-2 (l.151 above) makes it « date épinglée ». No file of the trunk computes it (`git grep -i
  "becomes current"` over apps, packages, scripts, tools and the G0 notes: no hit). ADR 0006 addendum 9 (recherches
  `decisions/0006-ADR-addendum-9-live-k-quarter-counts.md`, sha256 `8ae73cdb…`) l.9 says when a child row is first **counted** (« the
  first quarter Q_k whose start S_k is at or after the end of its calibration data »), not when it is current: that point is case 3 of
  RETIRE-CHILD-ROW-1 and stays there. So the day is an input of the reader, pinned by its caller (decision D-1).
- **No series byte, no registry file read.** Every test reads the seeded synthetic registry of block B1
  (`apps/harness/test/helpers/synthetic-registry.ts`) and the children and lists it builds itself.

## 1. What this lot delivers

- `apps/harness/src/policy-retire.ts`: `readRetireList` takes a fourth parameter, `children` (default: none, the reading of today), the
  attempt 2 of the wave 2 core cells, each with its registry status and the pinned day from which its row is current. Lines changed in
  place, none added nor removed before the end of the file (mutation lines name l.53, l.65, l.80 and l.83): the header (l.5-6), the doc
  comment (l.57), the signature (l.60), the sort key and its refusal, which names the three-part key (l.69), the cell's child (l.73),
  the current attempt at the list's date (l.75), the status of the attempt named (l.76). Appended after l.85: the types `ChildCell`
  and `ChildCells`, `attemptAt`, `carried` and `realDay`.
  l.75 and l.76 each hold two statements on purpose, so that no line moves under an existing mutation line (kept after the review).
- `apps/harness/test/policy-retire-wave2.test.ts` (new): the closing test and one test per new branch or refusal, each with its mutation
  line above it; the status test and the day test carry a second mutation line in their body (on l.76 and l.110).
- `apps/harness/test/policy-retire.test.ts` l.72: the expected sort refusal names the three-part key, as l.69 now does.
- `test/test-counts.json`, `test/test-names.json`: by `node scripts/test-count-floor.mjs write` after `npm run test:main`.
- **Not changed**: `apps/harness/src/policy-guard.ts` (its call l.118 passes no children, so the guard reads every list as today),
  `apps/harness/src/policy-wave2.ts` (no reader of wave 2 cells there to reuse: it holds the chain of policy rows, l.53-64, not a registry
  reader), `apps/harness/src/policy-table-file.ts`, any schema, any served table, any real retire list.

## 2. Sources read at `c6aa4907` (file:line)

- `apps/harness/src/policy-retire.ts` l.60-85 (`readRetireList`): l.69 sorts by (`task_class`, `cell_key`) with no repeated cell; l.71
  resolves each entry through `readRegistry(registryBytes)`; l.75 « `e.calib_attempt !== c.calibAttempt` »; l.76 the status of the wave 1
  cell; l.79 `LIVE_N_MAX[c.horizon]`; l.82-83 the cumulative rule, by canonical writing.
- `apps/harness/src/policy-projection.ts` l.43 (`calibAttempt: lit([1] as const)`: the core reader of `wave1.json` reads attempt 1
  only), l.67-72 (`readRegistry`, one cell per (`taskClass`, `key`)), l.126 (`RetiredCell`), l.133-136 (`retireOverlay`).
- `apps/harness/src/policy-wave2.ts` l.47-64 (`guardCalibChain`: attempts 1..k without a gap, attempt 2 on wave 2, the parent's digest
  with `current` false, only the last attempt current). No closed reader of `wave2.json` exists in TypeScript at the base (E-1a; FORMAT-W2
  draft note 2 at `f781057` l.312); the quarter tool's Python reader (`tools/kata-quarter/quarter_wave2.py` l.118-123) is not reused here.
- `apps/harness/src/policy-guard.ts` l.17 (`GuardPins.retireLists`), l.114-119 (`guardKataTable`: the registry pin first, then every list
  of the chain, oldest to newest, each read against its predecessor with the same registry bytes, then the overlay of the newest).
  The only caller of `readRetireList` in production; the tests: `apps/harness/test/policy-retire.test.ts` l.45 and l.76-83.
- `apps/harness/src/policy-table-file.ts` l.50-53: the overlay finds an entry by (`task_class`, `cell_key`) only.
- The mutation lines that name `policy-retire.ts` (`git grep "killer: apps/harness/src/policy-retire.ts"`): l.53
  (`policy-guard.test.ts` l.206), l.65, l.80 and l.83 (`policy-retire.test.ts` l.59, l.201, l.135). None names a line changed here.

## 3. Decisions

- **D-1, the input.** `children` is a map keyed `<task_class> <cell_key>` to `{ status, current }`: the registry status of the cell's
  attempt 2 and the pinned day (`YYYY-MM-DD`) from which its row is current. The caller reads `wave2.json` with its closed reader (E-1a)
  and pins the day; the retire reader does not read `wave2.json` bytes itself (no closed reader of that format exists at the base, and
  writing one is E-1a's). One day per cell, as FORMAT-wave2.md l.186 words it (Q-1).
- **D-2, the current attempt** (`attemptAt`): 2 when the cell has a child whose day is at or before the list's date, else 1. Days compare
  as `YYYY-MM-DD` strings, which order as the days; a child's day that is not a real day is refused by name when an entry consults it.
- **D-3, the attempt check** (l.75): an entry names the current attempt at its list's date, or attempt 1 when it is carried unchanged from
  the previous list (its canonical writing is one of the previous list's entries, the test of l.82-83). This is case 2 of
  RETIRE-CHILD-ROW-1: a parent retired before its child stays retired in every later cumulative list.
- **D-4, the status** (l.76): the status of the attempt named, the wave 1 cell's for attempt 1, the child's for attempt 2.
  The horizon of `LIVE_N_MAX` stays the wave 1 cell's (l.79): the child has the same cell (`guardCalibChain`, policy-wave2.ts l.60).
- **D-5, the list key** (l.69): (`task_class`, `cell_key`, `calib_attempt`), one entry per attempt of a cell, in attempt order. Without it
  the chain of the closing test cannot pass: its second list holds the attempt 1 and the attempt 2 entries of one cell (Q-2).
- **D-6, the guard unchanged**: `guardKataTable` passes no children (policy-guard.ts l.118), so at the guard every cell stays at attempt 1
  and every list is read as at the base. Measured by the whole `test:main` at the base and at the head, each outcome compared by name.

## 4. Questions (default in brackets; each default built here)

- **Q-1** — One pinned day per child cell, or one day for the whole `wave2.json`? [per cell, as FORMAT-wave2.md l.186 says « the day
  its `wave2.json` row becomes current »; one day for all is the same map with one value.]
- **Q-2** — The list key (`task_class`, `cell_key`, `calib_attempt`) is case 1 of RETIRE-CHILD-ROW-1 on the reader's side (« la clé de
  tri d un enfant retiré à son tour », `docs/ETAT.md` l.2089), which ETAT keeps there; but the closing chain needs it. [taken here, in the reader
  only; the overlay's half (policy-table-file.ts l.52, keyed on the cell alone) and the table side of case 1 stay with RETIRE-CHILD-ROW-1
  and E-1; MONARK closes or rewords the items at ETAT.]
- **Q-3** — The children reach the reader as read cells (D-1), not as `wave2.json` bytes with a pin. [yes; the guard wires them when
  E-1 admits wave 2 rows, with the overlay keyed on the attempt, the precondition of FORMAT-W2 draft note 3 point (3).]
- **Q-4** — A child that names no cell of `wave1.json` is not refused by the reader: no entry can reach it, since l.74 refuses an entry
  without a wave 1 cell first. [kept so; the closed reader of `wave2.json` checks each row against its wave 1 row.]

## 5. Left out

The closed reader and projection of `wave2.json` (E-1a), the guard's wiring of `children` (policy-guard.ts, outside this zone), the
overlay keyed on the attempt (policy-table-file.ts l.52, outside this zone; the draft's killer on it goes with it) and so the case of the
closing test « on the overlaid mixed table, row 2 is retired, row 1 stays identical byte for byte » (recherches
`coordination/pieces/2026-10-07-format-w2/FORMAT-W2-draft.md` at `f781057` l.316, note 3), cases 1 (table side) and 3 of
RETIRE-CHILD-ROW-1 (addendum 9 point 2: a core child's calibration ends on 2023-10-01, before S_1, so every `live:<k>` holds it, but
the reader does not check it), a retire list on a wave 2b cell (attempt 1 of `wave3.json`, FORMAT-W2B draft note 5), any served table,
schema, `tools/` or `packages/` file, docs/ETAT.md and the docs/PAROXYSME register.

## 6. Size and tests

- **Estimate before the code** (R-25 in the CI form, docs and the two test lists excluded): 7 lines changed in place and ~25 appended in
  `policy-retire.ts` (~40 insertions and deletions), ~130 in the new test file: ~170, ~220 at +30 %, under 547. No split.
- **Tests** (`apps/harness/test/policy-retire-wave2.test.ts`): `retire_list_attempt_2_on_a_wave2_cell` (the closing test, with the chain
  where the parent is retired first), then one test per new branch or refusal: the day the child becomes current (D-2), the carried
  attempt 1 entry (D-3), the list key (D-5), the child's status (D-4; also an attempt 1 entry carried after the child is current,
  under a child that serves no region: it reads its parent's status), the child's day a real day (D-2; also a year or a month written
  alone, which `Date.parse` reads as a first day). Each red at the base by an assertion (the base ignores `children` and refuses every
  attempt 2 entry), each with its mutation line above it.
- **Measured at the head of the code** (`34d250a9`): R-25 in the CI form (`scripts/oracle/r25.mjs` against `c6aa4907`), 156 changed
  lines (148 insertions, 8 deletions), under the lot bound of 547; the content count 0. In `policy-retire.ts`, 8 lines changed in place
  (l.5, l.6, l.57, l.60, l.69, l.73, l.75, l.76) and 26 appended (l.86-111); every other line keeps its number.
- **Measured after the fold of the review** (`d90fa20d`): R-25 in the CI form, 167 changed lines (158 insertions, 9 deletions), under
  547; the content count 0. The same 8 lines of `policy-retire.ts` changed in place; the fold rewords l.69's refusal on its own line.

## 7. Verification (offline, `offline.mjs --no-egress`, Node 24.21.0, Linux; 0 refused connection in every run)

All measured at `d90fa20d`, the head after the fold of the review.

- **The whole `test:main`**, each test's outcome compared by name with the base run (`c6aa4907`): base 3282 tests (3258 pass, 24
  skipped), head 3288 (3264 pass, 24 skipped), 0 fail on either side, 318 s at the head; no outcome of the base differs at the head;
  the six new tests are the only difference. Compared with the run at `4c1f15e0` before the fold: the same outcomes and names. No name
  changed, so the records stay; `node scripts/test-count-check.mjs --base c6aa4907…`: 321 files, 3288 tests, equal to both records, 0 drop.
- **`scripts/red-proof.mjs --base c6aa4907… --gel <the tree at d90fa20d> --draw 6`**: 7 judged, 7 F2P (red at the base by an
  assertion, green at the head; `retire_list_reader_closed` too, whose expected refusal now names the three-part key), 6 mutation lines
  drawn, 6 killed, each file restored by sha256.
- **Each mutation line applied alone** at the head with only its test: the eight new ones (l.69, l.75, l.76 twice, l.99 twice, l.110
  twice) and the four that name `policy-retire.ts` already (l.53, l.65, l.80, l.83, none on a changed line): 12 red by an assertion, the
  file restored by sha256.
- **Anchor checker** (`verifie-ancres.mjs`, every killer line of the tree, `--ref c6aa4907…`): 2607 killer lines, 2607 ANCRE, 0
  DERIVE, 0 PERDU (2605 at `4c1f15e0`, 2599 at the base). With `--ref 4c1f15e0…`, the mutation line on l.69
  (`policy-retire-wave2.test.ts` l.89) reads DERIVE, re-anchored on l.69 itself: the line keeps its number and its mutated text,
  only the refusal's words changed. `test/killer-lines.test.ts` green.
- **Gates**: `npx tsc --noEmit` clean; eslint on the three touched code and test files clean, and with the lint ratchet's six rules
  and `restrict-template-expressions` as errors; `lint:ratchet` 69/69 (the ceiling, unchanged); `lang:gate`, `gate:vocab` and
  `export:check` OK. The new tests write no path; the three retire and guard test files run green under the case-folding git wrapper,
  which sees no git call.
