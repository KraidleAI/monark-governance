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
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runRecorder, type RecorderDeps } from "../src/ukemi/record.ts";

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
    await assert.rejects(
      () => runRecorder(argv(dir, ["--prereg-file", "docs/PLAN-u4-prereg.md", "--prereg-sha", "deadbeef", "--block", "1"]), DEPS),
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
// a NAMED refusal (mutant "labeler-guard-removed" reds).
test("ukemi_record_labeler_sha_binds_the_frozen_labeler", async () => {
  const { dir, cleanup } = tmpLedger();
  try {
    await assert.rejects(
      () => runRecorder(argv(dir, ["--labeler-sha", "deadbeef", "--block", "1"]), DEPS),
      /--labeler-sha deadbeef != scripts\/census\/u3-realized\.mjs LF sha/,
      "a wrong --labeler-sha against the frozen labeler fails closed",
    );
  } finally { cleanup(); }
});
