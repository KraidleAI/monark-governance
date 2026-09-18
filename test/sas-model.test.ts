// test/sas-model.test.ts — root oracle for the pure sas model (node --test, nodenext, no @/ alias, no
// JSX — like the other root gates). It INJECTS the real registers (FLEET_AGENTS / PICKER_PROFILES) into
// the model's derive functions and proves the derivation is bidirectional: derived, never recopied.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { FLEET_AGENTS } from "../apps/site/lib/fleet.ts";
import { PICKER_PROFILES } from "../apps/site/lib/profiles.ts";
import {
  CHAMBER_ORDER,
  CONTAINER,
  SPINE,
  derivePieces,
  deriveProfiles,
} from "../apps/site/components/sas/sas-model.ts";

const ROOT = join(import.meta.dirname, "..");

test("sas_model_matches_registers — 11 pieces = FLEET_AGENTS; Hikae in 2 chambers; MONARK absent; 8 profiles = PICKER_PROFILES; paths = engineKeys", () => {
  const pieces = derivePieces(FLEET_AGENTS);
  // Eleven pieces, exactly the register names in order (derived, not recopied).
  assert.equal(pieces.length, FLEET_AGENTS.length);
  assert.equal(pieces.length, 11);
  assert.deepEqual(
    pieces.map((p) => p.name),
    FLEET_AGENTS.map((a) => a.name),
  );
  // role/status flow FROM the injected register (a copy would drift on a register edit).
  for (const [i, p] of pieces.entries()) {
    const a = FLEET_AGENTS[i];
    assert.ok(a);
    assert.equal(p.role, a.role);
    assert.equal(p.status, a.status);
  }
  // Every piece sits in at least one real chamber.
  const chamberIds = new Set(CHAMBER_ORDER);
  for (const p of pieces) {
    assert.ok(p.chambers.length >= 1, `piece ${p.name} has no chamber`);
    for (const c of p.chambers) assert.ok(chamberIds.has(c), `piece ${p.name} in unknown chamber ${c}`);
  }
  // Hikae is the double filter — EXACTLY Calibrate and Gate.
  const hikae = pieces.find((p) => p.name === "Hikae");
  assert.ok(hikae);
  assert.deepEqual([...hikae.chambers].sort(), ["calibrate", "gate"]);
  // Every OTHER piece is in exactly one chamber.
  for (const p of pieces) {
    if (p.name !== "Hikae") assert.equal(p.chambers.length, 1, `${p.name} must be in one chamber`);
  }
  // MONARK is not a piece.
  assert.ok(!pieces.some((p) => p.name === CONTAINER), "MONARK must not be a piece");

  // Eight profiles = PICKER_PROFILES; each path is its engineKeys verbatim.
  const profiles = deriveProfiles(PICKER_PROFILES);
  assert.equal(profiles.length, PICKER_PROFILES.length);
  assert.equal(profiles.length, 8);
  for (const [i, prof] of profiles.entries()) {
    const src = PICKER_PROFILES[i];
    assert.ok(src);
    assert.deepEqual(prof.path, [...src.engineKeys]);
  }
  // Every engineKey resolves to a real piece key — no dangling path key.
  const keys = new Set(pieces.map((p) => p.key));
  for (const prof of profiles) {
    for (const k of prof.path) assert.ok(keys.has(k), `profile ${prof.label} path key ${k} resolves to no piece`);
  }
  // The three VISAGE profiles carry an empty path (spine only).
  const visage = profiles.filter((p) => p.tier === "visage");
  assert.equal(visage.length, 3);
  for (const p of visage) assert.equal(p.path.length, 0, `${p.label} (visage) must have an empty path`);
});

test("sas_monark_is_container_not_piece — MONARK is the container (the whole sas), never a piece", () => {
  assert.equal(CONTAINER, "MONARK");
  const pieces = derivePieces(FLEET_AGENTS);
  assert.ok(!pieces.some((p) => p.name === CONTAINER), "MONARK is not among the pieces");
  // MONARK is not in the register at all — it is the engine, not an agent.
  assert.ok(!FLEET_AGENTS.some((a) => a.name === CONTAINER), "MONARK is not a fleet agent");
});

test("sas_defidrama_absent — the out-of-scope name appears nowhere under apps/site (case-insensitive)", () => {
  const base = join(ROOT, "apps", "site");
  const skip = new Set(["node_modules", ".next", ".turbo"]);
  const exts = new Set([".ts", ".tsx", ".mjs", ".cjs", ".js", ".jsx", ".md", ".mdx", ".json", ".css", ".html"]);
  const needle = /defidrama/i;
  const hits: string[] = [];
  let scanned = 0;
  const walk = (absDir: string, rel: string): void => {
    for (const name of readdirSync(absDir)) {
      if (skip.has(name)) continue;
      const abs = join(absDir, name);
      if (statSync(abs).isDirectory()) {
        walk(abs, `${rel}/${name}`);
        continue;
      }
      if (!exts.has(extname(name).toLowerCase())) continue;
      scanned += 1;
      if (needle.test(readFileSync(abs, "utf8"))) hits.push(`${rel}/${name}`);
    }
  };
  walk(base, "apps/site");
  assert.ok(scanned >= 1, "no apps/site files scanned (false green)");
  assert.deepEqual(hits, [], `the out-of-scope name appears under apps/site: ${hits.join(", ")}`);
});

test("sas_spine_single_definition — the spine is the four-chamber diagonal, no piece, defined exactly once", () => {
  // SPINE = the four chambers in order, no piece.
  assert.deepEqual([...SPINE], [...CHAMBER_ORDER]);
  assert.deepEqual([...SPINE], ["attest", "calibrate", "gate", "agir"]);
  // No piece key leaks into the spine (chambers only).
  const pieceKeys = new Set(derivePieces(FLEET_AGENTS).map((p) => p.key));
  for (const s of SPINE) assert.ok(!pieceKeys.has(s), `spine entry ${s} collides with a piece key`);
  // Defined EXACTLY once in the model source (single, closed definition — checkpoint-1 C-7).
  const src = readFileSync(join(ROOT, "apps", "site", "components", "sas", "sas-model.ts"), "utf8");
  const defs = src.match(/export const SPINE\b/g) ?? [];
  assert.equal(defs.length, 1, "SPINE must be defined exactly once");
});
