# G0 du lot L-T15 d'E-2a : la sentinelle ne nomme aucune clé kata (`sentinel_imports_no_kata_key`)

RECHERCHES, 2026-10-07. Base `1cddd2e5` (lot/etude-suite). Plan : G0 court d'E-2a v6.1 (§5, ligne L-T15 ; §9, ligne CM-5), accepté
par MONARK (`51fe3ee` de recherches) ; définition : G0 de CM-5 v4 §5.3, ligne L-T15 (« aucun fichier d'`apps/sentinel` ne nomme une
clé `kata:` »), Q-CM5-12 (L-T15 compté sous R-25), §6 (« `git grep -i kata -- apps/sentinel` vide ; épinglé par L-T15 »).

- **Provenance** : worker `claude-opus-5-5`, effort max, horloge lue (`date -u`) à 09:32 UTC pour ce G0, et à 11:11 UTC pour le
  repli de la G2 de MONARK (dernière section). Worktree neuf détaché du scratchpad, branche `recherches/e2a-l-t15` ; `git add` par
  chemins explicites ; poussé sans force.

red-proof: test-only

## Constat, à `1cddd2e5`

- `git grep -i kata -- apps/sentinel` est vide (75 fichiers suivis, sources, tests et fixtures).
- Aucun test ne l'épingle : une clé `kata:` ou un import d'un module kata dans `apps/sentinel/` passerait la CI.

## Changement (test seul)

- Fichier neuf `test/sentinel-no-kata-key.test.ts`, test `sentinel_imports_no_kata_key` :
  - parcourt tout `apps/sentinel/`, sauf un dossier dont le chemin relatif à `apps/sentinel/` a un segment `node_modules` ;
  - contrôle positif : le parcours atteint `src/timeline.ts` et `test/fixtures/usde-boundary-blocks.json`, comme
    `test/ci-gates.test.ts` l.1699-1704 ;
  - une seule assertion, sur le texte entier de chaque fichier lu en latin1 : il ne contient pas `kata`, casse ignorée. C'est la
    mesure même du §6 : une clé, un import sous toute forme (sur plusieurs lignes, dynamique, `require`), un chemin ou un
    commentaire la font rougir.
- Le test vit hors d'`apps/sentinel/` : son propre texte nomme `kata:`, et il garde ainsi `git grep -i kata -- apps/sentinel` vide.
  La sentinelle de dérive de CM5-f se place hors d'`apps/sentinel/` (CM-5 v4 §6.1) : L-T15 reste vrai.

## Tueur

- apps/sentinel/src/timeline.ts:16 CONST "@monark/harness/calibration" -> "@monark/harness/kata"

## Preuves

- Tueur tiré à la main (fichier restauré, sha256 `ac357e7d…` identique avant et après) : rouge, `ERR_ASSERTION` (« names a kata
  key »).
- Mutants tirés à la main : une clé `kata:trend-ema-v1@binance/BTCUSDT/1h/up-b1` ajoutée à la l.1 de `apps/sentinel/src/run.ts`,
  rouge ; `KATA:x` ajouté à une fixture JSON, rouge. Les deux par la même et seule assertion (« names a kata key »).
- `node scripts/red-proof.mjs --base 591b3a30 --gel <worktree> --repo <worktree> --test-only` (Node v24.21.0, Linux) : sortie 0,
  « 1 judged, 0 unchanged » ; le test `pinned`, son tueur tué par `ERR_ASSERTION` (« names a kata key »).
- Voisin `apps/sentinel/test/sentinel.test.ts` : 34 sur 34. tsc, eslint, lang-gate, grep-forbidden, lint-ratchet, export-public
  `--check`, winlint : 0.
- R-25 : 1 fichier, +19 hors `docs/**/*.md`.

## Repli de la G2 de MONARK (2026-10-07)

Ligne datée 2026-10-07T11:11:28Z (`date -u`), RECHERCHES, modèle `claude-opus-5-5`, effort max. Pièce : `g2-232.json` (recherches
`1aebcdb`). Actes git : `git fetch` à refspecs explicites de `lot/etude-suite` (`591b3a30`) et de `recherches/e2a-l-t15`
(`0c3a5474`) ; fusion du tronc (`3dff5497`), sans rebase ni force. Le tronc ne touche pas `apps/sentinel` entre `1cddd2e5` et
`591b3a30` ; `git grep -i kata -- apps/sentinel` y reste vide (75 fichiers suivis).

- M (le test ne tenait pas le §6) : les deux assertions (`/\bkata:/i` sur le texte ; les lignes qui commencent par `import` ou
  `export`) deviennent une seule, `assert.doesNotMatch(readFileSync(f, "latin1"), /kata/i, …)`. Sondes rejouées :
  - les 33 que la pièce décrit (K0, H1, H2, P01 à P25, Q04, Q27, Q29, Q30, Q31), P01, P11 et P12 refaites d'après leur classe ; la
    pièce ne décrit pas les 5 autres de ses 38 ;
  - le survivant complet de la pièce (un import de `kata-path.ts` sur trois lignes, après `timeline.ts` l.16) ;
  - 5 sondes à moi : réexport sur plusieurs lignes, `import … = require`, import sans liaison, import dynamique à gabarit, `Kata`
    dans une valeur JSON.
  - Le test de `0c3a5474` reste vert sur les 14 survivantes de la pièce et sur le survivant complet. Le test plié n'a aucun
    désaccord avec `git grep --untracked -i -l kata -- apps/sentinel`. Il rougit par `ERR_ASSERTION` (« names a kata key ») sur
    chaque sonde que le grep voit, dont l'import sur plusieurs lignes (P10), l'import dynamique (P07) et le `require` (P08). Il
    reste vert sur les 5 que le grep ne voit pas (P03, P04, Q04, P21, P23). Après chaque sonde, fichier restauré et `git status`
    vide sous `apps/sentinel`.
- m (témoin) : ancré sur `src/timeline.ts` et `test/fixtures/usde-boundary-blocks.json`. Mutants du parcours, tirés à la main : un
  parcours qui saute tout segment `test`, ou tout segment `fixtures`, ou qui n'est pas récursif, rougit à la base par le témoin.
- m (une assertion, un tueur) : réglé par le point M ; le tueur l.16 la fait rougir (« names a kata key »).
- m (`node_modules`) : l'exclusion porte sur un segment du chemin relatif à `apps/sentinel/`,
  `relative(SENTINEL, e.parentPath).split(sep).includes("node_modules")`. Rejoué :
  - P22 (`src/not_node_modules_x/p.ts`) rouge, P21 (`node_modules/x/p.json`) vert ; avec l'ancienne exclusion remise, P22
    redevient vert ;
  - copie de l'arbre sous un chemin qui contient `node_modules` (tests copiés en `.mjs`, Node ne retirant pas les types sous
    `node_modules`) : l'ancien test y donne un faux rouge par son témoin, le test plié y est vert.
