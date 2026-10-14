# G0 — KATA-K19: T-4 judges the tables that `servedPolicyTables` serves by an assertion, before the tripwire

- **Author**: RECHERCHES (`claude-opus-5-5`, effort high), 2026-10-14, under the lot lock (first progress line 05:52 UTC). A short
  design note, documents only, before the test change.
- **Demand**: MONARK `e6ebb72` (recherches, `coordination/messages/2026-10-09-MONARK-vers-RECHERCHES-levee-pause.md` l.29-35, C-1 of the
  review of #237) and `f3153f3` (`coordination/messages/2026-10-13-MONARK-vers-RECHERCHES-fusions-261-237.md`, item 2); the plan of
  section 8 of `docs/G0-lot-kata-killers-assert-1.md` (branch `recherches/kata-killers-assert-1`, l.310-317 at `c2a22042`). K19 is the
  declared killer of T-4 `committed_tables_reach_the_gate_through_the_seam`; its mutation turns T-4 red through the tripwire's own
  exception, not an assertion. The verdict rule (`e6ebb72`): « tue » only by an assertion (TAP `code: 'ERR_ASSERTION'`) with the trunk
  tool `scripts/mutants/run.mjs --killers --only`; an uncaught exception (`ERR_TEST_FAILURE`) is « non conclu ».
- **Base**: trunk `lot/etude-suite` = `971eda88`, the merge of #238 (`ls-remote` at the start and again at 05:57 UTC, unchanged;
  fetched with an explicit refspec). Branch `recherches/kata-k19`.
- **Zone** (recherches `coordination/ZONES.md`, row « KATA-K19 (après #238) », `2c7fdda`): `apps/harness/test/gate-kata-served.test.ts`,
  this note, and `test/test-counts.json` by `write` only if the test count changes. No production file, no test support file, no killer
  line, no test added, removed or renamed.

red-proof: test-only

The line above declares the change test-only, for `node scripts/red-proof.mjs --base 971eda88 --gel <the tests commit> --test-only`.
The killer it judges, K19, unchanged, at `apps/harness/test/gate-kata-served.test.ts` l.331:

```
apps/harness/src/kata-path.ts:118 CONST "committed.get(c.task_class) ?? buildPolicyTable(c, [])" -> "buildPolicyTable(c, [])"
```

## 1. K19 at the base

- **The line.** `apps/harness/src/kata-path.ts` l.118, in `servedPolicyTables`: each of the 32 kata classes takes its committed table
  when one is read, else an empty table. The before-text `committed.get(c.task_class) ?? buildPolicyTable(c, [])` occurs exactly once on
  that line (checked at `971eda88`). The mutation drops the committed table: every kata table is served empty.
- **T-4** (l.332-356 at the base) builds two synthetic band tables, reads them by `readCommittedTables` and passes the result of
  `servedPolicyTables` straight into the tripwire `kataTablesMatchPins` (l.344), then judges two verdicts and the honesty text through
  the seam. Under the mutation the served kata tables hold no row, so the tripwire throws its own `Error` (`apps/harness/src/kata-path.ts`
  l.127, "KATA-CLAUSE-COMMITTED-STATE-1: the kata tables with rows are not the pinned tables: …") at l.344, before any assertion of
  T-4 on what is served: the test fails by `ERR_TEST_FAILURE`.
- **Measured** at `971eda88` with the trunk tool (`scripts/mutants/run.mjs --killers --only K130,…,K144`, `--base 357ef25f`, the root
  commit, so that the tool numbers the killer lines of the whole tree as the sweep did; the fifteen killer lines of the file are K130 to
  K144, K19 is K140; `tool_sha256` `13b2b11f…`, `tool_dirty` null): the baseline is green (69 target files, 560 entries ok); 14 of the 15
  read « tue »; K140 reads « non conclu »: T-4 alone is red by `ERR_TEST_FAILURE` with the tripwire's message "…are not the pinned
  tables: btc-range-1h, btc-mae-down-1h", and the replay of the 53 target files of l.118 (481 entries ok) has that one red entry, by
  the same code.
  Evidence under the author's scratchpad (`kata-k19/`): `runs/before/RESULTS.json` (sha256 `138a485f…`), `RESULTS.txt` (`62a3115c…`),
  `tap/K140.tap` (`6ceedc95…`), `tap/K140.replay.tap` (`e83ca602…`), `logs/before.stdout.log` (`c7bdb5bf…`); 0 refused attempts.

## 2. The choice

Two forms were planned (MONARK `e6ebb72`): (a) T-4 judges by an assertion the rows that `servedPolicyTables` serves, before the
tripwire; (b) K19 is replaced by a killer that T-4 kills by an assertion.

**(a) is taken.** It keeps K19's line and text, so the declared killer stays where the risk is: the committed table is what
`servedPolicyTables` must pass on, and (b) would leave that choice of l.118 judged by no assertion of T-4. It keeps every present
guarantee of T-4: the tripwire still runs on the same served tables, with the same pins and held lists, and the verdicts and the
honesty text are judged as before. It adds a real assertion, independent of the tripwire: the kata tables that hold rows, as served, are
exactly the two committed ones, each with the sha256 of its file and, byte for byte, the canonical text of that file. These two tables
are T-4's own synthetic fixture (l.334-340: their class names and pins come from the files T-4 builds, not from `COMMITTED_TABLES` of
`apps/harness/src/policy-committed-pins.ts`), so no release of the real tables changes this assertion. (b) would weaken nothing
either, but it adds no assertion where the gap is and moves the declared killer of T-4 off the line it was written for.

**The change** (one line of T-4's body becomes three; no other test changes): l.344

```
const tables = (match as (…) => readonly ServedTable[])(serve(gate.SERVED_TABLE_TEXTS, readCommittedTables(files, entries, pins)), pins.tables, pins.held);
```

becomes, in order: `const served = serve(gate.SERVED_TABLE_TEXTS, readCommittedTables(files, entries, pins));`, then an
`assert.deepEqual` of `[task_class, policy_table_sha256, canonicalJson(table)]` for each served kata table (`cell_key_rule`
`kata-bucket`) that holds a row, against `[c, pins.tables[c], the file's text]` for `btc-mae-down-1h` and `btc-range-1h` (the served
order, sorted), then the tripwire on `served`. Under K19's mutation the served list holds no such table, so the assertion fails before
the tripwire. Measured on a throwaway form of this change in the worktree, never committed (`kata-k19/logs/proto.diff` under the
author's scratchpad, sha256 `79e2ea92…`): unmutated, T-4 green; with K19 fired by hand, T-4 red by `ERR_ASSERTION` at the new
assertion.

**Drift, declared**: the two added lines move the four killer lines below T-4 in the file (l.361, 375, 389, 425 to l.363, 377, 391,
427); none changes text or target, and K19 stays on l.331.

## 3. The planned proofs

Each under `offline.mjs --no-egress` (0 refused attempts expected); the campaigns and the full suite take the shared host lock.

1. **Before**, at `971eda88`: the trunk tool on the fifteen killer lines of `apps/harness/test/gate-kata-served.test.ts`, K19 expected
   « non conclu », the fourteen others as they read (done: section 1).
2. **After**, at the tests commit: the same fifteen; K19 « tue » by `ERR_ASSERTION`; every other killer of the file reads as before.
3. `node scripts/red-proof.mjs --base 971eda88 --gel <tests commit> --test-only`: T-4 judged and pinned, nothing refused.
4. `npm run test:main`; `node scripts/test-count-floor.mjs write` and its diff (the record is committed only if the count changes: no
   test is added, removed or renamed, so it should not); `node scripts/test-count-check.mjs --base origin/lot/etude-suite`.
5. The anchor checker on the whole tree, `--ref 971eda88`: 0 lost; `tsc --noEmit`, eslint on the test file, `lint:ratchet`,
   `gate:vocab`, `lang:gate`, `export:check`, winlint, `git diff --check`; the size in the CI form (the `STAT=` line of
   `.github/workflows/ci.yml` l.100); r1scan on every commit pushed.

## 4. Not verified here

- The Windows replay of the file and of `every_killer_line_is_readable` (MONARK's, at the merge). The test writes no path, so case
  folding plays no part.
- PAROXYSME's corrected tool (#259, not merged): not run.

## 5. As built

Built 2026-10-14 by RECHERCHES (`claude-opus-5-5`, effort high), Node 24.21.0; every run below under `offline.mjs --no-egress`, 0 refused
attempts each; the campaigns, red-proof, `tsc`, eslint and `npm run test:main` took the shared host lock.

**Commits** on `recherches/kata-k19`, on the trunk head `971eda88` (unchanged at the start and at 05:57 UTC): `d76baa10`, this note
(documents only); `b345a2f2`, the test change (`apps/harness/test/gate-kata-served.test.ts`, 3 lines added, 1 removed, byte for byte the
measured throwaway form); then this section. No pull request is opened: a fresh review comes first.

**The campaigns** (the trunk's `scripts/mutants/run.mjs --killers --only K130,…,K144`, `--base 357ef25f`, the fifteen killer lines of the
file; the ids are the same at both heads; `tool_sha256` `13b2b11f…`, `tool_dirty` null):

| Run | Head | Baseline | tue | survit | non conclu |
|---|---|---|---|---|---|
| before | `971eda88` | green, 69 files, 560 entries | 14 | none | K140 (K19) |
| after | `b345a2f2` | green, 69 files, 560 entries | 15 | none | none |

The one verdict that moves is K19's: « non conclu » (T-4 red by `ERR_TEST_FAILURE`, the tripwire's exception) to « tue » (T-4 red by
`ERR_ASSERTION`, the new assertion, message "servedPolicyTables serves the two committed tables byte for byte, and no other kata table
holds a row"). The fourteen others, K130 to K139 and K141 to K144 (K144 is the other killer on l.118, of `kata_path_and_server_load_cold`),
read « tue » in both runs.

**Red-proof**: `node scripts/red-proof.mjs --base 971eda88 --gel b345a2f2 --test-only`: OK, 1 judged
(`committed_tables_reach_the_gate_through_the_seam`), 1 pinned (green at the base and at the gel, its declared killer fired at the gel red
by `ERR_ASSERTION`), 14 unchanged, 0 killers drawn, no refusal; the declaration read is this note's.

**The suite and the count**: `npm run test:main` at `b345a2f2`: 2973 tests, 2951 pass, 0 fail, 22 skipped. `node
scripts/test-count-floor.mjs write`: 290 files, 2973 tests, no diff to `test/test-counts.json`, so the record is not committed. `node
scripts/test-count-check.mjs --base origin/lot/etude-suite`: equal to the record, 0 drops from the base.

**Checks**: `npx tsc --noEmit` 0; eslint on the test file 0; `lint:ratchet` 69/69; `gate:vocab`, `lang:gate`, `export:check` OK; winlint
(2 files) no hazard; `git diff --check` clean; r1scan 0 on each commit before its push. The anchor checker (`verifie-ancres.mjs <tree>
--ref 971eda88`): 1791 killer lines, 1791 anchored, 0 drifted, 0 lost.

**Size** (R-25 in the CI form, the pathspec of `.github/workflows/ci.yml` l.100, against `origin/lot/etude-suite`): 1 file, 3 lines added,
1 removed, 4 in all; the bound read at `.github/workflows/ci.yml` l.56 is 1205.

**Departures from the plan**: none in the change. The first push of the branch used a refspec with a leading `+` on a branch that did not
exist yet (nothing was overwritten); the later pushes use none.

**Not verified here**: the Windows replay of the file and of `every_killer_line_is_readable` (MONARK's, at the merge); #259's tool (not
merged, not run); the killers of other test files that reach `apps/harness/src/kata-path.ts` (only the fifteen of this file were run).

**Evidence**, under the author's scratchpad (`kata-k19/`):

| File | sha256 |
|---|---|
| campaign before: `runs/before/RESULTS.json`, `RESULTS.txt`, `tap/K140.tap`, `tap/K140.replay.tap`, `logs/before.stdout.log` | `138a485f…`, `62a3115c…`, `6ceedc95…`, `e83ca602…`, `c7bdb5bf…` |
| campaign after: `runs/after/RESULTS.json`, `RESULTS.txt`, `tap/K140.tap`, `logs/after.stdout.log` | `83a8539b…`, `840e0607…`, `742fe5e5…`, `5820d479…` |
| both verdict lists: `logs/verdicts-before-after.txt` | `790f88cb…` |
| red-proof: `runs/redproof/RED-PROOF.json`, `pin-1.tap`, `logs/redproof.log` | `fdd5e47c…`, `74849633…`, `23bc694e…` |
| the throwaway form: `logs/proto.diff`, `logs/proto-mutated.tap` | `79e2ea92…`, `95707a91…` |
| suite and count: `logs/testmain.log`, `logs/countwrite.log`, `logs/countcheck.log` | `d48f29a6…`, `027eece1…`, `0e228620…` |
| checks: `logs/anchors.log`, `logs/size.log`, `logs/tsc.log`, `logs/eslint.log`, `logs/winlint.log` | `e4b74253…`, `d2257460…`, `a904264b…`, `37a449bd…`, `f8265674…` |

**G2 fold** (2026-10-14, the same author lock). The fresh G2 (recherches `coordination/pieces/2026-10-14-g2-kata-k19/G2-kata-k19.json`,
commit `f0815c83`, `claude-opus-5-5`, effort high) read `958d68df` on `971eda88` and returned ACCEPTE with two minor findings, both
folded:

- **m-1** (this note, l.53-54 at `958d68df`): section 2 now says that the two tables are T-4's own synthetic fixture, so that no release
  of the real tables changes the assertion (`ea0818de`).
- **m-2** (T-4's header comment, `apps/harness/test/gate-kata-served.test.ts` l.327-330 at `958d68df`): reworded within its four lines
  to name the served-rows assertion, the one that kills K19 (`f944e572`). No killer line moves: the file's 15 killer lines read
  15 anchored, 0 drifted, 0 lost with `--ref 6779955e --ref 958d68df`.

Before them, `98f036f9` merges the trunk head `6779955e` (the merge of #262, which shares no file with this change): a merge commit,
no rebase, no conflict. The branch head is the commit that adds this paragraph.

**Proofs on the merge `98f036f9`**, each under `offline.mjs --no-egress` with 0 refused attempts; the suite, the campaign, red-proof,
`tsc` and eslint took the shared host lock:

- `npm run test:main`: 2981 tests, 2959 pass, 0 fail, 22 skipped (the 2973 of `971eda88` and the 8 that #262 adds).
  `node scripts/test-count-floor.mjs write`: 291 files, 2981 tests, no diff to `test/test-counts.json`, so the record is not committed.
  `node scripts/test-count-check.mjs --base origin/lot/etude-suite`: equal to the record, 0 drops from `6779955e`.
- The campaign: `scripts/mutants/run.mjs --killers --only K1,…,K15 --base 6779955e` (against the new trunk only this file's killer
  lines count, so K1 to K15 are its fifteen and K19 is K11; `tool_sha256` `13b2b11f…`, `tool_dirty` null): baseline green, 560
  entries; 15 « tue », each by `ERR_ASSERTION`; K11 (K19) fails at the assertion of l.345.
- `node scripts/red-proof.mjs --test-only --base 6779955e --gel 98f036f9`: OK, 1 judged and pinned (T-4, its declared killer fired at
  the gel red by `ERR_ASSERTION`), 14 unchanged, 0 killers drawn, no refusal.
- `npx tsc --noEmit` 0; eslint on the test file 0. The anchor checker on the whole tree, `--ref 6779955e`: 1799 killer lines, 1799
  anchored, 0 drifted, 0 lost; the same at `ea0818de`.

At `ea0818de` (the merge plus both folds): `lint:ratchet` 69/69; `gate:vocab`, `lang:gate`, `export:check` OK; winlint (2 files) no
hazard; `git diff --check` clean. Size in the CI form against `6779955e`: 1 file, 6 lines added, 4 removed, 10 in all (bound 1205).
r1scan 0 on what the push carries.

**Evidence of the fold**, under the author's scratchpad (`kata-k19-fold/`):

| File | sha256 |
|---|---|
| campaign: `runs/campaign/RESULTS.json`, `RESULTS.txt`, `tap/K11.tap`, `logs/campaign.stdout.log` | `e9215c7f…`, `b5959c00…`, `403c81ff…`, `9f3486e9…` |
| red-proof: `runs/redproof/RED-PROOF.json`, `pin-1.tap`, `logs/redproof.log` | `74011ba2…`, `8c1d68d0…`, `90c8f7c0…` |
| suite and count: `logs/testmain.log`, `logs/countwrite.log`, `logs/countcheck.log` | `c89555c3…`, `fe060350…`, `08de1d72…` |
| checks: `logs/anchors-merge.log`, `logs/anchors-final.log`, `logs/tsc-eslint-merge.log`, `logs/static-light.log`, `logs/winlint.log`, `logs/size.log` | `2e93d005…`, `5e3357d3…`, `640d6f55…`, `0262ebd5…`, `a8ac38b7…`, `eb781ff1…` |
