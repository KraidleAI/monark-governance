# FAITS — NEAR × Ondo : actions et ETF tokenisés sur near.com (annonce du 2026-09-22) — lecture sur place

Lecture SUR PLACE par l'orchestrateur (`claude-fable-5-1`), navigateur interne, **2026-09-22 23:5x UTC**, signalée par
l'investisseur (« near vient d'annoncer ça … on les ajoutera dans l'une des prochaines versions de BELL » — décision 139).
Niveau **[lu]** = page primaire ; citations ≤ 25 mots ; aucun chiffre de marché relevé (aucun sur la page).

- URL : `https://www.near.org/blog/tokenized-stocks-rwas-ondo` — titre « Buy Tokenized Stocks and ETFs Onchain | near.com × Ondo », daté « September 22, 2026 ».
- Objet : « You can now buy tokenized US stocks and ETFs on near.com with stablecoins or any supported crypto, across 30+ chains ».
- Symboles de lancement : « NVDA, TSLA, AAPL, GOOGL, META, MSFT, and AMZN, plus ETFs including SPY and QQQ, with more to come » — les quatre
  mints du tirage go-1 de Bell (TSLAx, AAPLx, NVDAx, SPYx) y figurent, côté Ondo.
- Émetteur/structure : « Powered by Ondo Finance » ; « Ondo's tokenized stocks are total return tracker tokens » (exposition économique,
  « reinvested dividends net of applicable withholding taxes ») ; fractionnement supporté. Même émetteur que la ligne « Ondo Global Markets »
  du census v4 (`docs/CENSUS-ACTIONS-TOKENISEES-v4-2026-09-20.md`) : structured note, retour total, SPV BVI.
- Frappe/liquidité déclarées : « Most assets mint 24/7 » ; « trade with the same liquidity as the underlying markets, around the clock » (affirmation
  marketing, non mesurée).
- **Confidentialité d'exécution (point clé pour un témoin on-chain)** : « users on near.com can keep every trade confidential. Your trade still settles
  onchain, but it isn't linked to you, with selective disclosure available for compliance » ; « Swaps are confidential, keeping your activity out
  of public view ».
- Distribution : « Through NEAR Intents, Ondo's tokenized stocks, ETFs, and real-world assets, become reachable to wallets, exchanges, and apps across
  30+ chains » ; « Intents handles the cross-chain routing and settlement into Ondo's compliant infrastructure » ; « subject to applicable
  eligibility and compliance controls ».
- Frais : « no near.com platform fees for 30 days » (promotion datée).

## Ce que la page NE dit PAS (à ne pas inventer)
- Sur quelle chaîne les jetons Ondo servis à near.com sont émis/détenus (NEAR natif ? conservés sur les chaînes d'émission d'Ondo et routés par Intents ?) —
  la phrase « settlement into Ondo's compliant infrastructure » suggère la seconde lecture, sans l'établir.
- Aucune adresse de contrat, aucun mint, aucune preuve de réserve, aucun volume, aucun horaire de halt.

## Conséquences pour Bell (analyse, pas un fait de la page)
- Bell mesure des grandeurs on-chain publiques (offre, frappes/rachats, transferts, écart hors séance) : une exécution **confidentielle** côté NEAR est,
  par construction, **hors de portée du témoin** ; ce qui reste mesurable est ce qui touche la chaîne d'émission d'Ondo (frappes/rachats agrégés,
  offre par mint) et, si des jetons vivent nativement sur NEAR, leur offre et leurs transferts non confidentiels.
- Item formé **BELL-NEAR-1** (décision 139) : (1) identifier sur place, à la source primaire (docs Ondo / NEAR Intents / explorateurs), où vivent les
  jetons servis et quelles grandeurs sont publiques ; (2) ajouter une ligne NEAR × Ondo au census (v5) avec le **point aveugle déclaré** (exécution
  confidentielle) ; (3) n'ajouter la source à Bell que si une grandeur publique recalculable existe — sinon « upcoming » avec motif écrit, jamais
  une mesure de seconde main. Déclencheur : après le verdict go-1 et T-1b ; propriétaire : orchestrateur (chercheur pour (1)).
