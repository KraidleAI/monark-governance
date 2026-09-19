# PLI U-1a-hard-3 — corrections V-1 (code, bloquante) + V-3 + V-E

Worker Opus 4.8, worktree `F:\Monark-wt-u1ahard2` (branche `lot/u-1a-hard-2`, HEAD gel candidat `1d286f0`).
Réponse aux corrections du CHECKPOINT-2 `docs/CHECKPOINT2-lot-u1a-hard-2.md` (ACCEPTE-AVEC-CORRECTIONS).
Le worker ne committe pas (R-20) ; fichiers laissés modifiés dans le worktree ; scratch sous `F:\tmp\u1a-hard-3\`.

## Modèle résolu (R-1)
**`claude-opus-4-8[1m]`**, effort `max` (préfixe `claude-opus-4-8` conforme ; Opus 5 banni, non utilisé).

## Diff résumé (liste fermée, 3 fichiers, hors docs)
`git diff --numstat` :
- `apps/sentinel/test/ukemi-record.test.ts` : +33 / −6 — V-1 (forme (ii) + ceinture) sur `ukemi_record_backoff_cap_is_wired_at_call_site` ; nouveau test V-E `ukemi_record_backoff_cap_is_wired_at_network_fault_call_site`.
- `apps/sentinel/test/ukemi.test.ts` : +3 / −2 — commentaire l.160-161 rendu vrai (« the only fetch-loop test in the pair » supprimé ; sur-affirmation « both backoff-cap tests » corrigée : R2 ne débride que le chemin HTTP).
- `test/ci-gates.test.ts` : +33 / −0 — nouveau test racine V-3 `ci_jobs_have_timeout_and_test_flags_locked`.

Total **+69 / −8 = 77 lignes changées** (≤ 120 ; `git diff --shortstat -- apps/sentinel/test test/ci-gates.test.ts` = `3 files changed, 69 insertions(+), 8 deletions(-)`).

**SHA-256 des 3 fichiers livrés** (le checkpoint-2 bis peut prouver qu'il relit les mêmes octets) :
- `apps/sentinel/test/ukemi-record.test.ts` : `c7aa716fb2d5eb35fd065f67cd896eecf686597dafe9378c13cdeb0e80c51228`
- `apps/sentinel/test/ukemi.test.ts` : `c1994683c95c9a1885a4edf0194a4f756416792cfb847405506d2c0ae64d7768`
- `test/ci-gates.test.ts` : `dc19bcca1e21d9948363e0bd6c9289760ee3ecb7ce374bb0e0fe6e19ee1cca77`

`git status --porcelain` = `M`×3 (les 3 fichiers ci-dessus) + `?? docs/PLI-U-1a-hard-3.md`. Aucune source touchée
(`record.ts`/`rpc2.ts`/`book.ts` byte-identiques, preuves plus bas).

### V-1 (forme (ii) préférée + ceinture)
`ukemi_record_backoff_cap_is_wired_at_call_site` servait un 503 permanent (`serve503`) **sans cap par-test** : sous le
mutant R2 (retry non borné, chemin HTTP) la boucle pendait le loop d'événements jusqu'au `--test-timeout` global (120 s)
— cause de la sortie à 120,4 s au gel candidat. Correctif **forme (ii)** : le stub sert 503 aux tentatives `0..RETRIES`
(RETRIES=3, toutes les tentatives qu'une boucle bornée effectue) puis un **200 au 5ᵉ appel**. Sous code correct la
boucle bornée lève sur le 4ᵉ 503 et n'atteint jamais le 200 (mesure inchangée : 4 tentatives = 3 attentes) ; sous R2 la
boucle non bornée poursuit, **RÉSOUT `0x2a`, et `assert.rejects` échoue en millisecondes**. Ajouté AUSSI
`{ timeout: 10_000 }` en ceinture. Commentaire `ukemi.test.ts:160-161` corrigé et **strictement vrai** : sous R2,
`retry_is_bounded` et le test backoff-cap **5xx** (tous deux sur le chemin HTTP que R2 débride) résolvent et rougissent
en ms ; le test réseau V-E reste **vert** sous R2 (R2 ne touche pas le chemin transport — voir mesure).

### V-E (nouveau test, call-site réseau `record.ts:67`)
`ukemi_record_backoff_cap_is_wired_at_network_fault_call_site` : `fetch` lève (faute transport) aux tentatives
`0..RETRIES` puis 200 au 5ᵉ appel ; discriminant temporel symétrique au test 5xx (backoffMs:100, retries:3 → 3 attentes
100+200+400=700 ms non capées, ~1 ms chacune à `backoffCapMs:1`). Asserts `capped < 200` et `uncapped >= 600`.
Ferme le survivant V-E du checkpoint (cap ignoré au seul call-site réseau, `record.ts:67`). La ceinture stub-succès
sert §F pour un futur mutant transport non borné ; sous R2 (HTTP-only) ce test reste vert par construction.

### V-3 (nouveau test racine, invariants CI verrouillés)
`ci_jobs_have_timeout_and_test_flags_locked` : (a) énumère les **vrais jobs** (clés à 2 espaces sous `jobs:`, pas de
regex global) et exige pour chacun un `timeout-minutes` **de niveau job** (ancre 4 espaces `/^    timeout-minutes\s*:\s*\d+\s*$/`,
un `timeout-minutes` de step à 8 espaces ne peut pas se faire passer pour la borne du job) avec valeur ≤ 20 ; (b)
`package.json scripts.test` porte `--test-timeout=` **et** `--test-force-exit`.

## Mesure R2 (indépendante, copie isolée, temps mur exact)
`git archive HEAD` → `F:\tmp\u1a-hard-3\tree\` (record.ts pristine sha `71c542e7…` == PIN) ; tests V-1/V-E/comment
overlayés depuis le worktree, **sha byte-identiques worktree⇔tree confirmés** (les 3 sha ci-dessus) ; mutation R2 sur la
copie seule ; flags **lus de `package.json`** = `["--test-timeout=120000","--test-force-exit"]`. Script
`F:\tmp\u1a-hard-3\r2-measure.mjs` (garde spawnSync 60 s, SIGKILL) ; TAP bruts sous
`F:\tmp\u1a-hard-3\{green-pair,r2-run1,r2-run2}.raw`.
Mutant R2 (driver validateur ligne 18, chemin HTTP 429/5xx `record.ts:74`) :
`"if ((res.status === 429 || res.status >= 500) && attempt < maxRetries)"` → `"if ((res.status === 429 || res.status >= 500))"`.

- **GREEN pair** (tests corrigés + record.ts pristine) : exit 0, **34/34**, 1 765 ms. Durées : backoff_cap_5xx 727,9 ms,
  backoff_cap_netfault 739,8 ms, retry_is_bounded 3,1 ms, classifies_rpc_errors 430,7 ms.
- **R2 run 1** : exit 1 (**ROUGE**), 34 tests, 31 pass, 2 fail, 1 cancelled, **temps mur 10 320 ms → < 15 s : OUI**.
  not-ok = {retry_is_bounded, backoff_cap_is_wired_at_call_site, classifies_rpc_errors}.
- **R2 run 2** (reproduction) : exit 1 (**ROUGE**), 31 pass / 2 fail / 1 cancelled, **temps mur 10 299 ms → < 15 s : OUI**.

**Attribution du temps mur** (durées par-test sous R2) : `backoff_cap_is_wired_at_call_site` (le fautif V-1) rougit
désormais en **7,9 ms / 7,0 ms** (contre 120,4 s au gel) ; `retry_is_bounded` en **30,2 ms / 31,9 ms** ;
`backoff_cap_netfault` reste **VERT** (725,6 ms / 739,0 ms — R2 ne débride que le chemin HTTP). Les ~10,3 s de la paire
sont **entièrement** dus à `classifies_rpc_errors` (429 permanent) atteignant **son propre** `{ timeout: 10_000 }`
(10 015 ms / 10 002 ms) — cap présent au gel candidat, conforme §F (voir « Reste »). Critère « < 15 s » **tenu**,
reproduit 2×.

**Restauration** : `record.ts` de la copie restauré par `copyFileSync` depuis backup → sha `71c542e7…` == PIN ;
`record.ts` du worktree **jamais touché** → sha `71c542e7…` == PIN.

## Mutant V-E isolé (copie)
Script `F:\tmp\u1a-hard-3\ve-measure.mjs` ; ancre validateur (driver ligne 30, franchit un saut de ligne, appliquée par
`String.replace` node) — chemin transport `record.ts:67` seul :
`"…await sleep(backoffDelay(attempt, backoffMs, backoffCapMs)); continue; }\n        throw e instanceof Error"` →
`"…await sleep(backoffMs * 2 ** attempt); continue; }\n        throw e instanceof Error"`.
- **Unicité de l'ancre** : 1 occurrence (call-site transport `:67` seul, pas le 5xx `:74`).
- GREEN pair : 34/34 ; **mutant V-E** : exit 1 (**ROUGE**), 33 pass / 1 fail, 2 462 ms ; **seul**
  `backoff_cap_is_wired_at_network_fault_call_site` rougit, `backoff_cap_is_wired_at_call_site` (5xx) **reste vert** ⇒
  preuve que le nouveau test cible bien `record.ts:67`. Restauration : sha `71c542e7…` == PIN ; worktree == PIN.

## Rejeu complet du driver validateur (19 mutants, R-21 « dans le bon sens »)
`node F:\tmp\cp2-u1ahard2\mut\driver-cp2.mjs` exécuté depuis `tree\` (overlay frais des tests corrigés ; PRIST =
snapshots du validateur `record.ts`/`rpc2.ts` == PIN) — c'est précisément ce que rejouera le bis :
- **17/19 ROUGE**. **V-E bascule SURVIVES → ROUGE** (2 447 ms, seul `…network_fault_call_site` rouge) — tué par le
  nouveau test.
- **Aucune régression** : G2-2 (cap ignoré aux DEUX call-sites) reste ROUGE via le test 5xx reforgé (1 694 ms) ;
  (c) cap retiré, R1, R2, V-A, V-B, V-G, M4-M6, (a)(d)(e)(f), G2-1 tous ROUGE comme au checkpoint.
- **V-C et V-D restent SURVIVES** = les survivants **déclarés** du checkpoint (commentaires non verrouillés,
  non bloquants, hors liste fermée de ce pli).
- `final rpc2 ==PIN | final record ==PIN` ; sources de la copie == PIN après le driver.
- La ligne finale `SOME NOT RED (see above)` du driver = son drapeau `allGood` déclenché par V-C/V-D (survivants
  **déclarés**), PAS un défaut de ce pli : les 17 mutants attendus rouges le sont tous, aucun régressé.

## Mutants V-3 (arbre isolé + node_modules jonctionné, worktree jamais muté)
Copie = tree overlayé de `test/ci-gates.test.ts` (sha == worktree) ; `node_modules` du worktree **jonctionné** en lecture
(`mklink /J`) — jonction **retirée** ensuite par `rmdir` (le lien seul, cible intacte, worktree node_modules vérifié
intact). Script `F:\tmp\u1a-hard-3\v3-measure.mjs` (mutation → `node --test test/ci-gates.test.ts` → restauration
`copyFileSync` depuis backup byte-exact → sha). Baseline : `test/ci-gates.test.ts` **24/24** vert.
Chaînes de mutation exactes (reproductibles hors scratch) :
- **M1** (retirer le `timeout-minutes` de g1, réalisé par commentaire, PAS par suppression de ligne) :
  `"    timeout-minutes: 5"` → `"    # timeout-minutes removed (mutant)"` (1ʳᵉ occurrence = g1 ; une suppression
  littérale de la ligne donne le même rouge). ⇒ exit 1 (**ROUGE**), 23 pass / 1 fail ; **seul** V3 rougit ; restauré == pristine.
- **M2** (passer le `timeout-minutes` de g1 à 30) : `"    timeout-minutes: 5"` → `"    timeout-minutes: 30"`
  (1ʳᵉ occurrence = g1 ; 30 > 20). ⇒ exit 1 (**ROUGE**) ; seul V3 rougit ; restauré == pristine.
- **M3** (retirer `--test-force-exit` de `scripts.test`) : `" --test-force-exit"` → `""`. ⇒ exit 1 (**ROUGE**) ; seul V3
  rougit ; restauré == pristine.
- `ci.yml` (`8623c42e484bf4045cde25aab3470788461cbe77c6d1137e053ab443ce680afe`) et `package.json`
  (`00fe0f41c148dd100d0721d26591ced6f231efeb477d3ef597f738a85e7eeebe`) : sha final == pristine dans la copie ;
  **worktree inchangé** (mêmes sha avant == après ; jamais mutés).

## SHA avant/après (worktree, sources interdites byte-identiques)
| Fichier | SHA-256 | Avant | Après | PIN G2 |
|---|---|---|---|---|
| `apps/sentinel/src/ukemi/record.ts` | `71c542e7abbb2f2a8cc977b1534a0479ec89cb9cdc08673ffe3cc43771b53db9` | ✓ | ✓ | == |
| `apps/sentinel/src/ukemi/rpc2.ts` | `720d399eccb2d9843646c591287a4ee647cefac84f83871b1e6fb9857637c570` | ✓ | ✓ | == |
| `apps/sentinel/src/ukemi/book.ts` | `a539eabb03be84db580699c56afd8fed9fc3fbb00da70d20e5315fe0c4ef40bc` | ✓ | ✓ | (non touché) |

PIN digest `034fbff9…b921` : `grep -c 034fbff9` = 1 dans `ukemi.test.ts` et 1 dans `book.ts` (inchangé). PIN non modifié.

## Oracle final (worktree, séquentiel, jamais deux oracles en parallèle)
`TEMP=TMP=TMPDIR=F:/tmp`, `npm_config_cache=F:/tmp/npm-cache`.
- `npm run ci` : **exit 0** — gate:vocab OK, typecheck 0, **345/345** (duration_ms 36 909). 343 + 2 (V-3, V-E).
  (Exécuté avant le reword du commentaire l.160-161 ; le reword est **commentaire-seul** — invariant pour la suite —
  et a été re-confirmé post-reword par la paire ukemi worktree **34/34** et lang-gate ci-dessous.)
- `npm run lint` : exit 0.
- `npm run lint:ratchet` : **69/69**, exit 0 (plafond inchangé ; le cast `as { scripts: { test: string } }` ne compte pas).
- `node scripts/lang-gate.mjs --scope root,contracts` : **0 hit**, exit 0 (docs/ dans `SKIP_DIRS` ⇒ ce PLI FR n'est pas scanné) — re-exécuté post-reword.
- Paire ukemi worktree post-reword : **34/34**.

## Reste (honnête)
- **Aucune dette.** Les 3 items de la liste fermée (V-1 code, V-3, V-E) sont livrés, mesurés et re-mesurés
  indépendamment : V-1 (paire sous R2 < 15 s, reproduit 2×, 7,9/7,0 ms pour le fautif) ; V-3 (3 mutants rouges,
  spécificité prouvée, restauration byte-exact) ; V-E (mutant rouge, spécificité prouvée). Rejeu du driver validateur :
  17/19 rouge, V-E bascule à rouge, sans régression.
- **Observation §F (non-dette, hors liste fermée)** : sous R2 la paire sort à ~10,3 s, temps **entièrement** porté par
  `ukemi_default_call_classifies_rpc_errors` (429 permanent atteignant son `{ timeout: 10_000 }`). Conforme à la règle
  §F (un stub transitoire persistant porte un cap par-test **ou** un stub-succès) : ce test porte le cap par-test. Une
  variante à stub-succès (200 au-delà de `retries+1`) ramènerait la paire au domaine des ms, mais elle touche
  `ukemi.test.ts` **hors** de la liste fermée de ce pli — non entreprise, signalée pour arbitrage orchestrateur si un
  durcissement uniforme est voulu.
- **Hors scope de ce pli** (rappel checkpoint) : V-2 (doc ADR-EC, plié par l'orchestrateur), survivants **déclarés**
  V-C/V-D (commentaires non verrouillés, non bloquants), V-4 (error_origin CLI no-op, dû au G7). Non traités ici par mandat.
- Provenance : modèle épinglé `claude-opus-4-8[1m]`, date 2026-09-19, contexte pli U-1a-hard-3, réviseur = orchestrateur
  (vérification adversariale R-21) puis checkpoint-2 bis (re-mesure indépendante).
