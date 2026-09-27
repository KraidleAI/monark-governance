# HANDOFF — reprise après la limite de fenêtre (5 h) — 2026-09-27 03:5x UTC

Consigne investisseur : « fais en sorte que ça reprenne directement quand une nouvelle fenêtre s'ouvre ». Reprise **sans demander de go** (décision 247 ; décisions 248, 249 prises). Branche tronc `lot/etude-suite` (`F:\Monark`), CHANTIERS à jour jusqu'à `6d66cb2`.

## Workflows en vol au moment de la coupure (à reprendre par `Workflow({scriptPath, resumeFromRunId})` si morts, sinon attendre leur notification)
| Run | Objet | Script | Reprise |
|---|---|---|---|
| `wf_2dd4ebc4-88a` | G1 PR-2-1 Dōjō (worktree `F:\Monark-wt-dojo`, HEAD `9cca56b`) | `workflows/scripts/g1-pr2-1-dojo-wf_2dd4ebc4-88a.js` | à la remise : vérifier `F:\tmp\dojo\pr2-1-deliver\DELIVERED.sha256`, R-21, gel 1, G2 relecteur frais (mission à écrire sur le modèle `F:\tmp\dojo\mission-g2-pr1b2.md`) |
| `wf_c1d817fe-33d` | G7 NARABI-L-1 (worktree `F:\Monark-wt-narabi`, HEAD `b45db28`) | `g7-narabi-l-wf_c1d817fe-33d.js` | commit du pli + `docs/CHECKPOINT2b-lot-narabi-l.md` → fusion no-ff dans `lot/etude-suite` → attendre fin du tirage 2 → rejeu réel RUNBOOK §7 (2)-(6) → publication + envoi VPS = **go investisseur** |
| `wf_e35fd5c8-88e` | Pli KAIZEN décision 249 (`F:\PRODUITS\kaizen\etude-2026-09-27\`) | `pli-249-kaizen-wf_e35fd5c8-88e.js` | relire, sceller (sha256), CHANTIERS |
| `wf_682419e6-d20` | Lecture des 8 procurements KAIZEN + synthèse (`F:\PRODUITS\kaizen\procurements-2026-09-27\`) | `lecture-procurements-kaizen-wf_682419e6-d20.js` | relire SYNTHESE-LECTURES ; présenter à l'investisseur : grades #55/#69, prior de coût, doctrine des priors, K-7a |
Scripts sous `F:\claude-config\projects\F--Monark\e03dd7cc-4452-4c79-9aa6-58827dad4d19\workflows\scripts\`.

## Boucle bash de fond (indépendante du quota)
Tirage 2 Narabi : `bash /f/tmp/narabi-gap-logs/draw2.sh` (état `F:\tmp\narabi-gap2\timeline.jsonl`, 261+ jours, dernier jour 2026-07-02 à 03:4xZ ; fin attendue ≈ 2026-09-2x). À la fin : sha256 du fichier, RU Chainstack lus au grand livre `F:\monark-ledger` (deux tirages : le tirage 1 zombie a tourné 01:58 → 03:1xZ), Helius relevé n°2 (attendu 3 738 156). Vérifier l'arrêt par `Get-CimInstance` (règle TASKSTOP-BASH-LOOP-1), jamais par le seul log.

## Ensuite (ordre)
1. Dōjō : G2 PR-2-1 → corrections → gel → cp-2 (validateur) → G7 → PR-1b-3 (G1) → PR-2-2 (G0 bref ? non : même ADR ; G1 direct après DOJO-DRAND-RELAY-TERMS-1 = lecture sur place des conditions des relais drand par l'orchestrateur, navigateur interne puis externe).
2. Public : PR-A1b (19 lignes + C-V2-2..4, correctif prêt `F:\tmp\pca1\corr\no-cash-C-G2-6.withfix.ts`) → G0 PR-A2 (×2,14, coupe probable).
3. Narabi : NARABI-L-2 (2026-10-18), NARABI-QUORUM-TIEBREAK-1, POCKET-LOSSY-LOGS-1 (session POKT X SHOGEN).
4. Shōgen : fin de campagne (~28/09) → SHOGEN-LOOP-GUARD-1, ADR C-SI-2.

## Questions encore posées à l'investisseur
Q-V-1 (Dōjō visible à la première publication), Q-2 (ligne `Co-Authored-By` publique), texte exact de l'erreur « advisors indisponibles » des autres sessions, go VPS Narabi.

## Règles rappelées (session)
Heures lues à `date -u` (jamais déduites : sept entrées corrigées à 03:2xZ) ; verrou d'hôte `F:\tmp\oracle-lock` pour toute suite complète ; CONSIGNE-G1-EXPORT-RUN-1 ; R-20 ; jonctions mk-nm/rm-nm ; rien sur C:.
