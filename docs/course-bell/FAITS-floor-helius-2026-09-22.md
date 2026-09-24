# FAITS - floor Helius, lecture SUR PLACE n°1 (G0 course §G-8, decision 114 ; condition architecte (b) debit de fond nul)

Orchestrateur Fable 5.1, Claude in Chrome (session investisseur), `https://dashboard.helius.dev/<org>/usage`, lu le 2026-09-22 05:24 UTC (`date -u`). Niveau : **[lu]** premiere main. La cle API est masquee sur le tableau de bord (verifie par l'investisseur) ; aucune page « API keys » ouverte.

| Fait | Valeur lue |
|---|---|
| Plan | Developer |
| Credits consommes du cycle | **60 938** / 10 000 000 (« 61k / 10M », « 1% ») |
| Cycle | **Sep 19 -> Oct 19, 2026** (« 27 days left in credit cycle ») |
| Autoscaling | **0 / Off** ; « Autoscaling spend $0.00 estimated this cycle » ; « Monthly limit $0.00 - 0 credits » |
| Repartition | RPC 60.9K = 100 % |

## Consequences
- `<FLOOR-HELIUS>` = **60 938 cr** (identique a la valeur [2nd] de la decision 112, desormais [lu]). Marge sous le plafond de cycle 8 000 000 (decision 112) = 7 939 062 ; plafond de course 5 396 170 + sonde 1 500 (decision 125) tient largement.
- Autoscaling Off + limite 0 $ : hypothese de la decision 125 CONFIRMEE (un depassement produit un refus, pas une facture).
- Condition (b) « debit de fond NUL juste avant la sonde » : lecture n°1 = 60 938, inchangee depuis la lecture de la decision 112 (deux jours) ; la lecture n°2, immediatement avant go-1, doit rendre la MEME valeur (double lecture espacee) — sinon un consommateur inconnu tourne et go-1 attend.
- Cle dediee (condition 4, non bloquante) : a creer par l'investisseur dans « API keys » ; presence/longueur seulement verifiees par l'orchestrateur.
