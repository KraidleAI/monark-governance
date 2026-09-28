/**
 * Root test `oracle_run` (ADR-METHODE-2 D3/D4, lot M-3): scripts/oracle/run.mjs driven as a CLI on a FIXTURE repository
 * (git init under the OS temp dir, a fixture ci.yml, a package.json whose quick `node -e` scripts print their env NAMES,
 * never a value, npm's offline flag and, for `test`, owner.txt as read under the lock). The real suite is never launched
 * here. Each run gets its own ORACLE_ROOT (lock, queue, results, run dirs): the host lock F:/tmp/oracle-lock is never
 * touched. C-V-4 bounds are relaxed except in the C-V-4 test. Each test names the mutants that turn it red (M1..M13 of
 * the G1, X1..X15 of the G2, `// killer:` lines); kill tables and byte-exact restoration: docs/G1-lot-methode-m3.md.
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
const ENV = "console.log('env ' + JSON.stringify(Object.keys(process.env)) + ' offline=' + process.env.npm_config_offline)";
const SCRIPTS = {
  lint: `node -e "const fs = require('fs'), r = process.env.ORACLE_ROOT + '/oracle-results'; ${ENV}; if (fs.existsSync('BRK')) for (const d of fs.readdirSync(r)) fs.mkdirSync(r + '/' + d + '.json.tmp'); process.exit(fs.existsSync('BAD') ? 1 : 0)"`,
  test: `node -e "const fs = require('fs'); fs.appendFileSync(process.env.FX_COUNT, 't'); ${ENV}; console.log('owner ' + fs.readFileSync(process.env.ORACLE_ROOT + '/oracle-lock/owner.txt')); console.log('# tests 3'); console.log('# pass 3'); console.log('# fail 0'); console.log('# skipped 0')"`,
  extra: `node -e "0"`,
};
interface Rec {
  key: string; exit: number; pid: number; tree: { dirty: string | null; object: string | null }; gates: { name: string; exit: number; log: string }[];
  ci_only: { cmd: string }[] | null; tests: { total: number; pass: number; fail: number; skip: number } | null;
  cv4: { node_exe: number; free_mb: number; min_free_mb: number; max_node: number } | null; served_from: { file: string; sha256: string } | null;
  r25: { name: string; insertions: number; deletions: number; changed: number; limit: number | null }[] | null;
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
  writeFileSync(join(repo, ".gitignore"), "ign.txt\n"); // an ignored file never makes the tree dirty (X11)
  writeFileSync(join(repo, "base.txt"), "a\nb\nc\n"); // lines a lot can delete (r25 counts insertions + deletions)
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
function oracle(fx: Fx, args: string[], env: Record<string, string | undefined> = {}): { status: number | null; out: string; file: string; rec: Rec | null } {
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
/** [role, sha, pid] of owner.txt as the locked fixture gate `test` printed it during the tenure (SHA per lock take). */
const owner = (r: { rec: Rec | null }): unknown[] => {
  const o = JSON.parse(/^owner (.+)$/m.exec(readFileSync(r.rec?.gates.find((g) => g.name === "test")?.log ?? "", "utf8"))?.[1] ?? "{}") as { role?: string; sha?: string; pid?: number };
  return [o.role, o.sha, o.pid];
};

test("oracle_refuses_without_role — --role absent or unknown => exit 2, nothing runs (M1)", () => withFx((fx) => {
  for (const args of [[], ["--role", "G3"]]) {
    const r = oracle(fx, args);
    assert.equal(r.status, 2, r.out);
    assert.match(r.out, /refused: --role/);
  }
  assert.equal(ran(fx), 0);
}));

test("oracle_gates_are_the_run_lines_of_ci_yml — derived at launch, CI-only listed, npm test once; one more run: => one more gate; a run: | block runs under bash -e; the run and the lock take name the tree (M2, M3, X8, X9)", () => withFx((fx) => {
  // killer: scripts/oracle/run.mjs:141 SDL "\"-e\", " -> ""
  const a = oracle(fx, ["--role", "G1"]);
  assert.equal(a.status, 0, a.out);
  assert.deepEqual(a.rec?.gates.map((g) => g.name), ["r25", "lint", "test"]);
  assert.deepEqual(a.rec?.ci_only?.map((c) => c.cmd), ["npm ci", "npm audit --audit-level=high"]);
  assert.equal(ran(fx), 1, "npm test is listed in two jobs and runs once (test 42 once per pass)");
  assert.deepEqual(a.rec?.tests, { total: 3, pass: 3, fail: 0, skip: 0 });
  assert.equal(a.rec?.tree.object, git(fx.repo, "rev-parse", "HEAD^{tree}"), "the record names the tree it tested (B-TREE-SHA-1)");
  assert.deepEqual(owner(a), ["G1", git(fx.repo, "rev-parse", "HEAD"), a.rec?.pid], "owner.txt names this take");
  appendFileSync(join(fx.repo, ".github", "workflows", "ci.yml"), "      - run: npm run extra\n");
  git(fx.repo, "commit", "-qam", "one more run: line");
  const b = oracle(fx, ["--role", "G1"]);
  assert.equal(b.status, 0, b.out);
  assert.deepEqual(b.rec?.gates.map((g) => g.name), ["r25", "lint", "test", "extra"]);
  appendFileSync(join(fx.repo, ".github", "workflows", "ci.yml"), "      - run: |\n          node -e \"process.exit(1)\"\n          node -e \"process.exit(0)\"\n");
  git(fx.repo, "commit", "-qam", "a block whose first line fails");
  const c = oracle(fx, ["--role", "G1"]);
  assert.deepEqual([c.status, c.rec?.gates.at(-1)?.exit], [1, 1], "a run: | block runs under bash -e: a failing line fails the gate");
}));

test("oracle_gates_see_no_foreign_credential — no credential NAME reaches a gate of either lane (static lint, locked test) and npm runs offline (C-G2-1, X1)", () => withFx((fx) => {
  // killer: scripts/oracle/run.mjs:46 SDL "for (const k of Object.keys(process.env)) if (DENY.test(k)) delete process.env[k];" -> ""
  // killer: scripts/oracle/run.mjs:136 SDL "npm_config_offline: \"true\", " -> ""
  const fake = ["FX_API_KEY_1", "FX_PRIVATE_KEY", "FX_TOKEN_1", "FX_SECRET_1", "GH_FX", "GITHUB_FX", "CHAINSTACK_FX", "MONARK_PUBLIC_MIRROR"];
  const a = oracle(fx, ["--role", "G1"], { ...Object.fromEntries(fake.map((k) => [k, "fake"])), FX_VISIBLE: "1" });
  assert.equal(a.status, 0, a.out);
  for (const gate of ["lint", "test"]) {
    const log = readFileSync(a.rec?.gates.find((g) => g.name === gate)?.log ?? "", "utf8");
    const names = JSON.parse(/^env (\[.*\])/m.exec(log)?.[1] ?? "[]") as string[];
    assert.ok(names.includes("FX_VISIBLE"), `${gate}: the probe sees the environment`);
    assert.deepEqual(names.filter((k) => /API_KEY|_KEY$|TOKEN|SECRET|^GH_|^GITHUB_|^CHAINSTACK_|^MONARK_PUBLIC_MIRROR$/i.test(k)), [], `${gate}: no credential name`);
    assert.match(log, /offline=true/, `${gate}: npm_config_offline`);
  }
}));

test("oracle_store_serves_g1_never_g2_cp2_g7 — same key: G1 served (cited by file and sha256, never copied, with its own tree sha), an ignored file leaves the tree clean; independent roles replay (M4, M5, X11)", () => withFx((fx) => {
  // killer: scripts/oracle/run.mjs:55 SDL ", \"--exclude-standard\"" -> ""
  const a = oracle(fx, ["--role", "G1", "--key", "k"]);
  assert.equal(a.rec?.served_from, null, a.out);
  writeFileSync(join(fx.repo, "ign.txt"), "ignored\n");
  const b = oracle(fx, ["--role", "G1", "--key", "k"]);
  assert.equal(b.status, 0, b.out);
  assert.equal(ran(fx), 1, "served: no gate replayed");
  assert.equal(b.rec?.key, a.rec?.key);
  assert.deepEqual(b.rec?.served_from, { file: basename(a.file), sha256: sha256(readFileSync(a.file)) });
  assert.deepEqual([b.rec?.gates, b.rec?.tree.object], [[], a.rec?.tree.object]);
  for (const role of ["G2", "cp-2", "G7"]) {
    const c = oracle(fx, ["--role", role, "--key", "k"]);
    assert.equal(c.status, 0, c.out);
    assert.equal(c.rec?.served_from, null, `${role} is never served (C-1, CA-9)`);
  }
  assert.equal(ran(fx), 4, "G2, cp-2 and G7 replayed the suite");
}));

test("oracle_store_serves_only_a_full_clean_replay — a static-only, dirty or served same-key record never serves; a --static-only run is never served (X5, X10, X14, X15)", () => withFx((fx) => {
  // killer: scripts/oracle/run.mjs:82 COR "r.served_from !== null || " -> ""
  // killer: scripts/oracle/run.mjs:75 COR "&& dirty === null && !staticOnly &&" -> "&& dirty === null &&"
  // killer: scripts/oracle/run.mjs:82 COR "r.static_only !== false || " -> ""
  // killer: scripts/oracle/run.mjs:82 COR " || r.tree?.dirty !== null" -> ""
  const k = ["--role", "G1", "--key", "k"], s = oracle(fx, [...k, "--static-only"]);
  writeFileSync(join(fx.repo, "new.txt"), "1\n");
  const d = oracle(fx, k);
  rmSync(join(fx.repo, "new.txt"));
  const a = oracle(fx, k), e = oracle(fx, [...k, "--static-only"]), b = oracle(fx, k);
  assert.deepEqual([s.status, d.status, d.rec?.tree.dirty === null, a.rec?.served_from, e.rec?.served_from, ran(fx)], [0, 0, false, null, null, 2], a.out);
  assert.equal(b.rec?.served_from?.file, basename(a.file), "the full clean replay is the one served");
  writeFileSync(b.file, JSON.stringify({ ...(JSON.parse(readFileSync(b.file, "utf8")) as Record<string, unknown>), gates: a.rec?.gates }));
  rmSync(a.file);
  const c = oracle(fx, k);
  assert.deepEqual([c.rec?.served_from, ran(fx)], [null, 3], "a served record, even forged with gates, is never served again");
}));

test("oracle_red_same_key_record_is_never_served — decision 267 (c): a suite refused by C-V-4, or a red base, is replayed with a mention, never served (X4)", () => withFx((fx) => {
  // killer: scripts/oracle/run.mjs:83 SDL "if (r.exit !== 0) { console.error(`oracle: same-key record ${f} is red ...`); continue; }" -> ""
  const a = oracle(fx, ["--role", "G1", "--key", "k"], { ORACLE_MAX_NODE: "0" }), b = oracle(fx, ["--role", "G1", "--key", "k"]);
  assert.deepEqual([a.status, b.status, b.rec?.served_from, ran(fx)], [3, 0, null, 1], b.out);
  assert.match(b.out, /is red \(exit 3\): never served, replayed/);
  writeFileSync(join(fx.repo, "BAD"), "x\n");
  git(fx.repo, "add", "-A");
  git(fx.repo, "commit", "-qm", "a red base");
  const c = oracle(fx, ["--role", "G1", "--key", "k"]), d = oracle(fx, ["--role", "G1", "--key", "k"]);
  assert.deepEqual([c.status, d.status, d.rec?.served_from, ran(fx)], [1, 1, null, 3], d.out);
  assert.match(d.out, /is red \(exit 1\): never served, replayed \(red base => item before the G1/);
}));

test("oracle_modified_tree_is_replayed_on_its_content — same key, dirty tree: never served, the clone carries the untracked file; the record and owner.txt name the frozen dirty tree (M6, M7, X8, X9)", () => withFx((fx) => {
  // killer: scripts/oracle/run.mjs:104 LVR "rec.tree.object = gitS(clone, \"rev-parse\", \"HEAD^{tree}\")" -> "rec.tree.object = null"
  // killer: scripts/oracle/run.mjs:149 LVR "sha: dirty ? `${head}+${dirty}` : head" -> "sha: \"x\""
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
  assert.deepEqual(owner(b), ["G1", `${git(fx.repo, "rev-parse", "HEAD")}+${b.rec?.tree.dirty ?? ""}`, b.rec?.pid], "owner.txt: head+dirty of this take");
  git(fx.repo, "add", "-A");
  git(fx.repo, "commit", "-qm", "the dirty state, committed: its tree is the frozen one");
  assert.equal(b.rec?.tree.object, git(fx.repo, "rev-parse", "HEAD^{tree}"), "the record names the frozen dirty tree");
}));

test("oracle_refuses_an_incomplete_same_key_record — a record without pid, or whose tree object is absent or null => exit 2, neither served nor replayed (M8, C-G2-3)", () => withFx((fx) => {
  // killer: scripts/oracle/run.mjs:80 SDL ", /^[0-9a-f]{40,64}$/.test(r.tree?.object) ? [] : [\"tree.object\"]" -> ""
  const a = oracle(fx, ["--role", "G1", "--key", "k"]);
  assert.equal(a.status, 0, a.out);
  const body = readFileSync(a.file, "utf8"), forged = JSON.parse(body) as Record<string, unknown>;
  delete forged.pid;
  for (const [field, text] of [["pid", JSON.stringify(forged)], ["tree.object", body.replace(/,\s*"object": "\w+"/, "")], ["tree.object", body.replace(/"object": "\w+"/, "\"object\": null")]] as const) {
    writeFileSync(a.file, text);
    const b = oracle(fx, ["--role", "G1", "--key", "k"]);
    assert.equal(b.status, 2, b.out);
    assert.match(b.out, new RegExp(`incomplete record .*${field}`));
  }
  assert.equal(ran(fx), 1);
}));

test("oracle_record_not_written_is_a_refusal — a gate turns the record path into a directory (BRK) => exit 2, no oracle-result line, no record (C-G2-7)", () => withFx((fx) => {
  // killer: scripts/oracle/run.mjs:69 SDL "refuse(`record not written" -> "throw e; refuse(`record not written"
  writeFileSync(join(fx.repo, "BRK"), "x\n");
  const a = oracle(fx, ["--role", "G1", "--static-only"]);
  assert.deepEqual([a.status, a.file], [2, ""], a.out);
  assert.match(a.out, /refused: record not written/);
  assert.deepEqual(readdirSync(join(fx.root, "oracle-results")).filter((f) => f.endsWith(".json")), [], "no record");
}));

test("oracle_lock_fifo — a dead pid (queue and owner) is taken over; a live queued head is waited for (M9, M10)", () => withFx((fx) => {
  const dead = spawnSync(process.execPath, ["-e", "0"]).pid, first = (pid: number): string => `${"1".padStart(15, "0")}-${pid}.json`;
  const lock = join(fx.root, "oracle-lock"), queue = join(fx.root, "oracle-lock.queue");
  mkdirSync(lock, { recursive: true });
  mkdirSync(queue, { recursive: true });
  writeFileSync(join(lock, "owner.txt"), JSON.stringify({ pid: dead, role: "G1", sha: "x", date: "x", lock: "oracle/lock.mjs" }));
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

test("oracle_lock_never_takes_a_live_or_unknown_owner — owner.txt JSON of this module with a live pid, free text (older protocol), or JSON of another writer whose pid is dead to Node (MSYS `$$`): waited for, exit 75, owner.txt untouched, no locked gate (C-G2-2, X2, X3, C-C3-1)", () => withFx((fx) => {
  // killer: scripts/oracle/lock.mjs:33 COR "pid !== undefined && !alive(pid)" -> "pid !== undefined"
  // killer: scripts/oracle/lock.mjs:15 LVR "catch { return undefined; }" -> "catch { return 2147483646; }"
  // killer: scripts/oracle/lock.mjs:15 COR "lock === MARK && " -> ""
  const lock = join(fx.root, "oracle-lock"), dead = spawnSync(process.execPath, ["-e", "0"]).pid;
  for (const text of [JSON.stringify({ role: "G1", sha: "x", date: "x", lock: "oracle/lock.mjs", pid: process.pid }), "G1 M-4 2026-09-28T06:32:45Z", JSON.stringify({ role: "cp-2 M-1", sha: "x", date: "x", pid: dead })]) {
    mkdirSync(lock, { recursive: true });
    writeFileSync(join(lock, "owner.txt"), text);
    const a = oracle(fx, ["--role", "G1"], { ORACLE_LOCK_MAX_MS: "1500" });
    assert.equal(a.status, 75, a.out);
    assert.deepEqual([readFileSync(join(lock, "owner.txt"), "utf8"), ran(fx)], [text, 0], "owner.txt untouched, no locked gate");
    rmSync(lock, { recursive: true });
  }
}));

test("oracle_r25_over_the_ci_bound_is_red — insertions + deletions against VIBEGATES_PR_LIMIT 5, equality green (-gt): 3 + 2 = 5 green, 3 + 3 = 6 red, 15 + 3 red (3 committed + 2 tracked-dirty + 10 untracked); same R25_DIFF_RE as test 38 (M11, M13, X6, X7)", () => withFx((fx) => {
  // killer: scripts/oracle/r25.mjs:23 SDL "changed: ins + del," -> "changed: ins,"
  // killer: scripts/oracle/r25.mjs:25 ROR "c.changed > c.limit" -> "c.changed >= c.limit"
  for (const [text, del, exit] of [["a\n", 2, 0], ["", 3, 1]] as const) {
    writeFileSync(join(fx.repo, "base.txt"), text);
    const r = oracle(fx, ["--role", "G1", "--static-only"]);
    assert.deepEqual([r.rec?.r25?.map((c) => [c.insertions, c.deletions, c.changed]), r.rec?.gates.find((g) => g.name === "r25")?.exit], [[[3, del, 3 + del]], exit], r.out);
  }
  appendFileSync(join(fx.repo, "lot.txt"), "4\n5\n");
  writeFileSync(join(fx.repo, "big.txt"), "x\n".repeat(10));
  const a = oracle(fx, ["--role", "G1", "--static-only"]);
  assert.equal(a.status, 1, a.out);
  assert.deepEqual(a.rec?.r25?.map((c) => [c.name, c.insertions, c.deletions, c.changed, c.limit]), [["STAT", 15, 3, 18, 5]]);
  assert.equal(a.rec?.gates.find((g) => g.name === "r25")?.exit, 1);
  assert.equal(ran(fx), 0, "--static-only runs no locked gate");
  const re = (f: string): string | undefined => /const R25_DIFF_RE = (\/.+\/);/.exec(readFileSync(join(ROOT, f), "utf8"))?.[1];
  assert.equal(re("scripts/oracle/r25.mjs"), re("test/ci-gates.test.ts"), "R25_DIFF_RE drifted from test 38");
}));

test("oracle_cv4_refuses_the_suite — free memory or node.exe out of bounds => exit 3, no suite, lock released; defaults 4096 MB free and 40 node.exe (M12, X13)", () => withFx((fx) => {
  // killer: scripts/oracle/run.mjs:156 LVR "ORACLE_MIN_FREE_MB ?? 4096" -> "ORACLE_MIN_FREE_MB ?? 0"
  // killer: scripts/oracle/run.mjs:156 LVR "ORACLE_MAX_NODE ?? 40" -> "ORACLE_MAX_NODE ?? 48"
  for (const env of [{ ORACLE_MIN_FREE_MB: "1000000000" }, { ORACLE_MAX_NODE: "0" }]) {
    const a = oracle(fx, ["--role", "G1"], env);
    assert.equal(a.status, 3, a.out);
    assert.ok((a.rec?.cv4?.node_exe ?? 0) >= 1, "at least this oracle's own node process is counted");
    assert.equal(existsSync(join(fx.root, "oracle-lock")), false);
  }
  assert.equal(ran(fx), 0, "npm test never launched");
  const d = oracle(fx, ["--role", "G1"], { ORACLE_MIN_FREE_MB: undefined, ORACLE_MAX_NODE: undefined }), c = d.rec?.cv4;
  assert.deepEqual([c?.min_free_mb, c?.max_node], [4096, 40], "C-V-4 defaults (decision Q-M3-8)");
  assert.equal(d.status === 3, (c?.free_mb ?? 0) < 4096 || (c?.node_exe ?? 0) > 40, d.out);
}));
