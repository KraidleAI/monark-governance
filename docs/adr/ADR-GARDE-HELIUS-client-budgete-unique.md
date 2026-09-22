# ADR-GARDE-HELIUS — Client RPC budgété unique `@monark/rpc-guard` (ledger de cycle durable + rapprochement servi)

- **Statut** : proposé au G0 → **adopté au G1** (sous-lot GARDE-HELIUS-1a : le PAQUET seul, `packages/rpc-guard/`).
- **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni).
- **Provenance** : worker G1 `claude-opus-4-8[1m]`, 2026-09-21, worktree `lot/garde-helius-1a` (base `514ee1a`) ; réviseur =
  orchestrateur (R-21, vérification adversariale). Aucun réseau, aucun secret lu, aucun commit (R-20).
- **Sources** : plan plié `docs/G0-lot-garde-helius.md` (C-1..C-14, rulings Q1..Q7) + `docs/CHECKPOINT1-lot-garde-helius.md` +
  décisions investisseur 112-115 + fichiers du dépôt [lu] à `fichier:ligne` + `FAITS-tarification-helius-2026-09-21.md` (tarif Helius [lu]).
- **Contexte** : rendre non-reproductible l'incident HELIUS-1 (résidu ≈ 4 963 `getTransactionsForAddress full` ≈ 49 630 crédits). Le
  dépôt PORTE des chemins qui le rejouent (retry sous le tick `universe-cli.ts:121`, ledger dans `--out` `:77`/`universe.ts:147`,
  leg ETH hors budget `collect.ts:638`). Ce lot factorise UN client budgété unique, seul détenteur des endpoints ; la migration des
  apps (1b) et d'Ukemi (2) le consomment. 1a livre le PAQUET, **UPCOMING** tant que 1b ne le branche pas.

## Décisions

### D1 — Client handle-based, l'endpoint n'est JAMAIS rendu (tâche 1, C-2/C-3, ruling Q7)
L'API parle **labels** : `call(op: OperatorLabel, method, params)` où `OperatorLabel` est une **string branchée** (ruling Q7 : stubs
`(u,m,p)` inchangés, churn R-25 maîtrisé), jamais une URL. Le transport injecté reçoit le **label** (`Transport = (op, method, params)`),
jamais l'URL (C-3, test **T1**). La résolution `label→URL` (depuis l'env) vit **uniquement** dans le transport par défaut privé
(`src/transport.ts`), le SEUL module qui lit une clé payante et fait un `fetch` (allowlist CI, D3-couche-ii). `src/client.ts` ne lit AUCUNE
clé et ne détient AUCUNE URL. La `exports` map n'expose que `.` → `./src/index.ts` ; un import profond est refusé par Node
(`ERR_PACKAGE_PATH_NOT_EXPORTED`, test **T3**). **Une seule couche de retry, chez l'appelant** (C-4) : `client.call` fait EXACTEMENT une
tentative (une ligne write-ahead + un `fetch`), sans réessayer ; un `withRetry` d'appelant ré-entre `call`, donc chaque tentative est
comptée (test **T5** ; mutants « retry emboîté » et « append après fetch »).

### D2 — Ledger de cycle durable, env-dérivé, chaîné (tâche 2, C-7/C-8/C-9/C-14, décision 114)
- **Emplacement hors `--out`** : `${HELIUS_LEDGER_DIR}/${cycle}/ledger.jsonl` (décision 114 : `F:\monark-ledger\`, hors dépôt). Le parent
  `HELIUS_LEDGER_DIR` **doit pré-exister** ; on ne crée que le sous-dossier `<cycle>/` (C-8, test **T11** ; mutant `mkdir recursive`).
- **Fait primaire = la REQUÊTE par (opérateur, méthode) ; crédits DÉRIVÉS** (C-7) : `crédits = requêtes × tarif`. Tarif Helius **table
  FERMÉE [lu]** (`src/tariff.ts`, `tariff_version` figé) : `getTransactionsForAddress`/`getProgramAccounts`/DAS/archival = **10**, autres
  RPC = **1** ; **méthode absente ⇒ fail-closed** (jamais 0, ruling Q2, test **T15** ; mutant « tarif inconnu »). Calque
  `rebase-crosscheck.ts:55-56` (`CREDITS_PER_GTFA=10`, `CREDITS_PER_GET_TX=1`). Tarif scopé opérateur (Q5) : Chainstack RU / Databento &
  Polygon requêtes / keyless 0 — **items formés** (voir « Items »).
- **Append-only chaîné, write-ahead** : chaque tentative appende `{prev_entry_sha256, cycle_id, tariff_version, by_op_method, outcome,
  credits_derived, entry_sha256}` **AVANT** le `fetch` (un crash sur-compte, jamais ne sous-compte) ; une tentative refusée reçoit sa ligne
  `outcome=refused`. Chaînage **byte-identique** au calque `rebase-crosscheck.ts:136-148` (`entry_sha256 = sha256(JSON.stringify(core))`,
  `prev` en 1ʳᵉ clé), verrouillé par `test/ledger-format-lock.test.ts` (importe la référence, prouve la reproduction bit-à-bit).
  `verifyCycleLedger` rejoué au démarrage : chaîne cassée/ligne illisible ⇒ **throw** (jamais lu comme 0, calque `readPriorCalls`
  `universe.ts:147-152`, test **T9**). **Anti-reset** : `prior = max(floor, Σ crédits attempted)` ⇒ supprimer/vider le ledger ne rouvre pas
  le budget sous le floor (test **T10** ; mutant « reset-on-missing »).
- **Verrou exclusif par (cycle, opérateur)** : `openSync(<cycle>/<op>.lock, "wx")` (`wx` = création exclusive) ⇒ un 2ᵉ écrivain sur le même
  opérateur reçoit `EEXIST` = fail-closed (C-9, test **T13** ; mutant `"w"`). Le fd est **fermé immédiatement** (le verrou = l'existence du
  fichier ; un fd ouvert bloque `unlink` sous Windows). Libération = sous-commande servie `unlock` qui appende une ligne chaînée
  `outcome=unlocked` (explicite, consignée ; test **T14**).

### D3 — Trois plafonds fail-closed, multi-opérateur (tâche 3, C-10, décisions 112/115)
Réévalués à CHAQUE appel, write-ahead (le check précède le `fetch`) : (1) **par run** `--max-calls` (>0, requis) + `--max-credits` ;
(2) **par méthode** `--method-caps` **REQUIS sans défaut** (absent ⇒ throw avant réseau, C-10, test **T12** ; une méthode non listée reste
bornée par les caps run+cycle — choix documenté, intention « gTfA bas ») ; (3) **de cycle sur tout opérateur payant** : Helius
`CYCLE_CAP = 8 000 000` crédits (décision 112) — `prior + coût_tentative > cap ⇒ BudgetExceededError` (test **T8**). **Décision 115** : tout
opérateur payant DOIT porter un cap de cycle, sinon `makeClient` fail-close à la construction (renforce T12) ; `floor > cap ⇒ throw`.
`BudgetExceededError` **canonique exportée** (`src/errors.ts`, calque `quorum.ts:24`) : identité `instanceof` préservée à travers la
frontière du paquet (C-13, test **T18** self-référencé ; mutant « instanceof cassé »). Couche **CI (ii)** : test racine
`fetch_only_inside_client` interdit `fetch(`/`node:http(s)`/`undici`/`child_process`/`env.<clé-payante>` hors `src/transport.ts` (allowlist
EXACTE, une entrée ; déclencheur de retrait = 0 usage restant). **État 1a** : la moitié `packages/*/src` est VERTE (active) ; la moitié
`apps/bell/src` est ROUGE (**14 hits mesurés** sur base `514ee1a`, listés dans l'en-tête du test) ⇒ livrée **SKIP-jusqu'à-1b**, jamais
verte par allowlist élargie.

### D4 — Rapprochement asymétrique SERVI, non-LLM (tâche 4, C-6, décision 113)
Sous-commande servie `reconcile --before <snap> --after <snap> --cycle <id>` (`src/reconcile.ts`/`src/cli.ts`). **Borne DURE**
`Δdashboard ≤ ledger_run` par méthode (dashboard au-dessus du ledger = consommation hors garde ⇒ **NO-GO**) ; **bande souple**
`ledger_run − Δdashboard ≤ max(50 cr, 0,5 %)` (décision 113). **Rollover** (`before.cycle ≠ after ≠ --cycle`) ⇒ NO-GO (deux cycles ne se
soustraient pas, C-7). Chaque run **appende une ligne chaînée `outcome=reconciled`** ; le verdict est **consommé** (exit code) — c'est le
branchement (tests **T16/T17** ; mutant « reconcile symétrique »). Une variante **symétrique** `|Δ − ledger| ≤ tol` cacherait un dépassement
dans la tolérance : rejetée.

### D5 — Migration (tâche 6, ruling Q6) — items d'ordre, pas du code 1a
Base = worktree `-b3d-b1a` (dépendance dure : **fusion `-b3d-b1a` AVANT 1a**, Q6). 1b : `collect.ts`/`universe-cli.ts`/`quorum.ts`/`rpc.ts`/
`close.ts`/`ethereum.ts`/`rebase-crosscheck.ts` consomment le client (suppr. `makeBudgetedCall` locaux ; réordonne le retry `:121` ; leg ETH
budgété ; ré-export `BudgetExceededError` dans les 9 fichiers source). Ukemi (2, APRÈS POOL-RPC-1a) : `record.ts`/`rpc2.ts`/`sentinel/rpc.ts` ;
**U-4b-0 subsumé** (« consommer `@monark/rpc-guard` », pas une 2ᵉ implémentation). Amende implicitement `docs/G0-lot-u4b.md` §6/§8-0-1.

### D6 — `error_origin` HELIUS-1
Primaire = orchestrateur (courses `.mjs` hors garde `F:\tmp\bell-b3a-2\*.mjs`) ; contributif = worker `-b3a-2` (`RAPPROCHEMENT §8`). Ce lot
supprime la classe de défaut (retry non compté, ledger volatil, cap absent, leg hors budget).

## Tuyaux déclarés (règle Branchement) — ce lot 1a livre le paquet UPCOMING
| Pièce | Entrée (qui produit) | Sortie (qui consomme) | État (où) | Test d'intégration |
|---|---|---|---|---|
| client `@monark/rpc-guard` | env (endpoints, résolus en interne) ; `floor`/`cycle_id`/`method-caps` (orchestrateur) | 1b Bell / 2 Ukemi (**upcoming** en 1a) | ledger `HELIUS_LEDGER_DIR/<cycle>/ledger.jsonl` + verrou `<cycle>/<op>.lock` | T1,T2,T3,T4 |
| ledger de cycle | `client.call` (write-ahead) | `reconcile` ; prior au démarrage | jsonl chaîné env-dérivé | T5,T6,T7,T8,T9,T10,T11,T12 |
| `reconcile` (servi) | ledger + snapshots dashboard | verdict GO/NO-GO (exit) + provenance | ligne `reconciled` chaînée | T16,T17 |
| `unlock` (servi) | verrou tenu + acte orchestrateur | libération consignée | ligne `unlocked` chaînée | T13,T14 |
| surface d'erreur 2b-i (`classify.ts` : `ERROR_HINT_TOKENS` + `isResultLimit`/`isPlanLimited`/`isRevertText`/`isRpcRevert`/`closedHint` ; `RpcError` + `.data` + `.detail`) | `raise` du transport (corps d'erreur brut) | `rpc2.ts` (ré-export `RpcError` + import des prédicats, quorum `revertKey`) + journal `rpc_errors` | **upcoming** (mémoire en 2b-i ; disque en 2b-ii) | `error-hint.test.ts` (surface d'erreur) + tests imposés 2b-ii |

**Branchement 1a** : le paquet est **UPCOMING** (aucun consommateur servi tant que 1b ne le branche pas). La composition servie
(`reconcile`/`unlock` : argv → ligne ledger chaînée → exit code) est prouvée par test d'intégration non-LLM (T16/T17/T14 via `runCli`).

## Risques MAST (résidu)
Secret-leak → transport `(label,…)` + `env.<clé>` confiné à `transport.ts` + CI grep (T4) ; Fail-open silencieux → classe canonique
ré-exportée + T18 ; Budget non attribué → une couche de retry (T5) + ledger durable + floor + 3 caps ; Concurrence → verrou `wx` (T13) ;
No-attempt-to-verify → `reconcile` servi non-LLM (T16) ; Information-withholding → méthode inconnue fail-closed (T15), cap RU [à étalonner]
déclaré ; Spec-gaming → « impossible » scopé en 3 couches honnêtes (API / CI / détection).

## Items formés à déclencheur (zéro dette nue)
- **Mutant « retry sous le tick »** (`universe-cli.ts:121`) : app hors sous-lot 1a, ne consomme pas encore le paquet ⇒ **1b-scoped** ; son
  analogue paquet « retry emboîté » EST appliqué et rougit T5. *Déclencheur* : migration 1b.
- **Multi-opérateur (C-V-9, reformulé ; RÉALISÉ par l'amendement GARDE-HELIUS-2a, C-V-6)** : le ledger + le prior + le cap de cycle sont
  **PAR OPÉRATEUR** (un fichier `<cycle>/<op>.jsonl` par opérateur ; `priorAtOpen` par opérateur ; `unit` + `cycleCap` par opérateur). L'assertion
  « le mécanisme supporte Chainstack RU » du RENDU initial (où `priorCredits()` sommait toutes les opérations sans distinction d'unité) est
  **retirée**. Le second opérateur payant Chainstack **est** livré en 2a : `unit` ∈ `credits|ru|keyless` (l'ancien `requests` est retiré,
  item D-3 à déclencheur 1b) ; le **tarif RU par méthode `chainstackRu` est évaluable dès la 1ʳᵉ course** (A-1, listes fermées des FAITS) ⇒ le
  cap de cycle 16 M RU (décision 115) **est applicable** par appel (l'ancienne clause « non-applicable-cette-course avant étalonnage » est
  **superséée par A-1/A-2**) ; SEUL le **verdict de rapprochement RU** attend l'étalonnage (course `aggregate-calibration`, A-4).
- **`bin` d'exécutable** : `runCli` est la surface servie testée ; le wrapper `bin` (process.argv + fs réel) est un item de câblage 1b.
- **Finding CI grep** : le motif nu `undici` matche un COMMENTAIRE (`universe-cli.ts:208`) ; le gate 1b doit ignorer les commentaires (ou
  reformuler la ligne). Rapporté, pas un défaut de code.
- **Verbatim validateur** (`a5b427a48e37fb967.output` = 0 o) : *déclencheur* = restauration ⇒ l'orchestrateur substitue tout écart.

## Corrections checkpoint-2 (validateur `claude-fable-5-1` + G2, 2026-09-21) — fold C-V-1..9 + C-G2-1..6

Le HEAD `9201c74` a été jugé ACCEPTE-AVEC-CORRECTIONS (8 bloquantes) et G2 FAIL convergent. Les décisions D1/D3/D4 ci-dessus
sont **amendées** par ce fold (supersède le texte antérieur là où il diverge). Chaque point : code (`fichier`) + test + mutant.

- **C-V-1 — formule du cap de cycle** (`client.ts`). `prior_cycle` est **figé à l'ouverture du ledger** (`ledger.ts openOperatorLedger` :
  `frozenPrior = max(floor, Σ_at_open attempted)`) ; la garde est `prior_cycle + runCredits_op + coût > cap` (formule G0 §3.4-3), PLUS
  `>` direct (jamais `max(floor, Σ_incl_run)` qui absorbait le run sous le floor). Test **T8** avec floor 15 / cap 25 ⇒ 1 seul transport
  (2ᵉ gTfA refusée `cycle_cap`) ; mutant `cycle_cap_removed`. `error_origin` : worker.
- **C-V-2 — surface publique** (`index.ts`, `guarded.ts`). `resolveOperators`/`resolveConfig`/`InMemorySink`/`makeClient`/`openOperatorLedger`/
  `acquireLock`/`runUnlock` **ne sont plus exportés** (tests par import relatif). Unique chemin public payant : `openGuardedClient(env, limits,
  ledgerDir, cycleId)` = mètre + commit + `CycleLedger` durable + verrou. **T2** = sonde fonctionnelle (P6 : depuis l'API publique, tout `fetch`
  est précédé d'une ligne ledger sur disque) + **jeu d'exports fermé** asserté. `error_origin` : partagé worker/planificateur/validateur.
- **C-V-3 — fuite de clé dans l'erreur transport** (`transport.ts`). `fetch` enveloppé try/catch ; relance une erreur **NEUVE** `label + nom
  d'erreur` (jamais le message ni `e.input` de la `TypeError`), `scrubUrls` (calque `record.ts:33`). Test `transport_error_never_carries_url_or_key`
  (URL non analysable hors ligne). `error_origin` : worker.
- **C-V-4 / C-G2-4 — verrou branché dans le chemin d'écriture** (`client.ts`, `cli.ts`). `makeClient` acquiert le verrou par opérateur payant
  À LA CONSTRUCTION (après validation des entrées, avant tout transport) ; `cli reconcile` (qui appende) acquiert+relâche le verrou aussi
  (`releaseLock`). **T13** = composition bi-processus (2ᵉ `makeClient` sur le même dir ⇒ `LockHeldError`, 0 transport) ; mutant `lock_w_not_wx`.
  **Conséquence de protocole** : un `reconcile` lancé PENDANT une course active (verrou tenu) ⇒ `LockHeldError`, exit ≠ 0 — l'orchestrateur
  fait `unlock` d'abord, puis `reconcile`.
- **C-V-5 / C-G2-3 — `--method-caps` FAIL-CLOSED par méthode** (`client.ts`). Méthode absente de la table ⇒ `refused reason=method_cap_unlisted`
  (ligne ledger + `BudgetExceededError`, 0 transport) ; table vide sur opérateur payant ⇒ throw à la construction. **T12** (M7a table vide,
  M7b non-listée) ; mutants `empty_methodcaps_allowed`, `unlisted_method_allowed`. Contrat 1b : toute méthode utilisée est listée.
- **C-V-6 — méthode inconnue via `call`** (`client.ts`). Le tarif inconnu est capté et routé vers `refuse(op, method, "unknown_method")`
  (ligne ledger + `BudgetExceededError`), jamais un `Error` nu. Test `unknown_method_is_ledgered_not_a_bare_error`.
- **C-V-7 / C-G2-6 — rapprochement (D4 amendé)** (`reconcile.ts`). `ledger_run` = entrées `attempted` **depuis la dernière ligne `reconciled`**
  (fenêtre chaînée) ; **borne dure PAR MÉTHODE** `Δ ≤ ledger_run` ; **bande souple = 0,5 % du RUN TOTAL** (décision 113 verbatim, appliquée une
  fois à l'agrégat, jamais par méthode). **T16** deux courses (2ᵉ honnête ⇒ GO ; 500 cr hors ledger ⇒ NO-GO dur ; piège symétrique 1030/1000 ⇒
  NO-GO dur) ; mutant `reconcile_symmetric`. `error_origin` : planificateur/validateur.
- **C-V-8 — tête persistée (sidecar)** (`ledger.ts`). Sidecar `<cycle>/<op>.head` (sha de la dernière entrée) réécrit APRÈS chaque append ; à
  l'ouverture : ledger présent + tête absente ⇒ throw ; tête ≠ tête recomputée ⇒ throw (troncature de queue P2, préfixe de chaîne valide) ;
  ledger ET tête absents ⇒ cycle neuf. **T9** (b/c) + **T10** (efface les DEUX fichiers). `error_origin` : planificateur/validateur.
- **C-V-9 — éditorial** : `tariff.ts` « decision 55 » → « décisions 112/C-14 » ; **T14 via `runCli(["unlock", …])`** (surface servie, non
  `runUnlock` direct) ; « supporte Chainstack RU » reformulé (item « prior par opérateur », ci-dessus). `error_origin` : worker.
- **C-G2-1** — sonde reproduite en test `cycle_cap_floor_probe` (floor 100 / cap 115 / gTfA 10 ⇒ 1 succès, pas 11).
- **C-G2-2** — test `run_credits_cap_stops` (`--max-credits` bas + gTfA ⇒ `refused run_credits`, exit ≠ 0) ; mutant `run_credits_removed`.
- **C-G2-5** — « 0 fetch sur un refus » épinglé par `assert.equal(spyCalls, N)` dans `run_cap_stops`, `run_credits_cap_stops`, `cycle_cap_stops`,
  `cycle_cap_floor_probe`, `unknown_method_*`.

**PER-OPÉRATEUR est structurel (D2 amendé)** : un `ledger.jsonl` unique avec des verrous par opérateur laisserait deux courses (helius,
chainstack) appender concurremment et **forker la chaîne** — le hasard C-9 même que le verrou existe pour fermer. Des fichiers par opérateur
(`<op>.jsonl` + `<op>.head` + `<op>.lock`) le ferment par construction, et donnent un prior par opérateur (C-V-9). **Second checkpoint-2 requis**
sur ce HEAD corrigé (rejeu P3-floor, P6, sonde bi-processus par `makeClient`+`call`).

## Amendement GARDE-HELIUS-2a — second opérateur payant Chainstack (RU) + cœur multi-opérateur (daté 2026-09-21)

- **Provenance** : worker G1 `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-21, worktree
  `lot/garde-helius-2a` (base `5d177db`) ; réviseur = orchestrateur (R-21, vérification adversariale) ; aucun réseau, aucun secret lu, aucun
  commit (R-20). Sous-lot **2a = moitié PAQUET** du lot 2 (`packages/rpc-guard/**` seul) ; la migration du recorder Ukemi + le grep CI sont le
  sous-lot **2b** (déclencheur : ce paquet fusionné). Sources : `docs/G0-ADDENDUM-lot-garde-helius-2.md` (pli checkpoint-1 delta C-1..C-7) +
  `FAITS-tarification-chainstack-2026-09-21` (tarif [lu] première main + complément console Statistics pts 8-11, orchestrateur 2026-09-21).

- **A-1 — tarif RU `chainstackRu(method)` (D1), CONSERVATEUR fail-closed** dans `src/tariff.ts`, calque de `heliusCredits` : 2 RU pour toute
  méthode des listes FERMÉES des FAITS (20 EVM sensibles à l'âge, pt 4 ; `debug_*`/`trace_*`/`arbtrace_*` par préfixe + `eth_callMany`, pt 6 ;
  8 Solana archivables, pt 7), 1 RU pour un jeu FERMÉ de méthodes EVM connues non sensibles à l'âge (dérivées de la queue « toute autre méthode
  EVM = 1 RU », pt 4), **méthode inconnue ⇒ `throw` `unknown_method`** (jamais un défaut à 1 qui sous-compterait une archivale oubliée). Le
  garde tourne hors ligne et ne lit pas le tip ⇒ le sur-compte est absorbé par le sens asymétrique du rapprochement (`Δdashboard ≤ ledger_run`,
  décision 113) ; jamais un sous-compte. `CHAINSTACK_TARIFF_VERSION = "chainstack-2026-09-21"`. **Hypothèse « nœud Global » CONFIRMÉE** (console
  Statistics, pt 9 : classification PAR REQUÊTE) ⇒ le tarif conservateur reste la règle des CAPS ; la 1ʳᵉ course Chainstack reste un étalonnage
  RU (C-1). Le recorder n'appelle aujourd'hui QUE des méthodes à 2 RU (eth_call / eth_getLogs / eth_getBlockByNumber) : le jeu 1 RU existe pour
  qu'une méthode qui dériverait fail-close plutôt que de recevoir un prix par défaut. `tariff_version` est désormais **par opérateur**
  (`tariffVersionOf(op)`) : une ligne `chainstack.jsonl` ne porte plus la version Helius (mensonge de provenance que le rapprochement lirait).

- **A-2 — cœur PAR OPÉRATEUR (C-2 + D3), amende D2/D3/C-V-4** : `RunLimits.cycleFloor` devient `Record<label, number>` ; le cap de run scalaire
  `maxCredits` devient `runCaps: Record<label, number>` (RU jamais sommé aux crédits) ; `maxCalls` reste un compte d'essais global (agnostique
  d'unité) ; `methodCaps` reste global mais **compté par `(op, method)`** (une méthode keyless ne dépense jamais le cap d'un opérateur payant).
  `spent()` rend `{ attempts, byOperator: Record<label, number> }` — les unités ne sont **jamais** fusionnées. `openGuardedClient` prend un
  **`cycles: Record<label, cycleId>`** dont les clés = le **sous-ensemble demandé** : seuls ces opérateurs sont ouverts et verrouillés (une course
  Ukemi ne verrouille jamais `helius`). **Le verrouillage migre de `makeClient` vers `openGuardedClient`** (amende C-V-4) : ordre = valider la
  config (avant tout verrou) → **acquisition multi-verrou ATOMIQUE en ordre trié, rollback des k-1 si le k-ième échoue** (`releaseLock` = unlink,
  jamais une ligne `unlocked`) → **ouverture des ledgers SOUS le verrou (prior figé APRÈS le verrou)** → `makeClient` (métrage seul, ne verrouille
  plus). Un verrou tenu ⇒ `LockHeldError` AVANT toute lecture de ledger (barrière déterministe : la sonde `prior_is_frozen_after_lock` laisse un
  writer tenir le verrou avec une ligne malformée sur disque ; le chemin correct lève `LockHeldError`, le mutant « ouvrir avant verrou » lève
  `/malformed/`). **Tous les opérateurs demandés sont verrouillés (payants ET keyless)** — extension du « keyless jamais verrouillé » de 1a, motivée
  par l'intégrité de chaîne de tout ledger et par C-2 verbatim (« demandés … verrouillés »), et TRANCHÉE par le ruling (h) du checkpoint-2 ; 2b
  relâche tous les opérateurs demandés en fin de course. **Convention de cycle keyless (ruling h)** : le `cycles[label]` d'un opérateur keyless =
  le **cycle de l'opérateur PAYANT de la course** (un keyless n'a pas de cycle de facturation propre ; son ledger vit sous le même `<cycle>/`).
  Un test (`keyless_operator_is_locked_when_requested`) épingle qu'un keyless demandé EST verrouillé ; le mutant « keyless non verrouillé » rougit.
  `OperatorClass.unit` : `"credits" | "ru" | "keyless"` (retrait de `"requests"`, aucun opérateur ne l'utilisait).

- **A-3 — opérateur `chainstack` + labels keyless ETH + transport durci** dans `src/transport.ts` (SEUL lecteur de `env.CHAINSTACK_ETH_URL`, SEUL
  site `fetch`) : `chainstack` = `{ unit:"ru", credits: chainstackRu, cycleCap: CHAINSTACK_CYCLE_CAP_RU (16 000 000, décision 115) }` ; les 5
  opérateurs gratuits que le recorder utilise aujourd'hui comme URL deviennent des **labels résolus** (`drpc.org`, `mevblocker.io`, `nodies.app`,
  `pocket.network`, `tenderly.co`), coût 0, comptés, ORDRE ÉPINGLÉ identique aux listes `ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` de `rpc2.ts`
  (exports `ETH_CALL_KEYLESS_LABELS`/`GET_LOGS_KEYLESS_LABELS` + test de verrou d'ordre par import dynamique non littéral). **Timeout 30 s + abort +
  hook d'erreur** ajoutés (C-5, absents en 1a). **QUATRE chemins d'erreur typés (C-V-2, corrige la première rédaction de A-3)** : réseau/abort,
  HTTP non-ok (corps NETTOYÉ conservé — `getLogsVia` découpe une plage sur un corps 400), corps non-JSON, et **erreur JSON-RPC en HTTP 200** (qui
  RÉSOLVAIT `undefined` en 1a — deux fournisseurs en erreur auraient paru concordants) lèvent tous une erreur TYPÉE `TransportError` (exportée)
  portant le `code` (statut HTTP ou code JSON-RPC). **C-R-1 (re-checkpoint)** : le corps repris est **EXPURGÉ par opérateur** avant impression —
  `scrubUrls` seul (préfixe `http(s)://`) laissait fuir une clé reprise sans préfixe (`host/CLÉ`, la clé = segment de chemin de `CHAINSTACK_ETH_URL`) ;
  `raise` construit UN regex **insensible à la casse** sur toutes les formes du secret de l'opérateur — URL complète, `host+path` sans préfixe,
  hôte, chaque segment de chemin **non trivial** (allowlist structurelle `{v1,v2,rpc,eth,api,…}` ⇒ tout AUTRE segment, de toute longueur, est la
  clé) et chaque valeur de query (`api-key`), chacune aussi en forme **%-encodée et JSON-échappée** (un corps réel est JSON) — remplacées par
  `<redacted>` (calque `redactEndpoint`). **Fail-closed** : URL de l'opérateur absente ou non analysable ⇒ corps NON repris. Les opérateurs keyless
  n'ont pas de secret : leur hôte est redacté aussi (uniformité, sans effet, le corps utile n'a pas d'hôte). Épinglé par
  `transport_error_never_echoes_operator_key` (hôte casse-mixte + clé chemin + clé query + URL + forme JSON) et
  `transport_error_drops_body_when_operator_url_unparseable` ; mutants **X1** (scrub préfixé seul), **X2** (scrub retiré), **X3** (fail-closed→ouvert),
  **X4** (valeur de query non redactée), **X5** (redaction sensible à la casse) ROUGES. Le hook reçoit `(op, errorName, code)` — jamais l'URL ni le corps. **Le hook du
  transport est un point d'injection NEUF et INDÉPENDANT** ; il **ne remplace PAS** le classement du recorder : en 2b, le moniteur 5 %
  (`onRpcError`) **re-branche SON PROPRE puits** dessus (un re-câblage), le transport ne reprend pas sa logique de quorum/revert.

- **A-3bis — C-R-3 (re-checkpoint, DEUX instances) : expurger AVANT de tronquer + userinfo + résidus déclarés.** Défaut mesuré : le corps
  subissait le collapse `\s+` puis `slice(0, 160)` **AVANT** `redact` ⇒ une clé à cheval sur le 160ᵉ caractère n'était plus reconnue et son
  préfixe fuyait (9 caractères mesurés). Fix : `raise` passe le corps **BRUT** à `redact`, puis collapse+tronque le RÉSULTAT (`transport.ts:107`) ;
  les deux chemins (HTTP non-ok `:130`, non-JSON `:135`) passent le corps brut. **C-GD-1 (userinfo)** : `redact` cible aussi `u.username` et
  `u.password` (formes brute, %-encodée, JSON-échappée) — la classe est couverte même si l'URL réelle n'en porte pas. Épinglé par
  `transport_error_key_straddling_truncation_never_leaks` (les deux chemins, aucun préfixe ≥ 4 de la clé) et `transport_error_never_echoes_operator_userinfo`
  (mutants **Y1** « tronquer avant expurger » et **Y2** « userinfo non expurgé » ROUGES ; sonde `r2-leakforms` rejouée ⇒ `leakedPrefixChars=0`
  sur les deux chemins, corps 400 intact). `error_origin` : worker (C-V-2).
  - **Résidu DÉCLARÉ 1 — clé fendue par un blanc DANS le corps brut** : un serveur qui insère un espace/retour ligne AU MILIEU de la clé qu'il
    renvoie (`FAKE\nKEY`) n'est pas expurgeable par motif littéral (pathologique : la clé est alors elle-même cassée). Borne : le message n'est
    **jamais publié**, il part au journal `rpcErrors` local (2b) ; non mitigé ici (un motif à `\s*` intercalé serait un risque ReDoS).
  - **Résidu DÉCLARÉ 2 — C-GD-2 (ruling orchestrateur)** : une clé **transformée** par le serveur (base64/hex de la clé) n'est pas expurgeable par
    motif. Borne identique (message → journal local, jamais publié). **Item formé** : « pour un opérateur PAYANT, ne JAMAIS reprendre le corps
    hors code HTTP/RPC + indice de plage » — *déclencheur* = **G0 du lot 2b** (à trancher là : 2b consomme le corps 400 pour le découpage de
    plage `getLogsVia`). NON implémenté ici (le retrait du corps casserait le découpage de plage sans le contrat 2b).

- **A-4 — rapprochement mode AGRÉGAT DÉCLARÉ + course d'ÉTALONNAGE (D4 amendé ; C-V-3)** : la console Chainstack (page Statistics, FAITS pt 10)
  n'offre **aucune ventilation par méthode** — total RU par réseau et par jour seulement. `runReconcile(..., mode)` prend un mode DÉCLARÉ ;
  `Snapshot` gagne une forme agrégée `{ total_ru }` ; **EXACTEMENT un champ par mode** (`byMethod` XOR `total_ru`) — un snapshot croisé est
  fail-closed (`aggregate_mode_needs_total_ru`/`_rejects_by_method`, `per_method_mode_needs_by_method`/`_rejects_total_ru`). **Trois modes
  nommés** (`ReconcileResult.mode`) : `"per-method"` (Helius, borne dure PAR MÉTHODE + bande souple 0,5 %) ; `"aggregate"` (Chainstack, borne dure
  sur le TOTAL `Δtotal_ru ≤ Σ ledger_run` en RU conservateurs + bande souple 0,5 % **bloquante**) ; **`"aggregate-calibration"`** (1ʳᵉ course
  Chainstack, **C-V-3 — chemin de code de la course d'étalonnage**) : la borne dure BLOQUE (exit 1 si `Δtotal_ru > Σ ledger_run`) mais l'écart
  souple est **CONSIGNÉ** (`softDeviation` dans le résultat + ligne ledger, exit 0) au lieu d'un NO-GO `soft` qu'un humain devrait interpréter — la
  bande de la 2ᵉ course est pré-enregistrée depuis ce `softDeviation`. Un `Δ` négatif (compteur journalier remis à zéro) ⇒ NO-GO `negative_delta`
  (C-V-5, pas `soft`). Un opérateur **sans dashboard par méthode** (`AGGREGATE_ONLY_OPERATORS = {chainstack}`) EXIGE `--mode aggregate|aggregate-calibration`
  au CLI, fail-closed avant tout verrou (C-V-5). **A-4 porte le PROTOCOLE de rapprochement Chainstack (couche règles, pré-enregistré ; les instances
  vont au prereg U-4b-1b, épinglé par sha, ADR-U4b D4)** : (i) **fenêtre d'une JOURNÉE entière** ; (ii) **double lecture de stabilité** de `after`
  APRÈS le délai de mise à jour (« Data updates every few hours », FAITS pt 10) — deux lectures identiques espacées ; (iii) **aucun chevauchement**
  avec un créneau du job quotidien Narabi (C-4) ; (iv) le résiduel Narabi du jour soustrait est un **MINORANT** de la consommation Narabi (lu au
  journal du sentinel : nombre d'appels Chainstack du jour) — **un résiduel surestimé cacherait un contournement**, donc on soustrait la borne
  INFÉRIEURE. Le prereg U-4b-1b porte les instances : jour, heures de lecture, floor, chiffre du résiduel, sha du journal du sentinel.

- **A-5 — overage DÉSACTIVÉ (FAITS pt 8, « Extra usage: Disabled »)** : à quota atteint, Chainstack **arrête le service** au lieu de facturer ⇒ le
  risque d'un bug est l'ARRÊT (dont le job Narabi), pas une facture. Le cap de cycle 16 M RU protège donc aussi la **disponibilité** de Narabi.
  Rien à coder ; noté au registre. Quota mensuel exact et prix d'overage : NON LU (procurement si une course approche 16 M RU).

- **A-6 — allowlist du grep CI (2b, déclaré à déclencheur)** : `apps/sentinel/src/rpc.ts` reste un chemin payant HORS garde en production (job
  quotidien Narabi ; C-3/C-4) ; sa seconde entrée d'allowlist et l'élargissement de portée à `apps/sentinel/src/**` sont **déclarés à déclencheur
  (lot `NARABI-OPS-1d`)** — implémentés en **2b**, pas dans 2a (ce sous-lot ne touche NI `apps/**` NI le test racine `fetch_only_inside_client`).

- **Signatures publiques AVANT → APRÈS (2b en dépend, MAJ checkpoint-2)** : `openGuardedClient(env, limits, ledgerDir, cycleId: string)` →
  `openGuardedClient(env, limits, ledgerDir, cycles: Record<label,string>, opts?: { timeoutMs?; onTransportError?: (op, errorName, code|undefined) => void })` ;
  `RunLimits { maxCredits: number; cycleFloor: number }` → `{ runCaps: Record<label,number>; cycleFloor: Record<label,number> }` (inchangés :
  `maxCalls`, `methodCaps`) ; `BudgetedClient.spent(): { attempts; credits }` → `{ attempts; byOperator: Record<label,number> }` ;
  `OperatorClass.unit "requests"` → `"ru"` ; nouveaux exports valeur : `chainstackRu`, `CHAINSTACK_TARIFF_VERSION`, `ETH_CALL_KEYLESS_LABELS`,
  `GET_LOGS_KEYLESS_LABELS`, **`TransportError`** (erreur typée, `.code` = statut HTTP / code JSON-RPC — 2b la classe) ; nouveaux types
  `ReconcileMode` (`per-method|aggregate|aggregate-calibration`), `Snapshot.total_ru?`, `ReconcileResult.{mode, softDeviation?}` ; `runCli reconcile`
  gagne `--mode`. **CliDeps.floor reste scalaire** (CLI mono-opérateur). **2b** : passe un `cycles[label]` pour CHAQUE keyless (= cycle de l'opérateur
  payant) ; relâche TOUS les opérateurs demandés en fin de course ; re-branche son moniteur 5 % sur `onTransportError`.

- **Corrections checkpoint-2 (C-V-1..C-V-6 + ruling h, ACCEPTE-AVEC-CORRECTIONS `dd9148f`, avis `docs/CHECKPOINT2-lot-garde-helius-2a.md`)** :
  C-V-1 floor par opérateur épinglé au SITE (`guarded.ts`, `two_paid_…` via `openGuardedClient`, floors 7 999 990/15 999 990) ; C-V-2 quatre
  chemins d'erreur typés (`TransportError`, `.code`, hook `(op, errorName, code)`, une erreur JSON-RPC ne résout plus `undefined`) ; C-V-3 mode
  `aggregate-calibration` ; C-V-4 assertions « caps de run par opérateur au mètre » + « `tariff_version` par opérateur » ; C-V-5 `negative_delta`
  + `--mode` exigé pour un opérateur agrégat-seul ; C-V-6 (ce texte). Les **4 survivants** du validateur (floor au site, caps sommés, version
  constante, keyless non verrouillé) sont désormais ROUGES.

- **Registre / branchement** : le paquet reste **`upcoming`** (aucun consommateur servi tant que 2b ne branche pas le recorder par un chemin servi
  + test d'intégration non-LLM). **error_origin (proposé au G7)** : conception 2a = plan ; C-V-1/C-V-4 (mutants au mauvais site/surface),
  C-V-2 (transport 1a rendant `undefined`), C-V-3 (sortie de la course d'étalonnage) = worker (les deux affirmations d'ADR contredites, corrigées).
  Oracle (état corrigé) : `npm run ci` vert (700+ tests) ; **28 mutants** (16 du lot 1a + 7 de 2a + 5 corrections C-V) ROUGES sur leur test nommé,
  restauration byte-exacte sha256 ; une erreur eslint **pré-existante** hors périmètre (`apps/bell/test/rebase-crosscheck.test.ts:600`) et un
  `lint:ratchet` **pré-existant** rouge (70/69, 0 dans `packages/rpc-guard/test`) déclarés, non corrigés.

## Amendement GARDE-HELIUS-2b — surface d'erreur du transport (D6 + C-1..C-5), moitié PAQUET livrée (daté 2026-09-21, worker `claude-opus-4-8[1m]`)
Ce lot 2b consomme le paquet (migration du recorder) et, ce faisant, a révélé des besoins SUR LE PAQUET (trois classifieurs, indice fermé, `.data`,
journal sur disque) — travail « sur le paquet exécuté dans le lot de migration » (couture déclarée CA-2). **Découpe R-25 (mesurée)** : le 2b complet
= paquet (317 ins + 35 del = **352**, mesuré) + migration (record.ts réécrit, rpc2.ts, grep, et la ripple dans 3 fichiers de test —
`ukemi-record.test.ts`, `ukemi-u4a.test.ts`, `ukemi.test.ts` — qui dépendent des symboles supprimés `makeBudgetedCall`/`makeDefaultCall`/
`operatorLabel`/`scrubUrls`/`ARCHIVE_ENV_LABEL`/`applyExcludeOperators`) ≈ **945** ⇒ total ≈ **1297 > 1150** (et > la projection 550-900 de
l'orchestrateur). La **couture de repli pré-déclarée** (complément C-2 / addendum C-5) est activée : **`paquet : indice fermé + classe canonique +
data`** livré ici ; **`migration du recorder + grep`** = item formé (ci-dessous).

- **D6 (livré) — pour un opérateur PAYANT, `TransportError.message` = préambule fixe + code + indice à vocabulaire FERMÉ** (`ERROR_HINT_TOKENS`,
  `packages/rpc-guard/src/classify.ts`), l'ENSEMBLE trié et dédupliqué des jetons CANONIQUES (littéraux) présents dans le corps (C-5) ; **aucun autre
  octet du corps n'est repris**. Une clé (base64/hex, %-encodée, coupée par un blanc) ne peut pas être membre d'un ensemble fixe de phrases anglaises
  et de « 10000 » ⇒ C-GD-2 et le résidu « clé coupée par un blanc » sont **FERMÉS STRUCTURELLEMENT** pour les payants (non bornés). Keyless : corps
  **redacté** conservé (leurs URL sans secret ; diagnostic du quorum gratuit). `NonJsonBody` : **AUCUN indice**, payant ET keyless (C-2 : une page HTML
  contenant « result » ne déclenche pas un découpage de plage).
- **C-1(a) (livré) — classe `RpcError` canonique**, `packages/rpc-guard/src/errors.ts`, `extends TransportError`, exportée par `index.ts` (à
  ré-exporter par `rpc2.ts` en migration) : le chemin JSON-RPC (erreur à HTTP 200) lève CETTE classe, donc `instanceof RpcError` du quorum vaut à travers
  la frontière (`ConcordantRevertError` se forme). C-1(b) : `ERROR_HINT_TOKENS` inclut `execution reverted`/`revert` ; conformité couverte par
  `isRevertText`.
- **C-1(c) (livré) — `TransportError.data?`** validée `/^0x[0-9a-fA-F]*$/`, bornée `MAX_REVERT_DATA_HEX = 4096` caractères hex (au-delà ⇒ abandonnée),
  et **abandonnée si elle CONTIENT l'hex UTF-8 d'une forme secrète de l'URL** (c-bis, mêmes cibles que `redact`, réutilisées verbatim) ; unparseable ⇒
  abandonnée (fail-closed). Le message JSON-RPC keyless est exposé **SANS préambule** (concordance des reverts keyless sur le message).
- **Résidus DÉCLARÉS** : (1) **un revert d'opérateur PAYANT SANS `.data` va au banc** (`isRpcRevert` rend faux) — jamais une concordance sur un indice
  fermé (conservateur : banc, jamais un faux accord ; CA-7) ; (2) collision fail-closed de la cible c-bis (segments ≥ 3 car.) — n'abandonne qu'une `data`
  (ne fait que bencher). `redact` reste en place (défense en profondeur + keyless + cibles de c-bis).
  - **(3) résidus `.data` C-GD-2 RELOCALISÉS (= correction C-G-5, une seule déclaration pour les trois formes)** : `validateRevertData` n'abandonne que
    l'hex CONTIGU de la cible ENTIÈRE ; l'hex d'une clé **PARTIELLE** (préfixe/suffixe) et l'hex de **base64(clé)** PASSENT la validation (formes
    transformées/fragmentées, non expurgeables par motif) — MÊME classe que C-GD-2 « clé transformée par le serveur », RELOCALISÉE dans le canal `.data`.
    Borne identique : hex ≤ `MAX_REVERT_DATA_HEX = 4096`, va au journal `rpc_errors` **LOCAL** (2b-ii), **jamais publié**, jamais la clé ENTIÈRE contiguë ;
    miroir exact de **A-3bis Résidu 1** (clé fendue par un blanc).
  - **(4) `data === "0x"`** (revert sans raison, fréquent) : CONSERVÉE par `validateRevertData` (hex valide borné) ⇒ `isRpcRevert` VRAI, mais `revertKey`
    (`rpc2.ts:59-61`) traite `"0x"` comme ABSENTE (`e.data !== "0x"`) et retombe sur le message ; sous D6 un message payant (préambule à label) n'égale
    JAMAIS un message keyless ⇒ **aucun faux accord** (labels distincts), mais **perte de concordance** chainstack↔keyless sur tout revert SANS raison —
    NON couverte par le résidu (1). **À TRANCHER en 2b-ii** (ex. : comparer `"0x"` comme donnée uniquement quand les DEUX côtés portent `data`), pas un oubli.
  - **A-3bis résidus 1 et 2 nommés** (clé fendue par un blanc ; C-GD-2 base64/hex de la clé) : **LEVÉS pour les opérateurs PAYANTS par D6** (indice à
    vocabulaire fermé, aucun octet du corps repris) ; **conservés et déclarés pour les keyless** (leurs URL ne portent pas de secret). Le résidu (3)
    ci-dessus est leur RELOCALISATION dans le canal `.data` borné (`redact` couvre le corps ; `validateRevertData` couvre `.data` ; mêmes cibles).
- **Oracle (paquet)** : `npm run gate:vocab` / `typecheck` / `test` (58/58 rpc-guard, 753 pass suite) / `lint` / `lint:ratchet` (69/69) / `lang:gate`
  tous verts ; **7 mutants** (jeton retiré, corps libre pour un payant, indice sur NonJsonBody, data non validée, data hex-de-clé, revert payant non
  benché, identité de classe cassée) ROUGES sur leur test nommé, restauration byte-exacte sha256. `apps/**` + `scripts/**` **byte-identiques** à
  `1a4fd55` (le gel U-4b et `rpc.ts` intacts). Registre : le paquet reste **`upcoming`** (2b-migration le branchera).
- **Item formé à déclencheur — `GARDE-HELIUS-2b-migration`** (propriétaire : orchestrateur ; déclencheur : cette découpe R-25) : migrer le recorder
  (`record.ts` : `makeBudgetedCall`/`makeDefaultCall`/`fetch` SUPPRIMÉS, `openGuardedClient`, retry UNIQUEMENT chez l'appelant — réessaie
  `AbortError`/réseau, 429, ≥ 500, `NonJsonBody` a 200/429/>=500 (amendement BELL-RETRY-1 2026-09-22 : retry borne, metre), JAMAIS `RpcError`/`NonJsonBody` 2xx!=200 ou 4xx!=429/autres 4xx/`BudgetExceededError` ; `finally` relâche **N** verrous demandés — keyless
  compris, y compris sur `BudgetExceededError` — par N `runCli unlock` ; journal `rpc_errors` sur disque = `e.detail` (indice fermé) + `.data` validée,
  JAMAIS le corps ni sur disque ni sur stderr ; arguments REQUIS `--ledger-dir`/`--cycle`/`--floor`/`--max-ru`/`--method-caps`, `--max-calls` et
  `--concordance-out` conservés) ; `rpc2.ts` ré-exporte `RpcError`/`BudgetExceededError` du paquet et IMPORTE `isResultLimit`/`isPlanLimited`/
  `isRpcRevert` (aucune seconde regex) ; **sous-point 2b-ii à trancher** : le cas `data === "0x"` de `revertKey` (résidu (4) supra — `"0x"` conservée par
  `validateRevertData`, `isRpcRevert` vrai, `revertKey` la traite comme absente ⇒ perte de concordance chainstack↔keyless sur les reverts sans raison,
  sans faux accord) ; grep CI actif sur `apps/sentinel/src/ukemi/**` (0 hit hors allowlist), allowlist à DEUX entrées dont
  `apps/sentinel/src/rpc.ts` avec déclencheur **NARABI-OPS-1d**. Tests imposés et mutants de migration : sources EN DÉPÔT = `docs/G0-COMPLEMENT-lot-garde-helius-2b.md` §3
  (rappels d'exécution + tests imposés) et son pli C-6 (i)-(iv), l'item formé `GARDE-HELIUS-2b-migration` du présent ADR, et le journal
  `docs/CHANTIERS.md`. Assertion **C-6(iv)** due au G1 de 2b-ii : `operatorOf("nodies.app") === operatorOf("pocket.network") === "pocket"`
  (`providerOf` rend un nom nu inchangé, `apps/sentinel/src/rpc.ts:34`, lecture seule, non touché). **Runbook (course Ukemi gardée)** : un crash laisse **N** verrous (un par opérateur demandé, keyless compris) ; la
  reprise fait **N** `runCli unlock --op <label>` (ligne `unlocked` chaînée, 0 crédit, ne déplace pas la fenêtre de rapprochement) AVANT tout
  `reconcile`.

## Amendement GARDE-HELIUS-2b-ii - migration du recorder Ukemi sous le garde + grep CI (date 2026-09-21, worker `claude-opus-4-8[1m]`)

- **Provenance** : worker G1 `claude-opus-4-8[1m]` (prefixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-21, worktree
  `lot/garde-helius-2b-ii` (base `e7f22b8` sur `lot/etude-suite`) ; reviseur = orchestrateur (R-21). Aucun reseau (fetch bouchonne, cles
  factices, hotes `.invalid`), aucun secret lu, aucun commit (R-20). Ce lot CONSOMME le paquet 2b-i (branche le recorder par un chemin servi +
  e2e non-LLM) ; seam active (R-25 total 1322 > 1150) : 2b-ii-a (R-25 207) et 2b-ii-b (R-25 1125), les deux <= 1150 (voir la fin).

- **R-B (portee du grep CI, VERBATIM) - RESTREINT A-6** : A-6 declarait l'elargissement de portee du grep `fetch_only_inside_client` a
  `apps/sentinel/src/**` en 2b. Cet amendement le RESTREINT a **`apps/sentinel/src/ukemi/**` UNION `apps/sentinel/src/rpc.ts`** ;
  `apps/sentinel/src/rpc.ts` est SCANNE (dans la portee) ET allowliste avec declencheur de retractation **NARABI-OPS-1d** (migration du job
  quotidien Narabi sous le garde) ; `run.ts`/`timeline.ts` entrent en portee a NARABI-OPS-1d. Test in-suite `ukemi_src_clean_and_allowlist_load_bearing`
  (job g3-verification via `npm test`, aucune etape `ci.yml`). Allowlist = `Map<path, declencheur>` ; non-vacuite PAR ENTREE (C-2 : scanner
  chaque fichier allowliste seul, allowlist vide, rend >= 1 hit) + garde de portee (`ukemi/*.ts >= 8`) + double garde (l'entree allowlistee doit
  etre dans la portee). Motif KEY etendu (C-1(c)) : `env.KEY`, `env["KEY"]`, `"KEY" in ...env`, destructuration `{...KEY...} = ...env`.

- **R-D (ripple cross-lot `apps/bell/src/ethereum.ts:67`, VERBATIM)** : la signature canonique de `RpcError` est `(op, message, code, detail, unit, data)`.
  Le site d'appel Bell devient `new RpcError(providerOf(url), json.error.message, json.error.code, "", "keyless", data)` :
  `op = providerOf(url)` (un hote nu, JAMAIS l'URL qui pourrait porter une cle - hygiene C-10 Bell), `unit = "keyless"` (Bell n'introduit aucun banc
  payant), `detail = ""`. UNE ligne ; `apps/bell` sinon INTACT (sa migration reste GARDE-HELIUS-1b) ; comptee dans R-25. Sans elle le typecheck
  fusionne rougit.

- **D-label = `chainstack` (decision 121)** : le label de l'operateur payant dans le journal/ledger/provenance est **`chainstack`** (l'operateur,
  unique par compte ; le reseau est l'attribut `network`, ci-dessous). `archive-env` / `ARCHIVE_ENV_LABEL` / `operatorLabel` sont SUPPRIMES du
  recorder (aucun consommateur casse - mesure M-17 : `concordance.ts` label-agnostique, `resume.ts:86` `case "meta": break`, `u4b-reduce.mjs:48`
  ne lit que `provenance.book_digest`). `scrubUrls` / `applyExcludeOperators` sont SUPPRIMES aussi (le transport expurge tout message leve ;
  `--operators`, liste d'inclusion explicite, remplace `--exclude-operator` : ne pas lister un operateur = l'exclure).

- **R-A / cas `data === "0x"` (RESIDU (4) de l'amendement 2b-i tranche ; C-4)** : `isRpcRevert` (`classify.ts`) BENCHE une jambe PAYANTE dont
  `data` est `"0x"` ou absente : `if (e.unit !== "keyless" && (e.data === undefined || e.data === "0x")) return false;`. Sous D6 deux reverts
  payants distincts partagent le meme message a vocabulaire ferme ; sans un `.data` NON vide discriminant ils ne doivent pas etre lus comme un
  seul fait on-chain. `revertKey` (`rpc2.ts`) est CONSERVE avec sa garde `!== "0x"` (le sous-cas keyless GHO V-4 - `"0x"` vs data absente, les
  DEUX keyless - reste concordant : R-A ne touche que la branche payante, unit != keyless). Effet mesure (C-4) : a l'etat HEAD un bare-revert
  chainstack face a un keyless produisait un FAUX DESACCORD (`onQuorum(false)` + `QuorumDisagreementError`) qui polluait `--concordance-out` ;
  l'option 1 le remplace par un banc, qui pose `cooldownUntil` 25 s sur `chainstack` (`rpc2.ts` quorum2) par bare-revert - comportement NEUF,
  narrow (chainstack ajoute en dernier), 0 RU. Teste via le transport reel (`paid_revert_with_empty_0x_data_is_benched`, fetch bouchonne) ;
  mutant "0x traite present pour un payant" ROUGE. Option 2 (toucher `revertKey`) REJETEE : elle rougit `ukemi_revert_key_uses_data` (sous-cas mixed GHO V-4).

- **C-GD-2 (formes transformees de la cle dans le corps) : FERME structurellement** (etat, pas ouvert) par D6 de 2b-i : pour un operateur payant,
  le message leve ne reprend QUE l'indice a vocabulaire ferme (`closedHint`), jamais un octet du corps. Le recorder migre journalise `e.detail`
  (indice ferme, payant) / redacte (keyless) + `e.data` validee, JAMAIS le corps brut (ni sur disque ni sur stderr) - le corps brut n'atteint
  jamais `record.ts` (le transport est le seul a le voir). Un HTTP 400 payant journalise `http:400`, jamais `code:400` (journal par `e.name`, C-5).

- **Clause 121 `network` - specification ecrite UNE FOIS (portee au G1 2b-ii par 121 ; cf. `docs/CHECKPOINT1-lot-garde-helius-1b.md` C-5).**
  Cette clause SPECIFIE l'attribut `network` du plafond Chainstack PAR COMPTE ; elle est IMPLEMENTEE par le lot 1b-0 (PAS par 2b-ii : le recorder
  2b-ii appelle `openGuardedClient` SANS `network` - defaut ETH ; 1b-0 porte l'adaptation minimale de chaque site consommateur, calque R-D,
  comptee dans le R-25 de 1b-0, jamais un defaut silencieux a ETH). Options fermees (ruling orchestrateur) :
  - (a) `network` est un parametre de COURSE d'`openGuardedClient` (`opts.network: "ethereum-mainnet" | "solana-mainnet"`, requis des qu'un operateur
    multi-reseau est demande, fail-closed sinon) ; le transport resout `chainstack` vers `CHAINSTACK_<reseau>_URL` (absent => throw AVANT tout verrou).
  - (b) la ligne ledger porte `network` comme champ SUPPLEMENTAIRE du core (apres `credits_derived`, avant `reason`) ; `verifyCycleLedger` recompute
    sur les champs presents => les lignes 2b-ii sans `network` et les lignes neuves avec `network` chainent ensemble (test `cycle_ledger_mixes_legacy_and_network_lines`, du a 1b-0).
  - (c) `reconcile` agregat inchange : borne dure sur le TOTAL du compte (121), `network` informatif.
  - (d) consequence declaree : Bell (Solana) et Ukemi (ETH) partagent le verrou `chainstack.lock` => pas deux courses Chainstack simultanees
    (fail-closed voulu ; runbook : `unlock` de l'autre course d'abord).
  - (e) ripple sur tout consommateur fusionne avant 1b-0 (recorder 2b-ii `record.ts` ; scripts 2b-iii `u4-oracle-path.mjs`/`u4-redraw.mjs`
    s'ils appellent `openGuardedClient`) : 1b-0 porte l'adaptation `network: "ethereum-mainnet"` de chaque site (R-D calque), comptee dans son R-25.

- **Runbook (course Ukemi gardee) + verrou robuste** : le `finally` de `runRecorder` relache les N verrous demandes (keyless compris, meme sur
  `BudgetExceededError`) via N `runCli unlock` (ligne `unlocked` chainee, 0 credit, ne deplace pas la fenetre de rapprochement). Un crash DUR
  (SIGKILL/SIGTERM) laisse les N verrous `wx` tenus - fail-closed VOULU pour le recorder (jamais un blocage masque : le verrou est l'existence
  du fichier, detectable ; contrainte NARABI-OPS-1d "un SIGTERM laisse le verrou wx tenu" - pour le recorder c'est le comportement recherche) ;
  la reprise fait N `runCli unlock --op <label>` AVANT tout `reconcile`. L'ouverture du garde jette fail-closed dans les cas verrou-tenu / operateur
  non resolu / config invalide ; pour le recorder c'est voulu (jamais une course a budget non garanti - fail-closed).

- **Tuyau 2b-ii (regle Branchement) - registre R-C** : entree = argv (`--operators`, un `--cycle`, `--ledger-dir`, `--floor`, `--max-ru`,
  `--method-caps`, `--max-calls`) + `deps.env` passe tel quel a `openGuardedClient` (le transport est le seul lecteur de cle) ; sortie =
  `<ledger-dir>/<cycle>/chainstack.jsonl` (+ `.head`, `.lock`) + ledgers keyless (cout 0, comptes) + artefacts du recorder inchanges ; consommateur
  SERVI = `runRecorder` reel -> N `runCli unlock` -> `runCli reconcile` (verdict + code de sortie). Test d'integration non-LLM =
  `ukemi_record_then_unlock_then_reconcile_end_to_end` + `ukemi_record_spends_only_through_guard` (SEUL `globalThis.fetch` bouchonne, C-5 :
  `openGuardedClient` reel, aucun faux client/transport). Registre : au G7 2b-ii le paquet + le recorder garde sont BRANCHES (consommateur servi +
  e2e non-LLM transport->classify->record) ; ils passent `built` a la premiere course RAPPROCHEE (U-4b-1b) ; `upcoming` au registre public
  jusque-la (R-C).

- **Seam declare (C-3) + R-25 (pathspec `ci.yml:65` verbatim, base `e7f22b8`, `docs/**/*.md` exclus - cet amendement ne compte pas)** : total
  a+b = 1322 > 1150 => seam active. 2b-ii-a (R-25 207) = `rpc2.ts` canonique (re-export `RpcError`/`BudgetExceededError`, import des trois
  classifieurs de `classify.ts`, 0 classe/regex locale) + ripple de signature (`ukemi.test.ts`, `pool-rpc-1a.test.ts:121`, `ethereum.ts:67` R-D,
  `record.ts:126`) + R-A (`classify.ts`) + tests D-4/identite-via-transport/R-A ; fusionnable SEUL (n'exige PAS la suppression de `makeBudgetedCall`).
  2b-ii-b (R-25 1125) = migration `record.ts` (`openGuardedClient`, `--operators`, N unlock, journal par `e.name`) + grep CI + e2e + ripple des
  tests. Les DEUX <= 1150 (pas d'escalade). Sous-couture disponible non requise : -b1 (record + tests + guard-record e2e) ~1036 / -b2 (grep) 89.
  Ordre de commit (orchestrateur, R-20 : le worker ne committe pas) : commit 1 = arbre 2b-ii-a, commit 2 = 2b-ii-b par-dessus (les fichiers mixtes
  `record.ts`/`ukemi.test.ts` empechent une scission par fichier ; les deux sous-lots sont les commits **`b0f35e6`** (2b-ii-a) puis **`53ab0fb`**
  (2b-ii-b), fusionnes dans cet ordre - sources EN DEPOT, aucun renvoi hors depot vers un `.patch` du rendu, C-G-4).

## Pli GARDE-HELIUS-2b-ii-c - corrections de TESTS et de DOCS du checkpoint-2 et du G2 (date 2026-09-22, worker `claude-opus-4-8[1m]`)

- **Provenance** : worker de pli `claude-opus-4-8[1m]` (prefixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22, worktree
  `lot/garde-helius-2b-ii-c` (base `e00f965` = -b `53ab0fb` + rapports persistes) ; reviseur = orchestrateur (R-21). Aucun reseau (fetch bouchonne,
  cles factices, hotes `.invalid`), aucun secret lu, aucun commit (R-20). **`packages/rpc-guard/src/**` et `apps/sentinel/src/ukemi/record.ts` sont
  byte-identiques a `53ab0fb`** : ce pli ne touche QUE des tests et des docs (le CODE a ete juge JUSTE par les sondes du validateur au checkpoint-2).
- **C-R-b1 (journal `rpc_errors`)** : le journal est desormais EPINGLE dans `ukemi-guard-record.test.ts` (a travers `runRecorder` reel, seul
  `globalThis.fetch` bouchonne) : un HTTP 400/503 payant journalise `http:<statut>` jamais `code:` (`ukemi_record_journal_maps_paid_http_400_to_http_not_code`,
  `..._maps_paid_5xx_to_http_and_keyless_rpc_to_code`), un RpcError KEYLESS journalise `code:` jamais `http:` (meme test) ; 0 caractere de cle
  (brute/casse/hex/base64/base64url/%-encodee/partielle/userinfo/query) sur `--out`, les ledgers, stdout et stderr (indice ferme cote payant, corps
  redacte cote keyless). Les mutants "http remplace par code", "`rpcErrors.push` neutralise" et "branche `e.name === RpcError` -> message" ROUGES.
  **Precision mesuree (R-21, corrige la sonde §9(ii) du checkpoint-2)** : une course RpcError PAYANTE ne se TERMINE PAS (la jambe payante benchee
  avec un seul keyless restant echoue au quorum `finalized`) ⇒ `--out` n'est jamais ecrit ⇒ l'entree journal payante RpcError n'est PAS observable
  sur disque ; le SECRET est neanmoins ferme sur les surfaces d'echec (message leve + stderr + ledgers = 0 cle), epingle par
  `ukemi_record_failed_paid_rpcerror_leaks_no_key_on_any_surface`. Le trou "journal durable sur course en echec" = item C-R-b7 ci-dessous.
- **C-R-b2 (deux tuyaux servis)** : (a) l'e2e paye reconcilie un ledger NON VIDE avec vecteur discriminant
  (`ukemi_record_e2e_paid_ledger_is_reconciled_go_and_hard_no_go` : `mevblocker.io,chainstack` ⇒ jambe payante tiree, `Sigma credits_derived ==
  provenance.spent_by_operator.chainstack`, `reconcile aggregate-calibration` GO a `delta == ledger_run` et NO-GO `hard:total` a `+1`) ; l'e2e 6-op
  epingle `chainstack attempted == 0` (chainstack en dernier) + 6 verrous relaches (tue "chainstack tire en premier"). (b) La chaine de concordance
  servie est restauree (`ukemi_record_concordance_chain` : args `--concordance-out` -> `runRecorder` -> `onQuorum` -> `tallyConcordance` ->
  `flushConcordance` (finally) -> `reduceConcordance`, un accord ET un desaccord, aucune URL) ; mutants "onQuorum debranche", "flush retire du
  finally", "flush neutralise" ROUGES.
- **C-R-b3 / C-G-2** : garde `>= 2 operateurs distincts` epinglee cote recorder (`ukemi_record_distinct_guard_by_operator` :
  `--operators nodies.app,pocket.network` ⇒ un seul operateur `pocket` ⇒ refus fail-closed) ; retry 429 borne + plafond de backoff
  (`ukemi_record_caller_retries_429_with_capped_backoff`) ; `operatorOf` sur LABELS nus (`ukemi_record_operatorof_collapses_pocket_on_bare_labels`).
  Le commentaire faux de `ukemi-u4a.test.ts` (qui nommait un test inexistant) est corrige.
- **C-R-b4 (motif KEY)** : le grep CI refuse les 6 evasions du checkpoint-2 - `env?.KEY`, `env?.["KEY"]`, le gabarit backtick `env[...KEY...]`, `Reflect.get(env,"KEY")`,
  `Object.hasOwn(env,"KEY")` par regex etendues, et la forme ALIAS (`e = env; e.KEY`) par un scan de NOM NU applique a la SEULE portee ukemi
  non-allowlistee (0 occurrence mesuree ; `rpc.ts` allowliste garde sa lecture legitime). Un mutant par forme (injecte dans `record.ts`) rougit
  `ukemi_src_clean_and_allowlist_load_bearing`.
- **C-R-b5 (skip DEV-1)** : le `catch` nu de `ukemi-u4-scores.test.ts` ne skippe QUE sur l'erreur de lien ESM attendue (`SyntaxError` /
  "does not provide an export named"), toute autre erreur est re-levee (reste ROUGE) - la casse silencieuse hors CI est fermee.
- **C-G-5 / E-1 - RESERVE au runbook (verrou non recuperable)** : la promesse du runbook ci-dessus ("la reprise fait N `runCli unlock`") a UNE
  exception connue : un crash DANS la fenetre entre l'append du ledger (`packages/rpc-guard/src/ledger.ts:104`) et la reecriture du head-sidecar
  (`ledger.ts:106`) laisse le head en retard d'une entree ⇒ `openOperatorLedger` fail-close (`head != recompute`, C-V-8) ⇒ `runCli unlock`
  (`cli.ts:39`) JETTE AVANT de retirer le `.lock` ⇒ ce verrou n'est PAS recuperable par `unlock` seul (reparation manuelle du head requise).
  Fenetre etroite, fail-closed intentionnel, **HERITE du paquet** (`ledger.ts` byte-identique en 2b-ii - non introduit ici). Caracterise (declaratif,
  aucun mutant) par `ukemi_record_crash_between_append_and_head_leaves_lock_unrecoverable_by_unlock_KNOWN_DEFECT`. **Item forme** : durcir l'ordre
  append/head du paquet (ecrire le head AVANT l'append, ou un chemin de re-sync du head) - **proprietaire : orchestrateur ; declencheur : G0 de
  GARDE-HELIUS-1b-0** (le lot qui touche `packages/rpc-guard/src/ledger.ts`). Le commentaire `record.ts:427` (SIGKILL seul) est un residu cosmetique
  aligne au meme item (l'ADR runbook dit deja SIGKILL/SIGTERM ; `record.ts` reste byte-identique a `53ab0fb`).
- **C-R-b7 - item forme (journal de diagnostic durable)** : sur une course en ECHEC (exception, arret budget) le journal `rpc_errors` et
  `errors_by_operator` ne sont ecrits nulle part de durable (seule la ligne stderr du BUDGET STOP porte les compteurs) : decider si le `finally`
  ecrit un artefact de diagnostic pour une course payante non rejouable - **proprietaire : orchestrateur ; declencheur : AVANT la course U-4b-1b
  (prereg)**. Non regressif (la base se comportait de meme).
- **C-R-a1 (rappel)** : les paragraphes **R-A** (jambe payante `data === "0x"` benchee, cooldown 25 s) et **R-D** (ripple `apps/bell/src/ethereum.ts`)
  vivent VERBATIM dans l'amendement 2b-ii ci-dessus (commit `53ab0fb`) : ils fusionnent au meme G7 que -a, la condition C-R-a1 est satisfaite.
  **C-R-b6 (rappel, declencheur 1b-0)** : le test `cycle_ledger_mixes_legacy_and_network_lines` de la clause 121 part d'un ledger PRODUIT par
  `runRecorder` (code 2b-ii reel), pas d'une ligne "legacy" fabriquee a la main.
  `record.ts`/`ukemi.test.ts` empechent une scission par fichier ; les patchs A.patch puis B.patch sont fournis dans le rendu).

## Amendement date GARDE-HELIUS-2b-iii -- scripts de course U-4b sous le garde (2026-09-21, worker `claude-opus-4-8[1m]`)

> **Provenance.** Worker G1 `claude-opus-4-8[1m]` (prefixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni),
> 2026-09-21, worktree `lot/garde-helius-2b-iii` (base originelle `e7f22b8`). Reviseur = orchestrateur (R-21,
> verification adversariale) ; insertion/commit par l'orchestrateur SEUL (R-20). Aucun reseau (fetch bouchonne, cles
> factices, hotes `.invalid`), aucun secret lu, aucun commit. Sous-lot **2b-iii** du ruling **C-9 (alpha)** de
> `docs/G0-lot-garde-helius-2b-ii.md` (ANNEXE) ; realise l'item forme `GARDE-HELIUS-2b-migration` (ci-dessus) pour
> les scripts de course, AVANT la course U-4b-1b.
>
> **Pli (2026-09-22, worker `claude-opus-4-8[1m]`) - REBASE sur 2b-ii-b `e00f965`** (ordre de fusion exige : -a ->
> -b plie -> 2b-iii). Ferme les corrections checkpoint-2 (C-R-1..C-R-4 bloquantes) et G2 (C-G-1..C-G-4) : (C-R-1)
> rejeu byte-identique par **sha de reference committes** (plus de blob de base, plus de `node_modules/.u4-before/`,
> plus de SKIP en clone shallow) ; (C-R-2) test `u4_redraw_spends_only_through_guard` + spends-only de la jambe payante
> independant de la cle ambiante (cle FACTICE, comptage des fetches par hote) ; (C-R-3) `--max-ru`/`--floor` prouves
> CABLES (refus `run_credits`/`cycle_cap`) ; (C-R-4) regime payant declare + test de composition script -> ledger ->
> `runCli reconcile` ; retrait du **pont d'identite** (2b-ii fusionne) ; **suppression** de `u4-probe.mjs`.

**Objet.** Les scripts de la course U-4b-1b qui lisaient une cle payante hors garde -- `scripts/census/u4-oracle-path.mjs`
(produit le D_e servi, `G0-lot-u4b.md:27`) et `scripts/census/u4-redraw.mjs` (controle live G2-delta, `:258`) --
ne lisent plus AUCUNE variable d'env et ne font AUCUN `fetch` payant direct : chaque lecture (temoins keyless +
la jambe payante `chainstack`) est metree DANS `@monark/rpc-guard`. Helper partage neuf : `scripts/census/u4-guard.mjs`.

**Tuyau declare (regle de Branchement).**

| Piece | Entree (produit) | Sortie (consomme) | Etat | Test d'integration non-LLM |
|---|---|---|---|---|
| scripts de course gardes (`u4-oracle-path.mjs`, `u4-redraw.mjs` via `u4-guard.mjs`) | argv (`--ledger-dir`/`--cycle`/`--floor`/`--max-ru`/`--method-caps`/`--max-calls`, `--with-chainstack`) + `process.env` passe tel quel a `openGuardedClient` | `<ledger-dir>/<cycle>/<op>.jsonl` (+ `.head`/`.lock`) write-ahead par operateur (payant + keyless) ; D_e / rapport de re-draw OUT OF REPO inchanges | **consommateurs** = la course U-4b-1b (orchestrateur) et `runCli reconcile` sur le ledger produit (verdict GO/NO-GO) ; `upcoming` au registre public jusqu'a la 1ere course rapprochee -- une piece n'est PAS "branchee" par un test (regle Branchement) | `test/guard-scripts-u4.test.ts` (clock gelee, seul `globalThis.fetch` bouchonne, cles factices `.invalid`) : rejeu byte-identique vs **sha de reference committes** (C-R-1 : plus de blob de base ni de SKIP shallow) ; fetches == lignes `attempted` du ledger, jambe payante (forcee, cle factice) metree dans `chainstack.jsonl` (fetches-hote-payant == lignes `chainstack`) ; `--max-ru`/`--floor` cables (refus `run_credits`/`cycle_cap`) ; **composition** e2e : script reel -> ledger sur disque -> `runCli reconcile` (GO a Delta == RU, NO-GO `hard:total` a +1) ; refus de budget = 1 ligne `refused`, non reessaye |

**Etat.** Ledger de cycle durable, OUT OF REPO (decision 114, `--ledger-dir` doit pre-exister -- C-8, jamais `mkdir`) ;
verrous `<op>.lock` releves en fin de course par **N** `runCli unlock` (helper `unlockAll`) ; un crash / SIGTERM laisse
les verrous (fail-closed, jamais un blocage permanent : la reprise fait les memes N unlock -- note NARABI-OPS-1d).

**Contrat de migration (chaque script).** Aucune lecture directe de cle ; aucun `fetch` payant direct ; args REQUIS
sans defaut `--ledger-dir`/`--cycle`/`--floor`/`--max-ru`/`--method-caps` (+ `--max-calls` conserve, fail-closed) ;
refus de budget = `BudgetExceededError` canonique, JAMAIS reessaye ; retry appelant borne aux transitoires seulement
(AbortError/reseau, 429, >= 500 -- 3 pour oracle-path, 0 pour redraw), `NonJsonBody` a 200/429/>=500 retente (BELL-RETRY-1 cote Bell `quorum.ts` ; UKEMI-RETRY-1 cote recorder Ukemi `apps/sentinel/src/ukemi/record.ts` shim `call`, amendement ADR-U4b 2026-09-22 — `withUniverseRetry`, `makeGuardedEthCall` et `u4-guard.mjs:136` restent a aligner : items R-BR3/R-BR4/R-U-2), jamais `RpcError`/autres 4xx/budget.

**Pont d'identite -- RETIRE au pli (declencheur "fusion 2b-ii" TIRE).** A la base originelle (`e7f22b8`, AVANT 2b-ii),
`rpc2.ts` declarait ses PROPRES `BudgetExceededError` / `RpcError` et un shim de `u4-guard.mjs` convertissait paquet->pool.
La fusion 2b-ii fait desormais RE-EXPORTER par `rpc2.ts` les classes du paquet (identite STRICTE : `rpc2.RpcError ===`
paquet `RpcError`, test `u4_guard_error_classes_are_the_package_classes`). Le pont est donc **SUPPRIME** : `u4-guard.mjs`
n'importe plus les classes d'erreur de `rpc2.ts` ; le shim consomme les erreurs du paquet directement (`instanceof
PkgBudgetError`/`PkgRpcError`). Sans cette identite un revert concordant (`getEModeCategoryData`) deviendrait `NoQuorumError`
au lieu de `ConcordantRevertError` (modification des octets du D_e, invisible sur une fixture succes-seul) -- le rejeu de
reference inclut une categorie e-mode qui revert et verifie `emode_raw["8"] == ConcordantRevertError` (keyless).

**Byte-identite (mesuree, C-R-1).** Sur fixture bouchonnee keyless-seule + clock gelee, la sortie des scripts migres est
byte-identique au blob `e7f22b8`. Le rejeu ne charge PLUS le blob de base (il cassait a la fusion 2b-ii -- `record.ts`
perd `makeBudgetedCall`/`applyExcludeOperators` -- et un SKIP en clone shallow masquait un oracle G7 rouge) : il compare
la sortie migree a des **sha256 de reference committes** (`U4-oracle-path-e2.raw.json` = `76beb089...`, `U4-oracle-inputs.jsonl`
= `5f3dcf2c...`, rapport re-draw = `ed2eaf59...`), recalcules a l'identique depuis le blob `e7f22b8` (`git archive`) ET
depuis le script migre -- egalite PROUVEE, pas supposee (worker G1 + validateur les avaient mesures des la base). Glissement
DECLARE : le tally passe au niveau TENTATIVE (= ledger, ADR-U4b D5) ; la jambe payante est labellisee `chainstack`
(decision 121) au lieu de `archive-env` (n'apparait pas keyless-seule).

**Regime payant (declare).** La byte-identite est le regime KEYLESS. Jambe payante forcee dans le quorum + revert sans
raison (`data === "0x"`) : a la base originelle (`e7f22b8`, AVANT R-A) le D_e rendait un **`QuorumDisagreementError`** (faux
desaccord C-4/"0x") la ou la base rendait `ConcordantRevertError` ; APRES la fusion 2b-ii (R-A benche la jambe payante a
`"0x"` + `operatorOf` collapse les deux gateways Pocket en UN operateur) il rend **`NoQuorumError`**, JAMAIS
`QuorumDisagreementError`. Le chemin NOMINAL (keyless, jambe payante ajoutee en dernier, non atteinte quand les temoins
concordent) reste `ConcordantRevertError`. Assertion nommee dans `u4_oracle_path_paid_leg_is_metered_in_its_own_ledger`
(`emode_raw["8"] == NoQuorumError`, `!= QuorumDisagreementError`), a rebasculer si l'issue R-A change. En aval une entree
`emode_raw` en erreur est sautee par le reducteur (`typeof hex === "string"`) : degradation bruyante, jamais une valeur fausse.

**Portee et items formes (zero dette nue).**
- `u4-probe.mjs` (sonde de cout, cablee a e2) : **SUPPRIME au pli** (ruling C-9 alpha = archivage ; declencheur "fusion
  2b-ii" TIRE : ses imports `makeDefaultCall`/`makeBudgetedCall`/`operatorLabel`/`applyExcludeOperators` de `record.ts`
  ont disparu a la fusion, le module ne se charge plus ; hors du chemin de la course ; cite UNIQUEMENT par des documents
  de PROVENANCE U-4a -- `docs/CHECKPOINT2-BIS-lot-u4a.md:25`, `docs/adr/ADR-U4-book-et-calibration.md` -- jamais par un
  runbook/workflow/`package.json`, donc suppression + note plutot que migration, au plus petit diff). Son entree
  d'allowlist du grep est RETIREE (l'allowlist est vide ; la forme `Map<path,declencheur>` demeure si une sonde revient).
- `u4-oracle-path.mjs` et `u4-redraw.mjs` restent CABLES a e2 (`B0`/`BLAST`/`EMODE_CATEGORIES`/`PLAN-u4-prereg.md`) :
  2b-iii migre la PLOMBERIE, ne rend PAS le script pret pour l'episode frais -- item forme, declencheur prereg -1b.
- U-4b-0 items 0-2 (`meta.model` argument/env fail-closed) et 0-3 (puits `onTransportError` de re-draw, test
  `u4_redraw_error_sink_records_operator_fault`) : NON co-traites par 2b-iii (ils changeraient les octets du rapport / des
  args hors plomberie ; byte-identite prioritaire). ADR-U4b D5 declare U-4b-0 **SUBSUME** par GARDE-HELIUS-2 : ces items
  sont donc RE-FORMES ici avec **proprietaire = orchestrateur** et **declencheur = le lot prereg -1b** qui parametre ces
  scripts pour l'episode frais (AVANT la course U-4b-1b) ; ils RE-passeront alors sous les memes tests (grep + dynamique),
  et les sha de reference de C-R-1 y seront re-epingles par decision explicite, jamais en silence.
- Grep CI de 2b-iii : test SEPARE `test/guard-scripts-u4.test.ts`, portee `scripts/census/u4-*.mjs` (motifs
  `fetch`/`node:http(s)`/`undici`/`child_process`/lecture de cle sous toutes formes + **nom LITTERAL de la cle en mot
  entier**, ce qui epargne `CHAINSTACK_LABEL` + **liste FERMEE des specificateurs importes** des trois fichiers de course :
  un import DIRECT de `apps/sentinel/src/rpc.ts` -- joignable seulement transitivement, le residuel-118 -- rougit). L'unification
  avec le grep de 2b-ii (`apps/sentinel/src/ukemi/**`) reste un item forme pour le G7, declencheur : fusion des deux sous-lots.
- Invariant de mission `git diff scripts/census VIDE` : INSATISFIABLE par construction (la migration en place touche
  `scripts/census`, exigee par l'ANNEXE ET forcee par `apps/sentinel/test/ukemi-u4-scores.test.ts:14` qui importe
  `selectIndices` de `u4-redraw.mjs`, protege) ; l'invariant reproductible est : `apps`/`packages`/`scripts/record-u4b-calib.mjs`/
  sous-ensemble gele de `scripts/census` (u4b, u3-realized, u4-reduce, u4-scores, *.d.mts, aave-liquidations, burns-by-burner)/
  `apps/sentinel/test/fixtures/ukemi` byte-identiques a `e7f22b8` (verifie), et l'ensemble migre de `scripts/census` =
  exactement {`u4-oracle-path.mjs`, `u4-redraw.mjs`, `u4-guard.mjs`}. Gel D4 (7 sha) intact (recompute a `e7f22b8`).

## Amendement GARDE-HELIUS-1b-0 - le PAQUET pour que Bell consomme `openGuardedClient` (date 2026-09-22, worker `claude-opus-4-8[1m]`)

- **Provenance** : worker G1 `claude-opus-4-8[1m]` (prefixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22,
  worktree `lot/garde-helius-1b-0` (base `5394dfe` = 2b-ii fusionne) ; reviseur = orchestrateur (R-21, verification adversariale
  avant consommation). Aucun reseau (fetch bouchonne, cles factices, hotes `.invalid`), aucun secret lu ni affiche (A-7 : tout
  oracle sous `env -u HELIUS_API_KEY -u CHAINSTACK_*_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`), aucun commit (R-20). Perimetre :
  `packages/rpc-guard/**` + l'INVERSION declaree d'UN test de caracterisation `apps/sentinel/test/` (couplage cross-lot, ci-dessous) ;
  `apps/**` sinon byte-identique a `5394dfe`, `scripts/**` intact, gel U-4b (7 sha + `u3-realized.mjs`) intact.

### Tuyaux 1b-0 (regle Branchement) - entree / sortie / etat / test [pli C-4]
- **Entree** : `openGuardedClient(env, limits, ledgerDir, cycles, {network})` - le PAQUET `@monark/rpc-guard` que ce lot
  livre ; `opts.network` est un parametre de COURSE (1b0-B). Producteur = ce lot.
- **Sortie** (consommateurs, TOUS UPCOMING - aucun chemin servi en 1b-0) : 1b-i `universe` (`runUniverse` gate, GET keyless
  `xstocks-issuer`, `withUniverseRetry` sur `TransportError`/3xx type) ; 1b-ii `collect` Solana (`runMain`, `quorum`,
  credits derives) ; 1b-iii `close/eth` + de-skip T4. Le code de sortie du `bin` (R-6) n'a de consommateur SERVI qu'au 1b-i+.
- **Etat** : ledger durable `<HELIUS_LEDGER_DIR>/<cycle>/chainstack.{jsonl,head,lock}` - UN `chainstack.jsonl` par COMPTE
  (121), `network` en ATTRIBUT de ligne (jamais un 2e fichier ni un 2e plafond) ; `helius.jsonl`/keyless.jsonl sans champ
  `network`.
- **Test qui prouve la composition** : `cycle_ledger_mixes_legacy_and_network_lines` (ligne legacy 2b-ii + ligne 121 dans
  UN ledger, prior = total compte), `chainstack_one_account_cap_across_networks`,
  `universe_course_stamps_network_only_on_chainstack_not_helius` (helius + chainstack dans UNE course, l'attribut reste
  chainstack-only) et l'inversion e2e sentinel `ukemi_record_crash_between_append_and_head_is_recovered_by_unlock`. La
  table CONSOLIDEE entree/sortie/etat/test des consommateurs Bell vit au G0 §5 (le plan).

### 1b0-A - Mode GET keyless `xstocks-issuer` (C-7, option beta ; ruling R-7)
Le transport gagne des operateurs `kind:"http-get"` (ensemble `getOps`) : convention `method="GET"`, `params=[pathAndQuery]`, une
seule cle de cap `xstocks-issuer|GET`. `assertHostAllowed` est STRUCTUREL dans le transport (`resolveGetUrl`) : le label ne resout
QU'UN hote admis (`api.xstocks.fi`, calque `universe.ts:36` ISSUER_HOST, PLI/CONF-SRC-4) ; l'URL de requete = `new URL(pathAndQuery,
base)` dont le host DOIT egaler l'hote admis (une `//evil` protocol-relative ou une `https://evil` absolue => host different =>
throw ; https seul ; pas de userinfo). Keyless (cout 0, compte). Test `xstocks_issuer_get_uses_get_and_structural_host`
(sosies inclus : suffixe `api.xstocks.fi.evil.invalid`, prefixe `xapi.xstocks.fi` - egalite d'hote, jamais `endsWith`) ;
mutants "controle d'hote structurel retire" ET "hote relache en endsWith" ROUGES. L'allowlist d'hotes de `universe.ts` se
reduit a un test de LABEL au 1b-i.
**C-1 (pli) - corps GET rendu VERBATIM** : pour un `getOps`, le transport retourne le JSON parse TEL QUEL (aucun `.result`,
aucun controle `error` JSON-RPC ; `NonJsonBody` conserve). Le corps xStocks EST la charge utile (`{assets:[...]}` ou un
tableau NU, jamais une enveloppe `result`), consomme VERBATIM par `pageAssets`/`foldPage` de `apps/bell/src/universe.ts:477-493`
(qui lit `array | {data|assets|items|results}`) au 1b-i. Desenvelopper en JSON-RPC resoudrait `undefined` sur TOUT corps
reel => `pageAssets([])` => ancre de fin page 0 => univers vide SILENCIEUX (fail-open) : c'est le defaut BLOQUANT attrape au
checkpoint-2 (le test G1 emballait `{assets:[]}` dans un cadre JSON-RPC, masquant le desenveloppage). Test
`xstocks_issuer_get_returns_body_verbatim_not_jsonrpc_unwrapped` (corps `{assets:[...]}` ET tableau nu, deep-equal) ; mutant
"GET desenveloppe comme JSON-RPC" ROUGE. 3xx sur le GET aussi hard-stop (voir 1b0-C(i), pli F-2).

### 1b0-B - Clause `network` "par compte" (decision 121, C-5) - SPEC ECRITE ICI
121 confie la clause au G1 du sous-lot qui construit le ledger Chainstack ; 1b-0 touchant `ledger.ts`/`transport.ts`, la spec est
ECRITE ici et 1b-i/2b-ii la CITENT. (a) `opts.network: "ethereum-mainnet" | "solana-mainnet"` est un parametre de COURSE de
`openGuardedClient` ; le transport resout `chainstack` vers `CHAINSTACK_<reseau>_URL` : `solana-mainnet` => `CHAINSTACK_SOLANA_URL`,
sinon `CHAINSTACK_ETH_URL`. **Compatibilite byte-identique (au lieu du ripple d'edition du recorder)** : `opts.network` ABSENT =>
defaut `ethereum-mainnet` = le comportement pre-121 exact ; le recorder 2b-ii (qui ne passe PAS `opts.network`) resout
`CHAINSTACK_ETH_URL` et n'ecrit AUCUN champ `network` => `apps/sentinel/src/record.ts` reste byte-identique (pas d'edition apps/**,
conforme a l'invariant de perimetre 1b-0). RESIDU DECLARE : une course SOLANA doit passer `opts.network:"solana-mainnet"`
EXPLICITEMENT (sinon `CHAINSTACK_SOLANA_URL` absent => `chainstack` non resolu => throw dans `openGuardedClient` AVANT tout verrou) -
obligation portee et testee au 1b-i ; le defaut ETH silencieux n'existe QUE pour preserver la byte-identite du recorder. (b) La ligne
ledger porte `network` en champ SUPPLEMENTAIRE du core, APRES `credits_derived`, AVANT `reason`, OMIS sur toute ligne
helius/keyless et sur une ligne chainstack pre-121 (sans `opts.network`) ; `verifyCycleLedger` recompute sur les champs PRESENTS,
donc une ligne legacy (sans `network`) et une ligne 121 (avec `network`) se chainent et se verifient dans le MEME ledger. Test
`cycle_ledger_mixes_legacy_and_network_lines` : la ligne LEGACY est PRODUITE par la vraie pile `openGuardedClient -> makeClient ->
commit -> appendChained` (network absent), pas fabriquee a la main - la MEME pile que le recorder 2b-ii (C-R-b6 satisfait ; le
recorder emballe `openGuardedClient` sans `opts.network`). (c) `reconcile` inchange : la borne dure est sur le TOTAL du compte (16 M RU,
121), `network` est informatif ; MAIS le rapprochement d'un ledger MIXTE ETH+Solana reste un ITEM FORME (voir 1b0-G, pli
C-6 : tableau de bord "par reseau par jour" vs ledger total-compte), declencheur = 1er reconcile Solana (1b-i). (d) CONSEQUENCE DE VERROU DECLAREE : Bell (Solana) et Ukemi (ETH) partagent `chainstack.lock` (un
operateur `chainstack` unique => un seul `<cycle>/chainstack.lock`) => pas deux courses Chainstack simultanees (fail-closed voulu ;
runbook : `unlock` de l'autre course d'abord). Test `chainstack_one_account_cap_across_networks` (course ETH puis course Solana sur le
meme `<cycle>/` => le 2e prior fige inclut le 1er : un cap 16 M par compte) ; mutants "ledger chainstack scinde par reseau (cap
propre)" et "prior filtre par reseau (floor par reseau)" ROUGES.

### 1b0-C - Semantiques durcies portees dans le transport (D-9, ruling R-7)
Le transport 2b faisait un `fetch` POST-only SANS `redirect` (defaut `follow`) et NE LISAIT PAS `retry-after` : migrer le `fetch` dans
le transport sans ces semantiques serait une regression SILENCIEUSE (les tests `deps`-injectes d'a1-bis restent verts pendant que le
chemin live perd la protection). 1b-0 porte, avec un test + un mutant PAR semantique : (i) `redirect:"manual"` sur GET ET POST => un
3xx est un HARD STOP type `name:"RedirectBlocked"` + statut, jamais suivi, corps jamais lu ni transmis a l'hote redirige
(`transport_3xx_is_hard_stop_never_followed` pour le POST ; `transport_3xx_on_get_operator_is_hard_stop_never_followed` pour le GET,
ajoute au pli F-2 - 2b-ii ne prouvait QUE le POST ; mutants "redirect suivi" [POST] et "redirect suivi on GET" ROUGES) ; (ii)
`retryAfterMs` (parse delta-secondes ou HTTP-date, borne 60 s) sur `TransportError` pour un 429/503, que l'APPELANT honore - le
transport ne reessaie jamais (une tentative, `transport_error_carries_retry_after_ms` ; mutant "retry-after non lu (branche 429)"
ROUGE) ; (iii) un 403 conserve `code:403` SANS `retryAfterMs` de facon STRUCTURELLE - garde explicite
`res.status === 403 ? undefined`, jamais l'incidence d'un 403 sans en-tete : MEME un 403 PORTANT un en-tete `retry-after` resout
`retryAfterMs === undefined` (fatal, jamais rate-limite). La composition 1b-i (`withUniverseRetry`) mappe `code:403 -> Fatal403Error`
(sous-classe de `BudgetExceededError`) et ne reessaie JAMAIS. Tests `transport_403_is_fatal_hard_stop` (403 sans en-tete) ET
`transport_403_carries_no_retry_after_even_with_header` (403 + `retry-after:5` => undefined, pli C-2) cote paquet ; mutant "403 guard
removed (403+header retryable)" ROUGE ; le hard-stop de composition reste teste au 1b-i (`universe.ts:122`).

### 1b0-D - Recuperation du verrou crash-in-window (item i ; RESOUT la RESERVE C-G-5/E-1 ci-dessus)
La RESERVE C-G-5/E-1 (verrou non recuperable par `unlock` apres un crash entre l'append et la reecriture du head-sidecar) est FERMEE.
`openOperatorLedger` gagne une RECUPERATION explicite : si le head sur disque est en retard d'EXACTEMENT une entree (== le head de
`entries.slice(0,-1)`, la penultieme), la derniere ligne a bien ete appended de facon durable (write-ahead honore) et seul le sidecar
de tamper-evidence a pris du retard => RECUPERABLE : self-heal du sidecar, on continue. Distinct d'une TRONCATURE de queue (head en
AVANCE, == la sha d'une entree RETIREE, jamais la penultieme du chain courant) qui reste fail-closed. La recuperation n'ELARGIT PAS le
modele de menace C-V-8 : le sidecar ne defendait qu'un tamper PARTIEL (jsonl seul) ; un attaquant qui ecrit les DEUX fichiers gagne
deja, et une troncature ne presente jamais la penultieme (`ledger.test.ts` C-V-8(c) tue le mutant "recuperation trop permissive").
`runCli unlock` (qui ouvre le ledger AVANT de retirer le `.lock`) recupere donc apres un crash. Le test de caracterisation 2b-ii-c
`ukemi_record_crash_between_append_and_head_leaves_lock_unrecoverable_by_unlock_KNOWN_DEFECT` est INVERSE (par ce lot, couplage
cross-lot DECLARE) en test de RECUPERATION `ukemi_record_crash_between_append_and_head_is_recovered_by_unlock` (SEULE modification
d'`apps/**`). Test paquet `ledger_recovers_crash_in_append_window_but_refuses_tail_truncation` ; mutants "recuperation retiree
(head-behind fail-close)" [paquet ET inversion sentinel] et "recuperation trop permissive (heal toute divergence)" ROUGES.

### 1b0-E - Deverrouillage PAR OPERATEUR (item ii ; ripple du recorder `apps/sentinel/src/ukemi/record.ts` => RULING orchestrateur G7 1b-0 : porte par 1b-iii, extension explicite de son perimetre, couplage cross-lot a declarer dans son G0)
L'API rend DEJA le deverrouillage par operateur possible : `client.operators()` liste les labels, et le `cycles: Record<op,cycleId>`
passe a `openGuardedClient` est detenu par l'appelant => `runCli(["unlock","--op",<op>,"--cycle",cycles[op],"--reason",r], deps)` par
operateur. La recuperation 1b0-D rend cet `unlock` robuste apres un crash. **RIPPLE recorder (item FORME)** : le `finally` du
recorder 2b-ii deverrouille aujourd'hui avec la variable CLI `cycle` UNIQUE ; sous 121 il doit deverrouiller par
`(op, cycles[op])` (le cycle propre a chaque operateur), jamais un `cycle` unique. **CORRECTION du pli (C-5)** : ce ripple
edite `apps/sentinel/src/ukemi/record.ts` (le recorder), qu'AUCUN de 1b-i/1b-ii/1b-iii ne touche (tous scopes `apps/bell`,
G0 §3.1 l.110-112) ; l'attribuer a 1b-i (redaction G1 initiale) etait donc FAUX. Proprietaire PROPOSE : un lot Ukemi/NARABI
recorder DEDIE qui edite `record.ts`, OU - en alternative - une EXTENSION EXPLICITE du perimetre de 1b-iii a
`apps/sentinel/src/ukemi/record.ts` (le choix est un RULING orchestrateur, pas une decision worker ; NB : la mention "1b-iii
de-skippe le test sentinel" est inexacte - les deux seuls skips sont `u4_redraw` [scripts] et `fetch_only_inside_client`
[test/ racine], aucun n'est un test sentinel, et le test sentinel a ete INVERSE et non skip en 1b0-D). **Declencheur** : le
PREMIER lot editant `apps/sentinel/src/ukemi/record.ts`, OU la premiere course recorder verrouillant >= 2 operateurs sur des
cycle-ids distincts (le `cycle` unique devient alors incorrect). L'inversion de recuperation 1b0-D reste valide
independamment de ce ripple.

### 1b0-F - Tarif, table de methodes, identite de classe, bin
- **D-5** : `getAccountInfo` = 1 RU sur Chainstack Solana (FAITS pt 7, "any other Solana method = 1 RU"), via l'ensemble ENUMERE
  `CHAINSTACK_ONE_RU_SOLANA` DISJOINT des deux sets 2-RU (jamais un defaut blanket qui casserait le fail-closed) ; il JETAIT
  `unknown_method` avant 1b. Test `chainstack_solana_getaccountinfo_is_one_ru` ; mutant "blanket 1 RU (pas fail-closed)" ROUGE.
- **C-3c / D-8** : `BELL_SOLANA_METHODS` = les 4 methodes Solana de Bell (`getSignaturesForAddress`, `getTransaction`,
  `getAccountInfo`, `getTransactionsForAddress` - gTfA le vecteur HELIUS-1, cap le plus BAS) + `assertMethodCapsCover(caps, methods,
  label)`, une verification a la CONSTRUCTION (une methode appelee non capee => throw avant la course, pas au 1er appel). Exportes
  publiquement (Bell les consomme au 1b-ii). Test `bell_method_caps_table_covers_every_called_method` ; mutant "verif no-op" ROUGE.
- **C-1** : `BudgetExceededError` canonique est DEJA exportee par le paquet (`errors.ts`, `index.ts`) ; le RE-EXPORT cote Bell
  (`apps/bell/src/quorum.ts` fait `export { BudgetExceededError } from "@monark/rpc-guard"`) et le test
  `universe_budget_refusal_is_not_retried` sont 1b-i (ils touchent `apps/bell`). RIEN a faire cote paquet en 1b-0 : deja canonique.
- **`bin` (R-6)** : `packages/rpc-guard/bin/rpc-guard.mjs` (executable) cable a `runCli` (reconcile|unlock ; `--ledger-dir`/`--floor`
  en args CLI explicites, jamais une sonde d'env). UPCOMING (le code de sortie n'a un consommateur SERVI qu'au 1b-i+ ; Branchement).

### 1b0-G - Residus declares (zero dette nue)
- **Crash au TOUT PREMIER append d'un cycle-ledger (residu de 1b0-D, item i)** : un crash entre le 1er append et sa 1re
  ecriture de head laisse `ledger=[E1], head ABSENT` => `openOperatorLedger` fail-close (`head sidecar absent`,
  INDISTINGUABLE d'un sidecar SUPPRIME) => `runCli unlock` ne recupere PAS ce verrou. Volontairement PAS recupere : heal
  un head-absent admettrait une attaque supprime-head + tronque-jsonl. Fenetre etroite (1re ligne d'un cycle seul),
  fail-closed voulu ; reparation manuelle du head au runbook. **Item forme, declencheur : observation en course**
  (proprietaire : orchestrateur).
- **T4 `fetch_only_inside_client` reste SKIP "until 1b"** : 1b-0 = PAQUET seul, AUCUNE migration `apps/bell/src/**` ; les 14 hits
  restent ; le de-skip est 1b-iii (§7 du G0). Declare, non comble.
- **C-2 voisin** : le paquet resout `solana-foundation` vers `api.mainnet.solana.com` (hote PLI admis) ; les LITTERAUX
  `mainnet-beta` cote Bell (`rpc.ts:19` `PUBLIC_SOLANA`) restent un item 1b-ii (solde par la migration, a consigner alors).
- **D-6 run-ledger phantom-fresh borne** : inchange (le run-ledger a1-bis subsiste, borne par `--max-calls`) ; le CYCLE-ledger
  write-ahead est la garde inter-run - branche cote Bell au 1b-i.
- **Reconcile d'un ledger MIXTE ETH+Solana - quel instantane du tableau de bord (C-6, pli)** : `reconcile` lit le TOTAL du
  compte cote ledger (`ledgerTotal` SANS filtre reseau, decision 121), mais le tableau de bord Chainstack donne un total RU
  PAR RESEAU PAR JOUR (FAITS pt 10 ; commentaire rectifie `reconcile.ts:12-14`). C'est COHERENT aujourd'hui (chaque
  cycle-course est MONO-reseau et seul l'ETH est facture) ; un compte 121 MIXTE (Bell Solana + Ukemi ETH sur UN compte
  Chainstack) rend AMBIGU "quel instantane `total_ru` rapproche un ledger total-compte". **Item forme, declencheur : le
  PREMIER reconcile d'une course Solana (1b-i)** ; d'ici la, la borne aggregate reste sur le total du compte. Proprietaire :
  orchestrateur.
- **Databento/Polygon** : residuel payant hors garde a declencheur "G0 course cash Bell" (ruling R-1, 1b-iii) ; aucune course cash a 1b.
- **Oracle APRES PLI (arbre du worktree, cles retirees `env -u`)** : `npm run ci` exit 0 (777 tests / 775 pass / 0 fail /
  2 skip attendus = `u4_redraw` [2b-iii] + `fetch_only_inside_client` [until 1b]) ; `lint` 0 ; `lint:ratchet` 69/69 ;
  `lang:gate` 0 ; `export:check` 0 ; R-25 vs `5394dfe` (pathspec `ci.yml:65`) = 588 ins + 50 del = **638** <= 1150 ; **19**
  mutants nommes KILLED, restauration byte-exacte (sha256), `git status` propre. Pli du checkpoint-2 (C-1..C-9) + G2
  (F-1..F-3) : C-1/C-2 BLOQUANTES pliees (voir Tuyaux 1b-0, 1b0-A corps GET verbatim, 1b0-C 403 structurel + 3xx GET ;
  +4 tests, +7 mutants). C-3 (conflit ADR a la fusion) reste mecanique G7.

## Amendement date 2026-09-22 (GARDE-HELIUS-1b-i) - Bell consomme openGuardedClient (universe) ; reconcile mixte ETH+Solana pre-declare

**Modele resolu (R-1)** : `claude-opus-4-8[1m]` (prefixe conforme, effort max ; Opus 5 banni). **Provenance** : worker Opus 4.8,
worktree `F:\Monark-wt-garde1bi`, base `lot/etude-suite` @ `6114ce9` ; reviseur = orchestrateur (R-21, verification adversariale).
R-20 : aucun commit, aucun workflow. Cet amendement RESOUT l'item ouvert 1b0-B (quel instantane rapproche un ledger mixte) et
corrige l'attribution 1b-i FAUSSE de 1b0-E (le ripple `finally` du recorder est 1b-iii, pas 1b-i).

### 1b-i-A - Ce que 1b-i branche (Tuyaux : entree / sortie / etat / test)
| Piece | Entree (qui produit) | Sortie (qui consomme) | Etat (ou) | Test d'integration NON-LLM |
|---|---|---|---|---|
| `runUniverse` garde (`apps/bell/src/universe-cli.ts`) | `openGuardedClient(deps.env, limits, --ledger-dir, cycles, {network:"solana-mainnet"})` ; sous-ensemble `{solana-foundation, chainstack, xstocks-issuer}` par `--operators` (C-12, jamais une sonde d'env) ; retry AU-DESSUS du client (D-2) | course `universe` Bell GATEE (exit code) ; artefact `universe-candidates-*.json` hors depot | CYCLE ledger `<--ledger-dir>/<cycle>/{chainstack,solana-foundation,xstocks-issuer}.{jsonl,head,lock}` (chainstack `network`=solana-mainnet, 121) ; RUN ledger `<--out>/budget.json` + journal chaine (a1-bis PROVENANCE) | `universe_spends_only_through_guard` (espion `globalThis.fetch` : chaque fetch chainstack precede de sa ligne write-ahead SUR DISQUE ; les DEUX formes de corps issuer -- `{assets:[...]}` ET tableau nu -- verbatim vers foldPage, G7 1b-0 point 5) + `universe_budget_refusal_is_not_retried` + `universe_finally_unlocks_then_reconcile_goes` |

- **Identite de classe (C-1)** : `apps/bell/src/quorum.ts` fait `import { BudgetExceededError } from "@monark/rpc-guard"; export { BudgetExceededError };`
  (importe PUIS re-exporte -- un `export {X} from "..."` nu ne LIE PAS le nom pour le `instanceof` de quorum2/withRetry). Les 8 fichiers
  src l'important de quorum.ts suivent SANS edition ; `Fatal403Error`/`RedirectBlockedError` sous-classent la canonique. `apps/bell/package.json`
  declare `@monark/rpc-guard` (deps-hygiene ADR-M018 D1).
- **withUniverseRetry porte les semantiques durcies (C-3/D-9)** : cle sur la `TransportError` du paquet (`name`+`code`+`retryAfterMs`) ;
  403 -> Fatal403Error, 3xx -> RedirectBlockedError (hard stops jamais retentes), 429/5xx retentes en honorant Retry-After, RpcError/NonJsonBody (NON aligne sur BELL-RETRY-1 : item R-BR3, declencheur = avant la phase B univers)/4xx!=429
  re-jetes. La `HttpStatusError` Bell est SUPPRIMEE (une seule classe canonique, consigne C-1). Tests `bell_universe_retry_honors_retry_after_and_hard_stops_on_403`,
  `transport_403_is_fatal_hard_stop`.
- **RUN ledger CONSERVE (D-6)** : `makeUniverseBudget`/`makeBudgetedCall` retires du chemin de metrage ; le client est le SEUL compteur ;
  `total = prior.calls + client.spent().attempts` (offset M17 par `universeRunCap`, throw si deja depense) ; anchor-first + journal chaine inchanges.
  Test M-order `bell_universe_ledger_crash_between_writes_resumes_conservatively`.
- **`assertHostAllowed` reduit a un test de LABEL (C-7)** : Bell ne parse plus d'URL ; la resolution d'hote + le controle structurel vivent
  dans le transport du paquet (`resolveGetUrl` pour le GET). Tests 18/19 (fetchers live / parsing URL) RETIRES avec annotation D-4 (garantie
  portee cote paquet `transport-hardening.test.ts` + `resolveGetUrl`).
- **grep CI `apps/bell/src/**` (1b-i le CREE)** : `apps/bell/test/bell-src-clean.test.ts` scanne les fichiers 1b-i (universe-cli.ts, universe.ts)
  pour `fetch(`/`node:http(s)`/`undici`/`child_process`/lecture de cle payante (4 formes + evasions) ; ACTIF (le full-scope
  `fetch_only_inside_client` reste SKIP jusqu'au 1b-iii). Test `universe_src_clean_of_fetch_and_keys`.

### 1b-i-B - Reconcile d'un ledger MIXTE ETH+Solana : PRE-DECLARATION (resout l'item ouvert 1b0-B)
Sous 121 (un operateur `chainstack` par COMPTE, un cap 16 M RU, `network`=attribut), le premier reconcile d'une course Solana leve
l'ambiguite de 1b0-B : **l'instantane du tableau de bord rapproche est le TOTAL DU COMPTE** = somme des totaux RU PAR RESEAU PAR JOUR
(Chainstack Statistics n'a pas de ventilation par methode, FAITS pt 10) lus a UN instant. Cote ledger, `ledgerRunSinceLastReconciled`/`ledgerTotal`
n'ont PAS de filtre reseau (somme du compte) : coherent avec un instantane total-compte. Mode `aggregate` (soft band BLOQUE) ; la PREMIERE
course Solana est `aggregate-calibration` (hard bound BLOQUE, sur-comptage soft CONSIGNE, exit 0). `before` = le `after` de la course
precedente. Le verrou `chainstack.lock` PARTAGE Bell(Solana)/Ukemi(ETH) serialise les courses. Preuve NON-LLM :
`universe_finally_unlocks_then_reconcile_goes` (run -> N unlock -> `runCli reconcile --mode aggregate-calibration --before <snap> --after <snap>` -> GO).

### 1b-i-C - Residus declares (zero dette nue, chacun a declencheur nomme)
- **Wrapper de course scalaire `bin/rpc-guard.mjs --before <total> --after <total>` -- ITEM FORME + DEMANDE DE CONSULTATION** : verifie --
  le bin (paquet, `packages/rpc-guard/bin/rpc-guard.mjs` -> `runCli`) prend `--before <chemin> --after <chemin>` = des FICHIERS d'instantane
  JSON (`{cycle,total_ru}`), PAS des totaux SCALAIRES ; le bin est DANS LE PAQUET (non modifiable par 1b-i). Options : (i) un flag paquet
  `--before-total/--after-total` ; (ii) un runbook de course qui ECRIT les deux fichiers JSON puis appelle le bin (zero code) ; (iii) un script
  Bell hors perimetre 1b-i. RECOMMANDE : (ii). Declencheur : G0 de la premiere course Solana rapprochee ; proprietaire : orchestrateur. Le
  chemin FICHIER est deja prouve (test 1b-i-B), donc AUCUN blocage a 1b-i.
- **429-streak STOP precis (C-3) -- REGLE au pli (declencheur G1 1b-ii echu, plie).** `statusOf` (quorum.ts) lit desormais le `.code`
  canonique du paquet (1b-ii FUSIONNE), donc une `TransportError` 429 remonte en "HTTP 429" et le compteur `streak429` d'universe-cli.ts est
  PRECIS (plus le "transport" pre-1b-ii). La composition 429-streak (429 en boucle + Retry-After, `--max-429-streak 2` => STOP fail-closed,
  R+1 lignes ledger par confirmation, 0 `.lock`) est prouvee par le test non-LLM `bell_universe_429_streak_stops_fail_closed`
  (`apps/bell/test/guard-pli-1b.test.ts`), tue par le mutant "statusOf ignore .code" et par le mutant dedie ">= -> >". Le commentaire
  perime `universe-cli.ts` ("precis seulement apres 1b-ii") est corrige au pli. Le retry par appel (withUniverseRetry honore Retry-After,
  borne le 429 immediat) reste actif.
- **URL POST `http://` non verifiee cote paquet -- ITEM FORME** : le transport paquet impose https STRUCTURELLEMENT pour le GET (`resolveGetUrl`) ;
  une `CHAINSTACK_*_URL` en `http://` atteint `fetch` POST sans controle de schema. Hors perimetre 1b-i (paquet). Declencheur : durcissement
  transport paquet ; proprietaire : orchestrateur.
- **RUN-anchor phantom-fresh borne (D-6)** : deplacer `--out` repart le compteur RUN a 0 (l'anchor vit par --out) ; la garde inter-run est le
  CYCLE ledger (par --ledger-dir), inchange par un --out deplace (prouve par `universe_out_moved_on_resume_keeps_cycle_prior`). Borne par
  `--max-calls` par run. Residu inchange depuis a1-bis/1b-0.
- **Databento/Polygon** : residuel hors garde a declencheur "G0 course cash Bell" (1b-iii, ruling R-1) -- aucune course cash a 1b-i.

### 1b-i-D - Couplages cross-lot DECLARES (fusion separee ; ordre 1b-0 -> 1b-i -> 1b-ii -> 1b-iii)
- **quorum.ts (overlap PLANIFIE)** : 1b-i porte le re-export `BudgetExceededError` (C-1, AVANT IT-1) ; 1b-ii porte la SUPPRESSION de `SolRpcError`
  + `statusOf`/`isSolRevert` sur `TransportError`/`RpcError` (C-3). Les deux editent quorum.ts (le G0 assigne C-1 a 1b-i, C-3 a 1b-ii). A la
  fusion 1b-ii, integrer le re-export 1b-i.
- **universe-cli.ts n'importe plus `makeBudgetedCall` de collect.ts** ; 1b-ii RETIRE `makeBudgetedCall` de collect.ts. 1b-i fusionne AVANT 1b-ii
  => collect.ts garde son export jusque-la (aucun casse a la fusion 1b-i).
- **grep test -- RECTIFIE au pli (checkpoint-2 1b-i-D).** La prediction "1b-ii/1b-iii ETENDENT `CLEANED`" N'A PAS eu lieu : sur l'arbre
  fusionne `bell-src-clean.test.ts` garde `CLEANED = {universe-cli.ts, universe.ts}` (2 fichiers, inchange). Ce qui couvre TOUT `apps/bell/src`
  est le grep RACINE `fetch_only_inside_client` (`test/rpc-guard-fetch-only-inside-client.test.ts`), que 1b-iii a UNIFIE en liste-de-racines et
  DE-SKIPPE ; il SUBSUME les greps par-fichier. Trois greps Bell coexistent donc : la racine (list-of-roots, load-bearing), le per-fichier 1b-i
  `universe_src_clean_of_fetch_and_keys` (bell-src-clean.test.ts) et le per-fichier 1b-ii `bell_1bii_src_files_clean_of_fetch_and_paid_keys`
  (guard-collect-1bii.test.ts) -- couches etroites complementaires. **Item forme (non bloquant, la racine subsume)** : ranger les deux greps
  par-fichier dans la racine unique. Declencheur : la prochaine passe qui EDITE un grep Bell (eviter d'entretenir trois greps). Proprietaire : orchestrateur.
## Amendement date 2026-09-22 (GARDE-HELIUS-1b-ii) - Bell collect/crosscheck consomment openGuardedClient (versant Solana) [section INSEREE au pli checkpoint-2, C-G2-B]

**Modele resolu (R-1)** : `claude-opus-4-8[1m]` (prefixe conforme, effort max ; Opus 5 banni). **Provenance** : worker G1 Opus 4.8,
worktree `F:\Monark-wt-garde1bii`, base `lot/etude-suite` @ `6114ce9`. Texte propose au G1 1b-ii section 7.6 et INSERE par le pli du
checkpoint-2 (C-G2-B : la section datee 1b-ii manquait de l'union ADR alors que la mission declare "ADR = union 1b-i/1b-ii/1b-iii").
Reviseur = orchestrateur (R-21). R-20 : aucun commit.

### 1b-ii-A - Ce que 1b-ii branche (Tuyaux : entree / sortie / etat / test)
| Piece | Entree (qui produit) | Sortie (qui consomme) | Etat (ou) | Test d'integration NON-LLM |
|---|---|---|---|---|
| Bell `runMain` collect/crosscheck/discover/density sous `openGuardedClient` (versant Solana) | `openGuardedClient(deps.env, {maxCalls, runCaps:{helius:--max-credits, chainstack:--max-ru}, methodCaps, cycleFloor:--floor}, --ledger-dir, {op:--cycle}, {network:"solana-mainnet"})` EXPLICITE (fail-closed avant tout verrou si CHAINSTACK_SOLANA_URL absent) ; le shim `LABEL -> client.call` (metre + ligne ledger write-ahead + UNE tentative) ; retry AU-DESSUS (quorum2/withRetry, D-2) | courses collect/crosscheck/discover/density Bell GATEES (exit code ; state.json/provenance/journal hors depot) | CYCLE ledger `<--ledger-dir>/<cycle>/{helius,chainstack,solana-foundation}.{jsonl,head,lock}` ; RUN ledger `<--out>/budget.json` + `ledger-<MINT>.jsonl` (a1-bis, DERIVE du garde) | **IT-2** `collect_spends_only_through_guard` (chaque fetch helius paye precede de sa ligne write-ahead SUR DISQUE) ; **IT-3** `crosscheck_credits_derived_from_ledger` (credits = Sigma ledger, getTransaction keyless sur solana-foundation) ; reprise `bell_crosscheck_guarded_resume_without_loss_after_budget_stop` ; `solana_course_passes_network_explicit_and_fails_closed_without_solana_url` ; `bell_method_caps_missing_a_called_method_fails_closed_at_construction` ; `quorum_classifies_canonical_transport_errors` ; le D-1 `bell_course_reaches_fetch_only_via_openGuardedClient` (versant collect) |

- **C-3 (vocabulaire d'erreur canonique)** : `quorum.ts` parle les erreurs canoniques du paquet ; `statusOf`/`withRetry`/`isSolRevert` lisent
  `.code`/`.name` (jamais le message scrubbe) ; `SolRpcError` SUPPRIME (une seule classe canonique, consigne C-1). `--max-credits` -> `runCaps.helius`
  (le worst-case x10 est REMPLACE par les credits tarifes du ledger, deplacement declare).
- **RULING CR-2 (dual-path, ACCEPTE par l'orchestrateur 2026-09-22).** `makeBudgetedCall` (defini `collect.ts`) est CONSERVE pour la branche
  HORS-LIGNE unite (D-1 : `deps.call` injecte -> l'ancien budget local sur le stub, NI garde NI cycle-ledger) et consomme par ~10 tests unitaires ;
  le chemin PRODUCTION/INTEGRATION (deps.call ABSENT) construit `openGuardedClient`. La "suppression makeBudgetedCall" de la mission s'applique au
  chemin PRODUCTION seul. `universe-cli.ts` (1b-i) ne l'importe plus. Ce n'est PAS du code mort (consommateur vivant offline, G2 note). Declencheur
  de suppression du symbole : un nettoyage post-fusion qui porte les ~10 tests offline sur le garde. Proprietaire : orchestrateur.
- **RULING CR-6 (dual-path, ACCEPTE).** Le RECOMPUTE LOCAL des credits (`g.gTfA*10 + g.getTx*1`) est SUPPRIME (les credits viennent du ledger,
  `ledgerCredits()` = `client.spent().byOperator.helius`) ; le PARAMETRE `callsByMethod` est CONSERVE pour le comptage par-methode du `by_mint`
  (provenance budget.json) et l'invariant `Sigma calls_by_method == calls_used` (test `bell_crosscheck_calls_by_method_equals_calls_used` inchange)
  -- ce comptage n'est PAS un recompute de credits. Retrait TOTAL du parametre = item pour l'orchestrateur (declencheur : ruling "callsByMethod parametre retire").
- **Cles cash (CR-4)** : `collect.ts` ne lit AUCUNE cle payante ; `readCashKeys(deps.env)` vit dans le module allowliste `close.ts` (1b-iii C-6).
  Leg cash sous le garde = 1b-iii, declencheur "G0 course cash Bell".
- **R-25 (corrige C-G2-D)** : **680** (536 ins + 144 del, 8 fichiers, base `6114ce9`, pathspec `ci.yml:65`) <= 1150. Le rendu G1 1b-ii section 3
  annoncait 674 (ERREUR de -6 insertions) ; la valeur mesuree (G2 + message de commit) est 680.

## Amendement date GARDE-HELIUS-1b-iii -- Bell close/eth + de-skip du grep + ripple recorder (2026-09-22, worker `claude-opus-4-8[1m]`)

- **Provenance** : worker G1 `claude-opus-4-8[1m]` (prefixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22,
  worktree `lot/garde-helius-1biii` (base `6114ce9` = 1b-0 fusionne). Reviseur = orchestrateur (R-21, verification adversariale
  avant consommation). Aucun reseau (fetch bouchonne, cles factices, hotes `.invalid`), aucun secret lu ni affiche (A-7 : tout
  oracle sous `env -u HELIUS_API_KEY -u CHAINSTACK_*_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`), aucun commit (R-20). Perimetre :
  `apps/bell/src/{ethereum,close,collect}.ts` + `apps/bell/package.json` + le ripple DECLARE d'`apps/sentinel/src/ukemi/record.ts`
  (couplage cross-lot 1b0-E, ci-dessous) + les tests. Gel U-4b (9 sha ADR-U4b D4/section 3) byte-identique verifie AVANT/APRES.

### 1biii-A -- Jambe ETH keyless BUDGETEE sous le client (D-7)
`bellEthCall` (le `fetch` POST brut, `ethereum.ts:64`) est SUPPRIME ; `liveEthSwaps` exige un `opts.call` budgete (throw
fail-closed sinon -- un leg non budgete rejoindrait la classe HELIUS-1) et son jeu de fournisseurs par defaut passe des URLs
`GET_LOGS_PROVIDERS` aux LABELS `GET_LOGS_KEYLESS_LABELS` (le transport resout label->url). Nouveau `makeGuardedEthCall(client,
opts)` : un `RpcCall` qui route `label -> client.call(LABEL, method, params)` (ligne ledger write-ahead PUIS une tentative,
cout 0 RU keyless), retry AU SEUL appelant sur les transitoires (Abort/reseau/429/>=500 ; `BudgetExceededError` re-jete EN
PREMIER, jamais un RpcError/4xx). R-D (2b-ii) CONSERVE structurellement : le transport construit le `RpcError` canonique
avec op = le label nu et aucune cle ; `apps/bell` ne construit plus AUCUN `RpcError` (la ligne R-D d'`ethereum.ts:67` disparait
avec `bellEthCall`, ses semantiques -- keyless, op = hote nu, zero fuite de cle -- restent portees par le paquet).

### 1biii-B -- Cles cash deplacees dans le module allowliste (C-6)
`readCashKeys(env)` est AJOUTE a `close.ts` (le SEUL module cash allowliste : il porte a la fois le GET payant et la lecture de
cle) ; `collect.ts:582-583` (`env.POLYGON_API_KEY`/`env.DATABENTO_API_KEY`) sont REMPLACES par `readCashKeys(deps.env)`.
`collect.ts` ne lit plus AUCUNE cle payante et n'est JAMAIS allowliste. Entree d'allowlist `Map<path, trigger>` :
`apps/bell/src/close.ts` -> declencheur "G0 of the Bell cash course" (quotas/caps Databento+Polygon poses la, decision 115 / R-1).

### 1biii-C -- De-skip + UNIFICATION du grep en liste de racines (E-3)
`test/rpc-guard-fetch-only-inside-client.test.ts` gagne une LISTE DE RACINES unique (packages, apps/bell/src, ukemi+rpc.ts,
scripts/census/u4-*.mjs) avec un `Map<path, trigger>` par racine ; le grep u4 de `test/guard-scripts-u4.test.ts` y est FOLD
(supprime la-bas, non duplique ; item "unifier les deux tests de grep", G7 1b-0 section 5, discharge). Le test racine
`fetch_only_inside_client` est DE-SKIPPE et itere la liste. Companions verts + tueurs de mutants (par racine, non-vacuite par
entree + double garde) : `rpc_guard_package_src_...`, `ukemi_src_...`, `u4_scripts_clean_and_import_sources_closed`,
`bell_cash_allowlist_load_bearing`, `ethereum_ts_clean_of_fetch_and_keys`, `collect_ts_clean_of_paid_key_reads`.

### 1biii-D -- Ripple `finally` du recorder (1b0-E, ruling G7 1b-0 ; couplage cross-lot DECLARE)
`apps/sentinel/src/ukemi/record.ts` : le `finally` deverrouille chaque operateur par `(op, cycles[String(op)])` -- son cycle
PROPRE -- au lieu du scalaire `cycle` unique (decision 121). `op` provient de `client.operators()` = `Object.keys(cycles)`, donc
`cycles[op]` est toujours present (asserte non-null ; un throw dans le finally masquerait l'issue de la course). Le recorder
est byte-identique HORS de ce `finally` (prouve : sha des lignes 1-419 et de la queue main() identiques AVANT/APRES ; git diff
= un seul hunk dans le finally). DECLARATIF : le recorder construit `cycles` depuis UN `--cycle`, donc `cycles[op] === cycle`
aujourd'hui et le mutant `cycles[op] -> cycle` est behaviorally identique -- la killabilite exige des cycles PAR OPERATEUR au CLI
(hors du perimetre "byte-identique hors finally"), item forme : proprietaire orchestrateur, declencheur = celui de 1b0-E (course
recorder verrouillant >= 2 operateurs sur des cycle-ids distincts). Le test `ukemi_record_finally_unlocks_each_operator_under_
its_own_cycle` prouve la NON-regression (chaque `unlocked` sous `<cycle>/<op>.jsonl`, aucun `.lock` restant) et est tue par le
mutant "unlock sous un mauvais cycle" (non-vacuite).

### Tuyaux 1b-iii (regle Branchement)
| Piece | Entree (produit) | Sortie (consomme) | Etat (ou) | Test d'integration non-LLM |
|---|---|---|---|---|
| jambe ETH gardee (fonction `liveEthSwaps` + `makeGuardedEthCall`) | `makeGuardedEthCall(openGuardedClient(...))` sur labels keyless | LES APPELANTS de `liveEthSwaps` (la course collect `--eth`, cablee au pli C-G2-A, `collect.ts:736`) | ledger keyless `<dir>/<cycle>/<label>.jsonl` (cout 0, compte) | **IT-4** `eth_leg_budgeted_and_keyless` prouve `liveEthSwaps` EN ISOLATION (client construit a la main) ; la SORTIE servie "fill TSLAon dans state.json" est prouvee par `bell_collect_eth_leg_served_fills_state_through_guard` (pli, `runMain --eth` depuis l'argv reel, second client keyless) |
| module cash allowliste | `readCashKeys(env)` (close.ts) | `readReferenceCloses` / la course cash Bell | -- (cle en argument, jamais en url/journal) | `collect_ts_clean_of_paid_key_reads` + `bell_cash_allowlist_load_bearing` |
| de-skip CI unifie | liste de racines (packages/bell/ukemi/u4) | CI (rouge si un fetch/cle hors garde/allowlist) | -- | **T4** `fetch_only_inside_client` DE-SKIPPE (liste de racines) |
| ripple recorder | `client.operators()` + `cycles[op]` | course Ukemi gardee (deverrouillage par op) | `<dir>/<cycle>/<op>.jsonl` (`unlocked`) | `ukemi_record_finally_unlocks_each_operator_under_its_own_cycle` |

### Couplages cross-lot DECLARES (fusions separees ; l'orchestrateur reconcilie)
- **`fetch_only_inside_client` est ROUGE en worktree 1b-iii DISJOINT** : les 9 hits residuels sont TOUS des fichiers 1b-i
  (`universe-cli.ts:111/267/268/281/297/312`) et 1b-ii (`collect.ts:284`, `rpc.ts:22/44`) -- ZERO dans les fichiers de 1b-iii.
  Il devient VERT sur l'arbre fusionne (demontre : en excluant ces 3 fichiers, la racine bell rend 0 hit). "0 fail" et "lever le
  skip" ne peuvent PAS coexister pour 1b-iii en isolation = incoherence de plan (error_origin: plan), surfacee (jamais masquee en
  gardant le skip). Demande de consultation formee au rendu G1.
- **Site d'appel de la jambe ETH `collect.ts:651`** (`liveEthSwaps(ethPool, ethFrom, ethTo)` sans call budgete) est dans `runMain`
  (perimetre 1b-ii). 1b-iii change la SIGNATURE (`opts.call` requis) ; le typecheck fusionne reste vert (call optionnel) et le leg
  degrade en `faults[]` (try/catch `collect.ts:650-654`) tant que 1b-ii ne branche pas `{ call: makeGuardedEthCall(client) }`.
  Contrat pour 1b-ii : passer le call garde (du `openGuardedClient` de `runMain`) a `liveEthSwaps`. Item forme, declencheur = G1 1b-ii.
- **`apps/bell/package.json` declare `@monark/rpc-guard: 0.0.0`** (deps_hygiene ADR-M018 D1) + **`package-lock.json` synchronise**
  (`npm install --package-lock-only --offline --ignore-scripts` : l'entree `packages["apps/bell"].dependencies` gagne
  `@monark/rpc-guard`, calque de `apps/sentinel`) : besoin PARTAGE 1b-i/1b-ii/1b-iii (tous importent le paquet dans `apps/bell/src`).
  1b-iii l'ajoute ; edition idempotente a dedupliquer a la fusion. Le lock est EXCLU du R-25 ; `npm ci --offline` (G0 section 9)
  se rejoue sur l'arbre FUSIONNE (orchestrateur), pas dans le worktree symlinke.
- **`test/rpc-guard-fetch-only-inside-client.test.ts` + `apps/bell/package.json`** sont edites par 1b-i aussi (grep bell, tests
  par-fichier) : conflit de fusion attendu ; la version liste-de-racines de 1b-iii SUBSUME le grep bell de 1b-i (ne pas dupliquer).

### Residus DECLARES (zero dette nue)
- **Databento/Polygon** : residuel payant hors garde a declencheur "G0 course cash Bell" (R-1) ; aucune course cash a 1b (inchange).
- **Killabilite du ripple 1b0-E** : item forme (ci-dessus), declencheur = cycles par operateur au CLI.
- **Oracle (arbre worktree, cles retirees `env -u`)** : `gate:vocab` 0, `typecheck` 0, `test` 803/802/**1 fail**/0 skip (le seul
  fail = `fetch_only_inside_client`, dependance cross-lot ci-dessus ; les 802 autres verts), `lint` 0, `lint:ratchet` 69/69,
  `lang:gate` 0, `export:check` 0 ; R-25 vs `6114ce9` (pathspec `ci.yml:65`) = 349 ins + 116 del = **465** <= 1150 ; **10** mutants
  nommes KILLED, restauration byte-exacte (sha256) ; gel U-4b (9 sha) intact. C-2 (`eth_leg_budget_refusal_is_not_retried`, mutant
  M9) et C-3 (`eth_leg_retries_transient_but_not_403`, mutant M10) prouves sur `makeGuardedEthCall` (retry appelant scope).

## Pli GARDE-HELIUS-1b (checkpoint-2 fold) -- cablage jambe ETH + section 1b-ii + tests imposes (2026-09-22, worker `claude-opus-4-8[1m]`)

**Modele resolu (R-1)** : `claude-opus-4-8[1m]` (prefixe conforme, effort max ; Opus 5 banni). **Provenance** : worker Opus 4.8, worktree de
fusion `F:\Monark-wt-garde1b` (branche `lot/garde-helius-1b` @ `14784ee`). Reviseur = orchestrateur (R-21). R-20 : aucun commit. Pli des 7
points du ruling orchestrateur (CHANTIERS.md "GARDE-HELIUS-1b checkpoint-2") + corrections G2 (C-G2-A/B/D) sur l'arbre FUSIONNE.

### Pli-1 -- Jambe ETH BRANCHEE a la course collect (C-G2-A ; error_origin: fold)
Le site `collect.ts:736` appelait `liveEthSwaps(ethPool, ethFrom, ethTo)` SANS `opts.call` ; `liveEthSwaps` (1b-iii) exige un call budgete =>
toute course `--eth` LEVAIT et etait capturee en `faults[]` (jambe ETH sans fill, fail-CLOSED mais non branchee). **Cause reelle (G2 C-G2-A)** :
le client `c` de `runMain` n'ouvre QUE les `--operators` (Solana) ; les `GET_LOGS_KEYLESS_LABELS` (ETH) ne sont pas dans ses `cycles`. **Cablage** :
un SECOND client garde `ethClient = openGuardedClient(deps.env, {maxCalls, runCaps:{}, methodCaps:{eth_getLogs,eth_getBlockByNumber}, cycleFloor:{}},
--ledger-dir, {label:--cycle pour chaque GET_LOGS_KEYLESS_LABEL}, {})` (opts `{}` => `network` defaut "ethereum-mainnet", transport.ts:105 ; cout 0
RU keyless, EXACTEMENT comme IT-4) ; `collect.ts:736` passe `{ call: makeGuardedEthCall(ethClient) }` sur la branche PRODUCTION/INTEGRATION.
**Branche hors-ligne D-1 (declaree)** : `ethCall = call` (le call budgete injecte ; RpcCall === JsonRpcCall) -- la jambe ETH offline passe par
`deps.call`, JAMAIS un `faults transport` silencieux. **CHANGEMENT DE CONTRAT (forme servie de `--eth`, avise le re-checkpoint)** : les labels
keyless ETH ne se passent PLUS dans `--operators` (le second client les ouvre lui-meme) ; la forme servie d'une course `--eth` liste en `--operators`
les seuls operateurs Solana. **Fail-closed a la construction, AVANT tout verrou** (l'ordre est critique : un throw APRES l'ouverture de `c` fuirait
ses N verrous car `release` est encore un no-op) : (a) `--eth` avec TSLAon EXIGE `eth_getLogs`/`eth_getBlockByNumber` dans `--method-caps`
(assertMethodCapsCover ne couvre que les methodes Solana) ; (b) AUCUN label keyless ETH ne peut figurer dans `--operators` -- sinon `c` le verrouille
puis l'ouverture `wx` du client ETH collisionne (LockHeld) et fuit. La forme servie d'origine (validateur sonde sect.3(c), labels DANS `--operators`)
REFUSE desormais par NOM (`must NOT be in --operators`), ZERO verrou pris (verifie : rejeu de la sonde => throw nomme, 0 fetch, 0 ledger, 0 `.lock`).
Les deux refus ont leur test + mutant (`bell_eth_course_refuses_keyless_labels_in_operators`, `bell_eth_course_fails_closed_without_eth_method_caps`).
**Garde anti-fuite residuelle** : l'ouverture d'`ethClient` (apres `c`) est sous `try/catch` -- un verrou orphelin REEL (LockHeld FS) libere les N verrous
de `c` puis re-jette (motif distinct pour garder l'ancre V5 x1). **Release** : le `finally` deverrouille les N verrous des DEUX clients (Solana `c` +
ETH keyless `ethClient`) ; la premiere boucle `c.operators()` est PRESERVEE byte-pour-byte (le mutant validateur V5 s'y ancre), la seconde boucle
`ethClient.operators()` porte un motif distinct. **Preuve non-LLM** :
`bell_collect_eth_leg_served_fills_state_through_guard` (`apps/bell/test/guard-pli-1b.test.ts`) : `runMain --eth` depuis l'argv reel, `fetch`
bouchonne a corps de forme reelle (`eth_getLogs` SWAP + `eth_getBlockByNumber`), assertant ligne ledger keyless AVANT le fetch, fill TSLAon dans
`state.json.digest.gaps` (n>=1) + timeline `n_fills>=1`, 0 `.lock`, 0 faute ethereum. Mutant "call omis au site d'appel" ROUGE. Commentaire
`ethereum.ts` (ex-":89", "the collect.ts call site passes the client's call") CORRIGE (decrit les DEUX branches).

### Pli-2 -- ASYMETRIE `callsUsed()` sur la branche garde (item forme, declare)
`makeGuardedEthCall(ethClient)` appelle `ethClient.call` DIRECTEMENT, hors du shim Solana `tally.total += 1` (`collect.ts`) ; le `calls=` du stdout
et le RUN-ledger a1-bis SOUS-COMPTENT donc les tentatives ETH (mesure : `calls=0` alors que 4 fetch ETH ont eu lieu). Le CYCLE ledger d'`ethClient`
(`ethClient.spent().attempts`) enregistre CORRECTEMENT les 4 tentatives (cout 0 RU keyless) et `ethClient` fail-close son propre `maxCalls` : ce
n'est PAS un trou de budget, c'est une asymetrie de PROVENANCE (le compteur RUN affiche ne somme pas la jambe ETH). Sur la branche hors-ligne, l'ETH
est compte via `budgeted.calls()` (chemin partage). **Item forme** : sommer `callsUsed()` de la branche garde = tally Solana + `ethClient.spent().attempts`
(ou deriver du CYCLE ledger des deux clients). Declencheur : la premiere course `--eth` rapprochee dont la provenance RUN doit refleter les tentatives
ETH. Proprietaire : orchestrateur.
**Borne de tentatives (re-checkpoint-2 2026-09-22, correction 1)** : le second client recoit le MEME `--max-calls` avec son propre compteur ;
une course `--eth` peut donc totaliser jusqu'a **2 x `--max-calls` tentatives** (Solana + ETH). Aucune exposition d'argent (jambe ETH keyless
0 RU ; helius/chainstack bornes par `runCaps` + caps de cycle), mais la borne de tentatives de la course est 2 x, pas 1 x, tant que cet item
n'est pas plie. Meme declencheur.

### Pli-3 -- `collect.ts` release() deverrouille avec le scalaire `cycle` (item forme ; meme principe 1b0-E)
`collect.ts` release() (et `universe-cli.ts` finally) deverrouillent chaque operateur avec `--cycle cycle` (le SCALAIRE), pas `cycles[op]`. C'est
behaviorally CORRECT aujourd'hui (tous les operateurs partagent UN `--cycle`, `cycles = Object.fromEntries(operators.map(l => [l, cycle]))`), donc
le mutant scalaire SURVIT (declaratif, comme le ripple recorder 1b0-E / V4). **Item forme** : porter le deverrouillage sur `cycles[op]` (le cycle
propre a chaque operateur). Declencheur : celui de 1b0-E -- une course verrouillant >= 2 operateurs sur des cycle-ids DISTINCTS au CLI. Proprietaire : orchestrateur.

### Pli-4 -- "reclaim d'un verrou orphelin apres crash hors fenetre" (item forme, NOMME au pli)
Le ruling nomme cet item jusque-la implicite : un crash DUR (SIGKILL) laisse les `.lock` tenus (fail-closed, detectable) ; la recuperation
1b0-D (`unlock`) recupere un verrou crash-EN-fenetre, mais un verrou ORPHELIN apres crash HORS fenetre (cycle clos, process mort) n'a pas de
proprietaire de nettoyage automatique. **Item forme** : definir le reclaim d'un tel verrou orphelin (runbook `unlock` explicite ou detection par age).
Declencheur : PREMIERE observation en course (un `.lock` orphelin constate apres un crash). Proprietaire : orchestrateur. (Voir aussi 1b0-G crash au 1er append, item distinct.)

### Pli-5 -- Corrections de rendu R-25 (C-G2-D) et tuyaux 1b-iii
- R-25 par sous-lot (mesure G2, pathspec `ci.yml:65`, base `6114ce9`) : 1b-i **1136**, 1b-ii **680** (rendu G1 disait 674), 1b-iii **465** (rendu G1
  section 7 disait 415 ; sa section 3 disait deja 465). Valeurs corrigees dans la section 1b-ii ci-dessus et ici (les rendus G1 sont des artefacts
  historiques hors depot ; l'ADR est le registre durable). error_origin : passation (CA-8).
- Tuyaux 1b-iii : la ligne "jambe ETH gardee" declarait la sortie "fills TSLAon" prouvee par IT-4 ; corrige -- IT-4 prouve `liveEthSwaps` EN ISOLATION,
  la sortie servie est prouvee par le nouvel IT collect->eth du pli.

### Pli-6 -- Oracle, harnais, invariants (arbre fusionne+pli, cles retirees `env -u`)
- **Oracle** (arbre fusionne+pli, `env -u`) : `npm run ci` exit 0 = **835 tests / 835 pass / 0 fail / 0 skip** (830 base + 5 tests du pli) ;
  `lint` 0 ; `lint:ratchet` **69/69** ; `lang:gate` 0 ; `export:check` 0.
- **Harnais unifie** `F:\tmp\garde1b\pli\mutants.mjs` : **43 mutants, 42 KILLED + 1 SURVIVED (V4 declaratif attendu), 0 bad**. Composition : 31 G1
  applicables (1b-i 11 [M1 adapte a l'en-tete combine fusionne, coincide avec V1 -- declare] ; 1b-ii 10 [le mutant "cle Solana relue dans collect.ts"
  est PLIE : son ancre a disparu au pli m3/m4 quand 1b-iii C-6 a deplace les cles vers `readCashKeys`/close.ts ; la propriete est re-tuee par 1b-iii M3
  + V3] ; 1b-iii 10) + 7 validateur V1..V7 + G2 CL-1 (foldPage desenveloppe json.result, RESTE ROUGE) + le mien "call omis au site" + un mutant dedie
  429-streak ">= -> >" + **2 refus fail-closed ETH** ("labels-in-operators check removed", "eth method-caps check removed") = **43**. Critere de kill =
  le test nomme rapporte `fail >= 1` (jamais "exit != 0" seul) ; restauration byte-exacte sha256 ; `env -u`.
- **Invariants** : `packages/rpc-guard/src/**` (12 fichiers) byte-identiques AVANT==APRES le harnais (M5/V2 mutent le paquet TRANSITOIREMENT, restaure) ;
  les **9 sha geles U-4b** byte-identiques AVANT==APRES. Le pli n'edite QUE `apps/bell/src/{collect,ethereum,universe-cli}.ts` (cablage jambe ETH +
  refus fail-closed a la construction + 2 commentaires), `apps/bell/test/guard-pli-1b.test.ts` (neuf, 5 tests) et cet ADR ; aucun fichier du paquet ni du gel U-4b.
- **Tests du pli (5)** : `bell_course_reaches_fetch_only_via_openGuardedClient` (D-1, sonde sur les DEUX entrees servies universe + collect ; tue par
  1b-i M5 versant universe et 1b-ii "guard bypassed" versant collect) ; `bell_collect_eth_leg_served_fills_state_through_guard` (C-G2-A, fill TSLAon ;
  tue par "call omis au site") ; `bell_eth_course_refuses_keyless_labels_in_operators` + `bell_eth_course_fails_closed_without_eth_method_caps` (refus
  fail-closed AVANT tout verrou, 0 `.lock` ; tues par leurs mutants dedies) ; `bell_universe_429_streak_stops_fail_closed` (compose ; tue par 1b-ii
  "statusOf ignore .code" et le mutant dedie ">= -> >").

# Amendement PROPOSÉ à ADR-GARDE-HELIUS — BELL-RETRY-1 : `NonJsonBody` (HTTP 200 + corps non-JSON) devient TRANSITOIRE (retry borné)

- **Statut** : PROPOSÉ (worker G1). Ne touche AUCUN fichier du dépôt ; à folder par l'orchestrateur au G7 si accepté (R-20 : le worker ne committe pas). Cible : `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md`.
- **Provenance** : modèle épinglé `claude-opus-4-8[1m]`, effort max ; 2026-09-22 ; worktree `F:\Monark-wt-bellretry1` (branche `lot/bell-retry-1`, base `lot/etude-suite` @ `1f4b746`) ; réviseur : orchestrateur (G2 ‖ checkpoint-2 à suivre).
- **Déclencheur** (journal de course, `docs/CHANTIERS.md:748`) : 14:21 UTC — le tirage Bell TSLAx a STOPpé fail-closed après 201 pages sur un `FATAL HTTP 200` = `TransportError` name `NonJsonBody` (corps non-JSON sur une réponse 200 Helius, transitoire fournisseur). Item formé `BELL-RETRY-1` (`docs/CHANTIERS.md:754`). `error_origin` : plan (classe d'erreur non qualifiée à la conception du retry, Amendement 2b).

## Décision

L'Amendement GARDE-HELIUS-2b déclarait (verbatim, ligne ADR ~320) : le retry chez l'appelant « réessaie `AbortError`/réseau, 429, ≥ 500, **JAMAIS** `RpcError`/**`NonJsonBody`**/autres 4xx/`BudgetExceededError` ». Cet amendement **révise la seule classe `NonJsonBody`** :

- **`NonJsonBody` est TRANSITOIRE** (retry borné, backoff existant) **quand son statut (`.code`) est 200, 429, ou ≥ 500** (5xx : 502/503/504…). Un `NonJsonBody` sur un **4xx ≠ 429 reste FATAL** (re-jeté immédiatement).
- Inchangé pour toutes les autres classes : `RpcError` (revert déterministe), `HttpError` 403 / autres 4xx, `BudgetExceededError` → jamais réessayés ; `AbortError`/réseau/`TypeError`, `HttpError` 429/≥500 → transitoires.

**Fait de portée mesuré (à consigner, pour éviter le faux « manque » en G2)** : via CE transport, un `NonJsonBody` n'est atteignable qu'avec un code **2xx** — `transport.ts:229` route tout `!res.ok` (4xx/5xx) vers `HttpError` et `transport.ts:228` route un 3xx vers `RedirectBlocked`, AVANT le `JSON.parse` (`transport.ts:241`) qui seul lève `NonJsonBody` avec `.code = res.status`. Les arms **429/≥500** du prédicat sont donc **défensives** (pour tout autre producteur de la classe canonique) ; l'arm **200** est le cas réel (page HTML de passerelle à HTTP 200).

**Étiquette de journal** (`statusOf`) : un `NonJsonBody` est étiqueté **`"non-json <status>"`** (ex. `non-json 200`), plus jamais `"HTTP 200"` — cette dernière **masquait la classe** (le « FATAL HTTP 200 » du journal). Placé AVANT la branche générique `.code` de `statusOf` (qui rendait `"HTTP 200"`).

## Bornes et backoff (E-3)

- Backoff déterministe **`400·(i+1) ms`** (inchangé, `quorum.ts` `withRetry`), `sleep` injectable (tests hors-ligne : no-op).
- Bornes de retry inchangées, propres à l'appelant : **défaut `tries = 4`** (`withRetry`, ex. `collect.ts:353` corps de tx) ; **`RETRY_TRIES = 6`** pour le tirage cross-check (`rebase-crosscheck.ts:626/672`, le chemin qui a STOPpé). « retry borné 4 » de la mission = la borne par défaut. `onRetry` compté une fois par retry réellement pris ⇒ métré dans `budget.json.retries_by_method[<méthode>]` (le champ qui valait 0 quand TSLAx a STOPpé).

## Tuyaux déclarés (règle Branchement, F-1)

| Pièce | Entrée (qui produit) | Sortie (qui consomme) | État (où) | Test d'intégration (non-LLM) |
|---|---|---|---|---|
| `isTransient` (prédicat Bell) `apps/bell/src/quorum.ts` | `TransportError` du transport `@monark/rpc-guard` (`raise(op,"NonJsonBody",res.status,text)`) | `withRetry` (borne appelant) → `scanFullMint`/`collect` | pur (pas d'état) | `bell_crosscheck_guarded_nonjsonbody_200_gateway_html_is_retried_and_metered` (real `openGuardedClient`, seul `globalThis.fetch` bouchonné, corps HTML de passerelle @200) ; unités `bell_retry_nonjson_*` |
| `statusOf` (étiquette) `apps/bell/src/quorum.ts` | `TransportError` (`.name`/`.code`) | journal `faults[].status` (`collect.ts:809` `journal.json`) ; `retries_by_method` métré via `onRetry` | fichier `budget.json`/`journal.json` sous `--out` | idem (`retries_by_method.getTransactionsForAddress >= 1` après recovery) |

`packages/rpc-guard/src/**` **INTOUCHÉ** (le prédicat est côté Bell). Le transport lève déjà `NonJsonBody` avec `.code = res.status` (`errors.ts:38`, `transport.ts:193`) : aucune modification paquet nécessaire.

## Résidus nommés à déclencheur (zéro dette nue)

- **R-BR1 — `NonJsonBody` sur 201–299 (autres 2xx) reste FATAL.** Choix littéral de la mission (« 200/502/503/504 transitoire »). Un 204/206 à corps non-JSON n'est pas réessayé. *Non atteignable en pratique* (une page HTML de passerelle est un 200). **ÉPINGLÉ PAR TEST (checkpoint-2 C-2)** : la matrice `bell_retry_nonjson_transient_matrix_...` asserte 201 ET 204 fatals (n=1) ; le mutant V4 (`=== 200` élargi à `[200,300)`) rougit ⇒ ce n'est plus un résidu non testé mais un invariant épinglé. *Déclencheur restant* (élargir la doctrine) : décision d'admettre `code >= 200 && code < 300`. Propriétaire : orchestrateur.
- **R-BR2 — le classifieur SYMÉTRIQUE côté Ukemi n'est PAS aligné.** `apps/sentinel/src/ukemi/record.ts:345` porte le MÊME prédicat transitoire **sans** la clause `NonJsonBody` (et `record.ts:322-323` exclut explicitement `NonJsonBody` du retry). Une course Ukemi (job Narabi, tirage de calibration) heurtant un `NonJsonBody@200` STOPperait **à l'identique**. HORS périmètre de ce lot (Bell-scoped ; `apps/sentinel/**` non touché). *Déclencheur* : prochain lot touchant `record.ts`, OU première occurrence d'un `NonJsonBody@200` sur une course Ukemi (alors STOP + lot immédiat, calque BELL-RETRY-1). Propriétaire : orchestrateur. `error_origin` : plan (Amendement 2b, même classe non qualifiée des deux côtés).

## Mode MAST contré (checkpoint-2 C-5)

**« vérification incorrecte »** (MAST catégorie 3 « vérification des tâches / Task Verification », FC3 — arXiv:2503.13657, via doc 06 §5/§6.4 [lu]) : une suite de tests VERTE qui ne **reproduit pas** le STOP réel de production. Contre-mesure de ce lot : **A-8** (le corps HTML de passerelle réel traverse le vrai `openGuardedClient` ⇒ le test exerce le chemin `transport → isTransient → withRetry → scanFullMint` réel) **+ M1b** (retirer la clause `NonJsonBody` fait REJETER `runMain` avec `NonJsonBody ... code 200` = le STOP TSLAx exact — le test d'intégration est vert PARCE QUE le STOP est reproductible sous mutation, jamais par vacuité).

## Preuve (rendu G1, pli checkpoint-2)

- Oracle (env `-u` clés payantes, A-7) : `gate:vocab`/`typecheck`/`lint`/`lint:ratchet`/`lang:gate`/`export:check` = exit 0 ; `test` = exit 0, **872 tests, 871 pass, 0 fail, 1 skip** (skip pré-existant conditionnel `u4b_labels_replay_via_main_real_artifact`, artefacts e2 réels hors dépôt, fichier non touché par ce lot).
- **Mutants** (`mutants.mjs`, mutation source transitoire + restauration byte-exacte par sha) : **10 mutants, tous ROUGES, tous restaurés** (`NonJsonBody` retiré du prédicat [unité + cross-check garanti] ; 4xx admis ; 200 retiré ; 5xx retiré ; `statusOf` ancien libellé ; `onRetry` sur la dernière tentative ; retry non borné ; épuisement jette un `Error` générique ; **V4 checkpoint-2 C-2 : `=== 200` élargi à `[200,300)` ⇒ 201/204 deviennent transitoires ⇒ rougit la matrice, pin R-BR1**).
- R-25 = **151** lignes (147+/4−, 3 fichiers ; pathspec `ci.yml:65` verbatim, docs exclus ; +8 au pli checkpoint-2 C-2) — < 300 attendu. Gel U-4b : **9/9 fichiers byte-identiques** AVANT==APRÈS.

### Items formes au G2/checkpoint-2 de BELL-RETRY-1 (orchestrateur)
- R-BR3 : `apps/bell/src/universe.ts:113` `withUniverseRetry` porte le meme predicat sans la clause NonJsonBody (VIVANT, consomme par `universe-cli.ts`). Declencheur : AVANT la phase B univers (50 000 cr, ledger dedie) ; forme recommandee : centraliser `isTransientTransport(name, code)` consomme par les 3 classifieurs Bell.
- R-BR4 : `apps/bell/src/ethereum.ts:77` `makeGuardedEthCall` (jambe ETH). Declencheur : premiere course `--eth`.
- R-BR2 -> lot UKEMI-RETRY-1 (precondition du depart de la course Ukemi).
- Budget de cycle : sous RETRY_TRIES=6, une passerelle durablement cassee coute jusqu'a 6 tentatives metrees par faute avant STOP (contre 1) — marge du cycle Helius (10 M, consomme ~0,1 M) confirmee avant la fusion D-n.

# Amendement daté 2026-09-22 à ADR-GARDE-HELIUS — NARABI-OPS-1d : clause « par compte » (décision 121) au cas INTER-MACHINES (option 1) ; A-1 / A-4 ; déclencheurs A-6 / R-B

- **Provenance** : texte worker `claude-opus-5-5[1m]` (effort max), 2026-09-22, depuis `lot/etude-suite` @ `de30eab` et `lot/narabi-ops-1d` @ `7daf8e5` (lecture seule) ; **inséré par l'orchestrateur `claude-fable-5-1` SEUL au G7 de NARABI-OPS-1d** (R-20) ; réviseur = orchestrateur (R-21). Autorités : décision investisseur 121 (`docs/CHANTIERS.md:602-603`) ; ruling orchestrateur 2026-09-22 04:3x UTC, option 1 (`docs/CHANTIERS.md:672`). NARABI-OPS-1d ne modifie aucun fichier de `packages/rpc-guard/**` (`git diff --name-only f6442fe 7daf8e5` : 8 fichiers, aucun sous `packages/`).
- **Objet** : la clause 121 est écrite pour la dimension RÉSEAU (amendement 2b-ii, clause 121 (a)-(e)) et implémentée (1b0-B) sur un ledger par compte ET par machine. NARABI-OPS-1d ouvre une 2ᵉ machine (le VPS site) sur le même compte : cet amendement fixe la dimension INTER-MACHINES et amende A-1 / A-4 en conséquence. Avec lui, l'item de la décision 121 « ADR-GARDE-HELIUS A-1/A-4 à amender (clause « par compte ») » (`docs/CHANTIERS.md:603`) est clos — à acter par l'orchestrateur au G7.

## -1d-A — A-1 par compte : unité, tarif, plafond
- Le tarif (`chainstackRu`, `CHAINSTACK_TARIFF_VERSION = "chainstack-2026-09-21"`) et le plafond de cycle 16 M RU (décisions 115 et 121) sont ceux du COMPTE : identiques sur toute machine et tout réseau. La jambe Narabi du VPS ne mètre que `eth_getBlockByNumber`, `eth_getLogs` et `eth_call` (`CHAINSTACK_METHOD_CAPS`, `apps/sentinel/src/run.ts:232` ; `docs/G0-lot-narabi-ops-1d.MESURES.md:52`), toutes dans la liste fermée A-1 des méthodes EVM sensibles à l'âge : `credits_derived` = 2 RU par essai (tarif conservateur, MAJORANT de la consommation).
- Sur chaque machine, le plafond compte est tenu par le prior figé `max(floor, Σ credits_derived des lignes attempted de SON ledger)` (`packages/rpc-guard/src/ledger.ts:128`) et le refus `cycle_cap` (`packages/rpc-guard/src/client.ts:118`). Les plafonds de RUN de la jambe Narabi (2 000 essais, 20 000 RU, 2 000 par méthode ; `run.ts:230-232`) sont propres au VPS.

## -1d-B — Inter-machines : option 1 (un ledger LOCAL par machine ; plafond compte reconstitué par le floor)
- Un compte Chainstack, un `cycle_id` (le même que la course Ukemi), **deux ledgers physiques** : VPS site `/var/lib/monark-sentinel/ledger/<cycle>/chainstack.{jsonl,head,lock}` (job quotidien Narabi, lignes `network:"ethereum-mainnet"`) ; machine de l'investisseur `<--ledger-dir>/<cycle>/chainstack.*` (courses Ukemi et Bell). Le plafond PAR COMPTE est reconstitué par le **floor = total du compte lu au tableau de bord** (somme des réseaux, donc des machines ; décision 121), importé dans chaque garde : `CHAINSTACK_CYCLE_FLOOR` sur le VPS (posé au 2ᵉ redéploiement puis à chaque changement de période de facturation ; `run.ts:250-252`, `docs/RUNBOOK-sentinel.md` §6-bis), `--floor` pour une course (prereg §4).
- **Option 2 refusée** (un fichier de ledger physiquement partagé entre machines) : le verrou `chainstack.lock` tenu par une course Ukemi (plusieurs jours) rendrait la jambe Narabi noire (ruling 04:3x UTC) ; en outre `openSync("wx")` (O_EXCL) n'est pas garanti sur un montage SMB/NFS, donc le verrou C-9 serait cassé (`docs/G0-lot-narabi-ops-1d.DRAFT.md:174-178`).
- **Conséquences déclarées** :
  - (a) la conséquence de verrou de la clause 121 (d) et de 1b0-B (d) (« pas deux courses Chainstack simultanées ») vaut PAR FICHIER de ledger, donc par machine : le job Narabi et une course Ukemi ou Bell PEUVENT se chevaucher (c'est l'objet de l'option 1) ;
  - (b) chaque garde ne voit que son ledger et le floor importé. **Résiduel** : entre deux rafraîchissements le floor du VPS est périmé, son contrôle 16 M est donc optimiste. Bornes : plafonds de run Narabi (-1d-A) ; toute course lit le floor VRAI sur place avant de partir (décision 121, prereg §4) ; overage désactivé (A-5) : à quota atteint, Chainstack cesse de servir, la jambe Narabi est benchée et le jour passe au quorum keyless (D-degrade), jamais une facture ;
  - (c) le rapprochement reste PAR COMPTE (clause 121 (c)) ; `network` est informatif.

## -1d-C — A-4 (iv) : source du résiduel Narabi
- **Avant le 2ᵉ redéploiement** — dont la course U-4b-1b, prereg gelé §4 (iv) : INCHANGÉ (journal du sentinel). Cet amendement ne modifie pas le prereg.
- **Après le 2ᵉ redéploiement** : ledger VPS, jamais `credits_derived` (majorant). Résiduel = N × 1 RU, N = nombre de lignes `outcome:"attempted"` portant `network:"ethereum-mainnet"` ENTRE deux positions épinglées (nombre de lignes et contenu de `chainstack.head`) relevées aux instants des lectures before/after, **sans `chainstack.lock` présent** au relevé (aucun run en cours). Les lignes de ledger ne portent AUCUN horodatage (`CycleLedgerEntry`, `ledger.ts:27-42`) : la fenêtre se définit par positions épinglées, jamais par date (procédure : `docs/RUNBOOK-sentinel.md` §6-bis). Les lignes `unlocked` (fin de run, sans `network` : `cli.ts:39` ouvre le ledger sans réseau) et `refused` (jamais envoyées) ne comptent pas.
- **Hypothèse H-FACT (NON établie)** : « N × 1 RU ≤ consommation réelle » exige que chaque essai compté ait été facturé au moins 1 RU. Or le ledger écrit l'ESSAI avant le fetch, sans son issue (`Outcome` = `attempted | refused | reconciled | unlocked`, `client.ts:17`) : un essai qui n'atteint pas Chainstack (DNS, connexion, TLS) n'est pas facturable, et la tarification lue (FAITS-tarification-chainstack-2026-09-21, pts 1-11) ne dit rien des requêtes en échec. Marge : chaque requête facturée en archive (2 RU, FAITS pts 1 et 3) compense un essai non facturé ; le cas défavorable est un jour où Chainstack est majoritairement injoignable. **Tant que H-FACT n'est pas établie, le seul minorant garanti est 0 RU** : la contrainte (iii) (aucune fenêtre before/after chevauchant un créneau Narabi, décision 118) RESTE en vigueur. Item -1d-E.

## -1d-D — Déclencheurs A-6 (2a) et R-B (2b-ii) qui nommaient « NARABI-OPS-1d »
- **Élargissement du grep `fetch_only_inside_client` à `apps/sentinel/src/**` : FAIT par -1d** (`test/rpc-guard-fetch-only-inside-client.test.ts` : `sentinelScope` l. 79-83, `SENTINEL_ALLOW` à 2 entrées avec déclencheur l. 108-111, non-vacuité par entrée l. 176-180). Le test `ukemi_src_clean_and_allowlist_load_bearing` (cité ci-dessus l. 344 et l. 445) est RENOMMÉ `sentinel_src_clean_and_allowlist_load_bearing` (l. 148 à `f6442fe`, l. 159 à `7daf8e5`).
- **Rétractation de l'entrée `apps/sentinel/src/rpc.ts` : REPORTÉE au pli §11-1** (option (b)) : `rpc.ts` est au gel D4 de l'ADR-U4b ; -1d le laisse byte-identique (`0e232519…`) avec ses exports payants devenus MORTS. **Déclencheur** : clôture de la course U-4b-1b au sens du gel (ADR-NARABI-OPS-1, amendement -1d, A.8-1). Auto-armée : la non-vacuité par entrée rougit l'entrée dès que le code mort est supprimé.
- **Décision 118** : jusqu'au 2ᵉ redéploiement le VPS exécute `c4981d0` (`docs/JOURNAL-PROVENANCE.md:353-357`) ; la phrase A-6 « `rpc.ts` reste un chemin payant HORS garde en production » reste VRAIE jusque-là.

## -1d-E — Tuyaux et items formés
| Tuyau | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test d'intégration non-LLM |
|---|---|---|---|---|
| garde Narabi (VPS) | `openGuardedClient(process.env, limits, <état>/ledger, {chainstack: <cycle>}, {network: "ethereum-mainnet", timeoutMs: 20 000})` (`run.ts:295`) | `client.call` : ligne write-ahead puis transport ; `runCli unlock` en fin de run (`run.ts:305`) | ledger VPS (option 1) ; `upcoming` jusqu'au 2ᵉ redéploiement (ADR-NARABI-OPS-1, amendement -1d, A.4) | `sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock` (lignes `network:"ethereum-mainnet"` sur disque, garde réel) |
| ledger VPS → A-4 (iv) | lignes `attempted` du VPS | résiduel N × 1 RU, sous H-FACT | relevé manuel, SSH lecture seule | aucun (acte manuel déclaré) |

- **Item H-FACT** — choix non tranché, recherche de solutions : (1) lecture SUR PLACE, par l'orchestrateur, de la politique de facturation Chainstack des requêtes en échec (FAITS daté) — ne couvre pas les essais qui n'ont jamais atteint le serveur ; (2) journaliser l'issue de chaque essai payant (lot paquet : valeur d'`Outcome` ou attribut d'issue, ripple `verifyCycleLedger`) — seule voie qui rende le minorant exact ; (3) conserver la contrainte (iii) (statu quo). **Propriétaire** : orchestrateur. **Déclencheur** : avant le premier rapprochement A-4 consommant le ledger VPS, ou avant le prochain prereg Chainstack qui voudrait relâcher (iii).
- **Floor VPS périmé** — résiduel déclaré (-1d-B (b)). **Déclencheur de réévaluation** : une course Chainstack qui approche 16 M RU (A-5 : quota exact à procurer alors). **Propriétaire** : orchestrateur.
