claude-opus-5-5[1m]
# G1 — lot M-3 (ADR-METHODE-2 D3, D4 ; C-1, C-7) : oracle unique à rôle, verrou FIFO, enregistrement

- **Worker** : `claude-opus-5-5[1m]` (modèle résolu, R-1), effort max, contexte frais. **Heures** : `date -u` ; début 2026-09-28T05:11:55Z, fin de rédaction 06:1xZ.
- **Mission** : `F:/tmp/methode/mission-g1-m3.md`, sha256 `d5539ab460c4e7165b9d705cb40ca8de9bdace1ec73a17597c8216e525e5ec95`, vérifié égal à l'attendu avant tout travail (05:11:55Z).
- **Worktree** `F:/Monark-wt-m3`, branche `lot/methode-m3`, base `0d54280d213bb37c9c67fa9d3bf67a85a73c83a1` (tronc), propre au départ, sans `node_modules`. Aucun git écrivant dans le worktree (les clones `--no-local` sous TEMP sont les seuls dépôts écrits) ; aucun réseau ; rien sur C: ; TEMP `F:/tmp/methode/m3/tmp`. Jonctions `node_modules` du worktree par `F:/tmp/dojo/drand-1a/mk-nm.ps1` pour typecheck et eslint, retirées par `rm-nm.ps1` en fin de passe.
- **Classification D-4 (e)** : bounded (scripts neufs sous `scripts/oracle/`, un test racine ; `oracle-locked.sh` et `run-oracle.sh` de `F:/tmp` non modifiés).
- **Chronologie** (`date -u`) : lecture et mesures d'hôte 05:12-05:35Z ; code et tests 05:36-05:52Z ; essai `--static-only` sur le vrai arbre, magasin d'essai `F:/tmp/methode/m3/trial` (hors magasin réel) 05:45:45-05:46:56Z ; mutants 05:53:49-05:54:53Z ; F2P 05:55:29-05:56:20Z ; exécution réelle 05:56:48-06:05:16Z.

## 1. Livré (non committé ; le gel est un acte de l'orchestrateur)
| Fichier | Lignes | sha256 |
|---|---|---|
| `scripts/oracle/run.mjs` | 162 | `e5240d19669d9015c12701ad0a014d22bca16c6cc56151d7e7c64382d3e625e0` |
| `scripts/oracle/lock.mjs` | 42 | `df7c0c17bbd678a11b707981f37c5165ca9a3a9df66262db1288fed24399784f` |
| `scripts/oracle/r25.mjs` | 28 | `63611db6ddc3c153a6adbc159a069d702c8a1cb5581d7c04470867e17aab5e06` |
| `test/oracle-run.test.ts` | 190 | `53615f004d0eab08b9a7a926b47f4a25613ba2260d536c6cb4d3a3e2b188b937` |
| `docs/G1-lot-methode-m3.md` | ce journal | au `DELIVERED.sha256` |

Commande : `node scripts/oracle/run.mjs --role <G1|G2|cp-2|G7|corr> --tree <chemin> --base <sha> [--key <étiquette>] [--static-only]`.

## 2. Conception
1. **Refus** : `--role` absent ou hors {G1, G2, cp-2, G7, corr} ⇒ exit 2 ; `--tree` ou `--base` absent ⇒ exit 2 (la base est obligatoire, item 2 de la mission : r25 en dépend).
2. **Identité de l'arbre** (lecture seule sur `--tree`) : `git rev-parse HEAD` ; état sale = `git diff --binary HEAD` + fichiers non suivis non ignorés (`git ls-files --others --exclude-standard`) ; `dirty` = sha256(diff, puis chemin + sha256 de chaque non suivi, triés), `null` si propre. Un G1 ne committe jamais : sans ce transfert, un clone `--no-local` testerait la base au lieu du lot.
3. **Clone** `--no-local` de `--tree` dans un répertoire neuf `F:/tmp/oracle-runs/run-*` (`core.autocrlf=false`), `checkout --detach HEAD`, `git apply` du diff, copie des non suivis, **commit de gel dans le clone** : r25 compte `<base>...HEAD` comme la CI, fichiers neufs compris ; `HEAD^{tree}` du gel est journalisé (`tree.object`, item B-TREE-SHA-1). Dépôts imbriqués (entrées `dir/`) et fichiers ignorés ne sont pas transférés (parité CI : un checkout n'en a pas).
4. **`node_modules`** : jonctions depuis le dépôt principal (`git rev-parse --git-common-dir` donne `F:/Monark/node_modules`), les espaces de travail `@monark/*` re-pointés dans le clone, comme `mk-nm.ps1`. Retrait du run par `rmSync` : une jonction est déliée, jamais traversée (mesuré sur Node v24.15.0 avec une cible témoin : fichier cible intact). Nettoyage à la sortie du processus, y compris sur SIGINT et SIGTERM.
5. **Portes dérivées au lancement** des `run:` du `ci.yml` **du clone** (jamais recopiées) : scalaires bloc gardés entiers, lignes simples coupées sur `&&`, commentaires ` #…` retirés, doublons exécutés une fois (test 42 une seule fois par passage, dans `npm test`). Le bloc qui porte une ligne `R25_DIFF_RE` devient la porte `r25` locale. **Liste fermée « CI seulement »**, motif écrit dans l'enregistrement : `npm ci` (jonctions, sans réseau), `npm audit` (réseau), `npm sbom` (artefact par run), `npm run build -w @monark/site` et `node scripts/assert-fleet-html.mjs` (build site ; O-2 lit la sortie du build, même job g3-site) ; les pas `uses:` (actions/*) ne sont jamais lus.
6. **Couloirs** : statique hors verrou = liste fermée (`gate:vocab`, `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, `bash enforcement/lint-model-pinning.sh .`, `r25`) ; **toute autre porte sous verrou** (une porte inconnue ne charge jamais une suite concurrente). Chaque porte tourne sous Git Bash, résolu par `git --exec-path` (depuis PowerShell, `bash` de PATH = WSL, CHANTIERS l.1904), avec l'env hérité **moins** `*API_KEY*` et `CHAINSTACK_*` (les huit variables payantes de `run-oracle.sh` l.10, et au-delà), `TEMP`, `TMP`, `TMPDIR` = TEMP neuf du run, journaux npm hors C:.
7. **Verrou** (`lock.mjs`) : le répertoire `F:/tmp/oracle-lock` (mkdir atomique) reste le mutex, donc compatible avec les workers en vol sur l'ancien protocole ; file `F:/tmp/oracle-lock.queue/<ms>-<pid>.json` ; seul le premier pid vivant tente le mkdir ; entrée à pid mort retirée ; `owner.txt` = `{role, sha, date, pid}` ; propriétaire JSON à pid mort ⇒ verrou repris ; `owner.txt` sans pid (ancien protocole, ou en cours d'écriture) ⇒ jamais repris ; libération à la sortie et sur SIGINT/SIGTERM ; attente maximale 90 min (exit 75, comme l'ancien protocole).
8. **C-V-4** : sous verrou, juste avant la suite : mémoire libre (`os.freemem`) et nombre de `node.exe` (`tasklist`) ; hors bornes ⇒ exit 3, suite non lancée, verrou rendu, enregistrement écrit.
9. **Magasin** (D4 ; C-1, C-7) : clé = sha256 de {commit, base, sha256(`package-lock.json`), `node --version`, sha256(`scripts/oracle/*.mjs`), sha256(env déclarée : NODE_OPTIONS, NODE_ENV, TZ, LANG, LC_ALL, CI)}. **G1 et corr, avec `--key`, sur arbre propre** : un enregistrement vert, complet, non servi, non partiel, de même clé est **servi** par un nouvel enregistrement qui le **cite** (`served_from: {file, sha256}`), jamais copié. **G2, cp-2, G7 : rejeu forcé**, le magasin n'est pas lu. Arbre sale ⇒ rejeu (la clé nomme le commit ; l'état sale est une condition à part, prouvée à clé égale). Enregistrement de même clé incomplet ⇒ **refus, exit 2**, ni servi ni rejoué.
10. **Enregistrement fermé** (`schema monark.oracle.v1`) : `role, tree{path, head, dirty, object}, base, key, key_parts, label, pid, start, end, static_only, gates[{name, lane, exit, ms, log}], tests{total, pass, fail, skip}, r25[…], residues{tmp_entries}, ci_only[{cmd, reason}], cv4, lock_wait_s, exit, served_from` ; écrit par fichier temporaire puis renommage ; exit = 0 ssi toutes les portes valent 0 (ou servi). Nom : `<head>[-<dirty16>]-<role>-<date>-<pid>.json` ; le pid est ajouté au format de la mission (`<sha-arbre>-<rôle>-<date>`) pour qu'un second run du même arbre et du même rôle dans la même seconde n'écrase pas le premier.
11. **`--key <k>`** : lu comme une étiquette d'opt-in au magasin (champ `label`) ; la clé D4 est toujours calculée par l'outil, jamais fournie (Q-M3-12).

## 3. R-25 mesuré (par la porte `r25` de l'outil, sur son propre lot)
Porte `r25` de l'enregistrement réel (§7) : **CODE (`STAT`) : 422 insertions, 0 suppression, 422 lignes changées (borne `VIBEGATES_PR_LIMIT` = 1205)** ; CONTENT (`CONTENT_STAT`) : 0 / 0 (borne 8000). Égal au décompte des quatre fichiers (162 + 42 + 28 + 190 = 422). Au-dessus du couloir attendu (≈ 250-330), sous le STOP 547 : pas de scission. Écarts : (i) transfert de l'état sale dans le clone et commit de gel (≈ 8 lignes), absents de l'estimation de C, sans lesquels un G1 serait testé sur la base ; (ii) jonctions `node_modules` écrites en Node (≈ 12 lignes) au lieu d'appeler `F:/tmp/dojo/drand-1a/mk-nm.ps1`, répertoire de travail d'un autre lot ; (iii) le test, 190 lignes contre 80-120 : 8 tests, 13 mutants, une fixture `ci.yml` de 25 lignes. Ce journal (`docs/**/*.md`) est exclu par le pathspec CI.

**R25-UNIT-1** — lignes de `.github/workflows/ci.yml` reproduites par `scripts/oracle/r25.mjs` : l.49-50 (bornes `VIBEGATES_PR_LIMIT` "1205" et `VIBEGATES_CONTENT_LIMIT` "8000", lues dans `env:`) ; l.52-61 (borne vide ou non numérique ⇒ rouge : sans `\d+`, `limit` vaut null et la porte rougit) ; l.82 (`STAT=…`) et l.86 (`CONTENT_STAT=…`), repérées par la **même** `R25_DIFF_RE` que `test/ci-gates.test.ts:95` (égalité textuelle assertée par le test r25) ; l.83-85 et l.87-89 (diff non calculable ⇒ rouge) ; l.90-91 (insertions + suppressions) ; l.92-93 (les deux comptes imprimés avant toute borne) ; l.94 et l.98 (`-gt` ⇒ rouge). `origin/${{ github.base_ref }}` devient `--base`. Insertions et suppressions sont imprimées à part : « 547 ascendantes » = insertions ? (Q-M3-5).

## 4. Tests non-LLM — `test/oracle-run.test.ts` (8 tests)
Fixture : dépôt `git init` sous le TEMP de l'OS, `ci.yml` fixture (job r25 à une borne `VIBEGATES_PR_LIMIT: "5"`, `npm run lint && npm test`, `npm test` répété dans un autre job, `npm ci`, `npm audit`), `package.json` dont les scripts sont des `node -e` rapides (`test` ajoute un caractère à un fichier compteur et imprime un résumé TAP). Chaque exécution a son propre `ORACLE_ROOT` (verrou, file, magasin, runs) : le verrou d'hôte n'est jamais touché ; la vraie suite n'est jamais lancée par le test ; les seuils C-V-4 sont relâchés, sauf dans le test C-V-4.

| Test | Prouve | Mutants |
|---|---|---|
| `oracle_refuses_without_role` | `--role` absent ou inconnu ⇒ exit 2, rien ne tourne | M1 |
| `oracle_gates_are_the_run_lines_of_ci_yml` | portes = `run:` lus (r25, lint, test), « CI seulement » listées, `npm test` une fois, résumé de tests lu ; un `run:` de plus ⇒ une porte de plus | M2, M3 |
| `oracle_store_serves_g1_never_g2_cp2_g7` | même clé : G1 servi (cité par fichier et sha256, portes vides, rien de rejoué) ; G2, cp-2, G7 rejouent | M4, M5 |
| `oracle_modified_tree_is_replayed_on_its_content` | arbre modifié (fichier non suivi) : même clé, jamais servi, le clone porte le fichier (lint rouge) | M6, M7 |
| `oracle_refuses_an_incomplete_same_key_record` | enregistrement sans `pid` ⇒ exit 2, ni servi ni rejoué | M8 |
| `oracle_lock_fifo` | pid mort (file et propriétaire) ⇒ verrou repris, file vidée, verrou rendu ; tête de file vivante ⇒ attente puis exit 75, sa propre entrée retirée | M9, M10 |
| `oracle_r25_over_the_ci_bound_is_red` | 3 lignes committées + 2 suivies sales + 10 non suivies = 15 > 5 ⇒ r25 rouge ; `R25_DIFF_RE` identique au test 38 | M11, M13 |
| `oracle_cv4_refuses_the_suite` | mémoire libre ou `node.exe` hors bornes ⇒ exit 3, pas de suite, verrou rendu | M12 |

Résultats : `node --test test/oracle-run.test.ts` 8/8 (32 à 39 s selon la charge ; 8/8 aussi dans la vraie suite, §7) ; `npm run typecheck` exit 0 ; `eslint` sur le test : 0 message ; ratchet : le test ajoute 0 violation suivie (mesure ciblée sur le fichier), total 69/69 inchangé ; `lang:gate` : 0 hit (code et commentaires en anglais) ; aucun TAB, CR, octet de contrôle, marqueur de conflit, ni motif « F deux-points espace » dans les quatre fichiers (garde de M-1) ; non-ASCII : les 8 tirets cadratins des noms de tests.

## 5. Mutants — 13/13 tués, arbre restauré au sha
Harnais hors dépôt `F:/tmp/methode/m3/mutants/mutants.mjs` : un mutant à la fois, test nommé rejoué, restauration octet pour octet vérifiée (`restored=OK` à chaque mutant ; `sha256sum -c SHA-before.txt` : 4/4 OK après la passe). Passe 05:53:49-05:54:53Z sur les fichiers aux sha du §1.

| Mutant | Mutation | Tué par (assertion) |
|---|---|---|
| M1 | contrôle de `--role` retiré | l.90 : exit 0 au lieu de 2 |
| M2 | liste des portes figée à 3 (`gates.splice(3)`, une liste recopiée) | l.107 : `extra` absent |
| M3 | pas de dédoublonnage | l.99 : `test` deux fois |
| M4 | `SERVED_ROLES` = tous les rôles | l.122 : G2 servi |
| M5 | magasin jamais lu | l.115 : 2 exécutions au lieu de 1 |
| M6 | condition « arbre propre » retirée | l.133 : arbre sale servi |
| M7 | non suivis non copiés dans le clone | l.132 : aucun enregistrement (le commit de gel n'a rien à committer : refus exit 2, voie fermée) |
| M8 | contrôle de complétude retiré | l.147 : servi, exit 0 au lieu de 2 |
| M9 | `alive` toujours vrai | l.160 : exit 75 au lieu de 0 (verrou jamais repris) |
| M10 | tête de file ignorée | l.165 : exit 0 au lieu de 75 (passe devant un pid vivant) |
| M11 | borne r25 ignorée | l.174 : exit 0 au lieu de 1 |
| M12 | C-V-4 retiré | l.185 : exit 0 au lieu de 3 |
| M13 | diff suivi non appliqué dans le clone | l.175 : 13 insertions au lieu de 15 |

## 6. Preuve F2P
- **Rouge sur la base** : clone `--no-local` de `F:/Monark-wt-m3` au `0d54280d` sous `F:/tmp/methode/m3/f2p/base` (sans `scripts/oracle/`), plus le seul `test/oracle-run.test.ts` du gel (sha `53615f00…`) ; `node --test --test-reporter=tap` à 05:55:29Z : **0/8**, les 8 échecs sont `ERR_ASSERTION` (le module absent n'apparaît que comme code de sortie inattendu, jamais comme rouge d'import du test). Module neuf : mutants d'intention M1..M13 joints (§5). TAP `base.tap`, sha256 `21622a0ac948687e2df05feeddcd659c3a249163c554bb166903bf8dcd240d15`.
- **Vert au gel** : même fichier dans le worktree, 05:55:46Z : **8/8**. TAP `gel.tap`, sha256 `5f3bf62621e51222c0dcb3b33424158c4b105ba05c194dc50be9a2a5f6145ae8`.

## 7. Exécution réelle (premier enregistrement du magasin : l'oracle de ce lot)
- Commande (Git Bash, 05:56:48Z) : `node F:/Monark-wt-m3/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-m3 --base 0d54280d213bb37c9c67fa9d3bf67a85a73c83a1 --key "G1 M-3"`, magasin et verrou d'hôte réels (`--base` passé explicitement, Q-M3-1).
- **Enregistrement** : `F:/tmp/oracle-results/0d54280d213bb37c9c67fa9d3bf67a85a73c83a1-72fa59b6a609e6b6-G1-20260928T055648Z-167396.json`, sha256 **`b547c6f48052291097d6dbdb9b3f11182147594b491d8db818022760763e46e4`** (recalculé sur disque, égal à la ligne `oracle-result`) ; seul fichier du magasin ; 9 journaux de portes dans le répertoire homonyme.
- **Arbre** : `head` `0d54280d…` ; `dirty` `72fa59b6a609e6b6baed4a9c4a427e311a92e7608f7ce7b4724c668ca59cd753`, **recalculé indépendamment** (diff vide + les quatre fichiers du §1 à leurs sha) : égal ; `tree.object` (HEAD^{tree} du gel) `becc0f2928a22c30c6a9e09e83f04bb66517a9ff`. Ce journal a été ajouté après le run : l'enregistrement couvre le code et le test, pas ce journal (docs, hors R-25).
- **Clé** `d8fc67d2c5e71b4014c8d49929d197959f2109981f3c08ef8423a4e55fa9179c` (Node v24.15.0 ; lockfile `d1d88099…` ; script `3f7d594d…` ; env `7a71dbfb…`), étiquette « G1 M-3 », pid 167396, `start` 05:56:48Z, `end` 06:05:16Z (8 min 28 s).
- **Portes** (9, toutes exit 0) : couloir statique hors verrou 54,3 s — `lint-model-pinning` 0,1 s, `r25` 0,05 s, `lang:gate` 2,0 s, `export:check` 1,5 s, `gate:vocab` 1,0 s, `typecheck` 7,4 s, `lint` 21,0 s, `lint:ratchet` 21,2 s ; puis, sous verrou, `npm test` 446,4 s. « CI seulement » (5, motif écrit) : `npm ci`, `npm sbom …`, `npm audit …`, build site, O-2.
- **Tests** : **1 457, dont 1 454 réussis, 0 échec, 3 ignorés** ; les 8 de ce lot verts dans la suite. Ignorés : `sentinel_run_releases_chainstack_lock_on_sigterm` (win32), `sentinel_instrument_out_win32_short_name` (pas de nom 8.3 sur ce volume), `u4b_labels_replay_via_main_real_artifact` (artefacts réels ignorés par git, donc absents d'un clone : parité CI ; l'arbre principal peut les avoir, d'où un ignoré de plus que dans les oracles lancés sur `F:/Monark`).
- **Verrou** : attente 0 s ; pris à 05:57:50Z (`owner.txt` JSON `{role, sha, date, pid}` lu pendant la tenue) ; tenu ≈ 446 s pour la seule suite (le couloir statique ne le tient plus) ; rendu : `F:/tmp/oracle-lock` absent, file vide, `F:/tmp/oracle-runs` vide après le run.
- **Résidus** : **379 entrées** laissées par la suite dans le TEMP neuf du run (comptées, puis supprimées avec le run).
- **Comparaison à B et C** : test 42 = **431,0 s** dans une suite de 445,5 s (`duration_ms`), soit 96,7 % du mur ; C [M5] : 366 s sur 377,9 s (96,8 %), 418 s à part ; B : 366 s sur 378. Soit +65 s (+18 %) contre la mesure de C en suite, avec d'autres G1 (M-1, M-2a, M-4) actifs sur l'hôte ; borne (e) de 600 s tenue. Le test 42 ne tourne qu'une fois par passage (l'ancien `all.sh` le rejouait après `npm test`) : la consigne « test 42 à part » de l'en-tête de mission (ancien protocole) est remplacée par l'item 1 ; aucun passage séparé de 42 n'a été fait, et un rouge étranger de 42 aurait été reproduit sur la base avec item, jamais relancé à l'aveugle (ADR D3). Oracle entier : 508 s (préparation ≈ 8 s + statique 54 s + suite 446 s), contre 448 s dans C [M4] (statique 47 + suite 380 + build 21) ; ici sans build (« CI seulement »), avec deux portes de plus (`lint-model-pinning`, `r25`).

## 8. C-V-4 — valeurs lues sur cet hôte
Échantillonneur hors dépôt (`cv4-sampler.ps1`, toutes les 5 s : `Get-Process node`, `Win32_OperatingSystem`) pendant le run réel, 100 échantillons (`cv4-samples.tsv`) ; hôte : 24 fils, 65 483 Mo.

| Phase | n | `node.exe` min / max | libre (Mo) min / max | ensemble de travail node, max (Mo) |
|---|---|---|---|---|
| avant verrou (repos + couloir statique) | 13 | 15 / 19 | 9 699 / 11 390 | 2 778 |
| suite sous verrou | 84 | 18 / **48** | 9 907 / 12 042 | **3 964** |
| après le run | 3 | 14 / 15 | 11 326 / 11 606 | 939 |

Au contrôle (05:57:50Z), l'outil a lu 11 709 Mo libres et 15 `node.exe` (champ `cv4` de l'enregistrement). Lecture : au repos l'hôte porte 14 à 15 `node.exe` (serveurs MCP, outils) ; une suite complète en ajoute jusqu'à 33 (pic 48 = 15 + 33, sur un seul échantillon ; la plupart des échantillons ≤ 33 au total) et ≈ 3,0 Go d'ensemble de travail node (3 964 − 939), la mémoire libre baissant d'environ 1,5 Go au plus.
- **`node.exe` > 48 ⇒ refus** : 48 = pic mesuré de l'hôte avec **une** suite (et = 2 × 24 fils). Au lancement (≈ 15 au repos), plus de 48 signifie qu'une autre suite complète, ou une charge équivalente, tourne déjà près de son pic (règle d'origine : deux suites complètes jamais en même temps). Limite : une suite concurrente dans sa traîne (≈ 30 à 33 au total) n'est pas vue ; le verrou reste la garde première, C-V-4 attrape surtout une suite orpheline d'un oracle tué.
- **Mémoire libre < 2 Go ⇒ refus** : 2 Go ≈ ce qu'une suite a consommé ici (baisse d'environ 1,5 Go de libre ; + 3,0 Go d'ensemble de travail, en partie partagé) : plancher « place pour une suite », **sans marge**.
- **Provisoires** (n = 1 suite, hôte chargé par d'autres G1) : item CV4-THRESHOLDS-1, Q-M3-8. Seuils réglables sans code (`ORACLE_MIN_FREE_MB`, `ORACLE_MAX_NODE`) et relus dans chaque enregistrement (champ `cv4`), donc tout relâchement est visible.

## 9. CA-11 — tuyaux (ADR-M018 D3, règle Branchement)
- **Entrée** : arbre (`--tree`), `--base`, `--role`, `--key` ; fournis par qui lance (orchestrateur, worker, relecteur, validateur).
- **Sortie** : enregistrement fermé + journaux par porte dans `F:/tmp/oracle-results/` ; ligne `oracle-result {exit, record, sha256}` sur stdout, pour la citation.
- **État** : magasin `F:/tmp/oracle-results/` ; verrou `F:/tmp/oracle-lock` et file `F:/tmp/oracle-lock.queue/` ; runs `F:/tmp/oracle-runs/` (supprimés en fin de run).
- **Consommateurs** : (1) l'outil lui-même (magasin D4 pour G1 et corr) — **branché**, composition rejouée de bout en bout par `oracle_store_serves_g1_never_g2_cp2_g7` et `oracle_refuses_an_incomplete_same_key_record` ; (2) les rapports G2, cp-2, G7, qui citent l'enregistrement de leur propre rôle — **à brancher** : premiers consommateurs réels = le G2 et le cp-2 de ce lot (item existant METHODE-CITE-ENREG-1 : amendements datés des checklists G2 et cp-2) ; (3) M-5, qui vérifie qu'un rapport G2, cp-2 ou G7 cite un enregistrement de son rôle, postérieur au gel, non servi — lot futur ; (4) reprise (M-7).
- **Statut** : au sens de la règle Branchement, la pièce reste « upcoming » tant qu'aucun G2 ni cp-2 réel n'a cité un enregistrement et que M-5 ne le vérifie pas ; aucun registre public ne liste cet outillage.
- **Oracle de la base (décision 267 (c))** : supporté (`--role G1 --key <étiquette> --tree <arbre propre à la base>`, puis servi aux G1 de même clé, arbre propre) ; son déclenchement « avant tout G1 » est un acte de l'orchestrateur, non câblé ici.

## 10. Review Focus (≤ 5)
1. Magasin (`run.mjs` l.69-81) : C-1 (aucun service à G2, cp-2, G7), arbre sale jamais servi, complétude et refus, citation par sha256.
2. Transfert de l'état sale dans le clone (l.92-97) : diff suivi, non suivis, commit de gel ; exclusions déclarées (dépôts imbriqués, fichiers ignorés).
3. Règles de reprise du verrou (`lock.mjs`) : JSON à pid mort seulement, tête de file seulement, compatibilité avec l'ancien protocole, idempotence de la libération.
4. Dérivation des portes (l.112-126) : scalaires bloc, `&&`, commentaires, dédoublonnage ; listes fermées « CI seulement » et couloir statique ; porte inconnue ⇒ sous verrou ; portes lues dans le `ci.yml` de l'arbre testé (ORACLE-GATE-REMOVAL-1).
5. Parité r25 avec le job CI (`r25.mjs`, R25-UNIT-1).

## 11. MAST
- **FM-2.6 (enregistrement forgé ou incomplet lu comme un résultat)** : champs fermés exigés (dont `pid` entier > 0, `start`, `end`, `tree`) ; enregistrement de même clé incomplet ⇒ refus exit 2 ; citation par sha256 (une retouche postérieure est détectable par M-5) ; écriture par fichier temporaire puis renommage. Résidu : un enregistrement forgé bien formé serait servi à un G1 ou un corr (jamais à G2, cp-2, G7) ; même classe que METHODE-RECU-SIGNE-1 (signature par une unité hors de portée de l'auteur).
- **C-1 / FM-3.2 (magasin servi à un rôle indépendant)** : `SERVED_ROLES` fermé = {G1, corr} ; G2, cp-2, G7 ne lisent pas le magasin (test et M4).
- **FM-3.3 (vert servi sur test non hermétique)** : clé = commit, base, lockfile, Node, script, env déclarée ; G1 et corr seulement ; arbre sale jamais servi. Résidu : un test qui lit une variable hors de la liste déclarée (C : 21 tests lisent `process.env`) — M-9.
- **FM-2.4 (résultat d'agent mort non lu)** : un enregistrement par run, nommé par l'arbre, lisible par tous.
- **FM-1.2 (outil qui fermerait un gate)** : l'outil ne produit qu'un code de sortie et un enregistrement ; il n'accepte, ne committe ni ne ferme rien.

## 12. `error_origin` proposés
- **Q-M3-1** (la commande de l'étape 6 omet `--base`, que l'item 2 rend obligatoire) : ORCH (rédaction de la mission).
- **Q-M3-2** (la liste « CI seulement » de la mission omet `node scripts/assert-fleet-html.mjs`, qui lit la sortie du build site listé) : ORCH (rédaction de la mission).
- **Q-M3-3** (la clé D4 de l'ADR et de la mission ne nomme pas la base, dont r25 dépend) : G0, soit PLANIFICATEUR.
- **Harnais de mutants, première passe** (worker) : un here-doc Bash a réduit `\\` en `\` dans le harnais hors dépôt, qui a mal étiqueté les mutants « SURVIVED » (tous en réalité rouges, exit 1) et sauté M2 ; détecté à la relecture des sorties, harnais réécrit par l'outil d'écriture, passe rejouée ; aucun livrable touché : G1, soit IMPLÉMENTEUR, cause OUT (outillage). Piège à retenir : ne pas écrire de script à antislashs par here-doc Bash sur cet hôte.
- **C-V-4** (seuils prescrits, §8) : lectures cohérentes avec des planchers sans marge ; aucun `error_origin` avant la décision Q-M3-8.

## 13. Items formés (règle Dettes) et résidus déclarés
- **ORACLE-SITE-BUILD-1** : le build du site et O-2 sont « CI seulement » dans l'oracle local (liste de la mission), alors que `oracle-locked.sh` l.20-21 les rejouait au G7 ; avant de retirer `oracle-locked.sh`, décider une porte `site` sous verrou (≈ 40 s selon C) ou un pas G7 tracé hors outil ; propriétaire : orchestrateur ; déclencheur : premier G7 oracle par `run.mjs`.
- **ORACLE-GATE-REMOVAL-1** : les portes viennent du `ci.yml` de l'arbre testé (parité CI : GitHub exécute le workflow de la PR) ; un lot qui retire une ligne `run:` obtient donc un oracle plus petit ; l'enregistrement liste les portes jouées (le retrait est visible, pas bloqué) ; proposition : au G2, cp-2 et G7, rouge si les portes de l'arbre n'incluent pas celles de la base (lues par `git show <base>:.github/workflows/ci.yml`, ≈ 6 lignes), ou contrôle par M-5 contre l'enregistrement de la base ; propriétaire : orchestrateur ; déclencheur : G0 de M-5, ou premier lot qui modifie `ci.yml`.
- **LOCK-LEGACY-1** : pendant la transition, les attentes de l'ancien protocole (mkdir, 60 s) ne passent pas par la file (elles peuvent doubler une entrée FIFO) et ne reprennent pas un propriétaire JSON à pid mort ; l'item se ferme quand `oracle-locked.sh` et `run-oracle.sh` meurent (mission) ; propriétaire : orchestrateur ; déclencheur : premier G2 lancé par `run.mjs`.
- **ORACLE-RUNDIR-SWEEP-1** : un arrêt dur (`taskkill`, ou SIGTERM sous Windows, qui n'exécute aucun gestionnaire) laisse `F:/tmp/oracle-runs/run-*` (clone et jonctions ; `rmSync` les délie sans les traverser) ; proposition : pid dans le nom du run et balayage des runs à pid mort au démarrage (≈ 5 lignes) ; propriétaire : orchestrateur ; déclencheur : premier reliquat constaté, ou G0 de M-7.
- **ORACLE-STATIC-LOAD-1** : le couloir statique hors verrou (54 s de tsc et eslint mesurées ici) charge une éventuelle suite concurrente dont le test 42 (e) a une borne de 600 s ; non mesuré ; mesurer la durée de 42 avec et sans couloir statique concurrent ; propriétaire : orchestrateur ; déclencheur : METHODE-ORA-1 (G7 de M-3).
- **CV4-THRESHOLDS-1** : seuils C-V-4 provisoires (n = 1 suite) : 48 ne voit pas une suite concurrente dans sa traîne (≈ 30 à 33 `node.exe` au total) ; 2 Go = consommation d'une suite, sans marge ; `os.freemem` mesure la mémoire physique disponible, alors qu'un échec d'allocation sous Windows dépend de la charge validée (commit) ; proposition : mesurer sur 3 suites au moins, puis choisir entre garder 48 et 2 Go, ou 34 `node.exe` (repos 15 + moitié du pic d'une suite + marge 3) et 4 Go (2 × la consommation mesurée) ; propriétaire : orchestrateur ; déclencheur : G2 de M-3 (Q-M3-8).
- **ORACLE-POSIX-1** : la branche POSIX de l'outil (bash de PATH, `ps -A`) n'est pas exercée sur cet hôte ; voir Q-M3-6 ; propriétaire : orchestrateur ; déclencheur : décision sur Q-M3-6.
- **Items existants touchés** : R25-UNIT-1 (Q-M3-5) ; METHODE-CITE-ENREG-1 (tuyau (2), inchangé) ; **B-TREE-SHA-1 : clôture proposée au G7** (chaque run journalise HEAD, `dirty` et `HEAD^{tree}` du gel ; chaque prise de verrou écrit `sha` dans `owner.txt`) ; **ORACLE-TEST42-IN-SUITE-1 : clôture proposée au G7** (42 une fois par passage, par construction : test `oracle_gates_are_the_run_lines_of_ci_yml` et mutant M3 ; mesuré au §7).
- **Résidus déclarés** (sans item neuf) : variable d'environnement hors liste déclarée non couverte par la clé (FM-3.3, M-9) ; pid réutilisé lu vivant (l'attente finit à 90 min, jamais de vol ; une entrée de file périmée portant le pid de l'appelant le ferait attendre derrière elle-même jusqu'à cette borne) ; enregistrement forgé bien formé servi à G1 ou corr (METHODE-RECU-SIGNE-1) ; portée `@monark` codée comme dans `mk-nm.ps1` ; `lint-model-pinning` vert par absence dans un clone (Q-M3-10).

## 14. Questions
- **Q-M3-1** : `--base` est obligatoire (item 2) ; l'étape 6 l'omet : j'ai lancé avec `--base 0d54280d…`. Garder obligatoire, sans défaut ?
- **Q-M3-2** : liste « CI seulement » étendue à `node scripts/assert-fleet-html.mjs` sous le motif « build site » (O-2 lit la sortie du build, même job g3-site). Confirmer, et trancher ORACLE-SITE-BUILD-1 (le G7 doit-il garder le build du site ?).
- **Q-M3-3** : `base` ajoutée à la clé D4 (r25 en dépend ; ni l'ADR ni la mission ne la nomment). Confirmer.
- **Q-M3-4** : une porte hors des listes fermées tourne **sous** verrou (une porte inconnue ne charge jamais une suite concurrente). Confirmer, contre « hors verrou par défaut ».
- **Q-M3-5** (R25-UNIT-1) : « 547 ascendantes » = insertions seules ? Ce lot : 422 insertions, 0 suppression ; les deux lectures coïncident ici.
- **Q-M3-6** : faut-il un `docker node:24` pour le couloir Linux ? Question, non faite : la branche POSIX de l'outil n'est pas exercée sur cet hôte ; un couloir Docker reproduirait `ubuntu-latest` localement, mais suppose Docker Desktop (présence non vérifiée) et un tirage réseau de l'image (réseau interdit à ce G1) ; la CI distante (CI-PRIVATE-BILLING-1) reste la référence Linux. Décision de l'orchestrateur, ou de l'investisseur si Docker est un acte d'hôte.
- **Q-M3-7** : codes de sortie : 2 refus (usage, arbre, enregistrement incomplet), 3 C-V-4, 75 verrou non obtenu (comme l'ancien protocole). M-5 et M-7 les consommeront : confirmer.
- **Q-M3-8** (C-V-4) : garder 48 `node.exe` et 2 Go (planchers mesurés, sans marge, sur une suite), ou adopter après trois mesures 34 et 4 Go (CV4-THRESHOLDS-1) ? Faut-il ajouter la charge validée (commit) de Windows, métrique des échecs d'allocation ?
- **Q-M3-9** : un G1 servi écrit dans le magasin un enregistrement de citation (`served_from` non nul) ; M-5 doit le refuser comme preuve d'un G2, cp-2 ou G7 (déjà dans la colonne test de M-5) : à reprendre au G0 de M-5.
- **Q-M3-10** : `lint-model-pinning` tourne désormais dans chaque oracle local (0 fois dans les deux anciens oracles, C), mais ne scanne rien dans un clone : `.claude/agents/` est ignoré par git (« green by absence », comme en CI). Faut-il un contrôle d'hôte séparé des agents non suivis (R-1) ?
- **Q-M3-11** : le libellé « C-V-4 » désigne plusieurs constats de checkpoints dans le CHANTIERS (l.70, l.299, l.352, l.589…) ; renommer la règle d'hôte (par exemple HOST-LOAD-1) pour que M-5 la cite sans ambiguïté ?
- **Q-M3-12** : `--key <k>` est lu comme une étiquette d'opt-in au magasin (G1 et corr) ; la clé D4 est calculée, jamais fournie par l'appelant. Confirmer, contre la lecture « `<k>` = valeur de la clé ».
