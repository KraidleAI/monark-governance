# G7 du lot DEP-RELEASE-AGE-RULE-1 : la règle des 7 jours pour une version neuve de dépendance

- **Base** : `a43b0126`. **PR** : #208, branche `monark/dep-release-age-rule-1`, tête `75dff4d6`. **Fusion au tronc** : `05478bd6`
  (tronc avant fusion `6792411d`).
- **Décision** : option (a) de la cellule, 2026-10-06 (proposition de MONARK, vote de RECHERCHES `e9de455`, Q-3). **G0** :
  `docs/G0-lot-dep-release-age-rule-1.md`. **Runtime** : Node 24.21.0 (win32), npm 11.19.0.
- **Construction** : worker `claude-opus-5-5` (effort max) du workflow de MONARK ; diff relu par MONARK avant le commit. Le script du
  workflow ne donnait pas de vérificateur dédié à ce lot (`verify: false`) ; le message de demande de G2 a d abord dit le contraire, puis
  a été corrigé (erratum `37150fa`).

## G2 (RECHERCHES)

- **APPROUVE** (`c8bd946`) : portée transitive ; mesure par `time.<version>` et l heure de lecture ; 168 h ; dérogation de sécurité
  nommée, qui tombe sans les citations de la G2. La case 11 de `CHECKLIST-G7.md` rend la règle opposable au G7.
- **Q-1** : une ligne de renvoi dans la checklist G2 du corpus commun est utile. C est un acte du fondateur (fichier sur C:, corpus commun
  à tous les projets) : demandé au fondateur avec le texte prêt à coller (G0, Q-1) ; non bloquant.
- **Item (a)** : RECHERCHES demande de vérifier que la version de npm connaît `min-release-age` (une clé inconnue serait ignorée sans
  erreur). npm 11.19.0 de l hôte de travail la définit (`@npmcli/config/lib/definitions/definitions.js` l.1471) et la lit
  (`npm config get min-release-age`, mesuré au G0) ; la version de npm du runner de la CI reste à mesurer au G0 de l item.

## Mesures

- **Documentation seule** : `docs/methode/REGLES-MISSION.md` (ligne datée et cinq sous-points, ajoutés en fin), `docs/methode/CHECKLIST-G7.md`
  (case 11), le G0. Aucun code, aucun test.
- **Rejeu Windows** de `test/mission-gen.test.ts` sur la fusion (les octets de `REGLES-MISSION.md` entrent dans chaque mission générée) :
  29 tests, 29 verts.
- **Oracles** : G1 sur `75dff4d6`, sortie 0 (record `4be9888b…`) ; G7 sur la fusion `05478bd6` : sortie 0 (record `85a1e2b1…`).
- **CI** : 10/10 sur `75dff4d6`.

## `error_origin`

- **Orchestrateur (MONARK)** : le message de demande de G2 disait les deux petits lots relus par un vérificateur neuf ; faux, corrigé par
  erratum le jour même. Aucun effet sur le lot.

## Items formés (ETAT)

- DEP-RELEASE-AGE-NPMRC-1 (a), DEP-RELEASE-AGE-CI-1 (b), DEP-RELEASE-AGE-SOURCE-1 (c), tels que le G0 les décrit ; accord de RECHERCHES.
- DEP-RELEASE-AGE-RULE-1 : clos.
