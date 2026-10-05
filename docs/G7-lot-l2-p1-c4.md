# G7 du lot L2-P1-c4 (commande et gardes), par RECHERCHES

Base `d90bbf77` (tête de `recherches/l2-p1-c3`) ; branche `recherches/l2-p1-c4` ; commits `da94d8e5` (G0), `b961f49d` (tests rouges,
`record-binance-l2.d.mts`), `d711eb8b` (gel), `527eca6e` (fusion de `origin/lot/etude-suite` en `c31a6819` : PR #149 de c3 fusionnée
pendant le lot ; commit de fusion seul, arbre identique à `d90bbf77`, aucun changement), puis ce commit (G7). Poussé sur
`origin/recherches/l2-p1-c4`, aucune PR. Node v24.21.0. Aucun réseau : la commande n'ouvre rien dans ce lot ; sorties sous le dossier
temporaire du système, hors de tout arbre git ; aucune donnée de marché. `packages/rpc-guard/bin/rpc-guard.mjs` non touché.

## Périmètre livré

- `scripts/record-binance-l2.mjs` (180 lignes), `scripts/record-binance-l2.d.mts` (45), `test/l2-record.test.ts` (12 tests, 196 lignes).
  Aucun autre fichier de code touché : `scripts/l2/*` inchangés, les 44 tueurs de c1 à c3 gardent leur ligne.
- En-tête de discipline (modèle [K] l.1-30) ; arrêts nommés en liste fermée (`STOPS`, douze codes) ; drapeaux fermés des deux modes
  (point 23) ; liste admise d'environnement par plateforme (Q-P1-10 : win32 `SYSTEMROOT`, `TEMP`, `TMP` ; vide ailleurs), `execArgv` non
  vide et variables de mandataire refusés (`proxy_refused`), valeurs jamais écrites ; sortie hors de tout arbre git, telle que donnée et
  telle que résolue, racine absente comprise ; reprise admise dans une sortie L2 seule (`OUT_ENTRIES`, `journal.jsonl` présent) ;
  quota : alarme journalisée une fois à 70 %, arrêt `quota_stop` à 85 %, espace libre au départ (`disk_short`) ; parcours de `--out`
  borné en profondeur (`WALK_DEPTH` = 3, `out_too_deep`), une entrée à la fois ; départ par chemins réels ; après les gardes, arrêt nommé
  `not_built` (Q-C4-1).
- Écart au G0 : aucun.

## Preuves

- `node scripts/red-proof.mjs --base d90bbf77 --gel d711eb8b --repo /home/user/monark-governance-c4 --draw 12 --seed 37` : « red-proof
  OK: 12 judged, 0 unchanged, 12 killer(s) drawn » ; `RED-PROOF.json` sha256 `8c4c89ff3e6118c7…`. Douze tests F2P (rouges par assertion
  à la base : l'import dynamique de la commande est affirmé) ; les douze tueurs tirés, tous tués.
- Contre le nouveau tronc : `--base c31a6819 --gel HEAD --draw 12 --seed 37` (HEAD = `527eca6e`) : « red-proof OK: 12 judged,
  0 unchanged, 12 killer(s) drawn » ; sha256 `839f622fd60ef9b9…` ; douze F2P, douze tués.
- Ancres : `verifie-ancres.mjs . --touched c31a6819 HEAD` (et `d90bbf77 HEAD`) : 12 tueurs, 12 ANCRE, 0 DERIVE, 0 PERDU ; avec `--files
  test/l2-day.test.ts,test/l2-derive.test.ts,test/l2-canon.test.ts,test/l2-record.test.ts` : 56 tueurs, 56 ANCRE.
- Tueurs appliqués à la main avant le gel, un à la fois, le test seul rejoué, fichier restauré : les douze rougissent par assertion
  (`ERR_ASSERTION`).
- `node --test test/l2-*.test.ts` : 107 sur 107. `npm test` complet, une fois, dans le worktree : 2 313 tests, 2 291 réussis, 0 échec,
  22 ignorés, sortie 0.
- `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- R-25 (`r25()` de `scripts/oracle/r25.mjs`, base `c31a6819`, puis `d90bbf77`, même compte) : `STAT` 421 (421 insertions,
  0 suppression) ; détail : commande 180, `.d.mts` 45, tests 196. Borne du lot 547, marge 126 ; `CONTENT_STAT` 0 ; GREEN. Plan : 301 à
  394 ; écart déclaré au G0 (reprise L2, racine absente, borne du parcours ; douze tests à un tueur).
- Mesures du parcours de `--out` (G0, point 6) : mémoire constante (+8,8 à +13,1 Mo de RSS maximal de 1 001 à 400 001 fichiers),
  environ 3,3 µs par fichier (1,3 s à 400 001).

## Questions pour la cellule (défauts appliqués, aucune bloquante ; texte au G0)

Q-C4-1 (`not_built` après les gardes, jamais une sortie 0 vide), Q-C4-2 (reprise par les noms de `OUT_ENTRIES` et `journal.jsonl` ; la
garde de sortie neuve du rejeu à c6), Q-C4-3 (tailles apparentes, pas les blocs ; écart à mesurer avec L2-DISK-QUOTA-1), Q-C4-4 (`exists`
et `real` de l'appelant pour le seul test de la racine absente), Q-C4-5 (empreinte de la commande au `script_sha256` du jour en c5),
Q-C4-6 (alarme une fois par processus, arrêt sans écriture), Q-C4-7 (le rejeu ne passe pas la garde d'environnement).

## Notes pour la suite

- c5 :
  - remplace la ligne `not_built` de `run` par la boucle, à partir du plan de `prepare` (couture inchangée) ;
  - écrit la ligne `start` (Q-C1-10) avant toute ouverture, puis appelle `check()` du quota à son rythme (un parcours coûte environ
    3,3 µs par fichier) et journalise son arrêt propre sur `quota_stop` ;
  - ajoute la commande au `script_sha256` du manifeste du jour (Q-C1-8, Q-C4-5) ;
  - reprend du G7 de c3 : n-5 (une seule `scale`, garde de clés disjointes), n-7, n-3 (durée du scellé), et L2-MINUTES-SIZE-1 (mesure
    conjointe sous `MemoryMax=512M`, ou bornes provisoires `MINUTES_BOUND` 64 Mio et `bound` de `canonDay` 32 Mio) ; du G7 de c2 :
    L2-SNAPSHOT-RELOAD-1 (contrat d'écriture de `rest/`) et L2-REPLAY-INTERLEAVE-1 (M-1).
- c6 : la garde de sortie du rejeu (sortie neuve) et la vérification des empreintes avant toute écriture ; `parseArgs` rend déjà
  `fromRaw`, `symbol`, `day`, `out`.
- P3 : liste admise linux mesurée sous l'unité (Q-P1-10) ; d'ici là, un lancement sous une unité s'arrête, `env_refused`.
- Items : SERIES-ENV-ALLOWLIST-1 et SERIES-PROXY-GUARD-1 (construits pour l'enregistreur L2 : `l2_guard_env_allowlist`,
  `l2_guard_proxy_and_flags_refused`) ; SERIES-ABSENT-ROOT-TEST-1 (`l2_guard_out_absent_root`, sous POSIX par simulation) ;
  MAIN-GUARD-REALPATH-1 (`l2_main_runs_by_real_path`) ; L2-DISK-QUOTA-1 (seuils de Q-11 en place, quota fixé sur M-1).
- MAST FM-1.2 : `l2_guard_env_allowlist`, `l2_guard_out_outside_git`, `l2_quota_alarm_and_stop`, `l2_main_runs_by_real_path`.
