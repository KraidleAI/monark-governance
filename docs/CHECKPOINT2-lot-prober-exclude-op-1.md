# Checkpoint-2 — lot PROBER-EXCLUDE-OP-1 (validateur-humain Fable 5.1)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/cp2-prober/CP2.md` (sha256 3655921ed82dc408b6fe513c94c07d303328ebedf59a130e78fb64beaab3a659). Décision : ACCEPTE-AVEC-CORRECTIONS (C2-1..C2-6 ; C2-1..C2-3 appliquées AVANT la passe 4 : `dab6f91` — RUNBOOK 0.6 erratum + section passe 4 + ruling arbres, Sidecar gel HEAD_E3 (21 sha) + addendum D-n ; C2-4/C2-5 au G7 ; C2-6 résidu V4 consigné). Rejeu indépendant : E3 20/20, mutants propres V1-V3 tués, contrôles C-9-ter/C-6 exercés sur le raw réel, oracle E3 lu (7 × 0, test 42 vert dans la suite). Condition : CA-6/CA-8 valent avec le G2 consommé au G7.

---

# CHECKPOINT-2 — lot PROBER-EXCLUDE-OP-1 (course Ukemi U-4b-1b, étape 5, passe 4)

Validateur-humain `claude-fable-5-1` (R-1 conforme), effort high, contexte frais : artefacts seuls (jamais le fil du worker, jamais le G2
qui tourne en parallèle — CA-9). Rendu 2026-09-23T17:4xZ (début des mesures 17:29:30Z). Rejeux sous `F:\tmp\cp2-prober\` (AM-2 ter).
Anti-close : n-a (lot prober ETH / oracle Chainlink, pas un lot Bell ; aucune valeur de close manipulée).

## 1. Artefacts lus (chemins)
- Mon cp-1 : `F:\tmp\cp1-prober\CP1.md` (C-1..C-11).
- Rendu G1 : `F:\tmp\prober-lot\RENDU-G1.md` (sha256 `9e01ddc22dde68e0…`), `PLAN.md` (`fd7f7ab5dc8ddfba…`), `ADR-amendement.md`
  (`3819694df6ac7995…`), `lot.patch` (`2d89769a554ae450…`), `DELIVERED.sha256`, `R25.txt`, `A6-avant/apres/diff.txt`, `logs/mutants.log`,
  `logs/oracle-final2-summary.txt`, `tap/oracle-final2-test.tap`, `tap/export-public.rerun.tap`, `controls/controls-run.log`, `applycheck.log`.
- Rejeu E3 de l'orchestrateur : `F:\tmp\prober-lot\e3\guard.tap` (`9f68428783d7a822…`), `e3\oracle\codes.txt` (`2a9f205fe66af8b6…`),
  `e3\oracle\test.tap` (`8df0122e45cd89e7…`), `e3\run-oracle.sh`, `SHAS.txt`.
- Dépôt (lecture seule, `git show`) : `F:\Monark-wt-prober` @ `e487c2c` (propre), `F:\Monark-wt-ukemie3` @ `a722035` (propre, parent `b9964ee`),
  `F:\Monark` @ `17bf122` puis `89771ff` pendant l'avis (commit orchestrateur : D-n passe 4 au SIDECAR) ; RUNBOOK `:85-100`, `:359-475` ;
  SIDECAR `:34` + ligne D-n passe 4 ; CHANTIERS `:1240-1242` ; `u4-guard.mjs:55-100` ; `transport.ts:36-37` ; `rpc2.ts:28` (`operatorOf`).
- Hors dépôt (lecture seule) : `F:\course-ukemi\prober-cs.sh` (passe 3), `F:\course-ukemi\prober-p4.sh` (passe 4), raw passe 1
  `raws-passe1-keyless\…weth-2025-09-22.raw.json` + copie `run-1\` (les deux `c3954476eeb149c5…`, recomputé), `select\episode-selection.json`.

## 2. Mesures du validateur (Bash lecture seule dans les dépôts ; écritures sous `F:\tmp\cp2-prober\` uniquement)
- **M-1 sha livrés** : `git show e487c2c:` prober `03a80e2202903aaf…`, test `dc61087e03b9ca3f…` = `DELIVERED.sha256` ; `git diff a79a902 e487c2c`
  sha256 `2d89769a…` = `lot.patch` (diff byte-identique) ; commit = 2 fichiers, +143/−4.
- **M-2 arbre E3** : `a722035` parent unique `b9964ee` ; prober `03a80e22…` (identique à e487c2c, diff vide) ; test `a74b77c0…` (= prédiction de
  l'applycheck ; seul écart vs `dc61087e…` = hunk REVERT-1 `ca9fa55`, lignes 310-318, vérifié) ; **`rpc2.ts` `92577c5a…` = `b9964ee`** (quorum2 des
  passes 1-3). **Liste 0.6 (21 fichiers) à `a722035` vs `b9964ee` : 20 SAME + 1 DIFF (`u4-oracle-path.mjs` `4ed4c31e` vers `03a80e22`)** ; arbre de
  travail E3 == HEAD sur les 21 ; `require.resolve` des 3 paquets sous `F:\Monark-wt-ukemie3\` (0.5 OK sous E3).
- **M-3 rejeu indépendant** (copie `git archive a722035` vers `F:\tmp\cp2-prober\e3`, `npm ci --cache F:/tmp/npm-cache` exit 0, 283 paquets, TEMP sur F:) :
  `require.resolve` sous `F:\tmp\cp2-prober\e3\` (indépendant des worktrees) ; `node --test --test-timeout=120000 --test-force-exit --test-reporter=tap
  test/guard-scripts-u4.test.ts` sous ceinture `env -u` 8 variables : **20/20 pass, 0 fail** (`tap/guard-full.tap`) ; **mutants propres** (sur la copie,
  restauration byte-exacte, `logs/rejeu.log`) : V1 `>= 2` en `> 2` TUÉ (golden + e2_via_flags rouges) ; V2 `unknownAt >= 0` en `> 0` TUÉ (test (e)) ;
  V3 provenance `cliExcluded` TUÉ (a, c, e2_via_flags) ; **V4** (ensemble admissible calculé avec `budget.withChainstack` au lieu de `true`) **SURVIT** :
  sonde d'équivalence, ne change que `--exclude-operator chainstack` sans `--with-chainstack` (accepté comme no-op sur les pools, au lieu d'un refus) ;
  hors ligne passe 4 ; résidu déclaré, pas un défaut. Sha prober avant/après rejeu `03a80e22…` (= livré).
- **M-4 contrôles C-9-ter / C-6 rejoués VERBATIM** (`ADR-amendement.md` §B) sur le raw passe 1 réel (`controls-cp2.sh`, `logs/controls-cp2.log`) :
  C-9-ter exit 3 (`emode_ok:false`, `emode_raw_1:"object"`, `pools_ok:false` = pools passe 1) ; C-6 raw p1 contre lui-même exit 3 par `emode_1_hex:false`
  avec `updates/pre_b0_anchor/aggregator` égaux ET (sonde ajoutée) `usdt_prices` égal ; `p1_sha256_ok:true`. **CA-11 durci** : ordre des clés
  `provenance.endpoints` du PRODUCTEUR RÉEL = `["eth_call","eth_getLogs"]`, donc le `poolsOk` (JSON.stringify, sensible à l'ordre) de C-9-ter est
  branché sur l'artefact réel, pas seulement sur `good.raw.json` fabriqué. Raw passe 1 : `usdt_blocks: []`, `usdt_blocks_status:"omitted"`, 14 catégories
  e-mode toutes `{error:"NoQuorumError"}`, `calls:25`, `calls_by_operator` drpc 3 / nodies 16 / tenderly 3 / pocket 3 (concorde avec l'ADR §3).
- **M-5 oracle E3 (orchestrateur, lu)** : `codes.txt` HEAD `a722035`, 7 portes `exit=0` (17:29:44Z à 17:35:34Z) ; `test.tap` 1040 tests / 1038 pass /
  0 fail / 2 skipped ; `ok 868 export_public_no_governance_no_french` (test 42 VERT à E3 dans la suite complète : pas de rejeu isolé nécessaire) ;
  les 5 tests du lot `ok 887-891`, `ok 875 paid_leg…` (forme `b9964ee`). `guard.tap` E3 : 20/20. Oracle du worker à `a79a902` : 6 portes 0 + porte
  test 1109/1106/1 fail (test 42 EPERM `rmSync`, 734 s) puis rejeu isolé 2/2 vert ; item EXPORT-TEST42-EPERM-1 formé (CHANTIERS `:1242`).
- **M-6 A-6 / R-25** : `A6-diff.txt` vide ; 9 gelés CONCORDANCE prereg l.116-124 ; ADR-U4b `59e03d74` inchangé (aussi à `F:\Monark` HEAD) ;
  `u4-guard.mjs` `e3f5c70d` ; R-25 147 sur pathspec verbatim `ci.yml:65`.
- **M-7 mutants du worker** : `mutants.log` 11/11 KILLED byIntended, `restored_sha256` = `03a80e22…` après chacun, `golden_source_intact=true` ;
  M9 (comptage étiquettes) et M10/M11 (garde d'étiquette, borne `argv.length-1`) = mes C-5/C-11.
- **M-8 script passe 4** : `prober-p4.sh` diff vs `prober-cs.sh` (passe 3) = commentaires + arbre `F:\Monark-wt-ukemie3` avec garde HEAD `a722035`
  + propre + `--exclude-operator pocket.network` + noms de logs. Rien d'autre (« passe 3 + flag » tenu). `--max-calls 612`, `--max-ru 166882`,
  caps 612/612 : **la borne « chainstack au plus 51 » n'est PAS a priori** (c'est la clause post-hoc de C-6). `raws\` vide, aucun `.lock`.
- **M-9 docs** : SIDECAR D-n passe 4 écrite AVANT lancement (`89771ff`, 1 ligne) : 148 + 149, `<HEAD_E3>` = `a722035`, seul dérivé, `rpc2.ts` des
  passes 1-3, oracle E3 7 fois 0 + 20/20, script, pools écrits avec « exclusion PAR ÉTIQUETTE, nodies.app conservé », prédiction à l'octet vs
  `c3954476…` (updates/ancre/agrégateur, emode hex, 0 QuorumDisagreement, au plus 51), `excluded_operators`, clause négative, exécutant.
  **Non insérés à `F:\Monark` HEAD** : amendement ADR-U4b (grep 0), RUNBOOK passe 4 + contrôles (grep 0), valeur attendue 0.6 du RUNBOOK `:95`
  toujours `4ed4c31e`, étapes 6a-6d toujours `cd F:/Monark-wt-ukemie2`. La D-n cite `F:/tmp/prober-lot/controls/` pour C-9-ter/C-6.
- **M-10 fait annexe** : `F:\Monark` porte ` M test/export-public.test.ts` (apparu entre 17:29 et 17:33Z) : PAS de moi (aucune commande d'écriture
  dans un dépôt) ; travail orchestrateur/worker sur EXPORT-TEST42-EPERM-1 ; à ne replier ni dans `lot/prober-exclude-op-1` ni dans E3.

## 3. Application des corrections du cp-1 (C-1..C-11)
| C-n | État | Preuve |
|---|---|---|
| C-1 D-n passe 4 AVANT lancement | FAIT (`89771ff`) ; 3 précisions demandées (C2-2, C2-3) | M-9 |
| C-2 amendement ADR daté, tuyaux | RÉDIGÉ (`ADR-amendement.md` §A, tuyaux §2 entrée/sortie/état/test) ; insertion au G7 (C2-4) | M-9 |
| C-3 sha 0.6 dérivés énumérés | FAIT pour l'énumération (1 seul dérivé, mesuré identique par moi) ; **RUNBOOK 0.6 / étape 6 non réécrits** (C2-1) | M-2, M-9 |
| C-4 par étiquette, nodies.app conservé, pools écrits | FAIT (ADR §1/§4, RUNBOOK §B, D-n) ; test (a) asserte les pools | M-9, patch |
| C-5 garde par `operatorOf` | FAIT (`:199-203`) ; test (d) ; M9 tué ; V1 à moi tué | M-3, M-7 |
| C-6 condition n°1 à l'octet vs `c3954476…` | FAIT (contrôle C-6, D-n) ; rejoué par moi ; clause `usdt_prices` à ajouter (C2-2) | M-4 |
| C-7 items formés | FAIT (§A.8 : 4 items + HEAD_E3-TESTS-1, désormais CLOS par M-5) ; à porter au registre (C2-4) | ADR §8 |
| C-8 tests exécutent `run(argv)` | FAIT (5 tests = CLI réel, client gardé, ledger, raw ; seul `fetch` bouchonné) | patch, M-3 |
| C-9 MAST au PLAN | FAIT (PLAN addendum l.23, ADR §9) | PLAN |
| C-10 désambiguïsation `:294`, sources logs + ledger | FAIT (ADR §3, §5) | ADR |
| C-11 ensemble fermé | FAIT (`:190-196`) ; test (e) ; M10/M11 tués ; V2 à moi tué | M-3, M-7 |

## 4. Checklist livrable
- **CA-1** CONFORME : chaque critère du plan est falsifié par un test nommé + mutant (tableau §7 de l'ADR ; rejoué M-3).
- **CA-2** CONFORME, pas d'escalade : aucune décision de valeur nouvelle ; périmètre = le flag, 2 gardes, provenance, 5 tests ; dépense = acte 148 (b).
- **CA-3** CORRECTION (C2-1, C2-4) : ADR/RUNBOOK non insérés ; gates tenus (G1, puis G2 en parallèle du cp-2, puis G7 avant lancement, D-n avant lancement).
- **CA-4** CONFORME : fan-out G2 / cp-2 = indépendance de vérification (instances séparées) ; rejeu E3 = oracle non-LLM.
- **CA-5** CONFORME : MAST nommés avec contre-mesure (FM-1.2 A-6 ; FM-2.x docs ; FM-3.1 C-9-ter ; FM-3.3 composition + octet ; sélection de témoins = clause négative).
- **CA-6** CONFORME SOUS CONDITION : trace d'oracle = E3 7 fois 0 + 1040/1038/0 (M-5) + mon rejeu 20/20 ; **revue G2 non lue par moi** : l'acceptation
  ne vaut qu'AVEC le G2 rendu et consommé par le G7 (jamais l'un sans l'autre).
- **CA-7** CORRECTION (C2-4) : zéro « dû » nu dans le rendu ; HEAD_E3-TESTS-1 clos par les faits M-5 (à consigner) ; EXPORT-TEST42-EPERM-1 formé ; V4 résidu (C2-6).
- **CA-8** CONFORME SOUS CONDITION : générateur `claude-opus-5-5[1m]` déclaré (préfixe conforme décision 133) ; `error_origin` par déviation (D-1 plan ;
  écart d'énoncé « identiques » = plan) ; relecteur G2 distinct du générateur à confirmer par l'orchestrateur au journal (C2-5).
- **CA-9** CONFORME : rejeu imposé par le système (copie indépendante, `require.resolve` sous ma copie, sha recomputés, mutants propres, contrôles sur raw réel).
- **CA-10** CONFORME : aucun argument de vitesse ; lot 147 lignes ; acceptation fondée sur les rejeux.
- **CA-11 / durci** CONFORME : tuyau CLI, pools, `openU4GuardedClient`, ledger, raw EXÉCUTÉ par le test (a) depuis l'argv réel de la ligne passe 4
  (forme `prober-p4.sh`) ; tuyau provenance vers C-9-ter vérifié sur l'artefact réel du producteur (M-4) ; consommateur réel = passe 4 (script en place).
- **Anti-close** n-a.

## 5. DÉCISION : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée C2-1..C2-6 ; aucune correction de CODE ; aucune escalade)
- **C2-1 (docs RUNBOOK + SIDECAR, BLOQUANTE avant lancement)** : (i) valeur ATTENDUE pré-enregistrée 0.6 (RUNBOOK `:95`) : `u4-oracle-path.mjs`
  `4ed4c31e` devient `03a80e2202903aafeb096f58f4088c889b6630af3844a1a6b7f3ed06a0e8f6cf` à `<HEAD_E3>` (20 autres inchangées, `rpc2.ts` `92577c5a`).
  Précision (rectifiée après relecture de `:93-95`) : le contrôle MÉCANIQUE 0.6 compare `git show HEAD:$f` à l'arbre du même worktree et rend
  `OK 03a80e22` sur `a722035` (mesuré : 21 WT_OK) ; la clause STOP ne porte que sur les 9 gelés, tous SAME. Ce qui est faux au lancement est la
  valeur attendue écrite, et `:95` exige lui-même que les 21 soient re-mesurés « et consignés à la ligne SIDECAR gel » : la D-n `89771ff` dit
  « seul dérivé : le prober » SANS en écrire le sha (grep `03a80e22` = 0 au SIDECAR et au RUNBOOK) ; (ii) ligne SIDECAR « gel `<HEAD_E3>` =
  `a722035` » portant les 21 valeurs mesurées sur E3 (M-2 : 20 SAME + prober `03a80e22…` en entier) et `<EXEC_TREE_E3>` = `F:Monark-wt-ukemie3` ;
  (iii) RUNBOOK `:15` (règle générale `cd <EXEC_TREE_E2>` pour les étapes 2c-bis, 4, 5, 6) et étapes 6a-6d `cd F:/Monark-wt-ukemie2` : réécrire
  « étape 5 (passe 4) à `<EXEC_TREE_E3>` » et, pour 6, soit `F:/Monark-wt-ukemie3`, soit ruling écrit « 6 reste à E2 (labeler/hyp n'importent pas le
  prober) » : l'un des deux, écrit ; (iv) section « Étape 5 — passe 4 » = `ADR-amendement.md` §B (sha `3819694df6ac7995…`) insérée, contrôles
  C-9-ter/C-6 DANS le dépôt.
- **C2-2 (D-n / contrôles, BLOQUANTE avant lancement)** : la D-n cite `F:/tmp/prober-lot/controls/` : pointer sur le RUNBOOK (C2-1 iv) ; ajouter à C-6
  la clause `same("usdt_prices")` (passe 1 `usdt_blocks:[]`, coût nul, ferme le champ copié par le réducteur) ; écrire que la borne a priori est
  `--max-calls 612` / `--max-ru 166882` (ligne passe 3 tenue) et que « au plus 51 » est la clause POST-HOC de C-6 ; citer les sources exactes
  (logs passes 1-3 + ledger l.11-21) dans la D-n.
- **C2-3 (D-n, BLOQUANTE avant lancement)** : borner la clause « NoQuorum par banc tenderly (NonJsonBody) : une seule relance différée » : admissible
  SEULEMENT si aucun raw n'a été écrit (FATAL exit 1 avant toute valeur), ligne strictement identique, une fois, datée au Sidecar avec les lignes
  de ledger ; tout run ayant produit un raw avec une différence = STOP sans relance (clause négative du cp-1 inchangée : aucune exclusion supplémentaire).
- **C2-4 (G7)** : insérer l'amendement ADR-U4b (§A, append seul ; ADR `59e03d74` ne change que par append) ; porter au registre, datés : PROBER-EMODE-
  FAILCLOSED-1 (docs faites, code re-formé), BENCH-PER-METHOD-1 (re-formé), OBS-1 (ruling report motivé), R-U-2 (déclenché, borne, clôture),
  **HEAD_E3-TESTS-1 = CLOS** (E3 20/20 + oracle 7 fois 0, chemins TAP), EXPORT-TEST42-EPERM-1.
- **C2-5 (journal de provenance, G7)** : consigner générateur `claude-opus-5-5[1m]` / relecteur G2 (modèle résolu, instance séparée) / validateur
  `claude-fable-5-1` ; `error_origin` : D-1 = plan, écart d'énoncé « fichier de test identique » = plan ; ` M test/export-public.test.ts` sur
  `F:\Monark` = travail séparé, hors lot et hors E3.
- **C2-6 (résidu, non bloquant)** : V4 survivant (ensemble admissible indépendant du switch) consigné comme résidu ; aucun changement de code en course.

## 6. Ce que doit contenir la D-n (réponse à la question de l'orchestrateur) et état
Contenu requis : ligne exacte (passe 3 + flag) ; `<HEAD_E3>` `a722035` + `<EXEC_TREE_E3>` `F:\Monark-wt-ukemie3` ; 0.6 = 21 entrées, 1 dérivé ; 0.5
résolu sous E3 ; 148 (b) + 149 ; exclusion par étiquette, nodies.app conservé, deux pools ; prédiction = C-6 exit 0 ET C-9-ter exit 0 (environ 17 appels,
au plus 51 post-hoc) ; clause négative ; sources = logs passes 1-3 + ledger l.11-21 ; HEAD_E3-TESTS-1 avec chemins TAP ; exécutant + modèle.
**Présent** dans `89771ff` : tout sauf (a) le chemin des contrôles dans le dépôt, (b) `usdt_prices`, (c) la nature post-hoc du 51, (d) la borne de la
relance différée, (e) les sources logs/ledger explicites : C2-2 / C2-3.

## 7. Preuve AM-2 / AM-2 ter
Écritures : `F:\tmp\cp2-prober\` seulement (`e3\` copie archive + `node_modules`, `rejeu.sh`, `controls-cp2.sh`, `tap\`, `logs\`, `prober.golden`,
`heredoc-test.txt`, `CP2.md`). Dépôts : sha256 blob HEAD = arbre de travail avant ET après mes rejeux : wt-prober prober `03a80e22` / test `dc61087e` /
rpc2 `38210129` ; wt-ukemie3 prober `03a80e22` / test `a74b77c0` / rpc2 `92577c5a` ; `git status --short | wc -l` : wt-prober 0, wt-ukemie3 0
(17:29:30Z et 17:44:10Z, re-mesuré à la fin, voir dernière ligne) ; `F:\Monark` 1 ligne (` M test/export-public.test.ts`, pas de moi ; HEAD `17bf122`
puis `89771ff` par l'orchestrateur). Aucun `git` d'écriture, aucune installation globale (`npm ci` dans la copie, cache `F:/tmp/npm-cache`), aucune
clé lue (ceinture `env -u` sur chaque exécution).

## 8. Ligne AM-1
Attrapé : RUNBOOK 0.6 non amendé (`4ed4c31e` attendu, donc STOP documenté au lancement E3) ; D-n pointant sur `F:/tmp` pour les contrôles ; borne 51
post-hoc présentée comme borne ; clause de relance différée non bornée ; `usdt_prices` absent de C-6 ; V4 (sonde) non couvert. Confirmé par mes
rejeux : 20/20, 3/3 mutants propres tués, contrôles sur raw réel, ordre des clés du producteur. Manqués : à signaler a posteriori par l'orchestrateur. Rectifié en cours d'avis (advisor) : la justification initiale de C2-1 (i) « ECART = STOP mécanique » était surestimée ; la correction reste bloquante pour la raison écrite (valeur attendue + consignation des 21 sha exigée par :95).

Modèle résolu : `claude-fable-5-1`.
Re-mesure finale (2026-09-23T17:50:34Z) : wt-prober status 0, wt-ukemie3 status 0 (voir ci-dessus).

== F:Monark : `99c25cc` propre à 17:50:34Z (commits orchestrateur 8d25f7d/99c25cc = test/export-public.test.ts seul, +4/-2 ; ni scripts/census/ ni test/guard-scripts-u4.test.ts ; ADR-U4b et RUNBOOK toujours sans PROBER-EXCLUDE-OP-1, grep 0 à 99c25cc).
