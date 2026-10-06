# HANDOFF — reprise après la limite de fenêtre (5 h) — mis à jour 2026-09-27 09:4x UTC (fenêtre précédente : coupure 03:59Z, reprise 05:20Z ; prochaine coupure probable ≈ 10:20Z)

Consigne investisseur : « fais en sorte que ça reprenne directement quand une nouvelle fenêtre s'ouvre ». Reprise **sans demander de go** (décisions 247–253). Branche tronc `lot/etude-suite` (`F:\Monark`), CHANTIERS à jour jusqu'à `fc7bcf8`.

## Workflows en vol à la coupure (à reprendre par `Workflow({scriptPath, resumeFromRunId})` s'ils sont morts avec « session limit » ; sinon attendre leur notification). Si un G1 est mort à mi-course : archiver son brouillon (`F:\tmp\dojo\<pr>-partial-<hhmm>\`), remettre le worktree propre (`git checkout -- . && git clean -fd` limité aux fichiers du lot), relancer sur arbre propre (précédent PR-2-1, 05:2xZ).
| Run | Objet | Worktree / HEAD | Script |
|---|---|---|---|
| `wf_af2a7e7c-b45` | G1 PR-2-2 (collecteur réseau, `--tick`, disposition, intégration) | `F:\Monark-wt-dojo-a2` `f8f6105` | `g1-pr2-2-dojo-wf_af2a7e7c-b45.js` |
| `wf_ffb708ab-f90` | G1 PR-2b-2 (historique : reconstruction, paquet) | `F:\Monark-wt-dojo-d2` `eb5392a` | `g1-pr2b2-dojo-wf_ffb708ab-f90.js` |
| `wf_ced4eed4-0d2` | G1 PR-4a-1 (site : chargeur, composition) | `F:\Monark-wt-dojo-c` `ceeb8cd` | `g1-pr4a1-dojo-wf_ced4eed4-0d2.js` |
Scripts sous `F:\claude-config\projects\F--Monark\e03dd7cc-4452-4c79-9aa6-58827dad4d19\workflows\scripts\`. À la remise d'un G1 : vérifier `DELIVERED.sha256`, relire (R-21), lancer le G2 (mission sur le modèle `F:\tmp\dojo\mission-g2-pr2b1.md`), puis corrections → gel → cp-2 (validateur, mission modèle `mission-cp2-pr2b1.md`) → G7 (ligne datée + rapports versés) → fusion no-ff dans `lot/etude-suite` (conflits de l'ADR PR-2 : concaténer les lignes datées, précédent `96ab86c`).

## État Dōjō (décision 253 : page snapshot au plus vite)
- Livrées : PR-1a, PR-1b-1, PR-1b-2, PR-2-1, PR-1b-3, PR-2b-1 (six). Mère au treizième pli (`5ac9ada`, `lot/dojo-snapshot-1`).
- Portes : **PR-3b-1 (unité de collecte) = QI-2 investisseur** (hôte Bell recommandé) ; PR-3a-1 après PR-2-2 (format) ; PR-3b-2 après PR-1b-4 (`--url`, à lancer après PR-2-2 dans un second worktree de A) ; PR-4b après PR-4a-1 (cp-1 bref fait) ; PR-4c après QI-1/QF-3 ; PR-2b-3 après PR-2b-2 (+ ligne datée bornes 3/2 000).
- Worktrees : `-wt-dojo` (mère), `-1b3` (fusionné), `-a2` (PR-2-2), `-b` (G0 PR-3 `963a742`), `-c` (site), `-d` (fusionné), `-d2` (PR-2b-2). `git gc` dû (GIT-WORKTREE-GC-1) hors passes.

## Autres fils
- Narabi : L-1 publié (`instrument.json` servi) ; NARABI-TXT-1 committé ; théorie rendue (Q1/Q2 investisseur) ; NARABI-L-2 2026-10-18.
- KAIZEN : lectures + compléments rendus (#55 = B) ; pli 249 fait ; K-7a : précondition inventaire Bell (P-A1) à faire par l'orchestrateur ; Q-L-1/Q-L-2 investisseur.
- PAROXYSME : registre 179 limites ; procurements formés (33 ; P1 10) ; C0 identités faite ; Q1-Q3 registre investisseur ; campagnes C2-C10 après réponses.
- Public : PR-A1b (19 lignes + C-V2-2..4) → G0 PR-A2 (×2,14 ; lang:gate maintenant vert).
- Téléchargements : 37 PDF sous `F:\PRODUITS\procurements-2026-09-27\` ; SSRN bloqué (autorisation Chrome) ; accès éditeur listés (CHANTIERS 06:5x).

## Questions posées à l'investisseur (toutes ouvertes)
QI-1/QF-3 (tête vivante + recherche/preuve), QI-2 (hôte de collecte), QI-4 (public avant l'annonce), QI-5 (jour de répétition), P-3 (courriel relais drand, au go groupé A-7) ; théorie Narabi Q1/Q2 ; registre PAROXYSME Q1-Q3 ; KAIZEN Q-L-1/Q-L-2 ; SSRN ; validation visuelle des textes TXT (au G1 de PR-4b).

## Règles rappelées
Heures lues à `date -u` ; verrou d'hôte pour toute suite complète (deux jamais en même temps, C-V-4) ; CONSIGNE-G1-EXPORT-RUN-1 ; R-20 ; `mk-nm`/`rm-nm` ; rien sur C: ; aucun opérateur nommé dans le dépôt Dōjō (a/b) ; chaînes bash : jamais `&&` après un `grep -c` (deux commits perdus ce jour).
