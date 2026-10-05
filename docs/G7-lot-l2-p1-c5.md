# G7 du lot L2-P1-c5 (composition du scellé et prise de la sortie), par RECHERCHES

Base `854daf8f` (tête de `recherches/l2-p1-c4`, PR #151 ouverte, non fusionnée : `origin/lot/etude-suite` relu avant le push, toujours
`ab8084fb`, aucune fusion) ; branche `recherches/l2-p1-c5` ; commits `693272da` (G0), `2c4eae86` (tests rouges, `seal.d.mts`, types de la
commande et de `day.d.mts`), `d752b166` (gel), puis ce commit (G7). Poussé sur `origin/recherches/l2-p1-c5`, aucune PR. Node v24.21.0.
Aucun réseau : rien ne s'ouvre vers une place ; sorties sous le dossier temporaire du système, hors de tout arbre git ; trames
synthétiques seules, aucune série de marché au dépôt. `packages/rpc-guard/bin/rpc-guard.mjs` non touché.

## Scission

c5 du plan (186 lignes) plus les onze points que c1 à c4 lui renvoient dépassent 547 (700 à 790 estimées au G0). Le plan ne pré-déclare
pas de point de scission pour c5 ; le G0 le déclare avant tout code commis (Q-C5-1) : **ce lot**, composition du scellé et prise de la
sortie ; **P1-c5-bis**, la boucle d'enregistrement (horaires, liaisons, REST, chaîne, scellés dans un fil de travail, arrêt propre ;
tests `l2_record_loop_schedules` et `l2_record_loop_clean_stop`). La commande s'arrête encore `not_built` après ses gardes.

## Périmètre livré

- `scripts/l2/seal.mjs` (36 lignes, neuf) et `scripts/l2/seal.d.mts` (16) : `hookOf(scale, bounds)`, crochet de `sealDay` qui compose
  `bestTap`, `deriveDay` avec le `tap`, `canonDay` avec son résultat, à une seule échelle ; `mergeDerived` (clés de manifeste et de
  `missing.json` disjointes, sinon `stray_file`) ; `SEAL_BOUNDS` provisoires (64 Mio, 32 Mio) ; `sealOf`, la couture de c5-bis et de c6 ;
  modules `seal` et la commande hachés au `script_sha256` du jour (Q-C4-5).
- `scripts/record-binance-l2.mjs` (+49, −5) et `.d.mts` (+8) : `appendLine` (un ajout par descripteur `O_NOFOLLOW` dont `nlink` vaut 1 ;
  `ELOOP` nommé), `adopt` (journal d'une sortie reprise de cet enregistreur ; `--out` créé, chemin réel fixé, ligne `start` ; `check()` :
  chemin réel inchangé, gardes de `--out` refaites, `nlink` des deux journaux, puis le quota), m-8 dans `guardOut` (ligne changée en
  place), l'alarme de quota par `appendLine` (ligne changée en place). `run` inchangé.
- Changés en place, aucune ligne ajoutée : `scripts/l2/day.mjs` (`:23` import de `posix`, `:35` `snapshot_reload` aux `STOPS`, `:191`
  noms des modules par `posix.join`), `scripts/l2/derive.mjs` (`:13` en-tête, `:106` relecture vérifiée), `scripts/l2/day.d.mts` (un
  commentaire). `test/l2-record.test.ts` : la seule ligne du tueur de `l2_main_runs_by_real_path` renumérotée (`:197` → `:241`).
- `test/l2-loop.test.ts` (12 tests, 238 lignes, un tueur chacun).
- Écart au G0 : aucun.

## Points renvoyés à c5

| Point | Suite | Preuve |
|---|---|---|
| L2-MINUTES-SIZE-1 | mesure conjointe faite (G0 point 3) : échoue au pire cas sans plafond de tas ; bornes provisoires posées ; plafond du tas à c5-bis (Q-C5-3) ; item ouvert | `l2_seal_bounds_provisional` |
| L2-SNAPSHOT-RELOAD-1 | `snapshot_reload`, rien d'écrit ; item fermé par ce test | `l2_snapshot_reload_named` |
| n-5 de c3, ordre de composition | une `scale` ; clés disjointes ; `bestTap`, `deriveDay`, `canonDay` | `l2_seal_composes_replay_then_canon`, `l2_seal_parts_keys_disjoint` |
| n-3 de c3 | durée chiffrée : 45 s (index seul) à 190 s (composition, tas plafonné) au ras de la borne | G0 point 3 |
| n-6, n-7 de c3 | re-différés à M-1 (Q-C5-8) | — |
| Q-C4-5 | la commande et `seal.mjs` au `script_sha256` | `l2_seal_hashes_the_command` |
| m-8 de c4 | parent fichier : `out_not_l2` | `l2_guard_out_parent_file` |
| n-5 de c4 | première ligne du journal = `start` de cet enregistreur | `l2_adopt_journal_of_this_recorder` |
| n-5bis de c4 | `nlink` 1 aux ajouts de la commande et à chaque `check()` | `l2_append_single_link`, `l2_check_single_links` |
| n-7 de c4 | chemin réel fixé, revérifié (Q-C5-6) | `l2_check_real_path_pinned` |
| n-2 de c4 | gardes de `--out` à chaque `check()` | `l2_check_git_tree_again` |
| n-8 de c4 | `ELOOP` nommé `out_not_l2` | `l2_append_link_named` |
| n-3 de c4 | re-différé à c5-bis (horaire de la boucle) | — |

Re-différés à c5-bis, avec leur raison, au G0 (section « Re-différés ») : Q-P1-6 et Q-B1-3, Q-A4-3, Q-8 de a3, Q-C1-4, Q-C1-5, Q-5 de a2
et Q-C1-9 (avec le plafond de tas de Q-C5-3), Q-G2B-3 de c1, L2-TLS-PEER-UNATTESTED-1, m-7 du G7 de c1.

## Mesures de mémoire (L2-MINUTES-SIZE-1, G0 point 3)

Jour synthétique au ras de `INDEX_BOUND` (4 193 304 trames, 99,96 % de `@bookTicker`), `minutes.jsonl` de 58,6 Mio, passage de même clé
de 15 Mio ; `sealOf` ; cgroup v1 enfant à 512 Mio ; VmHWM :

| Cas | Sous le cgroup | Hors cgroup |
|---|---|---|
| index seul | scellé, 45 s, 374 Mio | 44 s, 315 Mio |
| index et minutes (`deriveDay`) | scellé, 94 s, 361 Mio | 81 s, 390 Mio |
| composition complète, bornes provisoires, tas par défaut (8 195 Mio) | **tuée (OOM)** à 129 s | 153 s, 566 Mio |
| la même, tas plafonné à 256 Mio / 192 Mio | scellé, 192 s, 467 Mio / 186 s, 476 Mio | — |
| bornes par défaut (minutes 128 Mio, passage 31 Mio), tas 256 Mio | **tuée (OOM)** | — |
| moitié de la borne d'index, bornes provisoires, tas par défaut | scellé, 87 s, 525 Mio | 81 s, 480 Mio |

Les données vivantes tiennent sous 512 Mio avec les bornes provisoires ; le tas par défaut de V8 ignore le cgroup et ne ramasse qu'à la
pression. D'où Q-C5-3 : le scellé de c5-bis tourne dans un `Worker` au tas plafonné par `resourceLimits`, jamais par un drapeau de node
(la garde d'`execArgv` de c4 refuserait le lancement). Données synthétiques effacées après la mesure, cgroup retiré.

## Preuves

- `node scripts/red-proof.mjs --base 854daf8f --gel d752b166 --repo /home/user/monark-governance-c5 --draw 12 --seed 37` : « red-proof
  OK: 12 judged, 21 unchanged, 12 killer(s) drawn » ; `RED-PROOF.json` sha256 `e53b7c2adf838e02…`. Douze tests F2P (rouges par
  assertion à la base : `seal.mjs` absent, `adopt` absent, relecture non vérifiée) ; les douze tueurs tirés, tous tués. Les 21
  « unchanged » sont les tests de c4, dont seule une ligne de tueur a changé.
- Tueurs appliqués à la main avant le gel, un à la fois, le test seul rejoué, fichier restauré et sha256 vérifié : les douze rougissent
  par assertion (`ERR_ASSERTION`).
- Ancres : `verifie-ancres.mjs . --touched 854daf8f HEAD` : 33 tueurs (12 neufs, 21 de c4), 33 ANCRE, 0 DERIVE, 0 PERDU ; avec `--files
  test/l2-day.test.ts,test/l2-derive.test.ts,test/l2-canon.test.ts,test/l2-record.test.ts,test/l2-loop.test.ts` : 77 tueurs, 77 ANCRE.
- `node --test test/l2-*.test.ts` : 128 sur 128. `npm test` complet, une fois, dans le worktree : 2 334 tests, 2 312 réussis, 0 échec,
  22 ignorés, sortie 0 (un premier passage rougissait 50 tests d'outils hors L2 parce que `node_modules` était un lien non suivi que
  l'outil des mutants lit comme un fichier ; refait avec un dossier de liens, ignoré par git : vert).
- `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- **R-25** (`r25()` de `scripts/oracle/r25.mjs`, `.github/workflows/ci.yml`, base `854daf8f`) : `STAT` 366 (354 insertions,
  12 suppressions) ; borne du lot 547, marge 181 ; `CONTENT_STAT` 0 ; GREEN. Plan : c5 186 ; écart déclaré au G0 (scission, points
  renvoyés).

## Questions pour la cellule (défauts appliqués, aucune bloquante ; texte au G0)

Q-C5-1 (scission c5 / c5-bis), Q-C5-2 (module neuf `seal.mjs`), Q-C5-3 (bornes provisoires ; scellé de c5-bis dans un `Worker` au tas
plafonné, 256 Mio mesurés), Q-C5-4 (`recorder` dans la ligne `start`), Q-C5-5 (n-5 dans `adopt` ; reste déclaré : l'alarme à 70 % au
départ peut précéder le refus), Q-C5-6 (n-7 par chemin réel fixé, pas d'`openat` en node), Q-C5-7 (n-5bis des modules contrôlé au rythme
de `check()`), Q-C5-8 (n-6 et n-7 de c3 à M-1), Q-C5-9 (`snapshot_reload`, nom dédié).

## Notes pour la suite

- c5-bis :
  - `run` : `prepare`, puis `adopt` (ligne `start` avant toute ouverture), puis la boucle ; `check()` à son rythme (n-3 de c4 : environ
    1 s à 300 000 fichiers, synchrone) ;
  - scelle par `sealOf({ scale, ... })` dans un `Worker` au tas plafonné (`resourceLimits.maxOldGenerationSizeMb` 256 au pire cas
    mesuré), `ERR_WORKER_OUT_OF_MEMORY` nommé ; refait la mesure de L2-MINUTES-SIZE-1 dans ce fil, sous le cgroup ; un scellé dure
    jusqu'à environ 190 s par symbole au ras des bornes : jamais sur le fil des liaisons ;
  - l'échelle passée à `sealOf` est celle d'`exchangeInfo` de la veille (Q-C2-8) ;
  - reste la liste « Re-différés » du G0.
- c6 : `--from-raw` appelle `sealOf` avec la même échelle et les mêmes bornes : le manifeste porte les mêmes `script_sha256`.
- Items : L2-SNAPSHOT-RELOAD-1 fermé par `l2_snapshot_reload_named` ; L2-MINUTES-SIZE-1 ouvert (mesure faite, échec sans plafond de tas ;
  clôture : la même mesure dans le fil de travail de c5-bis, puis sous l'unité en P3).
- MAST FM-1.1 de la ligne c5 du plan : la preuve `l2_record_loop_schedules` est à c5-bis.
