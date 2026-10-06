# G0 du lot ANCHORS-DRIFT-1 : les 16 tueurs perdus du dépôt, ré-ancrés

- **Demande** : G2 de T0-FOLLOWUP-1, §3. `verifie-ancres.mjs` (recherches, `coordination/pieces/2026-10-04-fusion-sequence-CM-2/`) relève 16 tueurs PERDU à la base `b7d0cb84`, aucun dans un fichier d'un lot en cours.
- **Base** : `b7d0cb84`, branche `recherches/anchors-drift-1`, worktree `monark-governance-anchors`. Auteur : RECHERCHES.
- **Zone** : les lignes `// killer:` de cinq fichiers de test, et rien d'autre. Aucun corps de test ni aucun code de production n'est touché.

red-proof: test-only

## Construction

- **14 dérives de ligne** : chaque tueur vise la ligne où se trouve aujourd'hui son texte, mesuré par l'outil d'ancres et la table de la G2.
  - `packages/hikae/src/l1-split.ts` : +2 ;
  - `.github/workflows/ci.yml` : +1, +8 ou +1, selon le bloc.
- **2 tueurs morts réécrits** (`test/oracle-run.test.ts:129` et `:182`) : leur texte n'existe plus dans `scripts/oracle/run.mjs`. Ils visent désormais les lignes actuelles, toujours en forme fermée :
  - `:46` COR : la boucle ne retire plus les noms d'identifiants (`DENY.test(k) || ` ôté). Un SDL de toute la ligne survit : `childEnv` filtre aussi `DENY` pour les portes, et l'effacement de la ligne entière ne laisse pas de nom visible au test ;
  - `:83` SDL : le saut d'un enregistrement rouge de même clé.
- **But** : `verifie-ancres.mjs` sur tout le dépôt, 0 PERDU.

## Tueurs du lot (chacun tiré à la main, fichier restauré, sha256 contrôlé)

- `packages/hikae/src/l1-split.ts:39 CONST "(n + 1)" -> "(n + 0)"`
- `packages/hikae/src/l1-split.ts:40 ROR "p > n" -> "p >= n"`
- `packages/hikae/src/l1-split.ts:43 SDL "q === undefined" -> ""`
- `packages/hikae/src/l1-split.ts:41 CONST "a - b" -> "b - a"`
- `packages/hikae/src/l1-split.ts:39 CONST "(1 - alpha)" -> "(1.01 - alpha)"`
- `packages/hikae/src/l1-split.ts:42 CONST "p - 1" -> "p - 2"`
- `.github/workflows/ci.yml:115 CONST " || R25I=\"written $CHANGED $CONTENT_CHANGED\"" -> ""`
- `.github/workflows/ci.yml:115 CONST "origin/$GITHUB_BASE_REF" -> "origin/${{ github.base_ref }}"`
- `.github/workflows/ci.yml:122 CONST "|??????????*" -> ""`
- `.github/workflows/ci.yml:98 CONST "eval \"$R25_PIN\"" -> "true"`
- `.github/workflows/ci.yml:211 CONST "npm run test:export" -> "npm run test:main"`
- `.github/workflows/ci.yml:273 CONST "run: npm run build" -> "run: MONARK_DOJO_LOCAL_BUILD_ROOT=/tmp npm run build"`
- `scripts/oracle/run.mjs:46 COR "DENY.test(k) || " -> ""`
- `scripts/oracle/run.mjs:83 SDL "if (r.exit !== 0) { console.error(`oracle: same-key record ${f} is red (exit ${r.exit})" -> ""`
- `.github/workflows/ci.yml:125 CONST "[ \"$NEW_CHANGED\" -le \"$CHANGED\" ] && " -> ""`
- `.github/workflows/ci.yml:125 CONST " && [ \"$NEW_CONTENT\" -le \"$CONTENT_CHANGED\" ]" -> ""`
