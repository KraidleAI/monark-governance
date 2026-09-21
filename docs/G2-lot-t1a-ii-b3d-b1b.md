# G2 (relecteur, contexte frais, revue 3 étapes) — sous-lot Bell **-b3d-b1b** (sonde de densité `--rebase-density` + projection H6 hors process)

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, Opus 4.8 1M, non banni, effort max ; source = identité d'exécution de la session, déclarée à la première prise de parole).
**R-20** : ce relecteur ne committe pas, ne déclenche aucun workflow. **R-21** : chaque `fichier:ligne` a été ouvert ce tour ; chaque gate/mutant a été **RE-EXÉCUTÉ**, sortie citée ; restauration byte-exacte sha256 ; aucun chiffre de seconde main. **AUCUN réseau** (stubs 100 % synthétiques ; course SUSPENDUE). Rien sur C:. Scratch `F:\tmp\g2-b3db1b\`.

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le livrable OFFLINE b1b est **correct, tous gates verts, couverture de mutation forte** (12 mutants ROUGE rejoués, restauration byte-exacte). Le point le plus sensible (lecture de densité, point 3) est **tranché en faveur du worker** : sa lecture *page-locale* est celle que le pré-enregistrement IMPOSE par son intention (H6 §2 « densité tx/slot », PLI §3(c) « tx/slot local ») ; la formule *de grille* littérale de l'Amendement 3(4) est un défaut de rédaction (indéfinie au dernier nœud, sous-projette d'un facteur pas-de-grille/span-de-page — **mesuré 1 575 vs 157,5**). Trois corrections formées : **C-G2-1 (texte Amend. 3(4)) et C-G2-2 (test d'intégration sonde→projection) sont DÉJÀ RÉSOLUES** (respectivement `f4b0d9c` et le pli checkpoint-2 `06795cc`) ; **C-G2-3 (la sonde écrase `require_full_pages` false→true) reste OUVERTE** — item de **défense en profondeur non bloquant**, déclencheur *G0 course*.

**En clair, sur `8646c62` strict** : les **2 défauts** réels au HEAD revu (C-G2-1 texte de pré-enregistrement en formule de grille ; C-G2-2 branchement sonde→projection affirmé « bout-en-bout » mais non testé) sont **résolus hors du lot** (par `f4b0d9c` et `06795cc`) ; il ne reste, du **code du worker b1b**, que **C-G2-3 — un résidu de défense en profondeur qu'AUCUN chemin canonique n'atteint** (séquence PLI §7 : sonde la 1ʳᵉ, 4 tirages stricts, audit sur `--out` distinct). **Le code livré b1b est correct.**

**Cibles.** Verdict principal sur **`8646c62`** (base `d8d25e3`, blobs par `git archive 8646c62`, extraits isolés `F:\tmp\g2-b3db1b\iso-8646\`). Section **G2-delta** sur `8646c62..06795cc` (pli checkpoint-2 C-V-1/C-V-3, `iso-06795\`). Le worktree partagé `F:\Monark-wt-b3db1b` (HEAD `06795cc`, un checkpoint-2 en parallèle, régime B) **n'a JAMAIS été muté** : toute la mutation s'est faite dans des arbres extraits isolés (jonction `node_modules`→`F:\Monark\node_modules`, jamais `npm ci`, jamais `git checkout`).

sha256 des blobs revus — `8646c62` : `rebase-crosscheck.ts=e40a0b57…`, `collect.ts=1770b50c…`, `test=de1e624f…` (== RENDU-G1) ; `06795cc` : `rebase-crosscheck.ts=15018848…`, `collect.ts=1770b50c…` (inchangé), `test=44aad27a…`.

---

## 1. Gates RE-EXÉCUTÉS

### Cible 8646c62 (iso-8646 == blobs 8646c62, reproduit les chiffres RENDU)
```
npm run ci      : gate:vocab OK (188 fichiers) · tsc 0 · tests 602 pass 602 fail 0 · EXIT 0
npm run lint    : eslint . EXIT 0
npm run lint:ratchet : 69/69 EXIT 0
```
### Cible 06795cc (iso-06795, delta)
```
npm run ci      : gate:vocab OK (188) · tests 604 pass 604 fail 0 · EXIT 0   (= 602 + 2 tests neufs)
npm run lint 0 · lint:ratchet 69/69
```
Les deux corrections hors périmètre b1a sont déclarées (RENDU §7.5) et **prouvées load-bearing** (point 8). Flakiness RENDU §4 (un run « 603/1 fail » harness/sentinel, hors b1b) : **non reproduite** — mes runs ci sont 602/602 puis 604/604 déterministes ; les 8 tests densité déterministes (rejoués).

---

## 2. POINT 3 (le plus sensible) — lecture de densité : page-locale vs grille. **NE PAS LISSER.**

**Fait de code.** `runDensityProbeCli` (rc.ts:733-734) calcule `span = max(slots) − min(slots)` de la **page tirée** au nœud j, puis `density = span>0 ? tx/span : 0` (commentaire « LOCAL density tx/slot (PLI §3(c)) »). `trapezoidIntegral` (rc.ts:446-457) intègre avec la largeur `w = b.slot − a.slot` = **pas de grille** (`slot_{j+1} − slot_j` des K=8 nœuds). Donc **`d_j` = densité de PAGE** (tx / span de la page), largeur d'intégration = **pas de grille**.

**Les deux lectures diffèrent** et le worker le déclare (RENDU §1, advisor consulté) :
| Lecture | `d_j` | N sur la fixture `[1,2,3,4,3,2,1,0.5]`, pas 100 | Source |
|---|---|---|---|
| **Worker (page-locale)** | `tx_j / (lastSlot_j − firstSlot_j)` | **1 575** | code rc.ts:734 ; PLI §3(c) « tx/slot local » ; H6 §2 gelé « densité tx/slot » |
| **Grille (littéral Amend. 3(4) l.203)** | `tx_j / (slot_{j+1} − slot_j)` | **157,5** | G0-b:203 tel qu'écrit à 8646c62 |

**Écart MESURÉ sur la fixture** (mutant M-G2-1, mon cru : je remplace la densité-page par la densité-grille `tx / ((oracle−genesis)/(K−1))`) — sortie citée :
```
AssertionError: N_projected = the per-segment trapezoid integral …
157.5 !== 1575     (actual 157.5, expected 1575)
```
L'écart est exactement `pas-de-grille / span-de-page = 100/10 = 10×`. Sur données réelles (pas de grille = `(oracle−genesis)/7 ≈ millions de slots` ; span d'une page de 1 000 tx en zone dense ≈ petit), la lecture de grille **sous-projette de plusieurs ordres de grandeur**.

**Lequel le pré-enregistrement IMPOSE.** La lecture **page-locale** (worker), pour trois raisons **dirimantes** :
1. **Intention gelée.** H6 §2 (sha `7071484f…`, BYTE-IDENTIQUE) : « intégrale de la densité **tx/slot** » ; PLI §3(c) l.60 : « mesurer **tx/slot local** ». Deux sources autoritatives disent tx/slot *local* — c'est la densité-page. L'en-tête même d'Amend. 3(4) dit « Densité **locale** ».
2. **La formule de grille littérale est CASSÉE.** (a) **Indéfinie au dernier nœud** j=K−1 : `d_7 = tx_7/(slot_8 − slot_7)` requiert `slot_8` qui n'existe pas (8 nœuds j=0..7), or l'intégrale trapézoïdale a besoin de `d_0..d_7`. (b) **Effondrement dimensionnel** : avec `d_j = tx_j/pas` et largeur `pas`, le pas se simplifie ⇒ `N = Σ (tx_j+tx_{j+1})/2 ≈ 7×(tx/page) ≈ milliers` — absurde pour un mint à ~540 000 pages (H6 §4). La densité-page définit `d_j` à TOUS les nœuds et projette dimensionnellement (tx/slot × slots = tx).
3. **Rôle de H6.** `max(linéaire, densité)` existe parce que l'ordre asc part du passé peu dense ⇒ le linéaire sous-estime ⇒ la densité doit être le garde-fou conservateur. La densité-grille sous-projetant, `max` retomberait toujours sur le linéaire ⇒ H6 **neutralisé**. La densité-page restaure le garde-fou.

**Conclusion point 3 : le worker a RAISON. La lecture est conforme à l'intention pré-enregistrée.** Le défaut est le **TEXTE** de l'Amend. 3(4) (formule de grille) qui, s'il était committé tel quel avant la sonde (Amend. 3(6) : committé SEUL avant la sonde), contredirait le code ⇒ **C-G2-1**. **RÉSOLU** : `f4b0d9c` (lot/etude-suite) réécrit l.203 en `d_j = tx_j/(lastSlot_j − firstSlot_j) de la PAGE` + « Formule de grille REJETÉE … indéfinie au dernier nœud et sous-projetant … (fixture du validateur : 1 575 vs 157,5) », `error_origin` rédacteur du pli G0 + validateur checkpoint-1. Le correctif reprend **verbatim ma mesure**.

---

## 3. Table livrable → fichier:ligne → test → mutant (RED rejoué, sortie citée) — cible 8646c62

| Livrable | Fichier:ligne (8646c62) | Test imposé (vert rejoué) | Mutant → RED (sortie citée ce tour) |
|---|---|---|---|
| **L-b1b-1** sonde `runDensityProbeCli` : genesis MESURÉ (gTfA asc `limit:1` `slot.lte`), K=8 points (`slot.gte`), trapèze ; `sonde-report.json` (+`genesis_slot`/mint) + `budget.json` PARTAGÉ ; **jamais** ledger/crosscheck | rc.ts:693-745 (`{lte:oracleSlot},1` :722 ; points :726-736 ; report+`genesis_slot` :738 ; writeBudget `pages:0` :705) | `bell_density_projects_N_with_interval` ; `bell_density_writes_budget_never_ledger` | **M-b1b-10** écrit un ledger → `fail 1` (`existsSync(ledger-SPYx.jsonl)===false` rougit) · **M-b1b-11** genesis=`oracle−500` → `fail 1` (`genesis is MEASURED … 100`) |
| **L-b1b-1** `calls_by_method` GLOBAL cumulatif (Σ==calls_used, y c. après reprise) | rc.ts:702-705 (`gm()` = `…callsByMethod()`) ; collect.ts:595 (`priorByMethod` gate) | `bell_density_feeds_global_calls_by_method` (prior 4 + 2 mints = 22) | **M-b1b-12b** détache le global de la couche budgétée → `fail 1` (Σ 0≠22) · **M-b1b-12c** dé-gate `priorByMethod` seul (collect.ts) → `fail 1` (Σ 18≠22) |
| **L-b1b-1** flag `--rebase-density` : `\|\| rebaseDensity` sur `--max-credits` requis, **PAS** sur `--max-pages` | collect.ts:442-443 (gate `--max-credits`), :592/:595 (`priorCalls`/`priorByMethod`), :617/:619 (branche sonde) | `bell_density_requires_max_credits` (+ contrôle `--max-pages` optionnel) | **M-b1b-12** retire `\|\| rebaseDensity` du gate `--max-credits` → `fail 1` (`Missing expected exception`) |
| **L-b1b-2** `projectPagesAtFraction` PURE = `max(linéaire, densité)`, densité = `trapezoidIntegral.projected / GTFA_PAGE_LIMIT`, fail-closed (span≤0, fraction≤0, <2 pts, non triés → throw, jamais 0) | rc.ts:466-478 ; `trapezoidIntegral` :446-457 | `bell_h6_projection_pure_function` (4 throws) ; `bell_h6_projection_rejects_max_times_span` | **M-b1b-13** `min` au lieu de `max` → `fail 2` · **M-b1b-14** `densité_max × span` → `tests 3 pass 1 fail 2` (`2800 !== 1575` ; `pure_function` reste VERT, densité constante) |
| **POINT 3 — oracle de la lecture page-locale** | rc.ts:733-734 | `bell_density_projects_N_with_interval` | **M-G2-1 (mon cru)** page-span→grid-span → `fail 1` (`157.5 !== 1575`) — prouve que le test épingle la lecture page-locale |
| **Enveloppe [min,max]** | `trapezoidIntegral` :452 (`min += Math.min`) | `bell_density_projects_N_with_interval` (`n_min≤n_projected≤n_max`) | **M-G2-2 (mon cru)** `n_min` calculé avec `max` → `fail 1` (`n_min 1900 > n_projected 1575`) |

**Conversion tx→pages (point 4)** : `density = trapezoidIntegral(model).projected / GTFA_PAGE_LIMIT` (`GTFA_PAGE_LIMIT=1000`, une page pleine = 1000 tx) — rc.ts:476. Prouvée bout-en-bout au delta par `bell_density_report_points_feed_projection` (`proj == n_projected/1000 == 1.575`).

**Discipline mutants** : 9 mutants source (7 RENDU + M-G2-1 + M-G2-2) rejoués via `F:\tmp\g2-b3db1b\driver.mjs` contre les blobs 8646c62 ; **9/9 RED**, `FINAL restore ok = true` (sha256 == 8646c62). `bell_density_writes_budget_never_ledger` + `_requires_max_credits` traversent le **vrai CLI** (`runMain --rebase-density`) ⇒ les 3 lignes de gate collect.ts sont exercées.

---

## 4. Points 5–11 (chacun RE-EXÉCUTÉ)

- **(5) Budget ≤ 36 appels / 4 mints, tout budgété, BudgetExceededError fail-closed** — RE-EXÉCUTÉ (sonde PROBE_B, iso-8646) :
  - `PROBE_B(b) 4 mints => calls_used=36 (expect 36) global_sum=36` (1 genesis + 8 points par mint × 4 = 36).
  - `PROBE_B(a) threw=BudgetExceededError:bell/collect: --max-calls budg… budget_persisted=true calls_used=3 global_sum=3 by_mint.SPYx=undefined` (`--max-calls 3` mordant, throw mid-mint, `budget.json` persisté par le `finally` externe, global exact). **`by_mint.SPYx=undefined`** = le résidu **DÉCLARÉ RENDU §7.4** (la tranche `by_mint` du mint interrompu est perdue à 8646c62) — confirmé, **CORRIGÉ au delta 06795cc** (finally par mint).
- **(6) Tuyaux** : `sonde-report.json` porte `genesis_slot` **par mint** (rc.ts:738, asserté `genesis_slot==100`). **Fonction pure** `projectPagesAtFraction` exportée. **Test d'intégration non-LLM rejouant sonde→projection** : **ABSENT à 8646c62** ⇒ **C-G2-2** (le RENDU §3 le prétendait « câblé bout-en-bout » via `bell_density_projects_N_with_interval` dont l'assertion finale est en réalité `budgeted.calls()==9`, jamais un appel projection). **RÉSOLU à 06795cc** : `bell_density_report_points_feed_projection` (voir G2-delta).
- **(7) Contrainte -f** : la section neuve b1b (test l.1009+) **n'épingle NI** le core §6 9 champs **NI** `entry_sha256`/`ledger_sha256`/`prev_entry_sha256`/`list_sha256`/`chainedLedgerEntry`/`verifyLedgerChain`/`LedgerEntry`/`Object.keys` — grep ce tour = **0** match (hors un commentaire qui le déclare). Conforme au message de coordination -f. (Idem au delta : les 2 tests neufs ne pinnent rien du ledger.)
- **(8) Deux corrections hors périmètre — sûres, sans changement de runtime, load-bearing** — RE-EXÉCUTÉ (isomut, iso-8646, restauration byte-exacte) :
  - **(a) cast `as NodeJS.ProcessEnv` retiré** (test:601) : le remettre → `npm run lint` **EXIT 1** `601:127 error This assertion is unnecessary … @typescript-eslint/no-unnecessary-type-assertion`. Base `d8d25e3` : la ligne portait le cast (`git show` vérifié) — la violation pré-existait (fold b1a `a01cb4e` non re-linté), `error_origin` **G7 -b3d-b1a**.
  - **(b) `readCC` typé `CrosscheckArtifact`** (test:604-608) : retirer le `as CrosscheckArtifact` (retour `any`) → `npm run lint:ratchet` **70/69 EXIT 1** (`no-unsafe-return`, plafond 69 conservé). Base `d8d25e3` : `readCC` non typé (`git show` vérifié). `error_origin` **G7 -b3d-b1a**.
  - **Runtime inchangé** : type-only (cast + annotation) ; 602/602 verts AVEC les corrections ; plafond ratchet **jamais relevé** (69).
- **(9) R-25 (pathspec verbatim `ci.yml:65`, métrique `ins+del` `ci.yml:69`, plafond 1205 `ci.yml:43`)** : `d8d25e3..8646c62` = **268 + 11 = 279** ; `d8d25e3..06795cc` = **304 + 11 = 315** (docs `CHECKPOINT2-*.md` exclus par `docs/**/*.md`). Sous 1205. Pathspec relue à `ci.yml:65` (14 excludes identiques à ma commande).
- **(10) Vocabulaire interdit absent** : `npm run gate:vocab` OK, **188 fichiers**, 0 réclamation interdite.
- **(11) Anti-close — fixtures 100 % synthétiques** : `densityStub` invente slots/signatures/corps (`addr+"-gen"`, slots 100..800) ; `densitySeries` synthétique ; **seule** `SPYX.address` (mint base58 PUBLIC) réutilisée des fixtures — permis C-10 (les mints/autorités sont publics, jamais un secret). Aucun `PINNED_BELL_SHA`/`supply.ts`/`residuals.ts`/série touché. `BELL_SOLANA_RPC` jamais imprimée.

---

## 5. G2-DELTA — `8646c62..06795cc` (pli checkpoint-2 C-V-1/C-V-3 ; 2 fichiers apps + 1 doc)

`git diff --stat 8646c62..06795cc -- apps/` = `rebase-crosscheck.ts` (+23/−17, `finally` par mint) + `test` (+30, 2 tests neufs). **604/604, lint 0, ratchet 69/69, R-25 315** (tous rejoués iso-06795).

### 5.1 `finally` par mint (rc.ts:721-744) — relu ligne à ligne
Le corps par mint (genesis + K points + `report[symbol]`) est enveloppé `try { … } finally { setSlice(); writeBudget(); }`. Les branches d'erreur `no_measured_genesis` (:724) / `degenerate_span` (:728) passent à un simple `continue` **à l'intérieur du try** (le `finally` s'exécute avant le `continue` — sémantique JS correcte) ; le `setSlice(); writeBudget();` de la voie succès est **déplacé** dans le `finally` (plus de duplication). Effet : un `BudgetExceededError` levé **au milieu des points** exécute désormais `setSlice()` pour CE mint ⇒ sa tranche `by_mint` survit. Le `finally` **externe** (:746) reste (durable global + `sonde-report.json`). **Le `finally` par mint NE catche PAS** ⇒ l'erreur fatale propage (fail-closed préservé). Restructuration **correcte**.

### 5.2 Deux tests neufs — résolvent C-G2-2 et le résidu §7.4
- `bell_density_report_points_feed_projection` (C-V-1) : `runMain --rebase-density` écrit `sonde-report.json` **réel**, ses `points[]` ÉMIS sont passés à `projectPagesAtFraction(450, genesis, oracle, 0, r.points)` ⇒ `proj == n_projected/GTFA_PAGE_LIMIT == 1.575`. **Ferme le tuyau sonde→projection** (C-G2-2 résolu ; CA-11 durci : artefact réel, jamais un modèle à la main).
- `bell_density_by_mint_survives_budget_exhaustion` (C-V-3) : `--max-calls 3` ⇒ `assert.rejects(runMain, BudgetExceededError)` ET `by_mint.SPYx.gTfA == 3` (tranche préservée). **Ferme le résidu RENDU §7.4.**

### 5.3 Mutants delta rejoués (iso-06795, restauration byte-exacte, `FINAL restore ok = true`)
| Mutant | Correctif ciblé | Sortie RED citée ce tour |
|---|---|---|
| **M-b1b-15** `points[]` émis sous une autre clé (`points`→`pointsX`, rc.ts:738) | le test lit `r.points` de l'artefact réel | `TypeError: Cannot read properties of undefined (reading 'length')` (r.points undefined ⇒ `bell_density_report_points_feed_projection` RED) |
| **M-b1b-16** retire `setSlice()` du `finally` par mint (rc.ts:743) | la tranche `by_mint` doit survivre à l'épuisement | `AssertionError: the interrupted mint's by_mint slice is preserved by the per-mint finally` (RED) |
| **M-G2-delta (mon cru)** le `finally` par mint SWALLOWS l'erreur fatale (ajout `catch(_e){}` rc.ts:739) | le nouveau `try/finally` ne doit PAS avaler le BudgetExceededError (fail-closed) | `AssertionError: Missing expected rejection (BudgetExceededError): the budget stop is fatal (mid-mint)` (RED) |

Mon mutant delta prouve que le nouveau `try/finally` **préserve la propagation fail-closed** (la préoccupation naturelle d'un `finally` introduit autour d'un chemin d'erreur) — non couvert par M-b1b-15/16.

---

## 6. Corrections formées C-G2-n (fichier:ligne, correctif, test/mutant, `error_origin`)

- **C-G2-1 — [RÉSOLUE `f4b0d9c`] texte Amend. 3(4) = formule de grille contredit le code.** `docs/G0-lot-t1a-ii-b3d-b.md:203` (à 8646c62) écrit `d_j = tx_j/(slot_{j+1}−slot_j)` (grille) alors que le code implémente la densité-page (rc.ts:734) ; committé tel quel avant la sonde (Amend. 3(6)), le pré-enregistrement contredirait l'estimateur exécuté. **Correctif (appliqué)** : réécrire en `d_j = tx_j/(lastSlot_j − firstSlot_j)` + rejet explicite de la grille (indéfinie au dernier nœud, sous-projette 1 575 vs 157,5). **Preuve** : mutant M-G2-1 (`157.5 !== 1575`). **`error_origin`** : rédacteur du pli G0-b (formule de grille écrite) + validateur checkpoint-1 (acceptée non vérifiée) ; le worker b1b a **déclaré** la déviation (RENDU §1) mais n'avait pas formé l'item — mineur. **Statut** : résolu à `f4b0d9c` (cite ma mesure verbatim).
- **C-G2-2 — [RÉSOLUE `06795cc`] tuyau sonde→projection non testé bout-en-bout à 8646c62.** `apps/bell/test/rebase-crosscheck.test.ts` : aucun test ne passait les `points[]` ÉMIS de `sonde-report.json` à `projectPagesAtFraction` (les deux `bell_h6_projection_*` utilisent des modèles à la main). Le RENDU §3 le prétendait « câblé bout-en-bout » — inexact. **Correctif (appliqué)** : `bell_density_report_points_feed_projection` (mutant M-b1b-15 rouge). **`error_origin`** : worker G1 b1b (affirmation de branchement non tenue). **Statut** : résolu au pli checkpoint-2.
- **C-G2-3 — [OUVERTE, NON BLOQUANTE, déclencheur G0 course] la sonde écrase `require_full_pages` false→true (défense en profondeur).** `apps/bell/src/rebase-crosscheck.ts:699,705` (à 8646c62 ET 06795cc) : `runDensityProbeCli` écrit `require_full_pages: (opts.requireFullPages ?? true)` **sans jamais consulter `prior.requireFullPages`** (lu par `readPriorBudget:600` puis ignoré). **Preuve RE-EXÉCUTÉE** (PROBE_A, iso-8646) : `prior_rfp=false, sonde=STRICT => written require_full_pages=true`. **Conséquence** : la garde mixed-mode du tirage (rc.ts:621 `prior.requireFullPages !== true ⇒ throw` ; modèle de menace déclaré rc.ts:618-620 « the reverse — a strict ledger read loosely — stays safe » = *ledger lâche → reprise stricte*) est fail-closed ; **pour** que le contournement se déclenche il faut TROIS choses hors séquence sur le `--out` partagé : (i) un tirage `--allow-short-pages` a écrit `false` + un ledger lâche, (ii) une sonde stricte remonte le drapeau à `true`, (iii) un tirage strict reprend dessus. **Aucun chemin canonique ne réunit les trois** : la séquence PLI §7 lance la sonde EN PREMIER (aucun tirage antérieur, aucun ledger), les 4 tirages sont stricts, l'audit §5 est sur un `--out` distinct. C'est donc une **asymétrie de défense en profondeur** (la sonde est un writer NON gardé d'un drapeau qu'une autre garde consulte), pas un bug du flux servi. **Correctif proposé** : la sonde ne remonte PAS false→true — soit préserver un `prior.require_full_pages:false` (le tirage strict échouera alors correctement à :621), soit refuser comme :621. **Test à ajouter** : `bell_density_strict_refuses_or_preserves_loose_prior` ; mutant = l'écrasement actuel ⇒ RED. **`error_origin`** : worker G1 b1b (la sonde, nouveau writer de `budget.json`, n'honore pas l'invariant mixed-mode de b1a). **Propriétaire** : worker ; **déclencheur** : **G0 de la course** (à trancher : garder le résidu déclaré OU ajouter la garde symétrique — coût R-25 ~5 lignes + 1 test). **Sévérité** : **NON bloquante** — ni pour le livrable OFFLINE b1b (la sonde est correcte), ni pour la course canonique (inatteignable) ; formée pour ne pas être un dû nu (règle Dettes).

---

## 7. `error_origin` proposé (journal de provenance G7)
- **C-G2-1** : rédacteur pli G0-b + validateur checkpoint-1 (formule de grille non vérifiée contre le dédoublement dimensionnel / le dernier nœud). *(Concordant avec l'`error_origin` inscrit à `f4b0d9c`.)*
- **C-G2-2** : worker G1 b1b (branchement affirmé « bout-en-bout » sans le test).
- **C-G2-3** : worker G1 b1b (sonde writer de `budget.json` n'honorant pas la garde mixed-mode).
- Résidu §7.4 (by_mint) & 2 corrections hors périmètre : `error_origin` **G7 -b3d-b1a** (fold `a01cb4e` non re-linté ; by_mint corrigé au pli checkpoint-2).

## 8. Provenance
Relecteur G2 `claude-opus-4-8[1m]` effort max, 2026-09-21. Cibles **pinnées** `8646c62` (principal) et `06795cc` (delta), base `d8d25e3` — accédées par `git archive` (blobs immuables). **HEAD du worktree observé à `2a463637` en fin de revue** (le worktree partagé a continué d'avancer sous le checkpoint-2 parallèle) — **hors périmètre de cette G2** : mes cibles sont pinnées, l'analyse ne dépend pas du HEAD courant. Vérification par RE-EXÉCUTION dans des arbres extraits isolés (`git archive`, jonction node_modules), worktree partagé **jamais muté** (parallélisme checkpoint-2 régime B respecté). Aucun réseau, aucun secret, fixtures synthétiques. Scratch `F:\tmp\g2-b3db1b\` (drivers `driver.mjs`/`driver2.mjs`/`isomut.mjs`/`capture.mjs`, logs `ci.log`/`ci-06795.log`, iso-8646/iso-06795). R-20 : aucun commit. R-21 : sorties citées reproductibles. Réviseur aval = orchestrateur (vérification adversariale + G7 + acceptation validateur-humain).
