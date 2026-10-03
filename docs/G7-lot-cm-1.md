# G7 du lot CM-1 : BYO-NEAR-NAME-1 (S-11)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` (ACCEPTÉ 2026-10-03), §5 B-1 ; plan `docs/G0-lot-cm-1-byo-near-name.md`.
- **Base** : `404480e8` ; branche `recherches/cm-1-byo-near-name`.

## Oracle

- Preuve F2P mécanique : `node scripts/red-proof.mjs --base 404480e8 --gel . --draw 5 --seed 20261003` (outil sha256 `6579b550…`) : **OK**, 5 tests jugés, tous F2P, 5 tueurs tirés, 5 tués. Mutants supplémentaires de l'auteur, tous tués : ancre `^` retirée, ancre `$` retirée, `startsWith("kata:")` remplacé par `includes("kata")` puis par `startsWith("kata")`, `return undefined` remplacé par une chaîne, contrôle des blancs de la classe retiré.
- `npx tsc --noEmit` vert ; eslint vert sur les fichiers changés ; `gate:vocab` vert ; `lint:ratchet` 69/69.
- `npm test` (Node 24.21.0) : 1 seul échec, `bell-served.test.ts:153`, l'échec d'environnement du clone superficiel déjà présent à la base. Oracle du tronc MONARK sur la tête `866f1705` : 1 942 tests, 0 échec.
- R-25 : 170 lignes comptées (docs exclus) à `866f1705` ; **202** à la tête finale `8050fdd` (197 + 5), mesuré par MONARK.
- Rejeu de MONARK sur trois arbres (servi `af9b889`, base, tête ; 84 cas) : décisions et corps HTTP ne diffèrent qu'aux lignes B-0 et B-1 ; description, `tools/list`, `/openapi.json` et `/health` identiques (`recherches:coordination/pieces/2026-10-03-cm1-dem4/cm1-compare.md`).

## G2 (instance neuve de RECHERCHES) : APPROUVE-AVEC-CORRECTIONS, pliée

- Les huit noms imitants de la sonde sont refusés ; le message de la garde exacte est inchangé ; aucun contrôle hors du chemin BYO ; aucun faux refus trouvé ; aucun chemin vers une 500 au servi.
- M10 (liq retirée de `CLASS_LOCKED`) et M12 (ancre `^`) survivaient : tués par T-1b et par les épingles de T-3.

## Contrôle par diff de MONARK : APPROUVE AVEC CORRECTIONS, pliée

- C-1 : imitations en ASCII déclarées au G0 (§ « Résidu déclaré », paragraphe « Imitations en ASCII ») : `cascade-liquidabIe-24h`, `cascade-liquidab1e-24h`, `liquidation-eIigible-coverage`, `btc-dir-l5m`, `btc-dir-15rn`, `btc_dir_15m`, `so1-dir-1h`, clés `k4ta:…` et `kata :…` (cas E1 à E15 du rapport `recherches:coordination/pieces/2026-10-03-cm1-dem4/cm1-RAPPORT.md`, sha256 `d6ef7ec9cc2d5ea21039ab5b3e90d1cbcba7ff7752b0b79607d41f3b78a36b99`) ; item BYO-ASCII-LOOKALIKE-1 formé (prix à l'amendement daté de l'ADR).
- C-2 : tueurs réécrits en forme fermée ; `red-proof.mjs` OK (ci-dessus).
- C-3 : tueurs B-0 ré-ancrés (+2 lignes).
- C-6 : changement de message d'une requête déjà refusée, écrit à la règle 3 du G0.
- C-7 : excès de refus épinglés (`btc-dir-1h-v2`, `katax`, `kata-model`, `caller:kata:x`) ; appels honnêtes sous `try` et `assert.fail`.
- C-8 : chiffres corrigés (CM-1 : `gate.ts` +38/−0, `calibration.ts` +16/−0 ; huit noms) ; U+00A0 écrit `"\u00a0"`.
- C-5 : liste complète du déploiement, ci-dessous.

## Changements servis livrés et déploiement (C-5)

Mettre `/opt/monark-harness` au sha de fusion de cette PR emporte tout ce que l'arbre porte depuis `af9b889`, et non le seul CM-1 :
- B-1 (ce lot) et B-0 (chantier 2 : plafond de tau en BYO set, ensemble vide en `intent_not_in_region`) au harnais ;
- lots de MONARK déjà clos : NARABI-L-1 (sentinelle), RG-RECONCILE-1a à 1c (dont le grand livre v2), RPC-GUARD-FIRST, DRAND-RELAY-GET-1a.

Ordre retenu, celui que MONARK propose, chaque acte sous le go de l'investisseur : (1) relecture d'hôte en lecture seule par MONARK ; (2) NARABI-L-1 seule, depuis sa fusion `5c5f636` (seul change le champ non haché `sentinel_sha`) ; (3) l'arbre au sha de fusion de cette PR.

## Sortie

APPROUVÉ pour fusion dans `base/chantier-moteur-2026-10-03`, puis dans le tronc de MONARK. Déploiement par MONARK, dans l'ordre ci-dessus.
