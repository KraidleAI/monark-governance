import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { tmpdir } from "node:os";
import {
  loadRootFixtures,
  buildState,
  distribution,
  renderAll,
  renderState,
  plusMinutes,
  perps_order_preview,
  perps_order_execute,
  PERPS_ORDER_PREVIEW,
  PERPS_ORDER_EXECUTE,
} from "../src/index.ts";
import type { GateDecision } from "@monark/contracts";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const FIX = join(ROOT, "fixtures");
const PKG = join(ROOT, "packages", "atelier");

// Test 24 (ADR-M002 D11) — module d'état pur : oracle sur chacun des 9 états racine.
test("atelier_state_oracle", () => {
  const states = loadRootFixtures(FIX);
  assert.equal(states.length, 9);
  assert.deepEqual(distribution(states), { COMMIT: 3, DEFER: 2, ABSTAIN: 3, under_calib: 1 });
  for (const s of states) {
    const raw = JSON.parse(readFileSync(join(FIX, `${s.id}.gate-decision.json`), "utf8")) as GateDecision;
    assert.equal(s.decision, raw.action.toUpperCase(), `${s.id}: décision = action`);
    assert.equal(s.reason, raw.reason);
    assert.equal(s.allow, raw.allow);
    assert.equal(s.remainingBudget, raw.remaining_budget, "B_t = remaining_budget, jamais recalculé");
    assert.equal(s.clocks.coverageAt, raw.verdict.produced_at, "horloge 1 : couverture avant décision");
    assert.equal(s.clocks.labelAt, plusMinutes(raw.verdict.produced_at, 15), "horloge 2 : label à t+15 min");
    assert.ok(Date.parse(s.clocks.labelAt) > Date.parse(s.clocks.coverageAt));
    assert.deepEqual([...s.shogen.residual], raw.verdict.residual, "résiduel porté, pas inventé");
    assert.equal(s.ukemi.status, "non-branchee-phase1");
    // Panneau HIKAE : chaque champ numérique/textuel est lié au verdict brut (G2 Lot D corr. 1 —
    // un swap `alpha := n_calib` passait tsc + tests ; désormais rouge).
    assert.equal(s.hikae.method, raw.verdict.method, `${s.id}: method`);
    assert.equal(s.hikae.alpha, raw.verdict.alpha, `${s.id}: alpha`);
    assert.equal(s.hikae.nCalib, raw.verdict.n_calib, `${s.id}: n_calib`);
    assert.equal(s.hikae.qhat, typeof raw.verdict.qhat === "number" ? raw.verdict.qhat : null, `${s.id}: qhat`);
    const reg = raw.verdict.region;
    const expectedRegion =
      reg === undefined || reg === null ? "—" : reg.kind === "set" ? `{${reg.labels.join(", ")}}` : `[${reg.lo}, ${reg.hi}]`;
    assert.equal(s.hikae.region, expectedRegion, `${s.id}: region dérivée du verdict brut`);
  }
  // Oracles nommés.
  const byId = new Map(states.map((s) => [s.id, s]));
  assert.equal(byId.get("01-commit-up")?.hikae.region, "{up}");
  assert.equal(byId.get("04-defer-set-too-large")?.hikae.region, "{up, down}");
  assert.equal(byId.get("09-under-calib")?.decision, "ABSTAIN");
  assert.equal(plusMinutes("2026-09-04T12:00:00Z", 15), "2026-09-04T12:15:00Z");
  // Une décision non fermée (clé étrangère) est REFUSÉE par le contrat avant tout rendu.
  const raw = JSON.parse(readFileSync(join(FIX, "01-commit-up.gate-decision.json"), "utf8")) as GateDecision;
  assert.throws(() => buildState("x", { ...raw, p_correct: 0.9 } as unknown as GateDecision));
});

// Test 25 — les 9 états sont tous rendus, chacun identifiable et visible dans le HTML.
test("atelier_replays_root_fixtures", () => {
  const states = loadRootFixtures(FIX);
  const html = renderAll(states);
  for (const s of states) {
    assert.ok(html.includes(`data-state="${s.id}"`), `${s.id} rendu`);
    assert.ok(html.includes(`<h2>${s.id}</h2>`));
  }
  assert.equal((html.match(/<section class="state"/g) ?? []).length, 9);
  assert.equal((html.match(/class="badge badge-commit"/g) ?? []).length, 3 * 2, "3 COMMIT × (en-tête + décision)");
  assert.equal((html.match(/class="badge badge-defer"/g) ?? []).length, 2 * 2);
  assert.equal((html.match(/class="badge badge-abstain"/g) ?? []).length, 4 * 2, "3 ABSTAIN + 1 under_calib");
  assert.ok(html.includes("couverture avant décision") && html.includes("label arrivé à t+w"), "deux horloges nommées");
  assert.ok(html.includes("B<sub>t</sub> restant"), "budget visible");
  assert.ok(html.includes("Shōgen") && html.includes("HIKAE") && html.includes("UKEMI"), "trois panneaux");
  // Échappement : un id hostile ne s'injecte pas.
  const first = states[0];
  assert.ok(first);
  const hostile = renderState({ ...first, id: `<img src=x onerror=1>` }, 0);
  assert.ok(!hostile.includes("<img"), "id échappé");
});

// Test 26 — le paquet atelier ENTIER et le rendu passent le gate vocab ; un mutant le fait rougir.
test("atelier_no_forbidden_vocab", () => {
  const gate = join(ROOT, "scripts", "grep-forbidden.mjs");
  const tmp = mkdtempSync(join(tmpdir(), "atelier-vocab-"));
  const rendered = join(tmp, "rendered.html");
  writeFileSync(rendered, renderAll(loadRootFixtures(FIX)), "utf8");
  execFileSync("node", [gate, PKG, rendered], { stdio: "pipe" }); // exit 0 sinon lève
  const mutant = join(tmp, "mutant.html");
  // Assemblé par morceaux : le gate scanne aussi CE fichier et ne doit pas rougir sur la source du test.
  writeFileSync(mutant, ["<p>", "95", " % de fills ", "corr", "ects</p>"].join(""), "utf8");
  assert.throws(() => execFileSync("node", [gate, mutant], { stdio: "pipe" }), "le gate doit rougir sur le mutant");
});

// Test 27 — les deux noms gatés au Lot H existent ici en stubs qui LÈVENT.
test("perps_stubs_throw", () => {
  assert.equal(PERPS_ORDER_PREVIEW, "perps_order_preview");
  assert.equal(PERPS_ORDER_EXECUTE, "perps_order_execute");
  assert.throws(() => perps_order_preview(), /aucun ordre/);
  assert.throws(() => perps_order_execute(), /aucun ordre/);
  // Les fixtures nomment exactement ces outils — et rien d'autre.
  for (const s of loadRootFixtures(FIX)) assert.ok([PERPS_ORDER_PREVIEW, PERPS_ORDER_EXECUTE].includes(s.tool));
});

// Test 28 — zéro réseau : grep = 0 hors tests ; `fetch` piégé pendant le rejeu des 9 états.
test("atelier_no_network", () => {
  const NET = /fetch|XMLHttpRequest|WebSocket|http\.request|net\.connect/;
  const walk = (d: string): string[] =>
    readdirSync(d).flatMap((n) => {
      const p = join(d, n);
      if (statSync(p).isDirectory()) return n === "test" || n === "node_modules" ? [] : walk(p);
      return [".ts", ".js", ".html", ".css"].includes(extname(p)) ? [p] : [];
    });
  const files = walk(PKG);
  assert.ok(files.length >= 8, "surface scannée non vide");
  for (const f of files) {
    const lines = readFileSync(f, "utf8").split(/\r?\n/);
    lines.forEach((l, i) => assert.ok(!NET.test(l), `${f}:${i + 1} : appel réseau interdit`));
  }
  const g = globalThis as { fetch?: unknown };
  const saved = g.fetch;
  let called = 0;
  g.fetch = () => {
    called += 1;
    throw new Error("réseau interdit pendant le rejeu");
  };
  try {
    const html = renderAll(loadRootFixtures(FIX));
    assert.ok(html.length > 0);
  } finally {
    g.fetch = saved;
  }
  assert.equal(called, 0, "fetch jamais invoqué pendant le rejeu");
});
