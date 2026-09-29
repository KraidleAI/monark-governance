claude-opus-5-5[1m]
# G1 — lot M-5 (ADR-METHODE-2 D8a, D10, D11, D12 (d) ; décision 275-e) : journal de lot écrit par outil, index généré, contrôles de clôture

- **Worker** : `claude-opus-5-5[1m]` (modèle résolu, R-1), palier `claude-opus-5-5`, effort max, contexte frais. **Heures** (`date -u`) : début 2026-09-28T18:25:18Z ; fin de rédaction 2026-09-28T19:14:45Z, retouches (chronologie, Review Focus 2, Q-M5-13 et Q-M5-14) 2026-09-28T19:20:03Z.
- **Mission** : `F:/tmp/methode/mission-g1-m5.md`, sha256 `75021ada3cf9e40723bfdf9466568584f08465d9752b77d905a5815f3ebbe28d`, recalculé égal au reçu `F:/tmp/methode/mission-g1-m5.recu.json` (verdict vert, 2026-09-28T18:23:47Z, head `3f502aa9`) avant tout travail (18:25:18Z).
- **Worktree** `F:/Monark-wt-m5`, branche `lot/methode-m5`, base `3f502aa956f02bd8053379fc6b5323113c053e77` (tronc), propre au départ. Aucun git écrivant dans le worktree (seuls les clones `--no-local` sous `F:/tmp/methode/m5/` sont écrits) ; aucun réseau ; rien sur C: ; TEMP `F:/tmp/methode/m5/tmp`. Jonctions `node_modules` par `F:/tmp/dojo/drand-1a/mk-nm.ps1` (typecheck, eslint), retirées par `rm-nm.ps1` en fin de passe.
- **Classification D-4 (e)** : bounded, tenue : un script neuf, un test racine neuf, un répertoire de fixtures neuf, le journal et l'index du lot ; aucun fichier existant modifié (ni `package.json`, ni `.d.mts` : le test n'importe pas le module, il exécute la CLI).
- **Chronologie** (`date -u` lu à l'horloge ; « non horodaté » là où aucune lecture n'a été faite) : lecture des entrées à partir de 18:25:18Z (ADR, DOCTRINE, run.mjs, launch.mjs, lint.mjs, red-proof.mjs de M-4, A §4, C §(7), byte-guard, lang-gate, export) ; avis de l'advisor intégré sur la note de conception (canal 1) ; script, fixtures et test : non horodatés ; première exécution du test 18:55:02Z ; tueurs insérés : non horodaté (entre 18:55:02Z et 19:01:47Z) ; C-V-4 19:01:47Z ; mutants 19:01:49-19:02:50Z ; F2P `--draw 0` 19:03:10-19:03:40Z, F2P tirée 19:03:47-19:04:22Z ; oracle G1 19:04:52-19:12:53Z (enregistrement) ; clone M-3 19:05:21Z, entrée G7 19:05:35Z ; entrée G1 19:13:18Z, `build` 19:13:19Z ; `export:check` 19:14:11Z.

## Livré (dans le gel)
| Fichier | l. | sha256 |
|---|---|---|
| `scripts/journal/index.mjs` | 220 | `1af4f2659e632e659e8baab7df5571fc7e5ebd90e5e31222179545bbbb3544d0` |
| `test/journal-index.test.ts` | 200 | `505323c1521ea0d3b5e67a2487f8adf05787322adebef0bd3f6d11f7c57a70a1` |
| `test/fixtures/journal/INDEX.golden.md` | 37 | `df29406f3eb3cc4f39d6d87a0c9dea433f23d1a032b996a1836c67dbf99d45c6` |
| `test/fixtures/journal/M-X.jsonl` | 8 | `61de372542c628cb25bd0ccdbccad0d9df828ded7d80c338e73a221396206f30` |
| `test/fixtures/journal/M-Y.jsonl` | 6 | `37cf0b9eb919f9d9d0f78ca6a6f1a08357db90cb5b54160b7c34374c802cbd1d` |
| `test/fixtures/journal/mission.md` | 2 | `00b503d8c8e40a940f3b9e0e28d64be8f72bdd579b6dd7cfa22243a32ef319c9` |
| `test/fixtures/journal/oracle-G2.json` | 1 | `6db52153956e12fddda944eebf16da9fa0cc4ad7d8bc79aaddfacfdb66e96c89` |
| `test/fixtures/journal/oracle-cp-2.json` | 1 | `4998e5a9af33ceb3f5dbb6d0bd1cb8fe526af3d951f532ad3c5e8c85c5516abc` |
| `test/fixtures/journal/oracle-G7.json` | 1 | `0bacfea35854a54f323ae9dd9f8b3d82aa2dbf9e327d87a93c6a2dc408355377` |
| `docs/journal/M-5.jsonl` | 1 | `6cf7433e835a5640b5a56225c8e94755f92871c0c6a129734d6810fd314a8097` |
| `docs/journal/INDEX.md` | 17 | `2f6e05a8f24731b4338d2f29897bfa9316cab0d059f394e16204797fb2dbc791` |
| `docs/G1-lot-methode-m5.md` | ce journal | (hors R-25) |

## Décisions 275-e appliquées (citées, jamais rediscutées)
- **Forme** : un fichier append-only par lot, `docs/journal/<lot>.jsonl`, une ligne JSON par événement de gate, schéma fermé `monark.journal.v1` ; index `docs/journal/INDEX.md` généré par `build`, jamais édité (test doré). `docs/**` hors export (D-3) : aucune liste blanche touchée ; `export:check` vert à l'oracle.
- **Champs fermés** (19, tous présents dans chaque ligne, `null` si sans objet) : `schema`, `lot`, `gate`, `date`, `tour`, `commit`, `tree_head`, `mission` {`path`, `sha`, `recu_sha`, `recu_date`}, `model_resolved`, `tier`, `effort`, `r25` {`lines`, `cap`}, `oracle` {`record`, `sha256`, `role`, `head`, `start`, `served_from`, `tests_total`}, `corrections` {`blocking`, `nonblocking`}, `verdict`, `adjudication`, `error_origin`, `public_trace` {`kind`, `ref`}, `note`. `date` est posée par l'outil (`new Date()` à la seconde, UTC) ; aucune option ne la fixe (`--date` : exit 2, test et mutant M06).
- **Dix contrôles** de `build`, un code chacun, exit 1 si un rouge : J-SCHEMA, J-TIME, J-TRACE, J-ORIGIN, J-TOURS, J-ORACLE, J-RECU, J-LINT, J-MODEL, J-ADJ (définitions en tête du script, l.18-29). J-ORACLE, J-RECU, J-LINT lisent hors du dépôt et sont fail-closed (fichier absent : rouge ; tests J-ORACLE « record absent », J-RECU « none.md »).
- **Branchement (CA-11)** : `add --from-recu <reçu>` et `--from-oracle <enregistrement>` livrés ; le remplissage rétroactif des lots fusionnés reste un acte de l'orchestrateur au G7 de M-5 (non écrit ici) ; sa faisabilité depuis les faits est prouvée sur clone (§ CA-11).

### Lectures de la mission tranchées dans le code (chacune portée en Q-M5-n)
1. `commit` peut être `null` pour G0, cp-1 (texte) **et** G1, corr (Q-M5-1) : l'étape 4 écrit l'entrée G1 sans `--commit` dans le gel (un commit ne porte pas son propre sha), et J-LINT « sur disque quand `commit` est `null` » suppose des entrées à mission sans commit. Requis non nul : G2, cp-2, G7, fusion.
2. Présence par gate : J-SCHEMA exige `tour` (G2, corr), `commit` (G2, cp-2, G7, fusion), `mission` (G1, G2, corr, cp-2), `oracle` (G2, cp-2, G7), `error_origin` (G7, liste vide admise) ; la présence de `adjudication` et de `public_trace` au G7 appartient à J-ADJ et J-TRACE (Q-M5-2), sinon J-ADJ serait inatteignable et le Review Focus (« J-TOURS et J-ADJ ») faux.
3. J-TRACE rougit toute trace à `ref` vide ou blanche, pas seulement `motif` (Q-M5-3).
4. J-TOURS compte les **entrées** `corr` (lettre de 275-e, avis de l'advisor), pas les tours distincts (Q-M5-4).
5. J-MODEL s'applique à toute entrée portant une mission, un palier ou un modèle ; le modèle doit commencer par le palier **à une frontière de jeton** (`claude-sonnet-5-5` n'est pas `claude-sonnet-5` ; test « prefix trap », mutant M19).
6. J-ORACLE ajoute « champ recopié dans l'entrée ≠ l'enregistrement » (rôle, head, start, served_from, tests_total ; test « miscopied », mutant M16) : la cohérence des faits cités, sans lecture nouvelle.
7. `--only <lot>` : ce lot seul, jamais d'index (Q-M5-10) ; aucun `*.jsonl` : exit 2, jamais un vert vide (mutant M30).
8. Chemin relatif dans une entrée : lu depuis `--repo` (fixtures figées) ; `add` écrit des chemins absolus (Q-M5-11).
9. Section « Point d'étape » rendue `## Status point` : l'index doré sous `test/` est lu par `lang:gate` (portée root), un diacritique le rougirait (Q-M5-9).

## R-25
Méthode A, pathspec `ci.yml:82`, par la fonction `r25()` du tronc (`F:/Monark/scripts/oracle/r25.mjs` n'a pas de CLI : Q-M5-8) sur un clone `--no-local` à commit de gel (fichiers non suivis inclus) : **476** avant l'entrée du journal, **477** avec `docs/journal/M-5.jsonl` (1 l.) ; 0 suppression ; CONTENT_STAT 0. Répartition : script 220, test 200 (dont 16 lignes `// killer:`), fixtures 19 + l'entrée réelle `docs/journal/M-5.jsonl` 1 (corrigé au tour 1, C-G2-7), index doré 37 ; `docs/**/*.md` exclus (ce journal, `INDEX.md`). **Au-dessus de la tolérance 294 (×2,1 de 140), sous le STOP 547.** Cause nommée : 275-e a fixé après C dix contrôles, un schéma fermé de 19 champs, deux sous-commandes, `--from-recu` et `--from-oracle`, un test par contrôle ; C chiffrait « `index.mjs` ≈ 80 + test doré ≈ 60 » pour un index sans contrôles ; et `test/fixtures/` n'est pas une racine de série exclue (seul `docs/**/*.md` l'est), d'où 57 l. de fixtures comptées. Scission pré-déclarée **non faite** (déclencheur : au-delà de 547) ; elle n'amènerait pas le lot sous 294 (J-ORACLE, J-RECU, J-LINT et leurs tests ≈ 70 l.). Décision : Q-M5-7.

## Tests (16 neufs, `node --test test/journal-index.test.ts`)
Dépôt fixture sous TEMP : deux commits déterministes (identité et dates fixes, `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL` vide, aucune variable `GIT_*`) : C1 `d3b8d4d9814b74bfa0ae9563616e8feb6f27309d` (a.txt, 2026-01-01T00:30:00Z), C2 `8216f30324b60802d9d6c91beb5f3082dbe0653e` (docs/b.md, 2026-01-02T00:30:00Z), reproduits à l'identique sur deux exécutions ; le test doré les vérifie avec un message de cause. Les entrées figées (M-X : G0, cp-1, G1, G2 à C1, corr, cp-2, G7, fusion ; M-Y : G0, G1, 4 corr) sont la fixture propre ; chaque test de contrôle en forge un défaut. Reçu du test CA-11 : écrit par le vrai `scripts/mission/launch.mjs`. Les 16 tests : golden ; build rouge (index intact, `--only`, aucun journal = exit 2) ; add CA-11 ; add champ requis manquant ; add `--date` ; add TAB et `F:` + deux espaces ; J-SCHEMA ; J-TIME ; J-TRACE ; J-ORIGIN (liste vide admise) ; J-TOURS et J-ADJ ; J-ORACLE (7 raisons + propre) ; J-RECU ; J-LINT (TODO ; chemin absent au commit) ; J-MODEL ; J-ADJ. Durée locale : 11 s. `tsc --noEmit` et `eslint` du test : 0 ; règles du cliquet sur le test : 0 (plafond 69 inchangé).

### Preuve F2P (M-4, `F:/Monark-wt-m4/scripts/red-proof.mjs`, gel 3, lecture seule)
`node F:/Monark-wt-m4/scripts/red-proof.mjs --base 3f502aa9 --gel F:/Monark-wt-m5 --repo F:/Monark-wt-m5 --out F:/tmp/methode/m5/f2p --draw 3 --seed 2026` : **exit 0, `ok: true`, 16 jugés, 16 F2P** (rouges sur la base par échec d'assertion, verts au gel : le test exécute la CLI, la base n'a pas le script ; aucun rouge d'import), 0 inchangé ; digest `9a99e1295fcc21122a56e5856f2984015c3c71e0406ba213325d00ce91b9e449` (calculé avant `docs/journal/M-5.jsonl`). TAP : `base.tap` `cfadf6b9924903d7f56332e7b7deedccc26034b185f3fe6e9ac9b43936d7c11c`, `gel.tap` `fab1cd9d0cf5b7ea52c3c9589206dcfcbdfc6c32cceda28cde698d9da13d5171` ; `RED-PROOF.json` `9ac9655ac568cffa9051711d7437669e301e5d4d9b9b8c5d00d9c08ad1d84b9c`. **Tueurs tirés (graine 2026) : 3/3 tués** par échec d'assertion, fichier restauré (sha `1af4f265…` avant = après) : `index.mjs:146 SDL` (J-TIME), `:46 CONST` (TAB), `:138 CONST` (served_from). Passe préalable `--draw 0` (`F:/tmp/methode/m5/f2p-draw0`) : 16 tueurs validés par `killerProblem`.

## Mutants (`F:/tmp/methode/m5/mutants/`, un clone, un mutant à la fois, test ciblé, restauration vérifiée par sha)
`harness.mjs`, lancé une fois (19:01:49-19:02:50Z) ; ligne de base : les 16 tests ciblés verts avant tout mutant ; **30 tués, 0 survivant, 0 non conclu** ; chaque TAP porte un seul `ERR_ASSERTION`, aucun autre code d'échec. `RESULTS.txt` sha256 `62654b6a2118b58f4c4b39bddf69c410720731a26429a131895a9c0a8e5d2307`.

| id | mutant (M01-M10 : liste de la mission) | ligne | test | issue |
|---|---|---|---|---|
| M01 | J-TIME retiré (date du commit) | 146 SDL | J-TIME | tué |
| M02 | J-ORACLE `served_from` retiré | 138 | J-ORACLE | tué |
| M03 | J-RECU retiré | 154 SDL | J-RECU | tué |
| M04 | J-LINT retiré | 156 SDL | J-LINT | tué |
| M05 | J-TOURS retiré | 161 SDL | J-TOURS et J-ADJ | tué |
| M06 | date de l'appelant acceptée et utilisée | 215 + 98 | add `--date` | tué |
| M07 | INDEX.md écrit malgré un rouge | 175 | build rouge | tué |
| M08 | en-tête daté par l'horloge | 188 | golden | tué |
| M09 | `error_origin` vide refusé | 63 | J-ORIGIN | tué |
| M10 | champ inconnu accepté | 84 | J-SCHEMA | tué |
| M11 | J-TIME retiré (dates décroissantes) | 147 SDL | J-TIME | tué |
| M12-M16 | J-ORACLE : rôle, sha256, head, start, recopie retirés | 135-139 SDL | J-ORACLE | 5 tués |
| M17 | J-RECU : `mission.sha != recu_sha` retiré | 154 | J-RECU | tué |
| M18 | J-LINT rejoué sur disque, jamais au commit | 155 | J-LINT | tué |
| M19 | J-MODEL sans frontière de jeton | 157 | J-MODEL | tué |
| M20 | J-MODEL non appliqué aux entrées à mission | 157 | J-MODEL | tué |
| M21-M23 | J-TRACE, J-ORIGIN, J-ADJ retirés | 149, 150, 158 SDL | leur test | 3 tués |
| M24 | `--only` écrit l'index | 175 | build rouge | tué |
| M25 | TAB accepté | 46 | add TAB | tué |
| M26 | présence par gate (NEED) ignorée | 88 | add champ requis | tué |
| M27 | `add` écrit malgré J-SCHEMA | 113 | add champ requis | tué |
| M28 | date de l'outil fixée à l'époque | 98 | add CA-11 | tué |
| M29 | seuil J-TOURS 5 devenu 6 | 161 | J-TOURS et J-ADJ | tué |
| M30 | aucun journal lu comme un vert vide | 165 SDL | build rouge | tué |

## Oracle (outil du tronc, rôle G1)
`node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-m5 --base 3f502aa9`, 19:04:52-19:12:53Z ; verrou d'hôte `F:/tmp/oracle-lock` pris et rendu par l'outil (attente 0 s ; `owner.txt` observé à 19:06:58Z : rôle G1, pid 93676) ; C-V-4 au passage : 20 936 Mo libres, 6 `node.exe`.
- **Enregistrement** `F:/tmp/oracle-results/3f502aa956f02bd8053379fc6b5323113c053e77-badf88ea5a13ff22-G1-20260928T190452Z-93676.json`, sha256 `0f5d8149336afda7625c43e50290ab869922fa2e8b5dccf9f1f5d20cd9fa315e` : `tree.head` `3f502aa956f02bd8053379fc6b5323113c053e77`, `dirty` `badf88ea5a13ff2273832d972570b544f56c36cca8abdc4c84d6a2aa0a528d34` (script, test, fixtures), `tree.object` `8e27523d04dc6fad5dea17e766895072ed286371`, `static_only: false`, `served_from: null`, **exit 0**.
- **Portes** : 9, toutes exit 0 : les 7 de la mission (`gate:vocab`, `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, `test`) plus `lint-model-pinning.sh` et `r25` (dérivées de ci.yml par l'outil) ; test 42 une fois, dans `npm test`.
- **Tests** : **1 511 = 1 495 + 16** (pass 1 508, skip 3, fail 0). Base 1 495 : enregistrement G7 M-3 (sha `570aa77e`, commit `2328ad56`) ; `git diff --stat 2328ad56 3f502aa9` sur test, packages, apps, scripts, package.json, .github : vide.
- **R-25 de l'enregistrement** : 476 (arbre sans `docs/journal/`, écrit à l'étape 4 après cet oracle, qui fournit l'enregistrement cité par l'entrée) ; 477 mesuré ensuite avec l'entrée (§ R-25).
- **`export:check` avec `docs/journal/` présent** (19:14:11Z, `node scripts/export-public.mjs --check` sur le worktree) : exit 0, « 0 forbidden path » ; `collectFiles` garde 491 fichiers, aucun chemin de ce lot (`scripts/journal/`, `test/journal-index.test.ts`, `test/fixtures/journal/`, `docs/journal/` : hors liste blanche, `docs/**` en liste noire).

## CA-11 (branchement réel)
- **Entrée G1 réelle** (étape 4, 19:13:18Z) : `node scripts/journal/index.mjs add --repo F:/Monark-wt-m5 --lot M-5 --gate G1 --from-recu F:/tmp/methode/mission-g1-m5.recu.json --from-oracle <enregistrement ci-dessus> --model claude-opus-5-5[1m] --tier claude-opus-5-5 --effort max --r25 477/547 --note ...` : exit 0. `docs/journal/M-5.jsonl` (1 ligne, sha256 `6cf7433e835a5640b5a56225c8e94755f92871c0c6a129734d6810fd314a8097`) : `mission` = {`F:/tmp/methode/mission-g1-m5.md`, sha `75021ada…` (octets relus par l'outil), `recu_sha` `75021ada…`, `recu_date` 2026-09-28T18:23:47Z} ; `oracle` = {l'enregistrement ci-dessus, sha256 `0f5d8149…`, rôle G1, head `3f502aa9`, start 19:04:52Z, `served_from` null, 1 511 tests} ; `tree_head` `3f502aa9` (prérempli depuis l'enregistrement) ; `commit` null (Q-M5-1) ; `r25` 477/547 (476 + cette ligne, remesuré après écriture : 477).
- **`build` vert sur le worktree** (19:13:19Z) : `node scripts/journal/index.mjs build --repo F:/Monark-wt-m5` : `counts` J-* = 0, `verdict vert (0 hit(s), 1 lot(s), 1 entries)` ; J-RECU (octets de la mission = reçu), J-LINT (cette mission rejouée sur disque : verte), J-MODEL (`claude-opus-5-5[1m]` au palier `claude-opus-5-5`) passés ; `docs/journal/INDEX.md` écrit (17 l., sha256 `2f6e05a8f24731b4338d2f29897bfa9316cab0d059f394e16204797fb2dbc791`). Garde d'octets de M-1 (ses six classes, appliquées à la main aux deux fichiers encore non suivis) : 0.
- **Entrée G7 M-3 sur clone jetable** `F:/tmp/methode/m5/retro-m3` (clone `--no-local` du worktree à `3f502aa9` ; `git cat-file -e 2328ad56^{commit}` : présent ; `index.mjs` copié, sha égal) : `add --lot M-3 --gate G7 --commit 2328ad56b92d6e1176bca7b32371cbc8b49fd8cb --from-oracle F:/tmp/oracle-results/2328ad56b92d6e1176bca7b32371cbc8b49fd8cb-G7-20260928T170357Z-121056.json --verdict ACCEPTE --adjudication ... --origin "" --trace "motif:decision 265 puis 275, PUBLIC-CADENCE-1 rang 1 apres la methode"` (19:05:35Z), puis `build` : **vert** (0 hit). J-ORACLE vérifié sur l'enregistrement réel : sha256 `570aa77e93a1096a3c9a5cdb03988e09628f5b35c272ecfe582cba584795e61d`, rôle G7, head `2328ad56` = commit, start 17:03:57Z après la date de validation 17:03:48Z (`%cI` 18:03:48+01:00, +9 s), `served_from` null, 1 495 tests. `M-3.jsonl` sha256 `9774a9103629abfa9494f28349376a0d9c107f5217c94ef201dd2a461cf6fa38`, `INDEX.md` `f1c7bf1aa5bb4a23941b7d3a885fb75a718bd3fe990e172b12dfdd415efc3335`. Rien de ce clone dans le gel. Preuve : le remplissage rétroactif est possible depuis les faits (enregistrement, commit) ; l'adjudication et les `error_origin` réels restent l'acte de l'orchestrateur au G7 de M-5 (ici `--origin ""` et une adjudication de fixture qui le dit).

## Tuyaux (règle Branchement, ADR-M018 D3)
- **Entrée** : `add` ; `mission` depuis un reçu de `scripts/mission/launch.mjs` (M-2a), `oracle` depuis un enregistrement de `scripts/oracle/run.mjs` (M-3).
- **État** : `docs/journal/<lot>.jsonl`, append-only (une ligne par événement ; `add` refuse d'ajouter à un fichier sans saut de ligne final).
- **Sortie** : `build` (verdict, un rouge par ligne, exit) et `docs/journal/INDEX.md` (écrit seulement au vert).
- **Consommateur** : l'orchestrateur au point d'étape et au G7 de tout lot, et la cartographie de clôture de phase. **Tuyau non encore câblé (mesuré)** : `docs/methode/CHECKLIST-G7.md` n'existe pas à la base `3f502aa9` (`ls docs/methode/` : deux fiches FAITS seulement) ; la ligne datée « `build` au G7 » est un acte de l'orchestrateur (275-e), hors de ce lot. Item formé **JOURNAL-G7-CHECKLIST-1** : créer ou amender `docs/methode/CHECKLIST-G7.md` d'une ligne datée « `node scripts/journal/index.mjs build --repo <tronc>` vert, cité » ; propriétaire : orchestrateur ; déclencheur : G7 de M-5 (avant le remplissage rétroactif). Tant qu'il est ouvert, le journal outillé reste « upcoming » dans tout registre public (règle Branchement).
- **Test de la composition** : « add: a launch receipt and an oracle record give one conforming line dated by the tool, and build is green on it (CA-11) » (launch.mjs → reçu → `add` → `build` vert) ; en réel : l'entrée G1 de ce lot et l'entrée G7 M-3 sur clone.

## MAST
- **FM-2.6** : un `build` vert prouve la cohérence des faits cités (fichiers présents, sha égaux, dates ordonnées, enregistrement du bon rôle et du bon arbre, reçu du texte lancé, linter rejoué vert), **jamais la justesse d'un verdict** ni la nature d'une adjudication (J-ADJ : présence seule). En tête du script, l.15-16.
- **FM-1.2 (palier)** : J-MODEL rougit un modèle résolu qui n'est pas le palier déclaré, un palier hors `TIERS` (dont `claude-opus-5`), une entrée d'agent sans modèle ; limite : le palier comparé est celui de l'entrée, pas encore celui de l'en-tête de mission (M-2b non fusionné, Q-M5-12).
- **FM-3.3** : fixtures isolées de l'hôte (configuration git système et globale coupées, variables `GIT_*` retirées) ; les sha des commits de fixture sont vérifiés avec un message de cause.
- **FM-1.3, FM-1.4 (état périmé)** : J-LINT rejoue sur disque quand `commit` est `null` ; un worktree purgé ou une branche supprimée rougit après coup (Q-M5-5).

## `error_origin` proposés (vocabulaire fermé ; assignation : G7)
- **ORCH** : la mission cite `node F:/Monark/scripts/oracle/r25.mjs` comme commande, or ce module n'a pas de CLI (Q-M5-8) ; la mission dit `commit` « `null` pour G0/cp-1 » puis écrit l'entrée G1 sans `--commit` dans le gel (Q-M5-1).
- **G0** : la taille M-5 de l'ADR (140 = 80 + 60, C l.52) précède la décision 275-e qui a fixé dix contrôles et un schéma fermé (Q-M5-7).
- **G1** : `Date.parse` de la sortie `git show --format=%cI` sans `.trim()` (NaN, faux rouge J-TIME) ; attrapé par l'essai du G1 avant tout test, corrigé l.129 ; aucun défaut échappé.

## Review Focus (pour le G2 ; chaque classe rattachée à un test)
1. Présence par gate : J-SCHEMA ou contrôle dédié (Q-M5-2 ; tests J-SCHEMA, J-TOURS et J-ADJ, J-TRACE).
2. Déterminisme des commits de fixture sur un autre git ou un autre OS (CI ubuntu) : **limite déclarée, non exécutée ici** (tous les passages sur l'hôte Windows, git 2.55.0.windows.5, Node v24.15.0 ; les clones de G2 et cp-2 le seront aussi). Les sha C1/C2 ne dépendent que de l'arbre, du parent, de l'auteur, du committer et du message (configuration système et globale coupées, `-b main`, dates `@epoch +0000`, identité fixe) ; si l'un dérive sur la CI, la première assertion du test doré nomme la cause (« a git config, identity or object format leaked »).
3. J-LINT : rejeu au commit de l'entrée contre rejeu sur disque (test J-LINT, mutant M18) et dérive après purge (Q-M5-5).
4. Entrée G1 du lot : enregistrement d'oracle d'un arbre sans `docs/journal/` (ordre des étapes 4 et 5) ; `build` vert cité.
5. Frontière des contrôles fail-closed : fichier absent ⇒ rouge pour J-ORACLE, J-RECU, J-LINT (tests « record absent », « none.md »).

## Q-M5-n (fermées : une réponse par option)
- **Q-M5-1** : `commit` nul admis pour G1 et corr (entrée écrite avant son gel), requis pour G2, cp-2, G7, fusion : **confirmer**, ou exiger que l'orchestrateur écrive G1/corr après le gel (alors `commit` requis hors G0/cp-1 et l'étape 4 de cette mission devient impossible) ?
- **Q-M5-2** : présence de `adjudication` et `public_trace` au G7 portée par J-ADJ et J-TRACE, pas par J-SCHEMA (un G7 incomplet s'enregistre, `build` le rougit) : **confirmer**, ou les rendre requises à J-SCHEMA (`add` refuse, J-ADJ devient inatteignable) ?
- **Q-M5-3** : J-TRACE rougit une `ref` vide pour tout `kind` (plus strict que « motif ») : **garder** ou restreindre à `motif` ?
- **Q-M5-4** : J-TOURS compte les entrées `corr` ; un tour relancé (agent mort au quota) et réenregistré compte deux fois : **garder** (plus strict) ou compter les tours distincts ?
- **Q-M5-5** : J-LINT sur disque (`commit` nul) dépend de l'hôte du jour (worktree, branche `lot/`, chemins `F:/tmp`) : après la purge de M-8, une entrée verte rougit. Le reçu porte `head` pour ce rejeu (launch.mjs, Q-G2-5 de M-2a). Options : (a) garder 275-e ; (b) rejouer à `head` du reçu (champ `mission.recu_head`, schéma changé) ; (c) figer le verdict du linter au moment de `add`.
- **Q-M5-6** : J-ORACLE ne vérifie ni `static_only`, ni `tree.dirty` de l'enregistrement cité (mesuré : les 9 enregistrements G2, cp-2, G7 de `F:/tmp/oracle-results` ont `dirty` nul et `static_only` faux ; un G2 a `exit` 1, rejoué vert ensuite, donc « exit ≠ 0 ⇒ rouge » serait faux) : **ajouter** `static_only` faux et `dirty` nul (lot M-5b ou correction) ou laisser ?
- **Q-M5-7** : R-25 477 > 294 (cause nommée § R-25), < 547 : **accepter** ou **scinder** (J-ORACLE, J-RECU, J-LINT en M-5b, lot restant ≈ 400) ?
- **Q-M5-8** : `r25.mjs` sans CLI : R-25 mesuré par sa fonction `r25()` sur clone et par le champ `r25` de l'enregistrement d'oracle ; **ajouter** une CLI à `r25.mjs` (lot séparé) ou citer la méthode telle quelle dans les missions ?
- **Q-M5-9** : « Point d'étape » rendu `## Status point` (anglais, contrainte `lang:gate` sur l'index doré) : **confirmer** ?
- **Q-M5-10** : `--only` n'écrit jamais l'index : **confirmer** ?
- **Q-M5-11** : chemin relatif d'une entrée lu depuis `--repo` (fixtures) : **confirmer**, ou refuser les chemins relatifs à J-SCHEMA (fixtures à réécrire) ?
- **Q-M5-12** : J-MODEL compare au palier **déclaré dans l'entrée** (`--tier`), pas à celui de l'en-tête de la mission (format fixé par M-2b, non fusionné) : **item** au G0 de M-2b ou M-5b : `add --from-recu` lit le palier de l'en-tête ?
- **Q-M5-13** : `add --from-recu` hache la mission lue au moment de `add`, pas les octets que le lanceur a hachés : une mission éditée entre le lancement et la lecture de l'agent, puis rétablie avant `add`, reste invisible à J-RECU (même octets) ; c'est le reçu non signé de METHODE-RECU-SIGNE-1 : **rattacher** à cet item (aucun code ici) ?
- **Q-M5-14** : `build` sur un fichier de lot vide : J-SCHEMA rouge (exit 1, contenu malformé) ; aucun fichier `*.jsonl` (ou `--only` d'un lot absent) : exit 2 (rien à construire). Deux codes pour deux états voisins, voulus : **confirmer** ?

## Corrections — tour 1 (correcteur, 2026-09-28)
- **Correcteur** : modèle résolu `claude-opus-5-5` (identifiant exact donné par le harnais, R-1), palier `claude-opus-5-5`, effort max, instance fraîche (≠ worker G1 `claude-opus-5-5[1m]`, ≠ relecteur G2). **Heures** (`date -u`) : début 21:05:45Z (sha de la mission recalculé) ; code, fixtures et test 21:18-21:28Z ; entrée réelle 21:28:57Z ; red-proof 21:29:24-21:38:36Z ; mutants 21:35:16-21:36:47Z ; oracle 21:40:05-21:47:53Z ; R-25 21:48:31Z ; TAP 21:48:37Z ; rédaction 21:48:51-21:50:38Z.
- **Mission** `F:/tmp/methode/mission-corr-m5-t1.md` : sha256 `0bfbe8ca4cef2dec8b7de5a687091f23536965422c872ee68ce7bf23846504a0` recalculé, égal au reçu `F:/tmp/methode/mission-corr-m5-t1.recu.json` (vert, 21:04:26Z, head `d92c2d52`).
- **Cadre** : worktree modifié en place, aucun git écrivant (ni le worktree ni `F:/Monark`) ; clones `--no-local` sous `F:/tmp/methode/m5/corr1/` seulement (`lint`, `mutants/clone`, `r25clone`) ; TEMP `F:/tmp/methode/m5/corr1/tmp` ; jonctions du clone `lint` par `mk-nm.ps1` (220 entrées, 10 `@monark`, 0 échec), retirées par `rm-nm.ps1` (« removed ») ; aucun réseau ; rien sur C: ; aucune course ciblée ni harnais pendant la suite sous verrou (21:40:59-21:47:43Z).
- **R-25** (`r25()` du tronc sur `r25clone`, gel figé, `3f502aa9...HEAD`, pathspec `ci.yml:82`) : **477 → 522** (0 suppression, CONTENT_STAT 0), égal au champ `r25` de l'enregistrement d'oracle ; script 225, test 238, doré 38, fixtures 20 (M-X 8, M-Y 7, mission 2, trois enregistrements 1), entrée réelle 1. **Au-delà de l'estimation 485-495, sous le STOP 547 (marge 25).** Cause nommée, par correction ci-dessous : test J-ORACLE neuf avec quatre tueurs internes (+16), test `add` des reçus (+8), cas J-LINT (+5), épinglage du compte de tours de l'index (+2) (Q-C5T1-4).

### C-G2-1 (bloquante) — J-ORACLE n'accepte qu'un enregistrement complet de M-3, plein, propre et vert
- **Fait** : `oracleWhy` (l.133-146) vérifie, après le sha, la complétude (l.137-138) : copie de `REQUIRED` (l.46, égale à `scripts/oracle/run.mjs` l.33, Q-G2-1 (a)), `schema` = `monark.oracle.v1`, `pid` entier > 0 et `tree.object` 40-64 hex (l'expression de `run.mjs` l.80). Après `served_from`, il exige `static_only === false`, `tree.dirty === null` et `exit === 0` (l.143). Les fixtures d'oracle passent au schéma complet (17 champs, une ligne chacune ; `tree.object` = arbres réels de C1 et C2, `81f4fbba…` et `30cd0efe…`) ; sha repinés dans `M-X.jsonl` l.4, 6, 7 (`9691725d…`, `a6837e46…`, `a1459a15…`).
- **Preuve** : test neuf « J-ORACLE: a record of a static-only run, of a dirty tree, red, incomplete or of another schema; REQUIRED is the list of scripts/oracle/run.mjs », une assertion par condition, chacune sous son `// killer:` : tueur de tête K1 (`static_only`), tueurs internes K2 (`dirty`), K3 (`exit`), N4 (complétude) et N3 (copie de `REQUIRED`). L'égalité lit `scripts/oracle/run.mjs` **du même arbre**, dans un `try` (à la base, rouge par assertion, jamais par exception). K1, K2, K3, N3, N4 et N5 (schéma étranger) sont tués par `ERR_ASSERTION`. Le tronc n'est pas touché (C5).
- **Taille** : code +4 (l.46, 137, 138, 143), en-tête +1 ; test +16 (test neuf 14, aide `required` 2) ; fixtures 0 nette (six lignes remplacées).

### C-G2-2 (bloquante) — J-LINT rejoue à `commit ?? recu_head`, jamais sur disque
- **Fait** : `mission.recu_head` entre au schéma (l.59-60) : requis et validé par `SHA` quand il y a un reçu, nul sinon. `add --from-recu` recopie `head` du reçu (l.105). J-LINT (l.160-161) rejoue à `rev = commit ?? recu_head`, avec le mémo par `(chemin, rev)`, et rougit une révision qui n'est pas un commit de `--repo` (Q-C5T1-1). Une ligne rouge à J-SCHEMA n'est lue par aucun autre contrôle : une valeur hors `SHA` n'atteint jamais `git show -s`, `git ls-tree` ni `git show`. Fixtures : `recu_head` = C1 dans les missions de M-X (l.3-6) et de M-Y (l.2-7).
- **Preuve** :
  - J-SCHEMA : `recu_head` `--all` (une option), `HEAD` (une réf) et `null` sans commit donnent trois hits « mission out of domain » (N1 tué).
  - J-LINT : une entrée G1 à `recu_head` C1 dont la mission cite `docs/b.md` (absent à C1, présent sur disque) est **rouge** ; au gel, elle était verte, c'était le fail-open. À C2, elle est verte.
  - Une mission citant `docs/journal/M-X.jsonl`, présent sur disque seulement, rougit aux gates G1, G2, corr et cp-2 (Y05, Y06, M18, N7 tués).
  - Le même texte à deux commits ne donne qu'un rouge (Y13 tué). Un `recu_head` de 40 zéros donne « not a commit of --repo » (N2 tué). CA-11 : `recu_head` est recopié du reçu (N6 tué).
- **Taille** : code 0 nette (cinq lignes remplacées) ; test +6 (J-SCHEMA 1, J-LINT 5) ; fixtures 0 nette.

### C-G2-3 — J-TOURS et l'index comptent les tours distincts
- **Fait** : J-TOURS compte les valeurs distinctes de `tour` (l.165-166) ; le rouge porte sur la première entrée du sixième tour. L'index fait de même (l.192) : libellé « Tours (distinct corr tours) » (l.199), et « Over 3 tours » (l.202) suit.
- **Preuve** : six entrées pour cinq tours ⇒ vert, six tours ⇒ J-TOURS (test J-TOURS) ; K4 (compte des entrées, qui plante) et K4b (sans plantage) tués. Pour l'index, M-Y porte un tour 4 réenregistré (l.7) et le doré dit « 4 » tours pour 15 entrées : N8, l'index revenu au compte des entrées, est tué par le test doré.
- **Taille** : code 0 nette (quatre lignes remplacées) ; fixtures +2 (M-Y 1, doré 1).

### C-G2-4 — l'aide `build()` du test distingue « vert » de « plantage »
- **Fait** : l'aide renvoie le code sentinelle `CLI-FAILED`, avec l'exit et la sortie d'erreur, quand la CLI n'imprime pas de JSON ou sort autrement que 0 (vert) ou 1 (rouge) (Q-C5T1-2).
- **Preuve** : Z1b (plantage sur deux dates égales) est tué par son test J-TIME, et K4 (plantage) par le test J-TOURS, tous deux par `ERR_ASSERTION`. La preuve F2P est préservée : 18 rouges à la base, tous par `ERR_ASSERTION`.
- **Taille** : test +2.

### C-G2-5 — bornes épinglées
- **Y01, Y02, Y03** : un commit objet C3 hors branche (`commit-tree` ; HEAD reste C2, le doré ne bouge pas), commis à 00:30Z et affiché `+01:00`, d'auteur 23:30Z la veille. Une entrée à la même seconde ⇒ vert ; dans l'heure du décalage ⇒ vert ; après la seule date d'auteur ⇒ J-TIME.
- **Y04, Y12** : test neuf « add: a receipt that is not green, or whose mission file is absent, exits 2 and writes nothing; a green one is recorded ». Reçu `rouge` et mission absente : exit 2, rien d'écrit, messages vérifiés ; témoin vert : exit 0.
- **Y07, Y08** : des copies `start` et `served_from` différentes de l'enregistrement ⇒ « a field copied into the entry != the record ».
- **Y09** : des lots `M-10` et `M-2a` donnent leurs hits dans l'ordre naturel. **Y10** : les 9 codes exacts de `ORIGINS` sont verts (C-G2-6, décision Q-G2-4 : `G2` gardé, aucun code changé). **Y13** : ci-dessus.
- **Preuve** : Y01-Y10, Y12 et Y13 tués par `ERR_ASSERTION` ; aucun survivant, donc aucune équivalence à prouver.
- **Y11** (enfant mort), rejoué : **conclu**. La ligne du test ciblé est absente et le fichier est rouge au niveau fichier (`ERR_TEST_FAILURE`, `exitCode: 1`, `signal: ~`). `classify()` de red-proof le classe `other-fail`, pas `inconclusive` (ni exit 134 ni signal). Le mutant est donc détecté (le fichier, donc `npm test`, rougit), mais jamais par assertion : le processus qui assertait est mort (Q-C5T1-6).
- **Taille** : test +13 (C3 1, Y09 1, test `add` 8, J-TIME 2, copies 1 ; Y10 0).

### C-G2-7 — registre
- l.44 de ce journal : « fixtures 20 » devient « fixtures 19 + l'entrée réelle `docs/journal/M-5.jsonl` 1 ». Le `REPONSE.md` du G1 n'est pas réécrit ; la réponse de ce tour porte la correction (477 = 220 + 200 + 37 + 19 + 1).

### Q-G2-2 (a) — entrée réelle régénérée
- La ligne G1 d'origine (`6cf7433e…`) est déplacée vers `F:/tmp/methode/m5/corr1/M-5.jsonl.g1`.
- `add --repo F:/Monark-wt-m5 --lot M-5 --gate G1 --from-recu F:/tmp/methode/mission-g1-m5.recu.json --from-oracle F:/tmp/oracle-results/3f502aa956f02bd8053379fc6b5323113c053e77-badf88ea5a13ff22-G1-20260928T190452Z-93676.json --model claude-opus-5-5[1m] --tier claude-opus-5-5 --effort max --r25 477/547 --note "regeneree au tour 1 (C-G2-2) ; entree G1 d origine ecrite le 2026-09-28T19:13:18Z"`, à 21:28:57Z : exit 0.
- `docs/journal/M-5.jsonl` : une ligne, sha256 `bf6392a8…`, `recu_head` `3f502aa9` (le `head` du reçu).
- `build --repo F:/Monark-wt-m5` **vert** (0 hit, 1 lot, 1 entrée) ; `INDEX.md` 17 l., `84d82d07…`, identique à l'octet sur deux `build`.
- Le second enregistrement G1 de `F:/tmp/oracle-results` (`…-2203d2bad901733e-G1-20260928T191501Z-56736.json`) n'est pas utilisé (Q-C5T1-7).

### Mutants (un clone, un lancement : `F:/tmp/methode/m5/corr1/mutants/`, 21:35:16-21:36:47Z)
57 mutants : les 30 du G1 (M01-M30, ancres déplacées, même mutation), K1-K4b et Z1b de la revue G2, Y01-Y13 du G2 réancrés, N1-N8 sur les gardes de ce tour. Ligne de base : les 18 tests ciblés verts avant tout mutant ; ancres et noms de tests vérifiés à sec (`--check-anchors`) avant le clone. **56 tués, 0 survivant, 1 conclu hors assertion (Y11).** Les 56 portent exactement un `ERR_ASSERTION` et sont classés `assert-fail` par `classify()` de red-proof. `RESULTS.txt` `a0a5d04a…`, `harness.mjs` `6d0f40ff…` ; `index.mjs` restauré après chaque mutant (`4eb51fd9…`).

| id | mutation | ligne | test ciblé | issue |
|---|---|---|---|---|
| M01-M30 | les 30 du G1 (J-TIME, J-ORACLE, J-RECU, J-LINT, J-TOURS, J-MODEL, J-TRACE, J-ORIGIN, J-ADJ, `--date`, `--only`, TAB, NEED, J-SCHEMA, horloge) | déplacées | leurs tests | 30 tués |
| K1 / K2 / K3 | J-ORACLE ignore `static_only` / `tree.dirty` / accepte `exit ≠ 0` | 143 | J-ORACLE complet | tués |
| K4 / K4b | J-TOURS revenu au compte des entrées (avec et sans plantage) | 166 | J-TOURS | tués |
| Z1b | `build` plante sur deux dates égales | 152 | J-TIME | tué (sentinelle) |
| Y01 / Y02 / Y03 | décalage de `%cI` perdu / `%aI` / `>` strict | 131, 151 | J-TIME | tués |
| Y04 / Y12 | `add` accepte une mission absente / un reçu non vert | 105, 104 | add reçus | tués |
| Y05 / Y06 | J-LINT sur disque (toutes entrées / cp-2) | 160 | J-LINT | tués |
| Y07 / Y08 | copies `served_from` / `start` non comparées | 144 | J-ORACLE | tués |
| Y09 | tri naturel retiré | 171 | build rouge | tué |
| Y10 | `G2` retiré d'`ORIGINS` | 43 | J-ORIGIN | tué |
| Y11 | la CLI tue le processus du test | 125 | J-ADJ | conclu : détecté au niveau fichier (`other-fail`), jamais par assertion |
| Y13 | mémo J-LINT par chemin seul | 160 | J-LINT | tué |
| N1 | `recu_head` non validé par `SHA` | 60 | J-SCHEMA | tué |
| N2 | révision absente rejouée quand même | 160 | J-LINT | tué |
| N3 / N4 / N5 | copie de `REQUIRED` divergente / complétude ignorée / schéma étranger | 46, 138, 137 | J-ORACLE complet | tués |
| N6 | `recu_head` non recopié par `add` | 105 | add CA-11 | tué |
| N7 | entrée sans commit rejouée sur disque (règle du gel) | 160 | J-LINT | tué |
| N8 | index revenu au compte des entrées | 192 | doré | tué |

### Preuve F2P de clôture (`F:/Monark-wt-m4/scripts/red-proof.mjs`, gel 3 de M-4, lecture seule)
- `--draw 0` (21:29:24-21:30:05Z) : 18 jugés, 18 F2P ; tous les tueurs sont valides (`killerProblem`).
- `node F:/Monark-wt-m4/scripts/red-proof.mjs --base 3f502aa9 --gel F:/Monark-wt-m5 --repo F:/Monark-wt-m5 --out F:/tmp/methode/m5/corr1/f2p --draw 3 --seed 2026` (21:37:17-21:37:49Z) : **exit 0, `ok: true`, 18 jugés, 18 F2P** (rouges à la base par `ERR_ASSERTION`, verts au gel), **3/3 tués** (`index.mjs:151 SDL`, `:48 CONST`, `:142 CONST`), fichier restauré (`4eb51fd9…` avant et après). Digest `2e209353aaa6bdf41ac42ce9c327af57bacea11d382a0ea30f1e826019e1367e` ; `RED-PROOF.json` `b3868a7a…` ; `base.tap` `4d7409dd…` ; `gel.tap` `339f2b89…`.
- `--draw 18` (`f2pall/`, 21:37:49-21:38:36Z) : **18/18 tués**, chacun par un seul `ERR_ASSERTION`, `ok: true`, même digest ; `RED-PROOF.json` `0b72ef63…`.
- Les deux `MODULE_NOT_FOUND` de `base.tap` sont du texte de la sortie d'erreur de la CLI absente, recopié dans des messages d'assertion ; le code de l'entrée est `ERR_ASSERTION`.
- Les premières passes (`f2p-run1/`, `f2pall-run1/`, 21:30-21:31Z) précèdent l'ajout du tour réenregistré de M-Y (N8) : elles sont remplacées, et gardées.

### Oracle (outil du tronc, rôle corr)
`node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-m5 --base 3f502aa9` (21:40:05-21:47:53Z ; outils du tronc inchangés depuis `3f502aa9`, `git diff --stat` vide sur scripts, test, package.json et .github ; C-V-4 avant : 24 711 Mo libres, 11 `node.exe` ; verrou pris et rendu par l'outil, attente 0 s).
- **Enregistrement** `F:/tmp/oracle-results/d92c2d5263ec8ac96780cb6aba494ad3b7f374f0-5269820baddc7495-corr-20260928T214006Z-69056.json`, sha256 `42e0a578843094fb5f4ebd6997b858d3a240a0684d9b1f77d3499cb24c7928ac` : `tree.head` `d92c2d52…` (gel 1), `dirty` `5269820baddc74959c22e0afc2cc9c78caaf0ecd956bc32622adbdc00691702c` (les corrections de ce tour), `tree.object` `e5c416dd…`, `static_only: false`, `served_from: null`, **`exit` 0**.
- Portes : 9, toutes à exit 0 (8 statiques hors verrou, `test` sous verrou 403 s).
- Tests : **1 513 = 1 495 + 18** (pass 1 510, skip 3, fail 0). Les trois skips sont des skips déclarés d'avant le lot (sentinel win32 deux fois, artefact u4b) ; les 18 tests du lot passent chacun une fois. Test 42 : une fois (`09-test.log` l.1836).
- `r25` de l'enregistrement : STAT 522.
- Après l'oracle, le seul fichier modifié est ce journal (docs, hors R-25 et hors digest F2P). Les sha des onze fichiers pris par l'oracle sont dans `F:/tmp/methode/m5/corr1/pre-oracle-sha256.txt`, inchangés sauf celui-ci.

### `error_origin` (vocabulaire fermé de D11 et sa ligne datée du 2026-09-28 21:0x UTC : `G2` = défaut introduit ou laissé passer par le relecteur G2)
| Correction | Origine proposée | Motif |
|---|---|---|
| C-G2-1 | ORCH + G1 | liste J-ORACLE de 275-e sans complétude ; fixtures à 6 champs malgré « au format `monark.oracle.v1` » |
| C-G2-2 | ORCH | « sur disque quand `commit` est `null` » (275-e) |
| C-G2-3 | ORCH | « entrées `corr` (tours) », libellé ambigu |
| C-G2-4 | G1 | aide de test qui lisait un plantage comme un vert |
| C-G2-5 | G1 | bornes sans fixture (fuseau, auteur, même seconde, reçu non vert, mission absente, tri, recopies) |
| C-G2-7 | G1 | classe REGISTRE-INTERNE |

Aucun défaut échappé de ce tour. Un presque-défaut a été fermé dans le tour : la correction (b), telle que mesurée en `probe-q5`, laissait passer un `recu_head` bien formé mais absent du dépôt (N2). Si le G7 l'enregistre, l'origine proposée est `G2`.

### Q-C5T1-n (fermées : une réponse par option)
- **Q-C5T1-1** (C-G2-2) : J-LINT rougit une révision bien formée (`commit` ou `recu_head`) qui n'est pas un commit de `--repo`, comme le refus `--rev` de `lint.mjs` l.154. Sans ce garde, `lintMission` lit un arbre vide, et une mission sans chemin de dépôt passe verte (mesuré, mutant N2). **Garder**, ou retirer ?
- **Q-C5T1-2** (C-G2-4) : la sentinelle `CLI-FAILED` couvre aussi un exit incohérent avec les hits (JSON imprimé puis plantage). **Garder**, ou la restreindre à « pas de JSON » ?
- **Q-C5T1-3** (C-G2-1) : la complétude reprend l'expression de `run.mjs` l.80 (champs définis, `pid` entier > 0, `tree.object` hex), plus `schema`. J-ORACLE rougit donc aussi un `pid` invalide. **Garder** ?
- **Q-C5T1-4** (R-25) : 522 dépasse l'estimation 485-495, pour les causes nommées ci-dessus ; la marge est de 25 l. jusqu'au STOP 547 pour les tours 2 à 5. **Accepter** ? Sinon, deux retraits possibles : (a) fondre le test J-ORACLE neuf dans le test existant (environ -4 l.) ; (b) retirer les cas N2 et mémo de J-LINT (-1 l., N2 et Y13 survivraient).
- **Q-C5T1-5** : l'entrée `corr` du tour 1 n'est pas écrite (la mission dit « une ligne »). Deux options :
  - l'orchestrateur l'écrit au gel 2 : `add --gate corr --tour 1 --from-recu F:/tmp/methode/mission-corr-m5-t1.recu.json --from-oracle <l'enregistrement ci-dessus>`, commit nul (Q-M5-1) ;
  - le correcteur l'écrit, à partir du tour 2.
- **Q-C5T1-6** (Y11) : conclu « détecté au niveau fichier, jamais par assertion ». **Accepter** ? Sinon, un isolement de la CLI (processus intermédiaire) rendrait rouge par assertion la mort du parent, dans un lot à part.
- **Q-C5T1-7** : un second enregistrement G1 existe dans `F:/tmp/oracle-results` (`…-2203d2bad901733e-G1-20260928T191501Z-56736.json`, 19:15:01Z, après l'entrée G1 d'origine). Il n'est ni cité par le G1 ni utilisé ici. Le citer au G7, ou l'ignorer ?
- **Q-C5T1-8** (C-G2-3) : le tour 4 réenregistré de M-Y (fixture +1, doré +1) épingle le compte de tours de l'index (N8). **Garder** ?
- **Q-C5T1-9** (C-G2-2) : le domaine exige un `recu_head` (`SHA`) dès qu'il y a un reçu (`recu_sha` non nul), que l'entrée ait un `commit` ou non. C'est plus strict que la lettre de la mission (« entrée sans `commit` ni `recu_head` ⇒ J-SCHEMA rouge »). Tout reçu de `launch.mjs` porte `head` (l.35), et c'est le domaine que la sonde `probe-q5` du G2 a mesuré. **Garder**, ou n'exiger `recu_head` que si `commit` est nul ?

## Corrections — tour 2, court (correcteur, 2026-09-28)
- **Correcteur** : modèle résolu `claude-opus-5-5` (identifiant exact donné par le harnais, R-1), palier `claude-opus-5-5`, effort max, instance fraîche (≠ worker G1 `claude-opus-5-5[1m]`, ≠ relecteur G2, ≠ relecteur rr1, ≠ correcteur du tour 1). **Heures** (`date -u`) : début 22:59:56Z (sha de la mission recalculé) ; lecture des entrées 23:00-23:12Z, avis de l'advisor intégré (canal 1) avant tout code ; code et test 23:13-23:19Z (première exécution 23:15:13Z) ; ligne corr t1 déplacée 23:15:57Z, régénérée 23:16:04Z ; sonde des entrées réelles 23:16:34Z ; portes statiques 23:17:19-23:17:55Z, puis 23:19:06Z (test mis à jour) ; mutants 23:21:30-23:24:01Z ; R-25 avant 23:21:54Z ; C-V-4 23:24:24Z ; oracle 23:24:33-23:36:37Z (verrou 23:30:26Z) ; entrée corr t2 23:37:18Z ; `build` 23:37:23Z ; R-25 après 23:37:28Z ; red-proof 23:37:41-23:39:00Z ; TAP final 23:39:14Z ; rédaction à partir de 23:40Z.
- **Mission** `F:/tmp/methode/mission-corr-m5-t2.md` : sha256 `7fc5fd5d057b095748e1a087e8dd6bfcd50050b3c09484b6964cc64d9dbd2f84` recalculé, égal au reçu `F:/tmp/methode/mission-corr-m5-t2.recu.json` (vert, 22:58:44Z, head `6d9e8616`, base `3f502aa9`, 8 codes à 0).
- **Cadre** : worktree modifié en place (gel 2 `6d9e8616`), aucun git écrivant (ni le worktree ni `F:/Monark`) ; git de lecture sous `GIT_OPTIONAL_LOCKS=0` à partir de 23:13Z (avant : un `git status` d'orientation sans cette variable, qui peut rafraîchir le cache de stat de l'index, aucun contenu) ; clones `--no-local` sous `F:/tmp/methode/m5/corr2/` seulement (`lint`, `mutants/clone`, `probe-real/clone`, `r25clone-pre`, `r25clone-post` ; ceux de red-proof sous TEMP, retirés par l'outil) ; TEMP `F:/tmp/methode/m5/corr2/tmp` ; jonctions du clone `lint` par `mk-nm.ps1` (220 entrées, 10 `@monark`, 0 échec), retirées par `rm-nm.ps1` (« removed » ; `F:/Monark/node_modules` : 218 entrées, 10 `@monark`, intact) ; aucun réseau ; rien sur C: ; aucune course ciblée ni harnais pendant la suite sous verrou (23:30:26-23:36:37Z : attente et lectures seulement). Restent dans TEMP : `node-compile-cache` (node) et `monark-journal-wcFDUG` (23:22:52Z : le mutant Y11 tue le processus du test avant son crochet `after`, résidu attendu de ce mutant).
- **R-25** (`r25()` du tronc, clone à commit de gel, `3f502aa9...HEAD`, pathspec `ci.yml:82`, `r25-replay.mjs`) : **523** (gel 2, mesuré par rr1) → **537** après C-G2-10..13, avant la ligne corr t2 (`r25-pre.out`, égal au champ `r25` de l'enregistrement d'oracle) → **538** après la ligne corr t2 (`r25-post.out`) ; 0 suppression ; CONTENT_STAT 0. Par fichier : script 228, test 249, doré 38, fixtures 20, `docs/journal/M-5.jsonl` 3. **Au-delà de l'estimation 530-532 (+6), sous le STOP 547 (marge 9).** Causes : en-tête +3 (ligne de convention r25 demandée ; J-ORACLE par gate 3 → 4 l. ; J-LINT exact 1 → 2 l.), test nommé neuf +9 (ligne blanche, tueur, déclaration, aide, assertion sur deux lignes, tueur interne, assertion, fermeture), C-G2-12 +1, C-G2-13 +1, ligne corr t2 +1 (Q-C5T2-2).

### C-G2-10 — registre R-25 et convention
- **Fait** : la ligne corr t1 du gel 2 (écrite par l'orchestrateur à 21:58:04Z avec `r25` 522 ; sha de la ligne `5b5c8b32…`) est déplacée à l'octet vers `F:/tmp/methode/m5/corr2/M-5.jsonl.corr1` (`move-corr1.mjs` : fichier du gel 2 `ea300c17…` vérifié avant ; ligne G1 gardée à l'octet, `bf6392a8…`). Elle est régénérée par `add` à 23:16:04Z : mêmes `--from-recu` (`mission-corr-m5-t1.recu.json`) et `--from-oracle` (`…-5269820baddc7495-corr-20260928T214006Z-69056.json`, sha `42e0a578…`), `--tour 1`, `--model claude-opus-5-5 --tier claude-opus-5-5 --effort max`, **`--r25 523/547`**, note « tour 1 de corrections (C-G2-1..5, C-G2-7) ; ecrite par l orchestrateur le 2026-09-28T21:58:04Z avec r25 522 ; regeneree au tour 2 (C-G2-10) : le r25 d une entree est celui de l arbre qui la contient, elle comprise ».
- **Convention** (en-tête de `index.mjs` l.13, et ici) : **le `r25` d'une entrée est le R-25 (insertions + suppressions) de l'arbre qui la contient, elle comprise.** Entrée G1 : 476 + 1 = 477 ; corr t1 : 523, l'arbre du gel 2 ; corr t2 : 537 + 1 = 538, cet arbre (mesuré après écriture : 538).
  - **[2026-09-29, ligne datée rr3 C-G2-20, écrite au G1 de M-5b (ADR-METHODE-2 l.59, item 7)]** : la convention ci-dessus (« l'arbre qui la contient, elle comprise ») n'est plus celle du lot : lire § Corrections — tour 3, C-G2-17, « Fait » (l.347 depuis cette insertion, l.346 au gel 7 : l.13 de `index.mjs`, « the R-25 of the gel the entry records ») et la décision Q-RR3-1 (C-G2-22, CHANTIERS 2026-09-29 02:58 UTC) : le `r25` d'une entrée est le R-25 du diff du lot au moment où la ligne est ajoutée, elle comprise (lecture cumulative : REFUS 543, rr3 544, cp-2 bis 545, G7 546). Le paragraphe ci-dessus n'est pas réécrit (numéros de ligne cités par rr2 et rr3) ; la ligne de convention r25 de l en-tête de `index.mjs` (l.13 au gel 7, l.15 après M-5b) garde son texte (C-G2-22 hors de la liste fermée de la ligne M-5b).
- **Preuve** : `build --repo F:/Monark-wt-m5` vert à 23:16:09Z (0 hit, 2 entrées ; INDEX « R-25 of the last gel: 523/547 (corr) »), puis vert à 3 entrées (ci-dessous).
- **Taille** : en-tête +1 ; registre 0 nette (une ligne remplacée).

### C-G2-11 (a) — J-ORACLE lit la citation d'une entrée G1 ou corr
- **Fait** : `PRE_GEL = ["G1", "corr"]` (l.44) ; l'appel (l.159) lit la citation des gates `ORACLED` (G2, cp-2, G7 : `oracle` requis) et celle d'une entrée `PRE_GEL` dont `oracle` n'est pas nul. Dans `oracleWhy` (l.136-151), `gel = ORACLED.includes(e.gate)` (l.137). **Contrôles communs** : enregistrement présent et JSON, sha256 = `oracle.sha256`, complétude (`REQUIRED` l.49 = `run.mjs` l.33, `schema`, `pid`, `tree.object`), `role` = gate, `static_only === false`, `exit === 0`, champs recopiés égaux à l'enregistrement (rôle, tête, `start`, `served_from` par égalité profonde, `tests_total`), jamais recopiés par `build`. **G2, cp-2, G7 seulement** (inchangés) : `tree.head` = commit, `start` ≥ date du commit, `served_from` nul, `tree.dirty` nul (l.143-146). **G1, corr** : arbre sale admis (leur oracle court avant le gel, sur un arbre non commis), enregistrement servi (D4, `run.mjs` l.74-88) admis, sa citation comparée ; le rouge `static_only`/`exit` y dit « not a full, green run », sans « clean » (l.146). **G0, cp-1, fusion** : une citation n'est jamais lue (`run.mjs` l.24 n'a pas ces rôles ; Q-C5T2-1). En-tête : l.16-18 (« Green proves the coherence of the facts the controls below read »), l.25-28 (J-ORACLE par gate), l.30-31 (J-LINT : chemins de dépôt lus à la révision ; chemins absolus, branches et répertoires d'outils lus sur l'hôte au moment du `build`, C-G2-8).
- **Preuve (test)** : test neuf « J-ORACLE at G1 and corr (a run before the gel): a record absent, of another sha or role, incomplete, static-only, red or miscopied reddens; a dirty tree or a served record is admitted » ; tueur de tête l.206 (C01, l'appel du gel 2 : « `ORACLED` seul »), tueur interne l.211 (C03, `gel = true`). Sept rouges : corr à sha faux, enregistrement absent, `tests_total` recopié faux (tue C02, « recopie acceptée »), rôle G2, `exit` 1 ; G1 `static_only`, G1 sans `cv4`. Trois verts : corr sale, G1 sale, corr servi (`tests: null`).
- **Preuve (réel)** (`probe-real.mjs`, clone `probe-real/clone` au gel 2, `build --only`) : sous le code du tour, les entrées réelles G1 et corr t1 **vertes** ; la ligne corr à sha nul, à enregistrement absent, à `tests_total` 9999, à `served_from` forgé, et la ligne G1 à rôle recopié `corr` **rouges** (J-ORACLE, la raison attendue). Sous le code du gel 2, les sept **vertes** : c'est le trou mesuré par rr1. Au `build` final, les trois citations réelles sont lues et vertes (G1 `0f5d8149…`, sale `badf88ea…` ; corr t1 `42e0a578…`, sale `5269820b…` ; corr t2 `f6bcbd39…`, sale `1790b813…`).
- **Taille** : code 0 nette (huit lignes réécrites : l.44, 137, 143-147, 159), en-tête +2 ; test +9, plus les aides `record` (`tests` nul admis) et `why` (ligne d'entrée en paramètre) réécrites en place.

### C-G2-12 — un `recu_head` hors domaine n'atteint jamais git
- **Fait** : le test J-SCHEMA ajoute `--output=<T>/pwned` à la liste des `recu_head` (quatre « mission out of domain », dix lignes J-SCHEMA) et asserte qu'aucun fichier `pwned*` n'existe sous le répertoire temporaire du test.
- **Preuve** : R3b (importé du harnais de rr1) est tué par un seul `ERR_ASSERTION`.
- **Taille** : test +1.

### C-G2-13 — mémo J-LINT par `(chemin, rev)`
- **Fait** : le test J-LINT ajoute deux textes distincts (`later`, `todo`) à la même révision C2 ⇒ `["J-LINT M-X:2"]`.
- **Preuve** : R4 (importé de rr1) est tué ; Y13 aussi (mémo par chemin seul).
- **Taille** : test +1.

### Tueurs
- L'en-tête a grandi de trois lignes au-dessus de tout le code : les 22 `// killer:` du gel 2 passent de `index.mjs:n` à `n + 3` (`renumber-killers.mjs`) ; les deux du tour portent les numéros neufs. Les 24 lignes sont lues par `parseKiller` du tronc et vérifiées selon la règle de `killerProblem` (`killers.mjs` : 0 problème ; 19 tueurs de tête, 5 internes).

### Mutants (un clone, un lancement : `F:/tmp/methode/m5/corr2/mutants/`, 23:21:30-23:24:01Z)
80 mutants : les 57 du tour 1 et les 10 de rr1 (R1, R2, R3a, R3b, R4-R9), **importés** de leurs harnais (le texte de leurs constantes `T`, `E`, `SDL`, `STATIC`, `COPIES` et `M` est extrait puis évalué, jamais retapé ; sha256 vérifiés : `6d0f40ff…` et `c96be130…`) ; leurs lignes sont reportées du script du gel 2 (`4eb51fd9…`) au script du tour par les hunks de `git diff --no-index -U0` (liste « old->new » dans `RESULTS.txt`). S'y ajoutent les 13 du tour (C01-C13). Ligne de base : les 19 tests ciblés verts avant tout mutant. **77 tués, chacun par un seul `ERR_ASSERTION` (`assert-fail`).** `RESULTS.txt` `2c12751c…`, `harness.mjs` `7563a5b5…` ; `index.mjs` restauré après chacun (`b245e26a…`).
- **Y07 : ancre perdue** (rapportée, non lancée) : son texte ` || o.served_from !== null` n'existe plus en l.147, où la recopie `served_from` est comparée par égalité profonde (D4 sert G1 et corr). **C10** porte la même mutation sur le texte neuf : tuée (Q-C5T2-3).
- **Y11 : non conclu**, comme aux tours précédents : détecté au niveau fichier (`other-fail`, exit 1, signal `~`), jamais par assertion (Q-C5T1-6).
- **R1** survit à son test ciblé (« J-ORACLE … static-only … ») ; **le fichier entier rougit** sur le test neuf : son texte `STATIC` d'origine exige `tree.dirty` nul à toute gate, et la corr sale rougit. Ce n'est donc plus l'équivalence que rr1 avait mesurée au gel 2.
- **R3b** et **R4** tués (C-G2-12, C-G2-13).

| id | mutation (ligne) | test ciblé | issue |
|---|---|---|---|
| C01 | l'appel du gel 2 : `ORACLED` seul (159) | G1 et corr | tué |
| C02 | recopies jamais comparées hors gel (147) | G1 et corr | tué |
| C03 / C04 | `gel = true` / `gel = false` (137) | G1 et corr / J-ORACLE served | tués |
| C05 | G1 retiré de `PRE_GEL` (44) | G1 et corr | tué |
| C06 | `served_from` comparé par identité (147) | G1 et corr | tué |
| C07 / C08 / C09 | `static_only` / `exit` / rôle contrôlés au gel seulement (146, 146, 142) | G1 et corr | tués |
| C10 | Y07 réancré : `served_from` recopié non comparé (147) | J-ORACLE served | tué |
| C11 / C12 | sha256 / complétude contrôlés au gel seulement (139, 141) | G1 et corr | tués |
| C13 | le message hors gel redit « clean » (146) | G1 et corr | tué |

- **Presque-défaut attrapé dans le tour** : la première version du test neuf n'avait aucun cas de complétude hors gel ; C12, écrit avant le lancement, l'a montré ; le cas G1 sans `cv4` a été ajouté avant le lancement unique (origine proposée si le G7 l'enregistre : G1, rôle implémenteur ; rien d'échappé).

### Preuve F2P de clôture (`F:/Monark/scripts/red-proof.mjs`, outil du tronc, sha `6869fa3d…`, le même de `aa6bea4a` à `b970b79b`)
- `node F:/Monark/scripts/red-proof.mjs --base 3f502aa9 --gel F:/Monark-wt-m5 --repo F:/Monark-wt-m5 --out F:/tmp/methode/m5/corr2/f2p --draw 3 --seed 2026` (23:37:41-23:38:13Z, état final, ligne corr t2 comprise) : **exit 0, `ok: true`, 19 jugés, 19 F2P** (rouges à la base par `ERR_ASSERTION`, verts au gel), 0 inchangé, **3/3 tués** (`index.mjs:154 SDL`, `:51 CONST`, `:146 CONST`), fichier restauré (`b245e26a…` avant et après). Digest `83ff432c06cd752be9ff6251459a1033ff4e5843ffacf905c4055c3d4755d648` (`M-5.jsonl` à trois lignes compris, `docs/**/*.md` exclus) ; `RED-PROOF.json` `1c2db352…` ; `base.tap` `8d5b7722…` ; `gel.tap` `056dcb4a…`. Les 22 « Cannot find module » de `base.tap` sont la sortie d'erreur de la CLI absente, recopiée dans des messages d'assertion.
- `--draw 19` (`f2pall/`, 23:38:17-23:39:00Z) : **19/19 tués**, tous restaurés, `ok: true`, même digest ; `RED-PROOF.json` `22a362a1…`.

### Oracle (outil du tronc, rôle corr, `--key m5`)
`node F:/Monark/scripts/oracle/run.mjs --role corr --key m5 --tree F:/Monark-wt-m5 --base 3f502aa9`, sous `timeout 7200`, 23:24:33-23:36:37Z ; outils du tronc inchangés depuis `3f502aa9` (`git diff --stat 3f502aa9 HEAD` sur `scripts/oracle`, `scripts/mission`, `package.json`, `.github` : vide ; seul `scripts/red-proof.mjs` ajouté, fusion de M-4) ; le tronc est passé de `aa6bea4a` (23:13Z) à `b970b79b` (23:45Z) sans qu'aucun commit touche ces chemins ni `scripts/red-proof.mjs` (`git log aa6bea4a..HEAD` : vide) ; sha relus à 23:45Z : `run.mjs` `baad946c…`, `r25.mjs` `4d0544df…`, `red-proof.mjs` `6869fa3d…`, `lint.mjs` `02801ad5…` ; C-V-4 avant : 22 037 Mo libres, 34 `node.exe` (`Get-CimInstance Win32_OperatingSystem`, `Get-Process`) ; 8 portes statiques hors verrou ; verrou tenu par le cp-2 de `fa704aa1` (pid 10804), attente FIFO **271 s**, obtenu 23:30:26Z, pris et rendu par l'outil (aucun propriétaire non marqué) ; C-V-4 au verrou : 23 834 Mo, 6 `node.exe`.
- **Enregistrement** `F:/tmp/oracle-results/6d9e8616304c9a66998fc9986b9ed0dfc48a6694-1790b813ec6c96a5-corr-20260928T232433Z-108876.json`, sha256 **`f6bcbd39550cde673e06123b1d26047de91e8d6e26036436631d529790adc5b9`** : `role` corr, `label` m5, **`tree.head` `6d9e8616…`** (gel 2), **`tree.dirty` `1790b813ec6c96a5e8cdc5f5aa521eba159e76c41a49bd42a77696d783227c71`** (les corrections de ce tour, la ligne corr t1 régénérée, l'INDEX), `tree.object` `b436c276…`, **`static_only:false`**, **`served_from:null`** (rejoué : un arbre sale n'est jamais servi, `run.mjs` l.75), **`exit` 0**, 17/17 champs requis.
- Portes : 9, toutes à exit 0 (8 statiques, `test` sous verrou 370 s). **Tests 1 514 = 1 495 + 19** (pass 1 511, fail 0, skip 3 : les skips déclarés d'avant le lot, sentinel win32 ×2 et u4b). **Test 42 une fois** (`09-test.log` l.1836 ; l.1837 « test 42(f') » est un autre test) ; les 19 tests du lot une fois chacun, verts. `r25` STAT **537** ; `residues.tmp_entries` 379 (inchangé).
- **État testé, épinglé** (`F:/tmp/methode/m5/corr2/pre-oracle-sha256.txt`, lu dans le clone `r25clone-pre`, gel figé `ab4a0b8f` de 23:21:54Z ; le worktree n'a pas changé de 23:19Z à 23:37:18Z) : `index.mjs` `b245e26a…`, test `15196982…`, `M-5.jsonl` `a5ec5bcd…` (G1 et corr t1 régénérée), `INDEX.md` `599c539a…`, fixtures inchangées ; le sha256 de `git diff --binary --full-index 6d9e8616..ab4a0b8f` recalculé = **`tree.dirty` `1790b813…`** : l'oracle a testé cet état (aucun fichier non suivi). Script, test et fixtures y sont identiques à l'état final.
- Après l'oracle : la ligne corr t2, l'INDEX et ce journal seulement.

### Entrées du journal
- **corr t1 régénérée** : ci-dessus (C-G2-10), 23:16:04Z, `r25` 523/547.
- **corr t2 écrite par le correcteur** (Q-C5T1-5) : `add --repo F:/Monark-wt-m5 --lot M-5 --gate corr --tour 2 --from-recu F:/tmp/methode/mission-corr-m5-t2.recu.json --from-oracle <l'enregistrement ci-dessus> --model claude-opus-5-5 --tier claude-opus-5-5 --effort max --r25 538/547 --note "tour 2 court (C-G2-10..13) ; entree ecrite par le correcteur"`, à 23:37:18Z : exit 0 ; `mission` = {`mission-corr-m5-t2.md`, sha `7fc5fd5d…` = reçu, `recu_head` `6d9e8616`} ; `oracle` = {sha `f6bcbd39…`, rôle corr, tête `6d9e8616`, `start` 23:24:33Z, `served_from` nul, 1 514} ; `commit` nul (Q-M5-1).
- `docs/journal/M-5.jsonl` : 3 lignes, `07ccfba1…`. **`build --repo F:/Monark-wt-m5` vert** (0 hit, 1 lot, 3 entrées ; J-ORACLE lit les trois citations), deux fois ; `INDEX.md` 19 l., `eb0b3645…`, identique à l'octet sur les deux `build`.

### `error_origin` (vocabulaire fermé de D11 et sa ligne datée du 2026-09-28 21:0x UTC)
- Cités de rr1 § 13, sans réadjudication : C-G2-10 **ORCH** ; C-G2-11 **G1 + G2** (prémisse « propre » de la mission rr1 : ORCH) ; C-G2-12 **G1** ; C-G2-13 **G1**.
- Aucun défaut échappé de ce tour ; un presque-défaut attrapé dans le tour (le cas de complétude hors gel, ci-dessus : G1 si enregistré). L'ancre perdue de Y07 est l'effet voulu de la réécriture de la l.147, pas un défaut.

### Q-C5T2-n (fermées : une réponse par option)
- **Q-C5T2-1** (C-G2-11, portée) : une entrée G0, cp-1 ou fusion qui cite un enregistrement n'est jamais lue (en-tête l.25 ; `run.mjs` l.24 n'a pas ces rôles). (i) **garder** (livré) ; (ii) la lire comme G1 et corr : elle rougit toujours par le rôle (appel `e.oracle === null ? null : oracleWhy(e)`, 0 ligne nette) ; (iii) J-SCHEMA refuse un `oracle` non nul à ces gates (+1 l.) ?
- **Q-C5T2-2** (R-25 538, estimation 530-532) : (a) **accepter** (marge 9 au STOP 547 ; les trois entrées à venir, rr2, cp-2 et G7, mènent à 541) ; (b) fondre le test neuf dans le test « J-ORACLE: a record served… » (−3 l. : ni ligne blanche, ni déclaration, ni fermeture, un tueur interne de plus ; le nom de ce test doit alors nommer G1 et corr, et les harnais importés suivre ce nom) ; (c) tenir l'assertion de sept cas sur une ligne (−1 l.) ?
- **Q-C5T2-3** (Y07) : l'ancre de Y07 n'existe plus ; C10 porte la même mutation sur le texte neuf (tuée). **Accepter** C10 comme successeur de Y07, ou exiger un texte qui garde l'ancre (une comparaison `served_from` redondante, +0 l., rejetée ici parce qu'elle double la règle) ?
- **Q-C5T2-4** (message) : hors gel, le rouge `static_only`/`exit` dit « not a full, green run » (l'arbre sale y est admis ; C13 l'épingle). **Garder**, ou revenir au message unique « not a full, clean, green run » (0 l.) ?

## Corrections — tour 3, court (correcteur, 2026-09-29)
- **Correcteur** : modèle résolu `claude-opus-5-5` (identifiant exact donné par le harnais, R-1), palier `claude-opus-5-5`, effort max, instance fraîche (≠ worker G1 `claude-opus-5-5[1m]`, ≠ relecteurs G2, rr1 et rr2, ≠ correcteurs des tours 1 et 2). **Heures** (`date -u`) : début 00:37:37Z (sha de la mission recalculé) ; lecture des entrées 00:37-00:48Z, avis de l'advisor intégré (canal 1) avant tout code ; instantané d'avant-tour et script du gel 3 00:49:29Z ; code et test 00:50-00:52Z (tueurs renumérotés 00:51:33Z, contrôlés 00:51:59Z ; première exécution 00:52:13Z, 19/19) ; sonde réelle 00:53:08-00:53:21Z ; portes statiques 00:53:53-00:55:29Z ; mutants 00:58:09-01:01:50Z ; R-25 avant 01:02:05Z ; C-V-4 01:03:20Z, attente du commit 01:03:40-01:09:23Z ; oracle 01:09:37-01:17:11Z ; entrée corr t3 01:17:59Z ; `build` 01:17:59Z et 01:18:07Z ; R-25 après 01:18:15Z ; red-proof 01:18:23-01:19:58Z ; TAP final 01:20:42Z ; rédaction à partir de 01:21Z.
- **Mission** `F:/tmp/methode/mission-corr-m5-t3.md` : sha256 `bf3e3f14228dc8e3392c8c420af8d2f60eb52c05141c096bb72c972253cdc5b7` recalculé, égal au reçu `F:/tmp/methode/mission-corr-m5-t3.recu.json` (vert, 00:36:29Z, head `caed685a`, base `3f502aa9`, 8 codes à 0).
- **Cadre** : worktree modifié en place (gel 4 `caed685a`), aucun git écrivant (ni le worktree ni `F:/Monark`), git de lecture sous `GIT_OPTIONAL_LOCKS=0` ; clones `--no-local` sous `F:/tmp/methode/m5/corr3/` seulement (`probe`, `lint`, `mutants/clone`, `r25clone-pre`, `r25clone-post` ; ceux de l'oracle et de red-proof retirés par ces outils) ; TEMP `F:/tmp/methode/m5/corr3/tmp` ; jonctions du clone `lint` par `mk-nm.ps1` (220 entrées, 10 `@monark`, 0 échec), retirées par `rm-nm.ps1` (« removed » ; `F:/Monark/node_modules` : 220 entrées cachées comprises, 10 `@monark`, intact) ; aucun réseau ; rien sur C: ; aucune course ciblée ni harnais pendant la suite sous verrou (01:09:37-01:17:11Z : lectures seulement ; le worktree est resté égal à l'instantané d'avant-oracle jusqu'à 01:17:59Z). Résidus TEMP : `node-compile-cache` (node) et `monark-journal-15JmXc` (00:59:28Z, pendant le harnais : le mutant Y11 tue le processus du test avant son crochet `after`, résidu attendu).
- **R-25** (`r25()` du tronc, clone à commit de gel, `3f502aa9...HEAD`, pathspec `ci.yml:82`, `r25-replay.mjs`) : **539** (gel 4) → **541** après C-G2-14, C-G2-15 et C-G2-17, avant la ligne corr t3 (`r25-pre.out`, égal au champ `r25` de l'enregistrement d'oracle) → **542** après la ligne corr t3 (`r25-post.out`, égal au `r25` de l'entrée) ; 0 suppression ; CONTENT_STAT 0. Par fichier : script 229, test 250, doré 38, fixtures 20, `docs/journal/M-5.jsonl` 5. Budget du tour : code +1, test +1, la ligne +1 ; STOP 547, marge 5 ; les entrées rr3 et cp-2 à venir mènent à 544.

### C-G2-14 (iii) — J-SCHEMA refuse une citation d'oracle à G0, cp-1, fusion
- **Fait** : `problems()` l.95, `if (["G0", "cp-1", "fusion"].includes(e.gate) && (e.oracle ?? null) !== null) p.push("oracle cited at a gate that never runs one");`. La même fonction sert `add` (refus avant toute écriture, l.118-119 : exit 2, rien d'écrit) et `build` (hit J-SCHEMA ; une ligne rouge à J-SCHEMA n'est lue par aucun autre contrôle, et un rouge n'écrit jamais l'INDEX : une citation jamais lue n'y est plus affichée). En-tête réécrite sur place : l.20 (J-SCHEMA : « an oracle at G0, cp-1 or fusion ») et l.25 (J-ORACLE : « G0, cp-1, fusion: refused by J-SCHEMA ») ; « never skipped » (l.18) vaut désormais pour toute citation (rr2 § 3).
- **Preuve (test)** : test J-SCHEMA. Les lignes G0, cp-1 et fusion des fixtures (M-X l.1, 2, 8), forgées pour citer l'enregistrement de la ligne G2 (l.4), deviennent les lignes 11-13 du journal testé ⇒ trois hits « oracle cited at a gate that never runs one » ; `add --gate G0 --from-oracle test/fixtures/journal/oracle-G2.json` ⇒ exit 2, `M-Z.jsonl` absent, stderr « J-SCHEMA: oracle cited at a gate that never runs one ». Tueur interne test l.144 (`index.mjs:95 SDL`). Mes mutants D01-D09 (l.95) sont tués chacun par un seul `ERR_ASSERTION` : garde retirée (D01) ; **(ii) à la place de (iii)** (D02 : garde retirée + l'édition de A11 importée ; `add` exit 0 et hits J-ORACLE « role G2 != gate G0 » au lieu de J-SCHEMA) ; fusion, G0 ou cp-1 retirés de la liste (D03-D05) ; garde au seul `build` (D06, tué par le contrôle `add`) ou au seul `add` (D07, tué par le contrôle `build`) ; garde étendue à G1 et corr (D08) ; test de nullité inversé (D09).
- **Preuve (réel)** (`probe-c14.mjs`, clone `probe`) : sous le code du tour, les quatre entrées réelles : `build --only M-5` vert ; `add` G0, cp-1 et fusion citant l'enregistrement réel corr t2 (`f6bcbd39…`) : exit 2 ×3, journal intact ; une ligne forgée par gate (enregistrement absent, sha nul, `tests_total` 9999 : la forme P12c/P13/P14 de rr2) : rouge J-SCHEMA M-5:5 ×3. Sous le script du gel 4 (`b245e26a…`, copié à côté) : exit 0 ×3 (ligne écrite, puis restaurée) et vert ×3, le trou mesuré par rr2.
- **A11** (importé de rr2 : l'appel lit aussi G0, cp-1 et fusion, sémantique (ii)) : survit, fichier entier vert (19 tests). **Équivalent sous (iii)** : une entrée qui atteint `check()` a passé J-SCHEMA ; à G0, cp-1 ou fusion son `oracle` est donc nul, et l'appel ne lit rien sous les deux textes ; à G1 et corr, `!ORACLED.includes(e.gate)` et `PRE_GEL.includes(e.gate)` coïncident. Le mutant qui porte (ii) dans ce code est D02 : tué (Q-C5T3-1).
- **Taille** : code +1 (l.95) ; en-tête 0 nette (l.20, l.25 réécrites) ; test +1 (le tueur interne l.144 ; l'appel `add` fondu dans la déclaration l.141, les lignes forgées dans la liste l.143, les contrôles dans l'assertion l.145).

### C-G2-15 — recopies épinglées à toute gate
- **Fait** : la ligne vérifiée par rr2 (`mine/verify-proposal.out` `55c0cd54…`) est fondue dans l'assertion l.210-211 du test « J-ORACLE at G1 and corr » : quatre cas de plus (rôle recopié `G1` sur une corr, tête recopiée C1 sur une corr, `start` recopié faux sur un G1, `served_from` recopié autre sur une corr servie) ⇒ « a field copied into the entry != the record » ×4.
- **Preuve** : A04, A05 et A06 (test « pre »), A07 et A08 (reciblés de « oracle », où ils survivent par construction, vers « pre », le test contre lequel rr2 les a vérifiés) tués chacun par un seul `ERR_ASSERTION` ; 19/19 verts (Q-C5T3-2).
- **Taille** : 0 nette (deux lignes réécrites).

### C-G2-17 — convention r25 et registre
- **Fait** : l.13 réécrite sur place, texte de la mission : « --r25 of an entry: the R-25 of the gel the entry records (insertions + deletions of the lot diff at that gel, the entry line included). » Aucune entrée réécrite.
- **Lignes datées** (2026-09-29, corr t3 ; le § tour 2 n'est pas réécrit, pour garder les numéros de ligne que rr2 cite) :
  - § tour 2, l.302 (« Les 22 « Cannot find module » de `base.tap` ») : lire **20**. Recompté ici sur le `base.tap` du correcteur du tour 2 (`8d5b7722…`) : 20 lignes, 20 occurrences, comme rr2 sur le sien (`eb1cd8e2…`). Au tour 3, le `base.tap` en porte 28 : l'entrée du test « G1 et corr » passe de 14 à 22, les quatre cas de C-G2-15 imprimant chacun deux fois leur valeur réelle dans l'échec d'assertion (code d'entrée `ERR_ASSERTION` ; `cfm-per-test.out`).
  - § tour 2, l.262 (« `oracleWhy` (l.136-151) ») : lire **l.136-149** au gel 3 (l.137-150 au tour 3, la garde l.95 ayant décalé le code d'une ligne).
- **Taille** : 0 nette (l.13) ; journal hors R-25.

### Tueurs
- La garde l.95 décale d'une ligne tout le code situé dessous : 21 `// killer:` passent de `index.mjs:n` à `n + 1` (n ≥ 95, `renumber-killers.mjs`) ; trois restent (l.49, 51, 89) ; le tueur neuf (test l.144, `index.mjs:95 SDL`) porte le numéro neuf. Les 25 lignes sont lues par `parseKiller` du tronc et jugées par son `killerProblem` (texte extrait de `red-proof.mjs`, sha `6869fa3d…` vérifié avant évaluation ; `killers.mjs`) : **0 problème ; 19 tueurs de tête, 6 internes**.

### Portes statiques (clone `lint`, 00:53:53-00:55:29Z)
- `gate:vocab`, `typecheck`, `lint`, `lint:ratchet` (69/69), `lang:gate` et `lint-model-pinning` : exit 0. `export:check` : **exit 134** au premier passage (« Committing semi space failed », tas de 6 Mo). Mesure de l'hôte à 00:54:50Z : 19 797 Mo de mémoire physique libre, mais **452 Mo de commit disponible** (limite 73 675 Mo : RAM et fichier d'échange fixe de 8 Go sur C:), charge portée par des processus étrangers au lot (les plus gros : `llama-server` 13,4 Go et deux `python` de 6,9 et 4,6 Go de mémoire privée). Relancé une fois à 00:55:27Z : exit 0. Défaut de l'hôte, pas du code (Q-C5T3-5).
- État final (ce journal, l'INDEX et `M-5.jsonl` à cinq lignes compris, copiés dans le clone `lint`) : `gate:vocab`, `lang:gate`, `export:check` et `lint-model-pinning` rejoués, exit 0, à 01:24:08-01:24:11Z (`lint-*3.out`), puis avec cette ligne (`lint-*4.out` et `lint-*5.out`). L'oracle a testé `index.mjs` et le test ; les ajouts de docs d'après l'oracle sont passés par ces portes de texte.

### Mutants (un clone, un lancement : `F:/tmp/methode/m5/corr3/mutants/`, 00:58:09-01:01:50Z)
100 mutants : les 80 du tour 2 (57 du tour 1, 10 de rr1, C01-C13) et A01-A11 de rr2, **importés** de leurs harnais (texte de leurs constantes extrait puis évalué, jamais retapé ; sha256 vérifiés : `6d0f40ff…`, `c96be130…`, `7563a5b5…`, `73fd65b4…`). Leurs lignes sont reportées en deux temps par les hunks de `git diff --no-index -U0` : script du gel 2 (`4eb51fd9…`) → script du gel 3 (`b245e26a…`) → script du tour ; C01-C13 et A01-A11 depuis le gel 3 seulement (liste « old->new » dans `RESULTS.txt`). S'y ajoutent D01-D09 sur la l.95. Ligne de base : les 19 tests ciblés verts avant tout mutant ; ancres et noms vérifiés à sec (`check-anchors.out`). **96 tués, chacun par un seul `ERR_ASSERTION` (`assert-fail`).** `RESULTS.txt` `ea3e4c21…`, `harness.mjs` `81cb3052…` ; `index.mjs` restauré après chacun (`49f31737…`).
- **Y07** : ancre perdue, comme au tour 2 et à rr2 (C10, son successeur, tué).
- **Y11** : non conclu, comme avant (niveau fichier, `other-fail`, exit 1, signal `-`).
- **R1** : survit à son test ciblé, fichier entier rouge (test « G1 et corr »), comme au tour 2 et à rr2.
- **A11** : survit, fichier entier vert : équivalent sous (iii) (C-G2-14 ci-dessus) ; D02 tué.
- **A04-A08** : tués (C-G2-15 ; A07 et A08 reciblés vers « pre »).
- Par origine : t1 55 tués, 1 non conclu, 1 ancre perdue ; rr1 9 tués, 1 survivant (R1) ; t2 13/13 ; rr2 10 tués, 1 survivant (A11) ; t3 9/9.

### Preuve F2P de clôture (`F:/Monark/scripts/red-proof.mjs`, outil du tronc, sha `6869fa3d…`)
- `node F:/Monark/scripts/red-proof.mjs --base 3f502aa9 --gel F:/Monark-wt-m5 --repo F:/Monark-wt-m5 --out F:/tmp/methode/m5/corr3/f2p --draw 3 --seed 2026` (01:18:23-01:19:01Z, état final, ligne corr t3 comprise) : **exit 0, `ok: true`, 19 jugés, 19 F2P** (base `assert-fail` ×19, gel `pass` ×19), 0 inchangé, `killerProblem` nul ×19, **3/3 tués** (`index.mjs:155 SDL`, `:51 CONST`, `:147 CONST` : les trois tests tirés au tour 2, renumérotés), fichier restauré (`49f31737…` avant et après). Digest **`de93646006508d58185fcc8d23f4c3bd400bd2f9312250577249c26c8cc1d0e1`** (`M-5.jsonl` à cinq lignes compris, `docs/**/*.md` exclus) ; `RED-PROOF.json` `04ed28a4…` ; `base.tap` `db109ab3…` ; `gel.tap` `2ae97863…`.
- `--draw 19` (`f2pall/`, 01:19:07-01:19:58Z) : **19/19 tués**, tous `assert-fail`, tous restaurés, `ok: true`, même digest ; `RED-PROOF.json` `d3d5c586…`.

### Oracle (outil du tronc, rôle corr, `--key m5`)
`node F:/Monark/scripts/oracle/run.mjs --role corr --key m5 --tree F:/Monark-wt-m5 --base 3f502aa9`, sous `timeout 7200`, 01:09:37-01:17:11Z ; outils du tronc : `run.mjs` `baad946c…`, `r25.mjs` `4d0544df…`, `red-proof.mjs` `6869fa3d…`, `lint.mjs` `02801ad5…`, `lock.mjs` `781744f9…` (les sha relus par rr2). C-V-4 avant (01:03:20Z) : 20 669 Mo libres, 13 `node.exe`. Précaution déclarée après l'abandon d'`export:check` : lancement différé jusqu'à ce que le commit disponible atteigne lui aussi 4 096 Mo (7 332 Mo à 01:09:23Z ; 67 mesures dans `cv4-wait.txt`). 8 portes statiques hors verrou ; verrou libre, **attente 0 s**, pris et rendu par l'outil ; C-V-4 au verrou : 20 741 Mo, 12 `node.exe`.
- **Enregistrement** `F:/tmp/oracle-results/caed685a4d951d77d2a74258f3f47635f57685bf-fe9124067172256f-corr-20260929T010937Z-103840.json`, sha256 **`f75fe72da4c182ac210e70f4157a8cadccb2f78282e08c5812b5b7038a01dafe`** : `role` corr, `label` m5, **`tree.head` `caed685a…`** (gel 4), **`tree.dirty` `fe9124067172256fe3516f4aa07e1c929ddb23f0c66a6b639c3a6b0f122eaad9`**, `tree.object` `859fc5a9…`, **`static_only:false`**, **`served_from:null`** (rejoué : un arbre sale n'est jamais servi), **`exit` 0**, 17/17 champs requis.
- Portes : 9, toutes à exit 0 (8 statiques, `test` sous verrou 380 s). **Tests 1 514 = 1 495 + 19** (pass 1 511, fail 0, skip 3 : les skips déclarés d'avant le lot, sentinel win32 ×2 et u4b). **Test 42 une fois** (`09-test.log` l.1836 ; l.1837 « test 42(f') » est un autre test) ; les 19 tests du lot une fois chacun, verts (`oracle-log-check.out`). `r25` STAT **541** ; `residues.tmp_entries` 379.
- **État testé, épinglé** : `tree.dirty` calculé avant le lancement par le calcul de `run.mjs` (`dirty-expected.out` : diff d'`index.mjs` `49f31737…` et du test `c7c4da64…`, aucun fichier non suivi) = `fe912406…` = l'enregistrement ; `pre-oracle-sha256.txt` : tous les autres fichiers du lot égaux au gel 4. Après l'oracle : la ligne corr t3, l'INDEX et ce journal seulement.

### Entrée du journal
- **corr t3 écrite par le correcteur** : `add --repo F:/Monark-wt-m5 --lot M-5 --gate corr --tour 3 --from-recu F:/tmp/methode/mission-corr-m5-t3.recu.json --from-oracle <l'enregistrement ci-dessus> --model claude-opus-5-5 --tier claude-opus-5-5 --effort max --r25 542/547 --note "tour 3 court (C-G2-14, C-G2-15, C-G2-17) ; entree ecrite par le correcteur"`, à 01:17:59Z : exit 0 ; `mission` = {`mission-corr-m5-t3.md`, sha `bf3e3f14…` = reçu, `recu_head` `caed685a`} ; `oracle` = {sha `f75fe72d…`, rôle corr, tête `caed685a`, `start` 01:09:37Z, `served_from` nul, 1 514} ; `commit` nul (Q-M5-1).
- `docs/journal/M-5.jsonl` : 5 lignes, `e1afc46e…`. **`build --repo F:/Monark-wt-m5` vert** (0 hit, 1 lot, 5 entrées ; J-ORACLE lit les cinq citations), deux fois ; `INDEX.md` 21 l., `87a809eb…`, identique à l'octet.
- R-25 déclaré = mesuré après la ligne : **542** (avant la ligne : 541).

### `error_origin` (vocabulaire fermé de D11 et sa ligne datée du 2026-09-28 21:0x UTC)
- Proposés par rr2 § 12, cités sans réadjudication : C-G2-14 **G1 + G2** ; C-G2-15 **G1 + G2** ; C-G2-17 **G1**.
- Aucun défaut échappé de ce tour. Deux écarts de taille attrapés avant toute exécution : l'en-tête l.20 écrite d'abord sur deux lignes, l'assertion J-SCHEMA d'abord sur deux lignes ; chacune ramenée à une ligne (sans cela : 543 avant la ligne, 544 après). Origine si le G7 les enregistre : G1 (rôle implémenteur) ; rien d'échappé.

### Q-C5T3-n (fermées : une réponse par option)
- **Q-C5T3-1** (A11) : A11 est équivalent sous (iii) (branche inatteignable) ; D02 (garde retirée + A11) porte la sémantique (ii) et est tué. **Accepter** D02 comme successeur de A11, ou exiger un test qui tue A11 seul (impossible tant que la garde tient : il y faudrait une entrée G0, cp-1 ou fusion citante qui passe J-SCHEMA) ?
- **Q-C5T3-2** (A07, A08) : reciblés de « oracle » vers « pre » dans le harnais (colonne « retargeted »), où C-G2-15 les tue et où rr2 les a vérifiés. **Accepter**, ou garder « oracle » comme test ciblé (issue « survit, fichier entier rouge ») ?
- **Q-C5T3-3** (en-tête) : l.20 et l.25 réécrites sur place (0 ligne) pour que l'en-tête dise ce que fait le code ; la mission ne nommait que l.13. **Garder**, ou revenir à la lettre (l.25 redirait « never read », l.20 tairait la règle neuve) ?
- **Q-C5T3-4** (fusion) : l'appel `add` est fondu dans la déclaration l.141 et ses contrôles dans l'assertion l.145 (505 caractères) pour tenir 542. **Garder**, ou une ligne de plus pour la lisibilité (543 ; 545 avec rr3 et cp-2) ?
- **Q-C5T3-5** (hôte, hors lot) : C-V-4 lit la mémoire physique libre (`os.freemem()`, `run.mjs` l.156), pas le commit disponible ; `export:check` a avorté (134) avec 452 Mo de commit disponible et 19,8 Go de mémoire physique libre. Former l'item **ORACLE-CV4-COMMIT-1** (C-V-4 lit aussi le commit disponible, `FreeVirtualMemory`, contre une borne ; propriétaire : orchestrateur ; déclencheur : le prochain lot qui touche `scripts/oracle/`, ou M-9 avec ORACLE-CLONE-REFS-1), ou ligne datée qui l'écarte ?
