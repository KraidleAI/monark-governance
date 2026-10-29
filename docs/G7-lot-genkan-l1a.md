# G7 du lot 1a de Genkan, partie 1 : le squelette du noyau Lean épinglé à Lean 4.32.1, son enveloppe et le paquet dans l'export

- **Base** : `a8364fea`. **PR** : #340, branche `lot/genkan-l1a`, tête `08991237`, trois commits : `1c8208cc` (le lot), `81b53f43` (le
  correctif du site venu du tronc), `08991237` (le correctif de l'oracle). **Fusion au tronc** : `faecf36b`, tronc avant fusion
  `9f8563af`.
- **Plan** : partie 1 de Genkan, lot 1a, sous l'accord du fondateur pour la partie (2026-10-28 16:38 UTC). La relecture des lots de la
  partie est la G2 de la partie, à sa fin.

## Ce que le lot livre

- `apps/genkan/kernel/` : le projet lake du noyau (`lakefile.lean`, `lean-toolchain` épinglé à v4.32.1, `Main.lean`,
  `lake-manifest.json`). L'arbre `.lake` est ignoré par git et laissé hors de l'export.
- `apps/genkan/scripts/lake.mjs` : la seule voie par laquelle le dépôt lance lake. Il refuse un `ELAN_HOME` vide ou sur le disque C, un
  dossier temporaire sur C, un lake épinglé absent et un dossier temporaire absent, chacun par une ligne et le code 2 ; il lance le lake
  épinglé par son chemin absolu, `TMP`, `TEMP` et `TMPDIR` posés, jamais `elan` ni une recherche dans `PATH`, et rend le code de lake.
- Tests : `apps/genkan/test/scripts.test.ts` (2) et `apps/genkan/test/export.test.ts` (1), dans `test:main` et dans `test:genkan`.
- Le job CI `g3-genkan` : il télécharge Lean 4.32.1 pour Linux, le tient à son sha256 avant de le déballer (ni elan ni installateur),
  construit le noyau par l'enveloppe, vérifie que le squelette refuse par le code 3 et lance `test:genkan`.
- L'export public porte `apps/genkan`, sans `.lake`.
- L'oracle local laisse au CI les six étapes de `g3-genkan` que seul le runner joue (`scripts/oracle/run.mjs` l.32) ; le contrôle des
  outils du job et `npm run test:genkan` restent des gates locales.

## Vérification

- Premier commit : `test:main` vert (333 fichiers, 3351 tests) ; red-proof : 5 tests jugés F2P, 5 tueurs tirés, 5 tués ; mutants : 139,
  138 tués, 0 survivant, 1 non conclu (le tueur de `bell_handoff_permissions_on_linux`, test Linux sous root, sauté sous Windows ; le job
  `g3-bell-handoff-perms` le joue) ; eslint et tsc propres ; taille du lot 488 lignes (borne 1205).
- Après la fusion du correctif du site dans la branche (`81b53f43`) : `test:main` vert (334 fichiers, 3352 tests) ; contrôle du nombre de
  tests vert contre `f09774c7`.
- Correctif de l'oracle (`08991237`) : `test:main` vert (3353 tests : 3306 réussis, 0 échec, 47 sautés) ; contrôle du nombre de tests
  vert contre `f09774c7` (334 fichiers, 3353 tests) ; red-proof : le test neuf F2P, le tueur tiré tué (`RED-PROOF.json` `2207ff85…`) ;
  mutants : 55, un par ligne de tueur de `test/oracle-run.test.ts`, 54 tués, 0 survivant, 1 non conclu (le tueur de
  `oracle_lock_alive_reads_a_zombie_as_dead`, qui lit `/proc` et saute sous Windows), sur l'arbre exact du commit (empreinte des
  changements `3927a8bc…`, `RESULTS.json` `92f241b8…`) ; eslint et tsc propres.
- CI de #340 : 15 contrôles sur 15 verts à `08991237` (run 40793477056) ; `g3-genkan` y tient Lean 4.32.1 à son sha256, construit le
  noyau par l'enveloppe et voit le squelette refuser par le code 3.
- Rejeu Windows à la fusion : les huit fichiers de test que le lot change, 133 tests, 131 réussis, 0 échec, 2 sautés.
- Oracle G7 sur `faecf36b`, base `9f8563af` : vert, 13 gates sur 13 (enregistrement
  `faecf36b03d702758d3f0666603d18e42ab6b4f9-G7-20261029T002800Z-44928.json`, sha256 `45950ca1…`) ; 3353 tests, 3306 réussis, 0 échec,
  47 sautés. Son `ci_only` porte les six étapes du runner de `g3-genkan`, et aucune gate `curl` n'a tourné.
- Premier G7, sur la première fusion `1bf83ee9` (base `f09774c7`, jamais poussée) : rouge. L'oracle rejouait toutes les lignes `run:` de
  `ci.yml`, dont l'étape `curl` de `g3-genkan` : sans `RUNNER_TEMP` sur l'hôte, sortie 23, rien d'écrit (enregistrement
  `1bf83ee97f52eedcbb6affa8a263ac3efe89ae74-G7-20261028T223624Z-3804.json`, sha256 `98c630b9…`). D'où `08991237`.

## Ce qui reste

- **ORACLE-RUNNER-GATE-1** : `CI_ONLY` reste une liste tenue à la main ; une règle de l'oracle doit refuser une gate qui nomme
  `$RUNNER_`, `$GITHUB_`, `${{` ou une URL `http(s)://` sans entrée qui la retire (`docs/ETAT.md`). Déclencheur : avant le lot 1b.
- Le lot 1b de la partie 1, puis la G2 de la partie.
