# Mesure M009 (a) — `B_t` à `bFloor = 0` : P(B_t < 0) sur traces S2 réelles vs 35–47 % [abs]

- **Statut** : mesure de dette d'entrée (mission P0-b, ADR-M015 D1 (c)(d)(e) ; PLAN-STRATEGIE §2). **Aucune
  valeur committée changée** ; l'amendement ADR-M002 D5/D6 est **proposé**, décision investisseur.
- **Provenance** : worker `claude-opus-4-8[1m]`, effort max, 2026-09-18. Script rejouable
  `scripts/measure-m009a.mjs` (lecture seule, aucun réseau). Contre-contrôle sur le reader Shōgen
  `shogen_s2` (Decimal prec 50). Réviseur : orchestrateur (G2/G7).
- **Item mesuré** (ADR-M009 §Conséquences, item (a), l.123-125) : « `B_t` à `bFloor = 0` : P(B_t < 0)
  35 % (t°=30) → 47 % (t°=365) par bruit binomial **[abs]**, préexistant à ACI — à mesurer sur traces S2
  puis ADR-M002 D5/D6 ».

## 1. Ce qu'est `B_t`, et pourquoi `B_t < 0` importe

Règle committée, non modifiée ici :

- **Budget** (ADR-M002 D4, `packages/hikae/src/l2-monitor.ts:64-70`, [lu]) :
  `B_t = alpha − (1/t°) · Σ_{labels arrivés} E_i`, où `E_i = 1{Y_i ∉ C_i}` est l'indicateur de **miscover**
  (`Miscover = 0 | 1`, l2-monitor.ts:18-19) et `t°` = nombre de labels arrivés. `t° = 0 ⇒ B_t = alpha`.
- **Arrivée** (`arrivedErrors`, `budgetAt`, l2-monitor.ts:41-82, `label_delay = 1`, [lu]) : à l'instant `t`,
  arrivés = `{i : i + label_delay ≤ t et i < t}` = `{0..t−1}` ⇒ `B(t°) = alpha − moyenne(E_0..E_{t°−1})`.
- **Épuisement** (`packages/hikae/src/l3-gate.ts:100/126`, [lu]) : `remainingBudget < bFloor ⇒ abstain
  budget_exhausted`. Avec `bFloor = 0` : **`budget_exhausted ⟺ B_t < 0 ⟺ p̂ > alpha`**, où
  `p̂ = (1/t°)Σ E_i` est le taux de miscover empirique sur les `t°` labels.
- **Paramètres committés** (ADR-M002 **D6**, [lu]) : `alpha = 0.10`, `bFloor = 0`, `label_delay = 1`,
  `n_min = 50` (côté HIKAE ; le `n_min` d'attestation S2 = 4, cf. §2).

**La claim [abs].** Si `E_i ~ Bernoulli(alpha)` i.i.d. (« bruit binomial »), alors
`P(B_t < 0) = P(Bin(t°, alpha) > alpha·t°)`. C'est le cas où la vraie calibration est **exactement au
bord** (taux vrai = alpha) : le bruit fait franchir le seuil ≈ la moitié du temps, montant vers 0,5 quand
`t°` croît. Reproduit **exactement** par le script (ancre `abs_binom_alpha`) : **35,26 % (t°=30) →
41,25 % (t°=90) → 49,07 % (t°=365)** — le « 35 %→47 % » de l'ADR est cette courbe binomiale au bord (le 47 %
de l'ADR est une approximation ; le binomial exact donne 49,1 % à t°=365). C'est un **[abs]** : rien n'y est
mesuré, il suppose `p̂ = alpha`.

## 2. Ce qu'est un « miscover » sur les traces S2 Shōgen (définition, sourcée)

Les traces S2 (`F:/shogen-campagne/campagne/{journal,control}.jsonl`, seuils scellés `sigma-tau.json`) ne
portent pas de label « HIKAE Y ∉ C » : ce sont des **attestations de prix BTC/USD par fenêtre de 60 s** sur
un pool de 12 flux. On mappe donc `E_i` sur l'événement d'attestation manquée **au sens de τ/σ**, tel que
défini par Shōgen :

- **Classification par cellule** (fenêtre×source), précédence **panne (iii) > staleness (ii, σ) >
  hors-enveloppe (i, τ)** — `shogen_s2/r1.py::classify_ecart`, doc 10 §5.2 [lu] :
  `staleness ⟺ (fin_fenêtre − source_ts) > σ_classe` ; `hors_enveloppe ⟺ |prix − médiane_LOO|/médiane_LOO
  > τ_classe`. Seuils **scellés** par classe (ADR-0022, `sigma-tau.json` [lu]) :
  τ ∈ {pyth 0,15 %, places 0,45 %, sans-horodatage 0,45 %, chainlink 1,65 %, agrégateurs 2,60 %}.
- **La fenêtre est « ratée » = CO-DÉFAILLANCE** : ≥ 2 sources simultanément en écart — l'événement `K` de
  K&L (`r1.py:415` `if win_ecarts >= 2: k_count += 1`, doc 10 §5.1/§5.6, [lu]). C'est la statistique que
  toute la machinerie d'attestation surveille : quand ≥ 2 sources co-défaillent, la médiane attestée n'est
  plus fiable.
- **Définition CANONIQUE retenue — D2 (co-défaillance parmi les sources PRÉSENTES, pyth exclu)** :
  ADR-0023 Shōgen (2026-09-03, [lu]) **acte `oracle_pyth` absent** toute la campagne (Hermes gaté par clé,
  HTTP 401 dès la 1ʳᵉ fenêtre — mesuré : pyth = panne sur **26938/26938** fenêtres) et statue que « **le
  drapeau 2 / la matrice φ n'utilisent que les sources présentes** » (conséquence 3). La co-défaillance
  canonique **exclut donc pyth** (11 flux présents), sinon la panne permanente d'une source acceptée-absente
  compterait comme +1 écart à chaque fenêtre.

**Panne (iii) n'est PAS un raté τ/σ.** Les axes τ/σ (staleness ∪ hors-enveloppe) ne tirent
**quasiment jamais** avec les seuils scellés ADR-0022 (1,5×max honnête de calibration) : **10 cellules au
total** sur ~323 k (staleness 6 + hors-enveloppe 4), **jamais 2 dans la même fenêtre ⇒ D3 (≥2 sur τ/σ) = 0**.
Toutes les co-défaillances observées sont des **pannes** (disponibilité), dominées par pyth. Variantes
rapportées pour la transparence : **D1** (K brut de r1, pyth compté), **D3** (≥2 sur τ/σ seuls), et
« ≥1 cellule τ/σ » (lecture littérale « au sens de τ/σ »).

## 3. Le script

`scripts/measure-m009a.mjs` (Node built-ins seuls, ~270 l.) :

1. Lit `run_params` committé de `control.jsonl` (pool 12, `sigma_classe`/`tau_classe`/`sigma_class_of_flux`
   scellés, `w=60`, `n_min=4`) — jamais de valeur codée en dur.
2. Marqueurs `window_close` (dédup par `window_start`, last-wins) ; lectures `journal.jsonl` (last-wins par
   (fenêtre, flux)). **Lecture tolérante** : saute les **2 lignes déchirées** (octets NUL, coupures de
   courant — cf. §7) en les journalisant.
3. Reproduit `classify_ecart` (float64), construit les suites `E_i` (D1, D2) en ordre chronologique.
4. Rejoue la trajectoire réelle unique `B(t°)` (règle committée) et mesure `P(B_{t°=H} < 0)` par horizon via
   **cinq estimateurs** : ancre binomiale à `alpha` ([abs]), binomiale à `p̂` réel, glissant empirique,
   bootstrap i.i.d. seedé, bootstrap par blocs seedé (préserve l'autocorrélation), chacun avec sa demi-largeur
   **IC95** Monte-Carlo (`1,96·√(p(1−p)/2000)`). Graine fixe `424242`.
5. Émet un JSON de provenance (sha256 des deux fichiers) + une table. Tourne en **~3,5 s**.

Rejeu : `node scripts/measure-m009a.mjs` (surchargeable par `S2_CONTROL`/`S2_JOURNAL`).

## 4. Résultats [mesuré] — état épinglé 2026-09-18

- `sha256(control.jsonl)` = `d596e3050a6fad749f6e57f90e674c1d6fe89e4c113a5343a59d32edc69546cf`
- `sha256(journal.jsonl)` = `a34a51999710866348f7f3dbc97dc7f4b190f0705a91c486f03a3d0ff567f8d0`
- **n = 26 938 fenêtres complétées** (`window_close`), span 23,09 j ; **≈ 18,7 j de fenêtres complétées**
  (26 938 × 60 s), pas « 26 j » (uptime < 100 %, coupures).
- **Taux de miscover réel** : `p̂_D2 = 1,021 %` (canonique, pyth exclu) ; `p̂_D1 = 5,034 %` (K brut, pyth
  inclus). **Tous ≪ alpha = 10 %.**

**P(B_t < 0) par horizon** (%, α=0,10, bFloor=0) :

| t° (labels) | jours @60 s | **[abs] α (bord)** | **D2 anal.** | D2 glissant | D2 bloc-boot | D1 anal. | D1 glissant | D1 bloc-boot |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 30 | 0,021 | **35,26** | **0,024** | 2,26 | 2,55 | 6,20 | 16,06 | 16,00 |
| 90 | 0,063 | **41,25** | **~0** | 2,48 | 3,35 | 1,52 | 18,91 | 15,45 |
| 365 | 0,253 | **49,07** | **~0** | 3,03 | 1,50 | 0,005 | 21,31 | 10,50 |
| 1 440 | 1,0 | 47,78 | ~0 | 0 | 0 | ~0 | 22,50 | 1,25 |
| 26 938 | 18,7 | 50,14 | ~0 | 0 | 0 | ~0 | 0 | 0 |

- **Intervalles** (bootstrap seedé, 2 000 rééchantillons) : demi-largeur IC95 Monte-Carlo `= 1,96·√(p(1−p)/2000)`,
  émise par le script (champs `*_ci95`). À t°=30 : bloc-boot D2 = 2,4 % **±0,67 pt**, bloc-boot D1 = 16,5 %
  **±1,63 pt** ; l'écart empirique/bloc vs i.i.d. dépasse largement le bruit Monte-Carlo (c'est de la structure,
  pas de l'échantillonnage). Note : `[abs] α` **n'est pas strictement monotone** (49,07 → 47,78 de t°=365 à
  1 440) — effet entier de `⌊α·t°⌋+1` quand `α·t° = 144` tombe **pile** sur un entier (seuil 145, un cran plus
  haut que la moyenne) ; la tendance de fond reste montante vers 0,5.

**Trajectoire réelle unique de `B_t`** (le budget effectif de la campagne, règle committée) :
- D2 : **`B(t°)` n'est JAMAIS descendu sous 0** (premier `B<0` : *jamais*) ; min = **0,0885** @t°=21 656,
  `B_final` = 0,0898.
- D1 : idem, min = **0,0478** @t°=17 572, `B_final` = 0,0497.

## 5. Lecture (comparaison au 35–47 % [abs])

1. **Le [abs] est reproduit** (35,3 %→49,1 %) : c'est la binomiale au bord (`p̂ = alpha`), montant vers 0,5.
2. **La mesure canonique (D2) est deux à trois ordres de grandeur SOUS le [abs]** : ≈ 0 % analytique/i.i.d.,
   ≤ 3 % en empirique/bloc — parce que le taux d'attestation réel (1,0 %) est **très inférieur** à alpha (10 %).
   Sur la campagne réelle, **`B_t` n'a jamais approché 0** (min 0,088) : **zéro `budget_exhausted` parasite**.
3. **La tendance s'INVERSE** : le [abs] MONTE avec l'horizon (bruit au bord → 0,5) ; la mesure réelle
   DESCEND (concentration sous alpha, `B_t → +p̂`). Le 35–47 % [abs] ne se matérialise pas quand `p̂ ≪ alpha`.
4. **Découverte d'ordre 2 — burstiness (non-i.i.d.)** : l'empirique et le bootstrap par blocs dépassent la
   binomiale i.i.d. (D2 : 2–3 % vs 0,02 % ; D1 : 16–22 % vs 6 %). Les pannes arrivent **en rafales**
   (coupures, redémarrages) : les co-défaillances se **groupent**. C'est l'analogue mesuré de l'ACF
   d'ADR-M009 §Contexte (« ACF lag1 0,418 … toute garantie i.i.d. inapplicable »). Le message d'honnêteté :
   si un jour le taux réel s'approchait de alpha, l'autocorrélation rendrait `budget_exhausted` **plus**
   fréquent que la binomiale, pas moins.
5. **τ/σ strict = 0** : avec les seuils scellés (1,5×max honnête), l'attestation ne rate **aucune** fenêtre
   au sens strict de τ/σ (10 cellules / 323 k, jamais 2 ensemble). Le 5 % de D1 est un **artefact de
   disponibilité** (pyth acceptée-absente + rafales de `panne_transport`), pas un raté d'enveloppe.

## 6. Limites (déclarées, doc 03)

- **Proxy, pas le même processus.** L'attestation Shōgen (co-défaillance de sources de prix BTC/USD) est un
  **proxy** du miscover HIKAE (Y direction de marché ∉ C). Les deux sont des indicateurs binaires par fenêtre,
  mais **pas le même processus** : ce résultat borne le comportement de `B_t/bFloor` **sous une suite réelle
  d'attestation**, il ne mesure PAS la couverture HIKAE (pas de flux d'outcomes HIKAE live — cf. ADR-M008 D8
  (i), non remplie). La préoccupation [abs] du bord **reste valide** pour toute calibration HIKAE réellement
  au bord (`p̂ ≈ alpha`).
- **float64 vs Decimal-50** : la classification est reproduite en float64 (le harnais Shōgen est Decimal
  prec 50). Écart possible sur une bascule de bord `|prix−m|/m > τ`. Contre-contrôle §7 : **comptes
  identiques** (10 cellules τ/σ = 10 ; taux D1/D2 concordants à 4 chiffres) — **compatible avec 0 bascule**,
  l'identité **par cellule** n'étant pas vérifiée (les deux passes lisent un `n` différent, campagne live).
- **Campagne LIVE** : la collecte n'est pas close ; `n` croît entre relectures (26 924 → 26 938 → 26 954
  pendant cette passe). Les sha256 §4 épinglent l'**instantané** mesuré (n=26 938) ; un **rejeu** lit un fichier
  plus grand ⇒ **sha256 différent, `n` plus grand, taux et trajectoire identiques** (glissant D2 = 2,26 %, D1 =
  16,06 % inchangés sur les 3 relectures ; min `B_t` identique). Les **taux** (1,0 % / 5,0 %) sont stables.
- **Horizons en labels** : `t° = 30/90/365/1440` sont des **comptes de labels** (unité de l'ADR, directement
  comparable au [abs]). En **jours de campagne**, seuls **1 j et la campagne entière (≈ 18,7 j)** sont
  disponibles ; **90 j et 365 j (jours) = NON DISPONIBLE**, jamais extrapolés (la campagne fournit ~18,7 j).
- **Panne pyth** = incident de campagne accepté (ADR-0023), pas un raté τ/σ : d'où D2 (canonique) l'exclut.

## 7. Contre-contrôle (reader Shōgen, Decimal-50)

Référence : `shogen_s2.r1` sur les mêmes fichiers (lecture tolérante des 2 lignes déchirées ; le reader
Shōgen natif **fail-close** sur corruption non-finale — écart de robustesse déclaré, jamais la trace
modifiée). Concordance :

| grandeur | JS float64 | Python Decimal-50 |
|---|---|---|
| n (window_close dédup) | 26 938 | 26 934 (relecture antérieure) |
| p̂ D1 (K brut, pyth incl.) | 5,034 % | 5,0345 % |
| p̂ D2 (canonique, pyth excl.) | 1,021 % | 1,0210 % |
| cellules τ/σ (staleness+hors-env) | 10 | 10 |
| `compute_r1` Σ K sur strates | — | = D1 total (identité vérifiée) |

L'écart de `n` (26 938 vs 26 934) est la croissance de la campagne live entre deux relectures, pas une
divergence de calcul. Les 2 lignes déchirées : `journal.jsonl` **283793** et **322675** (octets NUL,
coupures 2026-09-16 / 2026-09-18 ; `control.jsonl` a été réparé, `journal.jsonl` **non** — cf.
`campagne/REPAIR-2026-09-*.md`). Impact : 2 cellules (fenêtre×flux) perdues, traitées en panne — négligeable.

## 8. Amendement ADR-M002 D5/D6 proposé

Voir `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md`, section **« Amendement 2026-09-18 (mesure M009 (a)) »**.
En bref, avec le **chiffre** : `budget_exhausted ⟺ B_t < bFloor ⟺ p̂ > alpha − bFloor` (correction de signe :
un `bFloor > 0` abstient **plus tôt**, plus strict). Deux options, **décision investisseur** :
(a) `bFloor > 0` pré-enregistré (conservatisme délibéré ; inerte sur ces données tant que `bFloor < 0,0478`,
`B_t` étant resté ≥ 0,04776 sous D1, ≥ 0,0885 sous D2) ;
(b) conserver `bFloor = 0` + phrase d'honnêteté (le 35–47 % [abs] ne s'est pas matérialisé, `p̂ ≪ alpha` ;
la préoccupation demeure au bord et est aggravée par la burstiness). La tolérance (`bFloor < 0`) est
**rejetée** par `gate.ts:169`.

## Rectificatif G2 (R-C2, 2026-09-18 soir) — provenance de la trace
Ce script lit seulement ; **la trace a bien été modifiée ensuite, par l'orchestrateur (Fable 5.1), pas par le worker** : les deux lignes déchirées
non finales de `journal.jsonl` (283793, 322675) que le lecteur tolérant sautait ont été excisées après la mesure (driver arrêté puis relancé,
sauvegarde `journal.jsonl.bak-precut-20260918`, sha b776b06c… → ac2cec24…, `REPAIR-2026-09-18.md` addendum), parce que le lecteur natif Shōgen
fail-close sur elles et que le rapport J28 en dépend. La mesure ci-dessus porte sur l'instantané **non réparé** (sha épinglé §4) ; la réparation
est mesure-neutre (lignes déjà ignorées ; taux et min B_t reproduits à l'identique par la G2 sur la trace réparée). Toute phrase « jamais la trace
modifiée » / « `journal.jsonl` non réparé » ci-dessus se lit « au moment de la mesure ». Adjudication D-ADJ : acteur = orchestrateur ; action de
récupération prescrite par le RUNBOOK Shōgen (même correctif que le 2026-09-16), hors dépôt Monark, exécutée sans go explicite pour cette
seconde excision — **soumise à ratification de l'investisseur** (JOURNAL Shōgen 2026-09-18).
