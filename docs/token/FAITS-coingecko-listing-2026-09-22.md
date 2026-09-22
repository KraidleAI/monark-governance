# FAITS — listing du token MONARK sur CoinGecko (lecture sur place, navigateur interne)

Orchestrateur Fable 5.1, lu le 2026-09-22 15:07 UTC (`date -u`). Niveau [lu] première main. Aucune action de compte, aucun formulaire soumis.

## 1. Procédure CoinGecko (support.coingecko.com, « How to List a New Cryptocurrency on CoinGecko », mis à jour « 5 months ago »)
- Prérequis unique : « your cryptocurrency must be actively tradable on a cryptocurrency exchange tracked by CoinGecko ».
- Interdit : faire spammer « When list? » par la communauté ⇒ « disqualified from listing ».
- Étapes : compte CoinGecko → Request Form (bas de la home) → onglet Request & Listing → « New Coin/Token Listing » → Active Listing (token déjà lancé) → formulaire (champs * obligatoires ; logo en pièce jointe) → vitesse de revue : **Fast Pass (payant, revue sous 24 h)** ou **Regular Pass (jusqu'à 5 jours)** → CGU + captcha → Submit. Suivi : onglet Request & Listing du tableau de bord ; email de confirmation.
- Méthodologie (coingecko.com/en/methodology) : prix agrégé VWAP des tickers suivis ; **Circulating Supply** = total supply − adresses verrouillées **fournies par l'équipe** et vérifiées par CoinGecko (sinon « - ») ; Market cap dérivée.

## 2. État du token (geckoterminal.com, page MONARK/SOL — valeurs du jour, JAMAIS réutilisées comme faits durables)
- Mint : `FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` (= `out/mint.txt`, test `token_ca_pinned`).
- Déjà suivi par GeckoTerminal : paire **MONARK/SOL sur PumpSwap** (pool `GhCGq9qTCBWZvpBY4fzfvxvENWe1syryLuGACgj3Lhvg`), « pump fun », âge 8 jours ; le descriptif MONARK (« company of agents … never a probability of being right ») est déjà affiché.
- Ordre de grandeur lu à l'écran (indicatif) : liquidité ~25 k$, holders ~313, volume 24 h ~57 k$, MCAP ~87 k$, GT Security Score 58.
- Conséquence : le prérequis CoinGecko (venue suivie) est SATISFAIT — PumpSwap/pump.fun est un DEX suivi par GeckoTerminal/CoinGecko.

## 3. Non lu / à lire avant soumission
- Prix du Fast Pass (article « How to Purchase CoinGecko Fast Pass ») — non lu ici.
- Article « Why is my token not listed » (motifs de rejet) — lien cassé sur le site (404), à relire via la recherche.
