# G0 du lot ANCHORS-DRIFT-1 : les tueurs perdus du dépôt, ré-ancrés

- **Demande** : G2 de T0-FOLLOWUP-1, §3. `verifie-ancres.mjs` (recherches, `coordination/pieces/2026-10-04-fusion-sequence-CM-2/`) relève 16 tueurs PERDU à `b7d0cb84`, aucun dans un fichier d'un lot en cours.
- **Base** : `origin/lot/etude-suite` `febf7735` (fusionnée dans la branche), branche `recherches/anchors-drift-1`, worktree `monark-governance-anchors`. Auteur : RECHERCHES.
- **Zone** : les lignes `// killer:` de deux fichiers de test, et un test neuf dans `test/oracle-run.test.ts`. Aucun code de production n'est touché.

red-proof: test-only

## Construction

- **Le tronc a bougé** : l'acte 9 de T0 (`febf7735`) retire de `ci.yml` les 8 lignes de la dérogation de la PR 198. Les 8 tueurs de `ci.yml` (`ci-gates.test.ts:345`, `:346`, `:347`, `:375`, `:1774`, `dojo-render.test.ts:341`, `r25-integration.test.ts:646`, `:655`) retrouvent leurs lignes d'origine : ils sont ANCRE sur le tronc, et le lot les laisse tels quels. À `febf7735`, l'outil relève 8 PERDU.
- **6 dérives de ligne** : `packages/hikae/src/l1-split.ts`, +2 ; chaque tueur vise la ligne où se trouve aujourd'hui son texte.
- **2 tueurs morts réécrits** (`test/oracle-run.test.ts:129` et `:182`) : leur texte n'existe plus dans `scripts/oracle/run.mjs`.
  - `:129` vise `:39` CONST : la liste `DENY` perd son drapeau `i`, et le nom en minuscules `fx_secret_1` atteint une porte. La boucle de `:46` ne peut pas être ce tueur : pour les portes, `childEnv` filtre `DENY` lui aussi, et un tueur de `:46` survit à ce test (tiré à la main).
  - `:182` vise `:83` SDL : le saut d'un enregistrement rouge de même clé.
- **Test neuf** `oracle_git_children_see_no_foreign_credential` : la boucle de `:46` est la seule garde des enfants qui héritent de `process.env`, git d'abord. Git note lui-même les variables qu'il reçoit : `GIT_TRACE2_ENV_VARS` les nomme, et chaque processus git écrit un événement `def_param` par nom présent dans `GIT_TRACE2_EVENT`. Aucun nom d'identifiant ne doit y figurer. Ni enveloppeur ni saut : le test tourne sur tout OS (repli de la G2 delta, A-1 et A-2).
- **Test `oracle_gates_see_no_foreign_credential`** (repli A-3) : la porte ne voit que les deux noms de surcharge de npm, `npm_config_offline` et `npm_config_logs_dir`, même quand l'hôte passe `NPM_CONFIG_OFFLINE` et `NPM_CONFIG_LOGS_DIR`. Le tueur `:46` de ces noms meurt alors sous Linux comme sous Windows. Il passe au-dessus de la déclaration du test.
- **But** : `verifie-ancres.mjs` sur tout le dépôt, 0 PERDU.

## Tueurs du lot (chacun tiré à la main, fichier restauré, sha256 contrôlé)

- `packages/hikae/src/l1-split.ts:39 CONST "(n + 1)" -> "(n + 0)"`
- `packages/hikae/src/l1-split.ts:40 ROR "p > n" -> "p >= n"`
- `packages/hikae/src/l1-split.ts:43 SDL "q === undefined" -> ""`
- `packages/hikae/src/l1-split.ts:41 CONST "a - b" -> "b - a"`
- `packages/hikae/src/l1-split.ts:39 CONST "(1 - alpha)" -> "(1.01 - alpha)"`
- `packages/hikae/src/l1-split.ts:42 CONST "p - 1" -> "p - 2"`
- `scripts/oracle/run.mjs:39 CONST "^MONARK_PUBLIC_MIRROR$/i" -> "^MONARK_PUBLIC_MIRROR$/"`
- `scripts/oracle/run.mjs:83 SDL "if (r.exit !== 0) { console.error(`oracle: same-key record ${f} is red (exit ${r.exit})" -> ""`
- `scripts/oracle/run.mjs:46 COR "DENY.test(k) || " -> ""`
- `scripts/oracle/run.mjs:46 COR " || /^npm_config_(offline|logs_dir)$/i.test(k)" -> ""`
