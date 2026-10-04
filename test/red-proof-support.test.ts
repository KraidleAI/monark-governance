/**
 * Root test of scripts/red-proof.mjs for lot MUTANTS-TEST-SUPPORT-1 (amendment of the killer convention, ADR-METHODE-2 D2, 2026-10-04): a killer may mutate a
 * declared test support module, a file under test/ that its test file imports, never a *.test.ts. Fixture repository under TEMP, git isolated (GIT_* out, no
 * system nor global config): base lib/p.ts; gel lib/p.ts changed, test/place.ts (support, imports lib/p.ts), test/shared.test.ts (imported, a test file),
 * test/stray.ts (imported by no test) and test/place.test.ts, one test per killer. Kept apart from test/red-proof.test.ts, which this lot does not touch.
 * The line above each test is the mutation of the script that reddens it (killer convention). Governance-only.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { ProofRow, RedProof } from "../scripts/red-proof.mjs";

const CLI = join(import.meta.dirname, "..", "scripts", "red-proof.mjs");
const GIT_ENV = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith("GIT_"))), GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "" };
const root = mkdtempSync(join(tmpdir(), "red-proof-support-"));
after(() => { rmSync(root, { recursive: true, force: true, maxRetries: 5 }); });
function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", ["-c", "user.name=fixture", "-c", "user.email=fixture@localhost", "-c", "core.autocrlf=false", ...args], { cwd, encoding: "utf8", env: GIT_ENV });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
}
function commit(dir: string, files: Record<string, string>): string {
  for (const [p, text] of Object.entries(files)) { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), text); }
  git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", "c");
  return git(dir, "rev-parse", "HEAD");
}
let proof: { status: number | null; stderr: string; proof: RedProof } | undefined;
function prove(): { status: number | null; stderr: string; proof: RedProof } {
  if (proof !== undefined) return proof;
  const dir = join(root, "repo"), out = join(root, "out"), tmp = join(root, "tmp");
  mkdirSync(dir); mkdirSync(tmp); git(dir, "init", "-q", "-b", "main");
  const base = commit(dir, { "package.json": '{"name":"fx","private":true,"type":"module"}\n', "lib/p.ts": "export const P = 0;\n" });
  const gel = commit(dir, { "lib/p.ts": "export const P = 1;\n", "test/place.ts": 'import { P } from "../lib/p.ts";\nexport const frame = (n: number): number => (n < 126 ? P : 2 * P);\n',
    "test/shared.test.ts": "export const K = 1;\n", "test/stray.ts": "export const S = 1;\n",
    "test/place.test.ts": 'import { test } from "node:test";\nimport assert from "node:assert/strict";\nimport { P } from "../lib/p.ts";\nimport {\n  frame,\n} from "./place.ts";\nimport { K } from "./shared.test.ts";\n' +
      '// killer: test/place.ts:2 ROR "n < 126" -> "n <= 126"\ntest("support_killer", () => { assert.equal(frame(126), 2); });\n' +
      '// killer: test/shared.test.ts:1 CONST "1" -> "2"\ntest("test_file_killer", () => { assert.equal(K + P, 2); });\n' +
      '// killer: test/stray.ts:1 CONST "1" -> "2"\ntest("stray_killer", () => { assert.equal(P, 1); });\n' });
  const r = spawnSync(process.execPath, [CLI, "--base", base, "--gel", gel, "--repo", dir, "--out", out, "--draw", "3", "--seed", "1"], { encoding: "utf8", env: { ...GIT_ENV, TEMP: tmp, TMP: tmp, TMPDIR: tmp } });
  assert.ok(existsSync(join(out, "RED-PROOF.json")), `red-proof exited ${r.status} without a proof: ${r.stderr}`);
  proof = { status: r.status, stderr: r.stderr, proof: JSON.parse(readFileSync(join(out, "RED-PROOF.json"), "utf8")) as RedProof };
  return proof;
}
const row = (name: string): ProofRow | undefined => prove().proof.tests.find((t) => t.name === name);

// killer: scripts/red-proof.mjs:57 CONST "!supportOf(tree, from).includes(k.file)" -> "true"
test("red_proof_admits_a_killer_on_a_support_module_its_test_file_imports", () => {
  const { proof: p, stderr } = prove(), r = row("support_killer");
  assert.deepEqual([r?.base, r?.gel, r?.killerProblem, r?.verdict, p.draw?.drawn.map((d) => [d.name, d.killer.file, d.outcome])], ["assert-fail", "pass", null, "F2P",
    [["support_killer", "test/place.ts", "killed"]]], stderr);
});

// killer: scripts/red-proof.mjs:57 CONST "/\\.test\\.ts$/.test(k.file) || " -> ""
test("red_proof_still_refuses_a_test_file_or_an_unimported_module_under_test", () => {
  const { status, stderr } = prove(), why = (f: string): string => `invalid killer: ${f} is test code: a killer mutates production code`;
  assert.deepEqual([status, row("support_killer")?.killerProblem, ...["test_file_killer", "stray_killer"].map((n) => [row(n)?.verdict, row(n)?.reason])], [1, null,
    ["refused", why("test/shared.test.ts")], ["refused", why("test/stray.ts")]], stderr);
});
