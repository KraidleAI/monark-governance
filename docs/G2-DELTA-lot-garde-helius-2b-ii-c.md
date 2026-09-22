Modèle résolu : claude-opus-4-8[1m]

# G2-DELTA (reprise, décision 116) — GARDE-HELIUS-2b-ii-c (pli TESTS + DOCS soldant C-G-1..5 + C-R-b1..b7)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni). Instance neuve, arbre isolé, 2026-09-22. **Sécurité A-7 appliquée** : jamais affiché une variable/l'environnement ; TOUT oracle/test/mutant lancé sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY` (harnais mutants inclus — ferme le faux-négatif « rouge seulement si la clé ambiante est là »). `TEMP/TMP/TMPDIR=F:\tmp`. Rien sur `C:`, aucun réseau.

**Verdict : PASS.** Le pli `593c0c3` solde les CINQ corrections C-G-1..5 de mon G2 -b ET les corrections du validateur C-R-b1..b7, chacune par un test nommé + mutant ROUGE (C-G-5 = caractérisation déclarative D-1, sans mutant, correctement), sans affaiblir une seule assertion et sans toucher le code (src byte-identique à `53ab0fb`, vérifié). Oracle re-mesuré vert DEUX fois (**763/761/0/2**), R-25 = **367** (attendu), pli **16/16 mutants ROUGES** + G1 **9/9 ROUGES** (restauration byte-exacte, sous `env -u`), `npm ci --dry-run --offline` = 0. Zéro dette : les deux résidus (C-G-5→1b-0, C-R-b7→prereg) sont des items formés avec propriétaire + déclencheur. Aucune correction bloquante ; une observation doc-only (typo R-25 dans le RENDU, hors dépôt).

## 0. Périmètre & intégrité (CA-9)
- Clone mis à jour : `git fetch F:/Monark lot/garde-helius-2b-ii-c && checkout FETCH_HEAD`, HEAD **`593c0c3`**, `node_modules` conservé (`require.resolve('@monark/rpc-guard')` → l'arbre). `git status` = **0** au début, après les 25 rejeux de mutants, et à la fin.
- **Périmètre TESTS+DOCS confirmé** : `git diff --quiet 53ab0fb..593c0c3 -- apps/sentinel/src packages/rpc-guard/src` = **exit 0** (src BYTE-IDENTIQUE ; le code -b jugé juste n'est pas touché). Fold = **7 fichiers** : 4 tests (`ukemi-guard-record` +292/-4, `ukemi-record` +2/-1 en-tête, `ukemi-u4-scores` +8/-1, `ukemi-u4a` +3/-2 commentaire) + `test/rpc-guard-fetch-only-inside-client.test.ts` (+38/-16) + ADR + `package-lock.json`. (Le diff cumulé vs `53ab0fb` montre 2 docs de plus = les rapports G2-b/CP2 persistés par `e00f965`, hors fold.)
- Invariants : `git diff --quiet e7f22b8 -- scripts fixtures/ukemi/u4 fixtures/ukemi/u4b apps/sentinel/src/rpc.ts` = exit 0 (gel U-4b + rpc.ts intacts) ; `ADR-U4b-calibration-episode-frais.md` non touché.
- **Provenance** : `sha256sum -c DELIVERED.sha256` (pli, 7 fichiers) = **OK** (octets `593c0c3` == octets livrés par le worker). Sous-section ADR « Pli 2b-ii-c » (l.415-470) **F-1 propre** : aucun renvoi `F:\tmp`/`rendu`/`probe-`/`.patch` (cite des noms de tests EN DÉPÔT).

## 1. Oracle RE-EXÉCUTÉ (codes directs, sous `env -u <8 clés>`), DEUX passes (flake DEV-D)
| commande | code | dernière ligne utile |
|---|---|---|
| `gate:vocab` | **0** | `scanned 206 file(s), no forbidden claim.` |
| `typecheck` | **0** | (aucune sortie) |
| `test` (run 1) | **0** | `tests 763  pass 761  fail 0  skipped 2` |
| `test` (run 2) | **0** | `tests 763  pass 761  fail 0  skipped 2` |
| `lint` / `lint:ratchet` | **0 / 0** | 0 problème / `69/69` |
| `lang:gate` / `export:check` | **0 / 0** | 0 hit / 0 forbidden path |

`0` occurrence de `not ok`/`✖` dans les DEUX runs. Compte -b 754/752 + **9 tests neufs** = 763/761 (skips inchangés : `fetch_only_inside_client` until-1b + `u4_redraw` until-2b-iii). R-25 vs `53ab0fb` (pathspec `ci.yml:65` verbatim, docs+lock exclus) = `5 files changed, 343 insertions(+), 24 deletions(-)` = **367** ≤ 1150 (concorde attendu).

## 2. Les 9 points À JUGER
### (1) Chaque C-G-1..5 soldée (test nommé + mutant ROUGE)
| C-G | test nommé (vert) | mutant(s) ROUGE | verdict |
|---|---|---|---|
| **C-G-1** concordance servie | `ukemi_record_concordance_chain` (args→onQuorum→tally→flush(finally)→`reduceConcordance` ; paire `mevblocker.io|pocket` 1/1 rate 0.5 ; **aucune URL** ; nodies→pocket) | onQuorum débranché ; flush retiré du finally ; flush neutralisé | **SOLDÉE** — `reduceConcordance` désormais importé+testé ; assertion « no URL » restaurée |
| **C-G-2** garde distinct recorder | `ukemi_record_distinct_guard_by_operator` (`nodies.app,pocket.network`⇒1 op `pocket`⇒fail-closed avant toute lecture) ; + `ukemi_record_operatorof_collapses_pocket_on_bare_labels` | distinct `<2 → <0` | **SOLDÉE** — + le **commentaire faux** (`ukemi-u4a`) qui nommait un test **inexistant** (`..._operators_are_an_explicit_include_list`) est corrigé vers les vrais tests |
| **C-G-3** journal `e.name` | `..._maps_paid_http_400_to_http_not_code` ; `..._maps_paid_5xx_to_http_and_keyless_rpc_to_code` ; `..._failed_paid_rpcerror_leaks_no_key_on_any_surface` | http→code ; `rpcErrors.push` neutralisé ; branche `e.name RpcError`→message | **SOLDÉE** — l'imposé #9 / C-5(iii) est un **vrai test positif** (400 payant⇒`http:400` jamais `code`) + 0 clé |
| **C-G-4** renvoi ADR | n-a (doc) | n-a | **SOLDÉE** — ADR:413 cite les SHA `b0f35e6`/`53ab0fb`, « aucun renvoi hors dépôt » |
| **C-G-5** verrou post-crash | `ukemi_record_crash_between_append_and_head_leaves_lock_unrecoverable_by_unlock_KNOWN_DEFECT` (reproduit l'état, asserte `unlock` JETTE `/head sidecar != recomputed head/` + verrou STILL held) | (déclaratif D-1, aucun mutant — correct) | **SOLDÉE** — réserve au runbook + item formé (propriétaire orchestrateur ; déclencheur **1b-0**) ; `ledger.ts`/`cli.ts` NON touchés (vérifié) |

### (2) C-R-b1 / C-R-b2 (validateur)
- **C-R-b1 journal épinglé** : http:400 payant + http:503 payant (jamais `code`), `code:-32601` pour un RpcError KEYLESS (jamais `http`). Le check de fuite `leaks(cycleFilesText(dir) + --out + stdout/stderr) == []` couvre les NEEDLES (brute/casse/hex/base64/base64url/%-encodée/partielle/userinfo/query + hôte + user) sur `--out`, TOUS les ledgers, ET stdout/stderr (tee, DEV-A). **0 clé** — indice fermé (payant) / corps redacté (keyless). Mutants http→code / push neutralisé / e.name→message ROUGES.
- **C-R-b2(a) e2e ledger NON VIDE** : `..._go_and_hard_no_go` — `mevblocker.io,chainstack` ⇒ chainstack tiré à CHAQUE lecture ⇒ `Σ credits_derived == provenance.spent_by_operator.chainstack` ; `reconcile aggregate-calibration` **GO à Δ==ledger_run**, **NO-GO `hard:total` à +1**. Vecteur DISCRIMINANT (corrige le `before=after={total_ru:0}` de mon obs. (d), D-2). L'e2e 6-op épingle en plus `chainstack attempted==0` (dernier) + 6 verrous (mutant « chainstack tiré en premier » ROUGE).
- **C-R-b2(b) chaîne de concordance** = C-G-1 (ci-dessus).

### (3) Aucune assertion affaiblie (D-4) — CONFIRMÉ
`ukemi-record.test.ts` : en-tête seul. `ukemi-u4a.test.ts` : **commentaire faux corrigé** (nommait un test inexistant). `ukemi-guard-record.test.ts` : les 4 lignes retirées = la boucle 3-op remplacée par 6-op (RENFORCÉE) + imports élargis. **Aucune** assertion supprimée/affaiblie ; les tests -b existants sont intacts, l'e2e est renforcé (assertions AJOUTÉES : `attempted==0`, 3→6 verrous).

### (4) Motif KEY (6 formes) : robuste ou fragile — **ROBUSTE comme ceinture** (pas la preuve)
5 regexes (dot / `?.`dot / bracket / `?.`bracket / gabarit backtick / `in` / destructuration / `Reflect.get` / `Object.hasOwn`) + un **scan de NOM NU** (`KEY_BARE`) appliqué à la SEULE portée ukemi (`bareKeys=true`). La ceinture de test est HONNÊTE : elle asserte que l'ALIAS (`const e = env; e.KEY`) **évade toute regex d'accès** (l.130) et n'est attrapé QUE par le scan de nom nu (l.131). Sur la portée ukemi, `bareKeys` rougit TOUTE occurrence littérale d'un nom de clé (pas seulement les 6 formes) — 0 occurrence mesurée aujourd'hui, `rpc.ts` allowlisté. Résidu inhérent à tout grep statique : un nom construit/concaténé jamais écrit littéralement (`env["CHAIN"+"STACK_ETH_URL"]`) passerait — **backstoppé par la garantie STRUCTURELLE C-1** (`record.ts` byte-identique, ne sonde aucun env ; 9/9 mutant G1 « clé lue par crochets » ROUGE). Verdict : robuste pour son rôle de défense-en-profondeur ; la preuve reste structurelle, pas le grep. Les 6 mutants (une par forme) ROUGES.

### (5) Catch DEV-1 resserré — CONFIRMÉ
`ukemi-u4-scores.test.ts` : le `catch` ne `t.skip()` QUE sur `e instanceof SyntaxError && /does not provide an export named/` ; TOUTE autre erreur est re-levée (reste ROUGE). Mutant « DEV-1 spec bidon (doit rougir, pas skipper) » ROUGE. La casse silencieuse hors-CI est fermée.

### (6) `package-lock.json` : diff minimal + `npm ci` — CONFIRMÉ
Diff = **une** entrée : `"@monark/rpc-guard": "0.0.0"` ajoutée aux deps de `apps/sentinel` (le câblage correct : `record.ts` importe désormais le paquet). `npm ci --dry-run --offline` (sous `env -u`) = **exit 0** (added 7, changed 266, 893ms) — verrou cohérent, aucun réseau. C-R-a2 clos.

### (7) « Course RpcError PAYANTE ne se termine pas » : défaut de conception ou fail-closed voulu ?
**FAIL-CLOSED VOULU — pas un défaut.** Un recorder quorum-2 EXIGE 2 fournisseurs concordants par lecture ; si la jambe payante benche (RpcError) et qu'un seul keyless reste, poursuivre violerait le quorum-2. L'abstention (`NoQuorumError`, `--out` jamais écrit) est le comportement CONSERVATEUR correct (abstenir plutôt que sceller un livre sur <2 fournisseurs). Vérifié de première main : `..._failed_paid_rpcerror_leaks_no_key_on_any_surface` MESURE que la course jette, `--out` absent, et **0 caractère de clé** dans le message levé + stderr + tous les ledgers, verrous relâchés. La conséquence SECONDAIRE (aucun journal de diagnostic DURABLE sur une course en échec) est un vrai trou d'observabilité, correctement routé vers l'item formé **C-R-b7** (propriétaire orchestrateur ; déclencheur AVANT la course U-4b-1b / prereg). **Nuance (R-21)** : le test livré épingle le SECRET, pas la CAUSE — `..._leaks_no_key_on_any_surface:328` asserte seulement `thrown.length > 0` (passe si la course jette pour N'IMPORTE quelle raison) ; la cause « quorum à `finalized` » vit dans la sonde hors-dépôt `probe-c2.test.ts`, pas dans une assertion en dépôt. Resserrage NON BLOQUANT : `assert.match(thrown, /quorum/i)` rendrait la caractérisation load-bearing. **Ce que le G7 doit trancher (paramètre de prereg, pas du code)** : le risque d'abstention varie à l'INVERSE du nombre de keyless dans `--operators` — avec 5 keyless + chainstack la course tolère 4 bancs avant que chainstack soit load-bearing ; avec 2 opérateurs, UN banc la tue. **Pour le G7** : ratifier « fail-closed voulu », fixer le nombre de keyless au prereg, et exiger la résolution de C-R-b7 avant la course. Je concours avec le routage du worker ; ce n'est PAS un défaut de conception bloquant.

### (8) Flake `test/h5-e2e-probe.test.ts` (DEV-D) : rejoué DEUX fois — **NE se reproduit PAS**
Mes deux passes de suite complète sont VERTES (763/761/0/2, 0 `not ok`). Le fichier `test/h5-e2e-probe.test.ts` est INDÉPENDANT (ne référence aucun des 7 fichiers du pli). Flake pré-existant (e2e probe sous charge concurrente), consigne — non un défaut du pli. Cohérent avec DEV-D (le worker l'a vu 1× puis vert au re-run ; je ne l'ai pas reproduit en 2×). **Nouveau point de fragilité (observation, NON BLOQUANT)** : `ukemi_record_caller_retries_429_with_capped_backoff:400` asserte l'horloge murale `< 4000 ms` — généreux aujourd'hui, mais c'est la SEULE assertion temporelle que le pli introduit, dans une suite où les FICHIERS de test tournent en processus parallèles. À surveiller (un `--backoff-cap-ms 5` rend l'échéance très large ; risque faible).

### (9) Oracle complet + R-25 — CONFIRMÉ (§1) : 7 gates = 0 ; 763/761/0/2 ×2 ; R-25 = 367.

**Gain de couverture crédité (obs. (c) de mon G2 -b, désormais CLOSE)** : mon rapport -b avait différé le split RÉACTIF HTTP-400 de `getLogsVia` comme « portée rpc2/-a ». `ukemi_record_journal_maps_paid_http_400_to_http_not_code` exerce EXACTEMENT ce chemin (les deux opérateurs 400 sur une fenêtre de 3001 blocs ⇒ split ⇒ la course COMPLÈTE ⇒ le journal atteint `--out`) — trou de couverture que j'avais signalé, désormais couvert de première main.

## 3. Mutants (sous `env -u`, arbre restauré propre après)
- **Pli `F:\tmp\garde2bii-pli\mutants.mjs` : 16/16 ROUGES, ALL_RESTORED=true** — journal (http→code, push neutralisé, e.name→message) ; concordance (onQuorum débranché, flush hors finally, flush neutralisé) ; chainstack tiré en premier ; distinct `<2→<0` ; 429 non réessayé ; **6 formes KEY** (`env?.KEY`, `env?.["KEY"]`, `env[backtick KEY]`, `Reflect.get`, `Object.hasOwn`, **ALIAS via nom nu**) ; DEV-1 chemin bidon.
- **G1 `mutants.mjs` : 9/9 ROUGES** (rejoué après les edits du pli — anchors intacts ; « clé lue par crochets » toujours ROUGE, désormais aussi via le nom nu).
- **Note A-7 rétroactive (honnêteté R-21)** : mes mutants du G2 -b avaient tourné SANS `env -u` (A-7 n'était pas dans la consigne lue alors). Ce re-jeu des 9 mutants G1 SOUS `env -u` (clés retirées) ferme rétroactivement le faux-négatif « rouge seulement si la clé ambiante est là » — les 9 restent ROUGES avec l'environnement dépourvu de clés.
- **C-G-5/E-1** : test de CARACTÉRISATION (déclaratif D-1), aucun mutant revendiqué — flippera quand 1b-0 durcira l'ordre append/head (= signal d'acceptation du déclencheur). Correct.

## 4. Items formés (zéro dette nue) — repris de l'ADR (sous-section « Pli GARDE-HELIUS-2b-ii-c »)
1. **C-G-5 / E-1** : durcir l'ordre append/head du paquet (`ledger.ts` : head AVANT append, ou re-sync). Propriétaire orchestrateur ; **déclencheur G0 de GARDE-HELIUS-1b-0**. Caractérisé par le test `..._KNOWN_DEFECT` (déclaratif). **Couplage cross-lot À INSCRIRE au G0 de 1b-0** : ce test vit dans `apps/sentinel/test/` mais est VERT *parce que* le défaut est présent ; quand 1b-0 corrige `ledger.ts`, il DOIT **inverser** ce test (assertion → « `unlock` récupère le verrou ») — un fichier hors-`packages/rpc-guard/` que le périmètre de 1b-0 doit lister explicitement, sinon la suite rougit à la fusion de 1b-0.
2. **C-R-b7** : journal de diagnostic DURABLE sur une course en échec. Propriétaire orchestrateur ; **déclencheur prereg (avant U-4b-1b)**. Non régressif.
3. **C-R-b6** (déclencheur 1b-0) : `cycle_ledger_mixes_legacy_and_network_lines` partira d'un ledger PRODUIT par `runRecorder`. **Observation (a) de mon G2** (déclencheur 1b-0) : `finally` déverrouille avec la variable CLI `cycle` unique — à revoir sous cycles par opérateur (clause 121).
- **C-R-a1 CLOS** : R-A / R-D vivent verbatim dans l'amendement 2b-ii (`53ab0fb`), fusionnent au même G7. **C-R-a2 CLOS** : package-lock à jour + `npm ci` = 0.

## 5. Observation NON BLOQUANTE (doc-only, hors dépôt)
- **RENDU §7 A-5 dit « R-25 = 354 »** alors que son propre §3 (et la mesure) = **367**. Typo dans `F:\tmp\garde2bii-pli\RENDU-PLI.md` (artefact hors dépôt, pas dans l'ADR ni le code) ; à corriger au rendu pour la traçabilité (R-21), sans effet sur la fusion.

## 6. MAST (résidu)
Secret-leak : FERMÉ (indice fermé payant + corps redacté keyless ; 0 clé prouvé sur out/ledgers/stdio, y compris sur course en ÉCHEC). Fail-open : garde distinct + budget capté en premier + quorum fail-closed (abstention correcte). Budget non attribué : write-ahead + R+1 + refus non réessayé (held -b). Concurrence : verrou `wx` + finally N-unlock ; résidu récupération = C-G-5 (item 1b-0). No-attempt-to-verify : reconcile servi non-LLM discriminant (GO/hard:total). Information-withholding : C-R-b7 (journal durable sur échec) formé.

---
**R-1** : `claude-opus-4-8[1m]`. **R-20** : aucun commit, aucun workflow (clone restauré propre). **R-21** : oracle hors pipe ×2, mutants rejouables sous `env -u`, sha/git diff. **A-7** : aucune variable d'env affichée ; tout sous `env -u <8 clés>`. **Verdict : PASS** (2 items formés à déclencheur porté ; 1 observation doc-only ; item (7) = fail-closed voulu, C-R-b7 à solder avant la course).
