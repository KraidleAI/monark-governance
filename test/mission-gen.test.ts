/**
 * Root test `mission_gen` (ADR-METHODE-2 D1, lot M-2b, decision 275-d). It drives scripts/mission/gen.mjs as a CLI over a
 * disposable git repository under the OS temp directory: a base commit, a second commit on the branch lot/x, a path deleted
 * and a path left untracked in the working tree, and a body with CRLF line ends, non-ASCII bytes and no final newline;
 * --tools-root names a fixture directory holding the ADR (its lot table has a `| M-X |` row), the rules file and five stub
 * tools. The generated mission is linted by scripts/mission/lint.mjs in a CHILD process: this file never imports lint.mjs,
 * so a lint.mjs that dies while loading reddens a test here instead of killing the file (mutant G10 of the G2). The pipe
 * gen -> launch.mjs -> receipt -> launch-guard block is replayed end to end (CLAUDE.md rule Branchement, C-G2-5). The
 * comment line above each test names the production change that turns it red, in the format read by red-proof.mjs
 * (production file:line, operator, before -> after).
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, copyFileSync, existsSync, linkSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { runInNewContext } from "node:vm";

const ROOT = join(import.meta.dirname, "..").replace(/\\/g, "/");
const T = mkdtempSync(join(tmpdir(), "monark-mission-gen-"));
after(() => rmSync(T, { recursive: true, force: true }));
const REPO = join(T, "repo"), R2 = join(T, "repo2"), TOOLS = join(T, "tools").replace(/\\/g, "/"), NORP = join(T, "norp").replace(/\\/g, "/");
const gitIn = (repo: string, ...a: string[]): string =>
  execFileSync("git", ["-C", repo, "-c", "user.name=t", "-c", "user.email=t@users.noreply.github.com", "-c", "core.autocrlf=false", ...a], { encoding: "utf8" }).trim();
const git = (...a: string[]): string => gitIn(REPO, ...a);
const shaOf = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
for (const f of ["scripts/mission/lint.mjs", "scripts/mission/launch.mjs", "scripts/oracle/run.mjs", "scripts/oracle/r25.mjs", "scripts/red-proof.mjs", "docs/adr/ADR-X.md", "docs/methode/REGLES-MISSION.md"]) for (const d of f.endsWith("red-proof.mjs") ? [TOOLS] : [TOOLS, NORP]) {
  mkdirSync(dirname(join(d, f)), { recursive: true }); // NORP: the same fixture root without scripts/red-proof.mjs
  writeFileSync(join(d, f), f.endsWith("ADR-X.md") ? "# ADR-X\n| Lot | D |\n| M-X | D1 |\n" : f.endsWith(".md") ? "Rules: no network; TEMP under the lot directory.\n" : `// stub ${f}\n`);
}
mkdirSync(join(REPO, "docs"), { recursive: true });
writeFileSync(join(REPO, "docs", "ten.md"), "l\n".repeat(10));
writeFileSync(join(REPO, "docs", "gone.md"), "gone\n");
git("init", "-q", "-b", "main");
git("add", "-A");
git("commit", "-q", "-m", "c1");
const BASE = git("rev-parse", "HEAD");
git("checkout", "-q", "-b", "lot/x");
writeFileSync(join(REPO, "docs", "later.md"), "later\n");
git("add", "-A");
git("commit", "-q", "-m", "c2");
const HEAD = git("rev-parse", "HEAD");
rmSync(join(REPO, "docs", "gone.md"));
writeFileSync(join(REPO, "docs", "loose.md"), "untracked\n");
const BODY = Buffer.from("## Entr\u00e9es\r\nRead `docs/ten.md:10`.\r\n## Review Focus\r\n- class a: test t1\r\n## \u00c0 cr\u00e9er\r\n- `docs/out.md`", "utf8");
writeFileSync(join(T, "body.md"), BODY);
// repo2: a rename committed on the lot (git mv) and a file ignored by .gitignore in the working tree; body2 cites nothing.
mkdirSync(join(R2, "docs"), { recursive: true });
writeFileSync(join(R2, "docs", "old.md"), "moved\n".repeat(5));
writeFileSync(join(R2, ".gitignore"), "*.log\n");
for (const a of [["init", "-q", "-b", "main"], ["add", "-A"], ["commit", "-q", "-m", "c1"], ["mv", "docs/old.md", "docs/new.md"], ["commit", "-q", "-m", "c2"]]) gitIn(R2, ...a);
writeFileSync(join(R2, "docs", "x.log"), "ignored\n");
writeFileSync(join(T, "body2.md"), "x\n");
const sha = (p: string): string => shaOf(readFileSync(join(REPO, p)));
/** One run of `script` (default: the gen.mjs of this checkout) with the defaults below, overridden by `o` (an empty value drops the option); --out is a file of T. */
const gen = (out: string, o: Record<string, string> = {}, script = join(ROOT, "scripts", "mission", "gen.mjs")) => {
  const opts = { lot: "M-X", role: "G1", tier: "claude-opus-5-5", repo: REPO, base: BASE, body: join(T, "body.md"), adr: "docs/adr/ADR-X.md", r25: "321", "tools-root": TOOLS, ...o, out: join(T, out) };
  return spawnSync(process.execPath, [script, ...Object.entries(opts).filter(([, v]) => v !== "").flatMap(([k, v]) => [`--${k}`, v])], { encoding: "utf8" });
};
const read = (out: string): string => (existsSync(join(T, out)) ? readFileSync(join(T, out), "utf8") : "");
const bytesOf = (out: string): Buffer => (existsSync(join(T, out)) ? readFileSync(join(T, out)) : Buffer.alloc(0));
const launch = (out: string) => spawnSync(process.execPath, [join(ROOT, "scripts", "mission", "launch.mjs"), join(T, out), "--repo", REPO], { encoding: "utf8" });
type Recu = { sha?: string; verdict?: string; head?: string };
const recu = (name: string): Recu => (existsSync(join(T, name)) ? JSON.parse(readFileSync(join(T, name), "utf8")) as Recu : {});
const MAIN = gen("main.md");
const LINES = read("main.md").split("\n");
const PRINTED = /^sha256 ([0-9a-f]{64}) /m.exec(MAIN.stdout)?.[1];

// killer: scripts/mission/gen.mjs:95 ROR "lint.verdict === \"vert\"" -> "lint.verdict !== \"vert\""
test("generated mission: exit 0, written, report printed; lint.mjs, loaded by a child process, finds it vert with every count 0 [mutants: exit and write inverted on the verdict; lint.mjs dead while loading (G10)]", () => {
  assert.equal(MAIN.status, 0);
  assert.match(MAIN.stdout, /^verdict vert \(0 hit\(s\)\)$/m);
  const r = spawnSync(process.execPath, [join(ROOT, "scripts", "mission", "lint.mjs"), join(T, "main.md"), "--repo", REPO, "--json"], { encoding: "utf8" });
  const j = JSON.parse(r.status === 0 ? r.stdout : "{}") as { verdict?: string; hits?: unknown[]; counts?: Record<string, number> };
  assert.deepEqual([r.status, j.verdict, j.hits, Object.values(j.counts ?? {}).filter((n) => n !== 0), Object.keys(j.counts ?? {}).length], [0, "vert", [], [], 12]);
});

// killer: scripts/mission/gen.mjs:77 CONST "# MISSION " -> "# MISSIONS "
test("header field title: MISSION <role>, lot <lot>, UTC date", () => {
  assert.match(LINES[0] ?? "", /^# MISSION G1 \u2014 lot M-X \u2014 \d{4}-\d\d-\d\d$/);
});

// killer: scripts/mission/gen.mjs:78 CONST "Palier : " -> "Tier : "
test("header field Palier: the tier id in backticks, second line", () => {
  assert.equal(LINES[1], "Palier : `claude-opus-5-5`");
});

// killer: scripts/mission/gen.mjs:79 CONST "(${DUTY[o.role]})" -> "()"
test("header field Role: the --role and its duty, third line", () => {
  assert.equal(LINES[2], "R\u00f4l\u0065 : G1 (impl\u00e9menteur)");
});

// killer: scripts/mission/gen.mjs:80 CONST "${ROOT}/scripts/mission/gen.mjs" -> "scripts/mission/gen.mjs"
test("header field stamp: the absolute path of gen.mjs in its checkout, the short sha of that checkout's HEAD, the sha256 of the gen.mjs bytes on disk, the UTC time to the second (Q-G2-6, MISSION-GEN-SELF-SHA-1)", () => {
  const g = join(ROOT, "scripts", "mission", "gen.mjs"), head = execFileSync("git", ["-C", ROOT, "rev-parse", "HEAD"], { encoding: "utf8" }).trim().slice(0, 8), want =`G\u00e9n\u00e9r\u00e9 : \`${ROOT}/scripts/mission/gen.mjs\` \`${head}\` sha256 \`${shaOf(existsSync(g) ? readFileSync(g) : "")}\` `, line = LINES[3] ?? "";
  assert.deepEqual([line.slice(0, want.length), /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(line.slice(want.length))], [want, true]);
});

// killer: scripts/mission/gen.mjs:81 CONST "base.slice(0, 8)" -> "base.slice(0, 7)"
test("header field base: short and full sha of the pinned base", () => {
  assert.equal(LINES[4], `Base tronc \`${BASE.slice(0, 8)}\` (${BASE})`);
});

// killer: scripts/mission/gen.mjs:82 CONST "Branche " -> "Branch "
test("header field branch: the current branch of --repo", () => {
  assert.equal(LINES[5], "Branche `lot/x`");
});

// killer: scripts/mission/gen.mjs:83 CONST "Worktree " -> "Tree "
test("header field worktree: the resolved --repo with forward slashes", () => {
  assert.equal(LINES[6], `Worktree \`${REPO.replace(/\\/g, "/")}\``);
});

// killer: scripts/mission/gen.mjs:84 CONST "${head}" -> "${base}"
test("header field HEAD: the full sha of HEAD", () => {
  assert.equal(LINES[7], `HEAD \`${HEAD}\``);
});

// killer: scripts/mission/gen.mjs:34 CONST "digest(\"hex\")" -> "digest(\"base64\")"
test("header field changed paths: base -> HEAD + working tree (committed, uncommitted, untracked), each with its sha256, deleted paths counted only (Q-M2B-3)", () => {
  assert.equal(LINES[8], "Changements base \u2192 HEAD + arbre de travail (commis, non commis, non suivis) : 2 chemin(s), sha256 ; 1 supprim\u00e9(s), non list\u00e9(s)");
  assert.deepEqual(LINES.slice(9, 11), [`- \`docs/later.md\` (A) \`${sha("docs/later.md")}\``, `- \`docs/loose.md\` (non suivi) \`${sha("docs/loose.md")}\``]);
});

// killer: scripts/mission/gen.mjs:68 CONST ":${n + 1}" -> ":${n}"
test("header field ADR anchor: the lot row of --adr under --tools-root, cited by absolute path:line, the tree of the anchor named (Q-G2-5)", () => {
  assert.equal(LINES[11], `Ancre ADR : \`${TOOLS}/docs/adr/ADR-X.md:3\``);
});

// killer: scripts/mission/gen.mjs:44 CONST "? 547 :" -> "? 548 :"
test("header field R-25 bound: --r25, else 547", () => {
  assert.equal(LINES[12], "Borne R-25 : 321 lignes (insertions + suppressions, job CI `r25-taille-de-lot`)");
  assert.equal(gen("r25.md", { r25: "" }).status, 0);
  assert.match(read("r25.md"), /^Borne R-25 : 547 lignes /m);
});

// killer: scripts/mission/gen.mjs:52 CONST "`${toolsRoot}/${t}`" -> "`${toolsRoot}/scripts/${t}`"
test("header field tools: lint, launch, oracle run, r25 and red-proof by full path under --tools-root (default: the checkout of gen.mjs, refused while it lacks scripts/red-proof.mjs, i.e. before the fusion of M-4: no fallback, MISSION-GEN-REDPROOF-PATH-1), each with its sha256 (Q-G2-4, C-G2-12)", () => {
  const cite = (p: string): string => `\`${p}\` sha256 \`${shaOf(existsSync(p) ? readFileSync(p) : "")}\``;
  assert.equal(LINES[13], `Outils : ${["mission/lint.mjs", "mission/launch.mjs", "oracle/run.mjs", "oracle/r25.mjs", "red-proof.mjs"].map((t) => cite(`${TOOLS}/scripts/${t}`)).join(", ")}`);
  const d = gen("root.md", { "tools-root": "", adr: "", rules: `${TOOLS}/docs/methode/REGLES-MISSION.md` }), rp = existsSync(join(ROOT, "scripts", "red-proof.mjs"));
  assert.deepEqual([d.status, rp ? read("root.md").includes(`\nOutils : ${cite(`${ROOT}/scripts/mission/lint.mjs`)}, ${cite(`${ROOT}/scripts/mission/launch.mjs`)}, `) : d.stderr.includes(`: ${ROOT}/scripts/red-proof.mjs absent`)], [rp ? 0 : 2, true]);
});

// killer: scripts/mission/gen.mjs:90 CONST "? \"max\" : \"high\"" -> "? \"high\" : \"max\""
test("header field roster: the tier and its effort, max for claude-opus-5-5, high otherwise (claude-sonnet-5-5, decision 280)", () => {
  assert.equal(LINES[14], "Roster : palier `claude-opus-5-5`, effort `max` (d\u00e9cisions 262, 267 ; D12 (h))");
  assert.equal(gen("sonnet.md", { role: "G2", tier: "claude-sonnet-5-5" }).status, 0);
  assert.match(read("sonnet.md"), /^Roster : palier `claude-sonnet-5-5`, effort `high` /m);
});

// killer: scripts/mission/gen.mjs:93 CONST "rules, " -> ""
test("header field rules: path and sha256 of --rules (default under --tools-root), then its bytes verbatim, a LF when they lack one, then the body, lint vert; an absent file refused, exit 2, nothing written (Q-M2B-9)", () => {
  const rules = `${TOOLS}/docs/methode/REGLES-MISSION.md`, alt = join(T, "alt-rules.md"), ALT = Buffer.from("Alt rules: no \u00e9dition, no final newline", "utf8");
  writeFileSync(alt, ALT);
  const field = `R\u00e8gles : \`${alt.replace(/\\/g, "/")}\` sha256 \`${shaOf(ALT)}\`\n`, r = gen("rules.md", { rules: alt }), out = bytesOf("rules.md"), at = out.indexOf(field);
  assert.deepEqual([LINES[15], r.status, at > 0, out.subarray(at + Buffer.byteLength(field)).equals(Buffer.concat([ALT, Buffer.of(10), BODY]))], [`R\u00e8gles : \`${rules}\` sha256 \`${shaOf(readFileSync(rules))}\``, 0, true, true]);
  assert.deepEqual([gen("norules.md", { rules: join(T, "absent-rules.md") }).status, existsSync(join(T, "norules.md"))], [2, false]);
});

// killer: scripts/mission/gen.mjs:93 CONST "body])" -> "body.subarray(1)])"
test("body copied byte for byte after the header and the rules: CRLF, non-ASCII, no final newline [mutant: body altered by one byte]", () => {
  const out = bytesOf("main.md"), cut = out.length - BODY.length;
  assert.ok(cut > 0 && out.subarray(cut).equals(BODY));
  assert.match(out.subarray(0, cut).toString("utf8"), /\nR\u00e8gles : [^\n]*\nRules: no network; TEMP under the lot directory\.\n$/);
});

// killer: scripts/mission/gen.mjs:112 CONST "readFileSync(g.out)" -> "g.bytes.subarray(1)"
test("pipe gen -> launch.mjs -> launch-guard block (rule Branchement, MISSION-GEN-LAUNCH-1): the receipt is vert, its head the HEAD of --repo, its sha256 the one gen printed; assertRecu, run with no import, lets exactly the generated text through to agent()", () => {
  const l = launch("main.md"), r = recu("main.recu.json"), text = read("main.md"), got: string[] = [];
  assert.deepEqual([l.status, r.verdict, r.head, r.sha], [0, "vert", HEAD, PRINTED]);
  const block = /\/\/ BEGIN launch-guard\r?\n([\s\S]*?)\/\/ END launch-guard/.exec(readFileSync(join(ROOT, "scripts", "mission", "launch-guard.js"), "utf8"))?.[1] ?? "";
  // killer: scripts/mission/launch-guard.js:15 CONST "return args.mission;" -> "return args.mission.slice(1);"
  try { runInNewContext(`${block}\nagent(assertRecu(args));`, { args: { recu: r, mission: text }, agent: (t: string) => got.push(t) }); } catch { /* refused: no agent() */ }
  assert.deepEqual([got, text.length > 0], [[text], true]);
});

// killer: scripts/mission/gen.mjs:112 CONST "readFileSync(g.out)" -> "Buffer.alloc(0)"
test("pipe gen -> launch.mjs, body edited after generation (Review Focus 4, item I-1): the receipt stays vert with the sha256 of the edited bytes, which differs from the sha gen printed", () => {
  const edited = Buffer.concat([bytesOf("main.md"), Buffer.of(10), Buffer.from("One more line.", "utf8")]);
  writeFileSync(join(T, "edited.md"), edited);
  const l = launch("edited.md"), r = recu("edited.recu.json");
  assert.deepEqual([PRINTED, l.status, r.verdict, r.sha], [shaOf(bytesOf("main.md")), 0, "vert", shaOf(edited)]);
  assert.notEqual(r.sha, PRINTED);
});

// killer: scripts/mission/gen.mjs:109 SDL "if (g.exit !== 0)" -> ""
test("red fixture: a body citing an absent path is refused, exit 1, nothing written, the hit printed [mutant: written despite a red lint]", () => {
  writeFileSync(join(T, "red-body.md"), "Read `docs/absent.md`.\n");
  const r = gen("red.md", { body: join(T, "red-body.md"), role: "G2" });
  assert.deepEqual([r.status, existsSync(join(T, "red.md"))], [1, false]);
  assert.match(r.stdout, /^R-PATH .*red\.md:\d+ docs\/absent\.md absent$/m);
});

// killer: scripts/mission/gen.mjs:67 ROR "n < 0" -> "n < -1"
test("ADR anchor absent: exit 2, nothing written [mutant: absent anchor not refused]", () => {
  const r = gen("noanchor.md", { lot: "M-Y" });
  assert.deepEqual([r.status, existsSync(join(T, "noanchor.md"))], [2, false]);
  assert.match(r.stderr, /anchor absent/);
});

// killer: scripts/mission/gen.mjs:41 COR "!TIERS.includes(o.tier) ||" -> "false ||"
test("tier: the id banned by decision 267, and claude-fable-5-1 as G1 or corr, are refused before generation, exit 2, citing decision 274 [mutant: banned tier accepted]", () => {
  const cases: Record<string, string>[] = [{ tier: "claude-opus-5" }, { tier: "claude-fable-5-1" }, { tier: "claude-fable-5-1", role: "corr" }];
  for (const o of cases) {
    const r = gen("tier.md", o);
    assert.deepEqual([r.status, existsSync(join(T, "tier.md"))], [2, false]);
    assert.match(r.stderr, /decision 274/);
  }
});

// killer: scripts/mission/gen.mjs:43 COR "if (o.tier === \"claude-sonnet-5\")" -> "if (false)"
test("retired tier claude-sonnet-5 (decision 280): refused by gen.mjs for a new mission, exit 2, nothing written, with its motif; the linter keeps it for --rev replays", () => {
  const r = gen("retired.md", { role: "G2", tier: "claude-sonnet-5" });
  assert.deepEqual([r.status, existsSync(join(T, "retired.md")), /palier retir\u00e9, d\u00e9cision 280/.test(r.stderr)], [2, false, true]);
});

// killer: scripts/mission/gen.mjs:40 COR "!ROLES.includes(o.role)" -> "false"
test("role outside G1|G2|cp-2|G7|corr, the vocabulary of oracle/run.mjs: exit 2, nothing written [mutant: unknown role accepted]", () => {
  const r = gen("role.md", { role: "G3" });
  assert.deepEqual([r.status, existsSync(join(T, "role.md"))], [2, false]);
  assert.match(r.stderr, /G1\|G2\|cp-2\|G7\|corr/);
});

// killer: scripts/mission/gen.mjs:49 COR "existsSync(out) && existsSync(o.body) && id(out) === id(o.body)" -> "false"
test("--out naming the --body file, by its path, a hard link or (win32) another letter case: refused before any write, by path or by (dev, ino), exit 2, the body untouched (G09, G09-CASE, C-G2-8)", () => {
  linkSync(join(T, "body.md"), join(T, "hard.md"));
  // killer: scripts/mission/gen.mjs:47 COR "if (out === resolve(o.body)) return" -> "if (false) return"
  for (const [out, why] of [["body.md", /--out would overwrite --body/], ["hard.md", /same dev and ino/], ...(process.platform === "win32" ? [["BODY.md", /same dev and ino/]] : [])] as [string, RegExp][]) {
    const r = gen(out);
    assert.deepEqual([out, r.status, why.test(r.stderr), readFileSync(join(T, "body.md")).equals(BODY)], [out, 2, true, true]);
  }
});

// killer: scripts/mission/gen.mjs:57 COR "body[0] === 0xef && " -> "false && "
test("a --body starting with a UTF-8 BOM: refused, exit 2, nothing written; the BOM would hide its first line from R-STEP (C-G2-9)", () => {
  writeFileSync(join(T, "bom.md"), Buffer.concat([Buffer.of(0xef, 0xbb, 0xbf), BODY]));
  const r = gen("bom-out.md", { body: join(T, "bom.md") });
  assert.deepEqual([r.status, existsSync(join(T, "bom-out.md")), /UTF-8 BOM/.test(r.stderr)], [2, false, true]);
});

// killer: scripts/mission/gen.mjs:70 CONST "\"--no-renames\", " -> ""
test("changed paths when the lot renames a file (git mv) and the working tree holds a file ignored by .gitignore: the new path listed (A), the old one counted as deleted, the ignored file never listed (G12, G15)", () => {
  // killer: scripts/mission/gen.mjs:72 CONST "\"--exclude-standard\", " -> ""
  const r = gen("rename.md", { repo: R2, base: "main~1", role: "G2", body: join(T, "body2.md") }), got = read("rename.md").split("\n");
  assert.deepEqual([r.status, got[8]?.endsWith(" : 1 chemin(s), sha256 ; 1 supprim\u00e9(s), non list\u00e9(s)"), got[9]?.startsWith("- `docs/new.md` (A) "), got.some((l) => l.includes("x.log"))], [0, true, true, false]);
});

// killer: docs/methode/REGLES-MISSION.md:1 CONST "option `--rules`" -> "`scripts/mission/gen.mjs --rules`"
test("the REAL rules of the generator checkout (docs/methode/REGLES-MISSION.md, the default under that --tools-root) over a repository without scripts/ (C-G2-13): they cite host drive paths and no hit falls on a repo-relative path; a drive path may be absent off this host (MISSION-TESTS-LINUX-1) [mutants: a repo-relative path back in the rules; stub rules substituted]", () => {
  const rules = join(ROOT, "docs", "methode", "REGLES-MISSION.md"), r = gen("real-rules.md", { rules }), hits = r.stdout.split("\n").filter((l) => l.startsWith("R-"));
  assert.deepEqual([r.status === 0 || hits.length > 0, hits.filter((l) => !/:\d+ [A-Za-z]:\/\S* absent$/.test(l)), /`[A-Za-z]:\/[^`]+`/.test(existsSync(rules) ? readFileSync(rules, "utf8") : "")], [true, [], true]);
});
// killer: scripts/mission/gen.mjs:53 CONST "lost.length > 0" -> "false"
test("--tools-root lacking a tool (C-G2-16, MISSION-GEN-REDPROOF-PATH-1): a root that does not exist, or one without scripts/red-proof.mjs, is refused before any git read, exit 2, nothing written, each absent tool named; never an uncaught ENOENT, never a fallback to another tree", () => {
  const none = `${TOOLS}-none`, a = gen("none.md", { "tools-root": none, rules: `${TOOLS}/docs/methode/REGLES-MISSION.md` }), b = gen("norp.md", { "tools-root": NORP });
  assert.deepEqual([a.status, a.stderr.includes(`--tools-root ${none}: ${none}/scripts/mission/lint.mjs, `), b.status, b.stderr.includes(`--tools-root ${NORP}: ${NORP}/scripts/red-proof.mjs absent`), existsSync(join(T, "none.md")) || existsSync(join(T, "norp.md"))], [2, true, 2, true, false]);
});
// killer: scripts/mission/gen.mjs:34 CONST "readFileSync(fileURLToPath(import.meta.url))" -> "execFileSync(\"git\", [\"-C\", ROOT, \"show\", \"HEAD:scripts/mission/gen.mjs\"])"
test("stamp of a dirty checkout of gen.mjs whose path holds a blank, --out in a directory holding a blank and a backtick (MISSION-GEN-SELF-SHA-1, MISSION-GEN-PATH-SPACE-1): the sha256 of the bytes that ran, not of HEAD; the stamp stays recognised, so a creation word no longer declares (R-PATH); a checkout path holding a backtick is refused, exit 2, nothing written", () => {
  const cp = (d: string): string => { mkdirSync(join(d, "scripts", "mission"), { recursive: true }); for (const f of ["gen.mjs", "lint.mjs"]) if (existsSync(join(ROOT, "scripts", "mission", f))) copyFileSync(join(ROOT, "scripts", "mission", f), join(d, "scripts", "mission", f)); return join(d, "scripts", "mission", "gen.mjs"); }, co = join(T, "co x"), g = cp(co), tick = cp(join(T, "co`x"));
  for (const a of [["init", "-q", "-b", "main"], ["add", "-A"], ["commit", "-q", "-m", "co"]]) gitIn(co, ...a);
  appendFileSync(g, "// uncommitted\n"); writeFileSync(join(T, "word.md"), "Write `docs/new.md` (nouveau).\n");
  const ok = gen("o `x/dirty.md", {}, g), word = gen("o `x/word.md", { role: "G2", body: join(T, "word.md") }, g), bt = gen("tick.md", {}, tick);
  assert.deepEqual([ok.status, read("o `x/dirty.md").split("\n")[3]?.startsWith(`G\u00e9n\u00e9r\u00e9 : \`${co.replace(/\\/g, "/")}/scripts/mission/gen.mjs\` \`${gitIn(co, "rev-parse", "HEAD").slice(0, 8)}\` sha256 \`${shaOf(readFileSync(g))}\` `), word.status, /^R-PATH .* docs\/new\.md absent$/m.test(word.stdout), bt.status, /backtick/.test(bt.stderr), existsSync(join(T, "tick.md"))], [0, true, 1, true, 2, true, false]);
});
