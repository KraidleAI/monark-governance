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
const STAMP = `G\u00e9n\u00e9r\u00e9 : \`F:/x/scripts/mission/gen.mjs\` \`0123abcd\` sha256 \`${"e".repeat(64)}\` 2026-09-28T00:00:00Z`; // the stamp line of gen.mjs
const stamped = (text: string, line = STAMP): string => { const i = text.indexOf("\n"); return i < 0 ? text : `${text.slice(0, i)}\n${line}${text.slice(i)}`; };
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
  // killer: scripts/mission/lint.mjs:58 CONST "LTAIL = /^`?" -> "LTAIL = /`?"
  assert.deepEqual(red(H("See `docs/later.md` and `docs/ten.md` (l.9).")), []);
  // G02: an unparenthesised `path l.N` chain right after a path (no parens) is still an attribution.
  // killer: scripts/mission/lint.mjs:58 CONST "|l\\.\\d+(?:-\\d+)?(?:\\s*(?:,|\\u00e0|et|-)\\s*l\\.\\d+(?:-\\d+)?)*)/u" -> ")/u"
  assert.deepEqual(red(H("See `docs/ten.md` l.12.")), ["R-LINE"]);
  // G08: a last line without a final newline still counts (a\nb\nc = 3 lines, not 2).
  // killer: scripts/mission/lint.mjs:87 CONST "+ (s.length > 0 && !s.endsWith(\"\\n\") ? 1 : 0)" -> "+ 0"
  writeFileSync(join(REPO, "docs", "nonl.md"), "a\nb\nc");
  assert.deepEqual(red(H("See `docs/nonl.md:3`.")), []);
  // C-G2-4: a parenthesis that itself quotes another path (a backtick inside) never lends its l.N to the path before it.
  // killer: scripts/mission/lint.mjs:58 CONST "[^()`]" -> "[^()]"
  assert.deepEqual(red(H("See `docs/later.md:1` (l.9 de `docs/ten.md`).")), []);
});

test("R-PATH: an absent path is red; declared to-create, lock, outside the roots, prose without extension are not [mutants: R-PATH check removed; to-create list, heading or word ignored; lock, outside-root or prose path checked]", () => {
  assert.deepEqual(red(H("Edit `docs/absent.md`; each test/fixture pair; see docs/gone.md.")), ["R-PATH", "R-PATH"]);
  const body = ["Write `docs/one.md` (nouveau).", "Edit `docs/two.md`.", "Replay `pli/lex.mjs`.", WIN ? `Lock \`${T.replace(/\\/g, "/")}/oracle-lock\`.` : "", "## \u00c0 cr\u00e9er", "- `docs/two.md`"];
  assert.deepEqual(red(H(body.join("\n"))), []);
  // C-G2-2: a to-create entry written with a final `/` declares its whole subtree; a declared FILE never declares one.
  // The subtree file (`a.md`) is cited OUTSIDE the "a creer" section, on its own, so it is exempt only through the
  // directory's subtree coverage, never by being separately declared itself.
  // killer: scripts/mission/lint.mjs:112 COR "d.endsWith(\"/\") ? q === d.slice(0, -1) || q.startsWith(d) : q === d" -> "q === d"
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
  // killer: scripts/mission/lint.mjs:66 CONST "const ALT_BASE_RE = new RegExp(`(?<![${W}])(?:--base\\\\s+|gel\\\\s*[:=]?\\\\s*)\\`?([0-9a-f]{7,40})(?![${W}])`, \"iu\")" -> "const ALT_BASE_RE = /(?!)/"
  // killer: scripts/mission/lint.mjs:172 COR "BASE_RE.exec(src) ?? ALT_BASE_RE.exec(src)" -> "ALT_BASE_RE.exec(src) ?? BASE_RE.exec(src)"
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
  // killer: scripts/mission/lint.mjs:86 COR "return m ? m[2].split" -> "return false ? m[2].split"
  assert.deepEqual(red(H("Run `scripts/{present,sub/nested}.mjs`.")), []);
});

// killer: scripts/mission/lint.mjs:54 CONST "\"claude-sonnet-5-5\", " -> ""
test("R-MODEL: claude-opus-5, no tier, an unlisted id, Fable as worker are red [mutants: claude-opus-5 let through; Fable as worker accepted; absent tier accepted]", () => {
  assert.deepEqual(red(H("Sub-agents `claude-opus-5`.")), ["R-MODEL"]);
  assert.deepEqual(red(H("x").replace("claude-opus-5-5", "someone")), ["R-MODEL"]);
  assert.deepEqual(red(H("x").replace("Worker `claude-opus-5-5`", "Worker `claude-fable-5-1`")), ["R-MODEL"]);
  assert.deepEqual(red(H("Advisor `claude-fable-5-1`, readers `claude-sonnet-5-5`, old `claude-opus-4-8`.")), ["R-MODEL"]);
  // G03: the order "claude-fable-5-1 <role>" (Fable named first, role word after) must be detected too, not only "<role> claude-fable-5-1".
  // killer: scripts/mission/lint.mjs:69 CONST "|claude-fable-5-1[^${W}\\\\n]{0,4}${ROLE}" -> ""
  assert.deepEqual(red(H("`claude-fable-5-1` correcteur.")), ["R-MODEL"]);
  // G10: claude-haiku-* is not in TIERS either (the roster never allows haiku).
  // killer: scripts/mission/lint.mjs:67 CONST "claude-(?:opus|sonnet|haiku|fable)" -> "claude-(?:opus|sonnet|fable)"
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
  // killer: scripts/mission/lint.mjs:71 CONST "items?|\\\\([a-z]\\\\)|\\\\([ivx]{1,4}\\\\)" -> "items?"
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
  // killer: scripts/mission/lint.mjs:103 COR " || dirs.has(p.replace(/\\/$/, \"\"))" -> ""
  writeFileSync(f, H("See `scripts/sub/`."));
  assert.equal(cli("--rev", BASE).status, 0);
  // C-G2-8: a --rev that is not a commit of --repo is a usage error (exit 2), not ~10 spurious R-PATH/R-TOOL hits.
  // killer: scripts/mission/lint.mjs:205 SDL "if (o.rev) { try { execFileSync(" -> ""
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
  // killer: scripts/mission/launch.mjs:24 CONST "mission.replace(/\\.md$/i, \"\")" -> "mission"
  assert.ok(existsSync(recu));
  const got = receipt() as { sha: string; verdict: string; date: string; lint: Record<string, number>; base: string; head: string };
  assert.deepEqual([got.sha, got.verdict, got.lint, got.base], [createHash("sha256").update(readFileSync(f)).digest("hex"), "vert", ZERO, git("rev-parse", BASE)]);
  assert.match(got.date, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  // Q-G2-5: the receipt also carries `head`, the sha of --repo's HEAD at launch time (for a later --rev replay by M-5).
  // killer: scripts/mission/launch.mjs:35 CONST "execFileSync(\"git\", [\"-C\", repo, \"rev-parse\", \"HEAD\"], { encoding: \"utf8\" }).trim()" -> "\"\""
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

// Lot M-2b (decision 275-d): the four semantic rules, MODEL-FIELD-1 and CREATE-SCOPE-1; each killer below is the line above
// its test, in the format of red-proof.mjs (production file:line, operator, before -> after).
// killer: scripts/mission/lint.mjs:159 SDL "hit(\"R-VAGUE\"" -> ""
test("R-VAGUE: a phrase of the closed list outside backticks is red, a quoted mention or a near miss is not [mutant: R-VAGUE check removed]", () => {
  assert.deepEqual(red(H("Add appropriate error handling, handle edge cases as needed, as appropriate.")), new Array<string>(4).fill("R-VAGUE"));
  assert.deepEqual(red(H("Gestion d\u2019erre\u0075rs appropri\u00e9e, validation appropri\u00e9e, cas limites appropri\u00e9s, relire a\u0075 besoin, appropriate validation.")), new Array<string>(5).fill("R-VAGUE"));
  assert.deepEqual(red(H("Quoted: `as needed`, `a\u0075 besoin`. Near misses: as needs, handled edge cases, appropriately validated.")), []);
});

// killer: scripts/mission/lint.mjs:160 SDL "hit(\"R-SIMILAR\"" -> ""
test("R-SIMILAR: an empty cross-reference of the closed list followed by a number is red, a quoted or number-less one is not [mutant: R-SIMILAR check removed]", () => {
  assert.deepEqual(red(H("Similar to Task 3, same as step 2, like task 4.")), new Array<string>(3).fill("R-SIMILAR"));
  assert.deepEqual(red(H("Co\u006dme l\u0061 t\u00e2che 2, idem \u00e9tape 3, m\u00eame chose q\u0075e 1.")), new Array<string>(3).fill("R-SIMILAR"));
  assert.deepEqual(red(H("Similar to the task, same as `step 2`, like tasks, task 3 alone.")), []);
});

// killer: scripts/mission/lint.mjs:171 SDL "hit(\"R-SYMBOL\"" -> ""
test("R-SYMBOL: an identifier presented as existing and defined nowhere in the tree is red; one defined in an untracked file or declared to-create is not; --rev reads the tree of the commit [mutants: R-SYMBOL check removed; untracked files not searched]", () => {
  writeFileSync(join(REPO, "scripts", "defs.mjs"), "export function onlyHere() {}\nexport class Shape {}\nconst inner = 1;\nexport { inner };\n");
  assert.deepEqual(red(H("Call `nowhere()`, the function `onlyHere`, `onlyHere()`, the class `Shape`, `inner()` and the type `Ghost`.")), ["R-SYMBOL", "R-SYMBOL"]);
  assert.deepEqual(red(H("Write the function `fresh` (nouveau), then call `fresh()`.")), []);
  assert.deepEqual(lint(H("Call `onlyHere()`."), BASE).hits.map((h) => h.code), ["R-SYMBOL"]);
});

// killer: scripts/mission/lint.mjs:162 SDL "step[1] = true" -> ""
test("R-STEP: under a steps heading, a numbered step with neither a backtick span nor a path is red; a command on a continuation line, a path in prose or a list under another heading is not [mutants: R-STEP check removed; continuation lines ignored]", () => {
  assert.deepEqual(red(H("## Steps\n1. Think hard.\n2. Run `scripts/present.mjs`.\n## \u00c0 fai\u0072e\n1. Decide.")), ["R-STEP", "R-STEP"]);
  assert.deepEqual(red(H("## Recette\n1. Rerun the suite,\n   then `scripts/present.mjs`.\n2. Read docs/ten.md again.\n## Notes\n3. Nothing to run.")), []);
});

// killer: scripts/mission/lint.mjs:163 COR "!pf && FABLE_CODER" -> "FABLE_CODER"
test("MODEL-FIELD-1: the Palier field is read before the prose; claude-fable-5-1 with an implementer or corrector role in the fields is red [mutants: proximity rule kept despite the field; Role field ignored]", () => {
  const F = (fields: string, body = "x"): string[] => red(`# MISSION G2 fixture\n${fields}\nbranch \`lot/x\`, base tronc \`${BASE}\`.\n${body}\n`);
  assert.deepEqual(F("Palier : `claude-opus-5-5`\nR\u00f4l\u0065 : G1 (impl\u00e9menteur)", "Never `claude-fable-5-1` corrector (decision 274)."), []);
  assert.deepEqual([F("Palier : `claude-fable-5-1`\nR\u00f4l\u0065 : G1"), F("Palier : `claude-fable-5-1`\nR\u00f4l\u0065 : corr"), F("Palier : `claude-fable-5-1`. R\u00f4l\u0065 : worker G1 (impl\u00e9menteur), effort max.")], [["R-MODEL"], ["R-MODEL"], ["R-MODEL"]]);
  assert.deepEqual([F("Palier : `claude-fable-5-1`\nR\u00f4l\u0065 : G2 (relecteur)"), F("Palier : `claude-opus-5-5`. R\u00f4l\u0065 : worker G1 (impl\u00e9menteur), effort max."), F("Palier : `gpt-5`\nR\u00f4l\u0065 : G2")], [[], [], ["R-MODEL"]]);
});

// killer: scripts/mission/lint.mjs:122 COR "(!generated && CREATE.test(raw))" -> "CREATE.test(raw)"
test("CREATE-SCOPE-1: in a mission stamped by gen.mjs only the to-create section declares, a creation word no longer does, the stamp line is never checked; a hand-written mission is unchanged [mutants: creation word still declares; stamp line checked]", () => {
  const body = "Write `docs/a.md` (nouveau).\n## \u00c0 cr\u00e9er\n- `docs/b.md`\n## Next\nSee `docs/b.md`.";
  assert.deepEqual(lint(stamped(H(body))).hits.map((h) => [h.code, h.line]), [["R-PATH", 4]]);
  assert.deepEqual(red(H(body)), []);
});

// Corrections, tour 1 (C-G2-1..3, C-G2-7): each test pins a decided behaviour; its killer is the correction removed, or the
// mutant the G2 measured surviving (G03..G16 of F:/tmp/methode/m2b/g2/mine/mine.mjs). One-line tests, no blank line between.
writeFileSync(join(REPO, "scripts", "forms.ts"), "var legacy = 1;\nenum Color { A }\nexport default mkThing;\n");
writeFileSync(join(REPO, "scripts", "imports.mjs"), "import { execFileSync } from \"node:child_process\";\n");
// killer: scripts/mission/lint.mjs:78 CONST "Z$/u;" -> "Z/u;"
test("stamp line anchored at its end (G13): a stamp line that carries more text is no stamp, every citation on it is checked", () => assert.deepEqual([lint(stamped(H("x"), `${STAMP} \`docs/absent.md\``)).hits.map((h) => h.code).sort(), red(stamped(H("x")))], [["R-PATH", "R-TOOL"], []]));
// killer: scripts/mission/lint.mjs:78 CONST "/^G" -> "/G"
test("stamp line anchored at its start: text before the stamp makes it no stamp, and the line is checked", () => assert.deepEqual([red(stamped(H("x"), `See ${STAMP}`)), red(stamped(H("x")))], [["R-TOOL"], []]));
// killer: scripts/mission/lint.mjs:178 CONST "rev === null ? TIERS.filter" -> "false ? TIERS.filter"
test("Sonnet 5.5 tier (decision 280, C-G2-1, Q-G2-9): a Palier field or a reader at claude-sonnet-5-5 is vert, claude-opus-5 stays red; the retired claude-sonnet-5 is red on disk (a new mission) and vert only in a --rev replay (a historical receipt)", () => {
  const F = (fields: string, rev: string | null = null): string[] => lint(`# MISSION G2 fixture\n${fields}\nbranch \`lot/x\`, base tronc \`${BASE}\`.\nx\n`, rev).hits.map((h) => h.code);
  assert.deepEqual([F("Palier : `claude-sonnet-5-5`\nR\u00f4l\u0065 : G2"), red(H("Readers `claude-sonnet-5-5`.")), F("Palier : `claude-opus-5`"), ...[null, BASE].map((rev) => F("Palier : `claude-sonnet-5`\nR\u00f4l\u0065 : G2", rev))], [[], [], ["R-MODEL"], ["R-MODEL"], []]);
});
// killer: scripts/mission/lint.mjs:84 CONST "[\"agent\", \"pipeline\", \"parallel\", \"phase\", \"log\", \"args\", \"budget\", \"workflow\"]" -> "[]"
test("workflow globals and imports (Q-M2B-6, C-G2-2, C-G2-15): the eight engine globals of a workflow script and a name bound on an import line are defined; any other undefined name stays red, engine-like ones (run, main, spawn) included: the list is closed", () => assert.deepEqual(red(H("Call `agent()`, `pipeline()`, `parallel()`, `phase()`, `log()`, `args()`, `budget()`, `workflow()`, the imported `execFileSync()`, not `nowhere()`, `run()`, `main()`, `spawn()`.")), new Array<string>(4).fill("R-SYMBOL")));
// killer: scripts/mission/lint.mjs:74 CONST "${FQ}" -> ""
test("French quotes (Q-M2B-7, C-G2-3, C-G2-14), R-VAGUE: a phrase of the list inside a pair of French quotes is a quotation; the same phrase stays red in bare prose, after an opening quote left unclosed on its line, before a lone closing quote", () => assert.deepEqual(red(H("Banned: \u00ab as needed \u00bb, \u00ab handle edge cases \u00bb; bare: as needed.\nUnclosed: \u00ab as needed.\nLone: as needed \u00bb.")), new Array<string>(3).fill("R-VAGUE")));
// killer: scripts/mission/lint.mjs:76 CONST "${FQ}" -> ""
test("French quotes (Q-M2B-7, C-G2-3), R-SIMILAR: a reference of the list inside a pair of French quotes is a quotation; the same reference in bare prose stays red", () => assert.deepEqual(red(H("Banned: \u00ab similar to Task 3 \u00bb; bare: like task 4.")), ["R-SIMILAR"]));
// killer: scripts/mission/lint.mjs:114 CONST "pf = PALIER.exec(src)" -> "pf = [...src.matchAll(new RegExp(PALIER.source, \"gmu\"))].pop() ?? null"
test("Palier precedence (G03): the Palier field of the header wins over a later Palier line of the body", () => assert.deepEqual(red(`# MISSION G2 fixture\nPalier : \`claude-fable-5-1\`\nR\u00f4l\u0065 : G1 (impl\u00e9menteur)\nbranch \`lot/x\`, base tronc \`${BASE}\`.\nPalier : \`claude-opus-5-5\`\n`), ["R-MODEL"]));
// killer: scripts/mission/lint.mjs:79 CONST "/^Palier" -> "/Palier"
test("Palier field anchored (G04): Palier at the start of a line is the field, in the middle of a line it is prose", () => assert.deepEqual([red(H("x").replace("Worker", "Palier : `gpt-5`\nWorker")), red(H("See the Palier : `gpt-5` example."))], [["R-MODEL"], []]));
// killer: scripts/mission/lint.mjs:126 COR "if (create) declared.add(tool[1]);" -> "if (create || CREATE.test(raw)) declared.add(tool[1]);"
test("stamped mission, bare tool (G06): a creation word never declares a bare tool there", () => assert.deepEqual(red(stamped(H("Write `made.ps1` (nouveau).\nRun `made.ps1`."))), ["R-TOOL", "R-TOOL"]));
// killer: scripts/mission/lint.mjs:161 COR "if (create) declared.add(m[1] ?? m[2]);" -> "if (create || CREATE.test(raw)) declared.add(m[1] ?? m[2]);"
test("stamped mission, symbol (G07): a creation word never declares a symbol there", () => assert.deepEqual(red(stamped(H("Write the function `fresh` (nouveau), then call `fresh()`."))), ["R-SYMBOL", "R-SYMBOL"]));
// killer: scripts/mission/lint.mjs:83 CONST "const|let|var|class|interface|type|enum" -> "const|let|class|interface|type"
test("definition forms var and enum (G11A, Q-M2B-11): a name defined by var or enum is defined; an undefined one stays red", () => assert.deepEqual(red(H("Call `legacy()`, `Color()`, not `ghost()`.")), ["R-SYMBOL"]));
// killer: scripts/mission/lint.mjs:83 CONST "|\\\\bexport\\\\s+default\\\\s+${s}\\\\b" -> ""
test("definition form export default (G11B, Q-M2B-11): a name exported as default is defined; an undefined one stays red", () => assert.deepEqual(red(H("Call `mkThing()`, not `ghost()`.")), ["R-SYMBOL"]));
// killer: scripts/mission/lint.mjs:162 CONST "`|^\\s*```/.test(raw)" -> "`/.test(raw)"
test("steps, fenced code block (G16): a fence under a step is its code; a step with none stays red", () => assert.deepEqual([red(H("## Steps\n1. Run:\n```\nnpm test\n```")), red(H("## Steps\n1. Think hard."))], [[], ["R-STEP"]]));
