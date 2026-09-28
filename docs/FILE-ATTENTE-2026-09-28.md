# FILE D'ATTENTE — gel des lancements (décision 265, investisseur, 2026-09-28 00:4x UTC : « ne lance plus d'autres tâches, note les prochaines tâches à chaque retour, on améliore notre méthode de travail d'abord, et on relance les chantiers »)

Règle : à chaque retour d'agent, l'orchestrateur **traite** (lit, tranche, consigne, gèle si le lot est prêt) mais **ne lance rien** ; la tâche suivante est écrite ici avec son déclencheur. Seule la chaîne « méthode » (audit A/B/C → ADR-METHODE-2 → cp-1 → lots de mise en œuvre) continue. Les agents déjà en vol (reprise `wf_fe8bf1ca-926`, avis v2 advisor-defi, audit `wf_6da5393a-f9d`) vont à leur terme. La reprise des chantiers = décision investisseur, dans l'ordre de cette file.

## A. En vol (à traiter au retour, sans relance)
| Agent | Retour attendu | Tâche suivante (EN ATTENTE) |
|---|---|---|
| G1 N2-1a (reprise) | journal + livrables | gel 1 → G2 N2-1a |
| corrections RG-1c (reprise) | 23/23 mutants, R-25 ≤ 132 | gel 1 → cp-2 RG-1c |
| prover 2 v2 (reprise) | `PROVER-2.v2.md` | G2 léger de v2 → cp-1 bis N2-2 ; procurement P-PX2-g à l'investisseur |
| G1 K-1a (reprise) | journal + livrables | gel 1 → G2 K-1a → K-1a-sig → K-1a-ter → cp-2 → G7 → K-1b (go acquis, décision 260) |
| mini-passe PR-2b-3 (reprise) | mutants QV-2/3/4 | gel 3 (+ ligne DOJO-I-G2-1 l.266) → G7 après G7 RG-1a/1b |
| cp-2 RG-1b (reprise) | rapport | corrections C-V-n éventuelles → gel → G7 → fusion 1b (I-1) |
| cp-2 PR-4b (reprise) | rapport | corrections → gel → G7 → fusion → push (go) |
| corrections RG-1a (reprise) | R-25, mutants | gel → cp-2 RG-1a → G7 → fusion 1a (union avec 1b) |
| G1 N2-3 (reprise) | journal + livrables | gel → G2 N2-3 |
| avis v2 advisor-defi | avis persisté | décisions leviers 1-3 → items de texte (provenance Narabi Thm 8.7/8.8 ; borne haute Ukemi avec ex æquo mesurés) |
| audit méthode A/B/C → D → E | ADR-METHODE-2 + cp-1 | **autorisé** : lots de mise en œuvre de la méthode |

## B. Prêts, en attente d'un go ou d'un déclencheur
- **Push PR-3b-1** : fusion `b45e7e0` confirmée par l'oracle run 2 (vert) — acte sortant, go investisseur.
- **Redéploiements** (décision 260) : harnais S1 (après G7 + cp-2 N2-1a), sentinelle X8/X10 (N2-3), clé K-1 (K-1b).
- **Fusions rpc-guard** ordre I-1..I-4 : 1b → 1a → 1c → DRAND-1a (gel `1252140`), union `resolve-union.mjs`, jamais le côté 1b de `transport.ts`.
- **Prover C-PX2-b v2** rendu (`a3bd6fea…`) : G2 léger de v2 → G0 C-PX2-c (S2) ; Q-V2-2 (B) item NARABI-POW-ACC-1.
- **Procurements investisseur** : P-PX2-g (Barber et al. arXiv 2307.16895 dernière version + actes NeurIPS 2023), McLean-Pontiff 2016, Opdyke 2007, Mertens 2002, P-PX4-d/i (Lou 1996, Schwager 1983), SM de la version Science de PPI.

## C. Items formés sans agent (à planifier après la méthode)
BIBLIO-ID-2411-1 ; REPO-STRAY-WORKTREE-GUARD-1 ; VALIDATEUR-CA-12-TIERS-1 ; VOCAB-TIERS-1 ; MONARK-PRINCIPAL-AGENT-1 ; NARABI-POW-ACC-1 ; NARABI-K-SUP-90-122-1 ; ORACLE-TEST42-IN-SUITE-1 ; DOJO-I-G2-1 ; DOJO-PAGE-MODEL-1 ; MONARK-KRAIDLE-INTERFACE-1 ; PAROXYSME : campagnes Shōgen / Hikae / Ukemi / Bell ; nature « Tiers » à ajouter aux registres.

## D. Journal des retours (ajouté à chaque retour, plus récent en bas)
