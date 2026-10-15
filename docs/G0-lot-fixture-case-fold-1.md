# FIXTURE-CASE-FOLD-1: two tracked paths equal once case is folded are refused on Linux

RECHERCHES, 2026-10-15. Base `d65f31d1` (lot/etude-suite, read by `ls-remote` before the branch). Item carried by RECHERCHES since
2026-10-08, when PR #243 was held on Windows because two fixture paths were equal once case was folded. Branch
`recherches/fixture-case-fold-1`. Zone: `coordination/ZONES.md`, row FIXTURE-CASE-FOLD-1: one new test file, this note, the two
count records.

Author: RECHERCHES. The build instance was launched as `claude-opus-5-5` at effort `high`; the host served it as `claude-fable-5-1`
(its runtime banner), so the model that wrote this change is `claude-fable-5-1` at effort `high`. Clock read at 00:23 UTC at the lock.

## The gap

On a case-insensitive file system (NTFS, the Windows oracle) two names that differ only by case are one entry: a checkout keeps one of
the two files, and a test that lists the folder sees both spellings as one, so a suite green on Linux (ext4 keeps both names) is red on
Windows only, as #243 was; `git config core.ignorecase true` on Linux does not reproduce it (git folds the name in its index, the file
system keeps both). The repository had no test reading the names git tracks for that hazard: the check RECHERCHES runs on its own
fixtures before a merge lives outside the repository, and CI on Linux cannot see the collision.

## The rule (test/tracked-paths-case-fold.test.ts, new, 75 lines, at 2fa4ee87)

- A name is each prefix of a tracked path, its folders and the path itself (`test/tracked-paths-case-fold.test.ts` l.28-33). Two
  names are one group when their segments are equal once each is normalised to NFC and lower-cased (`fold`, l.19).
  `caseOnlyCollisions` (l.25-37) returns the groups of two or more distinct spellings, each sorted, the groups sorted by their first
  spelling; no group means the list is safe on NTFS. The function lives in the test file and is not exported: the zone holds no
  support module, and no other file needs it.
- The live case (`test/tracked-paths-case-fold.test.ts` l.70-75): `git ls-files -z` of the repository root (`gitOut` of
  `test/helpers/git-tracked.ts`, which runs git without the caller's GIT_* variables), read as a list of paths, must give no group; the
  failure message names the groups found.
- Trailing dots and spaces, which NTFS strips from a name (`a.` and `a` are one entry there), are not folded here: a segment ending in
  a dot or a space is a Windows hazard on its own, refused by the pre-push lint on every changed path, whether or not it collides.
- Unicode beyond NFC and simple lower-casing (a full case fold: sharp s against double s, the Turkish dotted I, compatibility forms) is
  not applied: NTFS compares by its own upcase table, which this test does not reproduce; see Not verified.

## Tests (six, each one `test(...)`; the file carries no killer line, see the campaign)

1. `test/tracked-paths-case-fold.test.ts` l.39 `case_fold_two_names_that_differ_only_by_case_are_one_group`: `README.md` and
   `readme.md` in one folder are one group; a third file whose name differs by more than case is in no group.
2. l.45 `case_fold_a_directory_segment_counts_like_a_file_name`: `test/fixtures/A/x.json` and `test/fixtures/a/y.json` give the group
   of the two folders; `test/fixtures/A/x.json` and `test/fixtures/a/x.json` (the pair of #243's kind) give that group and the group
   of the two files.
3. l.53 `case_fold_a_combining_mark_that_nfc_merges_is_the_same_name`: `ma` + U+00F1 + `ana.md`, `man` + U+0303 + `ana.md` and the
   upper-cased spelling are one group of three (the strings differ; the source writes them as `\u` escapes, ASCII only). The first
   fixture spelled `caf` + U+00E9 and reached the tree as literal bytes (the editing tool had turned the escapes into characters), which
   the language gate of the public export took for French (2 hits); the fourth commit of the branch spells the same NFC merge with a
   tilde, as escapes.
4. l.61 `case_fold_distinct_names_and_a_repeated_path_give_no_group`: names that differ by more than case, a path listed twice and a
   folder spelled the same way under each path give no group.
5. l.66 `case_fold_an_empty_list_gives_no_group`.
6. l.70 `tracked_paths_have_no_case_only_collision`: the live case; it first checks that this very file is among the paths listed, so
   the list is the repository root's.

Tests first: the first commit of the branch (`a567b26e`) holds the file with the fold stubbed to return no group; run alone, offline
(0 refused), tests 1, 2 and 3 are red by assertion and 4, 5, 6 green (`logs/red-stub.tap`, sha256 `11c72182`). The second commit
(`e423adf7`) holds the fold: 6 of 6 green (`logs/green-file.tap`, `b0f57aa0`); after the fixture change of the fourth commit
(`2fa4ee87`), 6 of 6 again (`logs/green-file3.tap`, `17e50b53`).

## Mutation campaign

A killer line never names a `*.test.ts` (killerProblem of `scripts/red-proof.mjs`, and the trunk's `every_killer_line_is_readable`
holds every test file to it), and the only other target the convention allows, a support module under `test/helpers/` that the test
imports, is outside the zone of this item. So the file carries no killer line, and `scripts/mutants/run.mjs --killers --file
test/tracked-paths-case-fold.test.ts` on the branch at `e423adf7` finds none: `tues 0 / 0, survivants -, non conclus -, anchor-lost -,
exit 1` (`mutants/RESULTS.txt`, sha256 `ce84bb1d`; `RESULTS.json` `e2313af6`; offline, 0 refused). In its place, four hand mutants of
the fold, each applied to the file at `2fa4ee87`, run alone offline and restored byte for byte (`hand-mutants.mjs` of the build's
scratch; `logs/hand-mutants3.out`, sha256 `8fb1286c`): NFC dropped (red: test 3; `logs/hand-mutant-H1.tap`, `194294cc`), parent
folders dropped (red: test 2; `dbcfedd6`), case not folded (red: tests 1, 2, 3; `6b7a0724`), a single spelling counted as a group
(red: tests 1, 2, 3, 4 and the live test 6; `ffd6ef6c`). 4 of 4 killed by assertion, 0 refused attempts in each run.

## Proofs (all offline, 0 refused; the suite under the shared host lock)

| Measure | Result | Log (sha256 prefix) |
|---|---|---|
| Red run, the file alone, the fold stubbed (`a567b26e`) | 6 tests, 3 pass, 3 fail by assertion | `logs/red-stub.tap` `11c72182` |
| Green run, the file alone (`e423adf7`; `2fa4ee87`) | 6 tests, 6 pass; 6 pass | `logs/green-file.tap` `b0f57aa0`; `logs/green-file3.tap` `17e50b53` |
| Hand mutants of the fold (`2fa4ee87`) | 4 of 4 killed | `logs/hand-mutants3.out` `8fb1286c` |
| `npm run test:main` at `e423adf7` (hostlock-run, offline) | 307 files, 3133 tests, 3110 pass, 1 fail, 22 skipped; the one red is `bell_handoff_permissions_on_linux`, known on a root host without the bell users, fixed by #284; the six new tests pass in the suite | `logs/suite1.stdout` `dc2c6644` |
| `node scripts/test-count-floor.mjs write` | `test/test-counts.json and test/test-names.json: 307 files, 3133 tests` | `logs/count-write-check.out` `1cfdff7a` |
| `node scripts/test-count-check.mjs --base d65f31d1` | exit 0: `test counts: 307 files, 3133 tests, equal to test/test-counts.json and test/test-names.json; 0 drop(s) from the base d65f31d1b48b, each name gone with its line in test/test-count-removals.json` | same log |
| Anchors, whole tree, `verifie-ancres.mjs --ref d65f31d1` at `2fa4ee87` | `tueurs 2088 ; ANCRE 2088 ; DERIVE 0 ; PERDU 0` | `logs/anchors2.out` `21fdda33` |
| Gates at `2fa4ee87` | `tsc --noEmit` 0; eslint on the test file 0; `lint:ratchet` 69/69; `gate:vocab` 0 (357 files); `lang:gate` 0; `export:check` 0; `git diff --check` 0; no non-ASCII byte in an added line of the test file (the first fixture had 2 `lang:gate` hits) | `logs/gates2.out` `408fa030`; `logs/lang-gate-full.out` `0327bfd2` |
| winlint `--files` on the four files of the branch, this note included | 4 files, no Windows hazard | `logs/winlint2.out` `bb4f49cc` |
| r1scan `--base d65f31d1 --head HEAD` at `2fa4ee87` | 0 matches | `logs/r1scan2.out` `130ebf1f` |
| casefold of the paths this branch adds or changes | 6 names with their folders, 0 case-only collision | `logs/casefold-own.out` `696a738f` |

The runs on the branch's final head, this note committed (r1scan, cites on this note), are named in the build report. Size, CI form (docs and the two count records are excluded by the CI pathspec): `test/tracked-paths-case-fold.test.ts`
75+/0-.

## Not verified

- Windows itself: the suite is not replayed on win32 here (MONARK replays at merge). The test writes no file and reads only the index.
- NTFS trailing dots and spaces: not folded by this test (the pre-push lint refuses such a segment on its own); a tracked name ending in
  a dot or a space that collides with another once stripped would pass this test.
- Unicode beyond NFC: the fold is NFC then `toLowerCase` per segment, not the NTFS upcase table nor a full case fold; names equal
  under one and not the other are not covered.
- `git ls-files` lists the index of the checkout the test runs in: a path added by a later change is judged only once it is staged.

## Changelog

- 2026-10-15, base `d65f31d1`: the test file (tests first, then the fold, then the fixture spelled with a tilde as ASCII escapes), the two count
  records by `write`, this note.
