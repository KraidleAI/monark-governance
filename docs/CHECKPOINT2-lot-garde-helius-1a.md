# CHECKPOINT-2 — GARDE-HELIUS-1a — avis du validateur-humain (verbatim, `claude-fable-5-1`, 2026-09-21, HEAD jugé `9201c74`)

# CHECKPOINT-2 — LIVRABLE — lot GARDE-HELIUS-1a (`@monark/rpc-guard`), HEAD `9201c74`

## 1. Artefacts lus (blobs HEAD, jamais le worktree ni le fil du planificateur)

- `git show 9201c74:` — `packages/rpc-guard/{package.json, src/*.ts (9), test/*.test.ts (8)}`, `test/rpc-guard-fetch-only-inside-client.test.ts`, `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md`, `docs/PRODUCT-BOUNDARY.md`, `package-lock.json` (diff), `apps/bell/src/rebase-crosscheck.ts:125-165` (calque).
- `F:\Monark-wt-garde1a\docs\G0-lot-garde-helius.md` (plan plié), `docs\CHECKPOINT1-lot-garde-helius.md` (reconstruction — je ne retrouve pas mon verbatim cp-1 ; **je n'utilise donc pas « Q2/Q7 confirmés par acceptation » comme preuve**, voir AM-1), `F:\tmp\garde1a\RENDU-G1.md`, `F:\PRODUITS\etude-2026-09-21\helius-audit\FAITS-tarification-helius-2026-09-21.md`.
- G2 parallèle : **non lue** (régime B).

**Intégrité** : 20/20 sha256 de blobs HEAD = table du RENDU ; après mes rejeux, 4 fichiers mutés restaurés MATCH blob HEAD ; HEAD inchangé `9201c74`, `status --porcelain` = 0 ligne, jonction retirée, `node_modules` du worktree intact (218 entrées). Rejeux sous `F:\tmp\cp2-garde1a\{src,npmci,probes}` (AM-2 ter, `TEMP/TMP=F:/tmp`, cache `F:/tmp/npm-cache`, aucun réseau, aucune URL à clé).

## 2. Mesures re-exécutées (points a–k)

| Point | Rejeu | Résultat |
|---|---|---|
| Suite paquet | `node --test packages/rpc-guard/test/*.test.ts test/rpc-guard-fetch-only…` sur copie | **19 PASS + 1 SKIP** reproduit |
| CI complète | `npm run ci` sur copie | **593 tests, 592 PASS, 0 FAIL, 1 SKIP, exit 0** (44 s) |
| R-25 | pathspec exact `ci.yml` | **952 ins+del** (< 1 205), identique au RENDU |
| (a) write-ahead réel | P1 : l'espion lit le **disque** (`readFileSync(ledger.path)`) à l'instant du transport | lignes sur disque `[1,2,3]` ⇒ write-ahead réel ; mutant M1 « append après transport » ⇒ T5 ROUGE |
| (b) tronqué/absent | P2 : 30 lignes → 10 (queue coupée) ; altération médiane ; ligne partielle ; fichier absent | médiane ⇒ THROW ; partielle ⇒ THROW ; absent ⇒ prior = floor (jamais 0, M2 ⇒ T10 ROUGE) ; **queue coupée ⇒ AUCUN throw, prior 300 → 100** (préfixe de chaîne valide, tête persistée nulle part) |
| (c) caps avant transport | P3 | run_calls / run_credits / method_cap : `BudgetExceededError` **avant** le transport, inclusifs, ligne `refused` écrite ; M3 « throw retiré » ⇒ T6/T7/T8 ROUGES ; M6 « cycle-cap retiré » ⇒ T8 ROUGE. **MAIS floor 15 / cap 25 : deux gTfA (20 cr) passent, transport appelé 2× (35 > 25)** — voir C-V-1 |
| (d) verrou `wx` | P4 : deux **processus OS** distincts sur le même `<cycle>/helius.lock` ; `runCli(["unlock",…])` | proc2 `LockHeldError` exit 3 ; `unlock` servi exit 0, fichier retiré, ligne `unlocked` chaînée vérifiée, re-verrouillage possible ; `--reason` requis ; M4 `"w"` ⇒ T13 ROUGE. **`acquireLock` n'a aucun appelant dans `src/`** (grep vide) — voir C-V-4 |
| (e) rapprochement | P5 | Δ = run ⇒ GO ; Δ = run+1 ⇒ **NO-GO hard** ; run−Δ = 50 ⇒ GO, 51 ⇒ NO-GO soft ; 0,5 % (500/100 000) GO, 501 NO-GO ; piège symétrique 1030/1000 ⇒ NO-GO hard ; M5 symétrique ⇒ T16 ROUGE. **2ᵉ course du même cycle : course honnête ⇒ faux NO-GO soft ; contournement 500 cr ⇒ attrapé seulement par la bande, pas par la borne dure** (ledger sommé sur tout le cycle) — voir C-V-7 |
| (f) URL/clé | P6, env `BELL_SOLANA_RPC=not-a-url-scheme`, clé factice | labels/classes sérialisés : 0 fuite. **`resolveOperators(env).transport("helius", "getTransactionsForAddress", [])` depuis l'API publique atteint `fetch` avec 0 ligne ledger** ; la `TypeError` levée porte `Failed to parse URL from not-a-url-scheme?api-key=FAKEKEY…` (message **et** `e.input`) — voir C-V-2/C-V-3 |
| (g) format | `ledger_format_locked_to_rebase_crosscheck` PASS sur copie ; `chainCycleEntry` `prev` en 1ʳᵉ clé ; `verifyCycleLedger` reconstruit `{prev, ...rest}` dans l'ordre JSON | conforme, primitive byte-identique prouvée par recomputation du sha de référence |
| (h) SKIP full-scope | en-tête du test : 14 hits mesurés sur `514ee1a`, déclencheur 1b, allowlist jamais élargie ; moitié `packages/*/src` active + non-vacuité | item formé avec déclencheur : conforme |
| (i) `package-lock.json` | `npm ci --offline --ignore-scripts --cache F:/tmp/npm-cache` sur extraction séparée sans jonction | **exit 0, 283 paquets, lien `node_modules/@monark/rpc-guard → packages/rpc-guard` créé** |
| (j) CA-11 | ADR : « UPCOMING » ; `PRODUCT-BOUNDARY.md:67` = whitelist d'export (pas un registre « built ») ; registre servi `apps/site/lib/fleet.ts` = agents seulement ; README : 0 mention | aucun registre public ne déclare le paquet built : conforme |
| Mutant supplémentaire M7 | garde « `--method-caps` requis » rendue inopérante | **aucun test ne rougit** (T12 n'a aucune assertion sur `methodCaps` ; `{}` construit ; 20 gTfA non listés passent avec `{getTransaction:1}`) — voir C-V-5 |

Précision : le cas P5 « méthode vue au dashboard mais absente du ledger » a été exercé sous la clé `getTransactionsForAddress` (Δ=1, ledger vide ⇒ NO-GO hard), pas `getSlot`. Je n'ai pas rejoué les 12 mutants du worker ; j'en ai appliqué 7 des miens (6 rouges, 1 survivant).

## 3. Checklist

- **CA-1** n-a (plan) — mais deux critères du G0 que j'avais acceptés au cp-1 sont ambigus (fenêtre `ledger_run`, « chaîne cassée » sans la troncature) : consigné en AM-1.
- **CA-2** conforme : décisions 112/113/114/115 appliquées telles quelles (8 M, `max(50, 0,5 %)`, dir dédié, `cycleCap` requis) ; aucune décision de valeur nouvelle.
- **CA-3** conforme : ADR `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` (convention 33/33) ; gates tenus.
- **CA-4** conforme : G1 mono-worker + G2 instance séparée en parallèle (indépendance).
- **CA-5** conforme : MAST §ADR.
- **CA-6** conditionnel : oracle rejoué par moi ; **G2 non lue** — l'acceptation est subordonnée à un G2 PASS. Si G2 passe sans attraper C-V-1/C-V-2, c'est un constat sur son indépendance à consigner, pas un motif d'adoucir.
- **CA-7** correction : sur-affirmation « le mécanisme supporte Chainstack RU » (`priorCredits()` somme toutes les ops sans distinction d'unité) ⇒ item formé à reformuler (C-V-9).
- **CA-8** conforme : modèle `claude-opus-4-8[1m]` (ADR, RENDU, commit) ; générateur ≠ relecteur ; `error_origin` HELIUS-1 assigné (D6) ; sha RENDU = blobs.
- **CA-9** conforme : rejeu imposé par le système (copie fraîche, chemins ci-dessus).
- **CA-10** conforme : R-25 952 recomputé, aucun argument de vitesse.
- **CA-11 durci** : paquet déclaré upcoming (OK) ; **le tuyau verrou n'est pas composé** (primitive prouvée, composition non) ⇒ C-V-4. Tuyau `unlock` : l'ADR écrit « T14 via runCli » mais `lock.test.ts` appelle `runUnlock` directement — mon P4 est la seule preuve `runCli unlock` ⇒ C-V-9.
- **Anti-close bis** : aucun prix/close/constante on-chain ; `60938` dans `ledger.test.ts` est un compte de crédits dashboard ([2nd] `CHANTIERS.md:424`), hors clause.

## 4. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée, bloquante avant toute fusion de `9201c74`)

Deux décisions de l'ADR sont **mesurées fausses** sur ce HEAD : D3 (cap de cycle) et D1 (« impossible par l'API »). Le lot 1a est accepté **comme sous-lot upcoming à corriger** (G0 §8 : « aucun sous-lot ne clôt seul »), pas clos. Si l'intention est « fusionner 1a maintenant, corriger en 1b » : **REFUS de ce HEAD**. Si G7 accepte `9201c74` en l'état malgré C-V-1/C-V-2, c'est la divergence checklist/G7 de ma frontière ⇒ ESCALADE-INVESTISSEUR. Un **second checkpoint-2 sur le HEAD corrigé** est requis (rejeu P3-floor, P6, sonde bi-processus par `makeClient`+`call`).

- **C-V-1 (bloquant) — formule du cap de cycle** (`client.ts:118-121`). `max(floor, Σ_incl_run) + coût` absorbe les crédits du run tant que Σ ≤ floor. Mesuré floor 15 / cap 25 : 20 cr passent (35 > 25). **Borne du sous-compte = le floor** : un dossier `<cycle>/` neuf (décision 114) avec un floor lu tard dans le cycle laisse un run consommer ≈ floor avant de trébucher — floor proche du cap ⇒ cap effectivement doublé. C'est le scénario où la garde compte le plus. Exigé : `prior_cycle` **figé à l'ouverture** = `max(floor, Σ_at_open)`, test `prior_cycle + runCredits + coût > cap` (formule G0 §3.4-3) ; T8 avec floor > 0. `error_origin` : **worker** (formule G0 explicite ; le commentaire du code argumente l'inverse).
- **C-V-2 (bloquant) — surface publique** (`index.ts:11-14, 5`). `resolveOperators`/`resolveConfig` exportent un `transport` qui exécute l'appel payant sans `meter`/`commit` ; `InMemorySink` exporté permet `makeClient` + transport réel sans ledger durable. Le critère littéral du G0 (« ne rend une URL ») est tenu ; la couche (i) ne l'est pas. Exigé : ces symboles cessent d'être exportés (tests par import relatif) ; l'unique chemin public vers un appel payant passe par mètre + commit + `CycleLedger` (ex. `openGuardedClient(env, limits, ledgerDir, cycleId)`) ; T2 exerce une fonction (sonde P6), pas un scan de chaînes. `error_origin` : **partagé worker / planificateur / validateur** (cp-1 a accepté la formulation).
- **C-V-3 (bloquant) — fuite de clé** (`transport.ts:44`). La `TypeError` de `fetch` porte l'URL à clé (message + `e.input`) ; le calque `scrubUrls` cité n'est pas appliqué. Exigé : try/catch, relance `label + nom d'erreur` seulement, test hors ligne avec URL non analysable. `error_origin` : **worker**.
- **C-V-4 (bloquant) — verrou non branché** (`lock.ts`, aucun appelant `src/`). G0 §3.3 : « un second **run** … échoue à ouvrir » — pas un appelant qui pense à verrouiller. Exigé : `makeClient` sur `CycleLedger` acquiert le verrou par opérateur payant avant tout transport ; T13 devient un test de composition bi-processus (`makeClient`+`call`, second refusé, 0 transport). `error_origin` : **worker** (CA-11 durci).
- **C-V-5 (bloquant, porte le ruling k-1) — `--method-caps`**. `{}` construit ; M7 survit ; méthode non listée non capée. **Mon avis** : fail-closed par méthode — méthode absente de la table ⇒ `refused reason=method_cap_unlisted` (cohérent avec Q2, tables fermées) ; table vide sur opérateur payant ⇒ throw à la construction ; T12 assert. Cela change le contrat 1b (toute méthode utilisée doit être listée) — **décision orchestrateur**. `error_origin` : garde vacante = **worker** (C-10 « SANS défaut ») ; sémantique des non-listées = **planificateur**.
- **C-V-6 (bloquant) — méthode inconnue via `call`** : `Error` nu, 0 ligne ledger, contre G0 §3.2 « refus + résidu `unknown_method` ». Un `Error` nu est ce que `withRetry`/quorum2 traitent comme faute transport. Exigé : `refuse(op, method, "unknown_method")` (`BudgetExceededError` + ligne). `error_origin` : **worker**.
- **C-V-7 — fenêtre du rapprochement** (`reconcile.ts:20-30`) : `ledger_run` = tout le cycle ⇒ faux NO-GO à la 2ᵉ course, borne dure diluée. Exigé : fenêtre = entrées `attempted` depuis la dernière ligne `reconciled` (frontière chaînée déjà présente) ; ADR D4 + T16 scénario 2 courses. `error_origin` : **planificateur / validateur** (G0 §4 « lignes attempted du cycle », accepté au cp-1).
- **C-V-8 — troncature de queue non détectée** (`ledger.ts:43-51, 76`). Sens fail-closed aujourd'hui (floor), mais sur la question (b) explicite. Exigé : tête persistée hors du fichier (sidecar `head.sha256` réécrit à chaque append, ou tête dans le fichier de verrou) et égalité exigée à l'ouverture (ledger présent + tête absente ⇒ throw). `error_origin` : **planificateur / validateur**.
- **C-V-9 (éditorial, non bloquant)** : `tariff.ts:3` « decision 55 » (coquille, C-14/112) ; ADR « T14 via runCli » inexact (ajouter l'assertion `runCli unlock`) ; ADR/RENDU « supporte Chainstack RU » ⇒ item formé : *prior par opérateur requis avant tout second opérateur payant* (`priorCredits()` mélange les unités). `error_origin` : **worker**.

**Rulings (k)** : (1) → C-V-5 ci-dessus ; (2) ADR sous `docs/adr/` : **accepté** (convention mesurée 33/33) ; (3) `bin` en 1b : **accepté** comme item formé à déclencheur (`runCli` est la surface testée ; le code de sortie n'a de consommateur qu'à 1b, cohérent avec upcoming).

**Items formés reconnus (zéro dette nue)** : `retry_sous_le_tick` 1b-scoped ; multi-opérateur au déclencheur (à reformuler, C-V-9) ; `undici` en commentaire `universe-cli.ts:208` ; `bin` ; verbatim cp-1 (0 o).

## 5. AM-1

Attrapé par la checklist (mesuré, non lu) : formule de cap absorbée par le floor ; transport payant non compté exporté ; clé dans l'erreur `fetch` ; verrou opt-in ; `--method-caps` vacant ; méthode inconnue non ledgerée ; fenêtre `reconcile` ; troncature de queue. **Manqué par mon cp-1** (ma part d'`error_origin`) : j'ai accepté « ne rend une URL » comme critère de la couche (i), « lignes attempted du cycle » comme définition de `ledger_run`, et « chaîne cassée » sans la troncature — trois formulations dont l'ambiguïté a laissé passer C-V-2/7/8.

**Modèle résolu (R-1)** : `claude-fable-5-1` (effort high). Aucune écriture dans le dépôt ; sondes conservées sous `F:\tmp\cp2-garde1a\probes\p1..p6*.mts`, logs `F:\tmp\cp2-garde1a\npm-run-ci.log`, `npm-ci.log`.


---

# SECOND CHECKPOINT-2 sur le HEAD corrigé `b13850c` (verbatim) — ACCEPTE, conditionnel à la G2-delta

# CHECKPOINT-2 (second) — LIVRABLE — GARDE-HELIUS-1a, HEAD corrigé `b13850c`

**Artefacts lus (blobs `git show b13850c:`)** : `packages/rpc-guard/{src/*.ts (11), test/*.ts (9)}`, `test/rpc-guard-fetch-only-inside-client.test.ts`, ADR, fin de `docs/G0-lot-garde-helius.md`, `docs/G2-lot-garde-helius-1a.md` (round-1, persisté — pas la G2-delta parallèle, non lue). Intégrité : 21 sha de blobs listés ; 5 fichiers mutés restaurés MATCH ; HEAD `b13850c` inchangé, `status --porcelain` 0, jonction retirée, `node_modules` worktree 218 entrées. Rejeux `F:\tmp\cp2-garde1a-2\{src,npmci,probes}` (AM-2 ter, `TEMP/TMP=F:/tmp`, aucun réseau, URL non analysable + clé factice).

## Mesures re-exécutées
| Demande | Rejeu | Résultat |
|---|---|---|
| CI | `npm run ci` sur copie | **599 tests, 598 PASS, 0 FAIL, 1 SKIP (1b)**, exit 0 ; `npm run lint` exit 0 ; `lint:ratchet` 69/69 exit 0 |
| `npm ci` | `--offline --ignore-scripts --cache F:/tmp/npm-cache`, extraction séparée | exit 0, 283 paquets, lien `node_modules/@monark/rpc-guard` présent |
| R-25 | pathspec exact `ci.yml` | **1 096** (< 1 205), = RENDU |
| P3-floor `makeClient` | Q3 : floor 15/cap 25 ; floor 7 999 990/cap 8 M | **1 transport** chacun, `refused cycle_cap`, `BudgetExceededError` |
| P3-floor `openGuardedClient` | Q3 : floor 7 999 990 / cap 8 M (le cap public est la constante 8 M `transport.ts:16` — 15/25 n'est pas reproductible par ce chemin, dit tel quel) | **1 ligne `attempted`** puis `cycle_cap` ; floor 15 : 3 lignes (cap loin), cohérent |
| P6 | Q6 : exports valeur = `BudgetExceededError, CHAINSTACK_CYCLE_CAP_RU, HELIUS_CYCLE_CAP_CREDITS, HELIUS_TARIFF_VERSION, heliusCredits, openGuardedClient, runCli, runReconcile, verifyCycleLedger` | seule fonction menant au transport = `openGuardedClient` ; cycle dir = `helius.head, helius.jsonl, helius.lock` (ligne écrite avant `fetch`) ; erreur `fetch` = `transport error for operator 'helius' (TypeError)`, **0 URL, 0 clé** (message et `.input`) |
| Bi-processus | Q4 : deux `node` via `openGuardedClient` | proc2 **`LockHeldError`, 0 transport**, exit 3 ; `cli reconcile` sous verrou tenu ⇒ **`LockHeldError`** ; après `unlock` ⇒ GO, verrou relâché |
| P2 troncature | Q2 : 30→10 lignes ; `.head` absent ; ledger absent/`.head` présent | **THROW** dans les 3 cas (sidecar) ; intact prior 300 |
| P5 deux courses | Q5 : fenêtre depuis `reconciled` | 2ᵉ honnête ⇒ **GO** ; 500 cr hors ledger ⇒ **NO-GO hard** ; méthode absente du ledger (+1 `getSlot`) ⇒ NO-GO hard ; bande 0,5 % du total : 501 ⇒ NO-GO soft, 500 ⇒ GO |
| `unknown_method` / non listée / `{}` | Q7 | `BudgetExceededError`, 0 transport, ligne `refused unknown_method` ; non listée ⇒ `method_cap_unlisted` ; `{}` ⇒ throw à la construction |
| Mutants (miens) | M1 append-après, M2 floor, M3 throw retiré, M4 `"w"`, M5 symétrique, M6 cap cycle, M7 `{}`, M7b non-listée, M8 prior non figé, M9 sidecar, M10 verrou non acquis, M11 `Error` nu, M12 erreur non scrubée | **12/12 ROUGES** sur leur test nommé (M7b tué par `ledger.test.ts::required_inputs_fail_closed`, pas `caps.test.ts`) ; restauration MATCH |

## Checklist (delta vs round 1)
CA-2 conforme (rulings C-V-5/7/8 pliés en G0, décision 113 « 0,5 % du run » appliquée au total — C-G2-6) ; CA-3 ADR amendée D1–D4 ; CA-6 conditionnel à G2-delta PASS (non lue) ; CA-7 zéro dette nue (items formés ci-dessous) ; CA-8 conforme (`claude-opus-4-8`, error_origin par correction) ; CA-9/10 conformes ; CA-11 : paquet **upcoming** maintenu (ADR l.12/77/85 ; `PRODUCT-BOUNDARY.md:67` = whitelist d'export, pas un registre built), T14 passe désormais par `runCli` (`lock.test.ts:36`), verrou composé dans `makeClient` (M10 rouge) ; anti-close bis : aucun prix/close/constante on-chain. Éditorial round 1 réglé (`tariff.ts:3` → « décisions 112/C-14 » ; sur-affirmation Chainstack retirée, ADR l.97-100).

## Décision : **ACCEPTE** (sous-lot 1a, paquet upcoming — G0 §8 : « aucun sous-lot ne clôt seul »), conditionnel à G2-delta PASS
Aucun point bloquant. Si G7 diverge de cette acceptation, escalade de frontière comme au round 1. **Items formés à déclencheur** (non bloquants, à consigner par l'orchestrateur, `error_origin` worker) :
1. **Ordre figé du prior AVANT le verrou** (`guarded.ts:13` → `client.ts:72-75`) : Σ lue puis verrou acquis ; fenêtre microseconde où un writer encore verrouillé peut appender (fork détecté au prochain open, après dépense). Fix : figer le prior après l'acquisition (ou ouvrir le ledger sous verrou). Déclencheur : 1b.
2. **Séquence opérationnelle `unlock` → `reconcile`** : mesurée (Q4), documentée ADR l.128, **absente du protocole pré-enregistré G0 §4** (l.252) ; à ajouter en une ligne avant la 1ʳᵉ course.
3. **Atomicité multi-verrou** (`client.ts:72`, boucle) : un 2ᵉ acquire qui échoue laisse le 1ᵉʳ tenu — inerte à 1a (un seul payant) ; à plier dans l'item existant « prior par opérateur avant tout second opérateur payant ».

## AM-1
Attrapé (mesuré) : toutes les corrections C-V-1..9 vérifiées fonctionnellement, 12 mutants rouges. **Manqué par mon round 1**, établi sur la G2 round-1 persistée : C-G2-2 (`--max-credits` : mutant survivant que je n'ai pas cherché), C-G2-4 (append `reconcile` hors verrou), C-G2-5 (no-fetch-on-refuse non épinglé par test), C-G2-6 (j'avais accepté la bande par méthode comme « plus stricte » alors que la décision 113 dit « 0,5 % du run »). Round 2 : items 1–3 ci-dessus sont des trous que ma checklist n'avait pas nommés au round 1.

**Modèle résolu (R-1)** : `claude-fable-5-1` (effort high). Aucune écriture dans le dépôt. Sondes : `F:\tmp\cp2-garde1a-2\probes\q2..q7*.mts` ; logs `ci.log`, `lint.log`, `ratchet.log`, `npm-ci.log` sous `F:\tmp\cp2-garde1a-2\`.
