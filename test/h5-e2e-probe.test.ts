/**
 * Root/CI probe `probe_harness_records_real_decision` (ADR-M005 §H5 / C-6; reworked at step 7 of ROADMAP.md).
 *
 * Exercises the harness END-TO-END against an IN-PROCESS `127.0.0.1` server over the REAL MCP
 * `tools/call` wire (streamable-HTTP) + the HTTP/JSON mirror, and verifies the committed demonstration
 * trace `fixtures/h5-e2e-trace.json`.
 *
 * The honest result the demo produces: the committed USDe key of stable-run-velocity-24h returns commit/covered over its
 * measured calibration; a predictor of the same class whose calibration is not committed ABSTAINS (`under_calib`); and
 * calibrate computes the split-conformal quantile of caller-carried scores, committing nothing. All of this is DECLARED in
 * plain English in the trace's `honesty` block and in `fixtures/PROVENANCE-h5-e2e-trace.md`.
 *
 * WHY the assertions are mock-discriminating (the load-bearing design): a "frozen/mock trace" that
 * replays canned responses can copy the demo values, so value-equality alone is NOT enough. The probe
 * therefore drives TEST-CHOSEN PERTURBED inputs that are NOT in the committed trace (31 other scores calibrated at
 * three alphas, one of them fail-closed; a gate B_t of 0.4242) over the SAME wire seam (`mcpToolsCall`), and requires
 * the LIVE response to equal an INDEPENDENT recompute (a hand-rolled split quantile). A replayed trace holds only the
 * demo calibration (q̂ 0.36) ⇒ the perturbation reds. No `any` (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Server as HttpServer } from "node:http";
import { assertClosedGateDecision, scoresSha256 } from "@monark/contracts";
import { USDE_STABLE_RUN_SCORES_SHA256_PINNED } from "../apps/harness/src/calibration.ts";
import { startServer } from "../apps/harness/src/server.ts";
import { compilePatterns, scanText } from "../scripts/grep-forbidden.mjs";
import {
  buildTrace,
  mcpToolsCall,
  independentSplitQhat,
  sha256Lf,
  GATE_PARAMS,
  DEMO_REMAINING_BUDGET,
  DEMO_CALIBRATION,
  USDE_PREDICTION,
} from "./h5-trace-builder.ts";
import type { H5Trace, ToolCallResponse } from "./h5-trace-builder.ts";
import { startLoopback } from "./helpers/loopback.ts";

const TRACE_PATH = fileURLToPath(new URL("../fixtures/h5-e2e-trace.json", import.meta.url));
const VOCAB_PATH = fileURLToPath(new URL("../vocab-banned.json", import.meta.url));

/** Pinned sha256 (LF-normalized) of the committed trace — also stated in fixtures/PROVENANCE-h5-e2e-trace.md.
 *  Re-recorded 2026-11-04 at step 7 of ROADMAP.md: attest and cascade are archived, so the trace drives the gate on the
 *  committed USDe key and on an uncalibrated predictor, then calibrate and its HTTP mirror (prior pin 7da12dd3…, 22291
 *  bytes). The earlier re-pins are told in the git history of this file and of the PROVENANCE file. */
const TRACE_SHA256_PINNED = "ed51ceb1c29cc4fb6e8bef069493709a6effc7f5933edafe35152708d91e43d2";

function stepByLabel(trace: H5Trace, label: string): ToolCallResponse {
  const s = trace.steps.find((x) => "label" in x && x.label === label);
  if (s === undefined || !("response" in s)) throw new Error(`no step labelled ${label}`);
  return s.response;
}
function sc(r: ToolCallResponse): Record<string, unknown> {
  return r.structuredContent;
}
function obj(o: Record<string, unknown>, k: string): Record<string, unknown> {
  const v = o[k];
  if (v === null || typeof v !== "object") throw new Error(`field '${k}' is not an object`);
  return v as Record<string, unknown>;
}

interface VocabConfig {
  banned: { re: string; why: string }[];
  scan: { harness: { banned: { re: string; why: string }[] } };
}

test("probe_harness_records_real_decision", async () => {
  // (1) FAITHFULNESS — the committed trace is byte-faithful to what the LIVE in-process server produces
  // NOW. A stale/hand-edited trace (or a committed replay whose demo values drifted) reds here.
  const live = await buildTrace();
  const committedText = readFileSync(TRACE_PATH, "utf8");
  const committed = JSON.parse(committedText) as H5Trace;
  assert.deepEqual(live, committed, "committed trace must equal the freshly-driven live trace");

  // (2) TAMPER-EVIDENCE — the committed bytes match the pinned sha256 (LF), = the PROVENANCE md pin.
  assert.equal(sha256Lf(committedText), TRACE_SHA256_PINNED, "committed trace sha256(LF) must match the pin");

  // (3) HONEST DECISIONS (the demo's point). Drive off the committed trace's real responses.
  const gateUsde = sc(stepByLabel(committed, "committed-gate"));
  assertClosedGateDecision(gateUsde);
  assert.equal(gateUsde["action"], "commit", "the committed USDe key commits");
  assert.equal(obj(gateUsde, "verdict")["reason"], "covered", "the committed USDe key yields a covered verdict (btc-dir-15m is retired)");

  const gateUncal = sc(stepByLabel(committed, "uncalibrated-gate"));
  assertClosedGateDecision(gateUncal);
  assert.equal(gateUncal["action"], "abstain", "a predictor whose calibration is not committed: the gate abstains");
  assert.equal(gateUncal["reason"], "under_calib", "the abstention reason is under_calib");
  assert.equal(obj(gateUncal, "verdict")["reason"], "under_calib", "the verdict reason is under_calib too");

  // (4) DISCRIMINATING TIES a mock cannot satisfy without the real computation.
  // (4a) the committed verdict.scores_sha256 == the pinned sha256 of the committed USDe scores (contract 1.1.0).
  assert.equal(obj(gateUsde, "verdict")["scores_sha256"], USDE_STABLE_RUN_SCORES_SHA256_PINNED, "the committed scores_sha256 is the USDe pin");
  // (4b) the calibrate q̂ == the hand-rolled split quantile of the demo scores, and its digest is the contracts' one.
  const cal = sc(stepByLabel(committed, "calibrate"));
  assert.equal(cal["qhat"], independentSplitQhat(DEMO_CALIBRATION.scores, 10, DEMO_CALIBRATION.nMin), "calibrate q̂ must equal the independent recompute");
  assert.equal(cal["qhat"], 0.36, "the demo q̂ is the 19th of the 20 sorted scores");
  assert.equal(cal["reason"], null, "the demo calibration is sufficient (no under_calib)");
  assert.equal(cal["scores_sha256"], scoresSha256(DEMO_CALIBRATION.scores), "calibrate digests the scores it was given");
  // (4c) B_t is caller-carried & ECHOED, never depleted (ADR-M005 D6; packages/hikae/src/l3-gate.ts).
  assert.equal(gateUncal["remaining_budget"], DEMO_REMAINING_BUDGET, "remaining_budget echoes the caller-carried B_t");

  // (5) MIRROR AGREEMENT — the HTTP/JSON surface returned the SAME structuredContent as MCP.
  const mirror = sc(stepByLabel(committed, "calibrate-mirror"));
  assert.deepEqual(mirror, cal, "the HTTP mirror structuredContent equals the MCP calibrate structuredContent");

  // (6) ANTI-MOCK (LOAD-BEARING) — perturbations NOT present in the committed trace, over the SAME wire
  // seam, must track the independent recompute. The 31 scores k/31 (k = 0..30, shuffled) at alpha 0.05, 0.2 and 0.01
  // give q̂ 30/31, 25/31 and under_calib (rank 32 > 31); a frozen/mock trace holds only the demo q̂ 0.36 ⇒ this reds.
  // Same idea for a perturbed B_t echo.
  const server: HttpServer = await startLoopback((port) => startServer(port));
  try {
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    assert.equal(addr.address, "127.0.0.1", "the harness binds 127.0.0.1 only");
    const port = addr.port;

    const scores = Array.from({ length: 31 }, (_, i) => ((i * 7) % 31) / 31);
    const alphas = [5, 20, 1];
    assert.deepEqual(alphas.map((h) => independentSplitQhat(scores, h, 10)), [30 / 31, 25 / 31, null], "the perturbation is discriminating (none is the demo's 0.36)");
    for (const h of alphas) {
      const r = await mcpToolsCall(port, 1, "calibrate", { scores, alpha: h / 100, nMin: 10 });
      const expected = independentSplitQhat(scores, h, 10);
      assert.equal(r.structuredContent["qhat"], expected, `LIVE calibrate q̂ must equal the independent recompute at alpha=${String(h / 100)} (a frozen/mock trace fails)`);
      assert.equal(r.structuredContent["reason"], expected === null ? "under_calib" : null, `LIVE calibrate reason at alpha=${String(h / 100)}`);
    }

    // Budget echo tracks a perturbed, caller-carried B_t (a frozen constant fails).
    const perturbedBudget = 0.4242;
    const g = await mcpToolsCall(port, 2, "gate", { prediction: USDE_PREDICTION, params: { ...GATE_PARAMS, remainingBudget: perturbedBudget, intent: 0.0001 } });
    assertClosedGateDecision(g.structuredContent);
    assert.equal(g.structuredContent["remaining_budget"], perturbedBudget, "remaining_budget echoes the perturbed caller-carried B_t");
  } finally {
    server.closeAllConnections(); // C-G2D-1: server-socket hygiene (destroy before close). Does NOT fix the libuv async.c flake (nodejs/node#56645)
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }

  // (7) HONESTY, CI-ENFORCED — the trace text carries NO forbidden vocabulary. grep-forbidden's default
  // walk skips fixtures/, so this makes the honest-vocab check load-bearing (GLOBAL + harness scope).
  const cfg = JSON.parse(readFileSync(VOCAB_PATH, "utf8")) as VocabConfig;
  const patterns = [...compilePatterns(cfg.banned), ...compilePatterns(cfg.scan.harness.banned)];
  const hits = scanText(committedText, patterns);
  assert.equal(hits.length, 0, `the trace must carry no forbidden vocabulary: ${JSON.stringify(hits)}`);
});
