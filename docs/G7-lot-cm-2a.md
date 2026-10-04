# G7 du lot CM-2a : codes d'erreur stables, validation de sortie, `produced_at` (S-6, S-15, S-10/P5(b), STALE-COMMENTS-1)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md`, amendement daté « plan de CM-2 » (go du fondateur « oui aux 1, 2 et 3 ») : B-3, B-4, B-6. Plan : `docs/G0-lot-cm-2a.md`.
- **Base** : base de fusion mesurée `c596afd3..f3b330cf` (#104 fusionnée, `6da4504d`, arbre de `c596afd3` ; `ff06ead` = `c596afd3` + l'amendement de l'ADR ; `c7c9c4e` = `f3b330cf` moins G0 et G7 : les chiffres ci-dessous valent pour le code). Corrigé le 2026-10-04 (contrôle par diff de MONARK, C-9).

## Oracle

- `node scripts/red-proof.mjs --base ff06ead --gel c7c9c4e --draw 8 --seed 7` : **OK**, 8 tests jugés F2P, 8 tueurs tirés, 8 tués.
- `npx tsc --noEmit`, eslint sur les fichiers changés, `gate:vocab`, `lint:ratchet` 69/69 : verts. Harnais 123/123. `npm test` : 1 951 tests, 1 seul échec toléré (`bell-served.test.ts:153`, clone superficiel).
- R-25 : 700 lignes comptées (15 fichiers, +627/−73), sous 1 150.

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

- Conforme sur le fond : comparaison base et gel octet pour octet en HTTP et MCP ; messages liq identiques ; premier contenu MCP identique à la sortie mesurée de la base ; succès identiques ; `openapi.ts` et la description inchangés ; aucune horloge sous `src/tools/` ; validation de sortie sans faux 500 (même schéma que la frontière MCP).
- Corrections pliées : (1) tueur mort-né d'E-2 remplacé ; (2) P-1 et P-2 couvrent BYO, USDe et liq, pas seulement btc-dir (retirée en CM-2b) ; (3) codes `byo_yhat_type`, `byo_calibration_invalid`, `yhat_type_mismatch`, `attest_refused` épinglés ; (4) phrase fausse du G0 corrigée ; (5) le scan K-8 interdit les lectures d'horloge sous `src/tools/` ; (6) seconde 60 acceptée seulement à 23:59 UTC, comme ajv au servi ; (7) fraction comptée en millisecondes : tolérance de 300 s exacte.

## Changements servis (liste fermée)

- **B-3** : corps d'erreur HTTP `{error:"tool_error", operation, message, code}` ; MCP : premier contenu identique, `_meta` gagne `monarkgate.tech/error_code`. Les 400 liq α et nMin portent déjà `policy_alpha_mismatch` et `policy_nmin_mismatch`, pour que leur code ne change pas en CM-2b.
- **B-4** : `produced_at` RFC 3339 strict dans `runGate` (400 `produced_at_invalid`) ; aux entrées HTTP et MCP, plus de 300 s dans le futur rend 400 `produced_at_future`. **Formes jusqu'ici acceptées au servi par ajv et désormais refusées** : tout séparateur autre que `T` ou `t` (l'espace et tout blanc `\s` de JavaScript : tabulation, LF, CR, VT, U+00A0, U+2028, U+3000, U+FEFF, U+200A…), tout décalage sans deux-points ou sans minutes (`±hhmm`, dont `-0000`, et `±hh`), et les heures ou minutes hors bornes que la branche de seconde intercalaire d'ajv laissait passer quand l'heure UTC calculée tombe à 23:59 (`2026-09-04T24:59:00+01:00`, `T24:59:30+01:00`, `T46:59:60+23:00`, `T23:99:60+00:40`, `T23:99:00+00:40`). Mesure de MONARK (`census.mjs`, contrôle par diff du 2026-10-03, C-2) : sur 60 000 chaînes tirées, 6 585 sont acceptées par l'ancienne frontière et refusées par la tête, aucune dans l'autre sens ; aucun appelant connu n'envoie ces formes. (Déclaration complétée le 2026-10-04, lot CM-2a-suite.) Seul l'outil `gate` est concerné (`cascade` et `ukemi-predict` hors périmètre).
- **B-6** : une sortie HTTP invalide rend 500 `{error:"internal_error", operation, code:"output_invalid"}`.

## Items

- OPENAPI-ERROR-CODE-1 : `openapi.json` ne documente ni `code` ni le 500 `output_invalid` ; lot ultérieur, sans changement servi ici.

## Sortie

APPROUVÉ pour fusion dans `base/chantier-moteur-2026-10-03` après le contrôle par diff de MONARK. Déploiement par MONARK, avec CM-2b, sous le go de l'investisseur.
