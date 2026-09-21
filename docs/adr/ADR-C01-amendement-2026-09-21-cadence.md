# ADR-C01 — Amendement daté 2026-09-21 : cadence des gates (décision investisseur 116, verbatim « B »)

## Contexte
Nuit du 2026-09-20/21 : 6 lots fusionnés ; chaque gate a attrapé au moins un défaut réel (checkpoint-1 : forme de ŷ non conforme à la décision 91, double retry, shim réseau troué ; G2 : trous de couverture, `verifyLedgerChain` désactivable ; checkpoint-2 : fixture à valeurs réelles, résiduel de rattrapage Narabi, date 2027 du premier mail ; G2-delta : voisins survivants, corrections docs — jamais bloquant). Le coût mesuré n'est pas dans les vérifications mais dans les ~10 passages de relais en série par lot (chaque relais = nouvel agent à contexte frais + aller-retour orchestrateur).

## Décision (investisseur, « B ») — aucun gate retiré, moins de relais
1. **G2 et checkpoint-2 en PARALLÈLE** sur le même G1 rendu (le validateur ré-exécute lui-même par AM-2, il ne dépend pas du rapport G2) ; une seule vague de corrections ensuite ; ré-acceptation SUR PIÈCES par reprise des deux instances (contexte conservé), pas par nouvelles instances.
2. **G2-delta par REPRISE du même relecteur G2** (instance distincte de l'auteur — c'est l'indépendance qui compte), pas par une nouvelle instance ; une nouvelle instance reste requise si le delta change un oracle de façon substantielle (jugement orchestrateur, motivé au G7).
3. **Plis de plan (checkpoint-1) par REPRISE de l'auteur du G0**, pas par un nouveau worker.
4. **Corrections purement documentaires** (RUNBOOK, PLI, sha, journal) : faites par l'orchestrateur directement, consignées au G7.
5. **Régime « petit lot »** — critères CUMULATIFS : ≤ 300 lignes `ins+del` (pathspec R-25), aucune surface servie touchée, aucun appel réseau, aucun crédit/argent, aucun secret, aucune donnée de prix : G0 court rédigé par l'orchestrateur ; G1 worker ; UNE relecture G2 à contexte frais avec ré-exécution + mutants ; PAS de checkpoint-2 ; G7 par l'orchestrateur avec CI complète et R-25 mesuré. Tout lot hors de ces critères suit la boucle complète. Exemples visés : plis de corrections, atténuation `run.ts` Narabi, hygiène d'export, tests de stabilisation.

## Inchangé
Checkpoint-1 avant tout code ; relecture G2 fraîche avec mutants sur tout code ; checkpoint-2 sur tout lot touchant une surface servie, du réseau ou de l'argent ; CI complète par l'orchestrateur avant chaque fusion `--no-ff` ; un worker ne committe jamais ; R-25 ≤ 1 205 par unité relue ; règle Branchement ; règle Dettes ; anti-close (bis).

## Gain attendu
≈ 45 % de temps calendaire par lot (estimation orchestrateur, à mesurer sur les 5 prochains lots : durée G1-rendu → G7 consignée au JOURNAL).

## Conséquences immédiates
Narabi fusion -a+-b : G2 + checkpoint-2 déjà lancés en parallèle (08:15 UTC). Bell -b3d-b1a : G2-delta par reprise du relecteur (C-V-2). EXPORT-CLEAN, -iii-a1-bis : candidats au régime petit lot pour leurs plis.

## Complément 2026-09-21 ~12:30 UTC (orchestrateur) — « CI complète » au G7 = `npm run ci && npm run lint && npm run lint:ratchet`
Mesuré : les fusions `--no-ff` locales de la nuit ont été vérifiées par `npm run ci` seul (gate:vocab + typecheck + test) ; le job GitHub `g4-architecture` (`ci.yml:100-101`) exige en plus `eslint .` et le ratchet de dette de typage (ADR-M003 D9 ter). Le G7 de Bell -b3d-b1a a fusionné une erreur eslint (`rebase-crosscheck.test.ts:600`) et une violation de ratchet (70/69) — attrapées par le G1 de b1b. `error_origin` : orchestrateur (G7). Règle (non discrétionnaire, effet immédiat) : l'oracle du G7 sur l'arbre fusionné est `npm run ci && npm run lint && npm run lint:ratchet` ; un G7 rendu sans les trois est un défaut du G7. Résorption : dans le lot b1b (correction hors périmètre déclarée).
