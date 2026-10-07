/**
 * Root test of the killer convention (ADR-METHODE-2 D2, lot KILLER-OPS-1): every `// killer:` comment line of the repository's code
 * (git grep over the tracked and untracked code files, docs/ out) is read by parseKiller of scripts/red-proof.mjs and carries an
 * operator of the closed list OPS of that script, which scripts/mutants/run.mjs repeats. A line parseKiller cannot read, or whose
 * operator lies outside OPS, is never fired by red-proof --draw nor by mutants --killers: a silent gap, named here by file:line.
 * The line above the test is the mutation of the script that reddens it (killer convention). Governance-only.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
// red-proof.d.mts declares no parseKiller: typed here, so that this test-only lot touches no file outside test/ (RED-PROOF-TEST-ONLY-1).
const { parseKiller } = (await import("../scripts/red-proof.mjs")) as unknown as { parseKiller: (line: string | undefined) => { op: string } | null };
const opsOf = (rel: string): string[] => JSON.parse(/^const OPS = (\[[^\]]*\])/m.exec(readFileSync(join(ROOT, rel), "utf8"))?.[1] ?? "null") as string[];

// killer: scripts/red-proof.mjs:33 CONST "(\\w+)" -> "(\\w)"
test("every_killer_line_is_readable", () => {
  const OPS = opsOf("scripts/red-proof.mjs");
  assert.deepEqual([OPS, opsOf("scripts/mutants/run.mjs")], [["COR", "ROR", "SDL", "CONST"], ["COR", "ROR", "SDL", "CONST"]]);
  const r = spawnSync("git", ["grep", "--untracked", "-n", "-I", "-E", "^[[:space:]]*// killer:", "--", "*.ts", "*.tsx", "*.mts", "*.cts", "*.mjs", "*.cjs", "*.js", ":(exclude)docs/**"],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.split("\n").filter(Boolean).map((l) => /^([^:]+):(\d+):(.*)$/.exec(l) ?? ["", l, "0", ""]);
  assert.ok(lines.length > 1000, `only ${String(lines.length)} killer lines found`);
  const bad = lines.flatMap(([, file, n, text]) => { const k = parseKiller(text); return k !== null && OPS.includes(k.op) ? [] : [`${file}:${n} ${k === null ? "unreadable" : k.op}`]; });
  assert.deepEqual(bad, []);
});
