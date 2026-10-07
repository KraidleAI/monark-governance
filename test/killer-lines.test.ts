/**
 * Root test of the killer convention (ADR-METHODE-2 D2, lot KILLER-OPS-1): every `// killer:` comment line of the repository's code
 * (git grep over the tracked and untracked code files, docs/ out) can fire. It is read by parseKiller of scripts/red-proof.mjs and judged
 * by killerProblem of that script, exported for this guard and called here, never restated: an operator of the closed list OPS, which
 * both scripts declare; a file inside the tree, no ".." segment; production code or a support module the test file imports, never a
 * *.test.ts; a line in range; SDL with an empty <after>, any other operator changing the text; <before> exactly once on that line.
 * lostOf of scripts/mutants/run.mjs applies a subset (no SDL => empty <after> check, no no-change check, no realpath confinement (inTree,
 * scripts/mutants/run.mjs:60); a support module is one any test file of the globs imports). A line that fails killerProblem is never
 * fired by red-proof --draw: a silent gap, named here by file:line and its reason. A stale line number fails it too. The line above the
 * test is the mutation of the script that reddens it (killer convention). Governance-only.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitOut } from "./helpers/git-tracked.ts";

const ROOT = join(import.meta.dirname, "..");
type Killer = { file: string; line: number; op: string; before: string; after: string };
// red-proof.d.mts declares neither function: typed here. killerProblem is exported for this guard; the script's main still runs only when launched.
const { parseKiller, killerProblem } = (await import("../scripts/red-proof.mjs")) as unknown as {
  parseKiller: (line: string | undefined) => Killer | null; killerProblem: (k: Killer, tree: string, from: string) => string | null };
const opsOf = (rel: string): string[] => JSON.parse(/^const OPS = (\[[^\]]*\])/m.exec(readFileSync(join(ROOT, rel), "utf8"))?.[1] ?? "null") as string[];
/** Why the killer line `line` of the test file `from` of `tree` cannot fire, or null: unreadable by parseKiller, else the reason killerProblem gives. */
const problem = (line: string, from: string, tree = ROOT): string | null => { const k = parseKiller(line); return k === null ? "unreadable" : killerProblem(k, tree, from); };

// killer: scripts/red-proof.mjs:33 CONST "(\\w+)" -> "(\\w)"
test("every_killer_line_is_readable", () => {
  assert.equal(typeof killerProblem, "function", "scripts/red-proof.mjs exports killerProblem: the guard calls the check itself");
  assert.deepEqual([opsOf("scripts/red-proof.mjs"), opsOf("scripts/mutants/run.mjs")], [["COR", "ROR", "SDL", "CONST"], ["COR", "ROR", "SDL", "CONST"]]);
  const probe = (k: string): string | null => problem(`  // killer: ${k}`, "test/killer-lines.test.ts"), rp = "scripts/red-proof.mjs";
  assert.deepEqual([probe(`${rp}:33 CONST "(\\\\w+)" -> "(\\\\w)"`), probe(`${rp}:33 drop-tail "(\\\\w+)" -> "(\\\\w)"`), probe(`${rp}:33 LVR "(\\\\w+)" -> "(\\\\w)"`),
    probe(`${rp}:32 CONST "(\\\\w+)" -> "(\\\\w)"`), probe(`${rp}:33 CONST "(" -> "["`), probe(`${rp}:9999 CONST "(" -> "["`), probe(`${rp}:33 SDL "(\\\\w+)" -> "(\\\\w)"`),
    probe('scripts/nope.mjs:1 CONST "a" -> "b"'), probe('test/dojo-render.test.ts:76 CONST "t" -> "u"')],
  [null, "unreadable", "operator LVR is not one of COR, ROR, SDL, CONST", `"(\\w+)" does not occur exactly once on ${rp}:32`, `"(" does not occur exactly once on ${rp}:33`,
    `${rp}:9999 is out of range`, "SDL takes an empty <after>; the other operators change the text", "scripts/nope.mjs is out of scope: not a file inside the gel clone",
    "test/dojo-render.test.ts is test code: a killer mutates production code"],
  "one synthetic line per outcome of the check: valid, a hyphenated operator, LVR, a stale line, an ambiguous <before>, past the end, SDL with an <after>, no file, test code");
  // killer: scripts/red-proof.mjs:60 CONST "k.before === k.after" -> "false"
  // killer: scripts/red-proof.mjs:56 CONST "k.file.split(\"/\").includes(\"..\")" -> "false"
  // killer: scripts/red-proof.mjs:57 CONST "!supportOf(tree, from).includes(k.file)" -> "false"
  assert.deepEqual([probe(`${rp}:33 CONST "(\\\\w+)" -> "(\\\\w+)"`), probe(`scripts/../${rp}:33 CONST "(\\\\w+)" -> "(\\\\w)"`),
    probe('test/helpers/keep-cause.ts:13 CONST "String.fromCharCode(10)" -> "String.fromCharCode(13)"')],
  ["SDL takes an empty <after>; the other operators change the text", `scripts/../${rp} is out of scope: not a file inside the gel clone`,
    "test/helpers/keep-cause.ts is test code: a killer mutates production code"],
  "the clauses only a probe tells apart: no change, a \"..\" segment, a support module the test file does not import");
  // killer: scripts/red-proof.mjs:56 CONST "!/^[\\w.@-]+(\\/[\\w.@-]+)*$/.test(k.file) || " -> ""
  // killer: scripts/red-proof.mjs:324 CONST "(?!type\\s)" -> ""
  const tmp = mkdtempSync(join(tmpdir(), "killer-lines-"));
  try {
    mkdirSync(join(tmp, "test", "helpers"), { recursive: true });
    writeFileSync(join(tmp, "test", "helpers", "h.ts"), "export type T = number;\nexport const one: T = 1;\n");
    writeFileSync(join(tmp, "test", "typed.test.ts"), 'import type { T } from "./helpers/h.ts";\n');
    writeFileSync(join(tmp, "test", "valued.test.ts"), 'import { one } from "./helpers/h.ts";\n');
    const h = '  // killer: test/helpers/h.ts:2 CONST "one: T = 1" -> "one: T = 2"';
    assert.deepEqual([problem(`  // killer: /${rp}:33 CONST "(\\\\w+)" -> "(\\\\w)"`, "test/killer-lines.test.ts"), problem(h, "test/typed.test.ts", tmp), problem(h, "test/valued.test.ts", tmp)],
      [`/${rp} is out of scope: not a file inside the gel clone`, "test/helpers/h.ts is test code: a killer mutates production code", null],
      "a leading / (join still resolves it inside the tree); a support module imported by `import type` only, then the same module imported by value");
    // killer: scripts/red-proof.mjs:61 CONST "k.before !== \"\" && " -> ""
    mkdirSync(join(tmp, "src"));
    writeFileSync(join(tmp, "src", "two.mjs"), "ab\n");
    assert.equal(problem('  // killer: src/two.mjs:1 CONST "" -> "x"', "test/t.test.ts", tmp), '"" does not occur exactly once on src/two.mjs:1',
      "an empty <before> on a line of two characters, the one line that clause alone refuses (\"ab\".split(\"\") has two parts)");
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  // git runs without the caller's GIT_* variables (a hook sets GIT_DIR or GIT_INDEX_FILE): gitOut of test/helpers/git-tracked.ts.
  const out = gitOut(ROOT, ["grep", "--untracked", "-n", "-I", "-E", "^[[:space:]]*// killer:", "--", "*.ts", "*.tsx", "*.mts", "*.cts", "*.mjs", "*.cjs", "*.js", ":(exclude)docs/**"]);
  const lines = out.split("\n").filter(Boolean).map((l) => /^([^:]+):(\d+):(.*)$/.exec(l) ?? ["", l, "0", ""]);
  assert.ok(lines.length > 1000, `only ${String(lines.length)} killer lines found`);
  const bad = lines.flatMap(([, file, n, line]) => { const p = problem(line ?? "", file ?? ""); return p === null ? [] : [`${String(file)}:${String(n)} ${p}`]; });
  assert.deepEqual(bad, []);
});
