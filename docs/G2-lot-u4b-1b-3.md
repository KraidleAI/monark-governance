# G2 U-4b-1b-3 (801859f) — PASS-AVEC-CORRECTIONS

La mission G2 est complète. Tous les items de mission (diff, science D-1, sidecar/reprise, 0-fetch, mutants, oracle, R-25, branchement, amendement ADR) sont vérifiés sur le clone indépendant `F:\tmp\g2-u4b1b3\tree` @ `801859f`, les preuves persistées, et le rendu écrit dans `F:\tmp\g2-u4b1b3\G2.md`. Fichiers pertinents (chemins absolus) : `F:\tmp\g2-u4b1b3\G2.md`, `F:\tmp\g2-u4b1b3\g2-demo-tests.ts`, `F:\tmp\g2-u4b1b3\mutants-g2clone.mjs`, `F:\tmp\g2-u4b1b3\mutants-g2own.mjs`, `F:\tmp\g2-u4b1b3\g2-oracle-test-full.log`, `F:\tmp\g2-u4b1b3\g2-oracle-test-full2.log`.

Rendu intégral (identique au fichier G2.md) :

Modèle résolu : claude-opus-4-8[1m]

# G2 — Lot U-4b-1b-3 (`--fill-ts`/sélecteur borné à `to_block` + sidecar INCRÉMENTAL reprenable) — relecteur Opus 4.8, contexte frais

R-1 : modèle résolu tel quel `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme ; Opus 5 banni). R-20 : aucun commit, aucun workflow (clone throwaway, restauré byte-exact après chaque mutant ; verdict à l'orchestrateur). R-21 : chiffres reproductibles, chemins absolus, tout oracle sous `env -u` des 8 clés payantes.

**VERDICT G2 : PASS-AVEC-CORRECTIONS.** Le code est correct, la science D-1 fidèle à §DISC:44 (fail-closed), l'oracle vert (926/925/0/1 en relance propre = exactement la prédiction de mission), les 8 mutants G1 rejoués ROUGES, A-6/R-25/branchement satisfaits, l'amendement ADR bien formé. **Trois** de mes cinq mutants (dont 3 des 4 nommés par la mission) SURVIVENT : les gardes fail-closed du chemin RESUME de `--fill-ts` et le flush incrémental « tous les 50 » sont revendiqués mais NON testés. Corrections nommées ci-dessous (complétude de tests, non correction de correction) — chacune démontrée fermable (tests écrits qui passent sur le golden et rougissent le mutant).

Environnement : clone `F:\tmp\g2-u4b1b3\tree` @ `801859f` (`git clone --no-hardlinks --branch lot/u4b-1b-3 F:\Monark`), node_modules isolé par `mk-nm.ps1` (`entries: 220 monark: 10 fail: 0`). **A-2** : `require.resolve('@monark/rpc-guard')` → `F:\tmp\g2-u4b1b3\tree\packages\rpc-guard\src\index.ts` (le clone, PAS `F:\Monark`). Node v24.15.0.

---

## 1. Diff exact + gel U-4b (A-6) — CONFORME

**Diff = 3 fichiers SEULEMENT** (`git diff 801859f^ 801859f`, == `git diff lot/etude-suite...HEAD`, merge-base = `b900b4b`) :
- `scripts/census/u4b/u4b-select-episode.mjs` (65 = 50+/15−)
- `scripts/census/u4b/u4b-select-episode.d.mts` (13 = 12+/1−)
- `apps/sentinel/test/u4b-select-episode.test.ts` (143 = 142+/1−)
- Total **204 insertions / 17 suppressions** (per-file `git diff --numstat 801859f^ 801859f`, mesuré G2, non recopié).

**DELIVERED.sha256 concorde byte-exact avec le clone** : mjs `896858e6…835c9e`, d.mts `4c7de9f2…ef2560`, test `fce78c16…1ac4e`. (3/3.)

**A-6 gel — satisfait par construction** : le diff ne touchant QUE ces 3 fichiers, tout le reste est byte-identique au parent `b900b4b` (= merge-base avec `lot/etude-suite`). Recompute LF (régime B, blobs HEAD) : `liquidation-logs.mjs` `bf4eb293…c193b`, `windows.ts` (`apps/sentinel/src/windows.ts`) `b84827ae…161c1`, `u4b-scores` `2f9a31f6…445c0`, `u4b-reduce` `a5e66cd3…6fac0` — **concordants au prereg §2** et à l'ADR (déc.126 §3). `firstBlockAtOrAfter` et `clusterWethLiquidations` INTOUCHÉS : le clamp vit entièrement dans les fermetures `tsOf` injectées par `u4b-select-episode.mjs` (hors gel). **Prereg** `docs/PLAN-u4b-prereg.md` sha `1971d9b1…892f49` (NON modifié). PAS de STOP A-6.

## 2. Science D-1 (borne `to_block`) — À JUGER → **FIDÈLE à §DISC:44, fail-closed CORRECT**

§DISC:44 pré-enregistré (lu, prereg:44) : `B_last <= B_hi # fenêtre 24h COMPLÈTE ; sinon window_truncated`. Analyse au code gelé :
- `clusterWethLiquidations` (`liquidation-logs.mjs:74`) pose `b_last = firstBlockAtOrAfter(ts(B_first)+86400, B_first, B_first+60000, tsOf) − 1`.
- `firstBlockAtOrAfter` (`windows.ts:50`) rend le PREMIER bloc de `[lo,hi]` à `ts >= target` (sinon `hi`).
- Avec `tsOf(block > toBlock) = +Infinity` : pour un cluster de fin de plage dont la frontière 24 h réelle `F` est `> to_block`, tout `mid <= toBlock` a `ts < target` (`lo=mid+1`) et tout `mid > toBlock` rend `+Inf >= target` (`hi=mid`) ⇒ la recherche **converge à `to_block+1`** ⇒ **`b_last = to_block`** (borne `hi = B_first+60000 > to_block+1` pour un cluster de fin, sinon le clamp n'agit jamais).
- Troncature étendue : `if (!(c.b_last <= bHi) || c.b_last >= toBlock) reasons.push("window_truncated")`. Comme le clamp plafonne `b_last <= to_block`, `b_last >= toBlock ⟺ b_last == toBlock ⟺ F > to_block`.

**Le SEUL basculement `complete → window_truncated` (vs l'idéal non-borné) est la frontière EXACTE `F == to_block+1`** (fenêtre finissant pile à `to_block`) : depuis la donnée observable `[.., to_block]`, les cas `F == to_block+1` (complète) et `F > to_block+1` (tronquée) sont **INDISCERNABLES** (tout bloc `<= to_block` a `ts < target` dans les deux). Choix **fail-closed** correct : ne pas servir une fenêtre dont la complétude n'est pas confirmable ; remède = étendre `to_block` (re-`discover`). Conforme à l'intention §DISC:44 (ne servir que des 24 h COMPLÈTES observées).

**Contrôles de non-régression (vérifiés) :**
- `--b-hi < to_block` : le terme D-n est INERTE — `b_last >= toBlock > bHi ⇒ !(b_last <= bHi)` déjà vrai ; §DISC:44 exactement préservé. Le clamp est chirurgical (ne mord qu'au défaut `b_hi = to_block`).
- `episode = argmin B_first` (§DISC:49) : un cluster de fin de plage (grand `B_first`) n'est gagnant QUE s'il est le seul éligible ⇒ **épisode servi inchangé** sauf « dernier cluster unique éligible ». Test `…window_truncated_offline_0_fetch` confirme : gagnant = cluster précoce (23 700 000), pas le tronqué.
- **Aucune valeur pinnée affectée** : `grep selection_sha256` (docs/scripts, hors test) ne révèle AUCUN hash d'épisode pinné (seulement le nom de champ/concept) ; le `--fill-ts` réel n'a jamais complété (G1). Les 18 tests u4b pré-existants restent VERTS (fixture `makeDiscover` : B4 reste `window_truncated`, aucune assertion affaiblie).

## 3. Sidecar incrémental / reprise — CORRECT (code) ; RESUME sous-testé (→ C-G2-1)

Logique lue et validée : `flush(phase)` réécrit `{schema, phase, discover_sha, n_extra, block_ts_extra, block_ts_extra_sha256}` ; `tsOf` incrémente `sinceFlush` UNIQUEMENT sur un fetch neuf, flush `partial` à 50, catch → `partial`, fin → `complete`. RESUME : `Object.assign(extra, prevExtra)` après 3 gardes (prevExtra-objet, self-sha, discover_sha). `runSelect` refuse `phase !== "complete"` (`phase` absent accepté).

- **Kill@61 / reprise (`…incremental_and_resumable_after_a_quorum_kill`)** : VERT — partial durable `n_extra==60`, self-sha valide, reprise `complete`, **re-fetch == nExtra−60** (les 60 cachés). Mécanique confirmée (stub `failAfterDistinct:60`, quorum-2, dédup Set).
- **`complete` accepté / `partial` refusé (`…select_accepts_and_select_refuses_a_partial`)** : VERT — flip `complete→partial` (mêmes données+sha) refusé nommément.
- **429 transitoire toléré (`…tolerates_a_transient_429…`)** : VERT — quorum-2 tenu via `makeGuardedPoolCall({retries:2})`.
- **Idempotence `complete` = 0 fetch (mission §3, revendiquée G1 §9b, NON pinnée par un test livré)** : VÉRIFIÉE ad-hoc (test G2 jetable `g2_fill_ts_rerun_on_complete_is_idempotent_zero_fetch`, `env -u`) — relance sur `complete` : `distinct.size===0`, `phase==="complete"`, même `n_extra`. PASSE. (À pinner → C-G2-1.)

## 4. 0 fetch au-delà de `to_block` / D-3 — CONFORME
- Offline (`…window_truncated_offline_0_fetch`) : `fetches==0`, `b_last==to_block`, `reasons==["window_truncated"]`, `eligible==false`, `window_truncated==1`. VERT.
- `--fill-ts` (`…0_fetch_past_to_block`) : `phase==complete`, **`maxQueried() <= to_block`**, `nExtra>0`. VERT.
- **D-3** : seul `globalThis.fetch` bouchonné (les tests passent `runFillTs`/`runSelect`/`makeUkemiPool`/`openU4GuardedClient` RÉELS, `deps={env:{},now}`). A-8 : corps `eth_getBlockByNumber` de forme réelle (`{hash,number,timestamp}` hex ; bloc inexistant = `result:null`).

## 5. Mutants — 8 G1 (rejoués, clone indépendant) + 5 G2

**8 mutants G1** rejoués sur `F:\tmp\g2-u4b1b3\tree` (harness re-pointé sur le clone) : `BASELINE_OK=true ALL_RED=true ALL_RESTORED=true FINAL_GOLDEN_INTACT=true n=8`, golden `896858e6…` intact. M1..M8 tous baseline=GREEN → mutant=RED → restored=OK.

**5 mutants G2** (fichier complet u4b sous `env -u`, un survivant = trou de couverture) :

| # | substitution | attendu | mesuré |
|---|---|---|---|
| G2-M1 | troncature `>=`→`>` (`c.b_last > toBlock`) | RED | **RED** (2 tests : `…window_truncated_offline_0_fetch` + le pré-existant `u4b_episode_selection_is_deterministic` via B4) — borne DOUBLEMENT pinnée |
| G2-M2 | flush « tous les 50 » désactivé (`if (false)`) | ? | **SURVIT (vert)** — le kill test s'appuie sur le catch-flush ; le flush à 50 (durabilité HARD-kill) n'est jamais le chemin porteur |
| G2-M3 | garde RESUME `discover_sha` neutralisée | ? | **SURVIT (vert)** — aucun test ne rejoue une reprise inter-brut |
| G2-M4 | `runSelect` compat `!== undefined` retirée | ? | **SURVIT (vert)** — la branche « sidecar sans `phase` accepté » n'est pinnée par aucun test |
| G2-M5 | garde RESUME self-sha neutralisée | ? | **SURVIT (vert)** — aucun test ne rejoue une reprise sur partial corrompu |

Note : G2-M2/M3/M4 correspondent aux 3 mutants explicitement suggérés par la mission (« flush tous les 50 → jamais », « reprise avec `discover_sha` différent acceptée », « `phase` absent traité comme complete ») — leur survie est la découverte demandée. G2-M1 (« clamp `>=` vs `>` ») rougit, la borne est solide.

**Preuve de fermeture (R-21)** : j'ai écrit 3 tests jetables mirroring les gardes runSelect existantes sur le chemin RESUME. Sur le golden : `g2_fill_ts_resume_refuses_a_corrupt_partial_self_sha` PASSE, `g2_fill_ts_resume_refuses_a_partial_from_another_brut` PASSE, `g2_fill_ts_rerun_on_complete_is_idempotent_zero_fetch` PASSE. Sous mutant : le 1ᵉʳ ROUGIT G2-M5, le 2ᵉ ROUGIT G2-M3. Golden restauré byte-exact, copies supprimées, arbre propre.

## 6. Oracle complet (A-3, exits directs, `env -u` des 8 clés) — VERT en relance propre

6 gates rapides : `gate:vocab`, `typecheck` (`tsc --noEmit`), `lint` (`eslint .`), `lint:ratchet`, `lang:gate`, `export:check` — **tous exit 0**.

Suite de tests (`npm test`), DEUX exécutions rapportées honnêtement :
- **Run 1** : `tests 927 / pass 925 / fail 1 / skip 1`, exit 1. L'unique « fail » = `apps/harness/test/server.test.ts` sur `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76` — **assertion C de libuv au teardown Windows**, PAS une assertion de test JS ; TOUS les sous-tests de `server.test.ts` sont ✔ (dont `harness_server_drain_leaves_no_server_handle` juste avant). Le lot ne touche JAMAIS `apps/harness`.
- **Run 2** : `tests 926 / pass 925 / fail 0 / skip 1`, **exit 0**, aucune assertion UV — **= exactement la prédiction de mission (926/925/0/1)**.
- `server.test.ts` isolé : **3/3 exit 0, 0 hit UV**.

⇒ Flake de teardown libuv Windows sous concurrence pleine-suite, **non reproductible, non lié au lot** (voir observation O-1). **1 skip** nommé pré-existant : `u4b_labels_replay_via_main_real_artifact` (« real e2 artifacts absent / gitignored »).

**Fusion à blanc** (`git merge --no-commit --no-ff origin/lot/etude-suite` @ `42f94f6`) : **0 conflit** (seul `docs/G1-lot-u4b-1b-3.md` s'ajoute ⇒ arbre de CODE byte-identique à `801859f`). Sur l'arbre fusionné : `gate:vocab` exit 0 + `lang:gate` exit 0 (les 2 gates qui scannent `.md`, seuls affectables par le fichier ajouté) + **`npm test` 926/925/0/1 exit 0** (0 hit UV) ; merge aborté, `HEAD=801859f`, arbre propre.

## 7. R-25 — CONFORME
Pathspec `ci.yml:65` VERBATIM (exclut `docs/**/*.md`, fixtures, package-lock ; les 3 fichiers du lot NON exclus — le `.test.ts` n'est pas sous `fixtures/`), `801859f^...HEAD` : **`3 files changed, 204 insertions(+), 17 deletions(-)` = 221 lignes**. Borne réelle **`VIBEGATES_PR_LIMIT=1205`** (`ci.yml:43`, R-23) — PAS 1150 (valeur du texte de mission ; 221 passe des deux). `mutants.mjs`/`G1.md`/`ADR-amendement.md` sous `F:\tmp` (hors R-25).

## 8. Branchement (CA-11) — RÉEL et testé (finding G2 ; verdict CA-11 = siège validateur)
La sortie du sidecar `block-ts-extra.json` est consommée par `runSelect --block-ts-extra` — **seul consommateur** (`grep block_ts_extra` hors test/hors sélecteur = VIDE, confirme R-BORNE-1). Composition `--fill-ts → block-ts-extra.json → runSelect` couverte par le test d'intégration **non-LLM** `u4b_fill_ts_writes_complete_which_select_accepts_and_select_refuses_a_partial` (fill-ts écrit, select consomme réellement ; refus réel d'un partial). Chaîne aval servie : `runSelect` → `episode-selection.json` → `u4-oracle-path.mjs` (vérifie `selection_sha256`). **Note honnête** : le `--fill-ts` n'a jamais complété sur la course réelle ⇒ ce tuyau de production n'est à ce jour exercé qu'en test (pas une fixture morte : c'est un chemin servi couvert par un test non-LLM, conforme à la règle Branchement).

## 9. Amendement ADR-U4b (`F:\tmp\u4b1b3\ADR-amendement.md`) — BIEN FORMÉ
- **Numéro de décision** : correctement DÉFÉRÉ à l'orchestrateur. « D6 » et « D-6 » sont réellement DÉJÀ pris dans l'ADR (`:106` « indice fermé D6 » ; `:293` « delta D-6 »), sens distincts — la désambiguïsation est un item formé légitime, pas un défaut.
- **Tuyaux** : table entrée/sortie/état/test présente. **Gel D4** déclaré intact (vérifié §1). Constat mesuré (course 17:01-17:24, 3 STOP `malformed block`, ~36 k appels perdus) cohérent avec le journal et le code (`rpc2.ts` `asBlock` sur `null`).
- **R-BORNE-1** (`phase` hors `block_ts_extra_sha256`) : **item formé ACCEPTABLE, pas un défaut.** La SÛRETÉ est réelle — aucune sélection fausse n'est jamais produite : `complete→partial` est attrapé par la garde `phase` (prouvé par M6) ; **`partial→complete` est attrapé par le refus nommé `no ts` de `tsOf` DANS `reduceSelection`** (un partial authentique manque toujours ≥1 bloc nécessaire, car `flush("complete")` ne s'écrit qu'après clustering complet) — ou est inoffensif si les données sont de fait complètes. Précision demandée : nommer ce mécanisme (« no ts » offline), le texte du résidu (« refus nommé de runSelect ») est correct mais ambigu sur la DIRECTION ; le déclencheur (consommateur futur hors runSelect ⇒ lier `phase` sous un sha) est bien formé.

---

## CORRECTIONS (PASS-AVEC-CORRECTIONS)

**C-G2-1 — Pinner les gardes fail-closed du chemin RESUME de `--fill-ts` + l'idempotence.** Les 3 gardes de reprise (prevExtra-objet, self-sha, discover_sha) et l'idempotence-sur-`complete` (revendiquée G1 §9b) ne sont couvertes par AUCUN des 5 tests livrés ; **G2-M3 et G2-M5 survivent la suite complète**. Sévérité différenciée : **G2-M5 (self-sha) est MATÉRIEL en correction** — un partial falsifié (ts factices) amorce `extra` ⇒ clustering faux ⇒ épisode faux ; **G2-M3 (discover_sha) est HYGIÈNE** — `bloc→ts` étant global-chaîne, un partial inter-brut donne des ts CORRECTS, la garde empêche de mélanger des runs, pas des données fausses. Remède : 3 tests (les 2 refus RESUME mirroring `u4b_select_refuses_a_tampered_block_ts_extra_sidecar` / `…from_another_brut` sur la reprise + l'idempotence) — **démontrés passants sur le golden et rougissant G2-M5/G2-M3** (§5).

**C-G2-2 — Le flush incrémental « tous les 50 » n'est pas testé (G2-M2 survit).** Le kill test simule un arrêt LANÇABLE (le catch-flush l'absorbe) ; désactiver le flush à 50 ne change rien sous le test. Or la raison d'être du flush à 50 est la durabilité HARD-kill (SIGKILL/crash, catch NON exécuté). Options : (a) **test in-process** — le stub `fetch` fait `existsSync+readFileSync` au 51ᵉ bloc distinct et assert un `partial` `n_extra==50` DÉJÀ sur disque (déterministe, rougit G2-M2, le moins cher) ; (b) SIGKILL sous-processus entre deux flushes (précédent NARABI-OPS-1d, trace Linux sous docker) ; ou (c) **réduire la revendication ADR** « tous les 50 » et former un résidu documenté + déclencheur. Recommandation : (a).

**C-G2-3 (mineure) — Pinner (ou noter) la compat sidecar `phase` absent (G2-M4 survit).** Aucun test ne fixe la branche « sidecar sans `phase` accepté » (`runSelect:212`). C'est un calque délibéré de `assertBrutComplete` (`:165`, C-V-9(ii), docstring « a phase-absent brut is accepted »), dont la branche brut-absent EST testée (tout brut `makeDiscover` sans `phase`). Faible sévérité : un test « runSelect accepte un sidecar sans `phase` », ou une note « compat legacy intentionnellement non pinnée ».

## OBSERVATIONS (non-corrections)
- **O-1 (flake plateforme)** : `UV_HANDLE_CLOSING` (`src\win\async.c:76`) dans `server.test.ts` au teardown pleine-suite Windows — non reproductible (run 2 propre + isolé 3/3), non lié au lot. L'orchestrateur doit savoir qu'il peut réapparaître sur Windows en pleine-suite ; une relance le lève. NON un défaut du lot.
- **O-2 (info)** : `VIBEGATES_PR_LIMIT=1205` (pas 1150 du texte de mission) ; 221 passe.

## Fichiers (rendu G2, `F:\tmp\g2-u4b1b3\`)
- `G2.md` — ce rapport.
- `mutants-g2clone.mjs` — harness des 8 mutants G1 re-pointé sur le clone (rejoué `ALL_RED=true`, golden `896858e6…` intact).
- `mutants-g2own.mjs` — harness des 5 mutants G2 (G2-M1 RED ; G2-M2/M3/M4/M5 SURVIVENT ; fichier complet sous `env -u`).
- `g2-demo-tests.ts` — les 3 tests de fermeture C-G2-1 (input implémenteur, à insérer dans `apps/sentinel/test/u4b-select-episode.test.ts` au tour de correction) : passants sur le golden, `…self_sha` rougit G2-M5, `…another_brut` rougit G2-M3, `…idempotent…` pinne §9(b).
- `g2-oracle-test-full.log` (run 1, flake UV O-1) / `g2-oracle-test-full2.log` (run 2, 926/925/0/1 exit 0).
- Clone : `F:\tmp\g2-u4b1b3\tree` @ `801859f`.

## Provenance
Relecteur `claude-opus-4-8[1m]` (effort max), 2026-09-22, contexte frais. Clone `F:\tmp\g2-u4b1b3\tree` @ `801859f`. Oracles/mutants sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`. Aucune écriture dans `F:\Monark`/`F:\Monark-wt-*` ; golden `896858e6…835c9e` restauré et vérifié après chaque mutant ; 0 commit, 0 workflow (R-20). Rendu identique en réponse finale + `F:\tmp\g2-u4b1b3\G2.md`.
