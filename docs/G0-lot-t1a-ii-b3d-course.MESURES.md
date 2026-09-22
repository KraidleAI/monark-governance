# MESURES — Bell course (temps 2, décision 117) — traçabilité R-21

**Worker Opus 4.8 — modèle résolu (R-1) : `claude-opus-4-8[1m]`.** Base : `F:\Monark` `lot/etude-suite` HEAD `c0515d8` (≥ `b38a399`).
Lecture seule ; écritures uniquement sous `F:\tmp\bell-course\` ; aucun réseau ; aucun secret lu ; rien sur `C:`.
Toutes les commandes sont rejouables depuis `F:/Monark`. `[mesuré]` = sortie observée par ce worker ; `[2nd]` = valeur lue dans un doc.

## M0 — base
```
git -C F:/Monark rev-parse HEAD                -> c0515d87aa895ba6633841c3e505e380b5be490d
git -C F:/Monark branch --show-current         -> lot/etude-suite
git -C F:/Monark status --short                -> (vide, propre)
```

## Deliverable (A) — Amendement 3 déjà committé seul

### M-A1 — commit 6c9fdaa : ancêtre de HEAD, committé SEUL
```
git -C F:/Monark merge-base --is-ancestor 6c9fdaa c0515d8   -> vrai (ancêtre)
git -C F:/Monark show --stat 6c9fdaa
  6c9fdaa2430efd9e974abe97beb2f732b5e2fcfd  Kraidle  2026-09-21 13:23:40 +0100 (=12:23:40 UTC)
  "PLI b3d: AMENDMENT 3 pre-registered and committed ALONE ... section 2 byte-identical sha 7071484f; before any density probe, after b1a and b1b merges"
  docs/PLI-lot-t1a-ii-b3d.md | 26 ++++++++++++++++++++++++++
  1 file changed, 26 insertions(+)
git -C F:/Monark show --name-only --format="" 6c9fdaa       -> docs/PLI-lot-t1a-ii-b3d.md   (SEUL fichier)
```
=> committé SEUL, docs isolé, 1 fichier +26/-0. Conforme Amendement 3 (6).

### M-A2 — §2 (H1..H6) byte-identique à HEAD
```
cd F:/Monark && awk '/^## 2\./{f=1} f&&/^---/{exit} f' docs/PLI-lot-t1a-ii-b3d.md | sha256sum
  -> 7071484f3444abe6c09b694f730ad2fcce2f00ea8c12e8cc39fc31806a3c7867
```
= la revendication du commit et de l'en-tête PLI. Inchangé.

### M-A3 — texte committé = texte (4) CORRIGÉ (verbatim, byte-identique)
```
cd F:/Monark
awk '/^> \*\*Amendement 3 — sous-plafonds cumulatifs par mint/{f=1} f{print} /^> \*\*\(6\) Committé SEUL avant la sonde/{if(f)exit}' docs/G0-lot-t1a-ii-b3d-b.md   -> 19 lignes
awk '(...idem...)' docs/PLI-lot-t1a-ii-b3d.md                                                                                                                      -> 19 lignes
diff (bloc G0-b) (bloc PLI)   -> AUCUNE différence ("IDENTICAL")
sha256 des deux blocs         -> 2a12f19c0df6b0eb994c7d94263e66f500e910ff5321b76d8c6c0604c004a879 (identique)
grep -c "lastSlot_j" docs/PLI-lot-t1a-ii-b3d.md   -> 1   (formule de PAGE corrigée présente)
```
Le paragraphe (4) du PLI porte `d_j = tx_j/(lastSlot_j − firstSlot_j)`, la formule de grille `tx_j/(slot_{j+1}−slot_j)` REJETÉE,
écart 1 575 vs 157,5. La correction source = commit `f4b0d9c` (`git show f4b0d9c`, `docs/G0-lot-t1a-ii-b3d-b.md:203`).

### M-A4 — séquence (6) prouvée dans le DAG (pas déduite des horloges)
```
git -C F:/Monark merge-base --is-ancestor 2c717f8 6c9fdaa   -> vrai (b1a avant Amend.3)
git -C F:/Monark merge-base --is-ancestor f459cc2 6c9fdaa   -> vrai (b1b avant Amend.3)
git -C F:/Monark merge-base --is-ancestor f4b0d9c 6c9fdaa   -> vrai (correction avant Amend.3)
dates auteur :
  2c717f8 b1a merge        2026-09-21 07:51:02 +0100
  f4b0d9c correction (4)   2026-09-21 09:22:54 +0100
  f459cc2 b1b merge        2026-09-21 13:22:15 +0100
  6c9fdaa Amendement 3     2026-09-21 13:23:40 +0100   (+85 s après b1b)
  ad578e7 -f docs          2026-09-21 17:04:31 +0100
  1fc89a9 -f merge         2026-09-21 17:04:54 +0100
```
=> « b1a → b1b → Amendement 3 committé seul → (avant sonde) » tenue. Étiquette « 12:4x/12:5x UTC (horloge) » = +01:00 (précédent C-V-5).

### M-A5 — b1a/b1b/(f) ancêtres de HEAD
```
git -C F:/Monark merge-base --is-ancestor 2c717f8 c0515d8   -> vrai (b1a)
git -C F:/Monark merge-base --is-ancestor f459cc2 c0515d8   -> vrai (b1b)
git -C F:/Monark merge-base --is-ancestor 1fc89a9 c0515d8   -> vrai ((f))
```

### M-A6 — tests qui épinglent l'Amendement 3 (K=8, fencepost, GTFA_PAGE_LIMIT)
Source `apps/bell/src/rebase-crosscheck.ts` : `GTFA_PAGE_LIMIT = 1000` (`:64`) ; `DENSITY_POINTS = 8` (`:449`, commentaire
`:447` « 1 + DENSITY_POINTS = 9 gTfA/mint ⇒ ≤ 36 pour 4 mints ») ; fencepost `:454` (« sparse-tail fencepost, declared »),
`:756` `span = tx>0 ? max(slots)−min(slots) : 0` ; densité `:497` `trapezoidIntegral(...).projected / GTFA_PAGE_LIMIT`.
Tests `apps/bell/test/rebase-crosscheck.test.ts` :
- `bell_density_projects_N_with_interval` `:1176` (assert `r.points.length == DENSITY_POINTS`, « K=8 uniform sample points »)
- `bell_density_report_points_feed_projection` `:1245` (C-V-1 ; `proj == r.n_projected/GTFA_PAGE_LIMIT` et `== 1.575`)
- `bell_h6_projection_pure_function` `:1275` ; `bell_h6_projection_rejects_max_times_span` `:1289`
- `bell_density_writes_budget_never_ledger` `:1198` (`require_full_pages:true, pages:0`)
- `bell_density_requires_max_credits` `:1216` ; `bell_density_feeds_global_calls_by_method` `:1226`
- `bell_density_by_mint_survives_budget_exhaustion` `:1262` (C-V-3)
Statut : verts à l'oracle b1b (`docs/G7-lot-t1a-ii-b3d-b1b.md` : 696 pass/1 skip, eslint 0, ratchet 69/69) [2nd].

### M-A7 — ordre daté des amendements du PLI (prouvé par SHA) [mesuré]
```
git -C F:/Monark log --oneline -- docs/PLI-lot-t1a-ii-b3d.md
  cb25d60 PRE-REGISTRATION (H1..H6)            2026-09-20
  eb54baa Amendement 1 (--max-credits)          2026-09-21 (G2 fold -a)
  0dd13ca Amendement 2 (--max-pages)            2026-09-21 00:03
  [Amendement de format n°1 = pli b1a]
  6c9fdaa Amendement 3 (committé SEUL)          2026-09-21 13:23
  ad578e7 Amendement de format n°2              2026-09-21 17:04  (POSTÉRIEUR à Amend.3 ; G7-f:9)
  1fc89a9 Merge -f (format n°2)                 2026-09-21 17:04
```

## Deliverable (B) — G0 de course

### M-B0 — a1-bis (G-5) fusionné [mesuré]
```
ls docs/G7-lot-t1a-iii-a1-bis.md                              -> existe
git -C F:/Monark merge-base --is-ancestor 780a631 c0515d8    -> vrai (merge a1-bis, ancêtre)
git -C F:/Monark merge-base --is-ancestor dac433a c0515d8    -> vrai (G7 a1-bis dac433a, 2026-09-21 17:23 +0100)
  dac433a "G7 Bell -iii-a1-bis ACCEPTED (merge 780a631 + interaction fix 138df67): merged-tree oracle green 720/0, R-25 721"
```

### M-B1 — décisions 112/113/114 (`docs/CHANTIERS.md:477-480`) [2nd]
- **112** plafond de cycle Helius `CYCLE_CAP = 8 000 000` cr (80 % du plan 10 M) ; floor épinglé au dashboard avant chaque course (aujourd'hui 60 938).
- **113** rapprochement : borne dure `Δdashboard ≤ ledger_run` (sinon incident) + bande souple `ledger_run − Δdashboard ≤ max(50 cr, 0,5 % du run)`.
- **114** ledger de cycle dans `F:\monark-ledger\` (créé ; `HELIUS_LEDGER_DIR` posé hors dépôt).
- **119** (`docs/CHANTIERS.md:559-562`) : GO durable portée fermée ; **HORS portée** = course Bell (~5,4 M cr) + C-F-4 (go propre le moment venu).
- **84** phase B univers 50 000 cr, ledger dédié [2nd, `docs/G0-lot-t1a-ii-b3d-b.md:241`].
- **67** contre-vérification full-mint « toute divergence = STOP » [2nd, `docs/CHANTIERS.md:179`].

### M-B2 — barème Helius (FAITS première main) [2nd depuis FAITS `.../FAITS-tarification-helius-2026-09-21.md`]
gTfA (`getTransactionsForAddress`, archival) = **10 cr**, 1 000 tx/appel ; `getTransaction`/`getSignaturesForAddress`/`getAccountInfo` = **1 cr** ;
`getProgramAccounts` = 10 cr ; autoscaling **Off** ⇒ aucun dépassement facturable ; cap 8 M = garde interne (112).

### M-B3 — recompute du plafond (débit -b3a-2 × 465 j ⇒ ⌈N/1000⌉×10) [mesuré]
Entrées débit [2nd `docs/PLI-lot-t1a-ii-b3a.md:169-175`] : TSLAx 54 670/j, AAPLx 110 427/j, NVDAx 359 082/j, SPYx 635 832/j ; âge ~465 j.
```
TSLAx  N=25 421 550  pages=25 422   cr=254 220
AAPLx  N=51 348 555  pages=51 349   cr=513 490
NVDAx  N=166 973 130 pages=166 974  cr=1 669 740
SPYx   N=295 661 880 pages=295 662  cr=2 956 620
Σ corps full-mint = 5 394 070 cr    (enshrined PLI-b3a/Amend.3(3) = 5 394 670 ; Δ = 600, arrondi de ~465 j)
SPYx cumulative --max-credits = 1 500 + 5 394 670 = 5 396 170
cumul cycle pire-cas = floor 60 938 + sonde ~480 + phaseB 50 000 + corps 5 394 070 + audit ~1 000 = ~5 506 488
headroom sous 8 M au-dessus du floor = 8 000 000 − 60 938 = 7 939 062
marge du cumul pire-cas sous 8 M = ~2 493 512
bande souple 113 pour ce run = max(50 ; 0,5 % × 5 394 670) = 26 973 cr
étalonnage sonde (d) : 36 gTfA × 10 = 360 cr attendus au Δdashboard
```
Échelle des trois plafonds : **5 396 170** (sous-plafonds, fail-closed) < **6 500 000** (STOP H6, §2 gelé) < **8 000 000** (cycle, 112).

### M-B4 — plafond de cycle STALE dans G0-b [lu]
`docs/G0-lot-t1a-ii-b3d-b.md:236` « cumul pire cas ≈ 7 610 938 / **10 M** » et `:243` routage C-4 « cumul cycle **> 10 M** … arrêt à 10 M » :
antérieurs à la décision 112 (8 M). Correction proposée : note datée renvoyant à 112 (cf. DRAFT §3.3).

### M-B5 — C-F-4 (ancrage externe par page) [lu + mesuré]
Résidu : `verifyLedgerChain`/`resumeFromLedger` n'ancre `headSha` à aucune valeur externe ⇒ record entièrement reforgé accepté,
dès le 1ᵉʳ record (`docs/G2-lot-t1a-ii-b3d-f.md:85`, `docs/PLI-lot-t1a-ii-b3d.md:437-438`, `docs/G0-lot-t1a-ii-b3d-f.md:52`).
Volume « par page » = Σ sous-plafonds / 10 = 5 394 070 / 10 ≈ **539 407 pages** (SPYx ~295 662) [mesuré] ⇒ ligne-par-page infaisable.
Base R-25 option B [mesuré, grep] : `onPage` `rebase-crosscheck.ts:668-674`, `resumeFromLedger` `:580-592`, audit `runRebaseCrosscheckCli:633-713`.
Estimation option B ≈ **70-120 ins+del [à mesurer au G1]** ; borne comparable = R-25 **255** du lot -f [2nd `docs/G7-lot-t1a-ii-b3d-f.md:6`]. Option A = **0**.

### M-B6 — C-G2-3 (`require_full_pages` prior non lu) [lu]
`runDensityProbeCli` écrit `require_full_pages` (`rebase-crosscheck.ts:721,727`) sans lire le prior (contraste
`runRebaseCrosscheckCli:643-644` qui throw fail-closed). Porteur nommé « lot -f ou b1a-bis » (`docs/G7-lot-t1a-ii-b3d-b1b.md:20`)
— -f clos sans le porter. Options : (a) 1b-ii + test (~25-40 R-25) ; (b) gate procédural `--out` frais (R-25 = 0).

### M-B7 — 1b-ii réécrit la voie budgétaire [lu `docs/G0-lot-garde-helius-1b.md`]
`:111` suppr. `makeBudgetedCall`/`callsByMethod`, `budgeted.*`→client ; `:214,263` IT-3 crédits dérivés de `client.spent()`,
`callsByMethod` local supprimé ; `:187-188` `--method-caps` = 4 méthodes (gTfA BAS). ⇒ re-vérifier sous-plafonds + 8 tests
`bell_density_*`/`bell_h6_*` sur l'arbre post-1b-ii ; `--max-credits` par mint autoritaire vs `--method-caps` du garde. `fichier:ligne` [à ré-ancrer au G1].

## Fichiers produits (sous F:\tmp\bell-course\)
- `AMENDEMENT-3-texte-a-committer.md` — (A) : déjà committé seul `6c9fdaa`, STOP.
- `G0-lot-t1a-ii-b3d-course.DRAFT.md` — (B) : brouillon du G0 de course.
- `MESURES.md` — ce fichier.
# MESURES — Bell course, PLI sur décisions 123/124/125 (APPEND à `docs/G0-lot-t1a-ii-b3d-course.MESURES.md`)

> **Bloc d'APPEND** (worker `claude-opus-4-8[1m]`, effort max). À concaténer par l'orchestrateur à la suite de `docs/G0-lot-t1a-ii-b3d-course.MESURES.md`.
> Base `F:\Monark` `lot/etude-suite` HEAD `7801083` (≥ `cabd3d5`). Lecture seule ; écritures uniquement sous `F:\tmp\bell-course\` ;
> aucun réseau ; aucun secret lu (A-7 : aucune variable d'environnement affichée) ; rien sur `C:`. `[mesuré]` = sortie observée par ce worker ; `[2nd]` = valeur lue dans un doc.

## Deliverable (C) — pli du G0 de course sur décisions 123/124/125

### M-C0 — base + horloge [mesuré]
```
git -C F:/Monark rev-parse HEAD        -> 780108371d017c11ef289657977f0fe313c7f506  (7801083)
git -C F:/Monark branch --show-current -> lot/etude-suite
git -C F:/Monark status --short        -> (vide, propre)
date -u +%Y-%m-%dT%H:%M:%SZ            -> 2026-09-22T00:53:46Z   (en-tête du PLIÉ ; récidive d'horloge CHANTIERS:616 évitée)
```

### M-C1 — décisions 123/124/125 en historique + 2b-ii fusionné + état 1b [mesuré]
```
git merge-base --is-ancestor cabd3d5 HEAD   -> vrai (125 ancêtre)
git log --oneline : cabd3d5 = Decision 125 ; 5fbe1a2 = Decision 124 ; b43a779 (+8573e4c timestamp) = Decision 123
2b-ii fusionné    : fec2848 "G7 GARDE-HELIUS-2b-ii ACCEPTED (merges ce41619, 5394dfe)"  (ancêtre de HEAD)
1b : G0 PLIÉ d6af611 ; aucun G1 de sous-lot 1b (1b-0/i/ii/iii) atterri
     git log --all | grep -iE "1b-0|1b-i|1b-ii|1b-iii" -> seulement des mentions (G0 d6af611, item 1b-0 dans 593c0c3), 0 G1 de sous-lot
```
⇒ **G-4 = EN VOL** : dépendance d'ordre « 1b après 2b-ii » LEVÉE par `fec2848` ; G1 1b-0 en vol (décision 122). N'est REMPLI qu'aux 4 sous-lots + G-4-bis vert.

### M-C2 — §2 du PLI byte-identique à HEAD (frozen, NON touché) [mesuré]
```
awk '/^## 2\./{f=1} f&&/^---/{exit} f' docs/PLI-lot-t1a-ii-b3d.md | sha256sum
  -> 7071484f3444abe6c09b694f730ad2fcce2f00ea8c12e8cc39fc31806a3c7867   (= la valeur enshrined ; inchangé)
```

### M-C3 — G0-b:236/:243 disent bien « 10 M » (défaut stale confirmé de première main) [mesuré]
```
sed -n '236p;243p' docs/G0-lot-t1a-ii-b3d-b.md
 :236 -> "... cumul pire cas ≈ 7 610 938 / 10 M (marge ≈ 2,39 M) ..."
 :243 -> "... cumul cycle > 10 M ; ... off => arrêt système à 10 M ..."
```
⇒ item formé « correction 10 M -> 8 M (décision 112) » confirmé par décision 125 ; note datée proposée (docs seuls ; ce worker écrit sous F:\tmp).

### M-C4 — recompute du plafond + fractions cumulatives (décision 125) [mesuré]
Entrées débit [2nd `docs/PLI-lot-t1a-ii-b3a.md:169-175`] ; barème gTfA 10 cr/1000 tx [2nd FAITS].
```
TSLAx  N=25 421 550  pages=25 422   corps=254 220   part 4,71 %   (cumul 4,71 %)
AAPLx  N=51 348 555  pages=51 349   corps=513 490   part 9,52 %   (cumul 14,23 %)
NVDAx  N=166 973 130 pages=166 974  corps=1 669 740 part 30,96 %  (cumul 45,19 %)
SPYx   N=295 661 880 pages=295 662  corps=2 956 620 part 54,81 %  (cumul 100 %)
Σ corps = 5 394 070   (enshrined Amend.3(3) = 5 394 670 ; Δ = 600, arrondi)
sous-plafonds cumulatifs --max-credits (Amend.3(2)) : TSLAx 256170 / AAPLx 769170 / NVDAx 2439170 / SPYx 5396170
plafond AUTORISÉ (décision 125) = 5 396 170 (= 1 500 sonde + 5 394 670)
```
**Deux conflations à ne pas faire** (présentées, jamais « corrigées ») :
- décision 125(3) « premier point ~14 % (TSLAx) » : le 14,23 % mesuré est la frontière **TSLAx+AAPLx** (phrasé architecte), avant NVDAx (31 %)/SPYx (55 %).
- « 6 497 500 (STOP H6) » : le §2 gelé STOPpe sur **projection > 6 500 000** ; 6 497 500 = `--max-credits` par commande (Amend.1). Marge corps sous 6 497 500 (SPYx cumul) = 1 101 330 [lu PLI:390].

### M-C5 — code refs Bell ré-ancrés à HEAD 7801083 (post-2b-ii) [mesuré]
```
DENSITY_POINTS = 8                     rebase-crosscheck.ts:449   (commentaire :447-448 "1+DENSITY_POINTS=9 gTfA/mint => <=36/4 mints" ; échantillonnage :749)
GTFA_PAGE_LIMIT = 1000                 rebase-crosscheck.ts:64
runDensityProbeCli                     rebase-crosscheck.ts:715 ; écrit require_full_pages :721,:727 ; pages:0 ; NE lit PAS le prior
  (contraste runRebaseCrosscheckCli:634 -> readPriorBudget:615-622 -> throw fail-closed :643-644)  => C-G2-3 CONFIRMÉ OUVERT
--max-credits requis (throw)           collect.ts:443-444 (absent) ; :446 (>0) ; enforcement makeBudgetedCall:304 (BudgetExceededError)
projectPagesAtFraction                 rebase-crosscheck.ts:487 (span>0/fraction>0/>=2 points, fail-closed)
```
2b-ii-a a fait « minimal Bell call-site adaptation » (`ce41619`) : les lignes ci-dessus ont bougé de ≤ 1 vs le DRAFT (`:303`->`:304`). **1b-ii réécrit la voie budgétaire** ⇒ [à RE-confirmer au G1 post-1b-ii] (G-4-bis, §11 du PLIÉ).

### M-C6 — enveloppe de coût go-1 (points (a)/(b) inclus) [mesuré/dérivé]
```
K=8 : 1 + DENSITY_POINTS = 9 gTfA/mint × 4 = 36 gTfA = 360 cr (nominal)
+ (a) disponibilité : 1 page/mint = 4 gTfA = 40 cr
+ (b) reprise inter-process sur API réelle : quelques gTfA
=> enveloppe attendue ~400-600 cr ; DUR ≤ 1 500 cr (réserve sonde, Amend.3(3))
étalonnage (d) : ledger_run = Σ méthode × tarif RECOMPUTÉ du ledger de sonde (borné retries_by_method), jamais un "360 exact"
```

### M-C7 — texte de communication publique : vérif machine vocab + tiret [mesuré]
```
node F:/tmp/bell-course/vocab-check.mjs   (charge F:/Monark/vocab-banned.json : GLOBAL banned + tous scan.*.banned, drapeau i ; + classe tiret U+002D/2010-2015/2212)
  -> PATTERNS TESTED: 76  (+1 dash class)
  -> RESULT: 0 hit — CLEAN
```
Texte : `F:/tmp/bell-course/public-text.txt`. Rendu SANS tiret et SANS « verified » nu du libellé autorisé décision 124(5) (« counter-verified by a full-mint scan; chain head timestamped independently (OpenTimestamps) ») ; « independently » débloqué par l'option B. Émetteur (xStocks) NON nommé sur vitrine (F-2c C-4 ; « tokenized stock mints on Solana »).

### M-C8 — bandes souples 113 par frontière de mint (décision 125(3)) [mesuré, sous-plafonds enshrined]
```
bande_k = max(50 ; 0,5 % × ledger_run_k) ; ledger_run_k réel <= sous-plafond => 0,5 % × sous-plafond = borne haute pré-enregistrée
 TSLAx 0,5%×254 670  = 1 273   AAPLx 0,5%×513 000 = 2 565
 NVDAx 0,5%×1 670 000= 8 350   SPYx  0,5%×2 957 000= 14 785
 course entière 0,5%×5 394 670 = 26 973
```
Borne dure 113 : `Δdashboard ≤ ledger_run` (sinon incident) — appliquée PAR FRONTIÈRE (décision 125(3)), couplée au point d'arrêt §7.

## Fichiers produits (sous F:\tmp\bell-course\)
- `G0-lot-t1a-ii-b3d-course.PLIE.md` — (C) : le G0 de course PLIÉ (titre sans DRAFT), gates G-1..G-10, ancrage §5, go-1/go-2 §6, points d'arrêt §7, conditions architecte §8, calendrier §9, HORS + items formés §13, texte public §14.
- `ANCHORS.template.md` — template du fichier d'ancres `docs/course-bell/ANCHORS.md` (format d'ancre freezable, manifeste de tête, procédure OTS abstraite, vérif tiers).
- `public-text.txt` — texte de communication publique (anglais, sans tiret, vocab conforme).
- `vocab-check.mjs` — vérificateur machine du texte public (rejouable).
- `MESURES.md` — ce bloc d'append.
