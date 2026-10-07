# PAROXYSME-Narabi : registre intérimaire des limites de Narabi (détection de run de rachat, `AttestedFlow`)

- **Objet** : versement intérimaire (a′) du plan de route PAROXYSME v3 (§4.1 A, §6 « Transition ») : la pièce `built` Narabi reçoit son
  registre, tiré de son inventaire validé. La décision Q-A.2 du fondateur y entre comme entrée datée, en tête du §2 (ordre de mission
  n° 1, l.60-61).
- **Règle** (règles « Dettes » et « PAROXYSME » de l'investisseur ; décision 251 rappelée par `docs/PAROXYSME-Dojo.md`) : une limite
  déclarée n'est jamais une fin ; elle mène à un item, à une campagne, puis à une décision. Ici, chaque entrée ouverte porte un item, un
  porteur et un déclencheur ; ce qui ne se reproduit pas tel quel à la tête va à un doute nommé (§7).
- **Provenance** : écrit par un worker de PAROXYSME (`claude-opus-5-5`, effort max, contexte frais) le 2026-10-07 à partir de 17:28 UTC,
  tâche 1 du tableau MONARK ↔ PAROXYSME. Sources : l'inventaire validé de Narabi (dossier d'étude du 2026-10-06), la couverture de
  `CHANTIERS-CANDIDATS.md` §4 et les fenêtres du plan v3 §4 (chemins et empreintes au §8). Relecture : une G2 par une instance neuve ;
  contrôle par diff, fusion et ligne d'ETAT : MONARK.
- **Bases** : inventaire mesuré à `d8fe354c` ; ETAT lu à `57a131fc`, comme `apps/harness/src/policy-retire.ts` (né entre les deux,
  `f2152918`). Toutes les ancres de ce registre sont à la tête `87b821b0` de `lot/etude-suite` (`origin/lot/etude-suite` du clone, sans
  réseau), reportées par l'outil `reanchor.mjs` (pièce de la boîte PAROXYSME, commit `d2332e2`) : les 18 ancres d'ETAT de l'inventaire
  gardent leur texte et 16 changent de numéro ; hors d'ETAT, aucune ancre n'est dans un hunk changé, et deux ancres de
  `docs/RUNBOOK-sentinel.md` se déplacent au même texte (§7, doute 9).
- **Préséance** : `docs/ETAT.md` l.7-11 ; ETAT prime. Un item nommé hors d'ETAT et du code n'est pas compté comme formé : il est écrit
  « à former » ou « à re-former à ETAT » et porté par son chantier.
- **Labels** : aucun ne change (`built` de Narabi, `apps/site/lib/fleet.ts:210`) ; `apps/site/lib/fleet.ts` n'est pas touché par ce
  versement. La décision Q-A.2 (la jambe « attested » passe `upcoming`) s'applique par le noyau de PXC-02 (tâche 2 du TABLEAU), texte
  seul ; le champ `status` de la pièce n'est pas touché ici (PLAN §11, point ouvert (i), l.1177-1180).

## 0. Comment lire ce registre

- **Une entrée par limite**, ouverte par le préfixe `- **`, sur quatre lignes logiques au plus (forme de `docs/PAROXYSME-Dojo.md` §0),
  coupées en lignes de 160 caractères au plus comme au registre du Harnais (§7, doute 14).
- **Étiquettes** : celles de l'inventaire, inchangées : `L1` à `L37` (la fiche du 2026-09-27, L1 à L36, puis L37) et `N01` à `N22`
  (limites nouvelles) ; `NRT-nn` numérote les limites trouvées à la tête (§5). Ce sont des numéros de ligne de registre, jamais des
  items, et aucune n'apparaît dans un champ « item ».
- **Champs** : limite (25 mots au plus) ; source (fichier et ligne à `87b821b0`) ; touche (texte public que la limite qualifie) ; nature ;
  item ; porteur ; déclencheur ; état ; suite.
- **Natures** (celles de l'inventaire) : T théorie · M mesure · D donnée · P dépendance · Dr droit ou preuve · C capacité ; « texte » : une
  phrase publique. ⚑B : écart à la règle « Branchement » que l'inventaire marque (INV l.110-112).
- **Item, porteur, déclencheur** (règles acceptées par MONARK, message `07d99e2` de la boîte, qui répond à `d4b3d07`) :
  - un item formé à ETAT est cité avec sa ligne à la tête, et garde le porteur et le déclencheur qu'ETAT lui écrit ;
  - une limite que `CHANTIERS-CANDIDATS.md` §4 rattache à un chantier prend ce chantier pour item de porteur (`PXC-nn`, sa partie, et
    l'item que la partie forme) ; porteur : PAROXYSME, qui porte les chantiers (TABLEAU de la boîte, décision de MONARK du 2026-10-07),
    MONARK gardant l'ordre et l'attribution ; déclencheur : la partie et sa fenêtre au plan v3 §4 ;
  - les deux sont écrits quand les deux existent ; une lecture sur place ou un acte d'hôte a pour porteur MONARK, un acte hors
    délégation le fondateur (par MONARK).
- **Fenêtres du plan v3 §4** : F1 = §4.1, semaine du 2026-10-07 ; F2 = §4.2, du 2026-10-14 au service de la vague 1 (vers le
  2026-10-20) ; F3 = §4.3, du 2026-10-21 au 2026-11-16 ; F4 = §4.4, du 2026-11-17 au 2026-12-31 ; F5 = après le 2026-12-31, avec ligne
  d'attente datée au versement (plan §4.4, dernier alinéa).
- **États** : `ouvert` ; `changé` (l'état à la tête diffère de l'inventaire, dit en suite) ; `clos (preuve : …)`.
- **Abréviations** : ETAT = `docs/ETAT.md` ; INV = `INVENTAIRE-Narabi.md` (lignes du fichier) ; CC = `CHANTIERS-CANDIDATS.md` ; PLAN =
  `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` ; M009, M012, M014 = `docs/adr/ADR-M009-aci-tracker.md`,
  `docs/adr/ADR-M012-narabi-live-sentinel.md`, `docs/adr/ADR-M014-edetector-preregistration.md` ; OPS-1 = `docs/adr/ADR-NARABI-OPS-1.md` ;
  ADR-N2 = `docs/adr/ADR-NARABI-2.md` ; ADR-K1 = `docs/adr/ADR-K1-attesteur-narabi.md` ; ADR-CM = `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` ;
  RB-S = `docs/RUNBOOK-sentinel.md` ; JP = `docs/JOURNAL-PROVENANCE.md` ; PLAN-M008 = `docs/PLAN-m008-f2b-usde.md` ; G1-L =
  `docs/G1-lot-narabi-l.md`. Hors du tronc (§7, doute 1) : C = `kata/spec/CONTRACT-1.1.0.md` (dépôt de RECHERCHES) ; TH-1 = synthèse
  NARABI-THEORY-1 ; SN-1 = synthèse NARABI-1 ; PROVER = preuves C-PX2-b v2 et PROVER-2 v2, avec leurs G2 ; FAITS-POR = FAITS Ethena PoR du
  2026-09-27 ; PROC = procurements du 2026-09-27 ; REG-0927 = registre d'étude du 2026-09-27 (boîte PAROXYSME,
  `dossier/etude-2026-09-27/PAROXYSME-Narabi.md`).

## 1. Dettes : limites sans item, sans porteur ou sans déclencheur

- Aucune. Chaque entrée ouverte des §2, §3 et §5 porte un item, un porteur et un déclencheur ; le contrôle est mécanique (§7, doute 15).

## 2. Limites de la fiche du 2026-09-27 : ouvertes ou changées (32, INV §4.1)

**Entrée datée, en tête** (ordre de mission n° 1, l.60-61) : la décision Q-A.2 du fondateur porte sur la jambe « attested onchain flow »,
celle de L15.

- **L15** · « La jambe « attested onchain flow » sert l'attesteur `ethena-por` à clé `deadbeef` ; Ethena n'atteste pas ce flux. »
  source : `apps/sentinel/src/flow.ts:52` ; ADR-K1 l.10 ; `apps/harness/test/gate.test.ts:463-471` · touche : `apps/site/lib/fleet.ts:209`,
    `:216-225` ; `README.md:113`, `:125`, `:186`, `:252` ; `skills/monark/SKILL.md:68` ; `apps/site/lib/narabi-copy.ts:12` · nature : D/P · ⚑B
  item : PXC-02 PUBLIC-SENTENCES-2, partie 1, noyau (bornage du texte, PLAN §5.1 (a)) ; PXC-03 NARABI-K1, parties 1 à 3 (K-1, à re-former
    à ETAT) · porteur : PAROXYSME ; clé K-1b : le fondateur · déclencheur : tâche 2 du TABLEAU (F1) pour le texte ; PXC-03 p1-p2 en F3, p3 en F4
  état : changé, entrée datée : DÉCISION FONDATEUR du 2026-10-07 à 14:4x UTC, Q-A.2 « Passe « upcoming » (Recommandé) » (JOURNAL de la
    boîte, l.14 à `887c0f6`) : cette jambe passe `upcoming` · suite : `status` et `fleet.ts` non touchés ici ; go d'envoi du site : fondateur

**Les autres limites de la fiche, dans l'ordre de l'inventaire.**

- **L1** · « Instrument : « A third way … no bound is claimed » ; aucune garantie séquentielle sous échangeabilité n'est établie. »
  source : `README.md:121` ; `apps/sentinel/README.md:32` ; TH-1 l.12-16, l.22 · touche : `README.md:121`, `:67` (`instrument.json`) ;
    `apps/sentinel/README.md:32` · nature : T
  item : PXC-04 NARABI-SERVED-2, partie fixée par son ADR (NARABI-THEORY-1-SUITE, à former) · porteur : PAROXYSME ; Q1 : le fondateur ·
    déclencheur : l'ADR de PXC-04, avant sa partie 1 (F2) ; les lectures après les procurements P1-2 à P1-10 (PLAN §4.5)
  état : changé (TH-1 rendue : p valide sur bloc clos, obstacle séquentiel ; textes inchangés à la tête) · suite : prix estimé 3,5 à
    4,5 j (CC l.193-194) ; Q1 : A niveau seul, ou B niveau et ordre (TH-1 l.89)
- **L2** · « Test d'échangeabilité intra-échantillon, valable sur une séquence close, sans validité séquentielle. »
  source : M014 l.30-31, l.128-131 ; TH-1 l.16 · touche : aucune (ADR, documentation) · nature : T
  item : PXC-04 NARABI-SERVED-2, partie fixée par son ADR (NARABI-THEORY-1-SUITE, à former) · porteur : PAROXYSME · déclencheur : l'ADR
    de PXC-04, avant sa partie 1 (F2) ; les lectures après les procurements P1-2 à P1-10 (PLAN §4.5)
  état : changé (TH-1 l.16 : H₀ de la sous-suite calme non établie, voir N11 ; générateur, voir N10) · suite : un seul regard tenu
    (M014 l.128-131)
- **L3** · « Rien n'est revendiqué sur le délai de détection ni sur l'optimalité, faute de données i.i.d. »
  source : M014 l.63-64 ; TH-1 l.78 · touche : aucune aujourd'hui (phrase D3, non publiée) · nature : T
  item : PXC-04 NARABI-SERVED-2, partie fixée par son ADR (NARABI-THEORY-1-SUITE, à former) · porteur : PAROXYSME · déclencheur : l'ADR
    de PXC-04, avant sa partie 1 (F2) ; le procurement P2-7 de TH-1
  état : changé (« non revendiqué » établi, « impossible » non établi, TH-1 l.78) · suite : item (a) de M014 l.94-95 (documentation)
- **L4** · « Classe pré-dérive p₀ = 0,30 choisie sur les données de calibration : « aucune borne in-sample ». »
  source : M014 l.44 ; `apps/sentinel/src/instrument.ts` (inchangé) · touche : aucune aujourd'hui (phrase D3 de NARABI-L-2) · nature : T
  item : PXC-04 NARABI-SERVED-2, partie 1 (NARABI-L-2, à re-former à ETAT ; PX-Narabi-3 du REG-0927) · porteur : PAROXYSME ; ligne
    d'ETAT : MONARK · déclencheur : partie 1 de PXC-04 en F2 (échéance 2026-10-18, M012 l.253, re-formée à ETAT ; PLAN §4.2)
  état : ouvert · suite : P-PX3-a libre (arXiv:1912.11436v4) ; P-PX3-b détenu (PROC l.88)
- **L5** · « « rolling90 carries no false-alarm control » ; le « ≈ 2,5 % par fenêtre » reste [abs]. »
  source : M014 l.111 ; M012 l.95 ; ADR-N2 l.81 ; PROVER-2 v2 · touche : `README.md:127-131` (critère rolling90) · nature : T/M
  item : PXC-04 NARABI-SERVED-2, partie 5 (S3 certifiée ; N2-2, à former) · porteur : PAROXYSME · déclencheur : partie 5 de PXC-04 (F4)
  état : changé (ARL(0,30) ∈ [750 ; 932] paires calmes, PROVER-2 v2 certifié, hors du tronc) · suite : procurements P-PX4-c, -d, -e, -i
    (nulle markovienne), envoi non établi (NARABI-1-DEMANDES-ENVOI-1, PLAN §7.1)
- **L6** · « « no coverage is measured » ; la paraphrase « calibration windows and the next one » est déclarée inexacte. »
  source : `apps/harness/src/tools/gate.ts:125-132` (phrase à la l.130) ; SN-1 §4 n°1 ; C l.500-501 · touche : `README.md:116-118` ;
    `skills/monark/SKILL.md:65-66` ; `spec/contract-1.1.0/policy/stable-run-velocity-24h.json` (`text`) · nature : T
  item : NARABI-POLICY-TEXT-REV-1 (ETAT l.768-774) ; PXC-04 NARABI-SERVED-2, partie 4 (révision datée S1 ; C-PX1-c, à former) · porteur :
    RECHERCHES (texte, ETAT l.772) ; PAROXYSME (chantier) · déclencheur : PXC-04 partie 3, après R-b (ETAT l.772-773) ; partie 4 en F4
  état : changé (item formé à ETAT depuis l'inventaire ; même limite que NRT-01) · suite : gel S1 hors du tronc (§7, doute 2), à refaire
    sur le contrat 1.1.0 ; `docs/biblio/ukemi-modeL/L-lecture-tibshirani2019-barber2023.md` l.11, l.14, l.17 non nuancé
- **L7** · « Dépendance sérielle des paires chevauchantes non modélisée, diagnostiquée par thinning : diagnostic, jamais garantie. »
  source : PLAN-M008 l.98-100 · touche : texte servi de la classe (`README.md:116-118`) · nature : T
  item : NARABI-POLICY-TEXT-REV-1 (ETAT l.768-774) ; PXC-04 NARABI-SERVED-2, partie 4 (C-PX1-c, à former) · porteur : RECHERCHES (texte,
    ETAT l.772) ; PAROXYSME (chantier) · déclencheur : PXC-04 partie 3, après R-b (ETAT l.772-773) ; partie 4 en F4
  état : changé (item formé à ETAT) · suite : S1 v2, gelée hors du tronc, ajoutait « consecutive pairs share a window » (ADR-N2 l.22)
- **L8** · « « not a per-window coverage, not a probability » : seule la borne ABB 2024 Thm 1 est revendiquée. »
  source : `README.md:125`, `:128-131` ; `apps/site/lib/narabi-copy.ts:74` ; PROVER C-PX2-b v2 l.6 · touche : `README.md:125`, `:128-131` ;
    `apps/site/lib/narabi-copy.ts:74` · nature : T
  item : PXC-04 NARABI-SERVED-2, partie 5 (instrument à pas constant ; C-PX2-c, à former) · porteur : PAROXYSME · déclencheur : partie 5
    de PXC-04 (F4)
  état : changé (pas décroissant officiel : borne ≤ 0,10 réfutée pour T ≥ 123, T ∈ [90, 122] non tranché, PROVER v2) · suite : la
    phrase publique reste vraie ; item T ∈ [90, 122] (PROVER v2 l.6)
- **L9** · « La borne publiée est vide pendant environ 5 ans à ε = 0,1. »
  source : M012 l.159 ; `packages/hikae/src/tracker.ts` (inchangé) · touche : `README.md:125` ; `apps/site/lib/narabi-copy.ts:30-34` ·
    nature : T
  item : PXC-04 NARABI-SERVED-2, partie 5 (C-PX2-d, lectures libres, à former) · porteur : PAROXYSME · déclencheur : partie 5 de PXC-04 (F4)
  état : ouvert · suite : Bhatnagar et al., DtACI, Zaffran et al. libres, non lus ; changer c ou ε ouvre un segment neuf (M012 D6)
- **L10** · « c, ε, t₀ « déclarés non fondés » ; bang-bang mesuré en calme (49 régions vides sur 613 pas). »
  source : M009 l.54-56 ; PROVER v2 §3 · touche : aucune (ADR, documentation) · nature : T
  item : PXC-04 NARABI-SERVED-2, partie 5 (instrument à pas constant ; C-PX2-c, à former) · porteur : PAROXYSME · déclencheur : partie 5
    de PXC-04 (F4)
  état : changé (règle η = B/(δw − 1) certifiée pour un pas constant, PROVER v2 §3) · suite : paramètres officiels inchangés
- **L11** · « Prévision par persistance, base déclarée, qu'un modèle sourcé remplacerait par classe. »
  source : `packages/monark/src/adapter-narabi.ts:8-9`, `:32-34` · touche : `README.md:113-114` ; `apps/site/lib/fleet.ts:209` · nature : T
  item : PXC-17 DOMAINE-PX-2, partie 1, campagne D1 (PX-Narabi-5 du REG-0927, à former) · porteur : PAROXYSME · déclencheur : campagne D1
    en F3, après le service de la vague 1 (PLAN §4.3)
  état : ouvert · suite : Liu-Makarov-Schoar, JFE 184, art. 104359 ; Gorton-Zhang libre (PLAN §7.1) ; go de téléchargement
- **L13** · « Les dépegs du marché secondaire sont invisibles au flux primaire ; `cross_venue_gap` n'est jamais émis. »
  source : `apps/sentinel/src/flow.ts:56` · touche : `README.md:186` · nature : C/D
  item : PXC-17 DOMAINE-PX-2, partie 1, campagne D1 (PX-Narabi-6 du REG-0927, à former) · porteur : PAROXYSME · déclencheur : campagne D1
    en F3, après le service de la vague 1 (PLAN §4.3)
  état : ouvert · suite : Ma-Zeng-Zhang, NBER WP 33882 : libre (PLAN §7.1), revue NON TROUVÉE (CC l.545)
- **L14** · « `ap_capacity_unknown` est émis sur toute ligne : la capacité de rachat du contrat émetteur n'est pas lue. »
  source : `apps/sentinel/src/flow.ts:56` ; ADR-K1 l.138 ; FAITS-POR §4 (b) · touche : `README.md:252` ; `apps/site/lib/fleet.ts:209` ·
    nature : D
  item : PXC-03 NARABI-K1, partie 3 (PX-7, à former ; ADR-K1 l.138 le place au G7 de K-1b) · porteur : PAROXYSME ; lecture sur place de la
    source vérifiée d'EthenaMinting V2 : MONARK · déclencheur : partie 3 de PXC-03 (F4) ; la lecture sur place avant (PLAN §7.2)
  état : ouvert · suite : `maxRedeemPerBlock` non lu ; construction ≈ 300 lignes (ADR-K1 D2 (i), estimation de l'inventaire)
- **L16** · « Confiance aux fournisseurs RPC : quorum à deux sans départage ; Pocket rend vide sans erreur. »
  source : `apps/sentinel/src/rpc.ts` (inchangé) ; M012 l.242, l.245-248 ; `apps/sentinel/src/flow.ts:9-11` · touche : `README.md:133-135` ·
    nature : P
  item : PXC-07 TRUSTLESS-READ-2, partie 1 (campagne R3) et partie 3 (NARABI-QUORUM-TIEBREAK-1, à re-former à ETAT) · porteur : PAROXYSME ·
    déclencheur : campagne en F3 ; partie 3 en F5, avec ligne d'attente datée au versement (PLAN §4.4)
  état : ouvert · suite : jambe payante noire (N04) : pool sans clé seul ; Yellow Paper : version datée NON TROUVÉE (P-PX8-a)
- **L17** · « Une réécriture est détectable, jamais certifiée ; l'antériorité n'a pas d'horodatage tiers. »
  source : `apps/sentinel/src/timeline.ts:4` ; M012 l.162 (item (g)) · touche : `apps/site/lib/narabi-copy.ts:21` ; `README.md:137` ·
    nature : Dr
  item : PXC-15 LOG-TIME-2, partie 3 (ancre tierce de la timeline ; PX-Narabi-9 du REG-0927, à former) · porteur : PAROXYSME ; actes
    `ots` : MONARK · déclencheur : partie 3 de PXC-15, sous Q-7 (F3 ; Q-7 avant le 2026-11-16, PLAN §7.3)
  état : ouvert · suite : réemploi d'ADR-BELL-OTS-ANCHOR-1 ; Crosby-Wallach, RFC 6962 et 9162 détenues ; Haber-Stornetta reçu (PXP-05)
- **L18** · « L'`attested_flow_sha256` de la sentinelle diffère de celui de l'enregistreur pour la même fenêtre. »
  source : `apps/sentinel/src/flow.ts:5-7` · touche : aucune · nature : D
  item : PXC-15 LOG-TIME-2, partie 3 (PX-Narabi-9 (b) du REG-0927, à former) ; volet PXC-03 NARABI-K1 (partie non nommée) · porteur :
    PAROXYSME · déclencheur : partie 3 de PXC-15, sous Q-7 (F3)
  état : ouvert · suite : consigner deux instants `observed_at` sans deux empreintes divergentes (REG-0927 l.179-180)
- **L19** · « Le rejeu du tracker dépend de `Math.pow`, épinglé sur Node : « anyone can replay it » dépend du moteur. »
  source : `packages/hikae/src/tracker.ts:79` ; `apps/sentinel/src/edetector.ts:61-63` ; ADR-N2 l.41, l.212 · touche : `README.md:61`,
    `:125`, `:133-135`, `:231-232` · nature : C
  item : PXC-04 NARABI-SERVED-2, partie 2 (S4′, N2-1b, à former) ; PXC-02 PUBLIC-SENTENCES-2, partie 1, noyau (README l.61 et l.125,
    PLAN §5.1 (a)) · porteur : PAROXYSME ; lecture sur place d'ECMA-262 : MONARK · déclencheur : tâche 2 du TABLEAU (F1) pour le texte ;
    partie 2 de PXC-04 (F3), avec la garde de la sentinelle
  état : ouvert · suite : `sentinel_sha` change au redéploiement (PLAN §4.3) ; release du miroir pour le README : acte du fondateur
- **L20** · « Un rapport sous 1e-12 est tronqué à 0 : « NOT a general exactness claim ». »
  source : `packages/monark/src/adapter-narabi.ts:75` · touche : `README.md:133-135` · nature : C
  item : PXC-04 NARABI-SERVED-2, partie 2 (S4′, « exact integer arithmetic », à former) · porteur : PAROXYSME · déclencheur : partie 2 de
    PXC-04 (F3), avec la garde de la sentinelle
  état : ouvert · suite : « levable par spécification » (SN-1 §2 PX-10), non fait
- **L21** · « Sélection dépendante de l'issue si l'indisponibilité RPC corrèle avec le stress (manquants non aléatoires). »
  source : M014 l.96 ; SN-1 §2 PX-11 · touche : aucune aujourd'hui (section `non_evaluable` de NARABI-L-2) · nature : M
  item : PXC-04 NARABI-SERVED-2, partie 1 (NARABI-L-2, à re-former à ETAT ; C-PX11-a et -b, à former) · porteur : PAROXYSME ; ligne
    d'ETAT : MONARK · déclencheur : partie 1 de PXC-04 en F2 (échéance 2026-10-18, M012 l.253, re-formée à ETAT ; PLAN §4.2)
  état : changé (prémisse fausse : retard, jamais saut ; test `sentinel_gap_is_lag_not_skip`, `apps/sentinel/test/sentinel.test.ts:208`) ·
    suite : la correction de M014 l.96 n'est pas portée
- **L22** · « Seuil q99 à support 6 ; critère ρ « déclaré, jamais un théorème » ; la citation « Vovk et al. 2016, §5.2 » ne se vérifie pas. »
  source : PLAN-M008 l.82 ; `apps/harness/src/calibration.ts:164-173` (l.171) · touche : provenance servie (`calibration.ts:164-173`) ·
    nature : T/M
  item : PXC-04 NARABI-SERVED-2, partie fixée par son ADR (q99 ; PX-Narabi-16 du REG-0927, à former) · porteur : PAROXYSME ·
    déclencheur : l'ADR de PXC-04, avant sa partie 1 (F2) ; le procurement Drees 2003 (PLAN §7.1)
  état : ouvert · suite : §5.2 absente de COPA 2016 (INV l.175) ; de Haan-Ferreira reçu (PXP-22, CC l.1201)
- **L23** · « « a dead probe is silent — no dead-man switch yet » ; son déclencheur « G0 T-1b » est passé sans clôture. »
  source : RB-S l.682 (l.678 à la base) ; `README.md:68` (Bell servi) · touche : aucune (interne) · nature : C
  item : PXC-05 SERVED-CONTROL-1, partie 3 (dead-man croisé ; C-PX12-a, à former) · porteur : PAROXYSME ; acte sur l'hôte : MONARK ·
    déclencheur : partie 3 de PXC-05 (F3 ; PLAN §4.3 l.589-590)
  état : ouvert, déclencheur passé · suite : T-1b de Bell est passé (Bell servi) ; aucune clôture écrite de l'item du RUNBOOK
- **L24** · « Modes résiduels déclarés : un jour au-delà de 300 s (A-prime), (ii), (iii) ; « decision 109 is REDUCED, not lifted ». »
  source : OPS-1 l.127 · touche : aucune · nature : C
  item : PXC-05 SERVED-CONTROL-1, partie 3 (C-PX12-b, à former) · porteur : PAROXYSME · déclencheur : partie 3 de PXC-05 (F3), ou avant si
    un critère pré-enregistré tire (`max_day_ms` > 60 000, REG-0927 l.73)
  état : ouvert · suite : livre SRE en ligne : lecture sur place de MONARK (PLAN §7.2)
- **L25** · « `state_mismatch` transitoire entre deux lectures, réparé au tir suivant (résiduel déclaré C-NB-4). »
  source : OPS-1 l.109-110 · touche : aucune · nature : C
  item : PXC-05 SERVED-CONTROL-1, partie 3 (C-PX12-c, à former) · porteur : PAROXYSME · déclencheur : partie 3 de PXC-05 (F3), ou avant au
    premier faux `state_mismatch` (REG-0927 l.74)
  état : ouvert · suite : publication atomique de plusieurs fichiers à chercher (REG-0927 l.201-203)
- **L26** · « Liage verbatim de la liste `endpoints` servie perdu : « résiduel ACTIF jusqu'au pli §11-1 ». »
  source : OPS-1 l.243 ; ETAT l.880-888 · touche : aucune · nature : C
  item : SENTINEL-GUARD-ARMING-1 (ETAT l.880-888) ; PXC-05 SERVED-CONTROL-1, partie 3 (armement) · porteur : MONARK (ETAT l.887) ;
    PAROXYSME (chantier) ; le fondateur (P-3) · déclencheur : le G7 du pli §11-1 (ETAT l.880) ; P-3 ou décision du fondateur (ETAT l.886-887)
  état : changé (pli §11-1 et 2ᵉ redéploiement jamais faits, ETAT l.880-885) · suite : PXC-05 partie 3 en F3 (PLAN §7.3 : avec la console)
- **L27** · « H-FACT n'est pas établie ; le plancher du VPS est périmé (résiduel déclaré). »
  source : OPS-1 l.226, l.248 ; ETAT l.886 · touche : aucune · nature : P
  item : SENTINEL-GUARD-ARMING-1 (ETAT l.880-888) ; PXC-05 SERVED-CONTROL-1, partie 3 · porteur : MONARK (ETAT l.887) ; le fondateur
    (P-3, compte) · déclencheur : P-3 lu sur place par le fondateur à la console, ou sa décision de laisser la jambe noire (ETAT l.886-887)
  état : changé (renvoyé à P-3, ETAT l.886) · suite : acte de compte du fondateur, avec PXC-05 partie 3 (PLAN §7.3)
- **L28** · « Dégradation silencieuse sans clé « accepted over refuse to start » : c'est le mode servi depuis la ligne du 2026-09-23. »
  source : OPS-1 l.161-163 ; ETAT l.880-885 ; JP l.417, l.429 · touche : `README.md:66` (timeline servie) · nature : C
  item : SENTINEL-GUARD-ARMING-1 (ETAT l.880-888) ; PXC-05 SERVED-CONTROL-1, partie 3 · porteur : MONARK (ETAT l.887) ; le fondateur
    (P-3) · déclencheur : le G7 du pli §11-1 (ETAT l.880) ; P-3 ou décision du fondateur (ETAT l.886-887)
  état : changé (garde sans clés de cycle, `chainstack_guard: "unconfigured"`, 7 points, ETAT l.881-884) · suite : deux redéploiements
    sans armement (JP l.417, l.429)
- **L29** · « Comportement de systemd « NOT verified … no source consulted » ; mentions [abs] et [2nd] au RUNBOOK. »
  source : RB-S l.164-165, l.167, l.236 ; `docs/dojo/FAITS-systemd-path-2026-09-27.md` (`.path` seul) · touche : aucune (interne) ·
    nature : P
  item : PXC-05 SERVED-CONTROL-1, partie 3 (relevé `systemctl --version` ; PX-Narabi-13 requalifié, à former) · porteur : PAROXYSME
    (chantier) ; MONARK (relevé d'hôte, lecture sur place) · déclencheur : partie 3 de PXC-05 (F3) ; la lecture sur place avant (PLAN §7.2)
  état : ouvert · suite : freedesktop 418/403 non contourné ; pages Ubuntu à la version de l'hôte (INV l.182)
- **L30** · « Mutants X8 et X10 survivants, « équivalent sur cet hôte » ; le gel N2-3 qui les tue n'est pas au tronc. »
  source : G1-L l.589-592 ; gel `cb476f8e` (hors du clone, §7, doute 2) · touche : aucune · nature : C
  item : PXC-04 NARABI-SERVED-2, partie 2 (N2-3, à former ; décision P-28 sur le gel, PLAN §4.1 A) · porteur : PAROXYSME ; la décision sur
    le gel : MONARK · déclencheur : décision P-28 au plus tard le 2026-10-12 ; partie 2 de PXC-04 (F3), avec la garde de la sentinelle
  état : ouvert · suite : redéploiement (`sentinel_sha` change) ; recouvrement du gel avec le tronc : `JOURNAL-PROVENANCE.md` seul (INV l.183)
- **L32** · « Les appels `/gate` par classe ne sont pas observables ; seuls des comptes agrégés de `POST /gate` se lisent. »
  source : M012 l.188 ; ETAT l.129, l.1458-1463 · touche : aucune · nature : C
  item : PXC-16 HARNESS-NEXT-1, partie 1 (HARNESS-DEMAND-J30-1, à re-former ; question fermée Q-H2) · porteur : PAROXYSME ; lecture du
    journal sur l'hôte : MONARK · déclencheur : lecture D8 le 2026-10-18 (J+30), en F2 ; Q-H2 en F2
  état : changé (4 `POST /gate` de 2 clients en 7 jours, ETAT l.129, l.1461-1462) · suite : renvoi PX-Harness-10 (registre du Harnais) ;
    PX-Narabi-15 du REG-0927 y est absorbé sous Q-H2 (§6)
- **L33** · « P(B_t < 0) passe de 35 % à 49,1 % par bruit binomial, chiffre [abs]. »
  source : M009 l.123-124 · touche : aucune · nature : T
  item : PXC-10 CM-5-RETIRE-1, partie 3 (`B_t` selon la décision Q4 ; item (a) de M009, mesure sur traces S2, à re-former) · porteur :
    PAROXYSME ; la décision Q4 : le fondateur · déclencheur : partie 3 de PXC-10 (F4)
  état : ouvert · suite : traces S2 jamais faites, déclencheur à refaire (CC l.360-361)
- **L34** · « La borne de délai explicite (Thm 4.3, Alg. 3) est renoncée. »
  source : M014 l.94-95 ; TH-1 §5-1 · touche : aucune aujourd'hui (phrase D3) · nature : T
  item : PXC-04 NARABI-SERVED-2, partie fixée par son ADR (NARABI-THEORY-1-SUITE, à former) · porteur : PAROXYSME · déclencheur : l'ADR
    de PXC-04, avant sa partie 1 (F2)
  état : ouvert · suite : item (a) de M014 (« demande de délai chiffré », documentation) ; TH-1 confirme l'absence sous échangeabilité

## 3. Limites nouvelles depuis la fiche : ouvertes (20, INV §4.2 ; N17 à N19 closes, §4)

- **L37** · « La signature K-1 ne couvrirait ni `endpoints`, ni `node_version`, ni `sentinel_sha`, ni `key_id`. »
  source : ADR-K1 l.147, l.155 (D5) · touche : aucune aujourd'hui (futur « signed ») · nature : Dr
  item : PXC-03 NARABI-K1, partie 2 (K-1a-sig ; K-1-PROV-SIG-1, à re-former à ETAT) · porteur : PAROXYSME · déclencheur : partie 2 de
    PXC-03 (F3), après la décision P-28
  état : ouvert (sans objet tant que K-1 n'est pas au tronc) · suite : ADR-K1 l.147 le place avant K-1-ROT (documentation)
- **N01** · « Le texte servi de la classe est lié par empreinte dans un fichier de contrat jamais réécrit. »
  source : `spec/contract-1.1.0/policy/stable-run-velocity-24h.json` (sha256 `c7572e08…`) ; `apps/harness/src/tools/gate.ts:146-147` ;
    C l.441, l.449, l.506, l.587 · touche : fichier de contrat publié ; `README.md:116-118` · nature : T/Dr
  item : NARABI-POLICY-TEXT-REV-1 (ETAT l.768-774) ; PXC-04 NARABI-SERVED-2, partie 4 (révision datée S1) · porteur : RECHERCHES (texte,
    ETAT l.772) ; PAROXYSME (chantier) · déclencheur : PXC-04 partie 3, après R-b (ETAT l.772-773) ; partie 4 en F4
  état : changé (item formé à ETAT depuis l'inventaire) · suite : même limite que NRT-01 ; prix : 0,25 j + 0,5 j de remplacement (ETAT l.741)
- **N02** · « La classe refuse tout `attested` ; les résidus d'`AttestedFlow` ne vont jamais au verdict ; `AttestedFlow` reste hors de 1.1.0. »
  source : `apps/harness/src/attestation-binding.ts:9`, `:36` ; `apps/harness/README.md:20-24` ; C l.21 · touche : `apps/site/lib/fleet.ts:225` ;
    `README.md:113` · nature : T/C
  item : PXC-03 NARABI-K1, partie 3 (NARABI-GATE-SIG-1, à re-former à ETAT ; version d'`AttestedFlow`) · porteur : PAROXYSME ; la version
    neuve d'un contrat gelé : le fondateur · déclencheur : partie 3 de PXC-03 (F4)
  état : ouvert · suite : re-baseline d'un contrat gelé (ADR-K1, M4 et M6) ; dépend de K-1
- **N03** · « La note du registre « its attested flow carried into the served gate, both replayed » dit plus que le chemin servi. »
  source : `apps/site/lib/fleet.ts:225` ; `apps/harness/test/gate.test.ts:463-471`, `:518` ; `apps/site/lib/narabi-copy.ts:98`, `:101` ·
    touche : `apps/site/app/docs/narabi/page.tsx:64` ; `apps/site/app/fleet/page.tsx:139` · nature : C
  item : PXC-02 PUBLIC-SENTENCES-2, partie 1, noyau (seconde jambe bornée, PLAN §5.1 (a) ; NARABI-REGISTER-NOTE-1, à former) · porteur :
    PAROXYSME ; envoi du site : le fondateur · déclencheur : tâche 2 du TABLEAU (F1) ; publication au go d'envoi du site
  état : ouvert · suite : sous Q-A.2 (a), la seconde jambe (`fleet.ts:216-225`) est bornée dans la même PR que celle de L15 (PLAN §5.1)
- **N04** · « Jambe payante noire depuis la ligne du 2026-09-23 : la garde tourne sans clés de cycle. »
  source : ETAT l.880-888 · touche : aucune · nature : P/C
  item : SENTINEL-GUARD-ARMING-1 (ETAT l.880-888) ; PXC-05 SERVED-CONTROL-1, partie 3 (armement) · porteur : MONARK (ETAT l.887) ; le
    fondateur (P-3, ou « jambe noire ») · déclencheur : le G7 du pli §11-1 (ETAT l.880) ; P-3 ou décision du fondateur (ETAT l.886-887)
  état : ouvert · suite : même limite que L26 à L28 ; acte de compte avec PXC-05 partie 3 (PLAN §7.3)
- **N05** · « Trois gels Narabi hors tronc depuis le 2026-09-28, sans G2, cp-2 ni G7, et absents d'ETAT. »
  source : INV l.61-65 ; gels `3402af47`, `78b93789`, `cb476f8e` (hors du clone, §7, doute 2) · touche : indirecte (L6, L15, L30) · nature : C
  item : décision P-28 sur les seize refs (PLAN §4.1 A ; NARABI-GELS-1, à former) ; PXC-01 PAROXYSME-STANDARD-1, partie 2 ; PXC-03
    partie 1 et PXC-04 partie 2 · porteur : MONARK (décision) ; PAROXYSME (relevé, tâche 3 du TABLEAU) · déclencheur : décision P-28 au
    plus tard le 2026-10-12 (PLAN §4.1 A, F1)
  état : ouvert · suite : N2-1a est à refaire sur le contrat 1.1.0 (INV l.288-289)
- **N06** · « Les items Narabi n'ont plus de porteur au registre faisant foi depuis le 2026-10-01 : 18 noms absents d'ETAT. »
  source : ETAT l.7-11 ; INV l.66-72 (`grep -c` nul, recompté à la tête) · touche : toutes les promesses de la pièce · nature : C
  item : PX-STD-ORPHAN-1 (item du plan, absent d'ETAT ; NARABI-ITEMS-REFORM-1, à former) ; PXC-01 PAROXYSME-STANDARD-1,
    partie 2 · porteur : MONARK (ETAT) ; PAROXYSME (chantier) · déclencheur : prochain point d'étape (PLAN §4.1 A) ; partie 2 de PXC-01 en F3
  état : ouvert (les 18 noms restent absents à la tête, `grep -c` = 0) · suite : NARABI-L-2 d'abord (échéance 2026-10-18)
- **N07** · « NARABI-L-2 échoit le 2026-10-18 sans porteur au registre faisant foi. »
  source : M012 l.249-253 ; M014 l.138 · touche : aucune aujourd'hui (phrase D3 sous go ; section S5) · nature : M/T
  item : PXC-04 NARABI-SERVED-2, partie 1 (NARABI-L-2, à re-former à ETAT, PX-STD-ORPHAN-1) · porteur : PAROXYSME ; ligne d'ETAT : MONARK
    · déclencheur : partie 1 de PXC-04 en F2 ; échéance 2026-10-18 (M012 l.253), re-formée à ETAT au prochain point d'étape
  état : ouvert (absent d'ETAT à la tête, `grep -c` = 0) · suite : NARABI-L-2 ne déploie pas seul : vague 1 ou ligne d'attente datée
    (PLAN §4.2)
- **N08** · « Le registre `PAROXYSME-Narabi.md` est absent du dépôt (règle §4 de l'investisseur). »
  source : `git ls-tree 87b821b0 docs/` (seul `docs/PAROXYSME-Dojo.md`) · touche : registre public · nature : C
  item : versement intérimaire (a′) (PLAN §4.1 A, §7.3 ; PAROXYSME-NARABI-FILE-1, à former) ; PXC-01 PAROXYSME-STANDARD-1,
    partie 2 · porteur : PAROXYSME (ce fichier) ; MONARK (fusion, ligne d'ETAT) · déclencheur : la fusion de ce versement par MONARK (F1)
  état : changé (ce fichier le porte, branche `paroxysme/registres-interimaires`) · suite : clos à la fusion, preuve : la ligne d'ETAT
- **N09** · « Les preuves certifiées des provers ne vivent que sur l'hôte de MONARK, hors du dépôt. »
  source : INV l.204 ; INV l.37-39 (empreintes) · touche : indirecte (L5, L8, L10) · nature : C
  item : PXC-01 PAROXYSME-STANDARD-1, partie 2 (NARABI-PROOFS-SEAL-1, à former) · porteur : MONARK (les copies sont sur son hôte) ;
    PAROXYSME (chantier) · déclencheur : partie 2 de PXC-01 (F3)
  état : ouvert · suite : verser les quatre fichiers et leurs sha256 en pièce (INV l.37-39)
- **N10** · « Générateur `mulberry32` (état 32 bits), entier par multiplication-arrondi ; libellé « exact permutation p-value ». »
  source : `apps/sentinel/src/instrument.ts:63`, `:140` ; TH-1 §5-3 (l.80) · touche : aucune (ADR ; commentaire non servi) · nature : C/T
  item : PXC-04 NARABI-SERVED-2, partie fixée par son ADR (NARABI-THEORY-1-SUITE, P2-10 de TH-1, à former) · porteur : PAROXYSME ·
    déclencheur : l'ADR de PXC-04, avant sa partie 1 (F2)
  état : ouvert · suite : Stark-Ottoboni, arXiv:1810.10985, libre (go de téléchargement) ; p « in the weak sense » (Hemerik-Goeman)
- **N11** · « L'échangeabilité de la sous-suite calme (sélection `prevCalm && calm`) n'est pas établie. »
  source : TH-1 §5-4 (l.81) · touche : `README.md:121` (interprétation) · nature : T
  item : PXC-04 NARABI-SERVED-2, partie fixée par son ADR (NARABI-THEORY-1-SUITE, P1-10 de TH-1, à former) · porteur : PAROXYSME ·
    déclencheur : l'ADR de PXC-04, avant sa partie 1 (F2) ; le procurement P1-10, Kallenberg 1988 (PLAN §7.1)
  état : ouvert · suite : KATA-EXCH-TEST-1 est mutualisé avec X-1, NARABI-THEORY-1 (ETAT l.762-763)
- **N12** · « p = 1/1001 pré-J0 : dépendance ou rupture non tranché ; un contrôle de sensibilité précède la clé `pre_j0`. »
  source : TH-1 §5-5 (l.82) ; M012 l.251 · touche : aucune aujourd'hui (clé `pre_j0` de NARABI-L-2) · nature : T/M
  item : PXC-04 NARABI-SERVED-2, partie 1 (NARABI-L-2, à re-former à ETAT) · porteur : PAROXYSME ; ligne d'ETAT : MONARK ·
    déclencheur : partie 1 de PXC-04 en F2 (échéance 2026-10-18, re-formée à ETAT)
  état : ouvert · suite : procurements P1-2 et P1-4 de TH-1, envoi non établi (PLAN §7.1)
- **N13** · « CM-5 refondera la surveillance par clé kata ; la sentinelle Narabi est « figée sur USDe ». »
  source : ADR-CM l.34, l.67 ; ETAT l.533-537 · touche : timeline servie (`README.md:66`) · nature : C/P
  item : CM-5-PLAN-1 (ETAT l.533-537) ; PXC-10 CM-5-RETIRE-1, partie 1 · porteur : RECHERCHES (c3 et c4) ; MONARK (oracles d'hôte, G2,
    courses) (ETAT l.535-537) · déclencheur : T0, atteint (ETAT l.534) ; partie 1 de PXC-10 après la mesure de R-b (F3)
  état : changé (G0 de CM-5 écrit par RECHERCHES, ETAT l.538, l.543 ; partage daté du 2026-10-07, ETAT l.535-537) · suite : relire ce G0
    pour la sentinelle
- **N14** · « Sonde : liste de ports de Node recopiée, lecture dépréciée, raisons d'état incomplètes. »
  source : ETAT l.428-429, l.436-449 · touche : aucune · nature : C
  item : BADPORT-NODE-UPGRADE-1, PROBE-BADPORT-STATE-1, PROBE-MAIL-VOCAB-BADPORT-1, NODE-NATIVES-READ-1, PROBE-UNREACHABLE-WATCH-1
    (ETAT l.428-449) ; PXC-05 SERVED-CONTROL-1, partie 3 · porteur : non écrit à ETAT (§7, doute 4) ; PAROXYSME (chantier) · déclencheur :
    ceux d'ETAT (version de Node, sonde, échec « not readable », rouge `unreachable`) ; partie 3 de PXC-05 (F3)
  état : ouvert · suite : prix à ETAT pour trois des cinq : 1 à 20 lignes (ETAT l.437, l.440-441, l.443-444)
- **N15** · « Hôte du site : fichiers hors dépôt dans l'arbre servi, trois arbres anciens et huit sauvegardes gardés. »
  source : ETAT l.1464-1473 · touche : aucune · nature : C
  item : HOST-HARNESS-PREV-1 (ETAT l.1464-1473) ; PXC-05 SERVED-CONTROL-1, partie 3 (acte) · porteur : MONARK (acte d'hôte ; non écrit à
    ETAT, §7, doute 4) ; le fondateur (accord de suppression) · déclencheur : le prochain déploiement du harnais (ETAT l.1469)
  état : ouvert · suite : l'arbre renommé du 2026-10-04 ne se retire qu'après le prochain redémarrage du harnais (ETAT l.1471-1473)
- **N16** · « La capture du site date du 2026-09-24 ; le test de composition tourne sur elle. »
  source : `apps/site/data/narabi-capture.json` (`captured_at` 2026-09-24) ; `test/narabi-live.test.ts:184` · touche : page `/narabi` ;
    `README.md:70` · nature : C
  item : PXC-05 SERVED-CONTROL-1, partie 2, reste (NARABI-CAPTURE-REFRESH-1, à former) · porteur : PAROXYSME ; envoi du site : le
    fondateur · déclencheur : reste de la partie 2 de PXC-05 en F3 (PLAN §4.2) ; à la prochaine release du site
  état : ouvert · suite : recontrôle du fichier vivant dans le navigateur (INV l.105)
- **N20** · « Aucun chemin de remplacement ou de retrait d'une ligne marginale : la liste de retrait ne vise que les lignes kata. »
  source : `apps/harness/src/policy-retire.ts:2` ; C l.441 · touche : `README.md:125` (« Until … an ADR says otherwise ») · nature : C/P
  item : PXC-04 NARABI-SERVED-2, partie 3 (NARABI-ROW-SUPERSEDE-1, extension d'ENGINE-ROW-RETIRE-PATH-1, à former) · porteur : PAROXYSME
    · déclencheur : partie 3 de PXC-04 après la mesure de R-b (F4)
  état : ouvert · suite : R-b fusionnée depuis l'inventaire (ETAT l.1764-1766), D6 en attente ; RETIRE-PROBE-MARGINAL-1 (ETAT l.1059-1065)
- **N21** · « `rpc-guard` (pièce partagée) : résidus m-3 et m-4 « déclaré, acceptable », absents d'ETAT. »
  source : `docs/G7-lot-rpc-guard-lock-write-leak-1.md:73-74` · touche : aucune · nature : C
  item : PXC-07 TRUSTLESS-READ-2, partie 3 (constructions `rpc-guard` ; item du propriétaire de `rpc-guard`, à former) · porteur :
    PAROXYSME · déclencheur : partie 3 de PXC-07 en F5, avec ligne d'attente datée au versement (PLAN §4.4)
  état : ouvert · suite : pièce partagée, à croiser avec les registres d'Ukemi et de Bell
- **N22** · « SIGTERM sort par 1, indiscernable de l'arrêt L-1 ; le mutant qui vide `removeListener` survit. »
  source : `docs/G7-lot-sentinel-sigterm-startup-window-1.md:68`, `:77` · touche : aucune · nature : C
  item : PXC-05 SERVED-CONTROL-1, partie 3 (« code 143 plus tard », journal G7 l.77, à former) · porteur : PAROXYSME · déclencheur :
    partie 3 de PXC-05 (F3) ; le jour où l'arrêt par signal doit se distinguer de L-1 (journal G7 l.77)
  état : ouvert · suite : `apps/sentinel/src/run.ts` partagé avec PXC-03 : ordonner (CC l.162)

## 4. Limites closes (avec preuve)

### 4.1 Limites de la fiche du 2026-09-27 (4, INV §4.1)

- **L12** · « README:36 « Early sensing of a stablecoin run ». » · clos (preuve : `README.md:36` ne porte plus la phrase à la tête,
  `git show 87b821b0:README.md | grep -c 'Early sensing'` = 0 ; le commit `998a6c39` n'est pas dans le clone, §7, doute 2)
- **L31** · « Test 42 au-delà de 600 s. » · clos (preuve : ETAT l.493, #130, `0effb5b2` ; ETAT l.1672, EXPORT-CI-TIMEOUT-BOUND-1, 1 800 s ;
  ETAT l.1733, T42-BOUND, `ccfc5820`)
- **L35** · « Portée du hash (`features_digest` lie le payload, pas l'enveloppe). » · clos (preuve : `apps/sentinel/src/flow.ts:41-45`
  hache `{address, fromBlock, toBlock, topics}`)
- **L36** · « Extrapolation de l'archive, « Risque non mesuré » (G1-L l.21, l.280). » · clos (preuve : levée par la mesure du tirage 2,
  REG-0927 l.85 et l.239, hors du tronc, §7, doute 1)

### 4.2 Limites nouvelles depuis la fiche (3, INV §4.2)

- **N17** · « Bord de bande USDe jusqu'à 4 ulp de q̂, « non dit ». » · clos (preuve : B-13, `apps/harness/src/tools/gate.ts:133-134` ;
  ADR-CM l.97, l.150)
- **N18** · « α et nMin choisis par l'appelant sur la clé USDe. » · clos (preuve : `apps/harness/src/class-policy.ts:27` ;
  `skills/monark/SKILL.md:67` ; ADR-CM l.92, B-2 ; C l.107)
- **N19** · « Clés imitant la clé USDe acceptées en 200. » · clos (preuve : ADR-CM l.91, B-1, et l.196, B-10 ; lots CM-1 et CM-2c)

## 5. Limites marquées PAROXYSME apparues à ETAT depuis l'inventaire

Commande (à la tête, sans réseau) : `git diff -U0 57a131fc 87b821b0 -- docs/ETAT.md | grep '^+' | grep PAROXYSME` : dix lignes ajoutées,
neuf limites et un bloc. Deux touchent Narabi : NARABI-POLICY-TEXT-REV-1, dans le bloc « Limites déclarées des textes figés de R4 v2 »
(ETAT l.730-778), et DOJO-PROBE-UID-BOUNDARY-1 (ETAT l.1889), qui touche la sonde Narabi (`deploy/monark-probe.service`) et celle du
Dōjō. Les sept autres et les autres items du bloc sont au registre du Harnais (HT-01 à HT-07 ; entrées MK). Hors de ces deux items, une
seule ligne ajoutée nomme Narabi, la sentinelle ou stable-run (même `diff`, `grep -i`) : KATA-EXCH-TEST-1, « mutualisé avec X-1
(NARABI-THEORY-1) » (ETAT l.762-763, même bloc), rattaché à MK-L01 au registre du Harnais et cité ici en suite de N11.

- **NRT-01** · « Le `text` servi de la ligne marginale stable-run garde la forme sous indépendance ; il ne change qu'en remplaçant la ligne. »
  source : ETAT l.768-774 ; `apps/harness/src/tools/gate.ts:125-132` (phrase à la l.130) · touche : description servie de `gate` ;
    `spec/contract-1.1.0/policy/stable-run-velocity-24h.json` (`text`) · nature : T/texte
  item : NARABI-POLICY-TEXT-REV-1 (ETAT l.768-774) · porteur : RECHERCHES (texte) · déclencheur : PXC-04 partie 3, après R-b
    (ETAT l.772-773)
  état : ouvert · suite : prix : 0,25 j de texte et 0,5 j de remplacement de ligne (ETAT l.737-742) ; même limite que L6, L7 et N01
- **NRT-02** · « La sonde Narabi garde le mot de passe d'envoi dans l'environnement de l'uid `probe`, que partage l'enfant vérificateur du Dōjō. »
  source : ETAT l.1889-1898 ; `deploy/monark-probe.service:23`, `:33` (sans `UnsetEnvironment`) · touche : aucune · nature : C
  item : DOJO-PROBE-UID-BOUNDARY-1 (ETAT l.1889-1898) · porteur : MONARK (texte) ; le fondateur (acte de déploiement) · déclencheur :
    avant DOJO-PROBE-MIRROR-1 (ETAT l.1897)
  état : ouvert · suite : prix à chiffrer à son G0 (ETAT l.1897-1898) ; `LoadCredential=` seul ne ferme pas la limite (ETAT l.1895-1896)

## 6. Renvois : limites d'autres pièces qui touchent Narabi

- PX-Narabi-1 (texte stable-run servi, `apps/harness/src/tools/gate.ts:125-132` ; INV-H l.98) : renvoyé ici par le registre du Harnais
  (§6) ; entrées L6, L7, N01 et NRT-01.
- PX-Narabi-15 (comptage des appels par classe ; INV-H l.99) : absorbé par PX-Harness-10 du registre du Harnais, sous la question Q-H2
  (propriétaire unique Harness) ; ici, L32.
- PX-Harness-04 (la sentinelle tourne dans l'arbre du harnais ; SENTINEL-DEPLOY-GUARD-1, absent d'ETAT à la tête, `grep -c` = 0) :
  registre du Harnais. Tout redéploiement de la sentinelle porté ici (PXC-03 ; PXC-04 partie 2 : L15, L19, L20, L30) passe avec cette
  garde ou sous la commande de diff de la fermeture (PLAN §4, contrainte (iv)).
- Hikae L18 (borne ABB vide en cadence journalière, « propriétaire Narabi », INVENTAIRE-Hikae l.144) : registre Hikae ; même famille
  que L9 ici. Hikae L8 (`B_t` fragile, P(B_t < 0), INVENTAIRE-Hikae l.134) : registre Hikae ; même source que L33 (M009 l.123-124).
- Ukemi N13 (la ligne liq s0 n'a pas de chemin de retrait servi) : registre Ukemi ; même construction que N20 (NARABI-ROW-SUPERSEDE-1,
  CC l.175).
- Bell N-01 (hôte dit « dédié » qui porte la sonde Narabi puis le Dōjō, INVENTAIRE-Bell l.121) : registre Bell ; voisin de NRT-02.

## 7. Doutes nommés (ce qui ne se reproduit pas tel quel à la tête)

1. **Sources hors du tronc.** Les lignes de C, TH-1, SN-1, PROVER, FAITS-POR, PX-IDENT-A, B et C, CROSSREF-PASS et PROC sont celles que
   l'inventaire a lues (dépôt de RECHERCHES, dossiers d'étude et preuves sur l'hôte de MONARK) ; elles ne sont pas relues ici. REG-0927
   est relu (boîte PAROXYSME) ; `docs/CHANTIERS.md` est retiré du tronc depuis le 2026-10-01 (ETAT l.9) et n'est pas relu. La preuve
   de clôture de L36 (REG-0927 l.85, l.239 : « tirage 2, CHANTIERS:1754 ») n'est donc pas au tronc ; sa source, G1-L l.21, l.280, l'est.
2. **Commits hors du clone.** Le clone est superficiel (`git rev-parse --is-shallow-repository` : `true` ; 23 commits frontières datés
   du 2026-10-05 04:38 au 2026-10-06 06:25 UTC). Les commits `998a6c39` (L12), `3402af47`, `78b93789`, `cb476f8e` (gels : L6, L15, L30, N05), `7439b0e8` (N02),
   `a21a65bf` (N06), `a4d3f440` (N16), `0effb5b2` et `ccfc5820` (L31) ne s'y lisent pas, et le réseau est exclu : les faits qui les
   remplacent à la tête (texte, lignes d'ETAT) sont relus ; l'identité des commits et l'état des branches de gel ne le sont pas.
3. **Items absents d'ETAT à la tête** (`grep -c` nul) : NARABI-L-2 (échéance 2026-10-18, toujours pas re-formé), K-1 (motif strict),
   K-1-PROV-SIG-1, NARABI-GATE-SIG-1, NARABI-QUORUM-TIEBREAK-1, SENTINEL-DEPLOY-GUARD-1, HARNESS-DEMAND-J30-1, PX-STD-ORPHAN-1,
   NARABI-1-DEMANDES-ENVOI-1 et les items « à former » des entrées (NARABI-THEORY-1-SUITE, NARABI-REGISTER-NOTE-1, NARABI-GELS-1,
   NARABI-ITEMS-REFORM-1, PAROXYSME-NARABI-FILE-1, NARABI-PROOFS-SEAL-1, NARABI-CAPTURE-REFRESH-1, NARABI-ROW-SUPERSEDE-1). Leurs
   entrées les portent par un chantier ; leur re-formation à ETAT est à MONARK (PX-STD-ORPHAN-1, PLAN §4.1 A).
4. **Porteur non écrit à ETAT.** Les cinq items de N14 (ETAT l.428-449) et HOST-HARNESS-PREV-1 de N15 (ETAT l.1464-1473) ont un
   déclencheur à ETAT, pas de « Porteur : ». Le registre écrit le chantier (PAROXYSME) et, pour N15, MONARK par la règle des actes d'hôte.
5. **Parties non nommées par CC.** La fiche de PXC-04 (CC l.177-180) couvre L1, L2, L3, L22, L34, N10 et N11 sans les placer dans une
   de ses cinq parties (CC l.190-192), et le plan non plus (PLAN §4.5 : PXC-04 attend les procurements) : le registre écrit « partie
   fixée par son ADR », avec pour déclencheur l'ADR de PXC-04, avant sa partie 1 (F2). Parties lues au nom de la partie, non écrites
   ligne à ligne par CC : L14 (PXC-03 partie 3, par ADR-K1 l.138, G7 de K-1b), L37 (PXC-03 partie 2, K-1a-sig), L24, L25, L29 (PXC-05
   partie 3, « sondes et hôtes », unités), N05, N06, N08, N09 (PXC-01 partie 2, versement ; pour N05 aussi PXC-03 partie 1 et PXC-04
   partie 2), L16 (PXC-07 parties 1 et 3) ; L18 garde un volet PXC-03 sans partie.
6. **ETAT et CC ne disent pas la même partie** pour NARABI-POLICY-TEXT-REV-1 : ETAT l.772-773, « PXC-04 partie 3, après R-b » ; CC
   l.190-192 met la révision datée S1 en partie 4 et le chemin de remplacement en partie 3. Le registre garde le déclencheur d'ETAT et
   écrit la partie 4 de CC à côté (L6, L7, N01) ; les deux parties sont en F4.
7. **NRT-01 et N01.** La mission range NARABI-POLICY-TEXT-REV-1 parmi les limites neuves à la tête (§5). C'est la même limite que L6, L7
   et N01, vue d'ETAT : comptée une fois au §5, sans dette de plus ; un seul bornage.
8. **⚑B.** L'inventaire ne marque ⚑B que K-1 (L15, INV l.110-112). La note plus forte que le chemin servi (N03) et l'e-détecteur non
   servi (N07) y sont des écarts de branchement non marqués (INV l.113-119). Q-A.2 (a) tranche la jambe « attested » ; le `status` de la
   pièce reste `built` jusqu'à ce que l'ADR de PXC-02 en écrive le prix et la forme (PLAN l.1177-1180).
9. **Ancres qui ont bougé à la tête** (ordre de mission : « ligne qui a bougé à la tête » va en doute). Même texte, autre numéro : 16 des
   18 ancres d'ETAT de l'inventaire (`57a131fc` → `87b821b0` : l.98 → l.129 ; l.397, l.405, l.408, l.411, l.416 → l.428, l.436, l.439,
   l.442, l.447 ; l.405-412 → l.436-443 ; l.462 → l.493 ; l.502-503 → l.533-534 ; l.590-597 → l.880-887 ; l.596 → l.886 ; l.987-990 →
   l.1459-1462 ; l.989 → l.1461 ; l.992-1000 → l.1464-1472 ; l.1200 → l.1672 ; l.1261 → l.1733) ; l.9-11 et l.27-31 ne bougent pas.
   `docs/RUNBOOK-sentinel.md` l.678 → l.682 et l.671-676 → l.675-680 (quatre lignes ajoutées plus haut par #229). Texte changé : aucune
   ancre. Commande : `node reanchor.mjs --repo <clone> --base <57a131fc | d8fe354c> --head 87b821b0 <fichier>:<ligne>…`.
10. **Ligne du JOURNAL de la boîte.** La décision Q-A.2 est à la l.14 à `887c0f6` (citée par la mission) et à la l.15 à `150c997` (une
    ligne ajoutée au-dessus) : le JOURNAL s'écrit par le haut ; le registre cite le commit.
11. **En-tête de M014.** M014 l.3 porte encore « checkpoint-1 validateur — dû avant le code » alors que M014 est fusionnée avec ses
    journaux G1 et G2 (INV doute 3) : non tranché ici.
12. **Procurements.** Rien ne prouve l'envoi des demandes P1-2 à P1-10 de TH-1 ni des douze demandes de SN-1 §3 (C) (INV doute 4) ; la
    décision est NARABI-1-DEMANDES-ENVOI-1 (PLAN §7.1, MONARK).
13. **Manifeste.** Un manifeste de l'investisseur reprend la formule de N03 (INV doute 5) ; sa publication n'est pas vérifiable sans
    réseau.
14. **Lignes.** Chaque entrée tient en quatre lignes logiques (limite ; source, touche et nature ; item, porteur et déclencheur ; état et
    suite), coupées en lignes physiques de 160 caractères au plus avec une indentation de quatre espaces, comme au registre du Harnais ;
    une entrée fait sept lignes physiques au plus.
15. **Contrôle mécanique.** Les contrôles de `verify-registres.mjs` (pièce de la boîte, `1fd31ee`) pour Narabi sont rejoués sur ce
    fichier avant tout commit (rapport du worker) ; l'outil lui-même ne lit qu'un fichier commité et tournera sur la branche.

## 8. Ligne PAROXYSME et sources

**Ligne PAROXYSME (2026-10-07).** Narabi : 52 limites ouvertes ou changées (dont 1 ⚑B : L15) et 7 closes. Limites neuves à ETAT : 2
ici (§5 ; NRT-01 est la même limite que N01). Décision du fondateur entrée datée : Q-A.2 (L15). Échéance : NARABI-L-2 le 2026-10-18,
toujours absent d'ETAT. Aucune dette : chaque entrée ouverte a son item, son porteur et son déclencheur.

| Source | Lignes | sha256 |
|---|---|---|
| `docs/ETAT.md` à `87b821b0` | 1 904 | `3190de5c23507292414418cbb8b24e0f7c9f319dca64a0f5ae8c5009475a5b5a` |
| `README.md` à `87b821b0` | 353 | `6324c8b220ccb5378d5458ca883190b7241b0d3cdbc1e42d9f1697051e58b5ad` |
| `apps/site/lib/fleet.ts` à `87b821b0` | 429 | `998fdf33a3c461f687ec604524c63ee739ef1b7dd77acba571523aa979f232f4` |
| `apps/sentinel/src/flow.ts` à `87b821b0` | 74 | `976bcb69ff1574842e4db9afd47fd3ff7e98ae9e9269e63920b8d53c77acd628` |
| `apps/harness/src/tools/gate.ts` à `87b821b0` | 1 070 | `7920ceaca2ce8231ecc2672b3a1ecd0e3a70c95971e80d225c107159558dadbd` |
| `apps/harness/test/gate.test.ts` à `87b821b0` | 871 | `be1a66a6c2e2ca1689025d30fe9c1608548ee78098a4cf6c4958c2d1f2a10365` |
| `apps/harness/src/attestation-binding.ts` à `87b821b0` | 65 | `3e59882de94f3fd6e457b4637f69c4e10556e10d8eee008ef14926e383321eed` |
| `apps/harness/README.md` à `87b821b0` | 134 | `733479970acb68981dab5b3146f08ead3c4fdd4bbd8f3e1068d91c66a28baa7c` |
| `apps/harness/src/class-policy.ts` à `87b821b0` | 31 | `19127536113b0767c6691df099ede1a1d9354e56c69ed4071624b3e31f73562b` |
| `apps/harness/src/policy-retire.ts` à `87b821b0` | 85 | `71bb678be2df0384262c150c59387a0cb4241bd1f9580e30c92ae6e1cb7c8d01` |
| `apps/harness/src/calibration.ts` à `87b821b0` | 318 | `446c50bb7ab798fc24c8a3331c22ad95730660f45e36202d63f4d8a8d5531706` |
| `spec/contract-1.1.0/policy/stable-run-velocity-24h.json` à `87b821b0` | 1 | `c7572e084a6765c5a145b54e3a93e1a0ee81b2ad6ccb38630399173454fbf0a8` |
| `skills/monark/SKILL.md` à `87b821b0` | 79 | `63f52be6a3a6243bab45409fc19d05d88afbed1dfe9236c182501f811e057c8c` |
| `apps/site/lib/narabi-copy.ts` à `87b821b0` | 101 | `981c7bc7f0db99f80861de9b19a432a08b6170478b5d329b53715602ee916aa6` |
| `apps/site/app/docs/narabi/page.tsx` à `87b821b0` | 164 | `10c07c0ffd492a7fd92ea0637316286acacb410d4505119ee327c06b32428795` |
| `apps/site/app/fleet/page.tsx` à `87b821b0` | 214 | `0104533fdf6d2522c173f6157410bf89e23557118ed39b00c5a7ce50da9ef2ec` |
| `apps/site/data/narabi-capture.json` à `87b821b0` (clé `captured_at` seule) | 19 | `44a5b6288a24cc68cf78bcc6d87d9c6e13c9e4d8b806282d559696979b7ae149` |
| `apps/sentinel/README.md` à `87b821b0` | 51 | `4dea6a1b66817dba6ae836b8bc47352105502e92ec5acd8be4e56c4ef5332664` |
| `apps/sentinel/src/instrument.ts` à `87b821b0` | 312 | `dc0e9df819109f653bf7e219284aa2ba8aaa08efcedc6c75eb9c547431325a0b` |
| `apps/sentinel/src/edetector.ts` à `87b821b0` | 138 | `9cea5ada8fd7c2c94934ff6d16c38bad715cbe12e84fe39fc60d2e4dc6ae6454` |
| `apps/sentinel/src/timeline.ts` à `87b821b0` | 184 | `ac357e7ddae380cf687bd97add4f03916374a16f1a2e42e7276466b12c1f2958` |
| `apps/sentinel/src/rpc.ts` à `87b821b0` | 239 | `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` |
| `packages/hikae/src/tracker.ts` à `87b821b0` | 161 | `1d3677ad65a74250bf28bfe4ae20f64bc373841a8272b68fe82456db8b504d71` |
| `packages/monark/src/adapter-narabi.ts` à `87b821b0` | 239 | `e030e757b8eacac0f66d7efe756b87386e06c4abb3394be004aefe68574254e5` |
| `test/narabi-live.test.ts` à `87b821b0` | 1 193 | `dd93f970ce059e6d0a99008b211e07566cb8158138905307820c1d19b676d184` |
| `apps/sentinel/test/sentinel.test.ts` à `87b821b0` (l.208) | 783 | `676bb034387d0d591865e72213dae823bd05b84571eadc7991754b7aa094d165` |
| `deploy/monark-probe.service` à `87b821b0` | 44 | `985f8381de31f7cb071305c4eb01ae7df258d506ca3b2e124e7c23d3ef5f9ce8` |
| M009 à `87b821b0` | 136 | `bf17b560745cfb450a5601c24e1ada54115bdfbdfd3dfedb78b548ea26ec1705` |
| M012 à `87b821b0` | 281 | `d8badd90eb06eaf2c988d473e43745c0490d783426cc6ad322403fd7e3e5511a` |
| M014 à `87b821b0` | 138 | `901c1bd0585373db5e305f812572bd43ca21f9c09b15237283b586bc79b07350` |
| OPS-1 à `87b821b0` | 266 | `fba009aeb822bbcf1fa8609623945fdc79025d08eec3ef639dab0a30ab0b9a3f` |
| ADR-N2 à `87b821b0` | 214 | `e4e124ba2e8d627cc8859c0f25e3c6157dd34dd84fdf3201213e02c5dcf4a841` |
| ADR-K1 à `87b821b0` | 200 | `1c30e5c10a4af0de778df40d58ece753908213d51a91a28601bac61c9b06ee03` |
| ADR-CM à `87b821b0` | 331 | `64aa3e11a87ac59ce633d5191952824d06010970c34b73c749e1c1caa2430c7b` |
| RB-S à `87b821b0` | 693 | `7d10f2801423c03d9bd485bfac7ae11a003b0d6f938bf77e2430d4338f77e1fe` |
| JP à `87b821b0` | 466 | `7dfa3f0c8a5da8b0c5ad2807f10b377d03fc1fda895349490c8f834415f16e9f` |
| PLAN-M008 à `87b821b0` | 172 | `fd09efaacccfa629db3c009c6a65dc72aaa04faf261d140082f03b89c549e277` |
| G1-L à `87b821b0` | 827 | `503fe0249d66ec31e7e8572182fb3ff3d88f7ddaeddbb2e922b3654c1140415b` |
| `docs/G7-lot-rpc-guard-lock-write-leak-1.md` à `87b821b0` | 92 | `9c1c7b782d4ddabe3ab64212cd56a0617165c4bb5c9e1bbe693161cc1b25bf12` |
| `docs/G7-lot-sentinel-sigterm-startup-window-1.md` à `87b821b0` | 85 | `3e7b615b9e09f07542a05dc332e3d3af9fadf71929460a4405da314aee14dc6b` |
| `docs/G7-lot-retire-path-rb.md` à `87b821b0` | 46 | `0f371e39af2888ac85fb644a3acd10c0deb212aaf39a92c5e8801a9d0baacaa8` |
| `docs/biblio/ukemi-modeL/L-lecture-tibshirani2019-barber2023.md` à `87b821b0` | 23 | `af35ab5871c9cc1d006f68ea35d9ba5617642a1ac6296fb337f7c2c8643d6b6c` |
| `docs/dojo/FAITS-systemd-path-2026-09-27.md` à `87b821b0` | 11 | `daf6483c84115586533ecee07575ab3c533876e350b23cd34451cc9de04c2893` |
| INV, boîte PAROXYSME, `dossier/etude-2026-10-06/inventaire/` | 302 | `166266cd17c8f8262014fc8c87e3b2aaa340deb19b7ecef6718745b108b5a16b` |
| INV-H (`INVENTAIRE-Harness.md`), même dossier | 158 | `111ad4e4bdc068c865c502f6b773e982faa728d65b5648e8b92b6969b182e128` |
| `INVENTAIRE-Hikae.md`, même dossier | 309 | `80b092d90f8c709e966906455eb015d7c5bb1ea459dfc7b1b706e83be8186ed5` |
| `INVENTAIRE-Bell.md`, même dossier | 215 | `224812fd39f111cc33333f036cb8c4e69e801c2fc87067819bde91dd6acc02d8` |
| `docs/PAROXYSME-Harnais.md`, branche de ce versement à `788fba14` | 555 | `838bd2c578c7e82bacdd35a4c17d6982f2c3e1caa8c7ad259af97504966e1741` |
| CC, boîte PAROXYSME, `dossier/etude-2026-10-06/CHANTIERS-CANDIDATS.md` | 1 260 | `86ed73a23b0bfd8e2da5ea40de3818ae8a105a7d406c6bc0607fb8914c5dcc60` |
| PLAN, même dossier, `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` | 1 195 | `96b5b01858886906930f8be6e76094294dd71a9878a34b9b71804a160a645714` |
| REG-0927, boîte PAROXYSME, `dossier/etude-2026-09-27/PAROXYSME-Narabi.md` | 269 | `0b518479d9e7906dd22ba0403af4aae94d8e6dc5e05b745613521136e8e4d04f` |
| JOURNAL de la boîte, `coordination/JOURNAL.md` à `887c0f6` | 17 | `e4f44ba7c34ed9d50f9ad663c6c0b830c12c7830ca7b2037b274a4f85692f36d` |
| JOURNAL de la boîte, même fichier à `150c997` | 18 | `3e2a9572843ac3fbffe3f0a2fd26249fc0780d69c03e9ab2bcfa6c43f6d1ae4e` |
| TABLEAU de la boîte, `coordination/TABLEAU.md` à `150c997` | 54 | `1fac9ba1b7d36fe02db804d0279a7f83f2d507da4f97553695a3b503cf1ddd6e` |
| Ordre de mission n° 1 de MONARK, boîte PAROXYSME (`coordination/messages/`) | 95 | `2e8cfd33c12de9d27b673c377e72a9a43da5dcb05c24e0094e744b7f3933c102` |
| `reanchor.mjs`, boîte PAROXYSME `coordination/pieces/2026-10-07-registres/` | 65 | `9ce778f21dc34cdf93cb5bceb41aa566de6ecc5390a39b8eb7993f3d731f4f8b` |
| `verify-registres.mjs`, même dossier (`1fd31ee`) | 121 | `284a5ceda26073d5c46f0f5465b9410d221a1f9f475722eda3507e4cba17531e` |
