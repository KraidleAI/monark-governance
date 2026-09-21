/**
 * Root/CI probe `probe_byo_demo_loop_closes` (ADR-M006 D10). The BYO demo made VENDABLE and
 * REPRODUCIBLE: a third-party caller calibrates on ITS OWN scores → gates ITS OWN prediction → a covered
 * commit, and the audit `calib_digest === set_digest` closes over the same scores.
 *
 * Exercises the harness END-TO-END against an IN-PROCESS `127.0.0.1` server over the REAL MCP
 * `tools/call` wire and verifies the committed demonstration trace `fixtures/byo-demo-trace.json`.
 *
 * WHY the assertions are mock-discriminating (the load-bearing design): a "frozen/mock trace" that
 * replays canned responses can copy the demo values, so value-equality alone is NOT enough. The probe
 * therefore (a) re-drives the SAME chain in-process and `deepEqual`s it (faithfulness); (b) pins the LF
 * sha256 (tamper-evidence) + proves it is byte-reproducible in-test; (c) closes the audit tie against an
 * INDEPENDENT recompute of `set_digest` (`runCalibrate`) AND a HAND-ROLLED conformal quantile written
 * here (≠ production `splitQuantile`); and (d) drives TEST-CHOSEN PERTURBED inputs that are NOT in the
 * committed trace over the SAME wire seam (`byoToolsCall`) — a perturbed α (0.5 ⇒ q̂=0.6), a perturbed ŷ
 * (region shifts and the L3 gate abstains), and a perturbed score set (a DIFFERENT digest that still
 * ties) — so a replayed trace reds. No `any` (off the ratchet).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Server as HttpServer } from "node:http";
import { assertClosedGateDecision } from "@monark/contracts";
import { runCalibrate } from "../apps/harness/src/tools/calibrate.ts";
import { startServer } from "../apps/harness/src/server.ts";
import { compilePatterns, scanText } from "../scripts/grep-forbidden.mjs";
import {
  buildByoTrace,
  byoToolsCall,
  independentSplitQhat,
  calibrateArgs,
  gateByoArgs,
  sha256Lf,
  CALLER_SCORES,
  CALLER_ALPHA,
  CALLER_NMIN,
  CALLER_YHAT,
} from "./byo-demo-builder.ts";
import type { ByoTrace } from "./byo-demo-builder.ts";

const TRACE_PATH = fileURLToPath(new URL("../fixtures/byo-demo-trace.json", import.meta.url));
const VOCAB_PATH = fileURLToPath(new URL("../vocab-banned.json", import.meta.url));

/** Pinned sha256 (LF-normalized) of the committed trace — also stated in fixtures/PROVENANCE-byo-demo.md.
 *  Re-pinned for M012-f (serverInfo version source): the `initialize` step's `serverInfo.version` moved from
 *  the misaligned "1.0.0" to the single-source HARNESS_VERSION "0.4.0" — the ONLY drift: a 5-char-for-5-char
 *  swap, so the length is unchanged (9735 bytes) and every decision byte and digest is byte-identical.
 *  (Prior re-pin: the verdict summary appended to the calibrate + gate `content` text, same frozen result.) */
const TRACE_SHA256_PINNED = "daf8d3eabacbc601e608d01936d02c0f7ba78dfb5a0d6f5741ecea5fb4eef6d2";

/** Genericity guard pattern: the demo names no asset, no market activity, and no maturity overclaim.
 *  (This regex is the ENFORCEMENT mechanism; it necessarily spells the tokens it forbids.) */
const NON_GENERIC = /\b(btc|eth|trad(e|ing)|live|proven|mvp)\b/i;
const PROVENANCE_PATH = fileURLToPath(new URL("../fixtures/PROVENANCE-byo-demo.md", import.meta.url));
const DEMO_PATH = fileURLToPath(new URL("../skills/monark/DEMO.md", import.meta.url));

interface VocabConfig {
  banned: { re: string; why: string }[];
  scan: { harness: { banned: { re: string; why: string }[] } };
}

function sc(r: { structuredContent: Record<string, unknown> }): Record<string, unknown> {
  return r.structuredContent;
}
function obj(o: Record<string, unknown>, k: string): Record<string, unknown> {
  const v = o[k];
  if (v === null || typeof v !== "object") throw new Error(`field '${k}' is not an object`);
  return v as Record<string, unknown>;
}
function num(o: Record<string, unknown>, k: string): number {
  const v = o[k];
  if (typeof v !== "number") throw new Error(`field '${k}' is not a number`);
  return v;
}

test("probe_byo_demo_loop_closes", async () => {
  // (1) FAITHFULNESS — the committed trace is byte-faithful to what the fresh in-process server produces
  // NOW. A stale/hand-edited trace (or a committed replay whose demo values drifted) reds here.
  const driven = await buildByoTrace();
  const committedText = readFileSync(TRACE_PATH, "utf8");
  const committed = JSON.parse(committedText) as ByoTrace;
  assert.deepEqual(driven, committed, "committed trace must equal the freshly-driven trace");

  // (2) TAMPER-EVIDENCE — the committed bytes match the pinned sha256 (LF), = the PROVENANCE md pin.
  assert.equal(sha256Lf(committedText), TRACE_SHA256_PINNED, "committed trace sha256(LF) must match the pin");

  // (2b) BYTE-REPRODUCIBLE in-test: a second in-process build serializes to the SAME sha (the recorder's
  // 2x run, enforced in CI). The tools read no clock and the port is not recorded, so the bytes are stable.
  const driven2 = await buildByoTrace();
  assert.equal(
    sha256Lf(JSON.stringify(driven2, null, 2) + "\n"),
    sha256Lf(JSON.stringify(driven, null, 2) + "\n"),
    "two in-process builds must serialize byte-identically (determinism)",
  );

  // (3) THE HONEST DECISION (the demo's point). Drive off the committed trace's real gate response.
  const gateStep = committed.steps.find((s) => "label" in s && s.label === "gate-byo");
  assert.ok(gateStep !== undefined && "response" in gateStep, "committed trace must carry the gate-byo step");
  const gate = sc(gateStep.response);
  assertClosedGateDecision(gate);
  assert.equal(gate["action"], "commit", "the BYO gate yields a commit");
  assert.equal(gate["allow"], true, "allow is true iff action is commit");
  assert.equal(gate["reason"], "covered", "the BYO decision is covered");
  const verdict = obj(gate, "verdict");
  const region = obj(verdict, "region");
  assert.equal(region["kind"], "interval", "interval mode ⇒ an interval region");
  assert.equal(num(verdict, "n_calib"), 10, "n_calib echoes the caller's 10 scores");
  assert.equal(num(verdict, "qhat"), 1, "the demo q̂ is 1.0 (10th smallest of 0.1..1.0 at α=0.1)");

  const calibStep = committed.steps.find((s) => "label" in s && s.label === "calibrate");
  assert.ok(calibStep !== undefined && "response" in calibStep, "committed trace must carry the calibrate step");
  const calibrate = sc(calibStep.response);
  assert.equal(calibrate["qhat"], 1, "calibrate q̂ is 1.0");
  assert.equal(calibrate["reason"], null, "calibrate succeeded (reason null)");

  // (4) THE AUDIT TIE (the vendable claim) — the gate verdict's calib_digest equals the calibrate
  // set_digest over the SAME scores. Shown THREE independent ways so a frozen constant cannot fake it:
  //   (4a) the committed gate calib_digest == the committed calibrate set_digest (the recorded tie);
  assert.equal(verdict["calib_digest"], calibrate["set_digest"], "recorded tie: gate calib_digest == calibrate set_digest");
  //   (4b) both == runCalibrate(scores).set_digest recomputed here from the RAW scores (independent);
  const recomputed = runCalibrate({ scores: [...CALLER_SCORES], alpha: CALLER_ALPHA, nMin: CALLER_NMIN }).set_digest;
  assert.equal(verdict["calib_digest"], recomputed, "gate calib_digest == runCalibrate(scores).set_digest (independent oracle)");
  assert.equal(calibrate["set_digest"], recomputed, "calibrate set_digest == runCalibrate(scores).set_digest");

  // (5) HAND-ROLLED CONFORMAL ORACLE — q̂ and the region against arithmetic written HERE (≠ splitQuantile).
  const qhatOracle = independentSplitQhat(CALLER_SCORES, CALLER_ALPHA, CALLER_NMIN);
  assert.equal(qhatOracle, 1, "hand-rolled p-th smallest (p=10) of 0.1..1.0 is 1.0");
  assert.equal(verdict["qhat"], qhatOracle, "gate q̂ equals the hand-rolled conformal quantile");
  assert.equal(calibrate["qhat"], qhatOracle, "calibrate q̂ equals the hand-rolled conformal quantile");
  assert.equal(num(region, "lo"), CALLER_YHAT - (qhatOracle ?? 0), "region lo == ŷ − q̂ (= −1)");
  assert.equal(num(region, "hi"), CALLER_YHAT + (qhatOracle ?? 0), "region hi == ŷ + q̂ (= +1)");
  assert.equal(num(region, "lo"), -1, "region lo is −1 (literal)");
  assert.equal(num(region, "hi"), 1, "region hi is +1 (literal)");

  // (6) ANTI-MOCK (LOAD-BEARING) — perturbations NOT present in the committed trace, over the SAME wire
  // seam (byoToolsCall), must track the independent recompute. A frozen/mock trace (which holds only the
  // demo α=0.1/ŷ=0/these scores) returns the wrong value ⇒ these red.
  const server: HttpServer = startServer(0);
  try {
    await once(server, "listening");
    const addr = server.address();
    assert.ok(addr !== null && typeof addr === "object", "address() must be an AddressInfo");
    assert.equal(addr.address, "127.0.0.1", "the harness binds 127.0.0.1 only");
    const port = addr.port;

    // (6a) PERTURBED α: at α=0.5, p=⌈11·0.5⌉=6 ⇒ q̂ = 6th smallest = 0.6 (the demo holds only q̂=1.0).
    const cPert = await byoToolsCall(port, 1, "calibrate", calibrateArgs(CALLER_SCORES, 0.5, CALLER_NMIN));
    const cPertSc = sc(cPert);
    const qhatPert = independentSplitQhat(CALLER_SCORES, 0.5, CALLER_NMIN);
    assert.equal(qhatPert, 0.6, "perturbation is discriminating (0.6 != the demo's 1.0)");
    assert.equal(cPertSc["qhat"], qhatPert, "fresh calibrate q̂ at α=0.5 must equal the hand-rolled recompute");

    // (6b) PERTURBED ŷ: at ŷ=5 the interval region shifts to [4, 6] (the demo holds only [−1, 1]) AND the
    // L3 gate now ABSTAINS — the intent 0 no longer lies in the region — so a mutant that recomputes the
    // region but freezes the action/reason (e.g. a hard-wired `commit`) reds here too.
    const gPert = await byoToolsCall(port, 2, "gate", gateByoArgs(CALLER_SCORES, 5));
    const gPertSc = sc(gPert);
    assertClosedGateDecision(gPertSc);
    const rPert = obj(gPertSc, "verdict")["region"] as Record<string, unknown>;
    assert.equal(rPert["lo"], 4, "perturbed region lo shifts to 5 − 1 = 4");
    assert.equal(rPert["hi"], 6, "perturbed region hi shifts to 5 + 1 = 6");
    assert.equal(gPertSc["action"], "abstain", "the L3 gate abstains when the intent leaves the perturbed region");
    assert.equal(gPertSc["reason"], "intent_not_in_region", "the abstention reason is intent_not_in_region");
    assert.equal(gPertSc["allow"], false, "allow is false on the perturbed abstention");

    // (6c) PERTURBED SCORE SET: a DIFFERENT score set ⇒ a DIFFERENT set_digest that STILL ties to the
    // gate calib_digest — proving the tie is computed over the caller's scores, not a frozen constant.
    const scores2 = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 2.0];
    const c2 = sc(await byoToolsCall(port, 3, "calibrate", calibrateArgs(scores2, CALLER_ALPHA, CALLER_NMIN)));
    const g2 = sc(await byoToolsCall(port, 4, "gate", gateByoArgs(scores2, CALLER_YHAT)));
    assertClosedGateDecision(g2);
    const digest2 = c2["set_digest"];
    assert.equal(obj(g2, "verdict")["calib_digest"], digest2, "perturbed-set tie: gate calib_digest == calibrate set_digest for the DIFFERENT scores");
    assert.notEqual(digest2, calibrate["set_digest"], "a different score set yields a different digest (the tie is not a constant)");
  } finally {
    server.closeAllConnections(); // C-G2D-1: server-socket hygiene (destroy before close). Does NOT fix the libuv async.c flake (nodejs/node#56645)
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }

  // (7) HONESTY & GENERICITY, CI-ENFORCED — the trace text carries NO forbidden vocabulary (GLOBAL +
  // harness scope, like the h5 probe) and NO named asset, market activity, or maturity overclaim.
  const cfg = JSON.parse(readFileSync(VOCAB_PATH, "utf8")) as VocabConfig;
  const patterns = [...compilePatterns(cfg.banned), ...compilePatterns(cfg.scan.harness.banned)];
  const hits = scanText(committedText, patterns);
  assert.equal(hits.length, 0, `the trace must carry no forbidden vocabulary: ${JSON.stringify(hits)}`);
  assert.equal(NON_GENERIC.test(committedText), false, "the trace must stay generic (NON_GENERIC guard: no named asset or maturity overclaim)");
  // fixtures/ has no CI vocab gate, so make the genericity of the committed PROVENANCE a permanent oracle
  // here (it is exported to the public storefront alongside the trace).
  const provenanceText = readFileSync(PROVENANCE_PATH, "utf8");
  assert.equal(NON_GENERIC.test(provenanceText), false, "PROVENANCE-byo-demo.md must stay generic (NON_GENERIC guard)");
  const demoText = readFileSync(DEMO_PATH, "utf8");
  assert.equal(NON_GENERIC.test(demoText), false, "DEMO.md (published in the skill) must stay generic (NON_GENERIC guard: no named asset, trade, or MVP overclaim)");
});
