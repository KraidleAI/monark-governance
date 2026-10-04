/**
 * Root/CI probe `probe_harness_records_real_decision` (ADR-M005 §H5 / C-6, docs/PLAN-harnais-lot.md H5).
 *
 * Exercises the harness END-TO-END against an IN-PROCESS `127.0.0.1` server over the REAL MCP
 * `tools/call` wire (streamable-HTTP) + the HTTP/JSON mirror, and verifies the committed demonstration
 * trace `fixtures/h5-e2e-trace.json`. This CLOSES the deferred residual "seam SDK tools/call
 * (gate/cascade/attest not exercised via createHarnessHandler)" recorded in docs/G2-lot-h3.md.
 *
 * The honest result the demo produces: cascade -> gate ABSTAINS (`under_calib`) — no cascade
 * calibration is committed (D5) — and the committed USDe key of stable-run-velocity-24h returns commit/covered over its
 * measured calibration; btc-dir-15m is retired (step 7 shows the refusal). attest is a demonstrative Shōgen
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
import { USDE_STABLE_RUN_CALIB_DIGEST_PINNED } from "../apps/harness/src/calibration.ts";
import { ATTESTATION_BINDING } from "../apps/harness/src/attestation-binding.ts";
import { GATE_NON_REVERIFICATION_SENTENCE } from "../apps/harness/src/tools/gate.ts";
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
  USDE_PREDICTION,
} from "./h5-trace-builder.ts";
import type { H5Trace, ToolCallResponse } from "./h5-trace-builder.ts";

const TRACE_PATH = fileURLToPath(new URL("../fixtures/h5-e2e-trace.json", import.meta.url));
const VOCAB_PATH = fileURLToPath(new URL("../vocab-banned.json", import.meta.url));

/** Pinned sha256 (LF-normalized) of the committed trace — also stated in fixtures/PROVENANCE-h5-e2e-trace.md.
 *  Re-pinned 2026-09-19 for ADR-EC H-attested: a step 7 `attested-gate` was inserted AFTER the step 6 `attest`
 *  (the attest -> gate tuyau, served then — the gate carried the `AttestedPrice` of step 6 and filed its residual
 *  into `verdict.residual`; since CM-2b the gate REFUSES it, `task_class_retired`), the former HTTP mirror step is
 *  renumbered 8, and `observed` gains `attested_gate_action`/`attested_gate_residual`. Nothing above the attest
 *  step changes, so `sed -n 292p` stays the Binance ticker URL; the file grows 15731 -> 21859 bytes. (Prior
 *  re-pins: ADR-M018 D4 E9 numeric `label_schema` "up|down" -> "numeric" on the cascade-gate under_calib region;
 *  P1-b2 M012 item (i) description dedup; P1-b1 OPTIONAL `attested` + phrase (iv) + "no temporal binding in P1";
 *  M012-f serverInfo.version -> HARNESS_VERSION 0.4.0; ADR-M012 D7 `stable-run-velocity-24h` clause; ADR-M008
 *  F2-B keyed committed/under_calib clause; ADR-M008 F1 stable-run sentence; the verdict summary in the gate
 *  `content` text; Lot C2 ADR-M007 D7 grew the `tools/list` bytes.) */
// Re-pinned 2026-09-22 for U-4b-2a: the `tools/list` bytes changed on TWO tool descriptions — the `gate`
// description gained the served `liquidation-eligible-coverage` class clause (upper bound + alpha/nMin + H-3
// + conditional coverage, ADR-U4b D1/decision 126) and the `cascade` description gained the "v0, replaced at
// U-5" label (decision 123/Q-NEW-2). No served DECISION, `structuredContent`, `yhat`, or digest changes
// (registry still empty of the liq class); the file grows 21859 -> 21943 bytes.
// Re-pinned 2026-09-22 for HARNESS-DESC-1 (CARTO-T1C-2): the `tools/list` bytes changed on ONE tool description --
// the `gate` description's `liquidation-eligible-coverage` clause now follows the liq registry state (describeGate):
// on the EMPTY registry it serves the empty-registry sentence + alpha/nMin + the conditional rule, never the upper
// bound nor the H-3 sentence. ONE field of the trace changes, the tools/list step's `response_sha256` (b88cd066... ->
// 6b78a420...); no served DECISION, `structuredContent`, `content` text, `yhat`, or digest changes, and the
// cascade/attest/calibrate descriptions are byte-identical; the file holds at 21943 bytes (prior pin 4ad9b340...).
// Re-pinned 2026-09-24 for U-4b-2b (ADR-U4b-2b D4, prediction C-6 measured): TWO fields change and nothing else. (1) The
// liq registry now holds the committed stratum s0, so the `gate` description is describeGate(true), byte-identical to
// the pre-HARNESS-DESC-1 text: the tools/list step's `response_sha256` returns to b88cd066... (from 6b78a420...); measured
// without (2), the whole trace returns exactly to the prior pin 4ad9b340... (21943 bytes). (2) IF-1 (ADR-U5a, G2
// A-9-OUTILLE): the step-6 note says "previously Shogen-verified" (with the macron, covered by the third `verified`
// exemption), so the fourth exemption `committed, previously ` is retired; +8 bytes, 21951. No served DECISION,
// `structuredContent`, `content` text, `yhat` or digest of the trace changes (the trace calls no liq class).
// Re-pinned 2026-10-04 for CM-2b surfaces (ADR-CM B-5, amendment "nuit, 3"; docs/G0-lot-cm-2b-surfaces.md): btc-dir-15m is
// retired, so step 5 is the committed USDe key (label committed-gate) and step 7 (attested-gate, kept) is the
// task_class_retired refusal: the attest -> gate join is dormant. Regenerated by scripts/record-h5-e2e-trace.mjs;
// 21951 -> 21753 bytes (prior pin 0b32b330...).
const TRACE_SHA256_PINNED = "b016bf4a4950cff1d39dccd970f7371f4dc8e3bb261d3d14c53b372825eda0a0";

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
/** The full call step (note + request + response) for `label` — narrowed to the CallStep variant. */
function callStep(trace: H5Trace, label: string) {
  const s = trace.steps.find((x) => "label" in x && x.label === label);
  if (s === undefined || !("response" in s)) throw new Error(`no call step labelled ${label}`);
  return s;
}

interface VocabConfig {
  banned: { re: string; why: string }[];
  scan: { harness: { banned: { re: string; why: string }[] } };
}

// killer: apps/harness/src/tools/gate.ts:927 CONST "\"task_class_retired\"" -> "\"task_class_unknown\""
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

  const gateUsde = sc(stepByLabel(committed, "committed-gate"));
  assertClosedGateDecision(gateUsde);
  assert.equal(obj(gateUsde, "verdict")["reason"], "covered", "the committed USDe key yields a covered verdict (btc-dir-15m is retired)");

  // (4) DISCRIMINATING TIES a mock cannot satisfy without the real computation.
  // (4a) the committed verdict.calib_digest == the committed USDe calibration digest.
  assert.equal(obj(gateUsde, "verdict")["calib_digest"], USDE_STABLE_RUN_CALIB_DIGEST_PINNED, "the committed calib_digest is the USDe digest");
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

// Test (ADR-EC E1 / C-7, ADR-M017 D2(iii)/D4(3); re-pinned at CM-2b surfaces) -- step 7 `attested-gate` of the h5 trace
// sends the `AttestedPrice` of step 6 on btc-dir-15m, the only class that held a committed attestation subject; the gate REFUSES it. The
// class is retired (ADR-CM B-5), so the step is a tool error `task_class_retired`: the attest -> gate join is dormant
// (ADR-CM amendment "nuit, 3"). Asserted on BOTH the LIVE trace and the COMMITTED trace: (a) the step is the refusal with
// its code; (c) the subject is a committed btc-dir subject (the table is imported); (d) the note carries the
// non-re-verification sentence and says the join is dormant; (e) the carried attested equals the step-6 output.
// killer: apps/harness/src/tools/gate.ts:927 CONST "\"task_class_retired\"" -> "\"task_class_unknown\""
test("h5_carries_attested", async () => {
  const live = await buildTrace();
  const committed = JSON.parse(readFileSync(TRACE_PATH, "utf8")) as H5Trace;

  const check = (trace: H5Trace, which: string): void => {
    const attestStep = callStep(trace, "attest");
    const attestedGateStep = callStep(trace, "attested-gate");
    const attested = obj(sc(attestStep.response), "price"); // the AttestedPrice produced by step 6 `attest`
    const refusal = attestedGateStep.response as unknown as { isError?: unknown; _meta?: unknown; structuredContent?: unknown };
    // (a) step 7 is the retirement refusal, with its stable code (no decision, no structuredContent).
    assert.equal(refusal.isError, true, `${which}: step 7 is a tool error`);
    assert.deepEqual(refusal._meta, { "monarkgate.tech/error_code": "task_class_retired" }, `${which}: step 7 carries task_class_retired`);
    assert.equal(refusal.structuredContent, undefined, `${which}: no decision on the retired class`);
    // (c) attested.subject of step 7 is a committed btc-dir-15m subject (the table is IMPORTED, not re-declared).
    const subjects = ATTESTATION_BINDING.get("btc-dir-15m");
    assert.ok(subjects !== undefined && subjects.includes(String(attested["subject"])), `${which}: attested.subject is a committed btc-dir-15m subject`);

    // (d) the step-7 note carries GATE_NON_REVERIFICATION_SENTENCE verbatim, and that constant states it is not
    //     re-verified at call time (M7 blanking the constant => the second assertion reds).
    assert.ok(attestedGateStep.note.includes(GATE_NON_REVERIFICATION_SENTENCE), `${which}: step 7 note carries the non-re-verification sentence verbatim`);
    assert.ok(attestedGateStep.note.includes("the attest -> gate join is dormant"), `${which}: step 7 note says the join is dormant`);
    assert.ok(GATE_NON_REVERIFICATION_SENTENCE.includes("not re-verified at call time"), `${which}: the sentence states it is not re-verified at call time`);

    // (e) the attested price CARRIED in the step-7 request equals the step-6 attest output (M6' literal => reds):
    //     proves a real chain (structuredOf(attest).price), not a re-declared literal.
    const carried = (attestedGateStep.request as { params: { arguments: { attested: unknown } } }).params.arguments.attested;
    assert.deepEqual(carried, sc(attestStep.response)["price"], `${which}: step 7 request.params.arguments.attested == step 6 response.structuredContent.price`);
  };

  check(live, "live");
  check(committed, "committed");
});
