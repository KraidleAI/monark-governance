# G7 du lot L2-P1-c1 (jour et scellé), par RECHERCHES

Base `721b1d50` (`lot/etude-suite`) ; branche `recherches/l2-p1-c1` ; commits `b41710d8` (G0), `6fde6d07` (tests rouges et
`day.d.mts`), `dc533ac1` (gel), `115b1342` (correction de `lang:gate`, une ligne de commentaire). Aucun push, aucune PR. Node v24.21.0.
Aucun réseau : segments écrits par l'écrivain de a2 sous le dossier temporaire du système, horloges injectées ; données synthétiques,
aucune série brute dans le dépôt. Tronc relu au G7 : `origin/lot/etude-suite` toujours en `721b1d50`, aucune fusion à faire.

## Périmètre livré (`scripts/l2/day.mjs`, `scripts/l2/day.d.mts`, `test/l2-day.test.ts`)

- Couture `sealDay({ out, symbol, day, nowUs, closed, config })`, appelée par c5 (horaires) et c6 (rejeu `--from-raw`) ; arrêts nommés
  `bad_symbol`, `bad_day`, `place_time_unsafe`, `day_sealed` (`DayStop`).
- Jour d'une trame spot par son `E` lu en microsecondes (l'URL pose `timeUnit=MICROSECOND`, a3), jamais d'après sa grandeur ; garde
  `Number.isSafeInteger` (condition (2)) : arrêt `place_time_unsafe` (`symbol`, `cid`, `seg`, `rank`), aucun dossier du jour, brut
  intact, les autres symboles se scellent.
- `@bookTicker` (Q-9, TL-4) : jour de la différence de la même connexion dont `[U;u]` (bornes fermées) contient son `u`, sinon jour de
  réception marqué `recv_day`. `/market` : jour de réception marqué `recv_day` (Q-C1-1) ; les `@forceOrder` d'un autre symbole sont
  écartés, une trame sans flux va à chaque symbole.
- Trames tardives (D24-5, `GRACE_US` = 120 s) : reçue à fin + grâce, dans son jour ; une microseconde après, à l'index du jour de
  réception, `late`, `of` = son jour, comptée. (Le plan §8.2 dit « une milliseconde » ; le G0 et le test tiennent la microseconde,
  plus fine.)
- Index du jour, `missing.json` (trous de liaison et événements de `MISSING_EVENTS`), manifeste (§3 point 19), puis `SHA256SUMS` en
  dernier (drapeau `wx`, format de `sha256sum -c`, segments par chemin relatif) ; un jour scellé n'est jamais réécrit.
- Écart au G0 : aucun sur le fond. Le gel citait en français le titre de §2.3 dans l'en-tête de `day.mjs` (l.2), touche de
  `lang:gate` ; corrigé en `115b1342` sur la même ligne, sans décalage : les sept tueurs gardent leur ancre.

## Lectures déclarées : questions pour MONARK (non bloquantes)

- **Q-C1-1** : tant que FAITS-L2-ACCESS-3-E-1 est ouvert, le jour d'une liquidation est-il bien son jour de réception, marqué
  `recv_day`, avec `time_unit` de `/market` nul au manifeste (plutôt que lire `E` en ms par déduction, ou arrêter le dérivé de
  `/market`) ? Un rejeu `--from-raw` réindexera ces trames quand l'unité sera établie.
- **Q-C1-2** : `missing.json` peut-il lire le journal (entrée enregistrée) pour les ruptures de chaîne que b2 journalise en ligne,
  index et jour venant du brut seul (Q-P1-8) ?
- **Q-C1-3** : la règle de Q-9 cherche-t-elle bien l'intervalle dans les différences de la MÊME connexion seulement (deux connexions
  en chevauchement portent chacune les leurs ; égalité des bornes entre hôtes renvoyée à M-5) ?
- **Q-C1-4** : contrat pour c5 accepté ? Une queue trouvée à la reprise (`checkTail` de a2) est journalisée `tail_marked` avec les
  champs de `Tail` ; c1 la passe au lecteur comme marque et la reporte au `missing.json`.
- **Q-C1-5** : `closed(cid, seg)` est-il bien à fournir par c5 (le disque seul ne dit pas qu'un fichier est encore ouvert) ?
- **Q-C1-6** : la fenêtre de lecture [début − 1 h ; fin + grâce] par heure de segment suffit-elle ? Limite : une trame dont l'heure de
  place précède sa réception de plus d'une heure n'entre dans aucun index ; item proposé L2-DAY-SCAN-WINDOW-1, mesure en M-6.
- **Q-C1-7** : amorce et ancres restent-elles hors de c1 (c2 rejoue, c5 écrit les ancres), `SHA256SUMS` listant tout fichier présent
  au dossier du jour au scellé, ancres comprises ?
- **Q-C1-8** : `script_sha256` = empreintes des cinq modules `scripts/l2/*.mjs` (`book`, `day`, `links`, `rest`, `segments`) jusqu'à la
  commande de c4, qui s'y ajoutera : d'accord ?
- **Q-C1-9** : l'index d'un jour tenu en mémoire au scellé est-il acceptable, sa taille mesurée en M-1 (c5 scelle dans un fil de
  travail, Q-5 de a2) ?

## Preuves

- `node scripts/red-proof.mjs --base 721b1d50 --gel dc533ac1 --repo /home/user/monark-governance-c1 --draw 7 --seed 37` : sortie 0,
  « red-proof OK: 7 judged, 0 unchanged, 7 killer(s) drawn » ; `RED-PROOF.json` sha256 `e2f565d5781cf712…`. Rejoué au HEAD
  `115b1342` (`--gel 115b1342`, mêmes tirage et graine) : même verdict, sha256 `cc8dcb1a3a4b685f…`.
- Les sept tests F2P (rouges par assertion à la base : l'import dynamique de `day.mjs` est affirmé) ; tueurs tirés, tous tués :
  `:130` CONST (`l2_day_index_by_event_time`), `:118` ROR (`l2_bookticker_day_rule`), `:137` ROR (`l2_day_late_frame_marked`), `:129`
  ROR (`l2_day_seal_waits_grace_and_segments`), `:67` CONST (`l2_day_missing_from_journal_and_chain`), `:103` CONST
  (`l2_manifest_time_unit_per_source`), `:104` SDL (`l2_place_time_unsafe_integer_named_stop`).
- Ancres : `verifie-ancres.mjs . --touched 721b1d50 HEAD` : 7 tueurs, 7 ANCRE, 0 DERIVE, 0 PERDU.
- Mutants à la main sur `day.mjs` (chacun seul, `l2-day` lancé, fichier restauré) :

| Mutant | Résultat |
|---|---|
| Q-9 sur les différences de toutes les connexions (l.115) | tué : `l2_bookticker_day_rule` |
| borne haute de Q-9 ouverte (`list[mid][1] < f.u` → `<=`, l.117) | tué : `l2_bookticker_day_rule` |
| `@forceOrder` d'un autre symbole gardé (l.99) | tué : `l2_day_seal_waits_grace_and_segments` |
| trou de liaison finissant pile au début du jour gardé (`h.to_us > start` → `>=`, l.73) | survit : borne non testée |

  Le survivant n'est pas équivalent : un trou fermé exactement à minuit ne coupe pas le jour (intervalle semi-ouvert) et le code
  l'écarte, mais aucun test ne le fixe. Proposé au G2 ou à c5 : un cas de `l2_day_missing_from_journal_and_chain` avec `to_us` = début
  du jour.
- `npm test` : `test:main` 2 218 tests, 2 196 réussis, 0 échec, 22 ignorés (sortie 0) ; `test:export` 1 sur 1 (sortie 0). Un
  premier passage de `test:main` a rougi `keep_cause_names_the_test_and_counts` (`test/keep-cause.test.ts`, hors du lot, inchangé
  depuis la base : la fixture a attribué l'exception « entre les tests » au lieu du test « b ») ; vert trois fois seul, puis vert au
  passage complet suivant : instabilité de minutage sous charge, signalée, non attribuable à c1.
- `tsc` 0 ; `lint` 0 erreur ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK (après `115b1342`).
- R-25 du lot (`scripts/oracle/r25.mjs`, base `721b1d50`) : `STAT` 373 (373 insertions, 0 suppression ; `day.mjs` 157, `day.d.mts`
  48, tests 168), borne du lot 547 (borne CI `VIBEGATES_PR_LIMIT` 1 205) ; `CONTENT_STAT` 0. Estimation du plan : 288 à 376, dans la
  fourchette.

## Notes pour la suite

- c5 : fournir `closed(cid, seg)` depuis les `closed` de ses écrivains, journaliser `tail_marked` (Q-C1-4), sceller dans un fil de
  travail (Q-C1-9).
- c6 : `--from-raw` rappelle `sealDay` ; à la clôture de FAITS-L2-ACCESS-3-E-1, `TIME_UNITS.market` et la lecture de `E` sur `/market`
  changent ensemble, et les jours de liquidations se réindexent depuis le brut.
- MAST FM-1.5 (jour scellé trop tôt) : preuve `l2_day_seal_waits_grace_and_segments`.
