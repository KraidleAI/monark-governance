claude-opus-5-5

# G1 — lot FAST-CORR (corrections de la relecture G2 de FAST-START, partie 2 de la page) — 2026-10-01

Correcteur, instance fraîche, palier `claude-opus-5-5`, effort `max` (R-1 : modèle résolu `claude-opus-5-5`). Mission scellée
`F:/tmp/dojo/mission-fast-corr.md`, sha256 `064163d1cc3576c95b586e47955b35cc37602a39303c64a9dcf10ce647491a70`, recalculé à 13:30:40Z
avant lecture : égal au sceau. Worktree `F:/Monark-wt-fast`, branche `lot/fast-start`, HEAD `5f694f8314415f27f51e3d40f6243c14c64c25d1`
(arbre propre à 13:30:51Z), base du lot `89403796`. Aucun git écrivant dans le worktree ni dans `F:/Monark`, aucun `GIT_DIR`, aucun
`--write-tree`, aucun réseau, rien sur C: ; TEMP `F:/tmp/dojo/fastcorr/tmp`.

## 1. Lecture, liste des corrections et compte (écrits avant toute modification, 13:4x UTC)

| Entrée | Lignes | sha256 |
|---|---|---|
| `F:/tmp/dojo/g2-fast/RAPPORT.md` (constats, avis Q-2) | 303 | `d87de6a5368f5b0cf181022fb1b245cb5cae4ef5a312c90ff7301e17aa791fbd` |
| `F:/tmp/dojo/g2-fast/probe/q2-eve.mjs` (sonde Q-2) | 34 | `55be2d75d629bf8772cc177ae8269d802f5cfc2614f4b4e359a3987e33941b20` |
| `docs/G1-lot-fast-start.md` | 256 | `3cfdca6b9eed066af82f496edc5e242c18db319a2122599b185c7aedc4429143` |
| `apps/dojo/src/history-collect.ts` | 476 | `c8e80c88de1ab0bd601c9225994ccb334a36bfb47e5ba364621582e826335fac` |
| `apps/dojo/src/history-build.ts` | 273 | `597bba2ad70976ea166229a76aabca177629be7dc5e82dbb85a6c0d71943a96c` |
| `apps/dojo/test/dojo-history-provisional.test.ts` | 158 | `3e15ee4bdb7ff42f1e6dc3c6303b0e7f48c84a04835e945cc8c11bac64adbdac` |
| `apps/dojo/test/helpers/history-chain.ts` | 141 | `4a88317d3e07f0913b4038741c1b1bbc20502282507e2a04b753529a7a15d39f` |
| `docs/RUNBOOK-dojo.md` (sections 5, 7, 10, 15 à 18) | 935 | `8fefc99b36522061a5d18468085d9d3492ca54b993d28dabb64a3c5d9aabb464` |
| `test/dojo-publish-deploy.test.ts` (épingles du mode d emploi) | 469 | `bf3aa53d060e4dc024224983a924a56c2390e915d5a6dfc599db3c7e3afcdba4` |
| `F:/Monark/scripts/red-proof.mjs` (`parseKiller`) | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` (= mission) |
| `apps/dojo/src/layout.ts` (`readEve`), `reading.ts` (`composeAddresses`) | 97, 238 | `75abccd6…7e2f`, `b5908f85…01c8` |

Corrections (décisions de l orchestrateur de la mission) et conséquences nécessaires :
- **K-1, Q-2 (b), code** : `history-build.ts`, `provisionalEve` seul. L Eve rendue (donc écrite sous `provisional/`) est l union, en ordre
  d octets et sans doublon, de l Eve calculée (lignes de J − 1) et des propriétaires de solde strictement positif à S_CUT (soldes de
  `rebuild` après sa boucle, chaque adresse ajoutée classée comme le propriétaire d une ligne, `read_malformed` sinon). `buildHistory`
  inchangé à l octet (mode normal). `eve_empty` reste jugé sur l Eve calculée, avant l union (Q-1).
- **K-2, test neuf** dans `dojo-history-provisional.test.ts`, sa ligne `// killer:` sur la ligne de l union : une adresse à 0 au début de
  J et > 0 à la coupe, absente de l Eve de J − 1, est dans l Eve provisoire ; un propriétaire à 0 à la coupe, hors Eve de J − 1, n y est
  pas ; un acquéreur après la coupe n y est pas ; la course normale sur la même chaîne et la même coupe garde l Eve de J − 1.
- **K-3, test 2 du fichier** (`dojo_history_provisional_course_writes_the_eve_alone`) : son attendu suit l union si, mesuré dans son
  monde (coupe = dernier créneau), l union diffère de l Eve de J − 1 ; sinon inchangé.
- **K-4, C-1** : section 7, acte (6), l attendu d un départ après J ; le STOP « a start on another day » de la section 5 ne vaut pas pour
  ce départ (dit dans la section 7 ; la ligne du STOP de la section 5 et toute ligne portant l adresse de l hôte inchangées).
- **K-5, N-1** : section 18 (i), le STOP `provisional_day_future` dit « J is after today at the operator's clock ».
- **K-6, N-2** : section 18 (ii) et (iii), la course FINALE : les commandes de 18 (i) avec `--first-read` d à la place de
  `--provisional-day` J, et la même reprise sur `method_cap`.
- **K-7, N-7** : section 10 (ordre), CA-0 après la première publication (après A-8 (5) à (9), sans casser l épingle
  « → the first `snapshot` (d) published → A-8 (5) to (9) ») ; section 15 (« When ») alignée ; l épingle « CA-0 → A-8 (1) to (4) » suit.
- **K-8, conséquence de K-1** : section 18 (iv), le résidu B-1 réécrit pour l Eve avec union (G2 section 5 : le texte de la tête est juste
  pour l Eve de J − 1 seule).
- **K-9, réancrage** des tueurs déplacés par les lignes ajoutées : `RUNBOOK-dojo.md` 453, 608, 814, 857 et `history-build.ts:97`.

| Fichier | Estimé (insertions + suppressions) | Nature |
|---|---|---|
| `apps/dojo/src/history-build.ts` | 12 | K-1 |
| `apps/dojo/test/dojo-history-provisional.test.ts` | 45 | K-2, K-3, tueur 97 réancré |
| `test/dojo-publish-deploy.test.ts` | 12 | K-7 (épingle), K-9 (quatre tueurs) |
| **Total** (assiette R-25) | **≈ 69** | correction seule ; lot entier ≈ 317 + 69 = 386 ; borne 1 150, porte CI 1 205 |

`docs/RUNBOOK-dojo.md` et ce journal sont hors assiette (`ci.yml`, `:(exclude,glob)docs/**/*.md`).

## 2. Réalisation (décision → fichier → test)

- **K-1** (`apps/dojo/src/history-build.ts`, sha256 au gel `c3f87f4146ca811f7c0ce6322ede4df07f92fbf51fe8907d324eeac5acfff74b`, 281 lignes) :
  `rebuild` rend en plus `atCut` (l.243 : les propriétaires de solde > 0 dans la table `bal` après sa boucle, donc après chaque transaction
  admise de créneau ≤ S_CUT). `provisionalEve` (l.91-103) juge `eve_empty` sur l Eve calculée (l.100, sémantique inchangée), classe chaque
  adresse ajoutée par `ownerClass` (l.101 : `read_malformed` sinon, comme `klass` pour le propriétaire d une ligne) et rend l union en ordre
  d octets, sans doublon, `accounts: []` (l.102). `buildHistory` (l.87-90) n est pas touché : il ne lit que `.build`, donc le mode normal
  (paquet final) garde son Eve. Tests : `dojo_history_provisional_eve_holds_the_owners_at_the_cut` (neuf, tueur `history-build.ts:102`) et
  `dojo_history_provisional_course_writes_the_eve_alone` (attendu suivi, K-3).
- **K-2, test neuf** (`apps/dojo/test/dojo-history-provisional.test.ts`, sha256 `d605d9e5bacd8398b1e76970ac08dd716de369253e09a6518c3ef63db85c1f1b`,
  204 lignes) : `world(40, 1, 24, { gap: 20_000, close: [36] })`, P = J = 2026-09-14 (jour 5), coupe = créneau de la 6e des 11 transactions
  de J ; course réelle A, B, C par la CLI : l Eve écrite = Eve de J − 1 (oracle recodé) ∪ détenteurs à la coupe (vérité de la chaîne), en
  ordre d octets. Quatre classes jugées, non vides : (a) acquéreurs de J avant la coupe (0 au début de J, > 0 à la coupe, hors Eve de J − 1)
  présents ; (b) propriétaires à 0 à la coupe hors Eve de J − 1 absents ; (c) acquéreurs après la coupe absents ; (d) adresses de l Eve de
  J − 1 à 0 à la coupe gardées. Course NORMALE sur la même chaîne et la même coupe (`--first-read` = jour 5 écrit par l écrivain de PR-2) :
  `publish/eve.json` = Eve de J − 1, sans union. Appel direct de `provisionalEve` sur les corps lus : la même union ; un propriétaire
  ajouté rendu illisible (« 0 », sans ligne sur aucun jour) arrête `read_malformed`.
- **K-3** : mesuré avant d y toucher (sonde `F:/tmp/dojo/fastcorr/tmp/probe/classes.mjs`, 13:44 UTC) : dans le monde du test 2 (coupe = dernier
  créneau), l Eve de J − 1 a 3 adresses, l union 7 ; l attendu du test 2 devient `withHolders(oracleEve(txs, pd - 1), txs, f.cut)` (l.129).
- **K-4 à K-8** (`docs/RUNBOOK-dojo.md`, sha256 `11e1c3c51f89798bf3ffc6c553164e6fc2d77d8445089380c089d617d3cee3d3`, 974 lignes) : C-1 en
  section 7 l.267-273 (attendu d un départ après J ; le STOP « a start on another day » de la section 5 ne vaut pas pour lui, dit ici ;
  la ligne de ce STOP inchangée) ; N-7 en section 10 l.366-373 (CA-0 après A-8 (5) à (9)) et section 15 l.539-545 ; N-1 l.740 ; N-2 en
  18 (ii) l.787-813 (commande de S_CUT, course finale, reprise sur `method_cap`) ; K-8 en 18 (iv) l.868-873. Test :
  `dojo_runbook_counts_without_rehearsal_and_stamps_after_the_first_publication` (`test/dojo-publish-deploy.test.ts`, sha256
  `252fbcbbdf67cd712b49875ec3c304404c6f0cd590cd247c72ead1f025c5cc74`, 474 lignes) : épingle CA-0 suivie, assertion neuve sur C-1, N-1,
  N-2 et le résidu.
- **K-9** : tueurs réancrés (texte `before` relu sur sa nouvelle ligne, une occurrence ; `parseKiller` du tronc par
  `F:/tmp/dojo/fastcorr/tmp/tools/killers.mjs` : 33 tueurs des cinq fichiers de test du lot, 0 défaut) : `history-build.ts` 97→100 ;
  `RUNBOOK-dojo.md` 453→460, 608→617, 814→851, 857→896 ; neuf : `history-build.ts:102`.
- **Aucun STOP retiré** (`F:/tmp/dojo/fastcorr/tmp/tools/stops.mjs`, de `**STOP` au premier point ou point-virgule, lignes jointes) : 63
  avant, 65 après ; une seule phrase changée, celle de N-1 (décision) ; ajoutés : le STOP de la commande de S_CUT et celui de la course
  finale (N-2). `stops-head.txt` `2edaa79e…d1bd`, `stops-after.txt` `660e2d72…adbb`. Lignes du diff du mode d emploi portant une adresse
  IPv4 : 0 ajoutée, 0 retirée ; aucune ligne ajoutée de plus de 160 caractères.

## 3. Compte mesuré (`git diff --numstat 5f694f83`, worktree, assiette R-25 hors `docs/**/*.md`)

| Fichier | Estimé | Mesuré | Nature |
|---|---|---|---|
| `apps/dojo/src/history-build.ts` | 12 | 14 + 6 = 20 | K-1 |
| `apps/dojo/test/dojo-history-provisional.test.ts` | 45 | 49 + 3 = 52 | K-2, K-3, tueur 97→100 |
| `test/dojo-publish-deploy.test.ts` | 12 | 11 + 6 = 17 | K-7, assertion C-1/N-1/N-2/résidu, K-9 |
| **Total** | **≈ 69** | **74 + 15 = 89** | lot entier (base `89403796`) : 320 + 56 = 376 ; borne 1 150, porte CI 1 205 |

`docs/RUNBOOK-dojo.md` : 50 + 11 (hors assiette). Écart à l estimé (+20) : le test neuf porte aussi la course normale et l appel direct ;
l assertion épinglée de C-1, N-1, N-2 et du résidu n était pas prévue. Mesure par `r25.mjs` : section 5.

## 4. Tuyaux (règle Branchement)

- **Entrée** : la course provisoire de l opérateur (A-11 (i)), `history-collect.ts --provisional-day J --cut <créneau>` → `provisionalEve`.
- **Sortie** : `<état>/provisional/eve.json`, désormais l union → `bundles/<o>/eve.json` de l hôte → lu par `collect.ts` (`readEve`,
  `composeAddresses`, qui appelle `ownerClass` sur chaque adresse) au premier jour ouvert ; jamais par l éditeur (`--history` : `publish/`).
- **État** : le `--state` neuf de la course provisoire, sur la machine de l opérateur.
- **Composition prouvée** par `dojo_history_provisional_eve_holds_the_owners_at_the_cut` (CLI réelle → fichier → égalité ; course normale
  sur la même chaîne) et `dojo_history_provisional_course_writes_the_eve_alone` (CLI → `readEve` → refus de `--history` de l éditeur réel).

## 5. Mesures (horodatées `date -u` ; TEMP `F:/tmp/dojo/fastcorr/tmp` ; verrou d hôte relu absent avant chaque course)

- **Clone** `git clone --no-local -b lot/fast-start F:/Monark F:/tmp/dojo/fastcorr/clone1` (13:43:02Z, HEAD `5f694f83`), jonctions
  `mk-nm.ps1` (220 entrées, 11 sous `@monark`, `@monark/rpc-guard` résolu dans le clone) ; les fichiers modifiés et non suivis du worktree
  copiés, sha256 égaux (14:00:5x et 14:06:5x UTC). C-V-4 : 13:49:31Z, 12 `node.exe`, 14 905 Mo physiques et 28 536 Mo virtuels libres ;
  14:06:50Z, 12, 14 307 Mo, 28 278 Mo.
- **Fichier provisoire** (13:49:37-13:49:44Z) : 4 tests, 4 verts (`runs/prov-1.tap` `aa84dc0c…46f9`). À la base (`history-build.ts` de
  `5f694f83` remis dans le clone, 13:49:5x UTC) : tests 2 et 4 rouges par `ERR_ASSERTION`, 1 et 3 verts (`runs/prov-base.tap`
  `d9a5c37a…258c`) ; clone remis à l arbre corrigé (sha256 `c3f87f41…` relu).
- **Course ciblée** (11 fichiers : `dojo-history-provisional`, `-collect`, `-build`, `-read`, `dojo-publish`, `dojo-collect` sous
  `apps/dojo/test/` ; `dojo-history-e2e`, `dojo-entry-link`, `dojo-publish-deploy`, `dojo-collect-deploy`, `dojo-publish-e2e` sous `test/`),
  14:01:00-14:01:54Z : **116 tests, 115 verts, 0 rouge, 1 sauté** (TU-K, préexistant) ; `runs/targeted.tap` `894a7067…9276`. Après
  l épingle du résidu, `test/dojo-publish-deploy.test.ts` rejoué : 12 tests, 11 verts, 1 sauté (`runs/publish-deploy-2.tap` `8a3001f9…b374`).
- **Statique sur le clone** : `tsc --noEmit` code 0 (14:02:08-14:02:16Z) ; `eslint` sur les trois fichiers TypeScript touchés, code 0 (14:02:21Z).
- **Commande de S_CUT de N-2**, mesurée sur un premier jour lu écrit par l écrivain de PR-2 (aide `firstReadDay`, chaîne simulée, jour
  2026-09-14, énumération au créneau 445903396 ; `F:/tmp/dojo/fastcorr/tmp/probe/mkday.mts`) : imprime `2026-09-14 445903396` ; la CLI
  `history-collect.ts --phase A --first-read <jour> --cut 445903396` passe le contrôle du créneau et s arrête plus loin `cycle_missing`
  (variables de cycle absentes, avant tout appel) ; `--cut 445903395` : `inputs_mismatch` ; rien d écrit sous l état ; aucun réseau.
- **`red-proof`** (outil du tronc, `--base 5f694f83 --gel F:/Monark-wt-fast --repo F:/Monark --draw 3 --seed 20261003`) : n° 1
  (14:02:37-14:03:20Z) OK, remplacé par le n° 2 après l épingle du résidu ; **n° 2** (14:05:36-14:06:22Z) : **OK**, 3 tests jugés, tous F2P
  (rouges à la base par assertion, verts au gel : `dojo_history_provisional_course_writes_the_eve_alone`,
  `dojo_history_provisional_eve_holds_the_owners_at_the_cut`, `dojo_runbook_counts_without_rehearsal_and_stamps_after_the_first_publication`),
  13 inchangés, 3 tueurs tirés et tués (`RUNBOOK-dojo.md:617`, `history-collect.ts:449`, `history-build.ts:102`), fichiers restaurés au sha256
  près ; empreinte du gel `1e0599d7…7e36` ; **`F:/tmp/dojo/fastcorr/red-proof-2/RED-PROOF.json`, sha256
  `5e6f4b7be844bb816ddc4064f9b73875252cb530f331e4d2ef8935f72f7a6ddf`**.
- **Campagne de mutants** (outil du tronc `mutants/run.mjs` sha256 `41cdf83f…1ac8`, `--repo F:/tmp/dojo/fastcorr/clone1 --base 89403796
  --killers --table F:/tmp/dojo/fastcorr/table/mutants-fastcorr.mjs` (sha256 `df2326bf…193a`) `--targets` les cinq fichiers de test du lot,
  `--lock-root F:/tmp --min-free-mb 4096`), 14:06:57-14:09:07Z ; `held(F:/tmp)` lu `null` avant, aucune autre course pendant : base verte
  (111 tests, 55,5 s) ; **45 tués sur 46, aucun survivant, aucune ancre perdue** ; K31 non conclu (tueur de `dojo_keyring_shares_no_key_with_bell`,
  test sauté par nom jusqu à A-4p sur cette branche : DOJO-KEYRING-KILLER-REMEASURE-1, préexistant, comme au G1 et au G2), d où la sortie 1
  (`RESULTS.txt` lu). Table : F1 (union forcée dans `buildHistory`, Review Focus 1), F2 (`b > 0n` → `b >= 0n`, Review Focus 2), F3 (contrôle
  de classe retiré), F4 (Eve de J − 1 retirée de l union), F5 (union hors ordre d octets) tués par le test neuf ; F6 (`eve_empty` jugé sur
  l union, Q-1) tué par le test 3 ; D1 à D7 (N-7 deux fois, C-1, N-1, N-2 deux fois, K-8) tués par le test épinglé. Tueurs : les 32 autres
  tués, dont les cinq réancrés (K9 `history-build.ts:100`, K29 l.460, K30 l.617, K32 l.896, K33 l.851) et le neuf (K10 `history-build.ts:102`).
  `F:/tmp/dojo/fastcorr/mutants/RESULTS.json` sha256 `bfbf3127684bb63037d99474918c98dee7bcfc7e2a8a50958a792d0dd53a160f` ; `RESULTS.txt`
  `5a54e3d3…5157`. Jonctions du clone de l outil retirées par `rm-nm.ps1` (14:09:48 UTC, heure du répertoire, MUTANTS-NM-UNLINK-1) ;
  `F:/Monark/node_modules` intact (218 entrées, 11 sous `@monark`).
- **R-25** (`F:/Monark/scripts/oracle/r25.mjs` sha256 `4d0544df…827cf0`, sur le clone figé par un commit local `da660ee3`, jamais poussé) :
  correction seule (base `5f694f83`) STAT 74 + 15 = **89**, CONTENT 0 ; lot entier (base `89403796`) STAT 320 + 56 = **376**, CONTENT 0 ;
  porte 1 205, borne de la mission 1 150 : vert.

## 6. Questions et items (Q-n), chacun avec sa conséquence bornée et son déclencheur

- **Q-1 (`eve_empty` jugé avant l union).** Choix : sur l Eve calculée (lignes de J − 1), comme relu au G2 (M5 tué) et comme le dit le mode
  d emploi (18 (i) l.741 : « an owner holds lots at the end of J − 1, yet no address has a line on it »). Jugé sur l union, l arrêt ne
  tomberait presque jamais (un solde positif à la coupe la rend non vide) et le cas du test 3 (P = 2026-09-11) passerait. Mesuré : F6 tué.
  Options pour l orchestrateur : (a) garder ; (b) juger l union (l arrêt devient lettre morte). Déclencheur : un `eve_empty` réel.
- **Q-2 (classement des adresses ajoutées).** Fait dans `provisionalEve` par `ownerClass`, pas dans `rebuild` par `klass`, pour que
  `buildHistory` (mode normal) ne gagne aucun chemin d arrêt. Risque évité : une adresse indécodable dans l Eve ferait lever
  `composeAddresses` (`reading.ts` l.133) à chaque pas du collecteur sur l hôte, au jour o ; ici, `read_malformed` sur la machine de
  l opérateur, rien de déposé. Mesuré : F3 tué. Aucun propriétaire réel `jsonParsed` mal formé n est attendu : garde fermée.
- **Q-3 (N-2 au-delà de la lettre de la décision, à confirmer).** La décision écrit la reprise sur `method_cap` de la course finale ; la
  proposition du G2 renvoyait aux commandes de 18 (i). Ces commandes tirent `--cut` de la phase A jetable, alors que la course finale
  refuse tout `--cut` autre que S_CUT = max E_e (`history-collect.ts` l.167, DOJO-HISTORY-CUT-CHECK-1) : écrite ainsi, elle s arrêtait
  `inputs_mismatch`. D où la commande de S_CUT (le lecteur même de `setup` : `readDayLayout`, `recordBytes`, `firstRead`), mesurée
  (section 5), et la boucle finale écrite en entier. Options : (a) garder ; (b) réduire à une phrase. Déclencheur : le G7 de la partie.
- **Q-4 (K-8, conséquence nécessaire de K-1).** Le résidu de 18 (iv) réécrit ; « none when that cut is on J and d = J + 1 » ne vaut que si
  la coupe tombe sur J : les deux trous de N-3 (le plus petit des deux créneaux ; un transfert sans le mint, hors de son index) peuvent la
  placer sur J − 1. Item PROVISIONAL-CUT-COVERS-DLAST-1 (G1 Q-3) inchangé, son déclencheur aussi. Le texte du résidu d `docs/ETAT.md`
  (l.156-157, « entre R − 1 et d − 1 ») est celui de l orchestrateur, antérieur à FAST-START : à aligner par lui.
- **Q-5 (C-1 : liste d un départ après J, non mesurée sur l hôte).** L attendu suit le code (`collect.ts` n écrit sur stderr qu en erreur,
  l.300 ; jour abstenu sans appel, l.175-176 et l.202) et la base (`89403796`, l.254-255) ; la liste (six chemins, `bundles/<o>/evidence`,
  et le grand livre du garde pour la balise avant 00:15 UTC) va au JOURNAL, sans STOP. Déclencheur : le premier départ après J.
- **Q-6 (observation hors décision).** 18 (i) donne « the caps of act 1 » à un `X` commun aux phases A, B et C, alors que D-10 de
  ADR-DOJO-PR-2B fixe l acte 1 (phases A et B) puis l acte 2 (phase C) ; la course finale de N-2 reprend « the flags of (i) ». Un plafond
  trop court arrête C sur `run_credits` ou `run_calls`, STOP au texte (N-6 du G2, non décidé). Aucun changement ici ; à l orchestrateur.
- **Q-7 (écarts de discipline, déclarés).** (a) Premier appel git sans `GIT_OPTIONAL_LOCKS=0` (13:30:51Z : `rev-parse`, `branch
  --show-current`, `status --porcelain` sur le worktree) ; mesure : l index du worktree (`F:/Monark/.git/worktrees/Monark-wt-fast/index`) date
  de 12:35:25 UTC, avant cet appel, inchangé à 14:07:16Z ; tous les appels suivants portent la variable. (b) Une copie de travail du mode
  d emploi de la base (`git show 89403796:docs/RUNBOOK-dojo.md`, sha256 d origine `7949b107…a4c` égal au G2) a porté l adresse de l hôte
  quelques secondes sous `F:/tmp/dojo/fastcorr/tmp/` : caviardée sur place (0 adresse restante), renommée `runbook-base-sans-ip.md`.
  (c) La première version de l outil jetable `rep.mjs` portait une barre inverse dans un heredoc (expression rationnelle) : réécrite
  aussitôt, 0 barre inverse mesurée ; non livrée. (d) PowerShell (`mk-nm.ps1`, `rm-nm.ps1`, `Get-CimInstance`) lancé en `-NoProfile` ;
  il peut réécrire ses propres fichiers sur C: (item admis CV4-POWERSHELL-C-WRITE-1) ; aucun fichier du projet ni livrable sur C:.

## 7. Discipline et livrables

- Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun `git add`, `commit` ni `stash` dans le worktree ni dans `F:/Monark` ;
  écritures git seulement dans `F:/tmp/dojo/fastcorr/clone1` (dont le commit local de gel `da660ee3`) et dans les clones des outils du tronc.
  Aucun réseau, aucune clé, aucun accès à l hôte, aucune adresse IP écrite dans un fichier créé ; aucun oracle arrêté ; aucun commit ni
  workflow (R-20).
- Garde d octets des fichiers créés ou modifiés (ce journal, le test, le test épinglé, `history-build.ts`) : section 8.
- Livrables : ce journal ; `F:/tmp/dojo/fastcorr-deliver/REPONSE.md` et `DELIVERED.sha256` ; preuves sous `F:/tmp/dojo/fastcorr/`
  (`red-proof-2/`, `mutants/RESULTS.json` et `RESULTS.txt`, `table/`, `runs/`, `tmp/probe/`, `tmp/tools/`, `stops-*.txt`).

## 8. Garde d octets (`F:/tmp/dojo/fastcorr/tmp/tools/bytes.mjs`, 14:1x UTC)

- Ce journal (créé) : 0 TAB, 0 octet de contrôle, 0 barre inverse, 0 ligne de plus de 160 caractères, 0 adresse IPv4.
- Les 124 lignes ajoutées par la correction (`git diff -U0 5f694f83`, code, tests et mode d emploi) : 0 TAB, 0 contrôle, 0 barre inverse,
  0 ligne de plus de 160, 0 adresse IPv4. Fichiers entiers : le test et le test épinglé à 0 partout ; `history-build.ts` garde ses 4 barres
  inverses et ses 8 lignes longues de la tête ; le mode d emploi ses 15 barres inverses, 25 lignes longues et 62 lignes à adresse de la tête
  (mêmes comptes à `5f694f83`, lus par tube, sans fichier écrit).

## 9. Oracle (arbre final ; ajouté après son passage)

- `node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-fast --base 89403796 --key FAST-CORR` (`GIT_OPTIONAL_LOCKS=0`),
  verrou relu absent au lancement, 14:11:37-14:19:44Z : **code 0**, rejoué (`served_from` nul) ; enregistrement
  `F:/tmp/oracle-results/5f694f8314415f27f51e3d40f6243c14c64c25d1-a62b759b1f57d001-corr-20261001T141137Z-162044.json`, sha256
  `ebe32a96c8affb79e296c85c435e9a2c561ba669f333d9507cc291b89b53045b` ; tête `5f694f83`, recette de l arbre sale `a62b759b…04cc`, objet
  d arbre figé `bc21e82223fec385ce3d16bdcc60800f8d5e8f27` ; **1 853 tests, 1 848 verts, 0 rouge, 5 sautés** (1 852 au G1 et au G2, plus le
  test neuf) ; portes `lint-model-pinning`, `r25`, `lang:gate`, `export:check`, `gate:vocab`, `typecheck`, `lint`, `lint:ratchet`, `test` à 0 ;
  r25 STAT 320 + 56 = 376 (porte 1 205), CONTENT 0 ; C-V-4 de l outil : 14 163 Mo, 13 `node.exe` ; attente du verrou 0 s ; 383 résidus de
  TEMP (comme au G1 et au G2). Verrou rendu ; aucun dossier de course laissé sous `F:/tmp/oracle-runs`.
- Nettoyage : jonctions `node_modules` de `F:/tmp/dojo/fastcorr/clone1` retirées par `rm-nm.ps1` (14:13:49 UTC, heure du répertoire) ;
  `F:/Monark/node_modules` intact (218 entrées, 11 sous `@monark`, relu à 14:13:50Z).
- Delta entre l arbre figé par l oracle et la livraison : ce journal seul (cette section 9 et l heure du retrait des jonctions en section 5) ;
  les quatre autres fichiers égaux au sha256 près (relus à 14:13:50Z, puis à la livraison).
