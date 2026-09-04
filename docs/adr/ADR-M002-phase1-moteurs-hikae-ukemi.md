# ADR-M002 — Phase 1 (G0) : moteurs HIKAE (HAC-CP, beachhead `btc-dir-15m`) et UKEMI (noyau de clearing)
- **Statut** : **ACCEPTÉ-AVEC-CORRECTIONS** par le validateur-humain (checkpoint 1, 2026-09-04, modèle résolu
  `claude-fable-5-1`) → **corrections C1-C13 intégrées** (cette version) → quick-verify validateur **dû** avant toute
  ligne de code. Aucun code Phase 1 n'existe.
- **Rattachement** : `ROADMAP-MONARK.md` §Phase 1 (engine-first, décision investisseur 2026-09-04) ; ADR-M001 (Phase 0
  close, commits `357ef25` + `b526dbd`, contrats gelés) ; `hikae/GROK-DECORTICATION.md` §9 (idées adoptées, code le
  nôtre) ; `hikae/VERDICT-TASKCLASS-GROK.md` §3-4 (btc-dir fondé sur Barber/Su, pas sur les ancres GPU) ;
  `liquidations/G7-VERDICT-UKEMI.md` §5-6 (porte G0 UKEMI) ; `ADR-CERT-MONARK-reconciliation.md` (B_t attaché à MONARK).
- **Provenance / Gate-0** : écrit par l'orchestrateur. Advisor (canal intégré) consulté **avant** rédaction : périmètre
  ramené à **deux lots** (le gate cross-agent `crossAgentGate` reste **Phase 2**, ADR-M001 + stub `packages/monark`) ;
  réconciliation UKEMI/G7 à écrire (D9) ; décisions sourcées sur **nos archives [lu]**, jamais sur les docs Grok.
  **Gate-0 validateur (mesuré, C12c)** : le `validateur-humain` a résolu **`claude-fable-5-1`** au checkpoint 1 — la
  prédiction initiale « résoudra encore `claude-fable-5` (cache de session) » était **fausse** ; corrigée, pas effacée.
- **Supersession déclarée (C5)** : cet ADR **supersède ADR-M001 l.166-167** (« le label réalisé vient des deltas
  d'`AttestedPrice` ; `predictor_id: "internal:…"` ») pour la Phase 1 : le label vient d'un **endpoint public brut**
  (D8, A(shogen-optional)) et le prédicteur est `internal:momentum-4c` (D7) ; le label par `AttestedPrice` redevient la
  règle à l'intégration Phase 2.

## 1. Contexte
Phase 0 a gelé quatre contrats (`AttestedPrice`, `Prediction`, `CoverageVerdict` région `set|interval`, `GateDecision`
`commit|defer|abstain` + `remaining_budget` = B_t). Phase 1 = les **moteurs** derrière ces contrats, sans les modifier.
Décision investisseur **engine-first** : HIKAE bâtit d'abord `btc-dir-15m` (démo d'arène) ; UKEMI démarre son modèle de
cascade en parallèle et **devient la 2e classe de tâche HIKAE** (régression → région `interval`) ; Shōgen continue S2,
**intouché**. Le code est **le nôtre** ; l'app Grok (`Downloads/grok 1`) est **input de conception**, jamais liftée.

## 2. Décisions

### D1 — Deux lots, deux worktrees, pas trois
- **Lot H (HIKAE)** : `packages/hikae` — HAC-CP L1/L2/L3 + instrument S2 + tests nommés.
- **Lot U (UKEMI)** : `packages/ukemi` — noyau de clearing Eisenberg-Noe + cible/horizon déclarés ; émet en Phase 1
  une **`Prediction{yhat: number, predictor_id}`** sur fixture (**pas** de région `interval` : l'émission d'une région
  est un travail de conformeur, propriété du Lot H — C4). **Aucune dépendance Lot U → Lot H.**
- **Hors Phase 1, reportés Phase 2 (C6)** : la **surface de skill** (`hikae_calibrate/conform/gate`, Hermes) et
  l'**atelier/démo d'arène** — la roadmap l.61-64 les déclare « décidés » par l'investisseur ; ils dépendent du
  prédicteur réel (clé, Python, D7) et de l'intégration. **Réduction de périmètre motivée par la deadline et les
  credentials → pendant investisseur (f), §4.**
- **Pas de lot MONARK** : `crossAgentGate` (un `AttestedPrice` **réel** → verdict → décision, end-to-end) est le jalon
  **Phase 2** (ADR-M001 ; stub `packages/monark/src/index.ts`). Garde-fou de réduction AgileGates : fan-out par
  **isolation** (deux moteurs indépendants), pas par débit.
- Worktrees git isolés (`F:\Monark` main → `wt/hikae`, `wt/ukemi`) ; **local-only, 0 remote** (inchangé).

### D2 — Contrats gelés : garde CI
- `schemas/*.json` et `packages/contracts/src/**` restent **byte-identiques à `357ef25`** pendant toute la Phase 1 :
  test `contracts_frozen` (hash des fichiers vs manifeste committé). Toute évolution = ADR + bump `schema_version`
  (ADR-M001 D9).
- Les paramètres de moteur (`label_delay`, strates, `eta`, `B_floor`) sont **internes** : jamais sur le fil.

### D3 — L1 : split conformal par classe de tâche (cité, garantie type (i))
- **Mondrian / strates (C12b)** : pour une **classe de tâche unique**, Barber 2020 **Thm 2.1** suffit ; les **strates ex
  ante** (`asia`/`americas`, D10) sont la partition finie de l'éq. 4.2 p.9, couverte par le **Thm 4.1 p.11**
  ((1−α,δ,𝔛)-CC sur partition, `R2-cp-distfree.md:43,51`) — validité inconditionnelle, efficacité dépendante de 𝔛.
- `p = ceil((n+1)(1-alpha))`, `q̂` = p-ème plus petit score ; `C(x) = {y : s(x,y) <= q̂}`. **Fail-closed** : `n < n_min`
  ou `p > n` ⇒ **pas de `q̂`**, `reason = under_calib` (jamais un `+inf` clampé en silence).
- **Sources [lu] (nos archives)** : correction `(n+1)` — Barber, Candès, Ramdas, Tibshirani, *Predictive inference with
  the jackknife+*, AoS 2021, **note 1 p.4** (« we use (1−α)(n+1) rather than (1−α)n », `hikae/lecture/L6-jackknife-lei.md:103`
  ; idem `R2-cp-distfree.md:218`) ; validité split-CP marginale — Barber, Candès, Ramdas, Tibshirani 2020, *The limits of
  distribution-free conditional predictive inference*, **Thm 2.1 p.5** (`R2-cp-distfree.md:40,85`) ; CP **sans logits**
  sur API boîte-noire — Su et al. *API Is Enough*, Thm 2.1 / Prop 3.2 (`VERDICT-TASKCLASS-GROK.md` §1 ; réserve du
  lecteur : jamais testé sur API propriétaire). **Ne pas citer** Papadopoulos 2002 comme source verbatim de la formule
  (verdict TaskClass §2).
- **Garantie déclarée** : marginale, échantillon-fini, **sous échangeabilité à l'intérieur de la classe** ; pas de
  couverture conditionnelle à x (Barber 2020 Prop 2.2, `R2`) ; **jamais `p_correct`**.
- Beachhead : score **indicatif** `s(x,ŷ)=0, s(x,autre)=1` (k=1). À ce score `q̂ ∈ {0,1}` : `q̂=0 ⇒ C={ŷ}`,
  `q̂=1 ⇒ C={up,down}`. Nommé honnêtement (GROK-DECORTICATION §2 « coupes honnêtes », item 2) : la richesse CP ne se manifeste pas sur un
  binaire ; c'est le silence calibré, pas un défaut.

### D4 — L2 : MONITEUR de risque restant (mécanisme IM-OCP ; AUCUNE garantie revendiquée en Phase 1 — C1 branche b)
- **Tranché (C1)** : en Phase 1, `q̂` split (L1) définit seul `C_t` ; `r_t` (IM-OCP) et `B_t` sont des **statistiques de
  monitoring** qui pilotent π (L3) et le **drapeau de drift** — `r_t` **n'a pas de consommateur d'ensemble**, donc la
  garantie long-run de Wang **n'est attachée à rien** et **n'est pas revendiquée**. Titre honnête : moniteur, pas
  contrôleur. **Branche (a) nommée pour Phase 2** : `C_t = {y : s ≤ r_t}` avec `q̂` en initialisation (alors la garantie
  (ii) porte sur `C_t`, et L1 (i) disparaît) — décision par ADR après S2 réel.
- MAJ : `r_t = r_{t-1} - eta * (alpha - E_{t-1})` **sur la sous-suite des labels arrivés** (C2 : Wang est cité avec
  `p = 1` sur cette sous-suite — pas « p_t = 0 avant w », lecture qui viderait son Thm 1, `R5:151-158` exige
  `p_min > 0`) ; `E = 1{Y not in C}` ; **budget** `B_t = alpha - (1/t°) * sum_{labels arrivés} E_i`.
- **Source [lu] du mécanisme** : Wang, Zecchin, Simeone, IEEE SPL 32 (2025) 2888-2892, **éq. 10, Thm 1, Thm 2, Cor. 1**
  (`hikae/lecture/R5-cp-online-marches.md` §1). Son type (ii) — **moyenne temporelle long-run**, séquence arbitraire —
  est **différent** de (i) ; il ne sera jamais fusionné avec L1 dans un rapport, et **n'est pas invoqué** tant que la
  branche (a) n'est pas adoptée.
- **Retard déterministe** (label à `t+w`) et terme `w/T` : **composition (H4 chez Grok)** — esquisse, notre choix de
  conception, pas un théorème publié. Les tests 9-10 vérifient le **mécanisme** (direction de la MAJ ; B_t ne lit pas
  le label en attente), **pas une garantie**.
- **Pourquoi IM-OCP et pas DtACI** (Gibbs & Candès, JMLR 2024, `hikae/lecture/L3-online-arbitrary.md`) : la couverture
  *locale* de DtACI exige densité minorée + Lipschitz (§3.2, non testées par les auteurs) ; sa couverture long-run exacte
  exige eta,sigma → 0, régime jugé irréaliste par les auteurs (§3.3) ; IM-OCP donne le type (ii) à mémoire O(1) avec
  feedback intermittent (Table I). Les deux sont (ii) ; DtACI = **repli nommé** si S2b montre un drift non suivi.
- **L2 n'amende pas L1 en Phase 1** : `q̂` reste le quantile split ; `r_t`, `B_t` pilotent seulement pi (L3) et le
  drapeau de drift (conséquence directe de la branche b).

### D5 — L3 : politique d'engagement différé (prédicat fermé)
```
ABSTAIN  si n<n_min | intent not in C | B_t<B_floor | horloge close | timeout | parse non_evaluable
DEFER    si |C|>tau et horloge ouverte
COMMIT   si intent in C, |C|<=tau, B_t>=B_floor
```
- DEFER ≠ ABSTAIN (attend vs refuse) ; horloge close ⇒ DEFER → ABSTAIN `clock_expired`. Le PnL n'entre pas dans pi.
- **Propriétés exécutables** (oracle non-LLM) : **H3** — la somme des miscovers est identique sous pi0 (commit dès
  intent in C) et pi^H (identité pure ⇒ test de propriété) ; **H2.3** — l'erreur conditionnelle à COMMIT **n'est pas**
  bornée par alpha : chiffre de desk **étiqueté**, et la tournure « X % de fills corrects » entre dans le **gate
  vocabulaire** (interdite).
- Raisons = l'enum gelé `CoverageVerdict.reason` (13 littéraux, ADR-M001) — aucune nouvelle raison sans ADR.

### D6 — Paramètres v0 : budgets déclarés, non fondés
`alpha=0.10`, `n_min=50`, `tau=1`, `k=1`, `eta=0.05`, `B_floor=0`, `w=15 min`, `label_delay=1` fenêtre. Grok = input ;
**aucun n'est fondé** par une source — écrit tel quel dans le journal S2. Toute valeur change par ADR.

### D7 — Prédicteur : baseline déclarée en Phase 1, LLM en Phase 2
- `Prediction.predictor_id` (gelé) rend le prédicteur **enfichable**. Phase 1 = **baseline momentum déclarée**
  (`predictor_id="internal:momentum-4c"`, préfixe ADR-M001 conservé). **Convention d'indice (alignée D8, anti
  look-ahead)** : `close[k]` = close de la bougie **terminée** à l'instant k ; pour la fenêtre `[t, t+15)`, les features
  sont `close[t], close[t-15], close[t-30], close[t-45], close[t-60]` (bougies **terminées à un instant ≤ t**) et
  ŷ = signe de `close[t] - close[t-60]` ; le label `sign(close - open)` de `[t, t+15)` n'est **jamais** une feature —
  un test `features_strictly_before_t` (ajouté au Lot H, n° 17) le garde) + le mutant
  **oracle didactique** (ŷ=y, `predictor_id="internal:oracle-didactique"`, jamais un produit).
- Le prédicteur UsePod/Hermes (Python, **clé API**) est **Phase 2** : l'orchestrateur ne saisit jamais de credential ;
  un rapport S2b « qui parle au stream » exige le prédicteur réel — donc S2b Phase 1 = **rapport de mécanisme**, pas de
  valeur (borne honnête, GROK-DECORTICATION §2 « coupes honnêtes », item 1).

### D8 — Labels : endpoint public brut, pas `AttestedPrice` (A(shogen-optional))
- **Règle de label exécutable (C8)** : sur la bougie 15 min `[t, t+15)` de la grille UTC (:00/:15/:30/:45),
  `y = sign(close - open)` ; `close = open` ⇒ **`non_evaluable`** (pas de 3e label, le point est exclu, compté).
  Features du prédicteur = les **5** closes de bougies **terminées à un instant ≤ t** — `close[t], close[t-15],
  close[t-30], close[t-45], close[t-60]` — convention d'indice de D7 (`close[k]` = close de la bougie terminée en k) ;
  aucune bougie terminée **après** t. Source **unique, committée avant** la campagne (A(label-integrity)).
- **Fait mesuré, pas un lead — sur le TICKER seulement** : Shōgen `docs/10-mesures-pilotes-design.md` §3.1 (re-mesure
  aveugle **2026-08-05 ~12:02-12:04 UTC**) : Coinbase Exchange `products/BTC-USD/ticker`, Kraken
  `0/public/Ticker?pair=XBTUSD`, Bitstamp `api/v2/ticker/btcusd/` → **200 sans clé**, USD, place primaire. L'endpoint
  **bougies** réellement utilisé (candidat v0 : Coinbase Exchange `products/BTC-USD/candles?granularity=900`) **n'a pas
  été mesuré** ; la **sonde datée J0** vise **cet** endpoint (200 sans clé + forme du JSON) avant S2b, pas le ticker.
  **Question formée à l'investisseur (a)** : venue et **conditions d'usage** de l'API publique pour un usage
  démo/rapport — **ne bloque pas** : moteur et S2a tournent sur **fixtures committées**.
- Phase 2 remplace cet endpoint par `AttestedPrice` Shōgen via l'adaptateur « sens émis » — jalon d'intégration.

### D9 — UKEMI : brique-moteur MONARK, pas un produit autonome (réconciliation avec G7)
- G7 UKEMI (2026-09-03) §5, verbatim : « **NE PAS ouvrir de G0/code UKEMI autonome** tant qu'un acheteur nommé n'a pas
  formulé une exigence de couverture » ; §6 : « sinon, UKEMI reste un **outil MONARK** monétisé par embarquement ».
  Roadmap (investisseur, 2026-09-04) : UKEMI démarre le modèle de cascade en parallèle, 2e classe HIKAE.
- **Réconciliation** : le Lot U est **la brique-moteur** (noyau de clearing + cible régression que HIKAE conforme en
  `interval`) — **exactement l'outil MONARK de G7 §6** ; **pas** un G0 produit standalone, **pas** de vente de garantie
  nue, **pas** de sous-brique oracle-attesté en tête (signal négatif Aave/Chainlink, G7 §2). Le G0 *produit* UKEMI reste
  fermé jusqu'à une exigence de couverture nommée (NON TROUVÉ au 2026-09-03).
- **Noyau** : vecteur de clearing Eisenberg-Noe `p* = fix Phi(p) = (Pi^T p + e) ∧ p̄` — existence (Thm 1, Tarski),
  unicité sous régularité (Thm 2 ; suffisant `e>0`), algorithme **fictitious default ≤ n tours**, non-expansivité en
  `e` (Lemme 5, K4:63) — **[lu-archive K4]** (`liquidations/lecture/K4-systemique-clearing.md:21-63,160`). La borne
  `||Δp*||_1 <= ||Δe||_1` est une **[inférence du lecteur K4:90]**, pas un énoncé du papier (C11) — le test 21 la
  vérifie empiriquement sur fixture, sans la citer comme théorème. **Contrôle négatif d'unicité (C10)** : App. 2 E&N
  (K4:49) — deux nœuds, `e=(0,0)`, dettes mutuelles 1 ⇒ continuum `(t,t)`, `p+ ≠ p-` ; `e=(0.01, 0)` restaure l'unicité.
  Déterministe, **recalculable par quiconque** depuis `(L, e)` — même exigence que Shōgen. Sur **graphe-fixture**
  committé ; le portage DeFi (pools, pénalité de liquidation ⇒ perte d'unicité E&N p.248 ⇒ livrer `p+`/`p-` en bornes)
  est **nommé**, pas résolu.
- **Cible + horizon fixés maintenant** (SYNTHESE-LIQUIDATIONS §4.7 : aucune garantie avant) : candidat **A** — « montant
  liquidable sous un choc de prix de x % » (Perez et al. *Liquidations: DeFi on a Knife-edge*, **Eq. 3 p.7**, seul
  candidat où un prix entre formellement, `SYNTHESE-LIQUIDATIONS.md` §1 maillon 1 et §2(a) ; cible candidate A en §2(b)) ; horizon = **une fenêtre 15 min** (aligné
  HIKAE). Déclaré, non fondé ; B-E nommés dans la synthèse, écartés pour Phase 1 (sans prix, ou horizon 1 j à 100 j).
- **Canal endogène DeFi** (fire-sale bouclant sur un prix partagé) : **NON TROUVÉ** dans les 15 papiers — hors
  périmètre ; procurements P-K4-1 / P-K4-2 **tiennent** (mainteneur).
- **Ferme les pendants Phase 0 — propriétaire tranché (C4) : le Lot H.** L'invariant **M5** `lo <= hi` et la règle
  **borné ou abstention** (jamais ±inf ; borne non finie ⇒ `abstain=true`, `reason=under_calib`, miroir du refus Hikae
  de `+inf`) vivent dans **un seul constructeur** `hikae/src/region.ts::buildIntervalRegion(lo, hi)` — **pas** dans
  `contracts` (gelé, D2), **pas** dupliqué dans `ukemi`. Le Lot U ne construit aucune région en Phase 1 ; à l'intégration
  Phase 2, HIKAE conforme la `Prediction` numérique d'UKEMI en région `interval` via ce constructeur.
- **Réserve de valeur nommée (C13d)** : la cible A à **horizon 15 min** n'est **pas l'objet payé** (SYNTHESE §3.1 :
  VaR 99 %/24 h, Chaos/LlamaRisk) — brique fixture Phase 1, horizon à réaligner par ADR quand un acheteur nomme le sien.

### D10 — Instrument S2 (conception **adoptée de Grok doc 11** §2, §5.1, §7, §8 — input, jamais lifté — réécrite pour
nos contrats ; harnais jetable, R-22 : ne se promeut pas) (C7)
- **S2a plomberie** : classe binaire à gold connu **hors marché** — lot **synthétique déclaré** (200 phrases template,
  gold déterministe) — tranche « le quantile et le gate sont-ils câblés ? ».
- **S2b beachhead** : `btc-dir-15m`, prédicteur D7, labels D8, **split committé (graine + règle)**, strates **ex ante**
  `asia` 00-08 UTC / `americas` 13-21 UTC (n >= 50 **par strate** avant tout chiffre par strate) ; couverture empirique
  **abstentions incluses** + couverture **conditionnelle à l'action** en ligne séparée « pas la garantie CP ».
- **Mutants M1-M5 = tests nommés** (un instrument qui n'a jamais rejeté n'a rien montré) : M1 `under_calib` n=10 ;
  M2 labels inversés post-gel ⇒ la couverture casse ; M3 timeout ⇒ deny ; M4 parse `MAYBE` ⇒ `non_evaluable` ;
  M5 `p_correct` injecté ⇒ la sérialisation **lève** (déjà enforcé par `@monark/contracts`).
- **Table recalculable** : journal brut par point (hash prompt, ŷ, y, s, C, couvert, abstain, strate) ; tout chiffre se
  recalcule **sans croire HIKAE**. Tête de rapport soumise au gate vocabulaire.
- **Provenance des fixtures (C9)** — deux jeux, **étiquetés** : (i) **synthétique par graine committée** (générateur
  déterministe de séries + labels ; `harness_version=fixtures-synth`) — c'est **lui** qui produit le jeu
  `3 COMMIT / 2 DEFER / 3 ABSTAIN / 1 under_calib` du test 14, via l'**oracle didactique** et des mutants, **pas**
  `momentum-4c` ; (ii) **snapshot réel daté** (endpoint + date + hash committés, `harness_version=fixtures-real-replay`)
  rejoué hors ligne, seulement après la sonde J0. Le rapport S2b porte **« synthétique »** ou **« réel-rejoué »**.
- **Résultat attendu, en clair (C13e)** : au score 0/1, `n=50`, `alpha=0.10` ⇒ `p=46` ⇒ COMMIT exige **≤ 4 erreurs
  sur 50** ; une baseline momentum ~50 % donne **DEFER → ABSTAIN quasi total**. La démo d'arène montrera du **silence
  calibré**, pas des trades. Question investisseur (e).
- **Résultat négatif = résultat** : S2b à ~100 % d'abstention s'écrit avec n, m, q̂ ; révision de classe par ADR, jamais
  par un alpha cosmétique. **HARD GATE Phase 3** (roadmap) = S2 sur données **réelles** ; Phase 1 le prépare.

### D11 — Liste fermée des tests nommés (acceptation)
Reprend les 7 de Grok (doc 10 §5, input) **réécrits pour nos contrats** + nos ajouts. **Lot H** :
1. `under_calib_abstains` (n=10<50 ⇒ pas de q̂, `under_calib`) · 2. `intent_not_in_region_denied` (littéral gelé
`intent_not_in_region`, `enums.ts:11` — C12a) · 3. `timeout_is_deny` (`upstream_timeout`) · 4. `no_p_correct_field`
(via `serializeVerdict` Phase 0) · 5. `empty_set_not_allow` (**garde, vacuous au score 0/1** : q̂∈{0,1} ⇒ C jamais vide —
étiqueté, C12b) · 6. `set_too_large_defers` (q̂=1 ⇒ DEFER) · 7. `deferral_preserves_miscover` (H3, identité) ·
8. `quantile_formula_n_plus_1` (oracle sur vecteurs fixes) · 9. `imocp_update_direction` (**mécanisme** : miscover ↑ r,
cover ↓ r — pas une garantie, C1/C2) · 10. `budget_ignores_pending_label` (mécanisme H4 : B_t ne lit pas y_t ; delay=0 ne
« peek » pas) · 11. `budget_exhausted_refuses_commit` (H5, B_floor) · 12. `commit_error_not_alpha_is_labelled` (H2.3 :
le chiffre desk sort étiqueté ; la tournure interdite fait échouer le gate vocab) · 13. `calib_digest_matches_contracts`
(digest du verdict = `calibDigest(scores)` Phase 0) · 14. `fixtures_hash_stable` (jeu **synthétique par graine**
3 COMMIT / 2 DEFER / 3 ABSTAIN / 1 `under_calib`, produit par l'oracle didactique + mutants — C9 ; hash committé, dérive
sans ADR = bug) · 15. `interval_lo_le_hi` (M5, `buildIntervalRegion`, C4) · 16. `unbounded_is_abstain` (C4) ·
17. `features_strictly_before_t` (D7 : aucune bougie-feature terminée **après** t — indice `> t` rejeté, `close[t]`
accepté ; le label de `[t, t+15)` n'entre jamais).
**Racine (CA-0, hors lots, exécuté par les deux worktrees)** : `contracts_frozen` (D2) — `test/contracts-frozen.test.ts`
à la racine du workspace, ajouté au glob `npm test` ; ni H ni U ne le portent, **les deux** le subissent.
**Lot U** : 18. `clearing_fixed_point` (Phi(p*)=p*) · 19. `fictitious_default_le_n_rounds` · 20. `uniqueness_when_e_positive`
**+ contrôle négatif** App. 2 (`e=(0,0)` ⇒ `p+ ≠ p-` ; `e=(0.01,0)` ⇒ égalité — C10) · 21. `nonexpansive_in_e`
(empirique sur fixture, inférence K4:90) · 22. `liquidable_amount_eq3` (cible A sur fixture, recalculable) ·
23. `prediction_numeric_emitted` (`Prediction{yhat:number, predictor_id="internal:ukemi-cascade-v0"}` passe
`serializePrediction` + schéma ajv).

### D12 — Discipline (inchangée) et roster
Workers **`claude-opus-4-8` effort max** (Gate-0 au premier worker de chaque lot) ; relecteurs G2 = instances séparées,
contexte frais ; **seul l'orchestrateur committe** (R-19/R-20) ; journal de provenance par lot ; `error_origin` au G7 ;
vocab gate + `tsc --strict` + `node:test` bloquants ; R-8 avant toute dépendance (**objectif : zéro dépendance runtime**
pour les deux moteurs). Lectures nouvelles éventuelles = lecteurs `claude-sonnet-5` max, PDF pré-extraits (doc 03 §6).

### D13 — Note MAST (modes d'échec multi-agents, checklist de risque résiduel — C3)
| Mode MAST | Où il frappe ici | Contre-mesure imposée par le système |
|---|---|---|
| Désalignement inter-agents sur les contrats | deux worktrees lisant `contracts` | `contracts_frozen` = **test racine** (`test/contracts-frozen.test.ts`, CA-0), exécuté par `npm run ci` dans **chaque** worktree, hors comptage par lot ; toute dérive = rouge |
| Extension non autorisée (enum `method`/`reason`) | un worker « ajoute une raison utile » | enums gelés + `enums.test.ts` Phase 0 ; nouvelle valeur = ADR seulement |
| Duplication d'invariant (`lo<=hi`) | H et U écrivent chacun leur région | **un seul** constructeur, Lot H (D9/C4) ; U n'émet pas de région |
| Conflit sur la racine workspace partagée | `package.json`, lockfile, `npm run ci` | **zéro dépendance runtime** (aucune écriture lockfile) ; les lots ne touchent que `packages/<lot>/**` ; merge par l'orchestrateur seul |
| Terminaison prématurée (« tests verts, fini ») | un worker clôt sans rapport S2 ou README | CA fermés (§3) ; G7 ne consomme qu'un lot **complet** |
| Revue complaisante | G2 par un worker ayant vu le contexte | instance **séparée, contexte frais**, checklist G2 ; R-21 orchestrateur |
| Perte d'information (résultat négatif tu) | S2b « décevant » adouci | table recalculable + « résultat négatif = résultat » (D10) |

## 3. Critères d'acceptation Phase 1 (fermés)
- **CA-H1** les 17 tests Lot H passent ; **CA-H2** rapport S2a (synthétique, déclaré) + S2b (fixtures **étiquetées**
  synthétique / réel-rejoué, baseline D7) avec les 6 blocs de table et M1-M5 ; **CA-H3** aucun mot du gate vocab ;
  **CA-H4** les `CoverageVerdict`/`GateDecision` émis passent `serialize*` Phase 0 et les schémas ajv ; **CA-H5**
  `buildIntervalRegion` refuse `lo>hi` et toute borne non finie (⇒ abstention).
- **CA-U1** les 6 tests Lot U passent ; **CA-U2** une `Prediction{yhat:number}` émise via `@monark/contracts` sur
  fixture (aucune région en Phase 1) ; **CA-U3** cible A + horizon écrits dans le README du package avec « déclaré, non
  fondé » et la réserve C13d.
- **CA-0** test racine `contracts_frozen` vert **dans les deux worktrees** (hors CA-H1/CA-U1 ; 17 + 6 + 1 = 24 tests) ;
  **0 remote** ; G2 par lot ; G7 ; checkpoint 2.

## 4. Pendants formés (zéro dette nue)
- **Investisseur** : (a) venue + conditions d'usage de l'endpoint prix S2b (D8) ; (b) ratification ADR-CERT-MONARK
  **avant Phase 3** (inchangé) ; (c) confirmer D9 (UKEMI = brique-moteur, pas de G0 produit) comme lecture de sa
  décision ; **(d)** l'horizon 15 min de la cible A n'est pas l'objet payé (VaR 99 %/24 h) — accepté comme brique
  fixture Phase 1 ? ; **(e)** S2b avec baseline momentum à α=0,10 ⇒ DEFER/ABSTAIN quasi total : la démo d'arène montrera
  du **silence calibré** — accepté pour la deadline, ou autoriser un cadrage « démo de mécanisme » (oracle didactique
  **étiqueté**) ? ; **(f)** skill Hermes + atelier/démo reportés Phase 2 (C6) — réduction de périmètre par rapport à sa
  décision, motivée par le prédicteur réel (clé) : accepté ?
- **Phase 2** : prédicteur UsePod/Hermes (clé, Python) ; `crossAgentGate` sur `AttestedPrice` réel ; adaptateur « sens
  émis » ; label par `AttestedPrice` (ADR-M001 l.166 rétabli) ; surface de skill + atelier ; **branche (a) de L2**
  (`C_t` par `r_t`) par ADR après S2 réel ; DtACI en repli nommé si S2b montre un drift que IM-OCP ne suit pas.
- **Procurements (mainteneur, inchangés)** : P-K4-1 Rogers & Veraart (DOI 10.1287/mnsc.1120.1569), P-K4-2 Cifuentes,
  Ferrucci & Shin (DOI 10.1162/jeea.2005.3.2-3.556) — canal endogène ; PM-6 votes Aave exécutés.
- **DEVOPS avant tout remote** : eslint, SHA-pin, commits signés (ADR-M001 D8).

## 5. Alternatives écartées
- Trois lots (dont un « MONARK gate ») : contredit ADR-M001 et le garde-fou de réduction.
- Prédicteur LLM en Phase 1 : credentials + Python + Hermes = Phase 2 ; sinon S2b « tourne » sur un mock qui wrap.
- DtACI en L2 : hypothèses de couverture locale non testées ; gardé en repli.
- UKEMI G0 produit : interdit par G7 §5 tant qu'aucune exigence de couverture nommée.
- Score k=5 self-consistency : instrument seulement, bloc distinct, jamais mélangé (ADR-0007 Grok, input).
