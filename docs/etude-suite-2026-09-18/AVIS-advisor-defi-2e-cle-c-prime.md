# Avis advisor-defi (2026-09-18, consultation « 2ᵉ clé Narabi : sUSDe / FDUSD / attendre ») — archivage de l'artefact (c′)

> Archivé par l'orchestrateur depuis le rapport de consultation (le second avis advisor-defi du même jour a relevé que cet avis
> n'était dans aucun artefact lisible). Chiffres [mesuré] par l'advisor (scripts stdin, aucune écriture) ; recorder F2-B rejoué tel quel.

## Recommandation : n'ouvrir ni (a) sUSDe ni (b) FDUSD sous le protocole pré-enregistré ; option (c′) = (c) + (d)
- **FDUSD** (θ = 1 % transféré) : ρ = 0,169 (271 fen.) / 0,189 (2025-H1) / 0,140 (2026) < ρ_min 0,30 dans les trois régimes ; 174/271 jours à burns
  nuls ; **0 burn sur 78/78 jours de week-end** (guichet 5/7 = classe calendaire, Koyomi) ; grappe 2025-06-18→26 ≈ 24 % de S_open côté Ethereum
  pendant que Solana passe 104 → 304 M (DefiLlama [2nd]) ⇒ migration inter-chaînes brûlée par le même Safe que les rachats (deux lois sous un
  topic, critère qui a refusé GHO/DAI) ; supply −91 %. « Fenêtre 7 j / classe rafale » rejetée : `window` enum gelé `1h|24h`, nouvelle
  task_class = escalade, 7 j non chevauchants ≈ 38 paires < nMin, chevauchants détruisent l'échangeabilité.
- **sUSDe** : rétrospective **indécidable** sous θ pré-enregistré (n = 84 < 99 ⇒ q99 = ∞), **négative** sous tout θ décidable (θ = 5 % :
  ratio run/q99 = 0,44) ; rang du run 10/138 ; 2025-09-25 = échéance Pendle (burns 149,6 M ≈ mints 153,3 M, rotation) ⇒ la breadth échoue
  structurellement sur les rollovers ; frontière de régime cooldown 7 j → 1 j (bloc 24669809, churn ×13) = deux régimes à ne pas pooler ;
  canal patient seulement (1,87 % en file vs 11,16 % de burn USDe le 10-11).
- Ouvrir l'une ou l'autre = amender les seuils après avoir vu 100 % des données (held-out compris) : interdit par PLAN §5.0 ⇒ escalade
  investisseur explicite, jamais choix d'orchestrateur.

## Option retenue (c′)
1. **Extension USDe 2025-10-16 → 2026-09-17 (11 mois non vus)** : variable, fenêtre, clé inchangées ; seuils F2-B inchangés et déclarés ;
   test pré-enregistré = couverture empirique de [v̂ ± q̂_committé] sur les paires calmes consécutives fraîches, acceptation ≥ 1 − α − ε avec
   **ε = 0,05 fixé maintenant** ; échec ⇒ nombre de dérive mesuré (Barber 2023) dans la phrase d'honnêteté, **jamais une recalibration**.
   (Réconciliation orchestrateur avec le second avis : ceci = rejeu à digest séparé, item ADR-M012 (l), ne touche pas les scores committés.)
2. **Test co-variable sUSDe → USDe à lag = cooldownDuration** : sur 45 jours communs, 4 des 5 pics sUSDe ≥ 1 % avant le 10-08 sont suivis
   d'un USDe ≥ 1 % à t+7±1 (base 4/39) ; 10-01→10-08 : 149,9 M parts × ~1,20 ≈ 180 M vs 175,4 M USDe brûlés ; trop peu pour affirmer. Pré-enregistrer :
   fraction des jours calmes USDe ≥ 1 % précédés d'un jour sUSDe ≥ 1 % à t − cooldown ± 1 (7 j avant le bloc 24669809, 1 j après) ;
   **seuil ≥ 50 % avec base < 15 % ⇒ ouvre un ADR** pour une formule `narabi:…-v3`.
3. **Clôtures formelles** sUSDe et FDUSD (mesure due avant l'ADR FDUSD : mints Solana 17–27 juin 2025).
4. **Critère d'admissibilité généralisé** : population admissible pour un `AttestedFlow` mono-chaîne seulement si son mécanisme inter-chaînes ne
   brûle pas sur mainnet (lock-and-mint, USDe OFT) ou brûle depuis un `from` distinct et séparable (USDC : CCTP `TokenMinter` ≠ Circle) ;
   burn-and-mint natif par le même AP (FDUSD, PYUSD probable) : non.
5. Demande : M1 (Caddy 30 j) / M3 inchangés.

## Défaut de protocole (classe C-14)
`q(arr, 0,99)` (recorder l. 71) rend ∞ dès ⌈(n+1)·0,99⌉ > n (n < 99) ; avec nMin = 50, toute population 50 ≤ n < 99 est étiquetée
« valid-but-retrospective-negative » alors qu'elle est **indécidable**. Fold-in : nMin ≥ 99 pour la rétrospective, ou branche `retrospective-undecidable`.

## Ce qui ferait basculer
sUSDe → clé : épisode de stress dans le régime 1 jour où l'entrée en file est le max v ; ou ADR portant la **longueur de file** (solde du silo, un état,
donc un autre contrat). FDUSD → clé : mints Solana juin 2025 ≈ 0 et supply stabilisé et classe calendaire ratifiée. Acheteur nommé demandant une
population précise ⇒ l'ouvrir sous protocole pré-enregistré avec étiquette honnête du ratio run/calme.

## Pièges
θ_stress transféré = détecteur déguisé quand l'exclusion dépasse ~5 % (USDe 4,2 % ; FDUSD 21–29 % ; sUSDe 24–29 %) ; q99 = ∞ pour n < 99 ;
persistance sur 5/7 ; breadth = un compte, pas une vélocité ; burns-seul gonfle v en rotation ; frontière cooldown ; DefiLlama ≠ totalSupply RPC.
