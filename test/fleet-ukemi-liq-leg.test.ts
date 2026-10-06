/**
 * Root test (U-4b-2b, ADR-U4b-2b D3 and N-10, item FLEET-UKEMI-CA-BIND-1; CA-11 by test, precedent the Bell served-data
 * binding): the public register declares Ukemi's SECOND served leg (the liquidation-eligible-coverage class through the
 * gate) ONLY while the committed deploy CA (docs/deploy-CA-harness.json) proves it served -- gate_liq_call green with its
 * verdict covered, gate_liq_uncommitted_call green, mcp_gate_description_liq green with the committed clause, TLS
 * authorized on the live host. Mutant: the leg declared while the committed CA still records the empty-registry answer
 * (verdict under_calib, the CA of `bb41b6d`) => red. Private (root test/ is not exported). No network.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FLEET_AGENTS } from "../apps/site/lib/fleet.ts";

const ROOT = join(import.meta.dirname, "..");
/** The integration test that replays the liq leg (apps/harness/test/gate-liq-artifact.test.ts). */
const LIQ_LEG_TEST = "u4b_gate_serves_region_from_real_artifact";

interface CaCheck { name: string; ok: boolean; detail?: string }
interface Ca { url: string; checks: CaCheck[]; tls: { authorized?: boolean; skipped?: boolean } }

test("fleet_ukemi_liq_leg_matches_deploy_ca", () => {
  const ukemi = FLEET_AGENTS.find((a) => a.name === "Ukemi");
  assert.ok(ukemi !== undefined && ukemi.status === "built", "Ukemi is a built agent of the register");
  assert.ok(ukemi.wiring.integration_test.includes(LIQ_LEG_TEST), "the register declares the liq leg and its integration test");
  assert.ok(ukemi.wiring.served_by.includes("liquidation-eligible-coverage"), "the declared served path names the liq class");
  const ca = JSON.parse(readFileSync(join(ROOT, "docs", "deploy-CA-harness.json"), "utf8")) as Ca;
  const check = (name: string): CaCheck => {
    const c = ca.checks.find((x) => x.name === name);
    assert.ok(c !== undefined, `the committed CA carries the check ${name}`);
    return c;
  };
  const liq = check("gate_liq_call");
  assert.ok(liq.ok, `gate_liq_call is green in the committed CA: ${String(liq.detail)}`);
  assert.ok((liq.detail ?? "").includes("verdict_reason=covered") && (liq.detail ?? "").includes("upper_bound=true"), "the committed CA saw the covered upper bound");
  assert.ok(check("gate_liq_uncommitted_call").ok, "the uncommitted strata abstain in the committed CA");
  const desc = check("mcp_gate_description_liq");
  assert.ok(desc.ok && (desc.detail ?? "").includes("committed_clause=true"), "the served description carries the committed clause");
  assert.ok(ca.url.startsWith("https://") && ca.tls.authorized === true, "the committed CA probed the live https host with an authorized TLS");
});
