# FAITS — Helius, lecture n°3 (pendant le tirage NVDAx ; investisseur : « prends la main et lis helius ») — 2026-09-23

Orchestrateur `claude-fable-5-1`, Claude in Chrome (session investisseur), `https://dashboard.helius.dev/<org>/usage`, lu le
**2026-09-23 01:03-01:06 UTC** (`date -u` au relevé du presse-papiers 01:06:06Z). [lu] première main. **Aucune clé affichée** (page
« Usage » seule ; la page « API keys » n'a pas été ouverte). Projet affiché : « bell-course-2026-09 », réseau Mainnet.

- Cycle « Sep 19 → Oct 19, 2026 », **26 days left in credit cycle** ; **1,787,158 used / 10M** plan credits ; autoscaling $0.00 estimé, 0 / Off ;
  monthly limit $0.00 · 0 credits.
- Ventilation « Breakdown by Method » (bouton « Copy CSV », lu via presse-papiers, valeurs exactes) :

| Méthode | Crédits | Part |
|---|---|---|
| getTransactionsForAddress | **1 782 860** | 99,8 % |
| getSignaturesForAddress | 3 277 | 0,2 % |
| getTransaction | 912 | 0,1 % |
| getAccountInfo | 83 | 0 |
| getTokenAccountsByOwner | 24 | 0 |
| getSlot | 2 | 0 |
| **somme** | **1 787 158** | = total ✔ |

## Delta depuis la lecture n°2 (floor du cycle, 60 938, `FAITS-floor-helius-n2-2026-09-22.md`)
- Total : 1 787 158 − 60 938 = **1 726 220 crédits** consommés depuis le floor (TSLAx complet, AAPLx complet, sonde de densité, NVDAx en cours
  à ~5 200 pages au moment de la lecture).
- getTransactionsForAddress : 1 782 860 − 56 640 = **1 726 220** — TOUT le delta est porté par cette méthode (10 crédits/appel ⇒ ≈ 172 622
  appels) ; getSignaturesForAddress, getTransaction, getAccountInfo, getTokenAccountsByOwner, getSlot **inchangés** depuis n°2.
- Contrôle de cohérence contre le ledger de cycle rpc-guard (`F:\monark-ledger\helius-2026-09-19\helius.jsonl`, `attempted` × 10 cr) :
  à faire au rapprochement (R-O du RUNBOOK Bell / lecture n°4 au verdict global) — le ledger compte les TENTATIVES, Helius les
  appels facturés ; l'écart attendu = tentatives refusées/non facturées.
- Lecture n°3 = lecture « pendant tirage » ; la lecture au verdict global (n°4) puis la révocation de la clé restent à faire (acte investisseur
  pour la révocation ; lecture déléguée à l'orchestrateur par la consigne du 23/09 01:0x UTC).
