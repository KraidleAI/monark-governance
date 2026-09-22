# G2-delta-2 (micro-pli 1bcfbd7) — lot U-4b-1b-3 — relecteur Opus 5.5 (claude-opus-5-5[1m]), 2026-09-22

Modèle résolu : claude-opus-5-5[1m]

# G2-DELTA-2 — micro-pli U-4b-1b-3 (`d2e36ac..1bcfbd7`, `lot/u4b-1b-3`, test seul) — relecteur Opus 5.5, même instance que le G2-delta

## Verdict : **PASS**

C-GD-1 et C-GD-2 sont **fermées**. Il n'y a aucune nouvelle correction.

Restent ouverts, inchangés, les items formés du G2-delta (propriétaire : orchestrateur) :
- C-GD-3 (texte de l'ADR, au fold) ;
- O-1 élargi aux 4 sites ;
- O-D3 ;
- O-D4.

Tout a été exécuté sous `env -u` des 8 clés payantes (harnais, sonde, oracles), avec `TEMP/TMP/TMPDIR` sur `F:\tmp\g2-u4b1b3\tmp-delta`.

**R-20** : aucun commit, aucun workflow, aucune écriture dans `F:\Monark` ni dans `F:\Monark-wt-*`.
- Mesure à 22:00:27Z, avec `--no-optional-locks` : `F:\Monark-wt-u4b1b3` a pour HEAD `1bcfbd7` et un status vide ; `lot/u4b-1b-3` = `1bcfbd7`.
- Mon clone `F:\tmp\g2-u4b1b3\tree-delta` a été avancé en fast-forward de `d2e36ac` (propre) à `1bcfbd7`. Après la fusion à blanc et son abandon, il est propre, sans MERGE_HEAD.

## Mesures

**Diff du micro-pli.** `git diff --numstat d2e36ac 1bcfbd7` → `27 2 apps/sentinel/test/u4b-select-episode.test.ts`, et rien d'autre.
- Golden `.mjs` `20e1cf9d…` et `.d.mts` `30d61b79…` inchangés.
- Test `89fefa8d…`, identique à `DELIVERED.sha256`.
- 0 CR, 0 caractère non ASCII dans les lignes ajoutées, `git diff --check` à exit 0.

**Gel A-6.**
- `git diff --quiet` à exit 0 sur les 11 fichiers gelés, le prereg et l'ADR-U4b, entre `b900b4b` et `1bcfbd7` comme entre `d2e36ac` et `1bcfbd7`.
- Recalcul en régime B : 11/11 identiques aux valeurs `d2e36ac`, donc au §2 du prereg pour les 9 (`delta2-a6.txt`).
- Prereg LF `1971d9b1…`.

**R-25.** Pathspec extrait verbatim de `ci.yml:65` (15 arguments) :
- `b900b4b...1bcfbd7` → 3 fichiers, 448 insertions et 24 suppressions, soit **472** ;
- même résultat en forme CI `origin/lot/etude-suite...1bcfbd7` (merge-base `b900b4b`) ;
- micro-pli seul : 27 + 2 = 29 ;
- 472 est sous 1 150 et sous `VIBEGATES_PR_LIMIT=1205`.

**(a) D4 et D6 rouges par leur test nommé.**

Harnais : `mutants-delta2.mjs`, copie repointée de `F:\tmp\u4b1b3\mutants.mjs` (sha `ae99d1aa…`), où seules `TREE` et `TMPF` changent (`diff` à 2 lignes). Journal : `mutants-delta2-run.log` (en-tête A-12, HEAD `1bcfbd7`).
- `BASELINE status=0 ok=32 not_ok=0`.
- `ALL_KILLED_BY_INTENDED=true (killable=24: core 18/18 [M1..M17 + D4], extra 6/6 [D6, M18..M22])`.
- `EQUIVALENTS_SURVIVED_AS_DECLARED=true (D7)`.
- `ALL_RESTORED=true FINAL_GOLDEN_INTACT=true n_mutants=25`.

| mutant | test tueur (nommé dans le TAP) | assertion qui rougit | autres tests rouges |
|---|---|---|---|
| **D4** | `u4b_fill_ts_resume_refuses_a_falsified_sidecar_by_self_sha_with_0_fetch` | « no operator lock survives the self-sha refusal… » (assertion de verrou) | — |
| **D6** | `u4b_fill_ts_resume_refuses_a_sidecar_from_another_brut_by_name_with_0_fetch` | « no operator lock survives the discover_sha refusal… » (assertion de verrou) | test pre-open |

Le harnais applique exactement mes mutations : les sha des fichiers mutés valent `c3c1577b…` (D4), `148b1671…` (D6) et `44474f1c…` (D7). Ce sont ceux de mon `mutants-delta-own-run.log` (`g2delta_sha_match=true`).

**(b) Sidecar sans objet `block_ts_extra` (absent ou null).**
- Test `u4b_fill_ts_resume_refuses_a_sidecar_without_block_ts_extra_object_by_name_with_0_fetch_and_no_lock`.
  - Il couvre deux corps : clé absente, puis `null`.
  - Pour chacun, il vérifie : `SelectError` avec le motif « with no block_ts_extra object », 0 fetch, aucun verrou, aucun dossier de cycle, fichier identique octet pour octet.
- La fixture isole bien la garde :
  - self-sha = `sha256Hex(canon(null))`, soit ce que calcule la reprise quand l'objet manque ;
  - `discover_sha` = celui de ce brut ;
  - toutes les autres gardes passeraient donc.
- Mutants, tous tués par ce test :
  - M18 (refus déplacé après l'ouverture) : tué par l'assertion de verrou ;
  - M19 (garde retirée) : tué par le motif nommé, car le garde s'ouvre et fetche ;
  - M22 (objet manquant remplacé par `{}`) : tué, le message devient « self-sha mismatch ».
- **Sonde indépendante** (`delta-probes\delta2-noobj.test.mjs`, journal `delta2-noobj.log`, 5/5) : clé absente, `null`, tableau, chaîne, nombre.
  - Pour chaque forme : `SelectError` nommée, 0 fetch, 0 `.lock`, cycle jamais créé, fichier intact.
  - Puis, une fois le sidecar retiré, le **même** cycle se relance jusqu'à `complete`, sans aucun verrou restant.

**(c) Fixtures en forme réelle et D7.**
- `:171` et `:183` portent `phase: "complete"`.
- M20 (garde self-sha de `runSelect` retirée) et M21 (garde `discover_sha` retirée) sont tués par « Missing expected rejection » : chaque test isole désormais **sa** garde.
- D7 (garde `phase` placée en premier) **survit**, avec 0 test rouge. C'est l'équivalence déclarée : chaque fixture n'échoue qu'à une seule garde, et un refus reste un refus dans les deux ordres.

**(d) Oracle sur le clone `1bcfbd7`** (`oracle-delta2\`, de 21:51:49Z à 21:55:44Z).
- 7/7 à exit 0 : `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet` (69/69), `lang:gate`, `export:check`.
- **tests 935 / pass 934 / fail 0 / skipped 1** ; le skip est `u4b_labels_replay_via_main_real_artifact` (« real e2 artifacts absent… »).
- 0 `UV_HANDLE_CLOSING`.

**(e) Fusion à blanc avec la HEAD de `lot/etude-suite`.**
- La branche a bougé pendant la vérification : `3f6662f` → `15fb00a` → **`a703e24`**. J'ai fusionné `a703e24`, HEAD au moment de la fusion (`merge-dry3.log`).
- `a703e24` contient la fusion NARABI-OPS-1d (`3659181`) et des docs.
- Résultat : 0 conflit, 65 chemins.
- 8 chemins hors `docs/`, tous venus de NARABI-OPS-1d, sans recouvrement avec les fichiers du lot :
  - `apps/sentinel/src/{run.ts,keyless-transport.ts}` ;
  - 3 tests sentinel ;
  - `deploy/monark-sentinel.service` ;
  - `test/probe-narabi.test.ts` ;
  - `test/rpc-guard-fetch-only-inside-client.test.ts`.
- Les 3 fichiers du lot restent `20e1cf9d… / 30d61b79… / 89fefa8d…` dans l'arbre fusionné.
- **Oracle sur l'arbre fusionné** (`oracle-merged3\`, `MERGE_HEAD: a703e24…`, de 21:56:07Z à 22:00:02Z) :
  - 7/7 à exit 0 ;
  - **tests 947 / pass 945 / fail 0 / skipped 2** ;
  - 0 `UV_HANDLE_CLOSING`.
- Attribution du compte : 947 = 935 + 12. Le +12 correspond aux tests de haut niveau ajoutés et retirés sur `etude-suite` depuis `b900b4b` (comptage statique : +16 −4). Le lot compte +14 (5 G1 + 8 pli + 1 micro-pli).
- Les 2 skips sont nommés et préexistants :
  - `u4b_labels_replay_via_main_real_artifact` : les artefacts e2 sont absents d'un clone ;
  - `sentinel_run_releases_chainstack_lock_on_sigterm` (« win32: process.kill is a hard kill (no SIGTERM handler)… »), un skip de NARABI-OPS-1d.
- `git merge --abort` a été fait ; clone propre.

## Observations (aucune action requise)
- **O2-1.** Le compte attendu au G7 sur l'arbre **principal** diffère de celui d'un clone. Le journal CHANTIERS (`8d658bd`) indique que l'arbre principal exécute le rejeu e2, et que son seul skip est le SIGTERM win32. Sur `F:\Monark` fusionné, attendre donc 947/946/0/1, pas 947/945/0/2. Ce point est raisonné, non mesuré par moi : je n'exécute rien dans `F:\Monark`.
- **O2-2.** `etude-suite` bouge vite, de 3 commits pendant cette vérification. Le G7 devra refaire la fusion contre la HEAD du moment. Mesure la plus récente : `a703e24`, sans conflit, avec le recouvrement NARABI décrit ci-dessus.

## Fichiers (sous `F:\tmp\g2-u4b1b3\`)
- `G2-delta-2.md` : ce rendu.
- `ff-1bcfbd7.log`.
- `delta2-a6.txt`.
- `mutants-delta2.mjs` et `mutants-delta2-run.log`.
- `delta-probes\delta2-noobj.test.mjs` et `delta-probes\delta2-noobj.log`.
- `oracle-delta2\` et `oracle-delta2.run.log`.
- `merge-dry3.log`, `oracle-merged3\` et `oracle-merged3.run.log`.

**Provenance.** Relecteur `claude-opus-5-5[1m]` (effort max), 2026-09-22, de 21:48 à 22:01Z. Objet : `1bcfbd7`, parent `d2e36ac`. Fusion à blanc contre `a703e24`. Réviseur : orchestrateur (R-21), puis G7.
