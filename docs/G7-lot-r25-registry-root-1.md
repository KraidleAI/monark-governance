# G7 du lot R25-REGISTRY-ROOT-1 (PR 1) : D9 septdecies, la racine des registres de vague hors du compte R-25

- **Base** : `a43b0126`. **PR** : #206, branche `monark/r25-registry-root-1`, tête `81f2c674`. **Fusion au tronc** : `4a6e1a1a`.
- **Décision** : fondateur, 2026-10-06 vers 18:07 UTC, choix verbatim « Règle générale (Recommandé) ». **G0** :
  `docs/G0-lot-r25-registry-root-1.md`. **Runtime** : Node 24.21.0 (win32).

## G2 (RECHERCHES)

- Première G2 sur `433dca5f` (`81bc039`), deux corrections demandées :
  - **B-1** (moyenne) : `statSync` suivait les liens symboliques ; un registre lié aurait échappé à la racine fermée et au compte, git
    comptant le lien et non sa cible. Pliée : entrées lues par `lstat`, refus (a) d'une racine liée et de toute entrée liée, deux tests.
  - **B-2** : la branche « pas UTF-8 » de (c) n'était pas testée (deux mutants survivaient). Pliée : un cas d'octets bruts `7b ff 7d`.
- Contrôle du diff `433dca5f..81f2c674` et accord (`467ef21`).

## Mesures

- **Rouge à la base** : avec le `ci.yml` de la base, 3 tests rouges par assertion (`series_pinned_are_declared_and_hashed`, test 38
  (4quater), le test racine). red-proof sur `81f2c674` : 4 tests jugés (module neuf), 4 tueurs tirés et tués.
- **Mutants à la main** : 11, tous tués (G0, table).
- **Rejeu Windows** de `test/ci-gates.test.ts` sur la fusion : 44 tests, 44 verts.
- **Oracles** : G1 sur `433dca5f` (`e81095e2…`) et sur `81f2c674` (`6bbaf976…`), sortie 0 ; G7 sur la fusion `4a6e1a1a` : sortie 0
  (record `34564403…`).
- **CI** : 10/10 sur `81f2c674`.
- **Export** : `apps/harness/data/` n'est pas exporté au miroir public.

## `error_origin`

- **Générateur (MONARK)** : B-1 et B-2, pliées. La première construction mettait les refus dans le fichier de test, que red-proof ne peut
  pas juger. Ils ont été déplacés dans `scripts/registry-root.mjs` avant la PR.

## Suite

- **PR 2** (item à ETAT) : copie à l'octet de `wave1.json` et de sa déclaration ; l'ancre (g) devient inconditionnelle.
