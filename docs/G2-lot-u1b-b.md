# G2 — Revue lot U-1b-b : adaptateur `AttestedBook` + canonicaliseur unique + producteur + O-1/O-2/O-3

**Relecteur** : `claude-opus-4-8[1m]` — modèle résolu tel quel, préfixe `claude-opus-4-8` vérifié, effort max (R-1). Instance séparée, contexte frais (≠ générateur, P6).
**Objet** : gel `04d45d4` sur `lot/u-1b-b`. merge-base(`lot/etude-suite`,`lot/u-1b-b`) = `8c8eac8` (confirmé) ; `lot/etude-suite` HEAD courant = `ab0791a`. Rejeu isolé sous `F:\tmp\g2-u1bb\` (`git archive 04d45d4` | tar ; `npm ci --cache F:/tmp/npm-cache` exit 0 ; `TEMP=TMP=TMPDIR=F:/tmp`). Aucune écriture worktree/dépôt, aucun commit, aucun workflow (R-20). Chiffres re-mesurés, jamais repris du PLI. Node v24.15.0. Date 2026-09-19.

## VERDICT : APPROUVÉ-AVEC-CORRECTIONS (liste fermée = 2)
Zone gelée intacte (sha exacts), oracle vert 389/389, gates auxiliaires verts, C-1..C-7 substantiellement tenus, 8 mutants PLI tous rouges + restaurés byte-exact, fusion propre, tuyaux honnêtes. Deux corrections MINEURES — aucune ne touche la zone gelée ni la correction fonctionnelle (le code livré est correct) :
- **C-G2-1 (error_origin = worker)** — trou de couverture de test. Mutant adverse `names.size → providers.length` (`adapter-book.ts:156`, garde quorum-par-méthode C-4) **SURVIT** : aucun test ne distingue « fournisseurs distincts » de « longueur du tableau » (fixture = 4 entrées / 2 noms `drpc`,`mevblocker` ; `_quorum_required` n'emploie que `required:5 > 4`). Le garde SAIN est correct (sonde mémoire : `required:3` ⇒ `binding_broken` « exceeds the 2 distinct provider(s) » ; `required:2` accepté ; `required:5` rejeté). Correction : ajouter à `attested_book_quorum_required` un cas `quorum.required=3` ⇒ `binding_broken` (tue le mutant, verrouille la sémantique C-4).
- **C-G2-2 (error_origin = worker)** — incohérence interne PLI : §12 pt 5 écrit « R-25 = 589 » ; §7 et ma mesure donnent **587** (576 ins + 11 del). Aligner sur 587.

## Checklist G2 (100 %, revue 3 étapes AgileCoder)
| # | Point | Vérification indépendante | Verdict |
|---|---|---|---|
| 1a | Diff `8c8eac8..04d45d4` | 10 fichiers (name-status) : 4 nouveaux (adapter-book.ts, book-canonical.ts, adapter-book.test.ts, fixture), 5 modifiés (book.ts, index.ts, 2 tests contrats, ADR), + PLI. Cohérent PLI §1 | OK |
| 1b | Zone gelée | `git diff 8c8eac8 04d45d4 -- schemas/ packages/contracts/src/ test/contracts-frozen.*` = **vide** ; sha LF schema=`8ba71122…c32b`, manifest=`d50f5c51…9066` (= épinglés, exacts) | OK |
| 2 | C-1 canonique unique | `book.ts` : plus de `function canonicalStringify` (import `@monark/monark` l.12 + re-export l.22-23) ; corps déplacé **byte-fidèle** (sha `fd8d75c4…` identique 8c8eac8/04d45d4) ; `packages/monark/src` n'importe rien de `apps/*` (grep=0) ; `ukemi.test.ts` (porteur de `sentinel2_book_identical_to_pull`) **non modifié** → vert dans les 389 | OK |
| 3 | C-2 `canonicalAttestedBook` | Sonde mémoire : `1.5`→THROW, `2**53`→THROW `NonCanonicalNumberError` ; `-1`→`"-1"` (entier sûr, canonique ≠ plage — correct) ; `null`→`"null"` ; imbriqué/tableau/`MAX_SAFE_INTEGER` OK | OK |
| 4 | C-3 producteur+compo | `toAttestedBook` pur (lit `RecordedBook` structurellement, 0 import apps) ; `attested_book_composition` `recordBook→toAttestedBook→serialize→fromAttestedBook` digest=PIN `034fbff9…b921` vert ; fixture `attestor.key=deadbeef`, **`sig` absent** (grep + test `=== undefined`), digests/block assertés contre le PIN de `ukemi.test.ts` (pas la fixture) | OK |
| 5 | C-4/C-5 gardes | Table fermée par clé vérifiée sur pièce ; `BookAdapterErrorReason = Extract<CoverageReason,"binding_broken"\|"non_evaluable">` (enum contient les 2) ; O-1 `n_positions` `Number.isInteger ∧ ≥0` ; residual `.includes("no_third_party_verifier")` ; couplage abstain biconditionnel `(value===true)!==(reason!==null)` (2 sens, testés) | OK |
| 6 | Mutants | 8 PLI rouges + restaurés sha-exact (M2/M7/M8 gelés : LF = `git show 04d45d4`) ; +3 miens : MB=RED, MC=RED, **MA (`names.size→length`)=SURVIVANT** → C-G2-1 | À CORRIGER |
| 7 | Oracle | `npm run ci` exit 0 : **389/389 pass, 0 fail**, gate:vocab OK (167) ; lint 0 ; ratchet **69/69** ; lang:gate 0 ; export:check 0 ; grep `prediction\|yhat\|predictor_id\|confidence\|verified` dans `{adapter-book,book-canonical}.ts` = **0** | OK |
| 8 | R-25 / merge-tree | `lot/etude-suite...04d45d4` sous pathspec `STAT=` exacte = **587** (< dur 1205, gate PASSE ; > cible 400). Fixture `packages/monark/test/fixtures/**` **compte** (exclusions ne visent que `fixtures/`,`apps/sentinel`,`apps/bell`) — C-7 correct. `merge-tree` vs `ab0791a` : exit 0, aucun conflit | OK (cible 400 : §R-25) |
| 9 | CA-11 / tuyaux | `apps/site/lib/fleet.ts` inchangé ; README/`apps/site` non touchés → `AttestedBook` reste **upcoming** ; ADR D7 ligne 1 mise à jour **honnête** (producteur+consommateur livrés, chemin servi=U-6, nomme `_composition`) ; tuyau recorder→producteur→adaptateur | OK |
| 10 | Étapes 1-3 AgileCoder | (1) 0 impl. vide, imports résolus (tsc OK), docstrings présentes. (2) chaque livrable ↔ tâche G0+C-1..C-7, rien en trop. (3) cas limites éprouvés (mutants + sondes) | OK |
| 11 | Template (R-8/R-13/prov.) | `package.json`/`package-lock.json` **inchangés** (aucune dépendance nouvelle, lockfile intact, R-8) ; `TODO\|FIXME\|XXX\|HACK` sur les 5 fichiers de code = **0** (R-13) ; provenance en-tête PLI (modèle `claude-opus-4-8[1m]`, date, effort max, cadre) présente | OK |

## Mutants (rejeu indépendant ; runner propre `F:/tmp/mutrun.py`, restauration byte-exacte + sha LF vs `git show 04d45d4`)
*Un seul `npm run ci` complet, exécuté AVANT la campagne (contrainte séquentielle partagée avec `F:\Monark-wt-hatt` ; port `apps/harness/test/server.test.ts` non touché — pas de collision). Chaque mutant rejoue le seul fichier de test ciblé. Intégrité post-campagne prouvée par sha LF byte-exact, non par un second run.*
| ID | Cible (ligne) | Test nommé | Attendu | Obtenu | Restauré |
|---|---|---|---|---|---|
| M1 | adapter-book:137 couplage→false | `attested_book_abstain_coupling` | RED | RED | OK |
| M2 | forbidden-keys:57 `hit=null` [gelé] | `assertNoForbiddenKey THROWS…` | RED | RED | OK (LF=git) |
| M3 | book-canonical:60 sort retiré | `attested_book_canonical_deterministic` | RED | RED | OK |
| M4 | book-canonical:54 `isSafeInteger`→false | `attested_book_canonical_deterministic` | RED | RED | OK |
| M5 | adapter-book:156 `>names.size`→false | `attested_book_quorum_required` | RED | RED | OK |
| M6 | adapter-book:110 enum residual→false | `attested_book_residual_enum` | RED | RED | OK |
| M7 | closed-check:100 `return;` [gelé] | `…recursion covers eligible…(O-3)` | RED | RED | OK (LF=git) |
| M8 | schema:47 `uniqueItems` retiré [gelé] | `…oracle_sources_unique (S2)` | RED | RED | OK (LF=git) |
| **MA** | adapter-book:156 `names.size`→`providers.length` | `attested_book_quorum_required` | (adverse) | **GREEN — SURVIVANT** | OK |
| MB | adapter-book:99 skip `assertClosedAttestedBook` | `attested_book_rejects_prediction_keys` | RED | RED | OK |
| MC | adapter-book:248 `book_digest`←`holders_digest` | `attested_book_composition` | RED | RED | OK |

Score : **10/11 tués, 1 survivant (MA → C-G2-1)**. Note M2 (worker, vérifiée empiriquement) : pour `AttestedBook`, `assertClosedAttestedBook` **subsume** `assertNoForbiddenKey` (yhat/predictor_id/produced_at ne sont PAS interdites, seulement inconnues — forbidden-keys.json confirmé) → M2 cible à raison la FONCTION, non l'appel adaptateur : appel `assertNoForbiddenKey(parsed)` (ligne 100) → `void 0;` **mesuré GREEN** (8/8 verts) — redondant, conservé pour l'ordre littéral G0. MB prouve que l'appel `assertClosedAttestedBook`, lui, est porteur (RED mesuré).

## R-25 (§8, position tenue)
587 mesuré. **« Lot unique » NON contesté** : le repli C-7 est arithmétiquement inopérant — 587 − 42 (O-2/O-3 trackés) = 545 > 400 ; le cœur consommateur+producteur+canonique+fixture+tests ≈ 521 dépasse déjà 400 ; aucun découpage respectant C-3 (producteur exigé au checkpoint-1) ne passe sous 400. La cible 400 (corps G0) est **antérieure** à C-2/C-3/C-4 qui ont élargi le périmètre. **error_origin de la cible non ré-estimée = checkpoint-1** (item formé, non-dette). CI R-25 passe (587 < 1205).

## Écarts R-21 (PLI §12)
1. `ctx` élargi (`subject/chain/protocol/recorder_revision`) — **CONFORME** : requis d'un `AttestedBook` valide, absents de `RecordResult` (vérifié : `AttestedBookContext` les porte, `RecordedBook` non).
2. Garde `non_evaluable` (non-abstenu ∧ achieved<required) — **CONFORME** : fondée D4, testée (`_quorum_required` sous-quorum → `non_evaluable`, vert), emploi réel du reason C-5.
3. `attestedBookDigest` livré — **CONFORME** : nommé par G0 corps L-2, compagnon sha (domaine `attestor.sig`, K-1).
4. M2/M8 interprétés — **CONFORME** : subsomption vérifiée ; M8 = retrait de la contrainte liée (S2 rouge), motif `schema.test.ts` contains.
5. R-25=587 lot unique — **À ARBITRER (orchestrateur), non contesté** : voir §R-25 (typo 589 = C-G2-2).
6. Provenance en en-tête+PLI (non fichier frère) — **À ARBITRER (validateur, CA-11)** : `additionalProperties:false` interdit toute clé provenance dans le JSON ; le motif frère `PROVENANCE-*.md` existe (précédent `apps/sentinel/test/fixtures/ukemi/`) et **compterait** en R-25 (exclusion `.md` = `docs/**` seulement) ; choix défendable, décision PO.

## Observations (non bloquantes)
- `fromAttestedBook` étape (1) : branche `catch` JSON-invalide **non exercée** par un test (fail-closed `binding_broken` dans tous les cas ; un mutant « parse tolérant » survivrait mais reste fail-closed → non-défaut). Test optionnel.
- Test (iii) « JSON non-minifié » déclaré vacant par le worker (propriété de `JSON.parse`) — honnête.
- `serializeAttestedBook` = closed→forbidden→`JSON.stringify` ordre d'insertion → round-trip byte-exact structurellement garanti ; provenance/label hors contrat gelé (motif `adapter-narabi.ts`).

*Revue statique 100 % + rejeu non-LLM. Aucune dette ouverte : C-G2-1/C-G2-2 = corrections formées ; cible R-25 400 = item formé (error_origin checkpoint-1) ; R-21 pts 5/6 = arbitrages formés (orchestrateur/validateur).*
