/**
 * Root test of the killer convention (ADR-METHODE-2 D2, lot KILLER-OPS-1): every `// killer:` comment line of the repository's code
 * (git grep over the tracked and untracked code files, docs/ out) can fire. It is read by parseKiller of scripts/red-proof.mjs and passes
 * the checks that decide the shot in killerProblem of that script (restated here, not exported: this lot touches no file outside test/),
 * which lostOf of scripts/mutants/run.mjs shares: an operator of the closed list OPS, which both scripts declare; a file inside the tree;
 * production code or a support module the test file imports, never test code; a line in range; SDL with an empty <after>, any other
 * operator changing the text; <before> exactly once on that line. A line that fails one is never fired by red-proof --draw nor by
 * mutants --killers: a silent gap, named here by file:line and the check it fails. A stale line number fails it too. The line above the
 * test is the mutation of the script that reddens it (killer convention). Governance-only.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { join, posix, sep } from "node:path";
import { gitOut } from "./helpers/git-tracked.ts";

const ROOT = join(import.meta.dirname, "..");
type Killer = { file: string; line: number; op: string; before: string; after: string };
// red-proof.d.mts declares no parseKiller: typed here, so that this test-only lot touches no file outside test/ (RED-PROOF-TEST-ONLY-1).
const { parseKiller } = (await import("../scripts/red-proof.mjs")) as unknown as { parseKiller: (line: string | undefined) => Killer | null };
const opsOf = (rel: string): string[] => JSON.parse(/^const OPS = (\[[^\]]*\])/m.exec(readFileSync(join(ROOT, rel), "utf8"))?.[1] ?? "null") as string[];
const OPS = opsOf("scripts/red-proof.mjs");
const text = new Map<string, string[]>();
const linesOf = (rel: string): string[] => text.get(rel) ?? (text.set(rel, readFileSync(join(ROOT, rel), "utf8").split("\n")), linesOf(rel));
/** supportOf of scripts/red-proof.mjs: the files a test file imports by a static relative import (MUTANTS-TEST-SUPPORT-1). */
const supportOf = (from: string): string[] => [...linesOf(from).join("\n").matchAll(/^\s*import\s+(?!type\s)(?:[^;"']*?\sfrom\s*)?["'](\.\.?\/[^"']+)["']/gm)]
  .map((m) => posix.join(posix.dirname(from), m[1] ?? ""));

/** Why the killer line `line` of the test file `from` cannot fire, or null: the checks of killerProblem, in its order. */
function problem(line: string, from: string): string | null {
  const k = parseKiller(line);
  if (k === null) return "unreadable";
  if (!OPS.includes(k.op)) return `operator ${k.op}`;
  if (!/^[\w.@-]+(\/[\w.@-]+)*$/.test(k.file) || k.file.split("/").includes("..") || !existsSync(join(ROOT, k.file)) || !realpathSync(join(ROOT, k.file)).startsWith(realpathSync(ROOT) + sep)) return "out of scope";
  if (/\.test\.ts$/.test(k.file) || (/(^|\/)test\//.test(k.file) && !supportOf(from).includes(k.file))) return "test code";
  const at = linesOf(k.file)[k.line - 1];
  if (at === undefined) return "out of range";
  if (k.op === "SDL" ? k.after !== "" : k.before === k.after) return "SDL with an <after>, or no change";
  return k.before !== "" && at.split(k.before).length === 2 ? null : "<before> not exactly once";
}

// killer: scripts/red-proof.mjs:33 CONST "(\\w+)" -> "(\\w)"
test("every_killer_line_is_readable", () => {
  assert.deepEqual([OPS, opsOf("scripts/mutants/run.mjs")], [["COR", "ROR", "SDL", "CONST"], ["COR", "ROR", "SDL", "CONST"]]);
  const probe = (k: string): string | null => problem(`  // killer: ${k}`, "test/killer-lines.test.ts");
  assert.deepEqual([probe('scripts/red-proof.mjs:33 CONST "(\\\\w+)" -> "(\\\\w)"'), probe('scripts/red-proof.mjs:33 drop-tail "(\\\\w+)" -> "(\\\\w)"'),
    probe('scripts/red-proof.mjs:33 LVR "(\\\\w+)" -> "(\\\\w)"'), probe('scripts/red-proof.mjs:32 CONST "(\\\\w+)" -> "(\\\\w)"'),
    probe('scripts/red-proof.mjs:33 CONST "(" -> "["'), probe('scripts/red-proof.mjs:9999 CONST "(" -> "["'), probe('scripts/red-proof.mjs:33 SDL "(\\\\w+)" -> "(\\\\w)"'),
    probe('scripts/nope.mjs:1 CONST "a" -> "b"'), probe('test/dojo-render.test.ts:76 CONST "t" -> "u"')],
  [null, "unreadable", "operator LVR", "<before> not exactly once", "<before> not exactly once", "out of range", "SDL with an <after>, or no change", "out of scope", "test code"],
  "the predicate names each check on a synthetic line: valid, a hyphenated operator, LVR, a stale line, an ambiguous <before>, past the end, SDL with an <after>, no file, test code");
  // git runs without the caller's GIT_* variables (a hook sets GIT_DIR or GIT_INDEX_FILE): gitOut of test/helpers/git-tracked.ts.
  const out = gitOut(ROOT, ["grep", "--untracked", "-n", "-I", "-E", "^[[:space:]]*// killer:", "--", "*.ts", "*.tsx", "*.mts", "*.cts", "*.mjs", "*.cjs", "*.js", ":(exclude)docs/**"]);
  const lines = out.split("\n").filter(Boolean).map((l) => /^([^:]+):(\d+):(.*)$/.exec(l) ?? ["", l, "0", ""]);
  assert.ok(lines.length > 1000, `only ${String(lines.length)} killer lines found`);
  const bad = lines.flatMap(([, file, n, line]) => { const p = problem(line ?? "", file ?? ""); return p === null ? [] : [`${String(file)}:${String(n)} ${p}`]; });
  assert.deepEqual(bad, []);
});
