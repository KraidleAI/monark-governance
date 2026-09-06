import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildVerdict, buildSetRegion, serialize } from "../src/index.ts";
import { calibDigest, serializeVerdict } from "@monark/contracts";
import type { CoverageVerdict } from "@monark/contracts";
import { runS2 } from "../src/index.ts";

const SCORES = [0, 0, 1, 0, 1];

function baseVerdict(): CoverageVerdict {
  return buildVerdict({
    taskClass: "btc-dir-15m",
    method: "hac-cp",
    alpha: 0.1,
    scores: SCORES,
    region: buildSetRegion(["up"]),
    qhat: 0,
    abstain: false,
    reason: "covered",
    residual: ["assume:tls-notary"],
    producedAt: "2026-09-04T00:00:00Z",
    schemaVersion: "1.0.0",
  });
}

// Test 4 — une clé interdite (p_correct) dans la sérialisation du verdict ⇒ LÈVE (contrat gelé).
test("no_p_correct_field", () => {
  const clean = baseVerdict();
  assert.doesNotThrow(() => serialize(clean), "verdict propre sérialise");
  const poisoned = { ...clean, p_correct: 0.9 } as unknown as CoverageVerdict;
  assert.throws(() => serializeVerdict(poisoned), /p_correct|forbidden|interdit|unknown|clé/i);
  // Injection en profondeur (dans la région) attrapée aussi.
  const deep = { ...clean, region: { kind: "set", labels: ["up"], label_schema: "up|down", confidence: 1 } } as unknown as CoverageVerdict;
  assert.throws(() => serializeVerdict(deep), /confidence|forbidden|unknown|clé/i);
});

// Test 13 — calib_digest du verdict == calibDigest(scores) (recalculabilité par référence).
test("calib_digest_matches_contracts", () => {
  const v = baseVerdict();
  assert.equal(v.calib_digest, calibDigest(SCORES), "calib_digest par référence (ADR-M001 C5)");
  // Oracle cross-langage [0,1] (Phase 0).
  assert.equal(
    calibDigest([0, 1]),
    "1e47beee7f4175a863385dc2f9c8278138e35f0caa43a5467a523519f1e91081",
  );
});

// Test 12 — l'erreur|COMMIT est un chiffre de desk ÉTIQUETÉ (H2.3) + le gate vocab attrape une tournure interdite.
test("commit_error_not_alpha_is_labelled", () => {
  // (a) le rapport (généré par le VRAI runner, prédicteurs exécutés) étiquette la couverture
  // conditionnelle à l'action « PAS la garantie CP ».
  const report = runS2().report;
  assert.match(report, /PAS la garantie CP/, "la couverture conditionnelle est étiquetée (H2.3)");
  // (b) le gate vocab racine rejette « X % de fills corrects » (exit 1).
  const root = join(import.meta.dirname, "..", "..", "..");
  // Hors de l'arbre de travail (G2 Lot H corr. 3) : `os.tmpdir()`, répertoire éphémère, nettoyé.
  const scratch = mkdtempSync(join(tmpdir(), "hikae-vocab-"));
  const tmp = join(scratch, "hikae-vocab-mutant.md");
  writeFileSync(tmp, "Our agent achieves 73 % de fills corrects.\n");
  let exitCode = 0;
  try {
    execFileSync("node", [join(root, "scripts", "grep-forbidden.mjs"), tmp], { stdio: "pipe" });
  } catch (e) {
    exitCode = (e as { status?: number }).status ?? 1;
  }
  rmSync(scratch, { recursive: true, force: true });
  assert.equal(exitCode, 1, "« 73 % de fills corrects » ⇒ gate vocab échoue");
});
