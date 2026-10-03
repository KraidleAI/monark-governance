claude-opus-5-5

# G1 PROBE-NARABI-LOAD-1 -- journal (worker G1, modele resolu `claude-opus-5-5`, effort max, 2026-10-03)

Mission `F:/tmp/rech/probeload/mission.md` sha256 `1903b45a2118ee3c4cb61851e2611e1538cc099911f949c22475d513d59bf461`
(relu a 19:14:43 UTC, egal au lancement ; recu `mission.recu.json` verdict vert). Worktree `F:/Monark-wt-probeload`, branche
`lot/probe-load`, HEAD = base `31e119ec23e6102e8ebc76b9b411be75ec31cd1e` (relu). Heures : `date -u`. Journal ASCII seul.

## 1. Lecture (taches 1)

Lu en entier, dans l ordre de la mission (sha256 relus a 19:15-19:17 UTC) :

- `test/probe-narabi-state.test.ts` (430 lignes) `76bf42e9356bd218f98ab0c988f304e719f1a8405d7d20458fcd2a19dc40da45`. L aide
  `listen()` (l.84-86) lie chaque serveur au port 0 de 127.0.0.1 ; la sonde est lancee en sous-processus (l.76-82) avec un
  environnement FILTRE (l.56-61 : seules les variables `SMTP_*`, `ALERT_*`, `PROBE_*` sont retirees ; `SystemRoot`, `PATH` gardes).
  Compte des liaisons et des lancements par course du fichier : 11 `listen` (test 1 : 2 ; test 2 : 1 ; test 3 : 3 dont le port ferme ;
  tests 6 a 10 : 1 chacun) et 15 sondes lancees (test 1 : 6 ; test 2 : 1 ; test 3 : 3 ; tests 6 a 10 : 1 chacun).
- `scripts/probe-narabi.mjs` (793 lignes) `4e4338c026ad650882ebde28b2af2c2fa7a457ca2077788a30382251483883b8`. `fetchTimeline`
  (l.263-302) : chaque tentative appelle `fetch` ; TOUTE exception est avalee (l.295-296) et devient `unreachable`, jusqu a
  `retries+1` tentatives ; aucune distinction de la cause.
- `F:/tmp/rech/ee7/corr/CORR.md` l.120-180 `8373728256cd3857668e031bd0d39eaab35d467ec0c65b0cc3bbb5dbbe168bc3` : trois rouges du fichier
  (course 1 de la suite sur clone, `--test-concurrency=4`), raison `unreachable`, 0 requete recue, "en une centaine de ms" (l.135) ;
  verts seuls (l.135) ; item forme l.161.
- `F:/tmp/oracle-results/e970c4889f5e8d2be4753785154d6513ae4159bc-G7-20261003T190004Z-162364/09-test.log`
  `48ad456a856d1501d69a34d49590e4f3f1e35719e4479f8ea72a64d410221542` : l.2437 `probe_state_digest_cross_check` rouge en 519,75 ms
  (sous-cas (a) puis (b) : deux sondes) ; l.2971-2987 : attendu `state_mismatch`, recu `unreachable`, l.130 du test. Les 8 autres
  tests de la plage lue verts (l.2438-2445 ; le 10e, l.2446, relu hors plage a 21:09 UTC : vert). Duree incompatible avec un delai
  expire (8 000 ms par tentative par defaut, l.54 de la sonde).
- `docs/ETAT.md` `2baebf25109a82d0ab28570828443cc4f8fd54fd4f722751cb8d00e2f0589e27` l.277-279 (PROBE-NARABI-LOAD-1) et l.399
  (LOOPBACK-SEQUENTIAL-PORTS-1, "port 0 attribue en sequence sur cet hote") ; source de ce dernier : `docs/G1-lot-series-intervals.md`
  l.311-320 (dix fichiers dont celui-ci lient le port 0 ; 19 ports bloques par `fetch` entre 1024 et 10080 ; "non mesure fichier par
  fichier") et section 9 du meme journal (cause mesuree au lot SERIES-INTERVALS : plage dynamique a 1024, port 0 en sequence).
- Precedent dans le depot (lu) : `test/record-binance-klines.test.ts` l.65-80 et `test/record-coinbase-candles.test.ts` l.91-105 :
  aide `listen()` qui demande un port aleatoire au-dessus de 10080 et en reprend un autre sur toute erreur d ecoute.
- Outils du tronc lus : `F:/Monark/scripts/oracle/lock.mjs` `501a76b5...` (acquire FIFO, reprise d un pid mort ecrit par lui seul),
  `run.mjs` `f22b9045...`, `red-proof.mjs` `6579b550...` (sha256 egaux a la mission pour run, r25, red-proof).

## 2. Faits du runtime et de l hote (lus sur place, avant toute experience)

- [lu] Source embarquee de `node.exe` v24.15.0, module `internal/deps/undici/undici` (undici 7.24.4), sha256 du module
  `d6332aa1ca04f71ffdba505a7e2cb61d15d3e0799bdcc06352a89d6a58ebe475` (egal a celui du lot SERIES-BINANCE) : 82 ports bloques, maximum
  10080, dont 19 entre 1024 et 10080 (1719, 1720, 1723, 2049, 3659, 4045, 4190, 5060, 5061, 6000, 6566, 6665-6669, 6679, 6697,
  10080). Chemin du refus, cite du code : `mainFetch` fait `if (requestBadPort(request) === "blocked")` puis
  `response = makeNetworkError("bad port")` ; `requestBadPort` teste `badPortsSet.has(url.port)` pour http(s) ; la promesse rejette
  `new TypeError("fetch failed", { cause: response.error })`, la cause etant `new Error("bad port")`. Aucun appel reseau avant ce
  refus. Outil `tools/badports.mjs` `1a76a4c0c204320160e2ffc9e95a8d48215c342cc4e15fc59d4e2baefb0f1b45`, preuve
  `evidence/badports.json` `31b409de6ae608e020c7b618f64b0e9f00938788ac386561f0eaa5818a56ed03` (19:21:58 UTC).
- [lu] `netsh int ipv4 show dynamicport tcp` (19:22:05 UTC) : depart 1024, 64 511 ports (IPv6 idem) ; exclusions TCP IPv4 : 5357,
  6379, 23892-23991, 50000-50059, 57634-57933 (`evidence/netsh-ports.txt`
  `27ec8044625cdb063668009995b57efa77cfe46c4cbd61167018cb20e06b45f0`).

Chemins relatifs a `F:/tmp/methode/probeload/` sauf mention.

## 3. Banc (D-1) : outils, charge declaree, verrou

Outils (sous `tools/`, ecrits par l outil Write, ASCII, 0 TAB) et sha256 des versions qui ont fait foi pour s1 a s5 :
`bench.mjs` `f9b06c9d1c8e7d993998e0fa0c35cc98f83945b57146cf940a68eb0174118254` ; `cursor.mjs`
`17fd01f9730ae65bf7f5663a9829085198d36a4fcdb239b50ec4be43d9cd550c` ; `sweep.mjs` `4b084630e19d62b117d563a8c05620486ad67300f015228a1d7216015264c80b` ;
`cpuload.mjs` `11ca07f255264f8d48de42e38b7c5401777a7be653fc34b144d226593d48944c` ; `churn.mjs`
`ceafae0f4477ca0acd6087f7dcc24d8258ba2ef8e6552623d3c6be6595fb1560` ; `instr.mjs` `b19304b31aa4059e95a2ed0bdaafe351cfa37e87f3bc16ec2e6fca3fcfd562ae` ;
`analyze.mjs` `bc225ca44b04599900e6cf19cc30b09c86d755f3003aac5b913bdcf93e5c1623` ; `stats.mjs`
`32afa945bc070bb4bf85a2d7ede792fe20852568f1954aa19104c45e3adf8f83` (Clopper-Pearson exact, verifie contre les formes closes :
(0,200) borne haute 0,018275 = 1 - 0,025^(1/200) ; (10,10) borne basse 0,6915 = 0,025^(1/10) ; (5,10) = [0,1871 ; 0,8129]).
Le pilote s0 a tourne avec des versions anterieures de `bench.mjs` (`8fe5944b...`) et `instr.mjs` (`75f4c363...`) : il ne compte
dans aucun taux.

- **Verrou** : chaque session = UN `acquire("F:/tmp", owner)` de `F:/Monark/scripts/oracle/lock.mjs` (proprietaire
  `{role: bench, lot: PROBE-NARABI-LOAD-1, agent: G1 claude-opus-5-5, purpose, date}`, attente FIFO, sondage 5 s, abandon apres
  3 600 000 ms, jamais force) ; tout ce qui charge (processus de charge, liaisons de port, courses) tourne entre la prise et
  `release()` ; dans `finally`, AVANT la liberation : processus de charge arretes, curseur remis dans [12000, 60000].
- **C-V-4** lu dans chaque session apres la prise : `os.freemem()` >= 4 096 Mo et `tasklist` node.exe + charge prevue <= 40 (comme
  `scripts/oracle/run.mjs` l.153-156 ; pas de PowerShell, PS-C-WRITE-1).
- **Charge declaree par cellule** : K processus `cpuload.mjs` (un coeur chacun, tranches de 100 ms, plafond n x 60 + 120 s, meurent
  avec le pilote) ; option churn : 1 processus `churn.mjs` (serveur de boucle locale, `rate` connexions courtes par seconde) ;
  politique du curseur de port : `bad` = avant CHAQUE course, la liaison suivante du port 0 est placee delta ports sous un port que
  `fetch` bloque (grappes 1719, 2049, 3659, 4045, 4190, 5060, 6000, 6566, 6665, 10080 ; delta tire dans 0..12 par graine) ; `high` =
  curseur garde dans [12000, 60000] ; `low-start` = curseur place une fois a 1100 en debut de cellule ; deplacement par liaisons du
  port 0 sur 127.0.0.1 (aucune connexion, donc aucun TIME_WAIT) ; un tour complet passe par 8 processus `sweep.mjs` en parallele.
- **Course** : n courses SUCCESSIVES de `node --test --test-reporter=tap --test-force-exit --test-timeout=120000
  test/probe-narabi-state.test.ts` dans une copie d arbre ; environnement = celui du pilote moins la liste DENY de l oracle, moins
  `NODE_TEST_CONTEXT` et `NODE_OPTIONS` ; TEMP/TMP/TMPDIR neufs par course ; `GIT_TERMINAL_PROMPT=0` ; `instr` ajoute
  `NODE_OPTIONS=--import=<instr.mjs>` et `INSTR_DIR`.
- **Instrumentation passive** (`instr.mjs`) : journal JSONL par processus ; enveloppe `fetch` (memes arguments, meme resultat, meme
  objet d erreur relance) et `net.Server.prototype.listen` (un auditeur `listening` de plus, aucun auditeur `error`) ; abonnements
  `diagnostics_channel` : `net.server.socket`, `http.server.request.start`, `child_process` (pid lu sur l evenement `spawn` de
  l enfant : le canal publie avant que le pid existe, mesure au pilote s0), `undici:client:beforeConnect|connected|connectError`.
  Aucune valeur observee n est changee ; la cellule A-noinstr (sans preload) le controle (section 4).
- **Copies d arbre** : `tree-base` = `git archive 31e119ec | tar -x` (test `76bf42e9...`, sonde `4e4338c0...`, egaux au worktree) ;
  `tree-fix` = idem + le test corrige (`cbf5e97d...`) ; `diff -rq` : seul le fichier de test differe.

## 4. Mesures D-1 (taux de rouge, intervalle exact a 95 %)

Toutes les courses : une a la fois, sous le verrou. "rouge" = au moins un `not ok` dans le TAP.

| session (verrou pris -> rendu, UTC) | cellule | charge | curseur | n | rouges | taux | IC 95 % | liaisons sur port bloque |
|---|---|---|---|---|---|---|---|---|
| s2-A 19:44:52 -> 19:54:33 | A-base | 8 CPU (73,3 % occupe) | bad | 60 | 13 | 21,7 % | [12,07 ; 34,20] % | 24 / 648 |
| s3 19:55:23 -> 20:01:24 | A-nocpu | aucune (33,2 %) | bad | 20 | 7 | 35 % | [15,39 ; 59,22] % | 9 / 214 |
| s3 | A-noinstr | 8 CPU (56,7 %), SANS preload | bad | 20 | 9 | 45 % | [23,06 ; 68,47] % | non instrumente |
| s4 20:01:44 -> 20:09:48 | B-base-high-cpu | 8 CPU (69,2 %) | high | 40 | 0 | 0 % | [0 ; 8,81] % | 0 / 440 |
| s4 | C-base-churn | churn 50/s (mesure 45,7 connexions/s) | low-start | 40 | 0 | 0 % | [0 ; 8,81] % | 1 / 440 |

Pilotes (hors taux) : s0 19:39:47 -> 19:40:54 (P-high 0/2, P-bad 1/2) ; s1 19:43:21 -> 19:44:14 (P2-bad 1/3). Attente du verrou :
1 a 2 ms a chaque prise (verrou libre). C-V-4 a chaque prise : 11 025 a 16 913 Mo libres, 16 a 22 node.exe.

Reproduction : OUI. Le rouge de l oracle `e970c488` (l.2971-2987 : `probe_state_digest_cross_check`, attendu `state_mismatch`,
recu `unreachable`) est reproduit A LA LETTRE en s1 course 0 et 4 fois dans A-base / A-nocpu / A-noinstr (sous-cas (a) sur un port
admis, sous-cas (b) sur un port bloque) ; les trois rouges de CORR.md l.135 (`probe_state_unreachable_precedence`,
`probe_get_retries_exactly_n_plus_one`, `probe_state_get2_binds_state_max_bytes`) figurent tous parmi les assertions rouges de
A-base (`s2-A/analysis.json`, champ `failing_assertions`).

Preuves (sha256) : `s2-A/session.json` `f17772d188846627642f147364a8d4a819550722be5d0c9001164ff1fc4b43a1`, `runs.jsonl`
`e954780ee8a291664c342169404cb3ea24034adf7bf6911e9067a4c673ec418a`, `analysis.json`
`ff112ade478b88df8e74e202491799dba73b53e220daed3d1202a08a8d72a759` ; `s3-controls1/session.json`
`e61d4a67f5eba418e446c6bc4c1c1306a6d49e549c286ba8315104bb15a46f2c`, `runs.jsonl` `853fb7f3e17a2ae46c082f6c0679219f8af283e3a44754554cfdad3710a48474`,
`analysis.json` `bf729ec556772da75e07375ce783a3700316a2f12cf2bcc78b5727d5034e7118` ; `s4-controls2/session.json`
`ae574e40cd3ce60c46b0296d47025dfd762c86c6ad46d4c08263b8d580bfb0e9`, `runs.jsonl` `4d9b67ff83c64dbee692d237b2a51b6ffcf355f017214afc7ab12c0c19336028`,
`analysis.json` `e76b680c31c9f3be36cd871d194cc1fdda64a3e5e298cb3621c002b7b37e7711` ; pilotes `s0-pilot/session.json`
`74f788e4f2c06d443f62611c94b10bd517ae2b7a2755a873d69ee2250b2d6694`, `s1-pilot2/session.json`
`219696d9c826eaab0dbd976ab01a4ea8a3502b626c316e48b0d8460e3e6292f3`. Plans : `plans/*.json` (sha256 dans `session.json`, champ
`plan_sha256`).

## 5. Cause mesuree (D-2)

1. **Une seule sequence de ports pour les liaisons ET les connexions sortantes.** Sonde de connexion de chaque session (une liaison,
   un serveur au port 0, 4 connexions sortantes, une liaison) : s0 18506 / 18507 / 18508-18511 / 18512 ; s1 13919 / 13920 /
   13921-13924 / 13925 ; s2 12932 / 12933 / 12934-12937 / 12938 ; s3 12049 / 12050 / 12051-12054 / 12055 ; s4 12362 / 12363 /
   12364-12367 / 12368 ; meme forme dans les 4 sessions de D (s5-D1 22170 / 22171 / 22172-22175 / 22176, etc.) : 9 sur 9. Dans une
   course (s0, P-bad, course 0, flux du processus de test) : serveur 1721 puis connexion acceptee depuis 1722 ; serveur 1724 puis 1725
   et 1726 (GET1 et GET2 de la sonde). Derive de fond mesuree au debut de chaque session : 0 a 38,7 ports/s ; sous churn de 45,7
   connexions/s, le curseur avance de 65 ports/s (`s4-controls2/analysis.json`, champ `churn`). Entre la fin de s4 (sequence a 14963,
   20:09:48Z) et le debut de s5-D1 (22166, 20:25:59Z), deux suites d oracle d autres lots ont tourne sous le verrou : la sequence a
   avance de 7 203 ports (+ k x 64 511, k inconnu : aucune lecture pendant leurs suites ; item CURSOR-SUITE-RATE-1, section 11).
2. **Le chemin du rouge.** Dans CHAQUE course rouge instrumentee (13 de A-base, 7 de A-nocpu, 2 des pilotes), au moins un serveur du
   test est lie a un port de la liste de `fetch`. Les 38 sondes lancees contre un tel port (s0 a s4) : premier essai rejete en 18,7 a
   41,7 ms, essais suivants en 2,8 ms au plus, cause `bad port` (le message de `makeNetworkError`), 0 connexion acceptee par le serveur,
   0 evenement de connexion d undici (35 sondes de s1 a s4 ; s0 lu par une version anterieure d `analyze.mjs`, sans ce champ) ; la
   prise generale de `fetchTimeline` (l.295-296) rend alors `unreachable`. Classes d erreur de `fetch` sur toutes les cellules : `bad
   port` et les deux classes VOULUES par les tests (`UND_ERR_SOCKET` des remises a zero, 5 par course verte ; `ECONNREFUSED` du port
   ferme, 1 par course verte) ; aucune autre classe, aucun `AbortError` (aucun delai expire).
3. **Equivalence.** Rouge => liaison sur un port bloque : 0 exception (22 rouges instrumentes). Liaison sur un port bloque => rouge :
   0 exception SAUF le sous-cas du port FERME du test 3 (C, course 15, port 6679 : flux L6663 S A6663, L6670 S A6670 x3, L6679 S sans
   connexion) : le test attend `unreachable` et l obtient, pour une autre cause (`bad port` au lieu de `ECONNREFUSED`) ; vert, mais
   pour une mauvaise raison.
4. **Ni le temps ni la charge CPU.** `listen` precede TOUJOURS le lancement de la sonde : 0,7 a 48,3 ms, sur les 1 742 sondes a URL de
   A, A-nocpu, B, C (648 + 214 + 440 + 440) ; lancement -> demarrage de la sonde 14,5 a 156,2 ms ; demarrage -> premier `fetch` 31,5 a
   2 229,3 ms ; retard maximal de la boucle d evenements du processus de test 270 ms sous 8 CPU ; delai de la sonde 8 000 ms par
   essai (l.54), jamais atteint. B (8 CPU, curseur haut) : 0 / 40. A-nocpu (aucune charge, curseur place) : 7 / 20. La charge CPU
   n est ni necessaire ni suffisante ; seule compte la position de la sequence de ports au moment de la liaison.
5. **Environnement.** `SystemRoot` present et non vide dans CHAQUE sonde (valeur journalisee), aucune variable de mandataire
   (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`, `ALL_PROXY`, `NODE_USE_ENV_PROXY`) ; le filtre `purgedEnv` (l.56-61) ne retire que
   `SMTP_*`, `ALERT_*`, `PROBE_*`. Les rouges surviennent avec cet environnement complet : l hypothese "environnement purge incomplet"
   est refutee par mesure.
6. **Lien avec LOOPBACK-SEQUENTIAL-PORTS-1 : tranche, c est la cause.** "Sous charge" = les connexions des autres tests font avancer
   la sequence partagee ; quand elle traverse 1024-10080 (19 ports bloques sur 9 057) et qu une liaison de ce fichier tombe sur l un
   d eux, le fichier rougit ; rejoue seul quelques minutes plus tard, la sequence est ailleurs : vert. Dans C (phase basse traversee par
   le churn), 1 liaison bloquee sur 280 liaisons de ports <= 10080 (courses 0 a 25), attendu 280 x 19 / 9057 = 0,59 : le taux naturel est
   faible et depend de la phase, ce qui explique la rarete des rouges d oracle.
7. **La sonde servie n est pas en cause.** Le refus `bad port` ne peut naitre que d une URL dont le port est dans la liste ; l URL de
   production est `https://monarkgate.tech/narabi/timeline.jsonl` (port 443, l.31) ; `unreachable` sur un `TypeError` de `fetch` y est
   le comportement voulu. Aucun changement de la sonde (D-3) ; question annexe en Q-2.

## 6. Correctif (D-3) : le test seul

- **Ou est la cause** : dans le TEST (choix du port de ses serveurs : le port 0 de cet hote peut tomber sur un port que `fetch`
  refuse), pas dans la sonde (section 5, point 7). La sonde servie `scripts/probe-narabi.mjs` est INCHANGEE (sha256
  `4e4338c026ad650882ebde28b2af2c2fa7a457ca2077788a30382251483883b8` relu dans le worktree) ; son comportement servi ne change pas.
- **Le plus petit correctif qui supprime la cause** : l aide `listen()` du fichier (l.84-86 de la base, 3 lignes) devient l aide du
  depot deja eprouvee : corps l.89-100 IDENTIQUE octet pour octet a `test/record-binance-klines.test.ts` l.69-80 et a
  `test/record-coinbase-candles.test.ts` l.94-105 (`diff` vide, 20:19 UTC) : port ALEATOIRE dans [10081, 65080], au-dessus du maximum 10080 de la liste de
  `fetch`, un autre sur toute erreur d ecoute (port pris, ou exclu par l OS : plages 23892-23991, 50000-50059, 57634-57933 de cet
  hote), 50 essais au plus puis `assert.fail` nomme. Aucun port de la liste ne peut plus etre lie ; la position de la sequence du port
  0 n importe plus. Commentaire de l aide : la cause mesuree, en anglais (portes `lang:gate` : 0 mot de la liste `FR_WORDS` dans les
  lignes neuves, verifie par import de `scripts/lang-gate.mjs`). Les 10 sites d appel `await listen(...)` (l.130, 141, 203, 231, 243, 315, 337, 364, 402, 435) sont inchanges (meme signature).
- **Ecarte** : allonger un delai (la cause n est pas un delai : rejet en moins de 42 ms, section 5) ; garder le port 0 et relier tant
  que le port est <= 10080 (une phase basse dure des milliers de liaisons : l aide de SERIES-BINANCE y echouait, "no loopback port
  above 10080 in 50 tries", journal SERIES-INTERVALS section 9) ; garder le port 0 et exclure la liste exacte (82 nombres recopies
  d undici dans le test, derive possible a chaque montee de Node) ; changer la sonde (cause hors sonde).
- **Diff** (worktree, `git --no-optional-locks diff --numstat`) : `test/probe-narabi-state.test.ts` 16 insertions, 2 suppressions ;
  aucun autre chemin (`status --porcelain` : ` M test/probe-narabi-state.test.ts` seul). sha256 du fichier livre
  `cbf5e97d623df60e9cb4d9b3cc98ff8d569c4f0dbf173289bcd0caf6c1818918` (444 lignes). Garde d octets du fichier : 0 TAB, 0 CR, 0 octet de
  controle, 0 point de code C1 ; lignes neuves l.84-99 : ASCII seul, 134 caracteres au plus (les 25 lignes de plus de 160 caracteres
  du fichier existent a la base, inchangees).

## 6 bis. Annexe D-2 : contre-epreuve de l environnement (une sonde, deux fois, sous le verrou)

`tools/locked.mjs` (`acquire` du tronc, une commande legere, `release` aussitot) + `tools/envcontrol.mjs` : serveur de boucle locale
sur le port explicite 62006 (> 10080), la VRAIE sonde de `tree-base` lancee (1) avec l environnement du test, (2) avec ce meme objet
sans `SystemRoot` ni `windir`. Verrou pris 20:32:48.471Z, rendu 20:32:48.851Z (attente 816 s derriere d autres oracles). Resultat
(`evidence/envcontrol.log` `08baee5d0d1b13b44d7b155252c5197f742e06b51b33091fcf416f6b6d9c61f8`) : dans les DEUX cas l enfant a
`SystemRoot` et `windir` non vides, de meme valeur dans les deux cas (lus par le preload dans l enfant), 2 connexions acceptees, deux `fetch` en 200. Mesure : sur
ce runtime, un enfant lance par `spawn` recoit `SystemRoot` et `windir` meme quand l objet `env` les omet ; l environnement du test
ne peut donc pas en etre prive. Le mecanisme (re-injection au lancement) n est pas lu ; la conclusion de la section 5 (point 5) n en depend pas
(elle repose sur la presence mesuree dans chaque sonde rouge). La raison `probe_error` des deux cas vient du corps servi (`x`, pas
du JSONL), sans objet ici.

## 7. Preuve D-4 (meme charge que A, test corrige)

Cellule D = memes parametres que A-base (8 CPU, curseur `bad` avant chaque course, preload), `tree-fix`, 4 sessions de 50 courses
(graines 401 a 404), chacune sous son propre verrou.

| session (verrou pris -> rendu, UTC ; attente) | n | rouges | IC 95 % | liaisons <= 10080 | relances d ecoute | classes d erreur de `fetch` |
|---|---|---|---|---|---|---|
| s5-D1 20:25:54 -> 20:32:47 (786 s) | 50 | 0 | [0 ; 7,11] % | 0 / 550 | 3 (sur 553 appels) | `UND_ERR_SOCKET` 250, `ECONNREFUSED` 50 |
| s5-D2 20:33:21 -> 20:40:27 (5 s) | 50 | 0 | [0 ; 7,11] % | 0 / 550 | 6 (sur 556) | `UND_ERR_SOCKET` 250, `ECONNREFUSED` 50 |
| s5-D3 20:40:27 -> 20:47:29 (0 s) | 50 | 0 | [0 ; 7,11] % | 0 / 550 | 6 (sur 556) | `UND_ERR_SOCKET` 250, `ECONNREFUSED` 50 |
| s5-D4 20:47:29 -> 20:54:30 (0 s) | 50 | 0 | [0 ; 7,11] % | 0 / 550 | 7 (sur 557) | `UND_ERR_SOCKET` 250, `ECONNREFUSED` 50 |
| **D total** | **200** | **0** | **[0 ; 1,83] %** | **0 / 2 200** | 22 (sur 2 222) | 5 et 1 par course : les classes voulues |

- **Avant / apres, meme charge** : A-base 13 / 60 (21,7 %, IC [12,07 ; 34,20] %) contre D 0 / 200 (IC [0 ; 1,83] %) ; test exact de
  Fisher unilateral p = 1,76e-9 (`stats.mjs`, `lgamma`). Le test corrige ne lie plus aucun port <= 10080 : ports demandes et lies
  dans [10114, 65067] ; les 22 relances d ecoute sont toutes `EACCES` (20 dans les plages exclues 23892-23991 et 57634-57933, 2 hors
  de ces plages : 19634 et 29962, relus en section 12) et l aide a chaque fois lie le port suivant tire.
- Occupation CPU de l hote pendant D : 53,0 / 55,9 / 54,9 / 55,4 % (A-base : 73,3 %) ; la charge PILOTEE est identique (8 processus,
  meme politique de curseur), le fond de l hote (autres agents) ne l est pas : il est mesure, pas controle.
- C-V-4 a chaque prise : 16 a 20 node.exe, 17 770 a 18 717 Mo libres. Curseur rendu a 12000 a la fin de chaque session.
- Preuves (sha256) : `s5-D1/session.json` `983f5013da571ec9820b0c1e5b79dd1f7186cca1a9cb881325a8430988220253`, `runs.jsonl`
  `5e2e680ee8f60855be5debad0cc10deab8aef031c8f4cc75318897d8a6c9972b`, `analysis.json` `f1160fc579e1fd70fd3bd9528ff5a44a338d989c02429b479e32339032a615f8` ;
  `s5-D2/session.json` `8db0596c453201146d0dc2ef4e183aec6d9466dce757cb078628c4c3d1207532`, `runs.jsonl`
  `ce6250ad9dadb253699652359235e7a58ab0b526dffaf77389ab5a5e963213ee`, `analysis.json` `709acf7fc6f51bd7135a2adb73b99bb27d2461fb45944a516303dcb4d18b58be` ;
  `s5-D3/session.json` `ed76631f9e22a6fa482d0028d0b7e2944a81c1a9a56b2b5f603b54dff02c476e`, `runs.jsonl`
  `b46249d18286b0bcb5e66614e8803429d1471447223dc78f99e5af07c2117b87`, `analysis.json` `c96b85dd309595d178bd9a1fc4aad9d91407a2abc480692af551abbb04ebee20` ;
  `s5-D4/session.json` `e137a6892d659d016af0c37eb92922a6a4b8984f4b8397b2238d9c4bbf23856d`, `runs.jsonl`
  `7854545d0b60dee42ec9db223433926cf4521482d8fc5416e05f437cf69bb02b`, `analysis.json` `c5c0269436ce677496ceb732c5dc4308c08dae200e0831f92e2efcd81ba7a05a`.
  Relances d ecoute : `tools/listencalls.mjs` (sha256 en section 13) sur chaque session.

## 8. Preuve rouge du tronc (`red-proof`) : non applicable, rendue telle quelle

- Commande (sous mon verrou, `tools/locked.mjs` : pris 20:32:48.942Z, rendu 20:33:17.036Z, attente 2 ms ; TEMP/TMP/TMPDIR sous le lot,
  `GIT_OPTIONAL_LOCKS=0`, `< /dev/null`) : `node F:/Monark/scripts/red-proof.mjs --base 31e119ec --gel F:/Monark-wt-probeload --out
  F:/tmp/methode/probeload/red-proof-1`. Sortie : `red-proof REFUSED: 0 judged, 10 unchanged, 0 killer(s) drawn`, exit 1
  (`evidence/red-proof.log` `1a00119b0cdeaf6a25f2485f8b16c8a44e9b523b9899c47cfbc13993f3257612`).
- `red-proof-1/RED-PROOF.json` `43a0260f0a0edb47e3cd80997aa42ae7c3ba6d7cb3ecd8b8a96f39a025f97c4c` (digest du gel
  `558ea4c8ff26055daf2b38041667503501060146b9380b1a770bb917e637efbc`) ; `base.tap` `6bd3109102d09288cc8ffec80eab8f2b6eb0e0025c2a2bca94af519d223d4103`
  et `gel.tap` `f667ff66f3ea0aad7e22cc74f9334ebecc6f038cb49893b6f3c2e676f709186e` : 10 / 10 verts chacun.
- Raison, lue dans l outil (`judgedOf`, l.122-127) : une ligne changee ne juge un test que DANS son corps ; les lignes changees
  (l.84-99) sont dans l aide, hors de tout corps : 0 test juge, refus par construction. Aucun test n est neuf ni change au sens de
  l outil ; ajouter une assertion pour forcer un F2P serait refuse comme auto-confirmant (verte a la base sur tout curseur hors des
  ports bloques). La preuve d un correctif d environnement est differentielle : A (base) contre D (corrige), meme charge (section 7).
  Question Q-3.

## 9. Oracle du tronc (role G1) : VERT

- Avant : `held("F:/tmp")` a 20:56:04 UTC = tenu par le pid vivant 369940 (G2 d un autre lot) : mon oracle attend en file FIFO,
  verrou jamais pris de force. Lance APRES la fin de D (20:54:30 UTC), pour ne pas ajouter ses portes statiques a la charge de D.
- Commande (20:56:04 UTC, arriere-plan, TEMP/TMP/TMPDIR sous le lot, `GIT_TERMINAL_PROMPT=0`, `GIT_OPTIONAL_LOCKS=0`, `< /dev/null`) :
  `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-probeload --base 31e119ec`. Aucune course ni aucun harnais de
  ma part pendant sa suite sous verrou (mes seules commandes : lectures de fichiers et `ls`).
- Sortie (`oracle-1.log`) : `oracle-result {"exit":0,"record":<le record ci-dessous, chemin Windows>,"sha256":
  "d34aec21f2519fc183e13a0efddcda9cc0b068b79f0dbbf95e59b961a35f5aa2"}`, exit 0 (21:17:38 UTC).
- Record `F:/tmp/oracle-results/31e119ec23e6102e8ebc76b9b411be75ec31cd1e-bd0a9add38f0a132-G1-20261003T205605Z-327016.json`, sha256
  `d34aec21f2519fc183e13a0efddcda9cc0b068b79f0dbbf95e59b961a35f5aa2` (recalcule a 21:18 UTC, egal a la sortie) ; `tree.dirty`
  `bd0a9add38f0a1325b55e428c2cedc79b917ac46c548c5c170ba3f194a90ae7b`, `tree.object` `cb6b4c3f3cea4732aed88d4cd4798abd57e78d1c`,
  `served_from: null` (rejoue), attente du verrou 742 s, C-V-4 du record : 17 295 Mo libres, 20 node.exe.
- Portes : 8 statiques vertes (lint-model-pinning, r25, lang:gate, export:check, gate:vocab, typecheck, lint, lint:ratchet) ;
  `test` verte (461 999 ms) : 2 034 tests, 2 030 verts, 0 rouge, 0 annule, 4 sautes. Journal `09-test.log` du record (sha256
  `8471952cb321e3cf9521fc37647d75fea4a057885c623ba5e0519744c8bfe660`) : les 10 tests du fichier verts (l.2437-2446) ; le test 42
  execute une fois, dans la suite.

## 10. R-25

Record (porte `r25`) : STAT 16 insertions, 2 suppressions, 18 lignes (borne CI `VIBEGATES_PR_LIMIT` 1205) ; CONTENT_STAT 0 / 8000.
Borne de la mission (D-Z) : 547 ; 18, marge 529 (au-dessus de 10 : aucune scission, REGLES ligne datee 13:0x).

## 11. Items et questions (aucune tranchee seul)

- **Q-1 (LOOPBACK-SEQUENTIAL-PORTS-1 : declencheur atteint)** : son declencheur ("premier rouge d oracle dans une phase basse",
  `docs/G1-lot-series-intervals.md` l.319) est atteint : le rouge de l oracle `e970c488` lui est attribue par mesure (section 5).
  A la base `31e119ec`, 10 AUTRES fichiers lient le port 0 (`grep -rln "listen(0"` sur `tree-base`, 20:57 UTC) :
  `apps/bell/test/bell-verify.test.ts`, `apps/bell/test/helpers/bell-served.ts`, `apps/bell/test/helpers/net-probe.mjs`,
  `apps/dojo/test/dojo-verify.test.ts`, `test/bell-deploy-config.test.ts`, `test/dojo-verify-url.test.ts`,
  `test/probe-narabi.test.ts`, `test/verify-bell.test.ts`, `test/verify-dojo.test.ts`, `test/verify-harness-liq.test.ts` ; ceux
  qui joignent leur serveur par `fetch` (ou par une CLI qui l utilise) ont la meme exposition, non mesuree fichier par fichier.
  Construction a choisir par l orchestrateur : (a) l aide partagee (trois copies identiques existent desormais : binance, coinbase,
  ce fichier ; ~15 lignes + 1 par fichier) ; (b) la plage dynamique de l hote relevee au-dessus de 10080 (acte d administration de
  l investisseur, hors depot ; demande formee de l item). Mesure d acceptation disponible : ce banc (`tools/bench.mjs`, politique
  `bad`), fichier par fichier ; prix : ~8 minutes de verrou par fichier pour 60 courses.
- **Q-2 (sonde servie ; item propose PROBE-BADPORT-REASON-1)** : `fetchTimeline` rend `unreachable` pour TOUTE exception de `fetch`
  (l.295-296). Une `PROBE_URL` reglee par erreur sur un port de la liste serait lue `unreachable` a jamais (essais instantanes, aucune
  connexion), indiscernable d une surface tombee. Construction : la refuser AVANT tout appel avec une raison nommee, comme
  `insecure_url` dans `urlTransportAllowed` (l.221-237) ; prix ~3 lignes et 1 cas de test ; c est un changement du comportement servi
  (raison neuve dans l ensemble ferme de `narabi.json` et du courriel) : decision de l orchestrateur ; NON fait ici (la cause de ce
  lot n est pas dans la sonde). Declencheur propose : decision de l orchestrateur, ou prochain lot qui touche la politique de
  transport de la sonde.
- **Q-3 (preuve rouge)** : `red-proof` juge 0 test par construction (section 8) ; preuve retenue : differentielle, A contre D sous
  meme charge (section 7). A confirmer.
- **Q-4 (PROBE-NARABI-LOAD-1)** : cause mesuree, correctif, preuve : proposition de clore l item a la fusion (ecriture d ETAT par
  l orchestrateur ; aucun fichier sous `docs/` touche ici), en le reliant a Q-1.
- **CURSOR-SUITE-RATE-1 (item forme, recherche)** : la vitesse de la sequence pendant une suite complete n est connue qu a k tours
  pres (section 5, point 1). Construction : une cellule `suite` du banc, sous MON verrou (jamais pendant la suite d un autre lot ni
  pendant mon oracle) : la commande de `npm test` sur une copie d arbre avec ses `node_modules` en jonctions (comme l oracle), et un
  echantillonneur qui lit la sequence toutes les 5 s (une liaison par lecture) ; sortie : ports par seconde pendant une suite, et
  passages par 1024-10080, d ou le taux naturel attendu de rouge des fichiers de Q-1. Prix : ~10 lignes de `tools/bench.mjs`, ~10
  minutes de verrou. Declencheur : decision de l orchestrateur sur Q-1.
- `error_origin` propose (assigne au G7) : environnement (sequence du port 0 de l hote a partir de 1024 et liste de ports de `fetch`
  du runtime) rencontrant l aide `listen()` du test (port 0) ; latent depuis l ecriture du fichier ; pas la sonde.

## 12. Ecarts consignes et faits annexes

- **E-1** : un `git status --porcelain=v1` SANS `--no-optional-locks` dans le worktree (19:15 UTC, premiere lecture) : il peut
  rafraichir le cache stat de l index (aucun contenu change) ; toutes les commandes git suivantes portent `GIT_OPTIONAL_LOCKS=0` et
  `--no-optional-locks`.
- **E-2** : un heredoc Bash de plus de 8 Ko a echoue au lexage (HARNESS-BASH-8K-1, entre les commandes horodatees 20:12:47 et 20:15:28 UTC) : rien ecrit ; le journal est ecrit
  par morceaux (outil Write, puis `cat >>`).
- **E-3 (effet de bord declare)** : mes sessions ont deplace la sequence de ports GLOBALE de l hote : 2 172 253 liaisons de port 0
  (sockets d ecoute seules, aucune connexion, aucun TIME_WAIT) et 35 tours complets sur les 9 sessions ; pendant les courses `bad`,
  la sequence etait dans 1024-10080 : tout autre processus de l hote qui liait le port 0 ou se connectait a cet instant y puisait
  (une course legere d un autre agent hors verrou pouvait tomber sur un port bloque). Fin de chaque session, avant liberation :
  sequence rendue dans [12000, 60000] (`cursor_end.after` = 12000, ou 14963 pour s4 deja haute).
- **E-4** : la contre-epreuve d environnement n a pas pu priver l enfant de `SystemRoot` (section 6 bis) : resultat consigne comme
  mesure, la conclusion n en depend pas.
- **E-5** : pilote s0 avec des versions anterieures de `bench.mjs` et `instr.mjs` (pid du lancement nul) : hors de tout taux.
- **E-6** : le banc lance `node --test --test-reporter=tap` (l oracle passe par `npm test`, rapporteur par defaut) : sans effet sur
  le test, necessaire a la lecture des assertions.
- **E-7** : A-base en une session de 60 courses, D en quatre sessions de 50 : memes parametres (8 CPU, politique `bad`, preload) ;
  le fond CPU de l hote differe (73,3 % contre 53 a 56 %) : mesure, non pilote.
- **Fait annexe (relances d ecoute de D)** : plages exclues relues a 20:58:06 UTC, inchangees (`evidence/netsh-ports-2.txt`
  `f339ef856f75acf2e9119d03734a05f50fbb75768e699d32d46bfa604f58738a`) ; des deux `EACCES` hors de ces plages, 29962 portait a
  20:58:12 UTC une connexion etablie d un autre processus sur une autre adresse locale que 127.0.0.1 (`netstat -ano -p tcp`) ; 19634
  n y figurait plus. L aide les traite comme toute erreur d ecoute : un autre port est tire.

## 13. Cloture

- **Livre** (worktree `F:/Monark-wt-probeload`, branche `lot/probe-load`, base `31e119ec`, NON commis : R-20) :
  `test/probe-narabi-state.test.ts` sha256 `cbf5e97d623df60e9cb4d9b3cc98ff8d569c4f0dbf173289bcd0caf6c1818918` (444 lignes), seul chemin
  change (`git --no-optional-locks status --porcelain=v1 --untracked-files=all` a 21:18 UTC : ` M test/probe-narabi-state.test.ts`
  seul ; HEAD `31e119ec`) ; sonde `scripts/probe-narabi.mjs` inchangee (`4e4338c026ad650882ebde28b2af2c2fa7a457ca2077788a30382251483883b8`).
- **Journaux** : `F:/tmp/rech/probeload/G1.md` (celui-ci), `F:/tmp/rech/probeload/REPONSE.md`, `F:/tmp/rech/probeload/DELIVERED.sha256`
  (empreintes et garde d octets mesurees en fin de redaction).
- **Banc** sous `F:/tmp/methode/probeload/` : `tools/`, `plans/`, sessions `s0-pilot`, `s1-pilot2`, `s2-A`, `s3-controls1`,
  `s4-controls2`, `s5-D1` a `s5-D4` (chacune : `plan.json`, `session.json`, `runs.jsonl`, `analysis.json`, `runs/<cellule>/<i>/`),
  `red-proof-1/`, `envcontrol/`, `evidence/`, copies `tree-base/` et `tree-fix/`, journaux `*.log`, `oracle-1.log`
  (`82a2a15ed6bbdb4bbe3524946780517ad35ab0c45674433e02e2c286ebb297ec`). Outils ajoutes apres la section 3 : `locked.mjs`
  `0edb02a19b77a77dcc57cd3d13e426d73c1e9bbd63383447cc1a517137fd87e6`, `envcontrol.mjs`
  `85a2953e07c3977f2d993450061e7efdfbd067c5005a2c201f2cdc9dc9df188f`, `listencalls.mjs`
  `7c1079591519d707c9b908276350b4d53229dda87526003b6df93e224fe3fc37`.
- **Verrou** : 9 sessions de banc, 2 commandes legeres (`locked.mjs`) et l oracle, chacune par `acquire` du tronc, jamais forcee ;
  aucune experience de charge hors verrou ; hors verrou seulement des lectures (`netsh`, `netstat`, `held()`, lecture
  de la source embarquee, analyses hors ligne) ; aucune entree de file restante a moi (21:18 UTC : deux entrees d un autre lot).
- **Isolation git** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; aucun git ecrivant dans le worktree ni dans
  `F:/Monark` (lectures : `rev-parse`, `status`, `diff`, `ls-files`, `archive`, `show` ; ecart E-1) ; les clones `--no-local` de `red-proof` et de
  l oracle sont faits par les outils du tronc sous `F:/tmp`.
- **Reseau** : aucun ; seulement des serveurs de boucle locale sur 127.0.0.1 ; aucun outil web appele.
- **Disque** : rien sur C: (TEMP/TMP/TMPDIR sous `F:/tmp/methode/probeload/tmp` ; aucun PowerShell).
- **Jonctions** : `mk-nm.ps1` et `rm-nm.ps1` jamais lances (ni sur `F:/Monark` ni ailleurs : le fichier de test n importe que des
  modules integres et des fichiers du depot).
- **Docs** : aucun fichier sous `docs/` modifie. **Valeurs** : aucune valeur de marche.
- **Questions** : Q-1 a Q-4 (section 11), aucune tranchee seul.
