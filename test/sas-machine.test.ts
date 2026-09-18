// test/sas-machine.test.ts — root oracle for the pure S0..S4 reducer (node --test, nodenext, no @/, no
// JSX). It builds the injected context from the loaded frozen enum + the derived profiles, then pins the
// state closure and the five storyboard invariants (MODELE-ILLUSTRATION §8).
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { PICKER_PROFILES } from "../apps/site/lib/profiles.ts";
import { loadGateEnums } from "../apps/site/lib/gate-enums.ts";
import { REASON, deriveProfiles, reasonIndexOf } from "../apps/site/components/sas/sas-model.ts";
import {
  initSas,
  reduce,
  type SasContext,
  type SasEvent,
  type SasStateId,
} from "../apps/site/components/sas/sas-machine.ts";

const ROOT = join(import.meta.dirname, "..");
const { reasons } = loadGateEnums(ROOT);

const CTX: SasContext = {
  profiles: deriveProfiles(PICKER_PROFILES),
  budgetExhaustedIndex: reasonIndexOf(reasons, REASON.EXHAUSTED),
  deferReasonIndex: reasonIndexOf(reasons, REASON.DEFER),
};

test("sas_states_closed — only S0..S4, and the five storyboard invariants hold", () => {
  const S0 = initSas();
  assert.equal(S0.id, "S0");

  // (closed) every event from a spread of base states yields an id inside {S0..S4}.
  const ALLOWED = new Set<SasStateId>(["S0", "S1", "S2", "S3", "S4"]);
  const idxAttest = reasonIndexOf(reasons, "attestation_absent");
  const events: SasEvent[] = [
    { type: "calm" },
    { type: "refuse", chamber: "attest", reasonIndex: idxAttest },
    { type: "defer" },
    { type: "clockClose" },
    { type: "budgetLow" },
    { type: "pick", profileIndex: 0 },
    { type: "pick", profileIndex: 5 },
  ];
  const bases = [
    S0,
    reduce(S0, { type: "defer" }, CTX),
    reduce(S0, { type: "budgetLow" }, CTX),
    reduce(S0, { type: "pick", profileIndex: 0 }, CTX),
  ];
  for (const b of bases) {
    for (const e of events) assert.ok(ALLOWED.has(reduce(b, e, CTX).id), "reached a state outside S0..S4");
  }

  // (I1) S1 refuse -> downstream unchanged; a deposit lands at the refusing chamber.
  const s1 = reduce(S0, { type: "refuse", chamber: "attest", reasonIndex: idxAttest }, CTX);
  assert.equal(s1.id, "S1");
  assert.deepEqual(s1.downstream, S0.downstream); // the net that passes is unchanged
  assert.equal(s1.deposits.length, 1);
  assert.equal(s1.deposits[0]?.chamber, "attest");

  // (I2) S2 clockClose -> the brume falls to a Gate sediment, inheriting its defer reason.
  const s2 = reduce(S0, { type: "defer" }, CTX);
  assert.equal(s2.id, "S2");
  assert.ok(s2.brume);
  assert.equal(s2.brume.chamber, "gate");
  const s2c = reduce(s2, { type: "clockClose" }, CTX);
  assert.equal(s2c.brume, null);
  const gateDep = s2c.deposits.find((d) => d.chamber === "gate");
  assert.ok(gateDep, "clockClose must deposit a Gate sediment");
  assert.equal(gateDep.reasonIndex, CTX.deferReasonIndex); // inherited defer reason, not an invented code

  // (I3) S3 budgetLow -> valve shut; EVERY deposit is forced to the budget-floor reason in Gate.
  const s3 = reduce(S0, { type: "budgetLow" }, CTX);
  assert.equal(s3.id, "S3");
  assert.equal(s3.valveClosed, true);
  assert.equal(s3.deposits[s3.deposits.length - 1]?.reasonIndex, CTX.budgetExhaustedIndex);
  const s3b = reduce(s3, { type: "refuse", chamber: "attest", reasonIndex: idxAttest }, CTX);
  const forced = s3b.deposits[s3b.deposits.length - 1];
  assert.equal(forced?.reasonIndex, CTX.budgetExhaustedIndex, "a shut-valve deposit is budget_exhausted by index");
  assert.equal(forced?.chamber, "gate");
  assert.equal(s3b.id, "S3");

  // (I4) S4 pick -> lit pieces == engineKeys exactly; a VISAGE pick lights the spine alone.
  const finger = PICKER_PROFILES.findIndex((p) => p.tier === "finger");
  const visage = PICKER_PROFILES.findIndex((p) => p.tier === "visage");
  const s4f = reduce(S0, { type: "pick", profileIndex: finger }, CTX);
  assert.equal(s4f.id, "S4");
  assert.ok(s4f.litSpine);
  assert.deepEqual([...s4f.litPieceKeys].sort(), [...(PICKER_PROFILES[finger]?.engineKeys ?? [])].sort());
  const s4v = reduce(S0, { type: "pick", profileIndex: visage }, CTX);
  assert.ok(s4v.litSpine);
  assert.equal(s4v.litPieceKeys.length, 0, "a VISAGE pick lights the spine alone");

  // (I5) calm -> back to S0 (a full reset).
  assert.equal(reduce(s4f, { type: "calm" }, CTX).id, "S0");
  assert.deepEqual(reduce(s4f, { type: "calm" }, CTX), S0);
});
