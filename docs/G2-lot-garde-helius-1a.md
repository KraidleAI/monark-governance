# G2 — RELECTEUR (instance séparée, contexte frais) — lot **GARDE-HELIUS-1a** (`@monark/rpc-guard`)

## Modèle résolu (R-1)
`claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé.
Relecteur G2, 2026-09-21. Worktree `F:\Monark-wt-garde1a`, branche `lot/garde-helius-1a`, base `514ee1a`, HEAD `9201c74`.
**Régime B** : un checkpoint-2 (`claude-fable-5-1`) a tourné en parallèle — non attendu. Il a **persisté son avis** (`bb88e74`) et
l'orchestrateur a **commencé à appliquer les correctifs** (voir §9).
**R-20** : aucun commit, aucun workflow. **Aucune écriture nette dans le dépôt par MOI** : mutants par sauvegarde hors dépôt + restauration
byte-exacte (sha256 vérifié après chaque mutant ; **`git status --porcelain` VIDE et `client.ts`=`c7c2fd0e` à la fin de MA passe** — mon point
de handoff). **Aucun réseau** (transports factices ; URLs de test `https://example.invalid/`). Aucun `npm ci`/`npm install`. Scratch `F:\tmp\g2-garde1a\`.

> **CIBLE DE REVUE = blob `9201c74`** (immuable ; `client.ts`=`c7c2fd0e`, table sha §1). **TOUTES mes mesures/mutants sont contre ce code.**
> État en fin de passe (mouvant, Régime B) : **HEAD=`bb88e74`** = `9201c74` + **docs seulement** (checkpoint-2 + rulings G0 ; `packages/rpc-guard/`
> **byte-identique** à `9201c74`, `git diff 9201c74..bb88e74 -- packages/rpc-guard/` vide). Le **worktree** porte depuis des **modifications
> NON COMMITTÉES d'un AUTRE process** (correctifs C-V en cours : `?? guarded.ts` + 7 `M` — `client.ts`→`4289ce72`, `openGuardedClient`/`scrubUrls`
> apparus). **Ce n'est PAS ma passe** (mes restaurations étaient byte-exactes ; ces éditions sont postérieures à mon handoff) et **je n'ai RIEN
> vérifié contre ce code en cours de correction** — j'ai ré-extrait le blob `9201c74` (`src9201/`, sha = baseline) pour toute vérification tardive.

---

## VERDICT : **FAIL**

Cause bloquante unique : **C-G2-1** — le **plafond de CYCLE** (invariant-argent phare du lot, tâche 3) n'implémente PAS la formule du
plan §3.4-3 dès que `floor > Σ_ledger` ; il **sur-tire d'environ un `floor`** au-delà du cap. Ce cas est celui de **CHAQUE première course
de production** (`floor = 60 938`, ledger vide) et de tout ledger tronqué. Il est **structurellement invisible** à la batterie de tests
livrée (les 18 tests utilisent `floor = 0`, la seule configuration où le défaut n'apparaît pas), donc la certification G1 « three caps
fail-closed / 12 mutants red / HELIUS-1 non-reproductible » est **matériellement fausse pour ce chemin**. Le reste du lot re-exécute vert :
15 mutants distincts (12 du RENDU + G2M1/G2M3/G2M5) sont **RED** par la suite livrée, **mais** un 16ᵉ mutant de mon cru (`G2Mrc`, cap
`--max-credits`) **SURVIT** (C-G2-2). La correction C-G2-1 est localisée, mais un G2 ne peut pas ratifier une vérification aveugle là où
l'argent s'engage. FAIL renvoie le chemin du cap en boucle de correction (fix + test `floor>0` RED-sur-HEAD/GREEN-après + oracle + re-revue).

**C-G2-1 est corroboré indépendamment** par le checkpoint-2 (`C-V-1 ≡ C-G2-1`, deux mesures floor≠0 séparées : eux floor 15/cap 25, moi
floor 100/cap 115 — §9). **Apport PROPRE de cette passe = C-G2-2** : le cap `--max-credits` par appel (`client.ts:115`) est **non testé**
(mutant `G2Mrc` SURVIVANT) — **personne d'autre ne l'a relevé** (le M7 du checkpoint-2 vise `--method-caps`), et aucun ruling ne le couvre.
Le checkpoint-2 a par ailleurs attrapé 5 défauts que ma passe a sous-couverts (C-V-2/3/6/7/8) — dont deux que je vérifie ici contre `9201c74`
(§9). L'issue est **convergente** : ni lui ni moi ne laissons passer `9201c74` en l'état (sa décision = « ACCEPTE-AVEC-CORRECTIONS,
bloquante avant toute fusion » ; refus explicite de « fusionner 1a, corriger en 1b »).

> Note de calibrage (assumée, R-21) : le lot est par ailleurs solide ; l'invariant anti-reset `prior ≥ floor` (T10) **tient** (un ledger
> supprimé ne rouvre jamais à 0). Le défaut C-G2-1 est un sur-tir **borné** (~`floor`), pas un rouvrir illimité. Le FAIL porte sur le fait que
> l'invariant spécifié est faux dans la config de production **et** que le test censé le prouver (`cycle_cap_stops`) est aveugle par
> construction. Si l'orchestrateur préfère la convention « PASS-AVEC-CORRECTIONS », alors **C-G2-1 est bloquant** (G7 ne clôt pas, 1b ne câble
> pas, avant fix+test+re-revue du chemin cap) — l'issue matérielle est identique.

---

## 1. Re-exécution du baseline (jamais lu du G1)

| Contrôle | Commande re-exécutée | Résultat mesuré | RENDU G1 | Verdict |
|---|---|---|---|---|
| Suite complète | `npm run ci` (gate:vocab + `tsc --noEmit` + `node --test`) | **593 tests, 592 pass, 0 fail, 1 skip, exit 0** | 593/592/1skip | ✔ concorde |
| Skip | — | `fetch_only_inside_client` (SKIP-jusqu'à-1b) | idem | ✔ |
| Suite paquet | `node --test packages/rpc-guard/test/*.test.ts` | 18 pass (dont `ledger_format_locked…` **PASS**, calque byte-identique prouvé) | — | ✔ |
| R-25 | `git diff --shortstat 514ee1a..HEAD -- <pathspec verbatim ci.yml:65>` | **952 ins+del** (< 1205) | 952 | ✔ concorde |
| R-25 (contexte) | `git diff --shortstat 514ee1a..HEAD` | 1064 (docs+lock inclus) | 1064 | ✔ |
| sha256 des 7 sources | `sha256sum` | **égalent** les hachages déclarés au RENDU (client/ledger/lock/tariff/reconcile/transport/errors) | — | ✔ arbre = artefacts G1 |
| Lint (g4) | `npm run lint` (`eslint .`) + `npm run lint:ratchet` | **eslint = 0** (sortie vide, exit 0) ; ratchet **69/69** (plafond figé) | eslint 0 | ✔ re-exécuté |
| merge-base | `git merge-base 514ee1a HEAD` | `514ee1a` (two-dot = three-dot) | — | ✔ |

---

## 2. Batterie de mutants RE-JOUÉE — 12 du RENDU (tous RED) + cru G2 (3 RED distincts + 1 SURVIVANT), restaurés byte-exact

Méthode par mutant : `cp` sauvegarde hors dépôt → `perl -0777 -i` mutation → `node --test <fichier de test cible>` → `cp` restauration →
`sha256sum` == baseline. Assertion rouge citée verbatim.

### 2.1 — Les 12 mutants du RENDU (rejoués)
| Mutant | Fichier:cible | Test rougi | Assertion rouge (citée) |
|---|---|---|---|
| transport reçoit l'URL | client.ts (call passe le label) | `transport_never_receives_url` | `transport got a non-label first arg: https://leak/helius` |
| retry emboîté | client.ts (retry interne) | `budget_counts_http_attempts` | `2 caller retries => 3 attempted ledger lines (mutant retry-nested breaks this)` |
| append après fetch | client.ts (commit après transport) | `budget_counts_http_attempts` | `Expected values to be strictly deep-equal` (lenAtCall ≠ [1,2,3]) |
| throw retiré | client.ts (`refuse` n'émet plus) | `run_cap_stops_and_ledger_carries_attempt` | `Missing expected rejection` |
| plafond ignoré | client.ts (`exceeds`→false) | `method_cap_stops` | `Missing expected rejection` |
| reset-on-missing | ledger.ts (prior sans floor) | `delete_ledger_prior_ge_floor` | `prior = max(floor, sum) = floor here` |
| mkdir recursif | ledger.ts (crée le parent) | `ledger_path_is_outside_out_and_repo` | `Missing expected exception` (`does not pre-exist`) |
| entrée requise avec défaut | client.ts (garde désactivée) | `required_inputs_fail_closed` | `Missing expected exception (BudgetExceededError): --max-calls required (> 0)` |
| verrou `"w"` au lieu `"wx"` | lock.ts | `lock_blocks_second_writer` | `Missing expected exception (LockHeldError)` |
| tarif inconnu = 0 | tariff.ts (`return 0`) | `unknown_method_fail_closed` | `Missing expected exception` |
| reconcile symétrique | reconcile.ts (`abs(Δ−run)≤tol`) | `reconcile_asymmetric` | `Expected values to be strictly equal` (GO au lieu de NO-GO) |
| instanceof cassé | client.ts (`refuse` émet un jumeau) | `budget_stop_not_swallowed_by_quorum2` | `a budget stop must propagate through the quorum2 guard, never be swallowed` |

**12/12 RED, sha256 restauré.** Les 12 claims du RENDU sont reproduits.

### 2.2 — mutants de MON cru (points qui engagent de l'argent) — 4 PROPRES (3 RED distincts + 1 SURVIVANT) + 2 coïncidant R6/R9
Honnêteté de dénombrement : **G2M2 ≡ R6** (même ligne `ledger.ts:89`, même test, même assertion — retirer le floor de `priorCredits`) et
**G2M4 ≡ R9** (`wx→w` identique). Je les liste pour la traçabilité des points-argent, mais ils **coïncident** avec des mutants du RENDU.
**Distincts propres = G2M1, G2M3, G2M5** (RED) **+ le SURVIVANT `run_credits` ci-dessous** = 4. La probe C-G2-1 (`floor>0`) est un *test*
discriminant, pas un mutant (comptée à part).

| Mutant (cru G2) | Point-argent visé | Fichier:cible | Test | Résultat |
|---|---|---|---|---|
| `G2M1_cap_drops_cost` | cap inclusif/exclusif (tentative franchissante) | client.ts:75 `exceeds` → `used>cap` | `cycle_cap_stops` | **RED** `Missing expected rejection` |
| `G2M3_refused_line_dropped` | write-ahead (tentative bloquée doit être tracée) | client.ts:108 (`refuse` n'append plus) | `run_cap_stops_and_ledger_carries_attempt` | **RED** `the refused attempt carries its own write-ahead line` |
| `G2M5_hard_bound_flipped` | rapprochement asymétrique (Δdash>ledger ⇒ ROUGE) | reconcile.ts:42 `delta>runM`→`runM>delta` | `reconcile_asymmetric` | **RED** `Expected values to be strictly equal` (Δ=1030>run=1000 devient GO) |
| `G2Mrc_run_credits_off` | **cap `--max-credits` par appel (§3.4-1)** | client.ts:115 `runCredits+cost>maxCredits` → `false` | *(suite paquet entière)* | **SURVIVANT** — 18/18 pass, **0 fail** ⇒ chemin `refuse("run_credits")` **NON testé** (voir C-G2-2) |
| (G2M2 ≡ R6) | `prior=max(floor,Σ)` reset | ledger.ts:89 | `delete_ledger_prior_ge_floor` | RED (= R6) |
| (G2M4 ≡ R9) | verrou concurrent 2 process | lock.ts:20 `wx→w` | `lock_blocks_second_writer` | RED (= R9) |

Tous restaurés byte-exact ; `git status` VIDE en fin de passe (vérifié après CHAQUE mutant).

> Les mutants RED confirment que les invariants **à floor=0** sont épinglés. **Ils ne couvrent PAS** le défaut C-G2-1 (floor>0), ni le cap
> `--max-credits` (survivant `G2Mrc`) — précisément parce qu'aucun test n'exerce `floor>0` ni ne franchit `--max-credits` en course. C'est le
> cœur du FAIL.

---

## 3. C-G2-1 (BLOQUANT) — plafond de cycle faux quand `floor > Σ_ledger` : reproduit sur HEAD

**Fichier:ligne** : `packages/rpc-guard/src/client.ts:121` (+ `src/ledger.ts:89` / `src/client.ts:61-64` pour `priorCredits`).

**Spécifié (plan G0 §3.4-3, §3.1)** : `prior_effectif + run + tentative_pire_cas > CYCLE_CAP`, avec `prior_effectif = max(floor, Σ_avant_course)`.
Le terme « **+ run** » (consommation accumulée de la course en vol) est un addend **distinct**.

**Codé** : `exceeds(sink.priorCredits(), cost, cap)` = `max(floor, Σ_avant + Σ_run) + cost > cap`.
Parce que le write-ahead appende les lignes `attempted` de la course dans le MÊME ledger, `Σ_run` entre dans la somme **maxée contre le
floor**. Tant que `Σ_avant + Σ_run < floor`, le `max` renvoie `floor` (constant) et **la consommation de la course n'entre jamais dans le
check**. Le commentaire `client.ts:118-120` (« the run's write-ahead attempts are already inside priorCredits() ») est vrai de la SOMME,
faux **après le `max`**.

**Preuve reproductible (HEAD non modifié)** — `F:\tmp\g2-garde1a\probe-floor-cap.ts`, `floor=100, cap=115, gTfA=10 cr` :
```
[PROBE] floor=100 cap=115 gTfA=10 -> successes=11, true cumulative=210, stop="cycle_cap cap reached (fail-closed)"
✖ INTENDED 1 success (100+10<=115, next 100+10+10>115). Got 11 => cap overrun by 95
```
Attendu (plan) : **1** gTfA autorisé puis refus (100+10+10 > 115). Mesuré : **11** autorisés, cumul vrai **210** contre cap **115**,
**sur-tir de 95** (≈ le floor). En production (`floor=60 938`, `cap=8 000 000`, ledger vide) : sur-tir jusqu'à **~60 938 crédits** au-delà du
cap sur la première course d'un cycle (et sur toute course après troncature/suppression du ledger).

**Pourquoi les tests ne l'attrapent pas** : `caps.test.ts` → `mkLedger(0,…)` + `cycleFloor: 0` partout ; à `floor=0`,
`max(0, Σ)=Σ` ⇒ le code est correct ⇒ vert. L'interaction floor×cap est **non testée**.

**Direction de correctif (à implémenter par le worker, tranchée par l'orchestrateur)** : figer le prior **avant course** une fois, puis
ajouter `runCredits` (compteur mémoire = Σ_run) et `cost` :
`const priorAtOpen = sink.priorCredits();` (à la construction) puis check `priorAtOpen + runCredits + cost > cap`
— équivalent algébrique de `max(floor, Σ_avant) + Σ_run + cost` (forme advisor `max(cycleFloor+runCredits, sink.priorCredits())` acceptable).
Réconcilier au passage les **deux entrées de floor distinctes** (`limits.cycleFloor` vs `openCycleLedger(…, floor)` — nit 6a) : la course
doit passer la MÊME valeur ; le verrou exclusif (C-G2-4) garantit que `Σ_avant` est stable pendant la course.

**Test exigé** : `cycle_cap_run_adds_on_top_of_floor` — `floor>0` (ex. 100), `cap` (115), gTfA 10 ⇒ **RED sur HEAD** (11 succès),
**GREEN après** (1 succès puis refus `cycle_cap`).

---

## 4. Corrections C-G2-n formées (fichier:ligne, correctif, test/mutant)

| # | Sévérité | Fichier:ligne | Défaut | Correctif | Test/mutant de couverture |
|---|---|---|---|---|---|
| **C-G2-1** | **BLOQUANT (cause du FAIL)** | `client.ts:121` (+`ledger.ts:89`) | cap de cycle sur-tire de ~`floor` quand `floor > Σ` (formule §3.4-3 « +run » perdue dans le `max`) | figer `priorAtOpen` puis `priorAtOpen + runCredits + cost > cap` ; réconcilier les 2 floors | nouveau test `cycle_cap_run_adds_on_top_of_floor` (RED-HEAD/GREEN-après) ; probe `probe-floor-cap.ts` |
| **C-G2-2** | Moyenne (cap non testé) | `client.ts:115` | le cap **`--max-credits` par appel** (`refuse("run_credits")`) est **non testé** : mutant `runCredits+cost>maxCredits`→`false` **SURVIT** (18/18 pass). Plan §3.4-1 : `--max-credits` est un cap de run requis | ajouter `run_credits_cap_stops` : `maxCredits` bas + gTfA 10 ⇒ refus `run_credits`, ligne `refused`, exit≠0 | mutant survivant `G2Mrc_run_credits_off` (§2.2) |
| **C-G2-3** | Moyenne (ruling+fix) | `client.ts:82` | « `--method-caps` requis » satisfait par `{}` : gTfA (méthode de l'incident) **jamais capé par-méthode** dans toute config testée ; le G0 §3.4-2 dit « c'est le plafond qui aurait arrêté `course-bodies.mjs` » | exiger que la table couvre les méthodes 10-cr/archival de l'opérateur payant (ou refuser `{}` pour un payant) — sinon « requis » = simple présence | test `method_caps_nonvacuous_for_paid` (gTfA sans cap ⇒ throw à `makeClient`) |
| **C-G2-4** | Basse (Branchement) | ADR §Items / `cli.ts` | le **verrou d'écriture** (`acquireLock`) est une primitive testée mais **appelée nulle part** dans le chemin d'écriture (`openCycleLedger`/`call`/`cli reconcile` appendent SANS le tenir) ; le côté *acquisition* n'est pas déclaré comme item 1b formé (seuls `unlock`/`bin`/migration le sont) | déclarer explicitement, dans la liste d'items de l'ADR, le câblage `acquireLock` (course tient le verrou par (cycle,op) avant d'ouvrir/écrire le ledger ; `reconcile`/`unlock` idem) comme item 1b à déclencheur | T13/T14 (primitive) OK ; le câblage reste à prouver au test d'intégration 1b |
| **C-G2-5** | Basse (couverture) | `caps.test.ts` | invariant « pas de `fetch` sur un `refuse` » (BudgetExceededError AVANT réseau) **tenu en code** (probe vert) mais **non épinglé** par un test livré | ajouter `assert.equal(spyCalls, N)` sur le call refusé dans `run_cap_stops`/`cycle_cap_stops` | probe `probe-no-fetch-on-refuse.ts` (PASS sur HEAD) |
| **C-G2-6** | Nit (ruling) | `reconcile.ts:43` | bande souple `0.005 * runM` **par-méthode** vs décision 113 « 0,5 % **du run** » (total ?) — la borne DURE (côté argent) est exacte | ruling d'une ligne : figer « par-méthode » (choix actuel) ou « du run total » ; documenter au pré-enregistrement | `reconcile_asymmetric` (borne dure déjà couverte) |

> Nits pour la liste d'items 1b (pas des corrections) : (6b) `runCredits`/`priorCredits()` somment **tous** opérateurs alors que `cycleCap`
> est par-opérateur — sans effet tant qu'Helius est le seul payant, faux dès Chainstack ⇒ à cloisonner par opérateur au lot 2.

---

## 5. Points de mission 3–11 vérifiés (par re-exécution / grep)

- **(3) URL/clé confinée à `transport.ts`** : `grep` → **0** `fetch(`/`https:` hors `transport.ts` dans `packages/*/src` ; tests non-fuite
  `transport_never_receives_url` (T1) + `third_party_script_cannot_obtain_endpoint` (T2) PASS ; le label passé au transport ∈ `operators()`,
  les erreurs impriment `HTTP <status>` (sanitisé, jamais l'URL — `transport.ts:49`). **Conforme.**
- **(4) Test SKIP `fetch_only_inside_client`** : **skip légitime à déclencheur formé** (« until 1b: apps/bell/src migrent dans le client »).
  RE-MESURÉ : `apps/bell/src` = 7 `fetch(` + 6 `env.<clé>` (+1 `undici` en COMMENTAIRE `universe-cli.ts:208`) = 14 hits ; `packages/*/src`
  hors allowlist = **0**. Un test ACTIF compagnon (`rpc_guard_package_src_clean_and_allowlist_load_bearing`) prouve la moitié verte + la
  **non-vacuité de l'allowlist** (vider l'allowlist rougit `transport.ts`). **Pas un trou.** (Le hit `undici`/commentaire est un item formé 1b.)
- **(5) Tarif Helius vs FAITS [lu]** : `tariff.ts` — 10 cr : `getTransactionsForAddress`, `getProgramAccounts`, DAS (`getAsset*`,`searchAssets`,
  `getSignaturesForAsset`,`getTokenAccounts`,`getNftEditions`) ; 1 cr : `getSignaturesForAddress`,`getTransaction`,`getAccountInfo`,… ;
  **méthode absente ⇒ throw (fail-closed, ruling Q2)** — `unknown_method_fail_closed` PASS. Concorde avec
  `FAITS-tarification-helius-2026-09-21.md` [lu] (« RPC calls are 1 credit … getProgramAccounts and archival calls are 10 … DAS calls are 10 »)
  et `rebase-crosscheck.ts:55-56`. **Résidu déclaré (note, pas correction)** : le surcoût « archival » Helius s'applique à *toute* méthode sur
  données archival ; `getTransaction=1` est un **modèle** adossé au FAITS+tableau de bord (gSfA/getTx mesurés à 1 cr) et **backé par la borne
  dure du `reconcile`** (`Δdashboard ≤ ledger_run` ⇒ tout sous-comptage tarifaire ⇒ NO-GO). Le commentaire `tariff.ts:3` « decision 55 »
  est la décision Bell d'origine du tarif (idem `rebase-crosscheck.ts:47`) — **exact, pas une mé-citation.**
- **(6) Format ledger byte-identique au calque** : `ledger_format_locked_to_rebase_crosscheck` **PASS** (non skippé) — reproduit
  `entry_sha256 = sha256(JSON.stringify(core))`, `prev_entry_sha256` en 1ʳᵉ clé, du calque `rebase-crosscheck.ts:136-145` ; `verifyCycleLedger`
  reconstruit l'ordre des clés correctement (destructure `{entry_sha256, prev_entry_sha256, ...rest}` puis re-sérialise `{prev, ...rest}`).
  Test de verrouillage (verrou primitive) T13/T14 PASS. **Conforme** (câblage du verrou = C-G2-4).
- **(7) `package-lock.json` édité main** : **[lu]** `packages/rpc-guard` = `{name, version}` — **miroir EXACT** de `packages/contracts`
  (`{name:"@monark/contracts", version:"0.0.0"}`) ; `node_modules/@monark/rpc-guard` = `{resolved, link:true}` idem les 5 workspaces
  ⇒ **structurellement cohérent**. **Portée G2** : la **consistance `npm ci`** n'a **PAS** été re-exécutée (interdit par la mission ;
  `scripts/export-public.mjs` ne shell pas `npm ci` — grep vide) ; la claim G1 « npm ci PASSE dans la copie d'export » reste **[2nd]**,
  fermée par l'étape **g3 `npm ci`** de `ci.yml:86` sur la PR (hors périmètre G2). Aucune contradiction relevée, mais non ré-établie ici.
- **(8) Rulings demandés — avis motivé (décision à l'orchestrateur)** :
  - **8a. méthode absente de `--method-caps` = non capée par-méthode** : **contraire à l'esprit du G0** (« `--method-caps` … c'est le plafond
    qui aurait arrêté `course-bodies.mjs` »). Le code accepte `{}` ⇒ la protection par-méthode de gTfA (vecteur EXACT d'HELIUS-1) n'est pas
    garantie. **Avis : STRENGTHEN** → exiger une table non-vacante couvrant les méthodes archival/10-cr (voir C-G2-3). Compound avec C-G2-1
    et C-G2-2 : si le cap de cycle est bogué (C-G2-1), le cap `--max-credits` non testé (C-G2-2) ET le cap par-méthode vacant, gTfA `full`
    — le vecteur EXACT d'HELIUS-1 — n'est borné que par `--max-calls` + un cap de cycle faux. **Les trois gardes-argent se dégradent ensemble.**
  - **8b. ADR sous `docs/adr/`** : **CORRECT** — convention mesurée (33 ADR sous `docs/adr/`, 0 à la racine `docs/`). Endosse `docs/adr/`.
  - **8c. `bin` = câblage 1b** : **ACCEPTABLE** — `runCli` est la surface servie testée (T16/T17/T14) ; le wrapper `bin` (process.argv + fs
    réel) est un item 1b légitime (rien n'installe le workspace en `bin` à 1a). Mais l'item 1b **le plus important, sous-déclaré, est le
    câblage du verrou** (C-G2-4), pas le `bin`.
- **(9) R-25** : pathspec **verbatim** de `ci.yml:65` re-exécuté ⇒ **952** ins+del (< 1205). **Conforme.** *(Ruling Q3 — scission)* : le RENDU
  (l.9) justifie « 1a-i+1a-ii en une PR » par « 952 < ~1150 ⇒ pas de scission » — or ce **déclencheur de taille est SUPERSÉDÉ par Q3**
  (« scission d'emblée », G0 §8/§10). Livrer 1a-i+1a-ii ensemble est cohérent avec le **périmètre de mission « lot 1a »** (ruling
  orchestrateur), **pas** avec le seuil de taille. À consigner comme ruling, pas comme trigger R-25 (le checkpoint-2 parallèle peut le soulever).
- **(10) Vocabulaire interdit** (partner, autonomous, guarantee, verified, score, accuracy, confidence) : **ABSENT de `packages/rpc-guard/src`**
  (surfaces exportées) et de `package.json`. `gate:vocab` (dans `npm run ci`) vert. (« guarantee » apparaît dans un COMMENTAIRE du test racine
  « FULL-scope guarantee » — pas une surface exportée ; sans effet.) **Conforme.**
- **(11) Branchement (`upcoming`)** : le paquet est déclaré **UPCOMING** au RENDU, à l'ADR (§Tuyaux), au G0 §8 ; `PRODUCT-BOUNDARY.md` +1
  ligne (`packages/rpc-guard | yes | git mirror`) = distribution git-mirror, **pas** un registre « built ». Aucun consommateur servi avant 1b.
  **Rien ne le déclare `built`. Conforme.**

---

## 6. Table livrable → test → mutant (rouge PROUVÉ, sortie citée)
Voir §2.1 (12 RENDU, tous RED) + §2.2 (cru G2 : **G2M1/G2M3/G2M5 RED** distincts + **G2Mrc SURVIVANT** ; G2M2≡R6, G2M4≡R9). Chaque RED
cite son assertion, sha256 restauré, `git status` vide après CHAQUE mutant. Les 18 tests paquet + 2 racine (1 actif + 1 skip) re-exécutent
vert ; `npm run ci` = 593/592/1skip/exit0 ; lint = 0 + ratchet 69/69. **Trous couverts par le FAIL / corrections** : aucun test n'exerce
`floor>0` (⇒ C-G2-1, probe `probe-floor-cap.ts` RED sur HEAD) ni ne franchit `--max-credits` en course (⇒ C-G2-2, mutant `G2Mrc` survivant).

## 7. `error_origin` proposé (pour le G7)
- **HELIUS-1** (incident d'origine) : **primaire = orchestrateur** (courses `.mjs` hors garde `F:\tmp\bell-b3a-2\*.mjs`) ; contributif =
  worker `-b3a-2`. (Inchangé vs ADR D6 — non ré-ouvert par ce G2.)
- **C-G2-1** (défaut introduit dans CE lot) : **`error_origin` primaire = worker G1 `claude-opus-4-8`** (implémentation du cap conflatant
  `prior_effectif` et `Σ_run` sous le `max` ; commentaire `client.ts:118-120` auto-justifiant l'erreur) — **non rattrapé par le G1** faute de
  test `floor>0`. **Contributif = rédacteur G0** : §3.1 énonce `prior effectif = max(floor, Σ ledger)` **sans** « à l'ouverture de course » ;
  sous write-ahead, cette formulation **invite** exactement la lecture qui conflate `Σ_avant` et `Σ_run` (à préciser dans le plan au fix).
  Contributif de **détection tardive** : la batterie de 12 mutants du G1 n'a pas inclus le chemin `floor>0` (spec-gaming involontaire : les
  mutants rougissent des tests qui n'exercent que `floor=0`). Item pour le journal de provenance au G7.
- **Auto-évaluation de CETTE passe G2 (honnêteté, R-21)** : ma passe a **manqué C-V-2/3/6/7/8** (attrapés par le checkpoint-2, §9). Cause :
  mon contrôle du point-mission (3) a testé « aucune URL **rendue** » (T1/T2) + le `throw HTTP <status>` explicite (`transport.ts:49`), **mais
  pas** (a) le **chemin d'appel** du transport exporté (`resolveOperators().transport` atteint `fetch` sans mètre/ledger — C-V-2), ni (b) l'erreur
  **interne de `fetch`** (`transport.ts:44`, `TypeError` portant l'URL à clé — C-V-3), ni (c) la classification bout-en-bout d'une méthode inconnue
  via `call` (C-V-6). Item pour le journal G7 : élargir la checklist « secret-leak / impossible-par-l'API » au **call-path exporté** et aux
  **erreurs levées par les primitives réseau**, pas seulement aux valeurs de retour.

## 8. Provenance
Relecteur G2 `claude-opus-4-8[1m]`, 2026-09-21, contexte frais. **Cible = blob `9201c74`** (immuable). Vérification par RE-EXÉCUTION
(jamais lecture des chiffres du G1). Aucun réseau, aucun secret lu, aucun commit (R-20). Artefacts de preuve sous `F:\tmp\g2-garde1a\` :
`probe-floor-cap.ts` (C-G2-1 RED), `probe-no-fetch-on-refuse.ts` (C-G2-5), `mut.sh` (17 mutants), `baseline-sha.txt`,
**`src9201/`** (blob `9201c74` ré-extrait, sha=baseline) + **`probe-cv2-cv3-9201.ts`** (C-V-2/C-V-3 vérifiés contre `9201c74`).
*Invalides (ont frappé le code EN COURS de correction du worktree, pas `9201c74`)* : `probe-cv2-cv3.ts`, `dbg.mjs` — remplacés par la version
`…-9201.ts`. Sortie brute pour l'orchestrateur (R-21).

---

## 9. Réconciliation avec le checkpoint-2 (Régime B, indépendance)
Le checkpoint-2 (`claude-fable-5-1`, `docs/CHECKPOINT2-lot-garde-helius-1a.md`, blob `bb88e74`) a jugé le **même HEAD `9201c74`** en
parallèle, sans lire ma G2. **Décision : ACCEPTE-AVEC-CORRECTIONS (C-V-1..9), bloquante avant toute fusion** — **convergente** avec mon FAIL
(ni l'un ni l'autre ne laisse passer `9201c74` ; il refuse explicitement « fusionner 1a, corriger en 1b »). Cross-map :

| Défaut | Ma G2 | Checkpoint-2 | Statut de vérification (moi) |
|---|---|---|---|
| Cap de cycle absorbé par le floor | **C-G2-1 (bloquant)** | **C-V-1 (bloquant)** | **corroboré, trouvé indépendamment** — 2 mesures floor≠0 (moi 100/115→11 succès ; lui 15/25→20 cr). `error_origin=worker` (accord) |
| `--max-credits` par appel non testé | **C-G2-2 (apport propre)** | *(absent — M7 vise `--method-caps`)* | **unique à ma passe** — mutant `G2Mrc` SURVIVANT (§2.2) ; aucun ruling ne le couvre |
| `--method-caps` vacant (`{}`) | **C-G2-3** | **C-V-5 (bloquant)** | corroboré ; ma reco « STRENGTHEN » = le **ruling orchestrateur foldé** dans G0 (`bb88e74` : fail-closed par méthode) |
| Verrou non branché (`acquireLock` sans appelant) | **C-G2-4 (Basse)** | **C-V-4 (bloquant)** | corroboré ; **j'ADOPTE la lecture plus forte du CP2** (composition/CA-11 durci ⇒ bloquant, pas « Basse ») |
| Transport payant exporté NON compté | *(manqué)* | **C-V-2 (bloquant)** | **vérifié indépendamment sur `9201c74`** — `probe-cv2-cv3-9201.ts` : `resolveOperators().transport(...)` atteint `fetch` sans mètre/ledger |
| Clé dans l'erreur `fetch` (pas de `scrubUrls`) | *(manqué)* | **C-V-3 (bloquant)** | **vérifié sur `9201c74`** — erreur citée : `Failed to parse URL from not-a-url-scheme?api-key=FAKEKEY-not-real` |
| Méthode inconnue via `call` = `Error` nu, 0 ligne | *(manqué)* | **C-V-6 (bloquant)** | confirmé par inspection (`client.ts:105`→`tariff.ts:29` `Error` nu avant commit/refuse), non rejoué |
| Fenêtre `reconcile` = tout le cycle | **C-G2-6** (bande souple) *(adjacent)* | **C-V-7** | confirmé par inspection (`reconcile.ts:20-30` somme le cycle entier) ; **ruling orchestrateur foldé** (fenêtre = depuis dernière ligne `reconciled`) |
| Troncature de queue non détectée | *(manqué)* | **C-V-8** | confirmé par inspection (chaîne-préfixe valide, tête non persistée) ; **ruling orchestrateur foldé** (sidecar `head.sha256`) |
| `tariff.ts:3` « decision 55 » | §5(5) : **genuine** (cité idem `rebase-crosscheck.ts:47`) | **C-V-9** : *coquille* (→C-14/112) | **DÉSACCORD surfacé** — les deux : éditorial, non bloquant. Je maintiens « decision 55 = décision de tarif Helius préexistante » (le CP2 ne donne pas de raison) ; l'imprécision est le **pairing** avec le FAITS 2026-09-21, pas le numéro |

**Bilan** : le checkpoint-2 a une **couverture plus large** (surface publique, fuite clé, méthode inconnue, fenêtre, troncature) ; ma passe
a le **cœur-argent + un apport propre** (C-G2-2) et **re-vérifie** les deux défauts les plus graves du CP2 contre le code réellement revu.
**Aucun des deux ne PASS `9201c74`.** L'orchestrateur applique déjà les correctifs (worktree, §handoff) et a foldé des rulings de plan
(C-V-5/7/8) ; le checkpoint-2 **exige un second checkpoint-2 sur le HEAD corrigé** — **ma G2 doit de même être re-jouée** contre le HEAD corrigé
(re-tester C-G2-1 `floor>0`, C-G2-2 `--max-credits`, C-G2-3/4, + C-V-2/C-V-3) avant tout G7.
