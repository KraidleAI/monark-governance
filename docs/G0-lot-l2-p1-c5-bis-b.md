# G0 du lot P1-c5-bis-b du chantier L2 : la boucle d'enregistrement (horaires, REST, carnets et bascule, ancres, scellés, arrêt propre)

- **Rattachement** : ADR-L2-CAPTURE-1 (D-8, D-9, D-17, D24-2, D24-3, D24-5) ; plan `docs/G0-partie-l2-p1.md` §3 points 6, 13, 14, 15,
  16 et 22, §4.3, §7, §8.2 (ligne P1-c5 : `l2_record_loop_schedules`, `l2_record_loop_clean_stop`), §11 (Q-P1-6) ; G0 et G7 de
  c5-bis (Q-C5B-1 : scission, ce lot en est la seconde partie, « Notes pour c5-bis-b ») ; G0 et G7 de c4 et c5 ; G2 de c4 (n-3), de c5
  (m-5, racine fixée), de c5-bis-a (B-1, Q-C5B-4) dans `recherches/coordination/pieces/2026-10-04-G2-recherches/`.
- **Base** : `b141e87c` (tête de `recherches/l2-p1-c5-bis`, c5-bis-a, en G2 au moment de l'ouverture ; ses plis éventuels seront
  fusionnés ici par un commit de fusion, jamais rebasés). Branche `recherches/l2-p1-c5-bis-b`. Auteur : RECHERCHES. Aucun réseau vers une
  place : `fetch` et la fabrique WebSocket sont injectés par les tests (réponses scriptées en mémoire, sockets menées à la main) ; sorties
  sous le dossier temporaire du système, hors de tout arbre git ; trames synthétiques seules, aucune série de marché au dépôt.

## Taille et point de scission

Estimation de c5-bis (G0 de c5-bis) : 365 à 440 lignes pour ce lot. Mesure au brouillon contre `b141e87c` (insertions plus suppressions,
hors `docs/**/*.md`, `r25()` de `scripts/oracle/r25.mjs` une fois commis) : environ 327 (commande +117 nettes, `.d.mts` 26, `seal.mjs`
4/4, `seal.d.mts` 1/1, tests 150, `l2-record.test.ts` 3/3). Sous 547 avec environ 220 de marge : **aucune nouvelle scission** n'est
déclarée. Si le pli de la G2 de c5-bis-a (B-1) fusionné ici fait passer le lot au-dessus de 547, le point de scission est déclaré dès
maintenant : les tests et le code de la suspension de poids (Q-P1-6) et de la règle de bascule partent dans un lot c5-bis-c, la boucle,
ses horaires et son arrêt propre restant ici.

## Contenu

Fichiers : `scripts/record-binance-l2.mjs` et `.d.mts` ; `scripts/l2/seal.mjs` et `.d.mts` ; `test/l2-loop.test.ts` (cinq tests ajoutés à
la fin, un test de c5 resserré) ; `test/l2-record.test.ts` (`l2_main_runs_by_real_path` : le `not_built` vérifié en rejeu, la ligne de son
tueur renumérotée). Les lignes portant les tueurs de c4, c5 et c5-bis-a ne bougent pas : en-tête, imports et `STOPS` changés en place, le
code neuf entre `markTails` et `run`.

1. **`run` en enregistrement** : `prepare`, `adopt` (racine fixée `at`), `markTails(at)`, puis `record()`. Le rejeu (`--from-raw`) s'arrête
   encore `not_built` (c6). La commande ne s'arrête plus `not_built` en enregistrement.
2. **Composition** (G7 de c5-bis-a, « Notes pour c5-bis-b ») : un client REST (`createRest`, `out: at`) ; un carnet par symbole
   (`createBook`, `out: at`) ; cinq liaisons (`openLink`, quatre spot et `/market`, `out: at`), leur crochet `onText` vers `book.feed`.
   Au départ, avant les liaisons : l'heure de la place, puis `exchangeInfo` des quatre symboles (échelle et `rateLimits` du jour et, dans la
   dernière heure du jour, du suivant).
3. **Règle de bascule** (Q-A4-3, D-8, §4.3) : le carnet suit la première connexion qui lui livre une différence ; une différence d'une
   autre connexion (une fois le carnet nourri, `feed` vrai) le fait basculer, `book.switchTo(cid)` puis `link.switched(cid)`, quand le
   carnet n'est pas synchronisé, ou quand son `U` ≤ identifiant + 1 (la neuve a rejoint le carnet), ou quand la liaison ne tient plus la
   connexion suivie (`closed(from, "")` : vrai dès que son écrivain est fermé ; reprise non planifiée, la rupture est nommée par le
   carnet). La liaison ferme l'ancienne (« renewed ») après le chevauchement de 60 s.
4. **Calendrier** (`SCHEDULE`, `calendar(from, to, offset)`, horloge de l'hôte) : coupe de chaque écrivain à l'heure pleine (D24-3) ;
   scellés à HH:03 ; heure de la place à la minute 30 (point 13, écart journalisé par `logTimeOffset`, gardé) ; `check()` toutes les
   10 min à la minute 5 (n-3 de c4 : marche synchrone, environ 1 s à 300 000 fichiers, hors des coupes, de la minute 30 et des ancres) ;
   `exchangeInfo` à 23:58:00 + 10 s × rang et ancres à 23:59:10 + 10 s × rang, sur l'horloge de l'hôte corrigée du dernier écart (points
   14, 15). Les reconnexions planifiées (point 6) restent celles des liaisons. Un seul minuteur, réarmé sur le prochain événement.
5. **Ancres** (D-9, Q-C1-7) : `depth` par le client REST (gardé sous `rest/` par b1), mêmes octets écrits en `anchor-close.json` du jour
   de la place et `anchor-open.json` du suivant (`wx` : une ancre n'est jamais réécrite).
6. **Scellés au calendrier** : à 00:03, les quatre symboles du jour d'avant entrent en attente ; à chaque HH:03, un symbole à la fois,
   par un seul appel enveloppé (`apart`) de `sealApart` : spécification sans fonction, `open` = les `cid/seg` de la fenêtre du jour qu'un
   écrivain d'une liaison tient ouverts (`closed()`, Q-C1-5, lus sur `conn/`), échelle et `config` (`tickSize`, `scale`, `rateLimits`)
   de l'`exchangeInfo` de la veille. Attente (segments ouverts, grâce) : l'heure suivante. Scellé : `day_sealed` ; échec (arrêt nommé de
   l'enfant, mort, pas d'échelle) : `seal_failed`, le jour laissé au rejeu (c6).
7. **Suspension de poids** (Q-P1-6, Q-B1-3) : une limite `REQUEST_WEIGHT` lue sous `WEIGHT_FLOOR` = 4 000 suspend toute reprise des
   carnets, nommée (`weight_suspended`, puis `weight_resumed` à la première lecture au moins égale) : le client vu par les carnets dit
   sa suspension jusqu'après la ronde suivante d'`exchangeInfo` et refuse leurs instantanés ; les ancres restent prises.
8. **Échec d'un horaire** : journalisé (`schedule_failed`, code seul) ; un arrêt nommé de la commande (`quota_stop`, `out_not_l2` de
   `check()`) termine la boucle ; un client REST arrêté (451 et les arrêts de b1) termine tout (`rest_stopped`, nouveau code de `STOPS`,
   §4.3).
9. **Arrêt propre borné** (Q-8 de a3) : sur le signal (SIGTERM, SIGINT ; `io.signal` aux tests) ou un arrêt nommé : minuteur annulé,
   liaisons arrêtées, leurs écrivains attendus au plus `STOP_BOUND_MS` = 30 s ; carnets et REST fermés ; un enfant de scellé attendu au
   plus 30 s, puis tué (signal d'abandon passé à `sealApart`) ; une ligne `stopped` (`cause`, `links_closed`, `seal_done`). Signal : la
   commande sort 0 ; arrêt nommé : sortie 1, après l'arrêt propre.
10. **Q-C5B-4 révisée** (G2 de c5-bis-a) : `scripts/l2/seal-child.mjs` entre au `script_sha256` du jour.

## Points renvoyés à c5-bis-b

| Point | Source | Suite |
|---|---|---|
| n-3 de c4 (rythme de `check()`) | G2 de c4 | ici, point 4 |
| Q-P1-6, Q-B1-3 | plan §11, G0 de b1 | ici, point 7 |
| Q-A4-3 (bascule, `switched`) | G7 de a4, G0 de c5-bis | ici, point 3 |
| Q-8 de a3 (borne de `stop()`) | G1 de a3 | ici, point 9 |
| D24-3 (coupe à l'heure pleine), Q-C1-5, Q-C1-7 (ancres) | c1, c5-bis-a | ici, points 4 à 6 |
| racine fixée passée aux modules a3, b1, b2 | G2 de c5 | ici (`out: at`) ; l'enfant de scellé : point 6 et Q-C5BB-4 |
| B-1 de la G2 de c5-bis-a (racine dans l'enfant, échéance) | G2 de c5-bis-a | pli sur `recherches/l2-p1-c5-bis` par un autre agent ; fusionné ici s'il arrive, l'appel enveloppé (`apart`) adapté |
| Q-C5B-4 (`seal-child.mjs` au `script_sha256`) | G2 de c5-bis-a | ici, point 10 |
| n-1 de la G2 de c5, L2-TLS-PEER-UNATTESTED-1 | G2 de c5, G7 de b1-bis | inchangés (M-1 ou c6) |

## Tests (`test/l2-loop.test.ts`, à la fin), tueurs (un par test, forme close ; lignes du brouillon, gel à confirmer)

Un hôte mené à la main (`host()`) : horloge et minuteurs injectés, `fetch` répondu en mémoire (jamais le réseau), sockets à la main qui
reçoivent `{}` (spot toutes les 20 s, `/market` toutes les 8 min : aucun chien de garde ne part), scellé injecté. Chaque test affirme
d'abord `calendar` : la base, sans boucle, rougit par assertion.

- `l2_record_loop_schedules` (FM-1.1) : départ à 23:20 du jour D, place en avance de 5 s, jusqu'à 02:15 de D + 1 : requêtes aux heures
  de §3, ancres aux mêmes octets (fermeture de D, ouverture de D + 1), coupe à l'heure (à 00:03 seul le segment de 00 h est ouvert ; la
  liaison `/market`, muette de 23:56 à 00:04, prouve la coupe), scellé de D à 01:03 à l'échelle de D, une fois, `check()` à 02:15 (une
  entrée étrangère : `out_not_l2` après l'arrêt propre). Tueur : `// killer: scripts/record-binance-l2.mjs:276 CONST "(86_350 + 10 * r)" ->
  "(86_340 + 10 * r)"`.
- `l2_record_loop_clean_stop` (Q-8 de a3) : disque bloqué et scellé sans fin ; signal à 00:03:10 : cinq fermetures `stopped`, puis la
  ligne `stopped` à 00:04:10 (30 s + 30 s), enfant tué. Tueur : `SDL "  if (!sealDone) abort.abort();" -> ""`.
- `l2_record_weight_suspended` (Q-P1-6) : limite 3 999 puis 4 000 : aucune tentative vaine, instantané après la ronde de 23:58. Tueur :
  `CONST "low === null ? rest.suspendedUntilUs : " -> ""`.
- `l2_record_switch_rule` (Q-A4-3) : renouvellement (bascule, puis `renewed`) et reprise non planifiée (bascule aussitôt, rupture
  nommée). Tueur : `CONST "links.get(symbol).closed(from, \"\")" -> "false"`.
- `l2_record_rest_stop_ends_all` (§4.3, et `markTails` au départ de `run`) : 451 sur `exchangeInfo` : `rest_stopped`. Tueur : `CONST
  "if (rest.stopped) stop(" -> "if (false) stop("`.
- Resserré : `l2_seal_hashes_the_command` (Q-C5B-4) attend `scripts/l2/seal-child.mjs` ; son tueur (`seal.mjs:31`) inchangé.

## Preuve rouge, contrôles

Commit de ce G0 ; commit des tests seuls (rouges, avec les `.d.mts`) ; gel ; `node scripts/red-proof.mjs --base b141e87c --gel <gel>
--repo <worktree> --draw n --seed 37` (les tests resserrés que l'outil refuse : tueurs appliqués à la main) ; mutants propres ; ancres
par `verifie-ancres.mjs . --touched b141e87c HEAD` ; tests L2 ; `npm test` complet (liens `@monark/*` propres au worktree) ; `tsc`,
`lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.

## Questions (défaut retenu ; aucune ne touche la zone de MONARK ni une surface servie ou publique)

- **Q-C5BB-1** : pas de nouvelle scission (environ 327 lignes) ; point de scission c5-bis-c déclaré ci-dessus au cas où le pli de B-1
  ferait dépasser 547. (défaut : oui)
- **Q-C5BB-2** : couture de test étendue au-delà du point 22 : minuteurs aussi pour les liaisons et la borne d'arrêt, `sleep` des
  carnets, ouvreur de fichiers des segments, scellé, signal d'arrêt ; jamais par la ligne de commande ni l'environnement. (défaut : oui)
- **Q-C5BB-3** : constantes neuves : scellés à HH:03, `check()` toutes les 10 min à la minute 5, `STOP_BOUND_MS` 30 s (deux fois au
  pire, sous les 90 s de `TimeoutStopSec` par défaut de systemd), `WEIGHT_FLOOR` 4 000 (strict : « sous 4 000 »). (défaut : oui, revues
  sur M-1)
- **Q-C5BB-4** : l'enfant de scellé reçoit le chemin réel fixé, pas `at` (son descripteur ne traverse pas, B-1 de la G2 de c5-bis-a) ;
  une fenêtre de chemin re-résolvable reste jusqu'au pli de B-1, qui passe la racine en descripteur hérité ; l'appel est enveloppé en un
  seul point pour l'adapter. (défaut : accepté, déclaré)
- **Q-C5BB-5** : la suspension de poids ne vise que les reprises des carnets ; les ancres (4 × 250) restent prises. (défaut : oui)
- **Q-C5BB-6** : un jour n'est scellé par la boucle que si elle tourne à 00:03 du lendemain ; sinon (arrêt, départ plus tard), il reste au
  rejeu (c6). Un jour sans échelle lue : `seal_failed` (`no_scale`). (défaut : oui)
- **Q-C5BB-7** : `closed(from, "")` (aucun segment ne s'appelle `""`) dit qu'une liaison ne tient plus `<from>` ; pas de méthode neuve
  dans `links.mjs`. (défaut : oui)
- **Q-C5BB-8** : les lignes neuves du journal (`weight_suspended`, `weight_resumed`, `schedule_failed`, `day_sealed`, `seal_failed`,
  `stopped`) n'entrent pas dans `MISSING_EVENTS` de c1 (aucune n'est un trou de données). (défaut : oui)
- **Q-C5BB-9** : `l2_main_runs_by_real_path` vérifie `not_built` en rejeu : en enregistrement, `main` sans couture ouvrirait le réseau.
  (défaut : oui)
