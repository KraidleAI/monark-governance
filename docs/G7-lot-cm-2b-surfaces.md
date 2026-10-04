# G7 du lot CM-2b-surfaces : BTC-DIR-RETIRE-SURFACES-1, temps (i)

- **Mandat** : partage de charge de MONARK (2026-10-04, §1), zone de MONARK ouverte pour ce lot et ces fichiers. Plan : `docs/G0-lot-cm-2b-surfaces.md`.
- **Base** : `2abe801` (`recherches/cm-2b`, PR #106). Statut : G7 après autocontrôle ; le contrôle par diff de MONARK est à venir et sera plié ici.

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

`harness_served_data_matches_in_process_harness` et `narabi_gate_facts_read_from_committed_sources` : ils lisent des données écrites depuis le service en ligne après déploiement.

## Questions pour MONARK

1. Le test d'intégration servi de Shōgen : `probe_harness_records_real_decision` (provisoire).
2. L'entrée de `fixtures/h5-e2e-trace.json` dans `apps/site/data/manifest.sha256.json` (hors de la table, conséquence de la trace) : acceptée ?

## Sortie

Prêt pour le contrôle par diff de MONARK, à fusionner avec #106. Temps (ii) après le déploiement de l'arbre qui porte CM-2b.
