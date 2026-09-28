/**
 * Root test `oracle_run` (ADR-METHODE-2 D3/D4, lot M-3): scripts/oracle/run.mjs driven as a CLI on a FIXTURE repository
 * (git init under the OS temp dir, a fixture ci.yml, a package.json whose scripts are quick `node -e`). The real suite
 * is never launched here. Each run gets its own ORACLE_ROOT (lock, queue, results, run dirs): the host lock
 * F:/tmp/oracle-lock is never touched. C-V-4 bounds are relaxed except in the C-V-4 test. Each test names the mutant
 * (M1..M13) that turns it red; the kill table and the byte-exact restoration are in docs/G1-lot-methode-m3.md.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CI = `on:
  pull_request:
jobs:
  r25:
    steps:
      - env:
          VIBEGATES_PR_LIMIT: "5"
        run: |
          STAT=$(git diff --shortstat "origin/\${{ github.base_ref }}...HEAD" -- . ':(exclude)docs/**') || {
            exit 1
          }
          CHANGED=$(printf '%s\\n' "$STAT" | awk '{print 0}')
          if [ "$CHANGED" -gt "$VIBEGATES_PR_LIMIT" ]; then
            exit 1
          fi
  g3:
    steps:
      - run: npm ci
      - run: npm run lint && npm test # a comment
  g4:
    steps:
      - run: npm test
      - run: npm audit --audit-level=high
`;
const SCRIPTS = {
  lint: `node -e "process.exit(require('fs').existsSync('BAD') ? 1 : 0)"`,
  test: `node -e "require('fs').appendFileSync(process.env.FX_COUNT, 't'); console.log('# tests 3'); console.log('# pass 3'); console.log('# fail 0'); console.log('# skipped 0')"`,
  extra: `node -e "0"`,
};
interface Rec {
  key: string; exit: number; tree: { dirty: string | null }; gates: { name: string; exit: number }[]; ci_only: { cmd: string }[] | null;
  tests: { total: number; pass: number; fail: number; skip: number } | null; cv4: { node_exe: number } | null;
  r25: { name: string; insertions: number; changed: number; limit: number | null }[] | null; served_from: { file: string; sha256: string } | null;
}
const git = (cwd: string, ...a: string[]): string =>
  execFileSync("git", ["-C", cwd, "-c", "core.autocrlf=false", "-c", "user.name=fx", "-c", "user.email=fx@localhost", ...a], { encoding: "utf8" }).trim();
const sha256 = (b: Buffer): string => createHash("sha256").update(b).digest("hex");

function fixture(): { top: string; repo: string; base: string; root: string; count: string } {
  const top = mkdtempSync(join(tmpdir(), "oracle-fx-")), repo = join(top, "repo");
  mkdirSync(join(repo, ".github", "workflows"), { recursive: true });
  writeFileSync(join(repo, ".github", "workflows", "ci.yml"), CI);
  writeFileSync(join(repo, "package.json"), JSON.stringify({ name: "fx", private: true, scripts: SCRIPTS }));
  writeFileSync(join(repo, "package-lock.json"), "{}\n");
  git(repo, "init", "-q", "-b", "main");
  git(repo, "add", "-A");
  git(repo, "commit", "-qm", "base");
  const base = git(repo, "rev-parse", "HEAD");
  writeFileSync(join(repo, "lot.txt"), "1\n2\n3\n");
  git(repo, "add", "-A");
  git(repo, "commit", "-qm", "lot");
  return { top, repo, base, root: join(top, "root"), count: join(top, "count.txt") };
}
type Fx = ReturnType<typeof fixture>;
const withFx = (fn: (fx: Fx) => void): void => {
  const fx = fixture();
  try { fn(fx); } finally { rmSync(fx.top, { recursive: true, force: true, maxRetries: 3 }); }
};
function oracle(fx: Fx, args: string[], env: Record<string, string> = {}): { status: number | null; out: string; file: string; rec: Rec | null } {
  const r = spawnSync(process.execPath, [join(ROOT, "scripts", "oracle", "run.mjs"), "--tree", fx.repo, "--base", fx.base, ...args], {
    encoding: "utf8",
    env: { ...process.env, ORACLE_ROOT: fx.root, FX_COUNT: fx.count, ORACLE_MIN_FREE_MB: "0", ORACLE_MAX_NODE: "1000000", ORACLE_LOCK_POLL_MS: "50", ORACLE_LOCK_MAX_MS: "20000", ...env },
  });
  const line = /^oracle-result (.+)$/m.exec(r.stdout)?.[1];
  const file = line === undefined ? "" : (JSON.parse(line) as { record: string }).record;
  return { status: r.status, out: `${r.stdout}${r.stderr}`, file, rec: file === "" ? null : (JSON.parse(readFileSync(file, "utf8")) as Rec) };
}
/** Number of `npm test` executions: the fixture test script appends one character per run. */
const ran = (fx: Fx): number => (existsSync(fx.count) ? readFileSync(fx.count, "utf8").length : 0);

test("oracle_refuses_without_role — --role absent or unknown => exit 2, nothing runs (M1)", () => withFx((fx) => {
  for (const args of [[], ["--role", "G3"]]) {
    const r = oracle(fx, args);
    assert.equal(r.status, 2, r.out);
    assert.match(r.out, /refused: --role/);
  }
  assert.equal(ran(fx), 0);
}));

test("oracle_gates_are_the_run_lines_of_ci_yml — derived at launch, CI-only listed, npm test once; one more run: => one more gate (M2, M3)", () => withFx((fx) => {
  const a = oracle(fx, ["--role", "G1"]);
  assert.equal(a.status, 0, a.out);
  assert.deepEqual(a.rec?.gates.map((g) => g.name), ["r25", "lint", "test"]);
  assert.deepEqual(a.rec?.ci_only?.map((c) => c.cmd), ["npm ci", "npm audit --audit-level=high"]);
  assert.equal(ran(fx), 1, "npm test is listed in two jobs and runs once (test 42 once per pass)");
  assert.deepEqual(a.rec?.tests, { total: 3, pass: 3, fail: 0, skip: 0 });
  appendFileSync(join(fx.repo, ".github", "workflows", "ci.yml"), "      - run: npm run extra\n");
  git(fx.repo, "commit", "-qam", "one more run: line");
  const b = oracle(fx, ["--role", "G1"]);
  assert.equal(b.status, 0, b.out);
  assert.deepEqual(b.rec?.gates.map((g) => g.name), ["r25", "lint", "test", "extra"]);
}));

test("oracle_store_serves_g1_never_g2_cp2_g7 — same key: G1 served (cited by file and sha256, never copied); independent roles replay (M4, M5)", () => withFx((fx) => {
  const a = oracle(fx, ["--role", "G1", "--key", "k"]);
  assert.equal(a.rec?.served_from, null, a.out);
  const b = oracle(fx, ["--role", "G1", "--key", "k"]);
  assert.equal(b.status, 0, b.out);
  assert.equal(ran(fx), 1, "served: no gate replayed");
  assert.equal(b.rec?.key, a.rec?.key);
  assert.deepEqual(b.rec?.served_from, { file: basename(a.file), sha256: sha256(readFileSync(a.file)) });
  assert.deepEqual(b.rec?.gates, []);
  for (const role of ["G2", "cp-2", "G7"]) {
    const c = oracle(fx, ["--role", role, "--key", "k"]);
    assert.equal(c.status, 0, c.out);
    assert.equal(c.rec?.served_from, null, `${role} is never served (C-1, CA-9)`);
  }
  assert.equal(ran(fx), 4, "G2, cp-2 and G7 replayed the suite");
}));

test("oracle_modified_tree_is_replayed_on_its_content — same key, dirty tree: never served, the clone carries the untracked file (M6, M7)", () => withFx((fx) => {
  const a = oracle(fx, ["--role", "G1", "--key", "k"]);
  assert.equal(a.status, 0, a.out);
  writeFileSync(join(fx.repo, "BAD"), "x\n");
  const b = oracle(fx, ["--role", "G1", "--key", "k"]);
  assert.equal(b.rec?.key, a.rec?.key, "the D4 key names the commit, not the dirty state");
  assert.equal(b.rec?.served_from, null, "a dirty tree is replayed");
  assert.notEqual(b.rec?.tree.dirty, null);
  assert.equal(b.rec?.gates.find((g) => g.name === "lint")?.exit, 1, "the gate saw the untracked file");
  assert.equal(b.status, 1, b.out);
  assert.equal(ran(fx), 2);
}));

test("oracle_refuses_an_incomplete_same_key_record — a record without pid => exit 2, neither served nor replayed (M8)", () => withFx((fx) => {
  const a = oracle(fx, ["--role", "G1", "--key", "k"]);
  assert.equal(a.status, 0, a.out);
  const forged = JSON.parse(readFileSync(a.file, "utf8")) as Record<string, unknown>;
  delete forged.pid;
  writeFileSync(a.file, JSON.stringify(forged));
  const b = oracle(fx, ["--role", "G1", "--key", "k"]);
  assert.equal(b.status, 2, b.out);
  assert.match(b.out, /incomplete record .*pid/);
  assert.equal(ran(fx), 1);
}));

test("oracle_lock_fifo — a dead pid (queue and owner) is taken over; a live queued head is waited for (M9, M10)", () => withFx((fx) => {
  const dead = spawnSync(process.execPath, ["-e", "0"]).pid, first = (pid: number): string => `${"1".padStart(15, "0")}-${pid}.json`;
  const lock = join(fx.root, "oracle-lock"), queue = join(fx.root, "oracle-lock.queue");
  mkdirSync(lock, { recursive: true });
  mkdirSync(queue, { recursive: true });
  writeFileSync(join(lock, "owner.txt"), JSON.stringify({ pid: dead, role: "G1", sha: "x", date: "x" }));
  writeFileSync(join(queue, first(dead)), "{}");
  const a = oracle(fx, ["--role", "G1"]);
  assert.equal(a.status, 0, a.out);
  assert.deepEqual(readdirSync(queue), [], "the dead entry and our own entry are gone");
  assert.equal(existsSync(lock), false, "the lock is released");
  writeFileSync(join(queue, first(process.pid)), "{}");
  const b = oracle(fx, ["--role", "G1"], { ORACLE_LOCK_MAX_MS: "1500" });
  assert.equal(b.status, 75, b.out);
  assert.equal(ran(fx), 1, "no suite behind a live head of the queue");
  assert.deepEqual(readdirSync(queue), [first(process.pid)], "our own entry is removed on timeout");
}));

test("oracle_r25_over_the_ci_bound_is_red — 3 committed + 2 tracked-dirty + 10 untracked = 15 > VIBEGATES_PR_LIMIT 5; same R25_DIFF_RE as test 38 (M11, M13)", () => withFx((fx) => {
  appendFileSync(join(fx.repo, "lot.txt"), "4\n5\n");
  writeFileSync(join(fx.repo, "big.txt"), "x\n".repeat(10));
  const a = oracle(fx, ["--role", "G1", "--static-only"]);
  assert.equal(a.status, 1, a.out);
  assert.deepEqual(a.rec?.r25?.map((c) => [c.name, c.insertions, c.changed, c.limit]), [["STAT", 15, 15, 5]]);
  assert.equal(a.rec?.gates.find((g) => g.name === "r25")?.exit, 1);
  assert.equal(ran(fx), 0, "--static-only runs no locked gate");
  const re = (f: string): string | undefined => /const R25_DIFF_RE = (\/.+\/);/.exec(readFileSync(join(ROOT, f), "utf8"))?.[1];
  assert.equal(re("scripts/oracle/r25.mjs"), re("test/ci-gates.test.ts"), "R25_DIFF_RE drifted from test 38");
}));

test("oracle_cv4_refuses_the_suite — free memory or node.exe out of bounds => exit 3, no suite, lock released (M12)", () => withFx((fx) => {
  for (const env of [{ ORACLE_MIN_FREE_MB: "1000000000" }, { ORACLE_MAX_NODE: "0" }]) {
    const a = oracle(fx, ["--role", "G1"], env);
    assert.equal(a.status, 3, a.out);
    assert.ok((a.rec?.cv4?.node_exe ?? 0) >= 1, "at least this oracle's own node process is counted");
    assert.equal(existsSync(join(fx.root, "oracle-lock")), false);
  }
  assert.equal(ran(fx), 0, "npm test never launched");
}));
