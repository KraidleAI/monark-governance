# Checkpoint-1 — PLAN du lot U-4b-1b-2 (réducteur de sélection d'épisode + prober D_e paramétré) — APPROUVE-AVEC-CORRECTIONS

Validateur-humain `claude-fable-5-1`, 2026-09-22 ~14:0x UTC, contexte frais. Reconstitué par l'orchestrateur depuis la notification de tâche (le fichier de sortie de l'agent est vide — 0 octet — défaut de persistance consigné, CA-8) ; contenu = celui transmis au worker le 2026-09-22 14:0x UTC (SendMessage) ; rulings orchestrateur dans `docs/CHANTIERS.md`.

## Artefacts lus
Mission `F:\tmp\u4b1b2\MISSION-G1-u4b-1b-2.md` ; `docs/PLAN-u4b-prereg.md` intégral (sha LF recomputé `770413d9…`) ; `scripts/census/u3-realized.mjs` (labeler gelé `cb020425…`, `parseEventsFile :406`, prédicat `:548`, `EVENTS :76` = `ASSET.WETH`) ; `u4b-discover.mjs`, `liquidation-logs.mjs`, `u4-oracle-path.mjs`, `u4-guard.mjs`, `rpc2.ts`, `windows.ts`, `u4b-reduce.mjs`, `u4b-scores.mjs:86-116` ; ADR-U4b (table Tuyaux, amendement -1b-1) ; `F:\course-ukemi\discover\` (aucun JSON écrit).

## Checklist
- CA-1 : correction — (i) le brut de discover ne porte AUCUN timestamp de bloc (`u4b-discover.mjs:96` ; `clusterWethLiquidations` appelle `tsOf` par recherche binaire) ⇒ le réducteur planifié ne tourne pas sur le brut de la course ; (ii) `events[].collateral:"WETH"` casse silencieusement le labeler (filtre par ADRESSE `:548`).
- CA-2 : conforme (aucune valeur nouvelle ; D-n techniques à déclarer : source des ts, ordre labeler→prober, schéma du brut).
- CA-3 : conforme (ADR-U4b + amendement séparé ; 9 gelés nommés intouchables ; aucun fichier du lot dans les 9).
- CA-4 : conforme. CA-5 : correction (MAST absent : « dérive du format de sortie », « vérification incomplète »).
- CA-11 : correction bloquante — tuyau `--rawlogs` annoncé par l'ADR (`:438`) non produit par la mission.
- R-25 : conforme (deux moitiés de Q-D ; troisième fichier si option (a)).
- Fidélité §DISC : conforme point par point (exclusion e2, N_min 50, B_hi, argmin + tie-break, version_ok hors ligne + sous-commande, B0).
- Prober : correction — résidus e2 hors liste (`rawPath` :144, défaut `--raws-dir` :47, stdout « e2 » :153, `main()` non injectable) ; aucun test existant.

## Décision : APPROUVE-AVEC-CORRECTIONS (C-1, C-2, C-3 BLOQUANTES avant l'écriture du réducteur)
- C-1 (bloquante) source des timestamps : (a) discover persiste `block_ts` (schéma v2, sous `brut_sha256`) et est relancé ; ou (b) sous-commande keyless du réducteur écrivant un sidecar sha-lié. Ruling orchestrateur : (a).
- C-2 (bloquante) : `collateral` = constante `WETH` adresse ; test de composition via `parseArgs(["--events", <fichier réel>])` + prédicat `:548` ; mutant chaîne "WETH" rouge.
- C-3 (bloquante) : le réducteur écrit `A-rawlogs-<episode_id>.jsonl` (e2-exclus, ordre canonique) + `rawlogs_sha256` ; ligne de tuyau dans l'ADR.
- C-4 : `B_last` réducteur == `firstBlockAtOrAfter(ts(B_first)+86400,…)−1` du labeler sur les mêmes ts.
- C-5 : périmètre de `selection_sha256` (hors `version_check`) ; états pending→true ; false ⇒ STOP H-1 ; « diff lu et déclaré NEUTRE » = flag explicite en provenance.
- C-6 : plomberie `--check-version` (`storageAt` via `guarded.call` quorum-2 — ruling). C-7 : `usdt_prices: {}` + `usdt_blocks: []` + `usdt_blocks_status:"omitted"` ; blocs dérivés des lignes `deficit_base_no_price` (helper pur) ; ordre labeler→prober = D-n.
- C-8 : liste complète des résidus e2 du prober ; `run(argv, deps)` exporté ; `--raws-dir` obligatoire ; `feed_proxy_source` en provenance ; mutants « B0 en dur » et « défaut raws-dir e2 » rouges.
- C-9 : MAST nommés + contre-mesures dans l'amendement.

AM-1 : deux défauts invisibles depuis la mission seule (ts absents du brut réel ; `collateral:"WETH"` vidant le cluster) — obtenus en lisant les consommateurs.
