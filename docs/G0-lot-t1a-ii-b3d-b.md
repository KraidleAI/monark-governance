# G0 — Sprint backlog sous-lot Bell T-1a-ii-b3d-b (pli SOURCE avant tirage + passage en production de la contre-vérification full-mint)

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, Opus 4.8 1M, non banni, effort max ; source = identité d'exécution de la session). **R-20** : ce worker ne committe pas, ne déclenche aucun workflow ; l'orchestrateur committe. **R-21** : chaque affirmation porte sa preuve reproductible (fichier:ligne vérifié en ouvrant le fichier) ou est marquée « à mesurer à la sonde ». **AUCUN appel réseau dans ce tour** (ni Helius ni Chainstack) ; aucune clé/URL/uuid ; aucune valeur de close ; rien sur C:. Écrit en scratch (`F:\tmp\bellb3d\G0-lot-t1a-ii-b3d-b.md`), dépôt `F:\Monark` (branche `lot/etude-suite`, HEAD `7742416` : -b3d-a FUSIONNÉ à `83da61d`) en LECTURE SEULE.

**Cadre.** -b3d-a a livré (FUSIONNÉ, `83da61d`) : décodeur SetAuthority pur `decodeSetAuthority`/`setAuthorityHandoffsFromTx` (L-1 dec), scanner full-mint résumable borné + ledger chaîné (L-2), comparateur 3 verdicts symétriques (L-3), budget résumable, pré-enregistrement §2 H1..H6 GELÉ + Amendements 1 et 2. Le checkpoint-2 (`docs/CHECKPOINT2-lot-t1a-ii-b3d-a.md`, validateur `claude-fable-5-1`, ACCEPTE-AVEC-CORRECTIONS) a laissé un **registre durable de 7 items AVANT TIRAGE** (`docs/PLI-lot-t1a-ii-b3d.md` §Registre durable, l.317-328) porteur **-b3d-b**, et **BLOQUE le TIRAGE tant que C-V-1..4 + helper de densité + C-V-9 ne sont pas résolus**. Ce sous-lot -b3d-b plie ces items (défauts source), livre le helper de densité, rend l'artefact CLI probant (C-V-9), PUIS — après le tirage réel — passe la contre-vérification en production (L-1 prod, L-5, retrait de `pending`, ADR D1-quater final). Décisions cadres : **67** (`CHANTIERS.md:179` [lu] : hybride + SetAuthority + full-mint croisé, plafond ~6,5 M cr, STOP sur divergence), **83/84** (`CHANTIERS.md:248` [lu] : T-1a-iii phase B 50 000 cr ledger dédié, créneau A après la sonde -b3d hors tirage), **85** (`CHANTIERS.md:254` [lu] : R1 registre multi-émetteur **après fusion -b3d-b**, avant G0 -b1-bis-ii, `PINNED_BELL_SHA` inchangé).

**Isolation.** `apps/bell/**` seulement (+ PLI/ADR docs). Un worker par sous-lot, worktree neuf. **Ne touche pas** CHANTIERS/JOURNAL (garde d'écriture orchestrateur), ni un lot en vol.

---

## Objectif (une phrase)
Rendre la contre-vérification full-mint **exécutable sans dette** (reprise terminale idempotente + retry, budget/comptes cumulatifs, chaîne de ledger prouvée, écriture de page sans fenêtre de désync, helper de densité pour calibrer H6, artefact CLI probant) pour **DÉBLOQUER le tirage** ; puis, **à `equal` 4/4 ∧ H1 stricte ∧ H3 seulement**, retirer `pending`, fermer `set_authority_unscanned` en production, et finaliser l'ADR D1-quater — **toute divergence/incomplétude/dépassement = STOP + ESCALADE-INVESTISSEUR** (C-4).

---

## Découpe proposée (b1 offline / course réseau / b2 post-tirage) — R-25 par sous-lot
Le sous-lot -b3d-b se découpe autour de la **course réseau** (celle-ci est un acte de l'orchestrateur, pas un livrable de code) :

| Segment | Nature | Contenu | Porteur | R-25 (métrique `ins+del`, pathspec `STAT=` `ci.yml:65`) |
|---|---|---|---|---|
| **-b3d-b1** | **OFFLINE, DÉBLOQUE le tirage** | C-V-1 (reprise terminale + retry), C-V-2 (cumuls), C-V-3 (chaîne), ordre d'append (§6), helper de densité (§5), C-V-9 **synthétique** (via `runMain`), artefact `set_authority_scan` ; Amendement 3 (docs, R-25=0) | worker Opus 4.8 → **G2 fraîche** → checkpoint-2 | **projeté ~980-1 050** ; **seam interne b1a/b1b déclaré** (voir ci-dessous) |
| **course** | **RÉSEAU (orchestrateur)** | sonde C-7 (a,b,c,d,g, 4 mints) → [T-1a-iii phase B, 50 000 cr, ledger dédié, décision 84] → tirage full-mint (~5,4 M cr, ~45 h) → audit §5 | **orchestrateur** (R-20 : jamais le worker) | n/a (aucun code ; artefacts hors dépôt) |
| **-b3d-b2** | **POST-TIRAGE, conditionnel** | L-1 prod (piggyback `rebase-produce.ts`), L-5 (chute `set_authority_unscanned`), L-4 (retrait `pending`), C-V-9 **réel**, `crosscheck-*.json` réels, `PROVENANCE-crosscheck-fullmint.md`, ADR D1-quater final | worker Opus 4.8 → **G2 fraîche** → checkpoint-2 → G7 | **projeté ~400-460** (PROVENANCE `.md` comptée ; séries json + ADR exclus) |

**Facteur R-25 mesuré de ce lot (calibrage imposé par la mission)** : -b3d-a **projeté ~555-811 ⇒ mesuré 1 130** (`PLI` l.238 : `1 110 ins / 20 del / 1 130 ins+del ≤ 1 205`). Ratio mesuré/projeté ≈ **1,4-2,0×** (le ×1,5 historique sous-estimait). J'applique **~2× conservateur** aux estimations brutes ci-dessous, plafond **1 205** (`ci.yml:43`).

**Seam interne -b3d-b1 (chemin ATTENDU, décidé par la mesure `STAT=` au gel — calque -b3d-a)** : si le mesuré au gel > ~1 050, scinder
- **-b3d-b1a** : C-V-1 + C-V-2 + C-V-3 + ordre d'append + C-V-9 synthétique + artefact `set_authority_scan` (les correctifs de **reprise/ledger/budget** — cœur de la fidélité de la reprise) ;
- **-b3d-b1b** : **helper de densité** (§5 ; pièce la plus sévérable — mode CLI nouveau, couplage minimal) + calibrage H6.
Les DEUX doivent fusionner **avant la course** (b1a débloque la reprise, b1b calibre H6). L'Amendement 3 (docs) et le prereg §2 (gelé) restent hors R-25 (`docs/**/*.md` exclus, `ci.yml:65`).

### Pathspec R-25 vérifiée (`ci.yml:65`, `STAT=`)
Exclus : `:(exclude,glob)docs/**/*.md` (⇒ **ADR-T1aii, G0/PLI/checkpoints NE COMPTENT PAS**), `docs/G1-lot-*.md`, `docs/G2-lot-*.md`, `package-lock.json`, `:(exclude,glob)apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}` (⇒ **`rebase-*.json`, `crosscheck-*.json` NE COMPTENT PAS**). **COMPTÉS** : tout `apps/bell/src/*.ts`, `apps/bell/test/*.test.ts`, et **`PROVENANCE-*.md` sous `series/rebase/`** (l'exclude series ne vise que json/jsonl/csv ; `docs/**` ne couvre pas `apps/bell/**`). Métrique `ins+del+0` (`ci.yml:69`), plafond `VIBEGATES_PR_LIMIT=1205` (`ci.yml:43`).

---

## Faits mesurés [lu] (fichier:ligne vérifié) qui fixent les correctifs

1. **[lu] `rebase-crosscheck.ts:199-202`** : `events`/`handoffs`/`ledger`/`prevSha`/`pages`/`n` SONT réensemencés depuis `resume.prior*`. **`:205`** : `let lastSlotSeen = -1, ascLastSig = "";` — **NON réensemencés**. `:222` les affecte APRÈS le `continue` de dédoublonnage `:220`. ⇒ **C-V-1** : à une reprise APRÈS épuisement (toutes les tx de la page frontière dédoublonnées `:220`), `ascLastSig` reste `""` ⇒ l'ancre de fin `:257` (`descTop.sig === ascLastSig`) échoue ⇒ `end_anchor_mismatch` **permanent** (`:266`), et `runRebaseCrosscheckCli` **réécrit** `crosscheck-<MINT>.json` (`:477`) ⇒ un `equal` antérieur est **ÉCRASÉ** par `inconclusive`.
2. **[lu] `rebase-crosscheck.ts:454` + `:468` + `:476`** : `candidateShas` est **par mint par process** ; l'artefact écrit `candidate_shas: candidateShas` (`:476`). Une reprise terminale 0-page écrit `candidate_shas: {}` ⇒ **les sha-pins C-5 des corps candidats disparaissent** (2ᵉ fuite terminale, au-delà de `ascLastSig`).
3. **[lu] `rebase-crosscheck.ts:240-242`** : `pages += 1` (`:242`) s'exécute **même quand `chainedLedgerEntry` rend `null`** (`:240`, page toute-dédoublonnée). L'artefact publie `pages: scan.pages` (`:478`) ⇒ **`pages` dérive de +1 à chaque reprise** (3ᵉ fuite terminale).
4. **[lu] `rebase-crosscheck.ts:451-452` + `:473` + `:476`** : `callsByMethod` (`:451`) et `credits_recomputed` (`:473`) sont **par process** ; l'artefact les écrit tels quels (`:476`). `calls_used`/`credits_worst_case` de `budget.json` (`:463`,`:471`) SONT cumulatifs (via `callsUsed()` = `budgeted.calls()`, offset `priorCalls` `collect.ts:298`). ⇒ **C-V-2** : `credits_recomputed` sous-compté dès la 1ʳᵉ reprise (mesuré checkpoint-2 : sonde 11 + tirage 31 = **42**, artefact affiche **20**), or sonde→tirage EST une reprise ; l'audit §5 (delta dashboard vs `credits_recomputed`) serait faux.
5. **[lu] `rebase-crosscheck.ts:136-144` (`chainedLedgerEntry`) + test `:282-290`** : `entry_sha256 = sha(JSON.stringify(core))` où `core` inclut `prev_entry_sha256` (`:142-144`) — **code correct**. Le test `bell_crosscheck_ledger_is_chained_and_rederivable` (`:282`) vérifie que le champ est **porté** (`:285`) et que `ledgerSha` rend le dernier `entry_sha256` (`:289`), **jamais ne RE-DÉRIVE** `sha(JSON.stringify(core))`. ⇒ **C-V-3** : mutant « `entry_sha256` sans `prev_entry_sha256` » **survit 29/0** ; la propriété « `ledger_sha256` commet transitivement toutes les pages » (graine de l'audit C-5) n'est tenue par aucun test.
6. **[lu] `rebase-crosscheck.ts:422-424` (`readJsonl`)** : `.split("\n").filter(nonempty).map(JSON.parse)` — **aucune tolérance de ligne tronquée**. Or `appendFileSync` d'une ligne de page n'est **pas atomique au crash** ⇒ une ligne partielle en queue fait **`JSON.parse` throw à la reprise** (défaut PRÉ-EXISTANT, indépendant de l'ordre d'append). `ledgerPagesOnDisk:389` compte une ligne tronquée comme une page (non-vide) ⇒ conservateur pour la garde (b) `:416`.
7. **[lu] `rebase-crosscheck.ts:457-469` (`onPage`)** : ordre **`budget.json` (`:463`) → `ledger` (`:464`) → `events` (`:465`) → `handoffs` (`:466`)**. Un crash entre `:464` et `:465` laisse la page au ledger mais **ses events non** ⇒ à la reprise (`resumeFromLedger:429`, `resumeFromSlot=slot_hi`) la page n'est **ni re-tirée ni ré-ensemencée** ⇒ perte de l'`Initialize` ⇒ `no_initialize_anchor` (`:266`), OU perte d'un update ⇒ `divergence`. **Fail-closed** (jamais de faux `equal` ni surdépense) mais **FAUSSE escalade qui brûle la dépense**. Pas de point d'injection intra-`onPage` aujourd'hui (`PLI` l.193 : le sink est construit dans `runRebaseCrosscheckCli`).
8. **[lu] `rebase-crosscheck.ts:474-478`** : l'artefact `crosscheck-<MINT>.json` (`:474-476`) **n'inclut PAS `handoffs`** (seul le rapport `:478` porte `handoffs: scan.handoffs.length`). ⇒ L-5 ne peut PAS lire l'attestation SetAuthority depuis l'artefact tel quel : **b1 doit ajouter `set_authority_scan` à l'artefact**.
9. **[lu] `collect.ts:316-325`** : `withRetry` **EXISTE** (4 essais, backoff `400*(i+1)` `:322`, re-throw immédiat de `BudgetExceededError` `:322`, retry seulement sur `/HTTP 5|HTTP 429|timeout|transport/` `:322`, sinon re-throw), utilisé `:365`/`:401`, mais **privé à `collect.ts`**. `scanFullMint` **n'a aucun retry** sur ses appels gTfA/opB (`:210`, `:233`). Import direct impossible sans cycle (`rebase-crosscheck.ts:34` importe `normalizeBody` de `collect.ts`… non : de `rebase-produce.ts` ; et `collect.ts:29` importe de `rebase-crosscheck.ts` ⇒ un import inverse **créerait un cycle**). **Aucune règle eslint `import/no-cycle`** (vérifié : les matches sont des sous-chaînes « circular » dans des tests).
10. **[lu] `rebase-crosscheck.ts:34`** : le **SEUL** import de `rebase-crosscheck.ts` depuis `rebase-produce.ts` est `normalizeBody`. `normalizeBody` est défini `rebase-produce.ts:66-74` et importé UNIQUEMENT par `rebase-crosscheck.ts:34` (grep). ⇒ le déplacer vers `rebase-scan.ts` (où vivent déjà `flattenInstructions:58`, `keysOfJson:46`, `bodyEventKey:181`) **brise la seule arête** `rebase-crosscheck → rebase-produce` ⇒ `rebase-produce.ts` peut importer `setAuthorityHandoffsFromTx` de `rebase-crosscheck.ts` **sans cycle**, et le décodeur [lu] reste où les 29 tests -b3d-a l'importent (`rebase-crosscheck.test.ts:14`).
11. **[lu] `collect.ts:437-454`** : gates d'arguments — `--max-calls` requis+>0 (`:437-439`), `--max-credits` requis pour `--rebase-crosscheck` (`:444`), `--max-pages` requis pour `--rebase-crosscheck` (`:452`). **[lu] `collect.ts:589`** : `priorCalls = rebaseCrosscheck ? readPriorCalls(out) : 0`. ⇒ un **nouveau mode** (helper de densité) doit être ajouté aux **trois** conditions, sinon il dépense hors-unité-crédit (défaut C-G2-1) ou remet le compteur cumulatif à zéro.
12. **[lu] `supply.ts:167` + `:173`** : `rebaseGateFromTrajectory(events, from, to, scanComplete, scanMethod?)` code **en dur** `residuals = scanMethod==="authority" ? ["authority_scan_mono_operator","set_authority_unscanned"] : []` (`:173`) — **aucune entrée d'attestation**. Appelants (grep) : `collect.ts:540`, `rebase-course.test.ts:59/71/75`, `rebase-gate-gt.test.ts:21/24/28/32`. **[lu] `residuals.ts:34` (`authority_scan_mono_operator`), `:37` (`set_authority_unscanned`)** : enum fermé.
13. **[lu] `rebase-produce.ts:40-47`** : `SCAN_METHOD_MAP` contient **DÉJÀ** `"hybrid-authority-scan (pending R-26 ratification)" → "authority"` (`:45`) ET `"hybrid-authority-scan" → "authority"` (`:46`) ⇒ **L-4 (retrait `pending`) ne change AUCUN code** (`bell_series_method_maps_to_authority` déjà vert, `rebase-crosscheck.test.ts:274`) ; le changement de `method` vit dans les séries json (**R-25 exclus**).
14. **[lu] `collect.test.ts:79`** `PINNED_BELL_SHA = "0cfbed20fc7ab4391b687d870452211cdce02c3cc19ab1cc8f0425a3c24743d7"` (== base attendue G0 -b3d l.20), **`:80`** `PINNED_BELL_SHA_B3A` récupéré par soustraction, **`:599`** `bell_pinned_sha_reduces_to_b3a_by_subtraction`. **[lu] ADR-T1aii:306-307** : précédent -b3b de **re-pin par soustraction** (« retirer `earliest_publish_utc` des gaps + les 2 clés `cash_*` ⇒ `126abfae…` »).
15. **[lu] `ADR-T1aii:272-274`** : `set_authority_unscanned` = « faille résiduelle côté signataire (A→B→A avec updates B-signés qui s'annulent) ; **déclencheur : scan SetAuthority du mint** » ⇒ la fermeture est data-pilotée par l'attestation, jamais un défaut de forme (checkpoint-1 C-3).

---

## -b3d-b1 (OFFLINE) — Livrables

> Discipline commune : fixtures 100 % synthétiques (signatures/slots/littéraux, C-16), `cp` byte-exact depuis pristine pour les mutants (**jamais `git checkout`**, R-20), `PINNED_BELL_SHA` prouvé inchangé (`collect.test.ts:96` + `:599`), anti-close (aucune valeur de close ; jeton `[masqué]`), `BELL_SOLANA_RPC` jamais imprimée. **§2 du PLI (H1..H6) reste BYTE-IDENTIQUE** (sha256 `7071484f3444abe6c09b694f730ad2fcce2f00ea8c12e8cc39fc31806a3c7867` ; recompute `awk '/^## 2\./{f=1} f&&/^---/{exit} f' docs/PLI-lot-t1a-ii-b3d.md | sha256sum` avant/après).

### L-b1-1 — C-V-1 : reprise terminale idempotente + retry (défaut SOURCE)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/rebase-crosscheck.ts` (`scanFullMint`, `runRebaseCrosscheckCli`), `apps/bell/src/collect.ts` (injection du retry) |
| **Correctif reprise (3 fuites terminales, fait 1/2/3)** | (a) **semer** `lastSlotSeen`/`ascLastSig` depuis `resume.priorLedger.at(-1)` : `lastSlotSeen = last.slot_hi`, `ascLastSig = last.last_sig` (juste après `:202`) ⇒ une reprise 0-page reproduit l'ancre de fin correcte ; (b) **`candidate_shas` re-dérivé du disque** à l'écriture de l'artefact (`readdirSync(<out>/candidates)` → sha des fichiers présents) OU persisté cumulativement — retenu : **re-dérivé du disque** (plus simple, source unique) ; (c) **`pages` de l'artefact = `ledger.length`** (idempotent) + compteur séparé `fetched` pour la borne `while (fetched < maxPages)` (une page toute-dédoublonnée ne boucle pas). |
| **Idempotence terminale (Q ouverte tranchée)** | **re-vérification NON destructive** (le semis rend la reprise correcte ⇒ le re-run reproduit `equal` par construction) — pas de « no-op avec message » (retenu : la re-vérification est plus forte et gratuite une fois le semis en place). |
| **Retry (fait 9)** | `withRetry` **injecté par paramètre** (`collect.ts` le possède ; le passe à `runRebaseCrosscheckCli` → `scanFullMint(..., retry)`, défaut identité pour les tests offline) — **aucun déplacement, aucun cycle**. `scanFullMint` enveloppe l'appel gTfA (`:210`) et l'appel opB `getTransaction` (`:233`). **Budget** : chaque essai passe par le `call` budgété ⇒ `guard()` (`collect.ts:299-304`) tique `n` **par essai** ⇒ **chaque essai compté en crédits pire cas** (conservateur : Helius ne facture pas forcément un 429, on sur-compte). **Bornes** : `tries` relevé à **6** pour le tirage (backoff déterministe plafonné ~5 s) — la reprise (fix ci-dessus) couvre les pannes plus longues qu'une salve de 6. **Retry-After** : **NON honoré** en -b3d-b (l'erreur est scrubée `HTTP <status>` sans en-tête, `collect.ts:285`) — backoff déterministe ; **item formé** : mesurer le `Retry-After` de Helius à la sonde point (d) ; s'il l'envoie et que le backoff est insuffisant, ajouter un `RateLimitError { retryAfterMs }` (quorum.ts, sans url). **Erreurs non rejouables** : `SolRpcError` et HTTP 4xx≠429 **re-throw** (filtre `collect.ts:322`, réutilisé). |
| **Tests** | `bell_crosscheck_resume_after_exhaustion_is_equal` (run 1 complète `equal` ; run 2 même `--out` ⇒ **artefact byte-identique sur les champs de vérification** `verdict, events, handoffs, n_exact, pages, ledger_sha256, candidate_shas, c3_oracle_triplet` ; seuls `calls_by_method`/`credits_recomputed` croissent de **exactement** le coût de re-vérification = 1 gTfA asc + 1 gTfA desc = 20 cr — **un assert `verdict`-seul passerait avec les 3 fuites vives**) ; `bell_crosscheck_retry_on_429_resumes_without_loss_or_doublecount` (429 en cours de scan ⇒ retry ⇒ reprise sans perte ni double compte, chaque essai tiqué). |
| **Mutants** | **M-b1-1** semis retiré (`ascLastSig`/`lastSlotSeen` non semés) ⇒ `end_anchor_mismatch` à la reprise terminale ⇒ **rouge** ; **M-b1-2** `candidate_shas` non re-dérivé (garde le `{}` process) ⇒ artefact dégradé ⇒ **rouge** ; **M-b1-3** `pages = scan.pages` (dérive +1) ⇒ **rouge** ; **M-b1-4** retry avale `BudgetExceededError` (au lieu de re-throw) ⇒ surdépense masquée ⇒ **rouge**. |
| **Tuyau** | entrée : `ledger-<MINT>.jsonl` + `budget.json` persistés (run précédent) ; sortie : artefact `crosscheck-<MINT>.json` idempotent + reprise sans perte ; état : hors dépôt (`--out`) ; test : `bell_crosscheck_resume_after_exhaustion_is_equal` **exécute** deux `runMain` successifs. **Changement SOURCE ⇒ G2 fraîche** (checkpoint-2 C-V-1). |

### L-b1-2 — C-V-2 : `calls_by_method`/`credits_recomputed` cumulatifs
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/bell/src/rebase-crosscheck.ts` (`runRebaseCrosscheckCli`, `budget.json`, artefact) |
| **Correctif + granularité (tranchée)** | `budget.json` porte un **`calls_by_method` GLOBAL** (Σ 4 mints, pour l'audit §5 dashboard-delta) **ET un `by_mint` slice** ; à l'entrée d'un mint, `callsByMethod` (`:451`) est **semé** depuis la tranche du mint dans `budget.json` ; `credits_recomputed` de l'artefact = **cumulatif de CE mint à travers ses reprises**. Invariant : `Σ_methods calls_by_method == calls_used`. |
| **Tests** | `bell_crosscheck_calls_by_method_is_cumulative` (sonde puis tirage même `--out` ⇒ `credits_recomputed` = cumul, jamais le dernier process) ; assert `Σ calls_by_method == calls_used` (`budget.json`). |
| **Mutants** | **M-b1-5** `callsByMethod` non semé (repart à 0) ⇒ sous-compte ⇒ rouge ; **M-b1-6** invariant `Σ == calls_used` cassé (garde retirée) ⇒ rouge. |
| **Tuyau** | entrée : `budget.json` (tranches par mint) ; sortie : `credits_recomputed` cumulatif de l'artefact = vérité-terrain de l'audit §5 (delta dashboard, CA-9) ; test : rejeu deux process. |

### L-b1-3 — C-V-3 : engagement de chaîne du ledger prouvé + vérificateur
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/bell/src/rebase-crosscheck.ts` (nouveau `verifyLedgerChain` exporté) + `apps/bell/test/rebase-crosscheck.test.ts` |
| **Correctif** | `verifyLedgerChain(entries)` : re-dérive chaque `entry_sha256 = sha(JSON.stringify(core))` (core = entrée sans `entry_sha256`, chaînant `prev_entry_sha256`) depuis genesis ; rend `{ok, headSha}` ; **utilisable par l'audit §5 depuis `ledger-<MINT>.jsonl`** (calque `readJsonl`). |
| **Tests** | `bell_crosscheck_ledger_chain_rederives_from_disk` (re-dérive la chaîne d'un `ledger-<MINT>.jsonl` synthétique ⇒ head == `ledger_sha256` ; un `prev_entry_sha256` altéré au milieu ⇒ `ok:false` + tête différente). |
| **Mutant** | **M-b1-7** `chainedLedgerEntry` : `core` **sans** `prev_entry_sha256` (`:142`) ⇒ chaîne ne re-dérive plus ⇒ **rouge** (ex-survivant 29/0 du checkpoint-2). |
| **Tuyau** | entrée : `ledger-<MINT>.jsonl` ; sortie : `verifyLedgerChain` (booléen + head) ; consommateur servi : **audit §5** (orchestrateur/G2, CA-9) ; test : re-dérivation depuis le disque. |

### L-b1-4 — Ordre d'append : fermer la fenêtre de désync (fait 6/7)
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/bell/src/rebase-crosscheck.ts` (`onPage`, `resumeFromLedger`, `readJsonl`, `ScanSink`) |
| **Options** | **(A) enregistrement de page ATOMIQUE (RECOMMANDÉE)** : une SEULE ligne par page dans `ledger-<MINT>.jsonl` portant `{...entry, page_events, page_handoffs}` (un seul `appendFileSync` = un point de commit ; `budget.json` reste écrit EN TÊTE, invariant `calls_used ≥ pages` conservé) ; `readJsonl`/`resumeFromLedger` **tolèrent une ligne de queue tronquée** (drop fail-closed ; budget-first ⇒ re-tirer la page est conservateur) ; `ledgerPagesOnDisk:389` compte la ligne tronquée (conservateur pour la garde (b) `:416`). `events-`/`handoffs-<MINT>.jsonl` **disparaissent** (fusionnés dans la ligne de page). **(B) ordre + détection** : écrire events/handoffs AVANT le ledger (ledger = marqueur de commit), et à la reprise filtrer `priorEvents`/`priorHandoffs` à `slot < resumeFromSlot` (drop d'une queue orpheline d'une page non committée) + re-décodage de la page frontière. |
| **Recommandation** | **(A)** : ferme structurellement la fenêtre (un point de commit unique), **testable par le LECTEUR** (ligne tronquée manuelle) sans seam de crash intra-`onPage`, et le tueur du mutant « re-scission en deux fichiers » est une assertion de cohérence sur le drop de queue. Coût : réécrit `hasResumeState`/`readPriorCalls` (les fichiers `events-`/`handoffs-` n'existent plus) ⇒ **le test `bell_crosscheck_hasResumeState_events_or_handoffs_fail_closed` (`rebase-crosscheck.test.ts:545`) est retravaillé** (la garde « resume-state sans `budget.json` ⇒ throw » reste, sur `ledger-*.jsonl` seul). |
| **Tests** | `bell_crosscheck_page_record_torn_tail_dropped` (un `ledger-<MINT>.jsonl` avec ligne de queue partielle ⇒ reader drop + reprise poursuit ; cohérence ledger/events préservée) ; `bell_crosscheck_page_record_atomic_resume` (crash sur le FETCH de la page suivante ⇒ la page committée porte SES events ⇒ reprise complète, jamais `no_initialize_anchor`). |
| **Mutants** | **M-b1-8** scinder l'enregistrement de page en deux écritures (ledger séparé des events) ⇒ une queue tronquée désynchronise ⇒ assertion de cohérence **rouge** ; **M-b1-9** `readJsonl` sans tolérance de queue tronquée ⇒ throw à la reprise ⇒ rouge. |
| **Tuyau** | ferme l'item registre durable **§5** (`PLI` l.326, « ordre d'append FERMÉ par argument ») **par construction** (pas seulement par argument) + l'item « seam de sink » (`PLI` l.193, l.244). Note item formé transformé en livraison. |

### L-b1-5 — Helper de densité (sonde C-7 (c)/(d) ; §5)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/rebase-crosscheck.ts` (nouveau `runDensityProbeCli` + projection) + `apps/bell/src/collect.ts` (nouveau flag `--rebase-density` + **les 3 gates**, fait 11) |
| **Constat** | le helper **n'existe pas** (`PLI` registre l.327) ⇒ (c) densité et (d) débit non exécutables ⇒ **H6 non calibré, tirage non enchaîné**. Aujourd'hui il « écrit `budget.json` mais jamais de ledger » = **contrainte de conception** (Amend 1(1), `PLI` l.34 : sinon `resumeFromLedger` reprendrait d'un point épars et sauterait le préfixe) ; déjà anticipée par le test `bell_crosscheck_readPriorCalls_boundary_and_budget_only` (`rebase-crosscheck.test.ts:536-540` : budget-seul 0 ledger ⇒ reprise acceptée). |
| **Conception** | mode `--rebase-density` (réutilise le motif d'échantillonnage `--discover`, généralisé à K points). Par mint : **1 appel `genesis probe`** gTfA asc `limit:1` `slot.lte=oracle_slot` (**mesure** le slot le plus ancien = genesis ; jamais date-estimé) → **K=8 points** uniformes sur `[genesis_slot, oracle_slot]`, une page gTfA `full limit:1000 slot.gte=point` chacun → densité locale tx/(slot span) → **intégration ⇒ N projeté + intervalle** (min/max densités) ; (d) mesure octets/page, latence, débit ⇒ durée. Écrit `sonde-report.json` (hors dépôt) + `budget.json` (compteur partagé cumulatif) ; **JAMAIS `ledger-<MINT>.jsonl`**. **3 gates collect.ts (fait 11)** : ajouter `--rebase-density` à la condition `--max-credits` requis (`:444`), à la condition `readPriorCalls` (`:589`), et — s'il est routé par `--rebase-crosscheck` — à `--max-pages` requis (`:452`) ; retenu : **mode distinct** (`--rebase-density`) pour éviter le couplage `--max-pages`, mais **`--max-credits` requis + compteur partagé** obligatoires. |
| **Budget (chiffré)** | 4 mints × (1 genesis + 8 échantillons) = **36 appels = 360 cr** ; + (a)/(b)/(g) ~8-12 appels ⇒ **~500 cr < 1 500** (plancher sonde). |
| **Tests** | `bell_density_projects_N_with_interval` (fixture multi-points synthétique ⇒ N projeté dans l'intervalle attendu) ; `bell_density_writes_budget_never_ledger` (assert `budget.json` écrit, `ledger-*.jsonl` **absent** ⇒ `resumeFromLedger` ne saute pas le préfixe) ; `bell_density_requires_max_credits` (mode sans `--max-credits` ⇒ throw). |
| **Mutants** | **M-b1-10** le helper écrit `ledger-<MINT>.jsonl` ⇒ `resumeFromLedger` reprend d'un point épars ⇒ rouge ; **M-b1-11** genesis date-estimé au lieu du probe mesuré ⇒ intervalle faux ⇒ rouge ; **M-b1-12** `--rebase-density` omis du gate `--max-credits` ⇒ 360 cr hors unité ⇒ rouge (`bell_density_requires_max_credits`). |
| **Tuyau** | entrée : oracle_slot committé + genesis mesuré ; sortie : `sonde-report.json` (N projeté + intervalle + durée) lu par l'orchestrateur pour **calibrer H6** ; état : hors dépôt ; test : projection sur fixture. **Débloque l'enchaînement sonde→tirage** (registre durable §6). |

### L-b1-6 — C-V-9 (synthétique) : artefact CLI probant + `set_authority_scan` (fait 8)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/rebase-crosscheck.ts` (artefact `:474-476` : **ajouter `set_authority_scan`**) + `apps/bell/test/rebase-crosscheck.test.ts` (`bell_crosscheck_committed_artifacts_replay`) |
| **Artefact** | ajouter `set_authority_scan: { scanned: scan.complete, authority_change_found: scan.handoffs.length > 0, through_slot: series.oracle_slot }` à l'artefact (`:476`) — le champ que L-5 consommera (fait 8 : `handoffs` absent aujourd'hui). |
| **Correctif C-V-9** | `bell_crosscheck_committed_artifacts_replay` (`:292`) construit l'artefact **à la main** (`writeMint` → `compareToHybrid` → `writeFileSync`, `:298-303`) ⇒ **non probant CA-11 durci**. Réécrit : **`runMain --rebase-crosscheck`** sur un stub synthétique produit des `crosscheck-*.json` réels (par le CLI) ⇒ le test **LES LIT** puis rejoue `compareToHybrid` ⇒ verdict rejoué == verdict committé ; `method` sans `pending` **ssi** `equal`. |
| **Tests** | `bell_crosscheck_committed_artifacts_replay` **retravaillé** (via `runMain`, synthétique) ; le rejeu sur les **artefacts réels** est reporté à -b3d-b2/course (fait 8, registre durable §7 : « lit des `crosscheck-*.json` écrits PAR LE CLI »). |
| **Mutant** | **M-b1-13** le test reconstruit l'artefact à la main (régression au `writeMint`) ⇒ ne prouve plus la composition CLI ⇒ (garde CA-11) rouge. |
| **Tuyau** | entrée : `crosscheck-*.json` écrits par `runMain` ; sortie : verdict rejoué == committé ; test : composition exécutée depuis l'artefact CLI (CA-11 durci). |

---

## Amendement 3 (C-V-4 / H6) — comparaison, recommandation, texte exact

**§2 H6 tel qu'écrit (GELÉ, sha `7071484f…`)** : « `--max-credits = 649 750` posé avant le premier appel ; après une **fraction FIXE `f = 0,05`** du span `[genesis, oracle_slot]`, projection = `max(linéaire, densité)` ; si projection > 6 500 000 ⇒ STOP + ESCALADE-INVESTISSEUR ». **H6 n'a NI implémentation NI item** (checkpoint-2 C-V-4) ; §7 passe `--max-credits 6497500` à CHAQUE mint (aucun sous-plafond par mint).

**Comparaison** :
- **(a) Amendement 3 — sous-plafonds CUMULATIFS par mint en `--max-credits`, ZÉRO code** : réutilise le `--max-credits` **fail-closed DÉJÀ testé** (`collect.ts:303`, `makeBudgetedCall`), ordre du moins cher au plus cher (`PLI §3(f)` l.63 : TSLAx 254 670, AAPLx 513 000, NVDAx 1 670 000, SPYx 2 957 000). La projection H6 est faite **une fois à la sonde** (helper de densité L-b1-5 = N projeté + intervalle, `f = 0`), et le hard-stop pendant le tirage est le sous-plafond cumulatif par mint. **Zéro code dans le chemin chaud** (moins de risque, moins de R-25, moins de mutants).
- **(b) code de projection EN VOL** : suit `f = 0,05` du span mid-scan, calcule `max(linéaire, densité)`, STOP — **ajoute de la complexité au `scanFullMint` chaud** (suivi de fraction, modèle de densité embarqué, nouveau STOP), plus de mutants, dans le tirage à ~5,4 M cr.

**Recommandation : (a) Amendement 3.** Motifs : (i) le mécanisme `--max-credits` est déjà éprouvé et fail-closed ; (ii) la projection H6 est calculée AVANT de dépenser (density-sonde, plus strict que « après 5 % »), pas mid-scan ; (iii) pas de code neuf dans le hot path du tirage. **Écart déclaré vis-à-vis de H6 telle qu'écrite** : le mécanisme littéral « projection EN VOL à `f = 0,05` du span » **N'EST PAS implémenté** ; il est **substitué** par (density-sonde pré-tirage `f = 0`) + (sous-plafonds cumulatifs `--max-credits` par mint). **§2 reste BYTE-IDENTIQUE** (sha `7071484f…`) ; l'Amendement 3 supersède **UNIQUEMENT** les COMMANDES (§3/§4/§7), jamais §2 — même discipline que les Amendements 1 et 2.

**Ce que l'Amendement 3 écrirait EXACTEMENT** (daté, §2 gelé ; committé SEUL par l'orchestrateur avant la sonde/tirage — calque du prereg §2 ; **rédigé par le worker -b3d-b1 dans le PLI, R-25 = 0 car `docs/**/*.md` exclus**) :

> **Amendement 3 — sous-plafonds cumulatifs par mint + substitution du STOP H6 (pré-enregistrement daté, 2026-09-2X HH:MM UTC `date -u`, worker `claude-opus-4-8[1m]`, pli source -b3d-b).** **§2 (H1..H6) reste BYTE-IDENTIQUE** — sha256 de l'extrait `## 2.` → ligne avant `---` **inchangé** `7071484f3444abe6c09b694f730ad2fcce2f00ea8c12e8cc39fc31806a3c7867` (recomputé avant/après). Corrige les COMMANDES (§7) et **substitue, DANS CE TEXTE seulement (jamais §2)**, le mécanisme de STOP de H6.
> **(1) Substitution H6 (écart déclaré).** La projection EN VOL à `f = 0,05` du span de §2 **n'est PAS implémentée** ; elle est remplacée par : (i) **projection unique à la sonde** (`f = 0`, helper de densité C-7(c), N projeté + intervalle) — si la **borne haute** de l'intervalle d'un mint `k` dépasse son sous-plafond §3(f), **ESCALADE-INVESTISSEUR AVANT de démarrer le mint `k`** (rend opérationnel le « re-projection avant de continuer » de §3(f)) ; (ii) **sous-plafonds CUMULATIFS par mint** en `--max-credits` (fail-closed, `collect.ts:303`), roulés dans l'ordre TSLAx→AAPLx→NVDAx→SPYx.
> **(2) Sous-plafonds cumulatifs (roulants — un sous-consommé élargit le suivant, un sur-consommé le mange).** Sonde 1 500 cr incluse dans le compteur partagé ; audit 1 000 cr = `--out` distinct (orchestrateur). `--max-credits` de l'invocation traitant le mint `k` = 1 500 + Σ_{i≤k} sous-plafond_i (`PLI §3(f)` l.63) : **TSLAx `--max-credits 256170`** ; **AAPLx `--max-credits 769170`** ; **NVDAx `--max-credits 2439170`** ; **SPYx `--max-credits 5396170`** (tous ≤ 6 497 500 ; SPYx laisse ≥ 1,1 M de marge sous 6,5 M). `--max-pages 649750` et `--max-calls 649750` inchangés (non mordants). Un mint qui dépasse son sous-plafond ⇒ `BudgetExceededError` ⇒ `inconclusive:budget_exhausted` ⇒ STOP + ESCALADE-INVESTISSEUR (C-4).

---

## course (RÉSEAU — orchestrateur ; R-20 : jamais le worker)
**Séquence (item 9)** : **sonde C-7 (a,b,c,d,g) sur les 4 mints** (`PLI §Conditions de la sonde` l.298-315 ; conditions du GO : lecture du dashboard Helius **PAR L'INVESTISSEUR** — delta gTfA depuis `eb54baa` 2026-09-20 21:42 UTC attendu **0** ; `F:/tmp/bell-b3d-run` absent ; 2 opérateurs distincts ; point (g) index recoupé ≥ 1 événement/mint, sinon STOP+consultation) → **[T-1a-iii phase B, 50 000 cr, ledger DÉDIÉ, décision 84/`CHANTIERS.md:248`, hors tirage, dashboard avant/après]** → **tirage full-mint** (ordre TSLAx→AAPLx→NVDAx→SPYx, sous-plafonds Amendement 3, reprise idempotente L-b1-1) → **audit §5** (k ≤ 25 pages/mint, `--out` distinct, `verifyLedgerChain` L-b1-3, delta dashboard vs `credits_recomputed` cumulatif L-b1-2).

**Budget du cycle Helius (`PLI §4` l.79 [lu])** : cumul pire cas **7 578 946 / 10 M** (marge **2 421 054**), incluant 2 623 antérieurs + 6 323 hybride -b3a + ≤ 20 000 -b1-bis-i + ≤ 1 000 000 -b1-bis-ii + ≤ 6 500 000 -b3d + 50 000 (décision 83). Cycle **19 sept → 19 oct**. **Le tirage tient-il dans le cycle courant ?** Durée tirage **~45 h** (mission ; plancher série ~37,5 h = ~540 000 gTfA à 4/s, `--min-interval 250` `collect.ts:430`) + marge. Au 2026-09-21 il reste **~28 j** ⇒ **OUI**, à condition de démarrer avant la **date de départ au plus tard ≈ 2026-10-15** (`19 oct − ~45 h − 48 h marge` ; C-7(d)). En crédits, 7,58 M < 10 M ⇒ tient.

**Ce qui relève d'une DÉCISION INVESTISSEUR (routage C-4, `PLI §8` l.114-115 — jamais « consultation orchestrateur »)** : (i) coût projeté OU réel **> 6,5 M** ; (ii) cumul cycle **> 10 M** ; (iii) **activation de l'autoscaling** (prix **5 $/M** [lu] `RESSOURCES-HELIUS l.5-6` ; autoscaling **off** ⇒ arrêt système à 10 M, jamais facturé en silence — à **reconfirmer au dashboard AVANT** activation) ; (iv) **achat de crédits** / dépassement ; (v) tirage **à cheval sur le 19 oct** déplaçant -b1-bis-ii (famine) ; (vi) « accepter un partiel » après `inconclusive` ; (vii) **toute divergence**. Chainstack (quorum-2 des candidats) : **renouvellement FAIT** (investisseur 2026-09-20, `CHANTIERS.md:242`) ⇒ item CLOS.

---

## -b3d-b2 (POST-TIRAGE, conditionnel) — Livrables

**Branche conditionnelle (l'ADR ne publie QUE si)** : `equal` **4/4** ∧ **H1 STRICTE** (`fieldDiffs` VIDES sur 4/4, C-V-8, checkpoint-2 l.278) ∧ **H3** (`authority_change_found:false` 4/4). **Sinon** : STOP, `pending` CONSERVÉ, **aucun** retrait, **aucune** finalisation ADR, items formés, ESCALADE-INVESTISSEUR (C-4).

### L-2b-1 — L-1 prod : piggyback SetAuthority dans `rebase-produce.ts` (fait 10)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/rebase-scan.ts` (recevoir `normalizeBody`), `apps/bell/src/rebase-produce.ts` (import `setAuthorityHandoffsFromTx` + piggyback + attestation), `apps/bell/src/rebase-crosscheck.ts` (drop import `:34`, prendre `normalizeBody` de rebase-scan) |
| **Anti-cycle (fait 10)** | **déplacer `normalizeBody`** (`rebase-produce.ts:66-74`, ~10 l.) vers `rebase-scan.ts` ; mettre à jour les 2 sites d'import (`rebase-crosscheck.ts:34` → rebase-scan ; `rebase-produce.ts:123` interne → rebase-scan) — **aucun re-export requis** (grep : `normalizeBody` n'a que ces 2 importeurs). ⇒ `rebase-crosscheck → rebase-produce` supprimé ⇒ `rebase-produce.ts` importe `setAuthorityHandoffsFromTx` de `rebase-crosscheck.ts` **sans cycle**, décodeur [lu] intact (29 tests -b3d-a). |
| **Piggyback** | dans `produceTrajectories` (`rebase-produce.ts:117-147`), sur `en.bodies` (historique S7vYFF déjà énuméré, coût 0) : `setAuthorityHandoffsFromTx(nb.sig, nb.slot, nb.blockTime, nb.tx, wanted)` par corps ⇒ écrire `setAuthorityScan {scanned:true, authority_change_found: handoffs.length>0, through_slot: oracle.S}` par mint dans `writeTrajectoryFile` (`:154`). **Belt-and-suspenders** : le leg A→B **doit être signé par A = S7vYFF** (`ADR-T1aii:230-233` [lu] : `processor.rs` exige la signature de l'autorité courante) ⇒ apparaît dans l'historique de S7vYFF ⇒ détection par piggyback, **pour les courses FUTURES** (fermeture au-delà des 4 séries certifiées). |
| **Source d'attestation des 4 SÉRIES certifiées (distinction advisor)** : pour les 4 séries, `setAuthorityScan` vient de **`crosscheck-<MINT>.json.set_authority_scan`** (issu du full-mint L-2 -b3d-a + champ ajouté L-b1-6, `through_slot = oracle_slot`) ; le **piggyback** est pour la **production continue** (item formé G0 -b3d l.129). |
| **Tests** | `bell_setauthority_piggyback_writes_attestation` (fixture S7vYFF synthétique avec/sans leg A→B ⇒ `authority_change_found` true/false ; exécuté via `produceTrajectories`) ; `rebase-produce.test.ts:169` étendu (attestation présente). |
| **Mutants** | **M-2b-1** piggyback ignore les inner instructions (CPI) ⇒ leg CPI manqué ⇒ rouge ; **M-2b-2** attestation `authority_change_found` codée `false` inconditionnel ⇒ rouge. |

### L-2b-2 — L-5 : chute de `set_authority_unscanned` data-pilotée (C-3)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/supply.ts` (`rebaseGateFromTrajectory`), `apps/bell/src/collect.ts` (`TrajectoryInput:485`, `loadTrajectories:554`, `buildSolanaSymbol:540`), `apps/bell/test/rebase-course.test.ts` (`:62`,`:73` MAJ + test neuf) ; `residuals.ts` **inchangé** (option (a), enum conservé) |
| **Correctif (fait 12)** | `rebaseGateFromTrajectory` gagne un **param OPTIONNEL trailing `setAuthorityScan?`** (minimise le ripple : `rebase-gate-gt.test.ts:21/24/28/32` restent verts, absence ⇒ fail-closed conserve les deux codes). Logique `:173` : `residuals = scanMethod==="authority" ? (setAuthorityScan?.scanned && !setAuthorityScan.authority_change_found && setAuthorityScan.through_slot >= oracle_slot ? ["authority_scan_mono_operator"] : ["authority_scan_mono_operator","set_authority_unscanned"]) : []`. `TrajectoryInput` (`collect.ts:485`) + `loadTrajectories` (`:554`, validation fail-closed) portent `setAuthorityScan` ; `buildSolanaSymbol:540` le passe. `authority_change_found:true` ⇒ **une issue par couche** (A-3 cumulatif) : gate `rebase_unverified` **ET** verdict de lot STOP. |
| **Forme (a), pas de re-pin (Q3=(a) tranchée)** | enum `set_authority_unscanned` **conservé** (`residuals.ts:37`), émission **cessée** ; **PAS de re-pin** `PINNED_BELL_SHA` : les fixtures de rejeu collecteur passent `rebase: undefined` ⇒ jamais la branche `trajectory_known` ⇒ `newResidualCounts` inchangé ⇒ digest inchangé. **À PROUVER au G1** : `bell_collector_replays_fixture_bit_identical` (`collect.test.ts:96`) + `bell_pinned_sha_reduces_to_b3a_by_subtraction` (`:599`) verts. **Précédent re-pin par soustraction `ADR-T1aii:306-307`** cité pour mémoire (option (b) écartée) : ne s'appliquerait QUE si l'enum était retiré (il ne l'est pas). |
| **Tests** | `bell_authority_gate_drops_set_authority_after_crosscheck` (CA-11 : **producteur → fichier → `loadTrajectories` → gate** exécuté ; attestation fermante ⇒ résiduels == `["authority_scan_mono_operator"]` exactement) ; `rebase-course.test.ts:62` **MAJ** (série + attestation ⇒ 1 résiduel) ; `:73` **MAJ** ; contrôle « sans attestation ⇒ 2 codes » conservé. |
| **Mutants** | **M-2b-3** gate retire le résiduel **sans lire l'attestation** ⇒ un fichier sans attestation perd `set_authority_unscanned` ⇒ **rouge** (M10 checkpoint-1) ; **M-2b-4** `set_authority_unscanned` ré-émis après fermeture ⇒ rouge (M6). |

### L-2b-3 — L-4 : retrait de `pending` (à `equal` 4/4 seulement) + C-V-9 réel + artefacts + ADR
| Champ | Contenu |
|---|---|
| **Fichiers** | 4 `rebase-<MINT>.json` (`method` : `pending` retiré + attestation `setAuthorityScan` — **R-25 exclus**), `crosscheck-*.json` réels (**exclus**), `PROVENANCE-crosscheck-fullmint.md` (**COMPTÉ**), `PROVENANCE-rebase-course.md` (MAJ, **COMPTÉ**), `docs/adr/ADR-T1aii…` D1-quater final (**exclu**), `apps/bell/test/rebase-crosscheck.test.ts` (C-V-9 réel) |
| **L-4 code = 0 (fait 13)** | `SCAN_METHOD_MAP` porte déjà les deux libellés (`rebase-produce.ts:45-46`) ⇒ le retrait de `pending` ne change AUCUN code ; `bell_series_method_maps_to_authority` déjà vert (`:274`). Le changement de `method` vit dans les séries (exclus R-25). |
| **C-V-9 réel** | `bell_crosscheck_committed_artifacts_replay` s'exécute sur les 4 `crosscheck-*.json` **réels écrits par le CLI** (registre durable §7) ; `method` sans `pending` **ssi** verdict `equal` 4/4. |
| **C-13 (item G1)** | `series_pinned_are_declared_and_hashed` accepte-t-il **DEUX** `PROVENANCE-*.md` sous `series/rebase/` (`PROVENANCE-rebase-course.md` **existe déjà**, grep) ? sinon **fusionner** les pins de contre-vérification dans `PROVENANCE-rebase-course.md`. À trancher au G1. |
| **ADR D1-quater final** | sous-section « Contre-vérification full-mint (décision 67) » : méthode, invariance, coût mesuré réel, deux issues STOP, **C-V-8** (publie seulement si H1 STRICTE 4/4 + H1 relâchée), fermeture `set_authority_unscanned`, `pending` retiré, tuyaux MAJ. **N'existe QUE si `equal` 4/4** (branche conditionnelle). |
| **Tuyau** | verdict `equal` → retrait `pending` (L-4) ; attestation H3 → fermeture (L-5) — **deux verrous distincts** (checkpoint-1 C-3). |

---

## R1 « registre multi-émetteur » et l'ordre (item 8)
- **« Le dernier sous-lot -b3d » au sens de R1 = `-b3d-b2`** (post-tirage : retrait `pending` + ADR final). La décision **85** (`CHANTIERS.md:254` [lu]) place R1 « **après fusion -b3d-b** » ⇒ après la fusion du **dernier** segment -b3d-b (= -b3d-b2), avant G0 -b1-bis-ii, `PINNED_BELL_SHA` inchangé.
- **R1 peut-il partir entre -b1 et -b2 ?** **NON.** La décision 85 **lie l'ordre** (R1 après -b3d-b tout entier). Même en écartant la décision : **-b3d-b1 ET -b3d-b2 touchent tous deux `collect.ts`** (b1 : gates + injection retry + density ; b2 : `TrajectoryInput`/`loadTrajectories`/`buildSolanaSymbol`) ⇒ un R1 touchant Bell risquerait un conflit. R1 est **≈ 350 l. additif sans re-pin** (avis advisor `CHANTIERS.md:249`) — vraisemblablement un **nouveau module registre** + inscription source dans `pools.ts` + ADR/plan public Q0-Q5, **disjoint du plumbing crosscheck** ; mais l'ordre décision-85 prime. **Conclusion : R1 attend la fusion de -b3d-b2.**

---

## Mutants imposés (récapitulatif ; ≥ 13 rouges, `cp` sha-exact depuis pristine, jamais `git checkout`)
b1 : **M-b1-1** semis reprise retiré ; **M-b1-2** `candidate_shas` non re-dérivé ; **M-b1-3** `pages=scan.pages` (dérive) ; **M-b1-4** retry avale BudgetExceeded ; **M-b1-5** `callsByMethod` non semé ; **M-b1-6** invariant `Σ==calls_used` cassé ; **M-b1-7** `core` sans `prev_entry_sha256` (ex-survivant 29/0) ; **M-b1-8** enregistrement de page re-scindé en 2 écritures ; **M-b1-9** `readJsonl` sans tolérance de queue ; **M-b1-10** density écrit un ledger ; **M-b1-11** genesis date-estimé ; **M-b1-12** density hors gate `--max-credits` ; **M-b1-13** replay reconstruit l'artefact à la main. b2 : **M-2b-1** piggyback ignore CPI ; **M-2b-2** `authority_change_found` faux ; **M-2b-3** gate ferme sans lire l'attestation (M10) ; **M-2b-4** `set_authority_unscanned` ré-émis (M6).

## Tuyaux (ADR-M018 D3 ; à porter en ADR-T1aii D1-quater final)
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| reprise → artefact idempotent | `ledger-/budget.json` persistés | `crosscheck-<MINT>.json` byte-stable | **upcoming** | `bell_crosscheck_resume_after_exhaustion_is_equal` |
| budget cumulatif → audit | `budget.json` (tranches/mint) | `credits_recomputed` cumulatif = vérité audit §5 | **upcoming** | `bell_crosscheck_calls_by_method_is_cumulative` |
| ledger → vérificateur de chaîne | `ledger-<MINT>.jsonl` | `verifyLedgerChain` (audit §5) | **upcoming** | `bell_crosscheck_ledger_chain_rederives_from_disk` |
| densité → calibrage H6 | oracle_slot + genesis mesuré | `sonde-report.json` (N + intervalle + durée) | **upcoming** | `bell_density_projects_N_with_interval` |
| artefact CLI → comparateur | `crosscheck-*.json` (écrit par `runMain`) | verdict rejoué == committé | **upcoming** | `bell_crosscheck_committed_artifacts_replay` |
| SetAuthority → fermeture (prod) | historique S7vYFF (piggyback ~0 cr) | attestation `setAuthorityScan` | **upcoming** | `bell_setauthority_piggyback_writes_attestation` |
| attestation → gate (résiduel) | `crosscheck-*.json.set_authority_scan` / série | `set_authority_unscanned` fermé/maintenu | **item à déclencheur** (`equal`→L-4 ; attestation H3→L-5) | `bell_authority_gate_drops_set_authority_after_crosscheck` |

## Risques (MAST) + anti-close + secrets
- **Fausse escalade brûlant la dépense** (reprise terminale, désync append) ⇒ L-b1-1 (semis + 3 fuites) + L-b1-4 (page atomique) ; **fail-closed** partout (jamais faux `equal`, jamais surdépense).
- **Vérification incomplète** (ledger non re-dérivé) ⇒ L-b1-3 `verifyLedgerChain`.
- **Méconnaissance des conditions d'arrêt** (H6) ⇒ density-sonde + sous-plafonds cumulatifs (Amendement 3).
- **Décodeur partagé** (full-mint vs runner) ⇒ backstop C-3, indépendance décodeur non établie (déclaré, C-11).
- **Énumération mono-opérateur Helius** ⇒ résiduel `authority_scan_mono_operator` **conservé** (mandat décision 67).
- **Anti-close** : fixtures b1 100 % synthétiques ; les `crosscheck-*.json` réels (b2) portent des événements on-chain publics (décision 52 [lu] `CHANTIERS.md:117`) ; diff des littéraux au checkpoint-2, masquage `[masqué]`.
- **Secrets** : `BELL_SOLANA_RPC` en env, **jamais imprimée** (`collect.ts:285` scrub `HTTP <status>` sans url) ; `no_secret_in_repo` rejoué vert ; opérateurs par domaine seul (`providerOf`/`operatorOf`).

## Questions checkpoint-1 (Q investisseur marquées **[INV]**)
- **Q1** [G1/validateur] `withRetry` `tries` du tirage = **6** (backoff plafonné ~5 s) ? la reprise couvre les pannes plus longues.
- **Q2** [G1/validateur] Idempotence terminale = **re-vérification non destructive** (semis + `candidate_shas` re-dérivé + `pages=ledger.length`) confirmée ?
- **Q3** [G1/validateur] Ordre d'append = **option (A)** enregistrement de page atomique (retravaille `hasResumeState_events_or_handoffs:545`) — confirmé vs (B) ?
- **Q4** [validateur] C-V-4 = **Amendement 3 (a)** (sous-plafonds cumulatifs, écart déclaré vs H6 littérale) confirmé vs code de projection (b) ?
- **Q5** [G1] Helper de densité = **mode distinct `--rebase-density`** (évite le couplage `--max-pages`) confirmé ?
- **Q6** [G1] Forme `setAuthorityScan {scanned, authority_change_found, through_slot}` + source (crosscheck handoffs pour les 4 séries ; piggyback pour la prod) confirmée ?
- **Q7** [G1] `series_pinned_are_declared_and_hashed` accepte-t-il **deux** `PROVENANCE-*.md` sous `series/rebase/` ? sinon fusion.
- **Q8** **[INV]** Fenêtre de tirage : confirmer un démarrage **avant ~2026-10-15** (cycle 19 oct) ; pré-autorisation « je peux payer plus de crédit » acquise (décision 67) mais activation autoscaling **à reconfirmer au dashboard AVANT** (C-15).
- **Q9** **[INV]** Routage C-4 (rien dû aujourd'hui ; déclencheurs) : > 6,5 M ; cumul > 10 M ; autoscaling ; tirage à cheval sur le 19 oct ; partiel après `inconclusive` ; toute divergence ⇒ **ESCALADE-INVESTISSEUR**. Chainstack : renouvellement **FAIT** (`CHANTIERS.md:242`) ⇒ CLOS.

---

## Rendus de mission

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`, effort max, non banni).

**Résumé (12 lignes)**
1. -b3d-b se découpe en **-b3d-b1 (offline, débloque le tirage)** / **course (orchestrateur)** / **-b3d-b2 (post-tirage, conditionnel)**.
2. **-b3d-b1** plie C-V-1..3, l'ordre d'append, le helper de densité, C-V-9 synthétique et ajoute `set_authority_scan` à l'artefact.
3. **C-V-1** a **3 fuites terminales** (`ascLastSig`/`lastSlotSeen:205`, `candidate_shas:454`, `pages:242`) — le semis seul ne suffit pas ; + retry `withRetry` **injecté** (pas de cycle), chaque essai compté.
4. **C-V-2** : `calls_by_method` global + tranche/mint dans `budget.json`, `credits_recomputed` cumulatif, invariant `Σ==calls_used`.
5. **C-V-3** : `verifyLedgerChain` re-dérive la chaîne depuis `ledger-<MINT>.jsonl` (tue le survivant 29/0).
6. **Ordre d'append** : option **(A)** enregistrement de page atomique + `readJsonl` tolérant une queue tronquée (défaut pré-existant) — ferme structurellement + est testable côté lecteur.
7. **Helper de densité** : mode `--rebase-density` (K=8 + genesis mesuré), écrit `budget.json` jamais de ledger, **3 gates collect.ts**, ~500 cr < 1 500.
8. **C-V-4** : recommande **Amendement 3 (a)** (sous-plafonds cumulatifs `--max-credits` TSLAx 256170 / AAPLx 769170 / NVDAx 2439170 / SPYx 5396170) ; écart déclaré vs H6 « en vol f=0,05 » ; §2 gelé.
9. **-b3d-b2** (si `equal` 4/4 ∧ H1 stricte ∧ H3) : L-1 prod (déplacer `normalizeBody` → rebase-scan casse le cycle), L-5 (attestation, option (a) sans re-pin), L-4 (code=0), C-V-9 réel, ADR final.
10. **R1** : dernier sous-lot = **-b3d-b2** ; R1 part **après** sa fusion (décision 85), **jamais** entre -b1 et -b2 (b1 et b2 touchent tous deux `collect.ts`).
11. **Cycle Helius 7 578 946 / 10 M**, tirage ~45 h tient si démarré avant **~2026-10-15** ; autoscaling/dépassement/divergence ⇒ **ESCALADE-INVESTISSEUR** (C-4).
12. `PINNED_BELL_SHA` inchangé (option (a), fixtures `rebase:undefined`) à prouver au G1 ; §2 sha `7071484f…` byte-identique ; R-20/R-21/anti-close/secrets respectés.

**Découpe + R-25 par sous-lot** : -b3d-b1 ~980-1 050 (seam b1a/b1b si > ~1 050) ; course = 0 code ; -b3d-b2 ~400-460 (PROVENANCE `.md` comptée ; séries json + ADR exclus). Plafond 1 205 (`ci.yml:43`), métrique `ins+del` (`ci.yml:69`), facteur mesuré ~2× (-b3d-a : 555-811 projeté ⇒ 1 130 mesuré).

**Liste des Q** : Q1-Q7 [G1/validateur] ; **Q8, Q9 [INVESTISSEUR]**.

**sha256 de ce fichier** : à recomputer par l'orchestrateur (`sha256sum F:/tmp/bellb3d/G0-lot-t1a-ii-b3d-b.md`) — non calculable sans réécrire le fichier ; le worker ne committe pas (R-20).
