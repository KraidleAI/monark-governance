# G2 UKEMI-RETRY-1 (relecteur Opus 4.8) — PASS-AVEC-CORRECTIONS

All complete and durable. Clone git status shows only `?? G2.md` (untracked — no commit, R-20); golden `record.ts` intact (afa20f8c); F:\Monark and the worker's worktree untouched by me. Evidence artifacts persist in the scratchpad; G2.md is durable at `F:\tmp\g2-ukemiretry1\G2.md`. Both advisor calls were made; the second caught the stale-tip trap, now corrected against the true HEAD `db4bb4f`.

Here is the integral rendu.

---

Modèle résolu : claude-opus-4-8[1m]

# G2 — Lot UKEMI-RETRY-1 (`lot/ukemi-retry-1` @ `93cc83f`) — relecteur Opus 4.8 (contexte frais)

**Verdict : PASS-AVEC-CORRECTIONS** (liste fermée ; corrections DOCUMENTAIRES ; aucun défaut de code).

- **Relecteur** : `claude-opus-4-8[1m]`, effort max (R-1, préfixe `claude-opus-4-8` vérifié ; Opus 5 banni). Aucun commit / aucun workflow (R-20). Instance séparée, contexte frais ; aucune sortie du checkpoint-2 lue ; aucun chiffre G1 repris sans re-mesure (R-21).
- **Indépendance imposée** : clone `git clone --no-hardlinks --branch lot/ukemi-retry-1 F:\Monark F:\tmp\g2-ukemiretry1` (@ `93cc83f`) ; `node_modules` isolé par `mk-nm.ps1` ⇒ 220 entries, 10 @monark, 0 fail, `@monark/rpc-guard` résolu SOUS le clone. Oracle + mutants re-joués ICI sous **`env -u` des 8 clés** payantes, TEMP/TMP/TMPDIR=F:/tmp. Innocuité : worktree worker `F:\Monark-wt-ukemiretry1` intact (record.ts `afa20f8c`), `F:\Monark` propre (avancé par l'orchestrateur, pas par moi).

## Vérifications (1)-(8) — toutes re-exécutées

**(1) Diff exact + gel 9/9 + record.ts hors gel — CONFORME.** `git diff --name-status 831a87b..HEAD` = exactement 3 fichiers (`M record.ts` 17/7, `M ukemi-guard-record.test.ts` 101/6, `M ADR-U4b` 97/0). `rpc.ts` + `packages/rpc-guard/**` byte-identiques (diff vide, INTOUCHÉS). Gel : recompute LF des 9 fichiers concordant **ligne à ligne au prereg §2 canonique** (`2f9a31f6/a5e66cd3/5733daeb/7bee76fc/3376eb08/9206df91/0e232519/3603265d/cb020425`), aucun écart. `record.ts` **hors gel** : 3 confirmations (prereg §2 absent ; ADR §3 l.133 verbatim « `record.ts`/`rpc2.ts` hors du gel » ; ADR amendement §1). DELIVERED.sha256 : 3/3 dépôt égaux (`afa20f8c`/`3f0dd6a3`/`1b49f4a9`), LF pur.

**(2) Prédicat du shim `record.ts:328-356` — CONFORME [lu].** `transient = ... || (NonJsonBody && code!==undefined && (200 || 429 || >=500)) || (HttpError && (429 || >=500))` ⇒ NonJsonBody transitoire ssi code ∈ {200,429}∪[500,∞) ; 201/204 et 400/404 FATALS (matrice, M2/M3/M7 rouges). Borne + backoff **INCHANGÉS** (ligne de CONTEXTE du diff ; mon **V1** `<`→`<=` rougit ⇒ borne bien `<`). Défaut `--retries`=2 (`:165`). Libellé bras `NonJsonBody` avant générique, **sans champ `http`** (V2 `+http` et V3 arm-inaccessible rougissent A-8). Write-ahead R+1 (épuisement : `attemptedLines=3` sous `--retries 2`).

**(3) A-8 rejoué (VRAI `openGuardedClient`, seul `globalThis.fetch` bouchonné) — CONFORME, non-vacuous.** Baseline GREEN ; HTML 502 @200 ⇒ retry ⇒ passe CONTINUE, `book_digest` = **PIN `034fbff9…`**, `rpc_errors` = un `{chainstack, eth_getBlockByNumber, "non-json 200", http:undefined, code:undefined}`, chainstack ≥ 2×. **M1 ⇒ A-8 ROUGE, mécanisme capturé à la main** : `error: 'finalized: quorum needs 2 providers'`. Explication : clause ôtée ⇒ NonJsonBody@200 non transitoire ⇒ jeté ⇒ read finalized quorum-2 **BENCHE** chainstack ⇒ à 2 opérateurs seulement, 1 jambe < 2 ⇒ NoQuorum ⇒ rejet. La **famine est INDUITE par la topologie 2-opérateurs** du test (rend le retry observable), conforme à la note d'honnêteté (G1 §9 / ADR §4) : en course réelle {drpc,mevblocker,pocket}+chainstack un blip isolé BENCHE sans STOP. Non-vacuous.

**(4) Mutants — 7 worker + 4 miens — CONFORME.** Re-joués sur MON clone (`mutants.mjs` copié, `CWD` re-pointé sur le clone — l'original était câblé sur le worktree worker), golden `afa20f8c`, env -u, baselines vertes, restauration byte-exacte. Worker : **M1..M7 ROUGES** (7/7), exit 0. Miens (`g2-mymutants.mjs`) sondent ce que les 7 ne couvrent pas : **V1** borne off-by-one `<`→`<=` (épuisement 4≠3, plus fin que M4) ROUGE ; **V2** fuite `http:e.code` au journal ROUGE (A-8) ; **V3** bras de journal inaccessible ⇒ message `NonJsonBody` nu ROUGE (A-8) ; **V4** `>=500`→`>500` **SURVIVANT DÉCLARÉ** (aucun test servi n'atteint NonJsonBody@500 ⇒ documente R-U-3, comme le V4 de Bell). `ALL_AS_EXPECTED=true`, golden intact.

**(5) D-4 migration de couverture — SAINE.** Cas `"html"`@200 retiré de la boucle fatale `["rpc","400","html"]`→`["rpc","400"]` : il assertait EXACTEMENT le contrat inversé par ce lot (le garder ferait échouer le test) ; couverture MIGRÉE vers 3 tests plus forts (matrice 200⇒retries+1 / 201/204/400/404⇒1 ; épuisement borné + journalisation). Assertions 503-retenté et rpc/400-fatal RETENUES. Migré = `ok 367`, neufs = `ok 380/381/382`.

**(6) Oracle env -u + fusion à blanc — CONFORME.** Oracle re-exécuté (clone, env -u des 8 clés) : `gate:vocab/typecheck/lint/lint:ratchet/lang:gate/export:check` **exit 0** ; `test` (TAP) = **870/869/0/1**, exit 0, **0 `not ok`**. Skip = `u4b_labels_replay_via_main_real_artifact # SKIP real e2 artifacts absent` (pré-existant, gitignored, non touché). **Fusion contre le VRAI HEAD** : etude-suite a avancé pendant la session (`56cee5b`→**`db4bb4f`**) ; `git fetch` puis re-mesure contre `db4bb4f` (le `origin` du clone était périmé — corrigé). `merge-tree --write-tree db4bb4f HEAD` : **UNE seule collision** — l'append `ADR-U4b`. Intersection (theirs-changed ∩ nos 3 fichiers) = {ADR-U4b} ; `record.ts`/test diff base→`db4bb4f` **VIDE**, **9/9 gelés intacts** au vrai tip. C'est un **append-vs-append** (divergence au même point `@@ -449,3 +... @@`) ⇒ l'union (les deux sections, chacune une fois) préserve tout, sans perte — l'attendu de la mission. **NB** : BELL-RETRY-1 déjà fusionné (`4db059e`, G7 `b9b207b`) ⇒ post-fusion Bell+Ukemi disjoints ; le décompte combiné (≥901 côté Bell G7) est la mesure G7 de l'orchestrateur, pas l'oracle du lot. R-25 = **131** (pathspec `ci.yml:65` verbatim, ADR exclu) < 300 ; **0** non-ASCII ajouté au code.

**(7) Items R-U-1..3 — jugés contre le VRAI tip (`db4bb4f`, Bell fusionné). R-BR3/R-BR4 EXISTENT bien (mission correcte).** [lu] `G7-lot-bell-retry-1.md:15`, `ADR-GARDE-HELIUS:1022-1023` : **R-BR3 = `universe.ts:113` (`withUniverseRetry`)**, **R-BR4 = `ethereum.ts:77` (`makeGuardedEthCall`)** — deux items **côté BELL**. (Je les avais d'abord cherchés sur l'arbre de base périmé ; corrigé après fetch.)
- **R-U-1 — EFFECTIVEMENT RÉSOLU au vrai tip.** Bell fusionné a révisé la clause 2b/:502/:728 ; l'item `GARDE-HELIUS-2b-migration` prescrit DÉJÀ le recorder cible (« `NonJsonBody` à 200/429/>=500 retry borné/métré, JAMAIS 2xx≠200/4xx≠429 ») = exactement le prédicat livré ⇒ **aucune contradiction** ; pas de 2e amendement requis ⇒ l'orchestrateur peut **clore R-U-1**.
- **R-U-2 — ITEM À DÉCLENCHEUR, PAS une précondition ; ET recoupe R-BR3.** La course FIGÉE n'emploie `--with-chainstack` sur AUCUNE ligne ⇒ prober `u4-oracle-path.mjs` (retries:3, jambe payante gardée par `--with-chainstack`), `u4b-discover`, `--check-version`/`--fill-ts` (`u4b-select-episode.mjs` keyless, `assertKeylessOperators`) tournent **KEYLESS** ⇒ un NonJsonBody@200 y est keyless, re-jouable, ne corrompt pas le recorder payant ⇒ **item**, pas précondition (discriminant vs UKEMI-RETRY-1 qui EST la course payante). **Recoupe** : le bras `universe.ts:99,114` de R-U-2 duplique **R-BR3** (`universe.ts:113`) ⇒ narrower R-U-2 à **`u4-guard.mjs` seul** (qu'aucun R-BR ne couvre) et déférer `universe.ts` à R-BR3. **Correction de trigger (calque C-3)** : « 1re occurrence » ré-admet le défaut C-3 ; à durcir en nommant la frontière « **OU l'ajout de `--with-chainstack` à un step u4-guard de la course** ». **Dérive** : la réf ADR `u4-guard.mjs:120` est `:136` au vrai tip.
- **R-U-3** confirmé empiriquement par mon **V4 survivant**. Formé avec déclencheur.

**(8) `errors_by_operator` (5%-rule) — sémantique consignée, effet borné VÉRIFIÉ.** Le hook transport (`record.ts:318`) incrémente `errByOp` à CHAQUE faute ⇒ un NonJsonBody@200 retenté l'incrémente R+1 fois (3 entrées à l'épuisement). **[lu, grep repo-wide] aucun consommateur-gate** : dans `record.ts` `:399`/`:488` stderr, `:414`/`:443` provenance, `:474` diag — aucun `if`/`throw`/seuil ; le « monitor 5%-rule » est une lecture HUMAINE du champ, pas une garde-code ; Bell `collect.ts:669` a son propre `errByOp` (chemin distinct). Claim « affichage/provenance/diag SEUL » tient **transitivement**. Consigné à l'ADR §3.

## ADR amendement (append pur) — CONFORME
`git diff 831a87b HEAD` sur l'ADR = **+97/−0** (0 suppression, hunk en fin de fichier) ⇒ append pur, aucune valeur de sha de référence éditée ⇒ recompute prereg §2 reste vrai ; docs exclus R-25. Contenu bien formé : header « PRÉCONDITION … jamais 1re occurrence », §1 gel (9 sha = mesure), §2 **note de dérive +10 de §5a** (prereg sha-lié donc NON édité — exigence tenue), §3 Tuyaux+coût+errByOp, §4 honnêteté du STOP (quorum-2 bench/famine), §5 R-U-1..3.

## Corrections (liste fermée — DOCUMENTAIRES, aucun défaut de code)
- **CG-1** (trigger, R-U-2) : nommer la frontière `--with-chainstack` dans le déclencheur. Propriétaire : orchestrateur.
- **CG-2** (recoupe R-BR3) : narrower R-U-2 à `u4-guard.mjs` seul ; déférer `universe.ts` à R-BR3 (déjà formé, Bell `4db059e`).
- **CG-3** (dérive de ligne) : réf ADR `u4-guard.mjs:120` → `:136` au vrai tip ; corriger au fold.
- **CG-4** (formulation) : « le STOP exact » (G1 §3 M1, commentaire `mutants.mjs`, commentaire test) est exact sur la CLASSE (bench→famine→NoQuorum) mais la famine est induite par la topologie 2-opérateurs ; l'honnêteté est en G1 §9 / ADR §4 — cohérent, à préciser au rapport de passe.
- **CG-5** (clôture positive) : **R-U-1 résolu au vrai tip** ⇒ le noter satisfait au G7.

## Décision G2 : **PASS-AVEC-CORRECTIONS**
Code correct et byte-vérifié ; oracle 870/869/0/1 re-exécuté (env -u) ; 7+4 mutants conformes (dont 1 survivant déclaré R-U-3) ; gel 9/9 intact au vrai tip ; diff minimal 3 fichiers ; fusion propre contre le vrai HEAD (seul l'append ADR attendu) ; R-25 131 ; ASCII 0 ; DELIVERED 3/3 ; A-8 non-vacuous ; D-4 saine ; items formés ; errByOp consigné. Les 5 corrections (CG-1..CG-5) sont documentaires (aucune ne touche le code livré ; CG-5 est positive). Divergence G7/checklist ou refus contesté ⇒ ESCALADE-INVESTISSEUR ; aucune question investisseur nouvelle.

**Fichiers** : rendu `F:\tmp\g2-ukemiretry1\G2.md` (intégral, durable) ; preuves `F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad\{g2-mutants.mjs, g2-mymutants.mjs, g2-oracle-test.log}` ; clone sous `F:\tmp\g2-ukemiretry1\`.

Modèle résolu : claude-opus-4-8[1m]
