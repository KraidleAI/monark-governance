/**
 * Root test of scripts/mutants/run.mjs, the mutant campaign tool (ADR-METHODE-2 D6, lot M-6), on a fixture repository built under TEMP (git isolated: GIT_*
 * out, no system config, a global core.autocrlf=true that the tool's clone overrides): package.json whose test script quotes "test/*.test.ts"; a base commit
 * (package.json only); a gel commit (lib/m.mjs; lib/mid.mjs importing it; lib/lone.mjs imported by no test; test/a.test.ts importing m.mjs under a killer
 * line; test/c.test.ts importing mid.mjs only; test/r.test.ts red; lib/w.mjs and test/w.test.ts, which rewrites it); then lib/m.mjs modified and test/b.test.ts
 * untracked, both left uncommitted. Every run of the tool takes a fresh --out, its own --lock-root, --min-free-mb 4096 (the floor, C-V-9) and FX_TOKEN, a
 * DENY name that test/a.test.ts asserts absent: the host lock never decides a verdict here, except where a test sets it. graph/ (never run) holds the import
 * forms and extensions of targetsOf. The line above each test is the mutation that reddens it (killer convention of scripts/red-proof.mjs). Governance-only.
 * The shared campaign adds --targets test/b.test.ts,test/a.test.ts (Q-G2-3); repo-link/, scripts-junction/ (junctions) and tool-copy/ serve C-G2-1..3, Q-G2-5.
 * ws/ (workspaces @monark/fx, @monark/ax, a third-party module, npm's links in node_modules) and wt/, its linked worktree: MUTANTS-NM-WORKSPACES-1.
 * Lot MUTANTS-TOOL-2 (D-1 to D-5): mini() builds a repository of its own under the fixture root (base: package.json and .gitignore; gel: its files):
 * ty/ (a typecheck gate, this repository's TypeScript and Node types linked in) and lk/ (its test logs the host lock's owner at each run).
 * Corrections of the lot (after its G2): the G2's measured killers of its 28 survivors (each test names its mutants, G02 to G39 of the G2 table),
 * fk/ (a fake TypeScript that hangs, exits 1 without a diagnostic line or reports an error: D-2, D-3), the memory read again under the lock (D-4),
 * to/ (a time overrun, never replayed: D-5) and a held host lock waited for in its queue, never refused at launch (D-6).
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { targetsOf, type Edit, type MutantRow, type MutantsRecord } from "../scripts/mutants/run.mjs";

const CLI = join(import.meta.dirname, "..", "scripts", "mutants", "run.mjs");
const sha = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
const HEAD = 'import { test } from "node:test";\nimport assert from "node:assert/strict";\n';
const M = "export function pos(x) { return x > 0; }\nexport function sign(x) {\n  if (x < -100) return -2;\n  return x < 0 ? -1 : 1;\n}\n";
interface Row { id: string; file?: string; line: number; op: string; before: string; after: string; why: string; typecheck?: boolean }
interface Block { id: string; file: string; op: string; edits: Edit[]; why: string } // D-1: a row of edits in place of line, before, after
const BARE: Row = { id: "T1", line: 1, op: "ROR", before: "x > 0", after: "x < 0", why: "pos inverted" }, T1: Row = { ...BARE, file: "lib/m.mjs" };
const A1: Row = { id: "A1", file: "lib/m.mjs", line: 2, op: "CONST", before: "x > 0", after: "x", why: "absent from its line" };
const ROWS: Row[] = [T1, { id: "S1", file: "lib/m.mjs", line: 3, op: "CONST", before: "-100", after: "-200", why: "an untested branch" },
  { id: "N1", file: "lib/m.mjs", line: 1, op: "CONST", before: "return x > 0;", after: "return process.exit(134);", why: "the child dies" },
  A1, { id: "A2", file: "lib/m.mjs", line: 4, op: "CONST", before: "1", after: "2", why: "twice on its line" },
  { id: "X1", file: "lib/m.mjs", line: 4, op: "CONST", before: ": 1;", after: ": ;", why: "a syntax error" }];
const E1: Edit = { line: 2, before: "sign(x) {", after: "sign(x) { if (x === 3) {" }, E2: Edit = { line: 4, before: "return x < 0", after: "return 7; } return x < 0" };

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
const pending: Promise<unknown>[] = []; // the runs started ahead (lot MUTANTS-RUN-TEST-DURATION-1): settled before the fixture root goes
after(async () => { await Promise.all(pending); if (fx !== undefined) rmSync(fx.root, { recursive: true, force: true, maxRetries: 5 }); });
function mini(name: string, files: Record<string, string>): { dir: string; base: string } { // a repository of its own: base (package.json, .gitignore), then gel (files)
  const dir = join(fixture().root, name);
  write(dir, { ".gitignore": "node_modules/\n", "package.json": `${JSON.stringify({ name, private: true, type: "module", scripts: { test: 'node --test "test/*.test.ts"' } })}\n` });
  git(dir, "init", "-q", "-b", "main"); git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", "base");
  const base = git(dir, "rev-parse", "HEAD");
  write(dir, files); git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", "gel");
  return { dir, base };
}

function table(name: string, rows: object[]): string {
  const p = join(fixture().root, name);
  writeFileSync(p, name.endsWith(".json") ? JSON.stringify(rows) : `export const MUTANTS = ${JSON.stringify(rows)};\n`);
  return p;
}
interface Run { status: number | null; stdout: string; stderr: string; out: string; rec: MutantsRecord | null; pid: number }
let n = 0, main: Run | undefined;
type RunOpts = { out?: string; lock?: string; floor?: boolean; cli?: string; node?: string[]; env?: Record<string, string> };
function cmd(args: string[], o: RunOpts): { argv: string[]; env: NodeJS.ProcessEnv; out: string } {
  const f = fixture(), out = o.out ?? join(f.root, `out-${++n}`), floor = o.floor === false ? [] : ["--min-free-mb", "4096"], lock = o.lock ?? join(f.root, "no-lock");
  return { argv: [...(o.node ?? []), o.cli ?? CLI, "--repo", f.dir, "--out", out, "--lock-root", lock, ...floor, "--timeout-ms", "60000", ...args], env: { ...GIT_ENV, FX_TOKEN: "x", ...o.env }, out };
}
const done = (r: { status: number | null; stdout: string; stderr: string; pid: number | undefined }, out: string, rec = join(out, "RESULTS.json")): Run =>
  ({ status: r.status, stdout: r.stdout, stderr: r.stderr, out, rec: existsSync(rec) ? (JSON.parse(readFileSync(rec, "utf8")) as MutantsRecord) : null, pid: r.pid ?? 0 });
function run(args: string[], o: RunOpts = {}): Run {
  const { argv, env, out } = cmd(args, o);
  return done(spawnSync(process.execPath, argv, { encoding: "utf8", env, timeout: 600_000 }), out);
}
async function runAsync(args: string[], o: RunOpts = {}): Promise<Run> { // the event loop stays free: a child of this test that exits is reaped, never a zombie (MUTANTS-WAITER-ZOMBIE-1)
  const { argv, env, out } = cmd(args, o), c = spawn(process.execPath, argv, { env, timeout: 600_000 }), r = { status: null as number | null, stdout: "", stderr: "", pid: c.pid };
  c.stdout.setEncoding("utf8").on("data", (d: string) => { r.stdout += d; }); c.stderr.setEncoding("utf8").on("data", (d: string) => { r.stderr += d; });
  r.status = await new Promise<number | null>((ok) => c.on("close", ok));
  return done(r, out);
}
// Lot MUTANTS-RUN-TEST-DURATION-1: the runs that mostly wait (a held lock, a live waiter, a hung child) start side by side as the file loads, each on a
// lock root of its own, and their tests await them in place; under --test-name-pattern (red-proof, a mutant campaign) each starts in its own test only.
const SELECTED = process.execArgv.some((a) => a.startsWith("--test-name-pattern"));
function ahead<T>(start: () => Promise<T>): () => Promise<T> {
  let p: Promise<T> | undefined;
  const get = (): Promise<T> => { if (p === undefined) { p = Promise.resolve().then(start); pending.push(p.catch(() => undefined)); } return p; };
  if (!SELECTED) void get();
  return get;
}
const ownLock = (): string => mkdtempSync(join(fixture().root, "lock-"));
const campaign = (): Run => (main ??= run(["--base", fixture().base, "--table", table("table.mjs", ROWS), "--killers", // the one shared campaign; --targets
  "--targets", "test/b.test.ts,test/a.test.ts"])); // adds b, imported by no test, to the graph's targets; a is one already: no duplicate (Q-G2-3)
const row = (r: Run, id: string): MutantRow | undefined => r.rec?.results.find((x) => x.id === id);
const pkgDir = (p: string): string => dirname(createRequire(import.meta.url).resolve(`${p}/package.json`)); // this repository's TypeScript and Node types
function linkTs(dir: string, node = true): void { // linked in as npm would install them; junctions, which rmSync unlinks and never follows (G2 probe-rm)
  mkdirSync(join(dir, "node_modules", "@types"), { recursive: true });
  symlinkSync(pkgDir("typescript"), join(dir, "node_modules", "typescript"), "junction");
  if (node) symlinkSync(pkgDir("@types/node"), join(dir, "node_modules", "@types", "node"), "junction");
}
const TS = { target: "esnext", module: "nodenext", strict: true, noEmit: true, skipLibCheck: true, types: ["node"] };
function ty(name: string, ts: object = TS, extra: Record<string, string> = {}): { dir: string; base: string } { // a typecheck gate (D-2)
  const f = mini(name, { "tsconfig.json": `${JSON.stringify({ compilerOptions: ts, include: ["test/**/*.ts"] })}\n`, "lib/f.mjs": "export const twice = (x) => x * 2;\n",
    "lib/f.d.mts": "export declare function twice(x: number): number;\n", "test/f.test.ts": `${HEAD}import { twice } from "../lib/f.mjs";\nconst n: number = twice(2);\ntest("twice", () => { assert.equal(n, 4); });\n`, ...extra });
  linkTs(f.dir);
  return f;
}
const Y = (id: string, before: string, after: string, why = "w"): Row => ({ id, file: "lib/f.d.mts", line: 1, op: "CONST", before, after, why, typecheck: true });
const LK = { "lib/l.mjs": "export const L = 1;\nexport const M = 3;\n", "test/l.test.ts": `${HEAD}import { appendFileSync, readFileSync, writeFileSync } from "node:fs";\nimport { L, M } from "../lib/l.mjs";\n` +
  'test("l", () => { const lk = String(process.env.FX_LOCK), o = readFileSync(lk + "/oracle-lock/owner.txt", "utf8"), w = JSON.parse(o);\n' + // the owner at each run
  '  if (process.env.FX_STOP === "1" && w.mutant === "L1") writeFileSync(lk + "/oracle-lock.queue/000000000000002-" + String(w.pid) + ".json", "{}");\n' + // FX_STOP: an entry
  '  appendFileSync(String(process.env.FX_LOG), o + "\\n"); assert.deepEqual([L, M], [1, 3]); });\n' }; // of the tool's live pid queued ahead, at L1
const L = (id: string, line: number, before: string, after: string): Row => ({ id, file: "lib/l.mjs", line, op: "CONST", before, after, why: "w" });
const FAKE = 'const t = require("fs").readFileSync("lib/f.d.mts", "utf8");\nif (t.includes("HANG")) setInterval(() => {}, 1000);\nelse if (t.includes("CRASH")) throw new Error("crash");\n' +
  'else if (process.env.FK_RED === "1") { console.log("test/f.test.ts(1,1): error TS9999: red"); process.exitCode = 2; }\n'; // hangs, exits 1 without a diagnostic line, or reports
let LKR: { dir: string; base: string } | undefined, TYR: { dir: string; base: string } | undefined, FKR: { dir: string; base: string } | undefined;
const lk = (): { dir: string; base: string } => (LKR ??= mini("lk", LK)), tyr = (): { dir: string; base: string } => (TYR ??= ty("ty"));
function fk(): { dir: string; base: string } { // fk/: a typecheck gate under the FAKE TypeScript (node_modules/ is ignored by git)
  if (FKR !== undefined) return FKR;
  FKR = mini("fk", { "tsconfig.json": "{}\n", "lib/f.mjs": "export const twice = (x) => x * 2;\n", "lib/f.d.mts": "export declare function twice(x: number): number;\n",
    "test/f.test.ts": `${HEAD}import { twice } from "../lib/f.mjs";\ntest("twice", () => { assert.equal(twice(2), 4); });\n` });
  write(FKR.dir, { "node_modules/typescript/package.json": '{ "name": "typescript" }\n', "node_modules/typescript/lib/tsc.js": FAKE });
  return FKR;
}

// killer: scripts/mutants/run.mjs:215 CONST "classify(e) === \"assert-fail\"" -> "classify(e) !== \"pass\""
test("mutants_kill_is_an_assertion_failure_of_a_top_level_test", () => {
  const r = campaign(), t1 = row(r, "T1");
  assert.equal(r.status, 1, r.stderr);
  assert.deepEqual([t1?.status, t1?.strict, t1?.fails, t1?.oks, t1?.exit], ["tue", true, ["pos_zero"], 1, 1]);
  assert.deepEqual(["N1", "X1"].map((id) => row(r, id)?.status), ["non conclu", "non conclu"]);
});

// killer: scripts/mutants/run.mjs:215 CONST "\"assert-fail\"" -> "\"inconclusive\""
test("mutants_dead_child_is_non_conclu_never_killed", () => {
  const r = campaign(), n1 = row(r, "N1"), tap = join(r.out, "tap", "N1.tap");
  assert.deepEqual([n1?.status, n1?.strict, n1?.fails.length, n1?.oks, existsSync(tap)], ["non conclu", false, 1, 0, true]);
  assert.match(readFileSync(tap, "utf8"), /exitCode: 134/);
});

// killer: scripts/mutants/run.mjs:268 CONST "writeFileSync(p, orig)" -> "void orig"
test("mutants_restore_each_mutated_file_to_the_byte", () => {
  const r = campaign(), s = sha(M), ran = r.rec?.results.filter((x) => x.sha_before !== null) ?? [], p = join(r.out, "clone", "lib", "m.mjs");
  assert.deepEqual(ran.map((x) => [x.id, x.sha_before, x.sha_after]), ["T1", "S1", "N1", "X1", "K1"].map((id) => [id, s, s]));
  assert.deepEqual([r.rec?.sha0, existsSync(p) ? sha(readFileSync(p)) : null, row(r, "X1")?.status], [{ "lib/m.mjs": s }, s, "non conclu"]);
  assert.deepEqual(["lib/old.mjs", "test/b.test.ts"].map((q) => existsSync(join(r.out, "clone", q))), [false, true]); // the tree's deletion and untracked file
});

// killer: scripts/mutants/run.mjs:114 ROR "l.split(e.before).length !== 2" -> "l.split(e.before).length < 2"
test("mutants_anchor_absent_or_twice_on_its_line_is_lost_counted_never_applied", () => {
  const r = campaign();
  assert.deepEqual(["A1", "A2"].map((id) => [row(r, id)?.status, row(r, id)?.sha_before, existsSync(join(r.out, "tap", `${id}.tap`))]), [["anchor-lost", null, false], ["anchor-lost", null, false]]);
  assert.equal(r.rec?.counts["anchor-lost"], 2);
  const d = run(["--base", fixture().base, "--table", table("lost.json", [A1])], { floor: false }); // no runnable mutant: no memory read, the default floor recorded
  assert.deepEqual([d.status, row(d, "A1")?.status, d.rec?.baseline, d.rec?.min_free_mb], [1, "anchor-lost", null, 4096], d.stderr);
});

const heldOwners = ahead(() => { // the six owners side by side, each on its lock root (table held.json: one.json is rewritten by the tests that run meanwhile)
  const f = fixture(), t = table("held.json", [T1]), dead = 0x7FFFFFF0, mark = (pid: number): string => JSON.stringify({ lock: "oracle/lock.mjs", pid }); // G2 M-3: a pid no host allocates, never a freed one
  const owners: [string | null, number][] = [[mark(process.pid), 4], ["a legacy free-text owner", 4], [JSON.stringify({ lock: "sh", pid: dead }), 4], [JSON.stringify({ pid: dead }), 4], [null, 4], [mark(dead), 0]];
  return Promise.all(owners.map(async ([owner, code]) => { // corrections D-6: no launch refusal; acquire() of oracle/lock.mjs takes over its own tag with a dead pid only, never another
    const lock = ownLock(), o = join(lock, "oracle-lock", "owner.txt");
    if (owner === null) mkdirSync(dirname(o), { recursive: true }); else write(lock, { "oracle-lock/owner.txt": owner });
    return { owner, code, o, r: await runAsync(["--base", f.base, "--table", t, "--wait-ms", "1000", "--poll-ms", "100"], { lock }) }; // waited 1 s at BASELINE
  }));
});
// killer: scripts/mutants/run.mjs:232 CONST "{ stop: \"verrou\", waited_ms" -> "{ stop: \"memoire\", waited_ms"
test("mutants_wait_for_a_held_oracle_lock_in_its_queue_never_take_a_live_one_and_stop_by_name", async () => {
  for (const { owner, code, o, r } of await heldOwners()) {
    const s = r.rec?.stop, held = code === 4;
    assert.deepEqual([owner, r.status, existsSync(join(r.out, "clone")), s?.reason, s?.at, existsSync(o) && readFileSync(o, "utf8")],
      [owner, code, true, held ? "verrou" : undefined, held ? "BASELINE" : undefined, held ? owner ?? false : false], r.stderr);
  }
});

// killer: scripts/mutants/run.mjs:206 CONST "< o.minFree" -> "< 0"
test("mutants_short_memory_past_the_bound_stops_by_name_running_nothing", () => {
  const r = run(["--base", fixture().base, "--table", table("one.json", [T1]), "--min-free-mb", "999999999", "--wait-ms", "300", "--poll-ms", "50"]), taps = join(r.out, "tap"), s = r.rec?.stop;
  assert.deepEqual([r.status, r.rec?.results, r.rec?.baseline, r.rec?.min_free_mb, s?.reason, s?.at, s?.not_run], [4, [], null, 999999999, "memoire", "BASELINE", ["T1"]], r.stderr);
  assert.deepEqual([existsSync(taps) ? readdirSync(taps) : null, (s?.waited_ms ?? 0) >= 300, /^# stop memoire at BASELINE /m.test(r.stdout)], [[], true, true]); // D-3: polled to its bound
});

// killer: scripts/mutants/run.mjs:90 CONST "stack.push(...deps(f))" -> "void deps(f)"
test("mutants_targets_follow_the_transitive_import_closure", () => {
  const f = fixture(), g = ["test/*.test.ts"];
  assert.deepEqual(targetsOf(f.dir, "lib/m.mjs", g), { direct: ["test/a.test.ts"], transitive: ["test/c.test.ts"] });
  assert.deepEqual([targetsOf(f.dir, "lib/mid.mjs", g), targetsOf(f.dir, "lib/lone.mjs", g)], [{ direct: ["test/c.test.ts"], transitive: [] }, { direct: [], transitive: [] }]);
  assert.deepEqual(row(campaign(), "T1")?.targets, ["test/a.test.ts", "test/c.test.ts", "test/b.test.ts"]); // --targets: b added, a not twice (Q-G2-3)
});

// killer: scripts/mutants/run.mjs:86 CONST "m[1] ?? m[2]" -> "m[1]"
test("mutants_targets_follow_export_from_literal_import_calls_tsx_cts_mts_cjs", () => {
  const g = join(fixture().root, "graph"), imp = (p: string): string => `import "../lib/${p}";\n`, t = (file: string): unknown => targetsOf(g, file, ["test/*.test.ts"]);
  write(g, { "lib/goal.mjs": "export const a = 1;\n", "lib/star.mts": 'export * from "./goal.mjs";\n', "lib/named.cts": "export {\n  a as b,\n} from './goal.mjs';\n", "lib/v.tsx": 'import { a } from "./goal";\n',
    "lib/w.cjs": "module.exports = 1;\n", "test/star.test.ts": imp("star.mts"), "test/named.test.ts": imp("named.cts"), "test/tsx.test.ts": imp("v"), "test/cjs.test.ts": imp("w.cjs"),
    "test/dyn.test.ts": 'await import(\n  "../lib/goal.mjs");\n', "test/computed.test.ts": 'const s = "";\nawait import(s);\nawait import("../lib/goal.mjs" + s);\n' }); // computed: skipped, never a target
  assert.deepEqual([t("lib/goal.mjs"), t("lib/w.cjs")], [{ direct: ["test/dyn.test.ts"], transitive: ["test/named.test.ts", "test/star.test.ts", "test/tsx.test.ts"] }, { direct: ["test/cjs.test.ts"], transitive: [] }]);
});

// killer: scripts/mutants/run.mjs:143 CONST "existsSync(clone)" -> "false"
test("mutants_second_launch_on_one_out_is_refused", () => {
  const args = ["--base", fixture().gel, "--table", table("nofile.json", [BARE])], one = run(args), rec = join(one.out, "RESULTS.json");
  assert.deepEqual([one.status, row(one, "T1")?.file, row(one, "T1")?.status, existsSync(rec)], [0, "lib/m.mjs", "tue", true], one.stderr); // the one code file of gel..tree
  const before = sha(readFileSync(rec)), two = run(args, { out: one.out });
  assert.deepEqual([two.status, /one launch per clone/.test(two.stderr), sha(readFileSync(rec))], [2, true, before], two.stderr);
});

// killer: scripts/mutants/run.mjs:157 CONST "r.file ?? o.file ?? code[0]" -> "r.file ?? code[0]"
test("mutants_row_without_file_takes_file_else_ambiguous_file_exit_2", () => {
  const f = fixture(), t = table("nofile.json", [BARE]), amb = run(["--base", f.base, "--table", t]), named = run(["--base", f.base, "--table", t, "--file", "lib/m.mjs"]);
  assert.deepEqual([amb.status, /ambiguous file/.test(amb.stderr), existsSync(join(amb.out, "clone"))], [2, true, false], amb.stderr); // base..tree: four code files
  assert.deepEqual([named.status, row(named, "T1")?.file, row(named, "T1")?.status], [0, "lib/m.mjs", "tue"], named.stderr);
});

// killer: scripts/mutants/run.mjs:267 CONST "first.status === \"survit\" || " -> ""
test("mutants_survivor_is_replayed_on_every_target_file_whole", () => {
  const r = campaign(), s1 = row(r, "S1");
  assert.deepEqual([s1?.status, s1?.oks, s1?.replay?.files, s1?.replay?.status, s1?.replay?.oks],
    ["survit", 2, ["test/a.test.ts", "test/c.test.ts", "test/b.test.ts"], "survit", 4]); // the replay runs the --targets file b too (Q-G2-3)
  assert.ok(existsSync(join(r.out, "tap", "S1.replay.tap")));
});

// killer: scripts/mutants/run.mjs:288 CONST "r.status === \"tue\"" -> "r.status !== \"anchor-lost\""
test("mutants_one_survivor_exits_1_with_its_record_written", () => {
  const r = run(["--base", fixture().base, "--table", table("ts.json", ROWS.slice(0, 2))]);
  assert.deepEqual([r.status, r.rec?.exit, r.rec?.counts, r.rec?.results.map((x) => [x.id, x.status])], [1, 1, { tue: 1, survit: 1 }, [["T1", "tue"], ["S1", "survit"]]], r.stderr);
});

// killer: scripts/mutants/run.mjs:261 CONST "row.sha_before !== sha0[m.file]" -> "false"
test("mutants_a_file_changed_since_the_start_stops_the_campaign_exit_3", () => {
  const r = run(["--base", fixture().base, "--table", table("w.json", [{ id: "W1", file: "lib/w.mjs", line: 1, op: "CONST", before: "1", after: "2", why: "its test rewrites it" }])]);
  assert.deepEqual([r.status, r.rec?.exit, row(r, "W1")?.status, row(r, "W1")?.note], [3, 3, "non conclu", "the file is not in its initial state"], r.stderr);
});

// killer: scripts/mutants/run.mjs:263 CONST "(m.typecheck ? bt : b)?.status !== \"vert\"" -> "false"
test("mutants_without_target_are_refused_and_a_red_baseline_runs_no_mutant", () => {
  const f = fixture(), t = table("lone.json", [{ id: "L1", file: "lib/lone.mjs", line: 1, op: "CONST", before: "1", after: "2", why: "no importer" }]);
  const none = run(["--base", f.base, "--table", t]), red = run(["--base", f.base, "--table", t, "--targets", "test/r.test.ts"]);
  assert.deepEqual([none.status, existsSync(join(none.out, "clone")), /no target/.test(none.stderr)], [2, false, true], none.stderr);
  assert.deepEqual([red.status, red.rec?.baseline?.status, row(red, "L1")?.status, row(red, "L1")?.targets], [1, "rouge", "non conclu (base)", ["test/r.test.ts"]], red.stderr);
});

// killer: scripts/mutants/run.mjs:164 CONST "test: d ? str(d[1]) : undefined" -> "test: undefined"
test("mutants_killer_lines_become_intent_mutants_run_alone", () => {
  const k1 = row(campaign(), "K1");
  assert.deepEqual([k1?.origin, k1?.file, k1?.line, k1?.op, k1?.why, k1?.test, k1?.status, k1?.fails, k1?.oks], ["killer", "lib/m.mjs", 1, "ROR", "killer of pos_zero", "pos_zero", "tue", ["pos_zero"], 0]);
});

// killer: scripts/mutants/run.mjs:296 CONST "sha256: sha(body)" -> "sha256: sha(`${body} `)"
test("mutants_record_is_complete_and_its_sha_printed_last", () => {
  const r = campaign(), f = fixture(), last = r.stdout.trim().split("\n").at(-1) ?? "", p = join(r.out, "RESULTS.json");
  assert.match(last, /^mutants-result \{/);
  const printed = JSON.parse(last.slice("mutants-result ".length)) as { exit: number; sha256: string };
  assert.deepEqual([printed.exit, printed.sha256], [1, existsSync(p) ? sha(readFileSync(p)) : null]);
  assert.deepEqual(Object.keys(r.rec ?? {}), ["schema", "repo", "base", "gel", "dirty", "tool_sha256", "tool_tree", "tool_dirty", "table", "killers", "only",
    "test_globs", "clone", "timeout_ms", "min_free_mb", "lock_root", "start", "end", "sha0", "baseline", "results", "counts", "exit", "wait_ms", "poll_ms", "baseline_typecheck", "stop"]);
  assert.deepEqual([r.rec?.wait_ms, r.rec?.poll_ms, r.rec?.baseline_typecheck, r.rec?.stop], [5_400_000, 5000, null, null]); // D-6: fields only added; the named bounds (D-3, D-5)
  assert.deepEqual([r.rec?.schema, r.rec?.base, r.rec?.gel, r.rec?.tool_sha256, r.rec?.tool_tree, r.rec?.test_globs, r.rec?.results.length],
    ["monark.mutants.v1", f.base, f.gel, sha(readFileSync(CLI)), git(join(import.meta.dirname, ".."), "rev-parse", "HEAD"), ["test/*.test.ts"], 7]); // tool_tree: HEAD of the tool's repository (Q-V-4)
  assert.match(r.rec?.dirty ?? "", /^[0-9a-f]{64}$/);
  const txt = join(r.out, "RESULTS.txt"), lines = existsSync(txt) ? readFileSync(txt, "utf8").trimEnd().split("\n") : [], b = r.rec?.baseline; // C-G2-4
  const rows = [{ ...b, id: "BASELINE", line: 0, op: "-", fails: b?.fails ?? [], sha_before: "", sha_after: "", why: "unmutated" }, ...(r.rec?.results ?? [])];
  const LINE = /^(\S+) l\.(\d+) (\S+) (.+?) \((\d+) rouge\(s\), (\d+) vert\(s\), (\d+) ms\) restaure (OK|ECHEC) ; (.*)$/; // the common format, line by line
  const got = lines.filter((l) => !l.startsWith("#")).map((l, i) => LINE.exec(l)?.slice(1).map((c, j) => (j < 8 ? c : c.startsWith(rows[i]?.why ?? ""))));
  assert.deepEqual(got, rows.map((x) => [...[x.id, x.line, x.op, x.status, x.fails.length, x.oks, x.ms].map(String),
    x.sha_before === x.sha_after ? "OK" : "ECHEC", true])); // id, line, op, status, reds, greens, ms, restored, then the why
  assert.match([lines[0], lines.at(-1)].join("|"), /^# mutants monark\.mutants\.v1, repo .+\|# end .+, exit 1$/); // header, one line each, end
});

// killer: scripts/mutants/run.mjs:44 CONST "{ acquire }" -> "{ acquire, held }"
test("mutants_tool_imports_acquire_deny_and_child_env_never_recopies_them", () => { // corrections D-6: held() of oracle/lock.mjs is no longer read
  const src = readFileSync(CLI, "utf8"), from = (names: string, mod: string): boolean => src.includes(`import { ${names} } from "../${mod}";`);
  assert.deepEqual([from("acquire", "oracle/lock.mjs"), from("classify, DENY, parseKiller, parseTap", "red-proof.mjs"), from("childEnv", "oracle/run.mjs"), src.includes('"oracle/lock.mjs"'), src.includes("API_KEY")],
    [true, true, true, false, false]); // the owner.txt tag of oracle/lock.mjs and the DENY list of red-proof.mjs are never recopied (Q-V-1, Q-V-3)
});

// killer: scripts/mutants/run.mjs:106 CONST "o.minFree >= 4096" -> "o.minFree >= 1024"
test("mutants_usage_repo_and_bound_refusals_exit_2", () => {
  const f = fixture(), t = table("one.json", [T1]), nf = table("nofile.json", [BARE]), b = ["--base", f.base], link = join(f.root, "repo-link");
  symlinkSync(f.dir, link, "junction"); // C-G2-3: --out inside --repo through a link (a junction on Windows), or by a name that begins with two dots
  const runs = [[...b], [...b, "--table", t, "--min-free-mb", "1024"], [...b, "--table", t, "--only", "Z9"], [...b, "--table", t, "--repo", f.root],
    [...b, "--table", t, "--only", "--killers"], [...b, "--table", nf], // base..tree: four code files; then Q-G2-6: --file absent from the tree, or out of it
    ...["lib/nope.mjs", "../gitconfig"].map((p) => [...b, "--table", nf, "--file", p]),
    ...["inside", "..x", "sub"].map((d) => [...b, "--table", t, "--out", join(d === "sub" ? link : f.dir, d)])].map((a) => run(a));
  const absent = "is not a file of the tree", inside = "lies inside --repo", why = runs.slice(6).map((r) => [absent, inside].find((w) => r.stderr.includes(w)));
  assert.deepEqual([runs.map((r) => [r.status, existsSync(r.out)]), why], [runs.map(() => [2, false]), [absent, absent, inside, inside, inside]]);
  assert.deepEqual(["inside", "..x", "sub"].map((d) => existsSync(join(f.dir, d))), [false, false, false]); // refused before any write: nothing in --repo
});

// killer: scripts/mutants/run.mjs:300 CONST "import.meta.main !== false" -> "process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)"
test("mutants_launched_through_a_junction_records_or_refuses_never_a_silent_exit_0", () => {
  const f = fixture(), j = join(f.root, "scripts-junction"), cli = join(j, "mutants", "run.mjs"), t = table("one.json", [T1]); // C-G2-1
  symlinkSync(join(import.meta.dirname, "..", "scripts"), j, "junction"); // New-Item -ItemType Junction on Windows, a symlink elsewhere
  const u = run(["--base", f.base, "--table", t, "--min-free-mb", "1024"], { cli }), r = run(["--base", f.base, "--table", t], { cli }); // refused, recorded
  assert.deepEqual([u.status, /usage/.test(u.stderr), r.status, r.rec?.exit, /^mutants-result /m.test(r.stdout)], [2, true, 0, 0, true], r.stderr);
});

// killer: scripts/mutants/run.mjs:147 CONST "tool_tree: ${slash(TOOL_ROOT)}" -> "${slash(TOOL_ROOT)}"
test("mutants_tool_tree_and_tool_dirty_read_the_tools_checkout_else_refused_naming_it", () => {
  const f = fixture(), copy = join(f.root, "tool-copy"), args = ["--base", f.base, "--table", table("one.json", [T1])];
  cpSync(join(import.meta.dirname, "..", "scripts"), join(copy, "scripts"), { recursive: true }); // the tool and its imports, outside any checkout (C-G2-2)
  const cli = join(copy, "scripts", "mutants", "run.mjs"), nogit = run(args, { cli }), root = realpathSync(copy).split(sep).join("/");
  git(copy, "init", "-q", "-b", "main"); git(copy, "add", "-A"); git(copy, "commit", "-q", "-m", "tool"); writeFileSync(join(copy, "x.txt"), "x"); // Q-G2-5
  const ingit = run(args, { cli }), dirty = sha(`\0x.txt\0${sha("x")}`); // the recipe of dirty: an empty diff to HEAD, one untracked file
  assert.deepEqual([nogit.status, nogit.stderr.includes(`tool_tree: ${root} is not a git checkout`), existsSync(nogit.out)], [2, true, false], nogit.stderr);
  assert.deepEqual([ingit.status, ingit.rec?.tool_tree, ingit.rec?.tool_dirty], [0, git(copy, "rev-parse", "HEAD"), dirty], ingit.stderr);
});

// killer: scripts/mutants/run.mjs:200 CONST "symlinkSync(w, join(nm, n)" -> "symlinkSync(join(repo, relative(clone, w)), join(nm, n)"
test("mutants_clone_resolves_monark_workspaces_in_itself_and_other_modules_in_the_repo", () => {
  const f = fixture(), ws = join(f.root, "ws"), lf = String.fromCharCode(10), third = join(ws, "node_modules", "third");
  const json = (o: object): string => `${JSON.stringify(o)}${lf}`, mod = (name: string): string => json({ name, type: "module", exports: "./index.mjs" });
  write(ws, { ".gitignore": `node_modules/${lf}`,
    "package.json": json({ name: "ws", private: true, type: "module", scripts: { test: 'node --test "test/*.test.ts"' } }) });
  git(ws, "init", "-q", "-b", "main"); git(ws, "add", "-A"); git(ws, "commit", "-q", "-m", "base");
  const base = git(ws, "rev-parse", "HEAD"), real = (p: string): string | null => (existsSync(p) ? realpathSync(p) : null);
  write(ws, { "packages/fx/package.json": mod("@monark/fx"), "packages/fx/index.mjs": `export const NAME = 'fx';${lf}`,
    "apps/ax/package.json": mod("@monark/ax"), "apps/ax/index.mjs": `export const APP = 'ax';${lf}`,
    "node_modules/third/package.json": mod("third"), "node_modules/third/index.mjs": `export const THIRD = 3;${lf}`,
    "node_modules/.package-lock.json": json({ lockfileVersion: 3 }) }); // a file at the top of node_modules, as npm writes one
  mkdirSync(join(ws, "node_modules", "@monark"), { recursive: true }); // npm links each workspace into the repo: the clone must never use these links
  for (const [d, x] of [["packages", "fx"], ["apps", "ax"]] as const) symlinkSync(join(ws, d, x), join(ws, "node_modules", "@monark", x), "junction");
  const own = (p: string): string => `realpathSync(fileURLToPath(new URL("../${p}/index.mjs", import.meta.url)))`, inner = [
    `import { realpathSync } from "node:fs";`, `import { fileURLToPath } from "node:url";`, `import { NAME } from "@monark/fx";`,
    `import { APP } from "@monark/ax";`, `import { THIRD } from "third";`, "const at = (s) => realpathSync(fileURLToPath(import.meta.resolve(s)));",
    `// killer: packages/fx/index.mjs:1 CONST "'fx'" -> "'fy'"`, `test("ws_resolution", () => {`, `  assert.deepEqual([NAME, APP, THIRD], ["fx", "ax", 3]);`,
    `  assert.equal(at("@monark/fx"), ${own("packages/fx")});`, `  assert.equal(at("@monark/ax"), ${own("apps/ax")});`,
    `  assert.equal(at("third"), ${JSON.stringify(realpathSync(join(third, "index.mjs")))});`, "});", ""];
  write(ws, { "test/ws.test.ts": `${HEAD}${inner.join(lf)}` }); // K1 mutates the clone's packages/fx: killed only if @monark/fx resolves in the clone
  git(ws, "add", "-A"); git(ws, "commit", "-q", "-m", "gel"); git(ws, "worktree", "add", "-q", "--detach", join(f.root, "wt"), "HEAD");
  // --repo is the linked worktree wt/, without node_modules: the tool takes the main checkout's (git's common dir), as oracle/run.mjs does
  const r = run(["--repo", join(f.root, "wt"), "--base", base, "--killers"]), k1 = row(r, "K1"), clone = join(r.out, "clone"), nm = join(clone, "node_modules");
  assert.deepEqual([r.status, r.rec?.baseline?.status, k1?.file, k1?.status, k1?.strict], [0, "vert", "packages/fx/index.mjs", "tue", true], r.stderr);
  const got = ([["@monark", "fx"], ["@monark", "ax"], ["third"]] as const).map((p) => real(join(nm, ...p))); // the clone's links, followed
  assert.deepEqual(got, [real(join(clone, "packages", "fx")), real(join(clone, "apps", "ax")), real(third)]); // workspaces in the clone, the rest in the repo
  const files = existsSync(nm) ? readdirSync(nm, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name) : null;
  assert.deepEqual(files, [".package-lock.json"]); // a file is copied, never linked (oracle/run.mjs l.109)
});

// killer: scripts/mutants/run.mjs:112 CONST "for (const e of m.edits)" -> "for (const e of m.edits.slice(0, 1))"
test("mutants_row_of_edits_applies_them_as_one_block_and_a_one_line_row_keeps_its_verdict", () => {
  const B1: Block = { id: "B1", file: "lib/m.mjs", op: "CONST", edits: [E1, E2], why: "sign(3) is 7; each edit alone, a syntax error" }, B2: Block = { ...B1, id: "B2", edits: [E1, { ...E2, before: "absent" }], why: "a lost anchor" };
  const one = (id: string, e: Edit): Row => ({ ...e, id, file: "lib/m.mjs", op: "CONST", why: "one edit alone" }), r = run(["--base", fixture().base, "--table", table("block.json", [T1, B1, one("E1", E1), one("E2", E2), B2])]);
  const got = ["T1", "B1", "E1", "E2", "B2"].map((id) => [row(r, id)?.status, row(r, id)?.edits.length, row(r, id)?.sha_before === row(r, id)?.sha_after]);
  assert.deepEqual(got, [["tue", 1, true], ["tue", 2, true], ["non conclu", 1, true], ["non conclu", 1, true], ["anchor-lost", 2, true]], r.stderr);
  assert.deepEqual([row(r, "B1")?.line, row(r, "B2")?.note, row(r, "B2")?.sha_before], [2, '"absent" is not exactly once on lib/m.mjs:4', null]); // B2: no edit applied
});

// killer: scripts/mutants/run.mjs:224 CONST "fails.length > 0 ? \"tue\" : \"survit\"" -> "\"survit\""
test("mutants_typecheck_row_is_killed_by_a_tsc_error_in_a_target_non_conclu_by_errors_elsewhere_only", () => {
  const { dir, base } = tyr(), rows = [Y("Y1", "x: number", "x: string", "TS2345 in the target"), Y("Y2", "(x:", "(y:", "a renamed parameter"), Y("Y3", "number;", "number }", "an error in the .d.mts alone")];
  const r = run(["--repo", dir, "--base", base, "--targets", "test/f.test.ts", "--table", table("ty.json", rows)]), got = rows.map((x) => [x.id, row(r, x.id)?.status, row(r, x.id)?.fails, row(r, x.id)?.note]);
  assert.deepEqual([r.status, r.rec?.baseline, r.rec?.baseline_typecheck?.status, row(r, "Y1")?.typecheck, existsSync(join(r.out, "tap", "Y1.tsc.txt"))], [1, null, "vert", true, true], r.stderr);
  assert.deepEqual(got, [["Y1", "tue", ["test/f.test.ts:4 TS2345"], null], ["Y2", "survit", [], null], ["Y3", "non conclu", [], "1 error(s) outside the targets"]]); // corrections D-2
});

// killer: scripts/mutants/run.mjs:230 CONST "await sleep(o.poll)" -> "await sleep(1)"
test("mutants_short_memory_is_waited_out_then_the_run_goes_on", () => {
  const stub = join(fixture().root, "freemem-stub.mjs"); // os.freemem low for its first three calls, then 1 TiB, synced into the tool's named import: no seam in the tool
  writeFileSync(stub, 'import host from "node:os";\nimport { syncBuiltinESMExports } from "node:module";\nlet n = 0;\nhost.freemem = () => (n++ < 3 ? 0 : 2 ** 40);\nsyncBuiltinESMExports();\n');
  const r = run(["--base", fixture().base, "--table", table("one.json", [T1]), "--poll-ms", "50"], { node: ["--import", pathToFileURL(stub).href] }), b = r.rec?.baseline;
  assert.deepEqual([r.status, b?.status, row(r, "T1")?.status, r.rec?.stop, (b?.memory_wait_ms ?? 0) >= 100], [0, "vert", "tue", null, true], r.stderr); // D-3: waited, then ran
});

// killer: scripts/mutants/run.mjs:267 CONST "(first.status === \"non conclu\" && !first.timed_out)" -> "false"
test("mutants_non_conclu_is_replayed_on_every_target_file_whole", () => {
  const R1: Row = { id: "R1", file: "lib/m.mjs", line: 1, op: "CONST", before: "return x > 0;", after: "return x === 3 ? false : x > 0 ? x : x.y.z;", why: "a TypeError in a, an assertion in c" };
  const r = run(["--base", fixture().base, "--table", table("r1.json", [R1])]), r1 = row(r, "R1"), x1 = row(campaign(), "X1");
  assert.deepEqual([r1?.status, r1?.replay?.files, r1?.replay?.status, new Set(r1?.replay?.fails)], ["non conclu", ["test/a.test.ts", "test/c.test.ts"], "tue", new Set(["pos_zero", "twice"])], r.stderr);
  assert.deepEqual([x1?.status, x1?.replay?.files, x1?.replay?.status], ["non conclu", ["test/a.test.ts", "test/c.test.ts", "test/b.test.ts"], "non conclu"]); // a syntax error: still non conclu
});

const hostLock = ahead(async () => { // the first run, its owners and lock read at once; then the queued waiter and the second run
  const f = fixture(), lock = ownLock(), log = join(f.root, "owners.log"), env = { FX_LOG: log, FX_LOCK: lock }, q = `oracle-lock.queue/${"1".padStart(15, "0")}-${process.pid}.json`;
  const { dir, base } = lk(), t = table("lk.json", [L("L1", 1, "1", "2"), L("L2", 2, "3", "4")]);
  const r = await runAsync(["--repo", dir, "--base", base, "--table", t], { lock, env }), owners = (existsSync(log) ? readFileSync(log, "utf8").trim().split("\n") : []).map((l) => JSON.parse(l) as { mutant: string; pid: number; lock: string });
  const first = { r, owners, held: existsSync(join(lock, "oracle-lock")) };
  write(lock, { [q]: "{}" }); // a live waiter queued first (this process): the tool waits behind it, never takes the lock, then stops by name
  return { lock, q, first, w: await runAsync(["--repo", dir, "--base", base, "--table", t, "--wait-ms", "1500", "--poll-ms", "100"], { lock, env }) };
});
// killer: scripts/mutants/run.mjs:231 CONST "mutant: id" -> "mutant: \"campaign\""
test("mutants_take_the_host_lock_for_each_run_alone_and_never_pass_a_queued_waiter", async () => {
  const { lock, q, first: { r, owners, held }, w } = await hostLock(), s = w.rec?.stop;
  assert.deepEqual([r.status, owners.map((x) => [x.mutant, x.pid, x.lock]), held], [0, ["BASELINE", "L1", "L2"].map((id) => [id, r.pid, "oracle/lock.mjs"]), false], r.stderr);
  assert.deepEqual([w.status, s?.reason, s?.at, s?.not_run, existsSync(join(lock, q)), existsSync(join(lock, "oracle-lock")), existsSync(join(w.out, "tap")) && readdirSync(join(w.out, "tap"))], [4, "verrou", "BASELINE", ["L1", "L2"], true, false, []], w.stderr);
});

// killer: scripts/mutants/run.mjs:131 ROR "m.edits.length > 0" -> "m.edits.length >= 0"
test("mutants_malformed_rows_and_bad_bounds_are_refused_before_any_clone", () => { // G05 G10 G11 G12 G13 G14 G15
  const f = fixture(), B = { id: "B", file: "lib/m.mjs", op: "CONST", why: "w" }, b = ["--base", f.base];
  const tables = [[{ ...B, edits: [] }], [{ ...B, edits: [E1, { line: 2, before: "x", after: "y" }] }], [{ ...B, edits: [E1], line: 2 }], [{ ...T1, typecheck: "yes" }], [{ ...T1, line: 0 }], [{ ...T1, before: "" }]];
  const runs = [...tables.map((t, i) => run([...b, "--table", table(`bad-${String(i)}.json`, t)])), run([...b, "--table", table("one.json", [T1]), "--poll-ms", "0"])];
  assert.deepEqual(runs.map((r) => [r.status, existsSync(r.out)]), runs.map(() => [2, false]), runs.map((r) => r.stderr).join("|"));
  assert.match(runs[0]?.stderr ?? "", /MUTANTS is not an array of/); // G13: an empty list of edits is a malformed row refused by name, never a crash on its first edit
});

// killer: scripts/mutants/run.mjs:106 ROR "!(o.wait >= 0)" -> "!(o.wait > 0)"
test("mutants_wait_ms_zero_runs_when_nothing_waits", () => { // G04
  const r = run(["--base", fixture().base, "--table", table("one.json", [T1]), "--wait-ms", "0"]);
  assert.deepEqual([r.status, r.rec?.wait_ms, row(r, "T1")?.status], [0, 0, "tue"], r.stderr);
});

// killer: scripts/mutants/run.mjs:115 CONST "m.op === \"SDL\" ? \"\" : " -> ""
test("mutants_an_edit_past_the_end_is_lost_sdl_empties_its_line_and_a_block_is_marked", () => { // G06 G07 G16
  const rows = [{ id: "P1", file: "lib/m.mjs", line: 99, op: "CONST", before: "x", after: "y", why: "w" }, { id: "D1", file: "lib/m.mjs", line: 4, op: "SDL", before: "-1", after: "", why: "w" },
    { id: "B1", file: "lib/m.mjs", op: "CONST", edits: [E1, E2], why: "w" }], r = run(["--base", fixture().base, "--table", table("edge.json", rows)]), txt = join(r.out, "RESULTS.txt");
  assert.deepEqual([r.status, row(r, "P1")?.status, row(r, "P1")?.note, row(r, "D1")?.status, row(r, "B1")?.status], [1, "anchor-lost", '"x" is not exactly once on lib/m.mjs:99', "tue", "tue"], r.stderr);
  assert.match(existsSync(txt) ? readFileSync(txt, "utf8") : "", /^B1 l\.2 CONST tue .* ; edits l\.2,l\.4$/m);
});

const lockStop = ahead(() => {
  const { dir, base } = lk(), lock = ownLock(), env = { FX_LOCK: lock, FX_LOG: join(fixture().root, "lk1.log"), FX_STOP: "1" };
  return runAsync(["--repo", dir, "--base", base, "--table", table("lk1.json", [L("L1", 1, "1", "2"), L("L2", 2, "3", "4")]), "--wait-ms", "1000", "--poll-ms", "100"], { lock, env });
});
// killer: scripts/mutants/run.mjs:270 CONST "at: m.id" -> "at: \"BASELINE\""
test("mutants_a_lock_stop_between_two_mutants_names_the_mutant_and_keeps_the_rows_run", async () => { // G37 G38: at L1 the fixture test queues an entry of the tool's pid
  const r = await lockStop(), s = r.rec?.stop;
  assert.deepEqual([r.status, s?.reason, s?.at, s?.not_run, r.rec?.results.map((x) => [x.id, x.status])], [4, "verrou", "L2", ["L2"], [["L1", "tue"]]], r.stderr);
});

// killer: scripts/mutants/run.mjs:233 CONST "SIGNALS.forEach((e, i) =>" -> "[].forEach((e, i) =>"
test("mutants_more_than_ten_runs_leave_no_listener_warning", () => { // G02 G29: twelve takes of the lock, the listeners of each acquire() removed
  const { dir, base } = lk(), lock = mkdtempSync(join(fixture().root, "lock-")), rows = Array.from({ length: 11 }, (_, i) => L(`L${String(i + 1)}`, 1, "1", String(i + 2)));
  const r = run(["--repo", dir, "--base", base, "--table", table("lk2.json", rows)], { lock, env: { FX_LOCK: lock, FX_LOG: join(fixture().root, "lk2.log") } });
  assert.deepEqual([r.status, r.rec?.results.length, /MaxListenersExceededWarning/.test(r.stderr)], [0, 11, false], r.stderr);
});

// Lot MUTANTS-LIVE-WAITER-AHEAD-1: the waiter lives until the tool has entered its wait, never a fixed span from its own start (a clone and a launch slowed
// past it by a loaded host left it dead, the wait empty). It polls the queue until a second entry is there, the tool's, written by acquire() as its wait
// begins (oracle/lock.mjs: mine, at t0), then lives HOLD more: lock_wait_ms is HOLD at least, whatever the load (late timers only lengthen it). It is
// killed once the tool is done, whatever its outcome (a 120 s cap of its own if the test process dies first); async, so the waiter is reaped at its exit.
const HOLD = 1500, WAITER = `const { readdirSync } = require("node:fs"), q = process.argv[1], me = "-" + process.pid + ".json";
const t = setInterval(() => { let fs = []; try { fs = readdirSync(q); } catch {} if (fs.some((f) => !f.endsWith(me))) { clearInterval(t); setTimeout(() => {}, Number(process.argv[2])); } }, 20); setTimeout(() => process.exit(0), 120000).unref();`;
const liveWaiter = ahead(async () => { // a waiter queued ahead, alive until the tool waits behind it, then HOLD more
  const { dir, base } = lk(), lock = ownLock(), queue = join(lock, "oracle-lock.queue"), child = spawn(process.execPath, ["-e", WAITER, queue, String(HOLD)], { stdio: "ignore" });
  try { write(lock, { [`oracle-lock.queue/000000000000003-${String(child.pid)}.json`]: "{}" });
    return await runAsync(["--repo", dir, "--base", base, "--table", table("lk3.json", [L("L1", 1, "1", "2")]), "--poll-ms", "100", "--wait-ms", "60000"], { lock, env: { FX_LOCK: lock, FX_LOG: join(fixture().root, "lk3.log") } }); }
  finally { child.kill(); }
});
// killer: scripts/mutants/run.mjs:232 CONST "lock_wait_ms: lk.waitedMs" -> "lock_wait_ms: 0"
test("mutants_a_live_waiter_ahead_passes_first_then_the_run_goes_on", { timeout: 90_000 }, async () => { // G28
  const r = await liveWaiter();
  assert.deepEqual([r.status, (r.rec?.baseline?.lock_wait_ms ?? 0) >= HOLD], [0, true], r.stderr);
});

// MUTANTS-LOCK-WAIT-BOUND-LOAD-1: stop.waited_ms counts from the entry into the wait (run.mjs:228, t0 of gate(), after the clone and the launch); its upper
// bound is named. Lot MUTANTS-LIVE-WAITER-AHEAD-1: that bound is now KILL = 2 * WAIT itself, the least wait a 2 * or 3 * o.wait mutant can record (acquire()
// returns null only once its own clock, started after gate()'s, reaches maxMs): those mutants stay killed whatever the load, and the late timers of a loaded
// host have KILL - WAIT (3000 ms, against 1197 measured under load) where WAIT + POLL + MARGIN left them 1600. The run starts ahead (it mostly waits).
const WAIT = 3000, POLL = 100, KILL = 2 * WAIT;
const lockBound = ahead(() => { // this process's live pid queued ahead: the tool waits to its bound, then stops by name
  const { dir, base } = lk(), lock = ownLock();
  write(lock, { [`oracle-lock.queue/000000000000001-${String(process.pid)}.json`]: "{}" });
  return runAsync(["--repo", dir, "--base", base, "--table", table("lk4.json", [L("L1", 1, "1", "2")]), "--wait-ms", String(WAIT), "--poll-ms", String(POLL)], { lock, env: { FX_LOCK: lock, FX_LOG: join(fixture().root, "lk4.log") } });
});
// killer: scripts/mutants/run.mjs:231 CONST "maxMs: o.wait }" -> "maxMs: 3 * o.wait }"
test("mutants_the_lock_wait_stops_at_its_named_bound", async () => { // G27
  const r = await lockBound(), w = r.rec?.stop?.waited_ms;
  assert.deepEqual([r.status, r.rec?.stop?.reason, (w ?? 0) >= WAIT, (w ?? 9e9) < KILL], [4, "verrou", true, true], r.stderr);
});

// killer: scripts/mutants/run.mjs:222 CONST "):/gm)]" -> "):/g)]"
test("mutants_typecheck_reads_every_diagnostic_never_replays_and_marks_its_line", () => { // G17 G23 G25 G36: an error outside the targets printed first
  const { dir, base } = ty("ty1", TS, { "test/a-helper.ts": 'import { twice } from "../lib/f.mjs";\nexport const h: number = twice(3);\n' });
  const r = run(["--repo", dir, "--base", base, "--targets", "test/f.test.ts", "--table", table("ty1.json", [Y("Y1", "x: number", "x: string"), Y("Y2", "(x:", "(y:")])]), y1 = row(r, "Y1"), txt = join(r.out, "RESULTS.txt");
  assert.deepEqual([r.status, y1?.status, y1?.fails, y1?.strict, y1?.note, y1?.replay, row(r, "Y2")?.status, row(r, "Y2")?.replay], [1, "tue", ["test/f.test.ts:4 TS2345"], false, "1 error(s) outside the targets", null, "survit", null], r.stderr);
  assert.match(existsSync(txt) ? readFileSync(txt, "utf8") : "", /^Y1 l\.1 CONST tue .* ; typecheck$/m);
});

// killer: scripts/mutants/run.mjs:220 CONST "join(clone, \"node_modules\", \"typescript\"" -> "join(repo, \"node_modules\", \"typescript\""
test("mutants_typecheck_takes_typescript_of_the_main_checkout_for_a_linked_worktree", () => { // G20
  const { dir, base } = ty("ty2"), wt = join(fixture().root, "ty2wt");
  git(dir, "worktree", "add", "-q", "--detach", wt, "HEAD");
  const r = run(["--repo", wt, "--base", base, "--targets", "test/f.test.ts", "--table", table("ty2.json", [Y("Y1", "x: number", "x: string")])]);
  assert.deepEqual([r.status, r.rec?.baseline_typecheck?.status, row(r, "Y1")?.status], [0, "vert", "tue"], r.stderr);
});

// killer: scripts/mutants/run.mjs:220 CONST "\"--noEmit\", " -> ""
test("mutants_typecheck_never_emits_into_the_clone", () => { // G21: a tsconfig without noEmit
  const { dir, base } = ty("ty3", { ...TS, noEmit: undefined }), r = run(["--repo", dir, "--base", base, "--targets", "test/f.test.ts", "--table", table("ty3.json", [Y("Y1", "x: number", "x: string")])]);
  assert.deepEqual([r.status, row(r, "Y1")?.status, existsSync(join(r.out, "clone", "test", "f.test.js"))], [0, "tue", false], r.stderr);
});

// Lot MUTANTS-LIVE-WAITER-AHEAD-1: --timeout-ms of the two runs ahead whose rows overrun on purpose. Each child of the tool has 10 * OVER (15 s) to its
// bound, the room of their baseline under load (3 s and 5 s before: a baseline slowed past them is non conclu and runs no row); a row that hangs runs to it.
const OVER = 1500;
const deadTsc = ahead(() => { const { dir, base } = fk(); // Z1 hangs to its bound (10 * OVER)
  return runAsync(["--repo", dir, "--base", base, "--targets", "test/f.test.ts", "--timeout-ms", String(OVER), "--table", table("fk1.json", [Y("Z1", "number;", "number; // HANG"), Y("Z2", "number;", "number; // CRASH")])], { lock: ownLock() });
});
// killer: scripts/mutants/run.mjs:224 CONST "r.error !== undefined || r.signal !== null || r.status === 134 ? \"non conclu\"" -> "false ? \"non conclu\""
test("mutants_a_dead_or_silent_tsc_is_non_conclu_never_survit", async () => { // G24; corrections D-3: Z1 a tsc killed at its bound, Z2 a tsc out 1 without a diagnostic line
  const r = await deadTsc();
  assert.deepEqual([r.rec?.baseline_typecheck?.status, ...["Z1", "Z2"].map((id) => [row(r, id)?.status, row(r, id)?.note])], ["vert", ["non conclu", null], ["non conclu", "tsc exit 1 without a diagnostic line"]], r.stderr);
});

// killer: scripts/mutants/run.mjs:246 CONST "g.exit === 0 ? \"vert\" : \"rouge\"" -> "\"vert\""
test("mutants_a_red_typecheck_baseline_runs_no_typecheck_row", () => { // G33: the fake TypeScript reports an error in the target at the baseline
  const { dir, base } = fk(), r = run(["--repo", dir, "--base", base, "--targets", "test/f.test.ts", "--table", table("fk2.json", [Y("Z1", "(x:", "(y:")])], { env: { FK_RED: "1" } });
  assert.deepEqual([r.status, r.rec?.baseline_typecheck?.status, row(r, "Z1")?.status], [1, "rouge", "non conclu (base)"], r.stderr);
});

// killer: scripts/mutants/run.mjs:266 CONST "tsc(m.targets, m.id)" -> "tsc(m.first, m.id)"
test("mutants_typecheck_errors_count_on_every_target_not_only_the_direct_importers", () => { // G35: k.mts imported by d directly, by t through mid.mts
  const ts = { ...TS, allowImportingTsExtensions: true, types: [] }, { dir, base } = mini("tk", { "tsconfig.json": `${JSON.stringify({ compilerOptions: ts, include: ["test/**/*.ts"] })}\n`,
    "lib/k.mts": "export const k: number = 1;\n", "lib/mid.mts": 'export { k } from "./k.mts";\n', "test/d.test.ts": 'import { k } from "../lib/k.mts";\nexport const s = String(k);\n',
    "test/t.test.ts": 'import { k } from "../lib/mid.mts";\nexport const v: number = k;\n' });
  linkTs(dir, false);
  const r = run(["--repo", dir, "--base", base, "--table", table("tk.json", [{ ...Y("K1", "k: number = 1", 'k: string = "1"'), file: "lib/k.mts" }])]);
  assert.deepEqual([r.status, row(r, "K1")?.status, row(r, "K1")?.fails], [0, "tue", ["test/t.test.ts:2 TS2322"]], r.stderr);
});

// Lot MUTANTS-MEM-LOCK-WINDOW-FLAKE-1: CLOCK, a preload that is the tool's clock. Date.now() moves only by the tool's own waits (setTimeout, each fired at once;
// past 64, exit 99), never by the host's load: G32 and D-4 count their waits by it, never by a window of 300 ms, and their waited_ms is exact.
const CLOCK = "let now = Date.now(), turns = 0;\nDate.now = () => now;\nglobalThis.setTimeout = (cb, ms, ...a) => { if (++turns > 64) process.exit(99); now += ms; return setImmediate(cb, ...a); };\n";
// killer: scripts/mutants/run.mjs:243 CONST " || stop !== null ?" -> " ?"
test("mutants_a_memory_stop_at_the_baseline_is_not_waited_again_by_the_typecheck_baseline", () => { // G32
  const { dir, base } = tyr(), rows = [{ id: "N1", file: "lib/f.mjs", line: 1, op: "CONST", before: "x * 2", after: "x * 3", why: "w" }, Y("Y1", "x: number", "x: string")], clock = join(fixture().root, "clock.mjs");
  writeFileSync(clock, CLOCK);
  const r = run(["--repo", dir, "--base", base, "--targets", "test/f.test.ts", "--table", table("ty4.json", rows), "--min-free-mb", "999999999", "--wait-ms", "300", "--poll-ms", "50"], { node: ["--import", pathToFileURL(clock).href] }), s = r.rec?.stop;
  assert.deepEqual([r.status, s?.reason, s?.at, s?.not_run, s?.waited_ms], [4, "memoire", "BASELINE", ["N1", "Y1"], 300], r.stderr);
});

// killer: scripts/mutants/run.mjs:274 CONST "memory_wait_ms: g.memory_wait_ms" -> "memory_wait_ms: null"
test("mutants_a_row_records_its_own_memory_wait", () => { // G39: memory low for the three reads of T1 before its lock (the baseline reads it twice, before and under its lock)
  const stub = join(fixture().root, "mem-row.mjs");
  writeFileSync(stub, 'import host from "node:os";\nimport { syncBuiltinESMExports } from "node:module";\nlet n = 0;\nhost.freemem = () => (n++ >= 2 && n <= 5 ? 0 : 2 ** 40);\nsyncBuiltinESMExports();\n');
  const r = run(["--base", fixture().base, "--table", table("one.json", [T1]), "--poll-ms", "50"], { node: ["--import", pathToFileURL(stub).href] });
  assert.deepEqual([r.status, row(r, "T1")?.status, (row(r, "T1")?.memory_wait_ms ?? 0) >= 100], [0, "tue", true], r.stderr);
});

// killer: scripts/mutants/run.mjs:232 CONST "short = memShort(); if (!short)" -> "short = false; if (!short)"
test("mutants_short_memory_under_the_lock_is_waited_out_without_it_to_the_bound", () => { // corrections D-4: each memory read logs whether the lock is held
  const f = fixture(), lock = mkdtempSync(join(f.root, "lock-")), log = join(f.root, "mem-lock.log"), stub = join(f.root, "mem-lock.mjs");
  writeFileSync(stub, 'import host from "node:os";\nimport { appendFileSync, existsSync } from "node:fs";\nimport { syncBuiltinESMExports } from "node:module";\nlet n = 0;\n' + CLOCK + 'host.freemem = () => {\n' +
    '  if (n === 1) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 400);\n' + // the lock held 400 ms of real time, more than the whole wait: the load that left "-L" once in 528 oracle runs
    '  appendFileSync(String(process.env.FX_LOG), existsSync(String(process.env.FX_LOCK) + "/oracle-lock") ? "L" : "-"); return n++ >= 1 ? 0 : 2 ** 40; };\nsyncBuiltinESMExports();\n');
  const r = run(["--base", f.base, "--table", table("one.json", [T1]), "--wait-ms", "300", "--poll-ms", "50"], { lock, node: ["--import", pathToFileURL(stub).href], env: { FX_LOCK: lock, FX_LOG: log } }), s = r.rec?.stop;
  assert.deepEqual([r.status, s?.reason, s?.at, s?.waited_ms, r.rec?.baseline, r.rec?.results, existsSync(join(lock, "oracle-lock"))], [4, "memoire", "BASELINE", 300, null, [], false], r.stderr);
  assert.equal(existsSync(log) ? readFileSync(log, "utf8") : "", "-L------"); // one read before the lock, one under it (short: released), then six waits of 50 ms without it
});

const overrun = ahead(() => { // G1 runs to its bound (10 * OVER), its module asleep 5 s past it
  const { dir, base } = mini("to", { "lib/h.mjs": "export const H = 1;\nexport const G = 1;\n", "test/h.test.ts": `${HEAD}import { G, H } from "../lib/h.mjs";\nif (G === 2) await new Promise((r) => setTimeout(r, ${String(10 * OVER + 5000)}));\n` +
    'test("h", async () => { if (H === 2) await new Promise((r) => setTimeout(r, 60000)); assert.deepEqual([G, H], [1, 1]); });\n' });
  const h = (id: string, line: number, after: string): Row => ({ id, file: "lib/h.mjs", line, op: "CONST", before: "1", after, why: "w" });
  return runAsync(["--repo", dir, "--base", base, "--table", table("to.json", [h("H1", 1, "2"), h("G1", 2, "2"), h("X1", 1, '1; throw new Error("load")')]), "--timeout-ms", String(OVER)], { lock: ownLock() });
});
// killer: scripts/mutants/run.mjs:267 CONST "!first.timed_out" -> "true"
test("mutants_a_time_overrun_is_non_conclu_and_never_replayed", async () => { // corrections D-5: H1 a test past --timeout-ms, G1 a run past its bound; X1, no overrun, replayed
  const r = await overrun();
  assert.deepEqual([r.status, r.rec?.baseline?.status, ["H1", "G1", "X1"].map((id) => [row(r, id)?.status, row(r, id)?.replay?.status ?? null])], [1, "vert", [["non conclu", null], ["non conclu", null], ["non conclu", "non conclu"]]], r.stderr);
});

// Lot MUTANTS-TEST-SUPPORT-1: sp/, a support module test/place.ts that test/place.test.ts imports (a killer on it, and a table row), test/shared.test.ts that it
// imports too (a test file: never mutable) and test/stray.ts that no test file imports (not declared: still test code).
const SP = { "test/place.ts": "export const frame = (n) => (n < 126 ? 0 : 2);\n", "test/shared.test.ts": "export const K = 1;\n", "test/stray.ts": "export const S = 1;\n",
  "test/place.test.ts": `${HEAD}import { frame } from "./place.ts";\nimport { K } from "./shared.test.ts";\n// killer: test/place.ts:1 ROR "n < 126" -> "n <= 126"\ntest("frame_wide", () => { assert.deepEqual([frame(125), frame(126), K], [0, 2, 1]); });\n` };
const P = (id: string, file: string, before: string, after: string): Row => ({ id, file, line: 1, op: "CONST", before, after, why: "w" });
let SPR: Run | undefined;
const sp = (): Run => (SPR ??= ((m) => run(["--repo", m.dir, "--base", m.base, "--killers", "--table", table("sp.json", [P("P1", "test/place.ts", ": 2)", ": 3)"),
  P("P2", "test/shared.test.ts", "1", "2"), P("P3", "test/stray.ts", "1", "2")])]))(mini("sp", SP)));

// killer: scripts/mutants/run.mjs:123 CONST "targetsOf(root, m.file, globs).direct.length === 0" -> "true"
test("mutants_a_killer_or_a_row_mutates_a_support_module_a_test_file_imports", () => {
  const r = sp();
  assert.deepEqual([r.rec?.baseline?.status, ...["K1", "P1"].map((id) => [row(r, id)?.status, row(r, id)?.targets, row(r, id)?.fails])], ["vert", ["tue", ["test/place.test.ts"], ["frame_wide"]],
    ["tue", ["test/place.test.ts"], ["frame_wide"]]], r.stderr);
});

// killer: scripts/mutants/run.mjs:123 CONST "m.file.endsWith(\".test.ts\") || " -> ""
test("mutants_still_refuse_a_test_file_or_an_unimported_module_under_test", () => {
  const r = sp(), why = (f: string): string => `${f} is test code: a mutant mutates production code`;
  assert.deepEqual(["P1", "P2", "P3"].map((id) => [row(r, id)?.status, row(r, id)?.note]), [["tue", null], ["anchor-lost", why("test/shared.test.ts")], ["anchor-lost", why("test/stray.ts")]], r.stderr);
});

// Lot MUTANTS-RUN-EXIT-CODE-1: ec/, two tests in one file (e_first reads F, e_second reads E). LOSE, a preload of the tool (--import) that wraps spawnSync for
// the --test runs alone: FX_LOSE=tail cuts the TAP at its first "not ok" line, the exit code kept (a report lost under --test-force-exit; a pipe is written
// synchronously on Linux, so the loss is simulated); FX_LOSE=zero gives exit 0 to a TAP with a "not ok" line. The exit code then contradicts the entries.
const LOSE = 'import cp from "node:child_process";\nimport { syncBuiltinESMExports } from "node:module";\nconst real = cp.spawnSync;\n' +
  'cp.spawnSync = (c, a, o) => { const r = real(c, a, o), i = Array.isArray(a) && a.includes("--test") && typeof r.stdout === "string" ? r.stdout.search(/^not ok /m) : -1;\n' +
  '  if (i >= 0 && process.env.FX_LOSE === "tail") r.stdout = r.stdout.slice(0, i); else if (i >= 0 && process.env.FX_LOSE === "zero") r.status = 0;\n  return r; };\nsyncBuiltinESMExports();\n';
let ECR: { dir: string; base: string } | undefined, ECX: { dir: string; base: string } | undefined;
const ECS = new Map<string, Run>(); // one campaign per (mode, rows, red), shared by the tests that read it
function ec(mode: string, rows: Row[], red = false): Run { // red (G2 m-5): ecx/, the same files with e_second red at base (it wants E = 2)
  const files = (want: string): Record<string, string> => ({ "lib/e.mjs": "export const E = 1;\nexport const F = 1;\n", "test/e.test.ts": `${HEAD}import { E, F } from "../lib/e.mjs";\n` +
    `test("e_first", () => { assert.equal(F, 1); });\ntest("e_second", () => { assert.equal(E, ${want}); });\n` });
  const m = red ? (ECX ??= mini("ecx", files("2"))) : (ECR ??= mini("ec", files("1"))), lose = join(fixture().root, "lose.mjs");
  const key = JSON.stringify([mode, rows, red]), hit = ECS.get(key);
  if (hit !== undefined) return hit;
  writeFileSync(lose, LOSE);
  const r = run(["--repo", m.dir, "--base", m.base, "--table", table(`ec-${mode}${red ? "-red" : ""}.json`, rows)], { node: ["--import", pathToFileURL(lose).href], env: { FX_LOSE: mode } });
  ECS.set(key, r);
  return r;
}
const E = (id: string, line: number, before: string): Row => ({ id, file: "lib/e.mjs", line, op: "CONST", before, after: `${before.slice(0, -1)}2`, why: "w" });
const ecTail = (): Run => ec("tail", [E("E1", 1, "E = 1"), E("F1", 2, "F = 1")]), ecZero = (): Run => ec("zero", [E("E1", 1, "E = 1")]);
const CUT = " (TAP cut: no closing summary)"; // G2 m-4: the TAP lacks its closing "# duration_ms" line (the first condition of truncation() in scripts/red-proof.mjs)
const txtLine = (r: Run, head: string): string | undefined => readFileSync(join(r.out, "RESULTS.txt"), "utf8").split("\n").find((l) => l.startsWith(head));

// killer: scripts/mutants/run.mjs:214 CONST "bad.length === 0 && r.status !== 0" -> "false"
test("mutants_a_non_zero_exit_without_a_failing_entry_is_non_conclu_named_never_survit", () => {
  const r = ec("tail", [E("E1", 1, "E = 1"), E("F1", 2, "F = 1")]), get = (id: string): unknown[] => [row(r, id)?.status, row(r, id)?.oks, row(r, id)?.fails, row(r, id)?.exit, row(r, id)?.note];
  assert.deepEqual([r.status, r.rec?.baseline?.status, get("E1"), get("F1"), row(r, "E1")?.replay?.status], [1, "vert", ["non conclu", 1, [], 1, `exit 1 without a failing entry${CUT}`],
    ["non conclu", 0, [], 1, `exit 1 without a test entry${CUT}`], "non conclu"], r.stderr); // E1: e_second's report lost, e_first ok; F1: no entry left
});

// killer: scripts/mutants/run.mjs:214 CONST "bad.length > 0 && r.status === 0" -> "false"
test("mutants_exit_zero_with_a_failing_entry_is_non_conclu_named_never_killed", () => {
  const r = ec("zero", [E("E1", 1, "E = 1")]), e1 = row(r, "E1");
  assert.deepEqual([r.status, r.rec?.baseline?.status, e1?.status, e1?.fails, e1?.exit, e1?.note], [1, "vert", "non conclu", ["e_second"], 0, "exit 0 with 1 failing entry"], r.stderr);
});

// killer: scripts/mutants/run.mjs:217 CONST "cut ? \" (TAP cut" -> "false ? \" (TAP cut"
test("mutants_the_note_says_whether_the_tap_was_cut", () => { // G2 m-4: a cut TAP (tail) is named; a whole TAP with exit 0 (zero) keeps a bare note
  assert.deepEqual([row(ecTail(), "E1")?.note, row(ecTail(), "F1")?.note, row(ecZero(), "E1")?.note], [`exit 1 without a failing entry${CUT}`, `exit 1 without a test entry${CUT}`,
    "exit 0 with 1 failing entry"], ecTail().stderr);
});

// killer: scripts/mutants/run.mjs:135 CONST "r.replay.note ? " -> "false ? "
test("mutants_results_txt_carries_the_note_of_the_replay", () => { // G2 m-2: the replay's note on the mutant's line, inside its segment
  const r = ecTail();
  assert.equal(txtLine(r, "E1 ")?.split(" ; rejeu ")[1], `test/e.test.ts : non conclu (0 rouge(s), 1 vert(s), exit 1 without a failing entry${CUT})`, r.stderr);
});

// killer: scripts/mutants/run.mjs:247 CONST "g.note ? " -> "false ? "
test("mutants_a_baseline_whose_exit_contradicts_its_entries_is_non_conclu_named_and_no_mutant_runs", () => { // G2 m-5, m-2: ecx/ at base, e_second's report lost
  const r = ec("tail", [E("E1", 1, "E = 1")], true), b = r.rec?.baseline, note = `exit 1 without a failing entry${CUT}`;
  assert.deepEqual([r.status, b?.status, b?.oks, b?.fails, b?.exit, b?.note, row(r, "E1")?.status, row(r, "E1")?.tap_sha256], [1, "non conclu", 1, [], 1, note, "non conclu (base)", null], r.stderr);
  assert.equal(txtLine(r, "BASELINE ")?.replace(/, \d+ ms\)/, ", N ms)"), `BASELINE l.0 - non conclu (0 rouge(s), 1 vert(s), N ms) restaure OK ; unmutated ; ${note}`);
});

// killer: scripts/mutants/run.mjs:217 CONST "note: dead ? null :" -> "note: false ? null :"
test("mutants_a_dead_child_carries_no_exit_code_note", async () => { // G2 m-1: G1, a run past its bound (ETIMEDOUT), is non conclu without a note
  const r = await overrun(), g1 = row(r, "G1"); // its exit code is the runner's own on SIGTERM (7 on Node 24), not asserted
  assert.deepEqual([g1?.status, g1?.replay, g1?.note], ["non conclu", null, null], r.stderr);
});
