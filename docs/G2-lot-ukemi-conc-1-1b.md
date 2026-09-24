# Re-G2-delta — pli 1b du lot UKEMI-CONC-1 (relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2-ukemiconc-1b/G2-1b.md` (sha256 f69b589b569b4d0f994feaed241da3c55544657934a53bf034e5f360684aa18c). Verdict : PASS (liste fermée vide ; O-R1..O-R7 ; R-25 692 forme CI `6aca053...2f1e728`).

---

Modèle résolu : claude-opus-5-5[1m]

# re-G2-DELTA — PLI 1b du lot UKEMI-CONC-1 (`lot/ukemi-conc-1` @ `2f1e728`, parent `ce7bccf` = back-merge de `6aca053` dans `dec704d`)

- Relecteur : `claude-opus-5-5[1m]`, effort max, instance séparée du worker du pli, du G2 et du cp-2 ; contexte frais. Aucun commit dans
  `F:\Monark` ni `F:\Monark-wt-*`, aucun workflow (R-20). `git` en LECTURE seule dans `F:\Monark` (rev-parse, log, merge-base, diff).
- Arbres de travail = clones jetables sous `F:\tmp\g2-ukemiconc-1b\` : `clone` (`git clone --no-hardlinks -b lot/ukemi-conc-1`, HEAD
  `2f1e728`, oracle), `bm` (refonte du back-merge, puis fusion à blanc dans la pointe `lot/etude-suite`), `mut` (mutants).
  TEMP/TMP/TMPDIR = `F:\tmp\g2-ukemiconc-1b\tmp` ; cache npm `F:/tmp/npm-cache`. Ceinture A-7 (`env -u` des 8 clés) sur toute commande
  node/npm ; harnais : retrait insensible à la casse. Aucune variable d'environnement affichée. Processus de course (pid 22236 `record.ts`,
  pid 102592 Bell) jamais touchés (aucun `kill`/`taskkill`). Fichiers écrits par Write/Edit (A-13).
- Toute preuve est rejouée par moi ; aucun chiffre repris du rendu du pli sans re-mesure (les chiffres du worker sont cités comme tels).

## Journal (UTC, `date -u`)
- 08:28:52Z orientation : `docs/G2-lot-ukemi-conc-1.md`, `docs/CHECKPOINT2-lot-ukemi-conc-1.md`, `docs/PLI-lot-ukemi-conc-1-1b.md` (clone),
  `F:\tmp\g2-ukemiconc\g2-mutants.mjs` (sha256 `44ae8e379c9d49eb…` = celui cité par le G2), `F:\tmp\ukemiconc-pli\mutants-pli1b-final.mjs`
  (sha256 `04d65f96d21a6c82…` = celui cité par le rendu), `pli-1b.patch` (`8626e3a3a57578fc…`), `F:\tmp\cp2-ukemiconc\rejeu\hb.mjs`
  (`debfb95f530a9391…`), `F:\tmp\g2-ukemiconc\rc1-pli.mjs`, `proofs\rc1\{R-C-1.diff,record.merged.ts,record.pli.ts}` ;
  code `record.ts`, `prefetch.ts`, `rpc2.ts` (portail, pool), test `ukemi-conc.test.ts` ; `.github/workflows/ci.yml:1-90`.
- 08:29Z clone `-b lot/ukemi-conc-1` : HEAD `2f1e728a4c24…`, `git status` vide. `npm ci --ignore-scripts --cache F:/tmp/npm-cache` exit 0 ;
  `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-ukemiconc-1b\clone\packages\rpc-guard\src\index.ts` ; node v24.15.0 ; git 2.55.0.windows.5.
- 08:3xZ point 1 (diff, back-merge refait par 2 méthodes) ; R-25 (`r25.mjs`).
- 08:35:46Z `lot/etude-suite` (F:\Monark, lecture) = `defb0a7` ; `git diff --stat 6aca053 defb0a7` = `docs/ETAT-REPRISE.md` +1 ligne, 0 non-docs.
- 08:36Z advisor intégré n°1 (après orientation, avant travail substantiel) — voir Provenance.
- 08:41:29-08:44:38Z oracle 7 gates `clone` @ `2f1e728` (§4). 08:47:44-08:49:58Z N(pointe) : gate `test` sur `bm` @ `defb0a7` (§5).
- 08:5xZ fusion à blanc `2f1e728` → `defb0a7` (`merge-tree` + `merge --no-commit`) ; R-25 forme « commit de fusion » (§4) ;
  08:51:01-08:55:01Z oracle 7 gates du produit (§5).
- 08:55:17Z `hb-1b.mjs` (cp-2) et `hb-g2probe.mjs` (sondes G2 h1/h2/h3) sur `clone` (§2-bis). 08:56:38Z `probe-golden.mjs` sur `mut` (§2-bis).
- 08:57:00-08:59:23Z harnais G2 (4 mutants) ; 09:00:03-09:05:22Z harnais du worker (15) ; 09:05:40-09:10:09Z mon harnais (11) — séquentiels,
  aucun autre calcul lourd en parallèle (§3).
- 09:1xZ `stability.mjs`, `cv1-bytes.mjs` (§3d, §3e) ; invariants et A-7 (§6) ; réordonnancement des sections du rendu (`harness\reorder.mjs`,
  multiensemble de lignes vérifié identique).
- 09:14:53Z contrôle d'innocuité (1er jet) ; ~09:15Z **interruption : limite de session (429)** ; 09:22:15Z reprise sur message du coordinateur
  (« continue exactement là où tu étais ») — rendu conservé sur disque, aucune mesure perdue. Correction d'une erreur de commande du 1er jet :
  `sha256sum -c` « clone » lancé HORS du clone (chemins relatifs introuvables) ⇒ relancé DANS le clone : 3/3 OK.
- 09:22:15Z `lot/etude-suite` = `3147249` (après `defb0a7` : `771d7df`, `637dbb4`, `3147249`, 4 fichiers `docs/` seuls, 0 ligne non-docs) ;
  merge-base(`etude-suite`, lot) = `6aca053` (inchangée) ; lot toujours `2f1e728`. Le commit `637dbb4` (re-cp-2 du pli) est vu par son SEUL
  sujet dans `git log` ; son fichier n'a PAS été ouvert (indépendance re-G2 ‖ re-cp-2 ; aucun de ses chiffres n'est utilisé ici).
- 09:24:47-09:31:59Z point 5 REFAIT sur la pointe courante `3147249` (N(pointe) puis fusion `--no-commit` et 7 gates, §5). 09:32:41Z pointe = `f1ed77e`
  (+1 ligne `docs/ETAT-REPRISE.md`), consignée, non re-mesurée.

## 1. Diff du pli, back-merge, octets

- `git diff --numstat ce7bccf 2f1e728` (clone) = **4 fichiers, rien d'autre** :

| Fichier | + | − | Contenu vérifié |
|---|---|---|---|
| `apps/sentinel/src/ukemi/record.ts` | 3 | 3 | 3 lignes remplacées : `t=${new Date(deps.now()).toISOString()}` sur la ligne `..prefetch` (`:429`) ; `every: args.heartbeatEvery` dans l'appel filtre (`:438`) et livre (`:476`) |
| `apps/sentinel/src/ukemi/prefetch.ts` | 6 | 4 | `every: number` OBLIGATOIRE dans `PrefetchOpts` (+ doc 2 l.) ; les deux `opts.every ?? 2000` ⇒ `opts.every` (`:82`, `:95`) ; doc de `tick` |
| `apps/sentinel/test/ukemi-conc.test.ts` | 102 | **0** | 2 hunks : +2 blocs en fin du test du portail (C-G2-3), +2 tests en fin de fichier (C-G2-2, C-V-2) ; 0 suppression ⇒ aucune ligne existante modifiée, aucune assertion retirée |
| `docs/PLI-lot-ukemi-conc-1-1b.md` | 363 | 0 | rendu du worker (hors R-25 : `docs/**/*.md`) |

- Octets : `sha256sum -c F:\tmp\ukemiconc-pli\DELIVERED-pli1b-merged.sha256` dans le clone @ `2f1e728` ⇒ **3/3 OK** ; `record.ts` @ `2f1e728`
  = `ceffc3703ab298e9…` = **`F:\tmp\g2-ukemiconc\proofs\rc1\record.pli.ts` du G2 octet pour octet** (le pli EST le texte proposé par le G2 §4) ;
  `record.ts` @ `ce7bccf` = `606bf04bacb8ce34…` = `record.merged.ts` du G2 (la fusion du back-merge = la fusion à blanc du G2). Blobs @ `2f1e728` :
  `record.ts` `833db0da…`, `prefetch.ts` `dc54ac1b…`, test `54000c28…` ; `git ls-files --eol` : `i/lf w/lf` pour les 3.
- `defaults` : `grep -n "2000" prefetch.ts` @ `2f1e728` ⇒ 0 occurrence ; le SEUL défaut de période restant côté enregistreur est le parse
  `reqInt("--heartbeat-every", 2000)` (`record.ts:169`, refus `< 1` `:170`) et le défaut de `enumerateAndCountAtRisk` (`record.ts:71`, préexistant
  HEARTBEAT-1, garde `Number.isInteger && >= 1` `:72`), que `record.ts:446` alimente toujours avec `args.heartbeatEvery`.
- **Back-merge `ce7bccf` = fusion PROPRE de `6aca053` dans `dec704d`, aucune édition manuelle** — deux méthodes concordantes :
  (a) `git merge-tree --write-tree dec704d 6aca053` exit 0 ⇒ tree `44008497d3cfd619…` ; (b) clone jetable `bm` : `checkout --detach dec704d`,
  `git merge --no-ff --no-commit 6aca053` ⇒ « Auto-merging apps/sentinel/src/ukemi/record.ts / Automatic merge went well », 0 fichier non fusionné,
  `git write-tree` = `44008497d3cfd619…`. `ce7bccf^{tree}` = `44008497d3cfd619…` ; `git diff --quiet <tree> ce7bccf` exit 0 (les deux).
  Parents de `ce7bccf` = `dec704d` puis `6aca053` ; merge-base(`dec704d`,`6aca053`) = `2c276bb` (= base du lot au G2).

## 2. Sémantique — lecture du code @ `2f1e728` (preuves d'exécution : §3 mutants, §2-bis sondes)

- **C-V-1 (câblage)** : `record.ts:438` `prefetchFilterReads(…, { …, onTick: tickFor("filter"), every: args.heartbeatEvery, … })` puis remise à
  zéro `progress.config_read = 0; progress.n_at_risk_config = 0;` ; `record.ts:476` `prefetchBookReads(…, { …, onTick: tickFor("book"), every:
  args.heartbeatEvery, … })`. Seuls appelants des deux préfetchs dans `apps`/`scripts`/`test`/`packages` : ces 2 lignes + le test existant
  `ukemi-conc.test.ts:258` (`every: 10`, préexistant au pli). Défaut inchangé à n>1 : `args.heartbeatEvery` = `reqInt("--heartbeat-every", 2000)`
  (`:169`) = l'ancien `?? 2000` ⇒ comportement par défaut identique (argument de faible risque du cp-2 §7 confirmé).
- **C-G2-1b** : ligne `..prefetch` (`:429`) terminée par ` t=${new Date(deps.now()).toISOString()}` — même source d'horloge que la ligne
  `..filter` de HEARTBEAT-1 (`:444`) ; `PrefetchOpts.every: number` SANS `?`/`undefined` (`prefetch.ts:20`) ; `tick(…, opts.every)` aux deux
  sites (`:82`, `:95`) ; 0 « 2000 » dans `prefetch.ts`. Le `rate=` garde `Date.now() - t0` (préexistant, horloge murale pour un débit ; non
  lié au `t=`).
- **C-V-2** : `tick()` (`prefetch.ts:69-74`) compte, bat si `config_read % every === 0`, puis compte le config-passing — le même `tick` sert les
  deux préfetchs ⇒ la période du drapeau rythme les DEUX. Rejeu filtre : `enumerateAndCountAtRisk` repart des compteurs remis à zéro à `:438`
  (`config_read` incrémenté, `n_at_risk_config = atRisk` réassigné au 1er holder à risque — d'où l'observation `--heartbeat-every 1` du test
  pour rendre la remise à zéro de `n_at_risk_config` observable, raisonnement du worker vérifié à la lecture de `record.ts:91-105` : `config_read += 1` `:95`, battement `:98`, `n_at_risk_config = atRisk` `:103`).
- **C-G2-2** : `prefetchBookReads` : chaque lecture de la tâche passe par `rd` qui teste `signal.stopped` AVANT d'émettre (`prefetch.ts:92`) ;
  `runBounded` pose `signal.stopped = true` à la 1re erreur (`pool.ts:33`), ne dispatche plus (`:29`) et DRAINE toutes les voies avant de
  relancer (`:38`) ; le `finally` de `runRecorder` fait les N `unlock` après ce retour. Les bornes du test (≤ n−1 requêtes distinctes, ≤ 2(n−1)
  émissions après l'arrêt) sont STRUCTURELLES : une tâche n'a qu'une lecture en vol, une lecture quorum-2 = 2 émissions (2 opérateurs
  `eth_call` : drpc, mevblocker ; `--retries` sans effet : aucune erreur de transport dans ce scénario).
- **C-G2-3** : `makePoliteGate` (`rpc2.ts:137-157`) : clé `providerOf(url)`, intervalle `resolveInterval(dom, min, slowOperators, slowInterval)` ;
  `makeUkemiPool` construit ce portail depuis SES options quand on ne lui en passe pas (`rpc2.ts:170`) ; `record.ts:347` construit le portail
  PARTAGÉ avec `args.slowOperators`/`args.slowIntervalMs` et le passe au pool (`gate`). Le test couvre les DEUX constructions : pool sans
  `gate` (bloc `slowPool`, 3×IV) et chemin servi `runRecorder --slow-operator mevblocker.io --slow-interval-ms 40`.

## 2-bis. Sémantique — exécutions indépendantes (outils des AUTRES relecteurs, rejoués sur `2f1e728`, rien de muté)

- **cp-2 C-V-2** : `hb.mjs` du validateur (copie `harness\hb-1b.mjs`, diff = les 2 chemins `C`/`FX` seulement, `harness\adapt.diff`) sur `clone` :
  `exit=0 prefetch_lines=10 filter_replay_lines=10 first_prefetch=..prefetch pass=filter holders_done=5/52 n_at_risk_config=2 … concurrency=4`
  (`logs-hb-1b.log`). Le cp-2 mesurait **0** ligne `..prefetch pass=filter` sans R-C-1 : défaut levé, exactement la forme exigée par C-V-2.
- **G2 C-G2-1 (variante `--heartbeat-every 10`)** : sondes h1/h2/h3 du G2 (runner `run.mjs` copié octet pour octet ; `harness\hb-g2probe.mjs`,
  même extraction que `rc1-pli.mjs`) sur `clone` (`logs-hb-g2probe.log`) : h1 livre n=8 ⇒ **5** lignes `pass=book holders_done=10/52 … 50/52`,
  chacune ` t=2023-11-14T22:13:20.000Z` (= ISO de `deps.now()` = 1 700 000 000 000 ms) ; h2 filtre n=8 ⇒ **5** `pass=filter` (10..50) puis
  **5** `..filter` de rejeu REPARTANT à `config_read=10` ; h3 filtre n=1 ⇒ 0 `..prefetch`, 5 `..filter` (inchangé). = l'attendu « AVEC le pli »
  du G2 §4, sur l'arbre committé.
- Dorés des sondes G2 sur `2f1e728` (`harness\probe-golden.mjs`, `logs-probe-golden.log`) = dorés `t-lot` du G2 (mesurés sur `dec704d`) :
  requêtes s1 126 / b4 45 / g5 184 / g4 184 (identiques), ledgers chaînés, `unlocked` dernier, 0 ligne après ; g5 écart global min 0,47 ms ;
  g4 mevblocker min 44,3 ms (≥ 40), drpc 13,9 ms. ⇒ le back-merge (RETRY-2/3, HEARTBEAT-1) ne déplace aucune de ces références : les
  comparaisons `reqs`/`gaps`/`chain` du harnais G2 restent valides sur `2f1e728`.

## 3. Mutants (arbre `mut` = clone jetable `-b lot/ukemi-conc-1` @ `2f1e728`, `npm ci` exit 0, status vide ; doré = `DELIVERED-pli1b-merged` 3/3)

Adaptation des harnais : copie `cp` octet pour octet (sha256 vérifié = original) puis Edit des SEULES constantes (`harness\adapt.diff`) :
`g2-mutants-1b.mjs` (sha256 `0a8c4cffa990503f…`) = original `44ae8e379c9d49eb…` + `TREE`/`G2`/`TMPF` (3 l.) + chemin du fichier DELIVERED
(l'ancien `F:/tmp/ukemiconc/DELIVERED.sha256` à 6 fichiers aurait refusé le doré : pointé sur `DELIVERED-pli1b-merged.sha256`) + 1 ligne de filtre
des 4 identifiants ; `mutants-pli1b-final-1b.mjs` (`02912405f9cef3c9…`) = original `04d65f96d21a6c82…` + `TREE`/`TMPF` (2 l.). Les sondes du G2
sont exécutées depuis une copie `g2copy\probes` (114 fichiers octet pour octet ; seule la clé `tmpRoot` des 31 scénarios pointe vers MON tmp —
`run.mjs` ne supprime jamais ses dossiers `mkdtemp` : rien n'est écrit dans `F:\tmp\g2-ukemiconc\` ; `harness\copy-probes.mjs`).

### 3a. `g2-mutants.mjs` du G2, chemins seuls, G2M1 / G2M3b / G2M8 / G2M19 (`logs-g2-mutants-1b.log`, 08:57:00-08:59:23Z, exit 0)
En-tête : HEAD `2f1e728`, working tree vide, `golden==DELIVERED.sha256: true` ; BASELINE 13/13 ok. Chaînes de substitution = celles du G2
(fichier du G2 inchangé hors constantes). Oracle (1) = le fichier de test du lot en TAP.

| # | Verdict G2 (@ `dec704d`) | Verdict ICI (@ `2f1e728`) | Tests rouges (TAP `not ok`) | Sonde G2 (3) |
|---|---|---|---|---|
| G2M1 | TUÉ (4 tests) | **KILLED(lot-test)** | 5 : `…pool_bounds…`, `…first_error_stops…`, `…book_prefetch_leaves…zero_network_reads`, `…budget_stop_drains…`, **`…book_stop_halts…`** (nouveau) | s1 : `drpc.org.jsonl` prev mismatch @62, `attempted` après `unlocked` (CHAIN-1) ; b4 : idem @25 |
| G2M3b | SURVIT à la suite | **KILLED(lot-test)** | 1 : `…polite_gate_spaces_issues_per_operator_under_concurrency` | g5 : écart global min 23,86 ms (doré 0,36) |
| G2M8 | SURVIT à la suite | **KILLED(lot-test)** | 1 : `…book_stop_halts_each_task_at_its_next_read…` | s1 : 142 requêtes contre 126 |
| G2M19 | SURVIT à la suite | **KILLED(lot-test)** | 1 : `…polite_gate_spaces_issues_per_operator_under_concurrency` | g4 : mevblocker min 14,2 ms (< 40), 91 émissions sous l'intervalle |

`ALL_RESTORED=true FINAL_GOLDEN_INTACT=true`. **4/4 ROUGES** ; les trois survivants du G2 sont désormais tués par un test NOMMÉ du lot, chacun
par UN seul test (le tueur visé de C-G2-2 / C-G2-3) — trous de test du G2 fermés.

### 3b. `mutants-pli1b-final.mjs` du worker, chemins seuls (`logs-mutants-pli1b-final-1b.log`, 09:00:03-09:05:22Z, exit 0)
En-tête : HEAD `2f1e728`, tree `5c46fcff…`, working tree vide ; BASELINE 13/13 ok, 3 tueurs verts, `tsc` status 0 ; vérification intégrée
« G2 find/repl verbatim » passée. **15/15 KILLED byIntended** (`not ok … - <tueur visé>` ; `not_ok=1` chacun sauf G2M1 : 5), **MV1/MV2 aussi
tués au TYPE** (`tsc` status 2 : TS2345 `record.ts(438,80)` / `(476,74)`, « Property 'every' is missing … required in type 'PrefetchOpts' » =
C-G2-1b effectif au typage), `ALL_RESTORED` / `FINAL_GOLDEN_INTACT` / `WORKING_TREE_UNCHANGED` = true, 15 mutations distinctes.
Assertions qui tombent (extraites du TAP) : G2M8 « no read launched after the stop: 22 distinct request(s), 43 fetch(es) after it (<= 7, <= 14) » ;
G2M3b « global min gap 25.86 ms < 12.5 ms » ; G2M19 « slowOperators: b.example … >= 75 ms (gaps ≈ 30-32) » ; MS1 « --slow-operator
mevblocker.io on the served path: 9 issues >= 40 ms (gaps 15-19 …) » ; MT2 « each prefetch line: … t=<ISO of deps.now> » ; MV1 « filter
prefetch at --heartbeat-every 5: exactly 10 lines, 5/52 first ». = les chiffres du rendu du pli (re-mesurés, pas repris).

### 3c. Mes mutants PROPRES (`harness\mine-mutants.mjs` sha256 `6199ac7a1c5dac05…`, `logs-mine-mutants.log`, 09:05:40-09:10:09Z, exit 0)
Distincts des 15 du worker et des 18 du G2 (les exemples de la mission recoupant MV1/MV2/MV6/MV7/MT2, j'en ai pris des FORMES différentes).
Nature DÉCLARÉE AVANT exécution dans le harnais (`kill` = tué seulement par `not ok … - <tueur visé>` ; `probe` = sonde de force de test, issue
non présumée ; `attr` = contrôle d'ATTRIBUTION : une assertion du pli AFFAIBLIE + un mutant G2 VERBATIM ⇒ ce mutant doit survivre). BASELINE
13/13, tueurs verts ; pré-vol : chaque motif exactement 1 fois ; restauration octet-exacte ; `ALL_AS_DECLARED=true`, arbre inchangé.

| # | Nature | Mutation (1 site sauf A) | Issue | Assertion qui tombe (TAP) |
|---|---|---|---|---|
| R1 | kill | `prefetch.ts:72` phase du battement `% every === 1` (bat à 1, 6, 11…) | **KILLED** (+ test préexistant `…book_prefetch_leaves…` « a tick every 10 holders done ») | « filter prefetch … exactly 10 lines, 5/52 first » |
| R2 | kill | `prefetch.ts:95-96` livre : `tick` déplacé SOUS `if (!passing) return` (ne compte que les config-passing) | **KILLED** (+ `…book_prefetch_leaves…`) | « book prefetch … exactly 10 lines, 5/52 first » |
| R3 | kill | `record.ts:476` livre `every: 2000` littéral (un `number` : conforme au type `PrefetchOpts` — `tsc` non exécuté pour ce mutant, seul le test comportemental le juge ; « every à un seul préfetch ») | **KILLED** | « book prefetch … exactly 10 lines, 5/52 first » |
| R4 | kill | `record.ts:429` `t=${String(deps.now())}` (bonne horloge, format epoch ms au lieu d'ISO) | **KILLED** | « each prefetch line: … t=<ISO of deps.now> » |
| R5 | kill | `record.ts:438` remise à zéro R-C-2 DÉPLACÉE avant le préfetch filtre (le rejeu repart de 52) | **KILLED** | « the replay pass restarts at zero: 5/52 first » |
| R6 | kill | `record.ts:438` préfetch filtre étiqueté `tickFor("book")` (copier-coller) | **KILLED** | « filter prefetch … exactly 10 lines, 5/52 first » |
| R7 | kill | `rpc2.ts:170` le portail construit PAR LE POOL perd le jeu lent (`makePoliteGate(minIntervalMs)`) ; `makePoliteGate` et le portail partagé de `record.ts` le gardent (≠ G2M19, ≠ MS1) | **KILLED** | « slowOperators: b.example issues >= 75 ms apart (gaps ≈ 30,5-31,0) » |
| P1 | probe | `prefetch.ts:72-73` décompte config-passing AVANT le battement (ordre documenté « count, tick, then tally » inversé) | **SURVIVED** (déclaré) | — ⇒ O-R1 |
| P2 | probe | `prefetch.ts:106` chaîne de lecture de la réserve de dette sans arrêt (`reserve(bi, NEVER)`) — hors lettre de C-G2-2 (G2M8 = `rd` de la tâche `:92`) | **SURVIVED** (déclaré) | — ⇒ O-R2 |
| A1 | attr | test : `gmin < IV / 2` ⇒ `gmin < IV * 2` + G2M3b verbatim | **SURVIVED** (déclaré) | ⇒ l'assertion « non sérialisés » est l'UNIQUE tueur de G2M3b |
| A2 | attr | test : bornes après arrêt ⇒ `<= 100` / `<= 200` + G2M8 verbatim | **SURVIVED** (déclaré) | ⇒ les bornes ≤ n−1 / ≤ 2(n−1) sont l'UNIQUE tueur de G2M8 (ledgers et non-vacuité ne le voient pas) |

**7/7 mutants `kill` tués par le tueur visé** (exigence ≥ 5) ; attributions A1/A2 confirmées (les assertions ajoutées par C-G2-3(1) et C-G2-2
sont porteuses, pas décoratives) ; P1/P2 survivants = observations formées (O-R1, O-R2), déclarées avant exécution.

### 3d. Stabilité des 3 tests du pli sous la charge des courses (`harness\stability.mjs` sha256 `a4e4bf882bbef76b…`, `logs-stability.log`)
36 exécutions complètes du fichier de test (3 BASELINE + 4 + 15 + 11 mutants + 3 oracles : `2f1e728`, produits `defb0a7` et `3147249`) :
`…heartbeat_every…` vert 20 / rouge 16, rouge UNIQUEMENT sous MV1-8, MT1-2, R1-6 ; `…book_stop_halts…` vert 32 / rouge 4, UNIQUEMENT sous
G2M1 ×2, G2M8 ×2 ; `…polite_gate…` vert 30 / rouge 6, UNIQUEMENT sous MS1, G2M3b ×2, G2M19 ×2, R7. **0 rouge hors mutant visé** : aucune instabilité observée (bornes de C-G2-2
structurelles ; ordre de grandeur de l'écart global min doré mesuré ICI par la sonde g5 du G2 — chemin servi, portail 20 ms — : 0,47 ms ; la borne du
test, à IV = 25 ms, est `IV/2` = 12,5 ms ; la valeur interne du test n'est pas imprimée quand il passe, je ne la chiffre donc pas).

### 3e. C-V-1 au niveau octet (`harness\cv1-bytes.mjs`, en mémoire, rien écrit)
`record.ts` @ `2f1e728` moins le seul suffixe ` t=${…}` ⇒ sha256 `4dce62d3caa4e48a…` = `F:\tmp\cp2-ukemiconc\rc1-record.sha` (octets C-V-1 du
validateur) ; `record.ts` @ `2f1e728` = `record.pli.ts` du G2 ; lignes différentes de `record.merged.ts` (= `ce7bccf`) : exactement [429, 438, 476]
(577 lignes des deux côtés). Le pli EST C-V-1 (octets du cp-2) + C-G2-1b (octets du G2), rien d'autre dans `record.ts`.

## 4. Oracle 7 gates, R-25

### Oracle sur le clone @ `2f1e728` (`F:\tmp\g2-ukemiconc-1b\oracle-2f1e728\`, `oracle.sh` sha256 `43cbfeeb3b773d57…`, codes capturés directement)
En-tête : HEAD `2f1e728a4c24…`, tree `5c46fcff3861…`, branche `lot/ukemi-conc-1`, `git status --porcelain` VIDE, `@monark/rpc-guard` résolu dans le
clone. 08:41:30-08:44:38Z : `gate:vocab` 0 · `typecheck` 0 · `test` 0 · `lint` 0 · `lint:ratchet` 0 · `lang:gate` 0 · `export:check` 0.
**`test` : 1055 / 1053 / 0 / 2** (reporter node 24 : `ℹ tests 1055 / pass 1053 / fail 0 / skipped 2`, 0 `✖`) = attendu de la mission.
Sauts = `sentinel_run_releases_chainstack_lock_on_sigterm` (win32) et `u4b_labels_replay_via_main_real_artifact` (« real e2 artifacts
absent (A-rawlogs.jsonl gitignored…) ») — les deux sauts de tout clone frais (G2 §3). Les **13** `ukemi_conc_*` ✔ (dont les 2 nouveaux :
`…book_stop_halts…` 3,1 s, `…heartbeat_every_paces_both…` 5,3 s). Durée `test` 135,4 s (machine chargée par les courses, non touchées).

### R-25 — quelle forme la CI calcule, et LE chiffre
- Ligne CI [lu] `ci.yml:65` (blob `56290f9f…`, IDENTIQUE à `2c276bb`, `6aca053`, `defb0a7`, `2f1e728`) : `git diff --shortstat
  "origin/${{ github.base_ref }}...HEAD" -- <15 jetons>` ; déclencheur `on: pull_request:` sans filtre ; checkout sans `ref:`.
- Sémantique [lu] (doc git 2.55 installée, `git-diff.html` §« git diff A...B ») : « `git diff A...B` is equivalent to `git diff $(git
  merge-base A B) B` ». La base CI est donc merge-base(`origin/<branche cible>`, HEAD). Depuis le back-merge `ce7bccf`, `6aca053` est un
  ancêtre de `2f1e728` : **merge-base(`lot/etude-suite`, `2f1e728`) = `6aca053`** (mesuré, clone et `F:\Monark` en lecture) — `2c276bb`
  n'est PLUS la base du lot.
- Mesures (`r25.mjs` sha256 ci-dessous : lit `ci.yml:65` AU commit donné, garde les 15 jetons VERBATIM, ne remplace que la plage) :

| Plage | Stat | Σ | Statut |
|---|---|---|---|
| `6aca053...2f1e728` (tête de PR ; base = merge-base) | 6 fichiers, 668 (+) / 24 (−) | **692** | **forme CI** |
| `defb0a7..da5c00c7` (`da5c00c7` = ARBRE de la fusion à blanc, contenu d'un commit de fusion de PR ; base = pointe) | 6 fichiers, 668 / 24 | **692** | forme CI (checkout par défaut d'un `pull_request`) |
| `defb0a7...2f1e728` | 6 fichiers, 668 / 24 | 692 | idem (merge-base = `6aca053`) |
| `3147249...2f1e728` et `3147249..9c3248d0` (pointe à 09:22Z ; tête de PR / ARBRE `merge-tree` de la fusion) | 6 fichiers, 668 / 24 | 692 | idem (re-mesuré après avancée de la pointe) |
| `2c276bb...dec704d` (lot avant pli) | 6, 564 / 24 | 588 | = G2 / cp-2 |
| `ce7bccf...2f1e728` (pli brut) | 3, 111 / 7 | 118 | = « 111/7 » du rendu ; 692 = 588 + 111 − 7 (les 7 lignes retirées sont des lignes AJOUTÉES par le lot) |
| `2c276bb...2f1e728` (forme littérale proposée par la mission) | 35, 3 501 / 89 | 3 590 | **PAS la forme CI** : compte les 2 898 lignes de code d'`etude-suite` amenées par le back-merge (`dec704d...ce7bccf` = 30 fichiers, 2 833 / 65 = 2 898), déjà comptées et revues sous leurs propres R-25 |

- **LE chiffre = 692** (< 1 150 borne de mission ; < 1 205 `VIBEGATES_PR_LIMIT` de `ci.yml:43`) ⇒ **pas de STOP**. Il est invariant au choix
  de `HEAD` par le checkout (tête de PR ou commit de fusion de PR) tant qu'`etude-suite` n'avance que par `docs/**/*.md` (mesuré : `6aca053..defb0a7`
  = 1 ligne `docs/ETAT-REPRISE.md`, exclue par `:(exclude,glob)docs/**/*.md`). Précédent du projet : les G7 d'`etude-suite` portent le R-25 du
  lot contre la base d'`etude-suite` (`git log --merges lot/etude-suite` : « R-25 735 », « R-25 826 … gates STOP 1,150 / CI 1,205 », « R-25 903 »).
- Réserve déclarée (non bloquante) : une PR de `lot/ukemi-conc-1` vers `main` (et non vers `lot/etude-suite`) aurait merge-base
  = merge-base(`main`, `etude-suite`) et compterait tout `etude-suite` (1 092 commits d'avance) — hors du flux des lots (les lots entrent dans
  `lot/etude-suite` par G7 ; `main` reçoit des PR `lot/*` d'une autre lignée, `git log main`).
- Borne : A-5 de `docs/CONSIGNE-STANDARD-G1.md` [lu] « > 1 150 ⇒ STOP ». `r25.mjs` sha256 `a07f003fcb2f5fe3…`.

## 5. Fusion à blanc de `2f1e728` dans la pointe `lot/etude-suite` (`defb0a7`, puis la pointe courante `3147249` ; toutes deux ≥ `6aca053`)

- Pointe mesurée 08:35:46Z (`F:\Monark`, lecture) : `defb0a7` = `6aca053` + `docs/ETAT-REPRISE.md` (+1 ligne) ; merge-base(`defb0a7`, `2f1e728`) = `6aca053`.
- **N(pointe)** mesuré dans `bm` (clone jetable, `checkout --detach defb0a7`, `npm ci` exit 0, status vide) : gate `test` exit 0,
  **1042 / 1040 / 0 / 2** (0 `ukemi_conc_*`), mêmes 2 sauts (`oracle-tip-defb0a7\`, 08:47:45-08:49:58Z).
- Fusion : `git merge-tree --write-tree defb0a7 2f1e728` exit 0 ⇒ tree `da5c00c72896…` ; `git merge --no-ff --no-commit 2f1e728` ⇒ « Automatic
  merge went well », **0 conflit**, `git write-tree` = `da5c00c72896…` (les deux méthodes concordent). **Aucun commit créé** (R-20 ; `export:check`
  et le test d'export parcourent l'arbre de travail — `scripts/export-public.mjs` `walkFiles`, pas `git` — l'état `--no-commit` est donc probant).
  Index : 6 fichiers de code du lot (`pool.ts` A, `prefetch.ts` A, `record.ts` M, `resume.ts` M, `rpc2.ts` M, `ukemi-conc.test.ts` A) + 2 docs
  (`G1-lot-…`, `PLI-lot-…-1b`). `git diff --stat 2f1e728 da5c00c7` = `docs/ETAT-REPRISE.md` +1 seulement ; non-docs : VIDE.
- **Oracle 7 gates du produit** (`oracle-merge-defb0a7\`, 08:51:01-08:55:01Z, en-tête : HEAD `defb0a7`, MERGE_HEAD `2f1e728`) : `gate:vocab` 0 ·
  `typecheck` 0 · `test` 0 · `lint` 0 · `lint:ratchet` 0 · `lang:gate` 0 · `export:check` 0 ; **1055 / 1053 / 0 / 2 = N(pointe) + 13** (13 =
  11 tests du lot + 2 du pli ; 13 `✔ ukemi_conc_*`, 0 `✖`). Compte au G7 dans l'arbre principal : PROJECTION non mesurée ici (le saut
  `u4b_labels_replay_via_main_real_artifact` y tombe, A-rawlogs présent) = 1055 / 1054 / 0 / 1 — le « 1054/1053/0/1 » du cp-2 §3 est supersédé
  (+2 tests et non +1), comme le rendu du pli le déclare en tête ; écart au G7 = STOP (règle du cp-2).
- **Pointe avancée pendant la revue** (09:22:15Z) : `lot/etude-suite` = `3147249` = `defb0a7` + 4 fichiers `docs/` (0 ligne non-docs). Contre
  elle : `git merge-tree --write-tree 3147249 2f1e728` exit 0 (0 conflit) ⇒ tree `9c3248d003d2…`, `git diff --stat 2f1e728 9c3248d0 -- .
  ':(exclude)docs'` VIDE ⇒ code du produit identique à celui mesuré ci-dessus. Des gates lisent AUSSI `docs/` (p. ex. `gate:vocab`,
  `lang:gate`, le scan de secrets `test/no-secret-in-repo.test.ts` dans `test`) ⇒ l'oracle est REFAIT sur cette pointe, pas inféré
  (`drive-3147249.sh` / `.log`, 09:24:47-09:31:59Z, dans `bm` : `merge --abort` de l'état précédent, `checkout --detach 3147249`, status vide) :
  **N(`3147249`) = 1042 / 1040 / 0 / 2** (`oracle-tip-3147249\`, gate `test` exit 0, mêmes 2 sauts) ; `git merge --no-ff --no-commit 2f1e728` ⇒
  « Automatic merge went well », 0 fichier non fusionné, `write-tree` = `9c3248d003d2…` (= `merge-tree`), diff non-docs contre `2f1e728` VIDE ;
  **oracle 7 gates du produit** (`oracle-merge-3147249\`, en-tête HEAD `3147249`, MERGE_HEAD `2f1e728`) : `gate:vocab` 0 · `typecheck` 0 · `test` 0 ·
  `lint` 0 · `lint:ratchet` 0 · `lang:gate` 0 · `export:check` 0 ; **1055 / 1053 / 0 / 2 = N(`3147249`) + 13** (13 `✔ ukemi_conc_*`, 0 `✖`).
- 09:32:41Z : `lot/etude-suite` = `f1ed77e` = `3147249` + 1 ligne `docs/ETAT-REPRISE.md` (0 ligne non-docs ; merge-base avec `2f1e728` = `6aca053`) —
  non re-mesuré (la pointe avance par des points d'étape `docs/` ; le G7 re-mesure sur la pointe réelle, écart = STOP).

## 6. Sécurité A-7 et assertions
- Lignes AJOUTÉES de `src` par le pli (`git diff ce7bccf 2f1e728 -- apps/sentinel/src | grep '^+[^+]'`, `added-src.txt`, 9 lignes) : 0 URL
  (`https?://`), 0 `process.env`, 0 `fetch(`, 0 `child_process`/`node:http`/`undici`, 0 nom des 8 clés payantes ; 1 `Date.now` = le `rate=`
  PRÉEXISTANT de la ligne `..prefetch` remplacée (le `t=` ajouté lit `deps.now()`).
- Lignes AJOUTÉES du test (102 = 100 non vides + 2 vides) : 1 URL = `sa.get("https://b.example")`, clé de table d'un `call` INJECTÉ (jamais fetché) ; 2 `fetch(` =
  le texte « fetch(es) » de deux messages d'assertion ; 0 `process.env`, 0 clé ; les parties « chemin servi » passent par `withFetch`
  (bouchon de `globalThis.fetch`) et `DEPS = { env: {} }` ; `rpc.mevblocker.io` = hôte de l'opérateur keyless déjà présent au dépôt
  (`pool-rpc-1a.test.ts:29,78,113`), aucun nouveau point de terminaison.
- Lignes RETIRÉES (7, toutes dans `src`) : l'ancienne `PrefetchOpts` (`every?`), l'ancien commentaire de `tick`, les 2 `opts.every ?? 2000`, l'ancienne
  ligne `..prefetch` sans `t=`, les 2 anciens appels sans `every` — du code REMPLACÉ ; **aucune assertion retirée** (test : 0 suppression).
- Invariants : `git diff --quiet ce7bccf 2f1e728 -- book.ts ADR-U4b prereg apps/sentinel/test/fixtures package-lock.json packages scripts apps/bell
  .github` exit 0 ; idem `6aca053 2f1e728` (lot + pli contre `etude-suite`) exit 0.

## Observations (non bloquantes ; disposition formée pour chacune — zéro dette nue)

- **O-R1** (sonde P1 survivante, déclarée avant exécution) : l'ordre « compte, battement, PUIS décompte config-passing » de `tick()`
  (`prefetch.ts:67-74`, documenté dans son commentaire) n'est épinglé par aucun test ; seul `ukemi-conc.test.ts` pilote `prefetch.ts` (grep) ⇒
  survit à toute la suite. Effet de l'inversion : la valeur `n_at_risk_config` imprimée sur une ligne `..prefetch` au moment d'un battement
  (± le holder qui déclenche) ; à n>1 cette valeur suit l'ordre d'ARRIVÉE et n'est pas comparable à n=1 par construction ; aucune sortie
  consommée (JSON, `diag.n_at_risk_seen` lu à l'arrêt, ledgers, digests) n'en dépend. **Disposition** : aucune correction de code ; à
  l'insertion C-G2-4 (déjà due, orchestrateur, G7), la phrase « Tuyau Sortie » dit la valeur « cumulative, en ordre d'arrivée, indicative ».
- **O-R2** (sonde P2 survivante, déclarée) : l'arrêt dans la chaîne de lecture d'une RÉSERVE DE DETTE (`reserve(bi, signal)`,
  `prefetch.ts:106` ⇒ `rd` `:40`) n'est pas épinglé : dans le scénario C-G2-2 toutes les réserves de dette sont mémorisées avant l'arrêt
  (les clones trient en tête ; le clone 24 empoisonné est en milieu de liste). Pire cas si l'arrêt y était perdu : ≤ 4 lectures
  (`getReserveData`, `getSourceOfAsset`, `description`, `getAssetPrice`) par réserve de dette vue pour la 1re fois APRÈS l'arrêt, bornées
  par le nombre de réserves, DRAINÉES avant l'`unlock` (`pool.ts:38`) ⇒ ledgers chaînés (pas de CHAIN-1). Hors lettre de C-G2-2 (qui nomme
  G2M8 = le `rd` de la tâche `:92`, tué). **Disposition** : (a) texte ADR, C-G2-4 point 3 (ligne « lectures lancées après le stop ») :
  « chemin livre : `rd` de la tâche = `…book_stop_halts…` (G2M8 rouge) ; chaîne `reserve()` = déclaratif » ; (b) item formé
  **UKEMI-CONC-RESERVE-STOP-1** : test tueur du contrôle d'arrêt dans la chaîne `reserve()` (scénario : une réserve de dette dont le premier
  emprunteur trie APRÈS le holder empoisonné) ; déclencheur : prochain lot touchant `prefetch.ts` ou le plan de lecture de `book.ts` ;
  propriétaire : orchestrateur ; `error_origin` proposé : `implémentation G1` (tests).
- **O-R3** (G2 O-5 non exécutable dans ce pli) : le pli ajoute 3 littéraux `.example` (`ukemi-conc.test.ts:161,163,164`) LIÉS à la constante
  existante `eps` (`:144`) que D-4 interdisait de modifier ⇒ la disposition du G2 « aligner (`.invalid`, A-4) à la prochaine édition du test »
  ne pouvait s'exécuter sans enfreindre D-4. Hôtes jamais fetchés. **Disposition** : item O-5 RE-FORMÉ, déclencheur : prochain lot autorisé à
  modifier les lignes existantes de `ukemi-conc.test.ts` (aligner `eps` ET ces 3 littéraux ensemble) ; propriétaire : orchestrateur.
- **O-R4** (forme R-25) : la forme littérale de la mission `2c276bb...2f1e728` (3 590) n'est plus celle de la CI depuis le back-merge ;
  LE chiffre est **692** (`6aca053...2f1e728` ≡ CI, §4). **Disposition** : l'entrée G7 cite 692 AVEC sa forme (base = merge-base avec
  `etude-suite` = `6aca053`) ; aucune action sur le code.
- **O-R5** (G2 O-4) : commentaire périmé `ukemi-u4a.test.ts:149` « (polite() consults it) » toujours présent (hors périmètre fixé au pli).
  **Disposition** : celle du G2 tient (prochain lot touchant ce test) ; pas d'item nouveau.
- **O-R6** (item du worker UKEMI-CONC-EVERY-GUARD-1, `every >= 1` non revalidé dans `prefetch.ts`) : faits confirmés — seuls appelants
  hors test = `record.ts:438/476` avec `args.heartbeatEvery` refusé `< 1` au parse (`:169-170`) ; appelant de test `:258` (`every: 10`).
  **Disposition** : item accepté tel que formé (déclencheur : un 2ᵉ appelant hors test) ; aucune action.
- **O-R7** (lettre de C-G2-1) : le test épingle le mécanisme à n=4 / `--heartbeat-every 5` (10 lignes) au lieu des paramètres illustratifs
  du G2 (n=8 / 10 ⇒ 5 lignes) ; mon rejeu des sondes du G2 h1/h2/h3 à n=8 / 10 sur `2f1e728` donne EXACTEMENT l'attendu du G2 (§2-bis).
  **Disposition** : aucune (lettre satisfaite par exécution ; le test porte plus de lignes).

## Corrections — LISTE FERMÉE

**Aucune.** Les corrections du G2 (C-G2-1, C-G2-1b, C-G2-2, C-G2-3) et du cp-2 (C-V-1, C-V-2) pliées dans `2f1e728` sont conformes, prouvées par
exécution (§1-§5). Restent HORS de ce re-G2-delta, inchangées, à la charge de l'orchestrateur au G7 : **C-G2-4** (texte ADR, 8 points — à
compléter des dispositions O-R1 et O-R2(a)) et **C-V-3** (MAST résiduel, requalification R-C-1/R-C-2, note R-25 — la note doit porter 692
et sa forme, O-R4).

## Verdict

**PASS.** Le pli 1b fait exactement ce qu'exigent le cp-2 (C-V-1, C-V-2) et le G2 (C-G2-1, C-G2-1b, C-G2-2, C-G2-3), et rien d'autre :
diff = 3 fichiers de code + rendu, `record.ts` = octets C-V-1 du cp-2 + `t=` du G2 (lignes 429/438/476 seules) ; back-merge `ce7bccf` = fusion
propre, refaite à l'identique par deux méthodes ; oracle 7 × 0 à `2f1e728` (1055/1053/0/2) et sur les produits de fusion dans `defb0a7` ET
dans la pointe courante `3147249` (0 conflit ; 1055/1053/0/2 = 1042 + 13 dans les deux cas) ; R-25 = 692 (forme CI) ; les 4 mutants du G2 ROUGES dont les 3 anciens survivants, chacun par son
tueur nommé ; 15/15 du worker ; 7/7 de mes mutants tueurs ; attributions des nouvelles assertions confirmées ; 0 instabilité sur 36
exécutions ; A-7 : rien d'ajouté, aucune assertion retirée. Deux sondes survivantes (O-R1, O-R2) = trous de test mineurs HORS lettre des
corrections, sans effet sur les sorties consommées ni sur la chaîne des ledgers : dispositions formées, non bloquantes.

## Provenance
- Relecteur `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, décision 133), effort max ; 2026-09-23 08:28:52Z → 09:38:21Z (`date -u` ;
  interruption ~09:15-09:22Z : limite de session, reprise sur message du coordinateur) ; mission re-G2-DELTA du pli 1b de l'orchestrateur ; objet `lot/ukemi-conc-1` @ `2f1e728` (parent `ce7bccf` = back-merge de
  `6aca053` dans `dec704d`) ; fusions à blanc contre `lot/etude-suite` @ `defb0a7` puis @ `3147249` (pointe à la reprise). Générateur du pli : worker `claude-opus-5-5[1m]` (instance
  distincte) ; relecteurs antérieurs : G2 (`claude-opus-5-5[1m]`), cp-2 (`claude-fable-5-1`) — leurs outils rejoués, leurs chiffres re-mesurés.
- Advisor intégré : n°1 après orientation (08:36Z) : conseil RETENU — rendre le rendu durable d'abord ; R-25 = 692 invariant au choix du HEAD
  CI ; ordre oracle → fusion → mutants sans concurrence (charge des courses, assertion `gmin` sensible) ; `bm` réutilisé pour la pointe ;
  adapter les harnais par `cp` + Edit des seules constantes (A-13) ; rediriger les sorties de sondes hors de `F:\tmp\g2-ukemiconc` ; mutants
  PROPRES distincts de ceux du worker ; contrôles d'attribution ; rejeu de `hb.mjs`. Écarté : le commit jetable de fusion (mission : « aucun
  commit ») — remplacé par l'état `--no-commit`, rendu probant par la lecture de `export-public.mjs` (parcours d'arbre, pas `git`).
  n°2 avant clôture (09:3xZ, rendu déjà durable) : verdict PASS jugé soutenu ; confirme les deux écarts à l'avis n°1 (état `--no-commit`,
  oracle de la pointe `3147249` REFAIT et non inféré) ; O-R2 maintenue en observation (G2M8, lettre de C-G2-2, tué ; P2 hors lettre, borné,
  drainé, item formé) ; O-R3 maintenue. RETENU et appliqué : compte de stabilité porté à 36 (3ᵉ oracle de produit), mention du `git fetch`
  de `bm` depuis `F:\Monark` dans l'Innocuité, heure de clôture réelle, re-scan SECRET-SCAN-1 du fichier final, sha256 en fichier annexe
  (jamais dans le fichier), aucune écriture après la ligne de fin. Écarté : rien. Conseil, jamais verdict.
- SECRET-SCAN-1 appliqué d'avance à ce rendu (`harness\secretscan-1b.mjs` sha256 `9712d19de732bc7c…`, calque de `secretscan-g2.mjs` :
  les 13 motifs EXTRAITS de `test/no-secret-in-repo.test.ts` du clone @ `2f1e728`, jamais re-tapés) : **0 occurrence** ; 0 CR (LF seul).
- A-13 : tous les fichiers de ce relecteur écrits par Write/Edit (scripts, harnais adaptés, rendu) ; copies des harnais par `cp` octet pour
  octet puis Edit des constantes. Processus 22236 / 102592 jamais touchés. `F:\Monark` : `git` en lecture seule ; rien écrit dans
  `F:\Monark*` ni dans les dossiers du G2 / cp-2 / worker (lus seulement).

## Innocuité (mesurée 09:14:53Z, 09:22:15Z, 09:32:41Z)
- Écrit par moi : UNIQUEMENT sous `F:\tmp\g2-ukemiconc-1b\` (clones `clone`/`bm`/`mut` + leurs `node_modules`, `tmp\`, `g2copy\`, `harness\`,
  `oracle-*\`, journaux, ce rendu) ; cache npm partagé `F:/tmp/npm-cache` (lecture/écriture de cache par `npm ci`, comme G2 et cp-2).
- `F:\Monark` : `git` en LECTURE seule (rev-parse, log, diff, merge-base, status) ; `F:\Monark` est aussi la SOURCE lue par les 3 `git clone
  --no-hardlinks` (`clone`, `bm`, `mut`) et par un `git fetch -q origin lot/etude-suite` exécuté DANS `bm` à 09:22Z pour obtenir `3147249`
  (lecture de la source ; écriture des objets/refs dans `bm` seulement). À la clôture `git status --porcelain` VIDE, branche `lot/etude-suite` ;
  `lot/ukemi-conc-1` = `2f1e728` (inchangé). Aucune commande dans `F:\Monark-wt-*`.
- Dossiers des autres relecteurs LUS seulement : `F:\tmp\g2-ukemiconc\` (entrées les plus récentes : `G2.md`/`G2.md.sha256` 07:38:53Z,
  `tmp\p-*` 07:31:36-39Z = « re-jeu final des sondes cœur » du G2, `mut-probes\` 07:15:00Z — heures `ls` LOCALES UTC+1 converties ; toutes
  antérieures à mon démarrage 08:28:52Z), `F:\tmp\cp2-ukemiconc\`, `F:\tmp\ukemiconc-pli\`.
- Clones à la clôture : `clone` @ `2f1e728`, status vide, `DELIVERED-pli1b-merged` 3/3 OK ; `mut` @ `2f1e728`, status vide, 3/3 OK (tous les
  mutants restaurés octet pour octet, 3 harnais : `ALL_RESTORED`/`FINAL_GOLDEN_INTACT` true) ; `bm` : HEAD `3147249` (détaché), `MERGE_HEAD`
  `2f1e728`, **aucun commit** (état `--no-commit` laissé tel quel dans un clone jetable ; l'état `defb0a7` précédent a été abandonné par `merge --abort`).
- Processus de course : aucun `kill`/`taskkill`/signal émis ; les `--test-force-exit` des harnais ne visent que leurs propres enfants.
- Aucune variable d'environnement affichée ; ceinture A-7 sur toute commande node/npm (et retrait insensible à la casse dans les harnais).

## Fichiers de preuve (tous sous `F:\tmp\g2-ukemiconc-1b\`)
- Scripts : `r25.mjs` (`a07f003f…`), `oracle.sh` (`43cbfeeb…`), `harness\copy-probes.mjs` (`97edb62d…`), `harness\g2-mutants-1b.mjs`
  (`0a8c4cff…`), `harness\mutants-pli1b-final-1b.mjs` (`02912405…`), `harness\hb-1b.mjs` (`a77ea974…`), `harness\hb-g2probe.mjs` (`219ddfc8…`),
  `harness\probe-golden.mjs` (`a33ad476…`), `harness\mine-mutants.mjs` (`6199ac7a…`), `harness\stability.mjs` (`a4e4bf88…`, version à 3 oracles ; 1re version à 2 oracles `66a84317…`),
  `harness\secretscan-1b.mjs` (`9712d19d…`), `harness\reorder.mjs`, `drive-3147249.sh`,
  `harness\cv1-bytes.mjs` (`6627a269…`), `harness\adapt.diff` (`99d64d83…`).
- Oracles : `oracle-2f1e728\`, `oracle-tip-defb0a7\` (test seul), `oracle-merge-defb0a7\`, `oracle-tip-3147249\` (test seul),
  `oracle-merge-3147249\` (chacun `HEADER.txt`, `EXITS.txt`, `TEST-COUNTS.txt`, logs) ; pilote `drive-3147249.sh` + `drive-3147249.log`.
- Journaux : `logs-g2-mutants-1b.log` (`b90f0c9d…`), `logs-mutants-pli1b-final-1b.log` (`62102b73…`), `logs-mine-mutants.log` (`e5aa0d0c…`),
  `logs-hb-1b.log` (`beee66c7…`), `logs-hb-g2probe.log` (`92d15efc…`), `logs-probe-golden.log` (`0879a1b9…`), `logs-stability.log` (`8d595b3c…`),
  `drive-3147249.log`, `bm-merge.log`, `bm-merge-tip.log`,
  `npm-ci-{clone,bm,mut}.log`, `added-src.txt`, `added-test.txt`.
- Clones jetables : `clone` (`2f1e728`, intact), `bm` (état `--no-commit` de la fusion `2f1e728` → `3147249`, aucun commit), `mut` (`2f1e728`,
  status vide après restauration), `g2copy\` (copie des sondes du G2, `tmpRoot` redirigé).

Fin du rendu : 2026-09-23T09:38:21Z. Verdict **PASS** ; corrections : liste fermée VIDE. sha256 du fichier entier : dans
`F:\tmp\g2-ukemiconc-1b\G2-1b.md.sha256` (un fichier ne peut pas porter son propre sha). Plus aucune écriture dans ce fichier après cette ligne.
