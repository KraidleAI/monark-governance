# G0 du lot H d'E-2a : l'écrivain de l'historique servi `kata-served-history-v1`, une ligne par (déploiement, classe)

RECHERCHES, 2026-10-07. Base : tronc `595d2e4b` (lot/etude-suite), **fusionné** dans la branche à chaque reprise (`git merge -m "Merge
the trunk"`) : `e961f615` (tronc `591b3a30`), `18a71aa5` (`8411a2d4`, qui porte #225 et ses 18 contrôles, et #221), `fc60c7a0`
(`6a1b1d43`, #229) et `3490ad7d` (`595d2e4b`, #222). La branche était déjà poussée et en revue : des fusions et non un rebase, aucune
poussée forcée. Plan : G0 court d'E-2a v6.1 (§3.6 ligne « historique servi », §3.7, §5 ligne H, §6 T-15), accepté par MONARK (`51fe3ee`
de recherches) ; CM-5 v4 §4.1, Q-CM5-8, Q-CM5-19 ; décisions de MONARK `bb993d5` (voie (b), une classe et sa table par ligne) et
`ac1cb86` (toute classe kata servie après le déploiement). **Pli de la G2 de MONARK** : `1aebcdb` de recherches, message
`2026-10-07-MONARK-vers-RECHERCHES-g2-232-235.md`, section #235 (cinq M, m 6 à 10), pièce `pieces/2026-10-07-g2-232-235/g2-235.json`.
**Pli de la G2 ciblée de MONARK** : `e6d5517` de recherches, message `2026-10-07-MONARK-vers-RECHERCHES-g2-234-235-222.md`, section
« #235 (H) » (deux questions tranchées, cinq m), pièce `pieces/2026-10-07-g2-234-235/g2f-235.json` ; avec l'essai de CA à 18 contrôles
de MONARK, `fd08dc5` de recherches, pièce `pieces/2026-10-07-ca-essai-18/ca-trial-18.json`.

- **Provenance** : worker `claude-opus-5-5`, effort max ; horloge lue (`date -u`) à 09:41 UTC (premier G0), 10:00 (pli d'`ac1cb86`),
  11:18 (début du pli de la G2), 11:40 (texte de ce pli). Worktree du scratchpad, branche `recherches/e2a-h-served-history` ; fetch par
  refspecs explicites ; `node_modules` lié en dur depuis un autre worktree du scratchpad, retiré à la fin ; `git add` par chemins
  explicites ; poussé sans force.
- **Ligne datée (RECHERCHES, 2026-10-07, 13:22 à 13:54 UTC, `date -u`) : pli de `e6d5517` (section #235) et de `fd08dc5`.** Worker
  `claude-opus-5-5`, **effort max**, Node v24.21.0, Linux. Un premier agent de ce pli a été arrêté par un redémarrage du conteneur avant
  toute poussée ; son worktree gardait cinq commits locaux et une retouche non commitée de ce G0. Les cinq commits sont **vérifiés et
  gardés** : `e73b21fa` (les tests bâtissent leur CA depuis `CHECK_NAMES`), `18a71aa5` et `fc60c7a0` (fusions du tronc : chaque arbre
  égale la fusion recalculée par `git merge-tree --write-tree`), `605a0bce` (un commentaire) et `e12d28f0` (le pli, relu ligne à ligne,
  ses cas rejoués). La retouche du G0, écrite avant `e6d5517` (elle donnait au test 1 une CA de synthèse), est **écartée** : ce texte la
  remplace. Repris dans un worktree **détaché** neuf du scratchpad (sur le clone, seuls un fetch par refspecs explicites et un
  `worktree add`) ; ajouts `7f1686dd` (lecture stricte de `received_at_ms` et de l'`url` de la CA, cas forgé du contrôle de classe servie)
  et `3490ad7d` (fusion de `595d2e4b`, arbre vérifié de même), poussés par avance rapide de `8618efa7` à 13:50:54Z ; puis ce texte.
- **Ordre** : §5 ligne H, « a1, L-T15 ; avant le go de c ». H ne touche aucun fichier de L-T15 (PR #232). **H dépend d'a1** (m 8) : il lit
  `COMMITTED_TABLES` du module servi `apps/harness/src/policy-committed-pins.ts`, qu'ajoute a1-i (PR #233) ; brouillon jusqu'à la fusion
  d'a1 et d'a2 (décision de MONARK), puis une nouvelle fusion du tronc.

## Définitions reprises (citées)

- E-2a v6.1 §3.6 : « une ligne JSON canonique par couple (déploiement, classe kata servie), qui porte une classe et sa table » ; champs
  fermés `format`, `release_dir`, `task_class`, `policy_table_sha256`, `probe_record_sha256`, `merge_commit`, `t_e`, `t_f`,
  `ca_record_sha256` ; « lignes triées par (`t_e`, `task_class`) » ; « L n'écrit aucune ligne (voie (b)) » ; chemin
  `apps/harness/data/kata/served/served-history.json`, versé avec la fusion des actes.
- E-2a v6.1 §6 T-15 : « chaque `policy_table_sha256` est lu sur l'enregistrement `retire-probe-v1` de sa classe, lié par
  `probe_record_sha256` ; un enregistrement d'une autre classe, ou une liste de classes dans une ligne, est refusé ; une table
  marginale n'a pas de ligne (voie (b)) ».
- `ac1cb86` : « chaque déploiement écrit une ligne pour **toute** classe kata servie après lui (24 lignes pour c, 28 pour c′) ».
- Tronc `595d2e4b` (relu à cette tête) : `docs/RUNBOOK-harness.md` l.375-376, « **T_e** = the committer date of the merge commit (`git
  log -1 --format=%cI`), in UTC » ; l.377, « Deploy only a merged commit whose CI is green and on which `node
  scripts/spec-policy-tables.mjs --check` exits 0 » ; l.386, « Ship the merged commit of step 5 » ; l.388-389, « **T_f** = the
  `checked_at` of that green record […], cut to the second » ; `scripts/retire-latency.mjs` l.20-22 et l.50, T_e ≤ T_f ≤ T_g
  (`order_not_monotone`), l.46-47 la seconde UTC réelle. Le §6 du RUNBOOK n'écrit **aucune** fenêtre de T_f après T_e : H n'invente pas
  de borne de temps (m 6).
- Q-CM5-19 : le rôle `served-history` est celui de l'outil figé qui **lit** ce fichier (CM5-c2), hors de ce lot.

## Construction

`scripts/served-history.mjs` (141 lignes, + `.d.mts`), `node scripts/served-history.mjs --release-dir <contract-1.1.0-tables-AAAA-MM-JJ>
--merge-commit <sha> --ca <enregistrement de CA> --probe <retire-probe-v1> [--probe …] [--root <dir>]`, lancé par MONARK à T_f (c-ii,
c′-ii). Les règles sont **importées du tronc**, jamais réécrites. Lignes à la tête `3490ad7d` :

- **Ensemble servi** (l.68-73) : `versionDirs` (exporté de `scripts/spec-policy-tables.mjs` l.134, le seul changement de ce fichier) donne
  les dossiers de version, un dossier daté ne nommant qu'un jour réel (`validDate`) ; `release_dir` doit être **le dernier** dossier
  daté de l'arbre, et un dossier (l.69) ; chaque table kata (`cell_key_rule` `kata-bucket`) d'un dossier daté est servie depuis le
  dossier que `servedTableDirs` donne à sa classe (le dernier qui la tient ; deux dossiers aux octets identiques : refus,
  `input_invalid`). Cet ensemble doit être **les classes épinglées de `COMMITTED_TABLES`** (l.90, `served_not_pinned`).
- **Sonde** (l.74-84) : chaque classe servie a **exactement un** enregistrement `retire-probe-v1` (`class_not_once`), pris par la règle de
  cycle réel de `retire-instants` : `instant("T_g", …, "real")` (l.76 ; format, `ok`, `problem` nul, statut 200, `equal`, `api` en https
  hors loopback par adresse, `tls_authorized`, `api_host`). Puis, **avant toute comparaison**, `received_at` doit être une seconde UTC
  réelle (`real()`, l.51, comme `retire-latency` l.46-47) et `received_at_ms` un instant de cette seconde, à l'écriture de `judge()`
  (`toISOString`, `retire-probe.mjs` l.82 ; `iso()`, l.53), sinon `probe_not_accepted` (l.77-78). L'`api` a l'origine de l'`url` de la
  CA, et `api_host` son hôte, sinon `probe_other_host` (l.79). `table` est une chaîne et le fichier servi de sa classe (chemins `\` et
  `./` admis, l.80), d'une table de cette classe (l.82), dont le sha256 est son `policy_table_sha256` (l.83). `received_at_ms` est **au
  plus tôt le `checked_at` de la CA, à la milliseconde** (l.84, `probe_before_ca`). `probe_record_sha256` = sha256 des octets de
  l'enregistrement.
- **CA** (l.70-71) : `instant("T_f", …, "real")` : notée verte par `recordKind(failedOf(…))` avec ses `CHECK_NAMES` ; `t_f` = son
  `checked_at` coupé à la seconde ; son `url`, **une chaîne** que `URL.canParse` lit, donne l'api des sondes ; `ca_record_sha256` =
  sha256 de ses octets.
- **`mergeInstant`** (l.106-117) : `instant("T_e", …)` du tronc (40 hex contrôlés avant git, exactement deux parents, date du committer
  à la seconde), lu par un git sans variable `GIT_*` héritée, `--end-of-options`, `%H` égal à l'id donné (un tag annoté est refusé) ;
  la fusion est **sur l'historique de premier parent de HEAD** (`git rev-list --first-parent HEAD` de `--root`, l.114,
  `merge_not_on_trunk`) ; `spec/<release_dir>` présent dans la fusion et absent de son premier parent (`git cat-file -e`, l.115-116,
  `merge_not_release`).
- **`checkLine`** (l.57-64) : champs fermés ; chaque champ une **chaîne** de son motif (`typeof` avant le motif) ; `release_dir` d'un
  jour réel ; `t_e` et `t_f` des secondes UTC réelles (aller-retour de `retire-latency` l.46-47, sans millisecondes) ; `t_e ≤ t_f`.
- **`render`** (l.95-102) : tableau JSON, un élément canonique par ligne, trié par (`t_e`, `task_class`) ; les lignes déjà là doivent être
  son écriture canonique, et les lignes d'un même `release_dir` partager `merge_commit`, `t_e`, `t_f`, `ca_record_sha256`
  (`history_invalid`) ; un couple (`release_dir`, `task_class`) écrit deux fois, déjà là ou deux fois dans le lot, est refusé
  (`pair_written`).
- **`main`** (l.119-139) : options fermées, chacune avec sa valeur (sinon sortie 2, l.123) ; les épingles sont lues dans `PINS` (le module
  servi ; un test passe un autre module par `io.pins`) par un import **enveloppé dans `via("pins_unreadable", …)`**, que `via` attend
  quand la fonction rend une promesse (l.46, l.128) ; écriture par `writeAtomic` de `scripts/verify-harness.mjs` (l.132).
- **Forme du fichier** : le tableau JSON à un élément par ligne est **accepté par MONARK** (m 7) ; la lecture est celle du fichier
  entier (`json.load`). Le pli dans E-2a §3.6 et CM-5 §4.1 est fait ailleurs ; la fixture de L-T13 est dans CM5-c2, pas dans ce lot.

## Pli de la G2 de MONARK (constat → changement → fichier:ligne, à la tête de ce pli, `8618efa7`)

| Point | Changement | Où |
|---|---|---|
| M 1, sonde | règle de cycle réel de `retire-instants` importée (`instant("T_g", …, "real")`) ; cas : sonde locale (http 127.0.0.1, TLS nul), TLS false, `localhost`, statut 500, `api_host` vide, autre format | `served-history.mjs:70` ; test 3 |
| M 1, CA | `instant("T_f", …, "real")` ; cas : CA à un seul contrôle, `checks` vide, un contrôle rouge, TLS false sur chaque hôte, CA locale | `:65` ; test 3 |
| M 1, ensemble servi | `versionDirs` exporté et `servedTableDirs` ; cas : dossier `2026-02-30` (`release_dir` refusé, sa table non servie), octets identiques, dossier postérieur | `:63-64`, `:66-67`, `spec-policy-tables.mjs:134` ; test 2 |
| M 2, types | `typeof === "string"` avant chaque motif ; un cas `[valeur]` par champ (boucle sur `FIELDS`), et `table` de la sonde | `:46`, `:55-57`, `:71` ; tests 3, 4 |
| M 3, `GIT_*` | filtrées dans `mergeInstant` et dans le test ; cas : un `GIT_DIR` hérité ne change rien | `:97` ; test 5 |
| M 4, gardes | dates d'auteur et de committer distinctes, assertion sur le committer ; octets réels (sonde par `judge()` plus « \n », CA `docs/deploy-CA-harness.json`) ; un cas par garde | tests 1 à 5 |
| M 5, `merge_commit` | 40 hex avant git, `--end-of-options`, `%H` = id, deux parents, `spec/<release_dir>` dans la fusion et pas dans son premier parent ; cas : tag annoté, fusion à trois parents, `--no-such-option`, fusion antérieure, fusion suivante | `:96-106` ; test 5 |
| m 6 | `t_e ≤ t_f ≤ received_at` ; une sonde reçue avant la CA est refusée ; aucune borne de temps (le RUNBOOK n'en écrit pas) | `:57`, `:75` ; test 3 |
| m 7 | quatre champs communs contrôlés par `release_dir` ; `t_e` à la seconde ; `t_f` coupé à la seconde ; jours réels ; lot dédoublonné | `:48`, `:89-91` ; tests 1, 4 |
| m 8 | sondes données sans table kata servie : `probe_other_table` qui les nomme ; le cas `probe(LIQ)` remplacé par le vrai cas de L ; recoupement avec `COMMITTED_TABLES` | `:71`, `:81-82`, `:117` ; tests 3, 5 |
| m 9 | `writeAtomic` importé ; `release_dir` doit être un dossier ; le test 5 écrit un second déploiement sur le fichier | `:64`, `:121` ; tests 2, 5 |
| m 10 | test de composition (test 1, et le test 5 par la CLI) ; CI relancée sur la nouvelle tête ; `killer-lines` retiré des voisins | tests 1, 5 ; Preuves |

## Pli de la G2 ciblée de MONARK (`e6d5517`, section #235, et `fd08dc5`) : décision ou constat → changement → fichier:ligne à `3490ad7d`

| Point | Changement | Où |
|---|---|---|
| Q 1, fusion hors tronc | la fusion doit être dans `git rev-list --first-parent HEAD`, sinon `merge_not_on_trunk` ; cas : une **fusion de test hors branche** (mêmes parents et même arbre que la vraie fusion, sur aucune branche), et une fusion qui n'atteint le tronc que par un second parent | `served-history.mjs:114` ; test 5, l.172-179 et l.189 |
| Q 2, même hôte | l'`api` de chaque sonde a l'origine de `ca.url`, et `api_host` son hôte, sinon `probe_other_host` ; un cas dans chaque sens : sonde d'une autre `api`, d'un autre `api_host` ; CA d'un autre hôte, et CA dont l'`url` n'est pas une chaîne | `:71`, `:79` ; test 3, l.106-107 |
| m, `received_at` | une seconde UTC réelle (`real()`) avant toute comparaison, et `received_at_ms` un instant de cette seconde à l'écriture de `judge()`, sinon `probe_not_accepted` ; l'ordre se lit **en millisecondes**, `received_at_ms` contre `checked_at` ; cas : `received_at` illisible (X6), à décalage `+00:00` (X6), sans Z, d'une autre seconde avant et après ; `received_at_ms` illisible ou à décalage ; une sonde reçue 200 ms avant `checked_at` | `:51`, `:53`, `:77-78`, `:84` ; test 3, l.101-105 et l.118 |
| m, E3 | **non équivalent** : un cas de trois lignes, la table d'une classe non servie forgée au chemin `spec/undefined/…` et au chemin de la clé héritée `constructor` (`spec/function Object() { [native code] }/…`) ; l'original refuse (`probe_other_table`), le mutant écrit trois lignes | `:80` ; test 3, l.110-115 |
| m, survivants X11, X12, X19, X20, X6 | les quatre cas de la pièce : un fichier existant `{}` et un `[\n\n]\n` (`history_invalid`), un argv qui finit par `--probe` et une option inconnue (sortie 2) ; X6 par les cas de `received_at` ; recompte au § Mutants | `:99`, `:123` ; test 4 l.149, test 5 l.199 |
| m, CA dans les tests | le test 1 lit l'**enregistrement réel** de l'essai de MONARK, versé à l'octet sous `test/fixtures/ca-trial-18.json` (147 lignes, sha256 `28aaa41b…`, prémisse l.64) ; les tests 2 à 5 bâtissent une CA verte depuis `CHECK_NAMES` (un contrôle `ok` par nom ; `url`, `checked_at` et TLS de l'essai), si bien qu'un changement de la liste ne rougit que le test 1 ; puis le tronc est fusionné | test l.26-31, l.63-66 |
| m, épingles avant #233 | l'import est enveloppé dans `via("pins_unreadable", …)`, asynchrone ; le test affirme le code sur stderr : `pins_unreadable` avant a1, `served_not_pinned` après | `:46`, `:128` ; test 5, l.160 et l.197-198 |

## Tests (T-15, `test/served-history.test.ts`) et tueurs

Les enregistrements sont ceux des producteurs : sonde par `judge()` de `scripts/retire-probe.mjs` plus « \n » ; CA : au test 1,
l'**enregistrement réel** de l'essai de MONARK (`fd08dc5` : `verify-harness --out` contre la production, 18 contrôles verts, TLS autorisé
sur les deux hôtes), versé à l'octet sous `test/fixtures/ca-trial-18.json` ; aux tests 2 à 5, une CA bâtie de ses champs avec un contrôle
`ok` par nom de `CHECK_NAMES` du tronc, écrite comme `verify-harness` l'écrit (`JSON.stringify(…, null, 2)` et « \n »), telle quelle ou un
champ changé. Les instants sont comptés depuis son `checked_at`.

- `served_history_line_is_closed_and_read_from_a_verdict` (**le test de composition** : sondes par `judge()` et CA réelle de l'essai,
  deux lignes, `t_f` coupé à la seconde, sha256 des octets lus) — tueur : scripts/served-history.mjs:85 CONST "probe_record_sha256:
  sha(bytes)" -> "probe_record_sha256: sha(JSON.stringify(probe))"
- `served_history_writes_every_class_served_after_the_deployment` (`ac1cb86` ; dossier `2026-02-30`, dossier non daté, refus de
  `release_dir` absent, non dernier, sans jour réel, fichier, octets identiques) — tueur : scripts/served-history.mjs:72 CONST
  "dated.flatMap(" -> "[releaseDir].flatMap("
- `served_history_refuses_each_departure` (règles de la sonde et de la CA, `received_at` et `received_at_ms`, même hôte, classe servie,
  ordre des instants, épingles, voie (b)) — tueur : scripts/served-history.mjs:76 CONST "}, \"real\"));" -> "}, \"rehearsal\"));"
- `served_history_file_is_one_line_per_class_sorted_and_closed` (couples, champs communs, `[valeur]` par champ, formes, fichier `{}` ou
  vide) — tueur : scripts/served-history.mjs:98 CONST "o.release_dir === l.release_dir && " -> ""
- `served_history_cli_reads_t_e_from_the_merge_commit` (dépôt jetable sans `GIT_*`, date du committer, liaison de la fusion, fusion hors
  du premier parent, épingles par défaut et leur code, usage, second déploiement) — tueur : scripts/served-history.mjs:109 CONST
  "--format=%H %cI %P" -> "--format=%H %aI %P"
- Rouges d'abord, premier pli : les cinq tests, à la tête d'avant le pli (après la fusion du tronc), sont rouges par assertion (`t_f` à la
  milliseconde, dossier `2026-02-30` servi, statut 500 admis, paire en double dans le lot, `--no-such-option` passé à git). Second pli :
  aux Preuves.

## Mutants

- **Les 13 mutants survivants de la première G2**, rejoués là où leur garde vit (H, ou la règle du tronc qu'il importe), sur l'arbre
  de `3490ad7d`, fichier restauré et sha256 contrôlé : **13 tués sur 13** (M 2 rejoué deux fois, 14 tirs). M1 `%cI` → `%aI` (`:109`) ; M2 la
  CA prise comme en répétition (`:70`), et la liste `["green"]` du cycle réel (`retire-instants.mjs:75`) ; M3 les `CHECK_NAMES` non exigés
  (`retire-instants.mjs:75`) ; M4 le format de sonde (`retire-instants.mjs:81`) ; M5 `replaceAll` et M6 `./` (`:80`) ; M7 `>=` → `>`
  (`:84`) ; M8 `<=` → `<` (`:62`) ; M9 et M10 le sha256 d'une re-sérialisation (`:85-86`) ; M11 l'usage sans sonde (`:126`) ; M12 `!== 2`
  → `< 2` (`retire-instants.mjs:68`) ; M13 `{64}` → `{63,64}` (`:48`).
- **Balayage, recompté** (un mutant à la fois, `node --test test/served-history.test.ts` seul, fichier restauré et sha256 contrôlé,
  13:42:18Z à 13:44:55Z) : **66 mutants**, les 45 du premier pli, les 8 survivants du balayage de MONARK (X3, X6, X11, X12, X19, X20,
  X30, X31 ; ses 18 tués ne sont pas rejoués, leur table n'est pas dans la pièce) et 13 mutants des gardes neuves. **59 tués,
  7 survivants.**
  - Tués, entre autres : X6, X11, X12, X19 et X20, les cinq survivants non équivalents de MONARK ; E3 ; les 13 des gardes neuves
    (fusion hors du premier parent, `--first-parent` retiré, origine et hôte de l'api, `url` lue ou fixée, `typeof` de l'`url`, les deux
    bornes de la seconde de `received_at_ms`, son écriture et sa lisibilité, l'ordre lu à la seconde, l'import des épingles hors de `via`,
    `via` non asynchrone).
  - **E3** (`:80`, `!Object.hasOwn(served, cls)` retiré) **n'est pas équivalent** : il est **tenu par le cas** de la table forgée (test 3,
    l.110-115), au chemin `spec/undefined/…` d'une classe non servie et au chemin de la clé héritée `constructor` ; l'original refuse
    (`probe_other_table`), le mutant écrit trois lignes (« Missing expected exception »).
  - Les 7 survivants, **équivalents**, dont deux sous une condition écrite :
    - E1 `:60` `str(l.release_dir, DIR)` → `DIR.test(…)` : `validDate` ne lit qu'une chaîne, `[valeur]` reste refusé ;
    - E2 `:72` `f.endsWith(".json")` retiré : **équivalent sous la précondition du RUNBOOK l.377** (on ne déploie qu'une fusion où
      `spec-policy-tables.mjs --check` sort 0, et `--check` signale tout autre fichier d'un dossier daté, `extra`, l.205), que H ne lance
      pas ; sans elle, le mutant est plus strict : il refuse un fichier non JSON (`input_invalid`) que l'original ignore ;
    - X3 `:72` `existsSync(p)` retiré : ne diffère que pour un dossier daté sans `policy/`, que `datedFiles` n'écrit jamais ;
    - E4 `:109` et X31 `:115` `--end-of-options` retiré : les 40 hex sont contrôlés avant git (`retire-instants.mjs` l.66) ;
    - E5 `:110` `r.status !== 0` retiré : un git en échec n'imprime aucun id, et `own !== id` refuse aussi ;
    - X30 `:132` `writeAtomic` → `writeFileSync` : trivial, mêmes octets écrits (classe M14).
- **Corrections** : la garde `full !== commit` retirée au pli d'`ac1cb86` **n'était pas équivalente** à `checkLine` : l'id d'un tag annoté
  (40 hex) était pelé par `^{commit}` et accepté. Elle revient sous la forme « `%H` égal à l'id donné » (`:110`), tenue par le cas du tag
  annoté. E3, écrit « équivalent » au premier pli, ne l'est pas (ci-dessus). Les mutants triviaux de l'écriture (M14, M15, X30) :
  l'écriture est `writeAtomic` du tronc.

## Décisions et réserves

- **Base de l'import des épingles (m 8)** : le module n'est pas au tronc. Empiler sur #236 n'est pas possible proprement : #233, #236 et
  #237 partent de `9090da6d` sans `591b3a30`, dont H importe les règles (M 1) ; avec #236 pour base, le diff de la PR porterait #223,
  #226 et #227. H lit donc le module **par son chemin dans a1** (`PINS`, `COMMITTED_TABLES`), à l'exécution de `main` ; un lancement
  avant a1 est refusé par son code, `pins_unreadable` (décision de MONARK, `e6d5517`) ; `compose` prend les classes épinglées en
  paramètre, et le test 5 donne un module jetable. À la fusion d'a1, le défaut lit les épingles réelles (vides jusqu'à c), et le refus
  devient `served_not_pinned` ; la constante `PINS` et les deux codes sont tenus par le test 5.
- **Dossier daté postérieur** : `servedTableDirs` lit tout l'arbre ; `release_dir` doit donc être le dernier dossier daté (comme
  `datedFiles`, `spec-policy-tables.mjs` l.168-169 : « a dated version follows every published one »). Un dossier postérieur est
  **refusé**, non plus ignoré : l'arbre n'est pas celui du déploiement.
- **Fusion sur le tronc** (Q 1) : `--root` doit être un checkout du tronc, à la fusion déployée ou plus loin (RUNBOOK l.377 et l.386) ;
  lancé d'une autre branche ou d'un HEAD détaché ailleurs, la fusion est refusée (`merge_not_on_trunk`), sans écriture.
- **CA du dépôt et #225 : risque levé.** **Ligne datée (RECHERCHES, 2026-10-07, 13:54 UTC)** : le G0 d'avant écrivait qu'une fusion du
  tronc portant #225 rougirait le test 1 ; la G2 ciblée (`g2f-235.json`) a montré que **les cinq** tests lisaient la CA du dépôt
  (15 contrôles) et rougissaient tous. Décision de MONARK (`e6d5517`) : le test 1 lit l'enregistrement réel de son essai (`fd08dc5` :
  `verify-harness --out` contre la production telle que déployée, depuis le tronc `8411a2d4`, sortie 0, 18 contrôles sur 18, `checked_at`
  2026-10-07T12:56:15.514Z, sha256 `28aaa41b…`), versé à l'octet ; les tests 2 à 5 bâtissent leur CA depuis `CHECK_NAMES`. Le tronc
  (#225, #221, #229, #222) est fusionné dans H : 5 tests sur 5. La CA du dépôt (`docs/deploy-CA-harness.json`, 15 contrôles) n'est plus
  lue par les tests ; sa réécriture court avec les actes 2 à 6 de RUNBOOK-vitrine au prochain déploiement (MONARK, `fd08dc5`), hors de H.
- Hors de ces plis : la remarque de la G2 sur un BOM (`input_invalid` et non `history_invalid`) ; la lecture des tables dans l'arbre de la
  fusion (proposée par la G2, non retenue par MONARK au point 5) ; la comparaison des empreintes épinglées aux `policy_table_sha256`
  (observation de la G2 ciblée, item possible de PAROXYSME).

## Preuves

- **red-proof** (base neuve) : `node scripts/red-proof.mjs --base 595d2e4b0cab6cf28730e13dbb91992a642eeb33 --gel 3490ad7d --repo <worktree>
  --out <dossier> --draw 5 --seed 235` (Node v24.21.0, Linux, 13:53:37Z à 13:54:11Z) : sortie 0, « 5 judged, 0 unchanged, 5 killer(s)
  drawn » ; les cinq tests `new-module`, les cinq tueurs tués (`:76`, `:98`, `:109`, `:85`, `:72`), la fixture classée `support` ;
  fichier restauré (sha256 `ca1d3b75…` avant et après) ; digest du gel `89133b73…`, `RED-PROOF.json` sha256 `be48f944…`. Le commit de
  ce texte ne touche que `docs/**/*.md`, hors du digest. Aux plis d'avant (base `591b3a30`, gel `5b09ca1a` puis `8618efa7`) : même
  résultat, `RED-PROOF.json` `84e0952f…`.
- **Rouges d'abord, second pli** : le test final contre le code d'avant ce pli (`served-history.mjs` de `8618efa7`, sur l'arbre fusionné) :
  3 sur 5, les tests 3 et 5 **rouges par assertion** (`ERR_ASSERTION` : un `received_at` illisible refusé sous un autre code ; une fusion
  hors du premier parent acceptée). Les deux cas neufs de `7f1686dd` (`received_at_ms` à décalage, `url` en tableau), contre le code
  d'`e12d28f0` : rouges chacun, par assertion ; les deux autres (sans Z, table forgée) tiennent des gardes déjà là. Premier pli : 0 sur 5
  à `e961f615`.
- **Voisins** : `ci-gates`, `r25-integration`, `spec-1-1-0-release`, `spec-publish`, `spec-retire-path`, `export-public` (hors test 42),
  `retire-instants`, `retire-probe`, `killer-lines` (au tronc depuis #222), `runbook-retire`, `verify-harness-liq`, `red-proof` et ce
  fichier, 13 fichiers à l'arbre fusionné : **290 sur 290** (13:38:23Z à 13:40:31Z).
- **Portes** (arbre de `3490ad7d`, 13:46Z à 13:50Z) : `tsc --noEmit` 0 ; `eslint .` 0 ; `lang:gate` 0 ; `gate:vocab` 0 (348 fichiers) ;
  `lint:ratchet` 69/69 ; `export:check` 0 ; winlint (atelier de RECHERCHES) `--base 595d2e4b` (6 fichiers) et `--files` (5 fichiers) :
  aucun risque Windows.
- **Ancres** : `verifie-ancres.mjs` sur l'arbre fusionné, `--ref origin/lot/etude-suite --ref origin/recherches/e2a-h-served-history` :
  1 600 tueurs, 1 600 ancrés, 0 dérive, **0 perdu** ; le tronc `595d2e4b` en porte 1 595 (même outil) : les 5 de plus sont ceux de ce
  fichier.
- **R-25** (forme de la CI : `scripts/lot-size-integration.mjs pin` évalué dans un sous-shell, puis `git diff --shortstat` avec les
  pathspecs de `ci.yml` ; `docs/**/*.md` exclus, la fixture `test/fixtures/` comptée) : 5 fichiers, +520 −1, soit **521** (borne 547) ;
  la CI de `3490ad7d` lit de même « Changed lines: 521 » (mode written). Avec ce G0, 6 fichiers.
- **CI** : relancée par la poussée de `3490ad7d`, qui contient `595d2e4b` ; puis par celle de ce texte.
