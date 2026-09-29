/**
 * Root test of scripts/mutants/run.mjs, the mutant campaign tool (ADR-METHODE-2 D6, lot M-6), on a fixture repository built under TEMP (git isolated: GIT_*
 * out, no system config, a global core.autocrlf=true that the tool's clone overrides): package.json whose test script quotes "test/*.test.ts"; a base commit
 * (package.json only); a gel commit (lib/m.mjs; lib/mid.mjs importing it; lib/lone.mjs imported by no test; test/a.test.ts importing m.mjs under a killer
 * line; test/c.test.ts importing mid.mjs only; test/r.test.ts red; lib/w.mjs and test/w.test.ts, which rewrites it); then lib/m.mjs modified and test/b.test.ts
 * untracked, both left uncommitted. Every run of the tool takes a fresh --out, its own --lock-root, --min-free-mb 4096 (the floor, C-V-9) and FX_TOKEN, a
 * DENY name that test/a.test.ts asserts absent: the host lock never decides a verdict here, except where a test sets it. graph/ (never run) holds the import
 * forms and extensions of targetsOf. The line above each test is the mutation that reddens it (killer convention of scripts/red-proof.mjs). Governance-only.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { targetsOf, type MutantRow, type MutantsRecord } from "../scripts/mutants/run.mjs";

const CLI = join(import.meta.dirname, "..", "scripts", "mutants", "run.mjs");
const sha = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
const HEAD = 'import { test } from "node:test";\nimport assert from "node:assert/strict";\n';
const M = "export function pos(x) { return x > 0; }\nexport function sign(x) {\n  if (x < -100) return -2;\n  return x < 0 ? -1 : 1;\n}\n";
interface Row { id: string; file?: string; line: number; op: string; before: string; after: string; why: string }
const BARE: Row = { id: "T1", line: 1, op: "ROR", before: "x > 0", after: "x < 0", why: "pos inverted" }, T1: Row = { ...BARE, file: "lib/m.mjs" };
const A1: Row = { id: "A1", file: "lib/m.mjs", line: 2, op: "CONST", before: "x > 0", after: "x", why: "absent from its line" };
const ROWS: Row[] = [T1, { id: "S1", file: "lib/m.mjs", line: 3, op: "CONST", before: "-100", after: "-200", why: "an untested branch" },
  { id: "N1", file: "lib/m.mjs", line: 1, op: "CONST", before: "return x > 0;", after: "return process.exit(134);", why: "the child dies" },
  A1, { id: "A2", file: "lib/m.mjs", line: 4, op: "CONST", before: "1", after: "2", why: "twice on its line" },
  { id: "X1", file: "lib/m.mjs", line: 4, op: "CONST", before: ": 1;", after: ": ;", why: "a syntax error" }];

const GIT_ENV: Record<string, string | undefined> = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_"))), GIT_CONFIG_NOSYSTEM: "1", NODE_TEST_CONTEXT: undefined };
function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", ["-c", "user.name=fixture", "-c", "user.email=fixture@localhost", "-c", "core.autocrlf=false", ...args], { cwd, encoding: "utf8", env: GIT_ENV });
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
  const root = mkdtempSync(join(tmpdir(), "mutants-fx-")), dir = join(root, "repo"), config = join(root, "gitconfig");
  writeFileSync(config, "[core]\nautocrlf = true\n");
  GIT_ENV.GIT_CONFIG_GLOBAL = config;
  write(dir, { "package.json": `${JSON.stringify({ name: "fx", private: true, type: "module", scripts: { test: 'node --test "test/*.test.ts"' } })}\n` });
  git(dir, "init", "-q", "-b", "main"); git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", "base");
  const base = git(dir, "rev-parse", "HEAD");
  write(dir, { "lib/m.mjs": M.replace("-100", "-50"), "lib/mid.mjs": 'import { pos } from "./m.mjs";\nexport const posTwice = (x) => pos(x) && pos(x - 1);\n', "lib/lone.mjs": "export const ONE = 1;\n", "lib/old.mjs": "export const OLD = 0;\n",
    "test/a.test.ts": `${HEAD}import { pos, sign } from "../lib/m.mjs";\n// killer: lib/m.mjs:1 ROR "x > 0" -> "x >= 0"\ntest("pos_zero", () => { assert.equal(pos(0), false); assert.equal(pos(2), true); });\ntest("sign_small", () => { assert.equal(sign(-3), -1); assert.equal(sign(3), 1); assert.equal(process.env.FX_TOKEN, undefined); });\n`,
    "test/c.test.ts": `${HEAD}import { posTwice } from "../lib/mid.mjs";\ntest("twice", () => { assert.equal(posTwice(3), true); });\n`, "test/r.test.ts": `${HEAD}test("red", () => { assert.equal(1, 2); });\n`,
    "lib/w.mjs": "export const W = 1;\n", "test/w.test.ts": `${HEAD}import { appendFileSync } from "node:fs";\nimport "../lib/w.mjs";\ntest("w", () => { appendFileSync(new URL("../lib/w.mjs", import.meta.url), "// w\\n"); });\n` });
  git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", "gel");
  write(dir, { "lib/m.mjs": M, "test/b.test.ts": `${HEAD}test("alone", () => { assert.equal(1 + 1, 2); });\n` }); // uncommitted: the tool copies both into its clone
  rmSync(join(dir, "lib", "old.mjs")); // an uncommitted deletion: the tool removes it from its clone
  fx = { root, dir, base, gel: git(dir, "rev-parse", "HEAD") };
  return fx;
}
after(() => { if (fx !== undefined) rmSync(fx.root, { recursive: true, force: true, maxRetries: 5 }); });

function table(name: string, rows: Row[]): string {
  const p = join(fixture().root, name);
  writeFileSync(p, name.endsWith(".json") ? JSON.stringify(rows) : `export const MUTANTS = ${JSON.stringify(rows)};\n`);
  return p;
}
interface Run { status: number | null; stdout: string; stderr: string; out: string; rec: MutantsRecord | null }
let n = 0, main: Run | undefined;
function run(args: string[], o: { out?: string; lock?: string; floor?: boolean } = {}): Run {
  const f = fixture(), out = o.out ?? join(f.root, `out-${++n}`), rec = join(out, "RESULTS.json"), floor = o.floor === false ? [] : ["--min-free-mb", "4096"];
  const r = spawnSync(process.execPath, [CLI, "--repo", f.dir, "--out", out, "--lock-root", o.lock ?? join(f.root, "no-lock"), ...floor, "--timeout-ms", "60000", ...args],
    { encoding: "utf8", env: { ...GIT_ENV, FX_TOKEN: "x" }, timeout: 600_000 });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, out, rec: existsSync(rec) ? (JSON.parse(readFileSync(rec, "utf8")) as MutantsRecord) : null };
}
const campaign = (): Run => (main ??= run(["--base", fixture().base, "--table", table("table.mjs", ROWS), "--killers"])); // the one shared campaign
const row = (r: Run, id: string): MutantRow | undefined => r.rec?.results.find((x) => x.id === id);

// killer: scripts/mutants/run.mjs:177 CONST "classify(e) === \"assert-fail\"" -> "classify(e) !== \"pass\""
test("mutants_kill_is_an_assertion_failure_of_a_top_level_test", () => {
  const r = campaign(), t1 = row(r, "T1");
  assert.equal(r.status, 1, r.stderr);
  assert.deepEqual([t1?.status, t1?.strict, t1?.fails, t1?.oks, t1?.exit], ["tue", true, ["pos_zero"], 1, 1]);
  assert.deepEqual(["N1", "X1"].map((id) => row(r, id)?.status), ["non conclu", "non conclu"]);
});

// killer: scripts/mutants/run.mjs:177 CONST "\"assert-fail\"" -> "\"inconclusive\""
test("mutants_dead_child_is_non_conclu_never_killed", () => {
  const r = campaign(), n1 = row(r, "N1"), tap = join(r.out, "tap", "N1.tap");
  assert.deepEqual([n1?.status, n1?.strict, n1?.fails.length, n1?.oks, existsSync(tap)], ["non conclu", false, 1, 0, true]);
  assert.match(readFileSync(tap, "utf8"), /exitCode: 134/);
});

// killer: scripts/mutants/run.mjs:205 CONST "writeFileSync(p, orig)" -> "void orig"
test("mutants_restore_each_mutated_file_to_the_byte", () => {
  const r = campaign(), s = sha(M), ran = r.rec?.results.filter((x) => x.sha_before !== null) ?? [], p = join(r.out, "clone", "lib", "m.mjs");
  assert.deepEqual(ran.map((x) => [x.id, x.sha_before, x.sha_after]), ["T1", "S1", "N1", "X1", "K1"].map((id) => [id, s, s]));
  assert.deepEqual([r.rec?.sha0, existsSync(p) ? sha(readFileSync(p)) : null, row(r, "X1")?.status], [{ "lib/m.mjs": s }, s, "non conclu"]);
  assert.deepEqual(["lib/old.mjs", "test/b.test.ts"].map((q) => existsSync(join(r.out, "clone", q))), [false, true]); // the tree's deletion and untracked file
});

// killer: scripts/mutants/run.mjs:90 ROR "l.split(m.before).length !== 2" -> "l.split(m.before).length < 2"
test("mutants_anchor_absent_or_twice_on_its_line_is_lost_counted_never_applied", () => {
  const r = campaign();
  assert.deepEqual(["A1", "A2"].map((id) => [row(r, id)?.status, row(r, id)?.sha_before, existsSync(join(r.out, "tap", `${id}.tap`))]), [["anchor-lost", null, false], ["anchor-lost", null, false]]);
  assert.equal(r.rec?.counts["anchor-lost"], 2);
  const d = run(["--base", fixture().base, "--table", table("lost.json", [A1])], { floor: false }); // no runnable mutant: no memory read, the default floor recorded
  assert.deepEqual([d.status, row(d, "A1")?.status, d.rec?.baseline, d.rec?.min_free_mb], [1, "anchor-lost", null, 4096], d.stderr);
});

// killer: scripts/mutants/run.mjs:114 CONST "lock !== null" -> "false"
test("mutants_refuse_under_a_live_oracle_lock_before_any_clone", () => {
  const f = fixture(), t = table("one.json", [T1]), dead = spawnSync(process.execPath, ["-e", "0"]).pid, mark = (pid: number): string => JSON.stringify({ lock: "oracle/lock.mjs", pid });
  const owners: [string | null, number][] = [[mark(process.pid), 2], ["a legacy free-text owner", 2], [JSON.stringify({ lock: "sh", pid: dead }), 2], [JSON.stringify({ pid: dead }), 2], [null, 2], [mark(dead), 0]];
  for (const [owner, code] of owners) { // held() of oracle/lock.mjs: only its own tag with a dead pid is free; the lock is never taken over (owner.txt unchanged)
    const lock = mkdtempSync(join(f.root, "lock-")), o = join(lock, "oracle-lock", "owner.txt");
    if (owner === null) mkdirSync(dirname(o), { recursive: true }); else write(lock, { "oracle-lock/owner.txt": owner });
    const r = run(["--base", f.base, "--table", t], { lock });
    assert.deepEqual([owner, r.status, existsSync(join(r.out, "clone")), /is held by/.test(r.stderr), owner === null || readFileSync(o, "utf8") === owner], [owner, code, code === 0, code === 2, true], r.stderr);
  }
});

// killer: scripts/mutants/run.mjs:168 CONST "< o.minFree" -> "< 0"
test("mutants_short_memory_runs_nothing", () => {
  const r = run(["--base", fixture().base, "--table", table("one.json", [T1]), "--min-free-mb", "999999999"]), taps = join(r.out, "tap");
  assert.deepEqual([r.status, row(r, "T1")?.status, r.rec?.baseline?.status, r.rec?.min_free_mb], [1, "non conclu (memoire)", "non conclu (memoire)", 999999999], r.stderr);
  assert.deepEqual(existsSync(taps) ? readdirSync(taps) : null, []);
});

// killer: scripts/mutants/run.mjs:68 CONST "stack.push(...deps(f))" -> "void deps(f)"
test("mutants_targets_follow_the_transitive_import_closure", () => {
  const f = fixture(), g = ["test/*.test.ts"];
  assert.deepEqual(targetsOf(f.dir, "lib/m.mjs", g), { direct: ["test/a.test.ts"], transitive: ["test/c.test.ts"] });
  assert.deepEqual([targetsOf(f.dir, "lib/mid.mjs", g), targetsOf(f.dir, "lib/lone.mjs", g)], [{ direct: ["test/c.test.ts"], transitive: [] }, { direct: [], transitive: [] }]);
  assert.deepEqual(row(campaign(), "T1")?.targets, ["test/a.test.ts", "test/c.test.ts"]);
});

// killer: scripts/mutants/run.mjs:64 CONST "m[1] ?? m[2]" -> "m[1]"
test("mutants_targets_follow_export_from_literal_import_calls_tsx_cts_mts_cjs", () => {
  const g = join(fixture().root, "graph"), imp = (p: string): string => `import "../lib/${p}";\n`, t = (file: string): unknown => targetsOf(g, file, ["test/*.test.ts"]);
  write(g, { "lib/goal.mjs": "export const a = 1;\n", "lib/star.mts": 'export * from "./goal.mjs";\n', "lib/named.cts": "export {\n  a as b,\n} from './goal.mjs';\n", "lib/v.tsx": 'import { a } from "./goal";\n',
    "lib/w.cjs": "module.exports = 1;\n", "test/star.test.ts": imp("star.mts"), "test/named.test.ts": imp("named.cts"), "test/tsx.test.ts": imp("v"), "test/cjs.test.ts": imp("w.cjs"),
    "test/dyn.test.ts": 'await import(\n  "../lib/goal.mjs");\n', "test/computed.test.ts": 'const s = "";\nawait import(s);\nawait import("../lib/goal.mjs" + s);\n' }); // computed: skipped, never a target
  assert.deepEqual([t("lib/goal.mjs"), t("lib/w.cjs")], [{ direct: ["test/dyn.test.ts"], transitive: ["test/named.test.ts", "test/star.test.ts", "test/tsx.test.ts"] }, { direct: ["test/cjs.test.ts"], transitive: [] }]);
});

// killer: scripts/mutants/run.mjs:115 CONST "existsSync(clone)" -> "false"
test("mutants_second_launch_on_one_out_is_refused", () => {
  const args = ["--base", fixture().gel, "--table", table("nofile.json", [BARE])], one = run(args), rec = join(one.out, "RESULTS.json");
  assert.deepEqual([one.status, row(one, "T1")?.file, row(one, "T1")?.status, existsSync(rec)], [0, "lib/m.mjs", "tue", true], one.stderr); // the one code file of gel..tree
  const before = sha(readFileSync(rec)), two = run(args, { out: one.out });
  assert.deepEqual([two.status, /one launch per clone/.test(two.stderr), sha(readFileSync(rec))], [2, true, before], two.stderr);
});

// killer: scripts/mutants/run.mjs:127 CONST "r.file ?? o.file ?? code[0]" -> "r.file ?? code[0]"
test("mutants_row_without_file_takes_file_else_ambiguous_file_exit_2", () => {
  const f = fixture(), t = table("nofile.json", [BARE]), amb = run(["--base", f.base, "--table", t]), named = run(["--base", f.base, "--table", t, "--file", "lib/m.mjs"]);
  assert.deepEqual([amb.status, /ambiguous file/.test(amb.stderr), existsSync(join(amb.out, "clone"))], [2, true, false], amb.stderr); // base..tree: four code files
  assert.deepEqual([named.status, row(named, "T1")?.file, row(named, "T1")?.status], [0, "lib/m.mjs", "tue"], named.stderr);
});

// killer: scripts/mutants/run.mjs:204 CONST "first.status === \"survit\"" -> "false"
test("mutants_survivor_is_replayed_on_every_target_file_whole", () => {
  const r = campaign(), s1 = row(r, "S1");
  assert.deepEqual([s1?.status, s1?.oks, s1?.replay?.files, s1?.replay?.status, s1?.replay?.oks], ["survit", 2, ["test/a.test.ts", "test/c.test.ts"], "survit", 3]);
  assert.ok(existsSync(join(r.out, "tap", "S1.replay.tap")));
});

// killer: scripts/mutants/run.mjs:216 CONST "r.status === \"tue\"" -> "r.status !== \"anchor-lost\""
test("mutants_one_survivor_exits_1_with_its_record_written", () => {
  const r = run(["--base", fixture().base, "--table", table("ts.json", ROWS.slice(0, 2))]);
  assert.deepEqual([r.status, r.rec?.exit, r.rec?.counts, r.rec?.results.map((x) => [x.id, x.status])], [1, 1, { tue: 1, survit: 1 }, [["T1", "tue"], ["S1", "survit"]]], r.stderr);
});

// killer: scripts/mutants/run.mjs:198 CONST "row.sha_before !== sha0[m.file]" -> "false"
test("mutants_a_file_changed_since_the_start_stops_the_campaign_exit_3", () => {
  const r = run(["--base", fixture().base, "--table", table("w.json", [{ id: "W1", file: "lib/w.mjs", line: 1, op: "CONST", before: "1", after: "2", why: "its test rewrites it" }])]);
  assert.deepEqual([r.status, r.rec?.exit, row(r, "W1")?.status, row(r, "W1")?.note], [3, 3, "non conclu", "the file is not in its initial state"], r.stderr);
});

// killer: scripts/mutants/run.mjs:201 CONST "b.status !== \"vert\"" -> "false"
test("mutants_without_target_are_refused_and_a_red_baseline_runs_no_mutant", () => {
  const f = fixture(), t = table("lone.json", [{ id: "L1", file: "lib/lone.mjs", line: 1, op: "CONST", before: "1", after: "2", why: "no importer" }]);
  const none = run(["--base", f.base, "--table", t]), red = run(["--base", f.base, "--table", t, "--targets", "test/r.test.ts"]);
  assert.deepEqual([none.status, existsSync(join(none.out, "clone")), /no target/.test(none.stderr)], [2, false, true], none.stderr);
  assert.deepEqual([red.status, red.rec?.baseline?.status, row(red, "L1")?.status, row(red, "L1")?.targets], [1, "rouge", "non conclu (base)", ["test/r.test.ts"]], red.stderr);
});

// killer: scripts/mutants/run.mjs:134 CONST "test: d ? str(d[1]) : undefined" -> "test: undefined"
test("mutants_killer_lines_become_intent_mutants_run_alone", () => {
  const k1 = row(campaign(), "K1");
  assert.deepEqual([k1?.origin, k1?.file, k1?.line, k1?.op, k1?.why, k1?.test, k1?.status, k1?.fails, k1?.oks], ["killer", "lib/m.mjs", 1, "ROR", "killer of pos_zero", "pos_zero", "tue", ["pos_zero"], 0]);
});

// killer: scripts/mutants/run.mjs:223 CONST "sha256: sha(body)" -> "sha256: sha(`${body} `)"
test("mutants_record_is_complete_and_its_sha_printed_last", () => {
  const r = campaign(), f = fixture(), last = r.stdout.trim().split("\n").at(-1) ?? "", p = join(r.out, "RESULTS.json");
  assert.match(last, /^mutants-result \{/);
  const printed = JSON.parse(last.slice("mutants-result ".length)) as { exit: number; sha256: string };
  assert.deepEqual([printed.exit, printed.sha256], [1, existsSync(p) ? sha(readFileSync(p)) : null]);
  assert.deepEqual(Object.keys(r.rec ?? {}), ["schema", "repo", "base", "gel", "dirty", "tool_sha256", "tool_tree", "table", "killers", "only", "test_globs", "clone", "timeout_ms",
    "min_free_mb", "lock_root", "start", "end", "sha0", "baseline", "results", "counts", "exit"]);
  assert.deepEqual([r.rec?.schema, r.rec?.base, r.rec?.gel, r.rec?.tool_sha256, r.rec?.tool_tree, r.rec?.test_globs, r.rec?.results.length],
    ["monark.mutants.v1", f.base, f.gel, sha(readFileSync(CLI)), git(join(import.meta.dirname, ".."), "rev-parse", "HEAD"), ["test/*.test.ts"], 7]); // tool_tree: HEAD of the tool's repository (Q-V-4)
  assert.match(r.rec?.dirty ?? "", /^[0-9a-f]{64}$/);
});

// killer: scripts/mutants/run.mjs:32 CONST "import { held } from \"../oracle/lock.mjs\";" -> "const held = (root) => (existsSync(join(root, \"oracle-lock\")) ? \"oracle/lock.mjs\" : null);"
test("mutants_tool_imports_held_deny_and_child_env_never_recopies_them", () => {
  const src = readFileSync(CLI, "utf8"), from = (names: string, mod: string): boolean => src.includes(`import { ${names} } from "../${mod}";`);
  assert.deepEqual([from("held", "oracle/lock.mjs"), from("classify, DENY, parseKiller, parseTap", "red-proof.mjs"), from("childEnv", "oracle/run.mjs"), src.includes('"oracle/lock.mjs"'), src.includes("API_KEY")],
    [true, true, true, false, false]); // the owner.txt tag of oracle/lock.mjs and the DENY list of red-proof.mjs are never recopied (Q-V-1, Q-V-3)
});

// killer: scripts/mutants/run.mjs:84 CONST "o.minFree >= 4096" -> "o.minFree >= 1024"
test("mutants_usage_repo_and_bound_refusals_exit_2", () => {
  const f = fixture(), t = table("one.json", [T1]), b = ["--base", f.base];
  const codes = [[...b], [...b, "--table", t, "--min-free-mb", "1024"], [...b, "--table", t, "--only", "Z9"], [...b, "--table", t, "--repo", f.root], [...b, "--table", t, "--only", "--killers"],
    [...b, "--table", t, "--out", join(f.dir, "inside")], [...b, "--table", table("nofile.json", [BARE])]].map((a) => run(a).status); // base..tree: four code files
  assert.deepEqual([codes, existsSync(join(fixture().dir, "inside"))], [[2, 2, 2, 2, 2, 2, 2], false]);
});
