# G2 — RELECTEUR (contexte frais, revue 3 étapes) — GARDE-HELIUS-2a (`@monark/rpc-guard`, moitié PAQUET du lot 2)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé).
**Verdict : PASS-AVEC-CORRECTIONS.** Cœur money-guard SAIN (29/29 mutants rouges, CI verte, caps/atomicité/sous-ensemble/unités/tarif/rapprochement corrects) ; **corrections C-G2-1..6 formées** ci-dessous — **convergentes** avec le checkpoint-2 parallèle (`412eea7:docs/CHECKPOINT2-lot-garde-helius-2a.md`, ACCEPTE-AVEC-CORRECTIONS C-V-1..6), reproduites de PREMIÈRE MAIN. Le paquet reste `upcoming`.

Cible **PINNÉE `dd9148f`** (base `5d177db`). Isolation : `git archive HEAD` → `F:\tmp\g2-garde2a\tree\`, jonction `node_modules → F:\Monark\node_modules`, `TEMP/TMP=F:\tmp\g2-garde2a\os-tmp` (rien sur C:). **10/10 fichiers `src` de l'arbre isolé == blobs `dd9148f`** (sha256), tous mutants restaurés byte-exact. Aucun `git checkout/stash`, aucun `npm ci/install`, aucun réseau (`fetch` bouchonné, URL `example.invalid`, clés factices), aucune écriture dans le dépôt (R-20). Résolution : `@monark/rpc-guard` = **auto-référence** du paquet (package.json `exports`) ⇒ les tests voient le `src` ISOLÉ, pas le symlink `node_modules → main tree` (main = 1a, vérifié).

---

## 1. Mesures RE-EXÉCUTÉES (arbre isolé pristine `dd9148f`)

| Contrôle | Résultat | Détail |
|---|---|---|
| (1) `npm run ci` | **exit 0** | 700 tests, **699 pass, 0 fail, 1 skip** (isolé : 706/705/1 = 700+**mes 6 sondes**). Skip = `fetch_only_inside_client # SKIP until 1b` (déclaré) ; l'autre moitié `rpc_guard_package_src_clean_and_allowlist_load_bearing` **verte**. |
| (1) eslint `packages/rpc-guard` | **0 problème (exit 0)** | le diff n'ajoute **0** erreur eslint. |
| (1) `npm run lint` (full) | 1 erreur, exit 1 | UNIQUE = `apps/bell/test/rebase-crosscheck.test.ts:600` (`no-unnecessary-type-assertion`), **PRÉ-EXISTANTE hors périmètre**. |
| (1) `npm run lint:ratchet` | 70/69, exit 1 | **PRÉ-EXISTANT**. Comptage rules-ratchet dans `packages/rpc-guard/test` = **0** (re-exécuté : ESLint API, 6 règles ré-activées). Le diff n'ajoute **0** dette ratchet. |
| (8) `ledger_format_locked_to_rebase_crosscheck` | **actif et vert** | `packages/rpc-guard/test/ledger-format-lock.test.ts:22`, dans les 700 pass. |
| (9) R-25 (pathspec `ci.yml:65`, base `5d177db`) | **656** (542 ins + 114 del, 16 fichiers hors docs) | ≤ 1 150 (pas de seam) ≤ 1 205. |
| (11) `git merge-tree lot/etude-suite HEAD` | **exit 0, tree écrit, 0 conflit** | fusion propre. |
| (7) Périmètre `5d177db..dd9148f` | **17 fichiers** : `packages/rpc-guard/**` (8 src + 8 test) + `docs/adr/ADR-…md` seulement | `apps/sentinel/src/rpc.ts`, `record.ts`, `rpc2.ts` **byte-identiques** à la base (`git diff --quiet` = UNCHANGED). |
| (7) Registre `upcoming` | **confirmé** | `git grep -niE rpc-guard dd9148f -- apps/site README.md skills/** \| grep built` = **aucun hit** (le paquet n'est déclaré `built` dans aucune surface publique). |
| (10) `gate:vocab` + ASCII | OK, re-exécuté | `npm run gate:vocab` = « scanned **202 file(s)**, no forbidden claim » ; `grep -P '[^\x00-\x7F]'` sur `packages/rpc-guard/src/*.ts` = **vide** (surfaces exportées ASCII anglais). |

## 2. 23 mutants du harnais worker (`F:\tmp\garde2a\mutants.mjs`), REJOUÉS dans l'arbre isolé

**23/23 RED**, chacun tue son test NOMMÉ, **restauration byte-exact sha256 confirmée après chaque** (`all restored: true`). Extraits d'assertions rouges CITÉES (première main) :

| Mutant | test tué | assertion rouge citée |
|---|---|---|
| R1 transport-gets-url | transport_never_receives_url | `transport got a non-label first arg: https://leak/helius` |
| R2 retry-nested | budget_counts_http_attempts | `2 caller retries => 3 attempted lines (mutant retry-nested)` |
| R3 append-after-fetch | budget_counts_http_attempts | `ENOENT ... /helius.jsonl` (ligne absente pendant le fetch) |
| R4/R5/G2M1/G2Mrc | run/method/cycle/run-credits cap | `Missing expected rejection.` |
| R6 reset-on-missing | delete_ledger_prior_ge_floor | `prior = max(floor, Sigma) = floor here` |
| R9 lock-w-not-wx | lock_blocks_second_writer | `Missing expected exception (LockHeldError).` |
| R11/G2M5 reconcile | reconcile_asymmetric | `Expected values to be strictly equal:` (GO au lieu de NO-GO) |
| R12 instanceof-broken | budget_stop_not_swallowed_by_quorum2 | `a budget stop must propagate through the quorum2 guard, never be swallowed` |
| A1 chainstack-getlogs-1ru | chainstack_tariff_is_conservative_and_closed | `eth_getLogs is age-sensitive => 2 RU` |
| A2 chainstack-unknown-tolerated | chainstack_tariff_is_conservative_and_closed | `Missing expected exception.` |
| A3 rollback-removed | multi_lock_acquire_is_atomic_with_rollback | `ATOMIC rollback: the k-1 lock (chainstack) was released` |
| A4 prior-before-lock | prior_is_frozen_after_lock | `open must be gated by the lock` |
| A5 floor-shared | two_paid_operators_… | `Got unwanted exception: chainstack WITH a cap constructs` |
| A6 subset-ignored | unrequested_operator_is_never_locked | (LockHeldError sur k-ième, ouvre tous les résolus) |
| A7 units-merged | two_paid_operators_… | `strictly deep-equal` ({all:14} ≠ {helius:10,chainstack:4}) |

## 3. 6 mutants MONEY de mon cru (arbre isolé), sur les classes de défaut HELIUS-1 / cap-1a

Sondes positives ajoutées (arbre isolé) — **6/6 vertes sur le code livré** ; chaque mutant **tue sa sonde** (restauration byte-exact) :

| # | Sonde money (verte sur `dd9148f`) | mutant → résultat |
|---|---|---|
| MM1 | **cap de cycle Chainstack, floor 15 999 990 / cap 16 000 000, eth_call 2 RU ⇒ EXACTEMENT 5 transports** (5ᵉ : `15 999 990 + 8 + 2 = 16 000 000`, **pas `>` cap ⇒ passe** — cap inclusif, calque 1a T8 `15+0+10=25`), 6ᵉ refusé `cycle_cap` | `prior+run+cost` → `max(prior,run)+cost` (absorption 1a : le floor absorbe le run) ⇒ ~100 transports ⇒ RED `EXACTLY 5 transports` |
| MM2 | un spend Helius (crédits) **ne consomme jamais** le runCap Chainstack ; `spent().byOperator = {helius:10, chainstack:4}` | `runByOp.get(op)` → somme tous opérateurs ⇒ 1er chainstack refusé `run_credits` ⇒ RED |
| MM3 | méthode Chainstack inconnue via client public ⇒ **refus ledgeré `unknown_method`, 0 transport** | `costOf` catch → `return 1` ⇒ transport lancé ⇒ RED |
| MM4 | appel vers un opérateur **NON demandé** ⇒ BudgetExceededError, 0 transport, `helius.jsonl/.lock` jamais créés | `requested = Object.keys(classes)` ⇒ helius ouvert/verrouillé, call passe ⇒ RED |
| MM5 | après échec multi-verrou, **rien de verrouillé au run suivant** (fresh `{chainstack}` réussit) | rollback neutré ⇒ `chainstack.lock` persiste ⇒ 2ᵉ open LockHeldError ⇒ RED |
| MM6 | transport qui n'aboutit pas (abort) **compté** (ligne `attempted` write-ahead sur disque), erreur scrubée, hook = `["chainstack","AbortError"]` | commit après `await transport` ⇒ ligne absente sur abort ⇒ RED |

**Couverture de la SUITE LIVRÉE vis-à-vis de ces 6** (arbre isolé, sans mes sondes) : MM1, MM3, MM4, MM5, MM6 **attrapés** par les tests livrés ; **MM2 SURVIT** (voir C-G2-4).

## 4. CORRECTIONS FORMÉES (C-G2-n) — reproduites de première main, convergentes checkpoint-2

- **C-G2-1 (BLOQUANT avant que 2b câble le transport) ⟺ C-V-2 — transport fail-open.**
  - `packages/rpc-guard/src/transport.ts:95` : `return (await res.json()).result` ne teste PAS le champ `error`. **Reproduit** (sonde `g2probe_jsonrpc_error_at_200`) : un `{error:{code:-32000,message:"execution reverted"}}` en **HTTP 200** ⇒ `didThrow:false, resolved:undefined`. **Deux fournisseurs en erreur seraient concordants sur `undefined`** (fail-open ; le recorder bâtirait un book sur `undefined`).
  - `transport.ts:94` : `if (!res.ok) throw new Error("HTTP <status>")` = Error **nue sans `.code`**. **Reproduit** (sonde `g2probe_http_429`) : 429 ⇒ `name:Error, .code:undefined` (statut seulement dans une string) ; le corps 429 est perdu (le `getLogsVia` du recorder s'en sert). L'ADR **A-3 affirme la parité du hook avec `record.ts:100-124` — mesuré FAUX**.
  - *Correctif* : couvrir les 4 chemins (réseau / HTTP non-ok / corps non-JSON / **erreur JSON-RPC à 200**) ; lever une erreur **typée portant le code**, scrubée ; le hook porte le statut/code ; **un test par chemin**. *error_origin* : **worker** (défaut latent depuis 1a, mais le scope 2a « transport durci » aurait dû l'attraper) ; contributif **planificateur** (A-3). *NB* : le worktree post-`dd9148f` implémente déjà `class TransportError` (`errors.ts`) — fix en cours.

- **C-G2-2 (BLOQUANT avant fusion) ⟺ C-V-1 — floor par opérateur non épinglé LÀ OÙ IL AGIT.**
  - `packages/rpc-guard/src/guarded.ts:50` : `openOperatorLedger(dir, label, limits.cycleFloor[label] ?? 0)` (fixe le prior anti-reset). **Reproduit** : mutant `cycleFloor[label]` → `cycleFloor["helius"]` **SURVIT la suite 35/35** (0 test rouge). Le mutant worker **A5** vise `client.ts` `assertLimits` (validation), **pas** le floor passé au ledger. Un floor Chainstack appliqué à Helius **sous-compte le prior** (classe C-V-1 de 1a) ; effacer le ledger Chainstack rouvrirait 16 M RU depuis 0.
  - *Correctif* : `two_paid_operators_…` **via `openGuardedClient`** avec floors distincts et discriminants (pas via `makeClient`). *error_origin* : **worker**.

- **C-G2-3 (à FORMER avant le script de course 2b) ⟺ C-V-3 — pas de chemin code pour la course d'étalonnage.**
  - `packages/rpc-guard/src/reconcile.ts:55` : en mode `aggregate` la bande souple (0,5 %) est appliquée **dès la 1ʳᵉ course**. Sur un nœud Global (FAITS pt 9) au tarif conservateur 2 RU partout, une course HONNÊTE sur-compte ⇒ **exit 1 raison `soft`** — seul un lecteur (humain/LLM) de la raison dirait « attendu », ce que C-6 (verdict servi non-LLM) visait à supprimer. La borne DURE (`hard:total`) reste correcte (money-safe).
  - *Correctif* : un mode nommé (ex. `aggregate-calibration`) où la borne dure s'applique, l'écart souple est **consigné** et l'exit vaut **0** ; sinon un équivalent nommable par le prereg. *error_origin* : **partagé planificateur/validateur** (C-1 disait « informative » sans le mécanisme d'exit). *NB* : le worktree post-`dd9148f` ajoute déjà `"aggregate-calibration"` (`reconcile.ts:23`) — fix en cours.

- **C-G2-4 (non bloquant) ⟺ C-V-4 — deux comportements CORRECTS non épinglés par la suite livrée.**
  - `client.ts:113` (runCap par opérateur) : **reproduit** — mutant « runCaps sommés entre opérateurs » (MM2) **SURVIT la suite livrée** (A7 vise `spent()`, pas le mètre). Le code EST correct (MM2 vert sur `dd9148f`).
  - `ledger.ts:100` (`tariffVersionOf(op)`) : **reproduit** — mutant `tariffVersion = "helius-2026-09-21"` (ligne chainstack portant la version Helius) **SURVIT** (la chaîne sha reste cohérente ; aucun test n'assère la version par opérateur).
  - *Correctif* : une assertion pour chacun. *error_origin* : **worker**.

- **C-G2-5 (non bloquant) ⟺ C-V-5 — raisons de refus trompeuses.** Delta négatif (compteur journalier remis à zéro) en agrégat ⇒ `reconcile.ts:55` NO-GO `soft` (raison propre attendue). `--mode` absent sur `--op chainstack` ⇒ `cli.ts:25` défaut `per-method` ⇒ `per_method_mode_needs_by_method` (exiger le flag ou le dériver de l'opérateur). *error_origin* : **worker**.

- **C-G2-6 (éditorial) ⟺ C-V-6 — ADR contradictoire.** `docs/adr/ADR-…md` « Items formés » porte encore `unit credits|requests|keyless` et « Cap RU 16 M non-applicable-cette-course », contredit par A-1/A-2 (unité `ru`, cap évaluable dès la 1ʳᵉ course). *error_origin* : **worker**.

## 5. Avis motivés sur les écarts déclarés (points 4 et 5 de la mission)

- **(4) Verrou de TOUS les opérateurs demandés, y compris keyless (écart D-2).** **AVIS : garder le verrou-tous-demandés, MAIS former l'obligation de teardown 2b + la convention `cycles[label]` keyless.** Motif mesuré : depuis 1a un keyless a un **ledger chaîné** (`drpc.org.jsonl`) ; deux écrivains sans verrou **forkent la chaîne** ⇒ toutes les courses suivantes échouent à l'ouverture (`verifyCycleLedger`/head sidecar). Le verrou protège donc l'**intégrité de chaîne** (pas de l'argent — un keyless coûte 0). Deux courses Ukemi/Bell simultanées sur les mêmes endpoints gratuits **se bloqueraient SSI elles partagent le même `cycles[label]`** ; la signature exige un `cycles[label]` par label ⇒ les courses **peuvent** namespacer (pas un blocage dur). Coût : une course crashée laisse N verrous keyless périmés ⇒ **risque de LIVENESS** (endpoint gratuit bloqué), pas de money. **Ergonomie fail-closed, pas un piège** — à condition que (a) 2b relâche TOUS les demandés en fin de course (runbook), (b) l'ADR déclare la convention de cycle keyless (ex. le cycle de l'opérateur payant), (c) **une ligne de test épingle l'arbitrage** (aujourd'hui le mutant « keyless non verrouillé » survit — aucun test ne le contraint). L'alternative payant-seul (D-2, filtre `unit !== "keyless"` en `guarded.ts:41`) est légitime mais rouvre le fork de chaîne keyless : à REJETER tant que les ledgers keyless existent. **Convergent avec le checkpoint-2 (h).**
- **(5) Retrait de l'unité `"requests"` (écart D-3).** **AVIS : report LICITE, pas une régression de plan.** Aucun opérateur ne l'utilisait (`chainstack` = `ru` par méthode) ; Databento/Polygon étaient déjà des **items formés à leur déclencheur** (ADR 1a D2, G0 addendum). Le retrait est un **item formé avec déclencheur 1b** (ré-ajouter `"requests"` **ou** porter `credits: () => 1`), documenté (D-3). Ce n'est pas un « dû » nu. **Seule réserve** : le grep confirme 0 résidu `"requests"` dans le code (re-vérifié) — OK.

## 6. Table LIVRABLE → TEST → MUTANT (rouge prouvé)

| Livrable | fichier:ligne (`dd9148f`) | test nommé (vert) | mutant rouge (assertion citée) |
|---|---|---|---|
| tarif RU conservateur+fermé, inconnu⇒refus | `tariff.ts:71` (chainstackRu), sets `:45`/`:54`/`:63` | `chainstack_tariff_is_conservative_and_closed` | A1 `eth_getLogs ... => 2 RU` ; A2 `Missing expected exception.` |
| opérateur chainstack (RU, cap 16 M) + cap/unité par opérateur | `transport.ts:69` (classe), `client.ts:107-118` | `two_paid_operators_…`, `paid_operator_requires_cycle_cap` | A5 `chainstack WITH a cap constructs` ; A7 `deep-equal {helius:10,chainstack:4}` ; **MM2 SURVIT (C-G2-4)** |
| cap de cycle par op, prior figé, anti-reset | `client.ts:118`, `ledger.ts:99` | `cycle_cap_stops`, `cycle_cap_floor_probe`, `public_api_freezes_the_prior_p3_floor` | G2M1 `Missing expected rejection.` ; **MM1** `EXACTLY 5 transports` |
| sous-ensemble d'opérateurs | `guarded.ts:27` | `unrequested_operator_is_never_locked` | A6 (ouvre tous les résolus) ; MM4 |
| multi-verrou atomique + rollback ; prior après verrou | `guarded.ts:42-52` | `multi_lock_acquire_is_atomic_with_rollback`, `prior_is_frozen_after_lock` | A3 `k-1 lock (chainstack) was released` ; A4 `open must be gated by the lock` ; MM5 |
| timeout/abort + hook scrubé (jamais l'URL) | `transport.ts:80-95` | `transport_timeout_aborts_and_hook_carries_label_and_error_name_never_url` | MM6 (write-ahead sur abort) ; **fail-open non couvert ⇒ C-G2-1** |
| rapprochement agrégat nommé, borne dure totale, 1-champ-par-mode | `reconcile.ts:38-56` | `reconcile_aggregate_mode_is_declared`, `aggregate_mode_refuses_a_per_method_snapshot` | R11/G2M5 `strictly equal` ; **soft-band étalonnage ⇒ C-G2-3** |
| floor par opérateur là où il agit | `guarded.ts:50` | (A5 vise `client.ts`) | **mutant `[label]→["helius"]` SURVIT ⇒ C-G2-2** |
| labels keyless ETH, ordre épinglé = rpc2.ts | `transport.ts:28-29`, `index.ts` | `keyless_eth_labels_pinned_to_recorder_order` | drift ⇒ rouge (vs `providerOf(rpc2.ETH_CALL/GET_LOGS_PROVIDERS)`) |
| jeu d'exports FERMÉ | `index.ts` | `public_export_set_is_closed` | drift ⇒ rouge |

**Point (6)** — vérifié : le jeu exporté (13 valeurs) est fermé ; `ETH_CALL_KEYLESS_LABELS`/`GET_LOGS_KEYLESS_LABELS` sont des **LABELS** (`providerOf` = domaines nus `drpc.org`…, jamais des URL), ordre **épinglé par test** et **identique** à `rpc2.ts:268-269` (source de `record.ts:329-330` `[...ETH_CALL_PROVIDERS, archiveEnvUrl]`). Aucun symbole exporté ne REND une URL ; seul `openGuardedClient(env,…)` ACCEPTE `env` (surface unique d'ingestion de clé, par conception ADR-D1). *Réserve mineure* : pas d'assertion explicite « aucun export ne matche `/https?:/` » (nice-to-have).

**Points (2) et (3) — vérifiés (lecture + rejeu)** :
- **(2) write-ahead + sidecar `.head` pour le 2ᵉ opérateur** : `chainstack` passe par le MÊME `openOperatorLedger` (`ledger.ts:84-116`) ⇒ `.head` réécrit après chaque append (`:106`) ; observé dans `prior_is_frozen_after_lock` (le test `rmSync` `chainstack.head` puis vérifie `priorAtOpen()==2` après réparation). Le write-ahead (`attempted` avant transport) est prouvé par MM6 + P6.
- **(3) fenêtre « depuis la dernière ligne `reconciled` » par opérateur** : `ledgerRunSinceLastReconciled` (`reconcile.ts:25-36`) scanne le **fichier ledger d'UN opérateur** (les ledgers sont par-opérateur, `<op>.jsonl`) ⇒ la fenêtre est par-opérateur **par construction**. Borne dure agrégat `Δtotal_ru ≤ Σ ledger_run` (`reconcile.ts:54`) sur ce total fenêtré. Snapshot à 2 champs refusé dans les deux modes (`:50-51`, `:61-62`) ; snapshot agrégat donné à Helius (per-method) ⇒ NO-GO `per_method_mode_needs_by_method`.

## 7. FINDING DE PROCESSUS (branchement/coordination) — mesuré, non un défaut de `dd9148f`

Pendant ma revue, le **worktree de revue a été modifié en concurrence** (Régime B) : HEAD a **avancé `dd9148f` → `412eea7`** (le checkpoint-2 committé par l'orchestrateur), puis 5+ fichiers `src/test` sont passés `M` (refactor `TransportError` + mode `aggregate-calibration` = corrections C-V-2/C-V-3 en cours). Conséquence : **mes premières mesures lint/CI lancées DANS le worktree étaient exposées à la contamination** ; je les ai **ré-exécutées sur l'arbre isolé pristine** (§1, toutes cohérentes). **Preuve d'isolation** : 10/10 `src` isolé == blobs `dd9148f`. *Leçon (règle Branchement/Dettes)* : un worktree de revue sous Régime B doit être **gelé** (checkout épinglé ou copie) — sinon deux tracks (correction-fold + G2) s'écrivent dessus. *error_origin (processus)* : **orchestrateur/outillage** (parallélisme sans isolation de worktree). Non bloquant pour le verdict `dd9148f`.

**Suite mesurée (as-of fin de revue)** : HEAD a avancé `dd9148f` → `412eea7` (checkpoint-2 committé) → **`c6a112d`** (« checkpoint-2 fold C-V-1..6 + ruling h »), et le worktree est **redevenu propre**. Le message de `c6a112d` couvre EXACTEMENT mes C-G2-1..6 : « per-operator floor pinned at the ledger open » (C-G2-2), « four typed transport error paths (JSON-RPC error at HTTP 200 no longer resolves undefined) » (C-G2-1), « aggregate-calibration reconcile mode » (C-G2-3), « per-operator run caps and tariff_version » (C-G2-4), « negative_delta » (C-G2-5), « keyless operators locked when requested » (D-2/point 4). **`c6a112d` est HORS de ma revue** (pinnée `dd9148f`) : un pli modifie le code ⇒ il exige sa PROPRE passe G2/checkpoint-2 (R-21, un pli n'est pas auto-certifiant). Mon verdict porte sur `dd9148f` ; il confirme que les corrections foldées y répondent.

## 8. error_origin PROPOSÉ (au G7)
Conception 2a = **plan** (addendum C-1..C-7, sain). Exécution : **worker** (C-G2-1 latent 1a mais scope 2a ; C-G2-2 floor ; C-G2-4/5 couverture/raisons ; C-G2-6 ADR) ; **contributif planificateur** (C-G2-1 A-3 parité hook fausse ; C-G2-3 mécanisme d'exit non spécifié, partagé validateur). Finding processus = **orchestrateur/outillage**.

## 9. Convergence / frontière
Verdict G2 **PASS-AVEC-CORRECTIONS convergent** avec checkpoint-2 ACCEPTE-AVEC-CORRECTIONS. **Frontière (checkpoint-2, reprise)** : si le G7 fusionne 2a en laissant C-G2-1/C-G2-2/C-G2-3 en « à faire » NUS sans **item formé à déclencheur** (C-G2-2 avant fusion ; C-G2-1/C-G2-3 avant 2b), c'est une divergence checklist/G7 ⇒ **ESCALADE-INVESTISSEUR**. Les corrections ci-dessus SONT formées (fichier:ligne + correctif + test/mutant + déclencheur). Le worktree montre déjà C-G2-1/C-G2-3 en cours de pli — l'orchestrateur les vérifiera adversarialement (R-21).

**R-20 : je ne committe pas, je ne déclenche aucun workflow.** Rejeu (tous depuis `F:\tmp\g2-garde2a\`, arbre isolé `tree\` pristine `dd9148f`, `node_modules` jonctionné, `TEMP/TMP=os-tmp\`) :
- `node replay.mjs` (23 mutants worker ; table `mtable.json` extraite de `F:\tmp\garde2a\mutants.mjs`) ⇒ 23/23 RED, restaurés.
- `node g2mm-run.mjs` (6 mutants money vs sondes) et `node shipped-cov.mjs` (6 vs suite LIVRÉE) ⇒ nécessitent `tree\packages\rpc-guard\test\g2mm.test.ts` (**présent**, restauré).
- `node floor-mutant.mjs` (C-G2-2, survit) ; `node tv-mutant.mjs` (C-G2-4 tariff_version, survit).
- Sondes transport C-G2-1 : `tree\packages\rpc-guard\test\g2probe.test.ts` (**présent**) ⇒ `node --test` (PROBE1/PROBE2/PROBE3 en stdout).
Ces deux `*.test.ts` sont mes sondes de relecture (arbre isolé UNIQUEMENT), jamais proposées au dépôt (le périmètre `dd9148f` reste 17 fichiers).
