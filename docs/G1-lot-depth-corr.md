# claude-opus-5-5

# G1 (corrections) : journal du lot DEPTH-CORR (commentaires et tests de la borne de profondeur ; constats C-1, C-2, N-3, N-4 de la G2 de DEPTH-BOUND)

- **Modèle résolu** : `claude-opus-5-5`, effort `max` (R-1). Rôle `corr` (correcteur), instance neuve. Heures par `date -u`.
- **Mission** : `F:/tmp/dojo/mission-corr-depth.md`, sha256 recalculé AVANT lecture (11:06Z),
  `69e46e9ca11236c39e0f47824192c396c04475a04d0b40b2910f4ac6016a8659`, égal à celui du message de lancement ; lue en entier (59 lignes).
- **Worktree** : `F:/Monark-wt-depth-corr`, branche `lot/depth-corr`, HEAD `894037968db4a38a64f21a51c6261b7b69ffb998` (tête de `lot/page-v1`),
  propre au départ (11:06:45Z, 11:18:49Z). Base du tour : `89403796`. Clones sous `F:/tmp/dojo/depthcorr/`, TEMP `F:/tmp/dojo/depthcorr/tmp`.
- **Outils** (sha256 relus à 11:18:49Z, égaux à l'en-tête de la mission, worktree et tronc) : `scripts/mission/lint.mjs` `4d1383c8`,
  `scripts/mission/launch.mjs` `fb6c277f`, `scripts/oracle/run.mjs` `f22b9045`, `scripts/oracle/r25.mjs` `4d0544df`, `scripts/red-proof.mjs` `6579b550`.
- **Aucun commit** (R-20), aucun workflow ; aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`.
- **Écart déclaré (origine : correcteur)** : mes trois premières lectures git du worktree (11:06:45Z : `status`, `rev-parse`, `log`) n'avaient pas
  `GIT_OPTIONAL_LOCKS=0` ; `git status` peut rafraîchir l'index (écriture optionnelle). Toutes les lectures suivantes le posent.
- **Écart déclaré** : un premier envoi de ce §1 (entre 11:18:49Z et 11:20:57Z, environ 9 Ko en une commande) a échoué au lexage du harnais (HARNESS-BASH-8K-1) ;
  rien n'avait été écrit (`ls` : absent) ; réécrit en morceaux de moins de 6 Ko, même texte.

## 1. Lecture et compte (écrit AVANT toute modification, achevé le 2026-10-01 à 11:20:57Z)

### 1.1 Entrées lues en entier, dans l'ordre de la mission (sha256 à `89403796`)

| Entrée | sha256 (16) |
|---|---|
| `F:/tmp/dojo/insp1/g2-depth/RAPPORT.md` (317 l., sections 0 à 9) | `221701fa38eceb39` |
| sondes `out/sites-head.txt` (85 l.) et `out/mut-ge.txt` (524 l.) | `20e9a06eeb3f021a`, `2662735198ecd32c` |
| `apps/dojo/scripts/dojo-chain.mjs` (205 l.) | `0a5e63a79205dc4e` |
| `apps/site/lib/dojo-live.ts` (325 l.) | `9cb2f61de013c064` |
| `apps/site/lib/dojo-served-load.ts` (278 l.) | `b09b6576efd149d0` |
| `apps/dojo/test/dojo-chain.test.ts` (325 l.) | `ef1c9e455e218310` |
| `test/dojo-live.test.ts` (482 l.) | `9b8afd2b3e9aa978` |
| `apps/dojo/scripts/dojo-verify.mjs` (375 l. ; lu l.1-20 et l.140-200) | `6f92580c664b5497` |
| `docs/adr/ADR-DOJO-PR-1B-4.md` (247 l. ; lu l.94-101) | `ffc7e139be26997b` |
| `docs/G1-lot-depth-bound.md` (255 l.) | `81ebdcb3c182c67d` |
| `F:/Monark/scripts/red-proof.mjs` (268 l. ; `parseKiller` l.46-49, convention des tueurs l.18-24) | `6579b55080ac0081` |
| `docs/methode/REGLES-MISSION.md` (l.14-20) | `6470002592fe9c18` |

### 1.2 Constats à traiter (décisions G7 de l'orchestrateur, section « Décisions » de la mission)

- **C-1, commentaires.** « Un texte hors JSON lève toujours » est faux au-delà de la borne : au-delà, un texte est `null`, JSON ou non, jamais
  analysé, et chaque lecteur le refuse sous le code de sa forme ; `not_json` ne nomme qu'un texte hors JSON en deçà. Mesure de la G2 (P1,
  `sites-head.txt` l.56-77) : `{` répété 17 fois rend `null` au cœur, `keyring_invalid @null` au vérificateur, `is malformed`, `must be an object` et
  `(seq 5: timeline_malformed)` au chargeur ; `{` seul lève (`not_json`, `is not JSON`). Le code reste.
  - (a) `dojo-chain.mjs:188-189`, (b) `dojo-live.ts:322`, (c) `dojo-served-load.ts:274-275` : les commentaires des trois `readJson`.
  - (d) `dojo-chain.mjs:171-172` : le commentaire de section ne nomme que les lecteurs couverts (vérificateur, sa CLI, relecture du navigateur,
    construction de la page) ; la synchro ne l'est pas (item SYNC-SERVED-DEPTH-SCAN-1, formé par l'orchestrateur).
  - (e) `dojo-chain.test.ts:321`, le commentaire du test du cœur ; (f) l'épingle `readJson("{".repeat(17)) === null` dans
    `dojo_walk_refuses_a_line_nested_past_the_bound`.
- **C-2, test du chargeur** (`test/dojo-live.test.ts`, `dojo_served_build_reads_no_text_past_the_depth_bound`) : le comparateur de
  `dojo-served-load.ts:277` n'est épinglé par aucun cas à 16 (P5, `mut-ge.txt` : sous `>=`, 83 tests sur 83 verts).
  - (a) un cas À la borne (16), sa phrase mesurée sur un clone avant d'écrire l'assertion ; les profondeurs construites épinglées par
    `load.jsonDepth` (16 et 17) ;
  - (b) un trousseau ENGAGÉ à 17 niveaux, refusé `the committed keyring is malformed` : une épingle (même refus à la base, P1 l.40 et §4 du
    rapport) ;
  - (c) le mot « pin » sur l'assertion de la clé servie, et sur celle du trousseau engagé ;
  - (d) la ligne `// killer: apps/site/lib/dojo-served-load.ts:277 ROR ...` juste au-dessus du `test(`, sous le tueur `CONST` existant
    (précédents : `test/dojo-table.test.ts:101-102`, `test/dojo-live-surface.test.ts:228-229`).
- **N-3** : `dojo-verify.mjs`, une phrase vers l.176 : avec plusieurs défauts, la ligne nommée peut différer de celle de la relecture du
  navigateur (une ligne trop profonde n'est refusée qu'à la marche, comme une ligne `null`) ; avec un seul défaut, même code et même seq.
- **N-4** : (a) `dojo-chain.mjs:2-4`, l'en-tête, et (b) `dojo-chain.mjs:137`, le titre des contrôles de Bell : la garde de profondeur est un ajout
  du Dōjō à la marche de Bell (à 17 niveaux, `timeline_malformed` là où l'ordre de Bell dirait `signature_invalid`) ; (c)
  `docs/adr/ADR-DOJO-PR-1B-4.md:98` : le renvoi `dojo-chain.mjs:150` devient un renvoi par symbole (`walkDojoTimeline`, `breaks.push`).
- Hors du lot : N-1 (synchro) et N-2 (requête d'ancre), items formés par l'orchestrateur ; N-5, sans action ; `ADR-DOJO-PR-3.md` et
  `ADR-DOJO-PR-4.md` (la ligne datée est de l'orchestrateur) : non touchés.

### 1.3 Compte ascendant par fichier

| Fichier | Constats | Lesquels |
|---|---|---|
| `apps/dojo/scripts/dojo-verify.mjs` | 1 | N-3 |
| `apps/site/lib/dojo-live.ts` | 1 | C-1 (b) |
| `apps/site/lib/dojo-served-load.ts` | 1 | C-1 (c) |
| `docs/adr/ADR-DOJO-PR-1B-4.md` | 1 | N-4 (c) |
| `apps/dojo/test/dojo-chain.test.ts` | 2 | C-1 (e), (f) |
| `apps/dojo/scripts/dojo-chain.mjs` | 4 | C-1 (a), (d) ; N-4 (a), (b) |
| `test/dojo-live.test.ts` | 4 | C-2 (a) à (d) |
| **Total** | **14** | |

### 1.4 Invariants et plan, arrêtés avant toute modification (mesures à `89403796`)

- **Aucune ligne exécutable touchée**, lignes mixtes comprises (du code suivi d'un commentaire de fin) : `dojo-verify.mjs:176` (`});` puis le
  commentaire), `dojo-chain.mjs:139` et `dojo-live.ts:240` restent telles quelles (règle l.18 de `REGLES-MISSION.md`).
- **Aucune ligne ne bouge dans les quatre fichiers de code.** 44 lignes `// killer:` citent leurs numéros de ligne (`git grep` à `89403796`) :
  `dojo-chain.mjs` 2, `dojo-verify.mjs` 18 (de :12 à :349), `dojo-live.ts` 19 (de :35 à :324), `dojo-served-load.ts` 5 (de :143 à :277), dans cinq
  fichiers de test, dont `test/dojo-verify-url.test.ts` et `test/dojo-served.test.ts` (hors des sorties de la mission). Chaque commentaire est donc
  réécrit dans son nombre de lignes, et la phrase N-3 prend une ligne VIDE (Q-1). Contrôles à la fin : `wc -l` égal à la base ; recensement de
  toutes les lignes `// killer:` du dépôt par `parseKiller` du tronc (texte cible une seule fois sur la ligne citée), base contre arbre corrigé ;
  flux de jetons sans commentaires égaux, base contre arbre corrigé, pour les quatre fichiers de code.
- Les tests ne changent que dans le dernier test de chaque fichier (aucune ligne au-dessous) ; libellés en anglais ; lignes créées de 160
  caractères au plus, sans antislash ni TAB.
- Pièges relevés : `dojo_walk_imports_the_closed_list` applique ses expressions au texte ENTIER de `dojo-chain.mjs`, commentaires compris (aucun
  `from` ou `import` suivi d'un guillemet, aucun `import (`, `fetch(`, `require(`, `node:fs`, `child_process` dans un commentaire neuf) ;
  `site_names_no_kitchen` dans `apps/site` (aucun « lot X », identifiant d'ADR ou d'item, G-n ni « checkpoint » dans les commentaires neufs de
  `dojo-live.ts` et `dojo-served-load.ts`) ; `dojo_live_bounds_equal_the_verifier` écarte les lignes qui commencent, après les blancs, par `//`,
  `/**` ou `*`.
- **Mesures prévues** : les trois fichiers de test verts sur un clone ; chaque tueur des deux tests changés rouge sous son mutant (le `:139 SDL`
  et le ROR par le tirage de `red-proof`, le `CONST :277`, empilé, par l'outil de mutants du tronc) ; l'épingle C-1 (f) rouge sous un mutant
  ad hoc qui analyse avant de mesurer ; `red-proof` rejoué deux fois (Q-2) ; l'oracle du tronc `--role corr --static-only --key DEPTH-CORR`
  pour les six portes et R-25.

## 2. Corrections (écrites après le §1 ; 11:28:46Z, 11:29:24Z, 11:40:14Z)

Outil d'édition gardé, hors dépôt : `F:/tmp/dojo/depthcorr/edits/edit.mjs` avec `spec.mjs` (11:28:46Z), `edit2.mjs` avec `spec2.mjs` (11:29:24Z, deux
reformulations), `edit3.mjs` avec `spec3.mjs` (11:40:14Z, l'en-tête, Q-3). Chaque bloc remplacé est vérifié par le sha256 de ses lignes anciennes
AVANT toute écriture ; `same` impose le même nombre de lignes (fichiers de code) ; un écart refuse tout le passage. Les blocs neufs sont des
fichiers sous `edits/`, écrits et mesurés (longueur, antislash, TAB) avant l'insertion.

| Fichier | sha256 (16) avant, après | Lignes | + / - | Constats |
|---|---|---|---|---|
| `apps/dojo/scripts/dojo-chain.mjs` | `0a5e63a79205dc4e`, `6a9bf56dacf501a1` | 205, 205 | 12/12 | N-4 (a) l.2-8, (b) l.137; C-1 (d) l.171-172, (a) l.188-189 |
| `apps/dojo/scripts/dojo-verify.mjs` | `6f92580c664b5497`, `e52271facf7a1be7` | 375, 375 | 1 / 1 | N-3 l.184 (une ligne vide devient la phrase, Q-1) |
| `apps/site/lib/dojo-live.ts` | `9cb2f61de013c064`, `294af0575794b84f` | 325, 325 | 1 / 1 | C-1 (b) l.322 |
| `apps/site/lib/dojo-served-load.ts` | `b09b6576efd149d0`, `89aa8ecca6869086` | 278, 278 | 2 / 2 | C-1 (c) l.274-275 |
| `docs/adr/ADR-DOJO-PR-1B-4.md` | `ffc7e139be26997b`, `2f1ce77785478e9f` | 247, 247 | 1 / 1 | N-4 (c) l.98 (Q-4) |
| `apps/dojo/test/dojo-chain.test.ts` | `ef1c9e455e218310`, `653ce1b38c29dfd0` | 325, 326 | 2 / 1 | C-1 (e) l.321, (f) l.325 |
| `test/dojo-live.test.ts` | `9b8afd2b3e9aa978`, `cfa6e5f0b7762b2a` | 482, 494 | 23 / 11 | C-2 (a) à (d), l.468-494 |

- **En-tête** (`dojo-chain.mjs:2-8`, sept lignes pour sept) : « plus ONE guard Bell's walk lacks, the Dojo's depth bound (lot DEPTH-BOUND): a line
  nested past it (17 levels) is timeline_malformed where Bell's order goes on to the signature (signature_invalid for a line edited after signing;
  far deeper, canonical recurses) ». **Titre** l.137 : « and the depth guard, a Dojo addition Bell's walk lacks (header) ».
- **Section** l.171-172 : « the verifier, its CLI, the browser's reread and the page build measure a text before any JSON.parse (the sync does not:
  item SYNC-SERVED-DEPTH-SCAN-1), the walker a value before any canonical; none recurses ».
- **Les trois `readJson`** : `dojo-chain.mjs:188-189` « parsed only within DOJO_MAX_DEPTH, where a text that is not JSON throws, as JSON.parse does;
  past it, null, JSON or not, never parsed [...] by the code of its form (not_json names a text within the bound) » ; `dojo-live.ts:322` et
  `dojo-served-load.ts:274-275`, la même règle dite pour leurs lecteurs (repli de la relecture ; phrases du chargeur : « is not JSON » en deçà,
  « malformed », « not an object » ou la phrase de la marche au-delà), sans aucun mot interne dans `apps/site`.
- **N-3** (`dojo-verify.mjs:184`) : « Several faults: the line named may differ from the browser's reread (one too deep is refused at the walk only,
  as a null one); one fault: same code and seq ».
- **ADR** l.98 : « (`dojo-chain.mjs:150`) » devient « (`dojo-chain.mjs`, `walkDojoTimeline`, `breaks.push`) », le reste de la ligne inchangé.

## 3. Tests (deux tests changés, aucun neuf ; libellés en anglais)

- `apps/dojo/test/dojo-chain.test.ts`, `dojo_walk_refuses_a_line_nested_past_the_bound` : le commentaire l.321 dit la règle C-1 ; l'épingle l.325,
  `assert.doesNotThrow(() => { assert.equal(chain.readJson("{".repeat(17)), null); }, ...)`. Une `SyntaxError` y devient un échec d'ASSERTION :
  mesuré avant l'écriture, `assert.doesNotThrow` avec un message rend `AssertionError` (`ERR_ASSERTION`) pour une exception levée comme pour une
  assertion interne ; un mutant qui analyse avant de mesurer est donc tué par assertion, jamais « non conclu ». Tueur inchangé : `:139 SDL`.
- `test/dojo-live.test.ts`, `dojo_served_build_reads_no_text_past_the_depth_bound` :
  - (d) tueurs : le `CONST :277` reste, le `ROR :277` (texte exact de la mission) est ajouté juste au-dessus du `test(` : `red-proof` lit la
    ligne du dessus (le ROR), l'outil de mutants lit les deux (le `CONST`, sans `test(` dessous, court sur le fichier entier) ;
  - (a) `headAt(n)` construit la ligne de tête 3 (celle de A) avec son `tier` imbriqué n niveaux, comme le cas d'avant : n = 15, profondeur 16
    épinglée par `load.jsonDepth`, ligne lue puis refusée par l'outil du lecteur, `the reader's tool refuses the served tree under the committed
    keyring (tier_mismatch at seq 12: lines/<sha>.jsonl line 3)` ; n = 16, profondeur 17 épinglée, `head line 3 must be an object`. Les phrases
    ont été mesurées sur un clone AVANT d'écrire les assertions : sonde `F:/tmp/dojo/depthcorr/probe/phrases.mts` (sha256 `0ccffbbb`), clone `base`
    (`89403796`), 11:23:04Z, sortie `probe/phrases-base.txt` (sha256 `0b0cfece` brute, `e31ba96f` mise en forme, §4.9) ; la sonde P1 de la G2 avait
    tronqué cette phrase (`sites-head.txt` l.44-45). Le cas couple le test du chargeur au détail de l'outil du lecteur : choix délibéré (la phrase
    de P1) ; l'autre cas proposé, la ligne 5 à 16 (`(seq 5: signature_invalid)`), phrase mesurée par la sonde, le tuerait aussi (lecture du code, non mesuré).
  - (b) épingle : un trousseau ENGAGÉ dont un `valid_from_seq` est imbriqué 14 niveaux, profondeur 17 épinglée, `the committed keyring is
    malformed` ; même refus à la base, car `dojoTrustOf` a des clés et des formes fermées (`dojo-verify.mjs:68-77`) : aucune imbrication n'y est
    une forme valide, d'où une épingle par construction, dite par son libellé ;
  - (c) « pin: » sur l'assertion du fichier de clé servi (construction inchangée, profondeur 19) et sur celle du trousseau engagé ;
  - le test appelle `buildDojoServed` avec les `DEPS` du fichier (le trousseau engagé passe en octets, sans quoi on ne peut l'imbriquer) ; le
    reste de sa construction est celle d'avant.

## 4. Mesures (sur l'arbre FINAL, après l'en-tête reformulé à 11:40:14Z ; preuves sous `F:/tmp/dojo/depthcorr/`)

Avant chaque course : verrou d'hôte `F:/tmp/oracle-lock` absent (lu par `ls`, et `held("F:/tmp")` de `oracle/lock.mjs` nul avant les mutants).
C-V-4 par `Get-CimInstance Win32_OperatingSystem` à 11:22:59Z, 11:30:02Z, 11:32:56Z, 11:37:47Z, 11:40:39Z, 11:45:13Z et 12:05:49Z : 12
à 15 `node.exe`, 15 224 à 15 888 Mio physiques et 28 277 à 29 211 Mio virtuels libres ; pas avant chacune des courses brèves qui ont suivi (sondes,
`red-proof`, le test de `site_names_no_kitchen`) : écart déclaré (Q-6 (i)). Clones
`--no-local` : `base` (`89403796`), `gel` (`89403796` plus les sept fichiers du worktree, sha256 égaux), `gelC` (`0cb7272d` plus les mêmes),
`adhoc`, `mutrepo`. Les mesures faites avant la reformulation (commentaire seul, même issue) sont gardées et citées en dernier.

### 4.1 Les trois fichiers de test

`apps/dojo/test/dojo-chain.test.ts`, `apps/dojo/test/dojo-verify.test.ts`, `test/dojo-live.test.ts` sur `gel`, `node --test` (TAP) : 79 tests,
79 verts, aucun enfant mort, stderr vide ; `runs/gel-three-2.tap` sha256 `cf387a3a1873aebfdb2eafac4af1bc35bcfaca2745033c7b5cd3aa1d99e5cb2d`,
11:40:40Z à 11:40:56Z. Avant reformulation : `runs/gel-three.tap` `09b58de8`, 79 sur 79.
Test d'un autre fichier qui avait rougi le G1 de DEPTH-BOUND sur un commentaire d'`apps/site` : `site_names_no_kitchen`
(`test/site-build-fleet.test.ts`), seul (`--test-name-pattern`), sur `gel` avec jonctions (§4.8) : 1 test, 1 vert, stderr vide ;
`runs/kitchen.tap` sha256 `9ff78ca16d4b77bffe7eb1210775c5de74c997ba1731972494041337977903eb`, 12:03:36Z à 12:03:37Z.

### 4.2 L'épingle C-1 (f) porte

`probe/pin-mutant.mjs` (sha256 `f5d4a8c4`) sur `adhoc` : mutant ad hoc de `dojo-chain.mjs:191`, `jsonDepth(text) > DOJO_MAX_DEPTH ? null` devenu
`JSON.parse(text) && jsonDepth(text) > DOJO_MAX_DEPTH ? null` (analyser avant de mesurer). Le test corrigé, seul : `not ok`, `ERR_ASSERTION` ; le
même test pris à `89403796` : `ok` (le test d'avant ne le voit pas) ; témoins verts avant ; fichier rendu (sha256 `6a9bf56d` avant et
après). Sortie `probe/pin-mutant-2.out` sha256 `e9057d00b8aed7e600fe09669e0f7a79839b93ad573a562d72d9f8cce7fe8db9`, 11:41:02Z ; avant reformulation
`probe/pin-mutant.out` `5fb28c2d`, même issue. Tueur proposé pour ce mutant : Q-5.

### 4.3 Chaque tueur des deux tests changés, rouge sous son mutant (outil de mutants du tronc)

`node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/depthcorr/mutrepo --base 894037968db4a38a64f21a51c6261b7b69ffb998 --out
F:/tmp/dojo/depthcorr/mut-killers-2 --killers --only K1,K24,K25 --targets test/dojo-live.test.ts,apps/dojo/test/dojo-chain.test.ts --lock-root
F:/tmp --min-free-mb 4096` (outil sha256 `41cdf83f`) ; `mutrepo` : clone neuf, arbre final, jonctions `node_modules` par `mk-nm.ps1` (§4.8).

- `mut-killers-2/RESULTS.json` sha256 `2421671a68e0f6584b5e2db385d84bcb4ee2a1404cf76f7948ab8a366fda410b` (`RESULTS.txt` `a9468afa`),
  11:45:23Z à 11:45:54Z, sortie 0 : ligne de base verte (229 tests, 0 rouge) ; K1 `dojo-chain.mjs:139 SDL` tué ; K24 `dojo-served-load.ts:277
  CONST` (empilé : le fichier entier, 1 rouge, notre test, 22 verts) tué ; K25 `dojo-served-load.ts:277 ROR` tué. 3 sur 3.
- C'est le cas neuf qui tue le ROR : avant ce lot, sous le même mutant, les six fichiers qui importent le chargeur restaient verts, 83 sur
  83 (sonde P5 de la G2, `F:/tmp/dojo/insp1/g2-depth/out/mut-ge.txt`, sha256 `26627351`).
- Premier lancement, `mut-killers/` (`RESULTS.txt` `1dd81d1a`, 11:37:57Z, `--repo` le clone `gel`) : « non conclu (base) » pour les trois, la ligne
  de base portant 6 rouges `ERR_MODULE_NOT_FOUND` (par exemple `@next/mdx`) : l'outil prend `node_modules` à côté du `.git` de `--repo`
  (`scripts/mutants/run.mjs:176`), et `gel` n'en avait pas. `RESULTS.txt` lu, second lancement sur un clone NEUF avec jonctions (Q-6).

### 4.4 `red-proof.mjs` du tronc rejoué (sha256 `6579b550`), deux formes (Q-2), `--seed 20261001`

- **(C), le lot DEPTH-BOUND corrigé** : `--base 35930dc8 --gel F:/tmp/dojo/depthcorr/gelC --repo F:/Monark --out F:/tmp/dojo/depthcorr/rp-C2
  --draw 7` (`gelC` = `0cb7272d`, le commit du lot, plus les fichiers corrigés ; les sept fichiers sont égaux entre `0cb7272d` et `89403796`,
  `git diff --stat` vide). `rp-C2/RED-PROOF.json` sha256 `655b59edd131d9a5df29aa45a9e9b6a3790e61a46212523213e2ea59c101ba78`, digest `06bd7c6b`,
  11:41:11Z à 11:42:19Z, **sortie 0** : 7 jugés, **7 F2P**, 72 inchangés ; 7 tueurs tirés sur 7, **7 tués** par assertion (dont
  `dojo-served-load.ts:277 ROR` et `dojo-chain.mjs:139 SDL`), fichiers rendus (sha256 avant et après égaux).
- **(A), à la lettre** (« sur l'arbre corrigé, même forme que le G1 ») : `--base 35930dc8 --gel F:/Monark-wt-depth-corr --repo F:/Monark --out
  F:/tmp/dojo/depthcorr/rp-A2 --draw 30`. `rp-A2/RED-PROOF.json` sha256 `3f1a95d390673dd6406d47b1699cb5a7008969943068a1e819731742591131e3`, digest
  `3407f531`, 11:42:29Z à 11:44:39Z, **sortie 1** : 16 jugés, 15 F2P, 1 refusé « green at base » : `dojo_publish_history_waits_for_the_first_day_read`
  (`apps/dojo/test/dojo-publish.test.ts:712`), dont le corps a changé dans la plage par K31 (`e79d9714`, un test seul, l.718), hors de ce lot ; 15
  tueurs tirés sur 15, 15 tués. La plage `35930dc8..89403796` porte aussi B1-CORR suite (`83025d7a`), AC-5 (`9ea68c11`) et K31.
- Avant reformulation : `rp-C/RED-PROOF.json` `4ce05515` (7 F2P, 7 tués), `rp-A/RED-PROOF.json` `fe1b63fc` (même issue que (A)).

### 4.5 Aucune ligne exécutable touchée

- `probe/tokens.cjs` (sha256 `15b76eb2` ; TypeScript 6.0.3 lu dans `F:/Monark/node_modules`, jamais écrit) : base `89403796` contre arbre final,
  les quatre fichiers de code : jetons-feuilles égaux (les nœuds JSDoc, commentaires rattachés à une déclaration, écartés et comptés : même nombre
  des deux côtés), fichier réimprimé sans commentaires égal, aucun diagnostic d'analyse. `probe/tokens2-final.out` sha256 `a40fa868`. Contrôle
  négatif : sur le mutant de §4.2, l'outil voit la différence (`probe/tokens2-negctl.out` `dd100ff9`, sortie 1).
- Diff ligne à ligne (`git diff -U0`), `probe/diff-classes-final.out` sha256 `6ce67bdc` : `dojo-chain.mjs` 12 lignes de commentaire retirées et
  12 ajoutées ; `dojo-verify.mjs` 1 ligne vide retirée, 1 ligne de commentaire ajoutée ; `dojo-live.ts` 1 et 1 ; `dojo-served-load.ts` 2 et 2 ;
  **aucune ligne de code**. Nombre de lignes égal à la base pour les quatre fichiers (205, 375, 325, 278).

### 4.6 Tous les tueurs du dépôt, recensés (`probe/killers2.mjs`, sha256 `5fc5b162`, `parseKiller` du tronc et règle de `killerProblem`)

`probe/killers2.out` sha256 `cb9abc683587f570d3d2c111e9205697fa82a33a942b5091adfbaa49309be52a` : base 399 lignes, 375 valides, 24 invalides
(préexistantes : 15 non lues, 5 opérateurs, 2 textes non uniques, 2 SDL) ; arbre final 400, 376, 24, le même ensemble d'invalides ; la seule
ligne neuve est le ROR, valide, au-dessus du `test(` ; aucune ligne perdue. Les 44 tueurs qui citent les quatre fichiers de code restent valides
(45 avec le ROR) : leurs lignes n'ont pas bougé.

### 4.7 Garde d'octets

42 lignes ajoutées au diff suivi : aucun antislash, TAB ni octet de contrôle ; une seule au-delà de 160 caractères, la l.98 de l'ADR (600 ; Q-4).
Ce journal : lignes de 160 au plus, sans antislash ni TAB.

### 4.8 Jonctions `node_modules`

`mk-nm.ps1` (sha256 `d70d8aea`) dans `mutrepo`, 11:45:03Z (220 entrées, 11 `@monark`, 0 échec), puis dans `gel` pour le test de §4.1, 12:03:36Z ;
retirées par `rm-nm.ps1` (`b51b5d22`) de `mutrepo` et du clone interne de l'outil (`mut-killers-2/clone`, 220 jonctions), 11:46:18Z à 11:46:26Z
(« removed ») ; retirées de `gel` à 12:03:52Z ; `F:/Monark/node_modules` : 220 entrées et 11 `@monark` avant et après chaque cycle, et après les
oracles de 11:47Z et 11:57Z ; aucun `node_modules` restant sous `F:/tmp/dojo/depthcorr/` (`find`, 12:03:52Z). `tmp/` (TEMP) garde des sorties
brutes de `git diff` et des listes : brouillon de travail.

### 4.9 Hygiène de mes fichiers hors dépôt (garde d'octets appliquée à tout ce que j'ai écrit ; sha256 à l'usage, puis après)

- Ré-enveloppés après usage, même sens, `node --check` vert (`probe/rewrap.mjs`, `5f2ebdce`) : `edits/edit.mjs` `7f2b6632` puis `2c4371dc` ;
  `spec.mjs` `267b2048` puis `482b1ef9` ; `edit2.mjs` `4930c385` puis `f35aa78f` ; `spec2.mjs` `69f02dce` puis `662c7834` ; `edit3.mjs` `34a01763`
  puis `ab17e6ab` (`spec3.mjs` `6652562c`, conforme d'emblée). `probe/tokens.cjs` : `4120cda0` au premier usage, `15b76eb2` ensuite (§4.5).
- **Écart** : `probe/killers.mjs` (`578797d0`), écrit par heredoc, portait trois antislashs (des `/` échappés dans deux expressions) ; remplacé
  par `killers2.mjs`, sans antislash, rejoué (§4.6, mêmes comptes) ; l'ancien et ses sorties retirés par chemins littéraux : `killers-base.out`
  `b439e809`, `killers-new.out` `87c89ad3`, `killers-final.out` `3578f8c9`, `killers-diff.out` `ed5be13b` ; de même `tokens.out` `9c587136`,
  `tokens-final.out` `38565f1c`, `tokens-negctl.out` `1a72cb3f`, remplacés par `tokens2-*`.
- Textes aux lignes longues, coupées à 156 (suite « ~ ») : `probe/phrases-base.txt` `0b0cfece` puis `e31ba96f` ; `probe/diff-classes.out`
  `b87ac0d0` puis `18d50c91` ; `edits/chain-header.txt` `7eb44c24` puis `673c05d5` ; `edits/chain-header-2.txt` `24aa9675` puis `b6ffba17`.
- Mes captures de la sortie standard des outils, antislash écrit `%5C` et lignes coupées : `rp-C.out` `3f336cff` puis `5864a979` ; `rp-A.out`
  `7fa62702` puis `ca9ba009` ; `rp-C2.out` `304d4fdf` puis `23ec0330` ; `rp-A2.out` `4e0559bf` puis `c8c76c44` ; `oracle-1.out` `c1eed3de` puis
  `d9ba1bd4` ; `mut-killers-2.out` `6fd8caa0` puis `4762ca88`.
- Les fichiers écrits par les outils eux-mêmes (`RED-PROOF.json` et TAP de `red-proof`, `RESULTS.*` et TAP de l'outil de mutants,
  l'enregistrement de l'oracle et ses journaux) restent octet pour octet, cités par sha256 ; ils peuvent porter des antislashs (chemins Windows
  dans du JSON).

## 5. Portes statiques et R-25

- Oracle du tronc (sha256 `f22b9045`) : `node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-depth-corr --base
  894037968db4a38a64f21a51c6261b7b69ffb998 --key DEPTH-CORR --static-only`, 11:47:04Z à 11:48:09Z, **sortie 0** ; enregistrement
  `F:/tmp/oracle-results/894037968db4a38a64f21a51c6261b7b69ffb998-08f2bfce690cd650-corr-20261001T114704Z-375000.json`, sha256
  `5b18868e2924b03fa1b1021d65d139461b85917509375e8d429f0a245fa8475a` ; arbre figé `dirty` `08f2bfce` (le même que la campagne de §4.3), objet
  `12bb1033` ; `served_from` nul (rejeu). Portes : `typecheck` 0, `lint` 0, `lint:ratchet` 0, `lang:gate` 0, `export:check` 0, `gate:vocab` 0,
  `lint-model-pinning` 0, `r25` 0.
- **R-25** (le `r25()` exporté de `scripts/oracle/r25.mjs`, sha256 `4d0544df`, appelé par l'oracle) : `STAT` 41 insertions et 28 suppressions,
  **69 lignes** (borne de la mission 1 150 ; porte CI `VIBEGATES_PR_LIMIT` 1 205) ; `CONTENT_STAT` 0 (borne 8 000). L'ADR et ce journal sont hors
  du compte : `ci.yml:82` exclut `docs/G1-lot-*.md` et `docs/**/*.md`.
- Cet oracle a figé l'arbre quand ce journal n'avait que son §1 ; le rejeu sur l'arbre final, journal achevé, est cité dans
  `F:/tmp/dojo/depthcorr-deliver/REPONSE.md`.

## 6. Fin : constat, fichier, test ; R-25 ; portes ; Q-n

| Constat | Fichier (lignes à l'arbre final) | Test ou preuve |
|---|---|---|
| C-1 (a) | `apps/dojo/scripts/dojo-chain.mjs:188-189` | commentaire seul, §4.5 |
| C-1 (b) | `apps/site/lib/dojo-live.ts:322` | commentaire seul, §4.5 |
| C-1 (c) | `apps/site/lib/dojo-served-load.ts:274-275` | commentaire seul, §4.5 |
| C-1 (d) | `apps/dojo/scripts/dojo-chain.mjs:171-172` | commentaire seul, §4.5 |
| C-1 (e) | `apps/dojo/test/dojo-chain.test.ts:321` | `dojo_walk_refuses_a_line_nested_past_the_bound` |
| C-1 (f) | `apps/dojo/test/dojo-chain.test.ts:325` | même test ; rouge sous le mutant ad hoc (§4.2) ; K1 tué (§4.3) ; F2P (§4.4) |
| C-2 (a) à (c) | `test/dojo-live.test.ts:470-494` | `dojo_served_build_reads_no_text_past_the_depth_bound` ; F2P (§4.4) |
| C-2 (d) | `test/dojo-live.test.ts:468-469` | K24 et K25 tués (§4.3) ; le ROR tiré et tué par `red-proof` (§4.4) |
| N-3 | `apps/dojo/scripts/dojo-verify.mjs:184` | commentaire seul, §4.5 ; Q-1 |
| N-4 (a), (b) | `apps/dojo/scripts/dojo-chain.mjs:2-8`, `:137` | §4.5 ; `dojo_walk_imports_the_closed_list` vert (§4.1) ; Q-3 |
| N-4 (c) | `docs/adr/ADR-DOJO-PR-1B-4.md:98` | renvoi par symbole ; Q-4 |

- **R-25** : 69 lignes (41 + 28) pour une borne de 1 150 (§5). **Portes** : `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`,
  `gate:vocab` à 0 (§5). **Tests** : 79 sur 79 sur les trois fichiers, `site_names_no_kitchen` vert ; trois tueurs sur trois tués ;
  `red-proof` (C) sortie 0, 7 F2P, 7 tués.
- **Verdict du correcteur : LIVRE-AVEC-RESERVES** ; réserves : Q-4 (une ligne de plus de 160 caractères, l'ADR), Q-2 (la forme (A) de
  `red-proof` sort 1, pour un test d'un autre lot), Q-1 et Q-3 (deux choix faits dans le cadre, à confirmer).

### Q-n (aucune dette nue : chaque point est une décision demandée, avec ses mesures)

- **Q-1, place de la phrase N-3.** La l.176 de `dojo-verify.mjs` est mixte (`});` suivi du commentaire) : y écrire toucherait une ligne
  exécutable au sens de la règle l.18 de `REGLES-MISSION.md` (le tour garderait sa revue G2 ciblée) ; ajouter une ligne déplacerait les 11
  tueurs qui citent `dojo-verify.mjs:237` à `:349`, dont `test/dojo-verify-url.test.ts:47`, hors des sorties de la mission. Fait : la ligne VIDE
  l.184 (après le refus de la marche, l.183) porte la phrase. Décision demandée : (a) garder ; (b) la porter dans le commentaire de la l.176.
- **Q-2, base de `red-proof`.** Contre `89403796`, les deux tests changés seraient verts des deux côtés (aucun code ne change dans ce tour) :
  refus « green at base » par construction. Deux rejeux donc (§4.4) : (C) le lot DEPTH-BOUND corrigé, sortie 0 ; (A) le worktree, à la lettre,
  sortie 1 par le seul test de K31 (`e79d9714`), changé dans la plage par un autre lot. Décision demandée : lequel l'orchestrateur consomme
  (proposé : (C) pour ce lot, (A) comme état de la plage).
- **Q-3, l'en-tête N-4.** La décision dit « là où l'ordre de Bell dirait `signature_invalid` » ; écrit : « where Bell's order goes on to the
  signature (signature_invalid for a line edited after signing; far deeper, canonical recurses) », parce qu'une ligne signée par le détenteur
  de la clé avec un champ imbriqué passe la signature de Bell (mesure ci-dessous), et qu'à 500 001 niveaux la base levait une `RangeError` dans la
  marche (P1). Mesure : `probe/bell-order.mts` (sha256 `4265c388`) sur `gel`, sortie `probe/bell-order.out` (`7b919cbc`, 11:55:52Z) : la ligne
  12 signée avec un champ imbriqué, `verifyLine` de Bell `true` à 16 et à 17 niveaux ; la marche Dōjō la marche à 16 et la refuse à 17
  (`timeline_malformed` @12). Décision demandée : garder la précision, ou la phrase de la décision mot pour mot.
- **Q-4, la l.98 de l'ADR au-delà de 160 caractères.** Ligne de paragraphe modifiée en place : 574 caractères avant, 600 après (115 des 247
  lignes de l'ADR passent 160). La couper déplacerait les renvois par numéro de ligne vers cet ADR : l.172, l.189, l.191, l.193, l.227, l.229
  et l.244, cités par `ADR-DOJO-PR-3.md`, `ADR-DOJO-PR-4.md`, `ADR-DOJO-PR-1B-5.md` et `apps/dojo/test/dojo-verify.test.ts:27` (`git grep`).
  Décision demandée : (a) accepter cette exception (une ligne existante éditée en place, seul le renvoi change) ; (b) couper la ligne et
  renuméroter les sept renvois, dans des fichiers hors des sorties de la mission.
- **Q-5, tueur proposé pour l'épingle C-1 (f).** `// killer: apps/dojo/scripts/dojo-chain.mjs:191 CONST "jsonDepth(text) > DOJO_MAX_DEPTH ? null"
  -> "JSON.parse(text) && jsonDepth(text) > DOJO_MAX_DEPTH ? null"` (une ligne, écrite ici sur deux), empilé au-dessus du `:139 SDL` : mesuré
  rouge par assertion (§4.2), non ajouté sans décision (la mission n'en nomme pas ; `red-proof` lit la ligne du dessus, qui resterait le SDL).
- **Q-6, écarts de méthode (origine : correcteur), chacun consigné.** (a) Trois lectures git du worktree sans `GIT_OPTIONAL_LOCKS=0` (en-tête).
  (b) Premier envoi du §1 refusé au lexage du harnais, rien d'écrit (en-tête). (c) Premier lancement de l'outil de mutants « non conclu (base) »
  faute de `node_modules` dans `--repo` ; `RESULTS.txt` lu ; second lancement sur un clone neuf avec jonctions (§4.3). (d) `probe/killers.mjs`
  écrit par heredoc avec trois antislashs, remplacé (§4.9). (e) Des échappements en ligne de commande : guillemets échappés dans quatre `node -e`
  (ils ont écrit `edits/spec2.mjs` et modifié `probe/tokens.cjs`, `probe/bell-order.mts` et, une fois, `probe/rewrap.mjs`, réécrit ensuite
  en entier par heredoc), des séquences d'expressions régulières dans des `node -e` qui n'écrivaient rien, une séquence dans deux `grep` qui
  ont échoué sans rien écrire ; pas des heredocs ; les fichiers produits sont vérifiés sans antislash. (f) PowerShell lancé pour C-V-4 et pour `mk-nm.ps1` et
  `rm-nm.ps1` (`-ExecutionPolicy Bypass`, portée du processus) : son écriture de profil sur C: est l'item connu CV4-POWERSHELL-C-WRITE-1, non
  re-mesuré ; rien d'autre de ma main sur C:. (g) Les mesures faites avant la reformulation de l'en-tête (commentaire seul) sont gardées et
  citées ; toutes ont été rejouées sur l'arbre final. (h) Les sondes ont tourné sur des clones, jamais sur le worktree ; aucun oracle arrêté.
  (i) C-V-4 lu sept fois par `Get-CimInstance` (§4), pas avant chacune des courses brèves qui ont suivi ; le verrou d'hôte, lui, avant chacune.
  (j) Le §1 a reçu après coup deux corrections de forme (l'heure de l'envoi refusé, celle de son achèvement), sans toucher les constats ni le
  compte ; et le §4 une correction d'unité (Mio, pas Go, pour les relevés C-V-4).

Git : aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`, aucun commit, aucun workflow (R-20). Dans le worktree : lectures seules (`status`,
`diff`, `ls-files`, `rev-parse`, `log`, les miennes sous `GIT_OPTIONAL_LOCKS=0` sauf l'écart (a), et celles de `red-proof` (A) et de l'oracle) ; les
fichiers modifiés en place sont les sept du §2 et ce journal (neuf, non suivi). Écritures git seulement dans mes clones sous `F:/tmp/dojo/depthcorr/`
(`clone --no-local`, `checkout`) et dans les clones propres de `red-proof`, de l'outil de mutants et de l'oracle. Aucun réseau réel (boucle locale des
tests), aucune clé réelle.
