/**
 * Root test `journal_index` (ADR-METHODE-2 D8a, D10, D11, D12 (d); lot M-5; decision 275-e). It drives the CLI
 * scripts/journal/index.mjs (add, build) over throwaway git repositories under the OS temp directory: a template with two
 * byte-deterministic commits (fixed identity and dates, no system or global git config, no GIT_* variable; C2 adds docs/b.md;
 * C3, off the branch, is committed at +0100 an hour after its author) and the frozen files of test/fixtures/journal/ at their
 * repo paths, one copy per build. The frozen entries are the clean fixture (green: the golden test); each control test forges
 * one defect from them. The line above each test is its killer, the production mutation that reddens it (convention of
 * scripts/red-proof.mjs, lot M-4); one inside a body, the mutation its next assertion kills. No helper throws when the CLI is
 * absent: at the base, every test is red by an assertion; build() reads no JSON or an exit other than 0/1 as CLI-FAILED.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

type Entry = Record<string, unknown>;
interface Hit { code: string; lot: string; line: number; extract: string }
const ROOT = join(import.meta.dirname, ".."), FX = join(ROOT, "test", "fixtures", "journal"), CLI = join(ROOT, "scripts", "journal", "index.mjs");
const C1 = "d3b8d4d9814b74bfa0ae9563616e8feb6f27309d", C2 = "8216f30324b60802d9d6c91beb5f3082dbe0653e";
const T = mkdtempSync(join(tmpdir(), "monark-journal-")), TPL = join(T, "tpl");
after(() => { rmSync(T, { recursive: true, force: true, maxRetries: 3 }); });
writeFileSync(join(T, "gitconfig"), "");
const ENV = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_"))), GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: join(T, "gitconfig") };
const git = (a: string[], env: NodeJS.ProcessEnv = {}): string =>
  execFileSync("git", ["-C", TPL, "-c", "user.name=f", "-c", "user.email=f@example.invalid", ...a], { env: { ...ENV, ...env }, encoding: "utf8" }).trim();
mkdirSync(join(TPL, "docs"), { recursive: true });
git(["init", "-q", "-b", "main"]);
for (const [f, at] of [["a.txt", "1767227400"], ["docs/b.md", "1767313800"]] as const) {
  writeFileSync(join(TPL, f), `${f}\n`);
  git(["add", f]);
  git(["commit", "-q", "-m", f], { GIT_AUTHOR_DATE: `@${at} +0000`, GIT_COMMITTER_DATE: `@${at} +0000` });
}
const C3 = git(["commit-tree", "HEAD^{tree}", "-p", "HEAD", "-m", "c3"], { GIT_AUTHOR_DATE: "@1767396600 +0000", GIT_COMMITTER_DATE: "@1767400200 +0100" });
cpSync(FX, join(TPL, "test", "fixtures", "journal"), { recursive: true });
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const frozen = (lot: string): Entry[] => readFileSync(join(FX, `${lot}.jsonl`), "utf8").trim().split("\n").map((l) => JSON.parse(l) as Entry);
const X = frozen("M-X"), M = X[2]?.mission as Entry;
/** Line `n` (1-based) of the frozen M-X journal, copied: 3 G1, 4 G2 at C1, 5 corr, 6 cp-2, 7 G7, 8 fusion (both at C2). */
const x = (n: number, patch: Entry = {}): Entry => ({ ...X[n - 1], ...patch });
const Z = frozen("M-Z");
/** Line `n` of the frozen M-Z journal, the shape of the real M-5.jsonl (lot M-5b): 1 G2 ACCEPTE, 2 cp-2 REFUS and 3 G2 ACCEPTE (dated the same second), all at C1; 4 cp-2 ACCEPTE-AVEC-CORRECTIONS and 5 G7 ACCEPTE at C2. */
const z = (n: number, patch: Entry = {}): Entry => ({ ...Z[n - 1], ...patch });
let seq = 0;
/** A copy of the template (or of `from`) whose docs/journal holds `lots` (lot -> entries, or raw lines). */
function repo(lots: Record<string, (Entry | string)[]> = {}, from = TPL): string {
  const r = join(T, `r${String(++seq)}`);
  cpSync(from, r, { recursive: true });
  mkdirSync(join(r, "docs", "journal"), { recursive: true });
  for (const [lot, rows] of Object.entries(lots)) writeFileSync(join(r, "docs", "journal", `${lot}.jsonl`), rows.map((e) => `${typeof e === "string" ? e : JSON.stringify(e)}\n`).join(""));
  return r;
}
const cli = (...a: string[]) => spawnSync(process.execPath, [CLI, ...a], { env: ENV, encoding: "utf8" });
/** build --json over `lots` (in a copy of `from`): the sorted unique codes and the hits (`code lot:line extract`), or the sentinel CLI-FAILED. */
function build(lots: Record<string, (Entry | string)[]>, from = TPL): { codes: string[]; hits: string[] } {
  const p = cli("build", "--repo", repo(lots, from), "--json");
  let hits: Hit[] | undefined;
  try { hits = (JSON.parse(p.stdout) as { hits?: Hit[] }).hits; } catch { /* no JSON: the CLI is absent (base) or crashed */ }
  if (!Array.isArray(hits) || p.status !== (hits.length > 0 ? 1 : 0)) return { codes: ["CLI-FAILED"], hits: [`CLI-FAILED exit ${String(p.status)} ${p.stderr.trim().slice(0, 200)}`] };
  return { codes: [...new Set(hits.map((h) => h.code))].sort(), hits: hits.map((h) => `${h.code} ${h.lot}:${String(h.line)} ${h.extract}`) };
}
/** A text file under the temp root, and its sha256. */
const file = (name: string, body: string): [string, string] => { writeFileSync(join(T, name), body); return [join(T, name), sha(body)]; };
/** The REQUIRED list of a repo script (the JSON array after `const REQUIRED = `), or null when absent or unreadable. */
const required = (rel: string): unknown => { try { return JSON.parse(/const REQUIRED = (\[[^\]]*\])/.exec(readFileSync(join(ROOT, rel), "utf8"))?.[1] ?? "null") as unknown; } catch { return null; } };
/** An oracle record derived from the frozen G7 record (tree merged), written under the temp root; returns the entry's `oracle` as add fills it. */
function record(name: string, patch: Entry): Entry {
  const g = JSON.parse(readFileSync(join(FX, "oracle-G7.json"), "utf8")) as Entry, r: Entry = { ...g, ...patch, tree: { ...(g.tree as Entry), ...(patch.tree as Entry | undefined) } }, [path, sha256] = file(name, `${JSON.stringify(r)}\n`);
  return { record: path, sha256, role: r.role, head: (r.tree as Entry).head, start: r.start, served_from: r.served_from, tests_total: (r.tests as Entry | null)?.total ?? null };
}
const why = (oracle: Entry, n = 7): string[] => build({ "M-X": [x(n, { oracle })] }).hits.map((h) => h.replace(/^J-ORACLE M-X:1 [\w.-]+\.json: /, ""));
let gen: { dir: string; mission: string; text: string; recu: Entry; G: string } | undefined;
/** A mission generated by this tree's scripts/mission/gen.mjs (M-5b; cp-1 bis R6), made once: gen.mjs and lint.mjs committed in a
 * copy of the template (the generator's checkout, commit G), run from there with --repo a copy whose HEAD is a child of G that
 * edits gen.mjs (the stamp's revision G != recu_head) and holds docs/new.md untracked; then launched by scripts/mission/launch.mjs. */
function generated(): NonNullable<typeof gen> {
  if (gen !== undefined) return gen;
  const g = repo(), w = join(T, `w${String(seq)}`), sh = (d: string, ...a: string[]): string => execFileSync("git", ["-C", d, "-c", "user.name=f", "-c", "user.email=f@example.invalid", ...a], { env: ENV, encoding: "utf8" }).trim();
  mkdirSync(join(g, "scripts", "mission"), { recursive: true });
  for (const f of ["gen.mjs", "lint.mjs"]) copyFileSync(join(ROOT, "scripts", "mission", f), join(g, "scripts", "mission", f));
  sh(g, "add", "scripts"); sh(g, "commit", "-q", "-m", "generator");
  cpSync(g, w, { recursive: true });
  writeFileSync(join(w, "scripts", "mission", "gen.mjs"), "// edited on the lot branch\n", { flag: "a" }); sh(w, "commit", "-q", "-am", "lot");
  writeFileSync(join(w, "docs", "new.md"), "untracked\n");
  const [[rules], [body], mission, G] = [file("gen-rules.md", "Rules fixture.\n"), file("gen-body.md", "Body fixture.\n"), join(T, "gen.md"), sh(g, "rev-parse", "HEAD")];
  spawnSync(process.execPath, [join(g, "scripts", "mission", "gen.mjs"), "--lot", "M-Z", "--role", "G2", "--tier", "claude-opus-5-5", "--repo", w, "--base", G, "--body", body, "--out", mission, "--tools-root", ROOT, "--rules", rules], { env: ENV });
  spawnSync(process.execPath, [join(ROOT, "scripts", "mission", "launch.mjs"), mission, "--repo", w], { env: ENV });
  return (gen = { dir: w, mission, text: readFileSync(mission, "utf8"), recu: JSON.parse(readFileSync(join(T, "gen.recu.json"), "utf8")) as Entry, G });
}
// M-5c (archive of the facts, red-proof). Every helper below is non-throwing: at the base, add knows neither --from-redproof nor
// refs/journal/facts, and each test is red there by an assertion.
/** git -C `d` with the template identity: stdout trimmed, "" on a failure; `input` on stdin. */
const gd = (d: string, a: string[], input?: string): string => (spawnSync("git", ["-C", d, "-c", "user.name=f", "-c", "user.email=f@example.invalid", ...a], { env: ENV, encoding: "utf8", ...(input === undefined ? {} : { input }) }).stdout ?? "").trim();
/** add in `r`: the entry it printed, or "exit <n> <stderr>". */
const added = (r: string, ...a: string[]): Entry | string => { const p = cli("add", "--repo", r, ...a); try { return p.status === 0 ? JSON.parse(p.stdout) as Entry : `exit ${String(p.status)} ${p.stderr.trim()}`; } catch { return `unparsed ${p.stdout}`; } };
/** The v1 reading of an entry: facts and redproof dropped (the form of the 21 real lines, FM-1.3). */
const v1 = (e: Entry): Entry => ({ ...Object.fromEntries(Object.entries(e).filter(([k]) => k !== "facts" && k !== "redproof")), schema: "monark.journal.v1" });
/** A forged archive: the entry `name` of refs/journal/facts in `r` set to a blob of `body`, on a commit child of the tip. */
const graft = (r: string, name: string, body: string): void => { const tip = gd(r, ["rev-parse", "refs/journal/facts"]), blob = gd(r, ["hash-object", "-w", "--stdin"], body), keep = gd(r, ["ls-tree", tip]).split(NL).filter((l) => l !== "" && !l.endsWith(name));
  gd(r, ["update-ref", "refs/journal/facts", gd(r, ["commit-tree", gd(r, ["mktree"], `${[...keep, `100644 blob ${blob}\t${name}`].join(NL)}\n`), "-p", tip, "-m", "graft"]), tip]); };
/** The entries of docs/journal/M-Z.jsonl in `r` ([] when absent). */
const lines = (r: string): Entry[] => { const f = join(r, "docs", "journal", "M-Z.jsonl"); return existsSync(f) ? readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as Entry) : []; };
const GAB = "green at base: a self-confirming test", KILL3 = ["killed", "killed", "killed"], NL = String.fromCharCode(10), CRLF = String.fromCharCode(13, 10);
/** A red-proof-v1 record at the real keys of scripts/red-proof.mjs, SYNTHESIZED here (a fixture would count for R-25): one row per
 * [verdict, reason, pinned], one drawn killer per outcome (null: no draw), gel head `head`, base C1, `patch` over the top level. */
function proof(name: string, head: string, rows: string[][], outcomes: string[] | null, patch: Entry = {}): string {
  const z = "0".repeat(64), tap = (path: string): Entry => ({ path, sha256: z }), row = (t: string): Entry => ({ name: t, file: "test/t.test.ts", killer: null });
  const drawn = (outcomes ?? []).map((outcome, i) => ({ ...row(`t${String(i)}`), status: "assert-fail", outcome, sha256_before: z, sha256_after: z, tap: tap(`killer-${String(i + 1)}.tap`) }));
  const tests = rows.map(([verdict, reason, pinned], i) => ({ ...row(`t${String(i)}`), line: i + 1, base: "assert-fail", gel: "pass", module: null, killerProblem: null, verdict, reason: reason ?? "red at base by an assertion failure, green at gel", ...(pinned === undefined ? {} : { pinned: pinned === "true" }) }));
  const r = { schema: "red-proof-v1", at: "2026-01-02T03:00:00.000Z", node: "v24", repo: "tpl", base: C1, gel: { ref: "tpl", mode: "commit", head, digest: "d".repeat(64) }, files: { tests: ["test/t.test.ts"], support: [], added: [] }, tests, unchanged: 0,
    draw: outcomes === null ? null : { seed: 1, requested: drawn.length, population: rows.length, drawn }, tap: { base: tap("base.tap"), gel: tap("gel.tap") }, drawn: drawn.length, ok: true, ...patch };
  return file(name, `${JSON.stringify(r, null, 2)}\n`)[0];
}
/** A throwaway repo (`pre` run on it first), the fixture mission plus `extra` (line ends `eol`) launched on it by launch.mjs, and `at`:
 * add in it, lot M-Z, model and tier claude-opus-5-5, at G1 (recu_head C2) or at cp-2 (--commit C2 and oracle-cp-2.json, head C2). */
function v2(extra = "", eol = NL, pre?: (r: string) => void): { r: string; mission: string; name: string; at: (gate: string, ...more: string[]) => Entry | string } {
  const r = repo(), name = `v${String(seq)}.md`, [mission] = file(name, `${readFileSync(join(FX, "mission.md"), "utf8")}${extra}`.split(NL).join(eol));
  pre?.(r);
  spawnSync(process.execPath, [join(ROOT, "scripts", "mission", "launch.mjs"), mission, "--repo", r], { env: ENV });
  return { r, mission, name, at: (gate, ...more) => added(r, "--lot", "M-Z", "--gate", gate, "--from-recu", mission.replace(/\.md$/, ".recu.json"), "--model", "claude-opus-5-5", "--tier", "claude-opus-5-5",
    ...(gate === "cp-2" ? ["--commit", C2, "--from-oracle", join(r, "test", "fixtures", "journal", "oracle-cp-2.json")] : []), ...more) };
}

// killer: scripts/journal/index.mjs:359 CONST "all.map((e) => e.date).sort().at(-1)" -> "new Date().toISOString()"
test("golden: build on the frozen entries writes INDEX.golden.md byte for byte, dated by the last entry", () => {
  assert.deepEqual([git(["rev-parse", "HEAD~1"]), git(["rev-parse", "HEAD"])], [C1, C2], "fixture commits not reproduced: a git config, identity or object format leaked into the throwaway repository");
  const r = repo(), idx = join(r, "docs", "journal", "INDEX.md");
  for (const f of ["M-X.jsonl", "M-Y.jsonl"]) copyFileSync(join(FX, f), join(r, "docs", "journal", f));
  const p = cli("build", "--repo", r);
  assert.ok(p.status === 0 && existsSync(idx), `${p.stdout}${p.stderr}`);
  assert.equal(readFileSync(idx, "utf8"), readFileSync(join(FX, "INDEX.golden.md"), "utf8"));
});

// killer: scripts/journal/index.mjs:346 COR "hits.length === 0 && o.only === undefined" -> "o.only === undefined"
test("build: red exits 1 with one line per hit and keeps the previous INDEX.md; --only never writes; no journal exits 2", () => {
  const r = repo({ "M-X": X, "M-Y": [x(1, { lot: "M-Y", date: "2026-02-30T00:00:00Z" })] }), idx = join(r, "docs", "journal", "INDEX.md");
  writeFileSync(idx, "previous index\n");
  const p = cli("build", "--repo", r), q = cli("build", "--repo", r, "--only", "M-X");
  assert.match(p.stdout, /^J-SCHEMA M-Y:1 date out of domain\ncounts J-SCHEMA=1 J-TIME=0 J-TRACE=0 J-ORIGIN=0 J-TOURS=0 J-ORACLE=0 J-RECU=0 J-LINT=0 J-MODEL=0 J-ADJ=0 J-ORDER=0 J-VERDICT=0 J-HEADER=0 J-FACTS=0 J-REDPROOF=0\nverdict rouge/);
  assert.deepEqual([p.status, q.status, readFileSync(idx, "utf8"), cli("build", "--repo", repo()).status], [1, 0, "previous index\n", 2]);
  assert.deepEqual(build({ "M-10": ["{"], "M-2a": ["{"] }).hits.map((h) => h.split(" ")[1]), ["M-2a:1", "M-10:1"]); // lots in natural order
});

// killer: scripts/journal/index.mjs:171 CONST "new Date()" -> "new Date(0)"
test("add: a launch receipt and an oracle record give one conforming line dated by the tool, and build is green on it (CA-11)", () => {
  const r = repo(), fx = join(r, "test", "fixtures", "journal"), t0 = Date.now() - 1000;
  assert.equal(spawnSync(process.execPath, [join(ROOT, "scripts", "mission", "launch.mjs"), join(fx, "mission.md"), "--repo", r], { env: ENV }).status, 0);
  const p = cli("add", "--repo", r, "--lot", "M-Z", "--gate", "G2", "--tour", "0", "--commit", C1, "--from-recu", join(fx, "mission.recu.json"), "--from-oracle", join(fx, "oracle-G2.json"),
    "--from-redproof", proof("g2.json", C1, [["F2P"]], KILL3), "--model", "claude-opus-5-5[1m]", "--tier", "claude-opus-5-5", "--effort", "max", "--verdict", "ACCEPTE", "--corrections", "0/1", "--r25", "90", "--origin", ""); // a G2 line of origin add carries its red-proof (M-5c)
  const out = join(r, "docs", "journal", "M-Z.jsonl");
  assert.ok(p.status === 0 && existsSync(out), p.stderr);
  const e = JSON.parse(readFileSync(out, "utf8")) as Entry, recu = JSON.parse(readFileSync(join(fx, "mission.recu.json"), "utf8")) as Entry, d = Date.parse(String(e.date));
  assert.equal(p.stdout, `${JSON.stringify(e)}\n`);
  assert.ok(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(String(e.date)) && d >= t0 && d <= Date.now(), `date ${String(e.date)} is not the tool's clock to the second`);
  assert.deepEqual([e.mission, e.oracle, e.tree_head, e.r25, e.corrections, e.error_origin], [
    { path: join(fx, "mission.md").replace(/\\/g, "/"), sha: M.sha, recu_sha: recu.sha, recu_date: recu.date, recu_head: recu.head },
    { ...(X[3]?.oracle as Entry), record: join(fx, "oracle-G2.json").replace(/\\/g, "/") }, C1, { lines: 90, cap: 547 }, { blocking: 0, nonblocking: 1 }, []]);
  assert.equal(cli("build", "--repo", r).status, 0);
});

// killer: scripts/journal/index.mjs:201 ROR "p.length > 0" -> "p.length > 99"
test("add: a field required by the gate missing (G2 without --tour) exits 2 and writes nothing", () => {
  const r = repo(), p = cli("add", "--repo", r, "--lot", "M-Z", "--gate", "G2", "--commit", C1);
  assert.deepEqual([p.status, existsSync(join(r, "docs", "journal", "M-Z.jsonl"))], [2, false]);
  assert.match(p.stderr, /J-SCHEMA: .*tour null, required for G2/);
});

// killer: scripts/journal/index.mjs:176 COR "r?.verdict !== \"vert\" || " -> ""
test("add: a receipt that is not green, or whose mission file is absent, exits 2 and writes nothing; a green one is recorded", () => {
  const r = repo(), recu = (name: string, patch: Entry): string => file(name, JSON.stringify({ sha: M.sha, verdict: "vert", date: "2026-01-01T00:45:00Z", mission: join(FX, "mission.md"), head: C1, ...patch }))[0];
  const add = (p: string) => cli("add", "--repo", r, "--lot", "M-Z", "--gate", "G1", "--from-recu", p, "--model", "claude-opus-5-5[1m]", "--tier", "claude-opus-5-5");
  const [red, gone] = [add(recu("red.recu.json", { verdict: "rouge" })), add(recu("gone.recu.json", { mission: join(T, "none.md") }))];
  assert.deepEqual([red.status, gone.status, existsSync(join(r, "docs", "journal", "M-Z.jsonl")), /not a green launch receipt/.test(red.stderr), /mission .* unreadable/.test(gone.stderr)], [2, 2, false, true, true]);
  assert.equal(add(recu("green.recu.json", {})).status, 0);
});

// killer: scripts/journal/index.mjs:419 CONST "\"gate\", \"from-recu\"" -> "\"gate\", \"date\", \"from-recu\""
test("add: a date given by the caller (--date) exits 2 and writes nothing", () => {
  const r = repo(), p = cli("add", "--repo", r, "--lot", "M-Z", "--gate", "G0", "--date", "2020-01-01T00:00:00Z");
  assert.deepEqual([p.status, existsSync(join(r, "docs", "journal", "M-Z.jsonl"))], [2, false]);
  assert.match(p.stderr, /unknown or incomplete option --date/);
});

// killer: scripts/journal/index.mjs:95 CONST "[\\x00-\\x1f\\x7f-\\x9f]" -> "[\\x00-\\x08\\x0a-\\x1f\\x7f-\\x9f]"
test("add: a TAB in a note, or F: followed by two spaces, exits 2 (the byte guard of lot M-1 covers docs/journal/)", () => {
  const r = repo(), run = (note: string) => cli("add", "--repo", r, "--lot", "M-Z", "--gate", "G0", "--note", note);
  assert.deepEqual([run("a\tb").status, run(`see F:${" ".repeat(2)}x`).status, existsSync(join(r, "docs", "journal", "M-Z.jsonl"))], [2, 2, false]);
  assert.deepEqual([run("a b").status, existsSync(join(r, "docs", "journal", "M-Z.jsonl"))], [0, true]);
});

// killer: scripts/journal/index.mjs:155 CONST "!FIELDS.includes(k)" -> "false"
test("J-SCHEMA: an unknown field, a missing field, a value out of domain, a line that is not JSON, a lot in another file", () => {
  const noTier = Object.fromEntries(Object.entries(x(3)).filter(([k]) => k !== "tier")), r = repo(), g0 = cli("add", "--repo", r, "--lot", "M-Z", "--gate", "G0", "--from-oracle", join(FX, "oracle-G2.json"));
  const b = build({ "M-X": [x(3, { extra: 1 }), noTier, x(3, { gate: "G3" }), "{not json", x(3, { lot: "M-Y" }), x(8, { commit: null }),
    ...["--all", `--output=${join(T, "pwned")}`, "HEAD", null].map((recu_head) => x(3, { mission: { ...M, recu_head } })), ...[1, 2, 8].map((n) => x(n, { oracle: X[3]?.oracle }))] }); // recu_head: two options (never reach git), a ref, absent without a commit; a record cited at G0, cp-1, fusion (C-G2-14)
  // killer: scripts/journal/index.mjs:161 SDL "oracle cited at a gate that never runs one" -> ""
  assert.deepEqual([b.hits.map((h) => h.split(" ").slice(0, 2).join(" ")), b.hits.slice(6).map((h) => h.split(" ").slice(2).join(" ")), [g0.status, existsSync(join(r, "docs", "journal", "M-Z.jsonl")), /J-SCHEMA: oracle cited at a gate that never runs one/.test(g0.stderr)]], [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((n) => `J-SCHEMA M-X:${String(n)}`), [...Array<string>(4).fill("mission out of domain"), ...Array<string>(3).fill("oracle cited at a gate that never runs one")], [2, false, true]]);
  assert.deepEqual(readdirSync(T).filter((f) => f.startsWith("pwned")), [], "git got the out-of-domain recu_head as an option and wrote a file"); // C-G2-12: kills R3b
  assert.deepEqual(build({ "M-X": X }).codes, []);
});

// killer: scripts/journal/index.mjs:161 CONST "[\"G0\", \"cp-1\", \"fusion\"]" -> "[\"G0\"]"
test("guard_pins_cp1_fusion_oracle_exit_2: add --gate cp-1 or fusion --from-oracle exits 2 and writes nothing (rr3 C-G2-21, G08)", () => {
  const r = repo(), run = (gate: string) => cli("add", "--repo", r, "--lot", "M-Z", "--gate", gate, "--commit", C1, "--from-oracle", join(FX, "oracle-G2.json"));
  const [cp1, fusion] = [run("cp-1"), run("fusion")], refused = "journal: J-SCHEMA: oracle cited at a gate that never runs one";
  assert.deepEqual([cp1.status, fusion.status, cp1.stderr.trim(), fusion.stderr.trim(), existsSync(join(r, "docs", "journal", "M-Z.jsonl"))], [2, 2, refused, refused, false]);
});

// killer: scripts/journal/index.mjs:161 CONST "(e.oracle ?? null)" -> "(e.oracle ?? undefined)"
test("guard_pins_null_fallback: a G0, cp-1 or fusion line without an oracle field is refused for that missing field alone, never as a citation (rr3 C-G2-21, G06)", () => {
  const drop = (n: number): Entry => Object.fromEntries(Object.entries(x(n)).filter(([k]) => k !== "oracle"));
  assert.deepEqual(build({ "M-X": [drop(1), drop(2), drop(8)] }).hits, [1, 2, 3].map((n) => `J-SCHEMA M-X:${String(n)} missing field oracle`));
});

// killer: scripts/journal/index.mjs:302 SDL "!(t >= when(e.commit))" -> ""
test("J-TIME: an entry dated before its commit (host clock set back, forged line) or before the previous entry of its lot", () => {
  assert.deepEqual(build({ "M-X": [x(8, { date: "2026-01-02T00:29:59Z" })] }).codes, ["J-TIME"]);
  assert.deepEqual(build({ "M-X": [x(8, { commit: "0".repeat(40) })] }).codes, ["J-TIME"]);
  assert.deepEqual(build({ "M-X": [x(2), x(1)] }).codes, ["J-TIME"]);
  assert.deepEqual(build({ "M-X": [x(8), x(8)] }).codes, []);
  const at3 = (date: string): string[] => build({ "M-X": [x(8, { commit: C3, date })] }).codes; // C3: committed 00:30Z (shown +01:00), authored 23:30Z the day before
  assert.deepEqual([at3("2026-01-03T00:30:00Z"), at3("2026-01-03T01:00:00Z"), at3("2026-01-03T00:00:00Z")], [[], [], ["J-TIME"]]); // same second; inside the offset hour; after the author date only
});

// killer: scripts/journal/index.mjs:305 SDL "h(\"J-TRACE\"" -> ""
test("J-TRACE: a G7 without public trace, or a motif whose ref is empty", () => {
  assert.deepEqual(build({ "M-X": [x(7, { public_trace: null })] }).codes, ["J-TRACE"]);
  assert.deepEqual(build({ "M-X": [x(7, { public_trace: { kind: "motif", ref: " " } })] }).codes, ["J-TRACE"]);
  assert.deepEqual(build({ "M-X": [x(7)] }).codes, []);
});

// killer: scripts/journal/index.mjs:306 SDL "h(\"J-ORIGIN\"" -> ""
test("J-ORIGIN: an error_origin code outside the vocabulary of audit A; an empty list is a declared none, never refused", () => {
  assert.deepEqual(build({ "M-X": [x(7, { error_origin: ["G1", "WORKER"] })] }).codes, ["J-ORIGIN"]);
  assert.deepEqual([[], ["G0", "G1", "G2", "ORCH", "OUT", "ANT", "VAL", "PROV", "NA"]].map((error_origin) => build({ "M-X": [x(7, { error_origin })] }).codes), [[], []]);
});

// killer: scripts/journal/index.mjs:321 SDL "hit(\"J-TOURS\"" -> ""
test("J-TOURS and J-ADJ: six distinct corr tours with a G7 that has no adjudication; an adjudicated G7, or five tours in six entries, clear J-TOURS", () => {
  const six = [1, 2, 3, 4, 5, 6].map((t) => x(5, { tour: t })), five = [1, 2, 3, 4, 5, 5].map((t) => x(5, { tour: t }));
  assert.deepEqual(build({ "M-X": [...six, x(7, { adjudication: null })] }).codes, ["J-ADJ", "J-TOURS"]);
  assert.deepEqual([build({ "M-X": [...six, x(7)] }).codes, build({ "M-X": six.slice(1) }).codes, build({ "M-X": five }).codes], [[], [], []]);
});

// killer: scripts/journal/index.mjs:250 CONST "r.served_from !== null" -> "false"
test("J-ORACLE: a record served from the store, absent, of another role or head, started before its commit, of another sha, or miscopied", () => {
  assert.deepEqual(why(record("served.json", { served_from: { file: "x.json", sha256: "0".repeat(64) } })), ["served_from not null: a store citation, never a replay"]);
  assert.deepEqual(why({ ...record("absent.json", {}), record: join(T, "none.json") }), ["record absent"]);
  assert.deepEqual(why(record("role.json", { role: "G2" })), ["role G2 != gate G7"]);
  assert.deepEqual(why(record("head.json", { tree: { head: C1, dirty: null } })), [`tree.head ${C1} != commit`]);
  assert.deepEqual(why(record("early.json", { start: "2026-01-02T00:29:59Z" })), ["start 2026-01-02T00:29:59Z before the commit date"]);
  assert.deepEqual(why({ ...record("sha.json", {}), sha256: "0".repeat(64) }), ["sha256 != oracle.sha256"]);
  const copied = ["a field copied into the entry != the record"];
  assert.deepEqual([{ tests_total: 99 }, { start: "2026-01-02T02:31:00Z" }, { served_from: { file: "x.json", sha256: "0".repeat(64) } }].map((p, i) => why({ ...record(`copy${String(i)}.json`, {}), ...p })), [copied, copied, copied]);
  assert.deepEqual(why(record("clean.json", {})), []);
});

// killer: scripts/journal/index.mjs:251 CONST "r.static_only !== false || " -> ""
test("J-ORACLE: a record of a static-only run, of a dirty tree, red, incomplete or of another schema; REQUIRED is the list of scripts/oracle/run.mjs", () => {
  const not = (s: string, d: string, e: string): string[] => [`static_only ${s}, tree.dirty ${d}, exit ${e}: not a full, clean, green run`];
  assert.deepEqual(why(record("static.json", { static_only: true })), not("true", "null", "0"));
  // killer: scripts/journal/index.mjs:251 CONST "r.tree?.dirty !== null || " -> ""
  assert.deepEqual(why(record("dirty.json", { tree: { dirty: "f".repeat(64) } })), not("false", "f".repeat(64), "0"));
  // killer: scripts/journal/index.mjs:251 CONST " || r.exit !== 0" -> ""
  assert.deepEqual(why(record("exit1.json", { exit: 1 })), not("false", "null", "1"));
  // killer: scripts/journal/index.mjs:246 ROR "miss.length > 0" -> "miss.length > 99"
  assert.deepEqual([{ cv4: undefined, pid: 0 }, { schema: "monark.oracle.v0" }, { tree: { object: null } }].map((p, i) => why(record(`incomplete${String(i)}.json`, p))), ["cv4, pid", "schema", "tree.object"].map((m) => [`incomplete record (missing or invalid: ${m})`]));
  // killer: scripts/journal/index.mjs:93 CONST "\"cv4\", " -> ""
  assert.deepEqual([required("scripts/journal/index.mjs"), Array.isArray(required("scripts/oracle/run.mjs"))], [required("scripts/oracle/run.mjs"), true]);
});

// killer: scripts/journal/index.mjs:307 CONST " || (e.oracle !== null && PRE_GEL.includes(e.gate))" -> ""
test("J-ORACLE at G1 and corr (a run before the gel): a record absent, of another sha or role, incomplete, static-only, red or miscopied reddens; a dirty tree or a served record (read: PRE-GEL-BIND) is admitted", () => {
  const pre = (n: number, name: string, patch: Entry, copy: Entry = {}): string[] => why({ ...record(name, { role: n === 3 ? "G1" : "corr", ...patch, tree: { head: C1, ...(patch.tree as Entry | undefined) } }), ...copy }, n); // at C1 = recu_head (M-5b)
  assert.deepEqual([pre(5, "c-sha.json", {}, { sha256: "0".repeat(64) }), pre(5, "c-absent.json", {}, { record: join(T, "none.json") }), pre(5, "c-copy.json", {}, { tests_total: 99 }), pre(5, "c-role.json", { role: "G2" }), pre(3, "g-static.json", { static_only: true }), pre(5, "c-exit.json", { exit: 1 }), pre(3, "g-cv4.json", { cv4: undefined }), pre(5, "c-crole.json", {}, { role: "G1" }), pre(5, "c-chead.json", {}, { head: C2 }), pre(3, "g-cstart.json", {}, { start: "2026-01-02T02:31:00Z" }), pre(5, "c-cserved.json", { served_from: { file: "x.json", sha256: "0".repeat(64) }, tests: null }, { served_from: { file: "y.json", sha256: "0".repeat(64) } })],
    [["sha256 != oracle.sha256"], ["record absent"], ["a field copied into the entry != the record"], ["role G2 != gate corr"], ["static_only true, tree.dirty null, exit 0: not a full, green run"], ["static_only false, tree.dirty null, exit 1: not a full, green run"], ["incomplete record (missing or invalid: cv4)"], ...Array<string[]>(4).fill(["a field copied into the entry != the record"])]); // copied role, head, start, served_from at G1 and corr (C-G2-15: kills A04-A08)
  // killer: scripts/journal/index.mjs:241 CONST "gel = ORACLED.includes(e.gate)" -> "gel = true"
  assert.deepEqual([pre(5, "c-dirty.json", { tree: { dirty: "f".repeat(64) } }), pre(3, "g-dirty.json", { tree: { dirty: "f".repeat(64) } }), pre(5, "c-served.json", { served_from: { file: "x.json", sha256: "0".repeat(64) }, tests: null })], [[], [], ["served_from.file x.json: the served record is absent or unreadable"]]);
});

// killer: scripts/journal/index.mjs:255 CONST "o.head !== m.recu_head" -> "false"
test("PRE-GEL-BIND: a G1 or corr citation is bound to its launch (head = mission.recu_head, start >= recu_date); a served record is read, its sha256 and head checked; absent: red, never skipped (C-G2-16)", () => {
  const cite = (n: number, name: string, patch: Entry): string[] => why(record(name, { role: n === 3 ? "G1" : "corr", ...patch, tree: { head: C1, ...(patch.tree as Entry | undefined) } }), n);
  const [srv, srv2] = [C1, C2].map((head, i) => record(`b-srv${String(i)}.json`, { role: "corr", tree: { head } })), served = (name: string, file: string, sha256: unknown): string[] => cite(5, name, { served_from: { file, sha256 }, tests: null });
  assert.deepEqual([cite(5, "b-head.json", { tree: { head: C2 } }), cite(3, "b-start.json", { start: "2026-01-01T00:44:59Z" })],
    [[`head ${C2} != mission.recu_head ${C1}: a run of another tree`], ["start 2026-01-01T00:44:59Z before mission.recu_date 2026-01-01T00:45:00Z"]]);
  // killer: scripts/journal/index.mjs:258 CONST "sf !== null && sb === null" -> "false"
  assert.deepEqual([served("b-ok.json", "b-srv0.json", srv?.sha256), served("b-gone.json", "gone.json", srv?.sha256), served("b-sha.json", "b-srv0.json", "0".repeat(64)), served("b-shead.json", "b-srv1.json", srv2?.sha256)],
    [[], ["served_from.file gone.json: the served record is absent or unreadable"], ["served record b-srv0.json: sha256 != served_from.sha256"], [`served record b-srv1.json: tree.head ${C2} != head ${C1}`]]);
});

// killer: scripts/journal/index.mjs:310 SDL "h(\"J-RECU\"" -> ""
test("J-RECU: a mission edited on disk after its receipt, a receipt of another text, a mission file absent", () => {
  const [edited] = file("edited.md", `${readFileSync(join(FX, "mission.md"), "utf8")}Edited after the launch.\n`);
  assert.deepEqual(build({ "M-X": [x(3, { mission: { ...M, path: edited } })] }).codes, ["J-RECU"]);
  assert.deepEqual(build({ "M-X": [x(3, { mission: { ...M, recu_sha: "0".repeat(64), recu_date: "2026-01-01T00:45:00Z" } })] }).codes, ["J-RECU"]);
  assert.deepEqual(build({ "M-X": [x(3, { mission: { ...M, path: join(T, "none.md") } })] }).codes, ["J-LINT", "J-RECU"]);
});

// killer: scripts/journal/index.mjs:311 CONST "repo, rev })" -> "repo, rev: e.commit })"
test("J-LINT: a green receipt on a text the linter replayed at the entry's commit, else at the receipt's head, reddens (a TODO; a path absent there); never on disk", () => {
  const [todo, s1] = file("todo.md", `${readFileSync(join(FX, "mission.md"), "utf8")}Size TODO.\n`);
  const [later, s2] = file("later.md", `${readFileSync(join(FX, "mission.md"), "utf8")}Read \`docs/b.md\`.\n`);
  const [disk, s3] = file("disk.md", `${readFileSync(join(FX, "mission.md"), "utf8")}Read \`docs/journal/M-X.jsonl\`.\n`);
  assert.deepEqual(build({ "M-X": [x(3, { mission: { ...M, path: todo, sha: s1, recu_sha: s1 } })] }).codes, ["J-LINT"]);
  assert.deepEqual(build({ "M-X": [x(3, { mission: { ...M, path: todo } })] }).codes, ["J-LINT", "J-RECU"]);
  const at = (n: number, path = later, s = s2, head = C1): Entry => x(n, { mission: { ...M, path, sha: s, recu_sha: s, recu_head: head } });
  const codes = (...e: Entry[]): string[] => build({ "M-X": e }).codes;
  assert.deepEqual([codes(at(4)), codes(at(6)), codes(at(3)), codes(at(3, later, s2, C2)), codes(at(3, String(M.path), String(M.sha), "0".repeat(40)))], [["J-LINT"], ["J-ORDER"], ["J-LINT"], [], ["J-LINT"]]); // a lone cp-2 ACCEPTE: J-ORDER (M-5b)
  assert.deepEqual([3, 4, 5, 6].map((n) => codes(at(n, disk, s3))), [["J-LINT"], ["J-LINT"], ["J-LINT"], ["J-LINT", "J-ORDER"]]); // docs/journal/ is on disk only
  assert.deepEqual(build({ "M-X": [at(4), at(6)] }).hits.map((h) => h.split(" ").slice(0, 2).join(" ")), ["J-LINT M-X:1"]); // one text at two commits
  assert.deepEqual(build({ "M-X": [at(3, later, s2, C2), at(3, todo, s1, C2)] }).hits.map((h) => h.split(" ").slice(0, 2).join(" ")), ["J-LINT M-X:2"]); // two texts at one revision (C-G2-13: kills R4)
});

// killer: scripts/journal/index.mjs:317 COR " && !/^[\\w-]/.test(e.model_resolved.slice(e.tier.length))" -> ""
test("J-MODEL: a tier outside TIERS, a model of another tier or a longer id (prefix trap), an agent entry without its model", () => {
  const codes = (tier: string | null, model: string | null): string[] => build({ "M-X": [x(3, { tier, model_resolved: model })] }).codes;
  assert.deepEqual([codes("claude-opus-5", "claude-opus-5[1m]"), codes("claude-opus-5-5", "claude-sonnet-5"), codes("claude-sonnet-5", "claude-sonnet-5-5"), codes(null, null)], [["J-MODEL"], ["J-MODEL"], ["J-MODEL"], ["J-MODEL"]]);
  assert.deepEqual(codes("claude-sonnet-5", "claude-sonnet-5"), []);
});

// killer: scripts/journal/index.mjs:318 SDL "h(\"J-ADJ\"" -> ""
test("J-ADJ: a G7 whose adjudication is blank; its presence is checked, never its nature", () => {
  assert.deepEqual(build({ "M-X": [x(7, { adjudication: " " })] }).codes, ["J-ADJ"]);
  assert.deepEqual(build({ "M-X": [x(7, { adjudication: "x" })] }).codes, []);
});

// killer: scripts/journal/index.mjs:326 CONST "!OK.includes(w.e.verdict)" -> "false"
test("J-ORDER: a cp-2 or G7 acceptance needs, as the nearest G2 or cp-2 line with a verdict above it in the FILE, an acceptance at its commit or an ancestor; the shape of M-5.jsonl is green", () => {
  const order = (...rows: Entry[]): string[] => build({ "M-Z": rows }).hits.filter((h) => h.startsWith("J-ORDER "));
  const [c2, c3] = [C2.slice(0, 12), C3.slice(0, 12)], bis = `J-ORDER M-Z:4 cp-2 ACCEPTE-AVEC-CORRECTIONS at ${c2}`;
  assert.deepEqual(build({ "M-Z": Z }).codes, []); // REFUS at C1 lifted by the G2 re-review at C1 (same second), cp-2 bis at C2 (a descendant), G7 at C2
  assert.deepEqual([order(z(1), z(3), z(2), z(4), z(5)), order(z(4), z(5)), order(z(1), z(2), z(3, { commit: C3 }), z(4), z(5))], [[`${bis}: the nearest reviewed line above (3, cp-2 REFUS) is not an acceptance`],
    [`J-ORDER M-Z:1 cp-2 ACCEPTE-AVEC-CORRECTIONS at ${c2}: no G2 or cp-2 line with a verdict above it`], [`${bis}: the commit ${c3} of line 3 is neither this commit nor an ancestor`]]); // 2/3 swapped (same second: J-TIME blind, cp-2 bis P10); no witness; C3 is a child of C2
  assert.deepEqual(order(z(3, { date: "2026-01-01T03:00:00Z" }), z(2, { date: "2026-01-01T02:30:00Z" }), z(4), z(5)), [`J-ORDER M-Z:3 cp-2 ACCEPTE-AVEC-CORRECTIONS at ${c2}: the nearest reviewed line above (2, cp-2 REFUS) is not an acceptance`]); // the file, never the date
  // killer: scripts/journal/index.mjs:323 CONST "x.e.verdict !== \"ESCALADE\"" -> "true"
  assert.deepEqual(build({ "M-Z": [z(1), z(2), z(3), z(2, { verdict: "ESCALADE", corrections: null }), z(4), z(5)] }).codes, []); // ESCALADE: transparent, neither witness nor target
  // killer: scripts/journal/index.mjs:322 CONST "entries.some((x) => REVIEWED.includes(x.e.gate))" -> "true"
  assert.deepEqual(build({ "M-Z": [z(5, { verdict: "ACCEPTE-AVEC-CORRECTIONS", corrections: null })] }).codes, []); // one retro G7 line (M-3, M-4, M-8): not read
});

// killer: scripts/journal/index.mjs:330 SDL "hit(\"J-VERDICT\"" -> ""
test("J-VERDICT: ACCEPTE with a blocking correction, ACCEPTE-AVEC-CORRECTIONS, CORRECTIONS-D-ABORD or REFUS at 0/0, CORRECTIONS-D-ABORD without a blocking one, a verdict with corrections null; ESCALADE has no rule", () => {
  const verdict = (n: number, patch: Entry): string[] => build({ "M-Z": Z.map((e, i) => (i === n - 1 ? { ...e, ...patch } : e)) }).hits.filter((h) => h.startsWith("J-VERDICT "));
  const c = (blocking: number, nonblocking: number): Entry => ({ corrections: { blocking, nonblocking } }), CDA = "CORRECTIONS-D-ABORD";
  assert.deepEqual([verdict(1, c(1, 0)), verdict(4, c(0, 0)), verdict(1, { verdict: CDA, ...c(0, 0) }), verdict(1, { verdict: CDA, ...c(0, 2) }), verdict(2, c(0, 0)), verdict(5, { corrections: null })],
    [["J-VERDICT M-Z:1 ACCEPTE with 1 blocking correction(s)"], ["J-VERDICT M-Z:4 ACCEPTE-AVEC-CORRECTIONS with no correction (0/0)"], [`J-VERDICT M-Z:1 ${CDA} with no correction (0/0)`],
      [`J-VERDICT M-Z:1 ${CDA} without a blocking correction (0/2)`], ["J-VERDICT M-Z:2 REFUS with no correction (0/0)"], ["J-VERDICT M-Z:5 ACCEPTE with corrections null"]]);
  assert.deepEqual([verdict(1, { verdict: CDA, ...c(1, 0) }), verdict(2, { verdict: "ESCALADE", corrections: null })], [[], []]); // coherent; ESCALADE: no rule (declared)
});

// killer: scripts/journal/index.mjs:147 CONST "off.has(h.extract)" -> "true"
test("LINT-UNTRACKED: replayed at recu_head, an R-PATH hit on a path that the generated header lists as (non suivi) is removed; another absent path, or the same list without a stamp line, stays red", () => {
  const g = generated(), line = (path: string, s: string): Entry => x(3, { mission: { path, sha: s, recu_sha: s, recu_date: g.recu.date, recu_head: g.recu.head } });
  const [[other, s2], [bare, s3]] = [file("gen-other.md", `${g.text}Read \`docs/absent.md\`.\n`), file("gen-bare.md", g.text.replace(/^G\u00e9n\u00e9r\u00e9 :.*\n/mu, ""))];
  assert.deepEqual([build({ "M-X": [line(g.mission, sha(g.text))] }, g.dir).codes, build({ "M-X": [line(other, s2)] }, g.dir).hits], [[], [`J-LINT M-X:1 gen-other.md replayed at ${String(g.recu.head)}: R-PATH`]]);
  // killer: scripts/journal/index.mjs:142 CONST "lines.some((l) => l.startsWith(STAMP_FIELD))" -> "true"
  const listed = g.text.split("\n").filter((l) => l.includes("` (non suivi) `")).map(() => "R-PATH").join(",");
  assert.deepEqual(build({ "M-X": [line(bare, s3)] }, g.dir).hits, [`J-LINT M-X:1 gen-bare.md replayed at ${String(g.recu.head)}: ${listed}`]); // no stamp line: not a generated header
});

// killer: scripts/journal/index.mjs:179 CONST "e.tier = tier ?? o.tier" -> "e.tier = o.tier"
test("TIER-FROM-HEADER: add --from-recu takes the tier from the Palier field of a generated or hand-written mission; --tier different, or no field and no --tier, exits 2 and writes nothing", () => {
  generated();
  const r = repo(), out = join(r, "docs", "journal", "M-Z.jsonl"), [hand] = file("palier.md", `# Mission fixture\nPalier : \`claude-opus-5-5\`\nBase \`${C1}\`.\n`);
  const recu = (name: string, mission: string, s: string): string => file(name, JSON.stringify({ sha: s, verdict: "vert", date: "2026-01-01T00:45:00Z", mission, head: C1 }))[0];
  const [gr, hr, nr] = [join(T, "gen.recu.json"), recu("palier.recu.json", hand, sha(readFileSync(hand))), recu("none.recu.json", join(FX, "mission.md"), String(M.sha))];
  const add = (from: string, ...tier: string[]): string => { const p = cli("add", "--repo", r, "--lot", "M-Z", "--gate", "G1", "--from-recu", from, "--model", "claude-opus-5-5", ...tier); return p.status === 0 ? `tier ${String((JSON.parse(p.stdout) as Entry).tier)}` : `exit ${String(p.status)} ${p.stderr.trim()}`; };
  const differ = (to: string): string => `exit 2 journal: --from-recu: Palier claude-opus-5-5 of the mission, --tier ${to}: they differ (TIER-FROM-HEADER)`;
  assert.deepEqual([add(gr, "--tier", "claude-sonnet-5-5"), add(hr, "--tier", "claude-fable-5-1"), add(nr), existsSync(out)], [differ("claude-sonnet-5-5"), differ("claude-fable-5-1"), "exit 2 journal: --from-recu: Palier absent of the mission, --tier absent: no tier (TIER-FROM-HEADER)", false]);
  assert.deepEqual([add(gr), add(hr), add(gr, "--tier", "claude-opus-5-5"), add(nr, "--tier", "claude-opus-5-5"), readFileSync(out, "utf8").split("\n").length], ["tier claude-opus-5-5", "tier claude-opus-5-5", "tier claude-opus-5-5", "tier claude-opus-5-5", 5]);
});

// killer: scripts/journal/index.mjs:234 CONST "`${g[1]}^{commit}:scripts/mission/gen.mjs`" -> "`${m.recu_head}^{commit}:scripts/mission/gen.mjs`"
test("J-HEADER: the real form (a mission of gen.mjs, add --from-recu) is green; its HEAD line not recu_head, a stamp sha256 that is not the blob of gen.mjs at the stamp's revision, an unresolvable revision, a stamp without sha256 (earlier format) redden; no stamp line: not read", () => {
  const g = generated(), p = cli("add", "--repo", repo({}, g.dir), "--lot", "M-Z", "--gate", "G1", "--from-recu", join(T, "gen.recu.json"), "--model", "claude-opus-5-5");
  const e = ((): Entry => { try { return v1(JSON.parse(p.stdout) as Entry); } catch { return x(3); } })(), [G8, W] = [g.G.slice(0, 8), String(g.recu.head)]; // read as v1 (M-5c): the edits below forge missions on disk
  assert.deepEqual(build({ "M-Z": [e] }, g.dir).codes, []); // generator at G, --repo at its child W that edits gen.mjs: the stamp names G (cp-1 bis R6); docs/new.md untracked; tier from Palier
  const edit = (name: string, f: (s: string) => string): string[] => { const [path, s] = file(name, f(g.text)); return build({ "M-Z": [{ ...e, mission: { ...(e.mission as Entry), path, sha: s, recu_sha: s } }] }, g.dir).hits.filter((h) => h.startsWith("J-HEADER ")); };
  const stamp = (f: (l: string) => string) => (t: string): string => t.replace(/^G\u00e9n\u00e9r\u00e9 :.*$/mu, f), old = "G\u00e9n\u00e9r\u00e9 : scripts/mission/gen.mjs 2026-09-28T19:32:58Z"; // the form of mission-g2-m2b.md
  assert.deepEqual([edit("h-head.md", (t) => t.replace(/^HEAD `[0-9a-f]+`$/mu, `HEAD \`${g.G}\``)), edit("h-sha.md", stamp((l) => l.replace(/sha256 `[0-9a-f]{64}`/u, `sha256 \`${"0".repeat(64)}\``))),
    edit("h-rev.md", stamp((l) => l.replace(`\`${G8}\``, "`00000000`"))), edit("h-old.md", stamp(() => old)), edit("h-none.md", (t) => t.replace(/^G\u00e9n\u00e9r\u00e9 :.*\n/mu, ""))],
  [[`J-HEADER M-Z:1 h-head.md: HEAD ${g.G} of the header != mission.recu_head ${W}`], [`J-HEADER M-Z:1 h-sha.md: gen.mjs sha256 000000000000 != the blob at ${G8} (${sha(readFileSync(join(ROOT, "scripts", "mission", "gen.mjs"))).slice(0, 12)})`],
    ["J-HEADER M-Z:1 h-rev.md: no blob scripts/mission/gen.mjs at 00000000 in --repo (revision unresolvable)"], [`J-HEADER M-Z:1 h-old.md: a stamp line without sha256 (earlier format): ${old}`], []]);
});

// killer: scripts/journal/index.mjs:241 CONST "e.schema === V2 ? fact(o.sha256)" -> "e.schema !== V2 ? fact(o.sha256)"
test("facts_roundtrip_green_on_clone: add archives the five facts of a cp-2 line under refs/journal/facts; a clone --no-local that fetches refs/journal/* builds green with every host file deleted (M-5c (A), CA-11)", () => {
  const { r, mission, at } = v2(), rp = proof("rt.json", C2, [["F2P"]], KILL3), e = at("cp-2", "--from-redproof", rp), c = join(T, `c${String(++seq)}`);
  assert.equal(typeof e, "object", JSON.stringify(e));
  gd(r, ["add", "docs/journal"]); gd(r, ["commit", "-q", "-m", "journal"]); gd(T, ["clone", "-q", "--no-local", r, c]); gd(c, ["fetch", "-q", "origin", "+refs/journal/*:refs/journal/*"]);
  for (const f of [mission, mission.replace(/\.md$/, ".recu.json"), rp, join(r, "test", "fixtures", "journal", "oracle-cp-2.json")]) rmSync(f);
  const names = gd(c, ["ls-tree", "--name-only", "refs/journal/facts"]).split(NL), f = (e as Entry).facts as Entry;
  assert.deepEqual([names.length, [f.recu, f.lint].every((s) => names.includes(String(s))), cli("build", "--repo", c).status], [5, true, 0]);
});

// killer: scripts/journal/index.mjs:403 CONST "hash(b) === sha256 ?" -> "true ?"
test("facts_sha_mismatch_red: the archived mission replaced by another blob under the same name reddens the v2 line archive corrupt; the sane mission file on the host is never read (FM-3.2)", () => {
  const { r, mission, name, at } = v2(), ms = String(((at("G1") as Entry).mission as Entry | null)?.sha);
  graft(r, ms, "another text\n");
  assert.deepEqual([sha(readFileSync(mission)) === ms, build({}, r).hits], [true, [`J-RECU M-Z:1 ${name}: mission archive corrupt`]]);
});

// killer: scripts/journal/index.mjs:344 SDL "if (help) console.error(" -> ""
test("facts_absent_red: refs/journal/facts deleted, the v2 line is red archive absent for each fact (its oracle record and RED-PROOF present on the host are never read) and build prints the fetch line on stderr; the v1 line next to it stays green", () => {
  const { r, name, at } = v2(), o = record("g1-absent.json", { role: "G1", start: "2099-01-01T00:00:00Z", tree: { head: C2, dirty: null } });
  assert.equal(typeof at("G1", "--from-oracle", String(o.record), "--from-redproof", proof("g1-absent-rp.json", C2, [["F2P"]], null)), "object");
  gd(r, ["update-ref", "-d", "refs/journal/facts"]);
  const p = cli("build", "--repo", repo({ "M-X": [x(3)] }, r), "--json"), hits = ((): string[] => { try { return (JSON.parse(p.stdout) as { hits: Hit[] }).hits.map((h) => `${h.code} ${h.lot}:${String(h.line)} ${h.extract}`); } catch { return [p.stdout]; } })();
  assert.deepEqual([hits, p.stderr.trim()], [["J-ORACLE M-Z:1 g1-absent.json: record archive absent", "J-FACTS M-Z:1 archive absent: refs/journal/facts absent from --repo", `J-RECU M-Z:1 ${name}: mission archive absent`,
    `J-LINT M-Z:1 ${name}: lint record archive absent`, "J-REDPROOF M-Z:1 RED-PROOF archive absent"], "archive: ref absent from --repo, fetch expected: git fetch origin '+refs/journal/*:refs/journal/*'"]);
});

// killer: scripts/journal/index.mjs:277 CONST "verdict = r?.verdict" -> "verdict = unlisted(lintMission({ text: String(fact(m.sha).bytes), missionPath: at(m.path), repo, rev }), String(fact(m.sha).bytes)).verdict"
test("facts_branch_deleted_stays_green: J-LINT frozen at add: a mission citing a lot branch deleted after add; its v2 line stays green, its v1 reading is red R-BRANCH (the rr2 fact falls)", () => {
  const { r, name, at } = v2("Branch `lot/x`.\n", NL, (d) => gd(d, ["branch", "lot/x", C1])), e = at("G1");
  assert.equal(typeof e, "object", JSON.stringify(e));
  gd(r, ["branch", "-D", "lot/x"]);
  assert.deepEqual(build({ "M-Z": [e as Entry, v1(e as Entry)] }, r).hits, [`J-LINT M-Z:2 ${name} replayed at ${C2}: R-BRANCH`]);
});

// killer: scripts/journal/index.mjs:393 CONST "\"--no-filters\", \"--stdin\"" -> "\"--path=m.md\", \"--stdin\""
test("facts_crlf_bytes: under core.autocrlf=true a mission with CRLF line ends and non-ASCII bytes is archived byte for byte: the blob renders the bytes whose sha256 is its name, and the line is green", () => {
  const { r, mission, at } = v2(`${String.fromCharCode(0xc9, 0x74, 0xe9)} CRLF.\n`, CRLF, (d) => gd(d, ["config", "core.autocrlf", "true"])), ms = String(((at("G1") as Entry).mission as Entry | null)?.sha);
  const blob = spawnSync("git", ["-C", r, "cat-file", "-p", `refs/journal/facts:${ms}`], { env: ENV }).stdout;
  assert.deepEqual([readFileSync(mission).includes(CRLF), sha(readFileSync(mission)), sha(blob), build({}, r).codes], [true, ms, ms, []]);
});

// killer: scripts/journal/index.mjs:265 CONST "t !== null && ancestor(e.facts.commit, t)" -> "t !== null"
test("facts_ref_rewound_red: refs/journal/facts moved back to the parent of a line's archive commit (the same tree: two adds of the same facts) reddens that line archive rewritten; the line before stays green", () => {
  const { r, at } = v2(), [f1 = "", f2 = ""] = [at("G1"), at("G1")].map((e) => String(((e as Entry).facts as Entry | null)?.commit));
  gd(r, ["update-ref", "refs/journal/facts", f1]);
  assert.deepEqual([gd(r, ["rev-parse", `${f2}^{tree}`]) === gd(r, ["rev-parse", `${f1}^{tree}`]), build({}, r).hits],
    [true, [`J-FACTS M-Z:2 archive rewritten: facts.commit ${f2.slice(0, 12)} is neither the tip ${f1.slice(0, 12)} nor an ancestor of it`]]);
});

// killer: scripts/journal/index.mjs:395 CONST "g([\"update-ref\", FACTS_REF," -> "g([\"update-ref\", \"refs/heads/journal-facts\","
test("facts_r25_unchanged: add archives out of the tree: HEAD, git diff --shortstat (worktree and base...HEAD), the branch list and git status beyond the journal file are unchanged; the one new ref is refs/journal/facts", () => {
  const { r, at } = v2(), state = (): string[] => [gd(r, ["rev-parse", "HEAD"]), gd(r, ["diff", "--shortstat"]), gd(r, ["diff", "--shortstat", `${C1}...HEAD`]), gd(r, ["branch", "--list"]), gd(r, ["status", "--porcelain"]).split(NL).filter((l) => !l.includes("docs/")).join(NL)];
  const before = state(), e = at("G1");
  assert.deepEqual([typeof e, state(), gd(r, ["for-each-ref", "--format=%(refname)"])], ["object", before, `refs/heads/main${NL}refs/journal/facts`]);
});

// killer: scripts/journal/index.mjs:293 CONST "d.f2p + d.pins !== d.judged" -> "false"
test("redproof_roundtrip: add --from-redproof copies base, head, digest and derives the counts of a synthesized red-proof-v1 (the shape of cp-2 M-5b: 11 judged, 9 F2P, 2 pins, ok false, 3 of 3 killed: green); a copied field forged, f2p + pins != judged, killed != drawn, ok false without a pin, a proof of another tree, a base not an ancestor or != the Base tronc line redden J-REDPROOF", () => {
  const { r, at } = v2(`Base tronc \`${C1.slice(0, 8)}\` (${C1})\n`), one = [["F2P"]], c12 = (s: string): string => s.slice(0, 12);
  const cp2 = (n: string, head: string, rows: string[][], outcomes = KILL3, patch: Entry = {}): Entry | string => at("cp-2", "--from-redproof", proof(`${n}.json`, head, rows, outcomes, patch));
  const e = cp2("m5b", C2, [...Array<string[]>(8).fill(["F2P"]), ["new-module", "the base cannot load x"], ["refused", GAB], ["refused", GAB]], KILL3, { ok: false });
  assert.equal(typeof e, "object", JSON.stringify(e));
  cp2("other", C2, [["F2P"], ["refused", "not green at gel (other-fail)"]]); cp2("stillborn", C2, one, ["killed", "killed", "stillborn"]); cp2("nopin", C2, one, KILL3, { ok: false });
  cp2("tree", C1, one); cp2("base", C2, one, KILL3, { base: C3 }); cp2("tronc", C2, one, KILL3, { base: C2 });
  const bad = at("cp-2", "--from-redproof", join(r, "test", "fixtures", "journal", "oracle-G7.json")), rp = (e as Entry).redproof as Entry, v0 = readFileSync(String(rp.record), "utf8").replace("red-proof-v1", "red-proof-v0");
  graft(r, sha(v0), v0);
  const rows = lines(r), forged = [{ ...rows[0], redproof: { ...rp, f2p: 10 } }, { ...rows[0], redproof: { ...rp, sha256: sha(v0) } }];
  assert.deepEqual([{ ...rp, record: 0, sha256: 0 }, rp.sha256 === sha(readFileSync(String(rp.record))), typeof bad === "string" && bad.endsWith(": not a red-proof-v1 record"), build({ "M-Z": [...forged, ...rows] }, r).hits], [{ record: 0, sha256: 0, base: C1, head: C2, digest: "d".repeat(64), judged: 11, f2p: 9, pins: 2, drawn: 3, killed: 3, ok: false }, true, true, ["J-REDPROOF M-Z:1 a field copied != its derivation (f2p)", "J-REDPROOF M-Z:2 RED-PROOF not JSON or schema red-proof-v0 != red-proof-v1",
    "J-REDPROOF M-Z:4 f2p 1 + pins 0 != judged 2", "J-REDPROOF M-Z:5 killed 2 != drawn 3", "J-REDPROOF M-Z:6 ok false with 0 pin(s)",
    `J-REDPROOF M-Z:7 head ${c12(C1)} != commit ${c12(C2)}: a proof of another tree`, `J-REDPROOF M-Z:8 base ${c12(C3)} is not an ancestor of head ${c12(C2)} in --repo`, `J-REDPROOF M-Z:9 base ${c12(C2)} != the Base tronc line of the mission (${c12(C1)})`]]);
});

// killer: scripts/journal/index.mjs:296 CONST "(d.requested < 3 || d.drawn < 3)" -> "false"
test("redproof_draw_required: at cp-2 of origin add, a red-proof without a draw (draw null), a draw of 2, or no red-proof at all reddens (CA-13 draw absent, F2P proof absent); the record without a draw cited at G1 is green (the G1 does not draw)", () => {
  const { r, at } = v2(), one = [["F2P"]];
  const y = [at("cp-2", "--from-redproof", proof("nodraw.json", C2, one, null)), at("cp-2", "--from-redproof", proof("two.json", C2, one, ["killed", "killed"])), at("cp-2"), at("G1", "--from-redproof", proof("g1.json", C2, one, null))];
  assert.deepEqual([y.map((e) => typeof e), build({}, r).hits], [Array<string>(4).fill("object"), ["J-REDPROOF M-Z:1 draw of 0 requested, 0 drawn at cp-2: CA-13 draw absent",
    "J-REDPROOF M-Z:2 draw of 2 requested, 2 drawn at cp-2: CA-13 draw absent", "J-REDPROOF M-Z:3 no red-proof at cp-2 of origin add (F2P proof absent)"]]);
});

// killer: scripts/journal/index.mjs:411 CONST "Object.hasOwn(Object(r), \"pins\") || " -> ""
test("redproof_pin_transition: before M-4b (no pin vocabulary) two rows refused green at base count as pins and ok false is admitted; with the PIN-1 vocabulary (a pins count, a pinned field or a pin row) pins are the pin rows only and ok false reddens", () => {
  const { r, at } = v2(), pin = ["pin", "green at base: pins test/t.test.ts:1 (x present at base), killer killed", "true"], fail = ["refused", `${GAB} (killer survived)`];
  const cp2 = (n: string, rows: string[][], patch: Entry): Entry | string => at("cp-2", "--from-redproof", proof(`${n}.json`, C2, rows, KILL3, patch));
  // killer: scripts/journal/index.mjs:411 CONST " || Object.hasOwn(Object(t), \"pinned\")" -> ""
  const y = [cp2("before", [["F2P"], ["refused", GAB], ["refused", GAB]], { ok: false }), cp2("after", [["F2P"], pin, pin], { pins: 2 }), cp2("after-ok-false", [["F2P"], pin], { pins: 1, ok: false }),
    cp2("pins-key", [["F2P"], fail], { pins: 0, ok: false }), cp2("pinned", [["F2P"], [...fail, "false"]], { ok: false }), cp2("pin-row", [["F2P"], ["pin", "x"]], { ok: false })];
  // killer: scripts/journal/index.mjs:411 CONST "is(t, \"pin\") || Object" -> "Object"
  assert.deepEqual([y.map((e) => typeof e), build({}, r).hits], [Array<string>(6).fill("object"), ["J-REDPROOF M-Z:3 ok false with 1 pin(s) (PIN-1 vocabulary: ok true required)",
    "J-REDPROOF M-Z:4 f2p 1 + pins 0 != judged 2", "J-REDPROOF M-Z:5 f2p 1 + pins 0 != judged 2", "J-REDPROOF M-Z:6 ok false with 1 pin(s) (PIN-1 vocabulary: ok true required)"]]);
});

// killer: scripts/journal/index.mjs:309 CONST "const v2 = e.schema === V2," -> "const v2 = true,"
test("v1_real_lines_read_as_v1: the v1 lines of the real journal (docs/journal: 21 at M-5c) copied into a throwaway repo without an archive are read as v1: no J-SCHEMA, J-FACTS or J-REDPROOF hit (a v1 line never needs the archive, FM-1.3)", () => {
  const dir = join(ROOT, "docs", "journal"), real = Object.fromEntries(readdirSync(dir).filter((f) => f.endsWith(".jsonl")).map((f) => [f.slice(0, -6), readFileSync(join(dir, f), "utf8").split(NL).filter((l) => l.includes("\"schema\":\"monark.journal.v1\""))] as const).filter(([, v]) => v.length > 0));
  const p = cli("build", "--repo", repo(real), "--json"), j = ((): { counts?: Record<string, number>; entries?: number } => { try { return JSON.parse(p.stdout) as { counts?: Record<string, number>; entries?: number }; } catch { return {}; } })(), n = Object.values(real).flat().length;
  assert.deepEqual([n >= 21, j.entries, j.counts?.["J-SCHEMA"], j.counts?.["J-FACTS"], j.counts?.["J-REDPROOF"]], [true, n, 0, 0, 0]);
});

// killer: scripts/journal/index.mjs:154 CONST "e.schema === V2 ? FIELDS_V2 : FIELDS_V1" -> "FIELDS_V1"
test("schema_v2_strict: J-SCHEMA per version: a v2 line missing facts or redproof, with an unknown field, facts null while a fact is cited, facts or redproof out of domain; a v1 line carrying facts; add without a fact writes facts null and no archive commit", () => {
  const w = (n: number, patch: Entry = {}): Entry => ({ ...x(n), schema: "monark.journal.v2", facts: null, redproof: null, ...patch }), drop = (k: string): Entry => Object.fromEntries(Object.entries(w(1)).filter(([f]) => f !== k));
  const b = build({ "M-X": [w(1), drop("facts"), drop("redproof"), w(1, { extra: 1 }), w(3), w(1, { facts: { commit: C1, origin: "copy", recu: null, lint: null } }), w(1, { redproof: {}, facts: { commit: C1, origin: "add", recu: null, lint: null } }), x(1, { facts: null })] });
  // killer: scripts/journal/index.mjs:199 CONST "if (facts.length > 0) e.facts =" -> "if (facts.length >= 0) e.facts ="
  const r = repo(), e = added(r, "--lot", "M-Z", "--gate", "G0", "--note", "no fact");
  assert.deepEqual([b.hits, (e as Entry).schema, (e as Entry).facts, gd(r, ["for-each-ref", "refs/journal"])], [["J-SCHEMA M-X:2 missing field facts", "J-SCHEMA M-X:3 missing field redproof", "J-SCHEMA M-X:4 unknown field extra",
    "J-SCHEMA M-X:5 facts null while mission, oracle or redproof is cited", "J-SCHEMA M-X:6 facts out of domain", "J-SCHEMA M-X:7 redproof out of domain", "J-SCHEMA M-X:8 unknown field facts"], "monark.journal.v2", null, ""]);
});

// killer: scripts/journal/index.mjs:395 CONST "commit, tip ?? \"\"]" -> "commit]"
test("facts_cas_moved_tip: archiveFacts moves refs/journal/facts by compare-and-swap: given a tip the ref has left, it throws and the ref stays where the other writer put it", () => {
  const r = repo(), code = [`import { archiveFacts } from ${JSON.stringify(pathToFileURL(CLI).href)};`, "const [r] = process.argv.slice(1), a = archiveFacts(r, [Buffer.from(\"a\")]), b = archiveFacts(r, [Buffer.from(\"b\")]);",
    "try { archiveFacts(r, [Buffer.from(\"c\")], { tip: a }); console.log(\"moved\"); } catch { console.log(b); }"].join(NL);
  const p = spawnSync(process.execPath, ["--input-type=module", "-e", code, r], { env: ENV, encoding: "utf8" }), tip = gd(r, ["rev-parse", "refs/journal/facts"]);
  assert.deepEqual([p.stdout.trim(), tip.length], [tip, 40]);
});

// killer: scripts/journal/index.mjs:279 CONST " || r.rev !== rev" -> ""
test("lint_frozen_and_recu_archived: a v2 line reads what add archived: the lint record (a commit set after add: its rev; the record of another mission: its mission_sha; a red lint frozen at add: a path on disk at launch, absent at the revision), the mission (a sha naming another fact) and the receipt (a date changed after add, a receipt not archived) redden J-LINT and J-RECU", () => {
  const { r, name, at } = v2("Read `test/fixtures/journal/oracle-G2.json`.\n"), { r: r2, name: n2, at: at2 } = v2(), ok = at2("G1") as Entry, red = at("G1"), ms = String((ok.mission as Entry | undefined)?.sha).slice(0, 12), ls = String((ok.facts as Entry | undefined)?.lint).slice(0, 12);
  const rec = `${JSON.stringify({ schema: "monark.lint.v1", mission_sha: "a".repeat(64), rev: C2, verdict: "vert", hits: [], tool: "t" })}\n`;
  graft(r2, sha(rec), rec);
  // killer: scripts/journal/index.mjs:274 CONST "(r.date ?? null) === m.recu_date && " -> ""
  const forged = [{ ...ok, commit: C1 }, { ...ok, mission: { ...(ok.mission as Entry), recu_date: "2026-01-01T00:00:00Z" } }, { ...ok, facts: { ...(ok.facts as Entry), lint: sha(rec) } },
    { ...ok, mission: { ...(ok.mission as Entry), sha: (ok.facts as Entry | undefined)?.lint } }, { ...ok, facts: { ...(ok.facts as Entry), recu: "b".repeat(64) } }]; // a mission sha naming another fact; a receipt not archived
  // killer: scripts/journal/index.mjs:279 CONST "r.mission_sha !== m.sha || " -> ""
  assert.deepEqual([typeof red, build({}, r).hits, build({ "M-Z": forged }, r2).hits], ["object", [`J-LINT M-Z:1 ${name}: frozen at ${C2}: R-PATH`], [`J-LINT M-Z:1 ${n2}: lint record of ${ms} at ${C2} != mission ${ms} at ${C1}`,
    `J-RECU M-Z:2 ${n2}: the archived receipt != the mission fields (verdict, sha, date, head)`, `J-LINT M-Z:3 ${n2}: lint record of ${"a".repeat(12)} at ${C2} != mission ${ms} at ${C2}`,
    `J-RECU M-Z:4 ${n2}: sha ${ls}, receipt ${ms}`, `J-LINT M-Z:4 ${n2}: lint record of ${ms} at ${C2} != mission ${ls} at ${C2}`, `J-RECU M-Z:5 ${n2}: receipt archive absent`]]);
});

// killer: scripts/journal/index.mjs:254 CONST "e.schema === V2 ? fact(sf.sha256)" -> "e.schema !== V2 ? fact(sf.sha256)"
test("served_record_archived: add --from-oracle at G1 archives the record and the record it was served from; both host files deleted, the v2 line stays green; a served record whose sha256 is not archived is red archive absent", () => {
  const { r, at } = v2(), g1 = { role: "G1", start: "2099-01-01T00:00:00Z", tree: { head: C2, dirty: null } }, srv = record("srv0.json", g1);
  const cite = (n: string, sha256: unknown): Entry => record(n, { ...g1, served_from: { file: "srv0.json", sha256 }, tests: null }), [c0, c1] = [cite("cite0.json", srv.sha256), cite("cite1.json", "0".repeat(64))];
  const y = [at("G1", "--from-oracle", String(c0.record)), at("G1", "--from-oracle", String(c1.record))];
  for (const f of [srv.record, c0.record, c1.record]) rmSync(String(f));
  assert.deepEqual([y.map((e) => typeof e), build({}, r).hits], [["object", "object"], ["J-ORACLE M-Z:2 cite1.json: served record srv0.json: archive absent"]]);
});
