# PAROXYSME-Ukemi : registre intérimaire des limites d'Ukemi (classe `liquidation-eligible-coverage`, outil `cascade`, AttestedBook)

- **Objet** : versement intérimaire (a′) du plan de route PAROXYSME v3 (§4.1 A, §6 « Transition ») : la pièce `built` Ukemi
  (`apps/site/lib/fleet.ts:175`) reçoit son registre. Il garde aussi, en entrées complètes, les limites de `calibrate` et des textes liq
  servis, exécutés dans `apps/harness`, que le §6 de `docs/PAROXYSME-Harnais.md` lui renvoie.
- **Règle** (règles « Dettes » et « PAROXYSME » de l'investisseur ; décision 251 rappelée par `docs/PAROXYSME-Dojo.md`) : une limite
  déclarée n'est jamais une fin ; elle mène à un item, à une campagne, puis à une décision. Ici, chaque entrée ouverte porte un item, un
  porteur et un déclencheur ; ce qui ne se reproduit pas tel quel à la tête va à un doute nommé (§7).
- **Provenance** : écrit par un worker de PAROXYSME (`claude-opus-5-5`, effort max, contexte de sa mission) le 2026-10-07 à partir de
  17:28 UTC (`date -u`), tâche 1 du tableau MONARK ↔ PAROXYSME. Sources : l'inventaire validé d'Ukemi (dossier d'étude du 2026-10-06), la
  couverture de `CHANTIERS-CANDIDATS.md` §4 et les fenêtres du plan v3 §4 (chemins et empreintes au §8). Relecture : une G2 par une instance
  neuve, pliée le 2026-10-07 de 18:49 à 19:17 UTC (`date -u`) par un worker de PAROXYSME (`claude-opus-5-5`, effort max), commit
  `dda217c4` (19:20 UTC par `TZ=UTC git log` ; `PLI-Ukemi.md` l.5, §8) ; contrôle par diff, fusion et ligne d'ETAT : MONARK. Décisions
  de MONARK pliées le 2026-10-07 (PR
  `paroxysme/registres-decisions-1007`) par un worker de PAROXYSME (`claude-opus-5-5`, effort max, contexte de sa mission), à partir de
  19:56 UTC (`date -u`) : ETAT à `5437cd0d` et message `d6331f6` de MONARK (MSG), empreintes au §8 ; relecture : PAROXYSME ; contrôle par
  diff et fusion : MONARK. Constats 7 et 10 de la G2 de ce pli (instance neuve) pliés au §7 (doutes 7 et 9), au §1, au §3 (N10) et au §8,
  le 2026-10-07 de 21:18 à 22:5x UTC, puis le 2026-10-08 à partir de 00:07 UTC (`date -u`), par trois workers de PAROXYSME (`claude-opus-5-5`, effort max,
  contexte de leur mission), les deux derniers après un vérificateur adverse chacun ; relecture : PAROXYSME ; contrôle par diff et fusion : MONARK.
  Second tour : constats d'une relecture par lentilles reproduits à `beea9834` et pliés le 2026-10-08 à partir de 01:26 UTC (`date -u`) par un
  worker de PAROXYSME (`claude-opus-5-5`, effort max) : §3 (N8, N10), §7 (doutes 7, 11 et 13), §8 (ligne PAROXYSME, sources) ; constats d'un vérificateur
  adverse de ce second tour réparés à partir de 03:06 UTC (`date -u`) par un worker de PAROXYSME (`claude-opus-5-5`, effort max) : §7 (doutes 7 et 13) ;
  ceux d'un autre, neuf, réparés à partir de 04:39 UTC (`date -u`) par un worker de PAROXYSME (`claude-opus-5-5`, effort max) : §0, §2 (L11), §7 (doute 7) ;
  passe de pli de la G2 du versement nommée le 2026-10-08 à partir de 05:44 UTC (`date -u`) par la session PAROXYSME, sur un constat de la
  vérification finale de ce tour (registre Hikae) : en-tête, §8.
- **Bases** : inventaire mesuré à `d8fe354c`, ses fichiers d'Ukemi identiques à `57a131fc` (INV-U l.9-13, l.30) ; ETAT lu à `57a131fc`, et à
  `d8fe354c` pour ses l.1179-1180 et l.1350. Toutes les ancres de ce registre sont à la tête `87b821b0` de `lot/etude-suite`, reportées par
  l'outil `reanchor.mjs` (pièce de la boîte PAROXYSME) dans sa version du commit `a55a62d`, qui refuse une ligne hors du fichier (la version
  `d2332e2` ne le vérifiait pas) : rejoué par la G2 sur les 121 références de l'inventaire, sans `CHANGED`, `MISSING` ni `OUT-OF-RANGE`, et
  au pli sur les ancres de ce registre (§7, doute 13). Aucun fichier d'Ukemi cité ne change jusqu'à la tête, sauf
  `apps/sentinel/test/ukemi-conc.test.ts` (#240, sans ancre ; doute 2) ; trois plages d'ETAT gardent leur texte sous un autre numéro (§7,
  doute 2). Font exception les lignes des décisions pliées le 2026-10-07, citées « ETAT l.N à `5437cd0d` » ou « MSG l.N » (§8).
- **Préséance** : `docs/ETAT.md` l.7-11 ; ETAT prime. Un item nommé hors d'ETAT et du code n'est pas compté comme formé : il est écrit
  « à former » (ou « à re-former » s'il vivait dans un registre effacé le 2026-10-01) et porté par son chantier.
- **Statut public** : aucun label ne change (`built` d'Ukemi, `apps/site/lib/fleet.ts:175` ; AttestedBook `upcoming until served`, `README.md:94`,
  `:256`) ; `apps/site/lib/fleet.ts` n'est pas touché par ce versement. Le `built` tient par deux tests d'intégration
  (`apps/harness/test/gate-liq-artifact.test.ts:90`, `test/h5-e2e-probe.test.ts:115`) et par la CA (`test/fleet-ukemi-liq-leg.test.ts:22`).

## 0. Comment lire ce registre

- **Une entrée par limite**, ouverte par le préfixe `- **`, sur quatre lignes au plus (forme de `docs/PAROXYSME-Dojo.md` §0), chacune
  prolongée au besoin par une ligne en retrait.
- **Étiquettes** : celles de l'inventaire d'Ukemi, inchangées : `L1` à `L39` (limites relevées le 2026-09-27) et `N1` à `N13` (limites
  nouvelles au 2026-10-06) ; `UKT-nn` numéroterait une limite trouvée à la tête (§5 : aucune). Ce sont des numéros de ligne de registre,
  jamais des items, et aucune n'apparaît dans un champ « item ».
- **Champs** : limite (25 mots au plus) ; source (fichier et ligne à `87b821b0`) ; touche (texte public que la limite qualifie) ; nature ;
  item ; porteur ; déclencheur ; état ; suite.
- **Codes de nature** (ceux de l'inventaire) : T théorie · M mesure · D donnée · P dépendance · Dr droit ou marché · C capacité.
- **Item, porteur, déclencheur** (règles acceptées par MONARK, message `07d99e2` de la boîte, qui répond à `d4b3d07`) :
  - un item formé à ETAT est cité avec sa ligne à la tête, et garde le porteur et le déclencheur qu'ETAT lui écrit ;
  - une limite que `CHANTIERS-CANDIDATS.md` §4 rattache à un chantier prend ce chantier pour item de porteur (`PXC-nn`, sa partie, et
    l'item que la partie forme) ; porteur : PAROXYSME, qui porte les chantiers (TABLEAU de la boîte, décision de MONARK du 2026-10-07),
    MONARK gardant l'ordre et l'attribution ; déclencheur : la partie et sa fenêtre au plan v3 §4 ;
  - les deux sont écrits quand les deux existent ; un acte hors délégation (argent, clés et comptes, DNS, certificat) a pour porteur le
    fondateur, par MONARK ; une lecture sur place ou un acte d'hôte a pour porteur MONARK.
- **Items de l'étude du 2026-09-27** : `PX-Ukemi-1` à `-17` (REG-27 §2) et `PX-Ukemi-18` à `-23` (proposés par INV-U §6) ne sont pas à ETAT
  (`grep -c` nul à la tête) : ils sont écrits « à former » et nomment la construction que porte la partie du chantier, sauf `PX-Ukemi-23`,
  absorbé par NARABI-ROW-SUPERSEDE-1 (item de N13 ; §7, doute 7).
- **Fenêtres du plan v3 §4** : F1 = §4.1, semaine du 2026-10-07 ; F2 = §4.2, du 2026-10-14 au service de la vague 1 (vers le
  2026-10-20) ; F3 = §4.3, du 2026-10-21 au 2026-11-16 ; F4 = §4.4, du 2026-11-17 au 2026-12-31 ; F5 = après le 2026-12-31, avec ligne
  d'attente datée au versement (plan §4.4, dernier alinéa) : la date de ce registre, 2026-10-07.
- **États** : `ouvert` ; `changé` (l'inventaire la dit changée depuis le 2026-09-27, ou la tête diffère de l'inventaire : dit entre
  parenthèses ou en suite) ; `clos (preuve : …)`, ou clos comme obsolète ici, avec sa preuve.
- **Abréviations** : ETAT = `docs/ETAT.md` ; ADR-CM = `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` ; GATE = `apps/harness/src/tools/gate.ts` ;
  COPY = `apps/site/lib/ukemi-copy.ts` ; PKG = `packages/ukemi/README.md` ; TABLE = `spec/contract-1.1.0/policy/liquidation-eligible-coverage.json`
  (une ligne) ; CC = `CHANTIERS-CANDIDATS.md` ; PLAN = `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` ; INV-U = `INVENTAIRE-Ukemi.md` (lignes du
  fichier) ; REG-27 = `PAROXYSME-Ukemi.md` du 2026-09-27 (dossier d'étude) ; C et 0004 = sources du dépôt de RECHERCHES
  (`kata/spec/CONTRACT-1.1.0.md`, `decisions/0004-ADR-draft-commit-error-binomial-bound.md`), citées par la ligne que l'inventaire a lue,
  non relues ici (§7, doute 1).

## 1. Dettes : limites sans item, sans porteur ou sans déclencheur

- **Aucune dette.** Les trois dettes constatées par la G2 (volet U-6 de L38, N8, N1), demandées dans la demande de fusion du versement,
  sont tranchées par MONARK le 2026-10-07 et sortent d'ici ; ce qui est tranché, et où : §7, doute 16.
- Toutes les entrées ouvertes des §2 et §3 portent un item, un porteur et un déclencheur atteignable. De ces trois champs, l'oracle
  (§7, doute 13) ne contrôle que la présence (non vides, jamais « aucun ») ; l'atteignabilité est jugée à la lecture de chaque entrée,
  relue le 2026-10-07 à partir de 21:18 UTC, au pli des constats 7 et 10 de la G2 de ce pli (49 déclencheurs relus).
- Deux questions sont posées à MONARK avec la demande de fusion de ce pli (§7, doutes 7 et 9 ; porteur : MONARK ; échéance : la
  recartographie de PXC-01 partie 2, F3). Ce ne sont pas des dettes : chaque entrée qu'elles touchent garde son item, son porteur et
  son déclencheur.

## 2. Ukemi : limites relevées le 2026-09-27, ouvertes ou changées (38, INV-U §3 ; L39 au §4)

- **L1** · « Classe liq calibrée sur un seul épisode enregistré : aucune couverture n'est revendiquée sur un autre événement. »
  source : GATE:165-167, servie par GATE:244 (description) et GATE:179, :1037 (contenu s0) ; TABLE (texte de la ligne s0) ·
    touche : `README.md:35`, `:107-112` ; COPY:44-45 ; `apps/site/lib/fleet.ts:194` · nature : T/D
  item : PXC-12 UKEMI-LIQ-2, partie 3 (PX-Ukemi-1, à former : second épisode, par courses) ; PXC-09 CONFORMAL-PX-2, partie 1 (campagne,
    volet théorie) · porteur : PAROXYSME ; courses : le fondateur (clé et crédits, par MONARK) · déclencheur : campagne en F3 ; courses à la bascule 1.2.0 (F4)
  état : ouvert · suite : Lee-Barber-Willett, libre, à lire (INV-U l.245) ; CA `mcp_gate_description_liq` ok (`docs/deploy-CA-harness.json:77-81`)
- **L2** · « « its coverage holds only under exchangeability with the calibration episode. The distance to a new event is named, never estimated away » »
  source : COPY:234-235 · touche : carte « Few episodes » de /ukemi · nature : T
  item : PXC-12 UKEMI-LIQ-2, partie 3 (PX-Ukemi-1, à former) ; PXC-09 CONFORMAL-PX-2, partie 1 (campagne ; PX-Ukemi-2, à former) · porteur :
    PAROXYSME ; courses : le fondateur (par MONARK) · déclencheur : campagne en F3 ; courses à la bascule 1.2.0 (F4)
  état : ouvert · suite : même construction que L1
- **L3** · « « exchangeability across events is named, not assumed » : la borne d'une strate engagée est calibrée sur un seul épisode. »
  source : COPY:105-106 · touche : liste « is not » de /ukemi · nature : T
  item : PXC-12 UKEMI-LIQ-2, partie 3 (PX-Ukemi-1, à former) ; PXC-09 CONFORMAL-PX-2, partie 1 (campagne) · porteur : PAROXYSME ; courses : le
    fondateur (par MONARK) · déclencheur : campagne en F3 ; courses à la bascule 1.2.0 (F4)
  état : ouvert · suite : même construction que L1
- **L4** · « « K = 1 épisode ⇒ aucune généralisation ; région conditionnelle non couverte » (négatives assumées de l'ADR). »
  source : `docs/adr/ADR-U4-book-et-calibration.md:219-220` · touche : aucune (interne) · nature : D
  item : PXC-12 UKEMI-LIQ-2, partie 3 (PX-Ukemi-1, à former) ; PXC-09 CONFORMAL-PX-2, partie 1 (campagne) · porteur : PAROXYSME ; courses : le
    fondateur (par MONARK) · déclencheur : campagne en F3 ; courses à la bascule 1.2.0 (F4)
  état : ouvert · suite : ADR inchangé de `d8fe354c` à la tête (`reanchor.mjs` : `unchanged-file`)
- **L5** · « L'ADR du programme écrit K = 3 événements, hypothèse n_j fixé violée et déclarée ; le service tient K = 1. »
  source : `docs/adr/ADR-M020-programme-ukemi.md:67` ; PR-UK-13 « à chercher », `:84` · touche : écart K = 3 écrit, K = 1 servi
    (`README.md:107-112`) · nature : T/D
  item : PXC-12 UKEMI-LIQ-2, partie 3 (PX-Ukemi-1, à former) ; PXC-09 CONFORMAL-PX-2, partie 1 (taille de groupe aléatoire) · porteur :
    PAROXYSME ; courses : le fondateur (par MONARK) · déclencheur : campagne en F3 ; courses à la bascule 1.2.0 (F4)
  état : ouvert (identité levée : Lee-Barber-Willett, libre, INV-U l.245) · suite : ligne datée d'ADR-M020 (K servi = 1), volet de PXC-02
    (CC l.127) qu'aucune de ses trois parties ne place (CC l.144) : partie et fenêtre à fixer par l'ADR de PXC-02 (tâche 2 du TABLEAU, F1) ;
    une ligne datée d'ADR est sans force tant qu'ETAT ne la reprend pas (ETAT l.10-11)
- **L6** · « Le rapport de course n'estime aucune borne de couverture entre épisodes (`barber_thm2_bound: not_estimated`). »
  source : `apps/site/lib/ukemi-course-view.ts:146` ; `apps/site/data/ukemi-course.json:95`, `:198` · touche : /ukemi/course · nature : T
  item : PXC-09 CONFORMAL-PX-2, partie 1 (PX-Ukemi-2, à former : estimateur d_TV pré-enregistré ; I-1 de
    `docs/adr/ADR-U4b-calibration-episode-frais.md:1757`, orphelin) · porteur : PAROXYSME · déclencheur : partie 1 de PXC-09 (F3)
  état : ouvert · suite : Kim, Ramdas, Singh, Wasserman, AoS 49(1), libre (INV-U l.248) ; un second épisode vient des courses (PXC-12, F4)
- **L7** · « « the H-3 exchangeability check is a report, a YES licenses nothing more » : aucun test d'équivalence ne borne l'écart. »
  source : GATE:166-167 ; TABLE (ligne s0) ; `apps/site/data/ukemi-served.json:9` · touche : description servie de `gate` ; contenu s0 · nature : T
  item : PXC-09 CONFORMAL-PX-2, partie 4 (PX-Ukemi-10, à former : test d'équivalence pré-enregistré) ; procurement PXP-12 (Wellek, 2ᵉ éd.,
    CRC 2010, DOI 10.1201/EBK1439808184, ISBN 978-1-4398-0818-4 ; tentative : aperçu éditeur de 42 p. seulement, RECEPTION:19 ; usage : le
    test d'équivalence de la partie 4 ; INV-U l.251, PLAN l.861) · porteur : PAROXYSME ; achat : le fondateur (par MONARK) · déclencheur :
    partie 4 de PXC-09 (F5)
  état : ouvert · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` ; procurement avant la partie ; LTT et CRC détenus
    (INV-U l.257)
- **L8** · « « the bound holds only if yhat was produced by the frozen close-factor rule … which the gate does not check ». »
  source : GATE:172-174 ; TABLE (ligne s0) · touche : `README.md:110-112` ; COPY:51 ; description servie et contenu s0 · nature : T/P
  item : PXC-13 K8-CALLER-INPUT-1, partie 2 (PX-Ukemi-9, à former : ADR K-8, provenance de ŷ pour liq et kata) · porteur : PAROXYSME ·
    déclencheur : partie 2 de PXC-13 (F3)
  état : ouvert · suite : propriétaire de l'ADR K-8 à fixer par la partie (CC l.440) ; SLSA v1.2 et in-toto 1.0 détenus (INV-U l.263)
- **L9** · « Le livre, son empreinte et le chemin d'oracle sont portés par l'appelant, non revérifiés ; le livre est un instantané périmé. »
  source : `apps/harness/src/tools/ukemi-predict.ts:62-63` · touche : aucune servie (`ukemi-predict` non enregistré,
    `apps/harness/src/tools/registry.ts:32`) · nature : P
  item : PXC-13 K8-CALLER-INPUT-1, partie 2 (PX-Ukemi-9, à former) · porteur : PAROXYSME · déclencheur : partie 2 de PXC-13 (F3)
  état : ouvert · suite : l'enregistrement d'`ukemi-predict` est U-5b (L38 ; PXC-12 partie 3, F4)
- **L10** · « « the lower edge is 0 by construction, not a calibrated bound » : un seul bord de la région liq est calibré. »
  source : GATE:156-158 · touche : `README.md:109-110` ; COPY:39-40 ; description servie et contenu s0 · nature : T
  item : PXC-12 UKEMI-LIQ-2, partie 2 (PX-Ukemi-8, à former : lecture de Romano-Patterson-Candès, libre, puis bord bas calibré ou maintien
    chiffré) · porteur : PAROXYSME ; release de textes servis : go du fondateur (par MONARK) · déclencheur : release de textes servis (F3)
  état : ouvert · suite : partie choisie par ce registre (§7, doute 6)
- **L11** · « Seule la borne supérieure de couverture exigerait des résidus distincts ; MONARK ne revendique que ≥ 1−α. »
  source : `docs/adr/ADR-U4b-calibration-episode-frais.md:181-182` · touche : aucune phrase servie de borne haute · nature : T
  item : PXC-12 UKEMI-LIQ-2, partie 1 (UKEMI-UPPER-BOUND-1, à re-former ; PX-Ukemi-13, à former : lecture de TFCP §9.1, rejeu de la mesure des ex
    æquo), puis partie 2 (phrase servie) · porteur : PAROXYSME ; lecture du texte détenu : MONARK ; release de textes servis : go du
    fondateur (par MONARK) · déclencheur : partie 1 de PXC-12 (F3) ; release de textes servis (F3)
  état : changé (TFCP Thm 3.11 ouvre la voie [lu-lecteur] ; `marginal_alpha` 0.0059 publié, TABLE) · suite : mesure de `claude-sonnet-5` à rejouer
- **L12** · « n 170 sous `interior_rank_min_n` 199 sur s0 : q̂ est le maximum de la strate ; un énoncé par calibration demande 299. »
  source : `apps/site/data/ukemi-served.json:17`, `:20` ; `docs/adr/ADR-U4b-2b-classe-servie.md:162` ; TABLE (`n` 170) · touche : /ukemi/course
    (divulgation C-5) · nature : D
  item : PXC-12 UKEMI-LIQ-2, partie 3 (PX-Ukemi-7, à former : courses) ; PXC-09 CONFORMAL-PX-2, partie 1 (F-W2-3 de 0004 l.195, absent d'ETAT,
    à re-former) · porteur : PAROXYSME ; courses : le fondateur (par MONARK) · déclencheur : courses à la bascule 1.2.0 (F4) ; campagne en F3
  état : changé (seuil 299 = n0(0,01 ; 0,05), 0004 l.135) · suite : partie de PXC-09 choisie par ce registre (§7, doute 6)
- **L13** · « « The largest-amount stratum is expected to stay under_calib for a long time » : s3 n'est pas engageable à cette version. »
  source : COPY:160-161 ; `apps/harness/src/policy-marginal.ts:57-58` ; ADR-CM l.155 ; C l.270 · touche : /ukemi (COVERAGE_NOTE) · nature : D/T
  item : PXC-12 UKEMI-LIQ-2, partie 3 (PX-Ukemi-7 étendu, à former : coupe haute servie ou région exacte au-delà de 2^53) ; PXC-16 partie 3
    (version du contrat) ; PXC-02, texte de COPY, partie 1 hors noyau ou partie 2, à fixer par son ADR · porteur : PAROXYSME ; version : le
    fondateur · déclencheur : bascule 1.2.0 (F4) ; texte : la partie que l'ADR de PXC-02 lui fixe (tâche 2 du TABLEAU, F1), au plus tard
    avec les parties 2-3 de PXC-02 (F3, PLAN l.597)
  état : changé (barrière 1.1.0 : la garde 2^53 refuse s3) · suite : texte hors des listes (a) et (b) de PLAN §5.1 (§7, doute 6)
- **L14** · « « The served-price delay seen in the design episode is unexplained » : le retard de la valeur servie n'est pas rejoué. »
  source : COPY:240-241 ; `docs/adr/ADR-U4-book-et-calibration.md:108` · touche : carte « Open questions stay open » · nature : M
  item : PXC-12 UKEMI-LIQ-2, partie 1 (PX-Ukemi-3, à former : rejeu bloc par bloc de la source vérifiée du DualAggregator) · porteur :
    PAROXYSME ; scellement de la source détenue sur l'hôte : MONARK · déclencheur : partie 1 de PXC-12 (F3), hors réseau
  état : ouvert (débloquée : source détenue, `docs/course-ukemi/FAITS-dualaggregator-cutoff-2026-09-22.md:3`) · suite : `block_ts` d'e2 à vérifier
- **L15** · « « Declared bias: these values are sampled at and just before liquidation blocks only » (rapport de course). »
  source : `apps/site/lib/ukemi-course-view.ts:198` ; `docs/adr/ADR-U4-book-et-calibration.md:106-107` · touche : /ukemi/course · nature : M
  item : PXC-12 UKEMI-LIQ-2, partie 1 (PX-Ukemi-3, à former : rejeu sur tous les blocs de la fenêtre) · porteur : PAROXYSME ; scellement :
    MONARK · déclencheur : partie 1 de PXC-12 (F3)
  état : ouvert · suite : même rejeu que L14
- **L16** · « « whether that category covers the collateral cannot be checked off-line » : les comptes d'une autre catégorie e-mode sont exclus. »
  source : COPY:241-242 · touche : carte « Open questions stay open » · nature : D
  item : PXC-17 DOMAINE-PX-2, partie 1, campagne D2 (PX-Ukemi-4, à former : appartenance e-mode lue au bloc B₀) · porteur : PAROXYSME ; lecture
    sur place du fil Aave v3.2 « Liquid Emodes » : MONARK (PLAN §7.2) · déclencheur : campagne D2 de PXC-17 (F4)
  état : ouvert · suite : bitmaps de catégorie au bloc B₀ : lecture réseau, sous go ; partie choisie par ce registre (§7, doute 6)
- **L17** · « « the other legs are held at their book-block price: a declared limitation, not a repricing ». »
  source : COPY:228-229 · touche : carte « One venue, one collateral class » · nature : T/D
  item : PXC-17 DOMAINE-PX-2, partie 1, D2 (lecture), puis partie 3 (PX-Ukemi-5, à former : mesure multi-réserves) · porteur : PAROXYSME ;
    coût de la mesure réseau : le fondateur · déclencheur : D2 en F4 ; partie 3 de PXC-17 (F5)
  état : ouvert · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d`, pour la partie 3
- **L18** · « « One lending venue, core market, single-collateral WETH accounts » : tout autre collatéral est exclu. »
  source : COPY:227-228 · touche : même carte ; `README.md:106-112` · nature : D
  item : PXC-17 DOMAINE-PX-2, partie 3 (PX-Ukemi-6, à former, après PX-Ukemi-5 : strates multi-collatéral ; Ding et al. 2023) · porteur :
    PAROXYSME · déclencheur : partie 3 de PXC-17 (F5)
  état : ouvert · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d`
- **L19** · « ŷ est le maximum liquidable en un appel ; H-4 « tous liquidés » dit NON (4 sur 72 en plusieurs appels). »
  source : `apps/site/data/ukemi-course.json:218-226` · touche : /ukemi/course · nature : T/M
  item : PXC-17 DOMAINE-PX-2, partie 1, D2 (PX-Ukemi-17, à former : ŷ séquentiel ou maintien chiffré ; Perez et al., Gatto 2026) · porteur :
    PAROXYSME · déclencheur : campagne D2 de PXC-17 (F4)
  état : ouvert · suite : partie choisie par ce registre (§7, doute 6)
- **L20** · « `calibrate` ne valide pas que les nombres reçus sont des scores ; des données non échangeables annulent la couverture. »
  source : `apps/harness/src/tools/calibrate.ts:55-57` (label K-1) · touche : outil servi `calibrate` (description, `content`, `label`) · nature : T
  item : PXC-09 CONFORMAL-PX-2, partie 1 (campagne en ligne : ACI et PID détenus), puis partie 4 (PX-Ukemi-11 (a)(b), à former : diagnostic
    et mode adaptatif) · porteur : PAROXYSME · déclencheur : campagne en F3 ; partie 4 de PXC-09 (F5)
  état : ouvert · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` ; copropriété Hikae et label coupé dans la
    description de `gate` (§6)
- **L21** · « `calibrate` hérite de `l1-split` : « NO coverage conditional on x » ; la couverture conditionnelle exacte sans hypothèse est impossible. »
  source : `packages/hikae/src/l1-split.ts:4-5` · touche : label de `calibrate` · nature : T
  item : PXC-09 CONFORMAL-PX-2, partie 5 (impossibilité nommée, P-64 (d) ; PX-Ukemi-11 (c), à reformuler : garantie conditionnelle relâchée,
    Gibbs-Cherian-Candès détenu) · porteur : PAROXYSME · déclencheur : partie 5 de PXC-09 (F5)
  état : changé (impossibilité établie : TFCP Thm 4.5 [lu-lecteur]) · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d`
- **L22** · « Plafond de 10 000 scores sans source ; « the only quantile the repo implements » est faux depuis 1.1.0. »
  source : `apps/harness/src/tools/calibrate.ts:36`, `:115` · touche : outil `calibrate` · nature : C/T
  item : PXC-09 CONFORMAL-PX-2, partie 4 (PX-Ukemi-12, à former : banc de capacité, jackknife+ ; F-W2-1 de 0004 l.193, hors ETAT) · porteur :
    PAROXYSME · déclencheur : partie 4 de PXC-09 (F5)
  état : changé (rang exact et contrôle du risque au dépôt) · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` ;
    commentaire de `:115` aussi en N6
- **L23** · « « `unique` is evaluated at `tol=1e-8` while Picard stops at `1e-10`: declared, not a theorem ». »
  source : PKG:13 · touche : README du paquet (exporté) · nature : T
  item : PXC-17 DOMAINE-PX-2, partie 1, D2 (PX-Ukemi-14, à former : tolérance tirée d'un résultat ; Amini et al. détenu) · porteur :
    PAROXYSME · déclencheur : campagne D2 de PXC-17 (F4)
  état : ouvert · suite : partie choisie par ce registre (§7, doute 6)
- **L24** · « Itérer depuis 0 donne un point fixe bas, « with no theoretical guarantee of reaching L_* without restarts ». »
  source : PKG:63-65 ; `packages/ukemi/src/clearing.ts:161-162` · touche : README du paquet · nature : T
  item : PXC-17 DOMAINE-PX-2, partie 1, D2 (PX-Ukemi-14, à former : conditions d'unicité d'Amini et al.) · porteur : PAROXYSME ·
    déclencheur : campagne D2 de PXC-17 (F4)
  état : ouvert · suite : aucune
- **L25** · « Hors récupération totale, l'unicité est perdue ; tout (α, β) utilisé est « declared, UNFOUNDED ». »
  source : `apps/site/components/ukemi-panel.tsx:96-98` ; PKG:72-74 · touche : panneau « Honest limits » ; README du paquet · nature : T/D
  item : PXC-17 DOMAINE-PX-2, partie 1, D2 (PX-Ukemi-14, à former : (α, β) mesurés sur les données U-3 ; Rogers-Veraart, Amini et al.
    détenus) · porteur : PAROXYSME · déclencheur : campagne D2 de PXC-17 (F4)
  état : ouvert · suite : la Phase 2b d'ADR-M003 (`docs/adr/ADR-M003-phase2-integration.md:170`) est sans force (ETAT l.9-11)
- **L26** · « Le README du paquet dit le choc « declared parameter, NOT a 24 h dynamics model » : phrase périmée. »
  source : PKG:14 · touche : README du paquet (exporté) · nature : T
  item : PXC-02 PUBLIC-SENTENCES-2, partie 2 (PX-Ukemi-15, à former : correction datée du README du paquet) · porteur : PAROXYSME ;
    publication : release du miroir (acte du fondateur) · déclencheur : partie 2 de PXC-02 (F3)
  état : ouvert (périmée) · suite : dépassée par la classe à chemin d'oracle réalisé
- **L27** · « « no source of realized 24 h liquidated-debt labels exists … "real data" is not claimed » : périmé, la classe servie en a. »
  source : PKG:79-82 · touche : README du paquet (exporté) · nature : D
  item : PXC-02 PUBLIC-SENTENCES-2, partie 2 (PX-Ukemi-15, à former) · porteur : PAROXYSME ; publication : release du miroir (acte du
    fondateur) · déclencheur : partie 2 de PXC-02 (F3)
  état : ouvert (périmée) · suite : aucune
- **L28** · « Le README du paquet dit le Lemme 5 « pending » ; il est clos depuis le 2026-09-05. »
  source : PKG:34-37 ; `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md:410-416` · touche : README du paquet (exporté) · nature : T
  item : PXC-02 PUBLIC-SENTENCES-2, partie 2 (PX-Ukemi-15, à former) · porteur : PAROXYSME ; publication : release du miroir (acte du
    fondateur) · déclencheur : partie 2 de PXC-02 (F3)
  état : ouvert (périmée) · suite : P-EN-249, procurement lu le 2026-09-05 (`docs/JOURNAL-PROVENANCE.md:151`, section du 2026-09-05, l.148)
- **L29** · « « whether such a feedback exists … is an empirical question » : la rétroaction des ventes forcées n'est pas mesurée. »
  source : `apps/site/app/docs/ukemi/page.tsx:171-172` ; PKG:86-87 · touche : /docs/ukemi · nature : T/M
  item : PXC-01 PAROXYSME-STANDARD-1, partie 2 (déclencheurs d'ADR-M020 D1 (a), à re-former) ; PXC-17 DOMAINE-PX-2, partie 1, D2 (promotion :
    Λ sur plusieurs krachs) · porteur : PAROXYSME ; MONARK (ligne d'ETAT) · déclencheur : partie 2 de PXC-01 (F3) ; campagne D2 (F4)
  état : changé (couverture orpheline depuis l'effacement, ETAT l.9-11) · suite : promotion = question Q3 de REG-27 (l.251)
- **L30** · « Deux éditions du source sont équivalentes sur les données engagées : « no test reddens them ». »
  source : `docs/adr/ADR-U5a-producteur-ukemi-predict.md:33` · touche : aucune (interne) · nature : M
  item : PXC-12 UKEMI-LIQ-2, partie 1 (PX-Ukemi-16, à former : fixture frontière qui tue les deux mutants) · porteur : PAROXYSME ·
    déclencheur : partie 1 de PXC-12 (F3)
  état : ouvert · suite : aucune
- **L31** · « `probabilistic` échappe au motif `probabilit\w*` (limite déclarée D-A9-1). »
  source : `docs/adr/ADR-U5a-producteur-ukemi-predict.md:154` · touche : aucune (interne) · nature : C
  item : PXC-12 UKEMI-LIQ-2, partie 1 (PX-Ukemi-16, à former : motif étendu et son test) · porteur : PAROXYSME · déclencheur : partie 1 de
    PXC-12 (F3)
  état : ouvert · suite : aucune
- **L32** · « Le scan servi A-9 ne lit que `content[0].text` et `structuredContent.label` ; les autres feuilles ne sont pas scannées. »
  source : `docs/adr/ADR-U5a-producteur-ukemi-predict.md:155` · touche : aucune (interne) · nature : C
  item : PXC-01 PAROXYSME-STANDARD-1, partie 2 (déclencheur de l'ADR à re-former : premier champ de prose hors `label`) · porteur :
    PAROXYSME ; MONARK (ligne d'ETAT) · déclencheur : partie 2 de PXC-01 (F3)
  état : changé (orphelin depuis l'effacement, ETAT l.9-11) · suite : aucune
- **L33** · « Le contrôle des chiffres des pages est textuel : règles CSS et attributs hors `alt`, `title`, `aria-label` ne sont pas vus. »
  source : `docs/adr/ADR-UKEMI-DIGIT-1.md:349` ; `scripts/assert-fleet-html.mjs:345`, `:358` · touche : garde des pages servies · nature : C
  item : PXC-05 SERVED-CONTROL-1, partie 2 (UKEMI-CHECK-ATTR-SCOPE-1, à re-former) · porteur : PAROXYSME · déclencheur : reste de la
    partie 2 de PXC-05 (F3)
  état : changé (orphelin ; le résidu est dans le code) · suite : rangée en partie 2 par PLAN l.705
- **L34** · « Le fichier servi porte un seul verdict, celui de la strate de la sonde. »
  source : `docs/adr/ADR-UKEMI-DIGIT-1.md:287` ; `apps/site/data/ukemi-served.json:12-22` · touche : /ukemi/course · nature : C
  item : PXC-05 SERVED-CONTROL-1, partie 2 (SERVED-PROBE-PER-STRATUM-1, à re-former) · porteur : PAROXYSME · déclencheur : reste de la
    partie 2 de PXC-05 (F3)
  état : changé (orphelin ; la CA contrôle s0 et une strate non engagée, `docs/deploy-CA-harness.json:63-75`) · suite : PLAN l.705
- **L35** · « L'enregistreur n'a aucune borne haute sur n : la fenêtre effective vaut min(n, holders). »
  source : `docs/adr/ADR-U4b-calibration-episode-frais.md:2079` · touche : aucune (interne, enregistreur) · nature : C
  item : PXC-01 PAROXYSME-STANDARD-1, partie 2 (UKEMI-CONC-BOUND-1, à re-former ; jamais entré au registre,
    `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:55`, `:64`) · porteur : PAROXYSME ; MONARK (ligne d'ETAT) · déclencheur : partie 2 de PXC-01 (F3)
  état : changé (orphelin) · suite : aucune
- **L36** · « `MoveFileExW` sans `MOVEFILE_WRITE_THROUGH` ne garantit pas la persistance du renommage. »
  source : `docs/adr/ADR-U4b-calibration-episode-frais.md:954` · touche : aucune (interne) · nature : P
  item : PXC-01 PAROXYSME-STANDARD-1, partie 2 (R-BORNE-2, à re-former ; `docs/G2-lot-u4b-1b-3-delta.md:271`) · porteur : PAROXYSME ;
    MONARK (ligne d'ETAT) · déclencheur : partie 2 de PXC-01 (F3)
  état : changé (orphelin) · suite : aucune
- **L37** · « « payeur non démontré » : aucun payeur de la mesure n'est établi. »
  source : `docs/adr/ADR-M020-programme-ukemi.md:67` ; ETAT l.129 (4 `POST /gate` de 2 clients en 7 jours, toutes classes) ·
    touche : aucune · nature : Dr
  item : PXC-18 JURISTE-DROIT-1, partie 2 (étude du payeur, à former ; D5 d'ADR-M020 et déclencheur U-6, orphelins) · porteur : PAROXYSME ;
    décision de valeur : le fondateur (par MONARK) · déclencheur : partie 2 de PXC-18 (F4)
  état : changé (orphelin ; mesure neuve à ETAT l.129) · suite : partie choisie par ce registre (§7, doute 6)
- **L38** · « Témoin vivant `upcoming` ; `cascade` servi « v0, replaced at U-5 » sans item vivant ; registre « a transitional tool, to be replaced ». »
  source : `apps/site/components/ukemi-panel.tsx:107-108` ; `apps/harness/src/tools/cascade.ts:92` ; `apps/site/lib/fleet.ts:194` ;
    `apps/harness/src/tools/registry.ts:32` · touche : panneau ; description servie de `cascade` ; registre public · nature : P
  item : PXC-12 UKEMI-LIQ-2, partie 2 (description de `cascade`, PLAN l.475) et partie 3 (U-5b, à re-former) ; U-6 : attribué à PXC-12,
    partie fixée par son ADR (ETAT l.262-263 à `5437cd0d`) · porteur : PAROXYSME ; release de textes servis : go du
    fondateur (par MONARK) ; DNS et certificat d'un nom neuf : le fondateur (par MONARK) · déclencheur : release de textes servis (F3) ;
    bascule 1.2.0 (F4) ; U-6 : le G0 de sa partie de PXC-12, au plus tard la partie 3 (F4)
  état : changé (U-5b orphelin ; U-6 attribué à PXC-12 par MONARK le 2026-10-07) · suite : U-5b enregistre `ukemi-predict` et retire `cascade` ;
    U-6 sert `/ukemi/` depuis `sentinel-2` (`docs/adr/ADR-M020-programme-ukemi.md:45`) ; §7, doutes 5 et 16

## 3. Ukemi : limites nouvelles au 2026-10-06, ouvertes ou changées (11, INV-U §3 ; N11 et N12 closes au §4)

- **N1** · « Texte de classe servi sur s1-s3 : « no liquidation-eligible-coverage calibration is committed yet », alors que s0 est engagée. »
  source : GATE:183-184, servi par GATE:1035 et GATE:745-746 ; TABLE (`class.text`) · touche : contenu servi sur s1-s3 ; table publiée ·
    nature : C
  item : E2A-TEXTS-1 (PLAN l.896-898 : textes de Q-B, dont le texte de case liq, Q-B (iv), l.187-188 ; ETAT l.264 à `5437cd0d` : ce texte
    part avec la release L, R4 v3 n'est pas rouvert) ; en repli, PXC-12 UKEMI-LIQ-2, partie 2 (PX-Ukemi-18, à former : texte de case sur
    le modèle de `kataClassText`, GATE:216-218) · porteur : MONARK (E2A-TEXTS-1) ; PAROXYSME (PXC-12) ; ligne Z-3 : MONARK ; release de
    textes servis : go du fondateur (par MONARK) · déclencheur : E2A-TEXTS-1 : la release L, qui publie la table liq
    (ETAT l.264 à `5437cd0d`) ; repli : release de textes servis (F3, PLAN l.593-594)
  état : ouvert · suite : Q-CP4B-1, « défaut accepté » (`docs/G7-lot-c-prime-b.md:131`) ; dossier daté neuf (PLAN l.594-595) ; question
    datée à MONARK, tranchée le 2026-10-07 (ETAT l.264 à `5437cd0d`), §7, doute 3
- **N2** · « Énoncé `marginal` seul : sous i.i.d., le taux d'échec de s0 dépasse α sur 0,99^170 ≈ 18 % des tirages ; phrase p = n non servie. »
  source : C l.500 ; 0004 l.23-24, l.112 ; GATE:762-770 (aucun jeton d'énoncé servi) · touche : spécification publique §12 ; contenu s0 ·
    nature : T/D
  item : PXC-12 UKEMI-LIQ-2, partie 2 (PX-Ukemi-19, à former : divulgation p = n, si D7 (e) de 0004 tient) · porteur : PAROXYSME ; décision
    D7 (e) : RECHERCHES, sur la question que MONARK lui forme ; release de textes servis : go du fondateur (par MONARK) · déclencheur :
    release de textes servis (F3, PLAN l.593-594) ; la réponse à D7 (e) est due avant elle, sinon une ligne d'attente datée reporte N2
  état : ouvert · suite : 0,99^170 = 0,1811 [calc] ; énoncé par calibration à n ≥ 299 : F-W2-3 (0004 l.195), absent d'ETAT ; INV-U
    doute 3 ; question D7 (e) : MONARK la forme vers RECHERCHES dans son prochain envoi, réponse avant la release de textes servis
    (MSG l.86 ; §7, doute 16)
- **N3** · « « under a keyless RPC quorum » (README, contrat gelé, résidu `rpc_quorum_2_keyless`) contre la jambe payante de l'enregistreur. »
  source : `README.md:106-107`, `:189`, `:256` ; `schemas/attested-book.schema.json:5`, `:133` ; `apps/sentinel/src/ukemi/record.ts:320-337` ;
    `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md:20` · touche : ces lignes du README ; contrat AttestedBook gelé · nature : D/P
  item : PXC-02 PUBLIC-SENTENCES-2, noyau de la partie 1 (PX-Ukemi-20, à former, volet README : liste (a), PLAN l.658) ; PXC-16
    HARNESS-NEXT-1, partie 3 (PX-Ukemi-20, volet résidu du contrat `attested-book`) · porteur : PAROXYSME ; envoi du site, release du
    miroir : le fondateur · déclencheur : noyau, tâche 2 du TABLEAU (F1) ; bascule 1.2.0 (F4)
  état : ouvert · suite : CARTO-T1C-4 orphelin ; texte du noyau : « keyless public quorum plus one optional paid operator » (PLAN l.658)
- **N4** · « AttestedBook : lecture auto-déclarée, « no third-party verification » ; le résidu `no_third_party_verifier` est toujours émis. »
  source : `schemas/attested-book.schema.json:5`, `:126-130` ; `docs/adr/ADR-U1b-contrat-attestedbook.md:49`, `:51` · touche : `README.md:256`,
    `:106-107` · nature : P/T
  item : PXC-07 TRUSTLESS-READ-2, partie 1 (campagne R1, preuves d'état ; PX-Ukemi-21, à former : vérificateur tiers du book) · porteur :
    PAROXYSME · déclencheur : campagne de PXC-07 (F3)
  état : ouvert · suite : EIP-1186 « Stagnant » (CC l.265) ; voisine de PX-Narabi-8 ; contrat `upcoming` (`README.md:20`), servi après U-6
- **N5** · « Sur liq, `tau` et `tauInterval` restent à l'appelant : « commit — the region is tight enough to act on » suit son seuil. »
  source : ADR-CM l.21, l.177 · touche : `README.md:81` · nature : T
  item : PXC-12 UKEMI-LIQ-2, partie 2 (PX-Ukemi-22, à former : plafond de largeur servi pour liq, ou ligne d'ADR argumentée) · porteur :
    PAROXYSME ; release de textes servis : go du fondateur (par MONARK) · déclencheur : release de textes servis (F3)
  état : ouvert · suite : `tauInterval` ne change aucune revendication de couverture (ADR-CM l.177)
- **N6** · « Descriptions périmées après 1.1.0 : `splitQuantile` au README du harnais, commentaires de `gate.ts` et de `calibrate.ts`. »
  source : `apps/harness/README.md:34` ; GATE:669 ; `apps/harness/src/tools/calibrate.ts:115` ; `docs/G7-lot-c-prime-b.md:155` ·
    touche : README du harnais (exporté) · nature : C
  item : PXC-02 PUBLIC-SENTENCES-2, partie 2 (PX-Ukemi-15 étendu, à former) · porteur : PAROXYSME ; publication : release du miroir (acte du
    fondateur) · déclencheur : partie 2 de PXC-02 (F3)
  état : ouvert · suite : « Le README va à T0 » (`docs/G7-lot-c-prime-b.md:155`) : encore là après T0
- **N7** · « « Shocking the whole cleared value is a v0 simplification; no source supports shocking interbank receivables » (description servie). »
  source : `apps/harness/src/tools/cascade.ts:88-89` · touche : description servie de `cascade` · nature : T
  item : PXC-12 UKEMI-LIQ-2, partie 3 (U-5b, à re-former : retrait de la fiction `cascade`, enregistrement d'`ukemi-predict`) · porteur :
    PAROXYSME ; octets servis : go du fondateur · déclencheur : bascule 1.2.0 (F4)
  état : ouvert · suite : la phrase vit tant que `cascade` est servi (`apps/harness/src/tools/registry.ts:32`)
- **N8** · « `apps/sentinel/test/ukemi-conc.test.ts` fait 32 586 fsync ; la borne de `npm run ci` est passée de 600 à 1 800 s. »
  source : ETAT l.1672-1674 · touche : aucune (CI) · nature : C
  item : UKEMI-CONC-FSYNC-1 (ETAT l.1674 ; « la cause » de la borne de 1 800 s, `docs/G1-lot-t42-bound.md:139` ; porteur et déclencheur
    écrits à ETAT l.1835-1839 à `5437cd0d`) · porteur : PAROXYSME, sous PXC-12 UKEMI-LIQ-2, partie 1 (hors réseau, CC l.421) · déclencheur :
    le G0 du prochain lot qui touche les tests à fsync de ce fichier, au plus tard la partie 1 de PXC-12 (F3)
  état : ouvert (même texte qu'à `57a131fc`, l.1201-1202 ; ouvert à ETAT l.1839 à `5437cd0d`) · suite : #240 (`377f40c`) touche ce test
    sans le compte des fsync ; §7, doutes 4 et 16
- **N9** · « La skill décrit la classe liq sans « one recorded episode » ni la condition de règle sur ŷ. »
  source : `skills/monark/SKILL.md:62` · touche : skill publique, même ligne · nature : C
  item : PXC-02 PUBLIC-SENTENCES-2, partie 2 (skill ; PX-Ukemi-15 étendu, à former) · porteur : PAROXYSME ; publication : release du miroir
    (acte du fondateur) · déclencheur : partie 2 de PXC-02 (F3)
  état : ouvert · suite : aucune
- **N10** · « Items PAROXYSME d'Ukemi hors référence : PX-Ukemi-1 à -17 et leurs items couvrants absents d'ETAT ; aucun `docs/PAROXYSME-Ukemi.md`. »
  source : ETAT l.1853-1854 (registre du Dōjō) ; `git ls-tree 87b821b0 docs/` (aucun registre d'Ukemi) · touche : registre PAROXYSME · nature : C
  item : versement intérimaire (a′) (PLAN §4.1 A ; tâche 1 du TABLEAU), fait par #242, fusion `1df4e44f` (ETAT l.181-186 à `5437cd0d`),
    qui accomplit PAROXYSME-UKEMI-FILE-1 (INV-U l.189), comme PAROXYSME-DOJO-FILE-1 (ETAT l.1853-1854) ; PXC-01 partie 2 (re-formation à
    ETAT des items PX-Ukemi) · porteur : PAROXYSME (ce registre) ; MONARK (fusion, ligne d'ETAT) · déclencheur :
    fusion de ce registre (F1), faite le 2026-10-07 ; partie 2 de PXC-01 (F3)
  état : changé (registre versé ; items PX-Ukemi à re-former par PXC-01 p2 : ETAT l.184-185 à `5437cd0d`) · suite : ce fichier est le versement
    (a′) ; U-6 est re-formé (ETAT l.254, l.262-263 à `5437cd0d`) ; voie des autres items couvrants : question à MONARK, échéance F3 (§7, doute 7)
- **N13** · « La ligne liq s0 n'a pas de chemin de retrait servi : la chaîne de retrait ne vise que les lignes kata. »
  source : `apps/harness/src/policy-retire.ts:1-8` ; `apps/harness/src/policy-marginal.ts:61-68` (ligne reconstruite de `calibration.ts`) ·
    touche : contenu servi s0 · nature : C/P
  item : PXC-04 NARABI-SERVED-2, partie 3 (NARABI-ROW-SUPERSEDE-1, à former : retrait et remplacement d'une ligne marginale, CC l.175 ;
    il absorbe PX-Ukemi-23, chemin de retrait de la ligne liq, INV-U l.276 ; propriétaire unique, PLAN l.477-478, P-24) · porteur :
    PAROXYSME · déclencheur : partie 3 de PXC-04 (F4)
  état : ouvert · suite : R-b fusionnée (ETAT l.1764-1766) ; RETIRE-PROBE-MARGINAL-1 (ETAT l.1059-1064) : la sonde refuse les tables marginales

## 4. Limites closes ou obsolètes (avec preuve) (3, INV-U §3)

- **N11** · « Phrase calibrée servie aussi sur s1-s3 (`under_calib`) : audit P3, S-8. » · clos (preuve : GATE:738-747 ; test
  `liq_honesty_text_follows_the_resolved_cell`, `apps/harness/test/gate-liq.test.ts:204` ; ADR-CM l.303 ; `docs/G7-lot-c-prime-b.md:21`,
  `:44` ; CA `gate_liq_uncommitted_call`, `docs/deploy-CA-harness.json:70-75`) · suite : résidu en N1
- **N12** · « Bord de bande liq à l'arrondi ; somme ŷ + q̂ hors de 2^53. » · clos (preuve : `apps/harness/src/policy-marginal.ts:52-58`, `:67` ;
  tests `liq_band_exact_guard`, `apps/harness/test/policy-marginal.test.ts:74`, et `liq_band_exact_guard_at_the_served_load`,
  `apps/harness/test/gate-cell.test.ts:92` ; ADR-CM l.150, l.155) ; ETAT l.1538-1542 forme LIQ-BAND-EXACT-GUARD-1 (porteur RECHERCHES,
  « avant toute strate liq nouvelle ») ; sa clôture est écrite par MONARK à ETAT l.1694-1698 à `5437cd0d` (§7, doute 16) · suite : résidu en L13
- **L39** · « Le moniteur de risque restant de niveau 2 ne revendique aucune garantie en Phase 1. » · clos ici comme obsolète (preuve :
  hors pièce, tenue par l'inventaire Hikae, ligne L4 de `INVENTAIRE-Hikae.md` l.129, et portée par l'entrée L4 de `docs/PAROXYSME-Hikae.md`,
  ouverte (l.86-90 à `11d2a34`) ; double retiré au registre consolidé du 2026-09-27, l.22 ; `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md:113`)
  · suite : renvoi au §6

## 5. Limites marquées PAROXYSME apparues à ETAT depuis l'inventaire

Commande (à la tête, sans réseau) : `git diff -U0 57a131fc 87b821b0 -- docs/ETAT.md | grep '^+' | grep PAROXYSME` : dix lignes ajoutées,
huit limites et un bloc (la dixième ligne, ETAT l.1103, continue RETIRE-LATENCY-FIRST-REAL-1). Aucune ne touche Ukemi : aucune entrée `UKT-nn`.

- DIR-4H-DIGEST-COMMIT-1 (l.614), VERIFIER-REPORT-DECISION-DIGEST-1 (l.652), DIGEST-FLOOR-FLAT-EXACT-1 (l.687), TRIAL-HEAD-PUBLIC-REPLAY-1
  (l.724), DATED-DIR-MULTI-REPORT-1 (l.1075), RETIRE-LATENCY-FIRST-REAL-1 (l.1101-1103) : lignes kata ; registre du Harnais.
- Bloc des textes figés de R4 v2 (l.730-778) : F-K-7, KATA-INPUT-RECOMPUTE-1, SERVER-CLOCK-BOUND-1, F-W2-9a à 9c, KATA-EXCH-TEST-1,
  W2-MKL09-ADDENDUM-1, LATE-CALL-WINDOW-1 (registre du Harnais) et NARABI-POLICY-TEXT-REV-1 (iv-f, stable-run : registre Narabi) ; aucun ne
  nomme la ligne liq ni le texte de case liq de Q-B (iv) (§7, doute 3).
- GATE-DESC-CLIENT-CUT-1 (l.812-823) : description de `gate` ; registre du Harnais ; son effet sur Ukemi est au §6.
- DOJO-PROBE-UID-BOUNDARY-1 (l.1889) : sondes Narabi et Dōjō ; registre Narabi.

## 6. Renvois

- Reçus du registre du Harnais (§6 de `docs/PAROXYSME-Harnais.md`, branche `paroxysme/registres-interimaires` à `0967bef`, l.580) :
  PX-Ukemi-1 (L1 à L5), -7 (L12, L13), -8 (L10), -9 (L8, L9), -10 (L7), -11 (L20, L21), -12 (L22), -14 (L23 à L25) : entrées complètes aux
  §2 et §3.
- E-14 (q̂ liq nul rendu `under_calib` ; ADR-CM l.125 ; `docs/G7-lot-c-prime-b.md:123` ; `INVENTAIRE-Moteur.md` l.308) : l'inventaire d'Ukemi
  ne le porte pas ; l'inventaire Hikae le porte (N18, `INVENTAIRE-Hikae.md` l.173 ; CC §4 : PXC-16) : registre Hikae, entrée N18, comme le
  dit le §6 du registre du Harnais (à `0967bef`, l.582) ; §7, doute 8.
- GATE-DESC-CLIENT-CUT-1 (ETAT l.812-823) : registre du Harnais. Effet sur Ukemi [calc] : la clause liq (GATE:253) précède la clause kata
  (unité 1 904, ETAT l.815-816) et reste vue ; le label K-1 de `calibrate` (GATE:257 ; `apps/harness/src/tools/calibrate.ts:53-58`,
  439 unités) commence vers l'unité 2 887 de la description de `gate`, au-delà de 2 048 ; la description de `calibrate` (`:64`) est entière.
- L39 (obsolète ici) : moniteur de niveau 2, inventaire Hikae (L4) : registre Hikae.
- N4 : voisine de PX-Narabi-8 (EIP-1186, preuves de stockage) : registre Narabi ; construction partagée par PXC-07.
- `calibrate`, copropriété Hikae (X-SPLIT ; `apps/harness/README.md:34`) : ses limites restent ici (`INVENTAIRE-Harness.md` l.96) ; doute 9.
  L'inventaire Hikae cite aussi le label K-1 pour sa L3 (`INVENTAIRE-Hikae.md` l.128), portée par KATA-EXCH-TEST-1 (ETAT l.762-765).
- Hikae L21 (`packages/hikae/src/liquidable-24h.ts:9-13`, modèle `ukemi-liquidable-24h` déclaré, « propriétaire Ukemi »,
  `INVENTAIRE-Hikae.md` l.147) : l'inventaire d'Ukemi ne la porte pas ; elle reste au registre Hikae (PXC-17 partie 3) ; pendant ici : L27.
- Mêmes clôtures vues depuis la porte : C-09 du registre du Harnais et N11 (S-8) ; MK-C13 du même registre et N12 (LIQ-BAND-EXACT-GUARD-1).
- `scripts/sync-ukemi-served.mjs` sans `--check` : PX-Harness-26 (SYNC-CHECK-MODE-1), registre du Harnais ; l'inventaire d'Ukemi ne la porte pas.

## 7. Doutes nommés (ce qui ne se reproduit pas tel quel à la tête)

1. **Sources hors du tronc.** C (`kata/spec/CONTRACT-1.1.0.md`), 0004 et l'amendement A-2 (dépôt de RECHERCHES) ; REG-27 et les fichiers
   du dossier d'étude du 2026-09-27 (PX-IDENT-A à -C, PROCUREMENTS, registre consolidé) ; LECTURE-tfcp, MESURE-UKEMI-TIES, AVIS-advisor-defi,
   RECEPTION et la copie de la source du DualAggregator, sur l'hôte de MONARK : leurs lignes sont celles que l'inventaire a lues, non relues
   ici. REG-27 et PX-IDENT-A ont dans la boîte le sha256 que l'inventaire écrit (INV-U l.14, l.69) ; PX-IDENT-B, PX-IDENT-C, PROCUREMENTS et
   le registre consolidé y sont des copies caviardées, dont l'empreinte source est dans `dossier/REDACTIONS.json`.
2. **Ancres qui ont bougé à la tête** (même texte, autre numéro ; `reanchor.mjs`, sortie `same`) : ETAT l.98 → l.129 (L37) ; l.1179-1180 à
   `d8fe354c` et l.1201-1202 à `57a131fc` → l.1673-1674 (N8) ; l.1350 à `d8fe354c` → l.1853 (N10). ETAT l.9-11 et l.26-31 ne bougent pas.
   L'ADR-CM gagne trois lignes à la fin (l.329-331) : ses ancres l.21, l.28, l.150, l.155, l.177, l.303 sont `same` au même numéro. Toutes
   les autres ancres de l'inventaire sont `unchanged-file`. Aucun `CHANGED`, aucun `MISSING`. Fichier changé sans ancre :
   `apps/sentinel/test/ukemi-conc.test.ts` (N8), touché par #240 (`377f40c`), ordre du test d'arrêt du pool et borne de 10 s, sans le compte
   des fsync. Commande : `node reanchor.mjs --repo <clone> --base <d8fe354c | 57a131fc> --head 87b821b0 <fichier>:<ligne>…`. Deux ancres
   de l'inventaire, `unchanged-file` mais fausses dès l'inventaire, sont corrigées au pli et relues à la tête par `git show` :
   `README.md:110-111` → `:109-110` (L10 ; INV-U l.150) ; `docs/adr/ADR-UKEMI-DIGIT-1.md:287-289` → `:287` (L34 ; INV-U l.174).
3. **Q-B (iv), texte de case liq (N1).** Le PLAN forme E2A-TEXTS-1 (l.896-898, propriétaire MONARK : « textes de Q-B ; daté par le G0 court
   d'E-2a ; option par défaut écrite ») ; Q-B (iv) est le texte de classe liq servi sur s1-s3 (l.187-188), à poser avant le G0 court
   d'E-2a (l.182-183, l.558), option (a) par défaut (l.196-197). Ce G0 court est accepté en v6.1 le 2026-10-07 (ETAT l.107-108) : le
   déclencheur est atteint, sans acte inscrit à ETAT (`grep -c 'E2A-TEXTS-1'`, `grep -cw 'Q-B'`, `grep -c 'case liq'` : 0, 0, 0 ;
   `grep -c 'Q-B'` rend 3, Q-BNPRE-4, Q-BNPRE-5 et LIQ-BAND-EXACT-GUARD-1, l.344, l.1502, l.1540). La release L ne publie que la table liq
   (ETAT l.720-721) et le bloc de R4 ne retient que (iv-f), stable-run (ETAT l.768-774). **Question à MONARK, datée du 2026-10-07** : le
   texte de case liq est-il dans R4 v3 (pièce de RECHERCHES `bbd6f59`, figée, ETAT l.737) ou dans la release L ? **Tranchée par MONARK le
   2026-10-07** : il part avec la release L, qui publie la table liq ; R4 v3 n'est pas rouvert (ETAT l.264 à `5437cd0d`). E2A-TEXTS-1 sort
   du §1 ; son déclencheur est la release L ; N1 garde son repli, la partie 2 de PXC-12 (F3, PLAN l.593-594).
4. **UKEMI-CONC-FSYNC-1 (N8).** ETAT le nomme (l.1674) sans porteur ni déclencheur ;
   `git log -S'UKEMI-CONC-FSYNC-1' 87b821b0` ne rend que deux commits : `feb78156` (ETAT) et `24376bf9` (`docs/G1-lot-t42-bound.md:139`,
   qui le dit « la cause »). CC §4.1 le compte ITEM-ETAT (l.1138-1139), classement qui suppose un déclencheur qu'ETAT n'écrit pas. La
   partie 2 de PXC-01, que ce registre lui donnait d'abord, recartographie sans construire (PLAN l.832-834), et la fiche de PXC-01 ne nomme
   pas N8 (CC l.92-93). Porteur et déclencheur de construction proposés à MONARK (doute 16), qui seul écrit ETAT : il les écrit le
   2026-10-07 (ETAT l.1835-1839 à `5437cd0d`), et la dette sort du §1.
5. **U-6 (volet de L38).** U-6 (`sentinel-2` vers `/ukemi/` servi, `wiring` mis à jour, test d'intégration de bout en bout ;
   `docs/adr/ADR-M020-programme-ukemi.md:45`, après U-5, l.47) n'était formé nulle part à `87b821b0` : `grep -cw 'U-6'` nul à ETAT et au
   PLAN ; CC ne le nomme qu'à la l.423, ligne d'effort de PXC-12, dont les limites couvertes et les parties ne nomment que U-5b (l.404-410,
   l.421-422) ; ni PXC-01 (l.92-93), ni PXC-07 (l.265), ni PXC-16 (l.517-518) ne le placent. La partie 2 de PXC-01, que ce registre lui
   donnait d'abord, recartographie sans construire (PLAN l.832-834). Défaut de couverture du §4 de CC (l.815), compté au §1 jusqu'à la
   décision de MONARK du 2026-10-07 : U-6 est attribué à PXC-12, partie fixée par son ADR (ETAT l.262-263 à `5437cd0d` ; doute 16).
6. **Parties choisies par ce registre**, la fiche du chantier ne les nommant pas : PXC-12 partie 3 pour les courses de L1 à L5 et de L12
   (« courses sous go », CC l.422 ; PLAN l.611) ; PXC-12 partie 2 pour L10 ; PXC-09 partie 1 pour L1 à L5 et L12, partie 4 pour L20 ; PXC-17
   partie 1, campagne D2 (« liquidations et e-mode », CC l.564) pour L16, L19, L23 à L25 et L29, partie 3 (« multi-réserves », CC l.566) pour
   L17 et L18 ; PXC-18 partie 2 pour L37 ; PXC-07 partie 1 pour N4 ; PXC-01 partie 2 pour L29, L32, L35, L36 et N10 (PLAN l.832-834) ;
   pour le texte de COPY:160-161 (L13), aucune des listes (a) et (b) de PLAN §5.1 : l'ADR de PXC-02 (tâche 2 du TABLEAU) le placera. Pour
   L38, le volet texte que CC §4 donne à PXC-02 (`apps/harness/src/tools/cascade.ts:92`) va à PXC-12 partie 2, propriétaire unique (PLAN l.475) :
   la fiche de PXC-02 l'y envoie elle-même (CC l.141-143) et le propriétaire unique est fixé au versement (CC l.657-658, P-24). Proposés à
   MONARK, non choisis ici, et retenus par lui : PXC-12 pour U-6 (L38 ; ETAT l.262-263 à `5437cd0d`) et la partie 1 de PXC-12 pour N8
   (ETAT l.1835-1839 à `5437cd0d`) ; doute 16.
7. **Items absents d'ETAT** (`grep -cw '<item>' docs/ETAT.md` nul à la tête pour chacun, sauf I-1 : `grep -cw 'I-1'` rend 3, trois
   « I-1 » d'autres items, aucun celui de l'ADR-U4b : l.291 et l.1704, numéros du lot RECORDER-CLOSE-TIME-1 ; l.1354,
   REPLAY-INTERVAL-BIND-1) : PX-Ukemi-1 à -23, U-5b, U-6, I-1 de l'ADR-U4b, UKEMI-UPPER-BOUND-1, UKEMI-CHECK-ATTR-SCOPE-1,
   SERVED-PROBE-PER-STRATUM-1, UKEMI-CONC-BOUND-1, R-BORNE-2, CARTO-T1C-4, F-W2-1, F-W2-3, Q-CP4B-1,
   NARABI-ROW-SUPERSEDE-1 : écrits « à former » ou « à re-former » et portés par leur chantier, sauf I-1 et CARTO-T1C-4, dits orphelins
   (item de L6, suite de N3), F-W2-1, dit hors ETAT (item de L22), Q-CP4B-1, défaut accepté (suite de N1), et PX-Ukemi-23, absorbé par
   NARABI-ROW-SUPERSEDE-1 (item de N13) ; U-6, qui n'en avait pas (doute 5), est
   attribué à PXC-12 et re-formé à ETAT le 2026-10-07 (ETAT l.254, l.262-263 à `5437cd0d`). PAROXYSME-UKEMI-FILE-1, absent d'ETAT lui
   aussi, n'est plus à former : le versement (#242) l'accomplit (N10 ; ETAT l.181-184 à `5437cd0d`). Pour les items PX-Ukemi, leur re-formation
   à ETAT passe par PXC-01 partie 2 (ETAT l.184-185 à `5437cd0d` ; MONARK écrit les lignes), PX-STD-ORPHAN-1 ne les nommant pas (PLAN
   l.541, l.897-898) et n'étant pas étendu (MSG l.85, dit pour Hikae). Les douze autres, ni PX-Ukemi ni U-6, ne sont nommés par aucune
   de ces sources : leur voie, PXC-01 partie 2 ou la partie qui les porte (§2, §3), est une question posée à MONARK avec la demande de
   fusion de ce pli ; porteur : MONARK ; échéance : la recartographie de PXC-01 partie 2 (F3).
8. **E-14.** Le §6 du registre du Harnais (à `0967bef`, l.582) l'envoie au registre Hikae, N18, « partagé avec Ukemi » ; l'inventaire
   d'Ukemi ne le porte pas, l'inventaire Hikae le porte (N18, `INVENTAIRE-Hikae.md` l.173) : ce registre le laisse au registre Hikae (§6),
   sans entrée, comme la L21 de Hikae (`INVENTAIRE-Hikae.md` l.147). Le registre Hikae les garde : à `11d2a34`, son pli, ses entrées L21
   et N18 (l.182-186, l.338-343) et son §6 (l.434-435) disent qu'elles y restent et que ce registre y renvoie ; les renvois concordent. À
   `0967bef`, il les renvoyait à l'inverse au « registre Ukemi » (§6, l.377-378), écart que relevait la G2 de ce registre.
9. **`calibrate` et Hikae** (X-SPLIT ; INV-U doute 9) : L20 à L22 sont ici. L'inventaire Hikae cite les mêmes sources pour sa L2
   (`packages/hikae/src/l1-split.ts:4-5`, comme L21) et sa L3 (`apps/harness/src/tools/calibrate.ts:53-58`, comme L20) ; PXC-09 partie 5
   traite ensemble L21 et la L2 de Hikae (CC l.342). Un seul item par construction commune avec Hikae, ou deux, un par registre ?
   L'échéance d'abord écrite, le versement des deux registres, est passée sans décision : le versement est fait (#242, ETAT l.181-186 à
   `5437cd0d`) et ni ETAT à `5437cd0d` ni MSG ne nomment X-SPLIT ni `calibrate`. La question est posée à MONARK avec la demande de
   fusion de ce pli ; porteur : MONARK ; échéance : au plus tard la recartographie de PXC-01 partie 2 (F3). L20 à L22 gardent chacune
   leur item, leur porteur et leur déclencheur : pas de dette (§1).
10. **GATE-DESC-CLIENT-CUT-1.** Propriétaire unique : le registre du Harnais. Son effet sur le label K-1 (§6) est un calcul fait ici à partir
    de la mesure d'ETAT l.815-816 au tronc `591b3a30`, où `gate.ts` et `calibrate.ts` sont égaux à la tête (`git diff --stat` vide) ; il n'est
    mesuré sur aucun client.
11. **Items neufs non marqués PAROXYSME qui touchent la ligne liq** : RETIRE-PROBE-MARGINAL-1 (ETAT l.1059-1064, porteur RECHERCHES) et la
    release L (ETAT l.720-721, l.982) ne sont pas des limites de l'inventaire. RETIRE-PROBE-MARGINAL-1 n'est repris qu'en suite de N13, et
    la recartographie de PXC-01 partie 2 le prendra ; la release L est, depuis la décision de MONARK du 2026-10-07, le déclencheur
    d'E2A-TEXTS-1 en N1 (ETAT l.264 à `5437cd0d` ; doutes 3 et 16, §8).
12. **Non vérifié ici** : aucun test lancé ; aucune course ni lecture réseau ; les estimations en jours de l'inventaire ne sont pas reprises ;
    la part des lectures de la course servie par la jambe payante (N3) n'est pas mesurée (INV-U l.230-232) ; la mesure des ex æquo (L11) a
    été faite par `claude-sonnet-5`, modèle retiré, et reste à rejouer.
13. **Contrôle mécanique.** `verify-registres.mjs` (pièce de la boîte, commit `d97d838`, qui groupe chaque entrée entière et épingle les
    doutes, après `1fd31ee`) vérifie sur ce fichier : ids de l'inventaire égaux aux étiquettes, une fois chacun ; champs item, porteur et
    déclencheur non vides et jamais « aucun » ; « clos » et « preuve » au §4 ; aucune ligne de plus de 160 caractères, aucune adresse.
    Sous Node 24.21.0, il sort en code 0 sur `6e6c878` et `376225c` (G2, version `1fd31ee`), puis sur `376225c`, `0967bef`, `11d2a34` et
    `872ddee` (pli, version `d97d838`), avec pour cette pièce `inventory ids 52 ; entries 52 (open 49, closed 3, head 0)`. Le fichier
    plié, non commité, passe au pli la même version par une copie qui ne change que la lecture de ce fichier (têtes `0967bef`, `3e2028f`,
    `11d2a34` et `872ddee` pour les cinq autres) : code 0, mêmes comptes. Ses ancres du tronc (151, extraites par un script du pli) sont
    toutes dans les bornes à la tête (`reanchor.mjs` `a55a62d`, base et tête `87b821b0`) ; reportées depuis `57a131fc`, les 131 hors ETAT
    rendent 124 `unchanged-file` et 7 `same` au même numéro (six de l'ADR-CM et `docs/JOURNAL-PROVENANCE.md:151`) ; aucun `CHANGED`,
    `MISSING` ni `OUT-OF-RANGE`. Pli des décisions, second tour (2026-10-08) : la version `84bc889` (option `--allow-modified`), par une
    copie qui ne change que la lecture de ce fichier (les cinq autres lus à `beea9834`), sort en code 0 sur le fichier plié, mêmes comptes ;
    commande : `node verify-registres.mjs --repo <clone> --base 5437cd0d --head beea9834 --inv <inventaire> --allow-modified`. Témoins : le
    vrai déclencheur de N8 réduit à « aucun », l'oracle sort en code 0 sur le texte de `beea9834`, où il lisait à sa place le renvoi
    « porteur et déclencheur : … » de l'item, et en code 1 sur le fichier plié ; avec une ligne de 161 caractères, il sort en code 1.
14. **Étiquettes croisées de LECTURE-tfcp** (INV-U doute 4, l.317-318) : à LECTURE-tfcp l.96-97, « U-L20 » désigne la couverture
    conditionnelle (ici L21) et « U-L21 » les données ordonnées dans le temps (ici L20) ; l'inventaire les rapproche par le contenu. L'état
    de L21 (TFCP Thm 4.5, LECTURE-tfcp l.67, l.96) et la suite de L20 (Prop 5.9, asymptotique, l.97 ; INV-U l.160) en dépendent ; fichier
    de l'hôte de MONARK, non relu ici (doute 1).
15. **S-7 sur liq** (INV-U doute 6, l.320-321 : statut et unicité des lignes) : clôture probable par `guardMarginalTable`
    (`apps/harness/src/policy-marginal.ts:61-68`), non attestée : l'ADR-CM le dit « partiel » (l.27) et aucun G7 ne nomme S-7
    (`git grep -n 'S-7' 87b821b0 -- 'docs/G7-*.md'` ne rend rien). Non compté comme limite, comme dans l'inventaire.
16. **Demandes à MONARK, tranchées le 2026-10-07.** Elles sont parties dans la demande de fusion de ce versement ; MONARK y répond
    (MSG l.4) et écrit ETAT à `5437cd0d`.
    - U-6 (L38) : attribué à PXC-12, partie fixée par son ADR ; déclencheur : le G0 de cette partie, au plus tard la partie 3 de PXC-12 ;
      le DNS et le certificat d'un nom neuf restent au fondateur (ETAT l.262-263 à `5437cd0d`). La dette sort du §1.
    - UKEMI-CONC-FSYNC-1 (N8) : porteur PAROXYSME, sous PXC-12 p1 ; déclencheur : le G0 du prochain lot qui touche les tests à fsync de
      `apps/sentinel/test/ukemi-conc.test.ts`, au plus tard PXC-12 p1 (ETAT l.1835-1839 à `5437cd0d`). La dette sort du §1.
    - E2A-TEXTS-1 (N1) : le texte de case liq de Q-B (iv) part avec la release L, qui publie la table liq ; R4 v3 n'est pas rouvert
      (ETAT l.264 à `5437cd0d`). La question datée du doute 3 est tranchée ; la dette sort du §1 ; le déclencheur devient la release L.
    - D7 (e) (N2) : MONARK forme vers RECHERCHES, dans son prochain envoi, la question « la divulgation p = n de D7 (e) (0004) reste-t-elle
      due sous le contrat 1.1.0 (§12), ou ce contrat la remplace-t-il ? » (INV-U doute 3, l.315-316 ; CC l.405), réponse avant la release
      de textes servis (MSG l.86) ; à défaut de réponse, une ligne d'attente datée reporte N2.
    - LIQ-BAND-EXACT-GUARD-1 (N12) : clôture écrite par MONARK à ETAT l.1694-1698 à `5437cd0d` (preuves au §4).

## 8. Ligne PAROXYSME et sources

**Ligne PAROXYSME (2026-10-07, décisions de MONARK pliées ; second tour le 2026-10-08).** Ukemi : 49 limites ouvertes (38 relevées le
2026-09-27, dont 13 changées ; 11 nouvelles, dont 1 changée, N10), aucune ⚑B ; 2 closes (N11, N12) et 1 obsolète ici (L39, hors pièce).
Registre versé par #242 (fusion `1df4e44f`, ETAT l.181-186 à `5437cd0d`), qui accomplit PAROXYSME-UKEMI-FILE-1 (N10). Limites neuves à
ETAT : aucune pour Ukemi (§5). Aucune dette (§1) : les trois de la G2 sont
tranchées par MONARK le 2026-10-07 (§7, doute 16) : le volet U-6 de L38 est attribué à PXC-12 (ETAT l.262-263 à `5437cd0d`) ;
UKEMI-CONC-FSYNC-1 (N8) a son porteur et son déclencheur (ETAT l.1835-1839 à `5437cd0d`) ; E2A-TEXTS-1 (N1) a pour déclencheur la release
L (ETAT l.264 à `5437cd0d`). Clôture de LIQ-BAND-EXACT-GUARD-1 (N12) écrite à ETAT l.1694-1698 à `5437cd0d`. Lignes d'attente datées
(P-25) de L7, L17, L18, L20, L21 et L22 : ETAT l.270-273 à `5437cd0d`. Ouvert chez MONARK : la question D7 (e) vers RECHERCHES (N2), qu'il
forme dans son prochain envoi (MSG l.86) ; deux questions posées avec la demande de fusion de ce pli, échéance : la recartographie de
PXC-01 partie 2 (F3) : la voie de formation ou de re-formation à ETAT des douze items ni PX-Ukemi ni U-6 (§7, doute 7) ; un seul item ou deux pour
`calibrate` avec Hikae (§7, doute 9). Toutes les entrées ouvertes ont un item, un porteur et un déclencheur atteignable. Procurement
dû : PXP-12 (Wellek), payant (PLAN l.861). Aucune campagne d'Ukemi en cours (INV-U l.331 ; TABLEAU de la boîte).

Fichiers du tronc cités, à `87b821b0` sauf mention (lignes, sha256) :

| Fichier | Lignes | sha256 |
|---|---|---|
| `docs/ETAT.md` | 1 904 | `3190de5c23507292414418cbb8b24e0f7c9f319dca64a0f5ae8c5009475a5b5a` |
| `docs/ETAT.md` à `5437cd0d` (décisions de MONARK pliées le 2026-10-07) | 2 089 | `64afc212a18bc683d892c7c7c6362abba46c1a4ed5db11061f4b25b63d07b0a9` |
| `docs/JOURNAL-PROVENANCE.md` | 466 | `7dfa3f0c8a5da8b0c5ad2807f10b377d03fc1fda895349490c8f834415f16e9f` |
| `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` | 331 | `64aa3e11a87ac59ce633d5191952824d06010970c34b73c749e1c1caa2430c7b` |
| `README.md` | 353 | `6324c8b220ccb5378d5458ca883190b7241b0d3cdbc1e42d9f1697051e58b5ad` |
| `apps/harness/src/tools/gate.ts` | 1 070 | `7920ceaca2ce8231ecc2672b3a1ecd0e3a70c95971e80d225c107159558dadbd` |
| `apps/harness/src/tools/calibrate.ts` | 172 | `765921eca895d81325056041b384d6677d8f80c6149184d896ae1be42b78ba6b` |
| `apps/harness/src/tools/cascade.ts` | 218 | `af3f7c85540693da51e0f4a29f426d4197729f6edc1e76670be3b14107bbedc2` |
| `apps/harness/src/tools/ukemi-predict.ts` | 236 | `89ff6ea2f849dd835cc591754e96d83cb6e75532787fc59f8efa3336f9b6a1bc` |
| `apps/harness/src/tools/registry.ts` | 160 | `ab5a6f8a42a7731d7d8b93973d66b3c5d30d00bfa1159821dba582b917e620a2` |
| `apps/harness/src/policy-marginal.ts` | 68 | `62be1778e9dbdd7a5cdd6cf5c626bbc7b96063dfa2bb0f2265d3965dc32d06b0` |
| `apps/harness/src/policy-retire.ts` | 85 | `71bb678be2df0384262c150c59387a0cb4241bd1f9580e30c92ae6e1cb7c8d01` |
| `spec/contract-1.1.0/policy/liquidation-eligible-coverage.json` | 1 | `3f957fd1b9d8061991637ae463dc95653f279c46bf490fa6c4ebde1c0a097bfd` |
| `apps/site/lib/ukemi-copy.ts` | 244 | `cf3f821b5956a8d6c1e4b9ccefa8e748bc3d328818c30152ec0f7649aa05ad6c` |
| `apps/site/lib/fleet.ts` | 429 | `998fdf33a3c461f687ec604524c63ee739ef1b7dd77acba571523aa979f232f4` |
| `apps/site/lib/ukemi-course-view.ts` | 226 | `df3fed1264f2bd625988715b8a13175b89afac5101433a58ac37ad6a6a129728` |
| `apps/site/components/ukemi-panel.tsx` | 136 | `ace2096e04df9bf868072baf5725371129b68954ca9b2cf2b44e3e7836ce9d4a` |
| `apps/site/app/docs/ukemi/page.tsx` | 204 | `5e8fb81152c5d4a9065ba773da4a92bec04de7e5f5116dfe06cd13a9bbdd3b94` |
| `apps/site/data/ukemi-served.json` | 23 | `286cd472a3ceb0795ce27be37e47bb8398e03175db1dd86bcfe2dfd6250218da` |
| `apps/site/data/ukemi-course.json` | 653 | `308482025556361b849e6d8495d30e25217c333d6abdc8261ad0d156e28703ae` |
| `packages/ukemi/README.md` | 99 | `f1a70b01f5d5c767b23a2ebf9a2bcfe92287c83ee75601a5cfed4ded71c1d95a` |
| `packages/ukemi/src/clearing.ts` | 210 | `29af56a1f8dc89b223dd2ad94c73e0ae2ac0f463c43f0efc21ac498dac7451df` |
| `packages/hikae/src/l1-split.ts` | 244 | `266987175b3398c0017cb89efd7a17bdd7ff48dd8990bce91afe37ce85d1c5c3` |
| `packages/hikae/src/liquidable-24h.ts` | 67 | `eda0fb74fbc3a3386e0eac01658a4ddaa2199f88b055b88d4e90c26f421f61aa` |
| `apps/harness/README.md` | 134 | `733479970acb68981dab5b3146f08ead3c4fdd4bbd8f3e1068d91c66a28baa7c` |
| `skills/monark/SKILL.md` | 79 | `63f52be6a3a6243bab45409fc19d05d88afbed1dfe9236c182501f811e057c8c` |
| `schemas/attested-book.schema.json` | 160 | `8ba71122539f3bd928081fe06b7823c06a8265382290040f142a5eea7205c32b` |
| `apps/sentinel/src/ukemi/record.ts` | 588 | `611339150a871404620364bbbb232594d3bc40e9ed9651655bd772dc5d415d0b` |
| `apps/sentinel/test/ukemi-conc.test.ts` | 431 | `49cf3de5be8fa4fa840b7b16ec63c9b8a6e35a63915f5a6c5d923c2286f81bfe` |
| `docs/adr/ADR-U4-book-et-calibration.md` | 223 | `4c6429fd48c6c273a761eff7a37409754557c481276964b9733d5f7fba67e88c` |
| `docs/adr/ADR-U4b-calibration-episode-frais.md` | 2 524 | `09ce649ed94c166169d9469c8d2e9e2f0b41040289324bc1a48ec275fb4033a0` |
| `docs/adr/ADR-U4b-2b-classe-servie.md` | 447 | `c851e8c24950721cfa24d39f0ebe35482890faa4a6f5c76b9f70a795e1a17b93` |
| `docs/adr/ADR-U5a-producteur-ukemi-predict.md` | 165 | `16354bfe4964edef16a727218f80ba2319c0643b874d9546627d8a7b63da5c5b` |
| `docs/adr/ADR-UKEMI-DIGIT-1.md` | 352 | `6202e075ad33fd3ad03cab6d125245a3a93466ba5b0ad6cc75ac42f250422ef5` |
| `docs/adr/ADR-M020-programme-ukemi.md` | 85 | `87f3c2b2e82a8a308efecefc9adfb30d1dcdb15e2769ad763182da91e47d3c13` |
| `docs/adr/ADR-M003-phase2-integration.md` | 211 | `8905ff900a11f991ea89b5d571dd0fac80cb351c69384e985ef52d191bc1d029` |
| `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md` | 427 | `157a560c08987d24e8c91090aedaa033fc644362f4f29858d55368a67a325a1a` |
| `docs/adr/ADR-U1b-contrat-attestedbook.md` | 107 | `adaf8dc45b49544485e53701767e208ae1c29606446d9e0916b15cd4bcb550c1` |
| `docs/G0-lot-c-prime-b.md` | 81 | `5b449f698c73ae0e669b9d724ddc17b82098d84e7f63345a9919afc07dd61f75` |
| `docs/G7-lot-c-prime-b.md` | 178 | `ff621ffde5123a0d11072f84a7490b1fdc03e74c49c2c0305acb74832a59b253` |
| `docs/G1-lot-t42-bound.md` | 140 | `0d1146dac409687965f566255210b51bd4b78bc237b2c087f9fd7db457dcf2ea` |
| `docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md` | 459 | `f44e0a91c75973e2d1b62874fd988824bf99b7229141ef8f76fc704216f24874` |
| `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md` | 87 | `e844e4ccbe7149c455e8101b2e1d980e3489299b23da996dc5c42dc42b38a6db` |
| `docs/G2-lot-u4b-1b-3-delta.md` | 443 | `12219ce141f3feb2c15db8c9fc87a96d847d3c65ff8d43b90e65ca1676ad5ede` |
| `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md` | 689 | `dcee1282ec9247750215ec7d76091dff5db31039c637fef50cb330950af597f5` |
| `docs/course-ukemi/FAITS-dualaggregator-cutoff-2026-09-22.md` | 16 | `4f23216d84458a73328b2dc7e7d90c5f41f4427cf6995f8af7d89c6bc37eff99` |
| `docs/deploy-CA-harness.json` | 126 | `678d84c8428b8518565e0f00efb6079139b6c3cccee53a04075d4ac62ea8eba7` |
| `scripts/assert-fleet-html.mjs` | 772 | `a3bda751c86c152da49120e6ee374c8c9101848b81a082459fca70a67639dc6e` |
| `scripts/sync-ukemi-served.mjs` (`grep -c -- '--check'` : 0) | 354 | `f3bc5ac4f49b8bd4648653f37f36346bc328fb410c09e5e670fca8f8e71a04f7` |
| `apps/harness/test/gate-liq.test.ts` | 438 | `86dbddd7a973c43965d164b5313de0d48dc4b322fe56d92602c0f4ff554d27ff` |
| `apps/harness/test/gate-liq-artifact.test.ts` | 136 | `c491c38841a79b2232ec52ca00abd52a5a6a88bf409c8159471869036e88a0ac` |
| `apps/harness/test/gate-cell.test.ts` | 156 | `c39ea01c6a4befb16977f5ad5fd8ec8864fc6f0dc02f53bdc4c88cbc17a0e5f5` |
| `apps/harness/test/policy-marginal.test.ts` | 84 | `2889481023181299e7344c184252bb6c2135bee7b9f4deb787a950f10d493785` |
| `test/h5-e2e-probe.test.ts` | 232 | `3d44895d608209a81b1446af12442d15f16c3f27787e345df3686c8a393d735c` |
| `test/fleet-ukemi-liq-leg.test.ts` | 40 | `6d1bd1685e65a760ed5fdcf4ca081567aa100cf1a208b44187c6f5055399623b` |
| `docs/PAROXYSME-Dojo.md` | 853 | `56c3762e7ae9acd4fc3f8e0850a3750b343c4cb6f5968408f79d94503779674a` |

Sources hors du tronc (branche du versement et boîte PAROXYSME) :

| Source | Lignes | sha256 |
|---|---|---|
| `docs/PAROXYSME-Harnais.md`, branche du versement à `0967bef` | 706 | `91e14cb7be4476df49edcd1673b8fd55c78960e2e1edbfb5cd067517ac1d8444` |
| `docs/PAROXYSME-Hikae.md`, branche du versement à `0967bef` | 507 | `afdf1dc2b9049e71a06d22bc956f05b17dd33010649457fdb4fee0d8f453f61c` |
| `docs/PAROXYSME-Hikae.md`, branche du versement à `11d2a34` | 599 | `38ca29f85d6684caa6bcfafb1c91865d3c0b042a049e054eecae47c7be18c003` |
| INV-U, boîte PAROXYSME, `dossier/etude-2026-10-06/inventaire/` | 332 | `21f9fb29b93292ad011d39efa172d15db0d161d900c3572901d4658ff8434dc2` |
| `INVENTAIRE-Hikae.md`, même dossier | 309 | `80b092d90f8c709e966906455eb015d7c5bb1ea459dfc7b1b706e83be8186ed5` |
| `INVENTAIRE-Moteur.md`, même dossier | 350 | `d724157e6f458e9dbc9fbd807bd364a825060b476e95526a51520fdf6ebf99ed` |
| `INVENTAIRE-Harness.md`, même dossier | 158 | `111ad4e4bdc068c865c502f6b773e982faa728d65b5648e8b92b6969b182e128` |
| CC, boîte PAROXYSME `dossier/etude-2026-10-06/CHANTIERS-CANDIDATS.md` | 1 260 | `86ed73a23b0bfd8e2da5ea40de3818ae8a105a7d406c6bc0607fb8914c5dcc60` |
| PLAN, même dossier, `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` | 1 195 | `96b5b01858886906930f8be6e76094294dd71a9878a34b9b71804a160a645714` |
| REG-27, boîte PAROXYSME `dossier/etude-2026-09-27/PAROXYSME-Ukemi.md` | 254 | `c3f29a5364283de544b8f93c4893d7ac389e601b8538e75477a49f86062dd266` |
| `dossier/REDACTIONS.json`, boîte PAROXYSME | 81 | `787173d1eee46adda38246bad5376d333d2fba5f2ae78b97716c14b883364b90` |
| `coordination/pieces/2026-10-07-registres/reanchor.mjs`, commit `a55a62d` | 69 | `2edae6398e35a39d750cca2951cf4349380971066acb23bd1dbe965d9f88ca4b` |
| `verify-registres.mjs`, même dossier, commit `1fd31ee` | 121 | `284a5ceda26073d5c46f0f5465b9410d221a1f9f475722eda3507e4cba17531e` |
| `verify-registres.mjs`, même dossier, commit `d97d838` | 127 | `6d71141222d2c32b995cd30e11335501e7021f4b2c7a38fb25053a61efe8712b` |
| `verify-registres.mjs`, même dossier, commit `84bc889` | 134 | `c379f14aae48b7e44add4ad52cf9baa6b710cd0cc6b97c8772dc1dbbc9aeeb48` |
| `PLI-Ukemi.md`, même dossier, commit `4d95a00`, pli de la G2 du versement | 48 | `85aa368b44dcc81db43c12aafe25602cb4e66782d3afd408ab5182a5705977a4` |
| `coordination/TABLEAU.md`, boîte PAROXYSME à `150c997` | 54 | `1fac9ba1b7d36fe02db804d0279a7f83f2d507da4f97553695a3b503cf1ddd6e` |
| `coordination/JOURNAL.md`, boîte à `150c997` (fondateur : l.13, l.15) | 18 | `3e2a9572843ac3fbffe3f0a2fd26249fc0780d69c03e9ab2bcfa6c43f6d1ae4e` |
| ordre de mission n° 1, `coordination/messages/`, boîte PAROXYSME | 95 | `2e8cfd33c12de9d27b673c377e72a9a43da5dcb05c24e0094e744b7f3933c102` |
| message `07d99e2` (MONARK, tâche 1 : règles acceptées, deux faits), même dossier | 23 | `ef1cded000da48460b4d5cf84793cd47a4e19f704a554887fba0ce491ed2672d` |
| MSG, message `d6331f6` (MONARK : #242 fusionnée, ses décisions), même dossier | 90 | `03f305908703f119cc82c7b9f0a29684f720c0eab0997514c019fe068b64306a` |

Non lus ici (dépôt de RECHERCHES, hors de la portée de PAROXYSME) : C et 0004, que l'inventaire a lus aux sha256 de 12 caractères
`ac8187fa7662` et `599ad45d561f` (INV-U l.74-76) ; leurs lignes citées ici sont celles de l'inventaire (§7, doute 1).
