import { test } from "node:test";
import assert from "node:assert/strict";
import { gate, buildVerdict, buildSetRegion } from "../src/index.ts";
import type { GateInput } from "../src/index.ts";
import type { CoverageVerdict } from "@monark/contracts";

function mkVerdict(labels: string[], qhat: number, reason: CoverageVerdict["reason"]): CoverageVerdict {
  return buildVerdict({
    taskClass: "btc-dir-15m",
    method: "hac-cp",
    alpha: 0.1,
    scores: Array.from({ length: 50 }, (_, i) => (i % 2 === 0 && labels.length > 1 ? 1 : i < 47 ? 0 : 1)),
    region: buildSetRegion(labels),
    qhat,
    abstain: labels.length > 1,
    reason,
    residual: [],
    producedAt: "2026-09-04T00:00:00Z",
    schemaVersion: "1.0.0",
    cell: { qhatUnit: "score", scale: null, cellKey: null, policyRowSha256: null, policyTableSha256: null },
  });
}
const REQ = "e".repeat(64);

function input(over: Partial<GateInput> & Pick<GateInput, "verdict" | "intent">): GateInput {
  return {
    remainingBudget: 0.1,
    bFloor: 0,
    tau: 1,
    tauInterval: 1, // inert: verdict `set` (interval path not exercised here)
    nCalib: 50,
    nMin: 50,
    clockOpen: true,
    timedOut: false,
    evaluable: true,
    tool: "perps_order_preview",
    schemaVersion: "1.0.0",
    requestSha256: REQ,
    ...over,
  };
}

// Test 2 — intent outside region ⇒ ABSTAIN (frozen literal intent_not_in_region).
test("intent_not_in_region_denied", () => {
  const v = mkVerdict(["up"], 0, "covered");
  const d = gate(input({ verdict: v, intent: "down" })); // down ∉ {up}
  assert.equal(d.action, "abstain");
  assert.equal(d.reason, "intent_not_in_region");
  assert.equal(d.allow, false);
});

// Test 3 — timeout ⇒ deny upstream_timeout, never a set.
test("timeout_is_deny", () => {
  const v = mkVerdict(["up"], 0, "covered");
  const d = gate(input({ verdict: v, intent: "up", timedOut: true }));
  assert.equal(d.action, "abstain");
  assert.equal(d.reason, "upstream_timeout");
});

// Test 6 — |C|>tau (q̂=1 ⇒ {up,down}) ⇒ DEFER, not COMMIT.
test("set_too_large_defers", () => {
  const v = mkVerdict(["up", "down"], 1, "set_too_large");
  const d = gate(input({ verdict: v, intent: "up", clockOpen: true }));
  assert.equal(d.action, "defer");
  assert.equal(d.reason, "set_too_large");
  // Clock closed ⇒ the DEFER converts to ABSTAIN clock_expired.
  const d2 = gate(input({ verdict: v, intent: "up", clockOpen: false }));
  assert.equal(d2.action, "abstain");
  assert.equal(d2.reason, "clock_expired");
});

// Test 7 — H3: deferral does not change Σ miscover. Two REALLY distinct policies go
// through `gate()`: π^H (τ=1: a 2-set ⇒ DEFER) and π⁰ (τ=2: a 2-set ⇒ COMMIT). E_t = 1{y∉C_t} is
// derived from the SAME C_t (verdict region, L1) — the policy never touches C_t. If `l3-gate`
// corrupted the accounting (e.g. DEFER → COMMIT), the DEFER count below breaks.
test("deferral_preserves_miscover", () => {
  const seq: { labels: string[]; y: string }[] = [
    { labels: ["up"], y: "up" }, // covered
    { labels: ["up"], y: "down" }, // miscover
    { labels: ["up", "down"], y: "down" }, // covered (DEFER under π^H, COMMIT under π⁰)
    { labels: ["up", "down"], y: "up" }, // covered
    { labels: ["down"], y: "up" }, // miscover
  ];
  const run = (tau: number) => {
    let miscover = 0;
    let defers = 0;
    let commits = 0;
    for (const { labels, y } of seq) {
      const v = mkVerdict(labels, labels.length > 1 ? 1 : 0, labels.length > 1 ? "set_too_large" : "covered");
      const d = gate(input({ verdict: v, intent: labels[0] as string, tau }));
      const C = d.verdict.region;
      assert.ok(C !== undefined && C !== null && C.kind === "set", "C_t carried by the decision");
      if (!C.labels.includes(y)) miscover++;
      if (d.action === "defer") defers++;
      if (d.action === "commit") commits++;
    }
    return { miscover, defers, commits };
  };
  const piH = run(1);
  const pi0 = run(2);
  assert.equal(piH.defers, 2, "π^H defers both 2-sets");
  assert.equal(pi0.defers, 0, "π⁰ never defers");
  assert.equal(pi0.commits, piH.commits + 2, "the two policies really differ");
  assert.equal(piH.miscover, pi0.miscover, "Σ 1{y∉C} identical (H3)");
  assert.equal(piH.miscover, 2, "2 miscovers, invariant under deferral");
});

// C-4 (L3 form) and spec section 6 step 4 (contract 1.1.0, lot CM-3c-3a, Q-3a-6): a calib_* cell abstains with its reason, never
// defers; a verdict without region abstains with its no-region reason, or under_calib when its reason needs a region (no exception).
// killer: packages/hikae/src/l3-gate.ts:94 SDL "if (input.nCalib < input.nMin || region === null || noRegionReason) return { action: \"abstain\", allow: false, reason: noRegionReason ? input.verdict.reason : \"under_calib\" };" -> ""
test("l3_calib_and_regionless_reasons_abstain_with_the_verdict_reason", () => {
  const silence = mkVerdict(["up", "down"], 1, "calib_silence");
  const d = gate(input({ verdict: silence, intent: "up", tau: 1, clockOpen: true }));
  assert.deepEqual([d.action, d.allow, d.reason], ["abstain", false, "calib_silence"], "a silent cell abstains, never defers set_too_large");
  assert.equal(d.request_sha256, REQ, "the decision carries the request digest it is given");
  for (const reason of ["calib_vetoed", "calib_retired"] as const) assert.equal(gate(input({ verdict: { ...silence, reason }, intent: "up" })).reason, reason);
  const none = { ...mkVerdict(["up"], 0, "covered"), region: null, qhat: null, abstain: true };
  for (const reason of ["out_of_support", "region_degenerate", "calib_silence", "under_calib", "non_evaluable"] as const) {
    const n = gate(input({ verdict: { ...none, reason }, intent: "up" }));
    assert.deepEqual([n.action, n.allow, n.reason], ["abstain", false, reason], reason);
  }
  assert.equal(gate(input({ verdict: { ...none, reason: "covered" }, intent: "up" })).reason, "under_calib", "no region, served reason: under_calib");
  assert.equal(gate(input({ verdict: mkVerdict(["up"], 0, "covered"), intent: "up", nCalib: 49 })).reason, "under_calib", "nCalib < nMin");
});

// killer: packages/contracts/src/enums.ts:33 CONST "\"attestation_absent\", \"attestation_refused\"," -> ""
test("l3_reserved_reasons_abstain_with_their_reason_on_a_served_region", () => {
  const served = (reason: CoverageVerdict["reason"]) => gate(input({ verdict: mkVerdict(["up"], 0, reason), intent: "up" }));
  for (const reason of ["upstream_timeout", "attestation_absent", "attestation_refused", "binding_broken"] as const) assert.deepEqual([served(reason).action, served(reason).reason], ["abstain", reason], reason);
});

// killer: packages/hikae/src/l3-gate.ts:94 CONST "reason: noRegionReason ? input.verdict.reason : \"under_calib\"" -> "reason: input.nCalib < input.nMin ? \"under_calib\" : noRegionReason ? input.verdict.reason : \"under_calib\""
test("l3_verdict_reason_wins_over_ncalib_below_nmin", () => {
  assert.equal(gate(input({ verdict: mkVerdict(["up", "down"], 1, "calib_silence"), intent: "up", nCalib: 10 })).reason, "calib_silence");
  assert.equal(gate(input({ verdict: { ...mkVerdict(["up"], 0, "out_of_support"), region: null, qhat: null, abstain: true }, intent: "up", nCalib: 10 })).reason, "out_of_support");
});
