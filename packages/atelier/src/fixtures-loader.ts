/**
 * Lecture des 9 états gelés de `fixtures/` racine (disque local, jamais réseau), dans l'ordre des
 * noms de fichiers. Chaque état passe le closed-check du contrat dans `buildState`.
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
