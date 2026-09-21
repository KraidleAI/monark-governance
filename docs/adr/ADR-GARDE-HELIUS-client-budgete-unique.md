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
- **Chainstack RU / Databento / Polygon / keyless** : classes d'opérateur au-delà d'Helius — le mécanisme (unit `credits|requests|keyless`
  + `cycleCap`) les supporte ; les chiffres (RU/méthode, requêtes/cycle) sont posés à leur *déclencheur* (étalonnage 1ʳᵉ course Chainstack ;
  lecture orchestrateur des quotas Databento/Polygon). Cap RU 16 M (décision 115) déclaré **non-applicable-cette-course** avant étalonnage.
- **`bin` d'exécutable** : `runCli` est la surface servie testée ; le wrapper `bin` (process.argv + fs réel) est un item de câblage 1b.
- **Finding CI grep** : le motif nu `undici` matche un COMMENTAIRE (`universe-cli.ts:208`) ; le gate 1b doit ignorer les commentaires (ou
  reformuler la ligne). Rapporté, pas un défaut de code.
- **Verbatim validateur** (`a5b427a48e37fb967.output` = 0 o) : *déclencheur* = restauration ⇒ l'orchestrateur substitue tout écart.
