# G0 — Bell T-1a-ii-b3d « course » : contre-vérification full-mint Helius (RÉSEAU, orchestrateur, R-20) — PLIÉ sur décisions 123/124/125

> **STATUT : PLIÉ (pli DOCS du brouillon `…-course.DRAFT.md` sur les décisions investisseur 123/124/125).** Ce fichier
> REMPLACE le brouillon en foldant : (a) **décision 124** (C-F-4 = option B, ancrage OpenTimestamps aux frontières de process,
> procédural, R-25 0) ; (b) **décision 125** (plafond 5 396 170 cr autorisé, GO en deux temps go-1/go-2, conditions architecte
> 1-4, calendrier) ; (c) **décision 122** (chevauchement : GARDE-HELIUS-1b démarre dès la fusion de 2b-ii, la course tourne en
> parallèle du temps 1). Les questions §10 du brouillon (Q1..Q5) sont **résolues** (Q1→124, Q2→125, Q5→125) ou restent un
> **item formé** (Q3 = point de GO ; Q4 = bundling phase B). **Tout ce qui n'est pas une décision investisseur reste
> « proposé »** : ce G0 pré-enregistre des procédures pour vérification adversariale de l'orchestrateur (R-21) ; il ne rend
> **aucune décision nouvelle** et ne produit **aucun code**. La course est **RÉSEAU, exécutée par l'ORCHESTRATEUR (R-20 :
> jamais le worker)** ; les artefacts de course vivent hors dépôt. **Le GO propre de la course reste hors portée du GO 119**
> (décision 119, `docs/CHANTIERS.md:562`) — ce pli le PRÉPARE (go-1/go-2, §6), il ne le remplace pas.

**Worker Opus 4.8 épinglé — modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, effort max ;
Opus 5 banni, non utilisé). **Provenance** : worker DOCS `claude-opus-4-8[1m]`, **2026-09-22T00:53:46Z** (`date -u` mesuré),
pli du G0 de course Bell sur les décisions 123/124/125 (Bell = temps 2, décision 117) ; base `F:\Monark` `lot/etude-suite` HEAD
**`7801083`** (≥ `cabd3d5` ; décisions 123 `b43a779`, 124 `5fbe1a2`, 125 `cabd3d5` ancêtres de HEAD ; 2b-ii fusionné `fec2848`)
[mesuré]. Lecture seule de `F:\Monark` ; écritures UNIQUEMENT sous `F:\tmp\bell-course\` ; aucun réseau, aucun secret lu, rien
sur `C:` ; règle **A-7** (jamais l'affichage d'une variable d'environnement). Réviseur = orchestrateur (R-21). Advisor intégré
consulté deux fois (avant rédaction, avant clôture).

---

## 0. Niveaux de preuve (doc 03)
- **[lu]** = lu de première main à `fichier:ligne` du dépôt (rejouable).
- **[mesuré]** = sortie d'une commande rejouée par ce worker (git/grep/awk/sha256/node), brute dans `MESURES.md`.
- **[2nd]** = chiffre lu dans un document (CHANTIERS/FAITS/dashboard/avis advisor) sans première main — jamais réutilisé comme fait de course.
- **[à mesurer au G1]** / **[à ré-ancrer au G1]** = projection ou `fichier:ligne` de ce pli, à confirmer à la mesure (surtout post-1b-ii, qui réécrit la voie budgétaire).
- **[à lire sur place]** = fait à établir par l'orchestrateur au navigateur avant la course (règle « lecture sur place » 2026-09-20) — jamais deviné ici.

---

## 1. Objet et ce que la course « branche »

**Objet** [lu `docs/G0-lot-t1a-ii-b3d-b.md:231-241`, `docs/PLI-lot-t1a-ii-b3d.md:325`] : tirer le **scan full-mint complet croisé**
des 4 mints (TSLAx, AAPLx, NVDAx, SPYx) borné à l'`oracle_slot` committé de chaque série, et **contre-vérifier** l'ensemble
43/x + les hand-offs SetAuthority contre la série hybride committée ; **toute divergence = STOP** (décision 67). C'est la
« contre-vérification indépendante » des séries fondatrices.

**Séquence proposée** (une fois DÉBLOQUÉE, calque `docs/G0-lot-t1a-ii-b3d-b.md:241`) : **sonde de densité C-7** (`--rebase-density`,
a,b,c,d,g, 4 mints, même `--out`) → **[T-1a-iii phase B univers, 50 000 cr, ledger DÉDIÉ, décision 84 — GO propre, §13-Q4]** →
**tirage full-mint** (ordre TSLAx→AAPLx→NVDAx→SPYx, sous-plafonds cumulatifs Amendement 3, reprise idempotente L-b1a) → **audit §5**
(`verifyLedgerChain` ; `Δdashboard ≤ credits_recomputed`, borné par `retries_by_method`). Sous **décision 125**, la sonde et le
tirage sont **séparés dans le temps par deux GO** (go-1 / go-2, §6). **AUCUN autre consommateur Helius pendant la sonde et le
tirage** (worktree épinglé au sha de fusion de 1b) [lu].

**Branchement (règle Branchement)** : le consommateur servi de la sonde/projection est **l'orchestrateur hors process** — il
n'existe **qu'à la course**. Bell reste `upcoming` dans TOUT registre public (site/README/skill/export) jusqu'à la 1ʳᵉ course
RAPPROCHÉE (décision 117, temps 2) [lu `docs/G7-lot-t1a-ii-b3d-b1b.md:24-25`, `docs/G0-lot-garde-helius-1b.md:220-221`]. La
décision 122 confirme : Bell avance **en parallèle** (temps réseau vs temps worker), `upcoming` dans tout registre public du
temps 1 jusqu'à cette 1ʳᵉ course rapprochée.

---

## 2. Exigences d'entrée énumérées → gate rempli / item formé (état au HEAD `7801083`)

| # | Exigence d'entrée (source) | État mesuré / lu | Traitement |
|---|---|---|---|
| **G-1** | **Amendement 3 committé SEUL** avant la sonde [lu `docs/PLI…b3d.md:376`] | **FAIT `6c9fdaa`** [mesuré : ancêtre de HEAD ; §2 sha `7071484f…` intact et **re-confirmé de première main à HEAD** ; bloc = texte (4) corrigé] | **REMPLI** |
| **G-2** | **b1b fusionné** (densité/projection, helper K=8) | **FAIT `f459cc2`** [mesuré ancêtre ; G7 696 pass/1 skip] | **REMPLI** |
| **G-3** | **condition (f) fusionnée** (ledger chaîné engage le payload) | **FAIT `1fc89a9`** [mesuré ancêtre ; `docs/G7-lot-t1a-ii-b3d-f.md`] | **REMPLI** |
| **G-4** | **GARDE-HELIUS-1b fusionné** (Bell consomme `openGuardedClient`) [lu `docs/G7-lot-t1a-iii-a1.md:22`(iii)] | **EN VOL** — **2b-ii FUSIONNÉ `fec2848`** ⇒ la dépendance d'ordre « 1b après 2b-ii » [lu `docs/G0-lot-garde-helius-1b.md:22,49`] est **LEVÉE** ; G0 1b **PLIÉ `d6af611`** (4 sous-lots 1b-0..1b-iii) ; **G1 1b-0 en vol** (décision 122 : 1b démarre dès 2b-ii) ; **aucun** G1 de sous-lot 1b encore atterri [mesuré : `git log --all` grep « 1b-0/1b-i/1b-ii/1b-iii G1 » = 0] | **GATE OUVERT, EN COURS.** N'est **REMPLI** qu'aux **4 sous-lots fusionnés + G-4-bis vert sur l'arbre fusionné** (= condition architecte 1, §8). Bloque go-2 (§6). |
| **G-5** | **-iii-a1-bis fusionné** (univers Solana, ledger chaîné) [lu `docs/G7-lot-t1a-iii-a1.md:22`(i)] | **FAIT** — merge **`780a631`** (G7 `dac433a`, oracle 720/0) [mesuré ancêtre] | **REMPLI** |
| **G-6** | **HELIUS-1 rapproché** — conditions de reprise (a)–(e) [lu `docs/G0…b3d-b.md:233-239`] : (a) audit + critère de GO pré-enregistré ; (b) 2 lectures dashboard sans process MONARK (débit de fond 0) ; (c) PLI §4 rebasé ; (d) 1ʳᵉ sonde = ÉTALONNAGE ; (e) date sous réserve | (f) tenue par -f `1fc89a9` ; (a)–(e) = actes orchestrateur à la reprise ; (a) critère verbatim `CHANTIERS.md:389` [lu] | **GATE** — (b) devient **condition architecte 2** (§8) ; floor lu sur place AVANT la course (décision 112). Ex-Q3, §13. |
| **G-7** | **`BELL_SOLANA_RPC` + clé Helius** posées par l'investisseur [lu `docs/G0-lot-garde-helius-1b.md:362` : ABSENTES de l'env] | non posées | **ITEM investisseur** (kit §10.5) — à poser AVANT la course ; **aucune clé lue par un worker (A-7)** ; **clé DÉDIÉE + révoquée après** = condition architecte 4 (§8) |
| **G-8** | **`HELIUS_LEDGER_DIR` pré-existant, `HELIUS_CYCLE_ID`, floor lu sur place** (décision 114) [lu `docs/CHANTIERS.md:480`] | dossier `F:\monark-ledger\` créé | **ITEM orchestrateur** — `HELIUS_LEDGER_DIR` hors dépôt ; floor épinglé au dashboard (60 938 [2nd] = du jour, à re-lire) |
| **G-9** | **`require_full_pages` prior — C-G2-3 de b1b** [lu `docs/G7-lot-t1a-ii-b3d-b1b.md:20`] : `runDensityProbeCli` écrit `require_full_pages` **sans lire** le prior | **CONFIRMÉ OUVERT à HEAD** [mesuré : `runDensityProbeCli` `rebase-crosscheck.ts:715`, écrit `:721/:727` ; **ne lit pas** `readPriorBudget`, contraste `runRebaseCrosscheckCli:643-644` qui throw] ; porteur « -f ou b1a-bis » clos sans le porter | **À TRANCHER (§10)** — proposé : porté par 1b-ii (sur le chemin critique G-4) |
| **G-10** | **GO investisseur** (décision 119 exclut CETTE course) [lu `docs/CHANTIERS.md:562`] | non donné | **ITEM investisseur** — **DEUX GO** (go-1/go-2, §6), fiches §6 |

**Aucune de ces lignes n'est un « dû » nu** : chacune est un gate rempli, un gate en cours à déclencheur nommé, ou un item formé.
**Résolutions des questions du brouillon** : **Q1 (C-F-4) → décision 124** (option B, §5) ; **Q2 (plafond) → décision 125**
(§3, §6) ; **Q3 (étalonnage HELIUS-1) → point de GO** (condition architecte 2, G-6) ; **Q4 (bundling phase B) → item formé**
(§13) ; **Q5 (fenêtre de cycle) → décision 125** (calendrier, §9).

---

## 3. Plafond de la course — DÉCIDÉ (décision 125) ; recompute de première main et échelle des trois plafonds

**Décision 125 (verbatim, `docs/CHANTIERS.md:639`)** [lu] : **plafond autorisé = 5 396 170 crédits Helius** = Σ des sous-plafonds
par mint (fail-closed, **roulant descendant** TSLAx → AAPLx → NVDAx → SPYx) + sonde de densité (≤ 1 500 cr). Échelle inchangée :
5 396 170 (sous-plafonds) < 6 497 500 (STOP H6, §2 gelé du PLI) **[sic — verbatim de 125 ; voir lecture n°1 §3.2 : le §2 gelé
STOPpe sur projection > 6 500 000 ; 6 497 500 est le `--max-credits` par commande. J'ai MESURÉ le sha de §2 (M-C2), pas
revendiqué que son texte porte « 6 497 500 »]** < 8 000 000 (cycle, décision 112). Le quota est inclus dans le plan Helius
(autoscaling Off) : **l'échec plausible est un faux STOP, pas une surdépense.**

### 3.1 Recompute du ~5,4 M cr de première main (débit -b3a-2 × 465 j, barème Helius) [mesuré]

Barème Helius [2nd FAITS `F:\PRODUITS\etude-2026-09-21\helius-audit\FAITS-tarification-helius-2026-09-21.md` + décision 55] :
**gTfA (`getTransactionsForAddress`, archival) = 10 cr / appel, 1 000 tx / appel** ; `getTransaction`/`getSignaturesForAddress`/
`getAccountInfo` = 1 cr. Le scan full-mint tire les CORPS par gTfA `full` ⇒ coût dominant = `⌈N/1000⌉ × 10`. Débits -b3a-2 [2nd
`docs/PLI-lot-t1a-ii-b3a.md:169-175`] extrapolés à l'âge du mint (~465 j) — **recompute de première main** [mesuré, `MESURES.md` M-B3/M-C4] :

| mint | débit/j [2nd] | N = débit×465 | pages = ⌈N/1000⌉ | corps gTfA = pages×10 | part de Σ corps [mesuré] |
|---|---|---|---|---|---|
| TSLAx | 54 670 | 25 421 550 | 25 422 | **254 220 cr** | 4,71 % |
| AAPLx | 110 427 | 51 348 555 | 51 349 | **513 490 cr** | 9,52 % (cumul 14,23 %) |
| NVDAx | 359 082 | 166 973 130 | 166 974 | **1 669 740 cr** | 30,96 % (cumul 45,19 %) |
| SPYx | 635 832 | 295 661 880 | 295 662 | **2 956 620 cr** | 54,81 % (cumul 100 %) |
| **Σ corps full-mint** | | | | **5 394 070 cr** | |

**Écart au chiffre enshrined** : PLI-b3a / Amendement 3(3) fige **5 394 670 cr** (sous-plafonds 254 670 / 513 000 / 1 670 000 /
2 957 000). **Δ = 600 cr**, pur arrondi de « ~465 j » et des `⌈⌉` par mint. **Ce sont des ESTIMATIONS PONCTUELLES** (Amendement
3(3)) : extrapolation d'un débit mesuré sur des fenêtres **1,43–19,7 j** à 465 j ⇒ coût réel possiblement > sous-plafond ⇒ **faux
STOP fail-closed plausible** (STOP+ESCALADE, jamais une surdépense). L'advisor-defi note que le sous-plafond AAPLx (513 000) est
**inférieur de 490 cr** à sa propre estimation (513 490) — seul le roulant descendant l'absorbe (~980 cr de marge cumulée à la
frontière AAPLx) [2nd avis advisor-defi Q3].

### 3.2 L'échelle des trois plafonds (à ne pas confondre) — DEUX lectures numériques à ne pas conflater

| Plafond | Valeur | Nature | Source |
|---|---|---|---|
| **Σ sous-plafonds + sonde** (SPYx `--max-credits` cumulatif) | **5 396 170 cr** (= 1 500 + 5 394 670) | plafond AUTORISÉ (décision 125), fail-closed par sous-plafond | Amendement 3(2), PLI:388 [lu] |
| **STOP H6 (projection)** | **> 6 500 000 cr ⇒ STOP** ; `--max-credits` par commande = **6 497 500** | garde de projection (§2 GELÉ) ; le 6 497 500 est la valeur d'argument, PAS le seuil | PLI §2 H6, Amendement 3(1)(ii) [lu] |
| **Plafond de CYCLE Helius** | **8 000 000 cr** (80 % du plan) | garde anti-BUG fail-closed, non levée par un GO (leçon HELIUS-1) | **décision 112** [lu `docs/CHANTIERS.md:478`] |

> **Lecture n°1 (ne pas conflater)** : le seuil de STOP H6 du **§2 gelé** est « projection **> 6 500 000** ⇒ STOP+ESCALADE » ; **6 497 500**
> est seulement le `--max-credits` **par commande** (Amendement 1). Marge des corps sous 6 497 500 (SPYx cumulatif) = **1 101 330**
> [lu PLI:390].
> **Lecture n°2 (ne pas conflater)** : la décision 125(3) écrit « **le premier [point d'arrêt] tombe à ~14 % de la dépense (TSLAx)** » ;
> mesuré, les fractions cumulatives sur Σ corps 5 394 070 sont **TSLAx 4,71 % / +AAPLx 14,23 % / +NVDAx 45,19 %** — le **~14 %** est
> la **frontière TSLAx+AAPLx**, AVANT le coûteux NVDAx (31 %) puis SPYx (55 %). Présenté [mesuré] sans « corriger » le verbatim.

**Cumul de cycle pire-cas** [mesuré, `MESURES.md`] : floor du jour **60 938** [2nd, décision 112] + sonde ~400-600 (§6) + **phase B
univers 50 000** (décision 84) + corps 5 394 070 + audit ~1 000 ≈ **~5,51 M cr**. Marge du cumul pire-cas sous 8 M ≈ **2,49 M**.
Headroom sous 8 M au-dessus du floor = 8 000 000 − 60 938 = **7 939 062**. Le floor doit être **RE-LU sur place** au dashboard AVANT
la course (décision 112 ; « 60 938 » est du jour, [2nd]).

### 3.3 Défaut de doc CONFIRMÉ (item formé, décision 125) — plafond de cycle STALE « 10 M »

`docs/G0-lot-t1a-ii-b3d-b.md:236` (« cumul pire cas ≈ **7 610 938 / 10 M** ») et `:243` (routage C-4 « cumul cycle **> 10 M** …
arrêt système à 10 M ») **datent d'avant la décision 112** (cycle abaissé à **8 M**) [**mesuré de première main à HEAD** : les deux
lignes portent bien « 10 M »]. La **décision 125 confirme** : « « 10 M » périmé dans G0-b:236/:243 (superseded par 112) **à corriger
au pli du G0 de course** ». **Proposé (docs seuls, hors périmètre d'édition de ce worker qui écrit sous `F:\tmp`)** : note datée en
tête du bloc course de G0-b renvoyant à la décision 112 (8 M fail-closed ; floor épinglé avant chaque course) + routage C-4 lu
« cumul > 8 M » — sans réécrire le corps (calque C-V-5). `error_origin` proposé : rédacteur du G0-b (antérieur à 112). **Item
formé, porteur orchestrateur, déclencheur : ce pli** (§13).

---

## 4. Rapprochement Helius (décision 113) — protocole, désormais PAR FRONTIÈRE DE MINT (décision 125(3))

**Décision 113** [lu `docs/CHANTIERS.md:479`] : **borne dure `Δdashboard ≤ ledger_run`** (sinon incident, STOP) **+ bande souple
`ledger_run − Δdashboard ≤ max(50 cr, 0,5 % du run)`**, pré-enregistrée AVANT la 1ʳᵉ course.
- **`Δdashboard`** = (lecture dashboard après) − (lecture avant), les deux lues **par l'investisseur/orchestrateur sur place** ;
  **`ledger_run`** = crédits **recomputés du run** (`Σ requêtes × tarif`, borné par `retries_by_method` du `budget.json`), **jamais**
  un « N exact » (une reprise fait monter le compte réel, dans la bande).
- **Décision 125(3) — rapprochement 113 PARTIEL à chaque frontière de mint** (condition architecte 3, §8) : au lieu d'un unique
  rapprochement en fin de course, l'orchestrateur rapproche **incrémentalement** à la fin de chaque mint : `Δdashboard` du segment
  du mint `k` vs `ledger_run` du mint `k` (`credits_recomputed` de `crosscheck-<MINT>.json`), bande souple **mise à l'échelle du run
  du mint** `= max(50 ; 0,5 % × ledger_run_k)`. Une divergence hors bande à une frontière ⇒ **incident AVANT de démarrer le mint
  suivant** (couplée au point d'arrêt §7).
  - Bande = `max(50 ; 0,5 % × ledger_run_k)` — le `ledger_run_k` réel est ≤ sous-plafond, donc `0,5 % × sous-plafond` en est une
    borne haute pré-enregistrée [mesuré, sous-plafonds enshrined Amendement 3] : TSLAx ~1 273 · AAPLx ~2 565 · NVDAx ~8 350 · SPYx
    ~14 785 cr. Bande de la course entière = max(50 ; 0,5 % × 5 394 670) ≈ **26 973 cr**. (Valeurs finales sur le `ledger_run` réel.)
- **Étalonnage (condition (d), G-6)** : la **sonde de densité** (go-1, §6) est le premier acte à coût borné ⇒ premier point de la
  borne 113. `ledger_run` = crédits **recomputés du ledger de sonde** (`Σ méthode × tarif`, borné par `retries_by_method`). La borne
  dure 113 s'applique à CE `ledger_run` ; divergence hors bande ⇒ incident **avant** go-2.
- **Fenêtre / hypothèse (à ne pas prendre pour un fait)** : Bell (Solana) devrait être le seul consommateur **Helius** (Narabi/Ukemi
  = Chainstack, opérateur distinct [lu `docs/CHANTIERS.md:570-571`]) — **mais** HELIUS-1 = ~49 675 cr **non attribués** et une
  **« sonde VPS Bell »** est déployée (`docs/CHANTIERS.md:560` E-5, débit de fond non vérifié ici). ⇒ le « pas d'exclusion de
  fenêtre côté Helius » n'est licite **qu'après** la **condition (b) MESURÉE = débit de fond 0** (condition architecte 2, §8),
  **immédiatement avant** la sonde ; sinon incident. Le worktree épinglé garantit « aucun autre consommateur Helius **côté
  orchestrateur** » — il ne couvre pas un consommateur VPS/tiers, d'où (b).

---

## 5. Ancrage externe C-F-4 (décision 124 = option B) — PROCÉDURE PRÉ-ENREGISTRÉE

**Décision 124 (verbatim, `docs/CHANTIERS.md:629-636`)** [lu] : **option B, procédurale, sans code (R-25 = 0)**. Pendant la course,
à chaque **frontière de process** (fin de la sonde ; **début, reprise et fin de chaque mint** ; `ledger_sha256` **final** avant la
publication du verdict), l'orchestrateur **relève la tête de chaîne**, l'écrit dans un **fichier d'ancres committé ET POUSSÉ**, et
fait **horodater le hash par OpenTimestamps** (calendriers publics, preuve ancrée sur Bitcoin ; l'ancre ne révèle **que le hash**).
**Quelques dizaines d'ancres, jamais par page** (une ligne par page = ~539 407 lignes, infaisable [mesuré]). **R-25 = 0** (acte
d'orchestrateur, pas de code Bell).

**Ce que l'ancrage prouve / ne prouve pas — LIMITE À ÉCRIRE TELLE QUELLE À L'ADR D1-octies** (décision 124(3)) :
> « L'ancrage prouve l'**antériorité de la tête de chaîne à la date de l'ancre**, **PAS la provenance des pages ni l'exécution du
> scan**. » (advisor architecte Q2 : un ledger reforgé cohérent s'ancre aussi bien qu'un vrai ; l'ancre ferme « on ne peut pas
> réécrire après contestation », pas « les données viennent de Helius ».)

**Deux niveaux distincts (advisor-marché Q2)** : **B1** = push public rapide (existence observable mais **même opérateur, mêmes
clés git** ⇒ témoin **faible**) ; **B2** = **horodatage indépendant OpenTimestamps** (**seul** qui ferme C-F-4 : preuve ancrée hors
de nous). La décision 124 fait **les deux** (committé ET poussé + OTS) ; le témoin **indépendant** est B2.

### 5.1 Fichier d'ancres — emplacement et format d'UNE ancre (proposé, freezable au commit du pli par l'orchestrateur)

**Emplacement proposé** : `docs/course-bell/ANCHORS.md` (dans le dépôt, committé + poussé par l'orchestrateur ; template livré en
`F:\tmp\bell-course\ANCHORS.template.md`). Chaque frontière ajoute **UNE ligne** au tableau + un **manifeste de tête** + sa **preuve
OTS**, dans le même commit.

**Pourquoi un MANIFESTE de tête et pas un `entry_sha256` nu** [correction de conception, advisor] : `entry_sha256` de « la dernière
ligne de ledger » **n'existe pas** à certaines frontières — la sonde de densité écrit `budget.json`/`sonde-report.json` mais **JAMAIS
un ledger** (Amendement 1(1) ; seul le point (a) écrit une page-1 par mint) ; à `mint_start` le `ledger-<MINT>.jsonl` peut ne pas
exister encore ; `final` = **4** `ledger_sha256` + `crosscheck-report.json`. Donc l'objet ancré (ce qu'OTS horodate) est un
**manifeste déterministe** de l'état `--out` pertinent à la frontière, et la ligne d'ancres publie aussi les têtes de chaîne là où
elles existent.

**Manifeste de tête `manifest.txt`** (texte déterministe, rejouable byte-pour-byte par un tiers) :
```
# une ligne "<relpath> <sha256hex>" par artefact pertinent, TRIÉ par <relpath> en ordre d'octets,
# fins de ligne LF, aucun espace de fin, un LF final ; sha256 = minuscules 64-hex.
bell-b3d-run/budget.json              <sha256hex>
bell-b3d-run/ledger-TSLAx.jsonl       <sha256hex>
bell-b3d-run/crosscheck-TSLAx.json    <sha256hex>
sonde-report.json                     <sha256hex>
```
Artefacts par frontière (proposé) : **probe_end** = `bell-b3d-run/budget.json` + toute `ledger-<MINT>.jsonl` page-1 du point (a) +
`sonde-report.json` ; **mint_start** = `budget.json` + ledgers existants (M pas encore présent) ; **mint_resume** = `budget.json`
+ `ledger-<M>.jsonl` partiel ; **mint_end** = `ledger-<M>.jsonl` complet + `crosscheck-<M>.json` ; **final** = les 4
`crosscheck-<MINT>.json` + `crosscheck-report.json` + `budget.json`.

**Ligne d'ancres** (colonnes, encodages **freezables**) :
```
| date_u | boundary | mint | manifest_sha256 | entry_sha256 | ledger_sha256 | commit | ots_ref |
```
- **`date_u`** = `date -u +%Y-%m-%dT%H:%M:%SZ` au moment où l'orchestrateur relève la tête (ISO-8601 Z, mesuré, jamais estimé — récidive d'horloge `CHANTIERS.md:616`).
- **`boundary`** = énum FERMÉE `{probe_end, mint_start, mint_resume, mint_end, final}`.
- **`mint`** = `{TSLAx, AAPLx, NVDAx, SPYx, n/a}` (`n/a` pour `probe_end` et `final`).
- **`manifest_sha256`** = sha256 (minuscules 64-hex) du `manifest.txt` de la frontière — **c'est l'objet qu'OTS horodate**.
- **`entry_sha256`** = `entry_sha256` de la dernière ligne de `ledger-<mint>.jsonl` **là où elle existe**, sinon `n/a`.
- **`ledger_sha256`** = champ `ledger_sha256` de `crosscheck-<mint>.json` (à `mint_end`), sinon `n/a`.
- **`commit`** = SHA git du commit qui ajoute cette ligne + `manifest.txt` + la preuve OTS (committé ET poussé, R-20 : **l'orchestrateur**).
- **`ots_ref`** = chemin relatif de la preuve OTS du manifeste (pendante puis mise à niveau ; §5.2).

**Qui / quand / comment** :
- **Qui** : **l'ORCHESTRATEUR** (R-20 : jamais le worker — ce worker ne fait que pré-enregistrer le format ici).
- **Quand** : à **chaque** frontière ci-dessus, **pendant** la course (décision 124 : « non rattrapable » — une ancre a posteriori ne prouve rien sur l'intervalle passé).
- **Comment un tiers vérifie** (procédure publique) : (1) récupérer `manifest.txt` + `ots_ref` au `commit` de l'historique poussé ;
  (2) recomputer `sha256(manifest.txt)` et vérifier `== manifest_sha256` de la ligne ; (3) **vérifier la preuve OTS** du manifeste
  avec un client OpenTimestamps ⇒ obtient l'instant Bitcoin **avant** lequel le manifeste existait ; (4) si le ledger est publié
  (item formé (b), §13), recomputer les sha des artefacts listés et re-tirer une page au hasard (~10 cr) pour comparer ; (5) borne
  ADR D1-octies (ci-dessus). Le commit git (B1) donne un **second témoin, plus faible** (date serveur).

### 5.2 Mécanique OpenTimestamps — ABSTRAITE (aucun réseau ici ; à lire sur place)

**Je n'ai aucun réseau** ; les propriétés OTS ci-dessous sont **[2nd]** (lues par les advisors via WebFetch sur `opentimestamps.org`,
donc de seconde main pour ce worker — jamais un fait de course) : OTS « prouve que des données existaient avant un instant », les
serveurs calendrier sont « free to use » sans compte ni clé, l'ancrage final est sur Bitcoin, l'ancre ne révèle que le hash [2nd
avis advisor architecte Q2 / advisor-marché Q2 / advisor-defi Q2]. **Procédure abstraite** (l'orchestrateur exécute) : **stamp** du
`manifest.txt` ⇒ **preuve pendante** (calendrier) ; commit+push du `manifest.txt` **et** de la preuve pendante ; plus tard **upgrade**
de la preuve ⇒ **preuve attestée Bitcoin** ; commit+push de la preuve mise à niveau. **[à lire sur place — décision 124 préalable (1),
orchestrateur, AVANT le premier appel]** : l'**invocation exacte du client**, la **liste des calendriers**, et le **délai de
confirmation** (**AUCUN délai n'est chiffré ici** — l'advisor architecte a explicitement refusé d'en donner un, la page primaire n'en
donnant aucun). **Préalables non contournables (décision 124)** : (1) **lecture SUR PLACE des conditions d'usage OTS** par
l'orchestrateur ; (2) **go investisseur EXPLICITE** pour le premier appel externe (un service tiers, même gratuit, est une action
sortante) ; un refus d'outil / certificat invalide / CAPTCHA n'est **jamais contourné** (consigner « non contourné » + procurement).

### 5.3 Compléments retenus par la décision 124 (non bloquants) — items formés (§13)
- **(a) B-code** : vérification de la tête contre la dernière ancre dans `resumeFromLedger` et à l'audit (~70-120 lignes [2nd DRAFT]) — déclencheur « avant la publication du verdict », **après la course**.
- **(b) Publication du ledger** (entrées par page `list_sha256`/`slot_lo`/`slot_hi`/`tail_sigs`) pour qu'un tiers re-tire une page au hasard (~10 cr) et compare — **à décider au G0 de course** ; préalable : **conditions d'usage Helius** sur la publication de listes `signature|slot` **à relire** (données de chaîne publiques, décision 52 couvre les séries réduites, cas à relire) [2nd avis advisor-defi Q2].
- **(c) Audit C-5 second opérateur** : comparer l'ensemble de signatures des k ≤ 25 pages d'audit au **SECOND opérateur (Chainstack Solana, `getSignaturesForAddress` ~1 RU/1000)**, **pas** au même Helius — **résidu mono-opérateur nommé** (comparer au même Helius ne prouve rien contre Helius) [2nd avis advisor-defi Q2 / architecte Q3].

---

## 6. Fiche de GO — EN DEUX TEMPS (décision 125) — go-1 (sonde) puis go-2 (tirage)

Source du contenu exigé [lu `docs/G7-lot-t1a-iii-a1.md:22`, amendement 2026-09-21T16:20Z] : toute fiche de GO porte **(a)** la
liste des gates, **(b)** la mention du flake local Windows et de sa règle de relance, **(c)** le plafond de la course, **(d)**
l'item de rejeu checkpoint-2 post-course depuis le brut sha-pinné. **Décision 125** scinde le GO en **deux gates de course** (ni
l'un ni l'autre n'est rendu par la décision 125 — ce sont des GO investisseur, hors portée du GO 119).

### 6.1 go-1 — SONDE DE DENSITÉ SEULE (≤ 1 500 cr, ~0,03 % du budget)
- **Objet** : sonde K=8 seule (`--rebase-density`), **incluant les points (a) et (b) du PLI l.58-59** — `slot.gte`/`slot.lte` en
  `asc` fonctionnels **ET** reprise inter-process sans perte, **mesurés sur l'API RÉELLE** (à ce jour seuls les tests offline sont
  verts [lu]) [2nd avis advisor-defi Q3, décision 125].
- **(a) gates** : G-1/2/3/5 REMPLIS · **G-4 fusionné + G-4-bis vert** (condition architecte 1) · **G-6** conditions (a)–(e) + floor
  lu sur place · **condition architecte 2** (débit de fond 0 mesuré juste avant) · G-7 clé posée (dédiée) · G-8 `HELIUS_LEDGER_DIR` ·
  **G-9 tranchée** (§10).
  - **Pourquoi go-1 exige DÉJÀ G-4** (pas seulement go-2) : la sonde est un **appel payant Helius** qui passe par le MÊME chemin
    `openGuardedClient` que 1b migre ; une sonde **hors garde** rejouerait HELIUS-1 (ledger dans `--out`, absent⇒0, retry sous le
    tick) — **interdit par la décision 122** (« appel payant hors garde »). go-1 ne resserre donc rien en silence : il applique la
    garde dès le premier crédit dépensé.
- **(b) flake local Windows** [lu `docs/G7-lot-t1a-iii-a1.md:22`, C-G2D-1, défaut amont `nodejs/node#56645`] : critère D4 amendé
  = **0 échec non signé** ; relance locale Windows seulement ; **aucun retry CI**. (Vise les oracles offline rejoués, pas le tirage réseau.)
- **(c) plafond go-1** : sonde ≤ **1 500 cr** (réserve). Enveloppe attendue **~400-600 cr** [mesuré, §6.3], **jamais** un « 360 exact ».
- **(d) rejeu** : le `budget.json` et les ledgers page-1 écrits **par le CLI** sont rejouables (item 7 registre PLI + C-V-9) — voir 6.4.
- **Sortie de go-1** : `sonde-report.json` (points (a)-(g), N projeté **+ intervalle**), état `bell-b3d-run/` (`budget.json` cumulatif
  + ledgers page-1), **ancre `probe_end`** (§5, sous préalables OTS). **La projection de la sonde ARME go-2.**

### 6.2 go-2 — TIRAGE FULL-MINT (rendu quand la projection de la sonde est connue)
- **Objet** : tirage TSLAx→AAPLx→NVDAx→SPYx, sous-plafonds cumulatifs Amendement 3, points d'arrêt §7, ancres §5 à chaque frontière.
- **Consentement pré-libellé (décision 125)** : **« jusqu'à H6 6,5 M » si la sonde sort LARGE (> ±20 % sur SPYx)**, **sinon retour
  investisseur**. Engager 5 396 170 cr **avant** la sonde reviendrait à signer un point estimé [2nd avis advisor-defi Q3].
- **(a) gates** : les 4 sous-lots 1b fusionnés + G-4-bis vert (G-4 REMPLI) · conditions architecte 1-4 (§8) · **go-1 rentré**
  (sonde dans la bande 113, points (a)/(b) verts sur l'API réelle) · points d'arrêt §7 pré-enregistrés.
- **(b) flake local Windows** : idem 6.1(b).
- **(c) plafond go-2** : échelle §3.2 — tirage fail-closed à **5 396 170 cr** (sous-plafonds cumulatifs) ; STOP H6 sur **projection
  > 6 500 000** (`--max-credits` par commande 6 497 500) ; **jamais** au-delà du cycle **8 000 000** (décision 112) ; floor du jour
  re-lu ; phase B univers **50 000 cr** (ledger dédié) comptée à part (§13-Q4).
- **(d) rejeu post-course** : checkpoint-2 rejoué **depuis le brut sha-pinné** ; **+ item 7 du registre PLI** (`committed_artifacts_replay`
  sur artefacts écrits PAR LE CLI, `docs/G7-lot-t1a-ii-b3d-b1a.md:21`) ; **+ C-V-9** (`crosscheck-*.json` lus tels qu'écrits par le
  CLI, `docs/CHECKPOINT2-lot-t1a-ii-b3d-a.md:25`) [lu]. **+ ancre `final`** avant publication du verdict.

### 6.3 Enveloppe de coût go-1 (points (a)/(b) inclus) [mesuré]
K=8 ⇒ **1 + DENSITY_POINTS = 9 gTfA/mint × 4 = 36 gTfA = 360 cr** nominal [lu `rebase-crosscheck.ts:447-449,749` ; `DENSITY_POINTS=8`].
go-1 exécute **en plus** : **(a)** 1 page/mint de vérif de disponibilité (`slot.gte`/`slot.lte`) = 4 gTfA = 40 cr ; **(b)** un test
de reprise inter-process sur l'API réelle = quelques gTfA de plus. **Étalonnage (d)** : `ledger_run` = **Σ méthode × tarif recomputé
du ledger de sonde** (borné par `retries_by_method`), enveloppe attendue **~400-600 cr**, **dur ≤ 1 500** (Amendement 3(3) : plafond
sonde). Une reprise fait monter le compte réel — dans la bande 113, jamais un « exact ».

### 6.4 `--out` durable partagé go-1↔go-2 (séparés dans le temps)
go-1 et go-2 étant **séparés dans le temps**, le `--out` partagé **`F:/…/bell-b3d-run`** (compteur cumulatif `budget.json` +
ledgers page-1 du point (a)) **DOIT être sur un chemin durable** (pas un temp effacé entre les deux GO) — Amendement 1(1) : sonde et
tirage partagent UN `--out` pour un compteur conjoint. **Cet état `bell-b3d-run/` est EXACTEMENT ce que l'ancre `probe_end` engage**
(manifeste §5.1). Le `sonde-report.json` (synthèse des points (a)-(g)) est **distinct** du `--out` CLI [lu PLI §3 l.57] et est inclus
dans le manifeste `probe_end`.

---

## 7. Points d'arrêt par frontière de mint (décision 125(3), condition architecte 3) — pré-enregistrés

À **chaque** frontière de mint (fin du mint `k`, avant de démarrer le mint `k+1`), l'orchestrateur exécute, **dans l'ordre** :
1. **Rapprochement 113 partiel** (§4) : `Δdashboard_k ≤ ledger_run_k`, bande souple à l'échelle du run du mint ; hors bande ⇒ **incident, STOP**.
2. **Ancre** (§5) : frontière `mint_end` (manifeste `ledger-<k>.jsonl` complet + `crosscheck-<k>.json`, tête `entry_sha256`/`ledger_sha256`, OTS).
3. **Projection du mint suivant** : `projectPagesAtFraction` HORS PROCESS (Amendement 3(1)(ii)) à `f = 0,05` **ET** (item décision 125,
   coût 0, lecture du ledger) à **`f = 0,25` et `f = 0,5`** ; si borne haute de l'intervalle d'un mint > son sous-plafond ⇒ **ESCALADE
   AVANT de démarrer le mint** ; si projection en crédits **> 6 500 000** ⇒ **STOP + ESCALADE** (H6).
4. **Étalonnage hors échantillon TSLAx** : **pré-enregistrer le ratio `N_exact / N_projeté`** (TSLAx = 1ᵉʳ mint, 4,71 % du coût) comme
   étalonnage **hors échantillon** ; **escalade AVANT NVDAx/SPYx** s'il **sort de la bande** (décision 125(3)). La frontière TSLAx+AAPLx
   (~14 %) est le dernier point d'arrêt **avant** le coûteux NVDAx (31 %) puis SPYx (55 %) — le STOP sur divergence joue donc **avant**
   les 55 % de SPYx [2nd avis advisor architecte Q3].
- **Bande d'escalade (proposé, à figer au go-2)** : la « bande » du ratio `N_exact/N_projeté` doit être **pré-enregistrée numériquement**
  au go-2 (p. ex. `|N_exact/N_projeté − 1| ≤ b`) — **valeur `b` = décision investisseur au go-2**, non fixée ici (aucune décision
  nouvelle). L'advisor-defi note que « l'intervalle min/max des nœuds n'est **pas** un intervalle de confiance » : la sonde donne un
  meilleur **point**, pas une borne — d'où l'étalonnage hors échantillon TSLAx comme garde réelle.

---

## 8. Conditions architecte 1-4 (décision 125, verbatim `docs/CHANTIERS.md:641`) [lu]
1. **GARDE-HELIUS-1b fusionné et vert sur l'arbre fusionné** (G-4 REMPLI + **G-4-bis** §11 : les 8 tests `bell_density_*`/`bell_h6_*` restent verts, sous-plafonds `--max-credits` autoritaires vs `--method-caps` du garde, étalonnage sonde inchangé sous le client gardé).
2. **Débit de fond Helius mesuré NUL** juste avant la sonde (= condition (b) de G-6 ; 2 lectures dashboard espacées, aucun process MONARK). Hors bande / ≠ 0 ⇒ **incident, pas de tirage**.
3. **Point d'arrêt pré-enregistré à chaque frontière de mint** (§7) : rapprochement 113 partiel + ancre (décision 124) + projection du mint suivant ; ratio `N_exact/N_projeté` pré-enregistré (TSLAx, étalonnage hors échantillon), escalade avant NVDAx/SPYx.
4. **Clé Helius dédiée à la course, révoquée ensuite, si Helius le permet** (action investisseur, **non bloquante** — à vérifier sur place). Aucune clé lue par un worker (A-7).

---

## 9. Calendrier (décision 125, verbatim `docs/CHANTIERS.md:642`) [lu]
- Cycle Helius **jusqu'au 19/10** ; **départ avant ~15/10** (tirage ~45 h + marge 48 h [lu `docs/G0…b3d-b.md:238`]).
- **À-cheval sur la bascule de cycle = ESCALADE** (routage C-4) — **jamais chevaucher**. Un **glissement au-delà du 19/10** ré-ouvre la
  question du plafond **sur le floor du cycle suivant** : le floor se réinitialise ⇒ l'arithmétique du cumul (floor 60 938) **change**
  et doit être re-posée. **Contrainte d'ordre (décision 122 + G-4)** : G-4 = 4 sous-lots (1b-0..1b-iii), chacun G1→G2‖cp-2→G7, + G-4-bis
  (§11) — **G1 1b-0 en vol** ; la course en parallèle du temps 1 ne doit pas rogner la qualité (décision 122 : « la course Bell tronquée
  [interdite] — le full-mint EST la qualité »).

---

## 10. C-G2-3 (`require_full_pages` prior non lu) — à trancher, deux options (proposé)

**CONFIRMÉ OUVERT à HEAD `7801083`** [mesuré] : `runDensityProbeCli` (`rebase-crosscheck.ts:715`) **écrit** `require_full_pages`
(`:721,727`) mais ne **lit pas** le prior (`readPriorBudget:615-622` n'est appelé que par `runRebaseCrosscheckCli:643`, qui **throw
fail-closed** `:643-644` si un `--out` n'est pas prouvé `require_full_pages:true`). Aucun chemin canonique ne l'atteint (sonde EN
PREMIER, audit sur `--out` DISTINCT). Porteur nommé « -f ou b1a-bis » clos sans le porter.
- **Option (a) — porteur code = GARDE-HELIUS-1b sous-lot 1b-ii** [proposé] : 1b-ii migre déjà `rebase-crosscheck.ts` (suppr.
  `callsByMethod`, crédits dérivés) ⇒ y ajouter la lecture symétrique du prior dans `runDensityProbeCli` (≈ 3 lignes, calque
  `:643-644`) + test `bell_density_probe_reads_prior_require_full_pages` + mutant. **R-25 ≈ 25-40 [à mesurer au G1]**, absorbé dans
  1b-ii (sur le chemin critique G-4). Se couple à l'item 125 « **reprise sans perte après STOP à vérifier au G1 1b** » (le vrai
  risque d'un plafond strict est la reprise).
- **Option (b) — gate procédural (R-25 = 0)** [proposé] : la sonde tourne sur un `--out` **FRAIS**, et la fiche go-1 impose d'ASSERTER
  `budget.json` absent avant `--rebase-density`. Documentaire, aucun code.

**Proposé** : option (a) puisque 1b-ii est de toute façon sur le chemin critique (G-4). Une seule à retenir — **décision orchestrateur/G1 1b-ii**, pas ici.

---

## 11. Interaction avec GARDE-HELIUS-1b — G-4-bis (re-vérif sur l'arbre fusionné post-1b-ii) — proposé

**Attention (R-21)** : les sous-plafonds Amendement 3 (`--max-credits` fail-closed `collect.ts:304` [ré-ancré HEAD], enforcement
`makeBudgetedCall:304`) et les 8 tests `bell_density_*`/`bell_h6_*` ont été vérifiés VERTS **AVANT 1b** (oracle b1b `f459cc2`). Or
**1b-ii** [lu `docs/G0-lot-garde-helius-1b.md:111,214,263`] : (i) **supprime `callsByMethod` local**, dérive les crédits de
`client.spent()` (IT-3) ; (ii) fait de `--method-caps` (4 méthodes, gTfA BAS) un cap INTERNE du garde ; (iii) déplace/renomme des
`fichier:ligne`. ⇒ **exigence d'entrée G-4-bis (= condition architecte 1)** :
> **Re-vérifier, sur l'arbre FUSIONNÉ post-1b-ii** : (1) les 8 tests `bell_density_*`/`bell_h6_*` restent VERTS ; (2) les sous-plafonds
> `--max-credits` par mint restent **autoritaires** vs le `--method-caps` du garde (le garde borne par méthode, le tirage borne par
> crédits cumulés — les deux fail-closed) ; (3) l'étalonnage sonde (36 gTfA × 10 = 360 cr) est inchangé sous le client gardé.
> **Déclencheur : G7 de 1b-ii.** Les `fichier:ligne` de ce pli (`:449`, `:715/:721/:727`, `collect.ts:304/:443-446`, `:487`) sont
> **[ré-ancrés HEAD `7801083`, à RE-confirmer au G1 post-1b-ii]**.

---

## 12. Les DEUX questions posées à la sonde (C-7) et au tirage — non négociables (rappel)
- **Sonde** : `a` genesis MESURÉ (jamais date-estimé) ; `b` K=8 densités locales ; `c` estimateur pré-enregistré (Amendement 3(4),
  somme trapézoïdale, formule de grille REJETÉE) ; `d` sous-plafonds = estimations ; `g` `Σ calls_by_method.global == calls_used`.
  Écrit `sonde-report.json` + `budget.json` (`require_full_pages:true`, `pages:0`), **JAMAIS** un ledger.
- **Projection HORS PROCESS** (Amendement 3(1)(ii)) : `projectPagesAtFraction` à `f = 0,05` **et** (décision 125, coût 0) à `f = 0,25`
  et `f = 0,5` (à f=0,05 le linéaire sous-projette fortement si l'activité a crû [2nd avis advisor-defi Q3]) ; borne haute d'un mint >
  sous-plafond ⇒ ESCALADE avant le mint ; projection > 6 500 000 ⇒ STOP+ESCALADE.

---

## 13. HORS portée de CE G0 de course (déclaré) + items formés

**HORS portée** :
- **Course live U-6 / DNS / site / achats** : hors GO 119 [lu `docs/CHANTIERS.md:562`] ; U-6 a son propre critère de mort (0 consommateur SP en 90 j) [2nd avis advisor-marché].
- **Phase B univers (50 000 cr, décision 84)** : **sa propre fiche de GO** (`docs/G7-lot-t1a-iii-a1.md:22`, 1ʳᵉ course univers). **Q4
  (bundling) — ITEM FORMÉ, non tranché par 123/124/125** : proposé = SÉQUENCER explicitement entre go-1 et go-2 (sonde → phase B →
  tirage) **sans la BUNDLER en silence**, mais NON fusionnée dans les GO go-1/go-2 (qui sont des gates du crosscheck Bell). Décision
  investisseur au go-2.
- **Course cash Databento/Polygon** : plafond en requêtes au G0 de la course cash (ruling R-1, décision 115 déférée) — pas ici.
- **Rattachement des 8 603 RU solana-mainnet du 20/09** : item orchestrateur, déclencheur GARDE-HELIUS-1b (Chainstack, pas Helius).

**Items formés (déclencheur + porteur ; zéro dette nue)** :
1. **B-code** (vérif tête↔ancre dans `resumeFromLedger`+audit, ~70-120 lignes) — déclencheur « avant publication du verdict », après la course ; porteur worker course. (décision 124(a))
2. **Publication du ledger** (entrées par page) + **conditions d'usage Helius à relire** (listes `signature|slot`) — déclencheur : G0 de course / go-2 ; porteur orchestrateur. (décision 124(b))
3. **Audit C-5 second opérateur** (signatures des k≤25 pages vs Chainstack Solana) — déclencheur : audit §5 post-tirage ; porteur orchestrateur/G2. (décision 124(c))
4. **Amendement 4 CONDITIONNEL** (K=32, ~1 320 cr dans la réserve 1 500) — **SEULEMENT si la sonde K=8 sort large** ; **non retenu par
   défaut** ; petit lot G1→G7 ; déclencheur : go-1 rentre « large » ; porteur worker. (décision 125)
5. **Correction « 10 M »** dans `G0-b:236/:243` (superseded par 112) — note datée, docs seuls — déclencheur : ce pli ; porteur orchestrateur. (décision 125 ; §3.3)
6. **Reprise sans perte après STOP** à vérifier au **G1 1b** (le vrai risque d'un plafond strict est la reprise, pas la dépense) — se couple à C-G2-3 option (a) (§10). (décision 125)
7. **`projectPagesAtFraction` à f=0,25 et 0,5** (lecture ledger, coût 0) — déclencheur : chaque frontière de mint (§7). (décision 125)
8. **C-G2-3** (§10) — porteur 1b-ii proposé ; déclencheur : G1 1b-ii.
9. **Bande d'escalade `N_exact/N_projeté`** à figer numériquement au go-2 (§7). (décision investisseur au go-2)

---

## 14. Texte de communication publique (anglais, sans tiret, vocabulaire conforme `vocab-banned.json`) — PROPOSÉ

**Statut** : **pré-enregistré, publiable UNIQUEMENT sur un run réussi (`equal` 4/4 ∧ H1 stricte ∧ H3)** [lu `docs/G0-lot-t1a-ii-b3d-b.md:249`].
N'affirme **que ce que la course prouvera**. Vérifié machine contre `vocab-banned.json` (tous motifs globaux + `scan.*.banned`, drapeau
`i`) **et** absence de tiret/`—`/`–` = **0 hit** [mesuré, `MESURES.md` M-C7 ; `F:\tmp\bell-course\public-text.txt`].

> Bell publishes public, signed, recomputable facts about the rebase history of tokenized stock mints on Solana. For each of the four
> rebasing series, every multiplier update in the series is cross checked against a complete scan of every transaction of that mint,
> bounded to a committed slot. The head of the append only record chain is timestamped independently through OpenTimestamps, and that
> proof is anchored on Bitcoin, so anyone can confirm the date of the chain head without trusting the operator. This shows the
> anteriority of the chain head at the anchor date. It does not show where the pages came from, nor that any single reading is true.
> Bell attests origin, not endorsement, and names venues only as witnessed.

**Cartographie au libellé autorisé (décision 124(5))** : le libellé investisseur autorisé après B est **« counter-verified by a full-mint
scan; chain head timestamped independently (OpenTimestamps) »** ; le texte ci-dessus en est le rendu **sans tiret** et **sans « verified »
nu** (discipline Bell ADR-B0 : Bell atteste l'ORIGINE, jamais qu'un fait est « verified »/vrai ; « cross checked … complete scan » porte
la contre-vérification). Le mot **« independently »** — banni **sans** l'option B (advisor-marché Q2) — est **débloqué** par la décision 124.
**Résidu nommé** : c'est une **contre-vérification, pas une preuve irréfutable** ; le résidu mono-opérateur (même Helius) est réduit par
l'item C-5 (§5.3(c)) [2nd avis architecte Q3]. **Non tranché ici (F-2c C-4)** : nommer l'émetteur (xStocks/Backed) sur une **vitrine** est
une décision de storefront (le scope `site` bannit les marques tierces) — j'emploie « tokenized stock mints on Solana » ; le nommage
factuel « as witnessed » reste licite côté Bell (ADR-B0 bannit « partner », pas les venues). Décision storefront, pas ici.

---

## 15. Zéro dette (clôture du pli)
Chaque point ouvert est un **gate nommé** (§2, dont G-4 EN VOL), un **item formé à déclencheur** (§13, 9 items), une **procédure
pré-enregistrée** (ancrage §5, go-1/go-2 §6, points d'arrêt §7), ou une **décision investisseur reportée à un gate de course**
(bande d'escalade §7, bundling phase B §13-Q4, valeur du consentement large §6.2 — **aucune décision nouvelle rendue ici**). Aucun
« dû » nu, aucun contournement. La course reste **BLOQUÉE** tant que G-4 (4 sous-lots + G-4-bis) / G-6 / G-7 / G-8 / G-9 / G-10 (go-1
puis go-2) ne sont pas remplis ; les préalables OTS (lecture sur place + go investisseur) précèdent le premier ancrage (§5.2).
