/**
 * Non-LLM regression pinning the SCOPE ROUTING of scripts/lang-gate.mjs (C-11 i, ADR-EC; checkpoint-2
 * V-1). WHY: test 42 (c-bis, test/export-public.test.ts) runs `lang-gate --scope sentinel,bell` on the
 * repo SOURCE tree, so a French token in apps/bell/src or apps/sentinel/src reds CI. But that call only
 * bites if classifyScope routes those trees to the `bell`/`sentinel` scopes. Checkpoint-2 measured mutant
 * Md — delete the `apps/bell` branch of classifyScope (SCOPES intact) — which silently re-routes
 * apps/bell/** to `root`, a scope the source-tree call does NOT select: French in apps/bell/src then slips
 * through FAIL-OPEN (the "false-green guard" MAST mode). No test pinned classifyScope/SCOPES; this file
 * does, so Md reds HERE. classifyScope/SCOPES are imported from lang-gate.mjs (already exported there; the
 * .mjs is byte-untouched — the type surface lives in scripts/lang-gate.d.mts). Governance-only (root
 * test/, not in the public-export whitelist).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { classifyScope, SCOPES, skipDir, collectTextFiles } from "../scripts/lang-gate.mjs";

const REPO_ROOT = join(import.meta.dirname, "..");

test("lang_gate_classifyScope_routes_off_tool_app_source_trees", () => {
  // The two off-tool app trees each route to their OWN scope — the invariant mutant Md breaks (it drops
  // the apps/bell branch, so apps/bell/** falls through to "root" and the sentinel,bell source-tree call
  // stops gating bell).
  assert.equal(classifyScope("apps/bell/src/x.ts"), "bell");
  assert.equal(classifyScope("apps/sentinel/src/x.ts"), "sentinel");
  // Windows-style separators normalise before matching (classifyScope replaces backslashes with slashes).
  assert.equal(classifyScope("apps\\bell\\src\\digest.ts"), "bell");
  // A bell TEST file also routes to "bell": the prefix is apps/bell/, not apps/bell/src/, so the whole
  // off-tool app tree (tests included) is English-gated. Documented expected value: "bell".
  assert.equal(classifyScope("apps/bell/test/x.test.ts"), "bell");
  assert.equal(classifyScope("apps/sentinel/test/x.test.ts"), "sentinel");
  // The app roots themselves route too (the exact-path branch, p === "apps/bell").
  assert.equal(classifyScope("apps/bell"), "bell");
  assert.equal(classifyScope("apps/sentinel"), "sentinel");
  // Fallthrough sanity: a non-off-tool path is NOT mis-routed to bell/sentinel.
  assert.equal(classifyScope("scripts/lang-gate.mjs"), "root");
  assert.equal(classifyScope("apps/site/lib/fleet.ts"), "site");
  assert.equal(classifyScope("packages/atelier/README.md"), "atelier");
});

test("lang_gate_SCOPES_declares_the_off_tool_app_scopes", () => {
  assert.ok(SCOPES.includes("sentinel"), "SCOPES must declare 'sentinel' (C-11 i, ADR-EC)");
  assert.ok(SCOPES.includes("bell"), "SCOPES must declare 'bell' (C-11 i, ADR-EC)");
  // Every scope gated anywhere must be known to SCOPES (an unknown scope makes lang-gate exit 2): the
  // union of test 42(c) {…,site,harness,…}, test 42(c-bis) {sentinel,bell}, and the checkpoint/lot call.
  for (const s of ["root", "contracts", "schemas", "site", "harness", "skills", "sentinel", "bell"]) {
    assert.ok(SCOPES.includes(s), `SCOPES must declare '${s}'`);
  }
});

// ADR-M004 D7 addendum 2026-09-27 (lot LANG-GATE-CLAUDE-1). The repo-root `.claude/` directory is the coding tool's session
// folder (internal agent prompts, worktree copies, local settings), never exported; the walk skips it at the ROOT ONLY. The
// oracle is the served path itself: the lang-gate CLI run with --dir on a scratch tree carrying the real exemption file.
// Mutants: drop ".claude" from SKIP_DIRS => (1) reds; drop the relDir guard in skipDir => (3) reds.
test("lang_gate_skips_the_session_folder", () => {
  // The French fixture is written with escapes so this source file carries no diacritic and no French word (it is scanned).
  const text = "d\u00e9j\u00e0 v\u00e9rifi\u00e9, \u00e9chec, r\u00e8gle\n";
  const gate = join(REPO_ROOT, "scripts", "lang-gate.mjs");
  const run = (dir: string) => {
    const r = spawnSync(process.execPath, [gate, "--dir", dir, "--json"], { encoding: "utf8" });
    // --json prints the report object; on exit 0 an "lang-gate OK" line follows it on stdout (the failure line goes to stderr).
    const files = r.status === 0 || r.status === 1 ? JSON.parse(r.stdout.split("\nlang-gate OK")[0] ?? "").files : null;
    return { status: r.status, rels: (files ?? []).map((f: { rel: string }) => f.rel).sort(), stderr: r.stderr };
  };
  assert.equal(skipDir(".claude", ""), true, "the repo-root session folder is skipped");
  assert.equal(skipDir(".claude", "apps/site"), false, "a nested .claude directory is walked");
  const tmp = mkdtempSync(join(tmpdir(), "lang-claude-"));
  try {
    mkdirSync(join(tmp, "scripts"), { recursive: true });
    copyFileSync(join(REPO_ROOT, "scripts", "lang-exempt.json"), join(tmp, "scripts", "lang-exempt.json"));
    // (1) French under the root session folder: not walked, the gate stays green.
    mkdirSync(join(tmp, ".claude", "x"), { recursive: true });
    writeFileSync(join(tmp, ".claude", "x", "fr.md"), text);
    assert.deepEqual(collectTextFiles(tmp).map((f) => f.rel).filter((r) => r.startsWith(".claude/")), [], "the session folder is not walked");
    const green = run(tmp);
    assert.equal(green.status, 0, `French under .claude/ must not redden the gate: ${green.stderr}`);
    // (2) The same text outside .claude/ reddens the root scope (non-vacuity of the fixture).
    mkdirSync(join(tmp, "notes"), { recursive: true });
    writeFileSync(join(tmp, "notes", "fr.md"), text);
    const red = run(tmp);
    assert.equal(red.status, 1, "the same French text outside .claude/ must redden the gate");
    assert.deepEqual(red.rels, ["notes/fr.md"], "only the file outside the session folder is reported");
    rmSync(join(tmp, "notes"), { recursive: true, force: true });
    // (3) A nested .claude directory is not the session folder: it is walked and gated.
    mkdirSync(join(tmp, "apps", "site", ".claude"), { recursive: true });
    writeFileSync(join(tmp, "apps", "site", ".claude", "fr.md"), text);
    const nested = run(tmp);
    assert.equal(nested.status, 1, "French under a nested .claude directory must redden the gate");
    assert.deepEqual(nested.rels, ["apps/site/.claude/fr.md"], "the nested file is reported, the root session folder is not");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  // Real tree: nothing under the root session folder is walked (the folder may or may not exist on this checkout).
  assert.deepEqual(collectTextFiles(REPO_ROOT).map((f) => f.rel).filter((r) => r.startsWith(".claude/")), []);
});
