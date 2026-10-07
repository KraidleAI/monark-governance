# G0 du lot L-T15 d'E-2a : la sentinelle ne nomme aucune clé kata (`sentinel_imports_no_kata_key`)

RECHERCHES, 2026-10-07. Base `1cddd2e5` (lot/etude-suite). Plan : G0 court d'E-2a v6.1 (§5, ligne L-T15 ; §9, ligne CM-5), accepté
par MONARK (`51fe3ee` de recherches) ; définition : G0 de CM-5 v4 §5.3, ligne L-T15 (« aucun fichier d'`apps/sentinel` ne nomme une
clé `kata:` »), Q-CM5-12 (L-T15 compté sous R-25), §6 (« `git grep -i kata -- apps/sentinel` vide ; épinglé par L-T15 »).

- **Provenance** : worker `claude-opus-5-5`, horloge lue (`date -u`) à 09:32 UTC pour ce G0. Worktree neuf détaché du scratchpad,
  branche `recherches/e2a-l-t15` ; `git add` par chemins explicites ; poussé sans force.

red-proof: test-only

## Constat, à `1cddd2e5`

- `git grep -i kata -- apps/sentinel` est vide (75 fichiers suivis, sources, tests et fixtures).
- Aucun test ne l'épingle : une clé `kata:` ou un import d'un module kata dans `apps/sentinel/` passerait la CI.

## Changement (test seul)

- Fichier neuf `test/sentinel-no-kata-key.test.ts`, test `sentinel_imports_no_kata_key` :
  - parcourt tout `apps/sentinel/` (hors `node_modules`), avec un contrôle positif (le parcours atteint `timeline.ts` et un `.json`) ;
  - rougit sur tout fichier qui contient `kata:` (casse ignorée), et sur toute ligne `import` ou `export` dont un spécifieur nomme `kata`.
- Le test vit hors d'`apps/sentinel/` : son propre texte nomme `kata:`, et il garde ainsi `git grep -i kata -- apps/sentinel` vide.
  La sentinelle de dérive de CM5-f se place hors d'`apps/sentinel/` (CM-5 v4 §6.1) : L-T15 reste vrai.

## Tueur

- apps/sentinel/src/timeline.ts:16 CONST "@monark/harness/calibration" -> "@monark/harness/kata"

## Preuves

- Tueur tiré à la main (fichier restauré, sha256 `ac357e7d…` identique avant et après) : rouge, `ERR_ASSERTION` (« imports a kata
  module »).
- Mutants de contrôle de la seconde assertion, tirés à la main : une clé `kata:trend-ema-v1@binance/BTCUSDT/1h/up-b1` ajoutée à la
  l.1 de `apps/sentinel/src/run.ts`, rouge (« names a kata key ») ; `KATA:x` ajouté à une fixture JSON, rouge. Aucun mutant
  équivalent : chaque assertion a un mutant qui la seule fait rougir.
- `node scripts/red-proof.mjs --base 1cddd2e5 --gel <worktree> --repo <worktree> --test-only` : voir le corps de la PR.
- R-25 : 1 fichier, +20 hors `docs/**/*.md`.
