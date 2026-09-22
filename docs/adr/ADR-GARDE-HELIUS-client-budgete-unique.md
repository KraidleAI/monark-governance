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
  `AbortError`/réseau, 429, ≥ 500, JAMAIS `RpcError`/`NonJsonBody`/autres 4xx/`BudgetExceededError` ; `finally` relâche **N** verrous demandés — keyless
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
(AbortError/reseau, 429, >= 500 -- 3 pour oracle-path, 0 pour redraw), jamais `RpcError`/`NonJsonBody`/autres 4xx/budget.

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
