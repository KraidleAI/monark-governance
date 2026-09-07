/**
 * Reads the 9 frozen states from root `fixtures/` (local disk, never network), in filename
 * order. Each state passes the contract closed-check in `buildState`.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GateDecision } from "@monark/contracts";
import { buildState, type AtelierState } from "./state.ts";

export function loadRootFixtures(fixturesDir: string): AtelierState[] {
  const files = readdirSync(fixturesDir)
    .filter((f) => f.endsWith(".gate-decision.json"))
    .sort();
  return files.map((f) => {
    const raw: unknown = JSON.parse(readFileSync(join(fixturesDir, f), "utf8"));
    return buildState(f.replace(".gate-decision.json", ""), raw as GateDecision);
  });
}
