# ADR-M002 — Phase 1 (G0) : moteurs HIKAE (HAC-CP, beachhead `btc-dir-15m`) et UKEMI (noyau de clearing)
- **Statut** : **ACCEPTÉ-AVEC-CORRECTIONS** par le validateur-humain (checkpoint 1, 2026-09-04, modèle résolu
  `claude-fable-5-1`) → **corrections C1-C13 intégrées** → **quick-verify OK au 4e passage (2026-09-04)** → **amendé
  par les décisions investisseur (a)-(f) du 2026-09-04** (posées en langage simple ; D8, D9, §4) → **quick-verify
  d'amendement OK** (validateur `claude-fable-5-1`, deux corrections de forme intégrées) → **amendement n°2 « cap
  hackathon » (D0, Lot D, KAIZEN) le 2026-09-04** : validateur **ACCEPTE-AVEC-CORRECTIONS** (10 items, intégrés ;
  H et U relançables immédiatement, D après les deux fichiers racine). Code Phase 1 : lots H et U en cours.
- **Rattachement** : `ROADMAP-MONARK.md` §Phase 1 (engine-first, décision investisseur 2026-09-04) ; ADR-M001 (Phase 0
  close, commits `357ef25` + `b526dbd`, contrats gelés) ; `hikae/GROK-DECORTICATION.md` §9 (idées adoptées, code le
  nôtre) ; `hikae/VERDICT-TASKCLASS-GROK.md` §3-4 (btc-dir fondé sur Barber/Su, pas sur les ancres GPU) ;
  `liquidations/G7-VERDICT-UKEMI.md` §5-6 (porte G0 UKEMI) ; `ADR-CERT-MONARK-reconciliation.md` (B_t attaché à MONARK).
- **Provenance / Gate-0** : écrit par l'orchestrateur. Advisor (canal intégré) consulté **avant** rédaction : périmètre
  ramené à **deux lots** (le gate cross-agent `crossAgentGate` reste **Phase 2**, ADR-M001 + stub `packages/monark`) —
  un **troisième lot D (écran de démo)** ajouté plus tard le même jour par la décision investisseur D0, sans rouvrir le
  gate cross-agent ;
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
**intouché**. Le code est **le nôtre** ; l'app Grok (`F:/PRODUITS/downloads-monark/grok 1`) est **input de conception**, jamais liftée.

## 2. Décisions

### D0 — Cap hackathon (décisions investisseur 2026-09-04 ; supersède ROADMAP §3 Phase 3 « HARD GATE » et §6)
Page `clawpump.tech/ansemhack` lue le 2026-09-04 : tokenize **20 sept. 23:59 UTC**, judging 21-30 sept., winners
1er oct. Critères verbatim : « Builders onboarded, Onchain volume, Attention garnered, $ANSEM volume, Deploy early ».
**Décisions** : (1) re-séquencement — Phase 1 compressée (moteurs sur fixtures + écran de démo), Phase 2 = UsePod
réel + chaîne cross-agent, Phase 3 = vitrine + token **tôt** (« deploy early ») ; (2) la barrière « rien de public avant
S2 réel » devient « **on publie ce qui a tourné, chiffres n / couverture / abstention, négatifs compris** » ; (3)
tracks : **pump.fun** (tooling/skills/harness) + **UsePod** (profondeur d'inférence) ; (4) **pas de trading** dans
MONARK (→ KAIZEN, produit futur). Réservé à l'investisseur : clés API, comptes, token, post X. La **discipline 09**
(= `09-vocabulaire.md` **de Grok**, adoptée via ADR-M001 D8 et `scripts/grep-forbidden.mjs` ; le `09` de Shōgen est
son homonyme, non visé ici) et les gates G0-G7 sont **inchangés** : la vitesse ne suspend aucun gate (R-22) ; elle
raccourcit les lots, pas les revues.
**Forme falsifiable de « on publie ce qui a tourné, négatifs compris »** : tout chiffre rendu public porte la **ligne
D10** — `n`, étiquette de provenance (`synthétique` / `réel-rejoué` / `réel`), date, hash du journal brut — ; un chiffre
public **sans `n` ni étiquette** est un **défaut**, du même statut qu'un chiffre sans source (doc 03) ; le résultat
négatif se publie avec les mêmes champs.

### D1 — Trois lots (H, U, D), trois worktrees
- **Lot H (HIKAE)** : `packages/hikae` — HAC-CP L1/L2/L3 + instrument S2 + tests nommés.
- **Lot U (UKEMI)** : `packages/ukemi` — noyau de clearing Eisenberg-Noe + cible/horizon déclarés ; émet en Phase 1
  une **`Prediction{yhat: number, predictor_id}`** sur fixture (**pas** de région `interval` : l'émission d'une région
  est un travail de conformeur, propriété du Lot H — C4). **Aucune dépendance Lot U → Lot H.**
- **Lot D (ÉCRAN DE DÉMO) — ajouté par la décision investisseur « cap hackathon » du 2026-09-04 (inverse (f))** :
  `packages/atelier` — atelier **local** (page web servie en local, zéro dépendance runtime, TS + HTML/CSS/JS
  vanilla, **pas** de framework) qui montre le gate **en direct** : verdict (set / abstain), décision COMMIT / DEFER /
  ABSTAIN avec sa raison, **budget B_t qui se consomme**, **deux horloges** — à l'écran, nommées pour ce qu'elles sont
  sur fixtures : « **couverture avant décision** » / « **label arrivé à t+w** » (l'explication « avant l'ordre / après
  le fill ; le kill-switch n'est pas un stop-loss » reste dans cet ADR et le README, **pas dans le rendu** : MONARK ne
  passe aucun ordre), et la chaîne **Shōgen → HIKAE → UKEMI** en trois panneaux. Conçu pour
  le **stream de jugement**. Consomme les moteurs des lots H et U **par leurs contrats** (fixtures en Phase 1, UsePod
  réel en Phase 2). Inspiré de l'atelier Grok (input), **code le nôtre**, jamais lifté. **Dépend de H et U → démarre sur
  les contrats gelés + le `fixtures/` racine, se branche aux moteurs à leur merge.** Aucun mot du gate vocab à l'écran.
  L'atelier porte son propre `tsconfig.json` (`lib: ["ES2023","DOM"]`), la racine reste intouchée (D13).
- **Deux fichiers racine, écrits par l'orchestrateur AVANT le fan-out D (frères de CA-0 ; générateur = orchestrateur,
  consigné au journal, relus au G2)** : (1) `vocab-banned.json` — liste `BANNED` exportée, lue par
  `scripts/grep-forbidden.mjs`, **motif ajouté** `\d+\s?%\s?(de\s)?\w*\s?(correct|corrects|gagnant|winning)` (attrape
  « X % de fills corrects » pour tout X), parcours étendu à `packages/atelier/**/*.{ts,js,html,css}` ; (2)
  `fixtures/` — les **9 états** (3 COMMIT / 2 DEFER / 3 ABSTAIN / 1 under_calib) en JSON **valides ajv** contre les
  schémas gelés, avec `fixtures/manifest.json` (sha256) et un test racine `fixtures_root_valid` ; lus par **D** (rejeu)
  et par **H** en oracle de conformité (le test 14 de H garde son propre jeu généré par graine — pas de duplication
  d'invariant : deux jeux, deux rôles, deux hashes).
- **Surface de skill Hermes** (`hikae_calibrate/conform/gate`) : **Phase 2** (elle exige le prédicteur réel et une clé
  API — réservée à l'investisseur).
- **Pas de trading dans MONARK (décision investisseur 2026-09-04)** : HIKAE **gate** `perps_order_preview/execute`
  mais MONARK **ne les appelle jamais** — ni réel ni paper. Le trading est un **produit futur, KAIZEN** (flotte
  d'agents, décisions d'investissement multi-marchés, analyses multi-disciplines, semi-autonome → autonome avec la
  phase Kraidle), **après** MONARK. L'angle hackathon pump.fun est donc « agent that does real work : new tooling,
  new skills, use of the Hermes harness nobody has tried », plus le track UsePod.
- **Pas de lot MONARK** : `crossAgentGate` (un `AttestedPrice` **réel** → verdict → décision, end-to-end) est le jalon
  **Phase 2** (ADR-M001 ; stub `packages/monark/src/index.ts`). Garde-fou de réduction AgileGates : fan-out par
  **isolation** (deux moteurs indépendants + un écran qui ne les consomme que par contrat), pas par débit.
- Worktrees git isolés (`F:\Monark` main → `Monark-wt-hikae`, `Monark-wt-ukemi`, `Monark-wt-atelier`) ; **local-only,
  0 remote** jusqu'à la passe DEVOPS (SHA-pin, commits signés) qui précède la vitrine publique.
- **Fan-out justifié par l'isolation** : trois moteurs/écrans à frontières de contrat ; le Lot D est le seul qui
  consomme les deux autres — par contrats gelés + fixtures, jamais par import de leur code avant merge.

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
- **Cross-ref 2026-09-17 (ADR-M009, proposé)** : `imocpStep` est généralisé par un **calendrier de pas décroissant** (quantile tracker ABB 2024, primitive `packages/hikae/src/tracker.ts`) — **branche (b) inchangée**, aucun consommateur d'ensemble, `B_t` reste calculé contre le `q̂` statique ; tout passage à la branche (a) exige d'abord la redéfinition de `B_t` (D5/D6).

### D5 — L3 : politique d'engagement différé (prédicat fermé)
```
ABSTAIN  si n<n_min | intent not in C | B_t<B_floor | horloge close | timeout | parse non_evaluable
DEFER    si |C|>tau et horloge ouverte
COMMIT   si intent in C, |C|<=tau, B_t>=B_floor
```
- DEFER ≠ ABSTAIN (attend vs refuse) ; horloge close ⇒ DEFER → ABSTAIN `clock_expired`. Le PnL n'entre pas dans pi.
- **Amendé M011 (2026-09-17, NDG-1)** : le prédicat ABSTAIN `under_calib` fire aussi sur `verdict.reason === "under_calib"` (D6(b)), et le chemin `interval` ajoute `lo >= hi` (largeur nulle) ⇒ `under_calib`, jamais COMMIT. Voir `docs/adr/ADR-M011-interval-non-degenerescence.md`.
- **Propriétés exécutables** (oracle non-LLM) : **H3** — la somme des miscovers est identique sous pi0 (commit dès
  intent in C) et pi^H (identité pure ⇒ test de propriété) ; **H2.3** — l'erreur conditionnelle à COMMIT **n'est pas**
  bornée par alpha : chiffre de desk **étiqueté**, et la tournure « X % de fills corrects » entre dans le **gate
  vocabulaire** (interdite).
- Raisons = l'enum gelé `CoverageVerdict.reason` (13 littéraux, ADR-M001) — aucune nouvelle raison sans ADR.

### D6 — Paramètres v0 : budgets déclarés, non fondés
`alpha=0.10`, `n_min=50`, `tau=1`, `k=1`, `eta=0.05`, `B_floor=0`, `w=15 min`, `label_delay=1` fenêtre. Grok = input ;
**aucun n'est fondé** par une source — écrit tel quel dans le journal S2. Toute valeur change par ADR.

### Amendement 2026-09-18 (mesure M009 (a)) — `B_floor = 0` mesuré sur traces S2 ; PROPOSÉ, décision investisseur

**Aucune valeur committée changée par cet amendement.** `B_floor` reste `0` tant que l'investisseur n'a pas
tranché. Item ADR-M009 (a) (P(B_t<0) « 35 %→47 % [abs] », préexistant à ACI) désormais **mesuré** sur la
suite de miscovers RÉELLE des traces S2 Shōgen — rapport `docs/measure-M009a.md`, script
`scripts/measure-m009a.mjs` (sha256 des jsonl épinglés), contre-contrôlé sur le reader `shogen_s2`
(Decimal-50). Miscover = **co-défaillance ≥2 sources présentes** (attestation ratée au sens τ/σ, K&L
`r1.py:415` ; pyth exclu, ADR-0023 Shōgen).

- **Fait [mesuré]** (n = 26 938 fenêtres) : taux de miscover réel **1,02 %** (canonique) / 5,03 % (K brut,
  pyth inclus), **≪ alpha = 10 %**. `P(B_t < 0)` **canonique ≈ 0 % (analytique/i.i.d.) à ≤ 3 % (empirique,
  burstiness)** aux horizons t°=30/90/365, vs **35,3 %→49,1 % [abs]** (le [abs] est la binomiale au **bord**,
  `p̂ = alpha` ; reproduit exactement). Sur la campagne réelle, **`B_t` n'est jamais descendu sous 0** (min
  0,0885 canonique / 0,0478 K brut) : **zéro `budget_exhausted` parasite**. Ordre 2 : le processus est en
  **rafales** (empirique > i.i.d.) — analogue de l'ACF d'ADR-M009 (§Contexte) ; au bord, l'autocorrélation
  aggraverait `budget_exhausted`. **Transitoire** : `B_t < 0` dès **un** miscover si `t° < 1/alpha = 10`
  (`alpha − 1/t° < 0`) ; le « zéro parasite » réel tient parce que les 9 premières fenêtres furent propres. Le
  [abs] démarre à t°=30 ; en deçà le budget est trivialement fragile et `n_min = 50` ne garde **pas** `t°`
  (ce sont deux compteurs distincts) — argument de plus pour l'option (b).
- **Correction de signe (load-bearing)** : `budget_exhausted ⟺ remainingBudget < B_floor` (`l3-gate.ts:100/126`)
  ⟺ `p̂ > alpha − B_floor`. Un **`B_floor > 0` abstient PLUS TÔT** (seuil abaissé, plus strict) — il
  **aggrave** l'abstention parasite au bord, il ne la corrige pas. La seule « tolérance » (`B_floor < 0`) est
  **rejetée** par `gate.ts:169` (`B_floor ≥ 0` requis).
- **Deux options, décision investisseur** (P5 — jamais un « dû » nu) :
  - **(a) `B_floor > 0` pré-enregistré** = conservatisme délibéré et explicite (abstient à `p̂ > alpha −
    B_floor`, plus prudent face au drift). Sur les données S2, tout `B_floor < 0,0478` est **inerte** (`B_t`
    est resté ≥ 0,04776 sous D1, ≥ 0,0885 sous D2). Coût : au bord vrai, il augmente `budget_exhausted`
    parasite — à chiffrer pour le `B_floor` retenu.
  - **(b) conserver `B_floor = 0` + phrase d'honnêteté** (recommandation par défaut du worker, non-verdict) :
    « au bord (taux vrai = α), `B_floor = 0` donne P(`budget_exhausted` par bruit) montant de ~35 % (t°=30)
    à ~49 % (t°=365) ; **mesuré sur les traces d'attestation S2 réelles le taux est ≤ 5 % ≪ α, donc cette
    abstention parasite ne s'est pas matérialisée** (`B_t` jamais < 0) ; la préoccupation demeure pour toute
    calibration réellement au bord et est **aggravée par la burstiness** ». Ceci **remplace** l'`échangeabilité
    déclarée` par une honnêteté chiffrée, sans toucher la valeur.
- **Rattachement** : conserve la doctrine D6 (« budgets déclarés, non fondés ») ; le passage branche (a)
  (ADR-M009 item 7) exige toujours la redéfinition de `B_t` **avant** bascule. `error_origin` = n/a (mesure).

### Décision investisseur 2026-09-20 17:44 UTC — option (b) RETENUE (ratification bFloor, décision 71)
`B_floor` reste **0**. La phrase d'honnêteté chiffrée de l'option (b) ci-dessus devient le texte normatif de D6 pour ce paramètre et **remplace** l'« échangeabilité déclarée » : au bord (taux vrai = α), `B_floor = 0` donne une probabilité d'épuisement du budget par bruit seul d'environ 35 % (t° = 30) à 49 % (t° = 365) ; mesuré sur les traces d'attestation S2 réelles (n = 26 938 fenêtres, `docs/measure-M009a.md`) le taux de miscover est ≤ 5 % ≪ α et `B_t` n'est jamais descendu sous 0 ; la préoccupation demeure pour toute calibration réellement au bord et est aggravée par les rafales. Aucune valeur committée ne change ; le passage à l'option (a) d'ADR-M009 item 7 exige toujours la redéfinition de `B_t` avant bascule. Item « ratification bFloor » : **CLOS**.
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
  **DÉCISION INVESTISSEUR (a), 2026-09-04 : Coinbase Exchange BTC-USD, bougies 15 min**, usage rapports internes
  seulement (pas un produit, rien de publié) ; moteur et S2a tournent sur **fixtures committées** ; sonde J0 avant S2b.
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
  `e` (Lemme 5, K4:63) — **[lu-archive K4]** (`liquidations/lecture/K4-systemique-clearing.md:21-63,160`). ~~La borne
  `||Δp*||_1 <= ||Δe||_1` est une **[inférence du lecteur K4:90]**, pas un énoncé du papier (C11) — le test 21 la
  vérifie empiriquement sur fixture, sans la citer comme théorème.~~ **AMENDEMENT 2026-09-04 (Lot U, orchestrateur)** :
  la lecture de la source primaire ([lu] `_txt/eisenberg2001.txt:614-660`, p.244-245) montre que le Lemme 5 énonce
  **lui-même** `e ↦ p*` « concave, increasing, and nonexpansive » (norme 1, déf. p.238) — K4:90 était une paraphrase
  fidèle, l'écart est **source ↔ implémentation**. Le calcul sur deux systèmes **réguliers, `e ≫ 0`** (chaîne :
  `||Δp*||_1 = 2||Δe||_1` exactement ; fan-in : `||Δp*||_∞ = 3||Δe||_∞`) **réfute** la non-expansivité de `e ↦ p*` en
  L1 **et** L∞ ; mécanisme `Δp*_D = (I − Π^T_DD)^{-1} Δe_D`. Le test 21 (a) confirme Φ non-expansif **en p** (Thm 1),
  (b) confirme croissance + concavité (Lemme 5, sous-énoncés tenus), (c) assert les deux ratios exacts. On n'écrit
  **pas** « Lemme 5 faux » (OCR illisible sur la formule) — pendant de lecture formé §4 (l). `error_origin` : G7.
  **Contrôle négatif d'unicité (C10)** : App. 2 E&N
  (K4:49) — deux nœuds, `e=(0,0)`, dettes mutuelles 1 ⇒ continuum `(t,t)`, `p+ ≠ p-` ; `e=(0.01, 0)` restaure l'unicité.
  Déterministe, **recalculable par quiconque** depuis `(L, e)` — même exigence que Shōgen. Sur **graphe-fixture**
  committé ; le portage DeFi (pools, pénalité de liquidation ⇒ perte d'unicité E&N p.248 ⇒ livrer `p+`/`p-` en bornes)
  est **nommé**, pas résolu.
- **Cible + horizon fixés maintenant** (SYNTHESE-LIQUIDATIONS §4.7 : aucune garantie avant) : candidat **A** — « montant
  liquidable sous un choc de prix de x % » (Perez et al. *Liquidations: DeFi on a Knife-edge*, **Eq. 3 p.7**, seul
  candidat où un prix entre formellement, `SYNTHESE-LIQUIDATIONS.md` §1 maillon 1 et §2(a) ; cible candidate A en §2(b)) ;
  **horizon = 24 h — DÉCISION INVESTISSEUR (d), 2026-09-04** (« 24 h tout de suite », contre la proposition 15 min de
  l'orchestrateur) : on vise directement l'horizon de l'objet payé (VaR 99 %/24 h, SYNTHESE §3.1). **Conséquences
  écrites** : (i) UKEMI et HIKAE ne partagent plus la fenêtre — la cible A devient, à l'intégration Phase 2, une
  **2e classe de tâche HIKAE** à horizon 24 h et `alpha = 0.01` (viser 99 %), distincte de `btc-dir-15m` ; (ii) en
  Phase 1, le choc de prix `x %` sur 24 h est un **paramètre de fixture déclaré** (pas un modèle de choc : la dynamique
  24 h est NON TROUVÉE dans le corpus, synthèse §4.7 horizons hétérogènes) ; (iii) le « 99 % » n'est **pas** produit par
  UKEMI en Phase 1 — c'est le niveau de couverture que HIKAE devra tenir plus tard, jamais un `p_correct`. Déclaré ;
  B-E nommés dans la synthèse, écartés (sans prix, ou horizon hors 24 h).
- **Canal endogène DeFi** (fire-sale bouclant sur un prix partagé) : **NON TROUVÉ** dans les 15 papiers — hors
  périmètre ; procurements P-K4-1 / P-K4-2 **tiennent** (mainteneur).
- **Ferme les pendants Phase 0 — propriétaire tranché (C4) : le Lot H.** L'invariant **M5** `lo <= hi` et la règle
  **borné ou abstention** (jamais ±inf ; borne non finie ⇒ `abstain=true`, `reason=under_calib`, miroir du refus Hikae
  de `+inf`) vivent dans **un seul constructeur** `hikae/src/region.ts::buildIntervalRegion(lo, hi)` — **pas** dans
  `contracts` (gelé, D2), **pas** dupliqué dans `ukemi`. Le Lot U ne construit aucune région en Phase 1 ; à l'intégration
  Phase 2, HIKAE conforme la `Prediction` numérique d'UKEMI en région `interval` via ce constructeur.
  - **Amendé M011 (2026-09-17, NDG-1)** : une région `interval` valide exige désormais `lo < hi` **strict** ; `lo == hi` (largeur nulle : `q̂=0` ou absorption flottante `ŷ±q̂===ŷ`) ⇒ `abstain=true, reason=under_calib` dans `buildIntervalRegion` (M5 `lo>hi`⇒throw conservé). Voir `docs/adr/ADR-M011-interval-non-degenerescence.md`.
- **Réserve C13d — levée par la décision (d)** : l'horizon est désormais **24 h**, celui de l'objet payé (SYNTHESE
  §3.1 : VaR 99 %/24 h, Chaos/LlamaRisk). Reste déclaré, non fondé : aucun acheteur n'a encore nommé une exigence de
  couverture (G7 UKEMI, NON TROUVÉ) ; le niveau 99 % est une cible HIKAE Phase 2, pas une sortie UKEMI Phase 1.

### D10 — Instrument S2 (conception **adoptée de Grok doc 11** §2, §5.1, §7, §8 — input, jamais lifté — réécrite pour
nos contrats ; harnais jetable, R-22 : ne se promeut pas) (C7)
- **S2a plomberie** : classe binaire à gold connu **hors marché** — lot **synthétique déclaré** (~~200 phrases template,
  gold déterministe~~ **amendé 2026-09-05, checkpoint 2 corr. 3** : tirage (ŷ, y) seedé, graine 101, n = 300, accuracy
  déclarée 0,96, n_calib = 150 — `generateLabeledSeries`) — tranche « le quantile et le gate sont-ils câblés ? ».
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
  `3 COMMIT / 2 DEFER / 3 ABSTAIN / 1 under_calib` du test 14, ~~via l'**oracle didactique** et des mutants~~
  **amendé 2026-09-05 (checkpoint 2 corr. 3 ; G2-H corr. 1)** : par le vrai `gate()` sur des verdicts à **scores
  déclarés** (calibration 47/50 ⇒ q̂=0 pour les COMMIT ; 25/50 ⇒ q̂=1 pour les DEFER) + mutants (timeout, intent hors
  région, budget épuisé, n<n_min) — **pas** par l'oracle didactique, qui est lui **réellement exécuté** sur la série de
  bougies seedée (bloc 6b du rapport), et **pas** `momentum-4c` ; (ii) **snapshot réel daté** (endpoint + date + hash committés, `harness_version=fixtures-real-replay`)
  rejoué hors ligne, seulement après la sonde J0. Le rapport S2b porte **« synthétique »** ou **« réel-rejoué »**.
- **Résultat attendu, en clair (C13e)** : au score 0/1, `n=50`, `alpha=0.10` ⇒ `p=46` ⇒ COMMIT exige **≤ 4 erreurs
  sur 50** ; une baseline momentum ~50 % donne **DEFER → ABSTAIN quasi total**. La démo d'arène montrera du **silence
  calibré**, pas des trades. **Tranché §4 (e), 2026-09-04** : le rapport S2b porte **deux blocs étiquetés** — bloc
  « silence réel » (`internal:momentum-4c`) et bloc « démo de mécanisme » (`internal:oracle-didactique`, marqué « pas
  un produit ») ; la présentation de démo se décide devant les chiffres.
- **Résultat négatif = résultat** : S2b à ~100 % d'abstention s'écrit avec n, m, q̂ ; révision de classe par ADR, jamais
  par un alpha cosmétique. *(Historique : « HARD GATE Phase 3 = S2 sur données réelles avant tout public » —
  **supersédé le 2026-09-04 par D0** : on publie ce qui a tourné, avec la ligne D10, négatifs compris.)*

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
3 COMMIT / 2 DEFER / 3 ABSTAIN / 1 `under_calib`, produit par ~~l'oracle didactique + mutants~~ **le vrai `gate()` sur
verdicts à scores déclarés + mutants (amendé 2026-09-05, checkpoint 2 corr. 3)** — C9 ; hash committé, dérive
sans ADR = bug) · 15. `interval_lo_le_hi` (M5, `buildIntervalRegion`, C4) · 16. `unbounded_is_abstain` (C4) ·
17. `features_strictly_before_t` (D7 : aucune bougie-feature terminée **après** t — indice `> t` rejeté, `close[t]`
accepté ; le label de `[t, t+15)` n'entre jamais).
**Racine (CA-0, hors lots, exécuté par les trois worktrees)** : `contracts_frozen` (D2) — `test/contracts-frozen.test.ts`
à la racine du workspace, ajouté au glob `npm test` ; aucun lot ne le porte, **les trois** le subissent. Second test
racine : `fixtures_root_valid` (les 9 états de `fixtures/` valides ajv + hash = `fixtures/manifest.json`).
**Lot D (atelier)** : 24. `atelier_state_oracle` (module d'état pur : pour chacun des 9 états du `fixtures/` racine,
verdict / décision / raison présents ; ~~B_t **non croissant** sur miscover~~ **amendé 2026-09-04 (G2 Lot D corr. 2)** :
B_t **porté fidèlement** (`remaining_budget` jamais recalculé ni inflé) + histoire de consommation montrée (`03` lowbudget
0.02, `08` budget_exhausted −0.02) — « non croissant sur miscover » exige le label réalisé `Y`, absent de `GateDecision`
(gelé D2) : cette propriété relève du **Lot H** (tests 9-11) ; panneau HIKAE lié champ à champ au verdict brut ; état
des deux horloges = « couverture avant décision » / « label arrivé à t+w » sur fixtures) · 25. `atelier_replays_root_fixtures` (les 9 états — 3 COMMIT /
2 DEFER / 3 ABSTAIN / 1 under_calib — sont tous rendus, chacun visible) · 26. `atelier_no_forbidden_vocab` (le rendu
HTML/JS/CSS passe `scripts/grep-forbidden.mjs`, étendu à `packages/atelier/**`, liste lue depuis `vocab-banned.json`
racine) · 27. `perps_stubs_throw` (les noms `perps_order_preview` / `perps_order_execute` sont définis au **Lot H**
(`hikae/src/l3-gate.ts`, const `GATED_TOOLS`) et exercés par le gate HIKAE comme `tool` de la décision dans
`set_too_large_defers` / `intent_not_in_region_denied` ; l'atelier porte des stubs qui **lèvent** s'ils sont invoqués) ·
28. `atelier_no_network` (grep `fetch|XMLHttpRequest|WebSocket|http\.request|net\.connect` = 0 dans
`packages/atelier/**` hors tests ; `globalThis.fetch` remplacé par un lanceur qui lève pendant le rejeu des 9 états).
**Lot U** : 18. `clearing_fixed_point` (Phi(p*)=p*) · 19. `fictitious_default_le_n_rounds` · 20. `uniqueness_when_e_positive`
**+ contrôle négatif** App. 2 (`e=(0,0)` ⇒ `p+ ≠ p-` ; `e=(0.01,0)` ⇒ égalité — C10) · 21. `nonexpansive_in_e`
(~~empirique sur fixture, inférence K4:90~~ **amendé 2026-09-04** : Φ non-expansif en p [Thm 1] + `e↦p*` croissante
et concave [Lemme 5, tenus] + **réfutation** par ratios exacts 2 [L1, chaîne] et 3 [L∞, fan-in] sur systèmes réguliers
`e ≫ 0` — voir D9) · 22. `liquidable_amount_eq3` (cible A sur fixture, choc `x %` sur **24 h**
en paramètre déclaré, recalculable) ·
23. `prediction_numeric_emitted` (`Prediction{yhat:number, predictor_id="internal:ukemi-cascade-v0"}` passe
`serializePrediction` + schéma ajv).

### D12 — Discipline (inchangée) et roster
Workers **`claude-opus-4-8` effort max** (Gate-0 au premier worker de chaque lot) ; relecteurs G2 = instances séparées,
contexte frais ; **seul l'orchestrateur committe** (R-19/R-20) ; journal de provenance par lot ; `error_origin` au G7 ;
vocab gate + `tsc --strict` + `node:test` bloquants ; R-8 avant toute dépendance (**objectif : zéro dépendance runtime**
pour les deux moteurs et l'atelier). Lectures nouvelles éventuelles = lecteurs `claude-sonnet-5` max, PDF pré-extraits (doc 03 §6).

### D13 — Note MAST (modes d'échec multi-agents, checklist de risque résiduel — C3)
| Mode MAST | Où il frappe ici | Contre-mesure imposée par le système |
|---|---|---|
| Désalignement inter-agents sur les contrats | trois worktrees lisant `contracts` | `contracts_frozen` = **test racine** (`test/contracts-frozen.test.ts`, CA-0), exécuté par `npm run ci` dans **chaque** worktree, hors comptage par lot ; toute dérive = rouge |
| Extension non autorisée (enum `method`/`reason`) | un worker « ajoute une raison utile » | enums gelés + `enums.test.ts` Phase 0 ; nouvelle valeur = ADR seulement |
| Duplication d'invariant (`lo<=hi`) | H et U écrivent chacun leur région | **un seul** constructeur, Lot H (D9/C4) ; U n'émet pas de région |
| Conflit sur la racine workspace partagée | `package.json`, lockfile, `npm run ci` | **zéro dépendance runtime** (aucune écriture lockfile) ; les lots ne touchent que `packages/<lot>/**` ; merge par l'orchestrateur seul |
| Terminaison prématurée (« tests verts, fini ») | un worker clôt sans rapport S2 ou README | CA fermés (§3) ; G7 ne consomme qu'un lot **complet** |
| Revue complaisante | G2 par un worker ayant vu le contexte | instance **séparée, contexte frais**, checklist G2 ; R-21 orchestrateur |
| Perte d'information (résultat négatif tu) | S2b « décevant » adouci | table recalculable + « résultat négatif = résultat » (D10) |
| **Pression de deadline (D0)** | lots grossis « pour aller vite », merge sans G2 consigné, publication avant checkpoint 2 | R-25 (lots petits) ; **aucun merge sans revue G2 au journal** ; **aucune publication avant checkpoint 2** ; la ligne D10 sur tout chiffre public |

## 3. Critères d'acceptation Phase 1 (fermés)
- **CA-H1** les 17 tests Lot H passent ; **CA-H2** rapport S2a (synthétique, déclaré) + S2b (fixtures **étiquetées**
  synthétique / réel-rejoué, baseline D7) avec les 6 blocs de table (paramètres, journal, S2a, S2b par strate et poolé,
  mutants, tête), M1-M5, **et les deux blocs étiquetés de (e)** : « silence réel » (`internal:momentum-4c`) et « démo de
  mécanisme » (`internal:oracle-didactique`, « pas un produit ») ; **CA-H3** aucun mot du gate vocab ;
  **CA-H4** les `CoverageVerdict`/`GateDecision` émis passent `serialize*` Phase 0 et les schémas ajv ; **CA-H5**
  `buildIntervalRegion` refuse `lo>hi` et toute borne non finie (⇒ abstention).
- **CA-U1** les 6 tests Lot U passent ; **CA-U2** une `Prediction{yhat:number}` émise via `@monark/contracts` sur
  fixture (aucune région en Phase 1) ; **CA-U3** cible A + **horizon 24 h (décision investisseur (d))** écrits dans le
  README du package avec « déclaré, non fondé », les trois conséquences (i)-(iii) de D9, et sans aucun « 99 % » présenté
  comme une sortie.
- **CA-D1** (Lot D) — **oracle** : test 24 (module d'état pur) ; **visuel** : l'atelier démarre en local
  (`npm run atelier`) sans réseau ni clé et affiche les trois panneaux Shōgen → HIKAE → UKEMI, le verdict, la décision
  et sa raison, **B_t qui se consomme**, les **deux horloges** — vérifié par **capture d'écran au checkpoint 2** ;
  **CA-D2** = test 25 (rejeu des 9 états du `fixtures/` racine) ; **CA-D3** = test 26 ; **CA-D4** = tests 27 + 28
  (les stubs prouvent le chemin de refus ; l'absence d'appel est prouvée par grep + `fetch` remplacé) ; **CA-D5** zéro
  dépendance runtime, `tsconfig` propre à l'atelier (`lib: DOM`), racine intouchée.
- **CA-0** test racine `contracts_frozen` vert **dans les trois worktrees** (hors CA-H1/CA-U1/CA-D ; 17 + 6 + 5 + 1 =
  **29** tests) ;
  **0 remote** ; G2 par lot ; G7 ; checkpoint 2.

## 4. Pendants formés (zéro dette nue)
- **Investisseur — les six questions formées ont été posées en langage simple et TRANCHÉES le 2026-09-04** :
  **(a)** Coinbase Exchange BTC-USD, bougies 15 min, rapports internes → **décidé** (D8) ; **(b)** ADR-CERT-MONARK →
  **RATIFIÉ** (statut mis à jour dans l'ADR) ; **(c)** UKEMI = brique-moteur MONARK, pas de G0 produit → **confirmé**
  (D9) ; **(d)** horizon UKEMI → **24 h tout de suite** (contre la proposition 15 min ; D9 amendé, conséquences
  (i)-(iii)) ; **(e)** présentation S2b (silence seul / mécanisme étiqueté) → **« décider plus tard »** : le moteur se
  construit, le rapport S2b porte les **deux** blocs étiquetés (silence réel avec `internal:momentum-4c` ; mécanisme
  avec `internal:oracle-didactique`, marqué « pas un produit »), et la **présentation** de démo sera tranchée devant
  les chiffres — **pendant investisseur ouvert, formé, échéance : lecture du rapport S2b** ; **(f)** skill Hermes →
  Phase 2 **accepté** ; atelier → **inversé le même jour par le cap hackathon (D0) : Lot D maintenant**.
- **Investisseur — cap hackathon (2026-09-04, quatre questions, tranchées)** : re-séquencement **oui** ; tracks
  **pump.fun + UsePod** ; écran de démo **maintenant** ; trading **non** (→ KAIZEN, produit futur, après MONARK).
  **Pendants formés (investisseur)** : (g) accès UsePod (clé API — jamais saisie par l'orchestrateur), **échéance :
  avant le 10 septembre** (le track UsePod est vide sans elle, sur 16 jours de runway) ; (h) date du lancement token /
  post X (« deploy early »), **à fixer avant le 10 septembre** ; (i) **passe DEVOPS** (SHA-pin, commits signés, remote)
  = chemin critique de tout ce qui est public — **planifiée juste après le merge des lots H/U/D**, avant toute vitrine ;
  (j) **« builders onboarded »** : rien n'est onboardable avant la Phase 2 (skill Hermes, 0 remote) — nommé, à
  trancher avec (h) ; (k) **volume on-chain / $ANSEM** = le token MONARK seul (pas de perps) — hors périmètre de cet
  ADR, nommé.
- **Phase 2** : prédicteur UsePod/Hermes (clé, Python) ; `crossAgentGate` sur `AttestedPrice` réel ; adaptateur « sens
  émis » ; label par `AttestedPrice` (ADR-M001 l.166 rétabli) ; surface de skill + atelier ; **branche (a) de L2**
  (`C_t` par `r_t`) par ADR après S2 réel ; DtACI en repli nommé si S2b montre un drift que IM-OCP ne suit pas.
- **(l) Lecture formée — E&N Lemme 5 sur page rendue (ajouté 2026-09-04, Lot U)** : lecteur Sonnet 5 (`lecteur.md`,
  doc 03 §6, exception page rendue car la formule est illisible dans `_txt`) sur le PDF Eisenberg & Noe 2001, **p.244-245
  et p.238** : (1) énoncé exact du Lemme 5 (l'objet : `e ↦ p*` ? la norme : `||·||_1` ? le domaine : `ℝⁿ₊₊` ?) ; (2) la
  définition « 1-nonexpansive » p.238 ; (3) l'étape d'induction `f_n(e) = F(f_{n-1}(e), e)` et la constante obtenue.
  Usage : adjudiquer l'`error_origin` du test 21 au G7 (papier / archive / implémentation). Contexte déjà fermé sans
  lecture : l'amplification réseau est **connue et citée** dans le corpus ([lu-archive] `detering2020.txt` l.53, 108,
  951, 958) — le phénomène n'est pas en question, seule la formulation exacte de la source l'est.
  **CLOS le 2026-09-05** — lecture faite sur page rendue ([lu], `docs/lecture-EN-lemme5.md`) : norme **ℓ¹** explicite
  (p.238), Lemme 5 énonce `e ↦ FIX(Φ(·;Π,p̄,e))` « concave, increasing, and nonexpansive » sur `e ∈ ℝⁿ₊₊` (pp.244-245),
  induction `f_n = F(f_{n−1}(e), e)` avec « F … nonexpansive » jointement, **aucune norme reprécisée, aucune hypothèse
  supplémentaire** (p.245). `error_origin` test 21 = **source** (sous-énoncé « nonexpansive » non soutenu par l'étape
  d'induction — constante `n`, pas 1 — et contredit par calcul dans le domaine énoncé) ; archive K4:90 fidèle ;
  implémentation correcte. Nouveau pendant né de la lecture : **P-EN-249** — page imprimée 249 absente du PDF local
  (fin App. 1 / références) ; procurement formé dans `docs/lecture-EN-lemme5.md` ; non bloquant.
- **Procurements (mainteneur, inchangés)** : P-K4-1 Rogers & Veraart (DOI 10.1287/mnsc.1120.1569), P-K4-2 Cifuentes,
  Ferrucci & Shin (DOI 10.1162/jeea.2005.3.2-3.556) — canal endogène ; PM-6 votes Aave exécutés.
- **DEVOPS avant tout remote** : eslint, SHA-pin, commits signés (ADR-M001 D8).

## 5. Alternatives écartées
- Un **lot cross-agent** (`crossAgentGate` sur `AttestedPrice` réel) en Phase 1 : contredit ADR-M001 (jalon Phase 2)
  et le garde-fou de réduction. (Le Lot D atelier, ajouté par D0, n'est pas ce lot : il rejoue des fixtures.)
- Prédicteur LLM en Phase 1 : credentials + Python + Hermes = Phase 2 ; sinon S2b « tourne » sur un mock qui wrap.
- DtACI en L2 : hypothèses de couverture locale non testées ; gardé en repli.
- UKEMI G0 produit : interdit par G7 §5 tant qu'aucune exigence de couverture nommée.
- Score k=5 self-consistency : instrument seulement, bloc distinct, jamais mélangé (ADR-0007 Grok, input).
