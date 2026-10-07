# PAROXYSME-Bell : registre intérimaire des limites de MONARK Bell (actions tokenisées hors séance)

- **Objet** : versement intérimaire (a′) du plan de route PAROXYSME v3 (§4.1 A, §6 « Transition ») : la pièce `built` Bell reçoit son
  registre ; il porte les 57 limites de l'inventaire validé de Bell, une entrée par identifiant.
- **Règle** (règles « Dettes » et « PAROXYSME » de l'investisseur ; décision 251 rappelée par `docs/PAROXYSME-Dojo.md`) : une limite
  déclarée n'est jamais une fin ; elle mène à un item, à une campagne, puis à une décision. Ici, chaque entrée ouverte porte un item, un
  porteur et un déclencheur ; ce qui ne se reproduit pas tel quel à la tête va à un doute nommé (§7).
- **Provenance** : écrit par PAROXYSME (worker `claude-opus-5-5`, effort max) le 2026-10-07 à partir de 17:28 UTC, tâche 1 du tableau
  MONARK ↔ PAROXYSME. Sources : l'inventaire validé de Bell (dossier d'étude du 2026-10-06), la couverture de `CHANTIERS-CANDIDATS.md` §4
  et les fenêtres du plan v3 §4 (chemins et empreintes au §8). Relecture : une G2 par une instance neuve ; contrôle par diff, fusion et
  ligne d'ETAT : MONARK.
- **Bases** : inventaire mesuré à `d8fe354c`, ETAT lu à `57a131fc`. Toutes les ancres de ce registre sont à la tête `87b821b0` de
  `lot/etude-suite`. Elles sont reportées par l'outil `reanchor.mjs` (pièce de la boîte PAROXYSME), puis relues à la tête par lecture
  bornée (`git show 87b821b0:<fichier> | awk 'NR>=a && NR<=b'`, avec le nombre de lignes du fichier) : la version du commit `d2332e2` ne
  vérifiait pas qu'une ligne existe ; la version corrigée (commit `a55a62d`) refuse une ligne hors du fichier, et aucune ancre de ce
  registre ne l'est. Hors d'ETAT, chaque ancre de l'inventaire et chaque ancre ajoutée ici garde son numéro et son texte
  (`unchanged-file`, sauf `same` pour `docs/RUNBOOK-dojo.md` l.1-5, `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` l.57, l.131 et
  `docs/JOURNAL-PROVENANCE.md` l.398, l.412) ; les 11 plages d'ETAT citées par l'inventaire gardent leur texte, 7 changent de numéro (§7,
  doute 2).
- **Préséance** : `docs/ETAT.md` l.7-11 ; ETAT prime. Un item nommé hors d'ETAT et du code n'est pas compté comme formé : il est écrit
  « à former » (« à re-former » s'il est écrit hors d'ETAT, dans un ADR, un RUNBOOK, un FAITS ou un rapport de gate, ou dans le registre
  effacé) et porté par son chantier.
- **Labels** : le `built` de Bell ne change pas ; `apps/site/lib/fleet.ts` n'est pas touché par ce versement.
- **Frontière** : personne ne touche à Bell en attendant le fondateur (règles de la session PAROXYSME, `CLAUDE.md` de la boîte l.138 ;
  décision D6 de MONARK). Ce registre n'écrit que des documents et ne propose aucun acte sur l'hôte ; les actes datés y sont des
  déclencheurs, portés par le fondateur quand ils sont hors délégation. Aucune clé, aucun chemin de clé, aucune adresse d'hôte n'y figure.

## 0. Comment lire ce registre

- **Une entrée par limite**, ouverte par le préfixe `- **`, sur quatre lignes logiques (forme de `docs/PAROXYSME-Dojo.md` §0) ; une ligne
  qui dépasserait 160 caractères continue en retrait, comme au registre du Harnais.
- **Étiquettes** : celles de l'inventaire, inchangées : `L-nn` (limites de la fiche du 27/09), `PX-Bell-17` et `PX-Bell-18` (posées par
  le registre du 27/09), `N-nn` (nouvelles) ; `BLT-nn` numéroterait une limite trouvée à la tête (§5 : aucune). Ce sont des numéros de
  ligne de registre, jamais des items, et aucune n'apparaît dans un champ « item ». L'inventaire écrit L-04 et L-05 sur une seule rangée
  de sa table (l.82) : ce sont deux identifiants, donc deux entrées.
- **Champs** : limite (25 mots au plus) ; source (fichier et ligne à `87b821b0`) ; touche (texte public que la limite qualifie) ; nature ;
  item ; porteur ; déclencheur ; état ; suite.
- **Natures** (celles de l'inventaire) : T théorie · M mesure · D donnée · P dépendance · Dr droit · C capacité ; « texte » : une phrase
  publique.
- **Item, porteur, déclencheur** (règles acceptées par MONARK, message `07d99e2` de la boîte, qui répond à `d4b3d07`) :
  - un item formé à ETAT est cité avec sa ligne à la tête, et garde le porteur et le déclencheur qu'ETAT lui écrit ;
  - une limite que `CHANTIERS-CANDIDATS.md` §4 rattache à un chantier prend ce chantier pour item de porteur (`PXC-nn`, sa partie, et
    l'item que la partie forme) ; porteur : PAROXYSME, qui porte les chantiers (TABLEAU de la boîte, décision de MONARK du 2026-10-07),
    MONARK gardant l'ordre et l'attribution ; déclencheur : la partie et sa fenêtre au plan v3 §4 ;
  - les deux sont écrits quand les deux existent ; un acte hors délégation (clés et comptes, dépense, juriste, périmètre) a pour porteur le
    fondateur, par MONARK ; une lecture sur place ou un acte d'hôte a pour porteur MONARK.
- **Fenêtres du plan v3 §4** : F1 = §4.1, semaine du 2026-10-07 ; F2 = §4.2, du 2026-10-14 au service de la vague 1 (vers le
  2026-10-20) ; F3 = §4.3, du 2026-10-21 au 2026-11-16 ; F4 = §4.4, du 2026-11-17 au 2026-12-31 ; F5 = après le 2026-12-31, avec ligne
  d'attente datée au versement (plan §4.4, dernier alinéa).
- **D-5** : la décision du fondateur sur le placement de Bell (son créneau ; PLAN §4 (v) l.511-512, §7.3 l.894). « Sous D-5 » : la partie
  touche le code, les pages, les publications ou l'hôte de Bell et attend cette décision ; sans décision contraire, rien avant le
  2026-11-16.
- **États** : `ouvert` ; `changé` (l'état diffère de celui de la fiche du 27/09 ou de l'inventaire, dit en suite) ; `clos (preuve : …)`.
- **Abréviations** : ETAT = `docs/ETAT.md` ; METHOD = `apps/site/app/bell/method/page.tsx` ; PAGE = `apps/site/app/bell/page.tsx` ;
  TERMS = `apps/site/app/bell/terms/page.tsx` ; BM = `apps/site/lib/bell-method.ts` ; FLEET = `apps/site/lib/fleet.ts` ;
  B0 = `docs/adr/ADR-B0-programme-bell.md` ; T1AII = `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` ;
  T1B = `docs/adr/ADR-T1b-backend.md` ; OTSA = `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` ; RB = `docs/RUNBOOK-bell.md` ;
  CARTO = `docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md` ; CC = `CHANTIERS-CANDIDATS.md` ; PLAN = `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` ;
  INV-B = inventaire de Bell (lignes du fichier) ; FICHE = registre de Bell du 27/09 ; 0005, 0006 = décisions de RECHERCHES. CC, PLAN,
  INV-B, FICHE, 0005 et 0006 sont hors du tronc (§8) ; 0005 et 0006 sont cités par la ligne que l'inventaire a lue (§7, doute 6).

## 1. Dettes : limites sans item, sans porteur ou sans déclencheur

- **Une dette de déclencheur, reconnue par MONARK** (message `7041de4` de la boîte, l.11 : « la dette est la mienne ») : N-01. Le
  déclencheur que l'inventaire proposait à BELL-HOST-COTENANCY-1, « avant la publication seq 3 ou le prochain redéploiement d'une unité de
  l'hôte » (INV-B l.169), est passé le 2026-10-07 entre 17:4x et 17:5x UTC : la sonde du Dōjō a été déployée sur l'hôte de Bell, sous
  l'autorisation Q-20 du fondateur, sans le volet (b) (l.6-13). MONARK a décidé la suite (l.15-24) : un lot porté par RECHERCHES, (b)
  `InaccessiblePaths` vers le répertoire de la clé de Bell sur `monark-dojo-collect`, `monark-dojo-publish`, `monark-dojo-probe` et
  `monark-probe`, avec un test racine sur les unités committées, rouge d'abord, et (a) la phrase « dedicated host » bornée aux deux
  endroits de l'item (METHOD l.423, PAGE l.616) ; puis le redéploiement des unités sous Q-20 par MONARK, avec le relevé
  `systemctl show -p InaccessiblePaths` de chacune ; déclencheur : avant la publication seq 3 de Bell, au plus tard le 2026-10-09 à
  23:59 UTC. La dette est comptée ici jusqu'à la ligne d'ETAT de MONARK. Questions à MONARK : (1) le porteur et le déclencheur de la note
  de recherche (c) sur la séparation d'hôte, que le message ne donne pas (l.24 : la dépense est un acte du fondateur, que MONARK lui
  portera avec la note) ; proposés : MONARK, propriétaire que l'inventaire propose (INV-B l.167), avant la publication seq 3 de Bell ;
  (2) (a) touche les pages de Bell et (b) son hôte avant le 2026-11-16 : sous D-5 (§0), la décision du fondateur qui les couvre est à
  nommer (Q-20 couvre le redéploiement, l.22) ; (3) N-01 touche aussi FLEET l.352 et l.361 (« on its own host »), que (a) ne nomme pas
  (INV-B l.169 ; CC l.127-128) : à rattacher à (a) ou au noyau de PXC-02, ou à juger vrai.
- **Déclencheur passé, re-porté, à confirmer par MONARK** (constat bloquant de la G2) : L-37. Le déclencheur de C-1b-1 et C-1b-2
  (« prochaine modification de `apps/bell/test/rebase-crosscheck.test.ts` ») est atteint par `b9186e47` le 2026-09-27, sans C-1b-1 ni
  C-1b-2 ; il est re-porté par PXC-14 p2 (F4, sous D-5) et PXC-01 p2 (F3), à confirmer par MONARK. Même cas, dit à leur entrée et au §7,
  doute 10 : N-13 (déclencheur d'ETAT passé, re-porté par le ruling de PXC-05 p3) ; N-04 et L-22 (déclencheurs de documentation franchis
  pour CARTO-BR-1 et I-G2-5, re-portés par PXC-01 p2 et leur chantier). Sans confirmation de MONARK, chacune devient une dette de
  déclencheur, comptée ici.
- Toutes les autres entrées ouvertes des §2 et §3 portent un item, un porteur et un déclencheur atteignable (§5 : aucune entrée). Les huit
  limites que l'inventaire disait sans aucun item (N-01, N-02, N-07, N-08, N-09, N-10, N-11, L-36) en reçoivent un ici, par leur chantier
  ou, pour N-01, par la décision de MONARK.

## 2. Limites de la fiche et du registre du 27/09 : ouvertes ou changées (42, INV-B §4 ; L-38 close, §4)

- **L-01** · « Une transaction omise dans une page par ailleurs complète, rendue par l'opérateur, n'est pas détectable. »
  source : METHOD l.582 · touche : METHOD l.582 ; PAGE l.528-532 · nature : T/D
  item : PXC-07 TRUSTLESS-READ-2, partie 1 (campagne R1, complétude) ; PXC-14 BELL-WITNESS-1, partie 2 (énumération vérifiable ; PX-Bell-1
    du 27/09 et R-SP-1, T1AII l.553, à re-former) · porteur : PAROXYSME ; lectures sur place NT-03, NT-04 : MONARK · déclencheur : partie 1
    de PXC-07 (F3) ; partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : Tamassia (4 pages) et Li et al. reçus, non lus (INV-B l.144-145)
- **L-02** · « Corps relus sur un second opérateur à pas fixe connu (un sur cinq) ; un désaccord sur un corps échantillonné retire le fill sans le dire. »
  source : `apps/bell/src/collect.ts:385`, `:394-396`, `:402-403`, `:480` · touche : FLEET l.350 ; PAGE l.428-431 ; `README.md:194` · nature : M/C
  item : PXC-07 partie 1 (campagne R2, audit échantillonné) ; PXC-14 partie 2 (quorum complet ; PX-Bell-2 du 27/09, à re-former)
    · porteur : PAROXYSME ; crédits : le fondateur (dépense, PLAN §7.3 l.891) · déclencheur : partie 1 de PXC-07 (F3) ; partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : un désaccord ne laisse aucune faute (`collect.ts:396`) ; seule la part relue baisse (l.402) ;
    `quorum_sampled` est posé à tout échantillon partiel (l.403)
- **L-03** · « Le temps de bloc tient lieu de temps de soumission, sans ordre de grandeur publié. »
  source : BM l.62 · touche : BM l.62 (liste de résidus servie) · nature : M
  item : PXC-14 partie 2 (mesure sur deux opérateurs ; PX-Bell-3 du 27/09, à re-former) ; PXC-18 JURISTE-DROIT-1, partie 1 (FAITS des
    textes en vigueur) · porteur : PAROXYSME ; lectures sur place : MONARK (PLAN §7.2) ; crédits : le fondateur · déclencheur : partie 1
    de PXC-18 (F3) ; partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : la cible juridique change (RTS 25 abrogé, Règl. dél. (UE) 2025/1155, INV-B l.69), pas la limite
- **L-04** · « Une signature valide montre qui a produit une ligne et qu'elle est intacte, pas qu'elle est vraie ; l'équivocation reste ouverte. »
  source : METHOD l.586 ; FICHE l.45 · touche : METHOD l.586 ; PAGE l.689-692 · nature : T
  item : PXC-15 LOG-TIME-2, partie 1 (campagne L1, journaux transparents et équivocation ; PX-Bell-4 du 27/09, à re-former) ; construction
    en partie 2 (ancres Bell) · porteur : PAROXYSME · déclencheur : partie 1 de PXC-15 (F3) ; partie 2 (F3, sous D-5)
  état : ouvert · suite : la vérité se contrôle par recalcul ; le témoin public des têtes (`monark-record`) n'est pas construit, selon
    l'inventaire (INV-B l.82 ; `docs/adr/ADR-PUBLIC-CADENCE-1.md:5`, `:17`)
- **L-05** · « L'ancre ne montre pas qu'aucune autre ligne n'a été horodatée : deux timelines servies ne se voient que contre une copie antérieure. »
  source : METHOD l.521-522, l.462-468 ; FICHE l.46 · touche : METHOD l.521 ; PAGE l.689-692 · nature : T
  item : PXC-15 partie 1 (campagne L1 ; PX-Bell-4 du 27/09, à re-former) ; partie 2 (manifeste par ligne, cohérence entre deux têtes)
    · porteur : PAROXYSME · déclencheur : partie 1 de PXC-15 (F3) ; partie 2 (F3, sous D-5)
  état : ouvert · suite : même mécanisme que L-04 et PX-Bell-18
- **L-06** · « Placeholder public `relation_commerciale` ; « not independence from MONARK ». »
  source : PAGE l.567 ; METHOD l.441 ; B0 l.129 (ESC-2) · touche : PAGE l.567 ; METHOD l.441 · nature : Dr
  item : PXC-18 partie 1 (dossier juriste ; PX-Bell-5 du 27/09 et ESC-2 (b), B0 l.129, à re-former) ; décision en partie 2 · porteur :
    PAROXYSME (dossier) ; le fondateur, par MONARK (déclaration `relation_commerciale`, juriste) · déclencheur : partie 1 de PXC-18 (F3) ;
    décision en partie 2 (F4)
  état : ouvert · suite : l'ancre de l'acte (registre CHANTIERS, l.1435) est effacée (ETAT l.7-11)
- **L-07** · « L'heure de publication est l'horloge de l'hôte ; le bloc OTS n'en donne qu'une borne supérieure. »
  source : PAGE l.691 ; `docs/bell-publications/ANCHORS.md:15` (seq 2) · touche : FLEET l.351 ; `README.md:195` · nature : M
  item : PXC-15 partie 1 (campagne L2, bornes d'horodatage ; PX-Bell-6 du 27/09, à re-former) ; schéma de ligne v2 en partie 2
    · porteur : PAROXYSME · déclencheur : partie 1 de PXC-15 (F3) ; partie 2 (F3, sous D-5)
  état : ouvert · suite : Haber-Stornetta reçu (PXP-05), non lu (INV-B l.153)
- **L-08** · « L'ancre ne dit pas quand les données ont été collectées. »
  source : METHOD l.521-522 · touche : METHOD l.521-522 · nature : M
  item : Q6-ANCHOR-1 (OTSA l.305, absent d'ETAT : à re-former, PXC-01 PAROXYSME-STANDARD-1, partie 2) ; PXC-15 partie 2 (manifeste par
    ligne) · porteur : PAROXYSME ; MONARK (ligne d'ETAT) · déclencheur : partie 2 de PXC-01 (F3) ; partie 2 de PXC-15 (F3, sous D-5)
  état : ouvert · suite : l'inventaire cite OTSA l.304, séparateur du tableau ; l'item est à la l.305 (§7, doute 3)
- **L-09** · « Une preuve pendante dépend d'un calendrier ; aucun contrôle planifié de l'hôte. »
  source : METHOD l.523 ; CARTO l.163 (P-B3 absent) · touche : METHOD l.523 · nature : P
  item : PXC-05 SERVED-CONTROL-1, partie 3 (contrôle planifié ; BELL-VERIFY-SCHEDULE-1, OTSA l.307, et CARTO-BR-2, CARTO l.343, à
    re-former) · porteur : PAROXYSME ; acte sur l'hôte : MONARK sous go · déclencheur : partie 3 de PXC-05 (F3, sous D-5)
  état : ouvert · suite : même construction que N-05
- **L-10** · « `ots verify` n'a jamais tourné contre un nœud ; les trois blocs de la preuve seq 2 sont lus dans le fichier. »
  source : OTSA l.306, l.327-328 ; `docs/bell-publications/ANCHORS.md:15` · touche : METHOD l.500 · nature : M/P
  item : BELL-OTS-NODE-VERIFY-1 (OTSA l.306, absent d'ETAT : à re-former, PXC-01 partie 2) ; PXC-15 partie 2 (`ots verify` contre un
    nœud) · porteur : PAROXYSME ; MONARK (acte réseau ; ressources d'un nœud élagué à lire) · déclencheur : partie 2 de PXC-01 (F3) ;
    partie 2 de PXC-15 (F3)
  état : ouvert · suite : l'inventaire cite OTSA l.305 pour l'item et l.324-327 ; ils sont aux l.306 et l.327-328 (§7, doute 3)
- **L-11** · « Le contrôle (f) ne défait pas un re-hachage complet de la chaîne avant la publication de `ledger_sha256`. »
  source : T1AII l.393 · touche : aucune · nature : T
  item : C-F-4 (ancrage externe, T1AII l.393 ; `docs/course-bell/ANCHORS.md:1`, `:67` ; ligne de CHANTIERS effacée : à re-former, PXC-01
    partie 2) ; volet code : PXC-14 partie 2 · porteur : PAROXYSME ; MONARK (ligne d'ETAT) · déclencheur : partie 2 de PXC-01 (F3) ;
    partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : l'ancre de course TSLAx a dérivé (N-06) ; partie non nommée par la fiche (§7, doute 9)
- **L-12** · « L'historique du multiplicateur est reconstruit par l'énumération d'un seul opérateur. »
  source : BM l.54 ; T1AII l.269-271 · touche : BM l.54 · nature : D/P
  item : PXC-14 partie 2 (contrôle croisé sur un second archiveur ; résidu `authority_scan_mono_operator`, T1AII l.269-271) · porteur :
    PAROXYSME ; compte d'un second archiveur : le fondateur · déclencheur : partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : valeur servie relevée par l'inventaire, non relue ici, non expliquée (INV-B l.89 ; doute D-7, l.203 ; §7,
    doute 11)
- **L-13** · « L'historique `SetAuthority` du mint n'est pas balayé ; un changement qui s'annule reste le trou résiduel. »
  source : BM l.55 ; T1AII l.272-274 · touche : BM l.55 · nature : D
  item : PXC-14 partie 2 (balayage `SetAuthority` ; résidu `set_authority_unscanned`, T1AII l.272-274) · porteur : PAROXYSME
    · déclencheur : partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : valeur servie relevée par l'inventaire, non relue ici (INV-B l.90 ; doute D-7, l.203 ; §7, doute 11)
- **L-14** · « Résultats non étendus : conçu pour quatre symboles, trois publiés ; jambe Ethereum absente. »
  source : METHOD l.590-594 ; `test/bell-served.test.ts:127` · touche : METHOD l.592 · nature : D
  item : PXC-17 DOMAINE-PX-2, partie 3 (univers de Bell ; palier 2, `docs/ROADMAP-BELL.md:11`, et décision 82 effacée : à re-former)
    · porteur : PAROXYSME ; le fondateur (périmètre, PLAN §7.3 l.894) · déclencheur : partie 3 de PXC-17 (F5)
  état : ouvert · suite : ligne d'attente datée au versement ; aucun chantier Bell au plan du mois (ETAT l.14-23)
- **L-15** · « « assesses compliance with no condition of any order » : doctrine sans force, question Q1 jamais tranchée. »
  source : METHOD l.598 · touche : METHOD l.598 · nature : Dr
  item : PXC-18 partie 1 (avis du juriste ; PX-Bell-11 du 27/09, à re-former) ; décision Q1 en partie 2 · porteur : PAROXYSME (dossier) ;
    le fondateur (Q1 doctrine, juriste) · déclencheur : Q1 avant la release de textes servis (PLAN §7.3 l.889, F3) ; partie 1 de PXC-18 (F3)
  état : ouvert · suite : la doctrine D1 n'a plus de force (ETAT l.10)
- **L-16** · « « measures no effect of off-hours trading on the underlying market or its opening ». »
  source : PAGE l.741 · touche : PAGE l.741 · nature : T
  item : PXC-17 partie 1 (campagne D3, prix hors séance ; PX-Bell-10 du 27/09, à re-former) ; volet doctrine : PXC-18 partie 1 (avis du
    juriste), décision Q1 en partie 2 · porteur : PAROXYSME ; le fondateur (Q1, juriste) · déclencheur : campagne D2-D4 de PXC-17 (F4) ;
    Q1 avant la release de textes servis (PLAN §7.3 l.889, F3) ; partie 1 de PXC-18 (F3)
  état : ouvert · suite : Hasbrouck et Gonzalo-Granger reçus, Barclay-Hendershott détenu, non lus (INV-B l.159)
- **L-17** · « La condition J (levier) est hors couverture : aucun fait on-chain mesurable par Bell. »
  source : B0 l.77 · touche : aucune (aucune occurrence sous `apps/site/app/bell`, `git grep` à la tête) · nature : D/T
  item : PXC-17 partie 1 (campagne D2-D4 ; PX-Bell-8 du 27/09, à re-former) · porteur : PAROXYSME ; lecture sur place NT-08 (Kamino) :
    MONARK (PLAN §7.2) · déclencheur : campagne D2-D4 de PXC-17 (F4), après la lecture
  état : ouvert · suite : la documentation « price band » n'est pas localisée (INV-B l.157)
- **L-18** · « Réserves relayées, non vérifiées contre le dépositaire ; `por_unavailable` sur chaque course. »
  source : `apps/bell/src/supply.ts:88-99` ; `docs/bell/FAITS-xstocks-por-api-2026-09-27.md:11-13` · touche : BM l.63, l.87 · nature : D
  item : BELL-POR-XSTOCKS-API-1 (FAITS l.13, absent d'ETAT : à re-former) ; PXC-14 partie 1 (lecture P-C-2, seconde source ; PX-Bell-7 du
    27/09, à re-former) · porteur : MONARK (lecture sur place du ToS et du schéma) ; PAROXYSME (PXC-14) · déclencheur : lecture du bloc A
    (PLAN §4.1 A l.544, F1), « avant tout appel » (FAITS l.13) ; partie 1 de PXC-14, sous D-5
  état : ouvert · suite : le fait servi n'est pas contredit (FAITS l.11 ; PLAN l.325-326)
- **L-19** · « Le témoin de halt est vide. »
  source : PAGE l.185-191 · touche : PAGE l.185-191 · nature : D
  item : PXC-17 partie 3 (univers élargi ; décision 82 et fixture DST, à re-former) · porteur : PAROXYSME ; le fondateur (périmètre)
    · déclencheur : partie 3 de PXC-17 (F5)
  état : ouvert · suite : ligne d'attente datée au versement ; portée avec L-14 (INV-B l.96, l.209) ; compte servi non relu (§7, doute 11)
- **L-20** · « Classe d'écart hors séance : aucune garantie hors échangeabilité ; week-end `under_calib` jusque vers mi-2027. »
  source : B0 l.105 ; `README.md:34` ; 0005 l.120 ; 0006 l.25 · touche : `README.md:34`, `:42` · nature : T
  item : PXC-17 partie 3 (classe propre, ADR R-6, après la vague 2 ; PX-Bell-9 du 27/09, à re-former) · porteur : PAROXYSME ; MONARK
    (décision D-12, INV-B l.208 : tenir la substitution de PXP-01 par la décision 277, ou reformer la demande, INV-B l.191) · déclencheur :
    partie 3 de PXC-17 (F5) ; D-12 : celui de PX-STD-PROC-READ-1, au plus tard en §4.3 (F3 ; PXP-01 parmi les reçus non lus, PLAN l.869, l.904-906)
  état : changé (INV-B §3.2 : route définie par le contrat 1.1.0, non programmée ; à la tête, 35 tables de politique, aucune pour Bell)
    · suite : ligne d'attente datée au versement ; décision 277 hors du tronc (§7, doute 6)
- **L-21** · « bStocks hors v1 ; l'« item formé » n'a pas d'identifiant. »
  source : B0 l.105, l.14 · touche : aucune · nature : D
  item : PXC-17 partie 3 (univers ; PX-Bell-13 du 27/09, à re-former) · porteur : PAROXYSME ; lecture sur place NT-09 (prospectus) :
    MONARK · déclencheur : partie 3 de PXC-17 (F5)
  état : ouvert · suite : ligne d'attente datée au versement
- **L-22** · « Que `v` soit le volume consolidé du SIP n'est pas établi. »
  source : B0 l.241-242 ; `apps/bell/src/volume.ts:13` · touche : METHOD l.563 · nature : D
  item : I-G2-5 (B0 l.296, absent d'ETAT : à re-former, PXC-01 partie 2) ; PXC-14 partie 2 · porteur : PAROXYSME ; lecture sur place :
    MONARK · déclencheur : partie 2 de PXC-01 (F3) ; partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : la page dit « consolidated daily share volumes » (METHOD l.563)
- **L-23** · « Le début de la journée SIP est supposé à 04:00 ET. »
  source : B0 l.200-201 · touche : aucune · nature : D/Dr
  item : ADV-SIP-DAY-1 (B0 l.297, absent d'ETAT : à re-former, PXC-01 partie 2) ; PXC-14 partie 2 · porteur : PAROXYSME ; lecture sur
    place des plans CTA et UTP : MONARK · déclencheur : partie 2 de PXC-01 (F3) ; partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : aucune
- **L-24** · « Un split pendant la période ADV n'est pas détecté. »
  source : B0 l.298 · touche : aucune · nature : D
  item : ADV-SPLIT-1 (B0 l.298, absent d'ETAT : à re-former, PXC-01 partie 2) ; PXC-14 partie 2 · porteur : PAROXYSME · déclencheur :
    partie 2 de PXC-01 (F3) ; partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : l'inventaire ne cite pas de ligne ; l'item est à B0 l.298
- **L-25** · « Une session coupée par les bornes de collecte est rapportée sans drapeau. »
  source : B0 l.303 · touche : aucune · nature : C
  item : ADV-SESSION-CUT-1 (B0 l.303, absent d'ETAT : à re-former, PXC-01 partie 2) ; PXC-14 partie 2 · porteur : PAROXYSME
    · déclencheur : partie 2 de PXC-01 (F3) ; partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : l'inventaire ne cite pas de ligne ; l'item est à B0 l.303
- **L-26** · « Garde ESC-1 : une clé numérique `no_adv*` passerait. »
  source : B0 l.231 · touche : aucune · nature : C
  item : PXC-14 partie 1 (lot E-0 ; PX-Bell-14 du 27/09, à re-former) · porteur : PAROXYSME · déclencheur : partie 1 de PXC-14, sous D-5 :
    F4 au plus tôt sans décision contraire du fondateur (PLAN l.511-512), en attendant l'ADR de PXC-14
  état : ouvert · suite : placement de la partie 1 (§7, doute 4)
- **L-27** · « La clé de date du close est une hypothèse déclarée. »
  source : `apps/bell/src/close.ts:84-88` · touche : aucune · nature : D
  item : PXC-14 partie 1 (lot E-0 ; PX-Bell-15 du 27/09, à re-former) · porteur : PAROXYSME ; FAITS des barres journalières (demi-journées,
    changements d'heure) : MONARK · déclencheur : partie 1 de PXC-14, sous D-5 : F4 au plus tôt sans décision contraire du fondateur
    (PLAN l.511-512), en attendant l'ADR de PXC-14
  état : ouvert · suite : la date UTC des barres journalières est lue (INV-B l.162)
- **L-28** · « Le close est une redistribution du SIP ; la valeur publiée est inversible. »
  source : B0 l.28 · touche : PAGE l.532 · nature : Dr
  item : PXC-18 partie 1 (dossier juriste ; LIC-DBN-1, P-DBN-1, P-POL-1, ESC-1-REWRITE, MESURE-INTERSECTION-1, hors d'ETAT : à re-former)
    · porteur : PAROXYSME (dossier) ; le fondateur (juriste) · déclencheur : partie 1 de PXC-18 (F3)
  état : ouvert · suite : aucune
- **L-29** · « Un pool actif hors des points échantillonnés n'est pas vu. »
  source : `apps/bell/src/discover.ts:10-11` · touche : aucune (amont de L-01) · nature : D
  item : PXC-14 partie 2 (`getProgramAccounts` filtré ; PX-Bell-12 du 27/09, à re-former) · porteur : PAROXYSME ; crédits : le fondateur
    (dépense, PLAN §7.3 l.891) · déclencheur : partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : dépôts des programmes de pools à épingler (INV-B l.160)
- **L-30** · « Le registre des fills et l'historique des multiplicateurs sont « to be published ». »
  source : METHOD l.565-567 ; PAGE l.530-532 · touche : METHOD l.565-567 ; PAGE l.530-532 ; `README.md:68`, `:152` · nature : C/Dr
  item : PXC-18 partie 1 (clause de redistribution des CGU des opérateurs ; PX-Bell-16 du 27/09, à re-former) ; publication : PXC-11
    THIRD-PARTY-1, partie 3 · porteur : PAROXYSME ; lectures des CGU : MONARK ; le fondateur (juriste) · déclencheur : partie 1 de
    PXC-18 (F3) ; partie 3 de PXC-11 (F3, sous D-5)
  état : ouvert · suite : la fiche de PXC-11 ne nomme pas cette limite, le bloc CC l.908 l'y rattache (§7, doute 9)
- **L-31** · « Le cœur du collecteur n'est pas exporté. »
  source : `scripts/export-public.mjs:103-105` · touche : PAGE l.645-649 ; METHOD l.458, l.544 ; `apps/site/app/roadmap/page.tsx:198`
    · nature : C
  item : PXC-11 parties 2-3 (export du collecteur ; ligne « Bell collector » de la feuille de route, `docs/adr/ADR-PUBLIC-CADENCE-1.md:194`)
    · porteur : PAROXYSME ; release du miroir : le fondateur · déclencheur : parties 2-3 de PXC-11 (F3, sous D-5)
  état : ouvert · suite : prérequis de N-07 et N-08 ; partie non nommée par la fiche (§7, doute 9)
- **L-32** · « La politique de rotation de la clé est « to be published ». »
  source : METHOD l.432 ; RB l.576 · touche : METHOD l.432 · nature : C
  item : BELL-KEY-ROTATION-CAL-1 (RB l.576, absent d'ETAT : à re-former, PXC-01 partie 2) ; PXC-14 partie 3 (rotation et politique
    publiée) · porteur : le fondateur, par MONARK (rotation : clés) ; PAROXYSME (texte de la politique) · déclencheur : avant le
    2026-12-22 (RB l.576 ; PLAN §4.4 l.612-613), sous D-5 ; re-formation : partie 2 de PXC-01 (F3)
  état : ouvert · suite : même échéance que DJ-L31 du registre Dōjō (§6) ; placement de PXC-14 (§7, doute 4)
- **L-33** · « Entité légale, licence et droit applicable sont « to be decided ». »
  source : TERMS l.55, l.95, l.188 · touche : TERMS l.55, l.95, l.188 · nature : Dr
  item : JURISTE-ACTE-NOV-1 (RB l.55, absent d'ETAT : à re-former, PXC-01 partie 2) ; PXC-18 partie 1 (PLAN §4.3 l.601) · porteur : le
    fondateur, par MONARK (juriste) ; PAROXYSME (dossier) · déclencheur : novembre 2026 (RB l.55 ; PLAN §7.3 l.893) ; partie 1 de PXC-18
    (F3) ; re-formation : partie 2 de PXC-01 (F3)
  état : ouvert · suite : le texte des Terms suit l'acte (INV-B l.110)
- **L-34** · « L'acheteur n'est pas démontré. »
  source : B0 l.105 · touche : aucune · nature : D
  item : PXC-17 partie 3 (portée et marché ; lot GTM séparé, `docs/GTM-BELL.md:5`, absent d'ETAT : à re-former) · porteur : PAROXYSME
    · déclencheur : partie 3 de PXC-17 (F5)
  état : ouvert · suite : ligne d'attente datée au versement ; partie non nommée par la fiche (§7, doute 9)
- **L-35** · « Le statut FINRA de Securitize est un [2nd] non confirmé. »
  source : `docs/GTM-BELL.md:34` · touche : aucune · nature : D
  item : PR-GTM-10 (`docs/GTM-BELL.md:157`, absent d'ETAT : à re-former, PXC-01 partie 2) ; PXC-17 partie 1 (campagne D2-D4) · porteur :
    MONARK (lecture sur place) ; PAROXYSME (campagne) · déclencheur : la lecture, avant la campagne D2-D4 de PXC-17 (F4) ; re-formation :
    partie 2 de PXC-01 (F3)
  état : ouvert · suite : partie non nommée par la fiche (§7, doute 9)
- **L-36** · « Amendement D2bis : statut inconnu ; ses sources sont [2nd] ou mono-opérateur. »
  source : `docs/adr/ADR-B0-amendement-D2bis-DRAFT.md:116` · touche : aucune · nature : D
  item : PXC-01 partie 2 (BELL-D2BIS-STATUS-1, à former : adopté, abandonné ou en attente) ; PXC-18 partie 2 si le périmètre change
    · porteur : MONARK (ruling) ; le fondateur (périmètre, PLAN §7.3 l.894) · déclencheur : partie 2 de PXC-01 (F3)
  état : ouvert · suite : sans aucun item à l'inventaire (INV-B l.113)
- **L-37** · « La forme sans attente du retry infini (mutant X02) pend au lieu de rougir. »
  source : T1AII l.536 ; `docs/G2-lot-bell-shortpage-1-1b.md:50-55` · touche : aucune · nature : C
  item : C-1b-1, C-1b-2 (rapport de gate l.50-55, absents d'ETAT : à re-former, PXC-01 partie 2) ; PXC-14 partie 2 · porteur : PAROXYSME
    · déclencheur : celui du rapport (l.54, « prochaine modification de `apps/bell/test/rebase-crosscheck.test.ts` »), passé ;
    re-formation : partie 2 de PXC-01 (F3) ; au plus tard partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert (déclencheur passé : `b9186e47`, 2026-09-27 20:29 UTC, change ce test sans C-1b-1 ni C-1b-2 ; §1 ; §7, doute 10)
    · suite : tests seulement, code de production juste (rapport l.50-53) ; partie non nommée par la fiche (§7, doute 9)
- **L-39** · « TSLAon sans source de multiplicateur ; calendrier arrêté au 2026-12-31 ; `readMintToken2022` rend « 1 ». »
  source : `apps/bell/src/sessions.ts:27-28` ; B0 l.299-301 · touche : METHOD l.183, l.195 · nature : D
  item : ADV-CAL-2027, SUPPLY-READ-1, TSLAON-MULT-1 (B0 l.299-301, absents d'ETAT : à re-former, PXC-01 partie 2) ; PXC-14 partie 1
    (calendrier 2027 ; fiche, CC l.472) · porteur : MONARK (lecture sur place du calendrier 2027, PLAN §7.2) ; PAROXYSME (extension du
    calendrier) · déclencheur : avant le 2027-01-01 (B0 l.299 ; PLAN §4.4 l.613), sous D-5 ; re-formation : partie 2 de PXC-01 (F3)
  état : ouvert · suite : échéance datée ; hors du calendrier, aucune session n'est produite (METHOD l.183 ; `sessions.ts:27`) ; le
    plan met ADV-CAL-2027 en partie 2 (§7, doute 4)
- **L-40** · « Mesure fondatrice non servie : placeholders `window_TSLAx` et `t4_TSLAx_*`. »
  source : PAGE l.473-482 ; METHOD l.300 · touche : PAGE l.473-482 ; METHOD l.300 · nature : D
  item : PXC-17 partie 3 (mesure fondatrice ; chaîne -b1-bis, B0 l.169-176, à re-former) · porteur : le fondateur (course, clés, crédits,
    PLAN §7.3 l.894) ; PAROXYSME · déclencheur : la décision du fondateur ; partie 3 de PXC-17 (F5)
  état : ouvert · suite : ligne d'attente datée au versement ; partie non nommée par la fiche (§7, doute 9)
- **L-41** · « Appariement écart-séance par rang : deux sessions du même seau et du même `n` sont appariées sans alerte. »
  source : `docs/adr/ADR-BELL-CASH-LEG-1.md:39` · touche : aucune · nature : C
  item : BELL-GAP-ANCHOR-1 (`docs/adr/ADR-BELL-CASH-LEG-1.md:39`, absent d'ETAT : à re-former, PXC-01 partie 2) ; PXC-14 partie 2
    · porteur : PAROXYSME · déclencheur : partie 2 de PXC-01 (F3) ; partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : partie non nommée par la fiche (§7, doute 9)
- **PX-Bell-17** · « L'indépendance réelle des deux opérateurs (même amont ?) n'est nommée nulle part. »
  source : FLEET l.350 ; PAGE l.428-431 · touche : FLEET l.350 ; PAGE l.428 · nature : P
  item : PXC-07 partie 1 (campagne R3, quorums et indépendance) ; phrase : PXC-02 PUBLIC-SENTENCES-2, partie 3 ; construction : PXC-07
    partie 3 · porteur : PAROXYSME · déclencheur : partie 1 de PXC-07 (F3) ; partie 3 de PXC-02 (F3, sous D-5) ; partie 3 de PXC-07 (F5)
  état : ouvert · suite : valeur servie de `providers_distinct` relevée par l'inventaire, non relue ici (INV-B l.119 ; §7, doute 11) ;
    ligne d'attente datée pour la partie 3
- **PX-Bell-18** · « L'équivocation n'est pas nommée sur `/bell/method`. »
  source : METHOD l.584-587 · touche : METHOD l.584-587 · nature : T
  item : PXC-02 partie 3 (phrase bornée ; mécanisme : PXC-15 parties 1-2) · porteur : PAROXYSME · déclencheur : partie 3 de PXC-02 (F3,
    sous D-5)
  état : ouvert · suite : même famille que L-04 et L-05

## 3. Limites nouvelles (14, INV-B §4 : N-01 à N-14)

- **N-01** · « Hôte dit « dédié » : y tournent la sonde Narabi puis, depuis le 01/10, collecteur, éditeur et clé du Dōjō ; rien de servi ne le dit. »
  source : RB l.82 ; `docs/RUNBOOK-dojo.md:1-5` ; ETAT l.1618, l.1836 ; `deploy/monark-dojo-collect.service:50` ;
    `deploy/monark-dojo-publish.service:49` · touche : METHOD l.423 ; PAGE l.616 ; FLEET l.352, l.361 · nature : P/C
  item : BELL-HOST-COTENANCY-1, décidé par MONARK (`7041de4` l.15-24), pas encore à ETAT : (a) phrase bornée ; (b) `InaccessiblePaths`
    vers le répertoire de la clé de Bell sur quatre unités, test racine ; (c) note de recherche avec prix · porteur : RECHERCHES ((a),
    (b)) ; MONARK (redéploiement sous Q-20, ligne d'ETAT) ; le fondateur (dépense de (c)) · déclencheur : avant la publication seq 3
    de Bell, au plus tard le 2026-10-09 à 23:59 UTC (`7041de4` l.23) ; note (c) : porteur et déclencheur à fixer par MONARK (§1)
  état : ouvert, **dette de déclencheur** (§1) : la sonde du Dōjō est déployée depuis le 2026-10-07 sans (b) (`7041de4` l.6-13 ; à
    `87b821b0`, ETAT l.1858-1866 la dit non déployée) · suite : CC la rangeait en PXC-02 p3 et PXC-05 p3 ; §6
- **N-02** · « Le registre dit « Connects: Hikae, Shōgen » sans import ni paire mesurée ; le README dit « derived from the same gate ». »
  source : `apps/bell/package.json:6` ; CARTO l.156-163 · touche : FLEET l.354 (`apps/site/app/applications/built-application-card.tsx:74`) ;
    `README.md:146-147`, `:214`, contre `README.md:34` et FLEET l.280, l.284 · nature : C
  item : PXC-02 partie 1, noyau (README l.146-147, l.214 : PLAN §5.1 l.659-660) ; FLEET l.354 : PXC-02 partie 1 (BELL-CONNECTS-WITNESS-1,
    à former ; CC l.144) · porteur : PAROXYSME · déclencheur : tâche 2 du TABLEAU (noyau, F1) ; FLEET l.354 : le prochain lot qui touche
    `fleet.ts` (INV-B l.170), au plan la PR du noyau (F1, PLAN l.506, l.555)
  état : ouvert · suite : `apps/bell` n'importe ni Hikae, ni Shōgen, ni le harnais (`git grep` nul sur `apps/bell/src` et `scripts`) ;
    `fleet.ts:354` manque aux listes du PLAN §5.1 (§7, doute 8)
- **N-03** · « Aucune cadence ni cible de latence publiée ; publication par acte opérateur ; rien publié depuis le 24/09. »
  source : RB l.6-7 ; T1B l.121-129 · touche : FLEET l.346 · nature : C
  item : phrase : PXC-02 partie 3 (BELL-CADENCE-TEXT-1, à former ; T1B l.129) ; minuterie : PXC-14 partie 3 (BELL-COLLECT-TIMER-1, RB l.7,
    absent d'ETAT : à re-former) · porteur : PAROXYSME ; le fondateur (clé ou compte RPC de la collecte, PLAN §7.3 l.890) · déclencheur :
    phrase : partie 3 de PXC-02 (F3, sous D-5) ; minuterie : le déclencheur conjonctif de T1B l.121-126 ; partie 3 de PXC-14 (F5)
  état : ouvert · suite : `apps/site/data/bell-served.json` inchangé depuis `d8fe354c` : aucune publication neuve à la tête ; ligne
    d'attente datée au versement pour la minuterie (PXC-14 partie 3, F5)
- **N-04** · « La copie immuable de la provenance seq 1 nomme un fournisseur de données, contre les Terms servis. »
  source : CARTO l.342 ; `docs/adr/ADR-BELL-CASH-LEG-1.md:10` · touche : `apps/site/data/bell-legal.json:56` (Terms) · nature : Dr
  item : CARTO-BR-1 (CARTO l.342 ; ligne de CHANTIERS effacée : à re-former, PXC-01 partie 2) ; ruling et ancrage : PXC-15 partie 2 ;
    option (a) : PXC-18 partie 1 (dossier juriste, INV-B l.193) · porteur : MONARK (ruling, PLAN l.412-413) ; PAROXYSME ; le fondateur
    (option (a), juriste) · déclencheur : avant la publication seq 3 (CARTO l.342 ; PLAN §4.3 l.603) ; re-formation : partie 2 de PXC-01
    (F3) ; partie 2 de PXC-15 (F3, sous D-5) ; option (a) : partie 1 de PXC-18 (F3)
  état : ouvert · suite : options (a) à (c) de CARTO l.342 ; son premier déclencheur, « avant le G7 de BELL-OTS-ANCHOR-1 », est franchi
    (§1 ; §7, doute 10)
- **N-05** · « Les captures du site viennent d'outils non planifiés, 5 sur 7 sans `--check` ; la CA n'est pas planifiée. »
  source : CARTO l.343, l.163 · touche : fraîcheur des chiffres de `/bell` (`apps/site/data/bell-served.json`) · nature : C
  item : PXC-05 partie 1, PR 1 bis (`--check` de `sync-bell-served` et `sync-bell-anchors`) ; CA planifiée : partie 3 ; CARTO-BR-2 (CARTO
    l.343, à re-former, PXC-01 partie 2) · porteur : PAROXYSME · déclencheur : PR 1 bis en F3, après D-5 (PLAN §4.3 l.588-589 ; §4 (v)
    l.511-512) ; CA planifiée : partie 3 de PXC-05 (F3, sous D-5 ; PLAN l.589-590) ; re-formation : partie 2 de PXC-01 (F3)
  état : ouvert · suite : même construction que L-09
- **N-06** · « Manifeste de course TSLAx réécrit sans réhorodatage : la preuve couvre l'ancien contenu. »
  source : ETAT l.1235-1237 ; `docs/course-bell/mint_resume-TSLAx-manifest.txt` (blob `058a93ef` à la tête, contre `a2db06d5` ancré)
    · touche : registre de course servi sous `/bell/anchors` (CARTO l.161) · nature : D/C
  item : BELL-COURSE-TSLAX-DRIFT-1 (ETAT l.1235-1237) ; PXC-14 partie 1 · porteur : MONARK (exploitation de Bell, ETAT l.1236-1237) ;
    PAROXYSME (PXC-14) · déclencheur : ETAT n'en écrit pas ; celui de PXC-14 : avant la publication seq 3 (CC l.460), sous D-5
  état : ouvert · suite : options d'ETAT : restaurer le blob ancré (0 code) ou réhorodater
- **N-07** · « Le README dit « rebuild the digest », « replayable timelines » ; collecteur non exporté, le vérificateur ne refait pas le digest. »
  source : `scripts/export-public.mjs:97-105` ; `README.md:219-222` · touche : `README.md:135-137`, `:298-299` · nature : C
  item : PXC-02 partie 1, noyau (README l.135-137, l.298-299 : PLAN §5.1 l.659 ; BELL-README-REPLAY-1, à former) · porteur : PAROXYSME
    · déclencheur : tâche 2 du TABLEAU (noyau, F1) ; publication : release du miroir (acte du fondateur)
  état : ouvert · suite : la phrase redeviendra vraie avec l'export du collecteur (L-31) ; PLAN l.318 nomme PXC-14 (§7, doute 8)
- **N-08** · « La révision citée du collecteur est introuvable pour un tiers : miroir à historique neuf, collecteur non exporté. »
  source : METHOD l.604-605 ; `scripts/export-public.mjs:433` ; `test/bell-served.test.ts:153` · touche : METHOD l.604-605 · nature : C
  item : phrase : PXC-02 partie 3 ; empreinte publiée de l'arbre du collecteur : PXC-11 parties 2-3 (BELL-COLLECTOR-REV-PUBLIC-1, à former)
    · porteur : PAROXYSME ; release du miroir : le fondateur (PLAN §7.3 l.888) · déclencheur : phrase : partie 3 de PXC-02 (F3, sous D-5) ;
    empreinte : parties 2-3 de PXC-11 (F3, sous D-5)
  état : ouvert · suite : lié à L-31 ; révision servie relevée par l'inventaire, non relue ici (INV-B l.128 ; §7, doute 11)
- **N-09** · « L'ancre de course ne montre ni d'où viennent les pages, ni que le balayage a tourné. »
  source : METHOD l.502 · touche : METHOD l.502 · nature : T
  item : PXC-08 SHOGEN-SEAM-1, partie 3 (BELL-PAGE-ORIGIN-1, à former : transcription TLS des pages RPC) ; construction avec l'énumération
    vérifiable : PXC-14 partie 2 · porteur : PAROXYSME · déclencheur : partie 3 de PXC-08 (F5, après CM-4) ; partie 2 de PXC-14 (F4, sous D-5)
  état : ouvert · suite : ligne d'attente datée au versement ; TLS-N est libre (INV-B l.174)
- **N-10** · « Aucun contrat de wrapper ou de pont nommé : `no_wrapper` sur chaque course ; l'inflation d'offre n'est pas contrôlée. »
  source : `apps/bell/src/supply.ts:101-106` ; `docs/bell/FAITS-xstocks-por-api-2026-09-27.md:7` · touche : BM l.65 · nature : D
  item : PXC-14 partie 1 (BELL-WRAPPER-NAMED-1, à former : section « Bridges » de l'API, puis `WRAPPERS` nommés) · porteur : MONARK
    (lecture sur place, après le ToS) ; PAROXYSME · déclencheur : après le ToS xStocks (PLAN §4.1 A l.544) ; partie 1 de PXC-14, sous D-5
  état : ouvert · suite : aucune
- **N-11** · « Pas de registre `docs/PAROXYSME-Bell.md` au dépôt. »
  source : `git ls-tree 87b821b0 docs/` (seul `docs/PAROXYSME-Dojo.md`) · touche : aucune (règle §4 de l'investisseur) · nature : C
  item : versement intérimaire (a′) (PLAN §4.1 A l.540, §7.3 ; tâche 1 du TABLEAU) ; registre définitif : PXC-01 partie 2 (PLAN §6)
    · porteur : PAROXYSME (versement) ; MONARK (fusion et ligne d'ETAT) · déclencheur : la fusion de ce fichier par MONARK (F1)
  état : ouvert à la tête · suite : ce fichier le clôt à sa fusion ; la preuve (commit de fusion, ligne d'ETAT) est à écrire par MONARK
- **N-12** · « `bell-verify.mjs` lit un port refusé par `fetch` comme une panne de réseau. »
  source : ETAT l.445-446 · touche : METHOD l.449 (commande de vérification servie) · nature : C
  item : VERIFY-BADPORT-1 (ETAT l.445-446) ; PXC-05 partie 3 · porteur : MONARK (orchestrateur, ETAT l.289-292) ; PAROXYSME (PXC-05)
    · déclencheur : le prochain lot qui touche leur transport (ETAT l.446) ; partie 3 de PXC-05 (F3, sous D-5)
  état : ouvert · suite : la même garde vaut pour `apps/dojo/scripts/dojo-verify.mjs` (ETAT l.445)
- **N-13** · « Les retours arrière REPLACE copient la sauvegarde sur le fichier actif ; le déclencheur de l'item est passé. »
  source : ETAT l.223-224 ; RB l.195, l.236 ; `docs/deploy-CA-bell.json:79-81` (`caddy_import=true`) · touche : aucune · nature : C
  item : BELL-RUNBOOK-ROLLBACK-CANDIDATE-1 (ETAT l.223-224) ; PXC-05 partie 3 (ruling) · porteur : MONARK (orchestrateur, ETAT l.211-212)
    · déclencheur : celui d'ETAT (l.223, « avant le go de la migration de Bell »), passé ; ruling par PXC-05 partie 3 (F3)
  état : ouvert (déclencheur passé : migration faite, CA du 2026-10-03, `docs/deploy-CA-bell.json:5`) · suite : sans objet après IMPORT ?
    (RB l.306-309 ; INV-B doute D-6)
- **N-14** · « Le remplacement du fichier Caddy dédié après IMPORT n'a pas de procédure écrite. »
  source : RB l.306-309 ; ETAT l.225-226 · touche : aucune · nature : C
  item : BELL-CADDY-IMPORT-REPLAY-1 (ETAT l.225-226) ; PXC-05 partie 3 · porteur : MONARK (orchestrateur, ETAT l.211-212) ; PAROXYSME
    (PXC-05) · déclencheur : au G1 du prochain lot qui change `deploy/Caddyfile.monark-bell` (ETAT l.225) ; partie 3 de PXC-05 (F3, sous D-5)
  état : ouvert · suite : aucune

## 4. Limites closes (avec preuve)

- **L-38** · « `lstat` d'une jonction Windows non mesuré. » · clos (preuve : `docs/G1-lot-bell-ots-prb.md:168`, mesure win32 du G1 de
  PR-B1, 2026-09-25 (l.43) ; le résidu « preuve CI ubuntu à citer » (l.403) est clos au tronc : `docs/JOURNAL-PROVENANCE.md:412`, run CI
  ubuntu vert sur `0db47fe`, SYNC-LSTAT-PATH-1 B1, B2, B6) · suite : aucune

## 5. Limites marquées PAROXYSME apparues à ETAT depuis l'inventaire

Commande (à la tête, sans réseau) : `git diff -U0 57a131fc 87b821b0 -- docs/ETAT.md | grep '^+' | grep PAROXYSME` : dix lignes ajoutées,
huit limites, un bloc et une ligne de suite (ETAT l.1103). Aucune n'est une limite de Bell. Sept limites vont au registre du Harnais ; les
items du bloc des textes figés de R4 v2 vont aux registres du Harnais et de Narabi (§5 du registre du Harnais) ; DOJO-PROBE-UID-BOUNDARY-1
(ETAT l.1889-1898) porte sur deux unités de sonde, Narabi et Dōjō, qui partagent l'uid `probe` sur l'hôte de Bell : il va au registre
Narabi, comme l'écrit le registre du Harnais (§5), et touche ici l'hôte (N-01, §6). Aucune entrée `BLT-nn`. Les lignes neuves d'ETAT qui
nomment Bell sans marque PAROXYSME sont au §7, doute 7.

## 6. Renvois : limites d'autres registres qui touchent Bell ou son hôte

- Registre Dōjō (`docs/PAROXYSME-Dojo.md`) : DJ-L31 (l.614-618 : une compromission root de l'hôte expose les clés de Bell et du Dōjō ;
  DOJO-KEY-SEPARATION-1, déclencheur : la première rotation de l'une des deux clés, celle de Bell avant le 2026-12-22, voir L-32) ;
  DJ-L111 (l.346-349 : la sonde du Dōjō et les fichiers servis sur le même hôte ; DOJO-PROBE-VANTAGE-1 et DOJO-PROBE-MIRROR-1, ETAT
  l.1884-1888) ; DJ-L05 (l.77-81), DJ-L51 à DJ-L53 (l.112-123 ; rotation de clé, PXC-14) ; DJ-L73 (l.200-205 : OUTSIDE-REPO-SEGMENT-1,
  dont une partie est dans le code de Bell, §7, doute 5).
- Registre Narabi : DOJO-PROBE-UID-BOUNDARY-1 (ETAT l.1889-1898 : secret de courriel sous l'uid `probe` des deux sondes de l'hôte de
  Bell) ; la sonde Narabi tourne sur l'hôte de Bell (RB l.82), ce que porte N-01.
- Registre du Harnais : PX-Harness-27 (l.237-243 à `376225c` : le skill ne renvoie pas aux fichiers Bell que le README promet aux agents).

## 7. Doutes nommés (ce qui ne se reproduit pas tel quel à la tête)

1. **Compte : 57 ou 56.** Les deux sont justes et ne comptent pas la même chose. La table de l'inventaire (l.79-134) a 56 rangées et 57
   identifiants (41 `L-`, 2 `PX-Bell-`, 14 `N-`, aucun en double ; L-04 et L-05 partagent la rangée de la l.82, ce que l'inventaire dit
   l.215). Le bloc de couverture de CC (l.879-934) a 56 lignes Bell : les 57 moins L-38, close, que sa convention exclut (« lignes du bloc
   = limites ouvertes, changées ou nouvelles », CC l.1160). Dans « 41 + L-20 + 14 » (CC l.1161), 41 compte les anciennes ouvertes (39 `L-`
   et les deux `PX-Bell-`) ; le « 41 » du titre de l'inventaire (l.71) compte L-01 à L-41. L'écart est L-38 : ni L-20, compté une fois de
   chaque côté, ni un identifiant compté deux fois. Les 56 rangées et les 56 lignes du bloc ne sont pas les mêmes 56. Ce registre porte
   57 entrées : 56 ouvertes (§2, §3) et L-38 close (§4).
2. **Ancres qui ont bougé à la tête** (ordre de mission : « ligne qui a bougé à la tête » va en doute). Même texte, autre numéro, toutes
   dans ETAT (`57a131fc` → `87b821b0`) : l.192-193 → 223-224 (N-13) ; l.194-195 → 225-226 (N-14) ; l.414-415 → 445-446 (N-12) ;
   l.763-765 → 1235-1237 (N-06) ; l.1146 → 1618 et l.1359 → 1836 (N-01) ; l.192-195 → 223-226 (INV-B §1.1). Aucune sortie
   `CHANGED`. Hors d'ETAT, aucune ancre ne bouge. Commande : `node reanchor.mjs --repo <clone> --base <57a131fc | d8fe354c> --head
   87b821b0 <fichier>:<ligne>…`.
3. **Ancres de l'inventaire décalées ou coupées, fichier inchangé.** Q6-ANCHOR-1 est à OTSA l.305 (l'inventaire : l.304, séparateur du
   tableau) ; BELL-OTS-NODE-VERIFY-1 est à OTSA l.306 (l'inventaire : l.305), et « `ots verify` lui-même : non exécuté » à la l.328
   (l'inventaire : l.324-327, dont les l.324-326 portent d'autres réserves) ; le bloc `POR_SOURCES` est à `apps/bell/src/supply.ts:88-99`
   (l'inventaire : l.85-96, qui laisse dehors AAPLx et TSLAon, l.97-98). Les entrées L-08, L-10 et L-18 citent les lignes relues.
4. **Placement de PXC-14.** PLAN §4.4 (l.612-613) écrit « PXC-14 parties 2 » avec la rotation des clés (avant le 2026-12-22) et
   ADV-CAL-2027 (avant le 2027-01-01) ; la fiche (CC l.472-474) met la rotation en partie 3, que le plan place après le 2026-12-31
   (l.618), et le calendrier 2027 en partie 1 (CC l.472 : lectures sur place et faits servis), que le plan ne place pas. Ici : les
   échéances datées sont les déclencheurs ; L-39 suit la fiche (partie 1) ; partie 2 en F4, partie 3 en F5 ; partie 1 « sous D-5 », F4 au
   plus tôt sans décision contraire du fondateur (PLAN l.511-512 ; L-26, L-27), ses lectures sur place au bloc A (PLAN l.544). À trancher
   par l'ADR de PXC-14 ou par MONARK.
5. **Limites et items de Bell hors de l'inventaire.** (a) OUTSIDE-REPO-SEGMENT-1, partie Bell : la garde CA-11 de
   `apps/bell/src/collect.ts:535-541` prend `<racine>/..x` pour l'extérieur (`docs/adr/ADR-DOJO-PR-2B.md:739` ; registre Dōjō, DJ-L73) ;
   déclencheur écrit à l'ADR : le prochain lot Bell, au plus tard avant le prochain acte réseau. (b) Cinq items formés aux tables d'items
   des ADR de Bell, absents de l'inventaire, de CC, du PLAN et des registres (`grep -c` nul). Dans B0 : CASH-BUDGET-1 (l.302 : la jambe
   cash consigne un refus de budget comme une faute au lieu d'arrêter la course ; orchestrateur ; déclencheur « 1b-iii ») et l'item de la
   l.304 (lecture sur place de l'hôte d'API des jambes ADV et cross ; son identifiant nomme un fournisseur de données, non recopié, Terms :
   `apps/site/data/bell-legal.json:56` ; déclencheur : G0 de la prochaine course cash payante). Dans OTSA : SEC-L56-ANCHOR-1 (l.309),
   ANCHOR-TOOL-COMMIT-1 (l.310) et COURSE-ANCHORS-TEMPLATE-ROWS-1 (l.311 : deux lignes gabarit encore à `docs/course-bell/ANCHORS.md:40-41`,
   registre de course servi sous `/bell/anchors`). Leurs voisines des mêmes tables sont portées par L-22 à L-25 et L-39 (B0 l.296-301,
   l.303), L-08, L-10 et L-09 (OTSA l.305-307). Balayage limité à B0 l.294-304 et OTSA l.303-313 ; déclencheurs écrits aux ADR, non jugés
   ici. L'inventaire ne porte ni (a) ni (b) ; ce registre n'ajoute aucune entrée hors des identifiants de l'inventaire et du §5 : MONARK
   dit si elles entrent (entrées `BLT-nn` ou recartographie de PXC-01 partie 2).
6. **Sources hors du tronc.** Les lignes de 0005, 0006, de PX-IDENT, de RECEPTION et de FAITS-PXP-01 sont celles que l'inventaire a
   lues ; elles ne sont pas relues ici. INV-B, CC, PLAN, la FICHE et le registre du 27/09 sont lus dans la boîte PAROXYSME, en lecture
   seule, à leur empreinte (§8) ; la FICHE sert à séparer L-04 et L-05 (l.45-46). Le PLAN et le registre du 27/09 de la boîte sont des
   copies caviardées avant leur versement (`dossier/README.md` l.119-136 ; `dossier/REDACTIONS.json`) : le registre du 27/09 a pour
   empreinte source `ece296b0…`, celle que cite l'inventaire (INV-B l.18) et que couvre le sceau du 27/09, et pour empreinte versée
   `a5e6f194…` (§8) ; le PLAN, `f6bb5fea…` et `96b5b018…` (§8). INV-B, CC et la FICHE ne figurent pas dans `REDACTIONS.json`. La clôture
   de PXP-01 par substitution (décision 277) n'est consignée que hors du dépôt (INV-B l.208, doute D-12). Le message de MONARK `7041de4`
   (boîte, `coordination/messages/2026-10-07-MONARK-vers-PAROXYSME-point-bell-cotenance.md`, 29 lignes, §8) porte le déploiement de la
   sonde du Dōjō et la décision sur BELL-HOST-COTENANCY-1 (N-01, §1), que le tronc ne porte pas encore ; il est lu à son commit, et aucun
   chemin d'hôte n'en est recopié.
7. **Faits neufs qui touchent l'hôte.** La sonde du Dōjō (`deploy/monark-dojo-probe.service` et `.timer`, neufs depuis `d8fe354c`) n'est
   pas déployée à la tête (ETAT l.1858-1866) ; elle l'est depuis le 2026-10-07, entre 17:4x et 17:5x UTC, sous l'autorisation Q-20
   (message de MONARK `7041de4`, l.6-9 ; ligne d'ETAT pas encore au tronc), ce qui a passé le déclencheur de N-01 : dette au §1.
   DOJO-PROBE-UID-BOUNDARY-1 (ETAT l.1889-1898) est porté par le registre Narabi (entrée NRT-02, `docs/PAROXYSME-Narabi.md`, commit
   `ea0d2de` de la branche). TEST-GIT-ENV-ISOLATION-1 (ETAT l.1119) est tenu à `docs/adr/ADR-BELL-OTS-PRB.md:263` mais porte sur des
   tests de spécification : pas une limite de Bell.
8. **Deux rattachements du plan.** PLAN l.318-319 rattache les phrases README de N-07 et N-02 à PXC-14 ; CC §4 (l.922, l.927) et PLAN §5.1
   (l.659-660) les mettent au noyau de PXC-02. Ce registre suit CC §4, comme le veut l'ordre de mission. Pour N-02, `fleet.ts:354` (le
   champ `connects`) n'est ni dans la liste (a) du noyau (PLAN l.644-665) ni dans la liste (b) (l.668-672), alors que la fiche range
   `fleet.ts` en partie 1 (CC l.144) et que la PR du noyau touche `fleet.ts` (PLAN l.506, l.555) : elle atteindra le déclencheur de
   l'inventaire (INV-B l.170) sans le porter, sauf si l'ADR de PXC-02 l'y met. À trancher par cet ADR ou par MONARK.
9. **Parties non nommées par les fiches.** L-11, L-37, L-41 (PXC-14), L-30, L-31 (PXC-11), L-34, L-35, L-40 (PXC-17) : la fiche nomme la
   limite sans partie ; elles sont placées ici par la nature de la partie, et l'ADR du chantier fixe la partie. Placées aussi dans une partie
   dont la fiche ne les nomme pas : L-01, L-03, N-09 en partie 2 de PXC-14 (CC l.472-474 n'y nomme que quorum, scanners,
   `getProgramAccounts` et ADV-*) ; L-14, L-19, L-21 en partie 3 de PXC-17 (CC l.565-566 n'y nomme que des classes métier) ; N-13, N-14
   et la CA planifiée de L-09 et N-05 en partie 3 de PXC-05 (CC l.222-223 met « CA et captures » en partie 2) ; la phrase de PX-Bell-17 en
   partie 3 de PXC-02, alors que FLEET l.350 relève du site, donc de la partie 1 (CC l.144).
10. **Items hors d'ETAT.** À la tête, ETAT ne porte que quatre items de Bell (l.223-224, l.225-226, l.445-446, l.1235-1237). Les 43 autres
    noms cherchés ont un `grep -c` nul (`git show 87b821b0:docs/ETAT.md | grep -c -- "$id"`, rejoué au pli) : R-SP-1, ESC-2, Q6-ANCHOR-1,
    BELL-VERIFY-SCHEDULE-1, CARTO-BR-2, CARTO-BR-1, BELL-OTS-NODE-VERIFY-1, C-F-4, authority_scan_mono_operator, set_authority_unscanned,
    ROADMAP-BELL, J-0, BELL-POR-XSTOCKS-API-1, I-G2-5, ADV-SIP-DAY-1, ADV-SPLIT-1, ADV-SESSION-CUT-1, LIC-DBN-1, P-DBN-1, P-POL-1,
    ESC-1-REWRITE, MESURE-INTERSECTION-1, BELL-KEY-ROTATION-CAL-1, JURISTE-ACTE-NOV-1, PR-GTM-10, C-1b-1, C-1b-2, TSLAON-MULT-1,
    ADV-CAL-2027, SUPPLY-READ-1, BELL-GAP-ANCHOR-1, BELL-HOST-COTENANCY-1, BELL-CONNECTS-WITNESS-1, BELL-COLLECT-TIMER-1,
    BELL-CADENCE-TEXT-1, BELL-README-REPLAY-1, BELL-COLLECTOR-REV-PUBLIC-1, BELL-PAGE-ORIGIN-1, BELL-WRAPPER-NAMED-1,
    PAROXYSME-BELL-FILE-1, BELL-D2BIS-STATUS-1, BELL-ITEMS-ETAT-CARRY-1, PX-Bell. Chaque entrée les porte par son chantier. Leur report à
    ETAT est l'item BELL-ITEMS-ETAT-CARRY-1 (INV-B l.178, à former ; PXC-01, CC l.94-95 ; ligne d'ETAT : MONARK), et non PX-STD-ORPHAN-1,
    dont la liste ne porte aucun item de Bell (PLAN l.541, l.897) ; le compte exact est à PXC-01 partie 2 (PLAN §6, l.834). Écarts de
    l'inventaire à la tête : L-38 avait déjà sa preuve CI ubuntu (§4) ; le déclencheur de N-13 était déjà passé, ce que l'inventaire dit
    (doute D-6). Déclencheurs écrits dans la documentation et déjà franchis, que l'inventaire ne dit pas (§1) :
    - C-1b-1 et C-1b-2 (L-37) : « prochaine modification de `apps/bell/test/rebase-crosscheck.test.ts` »
      (`docs/G2-lot-bell-shortpage-1-1b.md:54`, rapport `f1b9f5d0` du 2026-09-23), atteinte par `b9186e47` (2026-09-27 20:29:02 UTC,
      `TZ=UTC git log`) sans l'un ni l'autre : à la tête, les coutures `renameAttemptSync` comptent les tentatives sans coupe-circuit
      (l.1798-1801, l.1833-1836) et l'ENOENT qui suit un EPERM (X05) n'est pas épinglé ;
    - CARTO-BR-1 (N-04) : « avant le G7 de BELL-OTS-ANCHOR-1 » (CARTO l.342), franchi aux G7 de PR-A (2026-09-24 18:52 UTC,
      JOURNAL-PROVENANCE l.398) et de PR-B (2026-09-25 06:31 UTC, l.412) ; reste « au plus tard avant la publication seq 3 » ;
    - I-G2-5 (L-22) : « avant `/bell/method` » (B0 l.296), franchi : la page sert « consolidated daily share volumes » (METHOD l.563).
    Le PLAN (l.129-132) consigne une lecture : appliquée comme classe, la clause de cartographie donnerait à CARTO-BR-1 la force « avant
    toute nouvelle pièce » ; sous cette lecture, le « 0 ⚑B » du §8 serait à relire pour N-04. MONARK tranche cette lecture.
11. **Valeurs servies non relues.** `apps/site/data/bell-served.json` (comptes `quorum_sampled`, `halt_census`, `providers_distinct`,
    révision du collecteur) porte des séries servies (D6) : il n'est pas lu ici, et aucune de ses valeurs n'est citée. Les entrées renvoient
    aux lignes de l'inventaire qui les relèvent (INV-B l.89-90, l.119, l.128). Le fichier est inchangé depuis `d8fe354c` (`git diff --quiet
    d8fe354c 87b821b0 -- apps/site/data/bell-served.json`, sortie 0).
12. **Contrôle mécanique.** `verify-registres.mjs` (pièce de la boîte, commit `d97d838` : entrées prises entières, doutes épinglés) lit
    les registres commités : il sort 0 sur la branche avec ce registre plié (six registres ; Bell : 57 identifiants, 57 entrées, 56
    ouvertes, 1 close).
13. **VERIFY-BADPORT-1 et D-5.** Le déclencheur d'ETAT de N-12, « le prochain lot qui touche leur transport » (ETAT l.446), n'est pas
    atteint (derniers commits de `bell-verify.mjs` le 2026-09-23 et de `dojo-verify.mjs` le 2026-10-01). Il peut venir d'un lot du Dōjō
    sur `apps/dojo/scripts/dojo-verify.mjs` avant le 2026-11-16 : PXC-06 partie 1 (« éditeur, vérificateur ») est au bloc A (PLAN l.547).
    La construction est « la même garde nommée » pour les deux scripts (ETAT l.445-446) : sa moitié Bell toucherait
    `apps/bell/scripts/bell-verify.mjs`, sous D-5 et sous la règle de la boîte (`CLAUDE.md` l.138 : « personne n'y touche en attendant le
    fondateur »). MONARK tranche : garde du Dōjō seule, ou décision D-5 du fondateur pour la moitié Bell.

## 8. Ligne PAROXYSME et sources

**Ligne PAROXYSME (2026-10-07).** Bell : 56 limites ouvertes (dont L-20 changée ; 0 ⚑B, sous la lecture du PLAN l.129-132 à trancher,
§7, doute 10) et 1 close (L-38). Limites neuves à ETAT : 0 (§5). Une dette de déclencheur : N-01 (§1), reconnue par MONARK (message
`7041de4`), comptée jusqu'à sa ligne d'ETAT. Toutes les autres entrées ouvertes ont leur item, leur porteur et un déclencheur
atteignable ; le re-port de quatre déclencheurs passés (L-37, N-13, N-04, L-22) est à confirmer par MONARK (§1). Hors de l'inventaire
(§7, doute 5) : une limite de Bell, dont l'item est au registre Dōjō (DJ-L73), et cinq items formés aux ADR de Bell, absents de
l'inventaire et des registres ; leur entrée attend la décision de MONARK.

| Source | Lignes | sha256 |
|---|---|---|
| `docs/ETAT.md` à `87b821b0` | 1 904 | `3190de5c23507292414418cbb8b24e0f7c9f319dca64a0f5ae8c5009475a5b5a` |
| `apps/site/app/bell/method/page.tsx` à `87b821b0` | 613 | `25a6d66e7a3b48fbec44ac2307833630a65d5c3ba4281e066574493ae1a13722` |
| `apps/site/app/bell/page.tsx` à `87b821b0` | 752 | `d1c5a69fa465b4b681290baeee38fb7e5c337690cf17b89aaff1c96857f2cf6a` |
| `apps/site/app/bell/terms/page.tsx` à `87b821b0` | 234 | `0449a44604755d63c131852a434b8e6b45bcc642c4c2fe8460c99c3f03262cfc` |
| `apps/site/lib/bell-method.ts` à `87b821b0` | 116 | `a1540dc08d57b7faf8374b80f2cf816ba9896257ca8d68c75f6b044902d876e4` |
| `apps/site/lib/fleet.ts` à `87b821b0` | 429 | `998fdf33a3c461f687ec604524c63ee739ef1b7dd77acba571523aa979f232f4` |
| `apps/site/app/applications/built-application-card.tsx` à `87b821b0` | 92 | `067be94701a52e2f90228e66e14336d7a8b9a2ab344c83efc273241cfc691604` |
| `apps/site/app/roadmap/page.tsx` à `87b821b0` | 363 | `944051d647580d5fdb56bcbb8f2198da32a18776c981634e644f8ac2c018c651` |
| `apps/site/data/bell-legal.json` à `87b821b0` | 61 | `0e4a6719c6e73ac1735c5c2412609c9adcd350f3ee5f3d1096186b73544f718b` |
| `README.md` à `87b821b0` | 353 | `6324c8b220ccb5378d5458ca883190b7241b0d3cdbc1e42d9f1697051e58b5ad` |
| `apps/bell/src/collect.ts` à `87b821b0` | 883 | `4eb8271394a5eb6a7281b79690afbc2e050ab3ab701e0166c2f0dd76182ab829` |
| `apps/bell/src/supply.ts` à `87b821b0` | 196 | `b7352581ce1ee8b8a0def09d05ae722e1cf32503724d0790ca4e15fd4ba526bb` |
| `apps/bell/src/discover.ts` à `87b821b0` | 255 | `c033ea4d0717cafe5b8256a3dfc8bc7f5063d18f8b9533f3cf1744d73c4cdca3` |
| `apps/bell/src/volume.ts` à `87b821b0` | 140 | `46fa184d36128fab9f773c9ae459f0d918500c212e0fef87b6d5085022a10ccc` |
| `apps/bell/src/close.ts` à `87b821b0` | 217 | `4696c74300e4a463c1b34327e8319d7ae73f5eed0787d530d40d2370f3b1a64f` |
| `apps/bell/src/sessions.ts` à `87b821b0` | 147 | `6aaec1e69ff0b88c1b4f87c39639942a2356b175fc83e3f7eb93f0f716df0ba3` |
| `apps/bell/package.json` à `87b821b0` | 10 | `9a665dbe2120233d46a33b1a1ad17d8c62981d106ab51c614e84484061112a1c` |
| `apps/bell/test/rebase-crosscheck.test.ts` à `87b821b0` | 1 855 | `ad53d9a9f755380887a36ae4df7beb4eeb747aed409d44d493afc5b81d323a53` |
| `scripts/export-public.mjs` à `87b821b0` | 644 | `b5d21a080703c257975ba31d0bddedf2e13e9ad5a9d65a8b5b6ad55e8f4b1502` |
| `test/bell-served.test.ts` à `87b821b0` | 554 | `85c755a4de227b136a1a25ecd52dc2af7411307491c8c7265cf740e5015eaa97` |
| `docs/adr/ADR-B0-programme-bell.md` à `87b821b0` | 315 | `f42f8b3f91db7e42fd3ad938818632299bbd39a4eaaeb441be83ff37270ea885` |
| `docs/adr/ADR-B0-amendement-D2bis-DRAFT.md` à `87b821b0` | 180 | `d764d007b24d9ce84436cd59de8eabd92834e0ca2c878bc3a0916cd871bbcaad` |
| `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` à `87b821b0` | 623 | `20f657674a3b82e272e2abfde305ce58af9229194d46b2cb1b5abc7750669c4c` |
| `docs/adr/ADR-T1b-backend.md` à `87b821b0` | 606 | `c2d6057fc3b8bd0578361d504b9e3d73c3668fbbcf3833940c0e6d70c1c1c859` |
| `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` à `87b821b0` | 390 | `1f94a5e1483ba19b424b0d8afbddc98c70c55b349cf2dbde0829d3b04ecd3246` |
| `docs/adr/ADR-BELL-CASH-LEG-1.md` à `87b821b0` | 63 | `b2ba609defe3e39cde8ffb03650f9ed169632a988b1d5f8e08dab7b62f9cffe1` |
| `docs/adr/ADR-PUBLIC-CADENCE-1.md` à `87b821b0` | 427 | `32d4f3a1513e7fc579f6870591baa4389be5716a05c1fbe7187bb3e1df556134` |
| `docs/adr/ADR-BELL-OTS-PRB.md` à `87b821b0` | 493 | `1e97c3acd3d819a845df83a16d00e916625548312f0dff61fdd0b3beefdaa464` |
| `docs/adr/ADR-DOJO-PR-2B.md` à `87b821b0` | 1 065 | `81a5d642c676cde55a3190086dcbe0a43290251f5f4a2da79e22a9f4e98fa877` |
| `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` à `87b821b0` | 331 | `64aa3e11a87ac59ce633d5191952824d06010970c34b73c749e1c1caa2430c7b` |
| `docs/RUNBOOK-bell.md` à `87b821b0` | 585 | `334fb08599e53a00c7fbfc261822df238a08ed9964b2102b62924d8130f89059` |
| `docs/RUNBOOK-dojo.md` à `87b821b0` | 1 594 | `fe1cafa3a6e862d186a5bfdaf9c5969cfe63f35775d98d689c6ca98d6c5eb80b` |
| `docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md` à `87b821b0` | 459 | `f44e0a91c75973e2d1b62874fd988824bf99b7229141ef8f76fc704216f24874` |
| `docs/bell/FAITS-xstocks-por-api-2026-09-27.md` à `87b821b0` | 13 | `457d4ea080527b22aea980ecf3644eebe6e27bb5711f06fb2970190e3a6ec451` |
| `docs/bell-publications/ANCHORS.md` à `87b821b0` | 15 | `788fae95848bb896c1ad93edf0a225874bd5c5c4f874ca991e31ebc57d9d265b` |
| `docs/course-bell/ANCHORS.md` à `87b821b0` | 75 | `ddccd7f5837d8e60046fc466187ceb91dfaff5fe62fb7ba002f456964edc258c` |
| `docs/G1-lot-bell-ots-prb.md` à `87b821b0` | 421 | `2f801c19bf46aec807946359c4944c0fe773d8f7376aa40c743bce7b669f6a59` |
| `docs/G2-lot-bell-shortpage-1-1b.md` à `87b821b0` | 100 | `5d1643750b8fb81f123e32c92815199d0afcbd3faaf9de0746245c8ce3605fa7` |
| `docs/JOURNAL-PROVENANCE.md` à `87b821b0` | 466 | `7dfa3f0c8a5da8b0c5ad2807f10b377d03fc1fda895349490c8f834415f16e9f` |
| `docs/GTM-BELL.md` à `87b821b0` | 163 | `479c62de25b4ead84d6d93fdc4a7c6b400e263069099500c0bab6cc12bcd3b41` |
| `docs/ROADMAP-BELL.md` à `87b821b0` | 30 | `cdc76276dc9adfe260443271727201baf6d739f3ef7cf1fd37613069e9a3590d` |
| `docs/deploy-CA-bell.json` à `87b821b0` | 95 | `00717cab2f2a68886f934df123f2d5f394c181bc4ea446e3a5004da7b59aff0f` |
| `docs/PAROXYSME-Dojo.md` à `87b821b0` | 853 | `56c3762e7ae9acd4fc3f8e0850a3750b343c4cb6f5968408f79d94503779674a` |
| `deploy/monark-dojo-collect.service` à `87b821b0` | 55 | `e084f0f99c5cd1a0c96a03d76118fb69da68e1c622d67a614c3a6e6b609bb661` |
| `deploy/monark-dojo-publish.service` à `87b821b0` | 58 | `d7f679d0b914fb86ff80874e49aa4680349505b04f157cf5760db01c0922aee6` |
| `deploy/monark-dojo-probe.service` à `87b821b0` | 42 | `2820b8762b0724b1338ee58cdf082ee7e72edeec767af30cbcb8a436957b36bc` |
| `deploy/monark-probe.service` à `87b821b0` | 44 | `985f8381de31f7cb071305c4eb01ae7df258d506ca3b2e124e7c23d3ef5f9ce8` |
| `docs/PAROXYSME-Harnais.md` à `376225c` (branche des registres) | 702 | `5c476acc9cf41bd38c74c7d72ec5978af639007d41e9f02891224f80dbf160d6` |
| INV-B, boîte PAROXYSME, `dossier/etude-2026-10-06/inventaire/INVENTAIRE-Bell.md` | 215 | `224812fd39f111cc33333f036cb8c4e69e801c2fc87067819bde91dd6acc02d8` |
| CC, boîte PAROXYSME, `dossier/etude-2026-10-06/CHANTIERS-CANDIDATS.md` | 1 260 | `86ed73a23b0bfd8e2da5ea40de3818ae8a105a7d406c6bc0607fb8914c5dcc60` |
| PLAN, même dossier, `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` | 1 195 | `96b5b01858886906930f8be6e76094294dd71a9878a34b9b71804a160a645714` |
| FICHE, boîte PAROXYSME, `dossier/etude-2026-09-27/PAROXYSME-Bell.md` | 240 | `523a61561cfc6b43288ce1a4cb33e9cf43a0650005ee0b717fdf8704dbb57462` |
| Registre du 27/09, même dossier, `PAROXYSME-REGISTRE-2026-09-27.md` | 207 | `a5e6f1944d3ccaf47cfd352f8c1c7972d81c9e597568e44534535f37a60a33d3` |
| Message de MONARK du 2026-10-07, boîte, commit `7041de4` (chemin au §7, doute 6) | 29 | `9a014f5d777653bae3da717d1357a22c52ea0414eaf196a6713af607b1e9652d` |
| `dossier/README.md` de la boîte PAROXYSME, commit `45276f0` | 139 | `26ff658c30bbfa1caa1f4119303c393e26165d2a1ebb59880d2fb50a69791340` |
| `dossier/REDACTIONS.json` de la boîte PAROXYSME, commit `45276f0` | 81 | `787173d1eee46adda38246bad5376d333d2fba5f2ae78b97716c14b883364b90` |
| `reanchor.mjs` à `a55a62d`, boîte, `coordination/pieces/2026-10-07-registres/` | 69 | `2edae6398e35a39d750cca2951cf4349380971066acb23bd1dbe965d9f88ca4b` |
| `verify-registres.mjs` à `d97d838`, même dossier | 127 | `6d71141222d2c32b995cd30e11335501e7021f4b2c7a38fb25053a61efe8712b` |
| `CLAUDE.md` de la boîte PAROXYSME (règles de la session), commit `8b2e378` | 252 | `e262cad6b39954e8c359d78c0431161bc81729c76d9dd3a7afc0ea25904aa260` |
