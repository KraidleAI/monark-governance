/**
 * Non-LLM tests for `scripts/lot/retire.mjs` and `scripts/lot/ages.mjs` (ADR-METHODE-2 D7, M-8). Each
 * test builds then destroys its OWN fixture repo (isolated from the host's git config): no shared
 * state, so no mutant can cascade into a test that is not its own (doctrine A-11). Scripts are invoked
 * as subprocesses (never imported). Each test names, in a preceding comment, its own mutation (harness
 * F:\tmp\methode\m8\mutants\run-mutants.mjs, sha256 restore after each mutant).
 */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const SCRIPTS_ROOT = fileURLToPath(new URL("../", import.meta.url));
const RETIRE = join(SCRIPTS_ROOT, "scripts", "lot", "retire.mjs");
const AGES = join(SCRIPTS_ROOT, "scripts", "lot", "ages.mjs");
const TMP_BASE = tmpdir(); // honors TEMP/TMPDIR on win32; portable elsewhere (house pattern, C-outillage)

function identityEnv(date: string) {
  return {
    GIT_AUTHOR_NAME: "Fixture",
    GIT_AUTHOR_EMAIL: "fixture@example.invalid",
    GIT_COMMITTER_NAME: "Fixture",
    GIT_COMMITTER_EMAIL: "fixture@example.invalid",
    GIT_AUTHOR_DATE: date,
    GIT_COMMITTER_DATE: date,
  };
}

/** Isolates the fixture repo from the host's global/system git config. */
const GIT_ISOLATION = { GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "" };

function sh(cwd: string, args: string[], extraEnv: Record<string, string> = {}): string {
  const r = spawnSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...GIT_ISOLATION, ...extraEnv },
  });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")} (cwd=${cwd}) failed: ${r.stderr}`);
  }
  return r.stdout;
}

function shTolerant(cwd: string, args: string[]) {
  return spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8", env: { ...process.env, ...GIT_ISOLATION } });
}

function runRetire(argv: string[]) {
  return spawnSync(process.execPath, [RETIRE, ...argv], { encoding: "utf8", env: { ...process.env, ...GIT_ISOLATION } });
}

function runAges(argv: string[]) {
  return spawnSync(process.execPath, [AGES, ...argv], { encoding: "utf8", env: { ...process.env, ...GIT_ISOLATION } });
}

interface AgeRow { path: string; branch: string | null; merged: boolean | null; dirty: boolean | null; ageDays: number | null }

interface Fixture {
  root: string;
  repo: string;
  wtMerged: string;
  wtUnmerged: string;
  wtDirty: string;
  wtInTree: string;
  wtReleaseOnly: string;
  wtSpace: string;
  wtVanish: string;
}

let fx: Fixture;

beforeEach(() => {
  const root = mkdtempSync(join(TMP_BASE, "lot-retire-"));
  const repo = join(root, "repo");
  sh(root, ["init", "-q", "-b", "trunk", "repo"]);
  writeFileSync(join(repo, "a.txt"), "init\n");
  sh(repo, ["add", "a.txt"]);
  sh(repo, ["commit", "-q", "-m", "init"], identityEnv("2026-09-01T00:00:00Z"));

  // merged, clean -- must be RETIRED
  const wtMerged = join(root, "wt-merged");
  sh(repo, ["worktree", "add", "-q", "-b", "feat-merged", wtMerged, "trunk"]);
  writeFileSync(join(wtMerged, "b.txt"), "b\n");
  sh(wtMerged, ["add", "b.txt"]);
  sh(wtMerged, ["commit", "-q", "-m", "feat-merged"], identityEnv("2026-09-15T00:00:00Z"));
  sh(repo, ["merge", "-q", "--no-edit", "feat-merged"]);

  // not merged -- must stay KEEP
  const wtUnmerged = join(root, "wt-unmerged");
  sh(repo, ["worktree", "add", "-q", "-b", "feat-unmerged", wtUnmerged, "trunk"]);
  writeFileSync(join(wtUnmerged, "c.txt"), "c\n");
  sh(wtUnmerged, ["add", "c.txt"]);
  sh(wtUnmerged, ["commit", "-q", "-m", "feat-unmerged"], identityEnv("2026-09-20T00:00:00Z"));

  // merged but dirty -- must stay KEEP
  const wtDirty = join(root, "wt-dirty");
  sh(repo, ["worktree", "add", "-q", "-b", "feat-dirty", wtDirty, "trunk"]);
  writeFileSync(join(wtDirty, "d.txt"), "d\n");
  sh(wtDirty, ["add", "d.txt"]);
  sh(wtDirty, ["commit", "-q", "-m", "feat-dirty"], identityEnv("2026-09-10T00:00:00Z"));
  sh(repo, ["merge", "-q", "--no-edit", "feat-dirty"]);
  appendFileSync(join(wtDirty, "d.txt"), "uncommitted\n");

  // under the repo tree -- must be REFUSE-IN-TREE, never removed
  const wtInTree = join(repo, ".claude", "worktrees", "x");
  sh(repo, ["worktree", "add", "-q", "-b", "feat-intree", wtInTree, "trunk"]);

  // merged only into "release" (never into the repo's actual HEAD, "trunk"): checks that the code
  // really uses `branch -d` (which revalidates against the real HEAD), not `-D`.
  const wtReleaseOnly = join(root, "wt-release-only");
  sh(repo, ["worktree", "add", "-q", "-b", "feat-release-only", wtReleaseOnly, "trunk"]);
  writeFileSync(join(wtReleaseOnly, "r.txt"), "r\n");
  sh(wtReleaseOnly, ["add", "r.txt"]);
  sh(wtReleaseOnly, ["commit", "-q", "-m", "feat-release-only"], identityEnv("2026-09-18T00:00:00Z"));
  sh(repo, ["branch", "-q", "release", "feat-release-only"]); // repo stays on "trunk", never merged there

  // path with a space (Review Focus #3) -- merged, clean -- must be RETIRED like the others
  const wtSpace = join(root, "wt with space");
  sh(repo, ["worktree", "add", "-q", "-b", "feat-space", wtSpace, "trunk"]);
  writeFileSync(join(wtSpace, "s.txt"), "s\n");
  sh(wtSpace, ["add", "s.txt"]);
  sh(wtSpace, ["commit", "-q", "-m", "feat-space"], identityEnv("2026-09-19T00:00:00Z"));
  sh(repo, ["merge", "-q", "--no-edit", "feat-space"]);

  // directory that will vanish from disk (Review Focus #1, "prunable") -- merged, clean at first; only
  // the dedicated test removes it from disk afterwards (git has not "pruned" it yet)
  const wtVanish = join(root, "wt-vanish");
  sh(repo, ["worktree", "add", "-q", "-b", "feat-vanish", wtVanish, "trunk"]);
  writeFileSync(join(wtVanish, "v.txt"), "v\n");
  sh(wtVanish, ["add", "v.txt"]);
  sh(wtVanish, ["commit", "-q", "-m", "feat-vanish"], identityEnv("2026-09-05T00:00:00Z"));
  sh(repo, ["merge", "-q", "--no-edit", "feat-vanish"]);

  fx = { root, repo, wtMerged, wtUnmerged, wtDirty, wtInTree, wtReleaseOnly, wtSpace, wtVanish };
});

afterEach(() => {
  const { repo, wtMerged, wtUnmerged, wtDirty, wtInTree, wtReleaseOnly, wtSpace, wtVanish, root } = fx;
  for (const wt of [wtMerged, wtUnmerged, wtDirty, wtInTree, wtReleaseOnly, wtSpace, wtVanish]) {
    shTolerant(repo, ["worktree", "remove", "--force", wt]);
  }
  try {
    rmSync(root, { recursive: true, force: true, maxRetries: 3 });
  } catch {
    /* tolerated Windows leftover (transient lock), never a test failure */
  }
});

// killer: scripts/lot/retire.mjs:111 "!merged.has(wt.branch)" -> "merged.has(wt.branch)" (merged check inverted)
test("lot_retire_unmerged_branch_is_kept", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtUnmerged]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^KEEP .*not-merged$/m);
  const list = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  assert.match(list, /feat-unmerged/, "the unmerged worktree must survive");
});

// killer: scripts/lot/retire.mjs:137 "st.stdout.trim() !== ''" -> "false" (dirty check removed)
test("lot_retire_merged_dirty_worktree_is_kept", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtDirty]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^KEEP .*dirty$/m);
  const list = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  assert.match(list, /feat-dirty/, "the dirty worktree must survive despite being merged");
});

// killer: scripts/lot/retire.mjs:93 "if ((wtNorm + '/').startsWith(repoNorm))" -> "if (false)" (in-tree guard removed)
test("lot_retire_in_tree_worktree_is_refused", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtInTree]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^REFUSE-IN-TREE /m);
  assert.doesNotMatch(r.stdout, /^RETIRE/m);
  const list = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  assert.match(list, /feat-intree/, "a worktree under the repo tree is never removed by this tool");
});

// killer: scripts/lot/retire.mjs:145 "if (args.dryRun)" -> "if (false)" (dry-run acting for real)
test("lot_retire_dry_run_changes_nothing", () => {
  const before1 = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  const branchesBefore = sh(fx.repo, ["branch", "--list"]);
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--dry-run"]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^RETIRE .*feat-merged$/m);
  assert.match(r.stdout, /^KEEP .*not-merged$/m);
  assert.match(r.stdout, /^KEEP .*dirty$/m);
  assert.match(r.stdout, /^REFUSE-IN-TREE /m);
  const after1 = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  const branchesAfter = sh(fx.repo, ["branch", "--list"]);
  assert.equal(after1, before1, "--dry-run must not change the worktree list");
  assert.equal(branchesAfter, branchesBefore, "--dry-run must not delete any branch");
});

// killer: scripts/lot/ages.mjs:58 ".slice(1)" -> "" (the main worktree shows up in the table)
test("lot_ages_reports_the_seven_remaining_worktrees", () => {
  const r = runAges(["--repo", fx.repo, "--trunk", "trunk", "--json"]);
  assert.equal(r.status, 0, r.stderr);
  const rows = JSON.parse(r.stdout) as AgeRow[];
  assert.equal(rows.length, 7, "merged, unmerged, dirty, intree, release-only, space, vanish");
  const paths = rows.map((row: AgeRow) => row.path);
  assert.ok(paths.some((p: string) => p.includes("wt-merged")));
  assert.ok(paths.some((p: string) => p.includes("wt-unmerged")));
  assert.ok(paths.some((p: string) => p.includes("wt-dirty")));
  assert.ok(!paths.some((p: string) => p.replace(/\\/g, "/") === fx.repo.replace(/\\/g, "/")));
  const dirtyRow = rows.find((row: AgeRow) => row.path.includes("wt-dirty"));
  assert.equal(dirtyRow?.dirty, true);
  assert.equal(dirtyRow?.merged, true);
  const unmergedRow = rows.find((row: AgeRow) => row.path.includes("wt-unmerged"));
  assert.equal(unmergedRow?.merged, false);
});

// killer: scripts/lot/ages.mjs:67 "86400" -> "3600" (age divided by the wrong constant)
test("lot_ages_age_in_days_matches_the_committer_date", () => {
  const r = runAges(["--repo", fx.repo, "--trunk", "trunk", "--json"]);
  assert.equal(r.status, 0, r.stderr);
  const rows = JSON.parse(r.stdout) as AgeRow[];
  const dirtyAge = rows.find((row: AgeRow) => row.path.includes("wt-dirty"))?.ageDays ?? NaN;
  // commit date "2026-09-10T00:00:00Z": age recomputed independently (expected epoch, 1-day epsilon)
  const expectedSeconds = Math.floor(Date.now() / 1000) - Date.parse("2026-09-10T00:00:00Z") / 1000;
  const expectedDays = expectedSeconds / 86400;
  assert.ok(Math.abs(dirtyAge - expectedDays) < 1, `ageDays=${dirtyAge} expected close to ${expectedDays}`);
});

// killer: scripts/lot/ages.mjs:77 "(b.ageDays ?? -1) - (a.ageDays ?? -1)" -> "(a.ageDays ?? -1) - (b.ageDays ?? -1)" (sort reversed)
test("lot_ages_rows_are_sorted_oldest_first", () => {
  const r = runAges(["--repo", fx.repo, "--trunk", "trunk", "--json"]);
  assert.equal(r.status, 0, r.stderr);
  const rows = JSON.parse(r.stdout) as AgeRow[];
  for (let i = 1; i < rows.length; i++) {
    assert.ok(
      (rows[i - 1]?.ageDays ?? -1) >= (rows[i]?.ageDays ?? -1),
      "each row must be older than or equal to the next",
    );
  }
});

// killer: scripts/lot/retire.mjs:38 "line.slice('worktree '.length)" -> "line.split(' ')[1]" (path truncated at first space)
test("lot_retire_worktree_path_with_a_space_is_retired", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtSpace]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^RETIRE .*wt with space feat-space$/m);
  const list = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  assert.doesNotMatch(list, /feat-space/);
});

// killer: scripts/lot/retire.mjs:105 "if (wt.prunable)" -> "if (false)" (spawns `git status` on a vanished directory)
test("lot_retire_prunable_worktree_is_kept_never_attempted", () => {
  rmSync(fx.wtVanish, { recursive: true, force: true });
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtVanish]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^KEEP .*prunable$/m);
  const branches = sh(fx.repo, ["branch", "--list", "feat-vanish"]);
  assert.match(branches, /feat-vanish/, "never removed while the directory is missing (Q-M8)");
});

// killer: scripts/lot/retire.mjs:150 "'remove'" -> "'--help'" (removes nothing, prints a fake RETIRE)
test("lot_retire_merged_clean_worktree_is_retired", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtMerged]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^RETIRE .*feat-merged$/m);
  const list = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  assert.doesNotMatch(list, /feat-merged/);
  const branches = sh(fx.repo, ["branch", "--list", "feat-merged"]);
  assert.equal(branches.trim(), "", "the merged branch must be deleted (-d)");
});

// killer: scripts/lot/retire.mjs:157 "'-d'" -> "'-D'" (force-deletes despite the real HEAD's refusal)
test("lot_retire_refuses_to_force_delete_branch_not_merged_into_repos_own_head", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "release", "--only", fx.wtReleaseOnly]);
  // merged into "release" (passes check (a)) but NOT into the repo's real HEAD ("trunk"):
  // `git branch -d` (never -D) revalidates independently and refuses -> exit 2, branch intact.
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /branch -d failed/);
  const branches = sh(fx.repo, ["branch", "--list", "feat-release-only"]);
  assert.match(branches, /feat-release-only/, "`-d` must refuse: never `-D`, which would force the deletion");
});
