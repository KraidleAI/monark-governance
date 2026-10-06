claude-opus-5-5

# G1 : lot SITE-BROWSER (partie 3 de la page snapshot du Dōjō : racine injectable, jambe 2 et volet navigateur), 2026-10-02, reprise

## 0. Identité, mission, conduite

- Modèle résolu (R-1) : `claude-opus-5-5`, effort max, rôle G1 (implémenteur et mesureur), instance fraîche de REPRISE. Heures par `date -u`.
- Mission `F:/tmp/dojo/mission-browser.md`, sha256 recalculé AVANT lecture (03:54:11Z) :
  `b082ac72ec7c0fca003175791d5500f59941f8e96220fe49e38002629389ec24`, égal au sceau de l'orchestrateur ; reçu de la porte
  `F:/tmp/dojo/mission-browser.recu.json` vert (2026-10-02T03:03:13Z, les douze règles du linter à 0).
- Reprise (note de l'orchestrateur, hors mission) : un premier G1 de cette mission, lancé vers 01:06Z, a été arrêté vers 02:3xZ (limite
  d'usage). État trouvé avant toute écriture (03:55Z) : worktree `F:/Monark-wt-browser`, branche `lot/site-browser`, HEAD `d1120612`, deux
  fichiers modifiés et un neuf (`git --no-optional-locks status --porcelain`) ; diff égal octet pour octet à la sauvegarde
  `F:/tmp/dojo/arrete-20261002/browser-worktree.patch` (`ed2c1129…f4b9`, égale à son `SHA256SUMS`) ; journal égal à la copie archivée
  `F:/tmp/dojo/arrete-20261002/G1-lot-site-browser.md` (`0fb62f4f…f9af`). Verrou d'hôte libre (`held("F:/tmp")` null, 03:55:30Z) ; ports
  9333, 3431 et 3432 sans écoute (`netstat -ano`, 03:55:30Z) ; sorties du premier lancement sous `F:/tmp/dojo/browser-arrete-20261002/`.
- Git : lectures seules sur le worktree et sur `F:/Monark` (`--no-optional-locks`) ; git écrivant seulement dans mes clones neufs sous
  `F:/tmp/dojo/browser/` ; **aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`** ; aucun commit, aucun workflow (R-20). Le clone
  `F:/tmp/dojo/browser/b1` (verrouillé par le système) n'est ni lu, ni utilisé, ni touché.
- TEMP, TMP, TMPDIR = `F:/tmp/dojo/browser/tmp`. Réseau en boucle locale seulement (127.0.0.1). Rien sur C: de ma main.
- Hôte : AMD Ryzen 9 3900X, 12 cœurs, 24 processeurs logiques, 64 Go ; à 04:00:39Z : charge 39 %, 8 `node.exe`, 16 120 Mo physiques et
  31 957 Mo virtuels libres (`Get-CimInstance`). La charge de chaque série de mesures est écrite dans `F:/tmp/dojo/browser/MESURES.md`.

## 1. Entrées lues (en entier, dans l'ordre de la mission), re-hachées à la reprise (04:08Z)

| Entrée | sha256 |
|---|---|
| `F:/Monark/docs/dojo/FAITS-cdp-mobile-perf-budget-2026-10-01.md` (55 l.) | `7c831d53f486d1197ae7fe8b36a65e8acb94ccd45f45431e393133aa11b1b30a` |
| `docs/G1-lot-site-prep.md` (§9 et le reste, 295 l.) | `1cf21d874c916d9ce8328ff5d97c6141a42fc019aa849665e7f0f9278c825f28` |
| `docs/G1-lot-dojo-pr4c1b.md` (l.245-284) | `d1c3b92d87561673fdb559354615044b04e735118cd31f293f10cdf72edd9077` |
| `docs/adr/ADR-DOJO-PR-4.md` (l.402-534 : D-K3, D-K7, D-K8, PK-5, PK-6, PK-9, Q-K3) | `cac88bc8919d3a4b4fd0ed9c4558d66b2f8b35997b2f85b84073e4daecd72376` |
| `apps/site/app/dojo/page.tsx` (base `d1120612`) | `03688ffe33545c264ef89ff5886ba13cb98ebc44043a28deaa6ec6f4dc2671dc` |
| `apps/site/lib/dojo-served-load.ts` | `89aa8ecca6869086c60792a2ff3a6d379d1c5726e3c6a1122296163c45a59c98` |
| `apps/site/lib/dojo-served.ts` | `b8921860d303da205cf19c33adb23a8689b632e32e5214316f483e188ceb5aeb` |
| `apps/site/lib/dojo-live.ts` | `6d3dbcfbdf2eb39721493afb8bacdaa123eb52f34f1fcbbcd30c0ca2a1ad6a33` |
| `apps/site/lib/dojo-lookup.ts` | `fbefa5e3ebfcc05d21ca4ba4affdb1ba6d0b399c287e3469a5b184351fa2af47` |
| `apps/site/lib/dojo-copy.ts` | `a4c9302ac29f77ea6972e09cede86c27334ee1764d5269cb455b19815fe2da76` |
| `apps/site/components/dojo/dojo-live.tsx` | `3860052c8bd733cc5d3834d17382cac1ccc3bcd9e36b7ed21a69732a43ce3ddc` |
| `apps/site/components/dojo/dojo-table.tsx` | `3a030e39cfd881a710f4c20b776cef97919d719d88594796ee4608506e2fbf3c` |
| `apps/site/components/dojo/dojo-figures.tsx` | `368ed8526609dab067d48a179864bb5f34129626247fb6eb3bc0e0205b4ef4b9` |
| `apps/dojo/test/helpers/dojo-fixture.ts` (la fixture du site) | `2e9e04b79dc4e6755f81b2e390248d56bbeb1885a19e2a7e46c06e23ab9b7e1d` |
| `test/dojo-render.test.ts` (base `d1120612`) | `115590f2e653898fc7aef06da112506873eb4f1057315dcc2a1692c4a60dd0b7` |
| `test/dojo-live-surface.test.ts` | `ddfa77f19eced52435bc07acb61f886aa32b66b1e2d8a00efa0086d024852274` |
| `F:/tmp/site-docs-1/g2/tools/mobile375.mjs` (égal au `b6bac979…8b3a` de PK-5) | `b6bac9799ea354b73508433814909091e2eacca99db9cf8b4fcbdc1e466d8b3a` |
| `F:/Monark/scripts/red-proof.mjs` (`parseKiller`, `killerProblem`, `judgedOf`, `DENY`) | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` |
| `F:/Monark/docs/methode/REGLES-MISSION.md` (inséré dans la mission) | `6470002592fe9c18851c8f7c645d1a1ee963d83e8068cd6fbeb8ee94eabdd2ba` |

Lus pour juger : `docs/RUNBOOK-vitrine.md` l.8-25 (`273d0965…00d0` : construction de production = export sans git, puis `npx next build`
sur le VPS, aucun contrôle de construction rejoué), `apps/site/next.config.mjs` (`8c80e8b8…6a72` : aucune clé `env`, réécriture de
`/dojo-served/*` sous `next dev` seul), `.github/workflows/ci.yml` l.180-206 (`0f401ae2…949a`, job `g3-site`, l.204
`run: npm run build -w @monark/site`), `test/byte-guard.test.ts` l.100-125 et l.196-206 (git sans les variables `GIT_*` de l'appelant),
`F:/Monark/scripts/oracle/run.mjs` (`f22b9045…`, en-tête, `CI_ONLY`, `STATIC`, `DENY`), `lock.mjs` (`501a76b5…`, `held`), `r25.mjs`
(`4d0544df…`), `F:/Monark/scripts/mutants/run.mjs` (`41cdf83f…1ac8`, en-tête : tueurs K1, K2… des fichiers de test changés),
`F:/tmp/dojo/drand-1a/mk-nm.ps1` (`d70d8aea…31fbe4`) et `rm-nm.ps1` (`b51b5d22…8749`). Le test 42 est dans `test/export-public.test.ts` :
aucune de mes courses ciblées ne le lance (il tourne une fois, dans la suite de l'oracle).

## 2. Plan (celui du premier lancement, relu et gardé ; amendements de la reprise en fin de liste)

1. **Racine injectable** (décision de l'orchestrateur ; demande §9 (c) (2) de SITE-PREP ; construction (c) de 4c-1b l.266-268) : dans
   `apps/site/app/dojo/page.tsx`, l.3 en place (`isAbsolute, join`), l.22 en place (`loadDojoServed(recordRootOf())`), `recordRootOf()`
   déclarée après la dernière ligne (fonction hissée) : aucune ligne visée par un tueur ne bouge (`page.tsx:19`, `:39`). Variable
   `MONARK_DOJO_LOCAL_BUILD_ROOT`, lue par accès de membre statique dans cette page serveur seule ; absente : le chemin committé (racine du
   dépôt, deux niveaux au-dessus du répertoire du site), comme aujourd'hui ; présente : un répertoire absolu, sinon `throw` (vide compris).
   Nom hors `DENY` de `red-proof.mjs` et de `run.mjs`, sans préfixe `NEXT_PUBLIC_` (seul préfixe que Next inline dans un paquet client).
2. **Test** (en fin de `test/dojo-render.test.ts`, qui a `records`, `rootWith`, `pageAt`) :
   `dojo_page_reads_a_local_root_on_the_server_at_build_only`, rouge à la base par assertion (la page y ignore la variable) ; tueur de
   `red-proof` juste au-dessus du `test(` (`page.tsx:54`), tueurs empilés pour l'outil de mutants.
3. **Harnais hors dépôt** sous `F:/tmp/dojo/browser/` : construction du site depuis un clone par `npm ci --offline --cache F:/cache/npm`
   (SITE-BUILD-JUNCTION-1 : jamais de jonction pour `next build`), servie par `next start -H 127.0.0.1` derrière un mandataire Node en
   boucle locale qui tient le rôle de Caddy pour `/dojo-served/*` ; miroirs de la fixture à N = 10^3, 10^4 et 10^5 lignes : (A) tête
   neuve (seq 13) liée par la relecture, aucune seconde lecture ; (B) tête neuve lue, hachée puis refusée (somme signée décalée d'une unité
   avant signature), repli, puis lecture du fichier de la tête committée : deux fichiers.
4. **Mesures** (FAITS C-1 à C-5, B-1 à B-5) : Chrome sans tête lancé par moi, profil neuf, CDP ; 375 x 812, facteur 2, `mobile`, toucher ;
   `Emulation.setCPUThrottlingRate` 4 ; refus par le harnais lui-même si l'écran n'est pas celui-là ou si le bridage n'est pas mesuré.
5. **Captures** (`F:/tmp/dojo/browser/shots/`, bureau et mobile) et **portes** (`typecheck`, `lint`, `lint:ratchet`, `lang:gate`,
   `export:check`, `gate:vocab`, `r25`, `red-proof`, oracle du tronc rôle G1).
6. **Amendements de la reprise** : (a) deux ajouts au test (§4) ; (b) constructions dans un clone neuf `b2` (le `b1` du premier lancement est
   verrouillé et codé en dur dans `gen.mjs` et `build.sh`, qui ne sont pas relancés) ; (c) fixtures du premier lancement réutilisées après
   relecture, hachage et vérification par l'outil du lecteur, attentes (`expect.json`) recalculées par moi ; (d) chaque série de mesures
   ouverte et fermée par un relevé de charge (verrou, processus étrangers, processeur, mémoire), une série sous charge étrangère refaite
   ou marquée (HOST-FOREIGN-LOAD-CV4-1) ; (e) la construction sans version (E1) est faite pour ses captures (jamais faite au premier lancement).

## 3. Compte ascendant

Estimé avant le code au premier lancement : environ 75 au périmètre CI. Mesuré à la reprise (numstat contre `d1120612`, 04:08:37Z) :
`apps/site/app/dojo/page.tsx` 13 insertions et 2 suppressions, `test/dojo-render.test.ts` 48 insertions : **63**, sous 1 150 (le journal est
exclu par `:(exclude,glob)docs/**/*.md`, `.github/workflows/ci.yml` l.82). Pas de coupe. La porte `r25` de l'oracle fait foi (§12).

## 4. Reprise 2026-10-02 : relecture ligne à ligne du travail du premier lancement contre la mission

- **`apps/site/app/dojo/page.tsx` : gardé tel quel** (`d69eea46…aa89`). Chaque exigence de la décision de l'orchestrateur relue sur pièce :
  lue au build seulement (page serveur sans `"use client"`, statique : aucune API de requête, aucun export `dynamic` ni `revalidate`, rendue
  `○` par `next build`, §9) ; absente par défaut, et alors le chemin committé (l.55, même expression qu'à la base) ; jamais lue côté client
  (aucun fichier client ne porte le nom, §9 pour les paquets construits) ; jamais posée par la construction de production (aucun fichier
  suivi hors `test/` et `docs/` ne la nomme ; le RUNBOOK : item SITE-BUILD-LOCAL-ROOT-UNSET-1, §14). Relative ou vide : `throw`, la
  construction rougit. Aucune ligne visée par un tueur existant n'a bougé (`page.tsx:19`, `:39` relus).
- **`test/dojo-render.test.ts` : gardé, deux ajouts** (48 insertions au lieu de 43) :
  (a) git lancé sans les variables `GIT_*` de l'appelant pour lister les fichiers suivis : sous un crochet (`GIT_DIR` ou `GIT_INDEX_FILE`
  posés), la liste viendrait d'un autre index et le balayage pourrait rester vert à tort ; motif de `test/byte-guard.test.ts` l.109-110.
  Aucun tueur pour cet ajout : un mutant qui garderait ces variables serait mort-né dans un environnement sans crochet (déclaré).
  (b) la valeur de la racine ne va qu'au chargeur : `recordRootOf()` déclarée une fois et appelée une fois, comme argument de
  `loadDojoServed` ; ferme la classe « valeur lue au serveur puis rendue dans le balisage ou passée en prop à un composant client » du Review
  Focus ; tueur empilé neuf : `page.tsx:27` (`data-root={recordRootOf()}` sur l'élément `main`).
  Tueurs relus contre l'arbre final : chaque `<before>` figure exactement une fois sur sa ligne (`page.tsx:54`, `:56`, `:27`,
  `dojo-live.tsx:23`, `ci.yml:204`), mesuré par l'outil de mutants (§6).
- **Journal** : §0 à §3 repris et amendés (entrées re-hachées, égales à celles du premier lancement) ; les sections qui citaient des chiffres
  (§5, §6, §8, §11, §13, §14 du premier texte, qui renvoyaient à un §9 jamais écrit) sont REMPLACÉES par les miennes, sur l'arbre final ;
  les écarts de conduite du premier lancement sont gardés, attribués (§13) ; la copie archivée fait foi pour le premier texte.
- **Outils hors dépôt du premier lancement** (relus en entier, hachés, copiés sous `F:/tmp/dojo/browser/tools/` avec sha256 égal) :
  `guard.mjs` (`a271b2ce…5e50`), `launch.mjs` (`9ed7cbef…1994`), `belt.sh` (`239b66f7…75d2`), `serve.mjs` (`4468e56c…a949`), `measure.mjs`
  (`cd57552a…1fd3`), `batch.mjs` (`b5961099…f7d9`), `bench.mjs` (`e5b26492…a77f`), `nettree.mjs` (`e6341460…ff52`), et la fonction extraite
  `computeBenchmarkIndex.lh-13.4.1.js` (`8164503e…ac91`), mise à l'écart sous `tmp/computeBenchmarkIndex.first-run.js` (ligne minifiée) :
  celle qui fait foi est ré-extraite du Chrome de la reprise, `bench/computeBenchmarkIndex.extract.js`, sha256 égal. Non relancés :
  `gen.mjs` (`63f76f16…9a42`) et `build.sh` (`99a59111…73c6`), qui codent en dur le clone `b1`. Ses chiffres (mesures, captures,
  `expect.json`, rapports) ne sont jamais repris.

## 5. Code et test (tâche 2), arbre final

- `apps/site/app/dojo/page.tsx` (`d69eea46359abfca9d57a05b2db74b19dc90621c2d506beb81e24eb2a384aa89`) : l.3 `isAbsolute, join` ; l.22
  `loadDojoServed(recordRootOf())` ; l.49-58 `recordRootOf()` (l.54 la lecture, l.56 la garde du chemin absolu), déclarée en dernier.
- `test/dojo-render.test.ts` (`36389477e7bd39d05e49a7bb049223fe78b06ee46b902e29a398f49d86b2f2be`) : test neuf en fin de fichier,
  `dojo_page_reads_a_local_root_on_the_server_at_build_only` (tueurs l.267-271, test l.272-313 ; aucune ligne existante touchée ; imports par
  `import()` dynamique, en-tête du fichier inchangé). Cinq tueurs, celui de `red-proof` juste au-dessus du `test(` (`page.tsx:54`, lecture
  remplacée par `undefined`) ; empilés : `page.tsx:56` (garde du chemin absolu), `page.tsx:27` (la racine rendue dans le balisage),
  `dojo-live.tsx:23` (le nom lu par un composant client), `.github/workflows/ci.yml:204` (le nom posé sur la construction du CI).
- Ce que le test montre : variable absente, la page rendue passe `assertDojoBody` contre l'enregistrement de la racine du répertoire de
  travail (E1) ; posée, contre celui de la racine nommée (E2), et elle est refusée contre E1 ; relative ou vide, la page lève « must name
  an absolute directory » ; la page ne porte pas `"use client"`, lit le nom une fois, déclare et appelle `recordRootOf()` une fois chacune
  (argument du chargeur, rien d'autre), n'exporte ni `dynamic` ni `revalidate`, n'appelle aucune API de requête ; parmi les fichiers suivis
  hors `test/`, `docs/` et `*.md`, listés par un git sans les variables `GIT_*` de l'appelant, le nom n'est que dans cette page.

## 6. Courses ciblées, F2P, tueurs (verrou relu libre avant chaque course : `held("F:/tmp")` null)

- Clone `F:/tmp/dojo/browser/c2` (`clone --no-local` de `F:/Monark`, `checkout --detach d1120612`, les deux fichiers du lot copiés, sha256
  égaux à ceux du worktree) ; jonctions par `mk-nm.ps1` (220 entrées, 11 `@monark`, 0 échec), 04:10:54Z-04:11:03Z.
- Tests du site sur `c2` (`node --test`, 17 fichiers : les 12 `test/dojo-*.test.ts`, les 4 `test/site-*.test.ts`, `test/ci-gates.test.ts` ;
  le test 42 n'en fait pas partie), 04:11:12Z-04:11:22Z, sortie 0 : **227 tests, 227 verts, 0 rouge, 0 ignoré**
  (`F:/tmp/dojo/browser/logs/run1-site.tap`, `e74d195584f315d9c645e07538a9522091834f25f1700a8fe7cc9656da445e53`), dont le test neuf.
- **`red-proof`** du tronc (`6579b550…ab36`), `--base d1120612 --gel F:/Monark-wt-browser --repo F:/Monark --draw 1 --seed 2961353842` (les
  32 premiers bits du sha256 de la mission, `b082ac72` en décimal), 04:11:38Z-04:12:02Z, sortie 0 : `F:/tmp/dojo/browser/rp2/RED-PROOF.json`
  (`f42cedd74ababdadf8ec828dc522b2c247895a150c23855c8e287e196c5b82fb`) : `ok: true`, 1 jugé, **F2P** (à la base : « Got unwanted exception:
  set: the record under the directory it names », `ERR_ASSERTION`), 6 inchangés, tueur `page.tsx:54` tiré et **tué** ; digest du gel
  `1942f9049fdd5329b0792dba5fa2bb2189dd1f3289740a0a87247eb8560d4dc1`.
- **Tueurs**, outil de mutants du tronc (`41cdf83f…1ac8`), un seul lancement, `--repo F:/tmp/dojo/browser/c2 --base d1120612 --out
  F:/tmp/dojo/browser/mut2 --killers --targets test/dojo-render.test.ts --lock-root F:/tmp --min-free-mb 4096`, 04:12:17Z-04:13:12Z,
  sortie 0 : `F:/tmp/dojo/browser/mut2/RESULTS.json` (`baf93cfe9ff3319f68fd50683921410b509437f5394e19e15d3c62ae94cb3ff3`) : ligne de base
  verte, **15 tués sur 15**, aucun survivant, aucun non conclu, aucune ancre perdue : les dix tueurs existants du fichier (K1 à K10, dont
  `page.tsx:19` et `:39`, relus sur l'arbre final) et les cinq du test neuf (K11 `page.tsx:56`, K12 `page.tsx:27`, K13 `dojo-live.tsx:23`,
  K14 `ci.yml:204`, K15 `page.tsx:54`) ; K12 n'est tué que par le test neuf (1 rouge, 6 verts), par l'épingle « valeur au seul chargeur ».

## 7. Portes statiques

Celles de l'oracle du tronc (§12), toutes à 0 : épinglage des modèles, `r25`, `lang:gate`, `export:check`, `gate:vocab`, `typecheck`,
`lint`, `lint:ratchet`. Garde d'octets et de longueur (`F:/tmp/dojo/browser/tools/guard.mjs`, `a271b2ce…5e50`) : 0 sur les deux fichiers du
lot, sur ce journal, sur `MESURES.md` et sur chaque outil créé du harnais ; les copies tierces téléchargées (`bench/` : bundle de
Lighthouse et fonction extraite, minifiés) sont gardées telles quelles et ne sont pas des lignes créées.

## 8. Harnais (hors dépôt, `F:/tmp/dojo/browser/` ; en tête de chaque outil, après le shebang des scripts shell : le modèle résolu)

- Repris du premier lancement après relecture (sha256 au §4) : `belt.sh` (huit variables payantes retirées, TEMP sous F:, télémétrie de
  Next coupée, npm hors ligne), `guard.mjs`, `launch.mjs` (processus détaché, fenêtre masquée, pid écrit), `serve.mjs` (rôle de Caddy en
  boucle locale : GET des trois chemins fermés sous `/dojo-served/`, `Cache-Control: no-store`, 404 sinon, le reste relayé à `next start`),
  `nettree.mjs` (sockets de l'arbre de Chrome, adresses hors boucle locale comptées, jamais écrites).
- Écrits ou adaptés à la reprise : `load.ps1` (charge de l'hôte : processeur total par `Win32_PerfFormattedData_PerfOS_Processor`, mémoire,
  chaque `node.exe` classé par sa ligne de commande : à moi, étranger « test, oracle, mutants, construction », autre) ; `build2.sh`
  (construction dans `b2`, sorties sous `builds/<label>` neuf) ; `next.sh` (`next start` SANS la variable) ; `chrome.sh` (profil neuf,
  127.0.0.1:9333, résolveur borné à la boucle locale, routeur multimédia coupé) ; `expect2.mjs` (attentes recalculées des seuls fichiers de
  la fixture) ; `verify2.mjs` (fixture vérifiée par les lecteurs du dépôt) ; `texts2.mjs` (liste fermée lue dans `dojo-copy.ts`) ;
  `bench2.mjs` (indice de la machine par le code de Lighthouse servi par CE Chrome) ; `measure2.mjs` (copie de `measure.mjs` avec trois
  changements déclarés dans son en-tête : bridage contrôlé AUSSI sur la page mesurée, ordre des 300 premières rangées contrôlé, version du
  navigateur relevée) ; `batch2.mjs` (série derrière une porte : verrou libre, aucun processus étranger, processeur au plus 40 %, C-V-4 ;
  charge relue après chaque course ; course chevauchée marquée et refaite une fois par la porte) ; `report2.mjs` (médianes, TBT par la
  formule lue dans le code de Lighthouse, verdict) ; `marked.mjs` (une course sans attente de porte, verrou exigé libre,
  charge relue avant et après, marquée : pour les courses fonctionnelles sous charge étrangère).
- Fixtures du premier lancement copiées sous `F:/tmp/dojo/browser/fixtures/` (96 fichiers, sha256 égaux un à un à l'archive ; manifeste
  `fixtures/SHA256SUMS`), leurs `expect.json` d'origine mis à l'écart (`expect.first-run.json`, jamais lus) ; vérifiées par `verify2.mjs`
  (04:29Z-04:36Z, `fixtures/<N>/verify.json`) : chargeur de la page (sha256 contre le manifeste, forme fermée, N lignes), préfixe (la ligne
  de `mirror-a` au seq committé hache vers le `line_hash` committé), outil du lecteur (`verifyDojoServed`) : `mirror-a` accepté (seq 13 en
  E2, seq 9 en E1), `mirror-b` refusé (`score_mismatch` au seq 13, détail `score_total`). Chiffres et tailles : `MESURES.md` §3.
- Course d'essai du harnais (`runs/probe/`, 04:30:43Z, sous ma propre vérification en arrière-plan) : jamais comptée.

## 9. Constructions : la racine injectable vue du site construit (clone `b2`, `npm ci --offline --cache F:/cache/npm`, 284 paquets)

- **Par défaut** (variable absente, 04:16:51Z-04:17:20Z, `builds/b0-default/`) : `next build` sortie 0, `/dojo` en `○` (statique) ;
  `node scripts/assert-fleet-html.mjs` **vert** : « /dojo: no served snapshot; /dojo is the not-found document (status 404) » : E0 inchangé,
  chemin committé pris.
- **Sur fixture** (`builds/e2-n1000/`, `e2-n10000/`, `e2-n100000/`, `e1-n1000/`, `e2-n100000-r2/`, la variable posée pour `next build` seul) : sortie 0,
  `/dojo` en `○` ; la page construite porte la tête de la fixture (« … · 1000 lines · Merkle root 20293106… » à 10^3) ; **0 fichier** de
  `.next/static` (paquets client) ne porte le nom de la variable, le nom du dossier de fixture ou le chemin du harnais ; 2 fichiers de
  `.next/server` portent le nom (le morceau serveur de la page et sa carte de source), aucun le chemin ; le contrôle de construction du CI
  **rougit** (sortie 1, « assert-dojo: a /dojo page was rendered before any served snapshot (status undefined, not 404) ») : une
  construction de production qui poserait la variable alors que le dépôt est en E0 est refusée par la porte `g3-site`.
- **Lue à la construction seulement** : `next start` lancé SANS la variable (`next.sh` : `env -u`) sur chaque construction de fixture sert
  la page de la fixture (`curl` de `/dojo`, 04:30Z à 10^3, 04:42Z à 10^4, 04:47Z et 05:18Z à 10^5, 05:02Z en E1 : « 1000 lines »,
  « 10000 lines », « 100000 lines », tête du 2026-10-08 en E1) : la valeur est figée au rendu statique. Preuve inverse (construction par
  défaut, serveur lancé AVEC la variable) : §9 bis.
- **Limite hors du dépôt** : la construction de production (`docs/RUNBOOK-vitrine.md` §4 : export sans git, `npx next build` sur le VPS)
  ne rejoue pas le contrôle de construction ; une variable posée au niveau de l'hôte échapperait au balayage du test : item
  SITE-BUILD-LOCAL-ROOT-UNSET-1 (§14).

## 9 bis. Preuve inverse : la variable posée au démarrage du serveur ne change rien

Construction par défaut refaite (`builds/b0-default-2/`, 05:10:34Z-05:10:47Z, `/dojo` en `○`, `assert-fleet-html.mjs` vert, 404), puis
`next start` lancé AVEC `MONARK_DOJO_LOCAL_BUILD_ROOT` posée vers la racine de la fixture 10^3 (la ceinture la transmet : contrôle
`belt passes: F:/tmp/dojo/browser/fixtures/e2-n1000/root`, 05:11Z) : `/dojo` répond **404** (05:10:58Z). La racine n'est lue qu'au rendu
statique de `next build`, jamais au service.

## 10. Mesures (tâche 3) : `F:/tmp/dojo/browser/MESURES.md` fait foi (conditions, charge par série, fixtures, chiffres par N, verdict)

- Conditions : mobile 375 x 812, facteur 2, toucher ; processeur bridé x4 (`Emulation.setCPUThrottlingRate`), indice de la machine 3123
  (médiane de cinq, par le code de Lighthouse 13.4.1 servi par ce Chrome) ; contrôle du bridage avant la navigation ET sur la page mesurée
  (rapports 4,17 à 5,02 sur les 30 courses propres ; aucune course refusée) ; boucle locale, réseau non émulé, cache coupé.
- Courses propres : 5 par cas à chaque N. À 10^5, une campagne étrangère de tueurs puis trois oracles étrangers ont occupé l'hôte de
  04:51Z à 05:26Z : courses chevauchées écartées, courses fonctionnelles marquées HOST-FOREIGN-LOAD-CV4-1, deux courses propres par cas
  refaites à 05:27Z-05:29Z (`MESURES.md` §2).
- Liaison complète (définie au `MESURES.md` §5) : A à la phrase `rereadDone`, 756 / 1 934 / 11 222 ms ; B, seconde liaison au rendu de la
  table, 1 026 / 3 123 / 24 416 ms ; le dernier nœud résolu des courses `digest` la précède de 75 à 392 ms.
- Médianes, cas A puis cas B (ms) : première tranche 837 / 1 026 (10^3), 2 199 / 3 123 (10^4), 12 680 / 24 416 (10^5) ; TBT 191 / 324,
  1 453 / 2 386, 11 846 / 23 130 ; LCP 216 à 240 partout (la phrase de la tête) ; tâches longues 3 à 4 ; tas au pic 5,2 à 95,5 Mio.
  Référence sans table (`/token`) : TBT 119 ms.
- **Verdict contre le budget (mesure de laboratoire)** : conjonctif, **ROUGE à chaque N** : 10^3 (A vert à la limite, TBT 191 et deux
  courses sur cinq au-dessus de 200 ; B rouge, TBT 324), 10^4 (A et B rouges), 10^5 (A et B rouges, premier contenu utile au-delà de 12 s).
- Cause nommée (trace) : la liaison entière tient dans UNE tâche `RunMicrotasks` (167 ms, 1 223 ms ; à 10^5, 10,3 s en course propre),
  plus l'amorçage du site (`EvaluateScript` 172 ms) et la projection de la table (128 ms à 10^4, 1,6 s à 10^5, course marquée). Empreintes
  comptées : 2N + 1 en A, environ 4N en B (PK-5), à chaque N.
- Interactions (vrais événements CDP) : « Show more lines » par 100 ; poussière liée, cherchée, jamais listée ; ligne masquée trouvée par un
  vrai clic, phrase en région `role="status"` ; régions de statut et leurs textes ; remises de `found` et `count` à chaque changement de tête
  (naturel, et forcé : déclaré, Q-1) ; aucun GET de lignes après la charge. Détail : `MESURES.md` §7.
- Constructions de l'ADR (PK-5), dans l'ordre, chiffrées : (i) retire la seconde liaison de B (TBT -133, -933, -11 284 ms) mais la reporte
  dans l'interaction du bouton ; (ii) ne vise pas la cause (une seule tâche) ; (iii) seule à retirer la liaison du fil principal (TBT résiduel
  calculé 193, 244, 1 796 ms). Aucune ne ramène 10^5 dans le budget du premier contenu utile tant que la liaison est tout ou rien sur 28,5 Mo.
  Réseau calculé sous le profil mobile de Lighthouse : au-delà de 2,5 s dès 10^3, borne de 30 s dépassée à 10^5 (`MESURES.md` §9, §10).

## 11. Captures (tâche 3) : `F:/tmp/dojo/browser/shots/`, 24 PNG, bureau et mobile, manifeste `shots/SHA256SUMS` (`43988491…5a6b`)

Version en vigueur avec poussière masquée (`e2-n1000-{top,figures,tiers,table,method}-{mobile,desktop}.png`), recherche d'une ligne masquée
(`e2-n1000-look-up-hidden-*`), sans version (`e1-n1000-{top,figures,no-version,table,method,look-up-listed}-*`) ; phrases de méthode, de
paliers et de poussière lisibles (relues à l'œil sur trois captures mobiles). Relevé pour la validation visuelle : à 375 px, `break-all`
coupe les mots des cellules et 4 colonnes sur 7 tiennent à l'écran en E2 (item DOJO-TABLE-MOBILE-WRAP-1, §14).

## 12. Oracle du tronc (rôle G1)

`node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-browser --base d1120612` (outil `f22b9045…`, `r25.mjs` `4d0544df…`),
verrou relu libre juste avant, lancé à 04:18:22Z, fin 04:27:27Z, sortie **0** : enregistrement
`F:/tmp/oracle-results/d1120612b7b5c172509830c1cb314c9580549c41-5f6c7b8b51e2fd6c-G1-20261002T041822Z-27504.json`, sha256
`2e8c84b40ed809dafcedd776ae7afd2a90044969b18e4676e47832f7cd457c75` ; arbre : tête `d1120612`, `dirty`
`5f6c7b8b51e2fd6c7a9f50411238f9f1bb62962032b5b79252d2e5c0dda52ca1`, objet `e226de4cc4d06b402f43cdef8248bf897ffc79e9`, `static_only`
false, `served_from` null ; C-V-4 au départ : 17 334 Mo libres, 9 `node.exe`.

- Portes, toutes à 0 : épinglage des modèles, **`r25`** (61 insertions, 2 suppressions, **63**, borne 1 205 ; contenu 0 sur 8 000 ;
  `02-r25.log` `1925541da18d9f3d36d344c7ba373ba9f4e92855d12a674a9a0297fdc5e200b0`, « GREEN »), `lang:gate`, `export:check`, `gate:vocab`,
  `typecheck`, `lint`, `lint:ratchet`, `test` (464,0 s).
- Tests : **1 870, 1 866 verts, 0 rouge, 4 ignorés** ; test 42 (`export_public_no_governance_no_french`) vert en 428,7 s, une seule fois,
  dans la suite ; `dojo_page_reads_a_local_root_on_the_server_at_build_only` vert (1,06 s) (`09-test.log`
  `8a1fccc04a0931756efc11233b9fa08e22f91de62a194e1e4dbc3158b0705a58`).
- Hors oracle (`CI_ONLY`) : la construction du site et `assert-fleet-html.mjs`, rejoués par le harnais (§9) : construction par défaut verte,
  constructions sur fixture refusées par le contrôle comme attendu.
- Code et test gelés par l'oracle = ceux du §5 (sha256 `d69eea46…aa89` et `36389477…f2be`, relevés à 04:18:18Z juste avant son départ),
  inchangés depuis (§16). Le journal a été complété après le départ de l'oracle : l'empreinte `dirty` couvre le journal tel qu'il était à
  04:18Z (sha256 `316c3ef1a2f8b5a6bfa2452ea87a5a76d15191f26d3fe8409f59e4ad92ae7f19`) ; il est exclu de R-25 et ne touche aucune porte de code.

## 13. Écarts de conduite (`error_origin` : ce G1, sauf mention)

Reprise :
- Trois empreintes abrégées du §4 (`serve.mjs`, `measure.mjs`, `bench.mjs`) mal recopiées à la première écriture, recalculées par commande et
  corrigées à 04:09Z, avant toute remise.
- Deux scripts du harnais (`chrome.sh`, `next.sh`) écrits avec des barres inverses de continuation : vus par la garde avant tout lancement,
  réécrits avec des tableaux d'arguments.
- Une commande Bash trop longue pour le harnais (HARNESS-BASH-8K-1, 05:05Z) : rien n'a été écrit ; `MESURES.md` réécrit par l'outil
  d'écriture et par morceaux de moins de 6 Ko.
- Premier filtre de `report2.mjs` : la course `interact` (mode `clean` par défaut) comptée parmi les courses propres (6 au lieu de 5) ;
  corrigé avant toute citation (aucune étape ni capture dans une course propre).
- `batch2.mjs` nomme la reprise d'une course par le rang suivant : `e2-n100000-a-clean-5-redo.json` est la reprise de `a-clean-4` (défaut
  de nommage, déclaré ; les deux sont écartées).
- Deux de mes séries arrêtées par moi pendant qu'elles attendaient à leur porte (04:55Z, 04:58Z ; aucun `measure2.mjs` en cours, relevé) :
  la campagne étrangère ne laissait pas de fenêtre ; les courses fonctionnelles restantes faites par `marked.mjs`, marquées.
- 10^5 : courses chevauchées écartées, courses fonctionnelles et captures E1 faites sous charge étrangère, marquées ; les deux courses
  propres manquantes par cas refaites après la fenêtre étrangère (`MESURES.md` §2).
- Une construction lancée par erreur sans racine sous l'étiquette `builds/e2-n100000-b/` (05:17:46Z, `root=none`, construction par défaut,
  contrôle CI vert) : sans effet sur aucune preuve ; la construction 10^5 servie aux courses de 05:27Z est `builds/e2-n100000-r2/`.
- Course d'essai du harnais (04:30Z) pendant ma propre vérification des fixtures en arrière-plan : jamais comptée.
- Les branches de refus du harnais (écran, `measure2.mjs` l.164 et l.191 ; bridage sur `about:blank` l.165 ; bridage sur la page l.248)
  n'ont refusé aucune des 54 courses de la reprise : elles sont établies par lecture du code, non exercées ici (la branche d'écran a refusé
  une série du premier lancement, sur une version antérieure).
- Codes de sortie : chaque processus de mesure finit par une assertion de libuv (`0xC0000409`, 3221226505) APRÈS l'écriture de son JSON ;
  l'achèvement d'une course se lit dans son JSON (`ended`, aucun `refused`).

Premier lancement, arrêté (attribués ; détail dans sa copie archivée `F:/tmp/dojo/arrete-20261002/G1-lot-site-browser.md` §12) : première
série refusée par son harnais (largeur lue sur `about:blank`) ; génération 10^5 pendant l'oracle d'un autre lot ; premier Chrome sur un port
d'une plage exclue par Windows ; écoute mDNS de son premier Chrome jusqu'à l'ajout de `--disable-features=MediaRouter` ; une course lancée
sous ses propres portes statiques ; traces 10^4 et 10^5 perdues puis refaites ; analyse corrigée avant publication. La reprise n'a repris
aucun de ses chiffres et a refait chacune de ces preuves (§6 à §12).

## 14. Items formés et demandes (règle Dettes, PAROXYSME : aucun dû nu ; propriétaire : orchestrateur, sauf mention)

- **DOJO-TABLE-DIGEST-LEVELS-1** (existant, ADR-DOJO-PR-4 PK-9) : déclencheur ATTEINT (verdict rouge, §10). Mesure : la liaison est une seule
  tâche ; la construction (ii) ne retire aucun travail du fil principal (`MESURES.md` §10) : recommandation de la classer derrière (iii).
- **DOJO-BIND-OFF-MAIN-1 (neuf, construction (iii) de PK-5)** : liaison (lecture, empreintes, analyse, sommes) ET projection de la table
  (analyse, tri) dans un Web Worker ; surface neuve, ADR à ouvrir ; TBT résiduel calculé 193 ms (10^3), 244 ms (10^4, projection comprise
  dans le fil) ; déclencheur : avant l'envoi du site si l'investisseur refuse un verdict de laboratoire rouge (Q-4).
- **DOJO-SITE-BOOT-BUDGET-1 (neuf, recherche de solutions)** : sans table, l'amorçage du site coûte 119 ms de blocage sous bridage x4
  (`/token`), environ 60 % du budget ; recherche : poids et découpage des paquets client du site, composants serveur pour les parties
  statiques de `/dojo` (sources primaires Next.js et web.dev à lire sur place par l'orchestrateur) ; déclencheur : avec l'item précédent.
- **DOJO-LINES-PROGRESSIVE-BIND-1 (neuf, recherche de solutions)** : à 10^5 la liaison tout ou rien (D-K4) de 28,5 Mo coûte plus de 10 s de
  processeur bridé : le premier contenu utile en 2,5 s est hors d'atteinte par (i), (ii), (iii) ; recherche : fichier de lignes servi par
  tranches liées à la racine signée par des preuves d'inclusion de sous-arbres (RFC 9162 §2.1.3, [lu] au FAITS du projet
  `docs/dojo/FAITS-pr1a-lectures-2026-09-26.md` §6), ou tranche initiale signée à part (schéma servi neuf, mère D-11) ; déclencheur : avant
  qu'un fichier de lignes servi dépasse environ 10^4 lignes.
- **DOJO-LINES-TIMEOUT-MOBILE-1 (neuf)** : sous le profil `mobileSlow4G` de Lighthouse (lu dans le code), la borne de 30 s par GET refuse
  au-delà d'environ 5,56 Mo (environ 19 490 lignes brutes) ; options : compression servie (item suivant), tranches (item précédent), borne
  propre au navigateur (elle diverge de l'outil du lecteur : décision) ; déclencheur : avant qu'un fichier de lignes servi dépasse 5 Mo.
- **DOJO-EDGE-COMPRESSION-1 (neuf, lecture sur place)** : aucune directive `encode` dans `deploy/Caddyfile.monark-dojo` (`67bb93ac…`) ni
  dans `deploy/Caddyfile.monark-dojo-site.snippet` (`b5c84688…`) ; le bord Cloudflare n'est pas lu ; déclencheur : avec DOJO-EDGE-CACHE-1,
  avant l'acte DOJO-SITE-PROXY-1.
- **DOJO-TABLE-RERENDER-INP-1 (neuf)** : revenir d'une recherche à une liste longue (« Show all lines ») rend toutes les rangées montrées : à
  10^3, 862 rangées, 710 ms de tâches longues après le clic (au-delà des 200 ms de B-2) ; options : garder la liste montée et masquée,
  remettre `count` à 100 au retour ; déclencheur : avant l'envoi du site.
- **DOJO-TABLE-MOBILE-WRAP-1 (neuf, validation visuelle)** : à 375 px, `break-all` coupe les mots des cellules et 4 colonnes sur 7 tiennent à
  l'écran en E2 (captures `e2-n1000-table-mobile.png`, `e2-n1000-look-up-hidden-mobile.png`) ; propriétaire : investisseur (C-V-4 de la
  partie 3), puis orchestrateur.
- **SITE-BUILD-LOCAL-ROOT-UNSET-1 (neuf)** : `docs/RUNBOOK-vitrine.md` §4 : préfixer la construction du VPS par
  `env -u MONARK_DOJO_LOCAL_BUILD_ROOT` (une variable posée au niveau de l'hôte échappe au balayage du test ; le RUNBOOK est sous `docs/`,
  hors balayage) ; déclencheur : le prochain déploiement du site.
- **Jambe réelle de DOJO-LOOKUP-PAYLOAD-1** (existante, inchangée) : N et octets du vrai fichier lus par le mandataire au premier `snapshot`
  servi ; l'ADR PR-1B-4 l.80 annonce environ 1 144 lignes, soit le voisinage de 10^3 (A vert à la limite, B rouge).

## 15. Questions à l'orchestrateur (Q-n)

- **Q-1 (transition forcée)** : aucune voie du composant ne change deux fois de tête dans une même vue (`useEffect` sur `[committed]`) ; la
  transition naturelle (premier rendu sans tête, puis tête relue) est mesurée à chaque course ; la remise de `found` et `count` sous une table
  déjà manipulée l'est par une transition FORCÉE via le répartiteur d'état de React (premier crochet de la section des chiffres). Vaut-elle
  pour le volet navigateur de N-3 ?
- **Q-2 (réseau)** : aucune série réseau ; le profil `mobileSlow4G` et sa conversion en octets/s ont été lus dans le code de Lighthouse
  13.4.1 servi par ce Chrome (bundle `7d8ccfce…`), en place de la page CDP de `Network.emulateNetworkConditions` que le FAITS demandait de lire
  (pas de réseau hors boucle locale pour moi). Le calcul déclaré du `MESURES.md` §9 suffit-il, ou une série réseau est-elle due après
  lecture sur place de cette page par l'orchestrateur ?
- **Q-3 (facteur de bridage)** : les tranches de `benchmarkIndex` de la table C-5 ne sont pas au FAITS ; la règle appliquée est celle du code
  de Lighthouse 13.4.1 (avertissement si l'indice n'excède pas 1000 sous le facteur 4 par défaut ; indice mesuré 3123). La retenir, ou lire
  la table sur place ?
- **Q-4 (verdict)** : le budget conjonctif est rouge à chaque N (A vert à la limite à 10^3 seulement). L'envoi du site attend-il une
  construction (DOJO-BIND-OFF-MAIN-1, puis (i)), ou l'investisseur accepte-t-il un verdict de laboratoire rouge déclaré, avec les items du
  §14 et la jambe réelle au premier `snapshot` (N attendu près de 1 144) ?
- **Q-5 (série 10^5)** : la série a été faite en deux temps (trois courses propres par cas à 04:47Z-04:51Z, deux à 05:27Z-05:29Z, même
  construction refaite, même fixture) ; les médianes et les verdicts sont inchangés par les deux dernières. Ce mélange est-il admis ?
- **Q-6 (archive du premier lancement, observation en lecture seule)** : `F:/tmp/dojo/browser-arrete-20261002/c1/node_modules` et
  `…/mut1/clone/node_modules` portent chacun 218 jonctions (relevé `Get-Item`, 04:2xZ) ; une suppression récursive de l'archive traverserait
  `F:/Monark/node_modules`. À retirer d'abord par `F:/tmp/dojo/drand-1a/rm-nm.ps1 -Tree <clone>` (non fait : l'archive n'est pas à moi).

## 16. État à la remise

- Worktree `F:/Monark-wt-browser` : HEAD `d1120612`, deux fichiers modifiés (`apps/site/app/dojo/page.tsx` 13 insertions et 2 suppressions,
  `test/dojo-render.test.ts` 48 insertions) et un neuf (ce journal), rien d'autre (`git --no-optional-locks status --porcelain`, 05:32:14Z).
  Rien commis, aucun workflow (R-20). Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, de bout en bout.
- Fichiers du lot (égaux à ceux de `c2` où les tests et les tueurs ont tourné, de `b2` où le site a été construit, et à ceux gelés par
  l'oracle de 04:18Z) : `apps/site/app/dojo/page.tsx` `d69eea46359abfca9d57a05b2db74b19dc90621c2d506beb81e24eb2a384aa89` ;
  `test/dojo-render.test.ts` `36389477e7bd39d05e49a7bb049223fe78b06ee46b902e29a398f49d86b2f2be`. Le sha256 de ce journal est rendu hors du
  fichier (`F:/tmp/dojo/browser-deliver/DELIVERED.sha256`).
- Chrome arrêté par l'arbre de son pid (05:30:3xZ) : avant l'arrêt, une écoute sur 127.0.0.1:9333 et une connexion de boucle locale vers le
  mandataire, 0 hors boucle locale ; après, aucun processus ni socket (`logs/nettree-end-*.json`). Aucun des 52 pid écrits par
  `launch.mjs` n'est vivant ; aucune écoute sur 9333, 3431, 3432.
- Jonctions retirées par `rm-nm.ps1` de `F:/tmp/dojo/browser/c2` et de `F:/tmp/dojo/browser/mut2/clone` (« removed », 05:31Z) ;
  `F:/Monark/node_modules` : 220 entrées et 11 `@monark` avant et après. Le clone `b2` garde l'installation réelle de `npm ci` (aucune
  jonction). Le clone verrouillé `F:/tmp/dojo/browser/b1` n'a pas été touché. Aucun répertoire de travail de `red-proof` laissé sous TEMP.
- Livrables hors dépôt : `F:/tmp/dojo/browser-deliver/REPONSE.md` et `DELIVERED.sha256` (écrit en dernier) ; preuves sous
  `F:/tmp/dojo/browser/` (`MESURES.md`, `tools/`, `logs/`, `rp2/`, `mut2/`, `builds/`, `fixtures/`, `runs/`, `shots/`, `bench/`).
- Verdict de ce G1 : **LIVRE-AVEC-RESERVES** : code, test, tueurs, portes et oracle verts ; mesures et captures faites ; réserves : le
  verdict de laboratoire est ROUGE à chaque N (une constatation, items du §14), une transition forcée déclarée (Q-1), le réseau calculé et
  non émulé (Q-2), la table C-5 non lue (Q-3), la série 10^5 en deux temps (Q-5), l'archive du premier lancement à désarmer (Q-6), la
  validation visuelle des textes et de la mise en page par l'investisseur (C-V-4 de la partie 3, DOJO-TABLE-MOBILE-WRAP-1).
