# G7 du lot 2a de Hikae, partie 1 : la politique d'une cellule, les étiquettes des évaluations de référence et l'état O4

- **Base** : `b0a7dd76`. **PR** : #348, branche `lot/hikae2-p1-l2a`, tête `d26d00eb` : deux commits (`b6c51818`, le module et ses
  deux tests ; `99fb6694`, les enregistrements de tests) et deux fusions du tronc (`f6447437`, de `16e8697b` ; `d26d00eb`, de
  `4efcf09a`), qui ne changent ni le module ni ses tests. **Fusion au tronc** : `db5bc942`, tronc avant fusion `4efcf09a`.
- **Plan** : partie 1 d'ADR-HIKAE-2, lot 2a (`suivi/` : politique, étiquettes, O4), sous l'accord du fondateur pour la partie
  (2026-10-29, vers 00:0x UTC) et sa directive du 2026-10-29 03:40 UTC. La session HIKAE a construit le lot ; MONARK le fusionne et
  rend ce G7. La relecture des lots de la partie est la G2 de la partie, à sa fin.

## Ce que le lot livre

Un module pur sous `packages/hikae/src/suivi/`, bâti sur la bibliothèque de paris de `packages/hikae/src/pari/` : ni horloge, ni
réseau, ni fichier, et aucun chemin servi. Il reste « upcoming » au registre public jusqu'à son branchement.

- `policy.ts` : la politique fermée d'une cellule, 22 clés. Ses rationnels (a, m, les deltas, les paris et leurs poids) sont des
  textes que `qString` écrit. `assertSuiviPolicy` refuse un objet qui n'est pas simple, une clé de trop ou manquante, un champ hors de
  sa forme, des paris que la bibliothèque refuse, et un trousseau mal formé (chaque `key_id` est le sha256 de sa clé, et `from_seq`
  croît strictement). `suiviPolicySha256` est le sha256 canonique d'une politique acceptée.
- `label.ts` : l'étiquette d'une évaluation de référence. Hors de la population, il n'y en a aucune ; dedans, E vaut le raté d'une
  fenêtre résolue, et 1 pour une fenêtre non résolue. `enterInOrder` entre les étiquettes dans l'ordre des évaluations et s'arrête à
  la première dont l'issue n'est pas arrivée.
- `o4.ts` : l'état O4 d'une cellule. Le test K compte toutes les étiquettes depuis le début et licencie la cellule une fois, à la
  première étiquette où K fois `delta_adm` atteint 1. Le test W compte les étiquettes du segment ouvert et le ferme à la première où
  W fois `delta_exh` atteint 1 ; `o4CloseOnAlarm` le ferme sur une alarme. Un segment fermé le reste pour la version de la politique.
  `budgetNano` vaut floor(10^9 (1 - delta_exh W)) dans un segment ouvert, et -1 ailleurs.
- Toute décision se prend en rationnels exacts, et tout refus lève une `RangeError`.
- Deux fichiers de test neufs, 17 tests, dont les attendus ne viennent jamais des modules :
  - `packages/hikae/test/suivi-o4.test.ts` (9 tests) : des valeurs écrites à la main, des formes closes calculées en BigInt dans le
    test, un programme dynamique exact sur (t, k), et un balayage de pureté des trois fichiers ;
  - `packages/hikae/test/suivi-mc.test.ts` (8 tests, environ 20 s) : des Monte-Carlo de K et W à graines fixes, comparés au
    programme dynamique exact. Parmi eux, un témoin négatif : une chaîne dépendante dont le taux stationnaire vaut exactement a
    franchit plus souvent que son delta, et le test l'affirme.
- Hors du paquet, seuls les deux enregistrements de tests changent.

## Écarts au plan

- Aucun sur les fichiers : le plan scinde le lot 2 en 2a et 2b au-dessus de 1 195 lignes, et 2a porte exactement ses cinq fichiers
  (`policy`, `label`, `o4`, `suivi-o4.test.ts`, `suivi-mc.test.ts`).
- La taille : le plan estimait le lot 2 entier à environ 1 150 lignes. Le commit du module ajoute 368 lignes de code et 790 de test,
  et le compte de R-25 en retient 1 158, sous sa borne de 1 205.

## Vérification

- Sur la branche, par la session HIKAE (corps de #348) :
  - `test:main` vert sur la tête : 3392 tests, 3345 réussis, 0 échec, 47 sautés ; les enregistrements de tests égaux à ce passage
    (339 fichiers) ;
  - red-proof contre `b0a7dd76` : les 17 tests y échouent au chargement du module neuf et passent ici ; les 6 tueurs tirés sont tués
    par une assertion ;
  - mutants : les 17 lignes tueuses font chacune échouer leur test par une assertion (`RESULTS.json` `4910ef92…`) ; la table tient
    241 autres mutants, dont 230 sont tués par une assertion et 11 survivent (`RESULTS.json` `fe87defd…`) ;
  - le diff reste dans la zone déclarée (lot-check, sortie 0).
- Relu par MONARK avant la fusion :
  - red-proof rejoué contre le tronc `4efcf09a` : 17 tests jugés, qui échouent tous à la base au chargement du module neuf et passent
    ici ; 6 tueurs tirés (graine 291731), tous tués (`RED-PROOF.json` `85155646…`) ;
  - lot-check sur un arbre propre à la tête, contre `4efcf09a` : 7 fichiers changés, tous dans la ligne de zone du lot 2, sortie 0 ;
  - à la tête, les trois fichiers du module sont ceux de la campagne de mutants, octet pour octet (sha256 `1e805b4e…`, `9d15eeac…`,
    `9e8966e1…`) ;
  - les 11 survivants, relus un à un dans `o4.ts`, `policy.ts` et `capitalOfCounts` :
    - O25, O58 et O70 ne changent aucun comportement ;
    - P37, P38, P75, O16 et O17 ne changent que le texte du refus. Le refus a toujours lieu, plus loin, et c'est toujours une
      `RangeError` ; aucun test ne fixe de message ;
    - O49, O77 et O81 ne se distinguent que sur des valeurs hors des types déclarés : un `closed_at` en texte, un champ `closed_by` sur
      un segment ouvert, une sorte de segment inconnue.
- Oracle G1 de la tête `d26d00eb`, base `4efcf09a` (session HIKAE) : vert, 14 gates sur 14 (enregistrement
  `d26d00eba7a4505e1411c1871475985b04c4eb39-G1-20261029T171342Z-43908.json`, sha256 `66792e2f…`).
- CI de #348 : 15 contrôles sur 15 verts à `d26d00eb` (run 40921328967, et l'analyse CodeQL, run 40921323245).
- Rejeu Windows à la fusion : les fichiers de test que le lot touche (`packages/hikae/test/suivi-o4.test.ts`,
  `packages/hikae/test/suivi-mc.test.ts`, `test/test-count-check.test.ts`), 21 tests, 21 réussis, 0 échec, 0 sauté.
- Oracle G7 sur `db5bc942`, base `4efcf09a` : vert, 14 gates sur 14 (enregistrement
  `db5bc942a1a276d5a6f2c6a61df5430f174102b3-G7-20261029T173728Z-46584.json`, sha256 `dc51c60e…`) ; 3392 tests, 3345 réussis, 0 échec,
  47 sautés ; 1158 lignes changées au compte de R-25 (borne 1205). Sa gate `npm run test:genkan` a joué les tests du noyau de Genkan
  sous la chaîne épinglée (`ELAN_HOME`) : 17 tests, 17 réussis, 0 sauté. Le test du harnais nommé ci-dessous y passe.

## Ce qui reste

- Le lot 2b (`detector.ts`, `m1.ts`, `tracker.ts` l.77-84, et leurs tests), né du lot 2a.
- La G2 de la partie, le checkpoint-2 et le G7 de la partie, qui plie le registre `docs/PAROXYSME-Hikae.md` avec l'item
  HIKAE2-CABLAGE-USDE-1. Ce pli porte la note de O49, O77 et O81 : un état lu d'un fichier doit être contrôlé dans sa forme
  JavaScript par la pièce qui le lit, avant `o4.ts`.
- Le test `verify_harness_out_is_written_only_when_every_check_passes` a échoué une fois dans un passage complet de `test:main`, hors
  de ce lot : l'item HARNESS-VERIFY-TLS-FLAKE-1, ouvert dans `docs/ETAT.md` par ce commit.
- Le lot LS (#345), dont la fusion attend le choix du fondateur.
