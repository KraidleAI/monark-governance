# G0 (BROUILLON) — Bell T-1a-ii-b3d « course » : contre-vérification full-mint Helius (RÉSEAU, orchestrateur, R-20)

> **STATUT : BROUILLON de worker DOCS — tout est « proposé ».** Aucune adjudication ; aucune escalade rendue ; les questions
> investisseur sont posées en fin (§10). La course elle-même est **RÉSEAU, exécutée par l'ORCHESTRATEUR (R-20 : jamais le
> worker)** ; ce G0 ne produit **aucun code** (les artefacts de course vivent hors dépôt). **HORS portée du GO 119** (décision
> 119, `docs/CHANTIERS.md:562` : « course de contre-vérification Bell (~5,4 M cr) et question C-F-4 … un go propre le moment
> venu ») : ce brouillon PRÉPARE le go propre, il ne le remplace pas.

**Worker Opus 4.8 épinglé — modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe conforme, effort max ; Opus 5 banni).
**Provenance** : worker DOCS `claude-opus-4-8[1m]`, 2026-09-21, Bell temps 2 (décision 117) ; base `F:\Monark` `lot/etude-suite`
HEAD **`c0515d8`** (≥ `b38a399`) ; lecture seule ; écritures UNIQUEMENT sous `F:\tmp\bell-course\` ; aucun réseau, aucun
secret, rien sur `C:`. Réviseur = orchestrateur (R-21). Advisor intégré consulté une fois avant rédaction.

---

## 0. Niveaux de preuve (doc 03)
- **[lu]** = lu de première main à `fichier:ligne` du dépôt (rejouable).
- **[mesuré]** = sortie d'une commande rejouée par ce worker (git/awk/grep) — brute dans `MESURES.md`.
- **[2nd]** = chiffre lu dans un document (CHANTIERS/FAITS/dashboard) sans première main — jamais réutilisé comme fait de course.
- **[à mesurer au G1]** = projection R-25 de ce brouillon, à confirmer à la mesure.

---

## 1. Objet et ce que la course « branche »

**Objet** [lu `docs/G0-lot-t1a-ii-b3d-b.md:231-241`, `docs/PLI-lot-t1a-ii-b3d.md:325`] : tirer le **scan full-mint complet croisé**
des 4 mints (TSLAx, AAPLx, NVDAx, SPYx) borné à l'`oracle_slot` committé de chaque série, et **contre-vérifier** l'ensemble
43/x + les hand-offs SetAuthority contre la série hybride committée ; **toute divergence = STOP** (décision 67). C'est la
« contre-vérification indépendante » des séries fondatrices.

**Séquence proposée** (une fois DÉBLOQUÉE, calque `docs/G0-lot-t1a-ii-b3d-b.md:241`) :
**sonde de densité C-7** (`--rebase-density`, a,b,c,d,g, 4 mints, même `--out`) → **[T-1a-iii phase B univers, 50 000 cr, ledger
DÉDIÉ, décision 84]** → **tirage full-mint** (ordre TSLAx→AAPLx→NVDAx→SPYx, sous-plafonds cumulatifs Amendement 3, reprise
idempotente L-b1a) → **audit §5** (`verifyLedgerChain` ; `Δdashboard ≤ credits_recomputed`, borné par `retries_by_method`).
**AUCUN autre consommateur Helius pendant la sonde et le tirage** (worktree épinglé au sha de fusion de b1) [lu].

**Branchement (règle Branchement)** : le consommateur servi de la sonde/projection est **l'orchestrateur hors process** — il
n'existe **qu'à la course**. Bell reste `upcoming` dans TOUT registre public (site/README/skill/export) jusqu'à la 1ʳᵉ course
RAPPROCHÉE (décision 117, temps 2) [lu `docs/G7-lot-t1a-ii-b3d-b1b.md:24-25`, `docs/G0-lot-garde-helius-1b.md:220-221`].

---

## 2. Exigences d'entrée énumérées → gate rempli / item formé (proposé)

| # | Exigence d'entrée (source) | État mesuré / lu | Traitement (proposé) |
|---|---|---|---|
| **G-1** | **Amendement 3 committé SEUL** avant la sonde [lu `docs/PLI…b3d.md:376`] | **FAIT `6c9fdaa`** [mesuré : ancêtre de HEAD, 1 fichier +26 ; bloc sha `2a12f19c…` = texte (4) corrigé ; §2 sha `7071484f…` intact] | **REMPLI**. Voir `AMENDEMENT-3-texte-a-committer.md`. Rafraîchir les 5 lignes de registre stale (item A). |
| **G-2** | **b1b fusionné** (densité/projection, helper K=8) | **FAIT `f459cc2`** [mesuré ancêtre ; G7 696 pass/1 skip, eslint 0, ratchet 69/69] | **REMPLI** |
| **G-3** | **condition (f) fusionnée** (ledger chaîné engage le payload) | **FAIT `1fc89a9`** [mesuré ancêtre ; `docs/G7-lot-t1a-ii-b3d-f.md`] | **REMPLI** |
| **G-4** | **GARDE-HELIUS-1b fusionné** (Bell consomme `openGuardedClient` ; migration CONV-2, phantom-fresh) [lu `docs/G7-lot-t1a-iii-a1.md:22`(iii), `docs/G7-lot-t1a-ii-b3d-b1b.md:25`] | **NON REMPLI** — plan PLIÉ `docs/G0-lot-garde-helius-1b.md` (4 sous-lots 1b-0..1b-iii) ; **s'ouvre APRÈS la fusion de 2b-ii** [lu :22,49] ; 2b-ii en G1 (`b38a399`) | **GATE OUVERT**. Bloque la course. |
| **G-5** | **-iii-a1-bis fusionné** (univers Solana, ledger chaîné) [lu `docs/G7-lot-t1a-iii-a1.md:22`(i)] | **FAIT** — merge **`780a631`** (G7 `dac433a`, oracle arbre fusionné 720/0, R-25 721) [mesuré : ancêtre de HEAD] | **REMPLI** |
| **G-6** | **HELIUS-1 rapproché** — conditions de reprise (a)–(e) [lu `docs/G0…b3d-b.md:233-239`] : (a) audit attribuant les crédits + critère de GO pré-enregistré ; (b) 2 lectures dashboard sans process MONARK (débit de fond = 0) ; (c) PLI §4 rebasé sur le chiffre du dashboard ; (d) 1ʳᵉ sonde = ÉTALONNAGE ; (e) date 2026-10-15 sous réserve | (f) tenue par -f `1fc89a9` ; (a)–(e) = actes orchestrateur à la reprise | **GATE** — floor lu sur place AVANT la course (décision 112) |
| **G-7** | **`BELL_SOLANA_RPC` + `HELIUS_API_KEY`** posées par l'investisseur [lu `docs/G0-lot-garde-helius-1b.md:362` : ABSENTES de l'env, CI sans elles `docs/CHANTIERS.md:344`] | non posées | **ITEM investisseur** (kit §10.5) — à poser AVANT la course ; aucune clé lue par un worker |
| **G-8** | **`HELIUS_LEDGER_DIR` pré-existant, `HELIUS_CYCLE_ID`, floor lu sur place** (décision 114) [lu `docs/CHANTIERS.md:480` : `F:\monark-ledger\` créé] | dossier créé | **ITEM orchestrateur** — `HELIUS_LEDGER_DIR` posé hors dépôt ; floor épinglé au dashboard (aujourd'hui 60 938 [2nd]) |
| **G-9** | **`require_full_pages` prior — C-G2-3 de b1b** [lu `docs/G7-lot-t1a-ii-b3d-b1b.md:20`] : `runDensityProbeCli` (`rebase-crosscheck.ts` **pré-f `:699/705`, HEAD `:721/727`**) écrit `require_full_pages` **sans lire** `prior.requireFullPages` ⇒ une sonde stricte sur un `--out` lâche masquerait la garde mixed-mode du tirage | déclencheur nommé « G0 de la course » ; porteur « lot -f ou b1a-bis » — **-f clos sans le porter** | **À TRANCHER ici** (§6) |
| **G-10** | **GO investisseur** (décision 119 exclut CETTE course) [lu `docs/CHANTIERS.md:562`] | non donné | **ITEM investisseur** — fiche de GO §5, questions §10 |

**Aucune de ces lignes n'est un « dû » nu** : chacune est un gate rempli, un item à déclencheur nommé, ou une question posée (§10).

---

## 3. Plafond de la course — RECOMPUTE de première main, et l'échelle des trois plafonds

### 3.1 Recompute du ~5,4 M cr depuis les mesures -b3a-2 (débit récent × 465 j) et le barème Helius [lu, mesuré]

Barème Helius [lu FAITS `F:\PRODUITS\etude-2026-09-21\helius-audit\FAITS-tarification-helius-2026-09-21.md` + décision 55] :
**gTfA (`getTransactionsForAddress`, archival) = 10 cr / appel, 1 000 tx / appel** ; `getTransaction`/`getSignaturesForAddress`/
`getAccountInfo` = 1 cr. Le scan full-mint tire les CORPS par gTfA `full` ⇒ coût dominant = `⌈N/1000⌉ × 10`.

Débits récents MESURÉS (course de trajectoire -b3a-2, [2nd] `docs/PLI-lot-t1a-ii-b3a.md:169-175`) extrapolés à l'âge du mint
(~465 j depuis genesis 2025-06-10/11) — **recompute de première main** [mesuré, `MESURES.md` M-B4] :

| mint | débit/j [2nd] | N = débit×465 | pages = ⌈N/1000⌉ | corps gTfA = pages×10 |
|---|---|---|---|---|
| TSLAx | 54 670 | 25 421 550 | 25 422 | **254 220 cr** |
| AAPLx | 110 427 | 51 348 555 | 51 349 | **513 490 cr** |
| NVDAx | 359 082 | 166 973 130 | 166 974 | **1 669 740 cr** |
| SPYx | 635 832 | 295 661 880 | 295 662 | **2 956 620 cr** |
| **Σ corps full-mint** | | | | **5 394 070 cr** |

**Écart au chiffre enshrined** : PLI-b3a / Amendement 3(3) fige **5 394 670 cr** (sous-plafonds 254 670 / 513 000 / 1 670 000 /
2 957 000). **Δ = 600 cr**, pur arrondi de « ~465 j » et des `⌈⌉` par mint — les deux sont cohérents à l'arrondi près. **Ce sont
des ESTIMATIONS PONCTUELLES** (Amendement 3(3)) : extrapolation d'un débit mesuré sur des fenêtres **1,43–19,7 j** à 465 j ⇒
un coût réel > sous-plafond ⇒ **faux STOP fail-closed plausible** (STOP+ESCALADE, jamais une surdépense).

### 3.2 L'échelle des trois plafonds (à ne pas confondre) et le cumul de cycle

| Plafond | Valeur | Nature | Source |
|---|---|---|---|
| **Σ sous-plafonds + sonde** (SPYx cumulative `--max-credits`) | **5 396 170 cr** (= 1 500 + 5 394 670) | ESTIMATION du coût du tirage, fail-closed par sous-plafond | Amendement 3(2), PLI:388 [lu] |
| **STOP H6 (projection)** | **6 500 000 cr** | garde de projection (§2 GELÉ : `projection > 6 500 000 ⇒ STOP+ESCALADE`) ; `--max-credits` par commande 6 497 500 | PLI §2 H6, Amendement 3(1)(ii) [lu] |
| **Plafond de CYCLE Helius** | **8 000 000 cr** (80 % du plan 10 M) | garde anti-BUG fail-closed, non levée par un GO (leçon HELIUS-1) | **décision 112** [lu `docs/CHANTIERS.md:478`] |

**Cumul de cycle pire-cas** [mesuré, `MESURES.md` M-B4] : floor du jour **60 938** [2nd, décision 112] + sonde ~480
(36 gTfA × 10 cr) + **phase B univers 50 000** (décision 84) + corps 5 394 070 + audit ~1 000 ≈ **5 506 488 cr**.
- **Headroom sous 8 M au-dessus du floor** = 8 000 000 − 60 938 = **7 939 062 cr**.
- **Marge du cumul pire-cas sous 8 M** ≈ 8 000 000 − 5 506 488 ≈ **2 493 512 cr**.
- Le floor doit être **RE-LU sur place** au dashboard AVANT la course (décision 112 ; « aujourd'hui 60 938 » est du jour, [2nd]).

### 3.3 Défaut de doc à corriger (proposé, docs seuls) — plafond de cycle STALE

`docs/G0-lot-t1a-ii-b3d-b.md:236` (« cumul pire cas ≈ **7 610 938 / 10 M** (marge ≈ 2,39 M) ») et `:243` (routage C-4 « cumul
cycle **> 10 M** ; autoscaling … arrêt système à 10 M ») **datent d'avant la décision 112** (plafond de cycle abaissé à **8 M**,
80 % du plan). **Proposé** : note datée en tête du bloc course de G0-b renvoyant à la décision 112 (8 M fail-closed ; floor
épinglé avant chaque course), et le routage C-4 lu « cumul > 8 M » — sans réécrire le corps (calque C-V-5). `error_origin`
proposé : rédacteur du G0-b (antérieur à 112). Item formé, pas un « dû » nu.

---

## 4. Le rapprochement Helius (protocole, décision 113) — proposé

**Décision 113** [lu `docs/CHANTIERS.md:479`] : **borne dure `Δdashboard ≤ ledger_run`** (sinon incident, STOP) **+ bande souple
`ledger_run − Δdashboard ≤ max(50 cr, 0,5 % du run)`**, pré-enregistrée AVANT la 1ʳᵉ course.
- **Bande souple pour CETTE course** = max(50 ; 0,5 % × ~5,4 M) ≈ **26 973 cr** [mesuré]. `Δdashboard` = (lecture après) −
  (lecture avant), les deux lues par l'investisseur/orchestrateur sur place ; `ledger_run` = crédits recomputés du run
  (`Σ requêtes × tarif`, borné par `retries_by_method`).
- **Étalonnage (condition (d))** : la **sonde de densité** est le premier acte à coût borné — **36 à 48 gTfA calls**
  (nominal 1 + K=8 par mint × 4 = **36 ⇒ 360 cr** ; plafond pré-enregistré Amendement 3(3) = **48 appels / 480 cr** avec les
  reprises). `ledger_run` = crédits **recomputés du ledger de sonde** (`Σ méthode × tarif`, borné par `retries_by_method`,
  condition (d) `docs/G0-lot-t1a-ii-b3d-b.md:237`) — **PAS** un « 360 exact » (une reprise fait monter le compte réel, dans la
  bande). La borne dure 113 (`Δdashboard ≤ ledger_run`) s'applique à CE `ledger_run` ; une divergence hors bande ⇒ incident
  AVANT le tirage.
- **Fenêtre** : Bell (Solana) devrait être le seul consommateur **Helius** (Narabi/Ukemi = Chainstack, opérateur distinct)
  [lu `docs/CHANTIERS.md:570-571`] — **mais c'est une HYPOTHÈSE, pas un fait** : HELIUS-1 = ~49 675 cr **non attribués**, et une
  **« sonde VPS Bell » est déployée** (`docs/CHANTIERS.md:560` E-5) dont l'opérateur/le débit de fond n'est pas vérifié ici.
  ⇒ le « pas d'exclusion de fenêtre côté Helius » n'est licite **qu'après** la condition (b) MESURÉE = **débit de fond 0** (2
  lectures dashboard espacées, aucun process MONARK) **immédiatement avant** la sonde ; sinon incident. Le worktree épinglé
  garantit « aucun autre consommateur Helius **du côté de l'orchestrateur** pendant la sonde et le tirage » — il ne couvre pas
  un consommateur VPS/tiers, d'où (b).

---

## 5. Contenu exigé de la FICHE DE GO de course (investisseur) — repris et adapté

Source [lu `docs/G7-lot-t1a-iii-a1.md:22`, amendement daté 2026-09-21T16:20Z] : la fiche de GO doit porter **(a)** la liste des
gates, **(b)** la mention du flake local Windows et de sa règle de relance, **(c)** le plafond de la course, **(d)** l'item de
rejeu checkpoint-2 post-course depuis le brut sha-pinné. Adaptation proposée à CETTE course :

- **(a) Liste des gates** (§2 ci-dessus) : G-4 GARDE-HELIUS-1b fusionné · G-5 -iii-a1-bis fusionné · G-6 HELIUS-1 rapproché
  (a)–(e) + floor lu sur place · G-7 `BELL_SOLANA_RPC`/`HELIUS_API_KEY` posées · G-8 `HELIUS_LEDGER_DIR`/`HELIUS_CYCLE_ID`
  (décision 114) · G-9 C-G2-3 tranchée · **les deux questions §10 tranchées** · G-1/2/3 déjà remplis.
- **(b) Flake local Windows + relance** [lu `docs/G7-lot-t1a-iii-a1.md:22`(amendt), C-G2D-1 : défaut amont Node/Windows
  `nodejs/node#56645`] : critère D4 amendé = **0 échec non signé** ; relance locale Windows seulement ; **aucun retry CI**. (La
  course étant réseau/orchestrateur, ce point vise les oracles offline rejoués, pas le tirage.)
- **(c) Plafond de la course** = l'échelle §3.2 : tirage fail-closed à **5 396 170 cr** (sous-plafonds cumulatifs) ; STOP H6 à
  **6 500 000** ; **jamais** au-delà du plafond de cycle **8 000 000** (décision 112) ; floor du jour re-lu ; phase B univers
  **50 000 cr** (ledger dédié) comptée à part.
- **(d) Rejeu post-course** : checkpoint-2 rejoué **depuis le brut sha-pinné** ; **+ item 7 du registre PLI** (rejeu
  `committed_artifacts_replay` sur artefacts écrits PAR LE CLI, `docs/G7-lot-t1a-ii-b3d-b1a.md:21`) ; **+ C-V-9** (`crosscheck-*.json`
  lus tels qu'écrits par le CLI, `docs/CHECKPOINT2-lot-t1a-ii-b3d-a.md:25`) [lu].

---

## 6. C-G2-3 (`require_full_pages` prior non lu) — à trancher, deux options (proposé)

Le défaut [lu `docs/G7-lot-t1a-ii-b3d-b1b.md:20` (réfs pré-f `:699/705`) ; source à HEAD `apps/bell/src/rebase-crosscheck.ts:721,727`, fonction `:715`] : `runDensityProbeCli`
**écrit** `require_full_pages` mais ne **lit pas** `prior.requireFullPages` (contrairement à `runRebaseCrosscheckCli:643-644`
qui, lui, throw fail-closed si un `--out` n'est pas prouvé `require_full_pages:true`). Aucun chemin canonique ne l'atteint
(sonde EN PREMIER, audit sur `--out` DISTINCT). Le porteur nommé était « lot -f ou b1a-bis » — **-f est clos (`1fc89a9`) sans
l'avoir porté** ⇒ à trancher ici.

- **Option (a) — porteur code = GARDE-HELIUS-1b sous-lot 1b-ii** [proposé] : 1b-ii migre déjà `rebase-crosscheck.ts` (`:715+`,
  suppr. `callsByMethod`, crédits dérivés) ⇒ y ajouter la lecture symétrique du prior dans `runDensityProbeCli` (≈ 3 lignes,
  calque `:643-644`) + test `bell_density_probe_reads_prior_require_full_pages` + mutant. **R-25 ≈ 25-40 [à mesurer au G1]**,
  absorbé dans 1b-ii.
- **Option (b) — gate procédural (R-25 = 0)** [proposé] : la sonde tourne sur un `--out` **FRAIS**, et la fiche de GO impose
  d'ASSERTER `budget.json` absent avant `--rebase-density` (aucun héritage de prior lâche). Documentaire, aucun code.

**Proposé** : option (a) si 1b-ii est de toute façon sur le chemin critique (elle l'est, G-4) — sinon (b). Une seule à retenir.

---

## 7. Interaction avec GARDE-HELIUS-1b (1b-ii réécrit la voie budgétaire dont dépendent les sous-plafonds) — proposé

**Attention (R-21)** : les sous-plafonds de l'Amendement 3 (`--max-credits` fail-closed `collect.ts:303`) et les 8 tests
`bell_density_*`/`bell_h6_*` ont été **vérifiés VERTS AVANT 1b** (oracle b1b `f459cc2`). Or **1b-ii** [lu
`docs/G0-lot-garde-helius-1b.md:111,214,263`] : (i) **supprime `callsByMethod` local** de `rebase-crosscheck.ts`, dérive les
crédits de `client.spent()` (IT-3) ; (ii) fait de **`--method-caps`** (table des **4 méthodes**, gTfA BAS) un cap INTERNE du
garde ; (iii) déplace/renomme des `fichier:ligne`. ⇒ **exigence d'entrée proposée (G-4-bis)** :

> **Re-vérifier, sur l'arbre FUSIONNÉ post-1b-ii**, que (1) les 8 tests `bell_density_*`/`bell_h6_*` restent VERTS ; (2) le
> mécanisme des sous-plafonds `--max-credits` par mint reste **autoritaire** sur le `--method-caps` du garde (le garde borne
> par méthode, le tirage borne par crédits cumulés — les deux fail-closed, jamais l'un masquant l'autre) ; (3) l'étalonnage
> sonde (36 gTfA × 10 = 360 cr) est inchangé sous le client gardé. **Déclencheur : G7 de 1b-ii.** Les `fichier:ligne` de ce
> brouillon (`:721-727`, `:303`, `:715+`) sont **[à ré-ancrer au G1]** sur la base post-1b-ii.

---

## 8. Les DEUX questions posées à la sonde (C-7) et au tirage — non négociables (rappel)
- **Sonde** : `a` genesis MESURÉ (jamais date-estimé) ; `b` K=8 densités locales ; `c` estimateur pré-enregistré (Amendement
  3(4)) ; `d` sous-plafonds = estimations ; `g` `Σ calls_by_method.global == calls_used`. Écrit `sonde-report.json` +
  `budget.json` (`require_full_pages:true`, `pages:0`), **JAMAIS** un ledger.
- **Projection HORS PROCESS** (Amendement 3(1)(ii)) : l'orchestrateur exécute `projectPagesAtFraction` à `f = 0,05` ; si borne
  haute de l'intervalle d'un mint > son sous-plafond ⇒ **ESCALADE-INVESTISSEUR AVANT de démarrer le mint** ; si `projection >
  6 500 000` ⇒ STOP+ESCALADE.

---

## 9. HORS portée de CE G0 de course (déclaré)
- **Phase B univers (50 000 cr, décision 84)** : elle a **sa propre fiche de GO** (`docs/G7-lot-t1a-iii-a1.md:22`, 1ʳᵉ course
  univers). **Proposé** : la SÉQUENCER explicitement (sonde → phase B → tirage) sans la BUNDLER en silence — le bundling est
  une **question de clôture** (§10-Q4).
- **Course cash Databento/Polygon** : plafond en requêtes au **G0 de la course cash** (ruling R-1, décision 115 déférée) — pas ici.
- **Site / DNS / achats / U-6** : hors portée du GO 119 [lu `docs/CHANTIERS.md:562`].
- **Rattachement des 8 603 RU solana-mainnet du 20/09** : item orchestrateur, déclencheur GARDE-HELIUS-1b (Chainstack, pas Helius).

---

## 10. QUESTIONS INVESTISSEUR (posées avec leur coût ; à trancher AVANT la course — hors GO 119)

**Q1 — C-F-4, ancrage externe par page (décision de VALEUR, escalade pré-enregistrée)** :
> Sur un verdict qui engage ~5,4 M cr, **acceptez-vous le résidu C-F-4** — writer unique, disque orchestrateur : `resumeFromLedger`
> n'ancre `headSha` à **aucune** valeur externe, donc un record **entièrement reforgé** (payload + `payload_sha256` + `entry_sha256`
> recalculés cohérents) est accepté, **dès le 1ᵉʳ record et à toute profondeur** (mesuré `docs/G2-lot-t1a-ii-b3d-f.md:85`) —
> **[option A, R-25 = 0]** ; **OU** exigez-vous un **ancrage externe** de la tête de chaîne (`entry_sha256`/`ledger_sha256`)
> publié dans un puits externe (journal de sonde / CHANTIERS) et re-vérifié à l'audit **[option B, R-25 ≈ 70-120, à mesurer au
> G1]** ?
- **Réalité de volume (à dire dans la question)** : « par page » littérale = **Σ sous-plafonds / 10 ≈ 539 407 pages** (SPYx seul
  ~295 662) [mesuré] ⇒ une publication d'une ligne par page dans git/CHANTIERS est **infaisable**, et un fichier d'ancrage sur
  le **même disque** ne défait pas le même éditeur (`docs/G2-lot-t1a-ii-b3d-f.md:85`). **L'option B doit déclarer sa granularité**
  (par-mint à la borne / périodique vers un puits **externe** au disque orchestrateur), jamais une ligne par page.
- **Base du chiffrage R-25 (grep)** [mesuré] : voie d'écriture localisée — `onPage` `rebase-crosscheck.ts:668-674`,
  `resumeFromLedger` `:580-592`, audit dans `runRebaseCrosscheckCli` `:633-713`. Un ancrage de tête + vérif de reprise/audit +
  1 test + 1 mutant ≈ **70-120 ins+del** ; **borne haute comparable = R-25 255 mesuré du lot -f** (un champ de core chaîné + ses
  tests, même fichier, `docs/G7-lot-t1a-ii-b3d-f.md:6`) — l'option B reste sous cette borne. **Option A = 0.**

**Q2 — Plafond de la course (~5,4 M cr Helius)** :
> **Autorisez-vous** la course de contre-vérification à dépenser **jusqu'au plafond pré-enregistré de 5 396 170 cr Helius**
> (Σ sous-plafonds cumulatifs Amendement 3 + 1 500 sonde ; recompute -b3a-2 de première main = 5 394 070, enshrined 5 394 670,
> **Δ 600 = arrondi**), **fail-closed par sous-plafond** (tout dépassement d'un sous-plafond ⇒ STOP + ESCALADE, jamais une
> surdépense), la **sonde K=8** remplaçant l'extrapolation débit×465 j **avant chaque mint** (Amendement 3(1)(i)), le **cumul de
> cycle pire-cas ≈ 5,51 M** restant sous le **plafond de cycle 8 M (décision 112)** — floor du jour **60 938** re-lu sur place,
> marge ≈ **2,49 M** — et la **phase B univers 50 000 cr** (ledger dédié) comptée à part ?

**Q3 — Étalonnage HELIUS-1 (rappel, pas une nouvelle question mais un point de GO)** : confirmez la reprise HELIUS-1 (a)–(e)
et la lecture du floor sur place, l'autoscaling restant **Off** (arrêt Helius impossible côté facture ; le cap 8 M reste la garde
interne, décision 112 + FAITS).

**Q4 — Bundling de la phase B univers** : la phase B (50 000 cr, décision 84, fiche de GO propre) doit-elle être **séquencée sous
le même GO** que le tirage (sonde → phase B → tirage, un seul go), ou faire l'objet d'un go séparé ? (Proposé : séquencée sous
le même GO, mais **explicitement**, pour ne pas la bundler en silence.)

**Q5 — Fenêtre de cycle (échéance dure)** : le cycle Helius court **jusqu'au 19 oct** ; le tirage ~45 h + marge 48 h ⇒ **début au
plus tard ~15 oct** [lu `docs/G0-lot-t1a-ii-b3d-b.md:238`]. Or **G-4 (GARDE-HELIUS-1b) = 4 sous-lots non ouverts**, chacun
G1→G2‖cp-2→G7, + la re-vérif G-4-bis (§7), après la fusion de 2b-ii. **Si la course glisse au-delà du 19 oct** : nouveau cycle
⇒ **le floor se réinitialise** ⇒ l'arithmétique Q2 (floor 60 938) **change** et doit être re-posée sur le floor du cycle suivant ;
un tirage **à cheval sur le 19 oct** est une **ESCALADE C-4** [lu `docs/G0-lot-t1a-ii-b3d-b.md:243`]. **Proposé** : viser un début
avant le **15 oct**, sinon re-poser Q2 sur le floor du nouveau cycle et ne jamais chevaucher la bascule de cycle.

---

## 11. Zéro dette (clôture du brouillon)
Chaque point ouvert est un **gate nommé** (§2), un **item formé à déclencheur** (registre stale A ; défaut doc plafond 10 M→8 M
§3.3 ; C-G2-3 §6 ; re-vérif post-1b-ii §7 ; rattachement 8 603 RU §9), ou une **question investisseur chiffrée** (§10). Aucun
« dû » nu, aucun contournement. La course reste **BLOQUÉE** tant que G-4/G-5/G-6/G-7/G-8/G-9/G-10 ne sont pas remplis.
