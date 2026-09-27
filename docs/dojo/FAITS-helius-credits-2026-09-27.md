# FAITS — Helius : coût en crédits par méthode (lecture sur place, orchestrateur, 2026-09-27 07:4x UTC) — item HELIUS-CREDIT-RECONCILE-1

## Lu [lu, https://www.helius.dev/pricing, 07:38Z, HTML de contrôle `curl`]
- « RPC calls are 1 credit with two exceptions: getProgramAccounts and archival calls are 10 credits. DAS calls are 10 credits » ; « credit costs are subject to change ».
- `https://www.helius.dev/docs/billing/credits-overview` → 404 (page déplacée ; suggestions : « Get Project Usage », « Billing FAQs »).

## Conclusion
- La table `rpc-guard` (gPA 10, `getAccountInfo` 1, `getSignaturesForAddress` 1) est **conforme au tarif publié** ; la garde ne surcompte pas.
- L'écart tableau de bord (+7) / garde (25) après 3 h 36 est donc un **retard ou une agrégation du tableau de bord**, pas une différence de tarif ; la garde reste la référence conservatrice. Item clos pour le G1 de PR-2-2 ; relevé n°3 du tableau de bord à faire avant le G1 de PR-2-2 (informatif).
