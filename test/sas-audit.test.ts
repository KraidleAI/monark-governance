// test/sas-audit.test.ts — root oracle for the audit payload (node --test, nodenext, no @/, no JSX). It
// proves (a) the reason -> chamber map covers exactly the seventeen non-commit codes (contract 1.1.0), once each, resolved BY
// INDEX against the loaded frozen enum; and (b) the panel labels are the loaded required[] entries picked
// by index (never hard-coded), values illustrative under caveat. Field names ARE quoted here — this test
// lives outside apps/site, so frozen_contract_fields_stay_dynamic (which scans apps/site only) does not
// apply, exactly like ci-gates.test.ts spelling the third action word.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { loadGateEnums } from "../apps/site/lib/gate-enums.ts";
import { loadContract } from "../apps/site/lib/load-contract.ts";
import { CHAMBER_ORDER, COVERED, chamberForReasonIndex } from "../apps/site/components/sas/sas-model.ts";
import { AUDIT_CAVEAT, FIELD, ILLUSTRATIVE, buildAuditPayload } from "../apps/site/components/sas/sas-audit.ts";

const ROOT = join(import.meta.dirname, "..");

test("sas_audit_reasons_from_frozen_enum — the seventeen non-commit codes each map to exactly one chamber (coverage + uniqueness), by index", () => {
  const { reasons } = loadGateEnums(ROOT);
  assert.equal(reasons.length, 18, "the frozen reason enum carries eighteen codes (contract 1.1.0)");
  assert.equal(reasons.filter((r) => r !== COVERED).length, 17, "seventeen non-commit codes");

  // The commit code owns no chamber, resolved by its index.
  const coveredIndex = reasons.indexOf(COVERED);
  assert.ok(coveredIndex >= 0, "the commit code is present in the enum");
  assert.equal(chamberForReasonIndex(reasons, coveredIndex), null, "the commit code owns no chamber");

  // Every non-commit code maps to exactly one real chamber (coverage AND uniqueness), by index.
  const chamberIds = new Set(CHAMBER_ORDER);
  const seen = new Set<string>();
  for (let i = 0; i < reasons.length; i++) {
    const code = reasons[i];
    if (code === undefined || code === COVERED) continue;
    const chamber = chamberForReasonIndex(reasons, i);
    assert.ok(chamber, `code ${code} maps to no chamber (coverage hole)`);
    assert.ok(chamberIds.has(chamber), `code ${code} maps to a non-chamber ${chamber}`);
    assert.ok(!seen.has(code), `code ${code} mapped twice (uniqueness broken)`);
    seen.add(code);
  }
  assert.equal(seen.size, 17, "all seventeen non-commit codes covered exactly once");
});

// killer: apps/site/components/sas/sas-audit.ts:14 CONST "SCORES_DIGEST: 12" -> "SCORES_DIGEST: 10"
test("sas_audit_labels_from_required — row labels are the loaded required[] entries selected by index; values illustrative under caveat", () => {
  const verdict = loadContract(ROOT, "coverage-verdict.schema.json", "Hikae");
  const gate = loadContract(ROOT, "gate-decision.schema.json", "MONARK");
  // Pin the FIELD indices against the loaded required[] (schema order) — non-vacuity, like the C-9 gate.
  assert.equal(verdict.required[FIELD.REASON], "reason");
  assert.equal(verdict.required[FIELD.REGION], "region");
  assert.equal(verdict.required[FIELD.SCORES_DIGEST], "scores_sha256");
  assert.equal(verdict.required[FIELD.PRODUCED_AT], "produced_at");
  assert.equal(gate.required[FIELD.REMAINING_BUDGET], "remaining_budget");

  const { reasons } = loadGateEnums(ROOT);
  const idx = reasons.indexOf("budget_exhausted");
  const payload = buildAuditPayload({
    chamber: "gate",
    chamberLabel: "Gate",
    reasonIndex: idx,
    reason: reasons[idx] ?? "",
    verdictFields: verdict.required,
    gateFields: gate.required,
  });
  // Labels flow FROM required[] (dynamic), selected by index — never hard-coded in apps/site.
  assert.deepEqual(
    payload.rows.map((r) => r.label),
    ["reason", "region", "scores_sha256", "remaining_budget", "produced_at"],
  );
  // The reason value is the code resolved by index; the other values are illustrative.
  assert.equal(payload.rows[0]?.value, "budget_exhausted");
  for (const r of payload.rows.slice(1)) assert.equal(r.value, ILLUSTRATIVE, "non-reason values are illustrative, not a real digest");
  assert.equal(payload.reasonIndex, idx);
  assert.equal(payload.caveat, AUDIT_CAVEAT);
  assert.match(payload.caveat, /illustrative/i);
});
