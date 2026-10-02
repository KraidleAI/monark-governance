# HANDOFF — mise en service du Dōjō et première publication — écrit 2026-10-02 02:0x UTC, mis à jour à chaque retour d agent

Orchestrateur (session `a0cf3d1b`, modèle de la session `claude-opus-5-5`). Tronc de travail `lot/etude-suite` (`F:/Monark`), HEAD au commit de ce fichier.
Journal privé des actes : `F:/PRODUITS/dojo-mirror/JOURNAL-mise-en-service-2026-10-01.md` (à lire en entier avant tout acte).

## 0. Consigne en cours de l investisseur (2026-10-02, 01:59 UTC, verbatim)
« ne lance rien d'autre. on va toucher la limite hebdo si non, prépare un fichier passation pour un autre claude en attendnat et mets le
a jour a chaque retour. » : AUCUN nouveau lancement d agent ni de workflow sans un go explicite ; on consomme seulement les retours.

**Consigne de l investisseur (2026-10-02 03:09 UTC, verbatim)** : « SACHE QUE LES DEUX PRIORITES sont la reponse a recherches et la page
snapshot. uniquement, les autres points, tu me les expliques avant de décider quoi que ce soit, jete dirai pourquoi ». Conséquence : rien
hors de ces deux priorités n est décidé ni lancé sans explication préalable et accord ; l ADR du chantier moteur n est pas rédigée.

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

## 3. Agents (ARRÊTÉS le 2026-10-02 vers 02:3x UTC : limite hebdomadaire à 3 %, consigne de l investisseur)
Quatre agents arrêtés en cours de route ; leurs sorties partielles restent sur le disque, rien n est commis pour eux. Les relancer
AVEC LA MÊME MISSION (sha256 recalculé, reçu de `launch.mjs` refait) seulement sur go de l investisseur ; un oracle ou une campagne
de mutants lancés par eux en arrière-plan peut finir seul (verrou `held(root)` de `F:/Monark/scripts/oracle/lock.mjs`, racine `F:/tmp`).
- ARRÊTÉS : G2 SITE-SEND-PREP, G1 SITE-BROWSER, G1 RUNBOOK-PRE-IV, contrôle du diff P2a-2 (détail ci-dessous).
- **G2 ciblée BATCH-NEAR** : RENDUE à 02:04 UTC, APPROUVE-AVEC-CORRECTIONS (`eda667be…`, code tel quel) ; fusion `6c464bbc`, lignes
  d ADR `2fab0d81`. G7 de la fusion PRONONCÉ (oracle `02104bde…` sortie 0, 1 872 tests, 0 rouge, R-25 168) ; ligne à ETAT faite.
- **G2 ciblée SITE-SEND-PREP** : mission `F:/tmp/dojo/mission-g2-sendprep.md` (`81949561…`) ; rapport `F:/tmp/dojo/g2-sendprep/RAPPORT.md`
  trouvé sur disque (02/10 02:4x, sha `a8bc3181…`, 25 Ko, §0 à §9 écrits) mais verdict `[A-REMPLIR-VERDICT]` : INCOMPLET, non consommé ;
  G2 à refaire sur go (même mission). Au retour : si APPROUVE, fusion de `lot/site-send-prep` dans `lot/page-v1` et G7.
- **G1 SITE-BROWSER** (lancée avant la compaction) : `F:/tmp/dojo/browser/MESURES.md`, captures `F:/tmp/dojo/browser/shots/`.
  Au retour : vérifier, committer sur `lot/site-browser` ; captures pour la validation C-V-4 (§6.6).
- **G1 RUNBOOK-PRE-IV** : mission `F:/tmp/dojo/mission-runbook-pre-iv.md` (`6a5e5dd4…`) ; livrables `F:/tmp/dojo/runbook-deliver/`.
  Au retour : vérifier, committer ; lignes d ADR (§9).
- **G1 PAROXYSME-DOJO-FILE-1** : RENDU à 02:2x UTC ; versé tel quel en `docs/PAROXYSME-Dojo.md` (`25dd9dd3`, sha256 `45b029fc…`) :
  151 limites, 34 dettes sans item (6 publiques DJ-L01 à L06), 20 déclencheurs passés sans clôture écrite. Reste (§10).
- **Contrôle du diff P2a-2 (RECHERCHES)** : RENDU et RÉPONDU (§11, 04:2x UTC) ; avant : RELANCÉ 02/10 02:53Z sur go de l investisseur (« tâche urgente ») : même mission `563b07ec…`,
  reçu vert 02:52:34Z, workflow `wf_f34264e7-5c9` (G2 neuve, puis deux contre-vérificateurs : A statique, B rejeu ciblé) ; sorties du
  lancement arrêté renommées `run4-arrete-20261002/`, `tmp-arrete-20261002/` (rien effacé) ; RECHERCHES : tête `1c77ba1`, rien de neuf ; rapport
  `F:/tmp/kata-p2a/P2A2-DIFF-RAPPORT.md`. Au retour : réponse détaillée à la boîte (§7), puis message séparé à l investisseur.

Les G2 de SITE-BROWSER et de RUNBOOK-PRE-IV seraient deux NOUVEAUX lancements : demander le go de l investisseur (consigne §0).

## 4. Branches
- `lot/etude-suite` : `31e4359a` (FAITS Caddy) ← `9e979a36` (ETAT) ← `eb3ee3ec`. ETAT : `docs/ETAT.md`, édité par scripts à un coup
  (remplacement exact, lignes ≤ 160 caractères ; modèle `F:/tmp/dojo/etat-edit-17.mjs`).
- `lot/page-v1` = `224a6bd1` (= `2fab0d81`, G7 `02104bde…` vert, + lignes datées d ADR-DOJO-PR-3 du 02/10 02:47Z, documentation seule) ; worktree `F:/Monark-wt-page-v1` (les courses
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
   Le lanceur n a été vérifié qu en syntaxe (`bash -n`), jamais exécuté : relire ses sorties pas à pas. Clés de l opérateur prises de
   son environnement, jamais affichées ; `--deadline` 2026-10-03T20:00:00Z, prolongeable à la reprise (D-11).
   Attendu : `complete` et l empreinte de `publish/SHA256SUMS`. La course r3 a pris plusieurs heures.
2. 18 (iii) : le paquet vers l hôte (garde Q-14 du lot RUNBOOK-PRE-IV) ; Q-12 : taille de l historique contre la grille mesurée.
3. 18 (iv) : la ligne `history` (job transitoire, unité `inactive`, hors des créneaux 00:30, 01:30, 03:30, 06:30 UTC) ; puis retrait
   gardé du paquet ; contrôle hors ligne de A-8 (3) et (4) sur un miroir neuf `public-seq<n>`.
4. Le créneau suivant publie d (premier `snapshot`) ; lire le journal de l unité (§17). Avant A-6, rien n est servi sous
   `dojo.monarkgate.tech` : contrôle hors ligne sur un miroir neuf (`public-seq<n>`, comme A-8 (3)-(4)) ; `dojo-verify-cli --url`
   seulement après A-6.
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
- FAITES (02/10 02:47Z, `224a6bd1` sur `lot/page-v1`) : ADR-DOJO-PR-3 TU-1h et `TasksMax=64` ; ADR-DOJO-PR-2B BATCH-NEAR (`2fab0d81`).
- FAIT (02/10 02:49Z, `32bcf4b0`) : registre PAROXYSME : DJ-L187 à L191 (HEADERS-ALLOWLIST, INFO-DEPTH, BATCH-SHAPE, Q-10, D3-1) ; les six
  dettes publiques DJ-L01 à L06 portent un item (§2 du registre). Restent : 28 dettes internes du §1.2 et 20 déclencheurs passés (§4).

## 10. PAROXYSME (rappel obligatoire)
Campagnes en cours : aucune. Différés après la publication, avec items : horodatage Bitcoin (DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1),
vérification BLS de drand (DOJO-BLS-VERIFY-1), DOJO-LIVE-HEALTH-1, DOJO-CA0-SCRIPT-1. Registre `docs/PAROXYSME-Dojo.md` versé
(`25dd9dd3`) : AVANT la première synchro (C-V-5), former les 34 items manquants (§1 du registre, les 6 publiques d abord), relire
DJ-L67, L76, L81, L109, L114 (le tronc a bougé), écrire les clôtures des 20 déclencheurs passés et ajouter les items du §9.
Pistes pour les 6 publiques (à confirmer) : DJ-L01 identité (recherche, preuve de personne ou regroupement d adresses) ; DJ-L02
aucune promesse (Tiers, lecture juridique, D-12) ; DJ-L03 soldes rapportés par deux opérateurs (recherche, preuve d état) ; DJ-L04
relecture sans Ed25519 du navigateur (code, vérification en JavaScript pur) ; DJ-L05 rotation de clé suivie par la relecture (code) ;
DJ-L06 table sans script (code, rendu serveur des lignes committées).

## 11. Journal des mises à jour de ce fichier
- 2026-10-02 02:0x UTC : création (six agents en vol, aucun retour depuis la consigne).
- 2026-10-02 02:0x UTC : retour de la G2 de BATCH-NEAR ; fusion dans page-v1 ; G7 de la fusion en cours.
- 2026-10-02 02:1x UTC : G7 de la fusion de BATCH-NEAR prononcé (`02104bde…`) ; la course finale a son code.
- 2026-10-02 02:2x UTC : registre PAROXYSME du Dōjō rendu et versé (`25dd9dd3`) ; 34 items à former avant la synchro.
- 2026-10-02 02:3x UTC : quatre agents arrêtés (limite hebdomadaire) ; aucun agent en vol. Pour le 3 octobre sans RUNBOOK-PRE-IV :
  appliquer à la main, dans les commandes de 18 (iii) et (iv), la garde `test ! -e /var/lib/monark-dojo/publish.lock` et l unité
  `inactive` avant tout retrait du paquet (Q-14), et ne rien faire sur l éditeur ni sur `bundles/<d>` entre (iv) et le snapshot (Q-13).

- 2026-10-02 02:47 UTC : reprise par une nouvelle session (modèle `claude-opus-5-5`). Contrôles §17 à 02:45Z : aucun `publish.lock*`,
  minuterie de publication `enabled`/`active`, service `inactive`, aucun passage encore (premier à 03:30Z), collecte `active`, 0 ligne
  `dojo/collect:`, jour d ouvert (`eve.json`, `evidence`, `readings`, pas de `publish/`). Verrou de l oracle libre. Lanceur
  `run-final.sh` relu ligne à ligne : conforme au §18 ; plafonds tenus (dépense réelle de la course provisoire r3 : 6 654 crédits,
  47 484 RU, 28 167 appels pour 22 jours). Lignes datées §9 écrites (`224a6bd1`). G2 SITE-SEND-PREP : rapport incomplet (§3).

- 2026-10-02 02:49 UTC : PAROXYSME-Dojo mis à jour (`32bcf4b0`) : six publiques pourvues d items, cinq items du §9 ajoutés ; 28 + 20 restent.

- 2026-10-02 02:53 UTC : go de l investisseur pour le contrôle du diff P2a-2 (urgent) : workflow `wf_f34264e7-5c9` lancé (3 agents).

- 2026-10-02 03:03 UTC : go de l investisseur (« continue le chantier pendant que ça tourne ») : G2 SITE-SEND-PREP, G1 RUNBOOK-PRE-IV et
  G1 SITE-BROWSER relancés (workflow `wf_ba951eaf-522`, mêmes missions scellées, reçus verts 03:03Z ; navigateur après les deux autres).
  Travail partiel des deux G1 gardé dans les worktrees (patchs `F:/tmp/dojo/arrete-20261002/`, SHA256SUMS) et repris par le nouveau G1.
  Sorties des lancements arrêtés renommées `*-arrete-20261002` (rien effacé). Pipeline de mesure orphelin du navigateur (figé depuis 02:23Z :
  Chrome 9333, next 3431, serve 3432) arrêté par l orchestrateur. Reste : clone `F:/tmp/dojo/browser/b1` verrouillé par le système, inerte.

- 2026-10-02 03:07 UTC : PAROXYSME-Dojo : DJ-L07 à L34 pourvus d items (`9bcd4353`), plus aucune dette sans item au §1. Clôtures des 20
  déclencheurs passés : vérification sur pièce confiée à quatre lecteurs (`wf_25285f45-110`, lecture seule), adjudication par l orchestrateur.
  Écart de l orchestrateur : un premier lancement (`wf_5c458345-2f6`) est parti avec un paramètre factice au lieu des entrées ; arrêté dans la
  minute, sans écriture possible (lecture seule) ; relancé avec des identifiants validés par le script.

- 2026-10-02 03:09 UTC : consigne « deux priorités » (§0) ; ADR du chantier moteur arrêtée avant écriture ; FAITS DEM-1 versé (`a42b19bb`,
  lecture seule, le harnais sert `af9b889`) avant la consigne : aucune décision prise dessus.

- 2026-10-02 03:32 UTC : créneau de 03:30 conforme (`history_missing`, chronologie à 2 lignes, aucun verrou ; unité `failed` = sortie 1 attendue).
  PAROXYSME : les 20 déclencheurs passés ont une clôture écrite (quatre lecteurs `wf_25285f45-110`, adjugé par l orchestrateur) ; DJ-L55 clos
  pour les octets signés (garde de libellés : 0 sur trousseau et ancres 1-2). Trois décisions sur la course finale, portées au lanceur
  `run-final.sh` (sha256 `f28dce4e…`, `bash -n` vert) : DJ-L86 aucun verrou canonique au départ, aucune autre course gardée pendant ;
  DJ-L87 `mint_check` de d = `ok` sinon arrêt avant tout appel ; DJ-L84 une queue de journal déchirée arrête, reprise sur état NEUF.

- 2026-10-02 04:28 UTC : RECHERCHES : contrôle du diff P2a-2 rendu (G2 `claude-opus-5-5` CONFORME-AVEC-RESERVES, rapport `d12710e9…`,
  deux contre-vérifications confirment) ; réponse publiée et fusionnée dans leur boîte (PR recherches#37, `2a4220e`) : trois plis demandés
  (P-1 R02 ordre des colonnes du PBO, P-2 X01, P-3 FORMAT.md l.3), puis rejeu du delta par MONARK, puis accord « P2a complet ». Aucune
  calibration réelle avant. Message séparé à l investisseur fait. CLAUDE.md global consolidé (sauvegarde `F:/MONARK SUITE/backup-2026-10-02/`).

## 12. Compléments (ajoutés le 2026-10-02 à 02:3x UTC)
- **Accès aux hôtes** : clé `~/.ssh/monark_vps`. Hôte Bell : cible ssh lue dans `F:/tmp/dojo/s7-1.sh` (extraire par `grep -oE 'root@[0-9.]+'`,
  jamais afficher). Serveur du site : cible dans `docs/RUNBOOK-harness.md`. Toute sortie passe par un masque des adresses.
- **Lots non fusionnés** : `lot/site-send-prep` (`9e016897`, committé, sa G2 arrêtée : à refaire avant fusion) ; `lot/site-browser` et
  `lot/runbook-pre-iv` (travail partiel NON commis dans `F:/Monark-wt-browser` et `F:/Monark-wt-runbook` : lire avant de reprendre).
- **Oracle** : un oracle ou des mutants lancés par les agents arrêtés peuvent encore tenir le verrou ; vérifier `held(root)` avant
  tout oracle, ne jamais l arrêter.
- **Lecture quotidienne du §17** (parade de la décision Q-10/D3-1, déclencheur au plus tard le 2026-10-09) : lister
  `/var/lib/monark-dojo/publish.lock*` ; un verrou d un lancement mort → §19 `--unlock` ; un résidu `.<pid>` → journal seulement.
- **Engagement public** : le texte rédigé pour X annonce le premier snapshot pour le 3 octobre (UTC) et « Migration needs 90 days
  held » (ancre seq 2 en vigueur) ; sa publication par l investisseur n est pas vérifiée par l orchestrateur.
- **Faille servie aujourd hui** : S-11 de l audit P3 (noms imitant les classes commises acceptés en BYO sur le harnais) ; lot
  BYO-NEAR-NAME-1 = premier lot après la première publication, puis SERVED-HARDENING-1.
- **Dû par MONARK à RECHERCHES** : contrôle du diff P2a-2 ; version datée de la spécification publique (S-5, 400 nommé), soumise à
  RECHERCHES avant publication, avant P3 ; ADR de préparation P3 ; P2-RECALC-TOOL-1 avant de comparer les résultats de P2b.
- **Outillage des agents** (sur go seulement) : missions par `node F:/Monark/scripts/mission/gen.mjs` puis `launch.mjs` (reçu vert) ;
  agent `worker` épinglé `claude-opus-5-5` ; corps de missions réutilisables sous `F:/tmp/dojo/body-*.md`.

## 13. La suite après la page snapshot : régler les points relevés dans le moteur MONARK
- Investisseur, 2026-10-02 02:3x UTC (verbatim) : « est ce que tu lui a dis que la suite aprés la page snapshot serait de régler les
  points qu on avait relévé dans le moteur monark? » : c est le chantier suivant, dès la page publiée.
- Source : l audit P3 de RECHERCHES (`monark/AUDIT-P3-2026-10-01.md` de leur dépôt ; copie `F:/tmp/audit-p3/AUDIT-P3-2026-10-01.md`)
  et notre statut point par point (`F:/tmp/audit-p3/STATUT-AUDIT-P3.md`, versé dans `coordination/pieces/2026-10-01-statut-audit-P3/` ;
  message `coordination/messages/2026-10-01-MONARK-vers-RECHERCHES-statut-audit-P3.md`) : 27 points, 24 confirmés, 3 partiels,
  aucun réfuté ; zone : `packages/hikae`, `packages/contracts`, `apps/harness`, `apps/sentinel` ; servi = `af9b889`.
- Ordre écrit dans ce statut :
  1. BYO-NEAR-NAME-1 (S-11, servi aujourd hui : noms imitants acceptés en BYO), premier lot après la première publication ;
  2. SERVED-HARDENING-1 : S-12, S-1, S-6 (code d erreur stable, prérequis de S-5), S-10, S-15, E-7 ;
  3. E-8 (NaN dans `decide()` : garde `Number.isFinite`, s abstient), dans le lot de préparation P3 ;
  4. priorité 2, préconditions de P3 dans un ADR de préparation P3 de MONARK : S-2, S-3, S-4/E-1, S-5, S-8, S-16, E-13/S-9, S-7 ;
  5. version datée de la spécification publique (S-5, 400 nommé), soumise à RECHERCHES avant publication ;
  6. priorité 3 : E-2, E-4, E-5, E-6, E-9, E-10, E-12, E-14, S-13, E-11/S-14 (remède ou raison de ne pas remédier au statut §4).
- Méthode (décision 300) : un chantier = une ADR et trois ou quatre parties ; chaque lancement d agent sur go de l investisseur.
