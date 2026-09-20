# G2-DELTA — revue adversariale du pli G2 (delta `a6b86bd..eb54baa`), lot Bell T-1a-ii-b3d, sous-lot **-b3d-a**

Relecteur **G2 DELTA**, instance séparée à contexte frais : je n'ai écrit NI le G1 NI le pli NI la G2 initiale.
2026-09-20 21:43 UTC (`date -u`). Worktree jugé `F:\Monark-wt-bellb3d`, branche `lot/t-1a-ii-b3d`, base `f654151`,
HEAD `eb54baa`. Delta relu : `git diff a6b86bd..eb54baa` (4 fichiers : `collect.ts`, `rebase-crosscheck.ts`,
`rebase-crosscheck.test.ts`, `docs/PLI-lot-t1a-ii-b3d.md`). **Aucun appel réseau, aucun secret, worktree JAMAIS édité
(sha des 2 sources == worktree, prouvé ci-dessous), rien sur C: (TEMP/TMP=F:\tmp), R-20 : je ne committe pas.**
Sandbox mutants `F:\tmp\bellb3d\g2d\wt` (tar du worktree − .git/node_modules + jonction node_modules), pristine +
sha `F:\tmp\bellb3d\g2d\pristine`.

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme, Opus 4.8 1M non banni, effort max
(source = identité d'exécution de la session).

---

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le pli G2 (fold C-G2-1..7) est **correct sur le fond critique** : le plafond CRÉDITS est fail-closed avec un invariant
prouvé (`n·10 ≤ maxCredits`), le majorant 10 cr est **sourcé et vrai** pour les deux seules méthodes appelées, le
pré-enregistrement §2 (H1..H6) est **byte-identique** (sha `7071484f…` reproduit à `cb25d60` ET `eb54baa`), la clé
relâchée DEV-1 **n'ouvre aucun faux `equal`** (32/32 unicité re-mesurée + garde de collision + H5-avant-`equal`), aucun
chemin ne retire `pending` hors `equal`, et `equal` exige H5 (mutant bypass-H5 **RED**). **13/13 mutants rouges** (10 du
pli dont 3× C-G2-7 et 2× C-G2-2 + 3 neufs sur le crédit), restauration byte-exacte prouvée par sha. Tous les oracles
verts ; R-25 = **943 insertions** (annonce conforme) ; `PINNED_BELL_SHA` inchangé ; fixtures 100 % synthétiques ; rien
« built ».

**Une correction BLOQUANTE avant le tirage réseau** (pas avant la fusion offline) : **C-G2D-1** — la commande de tirage
§7, écrite « à la lettre », **ne porte pas `--max-pages`** ⇒ `maxPages` par défaut = 3 (`collect.ts:430`) ⇒ le scan
s'arrête à 3 pages ⇒ `not_at_genesis` ⇒ `inconclusive` à CHAQUE invocation ⇒ **ne peut JAMAIS compléter un mint réel ni
retirer `pending`**. Fail-closed (aucune surdépense, aucun faux `equal`), donc non-FAIL pour l'offline, mais le tirage
est **inexécutable tel qu'écrit**. Prouvé empiriquement (rejeu sonde→tirage, fixtures synthétiques).

Défauts non bloquants : **C-G2D-2** (budget.json absent+ledger présent ⇒ reset fail-open ; édité à la baisse ⇒ accepté —
pré-existant C-1), **C-G2D-3** (règle checkpoint-2/L-4 : `equal` non gardé sur `fieldDiffs ⊆ {instructionIndex}`),
**C-G2D-4** (survivant : persistance budget.json par page non testée). + 1 note d'hygiène doc.

---

## Défauts numérotés

### C-G2D-1 — **BLOQUANT avant tout tirage réseau** — la commande de tirage §7 n'a pas `--max-pages` ⇒ arrêt à 3 pages, jamais complet
`docs/PLI-lot-t1a-ii-b3d.md` §7 (bloc tirage, delta lignes 415-423) + §4 ; `apps/bell/src/collect.ts:430` (`num("--max-pages", 3)`)
propagé à `collect.ts:606` (`{ maxPages, … }` → `runRebaseCrosscheckCli` → `scanFullMint`).
La commande EXACTE du tirage (§7) est `--rebase-crosscheck --pools TSLAx --max-calls 649750 --max-credits 6497500
--min-interval 250 --series-dir … --out F:/tmp/bell-b3d-run` — **sans `--max-pages`**. Or `parseArgs` défausse
`--max-pages` à **3** ; le `?? 5000` interne de `scanFullMint` (`rebase-crosscheck.ts:194`) **ne s'applique jamais** (il
est écrasé). `scanFullMint` boucle `while (pages < maxPages)` ⇒ pour un mint réel (SPYx ~296 000 pages) le scan s'arrête
à **3 pages sans atteindre genesis** ⇒ `complete=false`, `reason="not_at_genesis"` ⇒ `compareToHybrid` renvoie
`inconclusive` ⇒ `pending` conservé, **retrait impossible**. La sonde (§7) porte `--max-pages 1` explicitement (vérif de
forme (a)), donc elle n'est pas touchée ; **c'est le tirage seul** qui est inexécutable.
- **Preuve empirique** (rejeu sonde→tirage à la lettre, fixtures synthétiques 5 pages, `F:\tmp\bellb3d\g2d\replay`) :
  - SCÉNARIO A (flags §7 exacts, tirage SANS `--max-pages`) ⇒ `scan_complete=false scan_reason=not_at_genesis
    verdict=inconclusive pages=3` ;
  - SCÉNARIO B (tirage AVEC `--max-pages 10`) ⇒ `scan_complete=true scan_reason=null verdict=equal pages=6`.
- **Correction minimale** : ajouter **`--max-pages 649750`** aux commandes §7/§4 du tirage (borne per-mint ≥ pages
  projetées ; comme `pages ≤ appels gTfA ≤ --max-calls`, `649750` ne mord jamais avant le budget appels/crédits). Alt.
  (ceinture) : au `collect.ts:606`, défausser `maxPages` à une valeur haute pour la branche crosscheck quand `--max-pages`
  est absent. La correction §7 doit atterrir en amendement laissant **§2 H1..H6 byte-identique** (non-ajustabilité).
- **Portée** : n'autorise AUCUNE surconsommation ni faux `equal` (fail-closed). Bloquant AVANT la sonde/tirage, pas avant
  la fusion offline.
- **`error_origin` proposé** : **worker -b3d (PLI §7/§4 + dépendance à `collect.ts:430` défaut 3 pour la branche
  crosscheck)**. Ni l'orchestrateur (A-4) ni la G2 initiale ne l'ont relevé.

### C-G2D-2 — **NON BLOQUANT (pré-existant C-1, à durcir avant le tirage)** — `budget.json` absent + ledger présent ⇒ reset fail-open ; édité à la baisse ⇒ accepté
`apps/bell/src/rebase-crosscheck.ts:377-384` (`readPriorCalls`), inchangé par ce delta.
Trois comportements à la reprise (répond au point 1) :
- **absent** ⇒ `readPriorCalls` renvoie **0** (run neuf). Combiné à un `ledger-<MINT>.jsonl` **présent** (`resumeFromLedger`
  reprend au `slot_hi`), c'est un **reset fail-open** : le scan reprend au slot du ledger mais le compteur cumulatif est
  remis à 0 ⇒ le plafond 6,5 M **ne compte plus** les appels déjà dépensés. Un opérateur qui `rm budget.json` (p. ex. pour
  débloquer une reprise) **zéroïse silencieusement le plafond**.
- **corrompu** (`calls_used` non-nombre / < 0 / NaN / Infinity) ⇒ **throw** (fail-closed). Correct (test
  `bell_crosscheck_readPriorCalls_fail_closed`).
- **édité à la baisse** (`{"calls_used": 5}`) ⇒ **accepté** (seul le type est gardé) ⇒ offset trop bas ⇒ sous-compte
  (fail-open sur altération manuelle d'un fichier hors dépôt).
- **Correction minimale** : `readPriorCalls` **throw si un `ledger-*.jsonl` existe dans `out` mais pas `budget.json`**
  (une reprise sans son compteur est un état incohérent, jamais un run neuf). L'édition-à-la-baisse relève de la confiance
  opérateur (fichier hors dépôt, pas de HMAC) — à déclarer, non un défaut bloquant en soi.
- **`error_origin`** : worker G1 / checkpoint-1 C-1 (design `readPriorCalls`). Item formé, déclencheur : avant le tirage.

### C-G2D-3 — **NON BLOQUANT (règle checkpoint-2 / L-4, -b3d-b)** — `equal` n'est pas gardé sur `fieldDiffs ⊆ {instructionIndex}`
`apps/bell/src/rebase-crosscheck.ts:357` (`if (setsEqual) return { verdict: "equal", fieldDiffs }`) + `:308-312`
(`nonKeyDiffs` publie `instructionIndex` ET `blockTimeSec`).
`equal` peut être renvoyé avec un `fieldDiff` **`blockTimeSec`** sur des événements appariés. En données RÉELLES c'est
étroit — la clé relâchée inclut `signature`, donc deux événements appariés partagent le même `sig` ⇒ le même tx ⇒ le même
`blockTime` ; un écart de `blockTimeSec` ne peut venir que d'un **désaccord de fournisseur** (gTfA vs getTransaction sur le
`blockTime` d'un même sig), que le quorum-2 interne du full-mint **n'attrape PAS** (`bodyEventKey`,
`rebase-scan.ts:182`, **exclut `blockTime`**). Si un tel écart existe et que le pliage H5 concorde par coïncidence,
`equal` est rendu **avec** l'écart `blockTime` ⇒ `pending` retiré malgré une alarme de qualité de donnée. Le
biconditionnel `bell_crosscheck_committed_artifacts_replay` (`:306`) pilote le retrait sur `verdict==equal` **seul**, sans
regarder `fieldDiffs`.
- **Correction minimale** : sur `equal`, exiger `fieldDiffs ⊆ {instructionIndex}` ; toute entrée `blockTimeSec` ⇒
  escalade (jamais un retrait de `pending`). À porter comme règle **checkpoint-2 / L-4** (le retrait effectif de `pending`
  est -b3d-b, hors périmètre -b3d-a) — d'où **non bloquant** ici.
- **`error_origin`** : worker -b3d-a (comparateur) / spéc L-4.

### C-G2D-4 — **NON BLOQUANT (mutant survivant : gap d'oracle)** — la persistance `budget.json` PAR PAGE n'est pas testée
`apps/bell/src/rebase-crosscheck.ts:427` (`onPage` écrit `budget.json` par page).
Mutant : **suppression de la ligne 427** (garder l'écriture finale `:432`) ⇒ **SURVIT 23/23**. La ligne 427 est une
défense contre un **crash dur** en cours de scan (le compteur cumulatif serait alors figé à l'écriture-page précédente) ;
aucun test ne l'exerce (le chemin `budget_exhausted` écrit de toute façon à `:432`). Gap borné (une invocation de sous-
compte, requiert un kill de process entre `onPage` et l'écriture finale).
- **Correction minimale** : un test qui, après une page persistée puis une interruption simulée AVANT `:432`, prouve que
  `budget.json` reflète la dernière page (compteur non figé). `error_origin` : worker -b3d-a (oracle).

### Note d'hygiène doc (non bloquant, hors périmètre d'édition du pli)
`docs/RESSOURCES-HELIUS-2026-09-19.md:30` liste encore « coût en crédits par appel `full` » en **NON TROUVÉ**, ce qui
**contredit** la mesure `:12` (« coût par appel MESURÉ … 10 crédits/appel exactement, quel que soit `limit`, jusqu'à
1 000 tx ») et la décision 55 (`docs/CHANTIERS.md`, « corps via getTransactionsForAddress full … 10 crédits/1 000 tx »).
La mesure `:12` + décision 55 font foi (majorant valide, cf. point 1) ; la ligne `:30` est **périmée**. Renvoi orchestrateur
(le G0 §Comparateur / H1-H2 divergent aussi du code, item déjà formé au PLI G2 « Renvoi G0 »).

---

## Tableau des mutants (restauration **byte-exacte** `cp` depuis pristine, **jamais `git checkout`** ; sha ré-vérifié)
Sandbox `F:\tmp\bellb3d\g2d\wt`, baseline **23/23** (`apps/bell/test/rebase-crosscheck.test.ts`).
Sha pristine == sandbox == worktree : `collect.ts` `493b6916…`, `rebase-crosscheck.ts` `84c0f4ee…` (prouvé avant/après la
campagne). Killer = suite complète du fichier (baseline 23) ; RED = ≥ 1 fail.

| # | Défaut | Cible (fichier:ligne) | Mutation | **Résultat** |
|---|---|---|---|---|
| 1 | C-G2-1 | rebase-crosscheck.ts:57 | `WORST_CASE = CREDITS_PER_GTFA` → `CREDITS_PER_GET_TX` | **RED (21/2)** |
| 2 | C-G2-2 **A** | rebase-crosscheck.ts:352 | `if (!setsEqual) return divergence` → `if (false)` | **RED (22/1)** |
| 3 | C-G2-2 **B** | rebase-crosscheck.ts:345 | `if (!h5Ok) {` → `if (false) {` (**risque faux `equal`**) | **RED (20/3)** |
| 4 | C-G2-3 | rebase-crosscheck.ts:434 | `?? 0) * CREDITS_PER_GTFA` → `* 1` | **RED (22/1)** |
| 5 | C-G2-4 | rebase-crosscheck.ts:99 | `pid === TOKEN_2022_PROGRAM &&` → `true &&` | **RED (22/1)** |
| 6 | C-G2-5 | rebase-crosscheck.ts:67 | `presence === 1` → `presence >= 1` | **RED (22/1)** |
| 7 | C-G2-6 | rebase-crosscheck.ts:67 | `data.length === 35` → `data.length >= 35` | **RED (22/1)** |
| 8 | C-G2-7 **α** | rebase-crosscheck.ts:303 | `instructionIndex` REMIS dans `eventKey` | **RED (22/1)** |
| 9 | C-G2-7 **β** | rebase-crosscheck.ts:310 | `["instructionIndex","blockTimeSec"]` → `["blockTimeSec"]` | **RED (22/1)** |
| 10 | C-G2-7 **coll.** | rebase-crosscheck.ts:333 | garde de collision `if (…) return` → `if (false)` | **RED (22/1)** |
| 11 | **NEUF-i** (crédit) | collect.ts:303 | `(n + 1) *` → `(n) *` (off-by-one, 151ᵉ appel permis) | **RED (22/1)** |
| 12 | **NEUF-ii** (crédit) | collect.ts:303 | `> maxCredits` → `>= maxCredits` (sur-strict, borne à 149) | **RED (21/2)** |
| 13 | **NEUF-iii** (crédit) | collect.ts:313 | `credits: () => n * WORST_CASE` → `() => n` | **RED (22/1)** |
| S | (survivant, C-G2D-4) | rebase-crosscheck.ts:427 | suppression de l'écriture `budget.json` par page | **SURVIT (23/0)** |

**Bilan : 13/13 mutants ciblés ROUGES** (dont 3× C-G2-7 et 2× C-G2-2, + 3 neufs sur le crédit) ; 1 survivant documenté
(C-G2D-4, non bloquant). Restauration byte-exacte finale confirmée (sha == pristine).

**Attribution des tueurs (lignes multi-fail, capturée par nom de test)** : ligne 2 (C-G2-2A) ⇒
`bell_crosscheck_c3_mismatch_with_set_divergence_is_divergence` (1 fail) ; ligne 3 (C-G2-2B, 3 fails) ⇒ dont
`bell_crosscheck_c3_mismatch_sets_equal_declares_blocktime` / `bell_crosscheck_incomplete_keeps_pending` (faux `equal`) ;
ligne 12 (NEUF-ii, 2 fails) ⇒ `bell_crosscheck_budget_credits_cap_is_explicit` **ET**
`bell_crosscheck_runmain_resumes_budget_and_ledger` (le ratio `--max-credits = appels×10` devient sur-strict, arrêt un
appel trop tôt) ; ligne 1 (C-G2-1, 2 fails) ⇒ `…_budget_credits_cap_is_explicit` + `…_runmain_resumes_budget_and_ledger`
(assert `credits_worst_case=60`).

## Oracles (un à un ; PAS `npm run ci`) — tous VERTS
| Oracle | Résultat |
|---|---|
| `apps/bell/test/rebase-crosscheck.test.ts` | **23/23** |
| `apps/bell/test/collect.test.ts` (porte `PINNED_BELL_SHA`) | **34/34** |
| `apps/bell/test/rebase-course.test.ts` | **2/2** |
| `apps/bell/test/rebase-produce.test.ts` | **3/3** |
| `apps/bell/test/rebase-scan.test.ts` | **8/8** |
| `test/ci-gates.test.ts` | **27/27** |
| `test/no-secret-in-repo.test.ts` | **1/1** |
| `typecheck` (`tsc --noEmit`) | **exit 0** |
| `eslint` (3 fichiers touchés : collect.ts, rebase-crosscheck.ts, rebase-crosscheck.test.ts) | **exit 0** |
| `lint:ratchet` | **69/69** (plafond inchangé) |
| `gate:vocab` | **OK** (177 fichiers, 0 claim interdit) |
| `lang:gate` | **0 hit** (bell GATED) |
| `export:check` | **0 chemin interdit, 0 hit FR** (bell GATED) |

## R-25, PINNED, anti-close, CA-11, « built »
- **R-25 = 943 insertions(+), 20 deletions(-)** sous le pathspec `STAT=` exact de `.github/workflows/ci.yml:65`
  (trois-points `f654151...eb54baa`). **Annonce 943 conforme** ; `ins+del = 963 < 1205` (VIBEGATES_PR_LIMIT, ci.yml:43)
  et **< 1 100** (borne auto-imposée du seam -b3d-b). 5 fichiers : `collect.ts`(+43-), `rebase-crosscheck.ts`(+445),
  `rebase-produce.ts`, `rebase-scan.ts`, `rebase-crosscheck.test.ts`(+434) ; `docs/**/*.md` (PLI) exclu par le pathspec.
- **`PINNED_BELL_SHA` inchangé** : `apps/bell/test/collect.test.ts` (où il vit, `:79` = `0cfbed20fc7ab…`) **hors du delta**
  (`git diff a6b86bd..eb54baa -- …/collect.test.ts` **vide**) ⇒ inchangé par définition ; `collect.test.ts` **34/34 vert**
  (le digest est reproduit, pas seulement inaltéré).
- **Anti-close / synthétique** : le delta n'ajoute que des fixtures synthétiques (`MintZZ…`, `0xaa/0xbb`, sigs/slots
  inventés) ; le rejeu sonde→tirage utilise des corps 100 % synthétiques. `no_secret_in_repo` vert.
- **CA-11 / « built »** : le delta touche 4 fichiers (2 src, 1 test, 1 doc) ; aucun n'est un registre/README/`fleet.ts`
  ⇒ **rien de nouveau « built »** ; `fleet.ts` sans `bell`, Bell reste `upcoming`. `bell_crosscheck_runmain_resumes_budget_and_ledger`
  exécute la composition réelle depuis fichiers (CA-11 durci) — vert.

---

## Réponses argumentées

### Point 1 — le plafond CRÉDITS est-il réellement fail-closed et non contournable ?
**OUI, l'invariant de plafond est prouvé et sain**, sous deux conditions vérifiées (majorant + `--max-credits` requis).

**(a) `--max-credits` obligatoire.** `collect.ts:444-445` : `--rebase-crosscheck` **throw** sans `--max-credits`
(test `bell_crosscheck_requires_max_credits` vert ; omission ⇒ fail-closed). Les autres branches gardent `Infinity`.

**(b) Invariant fail-closed.** Garde `collect.ts:301-303` : `if ((n+1)·WCPC > maxCredits) throw; n += 1`. Donc après
tout incrément, `n·WCPC ≤ maxCredits` ⇒ **crédits pire cas = `n·10 ≤ maxCredits` à tout instant**, quel que soit
`--max-calls`. `--max-credits` est un **plafond dur dans l'unité du plafond 6,5 M**. Mutants NEUF-i (off-by-one) et
NEUF-ii (`>`→`>=`) **RED** : l'arithmétique de bord est pinée.

**(c) Méthodes appelées & majorant 10 cr.** Le crosscheck n'appelle QUE (grep `rebase-crosscheck.ts`) :
`getTransactionsForAddress` (gTfA, Helius, pages asc + ancre desc, `:210,:255`) et `getTransaction` (Chainstack `otherOp`,
`:233`). **Aucun** `tick`/databento/polygon dans ce chemin. Barème documenté au dépôt :
`docs/RESSOURCES-HELIUS-2026-09-19.md:12` (gTfA **10 cr/appel MESURÉ dashboard, quel que soit `limit`, ≤ 1000 tx** ;
`getTransaction` **1 cr**) + décision 55 (`docs/CHANTIERS.md`, « corps via gTfA full … 10 crédits/1000 tx »). Les deux
méthodes appelées ≤ **10 cr** ⇒ **10 cr est un MAJORANT exact pour gTfA et strict pour getTransaction**. Les méthodes plus
chères (gestion webhook 100/req, getProgramAccounts/archival/DAS 10, `RESSOURCES:7`) **ne sont pas atteignables** dans le
chemin crosscheck. getTransaction Chainstack est compté à 10 cr Helius (sur-conservateur : sur-compte le budget Helius,
jamais l'inverse ; peut au pire provoquer un `budget_exhausted` prématuré = complétude, jamais une surdépense).
La ligne `RESSOURCES:30` « `full` NON TROUVÉ » est **périmée** (cf. note d'hygiène) — ne remet pas en cause le majorant.

**(d) Persistance & reprise.** `budget.json = {calls_used, credits_worst_case = calls_used·10}` (`:427,:432`). Reprise :
absent ⇒ 0 (**reset fail-open si un ledger existe — C-G2D-2**) ; corrompu ⇒ throw ; **édité à la baisse ⇒ accepté**
(C-G2D-2). Ce sont des comportements C-1 pré-existants (hors delta) ; à durcir avant le tirage (item formé).

**(e) Compteur partagé sonde↔tirage — REJOUÉ.** Fixtures synthétiques, `--out` partagé, flags §7 exacts
(`F:\tmp\bellb3d\g2d\replay`) : après SONDE `budget.json.calls_used = 2` ; après TIRAGE (même `--out`) `calls_used = 5`
(**cumulatif : `readPriorCalls` offset le tirage des appels de sonde**). `credits_worst_case = calls_used·10` persisté.
⇒ le plafond 6,5 M **borne sonde + tirage CONJOINTEMENT** dans l'unité crédit, machine-vérifié. (L'audit §5, `--out`
distinct, reste une réservation humaine de 1 000 cr non machine-liée — déclaré Amend. 1, à porter avec `--max-credits 1000`.)

**(f) Arithmétique & cohérence appels/crédits.** `1 500 + 1 000 + 6 497 500 = 6 500 000` ✓ ;
`6 497 500 = ⌊(6 500 000 − 1 500 − 1 000)/10⌋ × 10 = 649 750 × 10` ✓. `--max-calls 649750` et `--max-credits 6497500`
**mordent SIMULTANÉMENT** (`6 497 500/10 = 649 750` ; garde crédit `(n+1)·10 > 6 497 500 ⟺ n ≥ 649 750 ⟺ n ≥ maxCalls`).
**Voulu** : `--max-credits` est le plafond autoritatif dans l'unité du plafond ; `--max-calls` est réglé cohérent. Si
l'opérateur les désaligne, **le plus serré mord** (fail-closed) — c'est la protection contre la confusion d'unité
(écrire 1 500 en pensant crédits ⇒ 150 appels ; test `bell_crosscheck_budget_credits_cap_is_explicit` : `--max-calls
100000 --max-credits 1500` ⇒ arrêt à 150). Comme le compteur sonde (150) EST inclus dans les 649 750 du tirage (compteur
partagé), la dépense pire cas réelle sur `--out` partagé ≤ 6 497 500 cr + audit 1 000 (séparé) = **6 498 500 ≤ 6 500 000**
(marge 1 500 cr, conservateur). **Réserve** : cf. C-G2D-1 — le tirage ainsi paramétré s'arrête à 3 pages faute de
`--max-pages`, donc le plafond crédit est sain MAIS le tirage est inexécutable tel qu'écrit.

### Point 2 — pré-enregistrement §2 : sha byte-identique ? amendement légitime ou ajustement déguisé ?
**Sha §2 byte-identique — REPRODUIT.** Extraction `## 2.` → ligne avant le `---` suivant (méthode `awk '/^## 2\./{f=1}
f&&/^---/{exit} f'`) : sha256 = **`7071484f3444abe6c09b694f730ad2fcce2f00ea8c12e8cc39fc31806a3c7867`** à `cb25d60`
(pré-enregistrement committé SEUL) **ET** à `eb54baa` — **identique entre eux et égal au digest pré-enregistré cité dans
l'Amendement 1**. §2 (H1..H6) est **gelé byte-pour-byte**.

**Légitimité — AMENDEMENT LÉGITIME, pas un ajustement d'hypothèse déguisé**, avec réserves à faire tenir au checkpoint-2 :
- **Daté & ordonné** : Amendement daté 2026-09-20 21:16 UTC ; timeline `git`: prereg `cb25d60` 20:29 UTC → G1 `87cc4d5`
  → **G2 initiale `a6b86bd` 20:55 UTC** → fold `eb54baa` committé 21:42 UTC. L'amendement est postérieur à la G2 qui le
  motive et antérieur à son propre commit. Cohérent.
- **Motivé par un défaut de revue** : C-G2-1 (unité crédit), C-G2-2 (c3_mismatch muet), C-G2-7 (convention d'index) —
  tous des défauts G2, jamais des données.
- **Antérieur à tout appel réseau — CORROBORÉ, pas PROUVÉ** : (a) aucun artefact de tirage sur disque (`F:/tmp/bell-b3d-run`
  et `…-sonde` **absents**, `ls` lecture seule) ; (b) sous-lot -b3d-a offline par construction ; (c) `RESSOURCES-HELIUS:12`
  consigne `2 623 / 10 M` consommés AVANT la course -b3a. Aucune de ces preuves n'observe le dashboard Helius POSTÉRIEUR à
  `eb54baa` ⇒ la légitimité de l'amendement est **contingente** à cette lecture. **Non bloquant pour l'offline** (mon
  verdict tient), mais à énoncer comme contingence, pas comme vérifié.
- **Sans connaissance des données du tirage** : la relaxation DEV-1 est justifiée par une mesure sur la **série de
  référence committée** (l'hybride, publique), PAS sur les corps du tirage (inexistants). Ce n'est pas un « peeking » du
  résultat.
- **Réserve honnête** : l'amendement **affaiblit bien** la falsification de H1 (clé sans `instructionIndex`) et re-route
  le motif H5. C'est acceptable **parce que** l'affaiblissement est couvert par des résidus fail-closed (garde de
  collision + H5-avant-`equal`, cf. point 3) et mesuré sûr (32/32). Le texte §2 gelé + le renvoi explicite « un lecteur de
  §2 est renvoyé ici » rendent la supersession auditable, jamais silencieuse.

**Ce que le checkpoint-2 DOIT exiger** : (1) recomputer le sha §2 et vérifier `== 7071484f…` (reproductible ci-dessus) ;
(2) **lire le delta Helius Usage (gTfA) entre la fin de la course -b3a et maintenant et confirmer qu'il est ZÉRO** —
c'est la SEULE preuve indépendante qu'aucun tirage n'a eu lieu ; l'absence d'artefacts locaux ne suffit pas ; (3) re-mesurer l'unicité 32/32
(point 3) ; (4) **adjuger DÉV-1** comme déviation formelle (la clé relâchée supersède G0 H1/H2 + G0 §Comparateur ; le
renvoi G0 est un item orchestrateur, déjà déclaré au PLI G2) ; (5) **exiger la sonde point (g)** (convention d'index
recoupée sur ≥ 1 événement connu/mint AVANT le tirage, sinon STOP) ; (6) **règle C-G2D-3** (`equal` ⇒ `fieldDiffs ⊆
{instructionIndex}`) ; (7) **corriger C-G2D-1** (`--max-pages` au tirage) en amendement laissant §2 gelé.

### Point 3 — DÉV-1 (clé relâchée) : un scénario de FAUX `equal` ou de masquage ?
**Aucun faux `equal` trouvé ; aucun handoff/événement réel masqué.** Trois lignes de défense, toutes vérifiées :

**(i) Garde de collision (les deux côtés).** `rebase-crosscheck.ts:333` : si la clé relâchée regroupe 2 événements
distincts sur l'un OU l'autre côté (`full.length !== fullByKey.size || hyb.length !== hybByKey.size`) ⇒
`inconclusive:relaxed_key_collision` (fail-closed). ⇒ « événement dupliqué d'un côté » ⇒ jamais un faux `equal` (mutant
suppression de la garde **RED**).

**(ii) H5-avant-`equal`, sensible à l'ordre d'index ET au blockTime.** `equal` (`:357`) n'est atteint qu'après le bloc
`if (!h5Ok)` (`:345`), donc `h5Ok=true`. Or `replayTriplet` → `tripletUpTo` (`rebase-trajectory.ts:100`) **trie par
`(slot, instructionIndex)`** puis plie sur `blockTimeSec` (`:103,:108`). Donc :
- « ré-ordonnancement intra-tx » : si la convention d'index du full-mint échange l'ordre relatif d'une paire même-slot,
  le pliage change (le dernier update appliqué porte `newBits/effTs`) ⇒ **H5 échoue ⇒ sous-cas B `c3_mismatch_sets_equal`,
  jamais un faux `equal`** (mutant bypass-H5 **RED, 3 fails**). Si le pliage ne change pas, le rejeu est identique ⇒
  `equal` correct. **Argument étanche** : les paires même-slot sont **le même tx** (mesuré : `sigDiffer=false`, ix 2/3) ⇒
  elles **partagent `blockTimeSec`** ⇒ à tout `t` le pliage les inclut TOUTES ou AUCUNE (résolution blockTime = la
  résolution de Bell) ; un échange de deux événements de clés distinctes du même tx change **toujours `newBits`** (les bits
  diffèrent par mesure — `effTs` et `mulBits` peuvent aussi changer) SAUF si un événement ultérieur du même tx écrase les
  deux — auquel cas le résultat est identique et `equal` est correct.
- « deux événements même sig, même kind, mêmes bits, même effTs » : même clé relâchée ⇒ soit collision même-côté (i), soit
  appariement croisé (sémantiquement le même update à l'index près, la relaxation visée). `blockTimeSec` hors clé mais
  dans le pliage ⇒ un écart de blockTime concordant-en-set est attrapé par H5 (sous-cas B ; test
  `bell_crosscheck_c3_mismatch_sets_equal_declares_blocktime`).

**(iii) Handoffs indépendants du comparateur.** `setAuthorityHandoffsFromTx` publie les handoffs dans `scan.handoffs` →
artefact/report, **hors** de la clé et du verdict. La relaxation ne peut donc **pas masquer un handoff**.

**Unicité 32/32 — RE-MESURÉE moi-même** (`F:\tmp\bellb3d\g2d\uniq.mjs` sur `…/series/rebase/rebase-*.json`) : clé
`${slot}|${sig}|${kind}|${bits}|${effTs}`, ensemble borné `slot ≤ oracle_slot` : SPYx 9/9, AAPLx 11/11, NVDAx 11/11,
TSLAx 1/1 = **32/32 clés distinctes** (`9+11+11+1`, claim confirmé). Toutes les paires même-slot (4+5+5+0 = 14) sont
**même-tx** (même `sig`) et **diffèrent en bits ET en effTs** ⇒ clés distinctes sans `instructionIndex`. Tous les
événements sont `≤ oracle_slot` (l'ensemble que le comparateur compare). ⇒ la relaxation **n'introduit aucun faux
`equal`** sur les séries committées ; un doublon de clé au tirage réel serait attrapé par (i). Mutants C-G2-7 α (index
remis ⇒ fausse `divergence`), β (index retiré de `fieldDiffs` ⇒ masqué) et coll. (garde retirée ⇒ faux `equal`) tous
**RED** — la déviation est correctement gardée ET diagnostiquée.

---

### Point 4 — C-G2-2 : `divergence` (A) / `inconclusive` motivé (B) ; `pending` jamais retiré hors `equal` ; jamais `equal` sans H5
Vérifié par inspection + mutants + tests :
- **Sous-cas A** (ensembles clé-différents ET H5 échoue) ⇒ `divergence` + `missing*` + `tripletDiff` (`:352`) — test
  `bell_crosscheck_c3_mismatch_with_set_divergence_is_divergence` ; mutant `if(!setsEqual)`→`if(false)` **RED**.
- **Sous-cas B** (ensembles clé-égaux, H5 échoue) ⇒ `inconclusive:c3_mismatch_sets_equal` + `tripletDiff` + écart
  `blockTime` en `fieldDiffs` (`:355`) — test `…_sets_equal_declares_blocktime` + `…_incomplete_keeps_pending` ; jamais muet.
- **`equal` = seul retrait de `pending`** : unique `return { verdict: "equal" }` (`:357`), gardé par `setsEqual` APRÈS le
  bloc `!h5Ok` (donc `h5Ok=true`) ET `scan.complete` (`:325`). **Aucun `equal` sans H5** (mutant bypass-H5 **RED**).
- **Aucun chemin ne retire `pending` hors `equal`** : `inconclusive` (`:325,:333,:355`) et `divergence` (`:352,:358`)
  renvoient tous un verdict ≠ `equal` ⇒ `pending` conservé. (Réserve C-G2D-3 : `equal` devrait aussi exiger
  `fieldDiffs ⊆ {instructionIndex}`.)

---
### Provenance
Revue par relecteur **G2 DELTA** `claude-opus-4-8[1m]` effort max, contexte frais (n'a écrit ni le G1, ni le pli, ni la
G2 initiale), 2026-09-20, worktree `F:\Monark-wt-bellb3d` @ `eb54baa`. Delta `a6b86bd..eb54baa`. Sandbox mutants
`F:\tmp\bellb3d\g2d\wt` (pristine + sha `F:\tmp\bellb3d\g2d\pristine`), rejeu sonde→tirage `F:\tmp\bellb3d\g2d\replay`,
unicité `F:\tmp\bellb3d\g2d\uniq.mjs`. Aucun réseau, aucun secret, aucune écriture dans le worktree (sha sources ==
worktree), rien sur C: (TEMP/TMP=F:\tmp), aucun commit (R-20). Sortie vérifiable adversarialement (R-21).
