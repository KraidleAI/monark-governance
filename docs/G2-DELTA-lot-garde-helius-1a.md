# G2-DELTA — RELECTEUR (reprise régime B) — lot **GARDE-HELIUS-1a** (`@monark/rpc-guard`), HEAD corrigé `b13850c`

## Modèle résolu (R-1)
`claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé.
Relecteur G2-DELTA, 2026-09-21. Worktree `F:\Monark-wt-garde1a`, branche `lot/garde-helius-1a`, base `514ee1a`, **HEAD `b13850c`**
(pli de C-V-1..9 + C-G2-1..6 sur `9201c74`). **R-20** : aucun commit, aucun workflow. **Aucune écriture nette dans le dépôt** : mutants par
sauvegarde hors dépôt + restauration byte-exacte (sha256 vérifié ; `git status --porcelain` VIDE en fin de passe). **Aucun réseau** (transports
factices, `globalThis.fetch` espionné en mémoire, URLs `example.invalid`/`not-a-url-scheme`). Aucun `npm ci`/`npm install`. Scratch `F:\tmp\g2-garde1a\`.

---

## VERDICT : **PASS-AVEC-CORRECTIONS**
**Les 6 défauts de ma G2 (`C-G2-1..6`) ET les 8 du checkpoint-2 (`C-V-1..8`) sont CORRIGÉS et chaque correctif est ÉPINGLÉ par un test
LOAD-BEARING** (re-brisé → son test ROUGIT, 11/11 mutants). Vérifié par RE-EXÉCUTION (jamais lu des chiffres du worker) : 3 sondes
indépendantes + 11 mutants + suite complète. **Deux items résiduels BASSE sévérité, NON bloquants** (`C-G2D-1` 1a-inerte ; `C-G2D-2`
fail-closed) — à déclarer/folder, pas à gater. Aucun n'engage l'argent de façon incorrecte.

---

## 1. Re-exécution du baseline (jamais lu du worker)
| Contrôle | Commande | Résultat mesuré | Verdict |
|---|---|---|---|
| Suite complète | `npm run ci` | **598 pass, 0 fail, 1 skip** (`fetch_only_inside_client`), exit 0 | ✔ (worker : 598/599/1skip) |
| Lint g4 | `npm run lint` + `npm run lint:ratchet` | eslint **0** ; ratchet **69/69** | ✔ |
| R-25 | `git diff --shortstat 514ee1a..HEAD -- <pathspec verbatim ci.yml:65>` | **1096 ins+del** (< 1205, marge 91) | ✔ (voir §5 seam) |
| Byte-identité ledger↔calque | `ledger_format_locked_to_rebase_crosscheck` | **ACTIF (non skip) + PASS** — reproduit `sha256(JSON.stringify(core))`, `prev` en 1ʳᵉ clé | ✔ |
| Branchement `upcoming` | grep `rpc-guard` README / `apps/site` / PRODUCT-BOUNDARY | **0** README, **0** registre servi `apps/site` ; PRODUCT-BOUNDARY = `git mirror` (distribution, PAS « built ») | ✔ rien ne le déclare `built` |
| Allowlist CI (couche ii) | `rpc_guard_package_src_clean_and_allowlist_load_bearing` (dans `npm run ci`, PASS) + grep | allowlist = **exactement `transport.ts`** ; `packages/*/src` hors allowlist = **0** `fetch(`/`env.<clé>` ; transport.ts EST un site fetch/clé (:33,:36,:53) ⇒ non-vacante | ✔ (SKIP full-scope `fetch_only_inside_client` inchangé, déclencheur 1b) |

## 2. Sondes INDÉPENDANTES (mon cru, pas les tests du worker) — `probe-delta.ts`, sortie citée
| Sonde | Mesure sur `b13850c` | Verdict |
|---|---|---|
| **C-G2-1** cap floor | `floor=100 cap=115 gTfA=10 → successes=1 transports=1 true_cumulative=110` (était **11 / 210** sur `9201c74`) | **CORRIGÉ** — formule §3.4-3 `priorFrozen + runCreditsByOp + cost > cap` (client.ts:107), prior figé à l'ouverture `max(floor, Σ_at_open)` (client.ts:73-75, ledger.ts:99,111) |
| **C-V-2** no-fetch-sans-ledger | `linesAtFetch=[1]` (fetch précédé de sa ligne write-ahead) ; export public clos = `{BudgetExceededError, …, openGuardedClient, runCli, runReconcile, verifyCycleLedger}` — **pas** `makeClient/resolveOperators/InMemorySink/openOperatorLedger/acquireLock` | **CORRIGÉ** — chemin public unique `openGuardedClient` (guarded.ts) |
| **C-V-3** scrub clé | `msg="rpc-guard: transport error for operator 'helius' (TypeError)"` ; `input=ABSENT` | **CORRIGÉ** — `fail()` relève une erreur FRAÎCHE label+nom (transport.ts:44-46), try/catch autour de `fetch` |

## 3. Batterie de mutants — chaque FIX re-brisé ROUGIT son test (load-bearing) — `mut-delta.sh`, 11/11 RED, sha256 restauré
| Mutant (fix re-brisé) | Fichier:cible | Test rougi | Assertion rouge citée |
|---|---|---|---|
| M1 cap sans accumulation run | client.ts:107 (retire `runCreditsByOp`) | `cycle_cap_floor_probe` | `Missing expected rejection` |
| **M2 run_credits désactivé** | client.ts:100 → `false` | `run_credits_cap_stops` | `Missing expected rejection` — **SURVIVANT sur `9201c74`, désormais RED** (C-G2-2 clos) |
| M3 méthode non-listée admise | client.ts:103 → `false` | `required_inputs_fail_closed` | `Missing expected rejection` (M7b) |
| M4 verrou non acquis | client.ts:72 → `false` | `lock_blocks_second_writer` | `Missing expected exception (LockHeldError)` |
| M5 fetch avant meter | client.ts:118-121 (transport d'abord) | `run_cap_stops_and_ledger_carries_attempt` | `C-G2-5: 0 fetch on the refused call` |
| M6 borne dure inversée | reconcile.ts:42 `delta>runM`→`runM>delta` | `reconcile_asymmetric` | `Expected values to be strictly equal` |
| M7 erreur transport non scrubbée | transport.ts:46 (relève `e` brut) | `transport_error_never_carries_url_or_key` | `error message leaks the endpoint: Failed to parse URL from not-a-url…` |
| M8 méthode inconnue = Error nu | client.ts:94 (retire try/catch→refuse) | `unknown_method_is_ledgered_not_a_bare_error` | validation `false` (pas `BudgetExceededError`) |
| M9 sidecar de tête ignoré | ledger.ts:94 → `false` | `ledger_persists_and_fail_closes` | `Missing expected exception` (troncature de queue) |
| M10 `makeClient` exporté | index.ts (+export) | `public_export_set_is_closed` | `the public VALUE-export set drifted` |
| M11 floor retiré du prior | ledger.ts:99 `max(floor,…)`→`max(0,…)` | `delete_ledger_prior_ge_floor` | `prior = max(floor, Sigma) = floor here` |

## 4. Matrice de résolution (défaut → statut → preuve)
| Défaut d'origine | Statut | Preuve (re-exécutée) |
|---|---|---|
| **C-G2-1 / C-V-1** cap absorbé par le floor | **CORRIGÉ** | sonde §2 (1 succès) + M1 RED ; test livré `cycle_cap_floor_probe` + `public_api_freezes_the_prior_p3_floor` |
| **C-G2-2** cap `--max-credits` non testé | **CORRIGÉ** | `run_credits_cap_stops` ajouté ; M2 (ex-survivant) RED |
| **C-G2-3 / C-V-5** `--method-caps` vacant | **CORRIGÉ** | `{}` sur payant ⇒ throw (client.ts:68) ; méthode non listée ⇒ `method_cap_unlisted` (client.ts:103) ; M3 RED |
| **C-G2-4 / C-V-4** verrou non branché | **CORRIGÉ** | `makeClient` acquiert le verrou par opérateur payant AVANT tout transport (client.ts:72) ; `cli reconcile` acquiert+relâche (cli.ts:26-30) ; M4 RED |
| **C-G2-5** no-fetch-on-refuse non épinglé | **CORRIGÉ** | asserts `calls===N` (caps.test) ; M5 RED |
| **C-G2-6 / C-V-7** fenêtre + bande souple | **CORRIGÉ** | fenêtre = depuis la dernière ligne `reconciled` (reconcile.ts:16-27) ; bande souple 0,5 % du **run total** (reconcile.ts:45) ; borne dure par-méthode (l.42) ; M6 RED |
| **C-V-2** transport payant exporté non compté | **CORRIGÉ** | sonde §2 (`linesAtFetch=[1]` + export clos) ; M10 RED |
| **C-V-3** fuite de clé dans l'erreur `fetch` | **CORRIGÉ** | sonde §2 (msg scrubbé, `input` absent) ; M7 RED |
| **C-V-6** méthode inconnue = `Error` nu | **CORRIGÉ** | `unknown_method` ledgeré (client.ts:94) ; M8 RED |
| **C-V-8** troncature de queue | **CORRIGÉ** | sidecar `<op>.head` réécrit après append (ledger.ts:105) ; ouverture exige `head==recomputed` (l.88-96) ; M9 RED |
| **C-V-9** éditorial (`decision 55`, ADR unlock, multi-op) | **replié** | tariff.ts:2 ajusté ; `unlock_subcommand_chains_release` via `runCli` ; ledger PAR OPÉRATEUR (`<op>.jsonl`) donne le prior par opérateur |

## 5. Corrections résiduelles (BASSE, NON bloquantes) — à déclarer/folder
- **C-G2D-1 (basse, 1a-inerte)** — `client.ts:72` : `makeClient` acquiert les verrous des opérateurs payants en boucle **sans rollback** : si
  le verrou d'un 2ᵉ opérateur payant échoue (`LockHeldError`), le verrou du 1ᵉʳ **reste tenu** (fuite) et le cycle se bloque jusqu'à `unlock`
  manuel. **Inerte au lot 1a** (`transport.ts:38` `classes["helius"]` = seul payant ; `:42` `solana-foundation` = keyless, sauté par le
  `if (unit !== "keyless")` l.72 ⇒ exactement UN `acquireLock`, pas de scénario d'échec partiel). *Correctif* : try/catch autour de la boucle
  d'acquisition, relâcher les verrous déjà pris avant de re-lever. *Déclencheur* : lot 2 (Chainstack = 2ᵉ opérateur payant). Test : construction
  multi-op où le 2ᵉ verrou est pré-tenu ⇒ 0 verrou résiduel du 1ᵉʳ.
- **C-G2D-2 (basse, fail-closed)** — `ledger.ts:103-105` : `appendFileSync` (ligne) puis `writeFileSync` (tête) ne sont pas atomiques ; un crash
  ENTRE les deux laisse la tête périmée ⇒ à la réouverture `head != recomputed` ⇒ **throw** (indistinguable d'une troncature). C'est **fail-closed
  (sûr, jamais de sous-compte)** mais **brique l'op-cycle** jusqu'à réparation manuelle de la tête. *Correctif* : soit rendre append+tête atomique
  (tête en temp + rename), soit **déclarer le runbook de reprise** (tête = `sha(dernière entrée)` recomputée). Pas de perte d'argent ; item de
  disponibilité à déclarer. *Déclencheur* : première course réelle (opérationnel).

> Ni C-G2D-1 ni C-G2D-2 n'engagent l'argent de façon incorrecte ; ce sont des items formés à déclencheur (règle Dettes), pas des dettes nues.

## 6. R-25 — seam ?
**1096 ins+del < 1205** (pathspec verbatim `ci.yml:65`, base `514ee1a`). **Aucun seam imposé.** Marge = **91** (7,5 %). Les correctifs
C-G2D sont bas/différables ; s'ils étaient appliqués et poussaient > 1205, scinder à ce moment (chemin verrou vs sidecar). Rien à scinder
maintenant.

## 7. `error_origin` (pour le G7)
Aucun **nouveau** défaut introduit par le pli. Les origines d'origine restent au journal G2/checkpoint-2 (C-G2-1/C-V-1 : primaire worker,
contributif rédacteur G0 sur §3.1 « sans à-l'ouverture » — désormais résolu par `priorAtOpen()`). C-G2D-1/C-G2D-2 = **worker G1 (pli)**,
items formés à déclencheur (lot 2 / opérationnel), non rattrapables au lot 1a.

## 8. Réconciliation — second checkpoint-2 (régime B)
Pendant ma passe, HEAD `b13850c`→`b46af17` (**docs seulement** : `docs/CHECKPOINT2` +38 l ; `git diff b13850c..b46af17 -- packages/rpc-guard/`
**vide** ⇒ ma revue tient). Le **second checkpoint-2 a jugé `b13850c` = ACCEPTE** (12 mutants validateur rouges ; P2/P3/P5/P6 + sondes
bi-process rejoués) — **CONVERGENT** avec mon PASS-AVEC-CORRECTIONS (tous deux acceptent le HEAD corrigé). Ses **3 items formés** :
(a) « multi-lock atomicity » = **mon `C-G2D-1`** (corroboration indépendante) ; (b) « prior frozen before lock » — **item bien fondé, je le
confirme** : l'ordre RÉEL du chemin public est **gel → verrou** (`frozenPrior` est calculé dans `openOperatorLedger`, `ledger.ts:99` ;
`openGuardedClient` ouvre TOUS les ledgers `guarded.ts:13` AVANT que `makeClient` acquière le verrou `client.ts:72` ; `priorAtOpen()` l.75 ne
fait que LIRE la valeur déjà figée). Fenêtre : entre `openOperatorLedger` et `acquireLock`, un écrivain concurrent TENANT le verrou pourrait
appendre ⇒ `Σ_at_open` périmé. **Mais** cet écrivain concurrent fait justement échouer `acquireLock` (l.72, `LockHeldError`) ⇒ le prior
périmé n'est **jamais consommé**. Item de robustesse, **non bloquant** ; (c) « unlock→reconcile dans le protocole G0 » = item de PLAN (doc),
hors périmètre code. Aucun des trois n'engage l'argent.

## 9. Provenance
Relecteur G2-DELTA `claude-opus-4-8[1m]`, 2026-09-21, contexte frais, **cible = paquet à `b13850c`** (byte-identique à `b46af17`). Vérification
par RE-EXÉCUTION. Aucun réseau, aucun secret lu, aucun commit (R-20). Artefacts sous `F:\tmp\g2-garde1a\` : `baseline-b13850c.txt`,
`probe-delta.ts` (3 sondes PASS, sortie citée §2), `mut-delta.sh` (11 mutants RED, sha256 restauré). `git status --porcelain` VIDE en fin de
passe ; les 10 sha256 du paquet == `baseline-b13850c.txt`. *Note mesurée (non expliquée)* : `npm run ci` `duration_ms` = **130 684** ici vs
**34 426** à ma 1ʳᵉ passe (`9201c74`) — ~4× ; probablement le coût `mkdtempSync`/`rmSync` par test du ledger PAR OPÉRATEUR (20+ tests créent
des dossiers réels), non mesuré finement. Rapporté, pas un défaut. Sortie brute pour l'orchestrateur (R-21).
