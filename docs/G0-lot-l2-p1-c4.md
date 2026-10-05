# G0 du lot P1-c4 du chantier L2 : commande et gardes

- **Rattachement** : ADR-L2-CAPTURE-1 (§1.3, discipline des bougies ; « Gardes (D-13) » ; Q-11, quota, alarme à 70 %, arrêt à 85 % ;
  items SERIES-ENV-ALLOWLIST-1, SERIES-PROXY-GUARD-1, SERIES-ABSENT-ROOT-TEST-1, MAIN-GUARD-REALPATH-1, L2-DISK-QUOTA-1) ; plan
  `docs/G0-partie-l2-p1.md` §3 points 16, 17, 22 et 23, §8.2 (ligne P1-c4), §8.3 (c4 sur a2 ; prérequis du G1 : Q-P1-10, tranchée),
  §9 (items construits en P1-bis pour le seul enregistreur L2) ; modèle `scripts/record-binance-klines.mjs` ([K]) l.1-30, l.140-171,
  l.386-404 ; G0 et G7 de c1 à c3 ; G2 de c2, de sa re-revue et de c3 (`recherches/coordination/pieces/2026-10-04-G2-recherches/`).
- **Base** : `d90bbf77` (tête de `recherches/l2-p1-c3`, PR #149). Pendant le lot, #149 est fusionnée dans `lot/etude-suite` en
  `c31a6819` (arbre identique à `d90bbf77`, `git diff` vide) : la branche la reçoit par un commit de fusion, et les mesures finales sont
  prises contre `c31a6819`. Branche `recherches/l2-p1-c4`. Auteur : RECHERCHES. Aucun réseau : la commande n'ouvre rien dans ce lot ;
  sorties sous le dossier temporaire du système, hors de tout arbre git ; aucune donnée de marché.

## Prérequis et faits

- **Q-P1-10, tranchée** (bloc daté du 2026-10-03 21:33 UTC du plan : « liste admise telle que proposée ») : win32 `TEMP`, `TMP` et
  `SYSTEMROOT` (provisoire : résolution de noms et TLS non mesurées sans réseau), revue au lancement de M-1 ; linux vide jusqu'à la mesure
  sous l'unité en P3, l'enregistreur refusant d'ici là tout lancement sous l'unité.
- **Q-11 de l'ADR** : alarme à 70 %, arrêt à 85 % ; quota fixé sur M-1 (L2-DISK-QUOTA-1), posé à chaque lancement par `--quota-bytes`.
- **Q-C1-8 de c1** : `script_sha256` du manifeste du jour liste les modules `scripts/l2/*.mjs` « jusqu'à la commande de c4, qui s'y
  ajoutera » : voir Q-C4-5.
- **Leçons des G2 de c2 et c3**, appliquées ici :
  - aucune chaîne d'un fichier entier : la commande ne lit aucun fichier ; elle écrit une ligne de journal ;
  - toute mémoire tenue a une borne nommée, mesurée : le parcours de `--out` tient au plus `WALK_DEPTH` + 1 dossiers ouverts, lus une
    entrée à la fois (point 5, mesures) ;
  - écritures : un seul nom, `journal.jsonl`, de la liste du dossier de sortie, en ajout (`appendFileSync`), jamais un écrasement ;
  - `SHA256SUMS` : la commande ne scelle rien en c4 ; ce qui change la sortie d'un jour (son empreinte au manifeste) attend c5 (Q-C4-5) ;
  - un tueur par test, en forme close : douze tests, douze tueurs.

## Contenu (fichiers de §8.2 : `scripts/record-binance-l2.mjs`, `scripts/record-binance-l2.d.mts`, `test/l2-record.test.ts`)

Couture : `parseArgs`, `guardEnv`, `guardOut`, `bytesUnder`, `createQuota`, `prepare(argv, io)` (toutes les gardes, dans l'ordre, rendent
le plan), `run(argv, io)` (le plan, puis un arrêt nommé `not_built` tant que la boucle et le rejeu manquent), `main(argv, io)`.

1. **En-tête de discipline** (modèle [K] l.1-30) : conditions lues avant tout appel (FAITS-L2-ACCESS-1 et suivants) ; flux publics et
   REST seuls, sans clé ni compte ni dépense ; trames non redistribuables, jamais dans un dépôt ; relecture de RECHERCHES avant le premier
   appel ; hôtes : les listes fermées de `links.mjs` et de `rest.mjs`, rien d'autre.
2. **Arrêts nommés, liste fermée** `STOPS` : `usage`, `bad_quota`, `bad_symbol`, `bad_day`, `proxy_refused`, `env_refused`, `out_not_l2`,
   `out_in_git_tree`, `out_too_deep`, `quota_stop`, `disk_short`, `not_built`. Sortie 1 sur un arrêt, 2 sur `usage` ; une ligne JSON sur
   la sortie d'erreur (`{ ok: false, stop, detail }`), comme [K].
3. **Drapeaux fermés** (point 23) : enregistrement `--out`, `--quota-bytes` ; rejeu `--from-raw`, `--symbol`, `--day`, `--out`
   (`--from-raw` choisit le mode). Chaque drapeau de son mode une fois, avec une valeur ; un drapeau absent, en double, sans valeur,
   inconnu ou de l'autre mode : `usage` ; une valeur vide (`--out ""`) aussi (repli du G2, m-3). `--quota-bytes` : entier décimal positif sans zéro de tête, au plus `QUOTA_MAX` = 2^46 (64 Tio :
   cent fois le quota reste un entier sûr), sinon `bad_quota`. `--symbol` dans la liste fermée de `links.mjs` (`bad_symbol`) ; `--day`
   `AAAA-MM-JJ`, date réelle (`bad_day`). Le rejeu lui-même est c6.
4. **Environnement** (point 17 ; SERIES-ENV-ALLOWLIST-1, SERIES-PROXY-GUARD-1) : `ADMITTED_ENV` = `{ win32: [SYSTEMROOT, TEMP, TMP] }`,
   noms en toute casse ASCII sous win32 (expression régulière `/i` sans `u` : `ſ`, U+017F, n'est pas `S` ; repli du G2, m-6) ; toute autre plateforme : liste vide. Un drapeau de node dans `execArgv`, ou une variable de
   mandataire (`*_PROXY`, `NODE_OPTIONS`, `NODE_USE_ENV_PROXY`, toute casse) : `proxy_refused` ; tout autre nom hors liste :
   `env_refused` (dont `NODE_TLS_REJECT_UNAUTHORIZED` : la liste fermée le refuse par construction). Le détail nomme les variables,
   triées, et compte les drapeaux ; jamais une valeur. Valeurs admises : chemins absolus win32, sinon `env_refused` (forme fermée,
   SERIES-ENV-VALUES-1 de [K]). Sous linux, une unité pose ses propres variables (`INVOCATION_ID`, `JOURNAL_STREAM`…) : un lancement
   sous l'unité s'arrête, nommé, jusqu'à la mesure de P3 (Q-P1-10). Seul l'enregistrement est gardé ainsi ; le rejeu n'ouvre rien ([K]).
5. **Sortie** (point 22 ; ADR « sortie hors dépôt » ; SERIES-ABSENT-ROOT-TEST-1) :
   - aucun ancêtre de `--out`, tel que donné puis tel que résolu sur le disque (chemin réel de l'ancêtre existant le plus proche), ne
     porte `.git` (dossier ou fichier) : sinon `out_in_git_tree` ; la remontée finit à une racine, même absente (lecteur win32 sans
     disque : aucun chemin réel n'est alors demandé) ; `exists` et `real` sont ceux de l'appelant pour le seul test de la racine absente ;
   - un lien pendant sur le chemin de `--out` (présent en `lstat`, absent en `stat`) arrête, `out_not_l2` (repli du G2, m-1) ;
   - puis `--out` absent ou vide (sortie neuve), ou sortie L2 à reprendre : chacune de ses entrées dans `OUT_ENTRIES` (`conn`, `days`,
     `journal.jsonl`, `requests.jsonl`, `rest` : ce qu'écrivent a2 à c3), chacune de son type par son `Dirent` (`conn`, `days`, `rest` :
     dossiers ; les deux `.jsonl` : fichiers ; un lien n'est ni l'un ni l'autre ; repli du G2, B-1 (b)), `journal.jsonl` parmi elles (c5 en écrit une ligne `start` à
     chaque lancement, Q-C1-10). Sinon `out_not_l2`, première entrée étrangère nommée. Lecture par `opendirSync`, une entrée à la fois :
     arrêt à la première étrangère, mémoire constante quel que soit le dossier donné.
6. **Quota** (point 16 ; Q-11) :
   - octets de `--out` = somme des tailles des fichiers ; un lien, à toute profondeur, arrête (`out_not_l2` : une entrée qui n'est ni
     fichier ni dossier par son type de `Dirent`, qui ne suit pas les liens ; repli du G2, B-1 (a) et (c), au lieu de « un lien compte
     sa propre taille ») ; l'ajout au journal s'ouvre avec `O_NOFOLLOW` là où il existe (pas sous win32) ; parcours par
     `opendirSync`, une entrée à la fois ; un dossier plus profond que `WALK_DEPTH` = 3 sous `--out` (la forme la plus profonde est
     `days/<SYMBOLE>/<jour>/`) arrête, `out_too_deep` : au plus quatre dossiers ouverts ;
   - `createQuota({ out, quota }, io).check()` : arrêt `quota_stop` dès `100 × octets ≥ 85 × quota` (entiers) ; dès `100 × octets ≥
     70 × quota`, une ligne `quota_alarm` au `journal.jsonl` (`host_us`, `mono_ns` en chaîne, `symbol` `ALL`, `cid` nul, `used`,
     `quota`), une fois par processus ; l'arrêt n'écrit rien ; `check` rend les octets comptés ; c5 l'appelle à son rythme ;
   - au départ (`prepare`) : un `check`, puis espace libre du système de fichiers (`statfs`, `bavail × bsize`, à l'ancêtre existant le
     plus proche, lecture fournie par l'appelant dans les tests) au moins égal au quota restant (`quota − octets`), sinon `disk_short` ;
     rien n'est écrit, `--out` n'est pas créé.
   - **Mesures** (Node v24.21.0, sorties synthétiques sous le dossier temporaire, effacées, 2026-10-05 vers 04:08 UTC ; RSS maximal lu à
     `VmHWM` avant et après `guardOut` puis `bytesUnder`) : 1 001 fichiers, 12 ms, +8,8 Mo ; 100 001 fichiers, 396 ms, +13,1 Mo ;
     400 001 fichiers, 1 335 ms, +12,6 Mo. La mémoire ne croît pas avec le nombre de fichiers ; la durée, environ 3,3 µs par fichier. Un
     jour écrit environ 300 fichiers (cinq connexions, 24 segments de deux fichiers, instantanés, dossiers des jours) : 400 000 fichiers,
     environ trois ans et demi. Le rythme des contrôles est celui de c5 (note pour c5).
7. **Départ par chemins réels** (MAIN-GUARD-REALPATH-1, [K] l.400-404) : la ligne de commande tourne quand node démarre ce fichier même,
   chemins réels comparés ; un import ne lance rien, ni un `argv[1]` absent ou qui ne nomme aucun fichier.
8. **Après les gardes** : `run` s'arrête, nommé, `not_built` (mode, sortie, reprise) : la boucle (c5) et le rejeu (c6) manquent. Jamais
   une sortie 0 qui n'a rien fait (le défaut F-4 que MAIN-GUARD-REALPATH-1 nomme).

## Tests (`test/l2-record.test.ts`), tueurs (un par test, forme close)

Le fichier appelle `keepCause` au chargement et fait son dossier temporaire dans `before()` ; chaque test charge la commande par un import
dynamique qu'il affirme : la base, sans la commande, rougit par assertion. Les lignes citées sont celles du gel.

- **`l2_guard_env_allowlist`** : liste win32 en toute casse admise ; linux vide ; `TEMP` sous linux et sous darwin, `INVOCATION_ID`,
  `PATH` sous win32, `NODE_TLS_REJECT_UNAUTHORIZED` : `env_refused` ; détail sans valeur. Tueur : `// killer:
  scripts/record-binance-l2.mjs:76 CONST "!admitted.includes(name.toUpperCase())" -> "false"`.
- `l2_guard_proxy_and_flags_refused` : `HTTPS_PROXY` (mot de passe absent du détail), `node_options`, un drapeau de node : `proxy_refused`.
  Tueur : `// killer: scripts/record-binance-l2.mjs:78 CONST "execArgv.length > 0" -> "false"`.
- `l2_guard_env_values_closed_form` : `TEMP` relatif, `SYSTEMROOT` vide refusés ; chemin UNC admis. Tueur : `// killer:
  scripts/record-binance-l2.mjs:80 CONST "!win32.isAbsolute(String(env[name]))" -> "false"`.
- **`l2_guard_out_outside_git`** : `.git` dossier, `.git` fichier, lien vers un dépôt : `out_in_git_tree`, rien créé ; hors dépôt : sortie
  neuve. Tueur : `// killer: scripts/record-binance-l2.mjs:92 SDL "if (exists(join(dir, " -> ""`.
- `l2_guard_out_absent_root` (SERIES-ABSENT-ROOT-TEST-1) : racine absente simulée ; admise, aucun chemin réel demandé, chaque ancêtre
  regardé. Tueur : `// killer: scripts/record-binance-l2.mjs:90 CONST "exists(near) ? real(near) : near" -> "real(near)"`.
- `l2_guard_out_resume_l2_only` : vide, sortie L2, sortie L2 plus `keep.txt`, sans journal, un fichier ; rien touché. Tueur : `// killer:
  scripts/record-binance-l2.mjs:102 CONST "!OUT_ENTRIES.includes(e.name)" -> "false"`.
- **`l2_quota_alarm_and_stop`** : 85 octets pour un quota de 100 : `quota_stop`, rien au journal ; 84 : aucun arrêt. Tueur : `// killer:
  scripts/record-binance-l2.mjs:132 ROR "100 * used >= STOP_PCT * quota" -> "100 * used > STOP_PCT * quota"`.
- `l2_quota_alarm_at_seventy_once` : 6 999 sur 10 000, aucune alarme ; 7 000, une ligne exacte ; contrôle suivant, aucune seconde ligne,
  le journal compté. Tueur : `// killer: scripts/record-binance-l2.mjs:133 ROR "100 * used >= ALARM_PCT * quota" -> "100 * used >
  ALARM_PCT * quota"`.
- `l2_quota_free_space_at_start` : libre égal au reste du quota, admis ; un octet de moins, `disk_short` ; sortie neuve et sortie
  reprise ; rien écrit. Tueur : `// killer: scripts/record-binance-l2.mjs:154 ROR "free < args.quota - used" -> "free <= args.quota -
  used"`.
- `l2_quota_walk_depth_bound` : octets de la forme à trois niveaux (sans lien depuis le repli du G2) ; un quatrième niveau,
  `out_too_deep`.
  Tueur : `// killer: scripts/record-binance-l2.mjs:119 ROR "depth === WALK_DEPTH" -> "depth > WALK_DEPTH"`.
- `l2_args_closed_flags` : les deux modes ; absent, étranger, en double, sans valeur, inconnu, de l'autre mode : `usage` ; `bad_quota`,
  `bad_symbol`, `bad_day`. Tueur : `// killer: scripts/record-binance-l2.mjs:60 CONST "foreign.length > 0" -> "false"`.
- **`l2_main_runs_by_real_path`** (MAIN-GUARD-REALPATH-1) : le dossier `scripts` derrière un lien, la commande sans argument : `usage`,
  sortie 2 ; importée : rien ; `main` en processus : `not_built`, sortie 1. Tueur : `// killer: scripts/record-binance-l2.mjs:179 CONST
  "realpathSync(argv1) === realpathSync(SCRIPT)" -> "resolve(argv1) === resolve(SCRIPT)"`.

Repli du G2 (2026-10-05) : neuf tests de plus, un tueur chacun, et les lignes des douze tueurs ci-dessus renumérotées au nouveau gel ;
liste et tueurs au G7, section « G2 ».

Les quatre tests du plan (en gras) gardent leur nom ; les huit autres portent chacun un tueur que le plan range dans ces quatre (liste
admise, seuils de 70 et 85 %, garde d'arbre git), plus la racine absente, la reprise, la profondeur et les drapeaux.

## Preuve rouge, contrôles, taille

- Commit de ce G0 ; commit des tests seuls (rouges, avec `record-binance-l2.d.mts`) ; gel ; fusion du tronc `c31a6819` ; puis
  `node scripts/red-proof.mjs --base c31a6819 --gel <tête> --repo /home/user/monark-governance-c4 --draw 12 --seed 37` ; ancres par
  `verifie-ancres.mjs --touched`, puis avec les fichiers de test de c1 à c3 ; tests L2 ; `npm test` une fois dans le worktree ; `tsc`,
  `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.
- **R-25** : plan 301 à 394 (c 110, d 34, t 157 à 250). Estimation de ce G0 : commande 180, `.d.mts` 45, tests 196 : environ 421, sous la
  borne de 547. Écart au plan déclaré : le code dépasse c 110 par la reprise L2, la racine absente et la borne du parcours ; les tests,
  par douze tests à un tueur chacun.

## Questions (défaut retenu ; aucune ne touche la zone de MONARK ni une surface servie : la commande est hors de la liste d'export)

- **Q-C4-1** : après ses gardes, la commande s'arrête nommée (`not_built`, sortie 1) jusqu'à c5 et c6, plutôt qu'une sortie 0 qui ne
  fait rien. c5 remplace la ligne de `run` ; `prepare` reste la couture des gardes. (défaut : oui)
- **Q-C4-2** : reprise admise si chaque entrée de `--out` est de `OUT_ENTRIES` et que `journal.jsonl` y est ; aucun contenu n'est relu.
  Le rejeu (c6) écrit dans une sortie neuve : sa garde propre (sortie absente ou vide) est à c6. (défaut : oui)
- **Q-C4-3** : octets de `--out` = tailles apparentes des fichiers, pas les blocs alloués (portable, `blocks` n'est pas fiable sous
  win32) ; l'écart aux blocs (petits fichiers d'index) est à mesurer avec L2-DISK-QUOTA-1. (défaut : oui)
- **Q-C4-4** : `guardOut` prend `exists` et `real` de l'appelant pour le seul test de la racine absente (SERIES-ABSENT-ROOT-TEST-1 sous
  POSIX) ; `run` et `prepare` ne les passent jamais. La couture du point 22 n'en est pas élargie. (défaut : oui)
- **Q-C4-5** : l'empreinte de la commande entre au `script_sha256` du manifeste du jour (Q-C1-8) en c5, qui appelle `sealDay` depuis la
  commande ; c4 ne touche pas `day.mjs` : la sortie des jours ne change pas dans ce lot. (défaut : oui)
- **Q-C4-6** : l'alarme est journalisée une fois par processus ; l'arrêt à 85 % n'écrit rien (c5 journalise son arrêt propre) ; à 85 %
  au départ, rien ne s'ouvre. (défaut : oui)
- **Q-C4-7** : le rejeu ne passe pas la garde d'environnement (il n'ouvre rien, comme [K]) ; il passe la garde de sortie. (défaut : oui)
