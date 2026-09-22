// UKEMI U-4b-1b-0 (decision 128 Q-A/Q-B) — GOVERNANCE-only oracles for the course-binding guards of the recorder:
// --prereg-sha binds the course to --prereg-file (default docs/PLAN-u4b-prereg.md, the U-4b prereg by CODE), and
// --labeler-sha binds it to the frozen labeler scripts/census/u3-realized.mjs. Both READ repo files the PUBLIC export
// omits (docs/PLAN-u4-prereg.md is a D7-blacklisted governance doc; scripts/census/* are upcoming, not a public
// surface), so this file is in scripts/export-exclude-tests.json (calque ukemi-u4-governance.test.ts). Named mutants
// (run by the worker's harness): "prereg-guard-removed" reds the prereg test, "labeler-guard-removed" reds the labeler
// test. NO network: both guards throw BEFORE the client; a single operator makes the removed-guard path stop at the
// quorum guard (< 2 distinct), never the client (A-4 under mutation).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { runRecorder, type RecorderDeps } from "../src/ukemi/record.ts";

// Repo root from this test file (apps/sentinel/test -> up 3), the SAME root record.ts resolves, so the positive
// controls can compute the REAL LF sha of the bound files exactly as the recorder does. INDEPENDENT recipe (createHash
// here, NOT record.ts's own lfSha256) so a mutation in lfSha256 cannot mask a control (R-21 adversarial).
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const lfShaOf = (rel: string): string => createHash("sha256").update(readFileSync(join(ROOT, rel), "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");

const DEPS: RecorderDeps = { env: { CHAINSTACK_ETH_URL: "https://cs-node.example.invalid/FAKEKEY-9z9z9z9z" }, now: () => 1_700_000_000_000 };
const METHOD_CAPS = "eth_call=300000,eth_getLogs=300000,eth_getBlockByNumber=300000";
function tmpLedger(): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "u4b0-bind-"));
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
// A SINGLE operator: the prereg/labeler guards are BEFORE the operators/quorum guard, so they throw first here; if a
// guard is REMOVED (mutant), the next throw is the quorum guard (< 2 distinct) — no client, no network (A-4).
function argv(dir: string, extra: string[]): string[] {
  return ["--ledger-dir", dir, "--cycle", "cyc", "--floor", "0", "--max-ru", "1000000", "--max-calls", "500000", "--method-caps", METHOD_CAPS, "--operators", "drpc.org", "--min-interval-ms", "0", "--backoff-ms", "0", ...extra];
}

// Q-A: --prereg-sha is checked against --prereg-file (the U-4b prereg the course is BOUND to by CODE; default
// docs/PLAN-u4b-prereg.md, asserted in ukemi-record.test.ts), NOT the hard-wired U-4 LIVRE prereg. A mismatch and a
// MISSING file are NAMED refusals (mutant "prereg-guard-removed" reds).
test("ukemi_record_prereg_sha_binds_the_course_to_the_prereg_file", async () => {
  const { dir, cleanup } = tmpLedger();
  try {
    // D-4: +--labeler-sha (real LF sha) so the by-code mandatory check (ruling 2026-09-22: an existing --prereg-file
    // requires BOTH flags) passes and the NEXT throw is the prereg sha mismatch — assertion regex unchanged.
    await assert.rejects(
      () => runRecorder(argv(dir, ["--prereg-file", "docs/PLAN-u4-prereg.md", "--prereg-sha", "deadbeef", "--labeler-sha", lfShaOf("scripts/census/u3-realized.mjs"), "--block", "1"]), DEPS),
      /--prereg-sha deadbeef != docs\/PLAN-u4-prereg\.md LF sha/,
      "a wrong --prereg-sha against the bound prereg file fails closed (bound to --prereg-file, not the U-4 prereg)",
    );
    await assert.rejects(
      () => runRecorder(argv(dir, ["--prereg-file", "docs/PLAN-u4b-prereg-absent.md", "--prereg-sha", "deadbeef", "--block", "1"]), DEPS),
      /--prereg-file docs\/PLAN-u4b-prereg-absent\.md does not exist/,
      "a missing --prereg-file is a NAMED refusal, never a bare ENOENT",
    );
  } finally { cleanup(); }
});

// Q-B: --labeler-sha is checked against scripts/census/u3-realized.mjs LF sha (the frozen U-3 labeler); a mismatch is
// a NAMED refusal (mutant "labeler-guard-removed" reds). +--no-prereg-binding (ruling 2026-09-22): this test uses the
// DEFAULT --prereg-file (docs/PLAN-u4b-prereg.md) to isolate the labeler guard, so once C-4 commits that file it must
// opt out of the by-code prereg requirement to keep testing the LABELER guard (not the prereg one). NOT in argv() — Test B needs it absent.
test("ukemi_record_labeler_sha_binds_the_frozen_labeler", async () => {
  const { dir, cleanup } = tmpLedger();
  try {
    await assert.rejects(
      () => runRecorder(argv(dir, ["--labeler-sha", "deadbeef", "--no-prereg-binding", "--block", "1"]), DEPS),
      /--labeler-sha deadbeef != scripts\/census\/u3-realized\.mjs LF sha/,
      "a wrong --labeler-sha against the frozen labeler fails closed",
    );
  } finally { cleanup(); }
});

// C-1 POSITIVE control (checkpoint-2): the REAL LF sha of the bound --prereg-file AND of the frozen labeler CROSS
// both guards — the next throw is the pre-client quorum guard (a single --operators), with 0 fetch. Kills the "guard
// always refuses" mutants (prereg: `if (actual !== args.preregSha)` -> `if (true)`; labeler idem): a matching sha
// would then STILL be refused, so this reds. Proves the guards ACCEPT a matching sha, not only refuse a wrong one.
// Uses docs/PLAN-u4-prereg.md as the existing-file vector (the default docs/PLAN-u4b-prereg.md is committed later, C-4).
test("ukemi_record_a_correct_prereg_and_labeler_sha_cross_both_guards", async () => {
  const { dir, cleanup } = tmpLedger();
  let fetchCalls = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = (): Promise<Response> => { fetchCalls += 1; return Promise.reject(new Error("no network in a guard test")); };
  try {
    await assert.rejects(
      () => runRecorder(argv(dir, ["--prereg-file", "docs/PLAN-u4-prereg.md", "--prereg-sha", lfShaOf("docs/PLAN-u4-prereg.md"), "--labeler-sha", lfShaOf("scripts/census/u3-realized.mjs"), "--block", "1"]), DEPS),
      /quorum-2 needs >= 2 distinct operators/,
      "a MATCHING --prereg-sha and --labeler-sha cross BOTH guards; the next refusal is the pre-client quorum guard",
    );
  } finally { globalThis.fetch = realFetch; cleanup(); }
  assert.equal(fetchCalls, 0, "0 fetch: both sha guards AND the quorum guard refuse PRE-FLIGHT, before the guarded client");
});

// RULING 2026-09-22 (escalation resolved, CHANTIERS.md:677): once the bound --prereg-file EXISTS on disk, --prereg-sha
// AND --labeler-sha are REQUIRED BY CODE (pre-flight refusal: 0 fetch, 0 ledger, no diag). --no-prereg-binding EXPLICITLY
// lifts the requirement for a non-U-4b generic use. Kills the "flags-absent-accepted" mutant (preregBound -> false).
test("ukemi_record_prereg_and_labeler_sha_are_mandatory_once_the_prereg_file_exists", async () => {
  const { dir, cleanup } = tmpLedger();
  try {
    // (1) existing --prereg-file, NO --prereg-sha, NO --no-prereg-binding => refused by code, named, pre-flight.
    await assert.rejects(
      () => runRecorder(argv(dir, ["--prereg-file", "docs/PLAN-u4-prereg.md", "--block", "1"]), DEPS),
      /--prereg-sha is required because docs\/PLAN-u4-prereg\.md exists on disk/,
      "an existing prereg file requires --prereg-sha by code (mutant 'flags-absent-accepted' reds)",
    );
    // (2) existing --prereg-file, correct --prereg-sha, NO --labeler-sha => --labeler-sha required by code too.
    await assert.rejects(
      () => runRecorder(argv(dir, ["--prereg-file", "docs/PLAN-u4-prereg.md", "--prereg-sha", lfShaOf("docs/PLAN-u4-prereg.md"), "--block", "1"]), DEPS),
      /--labeler-sha is required because docs\/PLAN-u4-prereg\.md exists on disk/,
      "an existing prereg file requires --labeler-sha by code too",
    );
    // (3) --no-prereg-binding EXPLICITLY lifts the requirement => the next refusal is the pre-client quorum guard.
    await assert.rejects(
      () => runRecorder(argv(dir, ["--prereg-file", "docs/PLAN-u4-prereg.md", "--no-prereg-binding", "--block", "1"]), DEPS),
      /quorum-2 needs >= 2 distinct operators/,
      "--no-prereg-binding lifts the by-code requirement for a non-U-4b use (reaches the quorum guard)",
    );
    // 0 ledger on every pre-flight refusal above: the cycle dir was never created (the guards throw before the client).
    assert.ok(!existsSync(join(dir, "cyc")), "0 ledger: the mandatory-flag refusals are pre-flight (no cycle ledger dir created)");
  } finally { cleanup(); }
});
