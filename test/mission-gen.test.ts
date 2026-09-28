/**
 * Root test `mission_gen` (ADR-METHODE-2 D1, lot M-2b, decision 275-d). It drives scripts/mission/gen.mjs as a CLI over a
 * disposable git repository under the OS temp directory: a base commit carrying an ADR fixture whose lot table has a
 * `| M-X |` row, a second commit on the branch lot/x, a path deleted and a path left untracked in the working tree, and a
 * body with CRLF line ends, non-ASCII bytes and no final newline. The generated mission is linted by
 * scripts/mission/lint.mjs; each header field has its own test. The comment line above each test names the production
 * change that turns it red, in the format read by red-proof.mjs (production file:line, operator, before -> after).
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CODES, lintMission } from "../scripts/mission/lint.mjs";

const ROOT = join(import.meta.dirname, "..").replace(/\\/g, "/");
const T = mkdtempSync(join(tmpdir(), "monark-mission-gen-"));
after(() => rmSync(T, { recursive: true, force: true }));
const REPO = join(T, "repo");
const git = (...a: string[]): string =>
  execFileSync("git", ["-C", REPO, "-c", "user.name=t", "-c", "user.email=t@users.noreply.github.com", "-c", "core.autocrlf=false", ...a], { encoding: "utf8" }).trim();
mkdirSync(join(REPO, "docs", "adr"), { recursive: true });
writeFileSync(join(REPO, "docs", "adr", "ADR-X.md"), "# ADR-X\n| Lot | D |\n| M-X | D1 |\n");
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
const ZERO = Object.fromEntries(CODES.map((c) => [c, 0]));
const sha = (p: string): string => createHash("sha256").update(readFileSync(join(REPO, p))).digest("hex");
/** One gen.mjs run with the defaults below, overridden by `o` (an empty value drops the option); --out is a file of T. */
const gen = (out: string, o: Record<string, string> = {}) => {
  const opts = { lot: "M-X", role: "G1", tier: "claude-opus-5-5", repo: REPO, base: BASE, body: join(T, "body.md"), adr: "docs/adr/ADR-X.md", r25: "321", ...o, out: join(T, out) };
  return spawnSync(process.execPath, [join(ROOT, "scripts", "mission", "gen.mjs"), ...Object.entries(opts).filter(([, v]) => v !== "").flatMap(([k, v]) => [`--${k}`, v])], { encoding: "utf8" });
};
const read = (out: string): string => (existsSync(join(T, out)) ? readFileSync(join(T, out), "utf8") : "");
const MAIN = gen("main.md");
const LINES = read("main.md").split("\n");

// killer: scripts/mission/gen.mjs:80 ROR "lint.verdict === \"vert\"" -> "lint.verdict !== \"vert\""
test("generated mission: exit 0, written, report printed, lint vert with every count 0 [mutant: exit and write inverted on the verdict]", () => {
  assert.equal(MAIN.status, 0);
  assert.match(MAIN.stdout, /^verdict vert \(0 hit\(s\)\)$/m);
  const r = lintMission({ text: read("main.md"), missionPath: join(T, "main.md"), repo: REPO });
  assert.deepEqual([r.verdict, r.hits, r.counts], ["vert", [], ZERO]);
});

// killer: scripts/mission/gen.mjs:63 CONST "# MISSION " -> "# MISSIONS "
test("header field title: MISSION <role>, lot <lot>, UTC date", () => {
  assert.match(LINES[0] ?? "", /^# MISSION G1 \u2014 lot M-X \u2014 \d{4}-\d\d-\d\d$/);
});

// killer: scripts/mission/gen.mjs:64 CONST "Palier : " -> "Tier : "
test("header field Palier: the tier id in backticks, second line", () => {
  assert.equal(LINES[1], "Palier : `claude-opus-5-5`");
});

// killer: scripts/mission/gen.mjs:65 CONST "(${DUTY[o.role]})" -> "()"
test("header field Role: the --role and its duty, third line", () => {
  assert.equal(LINES[2], "R\u00f4l\u0065 : G1 (impl\u00e9menteur)");
});

// killer: scripts/mission/gen.mjs:66 CONST "gen.mjs ${stamp}" -> "gen.mjs ${stamp.slice(0, 10)}"
test("header field stamp: scripts/mission/gen.mjs and the UTC time to the second", () => {
  assert.match(LINES[3] ?? "", /^G\u00e9n\u00e9r\u00e9 : scripts\/mission\/gen\.mjs \d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
});

// killer: scripts/mission/gen.mjs:67 CONST "base.slice(0, 8)" -> "base.slice(0, 7)"
test("header field base: short and full sha of the pinned base", () => {
  assert.equal(LINES[4], `Base tronc \`${BASE.slice(0, 8)}\` (${BASE})`);
});

// killer: scripts/mission/gen.mjs:68 CONST "Branche " -> "Branch "
test("header field branch: the current branch of --repo", () => {
  assert.equal(LINES[5], "Branche `lot/x`");
});

// killer: scripts/mission/gen.mjs:69 CONST "Worktree " -> "Tree "
test("header field worktree: the resolved --repo with forward slashes", () => {
  assert.equal(LINES[6], `Worktree \`${REPO.replace(/\\/g, "/")}\``);
});

// killer: scripts/mission/gen.mjs:70 CONST "${head}" -> "${base}"
test("header field HEAD: the full sha of HEAD", () => {
  assert.equal(LINES[7], `HEAD \`${HEAD}\``);
});

// killer: scripts/mission/gen.mjs:59 CONST "digest(\"hex\")" -> "digest(\"base64\")"
test("header field changed paths: git diff of the base plus untracked files, each with its sha256, deleted paths counted only", () => {
  assert.match(LINES[8] ?? "", / : 2 chemin\(s\), sha256 ; 1 supprim\u00e9\(s\), non list\u00e9\(s\)$/);
  assert.deepEqual(LINES.slice(9, 11), [`- \`docs/later.md\` (A) \`${sha("docs/later.md")}\``, `- \`docs/loose.md\` (non suivi) \`${sha("docs/loose.md")}\``]);
});

// killer: scripts/mission/gen.mjs:53 CONST ":${n + 1}" -> ":${n}"
test("header field ADR anchor: the lot row of --adr cited path:line", () => {
  assert.equal(LINES[11], "Ancre ADR : `docs/adr/ADR-X.md:3`");
});

// killer: scripts/mission/gen.mjs:38 CONST "? 547 :" -> "? 548 :"
test("header field R-25 bound: --r25, else 547", () => {
  assert.equal(LINES[12], "Borne R-25 : 321 lignes (insertions + suppressions, job CI `r25-taille-de-lot`)");
  assert.equal(gen("r25.md", { r25: "" }).status, 0);
  assert.match(read("r25.md"), /^Borne R-25 : 547 lignes /m);
});

// killer: scripts/mission/gen.mjs:61 CONST "`${ROOT}/${t}`" -> "`${ROOT}/scripts/${t}`"
test("header field tools: lint, launch, oracle run and r25 by full path in the checkout of gen.mjs, red-proof.mjs only when on disk", () => {
  const rp = [`${ROOT}/scripts/red-proof.mjs`, "F:/Monark-wt-m4/scripts/red-proof.mjs"].filter((p) => existsSync(p)).slice(0, 1);
  const tools = [...["mission/lint.mjs", "mission/launch.mjs", "oracle/run.mjs", "oracle/r25.mjs"].map((t) => `${ROOT}/scripts/${t}`), ...rp];
  assert.equal(LINES[13], `Outils : ${tools.map((t) => `\`${t}\``).join(", ")}`);
});

// killer: scripts/mission/gen.mjs:76 CONST "? \"max\" : \"high\"" -> "? \"high\" : \"max\""
test("header field roster: the tier and its effort, max for claude-opus-5-5, high otherwise", () => {
  assert.equal(LINES[14], "Roster : palier `claude-opus-5-5`, effort `max` (d\u00e9cisions 262, 267 ; D12 (h))");
  assert.equal(gen("sonnet.md", { role: "G2", tier: "claude-sonnet-5" }).status, 0);
  assert.match(read("sonnet.md"), /^Roster : palier `claude-sonnet-5`, effort `high` /m);
});

// killer: scripts/mission/gen.mjs:78 CONST "body])" -> "body.subarray(1)])"
test("body copied byte for byte after the header: CRLF, non-ASCII, no final newline [mutant: body altered by one byte]", () => {
  const out = existsSync(join(T, "main.md")) ? readFileSync(join(T, "main.md")) : Buffer.alloc(0);
  const cut = out.length - BODY.length;
  assert.ok(cut > 0 && out.subarray(cut).equals(BODY));
  assert.match(out.subarray(0, cut).toString("utf8"), /\nRoster : [^\n]*\n$/);
});

// killer: scripts/mission/gen.mjs:94 SDL "if (g.exit !== 0)" -> ""
test("red fixture: a body citing an absent path is refused, exit 1, nothing written, the hit printed [mutant: written despite a red lint]", () => {
  writeFileSync(join(T, "red-body.md"), "Read `docs/absent.md`.\n");
  const r = gen("red.md", { body: join(T, "red-body.md"), role: "G2" });
  assert.deepEqual([r.status, existsSync(join(T, "red.md"))], [1, false]);
  assert.match(r.stdout, /^R-PATH .*red\.md:\d+ docs\/absent\.md absent$/m);
});

// killer: scripts/mission/gen.mjs:52 ROR "n < 0" -> "n < -1"
test("ADR anchor absent: exit 2, nothing written [mutant: absent anchor not refused]", () => {
  const r = gen("noanchor.md", { lot: "M-Y" });
  assert.deepEqual([r.status, existsSync(join(T, "noanchor.md"))], [2, false]);
  assert.match(r.stderr, /anchor absent/);
});

// killer: scripts/mission/gen.mjs:36 COR "!TIERS.includes(o.tier) ||" -> "false ||"
test("tier: the id banned by decision 267, and claude-fable-5-1 as G1 or corr, are refused before generation, exit 2, citing decision 274 [mutant: banned tier accepted]", () => {
  const cases: Record<string, string>[] = [{ tier: "claude-opus-5" }, { tier: "claude-fable-5-1" }, { tier: "claude-fable-5-1", role: "corr" }];
  for (const o of cases) {
    const r = gen("tier.md", o);
    assert.deepEqual([r.status, existsSync(join(T, "tier.md"))], [2, false]);
    assert.match(r.stderr, /decision 274/);
  }
});

// killer: scripts/mission/gen.mjs:35 COR "!ROLES.includes(o.role)" -> "false"
test("role outside G1|G2|cp-2|G7|corr, the vocabulary of oracle/run.mjs: exit 2, nothing written [mutant: unknown role accepted]", () => {
  const r = gen("role.md", { role: "G3" });
  assert.deepEqual([r.status, existsSync(join(T, "role.md"))], [2, false]);
  assert.match(r.stderr, /G1\|G2\|cp-2\|G7\|corr/);
});
