# FAITS — planchers « avant » SNAPSHOT-PROBE-3 (D-1 Helius, D-2 Chainstack), lecture n°1

Orchestrateur Fable 5.1, Claude in Chrome (sessions ouvertes par l'investisseur à sa demande « connecté », 2026-09-26 ≈ 00:58 UTC), lecture seule, aucun mot de passe saisi, aucune page à clé. Horloge `date -u` : lecture Helius 00:59:50 → 01:03 UTC ; lecture Chainstack 00:59 et 01:04 UTC. Mission : `F:\PRODUITS\dojo\mission-probe-3.md` §1.3 / §3 (D-1, D-2), sha256 `450eebf7…`.

## D-1 — Helius `https://dashboard.helius.dev/<org>/usage` (projet « bell-course-2026-09 », Mainnet)

- Cycle « Sep 19 → Oct 19, 2026 », « 23 days left in credit cycle » ; **3,738,080 used / 10,000,000** plan credits ; « Autoscaling credits 0 / Off » ; « Autoscaling spend $0.00 estimated this cycle » ; « Monthly limit $0.00 · 0 credits ».
- « Requests, Last 24 hours : No requests in the last 24 hours » (page d'accueil du projet, 00:59 UTC).
- Ventilation par méthode (Breakdown by → Method, bouton « Copy CSV », collé dans une zone de texte locale puis lue ; valeurs exactes) :

| Méthode | Crédits | Part |
|---|---|---|
| getTransactionsForAddress | 3 690 270 | 98,7 % |
| getTransaction | 40 295 | 1,1 % |
| getSignaturesForAddress | 7 376 | 0,2 % |
| getAccountInfo | 113 | 0 % |
| getTokenAccountsByOwner | 24 | 0 % |
| getSlot | 2 | 0 % |
| **somme** | **3 738 080** | = total ✔ |

- Delta depuis la lecture n°3 du 2026-09-23 01:06Z (1 787 158, `docs/course-bell/FAITS-floor-helius-n3-2026-09-23.md`) : + 1 950 922 crédits (course Bell NVDAx et suite, hors sonde). Aucune requête sur les 24 dernières heures ⇒ compteur stable au moment du relevé.

**`cycleFloor.helius` = 3 738 080 crédits.**

## D-2 — Chainstack `https://console.chainstack.com/user/settings/billing/usage`

- « Billing period: Sep 19, 2026–Oct 19, 2026 » ; Plan « Growth » ; « 2% used », « Resets in 23 days » ; Request units **Included 20,000,000 / Used 282,515 / Extra 0** ; « Extra usage Disabled » ; Warp transactions 0.
- Tableau « Current month · Sep 19 – Oct 18, 2026 » : lignes 26/09 et 25/09 « Node 19-09-2026 23:14 · Elastic · Solana · Solana Mainnet · 0 RU » (pas d'appel Solana ces deux jours) ; Total 282,515 RU (agrégat toutes chaînes ; le tableau ne distingue pas « full » et « archive » ⇒ rapprochement R9 en `--mode aggregate`, comme la course Ukemi, décision 129).
- Delta depuis la lecture n°2 du 2026-09-22 13:56Z (12 916) : + 269 599 RU (courses eth/base/bsc/robinhood, hors sonde).
- Bandeau « Data updates every few hours » non revu sur cette page ; règle de la mission conservée : relevé « après » au plus tôt quelques heures après la sonde, puis relevé de stabilité.

**`cycleFloor.chainstack` = 282 515 RU.**

## Contrôles

- Plafond de cycle Helius : garde interne 8 M (décision 112) ; 3,74 M + 115 crédits comptés (au pire 1 060 facturés si « archival » = 10) reste très en deçà.
- Plafond de cycle Chainstack : 16 M (décision 115) ; 282 515 + 16 RU.
- Verrous : aucune course active (« No requests in the last 24 hours » côté Helius ; 0 RU Solana les 25 et 26/09 côté Chainstack) ; à confirmer sur le grand livre avant l'ouverture (`.head` de `F:\monark-ledger\helius-2026-09-19\`).
