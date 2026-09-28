/**
 * Root tests of scripts/red-proof.mjs, the F2P proof of a lot (ADR-METHODE-2 D2, lot M-4, decision 267 (b)), on a fixture repo built
 * under TEMP: a base commit, a gel commit (eleven case tests in four new files) and two linked worktrees (an untracked test file, a
 * modified one and a support helper; a stillborn killer); node_modules holds a plain package and a workspace link, as npm installs
 * them. Each test names the mutation of the script that reddens it (killer convention of red-proof.mjs, first consumer). Governance-only.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { classify, drawKillers, parseTap, type ProofRow, type RedProof } from "../scripts/red-proof.mjs";

const CLI = join(import.meta.dirname, "..", "scripts", "red-proof.mjs");
const sha = (b: Buffer): string => createHash("sha256").update(b).digest("hex");
const HEAD = 'import { test } from "node:test";\nimport assert from "node:assert/strict";\n';
const W = (fixed: boolean): string => `export const double = (x) => x + x${fixed ? "" : " + 1"};\n`;
const F2P = '// killer: packages/w/index.js:1 COR "x + x" -> "x - x"\ntest("f2p_true", () => { assert.equal(double(2), 4); });\n';
const OLD = (head: string, above: string, gate: string): string =>
  `${HEAD}import { double } from "@fx/w";\n${head}test("old_first", () => { assert.equal(1, 1); });\n${above}test("old_green", () => {\n${gate}  assert.equal(double(2), 4);\n});\n`;
const TWICE = '// killer: packages/w/index.js:1 COR "x + x" -> "x - x"\ntest("twice_new", () => { assert.equal(twice(1), 4); });\n';
const GEL: Record<string, string> = {
  "packages/w/index.js": W(true),
  "lib/old.ts": "export const OLD = 1;\nexport function extra(): number { return 2; }\n",
  "lib/fresh.ts": "export function fresh(n: number): number { return n * 3; }\n",
  "test/cases.test.ts": `${HEAD}import { double } from "@fx/w";\nimport { HALF } from "fx-dep";\n${F2P}` +
    '// killer: packages/w/index.js:1 COR "x + x" -> "x * x"\ntest("green_at_base", () => { assert.equal(HALF, 2); });\n' +
    'test("no_killer", () => { assert.equal(double(3), 6); });\n' +
    '// killer: lib/old.ts:1 CONST "1" -> "5"\ntest("stillborn", () => { assert.equal(double(5), 10); });\n' +
    '// killer: packages/w/index.js:1 CONST "x * 9" -> "x * 8"\ntest("stale_killer", () => { assert.equal(double(4), 8); });\n' +
    '// killer: packages/w/index.js:1 COR "x + x" -> "x * x"\ntest("red_at_gel", () => { assert.equal(double(1), 5); });\n' +
    '// killer: packages/w/index.js:1 CONST "x" -> "y"\ntest("ambiguous_killer", () => { assert.equal(double(6), 12); });\n' +
    '// killer: packages/w/index.js:1 COR "x + x" -> "x * x"\ntest("slow (test 42)", () => { assert.equal(double(2), 4); });\n',
  "test/existing.test.ts": `${HEAD}import { extra } from "../lib/old.ts";\n// killer: lib/old.ts:2 CONST "2" -> "3"\ntest("import_existing", () => { assert.equal(extra(), 2); });\n`,
  "test/fresh.test.ts": `${HEAD}import { fresh } from "../lib/fresh.ts";\n// killer: lib/fresh.ts:1 CONST "3" -> "4"\ntest("new_module", () => { assert.equal(fresh(2), 6); });\n`,
  "test/dies.test.ts": `${HEAD}// killer: lib/fresh.ts:1 CONST "3" -> "4"\ntest("dies", () => { process.exit(134); });\n`,
};

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", ["-c", "user.name=fixture", "-c", "user.email=fixture@localhost", "-c", "core.autocrlf=false", ...args], { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
}
function write(root: string, files: Record<string, string>): void {
  for (const [p, text] of Object.entries(files)) { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), text); }
}

interface Fixture { root: string; dir: string; base: string; gel: string }
let fx: Fixture | undefined;
function fixture(): Fixture {
  if (fx !== undefined) return fx;
  const root = mkdtempSync(join(tmpdir(), "red-proof-fx-")), dir = join(root, "repo");
  write(dir, {
    "package.json": '{"name":"fx","private":true,"type":"module"}\n', ".gitignore": "node_modules/\n", "lib/old.ts": "export const OLD = 1;\n", "test/old.test.ts": OLD("", "", "  if (process.pid > 0) return;\n"),
    "packages/w/package.json": '{"name":"@fx/w","type":"module","exports":"./index.js"}\n', "packages/w/index.js": W(false),
    "node_modules/fx-dep/package.json": '{"name":"fx-dep","type":"module","exports":"./index.js"}\n', "node_modules/fx-dep/index.js": "export const HALF = 2;\n",
  });
  mkdirSync(join(dir, "node_modules", "@fx"));
  symlinkSync(join(dir, "packages", "w"), join(dir, "node_modules", "@fx", "w"), "junction");
  git(dir, "init", "-q", "-b", "main");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "base");
  const base = git(dir, "rev-parse", "HEAD");
  write(dir, GEL);
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "gel");
  fx = { root, dir, base, gel: git(dir, "rev-parse", "HEAD") };
  return fx;
}
after(() => { if (fx !== undefined) rmSync(fx.root, { recursive: true, force: true, maxRetries: 5 }); });

interface Run { status: number | null; proof: RedProof; out: string; left: string[] }
const runs = new Map<string, Run>();
function run(key: string, gel: string, extra: string[], base = fixture().base): Run {
  const f = fixture(), done = runs.get(key);
  if (done !== undefined) return done;
  const out = join(f.root, `out-${key}`), tmp = join(f.root, `tmp-${key}`);
  mkdirSync(tmp);
  const r = spawnSync(process.execPath, [CLI, "--base", base, "--gel", gel, "--repo", f.dir, "--out", out, ...extra], { encoding: "utf8", env: { ...process.env, TEMP: tmp, TMP: tmp, TMPDIR: tmp } });
  const res = { status: r.status, proof: JSON.parse(readFileSync(join(out, "RED-PROOF.json"), "utf8")) as RedProof, out, left: readdirSync(tmp) };
  runs.set(key, res);
  return res;
}
const commitRun = (): Run => run("commit", fixture().gel, ["--draw", "3", "--seed", "7"]);
function worktreeRun(): Run {
  const f = fixture(), wt = join(f.root, "wt");
  if (!existsSync(wt)) {
    git(f.dir, "worktree", "add", "-q", "--detach", wt, f.base);
    write(wt, {
      "packages/w/index.js": W(true), "test/good.test.ts": `${HEAD}import { double } from "@fx/w";\n${F2P}`,
      "test/old.test.ts": `${OLD('import { twice } from "./helpers/h.ts";\n', '// killer: packages/w/index.js:1 COR "x + x" -> "x - x"\n', "")}${TWICE}`,
      "test/helpers/h.ts": 'import { double } from "@fx/w";\nexport const twice = (x: number): number => double(double(x));\n',
    });
  }
  return run("worktree", wt, ["--draw", "2", "--seed", "1"]);
}
function weakRun(): Run { // a second linked worktree, at gel: its one test is admitted, but its drawn killer is stillborn
  const f = fixture(), wt = join(f.root, "wt2");
  if (!existsSync(wt)) {
    git(f.dir, "worktree", "add", "-q", "--detach", wt, f.gel);
    write(wt, { "lib/old.ts": "export const OLD = 2;\n", "test/weak.test.ts": `${HEAD}import { OLD } from "../lib/old.ts";\n// killer: lib/fresh.ts:1 CONST "3" -> "4"\ntest("weak", () => { assert.equal(OLD, 2); });\n` });
  }
  return run("weak", wt, ["--draw", "1", "--seed", "1"], f.gel);
}
function row(name: string): ProofRow {
  const r = commitRun().proof.tests.find((t) => t.name === name);
  assert.ok(r !== undefined, `no row for ${name}`);
  return r;
}
const admitted = (rows: ProofRow[]): ProofRow[] => rows.filter((t) => t.verdict === "F2P" || t.verdict === "new-module");

// killer: scripts/red-proof.mjs:135 COR "!ent.isSymbolicLink()" -> "ent.isSymbolicLink()"
test("red_proof_admits_an_assertion_red_at_base_through_a_workspace_link", () => {
  const r = row("f2p_true");
  assert.deepEqual([r.base, r.gel, r.verdict], ["assert-fail", "pass", "F2P"]);
});

// killer: scripts/red-proof.mjs:166 SDL "green at base" -> ""
test("red_proof_refuses_a_test_green_at_base_or_red_at_gel", () => {
  const r = row("green_at_base"), g = row("red_at_gel");
  assert.deepEqual([r.base, r.gel, r.verdict, g.base, g.gel, g.verdict], ["pass", "pass", "refused", "assert-fail", "assert-fail", "refused"]);
  assert.match(`${r.reason} | ${g.reason}`, /green at base.* \| not green at gel \(assert-fail\)/);
});

// killer: scripts/red-proof.mjs:164 COR "&& t.newModule" -> "|| t.newModule"
test("red_proof_refuses_an_import_red_on_a_module_that_exists_at_base", () => {
  const r = row("import_existing");
  assert.deepEqual([r.base, r.gel, r.module, r.verdict], ["import-fail", "pass", "lib/old.ts", "refused"]);
});

// killer: scripts/red-proof.mjs:234 COR "&& added.has(module)" -> "&& !added.has(module)"
test("red_proof_admits_a_new_module_with_its_killer", () => {
  const r = row("new_module");
  assert.deepEqual([r.base, r.gel, r.module, r.verdict], ["import-fail", "pass", "lib/fresh.ts", "new-module"]);
});

// killer: scripts/red-proof.mjs:160 SDL "no killer declared" -> ""
test("red_proof_refuses_a_test_without_killer", () => {
  const r = row("no_killer");
  assert.deepEqual([r.base, r.gel, r.killer, r.verdict], ["assert-fail", "pass", null, "refused"]);
});

// killer: scripts/red-proof.mjs:161 SDL "invalid killer" -> ""
test("red_proof_refuses_a_stale_or_ambiguous_killer", () => {
  for (const r of [row("stale_killer"), row("ambiguous_killer")]) {
    assert.deepEqual([r.base, r.verdict], ["assert-fail", "refused"]);
    assert.match(r.reason, /does not occur exactly once/);
  }
});

// killer: scripts/red-proof.mjs:188 CONST "\"stillborn\"" -> "\"killed\""
test("red_proof_refuses_a_stillborn_killer_among_the_drawn", () => {
  const { status, proof } = commitRun();
  assert.deepEqual(Object.fromEntries((proof.draw?.drawn ?? []).map((d) => [d.name, d.outcome])), { f2p_true: "killed", stillborn: "stillborn", new_module: "killed" });
  assert.deepEqual([status, proof.ok], [1, false]);
});

// killer: scripts/red-proof.mjs:247 CONST "sha256: sha(baseTap)" -> "sha256: sha(gelTap)"
test("red_proof_tap_sha256_recomputes_equal", () => {
  const { proof, out } = commitRun(), f = fixture();
  for (const t of [proof.tap.base, proof.tap.gel, ...(proof.draw?.drawn ?? []).map((d) => d.tap)]) assert.equal(sha(readFileSync(join(out, t.path))), t.sha256, t.path);
  assert.deepEqual([proof.base, proof.gel.head, proof.gel.mode], [f.base, f.gel, "commit"]);
  const recipe = git(f.dir, "diff", "--name-status", "--no-renames", f.base, f.gel).split("\n").map((l) => l.split("\t")).sort((x, y) => ((x[1] ?? "") < (y[1] ?? "") ? -1 : 1));
  assert.equal(proof.gel.digest, sha(Buffer.from(recipe.map(([s, p]) => `${s ?? ""} ${p ?? ""} ${sha(readFileSync(join(f.dir, p ?? "")))}`).join("\n"))), "digest recipe");
});

// killer: scripts/red-proof.mjs:255 SDL "rmSync(work" -> ""
test("red_proof_restores_each_mutated_file_and_removes_its_clones", () => {
  const f = fixture(), { proof, left } = commitRun();
  assert.equal(proof.draw?.drawn.length, 3);
  for (const d of proof.draw?.drawn ?? []) {
    const gel = sha(readFileSync(join(f.dir, d.killer.file)));
    assert.deepEqual([d.sha256_before, d.sha256_after], [gel, gel], `${d.killer.file} restored to its gel bytes`);
  }
  assert.deepEqual(left, [], "no clone left in TEMP");
  assert.deepEqual([git(f.dir, "status", "--porcelain"), git(f.dir, "rev-parse", "HEAD")], ["", f.gel]);
  assert.ok(existsSync(join(f.dir, "node_modules", "fx-dep", "index.js")), "the linked package survives the cleanup");
});

// killer: scripts/red-proof.mjs:92 SDL "Reached heap limit" -> ""
test("red_proof_counts_a_killed_child_as_inconclusive", () => {
  const tap = (diag: string, note = ""): string => `TAP version 13\n${note}not ok 1 - t\n  ---\n${diag}  ...\n1..1\n`;
  const oom = "# FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory\n"; // the shape measured on this host: both signals
  const shapes: Array<[string, string]> = [["  exitCode: 134\n  signal: ~\n", oom], ["  exitCode: 1\n  signal: ~\n", oom], ["  exitCode: 134\n  signal: ~\n", ""], ["  exitCode: ~\n  signal: 'SIGKILL'\n", ""]];
  for (const [diag, note] of shapes) assert.equal(classify(parseTap(tap(`  failureType: 'testCodeFailure'\n${diag}`, note))[0]), "inconclusive", diag);
  const dies = row("dies"); // a child that exits 134 (the abort code) at base and at gel
  assert.deepEqual([dies.base, dies.gel, dies.verdict], ["inconclusive", "inconclusive", "inconclusive"]);
  assert.equal(classify(parseTap(tap("  failureType: 'testCodeFailure'\n  code: 'ERR_TEST_FAILURE'\n  name: 'TypeError'\n"))[0]), "other-fail");
  assert.equal(classify(parseTap(tap("  failureType: 'testCodeFailure'\n  code: 'ERR_ASSERTION'\n  name: 'AssertionError'\n"))[0]), "assert-fail");
  const sub = (code: string): string => `    not ok 1 - s\n      ---\n      failureType: 'testCodeFailure'\n      code: '${code}'\n      ...\n`;
  const parent = (...codes: string[]): string => `${codes.map(sub).join("")}not ok 1 - p\n  ---\n  failureType: 'subtestsFailed'\n  code: 'ERR_TEST_FAILURE'\n  ...\n`;
  assert.deepEqual([parent("ERR_ASSERTION", "ERR_ASSERTION"), parent("ERR_ASSERTION", "ERR_TEST_FAILURE")].map((t) => classify(parseTap(t)[0])), ["assert-fail", "other-fail"]);
});

// killer: scripts/red-proof.mjs:172 CONST "seed >>> 0" -> "0"
test("red_proof_draw_is_reproducible_at_a_fixed_seed", () => {
  const pop = Array.from({ length: 20 }, (_, i) => i), d = drawKillers(pop, 3, 42);
  assert.deepEqual(drawKillers(pop, 3, 42), d);
  assert.notDeepEqual(drawKillers(pop, 3, 43), d);
  assert.deepEqual([new Set(d).size, drawKillers([5, 6], 3, 42).sort()], [3, [5, 6]]);
  const { proof } = commitRun();
  assert.deepEqual(proof.draw?.drawn.map((x) => x.name), drawKillers(admitted(proof.tests), 3, 7).map((t) => t.name));
});

// killer: scripts/red-proof.mjs:210 SDL "ls-files" -> ""
test("red_proof_worktree_gel_counts_untracked_files_and_exits_zero", () => {
  const { status, proof } = worktreeRun();
  assert.deepEqual(proof.tests.map((t) => [t.file, t.name, t.base, t.gel, t.verdict]), [
    ["test/good.test.ts", "f2p_true", "assert-fail", "pass", "F2P"], ["test/old.test.ts", "old_green", "assert-fail", "pass", "F2P"],
    ["test/old.test.ts", "twice_new", "assert-fail", "pass", "F2P"],
  ]);
  assert.deepEqual([status, proof.ok, proof.gel.mode, proof.gel.head, proof.draw?.drawn.map((d) => d.outcome)], [0, true, "worktree", fixture().base, ["killed", "killed"]]);
});

// killer: scripts/red-proof.mjs:110 SDL "set.add(l)" -> ""
test("red_proof_judges_only_the_changed_tests_of_a_modified_file", () => {
  const { proof } = worktreeRun(); // old_first gains a killer line only (unjudged); old_green loses a line (a pure deletion hunk): judged
  assert.deepEqual([proof.unchanged, proof.files.support, proof.tests.filter((t) => t.file === "test/old.test.ts").map((t) => t.name)], [1, ["test/helpers/h.ts"], ["old_green", "twice_new"]]);
});

// killer: scripts/red-proof.mjs:158 SDL "runs under the host lock only" -> ""
test("red_proof_never_runs_test_42_outside_the_host_lock", () => {
  const r = row("slow (test 42)");
  assert.deepEqual([r.base, r.gel, r.verdict], ["missing", "missing", "refused"]); // filtered out by --test-skip-pattern: never run, absent from the TAP
  assert.match(r.reason, /host lock/);
});

// killer: scripts/red-proof.mjs:241 COR "&& drawn.every(" -> "|| drawn.every("
test("red_proof_fails_on_a_stillborn_draw_or_an_empty_diff", () => {
  const weak = weakRun(), empty = run("empty", fixture().gel, [], fixture().gel);
  assert.deepEqual([weak.proof.tests.map((t) => t.verdict), weak.proof.draw?.drawn.map((d) => d.outcome), weak.proof.ok, weak.status], [["F2P"], ["stillborn"], false, 1]);
  assert.deepEqual([empty.proof.tests.length, empty.proof.ok, empty.status], [0, false, 1]);
});
