# RAPPORT — Lot U-1b-a-bis (V-6 voie (b) : `residual` porte `no_third_party_verifier` imposé par le schéma)

## Provenance
- **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme ; roster mainteneur 2026-08-14, Opus 5 banni). Effort `max`. Worker ; ni commit ni `git` d'écriture (R-20).
- **Date** : 2026-09-19. **Décision** : investisseur 26/33 (2026-09-19) — checkpoint-2 lot U-1b-a V-6, recommandation validateur+orchestrateur (b).
- **Contexte** : worktree `F:\Monark-wt-u1b`, branche `lot/u-1b-a`, **HEAD `4a15e5b`**, code gelé candidat **`b64ca1b`**. Scratch `F:\tmp\u1b-bis\`, `TEMP/TMP=F:/tmp`. Node v24.15.0.
- **Réviseur** : orchestrateur `claude-fable-5-1` (vérification adversariale R-21, verdict G7). Ce rapport est une donnée brute, écrite pour être re-jouée.

## Liste fermée — statut
| # | Item | Statut |
|---|---|---|
| 1 | Schéma : `residual.contains = {"const":"no_third_party_verifier"}` | **FAIT** (1 ligne ajoutée, minItems/uniqueItems/items inchangés) |
| 2 | Re-baseline manifest (sha LF) ; pas de bump `schema_version` (Option A) | **FAIT** (aucune clé nouvelle ; `ALLOWED_KEYS`/census inchangés — vérifié) |
| 3 | Tests (a) valide, (b) rejet ajv, (c) abstention+`description:""` verts, (d) mutant | **FAIT** |
| 4 | ADR-U1b : ligne datée D2ter + objet de signature nouveau sha, ancien caduc | **FAIT** |
| 5 | Oracle : ci>=336, lint, ratchet 69/69, lang-gate, export:check, R-25 | **FAIT, tous verts** |

## Objet exact de la signature investisseur (V-6 b)
| Artefact | Ancien sha LF (CADUC, pré-V-6) | Nouveau sha LF (à signer) |
|---|---|---|
| `schemas/attested-book.schema.json` | `d5b1beeab23482322da59041b9e62874a74c4cd53f55d7b730a7c150975da3cd` | **`8ba71122539f3bd928081fe06b7823c06a8265382290040f142a5eea7205c32b`** |
| `test/contracts-frozen.manifest.json` | `4d912d4160e0fa1eb137c54a58b24ab1f7dad61d9ef336ac55bf01c1d974f245` | **`d50f5c51921dc89dce8bd7996e96ded056a973d34b29e7926fd5a7de33d99066`** |

Méthode sha (identique à `test/contracts-frozen.test.ts:40-44`, re-jouable) : lire les octets, `replace(/\r\n/g,"\n")` (LF), `sha256(utf8)`. Les deux fichiers sont en **LF pur** sur disque (hasCRLF=false). L'ancien sha schéma `d5b1bee...` a été re-vérifié concordant avec le manifest AVANT modification (baseline honnête).

## 1 — Diff du schéma (1 ligne + virgule)
`git diff schemas/attested-book.schema.json` :
```
@@ -123,6 +123,7 @@
       "type": "array",
       "minItems": 1,
       "uniqueItems": true,
+      "contains": { "const": "no_third_party_verifier" },
       "items": {
         "type": "string",
         "enum": [
```
`git diff --stat` = `1 file changed, 1 insertion(+)`. Une seule ligne ajoutée (finissant par une virgule), insérée entre `"uniqueItems": true,` et `"items": {` ; `minItems`/`uniqueItems`/`items` **byte-identiques**. Octets 5812 -> 5870 (+58). JSON valide ; 8 clés racine, 17 `required`, `additionalProperties:false`, description D3 **871 caractères** intacte, `residual.items.enum` **6** valeurs inchangées, `residual.contains = {"const":"no_third_party_verifier"}`.

Placement (b) choisi contre le placement après `items` : retirer la ligne redonne EXACTEMENT les octets pré-V-6 (`d5b1bee...`), donc le mutant est un revert byte-exact (JSON toujours valide, ajv compile) — un placement après `items` laisserait un `},` orphelin et casserait tout le fichier.

## 2 — Re-baseline manifest
`git diff test/contracts-frozen.manifest.json` : une seule ligne changée (valeur 64-hex de `schemas/attested-book.schema.json` : `d5b1bee...` -> `8ba71122...`). 15 clés (aucune ajoutée/retirée). Octets 1615 -> 1615, LF. **`schema_version` NON bumpée** (Option A, M001 Déc. 9 : contrat pas encore gelé/publié).

Autres pins vérifiés : `packages/contracts/src/closed-check.ts` `ALLOWED_KEYS.attestedBook` (+ sous-objets) est une liste de **clés de données** (property names), pas de sha ni de mot-clé de schéma — `contains` est un mot-clé JSON-Schema, **aucune clé de données nouvelle** => `ALLOWED_KEYS`, census de clés et zone gelée `packages/contracts/src/**` **inchangés**. Le manifest est le seul pin sha VIVANT du schéma.

## 3 — Tests
Nouveau test (ajv-exécuté), `packages/contracts/test/schema.test.ts`, +18 lignes :
`attested_book_residual_always_names_no_third_party_verifier`
- (a) `residual: ["no_third_party_verifier"]` et `["no_third_party_verifier","oracle_price_as_read"]` => **acceptés**.
- (b) `residual: ["oracle_price_as_read"]` (dans l'enum, unique, non vide) => **rejeté** ; assertion supplémentaire `vab.errors.some(e => e.keyword === "contains")` = le refus vient bien du mot-clé `contains` (enum/minItems/uniqueItems passent tous ici). `["oracle_price_as_read","rpc_quorum_2_keyless"]` (multi-éléments) => rejeté aussi.
- (c) inchangés et verts : `attested_book_abstain_coupling` (abstention D4, les deux formes couplées valides, les deux découplées rejetées) et `attested_book_description_may_be_empty` (`""` accepté). Le fixture `validAttestedBook().residual = ["no_third_party_verifier","rpc_quorum_2_keyless"]` porte déjà `no_third_party_verifier`, donc tous les tests valides restent verts.

Gardes non affectées (vérifié par lecture) : `contracts.test.ts` walker `assertClosedNode` recurse dans `properties`/`oneOf`/`items` uniquement (jamais `contains`) et le nœud `residual` est `type:"array"` (pas `"object"`) => aucune assertion `additionalProperties` ; sync des propriétés lit `residual.items.enum` (insensible à `contains`) ; `enums.test.ts` lit `residual.items.enum`.

`npm run ci` (= gate:vocab + tsc + node --test) — extrait des lignes clés (non verbatim ; tsc n'imprime rien en succès) :
```
gate:vocab OK — scanned 156 file(s), no forbidden claim.
tsc --noEmit  (aucune sortie = 0 erreur)
ok attested_book_residual_always_names_no_third_party_verifier
ok attested_book_abstain_coupling
ok attested_book_description_may_be_empty
ok contracts_frozen — ... match the current frozen manifest ...
ok contracts_frozen — the manifest is not empty and covers the 7 schemas
tests 337   pass 337   fail 0
```
337 = 336 (baseline) + 1 nouveau test. Baseline pré-édition re-jouée = 336/336.

## 3(d) — Mutant (preuve que le test ET le gel ont des dents)
Commandes re-jouables : `node --test packages/contracts/test/schema.test.ts` et `node --test test/contracts-frozen.test.ts` (manifest conservant `8ba71122...`). Ligne `contains` retirée (manifest inchangé, conserve le nouveau sha) :
- schéma LF-sha = `d5b1beeab23482322da59041b9e62874a74c4cd53f55d7b730a7c150975da3cd` — **revert byte-exact au pré-V-6** (vérifié `== d5b1bee : true`).
- `attested_book_residual_always_names_no_third_party_verifier` FAIL ROUGE : `AssertionError: residual omitting no_third_party_verifier must be refused`.
- `contracts_frozen` FAIL ROUGE : `AssertionError: content modified in the frozen zone: schemas/attested-book.schema.json (ADR required)`.
Restauration : schéma LF-sha = `8ba71122539f3bd928081fe06b7823c06a8265382290040f142a5eea7205c32b` (== nouveau gel), LF, JSON valide, `git diff --stat` de nouveau `1 insertion(+)` ; `npm run ci` re-vert 337/337.

## 4 — ADR-U1b
`docs/adr/ADR-U1b-contrat-attestedbook.md` (2 lignes modifiées, contenu) :
- **D2 bis / V-6** : « tranché à la signature » -> **« tranché 2026-09-19 (décision investisseur 26/33, voie (b)) : `residual` porte `contains const` — désormais imposé par le schéma ... »** + **nouvel objet de signature** (les deux nouveaux sha) + mention explicite que `d5b1bee...` (schéma) et `4d912d41...` (manifest) sont **caducs**.
- **D2ter** : ligne datée **« Amendement D2ter — 2026-09-19 (lot U-1b-a-bis, décision investisseur 26/33, V-6 voie (b)) »** : invariant imposé par le schéma via `contains const`, re-baseline byte-exact sans bump `schema_version` (Option A), oracle (sonde + mutant) nommé, `error_origin` = rédacteur ADR-U1b.

Note : l'ADR-U1b **ne contenait pas** `d5b1bee...` (la mention « signature due sur `d5b1bee...` » vit dans `F:\Monark\docs\CHECKPOINT2-lot-u1b-a.md:20-21`, hors worktree — voir item formé I-3) ; le « remplacement » demandé est donc réalisé par l'inscription de l'objet de signature nouveau + la déclaration de caducité de l'ancien.

## 5 — Oracle (toutes sorties vertes)
| Gate | Commande | Résultat |
|---|---|---|
| ci | `npm run ci` | 337/337, 0 fail ; gate:vocab 156 ; tsc 0 |
| lint | `npm run lint` (eslint .) | exit 0, aucune erreur |
| ratchet | `npm run lint:ratchet` | **69/69** (plafond 2026-09-16), exit 0 |
| lang-gate | `node scripts/lang-gate.mjs --scope root,contracts,schemas,site` | **0** hit non-exempt, exit 0 |
| export:check | `npm run export:check` | OK — 0 chemin interdit, 0 hit français hors exemption |
| R-25 | voir ci-dessous | <= 1205, large marge |

**R-25** (base `lot/etude-suite`, merge-base `0e2ff1e` ; pathspec `ci.yml:52` = ADR-M003 D9/quater/sexies) :
- Committé à `b64ca1b` : **589** (re-mesuré `git diff --shortstat lot/etude-suite...b64ca1b`, concorde au checkpoint-2). Committé à HEAD `4a15e5b` (three-dot `lot/etude-suite...HEAD`) : **594** = 589 + **5** (re-mesuré `b64ca1b..4a15e5b` = 1 fichier, 4 ins, 1 del : le commit doc checkpoint-2 ADR-U1b).
- **Projeté si mes changements committés** (merge-base -> arbre de travail, suivis, ci.yml de CE worktree) : **615**.
- Code seul (schéma+manifest+test, HEAD->arbre) : 20 insertions, 1 suppression.
- Ce worktree (`4a15e5b`) **n'a pas** l'exclusion D9 septies (`docs/**/*.md` hors R-25) présente sur `lot/etude-suite` (log `e08a7fc`/`3f2f19c`). Avec D9 septies : **604** (docs exclus). Écart signalé, aucun impact (< 1205 dans les deux cas).
- `docs/RAPPORT-lot-u1b-a-bis.md` (ce fichier) est **non suivi** : absent du `git diff` (donc de 615) et **je ne peux pas `git add` (R-20)**. Sous le ci.yml de ce worktree il compterait s'il était committé (docs/RAPPORT-* non exclu) : `wc -l` = 106 lignes => scénario A total = **721** (615 + 106, marge 484 sous 1205). Sous `lot/etude-suite` (D9 septies) il est exclu (604). Gouvernance par lot, moralement exclu comme les rapports G1/G2. Tous les scénarios <= 1205.

## Items formés (zéro dette — hors liste fermée, avec déclencheur)
- **I-1** — `docs/G1-lot-u1b-a.md` porte l'ancien sha `d5b1bee...` (l. 14, 115, 116, 118, 143) et l'ancien manifest `4d912d41...` (l. 27). C'est le **record daté du G1 d'origine** du lot U-1b-a (état à `b64ca1b`), **hors liste fermée** et **exclu de R-25** (`:(exclude)docs/G1-lot-*.md`). Non modifié (record historique, pas un pin vivant). **Déclencheur** : G2 fraîche sur le delta — l'orchestrateur décide s'il annote « sha superseded by U-1b-a-bis ».
- **I-2** — `test/contracts-frozen.test.ts` (en-tête l. 9-15, titre l. 59) énumère les re-baselines (D9-bis, M008 D9, U1b D1) **sans** U-1b-a-bis : incomplet, pas faux. Ce fichier n'est **pas** dans le manifest gelé (zone gelée = `schemas/` + `packages/contracts/src/**`, pas `test/`). Hors liste fermée. **Déclencheur** : même G2 fraîche — décider d'ajouter la mention U-1b-a-bis.
- **I-3** — `F:\Monark\docs\CHECKPOINT2-lot-u1b-a.md:20-21` (« Signature investisseur due — objet exact ») cite encore les anciens sha `d5b1bee...`/`4d912d41...`. Fichier dans le **dépôt principal** (hors worktree), artefact validateur persisté par l'orchestrateur (R-20) : **non modifié**. Le nouvel objet de signature (schéma `8ba71122...`, manifest `d50f5c51...`) est fourni ci-dessus ; l'orchestrateur met à jour le checkpoint au G2/checkpoint sur le delta.

## Reste
**Vide.** Aucune dette : les trois points hors liste fermée sont des items formés avec déclencheur (ci-dessus) ; aucun chiffre de seconde main ; toute affirmation est re-jouable (commandes et sha ci-dessus). Aucun commit, aucun workflow déclenché (R-20).
