# G0 du lot CM-3c-3c (contrat 1.1.0, bloc C, second et dernier lot de la PR C2b) : surfaces, épingles, instantanés

- **Plan** : `docs/G0-bloc-c-cm-3c-2.md` (section 3.4, P-4 à P-11, section 14) ; `docs/G7-lot-cm-3c-3b2.md` (37 rouges par nom, jobs de CI rouges) ; `docs/G7-lot-cm-3c-3b1.md` (« Jobs de CI rouges » : exigence de `g3-site`) ; `docs/G7-lot-cm-3c-3a.md` (m-7 : test 42 après la ligne D7) ; `docs/G7-lot-ukemi-pending-snapshot-1.md` (« Pour C2 et T0 », N-1 à N-3, rejeu de `scanText`) ; `docs/G0-lot-served-pending-1.md` et son G7 (Q-SP1-2, Q-SP1-6, Q-SP1-7). Messages de MONARK : `C2-integration`, `Q-3b1-3`, `3c-3b1`, `3c-3a-gel`, `D7-duodecies` (2026-10-05).
- **Branche** : `recherches/cm-3c-3c`, partie de `origin/recherches/cm-3c-3b2` (`662618d5`) ; `base/c2-integration` (`689daea1`, #150 fusionnée) fusionnée par `c9a9704e` (arbre inchangé). **Base de mesure du lot : `662618d5`** ; de C2b : `ab732540`. Aucune PR.
- **Statut** : G0 court, écrit avant le code. Auteur : RECHERCHES.

## 1. Ce que le lot écrit

1. **Neuf décisions racine en 1.1.0** : `scripts/gen-gate-decision-fixtures.mjs` écrit des verdicts 1.1.0 (`region: null` sans région, `qhat_unit` `score`, `scale` nul, `scores_sha256`, champs de case nuls : aucune table servie pour ces états synthétiques) et des décisions avec `request_sha256` (empreinte de l'enveloppe `{prediction, params}` déclarée) ; fichiers et `fixtures/manifest.json` régénérés par le générateur (hors R-25). Débloque `atelier` (5) et `fixtures-root`.
2. **Surfaces** : `scripts/verify-harness.mjs` (`CA_SCHEMA_VERSION` 1.1.0 avec `gate.ts:62` ; contrôle liq sur `scores_sha256` de s0, épingle `UKEMI_LIQ_SCORES_SHA256_PINNED` ; boucle BYO `scores_sha256` = `scores_sha256`) ; `scripts/sync-ukemi-served.mjs` (`verdictFactsOf` lit `scores_sha256` ; N-1) ; `scripts/sync-harness-served.d.mts` (trois déclarations, Q-SP1-7) ; `scripts/assert-fleet-html.mjs:486` si la mesure le demande ; `apps/site/lib/harness-served-load.ts` (`ByoLoop` : égalité de `scores_sha256`, `alpha`, `qhat` entre `calibrate` et le verdict) ; `apps/site/components/sas/sas-audit.ts` (indices du `required[]` 1.1.0).
3. **Traces réenregistrées** (BYO et H5, par leurs générateurs de test, hors R-25) ; leurs épingles dans `byo-demo-probe`, `h5-e2e-probe` et `PINNED` de `harness-served.test.ts`.
4. **Instantanés en attente** : `node scripts/sync-harness-served.mjs --pending` (écrit `harness-pending.json`, pose `pending_since`) puis, après la bascule du registre et le renommage B-17, `node scripts/sync-ukemi-served.mjs --pending` (N-2) ; manifeste du site ; rejeu de `scanText` sur `ukemi-pending.json` (m-5). Les fichiers servis (`harness-served.json`, `ukemi-served.json`, CA) restent 1.0.0 jusqu'à T0, hors la ligne `pending_since`.
5. **`g3-site`** : les pages lisent le servi sous son schéma de site (inchangé) ; les deux chargeurs de traces lisent l'instantané en attente, et la trace 1.1.0 se valide contre les schémas gelés 1.1.0. `npm run build -w @monark/site` vert à la tête.
6. **Lecteurs du format sur le site** : comptes de `frozen_contract_fields_stay_dynamic` (12 → 17, 8 → 9, 5 inchangé ; Q-M14 : entrées mesurées et proposées au G7) ; les cinq raisons neuves reçoivent une glose (`how-copy.ts`, `docs-gate.ts`) et une chambre (`sas-audit`), sans quoi le site rend une carte vide ; comptes 13 → 18 dans les tests.
7. **Q-F2** : le message du refus 1.0.0 nomme la version parlée et le dépôt de la spécification. La ligne datée de MONARK qui fixe le texte exact n'est **pas** sur la base (seule la ligne (7), le go) : **précondition de fusion** de C2b.
8. **Épingle d'octets 1.1.0** : depuis 3c-3b2, le rejeu et la bande USDe sont tenus par une projection indépendante de la version ; aucune empreinte d'octets des corps 1.1.0 ne reste hors de `openapi_sha256`. Le lot épingle les sha256 des corps du CA rejoué sur le harnais en processus (ceux que l'instantané en attente annonce), à côté de l'instantané.
9. **Tests** : conversions des 36 rouges racine (la liste du G7 de 3c-3b2) ; `test/narabi-live.test.ts:540-547` repointé sur l'outil de provenance (Q-M6) ; m-7 : test 42 et `export:check` verts après la ligne D7 duodecies (`0542cfca`, sur la base).

Coupes déjà décidées : corps 400 avec `code` et test des 63 caractères (C') ; composition Z-3 et liste de l'écart liq (C') ; README du harnais et `fixtures/PROVENANCE-*.md` (T0) ; texte « Eight frozen contracts » du site (liste de T0, MONARK).

## 2. Cible

Tête de C2b verte en entier : les 37 rouges verts, aucun rouge neuf ; `tsc` 0 ; `lint:ratchet` 69/69 ; `g3-site` (`npm run build -w @monark/site`) vert ; test 42 et `export:check` verts ; `gate:vocab` et `lang:gate` verts.

## 3. R-25 (estimation, `r25()`)

| Poste | Lignes |
|---|---|
| Instantanés versés (`harness-pending.json` ~145, `ukemi-pending.json` ~25, `pending_since` 2, manifeste ~4) | ~176 |
| Sources (générateur, CA, synchros, chargeur, `sas-audit`, gloses, pages lues par `ByoLoop`, Q-F2) | ~80 |
| Tests (conversions, épingles, Q-F2, épingle d'octets) | ~200 |
| **Lot contre `662618d5`** | **~455 ≤ 547** |

- **C2b** (425 + ~455) : **~880 ≤ 1 205**.
- **Intégration** (C2a + C2b contre `418a421f`) : ~1 900, au-dessus de la borne de repli 1 400 ; R25-INTEGRATION-RULE-1 passe d'abord (décision de cellule) ; aucun test n'est coupé ici, le total est rapporté au G7.
- Si la mesure dépasse 547 (lot) ou 1 205 (C2b), le lot s'arrête au G7 avec la coupe proposée.

## 4. Preuve

Tests rouges d'abord (tueurs `// killer: fichier:ligne OP "avant" -> "après"`), puis gel ; red-proof `--base 662618d5 --draw n --seed 37` ; ancres `--touched 662618d5 HEAD` ; `npm test` complet (0 échec attendu), `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`, `export:check`, build du site.
