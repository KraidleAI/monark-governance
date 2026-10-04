# G7 du lot CM-2a-suite : corrections du contrôle par diff de MONARK sur CM-2a

- **Plan** : `docs/G0-lot-cm-2a-suite.md`. **Base** : `2abe801` (`origin/recherches/cm-2b`, tête de #106, non touchée). Branche `recherches/cm-2a-suite`. Commits : `7e37bb9` (G0, déclarations de CM-2a complétées, amendement de l'ADR-CM), `8447864` (tests), `cc371f3` (code, **gel**).

## Oracle

- `node scripts/red-proof.mjs --base 2abe801 --gel cc371f3 --repo /home/user/monark-governance-cm3 --draw 6 --seed 19` : **OK**, 1 test jugé F2P (rouge par assertion à la base), 1 tueur tiré (le seul du lot), tué. Vérifiés tués à la main en plus : les 14 sites de C-1 et le code d'`UkemiPredictToolError` (code permuté), L13, L20, R03 (mutants de MONARK).
- `npx tsc --noEmit`, eslint (fichiers changés), `gate:vocab`, `lint:ratchet` 69/69 : verts. Harnais 127/127 (126 → 127 ; avec `--test-force-exit` la sortie TAP est parfois tronquée, déjà noté au G0 de CM-2b).
- R-25 : 3 fichiers, +97/−2, soit **99 lignes comptées**.

## Changements

- **C-1** : 14 sites et le code par défaut d'`UkemiPredictToolError` épinglés ; phrase d'E-3 du G0 de CM-2a corrigée.
- **C-2** : formes de `produced_at` devenues 400 déclarées en entier au G0 et au G7 de CM-2a (mesure de MONARK : 6 585 sur 60 000).
- **C-3** : fraction `.5`, minutes du décalage, erreur non-outil côté MCP sans `_meta`, épinglés.
- **C-5** : amendement daté du 2026-10-04 de l'ADR-CM : OPENAPI-ERROR-CODE-1, environ 60 lignes, avec CM-3c et CM-4.
- **C-6** : commentaire `gate.ts:704` réécrit. **C-7** : motif K-8 étendu aux références. **C-9** : base du G7 de CM-2a écrite (`c596afd3..f3b330cf`).

## Autocontrôle

Aucune différence servie : seul un commentaire change dans `src/`. Aucun fichier de `schemas/**`, `packages/contracts/**`, `apps/site`, `apps/dojo`, `apps/bell`, `skills/**`, `fixtures/**` touché. Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs`, antérieur, n'est pas commis.

## Écart

Les épingles de C-1 et C-3 sont dans un test neuf, plié avec C-6, et non dans les corps d'E-3, P-1, P-2 et E-5 : un corps modifié et vert à la base serait refusé par `red-proof`.

## Sortie

Prêt pour la G2 et le contrôle par diff de MONARK, avant le déploiement de CM-2a et CM-2b.
