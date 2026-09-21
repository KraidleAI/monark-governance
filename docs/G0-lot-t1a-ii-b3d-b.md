# G0 — Sprint backlog sous-lot Bell T-1a-ii-b3d-b (PLI checkpoint-1 : source pliée, deux sous-lots b1a/b1b, course SUSPENDUE, b2 conditionnel)

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, Opus 4.8 1M, non banni, effort max ; source = identité d'exécution de la session). **R-20** : ce worker ne committe pas, ne déclenche aucun workflow ; l'orchestrateur committe. **R-21** : chaque `fichier:ligne` cité a été VÉRIFIÉ en ouvrant le fichier ce tour (liste au §PLI checkpoint-1). **AUCUN appel réseau dans ce tour** (ni Helius ni Chainstack) ; aucune clé/URL/uuid ; aucune valeur de close ; rien sur C:. Écrit en scratch (`F:\tmp\bellb3d\pli-cp1\G0-lot-t1a-ii-b3d-b.md`), dépôt `F:\Monark` (branche `lot/etude-suite`, HEAD `3aaf094`) en LECTURE SEULE.

**Provenance de ce pli.** Base = le G0 source `docs/G0-lot-t1a-ii-b3d-b.md` au commit **`5c1c44d`**, sha256 **`3f9a836666b0f313d6d0e149ce532be71161576b185e81a0bc8aabf15d132c74`** (recomputé ce tour, `git show 5c1c44d:… | sha256sum` == working-tree). Ce pli intègre l'**avis checkpoint-1 du validateur-humain** (`claude-fable-5-1`, 2026-09-21 02:07→02:20 UTC ; rejeu AM-2 ter sous `F:\tmp\cp1-b3d-b\` : `h1.ts`, `replay.test.ts`) : décision **SCINDÉE** — **-b3d-b1 ACCEPTE-AVEC-CORRECTIONS (9 bloquantes C-B-1..9)** ; **course SUSPENDUE** ; **-b3d-b2 ACCEPTE-AVEC-CORRECTIONS conditionnel** ; **ordre R1 / -b3d-b2 = ESCALADE-INVESTISSEUR (EN ATTENTE)**. Le pli persiste aussi dans `docs/CHECKPOINT1-lot-t1a-ii-b3d-b.md` (format `docs/CHECKPOINT1-*.md`).

**Cadre (mis à jour par l'erratum + l'incident).** -b3d-a a livré (FUSIONNÉ, `83da61d`) le décodeur SetAuthority pur, le scanner full-mint résumable borné + ledger chaîné, le comparateur 3 verdicts, le budget résumable, le pré-enregistrement §2 H1..H6 GELÉ + Amendements 1 et 2. **ERRATUM (R-21, `docs/CHANTIERS.md:382-384`, commit `7aae8d7`)** : l'énoncé du G7 -b3d-a et de son checkpoint-2 « fail-closed : jamais de faux `equal` » est **FALSIFIÉ** par le checkpoint-1 -b3d-b (rejeu au HEAD, V-1). Portée : code FUSIONNÉ (`83da61d`) mais **AUCUN appel réseau fait, rien servi, `pending` intact sur les 4 séries, tirage déjà bloqué ⇒ aucun effet produit** ; `error_origin` = worker G1 (C-7 b) + les trois relecteurs G2 + validateur checkpoint-2 (« jamais de faux equal » écrit sans croiser reprise × drapeaux) + orchestrateur G7 (énoncé repris sans rejeu). **INCIDENT HELIUS-1 (`docs/CHANTIERS.md:386-390`, commit `6baa948`)** : dashboard **60 938 cr** vs **~11 263 reconstruits** ⇒ **~49 675 non attribués** ; SONDE -b3d **SUSPENDUE** (discipline), budget de cycle corrigé, critère de GO pré-enregistré. Décisions cadres inchangées : **67**, **83/84**, **85** (`CHANTIERS.md:254` [lu] : R1 après fusion -b3d-b).

**Isolation.** `apps/bell/**` seulement (+ PLI/ADR docs). Un worker par sous-lot, worktree neuf. **Ne touche pas** CHANTIERS/JOURNAL (garde d'écriture orchestrateur), ni un lot en vol. **§2 du PLI (H1..H6) GELÉ** : sha256 de l'extrait `## 2.` → ligne avant `---` = **`7071484f3444abe6c09b694f730ad2fcce2f00ea8c12e8cc39fc31806a3c7867`** (recomputé ce tour, intact) — jamais touché.

---

## Objectif (une phrase)
Rendre la contre-vérification full-mint **exécutable sans faux `equal` et sans dette** — la reprise ne peut plus (V-1) faire converger faussement full-mint et série amputés du même événement, ni (V-2) écraser un `equal` par `inconclusive`, ni (V-3) désaccorder `Σ calls_by_method` de `calls_used` — PUIS, la course une fois DÉBLOQUÉE (audit HELIUS-1 + étalonnage), tirer, et à `equal` 4/4 ∧ H1 stricte ∧ H3 retirer `pending` et fermer `set_authority_unscanned` ; **toute divergence/incomplétude/dépassement = STOP + ESCALADE-INVESTISSEUR** (C-4).

---

## Découpe — b1a / b1b décidés D'EMBLÉE (C-B-9) + course SUSPENDUE + b2 conditionnel ; R-25 ×2 par sous-lot

| Segment | Nature | Contenu | Porteur | R-25 (métrique `ins+del`, `ci.yml:69`, plafond 1 205 `ci.yml:43`) |
|---|---|---|---|---|
| **-b3d-b1a** | **OFFLINE — reprise/ledger/budget** | C-B-1 (drapeaux collants), C-B-2 (écriture monotone), C-B-3 (compteur après garde), C-B-4 (budget durable en `finally`), C-B-5 (queue tronquée), C-B-6 (`candidates/` par mint), C-B-7 (format ledger atomique → amendement PLI daté), semis (fait 1), retry injecté (fait 9), `verifyLedgerChain` (C-V-3), champ `set_authority_scan` (fait 8), C-V-9 synthétique | worker Opus 4.8 → **G2 fraîche → checkpoint-2 → G7** | **projeté brut ~500-620 ⇒ ×2 ≈ 1 000-1 240** ; **seam interne DÉCLARÉ** (voir ci-dessous) |
| **-b3d-b1b** | **OFFLINE — densité + H6 hors process** | helper `--rebase-density` (§5, K=8 + genesis MESURÉ) + 3 gates `collect.ts` + alimentation du `calls_by_method` GLOBAL (C-B-7) + **fonction PURE de projection H6 hors process** (Amendement 3(b)) | worker Opus 4.8 → **G2 fraîche → checkpoint-2 → G7** | **projeté brut ~200-260 ⇒ ×2 ≈ 400-520** ; **dépend de b1a** (infra `calls_by_method` global + budget.json) |
| **course** | **RÉSEAU (orchestrateur) — SUSPENDUE** | sonde C-7 → [T-1a-iii phase B 50 000 cr] → tirage full-mint → audit §5 | **orchestrateur** (R-20 : jamais le worker) | n/a (aucun code ; artefacts hors dépôt) |
| **-b3d-b2** | **POST-TIRAGE, conditionnel** | L-1 prod (piggyback + attestation `source`), L-5 (chute `set_authority_unscanned` data-pilotée), L-4 (retrait `pending`), C-V-9 réel, ADR D1-quater final ; **checkpoint-1 delta OBLIGATOIRE après le tirage** | worker Opus 4.8 → **G2 fraîche → checkpoint-2 → G7** | **projeté brut ~230-290 ⇒ ×2 ≈ 460-580** (PROVENANCE `.md` comptée ; séries json + ADR exclus) |

**Facteur R-25 (imposé, C-B-9 « ×2 »)** : -b3d-a **projeté ~555-811 ⇒ mesuré 1 130** (`PLI` l.238). J'applique **×2 conservateur** aux projections brutes ci-dessus, plafond **1 205**. Caveat honnête : -b3d-b1a est en majorité de la **modification** de code existant (ratio mesuré/projeté empiriquement < greenfield), mais le ×2 est la discipline — **la borne haute b1a (≈ 1 240) DÉPASSE le plafond** ⇒ **seam interne obligatoire ci-dessous**, actionné par la mesure `STAT=` au gel (calque -b3d-a l.27), **jamais** un dépassement de gate.

**Seam interne -b3d-b1a (DÉCLARÉ D'EMBLÉE ; frontière propre en DÉPENDANCE, pas par numéro de correction ; à actionner si mesuré au gel > ~1 150)** :
- **-b3d-b1a-i (COUCHE DE STOCKAGE, en premier)** : C-B-7 (format ledger atomique + amendement), C-B-5 (queue tronquée), C-B-6 (`candidates/` par mint), `verifyLedgerChain` (C-V-3), nouveau schéma `budget.json` (`calls_by_method:{global,by_mint}`, `retries_by_method`, `pages`). **Fondation** — aucune dépendance amont.
- **-b3d-b1a-ii (LOGIQUE DE SCAN/BUDGET, ensuite)** : C-B-1 (drapeaux : page fautée non committée + stop ; `notFullPages` dérivé du ledger), semis (fait 1), retry injecté (fait 9), C-B-2 (écriture monotone), C-B-3 (compteur dans la couche budgétée), C-B-4 (budget en `finally` + `retries_by_method`), champ `set_authority_scan`, C-V-9 synthétique. **S'appuie sur -i** (format + schéma budget).
Les DEUX (ou -b1a entier si non scindé) fusionnent **avant b1b** ; b1b fusionne **avant la course**.

### Pathspec R-25 vérifiée (`ci.yml:65`, `STAT=`)
Exclus : `:(exclude,glob)docs/**/*.md` (⇒ **ADR-T1aii, G0/PLI/checkpoints NE COMPTENT PAS**), `docs/G1-lot-*.md`, `docs/G2-lot-*.md`, `package-lock.json`, `:(exclude,glob)apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}` (⇒ **`rebase-*.json`, `crosscheck-*.json` NE COMPTENT PAS**). **COMPTÉS** : tout `apps/bell/src/*.ts`, `apps/bell/test/*.test.ts`, et **`PROVENANCE-*.md` sous `series/rebase/`** (l'exclude series ne vise que json/jsonl/csv ; `docs/**` ne couvre pas `apps/bell/**`). Métrique `ins+del+0` (`ci.yml:69`), plafond `VIBEGATES_PR_LIMIT=1205` (`ci.yml:43`). **Vérifié ce tour** aux trois lignes.

---

## Faits mesurés [lu] (fichier:ligne vérifié en ouvrant le fichier ce tour) qui fixent les correctifs

1. **[lu] `rebase-crosscheck.ts:199-202`** : `events`/`handoffs`/`ledger` (`:199-201`) sont réensemencés depuis `resume.prior*` ; `prevSha`/`pages`/`n` (`:202`) dérivés du `ledger` réensemencé. **`:205`** : `let lastSlotSeen = -1, ascLastSig = "";` — **NON réensemencés** ; affectés `:222` après le `continue` de dédoublonnage `:220`. ⇒ **fuite terminale 1** (reprise 0-page ⇒ `ascLastSig=""` ⇒ ancre de fin `:257` échoue ⇒ `end_anchor_mismatch` permanent `:266`, `equal` écrasé par `inconclusive` à `:477`). Correctif : **semer** depuis `resume.priorLedger.at(-1)` (`lastSlotSeen=last.slot_hi`, `ascLastSig=last.last_sig`).
2. **[lu] `rebase-crosscheck.ts:451,454,468,476`** : `callsByMethod` (`:451`) et `candidateShas` (`:454`) sont **par mint par process** ; l'artefact écrit `candidate_shas: candidateShas` (`:476`). Une reprise terminale 0-page écrit `candidate_shas:{}` ⇒ **sha-pins C-5 perdus** (fuite terminale 2). `candidates/` est un **répertoire PLAT** créé une fois (`:445`) et alimenté `<out>/candidates/<sig>.json` (`:468`) — **partagé entre les 4 mints** (voir C-B-6).
3. **[lu] `rebase-crosscheck.ts:240-242`** : `pages += 1` (`:242`) s'exécute **même quand `chainedLedgerEntry` rend `null`** (`:240`, page toute-dédoublonnée `:137` `txs.length===0`). L'artefact publie `pages: scan.pages` (`:474`) ⇒ **`pages` dérive de +1 à chaque reprise** (fuite terminale 3). Correctif : artefact `pages = ledger.length` + compteur séparé `fetched` pour la borne `while (pages < maxPages)` (`:207`).
4. **[lu] `rebase-crosscheck.ts:473`** : `credits_recomputed` (`:473`) et `callsByMethod` (`:451`) sont **par process** ; l'artefact les écrit tels quels (`:476`). `calls_used`/`credits_worst_case` de `budget.json` (`:463`,`:471`) SONT cumulatifs (`callsUsed()`=`budgeted.calls()`, offset `priorCalls` `collect.ts:298`). ⇒ **C-V-2** : `credits_recomputed` sous-compté dès la 1ʳᵉ reprise (mesuré : sonde 11 + tirage 31 = **42**, artefact **20**), or sonde→tirage EST une reprise ; audit §5 faux.
5. **[lu] `rebase-crosscheck.ts:136-144` + test `:282`** (ledger-a) : `entry_sha256 = sha(JSON.stringify(core))`, `core` inclut `prev_entry_sha256` (`:142`) — **code correct**. Le test `…ledger_is_chained_and_rederivable` vérifie que le champ est **porté** (`:285`), **jamais ne RE-DÉRIVE** `sha(JSON.stringify(core))`. ⇒ **C-V-3** : mutant « `entry_sha256` sans `prev_entry_sha256` » **survit 29/0** ; « `ledger_sha256` commet transitivement toutes les pages » (graine de l'audit) n'est tenue par aucun test.
6. **[lu] `rebase-crosscheck.ts:422-424` (`readJsonl`)** : `.split("\n").filter(nonempty).map(JSON.parse)` — **aucune tolérance de ligne tronquée**. `appendFileSync` d'une ligne de page (`:464-466`) n'est **pas atomique au crash** ⇒ une ligne partielle en queue fait **`JSON.parse` throw à la reprise**. `ledgerPagesOnDisk:389` compte la ligne tronquée (conservateur pour la garde (b) `:416`). **Voir C-B-5** : après reprise la ligne tronquée se retrouve **au MILIEU** du fichier (append ultérieur).
7. **[lu] `rebase-crosscheck.ts:458-466` (`onPage`)** : ordre **`budget.json` (`:463`) → ledger (`:464`) → events (`:465`) → handoffs (`:466`)**. Un crash entre `:464` et `:465` laisse la page au ledger mais **ses events non** ⇒ à la reprise (`resumeFromLedger:429`, `resumeFromSlot=slot_hi`) la page n'est **ni re-tirée ni ré-ensemencée** ⇒ perte de l'`Initialize` (`no_initialize_anchor` `:266`) OU d'un update (`divergence`). **ERRATUM (fait révisé)** : ce chemin était déclaré « fail-closed, jamais de faux `equal` » — **FALSIFIÉ par V-1** (`CHANTIERS.md:382-384`, `7aae8d7`) : combiné aux **drapeaux collants** (fait 8), une page committée SANS son événement, à la reprise, fait converger full-mint et série faussement en `equal`. Résolu par **option (A)** (page atomique, L-b1a-4) **ET** C-B-1 (page fautée non committée).
8. **[lu] `rebase-crosscheck.ts:204`** : `let blockTimeNull=false, bodyQuorumFail=false, exhausted=false, notFullPages=false, nonMonotonic=false;` — **process-locaux, ni persistés ni réensemencés**. Sur une page où `bodyQuorumFail` est levé (`:236`, quorum de corps échoué ⇒ événement 43/x NON poussé), la page est **committée quand même** (`:240-241`, `pageTxs` poussés `:223` AVANT le quorum) : le sig est au ledger, l'événement absent des `events`. À la reprise (opérateur sain), les drapeaux repartent à `false` ⇒ `scan_complete=true`. C'est **V-1** (voir C-B-1). **`decodeSetAuthority`/artefact n'incluent PAS `handoffs`** (`:474-476` : seul le rapport `:478` porte `handoffs.length`) ⇒ L-5 ne peut lire l'attestation ⇒ **ajouter `set_authority_scan` à l'artefact**.
9. **[lu] `collect.ts:316-325`** : `withRetry` **EXISTE** (`:318` `tries=4` défaut, backoff `400*(i+1)` `:322`, re-throw `BudgetExceededError` `:322`, retry sur `/HTTP 5|HTTP 429|timeout|transport/` `:322`, sinon re-throw), utilisé `:365`/`:401`, mais **privé à `collect.ts`**. `scanFullMint` **n'a AUCUN retry** sur gTfA (`:210`) ni opB (`:233`). **Correctif : injecter `withRetry` par paramètre** (aucun déplacement, aucun cycle). Backoff réel sur 6 essais : **8,4 s cumulés** (Σ `400·(i+1)`, i=0..5 ; le 6ᵉ sommeil de 2 400 ms est **gaspillé** — aucune 7ᵉ tentative), **PAS « ~5 s »** (correction non bloquante ; option : sauter le sommeil de la dernière itération).
10. **[lu] `rebase-crosscheck.ts:34` + grep `normalizeBody`** : le SEUL import code de `rebase-crosscheck.ts` depuis `rebase-produce.ts` est `normalizeBody` (`:34`) ; `normalizeBody` défini `rebase-produce.ts:66-74`, usage interne `:123`, importé UNIQUEMENT par `rebase-crosscheck.ts:34` (grep : 2 importeurs code). Le déplacer vers `rebase-scan.ts` **brise la seule arête** ⇒ `rebase-produce.ts` importe `setAuthorityHandoffsFromTx` **sans cycle** (L-1 prod, b2).
11. **[lu] `collect.ts:437-454` + `:589`** : gates d'arguments — `--max-calls` requis+>0 (`:437-439`), `--max-credits` requis pour `--rebase-crosscheck` (`:444-445`), `--max-pages` requis pour `--rebase-crosscheck` (`:452-454`) ; `priorCalls = rebaseCrosscheck ? readPriorCalls(out) : 0` (`:589`). ⇒ le mode `--rebase-density` (b1b) doit ajouter `|| rebaseDensity` aux conditions `--max-credits` (`:444`) et `priorCalls` (`:589`) — **pas** à `--max-pages` (mode distinct, découplé), et **partager le compteur** (C-B-7).
12. **[lu] `supply.ts:167,173`** : `rebaseGateFromTrajectory(events, from, to, scanComplete, scanMethod?)` (`:167`) — **`oracle_slot` ABSENT de la signature** ; `residuals = scanMethod==="authority" ? ["authority_scan_mono_operator","set_authority_unscanned"] : []` (`:173`) code en dur, **aucune entrée d'attestation**. Appelants : `collect.ts:540`, `rebase-course.test.ts:59/71/75`, `rebase-gate-gt.test.ts:21/24/28/32`. **[lu] `residuals.ts:34,37`** : enum fermé. ⇒ **C-B2-3** : l'attestation doit être **auto-contenue** (`through_slot >= oracle_slot` calculé par le PRODUCTEUR, qui a `oracle_slot`).
13. **[lu] `rebase-produce.ts:40-47`** : `SCAN_METHOD_MAP` porte DÉJÀ `"hybrid-authority-scan (pending R-26 ratification)"` ET `"hybrid-authority-scan"` → `"authority"` ⇒ **L-4 (retrait `pending`) ne change AUCUN code** (`bell_series_method_maps_to_authority` déjà vert). Le changement de `method` vit dans les séries json (**R-25 exclus**).
14. **[lu] `collect.test.ts:43-54,79,96`** : `tslaxInput()` (`:43-54`) construit un `SymbolInput` **SANS champ `rebase`** ⇒ le rejeu collecteur (`bell_collector_replays_fixture_bit_identical` `:83`) passe `rebase: undefined` ⇒ jamais la branche `trajectory_known` ⇒ digest inchangé ⇒ `PINNED_BELL_SHA` (`:79`) inaltéré (`:96`). **Q7 : L-5 sans re-pin PROUVÉ hors réseau, anti-cycle confirmé.**
15. **[lu] `rebase-produce.test.ts:81-125`** : le test drive `runMain --rebase-produce` (`:81`) → `loadTrajectories` (`:89`) → `buildSolanaSymbol` (`:109`) → `collect` (`:118`) → assertions `authority_scan_mono_operator`/`set_authority_unscanned >= 1` (`:124-125`) **à travers la composition**. La trajectoire vient de `produceTrajectories` (piggyback S7vYFF), **sans `setAuthorityScan`** ⇒ **C-B2-1** : si le piggyback ne ferme jamais (validateur), la ligne `:125` reste **VERTE comme contrôle**.

---

## -b3d-b1a (OFFLINE) — Livrables

> Discipline commune : fixtures 100 % synthétiques (C-16), `cp` byte-exact depuis pristine pour les mutants (**jamais `git checkout`**, R-20), `PINNED_BELL_SHA` prouvé inchangé, anti-close (jeton `[masqué]`), `BELL_SOLANA_RPC` jamais imprimée (`collect.ts:285` scrub `HTTP <status>`). **§2 du PLI reste BYTE-IDENTIQUE** (sha `7071484f…`, recompute avant/après).

### L-b1a-1 — C-B-1 : drapeaux d'incomplétude collants (défaut SOURCE ; racine de V-1)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/rebase-crosscheck.ts` (`scanFullMint`, `onPage`), + le nouveau format (L-b1a-4/amendement) |
| **Racine V-1** | fait 8 : `bodyQuorumFail`/`blockTimeNull`/`nonMonotonic`/`notFullPages` (`:204`) process-locaux ; page committée (`:240-241`) avec le sig mais SANS l'événement dropé (`:236`) ; reprise ⇒ drapeaux à `false` ⇒ `scan_complete=true` ; full-mint et série amputés du MÊME événement ⇒ `setsEqual` ; H5 concorde dès **≥ 2 updates après T** (le triplet final n'encode pas l'intermédiaire ; 9-11 événements/série) ⇒ **FAUX `equal`**. |
| **Correctif retenu = option (i) « page fautée NON committée + stop-au-premier-défaut »** | Sur `bodyQuorumFail`/`blockTimeNull`/`nonMonotonic` d'une page : **ne PAS committer la page** (skip `:240-241`) et **STOP** (`return inconclusive` avec le motif), **jamais** une page ultérieure. **Corollaire (contrainte écrite)** : committer P+1 après un défaut sur P **perd les tx de P** à la reprise (repart au `slot_hi` de P+1) = **V-1 à nouveau** ⇒ le stop-au-premier-défaut est OBLIGATOIRE. À la reprise, le scan repart du `slot_hi` de la **dernière page committée saine** et **re-tire** la page fautée (avec le retry L-b1a-8 ⇒ un défaut transitoire se résout ; un défaut persistant ⇒ reste `inconclusive` ⇒ ESCALADE, fail-closed). `notFullPages` = **DÉRIVÉ du ledger** (`ledger.slice(0,-1).some(e => e.tx_count < 1000)`), jamais un drapeau process-local (une page courte non-finale est une propriété de pagination, pas une corruption re-tirable). |
| **Option (ii) écartée (motif écrit)** | « drapeau `page_faults` porté dans l'enregistrement + réensemencé » **empoisonne le `--out` en permanence** (un 500 Chainstack transitoire ⇒ mint `inconclusive:body_quorum` à jamais) sans mécanisme de re-tirage ⇒ plus de code, moins sûr. |
| **Test discriminant (fixture SPELLÉE)** | `bell_crosscheck_resume_after_decode_fault_is_not_equal` via **DEUX `runMain`** : **full-mint stub = {Init, U1, T, U3, U4}** ; **série fixture = {Init, U1, U3, U4}** (T absent) ; `oracle_triplet` de **U4** (≥ 2 updates après T ⇒ H5 concorde). Process 1 : `bodyQuorumFail` sur la page de T (opB stub 500) ⇒ **page non committée + stop**. Process 2 (opB sain) : re-tire ⇒ trouve T ⇒ `full={…,T,…}`, `series` sans T ⇒ `missingFromSeries=[T]` ⇒ **`divergence`** (jamais `equal`). *(La fixture est discriminante SEULEMENT parce que la série manque T : si la série avait T, le mutant rendrait `divergence` — faux négatif.)* |
| **Test terminal** | `bell_crosscheck_terminal_inconclusive_never_promotes` : un artefact `inconclusive:body_quorum` relancé (même `--out`, opB toujours en défaut) **reste `inconclusive`** — un `inconclusive` collant ne se **PROMEUT jamais** par relance. |
| **Mutants** | **M-b1a-1** « page committée malgré le drapeau » (commit `:240-241` même si un défaut est levé) ⇒ T perdu ⇒ faux `equal` ⇒ **ROUGE** (tue `…is_not_equal`) ; **M-b1a-1b** `notFullPages` process-local (au lieu de dérivé) ⇒ non réensemencé ⇒ reprise masque une page courte ⇒ **ROUGE**. |
| **INVENTAIRE ÉCRIT des `let` de `scanFullMint`** | voir la section dédiée « Inventaire des `let` (C-B-1) » ci-dessous : **11 liaisons `let`** classées **réensemencé / fail-closed / N/A** ; les **7 candidats-fuite** = {`lastSlotSeen`,`ascLastSig`,`pages`} (traités par le G0, fait 1/3) + {`blockTimeNull`,`bodyQuorumFail`,`notFullPages`,`nonMonotonic`} (**ouverts ⇒ C-B-1**) — d'où « 3 sur 7 traités ». |
| **Tuyau** | entrée : `ledger-<MINT>.jsonl` sain (pages non fautées) ; sortie : reprise sans faux `equal` ; test : deux `runMain`. **Changement SOURCE ⇒ G2 fraîche.** |

### L-b1a-2 — C-B-2 : écriture d'artefact MONOTONE (racine de V-2)
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/bell/src/rebase-crosscheck.ts` (`runRebaseCrosscheckCli`, écriture artefact `:477`) |
| **Racine V-2** | un artefact `equal` (`scan_complete:true`) relancé sous un `--max-credits` **inférieur au cumul** est ÉCRASÉ (`:477`) par `inconclusive:budget_exhausted` (`scan_complete` true→false ; `calls_by_method` remis à `{1,0}`). |
| **Correctif** | **ne JAMAIS remplacer un `scan_complete:true` par `false`** : avant `:477`, lire l'artefact existant ; si `scan_complete === true`, **refuser** la dégradation (soit refus **journalisé** — l'écriture est un no-op tracé — soit **sidecar `crosscheck-<MINT>-attempt.json`** pour l'invocation dégradée). Un `equal` scellé reste byte-identique. |
| **Test** | `bell_crosscheck_artifact_write_is_monotone` : run 1 `equal` ; run 2 sous budget mordant même `--out` ⇒ **artefact `crosscheck-<MINT>.json` byte-identique** (le run 2 écrit au plus un sidecar `-attempt`). |
| **Mutant** | **M-b1a-14** l'écriture remplace inconditionnellement (garde monotone retirée) ⇒ `equal` écrasé par `inconclusive` ⇒ **ROUGE**. |
| **Tuyau** | entrée : artefact existant + verdict courant ; sortie : artefact monotone ; test : rejeu deux `runMain`. |

### L-b1a-3 — C-B-3 : compteur par méthode DANS la couche budgétée (racine de V-3)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/collect.ts` (`makeBudgetedCall`, `:304`), `apps/bell/src/rebase-crosscheck.ts` (retrait de `counted` `:452`) |
| **Racine V-3** | `counted` (`:452`) fait `callsByMethod[m] += 1` **AVANT** `return call(u,m,p)` ; le `guard` (`collect.ts:299-305`) tique `n` **dans** `call` (`:306-308`). Au dépassement, `guard` throw (`:300`/`:303`) mais `callsByMethod` est **déjà** incrémenté ⇒ **`Σ calls_by_method = calls_used + 1`** (mesuré : Σ=4, `calls_used`=3). |
| **Correctif (piège écarté)** | **compter DANS la couche budgétée**, à côté de `n += 1` (`collect.ts:304`) : exposer `callsByMethod` depuis `makeBudgetedCall`. **NE PAS** « compter après l'`await` » (`counted = async()=>{await call(); callsByMethod[m]++}`) — cela produit l'off-by-one INVERSE sur un 5xx transport (garde a tiqué `n`, l'`await` throw, méthode non comptée). L'invariant **`Σ_methods calls_by_method == calls_used`** tient **ssi** les deux incréments sont la même instruction, et **couvre le chemin `budget_exhausted`**. |
| **Test** | `bell_crosscheck_calls_by_method_equals_calls_used` : assert `Σ calls_by_method == calls_used` sur (a) un run normal, (b) un run **`budget_exhausted`** (l'appel qui throw n'est PAS compté). |
| **Mutant** | **M-b1a-3** compte avant le garde (état actuel restauré) ⇒ `Σ = calls_used+1` au dépassement ⇒ **ROUGE**. |
| **Tuyau** | entrée : couche budget ; sortie : `calls_by_method` == `calls_used` (audit §5) ; test : rejeu dont chemin épuisé. |

### L-b1a-4 — C-B-4 : budget durable sur le chemin d'erreur + `retries_by_method`
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/bell/src/rebase-crosscheck.ts` (`runRebaseCrosscheckCli`, `scanFullMint`), `apps/bell/src/collect.ts` (hook retry) |
| **Racine** | un throw **non budgétaire** (`:249`) ou sur l'**appel desc** (`:255`, **HORS `try`** : le `try` couvre `:206-247`, le catch `:248-251`) **tue le process sans atteindre l'écriture `budget.json` finale** (`:471`, après le `return` de `scanFullMint`) ⇒ **jusqu'à 6 appels de retry** (L-b1a-8) faits mais non persistés ⇒ à la reprise, sous-compte ⇒ risque de surdépense. |
| **Correctif** | écrire `budget.json` en **`finally`** (couvre le chemin d'erreur ET le desc `:255`) ; **persister `retries_by_method`** (les essais retry consomment le budget et doivent survivre au crash). L'**audit §5 déclare son sens de comparaison** : **dashboard ≤ recomputed** (le recomputed sur-compte les retry pire cas), écart **borné par `retries_by_method`**. |
| **Hook retry (propriétaire NOMMÉ)** | `withRetry` n'a **aucun hook** aujourd'hui (`collect.ts:318`) et ne connaît pas `budget.json` (il vit dans `collect.ts`). Correctif : **`runRebaseCrosscheckCli` passe un objet compteur partagé `retries` à `withRetry` (via un paramètre `onRetry`) et le SÉRIALISE dans le MÊME `finally`** que `budget.json` ⇒ le tuyau retry → `budget.json` a un propriétaire nommé (jamais un dû nu). L'incrément des appels reste dans la couche budgétée (L-b1a-3). |
| **Test** | `bell_crosscheck_budget_persists_on_error_path` : un throw sur le desc `:255` (stub) ⇒ `budget.json` reflète TOUS les appels (retry inclus) via le `finally` ⇒ reprise sans sous-compte. |
| **Mutant** | **M-b1a-4a** écriture `budget.json` hors `finally` (état actuel) ⇒ crash desc ⇒ appels perdus ⇒ **ROUGE** ; **M-b1a-4b** `retries_by_method` non persisté ⇒ audit §5 ne peut borner l'écart ⇒ **ROUGE**. |
| **Tuyau** | entrée : chemin d'erreur/desc ; sortie : `budget.json` complet (retries inclus) ; consommateur : audit §5 (delta dashboard borné) ; test : throw injecté. |

### L-b1a-5 — C-B-5 : queue tronquée non persistante + vérif de chaîne à CHAQUE reprise
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/bell/src/rebase-crosscheck.ts` (`readJsonl`, `resumeFromLedger`, `ledgerPagesOnDisk`, + `verifyLedgerChain` L-b1a-6) |
| **Racine** | fait 6 : `appendFileSync` non atomique ⇒ ligne partielle en queue ⇒ `JSON.parse` throw (`:424`). Après une reprise qui **append** de nouvelles lignes, la ligne tronquée se retrouve **au MILIEU** du fichier ⇒ jamais réparée. |
| **Correctif (au choix, À PROUVER)** | **(α)** **tronquer le fichier à la dernière ligne complète AVANT tout append** (une ligne illisible **hors queue** ⇒ **throw** fail-closed) ; **OU (β)** lecteur **sautant toute ligne illisible** avec **`verifyLedgerChain` exécuté à CHAQUE reprise** (une chaîne rompue ⇒ throw). Retenu : **(α)** (source unique, la queue est le seul point de troncature légitime) + `verifyLedgerChain` en ceinture. |
| **Test** | `bell_crosscheck_torn_queue_dropped_and_chain_verified` : `ledger-<MINT>.jsonl` avec ligne tronquée **en queue** ⇒ tronquée+reprise OK ; ligne tronquée **au milieu** ⇒ **throw** ; `verifyLedgerChain` rejoué à la reprise. |
| **Mutant** | **M-b1a-5** ligne tronquée en milieu de fichier **tolérée sans vérification de chaîne** ⇒ **ROUGE**. |
| **Tuyau** | entrée : `ledger-<MINT>.jsonl` possiblement tronqué ; sortie : reprise fail-closed ; test : troncature manuelle (LECTEUR). |

### L-b1a-6 — C-V-3 : `verifyLedgerChain` exporté (re-dérive depuis le disque)
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/bell/src/rebase-crosscheck.ts` (nouveau `verifyLedgerChain` exporté) + `apps/bell/test/rebase-crosscheck.test.ts` |
| **Correctif** | `verifyLedgerChain(entries)` re-dérive chaque `entry_sha256 = sha(JSON.stringify(core))` depuis genesis (core = **§6 seul** : `{prev_entry_sha256,page,slot_lo,slot_hi,first_sig,last_sig,tx_count,tail_sigs_at_slot_hi,list_sha256}`), en **IGNORANT** `page_events`/`page_handoffs` du nouvel enregistrement atomique (L-b1a-4/amendement) ; rend `{ok, headSha}` ; utilisable par l'audit §5 depuis `ledger-<MINT>.jsonl`. |
| **Tests** | `bell_crosscheck_ledger_chain_rederives_from_disk` (head == `ledger_sha256` ; un `prev_entry_sha256` altéré au milieu ⇒ `ok:false`) ; `bell_crosscheck_ledger_chain_rederives_ignoring_page_payload` (`page_events`/`page_handoffs` variables ⇒ **même** `entry_sha256`). |
| **Mutant** | **M-b1a-7** `core` **avec** `page_events` (au lieu du §6 seul) ⇒ chaîne ne re-dérive plus ⇒ **ROUGE** ; **M-b1a-7b** `core` sans `prev_entry_sha256` (ex-survivant 29/0) ⇒ **ROUGE**. |
| **Tuyau** | entrée : `ledger-<MINT>.jsonl` ; sortie : `verifyLedgerChain` (bool+head) ; consommateur SERVI : **audit §5** (orchestrateur/G2, CA-9) ; test : re-dérivation disque. |

### L-b1a-7 — C-B-6 : `candidate_shas` par mint (jamais un `readdirSync` plat)
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/bell/src/rebase-crosscheck.ts` (`runRebaseCrosscheckCli`, `onCandidate` `:468`, artefact `:476`) |
| **Racine** | `candidates/` est un répertoire **PLAT partagé** entre les 4 mints (`:445`, `:468`). **Correction de la fuite 2 par `readdirSync(<out>/candidates)` (proposée par le G0 source, fait 1(b)) est FAUSSE** : re-dériver par `readdirSync` **mélange les 4 mints** (M-b1-2 du G0 source est **re-spécifié**). |
| **Correctif** | **sous-dossier par mint** `<out>/candidates/<MINT>/<sig>.json`, OU **shas portés par l'enregistrement de page** (dans `page_events`/champ dédié hors core). Retenu : **sous-dossier par mint** (source unique, re-dérivation par mint sans mélange). |
| **Test** | `bell_crosscheck_candidate_shas_per_mint` : 2 mints, candidats homonymes impossibles à mélanger ; re-dérivation par mint == `candidate_shas` du mint. |
| **Mutant** | **M-b1a-2** `readdirSync` plat (mélange les mints) ⇒ `candidate_shas` d'un mint contient les sigs d'un autre ⇒ **ROUGE**. |
| **Tuyau** | entrée : `candidates/<MINT>/` ; sortie : `candidate_shas` par mint ; test : deux mints. |

### L-b1a-8 — Reprise idempotente : semis (fait 1) + `pages` (fait 3) + retry injecté (fait 9)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/rebase-crosscheck.ts` (`scanFullMint`), `apps/bell/src/collect.ts` (injection retry) |
| **Semis (fait 1)** | juste après `:202` : `lastSlotSeen = last.slot_hi`, `ascLastSig = last.last_sig` depuis `resume.priorLedger.at(-1)` ⇒ reprise 0-page reproduit l'ancre de fin. **Préciser** (non bloquant) : le semis donne `ascLastSig = last.last_sig` — équivalence vérifiée (`:142` `last_sig = txs[last].sig` ; `:222-223` `ascLastSig` suit la dernière tx énumérée). |
| **`pages` (fait 3)** | artefact `pages = ledger.length` (idempotent) ; compteur séparé `fetched` pour `while (fetched < maxPages)`. |
| **Retry (fait 9)** | `withRetry` **injecté par paramètre** (défaut identité offline) ; enveloppe gTfA (`:210`) et opB (`:233`). Chaque essai passe par le `call` budgété ⇒ compté (conservateur). `tries=6` pour le tirage (backoff **8,4 s** cumulés, fait 9). **`Retry-After` NON honoré** (`collect.ts:285` scrub sans en-tête) — **item formé maintenu** : mesurer le `Retry-After` de Helius à la sonde (d) ; s'il l'envoie et que le backoff est insuffisant, ajouter `RateLimitError{retryAfterMs}`. Non rejouables (`SolRpcError`, HTTP 4xx≠429) **re-throw** (`collect.ts:322`). |
| **Tests** | `bell_crosscheck_resume_after_exhaustion_is_equal` (reprise terminale ⇒ artefact byte-identique sur `verdict,events,handoffs,n_exact,pages,ledger_sha256,candidate_shas,c3_oracle_triplet` ; seuls `calls_by_method`/`credits_recomputed` croissent du coût de re-vérif) ; `bell_crosscheck_retry_on_429_resumes_without_loss_or_doublecount`. |
| **Mutants** | **M-b1a-8a** semis retiré ⇒ `end_anchor_mismatch` terminal ⇒ **ROUGE** ; **M-b1a-8b** `pages=scan.pages` (dérive +1) ⇒ **ROUGE** ; **M-b1a-8c** retry avale `BudgetExceededError` ⇒ surdépense masquée ⇒ **ROUGE**. |

### L-b1a-9 — C-B-7 : format ledger atomique (fait 7) + champ `set_authority_scan` (fait 8) + C-V-9 synthétique
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/rebase-crosscheck.ts` (`onPage`, `ScanSink`, `resumeFromLedger`, artefact) + `apps/bell/test/rebase-crosscheck.test.ts` |
| **Format atomique (option A, C-B-7)** | **UNE seule ligne par page** dans `ledger-<MINT>.jsonl` portant `{...core, entry_sha256, page_events, page_handoffs}` (un seul `appendFileSync` = un point de commit ⇒ ferme la fenêtre de désync du fait 7). **`entry_sha256` sur le SEUL core du §6** (jamais `page_events`) ⇒ chaîne re-dérivable inchangée. `events-`/`handoffs-<MINT>.jsonl` **disparaissent** (fusionnés). **C'est un CHANGEMENT DE FORMAT PERSISTÉ fixé par le PLI §6 ⇒ AMENDEMENT PLI DATÉ** (texte complet ci-dessous). Retravaille `hasResumeState`/`readPriorCalls` (`:393-419`) et le test `…hasResumeState_events_or_handoffs_fail_closed` (`:545`) : la garde « resume-state sans `budget.json` ⇒ throw » reste, sur `ledger-*.jsonl` seul. **Interaction avec C-G2D-2 sûre** (budget.json toujours écrit en tête ; invariant `calls_used ≥ pages`). |
| **Champ artefact (fait 8)** | ajouter `set_authority_scan: { scanned: scan.complete, authority_change_found: scan.handoffs.length > 0, through_slot: series.oracle_slot, source: "fullmint" }` à `:476` — consommé par L-5 (b2). |
| **C-V-9 synthétique** | `bell_crosscheck_committed_artifacts_replay` (`:292`) construit l'artefact **à la main** ⇒ non probant CA-11 durci ⇒ **réécrit via `runMain --rebase-crosscheck`** sur stub synthétique ⇒ le test **LIT** les `crosscheck-*.json` réels puis rejoue `compareToHybrid` ⇒ verdict rejoué == committé ; `method` sans `pending` **ssi** `equal`. Rejeu sur artefacts RÉELS reporté à b2/course. |
| **Mutants** | **M-b1a-9** `entry_sha256` calculé sur `{...core, page_events}` ⇒ chaîne cassée ⇒ **ROUGE** (couvre aussi M-b1a-7) ; **M-b1a-13** replay reconstruit l'artefact à la main ⇒ ne prouve plus la composition CLI ⇒ **ROUGE**. |
| **Tuyau** | entrée : `crosscheck-*.json` écrits par `runMain` ; sortie : verdict rejoué == committé + `set_authority_scan` ; test : composition CLI (CA-11 durci). |

---

## -b3d-b1b (OFFLINE) — Livrables (dépend de b1a)

### L-b1b-1 — Helper de densité `--rebase-density` (§5) + alimentation du `calls_by_method` GLOBAL
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/rebase-crosscheck.ts` (`runDensityProbeCli`) + `apps/bell/src/collect.ts` (flag `--rebase-density` + 2 gates, fait 11) |
| **Conception** | par mint : **1 appel `genesis probe`** gTfA asc `limit:1` `slot.lte=oracle_slot` (**MESURE** le genesis, jamais date-estimé) → **K=8 points** uniformes sur `[genesis_slot, oracle_slot]`, une page gTfA `full limit:1000 slot.gte=point` chacun → densité locale tx/(span de slots) → intégration (§Amendement 3(c)) ⇒ **N projeté + intervalle**. Écrit `sonde-report.json` (hors dépôt) **portant `genesis_slot` par mint** (requis par la projection H6 hors process, Amendement 3(b)) + `budget.json` **partagé**. **JAMAIS `ledger-<MINT>.jsonl`** (sinon `resumeFromLedger` reprend d'un point épars). |
| **Gates (fait 11)** | ajouter `|| rebaseDensity` à `--max-credits` requis (`collect.ts:444`) et à `priorCalls` (`:589`) ; **PAS** `--max-pages` (mode distinct, découplé). |
| **`calls_by_method` GLOBAL (C-B-7)** | le helper alimente le **`calls_by_method` GLOBAL** de `budget.json` (schéma amendé) — **sinon Σ ≠ `calls_used` dès la sonde** (les appels densité seraient hors compteur par méthode). |
| **Budget** | ≤ **36 appels = 360 cr** (4 × (1 genesis + 8)) ; sonde totale (a/b/g inclus) ≤ **48 appels = 480 cr** ≪ 1 500 (Q5). |
| **Tests** | `bell_density_projects_N_with_interval` ; `bell_density_writes_budget_never_ledger` ; `bell_density_requires_max_credits` ; `bell_density_feeds_global_calls_by_method` (Σ global == calls_used après la sonde). |
| **Mutants** | **M-b1b-10** écrit un ledger ⇒ reprise éparse ⇒ **ROUGE** ; **M-b1b-11** genesis date-estimé ⇒ intervalle faux ⇒ **ROUGE** ; **M-b1b-12** hors gate `--max-credits` ⇒ 360 cr hors unité ⇒ **ROUGE** ; **M-b1b-12b** `calls_by_method` local (pas global) ⇒ Σ ≠ calls_used ⇒ **ROUGE**. |
| **Tuyau** | entrée : oracle_slot committé + genesis MESURÉ ; sortie : `sonde-report.json` (N + intervalle + `genesis_slot` + durée) ; consommateur : la fonction pure H6 (L-b1b-2) + l'orchestrateur ; test : projection sur fixture. |

### L-b1b-2 — Projection H6 HORS PROCESS (fonction pure, Amendement 3(b))
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/bell/src/rebase-crosscheck.ts` (fonction pure exportée `projectPagesAtFraction`) + test |
| **Correctif** | fonction **PURE** `projectPagesAtFraction(slotHi, genesisSlot, oracleSlot, pagesSoFar, densityModel) => max(linéaire, densité)` où `linéaire = pagesSoFar / fraction`, `fraction = (slotHi − genesisSlot)/(oracleSlot − genesisSlot)`, `densité` = intégrale du modèle pré-enregistré (§Amendement 3(c)). L'**orchestrateur** l'exécute **HORS PROCESS** à f = 0,05 du span (lit `slot_hi` dans `ledger-<MINT>.jsonl`, calcule, retient le `max`) ⇒ restaure la granularité de H6 **sans code chaud** dans le tirage. `projection > 6 500 000` ⇒ STOP + ESCALADE-INVESTISSEUR **avant de continuer**. |
| **Tests** | `bell_h6_projection_pure_function` (linéaire, densité, `max`) ; `bell_h6_projection_rejects_max_times_span` (une densité « max × span » sur-projette ⇒ dépasserait tous les sous-plafonds ⇒ **rejeté**). |
| **Mutants** | **M-b1b-13** `min` au lieu de `max(linéaire, densité)` ⇒ sous-projette ⇒ **ROUGE** ; **M-b1b-14** densité = `densité_max × span` (au lieu de l'intégrale par segments) ⇒ **ROUGE**. |
| **Écart déclaré (si b1b non livré à temps)** | sans cette fonction, le seul arrêt est le **sous-plafond cumulatif** (Amendement 3(2)) ⇒ **SPYx peut brûler jusqu'à 2,96 M** avant un STOP (le sous-plafond SPYx 5 396 170 laisse 2 957 000 au-dessus du cumul NVDAx). À DÉCLARER dans l'Amendement 3 si l'écart subsiste. |
| **Tuyau** | entrée : `sonde-report.json` (`genesis_slot`, modèle densité) + `slot_hi` du ledger en vol ; sortie : projection (STOP/continue) HORS PROCESS ; test : fonction pure. |

---

## Amendement 3 (C-V-4 / H6) — TEXTE COMPLET (prêt à porter au PLI par l'orchestrateur)

> **§2 H6 tel qu'écrit (GELÉ, sha `7071484f…`)** : projection EN VOL à une **fraction FIXE `f = 0,05`** du span, `max(linéaire, densité)`, STOP si projection > 6 500 000. **H6 n'a NI implémentation NI item** ; §7 passe `--max-credits 6497500` à CHAQUE mint (aucun sous-plafond). **Recommandation Q4 = Amendement 3 (a)** (sous-plafonds cumulatifs `--max-credits`, écart déclaré vs H6 littérale) — légitime (H6 = mécanisme d'arrêt de coût, daté, **avant toute donnée**), texte = C-B-8. **Rédigé par le worker -b3d-b1a dans ce G0, R-25 = 0** (`docs/**/*.md` exclus). Committé **SEUL** par l'orchestrateur **avant la sonde de densité** (calque prereg §2, CHANTIERS §F).

---
> **Amendement 3 — sous-plafonds cumulatifs par mint + substitution du STOP H6 (pré-enregistrement daté, 2026-09-2X HH:MM UTC `date -u`, worker `claude-opus-4-8[1m]`, pli source -b3d-b1a).** **§2 (H1..H6) reste BYTE-IDENTIQUE** — sha256 de l'extrait `## 2.` → ligne avant `---` **inchangé** `7071484f3444abe6c09b694f730ad2fcce2f00ea8c12e8cc39fc31806a3c7867` (recomputé avant/après). Corrige les COMMANDES (§7) et **substitue, DANS CE TEXTE seulement (jamais §2)**, le mécanisme de STOP de H6. **N'est EXÉCUTABLE qu'après C-B-1 et C-B-2** (voir (e)).
>
> **(1) Substitution H6 — granularité restaurée HORS PROCESS (écart (b) borné).** La projection EN VOL à `f = 0,05` **dans le `scanFullMint` chaud** n'est PAS implémentée (pas de code chaud dans un tirage à ~5,4 M cr). Elle est remplacée par : **(i)** projection unique à la **sonde de densité** (`f = 0`, helper L-b1b-1, N projeté + intervalle) — si la **borne haute** de l'intervalle d'un mint `k` dépasse son sous-plafond §3(f), **ESCALADE-INVESTISSEUR AVANT de démarrer le mint `k`** ; **(ii)** projection **HORS PROCESS** par l'orchestrateur via la **fonction pure `projectPagesAtFraction`** (L-b1b-2) exécutée à `f = 0,05` du span (lit `slot_hi` du ledger, `genesis_slot` de `sonde-report.json`, retient `max(linéaire, densité)`) — si `projection > 6 500 000` ⇒ STOP + ESCALADE-INVESTISSEUR ; **(iii)** sous-plafonds **CUMULATIFS** par mint en `--max-credits` (fail-closed `collect.ts:303`). **Écart DÉCLARÉ (d)** : si la fonction pure (ii) n'est pas livrée (b1b), le seul arrêt est le sous-plafond cumulatif ⇒ **SPYx peut brûler jusqu'à 2,96 M avant un STOP**.
>
> **(2) Sous-plafonds cumulatifs — ROULANT DESCENDANT SEULEMENT (contradiction (a) corrigée).** Un sous-consommé **élargit** le suivant (roulant descendant) ; une **sur-consommation n'est JAMAIS « mangée » par le suivant** — elle est **TOUJOURS STOP + ESCALADE-INVESTISSEUR** (C-4). *(L'ancienne formulation « un sur-consommé le mange » contredisait « dépassement ⇒ STOP » et est SUPPRIMÉE.)* Sonde 1 500 cr incluse dans le compteur partagé ; audit 1 000 cr = `--out` distinct. `--max-credits` du mint `k` = 1 500 + Σ_{i≤k} sous-plafond_i (`PLI §3(f)` [lu]) :
> - **TSLAx `--max-credits 256170`** (= 1 500 + 254 670)
> - **AAPLx `--max-credits 769170`** (= 256 170 + 513 000)
> - **NVDAx `--max-credits 2439170`** (= 769 170 + 1 670 000)
> - **SPYx `--max-credits 5396170`** (= 2 439 170 + 2 957 000)
>
> tous ≤ 6 497 500 ; **marge 1 101 330** sous 6 497 500 (SPYx). `--max-pages 649750` et `--max-calls 649750` inchangés (non mordants). Un mint qui dépasse son sous-plafond ⇒ `BudgetExceededError` ⇒ `inconclusive:budget_exhausted` ⇒ **STOP + ESCALADE** (jamais un roulant montant).
>
> **(3) Sous-plafonds = ESTIMATIONS PONCTUELLES (déclaration (d)).** Les coûts par mint (`PLI §3(f)` : 254 670 / 513 000 / 1 670 000 / 2 957 000) sont des estimations -b3a. La sonde réserve 1 500 cr mais n'en dépense que **~360-480** (36-48 appels) ⇒ **~102-114 appels (~1 020-1 140 cr) de marge** dans le sous-plafond TSLAx (256 170 = 1 500 + 254 670 ; marge = 1 500 − dépense sonde). Un coût réel TSLAx supérieur de > ~100 appels ⇒ **faux STOP plausible** (fail-closed : STOP+ESCALADE, jamais une surdépense) — **DÉCLARÉ** pour qu'il ne soit pas une surprise.
>
> **(4) Estimateur de densité PRÉ-ENREGISTRÉ ENTIÈREMENT (avant la sonde, (c)).** Densité locale `d_j = tx_j / (slot_{j+1} − slot_j)` mesurée aux **K=8 points** ; **intégration = somme trapézoïdale par SEGMENT** sur les K−1 segments : `N_projeté = Σ_j ((d_j + d_{j+1})/2) × (slot_{j+1} − slot_j)`, borné à `[genesis_slot, oracle_slot]`. **Intervalle** : `N_min`/`N_max` = même somme en substituant à chaque segment la densité **min**/**max** des deux points adjacents. **REJET EXPLICITE** de « borne haute = densité max × span » (dépasserait tous les sous-plafonds — c'est un majorant grossier, pas une intégrale). Seuils : borne haute > sous-plafond du mint ⇒ ESCALADE avant le mint (1(i)).
>
> **(5) Chaîne « sous-plafond mordu → relance élargie » (dépendance (e)).** Un sous-plafond mordu ⇒ `inconclusive:budget_exhausted` ; une relance sous un `--max-credits` élargi est la chaîne de **V-1/V-2** ⇒ **l'Amendement 3 n'est EXÉCUTABLE qu'après C-B-1 (drapeaux, pas de faux `equal`) ET C-B-2 (écriture monotone, pas d'écrasement)**. Déclaré comme **précondition**, jamais un contournement.
>
> **(6) Committé SEUL avant la sonde (f).** L'orchestrateur committe cet Amendement 3 **en un commit docs isolé** (calque prereg §2), **avant** la sonde de densité, **après** la fusion de b1a **et** b1b. Séquence : **b1a → b1b → Amendement 3 committé seul → sonde**.
---

## Amendement de FORMAT DU LEDGER (option A, C-B-7) — TEXTE COMPLET (prêt à porter au PLI §6)

> **§2 (H1..H6) reste BYTE-IDENTIQUE** (sha `7071484f…`). Cet amendement corrige le **§6 (forme canonique du ledger)** — il **change le FORMAT PERSISTÉ** fixé au PLI ⇒ pré-enregistrement daté requis (CHANTIERS §F). Committé avec le pli G0/PLI de b1a-i, **AVANT le code b1a** (c'est une spéc).

---
> **Amendement de format du ledger — enregistrement de page ATOMIQUE + schéma `budget.json` (pré-enregistrement daté, 2026-09-2X HH:MM UTC `date -u`, worker `claude-opus-4-8[1m]`, pli source -b3d-b1a-i).**
>
> **(1) Enregistrement de page atomique (§6 amendé).** `ledger-<MINT>.jsonl` porte **UNE ligne par page** = `{ ...core, entry_sha256, page_events, page_handoffs }` où :
> - **`core`** = les champs §6 **inchangés** : `{ prev_entry_sha256, page, slot_lo, slot_hi, first_sig, last_sig, tx_count, tail_sigs_at_slot_hi[], list_sha256 }` ;
> - **`entry_sha256 = sha256(JSON.stringify(core))`** — **sur le SEUL core**, **JAMAIS** sur `page_events`/`page_handoffs` (la chaîne reste re-dérivable ; `verifyLedgerChain` STRIPE `page_events`/`page_handoffs` avant de hacher) ;
> - **`page_events`** = les `MultiplierEvent` décodés de la page (ex-`events-<MINT>.jsonl`) ; **`page_handoffs`** = les `SetAuthorityHandoff` (ex-`handoffs-<MINT>.jsonl`).
>
> Les fichiers `events-<MINT>.jsonl` et `handoffs-<MINT>.jsonl` **DISPARAISSENT** (un seul `appendFileSync` par page = un point de commit unique ⇒ ferme la fenêtre de désync du fait 7). Une page **fautée n'est PAS écrite** (C-B-1) — **fautes = `bodyQuorumFail`/`blockTimeNull`/`nonMonotonic`** (stop-au-premier-défaut) ; **`notFullPages` est DÉRIVÉ du ledger, JAMAIS une raison de non-écriture** (une page courte non-finale **DOIT** être committée, sinon la pagination ne peut pas continuer) **[SUPERSÉDÉE par L-b1a-1 — cf. §Amendement L-b1a-1 (option d) : `notFullPages` n'est PAS dérivé du ledger (falsifié par le dédoublonnage) ; sous `requireFullPages`, une page dont `data.length` BRUT `< GTFA_PAGE_LIMIT` est une faute re-tirable NON committée + STOP ; `--allow-short-pages` commet]**. Une **queue tronquée** est tronquée à la dernière ligne complète avant tout append ; une ligne illisible hors queue ⇒ throw (C-B-5).
>
> **(2) `candidates/` par mint (C-B-6).** `<out>/candidates/<MINT>/<sig>.json` (sous-dossier par mint) ⇒ la re-dérivation des sha ne mélange jamais deux mints.
>
> **(3) Schéma `budget.json` (C-B-3/C-B-4/C-B-7).** `{ calls_used, credits_worst_case, pages, calls_by_method: { global: {getTransactionsForAddress, getTransaction}, by_mint: { <MINT>: {getTransactionsForAddress, getTransaction} } }, retries_by_method: {getTransactionsForAddress, getTransaction} }`. `calls_by_method.global` est cumulatif (Σ 4 mints, audit §5 delta dashboard) ; `by_mint` est la tranche du mint ; **invariant `Σ global == calls_used`** (couvre `budget_exhausted`). Écrit **en TÊTE de `onPage`** (avant l'append ledger) ET en **`finally`** (chemin d'erreur + desc `:255`). `readPriorCalls` réensemence `calls_by_method`/`credits_recomputed` cumulativement.
---

---

## course (RÉSEAU — orchestrateur ; R-20 : jamais le worker) — **SUSPENDUE**

**SUSPENDUE par l'INCIDENT HELIUS-1** (`CHANTIERS.md:386-390`, `6baa948`) : dashboard **60 938 cr** vs **~11 263 reconstruits** ⇒ **~49 675 non attribués**. La course NE REPREND QUE si les **conditions de reprise** (checkpoint-1 -b3d-b, Q8) sont TOUTES remplies :
- **(a) audit attribuant les crédits — FAIT** (incident HELIUS-1 ouvert ; `F:\PRODUITS\etude-2026-09-21\helius-audit\GRAND-LIVRE-HELIUS-cycle-2026-09-19.md`, sha `a7c3ae13…`). **Critère de GO PRÉ-ENREGISTRÉ (verbatim, `CHANTIERS.md:389`)** : « (export PAR MÉTHODE attribuant ≥ 90 % du résidu à gSFA/getTransaction ET gTfA ≈ compte local) OU (export PAR JOUR = 0 depuis le soir du 2026-09-20) » ; sinon incident maintenu, rotation de clé = action investisseur.
- **(b) deux lectures du dashboard espacées** sans AUCUN process MONARK (débit de fond = 0).
- **(c) PLI §4 rebasé sur le chiffre du dashboard** : consommé **60 938** ; **cumul pire cas ≈ 7 610 938 / 10 M** (marge ≈ 2,39 M) avec une **ligne « non attribué » (~49 675)**. *(Supersède la ligne « 7 578 946 » du PLI §4 l.144.)*
- **(d) première invocation de la sonde = ÉTALONNAGE du coût par appel** : N appels connus, dashboard avant/après lu par l'investisseur, **égalité à Σ méthode × tarif**.
- **(e) date 2026-10-15 sous réserve** (cycle 19 oct ; tirage ~45 h + marge 48 h).
- **(f) verdict à la reprise NON FALSIFIABLE par édition de `page_events`/`page_handoffs`** — **ITEM-A / ITEM-G2-A re-déclenché AVANT LA COURSE, « déclencheur b2 » RETIRÉ** (porteur b1b ou b1a-bis, G0 + checkpoint-1 propres) : un test `runMain` **refusant une reprise sur payload édité** est **VERT**. Contrainte de conception : le `headSha` doit **commettre TRANSITIVEMENT le payload** (un remède restant sur disque — p. ex. re-décodage depuis `candidates/<MINT>/` sans engagement chaîné — est défait par la même édition) ; **tension avec §6/L-b1a-6** (`entry_sha256` sur le SEUL core §6) à trancher au G0 du porteur. `error_origin` : worker G1 + relecteur G2 + validateur. [détail : `docs/PLI-lot-t1a-ii-b3d-b1a.md` §Pli checkpoint-2 C-V-3]

**Séquence (une fois DÉBLOQUÉE)** : sonde C-7 (a,b,c,d,g, 4 mints, MÊME `--out`) → [T-1a-iii phase B, 50 000 cr, ledger DÉDIÉ, décision 84] → tirage full-mint (ordre TSLAx→AAPLx→NVDAx→SPYx, sous-plafonds Amendement 3, reprise idempotente L-b1a) → audit §5 (`verifyLedgerChain`, delta dashboard ≤ `credits_recomputed`, borné par `retries_by_method`). **AUCUN autre consommateur Helius pendant la sonde et le tirage** (worktree épinglé au sha de fusion de b1).

**Routage C-4 (INVESTISSEUR, jamais « consultation orchestrateur »)** : coût projeté OU réel > 6,5 M ; cumul cycle > 10 M ; activation autoscaling (5 $/M [lu], off ⇒ arrêt système à 10 M, à reconfirmer au dashboard AVANT) ; tirage à cheval sur le 19 oct déplaçant -b1-bis-ii ; « accepter un partiel » après `inconclusive` ; toute divergence ⇒ **ESCALADE-INVESTISSEUR**. Chainstack : renouvellement FAIT (`CHANTIERS.md:242`) ⇒ CLOS.

---

## -b3d-b2 (POST-TIRAGE, conditionnel) — Livrables + **checkpoint-1 delta OBLIGATOIRE**

**Branche conditionnelle (l'ADR ne publie QUE si)** : `equal` **4/4** ∧ **H1 STRICTE** (`fieldDiffs` VIDES 4/4, C-V-8) ∧ **H3** (`authority_change_found:false` 4/4). **Sinon** STOP, `pending` CONSERVÉ, items formés, ESCALADE-INVESTISSEUR. **Condition validateur** : **-b3d-b2 = ACCEPTE-AVEC-CORRECTIONS conditionnel ⇒ un checkpoint-1 DELTA est OBLIGATOIRE après le tirage** (les corps réels changent les faits) avant tout G2/G7 de b2.

### L-2b-1 — L-1 prod : piggyback SetAuthority + attestation `source` (fait 10)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/rebase-scan.ts` (recevoir `normalizeBody`), `apps/bell/src/rebase-produce.ts` (import `setAuthorityHandoffsFromTx` + piggyback + attestation), `apps/bell/src/rebase-crosscheck.ts` (drop import `:34`) |
| **Anti-cycle (fait 10)** | déplacer `normalizeBody` (`rebase-produce.ts:66-74`) vers `rebase-scan.ts` ; MAJ 2 sites (`rebase-crosscheck.ts:34`, `rebase-produce.ts:123`) — grep : 2 importeurs code ⇒ aucun re-export ⇒ `rebase-produce.ts` importe `setAuthorityHandoffsFromTx` **sans cycle**, décodeur intact (29 tests). |
| **Piggyback + `source`** | dans `produceTrajectories` (`rebase-produce.ts:117-147`), sur `en.bodies` (coût 0) : `setAuthorityHandoffsFromTx(...)` par corps ⇒ attestation `setAuthorityScan { scanned, authority_change_found, source: "piggyback" }`. **Le leg A→B est signé par A=S7vYFF** (`ADR-T1aii:230-233` [lu]) ⇒ dans l'historique de S7vYFF ⇒ détecté — **pour les courses FUTURES**. |
| **Source des 4 SÉRIES certifiées (C-B2-3)** : `source: "fullmint"` (issu de `crosscheck-<MINT>.json.set_authority_scan`, L-b1a-9, `through_slot = oracle_slot`) ; le **piggyback** est pour la **production continue**. |
| **Tests** | `bell_setauthority_piggyback_writes_attestation` (fixture S7vYFF avec/sans leg A→B ⇒ `authority_change_found` true/false, `source:"piggyback"` ; via `produceTrajectories`). |
| **Mutants** | **M-2b-1** piggyback ignore les inner instructions (CPI) ⇒ **ROUGE** ; **M-2b-2** `authority_change_found` codé `false` ⇒ **ROUGE**. |

### L-2b-2 — L-5 : chute de `set_authority_unscanned` data-pilotée, attestation AUTO-CONTENUE (C-B2-3, C-B2-2)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/supply.ts` (`rebaseGateFromTrajectory` `:167`), `apps/bell/src/collect.ts` (`TrajectoryInput:485`, `loadTrajectories:554`, `buildSolanaSymbol:540`), `apps/bell/test/rebase-course.test.ts` (`:62`,`:73` MAJ + test neuf), `apps/bell/test/rebase-produce.test.ts` (`:123-125` NOMMÉ) ; `residuals.ts` **inchangé** (option (a)) |
| **Attestation AUTO-CONTENUE (C-B2-3 — `oracle_slot` absent de la signature, fait 12)** | **le PRODUCTEUR** (qui a `oracle_slot`) calcule `scanned = (through_slot >= oracle_slot)` ; l'attestation est `{ scanned, authority_change_found, source }` — **PAS de `oracle_slot` dans `rebaseGateFromTrajectory`** (aucun ripple de signature). Param OPTIONNEL trailing `setAuthorityScan?` (`rebase-gate-gt.test.ts:21/24/28/32` restent VERTS — aucun ne passe `"authority"` ni d'attestation ; absence ⇒ fail-closed conserve les 2 codes). Logique `:173` : `residuals = scanMethod==="authority" ? (setAuthorityScan?.scanned && !setAuthorityScan.authority_change_found && setAuthorityScan.source==="fullmint" ? ["authority_scan_mono_operator"] : ["authority_scan_mono_operator","set_authority_unscanned"]) : []`. |
| **`source` discriminant (C-B2-3)** | **seul `source:"fullmint"` FERME** ; **`source:"piggyback"` ne ferme JAMAIS** un mint nouveau (le piggyback seul ne voit pas un hand-off antérieur signé par une AUTRE autorité) ⇒ résiduel maintenu. `authority_change_found:true` ⇒ **une issue par couche** : gate `rebase_unverified` **ET** verdict de lot STOP. |
| **Tuyau EXÉCUTÉ (C-B2-2, CA-11 durci)** | le tuyau `crosscheck-<MINT>.json.set_authority_scan` → série → `loadTrajectories` → gate doit être **EXÉCUTÉ depuis un artefact écrit par `runMain`** : `--rebase-produce` gagne `--crosscheck-dir` et écrit `setAuthorityScan{source:"fullmint"}` dans la trajectoire pour les mints dont le `crosscheck` est `equal` ; **OU item formé** (déclencheur : b2 ; propriétaire worker b2). Test `bell_authority_gate_drops_set_authority_after_crosscheck` exécute producteur → fichier → `loadTrajectories` → gate. |
| **`rebase-produce.test.ts:123-125` NOMMÉ (C-B2-1)** | la trajectoire de ce test vient de `produceTrajectories` (piggyback, **sans** attestation `fullmint`) ⇒ `set_authority_unscanned` **maintenu** ⇒ **ligne `:125` reste VERTE — CONTRÔLE** que le piggyback seul ne sur-ferme pas. Un test **NEUF** exerce le chemin `fullmint` (ferme ⇒ 1 résiduel). |
| **Tests** | `bell_authority_gate_drops_set_authority_after_crosscheck` (fermeture data-pilotée `fullmint`) ; `rebase-course.test.ts:62`/`:73` MAJ (avec attestation `fullmint` ⇒ 1 résiduel ; contrôle « sans attestation ⇒ 2 codes » conservé). |
| **Mutants** | **M-2b-3** gate ferme **sans lire l'attestation** ⇒ un fichier sans attestation perd `set_authority_unscanned` ⇒ **ROUGE** ; **M-2b-3b** ferme sur `source:"piggyback"` ⇒ **ROUGE** ; **M-2b-4** `set_authority_unscanned` ré-émis après fermeture ⇒ **ROUGE**. |

### L-2b-3 — L-4 : retrait `pending` (à `equal` 4/4) + C-V-9 réel + artefacts + ADR ; point de rebase R1/b2 (C-B2-4)
| Champ | Contenu |
|---|---|
| **Fichiers** | 4 `rebase-<MINT>.json` (`pending` retiré + `setAuthorityScan` — **R-25 exclus**), `crosscheck-*.json` réels (**exclus**), `PROVENANCE-crosscheck-fullmint.md` (**COMPTÉ**), `PROVENANCE-rebase-course.md` (MAJ, **COMPTÉ**), `docs/adr/ADR-T1aii…` D1-quater final (**exclu**), `apps/bell/test/rebase-crosscheck.test.ts` (C-V-9 réel) |
| **L-4 code = 0 (fait 13)** | `SCAN_METHOD_MAP` porte déjà les 2 libellés ⇒ le retrait de `pending` ne change AUCUN code. |
| **C-V-9 réel** | `bell_crosscheck_committed_artifacts_replay` sur les 4 `crosscheck-*.json` **réels écrits par le CLI** ; `method` sans `pending` **ssi** `equal` 4/4. |
| **Point de rebase R1/b2 NOMMÉ (C-B2-4)** | **`buildSolanaSymbol` (`collect.ts:540` appel du gate ; `:545` `quoteDec: 6` en dur, à 5 lignes)** — c'est le site où R1 (registre multi-émetteur) et b2 (attestation vers le gate) se croisent. Le rebase de b2 sur R1 (ordre A) se joue ICI. |
| **C-13 (item G1)** | `series_pinned_are_declared_and_hashed` accepte-t-il **DEUX** `PROVENANCE-*.md` sous `series/rebase/` ? sinon **fusionner**. **À trancher au G1** (NON plié ici). |
| **ADR D1-quater final** | méthode, invariance, coût mesuré réel, deux issues STOP, C-V-8 (publie ssi H1 STRICTE 4/4), fermeture `set_authority_unscanned`, `pending` retiré, tuyaux MAJ. **N'existe QUE si `equal` 4/4.** |

---

## R1 « registre multi-émetteur » — DEUX ORDRES POSSIBLES, **EN ATTENTE (ESCALADE-INVESTISSEUR)**

L'ordre R1 / -b3d-b2 est une **ESCALADE-INVESTISSEUR EN ATTENTE** (ne présume aucune réponse). Décision **85** (`CHANTIERS.md:254` [lu]) : R1 « **après fusion -b3d-b** » — la contrainte discriminante est de savoir si « -b3d-b » désigne **b1** ou **b2** (le « dernier sous-lot -b3d-b » = -b3d-b2, post-tirage). Les DEUX ordres sont écrits ; l'orchestrateur route l'escalade.

- **ORDRE (A) — recommandé par le validateur ET l'orchestrateur** : **R1 après la fusion de -b3d-b1** ; **-b3d-b2 rebasé sur R1 APRÈS le tirage** (au point `collect.ts:540/545`, C-B2-4). Séquence complète recommandée (Q6) : b1a → b1b → Amendement 3 committé seul → **R1** → G0 -b1-bis-ii **hors ligne EN PARALLÈLE** de la course → course (worktree épinglé au sha de fusion de b1, aucun autre consommateur Helius) → **b2 rebasé sur R1 après checkpoint-1 delta** → T-1b derrière b2.
- **ORDRE (B)** : **R1 DERRIÈRE -b3d-b2** (lecture stricte de la décision 85 : « après fusion -b3d-b » = après le **dernier** segment -b3d-b = -b3d-b2). R1 attend alors la fusion de b2.

**Note de conflit (les deux ordres)** : -b3d-b1 (gates + retry + density sur `collect.ts`) ET -b3d-b2 (`TrajectoryInput`/`loadTrajectories`/`buildSolanaSymbol` sur `collect.ts`) touchent tous deux `collect.ts` ⇒ un R1 touchant Bell risquerait un conflit au point `collect.ts:540/545` (C-B2-4). R1 est **≈ 350 l. additif sans re-pin** (advisor `CHANTIERS.md:249`), vraisemblablement un nouveau module registre disjoint du plumbing crosscheck — mais l'ordre est une DÉCISION INVESTISSEUR, pas une déduction du worker.

---

## Mutants imposés (récapitulatif ; `cp` sha-exact depuis pristine, jamais `git checkout`)
**b1a** : M-b1a-1 page committée malgré le drapeau ; M-b1a-1b `notFullPages` process-local ; M-b1a-2 `readdirSync` plat mélange les mints ; M-b1a-3 compteur avant le garde ; M-b1a-4a budget hors `finally` ; M-b1a-4b `retries_by_method` non persisté ; M-b1a-5 queue tronquée en milieu tolérée sans vérif ; M-b1a-7/9 `entry_sha256` inclut `page_events` ; M-b1a-7b `core` sans `prev_entry_sha256` ; M-b1a-8a semis retiré ; M-b1a-8b `pages=scan.pages` ; M-b1a-8c retry avale BudgetExceeded ; M-b1a-13 replay reconstruit à la main ; M-b1a-14 écriture non monotone. **b1b** : M-b1b-10 density écrit un ledger ; M-b1b-11 genesis date-estimé ; M-b1b-12 hors gate `--max-credits` ; M-b1b-12b `calls_by_method` local ; M-b1b-13 `min` au lieu de `max` ; M-b1b-14 densité `max × span`. **b2** : M-2b-1 piggyback ignore CPI ; M-2b-2 `authority_change_found` faux ; M-2b-3 gate ferme sans attestation ; M-2b-3b ferme sur `piggyback` ; M-2b-4 résiduel ré-émis.

## Tuyaux (ADR-M018 D3 ; à porter en ADR-T1aii D1-quater final)
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| reprise sans faux `equal` (C-B-1) | `ledger-<MINT>.jsonl` (pages saines) | verdict correct (jamais faux `equal`) | **upcoming** | `bell_crosscheck_resume_after_decode_fault_is_not_equal` |
| écriture monotone (C-B-2) | artefact existant | artefact non dégradé | **upcoming** | `bell_crosscheck_artifact_write_is_monotone` |
| compteur == calls_used (C-B-3) | couche budget | `Σ calls_by_method == calls_used` (audit §5) | **upcoming** | `bell_crosscheck_calls_by_method_equals_calls_used` |
| budget durable (C-B-4) | chemin d'erreur/desc | `budget.json` complet + `retries_by_method` | **upcoming** | `bell_crosscheck_budget_persists_on_error_path` |
| ledger → vérificateur (C-V-3) | `ledger-<MINT>.jsonl` | `verifyLedgerChain` (audit §5) | **upcoming** | `bell_crosscheck_ledger_chain_rederives_from_disk` |
| densité → calibrage H6 | oracle_slot + genesis MESURÉ | `sonde-report.json` (N+intervalle+`genesis_slot`+durée) | **upcoming** | `bell_density_projects_N_with_interval` |
| projection H6 hors process | `slot_hi` ledger + `genesis_slot` | STOP/continue (orchestrateur) | **upcoming** | `bell_h6_projection_pure_function` |
| artefact CLI → comparateur (C-V-9) | `crosscheck-*.json` (écrit par `runMain`) | verdict rejoué == committé | **upcoming** | `bell_crosscheck_committed_artifacts_replay` |
| SetAuthority → attestation (prod) | historique S7vYFF (piggyback ~0 cr) | `setAuthorityScan{source:"piggyback"}` | **upcoming** | `bell_setauthority_piggyback_writes_attestation` |
| attestation → gate (résiduel) | `crosscheck-*.json.set_authority_scan` (`source:"fullmint"`) | `set_authority_unscanned` fermé/maintenu | **item à déclencheur** (`equal`→L-4 ; H3 `fullmint`→L-5) | `bell_authority_gate_drops_set_authority_after_crosscheck` |

## Risques (MAST) + anti-close + secrets
- **FAUX `equal` par reprise (V-1) — le mode d'échec dominant, découvert au checkpoint-1** (falsifie « jamais de faux `equal` » du G7 -b3d-a, `CHANTIERS.md:382-384`, `7aae8d7`) ⇒ C-B-1 (page fautée non committée) + L-b1a-9 (page atomique) + L-b1a-8 (semis). **fail-closed rétabli et PROUVÉ** par `…resume_after_decode_fault_is_not_equal`.
- **Écrasement d'un `equal` (V-2)** ⇒ C-B-2 (écriture monotone). **Compteur désaccordé (V-3)** ⇒ C-B-3 (couche budgétée).
- **Vérification incomplète** (ledger non re-dérivé) ⇒ `verifyLedgerChain` (C-V-3).
- **Surdépense masquée** (budget non durable) ⇒ C-B-4 (`finally` + `retries_by_method`).
- **Méconnaissance des conditions d'arrêt (H6)** ⇒ density-sonde + projection hors process + sous-plafonds cumulatifs (Amendement 3).
- **Consommation non attribuée (HELIUS-1)** ⇒ course SUSPENDUE, garde de budget + rapprochement dashboard obligatoire.
- **Décodeur partagé** (full-mint vs runner) ⇒ backstop C-3, indépendance décodeur non établie (déclaré, C-11). **Énumération mono-opérateur Helius** ⇒ `authority_scan_mono_operator` **conservé** (décision 67).
- **Anti-close** : fixtures b1a/b1b 100 % synthétiques ; `crosscheck-*.json` réels (b2) = événements on-chain publics (décision 52 [lu] `CHANTIERS.md:117`) ; masquage `[masqué]`. **Secrets** : `BELL_SOLANA_RPC` jamais imprimée (`collect.ts:285`), `no_secret_in_repo` vert, opérateurs par domaine (`providerOf`/`operatorOf`).

## Questions checkpoint-1 — mapping validateur Q1..Q9 (les Q du validateur ≠ les Q du G0 source)
- **Val-Q1** (≈ G0-Q2, idempotence terminale) : trois fuites réelles, **semis correct**, mais **idempotence INSUFFISANTE** ⇒ C-B-1, C-B-2, C-B-6 (pliés b1a).
- **Val-Q2** (≈ G0-Q1, retry) : retry **confirmé** (`withRetry` injecté, `tries=6`, non rejouables re-lancées, `Retry-After` formé ; ne peut ni dépasser `--max-credits` ni doubler un ledger) **sous C-B-3/4**.
- **Val-Q3** (≈ G0-Q3, ordre d'append) : **option (A) confirmée sous C-B-5/7** (interaction avec C-G2D-2 sûre).
- **Val-Q4** (≈ G0-Q4, H6) : **Amendement 3 légitime** (texte = C-B-8, ci-dessus).
- **Val-Q5** (≈ G0-Q5, densité) : **mode `--rebase-density` confirmé**, ≤ 48 appels / 480 cr.
- **Val-Q6** (NOUVELLE — séquence) : ordre recommandé (A) ci-dessus ; l'ordre R1/-b3d-b2 reste **EN ATTENTE**.
- **Val-Q7** (L-5 sans re-pin) : **PROUVÉ** (`tslaxInput()` `collect.test.ts:43-54` sans `rebase` ; anti-cycle confirmé).
- **Val-Q8** **[INV]** (≈ G0-Q8, fenêtre) : conditions de reprise (a)-(e) ci-dessus (§course SUSPENDUE).
- **Val-Q9** **[INV]** (≈ G0-Q9) : **routage C-4 confirmé**.
- **NON PLIÉ (renvoi G1)** : G0-Q7 source (deux `PROVENANCE-*.md`, C-13) — reste un item G1 de b2 (voir « points non pliés »).

---

## Inventaire des `let` de `scanFullMint` (C-B-1) — chaque liaison classée, avec preuve
**11 liaisons `let`** (lignes `:202-205`). Les **const** `events`/`handoffs`/`ledger` (`:199-201`) sont réensemencées de `resume.prior*` (hors `let`, listées pour complétude). Les **7 candidats-fuite** du validateur = les 3 traités par le G0 (fait 1/3) + les 4 ouverts (C-B-1) ⇒ « 3 sur 7 ».

| `let` (ligne) | Classe | Preuve |
|---|---|---|
| `prevSha` (`:202`) | **RÉENSEMENCÉ** | `= ledgerSha(ledger)` ; `ledger` = `priorLedger` (`:201`) ⇒ dérivé de l'état repris |
| `pages` (`:202`) | **RÉENSEMENCÉ (mais DÉRIVE +1)** — *candidat-fuite 1/7, traité G0 fait 3* | `= ledger.length` ; MAIS `:242 pages+=1` s'exécute sur page 0-tx (`:240` null) ⇒ artefact dérive ⇒ **fix : artefact `pages=ledger.length` + compteur `fetched`** |
| `n` (`:202`) | **RÉENSEMENCÉ** | `= ledger.reduce((a,e)=>a+e.tx_count,0)` ⇒ recompté du ledger repris |
| `paginationToken` (`:203`) | **N/A (page-local, par conception)** | la reprise repart par `filters.slot.gte = resumeFromSlot` (`:208`), PAS par le token ; le dédoublonnage de frontière (`:220`) rend la reprise lossless ⇒ ne PAS porter le token |
| `blockTimeNull` (`:204`) | **FAIL-CLOSED intra-process, NON persisté ⇒ OUVERT (C-B-1)** — *candidat-fuite 4/7* | nourrit `complete` (`:262`) mais reprise ⇒ `false` ⇒ **fix : page à blockTime nul NON committée + stop** |
| `bodyQuorumFail` (`:204`) | **OUVERT (C-B-1) — RACINE de V-1** — *candidat-fuite 5/7* | `:236` set + `continue` (événement dropé) ; page committée `:240-241` ; reprise ⇒ `false` ⇒ faux `equal` ⇒ **fix : page fautée NON committée + stop** |
| `exhausted` (`:204`) | **N/A (terminal par process, recomputé)** | vrai ssi CE process a atteint `:244` (fin de pagination) ; un process repris ré-établit sa propre fin ; ne doit PAS voyager (process 1 non épuisé ⇒ process 2 continue) |
| `notFullPages` (`:204`) | **OUVERT (C-B-1) — mais DÉRIVABLE** — *candidat-fuite 6/7* | `:245` set sur page courte non-finale ; reprise ⇒ `false` ⇒ **fix : DÉRIVER du ledger (`ledger.slice(0,-1).some(e=>e.tx_count<1000)`)**, pas un drapeau process-local |
| `nonMonotonic` (`:204`) | **OUVERT (C-B-1)** — *candidat-fuite 7/7* | `:221` set si `nb.slot < lastSlotSeen` ; reprise ⇒ `false` ⇒ **fix : page non-monotone NON committée + stop** |
| `lastSlotSeen` (`:205`) | **RÉENSEMENCÉ (fix G0 fait 1)** — *candidat-fuite 2/7, traité* | non semé aujourd'hui ⇒ **fix : `= last.slot_hi` de `priorLedger.at(-1)`** |
| `ascLastSig` (`:205`) | **RÉENSEMENCÉ (fix G0 fait 1)** — *candidat-fuite 3/7, traité* | non semé aujourd'hui ⇒ **fix : `= last.last_sig`** ; équivalence `:142`/`:222-223` vérifiée |

**Bilan** : 3 réensemencés « propres » (`prevSha`,`n`, + `ledger`/`events`/`handoffs` const) ; 2 N/A par conception (`paginationToken`,`exhausted`) ; **7 candidats-fuite** dont **3 traités par le G0** (`lastSlotSeen`,`ascLastSig`,`pages`) et **4 ouverts** (`blockTimeNull`,`bodyQuorumFail`,`notFullPages`,`nonMonotonic`) — pliés par C-B-1 (page fautée non committée + stop ; `notFullPages` dérivé). Le test terminal prouve qu'un `inconclusive` collant ne se **PROMEUT** jamais par relance.

---

## PLI checkpoint-1 — table de traçabilité (correction → section)
| Correction / défaut | Où plié dans ce G0 | Bloquant |
|---|---|---|
| **V-1** faux `equal` par reprise | Faits 7/8 (révisés) + L-b1a-1 + L-b1a-9 + Inventaire `let` + Risques | oui (racine) |
| **V-2** `equal` écrasé sous budget mordant | Fait 4 + L-b1a-2 | oui |
| **V-3** `Σ calls_by_method` ≠ `calls_used` | L-b1a-3 (fait 8/collect.ts) | oui |
| **C-B-1** drapeaux collants | L-b1a-1 + Inventaire `let` (7 candidats, 3/7 traités) | oui |
| **C-B-2** écriture monotone | L-b1a-2 | oui |
| **C-B-3** compteur par méthode (après garde) | L-b1a-3 | oui |
| **C-B-4** budget durable (`finally`+`retries_by_method`) | L-b1a-4 | oui |
| **C-B-5** queue tronquée | L-b1a-5 | oui |
| **C-B-6** `candidate_shas` par mint | L-b1a-7 (re-spécifie M-b1-2 du G0 source) | oui |
| **C-B-7** format ledger = amendement PLI | L-b1a-9 + Amendement de format (texte) | oui |
| **C-B-8** texte Amendement 3 (a)-(f) | Amendement 3 (texte complet) + L-b1b-2 | oui |
| **C-B-9** découpe b1a/b1b d'emblée + R-25 ×2 | §Découpe + seam interne | oui |
| **C-B2-1** `rebase-produce.test.ts:123-125` nommé | Fait 15 + L-2b-2 (contrôle vert) | oui (b2) |
| **C-B2-2** tuyau attestation exécuté via `runMain` | L-2b-2 (`--crosscheck-dir` OU item) | oui (b2) |
| **C-B2-3** `oracle_slot` absent ⇒ attestation auto-contenue + `source` | Fait 12 + L-2b-2 | oui (b2) |
| **C-B2-4** point de rebase R1/b2 nommé | L-2b-3 (`collect.ts:540/545`) + §R1 | oui (b2) |
| Non bloquant : backoff réel 8,4 s | Fait 9 + L-b1a-8 | non |
| Non bloquant : `Retry-After` item maintenu | L-b1a-8 | non |
| Non bloquant : semis `ascLastSig=last.last_sig` équivalence | L-b1a-8 + Inventaire `let` | non |
| Val-Q1..Q9 (mapping) | §Questions checkpoint-1 | — |
| ERRATUM « jamais de faux equal » cité | Cadre + Fait 7 + Risques (`7aae8d7`) | — |
| INCIDENT HELIUS-1 (course suspendue) | §course SUSPENDUE (`6baa948`) | — |

---

## Rendus de mission

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`, effort max, non banni).

**Résumé (12 lignes)**
1. -b3d-b se découpe **d'emblée** en **-b3d-b1a (reprise/ledger/budget)** / **-b3d-b1b (densité + H6 hors process)** / **course (orchestrateur, SUSPENDUE)** / **-b3d-b2 (post-tirage, conditionnel + checkpoint-1 delta)**.
2. **V-1 (faux `equal` par reprise)** est la racine : drapeaux collants (`:204`) + page committée sans son événement (`:240-241`) ⇒ full-mint et série amputés du MÊME événement s'accordent faussement. Falsifie « jamais de faux `equal` » (`7aae8d7`).
3. **C-B-1** : page fautée **NON committée + stop-au-premier-défaut** (corollaire écrit : committer P+1 = V-1 à nouveau) ; `notFullPages` **dérivé du ledger** ; inventaire des 11 `let` (3/7 candidats-fuite traités par le G0, 4 ouverts).
4. **C-B-2/3/4** : écriture monotone (V-2) ; compteur dans la couche budgétée (V-3, piège « après await » écarté) ; budget en `finally` + `retries_by_method`.
5. **C-B-5/6/7** : queue tronquée (α tronque + `verifyLedgerChain`) ; `candidates/` **par mint** (le `readdirSync` plat du G0 source est FAUX, M-b1-2 re-spécifié) ; format ledger **atomique** ⇒ **amendement PLI daté** (`entry_sha256` sur le core seul).
6. **Amendement 3 (texte complet)** : (a) contradiction du roulant corrigée (sur-consommation = TOUJOURS STOP) ; (b) projection HORS PROCESS (fonction pure) ; (c) estimateur trapézoïdal pré-enregistré, « max × span » rejeté ; (d) sous-plafonds = estimations ponctuelles (marge TSLAx ~100 appels) ; (e) exécutable après C-B-1/2 ; (f) committé seul.
7. **b1b** : `--rebase-density` (K=8 + genesis MESURÉ), 2 gates, alimente le `calls_by_method` GLOBAL, ≤ 48 appels ; fonction pure `projectPagesAtFraction`.
8. **course SUSPENDUE** (HELIUS-1 : 60 938 vs ~11 263 ⇒ ~49 675 non attribués) ; reprise sous (a) critère de GO pré-enregistré, (b) deux lectures espacées, (c) PLI §4 rebasé 7 610 938, (d) étalonnage, (e) 2026-10-15.
9. **-b3d-b2** (si `equal` 4/4 ∧ H1 stricte ∧ H3) : attestation **auto-contenue** (`source:"fullmint"` ferme, `piggyback` non), tuyau exécuté via `runMain`, `rebase-produce.test.ts:125` = contrôle vert ; point de rebase R1/b2 = `collect.ts:540/545`.
10. **R1** : **DEUX ordres EN ATTENTE** — (A) R1 après b1, b2 rebasé sur R1 (recommandé) ; (B) R1 derrière b2 (décision 85 stricte). ESCALADE-INVESTISSEUR.
11. **R-25 ×2 par sous-lot** : b1a ~1 000-1 240 (**seam interne DÉCLARÉ** stockage→logique si > ~1 150) ; b1b ~400-520 ; b2 ~460-580. Plafond 1 205.
12. `PINNED_BELL_SHA` inchangé (Q7 prouvé) ; §2 sha `7071484f…` byte-identique ; R-20/R-21/anti-close/secrets respectés ; erratum + incident cités.

**Points NON PLIÉS (avec raison)** :
- **C-13 (deux `PROVENANCE-*.md` sous `series/rebase/`)** : reste un **item G1 de b2** (le comportement de `series_pinned_are_declared_and_hashed` face à deux PROVENANCE se tranche au G1 avec les artefacts réels, pas hors réseau) — jamais un dû nu, porteur worker b2.
- **C-B2-2 wiring `--crosscheck-dir`** : plié comme **livrable OU item formé** (le choix entre câbler `--rebase-produce --crosscheck-dir` et former l'item dépend du budget R-25 de b2 mesuré au gel) — déclencheur : b2, propriétaire worker b2.
- **`Retry-After` de Helius** : **item formé maintenu** (mesuré à la sonde (d) ; ne peut être plié hors réseau).
- **Valeurs réelles de coût par mint / N exact** : « à mesurer à la sonde » (aucun chiffre réseau ce tour).

**sha256 des deux fichiers** : à recomputer par l'orchestrateur (`sha256sum F:/tmp/bellb3d/pli-cp1/*.md`) ; non embarqués dans les fichiers (point fixe). Le worker ne committe pas (R-20).

## RÉSOLUTION de l'escalade R1 (orchestrateur, 2026-09-21, après le pli — le texte ci-dessus est conservé verbatim)
**Décision investisseur 97** (verbatim « A — R1 après -b3d-b1 », `docs/CHANTIERS.md`) : l'ordre **A** est retenu — R1 après la fusion de -b3d-b1 ; -b3d-b2 est rebasé sur R1. L'ordre B est écarté. Toute mention « EN ATTENTE » ci-dessus est supersédée par cette section. La course reste SUSPENDUE (incident HELIUS-1 : lecture 2 + rapprochement dus).

## Amendement L-b1a-1 (orchestrateur, 2026-09-21, après consultation ADVISOR ; option (d))
**`notFullPages` n'est PAS dérivé du ledger** — la formule du plan `ledger.slice(0,-1).some(e => e.tx_count < 1000)` est FALSIFIÉE par le dédoublonnage de frontière (une page pleine dédoublonnée à 999 serait lue « courte » ⇒ faux STOP à la reprise ; une page courte oubliée serait scellée par l'écriture monotone). Forme retenue : sous `requireFullPages`, une page dont le tableau BRUT (`data.length`, AVANT dédoublonnage) est `< GTFA_PAGE_LIMIT` avec un token de page suivante est une **faute re-tirable C-B-1** (non committée + STOP, `reason: not_full_pages`) ; sous `--allow-short-pages` la page est committée sans drapeau ; `require_full_pages` est persisté dans `budget.json` et une reprise plus stricte que le mode stocké échoue fermé (throw). **Le core §6 du ledger reste à 9 champs** (aucun `raw_count`). Tests T1/T2/T3 + mutants M-b1a-1b/1c/garde. `error_origin` : rédacteur du pli G0 + validateur checkpoint-1 (formule prescrite non vérifiée contre le dédoublonnage).
