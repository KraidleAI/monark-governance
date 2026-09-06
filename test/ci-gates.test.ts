/**
 * Test racine `ci_gates_blocking_no_continue_on_error` (test 38, ADR-M003 D11, Lot V).
 * Oracle non-LLM sur le workflow instancié `.github/workflows/ci.yml` : il DOIT rester
 * bloquant de bout en bout et épinglé. Le test lit le fichier comme texte (pas d'exécution
 * d'`act` requise, D1) et échoue si :
 *   (1) un `continue-on-error` apparaît (un job cesserait d'être bloquant) ;
 *   (2) une action `uses:` n'est pas épinglée par un SHA de commit 40-hex (tag mobile) ;
 *   (3) `VIBEGATES_PR_LIMIT` ≠ "1205" (borne ADR-M003 D9) ;
 *   (4) le pathspec d'exclusion des artefacts S2 générés manque au décompte R-25 ;
 *   (5) le déclencheur `on:` ne porte pas `pull_request` (livraison par PR — ADR-M003 D9 addendum 2026-09-05) ;
 *   (6) le job g4 n'exécute pas le cliquet `npm run lint:ratchet` (ADR-M003 D9 ter §3, 2026-09-06).
 *   (4bis) les rapports de gouvernance G1/G2 ne sont pas exclus du décompte R-25 (D9 quater) ;
 *   (7) le job g4 ne porte pas littéralement `run: npm run lint && npm run lint:ratchet` (D9 quater).
 * Mutant nommé (revue G2) : `continue-on-error: true` inséré ⇒ rouge ; restauration à
 * l'octet (sha256 avant/après) consignée dans docs/G1-lot-V.md.
 * Exécuté par `npm test` dans chaque worktree (hors comptage par lot).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const WF = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
const LINES = WF.split(/\r?\n/);

test("ci_gates_blocking_no_continue_on_error — workflow bloquant et épinglé (test 38)", () => {
  // (1) invariant du template : aucune DIRECTIVE continue-on-error (clé YAML sur une ligne
  //     non-commentaire). La mention en prose dans un commentaire est licite (le template lui-même
  //     écrit « Pas de continue-on-error ») ; c'est la clé `continue-on-error:` qui débloquerait un job.
  const coeDirective = LINES.some((l) => /^\s*continue-on-error\s*:/.test(l));
  assert.ok(!coeDirective, "directive continue-on-error présente : un job cesserait d'être bloquant");

  // (2) toute action `uses:` épinglée par SHA de commit 40-hex (lignes de commentaire ignorées).
  const usesRefs: string[] = [];
  for (const l of LINES) {
    if (/^\s*#/.test(l)) continue;
    const m = /^\s*-?\s*uses:\s*(\S+)/.exec(l);
    if (m && m[1]) usesRefs.push(m[1]);
  }
  assert.ok(usesRefs.length >= 2, `attendu au moins 2 actions uses:, vu ${usesRefs.length}`);
  for (const u of usesRefs) {
    const at = u.lastIndexOf("@");
    assert.notEqual(at, -1, `uses: non épinglé (aucun @) : ${u}`);
    const ref = u.slice(at + 1);
    assert.match(ref, /^[0-9a-f]{40}$/, `uses: non épinglé par SHA de commit 40-hex : ${u}`);
  }

  // (3) VIBEGATES_PR_LIMIT fixé à "1205" (ADR-M003 D9) — et à rien d'autre.
  const limits: string[] = [];
  for (const m of WF.matchAll(/VIBEGATES_PR_LIMIT\s*:\s*["']?([^"'\s#]+)["']?/g)) {
    if (m[1]) limits.push(m[1]);
  }
  assert.ok(limits.length >= 1, "VIBEGATES_PR_LIMIT absent du workflow (fail-closed non configuré)");
  for (const v of limits) assert.equal(v, "1205", `VIBEGATES_PR_LIMIT = ${v} ≠ 1205 (ADR-M003 D9)`);

  // (4) pathspec d'exclusion des artefacts S2 générés présent dans le décompte R-25 (ADR-M003 D9).
  assert.ok(
    WF.includes(":(exclude)packages/*/docs/S2-*"),
    "pathspec d'exclusion S2 manquant du décompte R-25 (le lot H déborderait à cause du journal TSV)",
  );
  // (4bis) rapports de gouvernance G1/G2 exclus du décompte R-25 (ADR-M003 D9 quater, 2026-09-06 :
  //        mesuré 1311 > 1205 avec les rapports, 621 code seul).
  for (const ps of [":(exclude)docs/G1-lot-*.md", ":(exclude)docs/G2-lot-*.md"]) {
    assert.ok(WF.includes(ps), `pathspec ${ps} manquant du décompte R-25 (ADR-M003 D9 quater)`);
  }

  // (5) livraison par PR (ADR-M003 D9 addendum 2026-09-05, option c) : le workflow DOIT se déclencher
  //     sur pull_request. Bloc-scopé sur la clé de haut niveau `on:` (lignes indentées jusqu'à la
  //     prochaine clé colonne-0), commentaires en fin de ligne retirés : le commentaire d'en-tête qui
  //     cite « pull_request » ne doit PAS masquer un mutant qui retire le vrai déclencheur.
  const onIdx = LINES.findIndex((l) => /^on\s*:/.test(l));
  assert.notEqual(onIdx, -1, "clé de haut niveau 'on:' absente du workflow");
  const onBlock = [LINES[onIdx]!.replace(/#.*$/, "")];
  for (let i = onIdx + 1; i < LINES.length; i++) {
    if (/^\S/.test(LINES[i]!) && !/^\s*#/.test(LINES[i]!)) break; // prochaine clé de haut niveau
    onBlock.push(LINES[i]!.replace(/#.*$/, ""));
  }
  assert.match(
    onBlock.join("\n"),
    /\bpull_request\b/,
    "le workflow doit se déclencher sur pull_request (livraison par PR ; ADR-M003 D9 addendum)",
  );

  // (6) le cliquet de dette de test (lint:ratchet) est câblé DANS le job g4 (ADR-M003 D9 ter §3).
  //     Bloc-scopé sur la clé de job `g4-architecture:` (2 espaces d'indentation), commentaires de
  //     fin de ligne retirés : déplacer `lint:ratchet` hors de g4 (autre job) ou en commentaire rougit.
  const g4Idx = LINES.findIndex((l) => /^  g4-architecture\s*:/.test(l));
  assert.notEqual(g4Idx, -1, "job 'g4-architecture' absent du workflow");
  const g4Block: string[] = [];
  for (let i = g4Idx + 1; i < LINES.length; i++) {
    if (/^  \S/.test(LINES[i]!) || /^\S/.test(LINES[i]!)) break; // prochaine clé de job (2 espaces) ou clé racine (0)
    g4Block.push(LINES[i]!.replace(/#.*$/, ""));
  }
  assert.match(
    g4Block.join("\n"),
    /npm run lint:ratchet/,
    "le job g4 doit exécuter le cliquet `npm run lint:ratchet` (ADR-M003 D9 ter §3)",
  );
  // (7) lint ET cliquet, tous deux bloquants, chaînés par `&&` (ADR-M003 D9 quater, réserve 3 G2 :
  //     un `||` ou le retrait de `npm run lint` laissait (6) vert).
  assert.ok(
    g4Block.some((l) => /^\s*run:\s*npm run lint && npm run lint:ratchet\s*$/.test(l)),
    "le job g4 doit contenir littéralement `run: npm run lint && npm run lint:ratchet` (ADR-M003 D9 quater)",
  );
});

// Support Lot V (ADR-M003 D12) — le motif Hermes nu du scope monark est présent et discriminant.
// Non numéroté (D11 est une liste fermée) : verrou de régression pour que la reformulation
// clawpump-hermes ne dérive pas silencieusement. La preuve d'exécution end-to-end (grep du gate
// sur mutant/contre-mutant) est dans docs/G1-lot-V.md.
test("vocab_monark_scope_bans_naked_hermes — Hermes nu rougit, pyth-/clawpump- exemptés (ADR-M003 D12)", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "vocab-banned.json"), "utf8"));
  const monark = cfg.scan.monark;
  assert.ok(monark, "scope 'monark' absent de vocab-banned.json");
  assert.equal(monark.package, "monark");
  const entry = monark.banned.find((b: { re: string }) => /Hermes/.test(b.re));
  assert.ok(entry, "motif Hermes absent du scope monark");
  const re = new RegExp(entry.re, "i");
  assert.ok(re.test("the tokenised agent + Hermes harness wiring"), "Hermes nu doit rougir");
  assert.ok(re.test("UsePod/Hermes"), "Hermes nu (après slash) doit rougir");
  assert.ok(!re.test("the tokenised agent + clawpump-hermes harness wiring"), "clawpump-hermes doit rester vert");
  assert.ok(!re.test("pyth-hermes prices"), "pyth-hermes doit rester vert");
});
