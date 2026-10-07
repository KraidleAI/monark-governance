# G0 - lot e2a-ca-trio (E-2a, trio de la CA kata) : `gate_version_1_0_0_call`, `gate_kata_call`, `gate_kata_policy_table`

- **Provenance** : rédigé par RECHERCHES (modèle `claude-opus-5-5`), ouvert le 2026-10-07T06:08:49Z (`date -u`). Actes git :
  `git fetch -q origin +refs/heads/lot/etude-suite:refs/remotes/origin/lot/etude-suite`, contrôle `git ls-remote origin
  refs/heads/lot/etude-suite` = `acbaeb527970667ad88a240b9e78ad507c873d7b` ; `git worktree add <scratchpad>/wt-catrio -b
  recherches/e2a-ca-trio origin/lot/etude-suite` ; `npm ci` dans le worktree (Node 24.21.0). Le checkout
  `/home/user/monark-governance` n'est pas touché.
- **Base** : `lot/etude-suite` @ `acbaeb52`. Toutes les ancres `fichier:ligne` ci-dessous sont à cette base.
- **Spécification** : `recherches/coordination/pieces/2026-10-07-R4-textes-figes/R4-TEXTS.md` section (iii) (texte de 1 968
  octets, sha256 `7e05ee5d…2bae`), choix de MONARK (`messages/2026-10-07-MONARK-vers-RECHERCHES-g2-r4.md`, « Mes choix », (iii)).
  Porteur du code (T-2, partage 80/20) : RECHERCHES.
- **Intention (une)** : la CA de déploiement (`scripts/verify-harness.mjs`) joue trois contrôles de plus, après tous les autres :
  (3) `gate_version_1_0_0_call` (400 `schema_version_unsupported`, sans horloge), puis (1) `gate_kata_call` (appel bien formé sur
  la clé sonde réservée `kata:ca-probe@ca-probe/BTCUSDT/1h`, 200 abstain `under_calib`) et (2) `gate_kata_policy_table`
  (`policy_table_sha256` du verdict de (1) = valeur épinglée, ancrée dans l'entrée publiée). 15 → 18 contrôles.
- **Ligne datée (RECHERCHES, 2026-10-07 10:26 UTC ; G2 delta de #225, MONARK `6a5584a`, constat m n°3 ; acceptation de MONARK
  `51fe3ee` l.22)** : amende l'en-tête l.9-10, le §5 (« Dépendance (E-2a, chargeur) ») et le §8 (« Item complété »). La
  spécification suivie est la v3 de R4 (`recherches` `bbd6f59`, section (iii)) : 2 141 octets, sha256 `ee274e55…cbb147`, non
  plus 1 968 octets et `7e05ee5d…`. La réservation de `ca-probe` dans le chargeur d'E-2a a deux moitiés, portées par RECHERCHES
  (G0 court d'E-2a v6.1, `94564c8`, §3.1 et §3.2). Le lecteur servi (`apps/harness/src/policy-committed.ts`, lot a1) appelle
  `kataKeyReserved` directement ; test T-1 ; item E2A-RESERVED-KEY-SERVED-1 ; déclencheur a1. L'écrivain hors ligne
  (`scripts/kata-tables.mjs`, lot b1) l'atteint par `guardKataTable` → `guardKataRow` → `kataKeyReserved` ; item
  RETIRE-LISTS-E2A-PIPE-1 ; déclencheur b1. Le test d'intégration du chemin servi de la réservation va avec T-1 (a1), non avec
  b1, et n'est pas dans ce lot. Le « Porteur : MONARK (inchangé) ; déclencheur : le G0 d'E-2a (inchangé) » du §8 ne vaut plus ;
  la ligne d'ETAT reste un acte de MONARK. Pli au §9.

## 1. Mesures faites (base `acbaeb52`, Node 24.21.0)

| Fait | Mesure |
|---|---|
| `zeroErrorFloor("0.01", "0.05")` | 299 (nMin imposé de `btc-range-1h`) |
| sha256 de `[]` | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| Appel (1) en processus, horloge à la grille + 30 s | 200, `action` abstain, `verdict.reason` under_calib, `n_calib` 0, `region` null, `cell_key` `kata:ca-probe@ca-probe/BTCUSDT/1h/b0`, `policy_row_sha256` null, `policy_table_sha256` `1296c333…f955f` |
| Appel (3) (`GATE_BODY`, version 1.0.0) | 400 `tool_error`, `schema_version_unsupported` |
| `scripts/spec-publish-inputs.json:35` | release `contract-1.1.0`, `contract-1.1.0/policy/btc-range-1h.json`, sha256 `1296c333…f955f` = sha256 du fichier = servi |
| `kataKeyProblem(clé sonde, "btc-range-1h")` | `undefined` : la grammaire admet la clé ; la réservation ne doit pas y aller (R4 conflit 7) |
| Compte de `"schema_version: "` dans le script | 4 à la base ; 5 après (les quatre corps littéraux + l'exception `schema_version: CA_REFUSED_SCHEMA_VERSION`) |

## 2. Liste close des fichiers

| Fichier | Changement |
|---|---|
| `docs/G0-lot-e2a-ca-trio.md` | ce fichier (hors R-25) |
| `scripts/verify-harness.mjs` | en place : en-tête l.7 et l.20, `OPTIONS` l.129, défauts l.133, `return` l.145, en-têtes de réponse l.209, appel du trio l.413 (ligne vide) ; ajouté après `main()` (avant le garde d'exécution) : le texte de spécification, `CA_REFUSED_SCHEMA_VERSION`, `KATA_PROBE_KEY`, `KATA_POLICY_TABLE_SHA256`, `GATE_KATA_BODY` (dérivé de `GATE_BODY.prediction`), `GATE_V100_BODY`, l'horloge, la fenêtre, le trio |
| `apps/harness/src/server.ts` | en place : `startServer(port, host, clock)` passe l'horloge aux deux surfaces et à l'en-tête `Date` (l.139, 164, 165, 183, 184, 186) ; aucun ajout de ligne (la ligne 188 et la ligne 31 que des tueurs épinglent ne bougent pas) |
| `apps/harness/src/policy-guard.ts` | en place l.51 : un second `is(...)` sur la même ligne, `kataKeyReserved` ; ajouté en fin de fichier : `KATA_RESERVED_IDS`, `kataKeyReserved` (exporté, pour le chargeur d'E-2a) |
| `apps/harness/test/policy-guard.test.ts` | un test ajouté en fin de fichier |
| `test/helpers/ca-clock.ts` | nouveau : l'horloge commune au harnais en processus et à la CA dans les tests |
| `test/verify-harness-liq.test.ts` | tests (1c), (2), (3), (4), (5) adaptés ; trois tests ajoutés |
| `test/surfaces-1-1-0.test.ts` | les deux tests du runbook comptent 18 contrôles (`capturedCheck` compté) |
| `test/site-ukemi.test.ts` | la CA de ce test tourne sous l'horloge de test, 18 contrôles |
| `docs/RUNBOOK-harness.md` | en place l.158, l.186-188, l.214, l.391 ; section ajoutée en fin de fichier |

## 3. Tests rouges (F2P, rouges à la base par assertion) et tueurs

| Test | Oracle | Tueur |
|---|---|---|
| `verify_harness_ca_plays_kata_path_and_refuses_1_0_0` (nouveau) | dans la fenêtre : 18 contrôles verts, les trois derniers dans l'ordre (3), (1), (2), détails exacts | `scripts/verify-harness.mjs` : le code attendu de (3) |
| `verify_harness_ca_pins_policy_table_sha256` (nouveau) | constante écrite = entrée de la dernière release qui publie `btc-range-1h` = ligne de `manifestText` (le producteur de `MANIFEST.sha256`) = sha256 du fichier = répertoire de `servedTableDirs` = servi | la constante épinglée |
| `verify_harness_ca_kata_window_fails_closed_and_waits` (nouveau) | hors fenêtre sans option : (1) et (2) rouges `kata_window_not_reached`, le reste vert ; avec `--kata-wait-max` : attente affichée, vert ; écart d'horloge > 60 s : `kata_clock_skew` ; serveur qui sert une autre table : (2) seul rouge | le seuil d'écart d'horloge |
| `the_import_guard_refuses_the_reserved_probe_kata_and_venue` (nouveau) | ligne de kata `ca-probe` ou de lieu `ca-probe` refusée par la garde, message nommé ; un autre nom passe la ligne 51 ; la requête n'est pas touchée (`kataKeyProblem` admet la clé) | la liste réservée |
| (1c), (2), (3), (4), (5) de `verify-harness-liq`, deux tests de `surfaces-1-1-0`, un de `site-ukemi` (modifiés) | 18 contrôles ; compte 5 ; refus nommés de `--kata-wait-max` et de l'horloge de test hors boucle locale | tueurs existants, inchangés (sauf le texte « 15 of 15 » → « 18 of 18 » du tueur du runbook l.214) |

Preuve : `node scripts/red-proof.mjs --base acbaeb52 --gel <wt> --repo <wt> --draw N --seed 20261007`.

## 4. Taille (R-25, pathspec `ci.yml:100`)

Estimation ascendante : script ≈ 110, server ≈ 0 (lignes en place), garde ≈ 8, tests ≈ 230, aide ≈ 15 : ≈ 365 ≤ 547 (borne du lot,
ADR-CM l.261) ; borne CI 1 205.

## 5. Écarts déclarés et dépendances

- **D-1 (place du texte)** : R4 met le texte de spécification dans l'en-tête de `verify-harness.mjs` (l.16-20). Il est posé à la
  fin du script, avant le garde d'exécution, et l'en-tête l.20 y renvoie : sinon toutes les lignes que des tueurs épinglent
  (45, 98, 137, 153, 157, 172, 319, 410) bougent. Même raison pour les corps : ils sont après `main()`, pas près de l.45-61.
- **D-2 (horloge de test)** : R4 dit « refusée sur une cible https ». Le refus est plus large et plus étroit à la fois :
  `VERIFY_HARNESS_TEST_CLOCK_MS` est refusée (exit 2) dès que `--api` ou `--mcp` n'est pas un hôte de boucle locale
  (`127.0.0.1`, `localhost`, `[::1]`), en http comme en https ; le test (4) existant joue la CA en https sur `localhost`.
  Sous cette horloge, l'attente avance l'horloge sans dormir.
- **D-3 (attente)** : le texte dit « the wait to the next grid instant » ; le code attend jusqu'à l'instant de grille lui-même
  (attente maximale 3 360 s, pas 3 120 s comme dans les sources de R4, qui attendaient l'ouverture de la fenêtre). Le texte
  figé est suivi. **Close au §8** : la course attend désormais jusqu'à 225 s avant l'instant de grille (attente maximale
  3 600 − 450 = 3 150 s), texte, code et messages ensemble.
- **D-4 (écart d'horloge)** : l'en-tête `Date` est lu sur une réponse de `/health` demandée juste avant l'appel (1), après
  l'attente éventuelle, pas sur la réponse du contrôle `health` du début : l'écart est mesuré quand il compte.
- **Dépendance (E-2a, chargeur)** : la réservation de `ca-probe` dans le chargeur appartient au lot du chargeur d'E-2a, pas
  écrit ; elle passe par `guardKataTable` (qui appelle `guardKataRow` pour chaque ligne, `policy-guard.ts` l.120 → l.51), et
  son porteur est l'item RETIRE-LISTS-E2A-PIPE-1 (`docs/ETAT.md`, porteur MONARK, déclencheur le G0 d'E-2a), complété au §8. `kataKeyReserved` est exporté pour lui ; ce lot n'invente pas de chargeur. Tant que le chargeur n'existe pas, aucune
  ligne kata n'est servie (`kataTablesHoldNoRow`), et (1) tient par construction.
- **Hors champ** : le ré-épinglage du dossier servi après déploiement (`harness-served.json` lira 18 contrôles au prochain
  enregistrement vert) ; la révision datée du texte de la spécification (iii-f).

## 6. Mesures au gel (2026-10-07T06:24:22Z, Node 24.21.0)

- **R-25** (`git diff --shortstat acbaeb52...HEAD` sur le pathspec de `ci.yml:100`) : 8 fichiers, **344** ascendantes, 32
  descendantes (≤ 547, ≤ 1 205).
- **red-proof** (`--base acbaeb52 --gel <wt> --repo <wt> --draw 12 --seed 20261007`) : `red-proof OK`, 12 tests jugés, tous
  F2P (rouges à la base par assertion), 65 inchangés ; 12 tueurs tirés, 12 tués : `verify-harness.mjs` l.483, 491, 542 (nouveaux),
  l.137, 153, 319, 410, `RUNBOOK-harness.md` l.186, 214, `policy-guard.ts` l.142 (nouveau), `sync-ukemi-served.mjs` l.225,
  `sync-harness-served.mjs` l.50.
- **Suite** : `npm run test:main` 2 807 verts, 0 rouge, 22 ignorés ; tsc, eslint, `gate:vocab`, `lang:gate`, `lint:ratchet`
  (69/69) verts ; winlint : 10 fichiers, aucun risque Windows.
- **Collisions** (`git merge-tree --write-tree`) : sans conflit contre `recherches/vocab-venue-fields-1` (`f405cae3`, PR #221)
  et `monark/reason-order-1` (`09f49fc2`). Le test de réservation est placé avant le dernier test de `policy-guard.test.ts`
  (et non en fin de fichier, où reason-order-1 ajoute le sien). Aucune ligne de `policy-guard.ts` que leurs tueurs épinglent
  ne bouge (l.51 éditée en place, ajout après l.136). La partie 3 prévue n'a pas de branche distante : non vérifiée.

## 7. Deux corrections après le gel (2026-10-07, trouvées en préparant le chargeur de la vague 1)

- **Sélection de l'entrée épinglée** (`test/verify-harness-liq.test.ts`) : le test de parité de `KATA_POLICY_TABLE_SHA256`
  prenait la dernière entrée `btc-range-1h` toutes racines confondues et exigeait qu'elle soit de racine `governance` ; une
  release datée ultérieure publiée depuis une autre racine (une release de liquidation) l'aurait rougi. L'entrée est désormais
  choisie par filtre (racine `governance` et classe), puis la dernière : `publishedTableEntry(inputs, taskClass)`, ajoutée en
  fin de `scripts/spec-policy-tables.mjs` (l.220-226), que le test appelle. Test ajouté
  `verify_harness_ca_pin_entry_ignores_a_later_release_of_another_root` : une release de racine `recherches` ajoutée en fin
  ne change pas la sélection ; rouge à la base par assertion (export absent) ; tueur `spec-policy-tables.mjs:225` (filtre de
  racine retiré : l'entrée ajoutée devient la sélection), tué.
- **Place de la réservation** : `KATA_RESERVED_IDS` et `kataKeyReserved` passent de `policy-guard.ts` (hors du graphe servi,
  `apps/harness/test/kata-path.test.ts` l.330-337) à `apps/harness/src/policy-classes.ts` (servi, ajoutés en fin de fichier,
  l.49-58), pour que le chargeur, code servi, puisse l'appeler. `policy-guard.ts` l'importe (l.11, en place) ; l'appel l.51
  reste ; les lignes retirées étaient les dernières du fichier, aucune ligne épinglée ne bouge. Tueur déplacé :
  `policy-guard.ts:142` → `policy-classes.ts:53` (même mutation, tué). Le test importe le module servi. Commentaire de
  `scripts/verify-harness.mjs` l.474 (en place) et fin de `docs/RUNBOOK-harness.md` mis à jour.

## 8. Pli de la G2 de #225 (2 M, 8 m) et des deux m de R4 v2 qui touchent #225 (2026-10-07)

Tronc `lot/etude-suite` @ `1cddd2e5` fusionné dans la branche (commit de fusion, sans réécriture). Ancres à la nouvelle tête.

| Constat | Pli | Où |
|---|---|---|
| M, (1) sans vecteur rouge | test (16) : une ligne servie sur la clé sonde, puis chaque conjonction seule (defer, calib_retired, n_calib 1, une région, `…/b1`, un `policy_row_sha256`) ; chacun rend `gate_kata_call` seul rouge, exit 1 | `test/verify-harness-liq.test.ts`, `verify_harness_ca_kata_call_reds_on_a_served_row_and_on_each_conjunction` ; tueur `verify-harness.mjs:565` |
| M, lien de session au corps public | corps réécrit (anglais public, sans lien de session), relu en ligne, `prbody.mjs` propre | corps de la PR |
| m, logique de temps non épinglée | décision de R4 v2 : fenêtre ±225 s (`KATA_WINDOW_MS` 225 000 ; 225 + 60 = 285 s, 15 s sous les 300 s du serveur) ; la course attend jusqu'à 225 s avant l'instant de grille suivant (attente maximale 3 150 s). Cas purs sur `kataWindow` (12), course 100 s avant l'heure (13), hôte 120 s en avance (14) | `verify-harness.mjs:482`, `:527-530` ; tueurs `:482`, `:527`, `:555` |
| m, fenêtre évaluée une fois | `|clock.now() − w.at|` revérifié juste avant l'appel, sinon `kata_window_not_reached` (« left the window … before the call ») ; test (15) : départ 2 s dans la fenêtre, `/health` retenu 3 s | `verify-harness.mjs:557-558` ; tueur `:558` |
| m, `<s>` nu au RUNBOOK | le texte figé est dans un bloc ```text ; mesuré : l'emballage seul laisse 1 968 octets et `7e05ee5d…` (le test lit les lignes `at`, `at+2`, …, `at+8`, jointes par LF) | `docs/RUNBOOK-harness.md` |
| (R4 v3) texte figé (iii) | le 6ᵉ bloc de R4 v3 (`recherches` `bbd6f59`) : **2 141 octets, sha256 `ee274e5505bb4fcdd4f8ff72ad6739933de198b604b4831526224a7507cbb147`**, à l'identique au RUNBOOK et dans le commentaire du script (paragraphes désenroulés égaux) ; épinglé par le test (9) | `RUNBOOK-harness.md`, `verify-harness.mjs` l.448-470 |
| m, parité du digest | l'assertion dit « la ligne que le producteur écrit pour cette entrée » ; ancre publiée en commentaire : [lu par la G2] `monark-kata-spec` @ `ffb5ea33`, `MANIFEST.sha256` l.19 = `1296c333…f955f`, empreinte du fichier `66d31d82…`. Le point « MANIFEST.sha256 publié non lu » est retiré : lu par la G2, non relu ici | test (10) |
| m, enregistrement vert sous horloge de test | sous `VERIFY_HARNESS_TEST_CLOCK_MS`, les détails de (1) et (2) finissent par ` clock=test` ; le test (4) l'affirme sur l'enregistrement vert | `verify-harness.mjs` `runClock` |
| m, moitié chargeur sans item | §5 cite RETIRE-LISTS-E2A-PIPE-1 ; complément de l'item ci-dessous | §5 |
| m, couplage d'horloge entre courses | chaque course part de l'horloge du harnais (`caEnv(clock())`) dans les tests (2bis surclamant), (4), (11), (16) | `test/verify-harness-liq.test.ts` |
| m, « 15 checks » périmés | « 18 checks » l.124 et l.128 | idem |
| R4 v2, attente | code, message stderr (« waiting N s, until 225 s before the grid instant … ») et textes disent la même attente | script, RUNBOOK l.159, l.452 |
| R4 v2, compte de 18 | `surfaces-1-1-0` l.163-172 et l.190 portaient déjà 18 ; `docs/RUNBOOK-vitrine.md` l.43, l.57, l.66 passent à 18 (l.57 garde la trace : 15 à la T0 du 2026-10-06) | `RUNBOOK-vitrine.md` |

**Item complété (forme d'ETAT)** : RETIRE-LISTS-E2A-PIPE-1 porte aussi la moitié chargeur de la réservation de `ca-probe` : une
ligne de kata ou de lieu `ca-probe` est refusée au chargement (`guardKataTable` → `guardKataRow` → `kataKeyReserved`), avec un
test d'intégration du chemin servi. Porteur : MONARK (inchangé) ; déclencheur : le G0 d'E-2a (inchangé) ; état : ouvert. La
ligne d'ETAT est un acte de MONARK.

Tueurs ajoutés :

```text
// killer: scripts/verify-harness.mjs:482 CONST "KATA_WINDOW_MS = 225000;" -> "KATA_WINDOW_MS = 240000;"
// killer: scripts/verify-harness.mjs:527 CONST "Math.round(nowMs / KATA_GRID_MS)" -> "Math.floor(nowMs / KATA_GRID_MS)"
// killer: scripts/verify-harness.mjs:555 CONST "Math.abs(date - clock.now())" -> "(clock.now() - date)"
// killer: scripts/verify-harness.mjs:558 CONST "if (late > KATA_WINDOW_MS)" -> "if (late > 2 * KATA_WINDOW_MS)"
// killer: scripts/verify-harness.mjs:565 CONST " && v.policy_row_sha256 === null;" -> ";"
```

Le tueur du test (9) passe de l.542 à l.543 (une ligne de commentaire de `kataWindow`) ; les autres ancres ne bougent pas.

**Mesures (Node 24.21.0)** :
- R-25 (pathspec de `ci.yml:100`, contre `1cddd2e5`) : 10 fichiers, +465 −35 = 500 ≤ 547.
- red-proof : `node scripts/red-proof.mjs --base 1cddd2e5 --gel <wt> --repo <wt> --out <dir> --draw 24 --seed 20261007` :
  `red-proof OK`, 18 jugés (tous F2P), 65 inchangés, 18 tueurs tirés (tous ceux des tests admis), 18 tués, dont les cinq
  ci-dessus et l.543.
- Tests : `verify-harness-liq` (19), `surfaces-1-1-0`, `site-ukemi`, `harness-served`, `runbook-retire`, `export-public`,
  `release-public-flow`, `site-send-guard`, `export-hygiene`, `apps/harness` `policy-guard` et `kata-path` : 139 verts, 0 rouge.
  `tsc --noEmit`, eslint, `lang:gate`, `gate:vocab`, `lint:ratchet` (69/69) verts ; winlint : aucun risque Windows.

## 9. Pli de la G2 delta de #225 (4 m ; MONARK `6a5584a`, 2026-10-07)

Tronc `lot/etude-suite` @ `9090da6d` fusionné dans la branche (commit de fusion `58c5e4c9`, sans réécriture) ; pli au commit
`d06fbf3b`, ancres à cette tête. `scripts/verify-harness.mjs` garde ses 578 lignes : trois lignes changées en place (l.473-474
et l.547) ; le bloc figé l.449-471 et les ancres des tueurs (l.482 à l.565) ne bougent pas.

| Constat | Pli | Où |
|---|---|---|
| m n°1 : le premier détail de `kata_window_not_reached` nommait l'ouverture de la fenêtre comme un instant de grille, avec des millisecondes | ligne corrigée en place : `next = Math.ceil(clock.now() / KATA_GRID_MS) * KATA_GRID_MS`, puis « the next grid instant is …; its window opens in N s ». (11) épingle le détail exact des deux courses hors fenêtre (sans option, puis `--kata-wait-max 2700`) : « … the next grid instant is 2026-10-07T13:00:00Z; its window opens in 2775 s (--kata-wait-max null) clock=test ». Rouge par assertion avant la correction (« the next is 2026-10-07T12:56:15.001Z, in 2775 s »), vert après | `verify-harness.mjs:547` ; `test/verify-harness-liq.test.ts:606-609` |
| m n°2 : `res.status === 200` sans vecteur seul ; `v !== null` de même | (16) : « status 203, the body unchanged » rend `gate_kata_call` seul rouge, (2) reste vert (le verdict est lu quel que soit le statut) ; « 200 without structuredContent » rend (1) et (2) rouges avec un enregistrement (assertion `r.stdout !== ""` avant la lecture). `kataFront` reçoit un statut de remplacement optionnel (quatrième argument, lu à chaque réponse de l'appel kata) | `test/verify-harness-liq.test.ts:559-572` (`kataFront`), `:691-722` (16) |
| m n°3 : la moitié chargeur décrite de deux façons ; porteur contraire à `51fe3ee` | la ligne datée de l'en-tête amende l'en-tête l.9-10, le §5 et le §8 ; `verify-harness.mjs` l.473-474 réécrites en place (deux lignes) ; la fin de `RUNBOOK-harness.md` nomme les deux moitiés. `policy-classes.ts` ne change pas : la PR #236 (lot a1, empilée sur #233) ajoute le même bloc de 11 lignes, dont le commentaire l.54-55 décrit déjà le lecteur servi | en-tête ; `verify-harness.mjs:473-474` ; `RUNBOOK-harness.md:456-461` |
| m n°4 : l'acte 2 muet sur la fenêtre | la commande porte `--kata-wait-max 3150` ; une phrase en prose, sans span de code (attente jusqu'à 52 min 30 s au plus, renvoi à RUNBOOK-harness §6) ; l'acte reste une seule ligne ; la constante `ca` du test suit | `RUNBOOK-vitrine.md:43` ; `test/surfaces-1-1-0.test.ts:238` |

**Mutants** (copie isolée, `test/verify-harness-liq.test.ts` entier, restauration contrôlée par sha256 ; témoin sans mutation :
19 sur 19 verts) :
- les deux survivants de la G2 delta sont tués par (16) seul, chacun sur son vecteur : X-status (`res.status === 200 &&`
  retiré) sur « status 203 » ; X-vnull (`v !== null &&` retiré) sur « 200 without structuredContent », message « a record is
  printed (stderr: verify-harness crashed: Cannot read properties of null (reading 'action')) » ;
- le statut affaibli (`>= 200`, `< 300`) : tués par (16) ;
- l.547 : `Math.round` ou `Math.floor` au lieu de `Math.ceil`, `grid(next - KATA_WINDOW_MS)`, l'ancien texte, `Math.floor` sur
  l'attente : tués par (11) ; le retrait du tag de `failBoth` (survivant de la G2 delta) est désormais tué par (11) ;
- équivalence : `if (v !== null) verdict = v;` → `verdict = v;` survit et est équivalent (un seul appel ; `verdict` part de
  `null`) ; `<=` → `<` à l.530 survit : la frontière à la milliseconde déjà notée par la G2 delta, qu'un cas pur
  `kataWindow(g − 226 000, 1)` tuerait ; non plié, hors des décisions de `6a5584a`.

**Mesures (Node 24.21.0)** :
- R-25 (pathspec de `ci.yml:100`, contre `9090da6d`) : 10 fichiers, +476 −36 = 512 ≤ 547.
- red-proof : `node scripts/red-proof.mjs --base 9090da6d --gel <wt> --repo <wt> --out <dir> --draw 24 --seed 20261007` :
  `red-proof OK`, 19 jugés (tous F2P, dont `srf_runbook_vitrine_t0_order`, jugé pour la première fois), 64 inchangés, 19
  tueurs tirés (tous ceux des tests admis), 19 tués ; `RED-PROOF.json` sha256 `37364efd…`.
- Tests (drapeaux de `test:main`) : les fichiers touchés et leurs voisins, 20 fichiers (`verify-harness-liq`, `surfaces-1-1-0`,
  `site-ukemi`, `harness-served`, `runbook-retire`, `site-send-guard`, `export-public`, `release-public-flow`, `export-hygiene`,
  `apps/harness` `policy-guard` et `kata-path`, et les tests qui lisent `docs/` : `ci-gates`, `journal-index`, `mission-gen`,
  `mission-lint`, `oracle-run`, `public-text-deny`, `r25-integration`, `site-docs`, `red-proof`) : 460 tests, 457 verts,
  0 rouge, 3 sautés (corpus d'hôte `F:/tmp` absent).
- `tsc --noEmit` exit 0 ; eslint 0 erreur (2 avertissements : deux `.mjs` ignorés par la configuration) ; `lang:gate`,
  `gate:vocab` (348 fichiers), `lint:ratchet` (69/69) et `export:check` verts ; winlint `--base 9090da6d` : 13 fichiers, aucun
  risque Windows.
- Texte figé (iii) : 2 141 octets, sha256 `ee274e55…cbb147`, égal à l'octet dans les quatre lieux (R4 `bbd6f59` l.161-165,
  RUNBOOK l.441-449, commentaire du script l.449-471 désenroulé, épingle du test (9)).
