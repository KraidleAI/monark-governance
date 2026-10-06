claude-opus-5-5

# G1 — journal du lot Dōjō PR-1b-5b (piste A, vérificateur : transport et CLI extraits vers `dojo-verify-cli.mjs`)

- **Modèle résolu (R-1)** : `claude-opus-5-5`, effort max (mission), instance fraîche, contexte frais.
- **Mission** : `F:/tmp/dojo/mission-g1-pr1b5b.md` (54 l., 15 827 o.), sha256
  `fe8d81ca434f0d607328745f1cc70d29768f2caad4603d89102bf51abf00d26b`, recalculé AVANT lecture (06:16:20Z) = `sha` du reçu
  `F:/tmp/dojo/mission-g1-pr1b5b.recu.json` (verdict vert, 12 codes à 0, base = head = `47e58ee7`).
  Règles insérées (`docs/methode/REGLES-MISSION.md`, 18 l.) sha256 `12d5f2df4b5dd9b3cb633727f9e5af8d960fdfdfe22f66e4023b8e88bba40335` = champ de la mission.
- **Worktree** : `F:/Monark-wt-dojo-pr1b5b`, branche `lot/dojo-pr1b5b`, HEAD `47e58ee700535e06ccc00ccb09ad7430147bcde5`, verrouillé ;
  `git status --porcelain` à l'ouverture : 0 ligne. Tronc `F:/Monark` à `4f4415bd` (lancement des G1 de 5a et 5b).
- **Lot parallèle** : PR-1b-5a dans `F:/Monark-wt-dojo-pr1b5` (même base) ; son `dojo-verify.mjs` lu à 06:18:59Z, identique à la base
  (`596a349d…aef59`) : aucune place de hunk de 5a observable ; les places fixées par C-V-3 font foi.
- **Heures** (`date -u`) : 06:16:20Z (sha256 de la mission), 06:24:43Z (fin des lectures ; verrou d'hôte libre), 06:30:57Z (empreintes
  des entrées), puis ce journal avant tout code ; la suite : section « Remise ».

## Lu (sha256 recalculés ; entrées de la mission dans son ordre ; chemins relatifs au worktree sauf mention)

| Entrée | Lignes | sha256 | Lecture |
|---|---|---|---|
| `docs/adr/ADR-DOJO-PR-1B-5.md` | 243 | `620517fd26755b7cd5d19273855438eb3586ba3c7330d272f6d1fae0b46fd65d` | en entier (pli, lignes datées) |
| `docs/G0-lot-dojo-pr1b5.md` | 72 | `ecfa0d3b7c6407fe866aafaaf2216de94b326132a387d2758e97e6b3872ecce4` | en entier |
| `F:/tmp/dojo/cp1-pr1b5/CP1-report.md` | 88 | `cf49836a9b4047ecde807923d324d9f9b9ce81901c70b607d23c91ac4d6a731e` | en entier |
| `apps/dojo/scripts/dojo-verify.mjs` | 422 | `596a349dbf64afcf3c408ceaee27c40c4287b56d01f09b4c92542e45e48aef59` | en entier |
| `apps/dojo/scripts/dojo-verify.d.mts` | 41 | `7a5e4c212ff310196dd95d9a5595461a9d4fc6ebefb0be0bf1fdfae7f28a594d` | en entier |
| `apps/dojo/scripts/dojo-chain.mjs` | 168 | `04411fa71b2cfd365ef7023161d82e0fa65f9f4904b27964caf78b4b39ca7123` | en entier |
| `apps/dojo/test/dojo-verify.test.ts` | 598 | `10cfacb7e14ec26a5c63623225692e3c55d00ca2d14a113fcb372e4443ccf28c` | en entier |
| `test/dojo-verify-url.test.ts` | 89 | `689176d248ba5be20850e0774173ec8d853c7351f46473a783972ebb78461704` | en entier |
| `apps/dojo/test/dojo-publish.test.ts` | 486 | `a5d1fa1f7f122094477475f2080cebec0589f14e26b2c0a590c881ed5e36260f` | l.1-30, l.180-212 |
| `docs/adr/ADR-DOJO-PR-1B-4.md` | 247 | `ffc7e139be26997b2c6dfc925f2ccc65b6d1e39f26772c88ac20bdc0eb2853da` | §4, §5, plis cp-1 et G7 (l.137-160, l.225-247) |
| `docs/adr/ADR-DOJO-SNAPSHOT-1.md` | 1 365 | `b67d99b676cc846611616340cd5db298b0d6ddc5a44ae621594582e14a978fa1` | D-10 l.255-262, D-17 l.296-309 |

- **Hors liste, lus pour l'outillage** : `F:/Monark/scripts/red-proof.mjs` (268 l., `6579b550…eab36`, en entier) ;
  `F:/Monark/scripts/mutants/run.mjs` (238 l., `2606e7da…3b19`, en entier) ; `F:/Monark/scripts/oracle/run.mjs` (173 l., `8ab26615…5a90`,
  en entier) ; `F:/Monark/scripts/oracle/r25.mjs` (28 l., `4d0544df…cf0`) ; `F:/Monark/scripts/oracle/lock.mjs` (47 l., `501a76b5…3bb`) ;
  tables de mutants de PR-1b-4 : `F:/tmp/dojo/pr1b4/mutants-table.mjs` (`13dec40b…cd5b`), `F:/tmp/dojo/g2-pr1b4/mutants-table-g2.mjs`
  (`f6a4435c…7acc`), `F:/tmp/dojo/pr1b4-corr/mutants-table-corr.mjs` (`a2b60e3e…bd3f`), `F:/tmp/dojo/cp2-pr1b4/mutants-table-cp2.mjs`
  (`95cef31c…6161`, 46 rangs) ; `.github/workflows/ci.yml` l.44-100 (`0f401ae2…949a`) ; `package.json` (`d7a429e1…b700`) ; `eslint.config.mjs`,
  `lint-ratchet.json` (plafond 69), `scripts/lang-gate.mjs` l.1-151 ; mission de 5a `F:/tmp/dojo/mission-g1-pr1b5a.md` l.33-54 (places de hunks).
- **Consommateurs mesurés** (`git grep dojo-verify`, hors docs) : onze fichiers importeurs par nom (inchangés) ; deux chemins de CLI
  (`apps/dojo/test/dojo-verify.test.ts:22`, `test/dojo-verify-url.test.ts:19`) ; renvois en commentaire `dojo-publish.mjs:34,36,185,235`,
  `reading.ts:52` (restent vrais : le cœur garde son chemin). Fermeture du cœur (`dojo-chain.mjs`, `dojo-core.mjs`, `bell-chain.mjs`) :
  aucun des 13 jetons de `dojo-publish.test.ts:191-192` ni `process.env` (grep, 0 ligne) ; dans `dojo-verify.mjs`, seules l.73 et l.85.

## Compte ascendant par fichier (tâche 1, AVANT tout code ; indicatif, C-V-4 : la coupe se décide sur `r25()` mesuré)

| Fichier | Ce qui change | Lignes écrites (ascendant) | Lignes retirées |
|---|---|---|---|
| `apps/dojo/scripts/dojo-verify.mjs` | l.8-9 (2 → 2), l.19 (É-7), l.61-104 retirées, `export` l.147, CLI l.386-422 → garde | ≈ 9 | ≈ 85 |
| `apps/dojo/scripts/dojo-verify-cli.mjs` (neuf) | en-tête ≈ 6, imports 4, `refuse` 1, transport 43 (copie à l'octet), CLI 35, entrée 1 | ≈ 92 | 0 |
| `apps/dojo/scripts/dojo-verify.d.mts` | l.21-24 et l.41 retirées ; `dayOk` déclaré | ≈ 2 | 5 |
| `apps/dojo/scripts/dojo-verify-cli.d.mts` (neuf) | `urlAllowed`, `urlSource`, `runVerifyCli` ; types importés du cœur | ≈ 10 | 0 |
| `apps/dojo/test/dojo-verify.test.ts` | imports, `SCRIPT` l.22, `CORE` et import gardé, test 7, huit lignes `dv.url*`, six tueurs, test neuf | ≈ 55 | ≈ 20 |
| `test/dojo-verify-url.test.ts` | `SCRIPT` l.19, tueur l.47, extension du test 8 après l.66 | ≈ 5 | ≈ 2 |
| **Total** | | **≈ 173** | **≈ 112** |

- Mesure attendue (insertions + suppressions) ≈ 285, solde ≈ 262 à 547 (ADR : ≈ 291) ; aucune coupe de repli prévue ; mesure dès le code écrit.
- **Plan de rebase (C-V-1 ; ce lot fusionne en SECOND)** : après le G7 de 5a, rebase sur le tronc ; réancrage par contenu des tueurs
  `dojo-verify.test.ts` l.472, 514, 528 (déjà vers `dojo-verify-cli.mjs` ici) et l.551, 566, 588, `dojo-verify-url.test.ts` l.47 (vers
  les lignes du cœur décalées par la passe calendrier de 5a) ; `red-proof.mjs` rejoué sur l'arbre rebasé avant le G7 ; rejeux par nom
  des tests de 5a et des rangs V-2 et V-3 sur le module CLI (PLI-3).

## Code (tâche 2 ; sha256 de l'arbre final, `date -u` 06:46Z, identiques dans le clone `gel` par `cmp`)

| Fichier | Lignes | sha256 | Ce qui a changé |
|---|---|---|---|
| `apps/dojo/scripts/dojo-verify.mjs` | 347 | `fe143deeb342ca1fc1ddb896a1331e254791ec10c145943aa91535eda4e813d0` | +9 −84 (détail ci-dessous) |
| `apps/dojo/scripts/dojo-verify-cli.mjs` (neuf) | 93 | `41ebd5b2257a797c6563e76ba8046ced43c03fcc870ae4a920721cf97522a9ae` | transport et CLI déplacés |
| `apps/dojo/scripts/dojo-verify.d.mts` | 38 | `fa8e9c5a55cb66aecacaef895ca7f0f26cfc0cdf90a98dbcaf94ef705574321c` | +2 −5 |
| `apps/dojo/scripts/dojo-verify-cli.d.mts` (neuf) | 9 | `462e6c6f2118ea432929960abedf03d3d7c9f3c8565d5717664dd8a62d12bd62` | surface du module CLI |
| `apps/dojo/test/dojo-verify.test.ts` | 637 | `49180035d2d116900d0a80209b906a56f366acb15d4e96e93651383fc88510ec` | +58 −19 |
| `test/dojo-verify-url.test.ts` | 91 | `2dd595790619f96882eb4f78d65c39f4c50631c5bb028c5de7a96c5d5efb5468` | +4 −2 |

- **Cœur** (PLI-1) : en-tête l.8-9 réécrit à nombre de lignes égal (le tueur du test 7, `dojo-verify.mjs:56`, garde son ancre) ; l.19 : « (l.252) »
  retiré, renvoi par nom (É-7) ; transport de la base l.61-103 retiré avec un des deux séparateurs vides (l.104) : **décalage −44** (le cp-1
  annonçait −43) ; `export` posé sur `dayOk` (l.103) ; CLI de la base l.385-422 retirée ; garde PLI-1 bis l.342-347 : lancé comme script,
  le cœur n'exécute rien, écrit sur stderr l'usage de `node apps/dojo/scripts/dojo-verify-cli.mjs` et pose `process.exitCode = 1`.
  Imports inchangés (sept, dont `node:url` pour la garde) ; exports : neuf (les huit noms et `dayOk`) ; 0 `fetch(`, 0 `process.env`.
- **Module CLI** : en-tête l.1-5 (aucun jeton compté par le test 7), imports l.6-9 (`node:fs`, `node:url`, `canonical` de `bell-chain.mjs`,
  du cœur `DojoVerifyError`, `VERIFY_BOUNDS`, `dayOk`, `dirSource`, `verifyDojoServed`), `refuse` d'une ligne l.11 (calque de l.35 du cœur),
  transport l.13-55 = base l.61-103 **à l'octet** (sha256 `04092bc6…2397` des deux côtés), `USAGE` l.57 (commande renommée, préfixe
  `dojo/verify:` gardé), l.58-91 = base l.387-420 à l'octet (`6b85903e…6599`), entrée l.93 = base l.422 (`38619609…2c92`). Exports :
  `urlAllowed`, `urlSource`, `runVerifyCli`. Une seule classe `DojoVerifyError` (celle du cœur, importée).
- **`.d.mts` scindé** : le cœur perd `urlAllowed`, `urlSource` (l.21-24) et `runVerifyCli` (l.41), gagne `dayOk` ; le module CLI importe
  `Source` et `VerifyBounds` du cœur.
- `apps/dojo/test/dojo-publish.test.ts` : **non modifié** (Q-G1-1).

## Tests (tâche 2)

- **Neuf** : `dojo_verify_core_imports_no_network_module` (fin de fichier, l.620 ; tueur l.619 `dojo-verify.mjs:12`, ajout de `node:http`) :
  fermeture parcourue depuis le cœur sous les listes de `dojo-publish.test.ts:190-192` et `process.env` ; fermeture = quatre fichiers ;
  exports du cœur = neuf noms, triés, écrits à la main.
- **Amendés** : test 7 (l.114 : imports du module CLI ; l.122-128 : imports du cœur, T-10 du cœur à 0 et 0, ancienne commande = exit 1,
  stdout vide, stderr égal octet à octet à l'usage de la nouvelle, lu par `cli()`) ; les trois tests du transport par l'import gardé
  `cliModule` (l.23-32 : existence assertée d'abord, import de forme calculée, type local `Transport`, Q-G1-3) ; test 8 (`SCRIPT` l.19 ;
  l.67-68 : rapport de la vraie CLI par `--url` = rapport de `verifyDojoServed` du cœur sur `dirSource` du même arbre).
- **Places de hunks (C-V-3)** : test 7 : premier hunk de 5b à la l.104 de la base, l.101-103 inchangées (trois lignes après l'insertion de
  5a après la l.100) ; test 8 : extension après la l.66 ; test neuf en fin de fichier.
- **Tueurs réancrés** : `dojo-verify.test.ts` l.489 → `dojo-verify-cli.mjs:32`, l.531 → `:37`, l.545 → `:33` ; l.568 → `dojo-verify.mjs:312`,
  l.583 → `:308`, l.605 → `:323` ; `dojo-verify-url.test.ts:47` → `dojo-verify.mjs:326` ; l.78 inchangé (`:56`). Contrôle par `parseKiller`
  du tronc : neuf tueurs, chacun au-dessus de son test, `<before>` une seule fois sur sa ligne (`F:/tmp/dojo/pr1b5b/tmp/check-killers.mjs`).
- **Course ciblée** (verrou libre, 06:41:09Z → 06:41:25Z) : 27/27 verts (`F:/tmp/dojo/pr1b5b/tmp/run1.tap`).
- **Statiques** sur le clone `gel` (verrou libre, 06:41:58Z → 06:42:52Z) : `tsc --noEmit` 0 ; `eslint` des deux fichiers de test 0 ;
  `lint:ratchet` 69/69 (plafond non dépassé) ; `lang:gate` OK ; `gate:vocab` OK (326 fichiers).
- **Importeurs par nom** (Review Focus 3) : la ligne de base de la campagne de mutants a couru les dix fichiers de test importeurs du cœur
  (les deux du lot et huit autres) : 96 verts, 0 rouge (`F:/tmp/dojo/pr1b5b/mutants/tap/BASELINE.tap`, sha256 `ba86dfb1…883b`), dont
  `dojo_collect_to_verify_end_to_end`, `dojo_publish_to_verify_end_to_end`, `dojo_served_refuses_a_tree_the_verifier_refuses`,
  `dojo_served_data_matches_deploy_ca`, `dojo_sync_get_holds_its_contract`, les quatorze `dojo_publish_*` et le test 8 ;
  `scripts/sync-dojo-served.mjs`, onzième importeur, est chargé par `test/dojo-served.test.ts`.

## F2P (tâche 3)

- `node F:/Monark/scripts/red-proof.mjs --base 47e58ee7 --gel F:/Monark-wt-dojo-pr1b5b --repo F:/tmp/dojo/pr1b5b/base --out`
  `F:/tmp/dojo/pr1b5b/f2p --draw 3 --seed 2026` ; clone de base `--no-local` à `47e58ee7`, `node_modules` = une jonction vers
  `F:/Monark/node_modules` ; TEMP sous `F:/tmp/dojo/pr1b5b/tmp/rp` ; verrou libre ; 06:43:02Z → 06:44:04Z, exit 0.
- **`F:/tmp/dojo/pr1b5b/f2p/RED-PROOF.json`, sha256 `2acfd0a27612e6b0abdbb62fd24dfa0fc14362ef93e9e1783b0126b98bef6ea1`** : `ok` vrai ;
  six tests jugés, six **F2P** (rouges à la base par `ERR_ASSERTION`, verts au gel) : `dojo_verify_cli_is_fail_closed`,
  `dojo_verify_url_transport_is_the_bell_policy`, `dojo_verify_url_equals_dir_on_the_same_tree`, `dojo_verify_totals_are_bounded`,
  `dojo_verify_core_imports_no_network_module`, `dojo_verify_url_cli_is_the_ca_contract` ; 21 inchangés ; digest du gel `12df8fa1…8662`.
- Tirage (graine 2026, population 6) : trois tueurs, tous **tués** par assertion, fichier restauré (sha256 avant = après) :
  `dojo-verify-cli.mjs:37`, `dojo-verify.mjs:56`, `dojo-verify.mjs:12`.

## Mutants (tâche 4)

- Table `F:/tmp/dojo/pr1b5b/mutants-table-pr1b5b.mjs`, sha256 `5253b0be9cee3c8993a9e10b0c8796424846aedc841d896f72662f2764a2ec23`, générée
  par `F:/tmp/dojo/pr1b5b/gen-table.mjs` (sha256 `0f409f13…a185`) depuis la table du cp-2 de PR-1b-4 (`95cef31c…6161`, 46 rangs) ;
  prédictions (« expect ») écrites dans la table AVANT la course.
- Commande : `node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/pr1b5b/gel --base 47e58ee7 --out F:/tmp/dojo/pr1b5b/mutants`
  `--table <table> --killers --file apps/dojo/scripts/dojo-verify-cli.mjs --targets apps/dojo/test/dojo-verify.test.ts,test/dojo-verify-url.test.ts`
  `--lock-root F:/tmp --min-free-mb 4096` ; `held(F:/tmp)` nul, 15 242 Mo physiques et 34 384 Mo virtuels libres, 10 `node.exe` au lancement ;
  `node_modules` = jonction dans le dossier de sortie ; aucune autre course pendant la campagne (06:45:59Z → 06:48:21Z).
- **`F:/tmp/dojo/pr1b5b/mutants/RESULTS.json`, sha256 `bc57f3919addbba0f678c41ab040878222c723a8bcfb94bfde346fcfeeb46a0b`**
  (`RESULTS.txt` `3193bd0b…7ac4`) : outil `2606e7da…3b19`, arbre d'outil `2ba5df8e`, propre ; ligne de base verte (10 fichiers, 96) ;
  **51 mutants, 48 tués** (tous `strict` : `ERR_ASSERTION` seul), **3 survivants V-2, V-3, V-4** (prédits), 0 non conclu, 0 ancre perdue ;
  exit 1 par les seuls survivants.
- **Partition des rangs de PR-1b-4** (PLI-5) : 31 rangs dont l'ancre part au module CLI, réancrés par contenu (M-U1 à M-U7, M-U9, M-U10,
  N1 à N3, N5 à N10, G2-1 à G2-3, CORR-R301 à CORR-R308, CORR-BODY-EQ, V-1 à V-4), 28 tués ; 14 restent au cœur, code inchangé, non
  rejoués (M-D1 à M-D6, M-B1, M-C1, M-C2, N4, N11, G2-4 à G2-6) ; M-U8 (ancre au cœur, `dirSource`) rejoué car son tueur (T-10) change : tué.
- **Neufs** (au moins quatre exigés) : M-K1 (`node:net` importé), M-K2 (`fetch(` en commentaire), M-K3 (transport ré-exporté par le cœur),
  M-X1 (`--day` par une expression locale), M-X2 (garde retirée) de PLI-5 ; M-X3 (garde à exit 0), M-X4 (usage sur stdout), M-X5 (garde qui
  se nomme), M-X6 (usage de la CLI qui nomme l'ancienne commande), M-X7 (refus de la CLI hors de la classe du cœur) : **dix neufs, dix tués**.
- Tueurs du lot (`--killers`, K1 à K9) : neuf tués, chacun par son test.
- **Survivants** : V-2 et V-3 : leurs épingles sont celles de 5a (D-3) ; tués au rejeu après le rebase (PLI-3) ; V-4 : non discriminable
  sous Node 24.15.0, consigné au pli G7 de PR-1b-4 (l.241). Aucun survivant neuf.

## R-25

- Mesure en lecture seule (06:36:35Z), même métrique que `r25()` (insertions + suppressions, pathspec de `ci.yml`, `docs/**/*.md` exclus) :
  `git diff --shortstat 47e58ee7` des fichiers suivis = 73 insertions, 110 suppressions ; fichiers neufs de code = 93 + 9 = 102 insertions ;
  **285 changées** (175 + 110), **solde 262 à 547** : aucune coupe (C-V-4), aucune compaction. Écart au prévu : ≈ 285 (ce journal),
  ≈ 291 (ADR). Le calcul exporté de `r25.mjs` sur le commit de gel de l'oracle est cité avec l'enregistrement d'oracle.

## Tâche → fichier → test → mutant

| Tâche (ADR) | Fichier : lignes | Test | Mutants |
|---|---|---|---|
| Cœur sans module réseau (PLI-1, TY-5) | `dojo-verify.mjs` (base l.61-104, l.385-422 ôtées) | test neuf ; test 7 (T-10 du cœur) | M-K1 à M-K3, M-U8, K1, K8 |
| Transport et CLI extraits à l'octet (PLI-1) | `dojo-verify-cli.mjs:13-55`, `:57-93` | trois tests du transport, test 7, test 8 | 31 rangs réancrés, K2 à K4 |
| Une seule règle du jour (`dayOk` exporté) | `dojo-verify.mjs:103`, `dojo-verify-cli.mjs:77` | test 7 (`2026-02-30`) | M-X1, N7 |
| Garde de l'ancienne commande (PLI-1 bis, TY-6 bis) | `dojo-verify.mjs:342-347`, `dojo-verify-cli.mjs:57` | test 7 (ancienne commande) | M-X2 à M-X6 |
| Une seule classe `DojoVerifyError` (D-1 inverse) | `dojo-verify-cli.mjs:9`, `:11` | test 8 (refus T-9), test 1 (`instanceof`) | M-X7 |
| Composition CLI → cœur (PLI-4, TC-core) | `test/dojo-verify-url.test.ts:67-68` | test 8 | N5, N8, K9 |
| Surface de types scindée (PLI-1) | `dojo-verify.d.mts`, `dojo-verify-cli.d.mts` | `tsc --noEmit` | sans objet (types) |
| Tueurs du cœur décalés (C-V-1) | `dojo-verify.test.ts:568, 583, 605`, `dojo-verify-url.test.ts:47` | leurs tests, inchangés | K5 à K7, K9 |

## MAST

- **FM-3.3 vérification incorrecte** : attentes écrites à la main (listes d'imports, quatre fichiers de fermeture, neuf noms) ; l'égalité
  des deux usages lie les deux copies du texte (M-X5, M-X6 tués) ; l'épingle de composition du test 8 prouve le câblage CLI → cœur, pas la
  justesse du cœur (couverte par la suite, attentes tirées de la mère) : déclaré.
- **FM-1.1 spécification non suivie** : PLI-1, PLI-1 bis, PLI-2, PLI-4, PLI-5 suivis ; écarts déclarés : décalage −44, type local
  `Transport` (Q-G1-3), `dojo-publish.test.ts` intact (Q-G1-1).
- **FM-3.2 vérification absente après fusion** : 5a fusionne en premier ; plan de rebase ci-dessus (réancrage, `red-proof.mjs` rejoué,
  rejeux par nom, V-2 et V-3 sur le module CLI) ; oracle de l'arbre fusionné au cp-2.
- **FM-2.2 clarification non demandée** : Q-G1-1 à Q-G1-5.

## `error_origin` proposés (à assigner au G7)

- É-G1-1 : décalage −44 au lieu du −43 annoncé (cp-1, C-V-1) : aucune erreur (le séparateur vide part avec le bloc) ; tueurs réancrés par
  contenu, vérifiés par `parseKiller`.
- É-G1-2 : la mission déclare `apps/dojo/test/dojo-publish.test.ts` en sortie alors que PLI-2 et la ligne datée (5) laissent sa fermeture au
  T-8 de 3a-1c : génération de la mission (orchestrateur) ; sans effet.
- É-G1-3 : la regex `IMPORT` de `scripts/mutants/run.mjs` (l.37) compte comme arêtes d'exécution un `import("…")` en position de type et un
  `import type … from` (effacés à l'exécution) : outil (lot M-6) ; force le type local `Transport` (Q-G1-3).
- É-G1-4 : le commentaire de la base l.101 du test 7 (« the three local modules ») est devenu inexact et reste tel quel pour tenir la règle
  des trois lignes de C-V-3 : planificateur du pli (places fixées sans cette ligne) ; correction au rebase (Q-G1-4).

## Questions (Q-G1-n ; à l'orchestrateur, recommandation jointe)

- **Q-G1-1** : `apps/dojo/test/dojo-publish.test.ts` figure dans « À créer » de la mission, mais aucune modification n'est requise : l'éditeur
  n'importe pas le vérificateur à cette base (`dojo-publish.mjs:12-21`), sa fermeture épinglée (l.202-204) reste exacte, et PLI-2 et la
  ligne datée (5) la laissent au T-8 de 3a-1c. Laissé intact. Recommandation : lire la liste de la mission comme une permission.
- **Q-G1-2** : le commentaire de tête du cœur de 5a (Q-V-2) peut toucher le hunk l.8-9 de 5b ; sa place est inconnue avant le gel de 5a
  (fichier de 5a identique à la base à 06:18:59Z). Recommandation : le rebase prévu (C-V-1) règle l'en-tête à la main.
- **Q-G1-3** : le transport est typé dans le test par un type structurel local (`Transport`, l.27-28) au lieu de
  `typeof import("../scripts/dojo-verify-cli.mjs")` : toute écriture littérale du chemin du module CLI dans une forme `import(…)` ou
  `from …` du fichier de test serait lue par `targetsOf` comme un import, les rangs du module CLI tourneraient d'abord sur ce seul fichier
  et ceux du test 8 seraient « non conclus ». Prix : `tsc` ne lie pas ce type au `.d.mts` du module CLI (une dérive serait vue par les
  tests à l'exécution). Recommandation : item **MUTANTS-TYPE-IMPORT-EDGE-1** (la regex `IMPORT` ignore les positions de type ;
  propriétaire : orchestrateur ; déclencheur : le prochain lot qui touche `scripts/mutants/run.mjs`), puis retour à la forme typée.
- **Q-G1-4** : commentaire de la base l.101 du test 7 à corriger au rebase après le G7 de 5a (« the two local modules ») ; recommandation :
  dans le même tour que le réancrage des tueurs.
- **Q-G1-5** : l'enregistrement d'oracle n'est pas recopié dans ce journal : l'y écrire après la capture changerait l'arbre (ce seul fichier)
  et fermerait la réutilisation par le G2 « à arbre identique » (ligne datée 06:0x de l'ADR, postérieure au précédent de PR-1b-4, où le
  journal avait changé après la capture). Recommandation : si l'orchestrateur veut l'enregistrement ici, une ligne datée au gel (son acte,
  son arbre) ; sinon `REPONSE.md` fait foi.

## Oracle (tâche 5)

- Commande : `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-dojo-pr1b5b --base 47e58ee7 --key PR-1b-5b` (outil du
  tronc, sha256 `8ab26615…5a90`), en arrière-plan, jamais interrompu.
- Attente : à 06:55:38Z, `held(F:/tmp)` = tenu par le pid vivant 31916 (oracle G7 d'un autre lot, pris à 06:50:10Z) et une entrée en file
  (G1 de 5a, base `47e58ee7`, 06:52:13Z) ; la voie statique de l'oracle partant dès son lancement, aucun lancement tant que le verrou est
  tenu ou la file non vide (Cadre). Verrou libre et file vide à 07:05:44Z (sondage de `held()` toutes les 10 s).
- **Surfaces de types** : `dojo-verify-cli.d.mts` n'entre dans le programme `tsc` d'aucun fichier de ce lot (import gardé calculé, type local) ;
  compilation ciblée hors dépôt (`F:/tmp/dojo/pr1b5b/tscheck/apps/dojo/check.mts`, les deux `.d.mts` et `bell-chain.d.mts` copiés,
  `--strict --skipLibCheck false`, `tsc` du tronc), verrou libre, 07:06:00Z → 07:06:02Z : exit 0 ; non-vacuité : la surface altérée
  (`urlSource` rendant `Source` seul) rougit (TS2339, exit 2), copie restaurée à l'identique (`cmp`).
- **Lancement** : relevés à 07:06:20Z : `held(F:/tmp)` nul, file vide, 15 393 Mo physiques et 34 917 Mo virtuels libres, 11 `node.exe` ;
  `git status --porcelain` : quatre `M` (les deux modules, les deux tests) et trois `??` (module CLI, sa surface de types, ce journal).
- **Ce journal n'est plus modifié après le lancement** : l'arbre que l'orchestrateur gèlera est alors celui de l'enregistrement
  (`tree.object`), condition de la réutilisation par le G2 (Q-G1-5). L'enregistrement (chemin, sha256, `exit`, portes, suite, R-25 de `r25()`,
  `tree.object`) et le sha256 de ce journal au lancement sont cités dans `F:/tmp/dojo/pr1b5b-deliver/REPONSE.md` et la réponse finale ;
  le verdict du lot, qui dépend de l'oracle, aussi.

## Conduite et déclarations

- **Git** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `git merge-tree --write-tree` ; aucun git écrivant dans le worktree ni dans
  `F:/Monark` (lectures : `rev-parse`, `status --porcelain` et `diff` sous `--no-optional-locks`, `ls-files`, `log`, `worktree list`, `grep`) ;
  écritures git seulement dans mes clones `--no-local` `F:/tmp/dojo/pr1b5b/base` et `gel` (clone, extraction détachée, `status`) ; clones et
  commits de gel des outils (`red-proof.mjs`, `mutants/run.mjs`, `oracle/run.mjs`) : actes de ces outils. Aucun commit, aucun workflow (R-20).
- **Réseau, disque** : aucun réseau réel (boucle locale `127.0.0.1` des tests) ; rien écrit sur C: ; TEMP sous `F:/tmp/dojo/pr1b5b/tmp`.
- **Écritures dans le worktree** : les six fichiers du lot et ce journal, par l'outil d'édition et par `sed -i` (suppressions de lignes, sans
  barre inverse) ; le module CLI assemblé par `sed -n` des régions de la base (sha256 vérifiés) et un heredoc sans barre inverse.
- **Verrou d'hôte** : relu avant chaque course. Tenu par un oracle `corr` d'un autre lot de 06:31:50Z à environ 06:40:50Z : pendant ce
  temps, deux scripts de lecture de moins d'une seconde (`check-killers.mjs`, `gen-table.mjs` : ni test, ni harnais, ni contrôle statique)
  et les deux clones, aucune course. Course ciblée, contrôles statiques, `red-proof.mjs`, campagne de mutants : verrou libre, l'un après
  l'autre, aucun pendant un autre.
- **Jonctions** : les trois jonctions `node_modules` (clone de base, clone `gel`, dossier des mutants) retirées par `rm-nm.ps1` à 06:55:22Z ;
  `F:/Monark/node_modules` intact (218 entrées) ; `F:/tmp/dojo/pr1b5b/mutants/clone` gardé (cité par `RESULTS.json`).
- **Advisor intégré** : deux consultations avant le lancement de l'oracle (après l'orientation : forme calculée de l'import gardé, pièges des
  tueurs et des en-têtes, places de hunks ; avant l'oracle : ordre journal puis oracle, longueur des lignes du journal, points de code C1,
  jonctions). Conseil, jamais verdict ; chaque point vérifié sur pièce ; une consultation de remise est rendue dans `REPONSE.md`.

## Rebase sur `6c6cca3b` (réancreur, 2026-09-30 ; section close AVANT l'oracle du tour, règle Q-G2-4 du G2 de 5a)

- **Modèle résolu (R-1)** : `claude-opus-5-5`, effort max, instance et contexte frais (ni le G1 de 5b, ni le G2 de 5a). Mission
  `F:/tmp/dojo/mission-rebase-pr1b5b.md`, sha256 `53d783f5e130bdb16ce2393b0b1071fd336a4975ddaa69c39e8ed603555ca792`, recalculé AVANT lecture
  (14:26:20Z) = reçu vert `F:/tmp/dojo/mission-rebase-pr1b5b.recu.json` (12 codes à 0, head `6c6cca3b`). Preuves sous `F:/tmp/dojo/pr1b5b-rebase/`
  (noms relatifs ci-dessous) ; sha256 complets dans `F:/tmp/dojo/pr1b5b-rebase-deliver/REPONSE.md`.
- **État avant** (14:26Z à 14:36Z, lecture seule) : rebase de l'orchestrateur en cours, HEAD détaché `6c6cca3b` ; cinq chemins appliqués (le module,
  sa surface, le module CLI et sa surface, ce journal), deux non fusionnés (`apps/dojo/test/dojo-verify.test.ts`, `test/dojo-verify-url.test.ts`) ;
  les sept sha256 égaux à la liste de la mission ; quatre blocs de conflit (trois et un), douze lignes de marqueurs ; `killers-before.log`
  (`b4ecc9d8…8d7a`) : 20 lignes tueur, 15 périmées (les sept de 5a et les deux côtés des quatre conflits), 5 ancrées.
- **Module rebasé (tâche 1)** : commutation des diffs (`diff -U0`, en-têtes ôtés ; blobs `git show` sous `blobs/`) : base `47e58ee7` → tronc et
  gel 1 `5e72bc44` → rebasé portent le même changement de 5a, 23 lignes (`@@ -271,0 +272,23 @@`, `@@ -227,0 +228,23 @@`) ; base → gel 1 et
  tronc → rebasé le même changement de 5b (93 lignes) : ni perte ni doublon. Passe calendrier l.228-250 = tronc l.272-294 (sha256 `1b1bc98c…e330`
  des deux côtés) ; ses jetons une fois chacun (N1, N3, les deux refus, `const valid`) ; au cœur 0 `fetch(`, 0 `urlAllowed`, 0 `urlSource`,
  0 `runVerifyCli`, 0 `process.env` ; au module CLI 1 `fetch(` et 1 `process.env` ; exports : cœur 9, module CLI 3. Module et CLI non modifiés.
- **Réancrage (tâche 2)** : ligne réelle mesurée par identité de la ligne ENTIÈRE (texte de la ligne citée dans la version où le tueur est ancré =
  une seule ligne du module rebasé), jamais par décalage : `killers-map.mjs` → `killers-map-before.log` (`ba94066a…8d00`), 0 non résolu ; édition
  par `reanchor.mjs` (invariants assertés avant toute écriture : blocs à deux tueurs égaux hors numéro, les deux côtés vers la même ligne, relecture
  par `parseKiller`, `<before>` une fois, place au-dessus d'un `test(`), `reanchor-write.log` (`86176acd…d5a5`), 14:39:53Z.

| Tueur (ligne après) | Test | Avant | Après | Écart |
|---|---|---|---|---|
| `dojo-verify.test.ts:247` | `…_derived_from_voided_lines` | `dojo-verify.mjs:297` | `:253` | −44 |
| `dojo-verify.test.ts:402` | `…_takes_effect_the_day_after_its_window` | `:290` | `:246` | −44 |
| `dojo-verify.test.ts:411` | `…_follow_the_first_eligible_window` | `:291` | `:247` | −44 |
| `dojo-verify.test.ts:423` | `…_refuses_a_snapshot_after_a_missing_version` | `:284` | `:240` | −44 |
| `dojo-verify.test.ts:439` | `…_accepts_a_price_version_pending_at_the_head` | `:294` | `:250` | −44 |
| `dojo-verify.test.ts:447` | `…_refuses_a_segment_closed_with_a_price_version_due` | `:281` | `:237` | −44 |
| `dojo-verify.test.ts:463` | `dojo_verify_refuses_each_named_mutant` | `:358` | `:314` | −44 |
| `dojo-verify.test.ts:641` (conflit l.641-645) | `dojo_verify_day_proves_a_past_day` | HEAD `:379`, 5b `:312` | `:335` | −44, +23 |
| `dojo-verify.test.ts:656` (conflit l.660-664) | `dojo_verify_day_refusals_are_named` | HEAD `:375`, 5b `:308` | `:331` | −44, +23 |
| `dojo-verify.test.ts:678` (conflit l.686-690) | `dojo_verify_reports_broken_rotations` | HEAD `:390`, 5b `:323` | `:346` | −44, +23 |
| `dojo-verify-url.test.ts:47` (conflit l.47-51) | `dojo_verify_url_cli_is_the_ca_contract` | HEAD `:393`, 5b `:326` | `:349` | −44, +23 |

- **Contrôle statique** : `killers-check.mjs` (`3fbc80bb…b7d4` ; forme de `F:/tmp/dojo/g2-pr1b5a/killers-after-rebase.mjs`, plus les règles de
  `killerProblem`, `red-proof.mjs` l.51-59, et la place au-dessus d'un `test(`) → `killers-after.log` (`b0f4bac4…8a7d`) : 16 tueurs, 16 ancrés,
  0 invalide, 0 mal placé, 0 marqueur ; `grep -c` des marqueurs : 0 et 0 ; les cinq autres (`dojo-verify.mjs:56`, `:12`, `dojo-verify-cli.mjs:32`,
  `:37`, `:33`) ancrés, inchangés ; aucun tueur périmé de plus. Diff avant/après : 7 lignes renumérotées et 4 blocs de 5 lignes réduits à une
  (722 → 710 et 98 → 94 lignes) ; octets : 0 CR, 0 TAB, 0 octet de contrôle, LF final ; lignes touchées de 154 caractères au plus.
- **Composition des tests** : les mêmes commutations, numéros de tueurs masqués (`mask-killers.mjs`, `c782bbbf…1bb0`) : changement de 5a identique
  (83 et 3 lignes), de 5b identique (71 et 4) : les deux fichiers rebasés sont base + 5a + 5b, hunks du test 7 compris, hors numéros de tueurs.
- **Tests (tâche 3)**, clone `gel` (`--no-local` du worktree à `6c6cca3b`, sept fichiers copiés, sha256 égaux ; jonctions par `mk-nm.ps1`), verrou
  libre relu avant chaque course : lot 32 / 32 (`run-lot.log` `09168a1e…f324`, 14:45:36Z), dont `dojo_verify_core_imports_no_network_module` ;
  les neuf consommateurs du §3 du G2 de 5a 84 / 84 (`run-consumers.log` `f1bca192…38c2`, 14:46:02Z), dont les cinq rejeux par nom et les
  quatorze `dojo_publish_*`. Dixième importeur mesuré (`git grep`) : `test/dojo-history-e2e.test.ts`, vert dans les lignes de base des deux
  campagnes (`dojo_history_collect_to_verify_end_to_end`, `ok 88`) ; sa course isolée est l'écart É-R-1.
- **Portes statiques** (clone `gel`, 14:46:18Z à 14:47:06Z) : `typecheck` 0, `lint` 0, `lint:ratchet` 69 / 69, `lang:gate` OK, `export:check` OK.
- **F2P (tâche 4)** : `node F:/Monark/scripts/red-proof.mjs --base 6c6cca3b --gel F:/Monark-wt-dojo-pr1b5b --repo <clone base> --out f2p --draw 3`
  `--seed 2026` (clone `base` à `6c6cca3b`, UNE jonction vers `F:/Monark/node_modules` ; TEMP sous `tmp/`), 14:47:18Z à 14:48:02Z, sortie 0 ;
  `f2p/RED-PROOF.json` `ea083480…cffc` : 6 jugés, 6 F2P (rouges à la base par `ERR_ASSERTION`), 26 inchangés, `killerProblem` nul partout ;
  tirés : `dojo-verify-cli.mjs:37`, `dojo-verify.mjs:56`, `:12`, 3 tués, fichiers restaurés ; aucun tueur invalide (l'`anchor-lost` de l'outil).
- **Mutants (tâche 5)**, outil du tronc (`2606e7da…3b19`), `--repo` le clone `gel`, jonction `node_modules` dans chaque `--out`, verrou libre au
  lancement : campagne 1, `--killers --file apps/dojo/scripts/dojo-verify.mjs` (commande de la mission) : `mutants/RESULTS.json` `1af6da7a…8cfa`,
  base 11 fichiers et 102 verts, 16 tueurs sur 16 tués, tous stricts, 0 `anchor-lost` ; campagne 2, table du G1 (`--table` l'enveloppe
  `mutants-table-rebase.mjs` `9a89a5c6…cef2`, `--file apps/dojo/scripts/dojo-verify-cli.mjs`) : `mutants-g1table/RESULTS.json` `b9084cda…914b`,
  41 sur 42 tués, stricts, 0 `anchor-lost`, V-4 survit (prédit ; PAROXYSME-DOJO-V4-1) ; V-2 et V-3, survivants du G1, tués par les épingles D-3
  de 5a (rejeu promis par PLI-3 tenu) ; M-X2 à M-X5 réancrés (+23) et tués.
- **R-25** : `r25()` de `F:/Monark/scripts/oracle/r25.mjs` sur un clone jetable à commit de gel local (`r25.log` `f81a9776…0bea`) : 182 insertions,
  117 suppressions, **299** (porte CI 1 205, borne 1 150, solde 851) ; +14 sur le ≈ 285 du G1 : les sept tueurs de 5a réancrés (+7 −7).
- **Oracle (tâche 6)** : lancé APRÈS la clôture de cette section (arbre gelé = arbre de l'enregistrement) ; enregistrement, sha256, portes et
  suite dans `F:/tmp/dojo/pr1b5b-rebase-deliver/REPONSE.md`.
- **Écarts (`error_origin` : ce réancreur)** : **É-R-1** : ma garde de verrou testait le code de sortie de `cut` (pipeline sans `pipefail`) : une
  course d'un seul fichier (`test/dojo-history-e2e.test.ts`, 1 test, 14:52:01Z à 14:52:18Z) a tourné alors que `held()` lisait le verrou TENU par
  un oracle G7 (`3911be76…`, pid 260496, pris à 14:51:40Z) ; les six lancements d'avant lisaient `free: true` ; garde corrigée (code de sortie de
  `precheck.mjs` lui-même) ; ce résultat n'est pas cité comme preuve (les lignes de base le couvrent). **É-R-2** : `reanchor.mjs` v1
  (`642d28dc…1410`, l'exécution de 14:39:53Z) portait deux lignes de plus de 160 caractères ; réécrit (v2 `74c178b4…352f`) et rejoué depuis
  l'arbre « avant » reconstitué (`before-tree/`) vers `replay/` : deux fichiers identiques octet pour octet à ceux du worktree ; `killers-map.mjs`,
  `precheck.mjs`, `gen-table-rebase.mjs` reformatés de même (sorties identiques, `cmp`). **É-R-3** : la table du G1 est rejouée par une
  enveloppe (sha256 de la table du G1 vérifié à l'import, quatre `line` changés), non par une copie, qui aurait porté ses 62 barres obliques inverses.
- **Questions** (détail et recommandations dans `REPONSE.md`) : Q-C-1 contrôle de l'oracle G7 `3911be76…` chevauché (É-R-1) ; Q-C-2 commentaire
  l.114 du test 7 (Q-G1-4, ouverte : « the three local modules », deux désormais) laissé tel quel ; Q-C-3 admission de la table réancrée (É-R-3) ;
  Q-C-4 dixième importeur hors de la liste du G2 de 5a ; Q-C-5 R-25 299 et non ≈ 285.
- **Conduite** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; dans le worktree, git en lecture seule (`status`, `diff`, `show`,
  `log`, `ls-files`, `rev-parse`, `merge-base`, `config --get`, sous `--no-optional-locks`) ; git écrivant seulement dans mes clones `gel`, `base`,
  `r25clone` (clone, extraction détachée ; commit de gel local dans `r25clone` seul) et dans ceux des outils ; écritures dans le worktree : les
  deux fichiers de test (par `reanchor.mjs`) et cette section ; aucun réseau réel ; rien sur C: ; aucun commit, aucun workflow (R-20).

## Corrections post-G2 (correcteur, 2026-09-30 ; section close AVANT l'oracle du tour)

- **Modèle résolu (R-1)** : `claude-opus-5-5`, effort max, instance et contexte frais (ni G1, ni réancreur, ni relecteur G2). Mission
  `F:/tmp/dojo/mission-corr-pr1b5b.md`, sha256 `90acb4880b55861c2b4f78f763d52914114e181dc54993714464b4d338e6667d`, recalculé AVANT lecture
  (16:14:54Z) = reçu vert `F:/tmp/dojo/mission-corr-pr1b5b.recu.json` (12 codes à 0, head `e1e59c1f`). Rapport G2 `F:/tmp/dojo/g2-pr1b5b/G2-report.md`
  sha256 `e78abb7e…d369` = mission. Sept chemins du lot au gel 2 : sha256 égaux à la mission ; `status --porcelain` 0 ligne à l'ouverture.
  Preuves sous `F:/tmp/dojo/pr1b5b-corr/` (noms relatifs ci-dessous) ; sha256 complets dans `F:/tmp/dojo/pr1b5b-corr-deliver/REPONSE.md`.
- **Mesures AVANT code** (Node v24.15.0 ; précontrôle `sondes/precheck.mjs`, testé 7 / 7 sur racines synthétiques, `sondes/precheck-test.log`) :
  `sondes/guard-probe.log` : la forme décidée `realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])`, sous `try`,
  vaut vrai pour l'entrée lancée directement, par jonction, par jonction sous `--preserve-symlinks-main`, lettre de lecteur minuscule, chemin
  relatif ; faux pour un module importé (import direct, par jonction, sous `--preserve-symlinks-main`) et sous `node -e` (`argv[1]` absent ou
  illisible), sans exception. Retirer le `realpathSync` côté `argv[1]` (la sémantique de l'ancien idiome) : faux par jonction simple ; retirer
  celui côté module : faux SEULEMENT sous `--preserve-symlinks-main`. `realpathSync(undefined)` : ENOENT (le nom `undefined` résolu dans le
  répertoire courant ; une entrée de ce nom rendrait un autre chemin, donc faux aussi) : le `try` couvre les deux cas, sans test `typeof`.
  `sondes/rm-junction-probe.log` : `rmSync(dossier, { recursive, force })` délie une jonction du dossier sans traverser sa cible (canaris relus) ;
  une jonction vers une cible encore absente se crée (utile au `node_modules` des mutants).

### Compte prévu (AVANT code ; insertions + suppressions du tour, indicatif)

| Correction | Fichier : lignes | Prévu |
|---|---|---|
| C-G2-1 garde du cœur | `dojo-verify.mjs` l.10 (`realpathSync`), l.12 (`fileURLToPath` remplace `pathToFileURL`), fin : commentaire, aide, l.366 | +4 −3 |
| C-G2-1 entrée de la CLI | `dojo-verify-cli.mjs` l.6, l.7, fin : un commentaire, une aide `isEntry`, l.93 | +5 −3 |
| Q-G2-3 en-tête du cœur | `dojo-verify.mjs` l.6-7 : renvoi par nom (« D-10, the reader's verifier »), deux lignes gardées | +2 −2 |
| C-G2-1 test neuf du lien | `dojo-verify.test.ts` fin : jonction vers `apps/`, deux jeux de drapeaux, imports sous `-e` ; l.7 | ≈ +24 −1 |
| C-G2-1 sortie non vide | `test/dojo-verify-url.test.ts` l.31 (`success`) | +1 −1 |
| C-G2-2 mot `fetch` | `dojo-verify.test.ts` l.695 (liste `FORBIDDEN`) | +1 −1 |
| Ancre du tueur l.692 | `dojo-verify.test.ts` l.692 : `pathToFileURL` devient `fileURLToPath` (sinon `anchor-lost`) | +1 −1 |
| Q-G2-2 branche `fatal` | `dojo-verify.test.ts` fin : test neuf par injection de faute (module préchargé), si environ 10 lignes suffisent | ≈ +8 |

- Total prévu ≈ +46 −12 ≈ 58 ; R-25 du lot ≈ 301 + 58 ≈ 359 (borne 1 150). Aucune ligne d'ancre de tueur ne bouge : l.6-7, l.10 et l.12 restent
  une ligne chacune ; les gardes ne grossissent qu'en fin de fichier (tueurs du cœur l.12 à l.346, de la CLI l.32 à l.37).

### Correction → ligne → test → mutant (mesuré)

| Correction | Ligne(s) après correction | Test | Mutants tués |
|---|---|---|---|
| C-G2-1 cœur | `dojo-verify.mjs` l.10, l.12, l.366-368 (`isEntry`) | le test neuf du lien, test 7 | C-E2, C-A2, C-M2, C-T2, C-C2 |
| C-G2-1 CLI | `dojo-verify-cli.mjs` l.6, l.7, l.93-95 (`isEntry`) | le test neuf (tueur l.94), test 7, test 8 | K16, C-E1, C-M1, C-T1, C-C1 |
| C-G2-1 (3) sortie non vide | `test/dojo-verify-url.test.ts:31`, hors corps de test (ne juge rien seule) | test 8 | C-E1-T8 (strict) |
| C-G2-2 mot `fetch` | `dojo-verify.test.ts:695-696` (liste `FORBIDDEN` réécrite sur ses deux lignes) | `dojo_verify_core_imports_no_network_module` | C-E7 |
| Ancre du tueur | `dojo-verify.test.ts:692` (`fileURLToPath`) | idem | K15 |
| Q-G2-3 en-tête | `dojo-verify.mjs` l.6-7 : « the closed list of D-10 (the reader's verifier) », « (D-10, its report) » | sans objet | sans objet |
| Q-G2-2 branche `fatal` | test neuf `dojo_verify_cli_fatal_error_exits_1`, par INJECTION DE FAUTE (module préchargé) | lui-même | K17, C-E9 |

- **Compte mesuré** (`sondes/r25.log`) : tour (gel 2 → corrigé, code et tests) +53 −13 = 66 (prévu ≈ 58 : têtes de commentaire des deux tests
  neufs, boucle des drapeaux) ; R-25 du lot par `r25()` sur `r25clone` (commit de gel LOCAL, clone jetable) : 228 + 123 = **351**, porte CI 1 205
  verte, borne 1 150, solde 799. Aucune ligne d'ancre de tueur n'a bougé (cœur l.12 à l.349, CLI l.32 à l.37, `sondes/killers-check.log`).
- **Tests**, clone `gel` (gel 2 + quatre fichiers copiés, sha256 égaux ; `node_modules` par `mk-nm.ps1`, 220 entrées, 10 `@monark` ; précontrôle
  vert avant chaque course) : lot **34 / 34** (16:37:43Z, `sondes/tests-lot.tap`), dont les deux neufs ; consommateurs **70 / 70** sur neuf fichiers
  (16:38:10Z, liste du G2 remesurée par `git grep`) ; portes statiques lancées par `node` sans `npm` (16:38:37Z à 16:39:52Z) : `typecheck` 0,
  `lint` 0, `lint:ratchet` 69 / 69, `lang:gate` OK, `export:check` OK.
- **Commutation** (clone `gel2code` : CODE du gel 2, tests corrigés) : seul le test du lien rougit, par `ERR_ASSERTION`, « the old command
  through a link », réel `[0, "", ""]` (`sondes/commutation-gel2code.tap`) : le défaut C-G2-1 lui-même ; le test `fatal` y est vert (branche héritée).
- **F2P** (commande de la mission, 16:41:02Z à 16:41:52Z, sortie 0) : `f2p/RED-PROOF.json` `6b0ee79e…9050` : 8 jugés, **8 F2P** (rouges à la
  base par `assert-fail`, verts au gel), 26 inchangés, `killerProblem` nul ; tirage (graine 2026, population 8) : CLI l.33, cœur l.56, CLI l.94
  (tueur du test du lien) : 3 tués, fichiers restaurés. Contrôle préalable des 18 tueurs : 0 invalide ; non-vacuité : l'ancien tueur l.692 rejeté.
- **Mutants** (outil du tronc `2606e7da…`, `--repo` le clone `gel`, `--targets` les deux fichiers du lot, `--lock-root F:/tmp`, `--min-free-mb 4096` ;
  `<out>/node_modules` par `sondes/mk-out-nm.mjs`, `@monark/*` vers `<out>/clone`, principe de `cp2-drand1a/scripts/mk-nm-out.ps1`) :
  A, tueurs : `mutants/killers/RESULTS.json` `9a400125…` : **18 / 18 tués, tous stricts**, base 104 verts.
  B, table `mutants-table-corr.mjs` (`a8ec603e…`, prédictions écrites avant la course) : `mutants/corr/RESULTS.json` `e8d06009…` : **11 / 11 tués
  comme prédit**, 9 stricts ; C-E1 (quatre échecs, tous `ERR_ASSERTION`) et C-E2 (trois échecs nommés `ERR_ASSERTION`, dix entrées de FICHIER
  `ERR_TEST_FAILURE` : `exitCode` 1 posé par la garde mutée à l'import de chaque processus de test) : « strict » de l'outil = une seule ligne `code:`.
  C, table `mutants-table-corr2.mjs` (`489b8580…`) : C-E1 contre chaque test SEUL : `mutants/corr-targeted/RESULTS.json` `c9b6a2a9…` : **4 / 4
  stricts** ; C-E1-T8 : le test 8 seul échoue sur `[0, -1, false]` contre `[0, -1, true]` (au gel 2, G2-E1 l'atteignait par `SyntaxError`).
- **Questions** (détail et recommandations dans `REPONSE.md`) : Q-C-1 `--key PR-1b-5b` passé à l'oracle (REGLES, décision 282) alors que l'étape 6
  de la mission l'omet ; Q-C-2 lancement sous `--preserve-symlinks-main` et lien vers `apps/` : extension de la lettre de la décision (le seul
  lancement qui voit le `realpathSync` côté module), rayable ; Q-C-3 branche `fatal` atteinte par injection de faute, jamais par une entrée servie ;
  Q-C-4 renvois numérotés « D-10 l.25x » périmés hors l.6-7 (cœur l.1, 40, 164, 280, 336, 353 ; CLI l.59 ; `dojo-verify.d.mts` l.5), laissés ;
  Q-C-5 « morts strictes » contre la définition de l'outil (C-E2 non strict par construction).
- **Écarts** (`error_origin` : ce correcteur) : **É-C-1** `sondes/mk-out-nm.mjs` écrit avec deux barres inverses (heredoc), vu par la garde
  d'octets AVANT toute exécution, réécrit (`sep`) ; **É-C-2** C-T1 et C-T2 d'abord écrits en erreur de syntaxe (mutants mort-nés), vus avant la
  course, remplacés (`catch` devenu `finally`), onze lignes mutées vérifiées par `node --check` ; **É-C-3** trois lignes de ce journal (174, 165, 177)
  caractères) à leur première écriture, raccourcies aussitôt ; **É-C-4** une recherche `grep -r` trop large (lecture seule) sur `F:/tmp/dojo`, passée
  en arrière-plan après 120 s, sans écriture ; sa sortie n'a servi qu'à trouver le précédent `mk-nm-out.ps1`.
- **Conduite** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `git merge-tree --write-tree` ; worktree : lectures git (`rev-parse`, `branch`,
  `status`, `diff`, `log`, `worktree list`) et cinq fichiers édités par l'outil d'édition ; git écrivant seulement dans mes clones `gel`, `gel2code`,
  `base`, `r25clone` (clone, extraction détachée ; `add` et commit de gel local dans `r25clone` seul) et dans ceux des outils ; aucun réseau réel
  (boucle locale) ; rien sur C: (TEMP `F:/tmp` puis `F:/tmp/dojo/pr1b5b-corr/tmp`) ; précontrôle testé avant chaque course, verrou libre à chacune ;
  jonctions `node_modules` retirées à 16:51:43Z (`rm-nm.ps1`, `[System.IO.Directory]::Delete`), `F:/Monark/node_modules` intact (220, 10) ; deux
  jonctions de sonde retirées de même. Advisor intégré consulté après l'orientation (avis suivi, vérifié sur pièce) ; seconde consultation avant la remise.
- **Clôture de la section** : ce journal n'est plus modifié avant l'oracle du tour ; l'arbre de l'enregistrement est celui du gel 3 à venir.
