claude-opus-5-5

# G1 — lot SERIES-INTERVALS : intervalles 1h et 4h de l enregistreur des bougies Binance, sorties 15m inchangées à l octet

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact déclaré par le harnais de la session), effort max, instance fraîche.
- **Mission** : `F:/tmp/dojo/mission-recint.md` (57 lignes au sens de `wc -l`, 14 901 octets), sha256
  `7e6507b5fd55bfd95a41c7002e1a676553797d66211024cb24f8863777b4743f`, recalculé AVANT lecture (première commande de la session,
  17:59:40Z), égal à la valeur donnée par l orchestrateur. Générée par `F:/Monark/scripts/mission/gen.mjs` (`27e0b63e`, sha256
  `9eecb371…1ae2`) à 17:59:33Z. Règles `F:/Monark/docs/methode/REGLES-MISSION.md`, sha256 `64700025…d2ba` (18:04:58Z), insérées
  dans la mission, lues en entier.
- **Base** : worktree `F:/Monark-wt-rec`, branche `lot/series-intervals`, HEAD `f46c454f36551b4bb61430ffcdcf28121eb94c04`,
  `git status --porcelain` vide à 17:59:53Z. Script à la base, sha256 `0a1ae564…c71f` : celui que RECHERCHES a relu (mission, Cadre).
- **Outils du tronc** aux sha256 de la mission (18:04:58Z) : `scripts/oracle/run.mjs` `f22b9045…`, `scripts/oracle/r25.mjs`
  `4d0544df…`, `scripts/red-proof.mjs` `6579b550…`, `scripts/mission/lint.mjs` `4d1383c8…`, `scripts/mission/launch.mjs` `fb6c277f…`.
- Aucun git écrivant dans le worktree ni dans `F:/Monark` ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; aucun
  réseau ; rien sur C: (TEMP, TMP, TMPDIR = `F:/tmp/dojo/recint/tmp` à chaque course) ; aucune série enregistrée lue.

## 0. Horaires (`date -u`)

- 17:59:40Z sha256 de la mission ; 17:59:53Z HEAD, branche, status ; 18:04:58Z sha256 des outils ; 18:05:54Z verrou lu ; 18:12:13Z
  C-V-4 ; vers 18:13Z advisor (avant le code) ; 18:15:04Z index du worktree (écart 1, section 8) ; 18:17:31Z sha256 des entrées ;
  18:19:41Z verrou libre ; ce journal, sections 0 à 8, écrit à partir de 18:19:41Z, AVANT toute ligne de code.

## 1. C-V-4 et verrou d hôte

- 18:05:54Z : verrou `F:/tmp/oracle-lock` TENU par un autre G1 (`owner.txt` : rôle G1, pid 97404, pris à 18:05:37Z). Règle tenue :
  aucun test ni aucune sonde qui exécute l enregistreur tant qu il est tenu ; la lecture, la conception et ce journal avancent.
- 18:12:13Z (outil `F:/tmp/dojo/recint/tmp/tools/cv4.ps1`, `Get-CimInstance Win32_OperatingSystem`, lecture seule) : 14 `node`,
  15 991 Mo physiques et 32 251 Mo virtuels libres, verrou tenu. 18:19:41Z : 5 `node`, 16 589 Mo et 33 069 Mo, verrou LIBRE.
- Aucun `.git` dans `F:/`, `F:/tmp`, `F:/tmp/dojo`, `F:/tmp/dojo/recint`, `F:/tmp/dojo/recint/tmp` (18:15Z) : les sorties des
  tests sous TEMP sont hors de tout arbre git (sinon l enregistreur les refuse, `out_in_git_tree`).

## 2. Entrées lues en entier, dans l ordre de la mission (sha256 à 18:17:31Z)

| Entrée | l. | sha256 |
|---|---|---|
| `scripts/record-binance-klines.mjs` | 249 | `0a1ae5649e0b68213e609b5da3b97725ffa145a9421710d797cb522b0ba6c71f` |
| `scripts/record-binance-klines.d.mts` | 78 | `223cb52e6739d10a57f4a90cda6b2621558033df243b8a699f624825f482eef6` |
| `test/record-binance-klines.test.ts` | 357 | `2853c7bf3500cea565b2612e05ef1ccd00a8d4521efc9cd30b754b6925d15534` |
| `docs/G1-lot-series-binance.md` | 332 | `a60d30899faf6dde746ff7aaac72944844ea5a5163f45b3f97de0d8c604da139` |
| `F:/Monark/docs/marche/FAITS-binance-klines-2026-10-01.md` | 35 | `adaaf21d3b54db643940bd864f5d7c095f94a76fb34913d8a4ed0988123284c2` |
| `F:/Monark/docs/marche/FAITS-conditions-series-2026-10-01.md` | 69 | `9f3559a489225d1d969b18d507e4fa3546e7b1322ca7d091c150612af21c7d4d` |

- Lectures complémentaires : `F:/Monark/scripts/red-proof.mjs` en entier (un test est jugé quand une ligne changée tombe dans son
  corps ; F2P = rouge à la base par `ERR_ASSERTION` et vert au gel ; un test jugé vert à la base est refusé ; convention
  `// killer:`) ; `scripts/oracle/run.mjs` en entier ; `r25.mjs` ; en-tête de `lock.mjs` ; `mk-nm.ps1`, `rm-nm.ps1` ;
  `package.json` ; `ci.yml` l.82 (pathspec R-25, `docs/**/*.md` exclus) ; liste `FR_WORDS` de `scripts/lang-gate.mjs` ;
  `F:/Monark/docs/biblio/ukemi-modeL/MESURES-M2b-sources-2026-09-19.md` (sha256 `a608900c…4ac3`, l.125-140 et les lignes qui citent
  `klines`) ; livrable précédent `F:/tmp/marche-deliver/REPONSE.md` (forme seulement).
- Seul consommateur du module : son test (recherche de `record-binance-klines` hors `docs/`, 18:12Z) ; `INTERVAL` et `STEP_MS` ne
  sont lus que par le script et par ce test.
- Non lu, par la règle de la mission (aucune série enregistrée lue) : `out/m2b1-hour-share.json` (données de marché du 2026-09-19).
- Aucune copie locale du `rest-api.md` de Binance (recherche dans `F:/Monark/docs` et dans `F:/tmp` à profondeur 4, 18:17Z) : la
  documentation des intervalles n est pas lisible ici sans réseau (section 3).

## 3. Hypothèse H-6 sur les intervalles 1h et 4h, NON lue à la source (réseau interdit), et demande formée

- **H-6** : le point d accès accepte `interval=1h` et `interval=4h` ; sans paramètre `timeZone`, une bougie s ouvre sur la grille UTC
  de son intervalle (ouverture multiple de la durée depuis l époque Unix : 1h à l heure pleine, 4h à 00, 04, 08, 12, 16 et 20 h UTC)
  et se ferme à ouverture + durée − 1 ms (1h : + 3 599 999 ; 4h : + 14 399 999).
- Évidence locale : [lu] MESURES-M2b l.132-134 : une requête réelle du 2026-09-19, `interval=1h&startTime=1760130000000&limit=1`, a
  rendu `openTime == 1760130000000`, une heure UTC pleine (1760130000000 / 3 600 000 = 488 925 exactement) ; [2nd] journal
  `docs/G1-lot-series-binance.md` section 5 : `[6]` = ouverture + 3 599 999 en 1h, lu par le G1 précédent dans
  `out/m2b1-hour-share.json`, que je ne relis pas (série enregistrée) ; [lu] FAITS-binance-klines, H-2 : `startTime` et `endTime`
  toujours lus en UTC. Pour 4h : aucune évidence locale.
- Conséquence de conception (même principe que H-1 à H-5) : la garde reste STRICTE, par intervalle ; une ouverture hors de la grille
  de l intervalle (`off_grid`) ou une clôture autre que ouverture + durée − 1 (`close_time`) arrête l enregistrement à la première
  page, jamais une lecture fausse en silence. Chaque branche est épinglée par un test (section 6).
- **Demande formée FAITS-BINANCE-INTERVALS-1 (orchestrateur, lecture sur place)** : dans le fichier déjà lu le 2026-10-01
  (`https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/rest-api.md`, sha256 du texte rendu `49ea6809…7999`),
  section « Kline/Candlestick data » : (a) la liste des intervalles admis contient-elle `1h` et `4h` ; (b) le paramètre `timeZone` :
  défaut et effet sur les bornes des bougies ; (c) l exemple de réponse (heure de clôture). Ajout daté aux FAITS ; H-6 confirmée ou
  amendée AVANT la relecture de RECHERCHES et avant toute requête 1h ou 4h (condition C-5). Tentative ici : aucune (réseau
  interdit) ; copie locale cherchée, absente (section 2). Usage : condition préalable du premier appel 1h ou 4h.

## 4. Conception décidée avant le code

- **Liste fermée** `INTERVALS` (objet gelé, nom → durée en ms) : `15m` 900 000, `1h` 3 600 000, `4h` 14 400 000. Appartenance par
  `Object.hasOwn` : une clé héritée du prototype (`constructor`) est refusée `bad_interval` ; le détail de l arrêt porte
  `allowed: ["15m", "1h", "4h"]`.
- **Arguments** : `parseArgs` contrôle le symbole, puis l intervalle, puis `--start` et `--end` sur la grille DE L INTERVALLE (ordre
  des contrôles inchangé) ; il rend aussi `interval` et `step` (durée en ms). Message d une heure hors grille : « not on the
  <n>-minute grid », n = durée / 60 000 : « 15-minute » à l octet en 15m, « 60-minute » en 1h, « 240-minute » en 4h.
- **Défauts `"15m"`** de `parseTime(text, interval)` et de `expectedCount(start, end, interval)`. Raison mesurée (`red-proof.mjs`
  l.122-125 et 164-175) : un test existant dont le corps change est jugé et doit être rouge à la base ; le test
  `binance_klines_expects_70080_candles_on_the_founder_range` appelle ces deux fonctions à l ancienne arité ; sans défaut il faudrait
  le modifier : jugé, vert à la base, donc refusé. Les appels internes passent toujours l intervalle.
- **Exports** : `INTERVAL` et `STEP_MS` retirés (une valeur unique n a plus de sens), remplacés par `INTERVALS`. Le test déclare ses
  propres durées (oracle indépendant du code) et n importe aucun nom neuf : ses imports restent un sous-ensemble des exports de la
  base, sinon il ne se chargerait pas à la base (`import-fail`, refusé sur un fichier qui existe à la base). Une constante privée
  `MINUTE_MS` prend la ligne libérée : aucune ligne du script ne se décale, les ancres `// killer:` gardent leur numéro.
- **Requête** : `interval=<nom>` dans l URL, même ordre des paramètres ; discipline réseau inchangée (hôte fermé, refus du mandataire
  et de la redirection, `Retry-After`, poids, 500 ms entre deux requêtes, 100 pages au plus, aucune relance).
- **Contrôles par intervalle** : grille (`k[0] % step`), clôture (`k[0] + step − 1`), curseur suivant (dernière ouverture + step),
  trous déclarés sur la grille de l intervalle, attendues = (fin − début) / step.
- **Sorties** : `<symbole>-<intervalle>.csv` ; `missing.json` et `manifest.json` portent l intervalle (champ déjà présent) ; schéma
  `monark.series.binance.v1` et ordre des champs inchangés ; noms `raw/<symbole>-<startTime>.json` INCHANGÉS (y mettre l intervalle
  changerait les sorties 15m) ; ligne de `main` inchangée (un champ neuf la changerait en 15m).
- **Rejeu sous un autre intervalle** : le brut ne nomme pas son intervalle ; un rejeu sous un autre intervalle que l enregistrement
  s arrête à la première bougie (`close_time` ou `off_grid`), épinglé par un test. Cas limite : un brut dont toutes les pages sont
  vides n a aucune bougie à contrôler (item REPLAY-INTERVAL-BIND-1, formé à la clôture).
- **Charge** sur la plage du fondateur : 1h, 18 requêtes par série (17 520 / 1 000) ; 4h, 5 requêtes (4 380 / 1 000) ; quatre
  symboles : 72 + 20 = 92 requêtes de poids 2, au moins 500 ms entre deux ; sous la borne de 100 pages par série.

## 5. « Identique à l octet » en 15m : définition écrite avant le code, et sonde différentielle

- Sur le même `fetch` simulé, la même horloge fixe et le même environnement, l ancien script (base `f46c454f`, extrait par
  `git show` en lecture) et le nouveau doivent rendre, en 15m : les mêmes URL et les mêmes `init`, les mêmes pauses, la même liste
  de fichiers de `--out`, les mêmes octets de `<symbole>-15m.csv`, `missing.json`, `raw/*` et `requests.jsonl`, la même ligne de
  `main` (stdout si écrit, stderr si arrêt : code ET détail), les mêmes lignes de `SHA256SUMS` hors celle de `manifest.json`, et un
  `manifest.json` identique hors la valeur de `script_sha256`.
- Exception par construction (Q-G1-1) : `manifest.json` nomme le script qui l a écrit (`script_sha256`, l.203) ; changer le script
  change cette valeur, donc la ligne `manifest.json` de `SHA256SUMS`. Aucune autre différence n est admise.
- Scénarios (ceux des tests existants ; `fetch` en mémoire, ni serveur ni réseau) : page pleine puis partielle ; saut, doublon
  identique et page vide ; doublon différent ; statuts 429, 418, 451, 500, 503, 302, 404, 400 et coupure ; corps et bougies hors
  forme ; 100 pages ; décimales longues ; plage du fondateur (70 080) pour les quatre symboles ; rejeu, dont un brut enregistré par
  l ancien script et rejoué par le nouveau ; arguments refusés en 15m (dont l heure hors grille) ; mandataire et TLS ; sortie
  inutilisable.
- Contre-épreuve : une copie du nouveau script changée d un octet dans une sortie 15m doit être déclarée différente par la sonde.
- La sonde exécute l enregistreur : elle attend le verrou libre, comme un test.

## 6. Tests prévus (`test/record-binance-klines.test.ts`)

- `binance_klines_records_17520_hourly_candles_aligned_on_the_hour` (neuf) : plage du fondateur servie en 1h (ETHUSDT) : code `ok`,
  intervalle 1h, `ETHUSDT-1h.csv`, attendues = lignes = 17 520, 0 manquante, 18 pages, 17 pauses ; ouvertures = début + i heures
  pour tout i ; deux premières URL (`interval=1h`, curseur + 1 000 h) ; `missing.json` ; `expectedCount(..., "1h")` = 17 520.
  Alignement : bougie servie à 00:15 → `off_grid` ; clôture de 15 min → `close_time` ; `--start` 00:15 ou `--end` 00:45 →
  `bad_time` sans requête ; voisins hors liste `1H`, `60m` → `bad_interval`. Rejeu du brut 1h : en 1h, mêmes octets du CSV ; en 15m
  et en 4h, `close_time`.
- `binance_klines_records_4380_four_hour_candles_aligned_on_the_utc_day` (neuf) : même forme en 4h (BNBUSDT) : 4 380, 5 pages,
  4 pauses, dernière ouverture 2026-09-30T20:00:00Z ; un trou déclaré sur la grille de 4 h ; bougie servie à 01:00 → `off_grid` ;
  clôture d une heure → `close_time` ; `--start` 02:00 ou `--end` 06:00 → `bad_time` ; `4H`, `240m` → `bad_interval`.
- `binance_klines_refuses_bad_arguments` (modifié, FORCÉ : son cas `[swap("--interval", "1h"), "bad_interval"]` devient faux) : ce
  cas devient `[swap("--interval", "4h"), "bad_time"]` (4h admis, `--end` 01:00 hors de sa grille ; à la base `bad_interval`, donc
  rouge par assertion) ; ajout des hors-liste `30m`, `1d`, `constructor` et la valeur vide.
- Aucun autre corps de test existant n est touché. Hors des corps : import sans `STEP_MS`, durées déclarées dans le test,
  `row(t, close, step)`, `Plan.interval`, `record()` qui passe l intervalle, aides neuves.
- Tueurs (`// killer:`, sans barre inverse) des tests neufs choisis ÉQUIVALENTS en 15m, pour prouver que les tests neufs tuent ce que
  la suite 15m ne voit pas : 1h, curseur suivant `+ ctx.step` → `+ 900_000` ; 4h, grille `k[0] % ctx.step` → `k[0] % 900_000` ;
  mauvais arguments, ligne du contrôle d intervalle vidée (SDL). Ancres existantes : deux textes changent (`STEP_MS`, l.152 et
  l.89), les numéros restent ; vérificateur hors dépôt (`parseKiller` du tronc) avant chaque gel.
- Mesure « rouges à la base par assertion » : `red-proof` du tronc, `--draw` = nombre de tests admis.

## 7. Compte ascendant par fichier, écrit AVANT toute ligne de code (tâche 1)

Unité : insertions + suppressions comptées par R-25 (pathspec du job CI ; `docs/**/*.md` exclus : ce journal est hors compte).
Borne 1 150 (porte CI 1 205). Arrêt : `r25()` > 1 150, ou solde 1 150 − `r25()` < 10 : arrêt et signalement, jamais de compaction.

| Fichier | Ascendantes |
|---|---|
| `scripts/record-binance-klines.mjs` | 46 |
| `scripts/record-binance-klines.d.mts` | 9 |
| `test/record-binance-klines.test.ts` | 70 |
| **Total** | **125** |

- Script : 23 lignes modifiées en place (× 2) : en-tête 4 (l.2, 3, 12, 15), constantes 2 (l.28-29), `parseTime` 4, `parseArgs` 3,
  `expectedCount` 2, URL 1, garde de ligne 2, curseur 1, trous 1, écriture 3. Aucune ligne ajoutée ni retirée.
- `.d.mts` : deux constantes remplacées par une (3), `RecorderArgs` + 2, deux signatures modifiées (4).
- Test : 10 lignes modifiées (× 2) : en-tête 1, import 1, `Plan` 1, `row` 2, `record` 1, tueurs 3, mauvais arguments 1 ; 50
  ajoutées : durées 1, cas hors liste 1, aides 14, test 1h 17, test 4h 17.
- Prévision : 125 × 1,0 à 1,5 ≈ 125 à 190 ; solde ≥ 960 sous 1 150 : le G1 continue.

## 8. Ordre des preuves (prévu) et écart déjà consigné

1. Code ; garde d octets (TAB, contrôle, barre inverse), lignes ≤ 160, `node --check`, vérificateur d ancres.
2. Verrou libre et C-V-4 : sonde différentielle 15m et sa contre-épreuve ; test du lot (TEMP sur F:).
3. Clone `--no-local` sous `F:/tmp/dojo/recint/`, fichiers copiés à sha256 égal, gel commis DANS ce clone seul ; jonctions
   `node_modules` par `mk-nm.ps1` ; `typecheck`, `lint`, `lang:gate`, `gate:vocab` ; `r25()` du tronc.
4. `red-proof` du tronc. 5. Oracle `run.mjs --role G1`, voie statique puis complet, après la clôture de ce journal.
6. Jonctions retirées par `rm-nm.ps1` ; `F:/Monark/node_modules` compté avant et après.

- **Écart 1** : mon premier `git status` (17:59:53Z) est parti sans `--no-optional-locks` ; l index du worktree
  (`F:/Monark/.git/worktrees/Monark-wt-rec/index`) porte 17:59:53Z (heure locale 18:59:53) ; `git diff --cached` vide (18:15:04Z) :
  contenu indexé inchangé. Toutes les commandes git suivantes dans le worktree et dans `F:/Monark` en `--no-optional-locks`.

<!-- Fin des sections écrites AVANT le code. Les sections suivantes sont écrites après le gel du code ; les sections 0 à 8 ne sont plus
     retouchées. -->

## 9. Exécutions, incidents et corrections (ordre chronologique ; TEMP, TMP, TMPDIR = `F:/tmp/dojo/recint/tmp` ; verrou relu avant chaque course)

Chemins relatifs à `F:/tmp/dojo/recint/` sauf mention.

- 18:20:48Z instantané pré-code `evidence/journal-precode.md`, sha256 `20f1824e…51ba7`, égal à ce journal à cette heure.
- 18:21Z à 18:24Z code en place (outil Edit) : script, `.d.mts`, test. 18:25:17Z garde d octets hors dépôt (`tmp/tools/guard.mjs` : TAB,
  C0 hors LF, DEL, C1, barre inverse, `F:` suivi de deux espaces, ligne > 160) : propre ; `node --check` vert ; 14 ancres `// killer:`
  valides (`tmp/tools/check-killers.mjs`, `parseKiller` du tronc). 18:25:31Z test du lot 14 sur 14 (`runs/t1/lot.tap` `ecf81d3e…2277`).
- **Sonde différentielle 15m.** 18:27:01Z base extraite en lecture (`git show f46c454f:scripts/record-binance-klines.mjs`, sha256
  `0a1ae564…c71f`). Outil `tmp/probes/diff15m.mjs` (`640a480b…05d9`), scénarios `tmp/probes/scenarios-15m.mjs` (`4704d9c1…3686`) :
  ancien et nouveau script (`48aa58b3…609d`) par `main`, même `fetch` en mémoire, même horloge, même environnement. Passage qui fait
  foi (19:01:32Z) : **61 scénarios 15m sur 61 identiques** au sens de la section 5 ; dans les 11 scénarios qui écrivent un manifeste,
  seule `script_sha256` diffère ; rejeux sans requête ; rejeu croisé identique (brut de l ancien rejoué par le nouveau, et l inverse) ;
  deux différences DÉCIDÉES rapportées à part (`allowed` d un `bad_interval` ; `1h` refusé par l ancien, enregistré par le nouveau).
  Preuve `evidence/diff15m-2.json` `5308677151444419fd27aca7d51e8407d1c19ddf44c766aee856299f0e169a62` (`diff15m-2.txt` `7b05856c…7fb4`).
  Premier passage (18:29:15Z, même verdict, `evidence/diff15m-1.json` `c60cfb98…0bf5`) : version antérieure de la sonde, remplacée
  (écart 3, section 17).
- **Contre-épreuves** (19:01Z à 19:02Z ; copies du nouveau script changées d un octet, `counter/`) : en-tête du CSV (`open_time_utC`)
  → 11 scénarios différents (tous ceux qui écrivent un CSV) ; message de grille (`grId`) → 1 ; URL (`limit=10000`) → 35 (tous ceux
  qui requêtent) ; `evidence/diff15m-2-counter-{csv,why,url}.json` (`3b260c98…5cc8`, `ad571a67…e30e`, `2a95d25e…25fc`). La sonde voit
  un octet.
- 18:30:44Z red-proof 1 OK (`f2p-1/RED-PROOF.json` `05109d09…a3b7`) ; 18:31:29Z voie statique de l oracle : huit portes à 0, R-25 151
  (enregistrement `ed43a1cf…4ad0`).
- **Campagne 1** (18:36:13Z → 18:37:36Z ; clone `mclone1` ; outil du tronc `F:/Monark/scripts/mutants/run.mjs` `41cdf83f…1ac8` ; table
  `mutants/table.mjs` `d0a9be9a…f710`, 28 mutants sur les lignes changées, plus les 14 tueurs ; `held` nul ; C-V-4 : 5 `node`,
  16 411 Mo physiques, 32 381 Mo virtuels) : 37 tués sur 42, survivants M06, M07, M08, M10, M13 (`mutants/run1/RESULTS.json`
  `b9c7385a…bfb6`, `RESULTS.txt` lu en entier) : gel de la liste, texte de la grille, défaut de `parseTime`, liste `allowed`, que les
  tests ne comparaient pas. Le texte « not on the 15-minute grid » n était comparé par aucun test à la base (latent depuis SERIES-BINANCE).
- **Correction 1, tests seuls** : les tests 1h et 4h comparent la ligne exacte que `main` imprime pour chaque refus (grille de 15 min
  comprise) et 0 requête ; `parseTime` à son défaut ; la liste fermée, gelée, lue par un import d espace de noms (aucun nom neuf
  importé : la base charge toujours le fichier).
- 18:39:02Z un G2 (pid 123404) prend le verrou entre ma lecture (18:39:00Z, libre) et le lancement : la garde `test ! -d
  F:/tmp/oracle-lock` en tête de commande l arrête, aucun test lancé ; attente jusqu à 18:46:37Z. 18:46:44Z test 14 sur 14 ; 18:46:54Z
  red-proof 2 OK (`f2p-2/RED-PROOF.json` `05f0d23b…f5b3`).
- **Campagne 2** (18:47:42Z → 18:48:51Z, clone `mclone2`) : 41 tués sur 42, 0 survivant ; K5 NON CONCLU : l enfant `node --test` meurt,
  code 3221226505 (0xC0000409), 209 ms, sans entrée de test (`mutants/run2/RESULTS.json` `480f2a03…ef42f`, `tap/K5.tap` `4966ee99…45a6`).
  Même mutant et même corps de test qu en campagne 1, où K5 était tué.
- **Reproduction de K5** hors outil (`k5repro/`, drapeaux de l outil l.193-195, stdout et stderr gardés par passage ; arbre muté
  `5921dc35…b0e`, ligne 152 vidée) : en série, 20 passages : 19 tués par assertion, 1 mort 3221226505 (passage 12 ; stderr du parent :
  0 octet, sha256 du vide) ; 40 de plus : 40 tués ; 40 en `--test-isolation=none` : 40 tués ; 40 sans `--test-force-exit` : 40 tués ;
  référence non mutée, 10 + 40 : 50 verts. En isolation par défaut, K5 compte 2 morts sur 63 passages (campagnes 1, 2 et 4 comprises).
  Au taux observé, 0 mort sur 40 a une probabilité d environ 0,27 : AUCUNE cause n est attribuée (ni à l isolation, ni à
  `--test-force-exit`). Fichiers `k5repro/seq.txt` `1504b229…d773`, `def40.txt` `c8393167…8875`, `none40.txt` `292aff88…596c`,
  `noforce40.txt` `76f4ce3e…0364`, `ref40.txt` `fd4ba3ca…7983`. Item RED-PROOF-CHILD-STDERR-1 (section 14).
- **Campagne 3** (`--only K5`, clone `mclone3`, 18:53:00Z → 18:53:09Z) : LIGNE DE BASE ROUGE, 13 tests sur 14, « no loopback port
  above 10080 in 50 tries » ; aucun mutant joué, K5 « non conclu (base) » (`mutants/run3/RESULTS.json` `78073410…0d08`,
  `tap/BASELINE.tap` `3200c22b…1636`).
- **Cause mesurée** : la plage dynamique TCP de cet hôte commence à 1024 (64 511 ports, `netsh int ipv4 show dynamicport tcp`) et le
  port 0 est attribué EN SÉQUENCE : 300 liaisons de suite sur 127.0.0.1 → 3914 à 4213 (18:53:38Z), 7224 à 7523 (19:00:15Z ;
  `evidence/ports-3.txt` `db75c407…a8ef`). Revenu sous 10 081, l allocateur y reste des milliers de liaisons ; l aide `listen()` héritée
  de SERIES-BINANCE (port 0, tout port ≤ 10080 rendu, 50 essais) n en sort pas : le fichier de test est rouge pendant toute la phase.
  [lu] Source embarquée du runtime (Node v24.15.0, undici 7.24.4, `badPorts`) : 82 ports bloqués par `fetch`, maximum 10080, dont 19
  entre 1024 et 10080 (`evidence/badports.json` `8b310e2d…e440`).
- **Correction 2, aide de test seule** : `listen()` demande un port aléatoire entre 10 081 et 65 080 et en prend un autre sur toute
  erreur d écoute (port pris, ou exclu par l OS). Sonde `tmp/probes/relisten.mjs` (`evidence/relisten-2.txt` `830dadd8…9397`) : après
  `EADDRINUSE`, le même serveur écoute au port suivant ; aucun écouteur laissé (l unique écouteur `listening` restant existe sur tout
  `http.Server` neuf de Node v24.15.0). Même phase basse : nouveau test 14 sur 14 (18:55:03Z, `runs/t3/lot.tap` `076a493c…f5c4`) ;
  ancien test (`ac911924…f76d`) 1 sur 14, 13 rouges « no loopback port above 10080 in 50 tries » (18:55:15Z, `runs/t3-old/lot.tap`
  `1f421b6c…da63`).
- 18:55:47Z **red-proof 3, état définitif, OK** (`f2p-3/RED-PROOF.json`
  `3d32c617487c5b4b8e8085a94eef4c9aac40d1670f6003a190b3d784f69dd2eb`) : 3 tests jugés, tous F2P (à la base : 1h et 4h
  `actual: 'bad_interval'` contre `expected: 'ok'` ; mauvais arguments, cas `4h` : `bad_interval` contre `bad_time`), 11 inchangés
  verts à la base avec le test neuf, 3 tueurs sur 3 tués.
- **Campagne 4, qui fait foi** (18:56:32Z → 18:57:45Z ; clone `mclone4`, quatre fichiers à sha256 égal ; `held` nul ; C-V-4 : 5 `node`,
  15 478 Mo, 32 482 Mo) : **42 tués sur 42**, 0 survivant, 0 non conclu, 0 ancre perdue, sortie 0 : `mutants/run4/RESULTS.json`
  `87fcabe04135fcbb02419d66547237608ec8dc378738f9c29038a1aecbe20854`, `RESULTS.txt` `6b433591…4e90`, lu en entier.
- 18:57:56Z voie statique de l oracle sur l état définitif (section 12).

## 10. Compte mesuré contre compte ascendant (complète la section 7, laissée telle qu écrite avant le code)

| Fichier | Ascendantes | Mesurées (`r25`, voie statique du 18:57:56Z) |
|---|---|---|
| `scripts/record-binance-klines.mjs` | 46 | 47 (24 + 23) |
| `scripts/record-binance-klines.d.mts` | 9 | 9 (5 + 4) |
| `test/record-binance-klines.test.ts` | 70 | 130 (114 + 16) |
| **Total** | **125** | **186** (STAT 143 + 43 ; CONTENT_STAT 0) |

- 186 / 125 = × 1,49 (prévision 125 à 190) ; ≤ 1 150 (solde 964) ≤ 1 205 (porte CI). Le compte officiel est la porte `r25` de l oracle.
- Écarts au plan : script + 1 (ligne du manifeste scindée, 162 caractères sinon ; ordre des clés inchangé) ; test + 60 : lignes exactes
  de `main` comparées (correction 1), aide `listen()` refaite (correction 2), cas hors liste sur trois lignes au lieu d une, import
  d espace de noms, aides plus longues que prévu.

## 11. Décision → fichier → test → mutants (S = `scripts/record-binance-klines.mjs` ; K = tueur, M = table ; campagne 4)

| Décision (mission) | S, l. | Tests | Tués |
|---|---|---|---|
| Liste fermée 15m, 1h, 4h, durée en ms, gelée | 28 | mauvais arguments ; 1h ; 4h | M01-M06 |
| Hors liste refusé `bad_interval` | 82 | mauvais arguments (`30m`, `1d`, vide, `constructor`) ; 1h (`1H`, `60m`) ; 4h (`4H`, `240m`) | K12, M12, M13 |
| `--start`, `--end` sur la grille de l intervalle ; message | 29, 63-66, 83 | 1h, 4h (lignes de `main`) ; mauvais arguments (`4h`) | M07-M11, M14, M15 |
| Intervalle et pas transmis à la course | 83, 85 | 1h, 4h (URL, comptes) | M16-M18 |
| Compte attendu 17 520 (1h), 4 380 (4h) ; défaut 15m | 89, 201 | 1h, 4h ; `..._expects_70080_...` | M19, M20, M28 |
| Requête `interval=<nom>` | 114 | 1h, 4h (deux premières URL) | M21 |
| Alignement : grille, clôture, curseur, trous | 152, 153, 177, 190 | 1h, 4h (bougie hors grille, clôture courte, trou en 4h) | K13, K14, M22-M24 |
| Sorties `<symbole>-<intervalle>.csv`, `missing.json`, manifeste | 196-201 | 1h, 4h | M25-M27 |
| 15m inchangé à l octet | toutes | sonde différentielle ; 11 tests 15m inchangés | K1-K11 |
| Rejeu sous un autre intervalle : arrêt à la première bougie | 152, 153 | 1h (rejeux en 1h, 15m, 4h) | K14, M22, M23 |

- Review Focus : sortie 15m changée d un octet : refusée par la sonde (61 sur 61, contre-épreuves) ; intervalle hors liste accepté :
  refusé par trois tests, et les mutants qui l admettraient sont tués (K12, M05, M12) ; requête réseau réelle : aucune (`fetch` global
  piégé, `fetch` injecté vers 127.0.0.1, sonde en mémoire).

## 12. Portes et oracle

- Voie statique de l oracle du tronc (`F:/Monark/scripts/oracle/run.mjs` `f22b9045…`, rôle G1, `--base f46c454f`,
  `--key SERIES-INTERVALS`, `--static-only`) sur l état définitif du code, 18:57:56Z → 18:58:59Z : **huit portes à 0** : `typecheck`,
  `lint`, `lang:gate`, `gate:vocab` (les quatre de la mission), et `lint-model-pinning`, `r25`, `export:check`, `lint:ratchet` (69 sur
  69). Enregistrement `F:/tmp/oracle-results/f46c454f36551b4bb61430ffcdcf28121eb94c04-a6c041a076a5646e-G1-20261001T185756Z-173304.json`,
  sha256 `ea63e86cea0c944a455484fca76f90a364a0a0b7d800927eee1a0ab9ae504af7` ; `dirty` `a6c041a0…` (état de la campagne 4).
- **sha256 du script modifié (tâche 3)** : `48aa58b3daa22e83a69ad8c8d5b146655c0ac393cae74ad8c838671c9697609d` ; `.d.mts`
  `f624f359bd08889f9b4b7199a00913113590e5b64d267309b19978ec2fdb3f4d` ; test `9fb833472b92cc468c73bab2ec1efcc95001599c3abeeb56aa64bb136eadf2ae`.
- Oracle complet (suite sous verrou, test 42 une fois) lancé APRÈS la clôture de ce journal ; son enregistrement est cité dans
  `F:/tmp/dojo/recint-deliver/REPONSE.md`.

## 13. MAST (risques résiduels ; MAST, arXiv:2503.13657, adopté par le doc 06 du référentiel)

- FM-3.3 (vérification incorrecte) : les tests prouvent l enregistreur contre une imitation du point d accès ; H-6 (grille UTC des
  bougies 1h et 4h, clôture) n est PAS lue à la source ; la garde stricte arrête la première page fausse (`off_grid`, `close_time`)
  au lieu de lire faux ; demande formée FAITS-BINANCE-INTERVALS-1.
- FM-1.5 (condition de fin ignorée) : aucune requête réelle ; le premier appel 1h ou 4h attend la lecture formée et la relecture de
  RECHERCHES (condition C-5).

## 14. Items formés (aucun « dû » nu ; déclencheur et prix pour chacun)

- **FAITS-BINANCE-INTERVALS-1** (demande formée, section 3) : lecture sur place, par l orchestrateur, de la section « Kline/Candlestick
  data » du `rest-api.md` de Binance (sha256 du texte rendu `49ea6809…7999`) : intervalles admis (1h, 4h), paramètre `timeZone`
  (défaut, bornes des bougies), exemple de réponse (clôture) ; ajout daté aux FAITS ; H-6 confirmée ou amendée. Déclencheur : avant la
  relecture de RECHERCHES et avant toute requête 1h ou 4h. Prix : une lecture ; au plus quelques lignes de garde si H-6 est amendée.
- **REPLAY-INTERVAL-BIND-1** : le brut ne nomme pas son intervalle (noms `raw/<symbole>-<startTime>.json` gardés : les changer
  changerait les sorties 15m) ; un rejeu sous un autre intervalle s arrête à la première bougie (testé), SAUF un brut dont toutes les
  pages sont vides : rien à contrôler, le rejeu rend « 0 bougie » sous l intervalle demandé. Construction : lire l intervalle de la
  première URL de `requests.jsonl` et le comparer à `--interval` (arrêt nommé neuf), ≈ 6 lignes et un cas ; c est la forme de rejeu
  de la question Q-G1-2 de SERIES-BINANCE. Déclencheur : réponse de l orchestrateur à cette question, ou relecture de RECHERCHES.
- **LOOPBACK-SEQUENTIAL-PORTS-1** (neuf ; précise LOOPBACK-BAD-PORT-1 de SERIES-BINANCE) : port 0 attribué en séquence dès 1024 sur
  cet hôte (section 9). Corrigé dans le test de ce lot (correction 2). Dix autres fichiers lient le port 0 sur 127.0.0.1 (recherche de
  `listen(0, "127.0.0.1"`, 18:55Z) : `test/bell-deploy-config.test.ts`, `test/dojo-verify-url.test.ts`, `test/probe-narabi.test.ts`,
  `test/probe-narabi-state.test.ts`, `test/verify-bell.test.ts`, `test/verify-harness-liq.test.ts`, `apps/bell/test/bell-verify.test.ts`,
  `apps/bell/test/helpers/bell-served.ts`, `apps/bell/test/helpers/net-probe.mjs`, `apps/dojo/test/dojo-verify.test.ts` ; pendant
  une phase basse, ils traversent les 19 ports que `fetch` bloque entre 1024 et 10080 : rouge « bad port » possible quand le serveur
  est joint par `fetch` (non mesuré fichier par fichier). Construction : l aide `listen()` de ce lot, partagée (≈ 15 lignes + 1 par
  fichier) ; ou la plage dynamique de l hôte relevée au-dessus de 10080 (`netsh`, acte d administration de l investisseur, hors dépôt :
  demande formée). Déclencheur : premier rouge d oracle dans une phase basse, ou décision de l orchestrateur. Propriétaire :
  orchestrateur.
- **RED-PROOF-CHILD-STDERR-1** (item de SERIES-BINANCE ; son déclencheur, « deuxième mort d enfant », est ATTEINT par K5 en campagne 2) :
  mesure neuve : quand l enfant meurt, le parent ne reçoit rien sur stderr (passage 12 : 0 octet) ; la construction formée (garder
  `r.stderr`) n aurait rien gardé. Construction amendée : sur un enfant mort, rejouer UNE fois le même mutant en `--test-isolation=none`
  (test dans le processus lancé : 40 tués sur 40 mesurés, 0 mort) et garder sa sortie d erreur ; le premier passage reste « non conclu » ;
  ≈ 6 lignes par outil (`scripts/red-proof.mjs`, `scripts/mutants/run.mjs`). Recherche formée : lire la table NTSTATUS de Microsoft
  (0xC0000409) et le chemin d arrêt de Node sous Windows (lecture sur place par l orchestrateur ; réseau interdit à cette mission).
  Propriétaire : orchestrateur (outils du tronc).
- Items de SERIES-BINANCE non touchés par ce lot : BINANCE-BODY-BOUND-1, BINANCE-ABSENT-ROOT-TEST-1, BINANCE-TLS-CA-ENV-1 (la
  discipline réseau et la garde de sortie ne changent pas).

## 15. Questions à l orchestrateur (Q-G1-n)

- **Q-G1-1** : « identique à l octet » en 15m lu comme la section 5 : tout identique sauf la valeur `script_sha256` du manifeste (donc
  la ligne `manifest.json` de `SHA256SUMS`), qui nomme le script par construction. Mesuré : 61 sur 61. Confirmer.
- **Q-G1-2** : exports `INTERVAL` et `STEP_MS` retirés, remplacés par `INTERVALS` (objet gelé) ; aucun autre consommateur.
- **Q-G1-3** : défauts `"15m"` de `parseTime` et `expectedCount` (raison red-proof, section 4) ; les appels internes passent toujours
  l intervalle.
- **Q-G1-4** : message d une heure hors grille en minutes : « not on the 60-minute grid » (1h), « 240-minute » (4h) ; 15m inchangé.
- **Q-G1-5** : test des mauvais arguments modifié par force (son cas `1h` devenait faux) : cas `4h` hors grille (`bad_time`), voisins
  hors liste, liste fermée gelée ; jugé par red-proof, F2P.
- **Q-G1-6** : noms bruts inchangés ; rejeu croisé arrêté à la première bougie ; pages toutes vides : item REPLAY-INTERVAL-BIND-1.
- **Q-G1-7** : H-6 non lue (réseau interdit) : FAITS-BINANCE-INTERVALS-1 avant toute requête 1h ou 4h ; C-5 : RECHERCHES relit ce
  changement avant toute requête.
- **Q-G1-8** : la ligne de `main` ne porte pas l intervalle (inchangée en 15m) ; le manifeste et `missing.json` le portent.
- **Q-G1-9** : après la campagne 1, les lignes d arrêt que `main` imprime sont comparées à l octet par les tests (grille de 15 min
  comprise) : tout changement futur de libellé rougira ces tests. Confirmer que c est voulu.
- **Q-G1-10** : aide `listen()` du test refaite (port aléatoire > 10080 au lieu du port 0 et de 50 essais), hors du périmètre nommé par
  la mission mais nécessaire au vert du fichier sur cet hôte (section 9, campagne 3 et contre-épreuve du 18:55Z). Confirmer.
- **Q-G1-11** : les oracles de SERIES-BINANCE (même aide d origine) rougissent ce fichier pendant toute phase basse de l allocateur ;
  le tronc (`main`, HEAD de `F:/Monark`) ne porte pas ce fichier (lu à 18:55Z) : aucun autre lot n est touché par cette aide.

## 16. `error_origin` proposés (assignés au G7)

- Trous d assertion sur les diagnostics (campagne 1 : M06, M07, M08, M10, M13) : worker G1 de ce lot pour 1h, 4h, la liste gelée et le
  défaut ; pour le texte de la grille de 15 min, latent depuis SERIES-BINANCE, comblé ici.
- Aide `listen()` bornée à 50 essais du port 0 : worker G1 de SERIES-BINANCE (hypothèse d un allocateur non séquentiel) et
  environnement (plage dynamique dès 1024, attribution séquentielle) ; trouvée par la campagne 3, corrigée ici.
- Morts d enfant K5 (campagne 2, passage 12) : environnement ou runtime, cause non attribuée (item RED-PROOF-CHILD-STDERR-1).
- Ligne du manifeste scindée (+ 1 ligne au compte du script) : écart de compte, aucun défaut. Écart 1 (section 8) : worker G1.

## 17. Provenance, conduite, écarts, clôture

- Rédacteur : worker `claude-opus-5-5` (R-1), effort max, instance fraîche. R-20 : aucun commit, add ni stash dans le worktree ni dans
  `F:/Monark`, aucun workflow. **Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`.** Git dans le worktree et dans
  `F:/Monark` en lecture seule (`status`, `diff`, `rev-parse`, `show`, `log`, `cat-file`, `branch --contains`), en
  `--no-optional-locks` après l écart 1 ; `clone --no-local` et `checkout --detach` dans mes clones `F:/tmp/dojo/recint/mclone1` à
  `mclone4`, sans commit ; red-proof, oracle et outil de mutants font leurs clones et leurs gels dans leurs propres dossiers.
- Réseau : aucun hors 127.0.0.1 (tests et sondes) ; aucun connecteur ni outil de recherche distant appelé. C: : une lecture (doc 06 du
  référentiel, sha256 `55559227…60f5`), rien d écrit. Aucune série enregistrée lue.
- Écritures dans le worktree : les quatre fichiers du lot seuls (`git status --porcelain` : trois `M`, un `??`, 19:08:48Z). Aucune
  jonction posée par moi ; aucun `node_modules` dans mes clones ni dans ceux de l outil de mutants (lu entre 19:02Z et 19:08:48Z) ; `F:/Monark/node_modules` :
  220 entrées et 11 `@monark` à 18:31:29Z et à 19:08:48Z.
- Advisor intégré : deux consultations, avant le code (vers 18:13Z) et après les sections 9 à 16, avant la clôture et l oracle complet
  (vers 19:05Z). Conseil, jamais verdict ; chaque point vérifié sur pièce.
- **Écarts consignés** :
  1. Section 8 : premier `git status` sans `--no-optional-locks`.
  2. Plan de la section 7 non suivi sur un point : l en-tête du test (l.1, « lot SERIES-BINANCE ») n a pas été changé ; il ne l est plus
     (le changer invaliderait red-proof 3, la campagne 4 et la voie statique, qui citent le test `9fb83347…f2ae`).
  3. Preuves remplacées, gardées en place : `evidence/diff15m-1.json` et `evidence/diff15m-counter-*.json` (première version de la
     sonde : chemins Windows et lignes imprimées échappées, donc barres inverses et lignes > 160) → `diff15m-2*` ; `evidence/ports-2.txt`
     (octet CP850 0x82 de `netsh`, ligne JSON > 160) → `ports-3.txt` ; `tmp/journal-end-draft.md` (deux lignes > 160 ; brouillon
     remplacé par ce journal). `evidence/badports.json` réécrit en JSON multiligne avant toute citation.
  4. Barres inverses dans des LIGNES DE COMMANDE seulement (motifs de `grep`, `sed`, `node -e`), jamais dans un fichier écrit ;
     `k5repro2.mjs` et `ports2.mjs`, d abord produits par `sed`, avaient une ligne > 160 : arrêtés par la garde avant usage, réécrits.
  5. Captures de sortie des outils du tronc gardées telles quelles (`evidence/mutants-run*.txt`, `red-proof-*.txt`,
     `oracle-static-*.txt`, TAP) : lignes longues et chemins Windows écrits par ces outils, non par moi.
  6. Seize faux `.git` laissés par la sonde différentielle (scénarios de sortie inutilisable : `o_repo/.git` dossier vide, `o_wt/.git`
     fichier) sous `F:/tmp/dojo/recint/diff-*/` ; hors de tout chemin de sortie des tests ; aucun `rm`.
- **Clôture** : ce journal est CLOS ici, avant l oracle complet, et n est plus touché ensuite. Oracle : `node
  F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-rec --base f46c454f --key SERIES-INTERVALS`, en arrière-plan, verrou et
  C-V-4 relus au lancement, jamais interrompu, aucune course de ma part pendant lui ; son enregistrement est cité dans
  `F:/tmp/dojo/recint-deliver/REPONSE.md`. Clones et preuves laissés en place (aucun `rm`).
