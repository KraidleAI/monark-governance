/**
 * Root test `visage_register_is_frozen` (F-site-6 C-7 / ADR-M004 addendum D15). A non-LLM oracle over
 * the two data modules F-site-6 adds — lib/visage.ts (the three face-market artefacts) and
 * lib/fleet-presentation.ts (the Mod #1 "What's inside" / "What it will use" points). It locks:
 *   (1) exactly THREE visage, all `upcoming` (named mutant: flip one to "built" ⇒ red);
 *   (2) the storefront's GLOBAL upcoming count is SIXTEEN (thirteen fleet-upcoming + three visage),
 *       AND the fleet register itself stays sixteen entries (eleven agents + five products) — both
 *       readings of D15's "compte global 16", re-derived from the registers, never hard-coded;
 *   (3) a NUMERIC-HOLE closure (C-4): every rendered string of the two new modules — which render via
 *       {property access}/{point} and so escape the honesty lint (test 44) — carries zero numeric
 *       literal (named mutant: a digit in any point ⇒ red);
 *   (4) NON-INERT completeness: the INSIDE keys are EXACTLY the nineteen fleet/product/visage entities,
 *       the three built agents carry a "built" block and the sixteen others an "upcoming" block;
 *   (5) CONSUMPTION: the new register-driven surfaces read status FROM the registers, never a
 *       hard-coded status attribute (mirrors fleet_register_built_set_is_frozen; D15 requires the
 *       status to come from the register, never coded off it).
 * Runs under `npm test` (node --test), outside the per-lot R-25 count.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { scanText as scanNumericText } from "../apps/site/test/honesty-lint.ts";
import { VISAGE } from "../apps/site/lib/visage.ts";
import type { VisageStatus } from "../apps/site/lib/visage.ts";
import { INSIDE } from "../apps/site/lib/fleet-presentation.ts";
import { FLEET_AGENTS, PRODUCTS } from "../apps/site/lib/fleet.ts";
import type { FleetStatus } from "../apps/site/lib/fleet.ts";
import type { AgentStatus } from "../apps/site/lib/status.ts";

const ROOT = join(import.meta.dirname, "..");
const BUILT = ["shogen", "hikae", "ukemi"]; // the three built agents' INSIDE slugs (panels hard-code these)

test("visage_register_is_frozen — three visage upcoming, global upcoming sixteen, numeric-hole closed (F-site-6 C-7)", () => {
  // Compile-time: VisageStatus IS the honest AgentStatus/FleetStatus vocabulary (both "built"|"upcoming").
  // The coercions type-check only if no type adds or drops a member — a stray "live" reds one of them
  // under `npm run typecheck`. Called so they are not unused.
  const asAgent = (s: VisageStatus): AgentStatus => s;
  const asFleet = (s: FleetStatus): VisageStatus => s;
  assert.equal(asAgent("upcoming"), "upcoming");
  assert.equal(asFleet("built"), "built");

  // (1) exactly three visage, each upcoming — the mutant target.
  assert.equal(VISAGE.length, 3, "exactly three visage artefacts");
  assert.deepEqual(
    VISAGE.map((v) => v.name).sort(),
    ["MONARK Attestation", "MONARK Hallmark", "MONARK Threshold"].sort(),
    "the three visage are Attestation / Hallmark / Threshold (uid 28b02686)",
  );
  for (const v of VISAGE) assert.equal(v.status, "upcoming", `visage ${v.name} must be upcoming`);

  // (2) "compte global 16" — both readings, re-derived from the registers.
  const fleetUpcoming =
    FLEET_AGENTS.filter((a) => a.status === "upcoming").length + PRODUCTS.filter((p) => p.status === "upcoming").length;
  const visageUpcoming = VISAGE.filter((v) => v.status === "upcoming").length;
  assert.equal(fleetUpcoming, 13, "the fleet register stays thirteen upcoming (fleet_register invariant)");
  assert.equal(fleetUpcoming + visageUpcoming, 16, "global upcoming is sixteen (thirteen fleet + three visage)");
  assert.equal(FLEET_AGENTS.length + PRODUCTS.length, 16, "the fleet register stays sixteen entries (11 agents + 5 products)");

  // (3) NUMERIC-HOLE closure — every rendered string of the two new modules carries zero numeric literal.
  const noExempt = new Set<string>();
  const strings: string[] = [];
  for (const v of VISAGE) strings.push(v.key, v.name, v.tagline, v.what, v.buyers);
  for (const block of Object.values(INSIDE)) for (const p of block.points) strings.push(p);
  const numericHits = strings.flatMap((s) => scanNumericText(s, noExempt));
  assert.deepEqual(numericHits, [], `a visage/presentation string carries a rendered numeric literal: ${JSON.stringify(numericHits)}`);

  // (4) NON-INERT completeness — INSIDE keys are EXACTLY the nineteen entities, derived from the
  // registers (the eight upcoming agents by name.toLowerCase(); none carries a diacritic). A missing or
  // stray key reds here, so a panel can never look up an absent block (insideFor throws) unnoticed.
  const expectedKeys = [
    ...BUILT,
    ...FLEET_AGENTS.filter((a) => a.status === "upcoming").map((a) => a.name.toLowerCase()),
    ...PRODUCTS.map((p) => p.key),
    ...VISAGE.map((v) => v.key),
  ].sort();
  assert.equal(expectedKeys.length, 19, "nineteen entities (3 built + 8 upcoming agents + 5 products + 3 visage)");
  assert.deepEqual(Object.keys(INSIDE).sort(), expectedKeys, "INSIDE must cover exactly the nineteen fleet/product/visage keys");
  for (const [key, block] of Object.entries(INSIDE)) {
    const expected = BUILT.includes(key) ? "built" : "upcoming";
    assert.equal(block.kind, expected, `INSIDE '${key}' must be a ${expected} block`);
    assert.ok(block.points.length >= 1, `INSIDE '${key}' must carry at least one point`);
  }

  // (5) CONSUMPTION — the new register-driven surfaces render status FROM the registers, never a
  // hard-coded status="built"/status="upcoming" (or the JSX-wrapped status={"built"}) attribute. The
  // three built agent panels are out of scope (their block statuses are their own declared truth).
  const NEW_SURFACES = [
    "apps/site/app/products/page.tsx",
    "apps/site/app/fleet/page.tsx",
    "apps/site/components/placeholder-panel.tsx",
    "apps/site/components/what-inside.tsx",
  ];
  const hardCoded = /status\s*=\s*\{?\s*["'](?:built|upcoming)["']/;
  for (const rel of NEW_SURFACES) {
    const text = readFileSync(join(ROOT, rel), "utf8");
    assert.ok(
      !hardCoded.test(text),
      `${rel} must not hard-code a status attribute — read it from the register (inert otherwise)`,
    );
  }
});
