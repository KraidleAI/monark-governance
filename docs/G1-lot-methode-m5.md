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
Méthode A, pathspec `ci.yml:82`, par la fonction `r25()` du tronc (`F:/Monark/scripts/oracle/r25.mjs` n'a pas de CLI : Q-M5-8) sur un clone `--no-local` à commit de gel (fichiers non suivis inclus) : **476** avant l'entrée du journal, **477** avec `docs/journal/M-5.jsonl` (1 l.) ; 0 suppression ; CONTENT_STAT 0. Répartition : script 220, test 200 (dont 16 lignes `// killer:`), fixtures 20, index doré 37 ; `docs/**/*.md` exclus (ce journal, `INDEX.md`). **Au-dessus de la tolérance 294 (×2,1 de 140), sous le STOP 547.** Cause nommée : 275-e a fixé après C dix contrôles, un schéma fermé de 19 champs, deux sous-commandes, `--from-recu` et `--from-oracle`, un test par contrôle ; C chiffrait « `index.mjs` ≈ 80 + test doré ≈ 60 » pour un index sans contrôles ; et `test/fixtures/` n'est pas une racine de série exclue (seul `docs/**/*.md` l'est), d'où 57 l. de fixtures comptées. Scission pré-déclarée **non faite** (déclencheur : au-delà de 547) ; elle n'amènerait pas le lot sous 294 (J-ORACLE, J-RECU, J-LINT et leurs tests ≈ 70 l.). Décision : Q-M5-7.

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
