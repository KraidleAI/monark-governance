/**
 * Root test of the case-fold rule for tracked paths (docs/G0-lot-fixture-case-fold-1.md): no two paths that git tracks in this
 * repository, their parent folders included, are equal once case is folded. On a case-insensitive file system (NTFS, the Windows
 * oracle) two such names are one entry: a checkout keeps one of the two files, and a test that lists the folder sees both spellings
 * as one. Linux keeps both, so a suite green here is red there (PR #243, held on Windows for that reason). The fold is the one of the
 * atelier's casefold tool: each path segment is normalised to NFC, then lower-cased; a name is each prefix of a path (its folders and
 * the path itself). The function lives in this file: it is exercised on synthetic lists, then on `git ls-files -z` of the repository
 * root. This file carries no killer line: a killer never mutates a *.test.ts (killerProblem of scripts/red-proof.mjs), and the zone of
 * the change holds no support module; the red proof is the fold stubbed in the first commit of the branch (the note names its tap).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { gitOut } from "./helpers/git-tracked.ts";

const ROOT = join(import.meta.dirname, "..");

/** A path segment as a case-insensitive file system compares it: NFC, then lower case (the fold of the atelier's casefold tool). */
const fold = (segment: string): string => segment.normalize("NFC").toLowerCase();

/**
 * The groups of names, among `paths` and their parent folders, that are equal once each segment is folded: each group holds two or
 * more distinct spellings, sorted; the groups are sorted by their first spelling. No group means the list is safe on NTFS.
 */
function caseOnlyCollisions(paths: readonly string[]): string[][] {
  const spellings = new Map<string, Set<string>>(); // folded name -> its distinct spellings
  for (const p of paths) {
    const parts = p.split("/").filter((s) => s !== "");
    for (let i = 1; i <= parts.length; i++) {
      const name = parts.slice(0, i).join("/"), key = parts.slice(0, i).map(fold).join("/");
      let seen = spellings.get(key);
      if (seen === undefined) { seen = new Set(); spellings.set(key, seen); }
      seen.add(name);
    }
  }
  return [...spellings.values()].filter((s) => s.size > 1).map((s) => [...s].sort()).sort((a, b) => ((a[0] ?? "") < (b[0] ?? "") ? -1 : 1));
}

test("case_fold_two_names_that_differ_only_by_case_are_one_group", () => {
  assert.deepEqual(caseOnlyCollisions(["test/fixtures/a/README.md", "test/fixtures/a/readme.md", "test/fixtures/a/notes.md"]),
    [["test/fixtures/a/README.md", "test/fixtures/a/readme.md"]],
    "two spellings of one file name in one folder are one group; the third file, whose name differs by more than case, is in no group");
});

test("case_fold_a_directory_segment_counts_like_a_file_name", () => {
  assert.deepEqual(caseOnlyCollisions(["test/fixtures/A/x.json", "test/fixtures/a/y.json"]), [["test/fixtures/A", "test/fixtures/a"]],
    "two folders that differ only by case are one group even when the files under them differ");
  assert.deepEqual(caseOnlyCollisions(["test/fixtures/A/x.json", "test/fixtures/a/x.json"]),
    [["test/fixtures/A", "test/fixtures/a"], ["test/fixtures/A/x.json", "test/fixtures/a/x.json"]],
    "the pair of #243's kind: the two folders are one group and the two files another");
});

test("case_fold_a_combining_mark_that_nfc_merges_is_the_same_name", () => {
  // "e" then U+0301 (combining acute accent) and U+00E9 (e with acute) are one character once normalised to NFC.
  const composed = "docs/café.md", decomposed = "docs/café.md", upper = "docs/CAFÉ.md";
  assert.notEqual(composed, decomposed, "the two spellings differ as strings");
  assert.deepEqual(caseOnlyCollisions([composed, decomposed, upper]), [[upper, decomposed, composed]],
    "the three spellings are one group: the mark is merged by NFC before the case is folded");
});

test("case_fold_distinct_names_and_a_repeated_path_give_no_group", () => {
  assert.deepEqual(caseOnlyCollisions(["test/fixtures/alpha.json", "test/fixtures/beta.json", "docs/alpha.json", "docs/alpha.json", "scripts/alpha-1.mjs"]), [],
    "names that differ by more than case, a path listed twice and a folder spelled the same way under each path: no group");
});

test("case_fold_an_empty_list_gives_no_group", () => {
  assert.deepEqual(caseOnlyCollisions([]), []);
});

test("tracked_paths_have_no_case_only_collision", () => {
  const paths = gitOut(ROOT, ["ls-files", "-z"]).split("\0").filter((p) => p !== "");
  assert.ok(paths.includes("test/tracked-paths-case-fold.test.ts"), "git ls-files read the repository root: this file is among the tracked paths");
  const groups = caseOnlyCollisions(paths);
  assert.deepEqual(groups, [], `tracked paths equal once case is folded (one entry on NTFS): ${groups.map((g) => g.join(" ~ ")).join("; ")}`);
});
