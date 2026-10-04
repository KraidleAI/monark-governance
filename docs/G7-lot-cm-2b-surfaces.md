# G7 du lot CM-2b-surfaces : BTC-DIR-RETIRE-SURFACES-1, temps (i)

- **Mandat** : partage de charge de MONARK (2026-10-04, §1), zone de MONARK ouverte pour ce lot et ces fichiers. Plan : `docs/G0-lot-cm-2b-surfaces.md`.
- **Base** : `2abe801` (`recherches/cm-2b`, PR #106). Statut : G2 par une instance neuve faite (APPROUVE-AVEC-CORRECTIONS), pliée ci-dessous ; contrôle par diff de MONARK à venir.

## Oracle

- `node scripts/red-proof.mjs --base 2abe801 --gel cd4b534 --repo /home/user/monark-governance --draw 6 --seed 17` : **OK**, 9 tests jugés F2P, 6 tueurs tirés, 6 tués.
- `npx tsc --noEmit`, eslint (fichiers changés ; les deux scripts `.mjs` sont ignorés par la configuration), `gate:vocab`, `lint:ratchet` 69/69 : verts. Harnais 126/126.
- `npm test` : 1 955 tests, 3 échecs : `bell-served.test.ts:153` (clone superficiel), `harness_served_data_matches_in_process_harness`, `narabi_gate_facts_read_from_committed_sources` (temps (ii)).
- R-25 : 379 lignes comptées contre `2abe801`, sous 547.

## Ce qui change (surfaces, aucun comportement servi du harnais)

- CA (`verify-harness.mjs`) : corps sur la clé USDe ; `gate_retired_call` et `gate_future_call` (400 avec `code`, C-8) ; 15 contrôles, verts en processus.
- Sync (`sync-harness-served.mjs`) : même corps ; btc-dir hors de la table des classes. `harness-served.json` non régénéré (temps (ii)).
- Trace h5 : régénérée par son enregistreur ; étape 5 sur la clé USDe, étape 7 gardée sur le refus `task_class_retired` ; `0b32b330…` → `e403cf01…` ; manifeste du site suivi par l'outil.
- Site : Shōgen garde `built`, preuve sur l'outil `attest` servi (`probe_harness_records_real_decision`, choix provisoire) et les deux tests unitaires de la jointure, note « dormante » ; Hikae et son panneau sans la classe synthétique ; simulation sans la classe retirée.
- Skill : btc-dir retirée, exigences USDe ; `DEMO.md` `79b54471…` → `daf8d3ea…`, épinglé (DEMO-HASH-STALE-1).

## Rouges restants jusqu'au temps (ii)

`harness_served_data_matches_in_process_harness` et `narabi_gate_facts_read_from_committed_sources` : ils lisent `apps/site/data/harness-served.json` et `docs/deploy-CA-harness.json` (empreinte d'`openapi` `9e3176…` contre `fc746a6…`), écrits depuis le service en ligne après déploiement.

## Questions pour MONARK

1. Le test d'intégration servi de Shōgen : `probe_harness_records_real_decision` (provisoire).
2. L'entrée de `fixtures/h5-e2e-trace.json` dans `apps/site/data/manifest.sha256.json` (hors de la table, conséquence de la trace) : acceptée ?

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

- Constats : trace h5 ré-enregistrée hors ligne octet pour octet ; entrées du manifeste exactes ; seuls les fichiers permis touchés.
- (1) `scripts/verify-harness.mjs` exporte `GATE_BODY` ; `scripts/sync-harness-served.mjs` l'importe au lieu d'une copie (tue M2).
- (2) En-tête de `test/h5-e2e-probe.test.ts` : la clé USDe commise rend commit/covered ; btc-dir retirée (l'étape 7 montre le refus).
- (3) `test/site-docs.test.ts` `shogen_integration_tests_are_the_served_attest_and_the_join_units` : épingle les trois tests de Shōgen (tue M5 ; `probe_harness_records_real_decision` reste provisoire jusqu'au choix de MONARK).
- (4) `test/skills.test.ts` `skill_states_the_retired_class_and_the_usde_policy` : `task_class_retired` et α/nMin de la clé USDe lus dans `class-policy.ts` (tue M4, M6).
- Cause précise de `narabi_gate_facts_read_from_committed_sources` : `docs/deploy-CA-harness.json` porte l'empreinte d'`openapi` `9e3176…` (servi d'avant CM-2b) contre `fc746a6…` en processus ; ce fichier n'est réécrit qu'au déploiement (temps (ii)).
- Après la G2 : `red-proof --base 2abe801 --gel 3fb4413 --repo /home/user/monark-governance --draw 9 --seed 23` OK (11 jugés F2P, 9 tueurs tirés, 9 tués) ; harnais 126/126 ; R-25 : 19 fichiers, +225/−188, soit 413 lignes comptées (borne 547).

## Sortie

Prêt pour le contrôle par diff de MONARK, à fusionner avec #106. Temps (ii) après le déploiement de l'arbre qui porte CM-2b.

## Pli du contrôle par diff de MONARK sur CM-2b (C-1, 2026-10-04)

- Plan : section du même nom au G0. Commits : `9768897` (tests), `69cfd7f` (surfaces, **gel**), puis ce commit de documents.
- `node scripts/red-proof.mjs --base 2abe801 --gel 69cfd7f --repo /home/user/monark-governance --draw 9 --seed 31` : **OK**, 13 tests jugés F2P, 9 tueurs tirés, 9 tués. Contre la base GitHub (`--base 98e3779`) : **OK**, 31 jugés, 9 tueurs tirés, 9 tués. Un premier passage était REFUSED (une ligne tueuse manquait au-dessus d'un test modifié, et le mot de cuisine « G2 » dans un commentaire de `fleet.ts` faisait rougir le fichier `site-build-fleet.test.ts` au gel) : corrigé avant le gel cité.
- `npx tsc --noEmit`, eslint (fichiers changés), `gate:vocab`, `lint:ratchet` 69/69, `lang:gate` : verts.
- `npm test` au gel : 1 911 tests, 39 échecs ; le même `npm test` sur `2abe801` dans ce conteneur : 65 échecs. Comparaison par nom : aucun échec propre au gel (le seul écart, `apps/sentinel/test/u4b-select-episode.test.ts` en échec de fichier, est le même test `u4b_fill_ts_quorum2_…` rouge à la base, rejoué seul trois fois). Les échecs communs sont d'environnement, dans des paquets que le lot ne touche pas (`packages/rpc-guard`, Ukemi, Bell, Dojo, sentinelle, export), plus les deux rouges du temps (ii).
- R-25 par `r25()` contre `2abe801` : **384 lignes comptées** (+239/−145 ; borne 547). Avant ce pli : 319 par `r25()` (le « 413 » de la G2 était un `--shortstat` brut, fixtures JSON comprises).
- Shōgen : `integration_test` = `http_mirror_matches_mcp_surface`, `verify_harness_ca_passes_on_the_in_process_harness` et les deux tests unitaires de la jointure ; limite déclarée (valeurs du témoin servi non épinglées, ATTEST-KATA-SUBJECT-1) ; statut `built` inchangé.
- Couplage avec #110 (C-2) : voir le G0 ; à refaire quand #110 est dans la base de ce lot.
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` n'est pas commis.
