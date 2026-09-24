# CHECKPOINT-1 — PLAN — lot GARDE-HELIUS — AVIS PERSISTÉ (reconstruction) + carte du pli

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé).
**Provenance** : RÉDACTEUR du pli, `claude-opus-4-8[1m]`, 2026-09-21 ; réviseur = orchestrateur (R-21) ; advisor intégré consulté 1×.
**R-20** : aucun commit, aucun workflow, aucun fichier du dépôt modifié. **AUCUN réseau, aucun secret lu.**
**Verdict du checkpoint-1 (record persisté [lu] `CHANTIERS.md:486`)** : **ACCEPTE-AVEC-CORRECTIONS (14 corrections)** par le validateur
`claude-fable-5-1`, + **décision investisseur 115** (2026-09-21 ~07:10 UTC). Plan plié remplaçant :
`F:\tmp\garde-helius\pli-cp1\G0-lot-garde-helius.md`.

---

## 0. Incident d'entrée — provenance de CETTE reconstruction (item formé, jamais dette nue)

Le verbatim de l'avis validateur désigné par la mission —
`F:\tmp\claude\F--Monark\a7659644-0519-4943-8b82-d50d7405fe34\tasks\a5b427a48e37fb967.output`, section
« CHECKPOINT-1 — PLAN — lot GARDE-HELIUS » — est **de taille 0 octet** (vérifié : Read « file exists but the contents are empty » ;
`find … -type f -printf "%s"` ne le liste pas parmi les 50 plus grosses sorties de tâche ⇒ 0 o ; le répertoire de tâches ne se grep pas
globalement — chaque sortie se lit une par une). **Ce document N'EST DONC PAS l'avis verbatim** : c'est une **reconstruction** du pli à
partir de trois sources [lu] de première main :

1. le **brief d'orchestrateur** de cette mission (dictée détaillée C-1..C-14 avec `fichier:ligne` + décisions 112-115) ;
2. **`CHANTIERS.md:486-489`** (record persisté du checkpoint-1 : 14 corrections résumées, décision 115, C-14 FAIT) + `:476-480`
   (décisions 112-114) ;
3. le **plan original** `F:\tmp\garde-helius\G0-lot-garde-helius.md` (lu) + chaque **`fichier:ligne` rouvert dans le dépôt** (lecture seule).

**Choix méthodologique (assumé, R-21)** : ne pas fouiller ~50 sorties de tâche non liées (discipline « lis uniquement cet avis ») ; le brief
+ CHANTIERS + le dépôt suffisent à un pli vérifiable, chaque affirmation portant son `fichier:ligne`. **Item formé à déclencheur** : si
`a5b427a48e37fb967.output` est restauré et son verbatim diverge de cette reconstruction, **l'orchestrateur substitue le verbatim** et
re-plie l'écart. Aucune affirmation d'ingénierie ici n'est de seconde main non signalée.

**Statut des rulings** : Q1/Q3/Q4/Q5/Q6 sont **[ancrés]** (CHANTIERS:480/487 + décisions) ; **Q2 et Q7 sont [confirmés par acceptation]**
— le verdict ACCEPTE-AVEC-CORRECTIONS n'inscrit aucune des 14 corrections contre eux, donc le choix du plan tient (ce n'est PAS « le
validateur a confirmé » : c'est « aucune correction ne l'a renversé »).

---

## 1. Table correction → section du plan plié + ancrage `fichier:ligne` [lu]

| # | Correction (dictée orchestrateur / `CHANTIERS.md:487`) | Section(s) du plan plié | Ancrage [lu] rouvert |
|---|---|---|---|
| **C-1** | Inventaire COMPLET des consommateurs payants | §1, §2.0 (table), §5, §9 | `universe-cli.ts:77` (ledger `join(out,"budget.json")`), `:109/:237/:251` (`CHAINSTACK_SOLANA_URL` ×3), `:121-122` (retry sous tick), `universe.ts:113` (`withUniverseRetry`), `:147` (`readPriorCalls` absent⇒0), `ethereum.ts:60-78` (`bellEthCall` fetch :64), `collect.ts:638` (`liveEthSwaps` non budgété), `close.ts:176/191`, `-iii-a1-bis` = `CHANTIERS.md:474` |
| **C-2** | CI grep : allowlist exacte + déclencheur de retrait ; couvre `fetch(`/`node:http(s)`/`undici`/`child_process` + `process.env.<clé>` hors client ; `exports` map ; reformulation « impossible par l'API + refusé par la CI » | §1 (couches i/ii), §2.0, §6-T3/T4 | 7 `fetch(` [lu grep `apps/bell/src`] ; 0 `child_process|undici|node:http` ; allowlist `sentinel/src/rpc.ts:52-77` (`CHAINSTACK_ETH_URL`) ; calque `packages/contracts/test/forbidden-keys.test.ts` |
| **C-3** | Transport injecté = `(label, method, params)`, jamais l'URL ; test espion | §2.1 (couture), §6-T1 | seam `makeClient(env, ledger, {transport})` ; stubs `(u,m,p)` nus (`operators.ts:30`) |
| **C-4** | UNE couche de retry (le client ne retry pas ; un `call` = une tentative ; retry chez l'appelant) + mutant « retry emboîté » | §2.2 (INVERSION), §6-T5 | `withRetry` `collect.ts:318`, `withUniverseRetry` `universe.ts:113` ; réordonne `universe-cli.ts:121-122` ; scan `RetryFn` (double couche évitée) |
| **C-5** | Liste FERMÉE des tests, chaque mutant nomme un test existant | §6 (T1..T18 + table mutants) | 12 mutants → chacun un Tn de la liste fermée |
| **C-6** | Tests 3/5 depuis le ledger produit par `runMain(argv,deps)` stubbé ; sous-commande `reconcile --before --after --cycle` servie, ligne `reconciled` chaînée | §4, §6-T6/T16/T17, §2.1 (cli.ts) | seam `runMain` `collect.ts:577` ; `main()` shell `:676-677` |
| **C-7** | Unité = requêtes par méthode (crédits dérivés) ; délai de consolidation ; « aucun autre process MONARK entre before/after » ; rollover ⇒ NO-GO ; 1ʳᵉ course Chainstack = étalonnage RU | §3.2, §4 | `record.ts:294` (RU/call undocumented) ; `rebase-crosscheck.ts:55-56` (crédits gTfA/getTx) |
| **C-8** | Parent `HELIUS_LEDGER_DIR` pré-existant (throw sinon) ; `HELIUS_LEDGER_DIR`/`HELIUS_CYCLE_ID`/`--cycle-floor` REQUIS avant tout réseau ; `floor > CAP` ⇒ throw | §3.1, §3.4, §6-T11/T12 | calque `--max-calls` requis `universe-cli.ts:70,72` |
| **C-9** | Verrou `openSync(…,"wx")` + sous-commande `unlock` chaînée + tests | §3.3, §6-T13/T14 | `CHANTIERS.md:427` (« cap Chainstack = un rôle à la fois »), `:452` (8 agents) ; `fs.openSync` flag `wx` = création exclusive |
| **C-10** | `--method-caps` REQUIS sans défaut | §3.4-2, §6-T12 | calque `collect.ts:437-439` (`--max-calls` requis) |
| **C-11** | ADR `docs/ADR-GARDE-HELIUS-client-budgete-unique.md` | §12 | convention DÉPÔT `docs/adr/` : 33 ADR [lu glob], zéro `ADR-*.md` racine ⇒ plié `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` (chaîne littérale du brief notée) |
| **C-12** | Scission 1a-i/1a-ii/1b-i/1b-ii ; projection R-25 recomptée avec le churn des ~20 listes de providers | §8 (5 sous-lots) | `[Pp]roviders` = 190 occ / 26 fichiers [lu grep] ; `ci.yml:65` (pathspec), `:43` (1 205) |
| **C-13** | Mutant `instanceof` couvrant `universe.ts:96 Fatal403Error` ; 9 fichiers d'import listés | §2.3, §6-T18, §9 | `universe.ts:96 Fatal403Error extends BudgetExceededError` ; 9 fichiers source [lu grep] : universe, quorum, collect, rebase-scan, rebase-crosscheck, rebase-produce, discover, rpc2, record |
| **C-14** | Tarif Helius 1 cr épinglé au G1 par lecture sur place (fichier FAITS daté, acte orchestrateur) | §3.2 | `F:\PRODUITS\etude-2026-09-21\helius-audit\FAITS-tarification-helius-2026-09-21.md` (`CHANTIERS.md:489`) + `rebase-crosscheck.ts:55-56` ; mention [2nd] RETIRÉE |

**Décisions investisseur foldées** : 112 (Helius `CYCLE_CAP=8 000 000`) → §3.4-3 ; 113 (`tol=max(50cr,0,5%)`, borne dure) → §4 ;
114 (`HELIUS_LEDGER_DIR=F:\monark-ledger\`) → §3.1 ; **115 (Chainstack `CYCLE_CAP_RU=16 000 000` ; Databento/Polygon requêtes/cycle au G1)**
→ §3.4-3. Refs `CHANTIERS.md:477-479,488`.

---

## 2. Rulings Q1..Q7 — statut et fold

| Ruling | Statut | Décision foldée | Section |
|---|---|---|---|
| **Q1** verrou vs multi-fichiers | [ancré] `CHANTIERS:487` | verrou `openSync("wx")` + `unlock` servi | §3.3 |
| **Q2** méthode hors table ⇒ refus | [confirmé par acceptation] | refus fail-closed (renforcé C-14) | §3.2, T15 |
| **Q3** monolithique vs scission | [ancré] `CHANTIERS:487` | scission d'emblée 1a-i/1a-ii/1b-i/1b-ii (supersède déclencheur >1000) | §8 |
| **Q4** entrées requises fail-closed | [ancré] C-8/C-10 | oui + `--method-caps` | §3.1, §3.4, T12 |
| **Q5** tarif scopé-opérateur | [ancré] + raffiné par 115 | Helius table / Chainstack RU / Databento-Polygon req / keyless 0 | §3.2, §3.4-3 |
| **Q6** ordre `-b3d-b1a` avant 1a | [ancré] `CHANTIERS:480` | dépendance dure confirmée | §5 |
| **Q7** string branchée vs objet | [confirmé par acceptation] | `OperatorLabel` string branchée (churn R-25 maîtrisé) | §2.1, §8 |

---

## 3. Points NON pliés / à trancher par l'orchestrateur (formés, à déclencheur — jamais dette nue)

1. **Verbatim validateur indisponible** — `a5b427a48e37fb967.output` = 0 o. Reconstruction depuis brief + `CHANTIERS.md:486-489` + dépôt.
   *Déclencheur* : restauration du verbatim ⇒ l'orchestrateur compare et substitue tout écart. **Q2/Q7 étant « confirmés par acceptation »,
   c'est là que le verbatim, s'il porte une exigence explicite, changerait le plus le pli.**
2. **Chemin ADR (C-11)** — le brief et `CHANTIERS.md:487` écrivent « docs/ADR-*.md » (racine `docs/`) ; la convention dépôt est `docs/adr/`
   (33/33 [lu]). Plié sur `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md`. *Déclencheur* : ruling d'un mot si l'orchestrateur vise
   littéralement la racine `docs/`.
3. **Chainstack RU/méthode non documenté (C-7, décision 115, R-21)** — le cap `CYCLE_CAP_RU = 16 000 000` **n'est pas évaluable par appel**
   avant étalonnage. Plié : 1ʳᵉ course Chainstack bornée par requêtes (`--max-calls`) seul, cap RU « non-applicable-cette-course » déclaré ;
   étalonnage ⇒ modèle RU/méthode ⇒ cap RU dès la course 2. *Déclencheur* : 1ʳᵉ course Chainstack (étalonnage).
4. **Quotas Databento/Polygon (décision 115)** — plafond « requêtes par cycle » chiffré **au G1** depuis les quotas **lus sur place**.
   *Déclencheur* : lecture orchestrateur des quotas (acte orchestrateur, jamais deviné).
5. **`-iii-a1-bis` (C-1)** — lot déjà lancé (`CHANTIERS.md:474`) ; hérite le H-B de `universe-cli.ts:121` s'il copie le chemin universe.
   *Déclencheur* : soit il consomme `@monark/rpc-guard` (1b), soit gel explicite jusqu'à la migration. Propriétaire orchestrateur.
6. **Projections R-25 des 5 sous-lots** — **[à mesurer]** au G1 (méthode : `ci.yml:65` pathspec × `ins+del`). Les fourchettes du §8 sont des
   estimations ; aucune n'est présentée comme mesure. *Déclencheur* : mesure du diff G1 par sous-lot.
7. **RU/req et crédits « 1,0 » du plan original** — le tarif Helius est désormais [lu] (FAITS, C-14) ; les [2nd] restants signalés (floor
   60 938, plan 10 M — `CHANTIERS.md:424,388`, lectures orchestrateur). Aucun chiffre de seconde main présenté comme mesure de première main.

**Aucun papier introuvable** : plan interne ; sources = fichiers du dépôt [lu] + FAITS orchestrateur daté. Aucune demande de procurement due.

---

## 4. Empreintes (à recomputer par l'orchestrateur — vérification indépendante)

Voir la section « sha256 » du rendu final du RÉDACTEUR (calculées par Bash après écriture des deux fichiers). L'orchestrateur recompute
`sha256sum F:\tmp\garde-helius\pli-cp1\*.md` et compare — la reproductibilité est la preuve (R-21).
