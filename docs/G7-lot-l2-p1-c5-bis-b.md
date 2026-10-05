# G7 du lot L2-P1-c5-bis-b (la boucle d'enregistrement), par RECHERCHES

Base `b141e87c` (c5-bis-a à l'ouverture), puis `c6cf927a` (tête de `recherches/l2-p1-c5-bis` après le pli de sa G2 BLOQUE, fusionnée ici
par le commit de fusion `e46ad8d4`, aucun rebase) ; branche `recherches/l2-p1-c5-bis-b` ; commits `b5ada9cc` (G0), `c07226e2` (tests
rouges et `.d.mts`), `559a85bc` (gel), `0cab77fb` (pli de la preuve rouge), `32af72a2` (pli des portes), `b9eef86d` (pli du `npm test`
complet), `e46ad8d4` (fusion), `c9479b9f` (test rouge du verrou), `dd9561c3` (adaptation au `sealApart` plié et verrou par jour), `0d3dc619`
(pli des tueurs à la main : le verrou tenu pendant chaque scellé), puis ce commit (G7). Poussé sur `origin/recherches/l2-p1-c5-bis-b`, aucune PR. Node v24.21.0. Aucun réseau vers une place : `fetch` répondu en mémoire,
sockets menées à la main ; sorties sous le dossier temporaire du système, hors de tout arbre git ; trames synthétiques seules.
`packages/rpc-guard/bin/rpc-guard.mjs` non touché.

## Périmètre livré

- `scripts/record-binance-l2.mjs` : `run` en enregistrement (`prepare`, `adopt`, `markTails`, `record`) ; le rejeu s'arrête encore
  `not_built` (c6). `record()` : REST, carnets, cinq liaisons sous la racine fixée ; `onText` vers `book.feed` et la règle de bascule
  (`switchTo` puis `switched`) ; `SCHEDULE` et `calendar()` (coupe à l'heure, scellés à HH:03, heure de la place à la minute 30,
  `check()` toutes les 10 min à la minute 5, `exchangeInfo` à 23:58:00 + 10 s × rang et ancres à 23:59:10 + 10 s × rang sur l'horloge
  corrigée) ; ancres en `anchor-close.json` et `anchor-open.json` (mêmes octets, `wx`) ; scellés un symbole à la fois par un seul appel
  enveloppé (`apart`) de `sealApart`, `open` lu sur `conn/` et `closed()`, échelle et `config` de la veille ; suspension de poids sous
  4 000 (Q-P1-6) ; `rest_stopped` ; arrêt propre borné (30 s pour les écrivains, 30 s pour l'enfant, puis tué) ; ligne `stopped`. En-tête,
  imports et `STOPS` changés en place ; code neuf entre `markTails` et `run`.
- `scripts/record-binance-l2.d.mts` : couture (`fetch`, `webSocket`, minuteurs, `sleep`, `open`, `seal`, `signal`), `Stopped`,
  `WEIGHT_FLOOR`, `STOP_BOUND_MS`, `SCHEDULE`, `calendar`, `record`.
- `scripts/l2/seal.mjs` : `seal-child` au `script_sha256` (Q-C5B-4 révisée par la G2 de c5-bis-a) ; le `signal` ajouté à `sealApart` au
  gel est remplacé, à la fusion, par celui du pli (racine en fd 3, échéance `SEAL_TIMEOUT_MS`, abandon nommé `seal_aborted`).
- Verrou par jour (n-4 de la G2 de c5-bis-a) : `days/<SYMBOLE>/.<jour>.seal.lock` écrit avant l'appel, retiré après (`finally`) ; un
  verrou plus jeune que `SEAL_TIMEOUT_MS` (900 s, horloge réelle, `mtime`) fait attendre le scellé à l'heure suivante ; plus vieux, il est
  repris (risques déclarés plus bas). Un jour sans échelle (`no_scale`) ne prend pas de verrou.
- `test/l2-loop.test.ts` : six tests ajoutés (hôte mené à la main, dont `l2_record_seal_locked_per_day`),
  `l2_seal_hashes_the_command` resserré, `l2_record_loop_schedules` voit le verrou tenu pendant chaque appel du scellé ; `test/l2-record.test.ts` :
  `l2_main_runs_by_real_path` fait tourner la boucle jusqu'à son signal (sortie 0), tueur renuméroté `:287` → `:404`.

La commande ne s'arrête plus `not_built` en enregistrement.

## Points renvoyés à c5-bis-b

| Point | Suite | Preuve |
|---|---|---|
| FM-1.1, horaires de §3 (points 13 à 15), D24-3, D24-5 | calendrier, ancres, scellés | `l2_record_loop_schedules` |
| Q-8 de a3 | arrêt propre borné, enfant tué | `l2_record_loop_clean_stop` |
| Q-P1-6, Q-B1-3 | suspension nommée sous 4 000 | `l2_record_weight_suspended` |
| Q-A4-3, D-8 | bascule et `switched` | `l2_record_switch_rule` |
| §4.3 (451 arrête tout), Q-C1-4 au départ de `run` | `rest_stopped` ; `markTails` appelé | `l2_record_rest_stop_ends_all` |
| n-3 de c4 | `check()` toutes les 10 min à la minute 5 | `l2_record_loop_schedules` (arrêt à 02:15) |
| Q-C5B-4 (G2 de c5-bis-a) | `seal-child.mjs` au `script_sha256` | `l2_seal_hashes_the_command` |
| B-1 de la G2 de c5-bis-a | pli fusionné (`e46ad8d4`) ; l'unique appel `apart` passe la racine `at` d'`adopt` (fd 3 de l'enfant), le signal de l'arrêt propre ; Q-C5BB-4 close | tests du pli (`l2_seal_apart_through_the_pinned_root`…) |
| n-4 de la G2 de c5-bis-a (enfant orphelin) | verrou par jour `days/<SYMBOLE>/.<jour>.seal.lock` (`wx` non : écrit, retiré après le scellé ; plus jeune que `SEAL_TIMEOUT_MS` : le scellé attend l'heure suivante) | `l2_record_seal_locked_per_day` ; `l2_record_loop_schedules` (verrou présent pendant chaque appel) |
| n-5 de la G2 de c5-bis-a (`write_failed`) | déclaré, non construit : le jour échoue nommé (`tail_unmarked` dans `seal_failed`), laissé au rejeu (c6) ; marquage de la queue d'un écrivain arrêté en cours de route renvoyé à M-1 | — |

## Preuves

- **Paire du verrou** (test rouge `c9479b9f` sur le code de la fusion, correction `dd9561c3`) : `node scripts/red-proof.mjs --base
  e46ad8d4 --gel dd9561c3 --repo /home/user/monark-governance-c5bb --draw 1 --seed 37` : « red-proof OK: 1 judged, 72 unchanged, 1
  killer(s) drawn » ; F2P `l2_record_seal_locked_per_day`, tueur `scripts/record-binance-l2.mjs:322 CONST` tué ; `RED-PROOF.json` sha256
  `3c0d48ec4b1ad521…`.
- **Tueurs à la main du verrou** (`test/l2-loop.test.ts`, fichier restauré à chaque fois) : condition d'âge retirée, `<` en `>` sur
  `SEAL_TIMEOUT_MS`, verrou hors de `days/<SYMBOLE>/` : rouges par `l2_record_seal_locked_per_day` ; `rmSync` du `finally` retiré : rouge par
  `l2_record_loop_schedules`. Le verrou jamais écrit (`writeFileSync` retiré) survivait aux deux tests : trou fermé en `0d3dc619`
  (`l2_record_loop_schedules` lit le verrou à chaque appel du scellé injecté) ; après ce pli, « jamais écrit », « retiré avant l'appel » et
  « jamais retiré » sont rouges par ce test.
- **Lot entier** contre la tête fusionnée de c5-bis-a (base de mesure du lot) : `node scripts/red-proof.mjs --base c6cf927a --gel 0d3dc619
  --repo /home/user/monark-governance-c5bb --draw 8 --seed 37` : « red-proof OK: 8 judged, 65 unchanged, 8 killer(s) drawn » ; huit F2P
  (`l2_seal_hashes_the_command`, `l2_record_loop_schedules`, `l2_record_loop_clean_stop`, `l2_record_weight_suspended`,
  `l2_record_switch_rule`, `l2_record_rest_stop_ends_all`, `l2_record_seal_locked_per_day`, `l2_main_runs_by_real_path`), les huit tueurs
  tués ; `RED-PROOF.json` sha256 `b988d0b4e20d7f77…`. Avant la fusion, contre `b141e87c` (gel `b9eef86d`) : « 7 judged, 53 unchanged, 7
  killer(s) drawn », sha256 `b85a34b058886326…`. Au premier gel `559a85bc`, l'outil refusait deux points, pliés en `0cab77fb` : le tueur
  du test de poids était équivalent dans ce test (« stillborn » : `lowUntil` tenait encore le carnet), retargeté sur la borne de la
  suspension ; `l2_main_runs_by_real_path`, changé en rejeu, était vert à la base (« self-confirming ») : il fait désormais tourner la
  boucle jusqu'à son signal, rouge à la base qui s'arrêtait `not_built`.
- Base : les tests au commit `c07226e2` contre le code de `b141e87c` : six rouges par assertion (`ERR_ASSERTION`) ; le test du verrou au
  commit `c9479b9f` contre le code de la fusion : rouge par assertion.
- **Ancres** (`verifie-ancres.mjs`) : `. --touched c6cf927a HEAD` et `. --touched b141e87c HEAD` : 73 tueurs, 73 ANCRE, 0 DERIVE, 0 PERDU ;
  `--files` sur les douze fichiers `test/l2-*.test.ts` : 168 tueurs, 168 ANCRE, 0 DERIVE, 0 PERDU.
- `node_modules/@monark` vérifié avant la suite complète : dossier réel de liens relatifs vers `packages/` et `apps/` de cet arbre.

| Vérification (tête `0d3dc619`, Node v24.21.0) | Résultat |
|---|---|
| `node --test test/l2-*.test.ts` | 168 sur 168, 0 échec, 0 sauté |
| `npm test` complet | 2 374 tests : 2 352 verts, 0 échec, 22 sautés (raisons nommées), sortie 0 |
| `tsc --noEmit` (`typecheck`) | 0 |
| `lint` | 0 |
| `lint:ratchet` | 69/69 |
| `gate:vocab` | OK (335 fichiers) |
| `lang:gate` | OK (0 occurrence hors exemption) |
| preuve rouge, paire du verrou | OK, 1 jugé, 1 tueur tué |
| preuve rouge, lot entier contre `c6cf927a` | OK, 8 jugés, 8 tueurs tués |
| ancres | 73/73 (touchés), 168/168 (`l2-*`) |
| R-25 contre `c6cf927a` | 348, GREEN, borne du lot 547 |

- **R-25** (`r25()` de `scripts/oracle/r25.mjs`, `.github/workflows/ci.yml`) : contre `c6cf927a` (tête fusionnée de c5-bis-a, la base
  de mesure du lot) `STAT` 348 (331 insertions, 17 suppressions), `CONTENT_STAT` 0, GREEN ; borne du lot 547, marge 199 : aucune scission
  à proposer. Estimation du G0 : environ 327, plus le verrou et ses tests.
- Un échec isolé de `l2_record_loop_schedules` sous la charge du `npm test` complet (les écrivains réels sur disque prenaient du
  retard sur l'horloge menée à la main) est plié en `b9eef86d` : l'hôte des tests crée les fichiers de segments sur le disque sans y
  écrire ; six exécutions parallèles sous quatre cœurs chargés : vertes ; le `npm test` complet de la tête est vert.

## Mutants du lot (au-delà des tueurs)

Rejoués sur les tests de la boucle, fichier restauré à chaque fois.

- Tués (26, sur deux passes ; deux visaient des lignes changées avant le gel) : coupe retirée ; phases du scellé, de l'heure de la place, de `check()` ; `exchangeInfo` hors de l'horloge corrigée ;
  écart non gardé ; jour de l'ancre d'ouverture ; `U <= id + 1` en `<` ; `switched` retiré ; `<` en `<=` sur 4 000 ; `WEIGHT_FLOOR`
  3 000 ; fin de la suspension (`+ 1 s` retiré, première lecture au lieu de la dernière) ; attente des segments ignorée ; jour d'avant
  ajouté à chaque heure ou jamais ; jour scellé non retiré ; fenêtre de `open` retirée ; signal non passé au scellé ; `STOP_BOUND_MS`
  20 s ; `markTails` retiré de `run` ; `config` retirée ; arrêt nommé d'un horaire ignoré ; `seal-child` hors du `script_sha256`.
- Trous trouvés et fermés avant le gel : jour d'avant au calendrier (le jour de départ seul était scellé : la boucle ajoute désormais le
  jour d'avant à 00:03, test prolongé jusqu'à 02:15) ; jour scellé deux fois (test prolongé) ; `config` et échelle de la veille (le
  `tickSize` change à 23:57 dans le test) ; `<=` sur 4 000 (limites 3 999 puis 4 000) ; `markTails` au départ de `run`.
- Survivants déclarés : `book.id === null ||` retiré (renouvellement pendant une synchronisation : la bascule attend la fin de
  l'ancienne, rupture nommée ; non construit en test) ; `followed.set` après bascule retiré (effet seulement à un second renouvellement) ;
  `rest.close()`, `b.close()`, `clearTimer(timer)` à l'arrêt (sans effet observable ici ; le dernier laisserait un tic au plus après
  l'arrêt) ; `signal.aborted` déjà vrai ; refus des instantanés pendant la suspension (le carnet attend déjà sa fin) ; `Math.max` du
  dernier tic (horloge qui recule) ; jour suivant lu au départ ; `wx` en `w` des ancres ; `no_scale` ; `if (finished)` dans les
  scellés ; `signal` passé par `sealApart` à `spawn` (le scellé des tests de la boucle est injecté ; le pli de B-1 apporte son propre
  arrêt et ses tests) ; `out: at` en `out: real` (le scellé des tests de la boucle est injecté ; `sealApart` ouvre l'un comme l'autre, seule la fixation diffère).

## Questions pour la cellule (défauts appliqués, aucune bloquante ; texte au G0)

Q-C5BB-1 (pas de nouvelle scission ; point c5-bis-c déclaré pour le cas du pli de B-1), Q-C5BB-2 (couture étendue), Q-C5BB-3 (constantes
neuves : HH:03, 10 min à la minute 5, 30 s, 4 000 strict), Q-C5BB-4 (close par la fusion du pli de B-1 : l'enfant reçoit la racine `at`, son fd 3),
Q-C5BB-5 (suspension des seules reprises), Q-C5BB-6 (jour scellé seulement si la boucle tourne à 00:03 du lendemain ; sinon c6),
Q-C5BB-7 (`closed(from, "")`), Q-C5BB-8 (lignes neuves hors `MISSING_EVENTS`), Q-C5BB-9 (`l2_main_runs_by_real_path` en boucle).

## Risques déclarés

- Verrou par jour sans `wx` : vérifier puis écrire n'est pas atomique. Deux boucles vivantes sur la même racine ne sont pas un cas du
  service (une unité systemd) ; le verrou vise l'enfant orphelin d'une boucle morte, dont le verrou reste plus jeune que `SEAL_TIMEOUT_MS`.
- Un enfant orphelin qui dépasserait `SEAL_TIMEOUT_MS` (900 s ; le plus lent mesuré, boucle vivante : 216 s) verrait son verrou repris par
  la boucle suivante : l'enfant n'a pas d'échéance propre (seul le parent le tue). Sous systemd, `KillMode=control-group` l'arrête avec
  son parent (P3).
- Le verrou lit l'horloge réelle (`Date.now()` contre `mtime`), non l'horloge menée par `io` : voulu (l'âge d'un fichier sur le disque),
  mais un saut de l'horloge du système fausse l'âge dans un sens ou l'autre.
- n-5 (ci-dessous) : un jour peut échouer `tail_unmarked` après un `write_failed` en cours de passage ; nommé, laissé au rejeu.
- Survivants des mutants listés plus haut.

## Notes pour la suite

- **Pli de B-1 fusionné** (`e46ad8d4`) ; si la relecture delta de c5-bis-a ajoute un pli, il est fusionné de même, l'appel `apart`
  revu.
- n-5 de la G2 de c5-bis-a : un segment déchiré par `write_failed` est refusé au scellé (`tail_unmarked`) jusqu'au départ suivant : la
  boucle ne relance pas `markTails` en cours de route ; le jour échoue nommé (`seal_failed`), laissé au rejeu. À trancher en M-1.
- c6 : rejeu `--from-raw` ; il scelle aussi les jours que la boucle n'a pas scellés (Q-C5BB-6).
- P3 : `OOMPolicy=continue` (note du G0 de c5-bis) ; `TimeoutStopSec` au moins 60 s plus marge (deux bornes de 30 s) ;
  `KillMode=control-group` gardé (n-4 : l'enfant meurt avec la boucle) ; n-7 (`oom_score_adj` de l'enfant) reste à P3.
- MONARK : rien de bloquant. Pour les relectures : `node_modules/@monark` d'un arbre de travail doit être un dossier de liens relatifs vers
  ses propres `packages/` et `apps/` (un lien vers un autre clone fait échouer les tests du sentinel sans rapport avec le lot).
