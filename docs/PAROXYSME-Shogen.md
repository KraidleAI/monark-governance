# PAROXYSME-Shogen : registre intérimaire des limites de Shōgen (outil `attest`, couture `attest → gate`, capteur)

- **Objet** : versement intérimaire (a′) du plan de route PAROXYSME v3 (§4.1 A, §6 « Transition ») : la pièce `built` Shōgen reçoit le
  registre que la règle de l'investisseur exige (CL l.48-49) ; pour l'état, il remplace la fiche d'étude du 2026-09-27, hors dépôt (N-11).
- **Règle** (règles « Dettes » et « PAROXYSME » de l'investisseur ; décision 251 rappelée par `docs/PAROXYSME-Dojo.md`) : une limite
  déclarée n'est jamais une fin ; elle mène à un item, à une campagne, puis à une décision. Ici, chaque entrée ouverte porte un item, un
  porteur et un déclencheur ; ce qui ne se reproduit pas tel quel à la tête va à un doute nommé (§7).
- **Provenance** : écrit par PAROXYSME (`claude-opus-5-5`, effort max) le 2026-10-07 à partir de 17:28 UTC, tâche 1 du tableau MONARK ↔
  PAROXYSME (ordre de mission n° 1, l.55-73). Sources : l'inventaire validé de Shōgen (dossier d'étude du 2026-10-06), la couverture de
  `CHANTIERS-CANDIDATS.md` §4 et §4.1, les fenêtres du plan v3 §4 (chemins et empreintes au §8). Relecture : une G2 par une instance
  neuve ; contrôle par diff, fusion et ligne d'ETAT : MONARK. Versé au tronc par #242, fusion `1df4e44f` (ETAT l.181-186 à `5437cd0d`) ;
  décisions de MONARK pliées le 2026-10-07 (PR `paroxysme/registres-decisions-1007`), à partir de 19:56 UTC, par un worker de
  PAROXYSME (`claude-opus-5-5`, effort max), sur ETAT à `5437cd0d` et le message `d6331f6` (MSG) (§8) ; relecture : PAROXYSME, puis MONARK.
- **Bases** : inventaire mesuré à `d8fe354c`, qui y lit aussi ETAT (empreinte `2ef6f107…`, INV-S l.19), et non à `57a131fc` comme ceux
  du Harnais et du Moteur. Toutes les ancres du tronc sont à la base `87b821b0` de `lot/etude-suite` (tête relue par `git ls-remote` le
  2026-10-07 à 17:07 UTC, message `d4b3d07` l.16-17). Le tronc a avancé depuis par les fusions #241 et #235, jusqu'à `eb1beb01`
  (17:50:40 UTC), sans changer aucun fichier cité : `git diff --name-only 87b821b0 eb1beb01` en donne 22, aucun du §8. Les ancres sont
  reportées depuis `d8fe354c` par l'outil `reanchor.mjs` (pièce de la boîte, `d2332e2`, rejoué à `a55a62d`) : sur 61 références (liste au
  §7, doute 9), 55 sont dans des fichiers inchangés, 2 gardent leur numéro, 3 se déplacent à texte égal et 1 ligne d'ETAT change de
  texte, sans qu'aucune entrée en dépende. Exception : une ligne d'ETAT des décisions pliées se cite « ETAT l.N à `5437cd0d` ».
- **Préséance** : `docs/ETAT.md` l.7-11 ; ETAT prime. Un item nommé hors d'ETAT et du code n'est pas compté comme formé : il est écrit
  « à former » et porté par son chantier ; un item du dépôt Shōgen ne vaut item formé que pour une limite dont Shōgen est propriétaire
  (CC l.34-37).
- **Labels** : aucun ne change (`built` de Shōgen, `apps/site/lib/fleet.ts:133`) ; `apps/site/lib/fleet.ts` n'est pas touché par ce
  versement.

## 0. Comment lire ce registre

- **Exception datée** (entrée N-16) : Shōgen est `built` sous l'exception datée de l'investisseur du 2026-09-29 (CL l.35-40 ; ADR-0028
  §4.11 l.292-293 au dépôt Shōgen, ligne datée du 2026-10-03 à `d383a51`), confirmée le 2026-10-03 (« Built, preuve attest servi
  (Recommandé) », ETAT l.1574-1577) ; l'entrée servie est une fixture auto-notarisée (`apps/harness/src/shogen-fixture.ts:23-31`).
  Fin : le premier des jalons G2 (vérificateur Shōgen exécuté côté MONARK : PXC-08 partie 2, F4, PLAN l.613-614) et G9 (premiers
  chiffres S2 publiés et servis : N-08) (CL l.37-38) ; l'item de l'exception, SHOGEN-VITRINE-MONARK-1, échoit aussi à toute
  revendication publique nouvelle sur Shōgen (INV-S l.132), qu'interdit CL l.38. Aucun n'est atteint : aucune ligne de `README.md`,
  `apps/site` ou `skills` ne change entre `d8fe354c` et `87b821b0` (`git diff --stat` vide ; avant : INV-S l.69). Restent dues pendant
  l'exception (CL l.39) le recalcul de `sha256(utterance.bytes)` (N-02) et la liaison de la requête (L-02). Aucun label ne change.
- **Une entrée par limite**, ouverte par le préfixe `- **`, sur quatre lignes au plus (forme de `docs/PAROXYSME-Dojo.md` §0) ; une ligne
  qui dépasserait 160 caractères continue en retrait, comme au registre du Harnais.
- **Étiquettes** : celles de l'inventaire, inchangées : `L-01` à `L-35` (limites du 2026-09-27), `N-01` à `N-16` (nouvelles côté
  MONARK), `L-36` à `L-53` et `S-01` à `S-07` (nouvelles côté Shōgen) ; `SHT-nn` numéroterait les limites trouvées à la tête (§5). Ce
  sont des numéros de ligne de registre, jamais des items, et aucune n'apparaît dans un champ « item ». Le registre Bell emploie aussi
  `L-nn` et `N-nn` : un renvoi le nomme toujours.
- **Champs** : limite (25 mots au plus) ; source (fichier et ligne à `87b821b0`, ou ligne que l'inventaire a lue hors du tronc) ;
  touche (texte public que la limite qualifie) ; nature ; item ; porteur ; déclencheur ; état ; suite.
- **Natures** (celles de l'inventaire) : T théorie · M mesure · D donnée · P dépendance · Dr droit · C capacité.
- **Propriétaire** (INV-S l.39) : MONARK porte l'outil `attest`, la couture `attested → gate` et les surfaces (§2.1, §3.1) ; Shōgen porte
  le capteur S2, le vérificateur et le certificat 04, par décision du fondateur du 2026-10-03 (ADR-CM l.188) (§2.2, §3.2).
  Porteurs : le mainteneur de Shōgen est le fondateur (MSG l.76) ; les entrées qui nomment le mainteneur Shōgen pour porteur le gardent ;
  MONARK lui envoie les demandes (MSG l.72) et lui porte la décision de forme G5, un acte du fondateur (ETAT l.274-275 à `5437cd0d`).
- **Item, porteur, déclencheur.** Deux textes de la boîte : le plan de la tâche 1 (accusé `4bbf3ed` l.131-132, accepté par `da72328`
  l.38) donne aux limites dont Shōgen est propriétaire le mainteneur Shōgen pour porteur et une demande pour item ; les trois règles de
  `d4b3d07` l.45-51, postérieures et acceptées par `07d99e2` l.6, font garder à une limite marquée `SHOGEN` « l'item, le porteur et le
  déclencheur que donne sa source » (l.48) : elles prévalent là où la source nomme un porteur (N-10). D'où :
  - un item formé à ETAT est cité avec sa ligne à la tête et garde le porteur et le déclencheur qu'ETAT lui écrit (`d4b3d07` l.46-47) ;
    aucune limite de Shōgen n'en a à `87b821b0` ; à `5437cd0d`, ETAT l.256 nomme SHOGEN-G4-NOTAIRE-RECHERCHE-1 (L-41) avec le
    déclencheur que L-41 reprend (§7, doute 3) ;
  - une limite que `CHANTIERS-CANDIDATS.md` §4 rattache à un chantier prend ce chantier pour item (`PXC-nn`, sa partie, l'item que la
    partie forme) ; porteur : PAROXYSME, qui porte les chantiers (TABLEAU de la boîte, décision de MONARK du 2026-10-07), MONARK gardant
    l'ordre et l'attribution ; déclencheur : la partie et sa fenêtre au plan v3 §4 ; une partie que la fiche ne fixe pas : §7, doute 5 ;
  - une limite marquée `SHOGEN` par CC §4 garde l'item que l'inventaire nomme : au dépôt Shōgen (annexe B d'ADR-0028), ou dans l'étude
    du 2026-09-27 (items PX-Shogen-n de FICHE §2 ; campagnes C4 à C8, hors du dépôt Shōgen ; C7 reprise par ANB l.50 ; écart de CC :
    §7, doute 14), cité tel quel, avec le porteur que sa source écrit (le mainteneur Shōgen quand elle n'en nomme pas d'autre) et le
    déclencheur que l'inventaire donne ; s'il n'en donne pas : §7, doute 6 ;
  - les douze limites côté Shōgen sans item (CC l.1147-1151) ont pour item une demande au mainteneur Shōgen, à former par PXC-01 partie 2
    (CC l.89-91, l.1148-1150 ; la partie est une lecture, §7 doute 5) ; porteur PAROXYSME, déclencheur F3 ; envoi : MONARK (MSG l.72 ;
    §7, doute 7) ;
  - un acte hors délégation (visibilité, argent, clés et comptes, publication) a pour porteur le fondateur, toujours par MONARK ; une
    lecture sur place a pour porteur MONARK ; tous sont écrits quand plusieurs existent.
- **Fenêtres du plan v3 §4** : F1 = §4.1, semaine du 2026-10-07 ; F2 = §4.2, du 2026-10-14 au service de la vague 1 (vers le
  2026-10-20) ; F3 = §4.3, du 2026-10-21 au 2026-11-16 ; F4 = §4.4, du 2026-11-17 au 2026-12-31 ; F5 = après le 2026-12-31, avec ligne
  d'attente datée au versement (PLAN l.617-618).
- **États** : `ouvert` ; `changé` (l'état à la tête diffère de l'inventaire, dit en suite) ; `clos (preuve : …)`. Aucune entrée ne change
  à la tête ; L-02, L-03 et L-05 gardent `changé` au sens de l'inventaire (changé depuis le 2026-09-27, INV-S l.37), dit en suite.
- **Abréviations** : ETAT = `docs/ETAT.md` ; ADR-CM = `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` ; M017 =
  `docs/adr/ADR-M017-attested-price-dans-gate.md` ; CC = `CHANTIERS-CANDIDATS.md` ; PLAN = `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` ;
  INV-S et INV-M = inventaires de Shōgen et du Moteur (lignes du fichier) ; CL = règles de l'investisseur (copie versée dans la boîte) ;
  FICHE et REG27 = fiche Shōgen et registre de l'étude du 2026-09-27 (copies caviardées dans la boîte), PX-Shogen-n étant les items de
  FICHE §2 et C1 à C8 les campagnes de REG27 l.162-169. Dépôt Shōgen (privé, `d383a51`) : 08 = registre des hypothèses (v4 du
  2026-09-30) ; ANB = `docs/adr-0028/ANNEXE-B-items.md` ; ADR-0028 = `docs/adr-0028/ADR-0028-decisions-sortie-S2.md` ; PS2 =
  `docs/adr-0028/PARTIES-S2.md` ; PASS = `docs/PASSATION-CLOUD.md` ; CARTO = `docs/rapports/cartographie-2026-09-29.md`. Cartographie
  Shōgen du 2026-09-29, hors dépôt : DP = `dettes-paroxysme.md`, TR = `TRANSMISSION-MONARK-2026-09-29.md`. RECHERCHES : CONTRACT =
  `kata/spec/CONTRACT-1.1.0.md` ; 0005 et 0002 = ses décisions de ces numéros. Toutes sont citées par la ligne que l'inventaire a lue
  (§7, doute 1).

## 1. Dettes : limites sans item, sans porteur ou sans déclencheur

- Aucune dette : toutes les entrées ouvertes des §2 et §3 portent un item, un porteur et un déclencheur ; le contrôle est mécanique
  (§7, doute 10).
- Les six limites côté MONARK que l'inventaire compte « sans item » (part MONARK de N-03, N-05, N-12, N-13, N-14, N-15 ; INV-S l.236)
  ont un chantier : PXC-08, PXC-01, PXC-05, PXC-08 et PXC-16, PXC-02, PXC-01. Les douze côté Shōgen (L-37, L-38, L-40, L-42, L-43, L-45,
  L-47, L-48, L-49, L-52, L-53, S-05 ; INV-S l.237) ont pour item une demande au mainteneur, à former par PXC-01 partie 2 (F3) et
  envoyée par MONARK (MSG l.72) : aucune dette au sens de la convention CC §4.1 (l.1136, l.1147-1150), mais douze limites sans item de
  recherche tant que le mainteneur n'en forme pas.

## 2. Limites du 2026-09-27 : état à la tête (35, INV-S §4 ; 3 changées)

### 2.1 Côté MONARK : outil `attest`, couture, surfaces (L-01 à L-06)

- **L-01** · « README « A price an application can defend… » face au témoin servi « demonstrative, not probative » ; la jointure dort. »
  source : `README.md:33` ; `packages/monark/src/adapter-shogen.ts:41` ; ADR-0028 D9 T0 l.222 · touche : `README.md:33`, `:95`, `:104` · nature : Dr/T
  item : PXC-02 PUBLIC-SENTENCES-2, noyau de la partie 1 (README l.33 aligné, PLAN l.664-665) ; PXC-08 SHOGEN-SEAM-1, partie 2 (jalon G2) ;
    PX-Shogen-1 ; SHOGEN-VITRINE-MONARK-1 (ANB l.62) · porteur : PAROXYSME ; envoi du site et release du miroir : le fondateur
    · déclencheur : tâche 2 du TABLEAU (ADR de PXC-02, puis la PR du noyau ; F1) ; partie 2 de PXC-08 (F4)
  état : ouvert (aggravé : la jointure dort, INV-S l.77) · suite : « defend » ne redevient exact qu'au jalon G2 ou G9 (N-16)
- **L-02** · « Table de la couture : appartenance exacte à une URL commise, alors que le vérificateur ne lie que l'hôte. »
  source : `apps/harness/src/attestation-binding.ts:34-39`, `:62-65` ; `apps/harness/src/tools/gate.ts:949-953` ; 08 l.40 ; 0005 l.121 ·
    touche : `apps/harness/src/tools/gate.ts:258` (« exact committed-URL membership ») · nature : T/C
  item : PXC-08 SHOGEN-SEAM-1, partie 3 (G5 : hôte seul lié, requête klines porteuse) ; SHOGEN-G5-FORM-REQUEST-1 (PLAN l.902) ; PX-Shogen-2 ;
    ATTEST-KATA-SUBJECT-1 (ADR-CM l.191, INV-S l.78, à re-former à ETAT) · porteur : PAROXYSME ; la demande : MONARK (MSG l.72) ; la
    forme (G5) : le fondateur (ETAT l.274-275 à `5437cd0d` ; §7, doute 13) · déclencheur : la demande, avec N-02 (PLAN l.557, F1) ;
    partie 3 (F5) ; re-formation : PXC-01 partie 2 (F3)
  état : changé (seule la ligne de `btc-dir-15m`, retirée, a un sujet ; tout `attested` est refusé) · suite : `changé` au sens de
    l'inventaire (INV-S l.37) ; ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` (PLAN l.617-618) ; DECISIONS l.1887-1904
    (§7, doute 1)
- **L-03** · « Auto-notarisation : verdict S3 démonstratif, assurance « aucune » ; la cible monte à un quorum d'attesteurs du même sujet. »
  source : 08 l.15, l.20 ; 0005 l.121 (AD-K-7) · touche : `README.md:33` ; label (`packages/monark/src/adapter-shogen.ts:41`) · nature : T/P
  item : PXC-07 TRUSTLESS-READ-2, partie 1 (campagne R3, quorums de notaires) ; PXC-08 partie 3 (quorum du sujet kata) ;
    SHOGEN-G4-NOTAIRE-RECHERCHE-1 (ANB l.25) ; PX-Shogen-3 · porteur : PAROXYSME ; mainteneur Shōgen (G4) ; dépense d'un notaire : le fondateur
    · déclencheur : campagnes de lecteurs en F3 (PLAN l.605) ; G4, « maintenant (sans code) » (ANB l.25) atteint sans acte prouvé : le
    relevé de son état auprès du mainteneur dans la demande de PXC-01 partie 2 (F3 ; ETAT l.256 à `5437cd0d` ; §7, doute 11) ; partie 3
    de PXC-08 (F5) ; re-formation : PXC-01 partie 2 (F3)
  état : changé (cible relevée, INV-S l.224) · suite : `changé` au sens de l'inventaire (INV-S l.37) ; ligne d'attente datée (P-25) :
    ETAT l.270-273 à `5437cd0d` (PLAN l.617-618) ; côté MONARK de G4 ≈ 3 j (estimation de l'inventaire) ; dépense :
    ADR-0028 §4 pt 6 l.257
- **L-04** · « Le vérificateur n'est jamais exécuté à l'appel ; le capteur complet est « under test, not served ». »
  source : `apps/harness/src/tools/attest.ts:6-7`, `:33-35` ; `apps/site/lib/shogen-copy.ts:8-10` ; ADR-0028 l.226 (G2 : wasm32 d'abord) ·
    touche : `apps/site/components/shogen-panel.tsx:71-72` ; `README.md:179-180` (critère 4) · nature : C
  item : PXC-08 SHOGEN-SEAM-1, partie 2 (MONARK-SHOGEN-VERIF-EXEC-1, ANB l.146, à transcrire : test
    `attest_reexecutes_verifier_refuses_mutated_utterance`) ; PX-Shogen-3 ; M017 l.111, item (a), témoin vivant (INV-S l.80 ; ADR, à
    former) · porteur : PAROXYSME · déclencheur : partie 2 de PXC-08 (F4, PLAN l.613-614)
  état : ouvert · suite : ce jalon G2 clôt l'exception (N-16) ; l'outil ne lance aucun processus (`apps/harness/src/tools/attest.ts:9-12`) ;
    l'oracle de l'étape 4b de la sonde h5 lit la même fixture que l'adaptateur : point couvert ici (doute 6 de l'inventaire, INV-S l.279)
- **L-05** · « « P1 DECLARES — never VERIFIES » et « no temporal binding » : `observed_at` n'est jamais comparé. »
  source : `apps/harness/src/attestation-binding.ts:4`, `:14` ; ADR-CM l.189 ; 08 l.39 (A(freshness-above)) · touche :
    `apps/harness/src/tools/gate.ts:261` (description servie) · nature : T/C
  item : PXC-08 SHOGEN-SEAM-1, partie 3 (garde `observed_at` sur le gabarit `produced_at` de 300 s : MONARK-SHOGEN-FRAICHEUR-1, ANB l.148,
    à transcrire) ; PX-Shogen-4 ; M017 l.117, liaison temporelle (INV-S l.81 ; ADR, à former) · porteur : PAROXYSME · déclencheur :
    partie 3 de PXC-08, après CM-4 (F5) ; re-formation : PXC-01 partie 2 (F3)
  état : changé (la couture dort, ADR-CM l.189) · suite : `changé` au sens de l'inventaire (INV-S l.37) ; ligne d'attente datée (P-25) :
    ETAT l.270-273 à `5437cd0d` (PLAN l.617-618) ; Roughtime -19 en file RFC (PX-IDENT-B l.89) ; même phrase : registre Hikae, L16
- **L-06** · « Décodeur TS : le prédicat de canonicité de `subject` (ADR-0016 de Shōgen) n'est pas porté. »
  source : `packages/monark/src/cbor-canonique.ts:24-28` ; `fixtures/PROVENANCE-s3-binance.md:82-84` · touche : `README.md:274`
    (« mirroring Shōgen's decoder ») · nature : C
  item : PXC-08 SHOGEN-SEAM-1, partie 1 (test différentiel nommé contre `subject.rs`, à former) ; PX-Shogen-5 (C4) · porteur : PAROXYSME ;
    corpus de fuzz : mainteneur Shōgen (ANB l.28) · déclencheur : partie 1 de PXC-08, release de textes servis (F3, PLAN l.593)
  état : ouvert · suite : McKeeman [2nd], p. 100 à lire sur place, demande formée (PLAN l.866) ; le décodeur compte dès qu'un `attested` passe

### 2.2 Propriétaire Shōgen (L-07 à L-35 ; effort MONARK nul selon INV-S l.39, hors volets des chantiers)

- **L-07** · « Contrôle de transport délégué au binaire compagnon. »
  source : 08 l.36 ; `fixtures/s3-binance.verdict.txt:16` · touche : aucune · nature : P
  item : ADR-0015 pt 11 ; WISHLIST P3bis n°5 (dépôt Shōgen) · porteur : mainteneur Shōgen · déclencheur : non reporté par l'inventaire
    (« bloqué par : Shōgen », INV-S l.83 ; §7, doute 6) ; relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert (couvert au dépôt Shōgen) · suite : aucune
- **L-08** · « Amont TLSNotary en alpha ; aucune analyse arbitrée du MPC-TLS. »
  source : 08 l.37 ; PX-IDENT-B l.82 · touche : aucune aujourd'hui (revendication future `tlsn-mpc/1`) · nature : P/T
  item : PXC-08 SHOGEN-SEAM-1, lentille A1 (TLS-N, DECO, QuickSilver ; CC l.291-292) ; PX-Shogen-6 (C4) · porteur : PAROXYSME ; mainteneur
    Shōgen · déclencheur : le choix de l'œuvre (Q2 de PX-IDENT-B), puis l'ADR de PXC-08, avant sa partie 1 (F3)
  état : ouvert (faits mis à jour : QuickSilver identifié ; collision « Lauinger » → Luo et al., INV-S l.84) · suite : C4 non lancée
- **L-09** · « Double compilation Windows rouge (`TimeDateStamp` COFF). »
  source : 08 l.35 ; PX-IDENT-B l.108 (`/Brepro` NON TROUVÉ) · touche : « recalculable par quiconque » (texte de Shōgen) · nature : C
  item : PXC-11 THIRD-PARTY-1, partie 4 (volet C6 REPRO-3P-1, mutualisé avec KATA-CR-LIBM-1 : CC l.382, INV-M l.157) ; PX-Shogen-7 (C6)
    · porteur : PAROXYSME ; mainteneur Shōgen ; identité et lecture sur place de `/Brepro` : MONARK · déclencheur : PX-IDENT-C0BIS-1
    (PLAN l.545, l.870 ; F1) ; partie 4 de PXC-11 (F4, PLAN l.614)
  état : ouvert · suite : même limite que L-50
- **L-10** · « Solidité de rustc supposée, jamais établie. »
  source : 08 l.34 ; PX-IDENT-B l.29, l.117 (Wheeler, ACSAC'05) · touche : « recalculable par quiconque » (texte de Shōgen) · nature : T
  item : PXC-11 THIRD-PARTY-1, partie 4 (volet C6 REPRO-3P-1) ; PX-Shogen-8 (C6) · porteur : PAROXYSME ; mainteneur Shōgen · déclencheur :
    partie 4 de PXC-11 (F4) ; C6 non lancée
  état : ouvert · suite : Wheeler libre, lecture sous go de téléchargement (PLAN l.866)
- **L-11** · « Correction du typeur jamais déchargée. »
  source : 08 l.27 · touche : aucune (nombre typé lu côté Hikae ; couture dormante) · nature : T
  item : PX-Shogen-9 (C4, étude du 2026-09-27, hors du dépôt Shōgen : à former, CC l.36-37) ; demande au mainteneur Shōgen, à former
    par PXC-01 partie 2 (§7, doute 14) · porteur : mainteneur Shōgen ; la demande : PAROXYSME · déclencheur : G6, typeur du sujet servi
    (INV-S l.87) ; partie 2 de PXC-01 (F3)
  état : ouvert · suite : Knight-Leveson détenu (INV-S l.182)
- **L-12** · « SHOULD NOT de RFC 9110 adressé aux origines, incontrôlable. »
  source : 08 l.38 · touche : aucune · nature : T/M
  item : PX-Shogen-10 (C8) · porteur : mainteneur Shōgen ; lecture sur place : MONARK · déclencheur : lecture sur place des conditions
    d'usage des origines (INV-S l.88) ; C8 non lancée
  état : ouvert · suite : aucune étude empirique identifiée (INV-S l.183)
- **L-13** · « A(attestor-honesty), A(enclave-integrity), A(source-key), A(verifier-designation). »
  source : 08 l.16-19 · touche : aucune · nature : T/P
  item : PXC-08 SHOGEN-SEAM-1, lentille A1 (CC l.291-292) ; PX-Shogen-11 (C4) · porteur : PAROXYSME ; mainteneur Shōgen · déclencheur :
    le premier adapter de chaque transport (INV-S l.89) ; l'ADR de PXC-08, avant sa partie 1 (F3)
  état : ouvert · suite : CONIKS et Foreshadow libres ; RFC 6962 rendue obsolète par RFC 9162 (INV-S l.184)
- **L-14** · « A(axis-coverage) ; un amont qui bruite ses copies ; aucun seuil de fusion « contenu ». »
  source : 08 l.28 ; `r2.py` l.27-33, l.198 (dépôt Shōgen) · touche : aucune · nature : T
  item : PX-Shogen-12 ; SHOGEN-DONG-CORPS-1 (ANB l.183) ; SHOGEN-CONTENU-DEP-1 (ANB l.103) · porteur : mainteneur Shōgen · déclencheur :
    C7 après l'exécution unique S2 (ANB l.50)
  état : ouvert · suite : Dong 2009 en accès ouvert : le procurement P-A 3 devient une lecture (INV-S l.185)
- **L-15** · « A(window-stationarity) ; τ de 48 h, « seuil de départ ». »
  source : 08 l.29 ; ANB l.32 · touche : aucune · nature : T/M
  item : PX-Shogen-13 ; SHOGEN-TAU-REDERIV-1 (ANB l.32) · porteur : mainteneur Shōgen · déclencheur : l'exécution unique S2, non faite
    (PS2 l.8-11) ; C7 après elle
  état : ouvert · suite : même item que L-24 et L-26
- **L-16** · « A(history-integrity) : décharge récursive et partielle. »
  source : 08 l.32 · touche : aucune · nature : T
  item : PXC-15 LOG-TIME-2, partie 1 (campagne L1, CC l.489, l.498) ; PX-Shogen-14 (C5/C8) ; SHOGEN-SCEAU-ANCRE-1 (ANB l.58, l.105)
    · porteur : PAROXYSME ; mainteneur Shōgen ; l'ancrage : le fondateur · déclencheur : campagnes de lecteurs en F3 (PLAN l.605) ; l'acte d'ancrage
  état : ouvert · suite : jeton RFC 3161 sur le paquet (ANB l.105) ; Crosby-Wallach détenu (INV-S l.187)
- **L-17** · « Un seul résolveur ; IPv6 non couvert (forme Cymru) ; pages lues via un résumeur. »
  source : `RUNBOOK-campagne.md` l.168, l.172 (dépôt Shōgen) · touche : aucune · nature : M/D
  item : PXC-07 TRUSTLESS-READ-2, partie 1 (campagne R3 ; conditions RIPEstat, Cymru, CAIDA, CC l.264-265) ; PX-Shogen-15 (C7) · porteur :
    PAROXYSME ; lecture sur place des conditions : MONARK (PLAN l.877) ; mainteneur Shōgen · déclencheur : la lecture sur place, avant
    tout chercheur ; campagnes de lecteurs en F3 (PLAN l.605) ; C7 après l'exécution unique
  état : ouvert · suite : Mao et al. 2003 reçu (PXP-19), non lu
- **L-18** · « Relation k_eff ↔ f « [À décider] ». »
  source : doc 04 de Shōgen (inchangé depuis `91d9781`) · touche : aucune · nature : T
  item : PX-Shogen-16 (C8) · porteur : mainteneur Shōgen · déclencheur : S4 (INV-S l.94)
  état : ouvert · suite : Chainlink OCR v1.2, Lemme 8, détenu (INV-S l.189)
- **L-19** · « R1 mesure le passé et ne borne pas un adversaire qui ne s'est pas exprimé. »
  source : doc 04 de Shōgen · touche : aucune · nature : T
  item : PX-Shogen-17 (C8) · porteur : mainteneur Shōgen · déclencheur : S4 ; C8 non lancée (INV-S l.95)
  état : ouvert · suite : C1 NARABI-THEORY-1 rendue ; PXP-01 clos par substitution (décision 277)
- **L-20** · « Qualité du marché sous-jacent non mesurée. »
  source : doc 04 de Shōgen · touche : aucune · nature : T/D
  item : PXC-18 JURISTE-DROIT-1, partie 2 (session Kaiko, sous go, CC l.583-584) ; PX-Shogen-18 (C8) · porteur : PAROXYSME ; la session
    Kaiko : le fondateur ; mainteneur Shōgen · déclencheur : le go du fondateur ; partie 2 de PXC-18 (F4, PLAN l.614)
  état : ouvert · suite : Kyle (PXP-28) et Amihud (PXP-29) reçus, non lus, vont à la demande au mainteneur (PLAN l.869), à former par
    PXC-01 partie 2
- **L-21** · « Contraste TIFS 2016 / Vendi « dû tel quel ». »
  source : doc 04 de Shōgen ; ADR-0026 l.22 (DP §F1) · touche : aucune · nature : T
  item : PX-Shogen-19 (C8) · porteur : mainteneur Shōgen · déclencheur : non reporté par l'inventaire (« bloqué par : Shōgen », INV-S l.97 ;
    §7, doute 6) ; relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert · suite : ADR-0026 l.22 reste un « dû » nu au dépôt Shōgen (INV-S l.97)
- **L-22** · « Corpus d'attaques du certificat (classes numérotées) dû. »
  source : doc 04 de Shōgen · touche : aucune · nature : T
  item : PX-Shogen-20 (C8) · porteur : mainteneur Shōgen · déclencheur : non reporté par l'inventaire (« bloqué par : Shōgen », INV-S l.98 ;
    §7, doute 6) ; relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert · suite : Qin détenu (copie Ukemi) ; Schneier 1999 (INV-S l.193)
- **L-23** · « φ entre singletons = proxy bruité ; NON_EVAL compté 0. »
  source : `lm.py` l.37-39, l.62-63 (dépôt Shōgen, mise en garde publiée) · touche : aucune · nature : T/M
  item : PX-Shogen-21 (C7/C8) ; procurement Agresti, Categorical Data Analysis, 3ᵉ éd., ISBN 978-0-470-46363-5 (ADR-0028 §4 pt 9 ;
    PLAN l.862) · porteur : mainteneur Shōgen (demande, ADR-0028 §4 pt 9) ; l'achat : le fondateur, par MONARK (PLAN l.854, l.861-862)
    · déclencheur : la réception de la 3ᵉ éd. ; C7 après l'exécution unique
  état : ouvert · suite : PXP-30 servi est un autre ouvrage (INV-S l.99, l.194)
- **L-24** · « Borne de Clopper-Pearson à k = 0 ; « on ne revendique pas 0 ». »
  source : ADR-0022 de Shōgen ; ANB l.32 · touche : aucune · nature : M
  item : PX-Shogen-13 (re-dérivation après le rendu, ANB l.32) · porteur : mainteneur Shōgen · déclencheur : l'exécution unique S2 (INV-S l.100)
  état : ouvert · suite : même item que L-15 et L-26
- **L-25** · « Chainlink : bande aveugle assumée (ADR-0022 l.29). »
  source : ADR-0022 l.29 (dépôt Shōgen) ; PX-IDENT-C M-04 · touche : aucune · nature : M/T
  item : PX-Shogen-22 (C7) · porteur : mainteneur Shōgen · déclencheur : C7 après l'exécution unique S2 (INV-S l.101)
  état : ouvert · suite : page « Decentralized Data Model » identifiée ; les valeurs par flux sont ailleurs (INV-S l.101)
- **L-26** · « Matrice φ à τ hétérogènes ; clause `closure` reportée. »
  source : DP §F1 · touche : aucune · nature : M
  item : PX-Shogen-13 (l'ADR de re-dérivation y est absorbée) · porteur : mainteneur Shōgen · déclencheur : l'exécution unique S2 (INV-S l.102)
  état : ouvert · suite : même item que L-15 et L-24
- **L-27** · « Cadence de `coins.llama.fi` non caractérisée ; le procurement est caduc dans sa forme. »
  source : PX-IDENT-C M-01 (NT-06 : dépôt nommé en 404) · touche : aucune · nature : D
  item : PXC-01 PAROXYSME-STANDARD-1, partie 2 (procurement P-A 4 reformé en instrumentation, CC l.91) ; PX-Shogen-23 (C7) · porteur :
    PAROXYSME ; lecture sur place DefiLlama : MONARK (PLAN l.877) ; mainteneur Shōgen · déclencheur : partie 2 de PXC-01 (F3, PLAN l.585) ; C7
  état : ouvert (procurement caduc dans sa forme) · suite : instrumentation sur les journaux scellés (INV-S l.103)
- **L-28** · « Lecture Pyth on-chain ; publishers non vérifiables (mémoire du 19/08). »
  source : PX-IDENT-C M-09 ; CARTO §0 pt 3 (Pyth en HTTP 401 dès le 2026-08-26) · touche : aucune · nature : D/P
  item : PX-Shogen-24 ; SHOGEN-POOL-ANALYSE-PYTH-1 (ANB l.13) · porteur : mainteneur Shōgen ; lecture sur place : MONARK · déclencheur :
    lecture sur place de la note Chaos Labs (INV-S l.104) ; C7
  état : ouvert (faits corrigés : la note date du 21 août 2024) · suite : voisin de L-40
- **L-29** · « Pannes accrues pendant le double pilote, « causalité non établie ». »
  source : CARTO §0 pt 2, §3 · touche : aucune · nature : M
  item : PXC-01 PAROXYSME-STANDARD-1, partie 2 (corrigendum IJE à lire, CC l.91) ; PX-Shogen-25 (C7) · porteur : PAROXYSME ; mainteneur
    Shōgen · déclencheur : partie 2 de PXC-01 (F3) ; C7 après l'exécution unique
  état : ouvert (mécanisme établi, effet causal non estimé) · suite : corrigendum IJE 50(3):1045 libre (PLAN l.866) ; PXP-20 reçu, non lu
- **L-30** · « A(coupling-effect), A(gate-adequacy). »
  source : 08 l.53-54 · touche : aucune · nature : T
  item : PXC-11 THIRD-PARTY-1, partie 4 (volet C6 REPRO-3P-1 : mutation et effet de couplage, REG27 l.167) ; PX-Shogen-26 (C6) · porteur :
    PAROXYSME ; mainteneur Shōgen · déclencheur : partie 4 de PXC-11 (F4) ; C6 non lancée
  état : ouvert · suite : Offutt (PXP-26) et Just (PXP-27) « non lus » pour l'inventaire, « lus » pour le plan (§7, doute 8)
- **L-31** · « Aucun « k_eff Pocket ». »
  source : DP §F1 (ADR-0026 au stade G0) · touche : aucune · nature : M/Dr
  item : PXC-18 JURISTE-DROIT-1, partie 2 (actes de l'investisseur, CC l.583-584) ; doc 15 §10 P-3/P-G6 (dépôt Shōgen) · porteur :
    PAROXYSME ; le go : le fondateur ; mainteneur Shōgen · déclencheur : le go du fondateur ; partie 2 de PXC-18 (F4)
  état : ouvert (couvert au dépôt Shōgen) · suite : documents Pocket sensibles, non ouverts par l'inventaire
- **L-32** · « D11 vérifiée au niveau MONARK ; entité non constituée. »
  source : ADR-0027 de Shōgen (stade G0) · touche : aucune · nature : Dr
  item : PXC-18 JURISTE-DROIT-1, partie 2 (acte de l'investisseur, CC l.583-584) ; doc 15 G-1r/G-6 (dépôt Shōgen) · porteur : PAROXYSME ;
    l'acte : le fondateur ; mainteneur Shōgen · déclencheur : l'acte du fondateur ; partie 2 de PXC-18 (F4)
  état : ouvert (couvert au dépôt Shōgen) · suite : voisin de L-42
- **L-33** · « Pocket : TODO de contestation, audit hors Nodefleet, corps discordants. »
  source : `docs/pocket-report/` de Shōgen (non ouvert : sensible) · touche : aucune · nature : D/M
  item : PXC-18 JURISTE-DROIT-1, partie 2 (CC l.583-584) ; PX-Shogen-27 ; doc 15 §10 · porteur : PAROXYSME ; le courriel : le fondateur ;
    mainteneur Shōgen · déclencheur : le courriel, acte sortant sous go (PLAN l.894 ; adresse masquée) ; partie 2 de PXC-18 (F4)
  état : ouvert (non re-mesuré) · suite : aucune
- **L-34** · « Coupures, lignes déchirées, garde de boucle (un sous-item sur trois clos). »
  source : ANB l.42, l.44, l.66 · touche : aucune · nature : C
  item : SHOGEN-TORN-LINE-1 ; SHOGEN-UPS-1 (ANB l.42, l.44) · porteur : mainteneur Shōgen ; l'onduleur : le fondateur · déclencheur :
    « G0 de la prochaine collecte longue » (ANB l.42, l.44)
  état : ouvert (SHOGEN-LOOP-GUARD-1 fermé, ANB l.66) · suite : aucune
- **L-35** · « notClaim « that the price is true ». »
  source : `apps/site/lib/docs-pieces.ts:53` · touche : `apps/site/lib/docs-pieces.ts:53` ; `apps/site/components/shogen-panel.tsx:66-68` · nature : T
  item : PXC-02 PUBLIC-SENTENCES-2, partie 1, hors de la liste (a) du noyau (frontière publique, CC l.122) ; certificat 04 (par
    conception) ; PX-Shogen-1 · porteur : PAROXYSME ; mainteneur Shōgen · déclencheur : l'ADR de PXC-02 (tâche 2 du TABLEAU, F1)
  état : ouvert, par conception · suite : la phrase du panneau l.66-68 n'est plus exacte (N-03, INV-S l.50)

## 3. Limites nouvelles depuis le 2026-09-27 (39 ouvertes, INV-S §5 et §6 ; L-36 et N-11 closes au §4)

### 3.1 Côté MONARK (N-01 à N-16, INV-S §5 ; N-11 close au §4)

- **N-01** · « Jointure `attest → gate` dormante : tout `attested` est refusé ; `attest` redevient terminal. »
  source : `apps/harness/src/attestation-binding.ts:62-65` ; `apps/harness/src/tools/gate.ts:234`, `:1003-1004` ; ADR-CM l.186-191 ;
    ETAT l.1574-1577 ; CONTRACT l.85 · touche : `README.md:33`, `:205` ; `apps/site/components/shogen-panel.tsx:50-52` ; M017 l.110 · nature : C/P
  item : PXC-08 SHOGEN-SEAM-1, partie 3 (ATTEST-KATA-SUBJECT-1, ADR-CM l.191, à re-former à ETAT) ; F-12 (0002 l.173) ; AD-K-7 (0005 l.121)
    · porteur : PAROXYSME, avec le mainteneur Shōgen (ADR-CM l.191 nomme RECHERCHES) · déclencheur : partie 3 de PXC-08, après CM-4 (F5) ;
    re-formation : PXC-01 partie 2 (F3)
  état : ouvert (nouvelle : CM-2b et contrat 1.1.0) · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` (PLAN
    l.617-618) ; côté porte : registre du Harnais, MK-L26 et §6 ; prérequis : G5, G4, session klines
- **N-02** · « `fromShogen` ne recalcule jamais `sha256(utterance.bytes)` : `octets_recalcules` est lu dans le texte du verdict. »
  source : `packages/monark/src/adapter-shogen.ts:154-165`, `:245` ; recalcul en test seulement (`packages/monark/test/adapter-shogen.test.ts:128-129`)
    · touche : `apps/site/lib/docs-pieces.ts:46` ; `apps/site/components/shogen-panel.tsx:60-62` · nature : C
  item : PXC-08 SHOGEN-SEAM-1, partie 1, placée seule au PLAN §4.1 B (l.557 ; mutant tué) ; MONARK-SHOGEN-VERIF-EXEC-1 (ANB l.146)
    · porteur : PAROXYSME (§4.1 B, TABLEAU) · déclencheur : tâche 6 du TABLEAU, après la 2 (F1) ; fusion avant le SHA nommé d'E-2a (PLAN l.506-510)
  état : ouvert (dû pendant l'exception, CL l.39) · suite : sinon commande de diff (PLAN l.569-570) ; zone de `packages/monark/src` : INV-S l.253
- **N-03** · « Le `subject` servi est l'URL complète, seul l'hôte est lié ; la clause « ce que ce verdict NE dit pas » et deux résidus du 08 manquent. »
  source : `fixtures/s3-binance.verdict.txt:16` ; `packages/monark/src/adapter-shogen.ts:236`, `:238` ; `apps/site/data/harness-served.json:121` ;
    08 l.39-40 · touche : `apps/harness/src/tools/attest.ts:33-35` ; `apps/site/components/shogen-panel.tsx:66-68` ; `README.md:251` · nature : T/C
  item : PXC-08 SHOGEN-SEAM-1, partie 1 (ATTEST-NEGATIVE-SCOPE-1, à former) ; PXC-02, clause rendue à PXC-08 (CC l.141-143) ; G5 ;
    SHOGEN-E1-COPIES-GARDEES-1 (ANB l.141) · porteur : PAROXYSME ; mainteneur Shōgen ; la forme (G5) : le fondateur (ETAT l.274-275 à
    `5437cd0d` ; §7, doute 13) · déclencheur : release de textes servis (F3) ; copies : « G0 du lot MONARK G2, ou 2026-10-31 »
  état : ouvert (nouvelle : CARTO-MK-02 ; 08 v4) · suite : si la description de l'outil change, la trace h5 et son manifeste sont ré-épinglés
- **N-04** · « Sans support : « continuous testimonies across sources » et « measured independence of the sources » ; aucune garde du vocabulaire 09. »
  source : `apps/site/lib/shogen-copy.ts:9-10` (à l'octet, `test/site-docs.test.ts:609-610`) ; `apps/site/components/docs/piece-doc-page.tsx:144-147`
    · touche : les mêmes lignes · nature : Dr/T
  item : PXC-02 PUBLIC-SENTENCES-2, partie 1, hors de la liste (a) du noyau (CC l.121-122) ; SHOGEN-VITRINE-MONARK-1 (ANB l.62, partiel)
    · porteur : PAROXYSME ; la phrase de l'investisseur : le fondateur · déclencheur : l'ADR de PXC-02 (tâche 2, F1) ; au plus tard la fin de l'exception
  état : ouvert (nouvelle : CARTO-MK-04 et -05) · suite : G15 et G8 sans déclencheur côté MONARK (ADR-0028 l.222) ; le tweet reprend la phrase
- **N-05** · « Tuyau de registre Shōgen → MONARK absent : les items transmis par Shōgen n'ont aucune ligne au dépôt MONARK. »
  source : `git grep` nul à `87b821b0` (§7, doute 3) ; ETAT l.7-11 ; TR · touche : aucune · nature : C
  item : PXC-01 PAROXYSME-STANDARD-1, partie 2 (SHOGEN-TRANSMIS-ETAT-1, à former : transcrire à ETAT les items transmis et
    ATTEST-KATA-SUBJECT-1, ou les refuser par écrit) · porteur : PAROXYSME ; ligne d'ETAT et choix : MONARK (INV-S l.274)
    · déclencheur : partie 2 de PXC-01 (F3, PLAN l.585)
  état : ouvert (nouvelle) · suite : MONARK peut transcrire avant (gain rapide, 0,25 j, INV-S l.243)
- **N-06** · « Fixture servie sans contrôle d'identité inter-dépôts contre une release de Shōgen. »
  source : `fixtures/PROVENANCE-s3-binance.md` (empreintes, aucune release) ; `packages/monark/src/adapter-shogen.ts:48` ; CARTO §4 G1 ·
    touche : aucune · nature : C/P
  item : PXC-08 SHOGEN-SEAM-1, volet sous acte (manifeste de release, CC l.292) ; MONARK-SHOGEN-FIXTURE-MANIFESTE-1 (ANB l.147) · porteur :
    PAROXYSME ; visibilité du dépôt Shōgen : le fondateur · déclencheur : la clôture de S3 et le passage public du dépôt Shōgen (PLAN l.892) ;
    échéance à porter au fondateur par MONARK (ETAT l.274-276 à `5437cd0d` ; PLAN l.882, l.892 ; §7, doute 15)
  état : ouvert (nouvelle : lot E1, T-04) · suite : l'acte n'a pas d'échéance écrite ; voisin de L-53
- **N-07** · « Identifiants de résidus servis non résolus dans un registre publié : le 08 vit dans un dépôt privé. »
  source : `apps/site/data/harness-served.json:121` ; CARTO §4 G8 · touche : `README.md:251` ; `apps/site/components/shogen-panel.tsx:66-68` · nature : C/Dr
  item : PXC-08 SHOGEN-SEAM-1, volet sous acte (registre des résidus, ou glossaire, CC l.292-293) ; MONARK-SHOGEN-REGISTRE-1 (ANB l.149)
    · porteur : PAROXYSME ; visibilité : le fondateur · déclencheur : passage public du dépôt Shōgen (PLAN l.892), ou réponse sur le glossaire ;
    échéance à porter au fondateur par MONARK (ETAT l.274-276 à `5437cd0d` ; PLAN l.882, l.892 ; §7, doute 15)
  état : ouvert (nouvelle : CARTO-MK-10) · suite : un glossaire côté MONARK serait-il une revendication neuve ? (INV-S l.278)
- **N-08** · « Aucune sortie S2 servie : l'arête G9 (`docs/11` de Shōgen vers MONARK) est absente. »
  source : ADR-0028 l.238-248 (« État du tuyau : absent ») ; PASS l.15 (S2 à la partie 2) · touche : `apps/site/lib/shogen-copy.ts:9-10` ;
    `README.md:104` · nature : C/D
  item : PXC-08 SHOGEN-SEAM-1, volet G9 (test `shogen_s2_report_offline_recompute_matches_published`) ; SHOGEN-S2-TUYAU-MONARK-1 (ANB l.59)
    · porteur : PAROXYSME ; S2 : mainteneur Shōgen ; J14/J28 : le fondateur · déclencheur : G0 du lot G9, après S2 parties 2 à 4 et la
    publication (PLAN l.892) ; échéance à porter au fondateur par MONARK (ETAT l.274-276 à `5437cd0d` ; PLAN l.882, l.892 ; §7, doute 15)
  état : ouvert (nouvelle, ADR-0028 §3) · suite : G9 est l'autre jalon de fin de l'exception (N-16)
- **N-09** · « Lecture intermédiaire de statistiques S2 par MONARK (`measure-m009a`, instantané du 18/09) non mesurée. »
  source : `scripts/measure-m009a.mjs` ; `docs/measure-M009a.md:5-7` ; `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md:161` ; ANNEXE-D
    l.14 (« non établi ») · touche : aucune (intégrité du futur chiffre S2) · nature : M
  item : PXC-08 SHOGEN-SEAM-1, partie 1 (qui a vu `measure-M009a.md`, CC l.294) ; MONARK-S2-M009A-EXPOSITION-1 (ANB l.51) · porteur :
    PAROXYSME · déclencheur : avant le scellement du paquet S2 (partie 3 de S2, non commencée) ; sinon partie 1 de PXC-08 (F3)
  état : ouvert (nouvelle : CARTO-MK-07) · suite : la date du scellement est au dépôt Shōgen ; la mesure tient en 0,25 j (INV-S l.247)
- **N-10** · « L'arête S4 → `gather` de Kraidle n'a pas d'item côté MONARK. »
  source : ANB l.26 · touche : aucune · nature : C
  item : SHOGEN-KRAIDLE-GATHER-1 (ANB l.26) · porteur : MONARK et Kraidle (ANB l.26, INV-S l.126) ; transcription ou refus à ETAT :
    MONARK (N-05) · déclencheur : G0 de S4 (ANB l.26) ; son placement : la recartographie de PXC-01 partie 2, qui lui donne un
    déclencheur (F3 ; MSG l.74)
  état : ouvert (nouvelle : CARTO-MK-08) · suite : effort MONARK nul maintenant ; absent d'ETAT, comme les autres items transmis (N-05) ;
    CC l.706 ne la marque que `SHOGEN` ; son chantier côté MONARK sort de cette recartographie (§7, doute 12)
- **N-12** · « Le contrôle `attest_call` de la CA ne lit que « demonstrative » ; ni la CA ni le miroir n'épinglent les valeurs du témoin servi. »
  source : `scripts/verify-harness.mjs:392-396` ; `docs/G0-lot-cm-2b-surfaces.md:63` ; `apps/site/lib/fleet.ts:140-141` · touche :
    `README.md:179-180` (critère 4) · nature : M/C
  item : PXC-05 SERVED-CONTROL-1, reste de la partie 2 (CA-ATTEST-PIN-1, à former : lot, sujet et `sens_emis_digest` épinglés, CC l.204-205)
    · porteur : PAROXYSME ; CA engagée : MONARK · déclencheur : reste de la partie 2 de PXC-05 (F3, PLAN l.566-567)
  état : ouvert (nouvelle, déclarée le 2026-10-04) · suite : `apps/site/lib/fleet.ts:141` la confie à ATTEST-KATA-SUBJECT-1, qui ne la vise pas
- **N-13** · « Formats d'attestation hors du contrat 1.1.0 : aucun vecteur de conformité ; `residual` vide ; raisons `attestation_*` jamais produites. »
  source : CONTRACT l.21, l.85, l.138, l.187 ; 0005 addendum 3 l.35 · touche : `README.md:245-251` (« Eight frozen contracts ») · nature : C
  item : PXC-08 SHOGEN-SEAM-1, partie 1 (vecteurs `AttestedPrice`, à former) ; PXC-16 HARNESS-NEXT-1, partie 3 (volet version) · porteur :
    PAROXYSME ; version neuve : le fondateur · déclencheur : release de textes servis (F3, PLAN l.593) ; bascule 1.2.0 (F4, PLAN l.611)
  état : ouvert (nouvelle : contrat 1.1.0, effectif le 2026-10-06) · suite : la décision de version suit la réouverture de la couture (N-01)
- **N-14** · « « How it works » (statut built) et le schéma du README montrent `sensor (attest) → gate` comme construit. »
  source : `apps/site/components/shogen-panel.tsx:50-52` ; `README.md:204-205` ; `docs/G0-lot-cm-2b-surfaces.md:66` (la liste (d) omet le
    panneau) · touche : `apps/site/components/shogen-panel.tsx:50-52` ; `README.md:205` · nature : Dr
  item : PXC-02 PUBLIC-SENTENCES-2, noyau de la partie 1 (PLAN l.664-665 : statut de l'exception ; « the seam is dormant ») · porteur :
    PAROXYSME ; envoi du site et release du miroir : le fondateur · déclencheur : tâche 2 du TABLEAU (ADR, cp-1, validation, puis la PR ; F1)
  état : ouvert (nouvelle) · suite : correction vers moins de revendication, permise pendant l'exception (CL l.38-39 ; INV-S l.277)
- **N-15** · « Blocs « Living proof » et « Traceability » du panneau, `upcoming` : limites de plateforme jamais routées. »
  source : `apps/site/components/shogen-panel.tsx:75-77`, `:95-97` ; FICHE l.225 (Q5) ; REG27 l.199, écart (8) · touche :
    `apps/site/components/shogen-panel.tsx:75`, `:95` · nature : C
  item : PXC-01 PAROXYSME-STANDARD-1, partie 2 (routage, CC l.89 ; recartographies nourries par CARTO-BR-2026-10-1, PLAN l.833) · porteur :
    PAROXYSME ; la cartographie : MONARK (PLAN l.896, l.900) · déclencheur : partie 2 de PXC-01 (F3)
  état : ouvert depuis le 2026-09-27 (Q5, jamais numérotée) · suite : effort de la pièce nul (INV-S l.131)
- **N-16** · « Exception datée à la règle Branchement : Shōgen `built` alors que l'entrée servie est une fixture. »
  source : CL l.35-40 ; ETAT l.1574-1577 ; ADR-0028 l.292-293 ; `apps/harness/src/shogen-fixture.ts:23-31` ; `README.md:173-180`
    (critères 1 et 4 non tenus) · touche : `README.md:95`, `:104` ; `apps/site/lib/fleet.ts:133` · nature : C/Dr
  item : PXC-08 SHOGEN-SEAM-1, partie 2 (jalon G2, CC l.305-306) ; PXC-01 partie 2 (entrée et ligne de l'index, PLAN l.833) ; SHOGEN-VITRINE-MONARK-1
    · porteur : PAROXYSME ; l'exception et le label : le fondateur · déclencheur : le premier de G2 (F4, PLAN l.613-614) et de G9 (N-08),
    ou toute revendication publique nouvelle sur Shōgen (INV-S l.132 ; CL l.38)
  état : ouvert (exception en cours) · suite : le validateur cite l'écart à chaque cp-2 sans refuser (CL l.39-40) ; aucun label ne change

### 3.2 Propriétaire Shōgen (L-37 à L-53, S-01 à S-07, INV-S §6 ; effort MONARK nul selon INV-S l.39, hors volets des chantiers)

- **L-37** · « A(discipline-de-segment) et `decimal_prec` couplés par construction. »
  source : DP §F2 (INV-S l.136) · touche : aucune · nature : T
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 (C7 proposée ; voisin : SHOGEN-DECIMAL-ARRONDI-1, ANB l.232)
    · porteur : PAROXYSME · déclencheur : partie 2 de PXC-01 (F3)
  état : ouvert (non re-mesuré) · suite : aucune
- **L-38** · « Requêtes à corps (`eth_call`) hors du `subject` (ADR-0016 R5). »
  source : ADR-0016 R5 (dépôt Shōgen) ; DP §F2 · touche : aucune · nature : T
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 (C4 proposée) · porteur : PAROXYSME · déclencheur : partie 2 de
    PXC-01 (F3)
  état : ouvert · suite : voisin de L-02 (liaison de la requête)
- **L-39** · « Sources IDN hors périmètre (ADR-0016 C3). »
  source : ADR-0016 C3 (dépôt Shōgen) ; DP §F2 · touche : aucune · nature : T
  item : WISHLIST P3bis 6 (dépôt Shōgen, partiel) · porteur : mainteneur Shōgen · déclencheur : non reporté par l'inventaire (§7, doute 6) ;
    relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert · suite : aucune
- **L-40** · « A6 : `[` et `]` rejetés, donc Pyth non témoignable. »
  source : DP §F2 · touche : aucune · nature : T/D
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 (lien à PX-Shogen-24 proposé) · porteur : PAROXYSME
    · déclencheur : partie 2 de PXC-01 (F3)
  état : ouvert · suite : voisin de L-28
- **L-41** · « Clé du notaire dérivée d'une graine publique (ADR-0015 pt 16). »
  source : ADR-0015 pt 16 (dépôt Shōgen) ; DP §F2 · touche : aucune · nature : T
  item : SHOGEN-G4-NOTAIRE-RECHERCHE-1 (ANB l.25) · porteur : mainteneur Shōgen · déclencheur : le relevé de son état auprès du
    mainteneur dans la demande de PXC-01 partie 2 (F3 ; ETAT l.256 à `5437cd0d`), « maintenant (sans code) » (ANB l.25 ; INV-S l.79)
    étant atteint au plus tard à `d383a51` (2026-10-03, INV-S l.7) sans acte prouvé (INV-S l.176)
  état : ouvert · suite : fonde la cible relevée de L-03 ; état au dépôt Shōgen non revérifiable ici ; déclencheur re-formé (§7, doute 11)
- **L-42** · « Auto-mesure de MONARK « hors périmètre » (ADR-0027 l.14). »
  source : ADR-0027 l.14 (dépôt Shōgen) ; DP §F2 · touche : aucune · nature : Dr
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 (aucun item de recherche ; la décision 230 n'est qu'un cadre)
    · porteur : PAROXYSME · déclencheur : partie 2 de PXC-01 (F3)
  état : ouvert · suite : voisin de L-32
- **L-43** · « Composition d'amont Chainlink non établie (doc 10 §10.6). »
  source : doc 10 §10.6 (dépôt Shōgen) ; DP §F2 · touche : aucune · nature : D
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 (C7 proposée) · porteur : PAROXYSME · déclencheur : partie 2 de
    PXC-01 (F3)
  état : ouvert · suite : voisin de L-25 et L-49
- **L-44** · « Pages de méthode sans copie à l'octet ; pages ASN lues via un résumeur. »
  source : doc 10 de Shōgen (dette 4 re-statuée le 2026-09-30) ; DP §F2 · touche : aucune · nature : D
  item : SHOGEN-BIBLIO-PAGES-4-3-1 (ANB l.184) ; SHOGEN-FETCH-AVANT-PUB-1 (ANB l.46) · porteur : mainteneur Shōgen · déclencheur :
    SHOGEN-FETCH-AVANT-PUB-1, avant le G0 du lot G9 (INV-S l.155) ; SHOGEN-BIBLIO-PAGES-4-3-1, non reporté par l'inventaire (§7,
    doute 6) : relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert (réduit le 2026-09-30) · suite : voisin de L-17 et L-51
- **L-45** · « Replis permanents : roster Pyth et `coin-prices-api`. »
  source : DP §F2 · touche : aucune · nature : D
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 (C7 proposée) · porteur : PAROXYSME · déclencheur : partie 2 de
    PXC-01 (F3)
  état : ouvert · suite : aucune
- **L-46** · « N_min = 300 fondé sur « Fisher » sans source. »
  source : doc 10 de Shōgen (erratum du 2026-09-30) ; JOURNAL de Shōgen (`56cb407`) · touche : aucune · nature : M
  item : SHOGEN-REPORT-FISHER-1 (ANB l.47, l.107) ; P-03 (dépôt Shōgen) · porteur : mainteneur Shōgen · déclencheur : non reporté par
    l'inventaire (§7, doute 6) ; relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert (réduit : N_min déclaré choix de conception) · suite : Fisher 1921 téléchargé hors dépôt (INV-S l.150)
- **L-47** · « Silence de la licence MIT sur les brevets (doc 14 M1). »
  source : doc 14 M1 (dépôt Shōgen) ; DP §F2 · touche : aucune · nature : Dr
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 ; PXC-18 JURISTE-DROIT-1, partie 1 (avis, CC l.583) · porteur :
    PAROXYSME ; l'avis juridique : le fondateur · déclencheur : partie 2 de PXC-01 (F3) ; partie 1 de PXC-18 (F3, PLAN l.601)
  état : ouvert · suite : aucune
- **L-48** · « τ non numérique lève `InvalidOperation` au lieu d'une erreur nommée. »
  source : DP §F2 · touche : aucune · nature : C
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 (C7 proposée) · porteur : PAROXYSME · déclencheur : partie 2 de
    PXC-01 (F3)
  état : ouvert · suite : aucune
- **L-49** · « Exceptions de rounds Chainlink non investiguées. »
  source : DP §F2 · touche : aucune · nature : D
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 (C7 proposée) · porteur : PAROXYSME · déclencheur : partie 2 de
    PXC-01 (F3)
  état : ouvert · suite : voisin de L-43
- **L-50** · « Windows « à terme et sans date » (ADR-0012 D6). »
  source : ADR-0012 D6 (dépôt Shōgen) ; DP §F2 · touche : aucune · nature : C
  item : PX-Shogen-7 (C6) · porteur : mainteneur Shōgen ; lecture sur place de `/Brepro` : MONARK · déclencheur : la lecture sur place et
    la mesure (INV-S l.85) ; PX-IDENT-C0BIS-1 (PLAN l.545, l.870 ; F1)
  état : ouvert · suite : même limite que L-09, que PXC-11 couvre
- **L-51** · « Onze dettes de fetch « avant publication ». »
  source : DP §F2 · touche : aucune · nature : D
  item : SHOGEN-FETCH-AVANT-PUB-1 (ANB l.46) · porteur : mainteneur Shōgen · déclencheur : avant le G0 du lot G9 (INV-S l.155)
  état : ouvert (item formé au dépôt Shōgen) · suite : voisin de L-44
- **L-52** · « Lemme 8 OCR et RFC 5280 §3.3 hors du registre Shōgen. »
  source : DP §F2 · touche : aucune · nature : D
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 (la décision Q4 (a) reste à porter) · porteur : PAROXYSME
    · déclencheur : partie 2 de PXC-01 (F3)
  état : ouvert · suite : aucune
- **L-53** · « Aucune hypothèse de déploiement (D) alors que la fixture est servie par MONARK. »
  source : DP §F2 · touche : aucune · nature : T/C
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 (C4 proposée) · porteur : PAROXYSME · déclencheur : partie 2 de
    PXC-01 (F3)
  état : ouvert · suite : voisin de N-06
- **S-01** · « A(root-store), au registre 08 v4. »
  source : 08 l.21 · touche : aucune · nature : T
  item : SHOGEN-E1-RACINES-1 (ANB l.138) · porteur : mainteneur Shōgen · déclencheur : non reporté par l'inventaire (§7, doute 6) ;
    relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert (nouvelle) · suite : aucune
- **S-02** · « A(window-dependence). »
  source : 08 l.30 · touche : aucune · nature : T/M
  item : SHOGEN-DEP-FENETRES-2 (ANB l.98) · porteur : mainteneur Shōgen · déclencheur : non reporté par l'inventaire (§7, doute 6) ;
    relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert (nouvelle) · suite : aucune
- **S-03** · « A(loss-non-informative). »
  source : 08 l.31 · touche : aucune · nature : M
  item : SHOGEN-CENSURE-INFO-2 (ANB l.102) · porteur : mainteneur Shōgen · déclencheur : non reporté par l'inventaire (§7, doute 6) ;
    relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert (nouvelle) · suite : aucune
- **S-04** · « A(host-integrity). »
  source : 08 l.41 · touche : aucune · nature : T/C
  item : SHOGEN-E1-CLE-SIGNATURE-1 (ANB l.142) ; SHOGEN-SCEAU-ANCRE-1 (ANB l.58) · porteur : mainteneur Shōgen · déclencheur : non
    reporté par l'inventaire (§7, doute 6) ; relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert (nouvelle) · suite : aucune
- **S-05** · « A(harness-clock). »
  source : 08 l.42 · touche : aucune · nature : M
  item : demande au mainteneur Shōgen, à former par PXC-01 partie 2 (aucun item à l'annexe B : `grep` nul, INV-S l.162) · porteur :
    PAROXYSME · déclencheur : partie 2 de PXC-01 (F3)
  état : ouvert (nouvelle) · suite : aucune
- **S-06** · « A(agent-conformance). »
  source : 08 l.55 · touche : aucune · nature : T/C
  item : SHOGEN-E1-MAST-VERSEMENT-1 (ANB l.145, partiel) ; SHOGEN-E1-SCAN-TRANSCRIPTS-1 (ANB l.144) · porteur : mainteneur Shōgen
    · déclencheur : non reporté par l'inventaire (§7, doute 6) ; relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert (nouvelle) · suite : aucune
- **S-07** · « A(prereg-blindness). »
  source : 08 l.56 · touche : aucune · nature : M
  item : SHOGEN-E1-SCAN-TRANSCRIPTS-1 (ANB l.144) ; SHOGEN-ATTEST-ADVISOR-1 (ANB l.60) · porteur : mainteneur Shōgen · déclencheur : non
    reporté par l'inventaire (§7, doute 6) ; relevé dans la demande de PXC-01 partie 2 (F3 ; MSG l.73)
  état : ouvert (nouvelle) · suite : aucune

## 4. Limites closes (avec preuve)

- **L-36** · « Lecture asymétrique du z poolé « écrite d'avance » introuvable. » · clos (preuve : lot POOLEE accepté au dépôt Shōgen,
  `9b46687`, « POOLEE-STRATIFIEE-1 ferme » ; SHOGEN-POOLEE-STRATIFIEE-1, ANB l.15 ; INV-S l.140 ; source hors du tronc, §7, doute 1)
- **N-11** · « Le registre PAROXYSME de la pièce `built` manque au dépôt MONARK ; la fiche du 2026-09-27 est périmée. » · clos (preuve :
  ce registre, versé au tronc par #242, fusion `1df4e44f`, G7 `1eb37b87…` ; ETAT l.181-184 à `5437cd0d`, qui compte « Shōgen N-11 »
  parmi les limites « registre absent » que le versement clôt)

## 5. Limites marquées PAROXYSME apparues à ETAT depuis l'inventaire

Commandes (à la tête, sans réseau) : `git diff -U0 57a131fc 87b821b0 -- docs/ETAT.md | grep '^+' | grep PAROXYSME` donne dix lignes
ajoutées : huit limites nommées, un bloc (« Limites déclarées des textes figés de R4 v2 ») et une ligne de suite, que le registre du
Harnais (§5) rattache à lui-même (HT-01 à HT-07) et au registre de Narabi. La même commande sur `d8fe354c..57a131fc`, où l'inventaire
de Shōgen lit encore ETAT, ne donne aucune ligne. Aucune des dix ne nomme Shōgen, `attest` ou `attested` (`grep -c -i` nul sur ETAT
l.614-620, l.652-662, l.687-692, l.724-778, l.812-823, l.1075-1084, l.1101-1103 et l.1889-1898). Les lignes d'ETAT qui nomment Shōgen
ou la clé `attested` sont celles de `d8fe354c`, reportées : l.1277, l.1301 et l.1574-1577 à la tête (`grep -n -i 'shōgen\|attested'`,
hors `tls_unattested` et `source_unattested`). Aucune limite neuve à la tête pour Shōgen : l'étiquette `SHT-` n'est pas employée.

## 6. Renvois : limites d'autres pièces sur la couture `attest → gate` et l'outil `attest`

- Côté porte (`apps/harness`) : registre du Harnais, MK-L26 (ATTEST-KATA-SUBJECT-1, même item que N-01, PXC-08 partie 3) et son §6
  (PX-Shogen-2 à -5 et PX-Hikae-10 : clé `attested`, outil `attest`, renvoyés ici et au registre Hikae).
- Registre Hikae : L15 (attestation non revérifiée à l'appel, tout `attested` refusé), L16 (« no temporal binding in P1 », même phrase
  servie que L-05), L17 (BYO et `attested`, composition dormante, M017 l.117) ; même chantier, PXC-08 (CC l.294).
- Registre Bell : N-09 (BE-N-09 pour CC : BELL-PAGE-ORIGIN-1, transcription TLS des pages RPC) ; même chantier, PXC-08 (CC l.294-295).
- Registre Narabi : N02 (la classe refuse tout `attested` ; `AttestedFlow` reste hors de la version 1.1.0) : même cause que N-01 et N-13.
- FICHE (étude du 2026-09-27, hors du tronc) : ses items PX-Shogen-1 à -27 et ses questions Q1 à Q5 restent sa matière ; l'état est ici.

## 7. Doutes nommés (ce qui ne se reproduit pas tel quel à la tête)

1. **Sources hors du tronc.** Dépôt Shōgen (privé, `main` à `d383a51`) : 08, ANB, ADR-0028, PS2, PASS, CARTO, son JOURNAL, ses docs 04,
   10, 14 et 15, ses ADR-0012 à ADR-0027, `r2.py`, `lm.py`, `RUNBOOK-campagne.md`, WISHLIST, ANNEXE-D, `docs/pocket-report/` ;
   cartographie hors dépôt du 2026-09-29 : DP, TR ; RECHERCHES : CONTRACT, 0005, 0002 ; DECISIONS l.1887-1904, dont l'inventaire ne
   nomme pas le lieu (absent du tronc et de son historique). Leurs lignes sont celles que l'inventaire a lues ; elles ne sont pas relues
   ici. INV-S §0 donne une empreinte à ADR-0028, ANB, PS2, CARTO, au JOURNAL et à PASS (l.27-28), à DP et à TR (l.29) ; n'en ont pas :
   le 08, les docs 04, 10, 14 et 15, les ADR-0012 à ADR-0027, `r2.py`, `lm.py`, `RUNBOOK-campagne.md`, WISHLIST, ANNEXE-D et
   `docs/pocket-report/`. La preuve de clôture de L-36 (`9b46687`, dépôt Shōgen) n'est pas revérifiable ici. L-37 à L-53 reprennent des
   références du 2026-09-29 (Shōgen à `51e59f3`) que l'inventaire n'a pas relues (INV-S l.136, l.280). PX-IDENT-B et PX-IDENT-C ont des
   copies caviardées dans la boîte, non relues ici. Relus ici, dans la boîte : CL l.17-18, l.35-40 et l.48-49, FICHE l.225, REG27
   l.155-169 et l.199, SYNTHESE-NARABI-1 l.419-420.
2. **Base d'ETAT de l'inventaire.** INV-S lit ETAT à `d8fe354c` (empreinte `2ef6f107…`, INV-S l.19), quand ceux du Harnais et du Moteur
   le lisent à `57a131fc` : les ancres d'ETAT sont reportées depuis `d8fe354c`, et la commande du §5 est jouée sur les deux plages.
3. **Items absents d'ETAT à la tête.** Aucune limite de Shōgen n'avait d'item formé à ETAT à `87b821b0` ; à `5437cd0d`, seul
   SHOGEN-G4-NOTAIRE-RECHERCHE-1 (L-41) y est nommé, avec son déclencheur (ETAT l.256 à `5437cd0d` ; `grep -c` : 1, et 0 pour les
   autres items ci-dessous). `git grep` nul sur tout le tronc à `87b821b0` :
   les huit items transmis par Shōgen (MONARK-SHOGEN-VERIF-EXEC-1, MONARK-SHOGEN-FIXTURE-MANIFESTE-1, MONARK-SHOGEN-FRAICHEUR-1,
   MONARK-SHOGEN-REGISTRE-1, SHOGEN-S2-TUYAU-MONARK-1, MONARK-S2-M009A-EXPOSITION-1, SHOGEN-KRAIDLE-GATHER-1,
   SHOGEN-PAROXYSME-REGISTRE-1), `CARTO-MK`, SHOGEN-VITRINE-MONARK-1 et SHOGEN-G5-FORM-REQUEST-1. ATTEST-KATA-SUBJECT-1 a 11 occurrences
   (code : `apps/harness/src/tools/gate.ts`, `apps/site/lib/fleet.ts` ; G0 et G7 de CM-2b ; ADR-CM l.191 ; `docs/G0-bloc-d.md` ;
   `test/site-docs.test.ts`), aucune à ETAT. L'annexe B donne à MONARK le portage des huit (INV-S l.44) ; ici, chaque entrée les porte
   par un chantier, N-10 (SHOGEN-KRAIDLE-GATHER-1 : CC l.706 ne lui donne que `SHOGEN`) par la recartographie de PXC-01 partie 2
   (MSG l.74 ; doute 12), et leur transcription à ETAT, ou leur refus écrit, est à MONARK (N-05 ; INV-S l.274). Items du plan cités,
   absents d'ETAT : SHOGEN-G5-FORM-REQUEST-1 (PLAN l.902), PX-IDENT-C0BIS-1 (l.870, l.901), CARTO-BR-2026-10-1 (l.900).
4. **Empreinte de l'inventaire.** CC et PLAN citent INV-S à `0622af1e86d8` ; le fichier versé dans la boîte a `c7cd6f49…` : MONARK y a
   masqué deux occurrences d'une même adresse électronique (INV-S l.109, l.200 ; `dossier/README.md` l.123) avant le premier commit
   (`dossier/REDACTIONS.json` ; `dossier/README.md` l.118-132). Le nombre de lignes (291) ne change pas ; les numéros cités sont ceux du
   fichier versé, et l'adresse reste masquée ici (L-33).
5. **Parties que les fiches ne fixent pas.** CC rattache ces limites à un chantier sans en nommer la partie ; lecture retenue : L-01
   (PXC-08 partie 2 : la phrase redevient exacte au jalon G2) ; L-03 (PXC-08 partie 3, avec le quorum d'attesteurs de CC l.290) ; L-08 et
   L-13 (PXC-08, lentille A1) et N-06, N-07, N-08 (PXC-08, volets sous acte), que l'ADR de PXC-08 placera ; L-09, L-10, L-30 : PXC-11
   partie 4, par la mutualisation de REPRO-3P-1 avec KATA-CR-LIBM-1 (INV-M l.157) ; L-16 : PXC-15 partie 1 (campagne L1) ; L-03 et
   L-17 : PXC-07 partie 1 (campagne R3) ; L-20, L-31, L-32, L-33 : PXC-18 partie 2 (décisions et actes) ; L-47 : PXC-18 partie 1
   (avis) ; L-11 (la demande), L-27, L-29, N-15 et les douze sans item : PXC-01 partie 2 (PLAN l.833 ; CC l.36-37 nomme la partie 2 pour
   un item à former, CC l.89-91 et l.1149 ne nomment aucune partie pour la transmission) ; N-04 et L-35 : PXC-02 partie 1, hors de la
   liste (a) du noyau (PLAN l.644-665), que l'ADR de PXC-02 placera. Le cp-1 de chaque ADR relit ce choix.
6. **Déclencheurs que l'inventaire ne reporte pas.** L-07, L-21, L-22 (« bloqué par : Shōgen »), L-39, L-44 (pour
   SHOGEN-BIBLIO-PAGES-4-3-1 : INV-S l.155 ne date que SHOGEN-FETCH-AVANT-PUB-1, à la ligne de L-51), L-46, S-01 à S-04, S-06 et S-07.
   Leur item existe au dépôt Shōgen, sauf pour L-21 et L-22 : PX-Shogen-19 et -20, items de FICHE §2, étude hors dépôt. Leur
   déclencheur n'est pas dans l'inventaire. Le relever dans la demande de PXC-01 partie 2 (F3) étend cette transmission, que CC ne donne
   qu'aux douze sans item (l.89-91, l.1148-1150) et que le PLAN ne nomme pas pour la partie 2 (l.832-836). **Tranché** : MONARK étend la
   demande de PXC-01 partie 2 au relevé de ces déclencheurs (MSG l.73) ; les douze entrées disent « relevé dans la demande de PXC-01
   partie 2 (F3 ; MSG l.73) ».
7. **Porteur de SHOGEN-G5-FORM-REQUEST-1 et envoi des demandes au mainteneur Shōgen.** PLAN l.896 donne les items du plan à
   l'orchestrateur MONARK « sauf mention », et l.902 n'en porte aucune ; le TABLEAU ne donne à PAROXYSME que les chantiers du §4.1 B
   (l.21-23), dont la ligne N-02, qui nomme cette demande (PLAN l.557) ; PLAN l.854 : « aucune demande n'est envoyée par ce plan :
   l'orchestrateur trie et forme ». PAROXYSME ne touche pas au dépôt `shogen` : MONARK l'approuve et propose au fondateur de restreindre
   son accès à `paroxysme`, `monark-governance` et `Monark` (`da72328` l.46-47). Ce registre écrit donc MONARK pour cette demande et pour
   l'envoi des demandes au mainteneur (les douze, §0 ; L-11). **Tranché** : MONARK porte SHOGEN-G5-FORM-REQUEST-1 et envoie les
   demandes au mainteneur (MSG l.72).
8. **Écart entre l'inventaire et le plan.** Offutt (PXP-26) et Just (PXP-27) sont « reçus, NON LUS » pour INV-S (l.106, l.199) et
   « lus » pour PLAN l.869, dont le critère est la citation par la campagne Narabi : SYNTHESE-NARABI-1 l.419-420 les cite pour la
   définition de « killed », non pour A(coupling-effect). L-30 garde l'état de l'inventaire.
9. **Ancres qui ont bougé à la tête.** Même texte, autre numéro : ETAT l.1080-1083 → l.1574-1577 ; `scripts/verify-harness.mjs`
   l.381-385 → l.392-396 ; `test/verify-harness-liq.test.ts` l.124 → l.131 (INV-S l.61). Texte changé : ETAT l.49 (« Dernier oracle
   complet : 1 779 tests », INV-S l.63) → l.72-73 (2 831 tests, dont 2 792 verts, 0 rouge, 39 ignorés) ; aucune entrée n'en dépend.
   Des 61 références reportées, les 55 autres sont dans des fichiers inchangés depuis `d8fe354c` (`unchanged-file`) et 2 gardent leur
   numéro (ETAT l.7-11 ; ADR-CM l.186-191). Les 61, à `d8fe354c`, par fichier :
   `README.md` l.33, 95, 104, 173-180, 179-180, 204-205, 205, 245-251, 251, 274 ; `apps/harness/src/attestation-binding.ts` l.4, 14, 34-39, 62-65 ;
   `apps/harness/src/shogen-fixture.ts` l.23-31 ; `apps/harness/src/tools/attest.ts` l.6-7, 9-12, 33-35 ; `apps/harness/src/tools/gate.ts` l.234, 258, 261,
   949-953, 1003-1004 ; `apps/site/components/docs/piece-doc-page.tsx` l.144-147 ; `apps/site/components/shogen-panel.tsx` l.50-52, 60-62, 66-68, 71-72,
   75-77, 95-97 ; `apps/site/data/harness-served.json` l.120, 121 ; `apps/site/lib/docs-pieces.ts` l.46, 53 ; `apps/site/lib/fleet.ts` l.133, 140-141 ;
   `apps/site/lib/shogen-copy.ts` l.8-10, 9-10 ; `docs/ETAT.md` l.7-11, 1080-1083, 49 ; `docs/G0-lot-cm-2b-surfaces.md` l.63, 66 ;
   `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` l.186-191 ; `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md` l.161 ;
   `docs/adr/ADR-M017-attested-price-dans-gate.md` l.110, 117 ; `docs/measure-M009a.md` l.5-7 ; `fixtures/PROVENANCE-s3-binance.md` l.82-84 ;
   `fixtures/s3-binance.verdict.txt` l.16 ; `packages/monark/src/adapter-shogen.ts` l.41, 48, 154-165, 236, 238, 245 ; `packages/monark/src/cbor-canonique.ts`
   l.24-28 ; `packages/monark/test/adapter-shogen.test.ts` l.128-129 ; `scripts/verify-harness.mjs` l.381-385 ; `test/site-docs.test.ts` l.609-610 ;
   `test/verify-harness-liq.test.ts` l.124. Commande : `node reanchor.mjs --repo <clone> --base d8fe354c --head 87b821b0`, suivie de ces
   61 `<fichier>:<ligne>`. Rejouée par le pli de la G2 (2026-10-07, entre 18:46 et 18:58 UTC, Node 24.21.0) avec la version `a55a62d`
   de l'outil, qui refuse une ligne hors du fichier : 55 `unchanged-file`, 5 `same`, 1 `CHANGED`, aucune hors bornes.
10. **Contrôle mécanique.** `verify-registres.mjs` (pièce de la boîte PAROXYSME, commit `d97d838` : entrées prises entières, doutes
   épinglés) contrôle les identifiants, les champs, la longueur des lignes et l'absence d'adresse ; il sort 0 sur la branche avec ce
   registre ; il est provisoire jusqu'à `scripts/paroxysme/registry.mjs` (PXC-01 partie 1).
11. **Dette de déclencheur et déclencheurs proposés à MONARK.** SHOGEN-G4-NOTAIRE-RECHERCHE-1 (L-41 ; volet G4 de L-03) : « maintenant
   (sans code) » (ANB l.25) est atteint au plus tard à `d383a51` (2026-10-03, INV-S l.7), sans acte prouvé (INV-S l.176) ; l'état au
   dépôt Shōgen n'est pas revérifiable ici. La G2 comptait L-41 et ce volet comme dette de déclencheur. **Tranché** : son état est
   relevé auprès du mainteneur dans la demande de PXC-01 partie 2 (F3 ; ETAT l.256 à `5437cd0d`) ; la dette sort du §1. Lignes d'attente datées (P-25)
   des entrées dont une partie tombe en F5 (PXC-08 partie 3, PLAN l.617-618) : L-02, L-03, L-05, N-01, écrites par MONARK à ETAT
   l.270-273 à `5437cd0d` (Shōgen : l.273).
12. **Item de porteur MONARK sans chantier MONARK (N-10).** SHOGEN-KRAIDLE-GATHER-1 a pour porteurs MONARK et Kraidle (ANB l.26, INV-S
   l.126) ; CC ne marque N-10 que `SHOGEN` (l.706) et la compte parmi les lignes dont la seule couverture est SHOGEN (l.1147, l.1150).
   Ce registre garde le porteur de sa source (`d4b3d07` l.48 ; §0). Son déclencheur, le G0 de S4, n'est pas atteint. **Tranché** : la
   recartographie de PXC-01 partie 2 place N-10, avec un déclencheur (MSG l.74) ; la transcription de l'item à ETAT, ou son refus écrit,
   passe par N-05.
13. **Identité du « mainteneur Shōgen ».** 47 entrées le nommaient porteur avant ce pli (48 avant le pli de la G2, N-10 ayant pris le
   porteur de sa source), selon l'accusé `4bbf3ed` l.131-132. L'inventaire range la décision de forme G5 parmi les « Actes du fondateur
   ou de l'investisseur » (INV-S l.257-259) et la met en doute (l.276 : elle « est rangée en acte du fondateur ; à confirmer ») ; dans
   les règles de l'investisseur, « le mainteneur » est celui qui procure (CL l.17-18). **Tranché** : le mainteneur de Shōgen est le
   fondateur (MSG l.76) ; la décision de forme G5 est un acte du fondateur, que MONARK lui porte (ETAT l.274-275 à `5437cd0d`). Les
   porteurs restent tels quels (§0) ; L-02 et N-03 écrivent « la forme (G5) : le fondateur », et L-02 ne nomme plus le mainteneur :
   46 entrées ouvertes le nomment porteur après ce pli.
14. **Items des campagnes de l'étude du 2026-09-27 (écart de CC).** Les campagnes C4 à C8 (REG27 l.165-169) sont celles de l'étude
   PAROXYSME de MONARK (REG27 l.155-157 : sorties au dossier d'étude, lectures sur place par l'orchestrateur), hors du dépôt Shōgen ;
   l'annexe B ne reprend que C7 (ANB l.50). CC l.36-37 range un item de cette étude « à former » par PXC-01 partie 2, et l.656-657
   n'admet pour une ligne `SHOGEN` qu'un item de l'annexe B ou la demande par PXC-01 ; CC l.1148 y ajoute « C7/C8 après l'exécution
   unique S2 ». Selon la lecture de l.1148, gardée ici, ont pour seul item côté Shōgen un PX-Shogen-n de C7 ou C8 : L-12, L-18, L-19,
   L-21, L-22, L-24, L-25, L-26, et L-23 (avec le procurement d'ADR-0028 §4 pt 9). L-11 (PX-Shogen-9, C4) n'entre dans aucune des deux
   lectures : elle passe par la demande de PXC-01 partie 2. L-50 (PX-Shogen-7, C6 ; CC l.726 : `SHOGEN` seul) est dans le même cas et
   renvoie à L-09, que PXC-11 partie 4 couvre. **Décision de MONARK** : la lecture de CC pour C7 et C8 et le routage de L-50 sont
   proposés dans PXC-01 partie 2 ; MONARK tranche à sa G2 (MSG l.75).
15. **Actes du fondateur sans échéance.** Le passage public du dépôt Shōgen (N-06, N-07) et la publication de J14/J28 (N-08, qui porte
   G9, l'un des deux jalons de fin de l'exception) n'ont pas d'échéance : PLAN l.892 n'en donne qu'à Q-7 et au Dōjō, alors que PLAN l.882
   en exige une par ligne (CX-24 (c)). **Décision de MONARK** : il porte ces échéances au fondateur (ETAT l.274-276 à `5437cd0d`), la
   visibilité d'un dépôt étant hors de sa délégation (MSG l.77-78) ; elles restent sans date tant que le fondateur ne les a pas fixées.

## 8. Ligne PAROXYSME et sources

**Ligne PAROXYSME (2026-10-07, décisions de MONARK pliées, 20:1x UTC).** Shōgen : 74 limites ouvertes (35 du 2026-09-27, dont 3 changées
au sens de l'inventaire ; 15 nouvelles côté MONARK ; 24 nouvelles côté Shōgen) et 2 closes (L-36 ; N-11, par le versement, ETAT l.184 à
`5437cd0d`). ⚑B : aucune marquée par l'inventaire ; l'écart de branchement de la pièce est l'exception datée en cours (N-16 ; fin au
premier de G2 et de G9). Limites neuves à ETAT : 0 (§5). Aucune dette : le déclencheur de L-41 et du volet G4 de L-03 est re-formé (ETAT
l.256 à `5437cd0d`). Douze limites côté Shōgen n'ont pour item qu'une demande au mainteneur, à former par PXC-01 partie 2 (F3) et
envoyée par MONARK (MSG l.72) : aucune dette au sens de la convention CC §4.1, mais douze limites sans item de recherche tant que le
mainteneur n'en forme pas. Campagnes : C3 à C8 non lancées, C7 après l'exécution unique S2 (INV-S l.203-207). Procurement attendu :
Agresti, 3ᵉ éd., ISBN 978-0-470-46363-5 (L-23). Toutes les entrées ouvertes ont leur item, leur porteur et leur déclencheur. Restent
ouverts : à la G2 de PXC-01 partie 2, la lecture de CC pour C7 et C8 et le routage de L-50 (MSG l.75 ; §7, doute 14) ; au fondateur,
par MONARK, la décision de forme G5 et les échéances de N-06, N-07 et N-08 (ETAT l.274-276 à `5437cd0d` ; §7, doutes 13 et 15).

Fichiers du tronc lus à `87b821b0` (`git show 87b821b0:<f> | sha256sum`) ; fichiers de la boîte PAROXYSME lus à son commit `150c997`
(`sha256sum`). Pour le pli des décisions : ETAT lu aussi à `5437cd0d` (`git show 5437cd0d:docs/ETAT.md | sha256sum`), MSG à son
commit `d6331f6` (`git show d6331f6:<f> | sha256sum`).

| Source | Lignes | sha256 |
|---|---|---|
| `docs/ETAT.md` | 1 904 | `3190de5c23507292414418cbb8b24e0f7c9f319dca64a0f5ae8c5009475a5b5a` |
| `docs/ETAT.md` à `5437cd0d` (pli des décisions) | 2 089 | `64afc212a18bc683d892c7c7c6362abba46c1a4ed5db11061f4b25b63d07b0a9` |
| `README.md` | 353 | `6324c8b220ccb5378d5458ca883190b7241b0d3cdbc1e42d9f1697051e58b5ad` |
| `apps/harness/src/attestation-binding.ts` | 65 | `3e59882de94f3fd6e457b4637f69c4e10556e10d8eee008ef14926e383321eed` |
| `apps/harness/src/tools/gate.ts` | 1 070 | `7920ceaca2ce8231ecc2672b3a1ecd0e3a70c95971e80d225c107159558dadbd` |
| `apps/harness/src/tools/attest.ts` | 77 | `600d11a5c550e54778d9e8b7255e8b93da3b321460fec57c818d45c53dbad9e1` |
| `apps/harness/src/shogen-fixture.ts` | 31 | `6d1c42f5fe51754fc7f4d2c09e99de471143aa4cb3fd07aea8dfb82441667d4d` |
| `packages/monark/src/adapter-shogen.ts` | 268 | `c54060290c6418f2c35d15db7eb67e4289c270fd5a32a8a508c74e2f451ae2ed` |
| `packages/monark/src/cbor-canonique.ts` | 615 | `631a42f7ed073b73a6c82254f79bda351ec077600ab4dfca491ff180b84554d8` |
| `packages/monark/test/adapter-shogen.test.ts` | 167 | `df7cb5294833c9734c8ab552764c600dbc78b05eee81f54881f970f873022d62` |
| `apps/site/lib/shogen-copy.ts` | 10 | `794a62ad355f37d43f4aa2cce98adffc50643144d6a6d8369a60bed2dc08d241` |
| `apps/site/lib/docs-pieces.ts` | 244 | `7023e2c3cd4f6217b3180e14a61c68940f84e7d3e1fec1675a37b599dca3cf95` |
| `apps/site/components/shogen-panel.tsx` | 102 | `47c33c7a99b2ecb341fac62c69c1659e7d308fbb416377728f15c09afc477113` |
| `apps/site/components/docs/piece-doc-page.tsx` | 280 | `65fc7bc5c01a80469c593a20a524a6856fda8c4e41274a9d43d1ece785d63dd1` |
| `apps/site/lib/fleet.ts` | 429 | `998fdf33a3c461f687ec604524c63ee739ef1b7dd77acba571523aa979f232f4` |
| `apps/site/data/harness-served.json` | 150 | `f47ed82f98bdcdb0738cf466442d2b78e841c34b21b23d0038f626584ba75c47` |
| `fixtures/PROVENANCE-s3-binance.md` | 104 | `47fac4eaa505c85156a0a6e6618abd83504ec5814ad1aa5d706c2a8f71dcd55d` |
| `fixtures/s3-binance.verdict.txt` | 16 | `b2528be9c75b388f538a4a2aa81daa268a3da4ecf4b6c5d52e314b9a27d3663d` |
| `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` | 331 | `64aa3e11a87ac59ce633d5191952824d06010970c34b73c749e1c1caa2430c7b` |
| `docs/adr/ADR-M017-attested-price-dans-gate.md` | 162 | `c067405786aad8cf5d08fbc21e5cbf905ecf20502f11745abf3c30b0edebdfaf` |
| `docs/G0-lot-cm-2b-surfaces.md` | 75 | `b3d5b19ea901a681ccf09c85e232815b77a256265928aeccce89408403a1a4db` |
| `scripts/verify-harness.mjs` | 588 | `2cf68a6026d65b765002df0c05c4601bfe8896b8d6f06d36872aba047ae686cf` |
| `test/site-docs.test.ts` | 831 | `f41b47c6ec322e02b1da4ff1d70f091b4b4e19d06592039467f3968103162525` |
| `test/verify-harness-liq.test.ts` | 726 | `179ddbe359ec2281c5c44b855d26eb3940c0db43fd1e8e8721c5699de64752d7` |
| `docs/measure-M009a.md` | 191 | `08bbc8880d8740017134b18336252fc871e11df185fb3d237e4ef4be28c1d38a` |
| `scripts/measure-m009a.mjs` | 337 | `b73726916bc68e834672ca961d539f03a7682d96e4b2ac2fabfa04be3f1698c2` |
| `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md` | 427 | `157a560c08987d24e8c91090aedaa033fc644362f4f29858d55368a67a325a1a` |
| INV-S, `dossier/etude-2026-10-06/inventaire/INVENTAIRE-Shogen.md` | 291 | `c7cd6f49f362e8b9a4ffc63aacdc86fc078c2363b3216db9931c39c92d5ff533` |
| INV-M, même dossier, `INVENTAIRE-Moteur.md` | 350 | `d724157e6f458e9dbc9fbd807bd364a825060b476e95526a51520fdf6ebf99ed` |
| CC, `dossier/etude-2026-10-06/CHANTIERS-CANDIDATS.md` | 1 260 | `86ed73a23b0bfd8e2da5ea40de3818ae8a105a7d406c6bc0607fb8914c5dcc60` |
| PLAN, même dossier, `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` | 1 195 | `96b5b01858886906930f8be6e76094294dd71a9878a34b9b71804a160a645714` |
| CL, `pieces/2026-10-07-sources-cadrage/CLAUDE-global-investisseur.md` | 182 | `9f88a92bbcc1c56e8773ca01bbea3362c94b2bfacfa6112d582b05505ab56f0c` |
| FICHE, `dossier/etude-2026-09-27/PAROXYSME-Shogen.md` (caviardée) | 225 | `1a9345c7bce629f1e5a3896b72972f6dbd3c78be671d9c8bad64969ce62744f9` |
| REG27, même dossier, `PAROXYSME-REGISTRE-2026-09-27.md` (caviardé) | 207 | `a5e6f1944d3ccaf47cfd352f8c1c7972d81c9e597568e44534535f37a60a33d3` |
| `dossier/etude-2026-09-27/narabi-campagne-1/SYNTHESE-NARABI-1.md` | 647 | `ae865651fa9254e702ba3a53a5bcd3f9bf559e95b3e6df079ccacf6f6f1927d7` |
| `dossier/REDACTIONS.json` | 81 | `787173d1eee46adda38246bad5376d333d2fba5f2ae78b97716c14b883364b90` |
| `dossier/README.md` | 139 | `26ff658c30bbfa1caa1f4119303c393e26165d2a1ebb59880d2fb50a69791340` |
| `coordination/TABLEAU.md` | 54 | `1fac9ba1b7d36fe02db804d0279a7f83f2d507da4f97553695a3b503cf1ddd6e` |
| message `07d99e2`, `coordination/messages/`, `…-tache1-faits.md` | 23 | `ef1cded000da48460b4d5cf84793cd47a4e19f704a554887fba0ce491ed2672d` |
| message `d4b3d07`, même dossier, `…-tache1-prise.md` | 55 | `7ef81dbbde13efd554c6b270b7e794eeaa0226da18c013f6888fe1de6f332d93` |
| accusé `4bbf3ed`, même dossier, `…-accuse-de-lecture.md` | 165 | `14bd79df013cd37460f88becd27f78138a3b5a75d97bfabd869fba9729429dbb` |
| message `da72328`, même dossier, `…-reponses-accuse.md` | 47 | `71401dcd0f0230d8af79c90596b4f10a49ff2be91551b1e87885519bdd2b0448` |
| MSG, message `d6331f6`, même dossier, `…-tache1-fusionnee-decisions.md` | 90 | `03f305908703f119cc82c7b9f0a29684f720c0eab0997514c019fe068b64306a` |
| ordre de mission n° 1, même dossier, `…-ordre-de-mission-1.md` | 95 | `2e8cfd33c12de9d27b673c377e72a9a43da5dcb05c24e0094e744b7f3933c102` |
| `reanchor.mjs` à `a55a62d`, `coordination/pieces/2026-10-07-registres/` | 69 | `2edae6398e35a39d750cca2951cf4349380971066acb23bd1dbe965d9f88ca4b` |
| `verify-registres.mjs` à `d97d838`, même dossier | 127 | `6d71141222d2c32b995cd30e11335501e7021f4b2c7a38fb25053a61efe8712b` |
