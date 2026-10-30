# G7 de la partie 1 d'ADR-HIKAE-2 (Hikae), premier temps : la bibliothèque de paris et les statistiques du suivi, la G2 de la partie et son checkpoint-2, le pli du registre

- **Base de la partie** : `81e03af9`, le tronc avant la fusion du lot 1. **Tête de la partie au tronc** : `8d01bd3f` (fusion de #352),
  puis `a82393a1` (fusion de #353). Les commits de la partie au tronc, lus par `git log --first-parent 81e03af9..8d01bd3f` : les
  fusions `9cdfba24` (#344), `db5bc942` (#348), `8e21cd26` (#349) et `8d01bd3f` (#352), et les G7 des lots `16e8697b`, `296d3dbe` et
  `c252e35c` ; les autres commits de cette plage sont ceux de Genkan. Après `8d01bd3f`, `3332e7ab` est le G7 de #352 (lu par
  `git log --first-parent 8d01bd3f..928895ae`, où `928895ae` est la fusion de #354, de Genkan).
- **Plan** : le plan de la partie 1 d'ADR-HIKAE-2, version 6, accordé par le fondateur le 2026-10-29 vers 00:0x UTC (« Accord
  (Recommandé) » : partie 1 réduite à `pari/` et `suivi/`, D9 réordonné, câblage USDe reporté à HIKAE2-CABLAGE-USDE-1, garde du support
  calme construite dans la partie), sous sa directive du 2026-10-29 03:40:42 UTC. La session HIKAE a construit les lots et mené la G2 ;
  MONARK fusionne et rend ce G7.
- **Les lots de la partie** :
  - L1, `pari/` : #344, branche `lot/hikae2-p1-l1`, tête `aaf47079`, fusion `9cdfba24` ; G7 `docs/G7-lot-hikae2-p1-l1.md` ;
  - L2a, `suivi/` (politique, étiquettes, O4) : #348, branche `lot/hikae2-p1-l2a`, tête `d26d00eb`, fusion `db5bc942` ; G7
    `docs/G7-lot-hikae2-p1-l2a.md` ;
  - L2b, `suivi/` (détecteurs, M1, garde du pas du suiveur) : #349, branche `lot/hikae2-p1-l2b`, tête `ca8dda26`, fusion `8e21cd26` ;
    G7 `docs/G7-lot-hikae2-p1-l2b.md` ;
  - le premier lot de pli de la G2 : #352, branche `lot/hikae2-p1-pli-g2`, commit `7f0d3b03`, tête `3418cadc` (la fusion du tronc
    `8824d25d`), fusion `8d01bd3f` ; G7 `docs/G7-lot-hikae2-p1-pli-g2.md` ;
  - le second lot de pli de la G2 : #353, branche `lot/hikae2-p1-arl`, commits `c9117885` (le test) et `3f78fb04` (sa déclaration
    d'épingle), tête au checkpoint-2 `3f78fb04`, puis `1953750d` (la fusion du tronc `3a9e81fe`) quand ses enregistrements de tests
    sont refaits sur le tronc après #354 (`docs/G7-lot-hikae2-p1-pli-g2.md` l.50-51), fusion `a82393a1` ;
  - LS, la garde du support calme de la porte USDe : #345, branche `lot/hikae2-p1-ls`, tête `2c2c67bc`, base `b116393f`, non fusionnée :
    elle attend le choix du fondateur, et va au second temps de ce G7.

## Ce que la partie livre

Une bibliothèque pure sous `packages/hikae/src/pari/` et `packages/hikae/src/suivi/` : ni horloge, ni réseau, ni fichier, et aucun
chemin servi. Elle reste « upcoming » au registre public jusqu'à son branchement, qui est l'item HIKAE2-CABLAGE-USDE-1.

- `pari/` (L1) : rationnels exacts, facteurs de pari, mélanges et leur table de franchissement, la lecture de Shiryaev-Roberts et le
  détecteur à redémarrages pondérés en virgule fixe, le seuil entier (`docs/G7-lot-hikae2-p1-l1.md` l.15-24).
- `suivi/` (L2a et L2b) : la politique fermée d'une cellule, les étiquettes des évaluations de référence, l'état O4 (licence par K,
  fermeture par W, budget), le détecteur qui ferme et la lecture publiée qui n'agit jamais, un pas de M1 et sa borne ; dans le suiveur,
  `trackerStepSize` refuse un pas qui n'est pas positif (`docs/G7-lot-hikae2-p1-l2a.md` l.15-26, `docs/G7-lot-hikae2-p1-l2b.md`
  l.15-25).
- Le pli de la G2 :
  - #352 ôte de `packages/hikae/test/suivi-mc.test.ts` une assertion qui tenait par construction du simulateur du test ;
  - #353 ajoute `detector_sr_reading_arl_lower_bound` (`packages/hikae/test/suivi-detector.test.ts` l.270 à `a82393a1`), une épingle
    de la durée moyenne avant fausse alarme de la lecture, sans changer aucun module.
- Le registre `docs/PAROXYSME-Hikae.md`, plié par ce G7 :
  - L8 et L20 closes par leurs tests nommés, passées au §4.1 ; N17 reste « changé » ;
  - L4, L5, L10, L18 et N13 ouvertes, à l'état « bibliothèque fusionnée », avec leurs tests, et HIKAE2-CABLAGE-USDE-1 à côté de leurs
    items ;
  - L9 et L19 entières à HIKAE2-CABLAGE-USDE-1 ; L13 à HIKAE2-CABLAGE-USDE-1, avec la campagne D4 de PXC-17 pour second item ;
  - trois limites trouvées à la tête : HKT-08 et HKT-10 ouvertes au §5, HKT-09 close au nouveau §4.3 ; HIKAE2-INTENTION-1 dans
    l'entrée N4.
- Les quatre items de la partie, formés à `docs/ETAT.md` par ce G7, à la fin des points connus : HIKAE2-CABLAGE-USDE-1
  (l.2989-2998), porteur HIKAE ; HIKAE2-ARL-LECTURE-1 (l.2999-3007), clos à la fusion de #353 ;
  HIKAE2-ADMISSION-USDE-1 (l.3008-3017), prix replié ; HIKAE2-INTENTION-1 (l.3018-3024),
  inchangé, pour la partie 2.

## Écarts au plan

- **Le détecteur qui agit.** Le G0 portait une contradiction : sa borne de fausse alarme est celle de la lecture de Shiryaev-Roberts,
  quand l'alarme y ferme le segment, sous un « contrôle PFA ». Le plan la lève : le détecteur à redémarrages
  pondérés agit, avec α_arl = 1/100 à tout horizon ; la lecture de Shiryaev-Roberts est publiée sans action. L'accord du fondateur
  ratifie cette lecture ; la ligne datée sous ADR-HIKAE-2 qui l'écrit précède tout code. Le code la tient : `srReading` n'agit jamais
  sur l'alarme (`detector_sr_reading_never_acts`, `packages/hikae/test/suivi-detector.test.ts` l.292 à `8d01bd3f`, l.320 à `3f78fb04`).
- **D9 changé.** L'ordre devient : la partie 1 réduite (L1, L2, et le lot LS), puis les parties 1 et 2 d'ADR-HIKAE-1, puis TYCHO et
  Hyperliquid, puis le câblage USDe (HIKAE2-CABLAGE-USDE-1) ; la suite de D9 est inchangée. Décision du fondateur du 2026-10-28 ;
  l'activation et le réarmement vont au déclencheur de HIKAE2-CABLAGE-USDE-1.
- **Deux noms de tests.** Le checkpoint-2 et ce G7 lisent les noms du dépôt, non ceux du plan :
  - `detector_hk58_supermartingale` du plan est `detector_restart_supermartingale` (`packages/hikae/test/suivi-detector.test.ts`
    l.213 à `8d01bd3f`, l.228 à `3f78fb04`) ;
  - `detector_sr_reading_expectation_hk56` du plan est `detector_sr_reading_expectation` (l.245 à `8d01bd3f`, l.260 à `3f78fb04`).
- **Une assertion du Monte-Carlo.** Le plan voulait que le cas u = 0,03 asserte aussi « E⁺ entrées = ratés + non résolues ». Cette
  assertion tenait par construction du simulateur du test ; la propriété est éprouvée contre le code par `raw_rate_parity_l2_monitor`
  (`packages/hikae/test/suivi-library.test.ts` l.205) ; #352 l'ôte.
- **La durée moyenne avant fausse alarme de la lecture.** Démontrée et non testée à la fin de L2b, elle reçoit son item,
  HIKAE2-ARL-LECTURE-1, et son test au pli de la G2 (#353), sur l'avis d'advisor-defi ; elle n'entre pas au câblage.
- **L13 n'est pas entière au câblage.** Le plan envoyait L9, L13 et L19 « entières » à HIKAE2-CABLAGE-USDE-1 (le plan de la partie,
  l.404). Pour L13, le G0 garde à la limite son item d'avant : la campagne D4 de PXC-17, portée par PAROXYSME, « reste le sien » (G0
  l.315). L13 a donc deux items, le câblage, qui publie la part des silences par cellule, et la campagne D4 ; L9 et L19 restent entières.
- **N17 n'est pas close.** Le plan la fermait par le pli du registre (le plan de la partie, l.399-400). Sa limite a deux moitiés. La
  première est réglée : le registre est au dépôt depuis #242. La seconde ne l'est pas : les onze PX-Hikae n'ont toujours ni porteur ni
  déclencheur à ETAT, et leur re-formation reste à la partie 2 de PXC-01. N17 reste donc « changé ».

## Vérification

- **La G2 de la partie**, quatre tours, chacun par une instance neuve à contexte frais, aucune n'ayant construit un lot :
  - premier tour, un `worker` `claude-opus-5-5`, effort `high`, sur les lots LS, L1, L2a et L2b : CORRECTIONS (M 0, m 1, nit 5). Pli :
    une ligne datée du plan (le périmètre mesuré de LS, l'assertion du Monte-Carlo, les deux noms de tests, la clause « sans import
    de `apps/` »), un erratum daté du G0, la note pour ce G7, et le lot #352 ;
  - second tour, un `worker` `claude-opus-5-5`, effort `high`, sur ce pli : CORRECTIONS (M 0, m 2, nit 5). Pli : une ligne datée du
    plan (l'écart entre 793 et 899 lignes de LS, deux périmètres, R-25 tenu) et la note (une obligation de L2a à transmettre au câblage) ;
  - troisième tour, re-revue ciblée par un `lecteur` `claude-sonnet-5-5`, effort `high` : CORRECTIONS (m 1, nit 0). La durée moyenne
    avant fausse alarme de la lecture n'avait pas sa place avec L10. Pli : son item, sur l'avis d'advisor-defi, et le lot #353 ;
  - quatrième tour, re-revue ciblée par un `lecteur` `claude-sonnet-5-5`, effort `high` : ACCEPTE (M 0, m 0, nit 3) ; ses trois nits
    pliés par l'orchestrateur du chantier et vérifiés par son rejeu, comme le veut la règle d'arrêt de la G2.
- **Les oracles G2** : tronc `c252e35c`, base `81e03af9`, `--range` (enregistrement `c252e35c…-G2-20261029T200136Z-39716.json`,
  sha256 `b4e0d342…`) : sortie 0, 14 portes à 0, 8 pas verts ; LS `2c2c67bc`, base `b116393f` (`2c2c67bc…-G2-20261029T201348Z-25196.json`,
  sha256 `b4ee28f3…`) : sortie 0, 899 lignes au compte de R-25 (borne 1205).
- **Le checkpoint-2**, par un `validateur-humain` neuf (`claude-fable-5-1`, effort `high`), le 2026-10-30 de 03:4x à 04:5x UTC :
  ACCEPTE-AVEC-CORRECTIONS, quatre corrections de pièces, aucune de code. Ses quatre oracles cp-2 sortent 0, quatorze portes à 0 :
  - tronc, base `81e03af9`, `--range` : `c252e35c15ad21507d3bea33226615b62ef28c30-cp-2-20261030T035112Z-45384.json`, sha256 `b85766b5…` ;
  - LS : `2c2c67bc1dd14975f036e7048aca6529130ec558-cp-2-20261030T040459Z-46024.json`, sha256 `d13992e2…` ;
  - #352 : `3418cadcc6f698fd3a6888bca945f38a9c1d54f8-cp-2-20261030T042151Z-48088.json`, sha256 `ebe727f6…` ;
  - #353 : `3f78fb045edcf1464efc5cba79b6ef9bc4c9784a-cp-2-20261030T043401Z-32952.json`, sha256 `42e91811…`.

  Ses rejeux : 68 tests F2P ou de module neuf, 12 tueurs tirés, tués sur 12, et une épingle aux trois conditions.
- **Les quatre corrections du checkpoint-2, et leur pli** :
  1. RED-PROOF-TEST-ONLY-REGISTRIES-1, son porteur et son prix. La porte du mode `--test-only` de `scripts/red-proof.mjs` compte les
     deux registres de tests, quand ils changent, comme du code de production ; un lot qui ajoute une épingle les change toujours, et
     ne peut donc pas la passer. L'item, avec son porteur et son prix, est écrit dans `docs/ETAT.md` par MONARK au G7 de #354
     (l.2601-2612). Son porteur passe à MONARK dans ce pli, par une ligne datée à l'item : MONARK le
     règle avec RED-PROOF-PIN-1 et RED-PROOF-BLOCK-ALIGN-1 dans la partie de règlement des items en retard, avant le lot 2b-ii de
     Genkan.
  2. HARNESS-VERIFY-TLS-FLAKE-1, son prix : il est au tronc depuis le G7 de #351, `docs/ETAT.md` l.2921-2933 à `8824d25d`. Le
     checkpoint-2 avait lu l'item à `c252e35c`, où le prix manquait ; la correction est close par cette ligne.
  3. `docs/G7-lot-hikae2-p1-l1.md` l.49 : « contre la même base » se lit « contre `b116393f` ». Une ligne datée du G7 de L1 le dit,
     dans ce pli.
  4. `3f78fb04` : aucun tour de la G2 ne l'a lu, il suit le quatrième. Le checkpoint-2 l'a lu, et ce G7 le lit aussi
     (`git show --stat 3f78fb04`, puis `git show 3f78fb04 -- packages/hikae/test/suivi-detector.test.ts`). Un fichier, +2, −1 :
     l'en-tête de `packages/hikae/test/suivi-detector.test.ts`, dont la ligne de catégorie (l.16) devient les l.16-17. Le fichier
     reste un fichier de module neuf, rouge à la base au chargement de `detector.ts`. Le test de durée moyenne de (C), ajouté plus tard,
     y est déclaré épingle : vert à la base, la bibliothèque qu'il fait tourner étant inchangée par son lot, avec un seul tueur nommé.
     Rien d'autre ne change : aucun test, aucune ligne `killer:`, aucun module.
- **CI** : #352, 15 contrôles sur 15 verts à `3418cadc` (run 40988136745, et l'analyse CodeQL, run 40988133607 ;
  `docs/G7-lot-hikae2-p1-pli-g2.md` l.39-40) ; #353, 15 contrôles sur 15 verts à `1953750d` (run
  41025268484, et l'analyse CodeQL, run 41025263952 ; `docs/G7-lot-hikae2-p1-arl.md` l.51-52).
- **Oracles G7 au tronc** : chaque fusion de la partie a le sien, vert, 14 gates sur 14 : `9cdfba24`, `db5bc942` et `8e21cd26` (G7 de
  leurs lots), `8d01bd3f` (enregistrement `8d01bd3ff55055fb9846f360c9b8833b7e9a52e1-G7-20261030T063334Z-40604.json`, sha256
  `23634894…` : 3411 tests, 3364 réussis, 0 échec, 47 sautés ; `docs/G7-lot-hikae2-p1-pli-g2.md` l.43-46). Oracle G7 de la partie :
  `a82393a1`, la fusion de #353, la dernière de la partie (enregistrement
  `a82393a1858e9b5c87cad7eb62d9028043c672f0-G7-20261030T083319Z-42304.json`, sha256 `38bba876…` : 3418 tests, 3371 réussis, 0 échec,
  47 sautés ; `docs/G7-lot-hikae2-p1-arl.md` l.57-60).
- **Lint des pièces** : à `3a9e81fe`, `lint-piece.mjs` (outil MONARK) compte 24 erreurs d'empreinte dans les tableaux de sources du §8
  de `docs/PAROXYSME-Hikae.md` (l.622 à 698), que ce pli ne change pas. Elles sont fausses : chaque fichier y est cité à une révision
  nommée, et `git show` à cette révision redonne son sha256 et son nombre de lignes, 24 sur 24. LINT-EMPREINTE-FAUX-1 (ETAT
  l.2620-2631) les règle, avec les 4 fausses erreurs de `docs/ETAT.md`.

## Ce qui reste

- **Le second temps de ce G7** : I-18, la garde du support calme de la porte USDe. Elle se clôt par les tests nommés de LS,
  `gate_usde_support_guard_edges` et `gate_usde_out_of_support_served_path`, et sa ligne au registre va avec la fusion de LS (#345,
  non fusionnée, qui attend le choix du fondateur).
- **Les items ouverts de la partie**, à ETAT : HIKAE2-CABLAGE-USDE-1 (l.2989-2998), à son déclencheur ;
  HIKAE2-ADMISSION-USDE-1 (l.3008-3017), premier déclencheur atteint, prix replié ; HIKAE2-INTENTION-1
  (l.3018-3024), inchangé, pour la partie 2. La re-formation des onze PX-Hikae à ETAT (N17) reste à la partie 2 de
  PXC-01.
- HARNESS-VERIFY-TLS-FLAKE-1 reste ouvert à son déclencheur.
