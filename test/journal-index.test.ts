/**
 * Root test `journal_index` (ADR-METHODE-2 D8a, D10, D11, D12 (d); lot M-5; decision 275-e). It drives the CLI
 * scripts/journal/index.mjs (add, build) over throwaway git repositories under the OS temp directory: a template with two
 * byte-deterministic commits (fixed identity and dates, no system or global git config, no GIT_* variable; C2 adds docs/b.md)
 * and the frozen files of test/fixtures/journal/ at their repo paths, one copy per build. The frozen entries are the clean
 * fixture (green: the golden test); each control test forges one defect from them. The line above each test is its killer,
 * the production mutation that reddens it (convention of scripts/red-proof.mjs, lot M-4). No helper throws when the CLI is
 * absent: at the base, every test is red by an assertion.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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
cpSync(FX, join(TPL, "test", "fixtures", "journal"), { recursive: true });
const sha = (b: string | Buffer): string => createHash("sha256").update(b).digest("hex");
const frozen = (lot: string): Entry[] => readFileSync(join(FX, `${lot}.jsonl`), "utf8").trim().split("\n").map((l) => JSON.parse(l) as Entry);
const X = frozen("M-X"), M = X[2]?.mission as Entry;
/** Line `n` (1-based) of the frozen M-X journal, copied: 3 G1, 4 G2 at C1, 5 corr, 6 cp-2, 7 G7, 8 fusion (both at C2). */
const x = (n: number, patch: Entry = {}): Entry => ({ ...X[n - 1], ...patch });
let seq = 0;
/** A copy of the template whose docs/journal holds `lots` (lot -> entries, or raw lines). */
function repo(lots: Record<string, (Entry | string)[]> = {}): string {
  const r = join(T, `r${String(++seq)}`);
  cpSync(TPL, r, { recursive: true });
  mkdirSync(join(r, "docs", "journal"));
  for (const [lot, rows] of Object.entries(lots)) writeFileSync(join(r, "docs", "journal", `${lot}.jsonl`), rows.map((e) => `${typeof e === "string" ? e : JSON.stringify(e)}\n`).join(""));
  return r;
}
const cli = (...a: string[]) => spawnSync(process.execPath, [CLI, ...a], { env: ENV, encoding: "utf8" });
/** build --json over `lots`: the sorted unique codes and the hits (`code extract`); no JSON (CLI absent) reads as no hit. */
function build(lots: Record<string, (Entry | string)[]>): { codes: string[]; hits: string[] } {
  let hits: Hit[] = [];
  try { hits = (JSON.parse(cli("build", "--repo", repo(lots), "--json").stdout) as { hits: Hit[] }).hits; } catch { /* CLI absent at the base */ }
  return { codes: [...new Set(hits.map((h) => h.code))].sort(), hits: hits.map((h) => `${h.code} ${h.lot}:${String(h.line)} ${h.extract}`) };
}
/** A text file under the temp root, and its sha256. */
const file = (name: string, body: string): [string, string] => { writeFileSync(join(T, name), body); return [join(T, name), sha(body)]; };
/** An oracle record derived from the frozen G7 record, written under the temp root; returns the entry's `oracle` as add fills it. */
function record(name: string, patch: Entry): Entry {
  const r = { ...(JSON.parse(readFileSync(join(FX, "oracle-G7.json"), "utf8")) as Entry), ...patch }, [path, sha256] = file(name, `${JSON.stringify(r)}\n`);
  return { record: path, sha256, role: r.role, head: (r.tree as Entry).head, start: r.start, served_from: r.served_from, tests_total: (r.tests as Entry).total };
}

// killer: scripts/journal/index.mjs:188 CONST "all.map((e) => e.date).sort().at(-1)" -> "new Date().toISOString()"
test("golden: build on the frozen entries writes INDEX.golden.md byte for byte, dated by the last entry", () => {
  assert.deepEqual([git(["rev-parse", "HEAD~1"]), git(["rev-parse", "HEAD"])], [C1, C2], "fixture commits not reproduced: a git config, identity or object format leaked into the throwaway repository");
  const r = repo(), idx = join(r, "docs", "journal", "INDEX.md");
  for (const f of ["M-X.jsonl", "M-Y.jsonl"]) copyFileSync(join(FX, f), join(r, "docs", "journal", f));
  const p = cli("build", "--repo", r);
  assert.ok(p.status === 0 && existsSync(idx), `${p.stdout}${p.stderr}`);
  assert.equal(readFileSync(idx, "utf8"), readFileSync(join(FX, "INDEX.golden.md"), "utf8"));
});

// killer: scripts/journal/index.mjs:175 COR "hits.length === 0 && o.only === undefined" -> "o.only === undefined"
test("build: red exits 1 with one line per hit and keeps the previous INDEX.md; --only never writes; no journal exits 2", () => {
  const r = repo({ "M-X": X, "M-Y": [x(1, { lot: "M-Y", date: "2026-02-30T00:00:00Z" })] }), idx = join(r, "docs", "journal", "INDEX.md");
  writeFileSync(idx, "previous index\n");
  const p = cli("build", "--repo", r), q = cli("build", "--repo", r, "--only", "M-X");
  assert.match(p.stdout, /^J-SCHEMA M-Y:1 date out of domain\ncounts J-SCHEMA=1 J-TIME=0 J-TRACE=0 J-ORIGIN=0 J-TOURS=0 J-ORACLE=0 J-RECU=0 J-LINT=0 J-MODEL=0 J-ADJ=0\nverdict rouge/);
  assert.deepEqual([p.status, q.status, readFileSync(idx, "utf8"), cli("build", "--repo", repo()).status], [1, 0, "previous index\n", 2]);
});

// killer: scripts/journal/index.mjs:98 CONST "new Date()" -> "new Date(0)"
test("add: a launch receipt and an oracle record give one conforming line dated by the tool, and build is green on it (CA-11)", () => {
  const r = repo(), fx = join(r, "test", "fixtures", "journal"), t0 = Date.now() - 1000;
  assert.equal(spawnSync(process.execPath, [join(ROOT, "scripts", "mission", "launch.mjs"), join(fx, "mission.md"), "--repo", r], { env: ENV }).status, 0);
  const p = cli("add", "--repo", r, "--lot", "M-Z", "--gate", "G2", "--tour", "0", "--commit", C1, "--from-recu", join(fx, "mission.recu.json"), "--from-oracle", join(fx, "oracle-G2.json"),
    "--model", "claude-opus-5-5[1m]", "--tier", "claude-opus-5-5", "--effort", "max", "--verdict", "ACCEPTE", "--corrections", "0/1", "--r25", "90", "--origin", "");
  const out = join(r, "docs", "journal", "M-Z.jsonl");
  assert.ok(p.status === 0 && existsSync(out), p.stderr);
  const e = JSON.parse(readFileSync(out, "utf8")) as Entry, recu = JSON.parse(readFileSync(join(fx, "mission.recu.json"), "utf8")) as Entry, d = Date.parse(String(e.date));
  assert.equal(p.stdout, `${JSON.stringify(e)}\n`);
  assert.ok(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(String(e.date)) && d >= t0 && d <= Date.now(), `date ${String(e.date)} is not the tool's clock to the second`);
  assert.deepEqual([e.mission, e.oracle, e.tree_head, e.r25, e.corrections, e.error_origin], [
    { path: join(fx, "mission.md").replace(/\\/g, "/"), sha: M.sha, recu_sha: recu.sha, recu_date: recu.date },
    { ...(X[3]?.oracle as Entry), record: join(fx, "oracle-G2.json").replace(/\\/g, "/") }, C1, { lines: 90, cap: 547 }, { blocking: 0, nonblocking: 1 }, []]);
  assert.equal(cli("build", "--repo", r).status, 0);
});

// killer: scripts/journal/index.mjs:113 ROR "p.length > 0" -> "p.length > 99"
test("add: a field required by the gate missing (G2 without --tour) exits 2 and writes nothing", () => {
  const r = repo(), p = cli("add", "--repo", r, "--lot", "M-Z", "--gate", "G2", "--commit", C1);
  assert.deepEqual([p.status, existsSync(join(r, "docs", "journal", "M-Z.jsonl"))], [2, false]);
  assert.match(p.stderr, /J-SCHEMA: .*tour null, required for G2/);
});

// killer: scripts/journal/index.mjs:215 CONST "\"gate\", \"from-recu\"" -> "\"gate\", \"date\", \"from-recu\""
test("add: a date given by the caller (--date) exits 2 and writes nothing", () => {
  const r = repo(), p = cli("add", "--repo", r, "--lot", "M-Z", "--gate", "G0", "--date", "2020-01-01T00:00:00Z");
  assert.deepEqual([p.status, existsSync(join(r, "docs", "journal", "M-Z.jsonl"))], [2, false]);
  assert.match(p.stderr, /unknown or incomplete option --date/);
});

// killer: scripts/journal/index.mjs:46 CONST "[\\x00-\\x1f\\x7f-\\x9f]" -> "[\\x00-\\x08\\x0a-\\x1f\\x7f-\\x9f]"
test("add: a TAB in a note, or F: followed by two spaces, exits 2 (the byte guard of lot M-1 covers docs/journal/)", () => {
  const r = repo(), run = (note: string) => cli("add", "--repo", r, "--lot", "M-Z", "--gate", "G0", "--note", note);
  assert.deepEqual([run("a\tb").status, run(`see F:${" ".repeat(2)}x`).status, existsSync(join(r, "docs", "journal", "M-Z.jsonl"))], [2, 2, false]);
  assert.deepEqual([run("a b").status, existsSync(join(r, "docs", "journal", "M-Z.jsonl"))], [0, true]);
});

// killer: scripts/journal/index.mjs:84 CONST "!FIELDS.includes(k)" -> "false"
test("J-SCHEMA: an unknown field, a missing field, a value out of domain, a line that is not JSON, a lot in another file", () => {
  const noTier = Object.fromEntries(Object.entries(x(3)).filter(([k]) => k !== "tier"));
  const b = build({ "M-X": [x(3, { extra: 1 }), noTier, x(3, { gate: "G3" }), "{not json", x(3, { lot: "M-Y" }), x(8, { commit: null })] });
  assert.deepEqual(b.hits.map((h) => h.split(" ").slice(0, 2).join(" ")), ["J-SCHEMA M-X:1", "J-SCHEMA M-X:2", "J-SCHEMA M-X:3", "J-SCHEMA M-X:4", "J-SCHEMA M-X:5", "J-SCHEMA M-X:6"]);
  assert.deepEqual(build({ "M-X": X }).codes, []);
});

// killer: scripts/journal/index.mjs:146 SDL "!(t >= when(e.commit))" -> ""
test("J-TIME: an entry dated before its commit (host clock set back, forged line) or before the previous entry of its lot", () => {
  assert.deepEqual(build({ "M-X": [x(8, { date: "2026-01-02T00:29:59Z" })] }).codes, ["J-TIME"]);
  assert.deepEqual(build({ "M-X": [x(8, { commit: "0".repeat(40) })] }).codes, ["J-TIME"]);
  assert.deepEqual(build({ "M-X": [x(2), x(1)] }).codes, ["J-TIME"]);
  assert.deepEqual(build({ "M-X": [x(8), x(8)] }).codes, []);
});

// killer: scripts/journal/index.mjs:149 SDL "h(\"J-TRACE\"" -> ""
test("J-TRACE: a G7 without public trace, or a motif whose ref is empty", () => {
  assert.deepEqual(build({ "M-X": [x(7, { public_trace: null })] }).codes, ["J-TRACE"]);
  assert.deepEqual(build({ "M-X": [x(7, { public_trace: { kind: "motif", ref: " " } })] }).codes, ["J-TRACE"]);
  assert.deepEqual(build({ "M-X": [x(7)] }).codes, []);
});

// killer: scripts/journal/index.mjs:150 SDL "h(\"J-ORIGIN\"" -> ""
test("J-ORIGIN: an error_origin code outside the vocabulary of audit A; an empty list is a declared none, never refused", () => {
  assert.deepEqual(build({ "M-X": [x(7, { error_origin: ["G1", "WORKER"] })] }).codes, ["J-ORIGIN"]);
  assert.deepEqual(build({ "M-X": [x(7, { error_origin: [] })] }).codes, []);
});

// killer: scripts/journal/index.mjs:161 SDL "hit(\"J-TOURS\"" -> ""
test("J-TOURS and J-ADJ: six corr entries with a G7 that has no adjudication; an adjudicated G7 clears J-TOURS", () => {
  const six = [1, 2, 3, 4, 5, 6].map((t) => x(5, { tour: t }));
  assert.deepEqual(build({ "M-X": [...six, x(7, { adjudication: null })] }).codes, ["J-ADJ", "J-TOURS"]);
  assert.deepEqual([build({ "M-X": [...six, x(7)] }).codes, build({ "M-X": six.slice(1) }).codes], [[], []]);
});

// killer: scripts/journal/index.mjs:138 CONST "r.served_from !== null" -> "false"
test("J-ORACLE: a record served from the store, absent, of another role or head, started before its commit, of another sha, or miscopied", () => {
  const why = (oracle: Entry): string[] => build({ "M-X": [x(7, { oracle })] }).hits.map((h) => h.replace(/^J-ORACLE M-X:1 [\w.-]+\.json: /, ""));
  assert.deepEqual(why(record("served.json", { served_from: { file: "x.json", sha256: "0".repeat(64) } })), ["served_from not null: a store citation, never a replay"]);
  assert.deepEqual(why({ ...record("absent.json", {}), record: join(T, "none.json") }), ["record absent"]);
  assert.deepEqual(why(record("role.json", { role: "G2" })), ["role G2 != gate G7"]);
  assert.deepEqual(why(record("head.json", { tree: { head: C1, dirty: null } })), [`tree.head ${C1} != commit`]);
  assert.deepEqual(why(record("early.json", { start: "2026-01-02T00:29:59Z" })), ["start 2026-01-02T00:29:59Z before the commit date"]);
  assert.deepEqual(why({ ...record("sha.json", {}), sha256: "0".repeat(64) }), ["sha256 != oracle.sha256"]);
  assert.deepEqual(why({ ...record("copy.json", {}), tests_total: 99 }), ["a field copied into the entry != the record"]);
  assert.deepEqual(why(record("clean.json", {})), []);
});

// killer: scripts/journal/index.mjs:154 SDL "h(\"J-RECU\"" -> ""
test("J-RECU: a mission edited on disk after its receipt, a receipt of another text, a mission file absent", () => {
  const [edited] = file("edited.md", `${readFileSync(join(FX, "mission.md"), "utf8")}Edited after the launch.\n`);
  assert.deepEqual(build({ "M-X": [x(3, { mission: { ...M, path: edited } })] }).codes, ["J-RECU"]);
  assert.deepEqual(build({ "M-X": [x(3, { mission: { ...M, recu_sha: "0".repeat(64), recu_date: "2026-01-01T00:45:00Z" } })] }).codes, ["J-RECU"]);
  assert.deepEqual(build({ "M-X": [x(3, { mission: { ...M, path: join(T, "none.md") } })] }).codes, ["J-LINT", "J-RECU"]);
});

// killer: scripts/journal/index.mjs:155 CONST "rev: e.commit" -> "rev: null"
test("J-LINT: a green receipt on a text the linter replayed at the entry's commit reddens (a TODO; a path absent at that commit)", () => {
  const [todo, s1] = file("todo.md", `${readFileSync(join(FX, "mission.md"), "utf8")}Size TODO.\n`);
  const [later, s2] = file("later.md", `${readFileSync(join(FX, "mission.md"), "utf8")}Read \`docs/b.md\`.\n`);
  assert.deepEqual(build({ "M-X": [x(3, { mission: { ...M, path: todo, sha: s1, recu_sha: s1 } })] }).codes, ["J-LINT"]);
  assert.deepEqual(build({ "M-X": [x(3, { mission: { ...M, path: todo } })] }).codes, ["J-LINT", "J-RECU"]);
  const at = (n: number): string[] => build({ "M-X": [x(n, { mission: { ...M, path: later, sha: s2, recu_sha: s2 } })] }).codes;
  assert.deepEqual([at(4), at(6), at(3)], [["J-LINT"], [], []]);
});

// killer: scripts/journal/index.mjs:157 COR " && !/^[\\w-]/.test(e.model_resolved.slice(e.tier.length))" -> ""
test("J-MODEL: a tier outside TIERS, a model of another tier or a longer id (prefix trap), an agent entry without its model", () => {
  const codes = (tier: string | null, model: string | null): string[] => build({ "M-X": [x(3, { tier, model_resolved: model })] }).codes;
  assert.deepEqual([codes("claude-opus-5", "claude-opus-5[1m]"), codes("claude-opus-5-5", "claude-sonnet-5"), codes("claude-sonnet-5", "claude-sonnet-5-5"), codes(null, null)], [["J-MODEL"], ["J-MODEL"], ["J-MODEL"], ["J-MODEL"]]);
  assert.deepEqual(codes("claude-sonnet-5", "claude-sonnet-5"), []);
});

// killer: scripts/journal/index.mjs:158 SDL "h(\"J-ADJ\"" -> ""
test("J-ADJ: a G7 whose adjudication is blank; its presence is checked, never its nature", () => {
  assert.deepEqual(build({ "M-X": [x(7, { adjudication: " " })] }).codes, ["J-ADJ"]);
  assert.deepEqual(build({ "M-X": [x(7, { adjudication: "x" })] }).codes, []);
});
