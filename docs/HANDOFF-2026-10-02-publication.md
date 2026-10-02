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
   adapt` de la configuration installée, trois traversées attendues 404 et deux variantes observées) ; `docs/PAROXYSME-Dojo.md` versé ; première synchro de
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

- 2026-10-02 04:36 UTC : G2 SITE-SEND-PREP rendue APPROUVE-AVEC-CORRECTIONS (rapport `3c4864a8…`, oracle G2 `a63a1c21…` sortie 0 ;
  C-1, C-2 commentaires seuls ; C-3 décidée : trois traversées = preuves de la liste fermée, deux variantes = observations ; C-4 à l acte :
  ligne de requête verbeuse et témoin positif 200 avant chaque 404). G1 RUNBOOK-PRE-IV rendu LIVRE-AVEC-RESERVES, gelé `bcc5a87a` ;
  Q-1 URGENTE confirmée sur l hôte (04:34Z : `systemctl is-active` = `failed`, unité oneshot sortie 1 à chaque créneau) : les gardes
  `= inactive` bloqueraient (iii), (iv) et `--unlock`. Décision : gardes `inactive` ou `failed` (remède mesuré par le G1). Corrections
  lancées (`wf_f6d60e4c-c0d`, missions `e7b89de7…` et `18bf81cd…`, reçus verts) ; ensuite G2 neuve de RUNBOOK-PRE-IV, fusions, G7.

- 2026-10-02 04:42 UTC : décision 300 précisée et appliquée (investisseur : « max 3 », « jusqu a 5 si gros chantier », « oui je confirme,
  applique ») : REGLES-MISSION et CLAUDE.md global corrigés à leur place ; plus aucune G2 ni G7 par lot. Conséquence pour la partie 3 :
  la G2 séparée de RUNBOOK-PRE-IV est ANNULÉE (corps `F:/tmp/dojo/body-g2-runbook.md` non lancé) ; les lots SITE-SEND-PREP, RUNBOOK-PRE-IV
  et SITE-BROWSER sont fusionnés l un après l autre dans `lot/page-v1` (tests, tueurs, mutations à chaque fusion), puis UNE G2 neuve sur tout
  le delta de la partie 3, une revue, UN G7 ; calée avant la course finale (les commandes du 3 octobre en font partie). Agents en cours
  non arrêtés.

- 2026-10-02 05:01 UTC : DEUX LOTS MANQUANTS sur le chemin du site, absents de cette passation, trouvés par lecture de l ADR PR-3 et du code :
  (1) PR-3b-2b (`scripts/verify-dojo.mjs`, CA à douze contrôles DOJO-CA-FORMAT-1) jamais écrit, alors que la première synchro lit
  `docs/deploy-CA-dojo.json` (`bindDojoCa`) ; ETAT le disait reportable (DOJO-CA0-SCRIPT-1) : c est CA-0 qui l est, pas CA-1.
  (2) BELL-CA-DOJO-1 (contrôle 11 de la CA de Bell : ensemble fermé de deux `import` ; RUNBOOK-bell REPLACE → IMPORT) jamais écrit, alors
  que A-6 ajoute la seconde ligne `import` ; aucune section A-6 au RUNBOOK-dojo. Lancés : G1 PR-3b-2b-1 (`F:/Monark-wt-verifydojo`,
  `lot/pr3b2b-1`, mission `c1ab001b…`) et G1 BELL-CA-DOJO-1 (`F:/Monark-wt-bellcadojo`, `lot/bell-ca-dojo`, mission `71e262e1…`),
  workflow `wf_eb65c340-f50`. Reste après eux : PR-3b-2b-2 (clé de Q-B1 (a), jambe « version due ») ; puis la G2 unique de la partie 3
  (corps `F:/tmp/dojo/body-g2-partie3.md`, à regénérer avec ces lots), revue, G7 ; actes A-6, CA-1, TU-7 (première synchro), envoi.

- 2026-10-02 05:07 UTC : RECHERCHES a plié P-1 à P-3 (`1ea4f64`, tests et une ligne de doc). Rejeu du delta par l orchestrateur (`F:/tmp/kata-p2a/run5/`) :
  63/63 sous trois fuseaux prouvés, 128/128 tueurs (R02, X01 tués) : ACCORD « P2a COMPLET » publié (recherches#38). Reste dû par MONARK :
  P2-RECALC-TOOL-1 avant la comparaison de P2b. Note G7 : l oracle `corr` de SITE-SEND-PREP (pid 118624, pris 05:01:12) a tourné
  environ 4 min en même temps que la campagne de tueurs du rejeu (04:52:36 → 05:05:49) : charge étrangère à citer au G7 de la partie.

- 2026-10-02 05:32 UTC : corrections rendues. RUNBOOK-PRE-IV : gardes `inactive` ou `failed` (oracle corr `215ae490…` sortie 0, red-proof
  `5043ab9e…`, 21/21 mutants) ; prose voisine (Q-C1) alignée par l orchestrateur ; gel 2 `986e5ebc` ; tests du RUNBOOK 23/23 sur un clone du
  gel. SITE-SEND-PREP : C-1, C-2 commentaires seuls, LIVRE ; gel 2 `1c969589` ; Q-C1 (messages d assertion encore absolus, lignes exécutables)
  et K12-K20 décalés d une ligne (0 ancre perdue) laissés à la G2 de partie. Fusions dans `lot/page-v1` : `11d3d9f2` (runbook), `09662ecc`
  (send-prep), sans conflit ; oracle du tronc sur l arbre fusionné lancé (`--role corr --key partie3-fusions`). Note : le correcteur
  SITE-SEND-PREP a trouvé ses oracles `corr` sous charge croisée (voir plus haut).

- 2026-10-02 05:40 UTC : G1 SITE-BROWSER rendu LIVRE-AVEC-RESERVES (oracle G1 sortie 0, 15/15 tueurs, 227/227 tests du site) ; gel 1 `ccd48aac` ;
  fusionné dans `lot/page-v1` (`5d113895`). Mesures (`F:/tmp/dojo/browser/MESURES.md`) : budget mobile de laboratoire ROUGE à chaque N
  (la liaison de la table tient en une seule tâche) ; à N = 10^3 (réel ≈ 1 144) la variante A est verte à la limite. Q-4 posée à
  l investisseur : envoyer avec le verdict rouge déclaré, ou construire d abord DOJO-BIND-OFF-MAIN-1. 24 captures (`shots/`, SHA256SUMS
  vert), huit envoyées à l investisseur pour C-V-4 ; la fixture porte 180 jours pour Migration (DJ-L145), le texte lit l ancre.

- 2026-10-02 05:41 UTC : oracle du tronc sur `09662ecc` (fusions runbook et send-prep) : sortie 0, 9 portes à 0 ; enregistrement
  `F:/tmp/oracle-results/09662ecc…-corr-20261002T053231Z-140576.json` (sha256 `c0880648…`). La fusion SITE-BROWSER (`5d113895`) sera couverte
  par l oracle de la G2 de partie, sur l arbre final (après PR-3b-2b-1 et BELL-CA-DOJO-1).

- 2026-10-02 06:25 UTC : lots manquants livrés. PR-3b-2b-1 (LIVRE-AVEC-RESERVES ; oracle G1 `740272bc…`, 12/12 tueurs, R-25 713 ; CA lue par
  la vraie synchro) gel `53cd3db9` ; BELL-CA-DOJO-1 (LIVRE-AVEC-RESERVES ; oracle G1 `b4322876…`, 8/8 tueurs, R-25 42) gel `52487769`.
  Fusions : `96350f6e` (bell-ca-dojo), `229e9aca` (pr3b2b-1, conflit de position du RUNBOOK résolu : A-6 §21, CA-1 §22). Partie 3
  complète hors PR-3b-2b-2 (clé Q-B1 (a), jambe « version due » : avant la première version de prix due, vers le 8 octobre).
  G2 UNIQUE de la partie 3 lancée (mission `578c7cac…`, workflow `wf_00b3412e-11d`, base `d1120612`, tête `229e9aca`). Décisions déjà
  prises soumises à la G2 : attendu de CA-0 amendé (c09, c10 verts après IMPORT et A-6) ; TU-7 au tour de corrections ; hôte par son
  nom et clé d hôte comparée à l acte ; délai 740 000 ms ; import de Bell exigé ; migration de Bell avant A-6. Ensuite : corrections, revue,
  G7 unique de la partie.

- 2026-10-02 07:15 UTC : G2 UNIQUE de la partie 3 rendue APPROUVE-AVEC-CORRECTIONS (rapport `F:/tmp/dojo/g2-partie3/RAPPORT.md` `ba7514c8…`,
  oracle G2 `01b3cd29…` sortie 0, 1 882 tests, R-25 de la partie 1 126) : code des lots approuvé tel quel ; C-1 (5 ancres de tueurs),
  C-2 (étape de clé d hôte puis commandes par le nom ; §17 et §18 gardent l adresse cette nuit), C-3 (§22 compare l arbre de travail
  au G7), C-4 (attendu de CA-0), C-5 (deux messages d assertion). Tour de corrections unique lancé (`F:/Monark-wt-p3corr`, mission
  `2e3a3ca6…`, `wf_2db64fa3-c32`) avec N-1, N-2, TU-7 et l acte DOJO-SITE-PROXY-1. Orchestrateur : ligne datée 740 000 ms à l ADR PR-3
  (`8bd85181` sur `lot/page-v1`, N-6, N-11) ; condition d envoi SITE-BUILD-LOCAL-ROOT-UNSET-1 à ETAT (N-8) ; FAITS-CADDY-IMPORT-1 lu sur
  place (`f03b550d`, N-7). Ensuite : revue de la partie (validateur), puis G7 unique.

- 2026-10-02 08:26 UTC : tour de corrections de la partie 3 rendu LIVRE-AVEC-RESERVES (`F:/tmp/dojo/p3corr-deliver/`, 41 fichiers,
  0 non conforme ; oracle corr `471f3a83…` sortie 0 ; red-proof `ada6154f…` ; 34/34 tueurs ; R-25 de la partie 1 128). Gel `133b6287`
  (`lot/partie3-corr`), fusion `58450ac3` dans `lot/page-v1` : arbre propre ; commandes des §17 et §18 inchangées, une phrase N-2
  ajoutée au §17 (relu par diff). Ensuite : checkpoint du validateur sur la partie 3, puis G7 unique, puis accord de l investisseur
  sur la partie (décision 300).
  08:28 UTC : checkpoint du validateur lancé (`validateur-humain`, `claude-fable-5-1`), mission `eaf63af3…`
  (`F:/tmp/dojo/mission-cp-partie3b.md`, reçu vert, HEAD `58450ac3`) ; sorties sous `F:/tmp/dojo/cp-partie3b/`.
  08:28 UTC, relevé : quatre items proposés dans la partie ne sont formés ni à ETAT ni au registre PAROXYSME :
  DOJO-SITE-PROXY-XFF-MEASURE-1, FUSION-KILLER-ANCHORS-1, BELL-CADDY-IMPORT-REPLAY-1, BELL-RUNBOOK-ROLLBACK-CANDIDATE-1. À former
  après le verdict du validateur (il lit ETAT et le registre en ce moment), avec ses corrections.

- 2026-10-02 08:57 UTC : checkpoint de la partie 3 rendu ACCEPTE-AVEC-CORRECTIONS (`claude-fable-5-1`, rapport `aca2af79…`, sceau vert ;
  oracle cp-2 `40203116…` sortie 0, 1 882 tests, 0 rouge ; vérifié par l orchestrateur avant consommation). Corrections faites :
  1 et 2 (huit items formés à ETAT, `d9973bce`) ; 4 (registre : DJ-L81, L106, L121 clos sur pièce ; L103 et L118 constatés) ;
  3 et 5 (lignes datées d ADR-DOJO-PR-3, `b570e2b4` sur `lot/page-v1` ; ETAT aligné `a1b1c1ca`). Mesuré : seul `dojo-chain.mjs`
  (une ligne de commentaire) sépare l arbre de publication de `c0c60617` ; avant CA-1 : fusion au tronc, `G7.txt`, A-3p rejoué, et le
  lot de l éditeur (DJ-L190, L191, L34) fusionné avant. Oracle G7 lancé sur `b570e2b4` (script, sans modèle) ; le VERDICT G7 attend
  la décision de l investisseur sur le roster. Course de cette nuit : `run-final.sh` dès 00:00 UTC, (iii) et (iv) avant 06:30 UTC.
- 2026-10-02 09:00 UTC : la correction 3 écrite à l ADR (`b570e2b4`) est la voie (a) ; elle n est PAS décidée. Voie (b), mesurée :
  rétablir sur `lot/page-v1` le texte de `c0c60617` de la seule ligne de commentaire de `dojo-chain.mjs` ; l arbre de publication du
  nouveau G7 redevient égal à celui de l hôte (unités et `Caddyfile.monark-dojo` inchangés depuis `c0c60617`, mesuré), `c09` vert
  sans ré-archivage ; DJ-L190, L191, L34 gardent leur déclencheur du 2026-10-09 ; prix : un commentaire périmé porté par un item.
  Rendu à l investisseur avec : roster du G7, accord de la partie 3 (décision 300), départ de la course de cette nuit (attente en
  arrière-plan depuis cette session, ou go de l investisseur à minuit), et l annonce du « jour 1 » sur X (faite ou non : TU-7 l attend).
  L oracle G7 de `b570e2b4` ne vaut pas G7 si la voie (b) change l arbre : il sera rejoué.
- 2026-10-02 09:05 UTC : oracle G7 de `b570e2b4` rendu, sortie 0 (`5e0babc0…`, 1 882 tests, 1 878 verts, 0 rouge, 4 sautés ; R-25
  1 128 sur 1 205). Ce n est pas le verdict G7 : il attend la décision roster, et la voie (b) changerait l arbre.
- 2026-10-02 14:04 UTC : session remise sous `claude-fable-5-1` par l investisseur (commande de modèle de l app, modèle résolu lu dans
  le contexte de session) : l écart de roster de 02:51 UTC est clos ; le G7 de la partie 3 ne tient plus qu aux voies (a)/(b) et à l accord.
- 2026-10-02 14:15 UTC, RECHERCHES : run P2b fait localement (280 lignes, C-9 passée, registre `811fcd57…` 26 202 lignes, rapport
  `e91edb41…`, message `d8ca0bc` reçu par GitHub à 05:09:30Z ; leur `main` est le commit initial, la boîte vit sur la branche
  `claude/monark-repository-access-brln3a`). Q-P2b-1 décidée par l orchestrateur : voie (b), exclusion R-25 fermée de
  `kata/registry/*.json` (glob, ligne datée ADR 0005, `PROVENANCE-wave1.md` + test, octets = empreintes annoncées), le banc restant à
  `1ea4f64` ; refus de la voie (a) (ligne exécutable du banc changée après la course). Réponse recherches#39 (`b4cdf64`, 14:15:32Z).
  Dû par MONARK : P2-RECALC-TOOL-1 (recalcul des 280 lignes depuis les séries scellées, sans réseau, oracle binomial exact, comparaison
  champ par champ) avec symétrie : notre empreinte déposée AVANT toute lecture de leur registre. Lancement sur go de l investisseur.
- 2026-10-02 14:25 UTC, go de l investisseur (verbatim : « go pour l outil de recalcul, voie (b) pour la page ») :
  (1) page : commentaire de `dojo-chain.mjs` ramené au texte de `c0c60617` (arbre de publication égal à l hôte, `cmp` et diff vides),
  ligne datée d ADR (`f39e679c`), item DOJO-CHAIN-COMMENT-STALE-1 à ETAT (`bad8a650`) ; oracle G7 relancé sur `lot/page-v1` ;
  (2) P2-RECALC-TOOL-1 : mission G1 `73fabed9…` (`F:/tmp/kata-p2b/mission-recalc.md`, reçu vert, worker `claude-opus-5-5`, max,
  copie `F:/tmp/kata-p2b/wt` à `1ea4f64`, sources hikae `207f021f` extraites sous `F:/tmp/kata-p2b/hikae-207f021f/`) lancée ;
  aveugle par construction (aucun registre de RECHERCHES chez MONARK), sceau `out/SEAL.sha256` premier acte après la course.
- 2026-10-02 14:28 UTC : ÉCART DE ROSTER de nouveau : depuis 14:27:29 UTC, la session tourne sous `claude-opus-5-5` (transcription) ;
  aucun verdict d orchestrateur rendu sous ce modèle (G7 de la partie 3 compris) ; rendu à l investisseur.
- 2026-10-02 14:28 UTC : push P2b de RECHERCHES (`a43ad70`, reçu 14:19:36Z) contrôlé sur pièce, SANS lire un champ du registre ni du
  rapport (symétrie) : octets = `811fcd57…` et `e91edb41…` (LF, `kata/** text eol=lf`) ; exclusion `:(exclude,glob)kata/registry/*.json`
  dans `r25.sh`, deux fichiers couverts (`census.json`, `wave1.json`), tous deux déclarés ; test de provenance vert, deux mutants
  (empreinte altérée, fichier non déclaré) rouges ; R-25 1 113 depuis `d8ca0bc` (1 041 depuis notre merge) ; banc et bibliothèque
  inchangés. Écart déclaré par eux : la règle est dans un additif daté (`decisions/0005-ADR-addendum-1-registry-artifacts.md`), pas
  dans l ADR 0005 figé (empreinte P0 `b011e4de…` publiée). Recommandation de l orchestrateur : accepter l additif (l ADR garde son
  empreinte publiée ; l additif ne change aucune définition) ; décision à l investisseur. Réponse à RECHERCHES après elle.
- 2026-10-02 14:30 UTC : oracle G7 de `f39e679c` (page après la voie (b), tête actuelle de `lot/page-v1`) sortie 0, `581c62c5…`, 1 882 tests,
  0 rouge, R-25 1 130 ; c est l oracle du G7 de la partie 3 ; le VERDICT attend une session sous `claude-fable-5-1`.
- 2026-10-02 14:31 UTC, **G7 DE LA PARTIE 3 (la page, le site) : ACCEPTÉ** (orchestrateur `claude-fable-5-1`, session remise sous ce modèle
  par l investisseur à 14:3x ; son autorisation « rends le G7 sous opus 5.5 » n a pas eu à servir). Arbre `f39e679c` de `lot/page-v1`
  (`d1120612` → `f39e679c`) : G2 unique `ba7514c8…` approuvée avec corrections, tour de corrections `133b6287`, checkpoint `aca2af79…`
  ACCEPTE-AVEC-CORRECTIONS (corrections 1 à 5 faites, dont la voie (b)), oracle G7 `581c62c5…` sortie 0 (1 882 tests, 0 rouge, R-25
  1 130). `error_origin` du G7 : C-1 (ancres de tueurs décalées par les fusions) = orchestrateur, fusions sans contrôle des ancres
  (item FUSION-KILLER-ANCHORS-1) ; C-2 à C-5, N-1 à N-12 = générateurs des lots, pliés ; Q-10 (`G7.txt` et arbre de publication) =
  orchestrateur, planification de la CA sans relire `DOJO_PUBLISH_TREE_PATHS`, tranché par la voie (b). Tuyaux (Branchement) : rien
  de la page n est servi aujourd hui, registre `upcoming` exact ; `history-read.ts` → `run-final.sh` branché pour cette nuit ;
  `verify-dojo.mjs` → synchro, extrait du mandataire, page : à brancher aux actes CA-1, §24, TU-7. Reste avant clôture : ACCORD de
  l investisseur sur la partie (décision 300), fusion par pas au tronc, puis les actes. Additif ADR 0005 accepté par l investisseur.
- 2026-10-02 14:32 UTC : réponse à RECHERCHES recherches#40 (`e7471ac`) : contrôle de `a43ad70` conforme, additif accepté, outil en
  cours ; prochain message = l empreinte MONARK, avant toute comparaison.
- 2026-10-02 14:50 UTC, ACCORD de l investisseur sur la partie 3 (« accord sur la partie 3, fusionne au tronc ») : fusion au tronc par
  pas. Mesuré : `lot/etude-suite` et `lot/page-v1` divergent depuis `8950ab15` (97 et 89 commits), 6 404 lignes comptées, aucun conflit,
  aucun fichier de code commun. Coupes candidates (premier parent, vertes au magasin) : `89403796`, `c0c60617`, `d1120612`, `2fab0d81`,
  `229e9aca`, `f39e679c` ; à prouver par oracle neuf : `c7e26216` (659), `8aaba460` (+861), `1b57566c` (+1 105) : trois oracles G7
  lancés en série (`F:/tmp/trunk-map/`, sorties `oracles.out`). Puis, par pas : `merge --no-ff` dans le tronc, oracle G7 du tronc
  (`--base` = tête avant le pas), red-proof, tueurs du pas ; ligne HANDOFF après chaque oracle. `G7.txt` inchangé cette nuit.
- 2026-10-02 17:04 UTC : FUSION AU TRONC FAITE, neuf pas, 15:15 → 17:03 UTC (`F:/tmp/trunk-map/steps/chain.log`) : `f35235fe`, `195df42b`,
  `1b66251c`, `a97013b9`, `e4837377`, `b122ea17`, `bf3451c0`, `bc247f3c`, `d10d757f` (tête du tronc = `lot/page-v1` `f39e679c` fusionnée).
  Oracle G7 du tronc VERT à chaque pas (neuf enregistrements, sortie 0). Tueurs : 0 survivant sur les neuf pas ; non conclus = le seul
  tueur du test du trousseau, sauté jusqu à A-4p (`c0c60617`), DOJO-KEYRING-KILLER-REMEASURE-1 ; ancres perdues à deux pas (lignes
  déplacées par la fusion), remesurées aux pas suivants (34/34 au dernier). red-proof, instruit pas par pas : 125 F2P ; 27 refus en
  quatre classes, aucun hors d elles : 18 « green at base » (gardes de non-régression, G0-lot-entry-main-link-1 l.55), 1 « not green at
  gel » (TU-K sauté jusqu à A-4p), 2 « red at base without an assertion failure » (`dojo_table_units_only_with_a_version`,
  `dojo_units_compose_collect_to_publish_to_verify` : rouges à la base par une erreur, pas une assertion), 4 « import red » sur
  `history-build.ts` (export neuf, HISTORY-PROVISIONAL), 2 ancres périmées du RUNBOOK au pas 8, corrigées au pas 9 (C-1). Les 27 ont
  leur tueur tué dans la campagne du pas. Aucune dette.
  Correction 3 (b) : `G7.txt` passera à `d10d757f` avant CA-1 ; `/f/Monark` en extraction propre de ce commit.
- 2026-10-02 17:04 UTC : lot DOJO-PAGE-FOLD-1 (go investisseur 15:5x, « pas de gates ») livré et gelé `f4c3e28f` (`lot/page-fold`) : deux
  volets natifs sous la table, aucun mot changé, 64 tests de page verts, portes statiques 0, R-25 156 ; réserve acceptée : deux phrases
  de la table restent visibles (état interne de `DojoTable`). Captures envoyées à l investisseur. Fusion au tronc après un oracle G7.
  17:13 UTC : fusionné au tronc `4ce547b0`, oracle G7 du tronc sortie 0 (`18724f62…`, 1 882 tests). Validation visuelle C-V-4 rendue par
  l investisseur à 17:0x UTC : les six points gardés tels quels. Reste : Q-4 (budget mobile de laboratoire rouge).
- 2026-10-02 (16:1x à 16:2x UTC) : RECHERCHES : P2 clos, rapport de la vague 1 publié (`monark-kata-spec` `4b92f09`, octets `e91edb41…`
  vérifiés) ; Q-P2b-2/3 clos ; accord SPEC-EWMA-ASSOC-1 avec S-5 (#44) ; relecture EPOCH-EVENTS-1 et vague 2 rendue (#45), pliée en v2
  (`f7378e9`). Items MONARK formés : RECORDER-SCALE-BREAK-1, RECORDER-SCHEMA-FIELDS-1, RECORDER-EXCHANGEINFO-1 (sur go),
  USDT-USD-REFERENCE-1, ENGINE-ROW-RETIRE-PATH-1, RECALC-FIELDS-2 (ETAT). Décision investisseur attendue : calendrier de SPEC-EWMA-ASSOC-1.
- 2026-10-02 15:30 UTC : go de minuit reçu ; lanceur `F:/tmp/dojo/final/wait-and-run.sh` armé ; annonce X publiée depuis le 1er octobre
  (investisseur) ; validation visuelle : page reconstruite à l ancre 30/30/30/30/90, captures envoyées, six questions C-V-4 encore ouvertes.
- 2026-10-02 08:26 UTC, ÉCART DE ROSTER relevé par l orchestrateur : depuis 02:51:22 UTC, les tours de l orchestrateur tournent sous
  `claude-opus-5-5` (519 tours dans la transcription de la session), pas sous `claude-fable-5-1` (règle : orchestrateur = Fable 5.1).
  Actes faits sous ce modèle : contrôle et accord P2a complet (recherches#38), consolidation du CLAUDE.md global, adjudications et
  fusions de la partie 3. Rendu à l investisseur ; le G7 de la partie 3 attend sa décision (session remise sous Fable 5.1, ou non).

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
- Méthode (décision 300) : un chantier = une ADR et au plus trois parties (cinq pour un gros chantier) ; chaque lancement d agent sur go de l investisseur.
