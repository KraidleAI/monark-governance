# Avis advisor-defi (second avis du jour) — étude de portefeuille Action 1 — 2026-09-18 — archivage (C-2 du checkpoint-1)

> Instance `advisor-defi` (`claude-fable-5-1`), Bash vérification seule ; avis, pas verdict. [mesuré] = recomputé par l'advisor en session.

## Mesuré
`calibration.ts` : n = 613 scores, 129 nuls (21,0 %), q̂(α = 0,10) = 1,3119e-4/h, q99 = 3,4009e-4/h, médiane 1,25e-6/h, max 4,13e-4/h.
`state.json` : T = 0, une ligne (2026-09-17, `non_evaluable`, B_t = 0,1, drift_flag false), `projected_bound_leq_target_T = 1789`.
`enums.ts:7-21` : 13 raisons gelées ; `under_witness` n'existe dans aucun enum (seulement dans le texte d'ADR-M008:93).
L'avis (c′) n'était dans aucun artefact lisible ⇒ archivé depuis (AVIS-advisor-defi-2e-cle-c-prime.md).

## Q1 — Paire (ŷ, y) par pièce (verdict = région)
| Pièce | ŷ | y | Données / held-out | Dégénérescence | Région |
|---|---|---|---|---|---|
| Mokugeki | aucune paire propre (capteur) ; chez Verdict : set {uma_yes, uma_no, too_early} | adjudication UMA | logs UMA/Polymarket ; MSTR 2026-06-01 | score indicateur binaire ⇒ q̂ ∈ {0,1} ; `AttestedDoc` non gelé | non calibrable comme pièce ; après mesure chez Verdict |
| Kaihi | intervalle de LVR (bps) 5–60 min | LVR réalisé | subgraph Uniswap v3 ; held-out NON TROUVÉ | LVR ∝ σ² ⇒ Mondrian par tranche de vol ; référence de prix = le label | calibrable après mesure |
| Kessai | IS estimé par venue | fill réalisé | APIs 1inch/CoW/Odos | le fill n'existe que si MONARK exécute (D0) ; biais de sélection ; le « reçu » = attestation | non calibrable |
| Kamae | fair de payoff | mid / PnL | HL/Polymarket ; Fartcoin/HLP 2026-04-09 [abs] | PnL non observable sans desk ; abstention = politique (Chow) | non calibrable |
| Kyokusen | résidu implied − NS fitted | résidu suivant | courbes Pendle + liquidations Morpho ; PT-reUSD 2026-08-25 | non-stationnaire vers maturité (Mondrian par time-to-maturity) ; épisode = TWAP 15 min | calibrable après mesure (horizon et strate à fixer AVANT) |
| **Koyomi** | intervalle de gap avant vendredi 21:00 UTC | log-gap marque HIP-3 clampée → premier print de l'oracle à la réouverture | archive HIP-3 à mesurer ; 2026-07-27 [abs] à recomputer | Mondrian par marché (144 lois) ; y (a) « perte réalisée » zéro-inflatée rejeté | **calibrable après mesure** (seule des 7 avec paires denses + held-out en fenêtre) |
| Genkan | — | « transfert jugé malveillant après coup » : rare, retardé, jamais étiqueté | Bankr/Grok mai 2026 | set {benign} toujours couvert et inutile | non calibrable ; **politique** |
Synthèse : 1 nette (Koyomi), 2 conditionnelles (Kaihi, Kyokusen), 1 déplacée (Mokugeki → Verdict), 3 non calibrables (Kessai, Kamae, Genkan).

## Q2 — Enrichir : ordre par valeur statistique réelle
1. **Tracker → gate** : la plus haute valeur en principe (L1 → branche (a) change le type de garantie) mais gatée par (iii) (≈ 100 j après J0 ;
   T = 0 ; borne vide ~1789 j) ; rien à construire ni promettre en 12 mois.
2. **Classe horaire `flow-redeem-1h` / `utilization-lock-1h`** : valide seulement sur une population à churn horaire ; USDe (21 % de scores nuls au
   quotidien) dégénère en horaire ; sUSDe seul candidat plausible. **Contradiction de nommage tranchée : coexistence, pas supersession** (deux horizons
   = deux lois, une région chacune). Coût ×24 pulls sur archive à 2 fournisseurs.
3. **Prise `AttestedPrice` dans `gate`** : valeur = traçabilité, pas couverture ; sans témoin vivant, ne sert que la fixture Binance (à dire).
4. **B_t persistant** : valeur statistique nulle (moniteur bruyant, P(B_t < 0) 0,35–0,49) ; existe déjà dans la timeline pour Narabi.
5. **Extension USDe 11 mois (c′)** : test discriminant = touche-t-elle les scores committés ? Si oui, refus (recalibration hors ADR de dérive, antériorité
   détruite) ; si non = rejeu à digest séparé = item (l), déjà formé. (Réconciliation orchestrateur : c'est (l), avec le test de couverture ε = 0,05 de (c′).)
Revendication publique nouvelle et honnête : seulement une 2ᵉ clé mesurée ou une classe horaire mesurée non dégénérée.

## Q3 — Genkan : politique, pas région
Forme honnête livrable : allowlist gouvernée + attestation de la provenance de l'instruction (forme Shōgen) ; fail-closed sur classe inconnue
(`gate.ts:551`) ; règle de décision côté appelant ; une allowance persistante. Piège : ne pas nommer B_t un plafond de dépense sans labels ni le loger
dans `remaining_budget` gelé sans ADR. Aucune revendication statistique nouvelle ; plus-value commerciale (GTM beachhead), pas statistique.

## Q4 — Koyomi
y = gap log-return marque clampée → premier print oracle à la réouverture (dense, un par week-end par marché, attestable) ; Mondrian par marché
(actions / indices / matières premières au minimum) ; week-ends calmes = calibration, incidents = hors-échantillon. Réserves : chiffres du 27 juillet
[abs] à recomputer ; vérifier discontinuité de réouverture vs événement corporate ; profondeur d'archive HIP-3 à mesurer ; ne pas mélanger avec la
clé USDC calendaire. Coût NET seul, GEL 0.

## Q5 — Ordre 12 mois
0–3 mois : 2ᵉ clé Narabi (décision investisseur ; avis : sUSDe pour le churn, régime 1 jour seul, co-variable de breadth pré-enregistrée ; FDUSD en
repli avec classe « rafale ») ; rejeu (l) à T ≥ 7 ; (iii) court. 3–6 mois : census Koyomi (seuils avant pull, quorum, sha-pin), G0 seulement si non
dégénéré et acheteur nommé. 6–12 mois : classe horaire sur la population qui l'aura méritée ; prise `AttestedPrice` quand un témoin vivant existe ;
Genkan = interception sans région. Bascule : acheteur nommé sur une pièce ; (iii) qui tire ; archive HIP-3 inaccessible ; (c′) touchant les scores
committés (à refuser). Pièges : surclaim « adaptatif » ; chiffres [abs] présentés comme faits ; résidus nouveaux (12 vs 7) = ADR + re-pin ;
`under_witness` ; B_t nommé à tort.

## Divergence avec le premier avis (c′), à trancher par l'investisseur
(c′) : ni sUSDe ni FDUSD sous le protocole existant (rétrospective indécidable / négative ; seuils après 100 % des données). Ce second avis : sUSDe
possible pour le churn en régime 1 jour avec breadth pré-enregistrée. Question factuelle qui départage : le régime 1 jour (post-bloc 24669809)
conserve-t-il un held-out intact ? Non établi.
