/**
 * Root test `r25_integration` (lot R25-INTEGRATION-RULE-1, ADR-M003 D9 nonies, G0 docs/G0-lot-r25-integration-rule-1.md
 * section 7; lot 1a: the module, T-1..T-9 and the G2 folds; lot 1b adds the CI and oracle wiring, T-10 and T-11).
 * Fixtures are throwaway git repositories under the OS temp dir whose PRs are real merge commits; proofs are written by
 * the test; the API is a stub. No network. The four E-5 killers: T-1, T-3, T-4, T-5.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { appendFileSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { buildProof, effective, REPO, SCHEMA, specsOf } from "../scripts/lot-size-integration.mjs";

const ROOT = join(import.meta.dirname, "..");
const TARGET = "base/c2-integration";
const ciOf = (bound: number): string => `jobs:
  r25:
    steps:
      - env:
          VIBEGATES_PR_LIMIT: "${bound}"
          VIBEGATES_CONTENT_LIMIT: "8000"
        run: |
          STAT=$(git diff --shortstat "origin/\${{ github.base_ref }}...HEAD" -- . ':(exclude)site/**') || {
            exit 1
          }
          CONTENT_STAT=$(git diff --shortstat "origin/\${{ github.base_ref }}...HEAD" -- 'site/**') || {
            exit 1
          }
          CHANGED=$(printf '%s\\n' "$STAT" | awk '{print 0}')
          CONTENT_CHANGED=$(printf '%s\\n' "$CONTENT_STAT" | awk '{print 0}')
          if [ "$CHANGED" -gt "$VIBEGATES_PR_LIMIT" ]; then
            exit 1
          fi
          if [ "$CONTENT_CHANGED" -gt "$VIBEGATES_CONTENT_LIMIT" ]; then
            exit 1
          fi
`;
const metric = (s: string): number => ["insertion", "deletion"].reduce((n, w) => n + Number(new RegExp(`(\\d+) ${w}`).exec(s)?.[1] ?? 0), 0);

/** A throwaway repo: trunk `lot/etude-suite` at t0 (workflow + module), target TARGET branched at t0. */
class Fx {
  readonly dir = mkdtempSync(join(tmpdir(), "r25i-"));
  readonly ci: string;
  constructor(ci = ciOf(1205)) {
    this.ci = ci;
    this.g("init", "-q", "-b", "lot/etude-suite");
    this.put(".github/workflows/ci.yml", ci);
    mkdirSync(join(this.dir, "scripts"));
    copyFileSync(join(ROOT, "scripts", "lot-size-integration.mjs"), join(this.dir, "scripts", "lot-size-integration.mjs"));
    this.commit("t0", "a.txt", 1);
    this.g("branch", TARGET);
  }
  g(...a: string[]): string {
    return execFileSync("git", ["-C", this.dir, "-c", "user.name=fx", "-c", "user.email=fx@localhost", "-c", "core.autocrlf=false", ...a], { encoding: "utf8" }).trim();
  }
  put(file: string, text: string): void { mkdirSync(dirname(join(this.dir, file)), { recursive: true }); appendFileSync(join(this.dir, file), text); }
  commit(msg: string, file: string, n: number): string {
    this.put(file, Array.from({ length: n }, (_, i) => `${msg} ${i}\n`).join(""));
    this.g("add", "-A");
    this.g("commit", "-qm", msg);
    return this.g("rev-parse", "HEAD");
  }
  merge(ref: string, msg: string): string { this.g("merge", "-q", "--no-ff", "-m", msg, ref); return this.g("rev-parse", "HEAD"); }
  written(base = TARGET): number[] { return specsOf(this.ci).map((s) => metric(this.g("diff", "--shortstat", `${base}...HEAD`, "--", ...s))); }
  count(proof: unknown, base = TARGET): ReturnType<typeof effective> & { w: number[] } {
    const w = this.written(base);
    return { ...effective({ cwd: this.dir, ciText: this.ci, base, proof, written: w }), w };
  }
  done(): void { rmSync(this.dir, { recursive: true, force: true, maxRetries: 3 }); }
}
const withFx = (fn: (fx: Fx) => void, ci?: string): void => { const fx = new Fx(ci); try { fn(fx); } finally { fx.done(); } };

/** Trunk = PR #1 (feat, 5 + 35 lines, merged --no-ff: M1) + a direct push U (7) + an amended copy A' of x (5, same message). */
function trunk(fx: Fx): { m1: string; h1: string; x: string } {
  fx.g("checkout", "-q", "-b", "feat");
  const x = fx.commit("p1 part", "src/p1.txt", 5), h1 = fx.commit("p1 rest", "src/p1.txt", 35);
  fx.g("checkout", "-q", "lot/etude-suite");
  const m1 = fx.merge("feat", "Merge pull request #1");
  fx.commit("direct push", "src/u.txt", 7);
  fx.commit("p1 part", "src/amended.txt", 5);
  return { m1, h1, x };
}
const pr = (number: number, merge_commit_sha: string, head_sha: string, over: object = {}): object =>
  ({ number, base_ref: "lot/etude-suite", merged_at: "2026-10-05T00:00:00Z", merge_commit_sha, head_sha, r25: "success", ...over });
const proofOf = (fx: Fx, merged: object[], id: object = {}): object => ({
  schema: SCHEMA, repo: REPO, base_sha: null, head_sha: fx.g("rev-parse", "HEAD"), complete: true, merged,
  pr: { number: 7, head_ref: "lot/etude-suite", head_repo: REPO, base_ref: TARGET, base_repo: REPO, head_sha: fx.g("rev-parse", "HEAD"), ...id },
});
// killer: scripts/lot-size-integration.mjs:110 CONST "if (proven.has(c)) continue;" -> "if (proven.has(c) || ps.length === 1) continue;"
test("r25i_hidden_unreviewed_commit_is_counted - E-5 (1): a direct push and an amended copy of a reviewed commit count, the proven PR does not (A-1, A-2)", () => withFx((fx) => {
  const { m1, h1 } = trunk(fx);
  const r = fx.count(proofOf(fx, [pr(1, m1, h1)]));
  assert.deepEqual([r.mode, r.code, r.content, r.w], ["integration", 12, 0, [52, 0]], r.detail.join("\n"));
}));

// killer: scripts/lot-size-integration.mjs:54 CONST "ps.length === 2 && ps[1] === p.head_sha" -> "ps.length === 2"
test("r25i_merged_head_must_be_the_reviewed_head - a proof whose head is not M^2 proves nothing; a commit pushed after the merge and merged locally counts (A-7, A-8)", () => withFx((fx) => {
  const { m1, h1, x } = trunk(fx);
  assert.deepEqual([fx.count(proofOf(fx, [pr(1, m1, x)])).code, fx.written()[0]], [52, 52]);
  fx.g("checkout", "-q", "feat");
  fx.commit("late", "src/late.txt", 3);
  fx.g("checkout", "-q", "lot/etude-suite");
  fx.merge("feat", "local merge");
  assert.equal(fx.count(proofOf(fx, [pr(1, m1, h1)])).code, 15);
}));

// killer: scripts/lot-size-integration.mjs:37 CONST "id?.head_repo === REPO && " -> ""
test("r25i_fake_branch_name_bypasses_nothing - E-5 (2): a fork named lot/etude-suite and lot/etude-suite-x are written PRs; base/fake without a proving PR counts all (A-9)", () => withFx((fx) => {
  const { m1, h1 } = trunk(fx);
  const modes = [{ head_repo: "fork/monark-governance" }, { head_ref: "lot/etude-suite-x" }, { base_repo: "fork/monark-governance" }].map((id) => fx.count(proofOf(fx, [pr(1, m1, h1)], id)));
  assert.deepEqual(modes.map((r) => [r.mode, r.code]), [["written", 52], ["written", 52], ["written", 52]]);
  const fake = fx.count(proofOf(fx, [], { head_ref: "base/fake" }));
  assert.deepEqual([fake.mode, fake.code], ["integration", 52]);
}));

// killer: scripts/lot-size-integration.mjs:31 CONST "\"-c\", \"merge.conflictStyle=merge\", " -> ""
// killer: scripts/lot-size-integration.mjs:84 CONST "\"--remerge-diff\", \"--unified" -> "\"--no-diff-merges\", \"--unified"
test("r25i_conflict_resolution_above_bound_is_red - E-5 (3): with bound 20, a 25-line resolution counts 31 (red), a 10-line one 16 (green), whatever the user's git config; 3 lines slipped into a clean merge count 3 (A-3)", () => {
  for (const [n, red, changed] of [[25, true, 31], [10, false, 16]] as const) withFx((fx) => {
    fx.g("checkout", "-q", "-b", "feat");
    const h1 = fx.commit("p1", "src/p1.txt", 15); // under the bound 20: PR #1 proves (G2 B-2)
    fx.g("checkout", "-q", "lot/etude-suite");
    const m1 = fx.merge("feat", "Merge pull request #1");
    fx.g("checkout", "-q", TARGET);
    fx.commit("y", "c.txt", 1);
    fx.g("checkout", "-q", "lot/etude-suite");
    fx.commit("z", "c.txt", 1);
    assert.throws(() => fx.g("merge", "-q", TARGET, "-m", "sync"));
    writeFileSync(join(fx.dir, "c.txt"), Array.from({ length: n }, (_, i) => `r${i}\n`).join(""));
    fx.g("commit", "-qam", "sync, resolved");
    const r = fx.count(proofOf(fx, [pr(1, m1, h1)]));
    process.env.GIT_CONFIG_PARAMETERS = "'merge.conflictstyle=zdiff3' 'diff.algorithm=patience'";
    try { assert.deepEqual([r.mode, r.code, r.code > 20, fx.count(proofOf(fx, [pr(1, m1, h1)])).code], ["integration", changed, red, changed], r.detail.join("\n")); }
    finally { delete process.env.GIT_CONFIG_PARAMETERS; }
  }, ciOf(20));
  withFx((fx) => {
    fx.g("checkout", "-q", TARGET);
    fx.commit("d", "d.txt", 4);
    fx.g("checkout", "-q", "lot/etude-suite");
    fx.g("merge", "-q", "--no-ff", "--no-commit", TARGET);
    fx.put("src/e.txt", "s1\ns2\ns3\n");
    fx.g("add", "-A");
    fx.g("commit", "-qm", "clean merge plus three lines");
    assert.deepEqual([fx.count(proofOf(fx, [])).mode, fx.count(proofOf(fx, [])).code], ["integration", 3]);
  });
});

// killer: scripts/lot-size-integration.mjs:106 CONST "proof.complete === true && " -> ""
test("r25i_missing_proof_counts_all - E-5 (4): no file, unreadable, incomplete, another repository, another head, another schema: unproven, the count of today (A-10, A-11)", () => withFx((fx) => {
  const { m1, h1, x } = trunk(fx);
  const good = proofOf(fx, [pr(1, m1, h1)]);
  const bad = [null, "{", { ...good, complete: false }, { ...good, repo: "fork/monark-governance" }, proofOf(fx, [pr(1, m1, h1)], { head_sha: x }), { ...good, schema: "v0" }];
  assert.deepEqual(bad.map((p) => [fx.count(p).mode, fx.count(p).code]), bad.map(() => ["unproven", 52]));
  const cli = execFileSync(process.execPath, [join(fx.dir, "scripts", "lot-size-integration.mjs"), "count", "--ci", ".github/workflows/ci.yml", "--base", TARGET, "--proof", join(fx.dir, "absent.json"), "--written", "52", "0"], { cwd: fx.dir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  assert.equal(cli, "unproven 52 0\n");
}));

// killer: scripts/lot-size-integration.mjs:107 CONST "if (!isCandidate(proof.pr)) return out(\"written\");" -> ""
test("r25i_written_pr_is_unchanged - E-1: a PR recherches/x -> trunk keeps the count of today; a module error returns it too (A-16)", () => withFx((fx) => {
  const { m1, h1 } = trunk(fx);
  const r = fx.count(proofOf(fx, [pr(1, m1, h1)], { head_ref: "recherches/x", base_ref: "lot/etude-suite" }));
  assert.deepEqual([r.mode, r.code, r.content], ["written", ...r.w]);
  const e = effective({ cwd: fx.dir, ciText: fx.ci, base: "no/such/ref", proof: proofOf(fx, [pr(1, m1, h1)]), written: [52, 0] });
  assert.deepEqual([e.mode, e.code, e.content], ["error", 52, 0]);
  assert.deepEqual(effective({ cwd: fx.dir, ciText: "jobs: {}", base: TARGET, proof: proofOf(fx, [pr(1, m1, h1)]), written: [52, 0] }).mode, "error");
}));

// killer: scripts/lot-size-integration.mjs:116 CONST "if (gate) return" -> "if (false) return"
// killer: scripts/lot-size-integration.mjs:115 CONST ", \"-z\").split(" -> ").split("
// killer: scripts/lot-size-integration.mjs:25 CONST "\".github/workflows/\", " -> ""
test("r25i_unproven_change_to_gate_files_counts_all - one unproven line in the module itself or in a workflow (a non-ASCII name, quoted by git without -z, included): gate-files, every line counts (A-12)", () => withFx((fx) => {
  const { m1, h1 } = trunk(fx);
  fx.commit("tweak the judge", "scripts/lot-size-integration.mjs", 1);
  const r = fx.count(proofOf(fx, [pr(1, m1, h1)]));
  assert.deepEqual([r.mode, r.code], ["gate-files", 53]);
  const t = fx.g("rev-parse", "HEAD^");
  for (const f of [".github/workflows/x.yml", ".github/workflows/\u00e9.yml"]) {
    fx.g("reset", "-q", "--hard", t);
    fx.commit("tweak a workflow", f, 1);
    assert.deepEqual([fx.count(proofOf(fx, [pr(1, m1, h1)])).mode, f], ["gate-files", f]);
  }
}));

// killer: scripts/lot-size-integration.mjs:41 CONST "inL(p.base_ref) && " -> ""
test("r25i_only_closed_list_measured_merged_prs_prove - merged outside L, PR #89, r25 failure, r25 absent, not merged: each proves nothing (A-6, A-17)", () => withFx((fx) => {
  const { m1, h1 } = trunk(fx);
  const bad = [{ base_ref: "lot/np-2-scripts" }, { number: 89 }, { r25: "not-success" }, { r25: null }, { merged_at: null }];
  assert.deepEqual(bad.map((o) => fx.count(proofOf(fx, [pr(1, m1, h1, o)])).code), [52, 52, 52, 52, 52]);
}));

// killer: scripts/lot-size-integration.mjs:55 CONST "else if (ps.length === 1) s.add(m);" -> ""
test("r25i_squash_proves_its_commit_rebase_proves_the_last - a squash counts 0; of 3 rebased commits the first 2 count (A-4, A-5)", () => withFx((fx) => {
  const { m1, h1, x } = trunk(fx);
  fx.g("reset", "-q", "--hard", m1);
  const s = fx.commit("squash #2", "src/s.txt", 10);
  const [, , r3] = [1, 2, 3].map((i) => fx.commit(`rebased ${i}`, "src/r.txt", 3));
  const r = fx.count(proofOf(fx, [pr(1, m1, h1), pr(2, s, x), pr(3, r3 ?? "", x)]));
  assert.deepEqual([r.mode, r.code, r.w[0]], ["integration", 6, 59]);
}));

const lines = (tag: string, n: number): string => Array.from({ length: n }, (_, i) => `${tag} ${i}\n`).join("");

// killer: scripts/lot-size-integration.mjs:54 CONST "for (const c of rows(git(\"rev-list\", ps[1], `^${ps[0]}`)))" -> "for (const c of [m, ...rows(git(\"rev-list\", ps[1], `^${ps[0]}`))])"
test("r25i_local_merge_of_a_proven_pr_counts_its_remerge_diff - G2 B-1: a proving PR merged LOCALLY (#88, #91, #92, #113..#124) with 300 lines slipped into its clean merge: the merge is not proven, its remerge-diff counts 300 (E-2 a, A-3)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "feat");
  const h1 = fx.commit("p1", "src/p1.txt", 10);
  fx.g("checkout", "-q", "lot/etude-suite");
  fx.g("merge", "-q", "--no-ff", "--no-commit", "feat");
  fx.put("src/slipped.txt", lines("slipped", 300));
  fx.g("add", "-A");
  fx.g("commit", "-qm", "local merge of PR #1 into the trunk");
  const r = fx.count(proofOf(fx, [pr(1, fx.g("rev-parse", "HEAD"), h1)]));
  assert.deepEqual([r.mode, r.code, r.w[0]], ["integration", 300, 310], r.detail.join("\n"));
}));

// killer: scripts/lot-size-integration.mjs:53 CONST "if (specs.some((sp, i) => metric(git(\"diff\", \"--shortstat\", ps[0] ?? EMPTY_TREE, m, \"--\", ...sp)) > bounds[i])) continue;" -> ""
test("r25i_proving_pr_contribution_is_remeasured - G2 B-2: a PR green against an old target (retargeted, target pushed back, old run re-run) brings 2 000 unmeasured lines: its contribution M^1..M exceeds the bound, it proves nothing, 2 005 count", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "base/y");
  fx.commit("direct push", "src/u.txt", 2000);
  fx.g("checkout", "-q", "-b", "feat");
  const h2 = fx.commit("s", "src/s.txt", 5);
  fx.g("checkout", "-q", "lot/etude-suite");
  const m2 = fx.merge("feat", "Merge pull request #2");
  const r = fx.count(proofOf(fx, [pr(2, m2, h2)]));
  assert.deepEqual([r.mode, r.code, r.w[0]], ["integration", 2005, 2005], r.detail.join("\n"));
}));

// killer: scripts/lot-size-integration.mjs:92 SDL "if (kinds.some((k) => k !== \"content\" && k !== \"add/add\") || (kinds.length > 0 && at < 0)) return null;" -> ""
// killer: scripts/lot-size-integration.mjs:93 CONST "(kinds.length > 0 && !l.startsWith(" -> "(false && !l.startsWith("
// killer: scripts/lot-size-integration.mjs:32 CONST "GIT_DIFF_OPTS: undefined, " -> ""
test("r25i_conflict_kept_material_of_a_proven_pr_counts - G2 B-4: PR #5 adds 3 000 lines then removes them (net 5: it proves); a branch from the middle renames the file (rename/delete, resolved on the trunk or on the branch) or edits one line of it (content conflict): the 3 000 kept lines count (A-3)", () => {
  for (const side of ["trunk", "branch", "content"] as const) withFx((fx) => {
    fx.g("checkout", "-q", "-b", "feat");
    const c1 = fx.commit("big", "src/big.txt", 3000);
    if (side === "content") writeFileSync(join(fx.dir, "src", "big.txt"), "head\n");
    else fx.g("rm", "-q", "src/big.txt");
    fx.g("commit", "-qam", "drop big");
    const h5 = fx.commit("s", "src/s.txt", 5);
    fx.g("checkout", "-q", "lot/etude-suite");
    const m5 = fx.merge("feat", "Merge pull request #5");
    fx.g("checkout", "-q", "-b", "g", c1);
    if (side === "content") writeFileSync(join(fx.dir, "src", "big.txt"), lines("big", 3000).replace("big 1500\n", "edited\n"));
    else fx.g("mv", "src/big.txt", "src/big2.txt");
    fx.g("commit", "-qam", "rename or edit");
    fx.g("checkout", "-q", side === "branch" ? "g" : "lot/etude-suite");
    assert.throws(() => fx.g("merge", "-q", side === "branch" ? "lot/etude-suite" : "g", "-m", "conflict"));
    if (side === "content") fx.g("checkout", "--theirs", "src/big.txt");
    fx.g("add", "-A");
    fx.g("commit", "-qm", "conflict resolved, the 3 000 lines kept");
    if (side === "branch") { fx.g("checkout", "-q", "lot/etude-suite"); fx.merge("g", "clean merge of g"); }
    process.env.GIT_DIFF_OPTS = "--unified=0"; // a user's diff options cannot shrink the whole-file context
    try {
      const r = fx.count(proofOf(fx, [pr(5, m5, h5)]));
      assert.deepEqual([side, r.mode, r.code, r.w[0]], [side, "integration", side === "content" ? 3005 : 3000, 3005], r.detail.join("\n"));
    } finally { delete process.env.GIT_DIFF_OPTS; }
  });
});

// killer: scripts/lot-size-integration.mjs:31 CONST ", \"-c\", \"core.attributesFile=\"" -> ""
test("r25i_user_git_attributes_do_not_lower_counts - G2 m-a: a user attributes file marking every path -diff, by the XDG default or by core.attributesFile, leaves the 300 slipped lines of B-1 at 300", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "feat");
  const h1 = fx.commit("p1", "src/p1.txt", 10);
  fx.g("checkout", "-q", "lot/etude-suite");
  fx.g("merge", "-q", "--no-ff", "--no-commit", "feat");
  fx.put("src/slipped.txt", lines("slipped", 300));
  fx.g("add", "-A");
  fx.g("commit", "-qm", "local merge of PR #1 into the trunk");
  const proof = proofOf(fx, [pr(1, fx.g("rev-parse", "HEAD"), h1)]), written = fx.written(), xdg = join(fx.dir, ".git", "xdg");
  fx.put(".git/xdg/git/attributes", "* -diff\n");
  const env = [{ XDG_CONFIG_HOME: xdg }, { GIT_CONFIG_PARAMETERS: `'core.attributesfile=${join(xdg, "git", "attributes")}'` }];
  const codes = env.map((e) => {
    Object.assign(process.env, e);
    try { return effective({ cwd: fx.dir, ciText: fx.ci, base: TARGET, proof, written }).code; }
    finally { for (const k of Object.keys(e)) Reflect.deleteProperty(process.env, k); }
  });
  assert.deepEqual([written[0], codes], [310, [300, 300]]);
}));

// killer: scripts/lot-size-integration.mjs:72 CONST "lines.slice(from," -> "lines.slice(0,"
// killer: scripts/lot-size-integration.mjs:75 CONST "if (v.length !== 1) throw" -> "if (v.length === 0) throw"
test("r25i_bound_is_read_once_from_the_r25_job - G2 m-c: a decoy bound 999 999 in another job does not let the PR of B-2 prove (2 005 count); a second declaration in the r25 job is an error: the count of today", () => {
  const decoy = ciOf(1205).replace("jobs:\n", 'jobs:\n  decoy:\n    env:\n      VIBEGATES_PR_LIMIT: "999999"\n');
  const twice = ciOf(1205).replace("        run: |\n", '          VIBEGATES_PR_LIMIT: "999999"\n        run: |\n');
  for (const [ci, mode] of [[decoy, "integration"], [twice, "error"]] as const) withFx((fx) => {
    fx.g("checkout", "-q", "-b", "base/y");
    fx.commit("direct push", "src/u.txt", 2000);
    fx.g("checkout", "-q", "-b", "feat");
    const h2 = fx.commit("s", "src/s.txt", 5);
    fx.g("checkout", "-q", "lot/etude-suite");
    const m2 = fx.merge("feat", "Merge pull request #2");
    const r = fx.count(proofOf(fx, [pr(2, m2, h2)]));
    assert.deepEqual([r.mode, r.code, r.w[0]], [mode, 2005, 2005], r.detail.join("\n"));
  }, ci);
});

// killer: scripts/lot-size-integration.mjs:146 CONST "runs.length > 0 && " -> ""
// killer: scripts/lot-size-integration.mjs:145 CONST " && c.app?.slug === \"github-actions\"" -> ""
// killer: scripts/lot-size-integration.mjs:144 CONST " || r.total_count !== r.check_runs.length" -> ""
// killer: scripts/lot-size-integration.mjs:132 CONST "if (!isCandidate(id)) return proof;" -> ""
// killer: scripts/lot-size-integration.mjs:129 CONST "if (Date.now() > deadline) throw" -> "if (false) throw"
test("r25i_build_proof_needs_a_measured_head_and_reads_nothing_for_a_written_pr - G2 m-1, m-3: no r25 run, a run of another app: not proven; paginated runs or a passed deadline: no proof; a written PR: zero API call (E-1)", async () => {
  const fx = new Fx();
  try {
    const { m1, h1 } = trunk(fx), head = fx.g("rev-parse", "HEAD"), calls: string[] = [];
    const ev = (ref: string): object => ({ number: 7, head: { ref, sha: head, repo: { full_name: REPO } }, base: { ref: TARGET, repo: { full_name: REPO } } });
    const run = (slug: string): object => ({ name: "r25-taille-de-lot", app: { slug }, conclusion: "success" });
    const api = (runs: object[], total = runs.length) => (path: string): Promise<unknown> => {
      calls.push(path);
      return Promise.resolve(path.includes("/pulls?") ? [{ number: 1, merged_at: "2026-10-05T00:00:00Z", merge_commit_sha: m1, head: { sha: h1 }, base: { ref: "lot/etude-suite" } }] : { total_count: total, check_runs: runs });
    };
    const r25Of = async (runs: object[]): Promise<unknown> => (await buildProof({ api: api(runs), cwd: fx.dir, pr: ev("lot/etude-suite"), base: TARGET })).merged.map((m) => m.r25);
    assert.deepEqual([await r25Of([run("github-actions")]), await r25Of([]), await r25Of([run("other-app")])], [["success"], ["not-success"], ["not-success"]]);
    await assert.rejects(buildProof({ api: api([run("github-actions")], 2), cwd: fx.dir, pr: ev("lot/etude-suite"), base: TARGET }), /paginated/);
    calls.length = 0;
    await assert.rejects(buildProof({ api: api([]), cwd: fx.dir, pr: ev("lot/etude-suite"), base: TARGET, deadline: Date.now() - 1 }), /deadline/);
    const written = await buildProof({ api: () => Promise.reject(new Error("no API call for a written PR")), cwd: fx.dir, pr: ev("recherches/x"), base: TARGET });
    assert.deepEqual([written.merged, calls], [[], []]);
  } finally { fx.done(); }
});
