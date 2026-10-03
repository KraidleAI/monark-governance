# G0 du lot CM-1 : BYO-NEAR-NAME-1 (S-11)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` (ACCEPTÉ 2026-10-03), partie CM-1, ligne B-1 du §5 (et B-0, hérité de la base).
- **Base** : `404480e8` (`base/chantier-moteur-2026-10-03`). Auteur : RECHERCHES.
- **Point** : S-11 de l'audit P3. La garde anti-surcharge BYO (`apps/harness/src/tools/gate.ts:737-750`) compare des chaînes exactes : une classe ou une clé imitant une classe commise (casse, espace en tête ou en fin, adresse en casse de somme de contrôle) est acceptée en BYO et rend `commit` sous ce nom.

## Règle (B-1, telle qu'acceptée)

Sur le seul chemin BYO (`params.calibration` présent), avant tout calcul :
1. une `task_class` ou un `predictor_id` qui commence ou finit par un blanc (classe `\s` Unicode) rend un 400 nommé ;
2. la classe et la clé sont abaissées en minuscules **ASCII** (A à Z seulement) ; la garde refuse si :
   - la classe abaissée est une classe commise sur la CLASSE (`btc-dir-15m`, `cascade-liquidable-24h`, `liquidation-eligible-coverage`) ;
   - le couple (classe abaissée, clé abaissée) égale un couple commis abaissé (l'adresse `0x…` en casse de somme de contrôle tombe ici) ;
   - la classe abaissée suit le motif réservé des classes kata `^(btc|eth|bnb|sol)-(dir|range|mae-down|mae-up)-(1h|4h)$` ;
   - la clé abaissée commence par `kata:` ;
3. le message des cas déjà refusés par la garde exacte est inchangé octet pour octet ; les nouveaux cas portent un message qui nomme la règle. Une requête déjà refusée par un contrôle placé après la garde (par exemple une classe inconnue sans BYO n'est pas concernée, mais un BYO qui aurait échoué plus loin, sur `yhat` ou sur les candidats) peut changer de message : un 400 reste un 400 (contrôle par diff de MONARK, C-6).

Hors BYO, rien ne change : une classe inconnue rend déjà 400 (`gate.ts:797`).

## Tests (rouges à la base, `apps/harness/test/gate-byo-lookalike.test.ts`)

Cinq tests, tous F2P (rouges à la base par échec d'assertion, verts au gel), chacun avec un seul tueur en forme fermée `// killer: <fichier>:<ligne> <OP> "<avant>" -> "<après>"` (`scripts/red-proof.mjs`). Les cas qui épinglent l'absence de faux refus vivent dans le même test que les refus, puisque l'outil de la base refuse un test vert à la base.

- T-1 : les huit noms imitants de la sonde de MONARK ([S] §Priorité 1), plus `Stable-Run-Velocity-24h` avec la clé commise ; épinglés : deux noms honnêtes (dont un à espaces internes), une autre population sur `stable-run-velocity-24h`, et le message exact de la garde exacte ;
- T-1b : la classe liq dans une autre casse, pour toute clé ;
- T-2 : blancs en tête et en fin (espace, tabulation, U+00A0) sur la classe et sur la clé ;
- T-3 : motif kata réservé (casse quelconque) ; épinglés : `my-btc-dir-1h-clone`, `acme-btc-dir-1h`, `btc-dir-1h-v2`, `btc-dir-1d` décident ;
- T-3b : préfixe `kata:` (casse quelconque) ; épinglés : `caller:kata`, `kata-model`, `katax`, `caller:kata:x` décident.

Les tueurs des tests B-0 hérités (`gate-byo-tau-cap.test.ts`, `gate-empty-set.test.ts`) sont ré-ancrés : les deux lignes d'import ajoutées décalent leurs lignes de deux (C-3).

## Résidu déclaré

Les homoglyphes non ASCII (par exemple un « с » cyrillique dans `btс-dir-15m`) ne sont pas abaissés et passent, mais seulement en appel direct de `runGate` : au servi, le schéma gelé `prediction.schema.json:11,13` (`^[ -~]+$`, `minLength 1`), appliqué par `http.ts:91` et par la frontière MCP, les refuse déjà en 400 (mesuré par la G2). Il refuse aussi la tabulation et U+00A0 : au servi, seule l'espace ASCII en tête ou en fin atteint la garde, et les cas tabulation et U+00A0 de T-2 ne valent que pour l'appel direct. BYO-HOMOGLYPH-1 se réduit donc à l'appel direct de `runGate` (hors contrat) et ne demande aucun changement servi.

**Imitations en ASCII (contrôle par diff de MONARK, C-1).** B-1 ne compare que la casse et les blancs de bord. Des imitations entièrement ASCII passent donc la garde et rendent 200 `commit` sous le nom imité, au servi : `cascade-liquidabIe-24h` (I pour l), `cascade-liquidab1e-24h`, `liquidation-eIigible-coverage`, `btc-dir-l5m`, `btc-dir-15rn` (rn pour m), `btc_dir_15m`, `so1-dir-1h`, et les clés `k4ta:…` ou `kata :…` (cas E1 à E15 du rapport `recherches:coordination/pieces/2026-10-03-cm1-dem4/cm1-RAPPORT.md`). C'est conforme à B-1 et déclaré ici. Remède possible : une liste fermée de noms réservés comparés après une réduction des confusables ASCII (l, I, 1 ; rn, m ; 0, o ; `_`, `-` ; blancs internes), ou une réservation par préfixe des noms MONARK. Tout remède élargit les refus servis : il passe par un amendement daté du §5 de l'ADR-CM et le go du fondateur. Item **BYO-ASCII-LOOKALIKE-1** : propriétaire RECHERCHES ; déclencheur : plan de CM-2 (proposé au fondateur avec la liste B de CM-2) ; prix : environ 40 lignes de code et 80 de tests, une ligne B neuve au §5.

## Taille et sortie

Code : `gate.ts` +23/−3, `calibration.ts` +18 ; tests : environ 160 lignes ; une PR, R-25 sous 1 150. Oracle : `npm run typecheck`, `npm test` (le seul échec toléré est `bell-served.test.ts:153` dans un clone superficiel). Revue G2 par une instance neuve, puis G7 ; déploiement par MONARK sur le sha donné, après le go de l'investisseur.
