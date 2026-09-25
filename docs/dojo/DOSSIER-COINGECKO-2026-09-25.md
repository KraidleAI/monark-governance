# Dossier de listing CoinGecko du token MONARK (préparé par l'orchestrateur, 2026-09-25)

Statut : dossier prêt à saisir. La saisie elle-même (compte CoinGecko, formulaire, captcha, acceptation des conditions) est un acte de l'investisseur : l'orchestrateur ne crée pas de compte, ne remplit ni ne soumet de formulaire, ne passe aucun captcha.

## 1. Faits lus sur place (navigateur interne, 2026-09-25 17:0x UTC, [lu])
- `support.coingecko.com` « How to List a New Cryptocurrency on CoinGecko » (mis à jour « 5 months ago ») : prérequis « your cryptocurrency must be actively tradable on a cryptocurrency exchange tracked by CoinGecko » ; parcours : compte → Request Form (bas de page d'accueil) → Request & Listing → New Coin/Token Listing → Active Listing → formulaire (champs `*` obligatoires, image du token en pièce jointe) → Regular Pass (jusqu'à 5 jours) ou Fast Pass (24 h, payant) → conditions, captcha, Submit ; suivi dans l'onglet Request & Listing. Avertissement : « do not ask your community to spam CoinGecko with "When list?" ».
- `coingecko.com/en/exchanges/pumpswap` : PumpSwap est un DEX suivi par CoinGecko (2 105 coins, 64 M$ de volume 24 h). Le prérequis est rempli : MONARK/SOL se traite sur PumpSwap (DEX Screener, paire créée il y a 12 jours).
- `coingecko.com/en/coins/monark` : « Page not found » : MONARK n'est pas listé à ce jour.
- Trois articles liés (guide du formulaire, « Why is my token not listed », section Token/Coin Listing) renvoient 404 aux URL relevées : la liste exacte des champs n'a pas pu être lue ; elle est à lire dans le formulaire une fois connecté.

## 2. Valeurs à saisir (toutes vérifiées dans le dépôt ou lues sur place)
| Champ probable | Valeur |
|---|---|
| Nom | MONARK |
| Symbole | MONARK |
| Chaîne | Solana |
| Adresse du contrat (mint) | `FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` (= `out/mint.txt`, épinglé par test) |
| Programme | Token 2022 ; décimales 6 (Solscan, `FAITS-token-monark-2026-09-25.md`) |
| Offre totale | 952 955 610 (Solscan, valeur du jour ; à relire le jour de la saisie) |
| Marché | PumpSwap, paire MONARK/SOL (via Pump.fun) |
| Site | https://monarkgate.tech |
| Page du token | https://monarkgate.tech/token |
| X | https://x.com/usemonark |
| Dépôt public | https://github.com/KraidleAI/monark |
| Explorateur | https://solscan.io/token/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT |
| Logo | `C:\Users\KACIMI\Downloads\Dix logos avec chartes graphiques\MONARK\monark-mark-on-dark-1024.png` (PNG carré 1024 ; CoinGecko demande en général un carré PNG, 200×200 minimum, fond non transparent de préférence : à vérifier dans le formulaire) |
| Catégories proposées | Solana Ecosystem ; AI Agents ; DeFi (à cocher selon la liste du formulaire) |
| Contact | l'adresse du domaine choisie par l'investisseur (jamais une adresse personnelle) |

## 3. Description proposée (anglais, vocabulaire D8, sans fournisseur, sans promesse)
```text
MONARK is the token of the MONARK platform: a coverage-controlled inference engine for DeFi that commits a decision when a class is calibrated and abstains when it is not. The platform publishes signed, recomputable records (MONARK Bell, a public record of how tokenized U.S. equities trade while New York is closed; Ukemi, a served liquidation coverage class; Narabi, a stablecoin redemption-run velocity tracker). Holders of MONARK will enter the Dōjō, where agents train in paper trading and hold snapshots are published for everyone to verify. Never a score, never a probability of being right.
```

## 4. Ordre de saisie recommandé et pièges
1. Relire la page d'accueil de CoinGecko et le formulaire connecté pour la liste exacte des champs (les guides sont 404).
2. Regular Pass (gratuit, jusqu'à 5 jours) ; le Fast Pass est payant et n'est utile que si une date presse.
3. Pas de campagne « when list » ; aucune annonce publique avant la réponse de CoinGecko.
4. Le même dossier sert pour DEX Screener (profil de token : « Claim Your DEX Screener Token Profile », payant) et CoinMarketCap ; les deux sont des actes de l'investisseur.
5. Après listing : ajouter le lien CoinGecko sur `/token` (lot vitrine T1, texte seul) et consigner la date.

## 5. Vérification publique obligatoire (lu sur place le 2026-09-25, `support.coingecko.com` « Verification Guide for Listing/Update Requests », mis à jour « 5 months ago »)
Ordre imposé par CoinGecko, à respecter à la lettre :
1. **Avant** de remplir le formulaire : publier un post public depuis le compte officiel lié au site (X `@usemonark`) qui dit l'intention de soumettre une demande à CoinGecko, avec l'URL GeckoTerminal du projet et, en option, un pseudo Telegram de contact.
2. Remplir le formulaire (Partners Platform) et coller l'URL de ce post dans le champ « Public Verification Link » (sinon dans « Additional Information »).
3. À réception du courriel de confirmation avec l'identifiant `CLxxxxx`, **répondre au post d'origine** avec cet identifiant exact (« 🎫 Request ID: CLXXXXX »).
4. CoinGecko vérifie le formulaire, le post, la réponse avec l'identifiant, et que le site et la documentation portent les mêmes informations que la demande.

Faits : la paire MONARK/SOL est sur GeckoTerminal : `https://www.geckoterminal.com/solana/pools/GhCGq9qTCBWZvpBY4fzfvxvENWe1syryLuGACgj3Lhvg` (pool PumpSwap `GhCGq9qTCBWZvpBY4fzfvxvENWe1syryLuGACgj3Lhvg`). Le texte de description affiché par GeckoTerminal (métadonnées du token) dit « eleven agents » : vocabulaire antérieur à la décision 202 (« smart pieces », « agent » réservé au caller) ; item TOKEN-METADATA-WORDING-1 (propriétaire investisseur : les métadonnées du token sont éditées par le créateur du token ; déclencheur : avant la demande CoinGecko, pour que « site et documentation reflètent la même information »).

Post de vérification (étape 1), prêt :
```text
📋 Preparing to submit our listing request to CoinGecko for MONARK.

🔗 GeckoTerminal: https://www.geckoterminal.com/solana/pools/GhCGq9qTCBWZvpBY4fzfvxvENWe1syryLuGACgj3Lhvg

Contract, pinned in our public repository:
FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT

No action needed on your side. We will share the page when it is live.
```
Réponse au post (étape 3), une fois l'identifiant reçu :
```text
🎫 Request ID: CLXXXXX
```
