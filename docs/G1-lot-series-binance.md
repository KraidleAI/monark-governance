claude-opus-5-5

# G1 — lot SERIES-BINANCE : enregistreur des bougies 15 min de Binance (BTCUSDT, ETHUSDT, BNBUSDT, SOLUSDT), hors ligne en test

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact déclaré par le harnais de la session), effort max, instance fraîche.
- **Mission** : `F:/tmp/marche/mission-impl-series-binance.md` (63 l., 17 882 octets), sha256
  `c70e5b968979dc1ed021d21038255cd115a9b02e2017dc3c1c00ebd0d55bee46`, recalculé AVANT lecture (première commande de la session,
  avant 01:04:07Z), égal au reçu `F:/tmp/marche/mission-impl-series-binance.recu.json` (verdict vert, douze codes à 0, `repo` = ce
  worktree, `base` = `head` = `c6ccb233`). Règles `docs/methode/REGLES-MISSION.md` sha256 `64700025…2bba` = tronc
  `F:/Monark/docs/methode/REGLES-MISSION.md` (01:13:39Z), lues en entier (insérées dans la mission).
- **Amendement de l orchestrateur** reçu par message pendant la lecture (section 3) : SOLUSDT ajouté à la liste fermée. Le sha256 de la
  mission ne couvre donc plus tout le bref (Q-G1-1).
- **Base** : worktree `F:/Monark-wt-series-binance`, branche `lot/series-binance`, HEAD `c6ccb233b85afce1e33e5f0c9683e43c8c0c9051`,
  `git status --porcelain` vide à 01:04:07Z et à 01:20:24Z. Aucun git écrivant, aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun
  `--write-tree`, aucun réseau (sondes sur 127.0.0.1 seulement), rien sur C: (TEMP, TMP, TMPDIR sous `F:/tmp/marche/tmp`).
- Outils du tronc aux sha256 de la mission (01:13Z) : `scripts/oracle/run.mjs` `f22b9045…`, `scripts/oracle/r25.mjs` `4d0544df…`,
  `scripts/red-proof.mjs` `6579b550…`, `scripts/mission/lint.mjs` `4d1383c8…`, `scripts/mission/launch.mjs` `fb6c277f…` (worktree et
  tronc égaux pour les trois premiers) ; `scripts/mutants/run.mjs` du tronc `2606e7da…3b19`.

## 0. Horaires (`date -u`)

- 01:04:07Z ouverture (HEAD, branche, status) ; 01:13:39Z sha256 des entrées ; 01:13:43Z C-V-4 ; 01:13:57Z et 01:14:03Z sondes locales
  (section 4) ; 01:19:59Z C-V-4 (outil `.ps1`) ; ce journal, sections 0 à 6, écrit à partir de 01:20:51Z, AVANT toute ligne de code.

## 1. C-V-4 et verrou d hôte

- 01:13:43Z : verrou `F:/tmp/oracle-lock` ABSENT (libre) ; 9 processus `node` ; 14 170 Mo physiques et 29 164 Mo virtuels libres
  (`Get-CimInstance Win32_OperatingSystem`). 01:19:59Z (outil `F:/tmp/marche/tools/cv4.ps1`, sans échappement) : 9 `node`, 14 805 Mo
  physiques, 29 014 Mo virtuels.

## 2. Entrées lues en entier, dans l ordre de la mission (sha256 et lignes à 01:13:39Z, worktree au `c6ccb233`)

| Entrée | l. | sha256 |
|---|---|---|
| `docs/marche/FAITS-conditions-series-2026-10-01.md` | 67 | `0c2ec753941e6d9ca24d49ae41838fb10df375e281f897b88846d93a2dfb6278` |
| `scripts/record-usde-calib.mjs` | 191 | `ab8aaf5967e5b1e202df9e92577e4379c527fc12ade8760df33c65efbe134a01` |
| `scripts/record-usde-calib.d.mts` | 35 | `2b3c0428c33a3aabef087d2b2ae93465ccfc54a275fa31f82a4379fa435f68eb` |
| `test/record-usde-calib.test.ts` | 50 | `c7b21b0bf58fb14976ef3096d568cf2342d1c761da5ce5ed8bd71e0de3909838` |
| `package.json` (scripts `test`, `typecheck`, `lint`) | 33 | `d7a429e1afb7618b5b037f3923b01fb35fca5f76cdc6b5a49bfb20495b059700` |
| `F:/Monark/scripts/red-proof.mjs` (`parseKiller`, `judgedOf`, `fire`) | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` |

- Lectures complémentaires (extraits cités où ils servent) : `F:/Monark/scripts/oracle/run.mjs`, `r25.mjs`, `lock.mjs` (portes dérivées
  de `ci.yml`, verrou, `r25`) ; en-tête de `F:/Monark/scripts/mutants/run.mjs` (verdict « tué » = `ERR_ASSERTION`) ; portes du worktree
  `scripts/lang-gate.mjs` (liste `FR_WORDS`, balayage de `scripts/` et `test/`), `scripts/lint-ratchet.mjs` et `lint-ratchet.json`
  (plafond 69), `scripts/export-public.mjs` (liste blanche : ni `scripts/record-binance-klines.*` ni `test/` racine n y sont),
  `scripts/grep-forbidden.mjs` (portées : ni `scripts/` ni `test/` racine), `enforcement/lint-model-pinning.sh` (`.claude/` seul),
  `eslint.config.mjs`, `tsconfig.json`, `test/byte-guard.test.ts` (classes TAB, CTRL, `F:` suivi de deux espaces) ;
  `test/dojo-verify-url.test.ts` (serveur de bouclage, précédent) ; `docs/dojo/FAITS-node-fetch-tls-2026-09-30.md`
  (sha256 `dc31cbee1bb3d6301481d04bd18bbe68e24a1ee618c04ee45058b2758e8ad6f2`, F-1, F-5, F-6) ;
  `docs/biblio/ukemi-modeL/scripts-mesure/m2b/m2b1-hour-share.mjs` et `out/m2b1-hour-share.json` (mesure réelle du 2026-09-19 sur
  `api.binance.com/api/v3/klines`, section 5) ; journal précédent `docs/G1-lot-dojo-pr4c1b.md` (forme du compte et des sections).

## 3. Amendement daté (orchestrateur, à la demande du fondateur)

- **Reçu** par message entre 01:04:07Z et 01:13:39Z (heures `date -u` lues avant et après ; le message dit « vers 01:10 UTC »).
  Verbatim, sans les puces d origine : « ajoute SOLUSDT (Solana) à la liste fermée des symboles. La liste devient BTCUSDT, ETHUSDT,
  BNBUSDT et SOLUSDT, dans le code et dans les tests (un test qui refuse un symbole hors liste reste exigé). Mêmes conditions que pour
  les trois autres : même point d accès Binance, même plage, 70 080 bougies attendues. Toujours AUCUNE requête réseau réelle. Inscris
  cet amendement daté dans ton journal `docs/G1-lot-series-binance.md`, avec son effet sur le compte ascendant. »
- **Effet sur le compte ascendant** (section 6) : script 0 ligne (le symbole entre dans la ligne de la liste fermée) ; tests + 3 lignes
  (acceptation des quatre symboles et 70 080 attendues pour chacun sur la plage du fondateur ; le refus d un symbole hors liste reste).
- Conditions C-5 inchangées : les FAITS du 2026-10-01 couvrent Binance par ses conditions générales et ses conditions d API, sans
  distinction de symbole ; aucune lecture nouvelle n est requise pour SOLUSDT (à confirmer par l orchestrateur : Q-G1-1).

## 4. Mesures locales avant le code (Node v24.15.0, undici 7.24.4 ; sondes `F:/tmp/marche/tmp/probes/`, serveur 127.0.0.1)

- `probe-redirect.mjs` (01:13:57Z) : `fetch(url, { redirect: "manual" })` rend la réponse 302 elle-même (`status` 302, `location`
  lisible, `redirected` faux, un seul passage au serveur) ; `redirect: "error"` rejette `TypeError("fetch failed")`, cause
  « unexpected redirect » ; `Headers.get` est insensible à la casse (`X-MBX-USED-WEIGHT-1M`, `Retry-After`).
- 01:14:03Z : `--use-env-proxy` passé en ligne de commande figure dans `process.execArgv` ; passé par `NODE_OPTIONS`, il n y figure PAS
  (seulement dans `process.env.NODE_OPTIONS`) ; `process.allowedNodeEnvironmentFlags.has("--use-env-proxy")` vrai. La garde doit lire
  les deux.
- Aucun ancêtre `.git` pour `F:/`, `F:/tmp`, `F:/tmp/marche` (01:13:39Z) : les sorties de test sous TEMP sont hors de tout arbre git.

## 5. Hypothèses sur le point d accès, NON lues à la source (réseau interdit à cette mission), et demande formée

Évidence locale de première main : `out/m2b1-hour-share.json` (mesure réelle du 2026-09-19, sha256 du corps `4d673e95…9b63`) donne
`[0]` = heure d ouverture égale à `startTime`, `[6]` = heure de fermeture égale à ouverture + 3 599 999 pour `1h`, `[5]` et `[7]` des
volumes ; la requête `startTime`/`endTime`/`limit=60` y a rendu 60 bougies. Le reste est NON LU :

- **H-1** forme d une ligne : 12 éléments ; `[0]`, `[6]`, `[8]` entiers ; `[1]` à `[5]`, `[7]`, `[9]`, `[10]` chaînes décimales
  (ouverture, haut, bas, clôture, volume, volume en devise de cotation, volumes acheteurs) ; `[11]` chaîne inutilisée.
- **H-2** filtre `startTime <= openTime <= endTime`, ordre croissant, au plus `limit` lignes, `limit` maximal 1000.
- **H-3** 429 et 418 portent `Retry-After` (418 : bannissement d adresse après des 429) ; **H-4** 451 = lieu restreint ;
  **H-5** en-tête `x-mbx-used-weight-1m`.
- Conséquence de conception : la garde de forme est STRICTE ; une forme réelle différente arrête l enregistrement (`row_shape`) à la
  première page, jamais une lecture silencieusement fausse ; chaque hypothèse est épinglée par un test nommé (section 9).
- **Demande formée (orchestrateur, lecture sur place, avant la relecture de RECHERCHES et avant toute requête réelle)** : lire la
  documentation de l API Spot de Binance, pages « Market data endpoints / Kline/Candlestick data », « General API information /
  LIMITS » et « HTTP Return Codes » ; écrire un fichier FAITS daté ; confirmer ou amender H-1 à H-5 et, s il le faut, la garde de forme
  et les noms d arrêt. Usage prévu : condition préalable du premier appel réseau. Tentative faite ici : aucune (réseau interdit).

## 6. Compte ascendant par fichier, écrit AVANT toute ligne de code (tâche 1)

Unité : insertions + suppressions comptées par R-25 (pathspec du job CI ; `docs/**/*.md` exclus : ce journal est hors compte). Borne
1 150 (porte CI 1 205). Arrêt de la mission : `r25()` mesuré > 1 150, ou solde 1 150 − `r25()` < 10 : arrêt et signalement, jamais
de compaction.

| Fichier | Ascendantes | Détail |
|---|---|---|
| `scripts/record-binance-klines.mjs` (neuf) | 260 | détail sous le tableau |
| `scripts/record-binance-klines.d.mts` (neuf) | 50 | en-tête 6, constantes 10, types d entrée et de manifeste 24, signatures 10 |
| `test/record-binance-klines.test.ts` (neuf) | 360 | en-tête et imports 22, serveur imité, aiguillage de `fetch` et piège 60, aides 18, douze tests 260 |
| Amendement SOLUSDT (section 3) | 3 | script 0, tests 3 |
| **Total** | **673** | |

- Détail du script (260) : en-tête 22, imports et constantes 20, arrêt nommé 8, arguments et temps 28, gardes d environnement et de
  sortie 22, page réelle 30, page rejouée 10, garde de ligne 10, boucle 25, normalisation 14, écriture 25, `run` 25, CLI 14.
- Prévision : 673 × 1,22 à 1,32 (dérive mesurée aux G1 de PR-4c-1a et 1b) ≈ 820 à 890, solde ≈ 260 sous 1 150 : le G1 continue.

## 7. Conception décidée avant le code (chaque point vérifiable dans les fichiers ; les choix propres au G1 portent leur Q-n)

- **Un script, zéro dépendance** : `scripts/record-binance-klines.mjs` (+ `.d.mts` pour le test typé), garde d exécution de
  `record-usde-calib.mjs` (l import par le test n exécute rien). Point d accès en dur `https://api.binance.com/api/v3/klines` ; liste
  d hôtes fermée vérifiée avant chaque requête (`host_refused`) ; `redirect: "manual"` et arrêt `redirect_refused` sur tout 3xx
  (mesure de la section 4) ; aucun en-tête posé (donc aucun en-tête d authentification) ; délai de 30 s par requête.
- **Couture de test** : `run(argv, io)` et `main(argv, io)` reçoivent `fetch`, `sleep`, l horloge, l environnement et `execArgv` de
  l appelant (les tests) ; la ligne de commande et les variables d environnement ne le peuvent jamais. Le `fetch` par défaut est lu À
  L APPEL (paramètre), pas au chargement : le piège posé par le test sur `globalThis.fetch` reste actif.
- **Garde d environnement** (avant toute requête) : `proxy_refused` si `NODE_USE_ENV_PROXY` est non vide ou si `--use-env-proxy`
  figure dans `execArgv` ou `NODE_OPTIONS` (FAITS F-5 et section 4) ; `tls_unverified` si `NODE_TLS_REJECT_UNAUTHORIZED` vaut `0`
  (FAITS F-1 ; ajout du G1, Q-G1-4).
- **Garde de sortie** (avant toute requête) : `out_not_empty` si `--out` existe et n est pas un dossier vide ; `out_in_git_tree` si
  un ancêtre (chemin donné, puis chemin réel du plus proche ancêtre existant) contient `.git`, dossier OU fichier (forme worktree).
- **Arguments** : `--symbol` dans {BTCUSDT, ETHUSDT, BNBUSDT, SOLUSDT}, `--interval 15m`, `--start` et `--end` en `AAAA-MM-JJTHH:MMZ`
  ou `...:00Z`, date réelle (aller-retour), sur la grille de 15 min (ajout du G1 : sans quoi « attendu » et « manquant » sont ambigus),
  `--end` > `--start`, `--end` <= maintenant (`end_in_future`, ajout du G1 : une bougie ouverte n est pas reproductible) ; drapeau
  inconnu, sans valeur ou répété : `usage` (Q-G1-3).
- **Pagination** de la mission ; fin de boucle aussi sur une page VIDE (aucune bougie jusqu à la fin : le reste de la grille est
  déclaré manquant) ; arrêt `cursor_not_advancing` si le curseur suivant ne dépasse pas le courant (ajout du G1, Q-G1-2) ; au plus
  100 requêtes, la 101e n est jamais faite (`too_many_pages`).
- **Arrêts nommés** (liste fermée dans le code, rien d écrit en sortie normalisée) : statut 429 `rate_limited` et 418 `ip_banned`
  (avec `Retry-After`), 451 `restricted_location`, 5xx `server_error`, 3xx `redirect_refused`, autre statut `http_status`, échec de
  transport `network_error`, corps non JSON `body_not_json`, JSON qui n est pas une liste `body_not_klines`, ligne hors forme H-1
  `row_shape`, `off_grid`, `close_time`, `out_of_range`, `duplicate_conflict`, `cursor_not_advancing`, `too_many_pages` ; en rejeu
  `raw_page_missing` et `raw_page_unused`. Aucune relance, aucun contournement.
- **Sorties** : `raw/<symbol>-<startTime>.json` (corps 200 tels que reçus, écrits AVANT leur validation) et `requests.jsonl` (une
  ligne par réponse, tout statut : URL, statut, heure UTC, octets, sha256 du corps, en-têtes `date`, `x-mbx-used-weight-1m`,
  `retry-after`) au fil de l eau ; le CSV, `missing.json`, `manifest.json` et `SHA256SUMS` seulement après la dernière page, toutes
  gardes passées. CSV : en-tête fixe de 12 colonnes (`open_time_utc`, `open_time_ms`, puis `[1]` à `[10]` tels que reçus) ;
  `[11]` reste dans `raw/` ; doublon identique (12 champs) retiré et compté. `SHA256SUMS` au format de `sha256sum -c` (deux espaces).
  Manifeste : mode, plateforme `binance`, point d accès, symbole, intervalle, début, fin exclue, attendu, lignes, manquantes, doublons
  retirés, pages, première et dernière bougie, sha256 du CSV et du script, version de Node, heures de début et de fin,
  `redistributable: false` et renvoi aux FAITS des conditions.
- **Rejeu** `--from-raw <dossier>` : mêmes paramètres en ligne de commande ; seul `<dossier>/raw/` est lu, page par page le long de la
  MÊME chaîne de curseurs (même boucle, même code de normalisation : mêmes octets du CSV et de `missing.json`) ; ni `requests.jsonl` ni
  l ancien manifeste (Q-G1-2). Garde de sortie identique ; aucune garde d environnement (aucune requête).
- **Codes de sortie** : 0 écrit, 1 arrêt nommé, 2 `usage` ; une ligne JSON sur la sortie standard (succès) ou d erreur (arrêt).

<!-- Fin des sections écrites AVANT le code (instantané `F:/tmp/marche/tools/journal-precode-0122.md`, sha256 99ee8f2e…9e69,
     01:22:13Z). Les sections 8 à 16 sont écrites après le gel du code, à partir de 02:04:41Z ; les sections 0 à 7 ne sont pas retouchées. -->

## 8. Exécutions, incidents et corrections (ordre chronologique ; TEMP, TMP, TMPDIR = `F:/tmp/marche/tmp` ; verrou relu libre avant chaque course)

- 01:25:32Z script écrit (outil Write : le fichier dépasse la borne Bash de 6 Ko) ; 01:26:27Z garde d octets, `node --check`, `lang-gate`
  sur le fichier : propres. 01:26:41Z sonde `probe-run.mjs` (127.0.0.1) : 1 006 lignes, 1 manquante, 2 pages, une pause de 500 ms, rejeu
  `--from-raw` aux mêmes sha256 du CSV et de `missing.json`. `.d.mts` écrit ensuite, test à partir de 01:29:32Z ; 01:31:10Z : 12/12.
- 01:32:02Z clone `F:/tmp/marche/clone-verts` (`--no-local`, `checkout --detach c6ccb233`, quatre fichiers copiés à sha256 égal, commit de
  gel DANS ce clone seulement) ; `node_modules` par `mk-nm.ps1` : 220 entrées, 11 `@monark`, 0 échec. Six portes à 0 (01:32-01:33Z) ;
  aperçu R-25 644 ; 01:33:38Z test du lot et `byte-guard` : 28/28.
- **Incident 1, `red-proof` REFUSÉ** (01:33:49Z, `F:/tmp/marche/f2p/RED-PROOF.json` `504e37e1…352f`, `gel.tap` `3c5e8d14…175d`) :
  `binance_klines_stops_on_http_refusals` « other-fail » au gel (ENOENT de `requests.jsonl`, cas 429). Cinq passages locaux verts ;
  reproduit 1 fois sur 18 sous charge (`F:/tmp/marche/stress/s2-3.tap` `b0aa43e4…d088` : cas `body_not_klines` rendu `network_error`,
  0 requête servie). Cause lue par sonde (01:38:03Z) : `fetch failed`, cause « bad port », sur les ports 1719, 2049, 3659, 6566, 6665,
  6667. **Cause établie à la source** [lu, source du runtime] : Node v24.15.0 embarque undici 7.24.4 (`internal/deps/undici/undici`, lu
  par `process.binding("natives")`) ; `badPorts` y compte 82 ports, maximum 10080 ; `requestBadPort(request) === "blocked"` rend
  `makeNetworkError("bad port")` ; reproduction déterministe (`F:/tmp/marche/logs/badport-evidence.txt` `e4f15d1c…d6b0`, outil
  `F:/tmp/marche/tools/badport-evidence.mjs` `311f4364…d6ce`, trois passages identiques) : serveur lié à 127.0.0.1:1719, `fetch`
  « bad port » et 0 requête vue, `node:http` statut 200. Le port 0 de l OS sur cet hôte traverse des phases de ports bas
  (`F:/tmp/marche/logs/churn-load.txt` `edb56b03…a352` : 1 287 à 1 697 ports bas écartés par processus, 0 échec avec la règle).
  **Correction, test seul** : `listen()` rend tout port <= 10080 et en prend un autre (borne 50 essais) ; `logOf` total (plus d ENOENT).
  Après correction : 30/30 passages en six flux parallèles (`F:/tmp/marche/stress2/`, 360 exécutions de tests).
- **Renforcement** (branches non éprouvées repérées à la relecture, avant toute campagne) : `[1]` à `[11]` hors forme (13 champs, entier
  négatif, décimal à exposant, `[11]` numérique), `closeTime` en avance, jonction vers un dépôt (chemin résolu), `--use-env-proxy=valeur`,
  rejeu sous `NODE_USE_ENV_PROXY` (aucune garde d environnement en rejeu), dates lues avec indulgence par V8 (mesure 01:43:10Z :
  `2025-02-30` donne le 2 mars, `24:00` le lendemain) qui ne tombent QUE par l aller-retour, valeur de drapeau commençant par `--`.
  `red-proof` sur cet état intermédiaire : OK (`F:/tmp/marche/f2p2/RED-PROOF.json` `bafb3a92…d421`).
- **Campagne 1** (outil du tronc `2606e7da…3b19`, `--repo F:/tmp/marche/mclone`, table `F:/tmp/marche/mutants/table.mjs`, 47 lignes, plus
  les 12 tueurs ; 01:46:19Z → 01:48:39Z) : 58/59 tués, 0 survivant, `M44` non conclu (`run1/RESULTS.json` `1ecb6ccf…cf51`,
  `RESULTS.txt` `27acc0b6…eda0`, lu en entier ; TAP de M44 : ENOENT du manifeste lu AVANT l assertion du code). Correction : chaque
  lecture de sortie suit l assertion du code ; lecteurs totaux (`text`, `bytes`, `jsonOf`, `manifestOf`, `rawNames`).
- **Défaut du script trouvé à la relecture** (avant le gel) : l.103, la boucle vers l ancêtre existant ne finissait pas si la racine
  elle-même manque (`--out Z:/x` sans lecteur `Z:`) : attente infinie avant toute requête. Correction en place (mêmes lignes) ; sonde :
  `guardOut("Q:/no-drive/series")` rend la main (`Q:/` absent, 01:51Z). Aucun test portable (section 13).
- Gel 2 : porte `lint` ROUGE (01:54Z, `no-unnecessary-type-assertion` au test l.164, introduit par les lecteurs totaux) ; correction :
  littéral attendu typé `MissingDoc`. **Gel 3 = état livré** (script `0a1ae564…c71f`, `.d.mts` `223cb52e…eef6`, test
  `2853c7bf…5534`) : clone `clone-verts` HEAD `607a4e8c`, arbre `479a51c1`.
- **Preuves finales sur le gel 3** (journaux sous `F:/tmp/marche/logs/final/`) : six portes à 0 (01:55:38Z → 01:56:38Z ; `typecheck` et
  `lint` sans sortie, `e3b0c442…b855` ; `lint-ratchet` 69/69 `bf35ba72…` ; `lang-gate` `b7247d5b…` ; `export-check` `08affca0…` ;
  `gate-vocab` 328 fichiers `fef52580…`) ; `r25` VERT (`r25.txt` `b88f3987…0d76`) ; test du lot et `byte-guard` 28/28
  (`verts-lot.tap` `6177b5da…257e`).
- **Incident 2, `red-proof` REFUSÉ** (01:56:59Z, `f2p3/RED-PROOF.json` `4187abf0…c1ad`) : 12 jugés verts au gel, 11 tueurs tués, le
  tueur `:173 ROR` « invalid » : processus enfant mort, code `3221226505` (`0xC0000409`, arrêt rapide de Windows) après 297 ms
  (`f2p3/killer-4.tap` `2230d856…a52c`). Non conclu, jamais compté tué. Reproduction : 20 passages séquentiels et 40 sous charge du même
  mutant, même drapeaux : 60 échecs par assertion, 0 mort ; 20 passages de référence verts. Cause inconnue (sortie d erreur de l enfant
  non gardée par l outil) : item RED-PROOF-CHILD-STDERR-1 (section 13). Relance sur le même arbre (01:58:57Z) : **`red-proof` OK**,
  12 jugés `new-module`, 12 tueurs sur 12 tués (`F:/tmp/marche/f2p4/RED-PROOF.json` `cf667386…ed4ee`).
- **Campagne 2, qui fait foi** (`--repo F:/tmp/marche/mclone2`, quatre fichiers du gel 3 copiés à sha256 égal ; `held` nul et C-V-4 à
  01:59:44Z : 12 `node`, 13 804 Mo physiques, 30 648 Mo virtuels ; table `a08ea125…ea43`) : 01:59:51Z → 02:02:21Z, **59/59 tués**
  (47 de la table, 12 tueurs), 0 survivant, 0 non conclu, 0 ancre perdue, 60 restaurations vérifiées, sortie 0 ;
  `F:/tmp/marche/mutants/run2/RESULTS.json` **`b130f2268994d2a501f9055889a35a6b07b6d762497630cb59c9f0725681d617`**, `RESULTS.txt`
  `7fce9b20…3f6e` lu en entier. `M18` (protocole de l hôte) écarté de la table comme équivalent (l URL est construite en `https:`).

## 9. Compte mesuré contre compte ascendant (complète la section 6, qui reste telle qu écrite avant le code)

| Fichier | Ascendantes | Mesurées (`r25` du gel 3) |
|---|---|---|
| `scripts/record-binance-klines.mjs` | 260 | 249 |
| `scripts/record-binance-klines.d.mts` | 50 | 78 (un champ par ligne dans les interfaces) |
| `test/record-binance-klines.test.ts` | 363 (360 + 3 de l amendement) | 357 (première version 317 : + 40 pour « bad port », lecteurs totaux, renforcement) |
| **Total** | **673** | **684** (STAT 684 + 0 ; CONTENT_STAT 0) |

- 684 / 673 = × 1,02 ; ≤ 1 150 (solde 466) ≤ 1 205. Le compte officiel est la porte `r25` de l oracle (cité dans `REPONSE.md`).

## 10. Décision → fichier → test → mutants (S = `scripts/record-binance-klines.mjs` ; K = tueur, M = table)

| Décision (mission) | Fichier, lieu | Test | Tués |
|---|---|---|---|
| Point d accès en dur, hôtes fermés, aucun en-tête | S l.25-26, 114-116, 120 | `binance_klines_pages_a_full_page_then_a_partial_one` | K1, M17 |
| Pagination : curseur, fin − 1 ms, 1 000, pause ≥ 500 ms | S l.114, 161-179 | même test | K1, M01, M35, M38 |
| Plus de 100 pages | S l.32, 162 | `binance_klines_stops_after_one_hundred_pages` | K6, M02 |
| 429 et 418 (`Retry-After`), 451, 5xx, 3xx, autre statut | S l.120, 128-134 | `binance_klines_stops_on_http_refusals` | K4, M19-M26 |
| Corps non JSON, forme, grille, `closeTime`, plage | S l.41, 147-154, 167-168 | `binance_klines_stops_on_bad_bodies_and_candles` | K5, M03, M29-M34 |
| Curseur qui n avance pas (G1, Q-G1-2) | S l.176-178 | même test | M37, M39 |
| Doublon identique retiré, trous déclarés | S l.169-175, 189-190 | `binance_klines_removes_an_identical_duplicate_and_declares_gaps` | K2, M36, M40 |
| Doublon différent refusé | S l.173-174 | `binance_klines_refuses_a_conflicting_duplicate` | K3 |
| Chaînes décimales à l octet, octets bruts gardés | S l.135, 187-188 | `binance_klines_keeps_decimal_strings_byte_for_byte` | K9, M27, M41 |
| Sortie absente ou vide, hors arbre git | S l.99-110 | `binance_klines_refuses_an_unusable_output_directory` | K7, M14-M16 |
| Aucun mandataire ; TLS vérifié (G1, Q-G1-4) | S l.91-97, 221 | `binance_klines_refuses_a_proxy_or_an_unverified_tls` | K8, M10-M13 |
| Rejeu `--from-raw` aux mêmes octets | S l.139-145, 227-231 | `binance_klines_replays_raw_to_the_same_bytes` | K10, M28, M45-M47 |
| 70 080 attendues, quatre symboles (amendement) | S l.27, 88-89, 219 | `binance_klines_expects_70080_candles_on_the_founder_range` | K11, M44 |
| Liste fermée, intervalle, temps, ligne de commande | S l.62-86, 245 | `binance_klines_refuses_bad_arguments` | K12, M04-M09, M48 |
| Sorties : `requests.jsonl`, manifeste, `SHA256SUMS` | S l.125-129, 194-212 | `binance_klines_pages_a_full_page_then_a_partial_one` | M20, M42, M43 |

- **Hypothèses → tests** : H-1 (forme) épinglée par `binance_klines_stops_on_bad_bodies_and_candles` (huit formes refusées) et par la
  ligne attendue du CSV de `binance_klines_pages_a_full_page_then_a_partial_one` ; H-2 (filtre, ordre, `limit`) par le serveur imité de
  tous les tests (fonction `endpoint`) ; H-3 et H-4 par `binance_klines_stops_on_http_refusals` ; H-5 par le journal des requêtes de
  `binance_klines_pages_a_full_page_then_a_partial_one`. Ces tests prouvent le comportement de l enregistreur SOUS l hypothèse ; la
  conformité du vrai point d accès reste à lire (demande formée, section 5).
- Review Focus de la mission : 451, 429, 418 (un seul passage au serveur, jamais de relance) ; chevauchement et saut ; décimales longues
  et zéros finaux ; sortie dans un dépôt ou non vide, refusée avant toute requête : quatre classes couvertes par les tests ci-dessus.

## 11. Portes et oracle

- Six portes du gel 3 à 0 et `r25` vert (section 8). Oracle de l outil du tronc lancé APRÈS la clôture de ce journal (section 16) ; son
  enregistrement (chemin, sha256, portes, tests, compte `r25` officiel) est cité dans `F:/tmp/marche-deliver/REPONSE.md`.

## 12. MAST (risques résiduels)

- FM-3.3 (vérification incorrecte) : les tests prouvent l enregistreur contre une imitation ; la forme réelle est NON LUE (H-1 à H-5) et
  la garde stricte arrête au premier écart (`row_shape`, statuts nommés) au lieu de lire faux.
- FM-1.5 (condition de fin ignorée) : aucune requête réelle ; le premier appel attend la relecture de RECHERCHES et la lecture formée.
- FM-2.4 (rétention) : chaque arrêt laisse `raw/` et `requests.jsonl` lisibles ; les sorties normalisées n existent que complètes.

## 13. Items formés (aucun « dû » nu ; déclencheur et prix pour chacun)

- **FAITS-BINANCE-KLINES-1** : demande formée de la section 5 (lecture sur place par l orchestrateur des pages « Kline/Candlestick
  data », « LIMITS », « HTTP Return Codes » de la documentation Spot de Binance ; FAITS daté ; H-1 à H-5 confirmées ou amendées).
  Déclencheur : avant la relecture de RECHERCHES et avant toute requête réelle. Prix : une lecture ; au plus quelques lignes de garde.
- **LOOPBACK-BAD-PORT-1** : d autres tests du dépôt lient un serveur de bouclage au port 0 et le joignent par `fetch` ou par une CLI
  qui l utilise ; CANDIDATS, non mesurés un à un : `test/dojo-verify-url.test.ts`, `test/probe-narabi.test.ts`,
  `test/probe-narabi-state.test.ts`, `test/verify-bell.test.ts`, `test/verify-harness-liq.test.ts`, `test/bell-deploy-config.test.ts`,
  `apps/bell/test/bell-verify.test.ts`, `apps/dojo/test/dojo-verify.test.ts`. Construction : une aide partagée `listen()` (celle de ce
  lot, port > 10080), ≈ 10 lignes plus une ligne par fichier. Déclencheur : premier rouge « bad port » ou prochain lot qui touche ces
  tests. Propriétaire : orchestrateur.
- **BINANCE-BODY-BOUND-1** : le corps d une réponse est lu en entier sans borne (`arrayBuffer`). Construction : lecture en flux avec
  borne (par exemple 8 Mio, une page de 1 000 bougies en fait ≈ 0,2 Mo), arrêt `body_too_large` et annulation du corps (FAITS F-6),
  ≈ 8 lignes et un test. Déclencheur : relecture de RECHERCHES (à décider : avant ou après le premier appel).
- **BINANCE-ABSENT-ROOT-TEST-1** : la fin de boucle sur racine absente (section 8) n est prouvée que par sonde : sous POSIX la racine
  existe toujours, sous Windows aucun lecteur absent n est garanti, et le mutant qui la retire tourne sans fin (non conclu, jamais tué).
  Construction : test Windows seul cherchant une lettre libre, ≈ 6 lignes. Déclencheur : décision de l orchestrateur.
- **BINANCE-TLS-CA-ENV-1** : `NODE_EXTRA_CA_CERTS`, `NODE_USE_SYSTEM_CA`, `--use-openssl-ca` avec `SSL_CERT_*`, et les préchargements
  `--import` / `--require` ÉTENDENT la confiance ou remplacent `fetch` sans être refusés (FAITS F-2 à F-4 ; G2 de PR-1b-4). Construction :
  les refuser ou les déclarer au manifeste, ≈ 3 lignes et un cas de test. Déclencheur : relecture de RECHERCHES.
- **RED-PROOF-CHILD-STDERR-1** : l outil du tronc `red-proof` ne garde pas la sortie d erreur d un enfant mort (incident 2, cause
  inconnue). Construction : écrire `r.stderr` à côté de `killer-<n>.tap`, ≈ 2 lignes de l outil. Déclencheur : deuxième mort d enfant.

## 14. Questions à l orchestrateur (Q-G1-n)

- **Q-G1-1** : l amendement SOLUSDT est arrivé par message, hors du sha256 de la mission ; appliqué (section 3). SOLUSDT est-il couvert
  par les FAITS du 2026-10-01 sans lecture nouvelle (conditions générales et d API, sans distinction de symbole) ? Confirmer.
- **Q-G1-2** : rejeu : paramètres en ligne de commande, `<dossier>/raw/` seul lu le long de la même chaîne de curseurs ; autre forme :
  lire les paramètres et le sha256 de chaque page dans `requests.jsonl` (+ ≈ 10 lignes). Page vide = fin ; curseur immobile = arrêt.
- **Q-G1-3** : ajouts du G1 : grille de 15 min pour `--start` et `--end`, `end_in_future`, ligne de commande stricte. Confirmer.
- **Q-G1-4** : ajout `tls_unverified` (FAITS F-1) ; les variables qui étendent la confiance ne sont pas refusées (item
  BINANCE-TLS-CA-ENV-1). Confirmer ou ordonner.
- **Q-G1-5** : le CSV porte `[1]` à `[10]` ; `[11]` (inutilisé, H-1) reste dans `raw/` ; l identité d un doublon porte sur les 12 champs.
- **Q-G1-6** : « première ligne de chaque livrable = modèle résolu » lu comme : ce journal, `REPONSE.md`, `DELIVERED.sha256` ; les
  fichiers de code gardent l en-tête de la maison (précédent : `scripts/record-usde-calib.mjs`, première ligne `#!/usr/bin/env node`).
- **Q-G1-7** : une erreur imprévue (disque, défaut) sort en 1 avec une pile et sans ligne JSON, comme un arrêt nommé ; la distinguer
  (code 3) coûte ≈ 2 lignes. Confirmer.
- **Q-G1-8** : correction « bad port » faite dans le test du lot seul ; les autres tests candidats restent à l item LOOPBACK-BAD-PORT-1.

## 15. `error_origin` proposés (assignés au G7)

- `logOf` sans garde (incident 1, ENOENT au lieu d une assertion), manifeste lu avant l assertion du code (M44 non conclu), assertion de
  type inutile (porte `lint` du gel 2), boucle sans fin sur racine absente (trouvée en relecture avant le gel) : worker G1.
- « bad port » : environnement (contrôle de port de `fetch` du runtime et attribution des ports de l OS) ; latent dans d autres tests
  du dépôt (item LOOPBACK-BAD-PORT-1) : antérieur à ce lot.
- Mort d enfant de l incident 2 : environnement ou outil, cause inconnue (item RED-PROOF-CHILD-STDERR-1).

## 16. Provenance, conduite, écarts, clôture

- Rédacteur : worker `claude-opus-5-5` (R-1), effort max, instance fraîche ; aucun commit, add ni stash dans le worktree ni dans
  `F:/Monark` ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`. Git dans le worktree en lecture (`status`, `diff --cached`,
  `rev-parse`, `branch --show-current`) ; `clone --no-local`, `checkout --detach`, `add` et `commit` dans MES clones seulement
  (`clone-verts` : gels `51860c5f`, `280bd79c`, `607a4e8c` ; `mclone`, `mclone2` sans commit). Aucun réseau hors 127.0.0.1 ; aucune clé ;
  rien sur C:. Écritures dans le worktree : les quatre fichiers du lot, seuls (`status` : quatre `??`, aucun ignoré, 02:04:33Z).
- Advisor intégré consulté deux fois : après l orientation, avant le code ; avant les preuves finales (01:51Z : ordre des preuves sur
  l arbre gelé, preuves « bad port » en fichiers, nettoyage des jonctions). Conseil, jamais verdict ; chaque point vérifié sur pièce.
- **Écarts consignés** :
  1. Premier `git status` sans `--no-optional-locks` (01:04:07Z) : l index du worktree porte 01:04:08Z ; `diff --cached` vide ; toutes
     les commandes git suivantes en `--no-optional-locks` ; date de l index inchangée depuis (02:04:33Z).
  2. `F:/tmp/marche/tools/total-reads.mjs` (outil d édition hors dépôt) écrit par heredoc avec 4 barres inverses (guillemets échappés)
     puis exécuté dans la même commande que la garde qui les signalait ; effet vérifié : 7 ancres trouvées chacune une fois (sinon
     l outil s arrête), fichier de test résultant propre à la garde d octets.
  3. Échappements dans des lignes de commande (pas dans des fichiers) : dollars précédés d une barre inverse dans une commande
     PowerShell (01:13:43Z, remplacée ensuite par l outil `cv4.ps1`) ; guillemets échappés dans des `node -e` (01:31Z, 01:58Z, 02:03Z,
     02:07Z).
  4. Lignes de plus de 160 caractères dans des sondes hors dépôt, laissées telles qu exécutées : `probe-churn2.mjs` l.13,
     `probe-churn3.mjs` l.8 et l.13, `probe-reuse.mjs` l.15 ; outils `check-killers.mjs` et `badport-evidence.mjs` repliés avant usage cité.
  5. Le crochet de sécurité du harnais a signalé la chaîne `NODE_TLS_REJECT_UNAUTHORIZED` à l écriture du script : faux positif, le
     script REFUSE de s exécuter si la vérification TLS est coupée (l.96).
  6. Deux refus de `red-proof` (`f2p`, `f2p3`) et la campagne 1 gardés comme preuves ; aucune relance sans lecture de ses sorties.
- **Erratum (02:07Z, contrôle mécanique des empreintes citées, `F:/tmp/marche/tools/check-cites.mjs`)** : en tête de ce journal (partie
  écrite avant le code, laissée telle quelle), « `64700025…2bba` » doit se lire `64700025…d2ba` (sha256 complet
  `6470002592fe9c18851c8f7c645d1a1ee963d83e8068cd6fbeb8ee94eabdd2ba`, égal à celui de la mission). Toutes les autres empreintes
  abrégées du journal correspondent à leur fichier ; `4d673e95…9b63` est l empreinte d un corps notée dans `m2b1-hour-share.json`.
- **Clôture** : ce journal est CLOS ici, avant l oracle, et n est plus touché ensuite. Oracle : `node F:/Monark/scripts/oracle/run.mjs
  --role G1 --tree F:/Monark-wt-series-binance --base c6ccb233`, verrou et C-V-4 relus au lancement, en arrière-plan, jamais
  interrompu, aucune course de ma part pendant lui. Puis jonctions de `clone-verts` retirées par `rm-nm.ps1` (`F:/Monark/node_modules` :
  220 entrées et 11 `@monark` à 02:04:33Z, recomptés après) ; clones laissés en place comme preuves (aucun `rm`).
