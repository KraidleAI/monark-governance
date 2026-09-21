# G2 — RELECTEUR (instance séparée, contexte frais, revue 3 étapes) — lot POOL-RPC-1a (MONARK)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`, Opus 4.8 1M, effort max, non banni). **R-20** : aucun commit / workflow. **R-21** : chaque affirmation porte sa preuve re-exécutée ce tour.

**Cadre** : Worktree `F:\Monark-wt-pool1a`, branche `lot/pool-rpc-1a`, base `49e738b` (= `49e738be459acd…`, vérifié), HEAD = **`5b9bc37`** (commit G1). Dépôt en LECTURE SEULE : mutants par **sauvegarde bytes + sha256, restauration byte-exacte** (harness `F:\tmp\g2-pool1a\run-mutants.mjs`), **jamais** `git checkout/stash`. **AUCUN réseau** (tous stubs / injected call). **Aucun `npm ci/install`** (jonction `node_modules`→`F:\Monark`). `git status --porcelain` vide AVANT et APRÈS la campagne de mutants (confirmé).
**HEAD = état rendu** : sha256 des 4 sources == table RENDU-G1 (rpc.ts `0e232519…`, rpc2.ts `3635f9da…`, record.ts `adb08252…`, concordance.ts `26212da5…`) — recomputés ce tour, identiques.

---

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le **code et le branchement sont corrects** : tous les livrables L-1..L-6 implémentés et testés, distinctness par `operatorOf` partout où elle compte, hook de concordance AVANT le throw + flush garanti au throw, réducteur non-LLM consommé par un test de chaîne, invariants d'octet tenus, retrait Blast/Llama complet dans tout code servi, R-25=440, suite complète verte, 13 mutants tués byte-exact. Les corrections ne sont PAS des défauts de correction : **1 bloquante pour la clôture G7** (ADR manquant — dû nu), **3 non-bloquantes** (2 lacunes d'oracle + 1 question orchestrateur laissée muette). Aucune ne bloque ce verdict de revue ; C-G2-1 doit être résolue **avant fusion/G7**.

---

## Re-exécution — résultats par point de mission

**Suite & gates (point 8)** — RE-EXÉCUTÉS ce tour :
- `npm run test` = **565 tests, 565 pass, 0 fail** (durée 46,1 s).
- `npm run ci` = **EXIT 0** : `gate:vocab OK (188 fichiers, aucune claim interdite)` + `tsc --noEmit` vert + **565/565**.
- `npm run lang:gate` = OK (0 hit français non-exempt ; sentinel/bell [GATED]).
- **R-25 = 440** (`ins+del`), recalculé avec le pathspec EXACT `STAT=` de `.github/workflows/ci.yml:65` (14 `:(exclude…)`), base `49e738b..HEAD`. ≤ 1205. Conforme à RENDU.
  - Note R-25 (RENDU écart 6, confirmée) : la CI diffe `origin/${base_ref}...HEAD`. 440 est valide SSI la base de PR = `lot/etude-suite` (49e738b) OU 1a rebasé sur main ; une PR ouverte directement sur `main` compterait tout le delta etude-suite. **Stratégie de merge = décision orchestrateur** (déjà déclarée).

**Point 1 — retrait Blast/Llama complet dans tout code non gelé** : VÉRIFIÉ.
- `apps/sentinel/src/rpc.ts` et `ukemi/rpc2.ts` : **0** occurrence `blastapi|llamarpc` (grep scopé worktree ; le seul « Blast/Llama » short-form est le commentaire descriptif rpc2.ts:264 « −Blast −Llama +Pocket »). `publishedEndpoints({})` émet `eth.api.pocket.network`, **sans** blast ni llama (exécuté).
- Les 29 occurrences restantes (14 fichiers, hors docs) sont TOUTES gelées/historiques/fixtures/assertions-d'absence : 4 scripts gelés **avec note de tête** POOL-RPC-1a (usde-full-pull, u3-realized, burns-by-burner, aave-liquidations — diffs vérifiés) ; fixtures (`narabi-timeline-2026-09-19.jsonl`, PROVENANCE-*, U3-inputs) exclues R-25 ; `apps/site/lib/narabi-snapshot.ts` capture sha-pinnée 2026-09-19 (item 3, non réécrite) ; `pool-rpc-1a.test.ts` (4 = **assertions que blast est ABSENT**) ; entrées SYNTHÉTIQUES/commentaires historiques inertes (`probe-narabi.test.ts:123` eightPublic, `ukemi-u4a.test.ts:193` synthétique, `sentinel.test.ts:434` commentaire d'incident) ; `apps/bell/src/operators.ts:23` carte gelée Solana (item 1).
- **PIÈGE MÉTHODO consigné** : le répertoire de travail primaire est `F:\Monark` (checkout principal, ancien pool). Tout `Grep` sans `path:` explicite balaye `F:\Monark`, PAS le worktree → faux positifs blast/llama sur rpc.ts/rpc2.ts. Rescopé `F:\Monark-wt-pool1a` : 0 en code servi.

**Point 2 — `operatorOf` {nodies, pocket}=1 partout** : VÉRIFIÉ.
- `rpc2.ts:20-23` `operatorOf` : `nodies.app`|`pocket.network`→`pocket`, sinon `providerOf`. Distinctness par `operatorOf` : `quorum2` (`:183` garde, `:187/:188/:191` labels), `finalized` (`:250/:251`), `record.ts:331` garde `distinct()`. **Aucun site OUBLIÉ** : grep `providerOf` dans `apps/sentinel/src/**` ⇒ les autres usages sont politesse (`rpc2:158`), logging/redaction (`record:40/48/86`), ou l'ancre sentinel `rpc.ts:186/189` (Narabi LIVE, `pocket` seul au pool, jamais {nodies,pocket} — correct de NE PAS y toucher, C-2 « jamais rpc.ts »).
- Paire {nodies, pocket} seule ⇒ **NoQuorumError** (pas TypeError) sur le chemin NON muté : test `pool_rpc_1a_ca3_pocket_never_alone` (ethCall ET finalized) + `bell_…_ca9_nodies_pocket_pair_no_quorum` + `ukemi_record_distinct_guard_by_operator`, tous verts.
- `operatorOf` robuste : `HTTPS://…`, `:8545`, `user:pw@…?k=x`, casse mixte → tous `pocket` (exécuté) ; pas de contournement du collapse par casse/port/userinfo.

**Point 3 — couture `runRecorder(argv, deps)` + hook `--concordance-out`** : VÉRIFIÉ.
- `record.ts:308` `runRecorder(argv, deps)` exporté ; `main()` (`:458`) = wrapper sous run-guard `:465`. Écart déclaré (RENDU écart 1) : `deps={env,now}` sans `exit` — la couture RETOURNE le code, `main` applique `process.exit` APRÈS le `finally` — écart MINIMAL et JUSTE (sinon `process.exit` tuerait le flush). Accepté.
- Hook `rpc2.ts:199` `opts.onQuorum?.(label, a.prov, b.prov, a.key===b.key)` **AVANT** le throw `:200` ; `a.prov/b.prov = operatorOf(url)` — **opérateurs seuls, jamais d'URL** (tué par M-7b).
- Flush `record.ts:450-453` dans le `finally` ⇒ garanti même sur throw de désaccord : le test de chaîne `ukemi_record_concordance_chain` FAIT throw `QuorumDisagreementError` et lit pourtant le jsonl (concordant=1, discordant=1, rate=0.5, **aucune URL, pas « nodies »**).
- Réducteur `concordance.ts:18` `reduceConcordance` (pur) consommé par le test de chaîne `args→runRecorder→jsonl→reduceConcordance→compteurs`. **M-7c** (drapeau parsé, sink non passé) ⇒ chaîne ROUGE (tué).
- `--resume` HIT contourne `basePool` (donc le hook) — déclaré (RENDU item 5), acceptable (concordance = MISS seulement, jamais surinterprétée).
- **Observation (non-correction)** : `record.ts:290` `relabel` (opérateur Chainstack → `archive-env` dans le fichier de concordance) est **LU, non exécuté par un oracle** (le test de chaîne tourne avec `env:{}`). Correct par inspection (`operatorOf(archiveEnvUrl)` comparé à la même fonction sur la même URL ; pire cas sans lui = un domaine nu, **jamais une clé**). Signalé pour que l'orchestrateur sache qu'il a été relu, pas rejoué.

**Point 4 — invariant CA-8** : VÉRIFIÉ.
- `ukemi.test.ts` (`book_digest 034fbff9…`) et `ukemi-u4-scores.test.ts` (`PINNED_DIGEST 267cd991…`) **NON modifiés** (absents de `git diff --name-status 49e738b..HEAD`). Rejoués en isolation : **25/25 pass** (`sentinel2_book_identical_to_pull`, `u4_scores_mutants_shift_calib_digest` verts) ⇒ le hook no-op par défaut préserve l'octet.
- **M-9 prouvé** : `ukemiSha(ukemi)` HEAD = `0a2aa66c…` vs base `49e738b` = `798e1458…` (git archive + rejeu) ⇒ **CHANGE** (sources éditées) TANDIS QUE book_digest/PINNED_DIGEST tiennent. Confirme C-4 : `ukemi_sha` = témoin de build volatil, PAS l'invariant.

**Point 5 — L-5** : VÉRIFIÉ (exécuté sur `rpc2.isResultLimit`/`isPlanLimited`).
- 3 messages mesurés : `…narrow your filter: 5000` → isResultLimit=**true**, isPlanLimited=false (SPLIT) ; `query exceeds max block range 10000` → true/false (SPLIT) ; `ranges over 10000 blocks…free plan` → true/**true** (BENCH, isPlanLimited testé D'ABORD dans getLogsVia:216). `header not found` → **false/false** ⇒ tombe au `throw` (else) ⇒ **bench SANS split**. Tests : `pool_rpc_1a_isresultlimit_matches_l5_caps`, `ukemi_record_free_plan_benches_without_split`.
- Découpage Pocket ≤ 5000 : `pool_rpc_1a_pocket_getlogs_split_holds_5000` (fenêtre 7168 → ≥2 sous-requêtes, max ≤ 5000) + `pool_rpc_1a_l1_pocket_through_unchanged_anchor` (l'ancre `rpc.ts` inchangée splitte aussi via « block range »).

**Point 6 — mutants (≥8/14) + voisins** : **13 tués** byte-exact, **3 survivants** = 2 lacunes d'oracle (détail C-G2-2/3). Tous restaurés byte-exact ; `git status` vide après.

| Mutant | Test rougi | État |
|---|---|---|
| M-1 blast∈PUBLIC_ENDPOINTS | ca1 | KILLED |
| M-2 llama∈PUBLIC_ENDPOINTS | ca1 | KILLED |
| M-3 operatorOf(pocket)≠pocket | ca2/ca3/ca4 | KILLED |
| M-4 quorum pocket SEUL | ca3 (TypeError, RENDU écart 4) | KILLED |
| M-4b quorum2 distinctness par providerOf | ca3 | KILLED |
| M-4c finalized distinctness par providerOf | ca3 | KILLED |
| M-4d record.ts distinct() par providerOf | distinct_guard | KILLED |
| M-5 blast∈ETH_CALL_PROVIDERS | ca4 | KILLED |
| M-6 1rpc∈ETH_CALL_PROVIDERS | ca4/ca5 | KILLED |
| M-7b hook enregistre l'URL | ca8 | KILLED |
| M-7c --concordance-out parsé, sink non câblé | chain | KILLED |
| Voisin: hook APRÈS le throw | ca8 + chain (les DEUX) | KILLED |
| Voisin: --concordance-out aliasé à --out | parse + chain | KILLED |
| **Voisin: ordre ETH_CALL swap drpc↔pocket** | (rien) | **SURVIT** → C-G2-2 |
| **Voisin: ordre GET_LOGS swap drpc↔pocket** | (rien) | **SURVIT** → C-G2-2 |
| **Voisin: défaut Bell getLogs = [drpc,mevblocker] seul** | (rien) | **SURVIT** → C-G2-3 |

Voisin `operatorOf` casse/port/userinfo : couvert par le check direct (point 2), non contournable.

**Couverture vs les 14 mutants du RENDU (honnêteté R-21)** : **11 rejoués à l'identique** (M-1, M-2, M-3, M-4, M-4b, M-4c, M-4d, M-5, M-6, M-7b, M-7c) ; **M-9 prouvé par calcul direct** de `ukemiSha` HEAD vs base (plutôt que par re-mutation) ; **M-5b, M-7, M-8 NON rejoués** (seuil « ≥ 8/14 » largement dépassé). Les **5 voisins sont construits par CE relecteur** pour sonder la couverture d'oracle — les **3 survivants (2 ordre + CA-9) sont MES voisins, PAS des mutants du RENDU qui auraient échoué** ; ils démontrent l'absence d'oracle (C-G2-2/3), non une régression.

**Point 7 — fixtures / secret / surface** : VÉRIFIÉ.
- `narabi-timeline-2026-09-19.jsonl` et `apps/site/lib/narabi-snapshot.ts` **NON réécrits** (absents de `git diff --name-status 49e738b..HEAD` — seuls 11 fichiers changent). Idem `ukemi.test.ts`/`ukemi-u4-scores.test.ts`.
- `sentinel_never_prints_endpoint_url` + `no_secret_in_repo` **verts** (dans les 565).
- Surface `/narabi/` : `publishedEndpoints` publie `eth.api.pocket.network` **verbatim** (exécuté), sans blast/llama ; vocab-gate + lang-gate verts ⇒ **aucun mot interdit**. Pocket = opérateur RPC ∉ recoupement CASH ⇒ décision 69 non trippée. (Rendu servi effectif = post-E-5, état « WIRED à E-5 » du plan — correct, jamais « BUILT » avant la 1ʳᵉ ligne.)

---

## Corrections G2 (fermées, `fichier:ligne`, `error_origin`)

### C-G2-1 — **BLOQUANTE pour la clôture G7** (n'invalide pas ce verdict de revue) : ADR-POOL-RPC-1 (C-5) absent = dû nu
`docs/adr/` ne contient AUCUN `ADR-POOL-RPC*` (vérifié ; `ADR-M012-narabi-live-sentinel.md` et `ADR-U1-recorder-book-liquidation.md`, cibles d'amendement, EXISTENT). C-5 était une correction **BLOQUANTE** du checkpoint-1 : l'ADR doit porter tuyaux, décisions 100/102/106, ligne `operatorOf`, scission 1a/1b, N-5. RENDU item 2 « à ASSIGNER » = **dû nu** (ni owner ni déclencheur — viole règle Dettes + règle Branchement « un G7 ne clôt pas un lot dont un tuyau annoncé manque »). La justification G1 « interdiction .md de rapport » est **trop large** : la consigne vise les rapports/summaries, PAS un ADR de dépôt mandaté par le plan (les docs sont exclus R-25 — coût 0).
**Résolution** : écrire ADR-POOL-RPC-1 (amende ADR-M012 + ADR-U1 D3) **avant fusion**, OU le convertir en item formé avec owner + déclencheur. `error_origin` = **G1** (lecture de périmètre) + **plan/orchestrateur** (C-5 non allouée à une passe nommée).

### C-G2-2 — non-bloquante : oracle d'ordre de liste manquant
`rpc2.ts:268` (`ETH_CALL_PROVIDERS`) et `:269` (`GET_LOGS_PROVIDERS`) : l'ordre est déclaré **« ORDER is load-bearing »** (commentaire `:267`, correction bloquante C-6) mais **aucun test ne l'épingle** — les deux mutants de swap drpc↔pocket **SURVIVENT** (29/29 verts) ; grep confirme : aucun `deepEqual`/`[0]` sur ces constantes, seulement membership/length/operator-count. Non-correctness (l'ordre n'affecte que la distribution de charge U-4b, validée au run ; le quorum se forme quel que soit l'ordre).
**Résolution** : `assert.deepEqual(ETH_CALL_PROVIDERS, ["…drpc","…mevblocker","…nodies","…pocket"])` + idem GET_LOGS dans `pool-rpc-1a.test.ts`. `error_origin` = **plan** (liste M-* sans mutant d'ordre) + **G1** (oracle).

### C-G2-3 — non-bloquante : CA-9 « résolution » sous-discriminante
`bell_pool_rpc_1a_ca9_default_resolves_get_logs_providers` (bell test `:17`) ne vérifie que la **paire de tête** {drpc, mevblocker} : le stub répond à TOUT, le quorum s'arrête à 2, donc tenderly/pocket ne sont jamais exercés. Un défaut par défaut = `[drpc, mevblocker]` seul **SURVIT** (3/3 verts). Le **code est correct** (`ethereum.ts:76-77` défaut = `GET_LOGS_PROVIDERS`, vérifié par lecture) — c'est l'oracle qui sous-spécifie le tuyau C-1.
**Résolution** : stub rejetant les URL `drpc` ⇒ paire {mevblocker, tenderly} ; asserter `tenderly.co` vu. `error_origin` = **G1** (oracle).

### C-G2-4 — non-bloquante : question orchestrateur L-5 laissée muette (dette de clôture)
`CHANTIERS.md:456` (sonde L-5) : « dRPC gratuit a refusé les DEUX fenêtres (`ranges over 10000…free plan`), **même pour 2 000 blocs — mesuré, à comprendre au G1** ». Le RENDU traite le côté recorder (`rpc2.ts:72` `isPlanLimited` benche, testé) mais est **SILENCIEUX sur l'ancre sentinel** `rpc.ts:87` : son `isResultLimit` n'a PAS d'`isPlanLimited` ⇒ un 400 free-plan dRPC matche (via « 10000 »/« block range ») ⇒ `getLogsVia` (`rpc.ts:203`) **splitte jusqu'au plancher puis benche** (gaspilleur ; `eth.drpc.org` EST dans `PUBLIC_ENDPOINTS`). **Pré-existant** (non introduit par 1a), **hors périmètre** (ancre Narabi LIVE non touchée), **non-correctness** (fail-closed tient). Le défaut n'est pas le code mais la **clôture muette** d'une question orchestrateur (règle Dettes : ni dû nu, ni contournement).
**Résolution** : item formé routé à l'owner ancre Narabi (drpc hors voie getLogs sentinel, OU patch `isPlanLimited` dans l'ancre = lot séparé avec ses gates). `error_origin` = **pré-existant** (surfacé par L-5) + **RENDU** (question non consignée).

### Mineur (non-bloquant, choix orchestrateur) — étiquettes synthétiques « public » d'hôtes retirés
`probe-narabi.test.ts:123-124` (`eightPublic`) et `ukemi-u4a.test.ts:193` nomment blast/llama comme « public »/membres de pool synthétique. **Inertes** (verts, testent une détection/exclusion, pas un pool servi). Le reco rédacteur Q4 (G0:205) disait « MAJ si elles nomment un opérateur RETIRÉ comme public » — ce qui est le cas ; mais le **ruling orchestrateur** (G0:246) n'a nommé que `rpc.ts:57/65`. Laissé tel quel **per ruling** — signalé pour cohérence.

---

## Point 9 — les 7 items formés du RENDU : items ou dettes ?

| # | Item RENDU | Verdict G2 |
|---|---|---|
| 1 | `apps/bell/src/operators.ts` `operatorOf` divergent (mappe `pocket.network`→pocket mais PAS `nodies.app`) | **ITEM VALIDE** — isolation CONFIRMÉE : `operators.ts` NON importé par la jambe Ethereum de Bell (`ethereum.ts` utilise `rpc2.operatorOf`) ; consommé par la seule jambe **Solana** (collect/discover/quorum/rebase-*). Carte gelée ADR-T1aii C-9. Déclencheur déclaré. Non-dette. |
| 2 | ADR-POOL-RPC-1 non écrit « à ASSIGNER » | **DETTE → C-G2-1** (dû nu, cf. ci-dessus). |
| 3 | `narabi-snapshot.ts:23` snapshot 8 anciens endpoints non réécrit | **ITEM VALIDE** — sha-pinné (`stateSha256`/`timelineSha256`), histoire honnête, revisionnisme proscrit. Signalé. |
| 4 | `--exclude-operator pocket.network` exige aussi `nodies.app` (`applyExcludeOperators` par providerOf/label) | **ITEM VALIDE déclaré** (C-6 « à déclarer ») — limitation connue de la politesse Pocket, non corrigée (hors périmètre). Implication opérationnelle notée : exclure Pocket entier = 2 drapeaux. |
| 5 | `--resume` HIT contourne le hook (concordance = MISS seulement) | **ITEM VALIDE déclaré** — jamais surinterprété. |
| 6 | Cosmétique hors Q4 (eightPublic, blast synthétique, « 8/9th » dynamiques) | **ITEM VALIDE déclaré** — cf. « Mineur » ci-dessus ; non-bloquant, choix orchestrateur. |
| 7 | RPS Pocket/Nodies [2nd] non confirmé | **ITEM VALIDE** — **procurement déjà formé** (`06-nodies.md:43-47`), non utilisé comme fait. Conforme Dettes. |

**Bilan** : 6/7 sont des items proprement formés (déclencheur / procurement / déclaration) ; **item 2 = seule dette** (→ C-G2-1).

---

## Provenance
- Réviseur : worker G2 relecteur, `claude-opus-4-8[1m]`, effort max, 2026-09-21.
- Méthode : re-exécution intégrale (suite 565/565, ci vert, R-25=440, 13 mutants byte-exact, 4 evals ciblés, greps scopés worktree). Aucune écriture au dépôt, aucun réseau, aucun `npm install`.
- Artefacts scratch : `F:\tmp\g2-pool1a\{test-run.log, ci-run.log, r25.txt, run-mutants.mjs, base-ukemi\}`.
- Consultation ADVISOR : 1 (avant campagne mutants + point 9) — avis intégré, verdict rendu par ce relecteur (R-26 : conseil, jamais verdict).
- sha256 de ce document : à recomputer par l'orchestrateur (point fixe, non embarqué). R-21 : à vérifier adversarialement avant consommation.
