/**
 * Root test `mission_lint` (ADR-METHODE-2 D1, lot M-2a; Q-PLI3-7: the launcher runs outside the workflow). It drives the
 * mission linter scripts/mission/lint.mjs, the launcher scripts/mission/launch.mjs and the workflow guard
 * scripts/mission/launch-guard.js over a disposable git repository under the OS temp directory (two commits, a branch
 * lot/x, a 10-line file). Each title names, in brackets, the production mutation that reddens it (DOCTRINE D-4 (b)).
 * Drive-letter absolute paths are a Windows-host convention: those assertions run on win32 only. The three corpus
 * missions (host files, absent in CI: skipped) are linted and their verdict is reported as a diagnostic, never corrected.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { CODES, lintMission, type LintResult } from "../scripts/mission/lint.mjs";

const ROOT = join(import.meta.dirname, "..");
const WIN = process.platform === "win32";
const T = mkdtempSync(join(tmpdir(), "monark-mission-lint-"));
after(() => rmSync(T, { recursive: true, force: true }));
const REPO = join(T, "repo"), EXT = join(T, "ext").replace(/\\/g, "/");
const ZERO = Object.fromEntries(CODES.map((c) => [c, 0]));
const git = (...a: string[]): string =>
  execFileSync("git", ["-C", REPO, "-c", "user.name=t", "-c", "user.email=t@users.noreply.github.com", "-c", "core.autocrlf=false", ...a], { encoding: "utf8" }).trim();
for (const d of [join(REPO, "docs"), join(REPO, "scripts", "sub"), EXT]) mkdirSync(d, { recursive: true });
writeFileSync(join(REPO, "docs", "ten.md"), Array.from({ length: 10 }, (_, i) => `l${String(i + 1)}\n`).join(""));
writeFileSync(join(REPO, "scripts", "present.mjs"), "export {};\n");
writeFileSync(join(REPO, "scripts", "sub", "nested.mjs"), "export {};\n");
writeFileSync(join(EXT, "tool.ps1"), "\n");
git("init", "-q", "-b", "main");
git("add", "-A");
git("commit", "-q", "-m", "c1");
const BASE = git("rev-parse", "--short", "HEAD");
writeFileSync(join(REPO, "docs", "later.md"), "later\n");
git("add", "-A");
git("commit", "-q", "-m", "c2");
git("branch", "lot/x");

const H = (body: string, title = "# MISSION G2 fixture"): string => `${title}\nWorker \`claude-opus-5-5\`, branch \`lot/x\`, base tronc \`${BASE}\`.\n${body}\n`;
const lint = (text: string, rev: string | null = null): LintResult => lintMission({ text, missionPath: join(T, "m.md"), repo: REPO, rev });
const red = (text: string): string[] => lint(text).hits.map((h) => h.code);
/** A workflow fixture: the guard block copied verbatim from launch-guard.js, run in an empty context (no import, no fs, no
 *  crypto), then agent() called with what assertRecu returns. Returns the texts agent() received ([] when refused). */
const GUARD = /\/\/ BEGIN launch-guard\r?\n([\s\S]*?)\/\/ END launch-guard/.exec(readFileSync(join(ROOT, "scripts", "mission", "launch-guard.js"), "utf8"))?.[1] ?? "";
const workflow = (args: unknown): string[] => {
  const calls: string[] = [];
  try { runInNewContext(`${GUARD}\nagent(assertRecu(args));`, { args, agent: (t: string) => calls.push(t) }); } catch { /* refused: no agent() */ }
  return calls;
};

test("clean mission is vert, every count 0 [mutant: any rule firing on clean input]", () => {
  const r = lint(H("Read `docs/ten.md:10` and `docs/ten.md` (l.9), run `scripts/present.mjs` and `present.mjs`."));
  assert.deepEqual([r.verdict, r.hits, r.counts], ["vert", [], ZERO]);
});

test("R-LINE: a line past the end of the file is red [mutants: R-LINE check removed; l.N after a path ignored]", () => {
  assert.deepEqual(red(H("See `docs/ten.md:11`, `docs/ten.md` (l.12) and `docs/ten.md:3-10`.")), ["R-LINE", "R-LINE"]);
  // G01: the LTAIL anchor (^) must stop `l.9` from being lent to an earlier, unrelated path on the same line.
  // killer: scripts/mission/lint.mjs:37 remove-anchor "LTAIL = /^`?" -> "LTAIL = /`?"
  assert.deepEqual(red(H("See `docs/later.md` and `docs/ten.md` (l.9).")), []);
  // G02: an unparenthesised `path l.N` chain right after a path (no parens) is still an attribution.
  // killer: scripts/mission/lint.mjs:37 drop-chain "(paren|l.N-chain)" -> "(paren-only)"
  assert.deepEqual(red(H("See `docs/ten.md` l.12.")), ["R-LINE"]);
  // G08: a last line without a final newline still counts (a\nb\nc = 3 lines, not 2).
  // killer: scripts/mission/lint.mjs:53 drop-tail "+ (s.length > 0 && !s.endsWith(\"\n\") ? 1 : 0)" -> "+ 0"
  writeFileSync(join(REPO, "docs", "nonl.md"), "a\nb\nc");
  assert.deepEqual(red(H("See `docs/nonl.md:3`.")), []);
  // C-G2-4: a parenthesis that itself quotes another path (a backtick inside) never lends its l.N to the path before it.
  // killer: scripts/mission/lint.mjs:37 revert-class "[^()`]" -> "[^()]"
  assert.deepEqual(red(H("See `docs/later.md:1` (l.9 de `docs/ten.md`).")), []);
});

test("R-PATH: an absent path is red; declared to-create, lock, outside the roots, prose without extension are not [mutants: R-PATH check removed; to-create list, heading or word ignored; lock, outside-root or prose path checked]", () => {
  assert.deepEqual(red(H("Edit `docs/absent.md`; each test/fixture pair; see docs/gone.md.")), ["R-PATH", "R-PATH"]);
  const body = ["Write `docs/one.md` (nouveau).", "Edit `docs/two.md`.", "Replay `pli/lex.mjs`.", WIN ? `Lock \`${T.replace(/\\/g, "/")}/oracle-lock\`.` : "", "## \u00c0 cr\u00e9er", "- `docs/two.md`"];
  assert.deepEqual(red(H(body.join("\n"))), []);
  // C-G2-2: a to-create entry written with a final `/` declares its whole subtree; a declared FILE never declares one.
  // The subtree file (`a.md`) is cited OUTSIDE the "a creer" section, on its own, so it is exempt only through the
  // directory's subtree coverage, never by being separately declared itself.
  // killer: scripts/mission/lint.mjs:78 revert-covers "d.endsWith(\"/\") ? q===d.slice(0,-1)||q.startsWith(d) : q===d" -> "q === d"
  assert.deepEqual(red(H(["## \u00c0 cr\u00e9er", "- `docs/newdir/`", "## Suite", "See `docs/newdir/a.md`."].join("\n"))), []);
});

test("R-BRANCH: a lot/ branch absent from git branch --list is red, a lot/ word in prose is not [mutants: R-BRANCH check removed; prose lot/ word taken as a branch]", () => {
  assert.deepEqual(red(H("Rebase onto `lot/absent`; this lot/pair word; branch lot/gone.")), ["R-BRANCH", "R-BRANCH"]);
});

test("R-BASE: a base absent or unknown to the repository is red [mutants: absent base accepted; unknown base accepted]", () => {
  assert.deepEqual(red(H("x").replace(/, base tronc `\w+`/, "")), ["R-BASE"]);
  assert.deepEqual(red(H("x").replace(BASE, "0000000")), ["R-BASE"]);
});

test("R-BASE: `--base <sha>` alone or `gel <sha>` alone also pins the base; with both present, `base [tronc]` wins by ?? precedence, never one merged regex [mutants: ALT_BASE_RE removed; precedence inverted]", () => {
  // killer: scripts/mission/lint.mjs:45 disable-alt "const ALT_BASE_RE = new RegExp" -> "const ALT_BASE_RE = /(?!)/"
  // killer: scripts/mission/lint.mjs:125 invert-precedence "BASE_RE.exec(src) ?? ALT_BASE_RE.exec(src)" -> "ALT_BASE_RE.exec(src) ?? BASE_RE.exec(src)"
  assert.deepEqual(red(H("x").replace(/base tronc `(\w+)`/, "--base $1")), []);
  assert.deepEqual(red(H("x").replace(/base tronc `(\w+)`/, "gel `$1`")), []);
  const head2 = git("rev-parse", "HEAD");
  const both = lint(H("x").replace(/base tronc `(\w+)`/, `gel \`${head2}\`, base tronc \`$1\``));
  assert.deepEqual(both.hits, []);
  assert.equal(both.base, git("rev-parse", BASE));
});

test("R-TOOL: an absent tool is red; one declared to-create or held by a directory the mission names is not [mutants: bare tool never checked; tool classified as a path; cited-directory resolution removed; cited repo-directory resolution removed]", () => {
  assert.deepEqual(red(H("Run `scripts/absent.mjs`, then `absent-tool.ps1 -Tree x`.")), ["R-TOOL", "R-TOOL"]);
  assert.deepEqual(red(H("Write `scripts/made.mjs` and `made.ps1` (nouveau).\nRun `made.ps1`, then `scripts/made.mjs`.")), []);
  assert.deepEqual([red(H("Run `scripts/sub/nested.mjs`, then `nested.mjs`.")), red(H("In `scripts/sub/`, run `nested.mjs`."))], [[], []]);
  if (WIN) assert.deepEqual(red(H(`Run \`${EXT}/tool.ps1\` / \`tool.ps1\`, never \`${EXT}/gone.ps1\`.`)), ["R-TOOL"]);
  // G04: brace expansion checks each alternative path, not the one literal string with braces still in it.
  // killer: scripts/mission/lint.mjs:52 disable-braces "return m ? m[2].split" -> "return false ? m[2].split"
  assert.deepEqual(red(H("Run `scripts/{present,sub/nested}.mjs`.")), []);
});

test("R-MODEL: claude-opus-5, no tier, an unlisted id, Fable as worker are red [mutants: claude-opus-5 let through; Fable as worker accepted; absent tier accepted]", () => {
  assert.deepEqual(red(H("Sub-agents `claude-opus-5`.")), ["R-MODEL"]);
  assert.deepEqual(red(H("x").replace("claude-opus-5-5", "someone")), ["R-MODEL"]);
  assert.deepEqual(red(H("x").replace("Worker `claude-opus-5-5`", "Worker `claude-fable-5-1`")), ["R-MODEL"]);
  assert.deepEqual(red(H("Advisor `claude-fable-5-1`, readers `claude-sonnet-5`, old `claude-opus-4-8`.")), ["R-MODEL"]);
  // G03: the order "claude-fable-5-1 <role>" (Fable named first, role word after) must be detected too, not only "<role> claude-fable-5-1".
  // killer: scripts/mission/lint.mjs:48 drop-reversed-order "claude-fable-5-1[^${W}\n]{0,4}${ROLE}" -> "claude-fable-5-1"
  assert.deepEqual(red(H("`claude-fable-5-1` correcteur.")), ["R-MODEL"]);
  // G10: claude-haiku-* is not in TIERS either (the roster never allows haiku).
  // killer: scripts/mission/lint.mjs:46 drop-haiku "claude-(?:opus|sonnet|haiku|fable)" -> "claude-(?:opus|sonnet|fable)"
  assert.deepEqual(red(H("Sub-agents `claude-haiku-4-5`.")), ["R-MODEL"]);
});

test("R-PLACEHOLDER: TBD, TODO, XXX, a-completer outside backticks are red, a quoted mention is not [mutants: R-PLACEHOLDER check removed; quoted mention flagged]", () => {
  assert.deepEqual(red(H("Size TBD, TODO, PR XXX, tests \u2026\u00e0 compl\u00e9ter.")), new Array<string>(4).fill("R-PLACEHOLDER"));
  assert.deepEqual(red(H("Banned: `TBD`, `TODO`, `XXX`, `\u2026\u00e0 compl\u00e9ter`.")), []);
});

test("R-FOCUS: a MISSION G1 needs a Review Focus of 1 to 5 classes, each tied to a task, test or item [mutants: missing section accepted; 6 classes accepted; class with no task or test accepted]", () => {
  const g1 = (body: string): string[] => red(H(body, "# MISSION G1 fixture"));
  const cls = (n: number): string => Array.from({ length: n }, (_, i) => `- class ${String(i)}: test t${String(i)}`).join("\n");
  assert.deepEqual(lint(H("No focus.", "# MISSION G1 fixture")).hits.map((h) => [h.code, h.line, h.extract]), [["R-FOCUS", 1, "MISSION G1 without a Review Focus section"]]);
  assert.deepEqual(g1(`## Review Focus\n${cls(6)}`), ["R-FOCUS"]);
  assert.deepEqual(g1(`## Review Focus\n${cls(2)}\n- an orphan class`), ["R-FOCUS"]);
  assert.deepEqual([g1(`## Review Focus\n${cls(5)}`), red(H("No focus."))], [[], []]);
});

test("R-FOCUS: a class tied only to a lettered or roman sub-task reference, (a) or (iv), is not orphan; one with no tie at all still is [mutant: parenthesised sub-task reference not recognised as a tie]", () => {
  // killer: scripts/mission/lint.mjs:50 revert-tied "items?|\([a-z]\)|\([ivx]{1,4}\)" -> "items?"
  const g1 = (body: string): string[] => red(H(body, "# MISSION G1 fixture"));
  assert.deepEqual(g1("## Review Focus\n- class x (rattach\u00e9 : (c))\n- class y (a)"), []);
  assert.deepEqual(g1("## Review Focus\n- class x (rattach\u00e9 : (iv))\n- class y never removed, KEEP"), ["R-FOCUS"]);
});

test("CLI: exit 1 and one line per hit when red, exit 0 when vert; --rev reads the tree of a commit [mutants: exit 0 despite hits; --rev ignored]", () => {
  const f = join(T, "cli.md");
  const cli = (...a: string[]) => spawnSync(process.execPath, [join(ROOT, "scripts", "mission", "lint.mjs"), f, "--repo", REPO, ...a], { encoding: "utf8" });
  writeFileSync(f, H("Read `docs/later.md:1`."));
  assert.equal(cli().status, 0);
  const r = cli("--rev", BASE);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /^R-PATH .*cli\.md:3 docs\/later\.md absent$/m);
  // G09: --rev reads the tree of a commit; a cited DIRECTORY (trailing `/`) must be found there too, not files only.
  // killer: scripts/mission/lint.mjs:69 drop-dirs-check " || dirs.has(p.replace(/\/$/, \"\"))" -> ""
  writeFileSync(f, H("See `scripts/sub/`."));
  assert.equal(cli("--rev", BASE).status, 0);
  // C-G2-8: a --rev that is not a commit of --repo is a usage error (exit 2), not ~10 spurious R-PATH/R-TOOL hits.
  // killer: scripts/mission/lint.mjs:154 remove-rev-guard "if (o.rev) { try { execFileSync(...) } catch {...} }" -> "(removed)"
  assert.equal(cli("--rev", "deadbee").status, 2);
});

test("pipe mission -> launch -> receipt -> copied guard -> agent(): vert writes a receipt (sha256 of the bytes) that lets the linted text through; red writes none, deletes the earlier one, no agent() [mutants: receipt written despite red; sha not of the text; earlier receipt kept; launch exit 0 on red]", () => {
  const f = join(T, "mission-a.md"), recu = join(T, "mission-a.recu.json");
  const run = () => spawnSync(process.execPath, [join(ROOT, "scripts", "mission", "launch.mjs"), f, "--repo", REPO], { encoding: "utf8" });
  const receipt = (): unknown => (existsSync(recu) ? JSON.parse(readFileSync(recu, "utf8")) as unknown : undefined);
  writeFileSync(f, H("Read `docs/ten.md:10`."));
  assert.equal(run().status, 0);
  // G07: the receipt is named `<mission without .md>.recu.json`, never `<mission>.md.recu.json`; dies here by
  // assertion (existsSync), not by a TypeError reading `.sha` off an absent file.
  // killer: scripts/mission/launch.mjs:24 keep-md-suffix "mission.replace(/\.md$/i, \"\")" -> "mission"
  assert.ok(existsSync(recu));
  const got = receipt() as { sha: string; verdict: string; date: string; lint: Record<string, number>; base: string; head: string };
  assert.deepEqual([got.sha, got.verdict, got.lint, got.base], [createHash("sha256").update(readFileSync(f)).digest("hex"), "vert", ZERO, git("rev-parse", BASE)]);
  assert.match(got.date, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  // Q-G2-5: the receipt also carries `head`, the sha of --repo's HEAD at launch time (for a later --rev replay by M-5).
  // killer: scripts/mission/launch.mjs:35 blank-head "execFileSync(\"git\", [...]).trim()" -> "\"\""
  assert.equal(got.head, git("rev-parse", "HEAD"));
  assert.deepEqual(workflow({ recu: got, mission: readFileSync(f, "utf8") }), [readFileSync(f, "utf8")]);
  writeFileSync(f, H("Read `docs/ten.md:11`."));
  const r = run();
  assert.deepEqual([r.status, existsSync(recu), workflow({ recu: receipt(), mission: readFileSync(f, "utf8") })], [1, false, []]);
});

test("launch-guard: no agent() unless the receipt is vert with a sha256 and a text comes with it; the copied block runs with no import [mutants: verdict rouge accepted; sha not required; non-zero lint count accepted; text not required; block reads a global]", () => {
  const ok = { sha: "a".repeat(64), verdict: "vert", lint: ZERO };
  assert.deepEqual(workflow({ recu: ok, mission: "M" }), ["M"]);
  for (const recu of [undefined, { ...ok, verdict: "rouge" }, { ...ok, sha: undefined }, { ...ok, sha: "abc" }, { ...ok, lint: { ...ZERO, "R-PATH": 1 } }])
    assert.deepEqual(workflow({ recu, mission: "M" }), []);
  assert.deepEqual([workflow({ recu: ok }), workflow({ recu: ok, mission: "" })], [[], []]);
});

// C-G2-6 (Q-M2A-7): replayed at the commit each mission actually launched at, not at ROOT's live HEAD, so a lot/
// branch merged or deleted since, or a path since renamed, never changes the verdict. Limits (measured, not fixed
// here): a `lot/` branch cited is a LOCAL branch of the clone doing the replay, so R-BRANCH is environment noise in a
// fresh clone that never created it; an absolute drive path is checked against today's disk, not the pinned tree, so
// its presence or absence can drift with the host between the mission's launch and any later replay.
const CORPUS: [string, string][] = [
  ["F:/tmp/methode/mission-g1-m1.md", "6f769b7"],
  ["F:/tmp/dojo/mission-g2-rg1b.md", "b9186e4"],
  ["F:/tmp/methode/mission-pli-v3-adr-methode-2.md", "3eea4389"],
];
for (const [c, rev] of CORPUS) {
  const commitOk = (): boolean => {
    try { execFileSync("git", ["-C", ROOT, "cat-file", "-e", `${rev}^{commit}`], { stdio: "ignore" }); return true; } catch { return false; }
  };
  const skip = (!existsSync(c) && "host corpus absent") || (!commitOk() && `commit ${rev} absent from ${ROOT}`);
  test(`corpus ${c} @${rev}: verdict reported, never corrected [mutant: verdict vert despite hits]`, { skip }, (t) => {
    const r = lintMission({ text: readFileSync(c, "utf8"), missionPath: c, repo: ROOT, rev });
    t.diagnostic(`${r.verdict} ${JSON.stringify(r.counts)}`);
    for (const h of r.hits) t.diagnostic(`${h.code} ${c}:${String(h.line)} ${h.extract}`);
    assert.equal(r.verdict === "vert", r.hits.length === 0);
    assert.ok(r.hits.every((h) => CODES.includes(h.code)));
  });
}
