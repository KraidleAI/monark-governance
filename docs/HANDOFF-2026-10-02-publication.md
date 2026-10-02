# HANDOFF — mise en service du Dōjō et première publication — écrit 2026-10-02 02:0x UTC, mis à jour à chaque retour d agent

Orchestrateur (session `a0cf3d1b`, modèle de la session `claude-opus-5-5`). Tronc de travail `lot/etude-suite` (`F:/Monark`), HEAD au commit de ce fichier.
Journal privé des actes : `F:/PRODUITS/dojo-mirror/JOURNAL-mise-en-service-2026-10-01.md` (à lire en entier avant tout acte).

## 0. Consigne en cours de l investisseur (2026-10-02, 01:59 UTC, verbatim)
« ne lance rien d'autre. on va toucher la limite hebdo si non, prépare un fichier passation pour un autre claude en attendnat et mets le
a jour a chaque retour. » : AUCUN nouveau lancement d agent ni de workflow sans un go explicite ; on consomme seulement les retours.

## 1. Où on en est, en une phrase
Le premier jour compté (d = 2026-10-02) est en collecte sur l hôte Bell ; la minuterie de publication est active (A-10) ; la première
publication suit, le 3 octobre, la course finale de l historique et la ligne `history` ; le site part après ses lots, la validation
visuelle de l investisseur et la première synchro.

## 2. Autres consignes de l investisseur en vigueur (verbatim)
- « je te donne le go pour les push les déploiement et tout autre action, sauf publier sur X »
- « pas de CI ni de PUSH avant de me dire pour que je mette le repo en publique et éviter des erreur a refaire » (dépôt
  `monark-governance` : vérifier sa visibilité seul avant tout push)
- « a chaque push ou modofication qui encombrerait le travail de l autre claude vous écrivez dans la messagerie des deux claude, pour
  éviter les conflits. »
- « différe la preuve bitcoin, accélére le travail, on doit publier quelque chose, il faut finir le snapshot. avec les scores déja
  realisés a ce jour. et qui se mettent a jour. on rajoute le timestamping aprés publication »
- « corrige. la migration c est aprés 90 jours. pas 180 » (ancre seq 2 en vigueur) ; « il faut exclure les comptes de moins de 1$ »,
  option « Masquer dès le 1er prix ».
- « dés que tout ce qui concerne RECHERCHES est prét, notifies moi avec un message séparé ainsi qu une réponse détaillé dans votre mail
  box pour recherches afin que je lui dise. »
- Garde-fous : aucune dépense ; rien sur X ; aucun secret ni adresse IP d hôte publiés (masquer toute sortie) ; aucune suppression
  définitive sans accord ; séries de marché hors de tout dépôt public, jamais lues par un validateur ; DNS, domaine et certificat :
  actes de l investisseur (refusés à l orchestrateur par le classifieur, ne pas contourner).

## 3. Agents en vol (lancés avant la consigne ; à consommer, rien à relancer)
- **G2 ciblée BATCH-NEAR** : RENDUE à 02:04 UTC, APPROUVE-AVEC-CORRECTIONS (`eda667be…`, code tel quel) ; fusion `6c464bbc`, lignes
  d ADR `2fab0d81`. Reste : le G7 de la fusion (oracle local en cours, sortie `F:/tmp/dojo/g7-batchmerge.txt`), puis ligne à ETAT.
- **G2 ciblée SITE-SEND-PREP** : mission `F:/tmp/dojo/mission-g2-sendprep.md` (`81949561…`) ; rapport `F:/tmp/dojo/g2-sendprep/RAPPORT.md`.
  Au retour : si APPROUVE, fusion de `lot/site-send-prep` dans `lot/page-v1` et G7.
- **G1 SITE-BROWSER** (lancée avant la compaction) : `F:/tmp/dojo/browser/MESURES.md`, captures `F:/tmp/dojo/browser/shots/`.
  Au retour : vérifier, committer sur `lot/site-browser` ; captures pour la validation C-V-4 (§6.6).
- **G1 RUNBOOK-PRE-IV** : mission `F:/tmp/dojo/mission-runbook-pre-iv.md` (`6a5e5dd4…`) ; livrables `F:/tmp/dojo/runbook-deliver/`.
  Au retour : vérifier, committer ; lignes d ADR (§9).
- **G1 PAROXYSME-DOJO-FILE-1** : mission `F:/tmp/dojo/mission-paroxysme-dojo.md` (`839e6c29…`) ; livrables `F:/tmp/dojo/paroxysme/`.
  Au retour : relire, verser `docs/PAROXYSME-Dojo.md` avec les ajouts du §9, committer.
- **Contrôle du diff P2a-2 (RECHERCHES)** : mission `F:/tmp/kata-p2a/mission-p2a2-diff.md` (`563b07ec…`) ; rapport
  `F:/tmp/kata-p2a/P2A2-DIFF-RAPPORT.md`. Au retour : réponse détaillée à la boîte (§7), puis message séparé à l investisseur.

Les G2 de SITE-BROWSER et de RUNBOOK-PRE-IV seraient deux NOUVEAUX lancements : demander le go de l investisseur (consigne §0).

## 4. Branches
- `lot/etude-suite` : `31e4359a` (FAITS Caddy) ← `9e979a36` (ETAT) ← `eb3ee3ec`. ETAT : `docs/ETAT.md`, édité par scripts à un coup
  (remplacement exact, lignes ≤ 160 caractères ; modèle `F:/tmp/dojo/etat-edit-17.mjs`).
- `lot/page-v1` = `2fab0d81` (fusion de BATCH-NEAR sur `d1120612`, G7 en cours) ; worktree `F:/Monark-wt-page-v1` (les courses
  d historique y tournent ; aucun agent n y touche).
- `lot/batch-near` = `40f11dc7` (worktree `F:/Monark-wt-batch`) ; `lot/site-send-prep` = `9e016897` (`F:/Monark-wt-sendprep`) ;
  `lot/site-browser` et `lot/runbook-pre-iv` = `d1120612` + travail non commis (`F:/Monark-wt-browser`, `F:/Monark-wt-runbook`).
- Arbres de l hôte Bell = `G7.txt` = `c0c60617` (collecte et publication TREE-EQUAL ; `dojo-publish.mjs` blob `da4d1010` = page-v1 ;
  seul `dojo-chain.mjs` diffère, d une ligne de commentaire). `origin lot/page-v1` poussé à `c0c60617` (dépôt privé).

## 5. Fusions dans `lot/page-v1` (au retour des G2)
Dans `F:/Monark-wt-page-v1` : `git merge --no-ff <lot>` (aucun conflit attendu : fichiers disjoints), puis l oracle du tronc
`node F:/Monark/scripts/oracle/run.mjs`, rôle `G7`, `--tree` = le commit de fusion, `--base` = la tête de page-v1 avant la fusion
(lue à `date -u`) ; G7 prononcé si sortie 0 et arbre = commit ; ligne au journal privé et à ETAT. BATCH-NEAR AVANT la course finale
(le lanceur refuse sinon) ; RUNBOOK-PRE-IV avant 18 (iii).

## 6. Le 3 octobre (RUNBOOK-dojo §17 à §19, lu à `d1120612`)
1. Après 00:00 UTC et la clôture de d sur l hôte (`bundles/2026-10-02/publish/SHA256SUMS` existe) : `bash F:/tmp/dojo/run-final.sh`
   en arrière-plan avec journal (copie de d vers `F:/PRODUITS/dojo-mirror/days/2026-10-02`, S_CUT, course finale A, B, C sur
   `F:/PRODUITS/dojo-history/final-2026-10-02`, reprise de C sur `method_cap`). Il refuse avant minuit, sans BATCH-NEAR, arbre sale.
   Attendu : `complete` et l empreinte de `publish/SHA256SUMS`. La course r3 a pris plusieurs heures.
2. 18 (iii) : le paquet vers l hôte (garde Q-14 du lot RUNBOOK-PRE-IV) ; Q-12 : taille de l historique contre la grille mesurée.
3. 18 (iv) : la ligne `history` (job transitoire, unité `inactive`, hors des créneaux 00:30, 01:30, 03:30, 06:30 UTC) ; puis retrait
   gardé du paquet ; contrôle hors ligne de A-8 (3) et (4) sur un miroir neuf `public-seq<n>`.
4. Le créneau suivant publie d (premier `snapshot`) ; lire le journal de l unité (§17) ; `dojo-verify-cli --url` après la publication.
5. Ensuite : A-8 (5) à (9) (horodatage OTS, après publication) ; A-6 (site Caddy de l hôte Bell : le certificat peut être refusé
   par le classifieur, alors acte de l investisseur) ; DOJO-EDGE-CACHE-1 ; DOJO-SITE-PROXY-1 (extrait du site avec XFF-1, `caddy
   adapt` de la configuration installée, cinq traversées attendues 404) ; `docs/PAROXYSME-Dojo.md` versé ; première synchro de
   `dojo-served.json` et son G7 ; déploiement du site (RUNBOOK-vitrine) ; registre `hold-snapshot` « built » (C-V-5).
6. Avant l envoi du site : validation visuelle de l investisseur (C-V-4, six points : durées en chiffres ; textes tableDust,
   tableNoVersion, lookupDust, tableOrder ; lignes `program` sous le seuil masquées ; phrase des détenteurs ; « committed in advance » ;
   paliers 0 à 3), avec les captures de SITE-BROWSER, réponses mot pour mot à ETAT.

## 7. RECHERCHES (boîte aux lettres)
- Clone : `F:/tmp/claude/F--Monark/a0cf3d1b-5446-43e6-b228-3b1feff36069/scratchpad/recherches` ; base
  `origin/claude/monark-repository-access-brln3a`. Protocole : branche `monark/<sujet>` depuis la base, message sous
  `coordination/messages/`, pièces sous `coordination/pieces/<date>-<sujet>/`, commit, push, `gh pr create`, `gh pr merge --merge`.
- Dernière demande (2026-10-02) : deux envois, `270ee40` (Q-P2a-4, voie (c)) et `1c77ba1` (AC-1 à AC-4, N-1 à N-5) ; ils demandent le
  contrôle du diff puis l accord « P2a complet ». Contrôle en vol (§3). Aucune calibration réelle avant cet accord. Ensuite P2b ; item
  MONARK P2-RECALC-TOOL-1 (recalcul indépendant des 280 lignes, oracle sans réseau) avant de comparer les résultats de P2b.
- Audit P3 : statuts envoyés ; S-5 tranché (400 nommé) ; BYO-NEAR-NAME-1 premier lot après la première publication, puis
  SERVED-HARDENING-1 ; version datée de la spécification publique avant P3.

## 8. Décisions et écarts du 2 octobre (détail au journal privé)
- A-10 fait à 01:44 UTC ; Q-10 et D3-1 déplacés (premier redéploiement de l arbre de publication, première rotation, ou 2026-10-09) ;
  parade : chaque lecture du §17 liste `publish.lock*`.
- DOJO-TASKSMAX-SAMPLE-D-1 fait (pic 11 sur 64 ; pic 7 à A-5). FAITS-SYSTEMD-RUN-UNSETENV-1 marqué fait.
- I-1 et I-3 de SITE-SEND-PREP clos par lecture sur place (`docs/dojo/FAITS-caddy-header-up-delete-2026-10-02.md`) ; Q-1 à Q-4 tranchées.
- Écarts : une lecture de minuteur a affiché localement l heure approximative d un instant de lecture (rien publié) ; deux lignes du
  journal datées avant lecture de l horloge (corrigées). Règle : `date -u` dans un appel séparé avant toute ligne datée.

## 9. Lignes datées à écrire par l orchestrateur
- ADR-DOJO-PR-3 : TU-1h (le premier jour lu est le jour clos entier : `eve.json`, `publish/`, `readings/`) ; `TasksMax=64` épinglé
  (relevés 7 et 11, marge ×5,8 ; révision à un pic ≥ 32 ou à un départ refusé faute de tâche).
- ADR-DOJO-PR-2B : BATCH-NEAR (brouillon au §11 de `docs/G1-lot-batch-near.md`, branche `lot/batch-near`).
- Registre PAROXYSME : ajouter DOJO-SITE-PROXY-HEADERS-ALLOWLIST-1, DOJO-HISTORY-INFO-DEPTH-1, FAITS-TOKEN2022-PARSER-BATCH-SHAPE-1,
  Q-10 et D3-1 (déplacés).

## 10. PAROXYSME (rappel obligatoire)
Campagnes en cours : aucune. Différés après la publication, avec items : horodatage Bitcoin (DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1),
vérification BLS de drand (DOJO-BLS-VERIFY-1), DOJO-LIVE-HEALTH-1, DOJO-CA0-SCRIPT-1. Registre `PAROXYSME-Dojo.md` en rédaction (§3).

## 11. Journal des mises à jour de ce fichier
- 2026-10-02 02:0x UTC : création (six agents en vol, aucun retour depuis la consigne).
- 2026-10-02 02:0x UTC : retour de la G2 de BATCH-NEAR ; fusion dans page-v1 ; G7 de la fusion en cours.
