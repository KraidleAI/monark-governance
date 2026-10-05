/**
 * Root test `r25_integration` (lot R25-INTEGRATION-RULE-1, ADR-M003 D9 nonies, G0 docs/G0-lot-r25-integration-rule-1.md
 * section 7, T-1..T-10; T-11 is in test/oracle-run.test.ts, the wiring pin in test/ci-gates.test.ts). Fixtures are
 * throwaway git repositories under the OS temp dir whose PRs are real merge commits; proofs are written by the test;
 * T-10 serves the GitHub API from a local HTTP server. No network. The four E-5 killers: T-1, T-3, T-4, T-5.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { AddressInfo } from "node:net";
import { startLoopback } from "./helpers/loopback.ts";
import { ATTRIBUTES, BINARY_ASSETS, buildProof, effective, R25_DIFF_RE, REPO, SCHEMA, specsOf } from "../scripts/lot-size-integration.mjs";
import * as lsi from "../scripts/lot-size-integration.mjs"; // lot R25-GUARDS-2: its new exports, read through the namespace (absent at the base: an assertion, not a load error)

const ROOT = join(import.meta.dirname, "..");
const REAL_CI = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
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
const sha256 = (b: Buffer): string => createHash("sha256").update(b).digest("hex");
interface OracleR25 { exit: number; mode: string; proof: { file: string; sha256: string } | null; counts: { name: string; changed: number; limit: number | null }[] }
/** r25() of the oracle, imported in a child (the module has no type surface), on the fixture's own workflow. */
const oracle = (fx: Fx, base: string, proofFile: string | null, env: object = {}, root = ROOT): OracleR25 => JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e",
  `import { r25 } from ${JSON.stringify(pathToFileURL(join(root, "scripts", "oracle", "r25.mjs")).href)}; import { readFileSync } from "node:fs";
  const [d, b, p] = process.argv.slice(1); console.log(JSON.stringify(r25(d, readFileSync(d + "/.github/workflows/ci.yml", "utf8"), b, p === "-" ? null : p)));`,
  fx.dir, base, proofFile ?? "-"], { encoding: "utf8", env: { ...process.env, ...env } })) as OracleR25;

// killer: scripts/lot-size-integration.mjs:121 CONST "if (proven.has(c)) continue;" -> "if (proven.has(c) || ps.length === 1) continue;"
test("r25i_hidden_unreviewed_commit_is_counted - E-5 (1): a direct push and an amended copy of a reviewed commit count, the proven PR does not (A-1, A-2)", () => withFx((fx) => {
  const { m1, h1 } = trunk(fx);
  const r = fx.count(proofOf(fx, [pr(1, m1, h1)]));
  assert.deepEqual([r.mode, r.code, r.content, r.w], ["integration", 12, 0, [52, 0]], r.detail.join("\n"));
}));

// killer: scripts/lot-size-integration.mjs:56 CONST "ps.length === 2 && ps[1] === p.head_sha" -> "ps.length === 2"
test("r25i_merged_head_must_be_the_reviewed_head - a proof whose head is not M^2 proves nothing; a commit pushed after the merge and merged locally counts (A-7, A-8)", () => withFx((fx) => {
  const { m1, h1, x } = trunk(fx);
  assert.deepEqual([fx.count(proofOf(fx, [pr(1, m1, x)])).code, fx.written()[0]], [52, 52]);
  fx.g("checkout", "-q", "feat");
  fx.commit("late", "src/late.txt", 3);
  fx.g("checkout", "-q", "lot/etude-suite");
  fx.merge("feat", "local merge");
  assert.equal(fx.count(proofOf(fx, [pr(1, m1, h1)])).code, 15);
}));

// killer: scripts/lot-size-integration.mjs:39 CONST "id?.head_repo === REPO && " -> ""
test("r25i_fake_branch_name_bypasses_nothing - E-5 (2): a fork named lot/etude-suite and lot/etude-suite-x are written PRs; base/fake without a proving PR counts all (A-9)", () => withFx((fx) => {
  const { m1, h1 } = trunk(fx);
  const modes = [{ head_repo: "fork/monark-governance" }, { head_ref: "lot/etude-suite-x" }, { base_repo: "fork/monark-governance" }].map((id) => fx.count(proofOf(fx, [pr(1, m1, h1)], id)));
  assert.deepEqual(modes.map((r) => [r.mode, r.code]), [["written", 52], ["written", 52], ["written", 52]]);
  const fake = fx.count(proofOf(fx, [], { head_ref: "base/fake" }));
  assert.deepEqual([fake.mode, fake.code], ["integration", 52]);
}));

// killer: scripts/lot-size-integration.mjs:33 CONST "\"-c\", \"merge.conflictStyle=merge\", " -> ""
// killer: scripts/lot-size-integration.mjs:86 CONST "\"--remerge-diff\", \"--unified" -> "\"--no-diff-merges\", \"--unified"
// killer: scripts/oracle/r25.mjs:27 CONST "\"-C\", clone, ...PIN, " -> "\"-C\", clone, "
// killer: scripts/oracle/r25.mjs:27 CONST "[`--attr-source=${attrTree(clone)}`], " -> "[], "
test("r25i_conflict_resolution_above_bound_is_red - E-5 (3): through the oracle's r25() with bound 20, a 25-line resolution is red, a 10-line one green, under a hostile git config, user attributes, a machine bigFileThreshold of 1 or a measured .gitattributes * -diff (one line more); 3 lines slipped into a clean merge count 3 (A-3)", () => {
  for (const [n, exit, changed] of [[25, 1, 31], [10, 0, 16]] as const) withFx((fx) => {
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
    const file = join(fx.dir, ".git", "proof.json");
    writeFileSync(file, JSON.stringify(proofOf(fx, [pr(1, m1, h1)])));
    fx.put(".git/xdg/git/attributes", "* -diff\n"); // G2 delta m-a: a user attributes file lowers neither W nor the module's count
    const [r, z, a, b] = [{}, { GIT_CONFIG_PARAMETERS: "'merge.conflictstyle=zdiff3' 'diff.algorithm=patience'" }, { XDG_CONFIG_HOME: join(fx.dir, ".git", "xdg") }, { GIT_CONFIG_PARAMETERS: "'core.bigfilethreshold'='1'" }].map((env) => oracle(fx, TARGET, file, env));
    assert.deepEqual([r?.mode, r?.counts[0]?.changed, r?.exit, z?.counts[0]?.changed, a?.counts[0]?.changed, b?.counts[0]?.changed], ["integration", changed, exit, changed, changed, changed], JSON.stringify([r, z, a, b]));
    fx.commit("* -diff", ".gitattributes", 1); // G2 delta2 O-1, oracle side: a measured -diff lowers neither the oracle's W nor the module's count
    writeFileSync(file, JSON.stringify(proofOf(fx, [pr(1, m1, h1)])));
    const t = oracle(fx, TARGET, file);
    assert.deepEqual([t.mode, t.counts[0]?.changed, t.exit], ["integration", changed + 1, exit], JSON.stringify(t));
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

// killer: scripts/lot-size-integration.mjs:117 CONST "proof.complete === true && " -> ""
test("r25i_missing_proof_counts_all - E-5 (4): no file, unreadable, incomplete, another repository, another head, another schema: unproven, the count of today (A-10, A-11)", () => withFx((fx) => {
  const { m1, h1, x } = trunk(fx);
  const good = proofOf(fx, [pr(1, m1, h1)]);
  const bad = [null, "{", { ...good, complete: false }, { ...good, repo: "fork/monark-governance" }, proofOf(fx, [pr(1, m1, h1)], { head_sha: x }), { ...good, schema: "v0" }];
  assert.deepEqual(bad.map((p) => [fx.count(p).mode, fx.count(p).code]), bad.map(() => ["unproven", 52]));
  const cli = execFileSync(process.execPath, [join(fx.dir, "scripts", "lot-size-integration.mjs"), "count", "--ci", ".github/workflows/ci.yml", "--base", TARGET, "--proof", join(fx.dir, "absent.json"), "--written", "52", "0"], { cwd: fx.dir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  assert.equal(cli, "unproven 52 0\n");
}));

// killer: scripts/lot-size-integration.mjs:118 CONST "if (!isCandidate(proof.pr)) return out(\"written\");" -> ""
test("r25i_written_pr_is_unchanged - E-1: a PR recherches/x -> trunk keeps the count of today; a module error returns it too (A-16)", () => withFx((fx) => {
  const { m1, h1 } = trunk(fx);
  const r = fx.count(proofOf(fx, [pr(1, m1, h1)], { head_ref: "recherches/x", base_ref: "lot/etude-suite" }));
  assert.deepEqual([r.mode, r.code, r.content], ["written", ...r.w]);
  const e = effective({ cwd: fx.dir, ciText: fx.ci, base: "no/such/ref", proof: proofOf(fx, [pr(1, m1, h1)]), written: [52, 0] });
  assert.deepEqual([e.mode, e.code, e.content], ["error", 52, 0]);
  assert.deepEqual(effective({ cwd: fx.dir, ciText: "jobs: {}", base: TARGET, proof: proofOf(fx, [pr(1, m1, h1)]), written: [52, 0] }).mode, "error");
}));

// killer: scripts/lot-size-integration.mjs:127 CONST "if (gate) return" -> "if (false) return"
// killer: scripts/lot-size-integration.mjs:126 CONST ", \"-z\").split(" -> ").split("
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

// killer: scripts/lot-size-integration.mjs:43 CONST "inL(p.base_ref) && " -> ""
test("r25i_only_closed_list_measured_merged_prs_prove - merged outside L, PR #89, r25 failure, r25 absent, not merged: each proves nothing (A-6, A-17)", () => withFx((fx) => {
  const { m1, h1 } = trunk(fx);
  const bad = [{ base_ref: "lot/np-2-scripts" }, { number: 89 }, { r25: "not-success" }, { r25: null }, { merged_at: null }];
  assert.deepEqual(bad.map((o) => fx.count(proofOf(fx, [pr(1, m1, h1, o)])).code), [52, 52, 52, 52, 52]);
}));

// killer: scripts/lot-size-integration.mjs:57 CONST "else if (ps.length === 1) s.add(m);" -> ""
test("r25i_squash_proves_its_commit_rebase_proves_the_last - a squash counts 0; of 3 rebased commits the first 2 count (A-4, A-5)", () => withFx((fx) => {
  const { m1, h1, x } = trunk(fx);
  fx.g("reset", "-q", "--hard", m1);
  const s = fx.commit("squash #2", "src/s.txt", 10);
  const [, , r3] = [1, 2, 3].map((i) => fx.commit(`rebased ${i}`, "src/r.txt", 3));
  const r = fx.count(proofOf(fx, [pr(1, m1, h1), pr(2, s, x), pr(3, r3 ?? "", x)]));
  assert.deepEqual([r.mode, r.code, r.w[0]], ["integration", 6, 59]);
}));

const lines = (tag: string, n: number): string => Array.from({ length: n }, (_, i) => `${tag} ${i}\n`).join("");

// killer: scripts/lot-size-integration.mjs:56 CONST "for (const c of rows(git(\"rev-list\", ps[1], `^${ps[0]}`)))" -> "for (const c of [m, ...rows(git(\"rev-list\", ps[1], `^${ps[0]}`))])"
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

// killer: scripts/lot-size-integration.mjs:55 CONST "if (specs.some((sp, i) => metric(git(\"diff\", \"--shortstat\", ps[0] ?? EMPTY_TREE, m, \"--\", ...sp)) > bounds[i])) continue;" -> ""
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

// killer: scripts/oracle/r25.mjs:20 CONST "join(import.meta.dirname, \"..\", \"lot-size-integration.mjs\")" -> "join(clone, \"scripts\", \"lot-size-integration.mjs\")"
// killer: scripts/oracle/r25.mjs:44 CONST "if (!readFileSync(JUDGE).equals(readFileSync(join(clone, \"scripts\", \"lot-size-integration.mjs\")))) return" -> "if (false) return"
test("oracle_r25_runs_its_own_module_and_refuses_a_foreign_one - G2 B-3: a line makes the measured tree's module answer `integration 0 0`, in an unproven commit or inside a proving PR; the oracle runs its own module, sees foreign bytes and keeps the count of today: red", () => {
  for (const proven of [false, true]) withFx((fx) => {
    const { m1, h1 } = trunk(fx), merged = [pr(1, m1, h1)], mod = join(fx.dir, "scripts", "lot-size-integration.mjs");
    if (proven) fx.g("checkout", "-q", "-b", "judge");
    writeFileSync(mod, `if (process.argv[2] === "count") { console.log("integration 0 0"); process.exit(0); }\n${readFileSync(mod, "utf8")}`);
    fx.g("commit", "-qam", "a judge that always agrees");
    if (proven) { const h2 = fx.g("rev-parse", "HEAD"); fx.g("checkout", "-q", "lot/etude-suite"); merged.push(pr(2, fx.merge("judge", "Merge pull request #2"), h2)); }
    const file = join(fx.dir, ".git", "proof.json");
    writeFileSync(file, JSON.stringify(proofOf(fx, merged)));
    const r = oracle(fx, TARGET, file);
    assert.deepEqual([proven, r.mode, r.counts[0]?.changed, r.exit], [proven, "gate-files", 53, 1], JSON.stringify(r));
  }, ciOf(20));
});

// killer: scripts/lot-size-integration.mjs:94 SDL "if (kinds.some((k) => k !== \"content\" && k !== \"add/add\") || (kinds.length > 0 && at < 0)) return null;" -> ""
// killer: scripts/lot-size-integration.mjs:95 CONST "(kinds.length > 0 && !l.startsWith(" -> "(false && !l.startsWith("
// killer: scripts/lot-size-integration.mjs:34 CONST "GIT_DIFF_OPTS: undefined, " -> ""
// killer: scripts/lot-size-integration.mjs:34 CONST "`--attr-source=${src}`, " -> ""
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
      if (side === "content") { fx.commit("* merge=union", ".gitattributes", 1); assert.deepEqual([fx.count(proofOf(fx, [pr(5, m5, h5)])).code, fx.written()[0]], [3006, 3006], "delta2 B-6: a measured merge driver"); }
    } finally { delete process.env.GIT_DIFF_OPTS; }
  });
});

// killer: scripts/lot-size-integration.mjs:124 CONST "both(remerged(" -> "((x) => x)(remerged("
// killer: scripts/lot-size-integration.mjs:101 CONST "Math.max(r, k)" -> "r"
test("r25i_merge_time_rename_into_the_code_spec_counts - G2 delta2 B-5: a merge's rename detection carries uncounted lines into CODE: (a) 3 000 lines added to docs/x.md (outside CODE) land in src/x.md renamed on the trunk; (b) docs/d/new.md (3 000) in docs/d moved to src/d; (c) site/d/new.md (7 000, CONTENT) in site/d moved to src/d; merged on the trunk or on the branch: each counts", () => {
  for (const [from, to, file, n, moved] of [["docs/x.md", "src/x.md", "docs/x.md", 3000, 40], ["docs/d", "src/d", "docs/d/new.md", 3000, 2], ["site/d", "src/d", "site/d/new.md", 7000, 2]] as const) for (const side of ["trunk", "branch"]) withFx((fx) => {
    fx.commit("pre", from.endsWith(".md") ? from : `${from}/a.md`, moved); // outside CODE: counts 0
    fx.g("checkout", "-q", "-b", "g");
    fx.commit("add", file, n); // outside CODE: counts 0
    fx.g("checkout", "-q", "lot/etude-suite");
    mkdirSync(join(fx.dir, "src"));
    fx.g("mv", from, to); fx.g("commit", "-qm", "move into CODE"); // counts `moved`
    const join2 = (ref: string): void => { try { fx.g("merge", "-q", "--no-ff", "-m", "merge", ref); } catch { fx.g("add", "-A"); fx.g("commit", "-qm", "file location kept"); } };
    if (side === "branch") { fx.g("checkout", "-q", "g"); join2("lot/etude-suite"); fx.g("checkout", "-q", "lot/etude-suite"); }
    join2("g");
    const r = fx.count(proofOf(fx, []));
    assert.deepEqual([from, side, r.mode, r.code, r.w[0]], [from, side, "integration", moved + n, moved + n], r.detail.join("\n"));
  }, ciOf(1205).replace("':(exclude)site/**'", "':(exclude)site/**' ':(exclude)docs/**'"));
});

// killer: scripts/lot-size-integration.mjs:33 CONST ", \"-c\", \"core.attributesFile=\"" -> ""
// killer: scripts/lot-size-integration.mjs:33 CONST ", \"-c\", \"core.bigFileThreshold=512m\"" -> ""
test("r25i_user_git_attributes_do_not_lower_counts - G2 m-a, delta2 m-d: a user attributes file marking every path -diff (XDG default or core.attributesFile), or a machine core.bigFileThreshold of 1, leaves the 300 slipped lines of B-1 and a 7-line commit at 307", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "feat");
  const h1 = fx.commit("p1", "src/p1.txt", 10);
  fx.g("checkout", "-q", "lot/etude-suite");
  fx.g("merge", "-q", "--no-ff", "--no-commit", "feat");
  fx.put("src/slipped.txt", lines("slipped", 300));
  fx.g("add", "-A");
  fx.g("commit", "-qm", "local merge of PR #1 into the trunk");
  fx.commit("u", "src/u.txt", 7); // a plain commit: its --shortstat, not only the merge's combined diff (delta2 m-d)
  const proof = proofOf(fx, [pr(1, fx.g("rev-parse", "HEAD^"), h1)]), written = fx.written(), xdg = join(fx.dir, ".git", "xdg");
  fx.put(".git/xdg/git/attributes", "* -diff\n");
  const env = [{ XDG_CONFIG_HOME: xdg }, { GIT_CONFIG_PARAMETERS: `'core.attributesfile=${join(xdg, "git", "attributes")}'` }, { GIT_CONFIG_PARAMETERS: "'core.bigfilethreshold'='1'" }];
  const codes = env.map((e) => {
    Object.assign(process.env, e);
    try { return effective({ cwd: fx.dir, ciText: fx.ci, base: TARGET, proof, written }).code; }
    finally { for (const k of Object.keys(e)) Reflect.deleteProperty(process.env, k); }
  });
  assert.deepEqual([written[0], codes], [317, [307, 307, 307]]);
}));

/** The content side of B-4: PR #5 adds src/big.txt (3 000 lines) then drops it; a branch from the middle edits one line of
 * it, the merge conflicts on content and keeps the 3 000 lines. Returns the proof naming PR #5. */
function keptByConflict(fx: Fx): object {
  fx.g("checkout", "-q", "-b", "feat");
  const c1 = fx.commit("big", "src/big.txt", 3000);
  writeFileSync(join(fx.dir, "src", "big.txt"), "head\n");
  fx.g("commit", "-qam", "drop big");
  const h5 = fx.commit("s", "src/s.txt", 5);
  fx.g("checkout", "-q", "lot/etude-suite");
  const m5 = fx.merge("feat", "Merge pull request #5");
  fx.g("checkout", "-q", "-b", "g", c1);
  writeFileSync(join(fx.dir, "src", "big.txt"), lines("big", 3000).replace("big 1500\n", "edited\n"));
  fx.g("commit", "-qam", "edit");
  fx.g("checkout", "-q", "lot/etude-suite");
  assert.throws(() => fx.g("merge", "-q", "g", "-m", "conflict"));
  fx.g("checkout", "--theirs", "src/big.txt");
  fx.g("add", "-A");
  fx.g("commit", "-qm", "conflict resolved, the 3 000 lines kept");
  return proofOf(fx, [pr(5, m5, h5)]);
}

// killer: scripts/lot-size-integration.mjs:114 CONST "if (infoAttributes(cwd)) throw" -> "if (false) throw"
test("r25i_machine_attributes_return_the_written_count - G2 delta3 m-f: a $GIT_DIR/info/attributes, which --attr-source does not replace, marking every path merge=union (the conflict of B-4 merges clean: 3) or -diff (0): the module returns W, 3 005", () => {
  for (const attr of ["* merge=union\n", "* -diff\n"]) withFx((fx) => {
    const proof = keptByConflict(fx), written = fx.written(), before = effective({ cwd: fx.dir, ciText: fx.ci, base: TARGET, proof, written });
    fx.put(".git/info/attributes", attr);
    const r = effective({ cwd: fx.dir, ciText: fx.ci, base: TARGET, proof, written });
    assert.deepEqual([attr, before.mode, before.code, r.code, r.content], [attr, "integration", 3005, 3005, 0], r.detail.join("\n"));
  });
});

// killer: scripts/oracle/r25.mjs:23 CONST "if (infoAttributes(clone)) throw" -> "if (false) throw"
test("oracle_r25_refuses_machine_attributes - G2 delta3 m-f: a $GIT_DIR/info/attributes `* -diff` in the clone: the oracle's r25() throws (run.mjs writes RED, fail-closed) instead of reading W 0 for 3 000 lines", () => withFx((fx) => {
  fx.commit("c", "src/c.txt", 3000);
  assert.equal(oracle(fx, TARGET, null).counts[0]?.changed, 3000);
  fx.put(".git/info/attributes", "* -diff\n");
  assert.throws(() => oracle(fx, TARGET, null), /info\/attributes/);
}));

// killer: scripts/lot-size-integration.mjs:33 CONST "\"-c\", \"diff.renames=true\", " -> ""
test("oracle_r25_w_reads_under_the_module_pin - G2 delta3 m-g: a commit edits one line of src/a.txt (3 000 lines) and copies the old a.txt to src/b.txt; a user's diff.renames=copies (~/.gitconfig through HOME, GIT_CONFIG_GLOBAL, GIT_CONFIG_PARAMETERS) reads 2 unpinned; the oracle's W stays 3 002, as the CI reads it", () => withFx((fx) => {
  const base = fx.commit("a", "src/a.txt", 3000), home = join(fx.dir, ".git", "home");
  copyFileSync(join(fx.dir, "src", "a.txt"), join(fx.dir, "src", "b.txt"));
  writeFileSync(join(fx.dir, "src", "a.txt"), lines("a", 3000).replace("a 0\n", "edited\n"));
  fx.g("add", "-A");
  fx.g("commit", "-qm", "edit and copy");
  fx.put(".git/home/.gitconfig", "[diff]\n\trenames = copies\n");
  const envs = [{ HOME: home, XDG_CONFIG_HOME: join(home, ".config") }, { GIT_CONFIG_GLOBAL: join(home, ".gitconfig") }, { GIT_CONFIG_PARAMETERS: "'diff.renames'='copies'" }];
  const plain = envs.map((e) => metric(execFileSync("git", ["-C", fx.dir, "diff", "--shortstat", `${base}...HEAD`, "--", "src"], { encoding: "utf8", env: { ...process.env, ...e } })));
  assert.deepEqual([plain, envs.map((e) => oracle(fx, base, null, e).counts[0]?.changed)], [[2, 2, 2], [3002, 3002, 3002]]);
}));

// killer: scripts/oracle/r25.mjs:27 CONST ", []]" -> "]"
test("oracle_r25_w_is_never_below_the_ci_read - G2 delta3 m-h: a measured .gitattributes `*.ttf diff` makes apps/site/app/fonts/blob.ttf (a NUL byte, then 3 000 lines; a declared binary asset in its directory, which attrTree leaves to git's detection) count 3 001 in the measured tree's read; the oracle's W reads 3 001 too (the larger of its attrTree read and that read), not 0", () => withFx((fx) => {
  fx.put(".gitattributes", "*.ttf diff\n");
  const base = fx.commit("attributes", "x.txt", 1);
  fx.put("apps/site/app/fonts/blob.ttf", `\0\n${lines("blob", 3000)}`);
  fx.g("add", "-A");
  fx.g("commit", "-qm", "blob");
  assert.deepEqual([fx.written(base)[0], oracle(fx, base, null).counts[0]?.changed], [3001, 3001]);
}));

// killer: scripts/lot-size-integration.mjs:74 CONST "lines.slice(from," -> "lines.slice(0,"
// killer: scripts/lot-size-integration.mjs:77 CONST "if (v.length !== 1) throw" -> "if (v.length === 0) throw"
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

// killer: scripts/lot-size-integration.mjs:157 CONST "runs.length > 0 && " -> ""
// killer: scripts/lot-size-integration.mjs:156 CONST " && c.app?.slug === \"github-actions\"" -> ""
// killer: scripts/lot-size-integration.mjs:155 CONST " || r.total_count !== r.check_runs.length" -> ""
// killer: scripts/lot-size-integration.mjs:143 CONST "if (!isCandidate(id)) return proof;" -> ""
// killer: scripts/lot-size-integration.mjs:140 CONST "if (Date.now() > deadline) throw" -> "if (false) throw"
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

/** The `run:` block of the r25 step of the REAL workflow, dedented, `${{ github.base_ref }}` substituted as GitHub does. */
function ciBlock(base: string): string {
  const lines = REAL_CI.split(/\r?\n/), at = lines.findIndex((l) => /^ {8}run: \|\s*$/.test(l) && lines.slice(0, lines.indexOf(l)).some((p) => /^ {2}r25-taille-de-lot:/.test(p)));
  const body: string[] = [];
  for (let i = at + 1; i < lines.length && (lines[i]?.trim() === "" || /^ {10}/.test(lines[i] ?? "")); i++) body.push((lines[i] ?? "").slice(10));
  return body.join("\n").replaceAll("${{ github.base_ref }}", base);
}

// killer: scripts/oracle/r25.mjs:49 CONST "counts: n.map((x, i) => Math.min(Number(x), written[i]))" -> "counts: written"
test("r25i_ci_block_and_oracle_agree - E-4: the real run: block of ci.yml under bash, on the synthetic merge with a local API, and the oracle's r25() on the PR head print the same mode and counts from the same proof file; one R25_DIFF_RE", async () => {
  const re = (f: string): string | undefined => /const R25_DIFF_RE = (\/.+\/);/.exec(readFileSync(join(ROOT, f), "utf8"))?.[1];
  assert.deepEqual([re("scripts/oracle/r25.mjs"), re("test/ci-gates.test.ts")], [String(R25_DIFF_RE), String(R25_DIFF_RE)], "R25_DIFF_RE drifted");
  const fx = new Fx(REAL_CI);
  let server: Server | undefined;
  try {
    const { m1, h1 } = trunk(fx), head = fx.g("rev-parse", "HEAD");
    fx.g("update-ref", `refs/remotes/origin/${TARGET}`, TARGET);
    fx.g("checkout", "-q", "--detach", TARGET);
    fx.merge(head, "synthetic refs/pull/7/merge");
    const runs = { total_count: 1, check_runs: [{ name: "r25-taille-de-lot", app: { slug: "github-actions" }, conclusion: "success" }] };
    const serve = (q: IncomingMessage, s: ServerResponse): void => {
      const u = q.url ?? "", ok = q.headers.authorization === "Bearer fx-token";
      const body = !ok ? null : u.startsWith(`/repos/${REPO}/pulls?state=closed`) ? [{ number: 1, merged_at: "2026-10-05T00:00:00Z", merge_commit_sha: m1, head: { sha: h1 }, base: { ref: "lot/etude-suite" } }] : u.startsWith(`/repos/${REPO}/commits/${h1}/check-runs?`) ? runs : null;
      s.writeHead(body === null ? 404 : 200, { "content-type": "application/json" }).end(JSON.stringify(body));
    };
    const http = createServer(serve);
    server = await startLoopback((port) => http.listen(port, "127.0.0.1"));
    const port = (server.address() as AddressInfo).port;
    const tmp = join(fx.dir, ".git", "runner"), event = join(fx.dir, ".git", "event.json");
    mkdirSync(tmp);
    writeFileSync(event, JSON.stringify({ pull_request: { number: 7, head: { ref: "lot/etude-suite", sha: head, repo: { full_name: REPO } }, base: { ref: TARGET, repo: { full_name: REPO } } } }));
    const env = { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? fx.dir, VIBEGATES_PR_LIMIT: "1205", VIBEGATES_CONTENT_LIMIT: "8000", GITHUB_EVENT_PATH: event, GITHUB_BASE_REF: TARGET, RUNNER_TEMP: tmp, GITHUB_API_URL: `http://127.0.0.1:${String(port)}`, R25_READ_TOKEN: "fx-token" };
    const out = await new Promise<string>((res) => {
      const c = spawn("bash", ["--noprofile", "--norc", "-eo", "pipefail", "-c", ciBlock(TARGET)], { cwd: fx.dir, env });
      let o = "";
      c.stdout.on("data", (d: Buffer) => { o += d.toString(); });
      c.stderr.on("data", (d: Buffer) => { o += d.toString(); });
      c.on("close", (code) => res(`${o}exit ${String(code)}\n`));
    });
    assert.match(out, /^R-25 mode: integration\nChanged lines: 12 \(ADR bound: 1205\)\nContent changed lines: 0 \(ADR bound: 8000\)\nexit 0$/m, out);
    fx.g("checkout", "-q", "--detach", head);
    const proofFile = join(tmp, "lot-size-proof.json"), r = oracle(fx, `origin/${TARGET}`, proofFile);
    assert.deepEqual([r.mode, r.counts.map((c) => c.changed), r.exit, r.proof?.sha256], ["integration", [12, 0], 0, sha256(readFileSync(proofFile))]);
  } finally { server?.close(); fx.done(); }
});

// Lot R25-ATTR-SOURCE-1 (G7 O-1, ADR-M003 D9 undecies): W, the count of today, is the job's own `git diff --shortstat`. It read the
// attributes of the measured tree, so a PR's own .gitattributes could make its lines count 0. The real r25 block runs under bash on the
// PR head with no proof (no event payload: the count stays W) and prints W.
function ciRun(fx: Fx, env: Record<string, string> = {}): string {
  fx.g("update-ref", `refs/remotes/origin/${TARGET}`, TARGET);
  const tmp = mkdtempSync(join(fx.dir, ".git", "runner-"));
  const r = spawnSync("bash", ["--noprofile", "--norc", "-eo", "pipefail", "-c", ciBlock(TARGET)], { cwd: fx.dir, encoding: "utf8", env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? fx.dir, VIBEGATES_PR_LIMIT: "1205", VIBEGATES_CONTENT_LIMIT: "8000", GITHUB_EVENT_PATH: join(tmp, "none.json"), GITHUB_BASE_REF: TARGET, RUNNER_TEMP: tmp, ...env } });
  return `${r.stdout}${r.stderr}exit ${String(r.status)}\n`;
}
const changed = (out: string): string => /^Changed lines: (\d+) \(ADR bound: 1205\)$/m.exec(out)?.[1] ?? "none";
const PIN_ERROR = "::error::Gate R-25: pinned git read not obtained, or a changed path refused (see the lines above). Fail-closed.";

// killer: scripts/lot-size-integration.mjs:180 CONST "GIT_ATTR_SOURCE: attrTree(cwd), " -> ""
test("r25a_ci_w_counts_the_real_lines_under_measured_attributes - O-1: a PR adds .gitattributes (`* -diff`, `* binary`, `*.x diff=foo` with a machine driver: textconv and binary, `* -text`, `* text eol=crlf`) and 3 000 lines: the job's W reads 3 001 each time and the job is red (W 0 or 1 before the lot)", () => {
  const seen: string[] = [];
  for (const attributes of ["* -diff\n", "* binary\n", "*.x diff=foo\n", "* -text\n", "* text eol=crlf\n"]) withFx((fx) => {
    fx.g("config", "diff.foo.textconv", "head -1");
    fx.g("config", "diff.foo.binary", "true");
    fx.g("checkout", "-q", "-b", "pr", TARGET);
    fx.put(".gitattributes", attributes);
    fx.commit("pr", "src/big.x", 3000);
    const out = ciRun(fx);
    seen.push(`${attributes.trim()}: ${changed(out)} ${/^exit (\d+)$/m.exec(out)?.[1] ?? "?"}`);
  }, REAL_CI);
  assert.deepEqual(seen, ["* -diff: 3001 1", "* binary: 3001 1", "*.x diff=foo: 3001 1", "* -text: 3001 1", "* text eol=crlf: 3001 1"]);
});

// killer: scripts/lot-size-integration.mjs:177 CONST "< 2040) throw" -> "< 0) throw"
// killer: scripts/lot-size-integration.mjs:178 CONST "if (infoAttributes(cwd)) throw" -> "if (false) throw"
test("r25a_ci_w_fails_closed_without_the_pinned_read - O-1: a machine $GIT_DIR/info/attributes `* -diff`, or `*.cjs -diff` that spares the probes of attrTree (G2 R-2 of R25-GUARDS-2: only the info/attributes check stops it), that GIT_ATTR_SOURCE does not replace, or a git older than 2.40 (no GIT_ATTR_SOURCE): the job prints no count, says why and is red (W 0, green, before the lot)", () => {
  const real = execFileSync("bash", ["-c", "command -v git"], { encoding: "utf8" }).trim(), seen: string[] = [];
  // win32: the fake git is a sh script without extension on a ':'-joined PATH, which execFileSync never runs there (PATHEXT, ';'):
  // the real git answers. That case is named and skipped there only; the two info/attributes cases run everywhere.
  const kinds = process.platform === "win32" ? ["info/attributes", "info/attributes *.cjs"] : ["info/attributes", "info/attributes *.cjs", "git 2.39.5"];
  for (const kind of kinds) withFx((fx) => {
    fx.g("checkout", "-q", "-b", "pr", TARGET);
    fx.commit("pr", kind === "info/attributes *.cjs" ? "src/a.cjs" : "src/c.txt", kind === "info/attributes *.cjs" ? 300 : 3000);
    const bin = join(fx.dir, ".git", "bin");
    mkdirSync(bin);
    writeFileSync(join(bin, "git"), `#!/bin/sh\nif [ "$1" = "--version" ]; then echo "git version 2.39.5"; exit 0; fi\nexec ${real} "$@"\n`, { mode: 0o755 });
    if (kind.startsWith("info/attributes")) fx.put(".git/info/attributes", kind === "info/attributes" ? "* -diff\n" : "*.cjs -diff\n");
    const out = ciRun(fx, kind.startsWith("info/attributes") ? {} : { PATH: `${bin}:${process.env.PATH ?? ""}` });
    seen.push(`${kind}: ${changed(out)} ${String(out.includes(PIN_ERROR))} ${/^exit (\d+)$/m.exec(out)?.[1] ?? "?"}`);
  }, REAL_CI);
  assert.deepEqual(seen, ["info/attributes: none true 1", "info/attributes *.cjs: none true 1", "git 2.39.5: none true 1"].slice(0, kinds.length));
});

// killer: scripts/lot-size-integration.mjs:180 CONST "GIT_CONFIG_PARAMETERS: undefined, " -> ""
test("r25a_ci_w_reads_under_the_module_pin - O-1, delta3 m-g on the CI side: a PR edits one line of src/a.txt (3 000 lines) and copies the old a.txt to src/b.txt; a GIT_CONFIG_PARAMETERS diff.renames=copies in the job's env reads 2 unpinned, the job reads 3 002, and every PIN option is in force at command scope", () => withFx((fx) => {
  fx.g("checkout", "-q", TARGET);
  fx.commit("a", "src/a.txt", 3000);
  fx.g("checkout", "-q", "-b", "pr");
  copyFileSync(join(fx.dir, "src", "a.txt"), join(fx.dir, "src", "b.txt"));
  writeFileSync(join(fx.dir, "src", "a.txt"), lines("a", 3000).replace("a 0\n", "edited\n"));
  fx.g("add", "-A");
  fx.g("commit", "-qm", "edit and copy");
  const hostile = { GIT_CONFIG_PARAMETERS: "'diff.renames'='copies'" };
  assert.equal(changed(ciRun(fx, hostile)), "3002");
  const pin = spawnSync("bash", ["--noprofile", "--norc", "-c", `eval "$(node scripts/lot-size-integration.mjs pin --ci .github/workflows/ci.yml --base origin/${TARGET})" && git config --show-scope --get-regexp "^(merge|diff|core)\\." && echo "$LC_ALL $GIT_ATTR_NOSYSTEM $GIT_ATTR_SOURCE \${GIT_DIFF_OPTS-unset}"`], { cwd: fx.dir, encoding: "utf8", env: { ...process.env, ...hostile, GIT_DIFF_OPTS: "--unified=0", LC_ALL: "fr_FR.UTF-8" } });
  const command = pin.stdout.split("\n").filter((l) => l.startsWith("command\t")).map((l) => l.slice(8).replace(" ", "="));
  assert.deepEqual([command.sort(), pin.stdout.trim().split("\n").at(-1)], [["core.attributesfile=", "core.bigfilethreshold=512m", "core.ignorecase=false", "diff.algorithm=myers", "diff.renames=true", "diff.suppressblankempty=false", "merge.conflictstyle=merge", "merge.directoryrenames=conflict", "merge.renames=true"], "C 1 2336999e05d634b0d4c084c82db609f08edb0089 unset"]);
}, REAL_CI));



// killer: scripts/lot-size-integration.mjs:180 CONST "GIT_ENV({})" -> "GIT_ENV()"
test("r25a_pin_prints_exactly_the_pinned_names - G2 m-1: `pin` unsets or exports exactly GIT_DIFF_OPTS, LC_ALL, GIT_ATTR_NOSYSTEM, GIT_CONFIG_PARAMETERS, GIT_ATTR_SOURCE, GIT_CONFIG_COUNT and the nine PIN pairs, in that order, every line one of them: no variable of the runner (R25_READ_TOKEN) is printed or re-exported", () => withFx((fx) => {
  fx.g("update-ref", `refs/remotes/origin/${TARGET}`, TARGET);
  const out = spawnSync(process.execPath, ["scripts/lot-size-integration.mjs", "pin", "--ci", ".github/workflows/ci.yml", "--base", `origin/${TARGET}`], { cwd: fx.dir, encoding: "utf8", env: { ...process.env, R25_READ_TOKEN: "fx-token", MY_RUNNER_VAR: "x" } }).stdout;
  const names = out.trim().split("\n").map((l) => /^(?:unset ([A-Z0-9_]+)|export ([A-Z0-9_]+)=')/.exec(l)).map((m) => m?.[1] ?? m?.[2] ?? "unparsed");
  const pairs = Array.from({ length: 9 }, (_, i) => [`GIT_CONFIG_KEY_${String(i)}`, `GIT_CONFIG_VALUE_${String(i)}`]).flat();
  assert.deepEqual(names, ["GIT_DIFF_OPTS", "LC_ALL", "GIT_ATTR_NOSYSTEM", "GIT_CONFIG_PARAMETERS", "GIT_ATTR_SOURCE", "GIT_CONFIG_COUNT", ...pairs], out);
  assert.ok(!out.includes("fx-token"), "the runner's token is never printed");
}));

// killer: scripts/lot-size-integration.mjs:181 CONST "x.replaceAll(\"'\", \"'\\\\''\")" -> "x"
test("r25a_pin_quotes_any_value - G2 m-2: a PIN entry whose value holds an apostrophe, a $( ), a backtick and a newline, evaluated by bash -e from pinShell, runs nothing and reads back byte for byte from git config", () => withFx((fx) => {
  const hostile = "a'b\"$(touch pwn1)\n;`touch pwn2`'\\'' ${IFS}*? !! end";
  const mod = pathToFileURL(join(fx.dir, "scripts", "lot-size-integration.mjs")).href;
  const shell = spawnSync(process.execPath, ["--input-type=module", "-e", `import * as m from ${JSON.stringify(mod)}; m.PIN.push("-c", "x.y=" + ${JSON.stringify(hostile)}); process.stdout.write(m.pinShell?.(process.cwd()) ?? "");`], { cwd: fx.dir, encoding: "utf8" }).stdout;
  const r = spawnSync("bash", ["--noprofile", "--norc", "-ec", `${shell}\ngit config --get x.y`], { cwd: fx.dir, encoding: "utf8" });
  assert.deepEqual([r.stdout, r.status, ["pwn1", "pwn2"].filter((f) => existsSync(join(fx.dir, f)))], [`${hostile}\n`, 0, []], r.stderr);
}));

// Lot R25-GUARDS-1 (items R25-NUL-BINARY-1 and R25-COUNT-CAP-1, ADR-M003 D9 duodecies). A content git detects as binary (a NUL byte in
// its first 8 000 bytes, `// <NUL>` on a first line included) counted 0 lines under both pathspecs; it now counts its lines everywhere
// a count is read (the job, the module, the oracle), but the closed list of binary assets the repository holds. And the job caps the
// module's integration counts at the written ones itself: a module that answers above them makes the job red.
const nul = (tag: string, n: number): string => `// \0\n${lines(tag, n)}`;
const PNG = Buffer.from("89504e470d0a1a0a", "hex"); // the PNG signature (lot R25-GUARDS-2: an asset carries its format's magic)
const exitOf = (out: string): string => /^exit (\d+)$/m.exec(out)?.[1] ?? "?";
const contentChanged = (out: string): string => /^Content changed lines: (\d+) \(ADR bound: 8000\)$/m.exec(out)?.[1] ?? "none";

// killer: scripts/lot-size-integration.mjs:189 CONST "`* diff\\n${" -> "`${"
test("r25g_ci_w_counts_a_nul_first_line_under_both_pathspecs - R25-NUL-BINARY-1: a PR adds an executable src/code.mjs whose first line is `// <NUL>` (3 000 lines more) and a docs page of the site (CONTENT) shaped the same: the job's W reads 3 001 and 3 001 and the job is red (0 and 0, green, before the lot)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  fx.put("src/code.mjs", nul("code", 3000));
  fx.put("apps/site/app/docs/nul-first.ts", nul("page", 3000));
  fx.g("add", "-A");
  fx.g("commit", "-qm", "nul");
  const out = ciRun(fx);
  assert.deepEqual([changed(out), contentChanged(out), exitOf(out)], ["3001", "3001", "1"], out);
}, REAL_CI));

// killer: scripts/lot-size-integration.mjs:188 CONST "\"apps/site/app/fonts/*.ttf\", " -> ""
test("r25g_ci_w_leaves_only_the_declared_binary_assets_to_detection - R25-NUL-BINARY-1: a binary font in the fonts directory (apps/site/app/fonts/f.ttf, NUL then 2 000 lines) still counts 0, a text file named src/run.png (300 lines) counts 300, an undeclared binary src/f.woff2 (NUL then 40 lines) counts 41: W 341 (300 before the lot)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  fx.put("apps/site/app/fonts/f.ttf", `\0\x01\0\0\n${lines("font", 2000)}`); // the TrueType magic (lot R25-GUARDS-2)
  fx.put("src/run.png", lines("echo", 300));
  fx.put("src/f.woff2", `\0\n${lines("woff", 40)}`);
  fx.g("add", "-A");
  fx.g("commit", "-qm", "assets");
  const out = ciRun(fx);
  assert.deepEqual([changed(out), exitOf(out)], ["341", "0"], out);
}, REAL_CI));

// killer: scripts/lot-size-integration.mjs:34 CONST "src = attrTree(cwd)" -> "src = EMPTY_TREE"
test("r25g_integration_counts_a_nul_first_line - R25-NUL-BINARY-1 in the module: an unproven commit of a candidate PR adds src/code.mjs (`// <NUL>`, then 3 000 lines) and site/n.ts (the same, 10 lines): mode integration counts 3 001 and 11, not 0 and 0", () => withFx((fx) => {
  fx.put("src/code.mjs", nul("code", 3000));
  fx.put("site/n.ts", nul("page", 10));
  fx.g("add", "-A");
  fx.g("commit", "-qm", "nul");
  const r = effective({ cwd: fx.dir, ciText: fx.ci, base: TARGET, proof: proofOf(fx, []), written: [5000, 50] });
  assert.deepEqual([r.mode, r.code, r.content], ["integration", 3001, 11], r.detail.join("\n"));
}));

// killer: scripts/oracle/r25.mjs:27 CONST "${attrTree(clone)}" -> "4b825dc642cb6eb9a060e54bf8d69288fbee4904"
test("oracle_r25_w_counts_a_nul_first_line - R25-NUL-BINARY-1 in the oracle: src/code.mjs (`// <NUL>`, then 3 000 lines) and site/n.ts (the same, 10 lines): the oracle's r25() reads 3 001 and 11, red, as the job does (0 and 0, green, before the lot)", () => withFx((fx) => {
  const base = fx.g("rev-parse", "HEAD");
  fx.put("src/code.mjs", nul("code", 3000));
  fx.put("site/n.ts", nul("page", 10));
  fx.g("add", "-A");
  fx.g("commit", "-qm", "nul");
  const r = oracle(fx, base, null);
  assert.deepEqual([r.counts.map((c) => c.changed), r.exit], [[3001, 11], 1]);
}));

/** The measured tree's module, made to answer `integration` with the counts `print` builds from the written ones `w`. */
function raising(fx: Fx, print: string): void {
  const f = join(fx.dir, "scripts", "lot-size-integration.mjs"), src = readFileSync(f, "utf8"), line = "console.log(`${r.mode} ${r.code} ${r.content}`);";
  assert.ok(src.includes(line), "the count line of the module moved");
  writeFileSync(f, src.replace(line, () => `console.log(\`integration ${print}\`);`));
}
const CAP = "::error::Gate R-25: integration count above the written count. Fail-closed.";

// killer: .github/workflows/ci.yml:124 CONST "[ \"$NEW_CHANGED\" -le \"$CHANGED\" ] && " -> ""
test("r25g_ci_refuses_an_integration_code_count_above_w - R25-COUNT-CAP-1: the measured tree's module answers `integration` with the CODE count one above W (3 lines): the job prints no count, says why and is red (4, green, before the lot)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  fx.commit("pr", "src/c.txt", 3);
  raising(fx, "${Number(w[0]) + 1} ${w[1]}");
  const out = ciRun(fx);
  assert.deepEqual([changed(out), out.includes(CAP), exitOf(out)], ["none", true, "1"], out);
}, REAL_CI));

// killer: .github/workflows/ci.yml:124 CONST " && [ \"$NEW_CONTENT\" -le \"$CONTENT_CHANGED\" ]" -> ""
test("r25g_ci_refuses_an_integration_content_count_above_w - R25-COUNT-CAP-1: the measured tree's module answers `integration` with the CONTENT count one above W (0): the job prints no count, says why and is red (1, green, before the lot)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  fx.commit("pr", "src/c.txt", 3);
  raising(fx, "${w[0]} ${Number(w[1]) + 1}");
  const out = ciRun(fx);
  assert.deepEqual([contentChanged(out), out.includes(CAP), exitOf(out)], ["none", true, "1"], out);
}, REAL_CI));

// killer: scripts/oracle/r25.mjs:48 CONST "if (n.some((x, i) => Number(x) > written[i])) return" -> "if (false) return"
test("oracle_r25_is_red_on_an_integration_count_above_w - R25-COUNT-CAP-1 in the oracle: its own module (here one that answers `integration` one above W, the same bytes in the clone) above the written count: mode above-written, W kept, red, as the job (integration 3, green, before the lot)", () => withFx((fx) => {
  const o = mkdtempSync(join(tmpdir(), "r25g-oracle-"));
  try {
    const base = fx.g("rev-parse", "HEAD");
    fx.commit("pr", "src/c.txt", 3);
    raising(fx, "${Number(w[0]) + 1} ${w[1]}");
    mkdirSync(join(o, "scripts", "oracle"), { recursive: true });
    copyFileSync(join(ROOT, "scripts", "oracle", "r25.mjs"), join(o, "scripts", "oracle", "r25.mjs"));
    copyFileSync(join(fx.dir, "scripts", "lot-size-integration.mjs"), join(o, "scripts", "lot-size-integration.mjs"));
    const proofFile = join(fx.dir, ".git", "proof.json");
    writeFileSync(proofFile, "{}\n");
    const r = oracle(fx, base, proofFile, {}, o);
    assert.deepEqual([r.mode, r.counts.map((c) => c.changed), r.exit], ["above-written", [3, 0], 1]);
  } finally { rmSync(o, { recursive: true, force: true, maxRetries: 3 }); }
}));

// Fold of the G2 of R25-GUARDS-1 (R-1, R-3, N-1, N-2). The binary assets are left to git's detection only in the directories that hold
// them, under a case-sensitive match whatever the clone's core.ignorecase, and the attribute tree is proven in force before any count.

// killer: scripts/lot-size-integration.mjs:188 CONST "\"out/*.png\"" -> "\"*.png\""
test("r25g_ci_w_counts_code_named_as_an_asset_outside_the_asset_directories - G2 R-1: src/tool.png, executable code whose first line is `// <NUL>` (300 lines more), counts 301; a real binary image out/real.png (NUL then 50 lines) in its directory still counts 0: W 301 (0 before the fold)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  fx.put("src/tool.png", nul("tool", 300));
  mkdirSync(join(fx.dir, "out"));
  writeFileSync(join(fx.dir, "out", "real.png"), Buffer.concat([PNG, Buffer.from(`\0\n${lines("png", 50)}`)])); // the PNG magic (lot R25-GUARDS-2)
  fx.g("add", "-A");
  fx.g("commit", "-qm", "assets");
  assert.deepEqual([changed(ciRun(fx))], ["301"]);
}, REAL_CI));

// killer: scripts/lot-size-integration.mjs:33 CONST ", \"-c\", \"core.ignorecase=false\"" -> ""
test("r25g_upper_case_extension_counts_under_core_ignorecase - G2 R-3: in a clone with core.ignorecase=true (as on NTFS), out/RUN.PNG (`// <NUL>`, then 300 lines) does not match out/*.png: the job and the oracle both read 301, not 0", () => withFx((fx) => {
  fx.g("config", "core.ignorecase", "true");
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  const base = fx.g("rev-parse", "HEAD");
  fx.put("out/RUN.PNG", nul("run", 300));
  fx.g("add", "-A");
  fx.g("commit", "-qm", "upper");
  assert.deepEqual([changed(ciRun(fx)), oracle(fx, base, null).counts[0]?.changed], ["301", 301]);
}, REAL_CI));

// killer: scripts/lot-size-integration.mjs:196 CONST "if (read !== PROBES) throw" -> "if (false) throw"
test("r25g_attribute_tree_must_be_in_force - G2 N-1: a module whose attribute tree id is absent from the object store (git reads no attribute then, silently): `pin` refuses (the job prints no count and is red), the module returns W (mode error) and the oracle's r25() throws, instead of reading 0 for src/code.mjs (`// <NUL>`, then 3 000 lines)", () => withFx((fx) => {
  const o = mkdtempSync(join(tmpdir(), "r25g-oracle-"));
  try {
    const f = join(fx.dir, "scripts", "lot-size-integration.mjs"), src = readFileSync(f, "utf8"), at = 'g(["mktree"], ';
    assert.equal(src.split(at).length, 2, "the mktree call of attrTree moved");
    writeFileSync(f, src.replace(at, () => `"${"1".repeat(40)}" || ${at}`));
    fx.g("checkout", "-q", "-b", "pr", TARGET);
    const base = fx.g("rev-parse", "HEAD");
    fx.put("src/code.mjs", nul("code", 3000));
    fx.g("add", "src/code.mjs");
    fx.g("commit", "-qm", "nul");
    const out = ciRun(fx);
    const mod = spawnSync(process.execPath, ["--input-type=module", "-e", `import { effective } from ${JSON.stringify(pathToFileURL(f).href)}; const r = effective({ cwd: process.cwd(), ciText: ${JSON.stringify(REAL_CI)}, base: ${JSON.stringify(base)}, proof: null, written: [9, 9] }); console.log(r.mode, r.code, r.content);`], { cwd: fx.dir, encoding: "utf8" }).stdout.trim();
    mkdirSync(join(o, "scripts", "oracle"), { recursive: true });
    copyFileSync(join(ROOT, "scripts", "oracle", "r25.mjs"), join(o, "scripts", "oracle", "r25.mjs"));
    copyFileSync(f, join(o, "scripts", "lot-size-integration.mjs"));
    let threw = false;
    try { oracle(fx, base, null, {}, o); } catch { threw = true; }
    assert.deepEqual([changed(out), out.includes(PIN_ERROR), exitOf(out), mod, threw], ["none", true, "1", "error 9 9", true], out);
  } finally { rmSync(o, { recursive: true, force: true, maxRetries: 3 }); }
}, REAL_CI));

// killer: scripts/lot-size-integration.mjs:188 CONST "\"fixtures/*.cbor\", " -> ""
test("r25g_binary_assets_are_the_measured_list - G2 N-2: the closed list of (directory, extension) left to git's detection, measured on the trunk (45 binary files, 9 pairs), and the exact attributes written from it", () => {
  const list = ["apps/site/app/fonts/*.ttf", "apps/site/public/bell/anchors/*.ots", "docs/bell-publications/*.ots", "docs/course-bell/*.ots", "docs/dojo-publications/*.ots", "fixtures/*.cbor", "out/*.jpg", "out/*.png", "test/fixtures/*.ots"];
  assert.deepEqual([BINARY_ASSETS, ATTRIBUTES], [list, `* diff\n${list.map((p) => `${p} !diff\n`).join("")}`]);
});

// Lot R25-GUARDS-2 (items R25-ASSET-DIR-MAGIC-1, R25-CR-ONLY-LINES-1, R25-GITLINK-SYMLINK-1, ADR-M003 D9 terdecies). Before any count, `pin`
// (and the oracle's r25(), through its own module) refuses a changed path, under either pathspec of the range of the counts, that is a
// gitlink or a symlink, a declared binary asset without the magic number of its format, or text holding a bare CR or a JS line separator.
// Entries are staged by plumbing (exact bytes, any mode, nothing on disk): no autocrlf, no filesystem symlink, the same on win32.
function stage(fx: Fx, path: string, mode: string, bytes: Buffer | string): void {
  const id = mode === "160000" ? String(bytes) : execFileSync("git", ["-C", fx.dir, "hash-object", "-w", "--no-filters", "--stdin"], { input: bytes, encoding: "utf8" }).trim();
  fx.g("update-index", "--add", "--cacheinfo", `${mode},${id},${path}`);
}
const refusedIn = (out: string): string[] => [...out.matchAll(/^r25-integration: refused (.+)$/gm)].map((m) => m[1] ?? "");
const statements = (n: number, sep: string): string => Array.from({ length: n }, (_, i) => `globalThis.n${String(i)} = ${String(i)};${sep}`).join("");

// killer: scripts/lot-size-integration.mjs:226 CONST ".some((h) => b.subarray(0, h.length / 2).toString(\"hex\") === h)" -> ".some(() => true)"
test("r25h_ci_refuses_code_under_an_asset_name_in_an_asset_directory - R25-ASSET-DIR-MAGIC-1: out/tool.png (an asset pair of the trunk), executable code whose first line is `// <NUL>` (300 lines more), has no PNG magic: `pin` names it, the job prints no count and is red (Changed 0, green, before the lot)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  fx.put("out/tool.png", nul("tool", 300));
  fx.g("add", "-A");
  fx.g("commit", "-qm", "tool");
  const out = ciRun(fx);
  assert.deepEqual([changed(out), refusedIn(out), out.includes(PIN_ERROR), exitOf(out)], ["none", ["asset-magic out/tool.png"], true, "1"], out);
}, REAL_CI));

// killer: scripts/lot-size-integration.mjs:206 CONST "ttf: [\"00010000\"]" -> "ttf: [\"4f54544f\"]"
test("r25h_asset_magics_are_the_measured_list - R25-ASSET-DIR-MAGIC-1, Q-3: the magic numbers admitted per declared extension, measured on the trunk (ttf 00 01 00 00 only: OTTO and true are JS prefixes; the 32 bytes of the OpenTimestamps header and version; a CBOR map), one entry for each extension of BINARY_ASSETS", () => {
  const cbor = Array.from({ length: 32 }, (_, i) => (0xa0 + i).toString(16));
  assert.deepEqual(lsi.ASSET_MAGIC, { cbor, jpg: ["ffd8ff"], ots: ["004f70656e54696d657374616d7073000050726f6f6600bf89e2e884e8929401"], png: ["89504e470d0a1a0a"], ttf: ["00010000"] });
  assert.deepEqual([...new Set(BINARY_ASSETS.map((p) => p.slice(p.lastIndexOf(".") + 1)))].sort(), Object.keys(lsi.ASSET_MAGIC ?? {}).sort());
});

// killer: scripts/lot-size-integration.mjs:206 CONST "e2e884e8929401\"]" -> "e2e884e8929402\"]"
test("r25h_every_trunk_asset_passes_its_magic - R25-ASSET-DIR-MAGIC-1, R25-CR-ONLY-LINES-1, R25-GITLINK-SYMLINK-1 on the repository itself: its tree at HEAD, added whole onto an empty commit (objects shared, nothing copied), refuses nothing under the two pathspecs of its workflow (45 binary assets of 5 extensions on the trunk, no bare CR, no line separator, no gitlink, no symlink)", () => {
  assert.equal(typeof lsi.refusals, "function", "refusals is not exported");
  const d = mkdtempSync(join(tmpdir(), "r25h-tree-")), g = (...a: string[]): string => execFileSync("git", ["-C", d, "-c", "user.name=fx", "-c", "user.email=fx@localhost", ...a], { encoding: "utf8" }).trim();
  try {
    g("init", "-q");
    const common = execFileSync("git", ["-C", ROOT, "rev-parse", "--path-format=absolute", "--git-common-dir"], { encoding: "utf8" }).trim();
    writeFileSync(join(d, ".git", "objects", "info", "alternates"), `${join(common, "objects")}\n`);
    const empty = g("commit-tree", "4b825dc642cb6eb9a060e54bf8d69288fbee4904", "-m", "empty"), tree = execFileSync("git", ["-C", ROOT, "rev-parse", "HEAD^{tree}"], { encoding: "utf8" }).trim();
    g("update-ref", "HEAD", g("commit-tree", tree, "-p", empty, "-m", "tree"));
    const assets = g("ls-tree", "-r", "--name-only", "HEAD").split("\n").filter((p) => BINARY_ASSETS.some((a) => p.startsWith(a.slice(0, a.indexOf("*"))) && !p.slice(a.indexOf("*")).includes("/") && p.endsWith(a.slice(a.indexOf("*") + 1))));
    assert.deepEqual([lsi.refusals(d, empty, specsOf(REAL_CI)), [...new Set(assets.map((p) => p.slice(p.lastIndexOf(".") + 1)))].sort()], [[], ["cbor", "jpg", "ots", "png", "ttf"]]);
  } finally { rmSync(d, { recursive: true, force: true, maxRetries: 3 }); }
});

// killer: scripts/lot-size-integration.mjs:227 CONST "if (b[i + 1] !== 10)" -> "if (true)"
test("r25h_ci_refuses_a_bare_cr_and_keeps_crlf - R25-CR-ONLY-LINES-1: src/cr-only.cjs, 3 001 statements separated by a CR alone (one line for git, 3 001 for node), is refused; src/crlf-ok.cjs (CR LF) and docs/notes-cr.md (a bare CR outside both pathspecs) pass: the job is red on the first alone (Changed 1 + 10, green, before the lot)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  stage(fx, "src/cr-only.cjs", "100644", statements(3001, "\r"));
  stage(fx, "src/crlf-ok.cjs", "100644", statements(10, "\r\n"));
  stage(fx, "docs/notes-cr.md", "100644", "a\rb\r");
  fx.g("commit", "-qm", "cr");
  const out = ciRun(fx);
  assert.deepEqual([changed(out), refusedIn(out), exitOf(out)], ["none", ["bare-cr src/cr-only.cjs"], "1"], out);
}, REAL_CI));

// killer: scripts/lot-size-integration.mjs:228 CONST " || b.includes(\"\\u2029\")" -> ""
test("r25h_ci_refuses_the_js_line_separators - R25-CR-ONLY-LINES-1, Q-4: src/ls-sep.cjs (statements separated by U+2028) and src/ps-sep.cjs (by U+2029), line terminators for JS and not for git, are both refused (Changed 2, green, before the lot)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  stage(fx, "src/ls-sep.cjs", "100644", statements(300, "\u2028"));
  stage(fx, "src/ps-sep.cjs", "100644", statements(300, "\u2029"));
  fx.g("commit", "-qm", "separators");
  const out = ciRun(fx);
  assert.deepEqual([changed(out), refusedIn(out), exitOf(out)], ["none", ["line-separator src/ls-sep.cjs", "line-separator src/ps-sep.cjs"], "1"], out);
}, REAL_CI));

// killer: scripts/lot-size-integration.mjs:216 CONST "mode === \"160000\"" -> "mode === \"169999\""
test("r25h_ci_refuses_a_gitlink_under_both_pathspecs - R25-GITLINK-SYMLINK-1: a gitlink added under CODE (vendor/subrepo) and under CONTENT (apps/site/app/docs/subrepo) is refused, its code living in another repository; a gitlink of the base the PR removes passes (Changed 1 and Content 1, green, before the lot)", () => withFx((fx) => {
  const sub = fx.g("rev-parse", "HEAD");
  fx.g("checkout", "-q", TARGET);
  stage(fx, "lib/oldrepo", "160000", sub);
  fx.g("commit", "-qm", "an old gitlink");
  fx.g("checkout", "-q", "-b", "pr");
  fx.g("rm", "-q", "--cached", "lib/oldrepo");
  stage(fx, "vendor/subrepo", "160000", sub);
  stage(fx, "apps/site/app/docs/subrepo", "160000", sub);
  fx.g("commit", "-qm", "gitlinks");
  const out = ciRun(fx);
  assert.deepEqual([changed(out), contentChanged(out), refusedIn(out), exitOf(out)], ["none", "none", ["gitlink apps/site/app/docs/subrepo", "gitlink vendor/subrepo"], "1"], out);
}, REAL_CI));

// killer: scripts/lot-size-integration.mjs:216 CONST "mode === \"120000\"" -> "mode === \"129999\""
test("r25h_ci_refuses_a_symlink - R25-GITLINK-SYMLINK-1, Q-6: src/link.mjs, a symlink (mode 120000, staged by plumbing: no filesystem link, the same on win32) to ../docs/payload.md outside the CODE pathspec, is refused (Changed 1, green, before the lot)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  stage(fx, "src/link.mjs", "120000", "../docs/payload.md");
  fx.g("commit", "-qm", "link");
  const out = ciRun(fx);
  assert.deepEqual([changed(out), refusedIn(out), exitOf(out)], ["none", ["symlink src/link.mjs"], "1"], out);
}, REAL_CI));

// killer: scripts/lot-size-integration.mjs:255 CONST "[base] = opt(\"--base\")" -> "[base = \"origin/lot/etude-suite\"] = opt(\"--base\")"
test("r25h_pin_requires_the_workflow_and_the_base - Q-7: `pin` alone, or with --ci and no --base, prints nothing and exits 2, even where origin/lot/etude-suite exists: the changed paths are never left unchecked by a default (exit 0, the pinned read printed, before the lot)", () => withFx((fx) => {
  fx.g("update-ref", "refs/remotes/origin/lot/etude-suite", "HEAD");
  const run = (...a: string[]): string => { const r = spawnSync(process.execPath, ["scripts/lot-size-integration.mjs", "pin", ...a], { cwd: fx.dir, encoding: "utf8" }); return `${String(r.status)} ${String(r.stdout.length)}`; };
  assert.deepEqual([run(), run("--ci", ".github/workflows/ci.yml")], ["2 0", "2 0"]);
}, REAL_CI));

// killer: scripts/oracle/r25.mjs:33 CONST "...(refused.length > 0 ?" -> "...(false ?"
test("oracle_r25_refuses_what_the_job_refuses - the oracle's r25(), through its own module, on out/tool.png (no magic), src/cr-only.cjs (bare CR), vendor/subrepo (gitlink) and src/link.mjs (symlink): mode refused, the four named in its log, W kept, red (unproven and green before the lot)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  const base = fx.g("rev-parse", "HEAD");
  stage(fx, "out/tool.png", "100644", nul("tool", 300));
  stage(fx, "src/cr-only.cjs", "100644", statements(30, "\r"));
  stage(fx, "vendor/subrepo", "160000", base);
  stage(fx, "src/link.mjs", "120000", "../docs/payload.md");
  fx.g("commit", "-qm", "four");
  const r = oracle(fx, base, null) as OracleR25 & { log?: string };
  assert.deepEqual([r.mode, (r.log ?? "").split("\n").filter((l) => l.startsWith("refused ")), r.exit], ["refused", ["refused asset-magic out/tool.png", "refused bare-cr src/cr-only.cjs", "refused gitlink vendor/subrepo", "refused symlink src/link.mjs"], 1]);
}, REAL_CI));

// Fold of the G2 of R25-GUARDS-2 (B-1, R-1). A .gitmodules of the PR with `ignore = all` hid an added gitlink from `git diff --raw`
// (`-c diff.ignoreSubmodules=none` does not override it; `--ignore-submodules=none` does). A UTF-16 or UTF-32 text (with a BOM) carries
// line separators in bytes the UTF-8 search does not see; TypeScript and browsers decode it.

// killer: scripts/lot-size-integration.mjs:213 CONST "\"--ignore-submodules=none\", " -> ""
test("r25h_ci_refuses_a_gitlink_hidden_by_gitmodules_ignore - G2 B-1: vendor/subrepo (a gitlink) with a 4-line .gitmodules whose `ignore = all` hid it from `git diff --raw`: `pin` names it and exits 2, the job is red, and so is the oracle (pin rc 0, Changed 4, oracle green, before the fold)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  const base = fx.g("rev-parse", "HEAD");
  stage(fx, ".gitmodules", "100644", '[submodule "sub"]\n\tpath = vendor/subrepo\n\turl = https://example.invalid/x.git\n\tignore = all\n');
  stage(fx, "vendor/subrepo", "160000", base);
  fx.g("commit", "-qm", "hidden gitlink");
  const out = ciRun(fx), r = oracle(fx, base, null) as OracleR25 & { log?: string };
  assert.deepEqual([changed(out), refusedIn(out), exitOf(out), r.mode, r.exit], ["none", ["gitlink vendor/subrepo"], "1", "refused", 1], out);
}, REAL_CI));

// killer: scripts/lot-size-integration.mjs:228 CONST "fffe|feff|0000feff" -> "0000feff"
test("r25h_ci_refuses_a_utf16_or_utf32_bom - G2 R-1: four text paths whose blob opens with a UTF-16 little-endian (ff fe), UTF-16 big-endian (fe ff), UTF-32 little-endian (ff fe 00 00) or UTF-32 big-endian (00 00 fe ff) byte order mark are refused utf16-bom: their U+2028 separators are not UTF-8 bytes (Changed 4, green, before the fold)", () => withFx((fx) => {
  fx.g("checkout", "-q", "-b", "pr", TARGET);
  const boms: Record<string, string> = { "src/little16.ts": "fffe", "src/big16.ts": "feff", "src/little32.ts": "fffe0000", "src/big32.ts": "0000feff" };
  for (const [p, h] of Object.entries(boms)) stage(fx, p, "100644", Buffer.concat([Buffer.from(h, "hex"), Buffer.from("let n = 1;\u2028n++;\n", "ucs2")]));
  fx.g("commit", "-qm", "boms");
  const out = ciRun(fx);
  assert.deepEqual([changed(out), refusedIn(out), exitOf(out)], ["none", ["utf16-bom src/big16.ts", "utf16-bom src/big32.ts", "utf16-bom src/little16.ts", "utf16-bom src/little32.ts"], "1"], out);
}, REAL_CI));
