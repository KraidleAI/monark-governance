# G0 — Sprint backlog lot **GARDE-HELIUS** (client budgété unique + ledger de cycle durable + rapprochement dashboard)

**Rôle** : RÉDACTEUR du G0 (PLAN, AUCUN code, AUCUN réseau). **Bloquant AVANT toute course Bell** (item I-3 du
rapprochement HELIUS-1, `CHANTIERS.md:446`). **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`
conforme, effort max ; Opus 5 banni, non utilisé).
**Provenance** : modèle épinglé `claude-opus-4-8[1m]`, 2026-09-21, contexte = plan de garde rendant HELIUS-1
non-reproductible ; réviseur = orchestrateur (R-21, vérification adversariale avant consommation) ; advisor intégré
consulté une fois avant rédaction (8 corrections foldées, §annotées `[adv-n]`). **R-20** : aucun commit, aucun workflow,
aucun fichier du dépôt modifié — écriture unique hors dépôt `F:\tmp\garde-helius\G0-lot-garde-helius.md`.
**AUCUN appel réseau. Aucun secret lu** : aucun fichier `.env*`/`*secret*`/config de service ouvert ; aucune URL à clé
recopiée ; `F:\Monark` et `F:\Monark-wt-b3db1a` ouverts en LECTURE seule.

## 0. Niveaux de preuve (doc 03)
- **[lu]** = lu de première main dans un fichier du dépôt à `fichier:ligne` (vérifiable par l'orchestrateur).
- **[2nd]** = chiffre lu dans un document (CHANTIERS, RAPPROCHEMENT, dashboard rapporté par l'orchestrateur), pas de
  première main — signalé comme tel, jamais présenté comme mesure.
- **[à mesurer]** = projection/estimation de ce G0 (ex. R-25), à confirmer au G1 par mesure.

---

## 1. Objet, cause racine, et ce que « IMPOSSIBLE » veut dire honnêtement [adv-1]

**Objet** : rendre non-reproductible l'incident HELIUS-1 — résidu **≈ 4 963 requêtes `getTransactionsForAddress`
`full` ≈ 49 630 crédits** (≈ 81 % du cycle), mono-méthode, émis par des `.mjs` de brouillon **hors de la garde du
dépôt** (`F:\tmp\bell-b3a-2\*.mjs`). Cause racine PROUVÉE [2nd, `RAPPROCHEMENT-appel-par-appel.md` §5.1, fichier:ligne] :
ledger « reset-on-missing » (`course-probe.mjs:35`, `course-bodies.mjs:36`, `authority-probe.mjs:19`,
`course-hybrid.mjs:23`), `throw BudgetExceeded` RETIRÉ (`authority-probe.mjs:25`, `course-hybrid.mjs:29`),
`MAX_PAGES || Infinity` (`course-bodies.mjs:29`). La garde du dépôt fonctionne (E9 : 166 gTfA bornés sous
`max_calls:300`, [2nd] `rebase-produce-report.json`). **Le défaut n'est pas dans `collect.ts` — il est dans
l'existence d'un chemin réseau PARALLÈLE non gardé.**

**Ce que la garde peut rendre littéralement impossible, et ce qu'elle ne peut que rendre visible** (à écrire ainsi,
R-21 — ne pas sur-promettre) :
- **Couche (i) CODE — impossible via le dépôt.** Aucun symbole exporté ne rend une URL d'endpoint PAYANT.
  L'API du client devient `call(handle, method, params)` où `handle` est un **label d'opérateur** (jamais une URL) ;
  `solanaEndpoints()` (aujourd'hui exporté et rendant l'URL — `apps/bell/src/rpc.ts:21-24`, **la porte** ouverte à
  `course-probe.mjs:31`/`shape-probe.mjs:16`) cesse d'être exporté / ne rend que des handles. Le nom de la variable
  d'env portant la clé (`BELL_SOLANA_RPC`, `CHAINSTACK_ETH_URL`) n'apparaît que dans **un seul module** (le client).
  Un `.mjs` qui `import(@monark/rpc-guard)` **ne reçoit jamais l'URL** — il ne peut qu'appeler `call(handle,…)`, qui
  est budgété + ledgeré.
- **Couche (ii) CI — impossible via le dépôt.** Test non-LLM (grep, calque `no_secret_in_repo`) : tout `fetch(` OU
  toute mention du nom de la variable d'env-clé **hors du module client** = ROUGE.
- **Couche (iii) DÉTECTION — impossible à CACHER (pas à empêcher).** Un `.mjs` peut toujours lire `process.env` de
  lui-même — aucun code du dépôt ne l'en empêche. Ce qui l'attrape : le **floor de cycle épinglé au dashboard** +
  le **rapprochement asymétrique** (§4) rendent toute consommation hors-ledger visible en un cycle.

**Formulation exacte pour le G7 / le validateur** : (i)+(ii) = « impossible **par le dépôt** » ; (iii) = « impossible
à **dissimuler** ». La garde NE prétend PAS empêcher un opérateur humain de lire `process.env` dans un script écrit à
la main hors dépôt — elle prétend qu'un tel script est (a) sans endpoint via l'API, (b) refusé par la CI s'il entre au
dépôt, (c) détecté au rapprochement.

---

## 2. Architecture — UN client budgété unique, seul détenteur des endpoints [tâche (1)]

**Nouveau paquet `@monark/rpc-guard`** (`packages/rpc-guard/`, convention workspaces `@monark/*` [lu]
`package.json:"workspaces"`, `tsconfig.json:"include" packages/*/src`). Il factorise ce qui est aujourd'hui
**dupliqué** en deux `makeBudgetedCall` divergents :

| Aujourd'hui (dupliqué) | Bell | Ukemi |
|---|---|---|
| primitive budgétée | `apps/bell/src/collect.ts:297 makeBudgetedCall` [lu] | `apps/sentinel/src/ukemi/record.ts:142 makeBudgetedCall` [lu] |
| **compte les retries ?** | **OUI** (`withRetry` enveloppe le call budgété — `collect.ts:365`, le tick est AU-DESSUS) [lu] | **NON** (retry INTERNE à `makeDefaultCall:87-97`, le tick est AU-DESSUS de la boucle ⇒ 1 unité pour R+1 fetch = H-B) [lu `record.ts:142-155`, défaut nommé `docs/G0-lot-u4b.md:190`] |
| persistance cumulative | budget.json **DANS `--out`** (`readPriorCalls(out)` — `rebase-crosscheck.ts:403-404`) [lu] | **aucune** (`byOperator/byMethod` en mémoire seule, `record.ts:154`) [lu] |
| `BudgetExceededError` | `apps/bell/src/quorum.ts:24` [lu] | `apps/sentinel/src/ukemi/rpc2.ts` (re-jeté par 3 gardes) [2nd `record.ts:17,137-141`] |
| `operatorLabel`/`scrubUrls` | `providerOf`/`operatorOf` (`operators.ts`) | `record.ts:33 scrubUrls`, `:39 operatorLabel` [lu] |

**API du client (couture, injectable, offline-testable)** :
```
// packages/rpc-guard/src/client.ts  (types indicatifs — le G1 fige les signatures)
type OperatorLabel = string & { readonly __brand: "OperatorLabel" }; // un LABEL branché (providerOf/operatorLabel) ; JAMAIS l'URL
interface BudgetedClient {
  operators(): readonly OperatorLabel[];             // les opérateurs (labels), résolus de l'env EN INTERNE
  call(op: OperatorLabel, method: string, params: readonly unknown[]): Promise<unknown>; // RPC budgété + ledgeré + retry INTERNE
  tick(op: OperatorLabel, kind: string): void;       // lecture PAYANTE non-RPC (Databento/Polygon GET) — tentative comptée, C-G2-7
  spent(): { attempts: number; credits: number };    // état du RUN (le prior de cycle vit dans le ledger)
}
function makeClient(env, ledger, opts): BudgetedClient // le SEUL endroit où l'URL/clé PAYANTE est résolue
```
**Label branché, pas objet** [adv-5] : `OperatorLabel = string branded` (le label, jamais l'URL) ⇒ les stubs de test
existants `(u, m, p)` (déjà des noms nus — `quorum.ts`, `operators.ts:30` « or a test-double bare name » [lu])
**compilent inchangés** ; seul le client mappe label→URL. C'est ce qui maîtrise le churn R-25 de 1b (§8).
- **Endpoint résolu de l'env EN INTERNE**, jamais rendu. Le handle ne porte que `label` ; l'URL est un champ privé
  jamais sérialisé (calque hygiène clé `collect.ts:8-9`, `record.ts:29-41 scrubUrls`). [tâche (1)]
- **`quorum2` migre de `(providers: string[], call(url,…))` vers `(ops: OperatorLabel[], call(op,…))`** :
  la distinctness reste par **opérateur** (`operatorOf`/`operatorLabel` sur le label — `quorum.ts:84`,
  `operators.ts:30`, C-9), l'URL disparaît de `quorum2`, `signaturesUntil`, `scanFullMint`, `buildSolanaSymbol`.
- **Retry INTERNE au client** (chaque `fetch` = une tentative = un tick — motif `docs/G0-lot-u4b.md:193`), pour que
  Bell (déjà correct) ET Ukemi (H-B) comptent les tentatives HTTP de façon uniforme et robuste : le comptage ne dépend
  plus de l'endroit où l'appelant place `withRetry`. `BudgetExceededError` re-jeté **EN PREMIER** (jamais benché en
  `no_quorum` — `quorum.ts:90`, `rpc2.ts` 3 gardes). [tâche (2) « tentatives HTTP, retries inclus »]

**Identité de `BudgetExceededError` à travers la frontière du paquet [adv-3, fail-open critique]** : `instanceof
BudgetExceededError` est la garde porteuse en 6+ points (`quorum.ts:90`, `collect.ts:322,368,508`,
`rebase-crosscheck.ts:234,249`, `rpc2.ts` ×3). Si `@monark/rpc-guard` exporte une NOUVELLE classe et que les anciens
fichiers gardent la leur, un stop budget est attrapé comme faute transport ⇒ **fail-open silencieux, typecheck vert**.
**Décision de plan** : la classe canonique vit dans `@monark/rpc-guard` ET est **ré-exportée** depuis `bell/quorum.ts`
et `ukemi/rpc2.ts` (les imports existants ne changent pas d'identité). **Mutant dédié** (§6) : « stop budget attrapé
par le `instanceof` de `quorum2` ⇒ ROUGE ».

---

## 3. Ledger de CYCLE durable, hors dossier de travail [tâche (2)] et plafonds [tâche (3)]

### 3.1 Emplacement et non-réinitialisation [adv-7]
- **Chemin dérivé de l'ENV, JAMAIS `--out`** : `${HELIUS_LEDGER_DIR}/${HELIUS_CYCLE_ID}/` (ex.
  `%LOCALAPPDATA%/monark/rpc-cycle/`), hors dépôt (CA-11) et hors du dossier de travail nettoyé à chaque passe. C'est
  l'inverse EXACT du défaut §5.1-1 (nettoyer `F:/tmp/…` remet à zéro) et de `readPriorCalls(out)` (budget dans `--out`).
- **`HELIUS_CYCLE_ID` est ÉPINGLÉ, jamais calculé** [adv-7] : posé par l'orchestrateur depuis le libellé « current
  credit cycle » du dashboard (pas un mois calendaire deviné — sinon la dépense est mal-classée au passage de bord).
- **Plancher (floor) obligatoire** : `--cycle-floor <crédits>` (ou env) est **REQUIS pour toucher tout opérateur
  PAYANT** ; posé par l'orchestrateur depuis la **lecture sur place du dashboard AVANT la course** (aujourd'hui
  **60 938** [2nd, lecture orchestrateur `CHANTIERS.md:424`]). **Prior effectif de cycle = `max(floor, Σ ledger)`.**
  ⇒ supprimer/vider le fichier ledger ne rouvre PAS le budget : le floor tient (mutant §6 « delete ledger, rerun ⇒
  prior ≥ floor, jamais 0 »).

### 3.2 Format (append-only, chaîné, par méthode ET par opérateur ; tentatives primaires, crédits dérivés) [adv-5]
- **Fait primaire = la TENTATIVE** ; **crédits = dérivés** : `crédits = Σ tentatives_(op,méthode) × tarif(op,méthode)`.
  L'en-tête porte `tariff_version` (le tarif est figé en UN endroit, calque `rebase-crosscheck.ts:47-57`).
- **Tarif SCOPÉ PAR OPÉRATEUR** [adv-4, résout la contradiction « méthode inconnue ⇒ refus » vs lectures non-RPC] :
  - **Helius = table de MÉTHODE fermée.** `getTransactionsForAddress` = **10** [lu `rebase-crosscheck.ts:55`
    `CREDITS_PER_GTFA=10`], `getTransaction` = **1** [lu `:56` `CREDITS_PER_GET_TX=1`] ; `{getSignaturesForAddress,
    getAccountInfo, getTokenAccountsByOwner, getSlot}` = **1** [**2nd**, lecture dashboard cr/req = 1,0
    `RAPPROCHEMENT §1` — **à ÉPINGLER en constante au G1 avec cette provenance**]. **Méthode Helius ABSENTE de la
    table ⇒ fail-closed** (refus + résidu `unknown_method` ; un tarif 0 par défaut serait un fail-open de classe
    HELIUS-1).
  - **Chainstack / Databento / Polygon = TENTATIVES seules, aucun tarif par méthode** (RU non documenté,
    `record.ts:294` « RU/call undocumented, E-2 » ; ou GET non-RPC). Le modèle de coût (RU/méthode) est **déclaré au
    prereg** et sert au **rapprochement** (§4), pas au cap crédits.
  - **Keyless (Pocket, mainnet-beta) = crédit 0 PAR CLASSE D'OPÉRATEUR** (ce n'est PAS « méthode inconnue tarifée 0 »
    de §3.2 Helius) — tracé pour la complétude, jamais capé sur les crédits.
- **Chaîne** : chaque flush = une ligne chaînée `{prev_entry_sha256, cycle_id, tariff_version, by_op_method:
  {(op,method): attempts}, credits_derived, entry_sha256}` (calque `LedgerEntry`/`verifyLedgerChain`
  `rebase-crosscheck.ts` worktree :162-182 [lu]). `verifyLedgerChain` **rejoué au DÉMARRAGE** ; chaîne cassée ou
  fichier illisible ⇒ **fail-closed** (refuser de tirer), jamais lu comme 0 (calque `readPriorCalls` C-G2D-2
  `rebase-crosscheck.ts:399-419` [lu]).
- **Write-ahead** [adv-2] : la ligne de tentative est **appendée AVANT le `fetch`** (motif « persist the counter
  FIRST » `rebase-crosscheck.ts:459-463` [lu]) ⇒ un crash en vol **sur-compte**, jamais ne sous-compte ; une tentative
  **refusée par un plafond** reçoit sa propre ligne `refused` (le ledger porte la tentative même bloquée — critère
  tâche (5)).

### 3.3 Écrivains concurrents [adv-2, mesuré fondateur : 8 agents en vol, `CHANTIERS.md:452`]
HELIUS-1 a fait tourner des scripts **parallèles** sur un `budget.json` unique. Deux processus qui appendent des
lignes chaînées **forkent la chaîne**. **Décision de plan** : **verrou par `(cycle, opérateur)`** — un run qui veut
un opérateur payant prend le verrou ; **fail-closed si tenu** (aligné sur la règle existante « cap Chainstack = un
rôle à la fois », `CHANTIERS.md:427`). Sous verrou, « ré-évalué à chaque appel » = `prior_au_démarrage + run_jusqu'ici`
exactement. **Verrou périmé** [adv-7, mesuré `CHANTIERS.md:452` : 8 agents tués d'un coup] : le verrou porte `pid` +
horodatage ; après un crash il reste tenu ⇒ **fail-closed** (jamais un blocage éternel silencieux masqué) ; la
libération est un **acte EXPLICITE de l'orchestrateur, consigné**, jamais un vol automatique. (Alternative non
retenue : fichiers par-processus sous `<cycle>/` sommés au démarrage — plus complexe, pas de sérialisation d'écriture.)

### 3.4 Plafonds — trois couches, fail-closed [tâche (3)]
1. **Par run** : `--max-calls` (REQUIS, > 0 — `collect.ts:437-439` [lu]) + `--max-credits` (pire cas ×10, C-G2-1,
   `collect.ts:440-447` [lu]). **INCHANGÉS** [adv-5] : ne PAS redéfinir C-G2-1 (ses tests vivent dans le worktree
   b3db1a) ; le ledger tarif-exact est **additif**.
2. **Par méthode et par run** [tâche (3)] : `--max-credits-<méthode>` (ou une table `--method-caps`), gTfA bas par
   défaut — c'est le plafond qui aurait arrêté `course-bodies.mjs` (gTfA `full` illimité). Fail-closed, ligne `refused`.
3. **De cycle** [tâche (2)] : `prior_effectif + run_credits + tentative_pire_cas > CYCLE_CAP ⇒ BudgetExceededError`,
   **lu au démarrage ET ré-évalué à CHAQUE appel** (write-ahead ⇒ le check précède le fetch). `CYCLE_CAP` = question
   investisseur Q-INV-2 (§11).

---

## 4. Rapprochement au tableau de bord, pré-enregistré [tâche (4)] — critère de GO **ASYMÉTRIQUE** [adv-4]

Le ledger compte des **tentatives** (borne supérieure) ; le dashboard compte des **requêtes/ crédits facturés**.
**Qu'un 429/5xx soit facturé par Helius n'est PAS établi** ([2nd]/inconnu — H-B `RAPPROCHEMENT §5.2` « retries
facturés non comptés [inféré, insuffisant seul] »). Donc un critère **symétrique** `|dashboard − ledger| ≤ tol`
**cacherait un petit contournement à l'intérieur de la tolérance — exactement l'allure d'HELIUS-1 au départ**. D'où :

**Le rapprochement porte sur les DELTAS de la course, jamais les absolus** [adv-1, sinon le PREMIER run de ce lot
NO-GO par construction : dashboard = 60 938 + facturé, `ledger_run` = 0 + tentatives]. L'orchestrateur lit le
dashboard **AVANT** (`before`) et **APRÈS** (`after`) ; `Δdashboard = after − before`, par méthode. Le `ledger_run`
ne somme que les lignes `outcome = attempted` (les `refused` de §3.2 ne touchent pas le fournisseur).
- **BORNE DURE (aucune tolérance)** : `Δdashboard ≤ ledger_run`. `Δdashboard > ledger_run` = consommation **hors
  garde** ⇒ incident maintenu, pas de GO.
- **BANDE SOUPLE** : `ledger_run − Δdashboard ≤ tol` (sur-comptage attendu = retries non facturés + arrondis). `tol`
  chiffré = Q-INV-1 (§11).
- **Helius (crédits)** : `Δdashboard_crédits ≤ ledger_run_crédits` (dur) ET bande souple, par méthode (le dashboard
  ventile — `RAPPROCHEMENT §1`).
- **Chainstack (RU)** : `Σ tentatives_attempted_(méthode) × RU_par_méthode(modèle déclaré au prereg)` vs `Δdashboard`
  RU, `tol_RU` + modèle **déclarés au prereg** (E-2, `docs/G0-lot-u4b.md:195`).
- **Le floor (60 938) gouverne le CAP de cycle (§3.4-3), PAS le rapprochement** — ne pas confondre les deux plans.
- **Protocole (condition de GO HELIUS-1, `CHANTIERS.md:389-390`)** : l'orchestrateur **lit le dashboard sur place
  AVANT** (pose `floor` + `HELIUS_CYCLE_ID`) et **APRÈS** chaque course (rapprochement consigné). Pré-enregistré :
  `tol`, modèle RU, méthode de lecture — AVANT tout appel. GO conditionné à `Δdashboard ≤ ledger_run` (dur) ∧ bande souple.

---

## 5. Migration — les consommateurs consomment le client, pas un second compteur [tâche (6)]

- **Bell `collect.ts`** : `runMain` construit le client `@monark/rpc-guard` au lieu de `makeBudgetedCall` local ;
  `solProviders` (URLs) → `client.operators()` (handles) ; `budgeted.call` → `client.call`. **Supprimer** le
  `makeBudgetedCall` de `collect.ts:297-314` (un seul compteur). `budgetedDatabento`/`budgetedPolygon` (tick cash-close,
  `collect.ts:595-596`) migrent vers `client.tick(operatorLabel, kind)` — **tentatives seules, non-RPC, pas de tarif
  méthode** (§3.2).
- **Bell `rebase-crosscheck.ts`** : `runRebaseCrosscheckCli` consomme le client ; **le `callsByMethod` local
  (`rebase-crosscheck.ts:451-452` [lu]) est SUPPRIMÉ** au profit de la ventilation `(op,method)` du ledger (pas de
  second compteur). Le ledger de PAGE chaîné (scan) reste (c'est un artefact de correction distinct) ; le ledger de
  CYCLE est celui du client. Le `budget.json` de RUN (résumable,
  `readPriorCalls`) devient **DÉRIVÉ de `client.spent()`**, jamais un compteur indépendant (mission item 6 : « pas de
  second compteur »).
- **Base : construire sur le worktree `b3db1a`, pas sur `etude-suite`** [adv-6] : la version avancée de
  `rebase-crosscheck.ts` (branche `lot/t-1a-ii-b3d-b1a`, `F:\Monark-wt-b3db1a`, 50 631 o [lu]) porte déjà
  `retries_by_method`, `verifyLedgerChain`, `calls_by_method.{global,by_mint}`, `require_full_pages`, `RetryFn`
  (retry INTERNE au scan — `:212-216,569,588` [lu]). **GARDE-HELIUS dépend de la FUSION de `-b3d-b1a`** (sinon on
  reconstruit ces primitives). À déclarer comme dépendance dure d'ordre.
- **Ukemi (`record.ts`/`rpc2.ts`) — APRÈS POOL-RPC-1a** [adv-6] : ces fichiers sont en cours d'édition par POOL-RPC-1a
  (L-1..L-4, couture `runRecorder`, `docs/G0-lot-pool-rpc-1.md:38,110-118` [lu]). La migration Ukemi passe par la
  **couture `runRecorder(argv, deps)`** (extraction du corps de `record.ts:276 main()`, `pool-rpc-1.md:114` [lu]) et
  se fait **après la fusion de POOL-RPC-1a**. **`U-4b-0` (livrable §6/§8-ligne-0-1 de `docs/G0-lot-u4b.md`) est
  SUBSUMÉ** : il devient « consommer `@monark/rpc-guard` » (compter les tentatives, ledger persistant, cap, RU-vs-req),
  **pas une seconde implémentation** — à porter dans l'ADR-U4b D5 (item pour l'orchestrateur).

---

## 6. Test d'intégration NON-LLM + mutants (branchement, CA-11 durci) [tâche (5)]

Règle Branchement (CLAUDE.md) : une pièce n'est « built » que **BRANCHÉE** + couverte par un **test d'intégration
non-LLM** qui rejoue la composition de bout en bout. Le test EST la preuve de branchement (sinon `@monark/rpc-guard`
reste « upcoming »).

**Tests d'intégration (offline, fetch stubbé — calque `ukemi-record.test.ts:20-28` [2nd `pool-rpc-1.md:55,114`])** :
1. **`third_party_script_cannot_obtain_endpoint`** : un module tiers qui `import(@monark/rpc-guard)` n'obtient
   AUCUNE URL (aucun symbole exporté ne rend une URL ; `client.operators()` ne rend que des labels — `OperatorLabel`,
   string branchée, jamais une URL). Assertion structurelle + type.
2. **`fetch_only_inside_client` (CI grep, couche ii)** : à **1b**, portée = **`apps/bell/**` + `packages/**`** ;
   `git grep 'fetch('` et `git grep '<nom-var-env-clé>'` hors du module client ⇒ 0 (ROUGE sinon). **Allowlist déclarée
   à déclencheur** (des `fetch(` légitimes HORS périmètre 1b — sinon le grep serait ROUGE par construction, [adv-3]) :
   `apps/sentinel/src/rpc.ts` (pool Narabi SERVI, **keyless, hors périmètre**), `apps/sentinel/src/ukemi/record.ts:92`
   (**jusqu'à la fusion du lot 2**), `scripts/probe-narabi.mjs` (sonde externe). La portée **s'élargit à
   `apps/sentinel/**` + `scripts/**` au lot 2** (quand Ukemi consomme le client). Mutant qui reste : **« ajouter un
   `fetch(` dans `apps/bell/src` ⇒ ROUGE »**. Étend `no_secret_in_repo`.
3. **`over_cap_run_stops_and_ledger_carries_attempt`** : un run stubbé qui dépasse un plafond (run / méthode / cycle)
   s'ARRÊTE (`BudgetExceededError`, exit ≠ 0) ET le ledger porte la ligne `refused` (write-ahead).
4. **`ledger_persists_and_fail_closes`** : ledger chaîné, `verifyLedgerChain` vert ; illisible ⇒ throw (jamais 0).
5. **`reconcile_asymmetric`** : `Δdashboard ≤ ledger_run` dur ; bande souple ; un `Δdashboard > ledger_run` ⇒ NO-GO.

**Mutants (chacun DOIT rougir un test — sinon le test ne teste rien)** :
| Mutant | Défaut HELIUS-1 rejoué | Test qui doit rougir |
|---|---|---|
| **retry non compté** (tick au-dessus de la boucle) | H-B `record.ts:142-155` | `budget_counts_http_attempts` (R retries ⇒ budget = R+1) |
| **ledger reset-on-missing** (`existsSync?…:{0}`) | §5.1-1 `course-probe.mjs:35` | `delete ledger, rerun ⇒ prior ≥ floor, jamais 0` |
| **`throw` retiré** (le ledger n'ENREGISTRE que) | §5.1-2 `authority-probe.mjs:25` | `over_cap_run_stops` |
| **plafond ignoré / non fail-closed-first** (`MAX_PAGES||Infinity`) | §5.1-3 `course-bodies.mjs:29` | `method_cap_stops`, `cycle_cap_stops` |
| **ledger dans `--out`** (chemin sous le dossier de travail) | défaut `readPriorCalls(out)` | `ledger_path_is_outside_out_and_repo` |
| **stop budget benché en fault** (`instanceof` cassé au passage de paquet) | [adv-3] | `budget_stop_not_swallowed_by_quorum2` |
| **tarif 0 pour méthode inconnue** | fail-open de classe HELIUS-1 | `unknown_method_fail_closed` |

---

## 7. Tuyaux déclarés (entrée / sortie / état / test) [tâche (7), règle Branchement]

| Pièce | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test d'intégration (preuve) |
|---|---|---|---|---|
| `@monark/rpc-guard` client | env (endpoints, résolus en interne) ; `floor`/`cycle_id` (orchestrateur, du dashboard) | `collect.ts` (Bell), `record.ts` (Ukemi, post POOL-RPC-1a) | ledger de cycle `${HELIUS_LEDGER_DIR}/${HELIUS_CYCLE_ID}/*.jsonl` (hors dépôt) + verrou `(cycle,op)` | `third_party_script_cannot_obtain_endpoint`, `fetch_only_inside_client` |
| ledger de cycle | `client.call` (write-ahead, chaque tentative) | rapprochement orchestrateur (dashboard) ; `readPriorCycle` au démarrage | fichier jsonl chaîné env-dérivé | `ledger_persists_and_fail_closes`, `over_cap_run_stops_and_ledger_carries_attempt` |
| rapprochement | ledger (après) + dashboard (lecture orchestrateur avant/après) | verdict GO/NO-GO de course (orchestrateur) | consigné (CHANTIERS/PLI) | `reconcile_asymmetric` |
| migration Bell | `@monark/rpc-guard` | courses Bell (`--rebase-crosscheck`, `--rebase-produce`, `--discover`) GATÉES | code + budget.json de run (résumable, distinct du cycle) | suite Bell (`562/562` [2nd]) rejouée + intégration |

**Un tuyau absent = item formé à déclencheur, jamais un oubli** : le consommateur Ukemi est **UPCOMING** tant que
POOL-RPC-1a n'est pas fusionné (déclencheur : fusion POOL-RPC-1a). `@monark/rpc-guard` reste **UPCOMING** tant que
1b (Bell) ne le consomme pas par un chemin servi + test d'intégration.

---

## 8. Découpe R-25 [tâche (8)] — pathspec `STAT=` de `ci.yml:65`, plafond 1 205 (`ci.yml:43`)

**Mesuré [lu `ci.yml:65,69`]** : le pathspec compte `packages/*/src`+`packages/*/test` ET `apps/*/src` ; **exclut**
seulement `packages/*/docs/S2-*`, `docs/**/*.md` (glob), `package-lock.json`, fixtures de données. ⇒ le nouveau paquet
(src+test) et les éditions d'apps **comptent plein**. Métrique = `ins+del`. La doc `docs/G0-lot-garde-helius.md` sera
**exclue** (docs). Projections **[à mesurer]** (méthode : fichiers × lignes estimées ; à confirmer au G1) :

| Sous-lot | Contenu | Consommateur (branchement) | Projection `ins+del` | ≤ 1 205 ? |
|---|---|---|---|---|
| **1a — `@monark/rpc-guard`** | client handle-based + ledger de cycle (chaîne, verrou, write-ahead, tarif, caps) + `BudgetExceededError` canonique + tests + mutants | **AUCUN** ⇒ **upcoming** | **≈ 900–1 250** | **tendu** |
| **1b — migration Bell** | `collect.ts` (LABEL branché au lieu d'URL, suppr. `makeBudgetedCall` local), `quorum.ts` (signature `op: OperatorLabel`), `rpc.ts` (dé-exporter `solanaEndpoints`), `rebase-crosscheck.ts` (consomme, suppr. `callsByMethod`), ré-export `BudgetExceededError`, CI grep, test d'intégration **+ suite Bell `562/562` [2nd] comptée** | courses Bell GATÉES ⇒ **BRANCHÉ** | **≈ 700–1 050** | oui |
| **2 — migration Ukemi** (APRÈS POOL-RPC-1a) | `record.ts`/`rpc2.ts` consomment le client via `runRecorder`, suppr. `makeBudgetedCall` Ukemi, tests ; subsume U-4b-0 | courses Ukemi/U-4b GATÉES | **≈ 400–700** | oui |

- **1a est TENDU** : si la mesure G1 du diff 1a > ~1 000, **scinder 1a-i (client + `BudgetExceededError` + tests) /
  1a-ii (ledger de cycle : chaîne/verrou/write-ahead/tarif/caps + mutants)** — déclencheur chiffré déclaré ici, pas un
  oubli. **Le G7 du lot couvre 1a+1b** (le paquet sans consommateur n'est pas « built » — règle Branchement) [adv].
  **Aucun sous-lot ne clôt seul.**
- **Churn de test 1b maîtrisé par le LABEL branché** [adv-5] : `ci.yml:65` compte `apps/bell/test/*.test.ts` (seul
  `fixtures/series/**` est exclu) ⇒ changer `JsonRpcCall(url,…)` toucherait chaque stub des ~562 tests Bell et ferait
  exploser R-25. `OperatorLabel = string branded` (le label, pas l'URL) ⇒ stubs `(u, m, p)` **inchangés** (§2) ; la
  projection 1b est **tests inclus**. Sans ce choix : **CP1-Q7**.
- R-25 par unité revue (motif U-4a, `CHANTIERS.md:393`) : chaque sous-lot est une PR unitaire (R-25).

---

## 9. Risques MAST (checklist de risque résiduel, doc 06) [tâche (9)]

| Mode MAST | Risque ici | Atténuation (fichier/section) |
|---|---|---|
| **Secret-leak** | URL/clé dans un log/ledger/brut | handle sans URL (§2) ; `scrubUrls` (`record.ts:33`) ; ledger = `(label,method)` seuls ; CI grep (§6-2) |
| **Fail-open silencieux** | `instanceof BudgetExceededError` cassé au passage de paquet | classe canonique ré-exportée (§2) + mutant `budget_stop_not_swallowed_by_quorum2` |
| **Budget non attribué (HELIUS-1)** | retries non comptés / ledger volatil / cap absent | tentatives DANS la boucle, ledger de cycle durable + floor, 3 caps fail-closed, rapprochement asymétrique (§2-4) |
| **Step-repetition / concurrence** | écrivains parallèles forkent la chaîne | verrou `(cycle,op)` fail-closed (§3.3, aligné `CHANTIERS.md:427`) |
| **No-attempt-to-verify** | garde « built » sans preuve de branchement | test d'intégration non-LLM = la preuve ; upcoming sinon (§6-7) |
| **Information-withholding** | un tarif inconnu tarifé 0 par défaut | méthode hors table ⇒ fail-closed (§3.2) |
| **Spec-gaming / over-claim** | prétendre « impossible » au sens fort | scope en 3 couches honnêtes (§1), R-21 |
| **Incorrect-verification** | rapprochement symétrique cache un petit dépassement | GO asymétrique `Δdashboard ≤ ledger_run` dur (§4) |

---

## 10. Questions du checkpoint-1 (validateur) [tâche (10)]

- **CP1-Q1** : verrou `(cycle, opérateur)` fail-closed vs fichiers par-processus sommés — le plan retient le verrou
  (aligné `CHANTIERS.md:427`) ; le validateur confirme-t-il, ou exige-t-il la variante multi-fichiers ?
- **CP1-Q2** : méthode hors table de tarif ⇒ **refus** (retenu) vs pire-cas ×10 + résidu nommé. Le plan retient refus.
- **CP1-Q3** : découpe 1a **monolithique** (≈ 900–1 250, tendu) vs 1a-i/1a-ii d'emblée. Le plan propose un déclencheur
  chiffré (> ~1 000 mesuré au G1) ; le validateur préfère-t-il la scission décidée d'emblée (motif U-4a b1a/b1b) ?
- **CP1-Q4** : `HELIUS_CYCLE_ID`/`floor` posés par CLI de l'orchestrateur — sont-ce des **entrées de course** (comme
  `--max-calls`) REQUISES et fail-closed si absentes pour tout opérateur payant ? (Le plan dit oui.)
- **CP1-Q5** : le ledger trace TOUS les opérateurs ; **crédit 0 par CLASSE d'opérateur keyless** (Pocket,
  mainnet-beta) — PAS « méthode inconnue tarifée 0 » (§3.2 Helius) ; cap crédits uniquement sur les payants. Le
  validateur confirme-t-il la règle **scopée-opérateur** (Helius table fermée / Chainstack-Databento-Polygon
  tentatives seules / keyless 0) ?
- **CP1-Q6** : dépendance dure sur la fusion de `-b3d-b1a` (worktree b3db1a) — ordre confirmé avant 1a ?
- **CP1-Q7** : `OperatorLabel` = **string branchée** (stubs de test inchangés, R-25 1b maîtrisé) vs objet `{label}`
  (plus explicite mais touche chaque stub). Le plan retient la **string branchée**.

---

## 11. Questions INVESTISSEUR (une par une, options + reco) [tâche (10)]

### Q-INV-1 — Tolérance de rapprochement dashboard ↔ ledger
Le ledger compte les **tentatives** (borne haute) ; le dashboard, les **crédits facturés**. Qu'un 429/5xx soit facturé
est **inconnu** [2nd]. Le plan pose une règle **asymétrique** ; reste à chiffrer la **bande souple** `tol`.
- **(A) `tol = 0` (dur des deux côtés : `ledger_run = Δdashboard`)** — le plus strict ; **risque** : un seul retry non
  facturé (attendu) ferait échouer le GO à tort ⇒ friction opérationnelle élevée.
- **(B) `tol` en ABSOLU (ex. ≤ 50 crédits)** — simple, lisible à petit volume.
- **(C) `tol` RELATIF borné (ex. `ledger_run − Δdashboard ≤ max(50 cr, 0,5 % du run)`, borne dure
  `Δdashboard ≤ ledger_run` toujours)** — s'adapte au volume du run, garde la borne dure anti-contournement.
- **RECO** : **(C)** avec `tol = max(50 cr, 0,5 %)` — la borne dure `Δdashboard ≤ ledger_run` (aucune tolérance) est
  ce qui attrape un contournement ; la bande relative absorbe les retries non facturés sans masquer une fuite.
  Chiffres à valider ; pré-enregistrés avant la première course.

### Q-INV-2 — Plafond de cycle Helius (`CYCLE_CAP`)
Chiffres établis : plan **10 M crédits/mois** [2nd `CHANTIERS.md:388` + brief] ; **60 938 déjà consommés** ce cycle
[2nd, lecture orchestrateur `CHANTIERS.md:424`] ; **6,5 M** = plafond du tirage -b3d (`collect.ts:301` « 6.5 M
plafond » [lu], C-G2-1) ; cumul pire cas projeté **≈ 7 610 938 / 10 M** [2nd `CHANTIERS.md:388`]. **Un `CYCLE_CAP`
sous ~7,6 M bloquerait le tirage -b3d planifié.**
- **(A) `CYCLE_CAP = 8 000 000`** (≈ 80 % du plan) — laisse passer le tirage -b3d (~6,5 M) + le déjà-consommé, marge
  ~2,4 M ; **risque** : peu de marge pour un imprévu la fin du cycle.
- **(B) `CYCLE_CAP = 9 000 000`** (90 %) — plus de marge de tirage ; **risque** : approche le plan, moins de coussin.
- **(C) `CYCLE_CAP = 7 000 000`** — prudent. **Arithmétique** : 60 938 + ~6,5 M = ~6 560 938 **< 7 M** ⇒ le tirage
  -b3d **PASSE** ; ce que 7 M bloque, c'est le **-b1-bis-ii (≤ 1 M) + T-1a-iii-B (≤ 50 k)** du MÊME cycle (ensemble
  ils font le cumul pire cas ~7 610 938, `CHANTIERS.md:388`) ⇒ ils seraient **reportés au cycle suivant**.
- **RECO** : **(A) 8 000 000**, avec le floor épinglé au dashboard (60 938 aujourd'hui) et ré-évaluation à chaque
  course ; c'est le plus bas qui n'oblige pas à re-découper le tirage -b3d, tout en gardant ~2 M de coussin. À
  reconsidérer si Q-INV-1 de Helius révèle un tarif inattendu.

### Q-INV-3 (secondaire) — Emplacement du dossier ledger de cycle
- **(A) `%LOCALAPPDATA%/monark/rpc-cycle/`** (par défaut, durable, hors dépôt, hors `F:/tmp` nettoyé).
- **(B) un chemin `F:\` dédié hors dépôt** (ex. `F:\monark-ledger\`) — visible côté investisseur, sauvegardable.
- **RECO** : **(B)** un dossier `F:\` dédié et **sauvegardé** — le ledger de cycle est une pièce de gouvernance
  (preuve du rapprochement) ; le mettre là où les sauvegardes MONARK SUITE le prennent. `HELIUS_LEDGER_DIR` posé par
  l'orchestrateur, jamais deviné.

---

## 12. ADR + provenance (règle de branchement — tuyaux déclarés de CE lot)

**ADR à créer** : `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` (statut « proposé au G0 → adopté au G1 »,
motif ADR-T1aii / ADR-U1). Il porte : D1 client handle-based (endpoint jamais rendu) ; D2 ledger de cycle
(env-dérivé, chaîné, tentatives-primaires/crédits-dérivés, tarif fermé, write-ahead, verrou) ; D3 trois caps
fail-closed ; D4 rapprochement asymétrique pré-enregistré ; D5 migration (b3db1a dur ; Ukemi post POOL-RPC-1a ;
U-4b-0 subsumé) ; D6 `error_origin` HELIUS-1 (primaire orchestrateur / contributif worker -b3a-2,
`RAPPROCHEMENT §8`) ; MAST (§9) ; **table de tuyaux (§7)**. Amende implicitement `docs/G0-lot-u4b.md` §6/§8-0-1
(U-4b-0 → « consommer `@monark/rpc-guard` »).

**Ce lot ne crée pas de dette nue** : chaque reste est un item formé à déclencheur — Ukemi (déclencheur : fusion
POOL-RPC-1a), scission 1a-i/1a-ii (déclencheur : diff G1 > ~1 000), `CYCLE_CAP`/`tol`/`HELIUS_LEDGER_DIR` (déclencheur :
réponses Q-INV-1/2/3). Aucun papier introuvable (plan interne, sources = fichiers du dépôt [lu]).

---

## RÉSUMÉ (15 lignes)
1. **Modèle** : `claude-opus-4-8[1m]` (R-1, préfixe conforme).
2. **Objet** : rendre HELIUS-1 (résidu ≈ 4 963 gTfA `full` ≈ 49 630 cr) non-reproductible AVANT toute course Bell.
3. **Cause** : chemin réseau PARALLÈLE non gardé (`.mjs` de brouillon), pas un défaut de `collect.ts`.
4. **(1) Client unique** `@monark/rpc-guard`, handle-based : `call(handle,method,params)` — l'URL PAYANTE n'est
   jamais rendue ; `solanaEndpoints` dé-exporté ; factorise 2 `makeBudgetedCall` dupliqués (Bell/Ukemi).
5. **Scope honnête (R-21)** : (i) code + (ii) CI grep = impossible PAR LE DÉPÔT ; (iii) floor+rapprochement = impossible
   à DISSIMULER. Ne pas sur-promettre.
6. **(2) Ledger de cycle** hors `--out`, chemin env-dérivé, `HELIUS_CYCLE_ID` épinglé, append-only chaîné
   (`verifyLedgerChain`), par (opérateur, méthode), **tentatives primaires / crédits dérivés** ; tarif **scopé
   opérateur** : Helius table fermée (gTfA 10, getTx 1 [lu `rebase-crosscheck.ts:55-56`] ; gSFA/gAI/gTABO/getSlot 1
   [2nd dashboard]), Chainstack/non-RPC = tentatives, keyless = 0 ; write-ahead ; verrou `(cycle,op)` fail-closed.
7. **Anti-reset** : floor obligatoire lu au dashboard (60 938 [2nd]) ⇒ prior = `max(floor, Σ ledger)`.
8. **(3) Trois caps fail-closed** : par run (`--max-calls`/`--max-credits`, inchangés), par méthode, de cycle
   (ré-évalué à chaque appel).
9. **(4) Rapprochement ASYMÉTRIQUE sur les DELTAS** : `Δdashboard ≤ ledger_run` DUR (anti-contournement) +
   `ledger_run − Δdashboard ≤ tol` souple (somme des `attempted` seuls) ; Chainstack en RU (modèle au prereg) ;
   dashboard lu avant/après ; le floor gouverne le CAP de cycle, pas le rapprochement.
10. **(5) Test d'intégration non-LLM** + 7 mutants (retry non compté, reset-on-missing, throw retiré, plafond ignoré,
    ledger dans `--out`, `instanceof` cassé, tarif inconnu) ; chaque mutant rougit un test nommé.
11. **(6) Migration** : Bell `collect.ts`/`rebase-crosscheck.ts` consomment le client (compteur unique) ; base =
    worktree b3db1a (dépendance dure) ; Ukemi APRÈS POOL-RPC-1a via `runRecorder` ; U-4b-0 subsumé.
12. **(8) Découpe R-25** : 1a paquet (upcoming, ≈ 900–1 250, TENDU → scinder si G1 > ~1 000), 1b Bell (branché), 2
    Ukemi ; G7 couvre 1a+1b ; aucun sous-lot ne clôt seul.
13. **(9) MAST** : secret-leak, fail-open `instanceof`, budget non attribué, concurrence, no-verify, over-claim,
    incorrect-verification — tous atténués et tracés.
14. **(10) Investisseur** : Q-INV-1 tolérance (reco C : `max(50 cr, 0,5 %)`, borne dure `Δdashboard ≤ ledger_run`) ;
    Q-INV-2 `CYCLE_CAP` (reco A : 8 M — -b3d ~6,5 M passe même sous 7 M ; 8 M garde ~2 M de coussin) ; Q-INV-3 dossier
    ledger (reco B : `F:\` dédié sauvegardé).
15. **Zéro dette nue** : chaque reste = item formé à déclencheur ; sources = fichiers du dépôt [lu], aucun chiffre de
    première main inventé ; les [2nd] (60 938, 10 M, 6,5 M) signalés comme tels.
