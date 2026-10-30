# G7 du premier lot de pli de Hikae, partie 1 : l'assertion de compte ôtée du Monte-Carlo de l'hypothèse nulle

- **Base** : `8824d25d`. **PR** : #352, branche `lot/hikae2-p1-pli-g2`, tête `3418cadc` : un commit (`7f0d3b03`, le pli, parti du
  tronc `c252e35c`) et une fusion du tronc (`3418cadc`, de `8824d25d`), qui ne change rien sous `packages/hikae/`. **Fusion au
  tronc** : `8d01bd3f`, tronc avant fusion `8824d25d`.
- **Plan** : la G2 de la partie 1 d'ADR-HIKAE-2, sa remarque nit-1, sous l'accord du fondateur pour la partie (2026-10-29, vers
  00:0x UTC) et sa directive du 2026-10-29 03:40 UTC. La session HIKAE a construit le lot ; MONARK le fusionne et rend ce G7.

## Ce que le lot livre

Un seul fichier de test change, `packages/hikae/test/suivi-mc.test.ts` (3 lignes ajoutées, 7 ôtées) : ni module, ni enregistrement
de tests.

- Dans les passes Monte-Carlo de l'hypothèse nulle, `nullRuns` vérifiait, pour u > 0, que le nombre d'étiquettes E+ égale le compte
  des fenêtres résolues et ratées plus celui des fenêtres non résolues. Le simulateur du test, `nullMc`, incrémentait les trois
  compteurs dans les mêmes branches : l'égalité tenait par construction et n'exerçait aucun code de la bibliothèque.
- La propriété est testée contre la bibliothèque par `raw_rate_parity_l2_monitor` (`packages/hikae/test/suivi-library.test.ts`
  l.205) : les étiquettes non résolues passent par `enterInOrder`, et les comptes de l'état d'O4 sont comparés, pas à pas, à un compte
  à la main des étiquettes non résolues ou ratées.
- L'assertion et les trois compteurs sont ôtés. Les deux tirages de chaque pas restent, dans le même ordre : la suite tirée et chaque
  résultat du fichier sont les mêmes.

## Écarts au plan

Aucun.

## Vérification

- Sur la branche, par la session HIKAE (corps de #352) :
  - le fichier seul, avant et après le changement : 8 tests, 8 réussis, et toute la sortie, ses 17 lignes de diagnostic comprises, la
    même aux durées près ; eslint sur le fichier, sortie 0 ;
  - `test:main` sur la branche fusionnée : 3411 tests, 3364 réussis, 0 échec, 47 sautés ; écrire les enregistrements de tests depuis
    ce passage ne change aucun octet, et le contrôle du compte de tests passe contre le tronc ;
  - l'oracle local G1 : vert, 14 gates sur 14 ; 10 lignes changées au compte de R-25 (borne 1205) ;
  - le diff reste dans la zone déclarée (lot-check, sortie 0) : un fichier.
- Relu par MONARK avant la fusion : le diff est celui que le corps décrit ; les lignes ôtées n'appellent pas le générateur, et les
  deux tirages de chaque pas (la résolution, puis le raté) restent à leur place ; le test que le corps cite pour la propriété est au
  tronc ; la fusion du tronc dans la branche ne change rien sous `packages/hikae/`.
- CI de #352 : 15 contrôles sur 15 verts à `3418cadc` (run 40988136745, et l'analyse CodeQL, run 40988133607), lue après la fin de
  la passe.
- Rejeu Windows à la fusion : le fichier de test que le lot touche (`packages/hikae/test/suivi-mc.test.ts`),
  `test/test-count-check.test.ts` et `test/ci-gates.test.ts` : 56 tests, 56 réussis, 0 échec, 0 sauté.
- Oracle G7 sur `8d01bd3f`, base `8824d25d` : vert, 14 gates sur 14 (enregistrement
  `8d01bd3ff55055fb9846f360c9b8833b7e9a52e1-G7-20261030T063334Z-40604.json`, sha256 `23634894…`) ; 3411 tests, 3364 réussis, 0 échec,
  47 sautés ; 10 lignes changées au compte de R-25 (borne 1205). Sa gate `npm run test:genkan` a joué les tests du noyau de Genkan
  sous la chaîne épinglée (`ELAN_HOME`) : 21 tests, 21 réussis, 0 sauté.

## Ce qui reste

- Le second lot de pli, #353 (`lot/hikae2-p1-arl`) : il écrit les deux enregistrements de tests, comme #354 ; celle des deux PR qui
  fusionne la seconde refait les siens sur le tronc avant sa fusion.
- Le G7 de la partie, qui plie le registre `docs/PAROXYSME-Hikae.md` et les corrections du checkpoint-2.
- Le lot LS (#345), dont la fusion attend le choix du fondateur.
- L'item HARNESS-VERIFY-TLS-FLAKE-1 reste ouvert à son déclencheur : aucun passage complet de ce lot n'a d'échec (le `test:main` et
  l'oracle G1 de la session HIKAE, l'oracle G7), donc pas de second échec.
