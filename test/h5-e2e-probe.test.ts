/**
 * Root/CI probe `probe_harness_records_real_decision` (ADR-M005 §H5 / C-6, docs/PLAN-harnais-lot.md H5).
 *
 * Exercises the harness END-TO-END against an IN-PROCESS `127.0.0.1` server over the REAL MCP
 * `tools/call` wire (streamable-HTTP) + the HTTP/JSON mirror, and verifies the committed demonstration
 * trace `fixtures/h5-e2e-trace.json`. This CLOSES the deferred residual "seam SDK tools/call
 * (gate/cascade/attest not exercised via createHarnessHandler)" recorded in docs/G2-lot-h3.md.
 *
 * The honest result the demo produces: cascade -> gate ABSTAINS (`under_calib`) — no cascade
 * calibration is committed (D5) — and btc-dir-15m returns the committed SYNTHETIC decision
 * (commit/covered, declared synthetic, demonstrative only). attest is a demonstrative Shōgen
 * projection. All of this is DECLARED in plain English in the trace's `honesty` block and in
 * `fixtures/PROVENANCE-h5-e2e-trace.md`.
 *
 * WHY the assertions are mock-discriminating (the load-bearing design): a "frozen/mock trace" that
 * replays canned responses can copy the demo values, so value-equality alone is NOT enough. The probe
 * therefore drives TEST-CHOSEN PERTURBED inputs that are NOT in the committed trace (cascade at
 * shock=0.6 ⇒ yhat=150; a gate B_t of 0.4242) over the SAME wire seam (`mcpToolsCall`), and requires
 * the LIVE response to equal an INDEPENDENT recompute (a hand-rolled Eisenberg-Noe clearing / the
 * committed constat digest). A replayed trace holds only the shock=0 demo (yhat=100) ⇒ the perturbation
 * reds. (Recall H2's shock-0.57 assertion that killed the pPlus->pbar mutant.) No `any` (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Server as HttpServer } from "node:http";
import { assertClosedGateDecision, assertClosedPrediction, assertClosedAttestedPrice } from "@monark/contracts";
import { CALIB_DIGEST_PINNED } from "../apps/harness/src/calibration.ts";
import { startServer } from "../apps/harness/src/server.ts";
import { compilePatterns, scanText } from "../scripts/grep-forbidden.mjs";
import {
  buildTrace,
  mcpToolsCall,
  independentCascadeYhat,
  constatSensEmisDigest,
  sha256Lf,
  DEMO_CASCADE_INPUT,
  GATE_PARAMS,
  DEMO_REMAINING_BUDGET,
  BTC_DIR_PREDICTION,
} from "./h5-trace-builder.ts";
import type { H5Trace, ToolCallResponse } from "./h5-trace-builder.ts";

const TRACE_PATH = fileURLToPath(new URL("../fixtures/h5-e2e-trace.json", import.meta.url));
const VOCAB_PATH = fileURLToPath(new URL("../vocab-banned.json", import.meta.url));

/** Pinned sha256 (LF-normalized) of the committed trace — also stated in fixtures/PROVENANCE-h5-e2e-trace.md.
 *  Re-pinned in Lot C2 (ADR-M007 D7): the optional BYO `calibration` field in the gate input schema grew
 *  the MCP `tools/list` bytes ⇒ exactly the `tools/list` step's `response_sha256` moved; the cascade/gate/
 *  attest tools/call results and every digest are byte-identical (M-1). */
const TRACE_SHA256_PINNED = "711536850b4a84b3d635b5f0bcd870a6d316b08e8142147a0cde999266e6618e";

const DEMONSTRATIVE_LABEL = "real, notary Shōgen, demonstrative, not probative";

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

  // (3) HONEST DECISION (the demo's point). Drive off the committed trace's real responses.
  const gateCascade = sc(stepByLabel(committed, "cascade-gate"));
  assertClosedGateDecision(gateCascade);
  assert.equal(gateCascade["action"], "abstain", "cascade -> gate must abstain (no cascade calibration, D5)");
  assert.equal(gateCascade["reason"], "under_calib", "the abstention reason is under_calib");
  assert.equal(obj(gateCascade, "verdict")["reason"], "under_calib", "the verdict reason is under_calib too");

  const gateBtc = sc(stepByLabel(committed, "btc-dir-gate"));
  assertClosedGateDecision(gateBtc);
  assert.equal(gateBtc["action"], "commit", "btc-dir-15m yields the committed synthetic decision");
  assert.equal(gateBtc["reason"], "covered", "the synthetic btc-dir decision is covered");

  // (4) DISCRIMINATING TIES a mock cannot satisfy without the real computation.
  // (4a) btc-dir verdict.calib_digest == the real committed synthetic calibration digest.
  assert.equal(obj(gateBtc, "verdict")["calib_digest"], CALIB_DIGEST_PINNED, "btc-dir calib_digest must be the real synthetic digest");
  // (4b) attest sens_emis_digest == the constat's emitted-meaning digest (independent oracle).
  const attest = sc(stepByLabel(committed, "attest"));
  const price = obj(attest, "price");
  assertClosedAttestedPrice(price);
  assert.equal(price["sens_emis_digest"], constatSensEmisDigest(), "attest sens_emis_digest must equal the committed constat digest");
  assert.equal(attest["label"], DEMONSTRATIVE_LABEL, "attest carries the demonstrative label on the envelope");
  // (4c) cascade yhat == the independent Eisenberg-Noe recompute for the demo input.
  const cascadePred = sc(stepByLabel(committed, "cascade"));
  assertClosedPrediction(cascadePred);
  assert.equal(cascadePred["yhat"], independentCascadeYhat(DEMO_CASCADE_INPUT.L, DEMO_CASCADE_INPUT.e, DEMO_CASCADE_INPUT.shock), "cascade yhat must equal the independent recompute");
  // (4d) B_t is caller-carried & ECHOED, never depleted (ADR-M005 D6; packages/hikae/src/l3-gate.ts:136).
  assert.equal(gateCascade["remaining_budget"], DEMO_REMAINING_BUDGET, "remaining_budget echoes the caller-carried B_t");

  // (5) MIRROR AGREEMENT — the HTTP/JSON surface returned the SAME frozen structuredContent as MCP.
  const mirror = sc(stepByLabel(committed, "cascade-mirror"));
  assert.deepEqual(mirror, cascadePred, "the HTTP mirror structuredContent equals the MCP cascade structuredContent");

  // (6) ANTI-MOCK (LOAD-BEARING) — perturbations NOT present in the committed trace, over the SAME wire
  // seam, must track the independent recompute. A frozen/mock trace (which holds only shock=0, yhat=100)
  // returns the wrong value at shock=0.6 (yhat=150) ⇒ this reds. Same idea for a perturbed B_t echo.
  const server: HttpServer = startServer(0);
  try {
    await once(server, "listening");
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    assert.equal(addr.address, "127.0.0.1", "the harness binds 127.0.0.1 only");
    const port = addr.port;

    for (const shock of [0, 0.3, 0.6]) {
      const r = await mcpToolsCall(port, 1, "cascade", { ...DEMO_CASCADE_INPUT, shock });
      assertClosedPrediction(r.structuredContent);
      const expected = independentCascadeYhat(DEMO_CASCADE_INPUT.L, DEMO_CASCADE_INPUT.e, shock);
      assert.equal(r.structuredContent["yhat"], expected, `LIVE cascade yhat must equal the independent recompute at shock=${String(shock)} (a frozen/mock trace fails)`);
    }
    // shock=0.6 genuinely differs from the demo (150 vs 100): the value a replayed trace cannot produce.
    assert.equal(independentCascadeYhat(DEMO_CASCADE_INPUT.L, DEMO_CASCADE_INPUT.e, 0.6), 150, "perturbation is discriminating (150 != the demo's 100)");

    // Budget echo tracks a perturbed, caller-carried B_t (a frozen constant fails).
    const perturbedBudget = 0.4242;
    const g = await mcpToolsCall(port, 2, "gate", { prediction: BTC_DIR_PREDICTION, params: { ...GATE_PARAMS, remainingBudget: perturbedBudget, intent: "up" } });
    assertClosedGateDecision(g.structuredContent);
    assert.equal(g.structuredContent["remaining_budget"], perturbedBudget, "remaining_budget echoes the perturbed caller-carried B_t");
  } finally {
    await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
  }

  // (7) HONESTY, CI-ENFORCED — the trace text carries NO forbidden vocabulary. grep-forbidden's default
  // walk skips fixtures/, so this makes the honest-vocab check load-bearing (GLOBAL + harness scope).
  const cfg = JSON.parse(readFileSync(VOCAB_PATH, "utf8")) as VocabConfig;
  const patterns = [...compilePatterns(cfg.banned), ...compilePatterns(cfg.scan.harness.banned)];
  const hits = scanText(committedText, patterns);
  assert.equal(hits.length, 0, `the trace must carry no forbidden vocabulary: ${JSON.stringify(hits)}`);
});
