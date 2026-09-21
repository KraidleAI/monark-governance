# G0 — Sprint backlog lot **GARDE-HELIUS** — PLAN PLIÉ (checkpoint-1) — client budgété unique + ledger de cycle durable + rapprochement servi

**Rôle** : RÉDACTEUR du PLI checkpoint-1 (PLAN, AUCUN code, AUCUN réseau). Ce fichier **REMPLACE** `F:\tmp\garde-helius\G0-lot-garde-helius.md`
(plan original) en foldant les 14 corrections **C-1..C-14** + les rulings **Q1..Q7** de l'avis validateur (`claude-fable-5-1`,
checkpoint-1 ACCEPTE-AVEC-CORRECTIONS, `CHANTIERS.md:486-489`) + les décisions investisseur **112-115**. Chaque section porte ses
tags `[C-n]` (correction foldée) et `[adv-n]` (advisor du plan original) pour rendre la table correction→section vérifiable (R-21).
**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé).
**Provenance** : modèle épinglé `claude-opus-4-8[1m]`, 2026-09-21, contexte = pli du plan de garde rendant HELIUS-1 non-reproductible ;
réviseur = orchestrateur (R-21, vérification adversariale avant consommation) ; advisor intégré consulté une fois avant rédaction du pli.
**R-20** : aucun commit, aucun workflow, aucun fichier du dépôt modifié — écritures hors dépôt sous `F:\tmp\garde-helius\pli-cp1\`.
**AUCUN appel réseau. Aucun secret lu** : aucun fichier `.env*`/`*secret*`/config de service ouvert ; aucune URL à clé recopiée ;
`F:\Monark` ouvert en LECTURE seule.

> **Provenance du pli (incident d'entrée, item formé, jamais dette nue)** : le verbatim de l'avis validateur désigné par la mission —
> `F:\tmp\claude\F--Monark\a7659644-0519-4943-8b82-d50d7405fe34\tasks\a5b427a48e37fb967.output`, section « CHECKPOINT-1 — PLAN — lot
> GARDE-HELIUS » — est **de taille 0 octet** (vérifié : Read « file exists but the contents are empty » ; `find … -printf %s` ne le liste
> pas dans les 50 plus gros ⇒ 0 o). Le pli est donc **reconstruit** depuis trois sources [lu] de première main : (a) le **brief
> d'orchestrateur** de cette mission (dictée détaillée C-1..C-14 avec `fichier:ligne`) ; (b) **`CHANTIERS.md:486-489`** (record persisté du
> checkpoint-1 + décisions 112-115 + C-14 FAIT) ; (c) le **plan original** + les **fichiers du dépôt rouverts à chaque `fichier:ligne`**.
> Item formé à déclencheur : **si le verbatim validateur est restauré et diverge de cette reconstruction, l'orchestrateur substitue le
> verbatim** (détail dans `CHECKPOINT1-lot-garde-helius.md`).

## 0. Niveaux de preuve (doc 03)
- **[lu]** = lu de première main dans un fichier du dépôt à `fichier:ligne` (vérifiable par l'orchestrateur).
- **[2nd]** = chiffre lu dans un document (CHANTIERS, RAPPROCHEMENT, dashboard rapporté par l'orchestrateur), pas de première main.
- **[à mesurer]** = projection/estimation de ce G0 (ex. R-25), à confirmer au G1 par mesure.
- **[à étalonner]** = grandeur non documentée par le fournisseur (ex. RU/méthode Chainstack), mesurée à la première course puis figée.

---

## 1. Objet, cause racine, et ce que « IMPOSSIBLE » veut dire honnêtement [adv-1]

**Objet** : rendre non-reproductible l'incident HELIUS-1 — résidu **≈ 4 963 requêtes `getTransactionsForAddress` `full` ≈ 49 630
crédits** (≈ 81 % du cycle), mono-méthode, émis par des `.mjs` de brouillon **hors de la garde du dépôt** (`F:\tmp\bell-b3a-2\*.mjs`).
Cause racine PROUVÉE [2nd, `RAPPROCHEMENT-appel-par-appel.md` §5.1, fichier:ligne] : ledger « reset-on-missing » (`course-probe.mjs:35`,
`course-bodies.mjs:36`, `authority-probe.mjs:19`, `course-hybrid.mjs:23`), `throw BudgetExceeded` RETIRÉ (`authority-probe.mjs:25`,
`course-hybrid.mjs:29`), `MAX_PAGES || Infinity` (`course-bodies.mjs:29`).

**Ce que le validateur a attrapé et qui aggrave la cause [C-1]** : le défaut n'est PAS seulement « hors dépôt ». **Le dépôt lui-même
porte deux chemins payants qui rejouent HELIUS-1** — l'inventaire du plan original était incomplet :
- **`universe-cli.ts:121-122`** : `pacedInner` enveloppe `withUniverseRetry(() => deps.call(u,m,p))` PUIS `makeUniverseBudget(…, makeBudgetedCall, pacedInner)` — le **tick est AU-DESSUS de la boucle de retry** ⇒ R retries = 1 unité comptée = **hypothèse H-B DANS LE DÉPÔT** [lu `universe-cli.ts:121-122`, `universe.ts:113-130 withUniverseRetry maxRetries=4`].
- **`universe-cli.ts:77`** : `ledger: argOf(argv,"--ledger") ?? join(out,"budget.json")` ⇒ **ledger DANS `--out`** [lu] ; **`universe.ts:147 readPriorCalls`** renvoie **0 si le fichier est absent** [lu `:147-152`] ⇒ supprimer le dossier de travail **rouvre le budget** (classe reset-on-missing, dans le dépôt).
- **`collect.ts:638`** : `liveEthSwaps(ethPool, ethFrom, ethTo)` est appelé **sans passer le call budgété** [lu] ⇒ tout le leg Ethereum getLogs part par `bellEthCall` (`ethereum.ts:60-70`, `fetch` brut) **HORS de tout budget/ledger** [lu `ethereum.ts:60-78`] : un fournisseur payant (Chainstack ETH) y consomme **sans compteur**.

**Ce que la garde peut rendre littéralement impossible, et ce qu'elle ne peut que rendre visible** (à écrire ainsi, R-21) :
- **Couche (i) CODE — impossible par l'API du paquet [C-2, reformulation].** Aucun symbole exporté de `@monark/rpc-guard` ne rend une URL
  d'endpoint PAYANT. L'API est `call(op, method, params)` où `op` est un **label d'opérateur** (`OperatorLabel`, string branchée), jamais
  une URL. Les 7 `fetch(` du dépôt (§2.0) migrent DANS le paquet ; le nom de chaque variable d'env-clé n'apparaît que dans le module client.
- **Couche (ii) CI — impossible par le dépôt [C-2].** Test non-LLM (grep, calque `packages/contracts/test/forbidden-keys.test.ts` [lu]) :
  tout `fetch(` / `node:http(s)` / `undici` / `child_process`, OU tout `process.env.<clé-payante>`, **hors du module client** = ROUGE.
- **Couche (iii) DÉTECTION — impossible à CACHER (pas à empêcher).** Un `.mjs` peut toujours lire `process.env` de lui-même. Ce qui
  l'attrape : le **floor de cycle épinglé au dashboard** + le **rapprochement asymétrique servi** (§4) rendent toute consommation
  hors-ledger visible en un cycle.

**Formulation exacte pour le G7 / le validateur [C-2]** : (i) = « impossible **par l'API du paquet** » ; (ii) = « **refusé par la CI** » ;
(iii) = « impossible à **dissimuler** ». La garde NE prétend PAS empêcher un opérateur humain de lire `process.env` dans un script écrit à
la main hors dépôt — elle prétend qu'un tel script est (a) sans endpoint via l'API, (b) refusé par la CI s'il entre au dépôt, (c) détecté au
rapprochement.

---

## 2. Architecture — UN client budgété unique, seul détenteur des endpoints [tâche (1)]

### 2.0 Inventaire COMPLET des portes payantes du dépôt (cible de migration) [C-1, C-2]

Table exhaustive rouverte `fichier:ligne` (ce que 1b déplace dans `packages/rpc-guard/src/` ; ce que la CI grep interdit ensuite hors client) :

| Porte (`fetch`/clé) | `fichier:ligne` [lu] | Opérateur payant | Défaut HELIUS-1 rejoué |
|---|---|---|---|
| `fetchCall` (Solana RPC) | `apps/bell/src/rpc.ts:40,44` | Helius/Chainstack Solana (`BELL_SOLANA_RPC`) | endpoint rendu par `solanaEndpoints` exporté (`rpc.ts:21-24`) |
| `solanaEndpoints` (résout la clé) | `apps/bell/src/rpc.ts:21-24` (`BELL_SOLANA_RPC`) | idem | la **porte** exportée |
| `liveRpcCall` (Solana RPC) | `apps/bell/src/universe-cli.ts:221` | Chainstack Solana | — |
| `liveHttpGet` (issuer GET) | `apps/bell/src/universe-cli.ts:207` | issuer PUBLIC (keyless, **crédit 0**) — migre pour la règle CI (zéro `fetch(` hors client), **pas un payant** | — |
| lecture clé Chainstack Solana ×3 | `apps/bell/src/universe-cli.ts:109,237,251` (`CHAINSTACK_SOLANA_URL`) | Chainstack Solana | clé lue **hors module client** (3 sites) |
| `bellSolanaCall` (Solana RPC) | `apps/bell/src/collect.ts:284` | Helius/Chainstack Solana | — |
| `bellEthCall` (ETH RPC/getLogs) | `apps/bell/src/ethereum.ts:60-70` (`fetch` :64) | Chainstack ETH | **hors budget** (appelé par `collect.ts:638`) |
| `databentoGet` (GET payant) | `apps/bell/src/close.ts:174-179` (`fetch` :176) | Databento | GET budgété par `tick` seulement (`collect.ts:595`) |
| `polygonGet` (GET payant) | `apps/bell/src/close.ts:188-194` (`fetch` :191) | Polygon/Massive | GET budgété par `tick` seulement (`collect.ts:596`) |
| ledger `join(out,"budget.json")` | `apps/bell/src/universe-cli.ts:77` ; `universe.ts:147` | — | ledger **dans `--out`** + absent⇒0 |
| retry SOUS le tick | `apps/bell/src/universe-cli.ts:121-122` ; `universe.ts:113` | — | H-B (retries non comptés) |
| clé Chainstack ETH (lot 2) | `apps/sentinel/src/rpc.ts:52-77` (`CHAINSTACK_ETH_URL`) ; `record.ts:296` | Chainstack ETH | branche Chainstack **payante** (allowlist §6.1) |

> **7 `fetch(` [lu grep `apps/bell/src`]** : `close.ts:176`, `close.ts:191`, `collect.ts:284`, `ethereum.ts:64`, `rpc.ts:44`,
> `universe-cli.ts:207`, `universe-cli.ts:221`. Zéro `child_process|undici|node:http` aujourd'hui (le grep CI garde ce 0).
> **Consommateur FUTUR `-iii-a1-bis` [C-1]** : lot déjà lancé (`CHANTIERS.md:474` « -iii-a1-bis PRÊT (G0 lancé) ») ; il **hériterait**
> le H-B de `universe-cli.ts:121` s'il copie le chemin universe ⇒ **dépendance d'ordre déclarée** : `-iii-a1-bis` consomme
> `@monark/rpc-guard` (pas un second compteur) ou est explicitement gelé jusqu'à la migration 1b (item formé, propriétaire orchestrateur).

### 2.1 Le paquet et la couture

**Nouveau paquet `@monark/rpc-guard`** (`packages/rpc-guard/`, convention workspaces `@monark/*` [lu] — 5 paquets existants
`contracts/hikae/ukemi/monark/atelier`, chacun `package.json`+`src/`+`test/`). Il factorise les deux `makeBudgetedCall` dupliqués :

| Aujourd'hui (dupliqué) | Bell | Ukemi |
|---|---|---|
| primitive budgétée | `apps/bell/src/collect.ts:297 makeBudgetedCall` [lu] | `apps/sentinel/src/ukemi/record.ts:142 makeBudgetedCall` [lu, plan] |
| **compte les retries ?** | `collect.ts` OUI (le tick est au-dessus, retour à chaque tentative) ; **`universe-cli.ts:121` NON (H-B) [C-1, lu]** | **NON** (retry interne, tick au-dessus de la boucle) [lu, plan] |
| persistance cumulative | budget.json **DANS `--out`** [lu `universe-cli.ts:77`, `collect.ts:589`] | aucune [lu, plan] |
| `BudgetExceededError` | `quorum.ts` (+ 8 autres fichiers, §2.3) | `rpc2.ts`/`record.ts` |

**API du client (couture injectable, offline-testable) — le transport injecté ne reçoit JAMAIS l'URL [C-3]** :
```
// packages/rpc-guard/src/client.ts  (types indicatifs — le G1 fige les signatures)
type OperatorLabel = string & { readonly __brand: "OperatorLabel" }; // un LABEL branché (providerOf/operatorLabel) ; JAMAIS l'URL [Q7]
type Transport = (op: OperatorLabel, method: string, params: readonly unknown[]) => Promise<unknown>; // reçoit le LABEL, jamais l'URL
interface BudgetedClient {
  operators(): readonly OperatorLabel[];             // les opérateurs (labels), résolus de l'env EN INTERNE
  call(op: OperatorLabel, method: string, params: readonly unknown[]): Promise<unknown>; // budgété + ledgeré ; UNE tentative, PAS de retry [C-4]
  tick(op: OperatorLabel, kind: string): void;       // lecture PAYANTE non-RPC (Databento/Polygon GET) — tentative comptée
  spent(): { attempts: number; credits: number };    // état du RUN (le prior de cycle vit dans le ledger)
}
function makeClient(env, ledger, opts?: { transport?: Transport }): BudgetedClient // seul endroit où l'URL/clé PAYANTE est résolue
```
- **Couture C-3** : `opts.transport` (injecté en test) a la signature `(op: OperatorLabel, method, params)`. Le client résout `op→URL`
  **uniquement dans son transport PAR DÉFAUT privé** (`(op,m,p) => fetch(privateMap.get(op), …)`), jamais dans le seam injecté. Les stubs de
  test existants `(u,m,p)` où `u` est déjà un **nom nu** (`quorum.ts`, `operators.ts:30` « or a test-double bare name » [lu, plan]) compilent
  inchangés : `u` EST le label. **Test espion `transport_never_receives_url`** (§6-T1) : le transport injecté enregistre ses invocations ;
  assertion — chaque 1er argument ∈ `client.operators()` (jamais de `https://`, jamais de token à clé) ; `spy.invocations.length ===`
  nombre de lignes ledger `outcome=attempted` (§6-C4).
- **Endpoint résolu de l'env EN INTERNE**, jamais rendu ni sérialisé (calque hygiène clé `record.ts:29-41 scrubUrls` [lu, plan]).
- **`quorum2` migre de `(providers: string[], call(url,…))` vers `(ops: OperatorLabel[], call(op,…))`** : la distinctness reste par
  **opérateur** (`operatorOf`/`operatorLabel` — `quorum.ts:84`, `operators.ts:30`), l'URL disparaît de `quorum2`, `signaturesUntil`,
  `scanFullMint`, `buildSolanaSymbol`.

### 2.2 Retry — UNE seule couche, chez l'appelant ; le client ne retry pas [C-4, INVERSION du plan original]

Le plan original mettait le retry **INTERNE au client**. Le validateur l'INVERSE (`CHANTIERS.md:487` « UNE couche : le client ne retry
pas, un `call` = une tentative ») pour éviter le **double retry** (client + scan `rebase-crosscheck.ts` RetryFn `:212-216,569,588` [2nd,
plan]) et garantir l'invariant **une tentative = un `fetch` = une ligne ledger** :
- **`client.call(op,m,p)` fait EXACTEMENT une tentative** (un `fetch`), écrit sa ligne write-ahead (§3.2), et propage la faute sans réessayer.
- **Le retry vit chez l'appelant** : les `withRetry` (`collect.ts:318` [lu]) et `withUniverseRetry` (`universe.ts:113` [lu]) EXISTANTS
  enveloppent désormais `client.call`. La migration 1b **réordonne `universe-cli.ts:121-122`** : le retry cesse d'être dans `pacedInner`
  (sous le tick) et enveloppe `client.call` (chaque retry ré-entre le client ⇒ **chaque tentative est comptée**). `BudgetExceededError`
  re-jeté EN PREMIER par les deux retries (déjà le cas : `withUniverseRetry` `universe.ts:121`, `withRetry` `collect.ts:322` [lu]).
- **Mutant `retry_emboite` (§6)** : ajouter un retry INTERNE au client (double couche) ⇒ `spy.invocations ≠ lignes ledger attempted` ⇒ ROUGE.

### 2.3 Identité de `BudgetExceededError` à travers la frontière du paquet [adv-3, C-13, fail-open critique]

`instanceof BudgetExceededError` est la garde porteuse ; elle est utilisée/importée dans **9 fichiers SOURCE** [lu grep `*.ts`, hors 5
fichiers de test] : `apps/bell/src/{universe.ts, quorum.ts, collect.ts, rebase-scan.ts, rebase-crosscheck.ts, rebase-produce.ts,
discover.ts}` + `apps/sentinel/src/ukemi/{rpc2.ts, record.ts}`. **Si `@monark/rpc-guard` exporte une NOUVELLE classe et qu'un de ces 9
fichiers garde la sienne, un stop budget est attrapé comme faute transport ⇒ fail-open silencieux, typecheck vert.**
**Décision de plan** : la classe canonique vit dans `@monark/rpc-guard` ET est **ré-exportée** par les 9 fichiers (imports inchangés).
**Cas particulier `Fatal403Error` [C-13]** : `apps/bell/src/universe.ts:96 export class Fatal403Error extends BudgetExceededError` [lu] —
un 403 dur (`universe.ts:122`) est une **sous-classe** de la garde. Elle DOIT étendre la classe **canonique** ré-exportée ; sinon
`instanceof BudgetExceededError` (canonique) sur un `Fatal403Error` rend `false` ⇒ un stop 403 benché en faute transport ⇒ fail-open.
**Mutant dédié `budget_stop_not_swallowed_by_quorum2` (§6)** couvre explicitement `universe.ts:96` : `Fatal403Error` étendant l'ANCIENNE
classe ⇒ le `instanceof` de `quorum2` le rate ⇒ ROUGE.

---

## 3. Ledger de CYCLE durable, hors dossier de travail [tâche (2)] et plafonds [tâche (3)]

### 3.1 Emplacement, non-réinitialisation, ENTRÉES REQUISES [adv-7, C-8]
- **Chemin dérivé de l'ENV, JAMAIS `--out`** : `${HELIUS_LEDGER_DIR}/${HELIUS_CYCLE_ID}/`, hors dépôt (CA-11) et hors du dossier de travail
  nettoyé à chaque passe. **Décision investisseur 114** : `HELIUS_LEDGER_DIR = F:\monark-ledger\` (créé, hors dépôt, sauvegardé avec MONARK
  SUITE ; `CHANTIERS.md:479`). C'est l'inverse EXACT du défaut §5.1-1 et de `readPriorCalls(out)` (`universe-cli.ts:77`, `collect.ts:589` [lu]).
- **Le parent `HELIUS_LEDGER_DIR` doit PRÉ-EXISTER [C-8]** : le client ne crée QUE le sous-dossier `<cycle_id>/` ; si `HELIUS_LEDGER_DIR`
  lui-même est absent ⇒ **throw** (un dossier ledger auto-créé sous un chemin fautif = ledger fantôme réinitialisable). Test **T11** (§6).
- **Entrées de course REQUISES, sans défaut, fail-closed AVANT tout réseau [C-8, C-10, ruling Q4]** — calque `--max-calls` requis
  (`universe-cli.ts:70,72` [lu]) : `HELIUS_LEDGER_DIR`, `HELIUS_CYCLE_ID`, `--cycle-floor <crédits>`, `--method-caps <table>` sont **REQUIS
  pour toucher tout opérateur PAYANT** ; absent ⇒ throw AVANT le premier `fetch`. `HELIUS_CYCLE_ID` est **ÉPINGLÉ par l'orchestrateur** depuis
  le libellé « current credit cycle » du dashboard (jamais un mois calendaire deviné).
- **Plancher (floor)** : `--cycle-floor` posé par l'orchestrateur depuis la **lecture sur place du dashboard AVANT la course** (aujourd'hui
  **60 938** [2nd, lecture orchestrateur `CHANTIERS.md:424`]). **Prior effectif de cycle = `max(floor, Σ ledger)`** ⇒ supprimer/vider le
  ledger ne rouvre PAS le budget (mutant §6 « delete ledger, rerun ⇒ prior ≥ floor, jamais 0 »).
- **`floor > CYCLE_CAP` ⇒ throw [C-8]** : si le floor lu au dashboard dépasse déjà le cap de cycle, la course refuse au démarrage (le cycle
  est épuisé ; ne pas tirer « juste un peu »).

### 3.2 Format (append-only, chaîné ; requêtes primaires par méthode, crédits DÉRIVÉS) [adv-5, C-7]
- **Fait primaire = la REQUÊTE (tentative) par (opérateur, méthode) [C-7]** ; **crédits = dérivés** :
  `crédits = Σ requêtes_(op,méthode) × tarif(op,méthode)`. L'en-tête porte `tariff_version` (tarif figé en UN endroit).
- **Tarif Helius — table FERMÉE, épinglée [lu] par LECTURE SUR PLACE [C-14, adv-4]** : lecture orchestrateur de `helius.dev/pricing`
  consignée `F:\PRODUITS\etude-2026-09-21\helius-audit\FAITS-tarification-helius-2026-09-21.md` (acte orchestrateur daté, `CHANTIERS.md:489`)
  — « RPC calls are 1 credit with two exceptions: getProgramAccounts and archival calls are 10 credits. DAS calls are 10 credits » ;
  « Additional credits per million: $5 » ; **autoscaling Off** sur le compte ⇒ pas de dépassement facturable. D'où la table figée au G1 :
  - **10 crédits** : `getTransactionsForAddress` (archival) [lu FAITS + `rebase-crosscheck.ts:55 CREDITS_PER_GTFA=10`], `getProgramAccounts`
    (archival) [lu FAITS], appels DAS [lu FAITS].
  - **1 crédit** : `getSignaturesForAddress`, `getTransaction` [lu FAITS + `rebase-crosscheck.ts:56 CREDITS_PER_GET_TX=1`], `getAccountInfo`,
    `getTokenAccountsByOwner`, `getSlot` [lu FAITS « RPC calls are 1 credit »]. **La mention [2nd] du plan original pour ces méthodes est
    RETIRÉE** — le tarif est désormais [lu] de première main.
  - **Méthode Helius ABSENTE de la table ⇒ fail-closed** (refus + résidu `unknown_method`) : mal-tarifer une méthode archival/DAS à 1 cr
    serait un fail-open de classe HELIUS-1 (ruling Q2).
- **Chainstack / Databento / Polygon = REQUÊTES par méthode ; coût dérivé au rapprochement, PAS au cap crédits [C-7]** : RU/méthode
  Chainstack **non documenté** [2nd `record.ts:294` « RU/call undocumented »] ⇒ **[à étalonner]** (§4). Le cap de cycle sur ces opérateurs
  est en RU (Chainstack) / requêtes (Databento, Polygon), pas en crédits Helius (§3.4-3, décision 115).
- **Keyless (Pocket, mainnet-beta) = crédit 0 PAR CLASSE D'OPÉRATEUR** (ruling Q5) — tracé pour la complétude, jamais capé.
- **Chaîne** : chaque flush = une ligne chaînée `{prev_entry_sha256, cycle_id, tariff_version, by_op_method: {(op,method): attempts},
  outcome, credits_derived, entry_sha256}` (calque `LedgerEntry`/`verifyLedgerChain` `rebase-crosscheck.ts` [lu, plan]).
  `verifyLedgerChain` **rejoué au DÉMARRAGE** ; chaîne cassée ou fichier illisible ⇒ **fail-closed** (refuser de tirer), jamais lu comme 0
  (calque `readPriorCalls` fail-closed `universe.ts:147-152` [lu]).
- **Write-ahead** [adv-2] : la ligne de tentative est **appendée AVANT le `fetch`** ⇒ un crash en vol **sur-compte**, jamais ne sous-compte ;
  une tentative **refusée par un plafond** reçoit sa propre ligne `outcome=refused` (le ledger porte la tentative même bloquée — tâche (5)).

### 3.3 Écrivains concurrents — verrou exclusif `openSync("wx")` + `unlock` servi [adv-2, C-9]
HELIUS-1 a fait tourner des scripts **parallèles** sur un `budget.json` unique (8 agents en vol, `CHANTIERS.md:452`). Deux processus qui
appendent des lignes chaînées **forkent la chaîne**. **Décision de plan durcie [C-9]** : **verrou par `(cycle, opérateur)` matérialisé par
`fs.openSync(<cycle>/<op>.lock, "wx")`** — le flag `wx` = création exclusive (échoue si le fichier existe) : un second run qui veut le même
opérateur payant **échoue à ouvrir ⇒ fail-closed** (aligné « cap Chainstack = un rôle à la fois », `CHANTIERS.md:427`). Le fichier de verrou
porte `pid` + horodatage. **Verrou périmé après crash** : il reste tenu ⇒ fail-closed (jamais un blocage éternel masqué) ; la libération est un
**acte EXPLICITE via la sous-commande servie `rpc-guard unlock --cycle <id> --op <label>`** (chaînée : appende une ligne `outcome=unlocked`
avec `prev_entry_sha256`), consignée, jamais un vol automatique. **Tests [C-9]** : (a) `lock_blocks_second_writer` (2ᵉ `openSync("wx")` ⇒
`EEXIST` ⇒ fail-closed) ; (b) `unlock_subcommand_chains_release` (`unlock` appende `outcome=unlocked`, `verifyLedgerChain` reste vert) ;
(c) **mutant** `lock_flag_w_not_wx` (verrou ouvert en `"w"` au lieu de `"wx"` ⇒ le 2ᵉ writer écrase ⇒ ROUGE).

### 3.4 Plafonds — trois couches, fail-closed [tâche (3)]
1. **Par run** : `--max-calls` (REQUIS, > 0 — `universe-cli.ts:70-72`, `collect.ts:437-439` [lu, plan]) + `--max-credits` (pire cas ×10,
   C-G2-1, `collect.ts:301-303` [lu]). **INCHANGÉS** [adv-5] : le ledger tarif-exact est **additif**.
2. **Par méthode et par run** [tâche (3), C-10] : **`--method-caps` REQUIS, SANS défaut** (absent ⇒ throw avant réseau) — gTfA bas ;
   c'est le plafond qui aurait arrêté `course-bodies.mjs` (gTfA `full` illimité). Fail-closed, ligne `outcome=refused`.
3. **De cycle, sur TOUT opérateur payant [tâche (2), décision investisseur 115]** :
   `prior_effectif + run + tentative_pire_cas > CYCLE_CAP ⇒ BudgetExceededError`, **lu au démarrage ET ré-évalué à CHAQUE appel**
   (write-ahead ⇒ le check précède le `fetch`). Caps par opérateur :
   - **Helius** : `CYCLE_CAP = 8 000 000` crédits (décision investisseur 112, 80 % du plan 10 M ; floor 60 938 épinglé au dashboard,
     `CHANTIERS.md:477`).
   - **Chainstack** : `CYCLE_CAP_RU = 16 000 000` RU (décision investisseur 115, « 80 % de l'inclus » ; floor lu au **tableau de bord
     Chainstack AVANT chaque course** ; `CHANTIERS.md:488`). **[à étalonner, R-21]** : RU/méthode non documenté ⇒ **le cap RU n'est PAS
     évaluable par appel avant la 1ʳᵉ course** — la **première course Chainstack est bornée par `--max-calls` (requêtes) seul**, le cap RU
     déclaré **non-applicable-cette-course** ; l'étalonnage `Δdashboard_RU / requêtes_par_méthode` produit le modèle RU/méthode ; le cap RU
     s'applique **dès la course 2** avec ce modèle + marge (§4). Ne jamais promettre un plafond RU que le code ne peut pas encore évaluer.
   - **Databento / Polygon** : plafond **en requêtes par cycle** (décision 115) — chiffre posé **au G1** depuis les quotas **lus sur place**
     (item formé, déclencheur : lecture orchestrateur des quotas Databento/Polygon, jamais deviné).

---

## 4. Rapprochement SERVI (non-LLM), pré-enregistré [tâche (4)] — critère GO **ASYMÉTRIQUE** [adv-4, C-6, C-7]

Le ledger compte des **requêtes/tentatives** (borne supérieure) ; le dashboard compte des **requêtes/crédits facturés**. Qu'un 429/5xx soit
facturé par Helius n'est PAS établi ([2nd]/inconnu — `RAPPROCHEMENT §5.2`). Un critère **symétrique** `|dashboard − ledger| ≤ tol` cacherait un
petit contournement dans la tolérance. D'où l'asymétrie, **et un consommateur SERVI et non-LLM [C-6]** :

**Sous-commande servie `rpc-guard reconcile --before <snap> --after <snap> --cycle <id>` [C-6, règle Branchement]** — remplace « un LLM lit
le rapprochement ». Elle : lit les snapshots dashboard before/after (fichiers posés par l'orchestrateur), somme le `ledger_run` (lignes
`outcome=attempted` du cycle), calcule le verdict, et **APPENDE une ligne `outcome=reconciled` chaînée** (`prev_entry_sha256`,
`verdict: GO|NO-GO`, deltas par méthode). Le verdict est **consommé** par la course (exit ≠ 0 si NO-GO) et par le journal de provenance —
c'est le test d'intégration `reconcile_asymmetric` (§6-T5) qui prouve le branchement.

- **BORNE DURE (aucune tolérance)** : `Δdashboard ≤ ledger_run` (par méthode). `Δdashboard > ledger_run` = consommation **hors garde** ⇒
  incident maintenu, `verdict = NO-GO`.
- **BANDE SOUPLE** : `ledger_run − Δdashboard ≤ tol` (sur-comptage attendu = retries non facturés + arrondis). **Décision investisseur 113** :
  `tol = max(50 cr, 0,5 % du run)`, pré-enregistrée avant la 1ʳᵉ course (`CHANTIERS.md:478`).
- **Helius (crédits)** : `Δdashboard_crédits ≤ ledger_run_crédits` (dur) ET bande souple, par méthode.
- **Chainstack (RU)** : 1ʳᵉ course = **étalonnage** (pas de verdict RU ; on enregistre `Δdashboard_RU` vs requêtes par méthode pour figer le
  modèle) ; dès la course 2 : `Σ requêtes_attempted_(méthode) × RU_par_méthode(modèle étalonné) ≤ Δdashboard_RU` + `tol_RU` déclaré au prereg.
- **Délai de consolidation [C-7]** : le dashboard consolide avec retard ⇒ `after` est lu **après le délai de consolidation déclaré au prereg**
  (sinon `Δdashboard` sous-estime et masque une fuite). Clause pré-enregistrée.
- **Rollover ⇒ NO-GO [C-7]** : si `before.cycle ≠ after.cycle` OU `≠ --cycle` (un passage de bord de cycle entre les deux lectures), `reconcile`
  **refuse** (exit ≠ 0, ligne `outcome=reconciled verdict=NO-GO reason=rollover`) — les absolus de deux cycles ne se soustraient pas.
- **« Aucun autre process MONARK entre before/after » [C-7]** : clause de PROTOCOLE (le verrou §3.3 ne couvre pas un `.mjs` hors dépôt).
  L'orchestrateur l'atteste au prereg ; l'**asymétrie l'attrape** si elle est violée (un tiers non-ledgeré ⇒ `Δdashboard > ledger_run` ⇒ NO-GO).
- **Le floor gouverne le CAP de cycle (§3.4-3), PAS le rapprochement** — deux plans distincts.
- **Protocole** : l'orchestrateur lit le dashboard **AVANT** (pose `floor`+`HELIUS_CYCLE_ID`) et **APRÈS** ; `reconcile` rend le verdict.
  Pré-enregistré AVANT tout appel : `tol`, modèle RU, délai de consolidation, méthode de lecture.

---

## 5. Migration — les consommateurs consomment le client, pas un second compteur [tâche (6)]

- **Bell `collect.ts`** : `runMain(argv, deps)` (`collect.ts:577` [lu]) construit le client `@monark/rpc-guard` au lieu de
  `makeBudgetedCall` local ; `solProviders` (URLs) → `client.operators()` (labels) ; `budgeted.call` → `client.call`. **Supprimer** le
  `makeBudgetedCall` de `collect.ts:297-314`. `budgetedDatabento`/`budgetedPolygon` (`collect.ts:595-596` [lu]) → `client.tick(op, kind)`.
  **`collect.ts:638 liveEthSwaps` reçoit désormais `client.call`** (le leg ETH cesse d'être hors budget, §1/§2.0).
- **Bell `rebase-crosscheck.ts`** : `runRebaseCrosscheckCli` consomme le client ; **le `callsByMethod` local (`:451-452` [lu, plan]) est
  SUPPRIMÉ** au profit de la ventilation `(op,method)` du ledger. Le ledger de PAGE chaîné (scan) reste ; le ledger de CYCLE est celui du
  client. Le `budget.json` de RUN devient **DÉRIVÉ de `client.spent()`**.
- **Base : construire sur le worktree `b3db1a`** [adv-6, ruling Q6] : `-b3d-b1a` porte déjà `retries_by_method`, `verifyLedgerChain`,
  `calls_by_method`, `require_full_pages`, `RetryFn` [lu, plan]. **GARDE-HELIUS-1a dépend de la FUSION de `-b3d-b1a` AVANT 1a**
  (`CHANTIERS.md:480`, dépendance dure d'ordre confirmée).
- **Ukemi (`record.ts`/`rpc2.ts`) — APRÈS POOL-RPC-1a** [adv-6] : migration via la couture `runRecorder(argv, deps)` (`pool-rpc-1.md:114`
  [lu, plan]). **`U-4b-0` est SUBSUMÉ** : « consommer `@monark/rpc-guard` », pas une seconde implémentation (ADR-U4b D5, item orchestrateur).
  `apps/sentinel/src/rpc.ts:52-77` (`CHAINSTACK_ETH_URL` [lu]) et `record.ts:296` entrent dans le client au lot 2.

---

## 6. Test d'intégration NON-LLM + mutants (branchement, CA-11 durci) [tâche (5), C-5, C-6]

Règle Branchement : une pièce n'est « built » que **BRANCHÉE** + couverte par un **test d'intégration non-LLM** rejouant la composition de
bout en bout. **Liste FERMÉE et numérotée [C-5]** (offline, transport stubbé ; certains tests partent du ledger produit par
`runMain(argv, deps)` stubbé — `collect.ts:577` [lu] — et par `reconcile` [C-6] ; ce sont **T6..T8 et T16..T17**) :

| # | Test (nom exact) | Ce qu'il prouve |
|---|---|---|
| **T1** | `transport_never_receives_url` (espion) | le transport injecté ne reçoit que `(label,method,params)` ; 1er arg ∈ `operators()` ; jamais d'URL [C-3] |
| **T2** | `third_party_script_cannot_obtain_endpoint` | un tiers qui `import(@monark/rpc-guard)` n'obtient AUCUNE URL ; `operators()` ne rend que des labels |
| **T3** | `exports_map_forbids_deep_import` | `import("@monark/rpc-guard/src/client")` ⇒ `ERR_PACKAGE_PATH_NOT_EXPORTED` (la `exports` map n'expose que l'API) [C-2] |
| **T4** | `fetch_only_inside_client` (CI grep, couche ii) | `git grep 'fetch('` / `node:http` / `undici` / `child_process` / `process.env.<clé>` hors client ⇒ 0 [C-2] |
| **T5** | `budget_counts_http_attempts` | R retries chez l'appelant ⇒ ledger `attempted` = R+1 ; `spy.invocations === lignes attempted` [C-4] |
| **T6** | `run_cap_stops_and_ledger_carries_attempt` | dépassement `--max-calls`/`--max-credits` ⇒ `BudgetExceededError`, exit ≠ 0, ligne `refused` (write-ahead) |
| **T7** | `method_cap_stops` | `--method-caps` gTfA atteint ⇒ stop + ligne `refused` |
| **T8** | `cycle_cap_stops` | cap de cycle (Helius crédits / Chainstack RU dès course 2) atteint ⇒ stop + `refused` |
| **T9** | `ledger_persists_and_fail_closes` | ledger chaîné, `verifyLedgerChain` vert ; illisible/cassé ⇒ throw (jamais 0) |
| **T10** | `delete_ledger_prior_ge_floor` | ledger supprimé, rerun ⇒ `prior = max(floor, Σ) ≥ floor`, jamais 0 |
| **T11** | `ledger_path_is_outside_out_and_repo` | le ledger vit sous `HELIUS_LEDGER_DIR`, hors `--out` et hors dépôt ; parent absent ⇒ throw [C-8] |
| **T12** | `required_inputs_fail_closed` | `HELIUS_LEDGER_DIR`/`HELIUS_CYCLE_ID`/`--cycle-floor`/`--method-caps` absent ⇒ throw AVANT réseau ; `floor > CAP` ⇒ throw [C-8,C-10] |
| **T13** | `lock_blocks_second_writer` | `openSync(lock,"wx")` tenu ⇒ 2ᵉ writer `EEXIST` ⇒ fail-closed [C-9] |
| **T14** | `unlock_subcommand_chains_release` | `rpc-guard unlock` appende `outcome=unlocked`, `verifyLedgerChain` reste vert [C-9] |
| **T15** | `unknown_method_fail_closed` | méthode Helius hors table ⇒ refus (jamais tarif 0 par défaut) [C-14, ruling Q2] |
| **T16** | `reconcile_asymmetric` | `reconcile` : `Δdashboard ≤ ledger_run` dur ; bande souple `max(50cr,0,5%)` ; `>` ⇒ NO-GO ; ligne `reconciled` chaînée [C-6,113] |
| **T17** | `reconcile_rollover_no_go` | `before.cycle ≠ after.cycle ≠ --cycle` ⇒ NO-GO `reason=rollover`, exit ≠ 0 [C-7] |
| **T18** | `budget_stop_not_swallowed_by_quorum2` | classe canonique ré-exportée ; `instanceof` de `quorum2` attrape le stop [C-13] |

**Mutants — chacun DOIT rougir UN test de la liste fermée [C-5]** (aucun mutant ne nomme un test absent) :

| Mutant | Défaut HELIUS-1 rejoué (`fichier:ligne`) | Test qui rougit |
|---|---|---|
| retry emboîté (retry interne au client) | double couche (client + `withRetry`) | **T5** `budget_counts_http_attempts` |
| retry SOUS le tick (non réordonné) | `universe-cli.ts:121-122` [lu] | **T5** |
| ledger reset-on-missing (`absent⇒0`) | `universe.ts:147`, `course-probe.mjs:35` | **T10** `delete_ledger_prior_ge_floor` |
| `throw` retiré (ledger n'enregistre que) | `authority-probe.mjs:25` | **T6** `run_cap_stops` |
| plafond ignoré (`MAX_PAGES||Infinity`) | `course-bodies.mjs:29` | **T7**, **T8** |
| ledger dans `--out` | `universe-cli.ts:77`, `collect.ts:589` [lu] | **T11** `ledger_path_is_outside_out_and_repo` |
| entrée requise avec défaut | — | **T12** `required_inputs_fail_closed` |
| verrou `"w"` au lieu de `"wx"` | — | **T13** `lock_blocks_second_writer` |
| `instanceof` cassé au passage de paquet (`Fatal403Error` étend l'ancienne classe) | `universe.ts:96` [lu] | **T18** `budget_stop_not_swallowed_by_quorum2` |
| tarif 0 pour méthode inconnue | fail-open de classe HELIUS-1 | **T15** `unknown_method_fail_closed` |
| transport reçoit l'URL (seam qui fuit) | plan original `{call:(url)…}` | **T1** `transport_never_receives_url` |
| `reconcile` symétrique | masque un dépassement dans `tol` | **T16** `reconcile_asymmetric` |

### 6.1 Portée et allowlist du grep CI (couche ii) — exacte, à déclencheur [C-2]
- **Portée (lot 1b)** : `apps/bell/src/**` + `packages/*/src/**`. **Hors `test/`** — un spawn légitime avec env existe
  (`apps/bell/test/universe.test.ts:479` [lu]) ; le grepper `test/` serait ROUGE par construction.
- **Allowlist = UN SEUL module** : le transport privé de `packages/rpc-guard/src/` (nom exact fixé au G1) — le seul endroit autorisé à
  porter un `fetch(` et une lecture de clé payante. **Aucune autre entrée.**
- **`apps/sentinel/**` = HORS PÉRIMÈTRE au lot 1b** — ce n'est **PAS** une entrée d'allowlist « keyless » : `apps/sentinel/src/rpc.ts:52-77`
  lit `CHAINSTACK_ETH_URL`, opérateur Chainstack **PAYANT** [lu] (c'est la correction du validateur au plan original, qui l'avait mal classé
  keyless). *Déclencheur d'entrée en périmètre* : fusion POOL-RPC-1a + migration Ukemi (lot 2) ⇒ la portée s'élargit à `apps/sentinel/src/**`
  et `record.ts:296`/`sentinel/rpc.ts:52-77` migrent dans le client.
- **Motifs réseau interdits hors client** : `fetch\(`, `node:https?`, `undici`, `child_process`.
- **Clés = forme d'ACCÈS `env.<clé>`, JAMAIS le nom nu [C-2, piège déjà attrapé une fois]** :
  `\benv\.(CHAINSTACK_SOLANA_URL|BELL_SOLANA_RPC|CHAINSTACK_ETH_URL|HELIUS_API_KEY|POLYGON_API_KEY|DATABENTO_API_KEY)\b`. Un grep sur le
  **nom nu** (formulation du plan original « toute mention du nom ») serait ROUGE par construction : ces noms figurent en **commentaires**
  hors client — `collect.ts:573`, `rpc.ts:5-8,17`, `universe-cli.ts:108,186`, `universe.ts:43,229` [lu]. La forme `env.KEY` couvre
  `deps.env.X` (`universe-cli.ts:109`) et `env.X` (`sentinel/rpc.ts:53`) sans matcher un commentaire. Preuve = test **T4**
  `fetch_only_inside_client` ; **déclencheur de retrait d'une entrée d'allowlist** = migration du module vers le client (0 usage restant).

---

## 7. Tuyaux déclarés (entrée / sortie / état / test) [tâche (7), règle Branchement]

| Pièce | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test d'intégration (preuve) |
|---|---|---|---|---|
| `@monark/rpc-guard` client | env (endpoints, résolus en interne) ; `floor`/`cycle_id`/`method-caps` (orchestrateur, du dashboard) | `collect.ts`/`universe-cli.ts` (Bell), `record.ts` (Ukemi, post POOL-RPC-1a) | ledger `F:\monark-ledger\<cycle>\*.jsonl` (hors dépôt) + verrou `<cycle>/<op>.lock` | T1, T2, T3, T4 |
| ledger de cycle | `client.call` (write-ahead, chaque tentative) | `reconcile` ; `readPriorCycle` au démarrage | jsonl chaîné env-dérivé | T9, T6, T10, T11 |
| `reconcile` (servi) | ledger (après) + snapshots dashboard before/after (orchestrateur) | verdict GO/NO-GO de course (exit code) + provenance | ligne `outcome=reconciled` chaînée | T16, T17 |
| `unlock` (servi) | verrou tenu + acte orchestrateur | libération consignée | ligne `outcome=unlocked` chaînée | T13, T14 |
| migration Bell | `@monark/rpc-guard` | courses Bell (`--rebase-crosscheck`, `--rebase-produce`, `--discover`, universe, eth) GATÉES | code + budget.json de run (dérivé de `spent()`) | suite Bell rejouée + T1..T18 |

**Un tuyau absent = item formé à déclencheur** : Ukemi **UPCOMING** tant que POOL-RPC-1a n'est pas fusionné ; `-iii-a1-bis` item d'ordre
(§2.0) ; `@monark/rpc-guard` reste **UPCOMING** tant que 1b (Bell) ne le consomme pas par un chemin servi + test d'intégration.

---

## 8. Découpe R-25 [tâche (8), C-12] — scission décidée d'emblée (ruling Q3)

**Mesuré [lu `ci.yml:65,69`, plan]** : le pathspec compte `packages/*/src`+`packages/*/test` ET `apps/*/src`+`apps/*/test` ; exclut
`docs/**`, `package-lock.json`, fixtures de données. Métrique = `ins+del`, plafond **1 205** (`ci.yml:43` [2nd, plan]). Ce fichier
(`docs/`) sera **exclu**. **Churn mesuré des listes de providers [C-12]** : `[Pp]roviders` apparaît **190 fois dans 26 fichiers** [lu grep
`apps/**/*.ts`], dont les fichiers source du chemin quorum (`quorum.ts:13`, `collect.ts:29`, `rebase-crosscheck.ts:7`, `discover.ts:11`,
`universe-cli.ts:6`, `universe.ts:9`, `rpc2.ts:22`, `record.ts:13`). Sans mitigation, migrer `JsonRpcCall(url,…)` toucherait chaque stub.
**Mitigation `OperatorLabel = string branchée` (ruling Q7)** : les stubs `(u,m,p)` restent inchangés (`u` = label) ⇒ le churn se limite
aux signatures, pas aux ~562 stubs Bell. **Le validateur exige la scission d'emblée (ruling Q3, `CHANTIERS.md:487`)** — plus de déclencheur
« si G1 > 1 000 » :

| Sous-lot | Contenu | Consommateur (branchement) | Projection `ins+del` [à mesurer] | ≤ 1 205 ? |
|---|---|---|---|---|
| **1a-i** | `@monark/rpc-guard` : client handle-based + `Transport`(label) + `BudgetExceededError` canonique + `exports` map + T1,T2,T3,T4,T18 | AUCUN ⇒ **upcoming** | ≈ 450–650 | oui |
| **1a-ii** | ledger de cycle (chaîne, verrou `wx`, write-ahead, tarif fermé, 3 caps, `reconcile`/`unlock` cli+bin) + T5..T17 + mutants | AUCUN ⇒ **upcoming** | ≈ 500–750 | oui |
| **1b-i** | migration chemin **collect** : `collect.ts` (label, suppr. `makeBudgetedCall`), `quorum.ts` (`op: OperatorLabel`), `rpc.ts` (dé-exporter `solanaEndpoints`), `close.ts` (`tick`), `rebase-crosscheck.ts` (suppr. `callsByMethod`), ré-export `BudgetExceededError` | courses Bell collect GATÉES ⇒ **BRANCHÉ** | ≈ 400–650 | oui |
| **1b-ii** | migration chemin **universe+eth** : `universe-cli.ts` (réordonne retry `:121`, labels, 3 lectures `CHAINSTACK_SOLANA_URL`), `universe.ts` (`Fatal403Error` canonique), `ethereum.ts` (leg ETH budgété via `collect.ts:638`), CI grep (T4) | courses universe/eth GATÉES ⇒ **BRANCHÉ** | ≈ 350–550 | oui |
| **2** | migration Ukemi (APRÈS POOL-RPC-1a) : `record.ts`/`rpc2.ts` via `runRecorder`, `sentinel/rpc.ts`, subsume U-4b-0 | courses Ukemi/U-4b GATÉES | ≈ 400–700 | oui |

- **Le G7 du lot couvre 1a-i + 1a-ii + 1b-i + 1b-ii** (un paquet sans consommateur n'est pas « built » — règle Branchement) [adv].
  **Aucun sous-lot ne clôt seul.** Chaque sous-lot est une **PR unitaire (R-25)**, projection **[à mesurer]** confirmée au G1.

---

## 9. Risques MAST (checklist de risque résiduel, doc 06) [tâche (9)]

| Mode MAST | Risque ici | Atténuation (fichier/section) |
|---|---|---|
| **Secret-leak** | URL/clé dans un log/ledger/brut ; transport injecté qui reçoit l'URL | transport `(label,…)` (§2.1 C-3, T1) ; `scrubUrls` ; ledger = `(label,method)` ; CI grep (§6-T4) |
| **Fail-open silencieux** | `instanceof BudgetExceededError` cassé (9 fichiers, `Fatal403Error`) | classe canonique ré-exportée (§2.3) + mutant T18 [C-13] |
| **Budget non attribué (HELIUS-1)** | retries non comptés (`universe-cli.ts:121`) / ledger volatil (`universe.ts:147`) / leg ETH hors budget (`collect.ts:638`) / cap absent | UNE couche de retry chez l'appelant (§2.2 C-4) ; ledger durable + floor ; 3 caps fail-closed ; leg ETH budgété (§1,§5) |
| **Step-repetition / concurrence** | écrivains parallèles forkent la chaîne | verrou `openSync("wx")` fail-closed + mutant `"w"` (§3.3 C-9) |
| **No-attempt-to-verify** | garde « built » sans preuve ; rapprochement lu par un LLM | test d'intégration non-LLM ; `reconcile` servi (§4 C-6, T16) |
| **Information-withholding** | tarif inconnu tarifé 0 ; RU promis mais non évaluable | méthode hors table ⇒ fail-closed (§3.2 C-14) ; cap RU [à étalonner] déclaré (§3.4 C-7) |
| **Spec-gaming / over-claim** | « impossible » au sens fort ; cap RU non calculable annoncé comme dur | scope 3 couches honnêtes (§1 C-2) ; 1ʳᵉ course Chainstack = requêtes seul (§3.4, R-21) |
| **Incorrect-verification** | rapprochement symétrique ; rollover soustrait deux cycles ; délai de consolidation | GO asymétrique dur (§4) ; NO-GO rollover (T17) ; délai déclaré (§4 C-7) |

---

## 10. Rulings du checkpoint-1 (Q1..Q7) — registre [C-*]

> Statut : **[ancré]** = fondé sur `CHANTIERS.md:480/487` + décisions (record persisté [lu]) ; **[confirmé par acceptation]** = le verdict
> ACCEPTE-AVEC-CORRECTIONS n'inscrit AUCUNE des 14 corrections contre ce choix ⇒ le choix du plan tient. (Le verbatim validateur est
> indisponible, §provenance ; l'orchestrateur substitue s'il diverge.)

- **Q1** [ancré] — **verrou retenu**, primitive spécifiée : `openSync(<cycle>/<op>.lock, "wx")` + sous-commande `unlock` chaînée (C-9, §3.3).
  La variante « fichiers par-processus sommés » est écartée.
- **Q2** [confirmé par acceptation] — méthode hors table de tarif ⇒ **refus** (fail-closed), pas pire-cas ×10 (§3.2, T15). Renforcé par C-14
  (table Helius désormais [lu] complète).
- **Q3** [ancré] — **scission décidée d'emblée** : 1a-i / 1a-ii / 1b-i / 1b-ii (C-12, §8). Supersède le déclencheur « si G1 > 1 000 » du plan.
- **Q4** [ancré] — `HELIUS_LEDGER_DIR`/`HELIUS_CYCLE_ID`/`--cycle-floor`/`--method-caps` sont des **entrées de course REQUISES sans défaut**,
  fail-closed avant réseau (C-8, C-10, §3.1, §3.4, T12).
- **Q5** [ancré] — règle de tarif **scopée-opérateur** confirmée ET RAFFINÉE par la décision 115 : Helius table fermée (crédits) ;
  Chainstack RU (cap de cycle 16 M, [à étalonner]) ; Databento/Polygon requêtes/cycle ; keyless 0. (§3.2, §3.4-3).
- **Q6** [ancré] — dépendance dure : **fusion `-b3d-b1a` AVANT GARDE-HELIUS-1a** (`CHANTIERS.md:480`, §5).
- **Q7** [confirmé par acceptation] — `OperatorLabel` = **string branchée** (stubs inchangés, churn R-25 1b maîtrisé — §8). L'objet `{label}`
  est écarté.

---

## 11. Décisions INVESTISSEUR — registre (Q-INV closes) [supersède les questions du plan]

- **112** — Helius `CYCLE_CAP = 8 000 000` crédits (80 % du plan 10 M) ; floor épinglé au dashboard avant chaque course (aujourd'hui 60 938).
  (`CHANTIERS.md:477`.) ⇒ §3.4-3.
- **113** — tolérance de rapprochement : borne dure `Δdashboard ≤ ledger_run` + bande souple `ledger_run − Δdashboard ≤ max(50 cr, 0,5 % du
  run)` ; pré-enregistrée avant la 1ʳᵉ course. (`CHANTIERS.md:478`.) ⇒ §4.
- **114** — ledger de cycle dans `F:\monark-ledger\` (hors dépôt, sauvegardé ; `HELIUS_LEDGER_DIR` posé par l'orchestrateur).
  (`CHANTIERS.md:479`.) ⇒ §3.1.
- **115** — plafond de CYCLE sur **tout opérateur payant** : Chainstack `CYCLE_CAP_RU = 16 000 000` (80 % de l'inclus ; floor lu au tableau
  de bord Chainstack avant chaque course) ; Databento/Polygon en **requêtes par cycle** (chiffre au G1 depuis les quotas lus sur place).
  Même mécanisme fail-closed que les 8 M Helius. (`CHANTIERS.md:488`.) ⇒ §3.4-3.

> Les « déclencheurs : réponses Q-INV-1/2/3 » du plan original (§12) sont **CLOS** : 113/112/114 y répondent, 115 étend au multi-opérateur.

---

## 12. ADR + provenance (règle de branchement — tuyaux déclarés de CE lot)

**ADR à créer par le G1** [C-11] : **`docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md`** — chemin réconcilié à la convention DÉPÔT
`docs/adr/` (33 ADR existants [lu glob], **zéro** `ADR-*.md` à la racine `docs/`). (Le brief/`CHANTIERS.md:487` écrivent « docs/ADR-*.md »
sans le sous-dossier `adr/` — reconcilié ci-dessus ; ruling d'un mot pour l'orchestrateur s'il vise littéralement la racine.) Statut
« proposé au G0 → adopté au G1 ». Il porte : D1 client handle-based (endpoint jamais rendu, transport `(label,…)`) ; D2 ledger de cycle
(env-dérivé `F:\monark-ledger\`, chaîné, requêtes-primaires/crédits-dérivés, tarif Helius fermé [lu FAITS], write-ahead, verrou `wx`) ;
D3 trois caps fail-closed (multi-opérateur, décision 115) ; D4 rapprochement asymétrique SERVI (`reconcile` non-LLM) ; D5 migration
(b3db1a dur ; Ukemi post POOL-RPC-1a ; U-4b-0 subsumé) ; D6 `error_origin` HELIUS-1 (primaire orchestrateur / contributif worker -b3a-2,
`RAPPROCHEMENT §8`) ; MAST (§9) ; table de tuyaux (§7). Amende implicitement `docs/G0-lot-u4b.md` §6/§8-0-1 (U-4b-0 → « consommer
`@monark/rpc-guard` »).

**Ce lot ne crée pas de dette nue** : chaque reste est un item formé à déclencheur — Ukemi (déclencheur : fusion POOL-RPC-1a) ;
`-iii-a1-bis` (déclencheur : migration 1b ou gel explicite) ; chiffres Databento/Polygon requêtes/cycle (déclencheur : lecture orchestrateur
des quotas sur place au G1) ; modèle RU/méthode Chainstack (déclencheur : étalonnage 1ʳᵉ course) ; verbatim validateur (déclencheur :
restauration de `a5b427a48e37fb967.output`). Aucun papier introuvable (plan interne, sources = fichiers du dépôt [lu] + FAITS orchestrateur).

---

## RÉSUMÉ (15 lignes)
1. **Modèle** : `claude-opus-4-8[1m]` (R-1, préfixe conforme). Pli reconstruit (avis validateur 0 o — item formé §provenance).
2. **Objet** : rendre HELIUS-1 (résidu ≈ 4 963 gTfA `full` ≈ 49 630 cr) non-reproductible AVANT toute course Bell.
3. **[C-1] Cause aggravée** : le dépôt PORTE le défaut — `universe-cli.ts:121` (retry sous tick, H-B), `:77`/`universe.ts:147` (ledger dans
   `--out`, absent⇒0), `collect.ts:638`/`ethereum.ts:60-78` (leg ETH hors budget). Inventaire complet des 7 `fetch(` en §2.0.
4. **(1) Client unique** `@monark/rpc-guard`, handle-based : `call(op,method,params)` — URL PAYANTE jamais rendue ; **[C-3]** transport injecté
   reçoit `(label,…)` jamais l'URL (test espion T1) ; `solanaEndpoints` dé-exporté.
5. **[C-4] UNE couche de retry** chez l'appelant (`withRetry`/`withUniverseRetry` enveloppent `client.call`) ; le client ne retry pas, un
   `call` = une tentative = une ligne ledger ; mutant retry-emboîté rougit T5.
6. **[C-2] Couche CI** : `git grep 'fetch('`/`node:http`/`undici`/`child_process`/`process.env.<clé>` hors client ⇒ 0 ; `exports` map (T3) ;
   allowlist exacte à déclencheur (`sentinel/rpc.ts:52-77` jusqu'au lot 2).
7. **[C-13] `instanceof`** : classe canonique ré-exportée dans les 9 fichiers source ; `Fatal403Error` (`universe.ts:96`) étend la canonique ;
   mutant T18.
8. **(2) Ledger de cycle** `F:\monark-ledger\<cycle>\` (décision 114), hors `--out`, `HELIUS_CYCLE_ID` épinglé, chaîné (`verifyLedgerChain`),
   **[C-7] requêtes primaires / crédits dérivés** ; **[C-14] tarif Helius [lu] FAITS** (gTfA/getProgramAccounts/DAS/archival 10, autres 1) ;
   write-ahead ; **[C-9] verrou `openSync("wx")` + `unlock` servi**.
9. **[C-8] Anti-reset + entrées requises** : floor obligatoire (60 938) ⇒ prior = `max(floor, Σ)` ; `HELIUS_LEDGER_DIR` (parent pré-existant),
   `HELIUS_CYCLE_ID`, `--cycle-floor`, **[C-10] `--method-caps`** REQUIS sans défaut ; `floor > CAP` ⇒ throw.
10. **(3) Trois caps fail-closed multi-opérateur (décision 115)** : Helius 8 M cr (112) ; Chainstack 16 M RU ([à étalonner], 1ʳᵉ course =
    requêtes seul) ; Databento/Polygon requêtes/cycle (G1).
11. **(4) [C-6] Rapprochement SERVI** `rpc-guard reconcile` (non-LLM) : `Δdashboard ≤ ledger_run` DUR + bande `max(50cr,0,5%)` (113) ; ligne
    `reconciled` chaînée ; **[C-7]** délai de consolidation, rollover ⇒ NO-GO, « aucun autre process » clause de protocole.
12. **(5) [C-5] 18 tests numérotés T1..T18** (liste fermée) + 12 mutants ; chaque mutant nomme un test existant.
13. **(6) Migration** : `runMain`/`runRebaseCrosscheckCli` consomment le client ; base = worktree b3db1a (dépendance dure, ruling Q6) ; Ukemi
    APRÈS POOL-RPC-1a ; U-4b-0 subsumé.
14. **(8) [C-12] Scission d'emblée (ruling Q3)** : 1a-i/1a-ii (upcoming) + 1b-i/1b-ii (branché) + 2 Ukemi ; churn providers 190 occ/26 fichiers
    maîtrisé par `OperatorLabel` string branchée (ruling Q7) ; G7 couvre 1a+1b ; aucun sous-lot ne clôt seul.
15. **Zéro dette nue** : chaque reste = item formé à déclencheur ; **[C-11]** ADR `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` ; les
    [2nd] (60 938, 10 M) signalés, le tarif Helius passé en [lu] (FAITS).

## Rulings de l'orchestrateur après le pli (2026-09-21)
- Chemin d'ADR : `docs/adr/` (convention mesurée : 33 fichiers) — la mention « docs/ADR-*.md » du checkpoint-1 était erronée.
- Q2 (refus fail-closed d'une méthode à tarif inconnu) et Q7 (label branché, pas objet) : CONFIRMÉS par l'orchestrateur (l'avis verbatim du validateur n'a pas été persisté par l'outillage ; le résumé de CHANTIERS fait foi ; incident d'outillage consigné, sans effet sur les 14 corrections).
- Première course Chainstack = étalonnage RU (`--max-calls` seul), cap 16 M RU effectif dès la course 2 (décision 115 respectée, mesure d'abord).
- Ordre : fusion -b3d-b1a → GARDE-HELIUS-1a-i/1a-ii (paquet, hors app) → 1b-i/1b-ii (Bell) → 2 (Ukemi, après POOL-RPC-1a).
