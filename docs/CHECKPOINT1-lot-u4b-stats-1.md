# Checkpoint-1 U-4b-STATS-1 — APPROUVE-AVEC-CORRECTIONS (C-1..C-12)

Modèle résolu : claude-fable-5-1

# Checkpoint-1 (PLAN) — lot U-4b-STATS-1 (outils hors ligne H-3/H-4/H-6, ruling R-K)

## 1. Artefacts lus (lecture seule ; Bash de vérification seule, AM-2 — aucune écriture, aucun réseau ; `git status` propre avant et après ; aucun rejeu sous `F:\tmp` nécessaire à ce checkpoint)

- `F:\Monark\docs\PLAN-u4b-prereg.md` :64-69 (définitions D1-D3), :73-106 (§Y, H-0..H-7), :349-374 (§7, go U-6 :359) — sha256 recomputé `1971d9b14ce0…5892f49` = attendu.
- `F:\Monark\docs\adr\ADR-U4b-calibration-episode-frais.md` :180-293 (amendement décision 126 : §3 sha, §4 digests/q̂, §5 clauses H-3/H-2bis).
- `F:\Monark\docs\G0-lot-u4b.md` :161 (H-3 initial `k=2`), :164 (H-6 → ADR-U4 :104-112), :245, :328 (C-11).
- `F:\Monark\docs\adr\ADR-U4-book-et-calibration.md` :100-112 (H-6 : « valeur servie » = `getAssetPrice` aux blocs de liquidation, 106/107 ∈ série, retard 1-3 events, condition C-V-5 « ∈ events ∪ {p0} »).
- `F:\Monark\docs\course-ukemi\RUNBOOK-course-ukemi-2026-09-22.md` :47 (R-K), :344-357 (labeler, `labels_no_quorum`), :435-444 (6d, sidecar 6), :484-491 (§8, go U-6), :522-524 (C-6).
- `F:\Monark\docs\CHANTIERS.md` :604 (ruling Q6), :836-860 (décisions 135-137 ; R-K :846).
- `F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\AVIS-advisor-defi-prereg-u4b-1b-2026-09-21.md` :66-96 (§Q6, source du critère H-3 ; chiffres mesurés 3,6/5,8/6,3/10,4 %, 11/99, 24/189).
- `F:\Monark\scripts\census\u4b\u4b-scores.mjs` (gelé ; sha LF recomputé `2f9a31f6…f51445c0` = ADR §3 / prereg §2), `scripts\census\u3-realized.mjs` :600-625 (lignes `call`/`price`).
- Fixtures : `apps\sentinel\test\fixtures\ukemi\u4b\PROVENANCE-u4b.md` (+ `U4b-scores-e2.jsonl` sha `301d39fa…`), `apps\sentinel\test\fixtures\ukemi\u3\U3-inputs.jsonl`, `U3-realized.jsonl`.
- `F:\Monark\scripts\grep-forbidden.mjs` + `vocab-banned.json` (motifs globaux A-9), `package.json` :16-23.
- Plan : verbatim de la mission G1 transmis dans le prompt (aucun fichier de plan n'existe dans le dépôt — `grep STATS-1|u4b-hyp` = `docs/CHANTIERS.md` seul).

**Mesures propres (vérification)** : atomes en 0 par strate e2 = 344/363, 120/148, 38/46, 7/8 (= prereg :100) ; `p` du code gelé sur e2 = 361/148/47/9, poolé 561 (`cell_a.qhat` = `1861718113769`) ; `Math.ceil((n+1)*0.99)` vs `⌈99(n+1)/100⌉` : 0 divergence pour n ∈ [1, 20 000] ; 107 lignes `kind:"price"` WETH dans `U3-inputs.jsonl` (= les « 107 valeurs servies » d'ADR-U4) ; 239 lignes `call` e2, 28 `deficit` e2, 14 `reserve` ; `census` du code gelé n'a **aucune** clé `labels_no_quorum` ; `F:/course-ukemi/{reduce,record,offline}` **n'existent pas** (aucun brut frais : le lot est pré-donnée) ; aucune branche/worktree `stats` encore créée.

## 2. Checklist

### CA-1 (falsifiabilité, une phrase par tâche) — **conforme avec corrections**
Reformulation : (h3) « pour chaque strate k servie et pour la cellule A poolée, compter K = #{scores e2 `score_a` ≤ q̂_frais}, comparer à BB(n_e2, p, n+1−p) en queue basse, NON ssi p-value ≤ 5 % » ; (h4) « par strate, part de Y des appels après le premier (médiane, Σ) + fraction de comptes multi-appels vs 5 % » ; (h6) « chaque valeur servie ∈ events ∪ {p0}, retard ≤ 3 events » ; (report) « agrégat + valeur du prédicat :359 ». Les critères sont localisables et testables. Défauts : le verdict annoncé « OUI/NON » est incomplet (le prereg définit 4 issues, cf. C-1) ; `labels_no_quorum` n'a **aucun producteur** de code (cf. C-2).

### (a) FIDÉLITÉ de H-3 — **suffisamment précise, sous 3 épinglages pré-donnée (pas de décision de valeur)**
Fixé par le prereg :100 + avis Q6 :71-72 : statistique K = #{s_e2 ≤ q̂_frais} ; loi nulle BB(n_e2, a = p, b = n+1−p) avec n = taille fraîche de la strate (ou cellule) et p = ⌈(n+1)·0,99⌉ (α_calib = 0,01 ; H-2bis : p = n si n < 199 ⇒ BB(n_e2, n, 1)) ; sens = **queue basse** (« couverture trop basse ») ; niveau = 5 % ; référence = lignes `score_a` de `U4b-scores-e2.jsonl` sha `301d39fa…` ; couverture fermée `s ≤ q̂` ; strate fraîche n < 100 ⇒ `under_calib` (q̂ null ⇒ H-3 non applicable) ; strate e2 n < 50 ⇒ « non testable, rapporté » (strates 2 et 3 : **toujours**, 46 et 8). Conservatisme sous atomes : K domine stochastiquement la loi continue (couverture ≥ 1−α tient sans continuité, Barber 2023 [lu] / Vovk) ⇒ test queue-basse valide, sans puissance excédentaire — à citer dans l'ADR. Restent à épingler par **ruling orchestrateur journalisé AVANT toute donnée fraîche** (même patron que R-A..R-O ; aucun n'entre dans :359 ⇒ pas d'escalade) : (i) « cellule A poolée » = `meta.cell_a.qhat`/`cell_a.p` du producteur gelé (`u4b-scores.mjs:266`) ; (ii) frontière : rejet ssi p-value **≤** 0,05 (convention du test exact, source à citer) ; (iii) `p`, `n`, `q̂` **lus** de la méta produite par le code gelé (`cell_a.strata[k].{n,p,qhat}`), jamais recomputés seuls (assert d'égalité avec l'expression gelée). Une interprétation choisie par le worker sans ruling = STOP + demande formée (le plan le dit déjà).

### CA-2 (valeur/périmètre) — **conforme**
Rien de servi ne dépend des constantes H-3/H-4/H-5 (prereg :106). Le seul point à enjeu est le prédicat :359, désormais **appliqué mécaniquement** (décision 137) : le `report` en devient l'**entrée de décision**, non un simple rapport — d'où C-4. Aucune décision de valeur nouvelle dans le plan.

### CA-3 (ADR, gates) — **conforme avec correction**
ADR-U4b amendement prévu avec sources [lu] ; prereg GELÉ non modifié ; 9 fichiers gelés intacts (à recomputer au cp-2 : `2f9a31f6…`, labeler `cb020425…`, prereg `1971d9b1…`). Observation hors lot : `ADR-U4b…md:207` porte encore le labeler `755b3a38…` alors que le prereg §Y :83 pinne `cb020425…` post -1b-1 — item orchestrateur (cohérence documentaire), pas une correction de ce lot.

### CA-4 (fan-out) — **conforme**
Mono-worker + relecteur G2 en contexte frais + validateur : fan-out justifié par l'indépendance de vérification seule.

### CA-5 (MAST) — **correction** : le plan verbatim ne nomme aucun mode (cf. C-10).

### (b) anti-sélection sur l'issue — **conforme sous C-3/C-4/C-10**
Constantes en dur + provenance ; **aucun** flag `--alpha/--level/--side/--ref/--smoothed` ; flag inconnu ⇒ throw ; sha de la fixture de référence vérifié à l'exécution (fail-closed) ; l'alternative « smoothed/tie-break randomisé » du prereg :100 n'est PAS adoptée ⇒ ne doit pas exister dans l'outil. La condition réelle d'anti-sélection est l'**ordre** : lot fusionné et sha de l'outil consigné avant que `U4b-scores-<EP>.jsonl` existe (C-4).

### (c) go U-6 :359 — **conforme sous C-1/C-2/C-4**
Le `report` produit `{h3_no_NON_on_served_strata, labels_no_quorum_unresolved, condition_satisfied}` + tous les nombres d'entrée ; jamais le jeton « GO ».

### (d) A-9 — **correction C-9** (test via la vraie gate, pas une liste manuelle).

### CA-11 (branchement) — **correction C-8** : sans réécriture du RUNBOOK (:439-440, :444, :488 disent « aucun outil ⇒ R-K »), le seul consommateur serait un test.

### CA-10 — n-a (aucun argument de vitesse dans le plan).

## 3. Décision : **APPROUVE-AVEC-CORRECTIONS** (liste fermée, à porter dans la mission G1 et vérifiées au cp-2)

- **C-1** Verdict H-3 = énumération fermée `{OUI, NON, UNDER_CALIB (n_frais < 100), NON_TESTABLE_E2 (n_e2 < 50)}` par strate + poolé ; le prédicat :359 ne compte **NON** que sur les strates **servies** (n_frais ≥ 100) ; test : `UNDER_CALIB`/`NON_TESTABLE_E2` ne font jamais basculer le prédicat.
- **C-2** `report --u3-realized <U3-realized-<EP>.jsonl>` : `labels_no_quorum_unresolved` = #lignes (event EP, `repayment_base === null`) (`u3-realized.mjs:226`, RUNBOOK :344) ; `residual ∋ no_quorum` compté à part ; l'ADR nomme laquelle est « non résolus ». Le plan « depuis `census` » est faux pour ce compteur (mesuré : clé absente).
- **C-3** `n`, `p`, `q̂` lus de la méta du producteur gelé + assert vs `Math.ceil((n+1)*0.99)` ; poolé = `meta.cell_a.qhat` ; frontière « ≤ 0,05 » ; arithmétique exacte (rationnels BigInt) — les trois épinglés par ruling orchestrateur journalisé pré-donnée, cités ligne à ligne dans l'ADR.
- **C-4** Ordre pré-donnée : fusion + sha LF de `u4b-hyp.mjs` écrit dans la provenance du rapport ET au sidecar 6 **avant** l'étape 6 (`u4b-reduce` frais) ; brut frais existant avant fusion ⇒ D-n déclarée. Le rapport n'émet jamais « GO » (décision 137 : entrée de décision).
- **C-5** Oracles **indépendants et antérieurs** à l'outil, en tests : (i) la BB exacte reproduit les masses mesurées de l'avis Q6 :71 (3,6/5,8/6,3/10,4 % à n = 150/565/300/1000, n_e2 = 565, seuil 0,99 − 2·SE) ; (ii) h6 sur `U3-inputs` (107 lignes WETH) + `U4b-oracle-path-e2` reproduit ADR-U4 :104-112 (177/179 ∈ events, 2 = p0, retards 26/6/5) ; (iii) h4 reproduit 11/99 (cellule A) et 24/189 (tous) ; (iv) rapprochement exact Σ par appel (`call`+`price`+`reserve`, floorDiv ADR-U3 D1) == `repayment_base` de `U3-realized` par (user, debt) ; (v) `report` de bout en bout sur les fixtures e2 committées (e2 des deux côtés), digest du rapport épinglé. Deux implémentations divergentes (exacte vs lgamma) ⇒ ROUGE.
- **C-6** H-4 épinglé par ruling : ordre (block, log_index) ; numérateur = Σ repayment des appels après le premier ; dénominateur = `y` du JSONL de scores (jointure adresse) ; deficit rapporté à part (n'est pas un appel) ; médiane sur les liquidés de la cellule A de la strate (part 0 pour mono-appel), le sous-ensemble multi-appels rapporté en secondaire étiqueté.
- **C-7** H-6 épinglé : valeurs servies = lignes `kind:"price"` WETH (`price` ET `price_prev`) aux blocs de EP ; série = lignes `update` + ancre p0 ; NON ssi une valeur ∉ events ∪ {p0} OU retard > 3 events ; dépendance à `pre_b0_anchor` (R-I / U-4b-1b-4 (ii), `u4b-reduce.mjs:66-69`) déclarée, repli prix-book = chemin D-n ; biais d'échantillon (blocs de liquidation) déclaré comme ADR-U4.
- **C-8** RUNBOOK :439-440, :444, :488 réécrits dans le même lot (commandes, `--out F:/course-ukemi/offline/hyp-report-<EP>.json`, sidecar 6) ; ADR déclare les tuyaux (entrées : scores/labels/inputs/oracle-path frais + fixture e2 ; sortie : rapport lu au sidecar 6 et par le prédicat :359 ; test (v)).
- **C-9** Test A-9 : `scanText` + motifs globaux de `vocab-banned.json` appliqués au texte généré ; phrase C-11 « un OUI de H-3 ne licencie rien de plus » présente sur tout OUI ; mutant de sur-revendication ⇒ ROUGE.
- **C-10** MAST nommés + contre-mesures : dérive de spécification (bilatéral/smoothed) → tests C-5 + interdiction de flags ; vérification circulaire → oracles antérieurs (C-5) ; acceptation silencieuse d'argument → flag inconnu ⇒ throw. ≥ 8 mutants dont : sens du test inversé, `<` vs `≤`, p recomputé sans assert, strate 2/3 comptée NON, `under_calib` comptée NON, sha de fixture ignoré, deficit dans le numérateur H-4, retard 4 accepté en H-6.
- **C-11** Sur NON : rapporter k, n_e2, E[K] = n_e2·p/(n+1), couverture observée, nominale, p-value, manque ; la borne Σ w̃·d_TV (Barber Thm 2) est **déclarée non estimée** (aucun estimateur pré-enregistré) — item formé si l'orchestrateur en veut un, jamais un estimateur improvisé.
- **C-12** Aucun octet dans les 9 gelés ni le labeler ; sha recomputés au cp-2 ; le worker n'écrit pas dans `F:/course-ukemi/`.

Pas d'ESCALADE-INVESTISSEUR : aucune décision de valeur ; les épinglages sont des rulings d'auteur de prereg, pré-donnée, journalisés.

## 4. AM-1 — ce que la checklist a attrapé
`labels_no_quorum` sans producteur de code (plan « depuis `census` » infirmé par mesure) ; verdict binaire alors que le prereg en définit quatre ; l'outil non branché tant que le RUNBOOK dit « aucun outil » ; le rapport devenu entrée de décision mécanique (137) sans clause d'ordre pré-donnée ; trois oracles indépendants antérieurs disponibles (avis Q6, ADR-U4, rapprochement exact) non prévus par le plan.
