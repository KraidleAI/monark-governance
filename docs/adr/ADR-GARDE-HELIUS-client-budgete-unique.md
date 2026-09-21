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
  portant le `code` (statut HTTP ou code JSON-RPC) et un message `scrubUrls`. Le hook reçoit `(op, errorName, code)` — jamais l'URL. **Le hook du
  transport est un point d'injection NEUF et INDÉPENDANT** ; il **ne remplace PAS** le classement du recorder : en 2b, le moniteur 5 %
  (`onRpcError`) **re-branche SON PROPRE puits** dessus (un re-câblage), le transport ne reprend pas sa logique de quorum/revert.

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
