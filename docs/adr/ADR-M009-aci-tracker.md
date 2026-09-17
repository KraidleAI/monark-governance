# ADR-M009 — Primitive « quantile tracker » (ACI, D8 (iv)) : état porté par l'appelant, pas décroissant, sans clamp

- **Statut** : **IMPLÉMENTÉ — G2 APPROUVÉ (instance fraîche, R-1..R-4 appliquées) · G7 ACCEPTÉ · checkpoint-2 validateur
  `claude-fable-5-1` ACCEPTE-AVEC-CORRECTIONS C-11..C-13 appliquées (2026-09-17)**.
  Checkpoint-1 validateur `claude-fable-5-1` 2026-09-17 : ACCEPTE-AVEC-CORRECTIONS C-1..C-10, foldées (ADR + PLAN).
  Rapports : `docs/G1-lot-m009.md`, `docs/G2-lot-m009.md`. Aucun push sans go per-action.
- **Dates** : décision 2026-09-17 · approbation 2026-09-17 (checkpoint-2) · dernière modification 2026-09-17
- **Propriétaire de la décision** : orchestrateur `claude-fable-5-1` (investisseur : « GO » ACI 2026-09-17)
- **Gate concerné** : G0 (cadrage) → G1/G2/G7 + checkpoints AgileGates 1 et 2
- **Éléments affectés** : `packages/hikae/src/tracker.ts` (nouveau ; réutilise `imocpStep` de `l2-monitor.ts`, qui ne
  reçoit au plus qu'un commentaire de cross-ref), `packages/hikae/src/index.ts` (export), `packages/hikae/test/` (oracle) ; **amende** ADR-M008 **D8 (iv)** (α_t → q_t, clamp retiré) ;
  cross-refs 1-ligne dans ADR-M002 **D4** et `docs/PLAN-m008-f2.md` §3 (parenthèse ACI). **0 octet de contrat
  gelé, 0 octet sur le fil, 0 consommateur** (branche (b) ADR-M002 D4 inchangée).
- **Roster** : worker implémenteur `claude-opus-4-8` effort max (R-1 au premier message) ; G2 fraîche ≠ générateur ;
  orchestrateur/validateur `claude-fable-5-1`. Lecteurs `claude-sonnet-5` [lu] (mémoire `5db6ad7b…`, `d05dd94c…`) ;
  **advisor-defi 2026-09-17** (conseil cité, non re-litigé ; ses rejeux = illustration mécanique, pas preuve).

## Contexte
ADR-M008 D8 place ACI hors périmètre F et fixe 4 conditions de livrabilité ; seule **(iv)** (ADR + primitive pure à
état caller-carried) est livrable aujourd'hui : T live = 0 (endpoint non redéployé), donc (i) flux no-peek, (ii) Tγ
atteint, (iii) drift constaté à `B_t` en S2 réel ne sont **pas** remplies. D8 (iv) telle qu'écrite le 2026-09-16
portait « α_t + clamp » : la lecture [lu] du corpus ACI (4 papiers, 2026-09-17) montre que cette forme est incompatible
avec nos interfaces et vide la seule garantie sans hypothèse (voir Alternatives). Faits mesurés gouvernant la décision
(advisor-defi, `Bash` de vérification, fixtures sha-épinglées `fixtures/usde-calib-series.json`) : unité du score =
fraction du stock d'ouverture **par heure** sur fenêtre 24h (`adapter-narabi.ts`) ⇒ borne physique sans churn
**B = 1/24 h⁻¹** (D4 M008 : `v ≤ 1/Δ`) ; q̂ USDe = 1.3119e-4, max committé 4.1254e-4 (plafonné par θ_stress) ; **21 %
de résidus exactement nuls** (129/613, plage de 48 jours) ; ACF lag1 0.418 (partage de `v_t` entre `s_t` et `s_{t+1}`,
de construction), lag2-7 ≈ 0.2 (régime) ⇒ toute garantie i.i.d. est inapplicable à cette classe.

## Décision
Nous livrons en M009 la primitive **« quantile tracker »** d'Angelopoulos–Barber–Bates 2024 (ABB), règle (4) :
`q_{t+1} = q_t + η_t · (1{s_t > q_t} − α)`, c'est-à-dire **exactement** `imocpStep(q, α, E, η)` de
`l2-monitor.ts:27-29` muni d'un **calendrier de pas** `η_t = c · (t + t₀)^(−1/2 − ε)`, ε > 0.
1. **État porté par l'appelant** : `{ q: float64, t: entier ≥ 0 (pas LIVE, jamais les pas de calibration sauf t₀
   déclaré), q1: float64, params: { alpha, c, eps, t0, B } }`. **α fixe.** Aucun α_t.
2. **Interface pure** : `trackerStep(state, s) → { state', E }`. La primitive **reçoit le fait `s_t`** (score, recalculable
   de deux `AttestedFlow` consécutifs) et **dérive `E = 1{s_t > q_t}` elle-même** ; elle **n'accepte jamais** `E` de
   l'appelant (sinon un `reason` de gate fuit dans la récursion ; mutant **M5** du PLAN garde la dérivation stricte). Validation fail-closed : `s ∈ [0, B]`,
   `eps > 0`, `c > 0`, `q1 ∈ [0, B]`, `t0 ≥ 0`, sinon rejet (`throw`), jamais de valeur silencieuse.
3. **Sans clamp.** ABB Lemme 1 (éq. 8, texte l.556-561) : `−α·M_{t−1} ≤ q_t ≤ B + (1−α)·M_{t−1}`, `M_t = max_{r≤t} η_r`,
   pour toute suite `η_t ≥ 0`, sans étape de projection dans la règle (4) (l.79-81). L'**identité télescopique**
   `Σ_{t≤T} η_t (E_t − α) = q_{T+1} − q_1` est l'oracle anti-clamp : la preuve de Thm 1 (l.566-590) télescope par la
   règle (4) sans projection — avec un clamp, Thm 1 ne s'applique plus. Convention d'indice : état `t` = pas consommés,
   pas appliqué `η_{t+1} = c·(t+1+t₀)^(−1/2−ε)` (jamais `0^(−x)` ; `η` non finie ⇒ rejet). Le seul écrêtage
   licite est **sur le score** (`s ≤ B`, partie de la définition ABB de `s_t : X×Y → [0,B]`), dans un helper séparé,
   jamais dans la récursion.
4. **Garantie portée (et seulement elle)** : ABB **Thm 1** (l.196-205) — pour une suite **arbitraire**, `η_t` positive
   non croissante, `q_1 ∈ [0,B]` : `| (1/T) Σ_{t≤T} E_t − α | ≤ (B + η_1) / (T · η_T)`. Long-run, sans hypothèse, **T =
   pas live après déploiement**. Ordres de grandeur (cadence 1 pas/jour, c = B, ε = 0.1) : 33 % à 90 j, 18.9 % à 1 an,
   7.5 % à 10 ans ; avec c = q̂ la borne est **vide**. **Thm 3 (convergence i.i.d.) n'est PAS invoqué** (ACF mesurée).
   Aucune couverture par fenêtre, aucune « adaptivité » revendiquée, pour aucune classe (AC-5 : grep manuel sur les
   ajouts ; `vocab-banned.json` ne porte aucun motif `adapt`).
5. **Paramètres** : `B = 1/24` **fondé** (D4 M008) ; `q1 = q̂ committé` **fondé** comme warm start (ABB : `q_1 ∈ [0,B]`) ;
   `c, ε, t₀` **déclarés non fondés** (doctrine ADR-M002 D6) avec le dilemme écrit : `c ≈ B` = borne non vide mais
   bang-bang mesuré en calme (49 régions vides sur 613 pas, alerte de clôture 10-10 perdue) ; `c ≈ q̂` = inerte + borne
   vide ; ε petit = meilleure borne, convergence plus lente. **Aucune valeur par défaut exportée** ; les valeurs des tests
   sont étiquetées test-only.
6. **Digest de timeline** (hikae, hors contrats gelés) — encodage octet fixé :
   `sha256( f64be(α) ‖ f64be(c) ‖ f64be(ε) ‖ f64be(t₀) ‖ f64be(B) ‖ f64be(q₁) ‖ f64be(s_1) ‖ … ‖ f64be(s_T) )`, scores
   **dans l'ordre**, chaque `f64be` écrit avec **`-0` normalisé en `+0`** (miroir de `calibDigest`,
   `packages/contracts/src/calib-digest.ts:27` ; G2 R-1 : `q1 = -0` et `s = -0` sont acceptés par la validation, un rejoueur
   cross-langage DOIT normaliser de même) — **distinct** de `calibDigest` C5 (qui trie). De `(q1, params, s_1..s_T)` tout tiers rejoue `q_{T+1}` et la timeline E.
7. **Branche (b) inchangée** : aucun consommateur d'ensemble ; `q̂` split (L1) définit seul `C_t` ; `B_t` reste calculé
   contre le `q̂` **statique** (« la calibration calme est-elle encore valide ? »). Si un jour le tracker définit la
   région (branche (a), Phase 2), Thm 1 pousse `moy(E) → α` donc `B_t → 0` par construction ⇒ `B_t` devra être redéfini
   par amendement ADR-M002 D5/D6 **avant** ce basculement.
8. **Bords pré-déclarés pour la Phase 2 (non implémentés en M009)** : `q_t < 0` (∅) ⇒ intercepter **avant**
   `buildIntervalRegion` (sinon `lo > hi` ⇒ throw M5), ABSTAIN `intent_not_in_region`, `E_t := 1` par la primitive ;
   `q_t = 0` ⇒ NDG-1 (ADR-M011) telle quelle ⇒ `under_calib` ; `0 < q_t < B` ⇒ L3 inchangé ; `q_t ≥ B` (≡ 𝒴) ⇒ DEFER
   `interval_too_wide` **ssi** `τ_interval < 2·q_t` — contrainte : **toute région trackée exige `τ_interval < 2B`** ou un
   drapeau `trivial` retourné par la primitive et mappé DEFER. Aucun nouveau littéral de l'enum gelé.
9. **Alerte de run (correction de doctrine)** : le seuil q99 côté appelant (D4bis) compare le **fait** `v_t` (ou la marge
   **statique** `q̂` committée) au q99 caller-carried — **jamais** une borne trackée (tout élargissement abaisse `lo` ⇒
   moins d'alertes ; mesuré : `c = B` perd l'alerte de clôture 10-10). La parenthèse « ACI n'y touche pas » de
   `PLAN-m008-f2.md` §3 est vraie pour le **seuil**, fausse pour **`lo`** : amendée dans ce lot.
10. **Nommage / honnêteté** : « tracker », jamais « adaptive ». En-tête de code miroir de L2 : « TRACKER, NO GUARANTEE
    CLAIMED (D8 (i)-(iii) unmet) ». Phrase publique (K-1, si un jour portée) : « carries a deterministic, assumption-free
    long-run bound (ABB 2024 Thm 1) … claims no per-window coverage, no convergence, no adaptivity ; no tracker state
    is committed ».

## Sources
- **Note d'extraction (C-13, checkpoint-2)** : le texte pré-extrait par pdftotext a **perdu les lettres grecques** (l.560 lit
  littéralement `-Mt-1`, `(1 - )Mt-1`) ; les numéros de ligne ci-dessous sont des **localisateurs**, les formes verbatim
  (`−α·M_{t−1} ≤ q_t ≤ B + (1−α)·M_{t−1}`) ont été **vérifiées sur `arxiv.org/html/2402.01139v2`** (validateur, 2026-09-17)
  et par la preuve A.1 (cas `q_t ∈ [0,B]` : `q_{t+1} ≥ q_t − η_t·α`). Le PDF n'est pas committé (périmètre).
- **[lu]** Angelopoulos, Barber, Bates 2024, arXiv:2402.01139v2 (`scratchpad/biblio/…2402.01139.txt`, 1156 l.) : règle
  (4) l.79-81 ; Thm 1 l.196-205 ; Lemme 1 éq. (8) l.556-561, preuve l.939-955 ; Thm 3 / Cor 1 (i.i.d., non invoqués) ;
  Prop 1 (pas fixe ⇒ ∅/𝒴 infiniment souvent) ; App. B Table 1 (decaying 0.69 % d'ensembles infinis).
- **[lu]** Gibbs & Candès 2021, arXiv:2106.00170 : Lemme 4.1, Prop 4.1 (`(max{α_1,1−α_1}+γ)/(Tγ)`).
- **[lu]** Gibbs & Candès, DtACI, arXiv:2208.08401v3 : Alg. 1, Thm 3.1 (regret dynamique), Prop 3.1 (densité minorée),
  §3.3. **[lu]** Barber, Candès, Ramdas, Tibshirani 2023, arXiv:2202.13415v5 : Thm 2 (`≥ 1−α − Σ w̃_i d_TV`), §4.4.
  **[lu]** Zaffran et al. 2022, AgACI, arXiv:2202.07282v1 : Thm 3.1/3.2. — Erratum D8 M008 clos : Barber 2023 **procuré et lu**.
- **[lu] données** : `fixtures/usde-calib-series.json` (sha `7c33027a…`), recompute advisor-defi 613 paires, écart trié
  max 4.11e-8 (troncature déclarée `fixtures/PROVENANCE-usde.md`). Rejeux (tables) : `docs/G1-lot-m009.md` (exclu R-25).
- Chaîne de lecture : rapports lecteurs en mémoire memstack (`5db6ad7b0594…`, `d05dd94c1e9d…`) ; les fichiers
  `tasks/*.output` des 4 lecteurs sont vides (artefact harness, consigné JOURNAL) ; l'advisor-defi a **relu** [lu] les
  textes lui-même — aucun chiffre ci-dessus n'est de seconde main.

## Alternatives rejetées
- **(A) ACI sur α_t** (G&C 2021) : le support committé plafonne à 4.13e-4 < largeur de run (≥ 1e-3) ⇒ seule
  représentation d'un run = ±∞ (α_t ≤ 0), non représentable sur le fil (`lo`/`hi` numbers) ; `splitQuantile` étiquette
  les deux bords `under_calib` (un trivial scoré « raté » casse Lemme 4.1) ; le gate **rejette** `alpha ∉ (0,1)`
  (`gate.ts:156`) ⇒ clamp obligatoire ⇒ Prop 4.1 vidée. Honnêteté : en calme, (A) γ=0.005 se comporte mieux (0 bord vs
  5 vides) — argument réel, inférieur aux trois précédents. Bascule possible si l'ADR relâche `alpha ∈ (0,1)` ET accepte
  un mapping ±∞ (non retenu).
- **(B) DtACI** : (A) sous le capot (même plafond, mêmes ±∞), 8 experts, σ/η non fondés, |I|=500 = 1.4 an en pas
  journaliers ; Prop 3.1 exige densité minorée — **fausse** (atome 21 %). Reste le **repli nommé** d'ADR-M002 D4.
- **(D) Barber 2023** : statique, sans état — pas de l'ACI. Retenu **hors M009** comme upgrade de la phrase
  « échangeabilité déclarée » (item formé ci-dessous).
- **decay+adapt** (ABB App. B) : reset après 30 couvertures tire en dormance (plage de 48 zéros) et aggrave les vides ;
  reset après 10 ratés ne tire jamais dans un run de 6 jours. Écarté par mesure.
- **Ne rien livrer** : `imocpStep` existe déjà ; (C) = calendrier de pas + oracle. Livré parce que D8 (iv) l'exige et que
  l'oracle (télescopique, Lemme 1, épinglage octet) est le seul moyen de rendre la primitive **vérifiable** avant (i)-(iii).

## Conséquences
- **Positives** : primitive finie, représentable, rejouable ; clamp retiré donc garantie Thm 1 intacte ; interface qui
  ne peut pas absorber un `reason` de gate ; 0 contrat gelé touché ; doctrine d'alerte corrigée avant tout câblage.
- **Négatives (assumées)** : **aucun consommateur** aujourd'hui (même statut que `r_t`) ; la borne est numériquement
  vide en cadence journalière avant ~10 ans ; en calme la primitive est soit inerte soit bang-bang selon `c` — propriété
  de la donnée (dormance), déclarée, pas masquée ; `Math.pow` : oracle épinglé sur Node (moteur de déploiement), déclaré.
- **Items formés (règle Dettes, hors périmètre M009, à porter au JOURNAL)** : (a) `B_t` à `bFloor = 0` : P(B_t < 0)
  35 % (t°=30) → 47 % (t°=365) par bruit binomial **[abs]**, préexistant à ACI — à mesurer sur traces S2 puis ADR-M002
  D5/D6 ; (b) échangeabilité de la classe statique → phrase Barber Thm 2 (`w ≡ 1`, TV non estimable), 0 code ;
  (c) cadence horaire = **nouvelle `task_class`** (Mondrian), pas un réglage ; (d) `τ_interval = 1` (`gate.test.ts:425`)
  rend la règle de largeur inerte pour la classe statique (largeur ≤ 8.3e-4) — déclencheur : premier passage branche (a) ;
  action : amendement ADR-M002 D6 avec contrainte `τ_interval < 2B` ; (e) en-tête pré-existant `index.ts:2` « Hikae
  **Adaptive** Conformal Control » contredit D8 — hors périmètre M009 ; déclencheur : prochain lot touchant `index.ts`
  en gouvernance ; action : renommage par amendement ADR-M002 (titre du moteur) ; (f) `trackerStepSize` ne rejette pas
  `η = 0` (sous-flot par `eps` pathologique, G2 R-4 ; non atteignable avec `eps > 0` validé et les valeurs testées) —
  déclencheur : exposition de `eps` à un appelant ; action : rejeter `η ≤ 0` + test ; ADR de rattachement : **amendement
  ADR-M009** (C-11). Chaque item porté au JOURNAL avec
  déclencheur / action / ADR (C-9).
- **Relations** : amende M008 D8 (iv) ; cite M011 (NDG-1) et M002 D4 (branche b), D6 (paramètres non fondés) ; DtACI
  reste le repli nommé de M002 D4. Aucune dette délibérée.
