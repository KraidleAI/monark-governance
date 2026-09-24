# G2-DELTA2 — revue adversariale du pli G2 DELTA (delta `eb54baa..0dd13ca`), lot Bell T-1a-ii-b3d, sous-lot **-b3d-a**

Relecteur **G2 DELTA-2**, instance séparée à contexte frais : je n'ai écrit NI le G1, NI le pli G2, NI la G2 DELTA
initiale, NI le pli des défauts C-G2D-1..4. 2026-09-20 23:23 UTC (heures lues `date -u`). Worktree jugé
`F:\Monark-wt-bellb3d`, branche `lot/t-1a-ii-b3d`, base `f654151`, HEAD `0dd13ca`. Delta relu : `git diff
eb54baa..0dd13ca` (5 fichiers : `collect.ts` +7, `rebase-crosscheck.ts` +53/-, `rebase-crosscheck.test.ts` +96,
`docs/G2-DELTA-lot-t1a-ii-b3d-a.md` NEW +314, `docs/PLI-lot-t1a-ii-b3d.md` +62). **Aucun appel réseau, aucun secret, R-20 : je ne committe pas.**
- **Worktree JAMAIS édité — PROUVÉ (post-runs)** : APRÈS les 121 tests bell + gates joués dans le worktree,
  `git status --porcelain` **vide** ET `git diff --stat` **vide** dans `F:\Monark-wt-bellb3d`. (Les oracles ne modifient pas
  la source ; les mutants n'ont tourné QUE dans la sandbox.) L'égalité `sandbox == pristine` prouve la RESTAURATION de la
  sandbox, distinct du worktree-propre ci-dessus.
- **Rien sur C: — VÉRIFIÉ** : `node -e "os.tmpdir()"` ⇒ **`F:\tmp`** (TEMP=TMP=F:\tmp, profil utilisateur, ADR-C03) ⇒ les
  `mkdtempSync(tmpdir())` des tests ont écrit sous **F:**, pas C: (confirmé : 0 artefact `g2d2-*`/`bell-cc-*` sous
  `C:\…\Local\Temp` ; mes 190 dirs temporaires F:\tmp nettoyés). Scratch `F:\tmp\bellb3d\g2d2\`.
Sandbox mutants `F:\tmp\bellb3d\g2d2\wt` (tar du worktree − .git/node_modules ; les tests bell n'importent QUE du relatif +
`node:` ⇒ node_modules inutile — mesuré), pristine + sha `F:\tmp\bellb3d\g2d2\pristine`.

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme, Opus 4.8 1M non banni, effort max
(source = identité d'exécution de la session, `Exact model ID is claude-opus-4-8[1m]`).

---

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le pli G2 DELTA (fold C-G2D-1..4) est **correct sur le fond** et la **fusion offline est sûre**. Les quatre défauts sont
pliés fail-closed, prouvés par oracle et rejeu empirique, byte-identité §2 conservée :

- **C-G2D-1** : `--max-pages` est **REQUIS + `> 0`** au crosscheck (`collect.ts:452-454`), throw à l'analyse d'arguments,
  APRÈS `--max-credits`. Surface d'analyse d'arguments **entièrement fail-closed** (voir §C-G2D-1) : `--max-pages=…`
  (forme `=`), non-numérique, `NaN`, négatif, `Infinity` ⇒ **rejetés** ; flottant / `0x10` ⇒ **bornés** ; argument
  **répété ⇒ le PREMIER gagne** (fail-closed). **Rejeu empirique** (fixtures synthétiques, flags §7 exacts) : le tirage
  SANS `--max-pages` est **rejeté au parse** (l'ancien « stuck at 3 → jamais genesis » est structurellement supprimé) ;
  la SONDE `--max-pages 1 --max-calls 150 --max-credits 1500` est **bornée** (`calls_used=2 ≤ 150`,
  `credits_worst_case=20 ≤ 1500`, 1 page ledger, `inconclusive`) ; le TIRAGE `--max-pages 649750` (MÊME `--out`) **atteint
  genesis** (`scan_complete=true`, `reason=null`, `verdict=equal`, `calls_used=5` cumulatif). Mutant retrait du throw
  **RED**. *(Rejeux joués contre l'oracle PRISTINE — mes tests `G2D2_*` n'ont été appendus au fichier de test sandbox
  qu'APRÈS la campagne de mutants ; ordre correct, N2/N3 ont donc survécu contre l'oracle non modifié.)*
- **C-G2D-2** : budget lié au ledger (`readPriorCalls` + `ledgerPagesOnDisk`/`hasResumeState`, `rebase-crosscheck.ts:
  383-418`), fail-closed. **Aucun faux refus** — y compris le cas clé de la mission (helper de densité écrivant
  `budget.json` sans `ledger-<MINT>.jsonl`) : `calls_used=32` + 0 ledger ⇒ **ACCEPTÉ** (le compteur n'enfle que par
  rapport aux pages ⇒ l'invariant `calls_used ≥ Σ pages` tient toujours). L'ENFORCEMENT recompte la **somme GLOBALE des
  pages sur disque (tous mints)**, jamais le champ `pages` par-mint (audit seul) — vérifié empiriquement (2+3=5 pages,
  `calls_used=4 ⇒ throw`). La seule fausse-acceptation est le **résidu déclaré, borné et audité** (édition à la baisse
  jusqu'au plancher ledger, sous-compte du gap getTransaction). Mutants (a) et (b) **RED**.
- **C-G2D-3** : `equal` (unique chemin de retrait de `pending`) exige `fieldDiffs ⊆ {instructionIndex}`
  (`rebase-crosscheck.ts:357-364`). C'est une **liste blanche** (`d.field !== "instructionIndex"`) ⇒ `blockTimeSec` **et
  tout champ futur** de `nonKeyDiffs` sont fail-closed vers `inconclusive:field_diff_outside_index`. Interaction avec le
  sous-cas B de C-G2-2 **saine et en défense-en-profondeur** : H5-avant-`equal` (`:345`) intercepte déjà le cas B ;
  C-G2D-3 (`:362`) intercepte le cas résiduel « H5 concorde par coïncidence + gap blockTime ». Mutant `if(false)` **RED**.
- **C-G2D-4** : la persistance PAR PAGE est **prouvée** par `bell_crosscheck_per_page_budget_survives_crash` (crash sur
  le fetch de la page 2, APRÈS le `onPage` de la page 1, AVANT l'écriture finale ⇒ `budget.json` existe à
  `calls_used=2, pages=1` ; mutant suppression de l'écriture par page ⇒ `budget.json` absent ⇒ **RED**). Le
  réordonnancement « budget EN TÊTE de `onPage` » (`:459`) est **sain** (crash entre budget et append ledger ⇒
  sur-compte ≤ 1 page, conservateur, re-fetch sans perte) et correctement **non-mutant-testé** (aucun seam d'injection
  intra-`onPage` ; item formé).

**§2 (H1..H6) byte-identique** : sha256 `= 7071484f3444abe6c09b694f730ad2fcce2f00ea8c12e8cc39fc31806a3c7867`
**reproduit à `cb25d60`, `eb54baa` ET `0dd13ca`** (méthode `awk` du doc). Amendement 2 daté 2026-09-20 22:49 UTC,
**postérieur** au commit `eb54baa` (21:42 UTC) qui le motive et **antérieur** à son propre commit `0dd13ca` (23:03 UTC) ;
**aucun artefact de course** (ni sous `F:\tmp\bell-b3d-*`, ni tracké/untracké dans le dépôt). Commandes PLI **cohérentes**
§3/§4/§7 + amendements. **Tous les oracles verts** (121 bell, 27 ci-gates, 1 no-secret, typecheck 0, eslint 0, ratchet
69/69, vocab/lang/export OK). **13 mutants ciblés** (9 du pli RED avec compte de fails conforme + 4 neufs : 2 RED,
**2 SURVIVANTS = gaps d'oracle**), restauration byte-exacte prouvée par sha. **R-25 = 1 095 (ins+del) < 1 205** (métrique
CI réelle, marge 110). `PINNED_BELL_SHA` inchangé. Rien de nouveau « built » (Bell reste `upcoming`).

**Corrections (non bloquantes AVANT FUSION ; à intégrer AVANT LE TIRAGE RÉSEAU)** : deux **gaps d'oracle** révélés par
mes mutants neufs survivants — le CODE est correct, ce sont les TESTS qui ne pinnent pas ces frontières :
**C-G2D2-1** (frontière `calls_used < pages` vs `<=` non testée ⇒ une régression future vers `<=` = faux refus qui
« bloquerait le tirage réel », le point que la mission déclare le plus important) et **C-G2D2-2** (branches
`events|handoffs` de `hasResumeState` non exercées). + **C-G2D2-3** (nit doc : chiffre R-25 périmé en §9). Aucune n'ouvre
de surdépense ni de faux `equal`.

**Items déjà FORMÉS (confirmés, pas de nouveau défaut)** : (i) ordre d'append `events-`/`handoffs-` vs `ledger-` (C-7b
pré-existant) — fail-closed (au pire une **fausse `divergence` ⇒ ESCALADE-INVESTISSEUR**, jamais un faux `equal` ni une
casse du plafond), inchangé par ce pli, item avec déclencheur « avant le tirage » ⇒ **acceptable comme item, PAS bloquant
avant fusion** (voir §C-G2D-4) ; (ii) preuve INDÉPENDANTE du zéro-réseau = lecture du delta Helius Usage (gTfA) postérieur
à `eb54baa` == 0 — **non vérifiable hors ligne**, contingence de checkpoint-2 (l'absence d'artefacts locaux ne suffit pas).

---

## Défauts numérotés (C-G2D2-n)

### C-G2D2-1 — **NON BLOQUANT AVANT FUSION ; item AVANT TIRAGE RÉSEAU** — la frontière `calls_used == ledgerPages` n'est pas pinnée (mutant survivant)
`apps/bell/src/rebase-crosscheck.ts:416` (`if (raw.calls_used < ledgerPages) throw …`).
Mutation NEW-2 : `<` → `<=`. **SURVIT 27/27** (l'oracle ne la tue pas). Le CODE est **correct** (`<` : `calls_used ==
pages` est un état légitime — reprise après k pages toutes sans re-lecture getTransaction otherOp, atteignable près de
genesis). Une régression vers `<=` provoquerait un **FAUX REFUS** de reprise (throw sur `calls_used == pages`), c.-à-d.
exactement le cas que la mission désigne comme le plus grave (« un faux refus bloquerait le tirage réel »). Le test
`bell_crosscheck_readPriorCalls_binds_to_ledger` couvre `calls_used=1 < 2 ⇒ throw` et `calls_used=5 ≥ 2 ⇒ ok`, **mais
jamais la frontière `calls_used == pages`**.
- **Correction minimale** : ajouter au test un cas `calls_used == ledgerPages` (p. ex. 2 pages, `calls_used:2`) ⇒
  **accepté sans throw** (`assert.equal(readPriorCalls(dir), 2)`). Tue NEW-2. *(Le cas exact est DÉJÀ rédigé dans mon bloc
  sandbox appendu à `F:\tmp\bellb3d\g2d2\wt\apps\bell\test\rebase-crosscheck.test.ts` — `G2D2_readPriorCalls_scenarios`,
  ligne « édité à la baisse au plancher » — à porter tel quel dans le worktree par le worker.)*
- **`error_origin`** : worker -b3d-a (oracle C-G2D-2).
- **Bloquant** : NON avant fusion (code correct) ; **item à lander AVANT LE TIRAGE RÉSEAU** (protège la frontière du
  faux-refus, enjeu ~5,4 M cr).

### C-G2D2-2 — **NON BLOQUANT (gap d'oracle mineur)** — les branches `events|handoffs` de `hasResumeState` sont non exercées (mutant survivant)
`apps/bell/src/rebase-crosscheck.ts:395` (`/^(ledger|events|handoffs)-.*\.jsonl$/.test(f)`).
Mutation NEW-3 : retrait de `events|handoffs` (garde `^(ledger)-`). **SURVIT 27/27**. Le test (a) n'écrit qu'un
`ledger-SPYx.jsonl` ⇒ seule la branche `ledger` est tuée (retrait de `ledger` ⇒ RED, vérifié par implication). Les
branches `events`/`handoffs` sont **défensives** (dans `onPage`, `budget.json` puis `ledger` sont écrits AVANT
`events`/`handoffs` ⇒ un état events-seul sans budget est irréalisable en pratique) mais restent **non testées**.
- **Correction minimale** : un cas avec `events-SPYx.jsonl` (ou `handoffs-`) présent, sans `budget.json` ni `ledger-` ⇒
  **throw** (`/no budget\.json/`). Tue NEW-3.
- **`error_origin`** : worker -b3d-a (oracle C-G2D-2).
- **Bloquant** : NON (code correct, branche défensive) ; hardening.

### C-G2D2-3 — **NON BLOQUANT (nit doc)** — chiffre R-25 périmé en §9 du PLI
`docs/PLI-lot-t1a-ii-b3d.md:119` (« R-25 = **943 insertions** … < 1 100 »). Périmé : la mesure réelle post-delta est
**1 075 insertions / 1 095 ins+del** (section « PLI G2 delta » l.178, qui fait foi). §9 est du texte de base append-only
(non ré-édité pour préserver la byte-identité §2), mais un lecteur de §9 seul lit un chiffre faux.
- **Correction minimale** : note de supersession « → voir PLI G2 delta (1 075/1 095) » en §9, ou marquer §9 R-25
  supersédée. `error_origin` : worker (hygiène doc, supersession append-only). Bloquant : NON.

*(Aucun défaut BLOQUANT — ni avant fusion, ni avant tirage réseau — n'a été trouvé dans le CODE.)*

---

## Réponses aux axes de la mission

### 1. C-G2D-1 — `--max-pages` requis, surface d'analyse d'arguments, exécutabilité du tirage
Mécanique (`collect.ts:412` `argOf` = `indexOf(k)` → `argv[i+1]` ; `:418-424` `num` = `Number(raw)`, throw si
`!Number.isFinite || <0`) et gardes crosscheck (`:452-454`) :

| Cas adversarial | Comportement | Verdict |
|---|---|---|
| `--max-pages=649750` (forme `=`) | `indexOf` ne matche pas ⇒ `argOf`=undefined ⇒ **throw** « requires --max-pages » | fail-closed (impose la forme espace des cmds §7) |
| `--max-pages abc` / `NaN` | `Number` ⇒ NaN ⇒ `!isFinite` ⇒ **throw** (num, `:422`) | fail-closed |
| `--max-pages -5` | `Number("-5")=-5 <0` ⇒ **throw** (num) | fail-closed |
| `--max-pages Infinity` | `!isFinite` ⇒ **throw** (num) | fail-closed |
| `--max-pages 3.5` / `0x10` | flottant/hex **bornés** (3.5, 16) ⇒ scan borné ⇒ au pire `inconclusive` | fail-closed (jamais surdépense) |
| `--max-pages` répété | `indexOf` = **PREMIER** ⇒ le premier gagne (idem `--max-calls`/`--max-credits`) | fail-closed |
| `--max-pages 0` | `!(maxPages>0)` ⇒ **throw** « must be > 0 » (`:454`) | fail-closed |
| omis (tirage « à la lettre ») | **throw** « requires --max-pages » (`:452`) — inexprimable | fail-closed |

Même traitement `--max-calls` (`:437-439`, requis + `>0`) et `--max-credits` (`:444-447`, requis crosscheck + `>0`). Ordre
des throws : `--max-credits` (`:444`) AVANT `--max-pages` (`:452`) ⇒ l'erreur crédit surface d'abord (conforme au
commentaire ; le test `requires_max_pages` fournit `--max-credits` valide). **Rejeu empirique** (test ajouté en sandbox
`G2D2_replay_probe_then_draw_same_out`, mêmes flags que §7) : (0) tirage sans `--max-pages` ⇒ `runMain` **rejette**
`/--max-pages/` ; (1) SONDE `--max-pages 1 --max-calls 150 --max-credits 1500` ⇒ `calls_used=2, credits=20`, **1 page**,
`inconclusive` (borne 150/1 500 respectée avec large marge) ; (2) TIRAGE `--max-pages 649750`, **MÊME `--out`** ⇒
`scan_complete=true, reason=null, verdict=equal`, `calls_used=5` (cumulatif : 2 sonde + 3 tirage). Le tirage §4/§7 est
donc **exécutable jusqu'à la genèse** et la sonde **reste bornée**.

### 2. C-G2D-2 — budget lié au ledger : faux refus vs fausse acceptation (rejeu empirique)
Test ajouté en sandbox `G2D2_readPriorCalls_scenarios` (8 scénarios, tous conformes) :

| Scénario | Résultat | Lecture |
|---|---|---|
| **helper densité : `budget.json{calls_used:32}` + 0 ledger** | `readPriorCalls ⇒ 32` (accepté) | **PAS de faux refus** — l'invariant `calls_used ≥ Σ pages` tient (le helper n'enfle que `calls_used`) |
| sonde (a) : `calls_used:33` + 1 page ledger | `⇒ 33` | reprise du tirage acceptée |
| **2 mints même `--out`** : ledger 2+3 pages, `calls_used:5` | `⇒ 5` ; `calls_used:4` ⇒ **throw** `/below the 5/` | l'ENFORCEMENT recompte **Σ GLOBALE** (pas le champ `pages` par-mint, audit seul) |
| ledger tronqué d'une ligne, `calls_used:5` | `⇒ 5` (accepté) | conservateur (re-fetch), jamais un faux refus |
| ledger vide + pas de budget | `⇒ 0` (fresh) | `.trim()` : le vide n'est pas un état de reprise |
| budget copié d'un AUTRE run (plus haut) | `⇒ 999` (accepté) | sur-compte = conservateur, jamais une casse du plafond |
| **édité à la baisse au plancher (`calls_used==pages`)** | `⇒ 2` (accepté) | **résidu déclaré** : sous-compte du gap getTransaction, borné par le ledger, audité §5 |
| budget absent + ledger présent | **throw** `/no budget\.json/` | jamais un reset silencieux à 0 |

Conclusion : **aucun faux refus** (dont le cas clé helper-densité) ; la seule fausse-acceptation est le **résidu déclaré,
borné (≥ pages) et audité** — jamais une casse silencieuse du plafond 6,5 M. Mutants (a) `if(hasResumeState)`→`if(false)`
et (b) `if(calls_used<pages)`→`if(false)` **RED**.

### 3. C-G2D-3 — `equal` ⊆ {instructionIndex} ; `pending` jamais retiré hors `equal` ; interaction sous-cas B
`compareToHybrid` (`:324-366`) : `fieldDiffs` ne peut porter QUE `instructionIndex`/`blockTimeSec` (`nonKeyDiffs`,
`:308-312`). La garde `:362` (`outsideIndex = fieldDiffs.filter(d.field !== "instructionIndex")` ; `if (length>0) ⇒
inconclusive:field_diff_outside_index`) est une **liste blanche** ⇒ `blockTimeSec` **et tout champ futur** sont
fail-closed. **Unique** `return {verdict:"equal"}` (`:364`), gardé par `complete` (`:325`) ∧ pas de collision (`:333`) ∧
`setsEqual` (`:357`) ∧ `h5Ok` (`:345` renvoie si faux) ∧ `fieldDiffs ⊆ {instructionIndex}` (`:362`). Tous les autres
retours sont `inconclusive`/`divergence` ⇒ **aucun chemin ne retire `pending` hors `equal`**. Interaction sous-cas B :
**défense en profondeur** — le mutant C-G2-2B (`if(!h5Ok)`→`if(false)`) fait tomber le cas B (H5 échoue + sets égaux + gap
blockTime) jusqu'à `if(setsEqual)`, où C-G2D-3 le capture en `field_diff_outside_index` (au lieu d'un faux `equal`) ⇒
`bell_crosscheck_c3_mismatch_sets_equal_declares_blocktime` reste **RED (3 fails, mesuré)**. Sain.

### 4. C-G2D-4 — persistance PAR PAGE prouvée ? réordonnancement & append-order : risque réel ?
Le test **prouve bien la persistance PAR PAGE** (pas seulement finale) : le crash est injecté sur le FETCH de la page 2
(après le `onPage` de la page 1, avant l'écriture finale jamais atteinte) ⇒ `budget.json` existe à `calls_used=2,pages=1`
UNIQUEMENT parce que `onPage` l'a écrit ; le mutant « suppression de l'écriture par page » ⇒ `budget.json` absent ⇒ **RED**
(rejoué). `ledger.push(entry)` précède `sink.onPage` (`:241`) ⇒ `ledger.length==1` à la page 1 (assertion fondée).
**Réordonnancement « budget en tête »** (`:459` avant les appends) : **sain**, non-mutant-testé faute de seam intra-`onPage`
(le sink est construit dans `runRebaseCrosscheckCli`, le crash frappe le fetch suivant) — item formé, deviendra
mutant-testable si -b3d-b expose un seam. Analyse du crash intra-`onPage` :
- crash APRÈS budget, AVANT append ledger : `calls_used ≥ pages_disque` (sur-compte ≤ 1 page) ⇒ la reprise **re-fetch** la
  page (dédup par signature) ⇒ **ni double compte ni perte** ; conservateur. *(C'est précisément ce que le
  réordonnancement obtient ; l'ancien ordre — budget en dernier — pouvait laisser `calls_used < pages` ⇒ faux refus de
  reprise (b). Le réordonnancement CORRIGE ce faux-refus.)*
- crash entre append `ledger` et append `events`/`handoffs` (**C-7b, pré-existant, hors périmètre C-G2D**) : la page est
  au ledger mais ses events non ; la reprise repart à `slot_hi` ⇒ les events de cette page ne sont **ni re-décodés ni
  ré-ensemencés** ⇒ **PERTE d'events** ⇒ `missingFromFullmint` ⇒ **`divergence`** (jamais un faux `equal`). C'est
  **fail-closed** : au pire une **fausse `divergence` ⇒ ESCALADE-INVESTISSEUR** (revue humaine), jamais un retrait erroné
  de `pending` ni une casse du plafond. Le déplacement du budget en tête **ne touche pas** cet ordre relatif.
- **Jugement** : **ACCEPTABLE comme item -b3d-b/course (déclencheur « avant le tirage »), PAS bloquant avant fusion.** Le
  risque est fail-closed (escalade, pas résultat faux) et à très faible probabilité (fenêtre µs). L'item est déjà formé
  (PLI l.51, l.193) avec le bon déclencheur ; le checkpoint-2/orchestrateur doit le tracer (résolution avant le tirage).

### 5. Pré-enregistrement, cohérence des commandes, absence de course
- **§2 byte-identique** : sha256 `7071484f…` **reproduit** à `cb25d60` (pré-enreg SEUL), `eb54baa` (fold C-G2-1..7),
  `0dd13ca` (fold C-G2D-1..4). §2 présent dès `cb25d60`. Non-ajustabilité confirmée.
- **Amendement 2 daté & ordonné** : 22:49 UTC ; timeline git `eb54baa` 21:42 UTC → Amend.2 22:49 → `0dd13ca` 23:03.
  Monotone, antérieur à son commit. (Amend.1 21:16 < `eb54baa` 21:42 ; G2 DELTA doc 21:43.)
- **Aucun artefact de course** : `F:\tmp\bell-b3d-*` **absent** ; aucun `crosscheck-*.json`/`ledger-*.jsonl`/`sonde-report`
  /`PROVENANCE-crosscheck` tracké NI untracked/ignoré. Offline par construction. **Preuve INDÉPENDANTE** (delta Helius
  Usage post-`eb54baa` == 0) **non vérifiable hors ligne** ⇒ contingence checkpoint-2.
- **Cohérence des commandes** : sonde §3/§7 = `--max-pages 1 --max-calls 150 --max-credits 1500` ; tirage §4/§7 =
  `--max-pages 649750 --max-calls 649750 --max-credits 6497500` ; Amend.2(1) ajoute `--max-pages 649750`. §3/§4/§7 +
  amendements **cohérents** ; arithmétique `1 500 + 1 000 + 6 497 500 = 6 500 000`, `6 497 500 = 649 750 × 10` ✓.

---

## Tableau des mutants (restauration **byte-exacte** `cp` depuis pristine POST-FIX, **jamais `git checkout`** ; sha ré-vérifié)
Sandbox `F:\tmp\bellb3d\g2d2\wt`, baseline **27/27** (`apps/bell/test/rebase-crosscheck.test.ts`). Pristine (== worktree) :
`collect.ts 41cba3ff…`, `rebase-crosscheck.ts 72cfedfc…`, `rebase-crosscheck.test.ts 0640d1df…` (identiques aux sha
annoncés PLI l.172). Sha final post-campagne == pristine (prouvé).

| # | Défaut | Cible | Mutation | **Résultat (pass/fail)** |
|---|---|---|---|---|
| P1 | C-G2D-1 | collect.ts:452 | `argOf("--max-pages")===undefined` → `false` (retire le throw requis) | **RED (26/1)** |
| P2 | C-G2D-2(a) | rebase-crosscheck.ts:407 | `if (hasResumeState(out))` → `if (false)` | **RED (26/1)** |
| P3 | C-G2D-2(b) | rebase-crosscheck.ts:416 | `if (raw.calls_used < ledgerPages)` → `if (false)` | **RED (26/1)** |
| P4 | C-G2D-3 | rebase-crosscheck.ts:363 | `if (outsideIndex.length > 0)` → `if (false)` (faux `equal`) | **RED (26/1)** |
| P5 | C-G2D-4 | rebase-crosscheck.ts:459 | suppression de l'écriture `budget.json` par page (`→ void 0;`) | **RED (26/1)** |
| P6 | C-G2-1 | rebase-crosscheck.ts:57 | `WORST_CASE = CREDITS_PER_GTFA` → `CREDITS_PER_GET_TX` | **RED (25/2)** |
| P7 | C-G2-2 A | rebase-crosscheck.ts:352 | `if (!setsEqual) return divergence` → `if (false)` | **RED (26/1)** |
| P8 | C-G2-2 B | rebase-crosscheck.ts:345 | `if (!h5Ok) {` → `if (false) {` (défense-en-profondeur C-G2D-3) | **RED (24/3)** |
| P9 | C-G2-7 coll. | rebase-crosscheck.ts:333 | garde de collision → `if (false)` | **RED (26/1)** |
| **N1** | **NEUF arg** | collect.ts:454 | `!(maxPages > 0)` → `!(maxPages >= 0)` (autorise `--max-pages 0`) | **RED (26/1)** |
| **N2** | **NEUF resume** | rebase-crosscheck.ts:416 | `calls_used < ledgerPages` → `<=` (frontière faux-refus) | **SURVIT (27/0) ⇒ C-G2D2-1** |
| **N3** | **NEUF resume** | rebase-crosscheck.ts:395 | `hasResumeState` retire `events|handoffs` | **SURVIT (27/0) ⇒ C-G2D2-2** |
| **N4** | **NEUF resume** | rebase-crosscheck.ts:389 | `ledgerPagesOnDisk` retire le filtre `.trim()!==""` | **RED (26/1)** (msg « below the 2 ») |

**Bilan : 11/13 ROUGES** (9 du pli — comptes de fails conformes : C-G2-1→2, C-G2-2B→3 ; + 2 neufs N1/N4) ;
**2 SURVIVANTS** (N2/N3 = gaps d'oracle, code correct). Restauration byte-exacte finale confirmée (sha == pristine).

## Oracles (un à un ; PAS `npm run ci`) — tous VERTS (worktree, lecture seule)
| Oracle | Résultat |
|---|---|
| `apps/bell/test/*.test.ts` (11 fichiers, incl. rebase-crosscheck 27, collect 34/`PINNED`, rebase-course 2, produce 3, scan 8) | **121/121** |
| `test/ci-gates.test.ts` | **27/27** |
| `test/no-secret-in-repo.test.ts` | **1/1** |
| `typecheck` (`tsc --noEmit`) | **exit 0** |
| `eslint` (3 fichiers touchés) | **exit 0** |
| `lint:ratchet` | **69/69** (plafond inchangé) |
| `gate:vocab` | **OK** (177 fichiers, 0 claim interdit) |
| `lang:gate` | **0 hit** (bell GATED) |
| `export:check` | **0 chemin interdit, 0 FR** (bell GATED) |

## R-25, PINNED, « built »
- **Métrique CI réelle** (`.github/workflows/ci.yml:65-72`) : le gate calcule `CHANGED = ins + del` (`awk … print
  ins+del+0`, l.69) et **BLOQUE si `> VIBEGATES_PR_LIMIT` = 1205** (l.43,71). Ce n'est PAS « insertions seules ». Pathspec
  `f654151...HEAD` (trois-points) excluant `docs/**/*.md`, `package-lock.json`, fixtures. **Mesuré sous le pathspec exact :
  `5 files, 1075 insertions, 20 deletions ⇒ CHANGED = 1 095`.** ⇒ **< 1 205 (marge 110)** et **< 1 100** (seam auto-imposé
  -b3d-b, **marge 5**). Annonce PLI « 1 075 ins / 1 095 ins+del » **conforme**. (Nit : §9 l.119 affiche encore 943 — périmé,
  C-G2D2-3.)
- **`PINNED_BELL_SHA` inchangé** : `apps/bell/test/collect.test.ts:79 = 0cfbed20fc7ab…` ; diff `eb54baa..0dd13ca` sur ce
  fichier **VIDE** ⇒ inchangé ; `collect.test.ts` **34/34 vert** (digest reproduit, pas seulement inaltéré).
- **« built » inchangé** : le delta ne touche ni `fleet.ts` ni README/registre (vérifié) ⇒ **rien de nouveau built** ;
  Bell reste `upcoming`. Fixtures 100 % synthétiques ; `no_secret_in_repo` vert.

---
## Provenance
Revue par relecteur **G2 DELTA-2** `claude-opus-4-8[1m]` effort max, contexte frais (n'a écrit ni G1, ni pli G2, ni G2
DELTA initiale, ni le pli C-G2D-1..4), 2026-09-20, worktree `F:\Monark-wt-bellb3d` @ `0dd13ca`. Delta `eb54baa..0dd13ca`.
Sandbox mutants `F:\tmp\bellb3d\g2d2\wt` (pristine + sha `F:\tmp\bellb3d\g2d2\pristine`), rejeux
`G2D2_replay_probe_then_draw_same_out` + `G2D2_readPriorCalls_scenarios` (tests ajoutés en sandbox jetable, jamais dans le
worktree). Aucun réseau, aucun secret, aucune écriture dans le worktree (**prouvé post-runs** : `git status --porcelain`
+ `git diff --stat` vides), rien sur C: (`os.tmpdir()` = `F:\tmp`, vérifié ; 0 artefact de moi sous C:), aucun commit
(R-20). Sortie vérifiable adversarialement (R-21).
- **Note d'honnêteté (campagne de mutants)** : la 1ʳᵉ tentative de campagne a été **INVALIDÉE** — la sauvegarde pristine
  avait été avortée par un `set -e` sur l'échec de la jonction `node_modules`, donc les restaurations no-op-aient et les
  mutations se sont **empilées** (compte de fails croissant, non-per-mutant). Corrigée : pristine re-sauvegardé depuis le
  worktree PROPRE, sandbox réparée (sha == worktree), **campagne entièrement re-jouée** (résultats du tableau ci-dessus,
  restauration byte-exacte entre chaque mutant vérifiée par sha). Le worktree n'a jamais été touché durant l'incident.
