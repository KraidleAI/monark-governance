# Lecture — Gatto (2026, daru.finance / SSRN 7157638, page web longue, PAS le PDF 51 p.) [lu] ; Garcia Seuma (arXiv:2608.03616v1, 2026-08-05) [lu]
Lecteur Sonnet 5, 2026-09-19. Citations Gatto par ligne du .txt (pas de pagination PDF).

## Chiffres fondés / non trouvés / contredits
- Fondés : LT(1+b) = 0,9595 (ETH e-mode) ; D* = 7,4 % (médiane live 6,9 %, 8,8 % pondérée dette) ; tableau bad debt par choc discret (Fig. 4) ; λ̂_struct 0,031 → 0,195 → 0,032 et λ̂_flow 0,566 → 0,28 par fenêtre oct. 2025 (Table 4, p.10) ; impact ×1,2–3,5 (Binance) / ×3,2–9,1 (Hyperliquid).
- **Non trouvés** : « 10 % / 47 M$ » (grep exhaustif négatif) ; date/bloc du live book ; λ̂ par événement sur les 7 cascades (n'existe pas, seul oct. 2025 mesuré « en vol ») ; toute mention Aave/lending dans (B).
- Tensions : (A) argumente **contre** « eligible debt = perte » — T(Q) = ΣB_i·1{HF_i<1} doit isoler repayment / seizure / bad debt ; (B) portée déclarée intra-venue (perps), λ jamais ≥ 1.

## (A) Gatto
- Invariant (l.421-467) : bad debt > 0 ⟺ LT(1+b) < 1 ; sur chemin **continu**, un loop franchissant HF = 1 est retiré solvable. Hypothèses : chemin continu (exclut gap discret / oracle stale / pool fin), même catégorie e-mode, liquidateur plafonné. LT(1+b) ∈ [0,8586 ; 0,9595] sur 8 catégories.
- Données : un bloc Ethereum live Aave v3 (date/bloc non explicites), 17 419 emprunteurs, 6,5 Md$ dette ; 1 437 positions LST (1,38 Md$ éligible) ; 236 pure-loop (2,19 Md$, 1 356,9 M$ éligible) ; Bitquery + CoinGecko Pro.
- Fig. 4 (bad debt / 100 M$ loop) : gap discret cf=1, LT 0,95 : 5 %/8 %/12 %/20 %/35 % → 0 / 0,58 / 4,54 / 12,46 / 27,31 M$ ; liquidation partielle cf=0,5 pool 2 Md$ : 3,01 / 5,51 / 8,87 / 15,7 M$ ; staleness (gap 8 %) : 0,58 / 0,86 / 2,03 / 5,13 M$.
- D* = max(1 − 1/HF₀ ; 1 − (1+b)·LT/HF₀) ; ancre ~12×, LT 0,95, b 0,01 → 3,5 % (éligibilité), 7,4 % (perte possible).
- Impact : constant-product paramétré par profondeur (1–2 Md$) ; onset 6,05 % (pool infini) → 2,10 % (fini) ; perte à 15 % de gap 30,2 → 695,7 M$ (pool 1 Md$) ; dé-peg endogène en point fixe (choc > 0,19 % → dé-peg ≈ 97 %, bad debt 0). CRV nov. 2022 : 1,65 M$ modélisé vs ≈ 1,60 M$ réalisé (3,4 %).
- Pas de section limites dans la page web → **procurement : PDF SSRN 7157638 (51 p.)** si citation par page requise ; dépôt code `github.com/DaruFinance/defi-param-stress`.

## (B) Garcia Seuma
- Modèle Galton–Watson : λ = k·ρ̃ (Eq. 1), k impact par $ de flux agresseur, ρ̃ notionnel forcé par unité de mouvement ; amplification V₀/(1−λ). Trois estimateurs : structurel, flux (INAR/Hawkes), comptable (A = 733/644 = 1,14 ⇒ λ = 0,122).
- Données : Binance perp 5 min, N 22→30, 7 fenêtres (Table 1) ; Hyperliquid fill log depuis 2025-05-25 → un seul test « en vol » (oct. 2025).
- Table 4 (p.10) : baseline λ̂_struct 0,031 / flow 0,566 ; nucleation 0,195 / 0,283 (forcé 644 M$) ; peak 0,140 / 0,484 ; aucun IC sur λ̂ (les IC de Table 3 portent sur la pente de sévérité).
- Impact mesuré : Kyle Binance ×1,2–3,5 ; Hyperliquid ×3,2–9,1 (max jour ×511–927) ; OI −45 à −70 % (HL), −24,6 % (Binance BTC). Le symbole Λ n'apparaît pas ; k joue un rôle analogue sans équivalence affirmée.
- Transposabilité Aave : **not_found** (zéro occurrence) ; backstop absorbe 62,6 % du flux forcé ; extension réseau « left to future work » (p.8).

## Pour ADR-M020
- Λ ≠ 0 est **mesuré** sur perps (k̂ ~ 1e-10 à 2e-9 $⁻¹) mais pas sur Aave : la mesure M-2 reste la seule preuve recevable.
- La cible Y = Σ debtToCover doit être décomposée (repayment / collateral seized / bad debt) sous peine de contredire Gatto.
- λ subcritique partout mesuré : ne jamais vendre la criticité.
