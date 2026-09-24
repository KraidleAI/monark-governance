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
import { classifyScope, SCOPES } from "../scripts/lang-gate.mjs";

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
