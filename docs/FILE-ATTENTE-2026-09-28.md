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

## B′. Rang 1 après la méthode (décision 266) — activité publique
- **PUBLIC-CADENCE-1** : PR-A1b (19 lignes + C-V2-2..4) → PR-A2 → PR-C → PR-B (après réponses investisseur) ; l'ADR-METHODE-2 doit intégrer « trace publique au G7 » (commit + release + note passés à la porte) comme étape de gate ; premier commit public = rattrapage du tronc depuis le 2026-09-24 (export 494 fichiers, `docs/**` exclu), message écrit par l'orchestrateur, push sous go.
- **Sécurités** : côté dépôt — mutants de l'export rejoués, assertion « aucun `secrets.` dans le workflow dérivé », VOCAB-TIERS-1, opérateurs nommés dans le code exporté (Q ADR-PUBLIC-CADENCE-1 §1) ; côté GitHub (actes investisseur) — 2FA exigée sur l'organisation, secret scanning par défaut au niveau organisation, vérification que `main` du miroir garde ses 4 contrôles requis, aucun jeton d'écriture persistant.

## C. Items formés sans agent (à planifier après la méthode)
BIBLIO-ID-2411-1 ; REPO-STRAY-WORKTREE-GUARD-1 ; VALIDATEUR-CA-12-TIERS-1 ; VOCAB-TIERS-1 ; MONARK-PRINCIPAL-AGENT-1 ; NARABI-POW-ACC-1 ; NARABI-K-SUP-90-122-1 ; ORACLE-TEST42-IN-SUITE-1 ; DOJO-I-G2-1 ; DOJO-PAGE-MODEL-1 ; MONARK-KRAIDLE-INTERFACE-1 ; PAROXYSME : campagnes Shōgen / Hikae / Ukemi / Bell ; nature « Tiers » à ajouter aux registres.

## D. Journal des retours (ajouté à chaque retour, plus récent en bas)
- 2026-09-28 00:44 UTC — avis v2 advisor-defi rendu → EN ATTENTE : (1) lot texte NARABI-PROVENANCE-1 (Thm 8.7/8.8 ; `tracker.ts:15-17`, PAROXYSME-Narabi L8-L10, phrase S2) ; (2) UKEMI-UPPER-BOUND-1 : compter les ex æquo des 170 scores (recorder), puis lot texte Thm 3.11/3.2 ; (3) prover « M = 1, ε_r > 0 » sur 2609.28522 AVANT tout usage (précondition de L2) + procurement Howard 2021 ; (4) MONARK-PRINCIPAL-AGENT-1 : relecture 2205.06812 sous le mapping mandant/MONARK ; (5) procurements P-1..P-6 → investisseur ; (6) venues DBLP/S2 des 4 papiers non établis ; (7) corriger le cadrage §0 (Li, Zhu seuls).
- 2026-09-28 01:08 UTC — décision 266 (activité publique) → EN ATTENTE : PUBLIC-CADENCE-1 PR-A1b/PR-A2 rang 1 après la méthode ; exigence « trace publique au G7 » à porter dans l ADR-METHODE-2 (à ajouter au checkpoint-1 s il manque).
- 2026-09-28 01:17 UTC — neuf reprises rendues, six gels → EN ATTENTE, par ordre de fusion I-1..I-4 puis Narabi/K-1 : (1) G7 RG-1b (pli C-V-1..4, Q-V1 (a), Q-V2) → fusion 1b ; (2) cp-2 RG-1a (gel `3c95562`, + RG-SNAPSHOT-NONNEG-INT-1) → G7 → fusion 1a (union) ; (3) cp-2 RG-1c (gel `5bf1ad0`, Q-C-1 (a) au pli) → G7 → fusion 1c ; (4) fusion DRAND-1a (gel `1252140`) ; (5) G7 PR-4b (plis C-V-1/2) → fusion → push (go) ; (6) G7 PR-2b-3 (gel 3 `c07c01b`, DOJO-I-G2-1) après (1)-(2) ; (7) G2 N2-1a (gel `78b9378`) ; (8) G2 N2-3 (gel `cb476f8`) ; (9) G2 K-1a (gel `3402af4`) ; (10) G2 léger prover 2 v2 → cp-1 bis N2-2. Actes orchestrateur au G7 : lignes datées ADR-U4b-2b D2, ADR-NARABI-2 D7/D9 (`/docs/gate`), CHECKPOINT2-lot-narabi-l :23/:65, ADR-DOJO-PR-4 §7 ×2, ADR-RPC-GUARD-RECONCILE-1 ×3 + TY-5 + branche ; correction CHANTIERS « [2,34 ; 2,90] » → [2,33 ; 2,91].
- 2026-09-28 02:28 UTC — audit de méthode rendu (cp-1 accepté avec corrections + escalade Q-1/Q-2) → EN ATTENTE des décisions investisseur Q-1/Q-2, puis : pli C-1..C-6 de l ADR-METHODE-2 (worker, docs) → commit dans docs/adr → G0 M-1 (garde d octets) → M-2 (missions) → M-3 (oracle unique) → M-4 (preuve F2P) ; actes investisseur : facturation GitHub Actions (CI-PRIVATE-BILLING-1), forme du point de refus (PreToolUse = config), go pour corriger F:/claude-config/CLAUDE.md (octets 0x08/0x07), procurement B-QUOTA-1 (décompte Anthropic de la limite), V-2 lecture des SKILL.md superpowers (téléchargement = go).
- 2026-09-28 02:36 UTC — superpowers lu (V-2 fait) → le pli C-1..C-6 de l ADR-METHODE-2 reçoit en plus les sept adoptions (a)-(g) de `docs/methode/FAITS-superpowers-2026-09-28.md` §4 ; question roster (modèle par tâche) → investisseur.
- 2026-09-28 02:40 UTC — décision 267 (superpowers suivi, opus 5 banni) → le pli de l ADR-METHODE-2 porte (a)-(h) ; item ROSTER-PALIER-1 : agent `worker-sonnet.md` (claude-sonnet-5, max, mêmes outils) à créer au G0 de M-2 ; règle de lancement : `model` explicite par palier dans chaque workflow.
- 2026-09-28 02:48 UTC — décision 268 : LANCÉS (sans verrou) pli ADR-METHODE-2, recherches METHODE-PLAN/SRC/PUB-1 + synthèse, G2 légers des deux provers v2, prover seqsel M = 1, mesure Ukemi ties, lecture principal-agent. RESTENT EN ATTENTE (verrou/worktree) : G2 N2-1a, N2-3, K-1a ; cp-2 RG-1a, RG-1c ; G7 RG-1b, PR-4b, PR-2b-3 ; fusions I-1..I-4 ; NARABI-PROVENANCE-1 ; PUBLIC-CADENCE-1 (rang 1 après M-1..M-4).
- 2026-09-28 02:53 UTC — campagne S2 Shōgen close → G0 rapport J28 / critère S2 (sans verrou) à lancer ; acte investisseur : désactiver le watchdog Shōgen.
