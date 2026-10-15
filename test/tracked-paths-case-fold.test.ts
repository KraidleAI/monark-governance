/**
 * Root test of the case-fold rule for tracked paths (docs/G0-lot-fixture-case-fold-1.md): no two paths that git tracks in this
 * repository, their parent folders included, are equal once case is folded. On a case-insensitive file system (NTFS, the Windows
 * oracle) two such names are one entry: a checkout keeps one of the two files, and a test that lists the folder sees both spellings
 * as one. Linux keeps both, so a suite green here is red there (PR #243, held on Windows for that reason: two folders of a fixture
 * repository that test/no-host-address.test.ts writes at run time, which its fixture() helper now refuses). The fold is the rule of
 * test/helpers/case-fold.ts: each path segment lower-cased after NFC normalisation, a name being each prefix of a path (its folders
 * and the path itself); stricter than NTFS on the NFC axis (NTFS keeps a composed and a decomposed spelling apart, the macOS file
 * systems merge them). The function is exercised here on synthetic lists, then on `git ls-files -z` of the repository root. The line
 * above each test is the mutation of the helper that reddens it (scripts/red-proof.mjs).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { caseOnlyCollisions } from "./helpers/case-fold.ts";
import { gitOut } from "./helpers/git-tracked.ts";

const ROOT = join(import.meta.dirname, "..");

// reddened by: a segment compared as written, its case kept
// killer: test/helpers/case-fold.ts:10 CONST "segment.normalize(\"NFC\").toLowerCase()" -> "segment.normalize(\"NFC\")"
test("case_fold_two_names_that_differ_only_by_case_are_one_group", () => {
  assert.deepEqual(caseOnlyCollisions(["test/fixtures/a/README.md", "test/fixtures/a/readme.md", "test/fixtures/a/notes.md"]),
    [["test/fixtures/a/README.md", "test/fixtures/a/readme.md"]],
    "two spellings of one file name in one folder are one group; the third file, whose name differs by more than case, is in no group");
});

// reddened by: only the whole path taken as a name, its folders never compared
// killer: test/helpers/case-fold.ts:20 CONST "let i = 1; i <= parts.length" -> "let i = parts.length; i <= parts.length"
test("case_fold_a_directory_segment_counts_like_a_file_name", () => {
  assert.deepEqual(caseOnlyCollisions(["test/fixtures/A/x.json", "test/fixtures/a/y.json"]), [["test/fixtures/A", "test/fixtures/a"]],
    "two folders that differ only by case are one group even when the files under them differ");
  assert.deepEqual(caseOnlyCollisions(["test/fixtures/A/x.json", "test/fixtures/a/x.json"]),
    [["test/fixtures/A", "test/fixtures/a"], ["test/fixtures/A/x.json", "test/fixtures/a/x.json"]],
    "the pair of #243's kind: the two folders are one group and the two files another");
});

// reddened by: the NFC step dropped, so a composed and a decomposed spelling stay two names
// killer: test/helpers/case-fold.ts:10 CONST "segment.normalize(\"NFC\").toLowerCase()" -> "segment.toLowerCase()"
test("case_fold_a_combining_mark_that_nfc_merges_is_the_same_name", () => {
  // "n" then U+0303 (combining tilde) and U+00F1 (n with tilde) are one character once normalised to NFC.
  const composed = "docs/ma\u00f1ana.md", decomposed = "docs/man\u0303ana.md", upper = "docs/MA\u00d1ANA.md";
  assert.notEqual(composed, decomposed, "the two spellings differ as strings");
  assert.deepEqual(caseOnlyCollisions([composed, decomposed, upper]), [[upper, decomposed, composed]],
    "the three spellings are one group: the mark is merged by NFC before the case is folded");
});

// reddened by: a single spelling counted as a group
// killer: test/helpers/case-fold.ts:27 CONST "s.size > 1" -> "s.size > 0"
test("case_fold_distinct_names_and_a_repeated_path_give_no_group", () => {
  assert.deepEqual(caseOnlyCollisions(["test/fixtures/alpha.json", "test/fixtures/beta.json", "docs/alpha.json", "docs/alpha.json", "scripts/alpha-1.mjs"]), [],
    "names that differ by more than case, a path listed twice and a folder spelled the same way under each path: no group");
});

test("case_fold_an_empty_list_gives_no_group", () => {
  assert.deepEqual(caseOnlyCollisions([]), []);
});

// reddened by: the prefix loop started at the second segment, so a top-level name is never compared
// killer: test/helpers/case-fold.ts:20 CONST "let i = 1" -> "let i = 2"
test("case_fold_two_top_level_names_that_differ_only_by_case_are_one_group", () => {
  assert.deepEqual(caseOnlyCollisions(["LICENSE", "license", "docs/x.md"]), [["LICENSE", "license"]],
    "a path of one segment is a name too: the two spellings at the root are one group");
});

test("tracked_paths_have_no_case_only_collision", () => {
  const paths = gitOut(ROOT, ["ls-files", "-z"]).split("\0").filter((p) => p !== "");
  assert.ok(paths.includes("test/tracked-paths-case-fold.test.ts"), "git ls-files read the repository root: this file is among the tracked paths");
  const groups = caseOnlyCollisions(paths);
  assert.deepEqual(groups, [], `tracked paths equal once case is folded (one entry on NTFS): ${groups.map((g) => g.join(" ~ ")).join("; ")}`);
});
