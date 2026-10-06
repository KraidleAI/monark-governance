claude-opus-5-5

# G1 — lot T42-BOUND : borne propre de `npm run ci` dans le test 42 (EXPORT-CI-TIMEOUT-BOUND-1)

Journal de génération tracée. Écrit le 2026-10-01 (heures `date -u`) par un worker `claude-opus-5-5`, effort max, instance fraîche, pour
l'orchestrateur. Rien commis, aucun workflow (R-20). Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ni `git write-tree`.
Git écrivant : seulement le clone `F:/tmp/dojo/t42b/clone` (clone, checkout, apply, add, commits de gel : section 5) ; le worktree et `F:/Monark` en
lecture seule (`--no-optional-locks`).

## 1. Identité et entrées

- **Mission** : `F:/tmp/dojo/mission-t42-bound.md`, sha256 recalculé AVANT lecture (11:42:03Z) =
  `2f4979f9a884bc7aee040df77f4b756d3298cfab687c8ed864fbe755c5a76ed5`, égal à l'attendu ; 55 lignes lues en entier.
- **Worktree** : `F:/Monark-wt-t42`, branche `lot/t42-bound`, HEAD `feb7815675dd7b3e8790ba0c6e378b69f5d74bbd` (= tronc), propre à 11:42Z.
- **Outils** : empreintes de l'en-tête recalculées, toutes égales : `scripts/mission/lint.mjs` `4d1383c8…`, `launch.mjs` `fb6c277f…`,
  `scripts/oracle/run.mjs` `f22b9045…`, `scripts/oracle/r25.mjs` `4d0544df…`, `scripts/red-proof.mjs` `6579b550…`,
  `docs/methode/REGLES-MISSION.md` `64700025…` ; `run.mjs`, `r25.mjs` et `red-proof.mjs` de `F:/Monark` ont les mêmes.
- **Entrées lues en entier, dans l'ordre** :
  1. rapport de mesure `F:/tmp/dojo/insp1/t42/RAPPORT.md`, sha256 `a1330724d64c619139628b7bc83ef31b5117a7844ff63681bd0755457cb6069a`,
     485 lignes (décision §8.2-8.3, risques §8.4) ;
  2. `test/export-public.test.ts` de base, sha256 `a531cc6f15dbaeba460e631a47772192233cc43222ba27806f0d9b6161157850`, 454 lignes ;
     `runNpm` l.347-356, `timeout: 600_000` l.354, appels l.358 (`npm ci`) et l.364 (`npm run ci`) ;
  3. `scripts/oracle/run.mjs`, 173 lignes ;
  4. `package.json` sha256 `d7a429e1afb7618b5b037f3923b01fb35fca5f76cdc6b5a49bfb20495b059700` : `test` l.16
     (`node --test --test-timeout=120000 --test-force-exit`, six motifs), `ci` l.20 (`gate:vocab`, `typecheck`, `test`).
- **Lu en plus, pour les bornes englobantes** : `scripts/oracle/lock.mjs` `501a76b5…` (47 lignes) ; `.github/workflows/ci.yml`
  `0f401ae2…` (206 lignes) ; `test/ci-gates.test.ts` `26235ed3…` l.1648-1679 ; `scripts/mutants/run.mjs` `41cdf83f…` l.193 ;
  `scripts/red-proof.mjs` l.153-154 et l.165 ; `docs/ETAT.md` `0eccf99b…` l.173-175 ; sonde
  `F:/tmp/dojo/insp1/t42/probe/probe-sync.out.txt` `5f0fac43…`.
- **Dossiers** : `F:/tmp/dojo/t42b/` (avec `tmp/`) et `F:/tmp/dojo/t42b-deliver/` existaient, vides, créés à 11:41:38Z, avant la
  génération de la mission (11:41:57Z).

## 2. Plan (tâche 1)

1. `runNpm(cmd, timeoutMs)` : la borne passe en paramètre ; `npm ci` garde `600_000`, `npm run ci` reçoit `1_800_000` ; un commentaire
   cite l'item et la mesure (sha256 complet) ; rien d'autre ne change (message d'échec, `maxBuffer`, `shell`, environnement).
2. Clone `git clone -q --no-local --no-checkout -c core.autocrlf=false` du worktree sous `F:/tmp/dojo/t42b/clone`, `checkout --detach`
   de la base, diff du worktree appliqué (lecture seule côté worktree), commit de gel dans le clone seul ; même sha256 du fichier.
3. R-25 par `r25()` de `F:/Monark/scripts/oracle/r25.mjs` sur le clone gelé, base `feb78156`.
4. Jonctions par `mk-nm.ps1` ; `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `gate:vocab` dans le clone.
5. Test 42 : `node --test test/export-public.test.ts` une seule fois dans le clone (verrou et C-V-4 avant, relevé du verrou toutes les
   15 s pendant), sans les variables de `DENY` ni `NODE_TEST_*`, TEMP `F:/tmp/dojo/t42b/tmp`, npm hors ligne ; durée murale et `duration_ms`.
6. `rm-nm.ps1`, livrables.

Écart de séquence : le plan a été formé puis soumis à l'advisor intégré (vers 11:48Z) avant l'édition du test, mais écrit dans ce journal
après elle (11:5xZ) ; contenu inchangé.

## 3. Changement (tâche 2)

- `test/export-public.test.ts` : sha256 `a531cc6f…` (454 lignes) devient `d2240760f67a5c330fac34a261ca7bf10ce79d04d6ebf0801f840c00a3064528`
  (458 lignes) ; 8 insertions, 4 suppressions, un seul hunk (l.344-371 après).
- Signature `runNpm(cmd: string, timeoutMs: number)`, `timeout: timeoutMs` (l.358) ; appels `runNpm("npm ci", 600_000)` (l.362) et
  `runNpm("npm run ci", 1_800_000)` (l.368) ; quatre lignes de commentaire (l.347-350) : item, décision (a) du 2026-10-01 (ligne de
  `docs/ETAT.md` l.173, commit `feb78156` du 2026-10-01T11:39:43Z), marge 1,8x sur la pire demande estimée, sha256 complet du rapport et
  son emplacement du jour, chiffres repris du rapport (§0, §8.1 : 175-200 s au calme, `ETIMEDOUT` à 600 s une fois sous l'oracle, pire
  demande estimée 750-1 000 s, `npm ci` 18-23 s).
- **Review Focus 1, borne de `npm ci`** : je refuse de la changer ; vérifié par `grep -n` (l.362 : `600_000`) et par le diff (`600_000` passe de
  l'option `timeout` à l'appel `npm ci` ; `1_800_000` ne figure qu'à l'appel `npm run ci`).
- Octets : 0 CR, 0 TAB dans le fichier (LF, `* text=auto eol=lf`) ; lignes ajoutées de 27 à 138 points de code, sans barre oblique inverse
  ni octet de contrôle ; aucun autre test n'épingle ce `600_000` (`grep -rn` sur `test`, `scripts`, `apps/*/test`, `packages/*/test`).

## 4. Bornes englobantes (tâche 1, Review Focus 2)

- **Somme nouvelle bornée** : 600 s (`npm ci`) + 1 800 s (`npm run ci`) = 2 400 s ; avant : 1 200 s. S'y ajoutent des étapes sans borne
  propre, mesurées de 0,5 à 1,9 s chacune (copie, export, deux `lang-gate` : rapport T2), et le nettoyage `rmSync`, sans borne (environ 9 s ici, section 5).
- **Le test** : `test()` du test 42 sans option `timeout` (l.142). `npm test` passe `--test-timeout=120000` (`package.json` l.16), mais
  un corps synchrone y échappe : la sonde lue montre, sous `--test-timeout=1000`, un corps synchrone de 3 s vert (2 999,99 ms) et une
  attente asynchrone de 3 s annulée (1 009,7 ms) ; rejouée en section 5. Le corps du test 42 est synchrone (`execFileSync`, `spawnSync`,
  `cpSync`, `rmSync`). La commande de la mission ne passe aucun `--test-timeout`. Aucune borne du test ne coupe avant 2 400 s.
- **L'oracle** : chaque porte est un `spawnSync` sans option `timeout` (`run.mjs` l.141) : aucune borne de durée par porte. Seule borne
  temporelle : `ORACLE_LOCK_MAX_MS` = 5 400 000 ms (l.15, l.149 ; `lock.mjs` l.20, l.41), qui borne l'ATTENTE des autres oracles, jamais
  la porte du détenteur : elle ne coupe pas le test 42. Effet indirect, chiffré : la seule porte sous verrou est `npm test` (les autres
  lignes `run:` de `ci.yml` sont statiques ou `CI_ONLY`, `run.mjs` l.25-32) ; au pire cas nouveau (environ 2 415 s par détenteur),
  l'attente de 90 min couvre deux détenteurs devant soi (4 830 s), pas trois ; avec l'ancien pire cas (environ 1 215 s), quatre (4 860 s).
- **Hors de la question posée (test, oracle), signalé** : le job `g3-verification` de `.github/workflows/ci.yml` (l.126-142) porte
  `timeout-minutes: 10` (l.128) et exécute `npm test`, donc le test 42 : 600 s, plus court que la somme nouvelle (2 400 s), et déjà
  plus court que l'ancienne (1 200 s). **Valeur proposée, non écrite : `timeout-minutes: 45`** (2 400 s + environ 5 s d'étapes du test
  + environ 31 s d'étapes du job hors tests, selon le commentaire de `ci.yml` l.31-32 du 2026-09-19, non remesuré ici : environ 40,6 min,
  arrondi au multiple de 5 supérieur). Elle exige d'amender le plafond `minutes <= 20` de `ci_jobs_have_timeout_and_test_flags_locked`
  (`test/ci-gates.test.ts` l.1673, checkpoint-2 V-1(b)) et le commentaire de `ci.yml` l.30-33 : un acte d'ADR. Latent aujourd'hui : le
  workflow ne se déclenche que sur `pull_request`, et les fusions locales `--no-ff` n'ouvrent aucune PR (`ci.yml` l.12-13, l.187-188).
- **Règle d'exploitation** : le terme « suite » de « `timeout` ≥ `ORACLE_LOCK_MAX_MS` + suite » (REGLES-MISSION) grandit de 1 200 s au
  pire pour qui lance un oracle.
- **Preuve rouge et mutants** : `red-proof.mjs` refuse le test 42 par construction (l.165, « runs under the host lock only ») et
  `mutants/run.mjs` le saute (l.193) ; une borne de délai n'est pas observable par un test au calme (mutant équivalent tant que le CI
  imbriqué tient sous 600 s) : la garde de ce changement est la relecture du diff et le `grep` de la tâche 2.

## 5. Vérification (tâche 3)

- **Clone** `F:/tmp/dojo/t42b/clone` : `git clone -q --no-local --no-checkout -c core.autocrlf=false F:/Monark-wt-t42`, `checkout -q
  --detach feb78156`, diff du worktree `F:/tmp/dojo/t42b/dirty.patch` (sha256 `b924aaaa…`) appliqué, commit de gel n°1 `459ba7c2…`
  (arbre `51430966…`) ; `test/export-public.test.ts` du clone = sha256 `d2240760…`, identique au worktree.
- **R-25** (`r25()` importé de `F:/Monark/scripts/oracle/r25.mjs`, base `feb78156`, sortie `F:/tmp/dojo/t42b/r25.txt` sha256
  `c4f4c78d…`) : STAT 8 insertions, 4 suppressions, 12 lignes (borne CI `VIBEGATES_PR_LIMIT` 1 205 ; borne de mission 1 150) ;
  CONTENT_STAT 0 (borne 8 000) ; GREEN. Ce journal est hors compte (`ci.yml` l.82, `:(exclude)docs/G1-lot-*.md`).
- **Portes** (dans le clone, jonctions `mk-nm.ps1` : 220 entrées, 11 `@monark`, 0 échec ; `F:/tmp/dojo/t42b/gates.sh` `a4010b79…`) :
  `typecheck` 0 (8 s), `lint` 0 (19 s), `lint:ratchet` 0 (20 s, 69/69), `lang:gate` 0 (2 s, 0 occurrence), `gate:vocab` 0 (1 s,
  328 fichiers) ; de 11:55:52Z à 11:56:41Z ; journaux `F:/tmp/dojo/t42b/gates/*.log`, résumé `summary-1.txt` `5e8985a6…` (transcrit
  de la sortie : le `tee` vers ce fichier a échoué, dossier créé après l'ouverture du tube).
- **Test 42, une seule course** : `node --test test/export-public.test.ts` dans le clone (`F:/tmp/dojo/t42b/t42.sh` `29dc4c3f…`),
  de 11:57:31Z à 12:02:02Z. Vert : 3 tests, 3 réussis, 0 échec. Test 42 : 260 726 ms ; `duration_ms` du fichier : 260 867 ms ;
  lanceur : 271,0 s (borne haute : la fin n'est vue qu'au relevé suivant, toutes les 15 s). Journal `run-t42/t42.log` `cdf25958…`,
  heures `run-t42/times.txt` `0fc28c69…`.
- **Ventilation** (nom horodaté et date de modification des journaux npm de l'export, à la seconde près) : `npm ci` 23,4 s
  (11:57:36.686Z à 11:58:00.075Z, borne 600 s) ; `npm run ci` 223,3 s (11:58:00.738Z à 12:01:44.005Z) : 12,4 % de la borne nouvelle
  de 1 800 s, 37 % de l'ancienne ; par différence, environ 4 s avant `npm ci` (copie, export, `lang-gate`) et 9 s après `npm run ci`
  (nettoyage `rmSync` de l'export et de la copie).
- **Conditions** : avant (11:57:26Z), verrou `F:/tmp/oracle-lock` absent, file `oracle-lock.queue` vide, C-V-4 vert (15 270 Mo physiques
  et 29 005 Mo virtuels libres, 12 `node.exe`), 341 Go libres ; pendant, 18 relevés de 11:57:31Z à 12:01:47Z, tous « lock absent »
  (`run-t42/lock-poll.txt` `89ed459f…`) ; après (12:03Z), verrou absent, 15 832 Mo, 15 `node.exe`. Charge étrangère non mesurée
  (critère du rapport non repris) : la durée vaut pour cet hôte à cette heure, sans plus. Environnement des enfants : les 14 variables
  dont le NOM répond à `DENY` (`run.mjs` l.39) retirées, valeurs jamais lues ; aucune `NODE_TEST_*` ; TEMP, TMP, TMPDIR
  `F:/tmp/dojo/t42b/tmp` ; `npm_config_offline=true` ; cache npm `F:/cache/npm` ; journaux npm `F:/tmp/dojo/t42b/npm-logs`.
- **Sonde P2 rejouée** (12:03:11Z, copie `F:/tmp/dojo/t42b/probe/probe-sync.test.ts`, sha256 `9ab6eab8…` égal à l'original) :
  `node --test --test-timeout=1000` : corps synchrone de 3 s vert (3 000,36 ms), attente asynchrone de 3 s annulée (1 010,31 ms), sortie 1
  attendue ; sortie `F:/tmp/dojo/t42b/probe/probe-sync.out.txt` `e5bb7b68…`. Ni le test ni le fichier ne sont coupés à 1 s.
- **Jonctions retirées** par `rm-nm.ps1` (12:04Z, « removed ») ; `F:/Monark/node_modules` intact (218 entrées visibles, 11 `@monark`).
- **Gel final** (ce journal compris, commit suivant dans le clone) : `node --test test/byte-guard.test.ts` et R-25 rejoués ; empreinte
  du gel, résultats et sha256 de ce journal dans `F:/tmp/dojo/t42b-deliver/REPONSE.md` et `DELIVERED.sha256`.

## 6. Fin du journal

- **Verdict proposé** : LIVRE. Le changement est celui décidé, sans autre effet ; le test 42 est vert une fois (260,7 s) ; les cinq portes
  sont à 0 ; R-25 vert à 12 lignes. Aucune borne englobante du test ni de l'oracle ne coupe avant 2 400 s ; la borne du job distant
  `g3-verification` (600 s) est signalée avec sa valeur proposée (section 4, Q-1), sans écriture.
- **Livrables** : dans le worktree, `test/export-public.test.ts` (modifié) et ce journal (neuf) ; hors dépôt,
  `F:/tmp/dojo/t42b-deliver/REPONSE.md` et `DELIVERED.sha256` (empreintes de tous les livrables et preuves).
- **Résidus laissés en preuve** (aucun `rm` de ma part ; purge = acte de l'orchestrateur) : `F:/tmp/dojo/t42b/` (clone gelé, scripts,
  journaux, sonde) ; dans `F:/tmp/dojo/t42b/tmp`, des fichiers écrits par les tests du CI imbriqué (`u2c-snap-*.json`, un
  `ukemi-weth-*.diag.json`, `atelier-vocab-*`, `node-compile-cache`) ; la copie et l'export du test 42 ont été nettoyés par le test.
- **Q-1** : `g3-verification` `timeout-minutes: 10` (`ci.yml` l.128) reste sous la somme nouvelle (et l'était sous l'ancienne) ;
  valeur proposée 45, au prix d'un amendement du plafond de 20 min (`test/ci-gates.test.ts` l.1673) par ADR ; décision de l'orchestrateur.
- **Q-2** : au pire cas nouveau, l'attente de 90 min du verrou couvre deux oracles devant soi au lieu de quatre ; à porter, si l'orchestrateur
  le juge utile, dans la règle « `timeout` ≥ `ORACLE_LOCK_MAX_MS` + suite » (le terme « suite » grandit de 1 200 s au pire).
- **Q-3** : la course du test 42 hors oracle suit la tâche 3 de la mission ; REGLES-MISSION dit « test 42 une seule fois, dans la suite » :
  ma lecture est « une seule fois dans cette mission » ; l'oracle du lot le rejouera.
- **Q-4** : « libellés en ANGLAIS » lu comme : le code et ses commentaires en anglais ; ce journal en français, comme les `docs/G1-*`
  (`docs/` est hors du balayage de `lang:gate`, `SKIP_DIRS` l.113 de `scripts/lang-gate.mjs`).
- **Items existants, non traités ici** (`docs/ETAT.md` l.175) : UKEMI-CONC-FSYNC-1 (la cause), TEST42-ORPHAN-KILL-1 (orphelins au
  délai), HOST-FOREIGN-LOAD-CV4-1 ; le rapport (§8.4) note que (a) soigne le symptôme.
