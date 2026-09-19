# G0 — Sprint backlog lot U-1b-b : adaptateur `AttestedBook` + canonicaliseur + O-2/O-3 (ADR-U1b D5/D6/D7)
Orchestrateur `claude-fable-5-1`, 2026-09-19. Base : `lot/etude-suite` `fe43731` (U-1b-a fusionné, contrat gelé signé `8ba71122…`/`d50f5c51…`). Branche `lot/u-1b-b`, worktree `F:\Monark-wt-u1bb`. Cadre : ADR-U1b D5 (adaptateur), D6 (tests de gel, deux livrables U-1b-b), D7 (tuyaux), découpe R-25 §Découpe (≈ 250 l.), liste release CHANTIERS (O-2, O-3 → U-1b-b, propriétaire orchestrateur).

## Objectif (une phrase)
Rendre consommable le 6ᵉ contrat gelé par un adaptateur **pur, fail-closed**, dont l'oracle est le round-trip byte-exact, avec **un seul** canonicaliseur partagé avec le recorder (même digest que `sentinel2_book_identical_to_pull`), sans `Prediction`, sans toucher un octet de la zone gelée.

## Livrables (liste fermée)
| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| L-1 | `packages/monark/src/adapter-book.ts` (K-8 : hors `src/tools/`) | `fromAttestedBook(json: string): BookOutput \| BookError` — pur, sans I/O ; ordre : parse JSON → `assertClosedAttestedBook` (contrats) → `assertNoForbiddenKey` → gardes de valeur : `residual` ⊂ enum runtime, chaînes décimales (`^-?[0-9]+$` / pattern du schéma), couplage `abstain.value ⇔ abstain.reason ≠ null` (C-1), `quorum` par méthode (`required ≤ distinct providers`, `providers[].name` non vide), `observed_at.clock` ASCII (D2 bis) → rend `{ book, provenance, label }` ; `provenance`/`label` **hors** contrat (motif `adapter-narabi.ts:103-108`) ; erreurs = enum nommé `BookAdapterErrorReason`, jamais un objet partiel | `attested_book_roundtrip` : `serialize(fromAttestedBook(serialize(book)).book) === serialize(book)` byte-exact ; **chaque** champ altéré (17 clés racine + sous-objets) ⇒ rejet nommé |
| L-2 | `packages/monark/src/book-canonical.ts` | `canonicalAttestedBook(book) : string` + `attestedBookDigest(book) : sha256 hex` — **réutilise** `canonicalStringify` de `apps/sentinel/src/ukemi/book.ts` (ou l'extrait dans `packages/contracts/src/serialize.ts` si l'import inter-packages est interdit par la frontière K-8 — décision au G1, motivée) : pas de seconde définition de « canonique » | `attested_book_canonical_deterministic` : (i) ordre des clés permuté ⇒ même digest ; (ii) flottant / `1.0` / exposant ⇒ rejet (chaînes décimales seules) ; (iii) JSON non minifié / espaces ⇒ même digest ; (iv) **fixture recorder WETH** (`apps/sentinel/test/fixtures`, PIN `book_digest 034fbff9…b921`) canonicalisée par L-2 ⇒ **digest = PIN** (C-7, une seule canonique) |
| L-3 | `packages/monark/test/adapter-book.test.ts` + fixture `packages/monark/test/fixtures/attested-book-weth.json` (construite depuis le book recorder WETH + `attestor`/`observed_at`/`quorum`/`providers`/`residual` conformes, `attestor.key` = placeholder K-1 `deadbeef` déclaré) | tests L-1/L-2 + `attested_book_abstain_coupling` (les deux sens) + `attested_book_rejects_prediction_keys` (clé `yhat`/`predictor_id`/`<événement>` ⇒ rejet, C-2) + `attested_book_residual_enum` | mutants : M1 garde `abstain` retirée ; M2 `assertNoForbiddenKey` court-circuité ; M3 canonicaliseur trie sans `localeCompare` neutre (ordre locale) ; M4 flottant accepté ; M5 `quorum.required` non comparé ; M6 `residual` non vérifié ⇒ chacun rouge sur le test nommé |
| L-4 (O-3) | `packages/contracts/test/closed-check.test.ts` | étendre la sonde `sneak` aux niveaux **eligible, providers[0], quorum, attestor, observed_at** (aujourd'hui 4/8 exercés) | mutant : récursion coupée à un niveau ⇒ rouge |
| L-5 (O-2) | `packages/contracts/test/schema.test.ts` (ou fichier voisin) | sondes ajv **sémantiques** sur instances : S1 `subject` hors motif (groupe vide), S2 `oracle_sources` doublon, S3 `providers` vide, S6 clé `required` manquante ⇒ `valid === false` avec le chemin d'erreur attendu | mutant : sonde retirée ⇒ ce test seul rougit ; **aucun octet** dans `schemas/` ni `packages/contracts/src/` (tests seuls) |

## Critères d'acceptation (falsifiables)
1. **Zone gelée intacte** : sha256 LF de `schemas/attested-book.schema.json` = `8ba71122…`, `test/contracts-frozen.manifest.json` = `d50f5c51…`, `packages/contracts/src/**` blobs identiques à `fe43731` ; `contracts_frozen` vert.
2. `attested_book_roundtrip` et `attested_book_canonical_deterministic` verts ; (iv) digest fixture = PIN `034fbff9…b921` **sans** modifier `book.ts`.
3. Aucune `Prediction`, aucun `yhat`, aucun `<événement>`, aucun `predictor_id` dans `packages/monark/src/{adapter-book,book-canonical}.ts` (grep = 0) ; test `_rejects_prediction_keys` vert.
4. Mutants M1-M6 + O-3 + O-2 rouges, restauration sha-exacte prouvée ; sondes ajv 4/4.
5. Oracle : `npm run ci` = 376 + N verts (N ≥ 9), lint 0, ratchet 69/69, lang-gate 0 (code/tests en anglais), export:check 0.
6. R-25 `lot/etude-suite...lot/u-1b-b` sous la ligne `STAT=` de `ci.yml` ≤ 400 (cible ≈ 250 ; seuil dur 1 205).
7. CA-11 : `fleet.ts` blob identique ; `AttestedBook` reste **upcoming** (chemin servi = U-6) ; tuyaux D7 mis à jour dans l'ADR (recorder → AttestedBook : test `_roundtrip` + `_canonical_deterministic` **livrés**, état « fichiers non servis ») ; aucun README/site modifié.
8. Aucune écriture hors du worktree et de `F:\tmp\u1b-b\` ; worker ne committe pas ; PLI avec sha des fichiers livrés, « Reste » honnête.

## Hors périmètre (formés ailleurs)
U-4 (`Prediction`, gate, union M017 + motif de liaison, ratification investisseur) ; U-6 (chemin servi `/ukemi/*`, Caddy) ; K-1 clé recorder réelle (VPS, décision 22) ; O-5 regex PROBATIVE (clos « non-défaut »).

## Tuyaux (ADR-M018 D3)
Entrée : book recorder U-1a (`recordBook`, quorum-2) + enveloppe attestor/observed_at/quorum/providers/residual → Sortie : `AttestedBook` fermé sérialisé → consommateur : **aucun chemin servi** (U-6) ; consommateur test : `_roundtrip`, `_canonical_deterministic`. État public : `upcoming`.

## Risques (MAST)
Seconde définition de « canonique » (contre-mesure : (iv) digest = PIN) ; adaptateur qui « répare » une entrée (contre-mesure : fail-closed, erreurs nommées, round-trip byte-exact) ; fuite de `Prediction` par anticipation d'U-4 (contre-mesure : critère 3) ; octet dans la zone gelée (critère 1).

## Rôles
Worker Opus 4.8 max (G1) → G2 fraîche Opus 4.8 (instance séparée) → checkpoint-2 validateur → G7 orchestrateur → fusion. Checkpoint-1 (ce backlog) : validateur, avant tout code.
