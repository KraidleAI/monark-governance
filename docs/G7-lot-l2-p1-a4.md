# G7 du lot L2-P1-a4 (continuité et `/market`), par RECHERCHES

Base `0effb5b2` (`lot/etude-suite`) ; branche `recherches/l2-p1-a4` ; commits `05c5ca9b` (G0 et tests rouges) et `a6f703db` (gel).
Aucun push, aucune PR. Node v24.21.0. Aucun réseau ; place factice de P1-a1 et sockets pilotées à la main ; données synthétiques.

## Faits du G1 (FAITS-L2-ACCESS-3)

- (b) levé : origine des futures dans `ORIGINS`, route `/market/` exigée d'une liaison `market` ; flux en minuscules, lecture déclarée
  (Q-A4-1 du G0, ligne de FAITS due avant M-1).
- (c) levé : `serverShutdown` reconnu sous ses deux formes, combinée et brute, lu après la remise de la trame à l'écrivain ; aucun
  abonnement `!serverShutdown` ajouté à une URL (non écrit).
- (e) non établi, repli du plan appliqué (accord de MONARK, bascule de charge §3 point 2) : `marketUrl()` sans `timeUnit`, `time_unit`
  nul au journal ; FAITS-L2-ACCESS-3-E-1 reste ouvert (unité de `@forceOrder` au manifeste : c1).

## Livré (`scripts/l2/links.mjs`, `scripts/l2/links.d.mts`)

- `openLink({ …, kind })`, `kind` = `spot` (défaut) ou `market` (symbole `ALL`) ; arrêts `bad_kind`, `bad_symbol`, `host_refused`.
- Chien de garde du genre : 3 × 20 s en spot, 3 × 180 s (`FUTURES_PING_MS`) sur `/market`.
- Reconnexion planifiée à 23 h + 5 min × rang (0 à 3, 4 pour `/market`), âge compté depuis la tentative d'ouverture ; aussitôt sur
  `serverShutdown` de la connexion suivie. Journal `renew` (`age` ou `server_shutdown`).
- Chevauchement : l'ancienne se ferme (`renewed`) quand la neuve est ouverte depuis 60 s ET que `switched(cid)` a été appelé (c5,
  après `switchTo` de b2) ; `/market` n'attend pas de bascule. Sans bascule, l'ancienne reste ouverte jusqu'à la coupure de la place
  (ou son chien de garde), puis `overlap_break` (`to` = `<cid>` de la neuve ouverte, sinon nul) ; jamais rouverte. Un chevauchement à
  la fois : une reconnexion demandée pendant un chevauchement attend sa fin, puis part.
- PLAIN gardé à la l.39 (renvoi de `book.mjs` l.27 intact) ; en-tête de 21 lignes réécrit à longueur égale.

## Tests (`test/l2-continuity.test.ts`, quatre ; `keepCause` au chargement, dossier temporaire dans `before()`)

Écarts au G0, pliés avant le gel par mes propres mutants (table ci-dessous) :
- `l2_overlap_planned_raw` : la bascule est donnée à 10 s du chevauchement, l'ancienne reste ouverte à 60 s − 1 ms et se ferme à 60 s
  pile (sinon le tueur `OVERLAP_MS` survivait) ; le cas « jamais basculé, reste ouverte » est passé au test `serverShutdown`.
- `l2_server_shutdown_renews_at_once` : en plus, forme brute reçue par la neuve PENDANT le chevauchement (attend), puis coupure de
  l'ancienne : `close`, `overlap_break`, puis la reconnexion attendue, au même instant ; arrêt pendant un chevauchement : aucun minuteur
  restant.
- `l2_renewal_age_staggered_by_rank` : heures exactes des cinq `renew` ; arrêt : aucun minuteur restant (horloge factice).
- `test/l2-links.test.ts` : ses douze lignes de tueur suivent les lignes déplacées ; deux textes visés changent avec le code
  (`admitted` : `new URL(url).href.startsWith(route)` ; garde d'`onopen`, désormais `if (!c.live) return;`, SDL).

## Preuves

- `node scripts/red-proof.mjs --base 0effb5b2 --gel a6f703db --repo /home/user/monark-governance-a4 --draw 4 --seed 37` : sortie 0,
  « red-proof OK: 4 judged, 12 unchanged, 4 killer(s) drawn » ; les quatre tests F2P (rouges par assertion à la base, l'import par espace
  de noms ne casse pas le chargement) ; tueurs `:176` SDL, `:42`, `:45`, `:44` CONST tués ; `RED-PROOF.json` sha256 `4c20c58fde5e7350…`.
- Les douze tueurs de `l2-links.test.ts` rejoués à la main au gel, chacun seul : douze tués.
- Mutants à la main sur `links.mjs` (chacun seul, `l2-continuity` et `l2-links` lancés) :

| Mutant | Résultat |
|---|---|
| `RENEW_AGE_MS` − 1 | tué : `l2_overlap_planned_raw`, `l2_renewal_age_staggered_by_rank` |
| attente de la bascule ôtée de `retire` | tué : `l2_server_shutdown_renews_at_once` |
| attente des 60 s ôtée de `retire` | tué : `l2_overlap_planned_raw` |
| `overlap_break` jamais écrit ; `to` toujours nul | tués : `l2_server_shutdown_renews_at_once` |
| reprise de l'ancienne (`!followed` ôté) | tué : `l2_overlap_planned_raw`, `l2_server_shutdown_renews_at_once` |
| spot sans attente de bascule | tué : `l2_server_shutdown_renews_at_once` |
| deux chevauchements à la fois ; reconnexion en attente perdue | tués : `l2_server_shutdown_renews_at_once` |
| forme brute non reconnue ; mot seul suffisant | tués : `l2_server_shutdown_renews_at_once` |
| `switched` sans contrôle du `<cid>` | tué : `l2_overlap_planned_raw` |
| `bad_kind`, `bad_symbol` de `/market`, route `/market/` ôtés | tués : `l2_market_link_futures_watchdog` |
| rang de `/market` = 3 | tué : `l2_renewal_age_staggered_by_rank` |
| minuteur d'âge ou de chevauchement non effacé à la fermeture ; `stop` sans l'ancienne | tués (minuteurs restants) |
| minuteur de chevauchement armé sans ancienne | survit : équivalent (sans ancienne, `retire` ne fait rien) |

- Ancres : `verifie-ancres.mjs . --touched 0effb5b2 HEAD` : 16 tueurs, 16 ANCRE.
- `npm test` : 2 164 tests, 2 142 réussis, 0 échec, 22 ignorés (sortie 0) ; `tsc` 0 ; `lint` 0 erreur ; `lint:ratchet` 69/69 ;
  `gate:vocab` OK ; `lang:gate` OK.
- R-25 du lot (`scripts/oracle/r25.mjs`, base `0effb5b2`) : 352 (298 insertions, 54 suppressions), borne 547. Estimation du plan :
  151 à 197 ; écart : 32 lignes de tueurs de a3 déplacées, en-tête réécrit, tests plus longs (sockets pilotées, minuteurs comptés).

## Questions et notes pour MONARK (non bloquantes)

- **Q-A4-1** : casse des flux `/market` en minuscules, lecture déclarée ; ligne de FAITS due avant M-1 (précédent Q-7 de a3).
- **Q-A4-2** : `serverShutdown` sur `/market` non documenté pour les futures ; reconnu de même, sans effet s'il n'arrive pas.
- **Q-A4-3** : c5 doit appeler `switched(cid)` après `switchTo` du carnet et poser le crochet des trames vers le carnet (le `<cid>` de la
  neuve) ; sans cet appel, une liaison spot ne ferme jamais d'elle-même son ancienne connexion (rupture nommée à la coupure de la
  place, au plus 24 h).
- m-6 du G2 de a3 (l'URL porte-t-elle les flux du symbole ?) reste à c5 : a4 contrôle origine et route, pas les flux.
- TL-6 : la part brute (`l2_overlap_planned_raw`) est livrée ; avec `l2_half_open_watchdog_named` (a3) et `l2_overlap_switch_no_gap`
  (b2), TL-6 est complet pour le G7 de P1. TL-7a : la liaison `/market` est livrée, le test de composition reste en c6.
