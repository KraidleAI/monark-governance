/**
 * Root tests of scripts/red-proof.mjs, the F2P proof of a lot (ADR-METHODE-2 D2, lot M-4, decision 267 (b)), on a fixture repo built under TEMP, git isolated (GIT_*
 * out, no system config, a global core.autocrlf=true): a base commit, a gel commit (fifteen case tests in four new files, a moved test file, a docs note) and two
 * linked worktrees (an untracked test file, a modified one with a new test between two old ones, a support helper, a deleted file; stillborn, invalid, dead and
 * hanging killers, a test closing indented (layout: unsupported), a killer line deleted right under an unchanged one-line test (not judged)); node_modules holds a
 * plain package and a workspace link, as npm installs them. Each test names the mutation of the script that reddens it (killer convention). Governance-only.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { classify, drawKillers, parseTap, type ProofRow, type RedProof } from "../scripts/red-proof.mjs";
import * as redProof from "../scripts/red-proof.mjs"; // a namespace: a base without untrackedOf still loads the file, and the tests below go red by assertion

const CLI = join(import.meta.dirname, "..", "scripts", "red-proof.mjs");
const sha = (b: Buffer): string => createHash("sha256").update(b).digest("hex");
const HEAD = 'import { test } from "node:test";\nimport assert from "node:assert/strict";\n';
const W = (fixed: boolean): string => `export const double = (x) => x + x${fixed ? "" : " + 1"};\n`;
const DENIED = ["FX_API_KEY_1", "FX_PRIVATE_KEY", "FX_TOKEN_1", "FX_SECRET_1", "GH_FX", "GITHUB_FX", "CHAINSTACK_FX", "MONARK_PUBLIC_MIRROR"]; // one per DENY alternative
const F2P = `// killer: packages/w/index.js:1 COR "x + x" -> "x - x"\ntest("f2p_true", () => { assert.equal(double(2), 4); assert.deepEqual(${JSON.stringify([...DENIED, "FX_VISIBLE"])}.filter((k) => k in process.env), ["FX_VISIBLE"]); });\n`;
const OLD = (head: string, above: string, gate: string): string =>
  `${HEAD}import { double } from "@fx/w";\n${head}test("old_first", () => { assert.equal(1, 1); });\n${above}test("old_green", () => {\n${gate}  assert.equal(double(2), 4);\n});\n`;
const TWICE = '// killer: packages/w/index.js:1 COR "x + x" -> "x - x"\ntest("twice_new", () => { assert.equal(twice(1), 4); });\n';
const GEL: Record<string, string> = {
  "packages/w/index.js": W(true),
  "lib/old.ts": "export const OLD = 1;\nexport function extra(): number { return 2; }\n",
  "lib/fresh.ts": "export const THREE = 3;\nexport function fresh(n: number): number { return n * 3; }\n", "docs/note.md": "a journal, out of the digest\n",
  "test/cases.test.ts": `${HEAD}import { double } from "@fx/w";\nimport { HALF } from "fx-dep";\n${F2P}` +
    '// killer: node_modules/fx-dep/index.js:1 CONST "2" -> "3"\ntest("outside_killer", () => { assert.equal(double(7), 14); });\n' +
    '// killer: test/cases.test.ts:1 CONST "test }" -> "test as t }"\ntest("test_code_killer", () => { assert.equal(double(8), 16); });\n' +
    '// killer: packages/w/index.js:1 COR "x + x" -> "x - x"\ntest("gel_typeerror", () => { assert.equal(double(1) === 2 ? (null as unknown as { x: number }).x : 0, 1); });\n' +
    '// killer: packages/w/index.js:1 COR "x + x" -> "x * x"\ntest("green_at_base", () => { assert.equal(HALF, 2); });\n' +
    'test("no_killer", () => { assert.equal(double(3), 6); });\n' +
    '// killer: lib/old.ts:1 CONST "1" -> "5"\ntest("stillborn", () => { assert.equal(double(5), 10); });\n' +
    '// killer: packages/w/index.js:1 CONST "x * 9" -> "x * 8"\ntest("stale_killer", () => { assert.equal(double(4), 8); });\n' +
    '// killer: packages/w/index.js:1 COR "x + x" -> "x * x"\ntest("red_at_gel", () => { assert.equal(double(1), 5); });\n' +
    '// killer: packages/w/index.js:1 CONST "x" -> "y"\ntest("ambiguous_killer", () => { assert.equal(double(6), 12); });\n' +
    '// killer: packages/w/index.js:1 COR "x + x" -> "x * x"\ntest("slow (test 42)", () => { assert.equal(double(2), 4); });\n',
  "test/existing.test.ts": `${HEAD}import { extra } from "../lib/old.ts";\n// killer: lib/old.ts:2 CONST "2" -> "3"\ntest("import_existing", () => { assert.equal(extra(), 2); });\n`,
  "test/fresh.test.ts": `${HEAD}import { fresh } from "../lib/fresh.ts";\n// killer: lib/fresh.ts:2 CONST "3" -> "4"\ntest("new_module — (fresh) [x] $y 'z' #w", () => { assert.equal(fresh(2), 6); });\ntest("new_no_killer", () => { assert.equal(fresh(1), 3); });\n`,
  "test/dies.test.ts": `${HEAD}// killer: lib/fresh.ts:1 CONST "3" -> "4"\ntest("dies", () => { process.exit(134); });\n`,
};

const GIT_ENV = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_"))), GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "" };
function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", ["-c", "user.name=fixture", "-c", "user.email=fixture@localhost", "-c", "core.autocrlf=false", ...args], { cwd, encoding: "utf8", env: GIT_ENV });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
}
function write(root: string, files: Record<string, string>): void {
  for (const [p, text] of Object.entries(files)) { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), text); }
}

interface Fixture { root: string; dir: string; base: string; gel: string; nm: number }
let fx: Fixture | undefined;
function fixture(): Fixture {
  if (fx !== undefined) return fx;
  const root = mkdtempSync(join(tmpdir(), "red-proof-fx-")), dir = join(root, "repo");
  GIT_ENV.GIT_CONFIG_GLOBAL = join(root, "gitconfig"); writeFileSync(GIT_ENV.GIT_CONFIG_GLOBAL, "[core]\nautocrlf = true\n"); // any host: the tool's clone must override it
  write(dir, {
    "package.json": '{"name":"fx","private":true,"type":"module"}\n', ".gitignore": "node_modules/\n", "lib/old.ts": "export const OLD = 1;\n", "test/old.test.ts": OLD("", "// a base note, deleted by the worktree\n\n", "  if (process.pid > 0) return;\n"),
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
  git(dir, "mv", "test/old.test.ts", "test/moved.test.ts");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "gel");
  fx = { root, dir, base, gel: git(dir, "rev-parse", "HEAD"), nm: statSync(join(dir, "node_modules", "fx-dep", "index.js")).mtimeMs };
  return fx;
}
after(() => { if (fx !== undefined) rmSync(fx.root, { recursive: true, force: true, maxRetries: 5 }); });

interface Run { status: number | null; proof: RedProof; out: string; left: string[] }
const runs = new Map<string, Run>();
function run(key: string, gel: string, extra: string[], base = fixture().base, opts: { repo?: string | null; cli?: string } = {}): Run { // repo null: no --repo
  const f = fixture(), done = runs.get(key);
  if (done !== undefined) return done;
  const out = join(f.root, `out-${key}`), tmp = join(f.root, `tmp-${key}`);
  mkdirSync(tmp, { recursive: true });
  const r = spawnSync(process.execPath, [opts.cli ?? CLI, "--base", base, "--gel", gel, ...(opts.repo === null ? [] : ["--repo", opts.repo ?? f.dir]), "--out", out, ...extra], { encoding: "utf8", env: { ...GIT_ENV, ...Object.fromEntries([...DENIED, "FX_VISIBLE"].map((k) => [k, "fake"])), TEMP: tmp, TMP: tmp, TMPDIR: tmp } });
  assert.ok(existsSync(join(out, "RED-PROOF.json")), `red-proof exited ${r.status} without a proof: ${r.stderr}`); // a tool crash is an assertion failure
  const res = { status: r.status, proof: JSON.parse(readFileSync(join(out, "RED-PROOF.json"), "utf8")) as RedProof, out, left: readdirSync(tmp) };
  runs.set(key, res);
  return res;
}
const commitRun = (): Run => run("commit", fixture().gel, ["--draw", "3", "--seed", "7"]);
function worktreeRun(): Run {
  const f = fixture(), wt = join(f.root, "wt");
  if (!existsSync(wt)) {
    git(f.dir, "worktree", "add", "-q", "--detach", wt, f.base);
    rmSync(join(wt, "lib", "old.ts"));
    write(wt, {
      "packages/w/index.js": W(true), "test/good.test.ts": `${HEAD}import { existsSync } from "node:fs";\nimport { double } from "@fx/w";\n${F2P}// killer: packages/w/index.js:1 COR "x + x" -> "x - x"\ntest("old_gone", () => { assert.equal(existsSync("lib/old.ts") ? 0 : double(1), 2); });\n`,
      "test/old.test.ts": OLD('import { twice } from "./helpers/h.ts";\n// killer: packages/w/index.js:1 COR "x + x" -> "x - x"\n', `const helper = 0;\n\n// A new test between two old ones, with a preamble:\n/**\n * a blank line, line and block comments (in no body).\n */\n${TWICE}// killer: packages/w/index.js:1 COR "x + x" -> "x - x"\n`, ""),
      "test/helpers/h.ts": 'import { double } from "@fx/w";\nexport const twice = (x: number): number => double(double(x));\n',
    });
  }
  return run("worktree", wt, ["--draw", "2", "--seed", "1"]);
}
function weakRun(): Run { // a second linked worktree, at gel: four admitted tests, whose drawn killers are stillborn, invalid, dead, hanging
  const f = fixture(), wt = join(f.root, "wt2");
  if (!existsSync(wt)) {
    git(f.dir, "worktree", "add", "-q", "--detach", wt, f.gel);
    write(wt, {
      "lib/old.ts": "export const OLD = 2;\n", "test/weak.test.ts": `${HEAD}import { OLD } from "../lib/old.ts";\n// killer: lib/fresh.ts:1 CONST "3" -> "4"\ntest("weak", () => { assert.equal(OLD, 2); });\n`, "test/cases.test.ts": readFileSync(join(wt, "test", "cases.test.ts"), "utf8").replace('// killer: lib/old.ts:1 CONST "1" -> "5"\n', ""),
      "test/layout.test.ts": `${HEAD}// killer: lib/old.ts:1 CONST "2" -> "1"\ntest("layout_bad", () => {\n  assert.equal(1, 1);\n  });\n`, // RED-PROOF-LEX-FALLBACK-1: closes indented, not at column 0 -> unsupported test layout
    });
    write(wt, { "lib/vi.ts": "export const vi = (): number => 1;\nexport const vj = (): number => 2;\nexport const vk = async (): Promise<number> => 3;\n", "test/vi.test.ts": `${HEAD}import { vi, vj, vk } from "../lib/vi.ts";\n// killer: lib/vi.ts:2 SDL "export" -> ""\ntest("vi_invalid", () => { assert.equal(vj(), 2); });\n// killer: lib/vi.ts:1 CONST "1" -> "process.exit(134)"\ntest("vi_dies", () => { assert.equal(vi(), 1); });\n// killer: lib/vi.ts:3 CONST "=> 3" -> "=> new Promise(() => {})"\ntest("vi_hangs", { timeout: 500 }, async () => { assert.equal(await vk(), 3); });\n` });
  }
  return run("weak", wt, ["--draw", "4", "--seed", "1"], f.gel);
}
function row(name: string): ProofRow {
  const r = commitRun().proof.tests.find((t) => t.name === name);
  assert.ok(r !== undefined, `no row for ${name}`);
  return r;
}
const admitted = (rows: ProofRow[]): ProofRow[] => rows.filter((t) => t.verdict === "F2P" || t.verdict === "new-module");

// killer: scripts/red-proof.mjs:142 COR "!ent.isSymbolicLink()" -> "ent.isSymbolicLink()"
test("red_proof_admits_an_assertion_red_at_base_through_a_workspace_link", () => {
  const r = row("f2p_true");
  assert.deepEqual([r.base, r.gel, r.verdict], ["assert-fail", "pass", "F2P"]);
});

// killer: scripts/red-proof.mjs:173 SDL "green at base" -> ""
test("red_proof_refuses_a_test_green_at_base_or_red_at_gel", () => {
  const r = row("green_at_base"), g = row("red_at_gel");
  assert.deepEqual([r.base, r.gel, r.verdict, g.base, g.gel, g.verdict], ["pass", "pass", "refused", "assert-fail", "assert-fail", "refused"]);
  assert.match(`${r.reason} | ${g.reason}`, /green at base.* \| not green at gel \(assert-fail\)/);
  assert.deepEqual([row("gel_typeerror").base, row("gel_typeerror").gel, row("gel_typeerror").verdict], ["assert-fail", "other-fail", "refused"]);
});

// killer: scripts/red-proof.mjs:171 COR "&& t.newModule" -> "|| t.newModule"
test("red_proof_refuses_an_import_red_on_a_module_that_exists_at_base", () => {
  const r = row("import_existing");
  assert.deepEqual([r.base, r.gel, r.module, r.verdict], ["import-fail", "pass", "lib/old.ts", "refused"]);
});

// killer: scripts/red-proof.mjs:241 COR "&& added.has(module)" -> "&& !added.has(module)"
test("red_proof_admits_a_new_module_with_its_killer", () => {
  const r = row("new_module — (fresh) [x] $y 'z' #w"), n = row("new_no_killer");
  assert.deepEqual([r.base, r.gel, r.module, r.verdict, n.base, n.module, n.verdict], ["import-fail", "pass", "lib/fresh.ts", "new-module", "import-fail", "lib/fresh.ts", "refused"]);
});

// killer: scripts/red-proof.mjs:167 SDL "no killer declared" -> ""
test("red_proof_refuses_a_test_without_killer", () => {
  const r = row("no_killer");
  assert.deepEqual([r.base, r.gel, r.killer, r.verdict], ["assert-fail", "pass", null, "refused"]);
});

// killer: scripts/red-proof.mjs:168 SDL "invalid killer" -> ""
test("red_proof_refuses_a_stale_or_ambiguous_killer", () => {
  for (const r of [row("stale_killer"), row("ambiguous_killer")]) {
    assert.deepEqual([r.base, r.verdict], ["assert-fail", "refused"]);
    assert.match(r.reason, /does not occur exactly once/);
  }
  assert.deepEqual([row("outside_killer").reason, row("test_code_killer").reason, statSync(join(fixture().dir, "node_modules", "fx-dep", "index.js")).mtimeMs], ["invalid killer: node_modules/fx-dep/index.js is out of scope: not a file inside the gel clone", "invalid killer: test/cases.test.ts is test code: a killer mutates production code", fixture().nm]);
});

// killer: scripts/red-proof.mjs:195 CONST "\"stillborn\"" -> "\"killed\""
test("red_proof_refuses_a_stillborn_killer_among_the_drawn", () => {
  const { status, proof } = commitRun();
  assert.deepEqual(Object.fromEntries((proof.draw?.drawn ?? []).map((d) => [d.name, d.outcome])), { f2p_true: "killed", stillborn: "stillborn", "new_module — (fresh) [x] $y 'z' #w": "killed" });
  assert.deepEqual([status, proof.ok], [1, false]);
});

// killer: scripts/red-proof.mjs:254 CONST "sha256: sha(baseTap)" -> "sha256: sha(gelTap)"
test("red_proof_tap_sha256_recomputes_equal", () => {
  const { proof, out } = commitRun(), f = fixture();
  for (const t of [proof.tap.base, proof.tap.gel, ...(proof.draw?.drawn ?? []).map((d) => d.tap)]) assert.equal(sha(readFileSync(join(out, t.path))), t.sha256, t.path);
  assert.deepEqual([proof.base, proof.gel.head, proof.gel.mode], [f.base, f.gel, "commit"]);
  const recipe = git(f.dir, "diff", "--name-status", "--no-renames", f.base, f.gel).split("\n").map((l) => l.split("\t")).sort((x, y) => ((x[1] ?? "") < (y[1] ?? "") ? -1 : 1));
  assert.equal(proof.gel.digest, sha(Buffer.from(recipe.filter(([, p]) => !/^docs\/(.+\/)?[^/]+\.md$/.test(p ?? "")).map(([s, p]) => `${s ?? ""} ${p ?? ""} ${s === "D" ? "-" : sha(readFileSync(join(f.dir, p ?? "")))}`).join("\n"))), "digest recipe");
});

// killer: scripts/red-proof.mjs:262 SDL "rmSync(work" -> ""
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

// killer: scripts/red-proof.mjs:99 SDL "Reached heap limit" -> ""
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

// killer: scripts/red-proof.mjs:179 CONST "seed >>> 0" -> "0"
test("red_proof_draw_is_reproducible_at_a_fixed_seed", () => {
  const pop = Array.from({ length: 20 }, (_, i) => i), d = drawKillers(pop, 3, 42);
  assert.deepEqual(drawKillers(pop, 3, 42), d);
  assert.notDeepEqual(drawKillers(pop, 3, 43), d);
  assert.deepEqual([new Set(d).size, drawKillers([5, 6], 3, 42).sort()], [3, [5, 6]]);
  const { proof } = commitRun();
  assert.deepEqual(proof.draw?.drawn.map((x) => x.name), drawKillers(admitted(proof.tests), 3, 7).map((t) => t.name));
});

// killer: scripts/red-proof.mjs:217 SDL "ls-files" -> ""
test("red_proof_worktree_gel_counts_untracked_files_and_exits_zero", () => {
  const { status, proof } = worktreeRun(), sub = run("worktree-sub", join(fixture().root, "wt", "test"), []); // --gel names a sub-directory; no --draw
  assert.deepEqual([proof.tests, sub.proof.tests].map((ts) => ts.map((t) => [t.file, t.name, t.base, t.gel, t.verdict])), Array(2).fill([
    ["test/good.test.ts", "f2p_true", "assert-fail", "pass", "F2P"], ["test/good.test.ts", "old_gone", "assert-fail", "pass", "F2P"],
    ["test/old.test.ts", "twice_new", "assert-fail", "pass", "F2P"], ["test/old.test.ts", "old_green", "assert-fail", "pass", "F2P"],
  ]));
  assert.deepEqual([status, proof.ok, proof.gel.mode, proof.gel.head, proof.draw?.drawn.map((d) => d.outcome), proof.drawn, sub.status, sub.proof.ok, sub.proof.drawn], [0, true, "worktree", fixture().base, ["killed", "killed"], 2, 0, true, 0]);
});

// killer: scripts/red-proof.mjs:117 SDL "set.add(l)" -> ""
test("red_proof_judges_only_the_changed_tests_of_a_modified_file", () => {
  const { proof } = worktreeRun(); // old_first: unchanged, the line deleted under it and the blank and comment lines added there are in no body; old_green loses a line: judged
  assert.deepEqual([proof.unchanged, proof.files.support, proof.tests.filter((t) => t.file === "test/old.test.ts").map((t) => t.name)], [1, ["test/helpers/h.ts"], ["twice_new", "old_green"]]);
});

// killer: scripts/red-proof.mjs:165 SDL "runs under the host lock only" -> ""
test("red_proof_never_runs_test_42_outside_the_host_lock", () => {
  const r = row("slow (test 42)");
  assert.deepEqual([r.base, r.gel, r.verdict], ["missing", "missing", "refused"]); // filtered out by --test-skip-pattern: never run, absent from the TAP
  assert.match(r.reason, /host lock/);
});

// killer: scripts/red-proof.mjs:248 COR "&& drawn.every(" -> "|| drawn.every("
test("red_proof_fails_on_a_stillborn_draw_or_an_empty_diff", () => {
  const weak = weakRun(), empty = run("empty", fixture().gel, [], fixture().gel);
  assert.deepEqual([weak.proof.tests.map((t) => t.verdict), Object.fromEntries((weak.proof.draw?.drawn ?? []).map((d) => [d.name, d.outcome])), weak.proof.ok, weak.status],
    [["refused", "new-module", "new-module", "new-module", "F2P"], { vi_invalid: "invalid", vi_dies: "inconclusive", vi_hangs: "inconclusive", weak: "stillborn" }, false, 1]); // a load failure, a dead child or a timeout is never a kill (D6); "refused" = layout_bad (RED-PROOF-LEX-FALLBACK-1), sorts first, never drawn
  assert.deepEqual([empty.proof.tests.length, empty.proof.ok, empty.status, empty.proof.drawn], [0, false, 1, 0]);
});

// killer: scripts/red-proof.mjs:241 CONST "unsupported test layout" -> ""
test("red_proof_refuses_an_unsupported_test_layout", () => {
  const r = weakRun().proof.tests.find((t) => t.file === "test/layout.test.ts" && t.name === "layout_bad");
  assert.deepEqual([r?.verdict, r?.reason], ["refused", "unsupported test layout"]);
});

// killer: scripts/red-proof.mjs:266 CONST "import.meta.main !== false" -> "process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)"
test("red_proof_launched_through_a_junction_records_or_refuses_never_a_silent_exit_0", () => {
  const f = fixture(), j = join(f.root, "scripts-junction"), cli = join(j, "red-proof.mjs"); // RED-PROOF-JUNCTION-GUARD-1: argv[1] is the link, import.meta.url the real path
  symlinkSync(join(import.meta.dirname, "..", "scripts"), j, "junction"); // New-Item -ItemType Junction on Windows, a symlink elsewhere
  const u = spawnSync(process.execPath, [cli], { encoding: "utf8", env: GIT_ENV }), e = run("junction-cli", f.gel, [], f.gel, { cli });
  assert.deepEqual([u.status, /usage/.test(u.stderr), e.status, e.proof.tests.length, e.proof.ok], [2, true, 1, 0, false], u.stderr);
});

// killer: scripts/red-proof.mjs:142 CONST "link(realpathSync(from), to)" -> "null"
test("red_proof_links_the_real_target_of_a_junctioned_module_and_repoints_a_junctioned_scope", () => {
  const f = fixture(), c = join(f.root, "junction-clone"); // RED-PROOF-JUNCTION-1 (C-4 of CM-2a): a clone whose node_modules entries are each a junction (mk-nm.ps1)
  git(f.root, "clone", "-q", f.dir, c);
  mkdirSync(join(c, "node_modules"));
  for (const e of ["fx-dep", "@fx"]) symlinkSync(join(f.dir, "node_modules", e), join(c, "node_modules", e), "junction"); // a package and a whole scope
  const cols = (r: Run): string[][] => r.proof.tests.map((t) => [t.file, t.name, t.base, t.gel, t.verdict]), j = run("junction-clone", f.gel, [], f.base, { repo: c });
  assert.deepEqual(cols(j), cols(commitRun())); // the workspace @fx/w still resolves in each clone: f2p_true stays red at base
  assert.ok(cols(j).some(([, n, b, g, v]) => n === "f2p_true" && b === "assert-fail" && g === "pass" && v === "F2P"));
});

// killer: scripts/red-proof.mjs:277 CONST "skipped.push(link); continue;" -> "changes.push(p); continue;"
test("red_proof_worktree_gel_with_a_junctioned_node_modules_is_judged", () => {
  const f = fixture(), wt = join(f.root, "wt3"); // the node_modules junction is no directory to the node_modules/ ignore rule: git lists it as untracked
  git(f.dir, "worktree", "add", "-q", "--detach", wt, f.base);
  write(wt, { "packages/w/index.js": W(true), "test/j.test.ts": `${HEAD}import { double } from "@fx/w";\nimport { HALF } from "fx-dep";\n// killer: packages/w/index.js:1 COR "x + x" -> "x - x"\ntest("through_junction", () => { assert.equal(double(HALF), 4); });\n` });
  symlinkSync(join(f.dir, "node_modules"), join(wt, "node_modules"), "junction");
  const { status, proof } = run("junction-wt", wt, ["--draw", "1", "--seed", "1"], f.base, { repo: null }); // no --repo: node_modules is read through the junction
  assert.deepEqual([status, proof.ok, proof.files.added, proof.tests.map((t) => [t.name, t.base, t.gel, t.verdict]), proof.draw?.drawn.map((d) => d.outcome)],
    [0, true, ["test/j.test.ts"], [["through_junction", "assert-fail", "pass", "F2P"]], ["killed"]]);
});

function driftRun(): Run { // B-1 of the G2: a lot that adds a workspace package, a --repo working copy drifted from the gel, mk-nm.ps1 junctions
  const f = fixture(), d = join(f.root, "drift"), store = join(f.root, "store", "node_modules"); // store: the real targets of the junctions (F:/Monark/node_modules/<x>)
  if (!existsSync(d)) {
    write(store, { "fx-dep/package.json": '{"name":"fx-dep","type":"module","exports":"./index.js"}\n', "fx-dep/index.js": "export const HALF = 2;\n" });
    write(d, { "package.json": '{"name":"dr","private":true,"type":"module","workspaces":["packages/*"]}\n', ".gitignore": "node_modules/\n", "lib/a.js": "export const A = 1;\n" });
    git(d, "init", "-q", "-b", "main"); git(d, "add", "-A"); git(d, "commit", "-q", "-m", "base");
    write(d, { "packages/v/package.json": '{"name":"@fx/v","type":"module","exports":"./index.js"}\n', "packages/v/index.js": "export const dbl = (x) => x + x;\n",
      "test/v.test.ts": `${HEAD}import { dbl } from "@fx/v";\nimport { HALF } from "fx-dep";\n// killer: packages/v/index.js:1 COR "x + x" -> "x - x"\ntest("v_dbl", () => { assert.equal(dbl(HALF), 4); });\n`,
      "test/links.test.ts": `${HEAD}import { readdirSync } from "node:fs";\nimport { HALF } from "fx-dep";\n// killer: lib/a.js:1 CONST "1" -> "2"\ntest("links_kept_out", () => { assert.deepEqual([readdirSync("node_modules").sort(), HALF], [["@fx", "fx-dep"], 2]); });\n` });
    git(d, "add", "-A"); git(d, "commit", "-q", "-m", "gel");
    mkdirSync(join(d, "node_modules", "@fx"), { recursive: true });
    symlinkSync(join(d, "packages", "v"), join(d, "node_modules", "@fx", "v"), "junction"); // npm's workspace link, to a package the base lacks
    symlinkSync(join(store, "fx-dep"), join(d, "node_modules", "fx-dep"), "junction");
    symlinkSync(join(store, "absent"), join(d, "node_modules", "fx-broken"), "junction"); // a broken link
    symlinkSync(join(store, "fx-dep", "index.js"), join(d, "node_modules", "fx-file"), "file"); // a link to a file under node_modules
    writeFileSync(join(d, "packages", "v", "index.js"), "export const dbl = (x) => x + x + 1;\n"); // the drift: uncommitted, or another branch checked out
  }
  return run("drift", git(d, "rev-parse", "HEAD"), [], git(d, "rev-parse", "HEAD~1"), { repo: d });
}

// killer: scripts/red-proof.mjs:142 CONST " && realpathSync(from).split(sep).includes(\"node_modules\")" -> ""
test("red_proof_never_loads_a_workspace_the_base_lacks_from_the_repo_working_copy", () => {
  const r = driftRun(), v = r.proof.tests.find((t) => t.name === "v_dbl"); // the base clone must not see packages/v of --repo: no false F2P
  assert.deepEqual([r.status, r.proof.ok, v?.base, v?.gel, v?.verdict], [1, false, "import-fail", "pass", "refused"]);
});

// killer: scripts/red-proof.mjs:142 CONST "isDir(from) &&" -> "true &&"
test("red_proof_leaves_out_a_broken_link_and_a_link_to_a_file_in_node_modules", () => {
  const r = driftRun(), l = r.proof.tests.find((t) => t.name === "links_kept_out"); // the tool runs on; the clones list @fx and fx-dep only
  assert.deepEqual([r.status, l?.base, l?.gel], [1, "pass", "pass"]);
});

// killer: scripts/red-proof.mjs:276 CONST "find((q) => isLink(join(gitDir, q)))" -> "find(() => false)"
test("red_proof_records_a_skipped_linked_directory_and_still_stops_on_an_untracked_nested_repo", () => {
  const f = fixture(), wt = join(f.root, "wt4"), nested = join(f.root, "wt5"); // m-1 of the G2: only a link is skipped, and the proof says so
  git(f.dir, "worktree", "add", "-q", "--detach", wt, f.base);
  symlinkSync(join(f.dir, "lib"), join(wt, "linked"), "junction");
  const r = run("linked-wt", wt, [], f.base, { repo: null });
  git(f.dir, "worktree", "add", "-q", "--detach", nested, f.base);
  write(join(nested, "vendor", "sub"), { "n.js": "export const N = 1;\n" });
  git(join(nested, "vendor", "sub"), "init", "-q", "-b", "main"); git(join(nested, "vendor", "sub"), "add", "-A"); git(join(nested, "vendor", "sub"), "commit", "-q", "-m", "n");
  const n = spawnSync(process.execPath, [CLI, "--base", f.base, "--gel", nested, "--out", join(f.root, "out-nested")], { encoding: "utf8", env: GIT_ENV });
  assert.deepEqual([r.status, r.proof.files.skipped, n.status, /untracked directory vendor\/sub\/ is no file to copy/.test(n.stderr), existsSync(join(f.root, "out-nested", "RED-PROOF.json"))], [1, ["linked"], 2, true, false], n.stderr); // the stop is named, never an errno (EISDIR here, EPERM on win32)
});

function shapes(): string { // a worktree-like directory: a junction to a directory, a plain file, an untracked nested repository's directory
  const d = join(fixture().root, "shapes");
  if (!existsSync(d)) { write(d, { "a.ts": "export const A = 1;\n", "vendor/sub/n.js": "export const N = 1;\n" }); symlinkSync(join(fixture().dir, "lib"), join(d, "linked"), "junction"); }
  return d;
}
const untrackedOf = (d: string, ps: string[]): { changes: string[]; skipped: string[] } => {
  assert.equal(typeof (redProof as Record<string, unknown>).untrackedOf, "function", "scripts/red-proof.mjs exports untrackedOf");
  return redProof.untrackedOf(d, ps);
};

// killer: scripts/red-proof.mjs:276 CONST "parts.slice(0, i + 1).join(\"/\")" -> "p"
test("red_proof_skips_a_linked_directory_in_each_shape_git_may_list_it", () => {
  const d = shapes(); // RED-PROOF-JUNCTION-1 win32: git output injected; Git for Windows may walk a junction as a directory and list the files under it
  const got = [["linked"], ["linked/"], ["linked/old.ts", "linked/fresh.ts"], ["a.ts", "linked/", "linked/old.ts", ""]].map((ps) => untrackedOf(d, ps));
  assert.deepEqual(got, [{ changes: [], skipped: ["linked"] }, { changes: [], skipped: ["linked"] }, { changes: [], skipped: ["linked"] }, { changes: ["a.ts"], skipped: ["linked"] }]);
});

// killer: scripts/red-proof.mjs:278 SDL "throw new Error" -> ""
test("red_proof_stops_by_name_on_an_untracked_directory_in_each_shape", () => {
  const d = shapes(); // no copy is tried, so no errno decides the stop (EISDIR on Linux, EPERM on win32)
  for (const ps of [["vendor/sub/"], ["vendor/sub"], ["a.ts", "vendor/sub/"]]) assert.throws(() => untrackedOf(d, ps), /^Error: untracked directory vendor\/sub\/ is no file to copy \(a nested repository\?\)/, ps.join(","));
});
