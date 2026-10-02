claude-opus-5-5

# Journal de correction — DOJO-PARTIE-3-CORR (tour de corrections de la partie 3, après sa G2 unique) — 2026-10-02

- **Rôle** : correcteur de PARTIE (décision 300 : un tour de corrections après la G2 unique de la partie), worker `claude-opus-5-5`
  (R-1 : modèle résolu tel quel, déclaré en première ligne de la réponse et de chaque livrable), effort max, instance fraîche ; aucun
  commit, aucun workflow (R-20) ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, jamais `git write-tree` ; git en
  lecture seule (`--no-optional-locks`) dans le worktree et dans `F:/Monark` ; git écrivant seulement dans mes clones sous `F:/tmp/dojo/p3corr/`.
- **Mission** : `F:/tmp/dojo/mission-corr-partie3.md` (89 l.), sha256 recalculé AVANT lecture (07:13:59Z) :
  `2e3a3ca6588fcabe7bca47e51889fcf8022286b5b420aa5d4904484885e3dd3a` = attendu ; reçu de la porte vert (07:13:47Z, cité par
  l'orchestrateur). Règles insérées `F:/Monark/docs/methode/REGLES-MISSION.md` `d86bb19d…01a5d6` (égal à l'en-tête, lu).
  Outils du tronc recalculés égaux à l'en-tête (07:34Z) : `mission/lint.mjs` `4d1383c8…`, `mission/launch.mjs` `fb6c277f…`,
  `oracle/run.mjs` `f22b9045…`, `oracle/r25.mjs` `4d0544df…`, `red-proof.mjs` `6579b550…`, `mission/gen.mjs` `9eecb371…` ; hors
  en-tête : `oracle/lock.mjs` `501a76b5…`, `mutants/run.mjs` `41cdf83f…`, `mk-nm.ps1` `d70d8aea…`, `rm-nm.ps1` `b51b5d22…`.
  Tronc `F:/Monark` à `3e2ea5cf` à 07:34Z (`f6059d7a` au moment de la G2 ; outils inchangés, empreintes ci-dessus).
- **Worktree** : `F:/Monark-wt-p3corr`, branche `lot/partie3-corr`, HEAD `229e9acaacd441dd1fb0d0addb2f4dca2b3da98e` (= mission), base de
  partie `d1120612b7b5c172509830c1cb314c9580549c41` ; statut vide à 07:14:13Z ; les 23 chemins de la mission à leur sha256 (23/23).

## Heures (`date -u`)

- 07:13:59Z sceau de la mission ; 07:14Z-07:33Z lectures (ordre de la mission, puis hors liste) ; 07:3xZ consultation n° 1 de l'advisor
  intégré (avant toute écriture) ; 07:34:38Z porte d'avant-course écrite et jouée (GO : verrou nul, 9 `node.exe`, 14 886 Mo physiques et
  33 460 Mo virtuels libres) ; 07:35Z ce journal, AVANT toute modification des quatre fichiers.

## Entrées, dans l'ordre de la mission (sha256 et lignes à 07:34Z)

| # | Entrée | Lignes | sha256 | Lu |
|---|---|---|---|---|
| 1 | `F:/tmp/dojo/g2-partie3/RAPPORT.md` | 318 | `ba7514c8ff239a29daa6186079d5df365d216bbec8d5f3ad95499374a8950014` | en entier |
| 1 | `F:/tmp/dojo/g2-partie3/probe/qc1-strings.txt` | 2 | `1f89969c2fbd86f13c1cec853ceaf0ef2f382c25b13a2d9a0eec1969a74cc81b` | en entier |
| 2 | `docs/RUNBOOK-dojo.md` | 1 218 | `b350b1e5a05ded16780ff8f37a7aa08f167a93df7c0ef510a7c1ee93507689e9` | en entier |
| 3 | `docs/RUNBOOK-bell.md` | 585 | `a18add21ee808b324fd7ee4878beac8f2bc69152289f2799547ee4be5906fcbf` | l.1-100, §7 (l.175-319) |
| 4 | `test/dojo-publish-deploy.test.ts` | 538 | `ec9d3b859f6db5da2951707ff9196ade9858a86b288bf654aa3d423d303c7881` | en entier |
| 5 | `test/dojo-live-surface.test.ts` | 414 | `213e33f4681bca284fd53857f7f2e6355659e2f1c5b2dde94670cc7ad4239667` | en entier |
| 6 | `deploy/Caddyfile.monark-dojo-site.snippet` | 36 | `c744cb0129973870b78cf8f372dcb7ab5b0b10ee723422e6d3314bd7695a5407` | en entier |
| 7 | `docs/RUNBOOK-vitrine.md` | 24 | `273d0965cc6a02854a103c96c0760a70ad1f0e1f9ce179c5137c5e67269400d0` | en entier |
| 8 | `F:/Monark/docs/dojo/FAITS-caddy-header-up-delete-2026-10-02.md` | 51 | `28ee292061465f0cc16fd9384e4af316ba52c3393ab97177b08ca1379f95625d` | en entier |
| 9 | `F:/Monark/scripts/red-proof.mjs` | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` | en entier (`parseKiller` l.46-49) |

Hors liste, lus pour agir sur pièce : `docs/adr/ADR-DOJO-PR-3.md` PB-5 (l.485-502 : ordre, ligne TU-7) ; `scripts/sync-dojo-served.mjs`
(en entier : `bindDojoCa` l.64-80, `runSync`, `main`) ; `scripts/verify-dojo.mjs` l.180-205 (`c09`, `c10` et leurs détails) ;
`docs/G1-lot-pr3b2b-1.md` (Q-1 à Q-9) ; `docs/G1-lot-site-send-prep.md` (2.2, Q-1 à Q-4, I-1 à I-3) ; `docs/RUNBOOK-sentinel.md` l.1-125
(§5 : précédent de l'insertion dans le bloc de la vitrine) ; `F:/Monark/docs/ETAT.md` l.288-320 (A-1 fait ; A-6, DOJO-EDGE-CACHE-1 puis
DOJO-SITE-PROXY-1 ; première synchro ; conditions d'envoi) ; épingles du texte des modes d'emploi : `test/dojo-collect-deploy.test.ts`
l.118-130 et l.245-262, `test/bell-deploy-config.test.ts` l.160-242, `apps/bell/test/bell-ops.test.ts` (§8 bis, étape 12) ; outils :
`F:/Monark/scripts/mutants/run.mjs` l.1-177, `F:/Monark/scripts/oracle/run.mjs` l.1-40, `oracle/lock.mjs` (`held`), `oracle/r25.mjs` l.1-25.

## Plan : les corrections, une par une (décisions de l'orchestrateur, mission l.65-74)

- **C-1** (`test/dojo-publish-deploy.test.ts`, commentaires seuls) : les cinq tueurs périmés (l.396 `:617`, l.435 `:954`, l.456 `:898`,
  l.480 `:860`, l.522 `:879`) réancrés sur la ligne qui porte leur chaîne dans le RUNBOOK FINAL (les numéros du HEAD donnés par la G2,
  680, 1018, 962, 923, 942, se décalent de ce que ce tour insère au §15 et au §17 : ils sont recalculés après les édits, jamais recopiés) ;
  contrôle de toutes les lignes `// killer:` des deux fichiers de test par `parseKiller` du tronc et par la règle de `killerProblem`
  (`before` une seule fois sur la ligne) ; `red-proof` rejoué. Rien n'est inséré avant la l.460 du RUNBOOK : le tueur `:460` (l.373)
  reste juste sans être touché.
- **C-2** (`docs/RUNBOOK-dojo.md` §15, §21, §22 ; `docs/RUNBOOK-bell.md` §7, procédure REPLACE → IMPORT) : une étape écrite, §15 (0),
  jouée UNE fois avant la première commande qui nomme l'hôte : empreinte ED25519 que le nom sert (`ssh-keyscan`), comparée à celle de
  l'entrée déjà connue sous l'adresse de la section 1 (gabarit `<address>`, aucune adresse écrite) ; l'entrée CONNUE recopiée sous le
  nom seulement si les deux sont égales, sinon `STOP` ; jamais `StrictHostKeyChecking=no` ni `accept-new` ; puis une première commande
  par le nom en `BatchMode` (échoue plutôt que demander) ; retour arrière `ssh-keygen -R`. Ensuite §21 et la procédure de Bell visent
  `root@bell.monarkgate.tech` (le §15 le fait déjà ; le §22 réutilise les captures du §15). §16, §17, §18, §19 inchangés (Q-1).
- **C-3** (§22 (1) et tête du (4) du §15) : `git diff --quiet "$G7" -- <chemins des outils>` (arbre de travail contre le G7), en bloc
  séparé qui imprime `same_tools=` (au §15, l'enchaîner à la CA mêlerait son échec au `ca0_exit=1` attendu de CA-0).
- **C-4** (§15 (1) et attendu du (4)) : avant le passage IMPORT de Bell, l'absence de `/etc/caddy/monark-bell.caddyfile` n'est plus un
  STOP (attendue ; STOP après le passage) ; `c10` rouge pour `required=false` SEUL, `before_sha256` = `after_sha256` dans son détail ;
  `c09` rouge sur `imports_bell_dojo=false dojo_extract=false` seuls ; entre le passage et A-6 : `c10` vert, `c09` rouge sur ces deux
  seuls ; après A-6 : verts. Mots des détails pris au code (`verify-dojo.mjs` l.191-196, l.201-205).
- **C-5** (`test/dojo-live-surface.test.ts` l.182 et l.225) : chaque ligne remplacée par la ligne de `qc1-strings.txt`, octet pour octet
  (0 CR, 0 TAB, 0 barre inverse, 146 et 137 caractères, mesuré à 07:34Z par `tools/bytes.mjs`) ; aucune assertion ni valeur comparée.
- **N-1** (§15 (3)) : les trois gabarits `public-ca0-<n>` hors guillemets passent entre apostrophes (recommandation du G1, Q-9) ; ceux de
  (4), dans `A="…"`, restent.
- **N-2** (§17) : une phrase après le paragraphe des gardes : elles supposent `pipefail` éteint dans le shell distant ; lecture unique à
  l'acte, avant 18 (iii), par la même cible : `shopt -o pipefail`, ligne attendue `pipefail` et `off` ; sinon STOP. Aucune commande du
  §17 ni du §18 touchée (elles servent cette nuit).
- **Q-4 de PR-3b-2b-1, TU-7** : §23 neuf, après CA-1 : bloquants de la ligne TU-7 de PB-5 ; la CA suivie et égale à HEAD, son `g7` égal à
  `G7.txt`, puis `node scripts/sync-dojo-served.mjs --g7 "$C"` ; attendu = la ligne de `main` (l.171) ; refus nommés (rien d'écrit) ; à
  jouer juste après CA-1, entre deux créneaux (liaison aux `bodies_sha256`, l.77-78) ; retour arrière : avant le commit, les deux
  fichiers rendus à HEAD ; après, `git revert` du commit de synchro (ADR).
- **N-9, DOJO-SITE-PROXY-1** : §24 neuf, sur le serveur du site (cible par l'adresse, gabarit `<site>` : Q-2) : (1) état et `caddy version`
  (v2.11.4, version de la FAITS, sinon STOP) ; (2) candidat (bloc de l'extrait au G7 inséré avant l'unique `reverse_proxy localhost:3000`),
  `caddy validate`, le `diff` lu, rien de vivant touché ; (3) renommage, `reload` ; (4) `caddy adapt` du fichier installé : la liste de
  retraits des trois en-têtes ; (5) les trois chemins relayés (200, `no-store`), puis les trois traversées, chacune précédée de son
  témoin 200 vers l'hôte du Dōjō, lignes de requête relevées par `curl -v` ; retours arrière (a) et (b).
- **N-6** : aucune ligne d'ADR écrite par moi (l'orchestrateur écrit N-6). Toute question ouverte : section « Questions » ci-dessous.

## Compte (AVANT toute modification)

- Tests (R-25) : 7 lignes modifiées en place, 0 ajoutée, 0 retirée : `test/dojo-publish-deploy.test.ts` l.396, 435, 456, 480, 522 ;
  `test/dojo-live-surface.test.ts` l.182, 225. Mesuré (`git --no-optional-locks diff -U0 d1120612 229e9aca`) : la l.396 est à la base
  telle qu'au HEAD (son changement compte +1/−1) ; les six autres sont déjà des lignes insérées par la partie (effet nul). Projection
  R-25 de la partie : 1 126 + 2 = **1 128** ≤ 1 150 (solde 22 ≥ 10, C-V-6) ; porte CI 1 205.
- Modes d'emploi (hors R-25 : `docs/**/*.md` exclus par `ci.yml` l.82) : RUNBOOK-dojo §15 ≈ +25 lignes, §17 +4, §21 et §22 en place
  (lignes recoupées après `&&` si une cible par le nom passe 160 caractères), §23 ≈ +25, §24 ≈ +70 ; RUNBOOK-bell §7 en place (≈ +0 à +3).
- Journal neuf (hors R-25). Aucun fichier de code touché ; aucune ligne exécutable des lots hors des deux messages de C-5.

## Preuves prévues

- Étape (0) EXTRAITE du RUNBOOK livré et rejouée hors ligne : `ssh-keygen` local sur un `known_hosts` de brouillon (HOME de brouillon),
  clés publiques ED25519 faites par `node:crypto` (aucune clé privée écrite), `ssh-keyscan` remplacé par un bouchon sur le PATH qui
  journalise ses appels ; cas : égales, différentes, gabarit laissé tel quel (bouchon jamais appelé), nom déjà connu, scan vide, deux
  entrées ED25519 pour l'adresse, entrée hachée ; formes de `ssh-keygen` (`-F` absent, `-F -l`, `-lf -`) mesurées, jamais devinées.
- C-3 rejoué sur un clone de sonde : arbre propre `same_tools=0` ; fichier suivi modifié 1 ; fichier non suivi 0 (déclaré, Q-3).
- `bash -n` de chaque bloc neuf ou changé et de chaque commande distante (entre apostrophes) qu'il porte.
- Tests du mode d'emploi et du site touchés, puis voisins, sur un clone `--no-local` (TEMP `F:/tmp/dojo/p3corr/tmp`).
- Portes `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, `gate:vocab` sur le clone ; R-25 par `r25.mjs` sur un clone
  jetable (commit de gel local à ce clone seulement).
- `red-proof` : `--base d1120612… --gel <clone corrigé> --repo F:/Monark` (N-10) `--draw 20 --seed 775568550` (32 premiers bits du
  sha256 de la mission, `0x2e3a3ca6`, recette de la G2 vérifiée sur la sienne : `0x578c7cac` = 1 468 824 748). Une ligne `// killer:`
  changée ne compte jamais : seuls les tueurs des tests jugés sont tirés (les deux de RUNBOOK-PRE-IV parmi les cinq réancrés) ; les trois
  autres sont éprouvés par la campagne.
- Tueurs : `mutants/run.mjs --killers --base 229e9aca… --targets` les deux fichiers, sur un clone NEUF (34 lignes `// killer:`).
- Oracle du tronc, rôle `corr`, `--key partie3-corr`, `--tree F:/Monark-wt-p3corr`, `--base d1120612…`, en dernier, derrière la porte.

## Corrections faites (tâche 2), une par une (07:36Z-07:44Z ; numéros de ligne des fichiers FINAUX)

- **C-1** : `test/dojo-publish-deploy.test.ts` l.396 `:617` → `:723`, l.435 `:954` → `:1065`, l.456 `:898` → `:1009`, l.480 `:860` → `:970`,
  l.522 `:879` → `:989` (commentaires seuls) ; chaque numéro lu par `grep -n -F` de la chaîne dans `docs/RUNBOOK-dojo.md` final ; décalage
  = +43 au §15 (étape (0), C-3, C-4) puis +4 au §17 (N-2). Contrôle : `tools/killers.mjs` (`parseKiller` du tronc, règle de
  `killerProblem`) : 34/34 lignes `// killer:` des deux fichiers valides, et 69/69 sur les six fichiers de test de la partie
  (`probe/killers.out` `a2718d84…130c` ; la G2 en mesurait 5 périmées). Le tueur `:460` (l.373) n'a pas bougé : rien n'est inséré avant.
- **C-2** : RUNBOOK-dojo §15 l.543-544 (le nom, seulement après (0)) ; §15 (0) l.546-572 : l'étape de clé d'hôte (bloc l.553) et la
  première commande par le nom en `BatchMode` (bloc l.568), attendus, STOP, retour arrière `ssh-keygen -R` ; §21 : convention réécrite
  (l.1135-1136), quatre commandes par `root@bell.monarkgate.tech` (la (1) recoupée après `;` : 162 caractères sinon) ; RUNBOOK-bell §7
  l.247-248 (convention : le nom, après RUNBOOK-dojo §15 (0)) et cinq commandes par le nom (l.256, 257, 272, 291, 301). Aucun gabarit
  `<bell>` ne reste (`grep -c` : 0 et 0). §22 : ses captures sont celles du §15 (déjà par le nom). §16, §17, §18, §19 inchangés (Q-1).
- **C-3** : §22 (1) (bloc l.1217) et tête du (4) du §15 (bloc l.626, texte l.621-631) : `git diff --quiet "$G7" -- <les cinq chemins>`,
  `same_tools=0` attendu, sinon STOP ; au §15 en bloc séparé (enchaîné à la CA, son échec se lirait `ca0_exit=1`, l'attendu de CA-0).
- **C-4** : §15 (1) l.584-587 (avant la procédure IMPORT de Bell, l'extrait de Bell absent est attendu, nommé par `sha256sum` sur stderr ;
  STOP seulement après elle) ; attendu du (4) l.641-651 : (a) `c10` rouge pour `required=false` SEUL, `before_sha256` = `after_sha256`,
  `c09` rouge sur `imports_bell_dojo=false dojo_extract=false` seuls ; (b) entre la procédure et A-6 : `c10` vert, `c09` rouge sur ces deux
  seuls ; (c) après A-6 : verts ; STOP sur toute autre cause et sur des empreintes avant et après différentes. Mots des détails pris au
  code (`scripts/verify-dojo.mjs` l.191-196 et l.201-205) ; les quatre états relus dans la sonde de la G2 (`probe/ca0-probe.json`
  `22b00b3c…405b`, recalculé, égal au rapport).
- **C-5** : `tools/c5.mjs` remplace l.182 et l.225 par les lignes 1 et 2 de `qc1-strings.txt` (empreinte de la sonde vérifiée, ancienne
  ligne vérifiée avant écriture) ; `cmp` des deux lignes extraites contre la sonde : égal ; 146 et 137 caractères.
- **N-1** : §15 (3) (bloc l.613) : `'/f/PRODUITS/dojo-mirror/public-ca0-<n>'` entre apostrophes aux trois occurrences ; `bash -n` accepte.
- **N-2** : §17 l.806-810, à la suite du paragraphe des gardes : elles supposent `pipefail` éteint ; lecture unique à l'acte, avant
  18 (iii), `shopt -o pipefail` par la même cible, attendu `pipefail` puis `off` ; sinon STOP. La phrase n'écrit jamais le nom de l'unité
  après `is-active` (épingle des cinq gardes IDLE de `dojo_runbook_removes_the_packet_only_without_a_writer`). Aucune commande touchée.
- **Q-4, TU-7** : §23 neuf (l.1251-1280) : quand (juste après CA-1, entre deux créneaux), bloquants (ligne TU-7 de PB-5 et
  PAROXYSME-DOJO-FILE-1 de `docs/ETAT.md` : Q-8), commande (CA suivie et égale à HEAD, `g7` de la CA = `G7.txt`, synchro `--g7 "$C"`,
  `git status` de `apps/site/data`), attendu (ligne l.171 de `main`), refus nommés, commit, oracle, retour arrière (avant le commit : les
  deux fichiers rendus ; après : `git revert` du commit de synchro, ADR). Le renvoi de la fin du §22 pointe le §23.
- **N-9, DOJO-SITE-PROXY-1** : §24 neuf (l.1282-1392) : quoi, quand (`docs/ETAT.md` : à l'envoi, après A-6 et DOJO-EDGE-CACHE-1, et
  après la ligne `history` servie), bloquants ; source du bloc : le SHA de l'envoi du site, jamais `G7.txt` (section suivante) ;
  (1) état et `caddy version` v2.11.4 ; (2) candidat (18 lignes, trois `header_up -` exigés), `caddy validate`, `diff` lu ;
  (3) `mv`, `reload` ; (4) `caddy adapt` du fichier installé, la liste de retraits ; (5) la vitrine et les trois chemins relayés, puis les
  trois traversées, chacune précédée de son témoin `200` à l'hôte du Dōjō, lignes de requête relevées en `curl -v` ; retours arrière (a)
  et (b). Cible par l'adresse, gabarit `'root@<site>'` (Q-2) ; formes non mesurées (Q-5) ; mesure à l'exécution formée en item (Q-6).

## Correction après relecture (pendant l'oracle n° 1, appliquée après lui, avant le gel final) — N-9 : source de l'extrait du site

- Relu à 07:57Z (lecture seule de `/f/tmp/dojo-dn/G7.txt` et du tronc, `--no-optional-locks`) : `G7.txt` vaut `c0c60617…` (2026-10-01,
  partie 2) ; `deploy/Caddyfile.monark-dojo-site.snippet` y a 15 lignes de code, sans les trois `header_up -` (DOJO-SITE-PROXY-XFF-1 vient
  de la partie 3). Ma première écriture du §24 lisait l'extrait à `G7.txt` : sa garde « 18 lignes » aurait arrêté l'acte (sans elle,
  l'extrait d'avant XFF-1 aurait été installé). Corrigé à 08:03Z (§24, texte l.1290-1295, bloc (2) l.1312-1317, attendu l.1320-1323) :
  le bloc est lu au SHA de l'envoi du site (gabarit `'<sha of the sending>'`, le `<sha>` de RUNBOOK-vitrine étape 1), jamais à `G7.txt` ;
  garde ajoutée : trois lignes `header_up -` exigées en plus des 18. `error_origin` : ce tour (écart (4)). Même lecture pour C-3 : Q-10.
- Arbre final (08:07Z) : `docs/RUNBOOK-dojo.md` 1 411 l. `51cf10127460257b8daf0d2005746317131f26d3b226183ff402837b14568654` ;
  `docs/RUNBOOK-bell.md` 585 l. `334fb08599e53a00c7fbfc261822df238a08ed9964b2102b62924d8130f89059` ; `test/dojo-publish-deploy.test.ts`
  538 l. `f457ab72492bc93d5831eda448b81b8d2ee13bd641ace89bf8e802385d3224c2` ; `test/dojo-live-surface.test.ts` 414 l.
  `00834337b6dde97ef01ba0b318a46403eb829bb3b6fa7aa564606414511dc4cb`. La correction est après toutes les ancres de tueurs (l.1065 au plus).

## Mesures (tâche 3 ; preuves sous `F:/tmp/dojo/p3corr/`)

- **Étape (0) rejouée** (07:41Z, `probe/hostkey/replay.mjs`, sortie `probe/hostkey/replay.json` `85acc8ca…514e`) : bloc EXTRAIT du
  RUNBOOK livré (`5e2baa68…19e4` ; bloc `9c41eea8…7f13`), `ssh-keygen` réel d'OpenSSH 10.5p1 (formes de `-F`, `-F -l`, `-lf -`, entrée
  hachée mesurées avant d'écrire), `ssh-keyscan` remplacé par `probe/hostkey/bin/ssh-keyscan` (journalise ses appels, aucun réseau),
  HOME et `known_hosts` de brouillon par cas, clés publiques faites par `node:crypto` (`probe/hostkey/pubkeys.mjs`, aucune clé privée
  écrite). Huit cas : « égales » et « entrée hachée » : `KEY-COPIED`, UNE ligne ajoutée, au nom en clair, la clé CONNUE ; « différentes »,
  « gabarit laissé », « nom déjà connu », « scan vide », « deux ED25519 pour l'adresse », « fichier sans saut final » : `STOP`, fichier
  inchangé (sha256 égal) ; bouchon jamais appelé sous « gabarit laissé » et « nom déjà connu ».
- **C-3 rejoué** (07:45Z, `probe/c3.mjs`, `probe/c3.json` `32e4bbc3…c293`) : les deux blocs (§15 (4), §22 (1)) EXTRAITS, égaux entre eux,
  sur le clone de sonde `probe-clone` (sa tête tient lieu de G7) : propre `same_tools=0` ; fichier NON SUIVI ajouté sous `scripts/` 0 (non
  vu : Q-3) ; `scripts/verify-dojo.mjs` suivi modifié **1**, quand l'ancienne forme `"$G7" HEAD` rend 0 (le défaut de C-3).
- **`bash -n`** (07:44Z, `tools/syntax.mjs`, `probe/syntax.out` `accfbc74…2f56`) : 22 blocs touchés (18 du RUNBOOK du Dōjō, 4 de Bell) et
  leurs commandes distantes : tous acceptés. Refusés, tous NON touchés : 6 blocs du §18 du Dōjō (gabarits `<J>`, `<x>`, `<d>` hors
  guillemets) et 3 blocs de Bell (§8 bis, §9 : `<EXEC_TREE>`, `<G7 of the course>`) : même classe que N-1, Q-4.
- **Lignes ajoutées** (`tools/added.mjs`) : RUNBOOK du Dōjō 215 ajoutées, 26 retirées, 153 caractères au plus ; Bell 7 et 7, 155 au plus ;
  tests 7 et 7, 146 au plus ; 0 barre inverse, 0 octet de contrôle, 0 jeton d'allure IPv4 dans les lignes ajoutées.
- **Tests** (clone `F:/tmp/dojo/p3corr/clone` à `229e9aca`, les cinq fichiers copiés, `sha256sum -c` 5/5, jonctions `mk-nm.ps1` 220 / 11
  `@monark` / 0 échec ; porte GO avant chaque course ; variables DENY retirées ; TEMP sous `F:/tmp/dojo/p3corr/tmp/run` ; « (test 42) »
  exclu) : touchés et lecteurs des deux modes d'emploi, 9 fichiers, 07:46:04Z-07:46:10Z, **60/60 verts** (`probe/touched.tap`
  `56727cc6…e8cc`) ; voisins, 9 fichiers (`verify-dojo`, `dojo-served`, `verify-bell`, `byte-guard`, `no-secret-in-repo`, `dojo-render`,
  `dojo-history-batch-near`, `dojo-verify-url`, `dojo-publish-e2e`), 07:46:31Z-07:46:43Z, **53/53 verts** (`probe/neighbors.tap` `5faab019…c32c`).
- **Portes** sur le clone (07:46:56Z-07:47:47Z, porte GO) : `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, `gate:vocab` :
  **six à 0** (journaux `probe/gate-*.log`).
- **R-25** (pré-mesure sans commit, `tools/r25-pre.mjs` : chemins de `ci.yml` lus par `R25_DIFF_RE` de `r25.mjs`, `git diff --shortstat`
  de `d1120612` contre l'arbre de travail du clone) : `STAT` 1 106 insertions, 22 suppressions, **1 128** (borne 1 150, solde 22 ; porte CI
  1 205) ; `CONTENT_STAT` vide. Égal à la projection du compte. La mesure par `r25.mjs` est la porte `r25` de l'oracle (section suivante).
- **`red-proof`** (07:48:33Z-07:49:39Z, porte GO) : `node F:/Monark/scripts/red-proof.mjs --base d1120612… --gel F:/tmp/dojo/p3corr/clone
  --repo F:/Monark --out F:/tmp/dojo/p3corr/red-proof --draw 20 --seed 775568550`, TEMP sous `F:/tmp/dojo/p3corr/tmp` : **sortie 0, OK** ;
  14 jugés, **14 F2P**, 31 inchangés ; tirage 20 sur une population de 14 : **14 tirés, 14 tués**, dont `docs/RUNBOOK-dojo.md:970` et `:989`
  (les deux tests de RUNBOOK-PRE-IV, refusés « invalid killer » par la G2). `RED-PROOF.json`
  `187a5a91d7c46973ff1ab849b63b9bcd9b6a925e69137baff87411302a9ff9d9` (digest des changements `fc741dd5…c70a`), `base.tap` `6b9a24be…f2b5`,
  `gel.tap` `c00f37a8…b3c8`, sortie `probe/red-proof.out` `80f49505…27c`.
- **Tueurs** (07:50:12Z-07:51:11Z, porte GO, aucune autre course pendant ; clone NEUF `mclone`, fichiers copiés 5/5, jonctions 220 / 11 / 0) :
  `node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/p3corr/mclone --base 229e9aca… --out F:/tmp/dojo/p3corr/mutants --killers
  --targets test/dojo-publish-deploy.test.ts,test/dojo-live-surface.test.ts --lock-root F:/tmp --min-free-mb 4096` : base verte (96 tests),
  **34 tués sur 34**, 0 survivant, 0 non conclu, 0 `anchor-lost`, sortie 0 ; les cinq réancrés : K29 l.723, K31 l.1065, K32 l.1009, K33
  l.970, K34 l.989, tués ; K28 l.460 tué. `RESULTS.json` `1ecd9e870c55d74de8d56ab4b2f83cab8e90831b018b50afc8cf3e2cc3a7455b`, `RESULTS.txt`
  `3a8eb164…3b7f` (lu en entier).
- **Rejeux sur l'arbre FINAL** (après la correction du §24 ; porte GO avant chaque course) : lignes ajoutées 219 et 26 au RUNBOOK du Dōjō,
  155 caractères au plus, 0 barre inverse, 0 contrôle, 0 IPv4 ; `bash -n` : 22 blocs touchés acceptés, mêmes 9 refus non touchés
  (`probe/syntax-2.out` `5fa8a9be…f29f`) ; tueurs 69/69 (`probe/killers-2.out`, identique à `killers.out`) ; blocs rejoués inchangés dans
  le fichier final (étape (0) `9c41eea8…7f13` ; les deux blocs d'outils égaux, `3b5ce6b9…8974`) ; tests touchés et lecteurs des modes
  d'emploi, avec `byte-guard` et `no-secret-in-repo`, 11 fichiers, 08:04:34Z-08:04:40Z, **77/77 verts** (`probe/touched-2.tap`
  `c06aecc8…fbc1`) ; `red-proof` (08:04:47Z-08:05:53Z, mêmes paramètres, sortie `red-proof-2/`) : **OK, 14 F2P, 14 tirés, 14 tués**,
  `RED-PROOF.json` `ada6154fefb4b1cbc7e90381c0572f97148419dc8669c2509dfae88ffefdcf52` (digest des changements `fc741dd5…c70a`, égal au
  premier : les `docs/**/*.md` en sont exclus), `base.tap` `06769473…22cf`, `gel.tap` `26263ee9…c331` ; tueurs sur un clone NEUF `mclone2`
  (08:06:20Z-08:07:19Z, sortie `mutants-2/`) : base verte (96), **34 tués sur 34**, 0 survivant, 0 non conclu, 0 `anchor-lost`, sortie 0 ;
  `RESULTS.json` `fce7d57a3e8cca266bbe42a7903909f09e460f9ef77c1a949449d8ccbdab21ed`, `RESULTS.txt` `6c4873c2…c51d` (lu ; `sha0` du RUNBOOK =
  `51cf1012…`, le fichier final).

## Oracle n° 1 (arbre d'avant la correction du §24, tenu pour trace)

- `node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-p3corr --base d1120612… --key partie3-corr`, derrière la porte
  (GO à 07:54:49Z : verrou nul, 10 `node.exe`, 15 073 Mo et 33 691 Mo libres), en arrière-plan, jamais interrompu, aucune course pendant sa
  suite. Enregistrement `F:/tmp/oracle-results/229e9acaacd441dd1fb0d0addb2f4dca2b3da98e-adbc585e05923255-corr-20261002T075449Z-322612.json`,
  sha256 recalculé `f657cc7e4a7a76dfdbc6b1b7c9d9c9e6586017d75f59a991c0c9cbda263ad7fa` : **sortie 0** ; `dirty` `adbc585e…e0e3` (recalculé
  par `tools/dirty.mjs`, recette de l'oracle l.54-59 : égal) ; neuf portes à 0 ; **1 882 tests, 1 878 verts, 0 rouge, 4 sautés** (connus :
  SIGTERM sous win32, nom 8.3, artefacts u4b) ; test 42 une fois, vert (l.2054 du journal `09-test.log` `dfeb0373…871d`) ; R-25 par
  `r25.mjs` : 1 106 + 22 = **1 128** (`02-r25.log` `8e3cba5e…e3a2`) ; C-V-4 : 14 911 Mo, 10 `node.exe` ; `served_from` nul (arbre sale).
  Cet arbre portait la première écriture du §24 : l'oracle final ci-dessous juge l'arbre corrigé.

## Questions ouvertes (Q-n ; jamais tranchées seules)

- **Q-1** (C-2, portée) : la décision nomme §15, §21, §22 et la procédure de Bell ; §16 (job A-8 (2), l.677) et §19 (job `--unlock`,
  l.1109), changés par la partie, gardent l'adresse, comme §17 et §18 cette nuit. Les passer par le nom après (0), à un lot ultérieur ?
- **Q-2** (N-9, cible) : le serveur du site est visé par l'adresse (gabarit `'root@<site>'`, canal de `docs/RUNBOOK-sentinel.md`), jamais
  par le nom `monarkgate.tech` : aucune étape de clé n'existe pour ce nom. Une étape (0) sous ce nom, sur le modèle du §15, si le nom est voulu.
- **Q-3** (C-3, mesuré) : un fichier NON SUIVI sous les chemins des outils n'est pas vu par `git diff --quiet "$G7" --` (`probe/c3.json`).
  Lecture : un fichier suivi égal au G7 n'importe que des fichiers suivis au G7, donc un fichier non suivi ne change rien de ce que la CA
  charge, sauf s'il en masque un ; complément possible : `git status --porcelain --untracked-files=all -- <chemins>` vide, dans le même
  bloc ; lié à Q-7 de PR-3b-2b-1 (fermeture d'imports de la CLI, item PAROXYSME). À trancher.
- **Q-4** (`bash -n`) : 9 blocs NON touchés sont refusés (§18 du Dōjō (i) à (iii) : `<J>`, `<x>`, `<d>` hors guillemets ; Bell §8 bis et §9) :
  sans danger (rien ne tourne non substitué) ; le §18 sert cette nuit dans sa forme ; correction de forme (apostrophes) à un lot ultérieur ?
- **Q-5** (N-9, formes non mesurées) : la forme JSON de `caddy adapt` (`"delete":[…]`, ordre de l'extrait) et les lignes `> GET …` et
  `< HTTP/…` de `curl -v` ne sont lues nulle part ici (ni `caddy` ni réseau) : écrites comme formes à constater à l'acte, STOP si absentes.
- **Q-6** (item proposé, règle PAROXYSME : la FAITS dit « lecture de la source, pas mesure » ; la G2, Q-2 (b), demande l'item) :
  **DOJO-SITE-PROXY-XFF-MEASURE-1** : mesure d'exécution de XFF-1 : un amont temporaire en boucle locale du serveur du site qui renvoie les
  en-têtes reçus, derrière une copie du bloc `reverse_proxy` de l'extrait (mêmes `header_up`), une requête portant `X-Forwarded-For`,
  `X-Real-IP` et `Forwarded`, puis retrait ; attendu : aucun des trois, aucune adresse du client dans l'écho ; prix : un acte sous go, une
  douzaine de commandes et une FAITS ; déclencheur : avant le jour de l'annonce ; propriétaire : orchestrateur.
- **Q-7** (FUSION-KILLER-ANCHORS-1, proposé par la G2) : appliqué ici à la main (69/69). Précision mesurée par ce tour : un changement du
  seul RUNBOOK décale les ancres d'AUTRES fichiers de test ; le contrôle doit lire tout tueur qui vise un fichier changé, pas seulement
  ceux des fichiers de test changés (`tools/killers.mjs` est réutilisable, sans barre inverse).
- **Q-8** (TU-7) : aux trois bloquants de la ligne TU-7 de PB-5, j'ajoute PAROXYSME-DOJO-FILE-1, condition écrite par `docs/ETAT.md`
  (2026-10-02 : « les 34 items sont à former avant cette synchro ») : garder ?
- **Q-9** (C-2, type de clé) : l'étape compare l'ED25519 seule (forme de la G2) ; si l'adresse n'est connue que par une clé ECDSA ou RSA,
  elle rend `STOP` ; `ssh-keygen -F '<address>' -l` le dira à l'acte.
- **Q-10** (C-3, mesuré à 07:57Z) : `G7.txt` vaut `c0c60617…`, où `scripts/verify-dojo.mjs` est ABSENT (`git cat-file -e`) ; la vérification
  des outils (§15 (4), §22 (1)) rendra donc `same_tools=1` (STOP) tant que `G7.txt` ne désigne pas un G7 portant PR-3b-2b-1, avec les
  arbres comparés à ce G7 (A-3p, DOJO-SYNC-G7-REF-1). Conforme au dessein du §22 (un seul G7 pour les arbres et la CA) ; à planifier.
- **Q-11** (C-2, terminal) : avant l'étape (0), une commande par le nom lancée DANS un terminal demanderait la clé
  (`stricthostkeychecking ask`, mesuré par la G2) ; sans terminal (le Bash de l'orchestrateur), elle échoue. Ajouter
  `-o StrictHostKeyChecking=yes` aux commandes par le nom les rendrait fermées dans les deux cas : à décider.

## Écarts de conduite (`error_origin` : ce tour)

- (1) Des barres inverses dans des lignes de MES commandes, hors heredoc : un motif `grep -c` de recherche de CR dans une sortie `od`
  (07:34Z), dont le compte affiché (9) venait du transport : écarté, recompté par `node` (`tools/bytes.mjs` : 0 CR dans la sonde) ; un
  `tr` d'affichage de numéros de ligne (07:4xZ), relu ensuite par `tools/killers.mjs` (mêmes numéros) ; des guillemets échappés dans un
  `node -e` qui a recoupé une ligne de `tools/killers.mjs` (le fichier écrit : 0 barre inverse). Aucun fichier livré n'en porte.
- (2) Deux scripts de travail portaient des lignes de plus de 160 caractères (`tools/killers.mjs` 177, `tools/syntax.mjs` 234) à leur
  premier usage ; réécrits (140 et 148 au plus), les deux mesures rejouées avec eux (`probe/killers.out`, `probe/syntax.out`, mêmes verdicts).
- (3) Le test `verify_bell_git_blob_reads_committed_bytes` (autre lot ; Q-9 de BELL-CA-DOJO-1) lance `git init` et `git write-tree` dans un
  dépôt jetable sous mon TEMP, sans `GIT_DIR` : il a tourné dans ma course des voisins et dans `red-proof` (`verify-bell.test.ts` est dans
  le diff de la partie). Jamais de ma main.
- (4) Ma première écriture du §24 lisait l'extrait du site à `G7.txt` (section « Correction après relecture ») : trouvée par ma relecture
  pendant l'oracle n° 1, corrigée avant le gel final ; tout ce qui dépend du texte a été rejoué sur l'arbre final.

## Oracle final (arbre corrigé)

- Même commande, derrière la porte (GO à 08:08:43Z : verrou nul, 10 `node.exe`, 14 952 Mo et 33 385 Mo libres), en arrière-plan, jamais
  interrompu, aucune course pendant sa suite. Enregistrement
  `F:/tmp/oracle-results/229e9acaacd441dd1fb0d0addb2f4dca2b3da98e-5ddec57a6de688b0-corr-20261002T080843Z-48760.json`, sha256 recalculé
  `471f3a83b7199d1bd5534546d91c6ade344f38e21009278376add0a4ca41c59c` : **sortie 0** ; `dirty` `5ddec57a…8432`, égal à celui que
  `tools/dirty.mjs` calculait avant le lancement ; objet d'arbre `f1b45846…e232` ; `served_from` nul (arbre sale : rejoué) ; neuf portes à
  0 (`test` 419,1 s) ; **1 882 tests, 1 878 verts, 0 rouge, 4 sautés** (les mêmes) ; test 42 une fois, vert (l.2054 de `09-test.log`
  `a851553e…babc`) ; R-25 par `r25.mjs` : 1 106 + 22 = **1 128** (`02-r25.log` `8e3cba5e…e3a2`, identique à l'oracle n° 1) ; C-V-4 :
  15 042 Mo, 9 `node.exe` ; fin 08:16:41Z.

## Fin

- Livré : les quatre fichiers aux empreintes de l'arbre final (section « Correction après relecture ») et ce journal, qui valait
  `efe52880d6ada8f62979d15a728721bcc3e3a8b06f45b60b5b23321f81955365` (271 l.) à l'oracle final ; seules la section « Oracle final » et
  celle-ci s'y sont ajoutées depuis ; son empreinte finale est rendue hors du fichier (`F:/tmp/dojo/p3corr-deliver/REPONSE.md`,
  `F:/tmp/dojo/p3corr-deliver/DELIVERED.sha256`).
- Écart (5), même classe que (1), deux fois en fin de tour : à 08:08:47Z, une commande de lecture de la sortie d'une tâche de fond portait
  d'abord le chemin en barres inverses (`cat` en lecture seule, sans effet, reprise aussitôt en barres obliques) ; à 08:20Z, un `node -e`
  aux guillemets échappés a retiré deux entrées de `tools/delivered.mjs` (script réécrit ensuite en entier par heredoc : 0 barre inverse,
  148 caractères au plus). Aucun fichier livré n'en porte.
- Nettoyage (08:17Z) : jonctions retirées par `rm-nm.ps1` de `clone`, `mclone`, `mclone2`, `mutants/clone`, `mutants-2/clone` (absence
  constatée) ; aucun lien restant sous `F:/tmp/dojo/p3corr/` (`tools/links.mjs` : 0) ; `F:/Monark/node_modules` : 220 entrées et 11
  `@monark` avant et après ; verrou d'hôte nul (08:17:31Z). Aucun `rm` de ma main : clones et preuves gardés sous `F:/tmp/dojo/p3corr/`.
- État final (08:17:37Z) : worktree à `229e9aca`, quatre fichiers modifiés et ce journal non suivi, rien d'indexé, index daté 07:13:10Z
  (avant ma première commande git) ; tronc à `3e2ea5cf` (inchangé depuis 07:34Z ; son index réécrit à 07:15:54Z par le commit
  `3e2ea5cf` de l'orchestrateur, même seconde).
- Provenance : worker `claude-opus-5-5`, effort max, contexte frais, 2026-10-02 ; advisor intégré consulté deux fois (avant toute écriture ;
  avant la remise, pendant l'oracle final ; conseil, jamais verdict) ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, jamais
  `git write-tree` de ma main ; git écrivant seulement dans mes clones et dans ceux des outils ; worktree et `F:/Monark` en lecture seule ;
  aucun réseau ; rien sur C: ; aucune adresse IP écrite ; aucune ligne d'ADR écrite. Réviseur : le checkpoint de la partie, puis le G7.
- **Verdict : LIVRE-AVEC-RESERVES.** Réserves : (1) écarts (1) à (5), consignés, sans trace dans un fichier livré ; (2) ce qui ne se mesure
  pas ici (clé réelle de l'hôte à l'étape (0), JSON de `caddy adapt`, lignes de `curl -v`) est écrit à constater à l'acte, avec STOP ;
  (3) Q-1 à Q-11 à trancher (Q-10 d'abord : CA-0 et CA-1 s'arrêteront tant que `G7.txt` ne porte pas la CA). Les commandes des §17 et §18
  sont inchangées octet pour octet ; seule la phrase N-2 (lecture de `pipefail`, avant 18 (iii)) concerne cette nuit.
