claude-opus-5-5

# Journal G1 — Dōjō PR-3b-2a « unités de publication sur l'hôte, extrait Caddy, constantes, RUNBOOK » — 2026-09-30

- **Rôle** : implémenteur G1, worker `claude-opus-5-5` (R-1 : modèle résolu tel quel, déclaré en première ligne de la réponse),
  effort max (mission), contexte frais ; `git` en lecture seule dans le worktree ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`,
  aucun `--write-tree`, aucun git écrivant dans le worktree ni dans `F:/Monark` ; aucun réseau ; rien sur C:.
- **Mission** : `F:/tmp/dojo/mission-g1-pr3b2a.md` (65 l.), sha256 recalculé AVANT lecture (22:48:50Z) :
  `80358defc0c260b84575de4cc3285c2875ac8b2a23812f97e699eff4006b44c0`, égal au reçu `F:/tmp/dojo/mission-g1-pr3b2a.recu.json`
  (verdict vert, 12 codes à 0, `repo` `F:/Monark-wt-dojo-pr3b2`, base `8d49343d`, head `cdaf67c8`). Règles communes
  `docs/methode/REGLES-MISSION.md` (18 l., `12d5f2df…0335` = en-tête de la mission), lues en entier (insérées dans la mission).
- **Worktree** : `F:/Monark-wt-dojo-pr3b2`, branche `lot/dojo-pr3b2`, HEAD `cdaf67c81e1de7b805301419573c7393eae3b5bd` ;
  `git status --porcelain` à 22:48:50Z : 0 ligne (arbre propre) ; `git log` : `cdaf67c8` (ligne datée 299) sur `907e6cd2`
  (fusion du tronc `8d49343d`).
- **Hôte à l'ouverture (23:05:21Z)** : `held(F:/tmp)` nul, file du verrou vide ; C-V-4 : 13 `node.exe`, 13 181 Mo physiques et
  28 734 Mo virtuels libres (`Get-CimInstance Win32_OperatingSystem`).

## Heures (`date -u`)

- 22:48:50Z sceau de la mission et état du worktree ; 22:49Z à 23:05Z lectures (ordre de la mission) ; 23:05:21Z verrou et C-V-4 ;
  consultation n° 1 de l'advisor intégré (avant toute écriture) ; 23:10:41Z empreintes des entrées ; puis ce journal (compte
  ascendant) AVANT tout code.

## Entrées, dans l'ordre de la mission (sha256 à 23:10:41Z ; « = mission » : égal à l'en-tête de la mission)

| # | Entrée | Lignes | sha256 | Lu |
|---|---|---|---|---|
| 1 | `docs/adr/ADR-DOJO-PR-3.md` | 626 | `6cffcaf9f7919ef533077b01e54434ef98196c66f8d3fb2d3f82d72ab4e52270` (= mission) | voir sous le tableau |
| 2 | `docs/G0-lot-dojo-pr3b2.md` | 109 | `69c64ee0cfe9aaf69fd278db515856259262f64714cacb16192747c89de0b537` (= mission) | en entier |
| 3 | `F:/tmp/dojo/cp1-pr3b2/CP1-report.md` | 94 | `52eb07048a36010ac5d20231ef168fe629f13b75d6cbaa679c1e6d15c9446f52` (= PB-12) | en entier |
| 4 | `docs/dojo/FAITS-systemd-publish-2026-09-30.md` | 33 | `950d0a9a20351e0f7b1220a020a1c11161a26119a35d01d73cbe039a6aaa2ade` | en entier |
| 4 | `docs/dojo/FAITS-systemd-timer-2026-09-27.md` | 31 | `afff6ae9230dac28d701736b7a7042ba6dbee98048f07959427ef25c040dc989` | en entier |
| 4 | `docs/dojo/FAITS-caddy-proxy-headers-2026-09-30.md` | 17 | `a1b4eefaa9d82aededa9a5630f8fcc285dcab4e17cc367f8f8c0202aecb61c7f` | en entier |
| 5 | `docs/RUNBOOK-dojo.md` | 315 | `4135e84e158be8a05c6da419b26dd6f849a260ce55cad099876f324272822c04` | en entier |
| 6 | `deploy/monark-dojo-collect.service` | 52 | `0144a937bd265de1a8d6eea9934d788480f4b639ec703d1664bf68f348c01ae8` | en entier |
| 6 | `deploy/monark-dojo-collect.timer` | 23 | `e7a4c6561b70f715ee5017e88990d0423397fb331a87aa287b93363b73483fd0` | en entier |
| 6 | `deploy/monark-bell-publish.service` | 52 | `1eb65e93c778cbb2e68e2f74581c21c416d2783834733f45cb3014d572f7660d` | en entier |
| 7 | `scripts/dojo-deploy.mjs` (`DOJO_COLLECT_TREE_PATHS`) | 41 | `60de228ea357833bfffa2fb6ab2fb189d0212f225b492e3ed0b9c8088c3777b0` | en entier |
| 7 | `scripts/dojo-deploy.d.mts` | 18 | `08f1838ce7f8a1bcdf97d1b5da6ae5e57426cd635519396c98065393b8a99e4b` | en entier |
| 7 | `test/dojo-collect-deploy.test.ts` | 316 | `04f966e2845eb1db2d5409c7066e966dc7514f9894011979caf27f958e411954` | en entier |
| 8 | `apps/dojo/scripts/dojo-publish.mjs` | 380 | `2350af49a303d0af24117b92836181d52b5f8adbe9aebb8435ab7367408c4030` | en entier (l.27-29, l.322-331) |
| 9 | `F:/Monark/scripts/red-proof.mjs` | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` (= mission) | en entier |

- Entrée 1, lu : §2 (D-1 à D-6), §3, §4, §5, §6, §7, le pli G0 de PR-3b-2 en entier (l.404-608 : PB-0 à PB-12), PC-7 à PC-10 du
  pli de PR-3a-1c, le pli G7 de PR-3a-1c et la dernière ligne datée (l.609-626, décisions 298 et 299).

Hors liste, lus pour agir sur pièce (motif) : outils du tronc `F:/Monark/scripts/oracle/run.mjs` (173 l., `f22b9045…a41b` = mission),
`r25.mjs` (28 l., `4d0544df…cf0` = mission), `mutants/run.mjs` (238 l., `2606e7da…3b19`), `oracle/lock.mjs` (47 l., `501a76b5…33bb`) :
formes exactes des commandes des tâches 6 à 8 ; `test/bell-caddy.ts` (226 l., `15d41e62…4764`) et `test/bell-deploy-config.test.ts`
(précédents du modèle Caddy et de `bell_runbook_never_prints_private_key`) ; `deploy/Caddyfile.monark-dojo-site.snippet` (26 l.,
`b5c84688…2ade`… voir tableau des empreintes de fin) : mandataire F3 au tronc (PR-4c-1b), garde croisée de T-A3 ; `docs/RUNBOOK-bell.md`
(étapes 3 à 8, 13, 13 bis, R3) : calques des actes ; `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` l.100-125 (format du manifeste D1) ;
`docs/adr/ADR-DOJO-SNAPSHOT-1.md` l.433 (T-10 : M-H1, M-H2) ; `docs/adr/ADR-DOJO-PR-4.md` l.266 (QF-3 (d)) ; `docs/adr/ADR-DOJO-PR-1B-4.md`
l.76-84 et l.185-192 (bornes, DOJO-VERIFY-SCALE-1) ; `apps/dojo/scripts/dojo-verify.mjs`, `dojo-verify-cli.mjs`, `dojo-core.mjs`
l.85-205, `apps/dojo/src/layout.ts` l.1-13 et l.76-110, `apps/dojo/test/helpers/dojo-fixture.ts`, `collect-chain.ts`,
`test/dojo-publish-e2e.test.ts` : coût de la vérification (SCALE), composition TU-4, forme des arbres ; `test/byte-guard.test.ts`,
`test/no-secret-in-repo.test.ts` l.1-60 : gardes de dépôt que les fichiers du lot traversent ; précédents d'outillage du G1 et du
correcteur de PR-3a-1c (`docs/G1-lot-dojo-pr3a1c.md` l.360-400, `F:/tmp/dojo/pr3a1c-corr/tools/*`).

## Compte ascendant par fichier (tâche 1 ; AVANT tout code, 23:1xZ)

Unité : ligne ascendante du planificateur (PB-1, « Composantes ») ; la projection mesurée applique le facteur ×2,31 du pli (pire
mesuré, CA-10 du cp-1). Répartition des 242 du plan par fichier : **estimation du G1**, déclarée, jamais une mesure. Colonne
« physique » : lignes que le G1 prévoit d'écrire (insertions + suppressions sous le pathspec de `ci.yml` l.82), autre estimation.

| Fichier | Composantes du plan (PB-1) portées | Asc. (plan) | Physique prévue |
|---|---|---|---|
| `deploy/monark-dojo-publish.service` (neuf) | unité (part des ≈ 150) 30 ; environnement fermé 6 ; chemins symétriques et groupe 3 | 39 | ≈ 60 |
| `deploy/monark-dojo-publish.timer` (neuf) | minuterie (part des 15) 8 | 8 | ≈ 28 |
| `deploy/Caddyfile.monark-dojo` (neuf) | extrait (part des ≈ 150) 15 ; gardes de l'extrait (part des 5) 2 | 17 | ≈ 32 |
| `scripts/dojo-deploy.mjs` (modifié) | DOJO-PUBLISH-TREE-PATHS-1 (part des 20) 10 | 10 | ≈ 26 |
| `scripts/dojo-deploy.d.mts` (modifié) | idem 3 | 3 | ≈ 10 |
| `test/dojo-publish-deploy.test.ts` | lecture 105 ; minuterie 7 ; composition 15 ; `history` 15 ; trousseau 5 ; arbre 7 ; STOP 8 ; gardes 3 | 165 | ≈ 400 |
| `docs/RUNBOOK-dojo.md` | hors R-25 (`docs/**/*.md` exclu, `ci.yml` l.82) | — | — |
| `docs/G1-lot-dojo-pr3b2a.md` (ce journal) | hors R-25 (`docs/G1-lot-*.md` exclu) | — | — |
| **Total** | | **242** | **≈ 556** |

- Projection : 242 × 2,31 = 559,0 (plan) ; physique prévue ≈ 556 ; les deux sous le STOP 1 150 (solde prévu ≈ 590) et sous la porte
  CI 1 205. Règle de repli de la mission (Q-B2 de PB-11) : coupe 2a-1 / 2a-2 si `r25()` MESURÉ > 1 150 ou solde < 10 ; mesure à faire
  au premier état complet du code, avant toute course lourde : **aucune coupe prise sur l'estimation** (242 ≤ 547, borne ascendante).
- Écart É-G1-1 (mission, tâche 2) : `scripts/dojo-deploy.mjs` et `.d.mts` y sont dits « (neufs) » ; ils existent au tronc depuis
  PR-3b-1 (41 et 18 l., empreintes ci-dessus) et PB-1 ne les dit pas neufs : ils sont COMPLÉTÉS en place (Q-G1-1).

## Consigne de l'orchestrateur reçue en cours de mission (lue à 2026-09-30T23:12:44Z)

- Texte reçu (message de l'orchestrateur, résumé fidèle ; périmètre : RUNBOOK du lot seulement, « sans rien changer d'autre ») :
  (1) écrire RUNBOOK §7 pour que la règle du premier jour lu (« jour zéro » éventuel, Eve de ce jour) soit UNE ligne datée à remplir
  par l'orchestrateur, jamais codée en dur, nommée NE-1 dans le RUNBOOK ; (2) les préalables jadis « avant A-7 »
  (RPC-GUARD-FIRST-APPEND-HEAD-1, RPC-GUARD-BODY-TIMEOUT-1, P-5, second relevé de `TasksMax`, FAITS-JOURNALCTL-1) passent avant
  A-9 (7), le premier pas réel ; citer ce message au journal.
- Pièces vérifiées à la lecture : `F:/tmp/dojo/inventaire-page/INVENTAIRE.md` (189 l.), sha256
  `2875738f152cb2ff992452cc7d7af2570efb3b3ee2bcd8181abcff190dbb6158` (préfixe cité par le message : égal) ; NE-1 l.161 et NE-5 l.165 lus ;
  `apps/dojo/src/history-collect.ts` l.83-86 (`--first-read` : jour clos de PR-2, B1R) et l.151-156 (`inputs_mismatch` sinon) lus ;
  P-5 = procurement de l'ADR PR-2 l.316 (position de Cloudflare sur son relais, « avant le premier jour lu »).

## Seconde consigne de l'orchestrateur (lue à 2026-09-30T23:29:37Z ; décision 300 de l'investisseur) — l'emporte sur la mission et sur la première

- Texte reçu (résumé fidèle) : (1) NE PAS faire les tâches 6 (F2P), 7 (mutants) et 8 (oracle G1) : l'inspection finale unique de la
  page les fera sur la branche intégrée ; garder le code, les tests T-A1 à T-A11 verts sur le clone du G1, le RUNBOOK et la mesure
  SCALE (tâche 5), puis livrer (`REPONSE.md`, `DELIVERED.sha256`) ; (2) la répétition est RÉTABLIE comme « jour zéro » (le premier jour
  clos qu'exige `--first-read` des actes d'historique) : RUNBOOK §5 à §7 (côté collecte) restent tels qu'au tronc ; la mise en
  cohérence « sans répétition » (ligne datée de 22:47Z et première consigne) est abandonnée ; NE-1 tranché : jour zéro = la répétition
  existante ; les actes côté publication gardent leurs bloquants d'origine (PB-5) ; citer ce message au journal.
- État à la lecture : le RUNBOOK n'avait pas encore été touché (sha256 `4135e84e…2c04` = entrée 5, relevé à 23:29:37Z) ; la première
  consigne (NE-1 ligne datée, préalables « avant A-7 » déplacés) n'a donc produit aucune écriture et reste sans objet.
- Conséquences tenues dans la suite : aucune course `red-proof`, aucune campagne de mutants, aucun oracle ; lignes `// killer:`
  gardées au-dessus de chaque test (forme de PB-6, pour l'inspection finale) ; R-25 mesuré par `r25()` du tronc sur un clone gelé
  (règle de repli de la mission, jamais l'oracle) ; tests du lot rejoués sur un clone `--no-local` du worktree.

## Code (tâche 2), dans l'ordre d'écriture (heures `date -u`)

- 23:1xZ `scripts/dojo-deploy.mjs` complété en place (É-G1-1) : en-tête l.3 réécrite (1 ligne), neuf constantes du côté publication
  ajoutées en fin (PB-2 : racine, programme, `DOJO_PUBLISH_TREE_PATHS`, deux unités, source du credential, groupe du passage,
  extrait Caddy et son chemin installé) ; `.d.mts` suit (9 lignes). Fermeture recalculée hors dépôt (`tools/closure.mjs`,
  algorithme de `dojo_collect_tree_is_the_import_closure`) : 10 chemins, égale à la constante, ordre des octets (23:1xZ).
- 23:1xZ `deploy/monark-dojo-publish.timer` (27 l.) et `deploy/Caddyfile.monark-dojo` (28 l., indenté par espaces) ;
  23:2xZ `deploy/monark-dojo-publish.service` (58 l.) : PB-2, PB-3, FAITS-SYSTEMD-PUBLISH-1 F-1 (`SupplementaryGroups=` ET
  appartenance posée à A-2p), F-2 (`UnsetEnvironment=` verbatim, « garde retenue »), F-5 (`ReadOnlyPaths=` sur `bundles/` seul : la
  variante `/opt/monark-dojo` de F-5 n'est pas prise, redondante sous `ProtectSystem=strict`, déclarée dans l'unité) ; `MemoryMax`,
  `--max-old-space-size` et `TimeoutStartSec` : écrits à 23:2xZ avec 448, 512M et 1800 PROVISOIRES pendant la grille (écart au plan
  déclaré « SCALE avant l'unité »), puis 1800 → 2900 à 00:0xZ d'après la grille (448 et 512M confirmés) : section SCALE.
- 23:3xZ à 23:4xZ `docs/RUNBOOK-dojo.md` (sections 10 à 20, titre, « What », « Never ») puis `test/dojo-publish-deploy.test.ts`.

## Écarts relevés (É-G1-n ; `error_origin` proposé)

- **É-G1-1** : mission, tâche 2 : `scripts/dojo-deploy.mjs` et `.d.mts` dits « (neufs) » ; ils existent depuis PR-3b-1 ; complétés en
  place (PB-1 ne les dit pas neufs). `error_origin` : rédaction de la mission (ORCH). Q-G1-1.
- **É-G1-2** : deux lignes de directive de l'unité dépassent 160 caractères : `ExecStart=` (forme exacte de PB-2) et
  `UnsetEnvironment=` (liste verbatim de F-2). Une directive systemd ne se coupe que par une barre inverse finale, que la règle
  d'octets du lot interdit ; couper `UnsetEnvironment=` en deux directives supposerait leur cumul, non lu sur place (jamais deviné).
  Toutes les autres lignes créées (unités, extrait, constantes, test, RUNBOOK, journal) sont ≤ 160, mesuré. Q-G1-2.
- **É-G1-3** : CA-0 : PB-1 confie sa part de RUNBOOK à 2b ; la mission la range dans les actes de 2a. Section 15 : place, bloquants,
  attendu (table hors ligne de PB-2) et forme de la commande ; script et captures laissés à 2b. `error_origin` : ORCH. Q-G1-3.
- **É-G1-4** : la première consigne (NE-1 en ligne datée, préalables déplacés avant A-9 (7)) a été remplacée par la seconde
  (décision 300) avant toute écriture au RUNBOOK : rien d'appliqué. RUNBOOK §1 à §9 intacts (épingles du test de collecte :
  premier `git archive` au §3, `install -d ... 2750 .../bundles` deux fois, `printf` deux fois ; ses 8 tests verts sur le clone).
- **É-G1-5** : garde de la requête d'A-8 (point de l'advisor) : `/etc/monark/dojo` est 0700 root et `/tmp` privé au job ; la requête
  (aucun secret) est écrite par root dans l'état (`dojo:dojo` 0640), lue par le job, puis retirée (section 16 (1)) ; variante non
  prise : second credential sous un nom d'unité transitoire fixe (chemin `/run/credentials/...` au RUNBOOK). Choix du G1, déclaré.
- **É-G1-6** : trouvaille de mesure (SCALE, sonde (ii)) : la CLI `--url` rend `unreachable` quand le serveur ferme une connexion
  inactive pendant le calcul entre deux GET (section SCALE) ; hors du périmètre de 2a : item proposé à l'orchestrateur (Q-G1-5).
- **É-G1-7** : les bloquants de PB-5 sont repris tels quels (décision 300) : FAITS-JOURNALCTL-1 avant A-2p (via l'ancienne l.18),
  « répétition archivée » avant A-10, critère de répétition recommencé sur arbre de collecte différent à A-3p.

## Tests (tâche 3) : `test/dojo-publish-deploy.test.ts`, onze tests, chacun sous sa ligne `// killer:`

- T-A1 `dojo_unit_is_offline_and_loads_its_own_credential` (tueur service:52) : `[Service]` fermé et valué ; un seul credential, nom lu par l'éditeur
  ; aucun code réseau dans l'arbre ; tas < `MemoryMax` ; le job d'A-8 porte les huit propriétés de l'unité.
- T-A2 `dojo_publish_timer_runs_after_the_close` (tueur timer:14) : quatre créneaux 00:30, 01:30, 03:30, 06:30 UTC ; `AccuracySec=1s`,
  `RandomizedDelaySec=0` ; clôture ≤ 901 s, marge 899 s.
- T-A3 `dojo_caddyfile_serves_public_only_immutables_no_browse` (tueur Caddyfile:22) : un site, `root` = `public/`, directives {root, header,
  file_server}, pas de listage ni de redirection ; en-têtes de `c06` ; gardes F3 (i) à (iii).
- T-A4 `dojo_two_units_share_no_writable_path` (tueur service:48) : écritures disjointes ; lecture de la collecte par `bundles/` seul ;
  `InaccessiblePaths` symétriques ; groupe déclaré et posé ; `evidence/` jamais nommé.
- T-A5 `dojo_publish_tree_is_the_import_closure` (tueur dojo-deploy:52) : liste = fermeture de l'éditeur ; aucun spécificateur nu ; A-3p lit la
  constante AU G7.
- T-A6 `dojo_publish_unit_environment_is_closed` (tueur service:37) : ni `Environment` ni `EnvironmentFile` ni `PassEnvironment` ; `UnsetEnvironment`
  verbatim F-2 ; options Node = tas seul ; une seule lecture d'environnement.
- T-A7 `dojo_units_compose_collect_to_publish_to_verify` (tueur service:29) : TU-4 : les deux arbres, la clé et le trousseau par la commande d'A-4p,
  l'ancre par l'argv de l'unité, `history` substituée, le vrai `--tick`, l'argv de publication, la CLI publique `consistent_with_supplied_keyring`.
- T-A8 `dojo_runbook_never_prints_private_key` (tueur RUNBOOK:403) : quatre usages permis du chemin de la clé ; comptes avant affichage ; ni `set -x`,
  ni `printenv`, ni `/run/credentials/`.
- T-A9 `dojo_runbook_counts_only_after_the_block` (tueur RUNBOOK:591) : vérification hors ligne, `stamp`, copie durable, PUIS `upgrade` ; A-9 après la
  preuve mise à niveau ; règle du §7.
- T-A10 `dojo_keyring_shares_no_key_with_bell` (tueur dojo-deploy:57) : sauté par nom tant que `apps/dojo/keys/dojo-keyring.json` manque (TU-K, A-4p).
- T-A11 `dojo_runbook_stops_before_the_stamp_and_on_refusals` (tueur RUNBOOK:673) : STOP d'A-8 avant `stamp` ; 26 lignes = `DOJO_PUBLISH_REFUSALS` ;
  motif C-G2-1 de `line_refused` ; A-10.

- Lignes `// killer:` : 11, validées par `tools/killcheck.mjs` (`parseKiller` du tronc et contrôle de `killerProblem` : fichier de
  l'arbre hors code de test, `<before>` une seule fois, SDL vide, placée juste au-dessus du `test(`) : 11 OK, 0 refus ; JAMAIS tirées
  (décision 300 : F2P et mutants à l'inspection finale).
- Review Focus « aucun jour de répétition » (mission, T-A9) : remplacé à dessein par la règle du bloc constaté avant tout jour compté
  (décision 300, 23:29:37Z : la répétition est rétablie) ; T-A9 épingle l'ordre stamp, copie durable, upgrade, puis A-9.
- Forme F2P (PB-6) : chaque test commence par `exists()` (les neuf exports neufs, par espace de noms) : à la base, rouge par
  `ERR_ASSERTION`, jamais par ENOENT ; aucune lecture de fichier au chargement du module ; aucune barre inverse dans le fichier.
- Clone de course : `F:/tmp/dojo/pr3b2a/gel` (`git clone --no-local` du worktree au HEAD `cdaf67c8`, huit fichiers du lot copiés à
  sha256 égal), `node_modules` par `mk-nm.ps1` (220 entrées, 11 `@monark` vers le clone), TEMP `F:/tmp/dojo/pr3b2a/tmp`, verrou libre
  et file vide avant chaque course (`tools/gate.mjs`). Course 1 (23:43Z) : T-A1 rouge (saut de ligne dans l'extraction des `-p` du
  job d'A-8 : défaut du test, corrigé) ; course 2 (23:43:22Z) : **10 verts, 1 sauté par nom (T-A10), 0 rouge**, 2,8 s
  (`F:/tmp/dojo/pr3b2a/run2.tap`, `4b483551…7e88`) ; le fichier a ensuite changé (typage l.277, constante SCALE, lignes des
  tueurs) : l'état LIVRÉ est celui de la course 5 (section « Remise », `run5.tap`).
- Tests voisins sur le clone (23:44Z) : `dojo-collect-deploy` (8), `dojo-served` (6), `no-secret-in-repo`, `dojo-publish-e2e` :
  **17/17 verts** (`run-neighbours.tap`, `5e37b9e1…f736`). Portes statiques sur le clone : `tsc --noEmit` 0 (après typage explicite de
  la requête d'ancre, l.277), ESLint du fichier 0, cliquet de lint **69/69** (`bf35ba72…cfd8`), `lang-gate` OK, `export:check` OK,
  vocabulaire OK sur 328 fichiers.

## RUNBOOK (tâche 4), hors R-25

- Sections 10 à 20 insérées avant « Never » (§1 à §9 inchangés, décision 300) : 10 quoi, ordre de PB-5 (A-9 (1) après `ots upgrade`
  complet), go délégué (292), conventions ; 11 A-2p ; 12 A-3p (listes lues de la constante AU G7, arbre de collecte COMPARÉ, jamais
  redéployé) ; 13 A-4p (comptes avant affichage, trousseau par le code du dépôt) ; 14 A-5p (calendrier, chemins de la collecte,
  NOMS du bloc du gestionnaire, démarrage à blanc : `history_missing`, jamais `signing_key_missing`) ; 15 CA-0 (place et forme) ;
  16 A-8 (job transitoire, miroir, STOP hors ligne AVANT `ots stamp`, extension `--keyring`, manifeste D1, `stamp`, copie durable,
  commit, `upgrade`) ; 17 A-10 et la cadence ; 18 A-11 (i) à (iii) ; 19 les 26 refus de l'éditeur, chacun un STOP, motif C-G2-1 ;
  20 rotation de clé et page (QF-3 (d)). Titre, « What » et « Never » complétés. Lignes ajoutées ≤ 160, sans barre inverse.

## Décision → fichier → test → mutant (PB-0 à PB-6 ; mutants nommés de la table `F:/tmp/dojo/pr3b2a/mutants-table.mjs`)

- D-B1, PB-2 (unité hors réseau, un credential) → service → T-A1 → M-H1 (clé de Bell), M-H2 (`PrivateNetwork=no`).
- D-5 l.110, PB-2 (minuterie) → timer → T-A2 → M-H10a (créneau 00:10), M-H10b (`RandomizedDelaySec=600`).
- PB-2 (extrait, gardes (i) à (iii)) → Caddyfile → T-A3 → M-H11a (`browse`), M-H11b (`history/` sans `immutable`), M-H18a
  (`reverse_proxy`), M-H18b (site `http://`), M-H18c (`tls`).
- D-5 (séparation) → service et unité de collecte → T-A4 → M-H13a (lecture de tout l'état de collecte), M-H13b (écriture partagée).
- DOJO-PUBLISH-TREE-PATHS-1 → `scripts/dojo-deploy.mjs` (+ `.d.mts`) et RUNBOOK §12 → T-A5 → M-H16a, M-H16b (CLI réseau au lieu du cœur).
- D-B2, PB-3, FAITS F-2 (environnement fermé) → service → T-A6 → M-H17a (`NODE_OPTIONS` rendu), M-H17b (`PassEnvironment=`).
- D-B3, TU-4 (composition) → service, unité de collecte, RUNBOOK §13 → T-A7 → tueur de T-A7 (`--inbox` vers `ledger/`).
- PB-5 A-4p (aucune clé imprimée) → RUNBOOK §13, §16 → T-A8 → tueur de T-A8 (`cat` de la clé).
- D-4, DOJO-ANCHOR-OTS-DATE-RULE-1 → RUNBOOK §10, §16, §7 → T-A9 → M-H14a (plus d'`upgrade`), M-H14b (A-9 sans le bloc).
- TU-K, DOJO-KEY-1 → RUNBOOK §13 → T-A10 (sauté par nom) → tueur déclaré (source de la clé chez Bell).
- PC-7 (consignes), C-G2-1, Q-V-1 de PR-3a-1c → RUNBOOK §16, §17, §19 → T-A11 → M-H19a (un refus STOP retiré), M-H19b (pas de
  vérification hors ligne avant `stamp`).
- Table : 19 rangs (dix mutants nommés de la mission, en variantes a/b/c), ancres contrôlées par `tools/tablecheck.mjs` (19 OK) ;
  NON lancée (décision 300) ; chaque rang nomme le test qui doit le tuer.

## F2P, mutants, oracle (tâches 6, 7, 8) : NON FAITS (décision 300, seconde consigne de l'orchestrateur, 23:29:37Z)

- Préparé pour l'inspection finale, sans exécution : 11 lignes `// killer:` valides (`tools/killcheck.mjs`) ; table de 19 mutants
  (`mutants-table.mjs`) ; prédiction écrite AVANT toute course : `red-proof` jugera les 11 tests (fichier neuf) ; 10 F2P attendus
  (rouges à la base par `exists()`) ; T-A10 refusé « not green at gel (skip) » (saut par nom de TU-K, prévu par PB-6) : sortie 1
  prédite de `red-proof` sur ce seul rang (Q-G1-4). R-25 mesuré par `r25()` du tronc (ci-dessous), jamais par l'oracle.

## R-25 (règle de repli de la mission)

- Clone gelé `F:/tmp/dojo/pr3b2a/r25clone` (`--no-local` du worktree, huit fichiers du lot copiés, commit local du clone
  `749cceb8`, jamais dans le worktree), `r25()` exporté de `F:/Monark/scripts/oracle/r25.mjs` (`4d0544df…cf0`) par
  `tools/r25-run.mjs`, base `8d49343d` (23:44:18Z) : **STAT 558 insertions, 1 suppression : 559 mesurées** (porte CI 1 205 : vert ;
  STOP 1 150 : solde 591 ≥ 10) ; CONTENT_STAT 0. Aucune coupe (Q-B2). 559 = 242 × 2,31 (559,0), la projection du plan.
- Seconde mesure sur l'état FINAL du code (23:55Z, second gel local du même clone `27a093f1`, après les trois lignes gagnées par le
  test aux corrections de course et de typage) : **STAT 559 insertions, 1 suppression : 560 mesurées** (porte 1 205 : vert ; solde
  590) ; par fichier (`git diff --stat 8d49343d...HEAD`) : service 58, timer 27, extrait 28, `dojo-deploy.mjs` +22 −1, `.d.mts` 9,
  test 415. C'est la valeur de livraison ; la retouche finale d'un commentaire de l'unité (00:04Z) garde ses 58 lignes : 560 tient.

## Conduite

- `git` en lecture seule dans le worktree (`rev-parse`, `status --porcelain`, `log`, `show HEAD:<chemin>`, avec
  `--no-optional-locks`) ; **aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun git écrivant dans le worktree ni
  dans `F:/Monark`** ; clones `--no-local` sous `F:/tmp/dojo/pr3b2a/` (`gel`, `r25clone`, ce dernier seul porte un commit local) ;
  jonctions par `mk-nm.ps1` sur `gel` seulement, retirées à la fin par `rm-nm.ps1` ; aucune connexion à l'hôte, aucun réseau réel
  (serveur `node:http` de boucle locale de la sonde (ii) seulement), aucun outil de recherche distant ; rien sur C: ; TEMP
  `F:/tmp/dojo/pr3b2a/tmp` ; verrou `F:/tmp/oracle-lock` libre et file vide avant chaque course et chaque point de mesure
  (`tools/gate.mjs`) ; C-V-4 lu avant chaque point (`tools/cv4.ps1`, `Get-CimInstance`) : 11 à 17 `node.exe`, ≥ 10 559 Mo libres.
- Écarts de conduite déclarés : (1) des courses de test du G1 (23:43Z à 23:46Z) ont chevauché la VAE de (10⁴, 30) et celle de
  (1 144, 365) : 24 cœurs, sondes mono-fil, la métrique retenue est le temps CPU du processus sondé (peu sensible) ; (2) les champs
  `out` de `results.jsonl` portent des chemins win32 écrits par Node (barres inverses) : sortie d'outil citée par sha256, non
  réécrite ; (3) une clé de sonde de test a été générée hors dépôt (`F:/tmp/dojo/pr3b2a/tmp/envprobe/k.pem`, clé jetable pour
  vérifier qu'un Node win32 démarre sous un environnement réduit à `CREDENTIALS_DIRECTORY`).

## MAST (risques résiduels du lot)

- FM-1.1 (spécification non suivie, format recopié) : constantes importées (jamais retapées) par l'unité, le RUNBOOK (A-3p lit la
  constante AU G7) et les tests ; trousseau d'A-4p fait par le code du dépôt, lié aux octets servis (T-A7).
- FM-2.2 (valeurs par défaut) : minuterie tout explicite (T-A2) ; `MemoryMax`, tas et `TimeoutStartSec` tirés de la mesure SCALE,
  domaine couvert écrit (section SCALE) ; aucune valeur laissée au défaut de systemd.
- FM-1.2 (acte de worker) : aucune connexion à l'hôte, aucune clé ni graine réelle ; clés et graines de test générées à l'exécution.
- FM-3.3 (vérification incorrecte partagée) : sans objet dans 2a (la CA est à 2b) ; résiduel noté : T-A3 juge un MODÈLE de Caddy
  (`test/bell-caddy.ts`, déclaré tel), le vrai Caddy est jugé à A-6 (`/` en 404 par `curl`) et par `c05`/`c06` de la CA.
- FM-1.5 (condition de fin ignorée) : T-A10 sauté par nom jusqu'à A-4p (condition écrite, dé-sautée par le commit du trousseau).

## `error_origin` proposés (assignés au G7)

- É-G1-1 (« neufs ») et É-G1-3 (CA-0 dans 2a) : rédaction de la mission (ORCH). É-G1-2 (deux directives > 160) : conflit de règles
  entre PB-2 / FAITS F-2 et la règle de longueur de la mission (ORCH). T-A1 rouge à la course 1 (extraction multi-ligne) et erreur de
  typage l.277 : G1 (corrigés avant livraison). Sonde (ii) `unreachable` du premier point : outil de mesure du G1 (serveur de boucle
  locale aux délais par défaut), et trouvaille de produit (É-G1-6). Aucun autre.

## Questions à l'orchestrateur (fermées, recommandation jointe)

- **Q-G1-1** (É-G1-1) : acter « complétés en place » pour `scripts/dojo-deploy.mjs` et `.d.mts` ? Recommandation : oui.
- **Q-G1-2** (É-G1-2) : les deux directives longues (`ExecStart=` 178, `UnsetEnvironment=` 189) : (a) exception déclarée à la règle
  de 160 pour une directive systemd indivisible ; (b) lecture sur place du cumul de `UnsetEnvironment=` (systemd.exec(5) de l'hôte)
  puis coupe en deux directives ; (c) `ExecStart=` raccourci (chemin relatif du script sous `WorkingDirectory=`, 161 : insuffisant) ?
  Recommandation : (a) pour `ExecStart=`, (b) pour `UnsetEnvironment=` à A-5p (lecture déjà due : RUNBOOK « Who and when »).
- **Q-G1-3** (É-G1-3) : CA-0 écrit en place et forme par 2a, script et captures par 2b ? Recommandation : oui (aucune commande
  inventée pour un script qui n'existe pas encore).
- **Q-G1-4** (T-A10) : `red-proof.mjs` refusera le saut par nom de TU-K (« not green at gel (skip) ») : sortie 1 prédite. (a) l'admettre
  comme sortie attendue à l'inspection finale (précédent : les épingles refusées de PR-3a-1c, Q-G1-8) ; (b) item d'outil (une ligne
  `// skip-until:` reconnue par `red-proof`) ? Recommandation : (a), et (b) en item d'outil si le cas se répète.
- **Q-G1-5** (É-G1-6, keep-alive) : item formé proposé **DOJO-VERIFY-URL-IDLE-1** (propriétaire orchestrateur ; PAROXYSME) : la CLI
  `--url` rend `unreachable` quand le serveur ferme une connexion inactive pendant le calcul entre deux GET ; objet : lire sur place le
  délai d'inactivité de Caddy de l'hôte (non lu ici, aucun défaut supposé) et construire la parade (tout lire avant de vérifier, ou une
  reprise sur connexion neuve, ou `connection: close`) ; déclencheur : G1 de PR-3b-2b, avant CA-1 ; preuves : section SCALE.
- **Q-G1-7** : les `InaccessiblePaths=` sans `-` de l'unité exigent `/etc/monark/dojo-collect.env` (A-4 côté collecte) : A-4 n'est pas
  un bloquant écrit de A-5p dans PB-5 ; la section 14 le vérifie (`stat`) et le dit. Ligne datée à PB-5 ? Recommandation : oui.
- **Q-G1-8** : `UnsetEnvironment=` porte les treize noms de F-2 ; les familles de PB-3 (`NODE_`, `SSL_`, `OPENSSL_`, `*PROXY`) en
  comptent d'autres (`NODE_USE_SYSTEM_CA`, `NODE_USE_ENV_PROXY`, `OPENSSL_CONF`...). Résiduel : relevé des NOMS du bloc du gestionnaire à
  A-5p (section 14) puis par `c09` (2b). Item PAROXYSME (liste fermée étendue, ou motif si systemd l'admet, lu sur place) ?
  Recommandation : oui, déclencheur A-5p.

## Trouvaille de forme au RUNBOOK (mesurée le 2026-09-30 vers 23:53Z) : format de `sha256sum` sous Git Bash

- Mesuré sur la machine de l'orchestrateur (`sha256sum (GNU coreutils) 8.32`, Git Bash) : la sortie porte le marqueur binaire ` *`
  par défaut, y compris sur l'entrée standard (`<hash> *-`) ; avec `-t`, deux espaces (`od -c`, fichier sonde
  `F:/tmp/dojo/pr3b2a/tmp/shaprobe.txt`). Une comparaison de la sortie ENTIÈRE entre l'hôte et la machine opérateur est donc fausse
  si les deux formes diffèrent. Sections du lot corrigées avant livraison : listes par `sha256sum -t` des deux côtés, empreintes
  seules par `cut -c1-64` (section 10, « Conventions »).
- **Hors lot, non touché (décision 300 : §1 à §9 tels qu'au tronc)** : le §4 (A-4 côté collecte, PR-3b-1) compare
  `"$(ssh ... 'sha256sum < ...')" = "$(sha256sum < ...)"` (graine réelle et `EnvironmentFile`) : sous Git Bash, la forme locale est
  `<hash> *-` ; la forme de l'hôte n'est pas mesurée ici (Linux, mode texte par défaut : [2nd] de mémoire, à mesurer) : si elle est
  `<hash>  -`, le §4 imprimera `COPY-DIFFERENT` sur une copie égale. Q-G1-9.

## Advisor intégré (conseil, jamais verdict ; chaque point vérifié sur pièce)

- **Consultation n° 1** (23:0xZ, après l'orientation, avant toute écriture) : ordre de travail (journal, SCALE avant l'unité) ; aucune
  barre inverse dans les fichiers créés (test compris) ; rien au chargement du module de test (F2P) ; T-A10 refusé par `red-proof`
  (prédire) ; sockets piégés par `collect-chain.ts` (T-A3 sans client de boucle locale) ; épingles du RUNBOOK de collecte (premier
  `git archive`, deux `install -d ... 2750`, deux `printf`) ; garde de la requête d'A-8 ; A-5p et les `InaccessiblePaths=` sans `-` ;
  CA-0 ; `UnsetEnvironment=` verbatim ; SCALE en processus enfant. Tout appliqué ; le choix de la requête d'A-8 : É-G1-5.
- **Consultation n° 2** (23:5xZ, avant de clore SCALE) : ne pas lancer (10⁴, 365) (décision 300), extrapolation déclarée, valeurs
  tirées du plus grand point mesuré avec leur domaine, capacité DÉFINIE et déclarée, forme de `DELIVERED.sha256` à calquer, verdict
  LIVRE-AVEC-RÉSERVES. Appliqué.

## Questions ajoutées en fin de G1

- **Q-G1-9** (trouvaille `sha256sum`) : le §4 du RUNBOOK (PR-3b-1, hors lot, gardé tel qu'au tronc) compare deux sorties ENTIÈRES de
  `sha256sum` entre l'hôte et Git Bash, dont la forme locale porte ` *` (mesuré) : `COPY-DIFFERENT` probable sur une copie égale.
  Correction de forme (`| cut -c1-64` des deux côtés, comme les sections 10 à 20) par une ligne datée avant A-4 ? Recommandation : oui.

## DOJO-VERIFY-SCALE-1 (tâche 5) : mesure, extrapolation déclarée, ligne datée proposée

- Hors dépôt, `F:/tmp/methode/pr3b2/scale/` : `gen-tree.mjs`, `run-vae.mjs`, `run-cli.mjs`, `rusage-preload.mjs`, `grid.mjs`,
  `summary.mjs` (empreintes : `DELIVERED.sha256`) ; résultats
  `results.jsonl` (`a0da0051…7443`), `keepalive-probe.jsonl` (`5277cbf7…5231`), synthèse `summary.json` (`ccd26395…6b2f`) ; arbres
  `tree-N<N>-D<D>/` gardés (empreinte de chaque chronologie dans `results.jsonl`).
- Protocole (PB-6) : arbres signés synthétiques des aides de `dojo-fixture.ts` (calque EN FLUX déclaré de `render()` : corps,
  chaîne de graines, signatures et trousseau de la fixture, importés), K = 4, 22 jours d'historique, N détenteurs sur la courbe
  à huit montants fixes, tous les jours comptés, une `price_version` tous les 7 jours de lecture (chaque `snapshot` nomme la version en
  vigueur) ; chaque arbre `ok` au vérificateur avant toute lecture des chiffres. (i) VAE de l'éditeur : `verifyDojoServed` sur
  `dirSource`, `self_consistent_only` (comme `checked()`), processus enfant sous `--max-old-space-size=448` ; (ii) vraie CLI `--url`
  en boucle locale (`execFile`, serveur `node:http` du parent, `connection: close`). CPU = utilisateur + système du processus sondé
  (`process.resourceUsage()`), RSS de crête = `maxRSS`. Machine : celle de l'orchestrateur (win32, Node v24.15.0, 24 cœurs, sondes
  mono-fil), jamais l'hôte (Linux, 2 vCPU) : facteur de l'hôte INCONNU. Verrou libre et C-V-4 vert avant chaque point (lignes
  `gate` et `cv4` de `results.jsonl`).
- Points mesurés (CPU s ; écoulé s ; RSS Mo) :
  - (1 144, 30), 33 fichiers, 12,8 Mo : (i) 80,3 ; 90,6 ; 218 — (ii) 76,2 ; 79,4 ; 217.
  - (10 000, 30), 33 fichiers, 111,1 Mo : (i) **561,9** ; 575,0 ; **385** — (ii) 509,2 ; 506,1 ; 361.
  - (1 144, 365), 368 fichiers, 123,1 Mo : (i) 558,8 ; 563,4 ; 282 — (ii) 586,9 ; **587,4** ; 241.
- Extrapolation DÉCLARÉE (jamais mesurée ; décision 300 : pas de point de plusieurs heures) : (10 000, 365) ≈ 3 909 s de CPU
  (rapport en D mesuré à N = 1 144 : ×6,96, appliqué à (10 000, 30)), délai ≈ 19 600 s, RSS ≈ 944 Mo (croissance mesurée à N = 1 144 :
  167 octets par adresse-jour, appliquée à (10 000, 30)), CLI ≈ 3 743 s. Le coût par adresse-jour CROÎT avec D (1,08 ms à (10 000, 30),
  1,26 ms à (1 144, 365)) : le domaine couvert est l'enveloppe des points mesurés, jamais un produit N × jours.
- Trouvaille (É-G1-6) : premier passage de (ii) à (1 144, 30) sous les délais par défaut de `node:http` (connexion inactive fermée
  après 5 s) : `unreachable` au 4e GET après 35,5 s (3 GET servis : chronologie, clé, historique ; le calcul de l'historique dure plus
  de 5 s) ; rejoué en `connection: close` puis en `keepAliveTimeout = 0` : `ok` (79,4 s, 75,3 s). Item proposé : Q-G1-5.

**Ligne datée proposée à l'orchestrateur (à porter à l'ADR avant le G7 de PR-3b-2a ; DOJO-VERIFY-SCALE-1)** :

- 2026-10-01, G1 de PR-3b-2a : mesure hors dépôt (`results.jsonl` `a0da0051…7443`, `summary.json` `ccd26395…6b2f`), machine de
  l'orchestrateur, jamais l'hôte ; points mesurés (N, D) = (1 144, 30), (10 000, 30), (1 144, 365) ; (10 000, 365) extrapolé.
- Unité : `--max-old-space-size=448` et `MemoryMax=512M` (crête RSS mesurée 385 Mo, marge 127 Mo) ; `TimeoutStartSec=2900` (pire VAE
  mesurée 561,9 s × 4 sous `CPUQuota=25%` × 1,25, arrondi à la centaine supérieure).
- Domaine couvert : N ≤ 10 000 à D ≤ 30, et N ≤ 1 144 à D ≤ 365 ; au-delà : STOP avant A-10, DOJO-PUBLISH-SCALE-1 avancé.
- Capacité (définition du G1, à ratifier) : un lancement finit avant le créneau suivant (3 600 s), condition de la cadence de PB-2 ;
  (10 000, 365) extrapolé (≈ 19 600 s, ≈ 944 Mo) est hors capacité et au-delà de `MemoryMax`.
- CA : délai T = 740 000 ms (pire CLI mesurée 587,4 s × 1,25, arrondi à la dizaine), pour le même domaine.
- Bornes : `MAX_FILES` (1 024) et `MAX_TOTAL_BYTES` (2 Gio) confirmées dans le domaine couvert (368 fichiers et 123 Mo au plus) ;
  aucun changement de `VERIFY_BOUNDS` ni de `DOJO_LIVE_BOUNDS`.
- Hôte : facteur inconnu ; la durée de chaque lancement réel (journal de l'unité, dès A-5p) va au JOURNAL et reste sous 80 % de
  `TimeoutStartSec`, sinon STOP et DOJO-PUBLISH-SCALE-1.

- **Q-G1-6** : ratifier cette ligne (valeurs, domaine, définition de la capacité, règle des 80 %) ? Recommandation : oui ; à N réel
  (1 144 mesuré) le domaine tient un an de `snapshot` ; DOJO-PUBLISH-SCALE-1 (déclencheur : 30e `snapshot` servi) reste la voie de la
  croissance de N.

## Remise (2026-10-01, `date -u` 00:05:30Z)

- Heures principales : 22:48:50Z sceau ; 23:10:41Z empreintes ; 23:12:44Z et 23:29:37Z consignes de l'orchestrateur ; 23:18Z à
  00:03:38Z grille SCALE ; 23:43Z à 00:04:35Z courses du G1 sur le clone ; 23:44:18Z et 23:55Z mesures R-25 ; 00:05:22Z jonctions
  retirées ; 00:05:30Z empreintes finales.
- Course finale (00:04:32Z) sur le clone `gel`, dont les sept fichiers du lot égalent le worktree (comparé par sha256 à 00:05:30Z) :
  `test/dojo-publish-deploy.test.ts` et `test/dojo-collect-deploy.test.ts`, **19 tests : 18 verts, 1 sauté par nom (T-A10), 0 rouge**
  (`F:/tmp/dojo/pr3b2a/run5.tap`, `25e09f2a…d8d4d`) ; portes statiques sur l'état final du code (23:55Z à 23:57Z) : `tsc` 0, ESLint du
  fichier 0, cliquet 69/69, vocabulaire OK (`static-3.log`). Lignes `// killer:` et table des mutants recontrôlées : 11 et 19, 0 refus.
- Nettoyage : jonctions du clone `gel` retirées par `rm-nm.ps1` (00:05:22Z) ; `F:/Monark/node_modules` : 220 entrées et 11 `@monark`
  avant (23:42:53Z) et après (00:05:22Z) ; clé jetable de la sonde d'environnement supprimée (chemin fixe) ; clones `gel` et
  `r25clone` gardés sous `F:/tmp/dojo/pr3b2a/` (cités), arbres SCALE gardés (cités).
- Empreintes finales des fichiers du lot (celle de ce journal est rendue hors du fichier : `REPONSE.md`, `DELIVERED.sha256`) :
  - `deploy/monark-dojo-publish.service` (58 l.) `d7f679d0b914fb86ff80874e49aa4680349505b04f157cf5760db01c0922aee6`
  - `deploy/monark-dojo-publish.timer` (27 l.) `81e893246ad6659f74ceec84b3d165d3dee62f1eb9e6dbdb08f03f927be93b8c`
  - `deploy/Caddyfile.monark-dojo` (28 l.) `67bb93ac4c14f3abd2c457bddd8081b26bdab90bb9e53f09101a13f6ad72f08f`
  - `scripts/dojo-deploy.mjs` (62 l.) `04db3116f3873d4019d654361d5206164ec0a48bc91ad830408067aaaf8ce48c`
  - `scripts/dojo-deploy.d.mts` (27 l.) `82f3faa0c1630a0625b646055163a6f2eeb8bcad859c1920863483a8790ca206`
  - `test/dojo-publish-deploy.test.ts` (415 l.) `9e8678e80358a09217470c05b7825cb7daf62d98fb629117c79c1132451745d3`
  - `docs/RUNBOOK-dojo.md` (727 l.) `0d6afe15149958119e5eb6b893155735f9c1d69451746ef192827399fa7668db`
- Verdict du G1 : **LIVRÉ-AVEC-RÉSERVES**. Réserves : (1) F2P, mutants et oracle non faits (décision 300 : inspection finale) ;
  (2) T-A10 sauté par nom jusqu'à A-4p (PB-6), refus prédit de `red-proof` sur ce rang (Q-G1-4) ; (3) SCALE : (10 000, 365) extrapolé,
  hôte non mesuré (Q-G1-6) ; (4) deux directives de l'unité au-delà de 160 caractères (Q-G1-2) ; (5) trouvailles hors lot à trancher :
  connexion inactive de la CLI `--url` (Q-G1-5), format de `sha256sum` au §4 (Q-G1-9).
