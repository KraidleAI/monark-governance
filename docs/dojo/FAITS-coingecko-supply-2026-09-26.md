# FAITS — offre en circulation MONARK pour le formulaire CoinGecko « Coin/Token Supply Update » (2026-09-26, 21:3x UTC)

Lecture sur place par l'orchestrateur `claude-fable-5-1` (navigateur interne, Solscan ; Chrome de l'investisseur pour CoinGecko). Chiffres du jour, [lu].

## 1. Solscan (`solscan.io/token/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT`, 21:2x UTC)
- **Current Supply : 952 943 705,325732** MONARK (décimales 6 ; Token 2022 ; Authority N/A ; Creator `BQPsJEawxaostAfQ3USyLBHkdLiEQ46Py6CkDFHyk3QV` ; First Mint « Pump.fun Token Mint Authority », 16 j) ; 264 détenteurs. Le dossier du 25/09 portait 952 955 610 : écart −11 904,67 (brûlage entre les deux lectures, non attribué ; la valeur du jour fait foi pour le formulaire).
- Onglet Holders (page 1) : #1 Pump.fun AMM (MONARK-WSOL) Pool `MeQMg7r7smskfnq4xPmUPRSbFXUzqgJjDMBzvCoYkzd` 119 790 833 (12,57 %) ; **#8 `AD76kHYYXA25wMdSPvQAuiARG33DfNsqF1A1qBJUw4nr` 21 884 518,174252 (2,30 %)**.
- Compte `AD76kHYY…` (`solscan.io/account/AD76kHYYXA25wMdSPvQAuiARG33DfNsqF1A1qBJUw4nr`) : Token Account, tags **#Streamflow #Vault Owner**, owner = lui-même (PDA, `isOnCurve FALSE`), un seul transfert entrant de `Fj7yMcoQtEj82cxC11c8eNZEGUuXgnAKscyTLkfDgpGm` il y a 13 j 23 h (+21 884 518,174252). C'est le dépôt verrouillé du contrat Streamflow `63dKEiLjxBHg3ZGTy4ApyAcJYFgePrPNr4s46RNVb1Pn` (dossier §6 : immuable, cliff 2027-09-12, linéaire jusqu'au 2029-09-11). Le dossier disait 21 843 000 : la valeur on-chain est **21 884 518,174252** (elle fait foi).

## 2. Valeurs pour le formulaire
| Champ | Valeur | Source |
|---|---|---|
| Coin/Token Name | MONARK (API ID `monark`) | CoinGecko |
| Top Holder List URL | `https://solscan.io/token/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT#holders` | Solscan |
| Distribution Schedule | `https://monarkgate.tech/token` | site |
| TGE | 2026-09-10 | dossier §6 (première frappe Pump.fun) |
| Max Supply | 952 943 705 (fixe : autorité de frappe N/A) | Solscan |
| Total Supply | 952 943 705 | Solscan |
| Circulating Supply | **931 059 187** (= 952 943 705,325732 − 21 884 518,174252 = 931 059 187,151480) | calcul |
| Vested/Locked Wallet | `AD76kHYYXA25wMdSPvQAuiARG33DfNsqF1A1qBJUw4nr` (Streamflow, 21 884 518,17) | Solscan |
| Allocation #1 | Founder, 2,30 % (21 884 518 / 952 943 705 = 2,2966 %), TGE 0 %, cliff 12 mois (2026-09-12 → 2027-09-12), vesting 24 mois (→ 2029-09-11), daily | dossier §6 + calcul |
| Allocation #2 | Public (Pump.fun launch / market), 97,70 %, TGE 100 %, cliff 0, vesting 0, n/a | complément |
| Submitter's Role | Project team | investisseur |
| Additional info | « Founder allocation was bought on the open market and locked in an immutable Streamflow contract 63dKEiLjxBHg3ZGTy4ApyAcJYFgePrPNr4s46RNVb1Pn (0 % unlocked, cliff to 2027-09-12, then daily linear to 2029-09-11). Mint authority is revoked (N/A): total supply is fixed. » | dossier §6 |

## 3. Portail partenaire (Chrome, `partner.coingecko.com`, 21:2x UTC)
- Formulaire `request-form/supply-update/new` lu (7 sections, 3 cases de conditions, post de vérification publique demandé après soumission avec l'identifiant de la demande et l'URL GeckoTerminal).
- « Continue with CoinGecko » (session coingecko.com de l'investisseur) mène à `partner.coingecko.com/welcome` : **création du profil** (prénom, nom, nom du projet, type, site, pays) — acte de l'investisseur (données personnelles, création de compte) ; l'orchestrateur s'arrête là et reprend la saisie du formulaire une fois le profil créé.
