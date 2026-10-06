/**
 * Non-LLM tests for `scripts/lot/retire.mjs` and `scripts/lot/ages.mjs` (ADR-METHODE-2 D7, M-8). Each
 * test builds then destroys its OWN fixture repo (isolated from the host's git config): no shared
 * state, so no mutant can cascade into a test that is not its own (doctrine A-11). Scripts are invoked
 * as subprocesses (never imported). Each test names, in a preceding comment, its own mutation (harness
 * F:\tmp\methode\m8\mutants\run-mutants.mjs, RM05 excluded/neutralized (C-M8-HELP-1), sha256 restore after each mutant).
 */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, appendFileSync, existsSync, mkdirSync, symlinkSync, copyFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const SCRIPTS_ROOT = fileURLToPath(new URL("../", import.meta.url));
const RETIRE = join(SCRIPTS_ROOT, "scripts", "lot", "retire.mjs");
const AGES = join(SCRIPTS_ROOT, "scripts", "lot", "ages.mjs");
const TMP_BASE = tmpdir(); // honors TEMP/TMPDIR on win32; portable elsewhere (house pattern, C-outillage)

function identityEnv(date: string, authorDate = date) {
  return {
    GIT_AUTHOR_NAME: "Fixture",
    GIT_AUTHOR_EMAIL: "fixture@example.invalid",
    GIT_COMMITTER_NAME: "Fixture",
    GIT_COMMITTER_EMAIL: "fixture@example.invalid",
    GIT_AUTHOR_DATE: authorDate,
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

// ---- identity of a directory, not its spelling (C-G2-24, corrections tour 3): UNC, junction and forged registrations ----
const WIN = process.platform === "win32";
const BS = String.fromCharCode(92);
/** F:/x/y -> \\localhost\F$\x\y: the host's administrative share in loopback, never a remote host. */
const unc = (p: string) => BS + BS + "localhost" + BS + p.slice(0, 1).toUpperCase() + "$" + p.slice(2).replace(/[\\/]/g, BS);
const UNC_OK = WIN && existsSync(unc(TMP_BASE)); // a host may disable the share: the UNC tests are then skipped, never red
/** safe.directory=* for ONE command (GIT_CONFIG_COUNT), never the host's config: git refuses a UNC worktree by default. */
const SAFE_ALL = { GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "safe.directory", GIT_CONFIG_VALUE_0: "*" };

function runRetireAt(cwd: string, argv: string[], extraEnv: Record<string, string> = {}) {
  return spawnSync(process.execPath, [RETIRE, ...argv], { cwd, encoding: "utf8", env: { ...process.env, ...GIT_ISOLATION, ...extraEnv } });
}

/** Re-points a linked worktree's registration (its gitdir file) at an alias: a forged record, fixture only (git registers real paths). */
function forgeGitdir(repo: string, adminName: string, alias: string) {
  writeFileSync(join(repo, ".git", "worktrees", adminName, "gitdir"), `${alias.split(BS).join("/")}/.git\n`);
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
  sh(wtDirty, ["commit", "-q", "-m", "feat-dirty"], identityEnv("2026-09-10T00:00:00Z", "2026-08-01T00:00:00Z"));
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

// killer: scripts/lot/retire.mjs:77 COR "!merged.has(wt.branch)" -> "merged.has(wt.branch)"
test("lot_retire_unmerged_branch_is_kept", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtUnmerged]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^KEEP .*not-merged$/m);
  const list = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  assert.match(list, /feat-unmerged/, "the unmerged worktree must survive");
});

// killer: scripts/lot/retire.mjs:103 COR "st.stdout.trim() !== ''" -> "false"
test("lot_retire_merged_dirty_worktree_is_kept", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtDirty]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^KEEP .*dirty$/m);
  const list = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  assert.match(list, /feat-dirty/, "the dirty worktree must survive despite being merged");
});

// killer: scripts/lot/retire.mjs:57 COR "if (within(wt.path, mainId))" -> "if (false)"
test("lot_retire_in_tree_worktree_is_refused", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtInTree]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^REFUSE-IN-TREE /m);
  assert.doesNotMatch(r.stdout, /^RETIRE/m);
  const list = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  assert.match(list, /feat-intree/, "a worktree under the repo tree is never removed by this tool");
});

// killer: scripts/lot/retire.mjs:111 COR "if (args.dryRun)" -> "if (false)"
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

// killer: scripts/lot/ages.mjs:69 CONST "slice(1)" -> "slice(0)"
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

// killer: scripts/lot/ages.mjs:58 CONST "86400" -> "3600"
test("lot_ages_age_in_days_matches_the_committer_date", () => {
  const r = runAges(["--repo", fx.repo, "--trunk", "trunk", "--json"]);
  assert.equal(r.status, 0, r.stderr);
  const rows = JSON.parse(r.stdout) as AgeRow[];
  const dirtyAge = rows.find((row: AgeRow) => row.path.includes("wt-dirty"))?.ageDays ?? NaN;
  // commit date "2026-09-10T00:00:00Z": age recomputed independently (expected epoch, 0.001-day epsilon, ~86.4s)
  const expectedSeconds = Math.floor(Date.now() / 1000) - Date.parse("2026-09-10T00:00:00Z") / 1000;
  const expectedDays = expectedSeconds / 86400;
  assert.ok(Math.abs(dirtyAge - expectedDays) < 0.001, `ageDays=${dirtyAge} expected close to ${expectedDays}`);
});

// killer: scripts/lot/ages.mjs:86 COR "(b.ageDays ?? -1) - (a.ageDays ?? -1)" -> "(a.ageDays ?? -1) - (b.ageDays ?? -1)"
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

// killer: scripts/lot/ages.mjs:32 COR "line.slice('worktree '.length)" -> "line.split(' ')[1]"
test("lot_retire_worktree_path_with_a_space_is_retired", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtSpace]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^RETIRE .*wt with space feat-space$/m);
  const list = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  assert.doesNotMatch(list, /feat-space/);
});

// killer: scripts/lot/retire.mjs:69 COR "if (wt.prunable)" -> "if (false)"
test("lot_retire_prunable_worktree_is_kept_never_attempted", () => {
  rmSync(fx.wtVanish, { recursive: true, force: true });
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtVanish]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^KEEP .*prunable$/m);
  const branches = sh(fx.repo, ["branch", "--list", "feat-vanish"]);
  assert.match(branches, /feat-vanish/, "never removed while the directory is missing (Q-M8)");
});

// killer: scripts/lot/retire.mjs:115 CONST "'remove'" -> "'list'"
test("lot_retire_merged_clean_worktree_is_retired", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtMerged]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^RETIRE .*feat-merged$/m);
  const list = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  assert.doesNotMatch(list, /feat-merged/);
  const branches = sh(fx.repo, ["branch", "--list", "feat-merged"]);
  assert.equal(branches.trim(), "", "the merged branch must be deleted (-d)");
});

// killer: scripts/lot/retire.mjs:123 CONST "'-d'" -> "'-D'"
test("lot_retire_refuses_to_force_delete_branch_not_merged_into_repos_own_head", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "release", "--only", fx.wtReleaseOnly]);
  // merged into "release" (passes check (a)) but NOT into the repo's real HEAD ("trunk"):
  // `git branch -d` (never -D) revalidates independently and refuses -> exit 2, branch intact.
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /branch -d failed/);
  assert.match(r.stdout, /^RETIRE-PARTIAL .*wt-release-only feat-release-only branch-kept$/m); // C-G2-12: the intermediate state is printed
  assert.match(r.stdout, /^refused-branch=0 partial=1 offvolume=0$/m); // and counted
  const branches = sh(fx.repo, ["branch", "--list", "feat-release-only"]);
  assert.match(branches, /feat-release-only/, "`-d` must refuse: never `-D`, which would force the deletion");
});

// killer: scripts/lot/retire.mjs:14 COR "(path.dirname(p) !== p && climb(path.dirname(p), outerId))" -> "false"
test("lot_retire_in_tree_worktree_registered_through_unc_is_refused", { skip: UNC_OK ? false : "no administrative share (win32 only)" }, () => {
  const wt = join(fx.repo, ".claude", "worktrees", "u4");
  sh(fx.repo, ["worktree", "add", "-q", "-b", "feat-u4", unc(wt), "trunk"], SAFE_ALL); // merged by construction (no commit of its own), clean
  assert.match(sh(fx.repo, ["worktree", "list", "--porcelain"]), /^worktree \/\/localhost\/.*u4$/m, "git keeps the UNC spelling (U4)");
  const r = runRetireAt(fx.root, ["--repo", fx.repo, "--trunk", "trunk", "--only", unc(wt)], SAFE_ALL); // --only = the registered spelling
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^REFUSE-IN-TREE \/\/localhost\/.*u4$/m);
  assert.ok(existsSync(join(wt, "a.txt")), "an in-tree worktree keeps its files");
  assert.match(sh(fx.repo, ["branch", "--list", "feat-u4"]), /feat-u4/, "and its branch");
});

// killer: scripts/lot/retire.mjs:63 COR "within(process.cwd(), wtId) || " -> ""
test("lot_retire_current_worktree_registered_through_unc_is_kept", { skip: UNC_OK ? false : "no administrative share (win32 only)" }, () => {
  const wt = join(fx.root, "wt-u5");
  sh(fx.repo, ["worktree", "add", "-q", "-b", "feat-u5", unc(wt), "trunk"], SAFE_ALL);
  assert.match(sh(fx.repo, ["worktree", "list", "--porcelain"]), /^worktree \/\/localhost\/.*wt-u5$/m, "git keeps the UNC spelling (U5)");
  const r = runRetireAt(wt, ["--repo", fx.repo, "--trunk", "trunk", "--only", unc(wt)], SAFE_ALL); // cwd = its drive spelling, --only = the registered one
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^KEEP \/\/localhost\/.*wt-u5 current-worktree$/m);
  assert.ok(existsSync(join(wt, "a.txt")), "the current worktree keeps its files");
  assert.match(sh(fx.repo, ["worktree", "list", "--porcelain"]), /wt-u5/, "and stays registered");
});

// killer: scripts/lot/retire.mjs:10 CONST "`${s.dev}:${s.ino}`" -> "p"
test("lot_retire_current_worktree_registered_through_a_junction_is_kept_from_the_junction", { skip: WIN ? false : "win32 junctions (measured on this host only)" }, () => {
  const alias = join(fx.root, "alias-merged");
  symlinkSync(fx.wtMerged, alias, "junction");
  forgeGitdir(fx.repo, "wt-merged", alias); // F1: the registration itself is an alias
  assert.match(sh(fx.repo, ["worktree", "list", "--porcelain"]), /^worktree .*alias-merged$/m, "the forged registration is read back");
  const r = runRetireAt(alias, ["--repo", fx.repo, "--trunk", "trunk"]); // real mode, the whole list, cwd = the junction
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^KEEP .*alias-merged current-worktree$/m);
  assert.ok(existsSync(join(fx.wtMerged, "b.txt")), "the current worktree keeps its files");
  assert.match(sh(fx.repo, ["branch", "--list", "feat-merged"]), /feat-merged/, "and its branch");
});

// killer: scripts/lot/retire.mjs:10 CONST "`${s.dev}:${s.ino}`" -> "'x'"
test("lot_retire_current_worktree_registered_through_a_junction_is_kept_from_its_real_path", { skip: WIN ? false : "win32 junctions (measured on this host only)" }, () => {
  const alias = join(fx.root, "alias-merged");
  symlinkSync(fx.wtMerged, alias, "junction");
  forgeGitdir(fx.repo, "wt-merged", alias); // F2: registered through the junction, cwd = the real path
  const r = runRetireAt(fx.wtMerged, ["--repo", fx.repo, "--trunk", "trunk", "--dry-run"]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^KEEP .*alias-merged current-worktree$/m);
  assert.doesNotMatch(r.stdout, /^RETIRE .*alias-merged /m);
});

// killer: scripts/lot/retire.mjs:63 COR " || within(repoArg, wtId)" -> ""
test("lot_retire_worktree_named_by_repo_through_a_junction_is_kept", { skip: WIN ? false : "win32 junctions (measured on this host only)" }, () => {
  const alias = join(fx.root, "alias-repo");
  symlinkSync(fx.wtMerged, alias, "junction");
  const r = runRetireAt(fx.root, ["--repo", alias, "--trunk", "trunk", "--only", fx.wtMerged]); // X7 through a junction, real mode
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^KEEP .*wt-merged current-worktree$/m);
  assert.ok(existsSync(join(fx.wtMerged, "b.txt")), "the worktree git runs in keeps its files");
  assert.match(sh(fx.repo, ["worktree", "list", "--porcelain"]), /feat-merged/, "and stays registered");
});

// killer: scripts/lot/retire.mjs:21 SDL "throw new Error('UNC cwd or --repo: local drive paths only')" -> ""
test("lot_retire_repo_given_through_unc_is_refused_before_any_action", { skip: UNC_OK ? false : "no administrative share (win32 only)" }, () => {
  const r = runRetireAt(fx.root, ["--repo", unc(fx.repo), "--trunk", "trunk", "--only", fx.wtMerged], SAFE_ALL);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /UNC cwd or --repo: local drive paths only/);
  assert.match(sh(fx.repo, ["worktree", "list", "--porcelain"]), /feat-merged/, "nothing removed");
});

// killer: scripts/lot/retire.mjs:21 COR "[repoArg, process.cwd()]" -> "[repoArg]"
test("lot_retire_cwd_through_unc_is_refused_before_any_action", { skip: UNC_OK ? false : "no administrative share (win32 only)" }, () => {
  const r = runRetireAt(unc(fx.wtMerged), ["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtMerged], SAFE_ALL);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /UNC cwd or --repo: local drive paths only/);
  assert.ok(existsSync(join(fx.wtMerged, "b.txt")), "nothing removed");
});

// killer: scripts/lot/retire.mjs:74 COR "if (wtId === null)" -> "if (false)"
test("lot_retire_locked_worktree_without_its_directory_is_kept_unreadable_and_the_pass_goes_on", () => {
  sh(fx.repo, ["worktree", "lock", "--reason", "lot en vol", fx.wtVanish]);
  rmSync(fx.wtVanish, { recursive: true, force: true }); // locked: git never reports it prunable
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--dry-run"]);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /^KEEP .*wt-vanish unreadable$/m);
  assert.match(r.stdout, /^RETIRE .*feat-merged$/m, "the other worktrees are still classified (never a global stop)");
  assert.match(sh(fx.repo, ["branch", "--list", "feat-vanish"]), /feat-vanish/);
});

// killer: scripts/lot/retire.mjs:19 CONST "fileId(path.resolve(args.only))" -> "path.resolve(args.only)"
test("lot_retire_only_given_through_a_junction_selects_the_worktree_it_names", { skip: WIN ? false : "win32 junctions (measured on this host only)" }, () => {
  const alias = join(fx.root, "alias-only");
  symlinkSync(fx.wtMerged, alias, "junction");
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--dry-run", "--only", alias]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^RETIRE .*wt-merged feat-merged$/m);
  assert.match(r.stdout, /^retired=1 kept=0 refused-in-tree=0$/m, "the alias selects exactly the worktree it names");
});

// killer: scripts/lot/retire.mjs:13 COR " || (real !== null && climb(real, outerId))" -> ""
test("lot_retire_worktree_named_by_repo_through_a_junction_to_its_subdirectory_is_kept", { skip: WIN ? false : "win32 junctions (measured on this host only)" }, () => {
  mkdirSync(join(fx.wtMerged, "sub")); // an empty directory: untracked by git, the worktree stays clean
  const alias = join(fx.root, "alias-sub");
  symlinkSync(join(fx.wtMerged, "sub"), alias, "junction"); // the spelling's parents never pass through the worktree: only its physical path does
  const r = runRetireAt(fx.root, ["--repo", alias, "--trunk", "trunk", "--only", fx.wtMerged]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^KEEP .*wt-merged current-worktree$/m);
  assert.ok(existsSync(join(fx.wtMerged, "b.txt")), "the worktree git runs in keeps its files");
});

// killer: scripts/lot/retire.mjs:13 CONST "realpathSync.native(inner)" -> "inner"
test("lot_retire_current_worktree_reached_through_a_junction_to_its_subdirectory_is_kept", { skip: WIN ? false : "win32 junctions (measured on this host only)" }, () => {
  mkdirSync(join(fx.wtMerged, "sub"));
  const alias = join(fx.root, "alias-sub");
  symlinkSync(join(fx.wtMerged, "sub"), alias, "junction");
  const r = runRetireAt(alias, ["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtMerged]); // the child's cwd keeps the junction spelling
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^KEEP .*wt-merged current-worktree$/m);
  assert.ok(existsSync(join(fx.wtMerged, "b.txt")), "the current worktree keeps its files");
});

// killer: scripts/lot/retire.mjs:13 COR " || (real !== null && climb(real, outerId))" -> ""
test("lot_retire_in_tree_worktree_registered_through_a_junction_into_the_tree_is_refused", { skip: WIN ? false : "win32 junctions (measured on this host only)" }, () => {
  const alias = join(fx.root, "alias-tree");
  symlinkSync(join(fx.repo, ".claude", "worktrees"), alias, "junction");
  forgeGitdir(fx.repo, "x", join(alias, "x")); // F3: the in-tree worktree's registration is spelled outside the tree
  assert.match(sh(fx.repo, ["worktree", "list", "--porcelain"]), /^worktree .*alias-tree\/x$/m, "the forged registration is read back");
  const r = runRetireAt(fx.root, ["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtInTree]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^REFUSE-IN-TREE .*alias-tree\/x$/m);
  assert.match(sh(fx.repo, ["branch", "--list", "feat-intree"]), /feat-intree/, "an in-tree worktree keeps its branch");
});

// ---- M-8b (ADR-METHODE-2 l.54): guards C-G2-9, C-G2-10, C-G2-21; pins C-G2-26, C-G2-27, C-G2-14; ages in the dry-run (METHODE-M8-AGES-WIRE-1) ----
// killer: scripts/lot/retire.mjs:55 COR "if (guarded.has(wt.branch))" -> "if (false)"
test("refuse-default-branch-and-trunk", () => {
  const wtMain = join(fx.root, "wt-main"), wtStable = join(fx.root, "wt-stable"), first = sh(fx.repo, ["rev-list", "--max-parents=0", "trunk"]).trim();
  sh(fx.repo, ["update-ref", "refs/remotes/origin/main", first]); // as on F:/Monark: origin/HEAD -> origin/main, main an ancestor of the trunk
  sh(fx.repo, ["symbolic-ref", "refs/remotes/origin/HEAD", "refs/remotes/origin/main"]);
  sh(fx.repo, ["worktree", "add", "-q", "-b", "main", wtMain, first]); // clean, merged into the trunk, not locked (X3)
  sh(fx.repo, ["worktree", "add", "-q", "-b", "stable", wtStable, "trunk"]); // the branch given by --trunk, in a linked worktree (X4)
  for (const extra of [["--dry-run"], ["--dry-run", "--only", wtMain], ["--only", wtStable], []]) { // dry-run and real, --only and the whole list
    const r = runRetire(["--repo", fx.repo, "--trunk", "stable", ...extra]);
    assert.equal(r.status, 2, r.stdout + r.stderr);
    if (!extra.includes(wtStable)) assert.match(r.stdout, /^REFUSE .*wt-main default-branch$/m);
    if (!extra.includes(wtMain)) assert.match(r.stdout, /^REFUSE .*wt-stable trunk$/m);
  }
  const list = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  for (const [wt, br] of [[wtMain, "main"], [wtStable, "stable"]] as const) {
    assert.ok(existsSync(join(wt, "a.txt")) && list.includes(`branch refs/heads/${br}`), `${br}: files, registration and branch kept`);
  }
});

// killer: scripts/lot/retire.mjs:75 COR "if (wt.locked)" -> "if (false)"
test("lot_retire_locked_worktree_is_kept_in_service", () => {
  sh(fx.repo, ["worktree", "lock", "--reason", "lot in flight", fx.wtMerged]); // merged and clean, but in service (Q-G2-2)
  for (const extra of [["--dry-run"], []]) { // the dry-run now agrees with the real mode (X2)
    const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtMerged, ...extra]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^KEEP .*wt-merged locked$/m);
  }
  assert.match(sh(fx.repo, ["branch", "--list", "feat-merged"]), /feat-merged/, "kept with its branch");
});

// killer: scripts/lot/ages.mjs:37 CONST "entry.locked = true" -> "entry.locked = false"
test("lot_retire_lot_branch_without_own_commit_locked_is_kept", () => {
  const wt = join(fx.root, "wt-lot"); // C-G2-25: a lot branch created from the trunk is merged by construction, its fresh worktree clean
  sh(fx.repo, ["worktree", "add", "-q", "-b", "lot/methode-x", wt, "trunk"]);
  sh(fx.repo, ["worktree", "lock", "--reason", "lot in flight", wt]);
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--dry-run"]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^KEEP .*wt-lot locked$/m);
});

// killer: scripts/lot/ages.mjs:14 COR " && !argv[i + 1].startsWith('--')" -> ""
test("only-double-dash-exit-2", () => {
  const before = sh(fx.repo, ["worktree", "list", "--porcelain"]);
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", "--dry-run"]); // --dry-run is never swallowed as the value of --only
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.equal(r.stdout, "", "refused before any worktree is read");
  assert.equal(sh(fx.repo, ["worktree", "list", "--porcelain"]), before);
});

// killer: scripts/lot/retire.mjs:11 COR "a !== null && " -> ""
test("lot_retire_repo_by_dos_prefix_with_a_locked_worktree_gone_is_kept_unreadable", { skip: WIN ? false : "win32 DOS device prefix" }, () => {
  sh(fx.repo, ["worktree", "lock", "--reason", "lot in flight", fx.wtVanish]);
  rmSync(fx.wtVanish, { recursive: true, force: true }); // locked: never prunable; gone: no identity
  const r = runRetire(["--repo", `//?/${fx.repo.split(BS).join("/")}`, "--trunk", "trunk", "--dry-run"]); // the root of this spelling has no identity either (EISDIR): M3 would equal the two nulls
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /^KEEP .*wt-vanish unreadable$/m);
});

// killer: scripts/lot/retire.mjs:13 COR "climb(inner, outerId) || " -> ""
test("lot_retire_locked_in_tree_worktree_gone_is_still_refused_in_tree", () => {
  sh(fx.repo, ["worktree", "lock", fx.wtInTree]);
  rmSync(fx.wtInTree, { recursive: true, force: true }); // no identity, no physical path: only the parents of its spelling reach the tree (MM1, R1)
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--dry-run"]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^REFUSE-IN-TREE .*worktrees\/x$/m);
});

// killer: scripts/lot/retire.mjs:21 CONST "realpathSync.native(p)" -> "p"
test("lot_retire_repo_through_a_symlink_to_unc_is_refused_by_its_physical_path", { skip: UNC_OK ? false : "no administrative share (win32 only)" }, (t) => {
  const link = join(fx.root, "repo-unc-link");
  try { symlinkSync(unc(fx.repo), link, "dir"); } catch { t.skip("no symbolic link privilege on this host"); return; }
  const r = runRetireAt(fx.root, ["--repo", link, "--trunk", "trunk", "--dry-run"], SAFE_ALL); // a drive spelling whose physical path is UNC (MM3, R3)
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /UNC cwd or --repo: local drive paths only/);
});

// killer: scripts/lot/ages.mjs:104 SDL "process.exitCode = 2; // C-G2-16" -> ""
test("lot_ages_failed_git_read_exits_2_with_its_message", () => {
  const r = runAges(["--repo", fx.repo, "--trunk", "no-such-trunk", "--json"]);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /^git branch --merged failed: /m);
  assert.equal(r.stdout, "");
});

// killer: scripts/lot/retire.mjs:121 COR "if (existsSync(wt.path))" -> "if (false)"
test("lot_retire_reports_the_residue_left_by_node_modules_junctions", { skip: WIN ? false : "win32 junctions (measured on this host only)" }, () => {
  const victim = join(fx.root, "victim"), dep = join(fx.wtMerged, "node_modules", "dep");
  mkdirSync(victim);
  writeFileSync(join(victim, "keep.txt"), "keep\n");
  appendFileSync(join(fx.repo, ".git", "info", "exclude"), "node_modules\n"); // ignored, as in a lot worktree: the worktree stays clean
  mkdirSync(join(fx.wtMerged, "node_modules"));
  symlinkSync(victim, dep, "junction"); // as mk-nm.ps1 lays them (X1): git removes the worktree, leaves the directory and the junction
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtMerged]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^RETIRE-RESIDUE .*wt-merged$/m);
  unlinkSync(dep); // the junction itself, never its target
  assert.ok(!existsSync(dep) && existsSync(join(victim, "keep.txt")), "junction removed and read back absent, its target intact");
});

// killer: scripts/lot/retire.mjs:97 CONST "['status', '--porcelain']" -> "['status', '--porcelain', '--untracked-files=no']"
test("lot_retire_worktree_with_only_an_untracked_file_is_dirty", () => {
  writeFileSync(join(fx.wtMerged, "new.txt"), "untracked\n"); // M02: never tried (git would refuse it, exit 2)
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtMerged]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^KEEP .*wt-merged dirty$/m);
  assert.ok(existsSync(join(fx.wtMerged, "new.txt")));
});

// killer: scripts/lot/retire.mjs:57 CONST "if (within(wt.path, mainId))" -> "if (wt.path.includes('.claude'))"
test("lot_retire_in_tree_worktree_outside_claude_is_refused", () => {
  const wt = join(fx.repo, "nested", "wt-in"); // P4b: under the tree, not under .claude/worktrees (M03)
  sh(fx.repo, ["worktree", "add", "-q", "-b", "feat-nested", wt, "trunk"]);
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--only", wt]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^REFUSE-IN-TREE .*nested\/wt-in$/m);
  assert.ok(existsSync(join(wt, "a.txt")), "never removed by this tool");
});

// killer: scripts/lot/retire.mjs:112 CONST "); retired++;" -> ");"
test("lot_retire_dry_run_counts_each_worktree_once", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--dry-run"]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^retired=3 kept=3 refused-in-tree=1$/m, "merged, space, vanish | unmerged, dirty, release-only | in-tree (M11)");
  assert.match(r.stdout, /^refused-branch=0 partial=0 offvolume=0$/m, "one volume here (C-V-5)");
});

// killer: scripts/lot/retire.mjs:49 CONST "for (const wt of rest)" -> "for (const wt of entries)"
test("lot_retire_never_classifies_the_main_worktree", () => {
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--dry-run"]);
  const main = ` ${fx.repo.split(BS).join("/")}`; // git prints forward slashes (M13)
  assert.ok(!r.stdout.split("\n").some((l) => l.endsWith(main) || l.includes(`${main} `)), r.stdout);
});

// killer: scripts/lot/retire.mjs:63 COR " || within(fileURLToPath(import.meta.url), wtId)" -> ""
test("lot_retire_worktree_holding_the_running_tool_is_kept", () => {
  const tool = join(fx.wtMerged, "tool"); // X6: the tool run from a worktree it would otherwise retire, cwd and --repo elsewhere
  mkdirSync(tool);
  copyFileSync(RETIRE, join(tool, "retire.mjs"));
  copyFileSync(AGES, join(tool, "ages.mjs"));
  sh(fx.wtMerged, ["add", "tool"]);
  sh(fx.wtMerged, ["commit", "-q", "-m", "tool"], identityEnv("2026-09-16T00:00:00Z"));
  sh(fx.repo, ["merge", "-q", "--no-edit", "feat-merged"], identityEnv("2026-09-16T00:00:00Z"));
  const r = spawnSync(process.execPath, [join(tool, "retire.mjs"), "--repo", fx.repo, "--trunk", "trunk", "--only", fx.wtMerged], { cwd: fx.root, encoding: "utf8", env: { ...process.env, ...GIT_ISOLATION } });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^KEEP .*wt-merged current-worktree$/m);
  assert.ok(existsSync(join(tool, "retire.mjs")), "the running tool keeps its files");
});

// killer: scripts/lot/retire.mjs:53 CONST "const age = args.dryRun" -> "const age = false"
test("lot_retire_dry_run_prints_the_age_that_ages_mjs_reads", () => {
  const listed = [...sh(fx.repo, ["worktree", "list", "--porcelain"]).matchAll(/^worktree (.+)$/gm)].map((m) => m[1] ?? "").slice(1); // CA-11: git's own list
  const r = runRetire(["--repo", fx.repo, "--trunk", "trunk", "--dry-run"]);
  const rows = JSON.parse(runAges(["--repo", fx.repo, "--trunk", "trunk", "--json"]).stdout) as AgeRow[];
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(rows.length, listed.length);
  for (const p of listed) {
    const age = r.stdout.split("\n").find((l) => l.endsWith(` ${p}`) || l.includes(` ${p} `))?.split(" ")[1] ?? "";
    const days = rows.find((row) => row.path === p)?.ageDays ?? NaN;
    assert.ok(/^age=\d+\.\dd$/.test(age) && Math.abs(Number(age.slice(4, -1)) - days) <= 0.051, `${p}: ${age} against ${days} days (ages.mjs)`);
  }
});
