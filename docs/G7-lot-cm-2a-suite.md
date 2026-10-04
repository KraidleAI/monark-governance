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

## Pli du contrôle par diff de MONARK sur CM-2b (2026-10-04)

- Plan : section « Pli du contrôle par diff de MONARK sur CM-2b » du G0. Commits : `90d4a7c` (tests), `7439b0e` (code, **gel**), puis ce commit de documents.
- `node scripts/red-proof.mjs --base 2abe801 --gel 7439b0e --repo /home/user/monark-governance-cm3 --draw 6 --seed 29` : **OK**, 3 tests jugés F2P (`every_refusal_site_…`, `served_description_says_no_served_class_takes_attested`, `hdesc_served_gate_description_is_the_committed_clause`), 3 tueurs tirés, 3 tués. Contre la base de la PR sur GitHub (`98e3779`, même commande, `--base 98e3779`) : **OK**, 20 jugés F2P (les 18 de CM-2b, le neuf et celui de CM-2a-suite), 6 tueurs tirés, 6 tués.
- `npx tsc --noEmit`, eslint (fichiers changés), `gate:vocab`, `lint:ratchet` 69/69 : verts. Harnais 128/128.
- Tests liés hors du harnais (`harness-served`, `verify-harness-liq`, `site-build-fleet`, `site-docs`, `narabi-live`, `public-surfaces-honesty`, `harness-export`, `h5-e2e-probe`, `site-ukemi`) : les neuf mêmes rouges avant et après le pli (surfaces de MONARK, corrigées par #111), aucun autre.
- R-25 contre `2abe801` : +155/−16, **171 lignes comptées** (borne 547). Contre `98e3779` (CM-2b compris) : 867, sous 1 205.
- Empreinte servie de la description : **`4279a54dd880f7f789d452770ff908a0340c479bb94dbd1152296a6023553f38`** (était `cb4029d2…`) ; `openapi.json` : `d605b912…` (était `fc746a60…`). À reporter au CA de déploiement et aux données servies au temps (ii).
- Couplage avec #111 : voir le G0 ; la trace h5 de #111 se réenregistre une fois #110 dans sa base.
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` n'est pas commis.
