Modèle résolu : claude-opus-5-5[1m]

# MICRO-PLI 1b — lot UKEMI-CONC-1 (corrections cp-2 C-V-1 / C-V-2 + G2 C-G2-1b / C-G2-2 / C-G2-3) — rendu au fil de l'eau

- Worker : `claude-opus-5-5[1m]`, effort max (décision 133). Aucun commit dans le worktree ni dans `F:\Monark` (R-20) ; commits
  locaux UNIQUEMENT dans des clones jetables sous `F:\tmp\ukemiconc-pli\` (autorisé par la mission). Rendu vérifiable (R-21).
- **DÉCLARATION EN TÊTE (par construction, pas un défaut du pli)** : le pli écrit dans `F:\Monark-wt-ukemiconc` (base `dec704d`, NON
  committé) utilise `args.heartbeatEvery`, champ qui n'existe QU'APRÈS la fusion de `lot/etude-suite` (RETRY-2/3 + HEARTBEAT-1, `12b6dcd`).
  Sur le worktree SEUL (MESURÉ, oracle 7 gates) : `typecheck` ROUGE (2 × TS2339, propriété absente sur `UkemiArgs`), `test` ROUGE (le test
  de battement — `args.heartbeatEvery` vaut `undefined` à l'exécution — et le test 42 d'export, qui relance ce typecheck sur l'arbre
  exporté), `lint` ROUGE (2 × `no-unsafe-assignment` sur ces 2 lignes) et `lint:ratchet` 71/69 (les mêmes 2) — UNE seule cause ; les
  7 gates sont VERTES sur le produit de fusion (1055/1053/0/2). Option retenue = « fusionner d'abord `lot/etude-suite` dans
  `lot/ukemi-conc-1` » (acceptée par la mission ; la fusion est À L'ORCHESTRATEUR, R-20). Procédure prouvée : § « Intégration ».
- **COMPTE G7 (supersède le « 1054/1053/0/1 après C-V-2 » du cp-2 §3 : ce pli ajoute DEUX tests, C-V-2 ET C-G2-2)** : arbre principal
  (A-rawlogs présent) **1055 / 1054 / 0 / 1** ; clone frais **1055 / 1053 / 0 / 2** (mesuré sur M_final).
- Entrées lues : `docs/CHECKPOINT2-lot-ukemi-conc-1.md` @ `lot/etude-suite` (`0383e5b`) ; `F:\tmp\cp2-ukemiconc\rejeu\hb.mjs`
  (sha256 `debfb95f…`) et `apply-rc1.mjs` (sha256 `b6e97d45…`) en lecture seule ; `F:\tmp\ukemiconc\G1.md` (R-C-1, R-C-2) ;
  `F:\tmp\ukemiconc\mutants.mjs` ; `docs/CONSIGNE-STANDARD-G1.md` A-1..A-13.

## Choix d'intégration — pourquoi la fusion d'abord (option (β)), et pas une variante « verte sur la branche seule »

- Discriminant ([lu] fichier:ligne @ `dec704d`) : la clause C-V-2 « la passe de rejeu repart de zéro (ses lignes `..filter` à 5/52) » exige
  que la passe SÉQUENTIELLE `enumerateAndCountAtRisk` batte à la période du drapeau ; sur `dec704d` elle bat à `% 2000` codé en dur
  (`record.ts:94`, `grep -n` sur le blob `dec704d`) et `--heartbeat-every` n'est parsé nulle part ⇒ sur 52 holders, AUCUNE ligne `..filter`, quel que soit le câblage du
  préfetch. Le test tel que spécifié n'est donc vert QUE sur un arbre qui contient HEARTBEAT-1 (`12b6dcd`).
- (α) « même parse que RETRY » recopié sur le lot = ajouter `heartbeatEvery` à `UkemiArgs`/`parseUkemiArgs` ⇒ le `deepEqual` FERMÉ de
  `apps/sentinel/test/ukemi-record.test.ts:23,25` @ `dec704d` (sortie complète de `parseUkemiArgs`) rougit sur la branche seule ; le réparer = toucher
  un fichier HORS périmètre et recopier du code d'un autre lot (déjà revu) + le `% every` du cœur séquentiel ; conflit évité seulement si
  chaque hunk est identique octet pour octet. Écarté.
- (1b) « valeur existant des deux côtés » : rien ne porte la période côté lot ; un `parseHeartbeatEvery(argv)` local laisserait DEUX
  parseurs du même drapeau après fusion, un câblage ≠ `every: args.heartbeatEvery` (texte de C-V-1), et la clause « rejeu à 5/52 »
  resterait ROUGE sur la branche seule (cœur à `% 2000`). Écarté.
- (β) retenue : le pli = EXACTEMENT les octets de C-V-1 (`apply-rc1.mjs` du validateur ⇒ `record.ts` fusionné `4dce62d3…` = son
  `rc1-record.sha`) + `t=` de C-G2-1b (⇒ `ceffc370…` = `record.pli.ts` du G2) ; aucune duplication ; la fusion de `lot/etude-suite` dans
  `lot/ukemi-conc-1` est faite par l'orchestrateur (R-20) ; mes preuves tournent sur le produit de fusion (clone jetable).

## Intégration — trois voies équivalentes pour l'orchestrateur (R-20 : c'est lui qui committe et fusionne), toutes PROUVÉES

Constat commun : **cinq chemins de fusion ⇒ un seul arbre** (non-docs), 0 conflit (`record.ts` auto-merged) ; le `record.ts` fusionné est
`ceffc370…` quel que soit l'ordre.
1. **Committer le pli puis fusionner** (ordre advisor) : dans le worktree, commit des 3 fichiers (commit ROUGE seul au typecheck, par
   construction) puis `git merge --no-ff lot/etude-suite` ⇒ vert. Prouvé : P_a2 `127e4dd` → M_final `3ce8697` (clone) ; et le sens G7
   (etude-suite `c7335bc` ← P_a2) ⇒ `e7e9c9b`, MÊME arbre `5ff87820…`.
2. **Fusionner d'abord, puis committer le pli** (option « la plus simple » de la mission ; chaque commit vert) : dans le worktree sale,
   `git merge --autostash --no-ff lot/etude-suite` ⇒ « Applied autostash », puis commit du pli. Prouvé : `clone2` (tip `ea9c8e3`) ⇒
   fichiers = `DELIVERED-pli1b-merged.sha256` 3/3, non-docs == M_final.
3. Variante par patch : `pli-1b.patch` (sha256 `8626e3a3…`) passe `git apply --check` et reproduit les octets SUR `dec704d` (⇒
   `DELIVERED-pli1b.sha256` 3/3) ET SUR le back-merge sans pli `a9af2e5` de `clone2` (⇒ `DELIVERED-pli1b-merged.sha256` 3/3).
Après l'une ou l'autre : `sha256sum -c F:\tmp\ukemiconc-pli\DELIVERED-pli1b-merged.sha256` doit rendre 3/3 OK dans le worktree fusionné
(tant que `lot/etude-suite` n'apporte que des `docs/` au-delà de `ea9c8e3`) ; re-G2-delta sur `M..P` (ordre 2) ou `dec704d..P_a` (ordre 1).
R-25 de la PR vers etude-suite = 692 dans les deux cas (mesuré, § R-25).

## Correspondance aux listes fermées (cp-2 C-V-1..C-V-3 ; G2 C-G2-1..C-G2-4, O-1..O-4)

| Item | Statut dans ce pli | Où / preuve |
|---|---|---|
| **C-V-1** = C-G2-1 (cœur) | FAIT | `every: args.heartbeatEvery` dans les 2 appels (`record.ts:416/453` lot ; `:438/476` fusionné) ; fusionné sans `t=` = `4dce62d3…` = `rc1-record.sha` du validateur ; mutants MV1/MV2 (comportement + type), MV3/MV4/MV5 (période) |
| **C-V-2** = C-G2-1 (test) | FAIT (+ renforcé) | `ukemi_conc_heartbeat_every_paces_both_prefetches_and_the_replay_restarts_at_zero` : `--filter-only --concurrency 4 --heartbeat-every 5`, synth(48) ⇒ 10 lignes `..prefetch pass=filter`, 1re `5/52`, puis rejeu à `5/52` ÉGAL au run n=1 ; + passe LIVRE (10 lignes, exigée par le mutant « retiré sur book ») ; + sonde `--heartbeat-every 1` (remise à zéro des DEUX compteurs, R-C-2) ; la variante G2 (`--heartbeat-every 10` ⇒ 5 lignes) est couverte par la même mécanique à période 5 |
| **C-V-3** / **C-G2-4** (texte ADR) | HORS pli (orchestrateur, R-20) | données fournies § « Pour l'insertion ADR » |
| **C-G2-1b** | FAIT | `t=${new Date(deps.now()).toISOString()}` sur la ligne `..prefetch` (`record.ts:407` lot / `:429` fusionné) ⇒ `record.ts` fusionné `ceffc370…` = `record.pli.ts` du G2 ; `every: number` OBLIGATOIRE dans `PrefetchOpts`, les 2 `?? 2000` retirés (le seul défaut vit dans le parse `reqInt("--heartbeat-every", 2000)`) ; mutants MT1 (`t=` retiré), MT2 (`t=` sur l'horloge murale : liage A-10), MV1/MV2 côté type (tsc TS2345 « Property 'every' is missing ») |
| **C-G2-2** | FAIT | `ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained` (n=8, portail 20 ms, désaccord de quorum sur la 1re lecture du clone 24) ; G2M8 ROUGE (22 requêtes distinctes / 43 après l'arrêt contre ≤ 7 / ≤ 14) ; G2M1 ROUGE (chaîne `drpc.org` cassée) |
| **C-G2-3** | FAIT | 2 blocs AJOUTÉS au test du portail : (1) écart global min < IV/2 ⇒ G2M3b ROUGE ; (2) `slowOperators` à travers `makePoliteGate` (pool) ET `--slow-operator` sur le chemin servi (portail partagé de `record.ts`) ⇒ G2M19 ROUGE, MS1 ROUGE |
| O-4 (commentaire périmé `ukemi-u4a.test.ts:149`) | NON touché | hors du périmètre fixé par l'orchestrateur (3 fichiers) ; disposition du G2 « sinon au prochain lot touchant ce test » = item formé à déclencheur, inchangé |
| O-1..O-3 | sans objet pour ce pli | O-3 = item UKEMI-CONC-BOUND-1 (orchestrateur) |

## Pour l'insertion ADR (C-V-3 / C-G2-4 — texte à l'orchestrateur ; FAITS mesurés dans ce pli, à citer)

- R-C-1 : APPLIQUÉ (C-V-1 = C-G2-1) ; R-C-2 : FERMÉ par test (mutants MV6 `config_read` et MV7 `n_at_risk_config` rouges) ; ni l'un ni
  l'autre n'est plus un résidu.
- Tuyau « Sortie » : battement stderr `..prefetch pass=<filter|book> holders_done=… n_at_risk_config=… rate=… concurrency=… calls={…}
  errors={…} t=<ISO de deps.now>` tous les `--heartbeat-every` holders traités (plus « tous les 2 000 ») ; `every` OBLIGATOIRE dans
  `PrefetchOpts` (défaut unique : le parse) ; relation R-U-5 : à n > 1, le battement du temps 2 EST `..prefetch pass=book` (G2 §5.2).
- Table §2, « lectures lancées après le stop » : chemin filtre = M3/M3b (test budget du lot) ; chemin LIVRE =
  `ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained` (G2M8 rouge) — plus « déclaratif ».
- Portail : opérateurs distincts NON sérialisés et opérateur lent (`slowOperators` / `--slow-operator`) désormais ÉPINGLÉS par test
  (G2M3b, G2M19, MS1 rouges).
- Compte de tests : +2 tests (`ukemi-conc.test.ts` : 11 → 13) ; R-25 de la PR lot → etude-suite : **692** (588 + 104 net).

## Fichiers modifiés (périmètre élargi par l'orchestrateur : `record.ts`, `prefetch.ts`, `ukemi-conc.test.ts` ; rien d'autre)

| Fichier (chemin relatif au worktree) | Worktree (lignée lot, `dec704d` + pli) sha256 | Après fusion `lot/etude-suite` sha256 | Diff vs `dec704d` |
|---|---|---|---|
| `apps/sentinel/src/ukemi/record.ts` | `cf784bb46b5eacad7c736f17fa8259a4cad89fabe3eb53e3d5f2339d0a8b5ca6` | `ceffc3703ab298e961bcb8b01262c8354c4872a5dbc3988e00b55d799b89dd42` (= `record.pli.ts` du G2) | 3 lignes remplacées (407 `t=`, 416/453 `every`) |
| `apps/sentinel/src/ukemi/prefetch.ts` | `47bf52ce0b34bcb8d8ddda1eb298662cc47e3525fb9b29518c9bf1e54e6e0533` | identique | +6 / −4 (`every` obligatoire, 2 défauts retirés, 2 docs) |
| `apps/sentinel/test/ukemi-conc.test.ts` | `3acc52016596d212f07a3d7ff5baf6b43adccccf777345281a1d0429f076cf86` | identique | +102 / −0 (AUCUNE ligne existante modifiée : D-4) |

- `F:\tmp\ukemiconc-pli\DELIVERED-pli1b.sha256` = la colonne worktree (`sha256sum -c` 3/3 OK dans le worktree) ;
  `F:\tmp\ukemiconc-pli\DELIVERED-pli1b-merged.sha256` = la colonne « après fusion » (`sha256sum -c` 3/3 OK sur le produit `clone2`) ;
  `F:\tmp\ukemiconc-pli\pli-1b.patch` = `git diff --full-index dec704d -- <3 fichiers>` du worktree (190 lignes, sha256 `8626e3a3…`).
- Blobs : `git hash-object` des 3 fichiers du worktree == blobs du commit jetable P_a2 `127e4dd` (vérifié) ; LF (`git ls-files --eol` :
  `i/lf w/lf`), 0 CR, 0 octet non-ASCII dans le test (recompte node).

## Tests du pli (`apps/sentinel/test/ukemi-conc.test.ts`, 11 → 13 tests ; seules des lignes AJOUTÉES)

| Test | Correction | Ce qu'il asserte (chemin servi : `runRecorder`, vrai `openGuardedClient`, seul `globalThis.fetch` bouchonné) |
|---|---|---|
| `ukemi_conc_heartbeat_every_paces_both_prefetches_and_the_replay_restarts_at_zero` (NOUVEAU) | C-V-1, C-V-2, C-G2-1, C-G2-1b, R-C-2 | synth(48), `--heartbeat-every 5` : n=4 filtre ⇒ exactement 10 `..prefetch pass=filter` (5/52..50/52, `concurrency=4`, `t=` == ISO de `deps.now`), TOUTES avant le rejeu, dont les lignes `..filter` == celles du run n=1 (config_read ET n_at_risk_config) ; `--heartbeat-every 1` ⇒ 1re ligne du rejeu `config_read=1/52 n_at_risk_config=0` ; livre n=4 ⇒ exactement 10 `..prefetch pass=book` (même forme) et rien d'autre. Capture stderr par TEE |
| `ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained` (NOUVEAU) | C-G2-2 | n=8, portail 20 ms, désaccord de quorum sur la 1re lecture du clone 24 : rejet `/disagree/`, diag `QuorumDisagreementError` + `pool.concurrency 8` ; après attente : chaque ledger rejoué par `verifyCycleLedger`, `unlocked` DERNIÈRE ligne, 0 verrou ; après l'arrêt ≤ n−1 requêtes distinctes et ≤ 2(n−1) émissions, ≥ 1 (non vacuité) |
| `ukemi_conc_polite_gate_spaces_issues_per_operator_under_concurrency` (2 blocs AJOUTÉS en fin) | C-G2-3 | (1) écart global min entre émissions des 2 opérateurs < IV/2 ; (2) pool `slowOperators: ["b.example"]`, 3×IV : écarts b ≥ 75 ms ; chemin servi `--slow-operator mevblocker.io --slow-interval-ms 40 --min-interval-ms 10 --concurrency 4` : ≥ 5 émissions mevblocker, écarts ≥ 40 ms |

## Mutants — harnais final `F:\tmp\ukemiconc-pli\mutants-pli1b-final.mjs` (sha256 `04d65f96…` = en-tête du passage 3 ; `logs/mutants-pli1b-final3.log`, sha256 `c104ecb8…`)

En-tête A-12 : HEAD `3ce8697` (M_final), arbre `5ff87820…`, working tree vide, node v24.15.0 / uv 1.51.0 / win32 x64 ; BASELINE 13/13 ok,
tueurs visés verts, `tsc` 0. Résultat : **15/15 KILLED byIntended** (not_ok=1 chacun sauf G2M1 : 5 tests rouges dont le tueur visé),
**MV1/MV2 aussi tués au TYPE** (`tsc` status 2, TS2345 `record.ts(438,80)` / `(476,74)` + « Property 'every' is missing in type … but
required in type 'PrefetchOpts' »), restauration octet-exacte 15/15, doré final intact, arbre inchangé, exit 0 (08:08:47-08:15:29Z).
Les 4 mutants du G2 utilisent ses chaînes VERBATIM (vérifié par le harnais sur la forme JSON source de `g2-mutants.mjs`, sha256 `44ae8e37…`).

| # | Fichier | Mutation | Tueur (nommé) | Assertion qui tombe |
|---|---|---|---|---|
| MV1 | record.ts | câblage filtre retiré | battement + **tsc** | « filter prefetch … exactly 10 lines, 5/52 first » |
| MV2 | record.ts | câblage livre retiré | battement + **tsc** | « book prefetch … exactly 10 lines, 5/52 first » |
| MV3 | record.ts | période filtre `+ 1` | battement | « filter prefetch … » |
| MV4 | record.ts | période livre `+ 1` | battement | « book prefetch … » |
| MV5 | record.ts | période filtre = `args.retries` | battement | « filter prefetch … » |
| MV6 | record.ts | remise à zéro `config_read` retirée | battement | « the replay pass restarts at zero: 5/52 first » |
| MV7 | record.ts | remise à zéro `n_at_risk_config` retirée | battement | « every 1: … config_read=1/52 n_at_risk_config=0 » |
| MV8 | prefetch.ts | filtre : `opts.every` ⇒ `2000` | battement | « filter prefetch … » |
| MT1 | record.ts | `t=` retiré (sha muté = `4dce62d3…` = état C-V-1 seul) | battement | « filter prefetch … » (regex fermée) |
| MT2 | record.ts | `t=` sur `Date.now()` au lieu de `deps.now()` | battement | « each prefetch line: … t=<ISO of deps.now> » |
| MS1 | record.ts | portail partagé construit SANS le jeu lent | portail | « --slow-operator … 9 issues >= 40 ms » (écarts 13,6-56 ms) |
| G2M8 | prefetch.ts | contrôle d'arrêt par lecture retiré (livre) | arrêt livre | « 22 distinct request(s), 43 fetch(es) after it (<= 7, <= 14) » |
| G2M1 | pool.ts | `Promise.all` ⇒ `Promise.race` (pas de drain) | arrêt livre | « drpc.org: the chain replays (no line on a stale head) » (CHAIN-1) |
| G2M3b | rpc2.ts | portail à clé GLOBALE `"*"` | portail | « global min gap 26.07 ms < 12.5 ms » |
| G2M19 | rpc2.ts | jeu lent ignoré dans le portail | portail | « slowOperators: b.example … >= 75 ms (gaps ≈ 30) » ; sonde : le volet servi l'est AUSSI (mevblocker 14,8-31 ms < 40, `logs/probe-gate-g2m19.log`) |

Tueurs : battement = `ukemi_conc_heartbeat_every_paces_both_prefetches_and_the_replay_restarts_at_zero` ; arrêt livre =
`ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained` ; portail = `ukemi_conc_polite_gate_spaces_issues_per_operator_under_concurrency`.
Exigence mission « ≥ 3 (câblage retiré sur filter ; retiré sur book ; période mal passée) » : MV1, MV2, MV3/MV4/MV5 ; exigence extension
« G2M8, G2M3b, G2M19 rouges » : oui, par le test nommé de chaque correction.

## Consigne standard : point par point (`docs/CONSIGNE-STANDARD-G1.md`, A-1..A-13 + B..F + G-1)

- **A-1** fait — 1re ligne `Modèle résolu : claude-opus-5-5[1m]`.
- **A-2** fait (variante déclarée, comme le D-6 du G1) — clone : `npm ci --ignore-scripts` ⇒ `require.resolve('@monark/rpc-guard')` =
  `F:\tmp\ukemiconc-pli\clone\packages\rpc-guard\src\index.ts` ; worktree : `node_modules` préexistant (`npm ci` du G1) ⇒
  `F:\Monark-wt-ukemiconc\packages\rpc-guard\src\index.ts`. Aucun retrait fait.
- **A-3** fait — codes capturés directement (`oracle-pli.sh` : `cmd > log 2>&1; echo exit=$?`).
- **A-4** fait — `DELIVERED-pli1b.sha256` (+ `-merged`) ; rendu sous `F:\tmp\ukemiconc-pli\` ; AUCUN commit dans le worktree ni `F:\Monark`
  (commits jetables dans `clone`/`clone2` seulement, autorisés) ; aucun réseau (seul `globalThis.fetch` bouchonné ; hôtes `.example`) ;
  rien écrit sur `C:` par le worker (TEMP/TMP/TMPDIR/cache npm sur `F:`) — le harness Claude Code persiste seul certaines sorties d'outil.
- **A-5** fait — R-25 = 692 < 1 150 (pathspec VERBATIM `ci.yml:65`, 15 jetons).
- **A-6** fait — 9/9 (worktree avant/après, blobs P_a2, blobs M_final), extraits programmatiquement du prereg §(2).
- **A-7** fait — ceinture `env -u` des 8 clés sur toute commande node/npm ; harnais et sondes retirent aussi les 8 clés (insensible à la
  casse) ; aucune variable affichée (contrôle de liste de processus : lignes de commande filtrées, aucune clé lue).
- **A-8** fait — corps JSON-RPC de forme réelle (`{"jsonrpc":"2.0","id":1,"result":…}`), valeurs = octets enregistrés ; la valeur
  empoisonnée de C-G2-2 est un mot de 32 octets de forme réelle (seule sa VALEUR diffère entre les deux opérateurs).
- **A-9** n-a — aucune phrase servie du produit touchée (la ligne `..prefetch` est un journal opérateur stderr).
- **A-10** fait — liage de sortie : `t=` == ISO de `deps.now` (MT2 horloge murale ⇒ rouge) ; période servie == drapeau (MV3/MV5).
- **A-11** fait — `--test-reporter=tap`, CRLF normalisé, « tué » seulement si `not ok … - <tueur attendu>`.
- **A-12** fait — en-têtes auto-identifiants (HEAD, arbre, node/uv/plateforme, commandes, sha du harnais et de `g2-mutants.mjs`, dorés ;
  par mutant : hunk, sha muté, sha restauré) ; `oracle-*/HEADER.txt`.
- **A-13** fait — tout fichier portant `\\` écrit par Write/Edit (tests, harnais, sondes, scripts d'application), recomptes dans node
  (`count-bs.mjs`, `check-harness-bs.mjs`) ; piège RENCONTRÉ ici : un `node -e` de recompte passé par l'outil Bash (guillemets doubles)
  a rendu des comptes faux (`\\\\.` ⇒ `.` : 496 « occurrences ») — écarté, refait par fichier Write (2 barres obliques inverses réelles).
- **B-1..B-3, B-6** n-a (aucune clé, aucun hôte, aucun corps payant). **B-4** fait — `record.ts` ne lit aucune env (inchangé). **B-5**
  fait — lignes AJOUTÉES de `src` : 0 `fetch(`, 0 `process.env`, 0 nom de clé payante, 0 `child_process`/`undici`/`node:http`
  (`logs/added-src-lines.txt`, 9 lignes).
- **C-1..C-4** inchangés (aucune classe d'erreur, aucun retry touché).
- **D-1** fait — 15 mutants de comportement + 2 de type, chacun avec son tueur NOMMÉ. **D-2** fait — jeu non vide (52 holders, 4 genres),
  listes FERMÉES (`TICKS`, bornes structurelles), valeurs recomputées (référence n=1). **D-3** fait — composition sur le chemin servi
  (`runRecorder`, vrai `openGuardedClient`, ledgers sur disque rejoués par `verifyCycleLedger`). **D-4** fait — test : +102 / −0, aucune
  ligne existante modifiée, aucune assertion affaiblie.
- **E-1/E-2** inchangés (drain avant `unlock` maintenant épinglé aussi sur arrêt NON budgétaire du chemin livre). **E-3** n-a (aucun
  nouveau délai ; intervalles des tests = paramètres de test).
- **F-1** données d'insertion fournies (tuyaux mis à jour ci-dessus ; aucun renvoi `F:\tmp` dans le code). **F-2** fait — lignes
  ajoutées ASCII (recompte node : 0 non-ASCII). **F-3** fait — déviations D-n ci-dessous.
- **G-1** n-a — aucune pièce publique touchée.

## Observations (non bloquantes, disposition formée — zéro dette nue)

- **O-P1** `prefetch.ts` ne revalide pas `every >= 1` (le cœur séquentiel de HEARTBEAT-1 le fait : `record.ts` fusionné `:71-72`) : un
  `every: 0` y donnerait `% 0` ⇒ NaN ⇒ battement muet. Seul appelant de production = `args.heartbeatEvery`, refusé `< 1` au parse
  (pré-vol, `record.ts` fusionné `:169-170`) ; `every` étant désormais OBLIGATOIRE et typé, aucun défaut caché ne subsiste. Disposition :
  aucune action dans ce pli (hors liste fermée, périmètre fixé) ; item formé **UKEMI-CONC-EVERY-GUARD-1**, déclencheur : apparition d'un
  2ᵉ appelant de `prefetchFilterReads`/`prefetchBookReads` hors tests (ajouter alors la garde en cœur, calque HEARTBEAT-1) ; propriétaire :
  orchestrateur.
- **O-P2** Bornes du test C-G2-2 ATTEINTES par le doré (7 = n−1 distinctes ; 13 ≤ 14) : ce sont des bornes STRUCTURELLES (fenêtre pleine :
  chacune des n−1 tâches en vol termine sa lecture courante), pas des seuils de temps ; mesuré 20/20 exécutions identiques ; G2M8 à 22/43.
  Disposition : aucune (documenté pour le re-G2-delta).

## `error_origin` proposé (assignation au G7 par l'orchestrateur)

- C-V-1 / C-G2-1 / C-V-2 / C-G2-1b : **`plan`** (lots CONC et RETRY/HEARTBEAT-1 planifiés en parallèle, composition différée par conception ;
  le déclencheur de R-C-1 était déjà tiré au rendu du G1 — cp-2 §1-bis ; concorde avec la proposition du G2).
- C-G2-2, C-G2-3 : **`implémentation G1`** (tests ; trou préexistant de l'ancien `polite` repris par la réécriture du portail pour C-G2-3 ;
  concorde avec le G2).
- Défauts de CE pli, attrapés avant rendu, sans effet sur le code livré : critère de type du harnais (MV1/MV2, passage 2) et comptes faux
  d'un `node -e` passé par l'outil Bash (A-13) — **`implémentation pli (outillage de preuve)`**.

## Provenance

Worker `claude-opus-5-5[1m]` (effort max, décision 133) ; 2026-09-23 07:10:46-08:27 UTC ; base `dec704d` (lot) ; fusions à blanc contre
`lot/etude-suite` `d55fbb7`, `c7335bc`, `ea9c8e3` ; contexte : mission MICRO-PLI 1b + extension C-G2-1b/2/3 (orchestrateur
`claude-fable-5-1`) ; entrées : cp-2 (`docs/CHECKPOINT2-lot-ukemi-conc-1.md`), G2 (`F:\tmp\g2-ukemiconc\G2.md`, lecture seule) ;
consultations advisor intégré : n°1 (après orientation, avant code) et n°2 (avant clôture) ; réviseur attendu : re-G2-delta (instance
fraîche) puis vérification adversariale R-21 et G7 de l'orchestrateur. Aucun commit hors clones jetables, aucun workflow (R-20).

## Déviations déclarées (F-3)

- **D-1** Oracle « sur le worktree » : le worktree SEUL est ROUGE par construction (`typecheck`, `test`, `lint`, `lint:ratchet` — cause
  unique, § journal 08:19-08:21) ; l'oracle probant est
  celui du produit de fusion M_final (clone), octets == ceux que le worktree aura après la fusion de l'orchestrateur. L'oracle du worktree
  est quand même exécuté et rendu (état rouge documenté, gate par gate).
- **D-2** R-25 : la forme littérale `2c276bb...HEAD` n'est probante que sur la lignée lot (P_a2 : 692) ; sur un produit de fusion elle
  compte le code d'etude-suite (3 590) — c'est la forme CI `<pointe etude-suite>...HEAD` (692) qui vaut pour la PR.
- **D-3** Pointe d'etude-suite : la mission nommait `0383e5b` puis `efea5db` ; la pointe a avancé (`d55fbb7`, `8a05bab`, `c7335bc`,
  `ea9c8e3`) par des commits `docs/` seuls (mesuré) ; preuves faites contre `d55fbb7`, `c7335bc` (M_final) et `ea9c8e3` (clone2).
- **D-4** Extension de mission en cours de route (C-G2-1b/2/3) : les preuves intermédiaires (C-V-1/C-V-2 seuls : harnais 8/8,
  `logs/mutants-pli1b-final.log`) restent au journal ; les preuves de clôture portent sur l'état final.

## Journal (horodaté `date -u`)

- 07:10:46Z — orientation. Worktree `F:\Monark-wt-ukemiconc` : HEAD `dec704d3c539…`, branche `lot/ukemi-conc-1`, `git status` vide ;
  `sha256sum -c F:\tmp\ukemiconc\DELIVERED.sha256` = 6/6 OK. `lot/etude-suite` = `0383e5b6109c…` ; merge-base(lot, etude) = `2c276bb`.
  `git diff --stat db86efc 0383e5b` = 6 fichiers `docs/` seulement ⇒ la dernière pointe NON-docs d'etude-suite reste `db86efc`.
- 07:1x Z — constat structurel (AVANT code, [lu] fichier:ligne) :
  - `dec704d:apps/sentinel/src/ukemi/record.ts` : `UkemiArgs`/`parseUkemiArgs` n'ont PAS `heartbeatEvery` ; la passe séquentielle
    `enumerateAndCountAtRisk` bat à `% 2000` codé en dur (`record.ts:94` @ `dec704d`) ; appels préfetch `:416` (filtre, suivi de la
    remise à zéro `progress.config_read = 0; progress.n_at_risk_config = 0;`) et `:453` (livre) sans `every`.
  - `0383e5b` (RETRY-2/3 + HEARTBEAT-1, `12b6dcd`) ajoute : `heartbeatEvery` à `UkemiArgs` + parse `reqInt("--heartbeat-every", 2000)`
    refusant `< 1` ; `enumerateAndCountAtRisk(opts.heartbeatEvery)` + `% every` ; l'appel `{ fromBlock, heartbeatEvery: args.heartbeatEvery }` ;
    ET met à jour `apps/sentinel/test/ukemi-record.test.ts:23,25` (`deepEqual` FERMÉ sur la sortie de `parseUkemiArgs`, + `heartbeatEvery`).
  - Précédent de capture stderr (RETRY, `ukemi-guard-record.test.ts` @ `0383e5b`, `captured`/`capturedSplit`) : une redirection qui
    AVALE la sortie mange des vidages TAP différés d'autres tests (« measured: 5 of 14 tests then go uncounted ») ⇒ capture par TEE.
  - Processus de course vivants, non touchés : 22236 (`record.ts` essai 5), 102592 (Bell `collect.ts`) ; lecture seule de la liste.
- 07:2x Z — **consultation advisor intégré n°1 (après orientation, AVANT code ; conseil, jamais verdict)**. Retenu :
  (1) discriminant nommé : la clause C-V-2 « la passe de rejeu repart de zéro (lignes `..filter` à 5/52) » est INOBSERVABLE sur
  `dec704d` seul (`% 2000` codé en dur ; l'avis citait `:93`, mesuré `:94` par `grep -n` du blob) ⇒ le test tel que spécifié n'est vert QUE sur le produit de fusion ;
  (2) séquence du clone = miroir de l'orchestrateur : P = `dec704d` + pli (lignée lot, typecheck ROUGE attendu) → fusion `0383e5b` → M ;
  pré-déclaration 1054/1052/0/2 en clone frais ; (3) piège R-25 : `2c276bb...M` compterait les ~2 800 lignes non-docs
  d'etude-suite — la forme « 588 + delta » est `2c276bb...P` ; mesurer aussi `0383e5b...M` (forme CI d'une PR vers etude-suite) ;
  (4) écrire les MÊMES octets (P) dans le worktree, oracle worktree ROUGE au typecheck PAR CONSTRUCTION, déclaré EN TÊTE ; ne jamais
  copier le `record.ts` fusionné dans le worktree ; (5) mutants UNIQUEMENT sur M (sur `dec704d`, `args.heartbeatEvery` = `undefined`
  à l'exécution ⇒ test rouge même câblé ⇒ faux « tué ») ; le mutant « retiré sur book » impose une passe LIVRE dans le test ;
  « période mal passée » = `every: args.heartbeatEvery + 1` ; (6) capture stderr par TEE, regex `..filter` par préfixe (` t=` sur M),
  A-13 (Write + recompte node + `--eol`). Vérifié avant d'écrire dans le worktree : le G2 parallèle travaille dans SES clones
  (`F:\tmp\g2-ukemiconc\{base,clone,merge,mut,tip,wrk}`, `wrk` @ `dec704d`), pas dans `F:\Monark-wt-ukemiconc` ; le harnais
  `mutants-pli3.mjs` (pid 36952) a un cwd portant `mutants/` et `packages/rpc-guard/test/repair-tail.test.ts`, absents du worktree.
- 07:2x Z — clone jetable `F:\tmp\ukemiconc-pli\clone` (`git clone --no-hardlinks --no-checkout F:/Monark`, exit 0). **`lot/etude-suite` a
  avancé** : `0383e5b` → `fdf1589` → `d55fbb7` (`git diff --stat 0383e5b d55fbb7` = `docs/CHANTIERS.md` + 3 `.ots` sous `docs/course-bell/`,
  docs seuls) ⇒ la fusion à blanc est faite contre la pointe `d55fbb778e64…` (« 0383e5b ou plus »).
- 07:2x Z — back-merge de développement M0 = `dec704d` + fusion `d55fbb7` (`de2df8b`) : exit 0, **0 conflit** (`record.ts` auto-merged) ;
  `record.ts` de M0 = sha256 `606bf04b…` = EXACTEMENT le `record.ts` fusionné du validateur (cp-2 §1-bis « restauré `606bf04b…` »).
  `npm ci --ignore-scripts --cache F:/tmp/npm-cache` (ceinture A-7, TEMP/TMP/TMPDIR = `F:\tmp\ukemiconc-pli\tmp`) : exit 0 ;
  `require.resolve('@monark/rpc-guard')` = `F:\tmp\ukemiconc-pli\clone\packages\rpc-guard\src\index.ts`.
- 07:2x Z — C-V-1 par `F:\tmp\ukemiconc-pli\apply-cv1.mjs` (même substitution que `apply-rc1.mjs`, paramétrée par le chemin ; fail-closed :
  1 occurrence avant/après par passe, exactement 2 lignes changées, LF) : lignes 438/476 de M0 ; `git diff --stat` = 2 insertions / 2
  suppressions. **Le `record.ts` obtenu = sha256 `4dce62d3…` = `F:\tmp\cp2-ukemiconc\rc1-record.sha` du validateur (octet pour octet).**
- 07:2x-07:32 Z — test C-V-2 écrit par Edit (A-13) en fin de `apps/sentinel/test/ukemi-conc.test.ts` ; recompte node (`count-bs.mjs`) :
  22 barres obliques inverses = 2 préexistantes + 20 nouvelles (7 `\d+`, 4 `\.`, 3 `\/`, 2+2 accolades échappées, 1 `\r?\n`), 0 CR,
  0 non-ASCII. 1er jet 12/12 (`logs/conc-1.tap`) ; lignes stderr observées : `..prefetch pass=filter holders_done=5/52
  n_at_risk_config=2 … concurrency=4 …` ×10 puis `..filter config_read=5/52 n_at_risk_config=2 … t=2023-11-14T22:13:20.000Z` ×10, les
  lignes `..filter` du rejeu ÉGALES (config_read, n_at_risk_config) à celles du run n=1. Constat : à `--heartbeat-every 5` la remise à
  zéro de `n_at_risk_config` est INOBSERVABLE sur synth(48) (le cœur fixe `n_at_risk_config = atRisk` dès le 1er holder à risque, déjà
  vu à la 1re ligne : 2) ⇒ ajout d'une observation `--heartbeat-every 1` (le 1er tick du rejeu part AVANT le 1er décompte : compte,
  tick, puis décompte) ⇒ 1re ligne `config_read=1/52 n_at_risk_config=0` ; 12/12 (`logs/conc-2.tap`, 20,9 s). `tsc --noEmit` exit 0
  (`logs/tc-dev.log`), `eslint` des 2 fichiers exit 0 (`logs/lint-dev.log`).
- 07:3x Z — commits JETABLES (clone seulement) et convergence des chemins de fusion — **5 chemins, 1 seul arbre `e8c4006a2b2e…`** :
  P_b = M0 + pli (`da25fa5`) ; P_a = `dec704d` + pli (`24eef6b`, lignée lot : `record.ts` `f32bba31…`, test `ee09700a…`) puis
  M_a = P_a + fusion `d55fbb7` (`370563a`, exit 0, 0 conflit) ; sens G7 : `d55fbb7` + fusion P_a (`g7c`) et `d55fbb7` + fusion M_a
  (`g7b`) ; chemin « worktree sale » : `dec704d` + pli NON committé, `git merge --autostash --no-ff d55fbb7` ⇒ « Created autostash /
  Applied autostash », 0 stash résiduel, fichiers = P_b (`4dce62d3…`/`ee09700a…`), commit ⇒ même arbre. `git diff --quiet pb ma` exit 0.
- 07:35-07:41 Z — harnais `F:\tmp\ukemiconc-pli\mutants-pli1b.mjs` sur M_a (`370563a`, arbre `e8c4006a…`, working tree vide) :
  1er passage 8/8 KILLED (`logs/mutants-pli1b.log`) mais l'extraction du message d'échec rendait « |- » (bloc YAML) ⇒ extraction
  corrigée (1re ligne après `error: |-` DANS le bloc `not ok` du tueur), regex recomptée dans node (`check-harness-bs.mjs`) ; passage
  final **8/8 KILLED byIntended, not_ok=1 chacun (seul le test nommé rougit), restauration byte-exacte, arbre inchangé**
  (`logs/mutants-pli1b-final.log`, 07:38:42-07:41:12Z). Raisons (message de l'assertion qui tombe) : MV1/MV3/MV5/MV8 ⇒ « filter
  prefetch … exactly 10 lines, 5/52 first » ; MV2/MV4 ⇒ « book prefetch … » ; MV6 ⇒ « the replay pass restarts at zero » ; MV7 ⇒
  « every 1: the replay's first line is config_read=1/52 n_at_risk_config=0 ».
- 07:41 Z — **EXTENSION DE MISSION reçue de l'orchestrateur** : plier AUSSI C-G2-1b, C-G2-2, C-G2-3 du G2 du lot (PASS-AVEC-CORRECTIONS,
  `F:\tmp\g2-ukemiconc\G2.md`) dans le MÊME pli ; périmètre élargi à `prefetch.ts` ; pointe etude-suite de référence `efea5db`.
  L'état ci-dessus (C-V-1/C-V-2 seuls) devient une étape intermédiaire ; les preuves finales sont refaites sur l'état final.
- 07:4x Z — lecture du G2 (`F:\tmp\g2-ukemiconc\G2.md` l.1-338 : §2 (iii)/(iv), §3, §4, liste fermée l.282-291), de
  `proofs/rc1/R-C-1.diff` (3 hunks : `t=` `:429`, câblage `:438`/`:476`) et de `g2-mutants.mjs` (entrées G2M1/G2M3b/G2M8/G2M19,
  lecture seule). `lot/etude-suite` a encore avancé : `d55fbb7` → … → `8a05bab` (G2 persisté) → `c72dc01` → `c7335bc` ; non-docs
  identiques (`git diff --stat d55fbb7 c7335bc -- . ':(exclude)docs'` vide).
- 07:4x Z — branche jetable `dev2` (depuis M_a) : C-G2-1b `t=` par Edit ⇒ `record.ts` fusionné = sha256 `ceffc370…` = EXACTEMENT
  `F:\tmp\g2-ukemiconc\proofs\rc1\record.pli.ts` du G2 (octet pour octet) ; `prefetch.ts` : `every: number` OBLIGATOIRE dans
  `PrefetchOpts` (doc de l'interface), les deux `opts.every ?? 2000` ⇒ `opts.every`, doc de `tick` ; tests : regex `..prefetch` avec
  ` t=(\S+)$` et `t` == ISO de `deps.now` (A-10), nouveau test C-G2-2 (arrêt NON budgétaire sur le chemin LIVRE), assertions C-G2-3
  AJOUTÉES en fin du test du portail (aucune ligne existante modifiée). 13/13 (`logs/conc-3.tap`, 26,6 s) ; `tsc` 0 ; `eslint` 0.
- 07:5x Z — MESURES des marges (sondes hors dépôt, seul `globalThis.fetch` bouchonné) : `probe-stop.mjs` (scénario C-G2-2) doré
  **20/20 exécutions identiques** : 166 requêtes, arrêt à la 153e, **13 après, 7 distinctes** (bornes structurelles 14 / 7 : fenêtre
  pleine ⇒ chacune des n−1 tâches en vol termine SA lecture courante) ; sous **G2M8** (substitution recopiée de `g2-mutants.mjs`,
  restauration octet-exacte vérifiée) **5/5 : 196 requêtes, 43 après, 22 distinctes** (`logs/probe-stop-g2m8.log`). `probe-gate.mjs`
  (C-G2-3) ×3 : écart global min 0,06-0,08 ms (borne < 12,5) ; `slowOperators` b.example 77-91 ms (borne ≥ 75) ; chemin servi
  `--slow-operator mevblocker.io` 9 émissions, 43-95 ms (borne ≥ 40), drpc min 12,7-13,7 ms (non ralenti).
- 07:5x Z — P_b2 = M0 + pli complet (`298ceaf`, arbre `187b44b8…`) ; P_a2 = `dec704d` + pli complet (`127e4dd`, lignée lot ;
  `record.ts` `cf784bb4…` = 3 lignes 407/416/453 par `apply-pli1b-record.mjs`, fail-closed) ; M_a2 = P_a2 + `d55fbb7` (`be5e5b3`) :
  0 conflit, arbre == P_b2 ; **M_final = P_a2 + fusion `c7335bc`** (`3ce8697`, arbre `5ff87820…`) : exit 0, 0 conflit, non-docs == P_b2,
  `package-lock.json`/`package.json` inchangés depuis `dec704d` (node_modules valides).
- 07:59-08:0x Z — harnais FINAL `mutants-pli1b-final.mjs` lancé sur M_final (arrière-plan ; aucune autre écriture dans `clone` pendant
  qu'il tourne). En parallèle, opérations git en lecture seule sur des COMMITS (jamais l'arbre de travail du clone) et 2ᵉ clone :
  - **R-25** (`r25.mjs` : lit `ci.yml:65` AU commit, garde les 15 jetons du pathspec VERBATIM, ne remplace que la plage) :
    `2c276bb...dec704d` = 564/24 = **588** (lot, = G1/G2/cp-2) ; **`2c276bb...P_a2` = 668/24 = 692** (forme littérale de la mission,
    lignée lot) ; `dec704d..P_a2` = 111/7 = 118 (brut du pli ; les 7 lignes retirées sont des lignes AJOUTÉES par le lot, d'où
    588 + 104 net = 692) ; **`c7335bc...M_final` = 668/24 = 692** (forme CI d'une PR lot → etude-suite) ; piège mesuré :
    `2c276bb...M_final` = 3 501/89 = 3 590 — ce n'est PAS le diff de PR (il compte le code d'etude-suite depuis `2c276bb`).
    692 < 1 150 (borne ADR).
  - **A-6** (`a6.mjs` : les 9 couples (chemin, sha) extraits PROGRAMMATIQUEMENT de `docs/PLAN-u4b-prereg.md` §(2), sha256 LF recomputé) :
    worktree AVANT 9/9 ; blobs P_a2 9/9 ; blobs M_final 9/9 ; = `F:\tmp\ukemiconc\logs\A6-frozen9-before.txt` (diff vide).
  - Invariants : `git diff --quiet 2c276bb P_a2 -- book.ts ADR-U4b prereg apps/sentinel/test/fixtures package-lock.json packages
    scripts apps/bell` exit 0 ; `git diff --quiet c7335bc M_final -- (mêmes chemins)` exit 0 ; `dec704d..P_a2` = 3 fichiers
    (`prefetch.ts` 10, `record.ts` 6, `ukemi-conc.test.ts` 102) ; `book.ts` LF `cb1ba53c…`, prereg `1971d9b1…` (P_a2 et M_final).
  - 2ᵉ clone jetable `clone2` : chemin « worktree sale » avec le pli COMPLET : `dec704d` + 3 fichiers P_a2 non committés,
    `git merge --autostash --no-ff ea9c8e3` (pointe du moment, docs seuls après `c7335bc`) ⇒ exit 0, « Applied autostash », 0 stash,
    fichiers = `ceffc370…`/`47bf52ce…`/`3acc5201…` ; `git diff --stat M_final <produit> -- . ':(exclude)docs'` VIDE (sous-arbres
    `apps`/`packages`/`scripts`/`test`/`.github` identiques).
- 08:0x Z — worktree : les 3 fichiers écrits depuis les blobs de P_a2 (`git show 127e4dd:<chemin> >`), `git hash-object` == blobs P_a2,
  LF ; `DELIVERED-pli1b.sha256` (3/3 OK), `DELIVERED-pli1b-merged.sha256` (3/3 OK sur `clone2`), `pli-1b.patch`.
- 07:59:11-08:07:11 Z — harnais final, **passage 2** (`logs/mutants-pli1b-final2.log`, exit 1) : 13/15 KILLED byIntended ; **MV1/MV2
  notés SURVIVED par un DÉFAUT DE MON CRITÈRE** (pas par le code) : le volet comportement était ROUGE byIntended (not_ok=1, « filter/book
  prefetch … exactly 10 lines ») et `tsc` sortait bien en 2 (TS2345 `record.ts(438,80)` / `(476,74)`), mais mon critère de type exigeait
  `'every'` sur la 1re ligne d'erreur alors que tsc le porte sur la ligne de CONTINUATION (« Property 'every' is missing in type … but
  required in type 'PrefetchOpts' », vérifié à part : `check-tsc-mv1.mjs`, status 2, restauration octet-exacte). Critère corrigé
  (lignes de continuation incluses) ⇒ **passage 3** relancé à 08:1x Z (`logs/mutants-pli1b-final3.log`). Consigné pour ne pas faire
  disparaître la ligne qui n'a pas confirmé.
- 08:1x Z — **PRÉ-DÉCLARATION des oracles (AVANT exécution ; écart = STOP)** :
  (a) M_final, clone FRAIS : 7 × exit 0 ; tests **1055 / 1053 / 0 / 2** (= 1053/1051/0/2 mesuré par cp-2 et G2 sur le produit de fusion
  sans pli, + 2 tests ; sauts : `sentinel_run_releases_chainstack_lock_on_sigterm` win32, `u4b_labels_replay_via_main_real_artifact`
  A-rawlogs gitignoré). Attendu au G7 dans l'arbre principal (A-rawlogs présent) : 1055 / 1054 / 0 / 1.
  (b) worktree SEUL (`dec704d` + pli, ROUGE par construction) : `gate:vocab` 0 ; `typecheck` ≠ 0 avec EXACTEMENT 2 erreurs TS2339
  « Property 'heartbeatEvery' does not exist on type 'UkemiArgs' » (`record.ts` lignes 416 et 453) ; `test` ≠ 0 avec **990 / 987 / 1 / 2**
  (988/986/0/2 du lot + 2 tests ; seul rouge : le test de battement, `args.heartbeatEvery` = `undefined` à l'exécution ; le test C-G2-2 et
  le test du portail ne dépendent pas de RETRY ⇒ verts) ; `lint`/`lint:ratchet` NON prédits (règles typées sur une expression en
  erreur de type) ; `lang:gate` 0 ; `export:check` 0.
- 08:08:47-08:15:29 Z — harnais final **passage 3** : 15/15 KILLED byIntended + MV1/MV2 tués au type, exit 0 (§ Mutants).
- 08:15 Z — sonde `probe-g2m19.mjs` (G2M19 transitoire, restauration octet-exacte) : volet pool b.example 28-31 ms (< 75) ET volet servi
  mevblocker 14,8-31 ms (< 40) ⇒ la phrase « G2M19 red on both » du commentaire de test est MESURÉE.
- 08:16 Z — oracles lancés en arrière-plan, SÉQUENTIELS (M_final puis worktree), aucune autre charge CPU pendant : `oracle-pli.sh`.
- 08:18:38 Z — M_final, gate `test` : **1055 / 1053 / 0 / 2 = compte PRÉ-DÉCLARÉ** (sauts = les 2 attendus :
  `sentinel_run_releases_chainstack_lock_on_sigterm`, `u4b_labels_replay_via_main_real_artifact` « A-rawlogs.jsonl gitignored ») ;
  les 13 `ukemi_conc_*` ✔ ; durée 135,1 s (machine chargée par les courses en cours, non touchées).
- 08:16:09-08:19:11 Z — **oracle 7 gates M_final** (`F:\tmp\ukemiconc-pli\oracle-Mfinal\`, en-tête HEAD `3ce8697`, arbre `5ff87820…`,
  working tree vide) : `gate:vocab` 0 (227 fichiers) · `typecheck` 0 · `test` 0 (**1055/1053/0/2**) · `lint` 0 · `lint:ratchet` 0
  (69/69) · `lang:gate` 0 · `export:check` 0. = PRÉ-DÉCLARATION (a).
- 08:19:12-08:20:59 Z — **oracle 7 gates WORKTREE seul** (`F:\tmp\ukemiconc-pli\oracle-worktree\`, en-tête HEAD `dec704d`, working tree
  = les 3 `M` du pli) : `gate:vocab` 0 · **`typecheck` 2** (EXACTEMENT les 2 TS2339 pré-déclarés : `record.ts(416,171)` et `(453,163)`
  « Property 'heartbeatEvery' does not exist on type 'UkemiArgs' ») · **`test` 1** (990 / 986 / **2** / 2) · **`lint` 1** (2 erreurs
  `no-unsafe-assignment` « Unsafe assignment of an error typed value », `record.ts:416:159` et `:453:151`) · **`lint:ratchet` 1**
  (71/69) · `lang:gate` 0 · `export:check` 0.
  **ÉCART à la pré-déclaration (b), consigné** : j'avais prédit 1 test rouge, il y en a 2 : le test de battement (prévu : « filter
  prefetch … exactly 10 lines ») ET `export_public_no_governance_no_french` (`test/export-public.test.ts:115`), qui exécute `npm run ci`
  (vocab + typecheck + test) sur l'arbre EXPORTÉ ⇒ son typecheck tombe sur les MÊMES 2 TS2339 (message lu dans `test.log`). Les rouges
  `lint`/`lint:ratchet` ont la même cause : diff message par message des règles suivies par le ratchet (`ratchet-list.mjs`, même
  configuration que `scripts/lint-ratchet.mjs`) entre worktree (71) et M_final (69) = EXACTEMENT les 2 `no-unsafe-assignment` de
  `record.ts:416/453` (`logs/rl-*.norm`) ; mon fichier de test n'ajoute AUCUNE violation suivie. **Cause unique** pour les 4 gates
  rouges : `args.heartbeatEvery` absent de `UkemiArgs` à `dec704d` ; toutes vertes sur M_final (même test 42 : vert dans les 1053).
- 08:22 Z — A-6 APRÈS (worktree, pli écrit) : 9/9 == prereg §(2), AVANT == APRÈS ; `git diff --quiet 2c276bb -- book.ts ADR-U4b prereg
  fixtures package-lock.json packages scripts apps/bell` (worktree) exit 0 ; R-25 forme arbre de travail (`git diff --shortstat 2c276bb
  -- <pathspec ci.yml:65 @ dec704d>`) = 668/24 = **692** (= lignée lot P_a2 = forme CI M_final).
- 08:2x Z — `lot/etude-suite` à `6aca053` (après `ea9c8e3`) : `git diff --stat ea9c8e3 6aca053 -- . ':(exclude)docs'` VIDE. Processus de
  course 22236 et 102592 vivants, jamais touchés ; `F:\Monark` : `git status --porcelain` vide, jamais écrit.
- 08:2x Z — **consultation advisor intégré n°2 (AVANT clôture ; conseil, jamais verdict)**. Retenu : (1) mesurer AUSSI le sens G7
  (etude-suite ← lot) avec le pli COMPLET — fait : `c7335bc` + fusion de P_a2 `127e4dd` ⇒ `e7e9c9b`, exit 0, 0 conflit, arbre
  `5ff87820…` == M_final (`git diff --quiet final g7final` exit 0 ; `logs/merge-g7final.log`) ; (2) remonter EN TÊTE la supersession du
  compte G7 du cp-2 (+2 tests ⇒ 1055/1054/0/1) — fait ; (3) séquence de clôture : heure réelle en Provenance, plus aucune écriture
  après, sha256 du fichier ENTIER donné dans le message final (jamais dans le fichier) ; catégorie `error_origin` « implémentation pli
  (outillage de preuve) » gardée comme PROPOSITION explicite (hors vocabulaire plan / implémentation G1).
- 08:2x Z — garde SECRET-SCAN-1 appliquée d'avance (`F:\tmp\ukemiconc\secretscan.mjs` du G1, lecture seule : les 13 motifs EXTRAITS de
  `test/no-secret-in-repo.test.ts`, jamais re-tapés) sur ce rendu et `pli-1b.patch` : **0 occurrence** (persistance dans `docs/` sans
  risque). Clôture : plus AUCUNE écriture dans ce fichier après cette ligne ; son sha256 (fichier entier) est donné dans le message final.
