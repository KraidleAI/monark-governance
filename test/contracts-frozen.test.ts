/**
 * Test racine `contracts_frozen` — ADR-M002 D2 / D13 (CA-0).
 * Pendant toute la Phase 1, `schemas/*.json` et `packages/contracts/src/**` restent
 * byte-identiques à l'état du commit Phase 0 `357ef25`. Le manifeste ci-dessous a été
 * calculé sur cet état (sha256 du contenu, LF). Toute dérive = rouge ; une évolution
 * de contrat passe par un ADR + bump `schema_version`, puis mise à jour du manifeste.
 * Exécuté par `npm test` dans CHAQUE worktree (hors comptage par lot).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const FROZEN_MANIFEST: Record<string, string> = JSON.parse(
  readFileSync(join(ROOT, "test", "contracts-frozen.manifest.json"), "utf8"),
) as Record<string, string>;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function sha256(path: string): string {
  const buf = readFileSync(path);
  const lf = buf.toString("utf8").replace(/\r\n/g, "\n");
  return createHash("sha256").update(lf, "utf8").digest("hex");
}

function currentManifest(): Record<string, string> {
  const files = [
    ...walk(join(ROOT, "schemas")),
    ...walk(join(ROOT, "packages", "contracts", "src")),
  ];
  const m: Record<string, string> = {};
  for (const f of files) {
    const key = relative(ROOT, f).split(sep).join("/");
    m[key] = sha256(f);
  }
  return m;
}

test("contracts_frozen — schemas/ et packages/contracts/src/ identiques au manifeste Phase 0 (357ef25)", () => {
  const now = currentManifest();
  const frozenKeys = Object.keys(FROZEN_MANIFEST).sort();
  const nowKeys = Object.keys(now).sort();
  assert.deepEqual(nowKeys, frozenKeys, "fichier ajouté ou retiré dans la zone gelée (ADR requis)");
  for (const k of frozenKeys) {
    assert.equal(now[k], FROZEN_MANIFEST[k], `contenu modifié dans la zone gelée : ${k} (ADR requis)`);
  }
});

test("contracts_frozen — le manifeste n'est pas vide et couvre les 5 schémas", () => {
  const keys = Object.keys(FROZEN_MANIFEST);
  assert.ok(keys.length >= 10, `manifeste trop court : ${keys.length}`);
  const schemas = keys.filter((k) => k.startsWith("schemas/")).length;
  assert.equal(schemas, 5, "attendu : 4 schémas + forbidden-keys.json");
});
