# FIXTURE-CASE-FOLD-1: two paths equal once case is folded are refused, in a fixture and among the tracked paths

RECHERCHES, 2026-10-15. Base `d65f31d1` (lot/etude-suite, read by `ls-remote` before the branch). Item carried by RECHERCHES since
2026-10-08, when PR #243 was held on Windows because two fixture paths were equal once case was folded. Branch
`recherches/fixture-case-fold-1`. Zone: `coordination/ZONES.md`, row FIXTURE-CASE-FOLD-1: a support module, two test files, this
note, the two count records.

Author: RECHERCHES. The build instance was launched as `claude-opus-5-5` at effort `high`; the host served it as `claude-fable-5-1`
(its runtime banner), so the model that wrote this change is `claude-fable-5-1` at effort `high`. Clock read at 00:23 UTC at the lock,
01:04 UTC at the lock of the fold after the first review.

## The gap

On a case-insensitive file system (NTFS, the Windows oracle) two names that differ only by case are one entry. PR #243's test wrote,
in a throwaway repository under the temporary directory, two folders `logs/v%2e.../` and `logs/v%2E.../` (the escapes of one address
in two cases): on NTFS they were one folder, `git add` tracked two files of the three, the third was never read and the test went red
on Windows only; Linux (ext4) keeps both names, so the suite was green here. `git config core.ignorecase true` on Linux does not
reproduce it (git folds the name in its index, the file system keeps both). The item asked that the fixture helpers refuse such a pair
by name, as a construction-time error; the zone of this change adds that no two tracked names collide either. Nothing did either: a run-time
fixture is seen by no test, and CI on Linux cannot see the collision among the tracked paths.

## The rule (test/helpers/case-fold.ts, new, 44 lines)

- A name is each prefix of a path, its folders and the path itself (`test/helpers/case-fold.ts` l.18-23). Two names are one group
  when their segments are equal once lower-cased after NFC normalisation (`fold`, l.10). `caseOnlyCollisions` (l.16-28) returns the
  groups of two or more distinct spellings, each sorted, the groups sorted by their first spelling; no group means the list is safe on
  a case-insensitive file system. `refuseCaseOnlyCollisions(paths, where)` (l.41-44) throws a `CaseOnlyCollisionError` (l.33-38)
  whose message names `where` and each group, digits masked as x: a fixture name may carry a host address, and a test log of a public
  repository is public.
- The fold is this repository's own rule: the lower-casing is what a case-insensitive file system does; the NFC step is stricter than
  NTFS on that axis (NTFS keeps a composed and a decomposed spelling as two entries, the macOS file systems APFS and HFS+ merge them),
  so a group is one entry on NTFS or on macOS, and a composed-against-decomposed pair is refused for macOS's sake. Neither the NTFS
  upcase table nor a full case fold (sharp s against double s, the Turkish dotted I, compatibility forms) is applied.
- Two layers use it. At construction time, `fixture()` of `test/no-host-address.test.ts` (l.28, in place) refuses two of its tracked
  or loose paths equal once case is folded before any directory or file is made (the import on l.17; every line up to l.231 keeps its
  number). At the trunk, `test/tracked-paths-case-fold.test.ts` l.66-71 reads `git ls-files -z` of the repository root (`gitOut` of
  `test/helpers/git-tracked.ts`, which runs git without the caller's GIT_* variables) and asks for no group, the failure message naming
  the groups found.
- Trailing dots and spaces, which NTFS strips from a name (`a.` and `a` are one entry there), are not folded here: a segment ending in
  a dot or a space is a Windows hazard on its own, refused by a lint of the author's tooling run before each push, outside this
  repository, whether or not it collides.

## Tests

In `test/tracked-paths-case-fold.test.ts` (71 lines; the line above a test is the mutation of the helper that reddens it):

1. `test/tracked-paths-case-fold.test.ts` l.22 `case_fold_two_names_that_differ_only_by_case_are_one_group`: `README.md` and
   `readme.md` in one folder are one group; a third file whose name differs by more than case is in no group. Killer l.21 (the case
   kept).
2. l.30 `case_fold_a_directory_segment_counts_like_a_file_name`: `test/fixtures/A/x.json` and `test/fixtures/a/y.json` give the group
   of the two folders; `test/fixtures/A/x.json` and `test/fixtures/a/x.json` (the pair of #243's kind) give that group and the group
   of the two files. Killer l.29 (only the whole path a name).
3. l.40 `case_fold_a_combining_mark_that_nfc_merges_is_the_same_name`: `ma` + U+00F1 + `ana.md`, `man` + U+0303 + `ana.md` and the
   upper-cased spelling are one group of three (the strings differ; the source writes them as `\u` escapes, ASCII only). Killer l.39
   (NFC dropped).
4. l.50 `case_fold_distinct_names_and_a_repeated_path_give_no_group`: names that differ by more than case, a path listed twice and a
   folder spelled the same way under each path give no group. Killer l.49 (a single spelling as a group).
5. l.55 `case_fold_an_empty_list_gives_no_group`.
6. l.61 `case_fold_two_top_level_names_that_differ_only_by_case_are_one_group`: `LICENSE` and `license` at the root are one group (a
   path of one segment is a name; added after the first review, whose mutant starting the loop at the second segment survived).
   Killer l.60 (the loop started at the second segment).
7. l.66 `tracked_paths_have_no_case_only_collision`: the live case; it first checks that this very file is among the paths listed, so
   the list is the repository root's.

In `test/no-host-address.test.ts`, appended at the end:

8. `test/no-host-address.test.ts` l.237 `address_literals_fixture_refuses_two_paths_equal_once_case_is_folded`: the two folders of
   #243's shape, equal but for the case of their escapes, make `fixture()` throw a `CaseOnlyCollisionError` whose message names the
   group with every digit masked; a tracked path and a loose one are judged together; no temporary directory is made for a refused
   fixture. Killers l.235 (the throw removed) and l.236 (the mask removed).

Tests first, twice. The first commit of the branch (`a567b26e`) held the tracked-paths file with the fold stubbed to return no group:
run alone, offline (0 refused), its three positive synthetic cases were red by assertion (`logs/red-stub.tap`, sha256 `11c72182`); the
second commit (`e423adf7`) held the fold, 6 of 6 green (`logs/green-file.tap`, `b0f57aa0`). After the first review, commit `3db33d6a`
moved the fold to the support module and appended test 8 without touching `fixture()`: run alone, offline, 13 ok and test 8 red by
assertion, `Missing expected exception (CaseOnlyCollisionError)` (`logs-r1/nha-red-A.tap`, sha256 `ec3fb889`); commit `792adaed`
changed `fixture()` (and corrected the order of the group in test 8's expected message, the upper-case escape first, as the helper
sorts): 14 of 14 green (`logs-r1/nha-green-B.tap`, `9afb9b5c`); the tracked-paths file 7 of 7 (`logs-r1/tp-green-A.tap`, `8a78a209`).

## Mutation campaign

Seven killer lines, each on a line of `test/helpers/case-fold.ts`, a support module the two test files import (the target the killer
convention admits; a `*.test.ts` is never mutated, which is why the first form of this change, with the fold inside the test file, had
none and relied on hand mutants). `scripts/mutants/run.mjs --killers --file test/tracked-paths-case-fold.test.ts` on the branch at
`dc6f4e79` (the count records written first, so the baseline matches them: a first run at `792adaed` was non conclu at its baseline for that reason, `mutants-r1/RESULTS.txt`, sha256 `f30b0fb9`), offline (0 refused), under the shared host lock: the 30 killers of the two changed test files, K1-K23 the trunk's on `scripts/address-literals.mjs` (the pinned lines of `test/no-host-address.test.ts` did not move) and K24-K30 the seven new ones on the helper, each first run alone as its named test; baseline green (21 tests of the two target files); `tues 30 / 30, survivants -, non conclus -, anchor-lost -, exit 0` (`mutants-r1b/RESULTS.txt`, sha256 `5be710c9`; `RESULTS.json`
`0f2d1ee3`; `logs-r1/mutants2.stdout` `a166d1ee`).

## Proofs (all offline, 0 refused; the suite under the shared host lock)

| Measure | Result | Log (sha256 prefix) |
|---|---|---|
| Red run, the tracked-paths file alone, the fold stubbed (`a567b26e`) | 6 tests, 3 pass, 3 fail by assertion | `logs/red-stub.tap` `11c72182` |
| Red run, `test/no-host-address.test.ts` alone before the `fixture()` change (`3db33d6a`) | 14 tests, 13 pass, 1 fail by assertion | `logs-r1/nha-red-A.tap` `ec3fb889` |
| Green runs alone at `792adaed` | tracked-paths 7 of 7; no-host-address 14 of 14; `test/killer-lines.test.ts` 1 of 1 | `logs-r1/tp-green-A.tap` `8a78a209`; `logs-r1/nha-green-B.tap` `9afb9b5c`; `logs-r1/killer-lines-B.tap` `9a71e08c` |
| Killer campaign at `dc6f4e79` | 30 of 30 killed (23 of the trunk, 7 new), baseline green | `mutants-r1b/RESULTS.txt` `5be710c9` |
| `npm run test:main` at `792adaed` (hostlock-run, offline) | 307 files, 3135 tests, 3112 pass, 1 fail, 22 skipped; the one red is `bell_handoff_permissions_on_linux`, known on a root host without the bell users, fixed on the trunk by #284 (not on this base); the eight tests of this change pass in the suite | `logs-r1/suite.stdout` `071b9c00` |
| `node scripts/test-count-floor.mjs write` | `test/test-counts.json and test/test-names.json: 307 files, 3135 tests` | `logs-r1/count-write-check.out` `cf6e60a9` |
| `node scripts/test-count-check.mjs --base d65f31d1` | exit 0: `test counts: 307 files, 3135 tests, equal to test/test-counts.json and test/test-names.json; 0 drop(s) from the base d65f31d1b48b, each name gone with its line in test/test-count-removals.json` | same log |
| Anchors, whole tree, `verifie-ancres.mjs --ref d65f31d1`, before and after the fold | before: `tueurs 2088 ; ANCRE 2088 ; DERIVE 0 ; PERDU 0`; after: `tueurs 2095 ; ANCRE 2095 ; DERIVE 0 ; PERDU 0` (the seven new killers; no pinned line of `test/no-host-address.test.ts`'s targets moved) | `logs-r1/anchors-before.out` `21fdda33`; `logs-r1/anchors-after.out` `2aa17a4c` |
| Gates at `dc6f4e79` | `tsc --noEmit` 0; eslint on the three test files 0; `lint:ratchet` 69/69; `gate:vocab` 0 (357 files); `lang:gate` 0; `export:check` 0; `git diff --check` 0; no non-ASCII byte in an added line under test/ | `logs-r1/gates-final.out` `057c87f9` |
| winlint `--base d65f31d1`, r1scan `--head HEAD`, casefold of the branch's paths, at `792adaed` | 6 files, no Windows hazard; 0 matches; 9 names with their folders, 0 case-only collision | `logs-r1/light-B.out` `167fe90a` |

The runs on the branch's final head, this note committed (r1scan, winlint, cites on this note), are named in the build report. Size,
CI form (docs and the two count records are excluded by the CI pathspec): `test/helpers/case-fold.ts` 44+, `test/tracked-paths-case-fold.test.ts`
71+, `test/no-host-address.test.ts` 16+/2-.

## Not verified

- Windows itself: the suite is not replayed on win32 here (MONARK replays at merge). Test 8 writes nothing: the refusal comes before
  the temporary directory; the other fixtures of that file are unchanged and collide on no name (they ran green through the refusal).
- NTFS trailing dots and spaces: not folded by this rule; a name ending in a dot or a space that collides with another once stripped
  would pass both layers.
- Unicode beyond NFC: the fold is NFC then `toLowerCase` per segment, not the NTFS upcase table nor a full case fold; names equal
  under one and not the other are not covered, and the NFC merge is a macOS behaviour that NTFS does not have.
- Other fixture helpers that write escaped paths (the item names "its kind"): only `fixture()` of `test/no-host-address.test.ts` calls
  the helper; another test that writes a pair of that kind at run time is not covered until it calls `refuseCaseOnlyCollisions`.
- `git ls-files` lists the index of the checkout the test runs in: a path added by a later change is judged only once it is staged.

## Changelog

- 2026-10-15, base `d65f31d1`: the test file (tests first, then the fold, then the fixture spelled with a tilde as ASCII escapes), the
  two count records by `write`, this note.
- 2026-10-15, after the first review (one M, three m): the fold moved to `test/helpers/case-fold.ts` with killer lines on it; `fixture()`
  of `test/no-host-address.test.ts` refuses two paths equal once case is folded (the item's own case, #243's run-time fixture, which the
  tracked-paths test never saw); a top-level synthetic case; the fold named as this repository's rule, stricter than NTFS on the NFC
  axis; the records written again; this note.
