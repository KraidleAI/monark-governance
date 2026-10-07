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
  figé est suivi.
- **D-4 (écart d'horloge)** : l'en-tête `Date` est lu sur une réponse de `/health` demandée juste avant l'appel (1), après
  l'attente éventuelle, pas sur la réponse du contrôle `health` du début : l'écart est mesuré quand il compte.
- **Dépendance (E-2a, chargeur)** : la réservation de `ca-probe` dans le chargeur appartient au lot du chargeur d'E-2a, pas
  écrit. `kataKeyReserved` est exporté pour lui ; ce lot n'invente pas de chargeur. Tant que le chargeur n'existe pas, aucune
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
