# G7 du lot L2-P1-a3 (liaisons spot), par RECHERCHES

## 2026-10-04 : pli des écarts de test du G2 (m-1, m-2, m-3, m-5)

Lot `lot/l2-p1-a3`, base `3b09d766`, gel précédent `7ea82728`, nouveau gel `53da15fc` (un commit de tests ; `links.mjs` et
`links.d.mts` inchangés). Aucun G7 n'existait pour a3 : cette section en tient lieu, à côté du G1 de MONARK. Source des écarts :
rapport G2 de RECHERCHES du même jour (survivants H04, H16, H33, H22, H23, H25, H34, H10, H11).

### Ce qui est plié

- **m-1 (C-2, H04)** : `l2_backpressure_named_stop` avance l'horloge factice de 60 s pendant que le disque est bloqué, puis compte les
  appels de la fabrique (`asked` = 1). Une reprise armée par un minuteur pendant la vidange, et non à la fermeture de l'écrivain, rougit.
- **m-2 (H16, H33)** : `l2_reconnect_attempts_bounded` vérifie aussi qu'après `stop()` et l'avance, le journal ne gagne aucune ligne
  (le minuteur non annulé ne produisait qu'un `defer`, d'où le test vide).
- **m-3 (H22, H23)** : `l2_journal_filter_dot_colon` ferme trois connexions avec les raisons `127.0.0.1` (point seul), `::1` (deux-points
  seuls) et `ip-10-0-0-1` (nom sans point) ; les deux premières sont écrites `null`.
- **m-5 (H34, H25, H10, H11)** : `l2_stop_during_deferral` (arrêt pendant une ouverture différée), `l2_stop_waits_for_writers` (`stop()`
  attend la file de l'écrivain sur disque bloqué), `l2_events_after_close_ignored` (ouverture et message après la fermeture propre :
  rien au journal ; sans la garde de `onmessage`, l'écrivain fermé s'arrête en `writer_closed`, journalisé).
- Aides partagées : `stalled()` (disque bloqué) et `handLink()` (sockets factices pilotées à la main, jamais le réseau).

### m-3 : `ip-10-0-0-1` n'est pas une fuite au sens du plan

PLAIN (`links.mjs:39`) laisse passer les noms sans point (`localhost`, `ip-10-0-0-1`). Décision : **pas de fuite réelle, aucun
changement de code**. Raisons :
- La règle du plan pour le journal est « jamais une adresse » (§8.2, P1-a3 ; [A] l.225-227) ; l'en-tête de `links.mjs` la précise :
  IPv4, IPv6, hôte:port. Le plan distingue ailleurs adresse et nom d'hôte (§12.1) ; un nom d'une seule étiquette n'est pas une adresse.
- La garantie est structurelle : la liaison ne lit aucune adresse de socket et ne s'abonne pas au canal d'ouverture. PLAIN est un
  filet de caractères ; il ne peut séparer un nom sans point d'un mot (`write_failed`, `stopped`), ni d'ailleurs un entier qui
  coderait une IPv4. Seules la raison de fermeture et les extensions viennent de la place.
- Le test épingle ce comportement (ligne écrite telle quelle) avec un message qui renvoie ici : un filtre plus strict, s'il est voulu,
  changera ce test.

### Preuves

- `red-proof --base 3b09d766 --gel 53da15fc --repo /home/user/monark-governance-a3 --draw 12 --seed 37` : sortie 0, 12 tests jugés
  (tous `new-module`, le fichier étant neuf à la base), 12 tueurs tirés sur 12, tous tués, dont les quatre nouveaux (`:117`, `:147`,
  `:128`, `:39`).
- Mutants à la main (une ligne de tueur par test ne suffit pas : H04 touche deux lignes, et les autres partagent un test) : chacun
  appliqué seul à `links.mjs`, le fichier de test lancé entier, à l'ancien gel puis au nouveau, `links.mjs` restauré ensuite.

| Mutant | Changement | `7ea82728` | `53da15fc` |
|---|---|---|---|
| H04 | reprise armée dans `end()`, note `retry` laissée dans `.then` | survit | tué : `l2_backpressure_named_stop` |
| H16 | `io.clearTimer(timer)` ôté de `stop()` (:145) | survit | tué : `l2_reconnect_attempts_bounded`, `l2_stop_during_deferral` |
| H33 | `timer =` ôté (:108) | survit | tué : `l2_reconnect_attempts_bounded` |
| H34 | `timer =` ôté (:117) | survit | tué : `l2_stop_during_deferral` |
| H25 | `await Promise.all(closing)` ôté (:147) | survit | tué : `l2_stop_waits_for_writers` |
| H10 | garde `c.live` de `onopen` ôtée (:128) | survit | tué : `l2_events_after_close_ignored` |
| H11 | garde `c.live` de `onmessage` ôtée (:130) | survit | tué : `l2_events_after_close_ignored` |
| H22 | PLAIN admet `.` (:39) | survit | tué : `l2_journal_filter_dot_colon` |
| H23 | PLAIN admet `:` (:39) | survit | tué : `l2_journal_filter_dot_colon` |

- `node --test test/l2-links.test.ts` : 12 sur 12, cinq passes de suite ; `node --test test/l2-*.test.ts` : 26 sur 26 ;
  `npx tsc --noEmit` : sortie 0 ; `eslint test/l2-links.test.ts` : aucune erreur. Node v24.21.0.
- R-25 du lot (base `3b09d766`, les trois fichiers) : 520 (150 + 57 + 313), borne 547 ; ce document est hors compte (`docs/**/*.md`).

### Notés seulement

- **m-4** (équité de la porte : `c.got` posé avant `push()`) : dans Q-2 telle que tranchée ; pour c5/M-1.
- **m-6** (`openLink` ne vérifie pas que `url` porte les flux de `symbol`) : accepté par Q-6 ; a4 ou c5 le tiennent.
