# G7 du lot ANCHORS-DRIFT-1 : les tueurs perdus du dépôt

- **Branche** : `recherches/anchors-drift-1`, partie de `b7d0cb84`, tronc `origin/lot/etude-suite` `febf7735` fusionné ; worktree `monark-governance-anchors`. Commits locaux, sans push.
- **Lot de tests seuls** (G0 : `docs/G0-lot-anchors-drift-1.md`, ligne `red-proof: test-only`). Aucun code de production n'est touché.

## 1. Ce que le lot ferme

- **G2 de T0-FOLLOWUP-1, §3** : 16 tueurs PERDU à `b7d0cb84`.
- **8 sont fermés par le tronc** : l'acte 9 de T0 (`febf7735`) retire de `ci.yml` les 8 lignes de la dérogation de la PR 198, et les tueurs de `ci.yml` retrouvent leurs lignes d'origine. Le ré-ancrage fait d'abord sur `b7d0cb84` (+1, +8, +1) est défait après la fusion du tronc.
- **6 dérives de ligne**, `packages/hikae/test/oracle-l1-split.test.ts` : chaque tueur suit son texte dans `l1-split.ts`, +2.
- **2 tueurs morts réécrits**, `test/oracle-run.test.ts` :
  - `:129` : `scripts/oracle/run.mjs:39 CONST` ôte le drapeau `i` de `DENY` ; le nom `fx_secret_1` atteint alors une porte. La première réécriture (la boucle de `:46`) survivait au tir à la main : pour les portes, `childEnv` filtre `DENY` lui aussi ;
  - `:182` : `scripts/oracle/run.mjs:83 SDL`, le saut d'un enregistrement rouge de même clé.
- **Test neuf** `oracle_git_children_see_no_foreign_credential` : la boucle de `:46` est la seule garde des enfants qui héritent de `process.env` (git). Un enveloppeur de git en tête de `PATH` note les noms reçus ; aucun nom d'identifiant n'y figure. Tueur `:46 COR "DENY.test(k) || " -> ""`. Ignoré sous Windows (script shell POSIX), comme le dit le test.

## 2. Vérifications (base `febf7735`)

- **Ancres, tout le dépôt** (`verifie-ancres.mjs .`) : 1 411 tueurs, 1 411 ANCRE, 0 DERIVE, **0 PERDU**. Avant le lot, sur le tronc : 8 PERDU.
- **red-proof `--test-only`** : OK, 1 jugé, épinglé (le test neuf ; son tueur tiré à la gel est tué). Les autres changements sont des lignes de tueur, que red-proof ne juge jamais.
- **Tueurs tirés à la main** : 9 sur 9 tués par assertion (les 6 de hikae, les 2 réécrits, celui du test neuf), chaque fichier restauré (sha256).
- **R-25** contre `febf7735` : 32 (STAT ; plafond du lot 547).
- **Portes** : `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` OK.
- **Tests touchés** (`test/oracle-run.test.ts`, `packages/hikae/test/oracle-l1-split.test.ts`) : 23 sur 23.
- **`test:main`** : 2 744 tests, 2 718 verts, 22 ignorés, 4 rouges, les mêmes qu'à `b7d0cb84` sur cet hôte, qui tourne en root (`sentinel_sigterm_after_lock_acquired_before_handler_releases_lock`, `sentinel_sigterm_while_lock_acquiring_releases_lock`, `ukemi_guard_record_skipped_the_platter_flush_nonvacuous`, `dojo_history_collect_to_verify_end_to_end`) ; aucun ne touche un fichier du lot.

## 3. Reste ouvert

Rien dans le lot. Les quatre rouges de l'hôte sont antérieurs au lot et ne viennent pas de lui.
